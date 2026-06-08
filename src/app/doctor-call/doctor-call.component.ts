import {
  Component, Input, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subscription } from 'rxjs';
import { UtilityService } from '../shared/utility.service';
import { config } from 'src/environments/environment';
import { FormControl } from '@angular/forms';
import { AgoraService } from '../tele-icu/Services/agora.service';
import { SignalRService } from '../tele-icu/Services/signal-r.service';
import { DoctorCallService } from './doctor-call.service';

export interface Patient {
  id: string; SSN: string; name: string; Age: number;
  Gender: string; Nationality?: string;
  ward: string; bed: string; diagnosis: string;
}

interface ApiDoctor {
  EmpID: number;
  EmpCodeName: string;
  SpecialityName?: string;
}

export interface OnlineDoctor {
  ID: number;
  Name: string;
  specialty?: string;
}

export interface DoctorCallData {
  patient: Patient;
  nurseId: number;
  nurseName: string;
}

type ModalStep = 'select' | 'calling' | 'in-call';

@Component({
  selector: 'app-doctor-call',
  templateUrl: './doctor-call.component.html',
  styleUrls: ['./doctor-call.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorCallComponent implements OnInit, OnDestroy {

  @Input() patient!: Patient;
  @Input() nurseId = 0;
  @Input() nurseName = 'Nurse';
  @Input() data?: DoctorCallData;
  selectedDoctorMap: Map<number, OnlineDoctor> = new Map();
  searchControl = new FormControl('');

  // ── Doctor list ──────────────────────────────────────────────────────────
  // onlineDoctors  → what the template iterates (*ngFor)
  // selectedDoctors → Set of doctorIds the nurse ticked
  onlineDoctors: OnlineDoctor[] = [];
  selectedDoctors: Set<number> = new Set();
  loadingDoctors = false;

  // ── Call state ───────────────────────────────────────────────────────────
  step: ModalStep = 'select';
  micEnabled = true;
  camEnabled = true;
  joinedDoctors: string[] = [];
  activeChannel: string | null = null;

  private readonly BASE = `${config.videoUrl}`;
  private subs = new Subscription();

  private doctorDetails: any;
  private facilitySessionId: any;
  private hospitalID: any;

  constructor(
    public agora: AgoraService,
    private signalR: SignalRService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private service: DoctorCallService,
    private us: UtilityService
  ) {
    this.doctorDetails = JSON.parse(sessionStorage.getItem('doctorDetails') || '[]');
    this.facilitySessionId = JSON.parse(sessionStorage.getItem('facility') || '{}');
    this.hospitalID = sessionStorage.getItem('hospitalId');
  }

  ngOnInit(): void {
    if (this.data) {
      this.patient = this.data.patient;
      this.nurseId = this.data.nurseId;
      this.nurseName = this.data.nurseName;
    }

    // Connect SignalR and register this nurse's userId in the backend store.
    // nurseId must be the integer userId your backend uses.
    this.signalR.connect(this.nurseId);

    this.loadOnlineDoctors();

    // When any doctor joins, add their name to the "joined" chips in the UI
    this.subs.add(
      this.signalR.doctorJoined$.subscribe(({ doctorName }) => {
        if (!this.joinedDoctors.includes(doctorName)) {
          this.joinedDoctors.push(doctorName);

          // Auto-advance from 'calling' to 'in-call' when the first doctor joins
          if (this.step === 'calling') {
            this.step = 'in-call';
          }

          this.cdr.markForCheck();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.agora.leave();
  }

  // ── Load doctor list from your hospital API ──────────────────────────────
  // FIX: was writing to this.doctorList — template never saw it.
  // Now maps the API response to OnlineDoctor[] and writes to this.onlineDoctors.
  loadOnlineDoctors(): void {
    this.loadingDoctors = true;
    this.cdr.markForCheck();

    const url = this.service.getData(doctorcall.fetchSpecializationDoctorTimings, {
      SpecializationID: 0,
      UserID: this.doctorDetails[0]?.UserId,
      WorkStationID: Object.keys(this.facilitySessionId).length > 0
        ? this.facilitySessionId
        : this.service.param.WorkStationID,
      HospitalID: this.hospitalID,
    });

    this.us.get(url).subscribe({
      next: (response: any) => {
        if (response.GetAllDoctorsList.length > 0) {
          // Map API field names (PascalCase) to the OnlineDoctor interface
          // this.onlineDoctors = (response.GetAllDoctorsList as ApiDoctor[] ?? [])
          //   .map(d => ({
          //     doctorId:   d.EmpID,
          //     doctorName: d.EmpCodeName,
          //     specialty:  d.SpecialityName ?? undefined,
          //   }));
        }
        this.loadingDoctors = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingDoctors = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Selection helpers ────────────────────────────────────────────────────
  toggleDoctor(doc: OnlineDoctor): void {
    if (this.selectedDoctors.has(doc.ID)) {
      this.selectedDoctors.delete(doc.ID);
      this.selectedDoctorMap.delete(doc.ID);
    } else {
      this.selectedDoctors.add(doc.ID);
      this.selectedDoctorMap.set(doc.ID, doc);
    }

    // Clear input and results after selection
    this.searchControl.setValue('', { emitEvent: false });
    this.onlineDoctors = [];
    this.cdr.markForCheck();
  }

  removeDoctor(doctorId: number): void {
    this.selectedDoctors.delete(doctorId);
    this.selectedDoctorMap.delete(doctorId);
    this.cdr.markForCheck();
  }

  get selectedDoctorsList(): OnlineDoctor[] {
    return Array.from(this.selectedDoctorMap.values());
  }

  isSelected(doctorId: number): boolean {
    return this.selectedDoctors.has(doctorId);
  }

  selectAll(): void {
    this.onlineDoctors.forEach(d => this.selectedDoctors.add(d.ID));
    this.cdr.markForCheck();
  }

  clearAll(): void {
    this.selectedDoctors.clear();
    this.cdr.markForCheck();
  }

  get selectedCount(): number { return this.selectedDoctors.size; }

  async startCall(): Promise<void> {
    if (this.selectedDoctors.size === 0 || this.step !== 'select') return;

    this.step = 'calling';
    this.cdr.markForCheck();

    try {
      const res = await firstValueFrom(
        this.http.post<{ channelName: string; doctorsNotified: number }>(
          `${this.BASE}/api/call/start`,
          {
            patientSsn: this.patient.SSN,
            nurseName: this.nurseName,
            nurseConnectionId: this.signalR.connectionId,
            doctorIds: Array.from(this.selectedDoctors)
          }
        )
      );

      this.activeChannel = res.channelName;

      // ✅ Switch to in-call FIRST so DOM elements render
      this.step = 'in-call';
      this.cdr.markForCheck();

      // ✅ Wait for Angular to render the DOM before Agora attaches video
      // await new Promise(resolve => setTimeout(resolve, 300));

      const uid = Math.floor(Math.random() * 100_000);
      await this.agora.join(
        res.channelName,
        uid,
        `local-player-${this.patient.SSN}`,
        `remote-container-${this.patient.SSN}`,
        (_uid: number) => `Doctor ${_uid}`,
        'nurse'
      );

      // ✅ Step 4: Explicitly play local video after join
      const localTrack = this.agora.localVideoTrack;
      if (localTrack) {
        localTrack.play(`local-player-${this.patient.SSN}`);
      }

      this.cdr.markForCheck();

    } catch (err) {
      console.error('startCall failed:', err);
      this.step = 'select';
      this.cdr.markForCheck();
    }
  }

  // ── End call ─────────────────────────────────────────────────────────────
  async endCall(): Promise<void> {
    await this.agora.leave();
    this.activeChannel = null;
    this.step = 'select';
    this.joinedDoctors = [];
    this.selectedDoctors.clear();
    this.cdr.markForCheck();
  }

  // ── Mic / Camera toggles ─────────────────────────────────────────────────
  async toggleMic(): Promise<void> {
    this.micEnabled = await this.agora.toggleMic();
    this.cdr.markForCheck();
  }

  async toggleCam(): Promise<void> {
    this.camEnabled = await this.agora.toggleCamera();
    this.cdr.markForCheck();
  }

  searchEmployee(event: any) {
    if (event.target.value.length > 2) {
      const url = this.service.getData(doctorcall.FetchSSEmployees, {
        name: event.target.value,
        UserId: this.doctorDetails[0].UserId,
        WorkStationID: 3395,
        HospitalID: this.hospitalID
      });
      this.us.get(url).subscribe({
        next: (response: any) => {
          if (response.Code == 200) {
            this.onlineDoctors = (response.FetchSSEmployeesDataList ?? []).map((e: any) => ({
              ID: e.ID ?? e.EmpID ?? e.UserId,
              Name: e.Name ?? e.EmpCodeName ?? e.EmpName,
              specialty: e.SpecialityName ?? undefined,
            }));
            this.cdr.markForCheck();
          }
        },
        error: () => { }
      });
    } else {
      this.onlineDoctors = [];
      this.cdr.markForCheck();
    }
  }

  // get selectedDoctorsList(): OnlineDoctor[] {
  //   // Keep a separate map so names survive after the dropdown list clears
  //   return Array.from(this.selectedDoctors).map(id => this.selectedDoctorMap.get(id)!).filter(Boolean);
  // }
}

export const doctorcall = {
  fetchSpecializationDoctorTimings:
    'FetchSpecializationDoctorTimings?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchSSEmployees: "FetchSSEmployees?name=${name}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
};