import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { locationData } from 'src/assets/config-constants';
import { config } from 'src/environments/environment';

@Injectable({
  providedIn: 'any'
})
export class DialysisConfigService {
  public devApiUrl = `${config.apiurl}`;
  public hijApiUrl = `${config.hijapiurl}`;
  baseApiUrl = "https://file.io"; 
  public prodApiUrl = "";
  patientDetails: any;
  patientInfo: any;
  hospitalId = locationData.locationId;
  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Basic ' + btoa('AlhhSUNZHippo' + ':' + '*#$@PAlhh^2106'),
    }),
  };
  langData: any;
  langCode: any;
  code: any = "en";

  constructor(private https: HttpClient, private router: Router) {
    this.patientInfo = JSON.parse(sessionStorage.getItem("patientInfo") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    this.langCode = sessionStorage.getItem('lang');
  }

  onLogout() {
    let isLoggedIn = "isLoggedIn";

    sessionStorage.removeItem(isLoggedIn);
    sessionStorage.removeItem("doctorDetails");
    sessionStorage.clear()
    localStorage.clear();
    this.router.navigate(['/login'])
  }
  FetchVisualTriageComponents(UserId: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchVisualTriageComponents?UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchModeOfarrival(UserId: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchModeOfarrival?UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchNurseChiefComplaints(UserId: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchNurseChiefComplaints?UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchEMRPatientData(SSN: any, MobileNO: any, UserId: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchEMRPatientData?SSN=' + SSN + '&MobileNO=' + MobileNO + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  SavePatientEMRCTAS(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientEMRCTAS', payload, this.httpOptions);
  }

  FetchEMRConsultationOrders(FromDate: any, ToDate: any, UserId: any, WorkStationID: any, HospitalID: any, IsTriage: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchEMRConsultationOrders?FromDate=' + FromDate + '&ToDate=' + ToDate + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '&IsTriage=' + IsTriage + '', this.httpOptions);
  }
  UpdateEMRBillDoctorDetails(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'UpdateEMRBillDoctorDetails', payload, this.httpOptions);
  }
  FetchEMRBeds(WardID: any, BedType: any, UserId: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchEMRBeds?WardID=' + WardID + '&BedType=' + BedType + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchEMRTransferAnotherDoc(SpecialisationID: any, UserID: any, WORKSTATIONID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchEMRTransferAnotherDoc?SpecialisationID=' + SpecialisationID + '&UserID=' + UserID + '&WORKSTATIONID=' + WORKSTATIONID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchEMRTransferAnotherDocSpec(SpecialisationID: any,HospDeptID:any ,UserID: any, WORKSTATIONID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchEMRTransferAnotherDocSpec?SpecialisationID=' + SpecialisationID + '&HospDeptID=' + HospDeptID +'&UserID=' + UserID + '&WORKSTATIONID=' + WORKSTATIONID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  SaveEMRBedAllocations(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SaveEMRBedAllocations', payload, this.httpOptions);
  }
  SaveNursetoBeds(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SaveNursetoBeds', payload, this.httpOptions);
  }
  SavePatientBodyMassHeightWeight(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientBodyMassHeightWeight', payload, this.httpOptions);
  }
  SavePatientEMRPrimaryDoctors(EMRPrimaryDoctorRequestID: any,PatientID: any, AdmissionID: any, DoctorID: any, SpecialiseID: any, UserID: any, WORKSTATIONID: any, HospitalID: any) {
    return this.https.post(this.devApiUrl + 'SavePatientEMRPrimaryDoctors', null, {
      params: {
        EMRPrimaryDoctorRequestID, PatientID, AdmissionID, DoctorID, SpecialiseID, UserID, WORKSTATIONID, HospitalID
      }
    })    
  }
  SavePatientEMRPrimaryDoctorRequests(PatientID: any, AdmissionID: any, FromDoctorID: any, FromSpecialiseID: any,ToDoctorID: any, ToSpecialiseID: any,BillID:any, UserID: any, WORKSTATIONID: any, HospitalID: any) {
    return this.https.post(this.devApiUrl + 'SavePatientEMRPrimaryDoctorRequests', null, {
      params: {
        PatientID, AdmissionID, FromDoctorID, FromSpecialiseID,ToDoctorID,ToSpecialiseID,BillID, UserID, WORKSTATIONID, HospitalID
      }
    })    
  }
  FetchPatientEMRPendingPrimaryDoctorRequests(ToDoctorID: any, UserID: any, WORKSTATIONID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchPatientEMRPendingPrimaryDoctorRequests?ToDoctorID=' + ToDoctorID + '&UserId=' + UserID + '&WorkStationID=' + WORKSTATIONID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  RejectPatientEMRPrimaryDoctorRequests(AdmissionID: any, EMRPrimaryDoctorRequestID: any,Remarks:any,RejectedByDocID: any, UserID: any, WORKSTATIONID: any, HospitalID: any) {
    return this.https.post(this.devApiUrl + 'RejectPatientEMRPrimaryDoctorRequests', null, {
      params: {
        AdmissionID, EMRPrimaryDoctorRequestID,Remarks,RejectedByDocID, UserID, WORKSTATIONID, HospitalID
      }
    })
    
  }

  FetchOPDialsisOrderWorkList(FromDate:any, ToDate:any, UserId: any, WorkStationID: any, HospitalID: any, SSN:any) {
    return this.https.get<any>(this.devApiUrl + '/FetchOPDialsisOrderWorkList?FromDate=' + FromDate + '&ToDate=' + ToDate + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '&SSN=' + SSN, this.httpOptions);
  }
  fetchBedsFromWard(WardID: any, ConsultantID: any, Status: any, UserId: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + '/FetchBedsFromWard?WardID=' + WardID + '&ConsultantID=' + ConsultantID + '&Status=' + Status + '&UserId=' + UserId + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
}
