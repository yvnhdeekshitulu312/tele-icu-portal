import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from '../generic-modal-builder.service';
import { PreAnestheticEvalutionRecordComponent } from 'src/app/templates/pre-anesthetic-evalution-record/pre-anesthetic-evalution-record.component';
import { AnesthesiaConsciousComponent } from 'src/app/templates/anesthesia-conscious/anesthesia-conscious.component';

declare var $: any;

@Component({
  selector: 'app-ot-quick-actions',
  templateUrl: './ot-quick-actions.component.html',
  styleUrls: ['./ot-quick-actions.component.scss']
})
export class OtQuickActionsComponent implements OnInit {
  selectedView: any;
  item: any;
  langData: any;
  @Input() patientInfo: any;
  @Output() closeModal = new EventEmitter<any>();
  pinfo: any;
  showResultsinPopUp: boolean = false;

  constructor(private portalConfig: ConfigService, public router: Router, private modalService: GenericModalBuilder) {
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.item = JSON.parse(sessionStorage.getItem("otpatient") || '{}');
    this.langData = this.portalConfig.getLangData();
  }

  ngOnInit(): void {
    this.pinfo = this.item;
  }

  navigateToDoctorAppointment() {
    sessionStorage.setItem("otpatient", JSON.stringify(this.item));
    this.closeModal.emit();
    this.router.navigate(['/ot/ot-doctorappointments']);
  }
  navigateToPreoperativeChecklist() {
    if (Number(this.item.STATUSID) < 4) {
      $("#validationMsg").modal('show');
      return;
    }
    sessionStorage.setItem("otpatient", JSON.stringify(this.item));
    this.closeModal.emit();
    this.router.navigate(['/shared/pre-op-checklist']);
  }

  navigateToSurgeryNotes() {
    if (Number(this.item.STATUSID) < 4) {
      $("#validationMsg").modal('show');
      return;
    }
    sessionStorage.setItem("otpatient", JSON.stringify(this.item));
    this.closeModal.emit();
    this.router.navigate(['/ot/ot-surgerynotes']);
  }

  navigateToSurgeryRecord() {
    if (Number(this.item.STATUSID) < 4) {
      $("#validationMsg").modal('show');
      return;
    }
    sessionStorage.setItem("otpatient", JSON.stringify(this.item));
    this.closeModal.emit();
    this.router.navigate(['/ot/surgeryrecord']);
  }

  navigateToSurgicalSafetyChecklist() {
    if (Number(this.item.STATUSID) < 4) {
      $("#validationMsg").modal('show');
      return;
    }
    sessionStorage.setItem("otpatient", JSON.stringify(this.item));
    this.closeModal.emit();
    this.router.navigate(['/ot/surgical-safety-checklist']);
  }

  navigateToPatientEforms() {
    sessionStorage.setItem("selectedView", JSON.stringify(this.item));
    sessionStorage.setItem("PatientID", JSON.stringify(this.item.PatientID));
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.item));
    sessionStorage.setItem("fromOrDashboard", "true");
    sessionStorage.setItem("ssnEForms", this.item.SSN);
    this.closeModal.emit();
    this.router.navigate(['/shared/patienteforms'], { state: { ssn: this.item.SSN } });
  }

  navigatetoOtDashboard() {
    $("#ot_quickaction_info").modal('hide');
    this.closeModal.emit();
    this.router.navigate(['/ot/ot-dashboard']);
  }

  navigateToORNurses() {
    sessionStorage.setItem("otpatient", JSON.stringify(this.item));
    this.closeModal.emit();
    this.router.navigate(['/ot/or-nurses']);
  }

  openResultsPopup() {
    this.item.RegCode = this.item.UHIDNO;
    this.item.PatientType = this.item.patienttype;
    sessionStorage.setItem("FromCaseSheet", "false");
    sessionStorage.setItem("selectedView", JSON.stringify(this.item));
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.item));
    sessionStorage.setItem("selectedView", JSON.stringify(this.item));
    this.showResultsinPopUp = true;
    this.closeModal.emit();
    $("#viewResults").modal("show");
  }

  navigateToORCharges() {
    sessionStorage.setItem("otpatient", JSON.stringify(this.item));
    this.closeModal.emit();
    this.router.navigate(['/ot/or-charges']);
  }

  navigateToPreAnesthetic() {
    
    sessionStorage.setItem("otpatient", JSON.stringify(this.item));
    sessionStorage.setItem("selectedView", JSON.stringify(this.item));
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass : 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(PreAnestheticEvalutionRecordComponent, {
      data: this.item,
      readonly: true
    }, options);
  }

  navigateToAnestheticConscious() {
    sessionStorage.setItem("otpatient", JSON.stringify(this.item));
    sessionStorage.setItem("selectedView", JSON.stringify(this.item));
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass : 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(AnesthesiaConsciousComponent, {
      data: this.item,
      readonly: true
    }, options);
  }
  
}
