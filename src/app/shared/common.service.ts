import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { HttpClient } from '@angular/common/http';
import { BaseComponent } from './base.component';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService extends BaseComponent {
  facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
  url = "";
  constructor(private service: UtilityService, private https: HttpClient) {
    super()
  }

  param = {
    UserID: 0,
    WorkStationID: 0,
    HospitalID: 0
  }

  getData(baseUrl: any, inputparam: any): any {
    return this.service.getApiUrl(baseUrl, { ...this.param, ...inputparam })
  }

  fetchPatientDetails(ssn: string, mobileno: string, patientId: string): Observable<any> {
    this.url = this.getData(urls.fetchPatientDataBySsn, {
      SSN: ssn,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.param.UserID,
      WorkStationID: this.doctorDetails[0]?.FacilityId,
      HospitalID: this.hospitalID ?? this.param.HospitalID,
    });

    return this.service.get(this.url).pipe(
      tap((response: any) => {
        if (response.Code === 200) {
          if (ssn === '0' && response.FetchPatientDependCLists?.length) {
            this.selectedView = response.FetchPatientDependCLists[0];
          } else if (mobileno === '0' && response.FetchPatientDataCCList?.length) {
            this.selectedView = response.FetchPatientDataCCList[0];
          }

          if (this.selectedView) {
            sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
          }
        }
      })
    );
  }

  fetchPatientVistitInfo(admissionid: any, patientid: any): Observable<any> {
    this.url = this.getData(urls.FetchPatientVistitInfo, {
      Patientid: patientid,
      Admissionid: admissionid,
      HospitalID: this.hospitalID ?? this.param.HospitalID,
    });

    return this.service.get(this.url).pipe(
      tap((response: any) => {
        if (response.Code === 200) {
          const patientVisitList = response?.FetchPatientVistitInfoDataList;

          if (Array.isArray(patientVisitList) && patientVisitList.length > 0) {
            const firstVisit = patientVisitList[0];

            this.selectedView = { ...firstVisit }; 

            this.selectedView.DoctorName = firstVisit?.PrimaryDoctor ?? '';
            this.selectedView.PayerName = firstVisit?.CompanyName ?? '';

            sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
          } else {
            this.selectedView = null;
          }

        }
      })
    );
  }
}




export const urls = {
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientVistitInfo: 'FetchPatientVistitInfo?Patientid=${Patientid}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
};

