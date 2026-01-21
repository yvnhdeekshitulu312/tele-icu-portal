import { Component, Input, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'app-patient-quick-walkthrough-info',
  templateUrl: './patient-quick-walkthrough-info.component.html',
  styleUrls: ['./patient-quick-walkthrough-info.component.scss']
})
export class PatientQuickWalkthroughInfoComponent extends BaseComponent implements OnInit {
  @Input() patientInfo: any;

  VTScoreDataList: any = [];
  BillDataList: any = [];
  VitalDataList: any = [];
  WardBedDataList: any = [];
  AdmissionDataList: any = [];
  BillDetailsList: any = [];
  ClinicalConditionDataList: any = [];
  ChiefComplaintsDataList: any = [];
  ChiefComplaintsDataList1: any = [];
  IntialAssessmentDataList: any = [];
  DiagnosisDataList: any = [];
  DiagnosisDataListFiltered: any = [];
  MedicationDataList: any = [];
  MedicationDataListFiltered: any = [];
  ServicesDataList: any = [];
  ServicesDataListFiltered: any = [];
  ServicesDataListInv: any = [];
  ServicesDataListInvFiltered: any = [];
  ServicesDataListProc: any = [];
  ServicesDataListProcFiltered: any = []
  AdviceDataList: any = [];
  PrimaryDoctorDataList: any = [];
  PrimaryEndorseDoctorDataListP: any = [];
  PrimaryReferalDataList: any = [];
  EmrEpisodeDataList: any = [];
  patientMeidcation: any = [];
  selectedPatientAllergies: any = [];
  objPatientVitalsList: any = [];
  bpSystolic: string = "";
  bpDiastolic: string = "";
  temperature: string = "";
  pulse: string = "";
  spo2: string = "";
  respiration: string = "";
  consciousness: string = "";
  o2FlowRate: string = "";
  selectedPatientClinicalInfo: any = [];
  selectedPatientInfo: any = [];
  pinfo: any;
  modalClass: string = "walkthrough_info";
  showMediactionList = false;
  showOrdersList = false;
  showReferralonTop = false;
  patientDemographicData: any = [];

  constructor(private appconfig: ConfigService) {
    super();
  }

  ngOnInit(): void {
    this.pinfo = this.patientInfo;
    if (this.pinfo.AdmissionID) {
      this.fetchPatientFileInfo();
    }
  }

  fetchPatientFileInfo() {
    this.appconfig.FetchERWorkFlow(this.pinfo.PatientID, this.pinfo.AdmissionID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.VTScoreDataList.length > 0) {
            this.VTScoreDataList = response.VTScoreDataList;
          }
          if (response.BillDataList.length > 0) {
            this.BillDataList = response.BillDataList[0];
          }
          if (response.VitalDataList.length > 0) {
            this.VitalDataList = response.VitalDataList[0];
          }
          if (response.WardBedDataList.length > 0) {
            this.WardBedDataList = response.WardBedDataList[0];
          }
          if (response.AdmissionDataList.length > 0) {
            this.AdmissionDataList = response.AdmissionDataList[0];
          }
          if (response.BillDetailsList.length > 0) {
            this.BillDetailsList = response.BillDetailsList[0];
          }
          if (response.ClinicalConditionDataList.length > 0) {
            this.ClinicalConditionDataList = response.ClinicalConditionDataList[0];
          }
          if (response.ChiefComplaintsDataList.length > 0) {
            this.ChiefComplaintsDataList = this.ChiefComplaintsDataList1 = response.ChiefComplaintsDataList;
            // const distinctThings = response.ChiefComplaintsDataList.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.DoctorID === thing.DoctorID) === i);
            // this.ChiefComplaintsDataList = distinctThings;
          }
          if (response.IntialAssessmentDataList.length > 0) {
            this.IntialAssessmentDataList = response.IntialAssessmentDataList[0];
          }
          if (response.DiagnosisDataList.length > 0) {
            this.DiagnosisDataList = response.DiagnosisDataList.sort((a: any, b: any) => new Date(a.CreateDate).getTime() - new Date(b.CreateDate).getTime());
            const distinctDiag = this.DiagnosisDataList.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.DoctorId === thing.DoctorId) === i);
            this.DiagnosisDataListFiltered = distinctDiag.sort((a: any, b: any) => new Date(a.CreateDate).getTime() - new Date(b.CreateDate).getTime());         
          }
          if (response.MedicationDataList.length > 0) {
            this.MedicationDataList = response.MedicationDataList;
            const distinctThings = response.MedicationDataList.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.DoctorId === thing.DoctorId) === i);
            this.MedicationDataListFiltered = distinctThings;
          }
          if (response.ServicesDataList.length > 0) {
            this.ServicesDataList = response.ServicesDataList;
            
            this.ServicesDataListInv = this.ServicesDataList.filter((x:any) => x.ServiceID == 3);
            const distinctThings = this.ServicesDataListInv.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.DoctorId === thing.DoctorId) === i);
            this.ServicesDataListInvFiltered = distinctThings;

            this.ServicesDataListProc = this.ServicesDataList.filter((x:any) => x.ServiceID == 5);
            const distinctThingsProc = this.ServicesDataListProc.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.DoctorId === thing.DoctorId) === i);
            this.ServicesDataListProcFiltered = distinctThingsProc;
          }
          if (response.AdviceDataList.length > 0) {
            this.AdviceDataList = response.AdviceDataList[0];
          }
          if (response.PrimaryDoctorDataList.length > 0) { // Endorse / Transfer Request Acceptancce
            this.PrimaryDoctorDataList = response.PrimaryDoctorDataList;
          }
          if (response.PrimaryEndorseDoctorDataList.length > 0) { // Endorse / Transfer Request
            this.PrimaryEndorseDoctorDataListP = response.PrimaryEndorseDoctorDataList;
          }
          if (response.PrimaryReferalDataList.length > 0) { // Referal
            this.PrimaryReferalDataList = response.PrimaryReferalDataList;
            if(new Date(this.PrimaryEndorseDoctorDataListP[0]?.AcceptDate) > new Date(this.PrimaryReferalDataList[0]?.ReferalDate))
            {
              this.showReferralonTop = true;
            }
          }
          if (response.EmrEpisodeDataList.length > 0) { // EndofEpisode
            this.EmrEpisodeDataList = response.EmrEpisodeDataList[0];
          }
          if(response.PrimaryEndorsePatientDataList.length > 0) {
            this.patientDemographicData = response.PrimaryEndorsePatientDataList[0];
          }
        }
      })
  }

  checkIsObjectEmpty(obj: string) {
    if(obj =='BillDataList') {
      return Object.keys(this.BillDataList).length > 0;
    }
    else if(obj =='VitalDataList') {
      return Object.keys(this.VitalDataList).length > 0;
    }
    else if(obj =='WardBedDataList') {
      return Object.keys(this.WardBedDataList).length > 0;
    }
    else if(obj =='AdmissionDataList') {
      return Object.keys(this.AdmissionDataList).length > 0;
    }
    else if(obj =='BillDetailsList') {
      return Object.keys(this.BillDetailsList).length > 0;
    }
    else if(obj =='ClinicalConditionDataList') {
      return Object.keys(this.ClinicalConditionDataList).length > 0;
    }
    else if(obj =='ChiefComplaintsDataList') {
      return Object.keys(this.ChiefComplaintsDataList).length > 0;
    }
    else if(obj =='IntialAssessmentDataList') {
      return Object.keys(this.IntialAssessmentDataList).length > 0;
    }
    else if(obj =='AdviceDataList') {
      return Object.keys(this.AdviceDataList).length > 0;
    }
    else if(obj =='PrimaryDoctorDataList') {
      return Object.keys(this.PrimaryDoctorDataList).length > 0;
    }
    else if(obj =='EmrEpisodeDataList') {
      return Object.keys(this.EmrEpisodeDataList).length > 0;
    }

    return true;

  }
  
  filterOrders(presc: any, serviceid: any, docid: any) {
    if(docid != '0')
      return presc.filter((x: any) => x.ServiceID == serviceid && x.DoctorId == docid);
    else
      return presc.filter((x: any) => x.ServiceID == serviceid);
  }

  filterOrdersInv(docid: any) {
    return this.ServicesDataListInv.filter((x: any) => x.DoctorId == docid);
  }
  filterOrdersProc(docid: any) {
    return this.ServicesDataListProc.filter((x: any) => x.DoctorId == docid);
  }

  filterMedicationsByDoctor(docid: any) {
    return this.MedicationDataList.filter((buttom: any) => buttom.DoctorId == docid);
  }
  filterChiefComplaintsByDoctor(docid: any) {
    return this.ChiefComplaintsDataList1.filter((buttom: any) => buttom.DoctorID == docid);
  }


  filterDiagnosis(docid:any) {
    return this.DiagnosisDataList.filter((buttom: any) => buttom.DoctorId == docid);
  }

  showDetails(type: string) {
    if(type == 'medication') {
      if(this.showMediactionList)
        this.showMediactionList = false;
      else
        this.showMediactionList = true;
      this.showOrdersList = false;
      this.modalClass = "walkthrough_info_left";
    }
    else if(type == 'invproc') {
      if(this.showOrdersList)
        this.showOrdersList = false;
      else
        this.showOrdersList = true;
      this.showMediactionList = false;
      this.modalClass = "walkthrough_info_left";
    }
  }

  closeDetailsModal() {
    this.modalClass = "walkthrough_info";
  }

  download() {
    this.appconfig.htmltopdf('emergency_patient', this.pinfo.PatientID, this.pinfo.AdmissionID, this.hospitalID)
      .subscribe( (response: any) => {
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Emergency.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error => {
        console.error('Error generating PDF', error);
      });
  }
}
