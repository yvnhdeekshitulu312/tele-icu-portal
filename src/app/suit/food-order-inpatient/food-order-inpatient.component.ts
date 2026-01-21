import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FoodOrderInpatientService } from './food-order-inpatient.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { config } from 'src/environments/environment';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
declare var $: any;
@Component({
  selector: 'app-food-order-inpatient',
  templateUrl: './food-order-inpatient.component.html',
  styleUrls: ['./food-order-inpatient.component.scss'],
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
export class FoodOrderInpatientComponent extends BaseComponent implements OnInit {
  isSSNEnter: boolean = false;
  noPatientSelected = false;
  url = '';
  facility: any;
  PatientID: any;
  patientData: any = [];
  FoodList: any = [];
  FoodOrders: any = [];
  IsEdit = false;
  IsPaid: boolean = false;
  foodOrderList = [
    { slNo: 1, foodID: 0, foodname: '', units: '0', quantity: '', itemPrice: 0, amount: 0, foodIssueID: 0, IsPaid: false },
  ];
  errorMsg: string = '';
  selectedFoodIssue: any = [];
  trustedUrl: any;
  collectionReportForm!: FormGroup;
  cashierResponse: any;
  totalCollected = 0;
  enablePrint: boolean = false;
  foodIssueID: number = 0;

  constructor(private service: FoodOrderInpatientService, private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef, private sanitizer: DomSanitizer, private config: ConfigService) {
    super();

    var d = new Date();
    this.collectionReportForm = this.formBuilder.group({
      FromDate: d,
      ToDate: d,
    });

    var d = new Date(); var wm = new Date();
    wm.setDate(wm.getDate() + 1);
    this.collectionReportForm.patchValue({
      FromDate: d,
      ToDate: d
    })
  }

  togglePaid(): void {
    this.IsPaid = !this.IsPaid;
  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
  }

  addRow() {
    const newRow = {
      slNo: this.foodOrderList.length + 1,
      foodID: 0,
      foodname: '',
      units: '0',
      quantity: '',
      itemPrice: 0,
      amount: 0,
      foodIssueID: 0,
      IsPaid: false
    };
    this.foodOrderList.push(newRow);
  }

  deleteRow(index: number) {
    this.foodOrderList.splice(index, 1);
    this.recalculateSlNo();
  }

  recalculateSlNo() {
    this.foodOrderList.forEach((row, index) => (row.slNo = index + 1));
  }

  clear() {
    this.FoodList = [];
    this.noPatientSelected = false;
    this.isSSNEnter = false;
    $("#txtSsn").val("");
    $("#txtRoomNo").val("");
    this.IsEdit = false;
    this.FoodOrders = [];
    this.foodOrderList = [
      { slNo: 1, foodID: 0, foodname: '', units: '0', quantity: '', itemPrice: 0, amount: 0, foodIssueID: 0, IsPaid: false },
    ];
    this.selectedFoodIssue = [];
    this.IsPaid = false;
    this.enablePrint = false;
    this.foodIssueID = 0;
  }

  save() {

    const foodItems = this.foodOrderList.map(order => ({
      foodID: order.foodID,
      quantity: Number(order.quantity) || 0,
      price: order.itemPrice,
    }));

    if (foodItems.filter((x: any) => x.quantity === 0).length > 0) {
      this.errorMsg = "Please enter Quantity";
      $('#errorMsg').modal('show');
      return;
    }

    let payload = {
      "foodIssueID": this.foodOrderList[0].foodIssueID,
      "fdissesSlNO": "",
      "ipid": this.patientData.ipid,
      "issueBedID": this.patientData.bedID,
      "patientID": this.patientData.patientID,
      "cashCredit": false,
      "guestname": "",
      "relationLocation": "",
      "foodOrderID": 0,
      "featureid": 0,
      "functionid": 0,
      "callContext": "",
      "transferID": 0,
      "userid": this.doctorDetails[0].UserId,
      "workstationid": this.facility,
      "isPaid": this.IsPaid,
      "hospitalId": this.hospitalID,
      "foodItems": foodItems
    }

    this.us.postfullurl(foodOrders.savefoodissue, payload).subscribe((response) => {
      if (response.id == "Success") {
        this.enablePrint = true;
        this.foodIssueID = response.status;
        //this.clear();
        $('#saveMessage').modal('show');
      }
    },
      (err) => {
        console.log(err)
      });
  }

  getTotalAmount(): number {
    return this.foodOrderList.reduce((accumulator, row) => accumulator + row.amount, 0);
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
    this.isSSNEnter = true;
    this.noPatientSelected = false;
    this.fetchPatientDetails(ssn, mobileno, patientid);
  }

  fetchPatientDetails(ssn: string, mobileno: string, patientId: string) {
    const params = {
      nationalId: ssn,
      hospitalId: this.hospitalID ?? this.service.param.HospitalID
    };
    const url = this.us.getApiUrl(foodOrders.fetchInPatients, params);
    this.us.getfullurl(url)
      .subscribe((response: any) => {
        if (response.data.length > 0) {
          this.patientData = response.data[0];
          this.getFoodOrders(this.patientData.ipid);
          this.noPatientSelected = true;
          this.foodOrderList = [];
          this.IsEdit = false;
          this.FoodOrders = [];
          this.addRow();
        }
      },
        (err) => {

        })
  }

  searchFoodItems(event: any) {
    if (event.target.value.length >= 3) {
      const params = {
        filter: event.target.value,
        hospitalId: this.hospitalID ?? this.service.param.HospitalID,
        userId: this.doctorDetails[0].UserId,
        workstationId: this.facility
      };
      const url = this.us.getApiUrl(foodOrders.fetchfoodmaster, params);
      this.us.getfullurl(url)
        .subscribe((response: any) => {
          this.FoodList = response.data;
        },
          (err) => {

          })
    }
  }

  getFoodOrders(IPID: any) {
    if (Number(IPID) > 0) {
      const params = {
        filter: 'IPID=' + Number(IPID),
        hospitalId: this.hospitalID ?? this.service.param.HospitalID,
        userId: this.doctorDetails[0].UserId,
        workstationId: this.facility
      };
      const url = this.us.getApiUrl(foodOrders.fetchfoodissueadv, params);
      this.us.getfullurl(url)
        .subscribe((response: any) => {
          this.FoodOrders = response.data;
        },
          (err) => {

          })
    }
  }

  view() {
    $("#savedModal").modal('show');
  }

  validateQuantity(row: any) {
    if (row.quantity > row.units) {
      row.quantity = row.units;
    }
    row.amount = +row.quantity * row.itemPrice;
  }

  onItemSelected(row: any, item: any) {
    this.FoodList = [];
    row.foodname = item.foodname;
    row.units = item.units;
    row.itemPrice = item.itemPrice;
    row.foodID = item.foodID
  }

  selectedOrder(item: any) {
    this.selectedFoodIssue = item;
    this.IsPaid = item.isPaid;
    const params = {
      foodIssueId: item.foodIssueID,
      hospitalId: this.hospitalID ?? this.service.param.HospitalID,
      userId: this.doctorDetails[0].UserId,
      workstationId: this.facility
    };
    const url = this.us.getApiUrl(foodOrders.fetchfoodissue, params);
    this.us.getfullurl(url)
      .subscribe((response: any) => {
        let slNo = 1;

        this.foodOrderList = response.data.map((item: any) => ({
          slNo: slNo++,
          foodID: item.foodID || 0,
          foodname: item.foodname || '',
          units: item.units.toString() || '0',
          quantity: item.quantity || '',
          itemPrice: item.price || 0,
          amount: item.amount || 0,
          foodIssueID: item.foodIssueID || 0,
        }));
        this.IsEdit = true;
        $("#savedModal").modal('hide');
      },
        (err) => {

        })
  }

  findPatient() {

    const url = this.us.getApiUrl(foodOrders.FetchPatientInformationDesk, {
      SSN: '0',
      MobileNo: '0',
      RoomNo: $("#txtRoomNo").val(),
      WorkstationID: this.facility,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientInformationDeskDataList.length > 0) {
          const patientList = response.FetchPatientInformationDeskDataList;
          if (patientList.length > 0) {
            this.fetchPatientDetails(patientList[0]?.SSN, '', '');
          }
        }
        else {
          this.errorMsg = "No Patient Found.";
          $("#errorMsg").modal('show');
          return;
        }
      },
        (err) => {
        })
  }

  delete() {
    $("#foodIssueConfirmation").modal('show');
  }

  deleteFoodIssue() {
    let payload = {
      "foodIssueID": this.selectedFoodIssue?.foodIssueID,
      "remarks": $("#cancelRemarks").val(),
      "userId": this.doctorDetails[0].UserId,
      "workstationId": this.facility,
      "hospitalId": this.hospitalID
    }

    this.us.postfullurl(foodOrders.deleteFoodIssue, payload).subscribe((response) => {
      if (response.id == "Success") {
        this.clear();
        $('#cancelMessage').modal('show');
      }
    },
      (err) => {
        console.log(err)
      });
  }

  foodBillPrint(item: any) {
    const url = this.us.getApiUrl(foodOrders.FoodIssuePrint, {
      FoodIssueID: item.foodIssueID,
      type: 1,
      printedUser: this.doctorDetails[0].UserName,
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.facility,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        this.trustedUrl = response?.Message;
        $('#ipbillPrintModal').modal('show');
      },
        (err) => {
        })
  }

  printFoodIssued() {
    let item: any= [];
    item.foodIssueID = this.foodIssueID;
    this.foodReceiptPrint(item);
  }

  foodReceiptPrint(item: any) {
    const url = this.us.getApiUrl(foodOrders.FoodIssuePrint, {
      FoodIssueID: item.foodIssueID,
      type: 2,
      printedUser: this.doctorDetails[0].UserName,
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.facility,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        this.trustedUrl = response?.Message;
        $('#ipbillPrintModal').modal('show');
      },
        (err) => {
        })
  }

  openCollectionReport() {
    $('#displayCollectionReport').modal('show');

    var fromDate = moment(this.collectionReportForm.value['FromDate']).format('DD-MMM-YYYY');
    var toDate = moment(this.collectionReportForm.value['ToDate']).format('DD-MMM-YYYY');

    const url = this.service.getData(foodOrders.UserWiseDailyCollection, {
      fromDate: fromDate,
      toDate: toDate,
      userName: this.doctorDetails[0]?.UserName,
      workStationId: this.facilitySessionId,
      hospitalId: this.hospitalID,
    });

    if (toDate != null && toDate != '') {
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.cashierResponse = response?.UserWiseDailyCollectionDataList?.length ? response?.UserWiseDailyCollectionDataList : [];
            this.trustedUrl = response?.FTPPATH;
            this.calculateTotals(this.cashierResponse);
          }
        },
          (err) => {
          })
    }
  }
  calculateTotals(cashierResponse: any) {
    if (cashierResponse?.length) {
      const totals = cashierResponse.reduce(
        (acc: any, bill: any) => {
          acc.ReceiptAmount += bill.ReceiptAmount;
          acc.AvailedDeposits += bill.AvailedDeposits;
          acc.TotalRefund += bill.TotalRefund;
          return acc;
        },
        { ReceiptAmount: 0, AvailedDeposits: 0, TotalRefund: 0 }
      );

      // Final calculation
      this.totalCollected =
        totals.ReceiptAmount + totals.AvailedDeposits - totals.TotalRefund;
      this.totalCollected = Number(parseFloat(this.totalCollected.toString()).toFixed(2));
    }
  }

  printDailyCollectionReport() {
    $('#dailyCollectionReportPrint').modal('show');
  }

  closedailyCollReportModal() {
    $('#displayCollectionReport').modal('hide');
  }
}


export const foodOrders = {
  fetchInPatients: `${config.rcmapiurl}` + 'IPBilling/fetchInPatients?nationalId=${nationalId}&patientType=2&isCurrentIp=1&hospitalId=${hospitalId}',
  fetchfoodmaster: `${config.rcmapiurl}` + 'IPBilling/fetchfoodmaster?filter=${filter}&userId=${userId}&workstationId=${workstationId}&hospitalId=${hospitalId}',
  savefoodissue: `${config.rcmapiurl}` + 'IPBilling/savefoodissue',
  fetchfoodissueadv: `${config.rcmapiurl}` + 'IPBilling/fetchfoodissueadv?filter=${filter}&userId=${userId}&workstationId=${workstationId}&hospitalId=${hospitalId}',
  fetchfoodissue: `${config.rcmapiurl}` + 'IPBilling/fetchfoodissue?foodIssueId=${foodIssueId}&userId=${userId}&workstationId=${workstationId}&hospitalId=${hospitalId}',
  FetchPatientInformationDesk: 'FetchPatientInformationDesk?SSN=${SSN}&MobileNo=${MobileNo}&RoomNo=${RoomNo}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
  deleteFoodIssue: `${config.rcmapiurl}` + 'IPBilling/deletefoodissue',
  FoodIssuePrint: 'FoodIssuePrint?FoodIssueID=${FoodIssueID}&type=${type}&printedUser=${printedUser}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  UserWiseDailyCollection: 'UserWiseDailyCollection?fromDate=${fromDate}&toDate=${toDate}&userName=${userName}&hospitalId=${hospitalId}',
};