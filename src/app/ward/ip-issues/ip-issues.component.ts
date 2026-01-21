import { Component, OnInit } from '@angular/core';
import { IpIssuesService } from '../ip-issues/ip-issues.service';
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
  selector: 'app-ip-issues',
  templateUrl: './ip-issues.component.html',
  styleUrls: ['./ip-issues.component.scss'],
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
export class IpIssuesComponent extends BaseComponent implements OnInit {
  multiplePatients: any;
  selectedPatientPatientID: any;
  selectedPatientIPID: any;
  patientAdmissionDetails: any;
  patientAdmissionBedDetails: any;
  listOfItems: any;
  selectedItem: any;
  selectedItemsList: any = [];
  itemStockPackingDetails: any;
  itemPackingDetails: any;
  totalScore = 0;
  errorMessages: any[] = [];
  itemStockDetails: any;
  patientVisitDetails: any;
  viewIpissuesForm!: FormGroup;
  viewIpIssues: any;
  selectedViewIpIssues: any;
  showSaveBtn = true;
  IsFromBedsBoard: any;
  showViewValidationMsg = false;
  Facility: any;
  HospDeptID: any;
  IsHome = true;
  selectedViewItemsList: any = [];
  trustedUrl: any;

  constructor(private router: Router, private service: IpIssuesService, private us: UtilityService, private appconfig: ConfigService, public formBuilder: FormBuilder, private datePipe: DatePipe) {
    super();

    this.viewIpissuesForm = this.formBuilder.group({
      fromdate: [''],
      todate: ['']
    });

    var d = new Date();
    d.setDate(d.getDate() + 1);
    var vm = new Date();
    vm.setMonth(vm.getMonth() - 1);
    this.viewIpissuesForm.patchValue({
      fromdate: vm,
      todate: d
    });

  }

  ngOnInit(): void {
    this.Facility = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.IsFromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;
    this.wardID = this.ward.FacilityID;
    this.HospDeptID = this.Facility[0].Hospdeptid;
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
    var url = this.service.getData(ipissues.fetchPatientDataBySsn, {
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
    const url = this.service.getData(ipissues.FetchPatientVistitInfo, {
      Patientid: this.selectedPatientPatientID,
      Admissionid: this.selectedPatientIPID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedView = this.patientAdmissionDetails = response.FetchPatientVistitInfoDataList[0];
          $("#txtSsn").val(this.patientAdmissionDetails.SSN);
        }
      },
        (err) => {
        })
  }

  fetchAdmissionInPatient() {
    const url = this.service.getData(ipissues.FetchAdmissionInPatient, {
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
          this.patientAdmissionBedDetails = response.FetchAdmissionWardNBedsList[0];
        }
      },
        (err) => {
        })
  }

  searchItem(event: any) {
    const item = event.target.value;
    if (item.length > 2) {
      const url = this.service.getData(ipissues.FetchItemsOfDepartmentAdv, {
        filter: item, UserId: this.doctorDetails[0]?.UserId, intWorkstationId: this.ward.FacilityID,//this.facilitySessionId ?? this.service.param.WorkStationID,
        HospitalID: this.hospitalID
      });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfItems = response.FetchItemsOfDepartmentDataList;
          }
        },
          (err) => {
          })
    }
  }

  onItemSelected(item: any) {
    this.selectedItem = item;
    const url = this.service.getData(ipissues.FetchItemStockPackingDetails, {
      ItemID: item.ItemID, HospDeptID: this.wardID, UserID: this.doctorDetails[0]?.UserId, WorkStationID: this.wardID,//this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        //if (response.Code == 200) {
        this.itemStockPackingDetails = response.FetchItemsOfDepartmentDataList;
        this.itemPackingDetails = response.FetchItemPackingDataList;
        this.itemStockDetails = response.FetchItemStockDataList;
        this.selectedItem.BatchNo = this.itemStockDetails[0].BatchNo;
        this.selectedItem.ExpiryDate = this.itemStockDetails[0].Expirydate;
        //}
      },
        (err) => {
        })
  }

  onQtyChange(event: any) {
    const qty = event.target.value;
    this.selectedItem.Qty = qty;
    this.selectedItem.BatchID = this.itemStockDetails[0].BatchID;
    this.selectedItem.Amount = parseFloat(this.selectedItem.MRP) * parseFloat(qty);
  }

  addSelectedItemToTable() {
    if (this.selectedItem.Qty !== 0 && this.selectedItem.Qty != undefined && this.selectedItem.Qty != '') {
      this.selectedItem.Units = this.itemPackingDetails.find((item: any) => item.UoMID === this.selectedItem.UoMID).FullUoM;
      this.selectedItemsList.push(this.selectedItem);
      this.totalScore = this.selectedItemsList.map((item: any) => parseFloat(item.Amount)).reduce((acc: any, curr: any) => acc + curr, 0);
      $("#drugName").val(''); $("#Qty").val('');
      this.selectedItem = {};
      this.listOfItems = [];
      this.itemPackingDetails = [];
    }
    else {
      this.errorMessages = [];
      this.errorMessages.push("Please enter Quantity");
      $("#ipissuesSaveValidation").modal('show');
    }
  }

  saveIPIssues() {

    if (this.selectedItemsList.length > 0) {
      var items: any[] = [];
      this.selectedItemsList.forEach((element: any, index: any) => {
        items.push({
          "SEQ": index + 1,
          "ITM": element.ItemID,
          "PID": element.PackId,
          "UID": element.UoMID,
          "TAX": element.SalesTax,
          "QTY": element.Qty,
          "URT": element.MRP,
          "BID": element.BatchID,
          "STAX": 0.00,
          "TAXA": element.MRP,
          "OIID": 0,
          "STAT": 0,
          "ISB": 1
        })
      });

      var payload = {
        "SalesID": 0,
        "SalesNo": "",
        "PatientType": 2,
        "PatientID": this.selectedView.PatientID,
        "IPID": this.selectedView.IPID ?? this.selectedView.AdmissionID,
        "BedID": this.selectedView.BedID,
        "TransferID": 0,
        "DoctorID": this.selectedView.ConsultantID,
        "DrugOrderID": "0",
        "ReferenceNo": "",
        "Total": this.totalScore,
        "salesType": "IP",
        "Profileid": "0",
        "Items": items,
        "CompanyID": this.selectedView.CompanyID === '' ? "0" : this.selectedView.CompanyID,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.wardID,
        "Remarks": "",
        "SurgeryOrderId": "0",
        "SurgeryId": "0",
        "SurgeryType": "-1",
        "BulkProcess": 3
      }
      this.us.post(ipissues.SaveIPIssues, payload).subscribe((response) => {
        if (response.Status === "Success") {
          $("#ipIssuesSaveMsg").modal('show');
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
    }
    else {
      this.errorMessages = [];
      this.errorMessages.push("Please select any item to save");
      $("#ipissuesSaveValidation").modal('show');
    }
  }

  clearIPIssues() {
    if (this.IsFromBedsBoard) {
      this.selectedItemsList = [];
      this.listOfItems = [];
      this.totalScore = 0;
      this.itemStockPackingDetails = [];
      this.showSaveBtn = true;
      this.viewIpIssues = [];
      this.selectedViewIpIssues = [];
    }
    else {
      this.patientAdmissionBedDetails = [];
      this.patientAdmissionDetails = [];
      this.selectedItemsList = [];
      this.listOfItems = [];
      this.selectedPatientPatientID = "";
      this.selectedPatientIPID = [];
      this.itemStockPackingDetails = [];
      this.totalScore = 0;
      $("#txtSsn").val('');
      this.showSaveBtn = true;
      this.viewIpIssues = [];
      this.selectedViewIpIssues = [];
    }
  }

  deleteItem(index: any, item: any) {
    this.selectedItemsList.splice(index, 1);
    this.totalScore = this.selectedItemsList.map((item: any) => parseFloat(item.Amount)).reduce((acc: any, curr: any) => acc + curr, 0);
  }

  viewIPIssues() {
    this.fetchViewIpIssues();
    $("#txtSsn").val('');
    $("#divViewIPIssues").modal('show');
  }

  fetchViewIpIssues() {
    var Fromdate = this.datePipe.transform(this.viewIpissuesForm.value['fromdate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datePipe.transform(this.viewIpissuesForm.value['todate'], "dd-MMM-yyyy")?.toString();
    const url = this.service.getData(ipissues.FetchPatientDrugIssuesAdv, {
      FromDate: Fromdate,
      ToDate: ToDate,
      filter: this.IsFromBedsBoard ? this.selectedView.AdmissionID : "0",
      min: 1,
      max: 20,
      HosDeptID: this.HospDeptID,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.viewIpIssues = response.FetchPatientDrugIssuesDataList;
        }
      },
        (err) => {
        })
  }

  selectVte(sur: any) {
    this.viewIpIssues.forEach((element: any, index: any) => {
      if (element.SalesID === sur.SalesID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.selectedViewIpIssues = sur;
    this.showViewValidationMsg = false;
  }

  loadSelectedIpIssue(item: any) {
    this.showSaveBtn = false;
    if (this.viewIpIssues.filter((x: any) => x.selected).length === 0) {
      this.showViewValidationMsg = true;
      return;
    }
    else {
      this.showViewValidationMsg = false;
    }
    const url = this.service.getData(ipissues.FetchInpatientDrugIssues, {
      SalesID: item.SalesID,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.doctorDetails[0]?.FacilityId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedPatientPatientID = item.PatientID;
          this.selectedPatientIPID = item.IPID;
          //this.FetchPatientVistitInfo();
          this.selectedItemsList = response.FetchInpatientDrugIssuesDataList;
          this.totalScore = this.selectedItemsList.map((item: any) => parseFloat(item.UPrice)).reduce((acc: any, curr: any) => acc + curr, 0);
          $("#divViewIPIssues").modal('hide');
        }
      },
        (err) => {
        })
  }

  navigatetoBedBoard() {
    this.router.navigate(['/ward']);
  }

  clearViewIPIssues() {
    this.showViewValidationMsg = false;
    this.viewIpIssues.forEach((element: any, index: any) => {
      element.selected = false;
    });
    var d = new Date();
    d.setDate(d.getDate() + 1);
    var vm = new Date();
    vm.setMonth(vm.getMonth() - 1);
    this.viewIpissuesForm.patchValue({
      fromdate: vm,
      todate: d
    });
    this.fetchViewIpIssues()
  }

  onEnterPressSSN(event: any) {
    var ssn = event.target.value;
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      var url = this.service.getData(ipissues.fetchPatientDataBySsn, {
      SSN: ssn,
      PatientID: "0",
      MobileNO: "0",
      PatientId: "0",
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.fetchViewIpIssuesBySsn(response.FetchPatientDataCCList[0].PatientID);

        }
      },
        (err) => {

        })
    }
  }

  fetchViewIpIssuesBySsn(patientId: any) {
    let filter = "PatientID=" + patientId;
    var Fromdate = this.datePipe.transform(this.viewIpissuesForm.value['fromdate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datePipe.transform(this.viewIpissuesForm.value['todate'], "dd-MMM-yyyy")?.toString();
    const url = this.service.getData(ipissues.FetchPatientDrugIssuesAdv, {
      FromDate: Fromdate,
      ToDate: ToDate,
      filter: filter,
      min: 1,
      max: 1000,
      HosDeptID: this.HospDeptID,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.viewIpIssues = response.FetchPatientDrugIssuesDataList;
        }
      },
        (err) => {
        })
  }

  viewIpIssuesDetails(item: any) {
    item.selected = !item.selected;
    const url = this.service.getData(ipissues.FetchInpatientDrugIssues, {
      SalesID: item.SalesID,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.doctorDetails[0]?.FacilityId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedViewItemsList = response.FetchInpatientDrugIssuesDataList;
        }
      },
        (err) => {
        })
  }

  billPrintinView(item: any) {
    let param = {
      SalesID: item.SalesID,// this.billNumber,
      userId: this.doctorDetails[0].UserId,
      WorkStationID: this.doctorDetails[0]?.FacilityId ?? this.service.param.WorkStationID,
      hospitalId: this.hospitalID
    }
    const url = this.service.getData(ipissues.InpatientDrugIssuesPrint, param);
    this.us.get(url)
      .subscribe((response: any) => {
        this.trustedUrl = response?.Message;
        $("#opPharmacyBillPrint").modal('show');
      },
        (err) => {

        })
  }
}


export const ipissues = {
  FetchPatientFromReg: 'FetchPatientFromReg?PatientID=${PatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&Hospitalid=${Hospitalid}',
  FetchAdmissionInPatient: 'FetchAdmissionInPatient?PatientID=${PatientID}&IPID=${IPID}&UserID=${UserID}&WorkStationID=${WorkStationID}&Hospitalid=${Hospitalid}',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchInPatientInfo: 'FetchInPatientInfo?filter=${filter}&HospitalID=${HospitalID}',
  FetchItemsOfDepartmentAdv: 'FetchItemsOfDepartmentAdv?filter=${filter}&UserId=${UserId}&intWorkstationId=${intWorkstationId}&HospitalID=${HospitalID}',
  FetchItemStockPackingDetails: 'FetchItemStockPackingDetails?ItemID=${ItemID}&HospDeptID=${HospDeptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SaveIPIssues: 'SaveIPIssues',
  FetchPatientVistitInfo: 'FetchPatientVistitInfo?Patientid=${Patientid}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchPatientDrugIssuesAdv: 'FetchPatientDrugIssuesAdv?FromDate=${FromDate}&ToDate=${ToDate}&filter=${filter}&min=${min}&max=${max}&HosDeptID=${HosDeptID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchInpatientDrugIssues: 'FetchInpatientDrugIssues?SalesID=${SalesID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  InpatientDrugIssuesPrint:'InpatientDrugIssuesPrint?SalesID=${SalesID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};