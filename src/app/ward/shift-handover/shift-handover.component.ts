import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
declare var $: any;
declare function openPACS(test: any, hospId: any, patientId: any): any;
import { ConfigService as BedConfig } from '../services/config.service';
import { ConfigService } from 'src/app/services/config.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { ShiftHandOverService } from './shift-handover.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { TemplatesLandingComponent } from 'src/app/templates/templates-landing/templates-landing.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
export const MY_FORMATS = {
  parse: {
    dateInput: 'dd-MMM-yyyy',
  },
  display: {
    dateInput: 'DD-MMM-yyyy',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'dd-MMM-yyyy',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-shift-handover',
  templateUrl: './shift-handover.component.html',
  styleUrls: ['./shift-handover.component.scss'],
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
export class ShiftHandoverComponent implements OnInit {
  facility: any;
  doctorDetails: any;
  hospId: any;
  selectedView: any;

  FetchScoresDataaList: any;
  EpisodeID: any;
  admissionId: any;
  PatientDiagnosisList: any = [];
  PatientViewMoreDiagnosisList: any = [];
  PatientViewMoreSearchDiagnosisList: any = [];
  PatientViewMoreCareList: any = [];
  PatientViewMoreSearchCareList: any = [];
  PatientViewMoreNoteList: any = [];
  PatientViewMoreSearchNoteList: any = [];
  diagnosisCount: any;
  visitDate?: string = new Date().toString();
  toDate = new FormControl(new Date());
  viewMoreDiagnosisForm!: FormGroup;
  langData: any;
  FetchAllSurgeriesDataList: any;
  surgeryCount: any;
  FetchMainProgressNoteDataList: any;
  notesCount: any;
  IsDiagnosisMore: any = false;
  IsNoteMore: any = false;
  PatientsVitalsList: any;
  vitalsCount: any;
  vitalDate: any = "";
  tableVitalsForm!: FormGroup;
  tableVitalsList: any;
  tableVitalsListFiltered: any;
  viewMoreLabForm!: FormGroup;

  isAreaSplineActive: boolean = false;
  isSplineActive: boolean = true;
  isLineActive: boolean = false;
  isColumnActive: boolean = false;
  activeButton: string = 'spline';
  PatientInvestigationsList: any;
  PatientRadiologyList: any;
  PatientProceduresList: any;
  PatientProceduresFilterList: any;
  PatientProceduresFilterViewMoreList: any;
  selectedService: string = "lab";
  btnLab: string = "btn selected";
  btnRad: string = "btn";
  labTestOrders: any = [];
  outsideLabTestOrders: any = [];
  outsideRadTestOrders: any = [];
  btnActive: string = "btn selected";
  btnInactive: string = "btn";
  medStatus: string = "active";
  btnActiveMed: string = "btn btn-select btn-tab";
  btnInActiveMed: string = "btn btn-tab";

  togglebtn: string = 'toggle-arrow collapsed';
  displayLabReports: string = "none";
  displayRadReports: string = "none";
  displayLab: string = "block";
  displayRad: string = "none";
  displayActMed: string = "block";
  displayInActMed: string = "none";
  radOrderDetails: any = [];
  listOfRadorders: any = [];
  medicationsCount: any;
  activeMedicationCount: any;
  inactiveMedicationCount: any;
  investigationsCount: any;
  radiologyCount: any;
  proceduresCount: any;
  patientDetails: any;
  PatientMedicationsList: any;
  patientActiveMedicationList: any;
  patientInActiveMedicationList: any;
  PatientViewMoreMedicationsList: any;
  PatientViewMoreSearchMedicationsList: any;
  PatientViewMoreSearchLabList: any;
  patientIdByHospId: any;
  apiResponse: any;
  selectedReport: any;
  labReportPdfDetails: any;
  listOfLabreports: any = [];
  listOfLaborders: any = [];
  listOfLaborderitems: any = [];
  listOfLaborderitemsfiltered: any = [];
  trustedUrl: any;
  viewMoreProceduresForm!: FormGroup;
  fromDate = new FormControl(new Date());
  viewMoreMedicationsForm!: FormGroup;
  medfromDate = new FormControl(new Date());
  medtoDate = new FormControl(new Date());
  labfromDate = new FormControl(new Date());
  FetchCarePlanDataaList: any;
  careCount: any;

  FetchEFormsDataaList: any;
  eformCount: any;
  PatientViewMoreeFormList: any = [];
  PatientViewMoreSearcheFormList: any = [];
  IseFormMore: any;
  FetchEFormSelectedDataaList: any = [];
  FetchNursingInstructionsDataaList: any = [];
  PatientViewMoreNursingList: any = [];
  PatientViewMoreSearchNursingList: any = [];
  nursingCount: any;
  IsNursingMore: any;
  IsMedicationMore = false;
  IsProcedureMore = false;
  FetchInTakeOutPutDataaList: any = [];
  inOutTakeCount: any;
  PatientViewMoreInTakeOutPutList: any = [];
  PatientViewMoreSearchInTakeOutPutList: any = [];
  IsInTakeOutMore = false;

  FetchDietChartDataaList: any = [];
  FetchBloodRequestDataaList: any = [];
  PatientViewMoreSearchBloodList: any = [];
  PatientViewMoreBloodList: any = [];
  bloodCount: any;
  dietCount: any;
  IsBloodMore = false;
  HandOverformID = 0;
  isdetailShow = false;
  IsHeadNurse: any;
  charAreaSpline!: Highcharts.Chart
  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;
  @ViewChild('chartLineAreaSpline', { static: true }) chartLineAreaSpline!: ElementRef;
  @ViewChild('chartLineSpline', { static: true }) chartLineSpline!: ElementRef;
  @ViewChild('chartLine', { static: true }) chartLine!: ElementRef;
  @ViewChild('chartLine', { static: true }) chartColumn!: ElementRef;
  btnLabCount: string = "btn btn-select btn-tab";
  btnRadCount: string = "btn btn-tab";
  IsCareMore = false;

  displayBlood: string = "block";
  displayDiet: string = "none";
  btnBloodCount: string = "btn btn-select btn-tab";
  btnDietCount: string = "btn btn-tab";

  handoverForm: any;
  endorsedDoctorList: any;
  FetchPatientHandOverformDataaList: any = [];
  IsHome = true;
  patinfo: any;
  url = '';
  FetchPatienClinicalTemplateDetailsNList: any = [];

  constructor(private datePipe: DatePipe, private fb: FormBuilder, private config: BedConfig,
    private router: Router, private con: ConfigService, public datepipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef, private service: ShiftHandOverService, private us: UtilityService, private modalService: GenericModalBuilder, private modalSvc: NgbModal) {
    this.viewMoreDiagnosisForm = this.fb.group({
      fromdate: [''],
      todate: ['']
    });
    this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.langData = this.con.getLangData();
    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }

    this.handoverForm = this.fb.group({
      Remarks: [''],
      EndorsedEmpID: [''],
      ReceivedEmpID: [''],
      EndorsedEmpName: [''],
      ReceivedEmpName: [''],
      EndorsedDate: [new Date()],
      ReceivedDate: [new Date()]
    });
  }

  submitPACSForm(test: any) {
    openPACS(test.TestOrderItemId, this.hospId, this.selectedView.SSN);
    //this.addform.onSubmit(event);
    //window.open("http://172.16.17.96/Launch_Viewer.asp", this.pacsForm);

  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospId = sessionStorage.getItem("hospitalId");
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.admissionId = this.selectedView.IPID;
    this.EpisodeID = this.selectedView.EpisodeID;
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.fetchFallRisk();
    this.FetchPatientFileData();
    this.fetchSSurgeries();
    this.fetchMainProgressNote();
    this.fetchNursingInstructions();
    this.initializetableVitalsForm();
    this.initializeviewMoreProceduresForm();
    this.initializeviewMoreLabForm();
    this.initializeviewMoreMedicationsForm();
    this.fetchCarePlan();
    var d = new Date();
    var vm = new Date();
    vm.setMonth(vm.getMonth() - 1);
    this.tableVitalsForm.patchValue({
      vitalFromDate: vm,
      vitalToDate: d
    });

    this.changeLocation();
    this.fetchEForms();
    this.fetchInTakeOutPut();
    this.fetchBloodRequests();
    this.fetchDietChart();
    this.getreoperative('0');
  }

  initializeviewMoreMedicationsForm() {
    this.viewMoreMedicationsForm = this.fb.group({
      medfromdate: [''],
      medtodate: ['']
    });
  }

  initializetableVitalsForm() {
    this.tableVitalsForm = this.fb.group({
      vitalFromDate: [''],
      vitalToDate: [''],
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

  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  fetchFallRisk() {
    var ToDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
    this.config.fetchFallRisk(this.selectedView.IPID, this.selectedView.AdmitDate, ToDate, this.doctorDetails[0].UserId,
      this.facility.FacilityID, this.hospId).subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchScoresDataaList = results.FetchScoresDataaList;
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  FetchPatientFileData() {
    this.con.fetchPatientFileData(this.EpisodeID, this.admissionId, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.PatientDiagnosisList = this.PatientViewMoreDiagnosisList = this.PatientViewMoreSearchDiagnosisList = response.PatientDiagnosisDataList;
          this.PatientDiagnosisList = this.PatientDiagnosisList.slice(0, 4);
          this.diagnosisCount = response.PatientDiagnosisDataList.length;
          this.PatientInvestigationsList = response.PatientInvestigationsDataList.filter((inv: any) => inv.Isresult == 4);
          this.PatientInvestigationsList = this.PatientInvestigationsList.slice(0, 4);
          this.PatientRadiologyList = response.PatientInvestigationsDataList.filter((inv: any) => inv.Isresult == 7);
          this.PatientRadiologyList = this.PatientRadiologyList.slice(0, 4);
          this.PatientProceduresList = response.PatientProceduresDataList;
          this.PatientProceduresList = response.PatientProceduresDataList.slice(0, 4);
          this.PatientProceduresFilterList = this.PatientProceduresFilterViewMoreList = response.PatientProceduresDataList;
          this.PatientsVitalsList = response.PatientDataVitalsList;
          this.PatientsVitalsList = this.PatientsVitalsList.slice(0, 6);
          this.investigationsCount = response.PatientInvestigationsDataList.filter((inv: any) => inv.Isresult == 4).length;
          this.radiologyCount = response.PatientInvestigationsDataList.filter((inv: any) => inv.Isresult == 7).length
          this.proceduresCount = response.PatientProceduresDataList.length;
          this.vitalsCount = this.PatientsVitalsList.length;
          if (response.PatientDataVitalsList.length > 0) {
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

  GetVitals() {
    $("#modalVitals").modal('show');
    this.GetVitalsData();
  }

  GetVitalsData() {
    var FromDate = this.datepipe.transform(this.tableVitalsForm.value['vitalFromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tableVitalsForm.value['vitalToDate'], "dd-MMM-yyyy")?.toString();

    if (this.selectedView.PatientType == 1) {
      this.con.fetchOutPatientData(this.selectedView.patientID, FromDate, ToDate, this.hospId)
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
      // this.config.fetchInPatientData(this.patientID, FromDate, ToDate, this.hospId)
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
      this.con.fetchIPPatientVitals(this.selectedView.IPID, FromDate, ToDate, this.hospId)
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
        min: null,
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
        min: null,
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
  spline() {
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
        min: null,
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
        min: null,
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
        min: null,
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

  openDiagnosisModal() {
    var d = new Date(this.selectedView.AdmitDate);
    this.viewMoreDiagnosisForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    this.IsDiagnosisMore = true;
    setTimeout(() => {
      $("#viewMoreDiagnosisDataModal").modal('show');
    }, 200);

    this.FetchViewMoreDiagnosisData("default");

  }
  FetchViewMoreDiagnosisData(type: any) {
    if (type == "search") {
      this.PatientViewMoreSearchDiagnosisList = this.PatientViewMoreDiagnosisList.filter((data: any) => Date.parse(data.CreateDate.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.CreateDate.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
    }
    else {
      //this.PatientViewMoreSearchDiagnosisList = this.PatientViewMoreDiagnosisList.filter((data:any) => Date.parse(data.CreateDate) >= Date.parse(this.viewMoreDiagnosisForm.get('fromdate')?.value) && Date.parse(data.CreateDate) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
    }
  }

  fetchSSurgeries() {
    this.config.fetchSSurgeries(this.selectedView.IPID, this.hospId).subscribe(
      (results) => {
        if (results.Code === 200) {
          this.FetchAllSurgeriesDataList = results.FetchAllSurgeriesDataList;
          this.surgeryCount = this.FetchAllSurgeriesDataList?.length;
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  fetchMainProgressNote() {
    var ToDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
    this.config.fetchMainProgressNote(this.selectedView.IPID, this.selectedView.AdmitDate, ToDate, this.doctorDetails[0].UserId,
      this.facility.FacilityID, this.hospId).subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchMainProgressNoteDataList = this.PatientViewMoreNoteList = this.PatientViewMoreSearchNoteList = results.FetchMainProgressNoteDataList;
            this.notesCount = this.FetchMainProgressNoteDataList.length;

            this.FetchMainProgressNoteDataList = this.FetchMainProgressNoteDataList.slice(0, 6);
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  openNotesModal() {
    var d = new Date(this.selectedView.AdmitDate);
    this.viewMoreDiagnosisForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    this.IsNoteMore = true;
    setTimeout(() => {
      $("#viewMoreNoteDataModal").modal('show');
    }, 200);

    this.FetchViewMoreNotesData("default");
  }
  filterProgressNotes(type: string) {
    if (type === 'all') {
      this.PatientViewMoreSearchNoteList = this.PatientViewMoreNoteList;
    }
    else if (type === 'doctor') {
      this.PatientViewMoreSearchNoteList = this.PatientViewMoreNoteList.filter((x: any) => x.NoteTypeID === '3');
    }
    else if (type === 'nurse') {
      this.PatientViewMoreSearchNoteList = this.PatientViewMoreNoteList.filter((x: any) => x.NoteTypeID === '1');
    }
  }

  FetchViewMoreNotesData(type: any) {
    if (type == "search") {
      this.PatientViewMoreSearchNoteList = this.PatientViewMoreNoteList.filter((data: any) => Date.parse(data.NoteDate.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.NoteDate.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
    }
    else {
      //this.PatientViewMoreSearchDiagnosisList = this.PatientViewMoreDiagnosisList.filter((data:any) => Date.parse(data.CreateDate) >= Date.parse(this.viewMoreDiagnosisForm.get('fromdate')?.value) && Date.parse(data.CreateDate) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
    }
  }

  fetchNursingInstructions() {
    this.config.fetchNursingInstructions(this.selectedView.PatientID, this.selectedView.IPID, this.hospId).subscribe(
      (results) => {
        if (results.Code === 200) {
          this.FetchNursingInstructionsDataaList = this.PatientViewMoreNursingList = this.PatientViewMoreSearchNursingList = results.FetchNursingInstructionsDataaList;
          this.nursingCount = results.FetchNursingInstructionsDataaList.length;
          this.FetchNursingInstructionsDataaList = this.FetchNursingInstructionsDataaList.slice(0, 4);
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  FetchVitalParams() {
    this.GetVitalsData();
  }

  generateDateRange(start: Date, end: Date): any {
    const datesArray = [];
    const currentDate = this.getDateWithoutTime(new Date(start));
    const todayDate = this.getDateWithoutTime(new Date());

    while (currentDate <= end) {
      let value = 1;
      if (currentDate < todayDate) {
        value = 1;
      }
      else if (currentDate.toISOString().split('T')[0] === todayDate.toISOString().split('T')[0]) {
        value = 2;
      }
      else if (currentDate > todayDate) {
        value = 3;
      }
      datesArray.push({ date: this.datepipe.transform(currentDate, "dd-MMM-yyyy"), value: value });
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
    this.con.fetchPatientMedication(this.patientDetails.PatientType == '2' ? '2' : '1', this.admissionId, this.patientDetails.PatientID, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          var startDate = moment(new Date().setMonth(new Date().getMonth() - 3)).format('DD-MMM-YYYY');
          var endDate = moment(new Date()).format('DD-MMM-YYYY');

          response.PatientOrderedOrPrescribedDrugsList.forEach((element: any, index: any) => {
            const start = new Date(element.StartFrom);
            const end = new Date(element.EndDateTime);
            element.Class = "row card_item_div mx-0 w-100 align-items-center maxim";
            element.DatesArray = this.generateDateRange(start, end);
          });

          this.PatientMedicationsList = this.PatientViewMoreMedicationsList = this.PatientViewMoreSearchMedicationsList = response.PatientOrderedOrPrescribedDrugsList;
          this.patientActiveMedicationList = response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString()));
          this.patientActiveMedicationList = this.patientActiveMedicationList.slice(0, 4);
          this.patientInActiveMedicationList = response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.StartFrom) > Date.parse(startDate.toString()) && Date.parse(data.EndDateTime) < Date.parse(endDate));
          this.patientInActiveMedicationList = this.patientInActiveMedicationList.slice(0, 4);

          this.medicationsCount = response.PatientOrderedOrPrescribedDrugsList.length;


          this.activeMedicationCount = response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString())).length;
          this.inactiveMedicationCount = response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.StartFrom) > Date.parse(startDate.toString()) && Date.parse(data.EndDateTime) < Date.parse(endDate)).length;


        }
      },
        (err) => {

        })
  }

  changeLocation() {
    this.con.fetchPatientIDByHospId(this.patientDetails.RegCode, this.hospId).subscribe((response: any) => {
      if (response.PatientId != "") {
        this.patientIdByHospId = response.PatientId;
      }
    },
      (err) => { })
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

  getLabTestOrders() {
    let reqPayload = {
      "RegCode": this.patientDetails.RegCode,
      "HospitalId": this.hospId,
      "min": 1,
      "max": 200
    }
    this.con.getLabTestOrders(reqPayload).subscribe((response) => {
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
      "PatientID": this.patientDetails.PatientId,
      "HospitalID": this.hospId,
    }
    this.con.getOutsideLabTestOrders(this.patientDetails.PatientId, 0).subscribe((response) => {
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

  loadLabRadRecords(type: any) {
    if (type == "lab") {
      this.selectedService = "lab";
      this.btnLab = "btn selected";
      this.btnRad = "btn";
      this.displayLabReports = "block";
      this.displayRadReports = "none";
      this.getLabTestOrders();
      this.getOutsideLabTestOrders();
      this.FetchPatientLabTestOrders();
    }
    else if (type == "rad") {
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
    var d = new Date(this.selectedView.AdmitDate);
    this.IsProcedureMore = true;
    this.viewMoreProceduresForm.patchValue({
      procfromdate: d,
      proctodate: this.toDate.value
    })
    setTimeout(() => {
      $("#viewMoreProceduresDataModal").modal('show');
    }, 200);

    this.FetchViewMoreProceduressData();
  }
  FetchViewMoreProceduressData() {
    this.PatientProceduresFilterViewMoreList = this.PatientProceduresFilterList.filter((data: any) => Date.parse(data.CreateDate.split(' ')[0]) >= Date.parse(this.viewMoreProceduresForm.value['procfromdate']) && Date.parse(data.CreateDate.split(' ')[0]) <= Date.parse(this.viewMoreProceduresForm.value['proctodate']));
  }
  FetchViewMoreLabRadData() {
    if (this.selectedService == "lab") {
      this.labTestOrders = this.labTestOrders.filter((data: any) => Date.parse(data.OrderDate) >= Date.parse(this.viewMoreLabForm.value['labfromdate']) && Date.parse(data.OrderDate) <= Date.parse(this.viewMoreLabForm.value['labtodate']));
      this.outsideLabTestOrders = this.outsideLabTestOrders.filter((data: any) => Date.parse(data.TestDate) >= Date.parse(this.viewMoreLabForm.value['labfromdate']) && Date.parse(data.TestDate) <= Date.parse(this.viewMoreLabForm.value['labtodate']));
      this.listOfLaborders = this.listOfLaborders.filter((data: any) => Date.parse(data.PrecribedDate) >= Date.parse(this.viewMoreLabForm.value['labfromdate']) && Date.parse(data.PrecribedDate) <= Date.parse(this.viewMoreLabForm.value['labtodate']));
    }
    else if (this.selectedService == "rad") {
      this.radOrderDetails = this.radOrderDetails.filter((data: any) => Date.parse(data.TestDate) >= Date.parse(this.viewMoreLabForm.value['labfromdate']) && Date.parse(data.TestDate) <= Date.parse(this.viewMoreLabForm.value['labtodate']));
      this.outsideRadTestOrders = this.outsideRadTestOrders.filter((data: any) => Date.parse(data.TestDate) >= Date.parse(this.viewMoreLabForm.value['labfromdate']) && Date.parse(data.TestDate) <= Date.parse(this.viewMoreLabForm.value['labtodate']));
      this.listOfRadorders = this.listOfRadorders.filter((data: any) => Date.parse(data.PrecribedDate) >= Date.parse(this.viewMoreLabForm.value['labfromdate']) && Date.parse(data.PrecribedDate) <= Date.parse(this.viewMoreLabForm.value['labtodate']));
    }
  }

  FetchPatientLabTestOrders() {
    this.con.fetchPatientLabTestOrders(this.patientDetails.PatientId, '1', '10', '4', this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.listOfLaborders = response.LabOrdersDataList;
        this.listOfLaborderitems = response.LabOrderItemsDataList;
      }
    },
      (err) => {

      })
  }

  getRadOrderDetails() {
    let reqPayload = {
      "RegCode": this.patientDetails.RegCode,
      "HospitalId": this.hospId
    }
    this.con.getTestOrderDetails(reqPayload).subscribe((response) => {
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
      "PatientID": this.patientDetails.PatientId,
      "HospitalId": this.hospId
    }
    this.con.getOutsideLabTestOrders(this.patientDetails.PatientId, 1).subscribe((response) => {
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

  showToastrModal() {
    $("#saveMessage").modal('show');
  }
  closeToastr() {
    $("#saveMessage").modal('hide');
  }

  FetchPatientRadTestOrders() {
    this.con.fetchPatientLabTestOrders(this.patientDetails.PatientId, '1', '10', '7', this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.listOfRadorders = response.LabOrdersDataList;
        this.listOfLaborderitems = response.LabOrderItemsDataList;
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
    this.con.getLabReportResults().subscribe((response) => {
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
    this.con.getLabReportPdf(reqPayload).subscribe((response) => {
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

  GetTestOrderItems(prescriptionId: any) {
    this.listOfLaborderitemsfiltered = this.listOfLaborderitems.filter((item: any) => item.PrescriptionID === prescriptionId);

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

  openMedicationsModal() {

    var md = new Date(this.selectedView.AdmitDate);
    this.IsMedicationMore = true;
    this.viewMoreMedicationsForm.patchValue({
      medfromdate: md,
      medtodate: this.toDate.value
    })
    this.changeMedicationStatus("active");
    setTimeout(() => {
      $("#viewMoreMedicationsDataModal").modal('show');
    }, 200);

    this.FetchViewMoreMedicationsData("default");
  }
  maximizeSelectedDrugItems(med: any) {
    const index = this.PatientViewMoreSearchMedicationsList.findIndex((x: any) => x?.ItemID === med.ItemID);
    if (index > -1) {
      this.PatientViewMoreSearchMedicationsList[index].ClassSelected = !this.PatientViewMoreSearchMedicationsList[index].ClassSelected;
      if (this.PatientViewMoreSearchMedicationsList[index].ClassSelected) {
        this.PatientViewMoreSearchMedicationsList[index].Class = "row card_item_div mx-0 w-100 align-items-start maxim";
      } else {
        this.PatientViewMoreSearchMedicationsList[index].Class = "row card_item_div mx-0 w-100 align-items-start maxim";
      }
    }

  }

  // isdetailShows() {
  //   this.isdetailShow = true;
  // }
  // isdetailHide() {
  //   this.isdetailShow = false;
  // }


  FetchViewMoreMedicationsData(type: any) {

    if (type == "search") {

      this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data: any) => Date.parse(data.StartFrom.split(' ')[0]) >= Date.parse(this.viewMoreMedicationsForm.value['medfromdate']) && Date.parse(data.StartFrom.split(' ')[0]) <= Date.parse(this.viewMoreMedicationsForm.value['medtodate']));
      var startDate = moment(new Date().setMonth(new Date().getMonth() - 3)).format('DD-MMM-YYYY');
      var endDate = moment(new Date()).format('DD-MMM-YYYY');
      if (this.medStatus == "active") {
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList.filter((data: any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString()));
      }
      else {
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList.filter((data: any) => Date.parse(data.StartFrom) > Date.parse(startDate.toString()) && Date.parse(data.EndDateTime) < Date.parse(endDate));
      }
    }
    else {
      //this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data:any) => Date.parse(data.StartFrom) >= Date.parse(this.viewMoreMedicationsForm.get('medfromdate')?.value) && Date.parse(data.StartFrom) <= Date.parse(this.viewMoreMedicationsForm.value['medtodate']));
    }

  }

  changeMedicationStatus(type: any) {
    var startDate = moment(new Date().setMonth(new Date().getMonth() - 3)).format('DD-MMM-YYYY');
    var endDate = moment(new Date()).format('DD-MMM-YYYY');
    if (type == "active") {
      this.medStatus = "active";
      this.btnActive = "btn selected";
      this.btnInactive = "btn";
      if (this.PatientViewMoreMedicationsList) {
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data: any) => Date.parse(data.StartFrom.split(' ')[0]) >= Date.parse(this.viewMoreMedicationsForm.value['medfromdate']) && Date.parse(data.StartFrom.split(' ')[0]) <= Date.parse(this.viewMoreMedicationsForm.value['medtodate']));
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList.filter((data: any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString()));
      }
    }
    else {
      this.medStatus = "inactive";
      this.btnActive = "btn";
      this.btnInactive = "btn selected";
      if (this.PatientViewMoreMedicationsList) {
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data: any) => Date.parse(data.StartFrom.split(' ')[0]) >= Date.parse(this.viewMoreMedicationsForm.value['medfromdate']) && Date.parse(data.StartFrom.split(' ')[0]) <= Date.parse(this.viewMoreMedicationsForm.value['medtodate']));
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList.filter((data: any) => Date.parse(data.StartFrom) > Date.parse(startDate.toString()) && Date.parse(data.EndDateTime) < Date.parse(endDate));
      }
    }
  }

  fetchCarePlan() {
    this.config.fetchCarePlan(this.selectedView.IPID, this.hospId).subscribe(
      (results) => {
        if (results.Code === 200) {
          this.FetchCarePlanDataaList = this.PatientViewMoreCareList = this.PatientViewMoreSearchCareList = results.FetchCarePlanDataaList;
          this.careCount = results.FetchCarePlanDataaList.length;
          this.FetchCarePlanDataaList = this.FetchCarePlanDataaList.slice(0, 4);
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  openCareModal() {

    var d = new Date(this.selectedView.AdmitDate);
    this.viewMoreDiagnosisForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    this.IsCareMore = true;
    setTimeout(() => {
      $("#viewMoreCareDataModal").modal('show');
    }, 200);

    this.FetchViewMoreCareData();

  }
  FetchViewMoreCareData() {
    this.PatientViewMoreSearchCareList = this.PatientViewMoreCareList.filter((data: any) => Date.parse(data.CreateDate.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.CreateDate.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
  }

  fetchEForms() {
    this.config.fetchEForms(this.selectedView.IPID, this.hospId).subscribe(
      (results) => {
        if (results.Code === 200) {
          this.FetchEFormsDataaList = this.PatientViewMoreeFormList = this.PatientViewMoreSearcheFormList = results.FetchEFormsDataaList;
          this.eformCount = results.FetchEFormsDataaList.length;
          this.FetchEFormsDataaList = this.FetchEFormsDataaList.slice(0, 4);
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  openeFormModal() {

    var d = new Date(this.selectedView.AdmitDate);
    this.viewMoreDiagnosisForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    this.IseFormMore = true;
    setTimeout(() => {
      $("#viewMoreeFormDataModal").modal('show');
    }, 200);

  }
  FetchViewMoreeFormData() {
    this.PatientViewMoreSearcheFormList = this.PatientViewMoreeFormList.filter((data: any) => Date.parse(data.CreateDate.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.CreateDate.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
  }

  getSelectedEForm(item: any) {
    this.config.fetchEFormSelected(this.selectedView.IPID, item.ScreenDesignId, item.PatientTemplateid, this.hospId).subscribe(
      (results) => {
        if (results.Code === 200) {
          this.FetchEFormSelectedDataaList = results.FetchEFormSelectedDataaList;
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  openNursingModal() {

    var d = new Date(this.selectedView.AdmitDate);
    this.viewMoreDiagnosisForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    this.IsNursingMore = true;
    setTimeout(() => {
      $("#viewMoreNursingDataModal").modal('show');
    }, 200);

    this.FetchViewMoreNursingData();
  }

  FetchViewMoreNursingData() {
    this.PatientViewMoreSearchNursingList = this.PatientViewMoreNursingList.filter((data: any) => Date.parse(data.ActualDateF.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.ActualDateF.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
  }

  fetchInTakeOutPut() {
    this.config.fetchInTakeOutPut(this.selectedView.IPID, this.hospId).subscribe(
      (results) => {
        if (results.Code === 200) {
          this.FetchInTakeOutPutDataaList = this.PatientViewMoreInTakeOutPutList = this.PatientViewMoreSearchInTakeOutPutList = results.FetchInTakeOutPutDataaList;
          this.inOutTakeCount = results.FetchInTakeOutPutDataaList.length;
          this.FetchInTakeOutPutDataaList = this.FetchInTakeOutPutDataaList.slice(0, 6);
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  openInTakeOutPutModal() {

    var d = new Date(this.selectedView.AdmitDate);
    this.viewMoreDiagnosisForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    this.IsInTakeOutMore = true;
    setTimeout(() => {
      $("#viewMoreInTakeOutDataModal").modal('show');
    }, 200);

    this.FetchViewMoreInTakeOutPutData();
  }

  FetchViewMoreInTakeOutPutData() {
    this.PatientViewMoreSearchInTakeOutPutList = this.PatientViewMoreInTakeOutPutList.filter((data: any) => Date.parse(data.CreateDate.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.CreateDate.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
  }

  showBlood() {
    this.displayBlood = "block";
    this.displayDiet = "none";
    this.btnBloodCount = "btn btn-select btn-tab";
    this.btnDietCount = "btn btn-tab";
    //$("#showLabRadTestRsults").modal('show');
  }
  showDiet() {
    this.displayBlood = "none";
    this.displayDiet = "block";
    this.btnDietCount = "btn btn-select btn-tab";
    this.btnBloodCount = "btn btn-tab";
    //$("#showLabRadTestRsults").modal('show');
  }

  fetchBloodRequests() {
    this.config.fetchBloodRequests(this.selectedView.IPID, this.hospId).subscribe(
      (results) => {
        if (results.Code === 200) {
          this.FetchBloodRequestDataaList = this.PatientViewMoreSearchBloodList = this.PatientViewMoreBloodList = results.FetchBloodRequestDataaList;
          this.bloodCount = results.FetchBloodRequestDataaList.length;
          this.FetchBloodRequestDataaList = this.FetchBloodRequestDataaList.slice(0, 6);
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  fetchDietChart() {
    this.config.fetchDietChart(this.EpisodeID, this.selectedView.IPID, this.hospId).subscribe(
      (results) => {
        if (results.Code === 200) {
          this.FetchDietChartDataaList = results.FetchDietChartDataaList;
          this.dietCount = results.FetchDietChartDataaList.length;
          this.FetchDietChartDataaList = this.FetchDietChartDataaList.slice(0, 6);
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  openBloodModal() {
    var d = new Date(this.selectedView.AdmitDate);
    this.viewMoreDiagnosisForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    this.IsBloodMore = true;
    setTimeout(() => {
      $("#viewMoreBloodDataModal").modal('show');
    }, 200);

    this.FetchViewMoreBloodData();
  }

  FetchViewMoreBloodData() {
    this.PatientViewMoreSearchBloodList = this.PatientViewMoreBloodList.filter((data: any) => Date.parse(data.RequestDatetime.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.RequestDatetime.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
  }

  savePatientHandOverForm() {
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.save();
      }
      modalRef.close();
    });
  }

  save() {
    let payload = {
      "HandOverformID": this.HandOverformID,
      "WardID": this.selectedView.WardID,
      "PatientID": this.selectedView.PatientID,
      "Admissionid": this.selectedView.IPID,
      "Remarks": this.handoverForm.get('Remarks').value,
      "EndorsedEmpID": this.handoverForm.get('EndorsedEmpID').value,
      "EndorsedDate": this.handoverForm.get('EndorsedDate').value,
      "ReceivedEmpID": this.handoverForm.get('ReceivedEmpID').value,
      "ReceivedDate": this.handoverForm.get('ReceivedDate').value,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID,
      "Hospitalid": this.hospId
    };

    this.config.savePatientHandOverForm(payload).subscribe(response => {
      if (response.Code == 200) {
        $("#saveMsg").modal('show');
      }
    })
  }

  fetchEndorsedDoctor(event: any) {
    if (event.target.value.length >= 3) {
      this.config.fetchEndoscopyDoctor(event.target.value, this.hospId).subscribe(
        (results) => {
          this.endorsedDoctorList = results.FetchRODNursesDataList;
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
    }

  }
  FetchHandoverUser(event: any, Tbl: string) {
    if (event.target.value.length >= 3) {
      this.config.FetchHandoverUser(Tbl, event.target.value, this.doctorDetails[0].UserId,
        this.facility.FacilityID, this.hospId).subscribe(
          (results) => {
            this.endorsedDoctorList = results.FetchHandoverUserDataList;
          },
          (error) => {
            console.error('Error fetching data:', error);
          }
        );
    }

  }

  onEndorsedDoctorItemSelected(item: any) {
    this.handoverForm.get('EndorsedEmpID').setValue(item.ID);
    this.handoverForm.get('EndorsedEmpName').setValue(item.Name);
    this.endorsedDoctorList = [];
  }

  onReceivedDoctorItemSelected(item: any) {
    this.handoverForm.get('ReceivedEmpID').setValue(item.ID);
    this.handoverForm.get('ReceivedEmpName').setValue(item.Name);
    this.endorsedDoctorList = [];
  }

  fetchPatientHandOverform() {
    this.config.fetchPatientHandOverform(this.selectedView.IPID, this.hospId).subscribe(
      (results) => {
        if (results.Code === 200) {
          this.FetchPatientHandOverformDataaList = results.FetchPatientHandOverformDataaList;
          $('#requestModal').modal('show');
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  fetchPatientHandOverformPDF(ID: any) {
    this.config.fetchPatientHandOverformPDF(ID, this.selectedView.IPID, this.hospId).subscribe(
      (results) => {
        if (results.Code === 200) {
          this.fetchPatientHandOverformPDFD(ID, results.FetchPatientHandOverformDataaList[0].Strpath);
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }
  fetchPatientHandOverformPDFD(ID: any, strpath: any) {
    this.config.fetchPatientHandOverformPDFD(ID, this.selectedView.IPID, strpath, this.hospId).subscribe(
      (results) => {
        if (results.Code === 200) {
          this.trustedUrl = results?.FTPPATH
          $("#requestModal").modal('hide');
          this.showModal();
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }
  showModal(): void {
    $("#reviewAndPayment").modal('show');
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

  getreoperative(templateid: any) {
    this.url = this.service.getData(shiftDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: 0, TBL: 1, HospitalID: this.hospId });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
          }
        }
      },
        (err) => {
        })
  }

  viewEformTemplate(templ: any) {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(TemplatesLandingComponent, {
      data: templ,
      readonly: true
    }, options);
  }

}

export const shiftDetails = {
  FetchPatienClinicalTemplateDetailsOT: 'FetchPatienClinicalTemplateDetailsOT?AdmissionID=${AdmissionID}&ClinicalTemplateID=${ClinicalTemplateID}&PatientTemplatedetailID=${PatientTemplatedetailID}&TBL=${TBL}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};