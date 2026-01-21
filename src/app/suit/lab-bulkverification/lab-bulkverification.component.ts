import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { LabBulkverificationService } from './lab-bulkverification.service';
import { FormBuilder, FormControl ,FormGroup} from '@angular/forms';
import { compilePipeFromMetadata } from '@angular/compiler';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { LabResultentryComponent } from '../lab-resultentry/lab-resultentry.component';
import { PatientfoldermlComponent } from 'src/app/shared/patientfolderml/patientfolderml.component';

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
  selector: 'app-lab-bulkverification',
  templateUrl: './lab-bulkverification.component.html',
  styleUrls: ['./lab-bulkverification.component.scss'],
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
export class LabBulkverificationComponent extends BaseComponent implements OnInit {
  datesForm: any;
  toDate = new FormControl(new Date());
  errorMessages: any[] = [];
  sampleNumber = "0";
  ssn = "0";
  FetchLabDataBulkVerificationCDataLists: any = [];
  FetchLabDataBulkVerificationCDataLists1: any = [];
  selectAll = false;
  classEd: string = "fs-7 btn";
  classIp: string = "fs-7 btn selected";
  classOp: string = "fs-7 btn";
  selectedPatientType = "2";
  showNoRecFound: boolean = true;
  facility: any;
  isPanicAbnormal: string = "0";
  listOfWards: any = [];
  listOfBeds: any = [];
  bedId = "0";
  wardId = "0";
  showVerifiedResults: boolean = false;
  constructor(private router: Router, private us: UtilityService, private service: LabBulkverificationService, public formBuilder: FormBuilder, public datepipe: DatePipe, private modalService: GenericModalBuilder, private modal: NgbModal) {
    super();

    this.datesForm = this.formBuilder.group({
      fromdate: this.toDate.value,
      todate: this.toDate.value,
      SSN: [''],
      SampleNumber: ['']
    });

  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    if(!this.showVerifiedResults)
      this.FetchLabDataBulkVerification(7);
   else
     this.FetchLabDataBulkVerification(8);
  }
  fetchPanicwithdates(filter: any) {
    if (filter === "M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 1);
      var pd = new Date();
      this.datesForm.patchValue({
        fromdate: wm,
        todate: pd,
      });
    } else if (filter === "3M") {

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 3);
      var pd = new Date();
      this.datesForm.patchValue({
        fromdate: wm,
        todate: pd,
      });
    } else if (filter === "6M") {

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 6);
      var pd = new Date();
      this.datesForm.patchValue({
        fromdate: wm,
        todate: pd,
      });
    } else if (filter === "1Y") {

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 12);
      var pd = new Date();
      this.datesForm.patchValue({
        fromdate: wm,
        todate: pd,
      });
    } else if (filter === "W") {

      var d = new Date();
      d.setDate(d.getDate() - 7); // Subtract 7 days for the past week.
      var wm = d;
      var pd = new Date();
      this.datesForm.patchValue({
        fromdate: wm,
        todate: pd,
      });
    } else if (filter === "Y") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      this.datesForm.patchValue({
        fromdate: d,
        todate: d,
      });
    } else if (filter === "T") {

      var d = new Date();
      d.setDate(d.getDate()); // Subtract 7 days for the past week.
      var wm = d;
      var pd = new Date();
      this.datesForm.patchValue({
        fromdate: wm,
        todate: pd,
      });
    }    
    if(!this.showVerifiedResults)
      this.FetchLabDataBulkVerification(7);
   else
     this.FetchLabDataBulkVerification(8);
  }
  FetchLabWorklistDataDisplay(patientType: string) {
    if (patientType == "3")
      this.selectedPatientType = "3";
    else if (patientType == "2")
      this.selectedPatientType = "2";
    else if (patientType == "1")
      this.selectedPatientType = "1";
    //sessionStorage.setItem("LabWrklstSelectedPatType", patientType);
    if(!this.showVerifiedResults)
      this.FetchLabDataBulkVerification(7);
   else
     this.FetchLabDataBulkVerification(8);
  }

  FetchLabDataBulkVerification(RStatus:any) {

    if(!this.showVerifiedResults)
      RStatus=7;
   else
      RStatus=8;


    var fromdate = this.datesForm.get('fromdate').value;
    var todate = this.datesForm.get('todate').value;
    if (fromdate !== null && fromdate !== undefined) {
      fromdate = this.datepipe.transform(fromdate, "dd-MMM-yyyy")?.toString() ?? '';
    }

    if (todate !== null && todate !== undefined) {
      todate = this.datepipe.transform(todate, "dd-MMM-yyyy")?.toString() ?? '';
    }

    if (this.selectedPatientType == "3") {
      this.classEd = "fs-7 btn selected";
      this.classIp = "fs-7 btn";
      this.classOp = "fs-7 btn";
    }
    else if (this.selectedPatientType == "2") {
      this.classEd = "fs-7 btn";
      this.classIp = "fs-7 btn selected";
      this.classOp = "fs-7 btn";
    }
    else if (this.selectedPatientType == "1") {
      this.classEd = "fs-7 btn";
      this.classIp = "fs-7 btn";
      this.classOp = "fs-7 btn selected";
    }

    var payload = {
      "SSN": this.datesForm.get('SSN')?.value === '' ? "0" : this.datesForm.get('SSN')?.value,
      "SampleNumber": this.datesForm.get('SampleNumber')?.value === '' ? "0" : this.datesForm.get('SampleNumber')?.value,
      "FromDate": fromdate,
      "ToDate": todate,
      "PatientType": this.selectedPatientType,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "WardID" : this.wardId,
      "BedID" : this.bedId,
      "Hospitalid": this.hospitalID,
      "Status" : RStatus
    }

    this.us.post(bulkverification.FetchLabDataBulkVerification, payload).subscribe((response) => {
      if (response.Code == 200) {
        this.FetchLabDataBulkVerificationCDataLists = this.FetchLabDataBulkVerificationCDataLists1 = response.FetchLabDataBulkVerificationCDataLists;

        if (this.FetchLabDataBulkVerificationCDataLists.length > 0) {
          this.showNoRecFound = false;
        }
        else {
          this.showNoRecFound = true;
        }

        this.FetchLabDataBulkVerificationCDataLists.forEach((element: any, index: any) => {
          element.viewMore = true;     
          if (element.IsPanicColor == 'Red')
            element.Class = "doctor_worklist oveflow-hidden worklist_patientcard LabPanic";
          else if (element.IsPanicColor == 'Pink')
            element.Class = "doctor_worklist oveflow-hidden worklist_patientcard LabAbnormal";
          else  if (element.IsAbnormalColor == 'Red')
            element.Class = "doctor_worklist oveflow-hidden worklist_patientcard LabPanic";
          else
          element.Class = "doctor_worklist oveflow-hidden worklist_patientcard Normall";


          if (element.IsPanicColor == 'Red')
            element.ClassVer = "doctor_worklist h-100 p-1 rounded-2 LabPanicVer";
          else if (element.IsPanicColor == 'Pink')
            element.ClassVer = "doctor_worklist h-100 p-1 rounded-2 LabAbnormalVer";
          else  if (element.IsAbnormalColor == 'Red')
            element.ClassVer = "doctor_worklist h-100 p-1 rounded-2 LabPanicVer";
          else
          element.ClassVer = "bg-white h-100 p-1 rounded-2";


        });
      }
      else {
        if (response.Status == 'Fail') {
          this.errorMessages = [];
          this.errorMessages.push(response.Message);
          this.errorMessages.push(response.Message2L);
          $("#labresultEntryValidation").modal('show');
        }
      }
    },
      (err) => {

      })
  }

  selectOption(option: any) {
    if (option === 'Results Entered') {
      this.FetchLabDataBulkVerificationCDataLists = this.FetchLabDataBulkVerificationCDataLists.sort((a: any, b: any) => {
        return new Date(a.ResultEnteredAt).getTime() - new Date(b.ResultEnteredAt).getTime();
      });
    } else if (option === 'Order Date') {
      this.FetchLabDataBulkVerificationCDataLists = this.FetchLabDataBulkVerificationCDataLists.sort((a: any, b: any) => {
        return new Date(a.OrderDate).getTime() - new Date(b.OrderDate).getTime();
      });
    } else if (option === 'Test Name') {
      this.FetchLabDataBulkVerificationCDataLists = this.FetchLabDataBulkVerificationCDataLists.sort((a: any, b: any) => a.TestName.localeCompare(b.TestName))
    }
  }

  filterPanicAbnormalResults(type: any) {
    this.isPanicAbnormal = type;
    if(this.isPanicAbnormal === '1') {
      this.FetchLabDataBulkVerificationCDataLists = this.FetchLabDataBulkVerificationCDataLists1.filter((x: any) => x.IsPanicColor == 'Red');
    }
    else if(this.isPanicAbnormal === '2') {
      this.FetchLabDataBulkVerificationCDataLists = this.FetchLabDataBulkVerificationCDataLists1.filter((x: any) => x.IsPanicColor == 'Pink');
    }
    else if(this.isPanicAbnormal === '3') {
      this.FetchLabDataBulkVerificationCDataLists = this.FetchLabDataBulkVerificationCDataLists1.filter((x: any) => x.IsPanicColor == null);
    }
    else {
      this.FetchLabDataBulkVerificationCDataLists = this.FetchLabDataBulkVerificationCDataLists1;
    }
  }
  
  clearBulkVerification() {
    
    this.FetchLabDataBulkVerificationCDataLists.forEach((element:any, index:any) => {
      element.isVerify = false;
    });
    var d = new Date();
    this.datesForm.patchValue({
      fromdate: d,
      todate: d,
      SSN : '',
      SampleNumber : ''
    });
    if(!this.showVerifiedResults)
      this.FetchLabDataBulkVerification(7);
   else
     this.FetchLabDataBulkVerification(8);
    this.showVerifiedResults = false;
  }

  isVerify(item: any) {
    item.isVerify = !item.isVerify;
  }

  UpdateBulkVerification() {

    var verifiedtests: any[] = [];
    var ver = this.FetchLabDataBulkVerificationCDataLists.filter((x: any) => x.isVerify);
    if(ver.length === 0) {
      this.errorMessages = [];
      this.errorMessages.push("Please select any result to verify.");
      $("#labresultEntryValidation").modal('show');
      return;
    }
    ver.forEach((element: any, index: any) => {
      verifiedtests.push({
        "ORD": element.TestOrderID,
        "ORDITM": element.TestOrderItemId,
        "STS": "8",
        "ISP": "1",
        "SEQ": index + 1
      })
    });

    var payload = {
      "TestVerifyXMLLMS": verifiedtests,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalID
    }
    this.us.post(bulkverification.UpdateTestPreliminaryverifiedStatus, payload).subscribe((response) => {
      if (response.Code == 200) {
        $("#labResultEntrySaveMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {
          this.errorMessages = [];
          this.errorMessages.push(response.Message);
          this.errorMessages.push(response.Message2L);
          $("#labresultEntryValidation").modal('show');
        }
      }
    },
      (err) => {

      })
  }

  selectAllData() {
    this.selectAll = !this.selectAll;
    this.FetchLabDataBulkVerificationCDataLists.forEach((element:any, index:any) => {
      element.isVerify = !element.isVerify;
    });
  }

  openResultEntry(item:any) {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'labBulkVerification_modal',
    };
      const modalRef = this.modalService.openModal(LabResultentryComponent, {
        data: item,
        readonly: true
      }, options);
  }
  showMoreData(item:any) {
    item.viewMore = !item.viewMore;
  }

  searchWard(event: any) {
      var filter = event.target.value;
      if (filter.length >= 3) {
        const parms = {
          "Name": filter,
          "HospitalID" : this.hospitalID
        }
        const url = this.us.getApiUrl(bulkverification.wardSearch, parms);
        this.us.get(url)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.listOfWards = response.FetchSSWardsDataList;
            }
          },
            (err) => {
  
            })
      }
  
      else {
        this.listOfWards = [];
      }
    }
  
    onItemSelected(ward: any) {
      this.wardId = ward.ID;
      this.listOfWards = [];
      if(!this.showVerifiedResults)
        this.FetchLabDataBulkVerification(7);
     else
       this.FetchLabDataBulkVerification(8);
    }
  
    searchBed(event: any) {
      var filter = event.target.value;
      if (filter.length >= 3) {
        const parms = {
          "Name": filter,
          "WorkStationID": this.facility,
          "HospitalID": this.hospitalID
        }
        const url = this.us.getApiUrl(bulkverification.BedSearch, parms);
        this.us.get(url)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.listOfBeds = response.FetchAllBedsDataList;
            }
          },
            (err) => {
  
            })
      }
  
      else {
        this.listOfBeds = [];
      }
    }
    onItemBedSelected(Bed: any) {
      this.bedId = Bed.BedID;
      this.listOfBeds = [];
      if(!this.showVerifiedResults)
        this.FetchLabDataBulkVerification(7);
     else
       this.FetchLabDataBulkVerification(8);
    }

    fetchStatusCount(type: number) {
      if(type === 0) {
          return this.FetchLabDataBulkVerificationCDataLists1.length;
      }
      else if(type === 1) {
          return this.FetchLabDataBulkVerificationCDataLists1.filter((x: any) => x.IsPanicColor == 'Red').length;
      }
      else if(type === 2) {
          return this.FetchLabDataBulkVerificationCDataLists1.filter((x: any) => x.IsPanicColor == 'Pink').length;
      }
      else if(type === 3) {
        return this.FetchLabDataBulkVerificationCDataLists1.filter((x: any) => x.IsPanicColor == null).length;
      } 
    }
    VerifiedFilter() {     
      if (!this.showVerifiedResults) {
        this.showVerifiedResults = true;
        this.FetchLabDataBulkVerification(8);
    } else {
        this.showVerifiedResults = false;
        this.FetchLabDataBulkVerification(7);
    }
      
    }

    openPatientSummary(item: any, event: any) {
        event.stopPropagation();
        sessionStorage.setItem("PatientDetails", JSON.stringify(item));   
        sessionStorage.setItem("selectedView", JSON.stringify(item));
        sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
        sessionStorage.setItem("PatientID", item.PatientID);
        sessionStorage.setItem("SummaryfromCasesheet", "true");
        sessionStorage.setItem("FromPhysioTherapyWorklist", "true");
    
        const options: NgbModalOptions = {
          windowClass: 'vte_view_modal'
        };
        const modalRef = this.modal.open(PatientfoldermlComponent, options);
        modalRef.componentInstance.readonly = true;
      }
}

export const bulkverification = {
  FetchLabDataBulkVerification: 'FetchLabDataBulkVerification',
  UpdateBulkVerification: 'UpdateBulkVerification',
  UpdateTestPreliminaryverifiedStatus: 'UpdateTestPreliminaryverifiedStatus',
  wardSearch: 'FetchSSWards?Name=${Name}&HospitalID=${HospitalID}',
  BedSearch: 'FetchAllBeds?Name=${Name}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
};
