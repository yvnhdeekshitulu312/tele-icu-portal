import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import * as Highcharts from 'highcharts';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';

declare var $: any;

@Component({
  selector: 'app-wardheader-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  selectedView: any;
  SelectedViewClass: any;
  langData: any;
  showResultsinPopUp = false;
  smartDataList: any;
  patientHigh: any;
  isdetailShow = true;

  constructor(private portalConfig: ConfigService, private router: Router, private modalService: NgbModal, private modalSvc: GenericModalBuilder) {
    this.langData = this.portalConfig.getLangData();
  }

  ngOnInit(): void {
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');

    if (!this.selectedView || Object.keys(this.selectedView).length === 0) {
      this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    }

    if (!this.selectedView || Object.keys(this.selectedView).length === 0) {
      this.selectedView = JSON.parse(sessionStorage.getItem("icubeddetails") || '{}');
    }

    if (this.selectedView.PatientType == "2") {
      if (this.selectedView.Bed.includes('ISO'))
        this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
      else
        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }
  }

  isdetailShows() {
    this.isdetailShow = true;
  }

  isdetailHide() {
    this.isdetailShow = false;
  }

  getHeight() {
    this.portalConfig.getPatientHight(this.selectedView.PatientID).subscribe(res => {
      this.patientHigh = res;
      this.smartDataList = this.patientHigh.SmartDataList;
      $("#bmiChart").modal('show');
      this.createHWChartLine();
    })
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

  getCTASScoreClass() {
    if (this.selectedView?.CTASScore == '1') {
      return 'Resuscitation';
    }
    else if (this.selectedView?.CTASScore == '2') {
      return 'Emergent';
    }
    else if (this.selectedView?.CTASScore == '3') {
      return 'Urgent';
    }
    else if (this.selectedView?.CTASScore == '4') {
      return 'LessUrgent';
    }
    else if (this.selectedView?.CTASScore == '5') {
      return 'NonUrgent';
    }
    return '';
  }
}
