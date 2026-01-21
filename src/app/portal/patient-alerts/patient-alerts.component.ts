import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { PatientAlertsService } from './patient-alerts.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

declare var $: any;
export const MY_FORMATS = {
  parse: {
    dateInput: 'dd-MMM-yyyy HH:mm:ss',
  },
  display: {
    dateInput: 'DD-MMM-yyyy',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'dd-MMM-yyyy',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-patient-alerts',
  templateUrl: './patient-alerts.component.html',
  styleUrls: ['./patient-alerts.component.scss'],
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
export class PatientAlertsComponent extends BaseComponent implements OnInit {
  IsFromBedsBoard: any;
  FromCaseSheet: any;
  patientAlertsForm!: FormGroup;
  facility: any;
  SystemAlerts: any;
  AlertToTypes: any;
  NotifyByTypes: any;
  alertsList: any;
  errorMessages: any[] = [];
  patientAlertData: any;
  selectedPatientAlert: any;
  showViewValidationMsg = false;
  isdetailShow = false;
  endofEpisode: boolean = false;
  isDirectOpen: boolean = false;
  patientVisits: any = [];
  VisitID: any;
  SelectedViewClass: string = '';

  constructor(private us: UtilityService, public formBuilder: FormBuilder, private service: PatientAlertsService, private router: Router) {
    super();

    const currentDateTime = new Date();
    const currentTime = currentDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    this.patientAlertsForm = this.formBuilder.group({
      PatientAlertID: [0],
      Alert: ['1'],
      AlertType: ['1'],
      AlertFromDate: new Date(),
      AlertTime: currentTime,
      AlertEndDate: [''],
      Status: ['1'],
      SystemAlert: ['0'],
      AlertTo: ['0'],
      NotifyBy: ['0'],
      AlertDescription: [''],
      AlertCode: ['']
    });

  }

  ngOnInit(): void {
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.IsFromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;
    this.FromCaseSheet = sessionStorage.getItem("navigateFromCasesheet") === "true" ? true : false;
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    if (sessionStorage.getItem("ISEpisodeclose") === "true") {
      this.endofEpisode = true;
    } else {
      this.endofEpisode = false;
    }
    if (this.router.url.includes('home/patientalerts')) {
      this.isDirectOpen = true;
      this.IsFromBedsBoard = false;
      this.FromCaseSheet = false;
      this.selectedView = null;
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

  toggleSelectionForm(formCtrlName: string, val: string) {
    if (val != undefined)
      this.patientAlertsForm.controls[formCtrlName].setValue(val);

    if (formCtrlName === 'Alert') {
      this.patientAlertsForm.controls["AlertType"].setValue(val);
    }
  }

  fetchAdminMasters(type: string) {
    const url = this.service.getData(patientalerts.FetchAdminMasters, {
      Type: type,
      Filter: 'Blocked=0',
      USERID: this.doctorDetails[0].UserId,
      WORKSTATIONID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.AdminMastersInstructionsDataList.length > 0) {
          if (type === '221')
            this.SystemAlerts = response.AdminMastersInstructionsDataList;
          else if (type === '222')
            this.AlertToTypes = response.AdminMastersInstructionsDataList;
          else if (type === '223')
            this.NotifyByTypes = response.AdminMastersInstructionsDataList;
        }
      },
        (err) => {
        })
  }

  fetchAlertMasterAdv() {
    const url = this.service.getData(patientalerts.FetchAlertMasterAdv, {
      Type: "0",
      Filter: 'Blocked=0',
      UserId: this.doctorDetails[0].UserId,
      WorkstationId: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchAlertMasterDataList.length > 0) {
          this.alertsList = response.FetchAlertMasterDataList;
        }
      },
        (err) => {
        })
  }

  selectNotifyBy(not: any) {
    this.NotifyByTypes.forEach((element: any, index: any) => {
      if (element.id === not.id) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
  }

  onAlertChange(event: any) {
    this.patientAlertsForm.patchValue({
      AlertType: ['1'],
      SystemAlert: ['3'],
      AlertTo: ['3'],
      NotifyBy: ['4'],
    });

  }

  SavePatientAlerts() {
    this.errorMessages = [];
    if (this.patientAlertsForm.get('Alert')?.value === '0') {
      this.errorMessages.push("Alert");
    }
    if (this.patientAlertsForm.get('AlertDescription')?.value === '') {
      this.errorMessages.push("Please enter Description of Alert");
    }
    if (this.errorMessages.length > 0) {
      $("#patientAlertsValidationMsg").modal('show');
      return;
    }

    var payload = {
      "PatientAlertID": this.patientAlertsForm.get('PatientAlertID')?.value,
      "Patientid": this.selectedView.PatientID,
      "AdmissionID": this.selectedView.AdmissionID,
      "AlertID": 2,
      "SystemAlertID": 3,
      "CommunicationModeID": this.patientAlertsForm.get('NotifyBy')?.value,
      "AlertReminderID": 3,
      "AlertTypeID": this.patientAlertsForm.get('AlertType')?.value,
      "remarks": this.patientAlertsForm.get('AlertDescription')?.value,
      "Alterdate": moment(this.patientAlertsForm.get('AlertFromDate')?.value).format('DD-MMM-YYYY') + ' ' + this.patientAlertsForm.get('AlertTime')?.value,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.facility.FacilityID,
      "Status": this.patientAlertsForm.get('Status')?.value,
      "AlertEndDate": this.patientAlertsForm.get('AlertEndDate')?.value,
    }
    this.us.post(patientalerts.SavePatientAlerts, payload).subscribe((response) => {
      if (response.Status === "Success") {
        this.clearPatientAlerts();
        $("#patientAlertsSaveMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {
          this.errorMessages = [];
          this.errorMessages.push(response.Message);
          this.errorMessages.push(response.Message2L);
          $("#patientAlertsValidationMsg").modal('show');
        }
      }
    },
      (err) => {

      })

  }

  clearPatientAlerts() {
    const currentDateTime = new Date();
    const currentTime = currentDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    this.patientAlertsForm.patchValue({
      Alert: '1',
      AlertType: '1',
      AlertFromDate: new Date(),
      AlertTime: currentTime,
      AlertEndDate: '',
      Status: '1',
      SystemAlert: '0',
      AlertTo: '0',
      NotifyBy: '0',
      AlertDescription: '',
      AlertCode: ''
    });

    if (this.isDirectOpen) {
      this.selectedView = null;
      $('#txtSsn').val('');
      this.patientVisits = [];
      this.VisitID = "";
    }
  }

  viewPatientAlerts() {
    const url = this.service.getData(patientalerts.FetchPatientallerts, {
      PatientID: this.selectedView.PatientID,
      AdmissionID: this.selectedView.AdmissionID,
      AlertTypeID: "0",
      Tbl: "2",
      moduleId: "0",
      mappedfeatureid: "0",
      UserId: this.doctorDetails[0].UserId,
      WorkstationId: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientAlertsDataList.length > 0) {
          this.patientAlertData = response.FetchPatientAlertsDataList;
          $("#divViewPatientAlerts").modal('show');


        }
      },
        (err) => {
        })
  }

  selectPatAlert(alrt: any) {
    this.patientAlertData.forEach((element: any, index: any) => {
      if (element.PatientAlertID === alrt.PatientAlertID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.selectedPatientAlert = alrt;
    this.showViewValidationMsg = false;
  }

  loadSelectedPatientAlert(alert: any) {
    if (this.patientAlertData.filter((x: any) => x.selected).length === 0) {
      this.showViewValidationMsg = true;
      return;
    }
    else {
      this.showViewValidationMsg = false;
    }
    const alerttime = new Date(alert.Alterdate);
    const currentTime = alerttime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    this.patientAlertsForm.patchValue({
      PatientAlertID: alert.PatientAlertID,
      Alert: alert.AlertID,
      AlertType: alert.AlertTypeID,
      AlertFromDate: new Date(alert.Alterdate),
      AlertTime: currentTime,
      AlertEndDate: alert.AlertEndDate === '' ? '' : new Date(alert.AlertEndDate),
      Status: alert.Status,
      SystemAlert: alert.SystemAlertID,
      AlertTo: alert.AlertReminderID,
      NotifyBy: alert.CommunicationModeID,
      AlertDescription: alert.Remarks,
      AlertCode: alert.AlertCode,
    });
    $("#divViewPatientAlerts").modal('hide');
  }
  clearViewPatAlerts() {
    this.showViewValidationMsg = false;
    this.patientAlertData.forEach((element: any, index: any) => {
      element.selected = false;
    });
    this.viewPatientAlerts();
  }

  navigatetoBedBoard() {
    this.router.navigate(['/ward']);
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
    const url = this.us.getApiUrl(patientalerts.fetchPatientDataBySsn, {
      SSN: ssn,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (ssn === '0') {
            this.selectedView = response.FetchPatientDependCLists[0];
          }
          else if (mobileno === '0') {
            this.selectedView = response.FetchPatientDataCCList[0];
          }
          this.fetchPatientVisits();
        }
      },
        (err) => {

        })
  }

  fetchPatientVisits() {
    const url = this.us.getApiUrl(patientalerts.FetchPatientVisitsPFMRD, {
      Patientid: this.selectedView.PatientID,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientVisits = response.PatientVisitsDataList;
          const visit = response.PatientVisitsDataList.find((item: any) => item.AdmissionID === this.selectedView.AdmissionID);
          if (visit) {
            this.VisitID = this.selectedView.AdmissionID;
          } else {
            this.VisitID = response.PatientVisitsDataList[0].AdmissionID;
          }
          this.fetchPatientVistitInfo(this.VisitID, this.selectedView.PatientID);
        }
      },
        (err) => {
        })
  }

  fetchPatientVistitInfo(admissionid: any, patientid: any) {
    const url = this.us.getApiUrl(patientalerts.FetchPatientVistitInfo, { Patientid: patientid, Admissionid: admissionid, HospitalID: this.hospitalID });
    this.us.get(url)
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

  onVisitsChange(event: any) {
    const patientData = this.patientVisits.find((visit: any) => visit.AdmissionID == event.target.value);
    this.fetchPatientVistitInfo(patientData.AdmissionID, patientData.PatientID);
  }
}


export const patientalerts = {
  FetchAdminMasters: 'FetchAdminMasters?Type=${Type}&Filter=${Filter}&USERID=${USERID}&WORKSTATIONID=${WORKSTATIONID}&HospitalID=${HospitalID}',
  FetchAlertMasterAdv: 'FetchAlertMasterAdv?Type=${Type}&Filter=${Filter}&UserId=${UserId}&WorkstationId=${WorkstationId}&HospitalID=${HospitalID}',
  SavePatientAlerts: 'SavePatientAlerts',
  FetchPatientallerts: 'FetchPatientallerts?PatientID=${PatientID}&AdmissionID=${AdmissionID}&AlertTypeID=${AlertTypeID}&Tbl=${Tbl}&moduleId=${moduleId}&mappedfeatureid=${mappedfeatureid}&UserId=${UserId}&WorkstationId=${WorkstationId}&HospitalID=${HospitalID}',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientVisitsPFMRD: 'FetchPatientVisitsPFMRD?Patientid=${Patientid}&HospitalID=${HospitalID}',
  FetchPatientVistitInfo: 'FetchPatientVistitInfo?Patientid=${Patientid}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
}
