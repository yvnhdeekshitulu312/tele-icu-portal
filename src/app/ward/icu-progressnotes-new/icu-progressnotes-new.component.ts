import { Component, OnInit, ElementRef, QueryList, ViewChildren, ViewChild, Input, EventEmitter, Output } from '@angular/core';
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
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { IcuProgressnotesService } from '../icu-progressnotes/icu-progressnotes.service';
import { icuDetails } from '../icu-progressnotes/urls';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';

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
  selector: 'app-icu-progressnotes-new',
  templateUrl: './icu-progressnotes-new.component.html',
  styleUrls: ['./icu-progressnotes-new.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe,
  ]
})
export class IcuProgressnotesNewComponent extends BaseComponent implements OnInit {
  @Input()
  fromTeleICUBed: boolean = false;
  @Output()
  onClose: EventEmitter<any> = new EventEmitter()

  IsHome = true;
  IsHeadNurse: any;
  currentdate: any;
  patientDetails: any;
  facility: any;
  IsDoctor: any;
  progressNotes!: FormGroup;
  formEvent!: FormGroup;
  ICUProgressNoteID = 0;
  FetchPatientICUProgressNoteWorkListDData: any = [];
  FetchPatientICUProgressNoteWorkListDData1: any = [];
  viewDraft: boolean = true;
  FetchPatientDataEFormsDataList: any = [];
  url = '';
  FetchPatientICUProgressNotesDData: any = [];
  list: any = [];
  patinfo: any;
  isClear: any = true;
  errorMessage: any;
  showPreValidation: any = false;
  MedicalCondition: any;
  FetchPatientAdmissionLabTestResultsDataList: any = [];
  selectedFetchPatientAdmissionLabTestResultsDataList: any = [];
  hideSave: boolean = false;
  ventilatorStatus: boolean = false;
  Vasopressors: any;
  Sedation: any;
  GlycemicControl: any;
  IsolationStatus: any;
  showPrescriptionModal: boolean = false;
  Assessment: any;

  @ViewChild('divVasopressors') divVasopressors!: ElementRef;
  @ViewChild('divSedation') divSedation!: ElementRef;
  @ViewChild('divGlycemicControl') divGlycemicControl!: ElementRef;
  @ViewChild('divIsolationStatus') divIsolationStatus!: ElementRef;
  @ViewChild('divMedicalCondition') divMedicalCondition!: ElementRef;
  @ViewChild('divAssessment') divAssessment!: ElementRef;
  MedicalHistory: any;
  ReasonForAdm: any;


  constructor(private fb: FormBuilder, private config: ConfigService, private router: Router, public datepipe: DatePipe
    , private modalService: GenericModalBuilder, private us: UtilityService, private service: IcuProgressnotesService, private modalSvc: NgbModal) {
    super();

    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
  }

  search(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(icuDetails.FetchEmpSignatures, { Filter: event.target.value, WorkStationID: this.wardID, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.list = response.FetchEmpSignaturesDataList;
          }
        },
          (err) => {
          })
    }
  }

  onSelected(item: any) {
    this.list = [];

    this.progressNotes.patchValue({
      EndorsemenTo: item.EmpNo + ' - ' + item.FullName,
    });
  }
  setCurrentTime(): string {
    const now = new Date();
    const hours = this.padZero(now.getHours());
    const minutes = this.padZero(now.getMinutes());
    return `${hours}:${minutes}`;
  }
  padZero(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  intialize() {
    this.ICUProgressNoteID = 0;
    this.hideSave = false;
    this.progressNotes = this.fb.group({
      DateOfAdmissionToHospital: new Date(this.selectedView.AdmitDate),
      DateOfAdmissionToICU: new Date(),
      ReasonForAdmissionToHospital: this.selectedView.AdmissionRequestRemarks,
      ReasonForAdmissionToICU: '',
      //PastMedicalSurgicalHistory: '',
      slot1: this.setCurrentTime(),
      slot2: this.setCurrentTime(),
      EndorsemenFrom: this.doctorDetails[0]?.UserName + ' - ' + this.doctorDetails[0]?.EmployeeName,
      EndorsemenTo: '',

      VitalSignsTemp: this.selectedView.Temperature,
      VitalSignsTmax: '',
      VitalSignsHR: '',
      VitalSignsBP: this.selectedView.BP,
      VitalSignsRR: this.selectedView.Respiratory,
      VitalSignsVasopressorsInotropes: false,
      VitalSignsNameDose: '',
      VitalHighO2requirement: false,

      CentralNervousSystem: '',
      CardiovascularSystem: '',
      RespiratorySystem: '',
      GastrointestinalSystem: '',
      GenitourinarySystem: '',
      InfectiousDiseaseSkin: '',
      MusculoskeletalSystem: '',
      SystemOthers: '',

      DVT_Cleanex: false,
      DVT_SCheparin: false,
      DVT_FullAnticoagulation: false,
      DVT_DVTPump: false,
      DVT_Others: false,
      DVT_OthersValue: '',
      DVT_NoneReason: false,
      DVT_NoneReasonValue: '',

      GI_PPIOnce: false,
      GI_PPITwice: false,
      GI_NoneReason: false,
      GI_NoneReasonValue: '',

      Feeding_Tube: false,
      Feeding_TubeValue: '',
      Feeding_Oral: false,
      Feeding_OralValue: '',
      Feeding_NPOReason: false,
      Feeding_NPOReasonValue: '',

      Bowel_Regular: false,
      Bowel_Constipation: false,
      Bowel_Diarrhea: false,
      Bowel_Action: false,
      Bowel_ActionValue: '',

      Maintenance_IVFluids_Yes: false,
      Maintenance_IVFluids_No: false,
      Maintenance_IVFluids_Type: '',
      Maintenance_IVFluids_Rate: '',
      Maintenance_IVFluids_Reason: '',

      Bed_Sores_No: false,
      Bed_Sores_Yes: false,
      Bed_Sores_YesValue: '',
      Bed_Sores_MaximumStage: '',
      Bed_Sores_Turningappliedevery: false,
      Bed_Sores_Turningappliedeveryvalue: '',
      Bed_Sores_NoTurningReason: false,
      Bed_Sores_NoTurningReasonValue: '',

      CentralLines_RightIJ: false,
      CentralLines_RightIJ_Central: false,
      CentralLines_RightIJ_QuintonLine: false,
      CentralLines_RightIJ_Day: false,
      CentralLines_RightIJ_DayValue: '',
      CentralLines_RightIJ_Clean: false,
      CentralLines_RightIJ_Infected: false,

      CentralLines_LeftIJ: false,
      CentralLines_LeftIJ_Central: false,
      CentralLines_LeftIJ_QuintonLine: false,
      CentralLines_LeftIJ_Day: false,
      CentralLines_LeftIJ_DayValue: '',
      CentralLines_LeftIJ_Clean: false,
      CentralLines_LeftIJ_Infected: false,

      CentralLines_RightSubclavian: false,
      CentralLines_RightSubclavian_Central: false,
      CentralLines_RightSubclavian_QuintonLine: false,
      CentralLines_RightSubclavian_Day: false,
      CentralLines_RightSubclavian_DayValue: '',
      CentralLines_RightSubclavian_Clean: false,
      CentralLines_RightSubclavian_Infected: false,

      CentralLines_Others: false,
      CentralLines_OthersValue: '',
      CentralLines_Comments: false,
      CentralLines_CommentsValue: '',

      FoleyCatheter_PresentReason: false,
      FoleyCatheter_PresentReasonValue: '',
      FoleyCatheter_VoidingFreely: false,
      FoleyCatheter_Condom: false,
      FoleyCatheter_Diaper: false,

      Physiotherapy_BodyPhysiotherapyApplied: false,
      Physiotherapy_NotAppliedReason: false,
      Physiotherapy_NotAppliedReasonValue: '',

      RelevantLabResults1: '',
      RelevantLabResults2: '',
      RelevantLabResults3: '',
      RelevantLabResults4: '',
      RelevantLabResults5: '',
      RelevantLabResults6: '',

      Assessment: '',
      VentilatorStatus: '',
      VentilatorStatusDate: '',
      Vasopressors: '',
      Sedation: '',
      GlycemicControl: '',
      IsolationStatus: '',


      issuerows: this.fb.array([
        this.fb.group({
          plan: '',
          issue: '',
          measurable: ''
        })
      ])
    });

    this.formEvent = this.fb.group({
      rows: this.fb.array([
        this.fb.group({
          date: new Date(),
          type: 'Major Event',
          details: '',
          action: ''
        }),
        this.fb.group({
          date: new Date(),
          type: 'Major Procedure',
          details: '',
          action: ''
        }),
        this.fb.group({
          date: new Date(),
          type: 'Important Investigation',
          details: '',
          action: ''
        }),
        this.fb.group({
          date: new Date(),
          type: 'Positive Culture',
          details: '',
          action: ''
        })
      ])
    });
  }

  get rows() {
    return this.formEvent.get('rows') as FormArray;
  }

  get issuerows() {
    return this.progressNotes.get('issuerows') as FormArray;
  }

  ngOnInit(): void {
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY, H:mm');
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
    if (this.fromTeleICUBed) {
      this.selectedView = JSON.parse(sessionStorage.getItem("icubeddetails") || '{}');
      this.admissionID = this.selectedView.AdmissionID;
      this.wardID = this.selectedView.WardID;
      this.hospitalID = this.selectedView.HospitalID;
    }
    this.FetchPatientICUProgressNoteWorkList();
    this.fetchPatientDataEforms();
    this.intialize();
  }

  onCloseClick() {
    this.onClose.emit()
  }

  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }
  saveDraftProgressNotes() {
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.save(1);
      }
      modalRef.close();
    });
  }


  saveProgressNotes() {
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.save(2);
      }
      modalRef.close();
    });
  }

  save(DraftType: any) {
    const progressNotesData = {
      slot1: this.progressNotes.get('slot1')?.value || false,
      slot2: this.progressNotes.get('slot2')?.value || false
    };

    const vitals = {
      VitalSignsTemp: this.progressNotes.get('VitalSignsTemp')?.value,
      VitalSignsTmax: this.progressNotes.get('VitalSignsTmax')?.value,
      VitalSignsHR: this.progressNotes.get('VitalSignsHR')?.value,
      VitalSignsBP: this.progressNotes.get('VitalSignsBP')?.value,
      VitalSignsRR: this.progressNotes.get('VitalSignsRR')?.value,
      VitalSignsVasopressorsInotropes: this.progressNotes.get('VitalSignsVasopressorsInotropes')?.value || false,
      VitalSignsNameDose: this.progressNotes.get('VitalSignsNameDose')?.value,
      VitalHighO2requirement: this.progressNotes.get('VitalHighO2requirement')?.value || false
    };

    const dvt = {
      DVT_Cleanex: this.progressNotes.get('DVT_Cleanex')?.value || false,
      DVT_SCheparin: this.progressNotes.get('DVT_SCheparin')?.value || false,
      DVT_FullAnticoagulation: this.progressNotes.get('DVT_FullAnticoagulation')?.value || false,
      DVT_DVTPump: this.progressNotes.get('DVT_DVTPump')?.value || false,
      DVT_Others: this.progressNotes.get('DVT_Others')?.value || false,
      DVT_OthersValue: this.progressNotes.get('DVT_OthersValue')?.value || '',
      DVT_NoneReason: this.progressNotes.get('DVT_NoneReason')?.value || false,
      DVT_NoneReasonValue: this.progressNotes.get('DVT_NoneReasonValue')?.value || ''
    };

    const rowsArray = this.formEvent.get('rows') as FormArray;

    const serializedRows = rowsArray.controls.map(row => {
      return {
        date: row.get('date')?.value,
        type: row.get('type')?.value,
        details: row.get('details')?.value,
        action: row.get('action')?.value
      };
    });

    const gi = {
      GI_PPIOnce: this.progressNotes.get('GI_PPIOnce')?.value || false,
      GI_PPITwice: this.progressNotes.get('GI_PPITwice')?.value || false,
      GI_NoneReason: this.progressNotes.get('GI_NoneReason')?.value || false,
      GI_NoneReasonValue: this.progressNotes.get('GI_NoneReasonValue')?.value || ''
    };

    const Feeding = {
      Feeding_Tube: this.progressNotes.get('Feeding_Tube')?.value || false,
      Feeding_TubeValue: this.progressNotes.get('Feeding_TubeValue')?.value || '',
      Feeding_Oral: this.progressNotes.get('Feeding_Oral')?.value || false,
      Feeding_OralValue: this.progressNotes.get('Feeding_OralValue')?.value || '',
      Feeding_NPOReason: this.progressNotes.get('Feeding_NPOReason')?.value || false,
      Feeding_NPOReasonValue: this.progressNotes.get('Feeding_NPOReasonValue')?.value || ''
    };

    const bowel = {
      Bowel_Regular: this.progressNotes.get('Bowel_Regular')?.value || false,
      Bowel_Constipation: this.progressNotes.get('Bowel_Constipation')?.value || false,
      Bowel_Diarrhea: this.progressNotes.get('Bowel_Diarrhea')?.value || false,
      Bowel_Action: this.progressNotes.get('Bowel_Action')?.value || ''
    };

    const main: any = {
      Maintenance_IVFluids_Yes: this.progressNotes.get('Maintenance_IVFluids_Yes')?.value,
      Maintenance_IVFluids_Type: this.progressNotes.get('Maintenance_IVFluids_Type')?.value,
      Maintenance_IVFluids_Rate: this.progressNotes.get('Maintenance_IVFluids_Rate')?.value,
      Maintenance_IVFluids_Reason: this.progressNotes.get('Maintenance_IVFluids_Reason')?.value,
      Maintenance_IVFluids_No: this.progressNotes.get('Maintenance_IVFluids_No')?.value
    };

    const bed = {
      Bed_Sores_No: this.progressNotes.get('Bed_Sores_No')?.value,
      Bed_Sores_Yes: this.progressNotes.get('Bed_Sores_Yes')?.value,
      Bed_Sores_YesValue: this.progressNotes.get('Bed_Sores_YesValue')?.value,
      Bed_Sores_MaximumStage: this.progressNotes.get('Bed_Sores_MaximumStage')?.value,
      Bed_Sores_Turningappliedevery: this.progressNotes.get('Bed_Sores_Turningappliedevery')?.value,
      Bed_Sores_Turningappliedeveryvalue: this.progressNotes.get('Bed_Sores_Turningappliedeveryvalue')?.value,
      Bed_Sores_NoTurningReason: this.progressNotes.get('Bed_Sores_NoTurningReason')?.value,
      Bed_Sores_NoTurningReasonValue: this.progressNotes.get('Bed_Sores_NoTurningReasonValue')?.value
    };

    let cl = {
      CentralLines_RightIJ: this.progressNotes.get('CentralLines_RightIJ')?.value,
      CentralLines_RightIJ_Central: this.progressNotes.get('CentralLines_RightIJ_Central')?.value,
      CentralLines_RightIJ_QuintonLine: this.progressNotes.get('CentralLines_RightIJ_QuintonLine')?.value,
      CentralLines_RightIJ_Day: this.progressNotes.get('CentralLines_RightIJ_Day')?.value,
      CentralLines_RightIJ_DayValue: this.progressNotes.get('CentralLines_RightIJ_DayValue')?.value,
      CentralLines_RightIJ_Clean: this.progressNotes.get('CentralLines_RightIJ_Clean')?.value,
      CentralLines_RightIJ_Infected: this.progressNotes.get('CentralLines_RightIJ_Infected')?.value,

      CentralLines_LeftIJ: this.progressNotes.get('CentralLines_LeftIJ')?.value,
      CentralLines_LeftIJ_Central: this.progressNotes.get('CentralLines_LeftIJ_Central')?.value,
      CentralLines_LeftIJ_QuintonLine: this.progressNotes.get('CentralLines_LeftIJ_QuintonLine')?.value,
      CentralLines_LeftIJ_Day: this.progressNotes.get('CentralLines_LeftIJ_Day')?.value,
      CentralLines_LeftIJ_DayValue: this.progressNotes.get('CentralLines_LeftIJ_DayValue')?.value,
      CentralLines_LeftIJ_Clean: this.progressNotes.get('CentralLines_LeftIJ_Clean')?.value,
      CentralLines_LeftIJ_Infected: this.progressNotes.get('CentralLines_LeftIJ_Infected')?.value,

      CentralLines_RightSubclavian: this.progressNotes.get('CentralLines_RightSubclavian')?.value,
      CentralLines_RightSubclavian_Central: this.progressNotes.get('CentralLines_RightSubclavian_Central')?.value,
      CentralLines_RightSubclavian_QuintonLine: this.progressNotes.get('CentralLines_RightSubclavian_QuintonLine')?.value,
      CentralLines_RightSubclavian_Day: this.progressNotes.get('CentralLines_RightSubclavian_Day')?.value,
      CentralLines_RightSubclavian_DayValue: this.progressNotes.get('CentralLines_RightSubclavian_DayValue')?.value,
      CentralLines_RightSubclavian_Clean: this.progressNotes.get('CentralLines_RightSubclavian_Clean')?.value,
      CentralLines_RightSubclavian_Infected: this.progressNotes.get('CentralLines_RightSubclavian_Infected')?.value,

      CentralLines_Others: this.progressNotes.get('CentralLines_Others')?.value,
      CentralLines_OthersValue: this.progressNotes.get('CentralLines_OthersValue')?.value,
      CentralLines_Comments: this.progressNotes.get('CentralLines_Comments')?.value,
      CentralLines_CommentsValue: this.progressNotes.get('CentralLines_CommentsValue')?.value
    };

    let foleyCatheterData: any = {};

    foleyCatheterData['FoleyCatheter_PresentReason'] = this.progressNotes.get('FoleyCatheter_PresentReason')?.value || '';
    foleyCatheterData['FoleyCatheter_VoidingFreely'] = this.progressNotes.get('FoleyCatheter_VoidingFreely')?.value || false;
    foleyCatheterData['FoleyCatheter_Condom'] = this.progressNotes.get('FoleyCatheter_Condom')?.value || false;
    foleyCatheterData['FoleyCatheter_Diaper'] = this.progressNotes.get('FoleyCatheter_Diaper')?.value || false;

    let physiotherapyData: any = {};

    physiotherapyData['Physiotherapy_BodyPhysiotherapyApplied'] = this.progressNotes.get('Physiotherapy_BodyPhysiotherapyApplied')?.value || false;
    physiotherapyData['Physiotherapy_NotAppliedReason'] = this.progressNotes.get('Physiotherapy_NotAppliedReason')?.value || '';
    physiotherapyData['Physiotherapy_NotAppliedReasonValue'] = this.progressNotes.get('Physiotherapy_NotAppliedReasonValue')?.value || '';


    let relevantLabResultsData: any = {};

    relevantLabResultsData['RelevantLabResults1'] = this.progressNotes.get('RelevantLabResults1')?.value || '';
    relevantLabResultsData['RelevantLabResults2'] = this.progressNotes.get('RelevantLabResults2')?.value || '';
    relevantLabResultsData['RelevantLabResults3'] = this.progressNotes.get('RelevantLabResults3')?.value || '';
    relevantLabResultsData['RelevantLabResults4'] = this.progressNotes.get('RelevantLabResults4')?.value || '';
    relevantLabResultsData['RelevantLabResults5'] = this.progressNotes.get('RelevantLabResults5')?.value || '';
    relevantLabResultsData['RelevantLabResults6'] = this.progressNotes.get('RelevantLabResults6')?.value || '';

    let issuesAndPlans: any = [];

    (this.progressNotes.get('issuerows') as FormArray).value.forEach((item: any, i: any) => {
      issuesAndPlans.push({
        [`Issue${i + 1}`]: item.issue,
        [`Plan${i + 1}`]: item.plan,
        [`Measurable${i + 1}`]: item.measurable
      });
    });

    var payload = {
      "ICUProgressNoteID": this.ICUProgressNoteID,
      "PatientID": this.selectedView.PatientID,
      "AdmissionID": this.selectedView.AdmissionID,
      "DateOfAdmissionToHospital": this.selectedView.AdmitDate,
      "DateOfAdmissionToICU": moment(new Date(this.progressNotes.get('DateOfAdmissionToHospital')?.value)).format('DD-MMM-YYYY'),
      "ReasonForAdmissionToHospital": this.progressNotes.get('ReasonForAdmissionToHospital')?.value,
      "ReasonForAdmissionToICU": this.progressNotes.get('ReasonForAdmissionToICU')?.value,
      "PastMedicalSurgicalHistory": this.divMedicalCondition.nativeElement.innerHTML,//this.progressNotes.get('PastMedicalSurgicalHistory')?.value,
      "Allergies": this.selectedView?.AllergyData,
      "EventSummary": JSON.stringify(serializedRows),
      "EndorsemenTime": JSON.stringify(progressNotesData),
      "EndorsemenFrom": this.doctorDetails[0]?.UserName + ' - ' + this.doctorDetails[0]?.EmployeeName,
      "EndorsemenTo": this.progressNotes.get('EndorsemenTo')?.value,

      "SystemVitalSigns": JSON.stringify(vitals),
      "CentralNervousSystem": this.progressNotes.get('CentralNervousSystem')?.value,
      "CardiovascularSystem": this.progressNotes.get('CardiovascularSystem')?.value,
      "RespiratorySystem": this.progressNotes.get('RespiratorySystem')?.value,
      "GastrointestinalSystem": this.progressNotes.get('GastrointestinalSystem')?.value,
      "GenitourinarySystem": this.progressNotes.get('GenitourinarySystem')?.value,
      "InfectiousDiseaseSkin": this.progressNotes.get('InfectiousDiseaseSkin')?.value,
      "MusculoskeletalSystem": this.progressNotes.get('MusculoskeletalSystem')?.value,
      "SystemOthers": this.progressNotes.get('SystemOthers')?.value,
      "DVTProphylaxis": JSON.stringify(dvt),
      "GIProphylaxis": JSON.stringify(gi),
      "Feeding": JSON.stringify(Feeding),
      "BowelMotions": JSON.stringify(bowel),
      "MaintenanceIVFluids": JSON.stringify(main),
      "BedSores": JSON.stringify(bed),
      "CentralLines": JSON.stringify(cl),
      "FoleyCatheter": JSON.stringify(foleyCatheterData),
      "Physiotherapy": JSON.stringify(physiotherapyData),
      "RelevantLabResults": JSON.stringify(this.selectedFetchPatientAdmissionLabTestResultsDataList),
      "Assessment": this.divAssessment.nativeElement.innerHTML, //this.progressNotes.get('Assessment')?.value,
      "IssuesAndPlan": JSON.stringify(issuesAndPlans),
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "HospitalID": this.hospitalID,
      "VentilatorStatus": this.ventilatorStatus,
      "VentilatorStatusDate": this.progressNotes.get('VentilatorStatusDate')?.value,
      "Vasopressors": this.divVasopressors.nativeElement.innerHTML,
      "Sedation": this.divSedation.nativeElement.innerHTML,
      "GlycemicControl": this.divGlycemicControl.nativeElement.innerHTML,
      "IsolationStatus": this.divIsolationStatus.nativeElement.innerHTML,
      "IsDraft": DraftType == 1 ? true : false
    };

    this.us.post("SavePatientICUProgressNote", payload).subscribe((response) => {
      if (response.Status == "Success") {
        $("#savemsg").modal('show');
        this.intialize();
        this.FetchPatientICUProgressNoteWorkList();
      } else {

      }
    },
      (err) => {
        console.log(err)
      })

  }

  FetchPatientICUProgressNoteWorkList() {
    this.url = this.service.getData(icuDetails.FetchPatientICUProgressNoteWorkList, { AdmissionID: this.admissionID, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatientICUProgressNoteWorkListDData = this.FetchPatientICUProgressNoteWorkListDData1 = response.FetchPatientICUProgressNoteWorkListDData;
          this.FetchPatientICUProgressNoteWorkListDData = this.FetchPatientICUProgressNoteWorkListDData1.filter((x: any) => !x.IsDraft);
          if (this.FetchPatientICUProgressNoteWorkListDData.length > 0) {
            this.selectedNotes(this.FetchPatientICUProgressNoteWorkListDData[this.FetchPatientICUProgressNoteWorkListDData.length - 1], true);
          }
        }
      },
        (err) => {

        })
  }

  viewDraftWorklist() {
    this.viewDraft = false;
    this.FetchPatientICUProgressNoteWorkListDData = this.FetchPatientICUProgressNoteWorkListDData1.filter((x: any) => x.IsDraft);
  }

  fetchPatientDataEforms() {
    this.url = this.service.getData(icuDetails.FetchPatientDataEForms, {
      AdmissionID: this.admissionID,
      WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatientDataEFormsDataList = response.FetchPatientDataEFormsDataList;
          if (this.FetchPatientDataEFormsDataList.length > 0) {
            this.MedicalCondition = response.FetchPatientDataEFormsDataList[0].MedicalHistory;
            this.progressNotes.patchValue({
              DateOfAdmissionToHospital: new Date(this.selectedView.AdmitDate),
              DateOfAdmissionToICU: new Date(),
              ReasonForAdmissionToHospital: response.FetchPatientDataEFormsDataList[0].ReasonForAdm,
              ReasonForAdmissionToICU: response.FetchPatientDataEFormsDataList[0].ReasonForAdm,

            });


          }
          //this.patientPlannedProcs = response.FetchPatientProceduresDataEFormsDataList.filter((item: any) => item.ProcedureStatus === '1');
          if (response.FetchPatientLabRadDataList.length > 0) {
            this.Assessment = response.FetchPatientLabRadDataList?.map((item: any) => "Code :" + item.ProcedureCode + "-" + item.TestName + " (dated :" + item.OrderDate + ")").join('<br/>');
          }
        }
      },
        (err) => {
        })
  }

  openRelLab() {
    this.url = this.service.getData(icuDetails.FetchPatientAdmissionLabTestResults, { AdmissionID: this.admissionID, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatientAdmissionLabTestResultsDataList = response.FetchPatientAdmissionLabTestResultsDataList;
          $("#labResults").modal('show');
        }
      },
        (err) => {

        })
  }
  openRelLabClear() {
    this.selectedFetchPatientAdmissionLabTestResultsDataList = [];
  }

  addRow(date: string, type: string, details: string, action: string) {
    const row = this.fb.group({
      date: new Date(date),
      type: type,
      details: details,
      action: action
    });
    (this.formEvent.get('rows') as FormArray).push(row);
  }

  addIssuePlanRow(row?: any) {
    if (row) {
      const updatedrow = this.fb.group({
        issue: row.issue,
        plan: row.plan,
        measurable: row.measurable
      });
      (this.progressNotes.get('issuerows') as FormArray).push(updatedrow);
    } else {
      const updatedrow = this.fb.group({
        issue: '',
        plan: '',
        measurable: ''
      });
      (this.progressNotes.get('issuerows') as FormArray).push(updatedrow);
    }
  }

  deleteIssuePlanRow(index: any, row: any) {
    (this.progressNotes.get('issuerows') as FormArray).removeAt(index);
  }

  selectedNotes(note: any, isDefaultId?: boolean) {
    this.hideSave = false;
    this.url = this.service.getData(icuDetails.FetchPatientICUProgressNotes, { ICUProgressNoteID: note.ICUProgressNoteID, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatientICUProgressNotesDData = response.FetchPatientICUProgressNotesDData;
          $("#savedModal").modal('hide');

          if (this.FetchPatientICUProgressNotesDData.length > 0) {

            const eventSummaryData = JSON.parse(this.FetchPatientICUProgressNotesDData[0].EventSummary);

            this.formEvent = this.fb.group({
              rows: this.fb.array([])
            });

            eventSummaryData.forEach((event: any) => {
              this.addRow(event.date, event.type, event.details, event.action);
            });

            this.ICUProgressNoteID = note.ICUProgressNoteID;

            if (isDefaultId) {
              this.ICUProgressNoteID = 0;
            } else {
              if (note.SavedEmpID.toString() !== this.doctorDetails[0].EmpId.toString()) {
                this.hideSave = true;
              }
            }
            const endorsemenTimeObj = JSON.parse(this.FetchPatientICUProgressNotesDData[0].EndorsemenTime);
            const SystemVitalSigns = JSON.parse(this.FetchPatientICUProgressNotesDData[0].SystemVitalSigns);
            const DVTProphylaxis = JSON.parse(this.FetchPatientICUProgressNotesDData[0].DVTProphylaxis);
            const GIProphylaxis = JSON.parse(this.FetchPatientICUProgressNotesDData[0].GIProphylaxis);
            const Feeding = JSON.parse(this.FetchPatientICUProgressNotesDData[0].Feeding);
            const BowelMotions = JSON.parse(this.FetchPatientICUProgressNotesDData[0].BowelMotions);
            const MaintenanceIVFluids = JSON.parse(this.FetchPatientICUProgressNotesDData[0].MaintenanceIVFluids);
            const BedSores = JSON.parse(this.FetchPatientICUProgressNotesDData[0].BedSores);
            const CentralLines = JSON.parse(this.FetchPatientICUProgressNotesDData[0].CentralLines);
            const FoleyCatheter = JSON.parse(this.FetchPatientICUProgressNotesDData[0].FoleyCatheter);
            const Physiotherapy = JSON.parse(this.FetchPatientICUProgressNotesDData[0].Physiotherapy);
            const RelevantLabResults = JSON.parse(this.FetchPatientICUProgressNotesDData[0].RelevantLabResults);
            const IssuesAndPlan = JSON.parse(this.FetchPatientICUProgressNotesDData[0].IssuesAndPlan);

            this.Vasopressors = this.FetchPatientICUProgressNotesDData[0].Vasopressors;
            this.Sedation = this.FetchPatientICUProgressNotesDData[0].Sedation;
            this.GlycemicControl = this.FetchPatientICUProgressNotesDData[0].GlycemicControl;
            this.IsolationStatus = this.FetchPatientICUProgressNotesDData[0].IsolationStatus;

            this.selectedFetchPatientAdmissionLabTestResultsDataList = RelevantLabResults;
            if (this.FetchPatientICUProgressNotesDData.length > 0)
              this.MedicalCondition = this.FetchPatientICUProgressNotesDData[0].PastMedicalSurgicalHistory;
            if (this.FetchPatientICUProgressNotesDData[0].Assessment != "") {
              this.Assessment = this.FetchPatientICUProgressNotesDData[0].Assessment;
            }
            this.progressNotes.patchValue({
              DateOfAdmissionToHospital: new Date(this.FetchPatientICUProgressNotesDData[0].DateOfAdmissionToHospital),
              DateOfAdmissionToICU: new Date(this.FetchPatientICUProgressNotesDData[0].DateOfAdmissionToICU),
              ReasonForAdmissionToHospital: this.FetchPatientICUProgressNotesDData[0].ReasonForAdmissionToHospital,
              ReasonForAdmissionToICU: this.FetchPatientICUProgressNotesDData[0].ReasonForAdmissionToICU,
              // PastMedicalSurgicalHistory: this.FetchPatientICUProgressNotesDData[0].PastMedicalSurgicalHistory,
              slot1: endorsemenTimeObj?.slot1,
              slot2: endorsemenTimeObj?.slot2,
              EndorsemenFrom: this.FetchPatientICUProgressNotesDData[0].EndorsemenFrom,
              EndorsemenTo: this.FetchPatientICUProgressNotesDData[0].EndorsemenTo,
              VitalSignsTemp: SystemVitalSigns?.VitalSignsTemp,
              VitalSignsTmax: SystemVitalSigns?.VitalSignsTmax,
              VitalSignsHR: SystemVitalSigns?.VitalSignsHR,
              VitalSignsBP: SystemVitalSigns?.VitalSignsBP,
              VitalSignsRR: SystemVitalSigns?.VitalSignsRR,
              VitalSignsVasopressorsInotropes: SystemVitalSigns?.VitalSignsVasopressorsInotropes,
              VitalSignsNameDose: SystemVitalSigns?.VitalSignsNameDose,
              VitalHighO2requirement: SystemVitalSigns?.VitalHighO2requirement,

              CentralNervousSystem: this.FetchPatientICUProgressNotesDData[0].CentralNervousSystem,
              CardiovascularSystem: this.FetchPatientICUProgressNotesDData[0].CardiovascularSystem,
              RespiratorySystem: this.FetchPatientICUProgressNotesDData[0].RespiratorySystem,
              GastrointestinalSystem: this.FetchPatientICUProgressNotesDData[0].GastrointestinalSystem,
              GenitourinarySystem: this.FetchPatientICUProgressNotesDData[0].GenitourinarySystem,
              InfectiousDiseaseSkin: this.FetchPatientICUProgressNotesDData[0].InfectiousDiseaseSkin,
              MusculoskeletalSystem: this.FetchPatientICUProgressNotesDData[0].MusculoskeletalSystem,
              SystemOthers: this.FetchPatientICUProgressNotesDData[0].SystemOthers,

              DVT_Cleanex: DVTProphylaxis?.DVT_Cleanex,
              DVT_SCheparin: DVTProphylaxis?.DVT_SCheparin,
              DVT_FullAnticoagulation: DVTProphylaxis?.DVT_FullAnticoagulation,
              DVT_DVTPump: DVTProphylaxis?.DVT_DVTPump,
              DVT_Others: DVTProphylaxis?.DVT_Others,
              DVT_OthersValue: DVTProphylaxis?.DVT_OthersValue,
              DVT_NoneReason: DVTProphylaxis?.DVT_NoneReason,
              DVT_NoneReasonValue: DVTProphylaxis?.DVT_NoneReasonValue,

              GI_PPIOnce: GIProphylaxis?.GI_PPIOnce,
              GI_PPITwice: GIProphylaxis?.GI_PPITwice,
              GI_NoneReason: GIProphylaxis?.GI_NoneReason,
              GI_NoneReasonValue: GIProphylaxis?.GI_NoneReasonValue,

              Feeding_Tube: Feeding?.Feeding_Tube,
              Feeding_TubeValue: Feeding?.Feeding_TubeValue,
              Feeding_Oral: Feeding?.Feeding_Oral,
              Feeding_OralValue: Feeding?.Feeding_OralValue,
              Feeding_NPOReason: Feeding?.Feeding_NPOReason,
              Feeding_NPOReasonValue: Feeding?.Feeding_NPOReasonValue,

              Bowel_Regular: BowelMotions?.Bowel_Regular,
              Bowel_Constipation: BowelMotions?.Bowel_Constipation,
              Bowel_Diarrhea: BowelMotions?.Bowel_Diarrhea,
              Bowel_Action: BowelMotions?.Bowel_Action,
              Bowel_ActionValue: BowelMotions?.Bowel_ActionValue,

              Maintenance_IVFluids_Yes: MaintenanceIVFluids?.Maintenance_IVFluids_Yes,
              Maintenance_IVFluids_No: MaintenanceIVFluids?.Maintenance_IVFluids_No,
              Maintenance_IVFluids_Type: MaintenanceIVFluids?.Maintenance_IVFluids_Type,
              Maintenance_IVFluids_Rate: MaintenanceIVFluids?.Maintenance_IVFluids_Rate,
              Maintenance_IVFluids_Reason: MaintenanceIVFluids?.Maintenance_IVFluids_Reason,

              Bed_Sores_No: BedSores?.Bed_Sores_No,
              Bed_Sores_Yes: BedSores?.Bed_Sores_Yes,
              Bed_Sores_YesValue: BedSores?.Bed_Sores_YesValue,
              Bed_Sores_MaximumStage: BedSores?.Bed_Sores_MaximumStage,
              Bed_Sores_Turningappliedevery: BedSores?.Bed_Sores_Turningappliedevery,
              Bed_Sores_Turningappliedeveryvalue: BedSores?.Bed_Sores_Turningappliedeveryvalue,
              Bed_Sores_NoTurningReason: BedSores?.Bed_Sores_NoTurningReason,
              Bed_Sores_NoTurningReasonValue: BedSores?.Bed_Sores_NoTurningReasonValue,

              CentralLines_RightIJ: CentralLines?.CentralLines_RightIJ,
              CentralLines_RightIJ_Central: CentralLines?.CentralLines_RightIJ_Central,
              CentralLines_RightIJ_QuintonLine: CentralLines?.CentralLines_RightIJ_QuintonLine,
              CentralLines_RightIJ_Day: CentralLines?.CentralLines_RightIJ_Day,
              CentralLines_RightIJ_DayValue: CentralLines?.CentralLines_RightIJ_DayValue,
              CentralLines_RightIJ_Clean: CentralLines?.CentralLines_RightIJ_Clean,
              CentralLines_RightIJ_Infected: CentralLines?.CentralLines_RightIJ_Infected,

              CentralLines_LeftIJ: CentralLines?.CentralLines_LeftIJ,
              CentralLines_LeftIJ_Central: CentralLines?.CentralLines_LeftIJ_Central,
              CentralLines_LeftIJ_QuintonLine: CentralLines?.CentralLines_LeftIJ_QuintonLine,
              CentralLines_LeftIJ_Day: CentralLines?.CentralLines_LeftIJ_Day,
              CentralLines_LeftIJ_DayValue: CentralLines?.CentralLines_LeftIJ_DayValue,
              CentralLines_LeftIJ_Clean: CentralLines?.CentralLines_LeftIJ_Clean,
              CentralLines_LeftIJ_Infected: CentralLines?.CentralLines_LeftIJ_Infected,

              CentralLines_RightSubclavian: CentralLines?.CentralLines_RightSubclavian,
              CentralLines_RightSubclavian_Central: CentralLines?.CentralLines_RightSubclavian_Central,
              CentralLines_RightSubclavian_QuintonLine: CentralLines?.CentralLines_RightSubclavian_QuintonLine,
              CentralLines_RightSubclavian_Day: CentralLines?.CentralLines_RightSubclavian_Day,
              CentralLines_RightSubclavian_DayValue: CentralLines?.CentralLines_RightSubclavian_DayValue,
              CentralLines_RightSubclavian_Clean: CentralLines?.CentralLines_RightSubclavian_Clean,
              CentralLines_RightSubclavian_Infected: CentralLines?.CentralLines_RightSubclavian_Infected,

              CentralLines_Others: CentralLines?.CentralLines_Others,
              CentralLines_OthersValue: CentralLines?.CentralLines_OthersValue,
              CentralLines_Comments: CentralLines?.CentralLines_Comments,
              CentralLines_CommentsValue: CentralLines?.CentralLines_CommentsValue,

              FoleyCatheter_PresentReason: FoleyCatheter?.FoleyCatheter_PresentReason,
              FoleyCatheter_PresentReasonValue: FoleyCatheter?.FoleyCatheter_PresentReasonValue,
              FoleyCatheter_VoidingFreely: FoleyCatheter?.FoleyCatheter_VoidingFreely,
              FoleyCatheter_Condom: FoleyCatheter?.FoleyCatheter_Condom,
              FoleyCatheter_Diaper: FoleyCatheter?.FoleyCatheter_Diaper,

              Physiotherapy_BodyPhysiotherapyApplied: Physiotherapy?.Physiotherapy_BodyPhysiotherapyApplied,
              Physiotherapy_NotAppliedReason: Physiotherapy?.Physiotherapy_NotAppliedReason,
              Physiotherapy_NotAppliedReasonValue: Physiotherapy?.Physiotherapy_NotAppliedReasonValue,


              Assessment: this.FetchPatientICUProgressNotesDData[0].Assessment,
            });
            (this.progressNotes.get('issuerows') as FormArray)?.clear();
            if (IssuesAndPlan.length > 0) {
              IssuesAndPlan.forEach((item: any, index: any) => {
                this.addIssuePlanRow({
                  plan: item[`Plan${index + 1}`] ?? '',
                  issue: item[`Issue${index + 1}`] ?? '',
                  measurable: item[`Measurable${index + 1}`] ?? ''
                });
              });
            } else {
              this.addIssuePlanRow({
                plan: '',
                issue: '',
                measurable: ''
              });
            }
          }
        }
      },
        (err) => {

        })
  }

  viewWorklist() {
    this.viewDraft = !this.viewDraft;
    if (this.viewDraft) {
      this.FetchPatientICUProgressNoteWorkListDData = this.FetchPatientICUProgressNoteWorkListDData1.filter((x: any) => x.IsDraft);
    }
    else {
      this.FetchPatientICUProgressNoteWorkListDData = this.FetchPatientICUProgressNoteWorkListDData1.filter((x: any) => !x.IsDraft);
    }
    $("#savedModal").modal('show');
  }

  clear() {
    this.Assessment = "";
    this.MedicalCondition = "";
    this.intialize();
    this.fetchPatientDataEforms();
    this.ICUProgressNoteID = 0;
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

  selectedLabTestResult(item: any): void {
    item.active = !item.active;
  }

  selectLab(): void {
    var selected = this.FetchPatientAdmissionLabTestResultsDataList.filter((item: any) => item.active);
    this.errorMessage = "";
    this.showPreValidation = false;

    if (selected.length === 0) {
      this.errorMessage = "Please select atleast one Lab Result";
      this.showPreValidation = true;
      return;
    }
    this.selectedFetchPatientAdmissionLabTestResultsDataList = selected;
    $("#labResults").modal('hide');
  }

  clearLab(): void {
    this.FetchPatientAdmissionLabTestResultsDataList.forEach((item: any) => {
      item.active = false;
    });

    this.selectedFetchPatientAdmissionLabTestResultsDataList = [];
    this.isClear = false;
    this.errorMessage = "";
    this.showPreValidation = false;
    setTimeout(() => {
      this.isClear = true;
    }, 0);
  }

  openPrescriptionPopUp() {
    this.showPrescriptionModal = true;
    $("#prescriptionModal").modal('show');
  }
  closeViewResultsPopup() {
    $("#prescriptionModal").modal("hide");
    this.FetchPatientICUProgressNoteWorkList();
    this.fetchPatientDataEforms();
    setTimeout(() => {
      this.showPrescriptionModal = false;
    }, 1000);
  }
}
