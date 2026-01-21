import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { DischargeIntimationsService } from './discharge-intimations.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

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
  selector: 'app-discharge-intimations',
  templateUrl: './discharge-intimations.component.html',
  styleUrls: ['./discharge-intimations.component.scss'],
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
export class DischargeIntimationsComponent extends BaseComponent implements OnInit {
  datesForm: any;
  url: any;
  toDate = new FormControl(new Date());
  dischargeIntimationsList : any = [];
  constructor(private router: Router, private us: UtilityService, private service: DischargeIntimationsService, public formBuilder: FormBuilder, public datepipe: DatePipe) {
    super();

    this.service.param = {
      ...this.service.param,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID
    };

    this.datesForm = this.formBuilder.group({
      fromdate: this.toDate.value,
      todate: this.toDate.value,
      SSN: ['']
    });
   }

  ngOnInit(): void {

  }


  dischargeIntimationsSearch() {
    const fromDate = this.datepipe.transform(this.datesForm.get('fromdate').value, "dd-MMM-yyyy")?.toString() ?? '';
    const todate = this.datepipe.transform(this.datesForm.get('todate').value, "dd-MMM-yyyy")?.toString() ?? '';
    
    // if(this.selectedPatientID != "0") {
    //   this.service.param.PatientID = this.selectedPatientID;
    // }

    this.url = this.service.fetchData(dischargeintimations.FetchBedDischargeRequests, {
      Type: "2",
      FromDate: fromDate,
      ToDate: todate,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.dischargeIntimationsList = response.FetchBedDischargeRequestsDataList;         
        }
      },
        (err) => {

        })
  }

}

export const dischargeintimations = {
  FetchBedDischargeRequests: 'FetchBedDischargeRequests?IPID=0&Type=${Type}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
};