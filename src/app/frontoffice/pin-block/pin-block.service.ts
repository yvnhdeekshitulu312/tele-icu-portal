import { Injectable } from '@angular/core';
import { UtilityService } from 'src/app/shared/utility.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { HttpClient } from '@angular/common/http';
import { config } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PatientPinBlockService extends BaseComponent {
  facilityId = JSON.parse(sessionStorage.getItem('FacilityID') || '3395');
  constructor(private service: UtilityService, private https: HttpClient) {
    super();
  }

  param = {
    UserID: 0,
    WorkStationID: 3395,
    HospitalID: 0,
  };

  fetchPatientDataC = {
    SSN: '',
    PatientID: '',
    MobileNO: '',
    PatientId: '',
    UserId: '',
    WorkStationID: 3395,
    HospitalID: '',
  };

  getData(baseUrl: any, inputparam: any): any {
    return this.service.getApiUrl(baseUrl, { ...this.param, ...inputparam });
  }
  fetchPatientDataBySsn(baseUrl: any): any {
    return this.service.getApiUrl(baseUrl, { ...this.fetchPatientDataC });
  }

  fetchPatientRoot(patientRoot: any) {
    return this.https.get<any>(
      `${config.rcmapiurl}` +
        `FrontOffice/fetchpatientsbytext?PatientSearch=${patientRoot.PatientSearch}&hospitalId=${patientRoot.hospitalId}`
    );
  }

  fetchPatientData(patientData: any) {
    return this.https.get<any>(
      `${config.rcmapiurl}` +
        `FrontOffice/fetchpatient?patientId=${patientData.patientId}&regCode=${patientData.regCode}&hospitalId=${patientData.hospitalId}&workStationId=${patientData.workStationId}`
    );
  }

  fetchPatientBlockMessage() {
    return this.https.get<any>(
      `${config.rcmapiurl}` + `FrontOffice/fetchpinblockmessages`
    );
  }

  fetchSSEmployees(data: any) {
    return this.https.get<any>(
      `${config.apiurl}` +
        `API/FetchSSEmployees?name=${data.name}&UserId=${data.UserId}&WorkstationId=${data.WorkstationId}&HospitalID=${data.HospitalID}`
    );
  }

  fetchPatientPinBlock(data: any) {
    return this.https.get<any>(
      `${config.rcmapiurl}` +
        `FrontOffice/fethcpatientpinblock?patientId=${data.patientId}&userId=${data.userId}&workstationId=${data.workstationId}&hospitalId=${data.hospitalId}`
    );
  }

  patientBlockOrRelease(data: any, type: string) {
    if (type === 'release') {
      return this.https.post(
        `${config.rcmapiurl}` + `FrontOffice/unblockpatient`,
        data
      );
    } else {
      return this.https.post(
        `${config.rcmapiurl}` + `FrontOffice/blockpatient`,
        data
      );
    }
  }
}
