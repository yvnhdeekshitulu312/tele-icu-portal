import { Component, OnInit, ElementRef, QueryList, ViewChildren, ViewChild, Output, Input, EventEmitter } from '@angular/core';
import { ConfigService } from 'src/app/ward/services/config.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';
import { InstructionsToNurseComponent } from 'src/app/portal/instructions-to-nurse/instructions-to-nurse.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from '../../shared/generic-modal-builder.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { Subject, takeUntil } from 'rxjs';
import { SpeechService, SpeechState } from 'src/app/shared/speech.service';
declare var $: any;

export const MY_FORMATS = {

  parse: {
    dateInput: 'dd-MMM-yyyy HH:mm:ss',
  },
  display: {
    dateInput: 'DD-MMM-yyyy',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'dd-MMM-yyyy',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-progress-note',
  templateUrl: './progress-note.component.html',
  styleUrls: ['./progress-note.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe,
  ],
})
export class ProgressNoteComponent implements OnInit {
  @Input()
  fromTeleICUBed: boolean = false;
  @Output()
  onClose: EventEmitter<any> = new EventEmitter()

  currentdate: any;
  patientDetails: any;
  doctorDetails: any;
  facility: any;
  notesTypes: any = [];
  progressNotesVitals: any[] = [];
  progressNotesDiagnosis: any;
  progressNotesVitalsNN: any;
  viewProgressNotesData: any[] = [];
  viewProgressNotesData1: any = []
  viewProgressNotesData2: any = [];
  hospId: any;
  btnSaveEnable: boolean = true;
  btnSaveEnableLoad: boolean = false;
  errorMessages: any = [];
  filteredViewProgressNotesData: any[] = [];
  monitorId: any;
  NoteEmployeeId: any;
  progressNotesForm: FormGroup;
  viewProgressNotesForm: FormGroup;
  selectedOption: string = '0';
  IsHeadNurse: any;
  IsHome = true;
  IsEditAddEndum: boolean = false;
  IsEditNotAddEndum: boolean = true;
  IsEditNotRestriction: boolean = true;
  patinfo: any;
  NurseAlliged: boolean = false;
  IsDoctor: any;
  notesTypesdisable = false;
  tableVitalsList: any;
  trustedUrl: any;
  data: any;
  isPopup: boolean = false;
  alltableVitalsList: any = [];
  alltableVitalsListFiltered: any = [];

  constructor(private fb: FormBuilder, private config: ConfigService, private us: UtilityService, private router: Router, public datepipe: DatePipe, private modalService: GenericModalBuilder, private speechService: SpeechService) {
    this.progressNotesForm = this.fb.group({
      NoteID: ['0'],
      Note: [''],
      DomainID: ['0'],
      ProblemList: [''],
      Subjective: [''],
      Objective: [''],
      Assessment: [''],
      Plan: [''],
      InterventionsNotes: [''],
      NurseAlligedhealthCareNotes: [''],
      ObservationBy: [''],
      CurrentDate: [''],
      AddEndnum: ['']
    });
    this.viewProgressNotesForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });

    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
  }

  ngOnInit(): void {
    this.speechService.resetState();
    setTimeout(() => {
      this.speechService.state$
        .pipe(takeUntil(this.destroy$))
        .subscribe(state => {
          this.speechState = state;

          if (state.transcript && !state.isProcessing) {
            this.appendTranscriptToFocusedTextarea(state.transcript);
          }
        });
    }, 0);
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY, H:mm',);
    this.hospId = sessionStorage.getItem("hospitalId");
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    if (this.data) {
      this.isPopup = this.data.isPopup;
    }
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
    if (this.fromTeleICUBed) {
      this.patientDetails = JSON.parse(sessionStorage.getItem("icubeddetails") || '{}');
      this.hospId = this.patientDetails.HospitalID;
      this.facility = this.patientDetails.WardID;
    }
    var wm = new Date();
    var d = new Date();
    wm.setMonth(wm.getMonth() - 1);
    d.setDate(d.getDate() + 1);
    this.viewProgressNotesForm.patchValue({
      FromDate: wm,
      ToDate: d
    });
    this.progressNotesForm.patchValue({
      ObservationBy: this.doctorDetails[0].EmployeeName,
      CurrentDate: new Date()
    });
    this.fetchNotesTypes();
    this.fetchProgressNotesVitals();
    this.fetchProgressNotesDiagnosis();
    this.us.setAlertPatientId(this.patientDetails.PatientID);
    // this.fetchProgressNotesSaved();
  }

  onCloseClick() {
    this.onClose.emit()
  }

  fetchNotesTypes() {
    this.config.fetchUserNotes(this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.notesTypes = response.FetchUserNotesDataList;

        // if (this.notesTypes.length >0) {
        //   this.notesTypesdisable=true;
        // }
        this.progressNotesForm.patchValue({
          DomainID: this.notesTypes[0]?.Value
        });

        if (this.notesTypes[0]?.Value == "3")
          this.NurseAlliged = false;
        else
          this.NurseAlliged = true;
        //}
      } else {
      }
    },
      (err) => {

      })
  }
  onItemActionsChange(event: any) {
    const selectedValue = event.target.value;
    this.selectOptionN(selectedValue);
  }

  selectOptionN(option: string) {
    this.filteredViewProgressNotesData = [];
    var filteredData: any[] = [];
    this.selectedOption = option;
    if (option === "0") {
      filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData));
    } else if (option === "1") {
      filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "1")));
    } else if (option === "2") {
      filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "2")));
    } else if (option === "3") {
      filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "3")));
    } else if (option === "4") {
      filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "4")));
    } else if (option === "5") {
      filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "5")));
    } else if (option === "6") {
      filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "6")));
    } else if (option === "7") {
      filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "7")));
    } else if (option === "8") {
      filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "8")));
    } else if (option === "9") {
      filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "9")));
    }
    else if (option === "10") {
      filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "10")));
    }
    else {
      filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "0")));
    }
    const distinctThings = filteredData.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.NoteDate === thing.NoteDate) === i);
    this.filteredViewProgressNotesData = distinctThings;

  }

  onVoiceTextChange(text: any) {
    const currentValue = this.progressNotesForm.get('NurseAlligedhealthCareNotes')?.value;
    let delimiter = '';
    if (currentValue) {
      delimiter = '\n';
    }
    this.progressNotesForm.get('NurseAlligedhealthCareNotes')?.setValue(currentValue + delimiter + text);
  }

  fetchProgressNotesVitals() {
    // this.config.fetchProgressNoteVitals(this.patientDetails.IPID, this.patientDetails.PatientID, this.patientDetails.GenderID, this.doctorDetails[0].EmpId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response) => {
    //   if (response.Status === "Success") {
    //     this.progressNotesVitals = response.FetchProgressNoteVitalsDataList;
    //   } else {
    //   }
    // },
    //   (err) => {

    //   })

    this.progressNotesVitals.push({ "VitalSign": 'BP -Systolic', "VALUE": this.patientDetails.BPSystolic });
    this.progressNotesVitals.push({ "VitalSign": 'BP-Diastolic', "VALUE": this.patientDetails.BPDiastolic });
    this.progressNotesVitals.push({ "VitalSign": 'Temperature', "VALUE": this.patientDetails.Temperature });
    this.progressNotesVitals.push({ "VitalSign": 'Pulse', "VALUE": this.patientDetails.Pulse });
    this.progressNotesVitals.push({ "VitalSign": 'SPO2', "VALUE": this.patientDetails.SPO2 });
    this.progressNotesVitals.push({ "VitalSign": 'Respiration', "VALUE": this.patientDetails.Respiration });
    this.progressNotesVitals.push({ "VitalSign": 'Consciousness', "VALUE": this.patientDetails.Consciousness });
    this.progressNotesVitals.push({ "VitalSign": 'O2 Flow Rate', "VALUE": this.patientDetails.O2FlowRate });

    var BPSystolic = "BP -Systolic :" + this.patientDetails.BPSystolic;
    var BPDiastolic = "BP-Diastolic :" + this.patientDetails.BPDiastolic;
    var Temperature = "Temperature :" + this.patientDetails.Temperature;
    var Pulse = "Pulse :" + this.patientDetails.Pulse;
    var SPO2 = "SPO2 :" + this.patientDetails.SPO2;
    var Respiration = "Respiration :" + this.patientDetails.Respiration;
    var Consciousness = "Consciousness :" + this.patientDetails.Consciousness;
    var O2FlowRate = "O2 Flow Rate :" + this.patientDetails.O2FlowRate;

    this.progressNotesVitalsNN = BPSystolic + ";" + BPDiastolic + ";" + Temperature + Pulse + ";" + SPO2 + Respiration + ";" + Consciousness + ";" + O2FlowRate;
  }
  fetchProgressNotesDiagnosis() {
    this.config.fetchProgressNoteDiagnosis(this.patientDetails.IPID, this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.progressNotesDiagnosis = response.FetchProgressNoteDiagnosisDataaList;
        this.progressNotesForm.patchValue({
          Assessment: this.progressNotesDiagnosis[0].FinalDiagnosis + " " + this.progressNotesDiagnosis[0].ProvisionalDiagnosis
        });
      } else {
      }
    },
      (err) => {

      })
  }
  fetchProgressNotesSaved() {
    var FromDate = this.datepipe.transform(this.viewProgressNotesForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.viewProgressNotesForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    var UserID = this.doctorDetails[0].UserId;
    this.config.FetchMainProgressNoteHHNew(this.patientDetails.IPID, FromDate, ToDate, UserID, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.viewProgressNotesData = response.FetchMainProgressNoteHHNewDataList;
        this.viewProgressNotesData1 = response.FetchMainProgressNoteHHNewData1List;
        this.viewProgressNotesData2 = response.FetchMainProgressNoteHHNewData2List;
        this.filteredViewProgressNotesData = this.viewProgressNotesData;
        this.tableVitalsList = response.FetchMainProgressNoteHHNewDataList;
        const distinctThings = response.FetchMainProgressNoteHHNewDataList.filter(
          (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.NoteDate === thing.NoteDate) === i);
        this.filteredViewProgressNotesData = distinctThings;
        this.filteredViewProgressNotesData = this.filteredViewProgressNotesData.sort((a: any, b: any) => new Date(b.NoteDate).getTime() - new Date(a.NoteDate).getTime());
        this.selectOptionN(this.selectedOption);

      } else {
      }
    },
      (err) => {

      })
  }
  filterFunction(vitals: any, visitid: any) {
    return vitals.filter((buttom: any) => buttom.NoteDate == visitid);
  }

  filterNotes1(notes: any, noteId: any) {
    return this.viewProgressNotesData1.filter((x: any) => x.NoteID === noteId);
  }

  filterNotes2(notes: any, noteId: any) {
    return this.viewProgressNotesData2.filter((x: any) => x.NoteID === noteId);
  }

  changeNotesType(event: any) {
    this.progressNotesForm.patchValue({
      DomainID: event.target.value
    });
    if (event.target.value == "3")
      this.NurseAlliged = false;
    else
      this.NurseAlliged = true;
  }
  saveProgressNotes() {
    this.errorMessages = [];
    if (!this.NurseAlliged) {
      if (this.progressNotesForm.get('Subjective')?.value === "") {
        this.errorMessages.push('Please enter Chief Complaints / Subjective');
      }
      if (this.progressNotesForm.get('Objective')?.value === "") {
        this.errorMessages.push('Please enter On Examination');
      }
      if (this.progressNotesForm.get('Assessment')?.value === "") {
        this.errorMessages.push('Please enter Diagnosis');
      }
      const planValue = this.progressNotesForm.get('Plan')?.value.trim();
      if (!planValue) {
        this.errorMessages.push('Please enter Assessment & Plan');
      }
      if (planValue) {
        if (planValue.length < 10) {
          this.errorMessages.push('Please enter Assessment & Plan text more that 10 characters')
        }
        if (planValue.indexOf('....') === 0) {
          this.errorMessages.push('Please enter proper Assessment & Plan text')
        }
      }
    }

    if (this.errorMessages.length > 0) {
      $('#errorMessagesModal').modal('show');
      return;
    }

    let progressNotesPayload =
    {
      "NoteID": this.progressNotesForm.get('NoteID')?.value,
      "IPID": this.patientDetails.IPID,
      "EmployeeID": this.doctorDetails[0].EmpId,
      "BedID": this.patientDetails.BedID,
      "Note": "",
      "UserId": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospId,
      "PatientID": this.patientDetails.PatientID,
      "PatientType": this.patientDetails.PatientType,
      "DomainID": this.progressNotesForm.get('DomainID')?.value,
      "ProblemList": "",
      "Subjective": this.progressNotesForm.get('Subjective')?.value,
      "Objective": this.progressNotesForm.get('Objective')?.value,
      "Assessment": this.progressNotesForm.get('Assessment')?.value,
      "Plan": this.progressNotesForm.get('Plan')?.value,
      "MonitorID": 0,
      "Interventions": this.progressNotesForm.get('InterventionsNotes')?.value,
      "NurseAlliged": this.progressNotesForm.get('NurseAlligedhealthCareNotes')?.value,
      "Vitals": this.progressNotesVitalsNN
    }
    this.config.saveProgressNotes(progressNotesPayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#progressNotesSaveMsg").modal('show');
          this.clearProgressNotes();
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }

  ModifyProgressNotes() {
    let progressNotesPayload =
    {
      "NoteID": this.progressNotesForm.get('NoteID')?.value,
      "IPID": this.patientDetails.IPID,
      "EmployeeID": this.doctorDetails[0].EmpId,
      "BedID": this.patientDetails.BedID,
      "Note": "",
      "UserId": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospId,
      "PatientID": this.patientDetails.PatientID,
      "PatientType": this.patientDetails.PatientType,
      "DomainID": this.progressNotesForm.get('DomainID')?.value,
      "Subjective": this.progressNotesForm.get('Subjective')?.value,
      "Objective": this.progressNotesForm.get('Objective')?.value,
      "Assessment": this.progressNotesForm.get('Assessment')?.value,
      "Plan": this.progressNotesForm.get('Plan')?.value,
      "MonitorID": this.monitorId,//this.progressNotesForm.get('MonitorID')?.value,
      "Interventions": this.progressNotesForm.get('InterventionsNotes')?.value,
      "ProblemList": this.progressNotesForm.get('AddEndnum')?.value,
      "NurseAlliged": this.progressNotesForm.get('NurseAlligedhealthCareNotes')?.value,
      "Vitals": this.progressNotesVitalsNN
    }
    this.config.saveProgressNotes(progressNotesPayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#progressNotesSaveMsg").modal('show');
          this.clearProgressNotes();
        } else {

        }
      },
      (err) => {
        console.log(err)
      });

  }

  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }
  EditNurseNotes(notes: any) {

    this.progressNotesForm.patchValue({
      NoteID: notes.NoteID,
      Note: notes.Note,
      DomainID: notes.NoteTypeID,
      ProblemList: notes.ProblemList,
      Subjective: notes.Subjective,
      Objective: notes.Objective,
      Assessment: notes.Assessment,
      Plan: notes.NurseNotePlan,
      InterventionsNotes: notes.InterventionsNotes,
      AddEndnum: notes.ProblemList,
      NurseAlligedhealthCareNotes: notes.NurseAlligedhealthCareNotes,
      CurrentDate: new Date(notes.NoteDateonly)

    });
    this.monitorId = notes.MonitorID;
    this.NoteEmployeeId = notes.EmployeeID;
    this.btnSaveEnable = false;
    this.btnSaveEnableLoad = notes.IsModifyEnable;
    this.IsEditAddEndum = true;

    // const currentTime = new Date();
    // const timeDiff =  new Date(notes.NoteDate).getHours()-currentTime.getHours();
    // if(timeDiff > Number(this.doctorDetails[0].ProgressNoteEditHrs)) {
    //   this.IsEditNotAddEndum = false;
    //   this.IsEditNotRestriction=false;
    //   this.btnSaveEnableLoad=false;
    // }

    const startDate = new Date(notes.NoteDate);
    const now = new Date();
    const differenceMs: number = now.getTime() - startDate.getTime();
    const seconds: number = Math.floor((differenceMs / 1000) % 60);
    const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
    const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
    const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
    const totalHours = hours + (days * 24);

    if (totalHours > Number(this.doctorDetails[0].ProgressNoteEditHrs)) {
      this.IsEditNotAddEndum = false;
      this.IsEditNotRestriction = false;
      this.btnSaveEnableLoad = false;
    }
    else {
      this.IsEditNotRestriction = true;
      if (this.NoteEmployeeId != this.doctorDetails[0].EmpId) {
        this.btnSaveEnableLoad = false;
        this.IsEditNotAddEndum = false;
      }
      else
        this.IsEditNotAddEndum = true;
    }
    $("#viewNotemodal").modal('hide');
  }
  openViewNotesModal() {
    this.selectedOption = '0';
    this.fetchProgressNotesSaved();
    $("#viewNotemodal").modal('show');
  }
  createNewNote() {
    this.clearProgressNotes();
  }

  clearProgressNotes() {
    this.IsEditNotRestriction = true;
    this.btnSaveEnable = true;
    this.btnSaveEnableLoad = false;
    this.IsEditNotAddEndum = true;
    let Assessment = '';
    if (this.progressNotesDiagnosis && this.progressNotesDiagnosis[0]) {
      Assessment = this.progressNotesDiagnosis[0].FinalDiagnosis + " " + this.progressNotesDiagnosis[0].ProvisionalDiagnosis;
    }
    this.progressNotesForm.patchValue({
      NoteID: '0',
      Note: '',
      DomainID: this.notesTypes[0].Value,
      ProblemList: '',
      Subjective: '',
      Objective: '',
      Assessment,
      Plan: '',
      InterventionsNotes: '',
      AddEndnum: '',
      NurseAlligedhealthCareNotes: '',
      ObservationBy: this.doctorDetails[0].EmployeeName,
      CurrentDate: new Date()
    });
  }


  DeleteProgressNotes() {
    if (this.doctorDetails[0].EmpId == this.NoteEmployeeId) {
      let progressNotesPayload =
      {
        "NoteID": this.progressNotesForm.get('NoteID')?.value,
        "UserId": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        "HospitalID": this.hospId
      }
      this.config.DeleteProgressNote(progressNotesPayload).subscribe(
        (response) => {
          if (response.Code == 200) {
            $("#progressNotesdeleteMsg").modal('show');
            this.clearProgressNotes();
          } else {

          }
        },
        (err) => {
          console.log(err)
        });

    } else {
      $("#progressNotesErrorMsg").modal('show');
    }

  }
  openQuickActions() {
    this.patinfo = this.patientDetails;
    $("#quickaction_info").modal('show');
  }
  clearPatientInfo() {
    this.patinfo = "";
  }
  closeModal() {
    $("#quickaction_info").modal('hide');
  }

  openNurseInstructions() {
    const options: NgbModalOptions = {
      size: 'xxl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(InstructionsToNurseComponent, {
      data: "doctorinstructions",
      readonly: true
    }, options);
  }
  viewMoreChiefComplaints() {
    $("#viewMoreChiefComplaints").modal('show');
  }

  PrintProgressNote() {
    var FromDate = this.datepipe.transform(this.viewProgressNotesForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.viewProgressNotesForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    var UserID = this.doctorDetails[0].UserId;
    this.config.FetchMainProgressNoteHHNewPrint(this.patientDetails.IPID, FromDate, ToDate, this.doctorDetails[0].UserName, UserID, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.trustedUrl = response?.FTPPATH
        $("#reviewAndPayment").modal('show');
      } else {
      }
    },
      (err) => {

      })
  }

  viewAllVitals() {
    $("#viewAllVitalsmodal").modal('show');
    const fromdate = moment(this.patientDetails.AdmitDate).format("DD-MMM-yyyy");
    const todate = moment(new Date()).format("DD-MMM-yyyy");
    this.config.FetchPatientVitalsByPatientId_PFUHIDN(this.patientDetails.RegCode == undefined ? this.patientDetails.RegCode : this.patientDetails.RegCode, this.patientDetails.AdmissionID, fromdate, todate, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.alltableVitalsList = response.PatientVitalsDataList;//.slice(0, 100);
          const distinctThings = response.PatientVitalsDataList.filter(
            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.CreateDateNew === thing.CreateDateNew) === i);
          this.alltableVitalsListFiltered = distinctThings;
        }
      },
        (err) => { })
  }
  filterFunctionallVitals(vitals: any, visitid: any) {
    return vitals.filter((vital: any) => vital.CreateDateNew == visitid);
  }

  speechState: SpeechState = {
    isRecording: false,
    isProcessing: false,
    transcript: '',
    error: ''
  };

  private destroy$ = new Subject<void>();
  private currentFocusedTextarea: HTMLTextAreaElement | null = null;

  ngAfterViewInit() {
    this.setupTextareaListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupTextareaListeners(): void {
    const textareaIds = [
      'Subjective',
      'Objective',
      'Assessment',
      'Plan',
      'InterventionsNotes',
      'NurseAlligedhealthCareNotes',
      'AddEndnum'
    ];

    const container = document.querySelector('.main-container');
    container?.addEventListener('focusin', (event: any) => {
      const target = event.target as HTMLElement;
      if (target.id && textareaIds.includes(target.id)) {
        if (!(target as HTMLTextAreaElement).readOnly) {
          this.currentFocusedTextarea = target as HTMLTextAreaElement;
          this.speechService.setActiveTextarea(target as HTMLTextAreaElement);
        }
      }
    });
  }

  async toggleRecording(): Promise<void> {
    if (!this.currentFocusedTextarea) {
      alert('Please click on a text field first before recording');
      return;
    }

    if (this.speechState.isRecording) {
      // Stop recording and transcribe
      try {
        await this.speechService.recordAndTranscribe();
      } catch (error) {
        console.error('Recording error:', error);
        alert('Recording failed. Please try again.');
      }
    } else {
      // Start recording
      try {
        await this.speechService.startRecording();
      } catch (error) {
        console.error('Failed to start recording:', error);
        alert('Could not access microphone. Please check permissions.');
      }
    }
  }

  private appendTranscriptToFocusedTextarea(transcript: string): void {
    if (!this.currentFocusedTextarea) return;

    const text = this.progressNotesForm.get(this.currentFocusedTextarea.id)?.value;
    this.progressNotesForm.patchValue({
      [this.currentFocusedTextarea.id]: this.appendText(text, transcript)
    })

    // Reset transcript after appending
    this.speechService.resetState();
  }

  private appendText(currentText: string, newText: string): string {
    const trimmed = currentText?.trim() || '';
    return trimmed ? `${trimmed} ${newText}` : newText;
  }

  // Show visual feedback of focused field
  getRecordingLabel(): string {
    if (!this.currentFocusedTextarea) return 'Select a field first';

    const id = this.currentFocusedTextarea.id;
    switch (id) {
      case 'Subjective': return 'Recording: Chief Complaints / Subjective';
      case 'Objective': return 'Recording: On Examination';
      case 'Assessment': return 'Recording: Diagnosis';
      case 'Plan': return 'Recording: Assessment & Plan';
      case 'InterventionsNotes': return 'Recording: Physician Order / Intervention';
      case 'NurseAlligedhealthCareNotes': return 'Recording: Nurse / Allied health Care Notes';
      case 'AddEndnum': return 'Recording: Addendum';
      default:
        return 'Recording...';
    }
  }
}
