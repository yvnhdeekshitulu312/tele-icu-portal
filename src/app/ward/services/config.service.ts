import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { locationData } from 'src/assets/config-constants';
import { BehaviorSubject, Observable, Subject, forkJoin } from 'rxjs';
import { config } from 'src/environments/environment';

@Injectable({
  providedIn: 'any'
})
export class ConfigService {
  public devApiUrl = `${config.apiurl}`;
  // devApiUrl = "https://localhost:44350/API/";
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
    this.patientInfo = JSON.parse(sessionStorage.getItem("patientInfo") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    this.langCode = sessionStorage.getItem('lang');
  }

  fetchUserFacility(UserId: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + '/FetchUserFacility?UserId=' + UserId + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchBedsFromWard(WardID: any, ConsultantID: any, Status: any, UserId: string, HospitalID: string, isSurgical?: boolean) {
    if (!isSurgical) {
      return this.https.get<any>(this.devApiUrl + '/FetchBedsFromWardNP?WardID=' + WardID + '&ConsultantID=' + ConsultantID + '&Status=' + Status + '&UserId=' + UserId + '&HospitalID=' + HospitalID + '', this.httpOptions);
    } else {
      return this.https.get<any>(this.devApiUrl + '/FetchBedsFromWardNPSur?WardID=' + WardID + '&ConsultantID=' + ConsultantID + '&Status=' + Status + '&UserId=' + UserId + '&HospitalID=' + HospitalID + '', this.httpOptions);
    }
  }
  fetchBedStatus(HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + '/FetchBedStatus?HospitalID=' + HospitalID + '', this.httpOptions);
  }

  getMultipleData(IPID: any, HospitalID: any) {
    const request1 = this.https.get<any>(this.devApiUrl + '/FetchLabTrendingGraph?LabType=1&IPID=' + IPID + '&HospitalID=' + HospitalID + '', this.httpOptions);
    const request2 = this.https.get<any>(this.devApiUrl + '/FetchLabTrendingGraph?LabType=2&IPID=' + IPID + '&HospitalID=' + HospitalID + '', this.httpOptions);
    const request3 = this.https.get<any>(this.devApiUrl + '/FetchLabTrendingGraph?LabType=3&IPID=' + IPID + '&HospitalID=' + HospitalID + '', this.httpOptions);
    const request4 = this.https.get<any>(this.devApiUrl + '/FetchLabTrendingGraph?LabType=4&IPID=' + IPID + '&HospitalID=' + HospitalID + '', this.httpOptions);
    const request5 = this.https.get<any>(this.devApiUrl + '/FetchLabTrendingGraph?LabType=5&IPID=' + IPID + '&HospitalID=' + HospitalID + '', this.httpOptions);
    const request6 = this.https.get<any>(this.devApiUrl + '/FetchLabTrendingGraph?LabType=6&IPID=' + IPID + '&HospitalID=' + HospitalID + '', this.httpOptions);
    const request7 = this.https.get<any>(this.devApiUrl + '/FetchLabTrendingGraph?LabType=7&IPID=' + IPID + '&HospitalID=' + HospitalID + '', this.httpOptions);

    return forkJoin([request1, request2, request3, request4, request5, request6, request7]);
  }
  fetchUserNotes(UserID: string, WorkStationID: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + '/FetchUserNotes?UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  fetchProgressNoteVitals(Admissionid: any, PatientID: any, GenderID: string, UserID: string, WorkstationID: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + '/FetchProgressNoteVitals?Admissionid=' + Admissionid + '&PatientID=' + PatientID + '&GenderID=' + GenderID + '&UserID=' + UserID + '&WorkstationID=' + WorkstationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  fetchProgressNoteDiagnosis(Admissionid: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchProgressNoteDiagnosis?Admissionid=' + Admissionid + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  saveProgressNotes(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SaveProgressNote', payload, this.httpOptions);
  }
  fetchSavedProgressNote(Admissionid: any, FromDate: any, ToDate: any, UserID: string, WorkStationID: string, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchMainProgressNote?Admissionid=' + Admissionid + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);

  }
  FetchMainProgressNoteHH(Admissionid: any, FromDate: any, ToDate: any, UserID: string, WorkStationID: string, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchMainProgressNoteHH?Admissionid=' + Admissionid + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);

  }
  FetchMainProgressNoteHHNew(Admissionid: any, FromDate: any, ToDate: any, UserID: string, WorkStationID: string, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchMainProgressNoteHHNew?Admissionid=' + Admissionid + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);

  }
  FetchMainProgressNoteHHNewPrint(Admissionid: any, FromDate: any, ToDate: any,UserName:String, UserID: string, WorkStationID: string, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchMainProgressNoteHHNewPrint?Admissionid=' + Admissionid + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&UserName=' + UserName +'&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);

  }
  DeleteProgressNote(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'DeleteProgressNote', payload, this.httpOptions);
  }

  fetchPainScoreLocation(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchPainScoreLocation?HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchPainScoreQuality(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchPainScoreQuality?HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchPainScoreInterventions(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchPainScoreInterventions?HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchNonVerbalScore(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchNonVerbalScore?HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchAdverseDrugEffects(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchAdverseDrugEffects?HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchPostIntervention(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchPostIntervention?HospitalID=' + HospitalID + '', this.httpOptions);
  }

  savePainAssessmentOrder(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePainAssessmentOrder', payload, this.httpOptions);
  }

  fetchSSNPatientVisits(SSN: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchSSNPatientVisits?SSN=' + SSN + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  savePatientPreProcedureAssessments(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientPreProcedureAssessments', payload, this.httpOptions);
  }

  patientPreProcedureAssessments(IPID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'PatientPreProcedureAssessments?IPID=' + IPID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  SaveClinicalIPVitalsRecoveryRoom(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SaveClinicalIPVitalsRecoveryRoom', payload, this.httpOptions);
  }

  fetchRouteofAdminEndo(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'fetchRouteofAdminEndo?HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchDoseUOM(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchDoseUOM?HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchEndoDrugs(Param: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchEndoDrugs?DrugName=' + Param + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchEndoDrugSelected(ItemID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'fetchEndoDrugSelected?ItemID=' + ItemID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchEndoDrugEffects(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchEndoDrugEffects?HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchEndoDrugPrePost(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchEndoDrugPrePost?HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchEndoscopyDoctor(Filter: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchEndoscopyDoctor?Filter=' + Filter + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchHandoverUser(Tbl: string, Filter: any, UserId: string, WorkStationID: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchHandoverUser?Tbl=' + Tbl + '&Filter=' + Filter + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchEndoscopyAnesthesiologist(Filter: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchEndoscopyAnesthesiologist?Filter=' + Filter + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchHospitalServiceEndscopyItems(DisplayName: any, UserID: string, WorkStationID: string, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchHospitalServiceEndscopyItems?DisplayName=' + DisplayName + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  fetchEndoscopyNurse(Filter: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchEndoscopyNurse?Filter=' + Filter + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  savePatientPreProcedureAssessmentsMain(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientPreProcedureAssessmentsMain', payload, this.httpOptions);
  }

  patientEndoTotalRequest(IPID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'PatientEndoTotalRequest?IPID=' + IPID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  patientPreProcedureAssessmentData(PatientPreprocAssID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'PatientPreProcedureAssessmentData?PatientPreprocAssID=' + PatientPreprocAssID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchFallRisk(Admissionid: any, FromDate: any, ToDate: any, intUserid: any, intWorkstationid: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchFallRisk?Admissionid=' + Admissionid + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&intUserid=' + intUserid + '&intWorkstationid=' + intWorkstationid + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchIndicationTransfusion(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchIndicationTransfusion?HospitalID=' + HospitalID + '', this.httpOptions);
  }
  fetchBloodGroups(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchBloodGroups?HospitalID=' + HospitalID + '', this.httpOptions);
  }
  fetchBloodComponents(DisplayName: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchBloodComponents?DisplayName=' + DisplayName + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  fetchEarlierDefects(DisplayName: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchEarlierDefects?DisplayName=' + DisplayName + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  fetchWitnessNurse(Filter: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchWitnessNurse?Filter=' + Filter + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  fetchWitnessDoctor(Filter: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchWitnessDoctor?Filter=' + Filter + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  fetchLatestBloodResult(PatientID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchLatestBloodResult?PatientID=' + PatientID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  savePatientBloodorderData(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientBloodorderData', payload, this.httpOptions);
  }
  fetchBloodRequest(PatientID: any, FromDate: any, ToDate: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchBloodRequest?PatientID=' + PatientID + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  fetchBloodRequestSelected(BloodorderID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchBloodRequestSelected?BloodorderID=' + BloodorderID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchSSurgeries(Admissionid: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchSSurgeries?Admissionid=' + Admissionid + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchMainProgressNote(Admissionid: any, FromDate: any, ToDate: any, intUserid: any, intWorkstationid: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchMainProgressNote?Admissionid=' + Admissionid + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&UserID=' + intUserid + '&WorkStationID=' + intWorkstationid + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchNursingInstructions(PatientID: any, Admissionid: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchNursingInstructions?PatientID=' + PatientID + '&Admissionid=' + Admissionid + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchCarePlan(Admissionid: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchCarePlan?Admissionid=' + Admissionid + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchEForms(Admissionid: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchEForms?Admissionid=' + Admissionid + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchEFormSelected(Admissionid: any, ScreenDesignId: any, PatientTemplateid: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchEFormSelected?Admissionid=' + Admissionid + '&ScreenDesignId=' + ScreenDesignId + '&PatientTemplateid=' + PatientTemplateid + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchInTakeOutPut(Admissionid: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchInTakeOutPut?Admissionid=' + Admissionid + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchBloodRequests(Admissionid: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchBloodRequest?Admissionid=' + Admissionid + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchDietChart(EpisodeID: any, Admissionid: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchDietChart?EpisodeID=' + EpisodeID + '&Admissionid=' + Admissionid + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  savePatientHandOverForm(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientHandOverForm', payload, this.httpOptions);
  }

  fetchPatientHandOverform(Admissionid: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'fetchPatientHandOverform?Admissionid=' + Admissionid + '&HandOverformID=0&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchPatientHandOverformPDF(HandOverformID: any, Admissionid: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'fetchPatientHandOverform?HandOverformID=' + HandOverformID + '&Admissionid=' + Admissionid + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  fetchPatientHandOverformPDFD(HandOverformID: any, Admissionid: any, strpath: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchPatientHandOverformPDF?HandOverformID=' + HandOverformID + '&AdmissionID=' + Admissionid + '&strpath=' + strpath + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchItemPacking(ItemID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchItemPacking?ItemID=' + ItemID + '&PackID=0&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  saveDrugPrescriptionAdministration(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SaveDrugPrescriptionAdministration', payload, this.httpOptions);
  }
  fetchReferredtoMe(DoctorID: any, FromDate: any, ToDate: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchReferredtoMe?DoctorID=' + DoctorID + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  fetchReferredbyMe(DoctorID: any, FromDate: any, ToDate: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchReferredByMe?DoctorID=' + DoctorID + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  fetchReferalDoctorsCount(DoctorID: any, FromDate: any, ToDate: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchReferalDoctorsCount?DoctorID=' + DoctorID + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  updateReferredtoMe(intReferralOrderID: number, AcceptRejectRemarks: any, intDoctorID: number, intSTATUS: number, intNewSTATUS: number, UserID: any, WorkStationID: any, HospitalID: any) {
    return this.https.post<any>(this.devApiUrl + 'UpdateReferredtoMe?intReferralOrderID=' + intReferralOrderID + '&AcceptRejectRemarks=' + AcceptRejectRemarks + '&intDoctorID=' + intDoctorID + '&intSTATUS=' + intSTATUS + '&intNewSTATUS=' + intNewSTATUS + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchNewWoundMaster(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchNewWoundMaster?HospitalID=' + HospitalID + '', this.httpOptions);
  }
  saveWoundForm(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientWoundAssessmentOrders', payload, this.httpOptions);
  }
  FetchSavedWoundData(AdmissionId: any, AssessmentOrderId: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchSavedWoundData?AdmissionId=' + AdmissionId + '&AssessmentOrderId=' + AssessmentOrderId + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  FetchNursingDashBoardDisplay(WardID: any, Date: any, AdmissionID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchNursingDashBoardDisplay?WardID=' + WardID + '&Date=' + Date + '&AdmissionID=' + AdmissionID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  FetchTaskServicemap(UserID: any, FacilityID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchTaskServicemap?UserID=' + UserID + '&FacilityID=' + FacilityID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  FetchVitalGroups(UserID: any, FacilityID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchVitalGroups?UserID=' + UserID + '&FacilityID=' + FacilityID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  FetchNursingFrequency(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchNursingFrequency?HospitalID=' + HospitalID + '', this.httpOptions);
  }

  FetchNursingFrequencySelected(FrequencyID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchNursingFrequencySelected?FrequencyID=' + FrequencyID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  SaveNursingService(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SaveNursingService', payload, this.httpOptions);
  }
  fetchWardTaskEntryforAllServices(AdmissionID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchWardTaskEntryforAllServices?AdmissionID=' + AdmissionID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchNursingInterventions(UserID: any, WorkStationID: any, HospitalID: any, IPID: any, WardID: any, EntryDate: any, FrequencyTime: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchNursingInterventions?UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '&IPID=' + IPID + '&WardID=' + WardID + '&EntryDate=' + EntryDate + '&FrequencyTime=' + FrequencyTime + '', this.httpOptions);
  }

  SavePatientNursingInterventions(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientNursingInterventions', payload, this.httpOptions);
  }
  SavePatientBathSideCareFrom(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientBathSideCareFrom', payload, this.httpOptions);
  }
  FetchCareMaster(HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchCareMaster?HospitalID=' + HospitalID + '', this.httpOptions);
  }

  FetchPatientBathSideCareFrom(Admissionid: any, FromDate: any, ToDate: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchPatientBathSideCareFrom?Admissionid=' + Admissionid + '&FromDate= ' + FromDate + '&ToDate=' + ToDate + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  fetchPatientBedSideCareFrom(Admissionid: any, FromDate: any, ToDate: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchPatientBedSideCareFrom?Admissionid=' + Admissionid + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  FetchHospitalNurse(APIName: any, EmpNo: any, UserId: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + APIName + '?min=1&max=15&empno=' + EmpNo + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  //FetchSSEmployees: "FetchSSEmployees?name=${name}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
  FetchSSEmployees(APIName: any, EmpNo: any, UserId: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + APIName + '?name=' + EmpNo + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  SavePatientBedSideCareFrom(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientBedSideCareFrom', payload, this.httpOptions);
  }


  FetchFallRiskFactor(UserId: string, WorkStationID: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchFallRiskFactor?UserID=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchFallRiskFactorPedia(UserId: string, WorkStationID: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchFallRiskFactorPedia?UserID=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchFallRiskFactorParameter(UserId: string, WorkStationID: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchFallRiskFactorParameter?UserID=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchNursingInterventions(UserId: string, WorkStationID: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchNursingInterventions?UserID=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchNursingInterventionsPedia(UserId: string, WorkStationID: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchNursingInterventionsPedia?UserID=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  FetchDVTMasterRiskFactor1(UserId: any, WorkStationID: any, HospitalID: any) {
    const request1 = this.https.get<any>(this.devApiUrl + 'FetchDVTMasterRiskFactor1?UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
    const request2 = this.https.get<any>(this.devApiUrl + 'FetchDVTMasterRiskFactor2?UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
    const request3 = this.https.get<any>(this.devApiUrl + 'FetchDVTMasterRiskFactor3?UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
    const request4 = this.https.get<any>(this.devApiUrl + 'FetchDVTMasterRiskFactor4?UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
    const request5 = this.https.get<any>(this.devApiUrl + 'FetchDVTMasterRiskLevel?UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
    const request6 = this.https.get<any>(this.devApiUrl + 'FetchDVTActionPlan?UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);

    return forkJoin([request1, request2, request3, request4, request5, request6]);
  }

  SavePatientDVTFrom(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientDVTFrom', payload, this.httpOptions);
  }

  FetchDVTRiskAssessmentFactors(Admissionid: any, UserId: string, WorkStationID: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchDVTRiskAssessmentFactors?Admissionid=' + Admissionid + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  SavePatientFallRisk(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientFallRisk', payload, this.httpOptions);
  }
  SavePatientFallRiskPedia(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientFallRiskPedia', payload, this.httpOptions);
  }

  FetchBradenScaleMaster(UserId: string, WorkStationID: string, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchBradenScaleMaster?UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  SavePatientBradenScale(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SavePatientBradenScale', payload, this.httpOptions);
  }

  FetchHospitalNurses(Name: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchPatientEMRBedsAssignedToNurse?Name=' + Name + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchPatientEMRBedsAssignedToNurse(NurseID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchPatientEMRBedsAssignedToNurse?NurseID=' + NurseID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchPatientNursingInstructions(PatientId: any, IPID: any, UserID: any, WorkStationID: any, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchPatientNursingInstructions?PatientId=' + PatientId + '&IPID=' + IPID + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  SaveNursingInstructionsAck(payload: any) {
    return this.https.post<any>(this.devApiUrl + `SaveNursingInstructionsAck`, payload, this.httpOptions);
  }

  FetchwardtasksCountwithColor(WardID: any, AdmissionID: any, CDate: any, UserID: any, WorkStationID: any, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchwardtasksCountwithColor?WardID=' + WardID + '&AdmissionID=' + AdmissionID + '&CDate=' + CDate + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchPainscoreHistory(AdmissionId: string, FromDate: any, ToDate: any, UserID: string, WorkstationID: string, hospitalId: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchPainscoreHistory?AdmissionId=' + AdmissionId + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&UserID=' + UserID + '&WorkstationID=' + WorkstationID + '&HospitalID=' + hospitalId + '', this.httpOptions);
  }
  FetchLOAApprovalRequestDetails(PatientID: any, FromDate: any, ToDate: any, WorkStationID: any, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchLOAApprovalRequestDetails?PatientID=' + PatientID + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

  FetchFallRiskView(IPID: any, FromDate: any, ToDate: any, UserID: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchFallRiskView?IPID=' + IPID + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchVaccantBedsFromWard(WardID: any, Type: any, UserId: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchVaccantBedsFromWard?WardID=' + WardID + '&Type=' + Type + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchBedTransferWardRequests(WardID: any, FromDate: any, ToDate: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchBedTransferWardRequests?WardID=' + WardID + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  UpdatewardtaskintervalRemarks(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'UpdatewardtaskintervalRemarks', payload, this.httpOptions);
  }
  FetchWardWiseDailyCharges(WardID: number, WorkStationID: number, HospitalID: number) {
    return this.https.get<any>(this.devApiUrl + 'FetchWardWiseDailyCharges?WardID=' + WardID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID, this.httpOptions);
  }
  SaveWardProcedureOrder(payload: any) {
    return this.https.post<any>(this.devApiUrl + `SaveWardProcedureOrder`, payload, this.httpOptions);
  }
  FetchEMRBeds(WardID: any, BedType: any, UserId: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchEMRBeds?WardID=' + WardID + '&BedType=' + BedType + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  SaveNursetoBeds(payload: any) {
    return this.https.post<any>(this.devApiUrl + 'SaveNursetoBeds', payload, this.httpOptions);
  }
  FetchClinicalProceduresView(SSN: any, FromDate: any, ToDate: any, WardID: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchClinicalProceduresView?SSN=' + SSN + '&FromDate=' + FromDate + '&ToDate=' + ToDate + '&WardID=' + WardID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchPatientPharmacyItemBarCodeString(PatientID: any, Admissionid: any, BarCodeNo: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchPatientPharmacyItemBarCodeString?PatientID=' + PatientID + '&Admissionid=' + Admissionid + '&BarCodeNo=' + BarCodeNo + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchFinalSaveVTERiskAssessment(AdmissionID: any, UserId: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchFinalSaveVTERiskAssessment?AdmissionID=' + AdmissionID + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchPatientFinalObgVTEFrom(PatientObgVTEID: any, AdmissionID: any, UserId: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchPatientFinalObgVTEFrom?PatientObgVTEID=' + PatientObgVTEID + '&AdmissionID=' + AdmissionID + '&UserId=' + UserId + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchPatienAdmissionAgainstDischargeAfterFollowUp(AdmissionID: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchPatienAdmissionAgainstDischargeAfterFollowUp?AdmissionID=' + AdmissionID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  SaveBedsboardPatientAnnotations(payload: any) {
    return this.https.post<any>(this.devApiUrl + `SaveBedsboardPatientAnnotations`, payload, this.httpOptions);
  }
  FetchDoctorReferralOrders(AdmissionID: any, WorkStationID: any, HospitalID: string) {
    return this.https.get<any>(this.devApiUrl + 'FetchDoctorReferralOrders?AdmissionID=' + AdmissionID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  UpdateDoctorReferralOrdersVisit(payload: any) {
    return this.https.post<any>(this.devApiUrl + `UpdateDoctorReferralOrdersVisit`, payload, this.httpOptions);
  }
  SavePatientAdmissionVirtualDischarges(payload: any) {
    return this.https.post<any>(this.devApiUrl + `SavePatientAdmissionVirtualDischargesM`, payload, this.httpOptions);
  }

  UpdatePatientwardtaskinterval(payload: any) {
    return this.https.post<any>(this.devApiUrl + `UpdatePatientwardtaskinterval`, payload, this.httpOptions);
  }  
  FetchClinicCounters(DocID: any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchClinicCounters?DocID=' + DocID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  FetchRegistrationCard(PatientID: any,UserID:any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchRegistrationCard?PatientID=' + PatientID + '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }
  raiseStayExtensionRequest(payload: any) {
    return this.https.post<any>(`${config.rcmapiurl}` + `raiseStayExtension`, payload, this.httpOptions);
  }   
   FetchPatientAdultBandPrintEMR(payload: any) {
    return this.https.post<any>(this.devApiUrl + `FetchPatientAdultBandPrintEMR`, payload, this.httpOptions);
  } 
  FetchPatientVitalsByPatientId_PFUHIDN(UHID: any, IPID: any, FromDate: any, ToDate: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + '/FetchPatientVitalsByPatientId_PFUHIDNN?UHID=' + UHID + '&IPID=' + IPID + '&FromDate='+ FromDate +'&ToDate='+ ToDate +'&HospitalID='+ HospitalID  +'', this.httpOptions);
  }
  FetchRegistrationAdmissionCard(UHID: any,AdmissionID:any,UserID:any, WorkStationID: any, HospitalID: any) {
    return this.https.get<any>(this.devApiUrl + 'FetchRegistrationAdmissionCard?UHID=' + UHID + '&AdmissionID=' + AdmissionID+ '&UserID=' + UserID + '&WorkStationID=' + WorkStationID + '&HospitalID=' + HospitalID + '', this.httpOptions);
  }

}
