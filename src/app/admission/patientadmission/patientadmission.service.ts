import { UtilityService } from "src/app/shared/utility.service";
import { Injectable } from '@angular/core';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PatientadmissionService {
  facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
  constructor(private service: UtilityService) { }

  param = {
    FromDate: '',
    ToDate: '',    
    HospitalID: 0,
    UserID: 0,
    WorkStationID: 0
  }

  getData(baseUrl: any, inputparam: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param, ...inputparam})
  }
}
