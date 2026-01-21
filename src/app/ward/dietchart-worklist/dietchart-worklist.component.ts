import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/shared/base.component';
import { DietchartWorklistService } from './dietchart-worklist.service';
import { UtilityService } from 'src/app/shared/utility.service';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

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
  selector: 'app-dietchart-worklist',
  templateUrl: './dietchart-worklist.component.html',
  styleUrls: ['./dietchart-worklist.component.scss'],
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
export class DietchartWorklistComponent extends BaseComponent implements OnInit {
  dietDate: any = moment(new Date()).format('DD-MMM-YYYY');
  FetchWardWiseLatestDietPlanWorklistDataList : any = [];
  diagStr: any;
  patientAdmissionDetails: any;
  patientDiagnosisList: any;
  selectedPatientforDiet: any;
  FetchDietRequisitionDataList: any;
  selectedDietReqPlan: any;
  DietInpatient: any;
  filterDietDate : any = new Date();
  divName: string = "dietchartworklist";

  constructor(private datePipe: DatePipe, private fb: FormBuilder, private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private service: DietchartWorklistService) {
    super();
   }

  ngOnInit(): void {
  }

  searchWardWiseLatestDietPlan() {
    var IPID;    
    if(this.selectedView.AdmissionID!=undefined)
      IPID=this.selectedView.AdmissionID;

    const url = this.service.getData(dietchartworklist.FetchWardWiseLatestDietPlanADV, 
      {
        Type : "1", Filter:IPID==undefined?"0":"IPID=" + this.selectedView.AdmissionID, order: "0", WardID: 0, datetime: this.dietDate,
        UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID 
      });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchWardWiseLatestDietPlanWorklistDataList.length > 0) {
          this.FetchWardWiseLatestDietPlanWorklistDataList = response.FetchWardWiseLatestDietPlanWorklistDataList;
          this.FetchWardWiseLatestDietPlanWorklistDataList.forEach((element:any, index:any) => {
            element.selected = false;
          });
        }
      },
        (err) => {
        })
  }

  dietDateChange(event:any) {
    var dietDate = event.target.value;
    this.dietDate = moment(dietDate).format('DD-MMM-YYYY');

  }

  selectPatientDiet(diet:any) {
    this.selectedPatientforDiet = diet;
      this.FetchWardWiseLatestDietPlanWorklistDataList.forEach((element: any, index: any) => {
        if (element.PatientID === diet.PatientID) {
          element.selected = true;
        }
        else {
          element.selected = false;
        }
      });
    }

    fetchAdmissionInPatient() {

      const url = this.service.getData(dietchartworklist.FetchAdmissionInPatient, {
        PatientID: this.selectedPatientforDiet.PatientID,
        IPID: this.selectedPatientforDiet.IPID,
        UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        WorkStationID: this.wardID,
        Hospitalid: this.hospitalID
      });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            
            this.DietInpatient = response;
            this.patientAdmissionDetails = response.FetchAdmissionInPatientDataList[0];            
            this.patientDiagnosisList = response.FetchAdmissionDiagnosisList;
            this.diagStr = this.patientDiagnosisList?.map((item: any) => item.Code + "-" + item.DiseaseName).join(', ');            
            this.fetchDietRequisitionADV();
          }
        },
          (err) => {
          })
    }

    viewDietPlan() {
      this.fetchAdmissionInPatient();
    }

    selectDietReqPlan(plan:any) {
      this.selectedDietReqPlan = plan;
      this.FetchDietRequisitionDataList.forEach((element: any, index: any) => {
        if (element.MonitorID === plan.MonitorID) {
          element.selected = true;
        }
        else {
          element.selected = false;
        }
      });
    }

    fetchDietRequisitionADV() {
      const url = this.service.getData(dietchartworklist.FetchDietRequisitionADV, {
        Type: "0",
        Filter: "IPID=" + this.selectedPatientforDiet.IPID,
        UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        WorkStationID: this.wardID,
        Hospitalid: this.hospitalID
      });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.FetchDietRequisitionDataList.length > 0) {
            this.FetchDietRequisitionDataList = response.FetchDietRequisitionDataList;
            this.FetchDietRequisitionDataList.forEach((element:any, index:any) => {
              element.selected = false;
            });
            $("#divViewDietPlan").modal('show');
          }
        },
          (err) => {
          })
    }

    loadSelectedDietPlanView(dplan:any) {
      sessionStorage.setItem("DietInpatient", JSON.stringify(this.DietInpatient));
      sessionStorage.setItem("DietRequistionDetails", JSON.stringify(dplan));
      this.divName = 'dietcounselling';
      $("#divViewDietPlan").modal('hide');
      // this.router.navigate(['/ward/diet-counselling']);

    }
    loadSelectedDietPlan() {
      const url = this.service.getData(dietchartworklist.FetchAdmissionInPatient, {
        PatientID: this.selectedPatientforDiet.PatientID,
        IPID: this.selectedPatientforDiet.IPID,
        UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        WorkStationID: this.wardID,
        Hospitalid: this.hospitalID
      });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {            
            this.DietInpatient = response;
            this.patientAdmissionDetails = response.FetchAdmissionInPatientDataList[0];            
            this.patientDiagnosisList = response.FetchAdmissionDiagnosisList;
            this.diagStr = this.patientDiagnosisList?.map((item: any) => item.Code + "-" + item.DiseaseName).join(', ');            
            sessionStorage.setItem("DietInpatient", JSON.stringify(this.DietInpatient));
            //this.router.navigate(['/ward/diet-counselling']);
            this.divName = 'dietcounselling';
          }
        },
          (err) => {
          })
      
      
    }
    closeModal() {
      this.searchWardWiseLatestDietPlan();
      this.divName = 'dietchartworklist';
    }
    navigatetoBedBoard() {
      this.router.navigate(['/ward']);
    }
}


export const dietchartworklist = {
  FetchWardWiseLatestDietPlanADV: 'FetchWardWiseLatestDietPlanADV?Type=${Type}&Filter=${Filter}&order=${order}&WardID=${WardID}&datetime=${datetime}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdmissionInPatient: 'FetchAdmissionInPatient?PatientID=${PatientID}&IPID=${IPID}&UserID=${UserID}&WorkStationID=${WorkStationID}&Hospitalid=${Hospitalid}',
  FetchDietRequisitionADV:'FetchDietRequisitionADV?Type=${Type}&Filter=${Filter}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'

};

