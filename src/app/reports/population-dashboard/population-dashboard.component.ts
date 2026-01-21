import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';
import { PopulationService } from '../population.service';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexLegend, ApexPlotOptions, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis } from 'ng-apexcharts';
import { ChartExportService } from '../chartexport.service';
import { position } from 'html2canvas/dist/types/css/property-descriptors/position';
import { color } from 'highcharts';
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

@Component({
  selector: 'app-population-dashboard',
  templateUrl: './population-dashboard.component.html',
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
export class PopulationDashboardComponent implements OnInit {
  datesForm: any;
  errorMsg = '';
  facility: number = 234;
  hospitalID: any;
  locations = [
    { label: 'Nuzha', value: 3, selected:  false},
    { label: 'Suwaidi', value: 2, selected: true }
  ];

  public chartPopulationStats!: ApexChart;
  public seriesPopulationStats: ApexAxisChartSeries = [];
  public xaxisPopulationStats!: ApexXAxis;
  public yaxisPopulationStats!: ApexYAxis | ApexYAxis[];
  public dataLabelsPopulationStats!: ApexDataLabels;
  public plotOptionsPopulationStats!: ApexPlotOptions;
  public fillPopulationStats!: ApexFill;
  public titlePopulationStats!: ApexTitleSubtitle;
  public tooltipPopulationStats!: ApexTooltip;
  public colorsPopulationStats!: string[];
  public legendPopulationStats!: ApexLegend;
  populationData: any = [];
  currentHypertensionData: any[] = [];
  currentAsthmaData: any[] = [];
  currentCopdData: any[] = [];
  currentIbdData: any[] = [];
  currentCadData: any[] = [];
  cadScreeningChartData: any;
  cadData: any;
  cadComorbiditiesChartData: any;
  cadComorbidities: any;

  asthmaCOPDStatistics: any;
  asthmaCOPDDonutChartData: any;
  public asthmaCopdGridRows: AsthmaCopdGridRow[] = [];
  diabetesGridRows: DiabetesGridRow[] = [];
  hypertensionGridRows: HypertensionGridRow[] = [];
  cadGridRows: CADGridRow[] = [];

  topCategories = [
    { label: 'ASTHMA & COPD', value: 'asthma' },
    { label: 'DIABETES MELLITUS', value: 'Diabetes' },
    { label: 'HYPERTENSION', value: 'hypertension' },
    { label: 'CORONARY ARTERY DISEASE', value: 'Coronary' },

  ];

  selectedCategory = this.topCategories[0];

  public ibdSeries: ApexAxisChartSeries = [];

  public ibdChart: ApexChart = {
    type: 'bar',
    height: 400,
  };

  public ibdXAxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '12px' } }
  };

  public ibdPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      distributed: true,
      borderRadius: 5,
      barHeight: '60%'
    }
  };

  public ibdFill: ApexFill = { type: 'solid' };

  public ibdColors: string[] = ['#10b981', '#6366f1', '#10b981', '#6366f1', '#10b981', '#6366f1'];

  public ibdLegend: ApexLegend = { show: false };

  public ibdTitle: ApexTitleSubtitle = {
    text: '',
    align: 'center',
    style: { fontSize: '18px', fontWeight: 'bold' }
  };

  public asthmaSeries: ApexAxisChartSeries = [];

  public asthmaChart: ApexChart = {
    type: 'bar',
    height: 350,
  };

  public asthmaXAxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '12px' } }
  };

  public asthmaPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      distributed: false,
     borderRadius: 1,
       columnWidth: '30%',
      barHeight: '45%',
      dataLabels: {
        position: 'top'
      }
    }
  };

  public asthmaFill: ApexFill = {
    type: ['gradient'],
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.4,
      gradientToColors: ['#b57bee'],
      inverseColors: false,
      opacityFrom: 0.9,
      opacityTo: 0.9,
      stops: [0, 100]
    }
  };

  public asthmaColors: string[] = ['#392d69'];

  public asthmaLegend: ApexLegend = { show: false };

  public asthmaTitle: ApexTitleSubtitle = {
    text: '',
    align: 'center',
    style: { fontSize: '18px', fontWeight: 'bold' }
  };

  public asthmaDataLabels = {
    enabled: true,
    formatter: (val: number) => `${val}`,
    offsetY: -20,
    background: { enabled: true ,borderRadius: 5,},
    style: {
      fontSize: '8px',
      //fontWeight: 'bold',
      colors: ['#392d69']
    }
  };

  public hypertensionSeries: ApexAxisChartSeries = [];

  public hypertensionChart: ApexChart = {
    type: 'bar',
    height: 350,
  };

  public hypertensionLegend: ApexLegend = { show: false };

  public hypertensionXAxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '12px' } }
  };

  public hypertensionPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      distributed: false,
      borderRadius: 1,
       columnWidth: '30%',
      barHeight: '45%',
      dataLabels: {
        position: 'top'
      }
    }
  };

  public hypertensionFill: ApexFill = {
    type: ['gradient'],
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.4,
      gradientToColors: ['#b57bee'],
      inverseColors: false,
      opacityFrom: 0.9,
      opacityTo: 0.9,
      stops: [0, 100]
    }
  };

  public hypertensionColors: string[] = ['#392d69'];

  public hypertensionTitle: ApexTitleSubtitle = {
    text: '',
    align: 'center',
    style: { fontSize: '18px', fontWeight: 'bold' }
  };

  public hypertensionDataLabels = {
    enabled: true,
    formatter: (val: number) => `${val}`,
    offsetY: -20,
    background: { enabled: true ,borderRadius: 5,},
    style: {
      fontSize: '8px',
      //fontWeight: 'bold',
      colors: ['#392d69']
    }
  }

  public copdSeries: ApexAxisChartSeries = [];

  public copdChart: ApexChart = {
    type: 'bar',
    height: 350,
  };

  public copdXAxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '12px' } }
  };

  public copdPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      distributed: false,
      borderRadius: 1,
       columnWidth: '30%',
      barHeight: '45%',
      dataLabels: {
        position: 'top'
      }
    }
  };

  public copdFill: ApexFill = {
    type: ['gradient'],
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.4,
      gradientToColors: ['#b57bee'],
      inverseColors: false,
      opacityFrom: 0.9,
      opacityTo: 0.9,
      stops: [0, 100]
    }
  };

  public copdColors: string[] = ['#392d69'];

  public copdLegend: ApexLegend = { show: false };

  public copdTitle: ApexTitleSubtitle = {
    text: '',
    align: 'center',
    style: { fontSize: '18px', fontWeight: 'bold' }
  };

  public copdDataLabels = {
    enabled: true,
    formatter: (val: number) => `${val}`,
    offsetY: -20,
    style: {
      fontSize: '8px',
      //fontWeight: 'bold',
      colors: ['#392d69']
    },
    background: { enabled: true ,borderRadius: 5,},
  };

  public diabetesSeries: ApexAxisChartSeries = [];

  public diabetesChart: ApexChart = {
    type: 'bar',
    height: 350,
  };

  public diabetesXAxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '12px' } }
  };

  public diabetesPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      distributed: false,
      borderRadius: 1,
       columnWidth: '30%',
      barHeight: '45%',
      dataLabels: {
        position: 'top'
      }
    }
  };

  public diabetesFill: ApexFill = {
    type: ['gradient'],
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.4,
      gradientToColors: ['#b57bee'],
      inverseColors: false,
      opacityFrom: 0.9,
      opacityTo: 0.9,
      stops: [0, 100]
    }
  };

  public diabetesColors: string[] = ['#392d69'];

  public diabetesLegend: ApexLegend = { show: false };

  public diabetesTitle: ApexTitleSubtitle = {
    text: '',
    align: 'center',
    style: { fontSize: '18px', fontWeight: 'bold' }
  };

  public diabetesDataLabels = {
    enabled: true,
    formatter: (val: number) => `${val}`,
    offsetY: -20,
    style: {
      fontSize: '12px',
      fontWeight: 'bold',
      colors: ['#392d69']
    },
    background: { enabled: true ,borderRadius: 5,},
  };

  public cadSeries: ApexAxisChartSeries = [];

  public cadChart: ApexChart = {
    type: 'bar',
    height: 350,
  };

  public cadXAxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '12px' } }
  };

  public cadPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      distributed: false,
      borderRadius: 1,
       columnWidth: '30%',
      barHeight: '45%',
      dataLabels: {
        position: 'top'
      }
    }
  };

  public cadFill: ApexFill = {
    type: ['gradient'],
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.4,
      gradientToColors: ['#b57bee'],
      inverseColors: false,
      opacityFrom: 0.9,
      opacityTo: 0.9,
      stops: [0, 100]
    }
  };

  public cadColors: string[] = ['#392d69'];

  public cadLegend: ApexLegend = { show: false };

  public cadTitle: ApexTitleSubtitle = {
    text: '',
    align: 'center',
    style: { fontSize: '18px', fontWeight: 'bold' }
  };

  public cadDataLabels = {
    enabled: true,
    formatter: (val: number) => `${val}`,
    offsetY: -20,
    style: {
      fontSize: '8px',
      //fontWeight: 'bold',
      colors: ['#392d69']
    },
    background: { enabled: true ,borderRadius: 5,},
  };

  asthmaAdmissionChartData: any;
  controllersChartData: any;
  causesChartData: any;
  inhalerChartData: any;
  diabetesStatistics: any;
  diabeticHBa1CChartData: any;
  diabeticLDLChartData: any;
  diabeticScreeningChartData: any;
  hypertensionData: any;
  hypertensionEGFRChartData: any;
  hypertensionLDLChartData: any;
  hypertensionScreeningChartData: any;
  gridRows: any[] = [];
  currentDiabetesData: any;

  loadCharts() {
    this.loadPopulationStatsChart();
    this.initHypertensionChart();
    this.initAsthmaChart();
    this.initCopdChart();
    this.initIbdChart();
    this.initCadChart();
    this.initDiabetesChart();
  }

  onSelectCategory(category: { label: string; value: string }) {
    this.selectedCategory = category;
    this.clearSecondaryCharts();
    this.fetchData();
  }
  private clearSecondaryCharts() {
    // this.doctorSeries = [];
    // this.deptSeries = [];
    // this.monthlySeries = [{ name: 'Count', data: Array(12).fill(0) }];
    // this.currentDoctorData = [];
    // this.currentDeptData = [];
    // this.currentMonthlyData = [];
    // this.selectedProcedureName = '';
    // this.selectedCategoryName = '';
    // this.resetSecondaryTitles();
  }

  private initCadChart() {
    const sortedDepartments = [...this.currentCadData].sort(
      (a, b) => +b.TotalCount - +a.TotalCount
    );

    this.cadSeries = [{
      name: 'Count',
      data: sortedDepartments.map(d => +d.TotalCount)
    }];

    this.cadXAxis = {
      categories: sortedDepartments.map(d => (d.Department as string)?.trim() || ''),
      labels: { style: { fontSize: '12px' } }
    };

    this.cadTitle = {
      text: `Coronary Artery Disease`,
      align: 'center',
      style: { fontSize: '18px', fontWeight: 'bold' }
    };
  }

  private initIbdChart() {
    const sortedDepartments = [...this.currentIbdData].sort(
      (a, b) => +b.TotalCount - +a.TotalCount
    );

    this.ibdSeries = [{
      name: 'Count',
      data: sortedDepartments.map(d => +d.TotalCount)
    }];

    this.ibdXAxis = {
      categories: sortedDepartments.map(d => (d.Department as string)?.trim() || ''),
      labels: { style: { fontSize: '12px' } }
    };

    this.ibdTitle = {
      text: `Inflammatory Bowel Disease`,
      align: 'center',
      style: { fontSize: '18px', fontWeight: 'bold' }
    };
  }


  private initCopdChart() {
    const sortedDepartments = [...this.currentCopdData].sort(
      (a, b) => +b.TotalCount - +a.TotalCount
    );

    this.copdSeries = [{
      name: 'Count',
      data: sortedDepartments.map(d => +d.TotalCount)
    }];

    this.copdXAxis = {
      categories: sortedDepartments.map(d => (d.Department as string)?.trim() || ''),
      labels: { style: { fontSize: '12px' }, trim: true }
    };

    this.copdTitle = {
      text: `COPD`,
      align: 'center',
      style: { fontSize: '18px', fontWeight: 'bold' }
    };
  }

  private initDiabetesChart() {
    const sortedDepartments = [...this.currentDiabetesData].sort(
      (a, b) => +b.TotalCount - +a.TotalCount
    );

    this.diabetesSeries = [{
      name: 'Count',
      data: sortedDepartments.map(d => +d.TotalCount)
    }];

    this.diabetesXAxis = {
      categories: sortedDepartments.map(d => (d.Department as string)?.trim() || ''),
      labels: { style: { fontSize: '12px' } }
    };

    this.diabetesTitle = {
      text: `Diabetes Mellitus`,
      align: 'center',
      style: { fontSize: '18px', fontWeight: 'bold' }
    };
  }

  loadPopulationStatsChart(): void {
    const categories = this.populationData.map((d: any) => d.POPULATIONTYPE);
    const counts = this.populationData.map((d: any) => +d.TotalCount);

    this.seriesPopulationStats = [
      {
        name: 'Population Count',
        data: counts
      }
    ];

    this.chartPopulationStats = {
      type: 'bar',
      height: 350,
      toolbar: { show: false }
    };

    this.plotOptionsPopulationStats = {
      bar: {
        horizontal: false,
        columnWidth: '45%',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.dataLabelsPopulationStats = {
      enabled: true,
      formatter: (val: number) => `${val}`,
      offsetY: -20,
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#000']
      }
    };

    this.colorsPopulationStats = ['#2563eb'];

    this.xaxisPopulationStats = {
      categories,
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.yaxisPopulationStats = {
      title: {
        text: 'Total Count',
        style: {
          fontWeight: 600,
          fontSize: '12px'
        }
      },
      labels: {
        formatter: (val: number) => `${val}`
      }
    };

    this.titlePopulationStats = {
      text: 'Disease Conditions',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };

    this.tooltipPopulationStats = {
      y: {
        formatter: (val: number) => `${val}`
      }
    };

    this.legendPopulationStats = {
      position: 'top',
      horizontalAlign: 'right'
    };

    this.fillPopulationStats = {
      type: ['gradient'],
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.4,
        gradientToColors: ['#b57bee'],
        inverseColors: false,
        opacityFrom: 0.9,
        opacityTo: 0.9,
        stops: [0, 100]
      }
    };
  }

  constructor(private fb: FormBuilder, private service: PopulationService, private exportService: ChartExportService) {
    const vm = new Date();
    vm.setMonth(vm.getMonth() - 2);

    this.datesForm = this.fb.group({
      fromdate: vm,
      todate: new Date()
    });
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

  ngOnInit(): void {
    this.hospitalID = Number(sessionStorage.getItem("hospitalId")) || 3;
    this.facility = Number(sessionStorage.getItem("facility")) || 234;
    const config = [this.selectedCategory.value];
    this.fetchData();
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

  fetchData(): void {
    const { fromdate, todate } = this.getFormattedDates();

    if (!this.areValidDates(fromdate, todate)) return;

    const selectedLocationIds = this.getSelectedLocationIds();

    this.service.fetchPopulationHealthStatistics(fromdate, todate, selectedLocationIds).subscribe({
      next: (response) => {
        if (response?.Code === 200) {
          this.populationData = response?.FetchPopulationhealthStatistics1DataList;
          this.currentDiabetesData = response?.FetchPopulationhealthStatistics2DataList;
          this.currentHypertensionData = response?.FetchPopulationhealthStatistics3DataList;
          this.currentAsthmaData = response?.FetchPopulationhealthStatistics4DataList;
          this.currentCopdData = response?.FetchPopulationhealthStatistics5DataList;
          this.currentIbdData = response?.FetchPopulationhealthStatistics7DataList;
          this.currentCadData = response?.FetchPopulationhealthStatistics6DataList;

          this.loadCharts();
        } else {
          this.showErrorModal('Unexpected response code: ' + response?.Code);
        }
      },
      error: (err) => {
        console.error('Error fetching population data:', err);
        this.showErrorModal('An error occurred while fetching lab data.');
      }
    });

    if (this.selectedCategory.value == 'asthma') {
      this.service.fetchPopulationHealthAsthmaCOPD(fromdate, todate, selectedLocationIds).subscribe({
        next: (response) => {
          if (response?.Code === 200) {
            this.asthmaCOPDStatistics = response.FetchPopulationhealthOsthmaCOPD1DataList[0];
            this.asthmaCOPDDonutChart(response.FetchPopulationhealthOsthmaCOPD2DataList);
            this.asthmaAdmissionChart(response.FetchPopulationhealthOsthmaCOPD4DataList);
            this.controllersChart(response.FetchPopulationhealthOsthmaCOPD6DataList);
            this.causesChart(response.FetchPopulationhealthOsthmaCOPD5DataList);
            this.inhalerChart(response.FetchPopulationhealthOsthmaCOPD7DataList);

            this.buildAsthmaGridRows(
              response.FetchPopulationhealthOsthmaCOPD4DataList,
              response.FetchPopulationhealthOsthmaCOPD5DataList,
              response.FetchPopulationhealthOsthmaCOPD7DataList
            );

            this.buildCopdGridRows(
              response.FetchPopulationhealthOsthmaCOPD4DataList,
              response.FetchPopulationhealthOsthmaCOPD5DataList,
              response.FetchPopulationhealthOsthmaCOPD7DataList
            );
          } else {
            this.showErrorModal('Unexpected response code: ' + response?.Code);
          }
        },
        error: (err) => {
          console.error('Error fetching population data:', err);
          this.showErrorModal('An error occurred while fetching lab data.');
        }
      });
    }
    if (this.selectedCategory.value == 'Diabetes') {

      this.service.fetchPopulationHealthDiabetes(fromdate, todate, selectedLocationIds).subscribe({
        next: (response) => {
          if (response?.Code === 200) {
            this.diabetesStatistics = response.FetchPopulationhealthDiabetesMellitus1CHISBI1DataList[0];
            this.diabeticHBa1CChart(response.FetchPopulationhealthDiabetesMellitus1CHISBI3DataList);
            this.diabeticLDLCChart(response.FetchPopulationhealthDiabetesMellitus1CHISBI4DataList);
            this.diabeticScreeningChart(response.FetchPopulationhealthDiabetesMellitus1CHISBI2DataList);

            this.buildDiabetesGridRows(
              response.FetchPopulationhealthDiabetesMellitus1CHISBI2DataList,
              response.FetchPopulationhealthDiabetesMellitus1CHISBI3DataList,
              response.FetchPopulationhealthDiabetesMellitus1CHISBI4DataList,
              response.FetchPopulationhealthDiabetesMellitus1CHISBI1DataList[0]
            );
          } else {
            this.showErrorModal('Unexpected response code: ' + response?.Code);
          }
        },
        error: (err) => {
          console.error('Error fetching population data:', err);
          this.showErrorModal('An error occurred while fetching lab data.');
        }
      });

    }
    if (this.selectedCategory.value == 'hypertension') {
      this.service.fetchPopulationHealthHypertension(fromdate, todate, selectedLocationIds).subscribe({
        next: (response) => {
          if (response?.Code === 200) {
            this.hypertensionData = response.FetchPopulationhealthHypertension1DHISBI1DataList[0];
            this.hypertensionEGFRChart(response.FetchPopulationhealthHypertension1DHISBI3DataList);
            this.hypertensionLDLChart(response.FetchPopulationhealthHypertension1DHISBI4DataList);
            this.hypertensionScreeningChart(response.FetchPopulationhealthHypertension1DHISBI2DataList);

            this.buildHypertensionGridRows(
              response.FetchPopulationhealthHypertension1DHISBI2DataList,
              response.FetchPopulationhealthHypertension1DHISBI3DataList,
              response.FetchPopulationhealthHypertension1DHISBI4DataList,
              this.hypertensionData
            );
          } else {
            this.showErrorModal('Unexpected response code: ' + response?.Code);
          }
        },
        error: (err) => {
          console.error('Error fetching population data:', err);
          this.showErrorModal('An error occurred while fetching lab data.');
        }
      });

    }
    if (this.selectedCategory.value == 'Coronary') {
      this.service.fetchPopulationHealthCAD(fromdate, todate, selectedLocationIds).subscribe({
        next: (response) => {
          if (response?.Code === 200) {
            this.cadData = response.FetchPopulationhealthCAD1EHISBI1DataList[0];
            const comorbidityData = response.FetchPopulationhealthCAD1EHISBI3DataList[0];
            this.cadComorbidities = [
              { name: 'Diabetes', count: +comorbidityData.Diabetes },
              { name: 'Hypertension', count: +comorbidityData.Hypertension },
              { name: 'Obesity', count: +comorbidityData.Obesity }
            ];
            this.cadScreeningComplianceChart(response.FetchPopulationhealthCAD1EHISBI2DataList);
            this.cadComorbiditiesChart(response.FetchPopulationhealthCAD1EHISBI3DataList);

            this.buildCADGridRows(response.FetchPopulationhealthCAD1EHISBI2DataList, response.FetchPopulationhealthCAD1EHISBI1DataList[0]);
          } else {
            this.showErrorModal('Unexpected response code: ' + response?.Code);
          }
        },
        error: (err) => {
          console.error('Error fetching population data:', err);
          this.showErrorModal('An error occurred while fetching lab data.');
        }
      });
    }



  }

  asthmaCOPDDonutChart(chartData: any) {
    if (chartData.length > 0) {
      const series = [Number(chartData[0].TotalCount), Number(chartData[1].TotalCount)];
      const labels = [chartData[0].POPULATIONTYPE, chartData[1].POPULATIONTYPE];
      const colors = ['#EC4040', '#1EC35C'];
      this.asthmaCOPDDonutChartData = {
        series,
        chart: {
          type: 'donut',
          width: '100%',
          height: '220px',
        },
        labels: labels,
        colors,
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.4,
            gradientToColors: colors,
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
          position: "bottom"
        },
        title: {
          text: 'ASTHMA & COPD',
          align: 'center',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#00000'
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
          formatter: (_: any, opts: any) => {
            const value = opts.w.config.series[opts.seriesIndex];
            return `${Number(value)}`;
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
              // chart: { width: 150, height: 210 },
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
              labels: { show: false }
            },
            dataLabels: {
              offset: 20
            }
          }
        }
      };
    } else {
      this.asthmaCOPDDonutChartData = null;
    }
  }

  asthmaAdmissionChart(chartData: any): void {
    if (chartData.length > 0) {
      const grouped: any = {};

      chartData.forEach((item: any) => {
        const month = item.MonthName;
        if (!grouped[month]) {
          grouped[month] = { IP: 0, OP: 0, ED: 0 };
        }
        grouped[month][item.PatientType] = parseInt(item.TotalCount, 10);
      });

      const categories = Object.keys(grouped);
      const ipCounts = categories.map(spec => grouped[spec].IP);
      const opCounts = categories.map(spec => grouped[spec].OP);
      const edCounts = categories.map(spec => grouped[spec].ED);

      this.asthmaAdmissionChartData = {};

      this.asthmaAdmissionChartData.series = [
        {
          name: 'Admissions',
          data: ipCounts
        },
        {
          name: 'ER',
          data: edCounts
        }
      ];

      this.asthmaAdmissionChartData.chart = {
        type: 'bar',
        height: 300,
        stacked: false,
        toolbar: { show: true },
        zoom: { enabled: false },
      };

      this.asthmaAdmissionChartData.plotOptions = {
        bar: {
          columnWidth: '45%',
          borderRadius: 1,
          dataLabels: {
            position: 'top'
          }
        }
      };
      this.asthmaAdmissionChartData.stroke = {
        curve: ["transparent"],
        width: 2
      };

      this.asthmaAdmissionChartData.dataLabels = {
        enabled: true,
        style: {
          fontSize: '8px',
          //fontWeight: 'bold',
          colors: ['#443C68', '#5B8FB9'],
        },
        offsetY: -20,
        background: { enabled: true ,borderRadius: 5,},
        formatter: (val: number, opts: any) => {            
                if (val > 0) 
                return val.toString();
            else
                return;
            
        }
        // formatter: function (val: number) {
        //   return val.toString();
        // }
      };

      this.asthmaAdmissionChartData.xaxis = {
        categories: categories,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      };

      this.asthmaAdmissionChartData.yaxis = {
        title: {
          text: '',
          style: {
            fontWeight: '600',
            fontSize: '12px'
          },
          offsetX: -10,
          rotate: -90,
        },

        labels: {
          formatter: function (val: number) {
            return val.toFixed(0);
          }
        }
      };

      this.asthmaAdmissionChartData.colors = ['#443C68', '#5B8FB9'];

      this.asthmaAdmissionChartData.tooltip = {
        shared: true,
        intersect: false,
        y: {
          formatter: function (val: number) {
            return val ?? 0;
          }
        }
      };

      this.asthmaAdmissionChartData.title = {
        text: 'Asthma Patients-ER & Admission',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      };
      this.asthmaAdmissionChartData.fill = {
        type: ['gradient', 'gradient'],
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          gradientToColors: ['#30c5d2', '#9bd46a'],
          inverseColors: false,
          opacityFrom: 0.9,
          opacityTo: 0.9,
          stops: [0, 80, 100],
        }
      };

      this.asthmaAdmissionChartData.legend = {
        position: 'bottom',
        horizontalAlign: 'right',
      };
    } else {
      this.asthmaAdmissionChartData = null;
    }
  }

  controllersChart(chartData: any): void {
    if (chartData.length > 0) {
      const categories = chartData.map((d: any) => d.ADHERENTType);
      const percentage = chartData.map((d: any) => +d.TotalCount_Per);
      this.controllersChartData = {};

      this.controllersChartData.series = [
        {
          name: '',
          data: percentage
        }
      ];

      this.controllersChartData.chart = {
        type: 'bar',
        height: 300,
        toolbar: { show: true }
      };

      this.controllersChartData.plotOptions = {
        bar: {
          horizontal: false,
          columnWidth: '45%',
          borderRadius: 4,
          dataLabels: {
            position: 'top'
          }
        }
      };

      this.controllersChartData.dataLabels = {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`,
        offsetY: -20,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#000']
        }
      };

      this.controllersChartData.colors = ['#471069'];

      this.controllersChartData.xaxis = {
        categories,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: 500
          }
        }
      };

      this.controllersChartData.yaxis = {
        title: {
          text: '',
          style: {
            fontWeight: 600,
            fontSize: '12px'
          }
        },
        labels: {
          formatter: (val: number) => `${val.toFixed(1)}%`
        }
      };

      this.controllersChartData.title = {
        text: 'CONTROLLERS (LABA) - COPD',
        align: 'center',
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#1e293b'
        }
      };

      this.controllersChartData.tooltip = {
        y: {
          formatter: (val: number) => `${val.toFixed(2)}%`
        }
      };

      this.controllersChartData.legend = {
        position: 'top',
        horizontalAlign: 'right'
      };

      this.controllersChartData.fill = {
        type: ['gradient'],
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          gradientToColors: ['#30c5d2'],
          inverseColors: false,
          opacityFrom: 0.9,
          opacityTo: 0.9,
          stops: [0, 100]
        }
      };
    } else {
      this.controllersChartData = null;
    }
  }

  causesChart(chartData: any): void {
    if (chartData.length > 0) {
      const categories = chartData.map((e: any) => e.MonthName);
      this.causesChartData = {};

      this.causesChartData.series = [
        {
          name: 'Smoker',
          data: chartData.map((d: any) => +d.SMOKER)
        },
        {
          name: 'Alpha-1',
          data: chartData.map((d: any) => +d.ALPHA1)
        },
        {
          name: 'Age>40',
          data: chartData.map((d: any) => +d.Agegreaterthan40)
        }
      ];

      this.causesChartData.chart = {
        type: 'bar',
        height: 300,
        stacked: false,
        toolbar: { show: true },
        zoom: { enabled: false },
      };

      this.causesChartData.plotOptions = {
        bar: {
          columnWidth: '45%',
          borderRadius: 2,
          dataLabels: {
            position: 'top'
          }
        }
      };
      this.causesChartData.stroke = {
        curve: ["transparent"],
        width: 2
      };

      this.causesChartData.dataLabels = {
        enabled: true,
        style: {
          fontSize: '8px',
          //fontWeight: 'bold',
          colors: ['#5257e5', '#3EC70B', '#392d69'],
        },
        offsetY: -20,
         background: { enabled: true ,borderRadius: 5,},
       
          formatter: (val: number, opts: any) => {            
                          if (val > 0) 
                          return `${val}`;
                      else
                          return;
                      
                  }
      };

      this.causesChartData.xaxis = {
        categories: categories,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      };

      this.causesChartData.yaxis = {
        title: {
          text: '',
          style: {
            fontWeight: '600',
            fontSize: '12px'
          },
          offsetX: -10,
          rotate: -90,
        },

        labels: {
          formatter: function (val: number) {
            return val.toFixed(0);
          }
        }
      };

      this.causesChartData.colors = ['#5257e5', '#5da92f', '#392d69'];

      this.causesChartData.tooltip = {
        shared: true,
        intersect: false,
        y: {
          formatter: function (val: number) {
            return val ?? 0;
          }
        }
      };

      this.causesChartData.title = {
        text: 'COPD Causes',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      };
      this.causesChartData.fill = {
        type: ['gradient', 'gradient', 'gradient'],
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          gradientToColors: ['#30c5d2', '#9bd46a', '#b57bee'],
          inverseColors: false,
          opacityFrom: 0.9,
          opacityTo: 0.9,
          stops: [0, 80, 100],
        }
      };

      this.causesChartData.legend = {
        position: 'bottom',
        horizontalAlign: 'right',
      };
    } else {
      this.causesChartData = null;
    }
  }

  inhalerChart(chartData: any) {
    if (chartData.length > 0) {
      const categories = chartData.map((e: any) => e.MonthName);
      this.inhalerChartData = {};

      this.inhalerChartData.series = [
        {
          name: 'Asthma',
          data: chartData.map((d: any) => +d.INHALER_ASTHMA_COUNT_PER)
        },
        {
          name: 'COPD',
          data: chartData.map((d: any) => +d.INHALER_COPD_COUNT_PER)
        }
      ];

      this.inhalerChartData.chart = {
        type: 'bar',
        height: 300,
        stacked: false,
        toolbar: { show: true },
        zoom: { enabled: false },
      };

      this.inhalerChartData.plotOptions = {
        bar: {
          columnWidth: '40%',
          borderRadius: 2,
          dataLabels: {
            position: 'top'
          }
        }
      };
      this.inhalerChartData.stroke = {
        curve: ["transparent"],
        width: 2
      };

      this.inhalerChartData.dataLabels = {
        enabled: true,
        //formatter: (val: number) => `${val.toFixed(1)}%`,
        style: {
          fontSize: '8px',
          //fontWeight: 'bold',
          colors: ['#610C9F', '#DA0C81'],
        },
        offsetY: -25,
        background: { enabled: true ,borderRadius: 5,},
        formatter: (val: number, opts: any) => {            
                if (val > 0) 
                return `${val.toFixed(1)}%`;
            else
                return;
            
        }
      };

      this.inhalerChartData.xaxis = {
        categories: categories,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      };

      this.inhalerChartData.yaxis = {
        title: {
          text: '',
          style: {
            fontWeight: '600',
            fontSize: '12px'
          },
          offsetX: -10,
          rotate: -90,
        },

        labels: {
          formatter: (val: number) => `${val.toFixed(1)}%`
        }
      };

      this.inhalerChartData.colors = ['#610C9F', '#DA0C81'];

      this.inhalerChartData.tooltip = {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val.toFixed(2)}%`
        }
      };

      this.inhalerChartData.title = {
        text: 'Inhaler Compliance',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      };
      this.inhalerChartData.fill = {
        type: ['gradient', 'gradient'],
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          gradientToColors: ['#30c5d2', '#9bd46a'],
          inverseColors: false,
          opacityFrom: 0.9,
          opacityTo: 0.9,
          stops: [0, 80, 100],
        }
      };

      this.inhalerChartData.legend = {
        position: 'bottom',
        horizontalAlign: 'right',
      };
    } else {
      this.inhalerChartData = null;
    }
  }

  diabeticHBa1CChart(chartData: any) {
    if (chartData.length > 0) {
      const categories = chartData.map((e: any) => e.MonthName);
      this.diabeticHBa1CChartData = {};

      this.diabeticHBa1CChartData.series = [
        {
          name: 'HBA1C',
          data: chartData.map((d: any) => +d.HBa1cCount)
        },
        {
          name: 'HBA1C<7',
          data: chartData.map((d: any) => +d.HbA1CLess7Count)
        }
      ];

      this.diabeticHBa1CChartData.chart = {
        type: 'bar',
        height: 275,
        stacked: false,
        toolbar: { show: true },
        zoom: { enabled: false },
      };

      this.diabeticHBa1CChartData.plotOptions = {
        bar: {
          columnWidth: '45%',
          borderRadius: 1,
          dataLabels: {
            position: 'top'
          }
        }
      };
      this.diabeticHBa1CChartData.stroke = {
        curve: ["transparent"],
        width: 2
      };

      this.diabeticHBa1CChartData.dataLabels = {
        enabled: true,
       formatter: (val: number, opts: any) => {            
                if (val > 0) 
                return `${val}`;
            else
                return;
            
        },
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors:  ['#3F0071', '#FB2576'],
        },
        offsetY: -25,
        background: { enabled: true ,borderRadius: 5,},
      };

      this.diabeticHBa1CChartData.xaxis = {
        categories: categories,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      };

      this.diabeticHBa1CChartData.yaxis = {
        title: {
          text: '',
          style: {
            fontWeight: '600',
            fontSize: '12px'
          },
          offsetX: -10,
          rotate: -90,
        },

        labels: {
          formatter: (val: number) => `${val}`,
        }
      };

      this.diabeticHBa1CChartData.colors = ['#3F0071', '#FB2576'];

      this.diabeticHBa1CChartData.tooltip = {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val}`,
        }
      };

      this.diabeticHBa1CChartData.title = {
        text: 'DIABETIC PATIENTS HBa1C <7',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      };
      this.diabeticHBa1CChartData.fill = {
        type: ['solid', 'solid']
      };

      this.diabeticHBa1CChartData.legend = {
        position: 'bottom',
        horizontalAlign: 'right',
      };
    } else {
      this.diabeticHBa1CChartData = null;
    }
  }

  diabeticLDLCChart(chartData: any) {
    if (chartData.length > 0) {
      const categories = chartData.map((e: any) => e.MonthName);
      this.diabeticLDLChartData = {};

      this.diabeticLDLChartData.series = [
        {
          name: 'LDL',
          data: chartData.map((d: any) => +d.LDLCount)
        },
        {
          name: 'LDL<100',
          data: chartData.map((d: any) => +d.LDLLess100Count)
        }
      ];

      this.diabeticLDLChartData.chart = {
        type: 'bar',
        height: 275,
        stacked: false,
        toolbar: { show: true },
        zoom: { enabled: false },
      };

      this.diabeticLDLChartData.plotOptions = {
        bar: {
          columnWidth: '45%',
          borderRadius: 1,
          dataLabels: {
            position: 'top'
          }
        }
      };
      this.diabeticLDLChartData.stroke = {
        curve: ["transparent"],
        width: 2
      };

      this.diabeticLDLChartData.dataLabels = {
        enabled: true,
        formatter: (val: number, opts: any) => {            
                if (val > 0) 
                return `${val}`;
            else
                return;
            
        },
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#FF0000', '#916BBF'],
        },
        offsetY: -25,
        background: { enabled: true ,borderRadius: 5,},
      };

      this.diabeticLDLChartData.xaxis = {
        categories: categories,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      };

      this.diabeticLDLChartData.yaxis = {
        title: {
          text: '',
          style: {
            fontWeight: '600',
            fontSize: '12px'
          },
          offsetX: -10,
          rotate: -90,
        },

        labels: {
          formatter: (val: number) => `${val}`,
        }
      };

      this.diabeticLDLChartData.colors = ['#FF0000', '#916BBF'];

      this.diabeticLDLChartData.tooltip = {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val}`,
        }
      };

      this.diabeticLDLChartData.title = {
        text: 'DIABETIC PATIENTS LDL ≤100 mg/dl',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      };
      this.diabeticLDLChartData.fill = {
        type: ['solid', 'solid']
      };

      this.diabeticLDLChartData.legend = {
        position: 'bottom',
        horizontalAlign: 'right',
      };
    } else {
      this.diabeticLDLChartData = null;
    }
  }

  diabeticScreeningChart(chartData: any) {
    if (chartData.length > 0) {
      const categories = chartData.map((e: any) => e.MonthName);
      this.diabeticScreeningChartData = {};

      this.diabeticScreeningChartData.series = [
        {
          name: 'Eye Exam',
          data: chartData.map((d: any) => +d.TotalDM_EyeExamPer)
        },
        {
          name: 'HBA1C',
          data: chartData.map((d: any) => +d.HBa1cCountPer)
        },
        {
          name: 'LDL Cholestrol',
          data: chartData.map((d: any) => +d.LDLCountPer)
        },
        {
          name: 'uACR',
          data: chartData.map((d: any) => +d.CREATININECountPer)
        }
      ];

      this.diabeticScreeningChartData.chart = {
        type: 'bar',
        height: 450,
        stacked: false,
        toolbar: { show: true },
        zoom: { enabled: false },
      };

      this.diabeticScreeningChartData.plotOptions = {
        bar: {
          columnWidth: '45%',
          borderRadius: 2,
          dataLabels: {
            position: 'top'
          }
        }
      };
      this.diabeticScreeningChartData.stroke = {
        curve: ["transparent"],
        width: 2
      };

      this.diabeticScreeningChartData.dataLabels = {
        enabled: true,
        //formatter: (val: number) => `${val.toFixed(1)}%`,
        formatter: (val: number, opts: any) => {            
                if (val > 0) 
                return `${val.toFixed(1)}%`;
            else
                return;
            
        },
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#610094', '#FF4C29', '#39311D', '#C70039'],
        },
        offsetY: -25,
        background: { enabled: true ,borderRadius: 5,},
      };

      this.diabeticScreeningChartData.xaxis = {
        categories: categories,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      };

      this.diabeticScreeningChartData.yaxis = {
        title: {
          text: '',
          style: {
            fontWeight: '600',
            fontSize: '12px'
          },
          offsetX: -10,
          rotate: -90,
        },

        labels: {
          formatter: (val: number) => `${val.toFixed(1)}%`,
        }
      };

      this.diabeticScreeningChartData.colors =['#610094', '#FF4C29', '#39311D', '#C70039'];

      this.diabeticScreeningChartData.tooltip = {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val.toFixed(1)}%`,
        }
      };

      this.diabeticScreeningChartData.title = {
        text: 'DIABETIC PATIENT SCREENING COMPLIANCE RATE',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      };
      this.diabeticScreeningChartData.fill = {
        type: ['gradient', 'gradient'],
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          inverseColors: false,
          opacityFrom: 0.9,
          opacityTo: 0.9,
          stops: [0, 80, 100],
        }
      };

      this.diabeticScreeningChartData.legend = {
        position: 'bottom',
        horizontalAlign: 'right',
      };
    } else {
      this.diabeticScreeningChartData = null;
    }
  }

  clearAllFilters(): void {
    const defaultFromDate = new Date();
    defaultFromDate.setMonth(defaultFromDate.getMonth() - 8);

    this.datesForm = this.fb.group({
      fromdate: defaultFromDate,
      todate: new Date()
    });

    this.locations = [
      { label: 'Nuzha', value: 3, selected: true },
      { label: 'Suwaidi', value: 2, selected: false }
    ];

    this.selectedCategory = this.topCategories[0];

    this.facility = Number(sessionStorage.getItem("facility")) || 234;
    this.hospitalID = Number(sessionStorage.getItem("hospitalId")) || 3;

    this.populationData = [];
    this.currentHypertensionData = [];
    this.currentAsthmaData = [];
    this.currentCopdData = [];
    this.currentIbdData = [];
    this.currentCadData = [];
    this.currentDiabetesData = [];

    this.asthmaCOPDStatistics = null;
    this.asthmaCOPDDonutChartData = null;
    this.asthmaAdmissionChartData = null;
    this.controllersChartData = null;
    this.causesChartData = null;
    this.inhalerChartData = null;

    this.diabetesStatistics = null;
    this.diabeticHBa1CChartData = null;
    this.diabeticLDLChartData = null;
    this.diabeticScreeningChartData = null;

    this.hypertensionData = null;
    this.hypertensionEGFRChartData = null;
    this.hypertensionLDLChartData = null;
    this.hypertensionScreeningChartData = null;

    this.cadData = null;
    this.cadScreeningChartData = null;
    this.cadComorbiditiesChartData = null;
    this.cadComorbidities = null;

    this.asthmaCopdGridRows = [];
    this.diabetesGridRows = [];
    this.hypertensionGridRows = [];
    this.cadGridRows = [];
    this.gridRows = [];

    this.seriesPopulationStats = [];
    this.ibdSeries = [];
    this.asthmaSeries = [];
    this.hypertensionSeries = [];
    this.copdSeries = [];
    this.cadSeries = [];

    this.errorMsg = '';

    this.fetchData();
  }

  locationOptionClicked(event: Event, item: any) {
    event.stopPropagation();
    this.toggleLocationSelection(item);
  }

  toggleLocationSelection(item: any) {
    item.selected = !item.selected;
  }

  private initHypertensionChart() {
    const sortedDepartments = [...this.currentHypertensionData].sort((a, b) => +b.TotalCount - +a.TotalCount);

    this.hypertensionSeries = [{
      name: 'Count',
      data: sortedDepartments.map(d => +d.TotalCount)
    }];

    this.hypertensionXAxis = {
      categories: sortedDepartments.map(d => (d.Department as string)?.trim() || ''),
      labels: { style: { fontSize: '12px' } }
    };

    this.hypertensionTitle = {
      text: `Hypertension`,
      align: 'center',
      style: { fontSize: '18px', fontWeight: 'bold' }
    };
  }

  private initAsthmaChart() {
    const sortedDepartments = [...this.currentAsthmaData].sort(
      (a, b) => +b.TotalCount - +a.TotalCount
    );

    this.asthmaSeries = [{
      name: 'Count',
      data: sortedDepartments.map(d => +d.TotalCount)
    }];

    this.asthmaXAxis = {
      categories: sortedDepartments.map(d => (d.Department as string)?.trim() || ''),
      labels: { style: { fontSize: '12px' }, trim: true }
    };

    this.asthmaTitle = {
      text: `Asthma`,
      align: 'center',
      style: { fontSize: '18px', fontWeight: 'bold' }
    };
  }

  hypertensionEGFRChart(chartData: any) {
    if (chartData.length > 0) {
      const categories = chartData.map((e: any) => e.MonthName);
      this.hypertensionEGFRChartData = {};

      this.hypertensionEGFRChartData.series = [
        {
          name: 'eGFR',
          data: chartData.map((d: any) => +d.eGFRCount)
        },
        {
          name: 'eGFR < 60',
          data: chartData.map((d: any) => +d.eGFRLess60Count)
        }
      ];

      this.hypertensionEGFRChartData.chart = {
        type: 'bar',
        height: 275,
        stacked: false,
        toolbar: { show: true },
        zoom: { enabled: false },
      };

      this.hypertensionEGFRChartData.plotOptions = {
        bar: {
          columnWidth: '40%',
          borderRadius: 2,
          dataLabels: {
            position: 'top'
          }
        }
      };

      this.hypertensionEGFRChartData.stroke = {
        curve: ["transparent"],
        width: 2
      };

      this.hypertensionEGFRChartData.dataLabels = {
        enabled: true,
        // formatter: (val: number) => `${val}`,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#503C3C', '#818FB4'],
        },
        offsetY: -25,
        background: { enabled: true ,borderRadius: 5,},
        formatter: (val: number, opts: any) => {            
                if (val > 0) 
                return `${val}`;
            else
                return;
            
        }

      };

      this.hypertensionEGFRChartData.xaxis = {
        categories: categories,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      };

      this.hypertensionEGFRChartData.yaxis = {
        title: {
          text: '',
          style: {
            fontWeight: '600',
            fontSize: '12px'
          },
          offsetX: -10,
          rotate: -90,
        },
        labels: {
          formatter: (val: number) => `${val}`,
        }
      };

      this.hypertensionEGFRChartData.colors = ['#503C3C', '#818FB4'];

      this.hypertensionEGFRChartData.tooltip = {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val}`,
        }
      };

      this.hypertensionEGFRChartData.title = {
        text: 'HYPERTENSIVE PATIENTS eGFR & eGFR < 60',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      };

      this.hypertensionEGFRChartData.fill = {
        type: ['solid', 'solid']
      };

      this.hypertensionEGFRChartData.legend = {
        position: 'bottom',
        horizontalAlign: 'right',
      };
    } else {
      this.hypertensionEGFRChartData = null;
    }
  }

  hypertensionLDLChart(chartData: any) {
    if (chartData.length > 0) {
      const categories = chartData.map((e: any) => e.MonthName);
      this.hypertensionLDLChartData = {};

      this.hypertensionLDLChartData.series = [
        {
          name: 'LDL',
          data: chartData.map((d: any) => +d.LDLCount)
        },
        {
          name: 'LDL ≤ 100',
          data: chartData.map((d: any) => +d.LDLLess100Count)
        }
      ];

      this.hypertensionLDLChartData.chart = {
        type: 'bar',
        height: 275,
        stacked: false,
        toolbar: { show: true },
        zoom: { enabled: false },
      };

      this.hypertensionLDLChartData.plotOptions = {
        bar: {
          columnWidth: '40%',
          borderRadius: 2,
          dataLabels: {
            position: 'top'
          }
        }
      };

      this.hypertensionLDLChartData.stroke = {
        curve: ["transparent"],
        width: 2
      };

      this.hypertensionLDLChartData.dataLabels = {
        enabled: true,
        formatter: (val: number, opts: any) => {            
                if (val > 0) 
                return `${val}`;
            else
                return;
            
        },
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#610C9F', '#DA0C81'],
        },
        offsetY: -25,
        background: { enabled: true ,borderRadius: 5,},
      };

      this.hypertensionLDLChartData.xaxis = {
        categories: categories,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      };

      this.hypertensionLDLChartData.yaxis = {
        title: {
          text: '',
          style: {
            fontWeight: '600',
            fontSize: '12px'
          },
          offsetX: -10,
          rotate: -90,
        },
        labels: {
          formatter: (val: number) => `${val}`,
        }
      };

      this.hypertensionLDLChartData.colors = ['#610C9F', '#DA0C81'];

      this.hypertensionLDLChartData.tooltip = {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val}`,
        }
      };

      this.hypertensionLDLChartData.title = {
        text: 'HYPERTENSIVE PATIENTS LDL & LDL ≤ 100',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      };

      this.hypertensionLDLChartData.fill = {
        type: ['solid', 'solid']
      };

      this.hypertensionLDLChartData.legend = {
        position: 'bottom',
        horizontalAlign: 'right',
      };
    } else {
      this.hypertensionLDLChartData = null;
    }
  }

  hypertensionScreeningChart(chartData: any) {
    if (chartData.length > 0) {
      const categories = chartData.map((e: any) => e.MonthName);
      this.hypertensionScreeningChartData = {};

      this.hypertensionScreeningChartData.series = [
        {
          name: 'Controlled',
          data: chartData.map((d: any) => +d.CONTROLLED)
        },
        {
          name: 'Uncontrolled',
          data: chartData.map((d: any) => +d.UNCONTROLLED)
        },
        {
          name: 'Lipid Profile',
          data: chartData.map((d: any) => +d.LipidProfileCount)
        },
        {
          name: 'eGFR',
          data: chartData.map((d: any) => +d.eGFR)
        },
        {
          name: 'ACR',
          data: chartData.map((d: any) => +d.ACRCount)
        },
        {
          name: 'FBS',
          data: chartData.map((d: any) => +d.FastingBloodSugarCount)
        }
      ];

      this.hypertensionScreeningChartData.chart = {
        type: 'bar',
        height: 350,
        stacked: false,
        toolbar: { show: true },
        zoom: { enabled: false },
      };

      this.hypertensionScreeningChartData.plotOptions = {
        bar: {
          columnWidth: '50%',
          borderRadius: 2,
          dataLabels: {
            position: 'top'
          }
        }
      };

      this.hypertensionScreeningChartData.stroke = {
        curve: ["transparent"],
        width: 2
      };

      this.hypertensionScreeningChartData.dataLabels = {
        enabled: true,
        formatter: (val: number) => `${val}`,
        style: {
          fontSize: '11px',
          fontWeight: 'bold',
          colors: ['#000'],
        },
        offsetY: -20
      };

      this.hypertensionScreeningChartData.xaxis = {
        categories: categories,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      };

      this.hypertensionScreeningChartData.yaxis = {
        title: {
          text: '',
          style: {
            fontWeight: '600',
            fontSize: '12px'
          },
          offsetX: -10,
          rotate: -90,
        },
        labels: {
          formatter: (val: number) => `${val}`,
        }
      };

      this.hypertensionScreeningChartData.colors = ['#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6610f2', '#fd7e14'];

      this.hypertensionScreeningChartData.tooltip = {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val}`
        }
      };

      this.hypertensionScreeningChartData.title = {
        text: 'HYPERTENSIVE PATIENTS SCREENING COMPLIANCE',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      };

      this.hypertensionScreeningChartData.fill = {
        type: ['solid', 'solid', 'solid', 'solid', 'solid', 'solid']
      };

      this.hypertensionScreeningChartData.legend = {
        position: 'bottom',
        horizontalAlign: 'center',
      };
    } else {
      this.hypertensionScreeningChartData = null;
    }
  }

  cadScreeningComplianceChart(chartData: any) {
    if (chartData.length > 0) {
      const categories = chartData.map((e: any) => e.MonthName);
      this.cadScreeningChartData = {};

      this.cadScreeningChartData.series = [
        {
          name: 'LDL',
          data: chartData.map((d: any) => +d.LDLCount)
        },
        {
          name: 'HBa1C',
          data: chartData.map((d: any) => +d.HBa1CCount)
        },
        {
          name: 'Stress Test',
          data: chartData.map((d: any) => +d.STRESSTEST)
        },
        {
          name: 'Echocardiogram',
          data: chartData.map((d: any) => +d.ECHO_CARDIOGRAM)
        },
        {
          name: 'CT Angiogram',
          data: chartData.map((d: any) => +d.CT_ANGIOGRAM)
        }
      ];

      this.cadScreeningChartData.chart = {
        type: 'bar',
        height: 350,
        stacked: false,
        toolbar: { show: true },
        zoom: { enabled: false },
      };

      this.cadScreeningChartData.plotOptions = {
        bar: {
          columnWidth: '50%',
          borderRadius: 2,
          dataLabels: {
            position: 'top'
          }
        }
      };

      this.cadScreeningChartData.stroke = {
        curve: ["transparent"],
        width: 2
      };

      this.cadScreeningChartData.dataLabels = {
        enabled: true,
        //formatter: (val: number) => `${val}`,
        style: {
          fontSize: '11px',
          fontWeight: 'bold',
          colors: ['#000'],
        },
        offsetY: -20,
        background: { enabled: true ,borderRadius: 5,},
        formatter: (val: number, opts: any) => {            
                if (val > 0) 
                return `${val}`;
            else
                return;
            
        }
      };

      this.cadScreeningChartData.xaxis = {
        categories: categories,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      };

      this.cadScreeningChartData.yaxis = {
        title: {
          text: '',
          style: {
            fontWeight: '600',
            fontSize: '12px',
            color:['#610C9F', '#940B92', '#DA0C81', '#1E5128', '#D89216']
          },
          offsetX: -10,
          rotate: -90,
        },
        labels: {
          formatter: (val: number) => `${val}`,
        }
      };

      this.cadScreeningChartData.colors = ['#610C9F', '#940B92', '#DA0C81', '#1E5128', '#D89216'];

      this.cadScreeningChartData.tooltip = {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val}`
        }
      };

      this.cadScreeningChartData.title = {
        text: 'CAD PATIENTS SCREENING COMPLIANCE',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      };

      this.cadScreeningChartData.fill = {
        type: ['solid', 'solid', 'solid', 'solid', 'solid']
      };

      this.cadScreeningChartData.legend = {
        position: 'bottom',
        horizontalAlign: 'center',
      };
    } else {
      this.cadScreeningChartData = null;
    }
  }

  cadComorbiditiesChart(chartData: any) {
    if (chartData.length > 0) {
      const data = chartData[0];
      this.cadComorbiditiesChartData = {};

      this.cadComorbiditiesChartData.series = [
        {
          name: 'Patients',
          data: [+data.Diabetes, +data.Hypertension, +data.Obesity]
        }
      ];

      this.cadComorbiditiesChartData.chart = {
        type: 'bar',
        height: 300,
        toolbar: { show: true },
        zoom: { enabled: false },
      };

      this.cadComorbiditiesChartData.plotOptions = {
        bar: {
          columnWidth: '40%',
          distributed: true,
          borderRadius: 4,
          dataLabels: {
            position: 'top'
          }
        }
      };

      this.cadComorbiditiesChartData.dataLabels = {
        enabled: true,
        formatter: (val: number) => `${val}`,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          colors: ['#000'],
        },
        offsetY: -20,
        background: { enabled: true ,borderRadius: 5,},
      };

      this.cadComorbiditiesChartData.xaxis = {
        categories: ['Diabetes', 'Hypertension', 'Obesity'],
        labels: {
          style: {
            fontSize: '13px',
            fontWeight: '500'
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      };

      this.cadComorbiditiesChartData.yaxis = {
        labels: {
          formatter: (val: number) => `${val}`
        },
        title: {
          text: 'Number of Patients',
          style: {
            fontSize: '12px',
            fontWeight: 'bold'
          }
        }
      };

      this.cadComorbiditiesChartData.colors = ['#28a745', '#007bff', '#dc3545'];

      this.cadComorbiditiesChartData.tooltip = {
        y: {
          formatter: (val: number) => `${val}`
        }
      };

      this.cadComorbiditiesChartData.title = {
        text: 'CAD PATIENT COMORBIDITIES',
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      };

      this.cadComorbiditiesChartData.legend = {
        show: false
      };

      this.cadComorbiditiesChartData.fill = {
        type: ['solid']
      };
    } else {
      this.cadComorbiditiesChartData = null;
    }
  }

  buildAsthmaGridRows(admissionData: any[], smokerData: any[], inhalerData: any[]) {
    const monthNames: any = {
      1: 'Jan-25', 2: 'Feb-25', 3: 'Mar-25', 4: 'Apr-25', 5: 'May-25',
      6: 'Jun-25', 7: 'Jul-25', 8: 'Aug-25', 9: 'Sep-25',
      10: 'Oct-25', 11: 'Nov-25', 12: 'Dec-25'
    };

    const monthMap: any = {};

    for (const entry of admissionData) {
      const month = entry.MonthID;
      if (!monthMap[month]) {
        monthMap[month] = {
          monthName: monthNames[month] || `Month-${month}`,
          asthmaOP: 0,
          asthmaIP: 0,
          erVisits: 0
        };
      }

      if (entry.PatientType === 'OP') {
        monthMap[month].asthmaOP = +entry.TotalCount;
      } else if (entry.PatientType === 'IP') {
        monthMap[month].asthmaIP = +entry.TotalCount;
      } else if (entry.PatientType === 'ED') {
        monthMap[month].erVisits = +entry.TotalCount;
      }
    }

    for (const inh of inhalerData) {
      const month = inh.MonthID;
      if (monthMap[month]) {
        monthMap[month].inhaler = parseFloat(inh.INHALER_ASTHMA_COUNT_PER).toFixed(0) + '%';
      }
    }

    for (const smoker of smokerData) {
      const month = smoker.MonthID;
      if (monthMap[month]) {
        monthMap[month].smoker = smoker.SMOKER;
      }
    }

    this.gridRows = Object.keys(monthMap).map((month) => {
      const row = monthMap[month];
      return {
        month: row.monthName,
        asthma: row.asthmaOP + row.asthmaIP,
        admitted: row.asthmaIP,
        erVisits: row.erVisits,
        nearFatal: '-',
        smoker: row.smoker ?? '-',
        inhaler: row.inhaler ?? '-',
        target: '0%'
      };
    });
  }

  buildCopdGridRows(
    asthmaERIPOPData: any[],
    copdCausesData: any[],
    inhalerData: any[]
  ) {
    const rowsMap: { [key: string]: AsthmaCopdGridRow } = {};

    const formatMonthKey = (monthId: string, yearId: string): string => {
      const month = +monthId;
      const year = yearId.slice(-2);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[month - 1]}-${year}`;
    };

    asthmaERIPOPData.forEach((entry) => {
      const key = formatMonthKey(entry.MonthID, entry.YearID);
      if (!rowsMap[key]) {
        rowsMap[key] = {
          month: key,
          copd: 0,
          smoker: 0,
          alpha1: 0,
          ageGreaterThan40: 0,
          opd: 0,
          erVisits: 0,
          admission: 0,
          inhaler: '0%',
          target: '0%'
        };
      }

      switch (entry.PatientType) {
        case 'OP':
          rowsMap[key].opd = +entry.TotalCount;
          break;
        case 'IP':
          rowsMap[key].admission = +entry.TotalCount;
          break;
        case 'ED':
          rowsMap[key].erVisits = +entry.TotalCount;
          break;
      }
    });

    copdCausesData.forEach((entry) => {
      const key = formatMonthKey(entry.MonthID, entry.YearID);
      if (!rowsMap[key]) {
        rowsMap[key] = {
          month: key,
          copd: 0,
          smoker: 0,
          alpha1: 0,
          ageGreaterThan40: 0,
          opd: 0,
          erVisits: 0,
          admission: 0,
          inhaler: '0%',
          target: '0%'
        };
      }

      rowsMap[key].smoker = +entry.SMOKER;
      rowsMap[key].alpha1 = +entry.ALPHA1;
      rowsMap[key].ageGreaterThan40 = +entry.Agegreaterthan40;
      rowsMap[key].copd = +entry.SMOKER + +entry.Agegreaterthan40 + +entry.ALPHA1;
    });

    inhalerData.forEach((entry) => {
      const key = formatMonthKey(entry.MonthID, entry.YearID);
      if (!rowsMap[key]) {
        rowsMap[key] = {
          month: key,
          copd: 0,
          smoker: 0,
          alpha1: 0,
          ageGreaterThan40: 0,
          opd: 0,
          erVisits: 0,
          admission: 0,
          inhaler: '0%',
          target: '0%'
        };
      }

      rowsMap[key].inhaler = `${entry.INHALER_ASTHMA_COUNT_PER}%`;
    });

    this.asthmaCopdGridRows = Object.values(rowsMap).sort((a, b) => {
      return new Date('1 ' + a.month.replace('-', ' 20')) > new Date('1 ' + b.month.replace('-', ' 20')) ? 1 : -1;
    });
  }

  buildDiabetesGridRows(
    screeningData: any[],
    hba1cData: any[],
    ldlData: any[],
    summaryData: any
  ) {
    const rowsMap: { [key: string]: DiabetesGridRow } = {};

    const formatMonthKey = (monthId: string, yearId: string): string => {
      const month = +monthId;
      const year = yearId.slice(-2);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[month - 1]}-${year}`;
    };

    screeningData.forEach(entry => {
      const key = formatMonthKey(entry.MonthID, entry.YearID);

      rowsMap[key] = {
        month: key,
        diabetes: +summaryData?.TotalDMCount || 0,
        eyeExam: +entry.TotalDM_EyeExam || 0,
        eyeExamPercent: `${parseFloat(entry.TotalDM_EyeExamPer || '0').toFixed(0)}%`,
        hba1c: +entry.HBa1cCount || 0,
        hba1cPercent: `${parseFloat(entry.HBa1cCountPer || '0').toFixed(0)}%`,
        hba1cLessThan7: 0,
        ldl: +entry.LDLCount || 0,
        ldlPercent: `${parseFloat(entry.LDLCountPer || '0').toFixed(0)}%`,
        ldlLessThan100: 0,
        uacr: +entry.CREATININECount || 0,
        uacrPercent: `${parseFloat(entry.CREATININECountPer || '0').toFixed(0)}%`
      };
    });

    hba1cData.forEach(entry => {
      const key = formatMonthKey(entry.MonthID, entry.YearID);
      if (rowsMap[key]) {
        rowsMap[key].hba1cLessThan7 = +entry.HbA1CLess7Count || 0;
      }
    });

    ldlData.forEach(entry => {
      const key = formatMonthKey(entry.MonthID, entry.YearID);
      if (rowsMap[key]) {
        rowsMap[key].ldlLessThan100 = +entry.LDLLess100Count || 0;
      }
    });

    this.diabetesGridRows = Object.values(rowsMap).sort((a, b) => {
      return new Date('1 ' + a.month.replace('-', ' 20')) > new Date('1 ' + b.month.replace('-', ' 20')) ? 1 : -1;
    });
  }

  buildHypertensionGridRows(
    screeningData: any[],
    egfrData: any[],
    ldlData: any[],
    summaryData: any
  ) {
    const rowsMap: { [key: string]: HypertensionGridRow } = {};

    const formatMonthKey = (monthId: string, yearId: string): string => {
      const month = +monthId;
      const year = yearId.slice(-2);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[month - 1]}-${year}`;
    };

    screeningData.forEach(entry => {
      const key = formatMonthKey(entry.MonthID, entry.YearID);

      rowsMap[key] = {
        month: key,
        htn: +summaryData?.TotalHTNCount || 0,
        ldl: +entry.LipidProfileCount || 0,
        ldlPercent: `${parseFloat(entry.LipidProfileCountPer || '0').toFixed(0)}%`,
        ldlLessThan100: 0, // fill later
        egfr: +entry.eGFR || 0,
        egfrPercent: `${parseFloat(entry.eGFRPer || '0').toFixed(0)}%`,
        egfrLess60: 0, // fill later
        acr: +entry.ACRCount || 0,
        acrPercent: `${parseFloat(entry.ACRCountPer || '0').toFixed(0)}%`,
        fbs: +entry.FastingBloodSugarCount || 0,
        fbsPercent: `${parseFloat(entry.FastingBloodSugarCountPer || '0').toFixed(0)}%`
      };
    });

    egfrData.forEach(entry => {
      const key = formatMonthKey(entry.MonthID, entry.YearID);
      if (rowsMap[key]) {
        rowsMap[key].egfrLess60 = +entry.eGFRLess60Count || 0;
      }
    });

    ldlData.forEach(entry => {
      const key = formatMonthKey(entry.MonthID, entry.YearID);
      if (rowsMap[key]) {
        rowsMap[key].ldlLessThan100 = +entry.LDLLess100Count || 0;
      }
    });

    this.hypertensionGridRows = Object.values(rowsMap).sort((a, b) => {
      return new Date('1 ' + a.month.replace('-', ' 20')) > new Date('1 ' + b.month.replace('-', ' 20')) ? 1 : -1;
    });
  }

  buildCADGridRows(
    screeningData: any[],
    summaryData: any,
  ) {
    const rowsMap: { [key: string]: CADGridRow } = {};

    const formatMonthKey = (monthId: string, yearId: string): string => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = +monthId;
      const year = yearId.slice(-2);
      return `${monthNames[month - 1]}-${year}`;
    };

    screeningData.forEach(entry => {
      const key = formatMonthKey(entry.MonthID, entry.YearID);

      rowsMap[key] = {
        month: key,
        cad: +summaryData?.TotalCADCount || 0,
        ldl: +entry.LDLCount || 0,
        ldlLess70: 0,
        hba1c: +entry.HBa1CCount || 0,
        stressTest: +entry.STRESSTEST || 0,
        echo: +entry.ECHO_CARDIOGRAM || 0,
        ctAngio: +entry.CT_ANGIOGRAM || 0,
        smoker: +summaryData?.Smoke || 0,
        bmi: +summaryData?.BMI || 0,
        betaBlockers: +summaryData?.CAD_BETA_BLOCKERSCount || 0,
        fbsPercent: `${parseFloat(summaryData?.FastingBloodSugarCountPer || '0').toFixed(0)}%`
      };
    });

    for (let key in rowsMap) {
      rowsMap[key].ldlLess70 = +summaryData?.LDLLess70Count || 0;
    }

    this.cadGridRows = Object.values(rowsMap).sort((a, b) => {
      return new Date('1 ' + a.month.replace('-', ' 20')) > new Date('1 ' + b.month.replace('-', ' 20')) ? 1 : -1;
    });
  }

  exportGridData(format: string, data: any[], filename: string): void {
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

  private handleExport(data: any[], filename: string, format: string): void {
    switch (format.toLowerCase()) {
      case 'csv':
        this.exportService.exportToCSV(data, filename);
        break;
      default:
        console.error('Unsupported export format');
    }
  }


}

interface AsthmaCopdGridRow {
  month: string;
  copd: number;
  smoker: number;
  alpha1: number;
  ageGreaterThan40: number;
  opd: number;
  erVisits: number;
  admission: number;
  inhaler: string;
  target: string;
}

interface DiabetesGridRow {
  month: string;
  diabetes?: number;
  eyeExam: number;
  eyeExamPercent: string;
  hba1c: number;
  hba1cPercent: string;
  hba1cLessThan7: number;
  ldl: number;
  ldlPercent: string;
  ldlLessThan100: number;
  uacr: number;
  uacrPercent: string;
}

interface HypertensionGridRow {
  month: string;
  htn: number;
  ldl: number;
  ldlPercent: string;
  ldlLessThan100: number;
  egfr: number;
  egfrPercent: string;
  egfrLess60: number;
  acr: number;
  acrPercent: string;
  fbs: number;
  fbsPercent: string;
}

interface CADGridRow {
  month: string;
  cad: number;
  ldl: number;
  ldlLess70: number;
  hba1c: number;
  stressTest: number;
  echo: number;
  ctAngio: number;
  smoker: number;
  bmi: number;
  betaBlockers: number;
  fbsPercent: string;
}
