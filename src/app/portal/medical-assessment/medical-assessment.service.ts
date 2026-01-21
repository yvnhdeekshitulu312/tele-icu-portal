import { UtilityService } from "src/app/shared/utility.service";
import { Injectable } from "@angular/core";
import { BaseComponent } from "src/app/shared/base.component";

@Injectable({
  providedIn: 'root'
})

export class MedicalAssessmentService extends BaseComponent {
  User=JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '3395');
  constructor(private service: UtilityService) {
    super()
  }
  
  param = {
    UserID: this.User[0].UserId,
    PatientID: 0,
    WorkStationID: this.facilityId,
    HospitalID: this.hospitalID
  }

  getData(baseUrl: any, inputparam: any): any {
   this.User=JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
   this.param.UserID=this.User[0].UserId;
    return this.service.getApiUrl(baseUrl, {...this.param, ...inputparam})
  }
}