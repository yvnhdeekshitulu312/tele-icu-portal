import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { OrChargesService } from './or-charges.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
declare var $: any;

@Component({
  selector: 'app-or-charges',
  templateUrl: './or-charges.component.html',
  styleUrls: ['./or-charges.component.scss'],
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
export class OrChargesComponent extends BaseComponent implements OnInit {
  dailyCharges: any = [];
  drugOrders: any = [];
  procOrders: any = [];
  selectdrugOrderAll = false;
  selectprocOrderAll = false;
  selectdrugOrderQtyAll = false;
  selectprocOrderQtyAll = false;
  datesForm!: FormGroup;
  procdatesForm!: FormGroup;
  toDate = new FormControl(new Date());
  errorMessage: any;
  quantity = 1;
  url = '';
  PatientID = 0;
  item: any;
  clinicalProceduresViewD: any = [];
  clinicalProceduresView: any = [];
  yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
  listOfItems: any;
  FetchUserFacilityDataList: any;
  selectedWardId: any;
  dailyChargesFromSearch: any;
  hospitalId: any;
  facility: any;
  otpatinfo: any;

  constructor(private router: Router,
    private us: UtilityService, private fb: FormBuilder, public datepipe: DatePipe, private service: OrChargesService,) {
    super();

    if (sessionStorage.getItem("otpatient") != 'undefined') {
      this.item = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
    }

    this.datesForm = this.fb.group({
      fromdate: [''],
      todate: ['']
    });

    this.procdatesForm = this.fb.group({
      fromdate: [''],
      todate: ['']
    });
  }

  ngOnInit(): void {
    //this.fetchPatientDetails(this.item.SSN, "0", "0");
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.fetchUserFacility();
    //this.openDailyCharges();
  }

  navigateBackToAdmissionRequests() {
    $('#selectPatientYesNoModal').modal('show'); 
  }

  onAccept() {
    const otpatient = JSON.parse(sessionStorage.getItem("otpatient") || '{}');
    const SSN = otpatient.SSN;
    $('#selectPatientYesNoModal').modal('hide');
    sessionStorage.setItem('navigateToDashboard', SSN)
    this.router.navigate(['/ot/ot-dashboard']);
  }

  onDecline() {
    $('#selectPatientYesNoModal').modal('hide');
    this.router.navigate(['/ot/ot-dashboard']);
  }

  save() {
    var TestDetails: any = [];
    var selectedOrders: any = this.procOrders.filter((x: any) => x.selected);
    selectedOrders.forEach((element: any, index: any) => {
      TestDetails.push({
        "PRID": "13",
        "TSTID": element.ItemID,
        "SEQ": index + 1,
        "SDT": moment(element.orderDate).format('DD-MMM-YYYY') + ' ' + moment(new Date()).format('HH:mm'),
        "REM": element.Remarks
      })
    });

    if (selectedOrders.length === 0) {
      this.errorMessage = "Please select any item to charge.";
      $("#errorMsg").modal('show');
      return;
    }

    if (selectedOrders.filter((x: any) => x.quantity === '0').length > 0) {
      this.errorMessage = "Quantity cannot be 0.";
      $("#errorMsg").modal('show');
      return;
    }

    let payload = {
      "IPID": this.item.IPAdmissionID,
      "OrderTypeID": "13",
      "WardID": this.item.WardID,
      "PatientID": this.item.PatientID,
      "PatientType": this.item.patienttype,
      "Remarks": "",
      "UserId": this.item.SurgeonID,//this.doctorDetails[0]?.UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalId": this.hospitalID,
      "TestDetails": TestDetails
    }
    this.us.post(orchargesDetails.SaveWardProcedureOrder, payload).subscribe(response => {
      if (response.Code == 200) {
        $("#saveDailyCharges").modal('show');
      }
    })
  }
  clearDailyCharges() {
    $("#dailycharges").modal('hide');
    this.clearProcOrders();
  }

  clearProcOrders() {
    this.selectprocOrderAll = false;
    this.selectprocOrderQtyAll = false;
    this.procOrders.forEach((element: any, index: any) => {
      element.selected = false;
      element.orderDate = new Date();
      element.quantity = "1";
      element.Remarks = "";
    });
    this.procdatesForm.patchValue({
      fromdate: this.toDate.value,
      todate: this.toDate.value
    });
    this.FetchProceduresView();
  }

  selectAllProcOrders() {
    this.selectprocOrderAll = !this.selectprocOrderAll;
    if (this.selectprocOrderAll) {
      this.procOrders.forEach((element: any, index: any) => {
        element.selected = true;
      });
    }
    else {
      this.procOrders.forEach((element: any, index: any) => {
        element.selected = false;
      });
    }
  }

  selectAllProcOrdersQty() {
    this.selectprocOrderQtyAll = !this.selectprocOrderQtyAll;
    if (this.selectprocOrderQtyAll) {
      this.procOrders.forEach((element: any, index: any) => {
        if (element.selected)
          element.quantity = this.quantity;
      });
    }
    else {
      this.drugOrders.forEach((element: any, index: any) => {
        element.quantity = 1;
        this.quantity = 1;
      });
    }
  }

  // openDailyCharges(item:any) {
  //   this.selectedPatient = item;
  //   this.showDailyCharges = true;
  //   sessionStorage.setItem("InPatientDetails", JSON.stringify(item));    

  //   this.config.FetchWardWiseDailyCharges(Number(this.wardID), Number(this.ward.FacilityID), Number(this.hospitalId)).subscribe((response: any) => {
  //     if (response.Code == 200) {
  //       $("#dailycharges").modal('show');
  //       this.dailyCharges = response.FetchWardWiseDailyChargesDataList;
  //       this.dailyCharges.forEach((element:any, index:any) => {
  //         element.orderDate = new Date();
  //         element.quantity = "1";
  //         element.selected = false;
  //         element.Remarks = '';
  //       });
  //       this.drugOrders = this.dailyCharges.filter((x:any) => x.ChargeTypeID === '1');
  //       this.procOrders = this.dailyCharges.filter((x:any) => x.ChargeTypeID === '3');
  //       this.FetchClinicalProceduresView();
  //     }
  //   });
  // }

  onQuantityChange(event: any, item: any) {
    item.quantity = event.target.value;
    this.quantity = event.target.value;
    item.selected = true;
  }

  onOrderDateChange(event: any, item: any) {
    item.orderDate = event.target.value;
  }

  fetchPatientDetails(ssn: string, mobileno: string, patientId: string) {
    this.url = this.service.getData(orchargesDetails.fetchPatientDataBySsn, {
      SSN: ssn,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,//this.doctorDetails[0]?.FacilityId,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (ssn === '0') {
            this.PatientID = response.FetchPatientDependCLists[0].PatientID;
            this.selectedView = response.FetchPatientDependCLists[0];
          }
          else if (mobileno === '0') {
            this.PatientID = response.FetchPatientDataCCList[0].PatientID;
            this.selectedView = response.FetchPatientDataCCList[0];
          }
          this.openDailyCharges();
        }
      },
        (err) => {

        })
  }

  FetchProceduresView() {
    var FromDate = this.datepipe.transform(this.item.CREATEDATE, "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.item.CREATEDATE, "dd-MMM-yyyy")?.toString();

    this.url = this.service.getData(orchargesDetails.FetchClinicalORChargesView, {
      AdmissionID: this.item.AdmissionID,
      WardID: 3398,//this.item.WardID,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,//this.doctorDetails[0]?.FacilityId,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.clinicalProceduresView = response.FetchClinicalORChargesViewDataList;
        }

      },
        (err) => {
        })
  }

  selectProcOrder(item: any) {
    item.selected = !item.selected;
  }

  onRemarksChange(event: any, item: any) {
    item.Remarks = event.target.value;
  }

  openDailyCharges() {
    this.url = this.service.getData(orchargesDetails.FetchORWiseDailyCharges, {
      WardID: 3398,//this.item.WardID,
      HospDeptID: this.selectedWardId,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,//this.doctorDetails[0]?.FacilityId,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Code == 200) {
        $("#dailycharges").modal('show');
        this.procOrders = response.FetchWardWiseDailyChargesDataList.filter((x: any) => x.ProcedureID === this.item.ProcedureID);
        this.procOrders.forEach((element: any, index: any) => {
          element.orderDate = new Date();
          element.quantity = "1";
          element.selected = false;
          element.Remarks = '';
        });
        //this.procOrders = this.dailyCharges.filter((x:any) => x.ProcedureID === this.item.ProcedureID);
        this.FetchProceduresView();
      }
    });
  }

  searchItem(event: any) {
    const item = event.target.value;
    if (item.length > 2) {
      const url = this.service.getData(orchargesDetails.FetchItemsOfDepartmentAdv, {
        filter: item, UserId: this.doctorDetails[0]?.UserId, intWorkstationId: this.selectedWardId,//this.facilitySessionId ?? this.service.param.WorkStationID,
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
    const itemExists = this.procOrders.find((x: any) => x.ItemID === item.ItemID);
    if (!itemExists) {
      this.procOrders.push({
        "ChargeID": "",
        "WardID": "",
        "ServiceID": "17",
        "ServiceName": "Consumables",
        "ItemID": item.ItemID,
        "ItemCode": item.ItemCode,
        "ItemName": item.DisplayName,
        "HospitalID": this.hospitalID,
        "Createdate": null,
        "Moddate": null,
        "USERID": null,
        "WorkStationId": null,
        "Blocked": null,
        "Enddate": null,
        "Status": null,
        "ChargeTypeID": "",
        "ChargeType": "",
        "ProcedureID": "",
        "Department": "",
        "PackId": item.PackId,
        "Packname": item.Packname,
        "UoMID": item.UoMID,
        "UOM": item.UOM,
        "QOH": item.QOH,
        "MRP": item.MRP,
        "RPU": item.RPU,
        "SalesTax": item.SalesTax,
        "orderDate" : new Date(),
        "quantity" : "1",
        "selected" : false,
        "Remarks" : ''
      })
    }
    else {
      this.errorMessage = "Item already selected";
      $("#errorMsg").modal('show');
    }
  }
  fetchUserFacility() {
    const url = this.service.getData(orchargesDetails.FetchUserFacility, {
      UserId: this.doctorDetails[0]?.UserId, intWorkstationId: this.ward.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchUserFacilityDataList = response.FetchUserFacilityDataList;
          if(this.hospitalID=='3')
          this.selectedWardId="3395";
          else if(this.hospitalID=='2')
            this.selectedWardId="2185";
          this.openDailyCharges();
        }
      },
        (err) => {
        })
  }

  onFacilitySelectChange(event: any) {
    this.openDailyCharges();
  }

  saveIPIssues() {
    var selectedOrders: any = this.procOrders.filter((x: any) => x.selected);
    if (selectedOrders.length === 0) {
      this.errorMessage = "Please select any item to charge.";
      $("#errorMsg").modal('show');
      return;
    }

    if (selectedOrders.filter((x: any) => x.quantity === '0').length > 0) {
      this.errorMessage = "Quantity cannot be 0.";
      $("#errorMsg").modal('show');
      return;
    }

    if (selectedOrders.filter((x: any) => parseFloat(x.QOH) === 0.00).length > 0) {
      const noQoh = selectedOrders?.map((item: any) => item.ItemCode + "-" + item.ItemName).join(', ');
      this.errorMessage = "Quantity does not exists for these items:" + noQoh;
      $("#errorMsg").modal('show');
      return;
    }

    selectedOrders.forEach((element:any, index:any) => {
      element.Amount = parseFloat(element.MRP) * parseFloat(element.quantity);
    });

    const amount = selectedOrders.map((item: any) => parseFloat(item.Amount)).reduce((acc: any, curr: any) => acc + curr, 0);

    if (this.procOrders.length > 0) {
      var items: any[] = [];
      selectedOrders.forEach((element: any, index: any) => {
        items.push({
          "SEQ": index + 1,
          "ITM": element.ItemID,
          "PID": element.PackId,
          "UID": element.UoMID,
          "TAX": element.SalesTax,
          "QTY": element.quantity,
          "URT": element.MRP,
          "BID": "",
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
        "PatientID": this.item.PatientID,
        "IPID": this.item.IPAdmissionID,
        "BedID": this.item.BedID,
        "TransferID": 0,
        "DoctorID": this.item.SurgeonID,
        "DrugOrderID": "0",
        "ReferenceNo": "",
        "Total": amount,
        "salesType": "IP",
        "Profileid": "0",
        "Items": items,
        "CompanyID": "0",
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,//this.selectedWardId,
        "HospitalID": this.hospitalId,
        "Remarks": "",
        "SurgeryOrderId": "0",
        "SurgeryId": "0",
        "SurgeryType": "-1",
        "BulkProcess": 3
      }
      this.us.post(orchargesDetails.SaveIPORIssues, payload).subscribe((response) => {
        if (response.Status === "Success") {
          $("#saveDailyCharges").modal('show');
        }
        else {
          if (response.Status == 'Fail') {
            this.errorMessage = response.Message;
            //this.errorMessages.push(response.Message2L);
            // this.patientDetails = [];
            $("#errorMsg").modal('show');
          }
        }
      },
        (err) => {

        })
    }
    else {
      this.errorMessage = "Please select any item to save";
      $("#errorMsg").modal('show');
    }
  }

  openOtQuickActions() {
    this.otpatinfo = this.item;
    $("#ot_quickaction_info").modal('show');
  }

  closeOtModal() {
    this.otpatinfo = "";
    $("#ot_quickaction_info").modal('hide');
  }

}

export const orchargesDetails = {
  SaveWardProcedureOrder: 'SaveWardProcedureOrder',
  FetchORWiseDailyCharges: 'FetchORWiseDailyCharges?WardID=${WardID}&HospDeptID=${HospDeptID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchClinicalORChargesView: 'FetchClinicalORChargesView?AdmissionID=${AdmissionID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchItemsOfDepartmentAdv: 'FetchItemsOfDepartmentAdv?filter=${filter}&UserId=${UserId}&intWorkstationId=${intWorkstationId}&HospitalID=${HospitalID}',
  FetchUserFacility: 'FetchUserFacility?UserId=${UserId}&HospitalID=${HospitalID}',
  SaveIPORIssues: 'SaveIPORIssues',
};
