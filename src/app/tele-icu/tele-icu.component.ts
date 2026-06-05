import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AgoraService } from './Services/agora.service';
import { IncomingCallPayload, SignalRService } from './Services/signal-r.service';

@Component({
  selector:        'app-tele-icu',
  templateUrl:     './tele-icu.component.html',
  styleUrls:       ['./tele-icu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeleIcuComponent implements OnInit, OnDestroy {

  step: 'idle' | 'ringing' | 'in-call' = 'idle';
  payload: IncomingCallPayload | null   = null;

  micEnabled = true;
  camEnabled = true;

  private doctorName = 'Doctor';
  private doctorId   = 0;
  private subs       = new Subscription();

  constructor(
    public  agora:   AgoraService,
    private signalR: SignalRService,
    private cdr:     ChangeDetectorRef
  ) {
    const details    = JSON.parse(sessionStorage.getItem('doctorDetails') || '[]');
    this.doctorName  = details[0]?.EmployeeName ?? 'Doctor';
    this.doctorId    = details[0]?.EmpId ?? 0;
  }

  ngOnInit(): void {
    // Connect to SignalR hub and register this doctor's userId.
    // The backend ConnectionStore maps doctorId → connectionId so the
    // nurse's POST /api/call/start can find and ring this doctor.
    this.signalR.connect(this.doctorId);

    // Listen for incoming calls from the nurse
    this.subs.add(
      this.signalR.incomingCall$.subscribe(payload => {
        this.payload = payload;
        this.step    = 'ringing';
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.agora.leave();
  }

  // ── Doctor accepts ───────────────────────────────────────────────────────
  async accept(): Promise<void> {
    if (!this.payload) return;

    // ✅ Step 1: Switch to in-call FIRST so Angular renders the video divs
    this.step = 'in-call';
    this.cdr.markForCheck();

    // ✅ Step 2: Wait one animation frame for Angular + browser to paint
    // await new Promise(resolve => setTimeout(resolve, 0));

    const uid = Math.floor(Math.random() * 100_000);

    try {
      await this.agora.join(
        this.payload.channelName,
        uid,
        'local-player-doctor',  
        'remote-container-doctor',
        (_uid: number) => `Nurse ${_uid}`,
        'doctor'
      );

      await this.signalR.notifyDoctorJoined(
        this.payload.nurseConnectionId,
        this.doctorName
      );

    } catch (err) {
      console.error('Doctor failed to join call:', err);
      this.step = 'idle';
    }

    this.cdr.markForCheck();
  }

  // ── Doctor declines ──────────────────────────────────────────────────────
  async decline(): Promise<void> {
    if (this.payload) {
      await this.signalR.declineCall(this.payload.nurseConnectionId);
    }
    this.payload = null;
    this.step    = 'idle';
    this.cdr.markForCheck();
  }

  // ── End call ─────────────────────────────────────────────────────────────
  async endCall(): Promise<void> {
    await this.agora.leave();
    this.payload = null;
    this.step    = 'idle';
    this.cdr.markForCheck();
  }

  async toggleMic(): Promise<void> {
    this.micEnabled = await this.agora.toggleMic();
    this.cdr.markForCheck();
  }

  async toggleCam(): Promise<void> {
    this.camEnabled = await this.agora.toggleCamera();
    this.cdr.markForCheck();
  }
}