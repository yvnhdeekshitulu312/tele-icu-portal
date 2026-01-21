import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as appConfig } from 'src/app/services/config.service';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmergencyConfigService } from 'src/app/emergency/services/config.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { MedicalAssessmentComponent } from 'src/app/portal/medical-assessment/medical-assessment.component';
import { MedicalAssessmentPediaComponent } from 'src/app/portal/medical-assessment-pedia/medical-assessment-pedia.component';
import { MedicalAssessmentObstericComponent } from 'src/app/portal/medical-assessment-obsteric/medical-assessment-obsteric.component';
import { MedicalAssessmentSurgicalComponent } from 'src/app/portal/medical-assessment-surgical/medical-assessment-surgical.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ipissues } from '../changepassword/changepassword.component';
import { InPatientDischargeSummaryComponent } from 'src/app/shared/inpatient-discharge-summary/inpatient-discharge-summary.component';
import { MedicalReportComponent } from 'src/app/shared/medical-report/medical-report.component';
import { ProgressNoteComponent } from 'src/app/ward/progress-note/progress-note.component';
import { VteRiskAssessmentComponent } from 'src/app/ward/vte-risk-assessment/vte-risk-assessment.component';
import { VteSurgicalRiskAssessmentComponent } from 'src/app/ward/vte-surgical-risk-assessment/vte-surgical-risk-assessment.component';
import { VteObgAssessmentComponent } from 'src/app/ward/vte-obg-assessment/vte-obg-assessment.component';
import { ChiDischargesummaryComponent } from 'src/app/shared/chi-dischargesummary/chi-dischargesummary.component';

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
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
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
export class HomeComponent implements OnInit {
  @ViewChild('acknowledgeSection') acknowledgeSection!: ElementRef;
  doctorDetails: any;
  hospitalId: any;
  FetchUserFacilityDataList: any;
  FetchUserOPDFacilityList: any = [];
  ipCount: any = 0;
  opCount: any = 0;
  emergencyCount: any = 0;
  location: any;
  currentdate: any;
  currentGreeting!: string;
  currentTime: Date = new Date();
  interval: any;
  labPanicCount: number = 0;
  referralCount: number = 0;
  langData: any;
  lang: any;
  showLabPanicDetails: boolean = false;
  showReferrals: boolean = false;
  tablePanicForm!: FormGroup;
  FetchPanicData: FetchPanicDetails[] = [];
  labPanicCountDetails: any = [];
  labPanicCountDetailsFiltered: any = [];
  labPanicCountDetailsDistinct: any = [];
  groupedDataPanic: { [key: string]: FetchPanicDetails[] } = {};
  groupedDataInvArray: { group: string, values: FetchPanicDetails[] }[] = [];
  groupedData: { [key: string]: PatientDetails[] } = {};
  groupedDataArray: { date: string, values: PatientDetails[] }[] = [];
  showLabackwlegementDetails: { [key: number]: boolean } = {};
  referralsToMeData: any;
  referralsByMeData: any;
  referredToMeText: string = "Referred To Me";
  referredToMeText2L: string = "Referred To Me";
  referredToMe: boolean = true;
  referredToMeClass: string = "fs-7 btn selected";
  referredByMeClass: string = "fs-7 btn";
  selectedRefferedToMePatients: any;
  tableReferralsForm!: FormGroup;
  tableAssessmentForm!: FormGroup;
  dischargeSummaryForm!: FormGroup;
  medicalReportForm!: FormGroup;
  tableOrdersForm!: FormGroup;
  showReferralsCalendarControls: boolean = true;
  dashboardTabClass: string = "tab-pane fade show active";
  panicTabClass: string = "tab-pane";
  referralsTabClass: string = "tab-pane";
  navLinkActive: string = "nav-link active";
  navLink: string = "nav-link panic_lab_btn d-flex align-items-center";
  navLinkPanic: string = "nav-link panic_lab_btn d-flex align-items-center";
  navLinkEndorse: string = "nav-link panic_lab_btn d-flex align-items-center";
  selectedPatientSSN: any;
  selectedPatientName: any;
  selectedPatientGender: any;
  selectedPatientAge: any;
  selectedPatientMobile: any;
  selectedPatientVTScore: any;
  selectedPatientHeight: any;
  selectedPatientWeight: any;
  selectedPatientWeightCreatedate: any;
  selectedPatientBloodGrp: any;
  selectedPatientVitalsDate: any;
  selectedPatientBPSystolic: any;
  selectedPatientBPDiastolic: any;
  selectedPatientTemperature: any;
  selectedPatientPulse: any;
  selectedPatientSPO2: any;
  selectedPatientRespiration: any;
  selectedPatientConsciousness: any;
  selectedPatientO2FlowRate: any;
  selectedPatientAllergies: any;
  selectedPatientMedications: any = [];
  selectedPatientIsVip: boolean = false;
  selectedPatientClinicalInfo: any;
  selectedPatientIsPregnancy: boolean = false;
  selectedPatientPregnancyTrisemister: any;
  selectedPatientVisitDiagnosis: any;
  selectedPatientVisitDiagnosisDate: any;
  selectedPatientVisitSurgeryOrder: any;
  selectedPatientVisitSurgeryOrderDate: any;
  selectedPatientReferalReason: any;
  selectedPatientReferalRemarks: any;
  selectedPatientVisitLabOrder: any;
  selectedPatientVisitLabOrderDate: any;
  IsEmergency = false;
  employeeInfo: any;
  doctorNotifications: any;
  base64StringSig1 = '';
  showSignature: boolean = false;
  employeeSignInfoForm!: FormGroup;
  patinfo: any;
  trasnferRequests: any;
  showTransferRequests: boolean = false;
  transferRequestsCount = 0;
  groupedByDate: { [key: string]: any };
  groupedByDateTransfer: { [key: string]: any };
  ValidationMSG: any;
  transferRejectRemarksForPatientName: string = "";
  selectedPatientToReject: any;
  pinfo: any;
  wtpinfo: any;
  showRejectRemarksValidation: boolean = false;
  currenttab = 'dashboard';
  assessmentCollection: any = [];
  assessmentCollectionC: any = [];

  dischargeSummaryVerificationList: any = [];
  medicalReportVerificationList: any = [];

  closeSubscription: any;
  nphiesrequest : any = [];
  commRequestPayloads: any = [];
  commRequestReasons: any = [];

  commResponsePayloads: any = [];
  commResponseReasons: any = [];
  errorMessage = "";
  selectedPatientCommRequests: any = [];
  approvalsCommReqsCount: number = 0;
  dischargeSummCount: number = 0;
  dischargeSummCountC: number = 0;
  dischargeSummCountFC: number = 0;
  medicalReportCount: number = 0;
  docResponse: string = "";
  tabType = "AssessmentReview";
  isChangePassword = false;
  changePwdForm!: FormGroup;
  changePwdValidationMSg: string = '';
  showPasswordValidationMsg: boolean = false;
  cancelledSurgeryOrdersList: any = [];
  cancelAckRemarksValidation: boolean = false;
  surOrderCount : number = 0;
  vteCount: number = 0;
  vteDataList: any;

  constructor(private router: Router, private config: BedConfig, private logconfig: ConfigService, private opconfig: ConfigService, public datepipe: DatePipe,
    private fb: FormBuilder, private emrconfig: EmergencyConfigService, private appconfig: appConfig, private modalService: GenericModalBuilder, private utilityService: UtilityService) {
    this.langData = this.opconfig.getLangData();
    this.lang = sessionStorage.getItem("lang");
    if (this.lang == "ar")
      this.referredToMeText2L = this.langData?.common?.ReferredToMe;

    this.employeeSignInfoForm = this.fb.group({
      Signature1: ['']
    });
    this.groupedByDate = [];
    this.groupedByDateTransfer = [];

    this.changePwdForm= this.fb.group({
      UserName: [''],
      OldPassword: ['', Validators.required],
      NewPassword: ['', Validators.required],
      ConfirmPassword: ['', Validators.required]
    });

    this.dischargeSummaryForm = this.fb.group({
      FromDate: [new Date()],
      ToDate: [new Date()],
    });
    this.medicalReportForm = this.fb.group({
      FromDate: [new Date()],
      ToDate: [new Date()],
    });

    this.tableOrdersForm = this.fb.group({
      FromDate: [new Date()],
      ToDate: [new Date()],
    });
  }

  ngOnInit(): void {
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.fetchUserFacility();
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY');
    this.startClock();
    this.setCurrentGreeting();
    this.initializetablePanicForm();
    this.initializetableReferralsForm();
    this.initializeAssessmentForm();
    var d = new Date();
    var wm = new Date(d);
    wm.setDate(wm.getDate() - 7);
    this.tablePanicForm.patchValue({
      FromDate: wm,
      ToDate: d
    });

    var rm = new Date(d);
    wm.setDate(rm.getDate() - 5);
    this.tableReferralsForm.patchValue({
      FromDate: rm,
      ToDate: d
    });
    this.tableReferralsForm.patchValue({
      FromDate: this.datepipe.transform(new Date().setDate(new Date().getDate() - 5), "dd-MMM-yyyy")?.toString(),
      ToDate: d
    });


    const emergencyValue = sessionStorage.getItem("IsEmergency");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsEmergency = (emergencyValue === 'true');
    } else {
      this.IsEmergency = false;
    }

    this.fetchReferralCount();
    this.FetchTransferRequests();
    this.getDoctorNotifications();
    // this.getAssessmentData();
    this.FetchClinicCounters();


    this.closeSubscription = this.utilityService.closeModalEvent.subscribe(() => {
      if (this.tabType === 'assessment') {
        this.getAssessmentData();
      }
      if(this.tabType.toString().toLowerCase() === 'dischargesummary') {
        this.getDischargesummaryRequests();
      }
      if(this.tabType.toString().toLowerCase() === 'medicalreport') {
        this.getMedicalReportRequests();
      }
      if(this.tabType.toString().toLowerCase() === 'vte') {
        this.getVTEData();
      }
    });

    this.showCommunicationRequest();

    this.changePwdForm.patchValue({
      UserName: this.doctorDetails[0].UserName
    });

    // this.getDischargesummaryRequests();
    // this.getMedicalReportRequests();
    // this.getVTEData();
    this.getReviewTabCount();
    this.FetchPSurgeryRequestCancelWorkList();
  }

  initializetablePanicForm() {
    this.tablePanicForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });
  }

  initializetableReferralsForm() {
    this.tableReferralsForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });
  }

  initializeAssessmentForm() {
    this.tableAssessmentForm = this.fb.group({
      FromDate: [new Date()],
      ToDate: [new Date()],
    });
  }

  navigate(page: any, facility: any) {
    sessionStorage.setItem("IsEmergencyTile", 'false');
    sessionStorage.setItem("PatientTypeClick", page);
    if (page === "OP") {
      const opFacilityId = this.FetchUserOPDFacilityList.find((x:any) => x.FacilityTypeID === '10');
      if(opFacilityId) {
        const facilityId = opFacilityId.FacilityID;
        sessionStorage.setItem("facility", JSON.stringify(facilityId));
      }      
      if (this.doctorDetails[0].OPClinicDisplay?.toString() === 'YES') {
        sessionStorage.setItem('showClinicDisplay', 'true');
      }
      this.router.navigate(['/home/patients']);
    }
    else if (page === "IP") {
      sessionStorage.setItem("facility", JSON.stringify(facility));
      if(facility.FacilityTypeID === '11') {
        sessionStorage.setItem("fromDocHomePage", 'true');
        this.router.navigate(['/ot/ot-dashboard']);
      }
      else {
        this.router.navigate(['/ward']);
      }
    }
    else if (page === "E") {
      sessionStorage.setItem("IsEmergencyTile", 'true');
      this.router.navigate(['/emergency']);
    }
    else if (page === "R") {
      this.router.navigate(['/stats']);
    }
  }

  fetchUserFacility() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchUserOPDFacilityList = response.FetchUserFacilityDataList;
        this.FetchUserFacilityDataList = response.FetchUserWardFacilityDataaList;
        this.ipCount = response.FetchUserFacilityCountDataList[0].WardCount;
        this.opCount = response.FetchUserFacilityCountDataList[0].OPCount;
        this.emergencyCount = response.FetchUserFacilityCountDataList[0].EMRCount;
      },
        (err) => {
        })

  }

  private setCurrentGreeting(): void {
    const currentHour = new Date().getHours();

    if (currentHour >= 0 && currentHour < 12) {
      this.currentGreeting = this.langData?.common?.currentGreetingG;
      //this.currentGreeting = 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 17) {
      this.currentGreeting = this.langData?.common?.currentGreetingA;
      //this.currentGreeting = 'Good Afternoon';
    } else {
      this.currentGreeting = this.langData?.common?.currentGreetingE;
      //this.currentGreeting = 'Good Evening';
    }
  }

  ngOnDestroy(): void {
    this.stopClock();
    if(this.closeSubscription) {
      this.closeSubscription.unsubscribe();
    }
  }

  startClock(): void {
    this.interval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  stopClock(): void {
    clearInterval(this.interval);
  }
  onLogout() {
    this.logconfig.onLogout();
  }

  filterFunction(data: any, patientId: any, OrderDate?: any) {
    if (OrderDate) {
      return data.filter((row: any) => row.values[0].PatientID == patientId && row.values[0].OrderDate === OrderDate);
    } else {
      return data.filter((row: any) => row.values[0].PatientID == patientId);
    }
    
  }

  getLabPanicResults() {
    this.FetchPanicData = [];

    this.dashboardTabClass = "tab-pane active";
    this.panicTabClass = "tab-pane";
    this.referralsTabClass = "tab-pane";
    this.navLinkActive = "nav-link";
    this.navLink = "nav-link panic_lab_btn d-flex align-items-center";
    this.navLinkPanic = "nav-link panic_lab_btn d-flex align-items-center active";
    this.navLinkEndorse = "nav-link panic_lab_btn d-flex align-items-center";
    this.showTransferRequests = false;
    // const headerToggleElement = document.querySelector('.header_toggle') as HTMLElement;
    // headerToggleElement.style.display = 'none';
    // const weekButton = document.getElementById('prevWeek') as HTMLElement;
    // const monthButton = document.getElementById('prevMonth') as HTMLElement;
    // const dateRangeButton = document.querySelector('.date_range_calendar') as HTMLElement;
    // const refreshIcon = document.getElementById('btnRefresh') as HTMLElement;

    this.showLabPanicDetails = true;

    var FromDate = this.datepipe.transform(this.tablePanicForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePanicForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    this.opconfig.fetchDocPanicCountResults(FromDate, ToDate, this.doctorDetails[0].EmpId, 2, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        this.labPanicCountDetails = response.FetchDocPanicDetailedCountDataaList;
        this.labPanicCount = Number(response?.FetchDocPanicCountDataaList[0].IspanicAbnormal);

        const distinctThings = response.FetchDocPanicDetailedCountDataaList.filter(
          (thing: any, i: any, arr: any) => arr.findIndex((t: any) => (t.PatientID === thing.PatientID) && (t.OrderDate === thing.OrderDate)) === i);
        console.dir(distinctThings);
        this.labPanicCountDetailsDistinct = distinctThings;
        this.labPanicCountDetailsDistinct.forEach((element: any, index: any) => {
          var panicCount = this.labPanicCountDetailsDistinct.filter((r: any) => r.IsPanic == 1 && r.PatientID == this.labPanicCountDetailsDistinct[index].PatientID).length;
          var abnormalCount = this.labPanicCountDetailsDistinct.filter((r: any) => r.IsAbnormal == 1 && r.PatientID == this.labPanicCountDetailsDistinct[index].PatientID).length;
          if (panicCount > 0) {
            element.Class = "legend_line panic";
            element.abnormalPanicText = "Panic";
          }
          else if (abnormalCount > 0) {
            element.Class = "legend_line abnormal";
            element.abnormalPanicText = "Abnormal";
          }
          else {
            element.Class = "";
          }
        });
        this.groupedDataPanic = {};
        this.groupedDataInvArray = [];
        this.labPanicCountDetails.forEach((element: any, index: any) => {
          if (parseFloat(element.ResultValue) > parseFloat(element.Maxlimit) || parseFloat(element.ResultValue) < parseFloat(element.MinLimit)) {
            element.Color = "red";
          }
          this.FetchPanicData.push({
            PatientID: element.PatientID, TestOrderID: element.TestOrderID, TestOrderItemID: element.TestOrderItemID,
            PanicResult: element.PanicResult, group: element.TestName, name: element.CompONentname, AbnormalResult: element.AbnormalResult,
            ResultValue: element.ResultValue, Maxlimit: element.Maxlimit, MinLimit: element.MinLimit, createdate: element.createdate, UOM: element.UOM,
            ServiceID: element.ServiceID, Isresult: element.isResult, Color: element.Color, OrderDate: element.OrderDate
          });
        });
        this.FetchPanicData.forEach((data) => {
          const key = data.group + ' ' + data.OrderDate
          if (!this.groupedDataPanic[key]) {
            this.groupedDataPanic[key] = [];
          }
          this.groupedDataPanic[key].push(data);
        });
        this.convertToArray();
      }
    },
      (err) => {
      })
  }
  private convertToArray(): void {
    this.groupedDataArray = Object.keys(this.groupedData).map((date) => ({
      date,
      values: this.groupedData[date],
    }));

    this.groupedDataArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.groupedDataInvArray = Object.keys(this.groupedDataPanic).map((group) => ({
      group,
      values: this.groupedDataPanic[group],
    }));
  }

  savePanicResultsAcknowledgement(panicres: any, testRemarks: any) {
    if (testRemarks.value != "") {
      let ackpayload =
      {
        "DoctorID": this.doctorDetails[0].EmpId,
        "PanicTestsXML":
          [{
            "TOID": panicres.TestOrderItemID,
            "DRRMK": testRemarks.value
          }]
      }
      this.opconfig.updateIsdocReadRemarks(ackpayload).subscribe(
        (response) => {
          if (response.Code == 200) {
            $("#savePanicResultsAcknowledgement").modal('show');

          } else {

          }
        },
        (err) => {
          console.log(err)
        });

    }

    else {
      $("#showRemarksValidation").modal('show');
    }
  }
  acknowledgeClear(index: any) {
    this.showLabackwlegementDetails[index] = !this.showLabackwlegementDetails[index];
    if (this.showLabackwlegementDetails[index]) {
      this.backToAcknowledge();
    }
  }
  backToAcknowledge() {
    if (this.acknowledgeSection && this.acknowledgeSection.nativeElement) {
      const element = this.acknowledgeSection.nativeElement;
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  acknowledgeTest(index: any) {
    this.showLabackwlegementDetails[index] = true;
  }
  toggle_labpanic(panicres: any) {
    panicres.showAcknowledgeBtn = !panicres.showAcknowledgeBtn;
  }

  fetchPanicwithdates1(filter: any) {
    if (filter === "M") {
      $("#prevMonth").addClass("btn-main-fill");
      $("#prevMonth").removeClass("btn-main-outline");
      $("#prevWeek").removeClass("btn-main-fill");
      $("#prevWeek").addClass("btn-main-outline");

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 1);
      var pd = new Date();
      this.tablePanicForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "W") {
      $("#prevMonth").removeClass("btn-main-fill");
      $("#prevMonth").addClass("btn-main-outline");
      $("#prevWeek").addClass("btn-main-fill");
      $("#prevWeek").removeClass("btn-main-outline");
      var d = new Date();
      d.setDate(d.getDate() - 7); // Subtract 7 days for the past week.
      var wm = d;
      var pd = new Date();
      this.tablePanicForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    this.getLabPanicResults();
  }

  fetchPanicwithdates(filter: any) {
    if (filter === "M") {
      $("#prevMonthReferrals").addClass("btn-main-fill");
      $("#prevMonthReferrals").removeClass("btn-main-outline");
      $("#prevWeekReferrals").removeClass("btn-main-fill");
      $("#prevWeekReferrals").addClass("btn-main-outline");

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 1);
      var pd = new Date();
      this.tablePanicForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "3M") {
      $("#prevMonthReferrals").addClass("btn-main-fill");
      $("#prevMonthReferrals").removeClass("btn-main-outline");
      $("#prevWeekReferrals").removeClass("btn-main-fill");
      $("#prevWeekReferrals").addClass("btn-main-outline");

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 3);
      var pd = new Date();
      this.tablePanicForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "6M") {
      $("#prevMonthReferrals").addClass("btn-main-fill");
      $("#prevMonthReferrals").removeClass("btn-main-outline");
      $("#prevWeekReferrals").removeClass("btn-main-fill");
      $("#prevWeekReferrals").addClass("btn-main-outline");

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 6);
      var pd = new Date();
      this.tablePanicForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "1Y") {
      $("#prevMonthReferrals").addClass("btn-main-fill");
      $("#prevMonthReferrals").removeClass("btn-main-outline");
      $("#prevWeekReferrals").removeClass("btn-main-fill");
      $("#prevWeekReferrals").addClass("btn-main-outline");

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 12);
      var pd = new Date();
      this.tablePanicForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "W") {
      $("#prevMonthReferrals").removeClass("btn-main-fill");
      $("#prevMonthReferrals").addClass("btn-main-outline");
      $("#prevWeekReferrals").addClass("btn-main-fill");
      $("#prevWeekReferrals").removeClass("btn-main-outline");
      var d = new Date();
      d.setDate(d.getDate() - 7); // Subtract 7 days for the past week.
      var wm = d;
      var pd = new Date();
      this.tablePanicForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "T") {
      $("#prevMonthReferrals").removeClass("btn-main-fill");
      $("#prevMonthReferrals").addClass("btn-main-outline");
      $("#prevWeekReferrals").addClass("btn-main-fill");
      $("#prevWeekReferrals").removeClass("btn-main-outline");
      var d = new Date();
      d.setDate(d.getDate()); // Subtract 7 days for the past week.
      var wm = d;
      var pd = new Date();
      this.tablePanicForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    this.getLabPanicResults();
  }





  showPatientsData() {
    ///var reftomeCount = this.referralsToMeData.filter((f: any) => f.Status == "0");
    //var reftomeCount = this.referralsToMeData.filter((f: any) => f.Status == "3");
    //if (this.referralCount == 0) {
      this.showReferrals = false;
      this.showLabPanicDetails = false;
      this.dashboardTabClass = "tab-pane fade show active";
      this.panicTabClass = "tab-pane";
      this.referralsTabClass = "tab-pane";
      this.navLinkActive = "nav-link active";
      this.navLink = "nav-link panic_lab_btn d-flex align-items-center";
      this.navLinkPanic = "nav-link panic_lab_btn d-flex align-items-center";
      this.navLinkEndorse = "nav-link panic_lab_btn d-flex align-items-center";
      this.showTransferRequests = false;
      this.fetchLabResultPanic();
    //}
    // else {
    //   $("#validateReferralAccetOrRejectMsg").modal('show');
    //   this.getReferralsData();

    // }
  }

  fetchReferralswithdates(filter: any) {
    if (filter === "M") {
      $("#prevMonthReferrals").addClass("btn-main-fill");
      $("#prevMonthReferrals").removeClass("btn-main-outline");
      $("#prevWeekReferrals").removeClass("btn-main-fill");
      $("#prevWeekReferrals").addClass("btn-main-outline");

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 1);
      var pd = new Date();
      this.tableReferralsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "3M") {
      $("#prevMonthReferrals").addClass("btn-main-fill");
      $("#prevMonthReferrals").removeClass("btn-main-outline");
      $("#prevWeekReferrals").removeClass("btn-main-fill");
      $("#prevWeekReferrals").addClass("btn-main-outline");

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 3);
      var pd = new Date();
      this.tableReferralsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "6M") {
      $("#prevMonthReferrals").addClass("btn-main-fill");
      $("#prevMonthReferrals").removeClass("btn-main-outline");
      $("#prevWeekReferrals").removeClass("btn-main-fill");
      $("#prevWeekReferrals").addClass("btn-main-outline");

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 6);
      var pd = new Date();
      this.tableReferralsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "1Y") {
      $("#prevMonthReferrals").addClass("btn-main-fill");
      $("#prevMonthReferrals").removeClass("btn-main-outline");
      $("#prevWeekReferrals").removeClass("btn-main-fill");
      $("#prevWeekReferrals").addClass("btn-main-outline");

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 12);
      var pd = new Date();
      this.tableReferralsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "W") {
      $("#prevMonthReferrals").removeClass("btn-main-fill");
      $("#prevMonthReferrals").addClass("btn-main-outline");
      $("#prevWeekReferrals").addClass("btn-main-fill");
      $("#prevWeekReferrals").removeClass("btn-main-outline");
      var d = new Date();
      d.setDate(d.getDate() - 7); // Subtract 7 days for the past week.
      var wm = d;
      var pd = new Date();
      this.tableReferralsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "T") {
      $("#prevMonthReferrals").removeClass("btn-main-fill");
      $("#prevMonthReferrals").addClass("btn-main-outline");
      $("#prevWeekReferrals").addClass("btn-main-fill");
      $("#prevWeekReferrals").removeClass("btn-main-outline");
      var d = new Date();
      d.setDate(d.getDate()); // Subtract 7 days for the past week.
      var wm = d;
      var pd = new Date();
      this.tableReferralsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    this.getReferralsData();
  }

  fetchAssessmentwithdates(filter: any) {
    if (filter === "M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 1);
      var pd = new Date();
      this.tableAssessmentForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "3M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 3);
      var pd = new Date();
      this.tableAssessmentForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "6M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 6);
      var pd = new Date();
      this.tableAssessmentForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "1Y") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 12);
      var pd = new Date();
      this.tableAssessmentForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "W") {
      var d = new Date();
      d.setDate(d.getDate() - 7);
      var wm = d;
      var pd = new Date();
      this.tableAssessmentForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "T") {
      var d = new Date();
      d.setDate(d.getDate());
      var wm = d;
      var pd = new Date();
      this.tableAssessmentForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    this.getAssessmentData();
  }

  fetchLabResultPanic() {
    var FromDate = this.datepipe.transform(new Date().setDate(new Date().getDate() - 7), "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();

    this.opconfig.fetchDocPanicCountResults(FromDate, ToDate, this.doctorDetails[0].EmpId, 1, this.hospitalId).subscribe((response) => {
      this.labPanicCount = Number(response.FetchDocPanicCountDataaList[0]?.IspanicAbnormal);
    },
      (err) => {

      })
  }

  getReferralsData() {
    this.showReferrals = true;
    this.dashboardTabClass = "tab-pane";
    this.panicTabClass = "tab-pane";
    this.referralsTabClass = "tab-pane fade show active";
    this.navLinkActive = "nav-link";
    this.navLink = "nav-link panic_lab_btn d-flex align-items-center active";
    this.navLinkPanic = "nav-link panic_lab_btn d-flex align-items-center";
    this.navLinkEndorse = "nav-link panic_lab_btn d-flex align-items-center";
    this.showTransferRequests = false;
    this.getReferralsToMeData();
    this.getReferralsByMeData();
  }

  getReferralsToMeData() {
    // var FromDate = this.datepipe.transform(new Date().setDate(new Date().getDate() - 10), "dd-MMM-yyyy")?.toString();
    // var ToDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();

    var FromDate = this.datepipe.transform(this.tableReferralsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tableReferralsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();

    this.config.fetchReferredtoMe(this.doctorDetails[0].EmpId, FromDate, ToDate, this.hospitalId)
      .subscribe((response: any) => {
        this.referralsToMeData = response.FetchReferredtoMeLists;
        this.referralsToMeData?.forEach((element: any, index: any) => {
          //element.Class = "icon-w cursor-pointer";
          element.showAcceptReject = "col-12 mt-2 p-2 d-flex align-items-end d-none";
          element.imgSource = "assets/images/icons/arrow-down.svg";
          var ReferalStatus = response.FetchReferredtoMeLists[index].Status;
          if (ReferalStatus == 0) {
            element.Class = "legend_line ReferalNewRequest";
          }
          else if (ReferalStatus == 3) {
            element.Class = "legend_line ReferalRejected";
          }
          else {
            element.Class = "legend_line ReferalAccepted";
          }
        })
      },
        (err) => {
        })
  }
  getReferralsByMeData() {
    // var FromDate = this.datepipe.transform(new Date().setDate(new Date().getDate() - 5), "dd-MMM-yyyy")?.toString();
    // var ToDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();

    var FromDate = this.datepipe.transform(this.tableReferralsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tableReferralsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();

    this.config.fetchReferredbyMe(this.doctorDetails[0].EmpId, FromDate, ToDate, this.hospitalId)
      .subscribe((response: any) => {
        this.referralsByMeData = response.FetchReferredByMeLists;
        this.referralsByMeData?.forEach((element: any, index: any) => {

          var ReferalStatus = response.FetchReferredByMeLists[index].Status;
          if (ReferalStatus == 0) {
            element.Class = "legend_line ReferalNewRequest";
          }
          else if (ReferalStatus == 3) {
            element.Class = "legend_line ReferalRejected";
          }
          else {
            element.Class = "legend_line ReferalAccepted";
          }
        })


      },
        (err) => {
        })
  }
  fetchReferralCount() {
    var FromDate = this.datepipe.transform(new Date().setDate(new Date().getDate() - 5), "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();

    this.config.fetchReferalDoctorsCount(this.doctorDetails[0].EmpId, FromDate, ToDate, this.hospitalId).subscribe((response) => {
      this.referralCount = Number(response.SmartDataList[0]?.ReferedToMe);
      if (this.referralCount > 0) {
        this.currenttab = "referral";
        this.getReferralsData();
      }
      else {
        this.showPatientsData();
      }
    },
      (err) => {

      })
  }  
  FetchClinicCounters() {    
    this.config.FetchClinicCounters(this.doctorDetails[0].EmpId, this.doctorDetails[0].FacilityId, this.hospitalId).subscribe((response: any) => {
      if (response.Code === 200) {        
      }
    });
  }

  showAcceptReject(reftome: any) {
    if (reftome.showAcceptReject == "col-12 mt-2 p-2 d-flex align-items-end d-none")
      reftome.showAcceptReject = "col-12 mt-2 p-2 d-flex align-items-end";
    else {
      reftome.showAcceptReject = "col-12 mt-2 p-2 d-flex align-items-end d-none";
    }
    if (reftome.imgSource == "assets/images/icons/arrow-down.svg")
      reftome.imgSource = "assets/images/icons/icon-arrow-up.svg";
    else {
      reftome.imgSource = "assets/images/icons/arrow-down.svg";
    }
  }

  // selectReferral(reftome: any) {
  //   var intNewSTATUS = 2;
  //   if (reftome.Class == "icon-w cursor-pointer") {
  //     reftome.Class = "icon-w cursor-pointer active";
  //     this.selectedRefferedToMePatients.push({
  //       ReferralOrderID: reftome.ReferralOrderID,
  //       intNewSTATUS: 2
  //     })
  //   } else {
  //     reftome.Class = "icon-w cursor-pointer";
  //   }
  // }
  navigateToDashboardIfNoReferrals() {

  }
  acceptReferral(reftome: any, rem: any) {


    this.config.updateReferredtoMe(reftome.ReferralOrderID, rem.value == '' ? "0" : rem.value, this.doctorDetails[0].EmpId, 0, 2, this.doctorDetails[0].UserId, 3468, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          $("#acceptReferralMsg").modal('show');
        }
      },
        (err) => {
        })

    // else {
    //   $("#validateRemarksForAcceptReject").modal('show');
    // }

  }
  FetchReferalCheck() {
    this.fetchReferralCount();
    this.getReferralsData();
  }
  rejectReferral(reftome: any, rem: any) {
    if (rem.value != "") {
      this.config.updateReferredtoMe(reftome.ReferralOrderID, rem.value, this.doctorDetails[0].EmpId, 0, 3, this.doctorDetails[0].UserId, 3468, this.hospitalId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#rejectReferralMsg").modal('show');
          }
        },
          (err) => {
          })
    }
    else {
      $("#validateRemarksForAcceptReject").modal('show');
    }
  }
  referralTypeClick(type: any) {
    if (type == "1") {
      this.referredToMe = true;
      this.referredToMeClass = "fs-7 btn selected";
      this.referredByMeClass = "fs-7 btn";
      this.showReferralsCalendarControls = true;
      this.referredToMeText = "Referred To Me";
      if (this.lang == "ar")
        this.referredToMeText2L = this.langData?.common?.ReferredToMe;
    } else {
      this.referredToMe = false;
      this.referredToMeClass = "fs-7 btn";
      this.referredByMeClass = "fs-7 btn selected";
      this.referredToMeText = "Referred By Me";
      if (this.lang == "ar")
        this.referredToMeText2L = this.langData?.common?.ReferredByMe;
      //this.showReferralsCalendarControls = false;
    }
  }

  fetchPatientVisitDiagnosis(pinfo: any) {
    this.opconfig.fetchPatientVisitDiagnosis(pinfo.IPID, this.hospitalId).subscribe(response => {
      this.selectedPatientVisitDiagnosis = response.PatientDiagnosisDataList;
      this.selectedPatientVisitDiagnosisDate = response.PatientDiagnosisDataList[0].MODDATE;
    })
  }

  fetchPatientVisitSurgery(pinfo: any) {
    this.opconfig.fetchPatientVisitSurgery(pinfo.IPID, this.hospitalId).subscribe(response => {
      this.selectedPatientVisitSurgeryOrder = response.PatientAdviceAdviceSurgeryDataList;
      this.selectedPatientVisitSurgeryOrderDate = response.PatientAdviceAdviceSurgeryDataList[0].CreateDate;
    })
  }
  fetchPatientVisitLabOrders(pinfo: any) {
    var FromDate = this.datepipe.transform(this.tableReferralsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tableReferralsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();

    this.opconfig.fetchVisitLabOrderResults(FromDate, ToDate, pinfo.PatientID, pinfo.IPID, this.hospitalId).subscribe(response => {
      this.selectedPatientVisitLabOrder = response.FetchLabOrderResultsDataaList;
      this.selectedPatientVisitLabOrderDate = response.FetchLabOrderResultsDataaList[0].OrderDateNew;
    })
  }

  showPatientInfo(pinfo: any, ReferralType: any, Remarks: any) {
    $("#quick_info").modal('show');
    this.selectedPatientSSN = pinfo.SSN;
    this.selectedPatientName = pinfo.PatientName;
    this.selectedPatientGender = pinfo.Gender;
    this.selectedPatientAge = pinfo.FullAge;
    this.selectedPatientMobile = pinfo.MobileNo;
    this.selectedPatientHeight = pinfo.Height;
    this.selectedPatientWeight = pinfo.Weight;
    this.selectedPatientWeightCreatedate = pinfo.WeightCreateDate;
    this.selectedPatientBloodGrp = pinfo.BloodGroup;
    this.selectedPatientIsVip = pinfo.ISVIP == "Non-VIP" ? false : true;
    this.selectedPatientReferalReason = ReferralType;
    this.selectedPatientReferalRemarks = Remarks;
    if (pinfo.IsPregnancy) {
      this.selectedPatientIsPregnancy = true;
      this.selectedPatientPregnancyTrisemister = pinfo.PregnancyContent;
    }
    else {
      this.selectedPatientIsPregnancy = false;
      this.selectedPatientPregnancyTrisemister = "";
    }

    this.fetchPatientVisitDiagnosis(pinfo);
    this.fetchPatientVisitSurgery(pinfo);
    this.fetchPatientVisitLabOrders(pinfo);

    this.opconfig.FetchPatientFileInfo(pinfo.EpisodeID, pinfo.IPID, this.hospitalId, pinfo.PatientID, pinfo.RegCode).subscribe((response: any) => {
      if (response.objPatientMedicationsList.length > 0) {
        this.selectedPatientMedications = response.objPatientMedicationsList;
      }
      else {
        this.selectedPatientMedications = [];
      }
      if (response.objPatientVitalsList.length > 0) {
        this.selectedPatientVitalsDate = response.objPatientVitalsList[0].CreateDate;
        this.selectedPatientBPSystolic = response.objPatientVitalsList[0].Value;
        this.selectedPatientBPDiastolic = response.objPatientVitalsList[1].Value;
        this.selectedPatientTemperature = response.objPatientVitalsList[2].Value;
        this.selectedPatientPulse = response.objPatientVitalsList[3].Value;
        this.selectedPatientSPO2 = response.objPatientVitalsList[4].Value;
        this.selectedPatientRespiration = response.objPatientVitalsList[5].Value;
        if (response.objPatientVitalsList.length > 6 && response.objPatientVitalsList[6].Value != undefined)
          this.selectedPatientConsciousness = response.objPatientVitalsList[6].Value;
        else
          this.selectedPatientConsciousness = "";
        if (response.objPatientVitalsList.length > 7 && response.objPatientVitalsList[7].Value != undefined)
          this.selectedPatientO2FlowRate = response.objPatientVitalsList[7].Value;
        else
          this.selectedPatientO2FlowRate = "";
      }
      else {
        this.selectedPatientVitalsDate = "";
        this.selectedPatientBPSystolic = "";
        this.selectedPatientBPDiastolic = "";
        this.selectedPatientTemperature = "";
        this.selectedPatientPulse = "";
        this.selectedPatientSPO2 = "";
        this.selectedPatientRespiration = "";
      }
      if (response.objPatientAllergyList.length > 0) {
        this.selectedPatientAllergies = response.objPatientAllergyList;
      }
      else {
        this.selectedPatientAllergies = [];
      }
      if (response.objobjPatientClinicalInfoList.length > 0) {
        this.selectedPatientClinicalInfo = response.objobjPatientClinicalInfoList[0].ClinicalCondtion;
        this.selectedPatientVTScore = response.objobjPatientClinicalInfoList[0].VTScore;
      }
      else {
        this.selectedPatientClinicalInfo = ""
        this.selectedPatientVTScore = "";
      }
    })
  }

  clearSelectedPatientData() {

  }

  getEmployeeInfo(type: number) {
    this.opconfig.FetchEmployeeInfo(this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, 3392, this.hospitalId).subscribe(response => {
      this.employeeInfo = response.FetchEmployeeInfoDataList[0];
      this.base64StringSig1 = this.employeeInfo.Base64Signature;
      this.showSignature = false;
      setTimeout(() => {
        this.showSignature = true;
      }, 0);
    })
    if (type == 0)
      $("#doctorlist_modal").modal('show');
  }

  getDoctorNotifications() {
    var fromdate = this.datepipe.transform(new Date().setDate(new Date().getDate() - 7), "dd-MMM-yyyy")?.toString()
    var todate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
    this.opconfig.FetchDoctorNotifications(this.doctorDetails[0].EmpId, fromdate, todate, 3392, this.hospitalId).subscribe(response => {
      this.doctorNotifications = response.FetchDoctorNotificationsDataList;
    });
  }

  base64Relative1Signature(event: any) {
    this.employeeSignInfoForm.patchValue({ Signature1: event });
  }

  updateDoctorSignature() {
    var signPayload = {
      EMPID: this.doctorDetails[0].EmpId,
      Signature: this.employeeSignInfoForm.get('Signature1')?.value,
      Hospitalid: Number(this.hospitalId),
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: 3392
    }
    this.opconfig.SaveEmployeeSignatures(signPayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#doctorSignatureSavedMsg").modal('show');
          this.getEmployeeInfo(1);
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }
  clearEmployeeInfo() {
    this.employeeInfo = "";
    this.base64StringSig1 = '';
    this.showSignature = false;
    setTimeout(() => {
      this.showSignature = true;
    }, 0);
    this.employeeSignInfoForm.patchValue({ Signature1: '' });
  }
  clearSignature() {
    this.base64StringSig1 = '';
    this.showSignature = false;
    setTimeout(() => {
      this.showSignature = true;
    }, 0);
    this.employeeSignInfoForm.patchValue({ Signature1: '' });
  }

  fetchPatientInfo(pinfo: any) {
    pinfo.AdmissionID = pinfo.Admissionid;
    pinfo.HospitalID = this.hospitalId;
    pinfo.PatientID = pinfo.PatientID;
    this.patinfo = pinfo;
    $("#walkthrough_info").modal('show');
  }

  clearPatientInfo() {
    this.pinfo = "";
    this.wtpinfo = "";
  }
  displayTransferRequests() {
    this.navLinkEndorse = "nav-link panic_lab_btn d-flex align-items-center active";
    this.dashboardTabClass = "tab-pane";
    this.panicTabClass = "tab-pane";
    this.referralsTabClass = "tab-pane";
    this.navLinkActive = "nav-link";
    this.navLink = "nav-link panic_lab_btn d-flex align-items-center";
    this.navLinkPanic = "nav-link panic_lab_btn d-flex align-items-center";
    this.showTransferRequests = true;
    this.showReferrals = false;
    this.showLabPanicDetails = false;
  }
  FetchTransferRequests() {
    this.emrconfig.FetchPatientEMRPendingPrimaryDoctorRequests(this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, '3403', this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trasnferRequests = response.FetchPatientEMRPendingPrimaryDoctorRequestsDataList;
          this.transferRequestsCount = response.FetchPatientEMRPendingPrimaryDoctorRequestsDataList.length;
          this.groupedByDateTransfer = this.trasnferRequests.reduce((acc: any, curr: any) => {
            const date = curr.orderDate.split(' ')[0];
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(curr);
            return acc;
          }, {});

          const sortedDates = Object.keys(this.groupedByDateTransfer).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

          const sortedGroupedByDate: { [key: string]: any[] } = {};
          sortedDates.forEach(date => {
            sortedGroupedByDate[date] = this.groupedByDateTransfer[date];
          });

          this.groupedByDateTransfer = sortedGroupedByDate;
        }

      },
        (err) => {
        })
  }
  getKeys(object: object): string[] {
    return Object.keys(object);
  }
  acceptTransferRequest(req: any) {

    this.emrconfig.SavePatientEMRPrimaryDoctors(req.EMRPrimaryDoctorRequestID, req.PatientId, req.Admissionid, req.ToDoctorID, req.ToSpecialiseID, this.doctorDetails[0].UserId, '3403', this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.showTransferRequests = false;
          this.ValidationMSG = "Accepted Successfully";
          //this.refreshPatients();
          this.FetchTransferRequests();
          $("#saveConsultanceMsg").modal('show');
        }

      },
        (err) => {
        })
  }
  showDashboard() {
    if (this.trasnferRequests.length === 0) {
      this.showPatientsData();
    }
  }
  showRejectionmodal(event: any, item: any) {
    event.stopPropagation();
    this.transferRejectRemarksForPatientName = item.SSN;
    this.selectedPatientToReject = item;
    $("#emrPatientTransferRejectRemark").modal('show');
  }
  showPatientInfoDet(pinfo: any) {

    this.pinfo = pinfo;
    $("#quick_info_new").modal('show');
  }
  clearRejectRemarks() {
    $("#rejectRemarks").val('');
    this.showRejectRemarksValidation = false;
  }
  closeRejectRemarks() {
    $("#rejectRemarks").val('');
    this.selectedPatientToReject = '';
    this.showRejectRemarksValidation = false;
  }
  RejectPatientEMRPrimaryDoctorRequests() {
    var remarks = $("#rejectRemarks").val();
    if (remarks != '') {
      this.showRejectRemarksValidation = false;
      this.emrconfig.RejectPatientEMRPrimaryDoctorRequests(this.selectedPatientToReject.AdmissionID, this.selectedPatientToReject.EMRPrimaryDoctorRequestID, remarks, this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, '3403', this.hospitalId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.selectedPatientToReject = '';
            $("#emrPatientTransferRejectRemark").modal('hide');
            this.ValidationMSG = "Rejected Successfully";
            //this.refreshPatients();
            this.FetchTransferRequests();
            $("#saveConsultanceMsg").modal('show');
          }

        },
          (err) => {
          })
    }
    this.showRejectRemarksValidation = true;
  }
  navigateToCasesheet(item: any) {
    let payload = {
      "RegCode": item.Regcode
    }
    this.appconfig.getPatientDetails(payload).subscribe((response) => {
      if (response.Status === "Success") {
        sessionStorage.setItem("PatientDetails", JSON.stringify(item));
        sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
        sessionStorage.setItem("selectedView", JSON.stringify(item));
        sessionStorage.setItem("selectedCard", JSON.stringify(item));
        this.router.navigate(['/home/doctorcasesheet']);
      }
    },
      (err) => {

      })
  }
  fetchPatientWalkthroughInfo(patinfo: any) {
    patinfo.AdmissionID = patinfo.Admissionid;
    patinfo.HospitalID = this.hospitalId;
    patinfo.PatientID = patinfo.PatientID;
    this.wtpinfo = patinfo;
    $("#walkthrough_info").modal('show');
  }
  fetchPatientWalkthroughInfoForReferrals(patinfo: any) {
    patinfo.AdmissionID = patinfo.IPID;
    patinfo.HospitalID = this.hospitalId;
    patinfo.PatientID = patinfo.PatientID;
    patinfo.FromDoctor = patinfo.ReferralDoctorName;
    this.wtpinfo = patinfo;
    $("#walkthrough_info").modal('show');
  }

  updateNotificationasRead(notf: any) {

    var payload = {
      "DoctorNotificationID": notf.DoctorNotificationID,
      "IsRead": true,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": 0,
      "HospitalID": this.hospitalId
    }

    this.opconfig.UpdateIsReadDcotorNotifications(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.getDoctorNotifications();
        } else {

        }
      },
      (err) => {
        console.log(err)
      });

  }
  startTimers(date: any): any {
    if (date.AdmissionReqDate != null) {
      const startDate = new Date(date.AdmissionReqDate);
      const now = new Date();
      const differenceMs: number = now.getTime() - startDate.getTime();
      const seconds: number = Math.floor((differenceMs / 1000) % 60);
      const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
      const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
      const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
      const totalHours = hours + (days * 24);
      const formattedHours = totalHours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");
      return `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
    }
    //if(date.VTCreateDate && (this.datepipe.transform(date.orderDate, "dd-MMM-yyyy")?.toString() === this.datepipe.transform(Date(), "dd-MMM-yyyy")?.toString())) {
    else if (date.VTCreateDate) {
      const startDate = new Date(date.VTCreateDate);
      const now = new Date();
      const differenceMs: number = now.getTime() - startDate.getTime();
      const seconds: number = Math.floor((differenceMs / 1000) % 60);
      const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
      const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
      const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
      const totalHours = hours + (days * 24);
      const formattedHours = totalHours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");
      return `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
    }
  }

  activetab(type: any) {
    this.currenttab = type;
    if(type == 'assessment') {
      this.getAssessmentData();
      //this.getDischargesummaryRequests();
      //this.getMedicalReportRequests();
    }
  }

 

  openAssessmentForm(assessment: any, type: any) {
    assessment.ConsultantID = assessment.PrimaryDoctorID;
    assessment.AdmissionID = assessment.Admissionid;
    assessment.fromHomePage = true;

    sessionStorage.setItem("selectedView", JSON.stringify(assessment))
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal',
    };

    if (assessment.ClinicalTemplateID === '2') {
      const modalRef = this.modalService.openModal(MedicalAssessmentComponent, {
        data: assessment,
        readonly: true,
        fromshared: true,
        isEdit: type == 1 ? true : false,
        admissionID: assessment.AdmissionID,
      }, options);
    }
    if (assessment.ClinicalTemplateID === '7') {
      const modalRef = this.modalService.openModal(MedicalAssessmentPediaComponent, {
        data: assessment,
        readonly: true,
        fromshared: true,
        isEdit: type == 1 ? true : false,
        admissionID: assessment.AdmissionID,
      }, options);
    }
    if (assessment.ClinicalTemplateID === '6') {
      const modalRef = this.modalService.openModal(MedicalAssessmentObstericComponent, {
        data: assessment,
        readonly: true,
        fromshared: true,
        isEdit: type == 1 ? true : false,
        admissionID: assessment.AdmissionID,
      }, options);
    }
    if (assessment.ClinicalTemplateID === '8') {
      const modalRef = this.modalService.openModal(MedicalAssessmentSurgicalComponent, {
        data: assessment,
        readonly: true,
        fromshared: true,
        isEdit: type == 1 ? true : false,
        admissionID: assessment.AdmissionID,
      }, options);
    }
  }

  openApprovalModal(commReq: any) {
    this.selectedPatientCommRequests = commReq;
    $("#commReqModal").modal('show');
  }

  openDischargeSummary(dissum: any) {
    sessionStorage.setItem("selectedView", JSON.stringify(dissum));
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal',
    };
    if(dissum.IsCNHI == 'True') {
      const modalRef = this.modalService.openModal(ChiDischargesummaryComponent, {
        data: dissum,
        readonly: true,
        fromshared: true,
        isEdit: false,
        admissionID: dissum.AdmissionID,
      }, options);
    }
    else {
      const modalRef = this.modalService.openModal(InPatientDischargeSummaryComponent, {
        data: dissum,
        readonly: true,
        fromshared: true,
        isEdit: false,
        admissionID: dissum.AdmissionID,
      }, options);
    }
    
  }

  openVTEForm(value: any) {
    const key: any = value.AssessmentType;
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    value.PatientObgVTEID = value.RiskAssessmentOrderID;
    value.VTEOrderID=value.PatientObgVTEID;
    sessionStorage.setItem("selectedView", JSON.stringify(value));
    sessionStorage.setItem("InPatientDetails", JSON.stringify(value));
    sessionStorage.setItem("navigation", value.AssessmentType);
    if (key === 'VTE Medical') {
      const modalRef = this.modalService.openModal(VteRiskAssessmentComponent, {
        data: value,
        readonly: true
      }, options);
    }
    else if (key === 'VTE Surgery') {
      const modalRef = this.modalService.openModal(VteSurgicalRiskAssessmentComponent, {
        data: value,
        readonly: true
      }, options);
    }
    else if (key === 'OBG') {
      
      const modalRef = this.modalService.openModal(VteObgAssessmentComponent, {
        data: value,
        readonly: true
      }, options);
    }
  }

  openMedicalReport(medrep: any) {
    sessionStorage.setItem("selectedView", JSON.stringify(medrep));
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal',
    };
    const modalRef = this.modalService.openModal(MedicalReportComponent, {
      data: medrep,
      readonly: true,
      fromshared: true,
      isEdit: false,
      admissionID: medrep.AdmissionID,
    }, options);
  }

  showCommunicationRequest() {
    var fromdate = new Date();
    fromdate.setDate(fromdate.getDate() - 3);
    var todate = new Date();
    todate.setDate(todate.getDate() + 1);
    var payload = {
      "id": null,
      "role": 1,
      "patientType": 1,
      "fromDate": moment(fromdate).format('YYYY-MM-DD') + 'T00:00:00.000Z',
      "toDate": moment(todate).format('YYYY-MM-DD') + 'T23:59:59.000Z',
      "SSN": null,
      "DoctorCode": this.doctorDetails[0].EmpNo
  }
    this.logconfig.getCommunicationRequests(payload)
    .subscribe((response: any) => {
      if(response.info !== '0 records retreived' && response.content.filter((x:any) => x.commRequest !== null)) {
        this.nphiesrequest = response.content.filter((x:any) => x.commRequest !== null);
        const commRequests = this.nphiesrequest.filter((x:any) => x.commRequest !== null)
        this.approvalsCommReqsCount = commRequests.filter((y:any) => y.commResponse === null).length;
        this.nphiesrequest.forEach((ele:any) => {
          if(ele.commResponse === null) {
            ele.reponseClass = "nonresponded";
          }
          else {
            ele.reponseClass = "responded";
          }
          ele.commRequest.data.forEach((element: any) => {
            element.docResponse = "";
          });
        });
        // this.commRequestPayloads = response.content[0]?.commRequest.payloads;
        // this.commRequestReasons = response.content[0]?.commRequest.reasons;
        // if(response.content[0]?.commResponse != null) {
        //   this.commResponsePayloads = response.content[0]?.commResponse.payloads;
        //   this.commResponseReasons = response.content[0]?.commResponse.reasons;
        // }
        
        //$("#commReqModal").modal('show');
      }
      else {
        this.errorMessage = "No communication requests from Nphies";
        $("#errorMsg").modal('show');
      }

    },
      (err) => {
      })
    
  }

  commRequestResponded(req: any) {
    const response = this.nphiesrequest.filter((x:any) => x.commResponse !== null);
    return response.length > 0;
  }
  commRequestNotResponded(req: any) {
    const response = this.nphiesrequest.filter((x:any) => x.commResponse === null);
    return response.length > 0;
  }

  saveDocCommResponse() {
    this.selectedPatientCommRequests.commRequest.data.forEach((element:any) => {
      let obj =
    {
      "requestId": this.selectedPatientCommRequests.commRequest.id,
      "status": "completed",
      "priority": "routine",
      "category": "instruction",
      "transactionId": this.selectedPatientCommRequests.requestId,
      "eventId": 583,
      "data": [
        {
          "requestId": this.selectedPatientCommRequests.commRequest.id,
          "info": this.docResponse,
          "reason": element.reason,

          "type": null,
          "title": null,
          "fileCreatedAt": null,
          "fileContents": null

        }
      ]
    }
    this.opconfig.saveCommResponse(obj).subscribe(
      (res) => {
        debugger;
        if (res.status == 1) {
          $("#commResponseMsg").modal('show');          
          $("#commReqModal").modal('hide');
        }
      },
      (error) => {
      }
    )
    });
  }

  updatePassword() {
    this.showPasswordValidationMsg = false;
    if (this.changePwdForm.valid) {
      const newpwd = this.changePwdForm.get('NewPassword')?.value;
      const conpwd = this.changePwdForm.get('ConfirmPassword')?.value;
      if (conpwd != newpwd) {
        this.changePwdValidationMSg = "New password and confirm password doesn't match";
        this.showPasswordValidationMsg = true;
        return;
      }

      const payload = {
        "NAME": this.doctorDetails[0].UserName,
        "NEWpassword": this.changePwdForm.get('NewPassword')?.value,
        "OLDpassword": this.changePwdForm.get('OldPassword')?.value,
        "WorkStationID": 3395,
        "HospitalID": this.hospitalId,
      };

      this.utilityService.post(ipissues.SaveChangedPassword, payload).subscribe((response: any) => {
        if (response.Status === "Success") {
          $("#changePwdSaveMsg").modal('show');
        }
        else {
          if (response.Status == 'Fail') {
            this.ValidationMSG = response.Message;
            $("#paswordNoMatchMsg").modal('show');
          }
        }
      },
        (err) => {
        })
    }
    else {
      this.changePwdValidationMSg = "Please enter all fields";
      this.showPasswordValidationMsg = true;
    }
  }

  closeChangePwdModal() {
    $("#doctorlist_modal").modal('hide');
    sessionStorage.clear()
    localStorage.clear();
    this.router.navigate(['/login'])
  }

  fetchDischargeSummaryWithDates(filter: any) {
    if (filter === "M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 1);
      var pd = new Date();
      this.dischargeSummaryForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "3M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 3);
      var pd = new Date();
      this.dischargeSummaryForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "6M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 6);
      var pd = new Date();
      this.dischargeSummaryForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "1Y") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 12);
      var pd = new Date();
      this.dischargeSummaryForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "W") {
      var d = new Date();
      d.setDate(d.getDate() - 7);
      var wm = d;
      var pd = new Date();
      this.dischargeSummaryForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "T") {
      var d = new Date();
      d.setDate(d.getDate());
      var wm = d;
      var pd = new Date();
      this.dischargeSummaryForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    this.getDischargesummaryRequests();
  }

  getDischargesummaryRequests() {
    //const FromDate = this.datepipe.transform(this.dischargeSummaryForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var FromDate = this.datepipe.transform(new Date().setDate(new Date().getDate() - 7), "dd-MMM-yyyy")?.toString();
    const ToDate = this.datepipe.transform(this.dischargeSummaryForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    this.opconfig.FetchPrimaryDoctorReviewDischargeSummary(FromDate, ToDate, this.doctorDetails[0].EmpId, '0', this.hospitalId).subscribe((response: any) => {
      if (response.Code === 200) {
        this.dischargeSummaryVerificationList = response.FetchPrimaryDoctorReviewDischargeSummaryDataPList;
        this.dischargeSummCount = response.FetchPrimaryDoctorReviewDischargeSummaryDataPList.filter((x: any) => x.Status === '0').length;
        this.dischargeSummCountC = response.FetchPrimaryDoctorReviewDischargeSummaryDataPList.filter((x: any) => x.Status === '0').length;
        // this.dischargeSummCountFC=Number(this.dischargeSummCountC+this.assessmentCollectionC);
      }
    });    
    // this.opconfig.fetchPrimaryDoctorReviewPatienClinicalTemplate(FromDate, ToDate, this.doctorDetails[0].EmpId, '0', this.hospitalId).subscribe((response: any) => {
    //   if (response.Code === 200) {
    //     this.assessmentCollection = response.FetchPatienClinicalTemplateDetailsDataPList;
    //     this.assessmentCollectionC = response.FetchPatienClinicalTemplateDetailsDataPList.filter((x: any) => x.IsReview === 'False').length;
    //     // this.dischargeSummCountFC=Number(this.dischargeSummCountC+this.assessmentCollectionC);
    //   }
    // });  
    
  }

  getDischargesummaryRequestsCalSelection() {
    const FromDate = this.datepipe.transform(this.dischargeSummaryForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    // var FromDate = this.datepipe.transform(new Date().setDate(new Date().getDate() - 7), "dd-MMM-yyyy")?.toString();
    const ToDate = this.datepipe.transform(this.dischargeSummaryForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    if(ToDate == null || ToDate == undefined || ToDate == '') {
      return;
    }
    this.opconfig.FetchPrimaryDoctorReviewDischargeSummary(FromDate, ToDate, this.doctorDetails[0].EmpId, '0', this.hospitalId).subscribe((response: any) => {
      if (response.Code === 200) {
        this.dischargeSummaryVerificationList = response.FetchPrimaryDoctorReviewDischargeSummaryDataPList;
        this.dischargeSummCount = response.FetchPrimaryDoctorReviewDischargeSummaryDataPList.filter((x: any) => x.Status === '0').length;
        this.dischargeSummCountC = response.FetchPrimaryDoctorReviewDischargeSummaryDataPList.filter((x: any) => x.Status === '0').length;
        // this.dischargeSummCountFC=Number(this.dischargeSummCountC+this.assessmentCollectionC);
      }
    });    
    // this.opconfig.fetchPrimaryDoctorReviewPatienClinicalTemplate(FromDate, ToDate, this.doctorDetails[0].EmpId, '0', this.hospitalId).subscribe((response: any) => {
    //   if (response.Code === 200) {
    //     this.assessmentCollection = response.FetchPatienClinicalTemplateDetailsDataPList;
    //     this.assessmentCollectionC = response.FetchPatienClinicalTemplateDetailsDataPList.filter((x: any) => x.IsReview === 'False').length;
    //     // this.dischargeSummCountFC=Number(this.dischargeSummCountC+this.assessmentCollectionC);
    //   }
    // });  
    
  }

  fetchMedicalReportWithDates(filter: any) {
    if (filter === "M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 1);
      var pd = new Date();
      this.medicalReportForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "3M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 3);
      var pd = new Date();
      this.medicalReportForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "6M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 6);
      var pd = new Date();
      this.medicalReportForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "1Y") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 12);
      var pd = new Date();
      this.medicalReportForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "W") {
      var d = new Date();
      d.setDate(d.getDate() - 7);
      var wm = d;
      var pd = new Date();
      this.medicalReportForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "T") {
      var d = new Date();
      d.setDate(d.getDate());
      var wm = d;
      var pd = new Date();
      this.medicalReportForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    this.getMedicalReportRequests();
    this.getVTEData();
  }

  getVTEData() {
    var FromDate = this.datepipe.transform(new Date().setDate(new Date().getDate() - 7), "dd-MMM-yyyy")?.toString();
    const ToDate = this.datepipe.transform(this.medicalReportForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    const apiUrl = 'FetchPrimaryDoctorReviewPatienVTE?FromDate=${FromDate}&ToDate=${ToDate}&PrimaryDoctorID=${PrimaryDoctorID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}';
    const url = this.utilityService.getApiUrl(apiUrl, {
      FromDate,
      ToDate,
      PrimaryDoctorID: this.doctorDetails[0].EmpId, 
      WorkStationID: 0,
      HospitalID: this.hospitalId
    });
    this.utilityService.get(url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.vteCount = response.FetchPrimaryDoctorReviewPatienVTEDataList.filter((x: any) => x.Status === '0').length;
        this.vteDataList = response.FetchPrimaryDoctorReviewPatienVTEDataList;
      }
    },
      (_) => {

      });
  }

  getMedicalReportRequests() {
    //const FromDate = this.datepipe.transform(this.dischargeSummaryForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var FromDate = this.datepipe.transform(new Date().setDate(new Date().getDate() - 7), "dd-MMM-yyyy")?.toString();
    const ToDate = this.datepipe.transform(this.medicalReportForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    this.opconfig.FetchPrimaryDoctorReviewMedicalReport(FromDate, ToDate, this.doctorDetails[0].EmpId, '0', this.hospitalId).subscribe((response: any) => {
      if (response.Code === 200) {
        this.medicalReportVerificationList = response.FetchPrimaryDoctorReviewMedicalReportDataPList;
        this.medicalReportCount = response.FetchPrimaryDoctorReviewMedicalReportDataPList.filter((x: any) => x.Status === '0').length;
      }
    }); 
    
  }
  getMedicalReportRequestsCalSelection() {
    const FromDate = this.datepipe.transform(this.dischargeSummaryForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    // var FromDate = this.datepipe.transform(new Date().setDate(new Date().getDate() - 7), "dd-MMM-yyyy")?.toString();
    const ToDate = this.datepipe.transform(this.medicalReportForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    if(ToDate == null || ToDate == undefined || ToDate == '') {
      return;
    }
    this.opconfig.FetchPrimaryDoctorReviewMedicalReport(FromDate, ToDate, this.doctorDetails[0].EmpId, '0', this.hospitalId).subscribe((response: any) => {
      if (response.Code === 200) {
        this.medicalReportVerificationList = response.FetchPrimaryDoctorReviewMedicalReportDataPList;
        this.medicalReportCount = response.FetchPrimaryDoctorReviewMedicalReportDataPList.filter((x: any) => x.Status === '0').length;
      }
    }); 
    
  }
  getAssessmentData() {    
    var FromDate = this.datepipe.transform(new Date().setDate(new Date().getDate() - 7), "dd-MMM-yyyy")?.toString();
    const ToDate = this.datepipe.transform(this.tableAssessmentForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    this.opconfig.fetchPrimaryDoctorReviewPatienClinicalTemplate(FromDate, ToDate, this.doctorDetails[0].EmpId, '0', this.hospitalId).subscribe((response: any) => {
      if (response.Code === 200) {
        this.assessmentCollection = response.FetchPatienClinicalTemplateDetailsDataPList;
        this.assessmentCollectionC = response.FetchPatienClinicalTemplateDetailsDataPList.filter((x: any) => x.IsReview === 'False').length;
        // this.dischargeSummCountFC=Number(this.assessmentCollectionC+this.dischargeSummCount);
      }
    });
    // this.opconfig.FetchPrimaryDoctorReviewDischargeSummary(FromDate, ToDate, this.doctorDetails[0].EmpId, '0', this.hospitalId).subscribe((response: any) => {
    //   if (response.Code === 200) {
    //     this.dischargeSummaryVerificationList = response.FetchPrimaryDoctorReviewDischargeSummaryDataPList;
    //     this.dischargeSummCount = this.dischargeSummaryVerificationList.length;
    //     this.dischargeSummCountC = response.FetchPrimaryDoctorReviewDischargeSummaryDataPList.filter((x: any) => x.Status === '0').length;
    //     // this.dischargeSummCountFC=Number(this.dischargeSummCountC+this.assessmentCollectionC);
    //   }
    // });  
  }

  FetchPSurgeryRequestCancelWorkListwithdates(filter: any) {
    if (filter === "M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 1);
      var pd = new Date();
      this.tableOrdersForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "3M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 3);
      var pd = new Date();
      this.tableOrdersForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "6M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 6);
      var pd = new Date();
      this.tableOrdersForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "1Y") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 12);
      var pd = new Date();
      this.tableOrdersForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "W") {
      var d = new Date();
      d.setDate(d.getDate() - 7);
      var wm = d;
      var pd = new Date();
      this.tableOrdersForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "T") {
      var d = new Date();
      d.setDate(d.getDate());
      var wm = d;
      var pd = new Date();
      this.tableOrdersForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    this.FetchPSurgeryRequestCancelWorkList();
  }

  FetchPSurgeryRequestCancelWorkList() {
    const FromDate = this.datepipe.transform(this.tableOrdersForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    const ToDate = this.datepipe.transform(this.tableOrdersForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    this.opconfig.FetchPSurgeryRequestCancelWorkList(FromDate, ToDate, this.doctorDetails[0].EmpId, this.doctorDetails[0].FacilityId, this.hospitalId).subscribe((response: any) => {
      if (response.Code === 200) {
        this.cancelledSurgeryOrdersList = response.FetchPSurgeryRequestCancelWorkListDataList;
        this.surOrderCount = this.cancelledSurgeryOrdersList.length;
        this.cancelledSurgeryOrdersList.forEach((element: any) => {
          element.showRem = true;
        });
      }
    });
  }

  showAckRem(ord: any) {
    ord.showRem = !ord.showRem;
  }

  acknowledgeSurOrdCancel(ord:any, rem: any) {
    if(rem.value === '') {
      this.cancelAckRemarksValidation = true;
      return;
    }
    else {
      this.cancelAckRemarksValidation = false;
    }
  
    var payload = {
      "SurgeryRequestID": ord.SurgeryRequestID,
      "CancelledStatus": "2",
      "CancelRemarks": ord.CancelRemarks,
      "CancelledAckRemarks": rem.value,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.doctorDetails[0].FacilityId,  
      "HospitalID": this.hospitalId
  }
  this.opconfig.UpdateSurgeryRequestCancellations(payload).subscribe(
    (response) => {
      if (response.Code == 200) {
        $("#cancelSurAckMsg").modal('show');
        this.FetchPSurgeryRequestCancelWorkList();
      } else {

      }
    },
    (err) => {
      console.log(err)
    });
  }

  openPatientFolder() {
    this.router.navigate(['/shared/patientfolder']);
  }

  redirecttoProgressNotes(item: any) {
    if(item.Status === '2') {
      item.Bed = item.BedName;
      sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
      const options: NgbModalOptions = {
        size: 'xl',
        windowClass: 'vte_view_modal',
      };
      const modalRef = this.modalService.openModal(ProgressNoteComponent, {
        isPopup: true
      }, options);
    }
  }

  getReviewTabCount() {
    var d = new Date();
    d.setDate(d.getDate() - 7);
    const params = {
      FromDate: moment(d).format('DD-MMM-YYYY'),
      ToDate: moment(new Date()).format('DD-MMM-YYYY'),
      PrimaryDoctorID: this.doctorDetails[0].EmpId,
      WorkStationID: this.doctorDetails[0]?.FacilityId ?? 0,
      HospitalID: this.hospitalId
    };

    const url = this.utilityService.getApiUrl(PatientDetails.FetchPrimaryDoctorReviewSummaryCount, params);
    this.utilityService.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          // this.appointmentList = response.FetchPatientAppointmentsWorkListDataList.filter((x: any) => x?.AppStatus == '3' && x.Blocked=='0' );
          this.dischargeSummCountFC = response.FetchPrimaryDoctorReviewSummaryCountDataPList[0]?.TotalReviewCount;
          this.assessmentCollectionC = response.FetchPrimaryDoctorReviewSummaryCountDataPList[0]?.AssessmentCount;
          this.dischargeSummCountC = response.FetchPrimaryDoctorReviewSummaryCountDataPList[0]?.DischargeSummaryCount;
          this.medicalReportCount = response.FetchPrimaryDoctorReviewSummaryCountDataPList[0]?.MedicalReportCount;
          this.vteCount = response.FetchPrimaryDoctorReviewSummaryCountDataPList[0]?.VTECount;
        }
      },
      (err) => {

      })
  }
}
interface FetchPanicDetails {
  PatientID: string;
  TestOrderID: string;
  TestOrderItemID: string;
  PanicResult: string;
  AbnormalResult: string;
  ResultValue: string;
  Maxlimit: string;
  MinLimit: string;
  UOM: string;
  createdate: string;
  group: string;
  name: string;
  ServiceID: string;
  Isresult: string;
  Color?: string;
  OrderDate?: string;
}
interface PatientDetails {
  SSN: string
  EpisodeID: string
  AdmissionID: string
  hospitalId: string
  PatientID: string
  RegCode: string
  ScheduleID: string
  IsVirtual: number
  IsAllergy: number
  Status: string
  GenderID: number
  IsPregnancy: number
  PregnancyContent: string
  OrderType: string
  PatientName: string
  FullAge_Gender: string
  Orderdate: Date
  Nationality: string
  TokenNumber: string
  Timeslot: string
  Score: string
  InsuranceName: string
  AllergyData: string
  Age_Gender: string
  MobileNo: string
  Height: string
  Weight: string
  BloodGroup: string
  ISVIP: string
  MonitorID: string
  SpecialiseID: string
  BillType: string
  PatientType: string
  Ward: string
  DoctorID: string
  BillID: string
  Age: string
  Gender: string
  IsPanic: number
}

export const PatientDetails = {
FetchPrimaryDoctorReviewSummaryCount:'FetchPrimaryDoctorReviewSummaryCount?FromDate=${FromDate}&ToDate=${ToDate}&PrimaryDoctorID=${PrimaryDoctorID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};