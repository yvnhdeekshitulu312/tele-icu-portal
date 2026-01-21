import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '../base.component';
import { DatePipe } from '@angular/common';
import { GenericModalBuilder } from '../generic-modal-builder.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UtilityService } from '../utility.service';
import { PatientfolderService } from '../patientfolder/patientfolder.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { TemplatesLandingComponent } from 'src/app/templates/templates-landing/templates-landing.component';
import { filter } from 'rxjs';
import { MedicalAssessmentComponent } from 'src/app/portal/medical-assessment/medical-assessment.component';
import { MedicalAssessmentPediaComponent } from 'src/app/portal/medical-assessment-pedia/medical-assessment-pedia.component';
import { MedicalAssessmentObstericComponent } from 'src/app/portal/medical-assessment-obsteric/medical-assessment-obsteric.component';
import { MedicalAssessmentSurgicalComponent } from 'src/app/portal/medical-assessment-surgical/medical-assessment-surgical.component';
import { OrNursesComponent } from 'src/app/ot/or-nurses/or-nurses.component';
import { SurgicalSafetyChecklistComponent } from 'src/app/ot/surgical-safety-checklist/surgical-safety-checklist.component';
import { PreAnesthesiaAssessmentComponent } from 'src/app/portal/pre-anesthesia-assessment/pre-anesthesia-assessment.component';
declare var $: any;

@Component({
  selector: 'app-patient-eforms',
  templateUrl: './patient-eforms.component.html',
  styleUrls: ['./patient-eforms.component.scss']
})
export class PatientEformsComponent extends BaseComponent implements OnInit {
  @Input() fromCaseSheet: boolean = false;  
  noPatientSelected = false;
  SelectedViewClass: any;
  url = '';
  PatientID: any;
  patientVisits: any = [];
  location: any;
  facility: any;
  patientDetails: any;
  patientFolderForm!: FormGroup;
  patientdata: any;
  episodeId: any;
  PatientType: any;
  motherDetails: any;
  motherSsn: string = "";
  childSsn: string = "";
  isdetailShow = false;
  FetchEFormsDataaList: any;
  FetchEFormsDataaListViewMore: any;
  FetchPatienClinicalTemplateDetailsNList: any;
  filteredTemplates: any = [];
  fromOrDashbaord = false;
  ssnEForms: any;
  otpatinfo: any;
  
  constructor(private route: ActivatedRoute, private service: PatientfolderService, private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private datePipe: DatePipe, private modalService: GenericModalBuilder, private changeDetectorRef: ChangeDetectorRef) {
    super();
    this.PatientID = sessionStorage.getItem("PatientID");
    this.fromOrDashbaord = sessionStorage.getItem("fromOrDashboard") === "true" ? true : false;
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.patientFolderForm = this.formBuilder.group({
      VisitID: ['0']
    });
  }

  ngOnInit(): void {
    this.location = sessionStorage.getItem("locationName");
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    // this.IsHome = this.InputHome;
    this.fetchPatientVisits();
    this.ssnEForms = sessionStorage.getItem("ssnEForms") || '';

    if (this.ssnEForms) {
      $("#txtSsn").val(this.ssnEForms);
      const inputElement = document.getElementById('txtSsn');
      if (inputElement) {
        const event = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true
        });
        inputElement.dispatchEvent(event);
      }
    }
    
    // setTimeout(() => {
    //   this.router.events.pipe(
    //     filter(event => event instanceof NavigationEnd)
    //   ).subscribe(() => {
    //     const navigation = this.router.getCurrentNavigation();
    //     const state = navigation?.extras.state as { ssn: string };
    //     if (state && state.ssn) {
    //       alert(state.ssn);
    //       $("#txtSsn").val(state.ssn);
    //       const inputElement = document.getElementById('txtSsn');
    //       if (inputElement) {
    //         const event = new KeyboardEvent('keydown', {
    //           key: 'Enter',
    //           bubbles: true,
    //           cancelable: true
    //         });
    //         inputElement.dispatchEvent(event);
    //       }
    //     }
    //   }), 2000
    // });
    
    // this.getPatientAlert();
    if (this.selectedView.PatientType == "2") {
      if (this.selectedView?.Bed.includes('ISO'))
        this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
      else
        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }
  }

  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.fetchPatientDetailsBySsn(event);
    }
  }

  isdetailShows() {
    this.isdetailShow = true;
    if (this.isdetailShow = true) {
      $('.patient_card').addClass('maximum')
    }
  }
  isdetailHide() {
    this.isdetailShow = false;
    if (this.isdetailShow === false) {
      $('.patient_card').removeClass('maximum')
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
    this.url = this.service.getData(patientEforms.fetchPatientDataBySsn, {
      SSN: ssn,
      MobileNO: mobileno,
      //PatientID: patientId,     
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.doctorDetails[0]?.FacilityId,//this.facilitySessionId==undefined?this.doctorDetails[0]?.FacilityId:this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
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
    this.url = this.service.getData(patientEforms.FetchPatientVisits, { Patientid: this.PatientID, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientVisits = response.PatientVisitsDataList;
          var admid = this.selectedView.AdmissionID == undefined ? this.selectedView.IPAdmissionID : this.selectedView.AdmissionID;          
          admid = response.PatientVisitsDataList[0].AdmissionID;
          if(this.fromCaseSheet) {
            const patdet = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
            admid = patdet.AdmissionID;
          }
          this.patientFolderForm.get('VisitID')?.setValue(admid);

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

    // this.fetchPatientSummary('');
    this.fetchPatientVistitInfo(admissionId, this.patientdata.PatientID);
    this.getreoperative(0);
    // this.FetchPatientMedication();
    // this.fetchSSurgeries();
    // this.fetchBloodRequests();
    // this.fetchEForms();
    // this.fetchMainProgressNote();
    // this.fetchNursingInstructions();
    // this.fetchCarePlan();
    //this.fetchInTakeOutPut();
    //this.fetchPatientSickLeave();
    //this.fetchPatientMedicalCertificate();
    this.fetchMotherDetails(this.patientdata.PatientID);
  }

  fetchMotherDetails(patientid: string) {
    this.url = this.service.getData(patientEforms.FetchAdmittedMotherDetails, {
      ChildPatientID: patientid,
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.doctorDetails[0]?.FacilityId,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.motherDetails = response.FetchAdmittedChildDetailsListD[0];
        }
      },
        (err) => {

        })
  }

  openMotherSsnDetails(motherDet: any) {
    $("#txtSsn").val(motherDet.MotherSSN);
    this.childSsn = motherDet.ChildSSN;
    this.fetchPatientDetails(motherDet.MotherSSN, "0", "0");
  }

  openChildSsnDetails(ssn: string) {
    this.motherDetails = [];
    this.fetchPatientDetails(ssn, "0", "0");
  }

  fetchPatientVistitInfo(admissionid: any, patientid: any) {
    this.url = this.service.getData(patientEforms.FetchPatientVistitInfo, { Patientid: patientid, Admissionid: admissionid, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedView = response.FetchPatientVistitInfoDataList[0];
        }
        if (this.selectedView.PatientType == "2") {
          if (this.selectedView?.Bed.includes('ISO'))
            this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
          else
            this.SelectedViewClass = "m-0 fw-bold alert_animate token";
        } else {
          this.SelectedViewClass = "m-0 fw-bold alert_animate token";
        }
      },
        (err) => {

        })
  }

  viewEformTemplate(templ:any) {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass : 'viewEformTemplate_modal'
    };
    
    if(templ.ClinicalTemplateID === '2') {
      const modalRef = this.modalService.openModal(MedicalAssessmentComponent, {
        data: templ,
        readonly: true,
        admissionID: this.admissionID,
        selectedView: this.selectedView
      }, options);
      return;
    }
    else if(templ.ClinicalTemplateID === '7') {
      const modalRef = this.modalService.openModal(MedicalAssessmentPediaComponent, {
        data: templ,
        readonly: true,
        admissionID: this.admissionID,
        selectedView: this.selectedView
      }, options);
      return;
    }
    else if(templ.ClinicalTemplateID === '6') {
      const modalRef = this.modalService.openModal(MedicalAssessmentObstericComponent, {
        data: templ,
        readonly: true,
        admissionID: this.admissionID,
        selectedView: this.selectedView
      }, options);
      return;
    }
    else if(templ.ClinicalTemplateID === '8') {
      const modalRef = this.modalService.openModal(MedicalAssessmentSurgicalComponent, {
        data: templ,
        readonly: true,
        admissionID: this.admissionID,
        selectedView: this.selectedView
      }, options);
      return;
    }
    else if(templ.ClinicalTemplateID === '113') {
      const sur = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
      sur.SurgeryRequestID = sur.SurgeryRequestid;
      const options: NgbModalOptions = {
        size: 'xl',
        windowClass : 'vte_view_modal'
      };
      const modalRef = this.modalService.openModal(OrNursesComponent, {
        data: sur,
        readonly: true
      }, options);
    }
    else if(templ.ClinicalTemplateID === '70') {
      const sur = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
      sur.SurgeryRequestID = sur.SurgeryRequestid;
      const options: NgbModalOptions = {
        size: 'xl',
        windowClass : 'vte_view_modal'
      };
      const modalRef = this.modalService.openModal(SurgicalSafetyChecklistComponent, {
        data: sur,
        readonly: true
      }, options);
    }
    else if(templ.ClinicalTemplateID === '17') {
      const sur = JSON.parse(sessionStorage.getItem("PatientDetails") ?? '{}');
      const options: NgbModalOptions = {
        size: 'xl',
        windowClass : 'vte_view_modal'
      };
      const modalRef = this.modalService.openModal(PreAnesthesiaAssessmentComponent, {
        data: templ,
        readonly: true
      }, options);
    }
    else {
      const options: NgbModalOptions = {
        size: 'xl',
        windowClass : 'viewEformTemplate_modal'
      };
        const modalRef = this.modalService.openModal(TemplatesLandingComponent, {
          data: templ,
          readonly: true,
          fromshared: true,
          isEdit: false,
          admissionID: this.admissionID,
          selectedView: this.selectedView
        }, options);
    }
  }

  editEformTemplate(templ:any) {

    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'viewEformTemplate_modal'
    };

    if (templ.ClinicalTemplateID === '2') {
      const modalRef = this.modalService.openModal(MedicalAssessmentComponent, {
        data: templ,
        readonly: true,
        admissionID: this.admissionID,
        selectedView: this.selectedView,
        isEdit: true,
      }, options);
      return;
    }
    else if (templ.ClinicalTemplateID === '7') {
      const modalRef = this.modalService.openModal(MedicalAssessmentPediaComponent, {
        data: templ,
        readonly: true,
        admissionID: this.admissionID,
        selectedView: this.selectedView,
        isEdit: true,
      }, options);
      return;
    }
    else if (templ.ClinicalTemplateID === '6') {
      const modalRef = this.modalService.openModal(MedicalAssessmentObstericComponent, {
        data: templ,
        readonly: true,
        admissionID: this.admissionID,
        selectedView: this.selectedView,
        isEdit: true,
      }, options);
      return;
    }
    else if (templ.ClinicalTemplateID === '8') {
      const modalRef = this.modalService.openModal(MedicalAssessmentSurgicalComponent, {
        data: templ,
        readonly: true,
        admissionID: this.admissionID,
        selectedView: this.selectedView,
        isEdit: true,
      }, options);
      return;
    }
    else if(templ.ClinicalTemplateID === '113') {
      const sur = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
      sur.SurgeryRequestID = sur.SurgeryRequestid;
      const options: NgbModalOptions = {
        size: 'xl',
        windowClass : 'vte_view_modal'
      };
      const modalRef = this.modalService.openModal(OrNursesComponent, {
        data: sur,
        readonly: true
      }, options);
    }
    else if(templ.ClinicalTemplateID === '70') {
      const sur = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
      sur.SurgeryRequestID = sur.SurgeryRequestid;
      const options: NgbModalOptions = {
        size: 'xl',
        windowClass : 'vte_view_modal'
      };
      const modalRef = this.modalService.openModal(SurgicalSafetyChecklistComponent, {
        data: sur,
        readonly: true
      }, options);
    }
    else {


      const options: NgbModalOptions = {
        size: 'xl',
        windowClass: 'editEformTemplate_modal'
      };
      this.selectedView.HospitalID = this.hospitalID;
      this.selectedView.SpecialiseID = templ.SpecialiseID;
      const modalRef = this.modalService.openModal(TemplatesLandingComponent, {
        data: templ,
        readonly: true,
        fromshared: true,
        isEdit: true,
        admissionID: this.admissionID,
        selectedView: this.selectedView
      }, options);
    }
  }

  getreoperative(templateid: any) {
    this.url = this.service.getData(patientEforms.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.admissionID ,PatientTemplatedetailID:0,TBL:1,HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if(response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.filteredTemplates = this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
          }
          else {
            this.filteredTemplates = [];
          }
        }
      },
        (err) => {
        })
  }

  filterTemplates(event: any) {
    this.filteredTemplates = this.FetchPatienClinicalTemplateDetailsNList.filter((template: any) =>
      template.ClinicalTemplateName.toLowerCase().includes(event.target.value.toLowerCase().trim())
    );
  }
  navigatetoBedBoard() {
    if (this.fromOrDashbaord) {
      $('#selectPatientYesNoModal').modal('show'); 
    }
    else {
      this.router.navigate(['/suit/radiologyworklist']);
    }
  }

  onAccept() {
    //const otpatient = JSON.parse(sessionStorage.getItem("otpatient") || '{}');
    //const SSN = otpatient.SSN;

    $('#selectPatientYesNoModal').modal('hide');
    sessionStorage.setItem('navigateToDashboard', this.ssnEForms)
    this.router.navigate(['/ot/ot-dashboard']);
  }

  onDecline() {
    $('#selectPatientYesNoModal').modal('hide');
    this.router.navigate(['/ot/ot-dashboard']);
  }

  openOtQuickActions() {
    const item = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
    this.otpatinfo = item;
    $("#ot_quickaction_info").modal('show');
  }

  closeOtModal() {
    this.otpatinfo = "";
    $("#ot_quickaction_info").modal('hide');
  }

}

export const patientEforms = {
  FetchPatienClinicalTemplateDetailsOT: 'FetchPatienClinicalTemplateDetailsOT?AdmissionID=${AdmissionID}&ClinicalTemplateID=${ClinicalTemplateID}&PatientTemplatedetailID=${PatientTemplatedetailID}&TBL=${TBL}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchEForms: 'FetchEForms?Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchPatientSummaryFileData: 'FetchPatientSummaryFileData?PatientID=${PatientID}&AdmissionID=${AdmissionID}&EpisodeID=${EpisodeID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientVisits: 'FetchPatientVisits?Patientid=${Patientid}&HospitalID=${HospitalID}',
  FetchPatientVistitInfo: 'FetchPatientVistitInfo?Patientid=${Patientid}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdmittedMotherDetails: 'FetchAdmittedMotherDetails?ChildPatientID=${ChildPatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};