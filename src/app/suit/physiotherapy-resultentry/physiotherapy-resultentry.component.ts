import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { SuitConfigService } from '../services/suitconfig.service';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

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
  selector: 'app-physiotherapy-resultentry',
  templateUrl: './physiotherapy-resultentry.component.html',
  styleUrls: ['./physiotherapy-resultentry.component.scss'],
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
export class PhysiotherapyResultentryComponent extends BaseComponent implements OnInit {
  isAreaSplineActive: boolean = false;
  selectedButtonType = "";
  colorN: any;
  tablePatientsForm!: FormGroup;
  isSplineActive: boolean = true;
  isLineActive: boolean = false;
  isColumnActive: boolean = false;
  activeButton: string = 'spline';
  charAreaSpline!: Highcharts.Chart
  charttype = 'W';
  FetchGrowthChartOutputLists: any = [];
  FetchGrowthChartPatientOutputLists: any = [];
  FetchPatientBMIGrowthChartData: any = [];
  tableVitalsScores: any;
  tableVitalsList: any;
  tableVitalsListFiltered: any;
  selectedPatientData: any;
  showAllergydiv: boolean = false;
  testTemplates: any;
  radiologyDoctors: any
  patientDiagnosis: any;
  patientDiagnosisName: any;
  htmlContent: any;
  htmlContentForPreviousResult: any;
  selectedTemplateId: any;
  errorMessages: any[] = [];
  isPanic: boolean = false;
  ISPANICFORM: boolean = false;
  isInteresting: boolean = false;
  confirmationMessage: string = "";
  isVerify: boolean = false;
  isResultsReview: boolean = false;
  resultRemarks: any;
  successMessage: string = "";
  addendumResults: any;
  showTemplateDiagnosisDoctordiv: boolean = true;
  editordivClass: string = "col-lg-8 left_expand";
  selectedDocumentID: any;
  informedToList: any;
  selectedInformedToEmpDetails: any[] = [];
  currentDate: any;
  readBackDate: string = "";
  IsReadBack: boolean = false;
  savedPatientPanicResultReportingDetails: any;
  selectedInformedByEmpDetails: any[] = [];
  sowPanicFormSave: boolean = true;
  showHtmlEditor: boolean = false;
  showSaveAddendum: boolean = false;
  verifyMsg: string = "";
  reviewMsg: string = "";
  pacsForm!: FormGroup;

  selectedPatientSSN: any;
  selectedPatientName: any;
  selectedPatientGender: any;
  selectedPatientAge: any;
  selectedPatientMobile: any;
  selectedPatientVTScore: any;
  selectedPatientHeight: any;
  selectedPatientWeight: any;
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
  AddEndumSelected: any;
  trustedUrl: any;
  radiologyPdfDetails: any;
  RadEndServiceType: any;
  facility: any;
  facilityId: any;
  treatmentSheetOrderDetails: any = [];
  treatmentResultForm!: FormGroup;
  selectedOrderForTreatmentSheet: any;
  enableSave: boolean = false;
  enableDelete: boolean = false;
  FetchPhysiotherapyAssessmentSectionsDataList: any = [];
  FetchPhysiotherapyAssessmentSectionsGoalsDataList: any = [];
  FetchPhysiotherapyAssessmentSectionsTreatmentDataList: any = [];
  PatientPhyAssessmentOrderID: any = 0;
  @ViewChild('chartLineAreaSpline', { static: true }) chartLineAreaSpline!: ElementRef;
  @ViewChild('chartLineSpline', { static: true }) chartLineSpline!: ElementRef;
  @ViewChild('chartLine', { static: true }) chartLine!: ElementRef;
  @ViewChild('chartColumn', { static: true }) chartColumn!: ElementRef;
  painScore: any;
  selectedPainScoreId = "0";
  patientHigh: any;
  Createdate:string ='';  
  TreatingDoctorName: any;
  smartDataList: any;
  @Input() 
  data: any;
  readonly: boolean = false;
  getHight() {
    this.configService.getPatientHight(this.selectedPatientData.PatientID).subscribe(res => {
      this.patientHigh = res
      // this.PatientHW = res.SmartDataList
      this.smartDataList = this.patientHigh.SmartDataList;
      this.createHWChartLine();
    })
  }

  duringactiveButton: any = 'spline';
  toggleSelected(type: string): void {
    this.duringactiveButton = type;
    this.selectedButtonType = type;
  }

  private createHWChartLine(): void {
    let data: any = {};

    const heightData: any[] = [];
    const weigthData: any[] = [];
    const BMIData: any[] = [];

    this.smartDataList.forEach((element: any, index: any) => {
      heightData.push([element.Createdate, parseFloat(element.Height)])
      weigthData.push([element.Createdate, parseFloat(element.Weight)])
      BMIData.push([element.Createdate, parseFloat(element.BMI)])
    });

    data = [{ name: 'Height', data: heightData }, { name: 'Weight', data: weigthData }];

    const chart = Highcharts.chart('chart-hw-line', {
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
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
        valueDecimals: 1,
        crosshairs: [{
          width: 1,
          color: 'Gray'
        }, {
          width: 1,
          color: 'gray'
        }]
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0.5
        }
      },
      series: data,
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

  fetchPainScoreMaster() {
    this.configService.fetchPainScoreMasters().subscribe(response => {
      this.painScore = response.SmartDataList;
      this.painScore.forEach((element: any, index: any) => {
        if (element.id == 1) { element.imgsrc = "assets/images/image1.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 2) { element.imgsrc = "assets/images/image2.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 3) { element.imgsrc = "assets/images/image3.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 4) { element.imgsrc = "assets/images/image4.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 5) { element.imgsrc = "assets/images/image5.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 6) { element.imgsrc = "assets/images/image6.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
      });
    })
  }

  getChart(type: any) {
    this.charttype = type;
    this.configService.fetchGrowthChartResults(this.selectedPatientData.PatientID, type, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchGrowthChartOutputLists = response.FetchGrowthChartOutputLists;
          this.FetchGrowthChartPatientOutputLists = response.FetchAgeGrowthChartOutputLists;

          if (this.FetchGrowthChartOutputLists.length > 0) {
            const testNames = Array.from(new Set(Object.keys(this.FetchGrowthChartOutputLists[0]))).filter(name => name !== "Agemos" && name !== "Agemos");

            const dynamicArray = testNames.map((testName, index) => {
              return {
                name: testName,
                data: this.FetchGrowthChartOutputLists.map((result: any) => {
                  if (testName == 'P3')
                    this.colorN = '#0000FF';
                  if (testName == 'P5')
                    this.colorN = '#115FA6';
                  if (testName == 'P10')
                    this.colorN = '#94AE0A';
                  if (testName == 'P25')
                    this.colorN = '#A61120';
                  if (testName == 'P50')
                    this.colorN = '#FF8809';
                  if (testName == 'P75')
                    this.colorN = '#FFD13E';
                  if (testName == 'P90')
                    this.colorN = '#A61187';
                  if (testName == 'P95')
                    this.colorN = '#24AD9A';
                  if (testName == 'P97')
                    this.colorN = '#8B4513';
                  return [result.Agemos, result[testName] ? parseFloat(result[testName]) : result[testName]]
                }),
                connectNulls: true,
                color: this.colorN,
                lineWidth: 0.5
              };
            });



            setTimeout(() => {
              const chart = Highcharts.chart('chart-line-growth', {
                chart: {
                  type: this.selectedButtonType,
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
                  },
                  tickPixelInterval: 20,
                  gridLineWidth: 1

                },
                xAxis: {
                  type: 'category',
                  min: 0
                },
                tooltip: {
                  headerFormat: `<div>Age: {point.key}</div>`,
                  pointFormat: `<div>{series.name}: {point.y}</div>`,
                  shared: true,
                  useHTML: true,
                  enabled: false,
                  valueDecimals: 2
                },

                plotOptions: {
                  column: {
                    pointPadding: 0.2,
                    borderWidth: 0.5
                  },
                  line: {
                    marker: {
                      enabled: false
                    },
                    series: {
                      lineWidth: 1,
                      states: {
                        hover: {
                          enabled: true,
                          lineWidth: 1
                        }
                      }
                    },
                    states: {
                      hover: {
                        enabled: false
                      },
                      inactive: {
                        opacity: 1
                      }
                    }
                  }
                },
                series: dynamicArray,
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

              if (type != "C") {
                const circleMarksData: any = [];
                this.FetchGrowthChartPatientOutputLists.forEach((item: any) => {
                  const ageInMonths = parseInt(item.Agemos);
                  var weightInKg = 0;
                  weightInKg = parseFloat(item.PatientValue);
                  circleMarksData.push([ageInMonths, weightInKg]);
                });

                const lineSeriesData = circleMarksData.map((point: any) => [point[0], point[1]]);
                chart.addSeries({
                  type: 'spline',
                  name: 'Patient',
                  data: lineSeriesData,
                  color: '#229954',
                  lineWidth: 2,
                  tooltip: {
                    headerFormat: '<small>{point.key}</small><table>',
                    pointFormat: '<tr><td style="color: {series.color}">{series.name}:{point.y} </td>',
                    footerFormat: '</table>',
                    valueDecimals: 1,
                  },
                  marker: {
                    symbol: 'diamond',
                    radius: 4,
                    fillColor: '#196F3D',
                    enabled: true
                  },
                  dataLabels: {
                    enabled: true,
                    color: 'black',
                    align: 'left'
                  }
                });
              }
            }, 1000);
          }

        }
      },
        (err) => {

        })
  }

  constructor(private config: SuitConfigService, private router: Router, private configService: ConfigService, public datepipe: DatePipe,
    private op_config: ConfigService, private fb: FormBuilder) {
    super();
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
    this.RadEndServiceType = this.facility.FacilityName;
    this.treatmentResultForm = this.fb.group({
      TestOrderItemID: [0],
      PlanOfManagement: [''],
      BriefHistory: [''],
      Goals: [''],
      ObjectiveEvaluation: [''],
      Treatment: [''],
      AssessmentDetails: [''],
      ProgressNotes: [''],
      Diagnosis: [''],
    });
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

  ngOnInit(): void {
    this.currentDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy HH:mm")?.toString();
    this.selectedPatientData = JSON.parse(sessionStorage.getItem("selectedPatientData") || '{}');
    if(this.data) {
      this.selectedPatientData = this.data.data;
      this.readonly = true;
    }
    if (this.selectedPatientData.ISPanic == "1") {
      this.isPanic = true;
    }
    if (this.selectedPatientData.Status == 5) {
      this.isVerify = true;
      this.htmlContent = '';
      this.showHtmlEditor = false;
    }
    else {
      this.showHtmlEditor = true;
    }
    this.Fetchtreatmentsheetorderdetails(this.selectedPatientData.TestOrderID);
    this.FetchAdviceDiagnosis();
    this.FetchPhysiotherapyAssessmentSections();
    this.initializetablePatientsForm();
    //this.GetVitalScores();
    this.getChart('W')
    this.fetchPainScoreMaster();
  }

  FetchPhysiotherapyAssessmentSections() {
    this.config.FetchPhysiotherapyAssessmentSections(this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response: any) => {
      if (response.Code == 200) {
        this.FetchPhysiotherapyAssessmentSectionsDataList = response.FetchPhysiotherapyAssessmentSectionsDataList;
        this.FetchPhysiotherapyAssessmentSectionsGoalsDataList = response.FetchPhysiotherapyAssessmentSectionsGoalsDataList;
        this.FetchPhysiotherapyAssessmentSectionsTreatmentDataList = response.FetchPhysiotherapyAssessmentSectionsTreatmentDataList;
        const index = this.FetchPhysiotherapyAssessmentSectionsTreatmentDataList.findIndex((item: any) => item.PhysicaltherapyAssID == 34);
        if (index > -1) {
          const [foundItem] = this.FetchPhysiotherapyAssessmentSectionsTreatmentDataList.splice(index, 1);
          this.FetchPhysiotherapyAssessmentSectionsTreatmentDataList.push(foundItem);
        }
        this.FetchPatientPhysiotherapyAssessmentOrders();
      }
    });
  }

  FetchPatientPhysiotherapyAssessmentOrders() {
    this.config.FetchPatientPhysiotherapyAssessmentOrders(this.selectedPatientData.TestOrderItemID, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response: any) => {
      if (response.Code == 200 && response.FetchPatientPhysiotherapyAssessmentOrdersDataList.length > 0) {
        const data = response.FetchPatientPhysiotherapyAssessmentOrdersDataList[0];
        this.PatientPhyAssessmentOrderID = data.PatientPhyAssessmentOrderId;
        this.selectedPainScoreId = data.PainScoreID;
        this.Createdate = data.Createdate;
        this.TreatingDoctorName = data.TreatingDoctorName;

        $("#progressNotesText").html(data.ProgressNotes);

         $("#AssessmentText").html(data.AssessmentOthers);
          $("#TreatmentText").html(data.TreatmentOthers);
           $("#GoalsText").html(data.GoalsOthers);
            $("#progressNotesTextProgression").html(data.Progression);
             $("#progressNotesTextcomments").html(data.Comments);
       

        const PhysiotherapyAssIDs = data.PhysiotherapyAssIDs.split(',');
        PhysiotherapyAssIDs.forEach((id: any) => {
          let item = this.FetchPhysiotherapyAssessmentSectionsDataList.find((item: any) => item.PhysicaltherapyAssID.toString() === id.toString());
          if (item) {
            item.selected = true;
          } else if (!item) {
            item = this.FetchPhysiotherapyAssessmentSectionsGoalsDataList.find((item: any) => item.PhysicaltherapyAssID.toString() === id.toString());
            if (item) {
              item.selected = true;
            } else if (!item) {
              item = this.FetchPhysiotherapyAssessmentSectionsTreatmentDataList.find((item: any) => item.PhysicaltherapyAssID.toString() === id.toString());
              if (item) {
                item.selected = true;
              }
            }
          }
        });
        const AssessmentOtherIDs = data.AssessmentOtherIDs.split(',');
        AssessmentOtherIDs.forEach((othersData: any) => {
          const id = othersData.split(':')[0];
          const data = othersData.split(':')[1];
          let item = this.FetchPhysiotherapyAssessmentSectionsDataList.find((item: any) => item.PhysicaltherapyAssID.toString() === id.toString());
          if (item) {
            item.selected = true;
            item.OthersText = data;
          } else if (!item) {
            item = this.FetchPhysiotherapyAssessmentSectionsGoalsDataList.find((item: any) => item.PhysicaltherapyAssID.toString() === id.toString());
            if (item) {
              item.selected = true;
              item.OthersText = data;
            } else if (!item) {
              item = this.FetchPhysiotherapyAssessmentSectionsTreatmentDataList.find((item: any) => item.PhysicaltherapyAssID.toString() === id.toString());
              if (item) {
                item.selected = true;
                item.OthersText = data;
              }
            }
          }
        });
      }
    })
  }

  onChecboxSelection(item: any) {
    item.selected = !item.selected;
  }

  saveData() {
    const PhysiotherapyAssIDs: any = [];
    const AssessmentOtherIDs: any = [];
    const allItems = [...this.FetchPhysiotherapyAssessmentSectionsDataList,
    ...this.FetchPhysiotherapyAssessmentSectionsGoalsDataList,
    ...this.FetchPhysiotherapyAssessmentSectionsTreatmentDataList
    ];
    allItems.forEach((item: any) => {
      if (item.selected && item.SubSectionName !== 'Others') {
        PhysiotherapyAssIDs.push(item.PhysicaltherapyAssID);
      }
      if (item.selected && item.SubSectionName === 'Others') {
        AssessmentOtherIDs.push(`${item.PhysicaltherapyAssID}:${item.OthersText ?? ''}`)
      }
    });
    const payload = {
      "PatientPhyAssessmentOrderID": this.PatientPhyAssessmentOrderID,
      "PatientID": this.selectedPatientData.PatientID,
      "AdmissionID": this.selectedPatientData.IPID,
      "TestOrderID": this.selectedPatientData.TestOrderID,
      "TestOrderItemID": this.selectedPatientData.TestOrderItemID,
      "TreatingDoctorID": this.selectedPatientData.PerfDoctorID,
      "PainScoreID": this.selectedPainScoreId,
      "ProgressNotes": $('#progressNotesText').html(),
      "PhysiotherapyAssIDs": PhysiotherapyAssIDs.toString(),
      "AssessmentOtherIDs": AssessmentOtherIDs.toString(),
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "Hospitalid": this.hospitalID,
      "TestOrderSequence": this.selectedPatientData.Sequence,
      "AssessmentOthers": $('#AssessmentText').html(),
      "TreatmentOthers": $('#TreatmentText').html(),
      "GoalsOthers": $('#GoalsText').html(),
      "Progression": $('#progressNotesTextProgression').html(),
      "Comments": $('#progressNotesTextcomments').html()

    };
    this.config.SavePatientPhysiotherapyAssessmentOrders(payload).subscribe((response: any) => {
      if (response.Code === 200) {
        this.PatientPhyAssessmentOrderID = response.PatientVitalEndoscopyDataaList[0].PreProcedureAssessment;
        this.successMessage = "Results Entry Saved Successfully";
        $("#resultEntrySavedMsg").modal('show');
      }
    });
  }

  clearData() {
    $("#progressNotesText").html('');

     $("#AssessmentText").html('');
      $("#GoalsText").html('');
       $("#TreatmentText").html('');
        $("#progressNotesTextProgression").html('');
         $("#progressNotesTextcomments").html('');


    this.FetchPhysiotherapyAssessmentSectionsDataList.find((item: any) => {
      item.selected = false;
      item.OthersText = '';
    });
    this.FetchPhysiotherapyAssessmentSectionsGoalsDataList.find((item: any) => {
      item.selected = false;
      item.OthersText = '';
    });
    this.FetchPhysiotherapyAssessmentSectionsTreatmentDataList.find((item: any) => {
      item.selected = false;
      item.OthersText = '';
    });
  }

  Fetchtreatmentsheetorderdetails(testOrderId: any) {
    this.config.Fetchtreatmentsheetorderdetails(testOrderId, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response) => {
      if (response.Code == 200 && response.FetchtreatmentsheetorderdetailsDataList.length > 0) {
        this.treatmentSheetOrderDetails = response.FetchtreatmentsheetorderdetailsDataList;
      }
    },
      (err) => {

      })
  }

  FetchAdviceDiagnosis() {
    this.config.FetchAdviceDiagnosis(1, this.selectedPatientData.IPID, this.hospitalID).subscribe((response) => {
      if (response.Code == 200) {
        this.patientDiagnosis = response.PatientDiagnosisDataList;
        this.patientDiagnosis.forEach((element: any, index: any) => {
          this.patientDiagnosisName = element.DiseaseName + ",";
        });
      }
    },
      (err) => {

      })
  }

  openAllergyPopup() {
    this.showAllergydiv = true;
  }

  goBackToRadiologyWorklist() {
    sessionStorage.setItem("selectedPatientData", "");
    $('#selectPatientYesNoModal').modal('show');
    //this.router.navigate(['/suit/physiotherapyworklist']);
  }

  navigateToResults() {
    sessionStorage.setItem("FromPhysiotherapy", "true");
    this.router.navigate(['/home/otherresults']);
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.selectedPatientData));
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedPatientData));
  }

  navigateToReportResultView() {
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.selectedPatientData));
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedPatientData));
    sessionStorage.setItem("FromRadiology", "true");
    this.router.navigate(['/home/otherresults']);
  }

  showPatientInfo(pinfo: any) {
    $("#quick_info").modal('show');
    this.selectedPatientSSN = pinfo.SSN;
    this.selectedPatientName = pinfo.PatientName;
    this.selectedPatientGender = pinfo.Gender;
    this.selectedPatientAge = pinfo.FullAge;
    this.selectedPatientMobile = pinfo.MobileNo;
    this.selectedPatientHeight = pinfo.Height;
    this.selectedPatientWeight = pinfo.Weight;
    this.selectedPatientBloodGrp = pinfo.BloodGroup;
    this.selectedPatientIsVip = pinfo.IsVIP == "Non-VIP" ? false : true;
    if (pinfo.IsPregnancy) {
      this.selectedPatientIsPregnancy = true;
      this.selectedPatientPregnancyTrisemister = pinfo.PregnancyContent;
    }
    else {
      this.selectedPatientIsPregnancy = false;
      this.selectedPatientPregnancyTrisemister = "";
    }
    this.op_config.FetchPatientFileInfo(pinfo.EpisodeID, pinfo.IPID, this.hospitalID, pinfo.PatientID, pinfo.RegCode).subscribe((response: any) => {
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

  showModal(): void {
    $("#reviewAndPayment").modal('show');
  }

  bindTreatmentSheetData(event: any) {
    if (event.target.value !== '0') {
      this.enableSave = true;
    }
    const treat = this.treatmentSheetOrderDetails.find((x: any) => x.OrderItemID === event.target.value);
    this.selectedOrderForTreatmentSheet = treat;
    this.getOrderTreatmentSheetData(treat);
  }

  getOrderTreatmentSheetData(treat: any) {
    this.config.FetchTreatmentSheet(treat.OrderID, this.selectedPatientData.PatientID, this.selectedPatientData.IPID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response) => {
      if (response.Code == 200 && response.FetchTreatmentSheetDataList.length > 0) {
        const treatmentSheetResult = response.FetchTreatmentSheetDataList.find((x: any) => x.OrderItemID === treat.OrderItemID);
        if (treatmentSheetResult) {
          this.enableDelete = true;
          $("#PlanOfManagement").text(treatmentSheetResult.PlanOfMgt);
          $("#BriefHistory").text(treatmentSheetResult.Goals);
          $("#Goals").text(treatmentSheetResult.Treatment);
          $("#ObjectiveEvaluation").text(treatmentSheetResult.ProgressNotes);
          $("#Treatment").text(treatmentSheetResult.ChiefComplaints);
          $("#AssessmentDetails").text(treatmentSheetResult.PhysiotherapyHistory);
          $("#ProgressNotes").text(treatmentSheetResult.AssessmentDetails);
          $("#Diagnosis").text(treatmentSheetResult.Diagnosis);
        }
        else {
          this.clearTreatmentSheetResult();
        }
      }
      else {
        this.clearTreatmentSheetResult();
      }
    },
      (err) => {

      })
  }

  clearTreatmentSheetResult() {
    $("#PlanOfManagement").text('');
    $("#BriefHistory").text('');
    $("#Goals").text('');
    $("#ObjectiveEvaluation").text('');
    $("#Treatment").text('');
    $("#AssessmentDetails").text('');
    $("#ProgressNotes").text('');
    $("#Diagnosis").text('');
    $("#treatmentSessions").val('0');
    this.enableSave = false;
    this.enableDelete = false;
  }

  saveTreatmentSheet(type: string) {
    var blocked = 0;
    if (type === 'save') {
      blocked = 0;
    }
    else if (type === 'delete') {
      blocked = 1;
    }
    var payload = {
      "TestOrderID": this.selectedOrderForTreatmentSheet.OrderID,
      "TestOrderItemID": this.selectedOrderForTreatmentSheet.OrderItemID,
      "ProcedureID": this.selectedOrderForTreatmentSheet.TestID,
      "SheetDetails": [
        {
          "DESCRI": $("#PlanOfManagement").text(),
          "TSTID": 1,
          "BLK": blocked
        },
        {
          "DESCRI": $("#BriefHistory").text(),
          "TSTID": 2,
          "BLK": blocked
        },
        {
          "DESCRI": $("#Goals").text(),
          "TSTID": 3,
          "BLK": blocked
        },
        {
          "DESCRI": $("#ObjectiveEvaluation").text(),
          "TSTID": 4,
          "BLK": blocked
        },
        {
          "DESCRI": $("#Treatment").text(),
          "TSTID": 5,
          "BLK": blocked
        },
        {
          "DESCRI": $("#AssessmentDetails").text(),
          "TSTID": 6,
          "BLK": blocked
        },
        {
          "DESCRI": $("#ProgressNotes").text(),
          "TSTID": 7,
          "BLK": blocked
        },
        {
          "DESCRI": $("#Diagnosis").text(),
          "TSTID": 8,
          "BLK": blocked
        }
      ],
      "Status": "0",
      "HospitalID": this.hospitalID,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
    }
    this.config.SaveTestOrderItemTreatmentSheet(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.successMessage = "Result Saved Successfully";
        $("#resultEntrySavedMsg").modal('show');
        this.getOrderTreatmentSheetData(this.selectedOrderForTreatmentSheet);
      }
    },
      (err) => {

      })
  }

  clearTreatmentSheet() {

    if (this.selectedPatientData?.TestOrderItemID === this.selectedOrderForTreatmentSheet?.OrderItemID)
      this.clearTreatmentSheetResult();
  }

  GetVitalScores() {
    this.configService.fetchVitalScores(this.doctorDetails[0].UserId, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitalsScores = response.FetchVitalScoresDataList;
        this.GetVitalsData();
      } else {
      }
    },
      (err) => {

      })
  }
  GetVitalsData() {
    var vm = new Date(); vm.setMonth(vm.getMonth() - 1);
    var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();

    if (this.selectedCard.PatientType == '1') {
      //this.config.fetchOutPatientData(this.selectedCard.PatientID, FromDate, ToDate, this.hospId)
      this.configService.fetchOutPatientDataRR(this.selectedPatientData.PatientID, FromDate, ToDate, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.PatientVitalsDataList.length > 0) {
            this.tableVitalsList = response.PatientVitalsDataList;
            this.tableVitalsListFiltered = this.tableVitalsList;

            this.selectedCard.BP = response.PatientVitalsDataList[0].BPSystolic + "/" + response.PatientVitalsDataList[0].BPDiastolic;
            this.selectedCard.Temperature = response.PatientVitalsDataList[0].Temparature;

            this.createChartLine(1);
          }
        },
          (err) => {

          })
    } else if (this.selectedCard.PatientType == '3') {
      this.configService.fetchOutPatientData(this.selectedPatientData.PatientID, FromDate, ToDate, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.tableVitalsList = response.PatientVitalsDataList;
            this.tableVitalsListFiltered = this.tableVitalsList;

            this.selectedCard.BP = response.PatientVitalsDataList[0].BPSystolic + "/" + response.PatientVitalsDataList[0].BPDiastolic;
            this.selectedCard.Temperature = response.PatientVitalsDataList[0].Temparature;
            this.createChartLine(1);
          }
        },
          (err) => {

          })
    }
    else {
      // this.config.fetchInPatientData(this.PatientID, FromDate, ToDate, this.hospId)
      //   .subscribe((response: any) => {
      //     if (response.Code == 200) {
      //       this.tableVitalsList = response.PatientVitalsDataList;
      //       this.createChartLine(2);
      //     }
      //   },
      //     (err) => {

      //     })
      var vm = new Date(); vm.setMonth(vm.getMonth() - 3);
      var FromDate = this.datepipe.transform(vm, "dd-MMM-yyyy")?.toString();
      var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
      this.configService.FetchIPPatientVitalsRR(this.selectedPatientData.IPID, FromDate, ToDate, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.tableVitalsList = response.FetchIPPatientVitalsRRDataList;
            const distinctThings = response.FetchIPPatientVitalsRRDataList.filter(
              (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.VitalSignDateOnly === thing.VitalSignDateOnly) === i);
            console.dir(distinctThings);
            this.tableVitalsListFiltered = distinctThings;
            this.createChartLine(2);
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
        element.VisitDateTime = element.VitalSignDateOnly.split(' ')[0];//element.VitalSignDateOnly?.split('-')[2];
        element.VisitDate = element.VitalSignDateOnly.split(' ')[0];//element.VitalSignDateOnly?.split('-')[0];
      }
      else {
        element.VisitDate = element.VitalSignDateOnly;
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

    const chart = Highcharts.chart('chart-line', {
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
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
        valueDecimals: 1,
        crosshairs: [{
          width: 1,
          color: 'Gray'
        }, {
          width: 1,
          color: 'gray'
        }]
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0.5
        }
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

    const chartviewmore = Highcharts.chart('chart-line', {
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
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
        valueDecimals: 1,
        crosshairs: [{
          width: 1,
          color: 'Gray'
        }, {
          width: 1,
          color: 'gray'
        }]
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0.5
        }
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

  openViewVitals() {
    $("#viewVitals").modal('show');
  }

  fillChart(chartType: any) {
    var highchartOption;
    if (chartType == "column") {
      this.isAreaSplineActive = false;
      this.isSplineActive = false;
      this.isLineActive = false;
      this.isColumnActive = true;
      this.activeButton = 'column';
    }
    else if (chartType == "line") {
      this.isAreaSplineActive = false;
      this.isSplineActive = false;
      this.isLineActive = true;
      this.isColumnActive = false;
      this.activeButton = 'line';
    }
    else if (chartType == "spline") {
      this.isAreaSplineActive = false;
      this.isSplineActive = true;
      this.isLineActive = false;
      this.isColumnActive = false;
      this.activeButton = 'spline';
    }
    else if (chartType == "areaSpline") {
      this.isAreaSplineActive = true;
      this.isSplineActive = false;
      this.isLineActive = false;
      this.isColumnActive = false;
      this.activeButton = 'areaSpline';
    }
    let vitaldata: any = {};
    let type = 1;
    if (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4')
      type = 2;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];

    this.tableVitalsList.forEach((element: any, index: any) => {
      if (type == 1) {
        element.VisitDate = element.VitalSignDateOnly?.split('-')[0];
      }
      else {
        element.VisitDate = element.VitalSignDateOnly;
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

    vitaldata = [
      { name: 'BP-Systolic', data: BPSystolicData },
      { name: 'BP-Diastolic', data: BPDiastolicData },
      { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
      { name: 'Pulse', data: PulseData, visible: false },
      { name: 'Respiration', data: RespirationData, visible: false },
      { name: 'SPO2', data: SPO2Data, visible: false },
      { name: 'Temparature', data: TemparatureData, visible: false }
    ];

    if (chartType == "column") {
      this.charAreaSpline = Highcharts.chart(this.chartColumn.nativeElement, {
        chart: {
          type: chartType,
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
          pointFormat: `<div>{series.name}: {point.y}</div>`,
          shared: true,
          useHTML: true,
          valueDecimals: 1,
          crosshairs: [{
            width: 1,
            color: 'Gray'
          }, {
            width: 1,
            color: 'gray'
          }]
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0.5
          }
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
    else if (chartType == "areaSpline") {
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
          pointFormat: `<div>{series.name}: {point.y}</div>`,
          shared: true,
          useHTML: true,
          valueDecimals: 1,
          crosshairs: [{
            width: 1,
            color: 'Gray'
          }, {
            width: 1,
            color: 'gray'
          }]
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0.5
          }
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
    else if (chartType == "spline") {
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
          pointFormat: `<div>{series.name}: {point.y}</div>`,
          shared: true,
          useHTML: true,
          valueDecimals: 1,
          crosshairs: [{
            width: 1,
            color: 'Gray'
          }, {
            width: 1,
            color: 'gray'
          }]
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0.5
          }
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
    else if (chartType == "line") {
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
          pointFormat: `<div>{series.name}: {point.y}</div>`,
          shared: true,
          useHTML: true,
          valueDecimals: 1,
          crosshairs: [{
            width: 1,
            color: 'Gray'
          }, {
            width: 1,
            color: 'gray'
          }]
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0.5
          }
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
  }

  filterFunction(vitals: any, visitid: any) {
    if (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4')
      return vitals.filter((buttom: any) => buttom.VitalSignDateOnly == visitid);
    else
      return vitals.filter((buttom: any) => buttom.VisitID == visitid);
  }

  getPainScoreName(psid: string) {
    if (psid === null || psid === '0' || psid === '') {
      return 'Select' + '-' + '';
    }
    const ps = this.painScore?.find((x: any) => x.id == psid);
    return ps?.name.split('-')[0] + '-' + ps?.code
  }

  setPainScorevalue(ps: any) {
    this.selectedPainScoreId = ps.id;
  }

  PatientPhysiotherapyAssessmentOrdersPrint() {
    this.config.FetchPatientPhysiotherapyAssessmentOrdersPrint(this.selectedPatientData.TestOrderItemID,this.doctorDetails[0].UserName, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModalP()
        }
      },
        (err) => {
        });
  }
  showModalP(){
    $("#reviewAndPayment").modal('show');
  }

  onAccept() {
    const SSN = this.selectedPatientData.SSN;
    const patientType = this.selectedPatientData.PatientType;
    
    $('#selectPatientYesNoModal').modal('hide');
    sessionStorage.setItem('navigateToPhysiotheraphyWorklist', SSN);
    sessionStorage.setItem('navigateToPhysiotheraphyWorklistpatientType', patientType);
    
    this.router.navigate(['/suit/physiotherapyworklist']);
  }

  onDecline() {
    $('#selectPatientYesNoModal').modal('hide');
    this.router.navigate(['/suit/physiotherapyworklist']);
  }

}
