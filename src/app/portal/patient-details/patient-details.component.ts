import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from '../../ward/services/config.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { FormControl } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { InstructionsToNurseComponent } from '../instructions-to-nurse/instructions-to-nurse.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { SuitConfigService } from 'src/app/suit/services/suitconfig.service';
import { SickleaveComponent } from '../sickleave/sickleave.component';
import { ViewapprovalrequestComponent } from '../viewapprovalrequest/viewapprovalrequest.component';
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
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss'],
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
export class PatientDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('myToday') myTodayVisit!: ElementRef<HTMLElement>;
  @ViewChild('myVisited') myVisited!: ElementRef<HTMLElement>;
  @ViewChild('myWL') myWL!: ElementRef<HTMLElement>;
  @ViewChild('myMonth') myMonth!: ElementRef<HTMLElement>;
  @ViewChild('myMonth3') myMonth3!: ElementRef<HTMLElement>;
  @ViewChild('myWeek') myWeek!: ElementRef<HTMLElement>;
  @ViewChild('myYDay') myYDay!: ElementRef<HTMLElement>;
  @ViewChild('acknowledgeSection') acknowledgeSection!: ElementRef;
  isFilter: any = false;
  groupedData: { [key: string]: PatientDetails[] } = {};
  groupedDataArray: { date: string, values: PatientDetails[] }[] = [];
  groupedInPatientData: { [key: string]: PatientDetails[] } = {};
  groupedInPatientDataArray: { ward: string, values: PatientDetails[] }[] = [];
  groupedDataInvArray: { group: string, values: FetchPanicDetails[] }[] = [];
  groupedDataPanic: { [key: string]: FetchPanicDetails[] } = {};
  FetchPanicData: FetchPanicDetails[] = [];
  patientDetails: PatientDetails[] = [];
  inPatientDetails: InPatientDetails[] = [];
  tablePatientsForm!: FormGroup;
  referralDateForm!: FormGroup;
  appointmentsDateForm!: FormGroup;
  tablePanicForm!: FormGroup;
  patientType: any = 1;
  PatientsList: any;
  PatientsListToFilter: any;
  doctorDetails: any;
  hospitalId: any;
  location: any;
  currentdate: any;
  currentdateN: any;
  currentTime: any;
  currentTimeN: Date = new Date();
  intervalN: any;
  selectedPatientAdmissionId: any;
  dateString: any;
  previousClick: any = false;
  previousFilter: any = "D";
  walkinCount: any = 0;
  referralCount: any = 0;
  videoCount: any = 0;
  IsPanic: any = 0;
  appointmentCount: any = 0;
  inPatient: any = 0;
  patientInfoList: any = [];
  pinfo: any;
  interval: any;
  dynamicText: any = 'In Patient';
  dynamicTextAR: any = 'In Patient';
  isOutPatient: any = 'out';
  ipCount: any = 0;
  opCount: any = 0;
  dentalSpecialisations = [30, 273, 275, 283, 279, 284, 274, 276];
  wardID: any;
  //Added for Localization
  langData: any;
  lang: any;
  labPanicCount: any;
  labPanicCountDetails: any = [];
  labPanicCountDetailsFiltered: any = [];
  labPanicCountDetailsDistinct: any = [];
  showLabPanicDetails: boolean = false;
  showLabackwlegementDetails: { [key: number]: boolean } = {};
  labPanicCss: any;
  FetchBedsFromWardDataList: any;
  FetchBedsFromWardDataListReferral: any;
  FetchBedsFromWardDataListReferralFiltered: any;
  FetchBedsFromWardDataListReferralFilteredWard: any;
  FetchUserFacilityDataList: any;
  FetchDoctorDefaultWardsDataDList: any;
  fitForDischarge = false;
  ClinicVisitAfterDays = "0";
  referralType = "1";
  showIpOpToggle = false;
  referralOpCount = 0;
  referralIpCount = 0;
  referralEmrCount = 0;
  WaitingCount = 0;
  showResultsinPopUp = false;
  ValidationMsg: any;
  patinfo: any;
  FetchApprovalInfoDataList: any[] = [];
  IsApproval: boolean = false;
  datesForm!: FormGroup;
  IsDoctor: any;
  FetchDoctorReferralOrdersDataList: any[] = [];
  showPatientNotSelectedValidation = false;
  isVerified: boolean = false;
  saveMsg: string = '';
  selectedPatientForVirtualDischarge: any;
  showPainAssessment: boolean = false;
  selectedPainScore: any = 0;
  number = Number;
  PatientAppointmentsWorkList: any = [];
  showAppointmentCalendar: boolean = false;
  appointmentList: any = [];
  activeTab: string = 'walkin';
  showWorklistBtn: boolean = false;
  trustedUrl: any;
  favouritesList: any = [];
  clinicsList: any;
  selectedClinic: any;
  errorMsg = "";

  constructor(private fb: FormBuilder, private config: ConfigService, public datepipe: DatePipe, private router: Router, private bedConfig: BedConfig,
    private modalService: GenericModalBuilder, private modalSvc: NgbModal, private us: UtilityService, private suitconfig: SuitConfigService) {
    this.langData = this.config.getLangData();
    this.lang = sessionStorage.getItem("lang");
    if (this.lang == "ar")
      this.dynamicTextAR = this.langData?.common?.inPatient;

    this.referralDateForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });

    this.appointmentsDateForm = this.fb.group({
      FromDate: new Date(),
      ToDate: new Date(),
    });

    this.datesForm = this.fb.group({
      fromdate: [''],
      todate: ['']
    });

    var d = new Date();
    var wm = new Date(d);
    wm.setDate(wm.getDate() - 1);
    this.referralDateForm.patchValue({
      FromDate: wm,
      ToDate: d
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  ngAfterViewInit(): void {
    if (sessionStorage.getItem("IsTodayOrVisited") == "1") {
      setTimeout(() => {
        let el: HTMLElement = this.myTodayVisit.nativeElement;
        el.click();
      }, 0);
    }
    else if (sessionStorage.getItem("IsTodayOrVisited") == "2") {
      setTimeout(() => {
        let el: HTMLElement = this.myVisited.nativeElement;
        el.click();
      }, 0);
    }
    else {
      setTimeout(() => {
        let el: HTMLElement = this.myWL.nativeElement;
        el.click();
      }, 0);
    }

    // if (sessionStorage.getItem("IsWeekOrMonth") == "W") {
    //   setTimeout(() => {
    //     let el: HTMLElement = this.myWeek.nativeElement;
    //     el.click();
    //   }, 500);

    // }
    // else if (sessionStorage.getItem("IsWeekOrMonth") == "M") {
    //   setTimeout(() => {
    //     let el: HTMLElement = this.myMonth.nativeElement;
    //     el.click();
    //   }, 500);
    // }
    // else if (sessionStorage.getItem("IsWeekOrMonth") == "3M") {
    //   setTimeout(() => {
    //     let el: HTMLElement = this.myMonth3.nativeElement;
    //     el.click();
    //   }, 500);
    // }
    // else if (sessionStorage.getItem("IsWeekOrMonth") == "Y") {
    //   setTimeout(() => {
    //     let el: HTMLElement = this.myYDay.nativeElement;
    //     el.click();
    //   }, 500);
    // }

    //this.fetchIPOPPatientCount();
    this.fetchLabResultPanic();
  }

  startClock(): void {
    this.intervalN = setInterval(() => {
      this.currentTimeN = new Date();
    }, 1000);
  }

  stopClock(): void {
    clearInterval(this.intervalN);
  }

  ngOnInit(): void {
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY | H:mm',);
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.currentTime = moment(new Date()).format('H:mm');
    this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
    this.wardID = '3403';
    this.initializetablePatientsForm();
    this.initializetablePanicForm();
    this.startClock();
    if (!sessionStorage.getItem("IsTodayOrVisited")) {
      this.assignSessions(1);
      // this.getPatientData(1);
      //this.fetchPatients();
    }
    var d = new Date();
    var wm = new Date(d);
    wm.setDate(wm.getDate() - 10);
    this.tablePanicForm.patchValue({
      FromDate: wm,
      ToDate: d
    });

    //this.fetchreOpferralPatientsCount();
    this.fetchreIpReferralPatientsCount();
    // this.fetchDoctorAppointmentsList();
    this.fetchDoctorAppointmentsCount();
    const dentalspecs = this.dentalSpecialisations.find((x: any) => x === Number(this.doctorDetails[0].EmpSpecialisationId));
    if (dentalspecs || this.doctorDetails[0].EmpSpecialisationId == '28') {
      this.showWorklistBtn = true;
    }

    if (sessionStorage.getItem('selectedClinic')) {
      this.selectedClinic = JSON.parse(sessionStorage.getItem('selectedClinic') || '{}');
    }
    if (sessionStorage.getItem('showClinicDisplay') === 'true') {
      if (!this.selectedClinic) {
        $('#docWelcomeModal').modal('show');
      }
      sessionStorage.removeItem('showClinicDisplay');
    }
  }

  onLogout() {
    // sessionStorage.removeItem("patientInfo");
    // sessionStorage.removeItem("PatientDetails");
    // sessionStorage.removeItem("appointment");
    // sessionStorage.removeItem("selectedRegCode");
    // this.router.navigate(['/login']);
    this.config.onLogout();
  }

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  initializetablePatientsForm() {
    this.tablePatientsForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });
  }
  initializetablePanicForm() {
    this.tablePanicForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });
  }
  fetchPatientswithdates(filter: any) {
    sessionStorage.setItem("IsWeekOrMonth", filter);
    this.previousFilter = filter;

    const d = new Date();
    d.setDate(d.getDate() - 1);
    const fromDate = new Date(d);

    switch (filter) {
      case "D":
        fromDate.setDate(fromDate.getDate() + 1);
        break;
      case "W":
        fromDate.setDate(fromDate.getDate() - 6);
        break;
      case "M":
        fromDate.setMonth(fromDate.getMonth() - 1);
        break;
      case "3M":
        fromDate.setMonth(fromDate.getMonth() - 3);
        break;
      case "Y":
        fromDate.setDate(fromDate.getDate());
        break;
    }

    this.tablePatientsForm.patchValue({ FromDate: fromDate, ToDate: d });
    this.updateButtonStylesOnClick(filter);
    this.fetchPatients();
  }

  updateButtonStylesOnClick(filter: string) {
    const buttonMap: any = {
      "D": [],
      "W": ["prevWeek"],
      "M": ["prevMonth"],
      "3M": ["prevMonth3"],
      "Y": ["prevYDay"]
    };

    ["prevMonth", "prevWeek", "prevMonth3", "prevYDay"].forEach(id => {
      $(`#${id}`).toggleClass("btn-main-fill", buttonMap[filter]?.includes(id));
      $(`#${id}`).toggleClass("btn-main-outline", !buttonMap[filter]?.includes(id));
    });
  }

  fetchPanicwithdates(filter: any) {
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

  private updateButtonStyles(): void {
    const buttonIds = ['prevMonth', 'prevWeek', 'prevMonth3', 'prevYDay'];
    buttonIds.forEach(id => {
      $(`#${id}`).removeClass("btn-main-fill").addClass("btn-main-outline");
    });
  }

  assignSessions(type: any) {
    this.showAppointmentCalendar = false;
    this.previousFilter = "D";
    sessionStorage.setItem("IsTodayOrVisited", type);
    if (type === 2) {
      sessionStorage.setItem("IsWeekOrMonth", 'D');
      this.updateButtonStyles();
    }
    this.patientType = type;
    var d = new Date();
    this.tablePatientsForm.patchValue({
      FromDate: d,
      ToDate: d
    });

    this.previousClick = true;
  }

  getPatientData(type: any) {
    this.showAppointmentCalendar = false;
    this.previousFilter = "D";
    sessionStorage.setItem("IsTodayOrVisited", type);
    if (type === 2) {
      sessionStorage.setItem("IsWeekOrMonth", 'D');
      this.updateButtonStyles();
    }
    this.patientType = type;
    var d = new Date();
    this.tablePatientsForm.patchValue({
      FromDate: d,
      ToDate: d
    });

    this.previousClick = true;
    this.fetchPatients();
  }

  fetchPrevious() {
    this.previousClick = false;
  }

  refreshPatients() {
    this.fetchPatients();
  }

  fetchPatientsFromCalendar() {
    this.previousFilter = '';
    const fromdate = new Date(this.getFormattedDate(this.tablePatientsForm.value['FromDate']));
    const todate = new Date(this.getFormattedDate(this.tablePatientsForm.value['ToDate']));
    if (!isNaN(fromdate.getTime()) && !isNaN(todate.getTime())) {
      const diff = todate.getTime() - fromdate.getTime();
      const diffindays = diff / (1000 * 60 * 60 * 24);
      if (diffindays > 10) {
        this.errorMsg = "Selected date range should not exceed 10 days. Please select Start and End dates accordingly.";
        $('#errorMsg').modal('show');
        var d = new Date();
        this.tablePatientsForm.patchValue({
          FromDate: d,
          ToDate: d
        });
        return;
      }
      else {
        this.fetchPatients();
      }
    }
  }

  fetchPatients() {
    this.resetPatientData();
    this.fetchIPOPPatientCount();

    if (this.referralType === '1') {
      this.isOutPatient = "out";
      this.setDateString();

      this.config.fetchPatientsN(
        this.doctorDetails[0].EmpId,
        this.hospitalId,
        this.getFormattedDate(this.tablePatientsForm.value['FromDate']),
        this.getFormattedDate(this.tablePatientsForm.value['ToDate']),
        this.doctorDetails[0].UserId
      ).subscribe((response: any) => {
        this.processPatientResponse(response);
      }, (err) => {
        console.error("Error fetching patients", err);
      });
    } else {
      this.isOutPatient = "ipreferral";
      this.fetchReferralInpatients();
    }
  }

  private resetPatientData() {
    this.PatientsList = [];
    this.patientDetails = [];
    this.PatientsListToFilter = [];
    this.groupedData = {};
    this.walkinCount = 0;
    this.videoCount = 0;
    this.referralCount = 0;
    this.IsPanic = 0;
  }

  private getFormattedDate(date: any): string {
    return this.datepipe.transform(date, "dd-MMM-yyyy")?.toString() || '';
  }

  private setDateString() {
    const fromDate = this.getFormattedDate(this.tablePatientsForm.value['FromDate']);
    const toDate = this.getFormattedDate(this.tablePatientsForm.value['ToDate']);
    this.dateString = (fromDate === toDate) ? fromDate : `${fromDate} to ${toDate}`;
  }

  private processPatientResponse(response: any) {
    if (!response.length) {
      this.WaitingCount = 0;
      return;
    }

    this.referralCount = response.filter((x: any) => x?.OrderTypeID == '51').length;
    this.WaitingCount = response.filter((x: any) => x?.IsResultEnteredOrVerified == '1' && x?.IsResultViewed == '0').length;

    this.PatientsList = this.filterPatients(response);
    this.PatientsListToFilter = [...this.PatientsList];

    this.walkinCount = this.PatientsList.filter((x: any) => (!x?.ScheduleID || x?.ScheduleID === "") && x?.OrderTypeID !== 51).length;
    this.videoCount = this.PatientsList.filter((x: any) => x?.IsVirtual === 'True').length;
    this.IsPanic = this.PatientsList.filter((x: any) => x?.IsPanic === 1).length;

    if (this.activeTab === 'virtual') {
      this.PatientsList = this.PatientsList.filter((x: any) => x?.IsVirtual === 'True');
    } else {
      this.PatientsList = this.PatientsList.filter((x: any) => x?.IsVirtual !== 'True');
    }

    this.buildPatientDetails();
    this.groupPatientData();
    this.convertToArray();
    //this.fetchLabResultPanic();
  }

  private filterPatients(response: any) {
    //var fiveHrsBefore = new Date(new Date().setHours(5, 0, 0, 0));
    const currentDate = moment(new Date()).format('DD-MMM-YYYY HH:mm');
    const datepart = currentDate.split(' ')[0].split('-');
    const timepart = currentDate.split(' ')[1].split(':');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(datepart[1]);
    const freqtime = new Date(Number(datepart[2]), monthIndex, Number(datepart[0]), Number(timepart[0]), Number(timepart[1]));
    freqtime.setHours(freqtime.getHours() - 6);
    switch (this.patientType) {
      case 4:
        return response.filter((x: any) => x?.IsResultEnteredOrVerified == 1);
      case 3:
        return response.filter((x: any) => x?.OrderTypeID == '51');
      case 1:
        return response.filter((x: any) =>
          x?.OrderTypeID != '51' && x?.Status === "1" &&
          this.getFormattedDate(x?.Orderdate) >= this.getFormattedDate(freqtime)
        );
      case 2:
        if (this.previousFilter === "D") {
          return response.filter((x: any) =>
            x?.OrderTypeID != '51' && x?.Status === "2" &&
            this.getFormattedDate(x?.Orderdate) >= this.getFormattedDate(freqtime)
          );
        } else if (["M", "W"].includes(this.previousFilter)) {
          return response.filter((x: any) => x?.OrderTypeID != '51');
        }
    }
    return response;
  }

  private buildPatientDetails() {
    this.patientDetails = this.PatientsList.map((element: any) => ({
      SSN: element.SSN, EpisodeID: element.EpisodeID, AdmissionID: element.AdmissionID,
      hospitalId: element.HospitalID, PatientID: element.PatientID, RegCode: element.RegCode,
      ScheduleID: element.ScheduleID, IsVirtual: element.IsVirtual, IsAllergy: element.IsAllergy,
      Status: element.Status, GenderID: element.GenderID, IsPregnancy: element.IsPregnancy,
      PregnancyContent: element.PregnancyContent, OrderType: element.OrderType,
      PatientName: element.PatientName, FullAge_Gender: element.FullAge_Gender,
      Orderdate: element.Orderdate, Nationality: element.Nationality, TokenNumber: element.TokenNumber,
      Timeslot: element.Timeslot, Score: element.Score, InsuranceName: element.InsuranceName,
      AllergyData: element.AllergyData, Age_Gender: element.Age_Gender, MobileNo: element.MobileNo,
      Height: element.Height, Weight: element.Weight, WeightCreateDate: element.WeightCreateDate,
      BloodGroup: element.BloodGroup, ISVIP: element.ISVIP, MonitorID: element.MonitorID,
      SpecialiseID: element.SpecialiseID, BillType: element.BillType, PatientType: element.PatientType,
      Ward: '', DoctorID: element.DoctorID, BillID: element.BillID, Age: element.Age, Gender: element.Gender,
      IsPanic: element.IsPanic, BP: element.BP, Temperature: element.Temperature,
      DoctorName: element.Consultant, LetterID: element.LetterID, CompanyID: element.CompanyID,
      GradeID: element.GradeID, Pulse: element.Temperature, SPO2: element.SPO2, Respiration: element.Respiration,
      O2FlowRate: element.O2FlowRate, MartialStatus: element.MartialStatus, WardID: element.WardID,
      IsWheelChairPatient: element.IsWheelChairPatient, AgeF: Number(element.Age.split(' ')[0]),
      IsHighRisk: element.IsHighRisk, IsPriority: element.IsPriority, IsYearBaby: element.IsYearBaby,
      TariffId: element.Tariffid, ConsultationAmount: element.ConsultationAmount, LOALimit: element.LOALimit,
      InsuranceCompanyID: element.InsuranceCompanyID, IsResultViewed: element.IsResultViewed,
      CompanyName: element.CompanyName, GradeName: element.GradeName, ISEpisodeclose: element.ISEpisodeclose,
      EpisodeRemarks: element.EpisodeRemarks, EpisodeCloseDate: element.EpisodeCloseDate,
      Disposition: element.Disposition, EpisodeCloseOnlyDate: element.EpisodeCloseOnlyDate,
      OrderTypeID: element.OrderTypeID, IsOPPackage: element.IsOPPackage, DOB: element.DOB,
      HealthID: element.HealthID
    }));
  }

  // Group patient data by date
  private groupPatientData() {
    this.groupedData = this.patientDetails.reduce((acc: any, data: any) => {
      const date = this.getFormattedDate(data.Orderdate);
      acc[date] = acc[date] || [];
      acc[date].push(data);
      return acc;
    }, {});
  }


  fetchReferralInpatients() {
    // this.dynamicText = "Out Patient";
    //this.dynamicTextAR = this.langData?.common?.outPatient;
    this.isOutPatient = "ipreferral";
    this.PatientsList = [];
    this.patientDetails = [];
    this.PatientsListToFilter = [];
    this.groupedInPatientData = {};
    // this.appointmentCount = 0;
    this.walkinCount = 0;
    this.videoCount = 0;
    this.IsPanic = 0;
    this.fetchIPOPPatientCount();
    sessionStorage.setItem("IsTodayOrVisited", "1");
    this.fetchUserFacility();
  }

  fetchIPOPPatientCount(): void {
    var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'] ? this.tablePatientsForm.value['FromDate'] : new Date(), "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'] ? this.tablePatientsForm.value['ToDate'] : new Date(), "dd-MMM-yyyy")?.toString();
    if (FromDate === ToDate) {
      this.dateString = FromDate;
    }
    else {
      this.dateString = FromDate + " to " + ToDate;
    }
    this.config.fetchIPOPPatientCount(this.doctorDetails[0].EmpId, this.hospitalId, FromDate, ToDate).subscribe((response: any) => {
      if (response) {
        this.ipCount = response.IPOPPatientDataListDataList[0].IPCount;
        this.opCount = response.IPOPPatientDataListDataList[0].OPCount;

        if (this.dynamicText == "In Patient") {
          this.inPatient = this.ipCount;
        }
        else {
          this.inPatient = this.opCount;
        }
      }
    });
  }

  fetchInPatients() {
    this.PatientsList = [];
    this.patientDetails = [];
    this.PatientsListToFilter = [];
    this.groupedInPatientData = {};
    // this.appointmentCount = 0;
    this.walkinCount = 0;
    this.videoCount = 0;
    this.IsPanic = 0;
    this.fetchIPOPPatientCount();
    sessionStorage.setItem("IsTodayOrVisited", "1");
    this.fetchUserFacility();
    // this.config.fetchDoctorInPatients(this.doctorDetails[0].EmpId, this.hospitalId).subscribe((response: any) => {
    //   if (response.InPatientDataListDataList.length > 0) {
    //     this.PatientsList = response.InPatientDataListDataList;
    //     this.PatientsListToFilter = response.InPatientDataListDataList;

    //     this.walkinCount = this.PatientsList.filter((x: any) => (x?.ScheduleID === null || x?.ScheduleID === ""))?.length;
    //     this.appointmentCount = this.PatientsList.filter((x: any) => (x?.ScheduleID > 0))?.length;
    //     this.videoCount = this.PatientsList.filter((x: any) => (x?.IsVirtual === 1))?.length;
    //     this.IsPanic = this.PatientsList.filter((x: any) => (x?.IsPanic === 1))?.length;

    //     this.PatientsList.forEach((element: any, index: any) => {
    //       this.patientDetails.push({
    //         SSN: element.SSN, EpisodeID: element.EpisodeID, AdmissionID: element.AdmissionID, Orderdate: element.AdmitDate, hospitalId: element.HospitalID,
    //         PatientID: element.PatientID, RegCode: element.RegCode, ScheduleID: element.ScheduleID, IsVirtual: element.IsVirtual, IsAllergy: element.IsAllergy,
    //         Status: element.Status, GenderID: element.GenderID, IsPregnancy: element.IsPregnancy, PregnancyContent: element.PregnancyContent,
    //         OrderType: element.OrderType, PatientName: element.PatientName, FullAge_Gender: element.FullAge_Gender,
    //         Nationality: element.Nationality, TokenNumber: element.TokenNumber, Timeslot: element.Timeslot, Score: element.Score, InsuranceName: element.InsuranceName,
    //         AllergyData: element.AllergyData, Age_Gender: element.FullAge + "/" + element.Gender, MobileNo: element.MobileNo, Height: element.Height, Weight: element.Weight,
    //         WeightCreateDate: element.WeightCreateDate, BloodGroup: element.BloodGroup, ISVIP: element.ISVIP, MonitorID: element.MonitorID,
    //         SpecialiseID: element.SpecialiseID, BillType: element.BillType, PatientType: element.PatientType, Ward: element.Ward, DoctorID: element.DoctorID,
    //         BillID: element.BillID, Age: element.Age, Gender: element.Gender, IsPanic: element.IsPanic, BP: element.BP, Temperature: element.Temperature, DoctorName: element.Consultant,
    //         LetterID: element.LetterID, CompanyID: element.CompanyID, GradeID: element.GradeID,
    //         Pulse: element.Temperature, SPO2: element.SPO2, Respiration: element.Respiration, O2FlowRate: element.O2FlowRate, MartialStatus: element.MartialStatus, WardID: element.WardID
    //       })
    //     });
    //     // this.patientDetails = this.PatientsList;

    //     this.patientDetails.forEach((data) => {
    //       if (!this.groupedInPatientData[data.Ward]) {
    //         this.groupedInPatientData[data.Ward!] = [];
    //       }
    //       this.groupedInPatientData[data.Ward!].push(data);
    //     });

    //     this.convertToArrayInPatient();
    //   }
    // },
    //   (err) => {

    //   })
  }

  fetchUserFacility() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserWardFacilityDataaList;
        this.FetchUserFacilityDataList.forEach((element: any, index: any) => {
          element.selected = false;
          element.isDefault = false;
        });
        this.fetchDoctorDefaultWard();

      },
        (err) => {
        })

  }
  openFacilityMenu() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserFacilityDataList;
        this.fetchUserFavourite();
        $("#facilityMenu").modal('show');
      },
        (err) => {
        })

  }

  redirecttourlFav(url: any, FacilityID: any, FeatureName: any) {
    $("#facilityMenu").modal('hide');
    if (FeatureName.toLowerCase().indexOf('indent') !== -1) {
      this.router.navigate(['/' + url]);
    }
    else if (FacilityID != "") {
      sessionStorage.setItem("worklisturl", url);
      var facilityName = this.FetchUserFacilityDataList.find((x: any) => x.FacilityID === FacilityID);
      sessionStorage.setItem("facility", JSON.stringify(facilityName));
      $("#acc_receivable").modal('hide');
      if (url == "suit/WorkList?PTYP=1") {
        this.router.navigate(['/suit/labworklist']);
      }
      else if (url == "suit/ReferralWorklist") {
        this.router.navigate(['/suit/radiologyworklist']);
      }
      else if (url == "suit/Dentalworklist" || url == 'suit/Opthamaologyworklist' || url == 'suit/Dermatologyworklist' || url == 'suit/Cardiologyworklist' || url == 'suit/NeuroPhysiologyworklist' || url == 'suit/ENTworklist') {
        this.router.navigate(['/suit/worklist']);
      }
      else {
        if (FacilityID != '') {
          this.router.navigate(['/' + url]);
        }
      }
      sessionStorage.setItem("FacilityID", JSON.stringify(FacilityID));
    }
    else {
      $("#facilityValidation").modal('show');
    }
  }
  fetchUserFavourite() {
    this.suitconfig.FetchUserFavourite(this.doctorDetails[0].UserId, this.hospitalId).subscribe((response) => {
      this.favouritesList = response.FetchHospitalFeatureOutputLists;
    },
      (err) => {

      })
  }

  fetchreOpferralPatientsCount() {
    var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    if (FromDate == undefined && ToDate == undefined) {
      const d = moment(new Date()).format('DD-MMM-YYYY');
      FromDate = ToDate = d;
    }
    this.config.fetchPatients(this.doctorDetails[0].EmpId, this.hospitalId, FromDate, ToDate).subscribe((response: any) => {
      if (response.length > 0) {
        this.referralOpCount = this.referralCount;
      }
    },
      (err) => {

      })
  }
  fetchreIpReferralPatientsCount() {
    this.config.fetchBedsFromWardReferalCC(this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        this.referralIpCount = response.FetchBedsFromWardDataCountList.filter((x: any) => x.PatientType === '2').length;
        this.referralEmrCount = response.FetchBedsFromWardDataCountList.filter((x: any) => x.PatientType === '3').length;
      },
        (err) => {
        })
  }

  fetchInpatientsFromWards() {
    if (this.referralType === '2' || this.referralType === '3') {
      this.config.fetchBedsFromWardReferal(this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, this.hospitalId)
        .subscribe((response: any) => {
          this.FetchBedsFromWardDataListReferralFiltered = response.FetchBedsFromWardDataList;
          const fac = this.FetchDoctorDefaultWardsDataDList.find((x: any) => x.selected);
          this.FetchBedsFromWardDataListReferral = this.FetchBedsFromWardDataListReferralFiltered.filter((x: any) => x.WardID === fac.WardID);
          if (this.FetchBedsFromWardDataListReferral) {
            this.FetchBedsFromWardDataListReferral = this.FetchBedsFromWardDataListReferral.sort((a: any, b: any) => a.Bed.localeCompare(b.Bed));
          }
          //this.PatientsListToFilter = JSON.parse(JSON.stringify(this.FetchBedsFromWardDataListReferral));
        },
          (err) => {
          })
    }
    else {
      this.config.fetchBedsFromWard(this.wardID, this.doctorDetails[0].EmpId, 3, this.doctorDetails[0].EmpId, this.hospitalId)
        .subscribe((response: any) => {
          this.FetchBedsFromWardDataList = response.FetchBedsFromWardDataList;
          if (this.FetchBedsFromWardDataList) {
            this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => a.Bed.localeCompare(b.Bed));
          }
          this.PatientsListToFilter = JSON.parse(JSON.stringify(this.FetchBedsFromWardDataList));
        },
          (err) => {
          })
    }
  }

  saveAsDefault(item: any) {
    let payload = {
      "DoctorID": this.doctorDetails[0].EmpId,
      "HospitalID": this.hospitalId,
      "WardID": item.FacilityID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": item.FacilityID
    }
    this.config.saveDoctorDefaultWards(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.fetchDoctorDefaultWard();
        }
      },
      (err) => {
        console.log(err)
      });
  }

  fetchDoctorDefaultWard() {
    this.config.FetchDoctorDefaultWards(this.doctorDetails[0].EmpId, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (this.referralType === '2') {
            this.FetchDoctorDefaultWardsDataDList = response.FetchDoctorDefaultReferalWardsDataDList.filter((x: any) => x.PatientType === '2');
          }
          else if (this.referralType === '3') {
            this.FetchDoctorDefaultWardsDataDList = response.FetchDoctorDefaultReferalWardsDataDList.filter((x: any) => x.PatientType === '3');;
          }
          else {
            this.FetchDoctorDefaultWardsDataDList = response.FetchDoctorDefaultWardsDataDList;
          }
          var fac = this.FetchDoctorDefaultWardsDataDList;//this.FetchUserFacilityDataList.find((x:any) => x.FacilityID === response.FetchDoctorDefaultWardsDataDList[0].WardID); 
          this.FetchDoctorDefaultWardsDataDList.forEach((element: any, index: any) => {
            if (element.WardID === fac[0].WardID) {
              element.isDefault = true;
              element.selected = true;
              this.wardID = fac[0].WardID;
              this.fetchInpatientsFromWards();
            }
            else {
              element.isDefault = false;
              element.selected = false;
            }
          });
        }

      },
        (err) => {
        })
  }

  navigate(page: any, facility: any) {
    this.wardID = facility.WardID;
    this.FetchDoctorDefaultWardsDataDList.forEach((element: any, index: any) => {
      if (element.WardID === facility.WardID) {
        element.isDefault = true;
        element.selected = true;
      }
      else {
        element.selected = false;
        element.isDefault = false;
      }

    });
    this.fetchInpatientsFromWards();
  }

  private convertToArrayInPatient(): void {
    this.groupedInPatientDataArray = Object.keys(this.groupedInPatientData).map((ward) => ({
      ward,
      values: this.groupedInPatientData[ward],
    }));

    //this.groupedDataArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

  // get sortData() {
  //   return this.patientDetails.sort((a, b) => {
  //     return <any>new Date(b.Orderdate) - <any>new Date(a.Orderdate);
  //   });
  // }

  getSSNSearch(key: any) {
    this.isFilter = true;
    if (key.target.value.length === 0) {
      this.PatientsList = this.PatientsListToFilter;
      this.isFilter = false;
    }
    else if (key.target.value.length > 2) {
      let filteredresponse = this.PatientsListToFilter.filter((x: any) => (x?.SSN.includes(key.target.value) || x?.PatientName.toLowerCase().includes(key.target.value.toLowerCase())));
      this.PatientsList = filteredresponse;
    }
  }

  fetchPatientSummary(pl: any) {
    sessionStorage.setItem("selectedRegCode", JSON.stringify(pl.RegCode));
    this.getPatientDetails(pl.RegCode, pl.PatientType, pl);
  }

  getPatientDetails(RegCode: any, patientType: any, selectedPatient: any) {
    let payload = {
      "RegCode": RegCode
    }
    this.config.getPatientDetails(payload).subscribe((response) => {
      if (response.Status === "Success") {
        sessionStorage.setItem("PatientDetails", JSON.stringify(response));
        sessionStorage.setItem("selectedPatientAdmissionId", this.selectedPatientAdmissionId);
        if (patientType == '1') {
          this.router.navigate(['/home/doctorcasesheet']);
        }
        else if (patientType == '2') {
          // sessionStorage.setItem("InPatientDetails", JSON.stringify(response));
          // sessionStorage.setItem("selectedView", JSON.stringify(response));
          // sessionStorage.setItem("selectedCard", JSON.stringify(response));   
          sessionStorage.setItem("FromDocCalendar", "true");
          sessionStorage.setItem("InPatientDetails", JSON.stringify(selectedPatient));
          sessionStorage.setItem("PatientDetails", JSON.stringify(selectedPatient));
          sessionStorage.setItem("selectedView", JSON.stringify(selectedPatient));
          sessionStorage.setItem("selectedCard", JSON.stringify(selectedPatient));
          sessionStorage.setItem("selectedPatientAdmissionId", selectedPatient.IPID);

          this.router.navigate(['/home/doctorcasesheet']);
        }
        //this.router.navigate(['/home/casesheet']);
      }
    },
      (err) => {

      })
  }

  closeAllergiesTooltip() {
    $('#divAllergyTooltip').removeClass('hoverAllergy');
  }

  GetDetails(pl: any) {
    this.selectedPatientAdmissionId = pl.AdmissionID;
    this.getPatientDetails(pl.RegCode, pl.PatientType, pl);
    sessionStorage.setItem("selectedView", JSON.stringify(pl));
  }

  showPatientInfo(pinfo: any) {
    $("#quick_info").modal('hide');
    this.patinfo = pinfo;
    setTimeout(() => {
      $("#quick_info").modal('show');
    }, 100);

  }

  showWalkinPatients() {
    this.activeTab = 'walkin';
    this.showIpOpToggle = false;
    this.showAppointmentCalendar = false;
    this.isOutPatient = "out";
    this.referralType = "1";
    this.getPatientData(1);
    //this.fetchPatients();
  }

  showVideoConsultantPateints() {
    this.activeTab = 'virtual';
    this.showIpOpToggle = false;
    this.showAppointmentCalendar = false;
    this.isOutPatient = "out";
    this.referralType = "1";
    this.getPatientData(1);
  }

  referralsList() {
    this.activeTab = 'referrals';
  }

  inOutPatientList() {
    this.activeTab = 'opippatients';
    this.showAppointmentCalendar = false;
    if (this.dynamicText === "In Patient") {
      this.dynamicText = "Out Patient";
      this.dynamicTextAR = this.langData?.common?.outPatient;
      this.isOutPatient = "in";
      this.referralType = "1";
      this.showIpOpToggle = false;
      this.fetchInPatients();
    }
    else {
      this.dynamicText = "In Patient";
      this.isOutPatient = "out";
      this.dynamicTextAR = this.langData?.common?.inPatient;
      this.referralType = "1";
      this.showIpOpToggle = false;
      this.getPatientData(1);
      //this.fetchPatients();
    }
  }
  referralPatientList() {
    this.patientType = 3;
    this.showIpOpToggle = true;
    this.fetchPatients();
  }
  fetchLabResultPanic() {
    //var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    //var ToDate= this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    var FromDate = this.datepipe.transform(new Date().setDate(new Date().getDate() - 10), "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();

    this.config.fetchDocPanicCountResults(FromDate, ToDate, this.doctorDetails[0].EmpId, 1, this.hospitalId).subscribe((response) => {
      //this.labPanicCount = Number(response.FetchDocPanicCountDataaList[0].Ispanic) + Number(response.FetchDocPanicCountDataaList[0].IsAbnormal); 
      this.labPanicCount = Number(response.FetchDocPanicCountDataaList[0]?.IspanicAbnormal);
    },
      (err) => {

      })
  }
  getLabPanicResults() {
    this.FetchPanicData = [];
    const headerToggleElement = document.querySelector('.header_toggle') as HTMLElement;
    headerToggleElement.style.display = 'none';
    const weekButton = document.getElementById('prevWeek') as HTMLElement;
    const monthButton = document.getElementById('prevMonth') as HTMLElement;
    const dateRangeButton = document.querySelector('.date_range_calendar') as HTMLElement;
    const refreshIcon = document.getElementById('btnRefresh') as HTMLElement;
    // if (weekButton) {
    //   weekButton.style.display = 'none';
    // }
    // if (monthButton) {
    //   monthButton.style.display = 'none';
    // }
    // if (dateRangeButton) {
    //   dateRangeButton.style.display = 'none';
    // }
    // if (refreshIcon) {
    //   refreshIcon.style.display = 'none';
    // }
    this.showLabPanicDetails = true;
    //var FromDate =this.datepipe.transform(new Date().setMonth(new Date().getMonth() - 1), "dd-MMM-yyyy")?.toString();
    //var FromDate =this.datepipe.transform(new Date().setDate(new Date().getDate() - 10), "dd-MMM-yyyy")?.toString();
    //var ToDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
    var FromDate = this.datepipe.transform(this.tablePanicForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePanicForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    this.config.fetchDocPanicCountResults(FromDate, ToDate, this.doctorDetails[0].EmpId, 2, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        this.labPanicCountDetails = response.FetchDocPanicDetailedCountDataaList;
        this.labPanicCount = Number(response.FetchDocPanicCountDataaList[0]?.IspanicAbnormal);

        const distinctThings = response.FetchDocPanicDetailedCountDataaList.filter(
          (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.PatientID === thing.PatientID) === i);
        console.dir(distinctThings);
        this.labPanicCountDetailsDistinct = distinctThings;
        this.labPanicCountDetailsDistinct.forEach((element: any, index: any) => {
          var panicCount = this.labPanicCountDetailsDistinct.filter((r: any) => r.IsPanic == 1 && r.PatientID == this.labPanicCountDetailsDistinct[index].PatientID).length;
          var abnormalCount = this.labPanicCountDetailsDistinct.filter((r: any) => r.IsAbnormal == 1 && r.PatientID == this.labPanicCountDetailsDistinct[index].PatientID).length;
          if (panicCount > 0) {
            element.Class = "legend_line panic";
          }
          else if (abnormalCount > 0) {
            element.Class = "legend_line abnormal";
          }
          else {
            element.Class = "";
          }
        });
        this.groupedDataPanic = {};
        this.groupedDataInvArray = [];
        this.labPanicCountDetails.forEach((element: any, index: any) => {
          this.FetchPanicData.push({ PatientID: element.PatientID, TestOrderID: element.TestOrderID, TestOrderItemID: element.TestOrderItemID, PanicResult: element.PanicResult, group: element.TestName, name: element.CompONentname, AbnormalResult: element.AbnormalResult, ResultValue: element.ResultValue, Maxlimit: element.Maxlimit, MinLimit: element.MinLimit, createdate: element.createdate, UOM: element.UOM, ServiceID: element.ServiceID, IsResult: element.isResult });
        });
        this.FetchPanicData.forEach((data) => {
          if (!this.groupedDataPanic[data.group]) {
            this.groupedDataPanic[data.group] = [];
          }
          this.groupedDataPanic[data.group].push(data);
        });
        this.convertToArray();
      }
    },
      (err) => {
      })
  }
  showPanicAbnormal(pl: any) {
    var FromDate = this.datepipe.transform(this.tablePanicForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePanicForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    this.config.fetchDocPanicCountResults(FromDate, ToDate, this.doctorDetails[0].EmpId, 2, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        this.labPanicCountDetails = response.FetchDocPanicDetailedCountDataaList;
        this.labPanicCount = Number(response.FetchDocPanicCountDataaList[0]?.IspanicAbnormal);
        this.labPanicCountDetailsFiltered = response.FetchDocPanicDetailedCountDataaList.filter((x: any) => x.PatientID == pl.PatientID);
        this.showLabPanicDetails = true;
        const distinctThings = this.labPanicCountDetailsFiltered.filter(
          (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.PatientID === thing.PatientID) === i);
        console.dir(distinctThings);
        this.labPanicCountDetailsDistinct = distinctThings;

        this.labPanicCountDetailsDistinct.forEach((element: any, index: any) => {
          var panicCount = this.labPanicCountDetailsDistinct.filter((r: any) => r.IsPanic == 1 && r.PatientID == this.labPanicCountDetailsDistinct[index].PatientID).length;
          var abnormalCount = this.labPanicCountDetailsDistinct.filter((r: any) => r.IsAbnormal == 1 && r.PatientID == this.labPanicCountDetailsDistinct[index].PatientID).length;
          if (panicCount > 0) {
            element.Class = "legend_line panic";
          }
          else if (abnormalCount > 0) {
            element.Class = "legend_line abnormal";
          }
          else {
            element.Class = "";
          }
        });
      }
    },
      (err) => {

      })
  }
  filterFunction(data: any, patientId: any) {
    return data.filter((row: any) => row.values[0].PatientID == patientId);
  }
  showPatientsData() {
    const headerToggleElement = document.querySelector('.header_toggle') as HTMLElement;
    headerToggleElement.style.display = 'inline-block';
    const weekButton = document.getElementById('prevWeek') as HTMLElement;
    const monthButton = document.getElementById('prevMonth') as HTMLElement;
    const dateRangeButton = document.querySelector('.date_range_calendar') as HTMLElement;
    const refreshIcon = document.getElementById('btnRefresh') as HTMLElement;
    if (weekButton) {
      weekButton.style.display = 'inline-block';
    }
    if (monthButton) {
      monthButton.style.display = 'inline-block';
    }
    if (dateRangeButton) {
      dateRangeButton.style.display = 'inline-block';
    }
    if (refreshIcon) {
      refreshIcon.style.display = 'inline-block';
    }
    this.showLabPanicDetails = false;
    this.fetchLabResultPanic();
  }
  acknowledgeTest(index: any) {
    this.showLabackwlegementDetails[index] = true;
  }
  backToAcknowledge() {
    if (this.acknowledgeSection && this.acknowledgeSection.nativeElement) {
      const element = this.acknowledgeSection.nativeElement;
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  toggleAcknowledgeSection(index: any) {
    this.showLabackwlegementDetails[index] = !this.showLabackwlegementDetails[index];
    if (this.showLabackwlegementDetails[index]) {
      this.backToAcknowledge();
    }
  }
  acknowledgeClear(index: any) {
    this.showLabackwlegementDetails[index] = !this.showLabackwlegementDetails[index];
    if (this.showLabackwlegementDetails[index]) {
      this.backToAcknowledge();
    }
  }
  GoBackToHome() {
    this.router.navigate(['/login/doctor-home'])
  }
  openPatientFolder() {
    sessionStorage.removeItem("selectedView");
    sessionStorage.setItem("FromPatients", String(true));
    this.router.navigate(['/shared/patientfolder']);
  }
  toggle_labpanic(panicres: any) {
    panicres.showAcknowledgeBtn = !panicres.showAcknowledgeBtn;
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
      this.config.updateIsdocReadRemarks(ackpayload).subscribe(
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

  redirecttoVitalScreen(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/ward/ipvitals']);
  }

  redirectToLabTrend(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.router.navigate(['/ward/labtrend']);
  }
  redirectToDrugAdministration(item: any) {
  }

  redirectToSampleCollection(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/ward/samplecollection']);
  }

  redirecttoProgressNotesScreen(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.router.navigate(['/ward/progress-note']);
  }
  filterChangeData(event: any) {
    this.isFilter = true;
    if (event.length === 0) {
      this.FetchBedsFromWardDataList = this.PatientsListToFilter;
      this.isFilter = false;
    }
    else if (event.length > 2) {
      let filteredresponse = this.PatientsListToFilter.filter((x: any) => (x?.SSN.includes(event) || x?.PatientName.toLowerCase().includes(event.toLowerCase())));
      this.FetchBedsFromWardDataList = filteredresponse;
    }
  }
  onSelectWard() {

  }
  navigatetoCaseSheet(item: any, fromdb: string) {
    if (fromdb === 'fromdashboard') {
      sessionStorage.setItem("FromDocCalendar", "true");
    }
    else if (fromdb === 'fromprevrefdashboard') {
      sessionStorage.setItem("FromDocCalendar", "true");
      sessionStorage.setItem("FromPrevRefDocCalendar", "true");
    }
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedCard", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    this.router.navigate(['/home/doctorcasesheet']);
  }

  redirectToEndoScopy(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("FromBedBoard", "true");
    this.router.navigate(['/ward/endoscopy']);
  }
  navigatetoAdmissionReconciliation(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedCard", JSON.stringify(item));
    sessionStorage.setItem("navigation", "AdmissionReconciliation");
    this.router.navigate(['/home/doctorcasesheet']);
  }
  navigatetoDischargeReconciliation(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    this.router.navigate(['/ward/dischargereconciliation']);
  }
  navigatetoPatientSummary(item: any) {
    sessionStorage.setItem("fromDoctorDashboard", "true");
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    sessionStorage.setItem("PatientID", item.PatientID);
    this.router.navigate(['/shared/patientfolder']);
    //this.router.navigate(['/home/summary']);
  }
  redirectToNursingDashboard(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/ward/nursingdashboard']);
  }

  redirectToShiftHandover(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.router.navigate(['/ward/shifthandover']);
  }

  navigatetoResults(item: any) {
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("FromBedBoard", "true");
    this.router.navigate(['/home/otherresults']);
  }

  getViewApproval(item: any) {
    this.FetchApprovalInfoDataList = [];
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.IsApproval = false;
    setTimeout(() => {
      this.IsApproval = true;
    }, 0);

    this.datesForm = this.fb.group({
      fromdate: [''],
      todate: [''],
    });
    var wm = new Date(item.AdmitDate); //moment(item.AdmitDate).format('yyyy-MM-DD');
    wm.setMonth(wm.getMonth() - 1);
    var d = new Date();
    this.datesForm.patchValue({
      fromdate: wm,
      todate: d
    })


    var FromDate = this.datepipe.transform(this.datesForm.value['fromdate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.datesForm.value['todate'], "dd-MMM-yyyy")?.toString();
    this.bedConfig.FetchLOAApprovalRequestDetails(item.PatientID, FromDate, ToDate, this.wardID, this.hospitalId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.FetchApprovalInfoDataList = response.FetchLOAApprovalRequestDetailsListM;
        $("#viewApproval").modal('show');
      }
    }, (error: any) => {
      console.error('Get Data API error:', error);
    });
  }
  redirectToMotherMilkExtraction(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/ward/mothermilkextraction']);
  }
  redirectToMotherMilkFeeding(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/ward/mothermilkfeeding']);
  }
  redirectToIntakeoutput(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/ward/intakeoutput']);
  }

  redirectToTemplates(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/templates']);
  }
  navigateToNursingdashboard() {
    this.router.navigate(['/ward/wardnursingdashboard']);
  }
  navigateToBedTransfer() {
    this.router.navigate(['/ward/bedtransfer']);
  }
  selectedWard() {
    $("#facilityMenu").modal('hide');
  }
  fitForDischargeClick(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    item.fitForDischarge = true;
    this.fitForDischarge = true;
    this.ClinicVisitAfterDays = item.ClinicVisitAfterDays !== '' ? item.ClinicVisitAfterDays : '0';
    $("#fitfordischarge").modal('show');
  }
  closeFitForDischarge() {
    this.fitForDischarge = false;
  }

  toggleIpOpSelection(val: string) {
    this.showAppointmentCalendar = false;
    this.referralType = val;
    this.referralPatientList()
  }
  navigateReferral(ptype: string, item: any) {
    this.FetchDoctorDefaultWardsDataDList.forEach((element: any, index: any) => {
      if (element.WardID === item.WardID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.FetchBedsFromWardDataListReferral = this.FetchBedsFromWardDataListReferralFiltered.filter((x: any) => x.WardID === item.WardID);
  }

  FetchBedsFromWardReferalDateWise() {
    var FromDate = this.datepipe.transform(this.referralDateForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.referralDateForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    var fac = this.FetchDoctorDefaultWardsDataDList.find((x: any) => x.selected);

    this.config.fetchBedsFromWardReferalDateWise(this.doctorDetails[0].EmpId, FromDate, ToDate, 0, this.doctorDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code === 200) {
          this.FetchBedsFromWardDataListReferralFiltered = response.FetchBedsFromWardDataList;
          this.FetchDoctorDefaultWardsDataDList = response.FetchDoctorDefaultReferalWardsDataDDList;

          var fac1 = this.FetchDoctorDefaultWardsDataDList;
          this.FetchDoctorDefaultWardsDataDList.forEach((element: any, index: any) => {
            if (element.WardID === fac1[0].WardID) {
              element.isDefault = true;
              element.selected = true;
              this.wardID = fac1[0].WardID;
              this.FetchBedsFromWardReferalDateWardWise();
            }
            else {
              element.isDefault = false;
              element.selected = false;
            }
          });


          const fac = this.FetchDoctorDefaultWardsDataDList.find((x: any) => x.selected);
          this.FetchBedsFromWardDataListReferral = this.FetchBedsFromWardDataListReferralFiltered.filter((x: any) => x.WardID === fac.WardID);
          if (this.FetchBedsFromWardDataListReferral) {
            this.FetchBedsFromWardDataListReferral = this.FetchBedsFromWardDataListReferral.sort((a: any, b: any) => a.Bed.localeCompare(b.Bed));
          }
          else {
            this.FetchBedsFromWardDataListReferralFiltered = []; this.FetchBedsFromWardDataListReferral = [];
          }
        }
      },
        (err) => {
        })
  }
  FetchBedsFromWardReferalDateWardWise() {
    var FromDate = this.datepipe.transform(this.referralDateForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.referralDateForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    var fac = this.FetchDoctorDefaultWardsDataDList.find((x: any) => x.selected);
    this.isOutPatient = "prevreferral";

    this.config.fetchBedsFromWardReferalDateWise(this.doctorDetails[0].EmpId, FromDate, ToDate, fac.WardID, this.doctorDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code === 200) {
          this.FetchBedsFromWardDataListReferralFilteredWard = response.FetchBedsFromWardDataList;
          const fac = this.FetchDoctorDefaultWardsDataDList.find((x: any) => x.selected);
          this.FetchBedsFromWardDataListReferral = this.FetchBedsFromWardDataListReferralFilteredWard.filter((x: any) => x.WardID === fac.WardID);
          if (this.FetchBedsFromWardDataListReferral) {
            this.FetchBedsFromWardDataListReferral = this.FetchBedsFromWardDataListReferral.sort((a: any, b: any) => a.Bed.localeCompare(b.Bed));
          }
          else {
            this.FetchBedsFromWardDataListReferralFilteredWard = []; this.FetchBedsFromWardDataListReferral = [];
          }
        }
      },
        (err) => {
        })
  }
  navigateToResultsG(item: any) {
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("FromCaseSheet", "false");
    this.showResultsinPopUp = true;
    $("#viewResults").modal("show");
  }

  fetchPatientWalkthroughInfo(pinfo: any) {
    $("#walkthrough_info").modal('hide');
    if (pinfo.AdmissionReqAdmissionid != '') {
      pinfo.FullAge = pinfo.Age;
      pinfo.FromDoctor = pinfo.Consultant;
      pinfo.AdmissionID = pinfo.AdmissionReqAdmissionid;
      this.patinfo = pinfo;
      $("#walkthrough_info").modal('show');
    } else {
      this.ValidationMsg = "NO Previous Visit Info Found";
      $("#WalkthorughMsg").modal('show');
    }
  }
  clearPatientInfo() {
    $("#quick_info").modal('hide');
    this.patinfo = "";
    this.pinfo = "";
  }

  showDoctorInstructions(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(InstructionsToNurseComponent, {
      data: "doctorinstructions",
      readonly: true
    }, options);
  }

  showDoctorReferal(item: any) {
    this.FetchDoctorReferralOrdersDataList = [];
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.IsApproval = false;
    setTimeout(() => {
      this.IsApproval = true;
    }, 0);
    this.bedConfig.FetchDoctorReferralOrders(item.AdmissionID, this.wardID, this.hospitalId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.FetchDoctorReferralOrdersDataList = response.FetchDoctorReferralOrdersDataList;

        this.FetchDoctorReferralOrdersDataList.forEach((element: any, index: any) => {
          element.isVerified = element?.IsVisited === 'True' ? true : false;
          element.VerifiedBy = element.VisitUpdatedByName;
          element.VerifiedDate = element.VisitedDate;
          element.Comments = element.Comments;
        });

        $("#viewReferal").modal('show');
      }
    }, (error: any) => {
      console.error('Get Data API error:', error);
    });
  }

  saveDoctorVisited(item: any) {
    this.showPatientNotSelectedValidation = false;
    if (item.Status == '0') {
      this.showPatientNotSelectedValidation = true;
      return;
    }
    $("#viewReferal").modal('hide');
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        $("#viewReferal").modal('show');
        this.SaveIsSeenbyDoctorReferal(item);
      }
      modalRef.close();
    });
  }

  SaveIsSeenbyDoctorReferal(data: any) {
    this.isVerified = !this.isVerified;
    var payload = {
      "ReferralOrderID": data.ReferralOrderID,
      "Comments": '',
      "VisitedUpdatedBy": this.doctorDetails[0].UserId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "HospitalID": this.hospitalId,
    };
    this.bedConfig.UpdateDoctorReferralOrdersVisit(payload).subscribe(response => {
      if (response.Code == 200) {
        this.saveMsg = "Updated Successfully";
        $("#assignReferalMsg").modal('show');
      }
    })
  }

  closeIsSeenbyDoctorReferalPopUp() {
    $("#assignReferalMsg").modal('hide');
  }

  showVirtualDischargeConformPopup(item: any) {
    if (!item.IsVirtualDischarge) {
      this.selectedPatientForVirtualDischarge = item;
      $("#virtualDischargeConfirmModal").modal('show');
    }
  }

  virtualDischarge() {
    let payload = {
      "VirtualDischargeID": "0",
      "PatientID": this.selectedPatientForVirtualDischarge.PatientID,
      "AdmissionID": this.selectedPatientForVirtualDischarge.AdmissionID,
      "HospitalID": this.hospitalId,
      "IsVirtualDischarge": true,
      "Remarks": "",
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID
    }
    this.bedConfig.SavePatientAdmissionVirtualDischarges(payload).subscribe(response => {
      if (response.Code == 200) {
        $('#saveETTDataMsg').modal('show');
        this.fetchInpatientsFromWards();
      }
    });
  }

  openPainAssessment(item: any) {
    this.showPainAssessment = true;
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("FromBedBoard", "true");
    setTimeout(() => {
      $("#modalPainScore").modal('show');
    }, 200);
  }

  closePopup() {
    sessionStorage.removeItem("InPatientDetails");
    sessionStorage.removeItem("FromBedBoard");
    this.fetchInpatientsFromWards();
    this.showPainAssessment = false;
    $("#modalPainScore").modal('hide');
  }

  startTimers(date: any): any {
    if (date.PainAssessmentOrderDate != null) {
      const startDate = moment(new Date(date.PainAssessmentOrderDate)).format('DD-MMM-YYYY HH:mm:ss');
      const datepart = date.PainAssessmentOrderDate.split(' ')[0].split('-');
      const timepart = date.PainAssessmentOrderDate.split(' ')[1].split(':');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = monthNames.indexOf(datepart[1]);
      const freqtime = new Date(datepart[2], monthIndex, datepart[0], timepart[0], timepart[1]);
      freqtime.setMinutes(freqtime.getMinutes() + Number(date.ReAssesmentPainInterventionTime));
      let differenceMs;
      if (new Date().getTime() > freqtime.getTime()) {
        differenceMs = new Date().getTime() - freqtime.getTime();
      } else {
        return `00:00:00`;
      }
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

  startTimersForVTE(date: any): any {
    if (date.AdmitDate != null && date.IsVTE === '0' && Number(date.AgeValue) >= 14 && date.PatientType === '2') {
      const startDate = moment(new Date(date.AdmitDate)).format('DD-MMM-YYYY HH:mm:ss');
      const datepart = date.AdmitDate.split(' ')[0].split('-');
      const timepart = date.AdmitDate.split(' ')[1].split(':');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = monthNames.indexOf(datepart[1]);
      const freqtime = new Date(datepart[2], monthIndex, datepart[0], timepart[0], timepart[1]);
      freqtime.setHours(freqtime.getHours() + 24);
      let differenceMs;
      if (freqtime.getTime() > new Date().getTime()) {
        differenceMs = freqtime.getTime() - new Date().getTime();
      } else {
        return `00:00:00`;
      }
      //differenceMs = freqtime.getTime() - new Date().getTime();
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

  navigateToMedicalAssesment(item: any) {
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedCard", JSON.stringify(item));
    sessionStorage.setItem("navigation", "MedicalAssessment");
    this.router.navigate(['/home/doctorcasesheet']);
  }

  navigatetoVTEForms(item: any) {
    if (item.VTEOrderID != '') {
      this.bedConfig.FetchFinalSaveVTERiskAssessment(item.AdmissionID, this.doctorDetails[0].UserId, this.wardID, this.hospitalId)
        .subscribe((response: any) => {
          if (response.Code === 200 && response.FetchFinalSaveVTERiskAssessmentDataList.length > 0) {
            const vterisk = response.FetchFinalSaveVTERiskAssessmentDataList.find((x: any) => x.RiskAssessmentOrderID === item.VTEOrderID);
            if (vterisk) {
              const vteformtype = vterisk.AssessmentType;
              sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
              sessionStorage.setItem("PatientDetails", JSON.stringify(item));
              sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
              sessionStorage.setItem("selectedView", JSON.stringify(item));
              sessionStorage.setItem("selectedCard", JSON.stringify(item));
              sessionStorage.setItem("navigation", vteformtype);
              this.router.navigate(['/home/doctorcasesheet']);
            }
            else {
              this.FetchPatientFinalObgVTEFrom(item);
            }
          }
          else {
            this.FetchPatientFinalObgVTEFrom(item);
          }
        },
          (err) => {
          })
    }
    else {
      this.redirecttoVte(item);
    }
  }

  redirecttoVte(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedCard", JSON.stringify(item));
    sessionStorage.setItem("navigation", "VTEForms");
    this.router.navigate(['/home/doctorcasesheet']);
  }

  FetchPatientFinalObgVTEFrom(item: any) {
    this.bedConfig.FetchPatientFinalObgVTEFrom("0", item.AdmissionID, this.doctorDetails[0].UserId, this.wardID, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code === 200 && response.FetchPatientFinalObgVTEFromPatDataList.length > 0) {
          const vterisk = response.FetchPatientFinalObgVTEFromPatDataList.find((x: any) => x.RiskAssessmentOrderID === item.VTEOrderID);
          if (vterisk) {
            const vteformtype = vterisk.AssessmentType;
            sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
            sessionStorage.setItem("PatientDetails", JSON.stringify(item));
            sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
            sessionStorage.setItem("selectedView", JSON.stringify(item));
            sessionStorage.setItem("selectedCard", JSON.stringify(item));
            sessionStorage.setItem("navigation", "VTE ObGyne");
            this.router.navigate(['/home/doctorcasesheet']);
          }
          else {
            this.redirecttoVte(item);
          }
        }
        else {
          this.redirecttoVte(item);
        }
      },
        (err) => {
        })
  }

  showAppointment() {
    this.activeTab = 'appointments';
    this.showIpOpToggle = false;
    this.showAppointmentCalendar = true;
    this.fetchDoctorAppointmentsList();
  }

  fetchDoctorAppointmentsList() {

    const fromDateRaw = this.appointmentsDateForm.get('FromDate')?.value;
    const toDateRaw = this.appointmentsDateForm.get('ToDate')?.value;

    const fromDate = new Date(fromDateRaw);
    const todate = new Date(toDateRaw);

    if (!isNaN(fromDate.getTime()) && !isNaN(todate.getTime())) {
      const diff = todate.getTime() - fromDate.getTime();
      const diffindays = diff / (1000 * 60 * 60 * 24);
      if (diffindays > 10) {
        this.errorMsg = "Selected date range should not exceed 10 days. Please select Start and End dates accordingly.";
        $('#errorMsg').modal('show');
        var d = new Date();
        this.appointmentsDateForm.patchValue({
          FromDate: d,
          ToDate: d
        });
        return;
      }
      else {
        let formattedFromDate;
        let formattedToDate;

        if (fromDate !== null && fromDate !== undefined) {
          formattedFromDate = this.datepipe.transform(fromDate, "dd-MMM-yyyy")?.toString() ?? '';
        }

        if (todate !== null && todate !== undefined) {
          formattedToDate = this.datepipe.transform(todate, "dd-MMM-yyyy")?.toString() ?? '';
        }

        const params = {
          FromDate: formattedFromDate,
          ToDate: formattedToDate,
          SSN: 0,
          SpecialiseID: this.doctorDetails[0].EmpSpecialisationId,
          DoctorID: this.doctorDetails[0].EmpId,
          WorkStationID: this.doctorDetails[0]?.FacilityId ?? 0,
          HospitalID: this.hospitalId
        };

        const url = this.us.getApiUrl(PatientDetails.FetchPatientAppointmentsWorkList, params);
        this.us.get(url)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.appointmentList = response.FetchPatientAppointmentsWorkListDataList.filter((x: any) => x?.AppStatus == '3' && x.Blocked == '0');
              this.appointmentCount = this.appointmentList.length;
            }
          },
            (err) => {

            })
      }
    }
  }

  fetchDoctorAppointmentsCount() {
    const params = {
      FromDate: moment(new Date()).format('DD-MMM-YYYY'),
      ToDate: moment(new Date()).format('DD-MMM-YYYY'),
      SSN: 0,
      SpecialiseID: this.doctorDetails[0].EmpSpecialisationId,
      DoctorID: this.doctorDetails[0].EmpId,
      WorkStationID: this.doctorDetails[0]?.FacilityId ?? 0,
      HospitalID: this.hospitalId
    };

    const url = this.us.getApiUrl(PatientDetails.FetchPatientAppointmentsWorkListCCC, params);
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          // this.appointmentList = response.FetchPatientAppointmentsWorkListDataList.filter((x: any) => x?.AppStatus == '3' && x.Blocked=='0' );
          this.appointmentCount = response.FetchPatientAppointmentsWorkList1FDataList[0]?.Count;
        }
      },
        (err) => {

        })
  }

  getVisitedCount(items: any) {
    return items.filter((el: any) => el.Status == '2').length;
  }

  getNotVisitedCount(items: any) {
    return items.filter((el: any) => el.Status != '2').length;
  }

  navigateToWorklist(pat: any) {
    var fac: any = []; var url = "";
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code === 200) {
          const FetchUserFacilityDataList = response.FetchUserFacilityDataList;
          const dentalspecs = this.dentalSpecialisations.find((x: any) => x === Number(this.doctorDetails[0].EmpSpecialisationId));
          if (dentalspecs) {
            fac = FetchUserFacilityDataList.find((x: any) => x.FacilityID == '2070');
            url = "suit/Dentalworklist";
            sessionStorage.setItem("worklisturl", url);
          }
          else if (this.doctorDetails[0].EmpSpecialisationId == '28') {
            fac = FetchUserFacilityDataList.find((x: any) => x.FacilityID == '2071');
            url = "suit/Dermatologyworklist";
            sessionStorage.setItem("worklisturl", url);
          }
          if (fac) {
            sessionStorage.setItem("facility", JSON.stringify(fac));
            sessionStorage.setItem("FacilityID", JSON.stringify(fac.FacilityID));
            sessionStorage.setItem("fromDocCalendar", "true");
            sessionStorage.setItem("fromDocCalendarSSN", pat.SSN);
            //this.router.navigate(['/' + url]);
            this.router.navigate(['/suit/worklist']);
          }
        }
      },
        (err) => {
        })
  }

  openSickLeave() {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal sickLeave_modal'
    };
    const modalRef = this.modalService.openModal(SickleaveComponent, {
      showClose: true,
      showSSN: true
    }, options);
  }

  openApproval() {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(ViewapprovalrequestComponent, {
      showClose: true,
      isDoctorApprovals: true
    }, options);
  }

  PatientPrintCard(item: any) {
    this.suitconfig.FetchRegistrationCard(item.PatientID, this.doctorDetails[0]?.UserId, this.doctorDetails[0]?.FacilityId ?? 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH;
          $("#reviewAndPayment").modal('show');
        }
      },
        (err) => {

        })
  }

  openClinicChangeModal() {
    $('#docWelcomeModal').modal('show');
    if (this.selectedClinic) {
      $('#clinicSearchText').val(this.selectedClinic.OPDClinicDisplayName);
    }
  }

  searchClinic(event: any) {
    if (event.target.value.length > 2) {
      const url = this.us.getApiUrl(PatientDetails.FetchDoctorOPDClinicDisplays,
        {
          Filter: event.target.value,
          HospitalID: this.hospitalId
        });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.clinicsList = response.FetchDoctorOPDClinicDisplaysDataList;
          }
        },
          (err) => {
          })
    } else {
      this.clinicsList = [];
    }
  }

  onClinicSelected(item: any) {
    this.clinicsList = [];
    this.selectedClinic = item;
  }

  saveClinicSelection() {
    if (this.selectedClinic) {
      const url = this.us.getApiUrl(PatientDetails.FetchClinicCountersNew,
        {
          DocID: this.doctorDetails[0].EmpId,
          DoctorOPDClinicDisplayID: this.selectedClinic.DoctorOPDClinicDisplayID,
          WorkStationID: this.wardID,
          HospitalID: this.hospitalId
        });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $('#docWelcomeModal').modal('hide');
            sessionStorage.setItem('selectedClinic', JSON.stringify(this.selectedClinic));
          }
        },
          (_) => {
          });
    }
  }
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
  WeightCreateDate: string
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
  BP: string
  Temperature: string
  DoctorName: string
  LetterID: string
  CompanyID: string
  GradeID: string
  Pulse: string
  SPO2: string
  Respiration: string
  O2FlowRate: string
  MartialStatus: string
  WardID: string
  IsWheelChairPatient: boolean
  AgeF: Number
  IsHighRisk: boolean
  IsPriority: boolean
  IsYearBaby: string
  TariffId: string,
  ConsultationAmount: String,
  LOALimit: String,
  InsuranceCompanyID: number,
  IsResultViewed: number,
  CompanyName: string,
  GradeName: string,
  ISEpisodeclose: string,
  EpisodeRemarks: string,
  EpisodeCloseDate: string,
  Disposition: string
  EpisodeCloseOnlyDate: string
  OrderTypeID: string
  IsOPPackage: string
  HealthID: string
}
interface InPatientDetails {
  TokenNumber: string
  Score: string
  MonitorID: string
  WardID: string
  Ward: string
  Ward2l: string
  BedTypeID: string
  BedType: string
  BedType2l: string
  RoomID: string
  Room: string
  Room2l: string
  BedID: string
  Bed: string
  Bed2l: string
  Shortname: string
  IPID: string
  AdmissionNumber: string
  SSN: string
  PatientID: string
  PatientName: string
  PatientName2l: string
  BedStatus: string
  BedStatusName: string
  AllocatedStatus: string
  Age: string
  Age2l: string
  Gender: string
  GenderID: string
  Gender2L: string
  DOB: string
  AgeValue: string
  AgeUOMID: string
  FullAge: string
  FullAge2l: string
  DoctorName: string
  DoctorName2l: string
  AdmitDate: string
  ConsultantID: string
  BillBedTypeID: string
  Consultant: string
  Consultant2l: string
  PatientType: string
  EpisodeID: string
  PatientStatus: string
  SpecialiseID: string
  Specialisation: string
  Specialisation2l: string
  TransferID: string
  RegCode: string
  SpecialInstruction: string
  BloodGroup: string
  PhoneNo: string
  MobileNo: string
  BillType: string
  TriAge: string
  ClassificationID: string
  IsVIP: string
  AllertCount: string
  treatmentplan: string
  Height: string
  Weight: string
  PayerName: string
  DischargeIntimationDate: string
  DischargeStatusID: string
  BedBlinkHrs: string
  ExptDisChargeDate: string
  LengthOfStay: string
  VitalScore: string
  AdmissionReqDate: string
  TriageLOS: string
  CTASScore: string
  METCALL: string
  TriagePriorityID: string
  TriagePriorityName: string
  TriagePriorityColor: string
  TriagePriorityTime: string
  IsTemporary: string
  SecSpecRequired: string
  Visitdatetime: string
  IsActiveManagement: string
  IsDoctorVisited: string
  IsCCD: string
  IsEDD: string
  IsMDT: string
  IsDCP: string
  IsCCT: string
  DischargeDate: string
  BedStatusSeq: string
  Nationality: string
  ApprovalDays: string
  IsAllergy: string
  IsPregnancy: string
  PregnancyContent: string
  PrecautionIDs: string
  TypeofPrecautionID: string
  TypeofPrecaution: string
  DeptCommStatusCnt: string
  PatientPendingCountW: string
  PatientSchedCountW: string
  AllergyData: string
  BPSystolic: string
  BPDiastolic: string
  Temperature: string
  BP: string
  HealthID: string
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
  IsResult: string;
}

export const PatientDetails = {
  //FetchPatientAppointmentsWorkList: 'FetchPatientAppointmentsWorkList?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&SpecialiseID=${SpecialiseID}&DoctorID=${DoctorID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientAppointmentsWorkList: 'FetchPatientAppointmentsWorkListFF?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&SpecialiseID=${SpecialiseID}&DoctorID=${DoctorID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchDoctorOPDClinicDisplays: 'FetchDoctorOPDClinicDisplays?Filter=${Filter}&HospitalID=${HospitalID}',
  FetchClinicCountersNew: 'FetchClinicCountersNew?DocID=${DocID}&DoctorOPDClinicDisplayID=${DoctorOPDClinicDisplayID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientAppointmentsWorkListCCC: 'FetchPatientAppointmentsWorkListCCC?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&SpecialiseID=${SpecialiseID}&DoctorID=${DoctorID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};