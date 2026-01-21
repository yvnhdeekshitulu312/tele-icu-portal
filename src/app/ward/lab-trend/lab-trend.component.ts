import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService as BedConfig } from '../services/config.service';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';

declare var $: any;

@Component({
  selector: 'app-lab-trend',
  templateUrl: './lab-trend.component.html',
  styleUrls: ['./lab-trend.component.scss']
})
export class LabTrendComponent implements OnInit {
  selectedView: any;
  hospId: any;
  results: any;
  IsHome = true;
  patinfo:any;
  constructor(private config: BedConfig, private router: Router,private con: ConfigService) { 
    this.langData = this.con.getLangData();
    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true; 
    }
  }
  selectedButtonType = "";
  langData: any;
  duringactiveButton: any = 'spline';
  toggleSelected(type: string): void {
    this.duringactiveButton = type;
    this.selectedButtonType = type;
    if(this.results) {
      this.dynamicChartData();
    }
  }

  ngOnInit(): void {
    this.hospId = sessionStorage.getItem("hospitalId");
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.toggleSelected("spline");
    this.getLabTrends();
  }

  navigatetoBedBoard() {
    this.router.navigate(['/ward']);
  }

  getLabTrends() {
    this.config.getMultipleData(this.selectedView.IPID, this.hospId).subscribe(
      (results) => {
        this.results = results;
        setTimeout(() => {
        this.dynamicChartData(), 1000 });
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  dynamicChartData() {
    this.results.forEach((element: any, index: any) => {
      if (element.length > 0) {
        const testNames = Array.from(new Set(Object.keys(element[0]))).filter(name => name !== "ResultEnteredAt" && name !== "ResultsDate");

      const dynamicArray = testNames.map((testName, index) => {
        return {
          name: testName,
          data: element.map((result : any) => {
            return [result.ResultEnteredAt, result[testName] ? parseFloat(result[testName]) : result[testName]]
          }),
          connectNulls: true,
          visible: index === 0 ? true : false
        };
      });

      const chart = Highcharts.chart('chart-line_'+ index, {
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
      }
      });
  }

  openQuickActions() {
    this.patinfo = this.selectedView;
    $("#quickaction_info").modal('show');
  }
  clearPatientInfo() {
    this.patinfo = "";
  }
  closeModal() {
    $("#quickaction_info").modal('hide');
  }

}
