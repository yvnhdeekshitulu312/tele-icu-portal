import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ChartExportService } from '../chartexport.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import { UtilityService } from 'src/app/shared/utility.service';
import moment from 'moment';

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
  selector: 'app-ipc-dashboard',
  templateUrl: './ipc-dashboard.component.html',
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
export class IpcDashboardComponent implements OnInit {
  datesForm: any;
  errorMsg = '';
  facilityId: any;
  doctorDetails: any;
  admissionDetails: any;
  centralLineData: any;

  ipcAdmissionData2: any;
  locations = [
    { label: 'Nuzha', value: 3, selected: false },
    { label: 'Suwaidi', value: 2, selected: false }
  ];
  hospitalID: any;
  ipcAdmissionChartData: any;

  ventilationStatistics: any;
  ventilationByLocationChartData: any;
  ventilationComplianceChartData: any;
  ventilationUtilizationChartData: any;
  ventilationEventChartData: any;

  centralLineLocationChartData: any;
  centralLineBundleChartData: any;
  centralLineMetrics: any = {};

  urinaryStatistics: any;
  urinaryByLocationChartData: any;
  urinaryComplianceChartData: any;
  urinaryUtilizationChartData: any;
  urinaryInfectionChartData: any;

  urinaryInfectionWardId: any = 0;
  urinaryUtilizationWardId: any = 0;
  ventilatorUtilizationWardId: any = 0;
  ventilatorEventWardId: any = 0;
  wardCollection: any = [];

  centralLineWardId: string = '0';
  SelectedWardID: string = '0';
  centralLineUtilizationChartData: any;

  clabsiWardId: string = '0';
  clabsiChartData: any;

  clabsiPediatricWardId: string = '0';
  clabsiPediatricChartData: any;

  nicuCentralLineWardId: string = '0';
  nicuCentralLineChartData: any;

  clabsiNeonatalWardId: string = '0';
  clabsiNeonatalChartData: any;

  seriesIPCAdmission: any[] = [];
  chartIPCAdmission: any;
  plotOptionsIPCAdmission: any;
  dataLabelsIPCAdmission: any;
  colorsIPCAdmission: any[] = [];
  xaxisIPCAdmission: any;
  yaxisIPCAdmission: any;
  titleIPCAdmission: any;
  tooltipIPCAdmission: any;
  legendIPCAdmission: any;
  fillIPCAdmission: any;
  ipcAdmissionData: any;

  surveillanceAreaChartData: any;

  nicuWeightRanges = [
    { label: '500 G - 1000 G', fromWeight: 500, toWeight: 1000 },
    { label: '1001 G - 1500 G', fromWeight: 1001, toWeight: 1500 },
    { label: '1501 G - 2500 G', fromWeight: 1501, toWeight: 2500 },
    { label: '2500 G', fromWeight: 500, toWeight: 100000 }
  ];

  selectedNicuWeightRange = this.nicuWeightRanges[3];
  selectedNeonatalWeightRange = this.nicuWeightRanges[3];
  surveillanceAreaData: any;
  surveillanceAreaWard: any;
  urinaryByLocationData: any;
  urinaryByLocationWard: any;
  ventilatorByLocationData: any;
  ventilatorByLocationWard: any;


  constructor(private fb: FormBuilder, private exportService: ChartExportService, private us: UtilityService) {
    this.hospitalID = sessionStorage.getItem("hospitalId");
    const facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.facilityId = facility.FacilityID == undefined ? facility : facility.FacilityID
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    const vm = new Date();
    vm.setMonth(vm.getMonth() - 8);

    this.datesForm = this.fb.group({
      fromdate: vm,
      todate: new Date()
    });
    const loc = this.locations.find((x: any) => x.value == this.hospitalID);
    if (loc) {
      loc.selected = true;
    }
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    const { fromdate, todate } = this.getFormattedDates();
    if (fromdate && todate && new Date(fromdate) > new Date(todate)) {
      this.showErrorModal("From Date should not be greater than To Date.");
      return;
    }
    this.fetchIpcAdmissionData();
    this.fetchIpcCentralLineData();

    //wards
    this.fetchWards();

    //Ventilation
    this.fetchVentilationData();

    //Urniary
    this.fetchUrinaryData();

    this.fetchIPCAdmissionData();
    this.fetchSurveillanceAreaData();
  }

  private getFormattedDates(): { fromdate: string; todate: string } {
    const fromdate = moment(this.datesForm.get("fromdate")?.value).format('DD-MMM-YYYY');
    const todate = moment(this.datesForm.get("todate")?.value).format('DD-MMM-YYYY');
    return { fromdate, todate };
  }

  fetchWards() {
    const url = this.us.getApiUrl(IpcDashboard.FetchTransferWards, {
      HospitalID: this.getLocationsValue()
    });

    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.wardCollection = response.FetchWardsBedtypesBedsDataList;
        // this.urinaryInfectionWardId = this.wardCollection[0].WardID;
        //this.urinaryUtilizationWardId = this.wardCollection[0].WardID;
        //this.ventilatorEventWardId = this.wardCollection[0].WardID;
        // this.ventilatorUtilizationWardId = this.wardCollection[0].WardID;
        this.SelectedWardID = this.wardCollection.find((x: any) => x.WardName == 'ICCU').WardID;
        this.nicuCentralLineWardId = this.wardCollection.find((x: any) => x.WardName == 'NICU').WardID;
        this.clabsiPediatricWardId = this.wardCollection.find((x: any) => x.WardName == 'PEDIATRIC ICU').WardID;
        this.clabsiNeonatalWardId = this.wardCollection.find((x: any) => x.WardName == 'NICU').WardID;
        this.centralLineWardId = this.clabsiWardId = this.ventilatorEventWardId = this.ventilatorUtilizationWardId
          = this.urinaryInfectionWardId = this.urinaryUtilizationWardId
          = this.SelectedWardID == '0' ? this.wardCollection[0].WardID : this.SelectedWardID;

        //Ventilation
        this.fetchVentilationUtilizationRatioData();
        this.fetchVentilationEventData();

        //Urniary
        this.fetchUrinaryUtilizationRatioData();
        this.fetchUrinaryInfectionData();

        this.fetchCentralLineUtilizationData();
        this.fetchCLABSIData();
        this.fetchCLABSIPediatricData();
        this.fetchNICUCentralLineData();
        this.fetchCLABSINeonatalData();
      } else {
        this.wardCollection = [];
      }
    });
  }

  clearFilters() {
    const vm = new Date();
    vm.setMonth(vm.getMonth() - 8);

    this.datesForm.patchValue({
      fromdate: vm,
      todate: new Date()
    });
    this.locations.forEach((loc: any) => loc.selected = false);
    const loc = this.locations.find((x: any) => x.value == this.hospitalID);
    if (loc) {
      loc.selected = true;
    }
    this.fetchData();
  }

  locationOptionClicked(event: Event, item: any) {
    event.stopPropagation();
    this.toggleLocationSelection(item);
  }

  toggleLocationSelection(item: any) {
    item.selected = !item.selected;
  }

  private getLocationsValue(): string {
    return this.locations?.filter((x: any) => x.selected).map((item: any) => item.value).join(',');
  }

  showErrorModal(error: string) {
    this.errorMsg = error;
    let modal = new bootstrap.Modal(document.getElementById('errorMsg'));
    modal.show();
  }

  fetchVentilationData() {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchIPCVentilationHISBI, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue()
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.ventilationStatistics = response.FetchIPCVentilationHISBI1DataList[0];
        this.ventilatorByLocationData = response.FetchIPCVentilationHISBI2DataList;
        this.ventilatorByLocationWard = this.ventilatorByLocationData[0].Ward;
        this.loadVentilationByLocationChart();
        this.loadVentilationComplianceChart(response.FetchIPCVentilationHISBI3DataList);
      } else {
        this.ventilationStatistics = null;
        this.ventilationByLocationChartData = null;
        this.ventilationComplianceChartData = null;
        this.ventilatorByLocationWard = '';
        this.ventilatorByLocationData = [];
      }
    });
  }

  fetchIpcAdmissionData(): void {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchIPCAdmissionDetailsHISBI, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue()
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response?.Code === 200) {
        this.admissionDetails = response.FetchIPCAdmissionDetailsHISBI1DataList?.[0] || null;
        this.ipcAdmissionData2 = response.FetchIPCAdmissionDetailsHISBI2DataList || [];

        this.prepareIPCAdmissionChartData();
      } else {
        this.showErrorModal('Unexpected response code: ' + response?.Code);
      }
    }, error => {
      console.error('Error fetching IPC admission data:', error);
      this.showErrorModal('An error occurred while fetching IPC admission data.');
    });
  }

  prepareIPCAdmissionChartData(): void {
    if (this.ipcAdmissionData2?.length > 0) {
      const groupedData = this.groupWardData(this.ipcAdmissionData2);

      const treemapData = groupedData.map((item: any) => ({
        x: item.Ward,
        y: +item.IPAdmissionCount || 0
      }));

      console.log('Treemap Data:', treemapData);

      this.ipcAdmissionChartData = {
        series: [
          {
            data: treemapData
          }
        ],
        chart: {
          height: 400,
          type: 'treemap',
          toolbar: { show: true }
        },
        colors: [
          '#12661B', '#F1721F', '#9B2A8D', '#18597C', '#2EA7DF',
          '#194C18', '#52B03B', '#F99E9E', '#1E9EFF', '#FFBB00',
          '#FF5C8A', '#2F4F4F', '#CD5C5C', '#6A5ACD', '#20B2AA'
        ],
        plotOptions: {
          treemap: {
            distributed: true,
            enableShades: false
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
            colors: ['#fff']
          },
          formatter: function (text: string, op: any) {
            return [text, op.value];
          }
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} Patients`
          }
        },
        title: {
          text: 'WARD WISE INPATIENT COUNT',
          align: 'center',
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1e293b'
          }
        },
        legend: {
          show: false
        }
      };
    } else {
      this.ipcAdmissionChartData = null;
    }
  }

  groupWardData(data: any[]): any[] {
    const grouped: { [key: string]: number } = {};

    data.forEach(item => {
      const ward = item.Ward;
      const count = +item.IPAdmissionCount || 0;

      grouped[ward] = count;

      // if (ward.includes('SURGICAL')) {
      //   grouped['Surgical'] = (grouped['Surgical'] || 0) + count;
      // } else if (ward.includes('PAEDIATRIC') || ward.includes('PICU')) {
      //   grouped['Pediatrics'] = (grouped['Pediatrics'] || 0) + count;
      // } else if (ward.includes('NURSERY') || ward.includes('NICU')) {
      //   grouped['Nursery'] = (grouped['Nursery'] || 0) + count;
      // } else if (ward.includes('OB-GYNE') || ward.includes('L AND D')) {
      //   grouped['Obs & Gyn'] = (grouped['Obs & Gyn'] || 0) + count;
      // } else if (ward.includes('ICCU') || ward.includes('ICU')) {
      //   grouped['ICCU'] = (grouped['ICCU'] || 0) + count;
      // } else if (ward.includes('MEDICAL')) {
      //   grouped['Medical'] = (grouped['Medical'] || 0) + count;
      // } else if (ward.includes('DIALYSIS')) {
      //   grouped['LTACU'] = (grouped['LTACU'] || 0) + count;
      // } else {
      //   grouped[ward] = count;
      // }
    });

    return Object.entries(grouped).map(([ward, count]) => ({
      Ward: ward,
      IPAdmissionCount: count.toString()
    }));
  }

  loadVentilationByLocationChart() {
    const data = this.ventilatorByLocationData.find((element: any) => element.Ward === this.ventilatorByLocationWard);
    const percentage = parseFloat(data.VentilationRate || '0');
    const color = '#D62AD0';
    this.ventilationByLocationChartData = {
      series: [percentage],
      chart: {
        type: 'radialBar',
        height: 180,
      },
      colors: [color],
      labels: [this.ventilatorByLocationWard],
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
        y: {
          formatter: (val: number) => `${val.toFixed(2)}%` // formats number only
        }
      },
      dataLabels: {
        enabled: true
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
              color,
              formatter: (val: number) => `${val.toFixed(2)}%`,
            },
          },
        },
      },
    };
  }

  loadVentilationComplianceChart(data: any) {
    const categories = data.map((x: any) => x.MonthName);
    const series1 = data.map((x: any) => +x.VentilationBundleForm || 0);
    const series2 = data.map((x: any) => +x.TotalVentilation || 0);
    const series3 = data.map((x: any) => +x.VentilationcomplianceRate || 0);

    this.ventilationComplianceChartData = {};

    this.ventilationComplianceChartData.series = [
      {
        name: 'Ventilator Bundle',
        type: 'column',
        data: series1
      },
      {
        name: 'On Ventilator',
        type: 'column',
        data: series2
      },
      {
        name: 'Compliance Rate',
        type: 'line',
        data: series3
      }
    ];

    this.ventilationComplianceChartData.chart = {
      height: 380,
      width: '100%',
      type: 'line',
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: false }
    };

    this.ventilationComplianceChartData.stroke = {
      width: [0, 0, 3],
      curve: 'smooth',
      colors: ['#A7D129', '#3B2C85', '#C02739']
    };

    this.ventilationComplianceChartData.colors = ['#A7D129', '#3B2C85', '#C02739'];

    this.ventilationComplianceChartData.dataLabels = {
      enabled: true,
      enabledOnSeries: [0, 1],
      style: {
        fontSize: '8px',
        //fontWeight: 'bold'
      },
      offsetY: -10,
      background: { enabled: true, borderRadius: 5, },
      dropShadow: { enabled: false },
      formatter: (val: number, opts: any) => {
        const seriesIndex = opts.seriesIndex;
        if (seriesIndex === 2) {
          return `${val.toFixed(2)}%`;
        } else {
          return val.toFixed(0);
        }
      }
    };

    this.ventilationComplianceChartData.plotOptions = {
      bar: {
        columnWidth: '40%',
        borderRadius: 2,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.ventilationComplianceChartData.xaxis = {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.ventilationComplianceChartData.markers = {
      size: [0, 0, 5],
      strokeWidth: 2,
      strokeColors: ['#A7D129', '#3B2C85', '#C02739'],
      colors: ['#A7D129', '#3B2C85', '#C02739'],
      hover: { size: 7 }
    };

    this.ventilationComplianceChartData.yaxis = [
      {
        seriesName: ['Ventilator Bundle', 'On Ventilator'],
        title: {
          text: ''
        },
        labels: {
          formatter: (val: number) => val.toFixed(0),
          style: { fontSize: '12px' },
          offsetX: -5
        },
        axisTicks: { show: true },
        axisBorder: { show: true }
      },
      {
        seriesName: 'Compliance Rate',
        opposite: true,
        //title: { text: 'Compliance Rate (%)' },
        labels: {
          formatter: (val: number) => `${val.toFixed(0)}%`,
          style: { fontSize: '12px' }
        },
        min:0,
        max:100,
        axisTicks: { show: true },
        axisBorder: { show: true }
      }
    ];

    this.ventilationComplianceChartData.tooltip = {
      shared: true,
      intersect: false,
      x: { show: true },
      y: [
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(2)}%`
        }
      ]
    };

    this.ventilationComplianceChartData.legend = {
      position: 'bottom',
      horizontalAlign: 'center',
      grouped: false
    };

    this.ventilationComplianceChartData.title = {
      text: 'VENTILATION BUNDLE COMPLIANCE RATE',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };
  }

  fetchIpcCentralLineData(): void {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchIPCCentralLineHISBI, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue()
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response?.Code === 200) {
        console.log(response);
        this.centralLineData = response.FetchIPCCentralLineHISBI1DataList[0];
        this.initializeCentralLineDashboard(response.FetchIPCCentralLineHISBI2DataList, response.FetchIPCCentralLineHISBI3DataList);
      } else {
        this.showErrorModal('Unexpected response code: ' + response?.Code);
      }
    }, error => {
      console.error('Error fetching IPC Central Line data:', error);
      this.showErrorModal('An error occurred while fetching IPC Central Line data.');
    });
  }

  initializeCentralLineDashboard(
    locationData: any[],
    bundleData: any[]
  ) {
    this.loadCentralLineByLocationChart(locationData);
    this.loadCentralLineBundleComplianceChart(bundleData);
  }

  loadCentralLineByLocationChart(data: any[]) {
    if (!data || data.length === 0) {
      this.centralLineLocationChartData = null;
      return;
    }

    const rates = data.map((item: any) => +item.CenterlineRate || 0);
    const wards = data.map((item: any) => item.Ward);

    this.centralLineLocationChartData = {
      series: rates,
      chart: {
        type: 'donut',
        width: '100%',
        height: '200px',
      },
      labels: wards,
      colors: ['#8B4513', '#CD853F', '#D2691E', '#F4A460', '#DEB887', '#BC8F8F'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          gradientToColors: ['#A0522D', '#F4A460', '#FF8C00', '#FFB347', '#F5DEB3', '#D2B48C'],
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
        curve: 'straight'
      },
      legend: {
        show: true,
        position: 'bottom',
        fontSize: "10px"
      },
      title: {
        text: 'PATIENT ON CENTRAL LINE BY LOCATION',
        align: 'center',
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#383A88'
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val.toFixed(1)}%`
        }
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: undefined,
        formatter: (_: any, opts: any) => {
          const value = opts.w.config.series[opts.seriesIndex];
          return `${Number(value).toFixed(1)}%`;
        },
        textAnchor: 'end',
        distributed: false,
        offsetX: 0,
        offsetY: 0,
        style: {
          fontSize: '10px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          colors: ['#F5F5F7']
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
            chart: { width: 300, height: 210 },
            legend: { position: 'bottom', fontSize: "10px" }
          }
        },
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 250
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
          dataLabels: {
            offset: 20,

          },

        }
      }
    };
  }


  loadCentralLineBundleComplianceChart(data: any[]) {
    if (!data || data.length === 0) {
      this.centralLineBundleChartData = null;
      return;
    }

    const categories = data.map((item: any) => item.Ward);
    const insertionData = data.map((item: any) => +item.CenterlineInsertion || 0);
    const bundleData = data.map((item: any) => +item.CenterlineBundleForm || 0);

    this.centralLineBundleChartData = {
      series: [
        {
          name: 'Central Line Insertion',
          data: insertionData
        },
        {
          name: 'Central Line Bundle Form',
          data: bundleData
        }
      ],
      chart: {
        type: 'bar',
        height: 400,
        toolbar: { show: true },
        zoom: { enabled: false }
      },
      colors: ['#C70039', '#1E3A8A'],
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '60%',
          dataLabels: {
            position: 'bottom'
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => val.toString(),
        style: {
          fontSize: '8px',
          //fontWeight: 'bold',
          colors: ['#fff']
        },
        offsetX: 10
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: 500
          }
        },
        title: {
          text: 'Count',
          style: {
            fontWeight: 'bold',
            fontSize: '14px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Wards',
          style: {
            fontWeight: 'bold',
            fontSize: '14px'
          }
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val} Cases`
        }
      },
      title: {
        text: 'CENTRAL LINE INSERTION BUNDLE COMPLIANCE',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#1e293b'
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '12px',
        markers: {
          width: 12,
          height: 12
        }
      },
      grid: {
        borderColor: '#e0e6ed',
        strokeDashArray: 3
      }
    };
  }

  getCentralLineMetrics() {
    return this.centralLineMetrics;
  }

  fetchVentilationUtilizationRatioData() {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchIPCCentralLineVENTILATORUtilizationRatioHISBI, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue(),
      WardID: this.ventilatorUtilizationWardId
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.loadVentilationUtilizationChart(response.FetchIPCCentralLineVENTILATORUtilizationRatioHISBI1DataList);
      } else {
        this.ventilationUtilizationChartData = null;
      }
    });
  }

  loadVentilationUtilizationChart(data: any) {
    const categories = data.map((x: any) => x.MonthName);
    const series1 = data.map((x: any) => +x.TotalPatientDays || 0);
    const series2 = data.map((x: any) => +x.TotalVentilation || 0);
    const series3 = data.map((x: any) => +x.VentilationRate || 0);

    this.ventilationUtilizationChartData = {};

    this.ventilationUtilizationChartData.series = [
      {
        name: 'Patient Days',
        type: 'area',
        data: series1
      },
      {
        name: 'Ventilator Days',
        type: 'column',
        data: series2
      },
      {
        name: 'Utilization Ratio',
        type: 'line',
        data: series3
      }
    ];

    this.ventilationUtilizationChartData.chart = {
      height: 300,
      width: '100%',
      type: 'line',
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: false }
    };

    this.ventilationUtilizationChartData.stroke = {
      width: [2, 0, 3],
      curve: 'smooth',
      colors: ['#E1F4FF', '#0099FF', '#196B24']
    };

    this.ventilationUtilizationChartData.colors = ['#E1F4FF', '#0099FF', '#196B24'];

    this.ventilationUtilizationChartData.dataLabels = {
      enabled: true,
      enabledOnSeries: [2],
      style: {
        fontSize: '8px',
        //fontWeight: 'bold'
      },
      offsetY: -10,
      background: { enabled: true, borderRadius: 5, },
      dropShadow: { enabled: false },
      formatter: (val: number, opts: any) => {
        const seriesIndex = opts.seriesIndex;
        if (seriesIndex === 2) {
          return `${val.toFixed(2)}`;
        } else {
          return val.toFixed(0);
        }
      }
    };

    this.ventilationUtilizationChartData.plotOptions = {
      bar: {
        columnWidth: '40%',
        borderRadius: 2,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.ventilationUtilizationChartData.xaxis = {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.ventilationUtilizationChartData.markers = {
      size: [0, 0, 5],
      strokeWidth: 2,
      strokeColors: ['#E1F4FF', '#0099FF', '#196B24'],
      colors: ['#E1F4FF', '#0099FF', '#196B24'],
      hover: { size: 7 }
    };

    this.ventilationUtilizationChartData.yaxis = [
      {
        seriesName: ['Patient Days', 'Ventilator Days'],
        title: {
          text: ''
        },
        labels: {
          formatter: (val: number) => val.toFixed(0),
          style: { fontSize: '12px' },
          offsetX: -5
        },
        min: 0,
        axisTicks: { show: true },
        axisBorder: { show: true }
      },
      {
        seriesName: 'Utilization Ratio',
        opposite: true,
        //title: { text: 'Utilization Ratio' },
        labels: {
          formatter: (val: number) => `${val.toFixed(0)}`,
          style: { fontSize: '12px' }
        },
        min: 0,
        max: 100,
        axisTicks: { show: true },
        axisBorder: { show: true }
      }
    ];

    this.ventilationUtilizationChartData.tooltip = {
      shared: true,
      intersect: false,
      followCursor: true,
      x: { show: true },
      y: [
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(2)}`
        }
      ]
    };

    this.ventilationUtilizationChartData.legend = {
      position: 'bottom',
      horizontalAlign: 'center',
      grouped: false
    };

    this.ventilationUtilizationChartData.title = {
      text: 'VENTILATOR UTILIZATION RATIO',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };
  }

  fetchVentilationEventData() {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchIPCVentilatorAssociatedEventVAEAdultICUHISBI, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue(),
      WardID: this.ventilatorEventWardId
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.loadVentilationEventChart(response.FetchIPCVentilatorAssociatedEventVAEAdultICUHISBI2DataList);
      } else {
        this.ventilationEventChartData = null;
      }
    });
  }

  loadVentilationEventChart(data: any) {
    const categories = data.map((x: any) => x.MonthName);
    const series1 = data.map((x: any) => +x.TotalVentilator || 0);
    const series2 = data.map((x: any) => +x.TotalVAE || 0);
    const series3 = data.map((x: any) => +x.VAERATE || 0);

    this.ventilationEventChartData = {};

    this.ventilationEventChartData.series = [
      {
        name: 'Ventilator Days',
        type: 'area',
        data: series1
      },
      {
        name: 'VAE',
        type: 'column',
        data: series2
      },
      {
        name: 'VAE Rate',
        type: 'line',
        data: series3
      }
    ];

    this.ventilationEventChartData.chart = {
      height: 300,
      width: '100%',
      type: 'line',
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: false }
    };

    this.ventilationEventChartData.stroke = {
      width: [2, 0, 3],
      curve: 'smooth',
      colors: ['#E1F4FF', '#0099FF', '#196B24']
    };

    this.ventilationEventChartData.colors = ['#E1F4FF', '#0099FF', '#196B24'];

    this.ventilationEventChartData.dataLabels = {
      enabled: true,
      enabledOnSeries: [2],
      style: {
        fontSize: '8px',
       // fontWeight: 'bold'
      },
      offsetY: -10,
      background: { enabled: true, borderRadius: 5, },
      dropShadow: { enabled: false },
      formatter: (val: number, opts: any) => {
        const seriesIndex = opts.seriesIndex;
        if (seriesIndex === 2) {
          if (val > 0)
            return `${val.toFixed(2)}%`;
          else
            return;
        } else {
          if (val > 0)
            return val.toFixed(0);
          else
            return;
        }
      }
    };

    this.ventilationEventChartData.plotOptions = {
      bar: {
        columnWidth: '40%',
        borderRadius: 2,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.ventilationEventChartData.xaxis = {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.ventilationEventChartData.markers = {
      size: [0, 0, 5],
      strokeWidth: 2,
      strokeColors: ['#E1F4FF', '#0099FF', '#196B24'],
      colors: ['#E1F4FF', '#0099FF', '#196B24'],
      hover: { size: 7 }
    };

    this.ventilationEventChartData.yaxis = [
      {
        seriesName: ['Ventilator Days', 'VAE'],
        title: {
          text: ''
        },
        labels: {
          formatter: (val: number) => val.toFixed(0),
          style: { fontSize: '12px' },
          offsetX: -5
        },
        min: 0,
        axisTicks: { show: true },
        axisBorder: { show: true }
      },
      {
        seriesName: 'VAE Rate',
        opposite: true,
        //title: { text: 'VAE Rate' },
        labels: {
          formatter: (val: number) => `${val.toFixed(0)}%`,
          style: { fontSize: '12px' }
        },
        min: 0,
        max: 100,
        axisTicks: { show: true },
        axisBorder: { show: true }
      }
    ];

    this.ventilationEventChartData.tooltip = {
      shared: true,
      intersect: false,
      followCursor: true,
      x: { show: true },
      y: [
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(2)}%`
        }
      ]
    };

    this.ventilationEventChartData.legend = {
      position: 'bottom',
      horizontalAlign: 'center',
      grouped: false
    };

    this.ventilationEventChartData.title = {
      text: 'VENTILATOR - ASSOCIATED EVENT(VAE) ',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };
  }

  fetchUrinaryData() {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchIPCUrinaryHISBI, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue()
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.urinaryStatistics = response.FetchIPCUrinaryHISBI1DataList[0];
        this.urinaryByLocationData = response.FetchIPCUrinaryHISBI2DataList;
        this.urinaryByLocationWard = response.FetchIPCUrinaryHISBI2DataList[0].Ward;
        this.loadUrinaryByLocationChart();
        this.loadUrinaryComplianceChart(response.FetchIPCUrinaryHISBI3DataList);
      } else {
        this.urinaryByLocationChartData = null;
        this.urinaryComplianceChartData = null;
        this.urinaryByLocationWard = '';
        this.urinaryByLocationData = [];
      }
    });
  }

  loadUrinaryByLocationChart() {
    const data = this.urinaryByLocationData.find((element: any) => element.Ward === this.urinaryByLocationWard);
    const percentage = parseFloat(data.TotalUrinary || '0');
    const color = '#CF0000';
    this.urinaryByLocationChartData = {
      series: [percentage],
      chart: {
        type: 'radialBar',
        height: 180,
      },
      colors: [color],
      labels: [this.urinaryByLocationWard],
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
        y: {
          formatter: (val: number) => `${val.toFixed(2)}%` // formats number only
        }
      },
      dataLabels: {
        enabled: true
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
              color,
              formatter: (val: number) => `${val.toFixed(2)}%`,
            },
          },
        },
      },
    };
  }

  loadUrinaryComplianceChart(data: any) {
    const categories = data.map((x: any) => x.MonthName);
    const series1 = data.map((x: any) => +x.UrinaryBundleForm || 0);
    const series2 = data.map((x: any) => +x.TotalUrinary || 0);
    const series3 = data.map((x: any) => +x.UrinarycomplianceRate || 0);

    this.urinaryComplianceChartData = {};

    this.urinaryComplianceChartData.series = [
      {
        name: 'Performed Care Bundle',
        type: 'column',
        data: series1
      },
      {
        name: 'Catheter Insertions',
        type: 'column',
        data: series2
      },
      {
        name: 'Compliance Rate',
        type: 'line',
        data: series3
      }
    ];

    this.urinaryComplianceChartData.chart = {
      height: 380,
      width: '100%',
      type: 'line',
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: false }
    };

    this.urinaryComplianceChartData.stroke = {
      width: [0, 0, 3],
      curve: 'smooth',
      colors: ['#00B050', '#590995', '#DA0037']
    };

    this.urinaryComplianceChartData.colors = ['#00B050', '#590995', '#DA0037'];

    this.urinaryComplianceChartData.dataLabels = {
      enabled: true,
      enabledOnSeries: [0, 1],
      style: {
        fontSize: '8px',
        //fontWeight: 'bold'
      },
      offsetY: -10,
      background: { enabled: true, borderRadius: 5, },
      dropShadow: { enabled: false },
      formatter: (val: number, opts: any) => {
        const seriesIndex = opts.seriesIndex;
        if (seriesIndex === 2) {
          return `${val.toFixed(2)}%`;
        } else {
          return val.toFixed(0);
        }
      }
    };

    this.urinaryComplianceChartData.plotOptions = {
      bar: {
        columnWidth: '40%',
        borderRadius: 2,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.urinaryComplianceChartData.xaxis = {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.urinaryComplianceChartData.markers = {
      size: [0, 0, 5],
      strokeWidth: 2,
      strokeColors: ['#00B050', '#590995', '#DA0037'],
      colors: ['#00B050', '#590995', '#DA0037'],
      hover: { size: 7 }
    };

    this.urinaryComplianceChartData.yaxis = [
      {
        seriesName: ['Performed Care Bundle', 'Catheter Insertions'],
        title: {
          text: ''
        },
        labels: {
          formatter: (val: number) => val.toFixed(0),
          style: { fontSize: '12px' },
          offsetX: -5
        },
        axisTicks: { show: true },
        axisBorder: { show: true }
      },
      {
        seriesName: 'Compliance Rate',
        opposite: true,
       // title: { text: 'Compliance Rate (%)' },
        labels: {
          formatter: (val: number) => `${val.toFixed(0)}%`,
          style: { fontSize: '12px' }
        },
        min:0,
        max:100,
        axisTicks: { show: true },
        axisBorder: { show: true }
      }
    ];

    this.urinaryComplianceChartData.tooltip = {
      shared: true,
      intersect: false,
      x: { show: true },
      y: [
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(2)}%`
        }
      ]
    };

    this.urinaryComplianceChartData.legend = {
      position: 'bottom',
      horizontalAlign: 'center',
      grouped: false
    };

    this.urinaryComplianceChartData.title = {
      text: 'URINARY CATHETER CARE BUNDLE COMPLIANCE RATE',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };
  }

  fetchUrinaryUtilizationRatioData() {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchIPCURINARYCATHETERUtilizationRatioHISBI, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue(),
      WardID: this.urinaryUtilizationWardId
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.loadUrinaryUtilizationChart(response.FetchIPCURINARYCATHETERUtilizationRatioHISBI1DataList);
      } else {
        this.urinaryUtilizationChartData = null;
      }
    });
  }

  loadUrinaryUtilizationChart(data: any) {
    const categories = data.map((x: any) => x.MonthName);
    const series1 = data.map((x: any) => +x.TotalPatientDays || 0);
    const series2 = data.map((x: any) => +x.TotalUrinary || 0);
    const series3 = data.map((x: any) => +x.UrinaryRate || 0);

    this.urinaryUtilizationChartData = {};

    this.urinaryUtilizationChartData.series = [
      {
        name: 'Patient Days',
        type: 'area',
        data: series1
      },
      {
        name: 'Catheter Days',
        type: 'column',
        data: series2
      },
      {
        name: 'Utilization Ratio',
        type: 'line',
        data: series3
      }
    ];

    this.urinaryUtilizationChartData.chart = {
      height: 300,
      width: '100%',
      type: 'line',
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: false }
    };

    this.urinaryUtilizationChartData.stroke = {
      width: [2, 0, 3],
      curve: 'smooth',
      colors: ['#E1F4FF', '#FFFF00', '#196B24']
    };

    this.urinaryUtilizationChartData.colors = ['#E1F4FF', '#FFFF00', '#196B24'];

    this.urinaryUtilizationChartData.dataLabels = {
      enabled: true,
      enabledOnSeries: [2],
      style: {
        fontSize: '8px',
        //fontWeight: 'bold'
      },
      offsetY: -10,
      background: { enabled: false },
      dropShadow: { enabled: false },
      formatter: (val: number, opts: any) => {
        const seriesIndex = opts.seriesIndex;
        if (seriesIndex === 2) {
          return `${val.toFixed(2)}`;
        } else {
          return val.toFixed(0);
        }
      }
    };

    this.urinaryUtilizationChartData.plotOptions = {
      bar: {
        columnWidth: '20%',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.urinaryUtilizationChartData.xaxis = {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.urinaryUtilizationChartData.markers = {
      size: [0, 0, 5],
      strokeWidth: 2,
      strokeColors: ['#E1F4FF', '#FFFF00', '#196B24'],
      colors: ['#E1F4FF', '#FFFF00', '#196B24'],
      hover: { size: 7 }
    };

    this.urinaryUtilizationChartData.yaxis = [
      {
        seriesName: ['Patient Days', 'Catheter Days'],
        title: {
          text: ''
        },
        labels: {
          formatter: (val: number) => val.toFixed(0),
          style: { fontSize: '12px' },
          offsetX: -5
        },
        min: 0,
        axisTicks: { show: true },
        axisBorder: { show: true }
      },
      {
        seriesName: 'Utilization Ratio',
        opposite: true,
        //title: { text: 'Utilization Ratio' },
        labels: {
          formatter: (val: number) => `${val.toFixed(0)}`,
          style: { fontSize: '12px' }
        },
        min: 0,
        max: 100,
        axisTicks: { show: true },
        axisBorder: { show: true }
      }
    ];

    this.urinaryUtilizationChartData.tooltip = {
      shared: true,
      intersect: false,
      followCursor: true,
      x: { show: true },
      y: [
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(2)}`
        }
      ]
    };

    this.urinaryUtilizationChartData.legend = {
      position: 'bottom',
      horizontalAlign: 'center',
      grouped: false
    };

    this.urinaryUtilizationChartData.title = {
      text: 'URINARY CATHETER UTILIZATION RATIO',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };
  }

  fetchUrinaryInfectionData() {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchIPCCatheterAssociatedUrinaryTractInfectionCAUTIHISBI, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue(),
      WardID: this.urinaryInfectionWardId
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.loadUrinaryInfectionChart(response.FetchIPCCatheterAssociatedUrinaryTractInfectionCAUTIHISBI2DataList);
      } else {
        this.urinaryInfectionChartData = null;
      }
    });
  }

  loadUrinaryInfectionChart(data: any) {
    const categories = data.map((x: any) => x.MonthName);
    const series1 = data.map((x: any) => +x.TotalUrinary || 0);
    const series2 = data.map((x: any) => +x.TotalCAUTI || 0);
    const series3 = data.map((x: any) => +x.VAERATE || 0);

    this.urinaryInfectionChartData = {};

    this.urinaryInfectionChartData.series = [
      {
        name: 'Urinary Days',
        type: 'area',
        data: series1
      },
      {
        name: 'CAUTI',
        type: 'column',
        data: series2
      },
      {
        name: 'CAUTI Rate',
        type: 'line',
        data: series3
      }
    ];

    this.urinaryInfectionChartData.chart = {
      height: 300,
      width: '100%',
      type: 'line',
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: false }
    };

    this.urinaryInfectionChartData.stroke = {
      width: [2, 0, 3],
      curve: 'smooth',
      colors: ['#E1F4FF', '#FFFF00', '#196B24']
    };

    this.urinaryInfectionChartData.colors = ['#E1F4FF', '#FFFF00', '#196B24'];

    this.urinaryInfectionChartData.dataLabels = {
      enabled: true,
      enabledOnSeries: [2],
      style: {
        fontSize: '8px',
        //fontWeight: 'bold'
      },
      offsetY: -10,
      background: { enabled: false },
      dropShadow: { enabled: false },
      formatter: (val: number, opts: any) => {
        const seriesIndex = opts.seriesIndex;
        if (seriesIndex === 2) {
          return `${val.toFixed(2)}%`;
        } else {
          return val.toFixed(0);
        }
      }
    };

    this.urinaryInfectionChartData.plotOptions = {
      bar: {
        columnWidth: '20%',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.urinaryInfectionChartData.xaxis = {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.urinaryInfectionChartData.markers = {
      size: [0, 0, 5],
      strokeWidth: 2,
      strokeColors: ['#E1F4FF', '#FFFF00', '#196B24'],
      colors: ['#E1F4FF', '#FFFF00', '#196B24'],
      hover: { size: 7 }
    };

    this.urinaryInfectionChartData.yaxis = [
      {
        seriesName: ['Urinary Days', 'CAUTI'],
        title: {
          text: ''
        },
        labels: {
          formatter: (val: number) => val.toFixed(0),
          style: { fontSize: '12px' },
          offsetX: -5
        },
        min: 0,
        axisTicks: { show: true },
        axisBorder: { show: true }
      },
      {
        seriesName: 'CAUTI Rate',
        opposite: true,
        //title: { text: 'CAITU Rate' },
        labels: {
          formatter: (val: number) => `${val.toFixed(0)}%`,
          style: { fontSize: '12px' }
        },
        min: 0,
        max: 100,
        axisTicks: { show: true },
        axisBorder: { show: true }
      }
    ];

    this.urinaryInfectionChartData.tooltip = {
      shared: true,
      intersect: false,
      followCursor: true,
      x: { show: true },
      y: [
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(2)}%`
        }
      ]
    };

    this.urinaryInfectionChartData.legend = {
      position: 'bottom',
      horizontalAlign: 'center',
      grouped: false
    };

    this.urinaryInfectionChartData.title = {
      text: 'CATHETER ASSOCIATED URINARY TRACT INFECTION (CAUTI)',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };
  }

  fetchCentralLineUtilizationData() {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchOverallCentralLineUtilization, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue(),
      WardID: this.centralLineWardId
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.loadCentralLineUtilizationChart(response.FetchIPCCentralLineOVERALLCENTRALLINEUTILIZATIONRATEHISB1DataList);
      } else {
        this.centralLineUtilizationChartData = null;
      }
    });
  }

  loadCentralLineUtilizationChart(data: any) {
    const categories = data.map((x: any) => x.MonthName);
    const series1 = data.map((x: any) => +x.TotalPatientDays || 0);
    const series2 = data.map((x: any) => +x.TotalCenterline || 0);
    const series3 = data.map((x: any) => +x.CenterlineRate || 0);

    this.centralLineUtilizationChartData = {};

    this.centralLineUtilizationChartData.series = [
      {
        name: 'Patient Days',
        type: 'area',
        data: series1
      },
      {
        name: 'Central Line Device Days',
        type: 'column',
        data: series2
      },
      {
        name: 'Utilization Ratio',
        type: 'line',
        data: series3
      }
    ];

    this.centralLineUtilizationChartData.chart = {
      height: 300,
      width: '100%',
      type: 'line',
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: false }
    };

    this.centralLineUtilizationChartData.stroke = {
      width: [2, 0, 3],
      curve: 'smooth',
      colors: ['#E8F4FD', '#FF9500', '#0F7B0F']
    };

    this.centralLineUtilizationChartData.colors = ['#E8F4FD', '#FF9500', '#0F7B0F'];

    this.centralLineUtilizationChartData.dataLabels = {
      enabled: true,
      enabledOnSeries: [1, 2],
      style: {
        fontSize: '8px',
        //fontWeight: 'bold'
      },
      offsetY: -10,
      background: { enabled: true, borderRadius: 5, },
      dropShadow: { enabled: false },
      formatter: (val: number, opts: any) => {
        const seriesIndex = opts.seriesIndex;
        if (seriesIndex === 2) {
          return val.toFixed(2);
        } else {
          return val.toFixed(0);
        }
      }
    };

    this.centralLineUtilizationChartData.plotOptions = {
      bar: {
        columnWidth: '40%',
        borderRadius: 2,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.centralLineUtilizationChartData.xaxis = {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.centralLineUtilizationChartData.markers = {
      size: [0, 0, 5],
      strokeWidth: 2,
      strokeColors: ['#E8F4FD', '#FF9500', '#0F7B0F'],
      colors: ['#E8F4FD', '#FF9500', '#0F7B0F'],
      hover: { size: 7 }
    };

    this.centralLineUtilizationChartData.yaxis = [
      {
        seriesName: ['Patient Days', 'Central Line Device Days'],
        title: {
          text: ''
        },
        labels: {
          formatter: (val: number) => val.toFixed(0),
          style: { fontSize: '12px' },
          offsetX: -5
        },
        min: 0,
        axisTicks: { show: true },
        axisBorder: { show: true }
      },
      {
        seriesName: 'Utilization Ratio',
        opposite: true,
        labels: {
          formatter: (val: number) => val.toFixed(2),
          style: { fontSize: '12px' }
        },
        axisTicks: { show: true },
        axisBorder: { show: true }
      }
    ];

    this.centralLineUtilizationChartData.tooltip = {
      shared: true,
      intersect: false,
      followCursor: true,
      x: { show: true },
      y: [
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => val.toFixed(2)
        }
      ]
    };

    this.centralLineUtilizationChartData.legend = {
      position: 'bottom',
      horizontalAlign: 'center',
      grouped: false
    };

    this.centralLineUtilizationChartData.title = {
      text: '',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };
  }

  fetchCLABSIData() {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchCLABSIAdultICU, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue(),
      WardID: this.clabsiWardId
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.loadCLABSIChart(response.FetchIPCCentralLineAssociatedBloodStreamInfectionCLABSIAdultICUHISBI2DataList);
      } else {
        this.clabsiChartData = null;
      }
    });
  }

  loadCLABSIChart(data: any) {
    const categories = data.map((x: any) => x.MonthName);
    const series1 = data.map((x: any) => +x.TotalCLABSI || 0);
    const series2 = data.map((x: any) => +x.CLABSIRATE || 0);

    this.clabsiChartData = {};

    this.clabsiChartData.series = [
      {
        name: 'CLABSI in Adult ICU',
        type: 'column',
        data: series1
      },
      {
        name: 'CLABSI Rate',
        type: 'line',
        data: series2
      }
    ];

    this.clabsiChartData.chart = {
      height: 300,
      width: '100%',
      type: 'line',
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: false }
    };

    this.clabsiChartData.stroke = {
      width: [0, 3],
      curve: 'smooth',
      colors: ['#FF9500', '#0F7B0F']
    };

    this.clabsiChartData.colors = ['#FF9500', '#0F7B0F'];

    this.clabsiChartData.dataLabels = {
      enabled: true,
      enabledOnSeries: [1],
      style: {
        fontSize: '12px',
        fontWeight: 'bold'
      },
      offsetY: -10,
      background: { enabled: false },
      dropShadow: { enabled: false },
      formatter: (val: number, opts: any) => {
        const seriesIndex = opts.seriesIndex;
        if (seriesIndex === 1) {
          return `${val.toFixed(1)}%`;
        } else {
          return val.toFixed(0);
        }
      }
    };

    this.clabsiChartData.plotOptions = {
      bar: {
        columnWidth: '30%',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.clabsiChartData.xaxis = {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.clabsiChartData.markers = {
      size: [0, 5],
      strokeWidth: 2,
      strokeColors: ['#FF9500', '#0F7B0F'],
      colors: ['#FF9500', '#0F7B0F'],
      hover: { size: 7 }
    };

    this.clabsiChartData.yaxis = [
      {
        seriesName: 'CLABSI in Adult ICU',
        title: {
          text: ''
        },
        labels: {
          formatter: (val: number) => val.toFixed(0),
          style: { fontSize: '12px' },
          offsetX: -5
        },
        min: 0,
        max: 5,
        axisTicks: { show: true },
        axisBorder: { show: true }
      },
      {
        seriesName: 'CLABSI Rate',
        opposite: true,
        title: { text: '' },
        labels: {
          formatter: (val: number) => `${val.toFixed(1)}%`,
          style: { fontSize: '12px' }
        },
        min: 0,
        max: 1.0,
        axisTicks: { show: true },
        axisBorder: { show: true }
      }
    ];

    this.clabsiChartData.tooltip = {
      shared: true,
      intersect: false,
      followCursor: true,
      x: { show: true },
      y: [
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(1)}%`
        }
      ]
    };

    this.clabsiChartData.legend = {
      position: 'bottom',
      horizontalAlign: 'center',
      grouped: false
    };

    this.clabsiChartData.title = {
      text: '',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };
  }

  fetchCLABSIPediatricData() {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchCLABSIPediatricICU, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue(),
      WardID: this.clabsiPediatricWardId
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.loadCLABSIPediatricChart(response.FetchIPCCentralLineAssociatedBloodStreamInfectionCLABSIPediatricICUHISB2DataList);
      } else {
        this.clabsiPediatricChartData = null;
      }
    });
  }

  loadCLABSIPediatricChart(data: any) {
    const categories = data.map((x: any) => x.MonthName);
    const series1 = data.map((x: any) => +x.CLABSI || 0);
    const series2 = data.map((x: any) => +x.CLABSIRATE || 0);

    this.clabsiPediatricChartData = {};

    this.clabsiPediatricChartData.series = [
      {
        name: 'CLABSI in PICU',
        type: 'column',
        data: series1
      },
      {
        name: 'CLABSI Rate',
        type: 'line',
        data: series2
      }
    ];

    this.clabsiPediatricChartData.chart = {
      height: 300,
      width: '100%',
      type: 'line',
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: false }
    };

    this.clabsiPediatricChartData.stroke = {
      width: [0, 3],
      curve: 'smooth',
      colors: ['#FF9500', '#0F7B0F']
    };

    this.clabsiPediatricChartData.colors = ['#FF9500', '#0F7B0F'];

    this.clabsiPediatricChartData.dataLabels = {
      enabled: true,
      enabledOnSeries: [1],
      style: {
        fontSize: '12px',
        fontWeight: 'bold'
      },
      offsetY: -10,
      background: { enabled: false },
      dropShadow: { enabled: false },
      formatter: (val: number, opts: any) => {
        const seriesIndex = opts.seriesIndex;
        if (seriesIndex === 1) {
          return `${val.toFixed(0)}%`;
        } else {
          return val.toFixed(0);
        }
      }
    };

    this.clabsiPediatricChartData.plotOptions = {
      bar: {
        columnWidth: '30%',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.clabsiPediatricChartData.xaxis = {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.clabsiPediatricChartData.markers = {
      size: [0, 5],
      strokeWidth: 2,
      strokeColors: ['#FF9500', '#0F7B0F'],
      colors: ['#FF9500', '#0F7B0F'],
      hover: { size: 7 }
    };

    this.clabsiPediatricChartData.yaxis = [
      {
        seriesName: 'CLABSI in PICU',
        title: {
          text: ''
        },
        labels: {
          formatter: (val: number) => val.toFixed(0),
          style: { fontSize: '12px' },
          offsetX: -5
        },
        min: 0,
        max: 3,
        axisTicks: { show: true },
        axisBorder: { show: true }
      },
      {
        seriesName: 'CLABSI Rate',
        opposite: true,
        title: { text: '' },
        labels: {
          formatter: (val: number) => `${val.toFixed(0)}%`,
          style: { fontSize: '12px' }
        },
        min: 0,
        max: 8,
        axisTicks: { show: true },
        axisBorder: { show: true }
      }
    ];

    this.clabsiPediatricChartData.tooltip = {
      shared: true,
      intersect: false,
      followCursor: true,
      x: { show: true },
      y: [
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(0)}%`
        }
      ]
    };

    this.clabsiPediatricChartData.legend = {
      position: 'bottom',
      horizontalAlign: 'center',
      grouped: false
    };

    this.clabsiPediatricChartData.title = {
      text: '',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };
  }

  fetchNICUCentralLineData() {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchCentralLineNICUWeight, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue(),
      WardID: this.nicuCentralLineWardId,
      FromWeight: this.selectedNicuWeightRange.fromWeight,
      ToWeight: this.selectedNicuWeightRange.toWeight
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.loadNICUCentralLineChart(response.FetchIPCCentralLineNICUWeightHISBI1DataList);
      } else {
        this.nicuCentralLineChartData = null;
      }
    });
  }

  loadNICUCentralLineChart(data: any) {
    const categories = data.map((x: any) => x.MonthName);
    const series1 = data.map((x: any) => +x.TotalPatientDays || 0);
    const series2 = data.map((x: any) => +x.TotalCenterline || 0);
    const series3 = data.map((x: any) => +x.CenterlineRate || 0);

    this.nicuCentralLineChartData = {};

    this.nicuCentralLineChartData.series = [
      {
        name: 'Patient Days',
        type: 'area',
        data: series1
      },
      {
        name: '1001 - 1500 g',
        type: 'column',
        data: series2
      },
      {
        name: 'Utilization Ratio',
        type: 'line',
        data: series3
      }
    ];

    this.nicuCentralLineChartData.chart = {
      height: 300,
      width: '100%',
      type: 'line',
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: false }
    };

    this.nicuCentralLineChartData.stroke = {
      width: [2, 0, 3],
      curve: 'smooth',
      colors: ['#E8F4FD', '#FF9500', '#0F7B0F']
    };

    this.nicuCentralLineChartData.colors = ['#E8F4FD', '#FF9500', '#0F7B0F'];

    this.nicuCentralLineChartData.dataLabels = {
      enabled: true,
      enabledOnSeries: [1],
      style: {
        fontSize: '12px',
        fontWeight: 'bold'
      },
      offsetY: -15,
      background: { enabled: true,borderRadius: 5, },
      dropShadow: { enabled: false },
      formatter: (val: number, opts: any) => {
        const seriesIndex = opts.seriesIndex;
        if (seriesIndex === 2) {
          return val.toFixed(2);
        } else {
          return val.toFixed(0);
        }
      }
    };

    this.nicuCentralLineChartData.plotOptions = {
      bar: {
        columnWidth: '25%',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.nicuCentralLineChartData.xaxis = {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.nicuCentralLineChartData.markers = {
      size: [0, 0, 5],
      strokeWidth: 2,
      strokeColors: ['#E8F4FD', '#FF9500', '#0F7B0F'],
      colors: ['#E8F4FD', '#FF9500', '#0F7B0F'],
      hover: { size: 7 }
    };

    this.nicuCentralLineChartData.yaxis = [
      {
        seriesName: ['Patient Days', '1001 - 1500 g'],
        title: {
          text: ''
        },
        labels: {
          formatter: (val: number) => val.toFixed(0),
          style: { fontSize: '12px' },
          offsetX: -5
        },
        min: 0,
        axisTicks: { show: true },
        axisBorder: { show: true }
      },
      {
        seriesName: 'Utilization Ratio',
        opposite: true,
        title: { text: '' },
        labels: {
          formatter: (val: number) => val.toFixed(2),
          style: { fontSize: '12px' }
        },
        min: 0,
        max: 100,
        axisTicks: { show: true },
        axisBorder: { show: true }
      }
    ];

    this.nicuCentralLineChartData.tooltip = {
      shared: true,
      intersect: false,
      followCursor: true,
      x: { show: true },
      y: [
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => val.toFixed(2)
        }
      ]
    };

    this.nicuCentralLineChartData.legend = {
      position: 'bottom',
      horizontalAlign: 'center',
      grouped: false
    };

    this.nicuCentralLineChartData.title = {
      text: '',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };

    this.nicuCentralLineChartData.series[1].name = this.selectedNicuWeightRange.label;
  }

  onNicuWeightRangeChange() {
    this.fetchNICUCentralLineData();
  }

  fetchCLABSINeonatalData() {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchCLABSINeonatalICU, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue(),
      WardID: this.clabsiNeonatalWardId,
      FromWeight: this.selectedNeonatalWeightRange.fromWeight,
      ToWeight: this.selectedNeonatalWeightRange.toWeight
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.loadCLABSINeonatalChart(response.FetchIPCCentralLineAssociatedBloodStreamInfectionCLABSINEONATALICUHISBI2CUHISB2DataList);
      } else {
        this.clabsiNeonatalChartData = null;
      }
    });
  }

  loadCLABSINeonatalChart(data: any) {
    const categories = data.map((x: any) => x.MonthName);
    const series1 = data.map((x: any) => +x.CLABSI || 0);
    const series2 = data.map((x: any) => +x.CLABSIRATE || 0);

    this.clabsiNeonatalChartData = {};

    this.clabsiNeonatalChartData.series = [
      {
        name: 'CLABSI in NICU',
        type: 'column',
        data: series1
      },
      {
        name: 'CLABSI Rate',
        type: 'line',
        data: series2
      }
    ];

    this.clabsiNeonatalChartData.chart = {
      height: 300,
      width: '100%',
      type: 'line',
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: false }
    };

    this.clabsiNeonatalChartData.stroke = {
      width: [0, 3],
      curve: 'smooth',
      colors: ['#FF9500', '#0F7B0F']
    };

    this.clabsiNeonatalChartData.colors = ['#FF9500', '#0F7B0F'];

    this.clabsiNeonatalChartData.dataLabels = {
      enabled: true,
      enabledOnSeries: [1],
      style: {
        fontSize: '12px',
        fontWeight: 'bold'
      },
      offsetY: -10,
      background: { enabled: false },
      dropShadow: { enabled: false },
      formatter: (val: number, opts: any) => {
        const seriesIndex = opts.seriesIndex;
        if (seriesIndex === 1) {
          return `${val.toFixed(0)}%`;
        } else {
          return val.toFixed(0);
        }
      }
    };

    this.clabsiNeonatalChartData.plotOptions = {
      bar: {
        columnWidth: '30%',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.clabsiNeonatalChartData.xaxis = {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.clabsiNeonatalChartData.markers = {
      size: [0, 5],
      strokeWidth: 2,
      strokeColors: ['#FF9500', '#0F7B0F'],
      colors: ['#FF9500', '#0F7B0F'],
      hover: { size: 7 }
    };

    this.clabsiNeonatalChartData.yaxis = [
      {
        seriesName: 'CLABSI in NICU',
        title: {
          text: ''
        },
        labels: {
          formatter: (val: number) => val.toFixed(0),
          style: { fontSize: '12px' },
          offsetX: -5
        },
        min: 0,
        max: 5,
        axisTicks: { show: true },
        axisBorder: { show: true }
      },
      {
        seriesName: 'CLABSI Rate',
        opposite: true,
        title: { text: '' },
        labels: {
          formatter: (val: number) => `${val.toFixed(0)}%`,
          style: { fontSize: '12px' }
        },
        min: 0,
        max: 1,
        axisTicks: { show: true },
        axisBorder: { show: true }
      }
    ];

    this.clabsiNeonatalChartData.tooltip = {
      shared: true,
      intersect: false,
      followCursor: true,
      x: { show: true },
      y: [
        {
          formatter: (val: number) => `${val.toFixed(0)}`
        },
        {
          formatter: (val: number) => `${val.toFixed(0)}%`
        }
      ]
    };

    this.clabsiNeonatalChartData.legend = {
      position: 'bottom',
      horizontalAlign: 'center',
      grouped: false
    };

    this.clabsiNeonatalChartData.title = {
      text: '',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };
  }

  onNeonatalWeightRangeChange() {
    this.fetchCLABSINeonatalData();
  }

  fetchIPCAdmissionData() {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchIPCAdmissionDetailsHISBI, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue()
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.loadIPCAdmissionChart(response.FetchIPCAdmissionDetailsHISBI1DataList);
      } else {
        this.ipcAdmissionData = null;
      }
    });
  }

  loadIPCAdmissionChart(data: any[]): void {
    const admissionData = data[0] || {};

    const categories = ['CAUTI', 'VAE', 'DE', 'CLABSI'];
    const admissionCounts = categories.map(category => +admissionData[category] || 0);

    this.seriesIPCAdmission = [
      {
        name: 'Admission Count',
        type: 'column',
        data: admissionCounts
      }
    ];

    this.chartIPCAdmission = {
      height: 400,
      type: 'bar',
      toolbar: { show: true },
      zoom: { enabled: false }
    };

    this.plotOptionsIPCAdmission = {
      bar: {
        columnWidth: '45%',
        borderRadius: 1,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.dataLabelsIPCAdmission = {
      enabled: true,
      offsetY: -25,
      style: {
        fontSize: '8px',
        //fontWeight: 'bold',
        colors: ['#392d69']
      },
      background: { enabled: true ,borderRadius: 5,},
    };

    this.colorsIPCAdmission = ['#392d69'];

    this.xaxisIPCAdmission = {
      categories: categories,
      labels: {
        rotate: 0,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.yaxisIPCAdmission = {
      title: {
        text: 'Count',
        style: {
          fontWeight: 600,
          fontSize: '12px'
        }
      },
      labels: {
        formatter: (val: number) => val.toFixed(0)
      }
    };

    this.titleIPCAdmission = {
      text: 'INFECTIOUS DISEASE COUNT',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };

    this.tooltipIPCAdmission = {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${val}`
      }
    };

    this.legendIPCAdmission = {
      position: 'top',
      horizontalAlign: 'right'
    };

    this.fillIPCAdmission = {
      type: 'gradient',
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

  fetchSurveillanceAreaData() {
    const { fromdate, todate } = this.getFormattedDates();
    const url = this.us.getApiUrl(IpcDashboard.FetchIPCAdmissionDetailsHISBI, {
      FromDate: fromdate,
      ToDate: todate,
      HospitalID: this.getLocationsValue()
    });

    this.us.getReport(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.surveillanceAreaData = response.FetchIPCAdmissionDetailsHISBI2DataList;
        this.surveillanceAreaWard = this.surveillanceAreaData[0].Ward;
        this.loadSurveillanceAreaChart();
      } else {
        this.surveillanceAreaData = [];
        this.surveillanceAreaChartData = null;
        this.surveillanceAreaWard = '';
      }
    });
  }

  loadSurveillanceAreaChart() {
    const data = this.surveillanceAreaData.find((element: any) => element.Ward === this.surveillanceAreaWard);
    const percentage = parseFloat(data.IPAdmissionCountPer || '0');
    const color = '#D62AD0';
    this.surveillanceAreaChartData = {
      series: [percentage],
      chart: {
        type: 'radialBar',
        height: 150,
      },
      colors: [color],
      labels: [this.surveillanceAreaWard],
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
        y: {
          formatter: (val: number) => `${val.toFixed(2)}%` // formats number only
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
              color,
              formatter: (val: number) => `${val.toFixed(2)}%`,
            },
          },
        },
      },
    };
  }
}

export const IpcDashboard = {
  FetchIPCVentilationHISBI: 'FetchIPCVentilationHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
  FetchIPCAdmissionDetailsHISBI: 'FetchIPCAdmissionDetailsHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
  FetchIPCCentralLineHISBI: 'FetchIPCCentralLineHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
  FetchIPCCentralLineVENTILATORUtilizationRatioHISBI: 'FetchIPCCentralLineVENTILATORUtilizationRatioHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&WardID=${WardID}',
  FetchIPCVentilatorAssociatedEventVAEAdultICUHISBI: 'FetchIPCVentilatorAssociatedEventVAEAdultICUHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&WardID=${WardID}',
  FetchIPCUrinaryHISBI: 'FetchIPCUrinaryHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
  FetchIPCURINARYCATHETERUtilizationRatioHISBI: 'FetchIPCURINARYCATHETERUtilizationRatioHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&WardID=${WardID}',
  FetchIPCCatheterAssociatedUrinaryTractInfectionCAUTIHISBI: 'FetchIPCCatheterAssociatedUrinaryTractInfectionCAUTIHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&WardID=${WardID}',
  FetchTransferWards: 'FetchTransferWards?HospitalID=${HospitalID}',
  FetchOverallCentralLineUtilization: 'FetchIPCCentralLineOVERALLCENTRALLINEUTILIZATIONRATEHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&WardID=${WardID}',
  FetchCentralLineNICUWeight: 'FetchIPCCentralLineNICUWeightHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&WardID=${WardID}&FromWeight=${FromWeight}&ToWeight=${ToWeight}',
  FetchCLABSIAdultICU: 'FetchIPCCentralLineAssociatedBloodStreamInfectionCLABSIAdultICUHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&WardID=${WardID}',
  FetchCLABSIPediatricICU: 'FetchIPCCentralLineAssociatedBloodStreamInfectionCLABSIPediatricICUHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&WardID=${WardID}',
  FetchCLABSINeonatalICU: 'FetchIPCCentralLineAssociatedBloodStreamInfectionCLABSINEONATALICUHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&WardID=${WardID}&FromWeight=${FromWeight}&ToWeight=${ToWeight}',
};


