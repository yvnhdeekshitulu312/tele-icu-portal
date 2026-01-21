import { Injectable } from '@angular/core';
import { UtilityService } from 'src/app/shared/utility.service';
import { BaseComponent } from "src/app/shared/base.component";
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseComponent {
  facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
  constructor(private service: UtilityService, private https: HttpClient) {
    super();
   }

  param = {
    UserID: 0,
    WorkStationID: 0,
    HospitalID: 0
  }

  getData(baseUrl: any, inputparam: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param, ...inputparam})
  }
}
