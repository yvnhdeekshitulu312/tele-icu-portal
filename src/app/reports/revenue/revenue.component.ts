import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { RevenueService } from '../revenue.service';
import { FormBuilder } from '@angular/forms';
import moment from 'moment';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexLegend, ApexNonAxisChartSeries, ApexResponsive, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis, ApexOptions, ApexPlotOptions, ApexMarkers, ApexGrid } from 'ng-apexcharts';
import { ChartExportService } from '../chartexport.service';
declare var bootstrap: any;

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

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  title: ApexTitleSubtitle;
  stroke: ApexStroke;
  fill: ApexFill;
  colors: string[];
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  markers: ApexMarkers;
  grid?: ApexGrid;
};

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  fill: ApexFill;
  stroke: ApexStroke;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  responsive: ApexResponsive[];
  plotOptions?: ApexPlotOptions;
};
@Component({
  selector: 'app-revenue',
  templateUrl: './revenue.component.html',
  styleUrls: ['./revenue.component.scss'],
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

export class RevenueComponent implements OnInit {
  doctorRevenueServices: DoctorRevenueService[] = [];
  doctorRevenueServices1: DoctorRevenueService[] = [];
  doctorRevenueDepartments: DoctorRevenueDepartment[] = [];
  doctorRevenuePayers: DoctorRevenuePayer[] = [];
  doctorRevenuePayers1: DoctorRevenuePayer[] = [];
  doctorRevenueBedTypes: DoctorRevenueBedTypes[] = [];
  doctorRevenueBedTypes1: DoctorRevenueBedTypes[] = [];
  selectedServiceId: number = 2;
  selectedDepartmentId: number = 0;
  selectedDoctorId: string = '';
  selectedPayerId: number = 0;
  visitTypeList: any;
  paymentTypeList: any;
  ClaimpaymentTypeList: any;
  AvgBillpaymentTypeList: any;
  totalRevenue = 0;
  netRevenue = 0;
  discount = 0;
  FetchARMonthlyDoctorRevenueGroupBy3List: any[] = [];
  FetchARMonthlyDoctorRevenueGroupBy4List: any[] = [];
  FetchARMonthlyDoctorRevenueGroupBy5List: any[] = [];
  FetchARMonthlyDoctorRevenueGroupBy6List: any[] = [];
  FetchARMonthlyDoctorRevenueGroupBy8List: any[] = [];
  doctorData: any = [];
  packageList: any[] = [];
  procedureList: any[] = [];
  today: Date = new Date();
  errorMsg = '';

  groupedDepartments: any[] = [];

  datesForm: any;
  hospitalID: any;
  locations = [
    { label: 'Nuzha', value: 3, selected: false },
    { label: 'Suwaidi', value: 2, selected: false }
  ];
  selectedLocation = this.locations[0];

  public visitTypeChart!: DonutChartOptions;
  public paymentTypeChart!: DonutChartOptions;
  public AvgBillpaymentVisitTypeChart!: DonutChartOptions;
  public AvgpaymentTypeChart!: DonutChartOptions;
  public ClaimpaymentTypeChart!: DonutChartOptions;

  showDepartmentList: boolean = false;


  monthlyRevenueChart: ChartOptions = {
    series: [],
    chart: {
      type: 'area',
      height: 300,
      stacked: false,
      toolbar: { show: true }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },

    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: []
    },
    markers: {
      size: 5, // Set the size of the markers
      colors: ['#008FFB'], // Set the color of the markers
      strokeColors: '#fff', // Set the stroke color
      strokeWidth: 2, // Set the stroke width
      hover: {
        size: 7 // Size on hover
      }
    },
    yaxis: [
      {
        title: { text: 'Net Revenue' },
        seriesName: 'Net Revenue'
      },
      {
        title: { text: '' },
        opposite: true,
        seriesName: 'Discount'
      }],
    colors: ['#43a047', '#fbc02d'],
    legend: {
      position: 'top'
    },
    title: {
      text: 'Net Revenue by Month',
      align: 'center',

      // colors:'#383A88'
    }
  };

  monthlyAvgBillChart: ChartOptions = {
    series: [],
    chart: {
      type: 'area',
      height: 300,
      stacked: false,
      toolbar: { show: true }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    markers: {
      size: 5, // Set the size of the markers
      colors: ['#008FFB'], // Set the color of the markers
      strokeColors: '#fff', // Set the stroke color
      strokeWidth: 2, // Set the stroke width
      hover: {
        size: 7 // Size on hover
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: []
    },
    yaxis: [
      {
        title: { text: 'Net Revenue' },
        seriesName: 'Net Revenue'
      },
      {
        title: { text: '' },
        opposite: true,
        seriesName: 'Discount'
      }],
    colors: ['#511281', '#fbc02d'],
    legend: {
      position: 'top'
    },
    title: {
      text: 'Avg Bill by Month',
      align: 'center'
    }
  };

  groupedDoctors: any[] = [];
  selectedDoctor: any = null;
  selectedServices: any = [];
  selectedPayers: any = [];
  selectedLocations: any = [];

  originalPayerData: any[] = [];
  originalCategoryData: any[] = [];
  originalDepartmentData: any[] = [];

  payerSortState: 'none' | 'asc' | 'desc' = 'none';
  categorySortState: 'none' | 'asc' | 'desc' = 'none';
  departmentSortState: 'none' | 'asc' | 'desc' = 'none';

  currentdate: any;
  location: any;
  doctorDetails: any;
  isPrinting = false;
  dashboardData: any;

  constructor(private config: RevenueService, private formBuilder: FormBuilder, private exportService: ChartExportService) {
    this.hospitalID = sessionStorage.getItem("hospitalId");
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    const vm = new Date();
    //vm.setMonth(0);
    vm.setMonth(vm.getMonth() - 4);
    vm.setDate(1);
    vm.setHours(0, 0, 0, 0);

    const vmTodate = new Date();
    vmTodate.setMonth(vmTodate.getMonth() - 1);
    vmTodate.setDate(31);
    vmTodate.setHours(0, 0, 0, 0);

    this.datesForm = this.formBuilder.group({
      fromdate: vm,
      todate: vmTodate//new Date()
    });
    const loc = this.locations.find((x: any) => x.value == this.hospitalID);
    if (loc) {
      loc.selected = true;
    }
  }

  ngOnInit(): void {
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY H:mm');
    this.location = sessionStorage.getItem("locationName");
    this.loadDoctorRevenueData(false);
  }

  private getFormattedDates(): { fromdate: string; todate: string } {
    const fromdate = moment(this.datesForm.get("fromdate")?.value).format('DD-MMM-YYYY');
    const todate = moment(this.datesForm.get("todate")?.value).format('DD-MMM-YYYY');
    return { fromdate, todate };
  }

  loadDoctorRevenueData(pageload: boolean = false): void {
    const { fromdate, todate } = this.getFormattedDates();
    const hospitalId = this.selectedLocation.value;
    this.config.FetchARDoctorRevenueMasterData(fromdate, todate, hospitalId)
      .subscribe({
        next: (data) => {
          if (data?.Code === 200) {
            this.doctorRevenueServices = this.doctorRevenueServices1 = data.FetchARDoctorRevenueMasterServiceDataList || [];
            this.doctorRevenueServices.forEach(element => {
              element.selected = false;
            });
            this.doctorRevenueDepartments = data.FetchARDoctorRevenueMasterDeptDataList || [];
            this.doctorRevenuePayers = this.doctorRevenuePayers1 = data.FetchARDoctorRevenueMasterPayerDataList || [];
            this.doctorRevenuePayers.forEach(element => {
              element.selected = false;
            });
            this.doctorRevenueBedTypes = this.doctorRevenueBedTypes1 = data.FetchARDoctorRevenueMasterBedTypesDataList || [];
            this.doctorRevenueBedTypes.forEach(element => {
              element.selected = false;
            });
            this.groupDoctorsByDepartment(pageload);
            this.onSelectionChange();
          }
        },
        error: (error) => {
          console.error('Error fetching doctor revenue data:', error);
        }
      });
  }

  loadDoctorRevenueGroupedData(): void {
    const { fromdate, todate } = this.getFormattedDates();
    const hospitalId = this.selectedLocation.value;

    if (fromdate && todate && new Date(fromdate) > new Date(todate)) {
      this.showErrorModal("From Date should not be greater than To Date.");
      return;
    }

    let selectedDepts = ''; let selectedDocs = '';

    //this.selectedDepartmentId = this.getSelectedDoctorIds();
    const alldepts = this.groupedDoctors.filter(dep => dep.selected);
    selectedDepts = alldepts?.map((item: any) => item.DepartmentID).join(',');
    const allDoctors = this.groupedDoctors.flatMap(d => d.Doctors);
    const selectedDoctors = allDoctors.filter(doc => doc.selected);
    selectedDocs = selectedDoctors?.map((item: any) => item.DoctorID).join(',');

    let services = '';
    services = this.doctorRevenueServices?.filter((x: any) => x.selected).map((item: any) => item.ServiceID).join(',');

    let payers = '';
    payers = this.doctorRevenuePayers?.filter((x: any) => x.selected).map((item: any) => item.InsuranceComapnyID).join(',');

    let locs = '';
    locs = this.locations?.filter((x: any) => x.selected).map((item: any) => item.value).join(',');
    //locs = this.locations?.filter((x: any) => x.selected).map((item: any) => this.hospitalID).join(',');
    // if(locs == '') {
    //   locs = this.hospitalID.toString();
    // }

    let bedTypes = '';
    bedTypes = this.doctorRevenueBedTypes?.filter((x: any) => x.selected).map((item: any) => item.BedTypeID).join(',');

    const payload = {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: locs === '' ? "0" : locs,
      ServiceID: services === '' ? "0" : services,
      DepartmentID: selectedDepts === '' ? "0" : selectedDepts,
      PayerID: payers === '' ? "0" : payers,
      DoctorID: selectedDocs === '' ? "0" : selectedDocs,
      BedTypes: bedTypes === '' ? "0" : bedTypes,
      //IsDefaultAll: (locs === '' && services === '' && selectedDepts === '' && payers  === '' && selectedDocs  === '' && bedTypes === '') ? 1 : 0
      IsDefaultAll: (services === '' && selectedDepts === '' && payers === '' && selectedDocs === '' && bedTypes === '') ? 1 : 0
    }

    this.config.FetchARMonthlyDoctorRevenueGroupBy(payload).subscribe({
      next: (data) => {
        if (data.FetchARMonthlyDoctorRevenueGroupBy1List.length === 0) {
          this.clearAllCharts();
          return;
        }

        this.visitTypeList = data.FetchARMonthlyDoctorRevenueGroupBy1List;
        this.paymentTypeList = data.FetchARMonthlyDoctorRevenueGroupBy2List;
        this.ClaimpaymentTypeList = data.FetchARMonthlyDoctorRevenueGroupBy9List;


        this.FetchARMonthlyDoctorRevenueGroupBy3List = data.FetchARMonthlyDoctorRevenueGroupBy3List;
        this.FetchARMonthlyDoctorRevenueGroupBy4List =
          (data.FetchARMonthlyDoctorRevenueGroupBy4List || []).sort((a: any, b: any) => b.Net - a.Net);

        this.FetchARMonthlyDoctorRevenueGroupBy5List =
          (data.FetchARMonthlyDoctorRevenueGroupBy5List || []).sort((a: any, b: any) => b.Net - a.Net);
        this.FetchARMonthlyDoctorRevenueGroupBy6List = data.FetchARMonthlyDoctorRevenueGroupBy6List || [];

        this.FetchARMonthlyDoctorRevenueGroupBy8List = data.FetchARMonthlyDoctorRevenueGroupBy8List || [];

        this.calculateRevenueSummary();
        this.initializeDonutCharts();
        this.loadMonthlyRevenueChart();
        this.loadAvgMonthlyRevenueChart();
        this.groupByDepartment();
        this.storeOriginalData();
      },
      error: (error) => {
        console.error('Error fetching grouped revenue data:', error);
      }
    });
  }

  initializeDonutCharts(): void {
    const inPatient = this.visitTypeList.find((pt: any) => pt.PatientTypeID === "2");
    const outPatient = this.visitTypeList.find((pt: any) => pt.PatientTypeID === "1");

    const inPatientNet = parseFloat(inPatient?.Net || '0');
    const outPatientNet = parseFloat(outPatient?.Net || '0');

    const companyNetValues = this.paymentTypeList.map((p: any) => parseFloat(p.Net || '0'));
    const companyLabels = this.paymentTypeList.map((p: any) => p.CompanyType);


    const AvgcompanyNetValues = this.paymentTypeList.map((p: any) => parseFloat(p.AvgNet || '0'));


    const AvgClaimcompanyNetValues = this.ClaimpaymentTypeList.map((p: any) => parseFloat(p.AvgNet || '0'));
    const AvgClaimcompanyLabels = this.ClaimpaymentTypeList.map((p: any) => p.CompanyType);



    const inPatientNetAvg = parseFloat(inPatient?.AvgNet || '0');
    const outPatientNetAvg = parseFloat(outPatient?.AvgNet || '0');



    this.visitTypeChart = {
      series: [inPatientNet, outPatientNet],
      chart: {
        type: 'donut',
        width: '100%',
        height: '250px',
      },
      labels: ['IP', 'OP'],
      colors: ['#B39FD6', '#DEB4DA'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          gradientToColors: ['#B39FD6', '#DEB4DA'],
          inverseColors: true,
          opacityFrom: 0.9,
          opacityTo: 1,
          stops: [0, 90, 100]
        }
      },
      stroke: {
        show: true,
        width: 8,
        colors: ['#fff']
      },
      legend: {
        position: 'bottom',
        fontSize: "10px"
      },
      title: {
        text: 'Net Revenue by Visit Type',
        align: 'center',
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#383A88'
        }
      },
      tooltip: {
        y: {
          // formatter: (val: number) => val.toLocaleString('en-IN')
          formatter: (val: number) =>
            val.toLocaleString('en-US', {
              minimumIntegerDigits: 1,
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            })
        }
      },
      // dataLabels: {
      //   enabled: true,
      //   formatter: (val, opts) => {
      //     const value = opts.w.config.series[opts.seriesIndex];         
      //     return `${Number(val).toFixed(1)}%`;
      //   },
      //   style: {
      //     fontSize: '12px',
      //     fontWeight: 'bold',
      //     colors: ['#FBFBFB']
      //   },
      //   dropShadow: {
      //     enabled: false
      //   }
      // },
      dataLabels: {
        enabled: true,
        enabledOnSeries: undefined,
        formatter: (val, opts) => {
          const value = opts.w.config.series[opts.seriesIndex];

          return `${Number(val).toFixed(1)}%`;
        },
        textAnchor: 'middle',
        distributed: false,
        offsetX: 0,
        offsetY: 0,
        style: {
          fontSize: '10px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          colors: ['#F5F5F7'],
        },
        background: {
          enabled: true,
          foreColor: '#000000',
          padding: 15,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: '#C7C8CC',
          opacity: 0.6,

          dropShadow: {
            enabled: true,
            top: 19,
            left: 10,
            blur: 9,
            color: undefined,
            opacity: 0.5
          }
        },
        dropShadow: {
          enabled: false,
          top: 1,
          left: 1,
          blur: 1,
          color: '#000',
          opacity: 0.1
        }
      },
      responsive: [
        {
          breakpoint: 1600,
          options: {
            chart: { width: '100%' },
            legend: { position: 'bottom', fontSize: "10px" }
          }
        },
        {
          breakpoint: 480,
          options: {
            chart: {
              width: '100%'
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ],
      // plotOptions: {
      //   pie: {
      //     startAngle: 0,
      //     endAngle: 360,
      //     expandOnClick: true,
      //     offsetX: 0,
      //     offsetY: 0,
      //     customScale: 1,
      //     dataLabels: {
      //       offset: 2,
      //       minAngleToShowLabel: 45,
      //     },
      //     donut: {
      //       size: '50%',
      //       background: 'transparent',
      //       labels: {
      //         show: false,
      //         name: {
      //           show: true,
      //           fontSize: '22px',
      //           fontFamily: 'Helvetica, Arial, sans-serif',
      //           fontWeight: 600,
      //           color: undefined,
      //           offsetY: -2,
      //           formatter: function (val) {
      //             return val
      //           }
      //         },
      //         value: {
      //           show: true,
      //           fontSize: '16px',
      //           fontFamily: 'Helvetica, Arial, sans-serif',
      //           fontWeight: 400,
      //           color: undefined,
      //           offsetY: 2,
      //           formatter: function (val) {
      //             return val
      //           }
      //         },

      //       }
      //     },
      //   }
      // }
      plotOptions: {
        pie: {

          donut: {
            size: '50%',
            labels: { show: false },


          },
          dataLabels: {
            offset: 20,

          },

        }
      }
    };

    this.paymentTypeChart = {
      series: companyNetValues,
      chart: {
        type: 'donut',
        width: '100%',
        height: '250px',

      },
      labels: companyLabels,
      colors: ['#9CAB84', '#89986D', '#C5D89D'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          gradientToColors: ['#9CAB84', '#89986D', '#C5D89D'],
          inverseColors: true,
          opacityFrom: 0.9,
          opacityTo: 1,
          stops: [0, 90, 100]
        }
      },
      stroke: {
        show: true,
        width: 8,
        colors: ['#fff']
      },
      legend: {
        position: 'bottom',
        fontSize: "10px"
      },
      title: {
        text: 'Net Revenue by Payment Type',
        align: 'center',
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#383A88'
        }
      },
      tooltip: {
        y: {

          // formatter: (val: number) => val.toLocaleString('en-IN')
          formatter: (val: number) =>
            val.toLocaleString('en-US', {
              minimumIntegerDigits: 1,
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            })
        }
      },

      dataLabels: {
        enabled: true,
        enabledOnSeries: undefined,
        formatter: (val, opts) => {
          const value = opts.w.config.series[opts.seriesIndex];

          return `${Number(val).toFixed(1)}%`;
        },
        textAnchor: 'middle',
        distributed: false,
        offsetX: 0,
        offsetY: 0,
        style: {
          fontSize: '10px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          colors: ['#F5F5F7'],
        },
        background: {
          enabled: true,
          foreColor: '#000000',
          padding: 15,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: '#C7C8CC',
          opacity: 0.6,

          dropShadow: {
            enabled: true,
            top: 19,
            left: 10,
            blur: 9,
            color: undefined,
            opacity: 0.5
          }
        },
        dropShadow: {
          enabled: false,
          top: 1,
          left: 1,
          blur: 1,
          color: '#000',
          opacity: 0.1
        }
      },
      responsive: [
        {
          breakpoint: 1600,
          options: {
            chart: { width: '100%' },
            legend: { position: 'bottom', fontSize: "10px" }
          }
        },
        {
          breakpoint: 480,
          options: {
            chart: { width: '100%' },
            legend: { position: 'bottom', fontSize: "10px" }
          }
        }
      ],

      plotOptions: {
        pie: {

          donut: {
            size: '50%',
            labels: { show: false },


          },
          dataLabels: {
            offset: 20,

          },

        }
      }

    };

    this.AvgpaymentTypeChart = {
      series: AvgcompanyNetValues,
      chart: {
        type: 'donut',
        width: '100%',
        height: '250px',
        events: {
          dataPointMouseEnter: (event, chartContext, config) => {
            chartContext.updateOptions({
              colors: config.seriesIndex === 0
                ? ['#89986D', '#C5D89D']
                : ['#89986D', '#C5D89D']
            }, false, false);
          },
          dataPointMouseLeave: (event, chartContext) => {
            chartContext.updateOptions({
              colors: ['#C5D89D', '#89986D']
            }, false, false);
          }
        }



      },
      labels: companyLabels,
      //colors: ['#F1B6B6', '#E2D1D6', '#92A0E2'],
      colors: ['#9CAB84', '#89986D', '#C5D89D'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          // gradientToColors: ['#F1B6B6', '#E2D1D6', '#92A0E2'],
          gradientToColors: ['#9CAB84', '#89986D', '#C5D89D'],
          inverseColors: true,
          opacityFrom: 0.9,
          opacityTo: 1,
          stops: [0, 90, 100]
        }
      },
      stroke: {
        show: true,
        width: 8,
        colors: ['#fff'],
        lineCap: 'round',
        curve: 'straight',
      },

      legend: {
        show: true,
        position: 'bottom',
        fontSize: "10px"
      },
      title: {
        text: 'Avg Bill by Payment Type',
        align: 'center',
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#383A88'
        }
      },
      tooltip: {
        y: {
          //formatter: (val: number) => val.toLocaleString('en-IN')
          formatter: (val: number) =>
            val.toLocaleString('en-US', {
              minimumIntegerDigits: 1,
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            })
        }
      },

      dataLabels: {
        enabled: true,
        enabledOnSeries: undefined,
        formatter: (val, opts) => {
          const value = opts.w.config.series[opts.seriesIndex];
          return `${Number(value)}`;
          // return `${Number(val).toFixed(1)}%`;
        },
        textAnchor: 'middle',
        distributed: false,
        offsetX: 0,
        offsetY: 0,
        style: {
          fontSize: '10px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          colors: ['#F5F5F7'],
        },
        background: {
          enabled: true,
          foreColor: '#000000',
          padding: 15,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: '#C7C8CC',
          opacity: 0.6,

          dropShadow: {
            enabled: true,
            top: 19,
            left: 10,
            blur: 9,
            color: undefined,
            opacity: 0.5
          }
        },
        dropShadow: {
          enabled: false,
          top: 1,
          left: 1,
          blur: 1,
          color: '#000',
          opacity: 0.1
        }
      },
      responsive: [
        {
          breakpoint: 1600,
          options: {
            chart: { width: '100%' },
            legend: { position: 'bottom', fontSize: "10px" }
          }
        },
        {
          breakpoint: 480,
          options: {
            chart: { width: '100%' },
            legend: { position: 'bottom', fontSize: "10px" }
          }
        }
      ],

      plotOptions: {
        pie: {

          donut: {
            size: '50%',
            labels: { show: false },


          },
          dataLabels: {
            offset: 20,

          },

        }
      }
    };

    this.AvgBillpaymentVisitTypeChart = {
      series: [inPatientNetAvg, outPatientNetAvg],
      chart: {
        type: 'donut',
        width: '100%',
        height: '250px',
      },
      labels: ['IP', 'OP'],
      //colors: ['#8FE0EC', '#E1DDEA'],
      colors: ['#B39FD6', '#DEB4DA'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          //gradientToColors: ['#8FE0EC', '#E1DDEA'],
          gradientToColors: ['#B39FD6', '#DEB4DA'],
          inverseColors: true,
          opacityFrom: 0.9,
          opacityTo: 1,
          stops: [0, 90, 100]
        }
      },
      stroke: {
        show: true,
        width: 8,
        colors: ['#fff']
      },
      legend: {
        position: 'bottom',
        fontSize: "10px"
      },
      title: {
        text: 'Avg Bill by Visit Type',
        align: 'center',
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#383A88'
        }
      },
      tooltip: {
        y: {
          // formatter: (val: number) => val.toLocaleString('en-IN')
          formatter: (val: number) =>
            val.toLocaleString('en-US', {
              minimumIntegerDigits: 1,
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            })
        }
      },

      dataLabels: {
        enabled: true,
        enabledOnSeries: undefined,
        formatter: (val, opts) => {
          const value = opts.w.config.series[opts.seriesIndex];
          return `${Number(value)}`;
          //return `${Number(val).toFixed(1)}%`;
        },
        textAnchor: 'middle',
        distributed: false,
        offsetX: 0,
        offsetY: 0,
        style: {
          fontSize: '10px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          colors: ['#F5F5F7'],
        },
        background: {
          enabled: true,
          foreColor: '#000000',
          padding: 15,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: '#C7C8CC',
          opacity: 0.6,

          dropShadow: {
            enabled: true,
            top: 19,
            left: 10,
            blur: 9,
            color: undefined,
            opacity: 0.5
          }
        },
        dropShadow: {
          enabled: false,
          top: 1,
          left: 1,
          blur: 1,
          color: '#000',
          opacity: 0.1
        }
      },
      responsive: [
        {
          breakpoint: 1600,
          options: {
            chart: { width: '100%' },
            legend: { position: 'bottom', fontSize: "10px" }
          }
        },
        {
          breakpoint: 480,
          options: {
            chart: { width: '100%' },
            legend: { position: 'bottom', fontSize: "10px" }
          }
        }
      ],
      plotOptions: {
        pie: {

          donut: {
            size: '50%',
            labels: { show: false },


          },
          dataLabels: {
            offset: 20,

          },

        }
      }
    };

    this.ClaimpaymentTypeChart = {
      series: AvgClaimcompanyNetValues,
      chart: {
        type: 'donut',
        width: '100%',
        height: '250px',


        events: {
          dataPointMouseEnter: (event, chartContext, config) => {
            const defaultColors = ['#89986D', '#C5D89D'];

            const hoverColorMap = [
              '#6aa070', // hover color for slice 0
              '#6F8F72'  // hover color for slice 1
            ];

            const hoverColors = [...defaultColors];
            hoverColors[config.seriesIndex] = hoverColorMap[config.seriesIndex];

            chartContext.updateOptions(
              { colors: hoverColors },
              false,
              false
            );
          },

          dataPointMouseLeave: (event, chartContext) => {
            chartContext.updateOptions(
              { colors: ['#C5D89D', '#89986D'] },
              false,
              false
            );
          }
        }


      },
      labels: AvgClaimcompanyLabels,

      colors: ['#C5D89D', '#89986D'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,

          gradientToColors: ['#C5D89D', '#89986D'],

          inverseColors: true,
          opacityFrom: 0.9,
          opacityTo: 1,
          stops: [0, 90, 100]
        }
      },
      stroke: {
        show: true,
        width: 8,
        colors: ['#fff']
      },
      legend: {
        position: 'bottom',
        fontSize: "10px"
      },
      title: {
        text: 'Avg Bill by Claim Type',
        align: 'center',
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#383A88'
        }
      },
      tooltip: {
        y: {
          //formatter: (val: number) => val.toLocaleString('en-IN')
          formatter: (val: number) =>
            val.toLocaleString('en-US', {
              minimumIntegerDigits: 1,
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            })
        }
      },

      dataLabels: {
        enabled: true,
        enabledOnSeries: undefined,
        formatter: (val, opts) => {
          const value = opts.w.config.series[opts.seriesIndex];
          return `${Number(value)}`;
          //return `${Number(val).toFixed(1)}%`;
        },
        textAnchor: 'middle',
        distributed: false,
        offsetX: 0,
        offsetY: 0,
        style: {
          fontSize: '10px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          colors: ['#F5F5F7'],
        },
        background: {
          enabled: true,
          foreColor: '#000000',
          padding: 15,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: '#C7C8CC',
          opacity: 0.6,

          dropShadow: {
            enabled: true,
            top: 19,
            left: 10,
            blur: 9,
            color: undefined,
            opacity: 0.5
          }
        },
        dropShadow: {
          enabled: false,
          top: 1,
          left: 1,
          blur: 1,
          color: '#000',
          opacity: 0.1
        }
      },
      responsive: [
        {
          breakpoint: 1600,
          options: {
            chart: { width: '100%' },
            legend: { position: 'bottom', fontSize: "10px" }
          }
        },
        {
          breakpoint: 480,
          options: {
            chart: { width: '100%' },
            legend: { position: 'bottom', fontSize: "10px" }
          }
        }
      ],

      plotOptions: {
        pie: {

          donut: {
            size: '50%',
            labels: { show: false },


          },
          dataLabels: {
            offset: 20,

          },

        }
      }
    };

  }

  onSelectionChange(): void {
    this.loadDoctorRevenueGroupedData();
  }

  calculateRevenueSummary() {
    // this.totalRevenue = this.visitTypeList.reduce(
    //   (sum: any, v: any) => sum + parseFloat(v.Gross || '0'),
    //   0
    // );
    // this.netRevenue = this.visitTypeList.reduce(
    //   (sum: any, v: any) => sum + parseFloat(v.Net || '0'),
    //   0
    // );
    // this.discount = this.visitTypeList.reduce(
    //   (sum: any, v: any) => sum + parseFloat(v.Discount || '0'),
    //   0
    // );
    this.totalRevenue = this.FetchARMonthlyDoctorRevenueGroupBy8List[0].TotalGross;
    this.netRevenue = this.FetchARMonthlyDoctorRevenueGroupBy8List[0].TotalNet;
    this.discount = this.FetchARMonthlyDoctorRevenueGroupBy8List[0].TotalDiscount;
  }

  formatValue(value: number): string {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + 'B';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(2) + 'k';
    return value.toFixed(2);
  }

  loadMonthlyRevenueChart() {
    const list = this.FetchARMonthlyDoctorRevenueGroupBy3List;
    const groupedByYear: { [year: string]: { [month: string]: number } } = {};

    list.forEach((item: any) => {
      const year = item.YearID?.toString() || 'Unknown';
      const month = item.MonthName;
      const net = parseFloat(item.Net || '0');

      if (!groupedByYear[year]) groupedByYear[year] = {};
      groupedByYear[year][month] = net;
    });

    const months = Array.from(new Set(list.map((item: any) => item.MonthName)));

    const series = Object.entries(groupedByYear).map(([year, dataByMonth]) => ({
      name: `${year} Net Revenue`,
      data: months.map(month => dataByMonth[month] || 0)
    }));

    this.monthlyRevenueChart.series = series;

    this.monthlyRevenueChart.chart = {
      type: 'area',
      height: 300,
      toolbar: { show: true },
      zoom: { enabled: false },
    };

    this.monthlyRevenueChart.stroke = {
      curve: 'smooth',
      width: 3,
      colors: ['#78C841']
    };

    this.monthlyRevenueChart.fill = {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: ['#78C841'],
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    };

    this.monthlyRevenueChart.markers = {
      size: 5,
      strokeWidth: 2,
      strokeColors: '#78C841',
      colors: ['#78C841'],
      hover: {
        size: 7
      }
    };

    this.monthlyRevenueChart.dataLabels = {
      enabled: true,
      formatter: (val: number) => this.formatValue(val),
      offsetY: -5,
      style: {
        fontSize: '10px',
        colors: ['#78C841']
      }
    };

    this.monthlyRevenueChart.xaxis = {
      categories: months,
      labels: {
        offsetX: 0
      }
    };

    this.monthlyRevenueChart.yaxis = [
      {
        seriesName: 'Net Revenue',
        title: {
          text: '',
          offsetX: -10,
          rotate: -90,
          style: {
            fontSize: '12px',
            fontWeight: 600
          }
        },
        labels: {
          formatter: (val: number) => this.formatValue(val)
        }
      }
    ];

    (this.monthlyRevenueChart as any).grid = {
      padding: {
        left: 60,
        right: 20,
        top: 10,
        bottom: 10
      }
    };

    this.monthlyRevenueChart.legend = {
      show: false
    };
  }


  loadAvgMonthlyRevenueChart() {
    const list = this.FetchARMonthlyDoctorRevenueGroupBy3List;
    const groupedAvg: { [year: string]: { [month: string]: number } } = {};

    list.forEach((item: any) => {
      const year = item.YearID?.toString() || 'Unknown';
      const month = item.MonthName;
      const avgNet = parseFloat(item.AvgNet || '0');

      if (!groupedAvg[year]) groupedAvg[year] = {};
      groupedAvg[year][month] = avgNet;
    });

    const months = Array.from(new Set(list.map((item: any) => item.MonthName)));

    const series = Object.entries(groupedAvg).map(([year, dataByMonth]) => ({
      name: `${year} Avg Net Revenue`,
      data: months.map(month => dataByMonth[month] || 0)
    }));

    this.monthlyAvgBillChart.series = series;

    this.monthlyAvgBillChart.chart = {
      type: 'area',
      height: 300,
      toolbar: { show: true },
      zoom: { enabled: false },
    };

    this.monthlyAvgBillChart.stroke = {
      curve: 'smooth',
      width: 3,
      colors: ['#500073']
    };

    this.monthlyAvgBillChart.fill = {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: ['#500073'],
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    };

    this.monthlyAvgBillChart.markers = {
      size: 5,
      strokeWidth: 2,
      strokeColors: '#500073',
      colors: ['#500073'],
      hover: {
        size: 7
      }
    };

    this.monthlyAvgBillChart.dataLabels = {
      enabled: true,
      formatter: (val: number) => this.formatValue(val),
      offsetY: -5,
      style: {
        fontSize: '10px',
        colors: ['#500073']
      }
    };

    this.monthlyAvgBillChart.xaxis = {
      categories: months,
      labels: {
        offsetX: 0
      }
    };

    this.monthlyAvgBillChart.yaxis = [
      {
        seriesName: 'Net Revenue',
        title: {
          text: '',
          offsetX: -10,
          rotate: -90,
          style: {
            fontSize: '12px',
            fontWeight: 600
          }
        },
        labels: {
          formatter: (val: number) => this.formatValue(val)
        }
      }
    ];

    (this.monthlyAvgBillChart as any).grid = {
      padding: {
        left: 60,
        right: 20,
        top: 10,
        bottom: 10
      }
    };

    this.monthlyAvgBillChart.legend = {
      show: false
    };

    // this.monthlyAvgBillChart.xaxis = {
    //   ...this.monthlyAvgBillChart.xaxis,
    //   categories: months,
    //   labels: {
    //     offsetX: 0
    //   }
    // };

    // this.monthlyAvgBillChart.yaxis = [
    //   {
    //     seriesName: 'Net Revenue',
    //     title: { text: 'Net Revenue' },
    //     labels: {
    //       formatter: (val: number) => this.formatValue(val)
    //     }
    //   }
    // ];

    // this.monthlyAvgBillChart.markers = {
    //   size: 4,
    //   hover: {
    //     size: 6
    //   },
    //   strokeColors: "#fff"
    // };

    // this.monthlyAvgBillChart.dataLabels = {
    //   enabled: true,
    //   formatter: (val: number) => this.formatValue(val),
    //   offsetX: 10,
    // };
  }

  get totalNetRevenueByPayer(): number {
    return this.FetchARMonthlyDoctorRevenueGroupBy4List.reduce((sum, item) => {
      return sum + parseFloat(item.Net || '0');
    }, 0);
  }

  calculatePayerPercentage(net: string): string {
    const netValue = parseFloat(net || '0');
    const total = this.totalNetRevenueByPayer;
    if (total === 0) return '0%';
    return ((netValue / total) * 100).toFixed(1) + '%';
  }

  get totalDepartmentNet(): number {
    return this.FetchARMonthlyDoctorRevenueGroupBy5List.reduce((acc, curr) => {
      return acc + parseFloat(curr.Net || '0');
    }, 0);
  }

  getDeptNetPercentage(net: string): string {
    const netValue = parseFloat(net || '0');
    const total = this.totalDepartmentNet;
    if (total === 0) return '0%';
    return ((netValue / total) * 100).toFixed(1) + '%';
  }

  groupByDepartment() {
    const groups = new Map<number, any>();

    for (const doc of this.FetchARMonthlyDoctorRevenueGroupBy6List) {
      const deptId = doc.DepartmentID;

      if (!groups.has(deptId)) {
        groups.set(deptId, {
          DepartmentID: deptId,
          DepartmentName: doc.DepartmentName,
          Doctors: [],
          Expanded: false,
        });
      }

      groups.get(deptId).Doctors.push(doc);
    }

    this.groupedDepartments = Array.from(groups.values());

    this.groupedDepartments = this.groupedDepartments.sort(
      (a, b) => this.getDepartmentTotalNet(b) - this.getDepartmentTotalNet(a)
    );

    this.groupedDepartments.forEach(dept => {
      dept.Doctors = (dept.Doctors || []).sort((a: any, b: any) => b.Net - a.Net);
    });
  }

  getDepartmentTotalNet(department: any): number {
    return department.Doctors.reduce((acc: number, d: any) => acc + parseFloat(d.Net || '0'), 0);
  }
  getDepartmentTotalNetPer(department: any): number {
    return department.Doctors.reduce((acc: number, d: any) => acc + parseFloat(d.NetPer || '0'), 0);
  }

  getDoctorPercentage(dept: any, doctor: any): string {
    const total = this.getDepartmentTotalNet(dept);
    if (total === 0) return '0%';
    return ((parseFloat(doctor.Net || '0') / total) * 100).toFixed(1) + '%';
  }

  getTotalNet(): number {
    let total = 0;
    for (const dept of this.groupedDepartments) {
      for (const doc of dept.Doctors) {
        total += Number(doc.Net) || 0;
      }
    }
    return total;
  }

  getTotalPercentage(): string {
    return '100%';
  }

  groupDoctorsByDepartment(pageload: boolean = false) {
    const map = new Map<string, any>();

    for (const doc of this.doctorRevenueDepartments) {
      const deptId = doc.DepartmentID;
      if (!map.has(deptId)) {
        map.set(deptId, {
          DepartmentID: deptId,
          DepartmentName: doc.DepartmentName,
          selected: pageload,
          Expanded: true,
          Doctors: []
        });
      }
      map.get(deptId).Doctors.push({
        DoctorID: doc.DoctorID,
        DoctorName: doc.DoctorName,
        selected: pageload
      });
    }

    this.groupedDoctors = Array.from(map.values());
  }

  selectAll(value: boolean) {
    this.groupedDoctors.forEach(dept => {
      dept.selected = value;
      dept.Doctors.forEach((doc: any) => doc.selected = value);
    });
  }

  toggleDepartment(dept: any, value: boolean) {
    dept.selected = !dept.selected;
    dept.Doctors.forEach((doc: any) => doc.selected = dept.selected);
    //this.loadDoctorRevenueGroupedData();
  }

  onDoctorChange(dept: any) {
    dept.selected = dept.Doctors.every((doc: any) => doc.selected);
  }

  getSelectedDoctors(): any[] {
    return this.groupedDoctors
      .flatMap(dept => dept.Doctors.filter((doc: any) => doc.selected));
  }

  getSelectAllStatus(): boolean {
    return this.groupedDoctors?.length ? this.groupedDoctors.every(d => d.selected) : false
  }

  getSelectedDoctorIds(): number {
    if (!this.groupedDoctors?.length) return 0;

    const allDoctors = this.groupedDoctors.flatMap(d => d.Doctors);
    const selectedDoctors = allDoctors.filter(doc => doc.selected);

    if (selectedDoctors.length === allDoctors.length) {
      return 0;
    }

    return selectedDoctors.length ? +selectedDoctors[0].DoctorID : 0;
  }

  openDoctorDetails(doc: any) {
    this.selectedDoctor = doc;
    this.loadDoctorPopup();
  }

  loadDoctorPopup(): void {
    const { fromdate, todate } = this.getFormattedDates();
    const hospitalId = this.selectedLocation.value;

    this.config.FetchARDoctorPayoutReportNew(fromdate, todate, this.selectedDoctor?.DoctorID, hospitalId)
      .subscribe({
        next: (data) => {
          if (data?.Code === 200) {
            this.doctorData = data.FetchARDoctorPayoutReportNewData1List[0];
            this.packageList = data.FetchARDoctorPayoutReportNewData2List.filter((x: any) => x.ServiceName.toUpperCase() === 'PACKAGE');
            this.procedureList = data.FetchARDoctorPayoutReportNewData2List.filter((x: any) => x.ServiceName.toUpperCase() === 'PROCEDURES');
          }
        },
        error: (error) => {
          console.error('Error fetching doctor revenue data:', error);
        }
      });
  }

  getTotal(list: any[]): number {
    return list.reduce((total, item) => total + Number(item.Count), 0);
  }

  clearFilters() {
    this.clearAllCharts();
    this.resetAllSorts();
    const vm = new Date();
    vm.setMonth(0);
    vm.setDate(1);
    vm.setHours(0, 0, 0, 0);

    this.datesForm.patchValue({
      fromdate: vm,
      todate: new Date()
    });

    // this.locations.forEach(loc => {
    //   loc.selected = false;
    // });
    const loc = this.locations.find((x: any) => x.value == this.hospitalID);
    if (loc) {
      loc.selected = true;
    }

    this.selectedLocation = this.locations[0];
    this.selectedServiceId = 0;
    this.selectedPayerId = 0;

    this.groupedDoctors.forEach(dept => {
      dept.selected = false;
      dept.Expanded = false;
      dept.Doctors.forEach((doc: any) => doc.selected = false);
    });

    this.doctorRevenueServices.forEach(element => {
      element.selected = false;
    });
    this.doctorRevenuePayers.forEach(element => {
      element.selected = false;
    });
    this.doctorRevenueBedTypes.forEach(element => {
      element.selected = false;
    });

    this.onSelectionChange();
  }

  showErrorModal(error: string) {
    this.errorMsg = error;
    let modal = new bootstrap.Modal(document.getElementById('errorMsg'));
    modal.show();
  }

  clearAllCharts() {
    const emptySeries: any = [];
    const emptyXaxis = { categories: [] };

    if (this.paymentTypeChart) {
      this.paymentTypeChart.series = emptySeries;
      this.visitTypeChart.series = emptySeries;
      this.AvgpaymentTypeChart.series = emptySeries;
      this.AvgBillpaymentVisitTypeChart.series = emptySeries;
      this.ClaimpaymentTypeChart.series = emptySeries;

      this.monthlyRevenueChart.series = emptySeries;
      this.monthlyRevenueChart.xaxis = emptyXaxis;
      this.monthlyAvgBillChart.series = emptySeries;
      this.monthlyAvgBillChart.xaxis = emptyXaxis;

      this.FetchARMonthlyDoctorRevenueGroupBy3List = [];
      this.FetchARMonthlyDoctorRevenueGroupBy4List = [];
      this.FetchARMonthlyDoctorRevenueGroupBy5List = [];
      this.FetchARMonthlyDoctorRevenueGroupBy6List = [];
      this.FetchARMonthlyDoctorRevenueGroupBy8List = [];
      this.groupedDepartments = [];
    }
  }

  getSelectAllServicesStatus(): boolean {
    return this.doctorRevenueServices?.length ? this.doctorRevenueServices.every(d => d.selected) : false
  }

  selectAllServices(value: boolean) {
    this.doctorRevenueServices.forEach(ser => {
      ser.selected = value;
    });
  }

  serviceOptionClicked(event: Event, item: any) {
    event.stopPropagation();
    this.toggleServiceSelection(item);
  }

  toggleServiceSelection(item: any) {
    item.selected = !item.selected;
  }

  getSelectAllPayersStatus(): boolean {
    return this.doctorRevenuePayers?.length ? this.doctorRevenuePayers.every(d => d.selected) : false
  }

  selectAllPayers(value: boolean) {
    this.doctorRevenuePayers.forEach(ser => {
      ser.selected = value;
    });
  }

  payerOptionClicked(event: Event, item: any) {
    event.stopPropagation();
    this.togglePayerSelection(item);
  }

  togglePayerSelection(item: any) {
    item.selected = !item.selected;
  }

  getSelectAllBedTypesStatus(): boolean {
    return this.doctorRevenueBedTypes?.length ? this.doctorRevenueBedTypes.every(d => d.selected) : false
  }

  selectAllBedTypes(value: boolean) {
    this.doctorRevenueBedTypes.forEach(ser => {
      ser.selected = value;
    });
  }

  bedTypeOptionClicked(event: Event, item: any) {
    event.stopPropagation();
    this.toggleBedTypeSelection(item);
  }

  toggleBedTypeSelection(item: any) {
    item.selected = !item.selected;

  }

  locationOptionClicked(event: Event, item: any) {
    event.stopPropagation();
    this.toggleLocationSelection(item);
  }

  toggleLocationSelection(item: any) {
    item.selected = !item.selected;
  }

  storeOriginalData() {
    this.originalPayerData = [...this.FetchARMonthlyDoctorRevenueGroupBy4List];
    this.originalCategoryData = [...this.FetchARMonthlyDoctorRevenueGroupBy5List];
    this.originalDepartmentData = [...this.groupedDepartments];
  }

  sortPayerByNet() {
    if (this.payerSortState === 'none' || this.payerSortState === 'desc') {
      this.FetchARMonthlyDoctorRevenueGroupBy4List.sort((a, b) => a.Net - b.Net);
      this.payerSortState = 'asc';
    } else {
      this.FetchARMonthlyDoctorRevenueGroupBy4List.sort((a, b) => b.Net - a.Net);
      this.payerSortState = 'desc';
    }
  }

  sortCategoryByNet() {
    if (this.categorySortState === 'none' || this.categorySortState === 'desc') {
      this.FetchARMonthlyDoctorRevenueGroupBy5List.sort((a, b) => a.Net - b.Net);
      this.categorySortState = 'asc';
    } else {
      this.FetchARMonthlyDoctorRevenueGroupBy5List.sort((a, b) => b.Net - a.Net);
      this.categorySortState = 'desc';
    }
  }

  sortDepartmentByNet() {
    if (this.departmentSortState === 'none' || this.departmentSortState === 'desc') {
      this.groupedDepartments.sort((a, b) => {
        const aTotal = this.getDepartmentTotalNet(a);
        const bTotal = this.getDepartmentTotalNet(b);
        return aTotal - bTotal;
      });
      this.departmentSortState = 'asc';
    } else {
      this.groupedDepartments.sort((a, b) => {
        const aTotal = this.getDepartmentTotalNet(a);
        const bTotal = this.getDepartmentTotalNet(b);
        return bTotal - aTotal;
      });
      this.departmentSortState = 'desc';
    }
  }

  getPayerSortIcon(): string {
    switch (this.payerSortState) {
      case 'asc': return '↑';
      case 'desc': return '↓';
      default: return '↕';
    }
  }

  getCategorySortIcon(): string {
    switch (this.categorySortState) {
      case 'asc': return '↑';
      case 'desc': return '↓';
      default: return '↕';
    }
  }

  getDepartmentSortIcon(): string {
    switch (this.departmentSortState) {
      case 'asc': return '↑';
      case 'desc': return '↓';
      default: return '↕';
    }
  }

  resetAllSorts() {
    this.FetchARMonthlyDoctorRevenueGroupBy4List = [...this.originalPayerData];
    this.FetchARMonthlyDoctorRevenueGroupBy5List = [...this.originalCategoryData];
    this.groupedDepartments = [...this.originalDepartmentData];

    this.payerSortState = 'none';
    this.categorySortState = 'none';
    this.departmentSortState = 'none';
  }

  exportNetRevenueByPaymentType(format: string) {
    const data = this.exportService.formatPieChartData(
      this.paymentTypeList,
      'CompanyType',
      'Net',
      'NetPer'
    );

    const filename = `Net_Revenue_by_Payment_Type_${new Date().toISOString()}`
    this.handleExport(data, filename, format, 'netRevenuePaymentChart');
  }

  exportNetRevenueByVisitType(format: string) {
    const data = this.exportService.formatPieChartData(
      this.visitTypeList,
      'PatientType',
      'Net',
      'NetPer'
    );

    const filename = `Net_Revenue_by_Payment_Type_${new Date().toISOString()}`
    this.handleExport(data, filename, format, 'netRevenueVisitChart');
  }

  exportAvgBillByPaymentType(format: string) {
    const data = this.exportService.formatPieChartData(
      this.paymentTypeList,
      'CompanyType',
      'AvgNet',
      'AvgNetPer'
    );

    const filename = `Avg_Bill_by_Payment_Type_${new Date().toISOString()}`
    this.handleExport(data, filename, format, 'avgBillPaymentChart');
  }

  exportAvgBillByVisitType(format: string) {
    const data = this.exportService.formatPieChartData(
      this.visitTypeList,
      'PatientType',
      'AvgNet',
      'AvgNetPer'
    );

    const filename = `Avg_Bill_by_Visit_Type_${new Date().toISOString()}`
    this.handleExport(data, filename, format, 'avgBillVisitChart');
  }

  exportAvgBillByClaimType(format: string) {
    const data = this.exportService.formatPieChartData(
      this.ClaimpaymentTypeList,
      'CompanyType',
      'AvgNet',
      'AvgNetPer'
    );

    const filename = `Avg_Bill_by_Claim_Type_${new Date().toISOString()}`
    this.handleExport(data, filename, format, 'avgBillClaimChart');
  }

  exportNetRevenueByMonth(format: string) {
    const data = this.exportService.formatLineChartData(
      this.FetchARMonthlyDoctorRevenueGroupBy3List,
      'MonthID',
      'Net'
    );

    const filename = `Net_Revenue_by_Month_${new Date().toISOString()}`
    this.handleExport(data, filename, format, 'netRevenueMonthChart');
  }

  exportAvgBillByMonth(format: string) {
    const data = this.exportService.formatLineChartData(
      this.FetchARMonthlyDoctorRevenueGroupBy3List,
      'MonthID',
      'AvgNet'
    );

    const filename = `Avg_Bill_by_Month_${new Date().toISOString()}`;
    this.handleExport(data, filename, format, 'avgBillMonthChart');
  }

  private handleExport(data: any[], filename: string, format: string, chartId?: string) {
    switch (format.toLowerCase()) {
      case 'csv':
        this.exportService.exportToCSV(data, filename);
        break;
      default:
        console.error('Unsupported export format');
    }
  }

  print() {
    this.isPrinting = true;
    setTimeout(() => {
      document.title = `Doctor_Report_${new Date().toISOString()}`;
      window.print();
      this.isPrinting = false;
    }, 500);
  }
  getFromDateToDate() {
    const fromdate = moment(this.datesForm.get("fromdate")?.value).format('DD-MMM-YYYY');
    const todate = moment(this.datesForm.get("todate")?.value).format('DD-MMM-YYYY');
    return fromdate + '-' + todate;
  }

  exportNetRevenueByPayerToCSV() {
    const headers = ['Payer', 'Net Revenue', 'Distribution (%)'];
    const rows = this.FetchARMonthlyDoctorRevenueGroupBy4List.map(item => [
      item.InsuranceCompanyName,
      Number(item.Net).toFixed(2),
      Number(item.NetPer).toFixed(2)
    ]);

    rows.push(['Total', this.totalNetRevenueByPayer.toFixed(2), '100']);

    const csvContent =
      [headers, ...rows]
        .map(e => e.join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NetRevenueByPayer_${new Date().toISOString()}` + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportNetRevenueByCategoryToCSV() {
    const headers = ['Category', 'Net Revenue', 'Distribution (%)'];
    const rows = this.FetchARMonthlyDoctorRevenueGroupBy5List.map(item => [
      item.DepartmentName,
      Number(item.Net).toFixed(2),
      Number(item.NetPer).toFixed(2)
    ]);

    rows.push(['Total', this.totalDepartmentNet.toFixed(2), '100']);

    const csvContent =
      [headers, ...rows]
        .map(e => e.join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NetRevenueByCategory_${new Date().toISOString()}` + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportDepartmentDoctorNetRevenueToCSV() {
    const headers = ['Department / Doctor', 'Net Revenue', 'Distribution (%)'];
    const rows: string[][] = [];

    this.groupedDepartments.forEach(dept => {
      const deptNet = this.getDepartmentTotalNet(dept).toFixed(2);
      const deptPer = this.getDepartmentTotalNetPer(dept).toFixed(2);
      rows.push([dept.DepartmentName, deptNet, deptPer]);

      dept.Doctors.forEach((doc: any) => {
        const doctorName = `   - ${doc.DoctorName}`;
        const docNet = Number(doc.Net).toFixed(2);
        const docPer = this.getDoctorPercentage(dept, doc);
        rows.push([doctorName, docNet, docPer]);
      });
    });

    rows.push(['Total', this.getTotalNet().toFixed(2), this.getTotalPercentage()]);

    const csvContent = [headers, ...rows]
      .map(e => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NetRevenueByDepartmentAndDoctor_${new Date().toISOString()}` + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  filterPayers(event: any) {
    if (event.target.value === '') {
      this.doctorRevenuePayers = this.doctorRevenuePayers1;
    }
    else {
      // this.doctorRevenuePayers = this.doctorRevenuePayers1.filter((x: any) =>
      //   x.InsuranceCompanyName.toLowerCase().includes(event.target.value.toLowerCase().trim())
      // );
      this.doctorRevenuePayers = this.doctorRevenuePayers1.filter(x => x.InsuranceCompanyName.toLowerCase().startsWith(event.target.value.toLowerCase().trim()));
    }
  }

  filterServices(event: any) {
    if (event.target.value === '') {
      this.doctorRevenueServices = this.doctorRevenueServices1;
    }
    else {
      this.doctorRevenueServices = this.doctorRevenueServices1.filter((x: any) =>
        x.ServiceName.toLowerCase().includes(event.target.value.toLowerCase().trim())
      );
    }
  }

  filterBedTypes(event: any) {
    if (event.target.value === '') {
      this.doctorRevenueBedTypes = this.doctorRevenueBedTypes1;
    }
    else {
      this.doctorRevenueBedTypes = this.doctorRevenueBedTypes1.filter((x: any) =>
        x.BedType.toLowerCase().includes(event.target.value.toLowerCase().trim())
      );
    }
  }

  showClaraModal: boolean = false;

  showAI() {
    this.dashboardData = this.prepareDashboardData();
    this.showClaraModal = true;
  }

  getDateRange() {
    const { fromdate, todate } = this.getFormattedDates();

    return {
      dateRange: { from: fromdate, to: todate }
    }
  }

  prepareDashboardData(): any {
    const { fromdate, todate } = this.getFormattedDates();

    return {
      dateRange: { from: fromdate, to: todate },
      locations: this.locations?.filter((x: any) => x.selected).map((x: any) => x.label).join(', ') || 'All',
      metrics: {
        totalRevenue: this.totalRevenue || 0,
        netRevenue: this.netRevenue || 0,
        discount: this.discount || 0,
        visitTypes: this.visitTypeList || [],
        paymentTypes: this.paymentTypeList || [],
        claimPayments: this.ClaimpaymentTypeList || [],
        monthlyRevenue: this.FetchARMonthlyDoctorRevenueGroupBy3List || [],
        payers: this.FetchARMonthlyDoctorRevenueGroupBy4List?.slice(0, 10) || [],
        categories: this.FetchARMonthlyDoctorRevenueGroupBy5List?.slice(0, 10) || [],
        departments: this.groupedDepartments?.map(d => ({
          name: d.DepartmentName,
          total: this.getDepartmentTotalNet(d),
          doctors: d.Doctors?.slice(0, 5).map((doc: any) => ({
            name: doc.DoctorName,
            revenue: doc.Net
          }))
        })) || []
      }
    };
  }
}
export interface DoctorRevenueService {
  ServiceID: string;
  ServiceName: string;
  selected: boolean;
}

export interface DoctorRevenueDepartment {
  DepartmentID: string;
  DepartmentName: string;
  DoctorID: string;
  DoctorName: string;
}

export interface DoctorRevenuePayer {
  InsuranceComapnyID: string;
  InsuranceCompanyName: string;
  selected: boolean;
}

export interface DoctorRevenueBedTypes {
  BedTypeID: string;
  BedType: string;
  selected: boolean;
}