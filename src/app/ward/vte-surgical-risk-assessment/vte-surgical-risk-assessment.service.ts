import { Injectable } from '@angular/core';
import { UtilityService } from 'src/app/shared/utility.service';
import { BaseComponent } from "src/app/shared/base.component";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { config } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VteSurgicalRiskAssessmentService extends BaseComponent {
  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Basic ' + btoa('AlhhSUNZHippo' + ':' + '*#$@PAlhh^2106'),
    }),
  };
  public devApiUrl = `${config.apiurl}`;
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
  getPatientHight(PatientID:any){
    return this.https.post(this.devApiUrl + 'FetchPatientHeightWeight?' + 'PatientID=' + PatientID , this.httpOptions)
  }
}
