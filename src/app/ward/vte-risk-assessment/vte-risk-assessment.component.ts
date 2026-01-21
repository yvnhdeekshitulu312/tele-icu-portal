import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/shared/base.component';
import { VteRiskAssessmentService } from './vte-risk-assessment.service';
import { UtilityService } from 'src/app/shared/utility.service';
import * as moment from 'moment';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';

declare var $: any;

@Component({
  selector: 'app-vte-risk-assessment',
  templateUrl: './vte-risk-assessment.component.html',
  styleUrls: ['./vte-risk-assessment.component.scss']
})
export class VteRiskAssessmentComponent extends BaseComponent implements OnInit {
  @Input() data: any;
  @Input() viewMode: any = false;
  readonly = false;
  vteRiskAssessmentForm!: FormGroup;
  url: any;
  patientDiagnosis: any = [];
  FetchAssessmentRiskFactorValuesDataList: any = [];
  FetchAssessmentRiskFactorValuesDataNList: any = [];
  FetchAssessmentRiskFactorBleedingDataList: any = [];
  FetchAssessmentRiskFactorBleedingDataNList: any = [];
  overallScore = 0.00;
  totalRiskScore = 0.00;
  totalBleedingScore = 0.00;
  patientBmiData: any = [];
  patientBmi = 0;
  creatinineClearance: any;
  creatinineClearanceValue: any;
  showprophylaxisdiv = "";
  nursingInterventions: any = [];
  selectedMedicineName = "";
  selectedInstructionName = "";
  showSaveBtn = true;
  showModifyBtn = false;
  savedRiskAssessmentDetails: any = [];
  selectedVteAssessment: any;
  IsHeadNurse: any;
  IsHome = true;
  patinfo: any;
  isVerified = false;
  showVerify = false;
  vteSavedUser = "";
  errorMsg = "";
  saveMsg = "";
  verifiedUserNameDate = "";
  vteOrderId = "";
  endofEpisode: any;
  IsNurse: any;
  @Input() fromCaseSheet = false;

  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @Output() dataChanged = new EventEmitter<boolean>();
  VerifiedBy: any = '';
  VerifiedByName: any = '';
  VerifiedDate: any = '';
  isNewVerified : boolean = false;

  base64StringSurgeonSig = '';
  @ViewChild('SignSurgeon', { static: false }) signComponent: SignatureComponent | undefined;
  showSignature = true;

  constructor(private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private service: VteRiskAssessmentService, private modalSvc: NgbModal, private datePipe: DatePipe) {
    super();

    this.vteRiskAssessmentForm = this.formBuilder.group({
      FrequencyDate: new Date(),
      FrequencyTime: moment(new Date()).format('HH:mm'),
      RiskAssessmentDetails: [''],
      RiskAssessmentNIDetails: [''],
      OverAllScore: [''],
      RiskLevelID: [''],
      RiskAssessmentOrderID: [''],
      PatienttheraticID: [''],
      IndicationReassesment: [''],
      IsAssessment: ['1'],
      AssessmentType: [''],
      preparedByName: this.doctorDetails[0].EmpNo + "-" + this.doctorDetails[0].EmployeeName,
      preparedByDesignation: this.doctorDetails[0].EmpDesignation,
      preparedByDate: this.datePipe.transform(new Date(), "dd-MMM-yyyy HH:mm")?.toString(),
      preparedBy: this.doctorDetails[0].EmpId,
      preparedBySignature: '',
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
    if (this.IsNurse === 'true') {
      this.endofEpisode = true;
    }else {
      if(sessionStorage.getItem("ISEpisodeclose")=='false')
      this.endofEpisode = false;
    else 
    this.endofEpisode = true;

    }
      this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.fetchAssessmentRiskFactorRiskNormal();
    this.fetchAssessmentRiskFactorRiskBleeding();
    

    
    this.fetchDiagnosis();
    this.fetchPatientTestResultVTE();
    this.fetchPatientHeightWeight();
    this.fetchNursingInterventionsVTE();
    // this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    // this.fetchAssessmentRiskFactorRiskNormal();
    // this.fetchAssessmentRiskFactorRiskBleeding();
    // this.fetchDiagnosis();
    // this.fetchPatientTestResultVTE();
    // this.fetchPatientHeightWeight();
    // this.fetchNursingInterventionsVTE();
    //this.fetchVteRiskAssessment();
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    if (this.selectedView.PatientID == undefined) {
      this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    }
    this.vteOrderId = this.selectedView.VTEOrderID;
    //if(this.vteOrderId != "" && this.vteOrderId != undefined) {
    if(this.vteOrderId != "" && this.vteOrderId != undefined&&sessionStorage.getItem("navigation") != null) {   
      this.fetchFinalRiskAssessmentDetails(this.vteOrderId);
    }

    if (this.data) {
      this.readonly = this.data.readonly;
      this.admissionID = this.data.data.Admissionid;
      if(this.admissionID == undefined) {
        this.admissionID = this.data.data.AdmissionID;
      }
      this.selectedVteAssessment = this.data.data;
      this.loadSelectedVteAssessment();
      //this.us.disabledElement(this.divreadonly.nativeElement);
    }
  }

  base64SurgeonSignature(event: any) {
    this.vteRiskAssessmentForm.patchValue({ preparedBySignature: event });
  }

  clearSurgeonSignature() {
    if (this.signComponent) {
      this.signComponent.clearSignature();
      this.vteRiskAssessmentForm.patchValue({ preparedBySignature: '' });
    }
  }

  fetchAssessmentRiskFactorRiskNormal() {
    this.url = this.service.getData(vteriskassessment.FetchAssessmentRiskFactorRiskNormal, { UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchAssessmentRiskFactorValuesDataList = response.FetchAssessmentRiskFactorValuesDataList;
          this.FetchAssessmentRiskFactorValuesDataNList = response.FetchAssessmentRiskFactorValuesDataNList;
          this.FetchAssessmentRiskFactorValuesDataNList.forEach((element: any, index: any) => {
            element.AssessmentScore = "0.00";
            // element.selected = 'No';
            // element.RfValue = '2';
            // if (element.RiskFactorID === '124' && (this.selectedView.WardID === '3403' || this.selectedView.WardID === '3409')) { //3402 is ICCU wardID 
            //   element.selected = 'Yes';
            //   let find = this.FetchAssessmentRiskFactorValuesDataList.find((x: any) => x.RiskFactorID === '124' && x.RiskFactorValue === 'Yes');
            //   if (find) {
            //     element.AssessmentScore = find.AssessmentScore;
            //     element.RfValue = find.RiskFactorValueID;
            //   }
            // }
            // if (element.RiskFactorID === '125' && Number(this.selectedView.AgeValue) > 60) {
            //   element.selected = 'Yes';
            //   let find = this.FetchAssessmentRiskFactorValuesDataList.find((x: any) => x.RiskFactorID === '125' && x.RiskFactorValue === 'Yes');
            //   if (find) {
            //     element.AssessmentScore = find.AssessmentScore;
            //     element.RfValue = find.RiskFactorValueID;
            //   }
            // }
          });
          this.totalRiskScore = this.FetchAssessmentRiskFactorValuesDataNList.map((item: any) => (item.AssessmentScore != "") ? Number.parseFloat(item.AssessmentScore) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
        }
      },
        (err) => {
        })
  }
  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }
  fetchAssessmentRiskFactorRiskBleeding() {
    this.url = this.service.getData(vteriskassessment.FetchAssessmentRiskFactorRiskBleeding, { UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchAssessmentRiskFactorBleedingDataList = response.FetchAssessmentRiskFactorValuesDataList;
          this.FetchAssessmentRiskFactorBleedingDataNList = response.FetchAssessmentRiskFactorValuesDataNList;
          this.FetchAssessmentRiskFactorBleedingDataNList.forEach((element: any, index: any) => {
            element.AssessmentScore = "0.00";
            //element.selected = 'No';
            //element.RfValue = '2';
            // if (element.RiskFactorID === '124' && this.selectedView.WardID === '3403') { //3402 is ICCU wardID 
            //   element.selected = 'Yes';
            //   let find = this.FetchAssessmentRiskFactorBleedingDataList.find((x: any) => x.RiskFactorID === '124' && x.RiskFactorValue === 'Yes');
            //   if (find) {
            //     element.AssessmentScore = find.AssessmentScore;
            //     element.RfValue = find.RiskFactorValueID;
            //   }
            // }
            // if (element.RiskFactorID === '138' && this.selectedView.GenderID === '1') {
            //   element.selected = 'Yes';
            //   let find = this.FetchAssessmentRiskFactorBleedingDataList.find((x: any) => x.RiskFactorID === '138' && x.RiskFactorValue === 'Yes');
            //   if (find) {
            //     element.AssessmentScore = find.AssessmentScore;
            //     element.RfValue = find.RiskFactorValueID;
            //   }
            // }
            // if (element.RiskFactorID === '136' && Number(this.selectedView.AgeValue) >= 40 && Number(this.selectedView.AgeValue) <= 84) {
            //   element.selected = 'Yes';
            //   let find = this.FetchAssessmentRiskFactorBleedingDataList.find((x: any) => x.RiskFactorID === '136' && x.RiskFactorValue === 'Yes');
            //   if (find) {
            //     element.AssessmentScore = find.AssessmentScore;
            //     element.RfValue = find.RiskFactorValueID;
            //   }
            // }
            // if (element.RiskFactorID === '129' && Number(this.selectedView.AgeValue) === 85) {
            //   element.selected = 'Yes';
            //   let find = this.FetchAssessmentRiskFactorBleedingDataList.find((x: any) => x.RiskFactorID === '129' && x.RiskFactorValue === 'Yes');
            //   if (find) {
            //     element.AssessmentScore = find.AssessmentScore;
            //     element.RfValue = find.RiskFactorValueID;
            //   }
            // }
          });
          this.totalBleedingScore = this.FetchAssessmentRiskFactorBleedingDataNList.map((item: any) => (item.AssessmentScore != "") ? Number.parseFloat(item.AssessmentScore) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
        }
      },
        (err) => {
        })
  }

  fetchDiagnosis() {

    this.url = this.service.getData(vteriskassessment.FetchAdviceDiagnosis, {
      Admissionid: this.admissionID ?? this.selectedView.AdmissionID ?? this.data.data.Admissionid,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          this.patientDiagnosis = response.PatientDiagnosisDataList;
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

  fetchPatientTestResultVTE() {
    this.url = this.service.getData(vteriskassessment.FetchPatientTestResultVTE, {
      AdmissionID: this.admissionID ?? this.selectedView.AdmissionID ?? this.data.data.Admissionid,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientTestResultVTENList.length > 0) {
          this.creatinineClearance = response.FetchPatientTestResultVTENList;
          this.creatinineClearanceValue = this.creatinineClearance[0].Value;
        }
        else {
          this.errorMsg = "Patient not having Creatine Clerance test performed";
          $("#showCCValidationMsg").modal('show');
        }          
      },
        (err) => {
        })
  }

  fetchNursingInterventionsVTE() {
    this.url = this.service.getData(vteriskassessment.FetchNursingInterventionsVTE, {
      AdmissionID: this.admissionID,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
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
      this.vteRiskAssessmentForm.controls[formCtrlName].setValue(val);
    }
    if(formCtrlName === 'IsAssessment' && this.vteRiskAssessmentForm.get('IsAssessment')?.value === '2') {
      this.vteRiskAssessmentForm.patchValue({
        IndicationReassesment : "1"
      });
    }
    else if(formCtrlName === 'IsAssessment' && this.vteRiskAssessmentForm.get('IsAssessment')?.value === '2') {
      this.vteRiskAssessmentForm.patchValue({
        IndicationReassesment : ""
      });
    }
  }

  calculateVteRisk(item: any, val: string) {
    if (!item.selected) {
      item.selected = val;
    } else if (item.selected === 'Yes')
      item.selected = 'No';
    else
      item.selected = 'Yes';

    let find = this.FetchAssessmentRiskFactorValuesDataList.find((x: any) => x.RiskFactorID === item.RiskFactorID && x.RiskFactorValue === val);
    if (find) {
      item.AssessmentScore = find.AssessmentScore;
      item.RfValue = find.RiskFactorValueID;
    }
    this.totalRiskScore = this.FetchAssessmentRiskFactorValuesDataNList.map((item: any) => (item.AssessmentScore != "") ? Number.parseFloat(item.AssessmentScore) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
  }
  calculateVteBleedingRisk(item: any, val: string) {
    if (!item.selected) {
      item.selected = val;
    } else if (item.selected === 'Yes')
      item.selected = 'No';
    else
      item.selected = 'Yes';

    let find = this.FetchAssessmentRiskFactorBleedingDataList.find((x: any) => x.RiskFactorID === item.RiskFactorID && x.RiskFactorValue === val);
    if (find) {
      item.AssessmentScore = find.AssessmentScore;
      item.RfValue = find.RiskFactorValueID;
    }
    this.totalBleedingScore = this.FetchAssessmentRiskFactorBleedingDataNList.map((item: any) => (item.AssessmentScore != "") ? Number.parseFloat(item.AssessmentScore) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
  }

  selectedMedicine(item: string) {
    this.selectedMedicineName = item;
  }

  errorMessages: any = [];

  showRecommendVteprophylaxis() {

    this.errorMessages = [];
    const normalTogglesNotSelected = this.FetchAssessmentRiskFactorValuesDataNList.find((element: any) => !element.selected);
    const bleedingTogglesNotSelected = this.FetchAssessmentRiskFactorBleedingDataNList.find((element: any) => !element.selected);
    if (normalTogglesNotSelected) {
      this.errorMessages.push('Please select all VTE Risk components');
    }
    if (bleedingTogglesNotSelected) {
      this.errorMessages.push('Please select all Bleeding Risk Components');
    }

    const preparedBySign = this.vteRiskAssessmentForm.get('preparedBySignature')?.value;
    if(preparedBySign === '') {
      this.errorMessages.push('Please enter Prepared By Signature');
    }

    if (this.errorMessages.length > 0) {
      $('#errorMessagesModal').modal('show');
      return;
    }

    const totalScore = parseFloat(this.totalBleedingScore.toString()) + parseFloat(this.totalRiskScore.toString());
    this.overallScore = totalScore;
    const bmi = parseFloat(this.patientBmi.toString());
    if (this.totalRiskScore >= 2 && this.totalBleedingScore < 7 && bmi < 40) {
      this.showprophylaxisdiv = "1.1";
      this.selectedInstructionName = "Pharmacological Prophylaxis";
    }
    else if (this.totalRiskScore >= 2 && this.totalBleedingScore < 7 && bmi > 40) {
      this.showprophylaxisdiv = "1.2";
      this.selectedInstructionName = "Pharmacological Prophylaxis";
    }
    else if (this.totalRiskScore >= 2 && this.totalBleedingScore < 7 && bmi < 30) {
      this.showprophylaxisdiv = "1.3";
      this.selectedInstructionName = "Pharmacological Prophylaxis";
    }
    else if (this.totalRiskScore >= 2 && this.totalBleedingScore >= 7) {
      //Mechanical prophylaxis
      this.showprophylaxisdiv = "2";
      this.selectedInstructionName = "Mechanical Prophylaxis";
    }
    else if ((this.totalRiskScore == 0 || this.totalRiskScore == 1) && (this.totalBleedingScore == 0 || this.totalBleedingScore == 1)) {
      //Early mobilization
      //this.showprophylaxisdiv = "3";
      this.selectedInstructionName = "Early Mobilization";
    }

    if (this.showprophylaxisdiv !== "") {
      $("#divRecommendVteprophylaxis").modal('show');
    }
    else {
      this.saveVteRiskAssessment();
    }
  }

  clearProphylaxisSelection() {
    this.showprophylaxisdiv = "";
  }


  saveVteRiskAssessment() {

    var RiskAssessmentDetails: any[] = [];
    this.FetchAssessmentRiskFactorValuesDataNList.forEach((element: any, index: any) => {
      RiskAssessmentDetails.push({
        "RFSGID": element.RiskFactorSubGroupID,
        "RFID": element.RiskFactorID,
        "RFVID": element.RfValue,
        "VAL": element.AssessmentScore
      })
    });
    this.FetchAssessmentRiskFactorBleedingDataNList.forEach((element: any, index: any) => {
      RiskAssessmentDetails.push({
        "RFSGID": element.RiskFactorSubGroupID,
        "RFID": element.RiskFactorID,
        "RFVID": element.RfValue,
        "VAL": element.AssessmentScore
      })
    });
    var nursingInterventions: any[] = [];
    //NI - 17,18,19,20,21,22,23
    var niid = '0';
    if (this.selectedMedicineName === 'Enoxaparin40OD' || this.selectedMedicineName === 'Heparin5000BID')
      niid = '18';
    else if (this.selectedMedicineName === 'Enoxaparin40BID' || this.selectedMedicineName === 'Heparin5000TID')
      niid = '19';
    else if (this.selectedMedicineName === 'Heparin5000BID1')
      niid = '20';
    else if (this.totalRiskScore >= 2 && this.totalBleedingScore >= 7)
      niid = '22';
    else if ((this.totalRiskScore == 0 || this.totalRiskScore == 1) && (this.totalBleedingScore == 0 || this.totalBleedingScore == 1))
      niid = '23';

    var ni = this.nursingInterventions.find((x: any) => x.Type === niid);
    if(ni){
      nursingInterventions.push({
        "NIID": ni.NursingInterventionID
      })
    }
    
    $("#divRecommendVteprophylaxis").modal('hide');
    var payload = {
      "AdmissionID": this.admissionID,
      "DoctorID": this.selectedView.ConsultantID,
      "PreparedBy": this.vteRiskAssessmentForm.get('preparedBy')?.value,
      "PreparedBySignature": this.vteRiskAssessmentForm.get('preparedBySignature')?.value,
      "SpecialiseID": this.selectedView.SpecialiseID,
      "WardTaskEntryID": "0",
      "NursingTaskID": "30",
      "FrequencyDate": moment(this.vteRiskAssessmentForm.get('FrequencyDate')?.value).format('DD-MMM-YYYY'),
      "FrequencyTime": "0",//this.vteRiskAssessmentForm.get('FrequencyTime')?.value,
      "OverAllScore": this.overallScore,
      "RiskLevelID": "9",
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.wardID,
      "HospitalID": this.hospitalID,
      "PatienttheraticID": this.vteRiskAssessmentForm.get('PatienttheraticID')?.value === '' ? '0' : this.vteRiskAssessmentForm.get('PatienttheraticID')?.value,
      "IndicationReassesment": this.vteRiskAssessmentForm.get('IndicationReassesment')?.value === '' ? '0' : this.vteRiskAssessmentForm.get('IndicationReassesment')?.value,
      "IsAssessment": this.vteRiskAssessmentForm.get('IsAssessment')?.value === '' ? '0' : this.vteRiskAssessmentForm.get('IsAssessment')?.value,
      "Instruction": this.selectedInstructionName,
      "RiskAssessmentDetails": RiskAssessmentDetails,
      "RiskAssessmentNIDetails": nursingInterventions,
      "PrescriptionType": this.selectedMedicineName
    }

    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.us.post(vteriskassessment.SaveRiskAssessmentOrderDetails, payload).subscribe((response) => {
          if (response.Status === "Success") {
            $("#divRecommendVteprophylaxis").modal('hide');
            this.saveMsg = "VTE Risk Assessment Saved Successfully";
            $("#vteriskAssessmentSaveMsg").modal('show');
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

  verifyAssessment() {
    var RiskAssessmentDetails: any[] = [];
    this.FetchAssessmentRiskFactorValuesDataNList.forEach((element: any, index: any) => {
      RiskAssessmentDetails.push({
        "RFSGID": element.RiskFactorSubGroupID,
        "RFID": element.RiskFactorID,
        "RFVID": element.RfValue,
        "VAL": element.AssessmentScore
      })
    });
    this.FetchAssessmentRiskFactorBleedingDataNList.forEach((element: any, index: any) => {
      RiskAssessmentDetails.push({
        "RFSGID": element.RiskFactorSubGroupID,
        "RFID": element.RiskFactorID,
        "RFVID": element.RfValue,
        "VAL": element.AssessmentScore
      })
    });
    var nursingInterventions: any[] = [];
    //NI - 17,18,19,20,21,22,23
    var niid = '0';
    if (this.selectedMedicineName === 'Enoxaparin40OD' || this.selectedMedicineName === 'Heparin5000BID')
      niid = '18';
    else if (this.selectedMedicineName === 'Enoxaparin40BID' || this.selectedMedicineName === 'Heparin5000TID')
      niid = '19';
    else if (this.selectedMedicineName === 'Heparin5000BID1')
      niid = '20';
    else if (this.totalRiskScore >= 2 && this.totalBleedingScore >= 7)
      niid = '22';
    else if ((this.totalRiskScore == 0 || this.totalRiskScore == 1) && (this.totalBleedingScore == 0 || this.totalBleedingScore == 1))
      niid = '23';

    var ni = this.nursingInterventions.find((x: any) => x.Type === niid);
    if(ni){
      nursingInterventions.push({
        "NIID": ni.NursingInterventionID
      })
    }
    
    $("#divRecommendVteprophylaxis").modal('hide');
    var payload = {
      "AdmissionID": this.admissionID,
      "RiskAssessmentOrderID": this.selectedView.RiskAssessmentOrderID,
      "IsVerified": true,
      "VerifiedBy": this.doctorDetails[0].UserId,
      "DoctorID": this.selectedView.ConsultantID,
      "WardTaskEntryID": "0",
      "NursingTaskID": "30",
      "FrequencyDate": moment(this.vteRiskAssessmentForm.get('FrequencyDate')?.value).format('DD-MMM-YYYY'),
      "FrequencyTime": "0",//this.vteRiskAssessmentForm.get('FrequencyTime')?.value,
      "OverAllScore": this.overallScore,
      "RiskLevelID": "9",
      "USERID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "WORKSTATIONID": this.wardID,
      "HospitalID": this.hospitalID,
      "PatienttheraticID": this.vteRiskAssessmentForm.get('PatienttheraticID')?.value === '' ? '0' : this.vteRiskAssessmentForm.get('PatienttheraticID')?.value,
      "IndicationReassesment": this.vteRiskAssessmentForm.get('IndicationReassesment')?.value === '' ? '0' : this.vteRiskAssessmentForm.get('IndicationReassesment')?.value,
      "IsAssessment": this.vteRiskAssessmentForm.get('IsAssessment')?.value === '' ? '0' : this.vteRiskAssessmentForm.get('IsAssessment')?.value,
      "Instruction": this.selectedInstructionName,
      "RiskAssessmentDetails": RiskAssessmentDetails,
      "RiskAssessmentNIDetails": nursingInterventions,
      "PrescriptionType": this.selectedMedicineName
    }
    this.us.post(vteriskassessment.UpdateRiskAssessmentOrderDetails, payload).subscribe((response) => {
      if (response.Status === "Success") {
        this.isNewVerified = true;
        $("#verifyMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {

        }
      }
    },
      (err) => {

      });
  }
  fetch() {
    this.fetchVteRiskAssessment();   
    if(this.vteOrderId != "" && this.vteOrderId != undefined&&sessionStorage.getItem("navigation") != null) {    
      this.fetchFinalRiskAssessmentDetails(this.vteOrderId);
    }
  }

  fetchVteRiskAssessment() {
    this.url = this.service.getData(vteriskassessment.FetchFinalSaveVTERiskAssessment, {
      AdmissionID: this.admissionID,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchFinalSaveVTERiskAssessmentDataList.length > 0) {
          this.savedRiskAssessmentDetails = response.FetchFinalSaveVTERiskAssessmentDataList.filter((x: any) => x.AssessmentType === 'VTE Medical');
          if (this.savedRiskAssessmentDetails.length > 0) {
            const startDate = new Date(response.FetchFinalSaveVTERiskAssessmentDataList[0]?.CREATEDATE);
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
        }
      },
        (err) => {
        })
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

  fetchFinalRiskAssessmentDetails(rsoid: string) {
    this.url = this.service.getData(vteriskassessment.FetchDVTRiskAssessmentFactorsNew, {
      RiskFactorSubGroupID: rsoid,
      AdmissionID: this.admissionID,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchDVTRiskAssessmentFactorDataList.length > 0) {
          if (response.FetchDVTRiskAssessmentFactorsNewDataList.length > 0) {
            this.vteSavedUser = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.UserID;
            this.showVerify = true;
            const verifiedUser = this.savedRiskAssessmentDetails.find((x:any) => x.RiskAssessmentOrderID === rsoid);
            if(verifiedUser && verifiedUser.VerifiedByName!='') {
              this.verifiedUserNameDate = '( Verified By: ' + verifiedUser.VerifiedByName + ' on (' + verifiedUser.VerifiedDate + ') )';
              this.VerifiedByName = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedByName;
                this.VerifiedDate = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedDate;
                this.isVerified = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.IsVerified=='True'?true:false;
                this.isNewVerified = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.IsVerified=='True'?true:false;
            }
            else  if(this.vteOrderId != "" && this.vteOrderId != undefined&&sessionStorage.getItem("navigation") != null) {    
              this.verifiedUserNameDate = '( Verified By: ' + response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedByName + ' on (' + response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedDate + ') )';
                this.VerifiedByName = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedByName;
                this.VerifiedDate = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedDate;
                this.isVerified = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.IsVerified=='True'?true:false;
                this.isNewVerified = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.IsVerified=='True'?true:false;
            }
          }

          //this.FetchAssessmentRiskFactorValuesDataNList = response.FetchDVTRiskAssessmentFactorDataList.filter((x:any) => x.RiskFactorSubGroupID === '9');

          this.FetchAssessmentRiskFactorValuesDataNList.forEach((element: any, index: any) => {
            const rf = response.FetchDVTRiskAssessmentFactorDataList.find((x: any) => x.RiskFactorID === element.RiskFactorID && x.RiskFactorSubGroupID === '9');
            //element.AssessmentScore = "0.00";
            if(rf!=undefined){              
              //element.selected = rf.RiskFactorValueID === '2' ? 'No' : 'Yes';
              element.selected = rf.RiskFactorValueID === '2' ? false : true;
              element.RfValue = rf.RiskFactorValueID;
              this.calculateVteRisk(element, rf.RiskFactorValueID === '2' ? 'No' : 'Yes');
            }
           
          });
          //this.FetchAssessmentRiskFactorBleedingDataNList = response.FetchDVTRiskAssessmentFactorDataList.filter((x:any) => x.RiskFactorSubGroupID === '10');
          this.FetchAssessmentRiskFactorBleedingDataNList.forEach((element: any, index: any) => {
            const rfb = response.FetchDVTRiskAssessmentFactorDataList.find((x: any) => x.RiskFactorID === element.RiskFactorID && x.RiskFactorSubGroupID === '10');
            //element.AssessmentScore = "0.00";
            if(rfb!=undefined){
              //element.selected = rfb.RiskFactorValueID === '2' ? 'No' : 'Yes';
              element.selected = rfb.RiskFactorValueID === '2' ? false : true;
              element.RfValue = rfb.RiskFactorValueID;
              this.calculateVteBleedingRisk(element, rfb.RiskFactorValueID === '2' ? 'No' : 'Yes');
            }
           
          });
          // if(response.FetchDVTRiskSubFactorDataList.find((x: any) => x.RiskFactorSubGroupID === '9')!=undefined)
          //   this.totalRiskScore = response.FetchDVTRiskSubFactorDataList.find((x: any) => x.RiskFactorSubGroupID === '9').AssessmentScore;
          // if(response.FetchDVTRiskSubFactorDataList.find((x: any) => x.RiskFactorSubGroupID === '10')!=undefined)
          //   this.totalBleedingScore = response.FetchDVTRiskSubFactorDataList.find((x: any) => x.RiskFactorSubGroupID === '10').AssessmentScore;
          this.vteRiskAssessmentForm.patchValue({
            IndicationReassesment: response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.IndicationReassesment,
            IsAssessment: response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.IsAssessment,
            FrequencyDate: new Date(response.FetchDVTRiskAssessmentFactorsNewDataList[0].CREATEDATE),
            RiskAssessmentOrderID: response.FetchDVTRiskAssessmentFactorsNewDataList[0].RiskAssessmentOrderID,
            PatienttheraticID: response.FetchDVTRiskAssessmentFactorsNewDataList[0].Patienttheratic,
            preparedByName: response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedByName,
            preparedByDesignation: response.FetchDVTRiskAssessmentFactorsNewDataList[0].Designation,
            preparedByDate: response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedDate,
            preparedBy: response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedBy,
            preparedBySignature: response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedBySignature,
          });

          this.base64StringSurgeonSig = response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedBySignature;

          this.showSignature = false;
          setTimeout(() => {
            this.showSignature = true;
          }, 0);
          this.vteRiskAssessmentForm.get('FrequencyDate')?.disable();
          this.vteRiskAssessmentForm.get('FrequencyTime')?.disable();
        }
        else {

        }
      },
        (err) => {
        })
  }

  clearVteRiskAssessment() {
    //this.fetchVteRiskAssessment();
    this.vteRiskAssessmentForm.patchValue({
      IsAssessment: '1',
      IndicationReassesment: '',
      PatienttheraticID: '0'
    })
    this.fetchAssessmentRiskFactorRiskNormal();
    this.fetchAssessmentRiskFactorRiskBleeding();
    this.fetchDiagnosis();
    this.fetchPatientTestResultVTE();
    this.fetchPatientHeightWeight();
    this.fetchNursingInterventionsVTE();
    this.overallScore = 0.00;
    this.totalRiskScore = 0.00;
    this.totalBleedingScore = 0.00;
    this.selectedMedicineName = "";
    this.selectedInstructionName = "";
    this.showSaveBtn = true;
    this.showModifyBtn = false;
    this.vteRiskAssessmentForm = this.formBuilder.group({
      FrequencyDate: new Date(),
      FrequencyTime: moment(new Date()).format('HH:mm'),
      RiskAssessmentDetails: [''],
      RiskAssessmentNIDetails: [''],
      OverAllScore: [''],
      RiskLevelID: [''],
      RiskAssessmentOrderID: [''],
      PatienttheraticID: [''],
      IndicationReassesment: [''],
      IsAssessment: ['1'],
      AssessmentType: [''],
      preparedByName: this.doctorDetails[0].EmpNo + "-" + this.doctorDetails[0].EmployeeName,
      preparedByDesignation: this.doctorDetails[0].EmpDesignation,
      preparedByDate: this.datePipe.transform(new Date(), "dd-MMM-yyyy HH:mm")?.toString(),
      preparedBy: this.doctorDetails[0].EmpId,
      preparedBySignature: '',
    });
    setTimeout(() => {
      this.vteRiskAssessmentForm.get('FrequencyDate')?.enable();
      this.vteRiskAssessmentForm.get('FrequencyTime')?.enable();
    }, 0);
    
    this.base64StringSurgeonSig = '';
    this.showSignature = false;
    setTimeout(() => {
      this.showSignature = true;
    }, 0);
    this.isVerified = false;
    this.showVerify = false;
    this.verifiedUserNameDate = "";
  }

  viewSavedVteRiskAssessments() {
    $("#divViewVteRiskAssessments").modal('show');
    this.fetchVteRiskAssessment();
  }

  loadSelectedVteAssessment() {
    this.fetchFinalRiskAssessmentDetails(this.selectedVteAssessment.RiskAssessmentOrderID);
    $("#divViewVteRiskAssessments").modal('hide');
  }
  openQuickActions() {
    this.patinfo = this.selectedView;
    $("#quickaction_info").modal('show');
  }
  clearPatientInfo() {
    this.patinfo = "";
  }
  closeModal() {
    $("#quickaction_info").modal('hide');
  }

  verifyVTEMedical() {
    this.isVerified = !this.isVerified;
    if(this.vteSavedUser === this.doctorDetails[0].UserId) {     
      this.errorMsg = "Saved user & Acknowledge user cannot be same";
      this.isVerified = !this.isVerified;
      $("#showCCValidationMsg").modal('show');
      return;
    }
    var paylod = {
      "RiskAssessmentOrderID": this.selectedVteAssessment.RiskAssessmentOrderID,
      "IsVerified": true,
      "VerifiedBy": this.doctorDetails[0].UserId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "HospitalID": this.hospitalID
    }
    this.us.post(vteriskassessment.UpdateRiskAssessmentVerifications, paylod).subscribe((response) => {
      if (response.Status === "Success") {
        this.saveMsg = "VTE Risk Assessment Acknowledged Successfully";
        $("#vteriskAssessmentSaveMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {

        }
      }
    },
      (err) => {

      })
  }
  getCTASScoreClass() {
    if(this.selectedView?.CTASScore == '1') {
      return 'Resuscitation';
    }
    else if(this.selectedView?.CTASScore == '2') {
      return 'Emergent';
    }
    else if(this.selectedView?.CTASScore == '3') {
      return 'Urgent';
    }
    else if(this.selectedView?.CTASScore == '4') {
      return 'LessUrgent';
    }
    else if(this.selectedView?.CTASScore == '5') {
      return 'NonUrgent';
    }
    return '';
  }
}

export const vteriskassessment = {
  FetchAssessmentRiskFactorRiskNormal: 'FetchAssessmentRiskFactorRiskNormal?UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAssessmentRiskFactorRiskBleeding: 'FetchAssessmentRiskFactorRiskBleeding?UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdviceDiagnosis: 'FetchAdviceDiagnosis?TBL=1&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchPatientTestResultVTE: 'FetchPatientTestResultVTE?AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientHeightWeight: 'FetchPatientHeightWeight',
  FetchNursingInterventionsVTE: 'FetchNursingInterventionsVTE?UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SaveRiskAssessmentOrderDetails: 'SaveRiskAssessmentOrderDetails',
  UpdateRiskAssessmentVerifications: 'UpdateRiskAssessmentVerifications',
  FetchFinalSaveVTERiskAssessment: 'FetchFinalSaveVTERiskAssessment?AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchDVTRiskAssessmentFactorsNew: 'FetchDVTRiskAssessmentFactorsNew?RiskFactorSubGroupID=${RiskFactorSubGroupID}&AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  UpdateRiskAssessmentOrderDetails: 'UpdateRiskAssessmentOrderDetails'
};

