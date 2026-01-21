import { Injectable } from '@angular/core';
import { UtilityService } from 'src/app/shared/utility.service';
import { BaseComponent } from "src/app/shared/base.component";
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientAlertsService extends BaseComponent {
  facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
  private patientIdSource = new BehaviorSubject<number | null>(null);
  patientId$ = this.patientIdSource.asObservable();
  constructor(private service: UtilityService, private https: HttpClient) {
    super();
  }

  param = {
    UserID: 0,
    WorkstationId: 0,
    HospitalID: 0
  }

  getData(baseUrl: any, inputparam: any): any {
    return this.service.getApiUrl(baseUrl, { ...this.param, ...inputparam })
  }

  setPatientId(id: number) {
    this.patientIdSource.next(id);
  }
}
