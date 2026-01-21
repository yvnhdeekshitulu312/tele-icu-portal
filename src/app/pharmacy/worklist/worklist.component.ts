import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { worklistDetails } from './urls';
import { BaseComponent } from 'src/app/shared/base.component';
import { WorklistService } from './worklist.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import moment from 'moment';
declare var $: any;

@Component({
  selector: 'app-worklist',
  templateUrl: './worklist.component.html',
  styleUrls: ['./worklist.component.scss']
})
export class WorklistComponent extends BaseComponent implements OnInit {
  url = '';
  FetchPrescriptionTokenGenerationDataList: any = [];
  PharmacyTokenDataTotalList: any = [];
  currentdate = new Date();
  facility:any;
  trustedUrl: any;
  selectedStatusID: any;
  constructor(@Inject(WorklistService) private service: WorklistService, private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private datePipe: DatePipe) {
    super()
   }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.fetchPrescriptionTokenGeneration();
  }

  navigateToFacility() {
    this.router.navigate(['/ward']);
  }

  fetchPrescriptionTokenGeneration(StatusID: any = '1') {
    this.selectedStatusID = StatusID;
    //this.url = this.service.getData(worklistDetails.FetchPrescriptionTokenGeneration, { ServiceID: 8, UserID: this.doctorDetails[0].UserId, WorkStationID: 3593, HospitalID: this.hospitalID });
    this.url = this.service.getData(worklistDetails.FetchPrescriptionTokenGenerationH, {StatusID, ServiceID: 8, UserID: this.doctorDetails[0].UserId, WorkStationID: this.facility.FacilityID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPrescriptionTokenGenerationDataList = response.FetchPrescriptionTokenGenerationDataList.sort((a: any, b: any) => a.TokennumberNew.localeCompare(b.TokennumberNew));;
          this.PharmacyTokenDataTotalList = response.PharmacyTokenDataTotalList;
        }
      },
        (err) => {

        })
  }

  
  assignToken(token: any) {
    this.fetchPrescriptionTokenGeneration();
    var PrescriptionItems: any = [{
      "PTGID": token.PrescriptionTokenGenerationId,
      "STS": "2",
      "AU": this.doctorDetails[0].UserId,
      "AD": moment(new Date()).format('DD-MMM-YYYY'),
      "TN": token.Tokennumber,
      "ECODE": this.doctorDetails[0].EmpNo
    }];
    
    var payload = {
      "PatientID": token.PatientId,
      "AdmissionID": token.IPID,
      "PrescriptionID": token.PrescriptionId,
      "UserName": this.doctorDetails[0].UserName,
      "HospitalID": this.hospitalID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID,
      "PrescriptionItems": PrescriptionItems
    }

    this.us.post(worklistDetails.UpdatePrescriptionTokenGeneration, payload).subscribe((response) => {
      if (response.Status === "Success") {
        $("#savemsg").modal('show');
        token.isclicked = false;
        this.trustedUrl = response.PatientVitalEndoscopyDataaList[0].FTPPath;
        $('#iframeContainer').modal('show');
        this.fetchPrescriptionTokenGeneration();
      } 
    },
      (err) => {

      })
  }
  Refresh(){
    this.fetchPrescriptionTokenGeneration();
  }

  PrintToken(token: any) {
    //this.fetchPrescriptionTokenGeneration();
   
    
    var payload = {
      "TrayNumber": token.Tokennumber,
      "PatientID": token.PatientId,
      "AdmissionID": token.IPID,
      "PrescriptionID": token.PrescriptionId,
      "UserName": this.doctorDetails[0].UserName,
      "HospitalID": this.hospitalID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID,     
    }

    this.us.post(worklistDetails.PrescriptionTokenGenerationPrint, payload).subscribe((response) => {
      if (response.Status === "Success") {      
        token.isclicked = false;
        this.trustedUrl = response.PatientVitalEndoscopyDataaList[0].FTPPath;
        $('#iframeContainer').modal('show');
        //this.fetchPrescriptionTokenGeneration();
      } 
    },
      (err) => {

      })
  }

}
