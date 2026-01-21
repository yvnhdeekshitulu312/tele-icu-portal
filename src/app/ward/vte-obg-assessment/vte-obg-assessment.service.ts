import { UtilityService } from "src/app/shared/utility.service";
import { Injectable } from "@angular/core";
import { BaseComponent } from "src/app/shared/base.component";

@Injectable({
  providedIn: 'root'
})
export class VteObgAssessmentService extends BaseComponent {
  facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '3395');
  constructor(private service: UtilityService) {
    super()
   }

   param = {
    UserId: 0,
    WorkStationID: this.facilityId,
    HospitalID: this.hospitalID
  }

  getData(baseUrl: any, inputparam: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param, ...inputparam})
  }
}
