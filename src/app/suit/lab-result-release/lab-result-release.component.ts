import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-lab-result-release',
  templateUrl: './lab-result-release.component.html',
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
export class LabResultReleaseComponent extends BaseComponent implements OnInit {
  dateForm: any;
  patientType = "1";
  facility: any;
  ssn: any = '';
  barcode: any = '';
  FetchLabResultOrderReleaseDataList: any;
  FetchLabResultOrderReleaseDataList1:any;
  sortedGroupedByDate: any;
  showNoRecFound: boolean = true;
  isSelectAll: boolean = false;
  errorMsg: string = "";
  isPanicAbnormal: string = "0";
  constructor(private fb: FormBuilder, private us: UtilityService, private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.initializeForm();
    this.FetchResultReleaseData();
  }

  initializeForm() {
    this.dateForm = this.fb.group({
      FromDate: new Date(),
      ToDate: new Date()
    });
  }

  onDateChange() {
    this.FetchResultReleaseData();
  }

  selectPatientType(type: any) {
    this.patientType = type;
    this.FetchResultReleaseData();
  }

  clearSearchCriteria() {
    this.ssn = '';
    this.barcode = '';
    this.FetchResultReleaseData();
  }
  filterPanicAbnormalResults(type: any) {
    this.isPanicAbnormal = type;
   this.FetchResultReleaseData();
  }

  FetchResultReleaseData() {
    
    this.showNoRecFound = true;
    this.isSelectAll = false;
    this.sortedGroupedByDate = [];
    if(!this.dateForm.get('FromDate')?.value || !this.dateForm.get('ToDate')?.value) {
      return;
    }
    var FilterN='0';
    if(this.isPanicAbnormal === '0') {
      FilterN='All';
    }else   if(this.isPanicAbnormal === '3') {
      FilterN='Normal';
    }
    else   if(this.isPanicAbnormal === '1') {
      FilterN='Panic';
    }
    else   if(this.isPanicAbnormal === '2') {
      FilterN='Abnormal';
    }

    const payload = {
      Type: '0',
      Filter: FilterN,
      PatientType: this.patientType,
      SSN: this.ssn ? this.ssn : '0',
      SampleNumber: this.barcode ? this.barcode: '0',
      FromDate: moment(this.dateForm.get('FromDate').value).format('DD-MMM-YYYY'),
      ToDate: moment(this.dateForm.get('ToDate').value).format('DD-MMM-YYYY'),
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    };

    const url = this.us.getApiUrl(LabResultRelease.FetchLabResultRelease, payload);

    this.us.get(url).subscribe((response: any) => {
      if (response.Code == 200) {


        
        this.FetchLabResultOrderReleaseDataList = this.FetchLabResultOrderReleaseDataList1 =response.FetchLabResultOrderReleaseDataList;

       
        
        const groupedByDate = this.FetchLabResultOrderReleaseDataList.reduce((acc: any, current: any) => {
          const OrderDate = current.SampleCollectedAt.split(' ')[0];
          if (!acc[OrderDate]) {
            acc[OrderDate] = [];
          }
          acc[OrderDate].push(current);
          return acc;
        }, {});

        this.sortedGroupedByDate = Object.entries(groupedByDate)
          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
          .map(([date, items]) => ({ date, items }));

        if (this.FetchLabResultOrderReleaseDataList.length > 0) {
          this.showNoRecFound = false;
        }
        else {
          this.showNoRecFound = true;
        }
      }
    }, (err: any) => {

    });
  }

  fetchDataWithDates(filter: any) {
    if (filter === "M") {
      const wm = new Date();
      wm.setMonth(wm.getMonth() - 1);
      const pd = new Date();
      this.dateForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "3M") {
      const wm = new Date();
      wm.setMonth(wm.getMonth() - 3);
      const pd = new Date();
      this.dateForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "6M") {
      const wm = new Date();
      wm.setMonth(wm.getMonth() - 6);
      const pd = new Date();
      this.dateForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "1Y") {
      const wm = new Date();
      wm.setMonth(wm.getMonth() - 12);
      const pd = new Date();
      this.dateForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "W") {
      const d = new Date();
      d.setDate(d.getDate() - 7); // Subtract 7 days for the past week.
      const wm = d;
      const pd = new Date();
      this.dateForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "T") {
      const d = new Date();
      d.setDate(d.getDate()); // Subtract 7 days for the past week.
      const wm = d;
      const pd = new Date();
      this.dateForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "Y") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      this.dateForm.patchValue({
        FromDate: d,
        ToDate: d,
      });
    }
    this.FetchResultReleaseData();
  }

  onBarcodeEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.FetchResultReleaseData();
    }
  }

  onSSNEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.FetchResultReleaseData();
    }
  }

  onSelectAll() {
    this.isSelectAll = !this.isSelectAll;
    this.sortedGroupedByDate.forEach((data: any) => {
      data.items.forEach((item: any) => {
        item.selected = this.isSelectAll;
      });
    });
  }

  navigateToResultEntry(wrk: any) {
    wrk.GenderId = wrk.GenderID;
    wrk.Test = wrk.TestName;
    sessionStorage.setItem("fromLabResultRelease", "true");
    sessionStorage.setItem("selectedPatientData", JSON.stringify(wrk));
    sessionStorage.setItem("selectedPatientLabData", JSON.stringify(wrk));
    this.router.navigate(['/suit/lab-resultentry']);
  }

  releaseTestResults() {    
    const selectedTestsToRelease = this.FetchLabResultOrderReleaseDataList.filter((x:any) => x.selected);
    if(selectedTestsToRelease.length === 0) {
      this.errorMsg = "Please select atleast one test to release.";
      $('#errorMsg').modal('show');
      return;
    }
    var testOrderIdOrderItemIdTestId = "";
    selectedTestsToRelease.forEach((element:any) => {
      if(testOrderIdOrderItemIdTestId === '') {
        testOrderIdOrderItemIdTestId = element.TestOrderID + ',' + element.TestOrderItemID + ',' + element.TestID;
      }
      else {
        testOrderIdOrderItemIdTestId += ";" + element.TestOrderID + ',' + element.TestOrderItemID + ',' + element.TestID;
      }
    });
    var payload = {
      "TestOrderIDTestOrderItemIDTestID": testOrderIdOrderItemIdTestId,//"117,306,3476;119,319,3909",
      "FromDate": this.dateForm.get("FromDate")?.value,
      "ToDate": this.dateForm.get("ToDate")?.value,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalID
    }
    this.us.post(LabResultRelease.SaveTestResultsRelease, payload).subscribe((response: any) => {
      if (response.Code === 200) {
        this.FetchResultReleaseData();
          $('#savemsg').modal('show');
      }
  },
      (err) => {

      });
  }
 

}

export const LabResultRelease = {
  FetchLabResultRelease: 'FetchLabResultRelease?Type=${Type}&Filter=${Filter}&PatientType=${PatientType}&SSN=${SSN}&SampleNumber=${SampleNumber}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SaveTestResultsRelease:'SaveTestResultsRelease'
};