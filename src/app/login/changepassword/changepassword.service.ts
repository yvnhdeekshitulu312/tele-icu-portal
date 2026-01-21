import { UtilityService } from "src/app/shared/utility.service";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChangepasswordService {

  constructor(private service: UtilityService) { }

  param = {
    FromDate: '',
    ToDate: '',
    Min: 1,
    Max: environment.paginationsize,
    WardID: 0,
    SSN: '0',
    STAT: 0,
    UserID: 0,
    WorkStationID: 0,
    HospitalID: 0,
    Name: '',
    PrescriptionID: 0,
    IsDisPrescription: 0,
    RadSystemIssue: 1,
    ItemID: 0,
    PatientID:0,
    AdmissionID:0
  }
  
  getData(baseUrl: any, inputparam: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param, ...inputparam})
  }
}
