import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { UpdateBillableBedTypeService } from './update-billable-bed-type.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';


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
  selector: 'app-update-billable-bed-type',
  templateUrl: './update-billable-bed-type.component.html',
  styleUrls: ['./update-billable-bed-type.component.scss'],
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
export class UpdateBillableBedTypeComponent extends BaseComponent implements OnInit {
  currentDate: any;
  multiplePatients: any;
  selectedPatientPatientID: any;
  selectedPatientForAdmission: any;
  url: any;
  selectedPatientIPID: any;
  showPatientNotSelectedValidation = false;
  diagStr: any;
  patientAdmissionDetails: any;
  transferDetails: any;
  billableBedTypeList: any;
  errorMessages:any = [];
  SelectedViewClass: string = "";

  constructor(private router: Router, private us: UtilityService, private service: UpdateBillableBedTypeService, public formBuilder: FormBuilder, public datepipe: DatePipe) {
    super();
   }

  ngOnInit(): void {
    this.currentDate = moment(new Date()).format('DD-MMM-YYYY');
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
    this.url = this.service.getData(updatebillablebedType.fetchPatientDataBySsn, {
      SSN: ssn,
      PatientID: patientId,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatientDependCLists.length > 1) {
            this.multiplePatients = response.FetchPatientDependCLists;
            $("#divMultiplePatients").modal('show');
          }
          else {
            this.selectedPatientPatientID = response.FetchPatientDataCCList[0].PatientID;
            this.selectedPatientIPID = response.FetchPatientDataCCList[0].IPAdmissionID;
            // $("#txtSsn").val(this.selectedPatientForAdmission.SSN === undefined ? response.FetchPatientDataCCList[0].SSN : this.selectedPatientForAdmission.SSN);            
            //this.fetchAdmissionInPatient();
            this.fetchPatientVistitInfo(this.selectedPatientIPID, this.selectedPatientPatientID);
          }
        }
      },
        (err) => {

        })
  }

  fetchPatientVistitInfo(admissionid: any, patientid: any) {
    this.url = this.service.getData(updatebillablebedType.FetchPatientVistitInfo, { Patientid: patientid, Admissionid: admissionid, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientAdmissionDetails = response.FetchPatientVistitInfoDataList[0];
          this.fetchAdmissionInPatient();
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

  selectPatient(pat: any) {
    this.selectedPatientPatientID = pat.PatientID;
    this.selectedPatientIPID = pat.IPAdmissionID;
    this.multiplePatients.forEach((element: any, index: any) => {
      if (element.PatientID === pat.PatientID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
  }

  fetchAdmissionInPatient() {

    this.url = this.service.getData(updatebillablebedType.FetchAdmissionInPatient, {
      PatientID: this.selectedPatientPatientID,
      IPID: this.selectedPatientIPID,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      Hospitalid: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          //this.patientAdmissionDetails = response.FetchAdmissionInPatientDataList[0];
          //this.selectedPatientForAdmission = response.FetchAdmissionInPatientDataList[0];
            // this.selectedPatientForAdmission.PatientName =
            //   response.FetchAdmissionInPatientDataList[0].Title + " " + response.FetchAdmissionInPatientDataList[0].FirstName + " " +
            //   response.FetchAdmissionInPatientDataList[0].MiddleName;
            //this.selectedPatientForAdmission.insuranceCompanyName = response.FetchAdmissionInPatientDataList[0].InsuranceCompany;
            // this.selectedPatientForAdmission.VisitID = response.FetchAdmissionInPatientDataList[0].VisitID;
            // this.selectedPatientForAdmission.GenderID = response.FetchAdmissionInPatientDataList[0].GenderID;
            // this.selectedPatientForAdmission.SSN = response.FetchAdmissionInPatientDataList[0].SSN;
            // this.selectedPatientForAdmission.DoctorID = response.FetchAdmissionInPatientDataList[0].ConsultantID;
            //this.selectedPatientForAdmission.CompanyID = response.FetchAdmissionInPatientDataList[0].CompanyId;
            // this.selectedPatientForAdmission.SpecialiseID = response.FetchAdmissionInPatientDataList[0].SpecialiseID;
            //this.selectedPatientForAdmission.GradeID = response.FetchAdmissionInPatientDataList[0].GradeID;
            this.diagStr = response.FetchAdmissionDiagnosisList?.map((item: any) => item.Code + "-" + item.DiseaseName).join(', ');
            
          this.FetchTransferDetails();
          this.fetchEligibleBedTypes(response.FetchAdmissionInPatientDataList[0].CompanyId, response.FetchAdmissionInPatientDataList[0].GradeID);          
        }
      },
        (err) => {
        })
  }
  fetchSelectedPatientPrescription() {
    this.fetchAdmissionInPatient();
    $("#divMultiplePatients").modal('hide');
  }

  fetchEligibleBedTypes(companyid: string, gradeid: string) {
    this.url = this.service.getData(updatebillablebedType.FetchEligibleBedTypes, {
      CompanyID: companyid == "" ? "0" : companyid,
      GradeID: gradeid == "" ? "0" : gradeid,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.billableBedTypeList = response.FetchEligibleBedTypesDataList;
        }
      },
        (err) => {
        })
  }

  onBillableBedTypeChanged(event:any, item:any) {
    var bedtypeval = event.target.value;
    var item = this.transferDetails.find((x:any) => x.BedID === item.BedID && x.TransferID === item.TransferID);
    if(item) {
      item.UpdateBillableBedType = bedtypeval;
    }
  }

  FetchTransferDetails() {
    this.url = this.service.getData(updatebillablebedType.FetchTransferDetails, {
      IPID: this.selectedPatientIPID,
      Type: 2,
      USERID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WORKSTATIONID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.transferDetails = response.FetchTransferDetailsDataList;
          this.transferDetails.forEach((element:any, index:any) => {
            element.UpdateBillableBedType = "0";
          });
        }
      },
        (err) => {
        })
  }

  updateBillableBedType() {

    var items = this.transferDetails.filter((x:any) => x.UpdateBillableBedType === '0');
    if(items.length > 0) {
      this.errorMessages = [];
      this.errorMessages.push("Please select update billable bed types to save");
      $("#billableTypeValidation").modal('show');
      return;
    }

    var bedTypeItems: any[] = [];
    this.transferDetails.forEach((element:any, index:any) => {
      bedTypeItems.push({
        "NBBI" : element.UpdateBillableBedType,
        "TID" : element.TransferID,
        "BID" : element.BedID,
        "IPID" : this.selectedPatientIPID
      })
    });
    var payload = {
      "IPID" : this.selectedPatientIPID,
      "BedTypeItems" : bedTypeItems,
      "USERID" : this.doctorDetails[0].UserId,
      "WORKSTATIONID" : this.facilitySessionId ?? this.service.param.WorkStationID,
      "HospitalID" : this.hospitalID
    }
    this.us.post(updatebillablebedType.UpdateBedAllocationsBillableBed, payload).subscribe((response) => {
      if (response.Code == 200) {
        $("#updatebillablebedtypeSaveMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {

        }
      }
    },
      (err) => {

      })
  }

  clear() {
    window.location.reload();
  }
}

export const updatebillablebedType = {
  getPatientRegMasterData: 'getPatientRegMasterData',
  FetchAdmissionInPatient: 'FetchAdmissionInPatient?PatientID=${PatientID}&IPID=${IPID}&UserID=${UserID}&WorkStationID=${WorkStationID}&Hospitalid=${Hospitalid}',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchInPatientInfo: 'FetchInPatientInfo?filter=${filter}&HospitalID=${HospitalID}',
  FetchTransferDetails: 'FetchTransferDetails?IPID=${IPID}&Type=${Type}&USERID=${USERID}&WORKSTATIONID=${WORKSTATIONID}&HospitalID=${HospitalID}',
  FetchEligibleBedTypes: 'FetchEligibleBedTypes?CompanyID=${CompanyID}&GradeID=${GradeID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  UpdateBedAllocationsBillableBed: 'UpdateBedAllocationsBillableBed',
  FetchPatientVistitInfo: 'FetchPatientVistitInfo?Patientid=${Patientid}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
};
