import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { BaseComponent } from 'src/app/shared/base.component';
import { VteSurgicalRiskAssessmentService } from '../vte-surgical-risk-assessment/vte-surgical-risk-assessment.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-vte-surgical-new',
  templateUrl: './vte-surgical-new.component.html',
  styleUrls: ['./vte-surgical-new.component.scss']
})
export class VteSurgicalNewComponent extends BaseComponent implements OnInit {
  @Input() data: any;
  @Input() viewMode: any = false;
  readonly = false;
  vteSurgicalRiskAssessmentForm!: FormGroup;
  @Input() fromCaseSheet = false;
  highrisk: number = 2;
  nursingInterventions: any = [];
  isMechanicalThrombo: boolean = false;
  withMechanicalProphylaxis: boolean = false;
  selectedProphylaxisValues: any = [];
  selectedPrimaryDocProphylaxisValues: any = [];
  selectedHITForHRBleeding: any = [];
  showSignature = true;
  selectedNursingInterventions: any = [];
  savedRiskAssessmentDetails: any = [];
  selectedVteAssessment: any;
  showSaveBtn = true;
  showModifyBtn = false;
  base64StringSurgeonSig = '';
  base64StringResidentSig = '';
  patientBmiData: any = [];
  errorMessages: any = [];
  patientBmi = 0;
  errorMsg = "";
  totalRiskScore = 0.00;
  selectedInstructionName = "";
  riskLevelValue: any;
  saveMsg = "";
  IsHome = true;
  IsNurse: any;
  IsHeadNurse: any;
  endofEpisode: any;
  patientDiagnosis: any = [];
  creatinineClearance: any;
  creatinineClearanceValue: any;
  creatinineClearanceValueDisplay: any;
  vteSavedUser = "";
  showVerify = false;
  verifiedUserNameDate = "";
  VerifiedBy: any = '';
  VerifiedByName: any = '';
  VerifiedDate: any = '';
  isNewVerified: boolean = false;
  isVerified: boolean = false;
  vteOrderId = "";
  surgeryCategory: any = 0;
  isRODoctor: boolean = false;
  isPrimaryDoctor: boolean = false;
  approveStatus: string = "0";
  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @Output() dataChanged = new EventEmitter<boolean>();
  @ViewChild('SignSurgeon', { static: false }) signComponent: SignatureComponent | undefined;
  surgeryTypesList = [
    { "id": 1, name: 'Elective Hip Replacement', selected: false },
    { "id": 2, name: 'Elective Knee Replacement', selected: false },
    { "id": 3, name: 'Hip Fracture Surgery', selected: false },
    { "id": 4, name: 'Elective Spine  replacement', selected: false },
    // { "id" : 5, name : 'Isolated Lower Extremity Injuries Distal to the Knee', selected: false },
    // { "id" : 6, name : 'BARIATRIC Surgery', selected: false },
  ];
  patinfo: any;
  isFondaparinux: boolean = false;

  Number = Number;

  constructor(private us: UtilityService, public formBuilder: FormBuilder, private service: VteSurgicalRiskAssessmentService, private modalSvc: NgbModal, private router: Router) {
    super();
    this.vteSurgicalRiskAssessmentForm = this.formBuilder.group({
      FrequencyDate: new Date(),
      FrequencyTime: moment(new Date()).format('HH:mm'),
      RiskAssessmentDetails: [''],
      RiskAssessmentNIDetails: [''],
      OverAllScore: [''],
      RiskLevelID: [''],
      RiskAssessmentOrderID: [''],
      Patienttheratic: [''],
      IndicationReassesment: ['0'],
      IsAssessment: ['1'],
      AssessmentType: [''],
      preparedByName: this.doctorDetails[0].EmpNo + "-" + this.doctorDetails[0].EmployeeName,
      preparedByDesignation: this.doctorDetails[0].EmpDesignation,
      preparedByDate: moment(new Date()).format('DD-MMM-YYYY HH:mm'),
      preparedBy: this.doctorDetails[0].UserId,
      preparedBySignature: '',
      ResidentEmpid: this.doctorDetails[0].UserId,
      ResidentEmployeeName: this.doctorDetails[0].EmpNo + "-" + this.doctorDetails[0].EmployeeName,
      ResidentEmpSavedDatetime: moment(new Date()).format('DD-MMM-YYYY HH:mm'),
      ResidentEmployeeDesignation: this.doctorDetails[0].EmpDesignation,
      ResidentEmpSingature: '',
      IsHistoryOfHeparin: 0,
      OverRideRemarks: '',
      OverRideProphylaxisInstruction: '',
    });
    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
  }

  ngOnInit(): void {
    this.IsNurse = sessionStorage.getItem("IsNurse");
    this.isRODoctor = this.doctorDetails[0]?.IsRODoctor;

    if (this.selectedView.PatientID == undefined) {
      this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
      if (this.selectedView.AgeValue == undefined)
        this.selectedView.AgeValue = this.selectedView.Age;
    }

    if (this.selectedView.PatientType == '1') {
      this.isPrimaryDoctor = this.doctorDetails[0]?.EmpId == this.selectedView.DoctorID;
    }
    else {
      this.isPrimaryDoctor = this.doctorDetails[0]?.EmpId == this.selectedView.ConsultantID;
    }
    if (this.IsNurse === 'true') {
      this.endofEpisode = true;
    } else {
      if (sessionStorage.getItem("ISEpisodeclose") == 'false')
        this.endofEpisode = false;
      else
        this.endofEpisode = true;

    }
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');

    if (this.selectedView.PatientID == undefined) {
      this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
      if (this.selectedView.AgeValue == undefined)
        this.selectedView.AgeValue = this.selectedView.Age;
    }

    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.fetchDiagnosis();
    this.fetchPatientTestResultVTE();
    this.fetchPatientHeightWeight();
    //this.fetchNursingInterventionsVTE();

    if (this.data) {
      this.readonly = this.data.readonly;
      this.admissionID = this.data.data.Admissionid;
      if (this.admissionID == undefined) {
        this.admissionID = this.data.data.AdmissionID;
      }
      this.selectedVteAssessment = this.data.data;
      this.loadSelectedVteAssessment();
    }
    else {
    }
  }

  fetchDiagnosis() {

    const url = this.service.getData(vtesurgicalriskassessment.FetchAdviceDiagnosis, {
      Admissionid: this.admissionID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          this.patientDiagnosis = response.PatientDiagnosisDataList;
        }
      },
        (err) => {
        })
  }

  fetchPatientTestResultVTE() {
    const url = this.service.getData(vtesurgicalriskassessment.FetchPatientTestResultVTE, {
      AdmissionID: this.admissionID ?? this.selectedView.AdmissionID,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientTestResultVTENList.length > 0) {
          this.creatinineClearance = response.FetchPatientTestResultVTENList;
          this.creatinineClearanceValueDisplay = this.creatinineClearance[0]?.Value;
          this.creatinineClearanceValue = this.creatinineClearance[0]?.Value;
          // If creatinineClearanceValue is null then setting to 30
          if (!this.creatinineClearanceValue) {
            this.creatinineClearanceValue = 30;
          }
        }
        else {
          this.creatinineClearanceValue = 30;
          $("#showCCValidationMsg1").modal('show');
        }
      },
        (err) => {
        })
  }

  fetchPatientHeightWeight() {
    this.service.getPatientHight(this.selectedView.PatientID).subscribe((res: any) => {
      console.log(res);
      if (res.SmartDataList.length > 0) {
        this.patientBmiData = res.SmartDataList[0];
        this.patientBmi = this.patientBmiData.BMI.split('-')[0];

      }
    })
  }

  fetchNursingInterventionsVTE() {
    const url = this.service.getData(vtesurgicalriskassessment.FetchNursingInterventionsVTE, {
      AdmissionID: this.admissionID,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchNursingInterventionsVTENList.length > 0) {
          this.nursingInterventions = response.FetchNursingInterventionsVTENList;
        }
        else {

        }
      },
        (err) => {
        })
  }

  toggleSelectionForm(formCtrlName: string, val: string) {
    if (val != undefined) {
      this.vteSurgicalRiskAssessmentForm.controls[formCtrlName].setValue(val);
    }
    this.highrisk = 2;
    this.isMechanicalThrombo = false;
    this.withMechanicalProphylaxis = false;
    this.isFondaparinux = false;
    this.vteSurgicalRiskAssessmentForm.patchValue({
      IsHistoryOfHeparin: 0
    });
  }

  selectHighRiskBleeding(type: any) {
    this.highrisk = type;
    this.vteSurgicalRiskAssessmentForm.patchValue({
      IsHistoryOfHeparin: 0
    });
    this.isFondaparinux = false;
    if (this.highrisk == 1) {
      this.isMechanicalThrombo = true;
    }
    else {
      this.isMechanicalThrombo = false;
    }
  }

  selectHistoryOfHIT(value: any) {
    if (this.vteSurgicalRiskAssessmentForm.get('IsHistoryOfHeparin')?.value === value) {
      this.vteSurgicalRiskAssessmentForm.patchValue({
        IsHistoryOfHeparin: 0
      });
    } else {
      this.vteSurgicalRiskAssessmentForm.patchValue({
        IsHistoryOfHeparin: value
      });
    }
    this.isMechanicalThrombo = false;
    this.isFondaparinux = false;
  }

  selectSurgeryType(item: any) {
    this.surgeryTypesList.forEach((element: any) => {
      if (element.id === item.id) {
        element.selected = !item.selected;
      } else {
        element.selected = false;
      }
    });
    this.highrisk = 2;
    this.isMechanicalThrombo = false;
    this.withMechanicalProphylaxis = false;
    this.isFondaparinux = false;
    this.vteSurgicalRiskAssessmentForm.patchValue({
      IsHistoryOfHeparin: 0,
      Patienttheratic: ''
    });
  }

  selectProphylaxisMethod(val: number, groupValues: number[]) {
    if (this.selectedProphylaxisValues.includes(val.toString())) {
      // unselect if already selected
      this.selectedProphylaxisValues = this.selectedProphylaxisValues.filter((v: any) => v !== val.toString());
    } else {
      this.selectedProphylaxisValues = this.selectedProphylaxisValues.filter((v: any) => !groupValues.includes(v.toString()));

      // add the new one
      this.selectedProphylaxisValues.push(val.toString());
    }
  }

  getProphylaxisMethodVal(value: any) {
    return this.selectedProphylaxisValues.includes(value.toString());
  }

  selectHistoryOfHITForHRBlleding(value: any) {
    const index = this.selectedHITForHRBleeding.indexOf(value.toString());
    if (index > -1) {
      this.selectedHITForHRBleeding.splice(index, 1);
    }
    else {
      this.selectedHITForHRBleeding.push(value);
    }
  }

  getHistoryOfHITForHRBlledingVal(value: any) {
    return this.selectedHITForHRBleeding.includes(value);
  }

  selectNursingIntervention(item: number) {
    // const index = this.selectedNursingInterventions.indexOf(item); 
    // if (index > -1) {
    //   this.selectedNursingInterventions.splice(index, 1);
    // } 
    // else {
    //   this.selectedNursingInterventions.push(item);
    // }

    this.selectedNursingInterventions = [];
    this.selectedNursingInterventions.push(item);
  }

  getNursingIntervention(item: any) {
    if (this.selectedNursingInterventions.length > 0) {
      const findVal = this.selectedNursingInterventions?.find((x: any) => x == item);
      if (findVal) {
        return true;
      }
    }
    return false;

  }

  clearResidentSignature() {
    if (this.signComponent) {
      this.signComponent.clearSignature();
      this.vteSurgicalRiskAssessmentForm.patchValue({ ResidentEmpSingature: '' });
    }
  }

  base64ResidentSignature(event: any) {
    this.vteSurgicalRiskAssessmentForm.patchValue({ ResidentEmpSingature: event });
    if(this.approveStatus == '3') {
      this.vteSurgicalRiskAssessmentForm.patchValue({ preparedBySignature: event });
    }
  }

  clearSurgeonSignature() {
    if (this.signComponent) {
      this.signComponent.clearSignature();
      this.vteSurgicalRiskAssessmentForm.patchValue({ preparedBySignature: '' });
    }
  }

  base64SurgeonSignature(event: any) {
    this.vteSurgicalRiskAssessmentForm.patchValue({ preparedBySignature: event });
  }

  selectApproveStatus(status: string) {
    this.approveStatus = status;
    if(status === '3') {
      this.onSurgeryCategorySelection(1);
    }
  }

  selectPrimaryDocProphylaxisMethod(value: number) {
    const index = this.selectedPrimaryDocProphylaxisValues.indexOf(value);
    if (index > -1) {
      this.selectedPrimaryDocProphylaxisValues.splice(index, 1);
    }
    else {
      this.selectedPrimaryDocProphylaxisValues.push(value);
    }
  }

  getPrimaryDocProphylaxisMethodVal(item: any) {
    const findVal = this.selectedPrimaryDocProphylaxisValues?.find((x: any) => x == item);
    if (findVal) {
      return true;
    }
    return false;
  }

  saveVteSurgicalAssessmentForm(type: string = 'save') {
    this.errorMessages = [];

    const preparedBySign = this.vteSurgicalRiskAssessmentForm.get('ResidentEmpSingature')?.value;
    if (preparedBySign === '') {
      this.errorMessages.push("Please enter Prepared By Signature");
    }

    var RiskAssessmentDetails: any[] = [];

    var nursingInterventions: any = [];
    this.selectedNursingInterventions.forEach((element: any) => {
      nursingInterventions.push({
        "NIID": element
      });
    });

    // if (this.selectedNursingInterventions.length === 0) {
    //   this.errorMessages = [];
    //   this.errorMessages.push("Please Select atlease one intervention in Step-2")
    //   $("#vteSurgicalValidation").modal('show');
    //   return;
    // }

    const procIds = this.surgeryTypesList.filter((x: any) => x.selected).map((item: any) => item.id).join(',');

    if(this.highrisk == 1) {
      if(this.selectedHITForHRBleeding.length === 0) {
        this.errorMessages.push('Please enter high risk factors');
        $("#vteSurgicalValidation").modal('show');
        return;
      }
    }

    if (this.highrisk === 2) {
      this.errorMessages.push("Please select High risk bleeding - Yes/No");
      $("#vteSurgicalValidation").modal('show');
      return;
    }

    let riskLevel = ''; let riskLevelScore = '';
    // if(this.highrisk == 1) {
    //   riskLevelScore = this.isHighBleedingLowRisk ? '1' : this.isHighBleedingModerateRisk ? '2' : this.isHighBleedingHighRisk ? '3' : ''
    //   riskLevel = 'H' + riskLevelScore;
    // }
    // else {
    //   riskLevelScore = this.isLowBleedingLowRisk ? '1' : this.isLowBleedingModerateRisk ? '2' : this.isLowBleedingHighRisk ? '3' : this.isLowBleedingHighestRisk ? '4' : ''
    //   riskLevel = 'L' + riskLevelScore;
    // }

    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        var payload = {
          "AdmissionID": this.admissionID,
          "DoctorID": this.selectedView.ConsultantID,
          "PreparedBy": '0',
          "PreparedBySignature": '',
          "SpecialiseID": this.selectedView.SpecialiseID,
          "WardTaskEntryID": "0",
          "NursingTaskID": "30",
          "FrequencyDate": moment(new Date()).format('DD-MMM-YYYY'),
          "FrequencyTime": "0",
          "OverAllScore": this.totalRiskScore,
          "RiskLevelID": "9",
          "USERID": this.doctorDetails[0].UserId,
          "WORKSTATIONID": this.wardID,
          "HospitalID": this.hospitalID,
          "PatienttheraticID": this.vteSurgicalRiskAssessmentForm.get('Patienttheratic')?.value === '' ? '0' : this.vteSurgicalRiskAssessmentForm.get('Patienttheratic')?.value,
          "IndicationReassesment": this.vteSurgicalRiskAssessmentForm.get('IndicationReassesment')?.value === '' ? '0' : this.vteSurgicalRiskAssessmentForm.get('IndicationReassesment')?.value,
          "IsAssessment": this.vteSurgicalRiskAssessmentForm.get('IsAssessment')?.value,
          "Instruction": this.selectedInstructionName,
          "RiskAssessmentDetails": RiskAssessmentDetails,
          "RiskAssessmentNIDetails": nursingInterventions,
          "ProcedureIDs": procIds,
          "IsHighRiskOfBleeding": this.highrisk,
          "RiskLevel": riskLevel,
          "RiskLevelValues": this.riskLevelValue,
          "Majorsurgery": this.surgeryCategory,
          "IsHistoryOfHeparin": this.vteSurgicalRiskAssessmentForm.get('IsHistoryOfHeparin')?.value,
          "ProphylaxisValues": this.selectedProphylaxisValues?.map((item: any) => item).join(','),
          "mechinacalProphylaxis": this.withMechanicalProphylaxis ? 1 : 0,
          "ApproveStatus": 0,
          "OverRideRemarks": '',
          "OverRideProphylaxisInstruction": '',
          "ResidentEmpid": this.vteSurgicalRiskAssessmentForm.get('ResidentEmpid')?.value,
          "ResidentEmpSingature": this.vteSurgicalRiskAssessmentForm.get('ResidentEmpSingature')?.value,
          "HighBleedingYesParameter" : this.selectedHITForHRBleeding?.map((item: any) => item).join(','),
        }

        this.us.post(vtesurgicalriskassessment.SaveRiskAssessmentOrderDetailsSur, payload).subscribe((response) => {
          if (response.Status === "Success") {
            this.saveMsg = "VTE Risk Assessment Saved Successfully";
            $("#vteriskAssessmentSaveMsg1").modal('show');
            this.clearVteRiskAssessment();
            if(type === 'modify') {
              this.vteOrderId = response.PatientVitalEndoscopyDataaList?.PreProcedureAssessment
              this.savePrimaryDoctorVTEAssessmentsForm(type);
            }
          }
          else {
            if (response.Status == 'Fail') {

            }
          }
        },
          (err) => {

          })
      }
      modalRef.close();
    });
  }

  savePrimaryDoctorVTEAssessment() {
    if(this.approveStatus === '3') {
      this.saveVteSurgicalAssessmentForm('modify');
    }
    else {
      this.savePrimaryDoctorVTEAssessmentsForm();
    }

  }

  savePrimaryDoctorVTEAssessmentsForm(type: string = 'save') {

    //Mandatory -- override remarks & instructions & surgeon singature

    const overRideRemarks = this.vteSurgicalRiskAssessmentForm.get('OverRideRemarks')?.value;
    const overRideSign = this.vteSurgicalRiskAssessmentForm.get('preparedBySignature')?.value;
    const overRideInstruction = this.vteSurgicalRiskAssessmentForm.get('OverRideProphylaxisInstruction')?.value;

    this.errorMessages = [];
    if (overRideRemarks == '' && this.approveStatus == '2') {
      this.errorMessages.push('Please enter Override Remarks');
    }
    if (overRideSign == '' && this.approveStatus == '2') {
      this.errorMessages.push('Please enter Signature');
    }
    if (overRideInstruction == '' && this.approveStatus == '2') {
      this.errorMessages.push('Please enter Override Instructions');
    }    

    if (this.errorMessages.length > 0) {
      $("#vteSurgicalValidation").modal('show');
      return;
    }

    var payload = {
        "RiskAssessmentOrderID": this.vteOrderId,
        "AdmissionID": this.admissionID,
        "PreparedBy": this.vteSurgicalRiskAssessmentForm.get('preparedBy')?.value,
        "PreparedBySignature": this.vteSurgicalRiskAssessmentForm.get('preparedBySignature')?.value,
        "IsHistoryOfHeparin": this.vteSurgicalRiskAssessmentForm.get('IsHistoryOfHeparin')?.value,
        "ProphylaxisValues": this.selectedProphylaxisValues?.map((item: any) => item).join(','),
        "ApproveStatus": type === 'modify' ? '1' : this.approveStatus,
        "OverRideRemarks": overRideRemarks,
        "OverRideProphylaxisInstruction": overRideInstruction,
        "Majorsurgery": this.surgeryCategory,
        "mechinacalProphylaxis": this.withMechanicalProphylaxis,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.wardID,
      }

    if(this.approveStatus === '3') {
      this.us.post(vtesurgicalriskassessment.UpdateRiskAssessmentOrderResidentEmployeeDetails, payload).subscribe((response) => {
          if (response.Status === "Success") {
            this.saveMsg = "VTE Risk Assessment Saved Successfully";
            $("#vteriskAssessmentSaveMsg1").modal('show');
            this.clearVteRiskAssessment();
          }
          else {
            if (response.Status == 'Fail') {

            }
          }
        },
          (err) => {

          })
    }
    else {
      const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.us.post(vtesurgicalriskassessment.UpdateRiskAssessmentOrderResidentEmployeeDetails, payload).subscribe((response) => {
            if (response.Status === "Success") {
              this.saveMsg = "VTE Risk Assessment Saved Successfully";
              $("#vteriskAssessmentSaveMsg1").modal('show');
              this.clearVteRiskAssessment();
            }
            else {
              if (response.Status == 'Fail') {

              }
            }
          },
            (err) => {

            })
        }
        modalRef.close();
      });
    }    
  }

  fetchVteRiskAssessment() {
    const url = this.service.getData(vtesurgicalriskassessment.FetchFinalSaveVTERiskAssessment, {
      AdmissionID: this.admissionID,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchFinalSaveVTERiskAssessmentDataList.length > 0) {
          this.savedRiskAssessmentDetails = response.FetchFinalSaveVTERiskAssessmentDataList.filter((x: any) => x.AssessmentType === 'VTE Surgery');
          const startDate = new Date(this.savedRiskAssessmentDetails[0].CREATEDATE);
          const now = new Date();
          const differenceMs: number = now.getTime() - startDate.getTime();
          const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
          const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
          const totalHours = hours + (days * 24);
          if (totalHours > 24) {
            this.showSaveBtn = false;
            this.showModifyBtn = false;
          }
        }
        else {

        }
      },
        (err) => {
        })
  }

  viewSavedVteSurgicalRiskAssessments() {
    $("#divViewVteSurgicalRiskAssessments1").modal('show');
    this.fetchVteRiskAssessment();
  }

  clearVteRiskAssessment() {
    this.vteSurgicalRiskAssessmentForm.patchValue({
      FrequencyDate: new Date(),
      FrequencyTime: moment(new Date()).format('HH:mm'),
      RiskAssessmentDetails: '',
      RiskAssessmentNIDetails: '',
      OverAllScore: '',
      RiskLevelID: '',
      RiskAssessmentOrderID: '',
      Patienttheratic: '',
      IndicationReassesment: '0',
      IsAssessment: ['1'],
      AssessmentType: '',
      preparedByName: this.doctorDetails[0].EmpNo + "-" + this.doctorDetails[0].EmployeeName,
      preparedByDesignation: this.doctorDetails[0].EmpDesignation,
      preparedByDate: moment(new Date()).format('DD-MMM-YYYY HH:mm'),
      preparedBy: this.doctorDetails[0].UserId,
      preparedBySignature: '',
      ResidentEmpid: '',
      ResidentEmployeeName: '',
      ResidentEmpSavedDatetime: moment(new Date()).format('DD-MMM-YYYY HH:mm'),
      ResidentEmployeeDesignation: '',
      ResidentEmpSingature: '',
      IsHistoryOfHeparin: 0,
      OverRideRemarks: '',
      OverRideProphylaxisInstruction: '',
    });
    this.base64StringSurgeonSig = '';
    this.base64StringResidentSig = '';
    this.showSignature = false;
    setTimeout(() => {
      this.showSignature = true;
      this.vteSurgicalRiskAssessmentForm.get('FrequencyDate')?.enable();
    }, 0);
    this.fetchDiagnosis();
    this.fetchPatientTestResultVTE();
    this.fetchPatientHeightWeight();
    //this.fetchNursingInterventionsVTE();
    this.surgeryTypesList
    this.surgeryTypesList = this.surgeryTypesList.map((surg: any) => ({
      ...surg,
      selected: false
    }));
    this.highrisk = 2;
    this.isMechanicalThrombo = false;
    this.withMechanicalProphylaxis = false;
    this.selectedProphylaxisValues = [];
    this.selectedNursingInterventions = [];
    this.errorMessages = [];
    this.surgeryCategory = 0;
    this.selectedHITForHRBleeding = [];
  }

  selectVte(sur: any) {
    this.savedRiskAssessmentDetails.forEach((element: any, index: any) => {
      if (element.RiskAssessmentOrderID === sur.RiskAssessmentOrderID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.selectedVteAssessment = sur;
    this.showSaveBtn = false;
    this.showModifyBtn = true;
  }

  loadSelectedVteAssessment() {
    this.vteOrderId = this.selectedVteAssessment.RiskAssessmentOrderID;
    this.fetchFinalRiskAssessmentDetails(this.selectedVteAssessment.RiskAssessmentOrderID);
    $("#divViewVteSurgicalRiskAssessments1").modal('hide');
  }

  fetchFinalRiskAssessmentDetails(rsoid: string) {
    const url = this.service.getData(vtesurgicalriskassessment.FetchDVTRiskAssessmentFactorsNewSur, {
      RiskFactorSubGroupID: rsoid,
      AdmissionID: this.admissionID,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchDVTRiskAssessmentFactorsNewDataList.length > 0) {
            this.vteSavedUser = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.UserID;
            this.showVerify = true;
            if (this.savedRiskAssessmentDetails.length > 0) {
              const verifiedUser = this.savedRiskAssessmentDetails.find((x: any) => x.RiskAssessmentOrderID === rsoid);
              if (verifiedUser?.VerifiedByName != '') {
                this.verifiedUserNameDate = '( Verified By: ' + verifiedUser?.VerifiedByName + ' on (' + verifiedUser?.VerifiedDate + ') )';
                this.VerifiedByName = verifiedUser.VerifiedByName;
                this.VerifiedDate = verifiedUser.VerifiedDate;
                this.isVerified = verifiedUser.IsVerified == 'True' ? true : false;
                this.isNewVerified = verifiedUser.IsVerified == 'True' ? true : false;
              }
            } else if (this.vteOrderId != "" && this.vteOrderId != undefined && sessionStorage.getItem("navigation") != null) {
              this.verifiedUserNameDate = '( Verified By: ' + response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedByName + ' on (' + response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedDate + ') )';
              this.VerifiedByName = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedByName;
              this.VerifiedDate = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedDate;
              this.isVerified = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.IsVerified == 'True' ? true : false;
              this.isNewVerified = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.IsVerified == 'True' ? true : false;
            }

            if (response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.ProcedureIDs != '') {
              response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.ProcedureIDs.split(',').forEach((element: any) => {
                const surId = this.surgeryTypesList.find((x: any) => x.id == element);
                if (surId) {
                  surId.selected = true;
                }
              });
            }
            this.highrisk = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.IsHighRiskOfBleeding == 'True' ? 1 : 0;
            if (this.highrisk == 1) {
              this.isMechanicalThrombo = true;
            }
            this.riskLevelValue = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.RiskLevelValues;
            // if(this.highrisk == 1) {
            //   this.isHighBleedingLowRisk = true;
            // }
            // else if(this.highrisk == 0) {
            //   if(response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.RiskLevel != '') {
            //     const lowrisk = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.RiskLevel.split('');
            //     if(lowrisk.length > 0) {
            //       const lowRiskVal = lowrisk[1];
            //       if(lowRiskVal == 1) {
            //         this.isLowBleedingLowRisk = true;
            //       }
            //       else if(lowRiskVal == 2) {
            //         this.isLowBleedingLowRisk = true;
            //       }
            //       else if(lowRiskVal == 3) {
            //         this.isLowBleedingHighRisk = true;
            //       }
            //       else if(lowRiskVal == 4) {
            //         this.isLowBleedingHighestRisk = true;
            //       }
            //     }
            //   }
            //   if(this.riskLevelValue != '') {
            //     this.isLowBleedingModerateRiskItem1 = this.riskLevelValue == '2' ? true : false;
            //     this.isLowBleedingModerateRiskItem2 = this.riskLevelValue == '3' ? true : false;
            //     this.isLowBleedingModerateRiskItem3 = this.riskLevelValue == '4' ? true : false;
            //     this.isLowBleedingModerateRiskItem4 = this.riskLevelValue == '5' ? true : false;
            //     this.isLowBleedingModerateRiskItem5 = this.riskLevelValue == '6' ? true : false;
            //     this.isLowBleedingModerateRiskItem6 = this.riskLevelValue == '7' ? true : false;
            //     this.isLowBleedingHighRiskItem1 = this.riskLevelValue == '8' ? true : false;
            //     this.isLowBleedingHighRiskItem2 = this.riskLevelValue == '9' ? true : false;
            //     this.isLowBleedingHighRiskItem3 = this.riskLevelValue == '10' ? true : false;
            //     this.isLowBleedingHighRiskItem4 = this.riskLevelValue == '11' ? true : false;
            //     this.isLowBleedingHighRiskItem5 = this.riskLevelValue == '12' ? true : false;
            //     this.isLowBleedingHighRiskItem6 = this.riskLevelValue == '13' ? true : false;
            //     this.isLowBleedingHighestRiskItem1 = this.riskLevelValue == '14' ? true : false;
            //     this.isLowBleedingHighestRiskItem2 = this.riskLevelValue == '15' ? true : false;
            //     this.isLowBleedingHighestRiskItem3 = this.riskLevelValue == '16' ? true : false;
            //     this.isLowBleedingHighestRiskItem4 = this.riskLevelValue == '17' ? true : false;
            //     this.isLowBleedingHighestRiskItem5 = this.riskLevelValue == '18' ? true : false;
            //     this.isLowBleedingHighestRiskItem6 = this.riskLevelValue == '19' ? true : false;
            //   }
            // }
          }
          // this.FetchAssessmentRiskFactorValuesDataSS1List.forEach((element: any, index: any) => {
          //   const rf = response.FetchDVTRiskAssessmentFactorDataList.find((x: any) => x.RiskFactorID === element.RiskFactorID);
          //   if(rf!=undefined){
          //     element.selected = rf.RiskFactorValueID === '2' ? false : true;
          //     element.RfValue = rf.RiskFactorValueID;
          //   }

          // });
          // this.FetchAssessmentRiskFactorValuesDataSS2List.forEach((element: any, index: any) => {
          //   const rf = response.FetchDVTRiskAssessmentFactorDataList.find((x: any) => x.RiskFactorID === element.RiskFactorID);
          //   if(rf!=undefined){
          //     element.selected = rf.RiskFactorValueID === '2' ? false : true;
          //     element.RfValue = rf.RiskFactorValueID;
          //   }
          // });
          // this.FetchAssessmentRiskFactorValuesDataSS3List.forEach((element: any, index: any) => {
          //   const rf = response.FetchDVTRiskAssessmentFactorDataList.find((x: any) => x.RiskFactorID === element.RiskFactorID);
          //   if(rf!=undefined){
          //   element.selected = rf.RiskFactorValueID === '2' ? false : true;
          //   element.RfValue = rf.RiskFactorValueID;
          //   }
          // });
          // this.FetchAssessmentRiskFactorValuesDataSS4List.forEach((element: any, index: any) => {
          //   const rfb = response.FetchDVTRiskAssessmentFactorDataList.find((x: any) => x.RiskFactorID === element.RiskFactorID);
          //   if(rfb!=undefined){
          //   element.selected = rfb.RiskFactorValueID === '2' ? false : true;
          //   element.RfValue = rfb.RiskFactorValueID;
          //   }
          // });
          this.totalRiskScore = response.FetchDVTRiskAssessmentFactorsNewDataList[0].OverAllScore ?? 0;
          this.vteSurgicalRiskAssessmentForm.patchValue({
            IndicationReassesment: response.FetchDVTRiskAssessmentFactorsNewDataList[0].IndicationReassesment,
            IsAssessment: response.FetchDVTRiskAssessmentFactorsNewDataList[0].IsAssessment,
            FrequencyDate: new Date(response.FetchDVTRiskAssessmentFactorsNewDataList[0].CREATEDATE),
            RiskAssessmentOrderID: response.FetchDVTRiskAssessmentFactorsNewDataList[0].RiskAssessmentOrderID,
            preparedByName: response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedByName,
            preparedByDesignation: response.FetchDVTRiskAssessmentFactorsNewDataList[0].Designation,
            preparedByDate: response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedDate,
            preparedBy: response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedBy,
            preparedBySignature: response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedBySignature,
            OverRideRemarks: response.FetchDVTRiskAssessmentFactorsNewDataList[0].OverRideRemarks,
            OverRideProphylaxisInstruction: response.FetchDVTRiskAssessmentFactorsNewDataList[0].OverRideProphylaxisInstruction
          });

          this.approveStatus = response.FetchDVTRiskAssessmentFactorsNewDataList[0].ApproveStatus;
          this.surgeryCategory = Number(response.FetchDVTRiskAssessmentFactorsNewDataList[0].Majorsurgery);

          if (this.isPrimaryDoctor) {
            this.vteSurgicalRiskAssessmentForm.patchValue({
              preparedByName: response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedByName == '' ? this.doctorDetails[0].EmpNo + "-" + this.doctorDetails[0].EmployeeName : response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedByName,
              preparedByDesignation: response.FetchDVTRiskAssessmentFactorsNewDataList[0].Designation == '' ? this.doctorDetails[0].EmpDesignation : response.FetchDVTRiskAssessmentFactorsNewDataList[0].Designation,
              preparedByDate: response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedDate == '' ? moment(new Date()).format('DD-MMM-YYYY HH:mm') : response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedDate,
              preparedBy: response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedBy == '' ? this.doctorDetails[0].UserId : response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedBy,
              preparedBySignature: response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedBySignature,
            });
          }

          this.vteSurgicalRiskAssessmentForm.patchValue({
            Patienttheratic: response.FetchDVTRiskAssessmentFactorsNewDataList[0].Patienttheratic,
            IsHistoryOfHeparin: response.FetchDVTRiskAssessmentFactorsNewDataList[0].IsHistoryOfHeparin != '' ? Number(response.FetchDVTRiskAssessmentFactorsNewDataList[0].IsHistoryOfHeparin) : 0
          });

          this.base64StringSurgeonSig = response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedBySignature;
          this.base64StringResidentSig = response.FetchDVTRiskAssessmentFactorsNewDataList[0].ResidentEmpSingature;

          this.showSignature = false;
          setTimeout(() => {
            this.showSignature = true;
          }, 0);

          this.vteSurgicalRiskAssessmentForm.get('FrequencyDate')?.disable();
          // this.selectedNursingInterventions = response.FetchDVTRiskFactorDataList?.map((item: any) => item.NursingInterventionID).join(', ');
          response.FetchDVTRiskFactorDataList.forEach((element: any) => {
            this.selectedNursingInterventions.push(element.NursingInterventionID);
          });
          response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.ProphylaxisValues.split(',').forEach((element: any) => {
            this.selectedProphylaxisValues.push(element);
          });
          response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.HighBleedingYesParameter.split(',').forEach((element: any) => {
            this.selectedHITForHRBleeding.push(element);
          });


          this.withMechanicalProphylaxis = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.mechinacalProphylaxis == 'True' ? true : false;
          // response.FetchDVTRiskFactorDataList.forEach((element: any, index: any) => {
          //   const find = this.nursingInterventions.find((x: any) => x.NursingInterventionID === element.NursingInterventionID);
          //   if (find) {
          //     if (find.NursingInterventionID === '10023')
          //       this.Pharmacologicalprophylaxis = true;
          //     else if (find.NursingInterventionID === '10024')
          //       this.EnoxaparinOD = true;
          //     else if (find.NursingInterventionID === '10025')
          //       this.HeparinTID1 = true;
          //     else if (find.NursingInterventionID === '10026')
          //       this.EnoxaparinBID = true;
          //     else if (find.NursingInterventionID === '10027')
          //       this.HeparinTID = true;
          //     else if (find.NursingInterventionID === '10028')
          //       this.HeparinTID1 = true;
          //     else if (find.NursingInterventionID === '10029')
          //       this.FondaparinuxOD = true;
          //     else if (find.NursingInterventionID === '10030')
          //       this.MechanicalProphylaxis = true;
          //     else if (find.NursingInterventionID === '10031')
          //       this.Earlymobilization = true;
          //     else if (find.NursingInterventionID === '10031')
          //       this.Earlymobilization = true;
          //     else if (find.NursingInterventionID === '10032')
          //       this.MechanicalandPharmacologicalprophylaxis = true;
          //     else if (find.NursingInterventionID === '10033')
          //       this.Enoxaparin30BID = true;
          //     else if (find.NursingInterventionID === '10034')
          //       this.crclEnoxaparinOD = true;
          //     else if (find.NursingInterventionID === '10035')
          //       this.crclRivaroxaban = true;
          //     else if (find.NursingInterventionID === '10036')
          //       this.crclDabigatran = true;
          //     else if (find.NursingInterventionID === '10037')
          //       this.crclEnoxaparinBID = true;
          //     else if (find.NursingInterventionID === '10038')
          //       this.crclApixaban = true;
          //     else if (find.NursingInterventionID === '10039')
          //       this.crclEnoxaparin = true;
          //     else if (find.NursingInterventionID === '10040')
          //       this.crclApixabanBID = true;
          //     else if (find.NursingInterventionID === '10041')
          //       this.crclEnoxaparin40OD = true;
          //     else if (find.NursingInterventionID === '10042')
          //       this.crclEnoxaparin30OD = true;

          //     else if (find.NursingInterventionID === '10044')
          //       this.MechanicalProphylaxisAfterPhyAsmt = true;
          //     else if (find.NursingInterventionID === '10045')
          //       this.EnoxaparinOD = true
          //     else if (find.NursingInterventionID === '10046')
          //       this.FondaparinuxOD = true

          //   }
          // });


        }
        else {

        }
      },
        (err) => {
        })
  }

  openQuickActions() {
    this.patinfo = this.selectedView;
    $("#quickaction_info1").modal('show');
  }

  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  onSurgeryCategorySelection(type: any) {
    if (this.surgeryCategory === type) {
      this.surgeryCategory = 0;
    } else {
      this.surgeryCategory = type;
    }
    this.highrisk = 2;
    this.isMechanicalThrombo = false;
    this.withMechanicalProphylaxis = false;
    this.isFondaparinux = false;
    this.vteSurgicalRiskAssessmentForm.patchValue({
      IsHistoryOfHeparin: 0,
      Patienttheratic: ''
    });
    this.surgeryTypesList.forEach((element: any) => element.selected = false);
    this.selectedProphylaxisValues = this.selectedNursingInterventions = [];
  }

  getHeader() {
    let header = '';
    switch (this.surgeryCategory) {
      case 1:
        header = 'Major Orthopedic Surgery';
        break;
      case 2:
        header = 'Non-Major Orthopedic Surgery';
        break;
      case 3:
        header = 'General Surgery';
        break;
      case 4:
        header = 'Bariatric Surgery';
        break;
      default:
        header = ''
        break;
    }
    return header;
  }

  isSurgeryTypeSelected() {
    return this.surgeryTypesList.filter((element: any) => element.selected).length > 0;
  }

  showBMIOptions(type: any) {
    if (this.vteSurgicalRiskAssessmentForm.get('IsHistoryOfHeparin')?.value === 3) {
      if (type === 1 && Number(this.creatinineClearanceValue) > 30 && Number(this.patientBmi) < 40) {
        return true;
      } else if (type === 2 && Number(this.creatinineClearanceValue) > 30 && Number(this.patientBmi) >= 40) {
        return true;
      } else if (type === 3 && Number(this.creatinineClearanceValue) <= 30) {
        return true;
      }
    }
    return false;
  }
  showBMIOptionsFonda(type: any) {
    if (this.vteSurgicalRiskAssessmentForm.get('IsHistoryOfHeparin')?.value === 1 || this.vteSurgicalRiskAssessmentForm.get('IsHistoryOfHeparin')?.value === 2) {
      if (type === 1 && Number(this.creatinineClearanceValue) > 30 && Number(this.patientBmi) < 40) {
        return true;
      } else if (type === 2 && Number(this.creatinineClearanceValue) > 30 && Number(this.patientBmi) >= 40) {
        return true;
      } else if (type === 3 && Number(this.creatinineClearanceValue) <= 30) {
        return true;
      }
    }
    return false;
  }
}

export const vtesurgicalriskassessment = {
  FetchAssessmentRiskFactorRiskNormalSur: 'FetchAssessmentRiskFactorRiskNormalSur?UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAssessmentRiskFactorRiskBleeding: 'FetchAssessmentRiskFactorRiskBleeding?UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdviceDiagnosis: 'FetchAdviceDiagnosis?TBL=1&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchPatientTestResultVTE: 'FetchPatientTestResultVTE?AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientHeightWeight: 'FetchPatientHeightWeight',
  FetchNursingInterventionsVTE: 'FetchNursingInterventionsVTESur?UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SaveRiskAssessmentOrderDetailsSur: 'SaveRiskAssessmentOrderDetailsSurNew',
  UpdateRiskAssessmentVerifications: 'UpdateRiskAssessmentVerifications',
  FetchFinalSaveVTERiskAssessment: 'FetchFinalSaveVTERiskAssessment?AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchDVTRiskAssessmentFactorsNewSur: 'FetchDVTRiskAssessmentFactorsNewSur?RiskFactorSubGroupID=${RiskFactorSubGroupID}&AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  UpdateRiskAssessmentOrderDetails: 'UpdateRiskAssessmentOrderDetails',
  UpdateRiskAssessmentOrderResidentEmployeeDetails: 'UpdateRiskAssessmentOrderResidentEmployeeDetails'
};