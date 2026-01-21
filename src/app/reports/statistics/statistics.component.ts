import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { StatisticsService } from './statistics.service';
import { statsDetails } from './urls';
import * as moment from 'moment';
import * as Highcharts from 'highcharts';

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
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
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
export class StatisticsComponent extends BaseComponent implements OnInit {
  datesForm: any;
  url = '';
  FetchDoctorOPIPStatisticsDataList: any = [];
  Highcharts: typeof Highcharts = Highcharts;
  chart!: Highcharts.Chart;
  maleData: any[] = [];
  femaleData: any[] = [];
  saudiData: any[] = [];
  nonSaudiData: any[] = [];
  ipData: any[] = [];
  ALOS: any[]= [];
  Rejection: any[] = [];
  categoriesWard: any = [];
  seriesData: { name: string, data: number[] }[] = [];

  months: any = [];
  selectedMonth!: string;
  data!: any[];
  wardData!: any[];
  selectedLOSMonth!: string;


  constructor(private elementRef: ElementRef, private us: UtilityService, private formBuilder: FormBuilder, private datePipe: DatePipe, private service: StatisticsService) {
    super();
    var vm = new Date();
    vm.setMonth(vm.getMonth() - 1);

    this.datesForm = this.formBuilder.group({
      fromdate: vm,
      todate: new Date()
    });
  }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    var fromdate = this.datesForm.get("fromdate")?.value;
    fromdate = moment(fromdate).format('DD-MMM-YYYY');

    var todate = this.datesForm.get("todate")?.value;
    todate = moment(todate).format('DD-MMM-YYYY');

    if (fromdate && todate) {
      this.url = this.service.getData(statsDetails.FetchDoctorOPIPStatistics, { FromDate: fromdate, ToDate: todate, DoctorID: this.doctorDetails[0]?.EmpId, WorkStationID: 3395, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.FetchDoctorOPIPStatisticsDataList = response.FetchDoctorOPIPStatisticsDataList;

            this.data = response.FetchDoctorOPIPWardStatisticsDataList;
            this.months = [...new Set(response.FetchDoctorOPIPWardStatisticsDataList.map((item: any) => item.MonthName))];
            var categories: any = [];
            var categoriesWard: any = [];
            this.maleData = [];
            this.femaleData = [];
            this.saudiData = [];
            this.nonSaudiData = [];
            this.ipData = [];
            this.ALOS = [];

            this.FetchDoctorOPIPStatisticsDataList.forEach((item: any) => {
              categories.push(item.MonthName);
              if (item.Name === "OPMale") {
                this.maleData.push(parseInt(item.TotalCount));
              } else if (item.Name === "OPFemale") {
                this.femaleData.push(parseInt(item.TotalCount));
              } else if (item.Name === "OPSaudi") {
                this.saudiData.push(parseInt(item.TotalCount));
              } else if (item.Name === "OPNonSaudi") {
                this.nonSaudiData.push(parseInt(item.TotalCount));
              } 
            });

            setTimeout(() => {
              this.createChart(categories);

              if (this.months.length > 0) {
                this.monthdata("All");
                this.monthLOSdata("All");
                this.selectedMonth = this.selectedLOSMonth = "All";
              }
            })
          }
        },
          (err) => {
          })
    }
  }

  onSelectMonth(event: any): void {
    this.monthdata(event.target.value);
  }

  monthdata(selectedmonth: any): void {
    let selectedData: any;

    if(selectedmonth === "All") {
      selectedData = this.data;
    }
    else {
      selectedData = this.data.filter(item => item.MonthName === selectedmonth);
    }
    
    const wardGroups: any = {};
    selectedData.forEach((item: any) => {
      if (!wardGroups[item.Ward]) {
        wardGroups[item.Ward] = 0;
      }
      wardGroups[item.Ward] += parseInt(item.TotalIP, 10);
    });

    this.chart = Highcharts.chart('chart-ip-bar', {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Inpatients'
      },
      credits: {
        enabled: false,
      }, 
      legend: {
        enabled: true,
      },
      xAxis: {
        categories: Object.keys(wardGroups)
      },
      yAxis: {
        title: {
          text: 'Count'
        }
      },
      colors :['#8174A0'],
      dataLabels:{
          enabled: true,
                hideOverlappingLabels :true,
                style: {
                    fontSize: '8px',
                    //fontWeight: 'bold'
                },
                
                offsetY: 10,
                background: { enabled: true ,borderRadius: 5,},
                dropShadow: { enabled: false },
                formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 0 || seriesIndex === 1) {
                        return val.toFixed(0);
                    } else {
                        if(val<=100)
                        return `${val.toFixed(1)}%`;
                    else
                        return;
                    }
                }
      },
      plotOptions : {
                      bar: {
                          columnWidth: '20%',
                          borderRadius: 2,
                          dataLabels: {
                              position: 'top'
                          }
                      }
                  },
      series: [{
        name: 'In Patients',
        data: Object.values(wardGroups)
      }]
    } as any);
  }

  createChart(categories: any): void {
    this.chart = Highcharts.chart('chart-bar', {
      chart: {
        type: 'column'
    },
    title: {
        text: 'Outpatient'
    },
    credits: {
      enabled: false,
    }, 
    legend: {
      enabled: true,
    },
    xAxis: {
        categories: categories
    },
    yAxis: {
        title: {
            text: 'Count'
        }
    },
    series: [{
        name: 'Male',
        data: this.maleData,
        color: '#0D1164'
    }, {
        name: 'Female',
        data: this.femaleData,
        color: '#910A67',	
    }, {
        name: 'Saudi',
        data: this.saudiData,
        color: '#1F7D53',	
    }, {
        name: 'Non Saudi',
         color: '#EA2264',
        data: this.nonSaudiData
    }]
    } as any);
  }

  onSelectLOSMonth(event: any): void {
    this.monthLOSdata(event.target.value);
  }

  monthLOSdata(selectedmonth: any): void {
    let selectedData: any;

    if(selectedmonth === "All") {
      selectedData = this.data;
    }
    else {
      selectedData = this.data.filter(item => item.MonthName === selectedmonth);
    }

    const wardGroupsLOS: any = {};
    selectedData.forEach((item: any) => {
      if (!wardGroupsLOS[item.Ward]) {
        wardGroupsLOS[item.Ward] = 0;
      }
      wardGroupsLOS[item.Ward] += parseInt(item.LOS, 10);
    });

    this.chart = Highcharts.chart('chart-ALOS-bar', {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Avg. length of Stay'
      },
      credits: {
        enabled: false,
      }, 
      legend: {
        enabled: true,
      },
      xAxis: {
        categories: Object.keys(wardGroupsLOS)
      },
      yAxis: {
        title: {
          text: 'Count'
        }
      },
      colors :['#DA8359'],
      dataLabels:{
          enabled: true,
                hideOverlappingLabels :true,
                style: {
                    fontSize: '8px',
                    //fontWeight: 'bold'
                },
                
                offsetY: 10,
                background: { enabled: true ,borderRadius: 5,},
                dropShadow: { enabled: false },
                formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 0 || seriesIndex === 1) {
                        return val.toFixed(0);
                    } else {
                        if(val<=100)
                        return `${val.toFixed(1)}%`;
                    else
                        return;
                    }
                }
      },
      plotOptions : {
                      bar: {
                          columnWidth: '20%',
                          borderRadius: 2,
                          dataLabels: {
                              position: 'top'
                          }
                      }
                  },
      series: [{
        name: 'LOS',
        data: Object.values(wardGroupsLOS)
      }]
    } as any);
  }

}
