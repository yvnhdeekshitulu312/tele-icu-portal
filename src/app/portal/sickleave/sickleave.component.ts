import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { patientfolder } from 'src/app/shared/patientfolder/patientfolder.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';

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
  selector: 'app-sickleave',
  templateUrl: './sickleave.component.html',
  styleUrls: ['./sickleave.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe,
  ],
})
export class SickleaveComponent implements OnInit {
  @Input() data: any;
  sickleaveForm: FormGroup;
  tablePatientSickLeaveForm!: FormGroup;
  tableCompanionSickLeaveForm!: FormGroup;
  tablePatientsForm!: FormGroup;
  sickLeaveGeneratedDates: any;
  sickLeaveId = 0;
  selectedView: any;
  btnEnglish: string = "fs-7 btn selected";
  btnArabic: string = "fs-7 btn";
  PatientID: any;
  AdmissionID: any;
  patientVisits: any = [];
  primaryDoctors: any = [];
  doctorDetails: any;
  hospId: any;
  validationMsg: string = "";
  diffInDays: any;
  diffInDaysC: any;
  langData: any;
  lang: any;
  facility: any;
  trustedUrl: any;
  endofEpisode: boolean = false;
  showClose: boolean = false;
  minDate = new Date();
  sickLeaveData: any;
  sickleavePdfDetails: any;
  showSSN = false;
  isDirectOpen: boolean = false;
  SelectedViewClass: any;
  isPatientSelected: boolean = false;
  patientType: string = '1';
  isCompanion: boolean = false;
  isCompanionDisable: boolean = false;
  SickLeaveRelationMDataList: any;
  SickLeaveTypeOPDataList: any;
  SickLeaveTypeIPDataList: any;
  Nationalities: any = [];
  isSickLeaveSaved: boolean = false;
  CompanionSehaSickLeaveNo: string = '0';
  SehaSickLeaveNo: string = '0';

  constructor(private fb: FormBuilder, private config: ConfigService, private router: Router, public datepipe: DatePipe, private modalSvc: NgbModal, private us: UtilityService) {
    this.langData = this.config.getLangData();
    this.lang = sessionStorage.getItem("lang");
    this.sickleaveForm = this.fb.group({
      AdmissionID: [''],
      FromDate: [''],
      Todate: [''],
      Diagnosis: [''],
      Diagnosis2l: [''],
      Treatment: [''],
      Treatment2l: [''],
      Advice: [''],
      Advice2l: [''],
      AttendingDoctor: [''],
      PhysicianName: ['0'],
      BadgeNumber: [''],
      BadgeNumber2l: [''],
      PlaceOfWork: [''],
      HospitalDoctor: [''],
      PlaceOfWork2L: [''],
      Approvalbydirector: [''],
      Approvalbydirector2l: [''],
      Occupation: [''],
      Occupation2L: [''],
      ApplicationDate: [''],
      ReferenceNumber: [''],
      Employer: [''],
      Employer2l: [''],
      Sickleavefor: [''],
      VisitDate: [''],
      VisitDateTime: [''],
      CompanyName: [''],
      IsCompanion: [false],
      PrintType: [''],
      DischargeDate: [''],
      VisitID: ['0'],
      SickleaveTypeID: ['0'],
      CompanionSehaTypeID: ['0'],
      RelationShipID: ['0'],
      CompanionSSN: [''],
      CompanionDOB: [''],
      CompanionNationalityID: ['0'],
      CompanionMobileNo: [''],

      PatientEmployeeren: [''],
      PatientEmployeerAr: [''],
      PatientJobEn: [''],
      PatientJobAr: [''],
      CompanionEmployeeren: [''],
      CompanionEmployeerAr: [''],
      CompanionJobEn: [''],
      CompanionJobAr: [''],
      Companionleavefor: [''],
      CompanionSickLeaveIssuedDate: [''],
      CheckInTime: [],
      CheckOutTime: [],
      TotalHours: [0],
      CompanionCheckInTime: [],
      CompanionCheckOutTime: [],
      CompanionTotalHours: [0],
    });

    this.tablePatientSickLeaveForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });
    this.tableCompanionSickLeaveForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });
    var wm = new Date();
    wm.setMonth(wm.getMonth() - 3);
    this.tablePatientsForm = this.fb.group({
      FromDate: wm,
      ToDate: new Date()
    });
  }

  ngOnInit(): void {
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospId = sessionStorage.getItem("hospitalId");
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.PatientID = this.selectedView.PatientID;
    this.AdmissionID = this.selectedView.AdmissionID == undefined ? this.selectedView.IPID : this.selectedView.AdmissionID;
    if (this.selectedView.PatientType == "2") {
      this.AdmissionID = this.selectedView.IPID;
    }
    if (sessionStorage.getItem("ISEpisodeclose") === "true") {
      this.endofEpisode = true;
    } else {
      this.endofEpisode = false;
    }
    if (this.data) {
      this.showClose = this.data.showClose;
      this.showSSN = this.data.showSSN;
    }
    if (this.router.url.includes('home/sickleave')) {
      this.isDirectOpen = true;
    }
    if (this.isDirectOpen) {
      this.showSSN = true;
    }
    this.patientType = this.selectedView.PatientType;
    if (!this.showSSN) {
      this.GetPatientVisits(this.PatientID, this.selectedView.PatientType);
    }
    this.FetchSehaSickLeaveTypes();
    this.FetchAdminMasters();
  }

  FetchAdminMasters() {
    const url = this.us.getApiUrl(sickleave.FetchAdminMasters, { UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospId });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.Nationalities = response.AdminMastersInstructionsDataList;
        }
      },
        (err) => {

        })
  }

  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.fetchPatientDetailsBySsn(event);
    }
  }

  FetchSehaSickLeaveTypes() {
    const url = this.us.getApiUrl(sickleave.FetchSehaSickLeaveTypes, {
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospId,
    });

    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.SickLeaveRelationMDataList = response.SickLeaveRelationMDataList;
        this.SickLeaveTypeOPDataList = response.SickLeaveTypeOPDataList;
        this.SickLeaveTypeIPDataList = response.SickLeaveTypeIPDataList;

      }
    });
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
    var url = this.us.getApiUrl(sickleave.fetchPatientDataBySsn, {
      SSN: ssn,
      PatientID: patientId,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospId,
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.isPatientSelected = true;
          this.PatientID = response.FetchPatientDataCCList[0]?.PatientID;
          this.us.setAlertPatientId(this.PatientID);
          this.selectedView = response.FetchPatientDataCCList[0];
          if (this.selectedView.PatientType == "2") {
            if (this.selectedView?.Bed.includes('ISO'))
              this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
            else
              this.SelectedViewClass = "m-0 fw-bold alert_animate token";
          } else {
            this.SelectedViewClass = "m-0 fw-bold alert_animate token";
          }
          this.GetPatientVisits(0, 0);
        }
      },
        (err) => {

        })
  }


  GetPatientVisits(PatientId: any, PatientType: any) {
    this.config.fetchPatientVisitsforSickLeave(this.PatientID, this.patientType)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientVisits = response.SickLeavePatientVisitsDataList;
          this.PatientID = this.patientVisits[0]?.PatientID;
          this.GetPrimaryDoctor();
          //this.LoadVisitsSickLeaveData(this.AdmissionID);
          if (!this.showSSN) {
            this.GetSavedPatientSickLeave(this.AdmissionID);
          } 
          else if (this.patientVisits[this.patientVisits.length - 1]?.AdmissionID) {
            this.GetSavedPatientSickLeave(this.patientVisits[this.patientVisits.length - 1]?.AdmissionID);
            this.fetchPatientVistitInfo(this.patientVisits[this.patientVisits.length - 1]?.AdmissionID, this.PatientID);
          }
          this.sickleaveForm.get('PhysicianName')?.setValue(this.doctorDetails[0].EmpId);
          //this.sickleaveForm.get('VisitID')?.setValue(this.AdmissionID.toString());
        }
      },
        (err) => {

        })
  }
  fetchPatientVistitInfo(admissionid: any, patientid: any) {
    const url = this.us.getApiUrl(patientfolder.FetchPatientVistitInfo, { Patientid: patientid, Admissionid: admissionid, HospitalID: this.hospId });
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
  GetPrimaryDoctor() {
    this.config.fetchPrimaryDoctor(this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.primaryDoctors = response.PrimaryDoctorDataList;
        }
      },
        (err) => {

        })
  }
  saveSickLeaveCompanion() {
    const fromdate = moment(this.tablePatientSickLeaveForm.get('FromDate')?.value).add(-1);
    const todate = moment(this.tablePatientSickLeaveForm.get('ToDate')?.value);
    const diffInDays = Math.ceil(Math.abs(<any>fromdate - <any>todate) / (1000 * 60 * 60 * 24));
    if (this.selectedView.PatientType == '1' && diffInDays > 30) {
      this.validationMsg = "Sick Leave should be allowed to take within 30 days.";
      $("#sickLeavevalidationMsg").modal('show');
      return;
    }
    if (this.sickleaveForm.get('Advice')?.value) {
      const advice: string = (this.sickleaveForm.get('Advice')?.value || '').trim();
      if (advice.length < 10) {
        this.validationMsg = "Please enter Companion Text more that 10 characters";
        $("#sickLeavevalidationMsg").modal('show');
        return;
      }
      if (advice.indexOf('....') === 0) {
        this.validationMsg = "Please enter proper Companion Text";
        $("#sickLeavevalidationMsg").modal('show');
        return;
      }
    }

    // if (this.doctorDetails[0].SICKLEAVESEHANEW === 'YES' && this.selectedView.PatientType == '1' && this.sickleaveForm.get('SickleaveTypeID')?.value.toString() === '0') {
    //   this.validationMsg = "Please select Type";
    //   $("#sickLeavevalidationMsg").modal('show');
    //   return;
    // }

    if (this.doctorDetails[0].SICKLEAVESEHANEW === 'YES' && this.isCompanion && this.selectedView.PatientType == '1') {
      if (this.isCompanion && this.sickleaveForm.get('CompanionSehaTypeID')?.value.toString() === '0') {
        this.validationMsg = "Please select Companion Type";
        $("#sickLeavevalidationMsg").modal('show');
        return;
      }

      if (this.sickleaveForm.get('RelationShipID')?.value.toString() === '0') {
        this.validationMsg = "Please select Relationship";
        $("#sickLeavevalidationMsg").modal('show');
        return;
      }
      if (this.sickleaveForm.get('CompanionDOB')?.value === '' || this.sickleaveForm.get('CompanionSSN')?.value === '') {
        this.validationMsg = "Please enter Companion SSN and DOB";
        $("#sickLeavevalidationMsg").modal('show');
        return;
      }
      if (this.sickleaveForm.get('CompanionNationalityID')?.value === '0' || this.sickleaveForm.get('CompanionMobileNo')?.value === '') {
        this.validationMsg = "Please enter Companion Nationality and Mobile No";
        $("#sickLeavevalidationMsg").modal('show');
        return;
      }
    }

    if (this.sickleaveForm.valid) {
      const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.saveDataCompanion();
        }
        modalRef.close();
      });
    }
  }

   saveSickLeave() {
    const fromdate = moment(this.tablePatientSickLeaveForm.get('FromDate')?.value).add(-1);
    const todate = moment(this.tablePatientSickLeaveForm.get('ToDate')?.value);
    const diffInDays = Math.ceil(Math.abs(<any>fromdate - <any>todate) / (1000 * 60 * 60 * 24));
    if (this.selectedView.PatientType == '1' && diffInDays > 30) {
      this.validationMsg = "Sick Leave should be allowed to take within 30 days.";
      $("#sickLeavevalidationMsg").modal('show');
      return;
    }
    if (this.sickleaveForm.get('Advice')?.value) {
      const advice: string = (this.sickleaveForm.get('Advice')?.value || '').trim();
      if (advice.length < 10) {
        this.validationMsg = "Please enter Companion Text more that 10 characters";
        $("#sickLeavevalidationMsg").modal('show');
        return;
      }
      if (advice.indexOf('....') === 0) {
        this.validationMsg = "Please enter proper Companion Text";
        $("#sickLeavevalidationMsg").modal('show');
        return;
      }
    }

    if (this.doctorDetails[0].SICKLEAVESEHANEW === 'YES' && this.selectedView.PatientType == '1' && this.sickleaveForm.get('SickleaveTypeID')?.value.toString() === '0') {
      this.validationMsg = "Please select Type";
      $("#sickLeavevalidationMsg").modal('show');
      return;
    }

    if (this.doctorDetails[0].SICKLEAVESEHANEW === 'YES' && this.isCompanion && this.selectedView.PatientType == '1') {
      if (this.isCompanion && this.sickleaveForm.get('CompanionSehaTypeID')?.value.toString() === '0') {
        this.validationMsg = "Please select Companion Type";
        $("#sickLeavevalidationMsg").modal('show');
        return;
      }

      if (this.sickleaveForm.get('RelationShipID')?.value.toString() === '0') {
        this.validationMsg = "Please select Relationship";
        $("#sickLeavevalidationMsg").modal('show');
        return;
      }
      if (this.sickleaveForm.get('CompanionDOB')?.value === '' || this.sickleaveForm.get('CompanionSSN')?.value === '') {
        this.validationMsg = "Please enter Companion SSN and DOB";
        $("#sickLeavevalidationMsg").modal('show');
        return;
      }
      if (this.sickleaveForm.get('CompanionNationalityID')?.value === '0' || this.sickleaveForm.get('CompanionMobileNo')?.value === '') {
        this.validationMsg = "Please enter Companion Nationality and Mobile No";
        $("#sickLeavevalidationMsg").modal('show');
        return;
      }
    }

    if (this.sickleaveForm.valid) {
      const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.saveData();
        }
        modalRef.close();
      });
    }
  }

  saveData() {
    let isCompanion = this.isCompanion;
    let payload = {
      "SickLeaveID": 0,
      "PatientID": this.PatientID,
      "AdmissionID": this.sickleaveForm.get('AdmissionID')?.value,
      "FromDate": this.datepipe.transform(this.tablePatientSickLeaveForm.value['FromDate'], "dd-MMM-yyyy")?.toString(),
      "Todate": this.datepipe.transform(this.tablePatientSickLeaveForm.value['ToDate'], "dd-MMM-yyyy")?.toString(),
      "DoctorID": this.selectedView.ConsultantID == undefined ? this.selectedView.DoctorID : this.selectedView.ConsultantID,//this.doctorDetails[0].EmpId,
      "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId ?? 0,
      "Diagnosis": this.sickleaveForm.get('Diagnosis')?.value,
      "Diagnosis2l": this.sickleaveForm.get('Diagnosis2l')?.value,
      "Treatment": this.sickleaveForm.get('Treatment')?.value,
      "Treatment2l": this.sickleaveForm.get('Treatment2l')?.value,
      "Advice": this.sickleaveForm.get('Advice')?.value,
      "Advice2l": this.sickleaveForm.get('Advice2l')?.value,
      "BadgeNumber": this.sickleaveForm.get('BadgeNumber')?.value,
      "BadgeNumber2l": this.sickleaveForm.get('BadgeNumber2l')?.value,
      "PlaceOfWork": this.sickleaveForm.get('PlaceOfWork')?.value,
      "PlaceOfWork2L": this.sickleaveForm.get('PlaceOfWork2L')?.value,
      "Approvalbydirector": this.sickleaveForm.get('Approvalbydirector')?.value,
      "Approvalbydirector2l": this.sickleaveForm.get('Approvalbydirector2l')?.value,
      "Occupation": this.sickleaveForm.get('Occupation')?.value,
      "Occupation2L": this.sickleaveForm.get('Occupation2L')?.value,
      "ApplicationDate": this.sickleaveForm.get('ApplicationDate')?.value,
      "ReferenceNumber": this.sickleaveForm.get('ReferenceNumber')?.value,
      "Employer": this.sickleaveForm.get('Employer')?.value,
      "Employer2l": this.sickleaveForm.get('Employer2l')?.value,
      "PrintType": "1",
      "HospitalID": this.hospId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      'IsCompanion': isCompanion,
      "IssuerID": this.doctorDetails[0].EmpId,
      "PatientTypeID": this.patientType,
      "SickleaveTypeID": this.sickleaveForm.get('SickleaveTypeID')?.value,
      "RelationShipID": (this.sickleaveForm.get('RelationShipID')?.value == null || this.sickleaveForm.get('RelationShipID')?.value == '') ? '0' : this.sickleaveForm.get('RelationShipID')?.value,
      "VisitDate": this.sickleaveForm.get('VisitDate')?.value,
      "VisitDateTime": this.sickleaveForm.get('VisitDateTime')?.value,
      "CompanionSehaTypeID": this.isCompanion ? this.sickleaveForm.get('CompanionSehaTypeID')?.value : '0',
      "CompanionDOB": this.isCompanion ?
        this.datepipe.transform(this.sickleaveForm.get('CompanionDOB')?.value, "dd-MMM-yyyy")?.toString() : '',
      "CompanionSSN": this.isCompanion ? this.sickleaveForm.get('CompanionSSN')?.value : '',
      "CompanionNationalityID": this.isCompanion ? this.sickleaveForm.get('CompanionNationalityID')?.value : '0',
      "CompanionMobileNo": this.isCompanion ? this.sickleaveForm.get('CompanionMobileNo')?.value : '',
      "PatientEmployeeren": this.sickleaveForm.get('PatientEmployeeren')?.value,
      "PatientEmployeerAr": this.sickleaveForm.get('PatientEmployeerAr')?.value,
      "PatientJobEn": this.sickleaveForm.get('PatientJobEn')?.value,
      "PatientJobAr": this.sickleaveForm.get('PatientJobAr')?.value,
      "CompanionEmployeeren": this.sickleaveForm.get('CompanionEmployeeren')?.value,
      "CompanionEmployeerAr": this.sickleaveForm.get('CompanionEmployeerAr')?.value,
      "CompanionJobEn": this.sickleaveForm.get('CompanionJobEn')?.value,
      "CompanionJobAr": this.sickleaveForm.get('CompanionJobAr')?.value,
      "CompanionFromDate": this.datepipe.transform(this.tableCompanionSickLeaveForm.get('FromDate')?.value, "dd-MMM-yyyy")?.toString(),
      "CompanionToDate": this.datepipe.transform(this.tableCompanionSickLeaveForm.get('ToDate')?.value, "dd-MMM-yyyy")?.toString(),
      "CompanionCheckin": this.isCompanion && (this.sickleaveForm.get('CompanionSehaTypeID')?.value == 8 || this.sickleaveForm.get('CompanionSehaTypeID')?.value == 9) ? this.datepipe.transform(this.tableCompanionSickLeaveForm.value['FromDate'], "dd-MMM-yyyy")?.toString() + ' ' + this.sickleaveForm.get('CompanionCheckInTime')?.value : '0',
      "CompanionCheckout": this.isCompanion && (this.sickleaveForm.get('CompanionSehaTypeID')?.value == 8 || this.sickleaveForm.get('CompanionSehaTypeID')?.value == 9) ? this.datepipe.transform(this.tableCompanionSickLeaveForm.value['FromDate'], "dd-MMM-yyyy")?.toString() + ' ' + this.sickleaveForm.get('CompanionCheckOutTime')?.value : '0',
      "CompanionTotalHours": this.isCompanion && (this.sickleaveForm.get('CompanionSehaTypeID')?.value == 8 || this.sickleaveForm.get('CompanionSehaTypeID')?.value == 9) ? this.sickleaveForm.get('CompanionTotalHours')?.value : '0',
      "Checkin": this.sickleaveForm.get('SickleaveTypeID')?.value == 8 ? this.datepipe.transform(this.tablePatientSickLeaveForm.value['FromDate'], "dd-MMM-yyyy")?.toString() + ' ' + this.sickleaveForm.get('CheckInTime')?.value : '0',
      "Checkout": this.sickleaveForm.get('SickleaveTypeID')?.value == 8 ? this.datepipe.transform(this.tablePatientSickLeaveForm.value['FromDate'], "dd-MMM-yyyy")?.toString() + ' ' + this.sickleaveForm.get('CheckOutTime')?.value : '0',
      "TotalHours": this.sickleaveForm.get('SickleaveTypeID')?.value == 8 ? this.sickleaveForm.get('TotalHours')?.value : '0'
    };
    const url = this.doctorDetails[0].SICKLEAVESEHANEW === 'YES' && this.selectedView.PatientType == '1' ? 'SaveSickLeaveNewSeha' : 'SaveSickLeave'
    this.us.post(url, payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#sickLeaveSaveMsg").modal('show');
          //this.GetSavedPatientSickLeave(this.sickleaveForm.get('AdmissionID')?.value);
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }
  saveDataCompanion() {
    let isCompanion = this.isCompanion;
    let payload = {
      "SickLeaveID": 0,
      "PatientID": this.PatientID,
      "AdmissionID": this.sickleaveForm.get('AdmissionID')?.value,
      "FromDate": this.datepipe.transform(this.tablePatientSickLeaveForm.value['FromDate'], "dd-MMM-yyyy")?.toString(),
      "Todate": this.datepipe.transform(this.tablePatientSickLeaveForm.value['ToDate'], "dd-MMM-yyyy")?.toString(),
      "DoctorID": this.selectedView.ConsultantID == undefined ? this.selectedView.DoctorID : this.selectedView.ConsultantID,//this.doctorDetails[0].EmpId,
      "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId ?? 0,
      "Diagnosis": this.sickleaveForm.get('Diagnosis')?.value,
      "Diagnosis2l": this.sickleaveForm.get('Diagnosis2l')?.value,
      "Treatment": this.sickleaveForm.get('Treatment')?.value,
      "Treatment2l": this.sickleaveForm.get('Treatment2l')?.value,
      "Advice": this.sickleaveForm.get('Advice')?.value,
      "Advice2l": this.sickleaveForm.get('Advice2l')?.value,
      "BadgeNumber": this.sickleaveForm.get('BadgeNumber')?.value,
      "BadgeNumber2l": this.sickleaveForm.get('BadgeNumber2l')?.value,
      "PlaceOfWork": this.sickleaveForm.get('PlaceOfWork')?.value,
      "PlaceOfWork2L": this.sickleaveForm.get('PlaceOfWork2L')?.value,
      "Approvalbydirector": this.sickleaveForm.get('Approvalbydirector')?.value,
      "Approvalbydirector2l": this.sickleaveForm.get('Approvalbydirector2l')?.value,
      "Occupation": this.sickleaveForm.get('Occupation')?.value,
      "Occupation2L": this.sickleaveForm.get('Occupation2L')?.value,
      "ApplicationDate": this.sickleaveForm.get('ApplicationDate')?.value,
      "ReferenceNumber": this.sickleaveForm.get('ReferenceNumber')?.value,
      "Employer": this.sickleaveForm.get('Employer')?.value,
      "Employer2l": this.sickleaveForm.get('Employer2l')?.value,
      "PrintType": "1",
      "HospitalID": this.hospId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      'IsCompanion': isCompanion,
      "IssuerID": this.doctorDetails[0].EmpId,
      "PatientTypeID": this.patientType,
      "SickleaveTypeID": this.sickleaveForm.get('SickleaveTypeID')?.value,
      "RelationShipID": (this.sickleaveForm.get('RelationShipID')?.value == null || this.sickleaveForm.get('RelationShipID')?.value == '') ? '0' : this.sickleaveForm.get('RelationShipID')?.value,
      "VisitDate": this.sickleaveForm.get('VisitDate')?.value,
      "VisitDateTime": this.sickleaveForm.get('VisitDateTime')?.value,
      "CompanionSehaTypeID": this.isCompanion ? this.sickleaveForm.get('CompanionSehaTypeID')?.value : '0',
      "CompanionDOB": this.isCompanion ?
        this.datepipe.transform(this.sickleaveForm.get('CompanionDOB')?.value, "dd-MMM-yyyy")?.toString() : '',
      "CompanionSSN": this.isCompanion ? this.sickleaveForm.get('CompanionSSN')?.value : '',
      "CompanionNationalityID": this.isCompanion ? this.sickleaveForm.get('CompanionNationalityID')?.value : '0',
      "CompanionMobileNo": this.isCompanion ? this.sickleaveForm.get('CompanionMobileNo')?.value : '',
      "PatientEmployeeren": this.sickleaveForm.get('PatientEmployeeren')?.value,
      "PatientEmployeerAr": this.sickleaveForm.get('PatientEmployeerAr')?.value,
      "PatientJobEn": this.sickleaveForm.get('PatientJobEn')?.value,
      "PatientJobAr": this.sickleaveForm.get('PatientJobAr')?.value,
      "CompanionEmployeeren": this.sickleaveForm.get('CompanionEmployeeren')?.value,
      "CompanionEmployeerAr": this.sickleaveForm.get('CompanionEmployeerAr')?.value,
      "CompanionJobEn": this.sickleaveForm.get('CompanionJobEn')?.value,
      "CompanionJobAr": this.sickleaveForm.get('CompanionJobAr')?.value,
      "CompanionFromDate": this.datepipe.transform(this.tableCompanionSickLeaveForm.get('FromDate')?.value, "dd-MMM-yyyy")?.toString(),
      "CompanionToDate": this.datepipe.transform(this.tableCompanionSickLeaveForm.get('ToDate')?.value, "dd-MMM-yyyy")?.toString(),
      "CompanionCheckin": this.isCompanion && (this.sickleaveForm.get('CompanionSehaTypeID')?.value == 8 || this.sickleaveForm.get('CompanionSehaTypeID')?.value == 9) ? this.datepipe.transform(this.tableCompanionSickLeaveForm.value['FromDate'], "dd-MMM-yyyy")?.toString() + ' ' + this.sickleaveForm.get('CompanionCheckInTime')?.value : '0',
      "CompanionCheckout": this.isCompanion && (this.sickleaveForm.get('CompanionSehaTypeID')?.value == 8 || this.sickleaveForm.get('CompanionSehaTypeID')?.value == 9) ? this.datepipe.transform(this.tableCompanionSickLeaveForm.value['FromDate'], "dd-MMM-yyyy")?.toString() + ' ' + this.sickleaveForm.get('CompanionCheckOutTime')?.value : '0',
      "CompanionTotalHours": this.isCompanion && (this.sickleaveForm.get('CompanionSehaTypeID')?.value == 8 || this.sickleaveForm.get('CompanionSehaTypeID')?.value == 9) ? this.sickleaveForm.get('CompanionTotalHours')?.value : '0',
      "Checkin": this.sickleaveForm.get('SickleaveTypeID')?.value == 8 ? this.datepipe.transform(this.tablePatientSickLeaveForm.value['FromDate'], "dd-MMM-yyyy")?.toString() + ' ' + this.sickleaveForm.get('CheckInTime')?.value : '0',
      "Checkout": this.sickleaveForm.get('SickleaveTypeID')?.value == 8 ? this.datepipe.transform(this.tablePatientSickLeaveForm.value['FromDate'], "dd-MMM-yyyy")?.toString() + ' ' + this.sickleaveForm.get('CheckOutTime')?.value : '0',
      "TotalHours": this.sickleaveForm.get('SickleaveTypeID')?.value == 8 ? this.sickleaveForm.get('TotalHours')?.value : '0'
    };
    const url = this.doctorDetails[0].SICKLEAVESEHANEW === 'YES' && this.selectedView.PatientType == '1' ? 'SaveSickLeaveNewSehaCompanion' : 'SaveSickLeave'
    this.us.post(url, payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#sickLeaveSaveMsg").modal('show');
          //this.GetSavedPatientSickLeave(this.sickleaveForm.get('AdmissionID')?.value);
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }

  calculateCompanionSickDays() {
    let fromdate = moment(this.tableCompanionSickLeaveForm.get('FromDate')?.value).startOf('day');
    let todate = moment(this.tableCompanionSickLeaveForm.get('ToDate')?.value).endOf('day');
    const diffInDays = Math.ceil(Math.abs(<any>fromdate - <any>todate) / (1000 * 60 * 60 * 24));
    $("#Companionleavefor").val(diffInDays);
    this.sickleaveForm.patchValue({
      Companionleavefor: diffInDays
    })
  }

  calculateSickDays() {
    let fromdate = moment(this.tablePatientSickLeaveForm.get('FromDate')?.value);
    let todate = moment(this.tablePatientSickLeaveForm.get('ToDate')?.value);

    var disdate = this.sickleaveForm.get('DischargeDate')?.value;
    var visitdate = this.sickleaveForm.get('VisitDate')?.value;

    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'days').startOf('day');
    const selectedFromDate = moment(this.tablePatientSickLeaveForm.get('FromDate')?.value).startOf('day');



    const admid = this.sickleaveForm.get("VisitID")?.value;
    const visit = this.patientVisits.find((x: any) => x.AdmissionID == admid);
    const visitDate = new Date(visit.AdmitDate);
    visitDate.setDate(visitDate.getDate() + 1);

    const selctedFrmDate = new Date(this.tablePatientSickLeaveForm.get('FromDate')?.value);

    if (!this.isCompanion && selctedFrmDate > visitDate) {
      this.validationMsg = "Sick Leave Start Date should be Current Day or the Next Day";
      $("#sickLeavevalidationMsg").modal('show');
      this.tablePatientSickLeaveForm.patchValue({
        FromDate: moment(new Date(visit.AdmitDate)),
        ToDate: moment(this.sickleaveForm.get('ToDate')?.value)
      })
    }

    // if (!selectedFromDate.isSame(today, 'day') && !selectedFromDate.isSame(tomorrow, 'day')) {
    //   this.validationMsg = "From date should be Today or Tomorrow";
    //   $("#sickLeavevalidationMsg").modal('show');
    //   this.tablePatientSickLeaveForm.patchValue({
    //     FromDate: new Date(),
    //     ToDate: new Date()
    //   })
    // }
    // else 
    if (disdate != null && moment(disdate).format('yyyy-MM-DD') < moment(fromdate).format('yyyy-MM-DD')) {
      this.validationMsg = "From date cannot be greater than Discharge date";
      $("#sickLeavevalidationMsg").modal('show');
      this.tablePatientSickLeaveForm.patchValue({
        FromDate: moment(this.sickleaveForm.get('FromDate')?.value),
        ToDate: moment(this.sickleaveForm.get('ToDate')?.value)
      })
    }

    fromdate = moment(this.tablePatientSickLeaveForm.get('FromDate')?.value).add(-1);
    todate = moment(this.tablePatientSickLeaveForm.get('ToDate')?.value);
    this.diffInDays = Math.ceil(Math.abs(<any>fromdate - <any>todate) / (1000 * 60 * 60 * 24));
    $("#Sickleavefor").val(this.diffInDays);
    this.sickleaveForm.patchValue({
      Sickleavefor: this.diffInDays
    });

    if (this.selectedView.PatientType == '1' && this.diffInDays > 30) {
      this.validationMsg = "Sick Leave should be allowed to take within 30 days.";
      $("#sickLeavevalidationMsg").modal('show');
    }
  }
  onChangeSickLeaveVisit(event: any) {
    this.LoadVisitsSickLeaveData(event.target.value);
  }
  LoadVisitsSickLeaveData(VisitId: any) {
    let find = this.patientVisits.filter((x: any) => x?.AdmissionID == VisitId);
    this.AdmissionID = VisitId;
    if (find.length > 0) {
      var fd = new Date(find[0].VisitDate);
      var td = new Date();
      this.tablePatientSickLeaveForm.patchValue({
        FromDate: fd,
        ToDate: td
      })
      this.tableCompanionSickLeaveForm.patchValue({
        FromDate: new Date(),
        ToDate: new Date()
      });
      let fromdate = moment(this.tablePatientSickLeaveForm.get('FromDate')?.value).add(-1);
      let todate = moment(this.tablePatientSickLeaveForm.get('ToDate')?.value);
      this.diffInDays = Math.ceil(Math.abs(<any>fromdate - <any>todate) / (1000 * 60 * 60 * 24));

      $("#Sickleavefor").val(this.diffInDays);

      if (this.selectedView.PatientType == '1' && this.diffInDays > 30) {
        this.validationMsg = "Sick Leave should be allowed to take within 30 days.";
        $("#sickLeavevalidationMsg").modal('show');
      }

      let fromdate1 = moment(this.tableCompanionSickLeaveForm.get('FromDate')?.value).add(-1);
      let todate1 = moment(this.tableCompanionSickLeaveForm.get('ToDate')?.value);
      const diffInDays1 = Math.ceil(Math.abs(<any>fromdate1 - <any>todate1) / (1000 * 60 * 60 * 24));

      $("#Companionleavefor").val(diffInDays1);
      this.sickleaveForm.patchValue({
        Companionleavefor: diffInDays1
      })

      // this.sickleaveForm.get('VisitID')?.setValue(Number(find[0].AdmissionID));
      this.sickleaveForm.patchValue({
        VisitID: find[0].AdmissionID
      })
      this.sickleaveForm.get('VisitDate')?.setValue(find[0].VisitDate);
      this.sickleaveForm.get('VisitDateTime')?.setValue(find[0].VisitDateTime);
      this.sickleaveForm.get('AdmissionID')?.setValue(find[0].AdmissionID);
      this.sickleaveForm.get('AttendingDoctor')?.setValue(find[0].ConsultantName);
      this.sickleaveForm.get('HospitalDoctor')?.setValue(find[0].HospitalDirector);
      this.sickleaveForm.get('Approvalbydirector')?.setValue(find[0].HospitalDirector);
      this.sickleaveForm.get('Approvalbydirector2l')?.setValue(find[0].HospitalDirector2l);
      this.sickleaveForm.get('DischargeDate')?.setValue(find[0].DischargeDate == null ? find[0].DischargeDate : "");
      this.sickleaveForm.get('ApplicationDate')?.setValue(moment(new Date()).format('DD-MMM-yyyy'));
      this.sickleaveForm.get('FromDate')?.setValue(fromdate);
      this.sickleaveForm.get('ToDate')?.setValue(todate);
      this.isCompanion = false;
      this.isCompanionDisable = false;
      this.config.fetchAdviceDiagnosis(this.AdmissionID, this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
            var diag = "";
            response.PatientDiagnosisDataList.forEach((element: any, index: any) => {
              if (diag != "")
                diag = diag + "\n" + response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
              else
                diag = response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
            });
            this.sickleaveForm.get('Diagnosis')?.setValue(diag);
          }
        },
          (err) => {

          })
      if (this.showSSN) {
        this.fetchPatientVistitInfo(this.AdmissionID, this.PatientID);
      }
      this.BindSavedPatientSickLeave(find[0].AdmissionID);
    }
  }
  GetSavedPatientSickLeave(AdmissionID: any) {
    this.config.fetchPatientSickLeave(AdmissionID)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientSickLeaveDataList.length > 0) {
          let firstSickLeaveData: any;
          if (this.selectedView.PatientType == '1') {
            firstSickLeaveData = response.PatientSickLeaveDataList[0];
            //this.isCompanionDisable = true;
          } else {
            firstSickLeaveData = response.PatientSickLeaveDataList.filter((element: any) => element.IsCompanion !== 'True')[0];
          }
          if (!firstSickLeaveData) {
            this.LoadVisitsSickLeaveData(AdmissionID);
            return;
          }
          this.isSickLeaveSaved = true;
          var fd = new Date(moment(firstSickLeaveData.FromDate).format('MM-DD-YYYY'));
          var td = new Date(moment(firstSickLeaveData.Todate).format('MM-DD-YYYY'));
          this.tablePatientSickLeaveForm.patchValue({
            FromDate: fd,
            ToDate: td
          })
          let fromdate = moment(this.tablePatientSickLeaveForm.get('FromDate')?.value).add(-1);
          let todate = moment(this.tablePatientSickLeaveForm.get('ToDate')?.value);
          this.diffInDays = Math.ceil(Math.abs(<any>fromdate - <any>todate) / (1000 * 60 * 60 * 24));
          $("#Sickleavefor").val(this.diffInDays);
          this.sickLeaveId = firstSickLeaveData.SickLeaveID;
          // this.sickleaveForm.get('VisitID')?.setValue(Number(firstSickLeaveData.AdmissionID));
          this.sickleaveForm.patchValue({
            VisitID: firstSickLeaveData.AdmissionID
          })
          this.sickleaveForm.get('AdmissionID')?.setValue(firstSickLeaveData.AdmissionID);
          this.sickleaveForm.get('FromDate')?.setValue(firstSickLeaveData.FromDate);
          this.sickleaveForm.get('ToDate')?.setValue(firstSickLeaveData.Todate);
          this.sickleaveForm.get('Diagnosis')?.setValue(firstSickLeaveData.Diagnosis);
          this.sickleaveForm.get('Diagnosis2L')?.setValue(firstSickLeaveData.Diagnosis2L);
          this.sickleaveForm.get('Treatment')?.setValue(firstSickLeaveData.Treatment);
          this.sickleaveForm.get('Advice')?.setValue(firstSickLeaveData.Advice);
          this.sickleaveForm.get('Advice2l')?.setValue(firstSickLeaveData.Advice2l);
          this.sickleaveForm.get('DoctorName')?.setValue(firstSickLeaveData.DoctorName);
          this.sickleaveForm.get('BadgeNumber')?.setValue(firstSickLeaveData.BadgeNumber);
          this.sickleaveForm.get('BadgeNumber2l')?.setValue(firstSickLeaveData.BadgeNumber2l);
          this.sickleaveForm.get('PlaceOfWork')?.setValue(firstSickLeaveData.PlaceOfWork);
          this.sickleaveForm.get('Approvalbydirector')?.setValue(firstSickLeaveData.Approvalbydirector);
          this.sickleaveForm.get('PlaceOfWork2l')?.setValue(firstSickLeaveData.PlaceOfWork2l);
          this.sickleaveForm.get('Approvalbydirector2L')?.setValue(firstSickLeaveData.Approvalbydirector2L);
          this.sickleaveForm.get('Occupation')?.setValue(firstSickLeaveData.Occupation);
          this.sickleaveForm.get('Occupation2L')?.setValue(firstSickLeaveData.Occupation2L);
          this.sickleaveForm.get('ApplicationDate')?.setValue(this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString());
          this.sickleaveForm.get('CompanyName')?.setValue(firstSickLeaveData.CompanyName);
          this.sickleaveForm.get('ReferenceNumber')?.setValue(firstSickLeaveData.ReferenceNumber);
          this.sickleaveForm.get('Employer')?.setValue(firstSickLeaveData.Employer);
          this.sickleaveForm.get('Employer2l')?.setValue(firstSickLeaveData.Employer2l);
          this.sickleaveForm.get('DischargeDate')?.setValue(firstSickLeaveData.DischargeDate);
          this.sickleaveForm.get('VisitDate')?.setValue(firstSickLeaveData.VisitDate);

          this.sickleaveForm.get('SickleaveTypeID')?.setValue(firstSickLeaveData.SehaSickLeaveTypeID);
          this.sickleaveForm.get('RelationShipID')?.setValue(firstSickLeaveData.SehaRelationShipID ? firstSickLeaveData.SehaRelationShipID : '0');
          this.sickleaveForm.get('CompanionSSN')?.setValue(firstSickLeaveData.CompanionSSN);
          this.sickleaveForm.get('CompanionDOB')?.setValue(firstSickLeaveData.CompanionDOB);
          this.sickleaveForm.get('CompanionNationalityID')?.setValue(firstSickLeaveData.CompanionNationalityID);
          this.sickleaveForm.get('CompanionMobileNo')?.setValue(firstSickLeaveData.CompanionMobileNo);


          this.sickleaveForm.get('PatientEmployeeren')?.setValue(firstSickLeaveData.PatientEmployeeren);
          this.sickleaveForm.get('PatientEmployeerAr')?.setValue(firstSickLeaveData.PatientEmployeerAr);
          this.sickleaveForm.get('PatientJobEn')?.setValue(firstSickLeaveData.PatientJobEn);
          this.sickleaveForm.get('PatientJobAr')?.setValue(firstSickLeaveData.PatientJobAr);
          this.sickleaveForm.get('CompanionEmployeeren')?.setValue(firstSickLeaveData.CompanionEmployeeren);
          this.sickleaveForm.get('CompanionEmployeerAr')?.setValue(firstSickLeaveData.CompanionEmployeerAr);
          this.sickleaveForm.get('CompanionJobEn')?.setValue(firstSickLeaveData.CompanionJobEn);
          this.sickleaveForm.get('CompanionJobAr')?.setValue(firstSickLeaveData.CompanionJobAr);

          var tdCDOB = new Date(moment(firstSickLeaveData.CompanionDOB).format('MM-DD-YYYY'));
          this.sickleaveForm.patchValue({
            CompanionDOB: tdCDOB
          });

          var fdC = firstSickLeaveData.CompanionFromDate ? new Date(moment(firstSickLeaveData.CompanionFromDate).format('MM-DD-YYYY')) : new Date();
          var tdC = firstSickLeaveData.CompanionToDate ? new Date(moment(firstSickLeaveData.CompanionToDate).format('MM-DD-YYYY')) : new Date();
          this.tableCompanionSickLeaveForm.patchValue({
            FromDate: fdC,
            ToDate: tdC
          })

          let fromdateC = moment(this.tableCompanionSickLeaveForm.get('FromDate')?.value).add(-1);
          let todateC = moment(this.tableCompanionSickLeaveForm.get('ToDate')?.value);
          this.diffInDaysC = Math.ceil(Math.abs(<any>fromdateC - <any>todateC) / (1000 * 60 * 60 * 24));
          $("#Companionleavefor").val(this.diffInDaysC);

          this.sickleaveForm.patchValue({
            Companionleavefor: this.diffInDaysC
          });

          $("#sickLeaveIssuedDate").val(firstSickLeaveData.CREATEDATE);
          $("#CompanionSickLeaveIssuedDate").val(firstSickLeaveData.CREATEDATE);
          this.sickleaveForm.patchValue({
            CompanionSickLeaveIssuedDate: firstSickLeaveData.CREATEDATE
          })
          $("#SickLeaveNo").val(firstSickLeaveData.SickLeaveNo);
          $("#SehaSickLeaveNo").val(firstSickLeaveData.SehaSickLeaveNo);
          $("#CompanionSehaSickLeaveNo").val(firstSickLeaveData.CompanionSehaSickLeaveNo);
          this.CompanionSehaSickLeaveNo = firstSickLeaveData.CompanionSehaSickLeaveNo;
          this.SehaSickLeaveNo = firstSickLeaveData.SehaSickLeaveNo;
          let find = this.patientVisits.filter((x: any) => x?.AdmissionID == firstSickLeaveData.AdmissionID);

          if (find.length > 0) {
            this.sickleaveForm.get('HospitalDoctor')?.setValue(find[0].HospitalDirector);
            this.sickleaveForm.get('Approvalbydirector')?.setValue(find[0].HospitalDirector);
            this.sickleaveForm.get('Approvalbydirector2l')?.setValue(find[0].HospitalDirector2l);
            this.sickleaveForm.get('AttendingDoctor')?.setValue(find[0].ConsultantName);
            this.sickleaveForm.get('HospitalDoctor')?.setValue(find[0].HospitalDirector);
            // this.sickleaveForm.get('PhysicianName')?.setValue(this.doctorDetails[0].EmpId);
            this.sickleaveForm.patchValue({
              PhysicianName: this.doctorDetails[0].EmpId
            })
          }
          this.sickLeaveGeneratedDates = firstSickLeaveData.FromDate + " To " + firstSickLeaveData.Todate + " by " + firstSickLeaveData.DoctorName;
          this.isCompanion = firstSickLeaveData.IsCompanion === 'True' ? true : false;
          this.isCompanionDisable = firstSickLeaveData.IsCompanion === 'False' || !firstSickLeaveData.IsCompanion ? true : false;

          this.sickleaveForm.get('CompanionSehaTypeID')?.setValue(firstSickLeaveData.CompanionSehaTypeID);
          this.sickleaveForm.get('CompanionCheckInTime')?.setValue(firstSickLeaveData.CompanionCheckin?.split(' ')[1]);
          this.sickleaveForm.get('CompanionCheckOutTime')?.setValue(firstSickLeaveData.CompanionCheckout?.split(' ')[1]);
          this.sickleaveForm.get('CompanionTotalHours')?.setValue(firstSickLeaveData.CompanionTotalHours);
          this.sickleaveForm.get('CheckInTime')?.setValue(firstSickLeaveData.Checkin?.split(' ')[1]);
          this.sickleaveForm.get('CheckOutTime')?.setValue(firstSickLeaveData.Checkout?.split(' ')[1]);
          this.sickleaveForm.get('TotalHours')?.setValue(firstSickLeaveData.TotalHours);
          this.isCompanionDisable = false;
          $("#sickLeaveAlreadyGenerateMsg").modal('show');
          this.sickleaveForm.get('VisitDateTime')?.setValue(firstSickLeaveData.VisitDate);
        }
        else {
          this.LoadVisitsSickLeaveData(AdmissionID);
        }
      },
        (err) => {

        });

  }
  BindSavedPatientSickLeave(AdmissionID: any) {
    this.config.fetchPatientSickLeave(AdmissionID)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientSickLeaveDataList.length > 0) {
          let firstSickLeaveData: any;
          if (this.selectedView.PatientType == '1') {
            firstSickLeaveData = response.PatientSickLeaveDataList[0];
            //this.isCompanionDisable = true;
          } else {
            firstSickLeaveData = response.PatientSickLeaveDataList.filter((element: any) => element.IsCompanion !== 'True')[0];
          }
          // if (!firstSickLeaveData) {
          //   this.LoadVisitsSickLeaveData(AdmissionID);
          //   return;
          // }
          this.isSickLeaveSaved = true;
          var fd = new Date(moment(firstSickLeaveData.FromDate).format('MM-DD-YYYY'));
          var td = new Date(moment(firstSickLeaveData.Todate).format('MM-DD-YYYY'));
          this.tablePatientSickLeaveForm.patchValue({
            FromDate: fd,
            ToDate: td
          })
          let fromdate = moment(this.tablePatientSickLeaveForm.get('FromDate')?.value).add(-1);
          let todate = moment(this.tablePatientSickLeaveForm.get('ToDate')?.value);
          this.diffInDays = Math.ceil(Math.abs(<any>fromdate - <any>todate) / (1000 * 60 * 60 * 24));
          $("#Sickleavefor").val(this.diffInDays);
          this.sickLeaveId = firstSickLeaveData.SickLeaveID;
          // this.sickleaveForm.get('VisitID')?.setValue(Number(firstSickLeaveData.AdmissionID));
          // this.sickleaveForm.patchValue({
          //   VisitID: firstSickLeaveData.AdmissionID
          // })
          this.sickleaveForm.get('AdmissionID')?.setValue(firstSickLeaveData.AdmissionID);
          this.sickleaveForm.get('FromDate')?.setValue(firstSickLeaveData.FromDate);
          this.sickleaveForm.get('ToDate')?.setValue(firstSickLeaveData.Todate);
          this.sickleaveForm.get('Diagnosis')?.setValue(firstSickLeaveData.Diagnosis);
          this.sickleaveForm.get('Diagnosis2L')?.setValue(firstSickLeaveData.Diagnosis2L);
          this.sickleaveForm.get('Treatment')?.setValue(firstSickLeaveData.Treatment);
          this.sickleaveForm.get('Advice')?.setValue(firstSickLeaveData.Advice);
          this.sickleaveForm.get('Advice2l')?.setValue(firstSickLeaveData.Advice2l);
          this.sickleaveForm.get('DoctorName')?.setValue(firstSickLeaveData.DoctorName);
          this.sickleaveForm.get('BadgeNumber')?.setValue(firstSickLeaveData.BadgeNumber);
          this.sickleaveForm.get('BadgeNumber2l')?.setValue(firstSickLeaveData.BadgeNumber2l);
          this.sickleaveForm.get('PlaceOfWork')?.setValue(firstSickLeaveData.PlaceOfWork);
          this.sickleaveForm.get('Approvalbydirector')?.setValue(firstSickLeaveData.Approvalbydirector);
          this.sickleaveForm.get('PlaceOfWork2l')?.setValue(firstSickLeaveData.PlaceOfWork2l);
          this.sickleaveForm.get('Approvalbydirector2L')?.setValue(firstSickLeaveData.Approvalbydirector2L);
          this.sickleaveForm.get('Occupation')?.setValue(firstSickLeaveData.Occupation);
          this.sickleaveForm.get('Occupation2L')?.setValue(firstSickLeaveData.Occupation2L);
          this.sickleaveForm.get('ApplicationDate')?.setValue(this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString());
          this.sickleaveForm.get('CompanyName')?.setValue(firstSickLeaveData.CompanyName);
          this.sickleaveForm.get('ReferenceNumber')?.setValue(firstSickLeaveData.ReferenceNumber);
          this.sickleaveForm.get('Employer')?.setValue(firstSickLeaveData.Employer);
          this.sickleaveForm.get('Employer2l')?.setValue(firstSickLeaveData.Employer2l);
          this.sickleaveForm.get('DischargeDate')?.setValue(firstSickLeaveData.DischargeDate);
          this.sickleaveForm.get('VisitDate')?.setValue(firstSickLeaveData.VisitDate);

          this.sickleaveForm.get('SickleaveTypeID')?.setValue(firstSickLeaveData.SehaSickLeaveTypeID);
          this.sickleaveForm.get('RelationShipID')?.setValue(firstSickLeaveData.SehaRelationShipID ? firstSickLeaveData.SehaRelationShipID : '0');
          this.sickleaveForm.get('CompanionSSN')?.setValue(firstSickLeaveData.CompanionSSN);
          this.sickleaveForm.get('CompanionDOB')?.setValue(firstSickLeaveData.CompanionDOB);
          this.sickleaveForm.get('CompanionNationalityID')?.setValue(firstSickLeaveData.CompanionNationalityID);
          this.sickleaveForm.get('CompanionMobileNo')?.setValue(firstSickLeaveData.CompanionMobileNo);


          this.sickleaveForm.get('PatientEmployeeren')?.setValue(firstSickLeaveData.PatientEmployeeren);
          this.sickleaveForm.get('PatientEmployeerAr')?.setValue(firstSickLeaveData.PatientEmployeerAr);
          this.sickleaveForm.get('PatientJobEn')?.setValue(firstSickLeaveData.PatientJobEn);
          this.sickleaveForm.get('PatientJobAr')?.setValue(firstSickLeaveData.PatientJobAr);
          this.sickleaveForm.get('CompanionEmployeeren')?.setValue(firstSickLeaveData.CompanionEmployeeren);
          this.sickleaveForm.get('CompanionEmployeerAr')?.setValue(firstSickLeaveData.CompanionEmployeerAr);
          this.sickleaveForm.get('CompanionJobEn')?.setValue(firstSickLeaveData.CompanionJobEn);
          this.sickleaveForm.get('CompanionJobAr')?.setValue(firstSickLeaveData.CompanionJobAr);

          var tdCDOB = new Date(moment(firstSickLeaveData.CompanionDOB).format('MM-DD-YYYY'));
          this.sickleaveForm.patchValue({
            CompanionDOB: tdCDOB
          });

          var fdC = firstSickLeaveData.CompanionFromDate ? new Date(moment(firstSickLeaveData.CompanionFromDate).format('MM-DD-YYYY')) : new Date();
          var tdC = firstSickLeaveData.CompanionToDate ? new Date(moment(firstSickLeaveData.CompanionToDate).format('MM-DD-YYYY')) : new Date();
          this.tableCompanionSickLeaveForm.patchValue({
            FromDate: fdC,
            ToDate: tdC
          })

          let fromdateC = moment(this.tableCompanionSickLeaveForm.get('FromDate')?.value).add(-1);
          let todateC = moment(this.tableCompanionSickLeaveForm.get('ToDate')?.value);
          this.diffInDaysC = Math.ceil(Math.abs(<any>fromdateC - <any>todateC) / (1000 * 60 * 60 * 24));
          $("#Companionleavefor").val(this.diffInDaysC);

          this.sickleaveForm.patchValue({
            Companionleavefor: this.diffInDaysC
          });

          $("#sickLeaveIssuedDate").val(firstSickLeaveData.CREATEDATE);
          $("#CompanionSickLeaveIssuedDate").val(firstSickLeaveData.CREATEDATE);
          this.sickleaveForm.patchValue({
            CompanionSickLeaveIssuedDate: firstSickLeaveData.CREATEDATE
          })
          $("#SickLeaveNo").val(firstSickLeaveData.SickLeaveNo);
          $("#SehaSickLeaveNo").val(firstSickLeaveData.SehaSickLeaveNo);
          $("#CompanionSehaSickLeaveNo").val(firstSickLeaveData.CompanionSehaSickLeaveNo);
          this.CompanionSehaSickLeaveNo = firstSickLeaveData.CompanionSehaSickLeaveNo;
          this.SehaSickLeaveNo = firstSickLeaveData.SehaSickLeaveNo;
          let find = this.patientVisits.filter((x: any) => x?.AdmissionID == firstSickLeaveData.AdmissionID);

          if (find.length > 0) {
            this.sickleaveForm.get('HospitalDoctor')?.setValue(find[0].HospitalDirector);
            this.sickleaveForm.get('Approvalbydirector')?.setValue(find[0].HospitalDirector);
            this.sickleaveForm.get('Approvalbydirector2l')?.setValue(find[0].HospitalDirector2l);
            this.sickleaveForm.get('AttendingDoctor')?.setValue(find[0].ConsultantName);
            this.sickleaveForm.get('HospitalDoctor')?.setValue(find[0].HospitalDirector);
            // this.sickleaveForm.get('PhysicianName')?.setValue(this.doctorDetails[0].EmpId);
            this.sickleaveForm.patchValue({
              PhysicianName: this.doctorDetails[0].EmpId
            })
          }
          this.sickLeaveGeneratedDates = firstSickLeaveData.FromDate + " To " + firstSickLeaveData.Todate + " by " + firstSickLeaveData.DoctorName;
          this.isCompanion = firstSickLeaveData.IsCompanion === 'True' ? true : false;
          this.isCompanionDisable = firstSickLeaveData.IsCompanion === 'False' || !firstSickLeaveData.IsCompanion ? true : false;

          this.sickleaveForm.get('CompanionSehaTypeID')?.setValue(firstSickLeaveData.CompanionSehaTypeID);
          this.sickleaveForm.get('CompanionCheckInTime')?.setValue(firstSickLeaveData.CompanionCheckin?.split(' ')[1]);
          this.sickleaveForm.get('CompanionCheckOutTime')?.setValue(firstSickLeaveData.CompanionCheckout?.split(' ')[1]);
          this.sickleaveForm.get('CompanionTotalHours')?.setValue(firstSickLeaveData.CompanionTotalHours);
          this.sickleaveForm.get('CheckInTime')?.setValue(firstSickLeaveData.Checkin?.split(' ')[1]);
          this.sickleaveForm.get('CheckOutTime')?.setValue(firstSickLeaveData.Checkout?.split(' ')[1]);
          this.sickleaveForm.get('TotalHours')?.setValue(firstSickLeaveData.TotalHours);
          this.isCompanionDisable = false;
          $("#sickLeaveAlreadyGenerateMsg").modal('show');
          this.sickleaveForm.get('VisitDateTime')?.setValue(firstSickLeaveData.VisitDate);
        }
        // else {
        //   this.LoadVisitsSickLeaveData(AdmissionID);
        // }
      },
        (err) => {

        });

  }
  cancelSickLeave() {
    if (this.sickLeaveId != 0) {
      this.config.cancelSickLeave(Number(this.sickLeaveId), this.doctorDetails[0].EmpId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#sickLeaveCancelMsg").modal('show');
            this.sickleaveForm.get('Treatment')?.setValue('');
            this.sickleaveForm.get('Advice')?.setValue('');
            this.sickleaveForm.get('PlaceOfWork')?.setValue('');
            $("#SickLeaveNo").val('');
            this.GetPatientVisits(this.PatientID, this.selectedView.PatientType);
          }
        },
          (err) => {

          })
    }
  }
  smsSickLeave() {
    if (this.sickLeaveId != 0) {
      this.config.FetchPatientSickLeaveSMS(this.AdmissionID, "1", this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
            $("#sickLeaveCancelMsg").modal('show');
          }
        },
          (err) => {

          })
    }
  }
  PrintSickLeave() {
    if (this.sickLeaveId != 0) {
      this.config.FetchPatientSickLeavePrint(this.AdmissionID, "1", this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.trustedUrl = response?.FTPPATH;
            $("#reviewAndPayment").modal('show');
          }
        },
          (err) => {

          })
    }
  }
  clearSickLeaveForm() {
    this.isPatientSelected = false;
    $('#txtSsn').val('');
    this.patientVisits = []
    if (!this.showSSN) {
      this.GetPatientVisits(this.PatientID, this.selectedView.PatientType);
    } else {
      this.sickleaveForm.reset();
    }
  }
  changeSickLeavePatientType(ptype: any) {
    this.patientType = ptype;
    this.GetPatientVisits(this.PatientID, ptype);
  }
  changeSickLeaveReportType(ptype: any) {
    if (ptype == "1") {
      this.btnEnglish = "fs-7 btn selected";
      this.btnArabic = "fs-7 btn";
    }
    else {
      this.btnEnglish = "fs-7 btn";
      this.btnArabic = "fs-7 btn selected";
    }
  }

  calcSickLeaveDates(event: any) {
    const noofdays = Number(event.target.value);
    var orderdate = new Date(this.selectedView.AdmitDate || this.selectedView.orderDate || this.selectedView.Orderdate);
    var admitDate = new Date(this.selectedView.AdmitDate || this.selectedView.orderDate || this.selectedView.Orderdate);
    admitDate.setDate(admitDate.getDate() + noofdays - 1);

    this.tablePatientSickLeaveForm.patchValue({
      FromDate: orderdate,
      ToDate: admitDate
    });

    if (this.selectedView.PatientType == '1' && noofdays > 30) {
      this.validationMsg = "Sick Leave should be allowed to take within 30 days.";
      $("#sickLeavevalidationMsg").modal('show');
    }
  }

  calcCompanionSickLeaveDates(event: any) {
    const noofdays = Number(event.target.value);
    var orderdate = new Date(this.selectedView.AdmitDate || this.selectedView.orderDate || this.selectedView.Orderdate);
    var admitDate = new Date(this.selectedView.AdmitDate || this.selectedView.orderDate || this.selectedView.Orderdate);
    admitDate.setDate(admitDate.getDate() + noofdays - 1);

    this.tableCompanionSickLeaveForm.patchValue({
      FromDate: orderdate,
      ToDate: admitDate
    });
  }

  viewSickLeave() {
    if (!this.tablePatientsForm.value['FromDate'] || !this.tablePatientsForm.value['ToDate']) {
      return;
    }
    this.sickLeaveData = [];
    const startDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    const endDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    this.config.fetchPatientSickLeaveWorkList(this.PatientID, startDate, endDate, this.hospId).subscribe((res: any) => {
      this.sickLeaveData = res.FetchPatientSickLeaveWorkListFDataList;
      $('#sickLeaveModal').modal('show');
    });
  }

  viewSickLeaveReport(sickleave: any) {
    this.config.fetchPatientSickLeavePDF(sickleave.AdmissionID, sickleave.SickLeaveID, this.hospId).subscribe((res: any) => {
      this.sickleavePdfDetails = res;
      this.trustedUrl = res?.FTPPATH;
      this.showSickLeaveModal();
    })
  }
  showSickLeaveModal(): void {
    $("#SickLeaveViewModal").modal('show');
  }

  getminDate() {
    const admid = this.sickleaveForm.get("VisitID")?.value;
    const visit = this.patientVisits.find((x: any) => x.AdmissionID == admid);
    if (visit) {
      return new Date(visit.AdmitDate);
    }
    return new Date();
  }

  getmaxDate() {
    const SickleaveTypeID = this.sickleaveForm.get("SickleaveTypeID")?.value;
    // if (this.isCompanion) {
    //   const today = new Date();
    //   today.setDate(today.getDate() + 1);
    //   return today;
    // }
    // return null;
    if (SickleaveTypeID == '8') {
      const admid = this.sickleaveForm.get("VisitID")?.value;
      const visit = this.patientVisits.find((x: any) => x.AdmissionID == admid);
      if (visit) {
        return new Date(visit.AdmitDate);
      }
    }
    return null;
  }

  saveExtendForm: any;

  onExtendClick() {
    this.saveExtendForm = this.fb.group({
      extendCount: ['', [Validators.required, numberGreaterThanZeroValidator()]],
      remarks: ['', Validators.required],
      fromDate: this.datepipe.transform(this.tablePatientSickLeaveForm.value['FromDate'], "dd-MMM-yyyy")?.toString(),
      toDate: this.datepipe.transform(this.tablePatientSickLeaveForm.value['ToDate'], "dd-MMM-yyyy")?.toString()
    });
    this.saveExtendForm.get('extendCount')?.valueChanges.subscribe((days: number) => {
      const toDate = this.datepipe.transform(this.tablePatientSickLeaveForm.value['ToDate'], "dd-MMM-yyyy");
      if (toDate && !isNaN(days)) {
        const newToDate = new Date(toDate);
        newToDate.setDate(newToDate.getDate() + Number(days));
        this.saveExtendForm.get('toDate')?.setValue(this.datepipe.transform(newToDate, "dd-MMM-yyyy"));
      }
    });
    $('#sickLeaveExtendModal').modal('show');
  }

  saveLeaveExtend() {
    this.us.post(sickleave.UpdateExtendAndApprovedPatientSickLeaveDoc, {
      "SickLeaveID": this.sickLeaveId,
      "ExtendSickleaveDays": this.saveExtendForm.get('extendCount')?.value,
      "ExtendSickleaveRemarks": this.saveExtendForm.get('remarks')?.value,
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospId,
    }).subscribe((response: any) => {
      if (response.Code === 200) {
        $('#sickLeaveExtendModal').modal('hide');
        $('#sickLeaveExtendMsg').modal('show');
      }
    })
  }

  onCompanionSelect() {
    this.isCompanion = !this.isCompanion;
    if (this.isCompanion && this.selectedView.PatientType == '1') {
      const selectedType = this.sickleaveForm.get('CompanionSehaTypeID')?.value
      if (selectedType === '2' || selectedType === '3') {
        const admid = this.sickleaveForm.get("VisitID")?.value;
        const visit = this.patientVisits.find((x: any) => x.AdmissionID == admid);
        const AdmitDateNextDay = new Date(visit.AdmitDate);
        AdmitDateNextDay.setDate(AdmitDateNextDay.getDate() + 1);
        this.tableCompanionSickLeaveForm.patchValue({
          FromDate: new Date(visit.AdmitDate),
          ToDate: new Date(AdmitDateNextDay)
        });
        this.calculateCompanionSickDays();
      }
      else {
        this.tableCompanionSickLeaveForm.patchValue({
          FromDate: new Date(),
          ToDate: new Date()
        });
      }

      this.sickleaveForm.patchValue({
        Companionleavefor: 1
      })
      $("#Companionleavefor").val(1);
    } else {
      this.tablePatientSickLeaveForm.patchValue({
        FromDate: new Date(),
        ToDate: new Date()
      });
      this.sickleaveForm.patchValue({
        Sickleavefor: 1
      })
    }
  }

  getCompanionMinDate() {
    const admid = this.sickleaveForm.get("VisitID")?.value;
    const visit = this.patientVisits.find((x: any) => x.AdmissionID == admid);
    if (visit) {
      return new Date(visit.AdmitDate);
    }
    return new Date();
  }

  getCompanionMaxDate() {
    if (this.isCompanion) {
      const admid = this.sickleaveForm.get("VisitID")?.value;
      const visit = this.patientVisits.find((x: any) => x.AdmissionID == admid);
      const AdmitDateNextDay = new Date(visit.AdmitDate);
      const selectedType = this.sickleaveForm.get('CompanionSehaTypeID')?.value;
      if (selectedType != '9')
        AdmitDateNextDay.setDate(AdmitDateNextDay.getDate() + 1);
      // const today = new Date();
      // today.setDate(today.getDate() + 1);
      return AdmitDateNextDay;
    }
    return null;
  }

  // getCompanionMinDate() {
  //   return new Date();
  // }

  // getCompanionMaxDate() {
  //   const today = new Date();
  //   today.setDate(today.getDate() + 1);
  //   return today;
  // }

  onSickLeaveTypeChange() {
    const selectedType = this.sickleaveForm.get('SickleaveTypeID')?.value
    if (selectedType == '8') {
      let CheckInTime = this.setCurrentTime();
      if (this.selectedView.Orderdate) {
        CheckInTime = this.selectedView.Orderdate.split(' ')[1].substring(0, 5);
      }
      this.sickleaveForm.patchValue({
        CheckInTime,
        CheckOutTime: this.setCurrentTime()
      });
      this.calcSickLeaveHours();
      this.tablePatientSickLeaveForm.patchValue({
        FromDate: new Date(),
        ToDate: new Date()
      });
    } else {
      const admid = this.sickleaveForm.get("VisitID")?.value;
      const visit = this.patientVisits.find((x: any) => x.AdmissionID == admid);
      this.tablePatientSickLeaveForm.patchValue({
        FromDate: new Date(visit.AdmitDate),
        ToDate: new Date()
      });
      this.calculateSickDays();
    }
  }

  onCompanionSickLeaveTypeChange() {
    const selectedType = this.sickleaveForm.get('CompanionSehaTypeID')?.value
    if (selectedType == '8' || selectedType == '9') {
      let CompanionCheckInTime = this.setCurrentTime();
      if (this.selectedView.Orderdate) {
        CompanionCheckInTime = this.selectedView.Orderdate.split(' ')[1].substring(0, 5);
      }
      this.sickleaveForm.patchValue({
        CompanionCheckInTime,
        CompanionCheckOutTime: this.setCurrentTime()
      });
      this.calcCompanionSickLeaveHours();
      const admid = this.sickleaveForm.get("VisitID")?.value;
      const visit = this.patientVisits.find((x: any) => x.AdmissionID == admid);
      this.tableCompanionSickLeaveForm.patchValue({
        FromDate: new Date(visit.AdmitDate),
        ToDate: new Date(visit.AdmitDate)
      });
      this.calculateCompanionSickDays();
      // this.tableCompanionSickLeaveForm.patchValue({
      //   FromDate: new Date(),
      //   ToDate: new Date()
      // });
    } else if ((selectedType === '2' || selectedType === '3') && this.selectedView.PatientType == '1') {
      const admid = this.sickleaveForm.get("VisitID")?.value;
      const visit = this.patientVisits.find((x: any) => x.AdmissionID == admid);
      const AdmitDateNextDay = new Date(visit.AdmitDate);
      AdmitDateNextDay.setDate(AdmitDateNextDay.getDate() + 1);
      this.tableCompanionSickLeaveForm.patchValue({
        FromDate: new Date(visit.AdmitDate),
        ToDate: new Date(AdmitDateNextDay)
      });
      this.calculateCompanionSickDays();
    } else {
      this.tableCompanionSickLeaveForm.patchValue({
        FromDate: new Date(),
        ToDate: new Date()
      });
      this.calculateCompanionSickDays();
    }
  }

  calcSickLeaveHours() {
    const checkInTime = this.sickleaveForm.get('CheckInTime')?.value;
    const checkOutTime = this.sickleaveForm.get('CheckOutTime')?.value;
    let totalHours: any = '0';
    if (checkInTime && checkOutTime) {
      const [inHours, inMinutes] = checkInTime.split(':').map((val: string) => Number(val));
      const [outHours, outMinutes] = checkOutTime.split(':').map((val: string) => Number(val));

      const startMinutes = inHours * 60 + inMinutes;
      const endMinutes = outHours * 60 + outMinutes;

      let diff = endMinutes - startMinutes;

      if (diff < 0) diff += 24 * 60; // handle overnight case
      const decimalHours = diff / 60;
      totalHours = Math.round(decimalHours);
    }
    this.sickleaveForm.patchValue({
      TotalHours: totalHours
    });
  }

  calcCompanionSickLeaveHours() {
    const checkInTime = this.sickleaveForm.get('CompanionCheckInTime')?.value;
    const checkOutTime = this.sickleaveForm.get('CompanionCheckOutTime')?.value;
    let totalHours: any = '0';
    if (checkInTime && checkOutTime) {
      const [inHours, inMinutes] = checkInTime.split(':').map((val: string) => Number(val));
      const [outHours, outMinutes] = checkOutTime.split(':').map((val: string) => Number(val));
      const startMinutes = inHours * 60 + inMinutes;
      const endMinutes = outHours * 60 + outMinutes;
      let diff = endMinutes - startMinutes;
      if (diff < 0) diff += 24 * 60; // handle overnight case
      const decimalHours = diff / 60;
      totalHours = Math.round(decimalHours);
    }
    this.sickleaveForm.patchValue({
      CompanionTotalHours: totalHours
    });
  }

  setCurrentTime() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  }
  digitsOnly(event: any) {
    event.target.value = event.target.value
      .replace(/\D/g, '')   // remove non-digits
      .slice(0, 10);        // max 10 digits
  }
  alphaNumericOnly(event: any) {
    event.target.value = event.target.value
      .replace(/[^a-zA-Z0-9]/g, '') // allow only letters & digits
      .slice(0, 10);               // max length 10
  }
}

function numberGreaterThanZeroValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null; // Let required validator handle empty
    }

    const numericValue = Number(value);
    return numericValue > 0 ? null : { greaterThanZero: true };
  };
}


export const sickleave = {
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  UpdateExtendAndApprovedPatientSickLeaveDoc: 'UpdateExtendAndApprovedPatientSickLeaveDoc',
  FetchSehaSickLeaveTypes: 'FetchSehaSickLeaveTypes?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdminMasters: "FetchAdminMasters?Type=6&Filter=Blocked=0&USERID=${UserID}&WORKSTATIONID=${WorkStationID}&HospitalID=${HospitalID}",
}