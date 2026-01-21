import { Component, OnInit } from '@angular/core';
import { IpReturnsService } from '../ip-returns/ip-returns.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  selector: 'app-ip-returns',
  templateUrl: './ip-returns.component.html',
  styleUrls: ['./ip-returns.component.scss'],
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
export class IpReturnsComponent extends BaseComponent implements OnInit {
  multiplePatients: any;
  selectedPatientPatientID: any;
  selectedPatientIPID: any;
  patientAdmissionDetails: any;
  errorMessages: any[] = [];
  patientDrugIssuesDetails: any;
  viewIpreturnsForm!: FormGroup;
  viewIpReturns: any;
  selectedViewIpReturn: any;
  showSaveBtn = true;
  selectedItemsList: any;
  IsFromBedsBoard: any;
  isDischargeReturn = false;
  showViewValidationMsg = false;
  IsHome = true;

  totalItemsCount: any = 0;
  currentPage: number = 0;
  showPatNotAdmittedMsg: boolean = false;

  constructor(private router: Router, private service: IpReturnsService, private us: UtilityService, private appconfig: ConfigService, public formBuilder: FormBuilder, private datePipe: DatePipe) {
    super();

    this.viewIpreturnsForm = this.formBuilder.group({
      fromdate: [''],
      todate: ['']
    });

    var d = new Date();
    d.setDate(d.getDate() + 1);
    var vm = new Date();
    vm.setMonth(vm.getMonth() - 1);
    this.viewIpreturnsForm.patchValue({
      fromdate: vm,
      todate: d
    });
  }

  ngOnInit(): void {
    this.IsFromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;
    if (!this.IsFromBedsBoard) {
      const fac = JSON.parse(sessionStorage.getItem("facility") || '{}');
      this.wardID = fac.FacilityID;
    }
    else {
      this.wardID = this.ward.FacilityID;
    }
    if (this.IsFromBedsBoard) {
      this.selectedPatientPatientID = this.selectedView.PatientID;
      this.selectedPatientIPID = this.selectedView.AdmissionID;
    }
    if (this.IsFromBedsBoard) {
      this.fetchPatientIssueItemsAdv();
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
    var url = this.service.getData(ipreturns.fetchPatientDataBySsn, {
      SSN: ssn,
      PatientID: patientId,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.wardID,
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
            //this.fetchAdmissionInPatient();
            this.FetchPatientVistitInfo();
          }
          //this.showNoRecFound = false;
        }
      },
        (err) => {

        })
  }

  FetchPatientVistitInfo() {
    const url = this.service.getData(ipreturns.FetchPatientVistitInfo, {
      Patientid: this.selectedPatientPatientID,
      Admissionid: this.selectedPatientIPID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedView = this.patientAdmissionDetails = response.FetchPatientVistitInfoDataList[0];
          if(this.patientAdmissionDetails?.length === 0 || this.patientAdmissionDetails == undefined) {
            this.showPatNotAdmittedMsg = true;
          }
          else {
            this.showPatNotAdmittedMsg = false;
          }
          // sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientAdmissionDetails));
          if(!this.showPatNotAdmittedMsg) {
            this.fetchPatientIssueItemsAdv();
          }
        }
      },
        (err) => {
        })
  }

  fetchPatientIssueItemsAdv() {
    const url = this.service.getData(ipreturns.fetchPatientIssueItemsAdv, {
      IPID: this.selectedPatientIPID,
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientDrugIssuesDetails = response.FetchPatientIssueItemsDataList;

        }
      },
        (err) => {
        })
  }

  onQtyChange(item: any, event: any) {
    var qty = event.target.value;
    if (Number(qty) > Number(item.IssQty)) {
      this.errorMessages = [];
      this.errorMessages.push("Return Qty cannot be greater than issued Qty");
      $("#ipissuesSaveValidation").modal('show');
      return;
    }
    item.Qty = qty;
    item.Amount = parseFloat(qty) * parseFloat(item.UPrice);
  }

  clearIPReturns() {
    if (this.IsFromBedsBoard) {
      this.fetchPatientIssueItemsAdv();
    }
    else {
      this.selectedPatientPatientID = "";
      this.selectedPatientIPID = "";
      this.patientAdmissionDetails = [];
      this.errorMessages = [];
      this.patientDrugIssuesDetails = [];
      $("#txtSsn").val('');
      this.showSaveBtn = true;
    }
  }

  isChkDischargeReturn() {
    this.isDischargeReturn = !this.isDischargeReturn;
  }

  saveIPReturnsSalesIDWise() {
    var itemWithoutQty = this.patientDrugIssuesDetails.filter((x: any) => x.Qty !== undefined);
    if (itemWithoutQty.length === 0) {
      this.errorMessages = [];
      this.errorMessages.push("Please enter Quantity for any one item");
      $("#ipissuesSaveValidation").modal('show');
      return;
    }

    const uniqueSalesIds = itemWithoutQty.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.SalesID === thing.SalesID) === i);
    uniqueSalesIds.forEach((element: any) => {
      this.saveIPReturns(element.SalesID);
    });
    $("#ipIssuesSaveMsg").modal('show');
  }

  saveIPReturns(saleid: any) {
    //var itemWithoutQty = this.patientDrugIssuesDetails.filter((x: any) => x.Qty !== undefined);
    //if (itemWithoutQty.length > 0) {
    const saleitems = this.patientDrugIssuesDetails.filter((x: any) => x.SalesID === saleid);
    var items: any[] = [];
    saleitems.forEach((element: any, index: any) => {
      if (element.Qty != undefined && element.Qty != '0') {
        items.push({
          "SEQ": index + 1,
          "ITM": element.ItemID,
          "PID": element.PackId,
          "UID": element.UoMID,
          "QTY": element.Qty,
          "URT": element.UPrice,
          "TAX": element.Tax,
          "BID": element.BatchID,
          "SID": element.SalesID
        })
      }
    });

    var payload = {
      "SaleReturnID": 0,
      "SalesReturnNo": "",
      "SalesID": saleid,
      "PatientID": this.selectedView.PatientID,
      "IPID": this.selectedView.AdmissionID,
      "DoctorID": this.selectedView.ConsultantID,
      "ReturnType": "IR",
      "ReturnItems": items,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": saleitems[0].HospDeptId,//this.patientDrugIssuesDetails[0]?.HospDeptId, //this.wardID,
      "STATUS": "2",
      "IsDischargeReturn": this.isDischargeReturn ? "1" : "0"
    }
    this.us.post(ipreturns.SaveIPReturns, payload).subscribe((response) => {
      if (response.Status === "Success") {
        //$("#ipIssuesSaveMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {
          this.errorMessages = [];
          this.errorMessages.push(response.Message);
          this.errorMessages.push(response.Message2L);
          // this.patientDetails = [];
          $("#ipissuesSaveValidation").modal('show');
        }
      }
    },
      (err) => {

      })
    // }
    // else {
    //   this.errorMessages = [];
    //   this.errorMessages.push("Please enter Quantity for any one item");
    //   $("#ipissuesSaveValidation").modal('show');
    // }
  }

  viewIPReturns() {
    this.currentPage = 0;
    this.totalItemsCount = 0;
    this.fetchViewIpReturns();
    $("#divViewIPReturns").modal('show');
  }

  fetchViewIpReturns(min: number = 1, max: number = 10, currentPage: number = 1) {
    var Fromdate = this.datePipe.transform(this.viewIpreturnsForm.value['fromdate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datePipe.transform(this.viewIpreturnsForm.value['todate'], "dd-MMM-yyyy")?.toString();
    const url = this.service.getData(ipreturns.FetchPatientDrugReturnsAdv, {
      FromDate: Fromdate,
      ToDate: ToDate,
      filter: this.IsFromBedsBoard ? this.selectedView.AdmissionID : "0",
      min,
      max,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.viewIpReturns = response.FetchPatientDrugReturnsDataList;
          this.currentPage = currentPage;
          this.totalItemsCount = Number(response.FetchPatientDrugReturnsDataCountList[0]?.Count);
        }
      },
        (err) => {
        })
  }

  selectVte(sur: any) {
    this.viewIpReturns.forEach((element: any, index: any) => {
      if (element.ReturnID === sur.ReturnID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.selectedViewIpReturn = sur;
    this.showViewValidationMsg = false;
  }

  loadSelectedIpReturns(item: any) {
    if (this.viewIpReturns.filter((x: any) => x.selected).length === 0) {
      this.showViewValidationMsg = true;
      return;
    }
    else {
      this.showViewValidationMsg = false;
    }
    this.showSaveBtn = false;
    const url = this.service.getData(ipreturns.FetchInPatientDrugReturns, {
      ReturnID: item.ReturnID,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedPatientPatientID = item.PatientID;
          this.selectedPatientIPID = item.IPID;
          this.FetchPatientVistitInfo();
          this.selectedItemsList = response.FetchInPatientDrugReturnsDataList;
          $("#divViewIPReturns").modal('hide');
        }
      },
        (err) => {
        })
  }
  navigatetoBedBoard() {
    this.router.navigate(['/ward']);
  }

  clearViewIPReturns() {
    this.showViewValidationMsg = false;
    this.viewIpReturns?.forEach((element: any, index: any) => {
      element.selected = false;
    });
    var d = new Date();
    d.setDate(d.getDate() + 1);
    var vm = new Date();
    vm.setMonth(vm.getMonth() - 1);
    this.viewIpreturnsForm.patchValue({
      fromdate: vm,
      todate: d
    });
    this.currentPage = 0;
    this.totalItemsCount = 0
    this.fetchViewIpReturns();
  }

  handlePageChange(event: any) {
    this.fetchViewIpReturns(event.min, event.max, event.currentPage);
  }
}

export const ipreturns = {
  FetchPatientFromReg: 'FetchPatientFromReg?PatientID=${PatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&Hospitalid=${Hospitalid}',
  FetchAdmissionInPatient: 'FetchAdmissionInPatient?PatientID=${PatientID}&IPID=${IPID}&UserID=${UserID}&WorkStationID=${WorkStationID}&Hospitalid=${Hospitalid}',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchInPatientInfo: 'FetchInPatientInfo?filter=${filter}&HospitalID=${HospitalID}',
  FetchItemsOfDepartmentAdv: 'FetchItemsOfDepartmentAdv?filter=${filter}&UserId=${UserId}&intWorkstationId=${intWorkstationId}&HospitalID=${HospitalID}',
  FetchItemStockPackingDetails: 'FetchItemStockPackingDetails?ItemID=${ItemID}&HospDeptID=${HospDeptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SaveIPIssues: 'SaveIPIssues',
  FetchPatientVistitInfo: 'FetchPatientVistitInfo?Patientid=${Patientid}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  fetchPatientIssueItemsAdv: 'fetchPatientIssueItemsAdv?IPID=${IPID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SaveIPReturns: 'SaveIPReturns',
  FetchPatientDrugReturnsAdv: 'FetchPatientDrugReturnsAdv?FromDate=${FromDate}&ToDate=${ToDate}&filter=${filter}&min=${min}&max=${max}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchInPatientDrugReturns: 'FetchInPatientDrugReturns?ReturnID=${ReturnID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};