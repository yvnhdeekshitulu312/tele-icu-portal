import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../base.component';
import { patientAlertDetails } from './urls';
import { PatientAlertsService } from './patient-alerts.service';
import { UtilityService } from '../utility.service';

@Component({
  selector: 'app-patient-alerts',
  templateUrl: './patient-alerts.component.html',
  styleUrls: ['./patient-alerts.component.scss']
})
export class PatientAlertsComponent extends BaseComponent implements OnInit {
  url = "";
  @Input() PatientID: any;
  @Output() dataChanged = new EventEmitter<boolean>();
  FetchPatientAlertsDataList: any =[];
  FetchPatientAlertsobjPatientAllergyList:any=[];
  constructor(private service: PatientAlertsService, private us: UtilityService) { 
    super()
  }

  ngOnInit(): void {
    this.FetchPatientallertsHeader();
  }

  close() {
    this.dataChanged.emit(false);
  }

  FetchPatientallertsHeader() {
    this.url = this.service.getData(patientAlertDetails.FetchPatientallertsHeader, { PatientID: this.PatientID ,UserID: this.doctorDetails[0].UserId, WorkstationId: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatientAlertsDataList = response.FetchPatientAlertsDataList;
          if(response.objPatientAllergyList.length>0)
          this.FetchPatientAlertsobjPatientAllergyList = response.objPatientAllergyList;
          if(this.FetchPatientAlertsDataList.length === 0) {
            this.close();
          }
        }
      },
        (err) => {

        })
  }

}
