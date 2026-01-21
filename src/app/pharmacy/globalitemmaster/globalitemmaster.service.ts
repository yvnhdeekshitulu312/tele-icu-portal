import { UtilityService } from "src/app/shared/utility.service";
import { Injectable } from "@angular/core";
import { BaseComponent } from "src/app/shared/base.component";

@Injectable({
  providedIn: 'root'
})

export class GlobalItemMasterService extends BaseComponent {
  facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
  constructor(private service: UtilityService) {
    super()
  }
  
  param = {
    Type: 0,
    UserID: 0,
    WorkStationID: 0,
    HospitalID: 0
  }

  getData(baseUrl: any, inputparam: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param, ...inputparam})
  }
}