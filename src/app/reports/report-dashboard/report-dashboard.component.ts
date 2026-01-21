import { Component } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexFill,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexTooltip,
  ApexMarkers
} from 'ng-apexcharts';
import { ReportsService } from '../reports.service';
import { FormBuilder } from '@angular/forms';
import moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';

// Interfaces to move
interface ReportData {
  Count: number;
  Name?: string;
  ID?: string;
  Code?: string;
  TestID?: string;
}

interface DoctorData {
  Count: number;
  Name?: string;
  ID?: string;
  TestID?: string;
}

interface MonthlyData {
  ID: string;
  Count: number;
}

interface ReportConfig {
  nameField: string;
  idField: string;
  doctorNameField: string;
  doctorIdField: string;
  apiMethod: string;
  deptMethod?: string
  doctorApiMethod: string;
  monthlyApiMethod: string;
  title: string;
  displayName: string;
}

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
  selector: 'app-report-dashboard',
  templateUrl: './report-dashboard.component.html',
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
export class ReportDashboardComponent {
  datesForm: any;
  hospitalID: any;
  currentReportData: ReportData[] = [];
  currentDoctorData: DoctorData[] = [];
  currentDeptData: DoctorData[] = [];
  currentMonthlyData: MonthlyData[] = [];
  selectedProcedureName = '';
  selectedCategoryName = '';
  fullCategoryNames: any;

  showSidebar = true;
  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  locations = [
    { label: 'Nuzha', value: 3 },
    { label: 'Suwaidi', value: 2 }
  ];

  selectedLocation = this.locations[0];

  topNOptions = [10, 25, 50, 100];
  selectedTopN = 10;

  topCategories = [
    { label: 'Top Surgery', value: 'surgery' },
    { label: 'Top Lab', value: 'lab' },
    { label: 'Top Rad', value: 'radiology' },
    { label: 'Top ICD', value: 'icd' },
    { label: 'Top Procedures', value: 'procedure' }
  ];

  selectedCategory = this.topCategories[0];

  private reportConfigs: { [key: string]: ReportConfig } = {
    surgery: {
      nameField: 'Name',
      idField: 'ID',
      doctorNameField: 'Name',
      doctorIdField: 'ID',
      apiMethod: 'FetchPatientSurgeryOrdersGroupBySurgeryCountKPI',
      doctorApiMethod: 'FetchPatientSurgeryOrdersSurgeryAgainstDoctorCountKPI',
      monthlyApiMethod: 'PatientSurgeryOrdersDoctorAgainstMonthWiseCountKPI',
      title: 'Top 10 Surgeries',
      displayName: 'Surgeries'
    },
    lab: {
      nameField: 'Name',
      idField: 'ID',
      doctorNameField: 'Name',
      doctorIdField: 'ID',
      apiMethod: 'FetchPatientLaboratoryOrdersGroupByCountKPI',
      deptMethod: 'FetchPatientLabAgainstDeptCountKPI',
      doctorApiMethod: 'FetchPatientLabAgainstDeptDoctorCountKPI',
      monthlyApiMethod: 'FetchPatientLabAgainstDeptDoctorMonthCountKPI',
      title: 'Top 10 Laboratory Investigations',
      displayName: 'Laboratory Investigations'
    },
    radiology: {
      nameField: 'Name',
      idField: 'ID',
      doctorNameField: 'Name',
      doctorIdField: 'ID',
      apiMethod: 'FetchPatientRadiologyOrdersGroupByCountKPI',
      deptMethod: 'FetchPatientRadAgainstDeptCountKPI',
      doctorApiMethod: 'FetchPatientRadAgainstDeptDoctorCountKPI',
      monthlyApiMethod: 'FetchPatientRadAgainstDeptDoctorMonthCountKPI',
      title: 'Top 10 Radiology Orders',
      displayName: 'Radiology Orders'
    },
    procedure: {
      nameField: 'Name',
      idField: 'ID',
      doctorNameField: 'Name',
      doctorIdField: 'ID',
      apiMethod: 'FetchPatientProceduresOrdersGroupByCountKPI',
      deptMethod: 'FetchPatientProceduresAgainstDeptCountKPI',
      doctorApiMethod: 'FetchPatientProceduresAgainstDeptDoctorCountKPI',
      monthlyApiMethod: 'FetchPatientProceduresAgainstDeptDoctorMonthCountKPI',
      title: 'Top 10 Procedures',
      displayName: 'Procedures'
    },
    icd: {
      nameField: 'Name',
      idField: 'ID',
      doctorNameField: 'Name',
      doctorIdField: 'ID',
      apiMethod: 'FetchPatientDiagnosisOrdersGroupByCountKPI',
      deptMethod: 'FetchPatientDiagnosisAgainstDeptCountKPI',
      doctorApiMethod: 'FetchPatientDiagnosisAgainstDeptDoctorCountKPI',
      monthlyApiMethod: 'FetchPatientDiagnosisAgainstDeptDoctorMonthCountKPI',
      title: 'Top 10 ICD',
      displayName: 'ICD'
    }
  };

  constructor(private config: ReportsService, private formBuilder: FormBuilder) {
    this.hospitalID = sessionStorage.getItem("hospitalId");
    const vm = new Date();
    vm.setMonth(vm.getMonth() - 1);

    this.datesForm = this.formBuilder.group({
      fromdate: vm,
      todate: new Date()
    });

    this.fetchReportData();
  }

  fetchReportsByLocation(location: { label: string; value: number }) {
    this.selectedLocation = location;
    this.hospitalID = location.value;
    this.clearSecondaryCharts();
    this.fetchReportData();
  }

  onSelectTopN(value: number) {
    this.selectedTopN = value;
    this.clearSecondaryCharts();
    this.fetchReportData();
  }

  onSelectCategory(category: { label: string; value: string }) {
    this.selectedCategory = category;
    this.clearSecondaryCharts();
    this.fetchReportData();
  }

  private getFormattedDates(): { fromdate: string; todate: string } {
    const fromdate = moment(this.datesForm.get("fromdate")?.value).format('DD-MMM-YYYY');
    const todate = moment(this.datesForm.get("todate")?.value).format('DD-MMM-YYYY');
    return { fromdate, todate };
  }

  private getReportMethod(methodName: string) {
    return (this.config as any)[methodName]?.bind(this.config) ?? null;
  }

  private resolveResponseList(response: any): any[] {
    const keys = Object.keys(response).filter(k => k.endsWith('DataList'));
    return keys.length ? response[keys[0]] : [];
  }

  private clearAllCharts() {
    this.series = [];
    this.doctorSeries = [];
    this.deptSeries = [];
    this.monthlySeries = [{ name: 'Count', data: Array(12).fill(0) }];
    this.currentReportData = [];
    this.currentDoctorData = [];
    this.currentDeptData = [];
    this.currentMonthlyData = [];
    this.selectedProcedureName = '';
    this.selectedCategoryName = '';
    this.resetTitles();
  }

  private clearSecondaryCharts() {
    this.doctorSeries = [];
    this.deptSeries = [];
    this.monthlySeries = [{ name: 'Count', data: Array(12).fill(0) }];
    this.currentDoctorData = [];
    this.currentDeptData = [];
    this.currentMonthlyData = [];
    this.selectedProcedureName = '';
    this.selectedCategoryName = '';
    this.resetSecondaryTitles();
  }

  private clearDoctorAndMonthlyCharts() {
    this.doctorSeries = [];
    this.monthlySeries = [{ name: 'Count', data: Array(12).fill(0) }];
    this.currentDoctorData = [];
    this.currentMonthlyData = [];
    this.resetDoctorAndMonthlyTitles();
  }

  private clearMonthlyChart() {
    this.monthlySeries = [{ name: 'Count', data: Array(12).fill(0) }];
    this.currentMonthlyData = [];
    this.resetMonthlyTitle();
  }

  private resetTitles() {
    this.title = { text: '', align: 'center', style: { fontSize: '20px', fontWeight: 'bold' } };
    this.doctorTitle = { text: '', align: 'center', style: { fontSize: '18px', fontWeight: 'bold' } };
    this.deptTitle = { text: '', align: 'center', style: { fontSize: '18px', fontWeight: 'bold' } };
    this.monthlyTitle = { text: '', align: 'center', style: { fontSize: '18px', fontWeight: 'bold' } };
    this.monthlySubtitle = { text: '', margin: 10, offsetX: -280, style: { fontSize: '16px', fontWeight: 700, color: '#5A64FF' } };
  }

  private resetSecondaryTitles() {
    this.doctorTitle = { text: '', align: 'center', style: { fontSize: '18px', fontWeight: 'bold' } };
    this.deptTitle = { text: '', align: 'center', style: { fontSize: '18px', fontWeight: 'bold' } };
    this.monthlyTitle = { text: '', align: 'center', style: { fontSize: '18px', fontWeight: 'bold' } };
    this.monthlySubtitle = { text: '', margin: 10, offsetX: -280, style: { fontSize: '16px', fontWeight: 700, color: '#5A64FF' } };
  }

  private resetDoctorAndMonthlyTitles() {
    this.doctorTitle = { text: '', align: 'center', style: { fontSize: '18px', fontWeight: 'bold' } };
    this.monthlyTitle = { text: '', align: 'center', style: { fontSize: '18px', fontWeight: 'bold' } };
    this.monthlySubtitle = { text: '', margin: 10, offsetX: -280, style: { fontSize: '16px', fontWeight: 700, color: '#5A64FF' } };
  }

  private resetMonthlyTitle() {
    this.monthlyTitle = { text: '', align: 'center', style: { fontSize: '18px', fontWeight: 'bold' } };
    this.monthlySubtitle = { text: '', margin: 10, offsetX: -280, style: { fontSize: '16px', fontWeight: 700, color: '#5A64FF' } };
  }

  fetchReportData() {
    const { fromdate, todate } = this.getFormattedDates();
    const config = this.reportConfigs[this.selectedCategory.value];
    if (!config || !fromdate || !todate) return;

    this.clearAllCharts();
    const apiMethod = this.getReportMethod(config.apiMethod);

    if (apiMethod) {
      apiMethod(fromdate, todate, this.hospitalID, this.selectedTopN).subscribe({
        next: (response: any) => {
          if (response.Code === 200) {
            this.currentReportData = this.resolveResponseList(response);
            this.initMainChart(config);
          }
        },
        error: (err: any) => console.error('Error fetching report data:', err)
      });
    }
  }

  private fetchDeptData(selectedItem: ReportData) {
    const { fromdate, todate } = this.getFormattedDates();
    const config = this.reportConfigs[this.selectedCategory.value];
    if (!config || !fromdate || !todate) return;

    this.clearDoctorAndMonthlyCharts();

    const itemId = selectedItem[config.idField as keyof ReportData];
    this.selectedProcedureName = selectedItem[config.nameField as keyof ReportData] as string;

    const apiMethod = this.getReportMethod(config.deptMethod ?? config.doctorApiMethod);
    if (apiMethod) {
      apiMethod(fromdate, todate, this.hospitalID, itemId, this.selectedTopN).subscribe({
        next: (response: any) => {
          if (response.Code === 200) {
            this.currentDeptData = this.resolveResponseList(response);
            this.initDeptChart(config);
          }
        },
        error: (err: any) => console.error('Error fetching doctor data:', err)
      });
    }
  }

  private fetchDoctorData(selectedItem: ReportData) {
    const { fromdate, todate } = this.getFormattedDates();
    const config = this.reportConfigs[this.selectedCategory.value];
    if (!config || !fromdate || !todate) return;

    this.clearMonthlyChart();

    const itemId = selectedItem[config.idField as keyof ReportData];
    const apiMethod = this.getReportMethod(config.doctorApiMethod);
    if (apiMethod) {

      let idParam: any;
      let testId: any;

      if (this.selectedCategory.value !== 'surgery') {
        testId = selectedItem['TestID'];
        idParam = selectedItem[config.idField as keyof ReportData];
        this.selectedCategoryName = selectedItem[config.nameField as keyof ReportData] as string;
      } else {
        idParam = selectedItem[config.idField as keyof ReportData];
        this.selectedProcedureName = selectedItem[config.nameField as keyof ReportData] as string;
      }

      const params =
        this.selectedCategory.value !== 'surgery'
          ? [fromdate, todate, this.hospitalID, testId, idParam, this.selectedTopN]
          : [fromdate, todate, this.hospitalID, idParam, this.selectedTopN];

      apiMethod(...params).subscribe({
        next: (response: any) => {
          if (response.Code === 200) {
            this.currentDoctorData = this.resolveResponseList(response);
            this.initDoctorChart(config);
          }
        },
        error: (err: any) => console.error('Error fetching doctor data:', err)
      });
    }
  }

  private fetchMonthlyData(selectedDoctor: DoctorData) {
    const { fromdate, todate } = this.getFormattedDates();
    const config = this.reportConfigs[this.selectedCategory.value];
    if (!config || !fromdate || !todate) return;

    const doctorId = selectedDoctor[config.doctorIdField as keyof DoctorData];
    const apiMethod = this.getReportMethod(config.monthlyApiMethod);

    if (!apiMethod) return;

    let params: any[];

    if (this.selectedCategory.value === 'surgery') {
      const procedureId = this.currentReportData.find(
        x => x[config.nameField as keyof ReportData] === this.selectedProcedureName
      )?.[config.idField as keyof ReportData];

      if (!procedureId) return;

      params = [fromdate, todate, this.hospitalID, procedureId, doctorId, this.selectedTopN];
    } else {
      const testId = this.currentReportData.find(
        x => x[config.nameField as keyof ReportData] === this.selectedProcedureName
      )?.[config.idField as keyof ReportData];;

      const catId = this.currentDeptData.find(
        x => x[config.nameField as keyof DoctorData] === this.selectedCategoryName
      )?.[config.idField as keyof DoctorData];;

      params = [fromdate, todate, this.hospitalID, testId, catId, doctorId, this.selectedTopN];
    }

    apiMethod(...params).subscribe({
      next: (response: any) => {
        const data = this.resolveResponseList(response);
        const doctorName = selectedDoctor[config.doctorNameField as keyof DoctorData] as string;
        this.updateYAxis(data);
        this.currentMonthlyData = data;
        this.initMonthlyChart(data, doctorName,config);
      },
      error: (err: any) => {
        console.error('Error fetching monthly data:', err);
        const doctorName = selectedDoctor[config.doctorNameField as keyof DoctorData] as string;
        this.initMonthlyChart([], doctorName,config);
      }
    });
  }

  private initMainChart(config: ReportConfig) {
    const counts = this.currentReportData.map(item => item.Count);
    const names = this.currentReportData.map(item =>
      (item[config.nameField as keyof ReportData] as string)?.trim() || ''
    );

    this.series = [{ name: 'Count', data: counts }];
    this.fullCategoryNames = [...names];
    // this.xaxis = { categories: names, labels: { rotate: 0 } };
    this.xaxis = {
      categories: names,
      tickPlacement: 'on',
      type: 'category',
      labels: {
        rotate: 0,
        hideOverlappingLabels: false,
        trim: false,
        offsetX: 0,
        formatter: (val) => {
          if (!val) return '';
          return val.length > 10 ? val.slice(0, 10) + '…' : val;
        },


        style: {
          fontSize: '10px',
          colors: '#2f2f2f',
          cssClass: 'apexcharts-xaxis-label_text',
        },
      }
    };


    this.title = {
      text: `Top ${this.selectedTopN} ${config.displayName}`,
      align: 'center',
      style: { fontSize: '20px', fontWeight: 'bold' }
    };
  }

  private initDeptChart(config: ReportConfig) {
    const sortedDoctors = [...this.currentDeptData].sort((a, b) => b.Count - a.Count);

    this.deptSeries = [{
      name: 'Count',
      data: sortedDoctors.map(d => d.Count)
    }];

    this.deptXAxis = {
      categories: sortedDoctors.map(d =>
        (d[config.doctorNameField as keyof DoctorData] as string)?.trim() || ''
      ),
      labels: { style: { fontSize: '12px' } }
    };

    this.deptTitle = {
      text: `Top ${this.selectedTopN} ${config.displayName} by Department - ${this.selectedProcedureName}`,
      align: 'center',
      style: { fontSize: '18px', fontWeight: 'bold' }
    };
  }

  private initDoctorChart(config: ReportConfig) {
    if (this.selectedCategory?.value !== 'surgery') {
      this.doctorColors1 = [...this.nonSurgeryColors];
    } else {
      this.doctorColors1 = [...this.surgeryColors];
    }

    const sortedDoctors = [...this.currentDoctorData].sort((a, b) => b.Count - a.Count);

    this.doctorSeries = [{
      name: 'Count',
      data: sortedDoctors.map(d => d.Count)
    }];

    this.doctorXAxis = {
      categories: sortedDoctors.map(d =>
        (d[config.doctorNameField as keyof DoctorData] as string)?.trim() || ''
      ),
      labels: { style: { fontSize: '12px' } }
    };

    this.doctorTitle = {
      text: `Top ${this.selectedTopN} ${config.displayName} by Doctor - ${this.selectedProcedureName}`,
      align: 'center',
      style: { fontSize: '18px', fontWeight: 'bold' }
    };
  }

  private initMonthlyChart(data: MonthlyData[], doctorName: string,config:ReportConfig) {
    const monthData = Array(12).fill(0);

    data.forEach(item => {
      const monthIndex = parseInt(item.ID) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthData[monthIndex] = item.Count;
      }
    });

    this.monthlySeries = [{ name: 'Count', data: monthData }];
    this.monthlySubtitle = {
      text: doctorName?.trim() || '',
      margin: 10,
      offsetX: -280,
      style: { fontSize: '16px', fontWeight: 700, color: '#20c997' }
    };
    this.monthlyTitle={
       text: `Top ${this.selectedTopN} ${config.displayName} by Doctor - ${this.selectedProcedureName}`,
      align: 'center',
      style: { fontSize: '18px', fontWeight: 'bold' }
    }
  }

  public series: ApexAxisChartSeries = [];
  public chart: ApexChart = {
    type: 'bar',
    height: 400,
     toolbar: { show: true },
    zoom: { enabled: false },
    events: {
      dataPointSelection: (event, chartContext, config) => {
        const index = config.dataPointIndex;
        const selectedItem = this.currentReportData[index];
        if (selectedItem) {
          if (this.selectedCategory.value === "surgery")
            this.fetchDoctorData(selectedItem);
          else
            this.fetchDeptData(selectedItem);
        }
      }
    }
  };

  public xaxis: ApexXAxis = {
    categories: [],
    labels: {
      rotate: 0,
      rotateAlways: false,
      trim: false,
      style: {
        fontSize: '12px',
        fontWeight: 500,
        colors: '#2f2f2f'
      },
    }
  };

  public yaxis: ApexYAxis = {
    title: {
      text: 'Count',
      style: { fontWeight: 700 }
    }
  };

  public dataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => val.toLocaleString(),
    offsetY: -30,
    style: { fontSize: '12px', colors: ['#4558D0'] }
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
      gradientToColors: ['#b57bee'],
      opacityFrom: 0.9,
      opacityTo: 1,
      stops: [0, 100]
    }
  };
   public Colors1: string[] = ['#392d69'];

  public title: ApexTitleSubtitle = {
    text: '',
    align: 'center',
    style: { fontSize: '20px', fontWeight: 'bold' }
  };

  public doctorSeries: ApexAxisChartSeries = [];
  public doctorChart: ApexChart = {
    type: 'bar',
    height: 450,
    events: {
      dataPointSelection: (event, chartContext, config) => {
        const index = config.dataPointIndex;
        const selectedDoctor = this.currentDoctorData[index];
        if (selectedDoctor) {
          this.fetchMonthlyData(selectedDoctor);
        }
      }
    }
  };

  public doctorXAxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '12px' } }
  };

  public doctorPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      distributed: true,
      borderRadius: 5,
      barHeight: '60%'
    }
  };

  public doctorFill: ApexFill = { type: 'solid' };
  public doctorColors1: string[] = [];
  public surgeryColors: string[] = ['#6a5acd', '#40e0d0', '#6a5acd', '#40e0d0', '#6a5acd', '#40e0d0', '#6a5acd', '#40e0d0', '#6a5acd', '#40e0d0'];
  public nonSurgeryColors: string[] = ['#2e2e90', '#44c9f5', '#2e2e90', '#44c9f5', '#2e2e90', '#44c9f5', '#2e2e90', '#44c9f5', '#2e2e90', '#44c9f5'];

  public doctorTitle: ApexTitleSubtitle = {
    text: '',
    align: 'center',
    style: { fontSize: '18px', fontWeight: 'bold' }
  };

  public deptSeries: ApexAxisChartSeries = [];
  public deptChart: ApexChart = {
    type: 'bar',
    height: 450,
    events: {
      dataPointSelection: (event, chartContext, config) => {
        const index = config.dataPointIndex;
        const selectedDoctor = this.currentDeptData[index];
        if (selectedDoctor) {
          this.fetchDoctorData(selectedDoctor);
        }
      }
    }
  };

  public deptXAxis: ApexXAxis = {
    categories: [],
    labels: { style: { fontSize: '12px' } }
  };

  public deptPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      distributed: true,
      borderRadius: 5,
      barHeight: '60%'
    },
  };

  public deptFill: ApexFill = { type: 'solid' };
  public deptColors1: string[] = ['#4F1C51', '#ff87d5', '#4F1C51', '#ff87d5', '#4F1C51', '#ff87d5', '#4F1C51', '#ff87d5', '#4F1C51', '#ff87d5'];
  public deptTitle: ApexTitleSubtitle = {
    text: '',
    align: 'center',
    style: { fontSize: '18px', fontWeight: 'bold' }
  };

  public monthlySeries: ApexAxisChartSeries = [];
  public monthlyChart: ApexChart = {
    type: 'area',
    background: 'transparent',
    height: 350,
    toolbar: { show: true },
    zoom: { enabled: false },
    
  };

  public monthlyXAxis: ApexXAxis = {
    categories: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    tickAmount: 11,
    labels: { style: { fontSize: '13px', fontWeight: 500 } }
  };

  updateYAxis(data: any[]) {
    const padding = 10;
    const values = data.map(d => d.Count);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const adjustedMin = Math.max(0, minValue - padding);
    const adjustedMax = maxValue + padding;

    const range = adjustedMax - adjustedMin;
    const tickAmount = Math.ceil(range / 10);

    this.monthlyYAxis = {
      
      min: adjustedMin,
      max: adjustedMax,
      tickAmount: tickAmount,
      title: {
        text: 'Count',
        style: { fontWeight: 700 }
      },
       labels: {
          show: false, // Hide Y-axis labels
        },
    };
  }

  public monthlyYAxis: ApexYAxis = {
    min: 0,
    max: 50,
    tickAmount: 7,
    title: { text: 'Count', style: { fontWeight: 700 } }
  };

  public monthlyStroke: ApexStroke = { curve: 'smooth', width: 2 };

  public monthlyFill: ApexFill = {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      type: 'vertical',
      gradientToColors: ['#00B8D9'],
      opacityFrom: 0.7,
      opacityTo: 0,
      stops: [0, 100]
    }
  };

    public monthlyMarkers: ApexMarkers = {
     size: 5,
    strokeWidth: 2,
    strokeColors: '#FF0800',
    colors: ['#FF0800'],
    hover: {
        size: 7
    }
  };




  public monthlyGrid: ApexGrid = {
    strokeDashArray: 4,
    borderColor: '#E0E6EF',
    show:false
  };

  public monthlyTitle: ApexTitleSubtitle = {
    text: '',
    align: 'center',
    style: { fontSize: '18px', fontWeight: 'bold' }
  };

  public monthlySubtitle: ApexTitleSubtitle = {
    text: '',
    margin: 10,
    offsetX: -280,
    style: { fontSize: '16px', fontWeight: 700, color: '#5A64FF' }
  };

  public monthlyDataLabels: ApexDataLabels = { 
    enabled: true,
      formatter: (val: number) => `${val}`,
      offsetY: -5,
      style: {
        fontSize: '10px',
        colors: ['#c11e38']
      }
  };

  get monthlyChartData(): number[] {
    const data = this.monthlySeries[0]?.data;
    return Array.isArray(data) ? data as number[] : [];
  }

  public tooltip: ApexTooltip = {
    y: {
      formatter: (val: any) => `${val}`
    },
    x: {
      show: true,
      formatter: (val, opts) => {
        const label = this.fullCategoryNames[opts.dataPointIndex];
        const count = opts?.w?.config?.series?.[0]?.data?.[opts.dataPointIndex];
        return `${label}: ${count}`;
      }
    }
  };

}