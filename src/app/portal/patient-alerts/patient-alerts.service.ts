import { Injectable } from '@angular/core';
import { UtilityService } from 'src/app/shared/utility.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PatientAlertsService {

  constructor(private service: UtilityService, private https: HttpClient) { }

  param = {
    UserID: 0,
    WorkStationID: 0,
    HospitalID: 0
  }

  getData(baseUrl: any, inputparam: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param, ...inputparam})
  }
}
