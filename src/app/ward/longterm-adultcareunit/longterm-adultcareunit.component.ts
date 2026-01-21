import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { PatientfolderService } from 'src/app/shared/patientfolder/patientfolder.service';
import { UtilityService } from 'src/app/shared/utility.service';
import * as moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { BradenScaleComponent } from 'src/app/shared/braden-scale/braden-scale.component';
import { TemplatesLandingComponent } from 'src/app/templates/templates-landing/templates-landing.component';
import { GeneralconsentComponent } from 'src/app/portal/generalconsent/generalconsent.component';
import { ConsentMedicalComponent } from 'src/app/portal/consent-medical/consent-medical.component';
import { ConsentHroComponent } from 'src/app/portal/consent-hro/consent-hro.component';
import * as Highcharts from 'highcharts';
import { VteRiskAssessmentComponent } from '../vte-risk-assessment/vte-risk-assessment.component';
import { VteSurgicalRiskAssessmentComponent } from '../vte-surgical-risk-assessment/vte-surgical-risk-assessment.component';
import { VteObgAssessmentComponent } from '../vte-obg-assessment/vte-obg-assessment.component';

declare var $: any;
declare function openPACS(test: any, hospId: any, patientId: any): any;

@Component({
  selector: 'app-longterm-adultcareunit',
  templateUrl: './longterm-adultcareunit.component.html',
  styleUrls: ['./longterm-adultcareunit.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe,
  ]
})
export class LongtermAdultcareunitComponent extends BaseComponent implements OnInit {
  IsHome = true;
  patientVisits: any = [];
  noPatientSelected = false;
  PatientID: any;
  fromBedsBoard = false;
  patientFolderForm!: FormGroup;
  patientdata: any;
  episodeId: any;
  PatientType: any;
  viewMoreTypeHeader: string = "";
  facility: any;
  viewMoreDiagnosisForm!: FormGroup;
  viewMoreData: any[] = [];
  FetchMainProgressNoteDataList: any;
  FetchMainProgressNoteDataListViewMore: any;
  diagStr = "";
  FetchBradenScaleViewDataList: any;
  FetchBradenScaleSelctedViewDataList: any;
  bradenScaleForm: any;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  formTab = "";
  consentFromTypes = 'generalconsent';
  savedRiskAssessmentDetails: any;
  savedSurgicalRiskAssessmentDetails: any;
  FetchPatientFinalObgVTEFromPatDataList: any;
  admissionGeneralConsent: any = [];
  FetchPatAdmMedicalInfConsentDataList: any = [];
  FetchPatadmAgaintDataList: any = [];
  data: any;
  dataToFilter: any;
  distinctSpecialisations: any = [];
  selectedReport: any;
  radiologyPdfDetails: any;
  trustedUrl: any;
  IsTab: any = 'L';
  visitID: any;
  fromDate: any;
  toDate = new FormControl(new Date());
  showLabTest: boolean = false;
  labReportDocPdfDetails: any;
  activeButton: string = 'spline';
  testGraphsData: any;
  labReportPdfDetails: any;
  activeResultButton: string = 'Spline'
  isResultAreaSplineActive: boolean = false
  isResultSplineActive: boolean = true;
  isResultLineActive: boolean = true;
  isResultcolumnActive: boolean = true;
  allResults: string = "btn selected";
  panicResults: string = "btn";
  abnormalResults: string = "btn";
  bathingCareitems: any;
  InsuranceName:String='';
  vteAssessmentType = 'med';
  locationList: any;
  referralList: any = [];

  @ViewChild('labTestDiv', { static: false }) labTestDiv!: ElementRef;
  patinfo: any;

  constructor(private service: PatientfolderService, private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private datePipe: DatePipe, private modalService: GenericModalBuilder) {
    super();
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    const frmbb = sessionStorage.getItem("FromBedBoard") || 'false';
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    if(frmbb === 'true') {
      this.fromBedsBoard = true;
    }
    this.patientFolderForm = this.formBuilder.group({
      VisitID: ['0']
    });

    this.viewMoreDiagnosisForm = this.formBuilder.group({
      fromdate: [''],
      todate: ['']
    });
    var d = new Date();
    var vm = new Date();
    vm.setMonth(vm.getMonth() - 6);
    this.bradenScaleForm = this.formBuilder.group({
      fromdate: vm,
      todate: d
    });

   }

  ngOnInit(): void {
    this.InsuranceName=this.selectedView.PayerName;
    this.fetchHospitalLocations();
    if(this.fromBedsBoard) {
      $("#txtSsn").val(this.selectedView.SSN);
      this.fetchPatientVisits();
    }
  }

  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.fetchPatientDetailsBySsn(event);
    }
  }

  fetchPatientDetailsBySsn(event: any) {
    var inputval = event.target.value;
    var ssn = "0"; var mobileno = "0"; var patientid = "0";
    if (inputval.charAt(0) === "0") {
      ssn = "0";
      mobileno = inputval;
      patientid = "0";
    }
    else {
      ssn = inputval;
      mobileno = "0";
      patientid = "0";
    }

    this.fetchPatientDetails(ssn, mobileno, patientid)
  }

  fetchPatientDetails(ssn: string, mobileno: string, patientId: string) {
    const url = this.service.getData(patientfolder.fetchPatientDataBySsn, {
      SSN: ssn,
      PatientID: patientId,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: 0,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (ssn === '0') {
            this.PatientID = response.FetchPatientDependCLists[0].PatientID;
            this.selectedView = response.FetchPatientDependCLists[0];
          }
          else if (mobileno === '0') {
            this.PatientID = response.FetchPatientDataCCList[0].PatientID;
            this.selectedView = response.FetchPatientDataCCList[0];
          }

          this.noPatientSelected = true;
          this.fetchPatientVisits();
        }
      },
        (err) => {

        })
  }

  fetchPatientVisits() {
    const url = this.service.getData(patientfolder.FetchPatientVisits, { Patientid: this.selectedView.PatientID, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientVisits = response.PatientVisitsDataList;
          var admid = this.selectedView.AdmissionID;
          if (this.fromBedsBoard) {
            this.patientFolderForm.get('VisitID')?.setValue(admid);
            this.noPatientSelected = true;
          }
          else {
            admid = response.PatientVisitsDataList[0].AdmissionID;
            this.patientFolderForm.get('VisitID')?.setValue(admid);
          }
          //this.episodeId = response.PatientVisitsDataList[0].EpisodeID;

          setTimeout(() => {
            this.visitChange(admid);
          }, 1000);
        }
      },
        (err) => {
        })
  }
  onVisitsChange(event: any) {
    this.admissionID = event.target.value;
    this.visitChange(event.target.value);
  }

  visitChange(admissionId: any) {
    this.admissionID = admissionId;
    this.patientdata = this.patientVisits.find((visit: any) => visit.AdmissionID == admissionId);
    this.episodeId = this.patientdata.EpisodeID;
    this.PatientType = this.patientdata.PatientType;
    this.fetchPatientVistitInfo(admissionId, this.patientdata.PatientID);
    // this.fetchMotherDetails(this.patientdata.PatientID);
  }
  
  fetchPatientVistitInfo(admissionid: any, patientid: any) {
    const url = this.service.getData(patientfolder.FetchPatientVistitInfo, { Patientid: patientid, Admissionid: admissionid, HospitalID: this.hospitalID });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedView = response.FetchPatientVistitInfoDataList[0];
          this.fetchPatientSummary('12','');
          this.fetchPatientSummary('','progressnotes');
        }
        
      },
        (err) => {

        })
  }

  fetchPatientSummary(tbl: string, section: string) {
    if (tbl != '') {
      var facid = this.facility.FacilityID;
      if (facid === undefined) {
        facid = this.facility;
      }
      const url = this.service.getData(patientfolder.FetchPatientSummary, {
        Admissionid: this.admissionID, PatientId: this.selectedView.PatientID, TBL: tbl, WorkStationID: facid, HospitalID: this.hospitalID
      });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.assignData(tbl, response);
          }
        },
          (err) => {

          })
    }
    else if (section === 'investigations') {
      this.viewMoreTypeHeader = "Investigations & Radiology";
      this.fetchLabOrderResults();
    }
    else if (section === 'referrals') {
      this.viewMoreTypeHeader = "Referrals";
      this.FetchAdviceData();
    }
    // else if (section === 'medications') {
    //   this.FetchPatientMedication();
    // }
    // else if (section == 'surgeryrequests') {
    //   this.viewMoreTypeHeader = "Surgery Requests";
    //   this.fetchSSurgeries();
    // }
    else if (section == 'progressnotes') {
      this.viewMoreTypeHeader = "Progress Notes";
      var d = new Date(this.patientdata.AdmitDate);
      this.viewMoreDiagnosisForm.patchValue({
        fromdate: d,
        todate: new Date()
      })
      this.fetchMainProgressNote();
    }
    // else if (section == 'nursinginstructions') {
    //   this.viewMoreTypeHeader = "Nursing Instructions";
    //   this.fetchNursingInstructions();
    // }
    // else if (section == 'intakeoutput') {
    //   this.viewMoreTypeHeader = "Intake Output";
    //   this.fetchSummaryData();
    // }
    // else if (section == 'careplan') {
    //   this.viewMoreTypeHeader = "Care Plan";
    //   this.fetchCarePlan();
    // }
    // else if (section == 'medicalcertificate') {
    //   this.viewMoreTypeHeader = "Medical Certificate";
    //   this.fetchPatientMedicalCertificate();
    // }
    // else if (section == 'sickleave') {
    //   this.viewMoreTypeHeader = "Sick Leave";
    //   this.fetchPatientSickLeave();
    // }
    else if (section == 'vte') {
      this.viewMoreTypeHeader = "VTE Forms";
      this.vteAssessmentType = 'med';
      this.fetchVteRiskAssessment()
    }
    // else if (section == 'bedsidecare') {
    //   this.viewMoreTypeHeader = "Daily BedSide/Turning Sheet";
    //   this.FetchPatientBedSideCareForm();
    // }
    else if (section == 'bathingcare') {
      this.viewMoreTypeHeader = "Daily Bathing Care";
      this.FetchPatientBathingCareForm();
    }
    // else if (section == 'shifthandover') {
    //   this.viewMoreTypeHeader = "Shift Handover";
    //   this.fetchPatientHandOverform(this.selectedView.AdmissionID, this.selectedView.PatientID);
    // }
    // else if (section == 'endoscopy') {
    //   this.viewMoreTypeHeader = "Endoscopy";
    //   this.fetchPatientEndoTotalRequest();      
    // }
    // else if (section == 'dietchart') {
    //   this.viewMoreTypeHeader = "Diet Chart";
    //   this.fetchDietRequisitionADV();      
    // }
    else if (section == 'eforms') {
      this.viewMoreTypeHeader = "E-Forms";
      this.getreoperative('9');      
    }
    else if (section == 'bradenscale') {
      this.FetchBradenScaleViewDataList = [];
      this.FetchBradenScaleSelctedViewDataList = [];
      this.viewMoreTypeHeader = "Braden Scale";
      this.FetchBradenScaleView();      
    }
    // else if (section == 'chiefcomplaints') {
    //   this.viewMoreTypeHeader = "Chief Complaints";
    //   this.FetchPatientChiefComplaintAndExaminations();      
    // }
    // else if (section == 'fallrisk') {
    //   this.FetchBradenScaleViewDataList = [];
    //   this.FetchBradenScaleSelctedViewDataList = [];
    //   this.viewMoreTypeHeader = "Fall Risk Assessment";
    //   this.FetchFallRiskView();      
    // }
    // else if(section == 'assessments') {
    //   this.viewMoreTypeHeader = "Assessments";
    //   this.FetchPatienFolderAssementView();
    // }
  }

  assignData(tbl: string, response: any) {
    this.viewMoreData = [];
    switch (tbl) {
      case "1": {
        this.viewMoreData = response.PatientVisitDetailsList;
        break;
      }
      case "2": {
        //this.viewMoreData = response.BloodOrdersDataList; 
        this.viewMoreTypeHeader = "Blood Request";
        response.BloodOrdersDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "RequestedBy": element.RequestedByName,
            "Name": element.BloodGroup,
            "IsSampleCollected": element.IsSampleCollected,
            "CreateDate": moment(element.RequestDatetime).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "3": {
        //this.viewMoreData = response.NurseNotesDataList; 
        this.viewMoreTypeHeader = "Nurse Notes";
        response.NurseNotesDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.NoteType,
            "Name": element.Note,
            "CreateDate": moment(element.NoteDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "4": {
        //this.viewMoreData = response.MRFilesDataList; 
        this.viewMoreTypeHeader = "MRD Files";
        response.MRFilesDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "Name": element.ScanFilename,
            "CreateDate": moment(element.ScanDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "5": {
        //this.viewMoreData = response.AdviceFollowupDataList; 
        this.viewMoreTypeHeader = "Advice";
        response.AdviceFollowupDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "Name": element.Advice,
            "CreateDate": moment(element.CreateDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "6": {
        //this.viewMoreData = response.ScreenDesignDataList; 
        this.viewMoreTypeHeader = "Screen Design";
        response.ScreenDesignDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "Name": element.TemplateName,
            "CreateDate": moment(element.CreateDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "7": {
        //this.viewMoreData = response.ReferralOrdersDataList; 
        this.viewMoreTypeHeader = "Referral Orders";
        response.ReferralOrdersDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.ReferralType,
            "Specialisation": element.Specialisation,
            "Remarks": element.Remarks,
            "Doctor": element.DoctornameName,
            "Reason": element.Reason
          })
        });
        break;
      }
      case "8": {
        //this.viewMoreData = response.DietSummaryDataList; 
        this.viewMoreTypeHeader = "Diet Summary";
        response.DietSummaryDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "Name": element.DietCategory,
            "CreateDate": moment(element.OrderDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "9": {
        //this.viewMoreData = response.MedicalCertificateDataList; 
        this.viewMoreTypeHeader = "Merdical Certificate";
        response.MedicalCertificateDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "Name": element.TemplateName,
            "CreateDate": moment(element.CertificateDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "10": {
        //this.viewMoreData = response.SickleaveDataList; 
        this.viewMoreTypeHeader = "Sick Leave";
        response.SickleaveDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "FromDate": element.FromDate,
            "ToDate": element.ToDate,
            "Doctor": element.Doctorname
          })
        });
        break;
      }
      case "11": {
        //this.viewMoreData = response.InvestigationsProceduresDataList; 
        this.viewMoreTypeHeader = "Procedures";
        const procs = response.InvestigationsProceduresDataList.filter((x: any) => x.ServiceId === '5');
        procs.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.ServiceName,
            "Name": element.ItemCode + '-' + element.ItemName,
            "Specialisation": element.Specialisation,
            "Date": moment(element.PresciptionDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "12": {
        //this.viewMoreData = response.PatientDiseasesDataList;
        //this.viewMoreTypeHeader = "Diagnosis";
        this.diagStr = response.PatientDiseasesDataList?.map((item: any) => item.Code + "-" + item.DiseaseName).join(', ');
        // response.PatientDiseasesDataList.forEach((element: any, index: any) => {
        //   this.viewMoreData.push({
        //     "Code": element.Code,
        //     "Name": element.DiseaseName,
        //     "DiagnosisType": element.DiagonosisType,
        //     "DiagnosisStatus": element.DiagnosisStatus,
        //     "PrePostType": element.PrePostType,
        //     "CreateDate": moment(element.CreateDate).format('DD-MMM-YYYY HH:MM'),
        //     "Doctorname": element.Doctorname,
        //   })
        // });
        break;
      }
      case "13": {
        //this.viewMoreData = response.PatientSummaryVitalsDataList; 
        this.viewMoreTypeHeader = "Vitals";
        response.PatientSummaryVitalsDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Vital": element.Vital,
            "Value": element.Value,
            "CreateDate": moment(element.VitalSignDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        // this.PatientsVitalsList = this.PatientsVitalsListViewMore = response.PatientSummaryVitalsDataList;
        // this.PatientsVitalsList = this.PatientsVitalsList.slice(0, 10);
        // this.vitalsDatetime = this.PatientsVitalsList[0];

        // var bpsys = this.PatientsVitalsList.find((x: any) => x.Vital == "BP -Systolic");
        // this.bpSystolic = bpsys.Value;
        // this.bpSysVal = this.getHighLowValue(bpsys);

        // var bpdia = this.PatientsVitalsList.find((x: any) => x.Vital == "BP-Diastolic");
        // this.bpDiastolic = bpdia.Value;
        // this.bpDiaVal = this.getHighLowValue(bpdia);

        // var temp = this.PatientsVitalsList.find((x: any) => x.Vital == "Temparature");
        // this.temperature = temp.Value;
        // this.tempVal = this.getHighLowValue(temp);

        // var pulse = this.PatientsVitalsList.find((x: any) => x.Vital == "Pulse");
        // this.pulse = pulse.Value;
        // this.pulseVal = this.getHighLowValue(pulse);

        // this.spo2 = this.PatientsVitalsList.find((x: any) => x.Vital == "SPO2")?.Value;
        // this.respiration = this.PatientsVitalsList.find((x: any) => x.Vital == "Respiration")?.Value;
        // this.consciousness = this.PatientsVitalsList.find((x: any) => x.Vital == "Consciousness")?.Value;
        // this.o2FlowRate = this.PatientsVitalsList.find((x: any) => x.Vital == "O2 Flow Rate")?.Value;
        // if(this.patientdata.PatientType === '2') {
        //   this.tableVitalsForm.patchValue({
        //     vitalFromDate: new Date(this.patientdata.AdmitDate),
        //     vitalToDate: new Date()
        //   });
        // }
        // this.GetVitalsData();
        break;
      }
      case "14": {
        //this.viewMoreData = response.PatientSummaryAssessmentsDataList; 
        this.viewMoreTypeHeader = "Assessments";
        response.PatientSummaryAssessmentsDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "Name": element.CSTName,
            "CreateDate": moment(element.CreateDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      default: {
        //statements; 
        break;
      }
    }
  }

  fetchMainProgressNote() {
    
    var FromDate = moment(this.viewMoreDiagnosisForm.value['fromdate']).format("DD-MMM-yyyy");
    var ToDate = moment(this.viewMoreDiagnosisForm.value['todate']).format('DD-MMM-YYYY');
    const url = this.service.getData(patientfolder.FetchMainProgressNote,
      {
        Admissionid: this.admissionID, FromDate: FromDate, ToDate: ToDate,
        UserID: this.doctorDetails[0].UserId, WorkStationID: this.facility.FacilityID, HospitalID: this.hospitalID
      });
    this.us.get(url)
      .subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchMainProgressNoteDataList = this.FetchMainProgressNoteDataListViewMore = results.FetchMainProgressNoteDataList;
            //this.FetchMainProgressNoteDataList = this.FetchMainProgressNoteDataList.slice(0,6);
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  filterProgressNotes(type: string) {
    if(type === 'all') {
      this.FetchMainProgressNoteDataListViewMore = this.FetchMainProgressNoteDataList;
    }
    else if(type === 'doctor') {
      this.FetchMainProgressNoteDataListViewMore = this.FetchMainProgressNoteDataList.filter((x:any) => x.NoteTypeID === '3');
    }
    else if(type === 'nurse') {
      this.FetchMainProgressNoteDataListViewMore = this.FetchMainProgressNoteDataList.filter((x:any) => x.NoteTypeID === '1');
    }
  }
  FetchBradenScaleView() {
    const fromdate = this.bradenScaleForm.get("fromdate")?.value;
    const todate = this.bradenScaleForm.get("todate")?.value;
    const url = this.service.getData(patientfolder.FetchBradenScaleView, { IPID: this.admissionID, FromDate: moment(fromdate).format('DD-MMM-YYYY'), ToDate: moment(todate).format('DD-MMM-YYYY'), UserID: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(url)
      .subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchBradenScaleViewDataList = results.FetchBradenScaleViewDataList;
            this.FetchBradenScaleSelctedViewDataList = results.FetchBradenScaleSelctedViewDataList;
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  getreoperative(templateid: any) {
    this.FetchPatienClinicalTemplateDetailsNList = [];
    if(templateid === '39')
      this.formTab = "MonitoringSheet";
    else
      this.formTab = "AgainstMedicalAdvice";
    const url = this.service.getData(patientfolder.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID,PatientTemplatedetailID:0,TBL:1,HospitalID: this.hospitalID });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if(response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
          }
        }
      },
        (err) => {
        })
  }

  showConsentFromTypes(type: any) {
    this.consentFromTypes = type;
    if (type === 'generalconsent') {
      this.FetchPatientadmissionGeneralConsent();
    }
    else if (type === 'medicalconsent') {
      this.FetchPatientAdmissionMedicalInformedConsent();
    }
    else if (type === 'HighRiskOperation') {
      this.FetchPatientadmissionAgaintConsentForHighRiskOperations();
    }
  }

  fetchVteRiskAssessment() {
    const url = this.service.getData(patientfolder.FetchFinalSaveVTERiskAssessment, {
      AdmissionID: this.selectedView.AdmissionID,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchFinalSaveVTERiskAssessmentDataList.length > 0) {
          this.savedRiskAssessmentDetails = response.FetchFinalSaveVTERiskAssessmentDataList.filter((x: any) => x.AssessmentType === 'VTE Medical');
        }
        else {

        }
      },
        (err) => {
        })
  }
  //VTE-Surgical
  fetchVteSurgicalRiskAssessment() {
    const url = this.service.getData(patientfolder.FetchFinalSaveVTESurgicalRiskAssessment, {
      AdmissionID: this.selectedView.AdmissionID,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchFinalSaveVTERiskAssessmentDataList.length > 0) {
          this.savedSurgicalRiskAssessmentDetails = response.FetchFinalSaveVTERiskAssessmentDataList.filter((x: any) => x.AssessmentType === 'VTE Surgery');
        }
        else {

        }
      },
        (err) => {
        })
  }

  //VTE-OBG
  FetchPatientFinalObgVTEFrom() {
    const url = this.service.getData(patientfolder.FetchPatientFinalObgVTEFrom, { PatientObgVTEID: 0, AdmissionID: this.selectedView.AdmissionID, UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatientFinalObgVTEFromPatDataList = response.FetchPatientFinalObgVTEFromPatDataList;

        }
      },
        (err) => {
        })
  }

  FetchPatientadmissionGeneralConsent() {
    const url = this.service.getData(patientfolder.FetchPatientadmissionGeneralConsent, { AdmissionID: this.selectedView.AdmissionID, HospitalID: this.hospitalID });
    
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.admissionGeneralConsent = response.FetchPatientadmissionGeneralConsentDataList;
          this.admissionGeneralConsent.forEach((element: any, index: any) => {
            element.Class = "icon-w cursor-pointer";
          })
        }
      },
        (err) => {

        })
  }

  FetchPatientAdmissionMedicalInformedConsent() {
    const url = this.service.getData(patientfolder.FetchPatientAdmissionMedicalInformedConsent, { AdmissionID: this.selectedView.AdmissionID, HospitalID: this.hospitalID });
    
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatAdmMedicalInfConsentDataList = response.FetchPatAdmMedicalInfConsentDataList;
        }
      },
        (err) => {

        })
  }

  FetchPatientadmissionAgaintConsentForHighRiskOperations() {
    const url = this.service.getData(patientfolder.FetchPatientadmissionAgaintConsentForHighRiskOperations, { AdmissionID: this.selectedView.AdmissionID, HospitalID: this.hospitalID });
    
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatadmAgaintDataList = response.FetchPatadmAgaintDataList;
        }
      },
        (err) => {

        })

  }

  getConsents() {
    this.formTab = "Consents";
    this.FetchPatientadmissionGeneralConsent();
  }

  fetchLabOrderResults() {
    this.data = [];
    this.dataToFilter = [];
    this.distinctSpecialisations = [];
    var fromdate = moment(new Date().setMonth(new Date().getMonth() - 6)).format('DD-MMM-YYYY');
    var todate = moment(new Date()).format('DD-MMM-YYYY');

    const url = this.service.getData(patientfolder.FetchLabOrderResults, { fromDate: fromdate, ToDate: todate, PatientID: this.selectedView.PatientID, HospitalID: this.hospitalID });
    this.us.get(url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.data = response.FetchLabOrderResultsDataaList.filter((val: any) => val.IsResult == "4");
        this.dataToFilter = response.FetchLabOrderResultsDataaList;
        this.data.forEach((element: any, index: any) => {
          if (Number(element.Status) >= 7 && Number(element.Status) != 13) {
            element.viewRecord = true;
          }
          else {
            element.viewRecord = false;
          }
          if (element.HasDocuments == "1") {
            element.HasDocuments = true;
          } else {
            element.HasDocuments = false;
          }
          if (element.IsPanic == "True") {
            element.RowColor = "background-color:red;padding:0.36rem;";
            element.RowColorW = "color:white";
          }
          else if (element.IsAbnormal == "True") {
            element.RowColor = "background-color:orange;padding:0.36rem;"
            element.RowColorW = "color:white";
          }
          element.SampleStatus = parseInt(element.Status);
        });
        this.distinctSpecialisations = Array.from(new Set(this.data.map((item: any) => item.specialisation)));
      }
    });
  }

  submitPACSForm(test: any) {
    openPACS(test.TestOrderItemID, this.hospitalID, this.selectedView.PatientId);
  }

  addSelectedReport(dept: any) {
    this.selectedReport = dept;
    this.radioLogyReportPDF();
  }
  radioLogyReportPDF() {
    const url = this.service.getData(patientfolder.FetchRadReportGroupPDF, {
      RegCode: this.selectedView.RegCode,
      TestOrderItemId: this.selectedReport.TestOrderItemID,
      TestOrderId: this.selectedReport.TestOrderId,
      UserID:this.doctorDetails[0].UserId,
      HospitalID: this.hospitalID
     
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Status === "Success") {
        this.radiologyPdfDetails = response;
        this.trustedUrl = response?.FTPPATH
        this.showModal();
      }
    },
      (err) => {

      })
  }

  showModal(): void {
    $("#reviewAndPayment").modal('show');
  }

  receiveData(data: { visit: any, fromdate: any, todate: any }) {
    this.visitID = data.visit;
    this.fromDate = data.fromdate;
    this.toDate = data.todate;
    if (this.IsTab === "L") {
      this.fetchLabOrderResults();
    }
    else if (this.IsTab === "R") {
      this.fetchRadOrderResults();
    }
    else if (this.IsTab === "C") {
      this.fetchCardiologyOrderResults();
    }
    else if (this.IsTab === "N") {
      this.fetchNeurologyOrderResults();
    }
    else if (this.IsTab === "P") {
      //this.fetchNeurologyOrderResults();
      this.data = [];
    }
    else if (this.IsTab === "D") {
      this.data = [];
      //this.fetchNeurologyOrderResults();
    }
  }

  ActiveTab(tab: any) {
    this.IsTab = tab;
  }
  fetchLabByValue(filteredvalue: any = "") {
    if (filteredvalue) {
      let filteredData = this.dataToFilter.filter((value: any) => value.specialisation === filteredvalue);
      this.data = filteredData;
    }
    else {
      this.data = this.dataToFilter;
    }
    this.showLabTest = false;
  }

  fetchRadOrderResults() {
    this.data = [];
    this.dataToFilter = [];

    const url = this.service.getData(patientfolder.FetchRadOrderResults, {
      fromDate: this.fromDate, ToDate: this.toDate, PatientID: this.selectedView.PatientID, HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.data = response.FetchRadOrderResultsDataaList.filter((val: any) => val.IsResult == "7");
        this.dataToFilter = response.FetchLabOrderResultsDataaList;
        this.data.forEach((element: any, index: any) => {
          if (Number(element.Status) >= 4 && Number(element.Status) <= 6) {
            element.viewRecord = true;
          }
          else {
            element.viewRecord = false;
          }
        });
      }
    },
      (err) => {

      })
  }

  fetchCardiologyOrderResults() {
    this.data = [];
    this.dataToFilter = [];
    const url = this.service.getData(patientfolder.FetchCardOrderResults, {
      fromDate: this.fromDate, ToDate: this.toDate, PatientID: this.selectedView.PatientID, HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.data = response.FetchRadOrderResultsDataaList.filter((val: any) => val.IsResult == "7");
        this.dataToFilter = response.FetchLabOrderResultsDataaList;
        this.data.forEach((element: any, index: any) => {
          if (Number(element.Status) >= 4 && Number(element.Status) <= 6) {
            element.viewRecord = true;
          }
          else {
            element.viewRecord = false;
          }
        });
      }
    },
      (err) => {

      })
  }
  fetchNeurologyOrderResults() {
    this.data = [];
    this.dataToFilter = [];
    const url = this.service.getData(patientfolder.FetchNeurologyOrderResults, {
      fromDate: this.fromDate, ToDate: this.toDate, PatientID: this.selectedView.PatientID, HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.data = response.FetchLabOrderResultsDataaList.filter((val: any) => val.IsResult == "7");
        this.dataToFilter = response.FetchLabOrderResultsDataaList;
        this.data.forEach((element: any, index: any) => {
          if (Number(element.Status) >= 4 && Number(element.Status) <= 6) {
            element.viewRecord = true;
          }
          else {
            element.viewRecord = false;
          }
        });
      }
    },
      (err) => {

      })
  }
  addSelectedDocResult(dept: any) {
    this.selectedReport = dept;
    this.getLabDocReportPdf()
  }
  getLabDocReportPdf() {
    const url = this.service.getData(patientfolder.fetchLabDocReportGroupPDF, {
      TestOrderID: this.selectedReport.TestOrderId,
      TestOrderItemID: this.selectedReport.TestOrderItemID,
      HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Status === "Success") {
        this.labReportDocPdfDetails = response;
        this.trustedUrl = response?.FTPPATH;
        this.showLabReportsModal();
      } else if (response.Status === "Fail") {
        this.labReportDocPdfDetails = response;
        this.showToastrModal();
      }
    },
      (err) => {

      })
  }
  showLabReportsModal(): void {
    $("#showLabReportsModal").modal('show');
  }
  showToastrModal() {
    $("#saveMessage").modal('show');
  }

  loadLabTest() {
    this.showLabTest = true;
  }

  fetchLabTestGraphs(test: any, event: Event) {
    event.stopPropagation();
    const url = this.service.getData(patientfolder.fetchLabTestGraph, {
      TestName: test.TestName,
      PatientID: this.selectedView.PatientID,
      HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      this.testGraphsData = response;
      this.createResultsChart();
      if (this.labTestDiv && this.labTestDiv.nativeElement) {
        this.labTestDiv.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
      (err) => {

      })

  }

  private createResultsChart(): void {
    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseInt(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'spline',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'spline',
        zoomType: 'x',
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        },
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        useHTML: true,
        shared: true,
        formatter: function (this: Highcharts.TooltipFormatterContextObject): string {
          let tooltipContent = '<table>';

          tooltipContent += '<tr><td>Date:</td><td>' + this.x + '</td></tr>';

          this.points?.forEach(point => {
            tooltipContent += '<tr><td>' + point.series.name + ':</td><td>' + point.y + '</td></tr>';
          });

          tooltipContent += '</table>';
          return tooltipContent;
        }
      },
      series: series,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7,
      },
    } as any);
  }

  addSelectedResult(dept: any) {
    this.selectedReport = dept;
    this.getLabReportPdf()
  }

  isSelectedRow(rowData: any): boolean {
    return rowData === this.selectedReport;
  }

  getLabReportPdf() {

    let reqPayload = {
      "RegCode": this.selectedView.RegCode,//this.patientDetails.RegCode,
      "HospitalId": this.hospitalID,
      "TestOrderId": this.selectedReport.TestOrderId
    }
    const url = this.service.getData(patientfolder.FetchLabReportGroupPDF, { RegCode: this.selectedView.RegCode, TestOrderId: this.selectedReport.TestOrderId,UserID: this.doctorDetails[0].UserId, HospitalID: this.hospitalID });
    this.us.get(url).subscribe((response: any) => {
      if (response.Status === "Success") {
        this.labReportPdfDetails = response;
        this.trustedUrl = response?.FTPPATH;
        this.showLabReportsModal();
      } else if (response.Status === "Fail") {
        this.labReportPdfDetails = response;
        this.showToastrModal();
      }
    },
      (err) => {

      })
  }

  resultSpline(): void {
    this.isResultAreaSplineActive = false;
    this.isResultSplineActive = true;
    this.isResultLineActive = false;
    this.isResultcolumnActive = false;
    this.activeResultButton = 'Spline';

    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseInt(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'spline',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'spline',
        zoomType: 'x',
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        },
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        headerFormat: '<div>Date: {point.key}</div>',
        pointFormat: '<div>{series.name}: {point.y}</div>',
        shared: true,
        useHTML: true,
      },
      series: series,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7,
      },
    } as any);
  }
  resultAreaSpline(): void {
    this.isResultAreaSplineActive = true;
    this.isResultSplineActive = false;
    this.isResultLineActive = false;
    this.isResultcolumnActive = false;
    this.activeResultButton = 'areaSpline';
    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseInt(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'areaspline',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'areaspline',
        zoomType: 'x',
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        },
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        headerFormat: '<div>Date: {point.key}</div>',
        pointFormat: '<div>{series.name}: {point.y}</div>',
        shared: true,
        useHTML: true,
      },
      series: series,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7,
      },
    } as any);
  }
  resultLine(): void {
    this.isResultAreaSplineActive = false;
    this.isResultSplineActive = false;
    this.isResultLineActive = true;
    this.isResultcolumnActive = false;
    this.activeResultButton = 'line';
    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseInt(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'line',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'line',
        zoomType: 'x',
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        },
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        headerFormat: '<div>Date: {point.key}</div>',
        pointFormat: '<div>{series.name}: {point.y}</div>',
        shared: true,
        useHTML: true,
      },
      series: series,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7,
      },
    } as any);
  }
  resultColumn(): void {
    this.isResultAreaSplineActive = true;
    this.isResultSplineActive = false;
    this.isResultLineActive = false;
    this.isResultcolumnActive = true;
    this.activeResultButton = 'column';
    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseInt(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'column',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'column',
        zoomType: 'x',
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        },
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        headerFormat: '<div>Date: {point.key}</div>',
        pointFormat: '<div>{series.name}: {point.y}</div>',
        shared: true,
        useHTML: true,
      },
      series: series,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7,
      },
    } as any);
  }

  filterTestResults(type: any) {
    if (type == "all") {
      this.allResults = "btn selected"; this.panicResults = this.abnormalResults = "btn";
      this.data = this.dataToFilter;
    }
    else if (type == "panic") {
      this.allResults = this.abnormalResults = "btn"; this.panicResults = "btn selected";
      this.data = this.dataToFilter.filter((r: any) => r.IsPanic == "True");
    }
    else if (type == "abnormal") {
      this.allResults = this.panicResults = "btn"; this.abnormalResults = "btn selected"
      this.data = this.dataToFilter.filter((r: any) => r.IsAbnormal == "True");
    }
  }

  FetchPatientBathingCareForm() {
    const url = this.service.getData(patientfolder.FetchPatientBathSideCareFrom, {
      Admissionid: this.admissionID,
      FromDate: this.selectedView.AdmitDate,
      ToDate: moment(new Date()).format('DD-MMM-YYYY'),
      HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Code == 200 && response.FetchPatientBathSideCareFromDataaList.length > 0) {
        this.bathingCareitems = response.FetchPatientBathSideCareFromDataaList;
      }

    },
      (err) => {
      })
  }

  showVteAssessmentView(type: string) {
    this.vteAssessmentType = type;
    if (type === 'med') {
      this.fetchVteRiskAssessment();
    }
    else if (type === 'sur') {
      this.fetchVteSurgicalRiskAssessment();
    }
    else if (type === 'obg') {
      this.FetchPatientFinalObgVTEFrom();
    }
  }
  fetchHospitalLocations() {
    const url = this.service.getData(patientfolder.FetchHospitalLocations, {
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Status === "Success") {
        this.locationList = response.HospitalLocationsDataList;
      } else {
      }

    },
      (err) => {
      })
  }

  FetchAdviceData() {
    const url = this.service.getData(patientfolder.FetchAdviceData, {
      TBL: 1,
      Admissionid: this.selectedView.AdmissionID,
      HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.PatientAdviceReferalDataList.length > 0) {
        response.PatientAdviceReferalDataList.forEach((element: any, index: any) => {
          const selectedItem = this.locationList.find((value: any) => value.HospitalID === Number(element.LocationID));
          let refer = {
            "Type": element.IsInternalReferral === true ? 1 : 0,
            "Location": selectedItem.HospitalID,
            "LocationName": selectedItem.Name,
            "SpecialisationDoctorID": element.DoctorID,
            "SpecialisationDoctorName": element.DoctorName,
            "Remarks": element.Remarks,
            "Specialization": element.SpecialiseID,
            "SpecializationName": element.Specialisation,
            "Reason": element.ReasonID,
            "ReasonName": element.ReasonName,
            "Priority": element.Priority,
            "PriorityName": element.PriorityName,
            "Duration": element.duration,
            "Cosession": element.CoSession,
            "REFERRALORDERID": element.ReferralOrderID,
            "BKD": 0
          };

          this.referralList.push(refer);
        });
      }

    },
      (err) => {
      })
  }

  view(key: any, value: any) {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass : 'vte_view_modal'
    };
    
    if (key === 'bs') {
      const filteredData = this.FetchBradenScaleSelctedViewDataList.filter((item: any) => item.RiskAssessmentOrderID === value.RiskAssessmentOrderID);
      const modalRef = this.modalService.openModal(BradenScaleComponent, {
        data: filteredData,
        readonly: true
      }, options);
    }
    else if(key === 'generalconsent') {
      const modalRef = this.modalService.openModal(GeneralconsentComponent, {
        data: value,
        readonly: true
      }, options);
    }

    else if(key === 'medicalconsent') {
      const modalRef = this.modalService.openModal(ConsentMedicalComponent, {
        data: value,
        readonly: true
      }, options);
    }

    else if(key === 'HighRiskOperation') {
      const modalRef = this.modalService.openModal(ConsentHroComponent, {
        data: value,
        readonly: true
      }, options);
    }
    else if (key === 'med') {
      const modalRef = this.modalService.openModal(VteRiskAssessmentComponent, {
        data: value,
        readonly: true
      }, options);
    }
    else if (key === 'sur') {
      const modalRef = this.modalService.openModal(VteSurgicalRiskAssessmentComponent, {
        data: value,
        readonly: true
      }, options);
    }
    else if (key === 'obg') {
      const modalRef = this.modalService.openModal(VteObgAssessmentComponent, {
        data: value,
        readonly: true
      }, options);
    }

  }

  viewEformTemplate(templ:any) {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass : 'vte_view_modal'
    };
      const modalRef = this.modalService.openModal(TemplatesLandingComponent, {
        data: templ,
        readonly: true
      }, options);
  }


  navigatetoBedBoard() {
    if(!this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
     this.router.navigate(['/ward']);
     sessionStorage.setItem("FromEMR", "false");
  }

  clearLtacu() {
    $("#txtSsn").val('');
    this.noPatientSelected = false;
    this.patientVisits = [];
    this.PatientID = "";
    this.fromBedsBoard = false;
    this.patientdata = [];
    this.episodeId = "";
    this.PatientType = "";
    this.viewMoreTypeHeader = "";
    this.viewMoreData = [];
    this.FetchMainProgressNoteDataList = [];
    this.FetchMainProgressNoteDataListViewMore = [];
    this.diagStr = "";
    this.FetchBradenScaleViewDataList = [];
    this.FetchBradenScaleSelctedViewDataList = [];
    this.FetchPatienClinicalTemplateDetailsNList = [];
    this.formTab = "";
    this.consentFromTypes = 'generalconsent';
    this.savedRiskAssessmentDetails = [];
    this.savedSurgicalRiskAssessmentDetails = [];
    this.FetchPatientFinalObgVTEFromPatDataList = [];
    this.admissionGeneralConsent = [];
    this.FetchPatAdmMedicalInfConsentDataList = [];
    this.FetchPatadmAgaintDataList = [];
    this.selectedView = [];
  }
  openQuickActions() {
    this.patinfo = this.selectedView;
    $("#quickaction_info").modal('show');
  }
  clearPatientInfo() {
    this.patinfo = "";
  }
  closeModal() {
    $("#quickaction_info").modal('hide');
  }
}

export const patientfolder = {
  FetchPatientVisits: 'FetchPatientVisits?Patientid=${Patientid}&HospitalID=${HospitalID}',
  FetchPatientVistitInfo: 'FetchPatientVistitInfo?Patientid=${Patientid}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchPatientFileData: 'FetchPatientFileData?EpisodeID=${EpisodeID}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchPatientOrderedOrPrescribedDrugs: 'FetchPatientOrderedOrPrescribedDrugs?PatientType=${PatientType}&IPID=${IPID}&PatientID=${PatientID}&HospitalID=${HospitalID}',
  FetchBloodRequest: 'FetchBloodRequest?Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchSSurgeries: 'FetchSSurgeries?Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchEForms: 'FetchEForms?Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchMainProgressNote: 'FetchMainProgressNote?Admissionid=${Admissionid}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchNursingInstructions: 'FetchNursingInstructions?PatientID=${PatientID}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchCarePlan: 'FetchCarePlan?Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchInTakeOutPut: 'FetchInTakeOutPut?Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchEFormSelected: 'FetchEFormSelected?Admissionid=${Admissionid}&ScreenDesignId=${ScreenDesignId}&PatientTemplateid=${PatientTemplateid}&HospitalID=${HospitalID}',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchMedicationHold: 'FetchMedicationHold?Demographic=${Demographic}&UserId=${UserId}&HospitalID=${HospitalID}',
  holdPrescriptionItems: 'holdPrescriptionItems',
  BlockPrescriptionItems: 'BlockPrescriptionItems',
  FetchPatientCaseRecord: 'FetchPatientCaseRecord?AdmissionID=${AdmissionID}&PatientID=${PatientID}&EpisodeID=${EpisodeID}&UserName=${UserName}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchDrugAdministrationDrugs: 'FetchDrugAdministrationDrugs?FromDate=${FromDate}&ToDate=${ToDate}&IPID=${IPID}&HospitalID=${HospitalID}',
  FetchSurgeryorders: 'FetchSurgeryorders?OrderID=${OrderID}&UserID=${UserID}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
  FetchPatientSummaryFileData: 'FetchPatientSummaryFileData?PatientID=${PatientID}&AdmissionID=${AdmissionID}&EpisodeID=${EpisodeID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientSickLeaveWorkList: 'FetchPatientSickLeaveWorkList?PatientID=${PatientID}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
  FetchMedicalCertificateRequest: 'FetchMedicalCertificateRequest?PatientID=${PatientID}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
  FetchPatientSickLeavePDF: 'FetchPatientSickLeavePDF?AdmissionID=${AdmissionID}&SickLeaveID=${SickLeaveID}&HospitalID=${HospitalID}',
  FetchMedicalCertificatePDF: 'FetchMedicalCertificatePDF?PatientID=${PatientID}&MedicalCertificationID=${MedicalCertificationID}&HospitalID=${HospitalID}',
  FetchPatientSummary: 'FetchPatientSummary?Admissionid=${Admissionid}&PatientId=${PatientId}&TBL=${TBL}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchLabOrderResults: 'FetchLabOrderResults?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&HospitalID=${HospitalID}',
  FetchLabReportGroupPDF: 'FetchLabReportGroupPDF?RegCode=${RegCode}&TestOrderId=${TestOrderId}&UserID=${UserID}&HospitalID=${HospitalID}',
  fetchLabDocReportGroupPDF: 'FetchLabDocuments?TestOrderID=${TestOrderID}&TestOrderItemID=${TestOrderItemID}&HospitalID=${HospitalID}',
  fetchLabTestGraph: 'FetchLabTestGraph?TestName=${TestName}&PatientID=${PatientID}&HospitalID=${HospitalID}',
  FetchRadReportGroupPDF: 'FetchRadReportGroupPDF?RegCode=${RegCode}&TestOrderItemId=${TestOrderItemId}&TestOrderId=${TestOrderId}&UserID=${UserID}&HospitalID=${HospitalID}',
  FetchRadOrderResults: 'FetchRadOrderResults?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&HospitalID=${HospitalID}',
  FetchCardOrderResults: 'FetchCardOrderResults?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&HospitalID=${HospitalID}',
  FetchNeurologyOrderResults: 'FetchNeurologyOrderResults?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&HospitalID=${HospitalID}',
  FetchPatientSurgeryNote: 'FetchPatientSurgeryNote?SurgeryRequestID=${SurgeryRequestID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdviceDiagnosis: 'FetchAdviceDiagnosis?TBL=1&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchFinalSaveVTERiskAssessment: 'FetchFinalSaveVTERiskAssessment?AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchFinalSaveVTESurgicalRiskAssessment: 'FetchFinalSaveVTERiskAssessment?AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientFinalObgVTEFrom: 'FetchPatientFinalObgVTEFrom?PatientObgVTEID=${PatientObgVTEID}&AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdmittedMotherDetails: 'FetchAdmittedMotherDetails?ChildPatientID=${ChildPatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchPatientHandOverform: 'fetchPatientHandOverform?Admissionid=${Admissionid}&HandOverformID=0&HospitalID=${HospitalID}',
  fetchPatientBedSideCareFrom: 'FetchPatientBedSideCareFrom?Admissionid=${Admissionid}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
  FetchPatientBathSideCareFrom: 'FetchPatientBathSideCareFrom?Admissionid=${Admissionid}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
  FetchPatientHandOverformPDF: 'FetchPatientHandOverformPDF?HandOverformID=${HandOverformID}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchPatientHandOverformPDFD: 'FetchPatientHandOverformPDF?HandOverformID=${HandOverformID}&Admissionid=${Admissionid}&strpath=${strpath}&HospitalID=${HospitalID}',
  FetchMedicalCertificateRequestV: 'FetchMedicalCertificateRequestV?SSN=${SSN}&FromDate=${FromDate}&ToDate=${ToDate}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchMedicalCertificationDescriptions:'FetchMedicalCertificationDescriptions?MedicalCertificationTemplateID=${MedicalCertificationTemplateID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  PatientEndoTotalRequest:'PatientEndoTotalRequest?IPID=${IPID}&HospitalID=${HospitalID}',
  FetchDietRequisitionADV:'FetchDietRequisitionADV?Type=${Type}&Filter=${Filter}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchBradenScaleView: 'FetchBradenScaleView?IPID=${IPID}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientChiefComplaintAndExaminations:'FetchPatientChiefComplaintAndExaminations?Admissionid=${Admissionid}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  //FetchPatienClinicalTemplateDetailsOT: 'FetchPatienClinicalTemplateDetailsOT?AdmissionID=${AdmissionID}&ClinicalTemplateID=${ClinicalTemplateID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
  FetchPatienClinicalTemplateDetailsOT: 'FetchPatienClinicalTemplateDetailsOT?AdmissionID=${AdmissionID}&ClinicalTemplateID=${ClinicalTemplateID}&PatientTemplatedetailID=${PatientTemplatedetailID}&TBL=${TBL}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchFallRiskView: 'FetchFallRiskView?IPID=${IPID}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientIntakOutputSave: 'FetchPatientIntakeOutputsH?IPID=${IPID}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatienFolderAssementView:'FetchPatienFolderAssementView?AdmissionID=${AdmissionID}&ClinicalTemplateID=${ClinicalTemplateID}&PatientTemplatedetailID=${PatientTemplatedetailID}&TBL=${TBL}&&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientadmissionGeneralConsent: 'FetchPatientadmissionGeneralConsent?AdmissionID=${AdmissionID}&HospitalID=${HospitalID}',
  FetchPatientAdmissionMedicalInformedConsent: 'FetchPatientAdmissionMedicalInformedConsent?AdmissionID=${AdmissionID}&HospitalID=${HospitalID}',
  FetchPatientadmissionAgaintConsentForHighRiskOperations: 'FetchPatientadmissionAgaintConsentForHighRiskOperations?AdmissionID=${AdmissionID}&HospitalID=${HospitalID}',
  FetchAdviceData:'FetchAdviceData?TBL=${TBL}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchHospitalLocations:'FetchHospitalLocations?type=0&filter=blocked=0&UserId=0&WorkstationId=0'

};