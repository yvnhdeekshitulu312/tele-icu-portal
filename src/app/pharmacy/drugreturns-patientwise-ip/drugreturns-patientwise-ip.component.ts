import { Component, OnInit } from '@angular/core';
import { DrugreturnsPatientwiseIpService } from '../drugreturns-patientwise-ip/drugreturns-patientwise-ip.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';

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
  selector: 'app-drugreturns-patientwise-ip',
  templateUrl: './drugreturns-patientwise-ip.component.html',
  styleUrls: ['./drugreturns-patientwise-ip.component.scss'],
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
export class DrugreturnsPatientwiseIpComponent extends BaseComponent implements OnInit {
  multiplePatients: any;
  selectedPatientPatientID: any;
  selectedPatientIPID: any;
  patientAdmissionDetails: any;

  constructor(private router: Router, private service: DrugreturnsPatientwiseIpService, private us: UtilityService, private appconfig: ConfigService) {
    super();
   }

  ngOnInit(): void {
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
    var url = this.service.getData(drugreturns.fetchPatientDataBySsn, {
      SSN: ssn,
      PatientID: patientId,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatientDependCLists.length > 1) {
            this.multiplePatients = response.FetchPatientDependCLists;
            $("#divMultiplePatients").modal('show');
          }
          else {
            this.selectedPatientPatientID = response.FetchPatientDataCCList[0].PatientID;
            this.selectedPatientIPID = response.FetchPatientDataCCList[0].IPAdmissionID;
            //$("#txtSsn").val(this.selectedPatientForAdmission.SSN === undefined ? response.FetchPatientDataCCList[0].SSN : this.selectedPatientForAdmission.SSN);
            //this.fetchPatientFromReg();
            this.fetchAdmissionInPatient();
          }
          //this.showNoRecFound = false;
        }
      },
        (err) => {

        })
  }

  fetchAdmissionInPatient() {

    var url = this.service.getData(drugreturns.FetchAdmissionInPatient, {
      PatientID: this.selectedPatientPatientID,
      IPID: this.selectedPatientIPID,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      Hospitalid: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientAdmissionDetails = response.FetchAdmissionInPatientDataList[0];
          
        }
      },
        (err) => {
        })
  }

}


export const drugreturns = {
  getPatientRegMasterData: 'getPatientRegMasterData',
  FetchHospitalSpecialisations: 'FetchHospitalSpecialisations',
  FetchHospitalEmployees: 'FetchHospitalEmployees?HospitalID=${HospitalID}',
  FetchEmployeeSpecializations: 'FetchEmployeeSpecializationsForPA?Type=${Type}&Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchEligibleBedTypes: 'FetchEligibleBedTypes?CompanyID=${CompanyID}&GradeID=${GradeID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchSelectionEligibleBedTypes: 'FetchSelectionEligibleBedTypes?BedTypeID=${BedTypeID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdmissionWards: 'FetchAdmissionWards?BedTypeID=${BedTypeID}&GenderID=${GenderID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdmissionWardBeds: 'FetchAdmissionWardBeds?BedTypeID=${BedTypeID}&IPID=${IPID}&WardID=${WardID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SavePatientAdmission: 'SavePatientAdmission',
  FetchPatientFromReg: 'FetchPatientFromReg?PatientID=${PatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&Hospitalid=${Hospitalid}',
  FetchAdmissionInPatient: 'FetchAdmissionInPatient?PatientID=${PatientID}&IPID=${IPID}&UserID=${UserID}&WorkStationID=${WorkStationID}&Hospitalid=${Hospitalid}',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchInPatientInfo: 'FetchInPatientInfo?filter=${filter}&HospitalID=${HospitalID}',
  FetchPatientAdultBandPrint: 'FetchPatientAdultBandPrint',
  FetchPatientInfantBandPrint: 'FetchPatientInfantBandPrint',
  SavePatientBandPrintingHistory: 'SavePatientBandPrintingHistory'
};
