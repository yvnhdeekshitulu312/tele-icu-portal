import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ErDashboardService } from '../erdashboard.service';
import moment from 'moment';
import { ApexAnnotations, ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexMarkers, ApexNonAxisChartSeries, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis } from 'ng-apexcharts';
import { ChartExportService } from '../chartexport.service';
import { Width } from 'ngx-owl-carousel-o/lib/services/carousel.service';
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
  plotOptions: ApexPlotOptions;
};

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  title: ApexTitleSubtitle;
  stroke?: ApexStroke;
  fill?: ApexFill;
  colors: string[];
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  markers: ApexMarkers;
  grid?: ApexGrid;
  plotOptions?: ApexPlotOptions;
  tooltip?: ApexTooltip;
};

@Component({
  selector: 'app-er-dashboard',
  templateUrl: './er-dashboard.component.html',
  styleUrls: ['./er-dashboard.component.scss'],
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

export class ErDashboardComponent implements OnInit {
  errorMsg = '';
  datesForm!: FormGroup;
  //hospitalID: number = 3;
  facility: number = 234;
  specialisation: Specialisation[] = [];
  hospitalID: any;
  locations = [
    { label: 'Nuzha', value: 3, selected: false },
    { label: 'Suwaidi', value: 2, selected: false }
  ];
  specializationSearchTerm: string = '';
  selectedLocation = this.locations[0];
  public ctas1!: DonutChartOptions;
  ctasData: any = [];
  ctasCharts: any[] = [];
  EMRVistData: any = [];
  EMRVistDataC: any = [];
  currentEMRAdmissionData: any = [];
  wardData: any = [];
  revisitData: any;
  revisitCharts: any = [];
  waitingTimeData: any;
  waitingTimeCharts: any = [];
  revisitERData: any = [];
  erWaitingData: any = [];

  public chart!: ApexChart;
  public series: ApexAxisChartSeries = [];
  public xaxis!: ApexXAxis;
  public yaxis!: ApexYAxis | ApexYAxis[];
  public dataLabels!: ApexDataLabels;
  public plotOptions!: ApexPlotOptions;
  public fill!: ApexFill;
  public title!: ApexTitleSubtitle;
  public tooltip!: ApexTooltip;
  public stroke!: ApexStroke;
  public colors!: string[];
  public legend!: ApexLegend;
  public annotations!: ApexAnnotations;
  public markers!: ApexMarkers;

  public chartWard!: ApexChart;
  public seriesWard: ApexAxisChartSeries = [];
  public xaxisWard!: ApexXAxis;
  public yaxisWard!: ApexYAxis | ApexYAxis[];
  public dataLabelsWard!: ApexDataLabels;
  public plotOptionsWard!: ApexPlotOptions;
  public fillWard!: ApexFill;
  public titleWard!: ApexTitleSubtitle;
  public tooltipWard!: ApexTooltip;
  public strokeWard!: ApexStroke;
  public colorsWard!: string[];
  public legendWard!: ApexLegend;

  public chartRevisit!: ApexChart;
  public seriesRevisit: ApexAxisChartSeries = [];
  public xaxisRevisit!: ApexXAxis;
  public yaxisRevisit!: ApexYAxis | ApexYAxis[];
  public dataLabelsRevisit!: ApexDataLabels;
  public plotOptionsRevisit!: ApexPlotOptions;
  public fillRevisit!: ApexFill;
  public titleRevisit!: ApexTitleSubtitle;
  public tooltipRevisit!: ApexTooltip;
  public strokeRevisit!: ApexStroke;
  public colorsRevisit!: string[];
  public legendRevisit!: ApexLegend;

  erWaitingTimeChart: ChartOptions = {
    series: [],
    chart: {
      type: 'area',
      height: 400,
      toolbar: { show: true },
      zoom: { enabled: false }
    },
    xaxis: {
      categories: []
    },
    yaxis: [{
      title: { text: 'Percentage (%)' }
    }],
    title: {
      text: 'Emergency Waiting Time',
      align: 'center'
    },
    colors: ['#4c51bf', '#f6ad55', '#2d3748'],
    dataLabels: {
      enabled: true
    },
    legend: {
      position: 'top'
    },
    markers: {
      size: 5
    }
  };


  constructor(private fb: FormBuilder, private erService: ErDashboardService, private exportService: ChartExportService) {
    this.hospitalID = sessionStorage.getItem("hospitalId");
    const vm = new Date();
    vm.setMonth(vm.getMonth() - 2);

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
    this.hospitalID = Number(sessionStorage.getItem("hospitalId")) || 3;
    this.facility = Number(sessionStorage.getItem("facility")) || 234;
    this.fetchSpecialisations();
  }

  locationOptionClicked(event: Event, item: any) {
    event.stopPropagation();
    this.toggleLocationSelection(item);
  }

  toggleLocationSelection(item: any) {
    item.selected = !item.selected;
  }

  fetchSpecialisations(): void {
    this.erService.fetchERSpecialisation(this.facility, this.hospitalID)
      .subscribe({
        next: (response) => {
          if (response?.Code === 200) {
            this.specialisation = response.FetchERSpecialisationHISBIDataList || [];
            this.selectAllSpecialisation(true);
            this.fetchERData();
          }
        },
        error: (err) => {
          console.error('Error fetching departments:', err);
        },
      });
  }

  getSelectAllSpecialisationStatus(): boolean {
    return this.specialisation?.length ? this.specialisation.every(d => d.selected) : false
  }

  selectAllSpecialisation(value: boolean) {
    this.specialisation.forEach(ser => {
      ser.selected = value;
    });
  }

  specialisationOptionClicked(event: Event, item: any) {
    event.stopPropagation();
    this.toggleSpecialisationSelection(item);
  }

  toggleSpecialisationSelection(item: any) {
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

  fetchERData(): void {
    const { fromdate, todate } = this.getFormattedDates();

    if (fromdate && todate && new Date(fromdate) > new Date(todate)) {
      this.showErrorModal("From Date should not be greater than To Date.");
      return;
    }

    const specialiseIDs = this.specialisation
      .filter(d => d.selected)
      .map(d => d.SpecialiseID)
      .join(',');

    let locs = '';
    locs = this.locations?.filter((x: any) => x.selected).map((item: any) => item.value).join(',');

    this.erService.fetchERVisitDetails(
      fromdate,
      todate,
      locs,
      specialiseIDs
    ).subscribe({
      next: (response) => {
        if (response?.Code === 200) {
          this.ctasData = response.FetchERVisitDetailsHISBI1Data1List;
          this.EMRVistData = response.FetchERVisitDetailsHISBI2Data2List;
          this.currentEMRAdmissionData = response.FetchERVisitDetailsHISBI3Data3List;
          this.revisitData = response.FetchERVisitDetailsHISBI5Data5List;
          this.waitingTimeData = response.FetchERVisitDetailsHISBI6Data6List;
          this.wardData = response.FetchERVisitDetailsHISBI4Data4List;
          this.revisitERData = response.FetchERVisitDetailsHISBI7Data7List;
          this.erWaitingData = response.FetchERVisitDetailsHISBI8Data8List;
          this.initializeDonutCharts();
          this.initializeERAdmissionDonutCharts();
          this.initializeRevisitDonutCharts();
          this.initializeWaitingTimeDonutCharts();
          this.loadERAdmissionsChart();
          this.loadWardWiseERAdmissionsChart();
          this.loadERRevisitChart();
          this.loadERWaitingTimeChart();
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  initializeDonutCharts(): void {
    const colorMap: { [key: string]: string } = {
      // '1': '#f57c00',
      // '2': '#f44336',
      // '3': '#4caf50',
      // '4': '#0000FF',
      // '5': '#e91e63',
      '1': 'blue',
      '2': 'red',
      '3': 'yellow',
      '4': 'green',
      '5': 'white',
    };

    const ctasList = this.ctasData?.filter((d: any) => ['1', '2', '3', '4', '5'].includes(d.CTASScoreColorID)) || [];

    this.ctasCharts = ctasList.map((item: any) => {
      const percentage = parseFloat(item.CTASPer || '0');
      const color = colorMap[item.CTASScoreColorID] || '#cccccc';
      const label = `CTAS ${item.CTASScoreColorID}`;

      return {
        label,
        chartOptions: {
          series: [percentage],
          chart: {
            type: 'radialBar',
            height: 150,
            offsetY: -10,
          },
          // track: {
          //   background: '#f1f1f1',
          //   strokeWidth: '100%',
          //   margin: 0, 
          // },item.CTASScoreColorID=='5'?'gray':
          labels: [label],
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
            fillSeriesColor: false,
            theme: false,
             style: {      
              color:'red', 
            },  
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
                background: '#e9e5e5ff',
                strokeWidth: '97%',
                margin: 5,
              },
              dataLabels: {
                name: { show: false },
                value: {
                  fontSize: '17px',
                  fontWeight: 600,
                  //color:item.CTASScoreColorID=='5'?'gray':color,                 
                  formatter: (val: number) => `${val.toFixed(2)}%`,
                   offsetY: 8,
                },
              },
            },
          },
        },
      };
    });
  }


  initializeERAdmissionDonutCharts(): void {
    const colorMap: { [key: string]: string } = {
      '1': '#f57c00'
    };

    //const ctasList = this.EMRVistData?.filter((d: any) => ['1', '2', '3', '4', '5'].includes(d.CTASScoreColorID)) || [];

    this.EMRVistDataC = this.EMRVistData.map((item: any) => {
      const percentage = parseFloat(item.ERAdmissionsPer || '0');
      const color = '#f57c00';
      // const label = `CTAS ${item.CTASScoreColorID}`;

      return {
        // label,
        chartOptions: {
          series: [percentage],
          chart: {
            type: 'radialBar',
            height: 140,
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
        
        },
      };
    });
  }

  initializeRevisitDonutCharts() {
    const revisitData = [{
      label: 'Revisit within 24 Hours',
      value: this.revisitData[0].Revisitwithin24Hours,
      percentage: this.revisitData[0].Revisitwithin24HoursPer,
      color: '#65000B'
    }, {
      label: 'Revisit within 48 Hours',
      value: this.revisitData[0].Revisitwithin48Hours,
      percentage: this.revisitData[0].Revisitwithin48HoursPer,
      color: '#E60026'
    },
    {
      label: 'Revisit within 72 Hours',
      value: this.revisitData[0].Revisitwithin72Hours,
      percentage: this.revisitData[0].Revisitwithin72HoursPer,
      color: '#568203'
    }];

    this.revisitCharts = revisitData.map((item: any) => {
      const percentage = parseFloat(item.percentage || '0');
      const color = item.color;
      const label = item.label;

      return {
        label,
        chartOptions: {
          series: [percentage],
          chart: {
            type: 'radialBar',
            height: 140
          },
          labels: [label],
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
                margin: 5,
              },
              dataLabels: {
                name: {
                  show: true,
                  formatter: () => item.value,
                  fontSize: '20px',
                  offsetY: -10
                },
                value: {
                  show: true,
                  fontSize: '15px',
                  color,
                  formatter: (val: number) => `${val.toFixed(2)}%`,
                  offsetY: 5
                },
              },
            },
          },
        },
      };
    });
  }

  initializeWaitingTimeDonutCharts() {
    const waitingTimeData = [{
      label: 'Waiting Time <30 Min',
      value: this.waitingTimeData[0].WaitingTimelessthan30Min,
      percentage: this.waitingTimeData[0].WaitingTimelessthan30MinPer,
      color: '#FF5800'
    }, {
      label: 'Waiting Time 30-60 Min',
      value: this.waitingTimeData[0].WaitingTime3060Min,
      percentage: this.waitingTimeData[0].WaitingTime3060MinPer,
      color: '#FF0080'
    },
    {
      label: 'Waiting Time 60-120 Min',
      value: this.waitingTimeData[0].WaitingTime60120Min,
      percentage: this.waitingTimeData[0].WaitingTime60120MinPer,
      color: '#003262'
    }];

    this.waitingTimeCharts = waitingTimeData.map((item: any) => {
      const percentage = parseFloat(item.percentage || '0');
      const color = item.color;
      const label = item.label;

      return {
        label,
        chartOptions: {
          series: [percentage],
          chart: {
            type: 'radialBar',
            height: 140
          },
          labels: [label],
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
                margin: 5,
              },
              dataLabels: {
                name: {
                  show: true,
                  formatter: () => item.value,
                  fontSize: '20px',
                  offsetY: -10
                },
                value: {
                  show: true,
                  fontSize: '15px',
                  color,
                  formatter: (val: number) => `${val.toFixed(2)}%`,
                  offsetY: 5
                },
              },
            },
          },
        },
      };
    });
  }

  loadERAdmissionsChart(): void {
    const months = this.currentEMRAdmissionData.map((d: any) => d.MonthName);
    const erVisits = this.currentEMRAdmissionData.map((d: any) => +d.ERVisits);
    const erAdmissions = this.currentEMRAdmissionData.map((d: any) => +d.ERAdmissionCount);

    this.series = [
      {
        name: 'ER Visits',
        type: 'column',
        data: erVisits
      },
      {
        name: 'ER Admissions',
        type: 'line',
        data: erAdmissions
      }
    ];

    this.chart = {
      height: 400,
      type: 'line',
      stacked: false,
      toolbar: { show: true },
      zoom: { enabled: false },
    };

    this.plotOptions = {
      bar: {
        columnWidth: '45%',
        borderRadius: 2,
        dataLabels: {
          position: 'top'
        }
      }
    };
      

    this.dataLabels = {
      enabled: true,
      style: {
        fontSize: '8px',
        //fontWeight: 'bold',
        colors: ['#020344', '#FF0800']

      },
      
      offsetY: -8,
     
      dropShadow: {
        enabled: false
      },
      background: { enabled: true ,borderRadius: 5,},
      formatter: (val: number, opts: any) => {
        const index = opts.seriesIndex;
        if (index === 1) {
          return `\n${val}`;
        }
        return val.toString();
      }
    };


    this.stroke = {
      width: [0, 3],
      colors: ['#FF0800']
    };

    this.colors = ['#020344'];

    this.xaxis = {
      categories: months,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.yaxis = {
      title: {
        text: 'Count',
        style: {
          fontWeight: 600,
          fontSize: '12px'
        }
      },
      labels: {
        formatter: (val: number) => val.toFixed(0)
      },
      tickAmount: 15,// Number of tick intervals to show
      axisTicks: { show: false },
      axisBorder: { show: false, color: '#6366f1' }
    };

    this.tooltip = {
      shared: true,
      intersect: false,
      x: {
          show: true,
          format: 'dd MMM',
          formatter: undefined,
      },
      // y: {
      //     formatter: undefined,
      //     title: {
      //         formatter: (seriesName) => seriesName,
      //     },
      // },

      y: [
        
        {
          
          formatter: (val: number) => `${val.toLocaleString()} `
        },
        {
          formatter: (val: number) => `${val.toLocaleString()} `
        }
      ]
    };

     this.colors = ['#020344', '#FF0800'];

    this.legend = {
     
      position: 'top',
      horizontalAlign: 'right', 
      floating: true,
      //verticalAlign: 'top',
       offsetY: 10,
      // style: {
      //   right:'0px';
      //   position: 'absolute';
      //   left: '0px';
      //   top: '16.0px !important';
      //   max-height: '200px';
      // },
    };
     this.markers = {
            size: 3,
            strokeWidth: 2,
            strokeColors: '#FF0800',
            colors: ['#FF0800'],
            hover: {
                size: 7
            }
        };


    // this.legend = {
    //   show: true
    // };

    this.title = {
      text: 'Admission Through Emergency Department',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };

    this.fill = {
      type: ['gradient', 'solid'],
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.4,
        gradientToColors: ['#28b8d5'],
        inverseColors: false,
        opacityFrom: 0.9,
        opacityTo: 0.9,
        stops: [0, 100]
      }
    };
  }

  loadWardWiseERAdmissionsChart(): void {
    const wardNames = this.wardData.map((d: any) => d.Ward);
    const erAdmissions = this.wardData.map((d: any) => +d.ERAdmissionCount);

    this.seriesWard = [
      {
        name: 'ER Admissions',
        type: 'column',
        data: erAdmissions
      }
    ];

    this.chartWard = {
      height: 400,
      type: 'bar',
        toolbar: { show: true },
      zoom: { enabled: false },
    };

    this.plotOptionsWard = {
      bar: {
        columnWidth: '45%',
        borderRadius: 2,
        dataLabels: {
          position: 'top'
        }
      }
    };

    this.dataLabelsWard = {
      enabled: true,
      offsetY: -18,
      style: {
        fontSize: '8px',
        //fontWeight: 'bold',
        colors: ['#392d69']
      },
      background: { enabled: true ,borderRadius: 5,},
    };

    this.colorsWard = ['#392d69'];

    this.xaxisWard = {
      categories: wardNames,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    };

    this.yaxisWard = {
      title: {
        text: 'Admissions',
        style: {
          fontWeight: 600,
          fontSize: '12px'
        }
      },
      labels: {
        formatter: (val: number) => val.toFixed(0)
      }
    };

    this.titleWard = {
      text: 'Admission through ED - Ward Wise',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b'
      }
    };

    // this.tooltipWard = {
    //   y: {
    //     formatter: (val: number) => `${val} admissions`
    //   }
    // };
    this.tooltipWard = {
        shared: true,
        intersect: false,
        y: {
         formatter: (val: number) => `${val} `
        }
      };

   
    this.legendWard = {
      position: 'top',
      horizontalAlign: 'right', 
    };

    // this.legendWard = {
    //   show: true
    // };

    this.fillWard = {
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

  loadERRevisitChart(): void {
    try {
      const months = this.revisitERData.map((d: any) => d.MonthName);
      const within24 = this.revisitERData.map((d: any) => Number(d.Revisitwithin24Hours) || 0);
      const within48 = this.revisitERData.map((d: any) => Number(d.Revisitwithin48Hours) || 0);
      const within72 = this.revisitERData.map((d: any) => Number(d.Revisitwithin72Hours) || 0);

      this.seriesRevisit = [
        {
          name: '24 Hrs',
          data: within24
        },
        {
          name: '48 Hrs',
          data: within48
        },
        {
          name: '72 Hrs',
          data: within72
        }
      ];

      this.chartRevisit = {
        type: 'bar',
        height: 400,
        stacked: false,
          toolbar: { show: true },
         zoom: { enabled: false },
      };

      this.plotOptionsRevisit = {
        bar: {
          columnWidth: '45%',
          borderRadius: 2,
          dataLabels: {
                    position: 'top',
                    orientation: 'vertical'
                },
                distributed: false,
        }
      };

      this.dataLabelsRevisit = {
        enabled: true,
        style: {
          fontSize: '8px',
          //fontWeight: 'bold',
          colors: ['#000']
        },
        offsetY:5, 
        formatter: function (val: number) {
          return val.toString();
        }
      };

      this.xaxisRevisit = {
        categories: months,
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

      this.yaxisRevisit = {
        title: {
          text: 'Revisit Count',
          style: {
            fontWeight: '600',
            fontSize: '12px'
          }
        },
        labels: {
          formatter: function (val: number) {
            return val.toFixed(0);
          }
        }
      };

      this.colorsRevisit = ['#D800A6', '#400D51', '#31E1F7'];

      this.tooltipRevisit = {
        shared: true,
        intersect: false,
        y: {
          formatter: function (val: number) {
            return val + " revisits";
          }
        }
      };

      this.titleRevisit = {
        text: 'Emergency Patient Revisit',
        align: 'center',
        style: {
          fontSize: '18px',
          fontWeight: 'bold'
        }
      };

      this.legendRevisit = {
        position: 'top',
      horizontalAlign: 'right', 
      };

    } catch (error) {
      console.error('Error loading ER Revisit Chart:', error);
    }
  }

  loadERWaitingTimeChart() {
    const list = this.erWaitingData;

    const sortedList = list.sort((a: any, b: any) =>
      parseInt(a.MonthID) - parseInt(b.MonthID)
    );

    const months = sortedList.map((item: any) => item.MonthName);

    const lessThan30MinData = sortedList.map((item: any) =>
      parseFloat(item.WaitingTimelessthan30MinPer || '0')
    );

    const thirtyTo60MinData = sortedList.map((item: any) =>
      parseFloat(item.WaitingTime3060MinPer || '0')
    );

    const sixtyTo120MinData = sortedList.map((item: any) =>
      parseFloat(item.WaitingTime60120MinPer || '0')
    );

    this.erWaitingTimeChart.series = [
      {
        name: '<30 Min',
        data: lessThan30MinData,
        color: '#642ca9'
      },
      {
        name: '30-60 Min',
        data: thirtyTo60MinData,
        color: '#fb6107'
      },
      {
        name: '60-120 Min',
        data: sixtyTo120MinData,
        color: '#04471c'
      }
    ];

    // Bar Chart
    this.erWaitingTimeChart.chart = {
      type: 'bar',
      height: 400,
      toolbar: { show: true },
      zoom: { enabled: false },
      stacked: false
    };

    this.erWaitingTimeChart.plotOptions = {
       bar: {
          columnWidth: '45%',
          borderRadius: 2,
          dataLabels: {
                    position: 'top',
                    orientation: 'vertical'
                },
                distributed: false,
        }
    }

    this.erWaitingTimeChart.dataLabels = {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(2)}%`,
      offsetY:5, 
      style: {
        fontSize: '8px',
        //fontWeight: 'bold',
        colors: ['#4c51bf']
      },
      // background: {
      //   enabled: false,
      // },
      //background: { enabled: true ,borderRadius: 5,},
      dropShadow: {
        enabled: false,
      }
    };

    this.erWaitingTimeChart.xaxis = {
      categories: months,
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 600
        }
      }
    };

    this.erWaitingTimeChart.yaxis = [
      {
        title: {
          text: 'Percentage (%)',
          style: {
            fontSize: '14px',
            fontWeight: 600
          }
        },
        labels: {
          formatter: (val: number) => `${val.toFixed(1)}%`,
          style: {
            fontSize: '12px'
          }
        }
      }
    ];

    this.erWaitingTimeChart.colors = ['#4c51bf', '#f6ad55', '#C4E4B6'];

    this.erWaitingTimeChart.legend = {
     position: 'top',
      horizontalAlign: 'right', 
    };

    this.erWaitingTimeChart.title = {
      text: 'Emergency Waiting Time',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2d3748'
      }
    };

    (this.erWaitingTimeChart as any).tooltip = {
      shared: true,
      intersect: false,
      y: {
        formatter: function (val: number, opts: any) {
          return val.toFixed(2) + '%';
        }
      }
    };


    // Area Chart
    // this.erWaitingTimeChart.chart = {
    //   type: 'area',
    //   height: 400,
    //   toolbar: { show: true },
    //   zoom: { enabled: false },
    //   stacked: false
    // };

    // this.erWaitingTimeChart.stroke = {
    //   curve: 'smooth',
    //   width: 3,
    //   colors: ['#4c51bf', '#f6ad55', '#C4E4B6']
    // };

    // this.erWaitingTimeChart.fill = {
    //   type: 'gradient',
      
    //   gradient: {
    //     shade: 'light',
    //     type: 'vertical',
    //     shadeIntensity: 0.3,
    //     gradientToColors: ['#4c51bf', '#f6ad55', '#C4E4B6'],
    //     opacityFrom: 0.4,
    //     opacityTo: 0.1,
    //     stops: [0, 90, 100]
    //   }
    // };

    // this.erWaitingTimeChart.markers = {
    //   size: 5,
    //   strokeWidth: 2,
    //   strokeColors: '#fff',
    //   colors: ['#4c51bf', '#f6ad55', '#C4E4B6'],
    //   hover: {
    //     size: 7
    //   }
    // };

    // this.erWaitingTimeChart.dataLabels = {
    //   enabled: true,
    //   formatter: (val: number) => `${val.toFixed(2)}%`,
    //   offsetY: -8,
    //   offsetX: 0,
    //   style: {
    //     fontSize: '11px',
    //     fontWeight: 'bold',
    //     colors: ['#1f2937']
    //   },
    //   background: {
    //     enabled: false,
    //   },
    //   dropShadow: {
    //     enabled: false,
    //   }
    // };


    // this.erWaitingTimeChart.xaxis = {
    //   categories: months,
    //   labels: {
    //     style: {
    //       fontSize: '12px',
    //       fontWeight: 600
    //     }
    //   }
    // };

    // this.erWaitingTimeChart.yaxis = [
    //   {
    //     title: {
    //       text: 'Percentage (%)',
    //       style: {
    //         fontSize: '14px',
    //         fontWeight: 600
    //       }
    //     },
    //     labels: {
    //       formatter: (val: number) => `${val.toFixed(1)}%`,
    //       style: {
    //         fontSize: '12px'
    //       }
    //     },
    //     min: 0,
    //     max: 100
    //   }
    // ];

    // this.erWaitingTimeChart.colors = ['#4c51bf', '#f6ad55', '#C4E4B6'];

    // this.erWaitingTimeChart.legend = {
    //  position: 'top',
    //   horizontalAlign: 'right', 
    // };

    // this.erWaitingTimeChart.title = {
    //   text: 'Emergency Waiting Time',
    //   align: 'center',
    //   style: {
    //     fontSize: '18px',
    //     fontWeight: 'bold',
    //     color: '#2d3748'
    //   }
    // };

    // (this.erWaitingTimeChart as any).grid = {
    //   borderColor: '#e2e8f0',
    //   strokeDashArray: 3,
    //   padding: {
    //     left: 20,
    //     right: 20,
    //     top: 10,
    //     bottom: 10
    //   }
    // };

    // (this.erWaitingTimeChart as any).tooltip = {
    //   shared: true,
    //   intersect: false,
    //   y: {
    //     formatter: function (val: number, opts: any) {
    //       return val.toFixed(2) + '%';
    //     }
    //   },
    //   x: {
    //     formatter: function (val: number, opts: any) {
    //       return months[val - 1];
    //     }
    //   },

    // };
  }

  clearAllFilters(): void {
    const vm = new Date();
    vm.setMonth(vm.getMonth() - 8);

    this.datesForm.patchValue({
      fromdate: vm,
      todate: new Date()
    });

    if (this.locations && this.locations.length > 0) {
      this.locations.forEach(location => {
        location.selected = true;
      });
    }

    if (this.specialisation && this.specialisation.length > 0) {
      this.specialisation.forEach(spec => {
        spec.selected = true;
      });
    }

    this.fetchERData();
  }

  exportMonthsChart(format: string) {
    if (!this.currentEMRAdmissionData || this.currentEMRAdmissionData.length === 0) {
      console.warn('No data available for export.');
      return;
    }

    const data = this.currentEMRAdmissionData.map((item: any) => ({
      Month: item.MonthName,
      ER_Visits: +item.ERVisits,
      ER_Admissions: +item.ERAdmissionCount
    }));

    const filename = `Months_Chart_${new Date().toISOString()}`;
    this.handleExport(data, filename, format, 'monthsChart');
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

  exportWardChart(format: string) {
    if (!this.wardData?.length) return;
    const data = this.wardData.map((d: any) => ({
      Ward: d.Ward,
      ER_Admissions: +d.ERAdmissionCount
    }));
    this.handleExport(data, `Ward_Chart_${new Date().toISOString()}`, format, 'wardChart');
  }

  exportRevisitChart(format: string) {
    if (!this.revisitERData?.length) return;
    const data = this.revisitERData.map((d: any) => ({
      Month: d.MonthName,
      Within24Hours: Number(d.Revisitwithin24Hours) || 0,
      Within48Hours: Number(d.Revisitwithin48Hours) || 0,
      Within72Hours: Number(d.Revisitwithin72Hours) || 0
    }));
    this.handleExport(data, `Revisit_Chart_${new Date().toISOString()}`, format, 'revisitChart');
  }

  exportWaitingTimeChart(format: string) {
    if (!this.erWaitingData?.length) return;
    const sortedList = [...this.erWaitingData].sort((a: any, b: any) =>
      parseInt(a.MonthID) - parseInt(b.MonthID)
    );
    const data = sortedList.map((item: any) => ({
      Month: item.MonthName,
      '< 30 min': parseFloat(item.WaitingTimelessthan30MinPer || '0'),
      '30to60 min': parseFloat(item.WaitingTime3060MinPer || '0'),
      '60to120 min': parseFloat(item.WaitingTime60120MinPer || '0')
    }));
    this.handleExport(data, `WaitingTime_Chart_${new Date().toISOString()}`, format, 'waitingTimeChart');
  }


}

export interface Specialisation {
  Specialisation: string;
  SpecialiseID: number;
  selected: boolean;
}