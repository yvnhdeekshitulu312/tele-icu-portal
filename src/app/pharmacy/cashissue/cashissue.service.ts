import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UtilityService } from "src/app/shared/utility.service";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CashissueService {
  facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');

  constructor(private service: UtilityService, private https: HttpClient) { }

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

  fetchDrugPrescriptionAdvpamas = {
    Ssn : '',
    OrderDate : '',
    PatientID : '',
    UserID: '',
    WorkstationID: '',
    HospitalID : ''
  }
  fetchDrugPrescription = {  
    FromDate : '',
    ToDate : '',
    PatientID : '',
    UserID: '',
    WorkstationID: '',
    HospitalID : ''
  }
  fetchDrugPrescriptionN = {  
    FromDate : '',
    ToDate : '',
    SSN : '',
    UserID: '',
    WorkstationID: '',
    HospitalID : ''
  }
  fetchDrugViewPrescription = {  
    FromDate : '',
    ToDate : '',
    SSN : '',
    UserID: '',
    WorkstationID: '',
    HospitalID : ''
  }

  fetchCashIssuePatientOrderedOrPrescribedDrugsparams = {
    PatientId: '', 
    AdmissionId:'',
    MonitorId: '', 
    PrescriptionId: '',
    UserID: '',
    WorkstationID: '',
    HospitalID : ''
  }
  fetchCashIssuePatientOrderedOrPrescribedDrugsparamsN = {
    PatientId: '', 
    AdmissionId:'',
    DoctorID: '',
    SpecialiseID: '', 
    MonitorId: '', 
    PrescriptionId: '',
    rblIssueMode:0,
    UserID: '',
    WorkstationID: '',
    HospitalID : ''
  }

  fetchTokenCounterMaster = {
    Type:896,
    UserID:0,
    WorkStationID: '',
    HospitalID:0
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

  substituteparams = {
    ItemID: 0, 
    UserID:'', 
    WorkStationID: 0,
    HospitalID: ''
  }

  smartSearchparams = {
    Name: '', 
    userId: '',
    WorkStationID: '',
    HospitalID: ''
  }

  substitutecashissueparams = {
    ItemID: 0, 
    UserID:'', 
    WorkStationID: 0,
    HospitalID: ''
  }

  FetchCashIssuePatientInfoN = {
    PatientId: '',
    rblIssueMode:0,
    UserID:'', 
    WorkStationID: 0,
    HospitalID: ''
  }

  fetchspecializationDoctorparams = {
    UserID:'', 
    WorkStationID: 0,
    HospitalID: ''
  }

  fetchCashIssueItemSelectionparams = {
    ItemID: '',
    rblIssueMode: 0,
    DoctorCode: '',
    UserID:'', 
    WorkStationID: 0,
    HospitalID: ''
  }

  fetchCashIssuePatientInfoNparams = {
    PatientId: '',
    rblIssueMode: 0,
    UserID:'', 
    WorkStationID: 0,
    HospitalID: ''
  }

  fetchDrugPrescriptionAdv(baseUrl: any): any {
    return this.service.getApiUrl(baseUrl, {...this.fetchDrugPrescriptionAdvpamas})
  }
  FetchDrugPrescriptionH(baseUrl: any): any {
    return this.service.getApiUrl(baseUrl, {...this.fetchDrugPrescription})
  }
  FetchDrugPrescriptionHN(baseUrl: any): any {
    return this.service.getApiUrl(baseUrl, {...this.fetchDrugPrescriptionN})
  }
  fetchGlobalMaster(baseUrl: any): any { //Type:any,UserID:any,WorkStationID:any,HospitalID:string
    return this.service.getApiUrl(baseUrl, {...this.fetchTokenCounterMaster});
  }
  fetchPatientDataBySsn(baseUrl: any): any { //Type:any,UserID:any,WorkStationID:any,HospitalID:string
    return this.service.getApiUrl(baseUrl, {...this.fetchPatientDataC});
  }
  fetchCashIssuePatientOrderedOrPrescribedDrugs(baseUrl: any): any { //Type:any,UserID:any,WorkStationID:any,HospitalID:string
    return this.service.getApiUrl(baseUrl, {...this.fetchCashIssuePatientOrderedOrPrescribedDrugsparams});
  }
  fetchCashIssuePatientOrderedOrPrescribedDrugsN(baseUrl: any): any { //Type:any,UserID:any,WorkStationID:any,HospitalID:string
    return this.service.getApiUrl(baseUrl, {...this.fetchCashIssuePatientOrderedOrPrescribedDrugsparamsN});
  }
  getData(baseUrl: any): any {
    return this.service.getApiUrl(baseUrl, {...this.substituteparams})
  }
  getItemSearch(baseUrl: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param, ...this.smartSearchparams})
  }
  fetchCashIssuePatientInfoN(baseUrl: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param, ...this.fetchCashIssuePatientInfoNparams})
  }
  fetchSpecializationDoctorC(baseUrl: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param, ...this.fetchspecializationDoctorparams})
  }
  fetchCashIssueItemSelection(baseUrl: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param, ...this.fetchCashIssueItemSelectionparams})
  }
  fetchData(baseUrl: any, inputparam: any): any {
    return this.service.getApiUrl(baseUrl, {...this.param, ...inputparam})
  }

  makeCardPayment(data: any) {
    return this.https.post<any>(
      `${this.service.rcmapiUrl}OPBilling/pospayment`,
      data
    );
  }
  getipdetails() {
    return this.https.get<any>(
      this.service.rcmapiUrl +
        `CommonData/ipdetails`
    );
  }
}
