import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from '../base.component';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-patient-quick-actions',
  templateUrl: './patient-quick-actions.component.html',
  styleUrls: ['./patient-quick-actions.component.scss']
})
export class PatientQuickActionsComponent extends BaseComponent implements OnInit {
  @Input() patientInfo: any;
  @Output() closeModal = new EventEmitter<any>();
  pinfo: any;
  IsDoctor: any;
  WardID: any;

  constructor(private appconfig: ConfigService, private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.pinfo = this.patientInfo;
    this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.WardID = this.ward.FacilityName;
    if (this.pinfo.AdmissionID) {
      //this.fetchPatientFileInfo();
    }
  }

  fetchPatientFileInfo() {
    this.appconfig.FetchERWorkFlow(this.pinfo.PatientID, this.pinfo.AdmissionID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
        }
      })
  }

  navigatetoCaseSheet() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.patientInfo));
    sessionStorage.setItem("selectedView", JSON.stringify(this.patientInfo));
    sessionStorage.setItem("selectedCard", JSON.stringify(this.patientInfo));
    sessionStorage.setItem("selectedPatientAdmissionId", this.patientInfo.IPID);
    this.closeModal.emit();
    this.router.navigate(['/home/doctorcasesheet']);
  }

  redirecttoVitalScreen() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    //sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.closeModal.emit();
    this.router.navigate(['/ward/ipvitals']);
  }
  redirectToLabTrend() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    this.closeModal.emit();
    this.router.navigate(['/ward/labtrend']);
  }
  redirecttoProgressNotesScreen() {
    this.patientInfo= JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}'); 
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    this.closeModal.emit();
    if (this.WardID === 'ICCU' && this.IsDoctor === 'true')
    this.router.navigate(['/ward/icu-progress-note']);
    else
      this.router.navigate(['/ward/progress-note']);
    //this.router.navigate(['/ward/progress-note']);
  }
  redirectToDrugAdministration() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    //sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.closeModal.emit();
    this.router.navigate(['/ward/DrugAdministration']);
  }
  redirectToSampleCollection() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    //sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.closeModal.emit();
    this.router.navigate(['/ward/samplecollection']);
  }
  redirectToMotherMilkExtraction() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    //sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.closeModal.emit();
    this.router.navigate(['/ward/mothermilkextraction']);
  }
  redirectToMotherMilkFeeding() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    //sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.closeModal.emit();
    this.router.navigate(['/ward/mothermilkfeeding']);
  }
  redirectToIntakeoutput() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    //sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.closeModal.emit();
    this.router.navigate(['/ward/intakeoutput']);
  }
  navigatetoResults() {
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.patientInfo));
    sessionStorage.setItem("selectedView", JSON.stringify(this.patientInfo));
    sessionStorage.setItem("FromBedBoard", "true");
    this.closeModal.emit();
    this.router.navigate(['/home/otherresults']);
  }
  redirectToShiftHandover() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    this.closeModal.emit();
    this.router.navigate(['/ward/shifthandover']);
  }
  redirectToNursingDashboard() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    sessionStorage.setItem("selectedPatientAdmissionId", this.patientInfo.IPID);
    //sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.closeModal.emit();
    this.router.navigate(['/ward/nursingdashboard']);
  }
  redirectToEndoScopy() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    sessionStorage.setItem("FromBedBoard", "true");
    sessionStorage.setItem("FromRadiology", "false");
    this.closeModal.emit();
    this.router.navigate(['/ward/endoscopy']);
  }
  navigatetoBedBoard() {
    this.closeModal.emit();
    this.router.navigate(['/ward']);
  }

  redirectToEforms() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    sessionStorage.setItem("selectedView", JSON.stringify(this.patientInfo));
    this.closeModal.emit();
    // sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/templates']);
  }
  redirectToPreOp() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientInfo));
    sessionStorage.setItem("selectedView", JSON.stringify(this.patientInfo));
    this.closeModal.emit();
    // sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/shared/pre-op-checklist']);
  }
}
