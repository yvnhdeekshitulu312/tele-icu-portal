import { UtilityService } from "src/app/shared/utility.service";
import { Injectable } from '@angular/core';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class DischargeIntimationsService {
  facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
  constructor(private service: UtilityService) { }

  param = {
    FromDate: '',
    ToDate: '',    
    HospitalID: 0,
    PatientID: "0"
  }

  getData(baseUrl: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param})
  }
  fetchData(baseUrl: any, inputparam: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param, ...inputparam})
  }
}
