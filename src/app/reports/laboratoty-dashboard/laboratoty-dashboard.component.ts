import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';
import { LaboratoryService } from '../laboratory.service';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from 'ng-apexcharts';
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

export type TreemapChartOptions = {
  series: {
    data: { x: string; y: number }[];
  }[];
  chart: ApexChart;
  plotOptions: {
    treemap: ApexPlotOptions['treemap'];
  };
  dataLabels?: ApexDataLabels;
  legend?: {
    show?: boolean;
  };
  tooltip?: {
    enabled?: boolean;
    y?: {
      formatter?: (val: any, opts?: any) => string;
    };
  };
  fill?: ApexFill;
};

export type RadialBarChartOptions = {
  series: number[];
  chart: ApexChart;
  colors: string[];
  fill: ApexFill;
  stroke: ApexStroke;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
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
  selector: 'app-laboratoty-dashboard',
  templateUrl: './laboratoty-dashboard.component.html',
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

export class LaboratotyDashboardComponent implements OnInit {
  turnaroundTests: any[] = [];
  selectedTests: any[] = [];
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: TreemapChartOptions;
  public genderChart!: DonutChartOptions;
  public locationChart!: DonutChartOptions;
  public patientChart!: DonutChartOptions;
  public nationalityChart!: DonutChartOptions;

  public chartCriticalFailure!: ApexChart;
  public seriesCriticalFailure: ApexAxisChartSeries = [];
  public xaxisCriticalFailure!: ApexXAxis;
  public yaxisCriticalFailure!: ApexYAxis | ApexYAxis[];
  public dataLabelsCriticalFailure!: ApexDataLabels;
  public plotOptionsCriticalFailure!: ApexPlotOptions;
  public fillCriticalFailure!: ApexFill;
  public titleCriticalFailure!: ApexTitleSubtitle;
  public tooltipCriticalFailure!: ApexTooltip;
  public colorsCriticalFailure!: string[];
  public legendCriticalFailure!: ApexLegend;
  public labTestSeries: ApexAxisChartSeries = [];
  public labTestChart: ApexChart = {
    type: 'bar',
    height: 450
  };

  turnaroundData: any;
  averageTimeData: any = [];

  public labTestXAxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '12px' } }
  };

  public labTestPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      distributed: true,
      borderRadius: 2,
      barHeight: '60%'
    }
  };

  public labTestFill: ApexFill = { type: 'solid' };
  public labTestColors: string[] = [];
  public processColors: string[] = ['#9b59b6', '#3498db', '#e74c3c', '#27ae60']; // Purple, Blue, Red, Green
  public alternativeProcessColors: string[] = ['#8e44ad', '#2980b9', '#c0392b', '#27ae60']; // Darker variants

  public labTestTitle: ApexTitleSubtitle = {
    text: '',
    align: 'center',
    style: { fontSize: '18px', fontWeight: 'bold' }
  };

  public labTestDataLabels: ApexDataLabels = {
    enabled: true,
    style: {
      colors: ['#fff'],
      fontSize: '14px',
      fontWeight: 'bold'
    },
    formatter: function (val: number) {
      return val + ' min';
    }
  };

  public labTestTooltip: ApexTooltip = {
    y: {
      formatter: function (val: number) {
        return val + ' minutes';
      }
    }
  };

  public labTestLegend: ApexLegend = {
    show: false
  };

  labData: any = [];
  genderData: any[] = [];
  locationData: any[] = [];
  patientData: any[] = [];
  nationalityData: any[] = [];
  bloodCultureData: any[] = [];
  criticalValueData: any[] = [];

  datesForm: any;
  hospitalID: any;
  errorMsg = '';
  patientsAndTests: any = [];
  LABTestOrdersWaitingAvgTime: any = [];

  private colorPalettes = {
    gender: ['#F06292', '#42A5F5'],
    location: ['#4CAF50', '#F44336', '#2196F3'],
    patient: ['#4CAF50', '#9C27B0', '#2196F3'],
    nationality: ['#3F51B5', '#FF9800']
  };

  locations = [
    { label: 'Nuzha', value: 3, selected: false },
    { label: 'Suwaidi', value: 2, selected: true }
  ];
  selectedLocation = this.locations[0];

  public bloodCultureChart: RadialBarChartOptions | null = null;
  bloodCultureStatuses: any[] = [];
  selectedBloodCultureStatus: any = null;


  public labTestChartOptions: any = {
    series: this.labTestSeries,
    chart: this.labTestChart,
    xaxis: this.labTestXAxis,
    title: this.labTestTitle,
    colors: this.labTestColors,
    plotOptions: this.labTestPlotOptions,
    fill: this.labTestFill,
    dataLabels: this.labTestDataLabels,
    tooltip: this.labTestTooltip,
    legend: this.labTestLegend
  };

  public turnaroundSeries: ApexAxisChartSeries = [];
  public turnaroundChart: ApexChart = {
    type: 'bar',
    height: 450
  };

  public turnaroundXAxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '12px' } }
  };

  public turnaroundPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      distributed: false,
      borderRadius: 2,
      barHeight: '70%'
    }
  };

  public turnaroundFill: ApexFill = { type: 'solid' };
  public turnaroundColors: string[] = [];
  public turnaroundMainColors: string[] = ['#4285F4']; // Blue color
  public turnaroundAlternativeColors: string[] = ['#1976D2', '#2196F3', '#42A5F5']; // Blue variants

  public turnaroundTitle: ApexTitleSubtitle = {
    text: '',
    align: 'center',
    style: { fontSize: '18px', fontWeight: 'bold' }
  };

  public turnaroundDataLabels: ApexDataLabels = {
    enabled: true,
    style: {
      colors: ['#fff'],
      fontSize: '16px',
      fontWeight: 'bold'
    },
    formatter: function (val: number) {
      return val + '%';
    }
  };

  public turnaroundTooltip: ApexTooltip = {
    y: {
      formatter: function (val: number) {
        return val + '%';
      }
    }
  };

  public turnaroundLegend: ApexLegend = {
    show: false
  };

  public turnaroundChartOptions: any = {
    series: this.turnaroundSeries,
    chart: this.turnaroundChart,
    xaxis: this.turnaroundXAxis,
    title: this.turnaroundTitle,
    colors: this.turnaroundColors,
    plotOptions: this.turnaroundPlotOptions,
    fill: this.turnaroundFill,
    dataLabels: this.turnaroundDataLabels,
    tooltip: this.turnaroundTooltip,
    legend: this.turnaroundLegend
  };

  constructor(private fb: FormBuilder, private labService: LaboratoryService, private exportService: ChartExportService) {
    const vm = new Date();
    vm.setMonth(vm.getMonth() - 8);

    this.datesForm = this.fb.group({
      fromdate: vm,
      todate: new Date()
    });
  }

  ngOnInit(): void {
    this.hospitalID = Number(sessionStorage.getItem("hospitalId")) || 3;
    this.fetchLabData();
    this.fetchLabWaitingData();
  }

  locationOptionClicked(event: Event, item: any) {
    event.stopPropagation();
    this.toggleLocationSelection(item);
  }

  toggleLocationSelection(item: any) {
    item.selected = !item.selected;
  }

  private getFormattedDates(): { fromdate: string; todate: string } {
    const fromdate = moment(this.datesForm.get("fromdate")?.value).format('DD-MMM-YYYY');
    const todate = moment(this.datesForm.get("todate")?.value).format('DD-MMM-YYYY');
    return { fromdate, todate };
  }

  showErrorModal(error: string) {
    this.errorMsg = error;
    let modal = new bootstrap.Modal(document.getElementById('errorMsg'));
    modal.show();
  }

  fetchLabData(): void {
    const { fromdate, todate } = this.getFormattedDates();

    if (!this.areValidDates(fromdate, todate)) return;

    const selectedLocationIds = this.getSelectedLocationIds();

    this.labService.fetchLabTestOrders(fromdate, todate, selectedLocationIds).subscribe({
      next: (response) => {
        if (response?.Code === 200) {
          this.patientsAndTests = response.FetchLABTestOrdersHISBI1Data1List?.[0] || [];
          this.labData = response.FetchLABTestOrdersHISBI6Data6List || [];
          this.genderData = response.FetchLABTestOrdersHISBI3Data3List || [];
          this.locationData = response.FetchLABTestOrdersHISBI2Data2List || [];
          this.patientData = response.FetchLABTestOrdersHISBI5Data5List || [];
          this.nationalityData = response.FetchLABTestOrdersHISBI4Data4List || [];
          this.bloodCultureData = response.FetchLABTestOrdersHISBI7Data7List || [];
          this.criticalValueData = response.FetchLABTestOrdersHISBI8Data8List || [];

          this.loadAllCharts();
        } else {
          this.showErrorModal('Unexpected response code: ' + response?.Code);
        }
      },
      error: (err) => {
        console.error('Error fetching lab data:', err);
        this.showErrorModal('An error occurred while fetching lab data.');
      }
    });
  }

  loadAllCharts() {
    this.loadTreemapChart();
    this.loadGenderChart();
    this.loadLocationChart();
    this.loadPatientChart();
    this.loadNationalityChart();
    this.initializeBloodCultureCharts();
    this.loadCriticalValueFailureChart();
  }

  fetchLabWaitingData(): void {
    const { fromdate, todate } = this.getFormattedDates();

    if (!this.areValidDates(fromdate, todate)) return;

    const selectedLocationIds = this.getSelectedLocationIds();

    this.labService.fetchLabTestOrdersWaiting(fromdate, todate, selectedLocationIds).subscribe({
      next: (response) => {
        if (response?.Code === 200) {
          if (response.FetchLABTestOrdersWaitingHISBI1Data1List &&
            response.FetchLABTestOrdersWaitingHISBI1Data1List.length > 0 &&
            response.FetchLABTestOrdersWaitingHISBI1Data1List[0]) {
            this.LABTestOrdersWaitingAvgTime = response.FetchLABTestOrdersWaitingHISBI1Data1List?.[0] || [];

            this.averageTimeData = [
              { Result: 'Sample Collection', TestCount: this.LABTestOrdersWaitingAvgTime.SampleCollection },
              { Result: 'Acknowledgement', TestCount: this.LABTestOrdersWaitingAvgTime.Acknowledgement },
              { Result: 'Result Entered', TestCount: this.LABTestOrdersWaitingAvgTime.ResultEntered },
              { Result: 'Result Verified', TestCount: this.LABTestOrdersWaitingAvgTime.Resultverified }
            ];

            this.initLabTestChart(response.FetchLABTestOrdersWaitingHISBI1Data1List[0]);
            this.turnaroundData = (response.FetchLABTestOrdersWaitingHISBI2Data2List || [])
              .filter((item: any) => this.calculateTurnaroundPercentage(item) > 0);
            //this.turnaroundData = this.turnaroundData.splice(0, 30);
            this.loadTurnaroundTests();
           // this.initTurnaroundChart(this.turnaroundData);
          }
        } else {
          this.showErrorModal('Unexpected response code: ' + response?.Code);
        }
      },
      error: (err) => {
        console.error('Error fetching lab waiting data:', err);
        this.showErrorModal('An error occurred while fetching lab waiting data.');
      }
    });
  }

  loadTreemapChart() {
    this.chartOptions = {
      series: [
        {
          data: this.labData.map((item: any) => ({
            x: item.Specialisation,
            y: Number(item.TestCount)
          }))
        }
      ],
      chart: {
        type: 'treemap',
        height: 450,
        animations: {
          enabled: false
        }
      },
      plotOptions: {
        treemap: {
          distributed: true,
          enableShades: false,
          shadeIntensity: 0.5,
          useFillColorAsStroke: true,
          colorScale: {
            ranges: []
          }
        }
      },
      dataLabels: {
        enabled: true,
        // style: {
        //   fontSize: '14px',
        //   fontWeight: 'bold',
        //   colors: ['#fff']
        // },
        formatter: (text: any, opts: any) => {
          const dataPoint = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex];
          const label = dataPoint.x;
          const formatted = new Intl.NumberFormat().format(dataPoint.y);
          return `${text} (${formatted})`;
        },
        offsetX: 0,
        offsetY: 0
      },
      legend: {
        show: false
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: function (val: any, opts: any): string {
            const dataPoint = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex];
            const label = dataPoint.x;
            const formatted = new Intl.NumberFormat().format(val);
            return `${label}: ${formatted}`;
          }
        }
      }
    };
  }

  private createDonutChart(
    data: any[],
    labelKey: string,
    valueKey: string,
    title: string,
    colorPalette: string[]
  ): DonutChartOptions {
    const labels = data.map(item => item[labelKey]);
    const values = data.map(item => Number(item[valueKey]));

    return {
      series: values,
      chart: {
        type: 'donut',
        width: '100%',
        height: '200px',
      },
      labels: labels,
      colors: colorPalette,
     
      fill: {
        
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          gradientToColors: colorPalette,
          inverseColors: true,
          opacityFrom: 0.9,
          opacityTo: 1,
          stops: [0, 90, 100],
          
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
        text: title,
        align: 'center',
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#383A88'
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => val.toLocaleString('en-IN')
        }
      },
      
      dataLabels: {
        enabled: true,
        enabledOnSeries: undefined,
        formatter: (_, opts) => {
          const value = opts.w.config.series[opts.seriesIndex];
          const label = opts.w.config.labels[opts.seriesIndex];
          //return `${label}: ${Number(value)}`;
          return `${Number(value)}`;
        },
        textAnchor: 'end',
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
            // chart: { width: 200, height: 210 },
            legend: { position: 'bottom', fontSize: "10px" }
          }
        },
        {
          breakpoint: 480,
          options: {
            chart: {
              // width: 250
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ],
      plotOptions: {
        pie: {
         
          donut: {
            size: '50%',
            labels: { show: false },
            
            
          },
          dataLabels:{
            offset:20,
            
          },
          
        }
      }
    };
  }

  loadGenderChart() {
    this.genderChart = this.createDonutChart(
      this.genderData,
      'Gender',
      'TestCount',
      'Test by Gender',
      this.colorPalettes.gender
    );
  }

  loadLocationChart() {
    this.locationChart = this.createDonutChart(
      this.locationData,
      'Patienttype',
      'TestCount',
      'Test by Patient Type',
      this.colorPalettes.location
    );
  }

  loadPatientChart() {
    this.patientChart = this.createDonutChart(
      this.patientData,
      'CompanyType',
      'TestCount',
      'Test by Bill Type',
      this.colorPalettes.patient
    );
  }

  loadNationalityChart() {
    this.nationalityChart = this.createDonutChart(
      this.nationalityData,
      'Nationality',
      'TestCount',
      'Test by Nationality',
      this.colorPalettes.nationality
    );
  }

  private areValidDates(from: string, to: string): boolean {
    if (!from || !to) {
      this.showErrorModal('Both From Date and To Date are required.');
      return false;
    }

    if (new Date(from) > new Date(to)) {
      this.showErrorModal('From Date should not be greater than To Date.');
      return false;
    }

    return true;
  }

  private getSelectedLocationIds(): string {
    return this.locations
      ?.filter((loc: any) => loc.selected)
      .map((loc: any) => loc.value)
      .join(',') || '';
  }

  initializeBloodCultureCharts(): void {
    if (!this.bloodCultureData || this.bloodCultureData.length === 0) {
      return;
    }

    this.bloodCultureStatuses = this.bloodCultureData.map(item => ({
      taskStatusid: item.taskStatusid,
      statusName: item.StatusName,
      testCount: item.TestCount,
      percentage: parseFloat(item.Per || '0')
    }));

    this.selectedBloodCultureStatus = this.bloodCultureStatuses.find(
      status => status.taskStatusid === "7"
    ) || this.bloodCultureStatuses[0];

    this.loadBloodCultureChart();
  }

  onBloodCultureStatusChange(selectedStatus: any): void {
    this.selectedBloodCultureStatus = selectedStatus;
    this.loadBloodCultureChart();
  }

  private loadBloodCultureChart(): void {
    if (!this.selectedBloodCultureStatus) {
      return;
    }

    const percentage = this.selectedBloodCultureStatus.percentage;
    const color = '#DC2525';

    this.bloodCultureChart = {
      series: [percentage],
      chart: {
        type: 'radialBar',
        height: 180,
        width: '100%',
        offsetY: -10,
      },
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
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const value = series[seriesIndex][dataPointIndex];
          return `<div class="custom-tooltip" style="padding: 8px; background: #333; color: #fff; border-radius: 4px; font-size: 12px;">
                    <strong>${this.selectedBloodCultureStatus.statusName}</strong><br/>
                    ${value.toFixed(2)}% (${this.selectedBloodCultureStatus.testCount.toLocaleString()} tests)
                  </div>`;
        }
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
            margin: 5,
          },
          dataLabels: {
            name: { show: false },
            value: {
              fontSize: '12px',
              fontWeight: 800,
              offsetY: 8,
              color: color,
              formatter: (val: number) => `${val.toFixed(2)}%`,
            },
          },
        },
      },
    };
  }

  loadCriticalValueFailureChart(): void {
    const monthName = this.criticalValueData.map((d: any) => d.MonthName);
    const percentage = this.criticalValueData.map((d: any) => +d.Per);

    this.seriesCriticalFailure = [
      {
        name: 'Critical Value Reporting Failures (%)',
        data: percentage
      }
    ];

    this.chartCriticalFailure = {
      type: 'bar',
      height: 250,
      toolbar: { show: false }
    };

    this.plotOptionsCriticalFailure = {
      bar: {
        horizontal: false,
        columnWidth: '45%',
        borderRadius: 2,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.dataLabelsCriticalFailure = {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      offsetY: -15,
      style: {
        fontSize: '8px',
        //fontWeight: 'bold',
        colors: ['#0061ff']
      }
    };

    this.colorsCriticalFailure = ['#0061ff'];

    this.xaxisCriticalFailure = {
      categories: monthName,
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.yaxisCriticalFailure = {
      // title: {
      //   text: '% Failures',
      //   style: {
      //     fontWeight: 600,
      //     fontSize: '12px'
      //   }
      // },
      labels: {
        formatter: (val: number) => `${val.toFixed(1)}%`
      }
    };

    this.titleCriticalFailure = {
      text: 'Critical Value Reporting Failure',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };

    this.tooltipCriticalFailure = {
      y: {
        formatter: (val: number) => `${val.toFixed(2)}%`
      }
    };

    this.legendCriticalFailure = {
      position: 'top',
      horizontalAlign: 'right'
    };

    this.fillCriticalFailure = {
      type: ['gradient', 'gradient'],
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.4,
        gradientToColors: ['#60efff'],
        inverseColors: false,
        opacityFrom: 0.9,
        opacityTo: 0.9,
        stops: [0, 100]
      }
    };
  }

  private initLabTestChart(data: any) {

    this.labTestColors = ['#9b59b6', '#3498db', '#e74c3c', '#27ae60'];

    const processSteps = Object.entries(data)
      .filter(([key, value]) => key !== 'Type')
      .map(([key, value]) => ({
        name: this.formatProcessName(key),
        value: parseInt(value as string, 10)
      }));

    const sortedSteps = processSteps;

    this.labTestSeries = [{
      name: 'Average Time (minutes)',
      data: sortedSteps.map(step => step.value)
    }];

    this.labTestXAxis = {
      categories: sortedSteps.map(step => step.name),
      labels: {
        style: { fontSize: '12px' },
        rotate: -45
      }
    };

    this.labTestTitle = {
      text: `Lab Test Process - ${data.Type}`,
      align: 'center',
      style: { fontSize: '18px', fontWeight: 'bold' }
    };

    this.labTestChartOptions = {
      chart: {
        type: 'bar',
        height: 400,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          dataLabels: {
            position: 'center'
          }
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#fff'],
          fontSize: '14px',
          fontWeight: 'bold'
        },
        formatter: function (val: number) {
          return val + ' min';
        }
      },
      colors: this.labTestColors,
      legend: {
        show: false
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + ' minutes';
          }
        }
      }
    };
  }

  private formatProcessName(key: string): string {
    const nameMap: { [key: string]: string } = {
      'SampleCollection': 'Sample Collection',
      'Acknowledgement': 'Acknowledgement',
      'ResultEntered': 'Result Entered',
      'Resultverified': 'Result Verified'
    };

    return nameMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
  }

  private initTurnaroundChart(data: any[]) {
    this.turnaroundColors = ['#42047e'];

    const chartData = data.map(item => {
      const percentage = this.calculateTurnaroundPercentage(item);
      return {
        name: item.TestName || 'Unknown Test',
        value: percentage,
        totalTests: parseInt(item.TotalTests) || 0
      };
    }).filter(item => item.value > 0);

    this.turnaroundSeries = [{
      name: 'Percentage',
      data: chartData.map(item => item.value)
    }];

    this.turnaroundXAxis = {
      categories: chartData.map(item => item.name),
      labels: {
        style: { fontSize: '12px' },
        rotate: -45,
        formatter: function (val: string) {
          return val.length > 20 ? val.substring(0, 20) + '...' : val;
        }
      }
    };

    this.turnaroundTitle = {
      text: `${data[0]?.Type || 'Turn Around Time (within 60 minutes)'}`,
      align: 'center',
      style: { fontSize: '18px', fontWeight: 'bold' }
    };

    this.turnaroundChartOptions = {
      chart: {
        type: 'bar',
        height: 250,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: false,
          barHeight: '90%',
          borderRadius: 1,
          dataLabels: {
            position: 'bottom'
          }
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#fff'],
          fontSize: '8px',

        },
        offsetX: 30,
        formatter: function (val: number) {
          return val + '%';
        }
      },
      colors: this.turnaroundColors,
      legend: {
        show: false
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val + '%';
          }
        }
      },
      xaxis: {
        max: 100,
        title: {
          text: 'Percentage (%)'
        },
        labels: {
          formatter: function (val: any) {
            return val + '%';
          }
        }
      }
    };
  }

  calculateTurnaroundPercentage(item: any): number {
    const orderTime = parseInt(item.OrderdateToResultEntered) || 0;
    const sampleTime = parseInt(item.SampleCollectionToResultEntered) || 0;
    const totalTests = parseInt(item.TotalTests) || 1;

    if (orderTime === 0 && sampleTime === 0) return 100;

    const avgTime = (orderTime + sampleTime) / 2;
    const withinTimePercentage = Math.max(0, 100 - (avgTime / 60) * 100);

    return Math.min(100, Math.max(0, Math.round(withinTimePercentage)));
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

  exportGridData(format: string, data: any[], filename: string) {

    const arrayData = Array.isArray(data) ? data : [data];

    if (!arrayData || arrayData.length === 0) {
      console.warn(`No data available for export: ${filename}`);
      return;
    }

    const exportData = arrayData.map(item => {
      const cleaned: any = {};
      for (const key in item) {
        cleaned[key] = item[key] ?? '';
      }
      return cleaned;
    });

    const finalFilename = `${filename}_${new Date().toISOString()}`;
    this.handleExport(exportData, finalFilename, format);
  }

  clearFilters(): void {
    const defaultFromDate = new Date();
    defaultFromDate.setMonth(defaultFromDate.getMonth() - 8);

    this.datesForm.patchValue({
      fromdate: defaultFromDate,
      todate: new Date()
    });

    this.locations = this.locations.map(location => ({
      ...location,
      selected: location.value === 3
    }));

    this.selectedLocation = this.locations.find(loc => loc.selected) || this.locations[0];

    if (this.bloodCultureStatuses && this.bloodCultureStatuses.length > 0) {
      this.selectedBloodCultureStatus = this.bloodCultureStatuses.find(
        status => status.taskStatusid === "7"
      ) || this.bloodCultureStatuses[0];
    }

    this.labData = [];
    this.genderData = [];
    this.locationData = [];
    this.patientData = [];
    this.nationalityData = [];
    this.bloodCultureData = [];
    this.criticalValueData = [];
    this.turnaroundData = [];
    this.averageTimeData = [];
    this.patientsAndTests = [];
    this.LABTestOrdersWaitingAvgTime = [];

    this.chartOptions = {} as TreemapChartOptions;
    this.genderChart = {} as DonutChartOptions;
    this.locationChart = {} as DonutChartOptions;
    this.patientChart = {} as DonutChartOptions;
    this.nationalityChart = {} as DonutChartOptions;
    this.bloodCultureChart = null;

    this.seriesCriticalFailure = [];
    this.labTestSeries = [];
    this.turnaroundSeries = [];
    this.fetchLabData();
    this.fetchLabWaitingData();
  }

  loadTurnaroundTests() {
    this.turnaroundTests = (this.turnaroundData || []).map((test: any) => ({
      ...test,
      selected: false
    }));
    this.turnaroundTests.forEach((element: any) => {
      if (element.TestID.trim() == "3577" || element.TestID.trim() == "3507" || element.TestID.trim() == "4185" || element.TestID.trim() == "4161" 
        || element.TestID.trim() == "4160" || element.TestID.trim() == "3387") {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.selectedTests = this.turnaroundTests.filter(t => t.selected);
    if (this.selectedTests.length) {
      this.initTurnaroundChart(this.selectedTests);
    } else {
      this.turnaroundSeries = []
    }
  }

  toggleTestSelection(test: any) {
    test.selected = !test.selected;

    this.selectedTests = this.turnaroundTests.filter(t => t.selected);

    if (this.selectedTests.length >= 2) {
      this.initTurnaroundChart(this.selectedTests);
    } else {
      this.turnaroundSeries = []
    }
  }

  testOptionClicked(event: Event, test: any) {
    event.stopPropagation();
    this.toggleTestSelection(test);
  }

}