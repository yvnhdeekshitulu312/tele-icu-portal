import { Injectable } from '@angular/core';
import { UtilityService } from 'src/app/shared/utility.service';
import { BaseComponent } from "src/app/shared/base.component";
import { HttpClient } from '@angular/common/http';
import { config } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OtDoctorappointmentService extends BaseComponent {
  facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
  constructor(private service: UtilityService, private https: HttpClient) {
    super()
   }

   param = {
    UserID: 0,
    WorkStationID: 0,
    HospitalID: 0
  }

  fetchPatientDataC = {
    SSN : '', 
    PatientID:'',
    MobileNO: '', 
    PatientId: '',
    UserId:'', 
    WorkStationID: 0,
    HospitalID: ''
  }

  getData(baseUrl: any, inputparam: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param, ...inputparam})
  }
  fetchPatientDataBySsn(baseUrl: any): any {
    return this.service.getApiUrl(baseUrl, {...this.fetchPatientDataC});
  }
  getPatientDataByYakeenService(
    val1: any,
    val2: any,
    type: any,
    hospitalId: any
  ) {
    return this.https.get<any>(
      `${config.rcmapiurl}` +
        `FrontOffice/yakeenservicedata?value1=${val1}&value2=${val2}&type=${type}&hospitalId=${hospitalId}`
    );
  }
  loadYakeenNationalities(patientData: any) {
    return this.https.get<any>(
      `${config.rcmapiurl}` +
        `CommonData/nationalities?hospitalId=${patientData.hospitalId}&workStationId=${patientData.workStationId}`
    );
  }
  fetchPatientRoot(patientRoot: any) {
    return this.https.get<any>(
      `${config.rcmapiurl}` +
        `FrontOffice/fetchpatientsbytext?PatientSearch=${patientRoot.PatientSearch}&hospitalId=${patientRoot.hospitalId}`
    );
  }
}
