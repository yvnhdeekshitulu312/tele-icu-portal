import { UtilityService } from "src/app/shared/utility.service";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class DischargeFollowupsService {
  facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
  constructor(private service: UtilityService) {
  }
  
  param = {
    FromDate: '',
    ToDate: '',
    SSN: '0',
    WorkStationID: 0,
    HospitalID: 0
  }

  getData(baseUrl: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param})
  }
}