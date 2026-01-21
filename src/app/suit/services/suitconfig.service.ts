import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { locationData } from 'src/assets/config-constants';
import { BehaviorSubject, Observable, Subject, forkJoin } from 'rxjs';
import { config } from 'src/environments/environment';

@Injectable({
  providedIn: 'any'
})
export class SuitConfigService {
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
  HospitalID: any;
  doctorDetails: any;

  constructor(private https: HttpClient, private router: Router) {
    this.patientInfo = JSON.parse(sessionStorage.getItem("patientInfo") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    this.langCode = sessionStorage.getItem('lang');
   // this.HospitalID = sessionStorage.getItem("hospitalId");
    //this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  }

  SaveHospitalFeatureFavourites(payload:any){
    return this.https.post<any>(this.devApiUrl + 'SaveHospitalFeatureFavourites' , payload , this.httpOptions);
  }
  FetchHospitalUserRoleDetails(UserId: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchHospitalUserRoleDetails?UserID='+ UserId +'&FacilityID=0&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchHospitalUserRoleFacilityDetails(UserId: string, FacilityID: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchHospitalUserRoleDetails?UserID='+ UserId +'&FacilityID=' + FacilityID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchUserFavouriteOld(UserId: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchUserFavourite?UserID='+ UserId +'&FacilityID=0&HospitalID='+ HospitalID +'', this.httpOptions);
  }

   FetchUserFavourite(UserId: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchUserFavourite?FacilityID=0&HospitalID='+ HospitalID +'', this.httpOptions);
  }

  FetchLabPhlebtomyCount(Payload: any) {
    return this.https.post<any>(this.devApiUrl + 'FetchLabPhlebtomyCount', Payload , this.httpOptions);
  }
  FetchLabPhlebtomyCountH(Payload: any) {
    return this.https.post<any>(this.devApiUrl + 'FetchLabPhlebtomyCountH', Payload , this.httpOptions);
  }

  FetchLabPhlebtomyDataDisplay(Payload: any) {
    return this.https.post<any>(this.devApiUrl + 'FetchLabPhlebtomyDataDisplay', Payload , this.httpOptions);
  }
   FetchLabPhlebtomyDataDisplayPHB(Payload: any) {
    return this.https.post<any>(this.devApiUrl + 'FetchLabPhlebtomyDataDisplayPHB', Payload , this.httpOptions);
  }

  ChangeTestOrderStatus(payload:any){
    return this.https.post<any>(this.devApiUrl + 'ChangeTestOrderStatus' , payload , this.httpOptions);
  }

  SaveSampleCollectionBarCodePrint(payload:any) {
    return this.https.post<any>(this.devApiUrl + 'SaveSampleCollectionBarCodePrint' , payload , this.httpOptions);
  }

  UpdatePorterReceiveDetails(payload:any){
    return this.https.post<any>(this.devApiUrl + 'UpdatePorterReceiveDetails' , payload , this.httpOptions);
  }

  UpdateSampleReceiveDetails(payload:any){
    return this.https.post<any>(this.devApiUrl + 'UpdateSampleReceiveDetails' , payload , this.httpOptions);
  }

  FetchBarCodePrint(SampleNo: any, strPatientIds: any, IsLastWeek: any, isTransfer: any, WorkstationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchBarCodePrint?SampleNo='+ SampleNo +'&strPatientIds='+ strPatientIds+'&IsLastWeek='+IsLastWeek+'&isTransfer='+isTransfer+'&WorkstationID=' + WorkstationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
   FetchBarCodePrintPanacea(SampleNo: any, TestOrderID: any, TestOrderItemID: any, UserID: any, WorkstationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchBarCodePrintPanacea?SampleNo='+ SampleNo +'&TestOrderID='+ TestOrderID+'&TestOrderItemID='+TestOrderItemID+'&UserID='+UserID+'&WorkstationID=' + WorkstationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }

  FetchLabPhlebtomyDataBarCodeDisplay(Payload: any) {
    return this.https.post<any>(this.devApiUrl + 'FetchLabPhlebtomyDataBarCodeDisplay', Payload , this.httpOptions);
  }

  fetchLabWorklistDataDisplay(Payload: any) {
    return this.https.post<any>(this.devApiUrl + 'fetchLabWorklistDataDisplay', Payload , this.httpOptions);
  }
  fetchLabOrderDetails(TestOrderID:any, UserID: string, FacilityID:string, HospitalID:string) {
    return this.https.get<any>(this.devApiUrl + 'FetchLabOrderDetails?TestOrderID='+ TestOrderID +'&UserID='+ UserID +'&FacilityID='+ FacilityID +'&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  ChangeLabTestOrderStatus(payload:any){
    return this.https.post<any>(this.devApiUrl + 'ChangeLabTestOrderStatus' , payload , this.httpOptions);
  }
  fetchLabOrderVisitSummary(TestID:any, TestOrderID:any, TestOrderItemID:any, UserID: string, FacilityID:string, HospitalID:string) {
    return this.https.get<any>(this.devApiUrl + 'FetchLabOrderVisitSummary?TestID=' + TestID + '&TestOrderID='+ TestOrderID +'&TestOrderItemID=' + TestOrderItemID + '&UserID='+ UserID +'&FacilityID='+ FacilityID +'&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  fetchLabOrderSummary(TestID:any, TestOrderID:any, TestOrderItemID:any, UserID: string, FacilityID:string, HospitalID:string) {
    return this.https.get<any>(this.devApiUrl + 'FetchLabOrderSummary?TestID=' + TestID + '&TestOrderID='+ TestOrderID +'&TestOrderItemID=' + TestOrderItemID + '&UserID='+ UserID +'&FacilityID='+ FacilityID +'&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  fetchRadWorklistDataDisplay(Payload: any) {
    return this.https.post<any>(this.devApiUrl + 'FetchRadWorklistDataDisplay', Payload , this.httpOptions);    
  }
   fetchRadWorklistDataDisplayToken(Payload: any) {
    return this.https.post<any>(this.devApiUrl + 'FetchRadWorklistDataDisplayToken', Payload , this.httpOptions);    
  }
  
  
  FetchnxgTestRequisitionsWithFlowPhysio(payload: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchnxgTestRequisitionsWithFlowPhysio?SSN=' + payload.SSN + '&MobileNo=' + payload.MobileNo +'&RoomNo=' + payload.RoomNo + '&FromDate='+ payload.FromDate +'&ToDate=' + payload.ToDate + '&PatientType=' + payload.PatientType + '&PerfUserID='+ payload.PerfUserID +'&PatientArrivedDateBased='+ payload.PatientArrivedDateBased + '&UserID='+ payload.UserID +'&WorkStationID='+ payload.WorkStationID +'&HospitalID='+ payload.HospitalID +'', this.httpOptions);
  }
  fetchRoleFacilities(UserID: string, HospitalID:string) {
    return this.https.get<any>(this.devApiUrl + 'FetchRoleFacilities?UserID='+ UserID +'&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  changePatientArrivedStatus(payload:any) {
    return this.https.post<any>(this.devApiUrl + 'ChangePatientArrivedStatus', payload , this.httpOptions);    
  }
  fetchRadiologyTechnician(UserId:any, WorkStationID:any, HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchRadiologyTechnician?UserID='+ UserId +'&WorkStationID=' + WorkStationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  fetchRadiologyPerfDoctor(UserId:any, WorkStationID:any, HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchRadiologyPerfDoctor?UserID='+ UserId +'&WorkStationID=' + WorkStationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchTestPerformingDoctors(TestOrderItemId:any, HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchTestPerformingDoctors?TestOrderItemId='+ TestOrderItemId +'&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  changeEndDateTimeStatus(payload:any) {
    return this.https.post<any>(this.devApiUrl + 'ChangeEndDateTimeStatus', payload , this.httpOptions);
  }
  changeEndDateTimeFinalSaveStatus(payload:any) {
    return this.https.post<any>(this.devApiUrl + 'ChangeEndDateTimeFinalSaveStatus', payload , this.httpOptions);
  }
  SaveTestPerformingDoctors(payload:any) {
    return this.https.post<any>(this.devApiUrl + 'SaveTestPerformingDoctors', payload , this.httpOptions);
  }
  FetchRegistrationCard(PatientID: any,UserID:any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchRegistrationCard?PatientID=' + PatientID + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  UpdatePhysiotherapyOrderRefuse(payload:any) {
    return this.https.post<any>(this.devApiUrl + 'UpdatePhysiotherapyOrderRefuse', payload , this.httpOptions);
  }

  FetchVaccantBedsFromWard(WardID:any, Type:any, UserId: any, WorkStationID:any, HospitalID:any) {
    if(WardID === '3393') {
      return this.https.get<any>(this.devApiUrl + 'FetchVaccantBedsEMRFromWard?WardID='+ WardID +'&Type=' + Type + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
    }
    else {
      return this.https.get<any>(this.devApiUrl + 'FetchVaccantBedsFromWard?WardID='+ WardID +'&Type=' + Type + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
    }
  }

  SavePushBedStatus(payload:any){
    return this.https.post<any>(this.devApiUrl + 'SavePushBedStatus' , payload , this.httpOptions);
  }
  FetchAdviceDiagnosis(TBL:any,Admissionid:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchAdviceDiagnosis?TBL='+ TBL +'&Admissionid=' + Admissionid + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchRadiologyDoctors(TestOrderItemId:any,UserID:any,WorkStationID:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchRadiologyDoctors?TestOrderItemId='+ TestOrderItemId + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchHospitalResultTemplates(TestID:any,TestTemplateID:any,UserId:any,WorkStationID:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchHospitalResultTemplates?TestID=' + TestID + '&TestTemplateID='+ TestTemplateID + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchHospitalTestResultTemplates(TestID:any,TestTemplateID:any,UserId:any,WorkStationID:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchHospitalTestResultTemplates?TestID=' + TestID + '&TestTemplateID='+ TestTemplateID + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  SaveRadiologyTestResults(payload:any){
    return this.https.post<any>(this.devApiUrl + 'SaveRadiologyTestResults' , payload , this.httpOptions);
  }
  DeleteRadiologyResults(TestOrderID:any,TestOrderItemID:any,Sequence:any,UserID:any,WorkStationID:any,HospitalID:any) {
    return this.https.post<any>(this.devApiUrl + 'DeleteRadiologyResults?TestOrderID=' + TestOrderID + '&TestOrderItemID='+ TestOrderItemID + '&Sequence=' + Sequence + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchSaveRadiologyResults(TestOrderID:any,TestOrderItemId:any,TestID:any,PatientID:any,AdmissionID:any,PatientType:any,UserID:any,WorkStationID:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchSaveRadiologyResults', {
      params: {
        TestOrderID, TestOrderItemId, TestID, PatientID, AdmissionID, PatientType, UserID, WorkStationID, HospitalID
      }
    })
  }
  VerifyRadiologyResults(TestOrderID:any,TestOrderItemID:any,TestID:any,Sequence:any,Remarks:any,verify:boolean,UserID:any,WorkStationID:any,HospitalID:any,) {
    return this.https.post<any>(this.devApiUrl + 'VerifyRadiologyResults', null, {
      params: {
        TestOrderID, TestOrderItemID, TestID, Sequence, Remarks, verify, UserID, WorkStationID, HospitalID
      }
    })
  }
  FetchSaveAddEndNumRadiologyResults(TestOrderID:any,TestOrderItemId:any,TestResultAddendumID:any,UserID:any,WorkStationID:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchSaveAddEndNumRadiologyResults', {
      params: {
        TestOrderID, TestOrderItemId, TestResultAddendumID, UserID, WorkStationID, HospitalID
      }
    })
  }
  SaveRadiologyAddendumTestResults(payload:any){
    return this.https.post<any>(this.devApiUrl + 'SaveRadiologyAddendNumTestResults' , payload , this.httpOptions);
  }
  FetchDoctorName(Filter:any, HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchDoctorName?Filter=' + Filter + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  SaveRadiologyPanicReportingForm(payload:any){
    return this.https.post<any>(this.devApiUrl + 'SaveRadiologyPanicReportingForm' , payload , this.httpOptions);
  }
  FetchSavePanicRadiologyForm(TestOrderItemId:any, HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchSavePanicRadiologyForm?TestOrderItemId=' + TestOrderItemId + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  fetchRadiologyStatus(HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + '/FetchRadiologyLegends?HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchSpecializationDepartments(WorkStationID:string,HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + '/FetchSpecializationDepartmentsNN?WorkStationID=' + WorkStationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  UpdateTestResultReview(TestOrderID:any,TestOrderItemID:any,TestID:any,IsResultReview:any,UserID:any,WorkStationID:any,HospitalID:any,) {
    return this.https.post<any>(this.devApiUrl + 'UpdateTestResultReview', null, {
      params: {
        TestOrderID, TestOrderItemID, TestID, IsResultReview, UserID, WorkStationID, HospitalID
      }
    })
  }
  fetchRadReportGroupPDF(RegCode: any, TestOrderItemId: any, TestOrderId: any,UserID: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchRadReportGroupPDF?RegCode='+ RegCode +'&TestOrderItemId='+ TestOrderItemId +'&TestOrderId='+ TestOrderId +'&UserID='+ UserID+'&HospitalID='+ HospitalID +'' , this.httpOptions);
  }
  FetchHospitalUserModuleDetails(UserId: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchHospitalUserModuleDetails?UserID='+ UserId +'&FacilityID=0&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchBabyInfo(SSN:any, UserID: any, WorkStationID:any, HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchBabyInfo?SSN=' + SSN + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID  + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchBabyInfoEndo(IPID:any, UserID: any, WorkStationID:any, HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchBabyInfoEndo?IPID=' + IPID + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID  + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  Fetchtreatmentsheetorderdetails(OrderID:any,UserID:any,WorkStationID:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'Fetchtreatmentsheetorderdetails?OrderID=' + OrderID + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchTreatmentSheet(OrderID:any,PatientID: any,AdmissionID: any, UserID:any,WorkStationID:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchTreatmentSheet?OrderID=' + OrderID + '&PatientID=' + PatientID + '&AdmissionID=' + AdmissionID +'&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  SaveTestOrderItemTreatmentSheet(payload:any){
    return this.https.post<any>(this.devApiUrl + 'SaveTestOrderItemTreatmentSheet' , payload , this.httpOptions);
  }

  FetchPhysiotherapyAssessmentSections(WorkStationID:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchPhysiotherapyAssessmentSections?WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID, this.httpOptions);
  }

  SavePatientPhysiotherapyAssessmentOrders(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientPhysiotherapyAssessmentOrders' , payload , this.httpOptions);
  }

  FetchPatientPhysiotherapyAssessmentOrders(TestOrderItemID: any, WorkStationID:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchPatientPhysiotherapyAssessmentOrders?TestOrderItemID=' + TestOrderItemID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID, this.httpOptions);
  }
  FetchPatientPhysiotherapyAssessmentOrdersPrint(TestOrderItemID: any,UserName: any, WorkStationID:any,HospitalID:any) {
    return this.https.get<any>(this.devApiUrl + 'FetchPatientPhysiotherapyAssessmentOrdersPrint?TestOrderItemID=' + TestOrderItemID+ '&UserName=' + UserName + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID, this.httpOptions);
  }
  FetchInpatientCounter(BedID: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchInpatientCounter?BedID=' + BedID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchLabOrderDetailsNN(PatientID: any, TestOrderID:any, UserID: string, FacilityID:string, HospitalID:string) {
    return this.https.get<any>(this.devApiUrl + 'FetchLabOrderDetailsNN?PatientID=' + PatientID + '&TestOrderID='+ TestOrderID +'&UserID='+ UserID +'&FacilityID='+ FacilityID +'&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  FetchBarCodePrintSingle(TestOrderItems: any, SampleNo: any, strPatientIds: any, IsLastWeek: any, isTransfer: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchBarCodePrintSingle?TestOrderItems=' + TestOrderItems + '&SampleNo='+ SampleNo +'&strPatientIds='+ strPatientIds+'&IsLastWeek='+IsLastWeek+'&isTransfer='+isTransfer+'&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  fetchWitnessNurse(Filter:string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchWitnessNurse?Filter='+ Filter +'&HospitalID='+ HospitalID +'', this.httpOptions);
  }
  printPhysiotherapySchedule(ScheduleID: any, UserID: any,WorkStationID: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchPhysiotheraphyAPpPrint?ScheduleID='+ ScheduleID +'&UserID='+ UserID +'&WorkStationID='+ WorkStationID +'&HospitalID='+ HospitalID+'' , this.httpOptions);
  }
   FetchBarCodePrintAll(SampleNo: any, strPatientIds: any, IsLastWeek: any, isTransfer: any, WorkstationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchBarCodePrintAll?SampleNo='+ SampleNo +'&strPatientIds='+ strPatientIds+'&IsLastWeek='+IsLastWeek+'&isTransfer='+isTransfer+'&WorkstationID=' + WorkstationID + '&HospitalID='+ HospitalID +'', this.httpOptions);
  }

   FetchReferalSocialWorkerDoctorOrders(SpecialiseID: any, DoctorID: any,  HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchReferalSocialWorkerDoctorOrdersCount?SpecialiseID='+ SpecialiseID +'&DoctorID='+ DoctorID+'&HospitalID='+ HospitalID +'', this.httpOptions);
  }


}
