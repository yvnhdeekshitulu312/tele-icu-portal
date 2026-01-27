import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from '../../ward/services/config.service';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilityService } from 'src/app/shared/utility.service';
import { labresultentry } from 'src/app/suit/lab-resultentry/lab-resultentry.component';
import { patientfolder } from 'src/app/shared/patientfolderml/patientfolderml.component';
import { PatientfolderService } from 'src/app/shared/patientfolder/patientfolder.service';

declare var $: any;
declare function openPACS(test: any, hospId: any, patientId: any): any;

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
  selector: 'app-others-results',
  templateUrl: './others-results.component.html',
  styleUrls: ['./others-results.component.scss'],
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
export class OthersResultsComponent implements OnInit {
  @ViewChild('labTestDiv', { static: false }) labTestDiv!: ElementRef;
  charAreaSpline!: Highcharts.Chart
  @ViewChild('chartLineAreaSpline', { static: true }) chartLineAreaSpline!: ElementRef;
  @ViewChild('chartLineSpline', { static: true }) chartLineSpline!: ElementRef;
  @ViewChild('chartLine', { static: true }) chartLine!: ElementRef;
  @ViewChild('chartLine', { static: true }) chartColumn!: ElementRef;
  @ViewChild('labTest', { static: true }) labTest!: ElementRef;
  @Input()
  fromTeleICUBed: boolean = false;
  @Input()
  tabType: string = 'L';

  selectedView: any;
  HospitalID: any;
  PatientID: any;
  patientDetails: any;
  RegCode: any;
  langData: any;
  data: any;
  dataToFilter: any;
  distinctSpecialisations: any = [];
  visitID: any;
  hospId: any;
  fromDate: any;
  toDate: any;
  IsTab: any = 'V';
  isAreaSplineActive: boolean = false;
  isResultAreaSplineActive: boolean = false
  isSplineActive: boolean = true;
  isResultSplineActive: boolean = true;
  isResultLineActive: boolean = true;
  isResultcolumnActive: boolean = true;
  isLineActive: boolean = false;
  isColumnActive: boolean = false;
  activeButton: string = 'spline';
  activeResultButton: string = 'Spline'
  tableVitalsList: any;
  tablePatientsForm!: FormGroup;
  selectedReport: any;
  labReportPdfDetails: any;
  labReportDocPdfDetails: any;
  trustedUrl: any;
  radiologyPdfDetails: any;
  TestName: any;
  testGraphsData: any;
  showLabTest: boolean = false;
  allResults: string = "btn selected";
  panicResults: string = "btn";
  abnormalResults: string = "btn";
  currentdateN: any;
  currentTimeN: Date = new Date();
  interval: any;
  doctorDetails: any;
  ward: any;
  wardID: any;
  location: any;
  IsHeadNurse: any;
  isdetailShow = false;
  IsSwitch = false;
  IsHome = false;
  SelectedViewClass: any;
  FetchUserFacilityDataList: any;
  IsFromBedsBoard: any;
  IsFromRadiology: any;
  IsFromPhysiotherapy: boolean = false;
  FromCaseSheet: any;
  FromRadiology: any;
  FromIVF: any;
  showAllergydiv: boolean = false;
  navigateFromCasesheet = false;
  testGraphsDataColumns: any = [];
  testGraphsDataValues: any = [];
  facility: any;
  patinfo: any;
  FromPatientsPage: boolean = false;
  @Input() IsSwitchWard: any = false;
  @Input() InputHome: any = true;
  labPanelData: any = [];
  cardiologyContentHTML: any = '';
  errorMsg: any;
  reportName: any = '';

  constructor(private fb: FormBuilder, private config: ConfigService, public datepipe: DatePipe, private router: Router, private bedconfig: BedConfig, private sanitizer: DomSanitizer, private us: UtilityService, private service: PatientfolderService) {
    this.langData = this.config.getLangData();

    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
  }

  startClock(): void {
    this.interval = setInterval(() => {
      this.currentTimeN = new Date();
    }, 1000);
  }

  stopClock(): void {
    clearInterval(this.interval);
  }

  ngOnInit(): void {
    this.IsFromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;
    this.IsFromRadiology = sessionStorage.getItem("FromRadiology") === "true" ? true : false;
    this.IsFromPhysiotherapy = sessionStorage.getItem("FromPhysiotherapy") === "true" ? true : false;
    this.FromCaseSheet = sessionStorage.getItem("FromCaseSheet") === "true" ? true : false;
    this.FromRadiology = sessionStorage.getItem("FromRadiology") === "true" ? true : false;
    this.navigateFromCasesheet = sessionStorage.getItem("navigateFromCasesheet") === "true" ? true : false;
    this.FromIVF = sessionStorage.getItem("FromIVF") === "true" ? true : false;

    if (this.FromIVF) {
      this.navigateFromCasesheet = true;
    }

    if (this.router.url.includes('home/patients')) {
      this.FromPatientsPage = true;
    }

    this.IsSwitch = this.IsSwitchWard;
    //this.IsHome = this.InputHome;
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.location = sessionStorage.getItem("locationName");
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.hospId = sessionStorage.getItem("hospitalId");
    this.startClock();
    this.fetchUserFacility();

    const view = sessionStorage.getItem("selectedView");
    const card = sessionStorage.getItem("selectedCard");
    const ivf = sessionStorage.getItem("ivfprocess")

    this.selectedView = view && view !== '{}' ? JSON.parse(view) : card && card !== '{}' ? JSON.parse(card) : ivf && ivf !== '{}' ? JSON.parse(ivf) : {};

    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');

    this.HospitalID = sessionStorage.getItem("hospitalId");

    if (this.fromTeleICUBed) {
      this.patientDetails = this.selectedView = JSON.parse(sessionStorage.getItem("icubeddetails") || '{}');
      this.hospId = this.patientDetails.HospitalID;
      this.facility = this.patientDetails.WardID;
      this.HospitalID = this.patientDetails.HospitalID;
    }

    this.PatientID = this.selectedView.PatientID;
    this.RegCode = this.patientDetails.RegCode;
    this.initializetablePatientsForm();
    // if (this.patientDetails.PatientType == '2' || this.patientDetails.PatientType == '3') {
    //   this.fetchLabByValue();
    //   this.ActiveTab('L');
    // }
    this.GetVitalsData();
    if (this.selectedView.PatientType == "2") {
      if (this.selectedView.Bed.includes('ISO'))
        this.SelectedViewClass = "mt-1 m-0 fw-bold alert_animate token iso-color-bg-primary-100 py-1 rounded-4";
      else
        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }

    if (this.selectedView.PatientType != 1) {
      this.fromDate = this.toDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
      if (this.tabType === 'R') {
        this.fetchRadOrderResults();
        this.ActiveTab('R');
      } else {
        this.fetchLabOrderResults();
        this.ActiveTab('L');
      }
    }
  }
  initializetablePatientsForm() {
    this.tablePatientsForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });
    var wm = new Date();
    var d = new Date();
    wm.setMonth(wm.getMonth() - 1);
    this.tablePatientsForm.patchValue({
      FromDate: d,
      ToDate: d
    })
  }
  openAllergyPopup() {
    this.showAllergydiv = true;
  }
  GoBackToCaseSheet() {
    sessionStorage.setItem("FromCaseSheet", "false");
    sessionStorage.setItem("FromRadiology", "false");
    if (this.FromCaseSheet)
      this.router.navigate(['/home/doctorcasesheet']);
    else if (this.FromRadiology)
      this.router.navigate(['/suit/radiology-resultentry']);
    else if (this.IsFromPhysiotherapy) {
      this.router.navigate(['/suit/physiotherapy-resultentry']);
    }

  }
  filterTestResults(type: any) {
    if (type == "all") {
      this.allResults = "btn selected"; this.panicResults = this.abnormalResults = "btn";
      this.data = this.dataToFilter;
    }
    else if (type == "panic") {
      this.allResults = this.abnormalResults = "btn"; this.panicResults = "btn selected";
      this.data = this.dataToFilter.filter((r: any) => r.IsPanic == "True");
    }
    else if (type == "abnormal") {
      this.allResults = this.panicResults = "btn"; this.abnormalResults = "btn selected"
      this.data = this.dataToFilter.filter((r: any) => r.IsAbnormal == "True");
    }
  }
  fetchLabOrderResults() {
    this.data = [];
    this.dataToFilter = [];
    this.distinctSpecialisations = [];
    const url = this.us.getApiUrl(patientfolder.FetchLabOrderResultsPF,
      {
        fromDate: this.fromDate,
        ToDate: this.toDate,
        UHID: this.patientDetails.RegCode,
        PatientID: this.PatientID,
        AdmissionID: 0,
        SearchID: 0,
        HospitalID: this.HospitalID
      });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.data = response.FetchLabOrderResultsDataaList.filter((val: any) => val.IsResult == "4");
          this.dataToFilter = response.FetchLabOrderResultsDataaList;
          this.data.forEach((element: any, index: any) => {
            if (Number(element.Status) >= 7 && Number(element.Status) != 13) {
              element.viewRecord = true;
            }
            else {
              element.viewRecord = false;
            }
            if (element.HasDocuments == "1") {
              element.HasDocuments = true;
            } else {
              element.HasDocuments = false;
            }
            if (element.IsPanic == "True") {
              element.RowColor = "background-color:red;padding:0.36rem;";
              element.RowColorW = "color:white";
            }
            else if (element.IsAbnormal == "True") {
              element.RowColor = "background-color:orange;padding:0.36rem;"
              element.RowColorW = "color:white";
            }
            element.SampleStatus = parseInt(element.Status);
          });
          this.distinctSpecialisations = Array.from(new Set(this.data.map((item: any) => item.specialisation)));
        }
      },
        (err) => {

        })
  }
  fetchCardiologyOrderResults() {
    this.data = [];
    this.dataToFilter = [];
    this.config.fetchCardiologyOrderResultsOthers(this.fromDate, this.toDate, this.PatientID, this.HospitalID, '0', '0')
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.data = response.FetchRadOrderResultsDataaList.filter((val: any) => val.IsResult == "7");
          this.dataToFilter = response.FetchLabOrderResultsDataaList;
          this.data.forEach((element: any, index: any) => {
            if (Number(element.Status) >= 4 && Number(element.Status) <= 6) {
              element.viewRecord = true;
            }
            else {
              element.viewRecord = false;
            }
          });
        }
      },
        (err) => {

        })
  }
  fetchNeurologyOrderResults() {
    this.data = [];
    this.dataToFilter = [];
    this.config.fetchNeurologyOrderResultsOthers(this.fromDate, this.toDate, this.PatientID, this.HospitalID, '0', '0')
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.data = response.FetchLabOrderResultsDataaList.filter((val: any) => val.IsResult == "7");
          this.dataToFilter = response.FetchLabOrderResultsDataaList;
          this.data.forEach((element: any, index: any) => {
            if (Number(element.Status) >= 4 && Number(element.Status) <= 6) {
              element.viewRecord = true;
            }
            else {
              element.viewRecord = false;
            }
          });
        }
      },
        (err) => {

        })
  }

  fetchDentalOrderResults() {
    this.data = [];
    this.dataToFilter = [];
    this.config.fetchDentalOrderResults(this.fromDate, this.toDate, this.PatientID, this.HospitalID, '0', '0')
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.data = response.FetchLabOrderResultsDataaList.filter((val: any) => val.IsResult == "7");
          this.dataToFilter = response.FetchLabOrderResultsDataaList;
          this.data.forEach((element: any, index: any) => {
            if (Number(element.Status) >= 4 && Number(element.Status) <= 6) {
              element.viewRecord = true;
            }
            else {
              element.viewRecord = false;
            }
          });
        }
      },
        (err) => {

        })
  }

  fetchRadOrderResults() {
    this.data = [];
    this.dataToFilter = [];
    this.config.fetchRadOrderResultsOthers(this.fromDate, this.toDate, this.PatientID, this.HospitalID, '0', '0')
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.data = response.FetchRadOrderResultsDataaList.filter((val: any) => val.IsResult == "7");
          this.dataToFilter = response.FetchLabOrderResultsDataaList;
          this.data.forEach((element: any, index: any) => {
            if (Number(element.Status) >= 4 && Number(element.Status) <= 6) {
              element.viewRecord = true;
            }
            else {
              element.viewRecord = false;
            }
          });
        }
      },
        (err) => {

        })
  }
  fetchLabTestGraphs(test: any, event: Event) {
    event.stopPropagation();
    this.testGraphsDataColumns = []; this.testGraphsDataValues = [];
    this.config.fetchLabTestGraph(test.TestName, this.PatientID, this.HospitalID)
      .subscribe((response: any) => {
        this.testGraphsData = response;
        Object.keys(this.testGraphsData[0]).forEach((element: any, index: any) => {
          if (element !== 'ResultsDate') {
            this.testGraphsDataColumns.push({
              "TestCompHeader": element
            });
          }
        });
        Object.values(this.testGraphsData[0]).forEach((element: any, index: any) => {
          if (element !== 'ResultsDate') {
            this.testGraphsDataValues.push({
              "TestCompValue": element
            });
          }
        });
        this.createResultsChart();
        if (this.labTestDiv && this.labTestDiv.nativeElement) {
          this.labTestDiv.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
        (err) => {
        })

  }
  loadLabTest() {
    this.showLabTest = true;
  }

  showHideLabTestGraph() {
    this.showLabTest = !this.showLabTest;
  }
  fetchLabByValue(filteredvalue: any = "") {
    if (filteredvalue) {
      let filteredData = this.dataToFilter.filter((value: any) => value.specialisation === filteredvalue);
      this.data = filteredData;
    }
    else {
      this.data = this.dataToFilter;
    }
    this.showLabTest = false;
  }

  receiveData(data: { visit: any, fromdate: any, todate: any, type: string }) {
    if (data.type === '') {
      this.visitID = data.visit;
      this.fromDate = data.fromdate;
      this.toDate = data.todate;
      if (this.IsTab === "L") {
        this.fetchLabOrderResults();
      }
      else if (this.IsTab === "R") {
        this.fetchRadOrderResults();
      }
      else if (this.IsTab === "C") {
        this.fetchCardiologyOrderResults();
      }
      else if (this.IsTab === "N") {
        this.fetchNeurologyOrderResults();
      }
      else if (this.IsTab === "P") {
        //this.fetchNeurologyOrderResults();
        this.data = [];
      }
      else if (this.IsTab === "D") {
        this.data = [];
        this.fetchDentalOrderResults();
      }
    }
    else {
      this.filterTestResults(data.type);
    }
  }

  ActiveTab(tab: any) {
    this.IsTab = tab;
  }

  // GetVitalsData() {
  //   var vm = new Date(); vm.setMonth(vm.getMonth() - 12);
  //   var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
  //   var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();


  //     this.config.fetchInPatientData(this.selectedView.PatientID, FromDate, ToDate, this.hospId)
  //       .subscribe((response: any) => {
  //         if (response.Code == 200) {
  //           this.tableVitalsList = response.PatientVitalsDataList;
  //           this.selectedView.BP = response.PatientVitalsDataList[0].BPSystolic + "/" + response.PatientVitalsDataList[0].BPDiastolic;
  //           this.selectedView.Temperature = response.PatientVitalsDataList[0].Temparature;
  //           this.createChartLine(2);
  //         }
  //       },
  //         (err) => {

  //         })

  // }
  GetVitalsData() {
    var vm = new Date(); vm.setMonth(vm.getMonth() - 12);
    var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();

    if (this.selectedView.PatientType == '1') {
      this.config.fetchOutPatientData(this.selectedView.PatientID, FromDate, ToDate, this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.tableVitalsList = response.PatientVitalsDataList;

            this.selectedView.BP = response.PatientVitalsDataList[0].BPSystolic + "/" + response.PatientVitalsDataList[0].BPDiastolic;
            this.selectedView.Temperature = response.PatientVitalsDataList[0].Temparature;

            this.createChartLine(1);
          }
        },
          (err) => {

          })
    } else if (this.selectedView.PatientType == '3') {
      this.config.fetchOutPatientData(this.patientDetails.PatientID, FromDate, ToDate, this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.tableVitalsList = response.PatientVitalsDataList;

            this.selectedView.BP = response.PatientVitalsDataList[0].BPSystolic + "/" + response.PatientVitalsDataList[0].BPDiastolic;
            this.selectedView.Temperature = response.PatientVitalsDataList[0].Temparature;

            this.createChartLine(1);
          }
        },
          (err) => {

          })
    }
    else {
      var vm = new Date(); vm.setMonth(vm.getMonth() - 3);
      var FromDate = this.datepipe.transform(vm, "dd-MMM-yyyy")?.toString();
      var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
      this.config.fetchPatientVitalsByIPID(this.selectedView.IPID, FromDate, ToDate, this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.PatientVitalsDataList.length > 0) {
            this.tableVitalsList = response.PatientVitalsDataList;
            this.selectedView.BP = response.PatientVitalsDataList[0].BPSystolic + "/" + response.PatientVitalsDataList[0].BPDiastolic;
            this.selectedView.Temperature = response.PatientVitalsDataList[0].Temparature;
            this.createChartLine(2);
          } else {
            this.tableVitalsList = [];
          }
        },
          (err) => {

          })
    }
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

      if (type == 1) {
        element.VisitDate = element.VisitDate.split('-')[0];
      }

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      }
      if (element.Temperature != 0) {
        TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
      }
    });

    vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
    { name: 'BP-Diastolic', data: BPDiastolicData },
    { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
    { name: 'Pulse', data: PulseData, visible: false },
    { name: 'Respiration', data: RespirationData, visible: false },
    { name: 'SPO2', data: SPO2Data, visible: false },
    { name: 'Temparature', data: TemparatureData, visible: false }
    ];

    const chart = Highcharts.chart('chart-results', {
      chart: {
        type: 'spline',
        zoomType: 'x'
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category'
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
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

    const chartviewmore = Highcharts.chart('chart-line-viewmore', {
      chart: {
        type: 'areaspline',
        zoomType: 'x'
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category'
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
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
  labTesetGraph() {
    $("#modalLabTestGraph").modal('show');
  }
  private createResultsChart(): void {
    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseFloat(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'spline',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'spline',
        zoomType: 'x',
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        },
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        useHTML: true,
        shared: true,
        formatter: function (this: Highcharts.TooltipFormatterContextObject): string {
          let tooltipContent = '<table>';

          tooltipContent += '<tr><td>Date:</td><td>' + this.x + '</td></tr>';

          this.points?.forEach(point => {
            tooltipContent += '<tr><td>' + point.series.name + ':</td><td>' + point.y + '</td></tr>';
          });

          tooltipContent += '</table>';
          return tooltipContent;
        }
      },
      series: series,
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
        trackBorderRadius: 7,
      },
    } as any);
  }

  /**
  * @previews Paitents Details function section
  */

  resultSpline(): void {
    this.isResultAreaSplineActive = false;
    this.isResultSplineActive = true;
    this.isResultLineActive = false;
    this.isResultcolumnActive = false;
    this.activeResultButton = 'Spline';

    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseFloat(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'spline',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'spline',
        zoomType: 'x',
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        },
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        headerFormat: '<div>Date: {point.key}</div>',
        pointFormat: '<div>{series.name}: {point.y}</div>',
        shared: true,
        useHTML: true,
      },
      series: series,
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
        trackBorderRadius: 7,
      },
    } as any);
  }
  resultAreaSpline(): void {
    this.isResultAreaSplineActive = true;
    this.isResultSplineActive = false;
    this.isResultLineActive = false;
    this.isResultcolumnActive = false;
    this.activeResultButton = 'areaSpline';
    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseFloat(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'areaspline',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'areaspline',
        zoomType: 'x',
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        },
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        headerFormat: '<div>Date: {point.key}</div>',
        pointFormat: '<div>{series.name}: {point.y}</div>',
        shared: true,
        useHTML: true,
      },
      series: series,
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
        trackBorderRadius: 7,
      },
    } as any);
  }
  resultLine(): void {
    this.isResultAreaSplineActive = false;
    this.isResultSplineActive = false;
    this.isResultLineActive = true;
    this.isResultcolumnActive = false;
    this.activeResultButton = 'line';
    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseFloat(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'line',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'line',
        zoomType: 'x',
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        },
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        headerFormat: '<div>Date: {point.key}</div>',
        pointFormat: '<div>{series.name}: {point.y}</div>',
        shared: true,
        useHTML: true,
      },
      series: series,
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
        trackBorderRadius: 7,
      },
    } as any);
  }
  resultColumn(): void {
    this.isResultAreaSplineActive = true;
    this.isResultSplineActive = false;
    this.isResultLineActive = false;
    this.isResultcolumnActive = true;
    this.activeResultButton = 'column';
    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseFloat(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'column',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'column',
        zoomType: 'x',
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        },
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        headerFormat: '<div>Date: {point.key}</div>',
        pointFormat: '<div>{series.name}: {point.y}</div>',
        shared: true,
        useHTML: true,
      },
      series: series,
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
        trackBorderRadius: 7,
      },
    } as any);
  }
  areaSpline(): void {
    this.isAreaSplineActive = true;
    this.isResultSplineActive = false;
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

      if (type == 1) {
        element.VisitDate = element.VisitDate.split('-')[0];
      }

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
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
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category'
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
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

  filterFunction(vitals: any, visitid: any) {
    return vitals.filter((buttom: any) => buttom.VisitID == visitid);
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

      if (type == 1) {
        element.VisitDate = element.VisitDate.split('-')[0];
      }

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
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
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category'
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
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
      if (type == 1) {
        element.VisitDate = element.VisitDate.split('-')[0];
      }

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
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
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category'
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
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
      if (type == 1) {
        element.VisitDate = element.VisitDate.split('-')[0];
      }

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
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
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category'
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
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

  openLabPanelResults(dept: any) {
    this.selectedReport = dept;
    this.Savelabresultviews(dept.IsResult);
    this.getLabPanelResults();
  }

  private calculateSegments(item: any) {
    const refRange = item.F1ReferenceRange;
    if (!refRange) {
      return [];
    } else {
      const [start, end] = refRange.split('-').map(Number);
      const value = Number(item.F1Result.split(' ')[0]);
      let min = 0;
      let max = end;

      if (end < value) {
        max = value;
      }
      const ranges = [];
      if (start === 0) {
        if (end >= value) {
          ranges.push({ range: `${start}-${end}`, color: '#65a765' });
        } else {
          ranges.push({ range: `${start}-${end}`, color: '#65a765' });
          ranges.push({ range: `${end}-${value}`, color: '#ef5151' });
        }
      } else {
        ranges.push({ range: `0-${start}`, color: '#ef5151' });
        if (end >= value) {
          ranges.push({ range: `${start}-${end}`, color: '#65a765' });
        } else {
          ranges.push({ range: `${start}-${end}`, color: '#65a765' });
          ranges.push({ range: `${end}-${value}`, color: '#ef5151' });
        }
      }
      return ranges.map(({ range, color }) => {
        const [start, end] = range.split('-').map(Number);
        const width = ((end - start) / (max - min)) * 200;
        const left = ((start - min) / (max - min)) * 200;

        return { width, left, color, start, end };
      });
    }
  }

  getArrowLeftPosition(item: any): number {
    const [start, end] = item.F1ReferenceRange.split('-').map(Number);
    const value = Number(item.F1Result.split(' ')[0]);
    let min = 0;
    let max = end;

    if (end < value) {
      max = value;
    }
    return ((value - min) / (max - min)) * 200;
  }

  public getLabels(segmentIndex: number, item: any) {
    const count = item.segments.length;
    if (count === 1) {
      return { start: true, end: true }
    } else if (count === 2) {
      if (segmentIndex === 0) {
        return { start: true, end: false }
      } else {
        return { start: true, end: true }
      }
    } else if (count === 3) {
      if (segmentIndex === 2) {
        return { start: true, end: true }
      } else {
        return { start: true, end: false }
      }
    }
    return { start: true, end: true };
  }


  getLabPanelResults() {
    this.config.FetchLabReportGroupHTML(this.RegCode, this.selectedReport.TestOrderId, this.hospId).subscribe((response) => {
      const data = JSON.parse(response);
      const labReport = data.LabReport.filter((item: any) => item.FormatType === 'F1' || item.FormatType === 'F8').map((item: any) => {
        const segments: any = this.calculateSegments(item);
        return {
          ...item,
          segments
        }
      });
      const labPanelData = labReport.reduce((acc: any, item: any) => {
        const key = item.TestName;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {} as { [key: string]: any[] });
      this.labPanelData = Object.entries(labPanelData);
      $('#testOrderId_modal').modal('show');
    },
      (err) => {
        this.labPanelData = [];
      })
  }

  addSelectedResult(dept: any) {
    if (dept.specialiseid == '223' && Number(dept.Status) <= 7) {
      this.errorMsg = "Histopathology Results are not Verified";
      $("#errorMsg").modal('show');
      return;
    }
    this.selectedReport = dept;
    this.Savelabresultviews(dept.IsResult);
    this.getLabReportPdf()
  }
  addSelectedDocResult(dept: any) {
    this.selectedReport = dept;
    this.Savelabresultviews(dept.IsResult);
    this.getLabDocReportPdf()
  }
  getLabDocReportPdf() {
    let reqPayload = {
      "RegCode": this.RegCode,
      "HospitalId": this.hospId,
      "TestOrderID": this.selectedReport.TestOrderId,
      "TestOrderItemID": this.selectedReport.TestOrderItemId
    }
    this.config.fetchLabDocReportGroupPDF(this.selectedReport.TestOrderId, this.selectedReport.TestOrderItemID, this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.labReportDocPdfDetails = response;
        this.trustedUrl = response?.FTPPATH;
        this.showLabReportsModal();
      } else if (response.Status === "Fail") {
        this.labReportDocPdfDetails = response;
        this.showToastrModal();
      }
    },
      (err) => {

      })
  }


  getLabReportPdf() {
    // let reqPayload = {
    //   "RegCode": this.RegCode,//this.patientDetails.RegCode,
    //   "HospitalId": this.hospId,
    //   "TestOrderId": this.selectedReport.TestOrderId
    // }
    // this.config.fetchLabReportGroupPDF(this.RegCode, this.selectedReport.TestOrderId,this.doctorDetails[0].UserId, this.hospId).subscribe((response) => {
    //   if (response.Status === "Success") {
    //     this.labReportPdfDetails = response;
    //     this.trustedUrl = response?.FTPPATH;
    //     this.showLabReportsModal();
    //   } else if (response.Status === "Fail") {
    //     this.labReportPdfDetails = response;
    //     this.showToastrModal();
    //   }
    // },
    //   (err) => {

    //   })
    const url = this.service.getData(patientfolder.FetchLabReportGroupPDFN, {
      RegCode: this.RegCode,
      IsNewVisit: this.selectedReport.IsNewVisits,
      TestOrderId: this.selectedReport.TestOrderId,
      UserID: this.doctorDetails[0].UserId,
      HospitalID: this.selectedReport.HospitalID
    });
    this.us.get(url).subscribe((response: any) => {
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

  Savelabresultviews(type: string) {

    var payload = {
      "TaskStatusID": 10,
      "DoneIn": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      "DoneBy": this.doctorDetails[0].UserId,
      "DoneAt": moment(new Date()).format('DD-MMM-YYYY HH:mm'),
      "TaskID": type,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      "Hospitalid": this.hospId,
      "TestViewDetails": [
        {
          "TOID": this.selectedReport.TestOrderId,
          "TOIID": this.selectedReport.TestOrderItemID,
          "REQ": this.selectedReport.Sequence,
          "TID": this.selectedReport.TestId
        }
      ]
    }
    this.config.Savelabresultviews(payload).subscribe(response => {
      if (response.Code == 200) {

      }
    })
  }

  showLabReportsModal(): void {
    $("#showLabReportsModal").modal('show');
  }
  showToastrModal() {
    $("#saveMessage").modal('show');
  }
  closeToastr() {
    $("#saveMessage").modal('hide');
  }
  addSelectedReport(dept: any) {
    if (dept.Status == '5') {
      this.selectedReport = dept;
      this.radioLogyReportPDF();
    }
    else {
      this.errorMsg = "Results are not Verified";
      $("#errorMsg").modal('show');
    }
  }
  radioLogyReportPDF() {
    let reqPayload = {
      "RegCode": this.RegCode,
      "HospitalId": this.hospId,
      "TestOrderItemId": this.selectedReport.TestOrderItemID,
      "TestOrderId": this.selectedReport.TestOrderId,
      "UserID": this.doctorDetails[0].UserId,
    }
    this.config.fetchRadReportGroupPDF(this.RegCode, this.selectedReport.TestOrderItemID, this.selectedReport.TestOrderId, this.doctorDetails[0].UserId, this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        if (this.IsTab === 'C') {
          const content = response.objLabReportNList[0].VALUE;
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/html');
          const extractedText = doc.body.innerHTML;
          this.cardiologyContentHTML = this.sanitizer.bypassSecurityTrustHtml(extractedText);
          $('#cardiology_report').modal('show');
        } else {
          this.radiologyPdfDetails = response;
          this.trustedUrl = response?.FTPPATH
          this.showModal()
        }


      }
    },
      (err) => {

      })
  }
  showModal(): void {
    $("#reviewAndPayment").modal('show');
  }
  submitPACSForm(test: any) {
    openPACS(test.SampleNumber, this.hospId, this.patientDetails.PatientId);
  }

  onLogout() {
    this.config.onLogout();
  }
  GoBackToHome() {
    if (this.patientDetails.PatientType == "3" && !this.IsFromBedsBoard) {
      this.router.navigate(['/suit'])
    }
    else {
      this.router.navigate(['/login/doctor-home'])
    }
  }
  getSSNSearch(key: any) {

  }
  fetchUserFacility() {
    this.bedconfig.fetchUserFacility(this.doctorDetails[0].UserId, this.hospId)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserWardFacilityDataaList;
      },
        (err) => {
        })

  }
  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else if (this.patientDetails.PatientType == "3" && !this.IsFromBedsBoard) {
      this.router.navigate(['/emergency/worklist']);
    }
    else if (this.IsHeadNurse && !this.IsFromBedsBoard)
      this.router.navigate(['/emergency/beds']);

    else
      this.router.navigate(['/ward']);
  }
  isdetailShows() {
    this.isdetailShow = true;
    if (this.isdetailShow = true) {
      $('.patient_card').addClass('maximum')
    }
    // else{
    //   $('.patient_card').removeClass('maximum')
    // }
  }
  isdetailHide() {
    this.isdetailShow = false;
    if (this.isdetailShow === false) {
      $('.patient_card').removeClass('maximum')
    }
  }
  navigatetoRadiologyResultEntry() {
    this.router.navigate(['/suit/radiology-resultentry']);
  }

  isSelectedRow(rowData: any): boolean {
    return rowData === this.selectedReport;
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

  getResultClassName(item: any) {
    if (item.F1Result && item.F1ReferenceRange) {
      const value = Number(item.F1Result.split(' ')[0]);
      const refValues = item.F1ReferenceRange?.split('-').map((x: any) => Number(x));
      return value >= refValues[0] && value <= refValues[1] ? 'normal_text' : 'high_text';
    }
    return '';
  }

  FetchLabTestComponentsList: any = [];

  openResults(item: any) {
    if (item.specialiseid == '223' && Number(item.Status) <= 7) {
      this.errorMsg = "Histopathology Results are not Verified";
      $("#errorMsg").modal('show');
      return;
    }
    item.expand = !item.expand;
    if (item.expand && Number(item.Status) >= 7) {
      const url = this.us.getApiUrl(labresultentry.FetchPrevLabTestComponents, {
        PatientID: this.selectedView.PatientID,
        GenderID: this.selectedView.GenderID,
        DOB: moment(this.selectedView.DOB).format('DD-MMM-YYYY'),
        SampleCollectedAtDt: item.SampleCollectedAt,
        TestID: item.TestId,
        TestOrderID: item.TestOrderId,
        TestOrderItemID: item.TestOrderItemID,
        PatientType: item.PatientType,
        UserID: this.doctorDetails[0]?.UserId,
        WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        HospitalID: item.HospitalID,
        SampleNo: item.SampleNumber
      });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            //this.FetchLabTestComponentsList = response.FetchLabTestComponentsListM;
            item.FetchLabTestComponentsList = response.FetchLabTestComponentsListM;
            // this.FetchLabTestComponentsList.forEach((element: any) => {
            //   if (element.ControlType === 'Numeric TextBox') {
            //     if (element.TextValue != "") {
            //       this.onNumericTextboxChange(null, element);
            //     }
            //   }
            // });
            item.FetchLabTestComponentsList.forEach((element: any) => {
              if (element.ControlType === 'Numeric TextBox') {
                if (element.TextValue != "") {
                  this.onNumericTextboxChange(null, element);
                }
              }
            });
          }
        },
          (err) => {

          })
    }
  }

  onNumericTextboxChange(event: any, item: any) {
    var txtVal = "";
    if (event != null)
      txtVal = event.target.value;
    else
      txtVal = item.TextValue;

    const minLim = item.MinLimit;
    const maxLim = item.MaxLimit;
    const panicMin = item.PanicMin;
    const panicMax = item.PanicMax;
    if (txtVal != "") {
      if (parseFloat(txtVal) > parseFloat(maxLim) || parseFloat(txtVal) < parseFloat(minLim)) {
        item.Color = "red";
        item.abnormal = true;
      }
      else {
        item.abnormal = false;
      }
      if (parseFloat(txtVal) > parseFloat(panicMax) || parseFloat(txtVal) < parseFloat(panicMin)) {
        item.Color = "red";
        item.panic = true;
      }
      else {
        item.panic = false;
      }
      if (!item.panic && !item.abnormal) {
        item.Color = "black";
        item.panic = false;
        item.abnormal = false;
      }
    }
    item.TextValue = txtVal;
  }

  addSelectedItemResult(dept: any) {
    if (dept.specialiseid == '223' && Number(dept.Status) <= 7) {
      this.errorMsg = "Histopathology Results are not Verified";
      $("#errorMsg").modal('show');
      return;
    }
    this.selectedReport = dept;
    this.Savelabresultviews(dept.IsResult);
    this.getItemLabReportPdf()
  }

  getItemLabReportPdf() {
    const url = this.us.getApiUrl(patientfolder.FetchLabReportItemlevelGroupPDFN, {
      RegCode: this.patientDetails.RegCode,
      IPID: this.patientDetails.AdmissionID ?? this.selectedView.AdmissionID,
      TestID: this.selectedReport.TestId,
      TestOrderId: this.selectedReport.TestOrderId,
      TestOrderItemID: this.selectedReport.TestOrderItemID,
      IsnewVisit: this.selectedReport.IsNewVisits,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.HospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Status === "Success") {
        this.labReportPdfDetails = response;
        this.trustedUrl = response?.FTPPATH;
        //this.showLabReportsModal();
        if (response.objHtmlReport != '' && response.objHtmlReport != null) {
          this.reportName = "Lab Report";
          const content = response.objHtmlReport;
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/html');
          const extractedText = doc.body.innerHTML;
          this.cardiologyContentHTML = this.sanitizer.bypassSecurityTrustHtml(extractedText);
          $('#cardiology_report').modal('show');
        }
        else {
          this.showLabReportsModal();
        }
      } else if (response.Status === "Fail") {
        this.labReportPdfDetails = response;
        this.showToastrModal();
      }
    },
      (err) => {

      })
  }
}


export const otherresults = {
  FetchLabReportGroupPDFN: 'FetchLabReportGroupPDFN?RegCode=${RegCode}&IsNewVisit=${IsNewVisit}&TestOrderId=${TestOrderId}&UserID=${UserID}&HospitalID=${HospitalID}',
}