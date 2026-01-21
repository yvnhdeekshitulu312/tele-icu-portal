import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import * as moment from 'moment';
declare var $: any;

@Component({
  selector: 'app-others-reports',
  templateUrl: './others-reports.component.html',
  styleUrls: ['./others-reports.component.scss']
})
export class OthersReportsComponent implements OnInit {
  shortLink: any = "";
  patientDetails: any;
  langData: any;
  loading: boolean = false; 
  hospId:any;
  selectedView: any;
  medicalCertificateData: any;
  //DischargeSummaryDataNN: any;
  sickLeaveData:any;
  dischargeSummaryData:any;
  showMedCertificateTab: boolean = true;
  showSickLeaveTab: boolean = false;
  showDischargeSummary: boolean = false;
  medcertPdfDetails: any;
  sickleavePdfDetails: any;
  trustedUrl: any;
  HospitalID: any;
  PatientID: any;
  facilityId: any;
  doctorDetails: any;
  PageName:any;
  constructor(private router: Router, private config: ConfigService) {
    this.langData = this.config.getLangData();
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    const facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.facilityId = facility.FacilityID == undefined ? facility : facility.FacilityID
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
   }

   ngOnInit(): void {
    this.hospId = sessionStorage.getItem("hospitalId");
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
    this.PatientID = this.selectedView.PatientID;
    this.LoadMedicalCertificateData();
    this.LoadSickLeaveData();
    this.LoadDischargeSummaryData();  
  }
  
  showTab(tab: string) {
    if(tab == "MedicalCertificate") {
      this.showMedCertificateTab = true;
      this.showSickLeaveTab = false;
      this.showDischargeSummary = false;
    }
    else if(tab == "SickLeave") {
      this.showMedCertificateTab = false;
      this.showSickLeaveTab = true;
      this.showDischargeSummary = false;
    }
    else if(tab == "DischargeSummary") {
      this.showMedCertificateTab = false;
      this.showSickLeaveTab = false;
      this.showDischargeSummary = true;
    }
  }
  LoadMedicalCertificateData() {
    var startdate = moment(new Date().setMonth(new Date().getMonth() - 6)).format('YYYY-MM-DD');
    var enddate = moment(new Date()).format('YYYY-MM-DD');
    //this.config.fetchMedicalCertificateRequest(this.PatientID, startdate, enddate, this.hospId).subscribe((res: any) => {
      this.config.FetchPatientAdmissionMedicalReportWorkList(this.PatientID,this.selectedView.AdmissionID,1, startdate, enddate, this.hospId).subscribe((res: any) => {
      this.medicalCertificateData = res.FetchPatientAdmissionMedicalReportWorkListDataList
    })
  }
  LoadDischargeSummaryData() {
    var startdate = moment(new Date().setMonth(new Date().getMonth() - 6)).format('YYYY-MM-DD');
    var enddate = moment(new Date()).format('YYYY-MM-DD');
    //this.config.fetchMedicalCertificateRequest(this.PatientID, startdate, enddate, this.hospId).subscribe((res: any) => {
      this.config.FetchPatientAdmissionMedicalReportWorkList(this.PatientID,this.selectedView.AdmissionID,2, startdate, enddate, this.hospId).subscribe((res: any) => {
      this.dischargeSummaryData = res.FetchPatientAdmissionMedicalReportWorkListDataList
    })
  }
  LoadSickLeaveData() {
    var startdate = moment(new Date().setMonth(new Date().getMonth() - 6)).format('YYYY-MM-DD');
    var enddate = moment(new Date()).format('YYYY-MM-DD');
    this.config.fetchPatientSickLeaveWorkList(this.PatientID, startdate, enddate, this.hospId).subscribe((res: any) => {
      this.sickLeaveData = res.FetchPatientSickLeaveWorkListFDataList
    });
  }
  
  viewMedicalCertificateReport(medcert:any) {
    this.config.fetchMedicalCertificatePDF(medcert.PatientID, medcert.MedicalCertificationID, this.hospId).subscribe((res: any) => {
      this.medcertPdfDetails = res;
      this.trustedUrl = res?.FTPPATH;
      this.showMedCertModal();
    })
  }
  FetchPatientCaseRecord(medcert:any) {
    this.config.FetchPatientMedicalReportPrint(medcert.AdmissionID, 0, this.doctorDetails[0]?.UserId, this.hospId, this.facilityId)
        .subscribe((response: any) => {
            if (response.Code == 200) {
                this.trustedUrl = response?.FTPPATH;
                this.showMedCertModal();
            }
        },
            (err) => {
            })
  }
  FetchPatientCaseRecordMR(medcert:any) {
    this.config.FetchPatientMedicalReportPrintMR(medcert.MedicalReportID,medcert.AdmissionID, this.doctorDetails[0]?.UserName, this.hospId, this.facilityId)
        .subscribe((response: any) => {
            if (response.Code == 200) {
                this.trustedUrl = response?.FTPPATH;
                this.showMedCertModal();
            }
        },
            (err) => {
            })
  }
  FetchPatientDischargeSummaryPrint(medcert:any) {
    this.config.FetchPatientDischargeSummaryPrint(medcert.AdmissionID, 0, this.hospId, this.facilityId)
        .subscribe((response: any) => {
            if (response.Code == 200) {
                this.trustedUrl = response?.FTPPATH;
                this.showMedCertModal();
            }
        },
            (err) => {
            })
}
  showMedCertModal(): void {
    $("#MedCertViewModal").modal('show');
  }
  viewSickLeaveReport(sickleave:any) {
    this.config.fetchPatientSickLeavePDF(sickleave.AdmissionID, sickleave.SickLeaveID, this.hospId).subscribe((res: any) => {
      this.sickleavePdfDetails = res;
      this.trustedUrl = res?.FTPPATH;
      this.showSickLeaveModal();
    })
  }
  showSickLeaveModal(): void {
    $("#SickLeaveViewModal").modal('show');
  }
  
}
