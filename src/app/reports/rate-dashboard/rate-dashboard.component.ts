import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { RatesService } from '../rates.service';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexMarkers, ApexPlotOptions, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis } from 'ng-apexcharts';
import { ChartExportService } from '../chartexport.service';
declare var bootstrap: any;
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MMM-YYYY HH:mm:ss',
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MMM-YYYY',
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
  grid: ApexGrid;
  tooltip: ApexTooltip
};

@Component({
  selector: 'app-rate-dashboard',
  templateUrl: './rate-dashboard.component.html',
  styleUrls: ['./rate-dashboard.component.scss'],
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
export class RateDashboardComponent implements OnInit {
  departmentId = 0;
  errorMsg = '';
  datesForm!: FormGroup;
  hospitalID: number = 3;
  facility: number = 234;
  specializationSearchTerm: string = '';
  noOfDays = 30;
  types = [
    { label: 'Readmission Rate', value: 1 },
    { label: 'Mortality Rate', value: 2 },
    { label: 'Surgery Cancellation Rate', value: 3 }
  ];

  selectedType = this.types[0];
  
  mainData: any = [];
  mainDataC: any = [];
  mainDataCAd:any=[];
  mainDataCAdR:any=[];
  mainDataB:any=[];
  monthlyData: any = [];
  departmentData: any = [];
  doctorData: any = [];
  titlelabel: string = '';
  locations = [
    { label: 'Nuzha', value: 3, selected: false },
    { label: 'Suwaidi', value: 2, selected: true }
  ];

  selectedLocation = this.locations[0];
  departments: Department[] = [];


  monthlyChart: ChartOptions = {
    series: [],
    chart: {
      type: 'area',
      height: 300,
      toolbar: { show: true },
      zoom: { enabled: false }
    },
    title: {

      text: this.selectedType.value == 1 ? 'MONTHLY READMISSION RATE (%)' : this.selectedType.value == 2 ? 'MONTHLY MORTALITY RATE (%)' : this.selectedType.value == 3 ? 'MONTHLY SURGERY CANCELLATION RATE (%)' : '',
      align: 'center'
    },
    xaxis: {
      categories: [],
      title: {
        text: 'Month'
      },
      labels: {
        offsetX: 0
      }
    },
    yaxis: {
      title: {
        text: 'Percentage (%)',
        offsetX: -10,
        rotate: -90,
        style: {
          fontSize: '12px',
          fontWeight: 600
        }
      },
      labels: {
        formatter: (val: number) => `${val.toFixed(1)}%`
      }
    },
    colors: ['#c11e38'],
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(2)}%`,
      offsetY: -5,
      style: {
        fontSize: '10px',
        colors: ['#c11e38']
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: ['#c11e38']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.25,
        gradientToColors: ['#c11e38'],
        inverseColors: false,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      strokeColors: '#c11e38',
      colors: ['#c11e38'],
      hover: {
        size: 7
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      enabled: true,
      shared: true
    },
    grid: {
      padding: {
        left: 60,
        right: 20,
        top: 10,
        bottom: 10
      }
    }
  };


  fullCategoryNames: any;
  fullDoctorNames: any;

  constructor(
    private ratesService: RatesService,
    private fb: FormBuilder, private exportService: ChartExportService
  ) {

    const vm = new Date();
    //vm.setMonth(0);
     vm.setMonth(vm.getMonth() - 2);
    vm.setDate(1);
    vm.setHours(0, 0, 0, 0);

    this.datesForm = this.fb.group({
      fromdate: vm,
      todate: new Date()
    });
  }

  ngOnInit(): void {
    //this.initializeForm();
    this.hospitalID = Number(sessionStorage.getItem("hospitalId")) || 3;
    this.facility = Number(sessionStorage.getItem("facility")) || 234;
    this.initializeDepartmentChart();
    this.initializeDoctorChart();
    this.fetchDepartments();
    
  }

  initializeForm(): void {
    const oneMonthAgo = moment().subtract(8, 'months').toDate();

    this.datesForm = this.fb.group({
      fromdate: [oneMonthAgo],
      todate: [new Date()],
    });
  }
  fetchRateDataFilters() {
    this.departmentId = 0;
    this.fetchRateData();
  }

  fetchReportsByLocation(location: { label: string; value: number }): void {
    this.hospitalID = location.value;
    this.fetchRateData();
  }

  fetchReportsByType(type: { label: string; value: number }): void {
    this.departmentId=0;
    this.selectedType = type;
    //this.hospitalID = type.value;
    this.fetchRateData();
  }

  fetchRateData(): void {
    const { fromdate, todate } = this.getFormattedDates();

    if (fromdate && todate && new Date(fromdate) > new Date(todate)) {
      this.showErrorModal("From Date should not be greater than To Date.");
      return;
    }

    const departmentIds = this.departments
      .filter(d => d.selected)
      .map(d => d.DepartmentId)
      .join(',');

    let locs = '';
    locs = this.locations?.filter((x: any) => x.selected).map((item: any) => item.value).join(',');
    const type = this.selectedType?.value || 1;
    const noOfDaysNum = Number(this.noOfDays) || 30;

    this.ratesService.fetchReAdmissionMortalitySurgeryCancel(
      type,
      fromdate,
      todate,
      departmentIds,
      locs,
      noOfDaysNum, this.departmentId
    ).subscribe({
      next: (response) => {
        if (response?.Code === 200) {
          this.mainData = response.FetchReAdmissionMortalitiesSurgeryCancelData1List[0];
          this.mainDataB = response.FetchReAdmissionMortalitiesSurgeryCancelData1List;
          this.monthlyData = response.FetchReAdmissionMortalitiesSurgeryCancelData2List;
          this.departmentData = response.FetchReAdmissionMortalitiesSurgeryCancelData3List;
          this.doctorData = response.FetchReAdmissionMortalitiesSurgeryCancelData4List;

          if (this.doctorData.length > 0) {
            this.initDoctorChart();
          }
          else {
            this.createMonthlyChart();
            this.initDepartmentChart();
            this.initializeDoctorChart();
          }

          this.initializeERAdmissionDonutCharts();
          //this.initializeERAdmissionDonutChartsAd();
          //this.initializeERAdmissionDonutChartsAdR();
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  initializeERAdmissionDonutCharts(): void {
    const colorMap: { [key: string]: string } = {
      '1': '#f57c00'
    };
    this.mainDataC = this.mainDataB.map((item: any) => {
      const percentage = parseFloat(item.Per || '0');
      const color = '#f57c00';
      // const label = `CTAS ${item.CTASScoreColorID}`;

      return {
        // label,
        chartOptions: {
          series: [percentage],
          chart: {
            type: 'radialBar',
            height: 300,
            offsetY: 0,
          },
          // labels: [label],
          colors: [color],
          fill: {
            type: 'solid',
            colors: [color],
          },
          stroke: {
            lineCap: 'round',
          },
          legend: {
            show: false,
          },
          tooltip: {
            enabled: true,
          },
          dataLabels: {
            enabled: true,
          },
          plotOptions: {
            radialBar: {
              startAngle: 0,
              endAngle: 360,
              hollow: {
                size: '50%',
              },
              track: {
                background: '#f1f1f1',
                strokeWidth: '97%',
                margin: 0,
              },
              dataLabels: {
                name: { show: false },
                value: {
                  fontSize: '12px',
                  fontWeight: 800,
                  offsetY: 0,
                  color,
                  formatter: (val: number) => `${val.toFixed(2)}%`,
                },
              },
            },
          },
        },
      };
    });
  }

   initializeERAdmissionDonutChartsAd(): void {
    const colorMap: { [key: string]: string } = {
      '1': '#f57c00'
    };
    this.mainDataCAd = this.mainDataB.map((item: any) => {
      const percentage = parseFloat(item.TotalAdmitCnt || '0');
      const color = '#f57c00';
      // const label = `CTAS ${item.CTASScoreColorID}`;

      return {
        // label,
        chartOptions: {
          series: [percentage],
          chart: {
            type: 'radialBar',
            height: 300,
            offsetY: 0,
          },
          // labels: [label],
          colors: [color],
          fill: {
            type: 'solid',
            colors: [color],
          },
          stroke: {
            lineCap: 'round',
          },
          legend: {
            show: false,
          },
          tooltip: {
            enabled: true,
          },
          dataLabels: {
            enabled: true,
          },
          plotOptions: {
            radialBar: {
              startAngle: 0,
              endAngle: 360,
              hollow: {
                size: '50%',
              },
              track: {
                background: '#f1f1f1',
                strokeWidth: '97%',
                margin: 0,
              },
              dataLabels: {
                name: { show: false },
                value: {
                  fontSize: '12px',
                  fontWeight: 800,
                  offsetY: 0,
                  color,
                  formatter: (val: number) => `${val.toFixed(2)}%`,
                },
              },
            },
          },
        },
      };
    });
  }

    initializeERAdmissionDonutChartsAdR(): void {
    const colorMap: { [key: string]: string } = {
      '1': '#f57c00'
    };
    this.mainDataCAdR = this.mainDataB.map((item: any) => {
      const percentage = parseFloat(item.ReAdmitCnt || '0');
      const color = '#f57c00';
      // const label = `CTAS ${item.CTASScoreColorID}`;

      return {
        // label,
        chartOptions: {
          series: [percentage],
          chart: {
            type: 'radialBar',
            height: 300,
            offsetY: 0,
          },
          // labels: [label],
          colors: [color],
          fill: {
            type: 'solid',
            colors: [color],
          },
          stroke: {
            lineCap: 'round',
          },
          legend: {
            show: false,
          },
          tooltip: {
            enabled: true,
          },
          dataLabels: {
            enabled: true,
          },
          plotOptions: {
            radialBar: {
              startAngle: 0,
              endAngle: 360,
              hollow: {
                size: '50%',
              },
              track: {
                background: '#f1f1f1',
                strokeWidth: '97%',
                margin: 0,
              },
              dataLabels: {
                name: { show: false },
                value: {
                  fontSize: '12px',
                  fontWeight: 800,
                  offsetY: 0,
                  color,
                  formatter: (val: number) => `${val.toFixed(2)}%`,
                },
              },
            },
          },
        },
      };
    });
  }





  private getFormattedDates(): { fromdate: string; todate: string } {
    const fromdate = moment(this.datesForm.get('fromdate')?.value).format('DD-MMM-YYYY');
    const todate = moment(this.datesForm.get('todate')?.value).format('DD-MMM-YYYY');
    return { fromdate, todate };
  }

  fetchDepartments(): void {
    this.ratesService.fetchDepartments(this.facility, this.hospitalID)
      .subscribe({
        next: (response) => {
          if (response?.Code === 200) {
            this.departments = response.FetchDepartmentsHISBIDataList || [];
            this.selectAllDepartments(true);
            //this.fetchRateData()
          }
        },
        error: (err) => {
          console.error('Error fetching departments:', err);
        },
      });
  }

  filteredDepartments(): any[] {
    const term = this.specializationSearchTerm.toLowerCase();
    return this.departments.filter(dep =>
      dep.DepartmentName.toLowerCase().includes(term)
    );
  }

  toggleDepartmentSelection(dep: any) {
    dep.selected = !dep.selected;
    // this.fetchRateData();
  }

  getSelectAllDepartmentsStatus(): boolean {
    return this.departments.every(dep => dep.selected);
  }

  selectAllDepartments(status: boolean) {
    this.departments.forEach(dep => dep.selected = status);
    this.fetchRateData();
  }

  specializationOptionClicked(event: Event, dep: any) {
    event.stopPropagation();
    this.toggleDepartmentSelection(dep);
  }

  private createMonthlyChart(): void {
    if (!this.monthlyData || this.monthlyData.length === 0) {
      return;
    }

    const categories = this.monthlyData.map((item: any) => item.MonthName);
    const values = this.monthlyData.map((item: any) => parseFloat(item.Per));

    this.monthlyChart = {
      ...this.monthlyChart,
      series: [{
        name: 'Readmission %',
        data: values
      }],
      title: {

        text: this.selectedType.value == 1 ? 'MONTHLY READMISSION RATE (%)' : this.selectedType.value == 2 ? 'MONTHLY MORTALITY RATE (%)' : this.selectedType.value == 3 ? 'MONTHLY SURGERY CANCELLATION RATE (%)' : '',
        align: 'center'
      },
      xaxis: {
        ...this.monthlyChart.xaxis,
        categories
      },
      tooltip: {
        custom: (props: { series: number[][]; seriesIndex: number; dataPointIndex: number; w: any }) => {
          const { dataPointIndex } = props;
          const item = this.monthlyData[dataPointIndex];
          var AdmissionM=this.selectedType.value == 1 ? 'Re Admission' : this.selectedType.value == 2 ? 'Total Death' : this.selectedType.value == 3 ? 'Total Cancelled' : '';
          var AdmissionMM= this.selectedType.value == 1 ? 'Total Admission' : this.selectedType.value == 2 ? 'Total Admission' : this.selectedType.value == 3 ? 'Total Surgery' : '';

          return `
          <div style="padding: 10px;">
            <strong>${item.MonthName} ${item.YearID}</strong><br>
            ${AdmissionM}: ${item.ReAdmitCnt}<br>
           ${AdmissionMM}: ${item.TotalAdmitCnt}<br>
            Rate: ${parseFloat(item.Per).toFixed(2)}%
          </div>
        `;
        }
      }
    };
  }


  public series: ApexAxisChartSeries = [];
  public chart: ApexChart = {
    type: 'bar',
    height: 400,
    events: {
      dataPointSelection: (event, chartContext, config) => {
        const index = config.dataPointIndex;
        const selectedDepartment = this.departmentData[index];
        if (selectedDepartment) {
          this.departmentId = selectedDepartment.DepartmentID;
          this.doctorSeries = [];
          this.fetchRateData();
        }
      },
    },
    zoom: {
      enabled: false, // Enable zooming
      type: 'x',
      autoScaleYaxis: true,

    },
    
  };

  public xaxis: ApexXAxis = {
    categories: [],
    labels: {
      rotate: -45,
      rotateAlways: true,
      trim: true,
      style: {
        fontSize: '12px',
        fontWeight: 500,
        colors: '#2f2f2f'
      }
    }
  };

  public yaxis: ApexYAxis = {
    title: {
      text: 'Percentage (%)',
      style: { fontWeight: 700 }
    }
  };

 



  public dataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(2)}%`,
    offsetY: -25,
    style: { fontSize: '12px', colors: ['#471069'] }
    
  };

  public plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 3,
      dataLabels: {
        position: 'top'
      }
    }
  };

  public fill: ApexFill = {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      gradientToColors: ['#30c5d2'],
      opacityFrom: 0.9,
      opacityTo: 1,
      stops: [0, 100]
    }
  };

  public title: ApexTitleSubtitle = {
    text: this.selectedType.value == 1 ? 'READMISSION RATE PER DEPARTMENT (%)' : this.selectedType.value == 2 ? 'MORTALITY RATE PER DEPARTMENT (%)' : this.selectedType.value == 3 ? 'SURGERY CANCELLATION RATE PER DEPARTMENT (%)' : '',//'READMISSION RATE PER DEPARTMENT (%)',
    align: 'center',
    style: { fontSize: '20px', fontWeight: 'bold' }
  };

  public tooltip: ApexTooltip = {
    y: {
      formatter: (val: number) => `${val.toFixed(2)}%`
    },
    x: {
      show: true,
      formatter: (val: number, opts?: any) => {
        const label = this.fullCategoryNames?.[opts?.dataPointIndex] || '';
        const percentage = opts?.w?.config?.series?.[0]?.data?.[opts.dataPointIndex] || 0;
        const departmentItem = this.departmentData[opts?.dataPointIndex];

        var AdmissionM=this.selectedType.value == 1 ? 'Re Admission' : this.selectedType.value == 2 ? 'Total Death' : this.selectedType.value == 3 ? 'Total Cancelled' : '';
          var AdmissionMM= this.selectedType.value == 1 ? 'Total Admission' : this.selectedType.value == 2 ? 'Total Admission' : this.selectedType.value == 3 ? 'Total Surgery' : '';

        return `
          <div style="padding: 8px;">
            <strong>${label}</strong><br>
            ${AdmissionM}: ${departmentItem?.ReAdmitCnt || 0}<br>
            ${AdmissionMM}: ${departmentItem?.TotalAdmitCnt || 0}<br>
            Rate: ${percentage.toFixed(2)}%
          </div>
        `;
      }
    }
  };

  public doctorSeries: ApexAxisChartSeries = [];
  public doctorChart: ApexChart = {
    type: 'bar',
    height: 400,
    zoom: {
      enabled: false, // Enable zooming
      type: 'x',
      autoScaleYaxis: true,

    }
  };

  public doctorXaxis: ApexXAxis = {
    categories: [],
    // labels: {
    //   rotate: -45,
    //   rotateAlways: true,
    //   trim: false,
    //   style: {
    //     fontSize: '10px',
    //     fontWeight: 500,
    //     colors: '#2f2f2f'
    //   },
    // }
    labels: {
      rotate: -45,
      rotateAlways: true,
      trim: true,
      style: {
        fontSize: '10px',
        fontWeight: 500,
        colors: '#2f2f2f'
      }
    }
  };

  public doctorYaxis: ApexYAxis = {
    title: {
      text: 'Percentage (%)',
      style: { fontWeight: 700 }
    }
  };

  public doctorDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(1)}%`,
    offsetY: -25,
    style: { fontSize: '10px', colors: ['#0c0c0c'] }
  };

  public doctorPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '40%',
      borderRadius: 3,
      dataLabels: {
        position: 'top'
      }
    }
  };

  public doctorFill: ApexFill = {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      gradientToColors: ['#392d69'],
      opacityFrom: 0.9,
      opacityTo: 1,
      stops: [0, 100]
    }
  };

  public doctorTitle: ApexTitleSubtitle = {
    //text: 'READMISSION RATE BY DOCTOR (%)',
    text: this.selectedType.value == 1 ? 'READMISSION RATE BY DOCTOR (%)' : this.selectedType.value == 2 ? 'MORTALITY RATE BY DOCTOR (%)' : this.selectedType.value == 3 ? 'SURGERY CANCELLATION RATE BY DOCTOR (%)' : '',

    align: 'center',
    style: { fontSize: '18px', fontWeight: 'bold' }
  };

  public doctorTooltip: ApexTooltip = {
    y: {
      formatter: (val: number) => `${val.toFixed(2)}%`
    },
    custom: (props: { series: number[][]; seriesIndex: number; dataPointIndex: number; w: any }) => {
      const { dataPointIndex } = props;
      const doctorItem = this.doctorData[dataPointIndex];

      if (!doctorItem) return '<div>No data</div>';

       var AdmissionM=this.selectedType.value == 1 ? 'Re Admission' : this.selectedType.value == 2 ? 'Total Death' : this.selectedType.value == 3 ? 'Total Cancelled' : '';
          var AdmissionMM= this.selectedType.value == 1 ? 'Total Admission' : this.selectedType.value == 2 ? 'Total Admission' : this.selectedType.value == 3 ? 'Total Surgery' : '';


      return `
        <div style="padding: 12px; background: white; border: 1px solid #ccc; border-radius: 4px;">
          <strong>${doctorItem.DoctorName}</strong><br>
          <small>${doctorItem.Department}</small><br>
          <hr style="margin: 8px 0;">
          ${AdmissionM}: ${doctorItem.ReAdmitCnt}<br>
          ${AdmissionMM}: ${doctorItem.TotalAdmitCnt}<br>
          Rate: ${parseFloat(doctorItem.Per).toFixed(2)}%
        </div>
      `;
    }
  };

  private initializeDepartmentChart() {
    this.series = [];
    this.fullCategoryNames = [];
    
    this.xaxis = {
      ...this.xaxis,
      categories: []
    };
  }

  private initializeDoctorChart() {
    this.doctorSeries = [];
    this.fullDoctorNames = [];
    this.doctorXaxis = {
      ...this.doctorXaxis,
      categories: []
    };
    
  }

  private initDepartmentChart() {
    if (!this.departmentData || this.departmentData.length === 0) {
      this.initializeDepartmentChart();
      return;
    }

    const sortedDepartments = [...this.departmentData]
      .sort((a, b) => parseFloat(b.Per) - parseFloat(a.Per));

    const departments = sortedDepartments.map((item: any) => item.Department);
    const readmitPercentages = sortedDepartments.map((item: any) => parseFloat(item.Per));

    this.series = [
      {
        name: 'Readmission Rate (%)',
        data: readmitPercentages
      }
    ];
    

    this.fullCategoryNames = [...departments];
    this.title = {

      text: this.selectedType.value == 1 ? 'READMISSION RATE PER DEPARTMENT (%)' : this.selectedType.value == 2 ? 'MORTALITY RATE PER DEPARTMENT (%)' : this.selectedType.value == 3 ? 'SURGERY CANCELLATION RATE PER DEPARTMENT (%)' : '',
      align: 'center',
    }
    

    this.xaxis = {
      ...this.xaxis,
      categories: departments,
      tickPlacement: 'on',
      type: 'category',
      labels: {
        rotate: 0,
        hideOverlappingLabels: false,
        trim: true,
        offsetX: 0,
        formatter: (val: string) =>
          val?.length > 20 ? val.slice(0, 20) + '…' : val,
        style: {
          fontSize: '10px',
          colors: '#2f2f2f',
          cssClass: 'apexcharts-xaxis-label_text',
        },
      }
    };


    this.departmentData = sortedDepartments;
  }

  private initDoctorChart() {
    if (!this.doctorData || this.doctorData.length === 0) {
      this.initializeDoctorChart();
      return;
    }

    const sortedDoctors = [...this.doctorData]
      .sort((a, b) => parseFloat(b.Per) - parseFloat(a.Per))
      ;

    const doctorNames = sortedDoctors.map((item: any) => {
      const shortName = item.DoctorName.length > 20
        ? item.DoctorName.substring(0, 20) + '...'
        : item.DoctorName;
      return `${shortName}\n(${item.Department})`;
    });

    const readmitPercentages = sortedDoctors.map((item: any) => parseFloat(item.Per));

    this.doctorSeries = [
      {
        name: 'Readmission Rate (%)',
        data: readmitPercentages
      }
    ];

    this.fullDoctorNames = sortedDoctors.map((item: any) => item.DoctorName);

    this.doctorTitle = {

      text: this.selectedType.value == 1 ? 'READMISSION RATE BY DOCTOR (%)' : this.selectedType.value == 2 ? 'MORTALITY RATE BY DOCTOR (%)' : this.selectedType.value == 3 ? 'SURGERY CANCELLATION RATE BY DOCTOR (%)' : '',
      align: 'center'
    }

    this.doctorXaxis = {
      ...this.doctorXaxis,
      categories: doctorNames,
      tickPlacement: 'on',
      type: 'category',
      labels: {
        rotate: 0,
        rotateAlways: true,
        trim: false,
        offsetX: 0,
        style: {
          fontSize: '10px',
          colors: '#2f2f2f',
          fontWeight: 400,
        },
        maxHeight: 120
      }
    };

    this.doctorData = sortedDoctors;
  }

  getSortedDepartmentData(): any[] {
    if (!this.departmentData || this.departmentData.length === 0) {
      return [];
    }

    return [...this.departmentData].sort((a, b) => parseFloat(b.Per) - parseFloat(a.Per));
  }

  formatPercentage(per: string | number): string {
    const percentage = typeof per === 'string' ? parseFloat(per) : per;
    return percentage.toFixed(2) + '%';
  }

  getSortedDoctorData(): any[] {
    if (!this.doctorData || this.doctorData.length === 0) {
      return [];
    }

    return [...this.doctorData].sort((a, b) => parseFloat(b.Per) - parseFloat(a.Per));
  }

  parseFloat(value: string | number): number {
    return typeof value === 'string' ? parseFloat(value) : value;
  }

  locationOptionClicked(event: Event, item: any) {
    event.stopPropagation();
    this.toggleLocationSelection(item);
  }

  toggleLocationSelection(item: any) {
    item.selected = !item.selected;
  }

  clearFilters() {
    // const oneMonthAgo = moment().subtract(8, 'months').toDate();

    // this.datesForm.patchValue({
    //   fromdate: oneMonthAgo,
    //   todate: new Date(),
    // });
    const vm = new Date();
    vm.setMonth(0);
    vm.setDate(1);
    vm.setHours(0, 0, 0, 0);

    this.datesForm.patchValue({
      fromdate: vm,
      todate: new Date()
    });
    this.doctorSeries = [];

    this.locations.forEach(loc => {
      loc.selected = true;
    });

    this.departments.forEach(dep => {
      dep.selected = true;
    });

    this.selectedType = this.types[0];
    this.noOfDays = 30;
    this.departmentId = 0;
    this.fetchRateData();
  }

  showErrorModal(error: string) {
    this.errorMsg = error;
    let modal = new bootstrap.Modal(document.getElementById('errorMsg'));
    modal.show();
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

  exportMonthlyChart(format: string) {
    if (!this.monthlyData || this.monthlyData.length === 0) {
      console.warn('No data available for export.');
      return;
    }

    const data = this.monthlyData.map((item: any) => ({
      Month: item.MonthName,
      Count: item.ReAdmitCnt,
      Percentage: parseFloat(item.Per).toFixed(2)
    }));

    const filename = `Monthly_Chart_${new Date().toISOString()}`;
    this.handleExport(data, filename, format, 'monthlyChart');
  }

  exportDepartmentChart(format: string) {
    if (!this.departmentData || this.departmentData.length === 0) {
      console.warn('No data available for export.');
      return;
    }

    const data = this.departmentData.map((item: any) => ({
      Department: item.Department,
      Count: item.ReAdmitCnt + '/' + item.TotalAdmitCnt,
      Percentage: parseFloat(item.Per).toFixed(2)
    }));

    const filename = `Department_Chart_${new Date().toISOString()}`;
    this.handleExport(data, filename, format, 'departmentChart');
  }

  exportDoctorChart(format: string) {
    if (!this.doctorData || this.doctorData.length === 0) {
      console.warn('No data available for export.');
      return;
    }

    const data = this.doctorData.map((item: any) => ({
      DoctorName: item.DoctorName,
      Count: item.ReAdmitCnt + '/' + item.TotalAdmitCnt,
      Percentage: parseFloat(item.Per).toFixed(2)
    }));

    const filename = `Doctor_Chart_${new Date().toISOString()}`;
    this.handleExport(data, filename, format, 'doctorChart');
  }

  exportMonthlyDataToCSV(): void {
    if (!this.monthlyData || this.monthlyData.length === 0) {
      console.warn('No monthly data available for export.');
      return;
    }

    const exportData = this.monthlyData.map((item: any) => ({
      Month: item.MonthName,
      Count: item.ReAdmitCnt,
      Percentage: (+item.Per).toFixed(2)
    }));

    const filename = `Monthly_ReAdmit_Export_${new Date().toISOString()}`;
    this.exportService.exportToCSV(exportData, filename);
  }

  exportDepartmentDataToCSV(): void {
    if (!this.departmentData || this.departmentData.length === 0) {
      console.warn('No department data available for export.');
      return;
    }

    const exportData = this.departmentData.map((item: any) => ({
      Department: item.Department,
      Count: item.ReAdmitCnt + '/' + item.TotalAdmitCnt,
      Percentage: parseFloat(item.Per).toFixed(2)
    }));

    const filename = `Department_Data_Export_${new Date().toISOString()}`;
    this.exportService.exportToCSV(exportData, filename);
  }

  exportDoctorDataToCSV(): void {
    const sortedDoctorData = this.getSortedDoctorData();

    if (!sortedDoctorData || sortedDoctorData.length === 0) {
      console.warn('No doctor data available for export.');
      return;
    }

    const exportData = sortedDoctorData.map(doctor => ({
      DoctorName: doctor.DoctorName,
      Count: doctor.ReAdmitCnt + '/' + doctor.TotalAdmitCnt,
      Percentage: parseFloat(doctor.Per).toFixed(2)
    }));

    const filename = `Doctor_ReAdmit_Export_${new Date().toISOString()}`;
    this.exportService.exportToCSV(exportData, filename);
  }

}

export interface Department {
  DepartmentId: string;
  DepartmentName: string;
  selected?: boolean;
}