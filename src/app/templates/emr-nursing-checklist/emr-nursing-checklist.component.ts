import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { ConfigService } from 'src/app/services/config.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { Router } from '@angular/router';

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
  selector: 'app-emr-nursing-checklist',
  templateUrl: './emr-nursing-checklist.component.html',
  styleUrls: ['./emr-nursing-checklist.component.scss'],
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
export class EmrNursingChecklistComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('diverf') divact!: ElementRef;
  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  @ViewChild('Signature3') Signature3!: SignatureComponent;
  @ViewChild('Signature4') Signature4!: SignatureComponent;
  @ViewChild('Signature5') Signature5!: SignatureComponent;
  @ViewChild('Signature6') Signature6!: SignatureComponent;
  @Input() readOnly = false;
  tableVitalsList: any;
  IsHeadNurse: any;
  IsHome = true;
  patinfo: any;
  patientDetails: any;
  hospId: any;
  doctorDetails: any;
  IsDoctor: any;
  VTScoreDataList: any = [];
  BillDataList: any = [];
  VitalDataList: any = [];
  WardBedDataList: any = [];
  AdmissionDataList: any = [];
  BillDetailsList: any = [];
  ClinicalConditionDataList: any = [];
  ChiefComplaintsDataList: any = [];
  ChiefComplaintsDataList1: any = [];
  IntialAssessmentDataList: any = [];
  DiagnosisDataList: any = [];
  DiagnosisDataListFiltered: any = [];
  MedicationDataList: any = [];
  MedicationDataListFiltered: any = [];
  ServicesDataList: any = [];
  ServicesDataListFiltered: any = [];
  ServicesDataListInv: any = [];
  ServicesDataListInvFiltered: any = [];
  ServicesDataListProc: any = [];
  ServicesDataListProcFiltered: any = []
  AdviceDataList: any = [];
  PrimaryDoctorDataList: any = [];
  PrimaryEndorseDoctorDataListP: any = [];
  PrimaryReferalDataList: any = [];
  EmrEpisodeDataList: any = [];
  patientMeidcation: any = [];
  selectedPatientAllergies: any = [];
  objPatientVitalsList: any = [];
  showReferralonTop = false;
  patientDemographicData: any = [];
  CTAS: any;
  ModeofArrival: any;
  tableVitals: any;
  tableVitalsListFiltered: any;
  langData: any;

  PatientNurseCheckListID = 0;
  checklistForm: any;
  otherStaffList: any = [];

  dischargeList = [{
    id: 1, name: 'Discharge Home',
    children: [{
      id: 1, name: 'With OPD follow up'
    },
    {
      id: 2, name: 'With  Home medication'
    },
    {
      id: 3, name: 'No home medication'
    }]
  },
  {
    id: 2, name: 'DAMA',
    children: [{
      id: 1, name: 'Personal Reason'
    },
    {
      id: 2, name: 'Financial'
    }]
  },
  {
    id: 3, name: 'Transferred to other hospital',
    children: []
  },
  {
    id: 4, name: 'Transferred to OPD',
    children: []
  },
  {
    id: 5, name: 'Admission',
    children: []
  }]
  consentSigned: string = "";
  fromEmergencyWorklist: boolean = false;

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private router: Router, private us: UtilityService, private service: MedicalAssessmentService, private config: ConfigService, private datepipe: DatePipe) {
    super(renderer, el, cdr);
  }

  ngOnInit(): void {
    this.hospId = sessionStorage.getItem("hospitalId");
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");

    if (sessionStorage.getItem("fromEmergencyWorklist")) {
      this.fromEmergencyWorklist = true;
      sessionStorage.removeItem("fromEmergencyWorklist");
    }

    this.fetchPatientFileInfo();
    this.initializeForm();
    setTimeout(() => {
      //this.initializeForm();
    }, 2000);
    this.GetVitalsData();
  }

  ngAfterViewInit() {
    this.langData = this.config.getLangData();
  }

  navigateBackToWorklist() {
    this.router.navigate(['/emergency/worklist']);
  }

  initializeForm() {
    this.checklistForm = this.formBuilder.group({
      TimeAdmitted: this.setCurrentTime(),
      DateAdmitted: moment(),
      DischargeDate: moment(),
      DischargeTime: this.setCurrentTime(),
      AdmittingUnitRoom: '',
      ConsentSigned: '',
      ORRequestForwarded: '3',
      PreAnestheticDone: '3',
      IsVitalSignsTaken: 0,
      ISComfortProvided: 0,
      IsPainMeasuresProvided: 0,
      HealthTeaching: '',
      ApprovedCase: '',
      AttendingDoctorName: this.patientDetails.Consultant,
      AttendingDoctorID: this.patientDetails.ConsultantID,
      IsDischarge: 0,
      ISGoodCondition: 0,
      ISFairCondition: 0,
      ISOPD: 0,
      Followup: 1,
      FollowupDate: moment().add(1, 'days'),
      TriageNurseID: this.VitalDataList.EmpID,
      TriageNurseName: this.VitalDataList.UserName,
      TriageNurseDate: moment(),
      TriageNurseTime: this.setCurrentTime(),
      AttendingAEDOPDNurseID: '',
      AttendingAEDOPDNurseName: '',
      AttendingAEDOPDNurseDate: moment(),
      AttendingAEDOPDNurseTime: this.setCurrentTime(),
      CheckedbyERNurseID: '',
      CheckedbyERNurseName: '',
      CheckedbyERNurseDate: moment(),
      CheckedbyERNurseTime: this.setCurrentTime(),
      CheckedbyERDoctorID: '',
      CheckedbyERDoctorName: '',
      CheckedbyERDoctorDate: moment(),
      CheckedbyERDoctorTime: this.setCurrentTime(),
      CheckedbyWardNurseID: '',
      CheckedbyWardNurseName: '',
      CheckedbyWardNurseDate: moment(),
      CheckedbyWardNurseTime: this.setCurrentTime(),
      CheckedbyOtherStaffID: '',
      CheckedbyOtherStaffName: '',
      CheckedbyOtherStaffDate: moment(),
      CheckedbyOtherStaffTime: this.setCurrentTime(),
      PatientRemarks: '',
      PatintIdentificationBandID: 0,
      AcceptanceID: 0,
      IVCannula: 0,
      GaugeID: 0,
      SiteID: 0,
      IsApproved: 0,
      EndorsedByER: '',
      EndorsedByERDate: moment(),
      EndorsedByERTime: this.setCurrentTime(),
      ReceivedByER: '',
      ReceivedByERID: 0,
      ReceivedByERDate: moment(),
      ReceivedByERTime: this.setCurrentTime(),
      DischargeStatusID: 0,
      DischargeReasonID: 0
    });
  }

  GetVitalsData() {
    const FromDate = moment(this.patientData.AdmissionReqDate == null ? this.patientData.AdmitDate : this.patientData.AdmissionReqDate).format('DD-MMM-YYYY');


    const ToDate = moment().format('DD-MMM-YYYY');
    var AdmissionID;
    if (this.patientData.AdmissionReqAdmissionid == '' || this.patientData.AdmissionReqAdmissionid == undefined)
      AdmissionID = this.patientData.AdmissionID;
    else
      AdmissionID = this.patientData.AdmissionReqAdmissionid;
    this.config.FetchIPPatientVitalsRR(AdmissionID, FromDate, ToDate, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchIPPatientVitalsRRDataList.length > 0) {
          this.tableVitalsList = response.FetchIPPatientVitalsRRDataList;
          const distinctThings = response.FetchIPPatientVitalsRRDataList.filter(
            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.CreateDateNew === thing.CreateDateNew) === i);
          this.tableVitalsListFiltered = distinctThings;
        }
      },
        (err) => {

        });
  }

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
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

  fetchPatientFileInfo() {
    var AdmissionID;
    if (this.patientData.AdmissionReqAdmissionid == '' || this.patientData.AdmissionReqAdmissionid === undefined)
      AdmissionID = this.patientData.AdmissionID;
    else
      AdmissionID = this.patientData.AdmissionReqAdmissionid;

    this.config.FetchERWorkFlow(this.patientData.PatientID, AdmissionID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.VTScoreDataList.length > 0) {
            this.VTScoreDataList = response.VTScoreDataList;
          }
          if (response.BillDataList.length > 0) {
            this.BillDataList = response.BillDataList[0];
          }
          if (response.VitalDataList.length > 0) {
            this.VitalDataList = response.VitalDataList[0];
          }
          if (response.WardBedDataList.length > 0) {
            this.WardBedDataList = response.WardBedDataList[0];
          }
          if (response.AdmissionDataList.length > 0) {
            this.AdmissionDataList = response.AdmissionDataList[0];
          }
          if (response.BillDetailsList.length > 0) {
            this.BillDetailsList = response.BillDetailsList[0];
          }
          if (response.ClinicalConditionDataList.length > 0) {
            this.ClinicalConditionDataList = response.ClinicalConditionDataList[0];
          }
          if (response.ChiefComplaintsDataList.length > 0) {
            this.ChiefComplaintsDataList = this.ChiefComplaintsDataList1 = response.ChiefComplaintsDataList;
          }
          if (response.IntialAssessmentDataList.length > 0) {
            this.IntialAssessmentDataList = response.IntialAssessmentDataList[0];
          }
          if (response.DiagnosisDataList.length > 0) {
            this.DiagnosisDataList = response.DiagnosisDataList;
            const distinctDiag = this.DiagnosisDataList.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.DoctorId === thing.DoctorId) === i);
            this.DiagnosisDataListFiltered = distinctDiag;
          }
          if (response.MedicationDataList.length > 0) {
            this.MedicationDataList = response.MedicationDataList;
            const distinctThings = response.MedicationDataList.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.DoctorId === thing.DoctorId) === i);
            this.MedicationDataListFiltered = distinctThings;
          }
          if (response.ServicesDataList.length > 0) {
            this.ServicesDataList = response.ServicesDataList;

            this.ServicesDataListInv = this.ServicesDataList.filter((x: any) => x.ServiceID == 3);
            // const distinctThings = this.ServicesDataListInv.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.DoctorId === thing.DoctorId) === i);
            // this.ServicesDataListInvFiltered = distinctThings;

            this.ServicesDataListProc = this.ServicesDataList.filter((x: any) => x.ServiceID == 5);
            // const distinctThingsProc = this.ServicesDataListProc.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.DoctorId === thing.DoctorId) === i);
            // this.ServicesDataListProcFiltered = distinctThingsProc;
          }
          if (response.AdviceDataList.length > 0) {
            this.AdviceDataList = response.AdviceDataList[0];
          }
          if (response.PrimaryDoctorDataList.length > 0) { // Endorse / Transfer Request Acceptancce
            this.PrimaryDoctorDataList = response.PrimaryDoctorDataList;
          }
          if (response.PrimaryEndorseDoctorDataList.length > 0) { // Endorse / Transfer Request
            this.PrimaryEndorseDoctorDataListP = response.PrimaryEndorseDoctorDataList;
          }
          if (response.PrimaryReferalDataList.length > 0) { // Referal
            this.PrimaryReferalDataList = response.PrimaryReferalDataList;
            if (new Date(this.PrimaryEndorseDoctorDataListP[0]?.AcceptDate) > new Date(this.PrimaryReferalDataList[0]?.ReferalDate)) {
              this.showReferralonTop = true;
            }
          }
          if (response.EmrEpisodeDataList.length > 0) { // EndofEpisode
            this.EmrEpisodeDataList = response.EmrEpisodeDataList[0];
          }
          if (response.PrimaryEndorsePatientDataList.length > 0) {
            this.patientDemographicData = response.PrimaryEndorsePatientDataList[0];
          }
        }
        this.fetchChecklistData();
      })
  }

  filterDiagnosis(docid: any) {
    return this.DiagnosisDataList.filter((buttom: any) => buttom.DoctorId == docid);
  }
  filterFunction(vitals: any, visitid: any) {
    return vitals.filter((buttom: any) => buttom.CreateDateNew == visitid);
  }

  fetchChecklistDataCall() {
    
  }

  fetchChecklistData() {
    var AdmissionID;
    if (this.patientData.AdmissionReqAdmissionid == '' || this.patientData.AdmissionReqAdmissionid == undefined)
      AdmissionID = this.patientData.AdmissionID;
    else
      AdmissionID = this.patientData.AdmissionReqAdmissionid;


    this.config.FetchPatientNurseCheckList(this.patientData.AdmissionID, this.doctorDetails[0].UserId, this.facility.FacilityID, this.hospId).subscribe((response: any) => {
      if (response.Code == 200 && response.FetchPatientNurseCheckDataList.length > 0) {
        this.bindData(response);
      }
      else {
        this.config.FetchPatientNurseCheckList(this.patientData.AdmissionReqAdmissionid, this.doctorDetails[0].UserId, this.facility.FacilityID, this.hospId).subscribe((response: any) => {
          if (response.Code == 200 && response.FetchPatientNurseCheckDataList.length > 0) {
            this.bindData(response);
          }
        });
      }
    });
  }

  bindData(response: any) {
    const data = response.FetchPatientNurseCheckDataList[0];
        this.PatientNurseCheckListID = data.PatientNurseCheckListID;
        $('#textarea_diet').text(data.Diet);
        $('#textarea_promissory_note').text(data.PromissoryNote);
        this.signatureList = [];
        this.signatureForm.patchValue({
          Signature1: data.TriageNurseSignature,
          Signature2: data.AttendingAEDOPDNurseSignature,
          Signature3: data.CheckedbyERNurseSignature,
          Signature4: data.CheckedbyERDoctorSignature,
          Signature5: data.CheckedbyWardNurseSignature,
          Signature6: data.CheckedbyOtherStaffSignature,
        });
        if (data.TriageNurseSignature) {
          this.signatureList.push({ class: 'Signature1', signature: data.TriageNurseSignature });
        }

        if (data.AttendingAEDOPDNurseSignature) {
          this.signatureList.push({ class: 'Signature2', signature: data.AttendingAEDOPDNurseSignature });
        }

        if (data.CheckedbyERNurseSignature) {
          this.signatureList.push({ class: 'Signature3', signature: data.CheckedbyERNurseSignature });
        }

        if (data.CheckedbyERDoctorSignature) {
          this.signatureList.push({ class: 'Signature4', signature: data.CheckedbyERDoctorSignature });
        }

        if (data.CheckedbyWardNurseSignature) {
          this.signatureList.push({ class: 'Signature5', signature: data.CheckedbyWardNurseSignature });
        }

        if (data.CheckedbyOtherStaffSignature) {
          this.signatureList.push({ class: 'Signature6', signature: data.CheckedbyOtherStaffSignature });
        }
        this.checklistForm.patchValue({
          DateAdmitted: moment(data.AdmissionDateTime?.split(' ')[0]) || moment(),
          TimeAdmitted: data.AdmissionDateTime?.split(' ')[1] || this.setCurrentTime(),
          DischargeDate: moment(data.DischargeDateTime?.split(' ')[0]) || moment(),
          DischargeTime: data.DischargeDateTime?.split(' ')[1] || this.setCurrentTime(),
          AdmittingUnitRoom: data.AdmittingUnitRoom,
          ConsentSigned: data.ConsentSigned,
          ORRequestForwarded: data.ORRequestForwarded,
          PreAnestheticDone: data.PreAnestheticDone,
          IsApproved: data.IsApproved === 'False' ? 0 : 1,
          IsVitalSignsTaken: data.IsVitalSignsTaken === 'False' ? 0 : 1,
          ISComfortProvided: data.ISComfortProvided === 'False' ? 0 : 1,
          IsPainMeasuresProvided: data.IsPainMeasuresProvided === 'False' ? 0 : 1,
          HealthTeaching: data.HealthTeaching,
          ApprovedCase: data.ApprovedCase,
          AttendingDoctorName: data.AttendingDoctorName,
          AttendingDoctorID: data.AttendingDoctorID,
          IsDischarge: data.IsDischarge === 'False' ? 0 : 1,
          ISGoodCondition: data.ISGoodCondition === 'False' ? 0 : 1,
          ISFairCondition: data.ISFairCondition === 'False' ? 0 : 1,
          ISOPD: data.ISOPD === 'False' ? 0 : 1,
          Followup: data.Followup,
          FollowupDate: moment(data.FollowupDate),
          TriageNurseID: data.TriageNurseID,
          TriageNurseName: data.TriageNurseName,
          TriageNurseDate: moment(data.TriageNurseDateTime?.split(' ')[0]),
          TriageNurseTime: data.TriageNurseDateTime?.split(' ')[1],
          AttendingAEDOPDNurseID: data.AttendingAEDOPDNurseID,
          AttendingAEDOPDNurseName: data.AttendingAEDOPDNurseName,
          AttendingAEDOPDNurseDate: moment(data.AttendingAEDOPDNurseDateTime?.split(' ')[0]),
          AttendingAEDOPDNurseTime: data.AttendingAEDOPDNurseDateTime?.split(' ')[1],
          CheckedbyERNurseID: data.CheckedbyERNurseID,
          CheckedbyERNurseName: data.CheckedbyERNurseName,
          CheckedbyERNurseDate: moment(data.CheckedbyERNurseDateTime?.split(' ')[0]),
          CheckedbyERNurseTime: data.CheckedbyERNurseDateTime?.split(' ')[1],
          CheckedbyERDoctorID: data.CheckedbyERDoctorID,
          CheckedbyERDoctorName: data.CheckedbyERDoctorName,
          CheckedbyERDoctorDate: moment(data.CheckedbyERDoctorDateTime?.split(' ')[0]),
          CheckedbyERDoctorTime: data.CheckedbyERDoctorDateTime?.split(' ')[1],
          CheckedbyWardNurseID: data.CheckedbyWardNurseID,
          CheckedbyWardNurseName: data.CheckedbyWardNurseName,
          CheckedbyWardNurseDate: moment(data.CheckedbyWardNurseDateTime?.split(' ')[0]),
          CheckedbyWardNurseTime: data.CheckedbyWardNurseDateTime?.split(' ')[1],
          CheckedbyOtherStaffID: data.CheckedbyOtherStaffID,
          CheckedbyOtherStaffName: data.CheckedbyOtherStaffName,
          CheckedbyOtherStaffDate: moment(data.CheckedbyOtherStaffDateTime?.split(' ')[0]),
          CheckedbyOtherStaffTime: data.CheckedbyOtherStaffDateTime?.split(' ')[1],
          PatientRemarks: data.PatientRemarks,
          PatintIdentificationBandID: data.PatintIdentificationBandID==''?0:data.PatintIdentificationBandID,
          AcceptanceID: data.AcceptanceID || 0,
          IVCannula: data.IVCannula === 'False' ? 0 : 1,
          GaugeID: data.GaugeID || 0,
          SiteID: data.SiteID || 0,
          EndorsedByER: data.EndorsedByER,
          EndorsedByERDate: moment(data.EndorsedByERStaffDatetime?.split(' ')[0]),
          EndorsedByERTime: data.EndorsedByERStaffDatetime?.split(' ')[1] || this.setCurrentTime(),
          ReceivedByER: data.ReceivedByER,
          ReceivedByERDate: moment(data.ReceivedByERDatetime?.split(' ')[0]),
          ReceivedByERTime: data.ReceivedByERDatetime?.split(' ')[1] || this.setCurrentTime(),
          DischargeStatusID: data.DischargeStatusID || 0,
          DischargeReasonID: data.DischargeReasonID || 0
        });

        if(data.ConsentSigned != '') {
          const conSigned = data.ConsentSigned.split(',').length > 0 ? data.ConsentSigned.split(',') : data.ConsentSigned;
          if(conSigned.length > 0) {
            conSigned.forEach((element:any) => {
              if(element === '1') {
                document.getElementById("checkbox_General")?.classList.add('active');
              }
              else if(element === '2') {
                document.getElementById("checkbox_MedicalInformed")?.classList.add('active');
              }
              else if(element === '3') {
                document.getElementById("checkbox_Anesthesia")?.classList.add('active');
              }
            });
          }
        }

        if (response.FetchPatientNurseCheckPresDataList.length > 0) {
          const PresDataList = response.FetchPatientNurseCheckPresDataList.filter((item: any) => item.PatientNurseCheckListID === this.PatientNurseCheckListID);
          PresDataList.forEach((item: any) => {
            const medicationItem = this.MedicationDataList.find((medItem: any) => {
              return (medItem.ItemID.toString() === item.ItemID.toString()) && (medItem.PrescriptionID.toString() === item.PrescriptionID.toString())
            });
            if (medicationItem) {
              medicationItem.ADRN = item.AdverseReactionNoted;
              medicationItem.ACT = item.ActionTaken;
              medicationItem.selected = item.Respondwell === 'True' ? true : false;
              medicationItem.TimeGiven = item.TimeGiven;
              medicationItem.TGN = item.TimeGiven.split(' ')[1];
              medicationItem.RMK = item.Remarks;
            }
          });
        }
  }

  saveChecklistData() {
    let NurseViewDetails: any = [];
    this.MedicationDataList.forEach((item: any) => {
      //if (item.TGN) {
        NurseViewDetails.push({
          "PRID": item.PrescriptionID,
          "IID": item.ItemID,
          "TGN": `${moment(new Date()).format('DD-MMM-YYYY')} ${item.TGN==undefined?'00:00':item.TGN}`,
          "RPSW": item.selected ? 1 : 0,
          "ADRN": item.ADRNChange || item.ADRN,
          "ACT": item.ACTChange || item.ACT,
          "RMK": item.RMKChange || item.RMK
        });
      //}
    });
    const payload = {
      "PatientNurseCheckListID": this.PatientNurseCheckListID,
      "PatientID": this.patientData.PatientID,
      "AdmissionID": this.patientData.AdmissionID,
      "AdmittingUnitRoom": this.checklistForm.get('AdmittingUnitRoom').value,
      "ConsentSigned": this.checklistForm.get('ConsentSigned').value,
      "ORRequestForwarded": this.checklistForm.get('ORRequestForwarded').value,
      "PreAnestheticDone": this.checklistForm.get('PreAnestheticDone').value,
      "IsApproved": this.checklistForm.get('IsApproved').value,
      "Diet": $('#textarea_diet').text(),
      "PromissoryNote": $('#textarea_promissory_note').text(),
      "IsVitalSignsTaken": this.checklistForm.get('IsVitalSignsTaken').value,
      "ISComfortProvided": this.checklistForm.get('ISComfortProvided').value,
      "IsPainMeasuresProvided": this.checklistForm.get('IsPainMeasuresProvided').value,
      "HealthTeaching": this.checklistForm.get('HealthTeaching').value,
      "ApprovedCase": this.checklistForm.get('ApprovedCase').value,
      "AttendingDoctorID": this.checklistForm.get('AttendingDoctorID').value,
      "IsDischarge": this.checklistForm.get('IsDischarge').value,
      "ISGoodCondition": this.checklistForm.get('ISGoodCondition').value,
      "ISFairCondition": this.checklistForm.get('ISFairCondition').value,
      "ISOPD": this.checklistForm.get('ISOPD').value,
      "Followup": this.checklistForm.get('Followup').value,
      "FollowupDate": this.checklistForm.get('FollowupDate').value.format('DD-MMM-YYYY'),
      "TriageNurseID": this.checklistForm.get('TriageNurseID').value ? this.checklistForm.get('TriageNurseID').value : 0,
      "TriageNurseDateTime": `${this.checklistForm.get('TriageNurseDate').value.format('DD-MMM-YYYY')} ${this.checklistForm.get('TriageNurseTime').value}`,
      "TriageNurseSignature": this.signatureForm.get('Signature1').value,
      "AttendingAEDOPDNurseID": this.checklistForm.get('AttendingAEDOPDNurseID').value ? this.checklistForm.get('AttendingAEDOPDNurseID').value : 0,
      "AttendingAEDOPDNurseDateTime": `${this.checklistForm.get('AttendingAEDOPDNurseDate').value.format('DD-MMM-YYYY')} ${this.checklistForm.get('AttendingAEDOPDNurseTime').value}`,
      "AttendingAEDOPDNurseSignature": this.signatureForm.get('Signature2').value,
      "CheckedbyERNurseID": this.checklistForm.get('CheckedbyERNurseID').value ? this.checklistForm.get('CheckedbyERNurseID').value : 0,
      "CheckedbyERNurseDateTime": `${this.checklistForm.get('CheckedbyERNurseDate').value.format('DD-MMM-YYYY')} ${this.checklistForm.get('CheckedbyERNurseTime').value}`,
      "CheckedbyERNurseSignature": this.signatureForm.get('Signature3').value,
      "CheckedbyERDoctorID": this.checklistForm.get('CheckedbyERDoctorID').value ? this.checklistForm.get('CheckedbyERDoctorID').value : 0,
      "CheckedbyERDoctorDateTime": `${this.checklistForm.get('CheckedbyERDoctorDate').value.format('DD-MMM-YYYY')} ${this.checklistForm.get('CheckedbyERDoctorTime').value}`,
      "CheckedbyERDoctorSignature": this.signatureForm.get('Signature4').value,
      "CheckedbyWardNurseID": this.checklistForm.get('CheckedbyWardNurseID').value ? this.checklistForm.get('CheckedbyWardNurseID').value : 0,
      "CheckedbyWardNurseDateTime": `${this.checklistForm.get('CheckedbyWardNurseDate').value.format('DD-MMM-YYYY')} ${this.checklistForm.get('CheckedbyWardNurseTime').value}`,
      "CheckedbyWardNurseSignature": this.signatureForm.get('Signature5').value,
      "CheckedbyOtherStaffID": this.checklistForm.get('CheckedbyOtherStaffID').value ? this.checklistForm.get('CheckedbyOtherStaffID').value : 0,
      "CheckedbyOtherStaffDateTime": `${this.checklistForm.get('CheckedbyOtherStaffDate').value.format('DD-MMM-YYYY')} ${this.checklistForm.get('CheckedbyOtherStaffTime').value}`,
      "CheckedbyOtherStaffSignature": this.signatureForm.get('Signature6').value,
      "HospitalID": this.hospId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID,
      "NurseViewDetails": NurseViewDetails,
      "PatientRemarks": this.checklistForm.get('PatientRemarks').value,
      "PatintIdentificationBandID": this.checklistForm.get('PatintIdentificationBandID').value==''?0:this.checklistForm.get('PatintIdentificationBandID').value,
      "AcceptanceID": this.checklistForm.get('AcceptanceID').value,
      "IVCannula": this.checklistForm.get('IVCannula').value,
      "GaugeID": this.checklistForm.get('GaugeID').value,
      "SiteID": this.checklistForm.get('SiteID').value,
      "AdmissionDateTime": `${moment(this.checklistForm.get('DateAdmitted').value).format('DD-MMM-YYYY')} ${this.checklistForm.get('TimeAdmitted').value}`,
      "DischargeDateTime": `${moment(this.checklistForm.get('DischargeDate').value).format('DD-MMM-YYYY')} ${this.checklistForm.get('DischargeTime').value}`,
      "EndorsedByER": this.checklistForm.get('EndorsedByER').value,
      "EndorsedByERStaffDatetime": `${moment(this.checklistForm.get('EndorsedByERDate').value).format('DD-MMM-YYYY')} ${this.checklistForm.get('EndorsedByERTime').value}`,
      "ReceivedByER": this.checklistForm.get('ReceivedByER').value,
      "ReceivedByERDatetime": `${moment(this.checklistForm.get('ReceivedByERDate').value).format('DD-MMM-YYYY')} ${this.checklistForm.get('ReceivedByERTime').value}`,
      "DischargeStatusID": this.checklistForm.get('DischargeStatusID').value,
      "DischargeReasonID": this.checklistForm.get('DischargeReasonID').value
    };
    this.config.SaveEMRNursingChecklist(payload).subscribe((response: any) => {
      if (response.Code == 200) {
        this.PatientNurseCheckListID = response.PatientVitalEndoscopyDataaList[0].PreProcedureAssessment;
        $('#saveMsg').modal('show');
      }
    });
  }

  clearChecklistData() {
    this.initializeForm();
    this.signatureForm.reset();
    this.signatureList = [];
    $('#textarea_diet').html('');
    $('#textarea_promissory_note').html('');
    this.PatientNurseCheckListID = 0;
  }

  toggleConsentSignedSelection(event: any, value: any) {
    var conSigned = "";
    if(document.getElementById("checkbox_General")?.classList.contains('active')) {
      conSigned = "1";
    }
    if(document.getElementById("checkbox_MedicalInformed")?.classList.contains('active')) {
      conSigned = conSigned === '' ? '2' : conSigned + ',' + "2"
    }
    if(document.getElementById("checkbox_Anesthesia")?.classList.contains('active')) {
      conSigned = conSigned === '' ? '3' : conSigned + ',' + "3"
    }
    this.checklistForm.patchValue({
      ConsentSigned: conSigned
    })
  };

  toggleRequestForwardedSelection(event: any, value: any) {
    this.checklistForm.patchValue({
      ORRequestForwarded: value
    })
  };

  toggleAnestheticDoneSelection(event: any, value: any) {
    this.checklistForm.patchValue({
      PreAnestheticDone: value
    })
  };

  toggleApprovalSelection(event: any, value: any) {
    this.checklistForm.patchValue({
      IsApproved: value
    })
  }

  onCheckboxSelection(event: any, key: any) {
    const value = this.checklistForm.get(key).value === 1 ? 0 : 1;
    this.checklistForm.patchValue({
      [key]: value
    })
  }

  deselectSelection(key: any) {
    this.checklistForm.patchValue({
      [key]: 0
    })
  }

  onFollowupDaysChange() {
    this.checklistForm.patchValue({
      FollowupDate: moment().add(this.checklistForm.get('Followup').value, 'days')
    });
  }

  override onNurseSelect(item: any, key?: any) {
    this.nursesList = [];
    if (key) {
      this.checklistForm.get(key).setValue(item.Empid);
    }
  }

  override onDoctorSelect(item: any, key: any) {
    this.doctorsList = [];
    this.checklistForm.get(key).setValue(item.EmpID);
  }

  onOtherStaffSelect(item: any, key: any) {
    this.otherStaffList = [];
    this.checklistForm.get(key).setValue(item.Empid);
  }

  onSearchOtherStaff(event: any) {
    this.otherStaffList = [];
    if (event.target.value.length >= 3) {
      this.config.fetchDoctor(event.target.value.trim(), this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.otherStaffList = response.FetchDoctorDataList;
          }
        },
          () => {

          })
    }
  }

  onMedicationTimeChange(event: any, item: any) {
    item.TGN = event.target.value;
  }

  toggleRespondWellSelection(item: any) {
    item.selected = !item.selected;
  }

  onRectionNoteChange(event: any, item: any) {
    item.ADRNChange = event.target.textContent;
  }

  onRemarksChange(event: any, item: any) {
    item.RMKChange = event.target.textContent;
  }

  onActionTakenChange(event: any, item: any) {
    item.ACTChange = event.target.textContent;
  }
  toggleSelectionForm(formCtrlName: string, val: any) {
    if (val != undefined) {
      this.checklistForm.controls[formCtrlName].setValue(val);
      this.checklistForm.patchValue({
        GaugeID: 0,
        SiteID: 0
      })
    }
  }

  onDischargeStatusSelection() {
    this.checklistForm.patchValue({
      DischargeReasonID: 0
    });
  }

  getDischargeReasons() {
    const dischargeStatusId = this.checklistForm.get('DischargeStatusID').value;
    const item = this.dischargeList.find(item => item.id == dischargeStatusId);
    return item?.children || [];
  }
}
