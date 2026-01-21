import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { VteSurgicalRiskAssessmentService } from './vte-surgical-risk-assessment.service';
import { Router } from '@angular/router';
import { UtilityService } from 'src/app/shared/utility.service';
import { BaseComponent } from 'src/app/shared/base.component';
import * as moment from 'moment';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';

declare var $: any;

@Component({
  selector: 'app-vte-surgical-risk-assessment',
  templateUrl: './vte-surgical-risk-assessment.component.html',
  styleUrls: ['./vte-surgical-risk-assessment.component.scss']
})
export class VteSurgicalRiskAssessmentComponent extends BaseComponent implements OnInit {
  @Input() data: any;
  @Input() viewMode: any = false;
  readonly = false;
  vteSurgicalRiskAssessmentForm!: FormGroup;
  url: any;
  patientDiagnosis: any = [];
  FetchAssessmentRiskFactorValuesDataList: any = [];
  FetchAssessmentRiskFactorValuesDataSS1List: any = [];
  FetchAssessmentRiskFactorValuesDataSS2List: any = [];
  FetchAssessmentRiskFactorValuesDataSS3List: any = [];
  FetchAssessmentRiskFactorValuesDataSS4List: any = [];
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
  currentDate: any;
  Earlymobilization = false;
  MechanicalProphylaxisAfterPhyAsmt = false;
  MechanicalProphylaxis1 = false;
  Pharmacologicalprophylaxis = false;
  MechanicalandPharmacologicalprophylaxis = false;
  MechanicalProphylaxis = false;
  EnoxaparinOD = false;
  HeparinTID = false;
  HeparinTID1 = false;
  EnoxaparinBID = false;
  Enoxaparin30BID = false;
  HeparinTIDBmi40 = false;
  FondaparinuxOD = false;
  crclEnoxaparinOD = false;
  crclRivaroxaban = false;
  crclEnoxaparin = false;
  crclDabigatran = false;
  crclEnoxaparinBID = false;
  crclApixaban = false;
  crclApixabanBID = false;
  crclEnoxaparin40OD = false;
  crclEnoxaparin30OD = false;
  isMechanicalThrombo = false;
  errorMessages: any[] = [];
  isVerified = false;
  showVerify = false;
  vteSavedUser = "";
  errorMsg = "";
  saveMsg = "";
  verifiedUserNameDate = "";
  vteOrderId = "";
  endofEpisode: any;
  IsNurse: any;
  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @Output() dataChanged = new EventEmitter<boolean>();
  @Input() fromCaseSheet = false;

  VerifiedBy: any = '';
  VerifiedByName: any = '';
  VerifiedDate: any = '';
  isNewVerified : boolean = false;

  base64StringSurgeonSig = '';
  @ViewChild('SignSurgeon', { static: false }) signComponent: SignatureComponent | undefined;
  showSignature = true;

  surgeryTypesList = [
    { "id" : 1, name : 'Elective Hip Replacement', selected: false },
    { "id" : 2, name : 'Elective Knee Replacement', selected: false },    
    { "id" : 3, name : 'Hip Fracture Surgery', selected: false },
    { "id" : 4, name : 'Elective Spine  replacement', selected: false },
    // { "id" : 5, name : 'Isolated Lower Extremity Injuries Distal to the Knee', selected: false },
    // { "id" : 6, name : 'BARIATRIC Surgery', selected: false },
  ];
  highrisk: number = 2;
  riskLevelValue: any;
  

  constructor(private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private service: VteSurgicalRiskAssessmentService, private modalSvc: NgbModal, private datePipe: DatePipe) {
    super();

    this.currentDate = moment(new Date()).format('DD-MMM-YYYY HH:mm');

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
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
   
    if (this.selectedView.PatientID == undefined) {
      this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
       if(this.selectedView.AgeValue==undefined)
      this.selectedView.AgeValue=this.selectedView.Age;
    }
    
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.fetchDiagnosis();
    
    this.fetchPatientTestResultVTE();
    this.fetchPatientHeightWeight();
    this.fetchNursingInterventionsVTE();
    
    
    this.vteOrderId = this.selectedView.VTEOrderID;
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
      this.fetchAssessmentRiskFactorRiskNormal();
      setTimeout(() => {
        this.loadSelectedVteAssessment();
      }, 3000);      
      //this.us.disabledElement(this.divreadonly.nativeElement);
    }
    else{
       this.fetchAssessmentRiskFactorRiskNormal();
    }
  }

  base64SurgeonSignature(event: any) {
    this.vteSurgicalRiskAssessmentForm.patchValue({ preparedBySignature: event });
  }

  clearSurgeonSignature() {
    if (this.signComponent) {
      this.signComponent.clearSignature();
      this.vteSurgicalRiskAssessmentForm.patchValue({ preparedBySignature: '' });
    }
  }

  fetchAssessmentRiskFactorRiskNormal() {
    this.url = this.service.getData(vtesurgicalriskassessment.FetchAssessmentRiskFactorRiskNormalSur, { UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          console.log(response)
          this.FetchAssessmentRiskFactorValuesDataList = response.FetchAssessmentRiskFactorValuesDataList;
          this.FetchAssessmentRiskFactorValuesDataSS1List = response.FetchAssessmentRiskFactorValuesDataSS1List;
          this.FetchAssessmentRiskFactorValuesDataSS2List = response.FetchAssessmentRiskFactorValuesDataSS2List;
          this.FetchAssessmentRiskFactorValuesDataSS3List = response.FetchAssessmentRiskFactorValuesDataSS3List;
          this.FetchAssessmentRiskFactorValuesDataSS4List = response.FetchAssessmentRiskFactorValuesDataSS4List;
          //Remove Minor surgery option as per deepak
         // this.FetchAssessmentRiskFactorValuesDataSS1List = this.FetchAssessmentRiskFactorValuesDataSS1List.filter((x: any) => x.RiskFactor != 'Minor surgery'); //Normal Surgery remove
          this.FetchAssessmentRiskFactorValuesDataSS1List.forEach((element: any, index: any) => {
            element.AssessmentScore = "0.00";
            element.selected = false;
            element.RfValue = '2';
            if(element.RiskFactorID === '17' && Number(this.selectedView.AgeValue) >= 41 && Number(this.selectedView.AgeValue) <= 60) {
              // element.selected = 'Yes';
              // this.totalRiskScore = this.totalRiskScore + 1;
              // let find = this.FetchAssessmentRiskFactorValuesDataList.find((x: any) => x.RiskFactorID === element.RiskFactorID && x.RiskFactorValue === 'Yes');
              // if (find) {
              //   element.AssessmentScore = find.AssessmentScore;
              //   element.RfValue = find.RiskFactorValueID;
              // }
              this.calculateRiskScore1(element);
            }
          });
          this.FetchAssessmentRiskFactorValuesDataSS2List.forEach((element: any, index: any) => {
            element.AssessmentScore = "0.00";
            element.selected = false;
            element.RfValue = '2';
            if(element.RiskFactorID === '147' && Number(this.selectedView.AgeValue) >= 61 && Number(this.selectedView.AgeValue) <= 74) {
              // element.selected = 'Yes';
              // this.totalRiskScore = this.totalRiskScore + 2;
              // let find = this.FetchAssessmentRiskFactorValuesDataList.find((x: any) => x.RiskFactorID === element.RiskFactorID && x.RiskFactorValue === 'Yes');
              // if (find) {
              //   element.AssessmentScore = find.AssessmentScore;
              //   element.RfValue = find.RiskFactorValueID;
              // }
              this.calculateRiskScore2(element);
            }
          });
          this.FetchAssessmentRiskFactorValuesDataSS3List.forEach((element: any, index: any) => {
            element.AssessmentScore = "0.00";
            element.selected = false;
            element.RfValue = '2';
            if(element.RiskFactorID === '150' && Number(this.selectedView.AgeValue) === 75) {
              // element.selected = 'Yes';
              // this.totalRiskScore = this.totalRiskScore + 3;
              // let find = this.FetchAssessmentRiskFactorValuesDataList.find((x: any) => x.RiskFactorID === element.RiskFactorID && x.RiskFactorValue === 'Yes');
              // if (find) {
              //   element.AssessmentScore = find.AssessmentScore;
              //   element.RfValue = find.RiskFactorValueID;
              // }
              this.calculateRiskScore3(element);
            }
          });
          this.FetchAssessmentRiskFactorValuesDataSS4List.forEach((element: any, index: any) => {
            element.AssessmentScore = "0.00";
            element.selected = false;
            element.RfValue = '2';
          });
        }
      },
        (err) => {
        })
  }

  fetchDiagnosis() {

    this.url = this.service.getData(vtesurgicalriskassessment.FetchAdviceDiagnosis, {
      Admissionid: this.data ? this.data.data.Admissionid : this.admissionID,
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
        if(Number(this.patientBmi) >= 25) {
          //this.totalRiskScore = this.totalRiskScore + 1;
          this.checkRiskScore();
        }
      }
    })
  }

  fetchPatientTestResultVTE() {
    this.url = this.service.getData(vtesurgicalriskassessment.FetchPatientTestResultVTE, {
      AdmissionID: this.admissionID ?? this.selectedView.AdmissionID,
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
          $("#showCCValidationMsg1").modal('show');
        }
      },
        (err) => {
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

  calculateRiskScore1(item: any) {
    item.selected = !item.selected;
    //if(item.RiskFactorID != '159') {
      this.totalRiskScore = item.selected ? Number(this.totalRiskScore) + 1 : Number(this.totalRiskScore) - 1;
      const itemslctedval = item.selected ? 'Yes' : 'No'
      let find = this.FetchAssessmentRiskFactorValuesDataList.find((x: any) => x.RiskFactorID === item.RiskFactorID && x.RiskFactorValue === itemslctedval);
      if (find) {
        item.AssessmentScore = find.AssessmentScore;
        item.RfValue = find.RiskFactorValueID;
      }
      else {
        item.AssessmentScore = "0";
        item.RfValue = "2";
      }
      this.checkRiskScore();
    //}
  }
  calculateRiskScore2(item: any) {
    item.selected = !item.selected;
    this.totalRiskScore = item.selected ? Number(this.totalRiskScore) + 2 : Number(this.totalRiskScore) - 2;
    const itemslctedval = item.selected ? 'Yes' : 'No'
    let find = this.FetchAssessmentRiskFactorValuesDataList.find((x: any) => x.RiskFactorID === item.RiskFactorID && x.RiskFactorValue === itemslctedval);
    if (find) {
      item.AssessmentScore = find.AssessmentScore;
      item.RfValue = find.RiskFactorValueID;
    }
    else {
        item.AssessmentScore = "0";
        item.RfValue = "2";
      }
    this.checkRiskScore();
  }
  calculateRiskScore3(item: any) {
    item.selected = !item.selected;
    this.totalRiskScore = item.selected ? Number(this.totalRiskScore) + 3 : Number(this.totalRiskScore) - 3;
    const itemslctedval = item.selected ? 'Yes' : 'No'
    let find = this.FetchAssessmentRiskFactorValuesDataList.find((x: any) => x.RiskFactorID === item.RiskFactorID && x.RiskFactorValue === itemslctedval);
    if (find) {
      item.AssessmentScore = find.AssessmentScore;
      item.RfValue = find.RiskFactorValueID;
    }
    else {
        item.AssessmentScore = "0";
        item.RfValue = "2";
      }
    this.checkRiskScore();
  }
  calculateRiskScore4(item: any) {
    item.selected = !item.selected;
    this.totalRiskScore = item.selected ? Number(this.totalRiskScore) + 5 : Number(this.totalRiskScore) - 5;
    const itemslctedval = item.selected ? 'Yes' : 'No'
    let find = this.FetchAssessmentRiskFactorValuesDataList.find((x: any) => x.RiskFactorID === item.RiskFactorID && x.RiskFactorValue === itemslctedval);
    if (find) {
      item.AssessmentScore = find.AssessmentScore;
      item.RfValue = find.RiskFactorValueID;
    }
    else {
        item.AssessmentScore = "0";
        item.RfValue = "2";
      }
    this.checkRiskScore();
  }

  selectProphylaxisRegimes(type: string) {
    (this as any)[type] = !(this as any)[type];
    if (type === 'EnoxaparinBID') {
      this.HeparinTID = false;
    }
    else if (type === 'HeparinTID')
      this.EnoxaparinBID = false;

    else if (type === 'crclEnoxaparinOD')
      this.crclRivaroxaban = this.crclDabigatran = this.crclEnoxaparinBID = this.crclApixaban = false;
    else if (type === 'crclRivaroxaban')
      this.crclEnoxaparinOD = this.crclDabigatran = this.crclEnoxaparinBID = this.crclApixaban = false;
    else if (type === 'crclDabigatran')
      this.crclEnoxaparinOD = this.crclRivaroxaban = this.crclEnoxaparinBID = this.crclApixaban = false;
    else if (type === 'crclEnoxaparinBID')
      this.crclEnoxaparinOD = this.crclRivaroxaban = this.crclDabigatran = this.crclApixaban = false;
    else if (type === 'crclApixaban')
      this.crclEnoxaparinOD = this.crclRivaroxaban = this.crclDabigatran = this.crclEnoxaparinBID = false;
    else if (type === 'crclEnoxaparin')
      this.crclApixabanBID = false;
    else if (type === 'crclApixabanBID')
      this.crclEnoxaparin = false;
    else if (type === 'crclEnoxaparin40OD')
      this.crclEnoxaparin30OD = false;
    else if (type === 'crclEnoxaparin30OD')
      this.crclEnoxaparin40OD = false;
    if(type === 'crclEnoxaparinOD' || type === 'crclEnoxaparinBID' || type === 'crclRivaroxaban' || type === 'crclApixaban' || type === 'crclDabigatran') {
      if(this.crclEnoxaparinOD || this.crclEnoxaparinBID || this.crclRivaroxaban || this.crclApixaban || this.crclDabigatran) {
        this.crclEnoxaparin = false; this.crclApixabanBID = false;
      }
    }
    if(type === 'crclEnoxaparin' || type === 'crclApixabanBID') {
      if(this.crclEnoxaparin || this.crclApixabanBID) {
        this.crclEnoxaparinOD = this.crclEnoxaparinBID = this.crclRivaroxaban = this.crclApixaban = this.crclDabigatran = false;
      }
    }
  }

  toggleSelectionForm(formCtrlName: string, val: string) {
    if (val != undefined) {
      this.vteSurgicalRiskAssessmentForm.controls[formCtrlName].setValue(val);
    }
    if(formCtrlName === 'IsAssessment' && this.vteSurgicalRiskAssessmentForm.get('IsAssessment')?.value === '2') {
      this.vteSurgicalRiskAssessmentForm.patchValue({
        IndicationReassesment : "1"
      });
    }
    else if(formCtrlName === 'IsAssessment' && this.vteSurgicalRiskAssessmentForm.get('IsAssessment')?.value === '2') {
      this.vteSurgicalRiskAssessmentForm.patchValue({
        IndicationReassesment : "0"
      });
    }
  }

  saveVteSurgicalAssessmentForm() {
    this.errorMessages = [];

    const preparedBySign = this.vteSurgicalRiskAssessmentForm.get('preparedBySignature')?.value;
    if(preparedBySign === '') {
      this.errorMessages.push("Please enter Prepared By Signature");
    }

    var RiskAssessmentDetails: any[] = [];
    this.FetchAssessmentRiskFactorValuesDataSS1List.forEach((element: any, index: any) => {
      RiskAssessmentDetails.push({
        "RFSGID": element.RiskFactorSubGroupID,
        "RFID": element.RiskFactorID,
        "RFVID": element.RfValue,
        "VAL": element.AssessmentScore
      })
    });
    this.FetchAssessmentRiskFactorValuesDataSS2List.forEach((element: any, index: any) => {
      RiskAssessmentDetails.push({
        "RFSGID": element.RiskFactorSubGroupID,
        "RFID": element.RiskFactorID,
        "RFVID": element.RfValue,
        "VAL": element.AssessmentScore
      })
    });
    this.FetchAssessmentRiskFactorValuesDataSS3List.forEach((element: any, index: any) => {
      RiskAssessmentDetails.push({
        "RFSGID": element.RiskFactorSubGroupID,
        "RFID": element.RiskFactorID,
        "RFVID": element.RfValue,
        "VAL": element.AssessmentScore
      })
    });
    this.FetchAssessmentRiskFactorValuesDataSS4List.forEach((element: any, index: any) => {
      RiskAssessmentDetails.push({
        "RFSGID": element.RiskFactorSubGroupID,
        "RFID": element.RiskFactorID,
        "RFVID": element.RfValue,
        "VAL": element.AssessmentScore
      })
    });

    const rskFactorSelected = RiskAssessmentDetails.filter((x: any) => x.VAL === '1' || x.VAL === '1.00');
    if(rskFactorSelected.length === 0) {
      this.errorMessages.push("Please select atleast one VTE Risk Item from Step-1");
    }

    var nursingInterventions: any[] = [];
    //NI - 17,19,20,22,23,24,25,26,27,28,29,30,31,32
    var ni: any = [];
    if (this.Earlymobilization)
      ni.push('23');
    if (this.MechanicalProphylaxisAfterPhyAsmt)
      ni.push('30');
    if (this.Pharmacologicalprophylaxis)
      ni.push('17');
    if (this.MechanicalandPharmacologicalprophylaxis)
      ni.push('24');
    if (this.EnoxaparinOD)
      ni.push('31');
    if (this.EnoxaparinBID || this.HeparinTID)
      ni.push('19');
    if (this.HeparinTID1)
      ni.push('20');
    if (this.Enoxaparin30BID)
      ni.push('25');
    if (this.FondaparinuxOD)
      ni.push('32');
    if (this.crclEnoxaparinOD || this.crclRivaroxaban || this.crclDabigatran || this.crclEnoxaparinBID || this.crclApixaban)
      ni.push('26');
    if (this.crclEnoxaparin || this.crclApixabanBID)
      ni.push('27');
    if (this.crclEnoxaparin40OD)
      ni.push('28');
    if (this.crclEnoxaparin30OD)
      ni.push('29');
    if (this.MechanicalProphylaxis)
      ni.push('22');

    ni.forEach((element: any, index: any) => {
      if(element == '26') {
        nursingInterventions.push({
          "NIID": 
            this.crclEnoxaparinOD ? '10034' : this.crclRivaroxaban ? '10035' : this.crclDabigatran ? '10036' : this.crclEnoxaparinBID ? '10037' : this.crclApixaban ? '10038' : ''
        });        
      }
      else if(element == '27') {
        nursingInterventions.push({
          "NIID": 
            this.crclEnoxaparin ? '10039' : this.crclApixabanBID ? '10040' : ''
        });
      }
      else {
        const ni = this.nursingInterventions.find((x: any) => x.Type === element);
        if (ni) {
          nursingInterventions.push({
            "NIID": ni.NursingInterventionID
          })
        }
      }
      
    });

    if (this.Earlymobilization || this.MechanicalProphylaxisAfterPhyAsmt || this.Pharmacologicalprophylaxis || this.MechanicalandPharmacologicalprophylaxis || this.MechanicalProphylaxis
      || this.EnoxaparinBID || this.HeparinTID || this.EnoxaparinOD || this.HeparinTID1 || this.FondaparinuxOD || this.Enoxaparin30BID) {

    }
    else {
      this.errorMessages = [];
      this.errorMessages.push("Please Select atlease one intervention in Step-2")
      $("#vteSurgicalValidation").modal('show');
      return;
    }

    const procIds = this.surgeryTypesList.filter((x: any) => x.selected).map((item: any) => item.id).join(',');

    if(this.highrisk === 2) {
      this.errorMessages.push("Please select High risk bleeding - Yes/No");
      $("#vteSurgicalValidation").modal('show');
      return;
    }

    let riskLevel = ''; let riskLevelScore = '';
    if(this.highrisk == 1) {
      riskLevelScore = this.isHighBleedingLowRisk ? '1' : this.isHighBleedingModerateRisk ? '2' : this.isHighBleedingHighRisk ? '3' : ''
      riskLevel = 'H' + riskLevelScore;
    }
    else {
      riskLevelScore = this.isLowBleedingLowRisk ? '1' : this.isLowBleedingModerateRisk ? '2' : this.isLowBleedingHighRisk ? '3' : this.isLowBleedingHighestRisk ? '4' : ''
      riskLevel = 'L' + riskLevelScore;
    }
    
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        var payload = {
          "AdmissionID": this.admissionID,
          "DoctorID": this.selectedView.ConsultantID,
          "PreparedBy": this.vteSurgicalRiskAssessmentForm.get('preparedBy')?.value,
          "PreparedBySignature": this.vteSurgicalRiskAssessmentForm.get('preparedBySignature')?.value,
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
          "RiskLevel" : riskLevel,
          "RiskLevelValues" : this.riskLevelValue
        }

        this.us.post(vtesurgicalriskassessment.SaveRiskAssessmentOrderDetailsSur, payload).subscribe((response) => {
          if (response.Status === "Success") {
            this.saveMsg = "VTE Risk Assessment Saved Successfully";
            $("#vteriskAssessmentSaveMsg1").modal('show');
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
    this.errorMessages = [];
    var RiskAssessmentDetails: any[] = [];
    this.FetchAssessmentRiskFactorValuesDataSS1List.forEach((element: any, index: any) => {
      RiskAssessmentDetails.push({
        "RFSGID": element.RiskFactorSubGroupID,
        "RFID": element.RiskFactorID,
        "RFVID": element.RfValue,
        "VAL": element.AssessmentScore
      })
    });
    this.FetchAssessmentRiskFactorValuesDataSS2List.forEach((element: any, index: any) => {
      RiskAssessmentDetails.push({
        "RFSGID": element.RiskFactorSubGroupID,
        "RFID": element.RiskFactorID,
        "RFVID": element.RfValue,
        "VAL": element.AssessmentScore
      })
    });
    this.FetchAssessmentRiskFactorValuesDataSS3List.forEach((element: any, index: any) => {
      RiskAssessmentDetails.push({
        "RFSGID": element.RiskFactorSubGroupID,
        "RFID": element.RiskFactorID,
        "RFVID": element.RfValue,
        "VAL": element.AssessmentScore
      })
    });
    this.FetchAssessmentRiskFactorValuesDataSS4List.forEach((element: any, index: any) => {
      RiskAssessmentDetails.push({
        "RFSGID": element.RiskFactorSubGroupID,
        "RFID": element.RiskFactorID,
        "RFVID": element.RfValue,
        "VAL": element.AssessmentScore
      })
    });

    var nursingInterventions: any[] = [];
    //NI - 17,19,20,22,23,24,25,26,27,28,29,30,31,32
    var ni: any = [];
    if (this.Earlymobilization)
      ni.push('23');
    if (this.MechanicalProphylaxisAfterPhyAsmt)
      ni.push('30');
    if (this.Pharmacologicalprophylaxis)
      ni.push('17');
    if (this.MechanicalandPharmacologicalprophylaxis)
      ni.push('24');
    if (this.EnoxaparinOD)
      ni.push('31');
    if (this.EnoxaparinBID || this.HeparinTID)
      ni.push('19');
    if (this.HeparinTID1)
      ni.push('20');
    if (this.Enoxaparin30BID)
      ni.push('25');
    if (this.FondaparinuxOD)
      ni.push('32');
    if (this.crclEnoxaparinOD || this.crclRivaroxaban || this.crclDabigatran || this.crclEnoxaparinBID || this.crclApixaban)
      ni.push('26');
    if (this.crclEnoxaparin || this.crclApixabanBID)
      ni.push('27');
    if (this.crclEnoxaparin40OD)
      ni.push('28');
    if (this.crclEnoxaparin30OD)
      ni.push('29');
    if (this.MechanicalProphylaxis)
      ni.push('22');

    ni.forEach((element: any, index: any) => {
      const ni = this.nursingInterventions.find((x: any) => x.Type === element);
      if (ni) {
        nursingInterventions.push({
          "NIID": ni.NursingInterventionID
        })
      }
    });

    if (this.Earlymobilization || this.MechanicalProphylaxisAfterPhyAsmt || this.Pharmacologicalprophylaxis || this.MechanicalandPharmacologicalprophylaxis || this.MechanicalProphylaxis
      || this.EnoxaparinBID || this.HeparinTID || this.EnoxaparinOD || this.HeparinTID1 || this.FondaparinuxOD || this.Enoxaparin30BID) {

    }
    else {
      this.errorMessages = [];
      this.errorMessages.push("Please Select atlease one intervention in Step-2")
      $("#vteSurgicalValidation").modal('show');
      return;
    }

    var payload = {
      "AdmissionID": this.admissionID,
      "RiskAssessmentOrderID": this.selectedView.RiskAssessmentOrderID,
      "IsVerified": true,
      "VerifiedBy": this.doctorDetails[0].UserId,
      "DoctorID": this.selectedView.ConsultantID,
      "WardTaskEntryID": "0",
      "NursingTaskID": "30",
      "FrequencyDate": moment(new Date()).format('DD-MMM-YYYY'),
      "FrequencyTime": "0",
      "OverAllScore": this.totalRiskScore,
      "RiskLevelID": "9",
      "USERID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "WORKSTATIONID": this.wardID,
      "HospitalID": this.hospitalID,
      "PatienttheraticID": this.vteSurgicalRiskAssessmentForm.get('Patienttheratic')?.value === '' ? '0' : this.vteSurgicalRiskAssessmentForm.get('Patienttheratic')?.value,
      "IndicationReassesment": this.vteSurgicalRiskAssessmentForm.get('IndicationReassesment')?.value === '' ? '0' : this.vteSurgicalRiskAssessmentForm.get('IndicationReassesment')?.value,
      "IsAssessment": this.vteSurgicalRiskAssessmentForm.get('IsAssessment')?.value,
      "Instruction": this.selectedInstructionName,
      "RiskAssessmentDetails": RiskAssessmentDetails,
      "RiskAssessmentNIDetails": nursingInterventions
    }

    this.us.post(vtesurgicalriskassessment.UpdateRiskAssessmentOrderDetails, payload).subscribe((response) => {
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
    this.url = this.service.getData(vtesurgicalriskassessment.FetchFinalSaveVTERiskAssessment, {
      AdmissionID: this.admissionID,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchFinalSaveVTERiskAssessmentDataList.length > 0) {
          this.savedRiskAssessmentDetails = response.FetchFinalSaveVTERiskAssessmentDataList.filter((x: any) => x.AssessmentType === 'VTE Surgery');
          //const startDate = new Date(response.FetchDVTRiskAssessmentFactorsNewDataList[0].CREATEDATE);
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
    this.url = this.service.getData(vtesurgicalriskassessment.FetchDVTRiskAssessmentFactorsNewSur, {
      RiskFactorSubGroupID: rsoid,
      AdmissionID: this.admissionID,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchDVTRiskAssessmentFactorDataList.length > 0) {
          if(response.FetchDVTRiskAssessmentFactorsNewDataList.length > 0) {
            this.vteSavedUser = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.UserID;
            this.showVerify = true;
            if(this.savedRiskAssessmentDetails.length>0){
              const verifiedUser = this.savedRiskAssessmentDetails.find((x:any) => x.RiskAssessmentOrderID === rsoid);
              if(verifiedUser?.VerifiedByName!='') {
                this.verifiedUserNameDate = '( Verified By: ' + verifiedUser?.VerifiedByName + ' on (' + verifiedUser?.VerifiedDate + ') )';
                this.VerifiedByName = verifiedUser.VerifiedByName;
                this.VerifiedDate = verifiedUser.VerifiedDate;
                this.isVerified = verifiedUser.IsVerified=='True'?true:false;
                this.isNewVerified = verifiedUser.IsVerified=='True'?true:false;
              }
            }else  if(this.vteOrderId != "" && this.vteOrderId != undefined&&sessionStorage.getItem("navigation") != null) {    
              this.verifiedUserNameDate = '( Verified By: ' + response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedByName + ' on (' + response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedDate + ') )';
                this.VerifiedByName = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedByName;
                this.VerifiedDate = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.VerifiedDate;
                this.isVerified = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.IsVerified=='True'?true:false;
                this.isNewVerified = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.IsVerified=='True'?true:false;
            }

            if(response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.ProcedureIDs != '') {
              response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.ProcedureIDs.split(',').forEach((element: any) => {
                const surId = this.surgeryTypesList.find((x: any) => x.id == element);
                if(surId) {
                  surId.selected = true;
                }
              });              
            }
            this.highrisk = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.IsHighRiskOfBleeding == 'True' ? 1 : 0;
            this.riskLevelValue = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.RiskLevelValues;
            if(this.highrisk == 1) {
              this.isHighBleedingLowRisk = true;
            }
            else if(this.highrisk == 0) {
              if(response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.RiskLevel != '') {
                const lowrisk = response.FetchDVTRiskAssessmentFactorsNewDataList[0]?.RiskLevel.split('');
                if(lowrisk.length > 0) {
                  const lowRiskVal = lowrisk[1];
                  if(lowRiskVal == 1) {
                    this.isLowBleedingLowRisk = true;
                  }
                  else if(lowRiskVal == 2) {
                    this.isLowBleedingLowRisk = true;
                  }
                  else if(lowRiskVal == 3) {
                    this.isLowBleedingHighRisk = true;
                  }
                  else if(lowRiskVal == 4) {
                    this.isLowBleedingHighestRisk = true;
                  }
                }
              }
              if(this.riskLevelValue != '') {
                this.isLowBleedingModerateRiskItem1 = this.riskLevelValue == '2' ? true : false;
                this.isLowBleedingModerateRiskItem2 = this.riskLevelValue == '3' ? true : false;
                this.isLowBleedingModerateRiskItem3 = this.riskLevelValue == '4' ? true : false;
                this.isLowBleedingModerateRiskItem4 = this.riskLevelValue == '5' ? true : false;
                this.isLowBleedingModerateRiskItem5 = this.riskLevelValue == '6' ? true : false;
                this.isLowBleedingModerateRiskItem6 = this.riskLevelValue == '7' ? true : false;
                this.isLowBleedingHighRiskItem1 = this.riskLevelValue == '8' ? true : false;
                this.isLowBleedingHighRiskItem2 = this.riskLevelValue == '9' ? true : false;
                this.isLowBleedingHighRiskItem3 = this.riskLevelValue == '10' ? true : false;
                this.isLowBleedingHighRiskItem4 = this.riskLevelValue == '11' ? true : false;
                this.isLowBleedingHighRiskItem5 = this.riskLevelValue == '12' ? true : false;
                this.isLowBleedingHighRiskItem6 = this.riskLevelValue == '13' ? true : false;
                this.isLowBleedingHighestRiskItem1 = this.riskLevelValue == '14' ? true : false;
                this.isLowBleedingHighestRiskItem2 = this.riskLevelValue == '15' ? true : false;
                this.isLowBleedingHighestRiskItem3 = this.riskLevelValue == '16' ? true : false;
                this.isLowBleedingHighestRiskItem4 = this.riskLevelValue == '17' ? true : false;
                this.isLowBleedingHighestRiskItem5 = this.riskLevelValue == '18' ? true : false;
                this.isLowBleedingHighestRiskItem6 = this.riskLevelValue == '19' ? true : false;
              }
            }
          }
          this.FetchAssessmentRiskFactorValuesDataSS1List.forEach((element: any, index: any) => {
            const rf = response.FetchDVTRiskAssessmentFactorDataList.find((x: any) => x.RiskFactorID === element.RiskFactorID);
            if(rf!=undefined){
              element.selected = rf.RiskFactorValueID === '2' ? false : true;
              element.RfValue = rf.RiskFactorValueID;
            }
           
          });
          this.FetchAssessmentRiskFactorValuesDataSS2List.forEach((element: any, index: any) => {
            const rf = response.FetchDVTRiskAssessmentFactorDataList.find((x: any) => x.RiskFactorID === element.RiskFactorID);
            if(rf!=undefined){
              element.selected = rf.RiskFactorValueID === '2' ? false : true;
              element.RfValue = rf.RiskFactorValueID;
            }
          });
          this.FetchAssessmentRiskFactorValuesDataSS3List.forEach((element: any, index: any) => {
            const rf = response.FetchDVTRiskAssessmentFactorDataList.find((x: any) => x.RiskFactorID === element.RiskFactorID);
            if(rf!=undefined){
            element.selected = rf.RiskFactorValueID === '2' ? false : true;
            element.RfValue = rf.RiskFactorValueID;
            }
          });
          this.FetchAssessmentRiskFactorValuesDataSS4List.forEach((element: any, index: any) => {
            const rfb = response.FetchDVTRiskAssessmentFactorDataList.find((x: any) => x.RiskFactorID === element.RiskFactorID);
            if(rfb!=undefined){
            element.selected = rfb.RiskFactorValueID === '2' ? false : true;
            element.RfValue = rfb.RiskFactorValueID;
            }
          });
          this.totalRiskScore = response.FetchDVTRiskAssessmentFactorsNewDataList[0].OverAllScore;
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
          })
          this.vteSurgicalRiskAssessmentForm.patchValue({
            Patienttheratic: response.FetchDVTRiskAssessmentFactorsNewDataList[0].Patienttheratic
          });

          this.base64StringSurgeonSig = response.FetchDVTRiskAssessmentFactorsNewDataList[0].PreparedBySignature;

          this.showSignature = false;
          setTimeout(() => {
            this.showSignature = true;
          }, 0);

          this.vteSurgicalRiskAssessmentForm.get('FrequencyDate')?.disable();

          response.FetchDVTRiskFactorDataList.forEach((element: any, index: any) => {
            const find = this.nursingInterventions.find((x: any) => x.NursingInterventionID === element.NursingInterventionID);
            if (find) {
              if (find.NursingInterventionID === '10023')
                this.Pharmacologicalprophylaxis = true;
              else if (find.NursingInterventionID === '10024')
                this.EnoxaparinOD = true;
              else if (find.NursingInterventionID === '10025')
                this.HeparinTID1 = true;
              else if (find.NursingInterventionID === '10026')
                this.EnoxaparinBID = true;
              else if (find.NursingInterventionID === '10027')
                this.HeparinTID = true;
              else if (find.NursingInterventionID === '10028')
                this.HeparinTID1 = true;
              else if (find.NursingInterventionID === '10029')
                this.FondaparinuxOD = true;
              else if (find.NursingInterventionID === '10030')
                this.MechanicalProphylaxis = true;
              else if (find.NursingInterventionID === '10031')
                this.Earlymobilization = true;
              else if (find.NursingInterventionID === '10031')
                this.Earlymobilization = true;
              else if (find.NursingInterventionID === '10032')
                this.MechanicalandPharmacologicalprophylaxis = true;
              else if (find.NursingInterventionID === '10033')
                this.Enoxaparin30BID = true;
              else if (find.NursingInterventionID === '10034')
                this.crclEnoxaparinOD = true;
              else if (find.NursingInterventionID === '10035')
                this.crclRivaroxaban = true;
              else if (find.NursingInterventionID === '10036')
                this.crclDabigatran = true;
              else if (find.NursingInterventionID === '10037')
                this.crclEnoxaparinBID = true;
              else if (find.NursingInterventionID === '10038')
                this.crclApixaban = true;
              else if (find.NursingInterventionID === '10039')
                this.crclEnoxaparin = true;
              else if (find.NursingInterventionID === '10040')
                this.crclApixabanBID = true;
              else if (find.NursingInterventionID === '10041')
                this.crclEnoxaparin40OD = true;
              else if (find.NursingInterventionID === '10042')
                this.crclEnoxaparin30OD = true;

              else if (find.NursingInterventionID === '10044')
                this.MechanicalProphylaxisAfterPhyAsmt = true;
              else if (find.NursingInterventionID === '10045')
                this.EnoxaparinOD = true
              else if (find.NursingInterventionID === '10046')
                this.FondaparinuxOD = true

            }
          });


        }
        else {

        }
      },
        (err) => {
        })
  }

  clearVteRiskAssessment() {
    this.vteSurgicalRiskAssessmentForm.patchValue({
      IsAssessment: '1',
      IndicationReassesment: '0',
      Patienttheratic: '',
      preparedByName: this.doctorDetails[0].EmpNo + "-" + this.doctorDetails[0].EmployeeName,
      preparedByDesignation: this.doctorDetails[0].EmpDesignation,
      preparedByDate: this.datePipe.transform(new Date(), "dd-MMM-yyyy HH:mm")?.toString(),
      preparedBy: this.doctorDetails[0].EmpId,
      preparedBySignature: '',
      RiskAssessmentOrderID: '',
    });
    this.base64StringSurgeonSig = '';
    this.showSignature = false;
    setTimeout(() => {
      this.showSignature = true;
      this.vteSurgicalRiskAssessmentForm.get('FrequencyDate')?.enable();
    }, 0);
    this.fetchAssessmentRiskFactorRiskNormal();
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
    this.isVerified = false;
    this.showVerify = false;
    this.verifiedUserNameDate = "";
    this.surgeryTypesList
    this.surgeryTypesList = this.surgeryTypesList.map((surg: any) => ({
    ...surg,
      selected: false
    }));
    this.highrisk = 2;
    this.crclEnoxaparinOD = this.crclRivaroxaban = this.crclDabigatran = this.crclEnoxaparinBID = this.crclApixaban = this.crclEnoxaparin = this.crclApixabanBID = false;
    this.isMechanicalThrombo = false;
    this.isLowBleedingModerateRisk = this.isLowBleedingLowRisk = this.isLowBleedingHighRisk = this.isLowBleedingHighestRisk = this.isHighBleedingModerateRisk = this.isHighBleedingHighRisk = this.isHighBleedingLowRisk = false;
  }

  viewSavedVteSurgicalRiskAssessments() {
    $("#divViewVteSurgicalRiskAssessments1").modal('show');
    this.fetchVteRiskAssessment();
  }

  loadSelectedVteAssessment() {
    this.fetchFinalRiskAssessmentDetails(this.selectedVteAssessment.RiskAssessmentOrderID);
    $("#divViewVteSurgicalRiskAssessments1").modal('hide');
  }

  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }
  openQuickActions() {
    this.patinfo = this.selectedView;
    $("#quickaction_info1").modal('show');
  }
  clearPatientInfo() {
    this.patinfo = "";
  }
  closeModal() {
    $("#quickaction_info1").modal('hide');
  }

  verifyVTESurgical() {
    this.isVerified = !this.isVerified;
    if(this.vteSavedUser === this.doctorDetails[0].UserId) {
      this.errorMessages = [];
      this.errorMessages.push("Saved user and acknowledge user cannot be same");
      this.isVerified = !this.isVerified;
      $("#vteSurgicalValidation").modal('show');
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
    this.us.post(vtesurgicalriskassessment.UpdateRiskAssessmentVerifications, paylod).subscribe((response) => {
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

  checkRiskScore() {
    if(this.totalRiskScore === 1 || this.totalRiskScore === 2) {
      this.MechanicalProphylaxisAfterPhyAsmt = true;
      this.Pharmacologicalprophylaxis = false;
      this.MechanicalandPharmacologicalprophylaxis = false;
      this.MechanicalProphylaxis = false;      
    }
    else if(this.totalRiskScore === 3 || this.totalRiskScore === 4) {
      this.MechanicalProphylaxisAfterPhyAsmt = false;
      this.Pharmacologicalprophylaxis = true;
      this.MechanicalandPharmacologicalprophylaxis = false;
      this.MechanicalProphylaxis = false;      
    }
    else if(this.totalRiskScore >= 5) {
      this.MechanicalProphylaxisAfterPhyAsmt = false;
      this.Pharmacologicalprophylaxis = false;
      this.MechanicalandPharmacologicalprophylaxis = true;
      this.MechanicalProphylaxis = false;      
    }

    if(this.patientBmi < 40) {
      this.EnoxaparinOD = true;
    }
    else if(this.patientBmi >= 40) {
      this.EnoxaparinBID = true;
    }

    if (this.highrisk == 1) {
      if (this.totalRiskScore <= 1) {
        this.onHighBleedingRiskClick('low');
      } else if (this.totalRiskScore === 2) {
        this.onHighBleedingRiskClick('moderate');
      } else {
        this.onHighBleedingRiskClick('high');
      }
    } else if (this.highrisk == 0) {
      if (this.totalRiskScore <= 1) {
        this.onLowBleedingRiskClick('low');
      } else if (this.totalRiskScore === 2) {
        this.onLowBleedingRiskClick('moderate');
      } else if (this.totalRiskScore === 3 || this.totalRiskScore === 4) {
        this.onLowBleedingRiskClick('high');
      } else {
        this.onLowBleedingRiskClick('highest');
      }
    }
  }

  selectSurgeryType(item: any) {
    this.surgeryTypesList.forEach((element: any) => {
      if (element.id === item.id) {
        element.selected = !item.selected;
      } else {
        element.selected = false;
      }
    });
    const itemSelected = this.surgeryTypesList.filter(el => el.selected);
    if (itemSelected.length > 0) {
      this.FetchAssessmentRiskFactorValuesDataSS1List.forEach((el: any) => {
        el.AssessmentScore = "0.00";
        el.selected = false;
        el.RfValue = '2';
      });
      this.FetchAssessmentRiskFactorValuesDataSS2List.forEach((el: any) => {
        el.AssessmentScore = "0.00";
        el.selected = false;
        el.RfValue = '2';
      });
      this.FetchAssessmentRiskFactorValuesDataSS3List.forEach((el: any) => {
        el.AssessmentScore = "0.00";
        el.selected = false;
        el.RfValue = '2';
      });
      this.FetchAssessmentRiskFactorValuesDataSS4List.forEach((el: any) => {
        el.AssessmentScore = "0.00";
        el.selected = false;
        el.RfValue = '2';
      });
      this.totalRiskScore = 0;
    }
  }

  isSurgeryItemSelected() {
    return this.surgeryTypesList.filter(el => el.selected).length > 0;
  }

  selectHighRiskBleeding(type: any) {
    this.highrisk = type;
    if (this.highrisk == 1) {
      this.crclEnoxaparinOD = false;
      this.crclEnoxaparinBID = false;
      this.crclRivaroxaban = false;
      this.crclApixaban = false;
      this.crclDabigatran = false;
      this.crclEnoxaparin = false;
      this.crclApixabanBID = false;
      this.isMechanicalThrombo = true;
    }
    this.onLowBleedingRiskClick('');
    this.onHighBleedingRiskClick('');
    this.checkRiskScore();
  }

  //High Bleeding Low Risk
  isHighBleedingLowRisk = false;
  isHighBleedingLowRiskItem1 = false;

  //High Bleeding Moderate Risk
  isHighBleedingModerateRisk = false;

  //High Bleeding High Risk
  isHighBleedingHighRisk = false;

  onHighBleedingRiskClick(type: string) {
    if (type === 'low') {
      this.isHighBleedingLowRisk = !this.isHighBleedingLowRisk;
      this.isHighBleedingModerateRisk = false;
      this.isHighBleedingHighRisk = false;
    } else if(type === 'moderate') {
      this.isHighBleedingLowRisk = false;
      this.isHighBleedingModerateRisk = !this.isHighBleedingModerateRisk;
      this.isHighBleedingHighRisk = false;
    } else if (type === 'high') {
      this.isHighBleedingLowRisk = false;
      this.isHighBleedingModerateRisk = false;
      this.isHighBleedingHighRisk = !this.isHighBleedingHighRisk;
    } else {
      this.isHighBleedingLowRisk = false;
      this.isHighBleedingModerateRisk = false;
      this.isHighBleedingHighRisk = false;
    }
    // Deselect Sub Items
    this.isHighBleedingLowRiskItem1 = false;
  }

  // Low Bleeding Low Risk
  isLowBleedingLowRisk = false;

  // Low Bleeding Moderate Risk
  isLowBleedingModerateRisk = false;  
  isLowBleedingModerateRiskItem1 = false;
  isLowBleedingModerateRiskItem2 = false;
  isLowBleedingModerateRiskItem3 = false;
  isLowBleedingModerateRiskItem4 = false;
  isLowBleedingModerateRiskItem5 = false;
  isLowBleedingModerateRiskItem6 = false;

  // Low Bleeding High Risk
  isLowBleedingHighRisk = false;
  isLowBleedingHighRiskItem1 = false;
  isLowBleedingHighRiskItem2 = false;
  isLowBleedingHighRiskItem3 = false;
  isLowBleedingHighRiskItem4 = false;
  isLowBleedingHighRiskItem5 = false;
  isLowBleedingHighRiskItem6 = false;

  // Low Bleeding Highest Risk
  isLowBleedingHighestRisk = false;
  isLowBleedingHighestRiskItem1 = false;
  isLowBleedingHighestRiskItem2 = false;
  isLowBleedingHighestRiskItem3 = false;
  isLowBleedingHighestRiskItem4 = false;
  isLowBleedingHighestRiskItem5 = false;
  isLowBleedingHighestRiskItem6 = false;

  onLowBleedingRiskClick(type: string) {
    if (type === 'low') {
      this.isLowBleedingLowRisk = !this.isLowBleedingLowRisk;
      this.isLowBleedingModerateRisk = false;
      this.isLowBleedingHighRisk = false;
      this.isLowBleedingHighestRisk = false;
    } else if(type === 'moderate') {
      this.isLowBleedingLowRisk = false;
      this.isLowBleedingModerateRisk = !this.isLowBleedingModerateRisk;
      this.isLowBleedingHighRisk = false;
      this.isLowBleedingHighestRisk = false;
    } else if (type === 'high') {
      this.isLowBleedingLowRisk = false;
      this.isLowBleedingModerateRisk = false;
      this.isLowBleedingHighRisk = !this.isLowBleedingHighRisk;
      this.isLowBleedingHighestRisk = false;
    } else if (type === 'highest') {
      this.isLowBleedingLowRisk = false;
      this.isLowBleedingModerateRisk = false;
      this.isLowBleedingHighRisk = false;
      this.isLowBleedingHighestRisk = !this.isLowBleedingHighestRisk;
    } else {
      this.isLowBleedingLowRisk = false;
      this.isLowBleedingModerateRisk = false;
      this.isLowBleedingHighRisk = false;
      this.isLowBleedingHighestRisk = false;
    }
    // Deselect Sub Items
    this.clearLowRiskSubItems();
  }

  clearLowRiskSubItems() {
    this.isLowBleedingModerateRiskItem1 = false;
    this.isLowBleedingModerateRiskItem2 = false;
    this.isLowBleedingModerateRiskItem3 = false;
    this.isLowBleedingModerateRiskItem4 = false;
    this.isLowBleedingModerateRiskItem5 = false;
    this.isLowBleedingModerateRiskItem6 = false;

    this.isLowBleedingHighRiskItem1 = false;
    this.isLowBleedingHighRiskItem2 = false;
    this.isLowBleedingHighRiskItem3 = false;
    this.isLowBleedingHighRiskItem4 = false;
    this.isLowBleedingHighRiskItem5 = false;
    this.isLowBleedingHighRiskItem6 = false;
    
    this.isLowBleedingHighestRiskItem1 = false;
    this.isLowBleedingHighestRiskItem2 = false;
    this.isLowBleedingHighestRiskItem3 = false;
    this.isLowBleedingHighestRiskItem4 = false;
    this.isLowBleedingHighestRiskItem5 = false;
    this.isLowBleedingHighestRiskItem6 = false;
  }

  onLowBleedingModerateRiskItemsSelection(value1: boolean, value2: boolean, value3: boolean, value4: boolean, value5: boolean, value6: boolean, riskVal: any) {
    this.isLowBleedingModerateRiskItem1 = value1;
    this.isLowBleedingModerateRiskItem2 = value2;
    this.isLowBleedingModerateRiskItem3 = value3;
    this.isLowBleedingModerateRiskItem4 = value4;
    this.isLowBleedingModerateRiskItem5 = value5;
    this.isLowBleedingModerateRiskItem6 = value6;
    this.riskLevelValue = riskVal;
  }

  onLowBleedingHighRiskItemsSelection(value1: boolean, value2: boolean, value3: boolean, value4: boolean, value5: boolean, value6: boolean, riskVal: any) {
    this.isLowBleedingHighRiskItem1 = value1;
    this.isLowBleedingHighRiskItem2 = value2;
    this.isLowBleedingHighRiskItem3 = value3;
    this.isLowBleedingHighRiskItem4 = value4;
    this.isLowBleedingHighRiskItem5 = value5;
    this.isLowBleedingHighRiskItem6 = value6;
    this.riskLevelValue = riskVal;
  }

  onLowBleedingHighestRiskItemsSelection(value1: boolean, value2: boolean, value3: boolean, value4: boolean, value5: boolean, value6: boolean, riskVal: any) {
    this.isLowBleedingHighestRiskItem1 = value1;
    this.isLowBleedingHighestRiskItem2 = value2;
    this.isLowBleedingHighestRiskItem3 = value3;
    this.isLowBleedingHighestRiskItem4 = value4;
    this.isLowBleedingHighestRiskItem5 = value5;
    this.isLowBleedingHighestRiskItem6 = value6;
    this.riskLevelValue = riskVal;
  }
  onHighBleedingHighestRiskItemsSelection(riskVal: any) {
    this.isHighBleedingLowRiskItem1 = !this.isHighBleedingLowRiskItem1;
    this.riskLevelValue = riskVal;
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

export const vtesurgicalriskassessment = {
  FetchAssessmentRiskFactorRiskNormalSur: 'FetchAssessmentRiskFactorRiskNormalSur?UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAssessmentRiskFactorRiskBleeding: 'FetchAssessmentRiskFactorRiskBleeding?UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdviceDiagnosis: 'FetchAdviceDiagnosis?TBL=1&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchPatientTestResultVTE: 'FetchPatientTestResultVTE?AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientHeightWeight: 'FetchPatientHeightWeight',
  FetchNursingInterventionsVTE: 'FetchNursingInterventionsVTESur?UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SaveRiskAssessmentOrderDetailsSur: 'SaveRiskAssessmentOrderDetailsSur',
  UpdateRiskAssessmentVerifications: 'UpdateRiskAssessmentVerifications',
  FetchFinalSaveVTERiskAssessment: 'FetchFinalSaveVTERiskAssessment?AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchDVTRiskAssessmentFactorsNewSur: 'FetchDVTRiskAssessmentFactorsNewSur?RiskFactorSubGroupID=${RiskFactorSubGroupID}&AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  UpdateRiskAssessmentOrderDetails: 'UpdateRiskAssessmentOrderDetails'
};