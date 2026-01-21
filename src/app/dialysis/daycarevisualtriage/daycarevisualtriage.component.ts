import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmergencyConfigService as EmergencyConfig } from '../../../app/emergency/services/config.service';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { BaseComponent } from 'src/app/shared/base.component';
import { ConfigService } from 'src/app/services/config.service';
import { UtilityService } from 'src/app/shared/utility.service';

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
  selector: 'app-daycarevisualtriage',
  templateUrl: './daycarevisualtriage.component.html',
  styleUrls: ['./daycarevisualtriage.component.scss'],
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
export class DaycarevisualtriageComponent extends BaseComponent implements OnInit {

  patientData: any;
  visualTriageComponents: any;
  modeofTravel: any;
  nurseCheifComplaints: any;
  totalScore: number = 0;
  errorMessages: any = [];
  multiplePatient: any;
  visualTriageForm!: FormGroup;
  isIll: boolean = false;
  isWell: boolean = false;
  showCcRemarks: boolean = false;
  ctasScore: string = "";
  ctasScore1Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore2Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore3Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore4Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore5Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  validationMessages: any = [];
  ctasScoreDesc: any;
  IsHome = true;
  noPatientData = false;
  gender: string = "";
  isUnkownPatient = false;
  painScore: any;
  isDirty = false;
  selectedPainScoreId = 0;
  painScoreSelected: boolean = false;
  showHidePregnancyToggle: boolean = false;
  pregnancyValue: any = 'No';
  pregnancyToggle: boolean = false;
  facility: any;
  selectedPatientDYC: any;
  visualTriageData: any;
  constructor(
    private fb: FormBuilder,
    public datepipe: DatePipe,
    private router: Router,
    private _el: ElementRef,
    private config: EmergencyConfig,
    private configC: ConfigService,
    private us: UtilityService) {
    super();

    this.visualTriageForm = this.fb.group({
      PatientLooks: ['', Validators.required],
      ModeOfTravel: ['', Validators.required],
      CtasScore: ['', Validators.required],
      PatientID: [''],
      TotalScore: ['']
    });
  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    const selectedPatient = JSON.parse(sessionStorage.getItem("otpatient") || '{}');
    this.selectedPatientDYC = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
    $("#DurationOfIllnessUOMID").val('3');
    $('#nationalId').val(selectedPatient.SSN);
    this.onFetchPatient(selectedPatient.SSN, 'ssn');
    if (selectedPatient.VTOrderID) {
      this.fetchVisualTriageOrders(selectedPatient.VTOrderID);
    } else {
      this.FetchVisualTriageComponents();
      this.FetchModeOfarrival();
      this.FetchNurseChiefComplaints();
      this.fetchPainScoreMaster();
    }
  }

  ngOnDestroy() {
    sessionStorage.removeItem("otpatient")
  }


  omit_special_char(event: any) {
    var k;
    k = event.charCode;  //         k = event.keyCode;  (Both can be used)
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
  }

  onEnterPress(event: any, type: string) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      const id = (event.target as HTMLTextAreaElement).value;
      if (type == 'ssn') {
        //this.onFetchPatient(event, 'ssn');
        this.checkIfInpatient(id);
      }
      else if (type == 'mobileno')
        this.onFetchPatient(id, 'mobileno');
      else
        this.onFetchPatient(id, 'ssn');
    }
  }

  checkIfInpatient(ssn: any) {
    this.config.FetchCheckInPatientC(ssn, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.FetchCheckInPatientCDataList.length > 0 && response.FetchCheckInPatientCDataList[0].PatientID && response.FetchCheckInPatientCDataList[0].AdmissionID) {
          //this.validationMessages.push("This patient is currently admitted as an inpatient.");
          this.clearVisualTriage();
          //  $("#validationMessageModal").modal('show');
          this.errorMessages = [];
          if (response.FetchCheckInPatientCDataList[0].PatientType == '3' && response.FetchCheckInPatientCDataList[0].Status != '0')
            this.errorMessages = "This patient is currently admitted as an Emergency Patient on " + response.FetchCheckInPatientCDataList[0].AdmitDate + "";
          else if (response.FetchCheckInPatientCDataList[0].PatientType == '2' && response.FetchCheckInPatientCDataList[0].Status != '0')
            this.errorMessages = "This patient is currently admitted as an InPatient on " + response.FetchCheckInPatientCDataList[0].AdmitDate + "";

          $("#errorMessageModal").modal('show');
          return;
        }
        else {
          this.onFetchPatient(ssn, 'ssn');
        }
      },
        (err) => {
        })
    return false;
  }

  onFetchPatient(id: string, type: string) {
    //if(event.target.value.length >= 10) {
    var ssn = "0"; var mobileno = "0";
    if (type == 'ssn')
      ssn = id;
    else if (type == "mobileno")
      mobileno = id;
    this.config.FetchEMRPatientData(ssn, mobileno, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.FetchEMRPatientDataDataaList.length > 0 && type == "mobileno") {
          this.noPatientData = false;
          this.multiplePatient = response.FetchEMRPatientDataDataaList;
          this.multiplePatient.forEach((element: any, index: any) => {
            element.Class = "icon-w cursor-pointer";
          })
          $("#divMultiplePatients").modal('show');
        }
        else {
          if (response.FetchEMRPatientDataDataaList.length > 0) {
            this.noPatientData = false;
            this.patientData = response.FetchEMRPatientDataDataaList[0];

            var age = this.patientData.Age?.trim().toString().split(' ').length > 1 ? this.patientData.Age?.trim().split(' ')[0] : this.patientData.Age.trim();
            const openToggleYes = this.patientData.Age.trim() && this.patientData.Gender.trim() === "Female" && age > 15;
            if (openToggleYes) {
              this.showHidePregnancyToggle = true;
            }
          }
          else {
            this.errorMessages = [];
            this.errorMessages = "Patient is not registered.";
            $("#errorMessageModal").modal('show');
            this.noPatientData = true;
          }
        }

      },
        (err) => {
        })
    //}
    // else {
    //   this.validationMessages = [];
    //   this.validationMessages.push("Please select valid SSN/Mobile");
    //   $("#validationMessageModal").modal('show');
    // }
  }

  patientUnknownClick() {
    if (this.patientData != undefined && Object.keys(this.patientData).length > 0) {
      $("#patientAlreadySelected").modal('show');
    }
    else {
      this.noPatientData = true;
      this.isUnkownPatient = !this.isUnkownPatient;
    }
  }

  selectPatient(pat: any) {
    if (pat.Class == "icon-w cursor-pointer") {
      pat.Class = "icon-w cursor-pointer active";
    }
    this.checkIfInpatient(pat.SSN);
    this.patientData = pat;
    var age = this.patientData.Age?.trim().toString().split(' ').length > 1 ? this.patientData.Age?.trim().split(' ')[0] : this.patientData.Age.trim();
    const openToggleYes = this.patientData.Age.trim() && this.patientData.Gender.trim() === "Female" && age > 15;
    if (openToggleYes) {
      this.showHidePregnancyToggle = true;
    }
    $("#divMultiplePatients").modal('hide');
  }

  FetchVisualTriageComponents() {
    this.config.FetchVisualTriageComponents(this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
      .subscribe((response: any) => {
        this.visualTriageComponents = response.FetchVisualTriageComponentsDataaList;
        this.visualTriageComponents.forEach((element: any, index: any) => {
          element.ClassYes = "btn";
          element.ClassNo = "btn selected";
          element.Score = 0;
        });
        if (this.visualTriageData) {
          this.visualTriageComponents.forEach((element: any) => {
            const selectedElement = this.visualTriageData.FetchNurseTriageParametersDataaList.find((a: any) => a.CODE === element.CODE);
            this.calculateScore(element, selectedElement.Value === '0' ? 'No' : 'Yes', true);
          });
        }
      },
        (err) => {
        })
  }

  FetchModeOfarrival() {
    this.config.FetchModeOfarrival(this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
      .subscribe((response: any) => {
        this.modeofTravel = response.FetchModeOfarrivalDataaList;
        if (this.visualTriageData) {
          const visualData = this.visualTriageData.FetchPatientVisualTriageOrdersDataaList[0];
          setTimeout(() => {
            $("#modeofTravel").val(Number(visualData.ModeOfArrivalID));
          }, 0);
        }
      },
        (err) => {
        })
  }
  fetchPainScoreMaster() {
    this.configC.fetchPainScoreMasters().subscribe(response => {
      this.painScore = response.SmartDataList;
      this.painScore.forEach((element: any, index: any) => {
        if (element.id == 1) { element.imgsrc = "assets/images/image1.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center justify-content-between"; }
        else if (element.id == 2) { element.imgsrc = "assets/images/image2.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center justify-content-between"; }
        else if (element.id == 3) { element.imgsrc = "assets/images/image3.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center justify-content-between"; }
        else if (element.id == 4) { element.imgsrc = "assets/images/image4.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center justify-content-between"; }
        else if (element.id == 5) { element.imgsrc = "assets/images/image5.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center justify-content-between"; }
        else if (element.id == 6) { element.imgsrc = "assets/images/image6.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center justify-content-between"; }
      });
    })
  }
  painScoreClick(ps: any) {
    this.isDirty = true;
    ps.Class = "pain_reaction position-relative cursor-pointer active text-center justify-content-between";
    this.selectedPainScoreId = ps.id;
    this.painScore.forEach((element: any, index: any) => {
      if (element.id != ps.id)
        element.Class = "pain_reaction position-relative cursor-pointer text-center justify-content-between";
      this.painScoreSelected = true;
    });
  }

  FetchNurseChiefComplaints() {
    this.config.FetchNurseChiefComplaints(this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
      .subscribe((response: any) => {
        this.nurseCheifComplaints = response.FetchNurseChiefComplaintsDataList;
        this.nurseCheifComplaints.forEach((element: any, index: any) => {
          element.ccClass = "btn btn-secondary-outline fs-8 px-2 min-width-unset";
          element.ccSelected = false;
        });

        if (this.visualTriageData) {
          this.visualTriageData.FetchNurseChiefParametersDataaList.forEach((element: any) => {
            const selectedElement = this.nurseCheifComplaints.find((a: any) => a.NurseChiefComplaintID === element.ChiefComplaintID);
            if (selectedElement) {
              selectedElement.ccClass = "btn btn-secondary-outline fs-8 px-2 min-width-unset active";
              selectedElement.ccSelected = true;
            }
          });
        }

      },
        (err) => {
        })
  }

  isIllOrWell(type: string) {
    if (type == 'ill') {
      this.isIll = true;
      this.isWell = false;
    }
    else if (type == 'well') {
      this.isWell = true;
      this.isIll = false;
    }
  }

  calculateScore(comp: any, option: any, initialLoad?: boolean) {
    if ($("#nationalId").val() != '' || this.noPatientData) {
      if (option == "Yes") {
        comp.ClassYes = "btn selected";
        comp.ClassNo = "btn";
        comp.Score = Number(comp.AdultValue);
      }
      else {
        comp.ClassYes = "btn";
        comp.ClassNo = "btn selected";
        comp.Score = 0;
      }
      if (comp.VTComponentID.toString() !== '7' && !initialLoad) {
        this.selectChiefComplaints(comp);
      }
      var totScore = 0;
      this.visualTriageComponents.forEach((element: any, index: any) => {
        totScore = totScore + element.Score;
      });
      this.totalScore = totScore;
    }
    else {
      this.errorMessages = "Please select Patient";
      $("#errorMessageModal").modal('show');
    }
  }

  selectChiefComplaints(comp: any) {
    //var chiefcompsid = comp?.map((item: any) => item.ChiefcomplaintIDs).join(',');
    if (comp.ChiefcomplaintIDs.split(',').length > 1) {
      comp.ChiefcomplaintIDs.split(',').forEach((element: any, index: any) => {
        this.nurseCheifComplaints.forEach((ele: any, ind: any) => {
          if (element == ele.NurseChiefComplaintID) {
            if (ele.ccClass == "btn btn-secondary-outline fs-8 px-2 min-width-unset") {
              ele.ccClass = "btn btn-secondary-outline fs-8 px-2 min-width-unset active";
              ele.ccSelected = true;
            }
            else {
              ele.ccClass = "btn btn-secondary-outline fs-8 px-2 min-width-unset"
              ele.ccSelected = false;
            }
          }
        });
      });
    }
    else {
      this.nurseCheifComplaints.forEach((ele: any, ind: any) => {
        if (comp.ChiefcomplaintIDs == ele.NurseChiefComplaintID) {
          if (ele.ccClass == "btn btn-secondary-outline fs-8 px-2 min-width-unset") {
            ele.ccClass = "btn btn-secondary-outline fs-8 px-2 min-width-unset active";
            ele.ccSelected = true;
          }
          else {
            ele.ccClass = "btn btn-secondary-outline fs-8 px-2 min-width-unset"
            ele.ccSelected = false;
          }
        }
      });
    }
  }

  saveVisualTriage() {
    if (this.validateVisualTriage()) {
      var CTASDetails: any[] = [];

      this.visualTriageComponents.forEach((element: any) => {
        CTASDetails.push({
          "VTCID": element.VTComponentID,
          "VL": element.Score
        })
      });

      var NurseCheifComplaints: any[] = [];
      this.nurseCheifComplaints.forEach((element: any) => {
        if (element.ccSelected) {
          NurseCheifComplaints.push({
            "NCHFID": element.NurseChiefComplaintID,
            "RMK": $('#chiefComplaints').val() == undefined ? "" : $('#chiefComplaints').val()
          })
        }
      });

      var isIllOrWell = '1';
      if (this.isIll) isIllOrWell = '1';
      else if (this.isWell) isIllOrWell = '2';

      var payload = {
        "VTOrderID": "0",
        "AdmissionID": "0",
        "PatientID": this.noPatientData ? '0' : this.patientData?.PatientID,
        "TotalScore": this.totalScore,
        "NationalID": this.noPatientData ? "0" : this.patientData?.SSN,
        "ChiefCompliant": $('#chiefComplaints').val(),
        "HospitalID": this.hospitalID,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        "PatientlookID": isIllOrWell,
        "ModeOfArrivalID": $("#modeofTravel").val(),
        "NurseCTASScore": this.ctasScore ? this.ctasScore : "0",
        "DurationOfIllNess": $("#DurationOfIllness").val(),
        "DurationOfIllNessUOMID": $("#DurationOfIllnessUOMID").val(),
        "CTASDetails": this.ctasScore == "1" || this.ctasScore == "2" ? null : CTASDetails,
        "NurseCheifComplaints": NurseCheifComplaints,
        "EmpID": this.doctorDetails[0].EmpId,
        "GenderId": this.noPatientData ? this.gender : this.patientData?.GenderID,
        "MobileNo": this.noPatientData ? $("#mobileNo").val() : this.patientData?.MobileNo,
        "NursePainScoreID": this.selectedPainScoreId,
        "IsPregnency": this.pregnancyToggle ? true : false,
        "TestOrderItemID": this.selectedPatientDYC.TestOrderItemID,
      }
      this.config.SavePatientDYCCTAS(payload).subscribe(response => {
        if (response.Code == 200) {
          $("#saveVisualTriageMsg").modal('show');
        }
      })
    }
  }

  continueOrClosePatientSelected(type: string) {
    if (type == 'clear') {
      this.clearVisualTriage();
      this.noPatientData = true;
    }
    else {
      this.noPatientData = false;
    }
  }

  clearVisualTriage() {
    this.patientData = null;
    $("#nationalId").val('');
    $("#mobileNo").val('');
    $("#DurationOfIllness").val('');
    $("#DurationOfIllnessUOMID").val('3');
    $("#modeofTravel").val('0');
    this.ctasScore = "";
    this.ctasScoreDesc = "";
    this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class =
      this.ctasScore5Class = "cursor-pointer circle d-flex align-items-center justify-content-center";
    this.totalScore = 0;
    this.isIll = this.isWell = false;
    this.visualTriageComponents.forEach((element: any, index: any) => {
      element.ClassYes = "btn";
      element.ClassNo = "btn selected";
      element.Score = 0;
    });
    this.nurseCheifComplaints.forEach((element: any, index: any) => {
      element.ccClass = "btn btn-secondary-outline fs-8 px-2 min-width-unset";
      element.ccSelected = false;
    });
    this.noPatientData = false;
    this.selectedPainScoreId = 0;
    this.pregnancyToggle = false;
    this.painScore.forEach((element: any, index: any) => {
      element.Class = "pain_reaction position-relative cursor-pointer text-center justify-content-between";
    });
    this.showHidePregnancyToggle = false;
  }

  selectedCheifComplaints(comp: any) {
    if (comp.ccClass == "btn btn-secondary-outline fs-8 px-2 min-width-unset") {
      comp.ccClass = "btn btn-secondary-outline fs-8 px-2 min-width-unset active";
      comp.ccSelected = true;
      if (comp.NurseChiefComplaint == "Others")
        this.showCcRemarks = true;
    }
    else {
      comp.ccClass = "btn btn-secondary-outline fs-8 px-2 min-width-unset";
      comp.ccSelected = false;
      if (comp.NurseChiefComplaint == "Others")
        this.showCcRemarks = false;
    }
  }

  calcCtasScore(score: string, ctasDesc: string) {
    this.ctasScore = score;
    this.ctasScoreDesc = ctasDesc;
    if (score == "1") {
      this.ctasScore1Class = "cursor-pointer circle d-flex align-items-center justify-content-center active Resuscitation";
      this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "2") {
      this.ctasScore2Class = "cursor-pointer circle d-flex align-items-center justify-content-center active Emergent";
      this.ctasScore1Class = this.ctasScore3Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "3") {
      this.ctasScore3Class = "cursor-pointer circle d-flex align-items-center justify-content-center active Urgent";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "4") {
      this.ctasScore4Class = "cursor-pointer circle d-flex align-items-center justify-content-center active LessUrgent";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "5") {
      this.ctasScore5Class = "cursor-pointer circle d-flex align-items-center justify-content-center active NonUrgent";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
  }

  validateVisualTriage() {
    var nursechiefcomps = this.nurseCheifComplaints.filter((c: any) => c.ccSelected == true);
    if (!this.isIll && !this.isWell) {
      this.validationMessages.push("Please select Patient looks");
    }
    if ($("#modeofTravel").val() == "0") {
      this.validationMessages.push("Please select Patient Mode of Arrival");
    }
    // if (this.ctasScore == "") {
    //   this.validationMessages.push("Please select CTAS Score");
    // }
    if ($("#DurationOfIllness").val() == "" && (this.ctasScore != "1" && this.ctasScore != "2")) {
      this.validationMessages.push("Please enter Duration of Illness");
    }
    if ($("#DurationOfIllnessUOMID").val() == "0") {
      this.validationMessages.push("Please select Duration of Illness");
    }
    if (nursechiefcomps.length == 0 && (this.ctasScore != "1" && this.ctasScore != "2")) {
      this.validationMessages.push("Please select Chief Complaints");
    }
    if ($("#nationalId").val() == '' && $("#mobileNo").val() == '' && this.noPatientData && this.ctasScore != '1' && this.ctasScore != '2') {
      this.validationMessages.push("Please enter SSN or Mobile No");
    }
    // if (this.totalScore == 0 && (this.ctasScore != "1" && this.ctasScore != "2")) {
    //   this.validationMessages.push("Please select atleast one Components score");
    // }
    if (this.noPatientData && this.gender == '') {
      this.validationMessages.push("Please select Gender");
    }
    if (this.validationMessages.length > 0) {
      $("#validationMessageModal").modal('show');
      return false;
    }
    return true;
  }
  clearValidationMessages() {
    this.validationMessages = [];
  }

  selectGender(type: string) {
    if (type == '1') {
      this.gender = "1"
    }
    else if (type == '2') {
      this.gender = "2";
    }
  }
  setPainScorevalue(ps: any) {
    this.selectedPainScoreId = ps.id;
    this.painScoreSelected = true;
  }
  getPainScoreName(psid: number) {
    if (psid === null || psid === 0) {
      return 'Select' + '-' + '';
    }
    const ps = this.painScore?.find((x: any) => x.id == psid);
    return ps?.name.split('-')[0] + '-' + ps?.code
  }
  togglePregnancy() {
    this.pregnancyToggle = !this.pregnancyToggle;
  }
  pregnancyClick(preg: any) {
    if (preg == "Yes")
      this.pregnancyValue = "Yes";
    else
      this.pregnancyValue = "No";
  }

  scoresData = [
    { id: '1', description: 'Resuscitation' },
    { id: '2', description: 'Emergent' },
    { id: '3', description: 'Urgent' },
    { id: '4', description: 'Less Urgent' },
    { id: '5', description: 'Non Urgent' }
  ];

  fetchVisualTriageOrders(OrderID: any) {
    const apiURL = 'FetchPatientVisualTriageOrders?VTOrderID=${VTOrderID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}';
    const url = this.us.getApiUrl(apiURL, {
      VTOrderID: OrderID,
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.visualTriageData = response;
          this.FetchVisualTriageComponents();
          this.FetchModeOfarrival();
          this.FetchNurseChiefComplaints();
          this.fetchPainScoreMaster();
          const visualData = this.visualTriageData.FetchPatientVisualTriageOrdersDataaList[0];
          const score = this.scoresData.find((e: any) => e.id === visualData.CTASScore);
          if (score) {
            this.calcCtasScore(score.id, score.description);
          }
          $("#DurationOfIllnessUOMID").val(visualData.DurationofIllNessUOM);
          $("#DurationOfIllness").val(visualData.DurationOfIllness);
          if (visualData.PatientlookID === '1') {
            this.isIll = true;
            this.isWell = false;
          } else if (visualData.PatientlookID === '2') {
            this.isWell = true;
            this.isIll = false;
          }
        }
      },
        (err) => {
        })
  }
}
