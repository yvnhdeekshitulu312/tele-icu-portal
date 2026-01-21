import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import * as moment from 'moment';
import { UtilityService } from 'src/app/shared/utility.service';
import { config } from 'src/environments/environment';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-pharmacy-returns',
  templateUrl: './pharmacy-returns.component.html',
  styleUrls: ['./pharmacy-returns.component.scss'],
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
export class PharmacyReturnsComponent extends BaseComponent implements OnInit {
  pharmacyReturnsForm!: FormGroup;
  errorMsg: string = '';
  multiplePatients: any;
  patientDetails: any;
  selectedPatientId: any;
  showSubstituteValidation: boolean = false;
  pharmacyBillNos: any = [];
  selectedBillNo: any;
  selectedBillDetails: any = [];
  selectedPharmacyItems: any = [];
  PatientCashIssuesTable1DataList: any;
  PatientCashIssuesTable4DataList: any;
  showSave: boolean = false;
  calculatecacelpharmacybilldetails: any;
  returnAmount = 0;
  viewBillInfoForm!: FormGroup;
  pharmacyReturnWorklist : any = [];
  pharmacyReturnWorklistDetails: any = [];
  trustedUrl: any;
  pharmacyReturnWorklist1 : any = []
  pharmacyReturnWorklistPatDetails: any = [];
  pharmacyReturnWorklistItemDetails: any = [];
  selectedBillToLoad: any;
  creditreturnAmount = 0;

  constructor(private fb: FormBuilder, private us: UtilityService, private modalSvc: NgbModal) {
    super();


    this.pharmacyReturnsForm = this.fb.group({
      FromDate: [''],
      ToDate: new Date(),
      ssn: [''],
      billNo: ['']
    });

    var wm = new Date();
    var d = new Date();
    wm.setDate(wm.getDate() - 10);
    d.setDate(d.getDate() + 1);
    this.pharmacyReturnsForm.patchValue({
      FromDate: wm,
      ToDate: d
    })

    this.viewBillInfoForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });
    var fromdate = new Date();
    var todate = new Date();
    fromdate.setDate(fromdate.getDate() - 7);
    todate.setDate(d.getDate() + 1);
    this.viewBillInfoForm.patchValue({
      FromDate: fromdate,
      ToDate: todate
    });
  }

  ngOnInit(): void {
  }

  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.fetchPatientDetailsBySsn(event);
    }
  }

  onBillNoEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      const inputval = (event.target as any)?.value;
      if (inputval.length > 0) {
        this.selectedBillNo = this.pharmacyBillNos.find((x: any) => x.OrderSlNo === inputval);
        this.fetchPharmacyIssues(inputval);
      }
    }
  }

  fetchPatientDetailsBySsn(event: any) {
    this.selectedBillNo = null;
    this.patientDetails = [];
    this.selectedPharmacyItems = [];
    this.PatientCashIssuesTable1DataList = null;
    this.PatientCashIssuesTable4DataList = null;
    this.showSave = false;
    $('#billNoDropdown').val('');
    
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

    this.fetchPatient(ssn, "0", "0");
  }

  fetchPatient(ssn: string, mobileno: string, patientId: string) {
    const params = {
      SSN: ssn,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID,
    }
    const url = this.us.getApiUrl(pharmacyreturns.fetchPatientDataBySsn, params);
    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        if (response.FetchPatientDependCLists.length > 1) {
          this.multiplePatients = response.FetchPatientDependCLists;
          $("#divMultiplePatients").modal('show');
        }
        else {
          this.patientDetails = response.FetchPatientDataCCList[0];
          $("#txtSsn").val(this.patientDetails.SSN);
          this.pharmacyReturnsForm.patchValue({
            ssn: this.patientDetails.SSN
          });
          this.viewBillInfo(this.patientDetails.PatientID);
        }
      }
      else {
        this.errorMsg = "No Patient Found";
        $('#errorMsg').modal('show');
      }
    },
      (err) => {

      });
  }

  selectPatient(pat: any) {
    //pat.selected = true;
    this.selectedPatientId = pat.PatientID;
    this.multiplePatients.forEach((element: any, index: any) => {
      this.showSubstituteValidation = false;
      if (element.PatientID === pat.PatientID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
  }

  fetchSelectedPatientPharmacyIssues() {
    const selectedItems = this.selectedBillDetails.filter((x: any) => x.selected);
    if (selectedItems.length === 0) {
      this.showSubstituteValidation = true;
      return;
    }
    else {
      this.selectedPharmacyItems = [];
      this.showSubstituteValidation = false;
      this.selectedBillDetails.forEach((element: any) => {
        if (element.selected) {
          this.selectedPharmacyItems.push(element);
        }
      });
      $('#divPharmacyIssues').modal('hide');
    }
  }

  deleteSelectedItem(index: any, item: any) {
    this.selectedPharmacyItems.splice(index, 1);
    this.calculateReturnAmount();
  }

  calcItemPrice(item: any) {
    if(Number(item.returnQuantity) > Number(item.Quantity)) {
      item.returnQuantity = '';
      this.errorMsg = "Returning Quantity should not be greater than Issued Quantity";
      $('#errorMsg').modal('show');
      return;
    }
    item.calcUPrice = (item.returnQuantity ? parseFloat(item.returnQuantity) : 0) * (parseFloat(item.UPrice) + parseFloat(item.CVAT ? item.CVAT : 0) + parseFloat(item.PVAT ? item.PVAT : 0));
  }

  viewBillInfo(patientid: any) {
    var fromdate = this.pharmacyReturnsForm.get("FromDate")?.value;
    fromdate = moment(fromdate).format('DD-MMM-YYYY');
    var todate = this.pharmacyReturnsForm.get("ToDate")?.value;
    if (todate != null) {
      todate = moment(todate).format('DD-MMM-YYYY');

      const parm = {
        FromDate: fromdate,
        ToDate: todate,
        PatientID: patientid,
        UserID: this.doctorDetails[0]?.UserId,
        WorkstationID: this.facilitySessionId,
        HospitalID: this.hospitalID,
      };

      const url = this.us.getApiUrl(pharmacyreturns.FetchViewBillInfo, parm);
      this.us.get(url).subscribe((response: any) => {
        if (response.Code === 200 && response.FetchViewBillInfoDataList.length > 0) {
          this.pharmacyBillNos = response.FetchViewBillInfoDataList;
        }
        else {
          this.errorMsg = "No Pharmacy bills Found";
          $('#errorMsg').modal('show');
        }
      },
        (err) => {

        });
    }
  }


  onBillNoChange(event: any) {
    const salesno = event.target.value;
    this.selectedBillNo = this.pharmacyBillNos.find((x: any) => x.OrderSlNo === salesno);
    this.fetchPharmacyIssues(salesno);
  }

  fetchPharmacyIssues(salesno: string) {
    this.selectedPharmacyItems = [];
    this.PatientCashIssuesTable1DataList = null;
    this.PatientCashIssuesTable4DataList = null;
    this.showSave = false;
    const salesparam = {
      SalesSlno: salesno,
      UserId: this.doctorDetails[0]?.UserId,
      WorkstationId: this.facilitySessionId,
      HospitalID: this.hospitalID,
    };

    const url = this.us.getApiUrl(pharmacyreturns.FetchPatientCashIssues, salesparam);
    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.PatientCashIssuesTable1DataList = response.PatientCashIssuesTable1DataList;
        this.PatientCashIssuesTable4DataList = response.PatientCashIssuesTable4DataList;
        this.selectedBillDetails = response.PatientCashIssuesTable2DataList;        
        this.selectedBillNo = [];
        //this.fetchPatient(this.PatientCashIssuesTable1DataList[0].PatientSSN, "0", "0");
        this.selectedBillNo = this.PatientCashIssuesTable1DataList[0];
        this.selectedBillNo.SalesDate = moment(this.selectedBillNo.SalesDate).format('DD-MMM-YYYY');
        this.selectedBillNo.OperatorName = this.PatientCashIssuesTable1DataList[0]?.Username;
        this.selectedBillNo.OrderSlNo = this.PatientCashIssuesTable1DataList[0]?.ORDERSLNO;
        this.selectedBillNo.OrderDate = this.PatientCashIssuesTable1DataList[0]?.SalesDate;        
        $('#divPharmacyIssues').modal('show');
      }
      else {
        this.errorMsg = "No Pharmacy issues Found";
        $('#errorMsg').modal('show');
      }
    },
      (err) => {

      });
  }

  clearScreen() {
    var wm = new Date();
    wm.setDate(wm.getDate() - 10);
    this.pharmacyReturnsForm.patchValue({
      FromDate: wm,
      ToDate: new Date(),
      ssn: '',
      billNo: ''
    });
    this.patientDetails = [];
    this.selectedBillNo = [];
    this.selectedPharmacyItems = [];
    this.PatientCashIssuesTable1DataList = null;
    this.PatientCashIssuesTable4DataList = null;
    this.showSave = false;
    this.pharmacyBillNos = [];
    $('#billNoDropdown').val('');
  }

  selectPharmacyItem(item: any) {
    if(Number(item.Quantity) === Number(item.RetQty))
    {
      this.errorMsg = "Quantity fully issued.";
      $('#errorMsg').modal('show');
      return;
    }
    item.selected = !item.selected;
  }

  calculateReturnAmount() {
    if (this.selectedPharmacyItems.length > 0) {
      return this.selectedPharmacyItems.reduce((accumulator: any, currentObject: any) => {
        this.returnAmount = accumulator + (currentObject.calcUPrice ? Number(currentObject.calcUPrice) : 0);
        return accumulator + (currentObject.calcUPrice ? Number(currentObject.calcUPrice) : 0);
      }, 0);
    }
    return 0;
  }

  onSaveClick(type: any) {
    if (this.selectedPharmacyItems.length === 0 || this.calculateReturnAmount() === 0) {
      return;
    }
    let cnItems = [];
    let dnItems = [];
    let contributions = [];
    let discounts = [];
    let billDetails = [];
    if (type === 'CR') {
      cnItems = this.calculatecacelpharmacybilldetails.cnItems;
      dnItems = this.calculatecacelpharmacybilldetails.dnItems
      contributions = this.calculatecacelpharmacybilldetails.contributions ?? [];
      discounts = this.calculatecacelpharmacybilldetails.discounts ?? [];
      billDetails = this.calculatecacelpharmacybilldetails.billDetails;
      billDetails.forEach((item: any) => {
        item.OrderSlNo = this.selectedBillNo.OrderSlNo;
        item.OrderDate  = this.selectedBillNo.SalesDate;
      });
    }
    const payload = {
      "salesID": this.PatientCashIssuesTable1DataList[0].SalesID,
      "salesNo": this.PatientCashIssuesTable1DataList[0].ORDERSLNO,
      "returnType": type === 'CR' ? 'CR' : "IR",
      "billType": "",
      "patientType": 6,
      "patientID": this.PatientCashIssuesTable1DataList[0].PatientID,
      "ipid": this.PatientCashIssuesTable1DataList[0].IPID,
      "titleID": 0,
      "bedID": 0,
      "orderBedType": 0,
      "doctorID": this.PatientCashIssuesTable1DataList[0].DoctorID,
      "drugOrderID": 0,
      "referenceNo": "",
      "total": this.PatientCashIssuesTable1DataList[0]?.totalBillAmount, //caluclate amount
      "salesType": this.PatientCashIssuesTable1DataList[0].SalesType,
      "paymentModeID": 1,
      "patientName": this.PatientCashIssuesTable1DataList[0].FullName,
      "ageUoMID": this.PatientCashIssuesTable1DataList[0].AgeUoMID,
      "age": this.PatientCashIssuesTable1DataList[0].Age,
      "genderID": this.PatientCashIssuesTable1DataList[0].GenderID,
      "bankID": 0,
      "cardID": 0,
      "amount": this.PatientCashIssuesTable1DataList[0]?.SalesType === 'CR' ? this.creditreturnAmount : this.returnAmount,
      "discount": 0,
      "credit": 0,
      "payTranNumber": "",
      "cardNumber": "",
      "companyID": (this.PatientCashIssuesTable1DataList[0].CompanyID == undefined || this.PatientCashIssuesTable1DataList[0].CompanyID == "") ? 0 : this.PatientCashIssuesTable1DataList[0].CompanyID,
      "gradeID": (this.PatientCashIssuesTable1DataList[0].GradeID == undefined || this.PatientCashIssuesTable1DataList[0].GradeID == "") ? 0 : this.PatientCashIssuesTable1DataList[0].GradeID,
      "userid": this.doctorDetails[0]?.UserId,
      "workstationid": this.facilitySessionId,
      "prescriptionID": 0,
      "orderStatus": 0,
      "doctorName": this.PatientCashIssuesTable1DataList[0].DoctorName,
      "receiptAmount": this.PatientCashIssuesTable1DataList[0]?.SalesType === 'CR' ? this.creditreturnAmount : this.returnAmount,
      "totalReceiptAmount": this.PatientCashIssuesTable1DataList[0]?.SalesType === 'CR' ? this.creditreturnAmount : this.returnAmount,
      "memberShipTypeID": 0,
      "memberShipCode": "",
      "remarks": "",
      "deliveryCharges": 0,
      "discountType": 0,
      "discountID": 0,
      "cardIssueDate": "",
      "cardValidityDate": "",
      "firstName2l": "",
      "careOfEmpID": 0,
      "careOfReason": "",
      "hospitalid": this.hospitalID,
      "profileid": 0,
      "refDoctorID": 0,
      "draftSalesID": 0,
      "discountApprovedBy": 0,
      "collectedAmount": 0,
      "changerendered": 0,
      "isStaffIssue": true,
      "posTransactionRefNo": "",
      "posTransactionResult": "",
      "items": this.selectedPharmacyItems.map((item: any, index: number) => {
        return {
          "sequence": index + 1,
          "hospDeptId": this.facilitySessionId,
          "itemID": item.ItemID,
          "packId": item.PackId,
          "uoMID": item.UoMID,
          "tax": item.Tax,
          "quantity": item.returnQuantity,
          "unitRate": item.UPrice,
          "batchID": item.BatchId,
          "salesTax": item.SalesTax,
          "taxAmount": item.TaxAmount,
          "orderItemID": 0,
          "prescriptionID": 0,
          "status": 0,
          "discountType": 0,
          "discount": 0,
          "issueQTY": item.Quantity,
          "issueUOMID": item.UoMID,
          "drugOrderStatus": 0,
          "remarks": "",
          "isbillable": true,
          "issubstitute": true,
          "sticker": "",
          "frequencyRmkCode": "",
          "frequencyrmk": "",
          "frequencyRmk2l": "",
          "unitRateExclDISC": 0
        }
      }),
      "payments": [],
      billDetails,
      contributions,
      "letterID": [
        {
          "lettterId": this.PatientCashIssuesTable4DataList && this.PatientCashIssuesTable4DataList[0]?.LetterID ? this.PatientCashIssuesTable4DataList[0]?.LetterID : 0
        }
      ],
      "creditPayments": [],
      discounts,
      cnItems,
      dnItems,
      "billID": this.PatientCashIssuesTable1DataList[0].billID,
      "billNo": this.PatientCashIssuesTable1DataList[0].OPBillNO,
      "visitNumber": "",
      "billDate": "",
      "visitID": this.PatientCashIssuesTable1DataList[0].IPID,
      "visitTYpe": 0,
      "newVisitID": 0,
      "episodeID": 0,
      "depositAvailed": 0,
      "cashDiscount": 0,
      "empID": 0,
      "parentBillID": 0,
      "agreementId": 0,
      "copay": 0,
      "cash": this.PatientCashIssuesTable1DataList[0].CollectedAmount === '' ? 0 : this.PatientCashIssuesTable1DataList[0].CollectedAmount,
      "cvat": this.PatientCashIssuesTable1DataList[0].CVAT ? this.PatientCashIssuesTable1DataList[0].CVAT : 0,
      "pvat": this.PatientCashIssuesTable1DataList[0].PVAT ? this.PatientCashIssuesTable1DataList[0].PVAT : 0,
      "returnAmount": this.PatientCashIssuesTable1DataList[0]?.SalesType === 'CR' ? this.creditreturnAmount : this.returnAmount,
      "cancelAuthorisedBy": this.doctorDetails[0].UserId,
      "status": 2,
      "cancelType": 1
    };
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.us.postbill(pharmacyreturns.pharmacyreturnsave, payload).subscribe((response) => {
          if (response.data == "Success") {
            this.clearScreen();
            $("#savemsg").modal('show');
          }
        },
          (err) => {
            console.log(err)
          });
      }
      modalRef.close();
    });
  }

  getBillDetails() {
    if (this.selectedPharmacyItems.length === 0) {
      return;
    }
    const params = {
      billNumber: this.PatientCashIssuesTable1DataList[0].OPBillNO,
      billId: 0,
      hospitalId: this.hospitalID,
      userId: this.doctorDetails[0].UserId,
      workStationId: this.facilitySessionId
    };
    const url = this.us.getApiUrl(pharmacyreturns.billdetails, params);
    this.us.getbill(url).subscribe((response: any) => {
      if (response.status === 'Success') {
        this.selectedPharmacyItems.forEach((item: any) => {
          let qtyCount = 1;
          const qty = Number(item.returnQuantity);
          response.data.billDetails.forEach((a: any) => {
            if (a.serviceItemID.toString() === item.ItemID.toString()) {
              if (qty >= qtyCount) {
                a.isItemCancelled = true;
              }
              qtyCount++;
            }
          });
        });

        const billdetails = response.data.billDetails;

        const params = {
          "patientId": this.PatientCashIssuesTable1DataList[0].PatientID,
          "billID": this.PatientCashIssuesTable1DataList[0].BillID,
          "ipid": this.PatientCashIssuesTable1DataList[0].IPID,
          "tariffID": this.PatientCashIssuesTable1DataList[0].TariffID ? this.PatientCashIssuesTable1DataList[0].TariffID : 0,
          "companyID": this.PatientCashIssuesTable1DataList[0].CompanyID,
          "companyName": this.PatientCashIssuesTable1DataList[0].CompanyName,
          "doctorID": this.PatientCashIssuesTable1DataList[0].DoctorID,
          "billType": this.PatientCashIssuesTable1DataList[0].SalesType,
          "gradeID": this.PatientCashIssuesTable1DataList[0].GradeID,
          "letterID": this.PatientCashIssuesTable4DataList[0].LetterID,
          "nationalityID": 0,
          "hospitalId": this.hospitalID,
          "workStationId": this.facilitySessionId,
          "userId": this.doctorDetails[0]?.UserId,
          "doctorSpecialityId": this.PatientCashIssuesTable1DataList[0].SpecialiseID,
          "discountPercentage": 0,
          billdetails,
          "cancellPharmacyItems": this.selectedPharmacyItems.map((item: any) => {
            return {
              ItemId: item.ItemID,
              Quantity: item.returnQuantity,
              BatchId: item.BatchId,
              UomId: item.UoMID
            }
          })
        };
        this.us.postbill(pharmacyreturns.calculatecacelpharmacybill, params).subscribe((response: any) => {
          if (response.status === 'Success') {
            this.calculatecacelpharmacybilldetails = response.data;
            this.calculatecacelpharmacybilldetails.billDetails = billdetails;
            this.creditreturnAmount = this.calculatecacelpharmacybilldetails?.returnAmount;
            this.showSave = true;
          }
        });
      }
    },
      (err) => {

      });
  }

  viewPharmacyReturns() {
    var fromdate = this.viewBillInfoForm.get("FromDate")?.value;
        fromdate = moment(fromdate).format('DD-MMM-YYYY');
        var todate = this.viewBillInfoForm.get("ToDate")?.value;
        if (todate != null) {
          todate = moment(todate).format('DD-MMM-YYYY');
    
          var payload = {
            //filter: "BLOCKED=0 AND ORDERHOSPID='" + this.hospitalID + "' AND HospDeptId='" + this.facilitySessionId + "' AND CREATEDATE >= '" + fromdate + "' AND CREATEDATE <='" + todate + "'",
            fromdate: fromdate,
            todate: todate,
            hospDeptId: this.facilitySessionId,
            userId: this.doctorDetails[0]?.UserId,
            workstationId: this.facilitySessionId,
            hospitalId: this.hospitalID,    
          };
          const url = this.us.getApiUrl(pharmacyreturns.FetchViewPatientCashReturns, payload);
          this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
              this.pharmacyReturnWorklist = this.pharmacyReturnWorklist1 = response.FetchPatientCashReturnsWorklistDataList;     
              $('#divViewBillInfo').modal('show');
            }
            else {
              this.errorMsg = "No Pharmacy issues Found";
              $('#errorMsg').modal('show');
            }
          },
            (err) => {

            });
        }
  }

  selectReturn(pres:any) {
    this.selectedBillToLoad = pres;
    this.pharmacyReturnWorklist.forEach((element: any, index: any) => {
      if (element.SaleReturnID === pres.SaleReturnID) {
        element.selected = true;
        this.viewPharmacyReturnsDetails(element);
      }
      else {
        element.selected = false;
      }
    });
  }

  viewPharmacyReturnsDetails(item: any) {
    var returnDetails = {
      SaleReturnID : item.SaleReturnID,
      tbl: 0,
      userId: this.doctorDetails[0]?.UserId,
      workstationId: this.facilitySessionId,
      hospitalId: this.hospitalID,    
    };
    const url = this.us.getApiUrl(pharmacyreturns.FetchPatientCashReturnsDetails, returnDetails);
    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.pharmacyReturnWorklistPatDetails = response.FetchPatientCashReturnsDetailsDataList;     
        this.pharmacyReturnWorklistItemDetails = response.FetchPatientCashReturnsDetailsDataItemsList;     
      }
      else {
        this.errorMsg = "No Pharmacy issues Found";
        $('#errorMsg').modal('show');
      }
    },
      (err) => {

      });        
  }

  onViewBillsSSNSearch(event: any) {
    const ssn= event.target.value;
    if(ssn === '') {
      this.pharmacyReturnWorklist = this.pharmacyReturnWorklist1;
    }
    else {
      this.pharmacyReturnWorklist = this.pharmacyReturnWorklist1.filter((x: any) => x.SSN.toString().trim().includes(ssn));
    }
  }

  pharmacyReturnPrint(item: any) {
    var returnDetails = {
      SaleReturnID : item.SaleReturnID,
      tbl: 0,
      userId: this.doctorDetails[0]?.UserId,
      workstationId: this.facilitySessionId,
      hospitalId: this.hospitalID,    
    };
    const url = this.us.getApiUrl(pharmacyreturns.FetchPatientCashReturnsPrint, returnDetails);
    this.us.get(url).subscribe((response: any) => {
      this.trustedUrl = response?.Message;
        $("#opPharmacyBillPrint").modal('show');
    },
      (err) => {

      });
  }

  clearBillInfo() {
    this.pharmacyReturnWorklist = [];
    this.pharmacyReturnWorklistDetails = []
    $("#viewBillSSN").val('');
  }
}


export const pharmacyreturns = {
  FetchViewBillInfo: 'FetchViewBillInfoForPharmacyReturn?FromDate=${FromDate}&ToDate=${ToDate}&PatientID=${PatientID}&UserID=${UserID}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientCashIssues: 'FetchPatientCashIssues?SalesSlno=${SalesSlno}&UserId=${UserId}&WorkstationId=${WorkstationId}&HospitalID=${HospitalID}',
  pharmacyreturnsave: `${config.rcmapiurl}` + 'OPBilling/pharmacyreturnsave',
  billdetails: `${config.rcmapiurl}` + 'OPBilling/billdetails?billNumber=${billNumber}&billId=${billId}&hospitalId=${hospitalId}&userId=${userId}&workStationId=${workStationId}',
  calculatecacelpharmacybill: `${config.rcmapiurl}` + 'OPBilling/calculatecacelpharmacybill',
  FetchPatientCashReturnsWorklist:'FetchPatientCashReturnsWorklist?filter=${filter}&userId=${userId}&workstationId=${workstationId}&hospitalId=${hospitalId}',
  FetchPatientCashReturnsDetails:'FetchPatientCashReturnsDetails?SaleReturnID=${SaleReturnID}&tbl=${tbl}&userId=${userId}&workstationId=${workstationId}&hospitalId=${hospitalId}',
  FetchPatientCashReturnsPrint:'FetchPatientCashReturnsPrint?SaleReturnID=${SaleReturnID}&tbl=${tbl}&userId=${userId}&workstationId=${workstationId}&hospitalId=${hospitalId}',
  FetchViewPatientCashReturns:'FetchViewPatientCashReturns?fromdate=${fromdate}&todate=${todate}&hospDeptId=${hospDeptId}&userId=${userId}&workstationId=${workstationId}&hospitalId=${hospitalId}',
};