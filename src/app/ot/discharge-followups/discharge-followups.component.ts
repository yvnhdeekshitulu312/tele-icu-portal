import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { DischargeFollowupsService } from './discharge-followups.service';
import { dischargeFollowups } from './urls';
declare var $: any;

@Component({
  selector: 'app-discharge-followups',
  templateUrl: './discharge-followups.component.html',
  styleUrls: ['./discharge-followups.component.scss'],
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
export class DischargeFollowupsComponent extends BaseComponent implements OnInit {
  datesForm: any;
  url: any;
  FetchPatienDischargeAfterFollowUpDataList: any = [];
  toDate = new FormControl(new Date());
  pinfo: any;
  trustedUrl: any;
  errorMessages: any = [];
  showNoRecFound: boolean = true;
  constructor(private router: Router, private us: UtilityService, public datepipe: DatePipe, private service: DischargeFollowupsService, public formBuilder: FormBuilder) {
    super();
    this.service.param = {
      ...this.service.param,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
      WorkStationID: this.doctorDetails[0]?.FacilityId ?? this.service.param.WorkStationID
    };

    var wm = new Date();
    var d = new Date();
    wm.setDate(wm.getDate() - 2);
   

    this.datesForm = this.formBuilder.group({
      fromdate: wm,
      todate: this.toDate.value,
      SSN: ['']
    });
  }

  ngOnInit(): void {
    this.FetchPatienDischargeAfterFollowUp();
  }
  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.FetchPatienDischargeAfterFollowUp();
    }
  }
  onEnterChange() {   
      this.FetchPatienDischargeAfterFollowUp();    
  }
  clearViewScreen() {
    this.FetchPatienDischargeAfterFollowUpDataList = [];  
    $("#ssn").val('');
    var d = new Date();
    var wm = new Date();
    var d = new Date();
    wm.setMonth(wm.getMonth() - 2);
   
    this.datesForm = this.formBuilder.group({
      fromdate: wm,
      todate: this.toDate.value,
      SSN: ['']
    });
    this.FetchPatienDischargeAfterFollowUp();   
  }

  FetchPatienDischargeAfterFollowUp() {
    const fromDate = this.datesForm.get('fromdate').value;
    const todate = this.datesForm.get('todate').value;
    if (fromDate !== null && fromDate !== undefined) {
      this.service.param.FromDate = this.datepipe.transform(fromDate, "dd-MMM-yyyy")?.toString() ?? '';
    }

    if (todate !== null && todate !== undefined) {
      this.service.param.ToDate = this.datepipe.transform(todate, "dd-MMM-yyyy")?.toString() ?? '';
    }

    if (!fromDate || !todate) {
      return;
    }

    this.service.param = {
      ...this.service.param,
      SSN: this.datesForm.get('SSN').value ? this.datesForm.get('SSN').value : 0
    };

    this.url = this.service.getData(dischargeFollowups.FetchPatienDischargeAfterFollowUp);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          
          this.FetchPatienDischargeAfterFollowUpDataList = response.FetchPatienDischargeAfterFollowUpDataList;
          this.FetchPatienDischargeAfterFollowUpDataList.forEach((element: any, index: any) => {
               
            if (element.ScheduleID != "")
              element.Class = "doctor_worklist mb-2 rounded-2 worklist_patientcard Scheduled";
            else 
              element.Class = "doctor_worklist mb-2 rounded-2 worklist_patientcard prescribed";
            
          });

          
          if (this.FetchPatienDischargeAfterFollowUpDataList.length > 0) {
            this.showNoRecFound = false;
          }else 
          this.showNoRecFound = true;
        }
      },
        (err) => {

        })
  }

  navigateToDetails(data: any) {
    sessionStorage.setItem("dischargefollowups", JSON.stringify(data));
    this.router.navigate(['/frontoffice/doctorappointment'])
  }

}
