import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { locationData } from 'src/assets/config-constants';
import { config } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public devApiUrl = `${config.apiurl}`;
  public hijApiUrl = `${config.hijapiurl}`;
  baseApiUrl = "https://file.io";//
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
    this.langCode = sessionStorage.getItem('lang');
  }

  onLogout() {
    let isLoggedIn = "isLoggedIn";

    sessionStorage.removeItem(isLoggedIn);
    sessionStorage.removeItem("doctorDetails");
    sessionStorage.removeItem("IsHeadNurse");
    sessionStorage.clear()
    localStorage.clear();
    this.router.navigate(['/login'])
  }
  getLangData() {
    this.langData = JSON.parse(sessionStorage.getItem("langData") || '{}');
    return this.langData;
  }
  fetchUserFacility(UserId: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + '/FetchUserFacility?UserId='+ UserId +'&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchSSWards(Name:string,HospitalID:string) {
    return this.https.get<any>(this.devApiUrl + '/FetchSSWards?Name='+ Name +'&HospitalID='+ HospitalID +'', this.httpOptions);    
  }
  FetchBulkMedicationIssue(ProcessDate:any,WardID:any,UserID:string,HospitalID:string,WorkStationID:string)
  {
    return this.https.get<any>(this.devApiUrl + '/FetchBulkMedicationIssue?ProcessDate='+ ProcessDate +'&WardID=' + WardID + '&UserID=' + UserID +'&WorkStationID=' + WorkStationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  SavePharmacyBulkIssue(payload:any) {
    return this.https.post<any>(this.devApiUrl + 'SavePharmacyBulkIssue' , payload , this.httpOptions);
  }
  FetchViewBulkMedicationOrder(WardID:any,ProcessFromDate:any,ProcessToDate:any,SSN:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + '/FetchViewBulkMedicationOrder?WardID=' + WardID + '&ProcessFromDate='+ ProcessFromDate +'&ProcessToDate=' + ProcessToDate + '&SSN=' + SSN +'&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchSubstituteItemsIP(ItemID:any,UserID:any,WorkStationID:any,HospitalID:string) {
    return this.https.get<any>(this.devApiUrl + '/FetchSubstituteItemsIP?ItemID=' + ItemID + '&UserID='+ UserID +'&WorkStationID=' + WorkStationID +'&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchViewBulkMedicationOrderPrint(ProcessFromDate:any,ProcessToDate:any,WardID:any,SSN:any,UserName:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + '/FetchViewBulkMedicationOrderPrint?ProcessFromDate='+ ProcessFromDate +'&ProcessToDate=' + ProcessToDate +'&WardID=' + WardID + '&SSN=' + SSN +'&UserName=' + UserName +'&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  //https://localhost:44350//API/FetchViewBulkMedicationOrderPrintHHH?ProcessFromDate=14-Jan-2025&ProcessToDate=14-Jan-2025&WardID=2090&SSN=1024739615&SaleID=1337,1321&UserName=3038&HospitalID=2
  FetchViewBulkMedicationOrderPrintHHH(ProcessFromDate:any,ProcessToDate:any,WardID:any,SSN:any,SaleID: any, UserName:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + '/FetchViewBulkMedicationOrderPrintHHH?ProcessFromDate='+ ProcessFromDate +'&ProcessToDate=' + ProcessToDate +'&WardID=' + WardID + '&SaleID=' + SaleID + '&SSN=' + SSN +'&UserName=' + UserName +'&HospitalID='+ HospitalID +'', this.httpOptions);
  }

  FetchViewBulkMedicationOrderItemPrint(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'FetchViewBulkMedicationOrderItemPrint' , payload , this.httpOptions);
  }
  FetchRegistrationCard(PatientID: any,UserID:any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchRegistrationCard?PatientID=' + PatientID + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchRegistrationAdmissionCard(UHID: any,AdmissionID:any,UserID:any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchRegistrationAdmissionCard?UHID=' + UHID + '&AdmissionID=' + AdmissionID+ '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
}
