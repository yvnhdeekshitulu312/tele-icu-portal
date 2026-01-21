import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import * as moment from 'moment';
declare var $: any;

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  showProfileSection: boolean = false;
  patientDetails: any;
  listOfAppointmentList: any;
  summaryDetails: any = {};
  selectedAppointment: any;
  patientInfo: any;
  showBillSummary: boolean = false;
  apiResponse: any;
  selectedRegCode: any;
  langData: any;
  langCode: any;
  showEng = false;
  constructor(private config: ConfigService, private router: Router) {
    this.langData = this.config.getLangData();
    this.langCode = this.config.getLangCode();
    if (this.langCode === "en") {
      this.showEng = true;
    } else {
      this.showEng = false;
    }
    this.patientInfo = JSON.parse(sessionStorage.getItem("patientInfo") || '{}');//LoggedIn Patient
    this.selectedRegCode = JSON.parse(sessionStorage.getItem("selectedRegCode") || '');
    // this.getPatientDetails();
  }

  ngOnInit(): void {
    let reScheduleAppointmentKey = "reScheduleAppointment";
    if (reScheduleAppointmentKey in sessionStorage) {
      sessionStorage.removeItem(reScheduleAppointmentKey);
    }
    let appointment = "appointment";
    if (appointment in sessionStorage) {
      sessionStorage.removeItem(appointment);
    }
  }
  checkPath() {
    if (this.router.url == '/home') {
      this.showProfileSection = true;
    } else {
      this.showProfileSection = false;
    }
  }
  // getPatientDetails() {
  //   let payload = {
  //     "RegCode": this.selectedRegCode
  //   }
  //   this.config.getPatientDetails(payload).subscribe((response) => {
  //     if (response.Status === "Success") {
  //       this.patientDetails = response;
  //       sessionStorage.setItem("PatientDetails", JSON.stringify(this.patientDetails));
  //       this.getAppointmentList();
  //     }
  //   },
  //     (err) => {

  //     })
  // }
  // getAppointmentList() {
  //   let patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
  //   let payload = {
  //     "mobile": patientDetails.MobileNo,
  //     "RegCode": this.selectedRegCode,//this.patientInfo.RegCode,
  //     "HospitalId": this.config.hospitalId,
  //     "Type": 1
  //   }
  //   this.config.getAppointmentList(payload).subscribe((response: any) => {
  //     if (response.Status === "Success") {
  //       response.AppointmentList.map((data: any) => {
  //         data.SCHEDULESTARTTIME = moment(data.SCHEDULESTARTTIME, ["HH:mm"]).format("hh:mm A");
  //       })
  //       this.listOfAppointmentList = response.AppointmentList;
  //     }
  //   },
  //     (err) => {

  //     })
  // }
  showProfileModal(e: any) {
    this.showCompleteProfileModal();
  }
  openAppointmentModal() {
    this.showAppointmentListModal();
  }
  reScheduleAppointment(appointment: any) {
    this.closeAppointmentListModal();
    sessionStorage.setItem("reScheduleAppointment", JSON.stringify(appointment));
    if (appointment.IsVideoConsultation.toLowerCase() == "true") {
      sessionStorage.setItem("isVideoConsultation", "true");
    }
    else {
      sessionStorage.setItem("isVideoConsultation", "false");
    }
    this.router.navigate(['/home/appointment/schedule']);
    
  }
  // pay(appointment: any) {
  //   this.selectedAppointment = appointment;
  //   let request = {
  //     "RegCode": this.patientDetails.RegCode,
  //     "HospitalId": this.config.hospitalId,
  //     "ScheduleID": appointment.SCHEDULEID
  //   }
  //   this.config.fetchPatientBill(request).subscribe((response: any) => {
  //     if (response.Status === "Success") {
  //       this.showBillSummary = true;
  //       this.summaryDetails = response;
  //       this.apiResponse = response;
  //       // this.showSaveMessageModal();
  //     } else if (response.Status === "Fail") {
  //       this.showBillSummary = false;
  //       this.apiResponse = response;
  //       // this.showSaveMessageModal();
  //     }
  //   },
  //     (err) => {

  //     })
  // }
  // cancelAppointment(appointment: any) {
  //   let payload = {
  //     "ScheduleID": appointment.SCHEDULEID,
  //     "RegCode": this.patientDetails.RegCode,
  //     "HospitalId": this.config.hospitalId,
  //     "CancelRemarks": "Cancelling Appointment for Patient"
  //   }
  //   this.config.CancelAppointment(payload).subscribe((response: any) => {
  //     if (response.Status === "Success" || response.Status === "True") {
  //       this.summaryDetails = response;
  //       this.apiResponse = response;
  //       this.listOfAppointmentList.splice(appointment, 1);
  //       this.closeAppointmentListModal();
  //       this.hideConfirmModal();
  //       this.showSaveMessageModal();
  //     } else if (response.Status === "Fail" || response.Status === "False") {
  //       this.apiResponse = response;
  //       this.closeAppointmentListModal();
  //       this.hideConfirmModal();
  //       this.showSaveMessageModal();
  //     }
  //   },
  //     (err) => {

  //     })
  // }
  confirmCancelAppointment(appointment: any) {
    this.selectedAppointment = appointment;
    this.closeAppointmentListModal();
    this.showConfirmModal();
  }
  // confirmCancelApp(status: string) {
  //   if (status == "Yes") {
  //     this.cancelAppointment(this.selectedAppointment);
  //   } else if (status == "No") {
  //     this.hideConfirmModal();
  //   }
  // }
  goToAppointment() {
    sessionStorage.setItem("isVideoConsultation", "false");
    this.router.navigate(['/home/appointment'])
  }
  goToRadiology() {
    this.router.navigate(['/home/radiology-reports'])
  }
  goToLabreports() {
    this.router.navigate(['/home/lab-reports'])
  }
  goToInsurancestatus() {
    this.router.navigate(['/home/insurance-status'])
  }
  goToPrescriptions() {
    this.router.navigate(['/home/prescriptions'])
  }
  goToOthers() {
    this.router.navigate(['/home/others'])
  }
  gotoMyFamily() {
    this.router.navigate(['/home/myfamily'])
  }

  navigateToVideo(appointment: any) {
    sessionStorage.setItem("PATIENTNAME", appointment.PATIENTNAME);
    sessionStorage.setItem("SCHEDULEID", appointment.SCHEDULEID);
    $("#appointmets-list").modal('hide');
    this.router.navigate(['/home/video-consultation'])
  }
  showAppointmentListModal(): void {
    $("#appointmets-list").modal('show');
  }
  closeAppointmentListModal(): void {
    $("#appointmets-list").modal('hide');
  }
  showCompleteProfileModal(): void {
    $("#profile-info").modal('show');
  }
  showSaveMessageModal() {
    $("#saveMessage").modal('show');
  }
  hideSaveMessageModal(): void {
    $("#saveMessage").modal('hide');
  }
  showConfirmModal() {
    $("#confirm").modal('show');
  }
  hideConfirmModal(): void {
    $("#confirm").modal('hide');
  }
  onLogout() {
    // let patientInfo = "patientInfo";
    // let PatientDetails = "PatientDetails";
    // let appointment = "appointment";
    // let reScheduleAppointment = "reScheduleAppointment";

    // sessionStorage.removeItem(patientInfo);
    // sessionStorage.removeItem(PatientDetails);
    // sessionStorage.removeItem(appointment);
    // sessionStorage.removeItem(reScheduleAppointment);
    // sessionStorage.clear()
    // this.router.navigate(['/login']);
    this.config.onLogout();
  }
}
