import { Component, OnInit, ElementRef, QueryList, ViewChildren, ViewChild, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { ConfigService as BedConfig } from '../../ward/services/config.service'

declare var $: any;

declare function openPACS(test: any): any;
import * as Highcharts from 'highcharts';

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
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
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
export class SummaryComponent implements OnInit {
  patientID: any;
  PatientVisitsList: any;
  PatientDiagnosisList: any;
  PatientViewMoreDiagnosisList: any;
  PatientViewMoreSearchDiagnosisList: any;
  PatientInvestigationsList: any;
  PatientRadiologyList: any;
  PatientProceduresList: any;
  PatientsVitalsList: any;
  PatientsAssessmentsList: any;
  PatientMedicationsList: any;
  patientActiveMedicationList: any;
  patientInActiveMedicationList: any;
  PatientViewMoreMedicationsList: any;
  PatientViewMoreSearchMedicationsList: any;
  PatientViewMoreSearchLabList: any;
  diagnosisCount: any;
  assessmentsCount: any;
  medicationsCount: any;
  activeMedicationCount: any;
  inactiveMedicationCount: any;
  investigationsCount: any;
  radiologyCount: any;
  proceduresCount: any;
  vitalsCount: any;
  hospitalId: any;
  admissionId: any;
  uhid: any;
  patientName: any;
  age: any;
  gender: any;
  nationality: any;
  mobileNo: any;
  doctorName: any;
  PatientType: any;
  admitDate: any;
  adtDate: any;
  dischargeDate: any;
  payer: any;
  episodeId: any;
  vitalDate: any;
  fromPage: any;
  patientDetails: any;
  selectedService: string = "lab";
  btnLab: string = "btn selected";
  btnRad: string = "btn";
  btnSuwaidi: string = "btn selected";
  btnNuzha: string = "btn";
  btnActive: string = "btn selected";
  btnInactive: string = "btn";
  medStatus: string = "active";
  btnActiveMed: string = "btn btn-select btn-tab";
  btnInActiveMed: string = "btn btn-tab";
  btnLabCount: string = "btn btn-select btn-tab";
  btnRadCount: string = "btn btn-tab";
  visitsForm: any;
  viewMoreDiagnosisForm!: FormGroup;
  viewMoreProceduresForm!: FormGroup;
  fromDate = new FormControl(new Date());
  toDate = new FormControl(new Date());
  viewMoreMedicationsForm!: FormGroup;
  medfromDate = new FormControl(new Date());
  medtoDate = new FormControl(new Date());
  labfromDate = new FormControl(new Date());
  viewMoreLabForm!: FormGroup;
  labtoDate = new FormControl(new Date());
  visitDate?: string = new Date().toString();
  tableVitalsForm!: FormGroup;
  tableVitalsList: any;
  tableVitalsListFiltered: any;
  labTestOrders: any = [];
  outsideLabTestOrders: any = [];
  outsideRadTestOrders: any = [];
  apiResponse: any;
  selectedReport: any;
  labReportPdfDetails: any;
  listOfLabreports: any = [];
  trustedUrl: any;
  langData: any;
  listOfLaborders: any = [];
  listOfLaborderitems: any = [];
  listOfLaborderitemsfiltered: any = [];
  togglebtn: string = 'toggle-arrow collapsed'; 
  displayLabReports: string = "none";
  displayRadReports: string = "none";
  displayLab: string = "block";
  displayRad: string = "none";
  displayActMed: string = "block";
  displayInActMed: string = "none";
  radOrderDetails: any = [];
  listOfRadorders: any = [];
  selectedView: any;
  isdetailShow = true;
  doctorDetails: any;
  location: any;
  currentdate: any;
  currentWeekdate:any;
  currentWeekDates: any;
  ward: any;
  wardID: any;
  IsSwitch = false;
  activeButton: string = 'spline';
  assementsData: any = [];
  navigateFromCasesheet:any;
  @Input() IsSwitchWard: any = false;
  @Output() selectedWard = new EventEmitter<any>();
  @Output() filteredDataChange = new EventEmitter<any[]>();
  FetchUserFacilityDataList: any;
  currentDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
  isAreaSplineActive: boolean = false;
  isSplineActive: boolean = true;
  isLineActive: boolean = false;
  isColumnActive: boolean = false;
  calendarMedications: any;
  datewiseMedications: any;
  SelectedViewClass: any;
  IsHeadNurse:any;
  IsHome = true;
  charAreaSpline!:Highcharts.Chart
  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;
  @ViewChild('chartLineAreaSpline', { static: true }) chartLineAreaSpline!: ElementRef;
  @ViewChild('chartLineSpline', { static: true }) chartLineSpline!: ElementRef;
  @ViewChild('chartLine', { static: true }) chartLine!: ElementRef;
  @ViewChild('chartLine', { static: true }) chartColumn!: ElementRef;

  constructor(private ngZone: NgZone, private config: ConfigService, private bed_config: BedConfig, private router: Router, public datepipe: DatePipe, private fb: FormBuilder) {
    this.langData = this.config.getLangData();
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    this.selectedView = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
   }
   initializeviewMoreDiagnosisForm() {
    this.viewMoreDiagnosisForm = this.fb.group({
      fromdate: [''],
      todate: ['']
    });
  }
  initializeviewMoreMedicationsForm() {
    this.viewMoreMedicationsForm = this.fb.group({
      medfromdate: [''],
      medtodate: ['']
    });
  }
  initializeviewMoreLabForm() {
    this.viewMoreLabForm = this.fb.group({
      labfromdate: [''],
      labtodate: ['']
    });
  }
  initializeviewMoreProceduresForm() {
    this.viewMoreProceduresForm = this.fb.group({
      procfromdate: [''],
      proctodate: ['']
    });
  }
  ngOnInit(): void {
    this.navigateFromCasesheet = sessionStorage.getItem('navigateFromCasesheet');
    this.hospitalId = sessionStorage.getItem('location');
    this.IsSwitch = this.IsSwitchWard;
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY, H:mm');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
    this.fetchUserFacility();
    this.uhid = this.patientDetails.RegCode;
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    if(sessionStorage.getItem('lang') == "ar") {
    this.patientName = this.patientDetails.FirstName2l + ' ' + this.patientDetails.MiddleName2L + ' ' + this.patientDetails.Familyname2l;
    }
    else {
      this.patientName = this.patientDetails.FirstName + ' ' + this.patientDetails.MiddleName + ' ' + this.patientDetails.Familyname;
    }
    this.age = this.patientDetails.Age + ' ' + this.patientDetails.AgeUoM;
    this.gender = this.patientDetails.Gender;
    this.nationality = this.patientDetails.Nationality;
    this.mobileNo = this.patientDetails.MobileNo;
    
    this.payer = this.patientDetails.InsuranceName;
    //this.FetchPatientVisits();
    this.visitsForm = this.fb.group({      
      visitId: [0]
    });
    this.initializeviewMoreDiagnosisForm();
    this.initializeviewMoreMedicationsForm();
    this.initializeviewMoreLabForm();
    this.initializetableVitalsForm();
    this.initializeviewMoreProceduresForm();
    this.FetchPatientVisits(); 
    
    if (this.selectedView.PatientType == "2") {
      if (this.selectedView.Bed.includes('ISO'))
        this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
      else
        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }
    
    var d = new Date();
    var vm = new Date();
    vm.setMonth(vm.getMonth() - 1);
    this.tableVitalsForm.patchValue({
      vitalFromDate: vm,
      vitalToDate: d
    });
    
  }
  
  initializetableVitalsForm() {
    this.tableVitalsForm = this.fb.group({
      vitalFromDate: [''],
      vitalToDate: [''],
    });
  }
  navigatetoBedBoard() {
    if(this.IsHeadNurse== 'true' && !this.IsHome)
    this.router.navigate(['/emergency/beds']);
  else
    this.router.navigate(['/ward']);
  sessionStorage.setItem("FromEMR", "false");
  }
  FetchVitalParams() {
    this.GetVitalsData();
   }
  FetchPatientVisits() {
    var patientid = (this.patientDetails.PatientType == "2"||this.patientDetails.PatientType == "3") ?  this.patientDetails.PatientID : this.patientDetails.PatientId;
    this.config.fetchPatientVisits(patientid, this.hospitalId)
    .subscribe((response: any) => {
      if (response.Code == 200) {
        this.ngZone.run(() => {
          this.PatientVisitsList = response.PatientVisitsDataList;
          this.visitsForm.get('visitId')?.setValue(response.PatientVisitsDataList[0].AdmissionID);
          
          this.episodeId = response.PatientVisitsDataList[0].EpisodeID;

          setTimeout(() => {
            this.visitChange(response.PatientVisitsDataList[0].AdmissionID);
          }, 1000);
          
        });
      } 
    },
      (err) => {

      })
  }
  onVisitsChange(event: any) {
    //this.episodeId = event.target.value;
    this.vitalDate = "";
    this.visitChange(event.target.value);
  }
  visitChange(admissionId: any) {
    var patientdata = this.PatientVisitsList.filter((visit:any) => visit.AdmissionID == admissionId)[0];
    this.visitDate = patientdata.VisitDate;
    this.admissionId = patientdata.AdmissionID;
    // this.uhid = patientdata.RegCode;
    // this.patientName = patientdata.PatientName;
    // this.age = patientdata.Age;
    // this.gender = patientdata.Gender;
    // this.nationality = patientdata.Nationality;
    // this.mobileNo = patientdata.MobileNo;
     this.doctorName = patientdata.DoctorName;
     this.episodeId = patientdata.EpisodeID;
    // this.payer = "";

    this.FetchPatientFileData();
    
    this.PatientType = patientdata.PatientType;
     this.patientID = patientdata.PatientID;
     
     var d = new Date();
    var fromDate = new Date(patientdata.VisitDate!.split(' ' )[0]);
    this.tableVitalsForm.patchValue({
      vitalFromDate: fromDate,
      vitalToDate: d
    });
    
  }
  FetchPatientFileData() {
    this.config.fetchPatientFileData(this.episodeId, this.admissionId, this.hospitalId)
    .subscribe((response: any) => {
      if (response.Code == 200) {
       this.PatientDiagnosisList = this.PatientViewMoreDiagnosisList = this.PatientViewMoreSearchDiagnosisList = response.PatientDiagnosisDataList;
       this.PatientDiagnosisList = this.PatientDiagnosisList.slice(0,4);
       this.PatientInvestigationsList = response.PatientInvestigationsDataList.filter((inv: any) => inv.Isresult == 4);
       this.PatientInvestigationsList = this.PatientInvestigationsList.slice(0,4);
       this.PatientRadiologyList = response.PatientInvestigationsDataList.filter((inv: any) => inv.Isresult == 7);
       this.PatientRadiologyList = this.PatientRadiologyList.slice(0,4);
       this.PatientProceduresList = response.PatientProceduresDataList;
       this.PatientProceduresList = response.PatientProceduresDataList.slice(0,4);
       this.PatientsVitalsList = response.PatientDataVitalsList;
       this.PatientsVitalsList = this.PatientsVitalsList.slice(0,6);
       this.PatientsAssessmentsList = response.PatientAssessmentsDataList;
       this.PatientsAssessmentsList = this.PatientsAssessmentsList.slice(0,4);

       this.diagnosisCount = response.PatientDiagnosisDataList.length;
       this.assessmentsCount = response.PatientAssessmentsDataList.length;
       this.investigationsCount = response.PatientInvestigationsDataList.filter((inv: any) => inv.Isresult == 4).length;
       this.radiologyCount = response.PatientInvestigationsDataList.filter((inv: any) => inv.Isresult == 7).length
       this.proceduresCount = response.PatientProceduresDataList.length;
       this.vitalsCount = this.PatientsVitalsList.length;
       if(response.PatientDataVitalsList.length > 0) {
        this.vitalDate = response.PatientDataVitalsList[0].Datetime.toString();
       }
       this.PatientsVitalsList.forEach((element: any, index: any) => {
        if (element.Vital == "BP -Systolic") {
          this.PatientsVitalsList[index].VitalLow = false;
          this.PatientsVitalsList[index].VitalHigh = false;
          if (element.Value != null && element.Value != "" && parseFloat(element.Value) > parseFloat(element.MAXVALUE)) {
            this.PatientsVitalsList[index].VitalHigh = true;
            this.PatientsVitalsList[index].VitalLow = false;
          }
          else if (element.Value != null && element.Value != "" && parseFloat(element.Value) < parseFloat(element.MINVALUE)) {
            this.PatientsVitalsList[index].VitalLow = true;
            this.PatientsVitalsList[index].VitalHigh = false;
          }
        }
        else if (element.Vital == "BP-Diastolic") {
          this.PatientsVitalsList[index].VitalLow = false;
          this.PatientsVitalsList[index].VitalHigh = false;
          if (element.Value != null && element.Value != "" && parseFloat(element.Value) > parseFloat(element.MAXVALUE)) {
            this.PatientsVitalsList[index].VitalHigh = true;
            this.PatientsVitalsList[index].VitalLow = false;
          }
          else if (element.Value != null && element.Value != "" && parseFloat(element.Value) < parseFloat(element.MINVALUE)) {
            this.PatientsVitalsList[index].VitalLow = true;
            this.PatientsVitalsList[index].VitalHigh = false;
          }
          else {
            this.PatientsVitalsList[index].VitalLow = false;
            this.PatientsVitalsList[index].VitalHigh = false;
          }
        }
        else if (element.Vital == "Temparature") {
          if (element.Value != null && element.Value != "" && parseFloat(element.Value) > parseFloat(element.MAXVALUE)) {
            this.PatientsVitalsList[index].VitalLow = false;
            this.PatientsVitalsList[index].VitalHigh = true;
          }
          else if (element.Value != null && element.Value != "" && parseFloat(element.Value) < parseFloat(element.MINVALUE)) {
            this.PatientsVitalsList[index].VitalLow = true;
            this.PatientsVitalsList[index].VitalHigh = false;
          }
          else {
            this.PatientsVitalsList[index].VitalLow = false;
            this.PatientsVitalsList[index].VitalHigh = false;
          }
        }
  
      else if (element.Vital == "Pulse") {
        if (element.Value != null && element.Value != "" && parseFloat(element.Value) > parseFloat(element.MAXVALUE)) {
          this.PatientsVitalsList[index].VitalLow = false;
          this.PatientsVitalsList[index].VitalHigh = true;
        }
        else if (element.Value != null && element.Value != "" && parseFloat(element.Value) < parseFloat(element.MINVALUE)) {
          this.PatientsVitalsList[index].VitalLow = true;
          this.PatientsVitalsList[index].VitalHigh = false;
        }
        else {
          this.PatientsVitalsList[index].VitalLow = false;
          this.PatientsVitalsList[index].VitalHigh = false;
        }
      }
  
      else if (element.Vital == "SPO2") {
        if (element.Value != null && element.Value != "" && parseFloat(element.Value) > parseFloat(element.MAXVALUE)) {
          this.PatientsVitalsList[index].VitalLow = false;
          this.PatientsVitalsList[index].VitalHigh = true;
        }
        else if (element.Value != null && element.Value != "" && parseFloat(element.Value) < parseFloat(element.MINVALUE)) {
          this.PatientsVitalsList[index].VitalLow = true;
          this.PatientsVitalsList[index].VitalHigh = false;
        }
        else {
          this.PatientsVitalsList[index].VitalLow = false;
          this.PatientsVitalsList[index].VitalHigh = false;
        }
      }
      else if (element.Vital == "Respiration") {
        if (element.Value != null && element.Value != "" && parseFloat(element.Value) > parseFloat(element.MAXVALUE)) {
          this.PatientsVitalsList[index].VitalLow = false;
          this.PatientsVitalsList[index].VitalHigh = true;
        }
        else if (element.Value != null && element.Value != "" && parseFloat(element.Value) < parseFloat(element.MINVALUE)) {
          this.PatientsVitalsList[index].VitalLow = true;
          this.PatientsVitalsList[index].VitalHigh = false;
        }
        else {
          this.PatientsVitalsList[index].VitalLow = false;
          this.PatientsVitalsList[index].VitalHigh = false;
        }
      }
      else if (element.Vital == "O2 Flow Rate") {
        if (element.Value != null && element.Value != "" && parseFloat(element.Value) > parseFloat(element.MAXVALUE)) {
          this.PatientsVitalsList[index].VitalLow = false;
          this.PatientsVitalsList[index].VitalHigh = true;
        }
        else if (element.Value != null && element.Value != "" && parseFloat(element.Value) < parseFloat(element.MINVALUE)) {
          this.PatientsVitalsList[index].VitalLow = true;
          this.PatientsVitalsList[index].VitalHigh = false;
        }
        else {
          this.PatientsVitalsList[index].VitalLow = false;
          this.PatientsVitalsList[index].VitalHigh = false;
        }
      }
  });
       this.FetchPatientMedication();
      } 
    },
      (err) => {

      })
  }
  generateDateRange(start: Date, end: Date): any {
    const datesArray = [];
    const currentDate = this.getDateWithoutTime(new Date(start));
    const todayDate = this.getDateWithoutTime(new Date());

    while (currentDate <= end) {
      let value = 1;
      if(currentDate < todayDate) {
        value = 1;
      } 
      else if(currentDate.toISOString().split('T')[0] === todayDate.toISOString().split('T')[0]) {
        value = 2;
      } 
      else if(currentDate > todayDate) {
        value = 3;
      } 
      datesArray.push({date: this.datepipe.transform(currentDate, "dd-MMM-yyyy"), value :value});
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return datesArray;
  }
  getDateWithoutTime(inputDate: Date): Date {
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth();
    const day = inputDate.getDate();
    return new Date(year, month, day);
  }
  FetchPatientMedication() {
    this.config.fetchPatientMedication(this.patientDetails.PatientType == '2' ? '2' : '1', this.admissionId, this.patientDetails.PatientID, this.hospitalId)
    .subscribe((response: any) => {
      if (response.Code == 200) {
       var startDate = moment(new Date().setMonth(new Date().getMonth() - 3)).format('DD-MMM-YYYY');
       var endDate = moment(new Date()).format('DD-MMM-YYYY');     
       
       response.PatientOrderedOrPrescribedDrugsList.forEach((element: any, index: any) => {
        const start = new Date(element.StartFrom);
        const end = new Date(element.EndDateTime);
        element.Class= "row card_item_div mx-0 g-3 w-100 align-items-center";
        element.DatesArray = this.generateDateRange(start, end);
       });

       this.PatientMedicationsList = this.PatientViewMoreMedicationsList = this.PatientViewMoreSearchMedicationsList = response.PatientOrderedOrPrescribedDrugsList;
       this.patientActiveMedicationList = response.PatientOrderedOrPrescribedDrugsList.filter((data:any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString()));
       this.patientActiveMedicationList = this.patientActiveMedicationList.slice(0,4);
       this.patientInActiveMedicationList = response.PatientOrderedOrPrescribedDrugsList.filter((data:any) => Date.parse(data.StartFrom) > Date.parse(startDate.toString()) && Date.parse(data.EndDateTime) < Date.parse(endDate));
       this.patientInActiveMedicationList = this.patientInActiveMedicationList.slice(0,4);

       this.medicationsCount = response.PatientOrderedOrPrescribedDrugsList.length;
       
       
       this.activeMedicationCount = response.PatientOrderedOrPrescribedDrugsList.filter((data:any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString())).length;
       this.inactiveMedicationCount = response.PatientOrderedOrPrescribedDrugsList.filter((data:any) => Date.parse(data.StartFrom) > Date.parse(startDate.toString()) && Date.parse(data.EndDateTime) < Date.parse(endDate)).length;
       

      } 
    },
      (err) => {

      })
  }
  BackToPatients() {
    this.router.navigate(['/home/appointments']);
  }
  
  openDiagnosisModal() {
    this.FetchViewMoreDiagnosisData("default");
    var d = new Date(this.visitDate!.split(' ')[0]);
    this.viewMoreDiagnosisForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    $("#viewMoreDiagnosisDataModal").modal('show');
  }
  FetchViewMoreDiagnosisData(type: any) {
    
    if(type == "search") {
      this.PatientViewMoreSearchDiagnosisList = this.PatientViewMoreDiagnosisList.filter((data:any) => Date.parse(data.CreateDate.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.CreateDate.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
    }
      else  {
        //this.PatientViewMoreSearchDiagnosisList = this.PatientViewMoreDiagnosisList.filter((data:any) => Date.parse(data.CreateDate) >= Date.parse(this.viewMoreDiagnosisForm.get('fromdate')?.value) && Date.parse(data.CreateDate) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
      }
  }

  openMedicationsModal() {
    // this.FetchViewMoreMedicationsData("default");
    // var md = new Date(this.visitDate!.split(' ')[0]);
    // this.viewMoreMedicationsForm.patchValue({
    //   medfromdate: md,
    //   medtodate: this.toDate.value
    // })
    // this.changeMedicationStatus("active");
    // $("#viewMoreMedicationsDataModal").modal('show');
    // this.FetchViewMoreMedicationsData("default");
    // var md = new Date(this.visitDate!.split(' ')[0]);
    // this.viewMoreMedicationsForm.patchValue({
    //   medfromdate: md,
    //   medtodate: this.toDate.value
    // })
    // this.changeMedicationStatus("active");


    //CALENDAR VIEW FOR MEDICATION HISTORY
    this.currentWeekdate = new Date();
    const currentdate = new Date();
    this.currentWeekDates = this.generateDateRange(new Date(), new Date(currentdate.getFullYear(), currentdate.getMonth(),currentdate.getDate() + 6));
    this.fetchCalendarMedication(moment(new Date()).format("DD-MMM-YYYY"), moment(new Date(currentdate.getFullYear(), currentdate.getMonth(),currentdate.getDate() + 6)).format("DD-MMM-YYYY"));
    $("#calendarview_modal").modal('show');
     
  }
  fetchCalendarMedication(FromDate:any, ToDate:any) {
    this.config.fetchCalendarMedicationList(FromDate, ToDate, this.patientDetails.IPID, this.hospitalId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.calendarMedications = response.FetchCalendarMedicationListDataList;
      } 
    },
      (err) => { })
  }
  fetchDateWiseMedicines(date:any) {
    
    return this.calendarMedications?.filter((data:any) => Date.parse(moment(data.MDate).format('DD-MMM-YYYY')) === Date.parse(date));
  }
  changeToPreviousWeek() {
    const currentdate = new Date(this.currentWeekdate);    
    this.currentWeekDates = this.generateDateRange(new Date(currentdate.getFullYear(), currentdate.getMonth(),currentdate.getDate() - 6), new Date(this.currentWeekdate.getFullYear(), this.currentWeekdate.getMonth(),this.currentWeekdate.getDate()));
    this.fetchCalendarMedication(moment(new Date(currentdate.getFullYear(), currentdate.getMonth(),currentdate.getDate() - 6)).format("DD-MMM-YYYY"), moment(new Date(this.currentWeekdate.getFullYear(), this.currentWeekdate.getMonth(),this.currentWeekdate.getDate())).format("DD-MMM-YYYY"));
    this.currentWeekdate = new Date(currentdate.getFullYear(), currentdate.getMonth(),currentdate.getDate() - 6);
  }
  changeToNextWeek() {
    const currentdate = new Date(this.currentWeekdate);    
    this.currentWeekDates = this.generateDateRange(new Date(this.currentWeekdate.getFullYear(), this.currentWeekdate.getMonth(),this.currentWeekdate.getDate()), new Date(currentdate.getFullYear(), currentdate.getMonth(),currentdate.getDate() + 6));
    this.fetchCalendarMedication(moment(new Date(this.currentWeekdate.getFullYear(), this.currentWeekdate.getMonth(),this.currentWeekdate.getDate())).format("DD-MMM-YYYY"), moment(new Date(currentdate.getFullYear(), currentdate.getMonth(),currentdate.getDate() + 6)).format("DD-MMM-YYYY"));
    this.currentWeekdate = new Date(currentdate.getFullYear(), currentdate.getMonth(),currentdate.getDate() + 6);
  }
  maximizeSelectedDrugItems(med: any) {
    const index = this.PatientViewMoreSearchMedicationsList.findIndex((x: any) => x?.ItemID === med.ItemID);
      if (index > -1) {
      this.PatientViewMoreSearchMedicationsList[index].ClassSelected = !this.PatientViewMoreSearchMedicationsList[index].ClassSelected;
      if (this.PatientViewMoreSearchMedicationsList[index].ClassSelected) {
        this.PatientViewMoreSearchMedicationsList[index].Class = "row card_item_div mx-0 g-3 w-100 align-items-start maxim";
      } else {
        this.PatientViewMoreSearchMedicationsList[index].Class = "row card_item_div mx-0 g-3 w-100 align-items-start";
      }
    }
   
  }
  FetchViewMoreMedicationsData(type: any) {
    
    if(type == "search") {
      
      this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data:any) => Date.parse(data.StartFrom.split(' ')[0]) >= Date.parse(this.viewMoreMedicationsForm.value['medfromdate']) && Date.parse(data.StartFrom.split(' ')[0]) <= Date.parse(this.viewMoreMedicationsForm.value['medtodate']));
      var startDate = moment(new Date().setMonth(new Date().getMonth() - 3)).format('DD-MMM-YYYY');
        var endDate = moment(new Date()).format('DD-MMM-YYYY');
      if(this.medStatus == "active") {        
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList.filter((data:any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString()));
      }
      else {
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList.filter((data:any) => Date.parse(data.StartFrom) > Date.parse(startDate.toString()) && Date.parse(data.EndDateTime) < Date.parse(endDate));
      }
    }
      else  {
        //this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data:any) => Date.parse(data.StartFrom) >= Date.parse(this.viewMoreMedicationsForm.get('medfromdate')?.value) && Date.parse(data.StartFrom) <= Date.parse(this.viewMoreMedicationsForm.value['medtodate']));
      }

  }
  
  changeMedicationStatus(type: any) {
    var startDate = moment(new Date().setMonth(new Date().getMonth() - 3)).format('DD-MMM-YYYY');
    var endDate = moment(new Date()).format('DD-MMM-YYYY'); 
    if(type == "active") {
      this.medStatus = "active";
      this.btnActive = "btn selected";
      this.btnInactive = "btn";
      this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data:any) => Date.parse(data.StartFrom.split(' ')[0]) >= Date.parse(this.viewMoreMedicationsForm.value['medfromdate']) && Date.parse(data.StartFrom.split(' ')[0]) <= Date.parse(this.viewMoreMedicationsForm.value['medtodate']));
      this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList.filter((data:any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString()));
       
    }
    else {
      this.medStatus = "inactive";
      this.btnActive = "btn";
      this.btnInactive = "btn selected";
      this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data:any) => Date.parse(data.StartFrom.split(' ')[0]) >= Date.parse(this.viewMoreMedicationsForm.value['medfromdate']) && Date.parse(data.StartFrom.split(' ')[0]) <= Date.parse(this.viewMoreMedicationsForm.value['medtodate']));
      this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList.filter((data:any) => Date.parse(data.StartFrom) > Date.parse(startDate.toString()) && Date.parse(data.EndDateTime) < Date.parse(endDate));
    }
  }

  loadActiveMedication() {
    this.btnActiveMed = "btn btn-select btn-tab";
    this.btnInActiveMed = "btn btn-tab";
    this.displayActMed = "block";
    this.displayInActMed = "none";
  }
  loadInActiveMedication() {
    this.btnInActiveMed = "btn btn-select btn-tab";
    this.btnActiveMed = "btn btn-tab";
    this.displayActMed = "none";
    this.displayInActMed = "block";
  }

  GetVitals() {
    $("#modalVitals").modal('show');
    this.GetVitalsData();
  }

  GetVitalsData() {
    var FromDate = this.datepipe.transform(this.tableVitalsForm.value['vitalFromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tableVitalsForm.value['vitalToDate'], "dd-MMM-yyyy")?.toString();

    if(this.PatientType == 1) {
      this.config.fetchOutPatientData(this.patientID, FromDate, ToDate, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
         this.tableVitalsList = response.PatientVitalsDataList;
         this.tableVitalsListFiltered = response.PatientVitalsDataList;
        //  this.createChartLine(1);
          this.spline();
        } 
      },
        (err) => {
  
        })
    }
    else {
      // this.config.fetchInPatientData(this.patientID, FromDate, ToDate, this.hospitalId)
      // .subscribe((response: any) => {
      //   if (response.Code == 200) {
      //     this.tableVitalsList = response.PatientVitalsDataList;
      //    //this.createChartLine(2);
      //    this.spline();
      //   } 
      // },
      //   (err) => {
  
      //   })
      var vm = new Date(); vm.setMonth(vm.getMonth() - 12);
      var FromDate = this.datepipe.transform(this.selectedView.AdmitDate, "dd-MMM-yyyy")?.toString();
      var ToDate = this.datepipe.transform(this.tableVitalsForm.value['vitalToDate'], "dd-MMM-yyyy")?.toString();    
        this.config.fetchIPPatientVitals(this.selectedView.IPID, FromDate, ToDate, this.hospitalId)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.tableVitalsList = response.FetchIPPatientVitalsDataaList;
              const distinctThings = response.FetchIPPatientVitalsDataaList.filter(
                (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.CreateDateNew === thing.CreateDateNew) === i);
              console.dir(distinctThings);
              this.tableVitalsListFiltered = distinctThings
              //this.createChartLine(2);
              this.spline();
            }
          },
            (err) => {
  
            })
    }

  }

  filterFunction(vitals: any, visitid: any) {
    return vitals.filter((vital: any) => vital.CreateDateNew == visitid);
  }

  private createChartLine(type: number): void {
    let vitaldata: any = {};

    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];


    this.tableVitalsList.forEach((element: any, index: any) => {

      //if(type == 1) {
        element.VisitDate = element.VisitDate.split('-')[0];
      //}

      if(element.BPSystolic != 0) {
        BPSystolicData.push([element.CreateDateTimeNew, parseFloat(element.BPSystolic)])
        }
        if(element.BPDiastolic != 0) {
        BPDiastolicData.push([element.CreateDateTimeNew, parseFloat(element.BPDiastolic)])
        }
        if(element.O2FlowRate != 0) {
        O2FlowRateData.push([element.CreateDateTimeNew, parseFloat(element.O2FlowRate)])
        }
        if(element.Pulse != 0) {
        PulseData.push([element.CreateDateTimeNew, parseFloat(element.Pulse)])
        }
        if(element.Respiration != 0) {
        RespirationData.push([element.CreateDateTimeNew, parseFloat(element.Respiration)])
        }
        if(element.SPO2 != 0) {
        SPO2Data.push([element.CreateDateTimeNew, parseFloat(element.SPO2)])
        }
        TemparatureData.push([element.CreateDateTimeNew, parseFloat(element.Temparature)])
    });

    vitaldata = [{name : 'BP-Systolic', data : BPSystolicData},
                 {name : 'BP-Diastolic', data: BPDiastolicData},
                 {name: 'O2 Flow Rate', data: O2FlowRateData, visible: false},
                 {name: 'Pulse', data: PulseData, visible: false},
                 {name: 'Respiration', data: RespirationData, visible: false},
                 {name: 'SPO2', data: SPO2Data, visible: false},
                 {name: 'Temparature', data: TemparatureData, visible: false}
                ]; 

    const chart = Highcharts.chart('chart-line', {
      chart: {
        type: 'areaspline',
        zoomType: 'x'
      },
      title: {
        text: 'Vital Graph',
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
     
      yAxis: {
        min: 0,
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category',
        min: 0,
        max: 9
      },
      
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
        shared: true,
        valueDecimals: 1,
        useHTML: true,
        crosshairs: [{
          width: 1,
          color: 'Gray'
      }, {
          width: 1,
          color: 'gray'
      }]
      },
      series: vitaldata,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
    }
    } as any);
  }

  areaSpline(): void {
    this.isAreaSplineActive = true;
    this.isSplineActive = false;
    this.isLineActive = false;
    this.isColumnActive = false;
    this.activeButton = 'areaSpline';
    let vitaldata: any = {};
    let type = 1;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];
    this.tableVitalsList.forEach((element: any, index: any) => {

      //if (type == 1) {
        element.VisitDate = this.selectedView.PatientType == '2' ? element.CreateDateNew : element.VisitDate;
      //}

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.CreateDateTimeNew, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.CreateDateTimeNew, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.CreateDateTimeNew, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.CreateDateTimeNew, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.CreateDateTimeNew, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.CreateDateTimeNew, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.CreateDateTimeNew, parseFloat(element.Temparature)])
    });

    vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
    { name: 'BP-Diastolic', data: BPDiastolicData },
    { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
    { name: 'Pulse', data: PulseData, visible: false },
    { name: 'Respiration', data: RespirationData, visible: false },
    { name: 'SPO2', data: SPO2Data, visible: false },
    { name: 'Temparature', data: TemparatureData, visible: false }
    ];
    this.charAreaSpline = Highcharts.chart(this.chartLineAreaSpline.nativeElement, {
      chart: {
        type: 'areaspline',
        zoomType: 'x'
      },
      title: {
        text: 'Vital Graph',
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        min: 0,
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category',
        min: 0,
        max: 9
      },
      
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
        shared: true,
        valueDecimals: 1,
        useHTML: true,
        crosshairs: [{
          width: 1,
          color: 'Gray'
      }, {
          width: 1,
          color: 'gray'
      }]
      },
      series: vitaldata,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
      }
    } as any);
  }
  spline(){
    this.isAreaSplineActive = false;
    this.isSplineActive = true;
    this.isLineActive = false;
    this.isColumnActive = false;
    this.activeButton = 'spline';
    let vitaldata: any = {};
    let type = 1;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];


    this.tableVitalsList.forEach((element: any, index: any) => {

      //if (type == 1) {
        element.VisitDate = this.selectedView.PatientType == '2' ? element.CreateDateNew : element.VisitDate;
      //}

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.CreateDateTimeNew, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.CreateDateTimeNew, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.CreateDateTimeNew, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.CreateDateTimeNew, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.CreateDateTimeNew, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.CreateDateTimeNew, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.CreateDateTimeNew, parseFloat(element.Temparature)])
    });

    vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
    { name: 'BP-Diastolic', data: BPDiastolicData },
    { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
    { name: 'Pulse', data: PulseData, visible: false },
    { name: 'Respiration', data: RespirationData, visible: false },
    { name: 'SPO2', data: SPO2Data, visible: false },
    { name: 'Temparature', data: TemparatureData, visible: false }
    ];
    this.charAreaSpline = Highcharts.chart(this.chartLineSpline.nativeElement, {
      chart: {
        type: 'spline',
        zoomType: 'x'
      },
      title: {
        text: 'Vital Graph',
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        min: 0,
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category',
        min: 0,
        max: 9
      },
      
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
        shared: true,
        valueDecimals: 1,
        useHTML: true,
        crosshairs: [{
          width: 1,
          color: 'Gray'
      }, {
          width: 1,
          color: 'gray'
      }]
      },
      series: vitaldata,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
      }
    } as any);
  }
  line() {
    this.isAreaSplineActive = false;
    this.isSplineActive = false;
    this.isLineActive = true;
    this.isColumnActive = false;
    this.activeButton = 'line';
    let vitaldata: any = {};
    let type = 1;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];

    this.tableVitalsList.forEach((element: any, index: any) => {
      //if (type == 1) {
        element.VisitDate = this.selectedView.PatientType == '2' ? element.CreateDateNew : element.VisitDate;
      //}

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.CreateDateTimeNew, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.CreateDateTimeNew, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.CreateDateTimeNew, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.CreateDateTimeNew, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.CreateDateTimeNew, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.CreateDateTimeNew, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.CreateDateTimeNew, parseFloat(element.Temparature)])
    });

    vitaldata = [
      { name: 'BP-Systolic', data: BPSystolicData },
      { name: 'BP-Diastolic', data: BPDiastolicData },
      { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
      { name: 'Pulse', data: PulseData, visible: false },
      { name: 'Respiration', data: RespirationData, visible: false },
      { name: 'SPO2', data: SPO2Data, visible: false },
      { name: 'Temparature', data: TemparatureData, visible: false }
    ];

    this.charAreaSpline = Highcharts.chart(this.chartLine.nativeElement, {
      chart: {
        type: 'line',
        zoomType: 'x'
      },
      title: {
        text: 'Vital Graph',
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        min: 0,
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category',
        min: 0,
        max: 9
      },
     
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
        shared: true,
        valueDecimals: 1,
        useHTML: true,
        crosshairs: [{
          width: 1,
          color: 'Gray'
      }, {
          width: 1,
          color: 'gray'
      }]
      },
      series: vitaldata,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
      }
    } as any);
  }
  column() {
    this.isAreaSplineActive = false;
    this.isSplineActive = false;
    this.isLineActive = false;
    this.isColumnActive = true;
    this.activeButton = 'column';
    let vitaldata: any = {};
    let type = 1;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];

    this.tableVitalsList.forEach((element: any, index: any) => {
      //if (type == 1) {
        element.VisitDate = this.selectedView.PatientType == '2' ? element.CreateDateNew : element.VisitDate;
      //}

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.CreateDateTimeNew, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.CreateDateTimeNew, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.CreateDateTimeNew, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.CreateDateTimeNew, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.CreateDateTimeNew, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.CreateDateTimeNew, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.CreateDateTimeNew, parseFloat(element.Temparature)])
    });

    vitaldata = [
      { name: 'BP-Systolic', data: BPSystolicData },
      { name: 'BP-Diastolic', data: BPDiastolicData },
      { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
      { name: 'Pulse', data: PulseData, visible: false },
      { name: 'Respiration', data: RespirationData, visible: false },
      { name: 'SPO2', data: SPO2Data, visible: false },
      { name: 'Temparature', data: TemparatureData, visible: false }
    ];

    this.charAreaSpline = Highcharts.chart(this.chartColumn.nativeElement, {
      chart: {
        type: 'column',
        zoomType: 'x'
      },
      title: {
        text: 'Vital Graph',
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        min: 0,
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category',
        min: 0,
        max: 9
      },
      
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
        shared: true,
        valueDecimals: 1,
        useHTML: true,
        crosshairs: [{
          width: 1,
          color: 'Gray'
      }, {
          width: 1,
          color: 'gray'
      }]
      },
      series: vitaldata,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
      }
    } as any);
  }


  getLabTestOrders() {
    let reqPayload = {
      "RegCode": this.patientDetails.RegCode,
      "HospitalId": this.hospitalId,
      "min": 1,
      "max": 200
    }
    this.config.getLabTestOrders(reqPayload).subscribe((response) => {
      if (response.Status === "Success") {
        this.labTestOrders = response.TestOrderList;
        this.apiResponse = response;
      } else {
        this.apiResponse = response;
      }
    },
      (err) => {

      })
  }
  getOutsideLabTestOrders() {
    let reqPayload = {
      "PatientID": this.patientDetails.PatientID,
      "HospitalID": this.hospitalId,
    }
    this.config.getOutsideLabTestOrders(this.patientDetails.PatientID, 0).subscribe((response) => {
      if (response.Status === "Success") {
        this.outsideLabTestOrders = response.SmartDataList;
        this.apiResponse = response;
      } else {
        this.apiResponse = response;
      }
    },
      (err) => {

      })
  }
  addSelectedReport(dept: any) {
    this.selectedReport = dept;
    this.getLabReportPdf()
  }
  getLabreports() {
    this.config.getLabReportResults().subscribe((response) => {
      if (response.Status === "Success") {
        this.listOfLabreports = response.objLabReportNList;
      }
    },
      (err) => {

      })
  }
  getLabReportPdf() {
    let reqPayload = {
      "RegCode": this.patientDetails.RegCode,
      "HospitalId": sessionStorage.getItem('location'),
      "TestOrderId": this.selectedReport.TestOrderId
    }
    this.config.getLabReportPdf(reqPayload).subscribe((response) => {
      if (response.Status === "Success") {
        this.labReportPdfDetails = response;
        this.trustedUrl = response?.FTPPATH;
        this.showLabReportsModal();
      } else if (response.Status === "Fail") {
        this.labReportPdfDetails = response;
        this.showToastrModal();
      }
    },
      (err) => {

      })
  }
  FetchPatientLabTestOrders() {
    this.config.fetchPatientLabTestOrders(this.patientDetails.PatientID, '1', '10', '4', this.hospitalId).subscribe((response) => {
      if (response.Status === "Success") {
        this.listOfLaborders = response.LabOrdersDataList;
        this.listOfLaborderitems = response.LabOrderItemsDataList;
      }
    },
      (err) => {

      })
  }
  GetTestOrderItems(prescriptionId: any) {
    this.listOfLaborderitemsfiltered = this.listOfLaborderitems.filter((item:any) => item.PrescriptionID === prescriptionId);
    
  }
  showLabReportsModal(): void {
    $("#showLabReportsModal").modal('show');
  }
  openLabModal() {
    // var lab = new Date(this.visitDate!.split(' ')[0]);
    // this.viewMoreLabForm.patchValue({
    //   labfromdate: lab,
    //   labtodate: this.toDate.value
    // })
    // this.loadLabRadRecords("lab");
    // this.getLabTestOrders();
    // this.getOutsideLabTestOrders();
    // this.FetchPatientLabTestOrders();
    // $("#viewMoreLabDataModal").modal('show');
    $("#showLabRadTestRsults").modal('show');
  }
  showLab() {
    this.displayLab = "block";
    this.displayRad = "none";
    this.btnLabCount = "btn btn-select btn-tab";
    this.btnRadCount = "btn btn-tab";
    //$("#showLabRadTestRsults").modal('show');
  }
  showRad() {
    this.displayLab = "none";
    this.displayRad = "block";
    this.btnRadCount = "btn btn-select btn-tab";
    this.btnLabCount = "btn btn-tab";
    //$("#showLabRadTestRsults").modal('show');
  }
  showToastrModal() {
    $("#saveMessage").modal('show');
  }
  closeToastr() {
    $("#saveMessage").modal('hide');
  }

  getRadOrderDetails() {
    let reqPayload = {
      "RegCode": this.patientDetails.RegCode,
      "HospitalId": this.hospitalId
    }
    this.config.getTestOrderDetails(reqPayload).subscribe((response) => {
      // IsLab -> 0 -> Radiology
      if (response.Status === "Success") {
        this.apiResponse = response;
        this.radOrderDetails = response.TestOrderDetailsList.filter((item: any) => item.IsLab === 0);
      } else {
        this.apiResponse = response;
      }
    },
      (err) => {

      })
  }
  getOutsideRadTestOrders() {
    let reqPayload = {
      "PatientID": this.patientDetails.PatientID,
      "HospitalId": this.hospitalId
    }
    this.config.getOutsideLabTestOrders(this.patientDetails.PatientID, 1).subscribe((response) => {
      if (response.Status === "Success") {
        this.outsideRadTestOrders = response.SmartDataList;
        this.apiResponse = response;
      } else {
        this.apiResponse = response;
      }
    },
      (err) => {

      })
  }
  viewReport(dept: any) {
    this.selectedReport = dept;
    if (dept.ReportStrpath != "") {
      this.labReportPdfDetails = dept.ReportStrpath;
      this.trustedUrl = dept.ReportStrpath;
      this.showLabReportsModal();
    } else if (dept.ReportStrpath == "") {
      this.labReportPdfDetails = dept.ReportStrpath;
      this.showToastrModal();
    }
  }
  submitPACSForm(test: any) {
    openPACS(test.TestOrderItemId);
    //this.addform.onSubmit(event);
    //window.open("http://172.16.17.96/Launch_Viewer.asp", this.pacsForm);

  }
  FetchPatientRadTestOrders() {
    this.config.fetchPatientLabTestOrders(this.patientDetails.PatientID, '1', '10', '7', this.hospitalId).subscribe((response) => {
      if (response.Status === "Success") {
        this.listOfRadorders = response.LabOrdersDataList;
        this.listOfLaborderitems = response.LabOrderItemsDataList;
      }
    },
      (err) => {

      })
  }
  
  loadLabRadRecords(type:any) {
    if(type == "lab") {
      this.selectedService = "lab";
      this.btnLab = "btn selected";
      this.btnRad = "btn";  
      this.displayLabReports = "block";
      this.displayRadReports = "none";
      this.getLabTestOrders();
      this.getOutsideLabTestOrders();
      this.FetchPatientLabTestOrders();
    }
    else if(type == "rad") {
      this.selectedService = "rad";
      this.btnLab = "btn";
      this.btnRad = "btn selected";
      this.displayRadReports = "block";
      this.displayLabReports = "none";
      this.getRadOrderDetails();
      this.getOutsideRadTestOrders();
      this.FetchPatientRadTestOrders();
    }
    this.FetchViewMoreLabRadData();
  }
  openProceduresModal() {
    var d = new Date(this.visitDate!.split(' ')[0]);
    this.viewMoreProceduresForm.patchValue({
      procfromdate: d,
      proctodate: this.toDate.value
    })
    $("#viewMoreProceduresDataModal").modal('show');
  }
  FetchViewMoreProceduressData() {
    
  }
  FetchViewMoreLabRadData() {
    if(this.selectedService == "lab") {
    this.labTestOrders = this.labTestOrders.filter((data:any) => Date.parse(data.OrderDate) >= Date.parse(this.viewMoreLabForm.value['labfromdate']) && Date.parse(data.OrderDate) <= Date.parse(this.viewMoreLabForm.value['labtodate']));
    this.outsideLabTestOrders = this.outsideLabTestOrders.filter((data:any) => Date.parse(data.TestDate) >= Date.parse(this.viewMoreLabForm.value['labfromdate']) && Date.parse(data.TestDate) <= Date.parse(this.viewMoreLabForm.value['labtodate']));
    this.listOfLaborders = this.listOfLaborders.filter((data:any) => Date.parse(data.PrecribedDate) >= Date.parse(this.viewMoreLabForm.value['labfromdate']) && Date.parse(data.PrecribedDate) <= Date.parse(this.viewMoreLabForm.value['labtodate']));
    }
    else if(this.selectedService == "rad") {
      this.radOrderDetails = this.radOrderDetails.filter((data:any) => Date.parse(data.TestDate) >= Date.parse(this.viewMoreLabForm.value['labfromdate']) && Date.parse(data.TestDate) <= Date.parse(this.viewMoreLabForm.value['labtodate']));
    this.outsideRadTestOrders = this.outsideRadTestOrders.filter((data:any) => Date.parse(data.TestDate) >= Date.parse(this.viewMoreLabForm.value['labfromdate']) && Date.parse(data.TestDate) <= Date.parse(this.viewMoreLabForm.value['labtodate']));
    this.listOfRadorders = this.listOfRadorders.filter((data:any) => Date.parse(data.PrecribedDate) >= Date.parse(this.viewMoreLabForm.value['labfromdate']) && Date.parse(data.PrecribedDate) <= Date.parse(this.viewMoreLabForm.value['labtodate']));
    }
  }
  isdetailHide() {
    this.isdetailShow = false;
    if(this.isdetailShow === false){
      $('.patient_card').removeClass('maximum')
    }
  }
  isdetailShows() {
    this.isdetailShow = true;
    if(this.isdetailShow = true){
      $('.patient_card').addClass('maximum')
    }
    // else{
    //   $('.patient_card').removeClass('maximum')
    // }
  }
  onLogout() {
    this.config.onLogout();
   }

   fetchUserFacility() {
    this.bed_config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
    .subscribe((response: any) => {
      this.FetchUserFacilityDataList = response.FetchUserWardFacilityDataaList;
    },
    (err:any) => {
      })

  }
  getSSNSearch(key: any) {
    this.filteredDataChange.emit(key.target.value);   
    }
  selectFacility() {
    if (this.FetchUserFacilityDataList) {
      const selectedItem = this.FetchUserFacilityDataList.find((value: any) => value.FacilityID === this.wardID);
      sessionStorage.setItem("facility", JSON.stringify(selectedItem));
      this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
      this.selectedWard.emit();
    }
  }
  GoBackToHome() {
    this.router.navigate(['/login/doctor-home'])
  }
  openAssessments(asmt:any) {    
    this.config.fetchAssessmentSelected(this.patientDetails.EpisodeID, this.admissionId, asmt.CSTemplateID, this.hospitalId).subscribe((response:any) => {
      if (response.Code === 200) {
        this.assementsData = response.FetchAssessmentSelectedDataaList;
        $("#showAssessmentsData").modal('show');
      }
    },
      (err) => {

      })
  }
}

