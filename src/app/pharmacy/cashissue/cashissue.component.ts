import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CashissueService } from './cashissue.service';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Router } from '@angular/router';
import { ConfigService as PresConfig } from 'src/app/services/config.service';
import { ConfigService as AppConfig } from 'src/app/services/config.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import * as moment from 'moment';
import { isSubscription } from 'rxjs/internal/Subscription';
import { config } from 'src/environments/environment';
import * as Highcharts from 'highcharts';
import { PatientfoldermlComponent } from 'src/app/shared/patientfolderml/patientfolderml.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { MatSnackBar } from '@angular/material/snack-bar';

declare var $: any;

@Component({
  selector: 'app-cashissue',
  templateUrl: './cashissue.component.html',
  styleUrls: ['./cashissue.component.scss'],
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
export class CashissueComponent extends BaseComponent implements OnInit {

  @ViewChildren('barcodeInput')
  barcodeInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChild('scanBox') scanBox!: ElementRef;
  selectall = false;
  showBillSummary = false;
  showSaveBtn = true;
  showSubstiteEntry = false;
  url: any;
  patientPrescriptionsList: any;
  patientPrescriptionsDetails: any;
  patientPrescriptionStockDetails: any = [];
  patientPrescriptionItemUomDetails: any;
  patientPrescriptionCompanyDetails: any;
  prescriptionLowestQtyDetails: any;
  pinfo: any;
  selectedPatientId: string = "";
  selectedAdmissionId: string = "";
  counterMaster: any;
  patientDetails: any;
  multiplePrescriptions: any;
  viewRxPrescriptions: any = [];
  viewRxPrescriptions1: any = [];
  showNoRecFound: boolean = true;
  selectedDoctor: string = "";
  selectedDoctorId: string = "";
  selectedPrescDate: string = "";
  selectedConsType: string = "";
  selectedPrescDateTime: string = "";
  errorMessage: any;
  medicationScheduleitems: any = [];
  isCash = true;
  itemForSubstitute: any;
  itemSelectedForSubstitute: any;
  FetchSubstituteItemsDList: any;
  itemForSubstitueUnits: any;
  remarksForSelectedHoldItemName: any;
  selectedHoldReason: string = "0";
  selectedHoldReason_prev: string = "0";
  remarksForSelectedHoldItemId_prev: any;
  remarksForSelectedHoldPrescId_prev: any;
  remarksForSelectedHoldItemName_prev: any;
  holdReasonValidation: boolean = false;
  holdReasonValidation_prev: boolean = false;
  holdMasterList: any = [];
  remarksSelectedIndex: number = -1;
  remarksForSelectedHoldItemId: any;
  remarksForSelectedHoldPrescId: any;
  holdBtnName: string = 'Hold';
  selectedPrescription: any;
  showSubstituteValidation = false;
  totalAmount = 0.00;
  itemForDelete: any;
  showOtcEntry = false;
  listOfItems: any;
  selectedOtcItem: any;
  selectedOtcItemUomDetails: any;
  showOtcOption = false;
  selectedPrescriptionToLoad: any;
  multiplePatients: any
  IndMedicationHistoryDataList: any = [];
  viewMoreMedicationsForm!: FormGroup;
  PatientViewMoreSearchMedicationsList: any;
  PatientViewMoreMedicationsList: any;
  medStatus: string = "active";
  medfromDate = new FormControl(new Date());
  medtoDate = new FormControl(new Date());
  toDate = new FormControl(new Date());
  datesForm: any;
  trustedUrl: any;
  tablePatientsForm!: FormGroup;
  viewBillInfoForm!: FormGroup;
  billSummary: any;
  billSummarynonSFDA: any;
  billSummarysfda: any;
  patientSummary = false;
  billNumber: string = "";
  billId: number = 0;
  billSummaryform!: FormGroup;
  prescriptionForm!: FormGroup;
  TotalWithoutVAT: any;
  BillAmountWithVAT: any;
  NetBillAmount: any;
  VATAmount: any;
  receiptAmount: any;
  DiscountAmount: any;
  discountBy: any = [];
  validateDiscount = false;
  billSummarybtn = true;
  orderStatus: any;
  ItemUoms: any;
  PrintItemIDS: any;
  LOAAprovalEntry: any = [];
  LOAAprovalEntryDetails: any = [];
  notCoveredItems: any = [];
  calculateBillResponse: any = [];
  facility: any;
  hospdepdid = 0;
  patientDiagnosis: any = [];
  diagStr: any;
  patientHigh: any;
  smartDataList: any;
  showResultsinPopUp = false;
  showTokenScan: boolean = false;
  counterId: any;
  counterNo: any;
  aprrovalRequests: any[] = [];
  aprrovalRequestDetails: any[] = [];
  posTransactionResult: any;
  posTransRefNo: any;
  EDCMachineID: any;
  CardNumber: any;
  CardType: any;
  viewPharmacyBills: any = [];
  viewPharmacyBills1: any = [];
  selectedBillToLoad: any;
  billCashIssues: any = [];
  collectableInfo: any;
  userIPAddress: any;
  IsDisabled = true;
  IsCounterDisable = false;
  selectedCounter = '0';
  collectionReportForm!: FormGroup;
  cashierResponse: any;
  totalCollected = 0;
  splitPay: boolean = false;
  fromNotBilledOrders: boolean = false;
  isCardCollectable: number = 0;
  limitVal: any;
  isPercentage: boolean = false;

  constructor(private router: Router, private fb: FormBuilder, private us: UtilityService, private appconfig: AppConfig, public datepipe: DatePipe, private service: CashissueService, public formBuilder: FormBuilder, private presconfig: PresConfig, private modalService: NgbModal, private modalSvc: GenericModalBuilder, private snackBar: MatSnackBar) {
    super();
    this.datesForm = this.formBuilder.group({
      StatFilter: [false]
    });
    this.tablePatientsForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });

    var wm = new Date();
    var d = new Date();
    wm.setMonth(wm.getMonth() - 1);
    this.tablePatientsForm.patchValue({
      FromDate: d,
      ToDate: d
    });

    var d = new Date();
    this.collectionReportForm = this.fb.group({
      FromDate: d,
      ToDate: d,
    });

    var d = new Date();
    wm.setDate(wm.getDate() + 1);
    this.collectionReportForm.patchValue({
      FromDate: d,
      ToDate: d
    })

    this.viewBillInfoForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });

    var wm = new Date();
    var d = new Date();
    wm.setDate(wm.getDate() + 1);
    this.viewBillInfoForm.patchValue({
      FromDate: d,
      ToDate: wm
    })

    this.billSummaryform = this.fb.group({
      TotalWithoutVAT: [''],
      BillAmountWithVAT: [''],
      NetBillAmount: [''],
      VATAmount: [''],
      DiscountPerc: [''],
      DiscountSAR: [''],
      ModeofPayment: [1],
      ReceiptAmount: [''],
      CollectedAmount: [''],
      ChangeToBeRendered: [''],
      cashCollectedAmount: [''],
      cardCollectedAmount: [''],
      Remarks: [''],
      AuthorizedBy: ['0']
    });

    this.prescriptionForm = this.fb.group({
      "ItemName": [''],
      "ItemID": [''],
      "BatchNo": [''],
      "BatchId": [''],
      "DedQty": [''],
      "Tax": [''],
      "UPrice": [''],
      "Qty": [''],
      "Unit": [''],
      "PackId": [''],
      "UID": [''],
      "UOM": [''],
      "Amount": [''],
      "ExpiryDate": [''],
      "QOH": [''],
      "MRP": [''],
      "RPU": [''],
      "ItemCode": [''],
      "LPrice": [''],
      "IssuedQty": [''],
      "IssuedUOM": [''],
      "ActIssueQTY": [''],
      "IsNarcotic": [''],
      "IsHighRisk": [''],
      "GenericID": [''],
      "IsDrugFlowApproval": [''],
      "DrugFlowApprovalStatus": [''],
      "GenericItemID": [''],
      "GenericName": [''],
      "PrescriptionQtyLowest": [''],
      "IssuedQtyLowest": [''],
      "ISPRN": [''],
      "PRNMedicationReason": [''],
      "CD": [''],
      "CF": [''],
      "ReasonForHolding": [''],
      "HoldStatus": [''],
      "PrescriptionItemsHoldReasonID": [''],
      "PrescriptionItemsHoldReason": [''],
      "PrescriptionItemsHoldReason2l": [''],
      "IsTaxApplicableForResidants": [''],
      "IsLASA": [''],
      "IsCytotoxic": [''],
      "IsRefrigerated": [''],
      "IsElectrolyte": [''],
      "HighRiskColor": [''],
      "LASAColor": [''],
      "CytotoxicColor": [''],
      "FrequencyUomID": [''],
      "SpecialConfiguration": [''],
      "TimeInterval": [''],
      "PHApprovalStatus": [''],
      "DFFrequencyQTY": [''],
      "Duration": [''],
      "DurationId": [''],
      "StartFrom": [''],
      "Frequency": [''],
      "PrescribedGenericItemID": [''],
      "ItemGroupTypeName": [''],
      "GTIN": [''],
      "IsScanned2D": [''],
      "GenericItemName": [''],
      "IssueUOMID": [''],
      "Print": [''],
      "ItemLocationWiseStock": ['']
    });


  }

  get items(): FormArray {
    return this.prescriptionForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.hospdepdid = Number(this.facility.Hospdeptid);
    //this.fetchCountersMaster();
    this.FetchHoldMaster();

    const savedCounter = sessionStorage.getItem('counter');
    if (savedCounter) {
      this.selectedCounter = savedCounter;

      const dropdown = document.getElementById('counter') as HTMLSelectElement;
      if (dropdown) {
        const event = new Event('change', { bubbles: true });
        dropdown.value = savedCounter;
        dropdown.dispatchEvent(event);
      }
    }

    this.initializeviewMoreMedicationsForm();
    this.prescriptionForm = this.fb.group({
      items: this.fb.array([])
    });
    this.getUserMachineIPAddress();

    this.fromNotBilledOrders = sessionStorage.getItem("fromNotBilledOrders") === "true" ? true : false;
    if (this.fromNotBilledOrders) {
      const ssn = sessionStorage.getItem("ssn") ?? '';
      this.fetchPrescriptions(ssn, "0", "0");
    }

  }

  getUserMachineIPAddress() {
    this.service.getipdetails().subscribe((data) => {
      if (data.ipAddress) {
        this.userIPAddress = data.ipAddress;
      }
    });
  }

  initializeviewMoreMedicationsForm() {
    this.viewMoreMedicationsForm = this.fb.group({
      medfromdate: [''],
      medtodate: ['']
    });
  }

  onCounterChange(event: any) {
    this.selectedCounter = event.target.value;
    if (event.target.value !== "0") {
      this.showTokenScan = true;
      this.counterId = event.target.value;
      this.counterNo = event.target.options[event.target.options.selectedIndex].text;
      this.IsCounterDisable = true;
      this.IsDisabled = false;
      sessionStorage.setItem("counter", event.target.value);
    }
    else {
      this.showTokenScan = false;
      this.IsDisabled = true;
    }
  }

  onBodyClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isInsideSelect = target.closest('#counter') !== null;

    if (!isInsideSelect && this.selectedCounter === '0') {
      $("#counterValidation").modal('show');
    }
  }


  fetchCountersMaster() {
    this.service.fetchTokenCounterMaster = {
      ...this.service.fetchTokenCounterMaster,
      Type: 896,
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.facilitySessionId ?? this.service.fetchTokenCounterMaster.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    }
    this.url = this.service.fetchGlobalMaster(cashissue.fetchCounterMaster);
    this.service.fetchGlobalMaster(this.url);
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.counterMaster = response.GlobalItemMastersDataList;
        }
      },
        (err) => {

        })
  }


  billSummaryCashIssue() {

    if (this.patientPrescriptionsDetails.length === 0) {
      this.errorMessage = "No prescriptions to bill";
      $("#errorMsg").modal("show");
      return;
    }
    var pharmacyItems: any[] = [];

    this.patientPrescriptionsDetails.forEach((element: any, index: any) => {
      var loaAprovalEntryID = 0; var claimStatusID = 0; var statusName = ""; var approvalAMT = 0;
      if (this.LOAAprovalEntryDetails.length > 0) {
        const loaAprvlEntryData = this.LOAAprovalEntryDetails.find((x: any) => x.ItemID === element.ItemID);
        loaAprovalEntryID = loaAprvlEntryData.EntryID;
        claimStatusID = loaAprvlEntryData.ClaimStatusID;
        statusName = loaAprvlEntryData.ClaimStatus;
        approvalAMT = loaAprvlEntryData.LimitApprovalAmount;
      }

      pharmacyItems.push({
        "serviceId": 10,
        "itemId": element.ItemID,
        "quantity": element.ActIssueQTY,
        "issueQuantityUomId": element.UID,
        "itemName": element.ItemName,
        "itemGroupId": element.ItemGroupTypeId === '' ? '0' : element.ItemGroupTypeId,
        "specialityId": 0,
        "orderTypeId": 0,
        "specimenId": 0,
        "serviceTypeId": 8,
        "prescriptionId": this.selectedPrescription.PrescriptionID,
        "orderDate": this.selectedPrescription.OrderDate,
        "scheduleDate": "",
        "doctorId": this.selectedPrescription.DoctorID,
        "hospDeptId": this.facilitySessionId, //this.hospdepdid,
        "loaAprovalEntryID": loaAprovalEntryID,
        "claimStatusID": claimStatusID,
        "statusName": statusName,
        "approvalAMT": approvalAMT,
        "isProfChargesApplicable": 0,
        "itemSequence": index + 1
      })
    });

    var payload = {
      "patientId": this.selectedPatientId,
      "admissionId": this.selectedAdmissionId,
      "agreementId": this.patientPrescriptionCompanyDetails.AgreementId === '' ? -1 : this.patientPrescriptionCompanyDetails.AgreementId,
      "billType": this.isCash ? '1' : '2',
      "companyId": this.patientPrescriptionCompanyDetails.CompanyID === '' ? 0 : this.patientPrescriptionCompanyDetails.CompanyID,
      "gradeId": this.patientPrescriptionCompanyDetails.GradeID === '' ? 0 : this.patientPrescriptionCompanyDetails.GradeID,
      "loaId": this.patientPrescriptionCompanyDetails.LOAID === '' ? 0 : this.patientPrescriptionCompanyDetails.LOAID,
      "hospDeptId": this.facilitySessionId, //this.hospdepdid,
      "bedTypeId": -1,
      "hospitalId": this.hospitalID,
      "discountPercentage": 0,
      "isSaudiNationality": this.patientDetails.Nationality == 'Saudi' ? true : false,
      "doctorSpecialityId": this.selectedPrescription.SpecialiseID,
      "userId": this.doctorDetails[0].UserId,
      "workStationId": this.facilitySessionId,
      "items": pharmacyItems
    }

    this.us.postbill(cashissue.calculatepharmacybill, payload)
      .subscribe((response: any) => {
        if (response.status == 'Success') {
          this.showBillSummary = true;
          this.showSaveBtn = false;
          this.billSummary = response.data;
          this.billSummaryform.patchValue({
            TotalWithoutVAT: this.billSummary?.netBillAmountWithOutVat,
            BillAmountWithVAT: this.billSummary?.netBillAmountWithVat,
            NetBillAmount: this.billSummary?.billAmount,
            VATAmount: parseFloat(this.billSummary?.totalVat).toFixed(2),
            DiscountPerc: "",
            DiscountSAR: "",
            ModeofPayment: this.billSummaryform.get('ModeofPayment')?.value,
            ReceiptAmount: parseFloat(this.billSummary?.netBillAmountWithOutVat).toFixed(2),
            CollectedAmount: "",
            ChangeToBeRendered: "",
            Remarks: "",
            cashCollectedAmount: '',
            cardCollectedAmount: ''
          });
          this.TotalWithoutVAT = this.billSummary?.netBillAmountWithOutVat;
          this.BillAmountWithVAT = this.billSummary?.netBillAmountWithVat;
          this.NetBillAmount = this.billSummary?.billAmount;
          this.VATAmount = this.billSummary?.vatAmount;
          this.DiscountAmount = this.billSummary?.totalDiscount;
        }
      },
        (err) => {

        })
  }



  calculateDiscount(event: any) {
    const discount = event.target.value;
    if (discount > 100) {
      this.errorMessage = "Discount cannot be greater than 100%";
      this.billSummaryform.patchValue({
        DiscountPerc: ''
      })
      $("#errorMsg").modal("show");
      return;
    }

    var pharitems: any[] = [];
    this.patientPrescriptionsDetails.forEach((element: any) => {
      pharitems.push({
        "UPrice": element.UPrice,
        "Qty": element.Qty,
        "Tax": element.Tax
      })
    });

    var payload = {
      "Discount": discount,
      "USERID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      "WORKSTATIONID": this.facilitySessionId ?? this.service.param.WorkStationID,
      "HospitalID": this.hospitalID ?? this.service.param.HospitalID,
      "CashIssueItemsPrDetails": pharitems
    }

    this.us.post(cashissue.CashIssueDiscountCal, payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.billSummaryform.patchValue({
            DiscountSAR: response.Discount,
            NetBillAmount: response.NetBillamount,
            BillAmountWithVAT: response.BillAmountWithVAT,
            ReceiptAmount: parseFloat(response.ReceiptAmount).toFixed(2),
            cashCollectedAmount: '',
            cardCollectedAmount: ''
          });
          //this.TotalWithoutVAT = this.billSummary?.netBillAmountWithOutVat;
          this.BillAmountWithVAT = response.BillAmountWithVAT;
          this.NetBillAmount = response.NetBillamount;
          this.VATAmount = response.VATAmount;
          this.DiscountAmount = response.Discount;
          this.discountBy = response.AuthorizeUserLisrListList;
        }
      },
        (err) => {

        })

  }

  onDiscountByChange(event: any) {
    this.validateDiscount = true;
    // var docid = event.target.value;
    // const modalRef = this.modalService.open(ValidateEmployeeComponent);
    //     modalRef.componentInstance.dataChanged.subscribe((data: string) => {
    //       if (data) {
    //         this.appconfig.FetchEmployeeSignaturesBase64(docid, this.doctorDetails[0].UserId, 3392, this.hospitalID)
    //           .subscribe((response: any) => {                
    //             setTimeout(() => {
    //               this.validateDiscount = true;
    //             }, 0);    
    //           },
    //             (err) => {
    //             })
    //       }
    //       modalRef.close();
    //     });
  }

  calculateChangeRendered() {
    const billAmount = this.billSummaryform.get('ReceiptAmount')?.value;
    const collectedAmount = this.billSummaryform.get('CollectedAmount')?.value;

    if (Number.parseFloat(billAmount) > Number.parseFloat(collectedAmount)) {
      this.errorMessage = "Collected Amount : " + collectedAmount + " Should not be Less than Receipt Amount :" + billAmount;
      this.billSummaryform.patchValue({
        CollectedAmount: '',
        ChangeToBeRendered: '',
        cashCollectedAmount: '',
        cardCollectedAmount: ''
      })
      $("#errorMsg").modal("show");
      return;
    }
    const changetoberendered = Number.parseFloat(collectedAmount) - Number.parseFloat(billAmount);
    this.billSummaryform.patchValue({
      ChangeToBeRendered: Number.parseFloat(changetoberendered.toString()).toFixed(2),
      cashCollectedAmount: '',
      cardCollectedAmount: ''
    })
  }

  closeBillSummary() {
    this.showBillSummary = false;
  }

  clearCashIssue() {
    $("#txtSsn").val(''); $("#txtToken").val('');
    this.selectedAdmissionId = ""; this.selectedPatientId = ""; this.pinfo = ""; this.selectedDoctor = ""; this.selectedDoctorId = ""; this.selectedPrescDate = ""; this.selectedPrescDateTime = "";
    this.selectedConsType = "";
    this.showNoRecFound = true; this.showBillSummary = false; this.showSubstiteEntry = false; this.isCash = true; this.showSubstituteValidation = false; this.showOtcEntry = false; this.showOtcOption = false;
    this.selectedPrescription = []; this.itemForSubstitute = []; this.FetchSubstituteItemsDList = []; this.itemSelectedForSubstitute = []; this.itemForSubstitute = [];
    this.patientPrescriptionsDetails = []; this.multiplePrescriptions = []; this.patientDetails = []; this.patientPrescriptionItemUomDetails = []; this.listOfItems = [];
    this.selectedOtcItemUomDetails = []; this.selectedOtcItem = []; this.multiplePatients = [];
    this.totalAmount = 0;
    this.datesForm = this.formBuilder.group({
      StatFilter: [false]
    });
    this.billNumber = "";
    this.diagStr = "";
    this.billSummaryform = this.fb.group({
      TotalWithoutVAT: '',
      BillAmountWithVAT: '',
      NetBillAmount: '',
      VATAmount: '',
      DiscountPerc: '',
      DiscountSAR: '',
      ModeofPayment: [1],
      ReceiptAmount: '',
      CollectedAmount: '',
      ChangeToBeRendered: '',
      Remarks: '',
      AuthorizedBy: '0'
    });
    this.viewRxPrescriptions = this.viewRxPrescriptions1 = [];
    this.viewPharmacyBills = this.viewPharmacyBills1 = [];
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

    this.fetchPrescriptions(ssn, mobileno, patientid)
  }

  fetchSelectedPatientPrescription(patientid: string) {
    this.fetchPrescriptions("0", "0", patientid);
    $("#divMultiplePatients1").modal('hide');
  }

  fetchPrescriptions(ssn: string, mobileno: string, patientId: string) {
    this.service.fetchPatientDataC = {
      ...this.service.fetchPatientDataC,
      SSN: ssn,
      PatientID: patientId,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    }
    this.url = this.service.fetchPatientDataBySsn(cashissue.fetchPatientDataBySsn);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.showOtcOption = true;
          if (response.FetchPatientDependCLists.length > 1) {
            this.multiplePatients = response.FetchPatientDependCLists;
            $("#divMultiplePatients1").modal('show');
          }
          else {
            this.patientDetails = response.FetchPatientDataCCList[0];
            $("#txtSsn").val(this.patientDetails.SSN);
            this.fetchPatientPrescriptions(response.FetchPatientDataCCList[0].SSN, response.FetchPatientDataCCList[0].PatientID, "0");
          }
          //this.showNoRecFound = false;          
        }
      },
        (err) => {

        })
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

  onViewRxClick() {
    this.GetViewRx(0);
    $("#divViewRx").modal('show');
  }

  GetViewRx(ssn: any) {

    // var FromDatee = moment(new Date().setMonth(new Date().getMonth() - 1)).format('DD-MMM-YYYY');
    // var ToDate = moment(new Date().setMonth(new Date().getMonth())).format('DD-MMM-YYYY');
    var fromdate = this.tablePatientsForm.get("FromDate")?.value;
    fromdate = moment(fromdate).format('DD-MMM-YYYY');
    var todate = this.tablePatientsForm.get("ToDate")?.value;
    if (todate != null) {
      todate = moment(todate).format('DD-MMM-YYYY');

      this.service.fetchDrugPrescriptionN = {
        ...this.service.fetchDrugPrescriptionN,
        // Ssn: ssn,
        FromDate: fromdate,
        ToDate: todate,
        SSN: ssn,
        UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        WorkstationID: this.facilitySessionId ?? this.service.param.WorkStationID,
        HospitalID: this.hospitalID ?? this.service.param.HospitalID,

      };
      //this.url = this.service.fetchDrugPrescriptionAdv(cashissue.fetchDrugPrescriptionAdv);
      //this.url = this.service.FetchDrugPrescriptionH(cashissue.FetchDrugPrescriptionH);
      this.url = this.service.FetchDrugPrescriptionHN(cashissue.FetchDrugPrescriptionHN);
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.FetchDrugPrescriptionDataList.length > 0) {
            this.showOtcOption = true;
            this.viewRxPrescriptions = this.viewRxPrescriptions1 = response.FetchDrugPrescriptionDataList.sort((a: any, b: any) => a.OrderStatus - b.OrderStatus);
          }
          else {
            this.viewRxPrescriptions = this.viewRxPrescriptions1 = [];
          }
        },
          (err) => {

          })
    }
  }

  clearViewRx() {
    var wm = new Date();
    var d = new Date();
    wm.setMonth(wm.getMonth() - 1);
    this.tablePatientsForm.patchValue({
      FromDate: d,
      ToDate: d
    })
    this.GetViewRx(0);
    this.viewRxPrescriptions.forEach((element: any, index: any) => {
      element.selected = false;
    });
    $("#viewRxSSN").val('');
  }

  fetchPatientPrescriptions(ssn: string, patientid: string, prescid: string) {
    //var orderDate = moment(new Date().getMonth() - 1).format('DD-MMM-YYYY');
    this.selectedPatientId = patientid;
    var FromDatee = moment(new Date().setMonth(new Date().getMonth() - 1)).format('DD-MMM-YYYY');
    var ToDate = moment(new Date().setMonth(new Date().getMonth())).format('DD-MMM-YYYY');
    this.service.fetchDrugPrescription = {
      ...this.service.fetchDrugPrescription,
      // Ssn: ssn,
      FromDate: FromDatee,
      ToDate: ToDate,
      PatientID: patientid,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkstationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,

    };
    //this.url = this.service.fetchDrugPrescriptionAdv(cashissue.fetchDrugPrescriptionAdv);
    this.url = this.service.FetchDrugPrescriptionH(cashissue.FetchDrugPrescriptionH);
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchDrugPrescriptionDataList.length > 0) {
          this.showOtcOption = true;
          this.patientPrescriptionsList = response.FetchDrugPrescriptionDataList;
          this.selectedPatientId = this.patientPrescriptionsList[0].PatientID;
          this.selectedAdmissionId = this.patientPrescriptionsList[0].IPID;
          this.selectedDoctor = this.patientPrescriptionsList[0].Doctorname + '|' + this.patientPrescriptionsList[0]?.Specialisation;
          this.selectedDoctorId = this.patientPrescriptionsList[0].DoctorID;
          this.selectedPrescDate = this.patientPrescriptionsList[0].OrderDate;
          this.selectedConsType = this.patientPrescriptionsList[0].ConsultationType;
          this.selectedPrescDateTime = this.patientPrescriptionsList[0].OrderDateTime;
          if (prescid !== '0') {
            this.patientPrescriptionsDetails = response.FetchDrugPrescriptionDataList.filter((x: any) => x.PrescriptionID === prescid);
            if (this.patientPrescriptionsDetails.length > 0) {
              this.selectedPatientId = this.patientPrescriptionsList[0].PatientID;
              this.selectedAdmissionId = this.patientPrescriptionsList[0].IPID;
              this.selectedDoctor = this.patientPrescriptionsList[0].Doctorname + '|' + this.patientPrescriptionsList[0]?.Specialisation;;
              this.selectedDoctorId = this.patientPrescriptionsList[0].DoctorID;
              this.selectedPrescDate = this.patientPrescriptionsList[0].OrderDate;
              this.selectedConsType = this.patientPrescriptionsList[0].ConsultationType;
              this.selectedPrescDateTime = this.patientPrescriptionsList[0].OrderDateTime;
              this.showNoRecFound = false;
              this.loadSelectedPrescriptionDetails(this.patientPrescriptionsDetails[0]);
            }
          }
          else if (response.FetchDrugPrescriptionDataList.length > 1) {
            //show patient multiple prescriptions modal pop up
            this.multiplePrescriptions = response.FetchDrugPrescriptionDataList.sort((a: any, b: any) => new Date(b.OrderDate).getTime() - new Date(a.OrderDate).getTime());;
            $("#divMultiplePrescriptions").modal('show');
          }
          else {
            this.patientPrescriptionsDetails = response.FetchDrugPrescriptionDataList;

            if (this.patientPrescriptionsDetails.length > 0) {
              this.selectedPatientId = this.patientPrescriptionsList[0].PatientID;
              this.selectedAdmissionId = this.patientPrescriptionsList[0].IPID;
              this.selectedDoctor = this.patientPrescriptionsList[0].Doctorname + '|' + this.patientPrescriptionsList[0]?.Specialisation;;
              this.selectedDoctorId = this.patientPrescriptionsList[0].DoctorID;
              this.selectedPrescDate = this.patientPrescriptionsList[0].OrderDate;
              this.selectedConsType = this.patientPrescriptionsList[0].ConsultationType;
              this.selectedPrescDateTime = this.patientPrescriptionsList[0].OrderDateTime;
              this.showNoRecFound = false;
              this.loadSelectedPrescriptionDetails(this.patientPrescriptionsDetails[0]);
            }

          }
        }
        else {
          this.isCash = true;
          this.FetchCashIssuePatientInfoN();
        }
        //this.fetchDiagnosis();
      },
        (err) => {

        })
  }

  onTokenEnterPress(event: any) {
    if (this.counterId === '0') {
      this.errorMessage = "Please select counter.";
      $("#errorMsg").modal("show");
      return;
    }
    //https://localhost:44350//API/FetchPrescriptionsPerTray?TokenNumber=MO202412110001&CounterNoValue=172161718&
    //CounterNo=2&UserID=980&WorkStationID=3593&HospitalID=2
    const tokennum = event.target.value;
    const token = {
      TokenNumber: tokennum,
      CounterNoValue: this.counterId,
      CounterNo: this.counterNo,
      UserID: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID,
    };
    this.url = this.us.getApiUrl(cashissue.FetchPrescriptionsPerTray, token);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          const tokenDetails = response.FetchPrescriptionsPerTrayDataList;
          //this.loadSelectedPrescriptionDetails(tokenDetails[0]);
          this.fetchPatientPrescriptions(tokenDetails[0].SSN, tokenDetails[0].PatientID, tokenDetails[0].PrescriptionID);
          this.loadPatientDetailsFromToken(tokenDetails[0].PatientID);
        }
      },
        (err) => {

        })
  }

  loadPatientDetailsFromToken(patientid: any) {
    this.service.fetchPatientDataC = {
      ...this.service.fetchPatientDataC,
      SSN: "0",
      PatientID: patientid,
      MobileNO: "0",
      PatientId: patientid,
      UserId: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    }
    this.url = this.service.fetchPatientDataBySsn(cashissue.fetchPatientDataBySsn);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.showOtcOption = true;
          this.patientDetails = response.FetchPatientDataCCList[0];
          $("#txtSsn").val(this.patientDetails.SSN);
        }
      },
        (err) => {

        })
  }

  loadSelectedViewRxPrescriptionDetails(pres: any) {
    this.fetchPrescriptions("0", "0", pres.PatientID);
    this.loadSelectedPrescriptionDetails(pres);
    $("#divViewRx").modal('hide');
  }

  loadSelectedPrescriptionDetails(pres: any) {
    pres.isSubstitute = false;
    this.showNoRecFound = false;
    this.selectedPrescription = pres;
    this.service.fetchCashIssuePatientOrderedOrPrescribedDrugsparamsN = {
      ...this.service.fetchCashIssuePatientOrderedOrPrescribedDrugsparamsN,
      PatientId: pres.PatientID,
      AdmissionId: pres.IPID,
      DoctorID: pres.DoctorID,
      SpecialiseID: pres.SpecialiseID,
      MonitorId: pres.MonitorID,
      PrescriptionId: pres.PrescriptionID,
      rblIssueMode: 0,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkstationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,

    };
    this.url = this.service.fetchCashIssuePatientOrderedOrPrescribedDrugsN(cashissue.FetchCashIssuePatientOrderedOrPrescribedDrugsN);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientOrderedOrPrescribedDrugsNList.length > 0) {

          this.patientPrescriptionsDetails = response.FetchPatientOrderedOrPrescribedDrugsNList;
          this.patientPrescriptionStockDetails = response.FetchItemLocationWiseStockDataList;

          //
          this.selectedPatientId = pres.PatientID;
          this.selectedAdmissionId = pres.IPID;
          this.selectedDoctor = pres.Doctorname + '|' + pres?.Specialisation;;
          this.selectedDoctorId = pres.DoctorID;
          this.selectedPrescDate = pres.OrderDate;
          this.selectedConsType = pres.ConsultationType;
          this.selectedPrescDateTime = pres.OrderDateTime;
          //
          this.patientPrescriptionItemUomDetails = response.FetchItemUOMList;
          this.itemForSubstitueUnits = response.FetchItemUOMList;
          this.patientPrescriptionCompanyDetails = response.FetchCPatientInfoList[0];
          this.prescriptionLowestQtyDetails = response.FetchItemUOMLowestQTYList;
          this.LOAAprovalEntry = response.FetchLOAApprovalEntryList;
          this.LOAAprovalEntryDetails = response.FetchLOAApprovalEntryDetailsList.filter((x: any) => x.ServiceID === '10');
          this.notCoveredItems = response.FetchMultiItemCompanyCoveragesDataList;
          this.totalAmount = response.FetchCPatientInfoList[0].TotalAmount;
          if (response.FetchCPatientInfoList[0].CompanyName != '' && response.FetchCPatientInfoList[0].AgreementId != '' && response.FetchCPatientInfoList[0].GradeID != '')
            this.isCash = false;
          else
            this.isCash = true;
          if (this.patientPrescriptionCompanyDetails?.OrderStatus === '3') {
            this.billSummarybtn = false;
          }
          else {
            this.billSummarybtn = true;
          }
          this.totalAmount = 0;
          if (response.FetchCPatientInfoList[0].ItemStock != '') {
            this.errorMessage = response.FetchCPatientInfoList[0].ItemStock;

            $("#errorMsg").modal("show");
          }
          this.patientPrescriptionsDetails.forEach((element: any, index: any) => {
            element.ItemSelected = true;
            element.isSubstitute = false;
            this.filterItemUoms(element);
          });
          this.patientPrescriptionsDetails.forEach((element: any, index: any) => {
            const itemFormGroup = this.fb.group({
              ItemName: element.ItemName,
              ItemID: element.ItemID,
              BatchNo: element.BatchNo,
              BatchId: element.BatchId,
              DedQty: element.DedQty,
              Tax: element.Tax,
              UPrice: element.UPrice,
              Qty: element.Qty,
              Unit: element.Unit,
              PackId: element.PackId,
              UID: element.UID,
              UOM: element.UOM,
              Amount: Number(element.Amount) + Number(element.Tax),
              ExpiryDate: element.ExpiryDate,
              QOH: element.QOH,
              MRP: element.MRP,
              RPU: element.RPU,
              ItemCode: element.ItemCode,
              LPrice: element.LPrice,
              IssuedQty: element.IssuedQty,
              IssuedUOM: element.IssuedUOM,
              ActIssueQTY: element.ActIssueQTY,
              IsNarcotic: element.IsNarcotic,
              IsHighRisk: element.IsHighRisk,
              GenericID: element.GenericID,
              IsDrugFlowApproval: element.IsDrugFlowApproval,
              DrugFlowApprovalStatus: element.DrugFlowApprovalStatus,
              GenericItemID: element.GenericItemID,
              GenericName: element.GenericName,
              PrescriptionQtyLowest: element.PrescriptionQtyLowest,
              IssuedQtyLowest: element.IssuedQtyLowest,
              ISPRN: element.ISPRN,
              PRNMedicationReason: element.PRNMedicationReason,
              CD: element.CD,
              CF: element.CF,
              ReasonForHolding: element.ReasonForHolding,
              HoldStatus: element.HoldStatus,
              PrescriptionItemsHoldReasonID: element.PrescriptionItemsHoldReasonID,
              PrescriptionItemsHoldReason: element.PrescriptionItemsHoldReason,
              PrescriptionItemsHoldReason2l: element.PrescriptionItemsHoldReason2l,
              IsTaxApplicableForResidants: element.IsTaxApplicableForResidants,
              IsLASA: element.IsLASA,
              IsCytotoxic: element.IsCytotoxic,
              IsRefrigerated: element.IsRefrigerated,
              IsElectrolyte: element.IsElectrolyte,
              HighRiskColor: element.HighRiskColor,
              LASAColor: element.LASAColor,
              CytotoxicColor: element.CytotoxicColor,
              FrequencyUomID: element.FrequencyUomID,
              SpecialConfiguration: element.SpecialConfiguration,
              TimeInterval: element.TimeInterval,
              PHApprovalStatus: element.PHApprovalStatus,
              DFFrequencyQTY: element.DFFrequencyQTY,
              Duration: element.Duration,
              DurationId: element.DurationId,
              StartFrom: element.StartFrom,
              Frequency: element.Frequency,
              PrescribedGenericItemID: element.PrescribedGenericItemID,
              ItemGroupTypeName: element.ItemGroupTypeName,
              GTIN: element.GTIN,
              IsScanned2D: element.IsScanned2D,
              GenericItemName: element.GenericItemName,
              IssueUOMID: element.IssueUOMID,
              Print: element.Print,
              ItemLocationWiseStock: element.ItemLocationWiseStock,
              isSubstitute: false,
              PrescriptionItemID: element.PrescriptionItemID,
              ActualPrescribedItemID: 0
            })
            this.items.push(itemFormGroup);
          });
          this.fetchDiagnosis();
          $("#divMultiplePrescriptions").modal('hide');

          //Checking if Prescription is prescribed before 1 month for Insured patients
          const presDate = new Date(pres.OrderDate);
          const todayDate = new Date();
          if (!this.isCash && this.isOneMonthBeforePrescription(presDate, todayDate)) {
            this.errorMessage = "LOA Date has been expired. Cannot issue medication as Insured. Please continue with SelfPay.";
            $('#errorMsg').modal('show');
          }
          // if(!this.isCash)           {
          //   this.fetchCompanyCardCollectable();
          // }
        }
        else {
          this.errorMessage = response.Message;
          $("#errorMsg").modal("show");
        }
      },
        (err) => {

        })
  }

  filterItemUoms(item: any) {
    if (this.patientPrescriptionItemUomDetails != undefined) {
      if (item.isSubstitute != undefined && item.isSubstitute) {
        this.ItemUoms = this.itemForSubstitueUnits.filter((uom: any) => uom.ItemID == item.ItemID && uom.PackID === item.PackId);
        return this.itemForSubstitueUnits.filter((uom: any) => uom.ItemID == item.ItemID && uom.PackID === item.PackId);
      }
      else {
        //this.ItemUoms = this.itemForSubstitueUnits.filter((uom: any) => uom.ItemID == item.ItemID && uom.PackID === item.PackId);
        return this.patientPrescriptionItemUomDetails.filter((uom: any) => uom.ItemID == item.ItemID && uom.PackID === item.PackId);
      }
    }
    else
      return null;
  }

  showPatientInfo(pinfo: any) {
    pinfo.AdmissionID = this.selectedAdmissionId;
    pinfo.HospitalID = this.hospitalID;
    pinfo.PatientID = this.selectedPatientId;
    this.pinfo = pinfo;
    $("#quick_info").modal('show');

  }
  clearPatientInfo() {
    this.pinfo = "";
  }

  validateReqQty(item: any, event: any) {
    var qty = event.target.value;
    this.errorMessage = [];
    if (Number(qty) > item.Qty) {
      this.errorMessage.push("" + item.ItemName + " Quantity cannot be greater than Prescribed Quantity (" + item.Qty + ")");
      $("#errorMsg").modal("show");
      $("#" + item.SlNo + '-' + item.ItemID).val(item.Qty);
    }
    else {
      item.changedQty = qty;
      item.Amount = parseFloat(qty) * parseFloat(item.UPrice);
      item.Amount = Number.parseFloat(item.Amount).toFixed(2);
    }
    this.totalAmount = this.patientPrescriptionsDetails?.map((item: any) => (item.Amount != '') ? Number.parseFloat(item.Amount) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
    this.totalAmount = Number.parseFloat(this.totalAmount?.toFixed(2));
    this.showBillSummary = false;
    this.closeBillSummary();
  }

  openTaperingPopup(item: any) {
    this.medicationScheduleitems = [];
    var drugSchedule = JSON.parse(item.CD);
    if (drugSchedule != null) {
      for (let i = 0; i < drugSchedule.ObjTaperData[0].CustomizedQty.split('-').length; i++) {
        this.medicationScheduleitems.push({
          Dose: drugSchedule.ObjTaperData[0].CustomizedQty.split('-')[i],
          ScheduleTime: drugSchedule.ObjTaperData[0].CustomizedSchedule.split('-')[i]
        })
        // this.medicationScheduleitems.push(itemFormGroup);
        $("#divTapering").addClass('d-flex');
        $("#divTapering").removeClass('d-none');
      }
    }
    else {
      //this.createTapering();
    }
  }
  closeTapering() {
    $("#divTapering").addClass('d-none');
    $("#divTapering").removeClass('d-flex');
  }

  prescribeSubstitute(item: any) {
    if (Number(item.IssuedQtyLowest) >= Number(item.PrescriptionQtyLowest)) {
      this.errorMessage = item.ItemName + " has already been fully issued. Cannot proceed for substitute.";
      $("#errorMsg").modal("show");
      return;
    }
    item.substituteSelected = "true";
    this.itemForSubstitute = item;
    this.itemSelectedForSubstitute = item;
    this.showSubstiteEntry = true;
    this.closeBillSummary();
  }
  closeSubstitute() {
    this.showSubstiteEntry = false;
    this.itemForSubstitute = [];
    this.itemSelectedForSubstitute = [];
  }

  getSub(item: any) {

    this.service.substituteparams = {
      ...this.service.substituteparams,
      ItemID: item.ItemID,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,

    };
    this.url = this.service.getData(cashissue.substitute);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchSubstituteItemsDList = response.FetchSubstituteItemsDList;
          if (item.ItemName.startsWith("NORMAL SALINE")) {
            this.FetchSubstituteItemsDList = this.FetchSubstituteItemsDList.filter((x: any) => x.ItemName.startsWith("NORMAL SALINE"));
          }
          this.FetchSubstituteItemsDList.forEach((element: any, index: any) => {
            element.selected = false;
          });
        }
      },
        (err) => {

        })
  }
  substitute(item: any) {
    this.FetchSubstituteItemsDList.forEach((element: any, index: any) => {
      this.showSubstituteValidation = false;
      if (element.ItemID === item.ItemID && element.GenericID === item.GenericID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
  }
  issueSubstitute() {
    if (this.FetchSubstituteItemsDList.filter((x: any) => x.selected == true).length > 0) {
      var selectedSubstituteItem = this.FetchSubstituteItemsDList.find((x: any) => x.selected === true);
      var itemselectedfromsubstituteList = [];
      itemselectedfromsubstituteList.push({
        "SlNo": this.itemForSubstitute.SlNo,
        "ItemName": this.itemForSubstitute.ItemName,
        "ItemID": this.itemForSubstitute.ItemID,
        "BatchNo": this.itemForSubstitute.BatchNo,
        "BatchId": this.itemForSubstitute.BatchId,
        "DedQty": this.itemForSubstitute.DedQty,
        "Tax": this.itemForSubstitute.Tax,
        "UPrice": this.itemForSubstitute.UPrice,
        "Qty": this.itemForSubstitute.Qty,
        "Unit": this.itemForSubstitute.Unit,
        "PackId": this.itemForSubstitute.PackId,
        "UID": this.itemForSubstitute.UID,
        "UOM": this.itemForSubstitute.UOM,
        "Amount": this.itemForSubstitute.Amount,
        "ExpiryDate": this.itemForSubstitute.ExpiryDate,
        "QOH": this.itemForSubstitute.QOH,
        "MRP": this.itemForSubstitute.MRP,
        "RPU": this.itemForSubstitute.RPU,
        "ItemCode": this.itemForSubstitute.ItemCode,
        "LPrice": this.itemForSubstitute.LPrice,
        "IssuedQty": this.itemForSubstitute.IssuedQty,
        "IssuedUOM": this.itemForSubstitute.IssuedUOM,
        "ActIssueQTY": this.itemForSubstitute.ActIssueQTY,
        "IsNarcotic": this.itemForSubstitute.IsNarcotic,
        "IsHighRisk": this.itemForSubstitute.IsHighRisk,
        "GenericID": this.itemForSubstitute.GenericID,
        "IsDrugFlowApproval": this.itemForSubstitute.IsDrugFlowApproval,
        "DrugFlowApprovalStatus": this.itemForSubstitute.DrugFlowApprovalStatus,
        "GenericItemID": this.itemForSubstitute.GenericItemID,
        "GenericName": this.itemForSubstitute.GenericName,
        "PrescriptionQtyLowest": this.itemForSubstitute.PrescriptionQtyLowest,
        "IssuedQtyLowest": this.itemForSubstitute.IssuedQtyLowest,
        "ISPRN": this.itemForSubstitute.ISPRN,
        "PRNMedicationReason": this.itemForSubstitute.PRNMedicationReason,
        "CD": this.itemForSubstitute.CD,
        "CF": this.itemForSubstitute.CF,
        "ReasonForHolding": this.itemForSubstitute.ReasonForHolding,
        "HoldStatus": this.itemForSubstitute.HoldStatus,
        "PrescriptionItemsHoldReasonID": this.itemForSubstitute.PrescriptionItemsHoldReasonID,
        "PrescriptionItemsHoldReason": this.itemForSubstitute.PrescriptionItemsHoldReason,
        "PrescriptionItemsHoldReason2l": this.itemForSubstitute.PrescriptionItemsHoldReason2l,
        "IsTaxApplicableForResidants": this.itemForSubstitute.IsTaxApplicableForResidants,
        "IsLASA": this.itemForSubstitute.IsLASA,
        "IsCytotoxic": this.itemForSubstitute.IsCytotoxic,
        "IsRefrigerated": this.itemForSubstitute.IsRefrigerated,
        "IsElectrolyte": this.itemForSubstitute.IsElectrolyte,
        "HighRiskColor": this.itemForSubstitute.HighRiskColor,
        "LASAColor": this.itemForSubstitute.LASAColor,
        "CytotoxicColor": this.itemForSubstitute.CytotoxicColor,
        "FrequencyUomID": this.itemForSubstitute.FrequencyUomID,
        "SpecialConfiguration": this.itemForSubstitute.SpecialConfiguration,
        "TimeInterval": this.itemForSubstitute.TimeInterval,
        "PHApprovalStatus": this.itemForSubstitute.PHApprovalStatus,
        "DFFrequencyQTY": this.itemForSubstitute.DFFrequencyQTY,
        "Duration": this.itemForSubstitute.Duration,
        "DurationId": this.itemForSubstitute.DurationId,
        "StartFrom": this.itemForSubstitute.StartFrom,
        "Frequency": this.itemForSubstitute.Frequency,
        "PrescribedGenericItemID": this.itemForSubstitute.PrescribedGenericItemID,
        "ItemGroupTypeName": this.itemForSubstitute.ItemGroupTypeName,
        "GTIN": this.itemForSubstitute.GTIN,
        "IsScanned2D": this.itemForSubstitute.IsScanned2D,
        "GenericItemName": this.itemForSubstitute.GenericItemName,
        "IssueUOMID": this.itemForSubstitute.IssueUOMID,
        "Print": this.itemForSubstitute.Print,
        "ItemLocationWiseStock": this.itemForSubstitute.ItemLocationWiseStock
      })
      var payload = {
        "SlNo": "1",
        "ItemID": this.itemForSubstitute.ItemID,
        "SubstituteItemID": selectedSubstituteItem.ItemID,
        "rblIssueMode": "0",
        "DoctorCode": this.selectedPrescription.DoctorCode,
        "USERID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        "WORKSTATIONID": this.facilitySessionId ?? this.service.param.WorkStationID,
        "HospitalID": this.hospitalID ?? this.service.param.HospitalID,
        "ItemXMLDetails": itemselectedfromsubstituteList
      }

      this.us.post(cashissue.FetchCashIssueSubstituteItem, payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.itemForSubstitute = response.FetchSubstituteItemDataList[0];
            this.itemForSubstitueUnits = response.FetchSubsItemUOMList;
          }
        },
          (err) => {

          })
      $("#substitute_Modal").modal('hide');
    }
    else {
      this.showSubstituteValidation = true;
    }
  }

  filterSubstituteItemUoms(item: any) {
    if (this.itemForSubstitueUnits != undefined)
      return this.itemForSubstitueUnits.filter((uom: any) => uom.ItemID == item.ItemID && uom.PackID === item.PackId);
    else
      return null;
  }

  selectedHoldItem(index: any) {
    this.remarksForSelectedHoldItemName = index.ItemName;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedHoldItemId = index.ItemID;
    this.remarksForSelectedHoldPrescId = this.selectedPrescription.PrescriptionID;
    this.holdReasonValidation = false;
    this.selectedHoldReason = index.PrescriptionItemsHoldReasonID;
    if (index.HoldStatus == null || index.HoldStatus == 0)
      this.holdBtnName = 'Hold';
    else
      this.holdBtnName = 'Release';
    $("#holdRem").val(index.ReasonForHolding);
  }
  selectedHoldReasonEvent(event: any) {
    this.selectedHoldReason = event.target.value;
  }
  holdPrescriptionItem(med: any, rem: any, btName: string) {
    if (this.selectedHoldReason != "0" && rem.value != "") {
      $("#hold_remarks").modal('hide');
      var currentDate = moment(new Date()).format('DD-MMM-YYYY')?.toString();
      var holdMedXml = [
        {
          "PID": this.remarksForSelectedHoldPrescId,
          "IID": this.remarksForSelectedHoldItemId,
          "ISEQ": 1,
          "REASON": " | " + this.doctorDetails[0].UserName + "  " + currentDate + " : " + rem.value,
          "HOLDSTATUS": btName == 'Hold' ? "1" : "0",
          "HRID": this.selectedHoldReason,
          "BLK": "0"
        }
      ]

      let holdPayload = {
        "DoctorID": this.doctorDetails[0].EmpId,
        "HoldPresItemsXML": holdMedXml
      }
      this.us.post(cashissue.holdpresitem, holdPayload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            var itemtoUpdateHold = this.patientPrescriptionsDetails.find((x: any) => x.ItemID === this.remarksForSelectedHoldItemId);
            if (btName == 'Hold')
              itemtoUpdateHold.HoldStatus = "1";
            else
              itemtoUpdateHold.HoldStatus = "0";
            //this.loadSelectedPrescriptionDetails(this.selectedPrescription);
            //$("#saveMsg").modal('show');
          }
        },
          (err) => {

          })
    }
    else {
      this.holdReasonValidation = true;
      $("#holdRemarksLabel").modal('show');
    }
  }
  clearHoldReason(rem: any) {
    rem.value = "";
    this.selectedHoldReason = "0";
  }
  FetchHoldMaster() {
    this.presconfig.fetchMedicationHold(this.doctorDetails[0].EmpId, this.hospitalID).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.holdMasterList = response.FetchMedicationHoldDataList;
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }

  deleteItemFromPresc(item: any) {
    this.itemForDelete = item;
    $("#deletePresItemConfirmationmodal").modal('show');
  }

  deleteAllItemFromPresc() {
    $("#deletePresItemAllConfirmationmodal").modal('show');
  }


  deleteItemFromPrescription(type: string) {
    if (type == "Yes") {
      this.patientPrescriptionsDetails.splice(this.patientPrescriptionsDetails.indexOf(this.itemForDelete), 1);
      this.totalAmount = this.patientPrescriptionsDetails?.map((item: any) => (item.Amount != '') ? Number.parseFloat(item.Amount) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
      this.totalAmount = Number.parseFloat(this.totalAmount?.toFixed(2));
    }
    this.closeBillSummary();
  }

  deleteBulkPrescriptions(type: string) {
    if (type === "Yes") {
      this.patientPrescriptionsDetails = this.patientPrescriptionsDetails.filter((item: any) => !item.selectedPrescription);

      this.totalAmount = this.patientPrescriptionsDetails?.map((item: any) => (item.Amount !== '') ? Number.parseFloat(item.Amount) : 0)
        .reduce((acc: any, curr: any) => acc + curr, 0);

      this.totalAmount = Number.parseFloat(this.totalAmount?.toFixed(2));
    }
    this.closeBillSummary();
  }

  prescUomChange(event: any, item: any) {
    var uomName = event.target.options[event.target.options.selectedIndex].text;
    this.prescriptionuomChange(event.target.value, uomName, item);
    this.closeBillSummary();

  }
  prescriptionuomChange(uom: any, uomName: any, item: any) {
    var itemselectedForQtychange = [];

    itemselectedForQtychange.push({
      "SlNo": item.SlNo,
      "ItemName": item.ItemName,
      "ItemID": item.ItemID,
      "BatchNo": item.BatchNo,
      "BatchId": item.BatchId,
      "DedQty": item.DedQty,
      "Tax": item.Tax,
      "UPrice": item.UPrice,
      "Qty": item.Qty,
      "Unit": item.Unit,
      "PackId": item.PackId,
      "UID": item.UID,
      "UOM": item.UOM,
      "Amount": item.Amount,
      "ExpiryDate": item.ExpiryDate,
      "QOH": item.QOH,
      "MRP": item.MRP,
      "RPU": item.RPU,
      "ItemCode": item.ItemCode,
      "LPrice": item.LPrice,
      "IssuedQty": item.IssuedQty,
      "IssuedUOM": item.IssuedUOM,
      "ActIssueQTY": item.ActIssueQTY,
      "IsNarcotic": item.IsNarcotic,
      "IsHighRisk": item.IsHighRisk,
      "GenericID": item.GenericID,
      "IsDrugFlowApproval": item.IsDrugFlowApproval,
      "DrugFlowApprovalStatus": item.DrugFlowApprovalStatus,
      "GenericItemID": item.GenericItemID,
      "GenericName": item.GenericName,
      "PrescriptionQtyLowest": item.PrescriptionQtyLowest,
      "IssuedQtyLowest": item.IssuedQtyLowest,
      "ISPRN": item.ISPRN,
      "PRNMedicationReason": item.PRNMedicationReason,
      "CD": item.CD,
      "CF": item.CF,
      "ReasonForHolding": item.ReasonForHolding,
      "HoldStatus": item.HoldStatus,
      "PrescriptionItemsHoldReasonID": item.PrescriptionItemsHoldReasonID,
      "PrescriptionItemsHoldReason": item.PrescriptionItemsHoldReason,
      "PrescriptionItemsHoldReason2l": item.PrescriptionItemsHoldReason2l,
      "IsTaxApplicableForResidants": item.IsTaxApplicableForResidants,
      "IsLASA": item.IsLASA,
      "IsCytotoxic": item.IsCytotoxic,
      "IsRefrigerated": item.IsRefrigerated,
      "IsElectrolyte": item.IsElectrolyte,
      "HighRiskColor": item.HighRiskColor,
      "LASAColor": item.LASAColor,
      "CytotoxicColor": item.CytotoxicColor,
      "FrequencyUomID": item.FrequencyUomID,
      "SpecialConfiguration": item.SpecialConfiguration,
      "TimeInterval": item.TimeInterval,
      "PHApprovalStatus": item.PHApprovalStatus,
      "DFFrequencyQTY": item.DFFrequencyQTY,
      "Duration": item.Duration,
      "DurationId": item.DurationId,
      "StartFrom": item.StartFrom,
      "Frequency": item.Frequency,
      "PrescribedGenericItemID": item.PrescribedGenericItemID,
      "ItemGroupTypeName": item.ItemGroupTypeName,
      "GTIN": item.GTIN,
      "IsScanned2D": item.IsScanned2D,
      "GenericItemName": item.GenericItemName,
      "IssueUOMID": item.IssueUOMID,
      "Print": item.Print,
      "ItemLocationWiseStock": item.ItemLocationWiseStock
    })
    var itemchangedUomid = uom;
    var itemchangeduomName = uomName;
    var payload = {
      "SlNo": item.SlNo,
      "ItemID": item.ItemID,
      "ItemUOMID": itemchangedUomid,
      "ItemUOM": itemchangeduomName,
      "Quantity": item.Qty,
      "rblIssueMode": "0",
      "DoctorCode": this.selectedPrescription === undefined ? this.selectedDoctorId : this.selectedPrescription.DoctorCode,
      "USERID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      "WORKSTATIONID": this.facilitySessionId ?? this.service.param.WorkStationID,
      "HospitalID": this.hospitalID ?? this.service.param.HospitalID,
      "ItemXMLDetails": itemselectedForQtychange
    }
    this.us.post(cashissue.FetchCashIssueItemUOMChange, payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          var prescdet = this.patientPrescriptionsDetails.find((x: any) => x.ItemID === response.FetchSubstituteItemDataList[0].ItemID);
          prescdet.SlNo = response.FetchSubstituteItemDataList[0].SlNo;
          prescdet.ItemName = response.FetchSubstituteItemDataList[0].ItemName;
          prescdet.ItemID = response.FetchSubstituteItemDataList[0].ItemID;
          prescdet.BatchNo = response.FetchSubstituteItemDataList[0].BatchNo;
          prescdet.BatchId = response.FetchSubstituteItemDataList[0].BatchId;
          prescdet.DedQty = response.FetchSubstituteItemDataList[0].DedQty;
          prescdet.Tax = response.FetchSubstituteItemDataList[0].Tax;
          prescdet.UPrice = response.FetchSubstituteItemDataList[0].UPrice;
          prescdet.Qty = response.FetchSubstituteItemDataList[0].Qty;
          prescdet.changedQty = response.FetchSubstituteItemDataList[0].Qty;
          prescdet.Unit = response.FetchSubstituteItemDataList[0].Unit;
          prescdet.PackId = response.FetchSubstituteItemDataList[0].PackId;
          prescdet.UID = response.FetchSubstituteItemDataList[0].UOM;
          prescdet.UOM = response.FetchSubstituteItemDataList[0].UID;
          prescdet.Amount = response.FetchSubstituteItemDataList[0].Amount;
          prescdet.ExpiryDate = response.FetchSubstituteItemDataList[0].ExpiryDate;
          prescdet.QOH = response.FetchSubstituteItemDataList[0].QOH;
          prescdet.MRP = response.FetchSubstituteItemDataList[0].MRP;
          prescdet.RPU = response.FetchSubstituteItemDataList[0].RPU;
          prescdet.ItemCode = response.FetchSubstituteItemDataList[0].ItemCode;
          prescdet.LPrice = response.FetchSubstituteItemDataList[0].LPrice;
          prescdet.IssuedQty = response.FetchSubstituteItemDataList[0].IssuedQty;
          prescdet.IssuedUOM = response.FetchSubstituteItemDataList[0].IssuedUOM;
          prescdet.ActIssueQTY = response.FetchSubstituteItemDataList[0].ActIssueQTY;
          prescdet.IsNarcotic = response.FetchSubstituteItemDataList[0].IsNarcotic;
          prescdet.IsHighRisk = response.FetchSubstituteItemDataList[0].IsHighRisk;
          prescdet.GenericID = response.FetchSubstituteItemDataList[0].GenericID;
          prescdet.IsDrugFlowApproval = response.FetchSubstituteItemDataList[0].IsDrugFlowApproval;
          prescdet.DrugFlowApprovalStatus = response.FetchSubstituteItemDataList[0].DrugFlowApprovalStatus;
          prescdet.GenericItemID = response.FetchSubstituteItemDataList[0].GenericItemID;
          prescdet.GenericName = response.FetchSubstituteItemDataList[0].GenericName;
          prescdet.PrescriptionQtyLowest = response.FetchSubstituteItemDataList[0].PrescriptionQtyLowest;
          prescdet.IssuedQtyLowest = response.FetchSubstituteItemDataList[0].IssuedQtyLowest;
          prescdet.ISPRN = response.FetchSubstituteItemDataList[0].ISPRN;
          prescdet.PRNMedicationReason = response.FetchSubstituteItemDataList[0].PRNMedicationReason;
          prescdet.CD = response.FetchSubstituteItemDataList[0].CD;
          prescdet.CF = response.FetchSubstituteItemDataList[0].CF;
          prescdet.ReasonForHolding = response.FetchSubstituteItemDataList[0].ReasonForHolding;
          prescdet.HoldStatus = response.FetchSubstituteItemDataList[0].HoldStatus;
          prescdet.PrescriptionItemsHoldReasonID = response.FetchSubstituteItemDataList[0].PrescriptionItemsHoldReasonID;
          prescdet.PrescriptionItemsHoldReason = response.FetchSubstituteItemDataList[0].PrescriptionItemsHoldReason;
          prescdet.PrescriptionItemsHoldReason2l = response.FetchSubstituteItemDataList[0].PrescriptionItemsHoldReason2l;
          prescdet.IsTaxApplicableForResidants = response.FetchSubstituteItemDataList[0].IsTaxApplicableForResidants;
          prescdet.IsLASA = response.FetchSubstituteItemDataList[0].IsLASA;
          prescdet.IsCytotoxic = response.FetchSubstituteItemDataList[0].IsCytotoxic;
          prescdet.IsRefrigerated = response.FetchSubstituteItemDataList[0].IsRefrigerated;
          prescdet.IsElectrolyte = response.FetchSubstituteItemDataList[0].IsElectrolyte;
          prescdet.HighRiskColor = response.FetchSubstituteItemDataList[0].HighRiskColor;
          prescdet.LASAColor = response.FetchSubstituteItemDataList[0].LASAColor;
          prescdet.CytotoxicColor = response.FetchSubstituteItemDataList[0].CytotoxicColor;
          prescdet.FrequencyUomID = response.FetchSubstituteItemDataList[0].FrequencyUomID;
          prescdet.SpecialConfiguration = response.FetchSubstituteItemDataList[0].SpecialConfiguration;
          prescdet.TimeInterval = response.FetchSubstituteItemDataList[0].TimeInterval;
          prescdet.PHApprovalStatus = response.FetchSubstituteItemDataList[0].PHApprovalStatus;
          prescdet.DFFrequencyQTY = response.FetchSubstituteItemDataList[0].DFFrequencyQTY;
          prescdet.Duration = response.FetchSubstituteItemDataList[0].Duration;
          prescdet.DurationId = response.FetchSubstituteItemDataList[0].DurationId;
          prescdet.StartFrom = response.FetchSubstituteItemDataList[0].StartFrom;
          prescdet.Frequency = response.FetchSubstituteItemDataList[0].Frequency;
          prescdet.PrescribedGenericItemID = response.FetchSubstituteItemDataList[0].PrescribedGenericItemID;
          prescdet.ItemGroupTypeName = response.FetchSubstituteItemDataList[0].ItemGroupTypeName;
          prescdet.GTIN = response.FetchSubstituteItemDataList[0].GTIN;
          prescdet.IsScanned2D = response.FetchSubstituteItemDataList[0].IsScanned2D;
          prescdet.GenericItemName = response.FetchSubstituteItemDataList[0].GenericItemName;
          prescdet.IssueUOMID = response.FetchSubstituteItemDataList[0].IssueUOMID;
          prescdet.Print = response.FetchSubstituteItemDataList[0].Print;
          prescdet.ItemLocationWiseStock = response.FetchSubstituteItemDataList[0].ItemLocationWiseStock;
        }
      },
        (err) => {

        })
  }
  substituteprescUomChange(event: any, item: any) {
    var substituteitemselectedForQtychange = [];

    substituteitemselectedForQtychange.push({
      "SlNo": item.SlNo,
      "ItemName": item.ItemName,
      "ItemID": item.ItemID,
      "BatchNo": item.BatchNo,
      "BatchId": item.BatchId,
      "DedQty": item.DedQty,
      "Tax": item.Tax,
      "UPrice": item.UPrice,
      "Qty": item.Qty,
      "Unit": item.Unit,
      "PackId": item.PackId,
      "UID": item.UID,
      "UOM": item.UOM,
      "Amount": item.Amount,
      "ExpiryDate": item.ExpiryDate,
      "QOH": item.QOH,
      "MRP": item.MRP,
      "RPU": item.RPU,
      "ItemCode": item.ItemCode,
      "LPrice": item.LPrice,
      "IssuedQty": item.IssuedQty,
      "IssuedUOM": item.IssuedUOM,
      "ActIssueQTY": item.ActIssueQTY,
      "IsNarcotic": item.IsNarcotic,
      "IsHighRisk": item.IsHighRisk,
      "GenericID": item.GenericID,
      "IsDrugFlowApproval": item.IsDrugFlowApproval,
      "DrugFlowApprovalStatus": item.DrugFlowApprovalStatus,
      "GenericItemID": item.GenericItemID,
      "GenericName": item.GenericName,
      "PrescriptionQtyLowest": item.PrescriptionQtyLowest,
      "IssuedQtyLowest": item.IssuedQtyLowest,
      "ISPRN": item.ISPRN,
      "PRNMedicationReason": item.PRNMedicationReason,
      "CD": item.CD,
      "CF": item.CF,
      "ReasonForHolding": item.ReasonForHolding,
      "HoldStatus": item.HoldStatus,
      "PrescriptionItemsHoldReasonID": item.PrescriptionItemsHoldReasonID,
      "PrescriptionItemsHoldReason": item.PrescriptionItemsHoldReason,
      "PrescriptionItemsHoldReason2l": item.PrescriptionItemsHoldReason2l,
      "IsTaxApplicableForResidants": item.IsTaxApplicableForResidants,
      "IsLASA": item.IsLASA,
      "IsCytotoxic": item.IsCytotoxic,
      "IsRefrigerated": item.IsRefrigerated,
      "IsElectrolyte": item.IsElectrolyte,
      "HighRiskColor": item.HighRiskColor,
      "LASAColor": item.LASAColor,
      "CytotoxicColor": item.CytotoxicColor,
      "FrequencyUomID": item.FrequencyUomID,
      "SpecialConfiguration": item.SpecialConfiguration,
      "TimeInterval": item.TimeInterval,
      "PHApprovalStatus": item.PHApprovalStatus,
      "DFFrequencyQTY": item.DFFrequencyQTY,
      "Duration": item.Duration,
      "DurationId": item.DurationId,
      "StartFrom": item.StartFrom,
      "Frequency": item.Frequency,
      "PrescribedGenericItemID": item.PrescribedGenericItemID,
      "ItemGroupTypeId": item.ItemGroupTypeId == null ? '0' : item.ItemGroupTypeId,
      "ItemGroupTypeName": item.ItemGroupTypeName,
      "GTIN": item.GTIN,
      "IsScanned2D": item.IsScanned2D,
      "GenericItemName": item.GenericItemName,
      "IssueUOMID": item.IssueUOMID,
      "Print": item.Print,
      "ItemLocationWiseStock": item.ItemLocationWiseStock
    })
    var itemchangedUomid = event.target.value;
    var itemchangeduomName = event.target.options[event.target.options.selectedIndex].text;
    var payload = {
      "SlNo": item.SlNo,
      "ItemID": item.ItemID,
      "ItemUOMID": itemchangedUomid,
      "ItemUOM": itemchangeduomName,
      "Quantity": item.Qty,
      "rblIssueMode": "0",
      "DoctorCode": this.selectedPrescription.DoctorCode,
      "USERID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      "WORKSTATIONID": this.facilitySessionId ?? this.service.param.WorkStationID,
      "HospitalID": this.hospitalID ?? this.service.param.HospitalID,
      "ItemXMLDetails": substituteitemselectedForQtychange,
      "SubstituteItemID": item.ItemID,
      "SubstituteItemUOMID": itemchangedUomid,
      "SubstituteItemUOM": itemchangeduomName

    }
    this.us.post(cashissue.FetchCashIssueSubstituteItemUOMChange, payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          //var prescdet = this.itemForSubstitute.find((x: any) => x.ItemID === response.FetchSubstituteItemDataList[0].ItemID);
          this.itemForSubstitute.SlNo = response.FetchSubstituteItemDataList[0].SlNo;
          this.itemForSubstitute.ItemName = response.FetchSubstituteItemDataList[0].ItemName;
          this.itemForSubstitute.ItemID = response.FetchSubstituteItemDataList[0].ItemID;
          this.itemForSubstitute.BatchNo = response.FetchSubstituteItemDataList[0].BatchNo;
          this.itemForSubstitute.BatchId = response.FetchSubstituteItemDataList[0].BatchId;
          this.itemForSubstitute.DedQty = response.FetchSubstituteItemDataList[0].DedQty;
          this.itemForSubstitute.Tax = response.FetchSubstituteItemDataList[0].Tax;
          this.itemForSubstitute.UPrice = response.FetchSubstituteItemDataList[0].UPrice;
          this.itemForSubstitute.Qty = response.FetchSubstituteItemDataList[0].Qty;
          this.itemForSubstitute.Unit = response.FetchSubstituteItemDataList[0].Unit;
          this.itemForSubstitute.PackId = response.FetchSubstituteItemDataList[0].PackId;
          this.itemForSubstitute.UID = response.FetchSubstituteItemDataList[0].UID;
          this.itemForSubstitute.UOM = response.FetchSubstituteItemDataList[0].UOM;
          this.itemForSubstitute.Amount = response.FetchSubstituteItemDataList[0].Amount;
          this.itemForSubstitute.ExpiryDate = response.FetchSubstituteItemDataList[0].ExpiryDate;
          this.itemForSubstitute.QOH = response.FetchSubstituteItemDataList[0].QOH;
          this.itemForSubstitute.MRP = response.FetchSubstituteItemDataList[0].MRP;
          this.itemForSubstitute.RPU = response.FetchSubstituteItemDataList[0].RPU;
          this.itemForSubstitute.ItemCode = response.FetchSubstituteItemDataList[0].ItemCode;
          this.itemForSubstitute.LPrice = response.FetchSubstituteItemDataList[0].LPrice;
          this.itemForSubstitute.IssuedQty = response.FetchSubstituteItemDataList[0].IssuedQty;
          this.itemForSubstitute.IssuedUOM = response.FetchSubstituteItemDataList[0].IssuedUOM;
          this.itemForSubstitute.ActIssueQTY = response.FetchSubstituteItemDataList[0].ActIssueQTY;
          this.itemForSubstitute.IsNarcotic = response.FetchSubstituteItemDataList[0].IsNarcotic;
          this.itemForSubstitute.IsHighRisk = response.FetchSubstituteItemDataList[0].IsHighRisk;
          this.itemForSubstitute.GenericID = response.FetchSubstituteItemDataList[0].GenericID;
          this.itemForSubstitute.IsDrugFlowApproval = response.FetchSubstituteItemDataList[0].IsDrugFlowApproval;
          this.itemForSubstitute.DrugFlowApprovalStatus = response.FetchSubstituteItemDataList[0].DrugFlowApprovalStatus;
          this.itemForSubstitute.GenericItemID = response.FetchSubstituteItemDataList[0].GenericItemID;
          this.itemForSubstitute.GenericName = response.FetchSubstituteItemDataList[0].GenericName;
          this.itemForSubstitute.PrescriptionQtyLowest = response.FetchSubstituteItemDataList[0].PrescriptionQtyLowest;
          this.itemForSubstitute.IssuedQtyLowest = response.FetchSubstituteItemDataList[0].IssuedQtyLowest;
          this.itemForSubstitute.ISPRN = response.FetchSubstituteItemDataList[0].ISPRN;
          this.itemForSubstitute.PRNMedicationReason = response.FetchSubstituteItemDataList[0].PRNMedicationReason;
          this.itemForSubstitute.CD = response.FetchSubstituteItemDataList[0].CD;
          this.itemForSubstitute.CF = response.FetchSubstituteItemDataList[0].CF;
          this.itemForSubstitute.ReasonForHolding = response.FetchSubstituteItemDataList[0].ReasonForHolding;
          this.itemForSubstitute.HoldStatus = response.FetchSubstituteItemDataList[0].HoldStatus;
          this.itemForSubstitute.PrescriptionItemsHoldReasonID = response.FetchSubstituteItemDataList[0].PrescriptionItemsHoldReasonID;
          this.itemForSubstitute.PrescriptionItemsHoldReason = response.FetchSubstituteItemDataList[0].PrescriptionItemsHoldReason;
          this.itemForSubstitute.PrescriptionItemsHoldReason2l = response.FetchSubstituteItemDataList[0].PrescriptionItemsHoldReason2l;
          this.itemForSubstitute.IsTaxApplicableForResidants = response.FetchSubstituteItemDataList[0].IsTaxApplicableForResidants;
          this.itemForSubstitute.IsLASA = response.FetchSubstituteItemDataList[0].IsLASA;
          this.itemForSubstitute.IsCytotoxic = response.FetchSubstituteItemDataList[0].IsCytotoxic;
          this.itemForSubstitute.IsRefrigerated = response.FetchSubstituteItemDataList[0].IsRefrigerated;
          this.itemForSubstitute.IsElectrolyte = response.FetchSubstituteItemDataList[0].IsElectrolyte;
          this.itemForSubstitute.HighRiskColor = response.FetchSubstituteItemDataList[0].HighRiskColor;
          this.itemForSubstitute.LASAColor = response.FetchSubstituteItemDataList[0].LASAColor;
          this.itemForSubstitute.CytotoxicColor = response.FetchSubstituteItemDataList[0].CytotoxicColor;
          this.itemForSubstitute.FrequencyUomID = response.FetchSubstituteItemDataList[0].FrequencyUomID;
          this.itemForSubstitute.SpecialConfiguration = response.FetchSubstituteItemDataList[0].SpecialConfiguration;
          this.itemForSubstitute.TimeInterval = response.FetchSubstituteItemDataList[0].TimeInterval;
          this.itemForSubstitute.PHApprovalStatus = response.FetchSubstituteItemDataList[0].PHApprovalStatus;
          this.itemForSubstitute.DFFrequencyQTY = response.FetchSubstituteItemDataList[0].DFFrequencyQTY;
          this.itemForSubstitute.Duration = response.FetchSubstituteItemDataList[0].Duration;
          this.itemForSubstitute.DurationId = response.FetchSubstituteItemDataList[0].DurationId;
          this.itemForSubstitute.StartFrom = response.FetchSubstituteItemDataList[0].StartFrom;
          this.itemForSubstitute.Frequency = response.FetchSubstituteItemDataList[0].Frequency;
          this.itemForSubstitute.PrescribedGenericItemID = response.FetchSubstituteItemDataList[0].PrescribedGenericItemID;
          this.itemForSubstitute.ItemGroupTypeName = response.FetchSubstituteItemDataList[0].ItemGroupTypeName;
          this.itemForSubstitute.GTIN = response.FetchSubstituteItemDataList[0].GTIN;
          this.itemForSubstitute.IsScanned2D = response.FetchSubstituteItemDataList[0].IsScanned2D;
          this.itemForSubstitute.GenericItemName = response.FetchSubstituteItemDataList[0].GenericItemName;
          this.itemForSubstitute.IssueUOMID = response.FetchSubstituteItemDataList[0].IssueUOMID;
          this.itemForSubstitute.Print = response.FetchSubstituteItemDataList[0].Print;
          this.itemForSubstitute.ItemLocationWiseStock = response.FetchSubstituteItemDataList[0].ItemLocationWiseStock;
        }
      },
        (err) => {

        })
    this.totalAmount = this.patientPrescriptionsDetails?.map((item: any) => (item.Amount != '') ? Number.parseFloat(item.Amount) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
    this.totalAmount = Number.parseFloat(this.totalAmount?.toFixed(2));
  }

  updateSubstituteToItemPrescibed() {
    var prescribedItem = this.patientPrescriptionsDetails.find((x: any) => x.ItemID === this.itemSelectedForSubstitute.ItemID);
    prescribedItem.SlNo = this.itemForSubstitute.SlNo;
    prescribedItem.ActualPrescribedItemID = prescribedItem.ItemID;
    prescribedItem.ItemName = this.itemForSubstitute.ItemName;
    prescribedItem.ItemID = this.itemForSubstitute.ItemID;
    prescribedItem.BatchNo = this.itemForSubstitute.BatchNo;
    prescribedItem.BatchId = this.itemForSubstitute.BatchId;
    prescribedItem.DedQty = this.itemForSubstitute.DedQty;
    prescribedItem.Tax = this.itemForSubstitute.Tax;
    prescribedItem.UPrice = this.itemForSubstitute.UPrice;
    prescribedItem.Qty = this.itemForSubstitute.Qty;
    prescribedItem.Unit = this.itemForSubstitute.Unit;
    prescribedItem.PackId = this.itemForSubstitute.PackId;
    prescribedItem.UID = this.itemForSubstitute.UID;
    prescribedItem.UOM = this.itemForSubstitute.UOM;
    prescribedItem.Amount = this.itemForSubstitute.Amount;
    prescribedItem.ExpiryDate = this.itemForSubstitute.ExpiryDate;
    prescribedItem.QOH = this.itemForSubstitute.QOH;
    prescribedItem.MRP = this.itemForSubstitute.MRP;
    prescribedItem.RPU = this.itemForSubstitute.RPU;
    prescribedItem.ItemCode = this.itemForSubstitute.ItemCode;
    prescribedItem.LPrice = this.itemForSubstitute.LPrice;
    prescribedItem.IssuedQty = this.itemForSubstitute.IssuedQty;
    prescribedItem.IssuedUOM = this.itemForSubstitute.IssuedUOM;
    prescribedItem.ActIssueQTY = this.itemForSubstitute.ActIssueQTY;
    prescribedItem.IsNarcotic = this.itemForSubstitute.IsNarcotic;
    prescribedItem.IsHighRisk = this.itemForSubstitute.IsHighRisk;
    prescribedItem.GenericID = this.itemForSubstitute.GenericID;
    prescribedItem.IsDrugFlowApproval = this.itemForSubstitute.IsDrugFlowApproval;
    prescribedItem.DrugFlowApprovalStatus = this.itemForSubstitute.DrugFlowApprovalStatus;
    prescribedItem.GenericItemID = this.itemForSubstitute.GenericItemID;
    prescribedItem.GenericName = this.itemForSubstitute.GenericName;
    prescribedItem.PrescriptionQtyLowest = this.itemForSubstitute.PrescriptionQtyLowest;
    prescribedItem.IssuedQtyLowest = this.itemForSubstitute.IssuedQtyLowest;
    prescribedItem.ISPRN = this.itemForSubstitute.ISPRN;
    prescribedItem.PRNMedicationReason = this.itemForSubstitute.PRNMedicationReason;
    prescribedItem.CD = this.itemForSubstitute.CD;
    prescribedItem.CF = this.itemForSubstitute.CF;
    prescribedItem.ReasonForHolding = this.itemForSubstitute.ReasonForHolding;
    prescribedItem.HoldStatus = this.itemForSubstitute.HoldStatus;
    prescribedItem.PrescriptionItemsHoldReasonID = this.itemForSubstitute.PrescriptionItemsHoldReasonID;
    prescribedItem.PrescriptionItemsHoldReason = this.itemForSubstitute.PrescriptionItemsHoldReason;
    prescribedItem.PrescriptionItemsHoldReason2l = this.itemForSubstitute.PrescriptionItemsHoldReason2l;
    prescribedItem.IsTaxApplicableForResidants = this.itemForSubstitute.IsTaxApplicableForResidants;
    prescribedItem.IsLASA = this.itemForSubstitute.IsLASA;
    prescribedItem.IsCytotoxic = this.itemForSubstitute.IsCytotoxic;
    prescribedItem.IsRefrigerated = this.itemForSubstitute.IsRefrigerated;
    prescribedItem.IsElectrolyte = this.itemForSubstitute.IsElectrolyte;
    prescribedItem.HighRiskColor = this.itemForSubstitute.HighRiskColor;
    prescribedItem.LASAColor = this.itemForSubstitute.LASAColor;
    prescribedItem.CytotoxicColor = this.itemForSubstitute.CytotoxicColor;
    prescribedItem.FrequencyUomID = this.itemForSubstitute.FrequencyUomID;
    prescribedItem.SpecialConfiguration = this.itemForSubstitute.SpecialConfiguration;
    prescribedItem.TimeInterval = this.itemForSubstitute.TimeInterval;
    prescribedItem.PHApprovalStatus = this.itemForSubstitute.PHApprovalStatus;
    prescribedItem.DFFrequencyQTY = this.itemForSubstitute.DFFrequencyQTY;
    prescribedItem.Duration = this.itemForSubstitute.Duration;
    prescribedItem.DurationId = this.itemForSubstitute.DurationId;
    prescribedItem.StartFrom = this.itemForSubstitute.StartFrom;
    prescribedItem.Frequency = this.itemForSubstitute.Frequency;
    prescribedItem.PrescribedGenericItemID = this.itemForSubstitute.PrescribedGenericItemID;
    prescribedItem.ItemGroupTypeName = this.itemForSubstitute.ItemGroupTypeName;
    prescribedItem.GTIN = this.itemForSubstitute.GTIN;
    prescribedItem.IsScanned2D = this.itemForSubstitute.IsScanned2D;
    prescribedItem.GenericItemName = this.itemForSubstitute.GenericItemName;
    prescribedItem.IssueUOMID = this.itemForSubstitute.IssueUOMID;
    prescribedItem.Print = this.itemForSubstitute.Print;
    prescribedItem.ItemLocationWiseStock = this.itemForSubstitute.ItemLocationWiseStock;
    prescribedItem.isSubstitute = true;
    this.totalAmount = this.patientPrescriptionsDetails?.map((item: any) => (item.Amount != '') ? Number.parseFloat(item.Amount) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
    this.totalAmount = Number.parseFloat(this.totalAmount?.toFixed(2));
    this.closeSubstitute();
  }

  toggleOtcConfirmation() {
    this.datesForm.get('StatFilter').setValue(true);
    $("#OtcConfirmation").modal('show');
  }
  UntoggleOtc() {
    this.showOtcEntry = false;
    this.datesForm.get('StatFilter').setValue(false);
  }
  toggleOtc() {
    this.isCash = true;
    if (this.showOtcEntry) {
      this.showOtcEntry = false;
      this.selectedDoctor = "";
      this.selectedDoctorId = "";
      this.selectedPrescDate = "";
      this.selectedConsType = "";
      this.selectedPrescDateTime = "";
    }
    else {
      this.showOtcEntry = true;
      this.patientPrescriptionsDetails = [];
      this.patientPrescriptionCompanyDetails = [];
      this.totalAmount = 0;
      this.selectedDoctor = ""; this.selectedDoctorId = ""; this.selectedPrescDate = ""; this.selectedPrescDateTime = "";
      this.service.fetchspecializationDoctorparams = {
        ...this.service.fetchspecializationDoctorparams,
        UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
        HospitalID: this.hospitalID ?? this.service.param.HospitalID,

      };

      this.url = this.service.fetchSpecializationDoctorC(cashissue.FetchSpecializationDoctorC);
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.selectedDoctor = response.FetchSpecializationDoctorDataList[0].FullName;
            this.selectedDoctorId = response.FetchSpecializationDoctorDataList[0].EmpNo;
            this.selectedPrescDate = moment(new Date()).format('DD-MMM-YYYY');
            this.selectedPrescDateTime = moment(new Date()).format('H:mm');
          }
        },
          (err) => {
          })

    }
  }

  searchDisplay(event: any) {
    var filter = event.target.value;
    this.service.smartSearchparams = {
      ...this.service.smartSearchparams,
      Name: filter,
      userId: this.doctorDetails[0].UserId,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,

    };
    if (filter.length >= 3) {
      this.url = this.service.getItemSearch(cashissue.fetchSSItems);
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfItems = response.FetchSSWardsDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfItems = [];
    }
  }

  onViewItemDisplaySelected(item: any) {
    var itemId = item.ID;
    this.service.fetchCashIssueItemSelectionparams = {
      ...this.service.fetchCashIssueItemSelectionparams,
      ItemID: itemId,
      rblIssueMode: 0,
      DoctorCode: this.selectedDoctorId,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    };

    this.url = this.service.fetchCashIssueItemSelection(cashissue.FetchCashIssueItemSelection);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedOtcItem = response.FetchPatientOrderedOrPrescribedDrugsNList[0];
          this.selectedOtcItemUomDetails = response.FetchItemUOMList;
          if (response.Message != "") {
            this.errorMessage = response.Message.replace('<br><br>', '');
            $("#validationMsgs").modal('show');
          }
        }
      },
        (err) => {

        })
  }

  onSubstituteQtyChange(item: any, event: any) {
    var qty = event.target.value;
    item.changedQty = item.Qty = qty;
    item.Amount = parseFloat(qty) * parseFloat(item.UPrice);
    item.Amount = Number.parseFloat(item.Amount).toFixed(2);
    this.totalAmount = this.patientPrescriptionsDetails?.map((item: any) => (item.Amount != '') ? Number.parseFloat(item.Amount) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
    this.totalAmount = Number.parseFloat(this.totalAmount?.toFixed(2));
  }

  onOtcQtyChange(item: any, event: any) {
    var qty = event.target.value;
    item.changedQty = item.Qty = qty;
    item.Amount = parseFloat(qty) * parseFloat(item.UPrice);
    item.Amount = Number.parseFloat(item.Amount).toFixed(2);
    this.totalAmount = this.patientPrescriptionsDetails?.map((item: any) => (item.Amount != '') ? Number.parseFloat(item.Amount) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
    this.totalAmount = Number.parseFloat(this.totalAmount?.toFixed(2));
  }

  filterOtcItemUoms(item: any) {
    if (this.selectedOtcItemUomDetails != undefined)
      return this.selectedOtcItemUomDetails.filter((uom: any) => uom.ItemID == item.ItemID && uom.PackID === item.PackId);
    else
      return null;
  }

  addSelectedOtcItemToTable() {
    var item = this.selectedOtcItem;
    if (this.patientPrescriptionsDetails === undefined) {
      this.patientPrescriptionsDetails = [];
      this.patientPrescriptionItemUomDetails = [];
    }
    if (this.patientPrescriptionItemUomDetails && this.patientPrescriptionItemUomDetails.length > 0) {
      this.selectedOtcItemUomDetails.forEach((element: any, index: any) => {
        this.patientPrescriptionItemUomDetails.push(element);
      });
    }
    else {
      this.patientPrescriptionItemUomDetails = this.selectedOtcItemUomDetails;
    }
    let find = this.patientPrescriptionsDetails?.find((x: any) => x.ItemID === item.ItemID);
    if (find) {
      this.errorMessage = item.ItemName + " Item already added";
      $("#validationMsgs").modal('show');
    }
    else {
      this.patientPrescriptionsDetails.push({
        "SlNo": this.patientPrescriptionsDetails.length + 1,
        "ItemName": item.ItemName,
        "ItemID": item.ItemID,
        "BatchNo": item.BatchNo,
        "BatchId": item.BatchId,
        "DedQty": item.DedQty,
        "Tax": item.Tax,
        "UPrice": item.UPrice,
        "Qty": item.Qty,
        "Unit": item.Unit,
        "PackId": item.PackId,
        "UID": item.UID,
        "UOM": item.UOM,
        "Amount": item.Amount,
        "ExpiryDate": item.ExpiryDate,
        "QOH": item.QOH,
        "MRP": item.MRP,
        "RPU": item.RPU,
        "ItemCode": item.ItemCode,
        "LPrice": item.LPrice,
        "IssuedQty": item.IssuedQty,
        "IssuedUOM": item.IssuedUOM,
        "ActIssueQTY": item.ActIssueQTY,
        "IsNarcotic": item.IsNarcotic,
        "IsHighRisk": item.IsHighRisk,
        "GenericID": item.GenericID,
        "IsDrugFlowApproval": item.IsDrugFlowApproval,
        "DrugFlowApprovalStatus": item.DrugFlowApprovalStatus,
        "GenericItemID": item.GenericItemID,
        "GenericName": item.GenericName,
        "PrescriptionQtyLowest": item.PrescriptionQtyLowest,
        "IssuedQtyLowest": item.IssuedQtyLowest,
        "ISPRN": item.ISPRN,
        "PRNMedicationReason": item.PRNMedicationReason,
        "CD": item.CD,
        "CF": item.CF,
        "ReasonForHolding": item.ReasonForHolding,
        "HoldStatus": item.HoldStatus,
        "PrescriptionItemsHoldReasonID": item.PrescriptionItemsHoldReasonID,
        "PrescriptionItemsHoldReason": item.PrescriptionItemsHoldReason,
        "PrescriptionItemsHoldReason2l": item.PrescriptionItemsHoldReason2l,
        "IsTaxApplicableForResidants": item.IsTaxApplicableForResidants,
        "IsLASA": item.IsLASA,
        "IsCytotoxic": item.IsCytotoxic,
        "IsRefrigerated": item.IsRefrigerated,
        "IsElectrolyte": item.IsElectrolyte,
        "HighRiskColor": item.HighRiskColor,
        "LASAColor": item.LASAColor,
        "CytotoxicColor": item.CytotoxicColor,
        "FrequencyUomID": item.FrequencyUomID,
        "SpecialConfiguration": item.SpecialConfiguration,
        "TimeInterval": item.TimeInterval,
        "PHApprovalStatus": item.PHApprovalStatus,
        "DFFrequencyQTY": item.DFFrequencyQTY,
        "Duration": item.Duration,
        "DurationId": item.DurationId,
        "StartFrom": item.StartFrom,
        "Frequency": item.Frequency,
        "PrescribedGenericItemID": item.PrescribedGenericItemID,
        "ItemGroupTypeName": item.ItemGroupTypeName,
        "GTIN": item.GTIN,
        "IsScanned2D": item.IsScanned2D,
        "GenericItemName": item.GenericItemName,
        "IssueUOMID": item.UID,
        "Print": item.Print,
        "ItemLocationWiseStock": item.ItemLocationWiseStock
      })
    }
    this.totalAmount = this.patientPrescriptionsDetails?.map((item: any) => (item.Amount != '') ? Number.parseFloat(item.Amount) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
    this.totalAmount = Number.parseFloat(this.totalAmount?.toFixed(2));
    this.selectedOtcItem = [];
    $("#DisplayName").val('');
    $("#OtcQty").val('');
    this.listOfItems = [];
  }

  FetchCashIssuePatientInfoN() {
    this.showNoRecFound = false;
    this.service.fetchCashIssuePatientInfoNparams = {
      ...this.service.fetchCashIssuePatientInfoNparams,
      PatientId: this.patientDetails.PatientID,
      rblIssueMode: 0,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    };

    this.url = this.service.fetchCashIssuePatientInfoN(cashissue.FetchCashIssuePatientInfoN);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.showNoRecFound = false;
          this.patientPrescriptionCompanyDetails = response.FetchCPatientInfoList[0];
          if (response.Message != '') {
            $("#validationMsgs").modal('show');
            this.errorMessage = response.Message;
          }
        }
      },
        (err) => {

        })
  }
  selectPrescription(pres: any) {
    //pres.selected = true;
    this.selectedPrescriptionToLoad = pres;

    //this.selectedPatientId = pat.PatientID;
    this.multiplePrescriptions.forEach((element: any, index: any) => {
      //this.showSubstituteValidation = false;
      if (element.PrescriptionID === pres.PrescriptionID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });


  }
  selectViewRxPrescription(pres: any) {
    this.selectedPrescriptionToLoad = pres;

    this.viewRxPrescriptions.forEach((element: any, index: any) => {
      //this.showSubstituteValidation = false;
      if (element.PrescriptionID === pres.PrescriptionID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
  }

  showMedicationHistory() {
    this.presconfig.FetchCMedicationHistory(this.patientDetails.PatientID, 1, 0, this.doctorDetails[0].UserId, this.facilitySessionId, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          var startDate = moment(new Date().setMonth(new Date().getMonth() - 3)).format('DD-MMM-YYYY');
          var endDate = moment(new Date()).format('DD-MMM-YYYY');

          response.FetchIndMedicationHistoryDataList.forEach((element: any, index: any) => {
            const start = new Date(element.StartFrom);
            const end = new Date(element.EndDatetime);
            element.Class = "row card_item_div mx-0 w-100 align-items-center maxim";
            element.DatesArray = this.generateDateRange(start, end);
          });

          this.IndMedicationHistoryDataList = response.FetchIndMedicationHistoryDataList;
          this.showMedicationModal()
        }
      },
        (err) => {
        })
  }
  generateDateRange(start: Date, end: Date): any {
    const datesArray = [];
    const currentDate = this.getDateWithoutTime(new Date(start));
    const todayDate = this.getDateWithoutTime(new Date());

    while (currentDate <= end) {
      let value = 1;
      if (currentDate < todayDate) {
        value = 1;
      }
      else if (currentDate.toISOString().split('T')[0] === todayDate.toISOString().split('T')[0]) {
        value = 2;
      }
      else if (currentDate > todayDate) {
        value = 3;
      }
      datesArray.push({ date: this.datepipe.transform(currentDate, "dd-MMM-yyyy"), value: value });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return datesArray;
  }

  getDateWithoutTime(inputDate: Date): Date {
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth();
    const day = inputDate.getDate();
    return new Date(year, month, day);
  }
  showMedicationModal(): void {
    // var md = new Date(this.selectedView.AdmitDate);
    var md = new Date().setMonth(new Date().getMonth() - 1);
    this.viewMoreMedicationsForm.patchValue({
      medfromdate: this.medfromDate.value,
      medtodate: this.toDate.value
    })
    $("#viewMoreMedicationsDataModal").modal('show');
  }
  FetchViewMoreMedicationsData(type: any) {
    if (type == "search") {
      this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data: any) => Date.parse(data.StartFrom.split(' ')[0]) >= Date.parse(this.viewMoreMedicationsForm.value['medfromdate']) && Date.parse(data.StartFrom.split(' ')[0]) <= Date.parse(this.viewMoreMedicationsForm.value['medtodate']));
      var startDate = moment(new Date().setMonth(new Date().getMonth() - 3)).format('DD-MMM-YYYY');
      var endDate = moment(new Date()).format('DD-MMM-YYYY');
      if (this.medStatus == "active") {
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList.filter((data: any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString()));
      }
      else {
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList.filter((data: any) => Date.parse(data.StartFrom) > Date.parse(startDate.toString()) && Date.parse(data.EndDateTime) < Date.parse(endDate));
      }
    }
    else {
      //this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data:any) => Date.parse(data.StartFrom) >= Date.parse(this.viewMoreMedicationsForm.get('medfromdate')?.value) && Date.parse(data.StartFrom) <= Date.parse(this.viewMoreMedicationsForm.value['medtodate']));
    }

  }

  selectAllItemsForPatient(item: any) {
    this.patientPrescriptionsDetails.forEach((element: any, index: any) => {
      if (element.ItemID == item.ItemID) {
        if (element.ItemSelected) {
          element.ItemSelected = false;
        }
        else {
          element.ItemSelected = true;
        }
      }
    });
  }


  StickerprintPrescription() {
    this.PrintItemIDS = "";
    var filteredPresDet = this.patientPrescriptionsDetails.filter((x: any) => x.ItemSelected);
    this.PrintItemIDS = filteredPresDet?.map((item: any) => item.ItemID).join(',');

    if (this.selectedPrescription != undefined && this.selectedPrescription.AdmissionNumber != '') {
      this.url = this.service.fetchData(cashissue.FetchRxStickerPrint, {
        PatientID: this.selectedPrescription.PatientID,
        IPID: this.selectedPrescription.IPID,
        PrescriptionID: this.selectedPrescription.PrescriptionID,
        WardID: this.facilitySessionId ?? this.service.param.WorkStationID,
        ItemIDS: this.PrintItemIDS,
        PrescriptionTokenNumber: 'W-001',
        UserId: this.doctorDetails[0].UserId,
        UserName: this.doctorDetails[0]?.UserName,
        WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
        HospitalID: this.hospitalID
      });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.trustedUrl = response?.FTPPATH
            this.showModal();
          }
          else {
          }
        },
          (err) => {
          })
    }
    else {
      this.errorMessage = [];
      this.errorMessage.push("Please select prescription to print");
      $("#errorMsg").modal("show");
    }
  }





  printPrescription() {
    if (this.selectedPrescription != undefined && this.selectedPrescription.AdmissionNumber != '') {
      this.url = this.service.fetchData(cashissue.FetchPrescriptionRxPrint, {
        PatientID: this.selectedPrescription.PatientID, IPID: this.selectedPrescription.IPID,
        MonitorID: this.selectedPrescription.MonitorID,
        DoctorID: this.selectedPrescription.DoctorID,
        PrescriptionID: this.selectedPrescription.PrescriptionID,
        UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        UserName: this.doctorDetails[0]?.UserName,
        WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
        HospitalID: this.hospitalID
      });
      this.us.get(this.url)
        .subscribe((response: any) => {
          //if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModal();
          //}
          // else {
          // }
        },
          (err) => {
          })
    }
    else {
      this.errorMessage = [];
      this.errorMessage.push("Please select prescription to print");
      $("#errorMsg").modal("show");
    }
  }
  showModal(): void {
    $("#reviewAndPayment").modal('show');
  }

  openPatientSummaryPopup() {
    if (this.patientDetails) {
      this.patientSummary = true;
      this.patientDetails.PatientId = this.patientDetails.PatientID;
      sessionStorage.setItem("PatientDetails", JSON.stringify(this.patientDetails));
      sessionStorage.setItem("selectedView", JSON.stringify(this.patientDetails));
      sessionStorage.setItem("selectedPatientAdmissionId", this.patientDetails?.IPID);
      $("#divPatientSummary").modal('show');
    }
  }

  closePatientSummary() {
    this.patientSummary = false;
    $("#divPatientSummary").modal('hide');
  }

  getOrderStatus() {

    var csitemdetails: any[] = [];
    this.patientPrescriptionsDetails.forEach((element: any, index: any) => {
      csitemdetails.push({
        "ItemID": element.ItemID,
        "PID": element.PackId,
        "UID": element.UID,
        "Qty": element.changedQty != undefined ? element.changedQty : element.Qty,
      });
    });

    var payload = {
      "CashIssueItemsDetails": csitemdetails,
      "DtCalculatePrescStatus": this.prescriptionLowestQtyDetails,
      "USERID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      "WORKSTATIONID": this.facilitySessionId ?? this.service.param.WorkStationID,
      "HospitalID": this.hospitalID ?? this.service.param.HospitalID
    }

    this.us.post(cashissue.FetchCheckOrderStatus, payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.orderStatus = response.OrderStatus;
        }
      },
        (err) => {

        })
  }

  changeBillType(tpye: any) {
    if (this.patientPrescriptionCompanyDetails.CompanyName == '') {
      this.errorMessage = "Cannot change Bill Type to Insured as patient is cash patient."
      $("#errorMsg").modal("show");
      return;
    }
    this.isCash = !this.isCash;

    this.showBillSummary = false;
  }

  billCashIssue() {
    const errormsgs: any = [];
    this.patientPrescriptionsDetails.forEach((element: any) => {
      if (Number(element.QOH) < Number(element.LowestTOTIssuingQty)) {
        errormsgs.push(element.ItemCode + '-' + element.ItemName);
      }
    });

    // if(errormsgs.length > 0) {
    //   this.errorMessage = errormsgs.map((x: any) => x).join('\n');
    //   this.errorMessage += '<br></br> <b>' + " Does not have enough stock to issue." + '</b>';
    //   $("#errorMsg").modal("show");
    //   return;
    // }

    if (this.isCash) {
      this.billCashIssueForcashPatient();
    }
    else if (!this.isCash) {
      this.billCashIssueForCreditPatient();
    }
    
  }

  billCashIssueFromBarCodeScan() {
    this.billCashIssue();
    $("#scanBarcodesModal").modal("hide");
  } 

  billCashIssueForcashPatient() {
    if (this.patientPrescriptionsDetails.length === 0 && !this.showOtcEntry) {
      this.errorMessage = "No prescriptions to bill";
      $("#errorMsg").modal("show");
      return;
    }
    //Checking for items not scanned barcode
    // if(this.hospitalID == 2) {
    //   const itemsNotScannedBarcode = this.scannedItems; // this.patientPrescriptionsDetails.filter((x: any) => Number(x.Qty) > 0 && (x.HoldStatus === '' || x.HoldStatus === '0') && (x.Barcode == '' || x.Barcode == null || x.Barcode == undefined));
    //   if (itemsNotScannedBarcode.length == 0) {
    //     //const itemsNames = itemsNotScannedBarcode.map((item: any) => item.ItemName).join('<br />');
    //     // this.errorMessage = "Please scan barcodes for the following items before billing: " + itemsNames;
    //     // $("#errorMsg").modal("show");
    //     setTimeout(() => {
    //       this.barcodeInputs.first?.nativeElement.focus();
    //     });
    //     $("#scanBarcodesModal").modal("show");
    //     //return;
    //   }
    // }
    

    var pharmacyItems: any[] = [];
    this.patientPrescriptionsDetails.filter((x: any) => Number(x.Qty) > 0 && (x.HoldStatus === '' || x.HoldStatus === '0')).forEach((element: any) => {
      pharmacyItems.push({
        "serviceId": 10,
        "itemId": element.ItemID,
        "quantity": element.changedQty != undefined ? element.changedQty : element.Qty,
        "issueQuantityUomId": element.UID,
        "itemName": element.ItemName,
        "sfdaItem": element.IsSFDAApproved == undefined ? 0 : element.IsSFDAApproved.toString().toLowerCase() == 'true' ? 1 : 0,
      })
    });

    var payload = {
      "patientId": this.selectedPatientId,
      "admissionId": this.selectedAdmissionId === '' ? 0 : this.selectedAdmissionId,
      "agreementId": -1,
      "billType": 1,
      "companyId": 0,
      "gradeId": -1,
      "loaId": 0,
      "hospDeptId": this.facilitySessionId, //3593,
      "bedTypeId": -1,
      "hospitalId": this.hospitalID,
      "discountPercentage": 0,
      "isSaudiNationality": this.patientDetails.Nationality == 'Saudi' ? true : false,
      "items": pharmacyItems
    }

    this.us.postbill(cashissue.calculatepharmacybill, payload)
      .subscribe((response: any) => {
        if (response.status == 'Success') {
          this.showBillSummary = true;
          this.billSummary = response.data.mainBill;
          this.billSummarynonSFDA = response.data.nonSFDA;
          this.billSummarysfda = response.data.sfda;
          this.billSummaryform.patchValue({
            TotalWithoutVAT: this.billSummary?.netBillAmountWithOutVat,
            BillAmountWithVAT: this.billSummary?.netBillAmountWithVat,
            NetBillAmount: this.billSummary?.billAmount,
            VATAmount: "",
            DiscountPerc: "",
            DiscountSAR: "",
            ModeofPayment: this.billSummaryform.get('ModeofPayment')?.value,
            ReceiptAmount: parseFloat(this.billSummary?.netBillAmountWithOutVat).toFixed(2),
            CollectedAmount: "",
            ChangeToBeRendered: "",
            Remarks: "",
            cashCollectedAmount: '',
            cardCollectedAmount: ''
          });
          this.TotalWithoutVAT = this.billSummary?.netBillAmountWithOutVat;
          this.BillAmountWithVAT = this.billSummary?.netBillAmountWithVat;
          this.NetBillAmount = this.billSummary?.billAmount;
          this.VATAmount = this.billSummary?.vatAmount;
          this.DiscountAmount = this.billSummary?.totalDiscount;
          this.getOrderStatus();
        }
      },
        (err) => {

        })
  }

  billCashIssueForCreditPatient() {
    //Checking if Prescription is prescribed before 1 month for Insured patients
    const presDate = new Date(this.selectedPrescription?.OrderDate);
    const todayDate = new Date();
    if (this.isOneMonthBeforePrescription(presDate, todayDate)) {
      this.errorMessage = "LOA Date has been expired. Cannot issue medication as Insured. Please continue with SelfPay.";
      $('#errorMsg').modal('show');
      return;
    }

    if (this.patientPrescriptionCompanyDetails.AgreementId === '') {
      this.errorMessage = "Company Details does not exist in Registration. Please continue with Self Pay";
      $("#errorMsg").modal("show");
      return;
    }
    if (this.patientPrescriptionsDetails.length === 0) {
      this.errorMessage = "No prescriptions to bill";
      $("#errorMsg").modal("show");
      return;
    }

    //Checking for Not Covered Items
    if (this.notCoveredItems.length > 0) {
      const notCoveredItems = new Set(this.notCoveredItems.filter((x: any) => x.LimitType == -1).map((x: any) => x.ItemID));
      const notCoveredItemsExisits = this.patientPrescriptionsDetails.filter((y: any) => notCoveredItems.has(Number(y.ItemID)));
      if (notCoveredItemsExisits.length > 0) {
        const notCoveredItemsNames = notCoveredItemsExisits.map((item: any) => item.ItemName).join('<br/>');
        this.errorMessage = '<b>' + notCoveredItemsNames + '</b>' + " are Not Covered by Insurance Company, Please proceed with Cash Billing";
        $("#errorMsg").modal("show");
        return;
      }
    }

    //Checking for rejected items
    if (this.LOAAprovalEntryDetails.length > 0) {
      const rejectedItems = new Set(this.LOAAprovalEntryDetails.filter((x: any) => x.ClaimStatusID == '2').map((x: any) => x.ItemID));
      const rejectedItemExists = this.patientPrescriptionsDetails.filter((y: any) => rejectedItems.has(y.ItemID));
      if (rejectedItemExists.length > 0) {
        const rejectedItemsNames = rejectedItemExists.map((item: any) => item.ItemName).join('<br/>');
        this.errorMessage = '<b>' + rejectedItemsNames + '</b>' + " are Rejected by Insurance Company, Please proceed with Cash Billing";
        $("#errorMsg").modal("show");
        return;
      }
    }

    if (this.LOAAprovalEntryDetails.length > 0) {
      const limitApprovalItems = new Set(this.LOAAprovalEntryDetails
        .filter((x: any) => x.ClaimStatusID == '4' && Number(x.ApprovedQuantity) === Number(x.BilledQty))
        .map((x: any) => x.ItemID));
      const limitApprovalItemExists = this.patientPrescriptionsDetails.filter((y: any) => limitApprovalItems.has(y.ItemID));
      if (limitApprovalItemExists.length > 0) {
        const rejectedQtyItemsNames = limitApprovalItemExists.map((item: any) => item.ItemName).join('<br/>');
        this.errorMessage = '<b>' + rejectedQtyItemsNames + '</b>' + " Full Quantity Not Approved by Insurance Company, Please proceed with Cash Billing";
        $("#errorMsg").modal("show");
        return;
      }
    }

    //Qty-0 to check for all items
    const prescDet = this.patientPrescriptionsDetails.filter((x: any) => Number(x.Qty) > 0);
    if (prescDet.length === 0) {
      this.errorMessage = 'Cannot issue medication with 0 Quantity';
      $("#errorMsg").modal("show");
      return;
    }

    //Checking for items not scanned barcode
    // if(this.hospitalID == 2) {
    //   const itemsNotScannedBarcode =  this.scannedItems; // this.patientPrescriptionsDetails.filter((x: any) => Number(x.Qty) > 0 && (x.HoldStatus === '' || x.HoldStatus === '0') && (x.Barcode == '' || x.Barcode == null || x.Barcode == undefined));
    //   if (itemsNotScannedBarcode.length == 0) {
    //     //const itemsNames = itemsNotScannedBarcode.map((item: any) => item.ItemName).join('<br />');
    //     // this.errorMessage = "Please scan barcodes for the following items before billing: " + itemsNames;
    //     // $("#errorMsg").modal("show");
    //     setTimeout(() => {
    //       this.barcodeInputs.first?.nativeElement.focus();
    //     });
    //     $("#scanBarcodesModal").modal("show");
    //     //return;
    //   }
    // }

    var pharmacyItems: any[] = [];
    this.patientPrescriptionsDetails.filter((x: any) => Number(x.Qty) > 0 && (x.HoldStatus === '' || x.HoldStatus === '0')).forEach((element: any, index: any) => {
      var loaAprovalEntryID = 0; var claimStatusID = 0; var statusName = ""; var approvalAMT = 0;
      if (this.LOAAprovalEntryDetails.length > 0) {
        const loaAprvlEntryData = this.LOAAprovalEntryDetails.find((x: any) => x.ItemID === element.ItemID);
        if (loaAprvlEntryData) {
          loaAprovalEntryID = loaAprvlEntryData.EntryID;
          claimStatusID = loaAprvlEntryData.ClaimStatusID;
          statusName = loaAprvlEntryData.ClaimStatus;
          approvalAMT = loaAprvlEntryData.LimitApprovalAmount;
        }
      }
      pharmacyItems.push({
        "serviceId": 10,
        "itemId": element.ItemID,
        "quantity": element.changedQty != undefined ? element.changedQty : element.Qty,
        "issueQuantityUomId": element.UID,
        "itemName": element.ItemName,
        "itemGroupId": element.ItemGroupTypeId === '' ? '0' : element.ItemGroupTypeId,
        "specialityId": 0,
        "orderTypeId": 0,
        "specimenId": 0,
        "serviceTypeId": 8,
        "prescriptionId": this.selectedPrescription.PrescriptionID,
        "orderDate": this.selectedPrescription.OrderDate,
        "scheduleDate": "",
        "doctorId": this.selectedPrescription.DoctorID,
        "hospDeptId": this.facilitySessionId, //this.hospdepdid,
        "loaAprovalEntryID": loaAprovalEntryID,
        "claimStatusID": claimStatusID,
        "statusName": statusName,
        "approvalAMT": approvalAMT,
        "isProfChargesApplicable": 0,
        "itemSequence": index + 1,
        "sfdaItem": element.IsSFDAApproved.toString().toLowerCase() == 'true' ? 1 : 0,
      })
    });

    var payload = {
      "patientId": this.selectedPatientId,
      "admissionId": this.selectedAdmissionId,
      "agreementId": this.patientPrescriptionCompanyDetails.AgreementId === '' ? -1 : this.patientPrescriptionCompanyDetails.AgreementId,
      "billType": this.isCash ? '1' : '2',
      "companyId": this.patientPrescriptionCompanyDetails.CompanyID === '' ? 0 : this.patientPrescriptionCompanyDetails.CompanyID,
      "gradeId": this.patientPrescriptionCompanyDetails.GradeID === '' ? 0 : this.patientPrescriptionCompanyDetails.GradeID,
      "loaId": this.patientPrescriptionCompanyDetails.LOAID === '' ? 0 : this.patientPrescriptionCompanyDetails.LOAID,
      "hospDeptId": this.facilitySessionId, //this.hospdepdid,
      "bedTypeId": -1,
      "hospitalId": this.hospitalID,
      "discountPercentage": 0,
      "isSaudiNationality": this.patientDetails.Nationality == 'Saudi' ? true : false,
      "doctorSpecialityId": this.selectedPrescription.SpecialiseID,
      "userId": this.doctorDetails[0].UserId,
      "workStationId": this.facilitySessionId,
      "items": pharmacyItems
    }

    this.us.postbill(cashissue.calculatepharmacybill, payload)
      .subscribe((response: any) => {
        if (response.status == 'Success') {
          this.calculateBillResponse = response.data.mainBill;
          this.billSummarynonSFDA = response.data.nonSFDA;
          this.billSummarysfda = response.data.sfda;
          this.showBillSummary = true;
          this.billSummary = response.data.mainBill;
          this.billSummaryform.patchValue({
            TotalWithoutVAT: this.isCash ? this.billSummary?.netBillAmountWithOutVat : this.billSummary?.totalBillAmountWithoutVat,
            BillAmountWithVAT: this.isCash ? this.billSummary?.netBillAmountWithVat : this.billSummary?.totalBillAmountWithVat,
            NetBillAmount: this.isCash ? this.billSummary?.billAmount : this.billSummary?.totalBillAmount,
            VATAmount: this.isCash ? '' : this.billSummary?.vatAmount,
            DiscountPerc: "",
            DiscountSAR: "",
            ModeofPayment: this.billSummaryform.get('ModeofPayment')?.value,
            ReceiptAmount: this.isCash ? this.billSummary?.totalBillAmount : parseFloat(this.billSummary?.balanceAmount).toFixed(2),
            CollectedAmount: '',// this.isCash ? '' : this.billSummary?.collectableAmount,
            ChangeToBeRendered: "",
            Remarks: "",
            cashCollectedAmount: '',
            cardCollectedAmount: ''
          });
          this.TotalWithoutVAT = this.isCash ? this.billSummary?.netBillAmountWithOutVat : this.billSummary?.totalBillAmountWithoutVat;
          this.BillAmountWithVAT = this.isCash ? this.billSummary?.netBillAmountWithVat : this.billSummary?.totalBillAmountWithVat;
          this.NetBillAmount = this.isCash ? this.billSummary?.billAmount : this.billSummary?.totalBillAmount;
          this.VATAmount = this.isCash ? '' : this.billSummary?.vatAmount;
          this.DiscountAmount = this.billSummary?.totalDiscount;
          this.receiptAmount = this.isCash ? this.billSummary?.totalBillAmount : this.billSummary?.balanceAmount;
          this.getOrderStatus();
          this.getCollectableInfo();
        }
        else {
          this.errorMessage = response.status;
          $("#errorMsg").modal("show");
          return;
        }
      },
        (err) => {

        })
  }

  getApprovalStatus(item: any) {
    if (this.LOAAprovalEntryDetails.length > 0) {
      const loaAprvlEntryData = this.LOAAprovalEntryDetails.find((x: any) => x.ItemID === item.ItemID);
      if (loaAprvlEntryData) {
        return loaAprvlEntryData.ClaimStatus;
      }
    }
    if (this.notCoveredItems.length > 0) {
      const notCoveredItem = this.notCoveredItems.find((x: any) => x.ItemID == item.ItemID && x.LimitType === -1);
      if (notCoveredItem) {
        return "Not Covered";
      }
    }
    return "-";
  }

  saveCashIssue() {
    if (this.isCash) {
      this.saveCashIssueForCashPatient();
    }
    else {
      this.saveCashIssueForCreditPatient();
    }
  }

  saveCashIssueForCashPatient() {
    const collectedAmount = this.billSummaryform.get('CollectedAmount')?.value
    if (collectedAmount == '' || collectedAmount === 0) {
      this.errorMessage = "Please enter Collected Amount";
      $("#errorMsg").modal("show");
      return;
    }
    // if (this.DiscountAmount != '' && this.DiscountAmount != 0 && !this.validateDiscount) {
    //   this.errorMessage = "Please validate discount";
    //   $("#errorMsg").modal("show");
    //   return;
    // }    

    var items: any[] = [];
    this.patientPrescriptionsDetails.filter((x: any) => Number(x.Qty) > 0 && (x.HoldStatus === '' || x.HoldStatus === '0')).forEach((element: any, index: any) => {
      var billSummitems = this.billSummary.items.filter((x: any) => x.itemId == element.ItemID);
      billSummitems.forEach((ele: any) => {
        items.push({
          "sequence": items.length + 1,
          "hospDeptId": 0,
          "itemID": element.ItemID,
          "packId": element.PackId,
          "uoMID": element.UID,//ele.batchDetails[0].qohUomId,
          "tax": 0,
          "quantity": ele.quantity,// element.changedQty != undefined ? element.changedQty : element.Qty,
          "unitRate": element.UPrice,
          "batchID": ele.batchDetails[0].batchId, //element.BatchId,
          "salesTax": 0,
          "taxAmount": 0,
          "orderItemID": (element.ActualPrescribedItemID === undefined || element.ActualPrescribedItemID === '') ? 0 : Number(element.ActualPrescribedItemID),
          "prescriptionID": this.selectedPrescription === undefined ? 0 : this.selectedPrescription.PrescriptionID,
          "status": 0,
          "discountType": 0,
          "discount": 0,
          "issueQTY": element.ActIssueQTY,
          "issueUOMID": element.IssueUOMID,
          "drugOrderStatus": 0,
          "remarks": "",
          "isbillable": true,
          "issubstitute": element.isSubstitute,
          "sticker": "",
          "frequencyRmkCode": "",
          "frequencyrmk": "",
          "frequencyRmk2l": "",
          "unitRateExclDISC": 0,
        });
      });
    });

    var salestype = "CI";
    if (this.selectedPrescription && this.selectedPrescription.PatientType == "1" && this.isCash) {
      salestype = "CI";
    }
    else if (this.selectedPrescription && this.selectedPrescription.PatientType == "1" && !this.isCash) {
      salestype = "CR";
    }
    else if (this.selectedPrescription && this.selectedPrescription.PatientType == "3" && this.isCash) {
      salestype = "CI";
    }
    else if (this.selectedPrescription && this.selectedPrescription.PatientType == "3" && !this.isCash) {
      salestype = "CR";
    }

    var payments: any[] = [];
    if (this.splitPay) {
      payments.push({
        "bankID": 0,
        "cardID": this.getCardType(),
        "paymentModeID": 1,
        "amount": this.billSummary?.balanceAmount,
        "discount": 0,
        "credit": 0,
        "payTranNumber": this.posTransRefNo ?? '',
        "cardNumber": this.CardNumber ?? '',
        "voucherID": 0,
        "voucherName": "",
        "cardHolder": "",
        "edcMachine": this.EDCMachineID ?? '',
        "companyID": 0,
        "cardIssueDate": "",
        "cardValidityDate": "",
        "edcMachineID": 0,
        "branchName": "",
        "hospitalID": this.hospitalID,
        "contact": "",
        "remarks": "",
        "orderint": 0,
        "chequetype": 0,
        "currencyid": 0,
        "currencyRate": 0,
        "currencyAmount": 0,
        "cashGiven": this.billSummaryform.get('cashCollectedAmount')?.value,
        "changeRendered": this.billSummaryform.get('ChangeToBeRendered')?.value,
        "entryDate": "",
        "tranDate": "",
        "validTo": ""
      });
      payments.push({
        "bankID": 0,
        "cardID": this.getCardType(),
        "paymentModeID": 2,
        "amount": this.billSummary?.balanceAmount,
        "discount": 0,
        "credit": 0,
        "payTranNumber": this.posTransRefNo ?? '',
        "cardNumber": this.CardNumber ?? '',
        "voucherID": 0,
        "voucherName": "",
        "cardHolder": "",
        "edcMachine": this.EDCMachineID ?? '',
        "companyID": 0,
        "cardIssueDate": "",
        "cardValidityDate": "",
        "edcMachineID": 0,
        "branchName": "",
        "hospitalID": this.hospitalID,
        "contact": "",
        "remarks": "",
        "orderint": 0,
        "chequetype": 0,
        "currencyid": 0,
        "currencyRate": 0,
        "currencyAmount": 0,
        "cashGiven": this.billSummaryform.get('cashCollectedAmount')?.value,
        "changeRendered": this.billSummaryform.get('ChangeToBeRendered')?.value,
        "entryDate": "",
        "tranDate": "",
        "validTo": ""
      });
    } else {
      payments.push({
        "bankID": 0,
        "cardID": this.getCardType(),
        "paymentModeID": this.billSummaryform.get('ModeofPayment')?.value,
        "amount": this.billSummary?.balanceAmount,
        "discount": 0,
        "credit": 0,
        "payTranNumber": this.posTransRefNo ?? '',
        "cardNumber": this.CardNumber ?? '',
        "voucherID": 0,
        "voucherName": "",
        "cardHolder": "",
        "edcMachine": this.EDCMachineID ?? '',
        "companyID": 0,
        "cardIssueDate": "",
        "cardValidityDate": "",
        "edcMachineID": 0,
        "branchName": "",
        "hospitalID": this.hospitalID,
        "contact": "",
        "remarks": "",
        "orderint": 0,
        "chequetype": 0,
        "currencyid": 0,
        "currencyRate": 0,
        "currencyAmount": 0,
        "cashGiven": this.billSummaryform.get('CollectedAmount')?.value,
        "changeRendered": this.billSummaryform.get('ChangeToBeRendered')?.value,
        "entryDate": "",
        "tranDate": "",
        "validTo": ""
      });
    }

    var mainbill = {
      "salesID": 0,
      "salesNo": "",
      "patientType": 6,
      "patientID": this.selectedPatientId,
      "ipid": this.selectedAdmissionId === '' ? 0 : this.selectedAdmissionId,
      "bedID": 0,
      "orderBedType": 0, //this.patientDetails.OrdertypeId,
      "doctorID": this.selectedDoctorId,
      "drugOrderID": 0,
      "referenceNo": "",
      "total": this.NetBillAmount,
      "salesType": salestype,
      "paymentModeID": this.billSummaryform.get('ModeofPayment')?.value,//cash/credit
      "firstName": this.patientDetails.FirstName,
      "middleName": this.patientDetails.MiddleName,
      "lastName": this.patientDetails.LastName,
      "ageUoMID": this.patientDetails.AgeUoMID,
      "age": this.patientDetails.Age,
      "genderID": this.patientDetails.GenderID,
      "bankID": 0,
      "cardID": 0,
      "amount": this.NetBillAmount,
      "discount": this.DiscountAmount,
      "credit": 0,
      "payTranNumber": this.posTransRefNo ?? '',
      "cardNumber": this.CardNumber ?? '',
      "companyID": 0,
      "gradeID": 0,
      "userid": this.doctorDetails[0].UserId,
      "workstationid": this.facilitySessionId ?? this.service.fetchTokenCounterMaster.WorkStationID,
      "prescriptionID": (this.selectedPrescription === undefined || this.selectedPrescription.length == 0) ? 0 : this.selectedPrescription.PrescriptionID,
      "orderStatus": this.orderStatus,
      "doctorName": (this.selectedPrescription === undefined || this.selectedPrescription.length == 0) ? this.selectedDoctor : this.selectedPrescription.Doctorname,
      "receiptAmount": this.billSummaryform.get('ReceiptAmount')?.value,
      "totalReceiptAmount": this.billSummaryform.get('ReceiptAmount')?.value,//this.totalAmount,
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
      "collectedAmount": this.billSummaryform.get('CollectedAmount')?.value,//collected amount field
      "changerendered": this.billSummaryform.get('ChangeToBeRendered')?.value, // change to be rendered field
      "isStaffIssue": true,
      "posTransactionRefNo": this.posTransRefNo ?? '',
      "posTransactionResult": this.posTransactionResult ?? '',
      "items": items,
      "payments": payments,
      "billDetails": [],
      "contributions": [],
      "letterID": [],
      "creditPayments": [],
      "discounts": [],
      "billID": 0,
      "billNo": "",
      "visitNumber": "",
      "billDate": "",
      "visitID": 0,
      "visitTYpe": 0,
      "newVisitID": 0,
      "episodeID": 0,
      "depositAvailed": 0,
      "cashDiscount": 0,
      "empID": 0,
      "parentBillID": 0,
      "agreementId": 0,
      "copay": 0,
      "cash": 0,
      "cvat": 0,
      "pvat": 0
    }

    var nonSFDA = {
      "salesID": 0,
      "salesNo": "",
      "patientType": 6,
      "patientID": this.selectedPatientId,
      "ipid": this.selectedAdmissionId === '' ? 0 : this.selectedAdmissionId,
      "bedID": 0,
      "orderBedType": 0, //this.patientDetails.OrdertypeId,
      "doctorID": this.selectedDoctorId,
      "drugOrderID": 0,
      "referenceNo": "",
      "total": this.billSummarynonSFDA.billAmount,
      "salesType": salestype,
      "paymentModeID": this.billSummaryform.get('ModeofPayment')?.value,//cash/credit
      "firstName": this.patientDetails.FirstName,
      "middleName": this.patientDetails.MiddleName,
      "lastName": this.patientDetails.LastName,
      "ageUoMID": this.patientDetails.AgeUoMID,
      "age": this.patientDetails.Age,
      "genderID": this.patientDetails.GenderID,
      "bankID": 0,
      "cardID": 0,
      "amount": this.billSummarynonSFDA.billAmount,
      "discount": this.billSummarynonSFDA.discountAmount,
      "credit": 0,
      "payTranNumber": this.posTransRefNo ?? '',
      "cardNumber": this.CardNumber ?? '',
      "companyID": 0,
      "gradeID": 0,
      "userid": this.doctorDetails[0].UserId,
      "workstationid": this.facilitySessionId ?? this.service.fetchTokenCounterMaster.WorkStationID,
      "prescriptionID": (this.selectedPrescription === undefined || this.selectedPrescription.length == 0) ? 0 : this.selectedPrescription.PrescriptionID,
      "orderStatus": this.orderStatus,
      "doctorName": (this.selectedPrescription === undefined || this.selectedPrescription.length == 0) ? this.selectedDoctor : this.selectedPrescription.Doctorname,
      "receiptAmount": this.billSummarynonSFDA.netBillAmountWithOutVat,
      "totalReceiptAmount": this.billSummarynonSFDA.netBillAmountWithOutVat,//this.totalAmount,
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
      "collectedAmount": this.billSummaryform.get('CollectedAmount')?.value,//collected amount field
      "changerendered": this.billSummaryform.get('ChangeToBeRendered')?.value, // change to be rendered field
      "isStaffIssue": true,
      "posTransactionRefNo": this.posTransRefNo ?? '',
      "posTransactionResult": this.posTransactionResult ?? '',
      "items": this.billSummarynonSFDA.items,
      "payments": payments,
      "billDetails": this.billSummarynonSFDA.billDetails == null ? [] : this.billSummarynonSFDA.billDetails,
      "contributions": this.billSummarynonSFDA.contributions == null ? [] : this.billSummarynonSFDA.contributions,
      "letterID": this.billSummarynonSFDA.letterID == null ? [] : this.billSummarynonSFDA.letterID,
      "creditPayments": [],
      "discounts": this.billSummarynonSFDA.discounts == null ? [] : this.billSummarynonSFDA.discounts,
      "billID": this.billSummarynonSFDA.billID,
      "billNo": this.billSummarynonSFDA.billNo,
      "visitNumber": "",
      "billDate": "",
      "visitID": 0,
      "visitTYpe": 0,
      "newVisitID": 0,
      "episodeID": 0,
      "depositAvailed": 0,
      "cashDiscount": 0,
      "empID": 0,
      "parentBillID": 0,
      "agreementId": this.billSummarynonSFDA.agreementId,
      "copay": 0,
      "cash": 0,
      "cvat": this.billSummarynonSFDA.cVat,
      "pvat": this.billSummarynonSFDA.pVat
    }

    var sfda = {
      "salesID": 0,
      "salesNo": "",
      "patientType": 6,
      "patientID": this.selectedPatientId,
      "ipid": this.selectedAdmissionId === '' ? 0 : this.selectedAdmissionId,
      "bedID": 0,
      "orderBedType": 0, //this.patientDetails.OrdertypeId,
      "doctorID": this.selectedDoctorId,
      "drugOrderID": 0,
      "referenceNo": "",
      "total": this.billSummarysfda.billAmount,
      "salesType": salestype,
      "paymentModeID": this.billSummaryform.get('ModeofPayment')?.value,//cash/credit
      "firstName": this.patientDetails.FirstName,
      "middleName": this.patientDetails.MiddleName,
      "lastName": this.patientDetails.LastName,
      "ageUoMID": this.patientDetails.AgeUoMID,
      "age": this.patientDetails.Age,
      "genderID": this.patientDetails.GenderID,
      "bankID": 0,
      "cardID": 0,
      "amount": this.billSummarysfda.billAmount,
      "discount": this.billSummarysfda.discountAmount,
      "credit": 0,
      "payTranNumber": this.posTransRefNo ?? '',
      "cardNumber": this.CardNumber ?? '',
      "companyID": 0,
      "gradeID": 0,
      "userid": this.doctorDetails[0].UserId,
      "workstationid": this.facilitySessionId ?? this.service.fetchTokenCounterMaster.WorkStationID,
      "prescriptionID": (this.selectedPrescription === undefined || this.selectedPrescription.length == 0) ? 0 : this.selectedPrescription.PrescriptionID,
      "orderStatus": this.orderStatus,
      "doctorName": (this.selectedPrescription === undefined || this.selectedPrescription.length == 0) ? this.selectedDoctor : this.selectedPrescription.Doctorname,
      "receiptAmount": this.billSummarysfda.netBillAmountWithOutVat,
      "totalReceiptAmount": this.billSummarysfda.netBillAmountWithOutVat,//this.totalAmount,
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
      "collectedAmount": this.billSummaryform.get('CollectedAmount')?.value,//collected amount field
      "changerendered": this.billSummaryform.get('ChangeToBeRendered')?.value, // change to be rendered field
      "isStaffIssue": true,
      "posTransactionRefNo": this.posTransRefNo ?? '',
      "posTransactionResult": this.posTransactionResult ?? '',
      "items": this.billSummarysfda.items,
      "payments": payments,
      "billDetails": this.billSummarysfda.billDetails == null ? [] : this.billSummarysfda.billDetails,
      "contributions": this.billSummarysfda.contributions == null ? [] : this.billSummarysfda.contributions,
      "letterID": this.billSummarysfda.letterID == null ? [] : this.billSummarysfda.letterID,
      "creditPayments": [],
      "discounts": this.billSummarysfda.discounts == null ? [] : this.billSummarysfda.discounts,
      "billID": this.billSummarysfda.billID,
      "billNo": this.billSummarysfda.billNo,
      "visitNumber": "",
      "billDate": "",
      "visitID": 0,
      "visitTYpe": 0,
      "newVisitID": 0,
      "episodeID": 0,
      "depositAvailed": 0,
      "cashDiscount": 0,
      "empID": 0,
      "parentBillID": 0,
      "agreementId": this.billSummarysfda.agreementId,
      "copay": 0,
      "cash": 0,
      "cvat": this.billSummarysfda.cVat,
      "pvat": this.billSummarysfda.pVat
    }

    nonSFDA.items.forEach((element: any) => {
      element.remarks = "",
        element.sticker = "",
        element.frequencyRmkCode = "",
        element.frequencyrmk = "",
        element.frequencyRmk2l = ""
    });

    sfda.items.forEach((element: any) => {
      element.remarks = "",
        element.sticker = "",
        element.frequencyRmkCode = "",
        element.frequencyrmk = "",
        element.frequencyRmk2l = ""
    });

    var payload = {
      "mainBill": mainbill,
      "nonSFDABill": nonSFDA,
      "sfdaBill": sfda,
      "consumePosting": this.prepareConsumePostingData()
    }

    const modalRef = this.modalService.open(ValidateEmployeeComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.us.savecashissuebill(cashissue.saveoutpatientpharmacyissue, payload)
          .subscribe((response: any) => {
            if (response.status == "Success") {
              this.billNumber = response.billNumber;
              this.billSummarybtn = false;
              this.showBillSummary = false;
              this.billId = response.id;
              //this.billPrint();
              if (this.selectedPrescription) {
                this.loadSelectedPrescriptionDetails(this.selectedPrescription);
                this.SavePatientPrescriptionInjectionSchedules();
              }
              $("#cashissueSaveMsg").modal('show');
            }
          },
            (err) => {

            })
      }
      modalRef.close();
    });
  }

  saveCashIssueForCreditPatient() {
    const collectedAmount = this.billSummaryform.get('CollectedAmount')?.value
    if (collectedAmount == '' || collectedAmount === 0) {
      this.errorMessage = "Please enter Collected Amount";
      $("#errorMsg").modal("show");
      return;
    }
    // if (this.DiscountAmount != '' && this.DiscountAmount != 0 && !this.validateDiscount) {
    //   this.errorMessage = "Please validate discount";
    //   $("#errorMsg").modal("show");
    //   return;
    // }    

    var items: any[] = [];
    this.patientPrescriptionsDetails.filter((x: any) => Number(x.Qty) > 0 && (x.HoldStatus === '' || x.HoldStatus === '0')).forEach((element: any, index: any) => {
      var billSummitems = this.billSummary.creditItems.filter((x: any) => x.itemId == element.ItemID);
      billSummitems.forEach((ele: any) => {
        items.push({
          "sequence": items.length + 1,
          "hospDeptId": this.facilitySessionId, //this.hospdepdid,
          "itemID": element.ItemID,
          "packId": element.PackId,
          "uoMID": element.UID,//ele.batchDetails[0].qohUomId,
          "tax": 0,
          "quantity": ele.quantity,// element.changedQty != undefined ? element.changedQty : element.Qty,
          "unitRate": element.UPrice,
          "batchID": ele.batchDetails[0].batchId, //element.BatchId,
          "salesTax": 0,
          "taxAmount": 0,
          "orderItemID": (element.ActualPrescribedItemID === undefined || element.ActualPrescribedItemID === '') ? 0 : Number(element.ActualPrescribedItemID),
          "prescriptionID": this.selectedPrescription.PrescriptionID,
          "status": 0,
          "discountType": 0,
          "discount": 0,
          "issueQTY": element.ActIssueQTY,
          "issueUOMID": element.IssueUOMID,
          "drugOrderStatus": 0,
          "remarks": "",
          "isbillable": true,
          "issubstitute": element.isSubstitute,
          "sticker": "",
          "frequencyRmkCode": "",
          "frequencyrmk": "",
          "frequencyRmk2l": "",
          "unitRateExclDISC": 0
        });
      });
    });

    var billDetails: any[] = [];
    var contributions: any[] = [];
    var letterID: any[] = [];
    var creditPayments: any[] = [];
    var discounts: any[] = [];

    var payments: any[] = [];
    if (this.splitPay) {
      payments.push({
        "bankID": 0,
        "cardID": this.getCardType(),
        "paymentModeID": 1,
        "amount": this.billSummary?.balanceAmount,
        "discount": 0,
        "credit": 0,
        "payTranNumber": this.posTransRefNo ?? '',
        "cardNumber": this.CardNumber ?? '',
        "voucherID": 0,
        "voucherName": "",
        "cardHolder": "",
        "edcMachine": this.EDCMachineID ?? '',
        "companyID": 0,
        "cardIssueDate": "",
        "cardValidityDate": "",
        "edcMachineID": 0,
        "branchName": "",
        "hospitalID": this.hospitalID,
        "contact": "",
        "remarks": "",
        "orderint": 0,
        "chequetype": 0,
        "currencyid": 0,
        "currencyRate": 0,
        "currencyAmount": 0,
        "cashGiven": this.billSummaryform.get('cashCollectedAmount')?.value,
        "changeRendered": this.billSummaryform.get('ChangeToBeRendered')?.value,
        "entryDate": "",
        "tranDate": "",
        "validTo": ""
      });
      payments.push({
        "bankID": 0,
        "cardID": this.getCardType(),
        "paymentModeID": 2,
        "amount": this.billSummary?.balanceAmount,
        "discount": 0,
        "credit": 0,
        "payTranNumber": this.posTransRefNo ?? '',
        "cardNumber": this.CardNumber ?? '',
        "voucherID": 0,
        "voucherName": "",
        "cardHolder": "",
        "edcMachine": this.EDCMachineID ?? '',
        "companyID": 0,
        "cardIssueDate": "",
        "cardValidityDate": "",
        "edcMachineID": 0,
        "branchName": "",
        "hospitalID": this.hospitalID,
        "contact": "",
        "remarks": "",
        "orderint": 0,
        "chequetype": 0,
        "currencyid": 0,
        "currencyRate": 0,
        "currencyAmount": 0,
        "cashGiven": this.billSummaryform.get('cashCollectedAmount')?.value,
        "changeRendered": this.billSummaryform.get('ChangeToBeRendered')?.value,
        "entryDate": "",
        "tranDate": "",
        "validTo": ""
      });
    } else {
      payments.push({
        "bankID": 0,
        "cardID": this.getCardType(),
        "paymentModeID": this.billSummaryform.get('ModeofPayment')?.value,
        "amount": this.billSummary?.balanceAmount,
        "discount": 0,
        "credit": 0,
        "payTranNumber": this.posTransRefNo ?? '',
        "cardNumber": this.CardNumber ?? '',
        "voucherID": 0,
        "voucherName": "",
        "cardHolder": "",
        "edcMachine": this.EDCMachineID ?? '',
        "companyID": 0,
        "cardIssueDate": "",
        "cardValidityDate": "",
        "edcMachineID": 0,
        "branchName": "",
        "hospitalID": this.hospitalID,
        "contact": "",
        "remarks": "",
        "orderint": 0,
        "chequetype": 0,
        "currencyid": 0,
        "currencyRate": 0,
        "currencyAmount": 0,
        "cashGiven": this.billSummaryform.get('CollectedAmount')?.value,
        "changeRendered": this.billSummaryform.get('ChangeToBeRendered')?.value,
        "entryDate": "",
        "tranDate": "",
        "validTo": ""
      });
    }

    var creditpayments: any[] = [];
    if (this.splitPay) {
      creditpayments.push({
        cardID: 0,
        paymentModeID: 1,
        bankID: 0,
        entryDate: '',
        balanceAmount: this.billSummary?.balanceAmount,
        transationNo: '',
        cardNo: '',
        tranDate: '',
        validTo: '',
        contact: '',
        remarks: '',
        orderint: 0,
        chequetype: 0,
        voucherID: 0,
        voucherName: '',
        cardHolder: '',
        edcMachine: '',
        currencyid: 0,
        currencyRate: 0,
        currencyAmount: 0,
        cashGiven: this.billSummaryform.get('cashCollectedAmount')?.value,
        changeRendered: this.billSummaryform.get('ChangeToBeRendered')?.value,
      });
      creditpayments.push({
        cardID: this.getCardType(),
        paymentModeID: 2,
        bankID: 0,
        entryDate: '',
        balanceAmount: this.billSummary?.balanceAmount,
        transationNo: this.posTransRefNo ?? '',
        cardNo: this.CardNumber ?? '',
        tranDate: '',
        validTo: '',
        contact: '',
        remarks: '',
        orderint: 0,
        chequetype: 0,
        voucherID: 0,
        voucherName: '',
        cardHolder: '',
        edcMachine: this.EDCMachineID ?? '',
        currencyid: 0,
        currencyRate: 0,
        currencyAmount: 0,
        cashGiven: this.billSummaryform.get('cardCollectedAmount')?.value,
        changeRendered: this.billSummaryform.get('ChangeToBeRendered')?.value,
      });
    } else {
      creditpayments.push({
        cardID: this.getCardType(),
        paymentModeID: this.billSummaryform.get('ModeofPayment')?.value,
        bankID: 0,
        entryDate: '',
        balanceAmount: this.billSummary?.balanceAmount,
        transationNo: this.posTransRefNo ?? '',
        cardNo: this.CardNumber ?? '',
        tranDate: '',
        validTo: '',
        contact: '',
        remarks: '',
        orderint: 0,
        chequetype: 0,
        voucherID: 0,
        voucherName: '',
        cardHolder: '',
        edcMachine: this.EDCMachineID ?? '',
        currencyid: 0,
        currencyRate: 0,
        currencyAmount: 0,
        cashGiven: this.billSummaryform.get('CollectedAmount')?.value,
        changeRendered: this.billSummaryform.get('ChangeToBeRendered')?.value,
      });
    }

    var salestype = "EA";
    if (this.selectedPrescription.PatientType == "1" && this.isCash) {
      salestype = "OP";
    }
    else if (this.selectedPrescription.PatientType == "1" && !this.isCash) {
      salestype = "CR";
    }
    else if (this.selectedPrescription.PatientType == "3" && this.isCash) {
      salestype = "EA";
    }
    else if (this.selectedPrescription.PatientType == "3" && !this.isCash) {
      salestype = "CR";
    }


    const totalCollectableAmount = this.billSummary?.balanceAmount;
    const diffAmount = parseFloat(this.billSummaryform.get('CollectedAmount')?.value) - parseFloat(totalCollectableAmount);
    const sfdaCollectedamount = parseFloat(this.billSummarysfda.balanceAmount) + diffAmount;
    const sfdaRenderedChange = diffAmount;

    var mainbill = {
      "salesID": 0,
      "salesNo": "",
      "patientType": 6,
      "patientID": this.selectedPatientId,
      "ipid": this.selectedAdmissionId,
      "bedID": 0,
      "orderBedType": 0, //this.patientDetails.OrdertypeId,
      "doctorID": this.selectedDoctorId,
      "drugOrderID": 0,
      "referenceNo": "",
      "total": this.NetBillAmount,
      "salesType": salestype,
      "paymentModeID": this.billSummaryform.get('ModeofPayment')?.value,//cash/credit
      "firstName": this.patientDetails.FirstName,
      "middleName": this.patientDetails.MiddleName,
      "lastName": this.patientDetails.LastName,
      "ageUoMID": this.patientDetails.AgeUoMID,
      "age": this.patientDetails.Age,
      "genderID": this.patientDetails.GenderID,
      "bankID": 0,
      "cardID": 0,
      "amount": this.BillAmountWithVAT,
      "discount": this.DiscountAmount,
      "cash": this.receiptAmount,
      "credit": this.receiptAmount,
      "copay": this.billSummary?.collectedAmount,
      "cvat": this.billSummary?.cVat,
      "pvat": this.billSummary?.pVat,
      "payTranNumber": this.posTransRefNo ?? '',
      "cardNumber": this.CardNumber ?? '',
      "companyID": this.patientPrescriptionCompanyDetails.CompanyID === '' ? 0 : this.patientPrescriptionCompanyDetails.CompanyID,
      "gradeID": this.patientPrescriptionCompanyDetails.GradeID === '' ? 0 : this.patientPrescriptionCompanyDetails.GradeID,
      "userid": this.doctorDetails[0].UserId,
      "workstationid": this.facilitySessionId ?? this.service.fetchTokenCounterMaster.WorkStationID,
      "prescriptionID": this.selectedPrescription.PrescriptionID,
      "orderStatus": this.orderStatus,
      "doctorName": this.selectedPrescription.Doctorname,
      "receiptAmount": this.billSummaryform.get('ReceiptAmount')?.value,
      "totalReceiptAmount": this.billSummaryform.get('ReceiptAmount')?.value,//this.totalAmount,
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
      "collectedAmount": this.billSummaryform.get('CollectedAmount')?.value,//collected amount field
      "changerendered": this.billSummaryform.get('ChangeToBeRendered')?.value, // change to be rendered field
      "isStaffIssue": true,
      "posTransactionRefNo": this.posTransRefNo ?? '',
      "posTransactionResult": this.posTransactionResult ?? '',
      "items": items,
      "payments": payments,
      "billDetails": this.calculateBillResponse.billDetails === null ? [] : this.calculateBillResponse.billDetails,
      "contributions": this.calculateBillResponse.contributions === null ? [] : this.calculateBillResponse.contributions,
      "letterID": [
        {
          "lettterId": (this.calculateBillResponse.letterID[0].lettterId === '' || this.calculateBillResponse.letterID[0].lettterId === null) ? 0 : this.calculateBillResponse.letterID[0].lettterId
        }
      ],
      "creditPayments": creditpayments,
      "discounts": this.calculateBillResponse.discounts === null ? [] : this.calculateBillResponse.discounts,
      "billID": 0,
      "billNo": "",
      "visitNumber": "",
      "billDate": "",
      "visitID": 0,
      "visitTYpe": 0,
      "newVisitID": 0,
      "episodeID": 0,
      "depositAvailed": 0,
      "cashDiscount": 0,
      "empID": this.doctorDetails[0].EmpId,
      "parentBillID": 0,
      "agreementId": this.patientPrescriptionCompanyDetails.AgreementId === '' ? -1 : this.patientPrescriptionCompanyDetails.AgreementId

    }

    let nonsfdaItems: any = [];
    this.billSummarynonSFDA.items.forEach((nsfdael: any) => {
      const item = items.filter((x: any) => x.itemID == nsfdael.itemId);
      if (item.length > 0) {
        item.forEach((x: any) => {
          nonsfdaItems.push(x);
        });
      }
    });
    var nonSFDA = {
      "salesID": 0,
      "salesNo": "",
      "patientType": 6,
      "patientID": this.selectedPatientId,
      "ipid": this.selectedAdmissionId,
      "bedID": 0,
      "orderBedType": 0, //this.patientDetails.OrdertypeId,
      "doctorID": this.selectedDoctorId,
      "drugOrderID": 0,
      "referenceNo": "",
      "total": this.billSummarynonSFDA.billAmount,
      "salesType": salestype,
      "paymentModeID": this.billSummaryform.get('ModeofPayment')?.value,//cash/credit
      "firstName": this.patientDetails.FirstName,
      "middleName": this.patientDetails.MiddleName,
      "lastName": this.patientDetails.LastName,
      "ageUoMID": this.patientDetails.AgeUoMID,
      "age": this.patientDetails.Age,
      "genderID": this.patientDetails.GenderID,
      "bankID": 0,
      "cardID": 0,
      "amount": this.billSummarynonSFDA.billAmount,
      "discount": this.billSummarynonSFDA.discountAmount,
      "cash": this.billSummarynonSFDA.collectableAmount,
      "credit": this.billSummarynonSFDA.totalPayerAmount,
      "copay": this.billSummarynonSFDA?.collectableAmount,
      "cvat": this.billSummarynonSFDA?.cVat,
      "pvat": this.billSummarynonSFDA?.pVat,
      "payTranNumber": this.posTransRefNo ?? '',
      "cardNumber": this.CardNumber ?? '',
      "companyID": this.patientPrescriptionCompanyDetails.CompanyID === '' ? 0 : this.patientPrescriptionCompanyDetails.CompanyID,
      "gradeID": this.patientPrescriptionCompanyDetails.GradeID === '' ? 0 : this.patientPrescriptionCompanyDetails.GradeID,
      "userid": this.doctorDetails[0].UserId,
      "workstationid": this.facilitySessionId ?? this.service.fetchTokenCounterMaster.WorkStationID,
      "prescriptionID": this.selectedPrescription.PrescriptionID,
      "orderStatus": this.orderStatus,
      "doctorName": this.selectedPrescription.Doctorname,
      "receiptAmount": this.billSummarynonSFDA?.collectableAmount,
      "totalReceiptAmount": this.billSummarynonSFDA?.collectableAmount,
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
      "collectedAmount": this.billSummarynonSFDA.balanceAmount,//this.billSummaryform.get('CollectedAmount')?.value,//collected amount field
      "changerendered": 0, //this.billSummaryform.get('ChangeToBeRendered')?.value, // change to be rendered field
      "isStaffIssue": true,
      "posTransactionRefNo": this.posTransRefNo ?? '',
      "posTransactionResult": this.posTransactionResult ?? '',
      "items": nonsfdaItems,//this.billSummarynonSFDA.items,
      // "payments": payments,
      "payments": [
        {
          "bankID": 0,
          "cardID": this.getCardType(),
          "paymentModeID": this.billSummaryform.get('ModeofPayment')?.value,
          "amount": this.billSummarynonSFDA.balanceAmount,
          "discount": 0,
          "credit": 0,
          "payTranNumber": this.posTransRefNo ?? '',
          "cardNumber": this.CardNumber ?? '',
          "voucherID": 0,
          "voucherName": "",
          "cardHolder": "",
          "edcMachine": this.EDCMachineID ?? '',
          "companyID": 0,
          "cardIssueDate": "",
          "cardValidityDate": "",
          "edcMachineID": 0,
          "branchName": "",
          "hospitalID": this.hospitalID,
          "contact": "",
          "remarks": "",
          "orderint": 0,
          "chequetype": 0,
          "currencyid": 0,
          "currencyRate": 0,
          "currencyAmount": 0,
          "cashGiven": this.billSummarynonSFDA.balanceAmount,
          "changeRendered": 0,
          "entryDate": "",
          "tranDate": "",
          "validTo": ""
        }
      ],
      "billDetails": this.billSummarynonSFDA.billDetails === null ? [] : this.billSummarynonSFDA.billDetails,
      "contributions": this.billSummarynonSFDA.contributions === null ? [] : this.billSummarynonSFDA.contributions,
      "letterID": this.billSummarynonSFDA.letterID == null ?
        [{
          "lettterId": 0
        }] :
        [{
          "lettterId": (this.billSummarynonSFDA.letterID[0]?.lettterId === '' || this.billSummarynonSFDA.letterID[0]?.lettterId === null) ? 0 : this.billSummarynonSFDA.letterID[0]?.lettterId
        }],
      // "creditPayments": creditpayments,
      "creditPayments": [
        {
          cardID: this.getCardType(),
          paymentModeID: this.billSummaryform.get('ModeofPayment')?.value,
          bankID: 0,
          entryDate: '',
          balanceAmount: this.billSummarynonSFDA.balanceAmount,
          transationNo: this.posTransRefNo ?? '',
          cardNo: this.CardNumber ?? '',
          tranDate: '',
          validTo: '',
          contact: '',
          remarks: '',
          orderint: 0,
          chequetype: 0,
          voucherID: 0,
          voucherName: '',
          cardHolder: '',
          edcMachine: this.EDCMachineID ?? '',
          currencyid: 0,
          currencyRate: 0,
          currencyAmount: 0,
          cashGiven: this.billSummarynonSFDA.balanceAmount,
          changeRendered: 0,
        }
      ],
      "discounts": this.billSummarynonSFDA.discounts === null ? [] : this.billSummarynonSFDA.discounts,
      "billID": 0,
      "billNo": "",
      "visitNumber": "",
      "billDate": "",
      "visitID": 0,
      "visitTYpe": 0,
      "newVisitID": 0,
      "episodeID": 0,
      "depositAvailed": 0,
      "cashDiscount": 0,
      "empID": this.doctorDetails[0].EmpId,
      "parentBillID": 0,
      "agreementId": this.billSummarynonSFDA.agreementId === '' ? -1 : this.billSummarynonSFDA.agreementId

    }

    let sfdaItems: any = [];
    this.billSummarysfda.items.forEach((sfdael: any) => {
      const item = items.filter((x: any) => x.itemID == sfdael.itemId);
      if (item.length > 0) {
        item.forEach((x: any) => {
          sfdaItems.push(x);
        });
      }
    });
    var sfda = {
      "salesID": 0,
      "salesNo": "",
      "patientType": 6,
      "patientID": this.selectedPatientId,
      "ipid": this.selectedAdmissionId,
      "bedID": 0,
      "orderBedType": 0, //this.patientDetails.OrdertypeId,
      "doctorID": this.selectedDoctorId,
      "drugOrderID": 0,
      "referenceNo": "",
      "total": this.billSummarysfda.billAmount,
      "salesType": salestype,
      "paymentModeID": this.billSummaryform.get('ModeofPayment')?.value,//cash/credit
      "firstName": this.patientDetails.FirstName,
      "middleName": this.patientDetails.MiddleName,
      "lastName": this.patientDetails.LastName,
      "ageUoMID": this.patientDetails.AgeUoMID,
      "age": this.patientDetails.Age,
      "genderID": this.patientDetails.GenderID,
      "bankID": 0,
      "cardID": 0,
      "amount": this.billSummarysfda.billAmount,
      "discount": this.billSummarysfda.discountAmount,
      "cash": this.billSummarysfda.collectableAmount,
      "credit": this.billSummarysfda.totalPayerAmount,
      "copay": this.billSummarysfda?.collectableAmount,
      "cvat": this.billSummarysfda?.cVat,
      "pvat": this.billSummarysfda?.pVat,
      "payTranNumber": this.posTransRefNo ?? '',
      "cardNumber": this.CardNumber ?? '',
      "companyID": this.patientPrescriptionCompanyDetails.CompanyID === '' ? 0 : this.patientPrescriptionCompanyDetails.CompanyID,
      "gradeID": this.patientPrescriptionCompanyDetails.GradeID === '' ? 0 : this.patientPrescriptionCompanyDetails.GradeID,
      "userid": this.doctorDetails[0].UserId,
      "workstationid": this.facilitySessionId ?? this.service.fetchTokenCounterMaster.WorkStationID,
      "prescriptionID": this.selectedPrescription.PrescriptionID,
      "orderStatus": this.orderStatus,
      "doctorName": this.selectedPrescription.Doctorname,
      "receiptAmount": this.billSummarysfda?.collectableAmount,
      "totalReceiptAmount": this.billSummarysfda?.collectableAmount,
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
      "collectedAmount": sfdaCollectedamount,//this.billSummaryform.get('CollectedAmount')?.value,//collected amount field
      "changerendered": sfdaRenderedChange,//this.billSummaryform.get('ChangeToBeRendered')?.value, // change to be rendered field
      "isStaffIssue": true,
      "posTransactionRefNo": this.posTransRefNo ?? '',
      "posTransactionResult": this.posTransactionResult ?? '',
      "items": sfdaItems,//this.billSummarysfda.items,
      // "payments": payments,
      "payments": [
        {
          "cardID": this.getCardType(),
          "paymentModeID": this.billSummaryform.get('ModeofPayment')?.value,
          "amount": sfdaCollectedamount,
          "discount": 0,
          "credit": 0,
          "payTranNumber": this.posTransRefNo ?? '',
          "cardNumber": this.CardNumber ?? '',
          "voucherID": 0,
          "voucherName": "",
          "cardHolder": "",
          "edcMachine": this.EDCMachineID ?? '',
          "companyID": 0,
          "cardIssueDate": "",
          "cardValidityDate": "",
          "edcMachineID": 0,
          "branchName": "",
          "hospitalID": this.hospitalID,
          "contact": "",
          "remarks": "",
          "orderint": 0,
          "chequetype": 0,
          "currencyid": 0,
          "currencyRate": 0,
          "currencyAmount": 0,
          "cashGiven": sfdaCollectedamount,
          "changeRendered": sfdaRenderedChange,
          "entryDate": "",
          "tranDate": "",
          "validTo": ""
        }
      ],
      "billDetails": this.billSummarysfda.billDetails === null ? [] : this.billSummarysfda.billDetails,
      "contributions": this.billSummarysfda.contributions === null ? [] : this.billSummarysfda.contributions,
      "letterID": this.billSummarysfda.letterID == null ?
        [{
          "lettterId": 0
        }]
        :
        [
          {
            "lettterId": (this.billSummarysfda.letterID[0].lettterId === '' || this.billSummarysfda.letterID[0].lettterId === null) ? 0 : this.billSummarysfda.letterID[0].lettterId
          }
        ],
      //"creditPayments": creditpayments,
      "creditPayments": [
        {
          cardID: this.getCardType(),
          paymentModeID: this.billSummaryform.get('ModeofPayment')?.value,
          bankID: 0,
          entryDate: '',
          balanceAmount: sfdaCollectedamount,
          transationNo: this.posTransRefNo ?? '',
          cardNo: this.CardNumber ?? '',
          tranDate: '',
          validTo: '',
          contact: '',
          remarks: '',
          orderint: 0,
          chequetype: 0,
          voucherID: 0,
          voucherName: '',
          cardHolder: '',
          edcMachine: this.EDCMachineID ?? '',
          currencyid: 0,
          currencyRate: 0,
          currencyAmount: 0,
          cashGiven: sfdaCollectedamount,
          changeRendered: sfdaRenderedChange,
        }
      ],
      "discounts": this.billSummarysfda.discounts === null ? [] : this.billSummarysfda.discounts,
      "billID": 0,
      "billNo": "",
      "visitNumber": "",
      "billDate": "",
      "visitID": 0,
      "visitTYpe": 0,
      "newVisitID": 0,
      "episodeID": 0,
      "depositAvailed": 0,
      "cashDiscount": 0,
      "empID": this.doctorDetails[0].EmpId,
      "parentBillID": 0,
      "agreementId": this.billSummarysfda.agreementId === '' ? -1 : this.billSummarysfda.agreementId

    }

    // nonSFDA.items.forEach((element:any, index: any) => {
    //   const actualitem = items.find((x:any) => x.itemID.toString() === element.itemId.toString());
    //   element.sequence = index +  1,
    //   element.remarks = "",
    //   element.sticker = "",
    //   element.frequencyRmkCode = "",
    //   element.frequencyrmk = "",
    //   element.frequencyRmk2l = "",
    //   element.batchID = element.batchID,
    //   element.packId = actualitem.packId,
    //   element.uoMID = actualitem.uoMID,      
    //   element.hospDeptId =  this.facilitySessionId, //this.hospdepdid,
    //   element.tax =  0,
    //   element.quantity =  actualitem.quantity,
    //   element.unitRate =  actualitem.unitRate,
    //   element.batchID =  actualitem.batchID,
    //   element.salesTax =  0,
    //   element.taxAmount =  0,
    //   element.orderItemID =  actualitem.orderItemID,
    //   element.prescriptionID =  actualitem.prescriptionID,
    //   element.status =  0,
    //   element.discountType =  0,
    //   element.discount =  0,
    //   element.issueQTY =  element.issueQTY,
    //   element.issueUOMID =  element.issueUOMID,
    //   element.drugOrderStatus =  0,
    //   element.remarks =  "",
    //   element.isbillable =  true,
    //   element.issubstitute =  element.issubstitute,
    //   element.sticker =  "",
    //   element.frequencyRmkCode =  "",
    //   element.frequencyrmk =  "",
    //   element.frequencyRmk2l =  "",
    //   element.unitRateExclDISC =  0

    // });

    // sfda.items.forEach((element:any, index: any) => {
    //   const actualitem = items.find((x:any) => x.itemID.toString() === element.itemId.toString());
    //   element.sequence = index +  1,
    //   element.remarks = "",
    //   element.sticker = "",
    //   element.frequencyRmkCode = "",
    //   element.frequencyrmk = "",
    //   element.frequencyRmk2l = "",
    //   element.batchID = element.batchID,
    //   element.packId = actualitem.packId,
    //   element.uoMID = actualitem.uoMID,      
    //   element.hospDeptId =  this.facilitySessionId, //this.hospdepdid,
    //   element.tax =  0,
    //   element.quantity =  actualitem.quantity,
    //   element.unitRate =  actualitem.unitRate,
    //   element.batchID =  actualitem.batchID,
    //   element.salesTax =  0,
    //   element.taxAmount =  0,
    //   element.orderItemID =  actualitem.orderItemID,
    //   element.prescriptionID =  actualitem.prescriptionID,
    //   element.status =  0,
    //   element.discountType =  0,
    //   element.discount =  0,
    //   element.issueQTY =  element.issueQTY,
    //   element.issueUOMID =  element.issueUOMID,
    //   element.drugOrderStatus =  0,
    //   element.remarks =  "",
    //   element.isbillable =  true,
    //   element.issubstitute =  element.issubstitute,
    //   element.sticker =  "",
    //   element.frequencyRmkCode =  "",
    //   element.frequencyrmk =  "",
    //   element.frequencyRmk2l =  "",
    //   element.unitRateExclDISC =  0
    // });

    var payload = {
      "mainBill": mainbill,
      "nonSFDABill": nonSFDA,
      "sfdaBill": sfda,
      "consumePosting": this.prepareConsumePostingData()
    }


    if (this.isCash) {
      const modalRef = this.modalService.open(ValidateEmployeeComponent, {
        backdrop: 'static'
      });
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.us.savecashissuebill(cashissue.saveoutpatientpharmacyissue, payload)
            .subscribe((response: any) => {
              if (response.status == "Success") {
                this.billNumber = response.billNumber;
                this.billSummarybtn = false;
                this.showBillSummary = false;
                this.loadSelectedPrescriptionDetails(this.selectedPrescription);
                this.SavePatientPrescriptionInjectionSchedules();
                $("#cashissueSaveMsg").modal('show');
              }
            },
              (err) => {

              })
        }
        modalRef.close();
      });
    }
    else {
      const modalRef = this.modalService.open(ValidateEmployeeComponent, {
        backdrop: 'static'
      });
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.us.savecashissuebill(cashissue.saveoppharmacycreditissue, payload)
            .subscribe((response: any) => {
              if (response.status == "Success") {
                this.billNumber = response.sfdaBillNumber;
                this.billSummarybtn = false;
                this.showBillSummary = false;
                this.loadSelectedPrescriptionDetails(this.selectedPrescription);
                this.SavePatientPrescriptionInjectionSchedules();
                $("#cashissueSaveMsg").modal('show');
              }
            },
              (err) => {

              })
        }
        modalRef.close();
      });
    }
  }

  onViewBillInfoClick() {
    this.viewBillInfo();
    $("#divViewBillInfo").modal('show');
  }

  onModeOfPaymentChange(event: any) {
    this.billSummaryform.patchValue({
      ModeofPayment: event.target.value
    })
  }

  onSelectmodeOfPayment(type: number) {
    this.billSummaryform.patchValue({
      ModeofPayment: type
    })
    if (type === 2) {
      const posPayment = {
        "userId": this.doctorDetails[0].UserId,
        "workstationId": this.facilitySessionId ?? this.service.param.WorkStationID,
        "workstationIP": this.userIPAddress,//sessionStorage.getItem("ipaddress"),
        "hospitalId": this.hospitalID,
        "amount": this.billSummaryform.get('ReceiptAmount')?.value
      }
      this.service.makeCardPayment(posPayment).subscribe({
        next: (response: any) => {
          if (response.id === 'Success') {

            this.posTransactionResult = response.status.paymentXml;
            this.posTransRefNo = response.status.approvalCode;
            this.EDCMachineID = response.status.edcMachineID;
            this.CardNumber = response.status.cardNumber;
            this.CardType = response.status.cardType;
            this.snackBar.open('✅ Payment successful', 'Close', {
              duration: 5000,
            });
            this.billSummaryform.patchValue({
              CollectedAmount: Number(posPayment.amount),
              ChangeToBeRendered: 0,
            });
            this.saveCashIssue();
          } else if (response.id === 'Fail') {

            this.posTransactionResult = response.madaTransactionResult;
            this.errorMessage = response.status.paymentReponse;
            $('#errorMsg').modal('show');
          }
        },
        complete: () => console.log('Completes with Success!'),
        error: (err) => {
        },
      });
    }
  }

  SavePatientPrescriptionInjectionSchedules() {

    var scheduleXml: any[] = [];
    this.patientPrescriptionsDetails.forEach((element: any, index: any) => {
      scheduleXml.push({
        "IID": element.ItemID,
        "ITM": element.ItemName,
        "DOSEID": element.DoseID,
        "DOSEUOM": element.DoseUoM,
        "FRQID": element.FrequencyID,
        "FRQ": element.Frequency,
        "DurationID": element.DurationId,
        "Duration": element.Duration,
        "SDT": moment(element.StartFrom).format('DD-MMM-YYYY'),
        "SDTT": element.ScheduleTime
      })
    });

    var payload =
    {
      "InjectionScheduleID": 0,
      "PatientID": this.selectedPatientId,
      "AdmissionID": this.selectedAdmissionId === '' ? 0 : this.selectedAdmissionId,
      "DoctorID": this.selectedDoctorId,
      "SpecialiseID": this.patientPrescriptionsList[0].SpecialiseID,
      "PrescriptionID": this.selectedPrescription.PrescriptionID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facilitySessionId ?? this.service.param.WorkStationID,
      "HospitalID": this.hospitalID,
      "ScheduleXML": scheduleXml
    }
    this.us.post(cashissue.SavePatientPrescriptionInjectionSchedules, payload)
      .subscribe((response: any) => {
        if (response.status == "Success") {

        }
      },
        (err) => {

        })
  }


  viewBillInfoOld() {
    var fromdate = this.viewBillInfoForm.get("FromDate")?.value;
    fromdate = moment(fromdate).format('DD-MMM-YYYY');
    var todate = this.viewBillInfoForm.get("ToDate")?.value;
    if (todate != null) {
      todate = moment(todate).format('DD-MMM-YYYY');

      this.service.fetchDrugPrescription = {
        ...this.service.fetchDrugPrescription,
        // Ssn: ssn,
        FromDate: fromdate,
        ToDate: todate,
        PatientID: "0",
        UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        WorkstationID: this.facilitySessionId ?? this.service.param.WorkStationID,
        HospitalID: this.hospitalID ?? this.service.param.HospitalID,

      };
      this.url = this.service.fetchData(cashissue.FetchViewBillInfo, this.service.fetchDrugPrescription);
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.FetchViewBillInfoDataList.length > 0) {
            this.viewPharmacyBills = this.viewPharmacyBills1 = response.FetchViewBillInfoDataList;
          }
          else {

          }
        },
          (err) => {

          })
    }
  }
  onEnterPressSSN(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.viewBillInfo();
    }
  }

  viewBillInfo() {
    var fromdate = this.viewBillInfoForm.get("FromDate")?.value;
    fromdate = moment(fromdate).format('DD-MMM-YYYY');
    var todate = this.viewBillInfoForm.get("ToDate")?.value;
    if (todate != null) {
      todate = moment(todate).format('DD-MMM-YYYY');

      this.service.fetchDrugViewPrescription = {
        ...this.service.fetchDrugViewPrescription,
        // Ssn: ssn,
        FromDate: fromdate,
        ToDate: todate,
        SSN: $("#viewBillSSN").val() == '' ? '0' : $("#viewBillSSN").val(),
        UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        WorkstationID: this.facilitySessionId ?? this.service.param.WorkStationID,
        HospitalID: this.hospitalID ?? this.service.param.HospitalID,

      };
      this.url = this.service.fetchData(cashissue.FetchViewBillInfoN, this.service.fetchDrugViewPrescription);
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.FetchViewBillInfoDataList.length > 0) {
            this.viewPharmacyBills = this.viewPharmacyBills1 = response.FetchViewBillInfoDataList;
          }
          else {

          }
        },
          (err) => {

          })
    }
  }

  clearBillInfo() {
    this.viewPharmacyBills = this.viewPharmacyBills1 = [];
    $("#viewBillSSN").val('');
  }

  billPrint() {
    //PrintOPPharmacyBill
    let param = {
      salesNo: this.selectedPrescription.BillNo,// this.billNumber,
      userId: this.doctorDetails[0].UserId,
      WorkStationID: 0,
      hospitalId: this.hospitalID
    }
    this.url = this.service.fetchData(cashissue.PrintOPPharmacyBill, param);
    this.us.get(this.url)
      .subscribe((response: any) => {
        //if (response.Code == 200) {
        this.trustedUrl = response?.Message;
        $("#opPharmacyBillPrint").modal('show');
        //}
        //else {

        //}
      },
        (err) => {

        })
    // const currentBillId = this.billId;
    // this.us.printOPBill(
    //   currentBillId,
    //   Number(this.hospitalID)
    // )
    //   .subscribe({
    //     next: (response: ArrayBuffer) => {
    //       this.printPdf(response);
    //     },
    //     error: (err) => {
    //     },
    //   });
  }

  printPdf(pdfContent: ArrayBuffer) {
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Open a new window/tab and display the PDF
    const newWindow: any = window.open(url);

    // Wait for the PDF to load and then trigger the print
    newWindow.onload = () => {
      newWindow.print();
    };
  }
  fetchDiagnosis() {
    if (this.selectedAdmissionId != '') {
      this.url = this.service.fetchData(cashissue.FetchAdviceDiagnosis, {
        Admissionid: this.selectedAdmissionId,
        HospitalID: this.hospitalID
      });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
            this.patientDiagnosis = response.PatientDiagnosisDataList;
            this.diagStr = this.patientDiagnosis?.map((item: any) => item.Code + "-" + item.DiseaseName).join(',   ');
          }
        },
          (err) => {
          })
    }
  }

  getHight() {
    this.presconfig.getPatientHight(this.individualProcess.PatientID).subscribe(res => {
      this.patientHigh = res;
      this.smartDataList = this.patientHigh.SmartDataList;
      $("#bmiChart").modal('show');
      this.createHWChartLine();
    })
  }

  private createHWChartLine(): void {
    let data: any = {};

    const heightData: any[] = [];
    const weigthData: any[] = [];
    const BMIData: any[] = [];

    this.smartDataList.forEach((element: any, index: any) => {
      heightData.push([element.Createdate, parseFloat(element.Height)])
      weigthData.push([element.Createdate, parseFloat(element.Weight)])
      BMIData.push([element.Createdate, parseFloat(element.BMI)])
    });

    data = [{ name: 'Height', data: heightData }, { name: 'Weight', data: weigthData }];

    const chart = Highcharts.chart('chart-hw-line', {
      chart: {
        type: 'spline',
        zoomType: 'x'
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        min: 0,
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category',
        min: 0,
        max: 9
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
        valueDecimals: 1,
        crosshairs: [{
          width: 1,
          color: 'Gray'
        }, {
          width: 1,
          color: 'gray'
        }]
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0.5
        }
      },
      series: data,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
      }
    } as any);

  }

  navigateToResults() {
    sessionStorage.setItem("FromCaseSheet", "false");
    sessionStorage.setItem("selectedView", JSON.stringify(this.patientDetails));
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.patientDetails));
    this.showResultsinPopUp = true;
    $("#viewResults").modal("show");
  }

  viewApprovals() {
    if (this.selectedPrescription) {
      var visitid = this.selectedPrescription.IPID;
      this.presconfig.FetchApprovalRequestAdv(visitid, this.doctorDetails[0].UserId, '3591', this.hospitalID)
        .subscribe((response: any) => {
          $('#viewApprovalsModal').modal('show');
          if (response.ApprovalRequestsDataList.length > 0) {
            this.aprrovalRequests = response.ApprovalRequestsDataList;
            this.aprrovalRequestDetails = response.ApprovalRequestDetailsDataList.filter((x: any) => x.ServiceID === '10');
            this.aprrovalRequestDetails.forEach((element: any) => {
              if (element.ClaimStatusID == '0') {
                element.class = "status red";
              }
              else if (element.ClaimStatusID == '') {
                element.class = "status green";
              }
              else if (element.ClaimStatusID == '') {
                element.class = "status green";
              }
              else if (element.ClaimStatusID == '') {
                element.class = "status green";
              }
            });
          }

        },
          (err) => {
          })
    }
    else {
      this.errorMessage = "Please select prescription";
      $('#errorMsg').modal('show');
      return;
    }
  }

  isDateWithinNext3Months(givenDate: any): boolean {
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    return new Date(givenDate) <= threeMonthsFromNow;
  }

  selectBill(pres: any) {
    this.selectedBillToLoad = pres;
    this.viewPharmacyBills.forEach((element: any, index: any) => {
      if (element.SalesID === pres.SalesID) {
        element.selected = true;
        this.loadSelectedbill(element);
      }
      else {
        element.selected = false;
      }
    });
  }

  loadSelectedbill(bill: any) {
    let param = {
      SalesSlno: bill.OrderSlNo,
      UserId: this.doctorDetails[0].UserId,
      WorkstationId: 0,
      HospitalID: this.hospitalID
    }
    this.url = this.service.fetchData(cashissue.FetchPatientCashIssues, param);
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.billCashIssues = response;
        }
        else {

        }
      },
        (err) => {

        })
  }

  billPrintinView(billno: any) {
    let param = {
      salesNo: billno,// this.billNumber,
      userId: this.doctorDetails[0].UserId,
      WorkStationID: 0,
      hospitalId: this.hospitalID
    }
    this.url = this.service.fetchData(cashissue.PrintOPPharmacyBill, param);
    this.us.get(this.url)
      .subscribe((response: any) => {
        this.trustedUrl = response?.Message;
        $("#opPharmacyBillPrint").modal('show');
      },
        (err) => {

        })
  }


  onBillConversionClick() {
    const doctorDetails = this.removeFalseValues(this.doctorDetails[0]);
    const locationName = sessionStorage.getItem('locationName');
    const language = sessionStorage.getItem('lang');
    const facility = JSON.parse(sessionStorage.getItem('facility') || '{}');
    const facilityId = facility.FacilityID;
    const facilityName = facility.FacilityName;
    const rcmToken = sessionStorage.getItem('rcmToken');
    window.open(`${config.rcmuiurl}bill-conversion?doctordetails=${encodeURIComponent(JSON.stringify(doctorDetails))}&location=${this.hospitalID}&locationname=${locationName}&language=${language}&facilityid=${facilityId}&facilityname=${facilityName}&token=${rcmToken}`, '_blank');
  }

  removeFalseValues(obj: any) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key, value]) => Boolean(value))
    );
  }

  getCollectableInfo() {
    const url = this.us.getApiUrl(cashissue.collectabledetails, {
      admissionId: this.selectedPrescription.IPID,
      loaId: this.patientPrescriptionCompanyDetails.LOAID === '' ? 0 : this.patientPrescriptionCompanyDetails.LOAID,
      companyId: this.patientPrescriptionCompanyDetails.CompanyID === '' ? 0 : this.patientPrescriptionCompanyDetails.CompanyID,
      gradeId: this.patientPrescriptionCompanyDetails.GradeID === '' ? 0 : this.patientPrescriptionCompanyDetails.GradeID,
      specId: this.selectedPrescription.SpecialiseID,
      isPharmacy: 1,
      userId: this.doctorDetails[0].UserId,
      workstationId: this.facilitySessionId,
      hospitalId: this.hospitalID
    });
    this.us.getfullurl(url)
      .subscribe((response: any) => {
        if (response.status == "Success") {
          this.collectableInfo = response.data;
          this.collectableInfo.opPharmacyCollectedAmount = Number(this.collectableInfo.genericCollectedAmount) + Number(this.collectableInfo.brandCollectedAmount);
        }
      },
        (err) => {

        })
  }

  openCollectionReport() {
    $('#displayCollectionReport').modal('show');

    var fromDate = this.datepipe.transform(this.collectionReportForm.value['FromDate'], 'dd-MMM-yyyy')?.toString();
    var toDate = this.datepipe.transform(this.collectionReportForm.value['ToDate'], 'dd-MMM-yyyy')?.toString();

    const url = this.service.fetchData(cashissue.UserWiseDailyCollection, {
      fromDate: this.datepipe.transform(this.collectionReportForm.value['FromDate'], 'dd-MMM-yyyy')?.toString(),
      toDate: this.datepipe.transform(this.collectionReportForm.value['ToDate'], 'dd-MMM-yyyy')?.toString(),
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

  closedailyCollReportModal() {
    $('#displayCollectionReport').modal('hide');
  }

  printDailyCollectionReport() {
    $('#dailyCollectionReportPrint').modal('show');
  }


  selectAllPrescription() {
    this.selectall = !this.selectall;

    this.patientPrescriptionsDetails.forEach((item: any) => {
      item.selectedPrescription = this.selectall;
    });
  }

  anySelectedPrescriptions(): boolean {
    return this.patientPrescriptionsDetails?.some((item: any) => item.selectedPrescription);
  }

  onViewRxSSNSearch(event: any) {
    $("#divViewRx").modal('show');
    const ssn = event.target.value;
    if (ssn === '') {
      //this.viewRxPrescriptions = this.viewRxPrescriptions1;
    }
    else {
      //this.viewRxPrescriptions = this.viewRxPrescriptions1.filter((x: any) => x.SSN.toString().includes(ssn));
      this.GetViewRx(ssn);

    }
  }

  getPresOrderCount(orderStatus: any) {
    if (this.viewRxPrescriptions1.length > 0) {
      return this.viewRxPrescriptions1?.filter((x: any) => x.OrderStatus == orderStatus).length;
    }
    else {
      return 0;
    }
  }

  filterViewRxPresOrders(orderStatus: any) {
    this.viewRxPrescriptions = this.viewRxPrescriptions1?.filter((x: any) => x.OrderStatus == orderStatus);
  }

  onViewBillsSSNSearch(event: any) {
    const ssn = event.target.value;
    if (ssn === '') {
      this.viewPharmacyBills = this.viewPharmacyBills1;
    }
    else {
      this.viewPharmacyBills = this.viewPharmacyBills1.filter((x: any) => x.SSN.toString().includes(ssn));
    }
  }

  enableSplitPay() {
    this.splitPay = !this.splitPay;
    // Reset fields when splitPay is disabled
    if (!this.splitPay) {
      this.billSummaryform.patchValue({
        cashCollectedAmount: '0',
        cardCollectedAmount: '0',
        CollectedAmount: '',
      });
    }

    // Enable/Disable fields based on splitPay
    ['CollectedAmount', 'cardCollectedAmount'].forEach((field) => {
      this.splitPay
        ? this.billSummaryform.get(field)!.disable()
        : this.billSummaryform.get(field)!.enable();
    });
  }

  splitPayCashCollected(event: any) {
    const cashCollected = this.billSummaryform.get('cashCollectedAmount')?.value;
    const collectedAmountVal = Number(cashCollected) || 0;
    const collectableAmountVal = Number(this.billSummaryform.get('ReceiptAmount')?.value);
    const cardAmount = collectableAmountVal - cashCollected || 0;
    this.billSummaryform.get('cardCollectedAmount')?.setValue(cardAmount >= 0 ? cardAmount.toFixed(2) : '0');

    const totalAmountCollected = Number(cardAmount) + Number(cashCollected);
    this.billSummaryform.get('CollectedAmount')?.setValue(totalAmountCollected);
    //this.calculateChangeRendered();
    const billAmount = this.billSummaryform.get('ReceiptAmount')?.value;
    const collectedAmount = this.billSummaryform.get('CollectedAmount')?.value;

    if (Number.parseFloat(billAmount) > Number.parseFloat(collectedAmount)) {
      this.errorMessage = "Collected Amount : " + collectedAmount + " Should not be Less than Receipt Amount :" + billAmount;
      this.billSummaryform.patchValue({
        CollectedAmount: '',
        ChangeToBeRendered: ''
      })
      $("#errorMsg").modal("show");
      return;
    }
    const changetoberendered = Number.parseFloat(collectedAmount) - Number.parseFloat(billAmount);
    this.billSummaryform.patchValue({
      ChangeToBeRendered: Number.parseFloat(changetoberendered.toString()).toFixed(2),
    });
  }
  initiateCardPayment() {
    const posPayment = {
      "userId": this.doctorDetails[0].UserId,
      "workstationId": this.facilitySessionId ?? this.service.param.WorkStationID,
      "workstationIP": this.userIPAddress,//sessionStorage.getItem("ipaddress"),
      "hospitalId": this.hospitalID,
      "amount": this.billSummaryform.get('cardCollectedAmount')?.value
    }
    this.service.makeCardPayment(posPayment).subscribe({
      next: (response: any) => {
        if (response.id === 'Success') {
          this.posTransactionResult = response.status.paymentXml;
          this.posTransRefNo = response.status.approvalCode;
          this.EDCMachineID = response.status.edcMachineID;
          this.CardNumber = response.status.cardNumber;
          this.CardType = response.status.cardType;
        } else if (response.id === 'Fail') {

          this.posTransactionResult = response.madaTransactionResult;
          this.errorMessage = response.status.paymentReponse;
          $('#errorMsg').modal('show');
        }
      },
      complete: () => console.log('Completes with Success!'),
      error: (err: any) => {
        // this.clear();
      },
    });
  }

  cardTypes: any = [
    { id: 1, value: 'VISA CREDIT' },
    { id: 2, value: 'MASTERCARD' },
    { id: 3, value: 'SPAN' },
    { id: 4, value: 'MADA' },
    { id: 5, value: 'MAESTRO' },
    { id: 6, value: 'GCCNET' },
    { id: 7, value: 'UNIONPAY' },
    { id: 8, value: 'AMEX' },
    { id: 9, value: 'AMERICAN EXPRESS' },
    { id: 10, value: 'VISA' },
    { id: 11, value: 'VISA PREPAID' },
    { id: 12, value: 'VISA DEBIT' }
  ];

  getCardType() {
    if (!this.posTransactionResult) {
      return 4;
    } else {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(this.posTransactionResult, 'text/xml');
        const cardSchemeElement = xmlDoc.querySelector('CardScheme');
        let cardType = 4; // Default Value
        if (cardSchemeElement) {
          const englishCardScheme = cardSchemeElement.getAttribute('English');
          if (englishCardScheme) {
            const selectedCard = this.cardTypes.find((element: any) => element.value === englishCardScheme.toUpperCase());
            if (selectedCard) {
              cardType = selectedCard.id;
            }
          }
        }
        return cardType;
      } catch (e: any) {
        return 4;
      }
    }
  }

  openPatientSummary(event: any) {
    event.stopPropagation();
    if (this.patientDetails === undefined || this.patientDetails.length === 0) {
      // this.errorMessage = "Please select any prescription";
      // $("#errorMsg").modal("show");
      // return;
      const options: NgbModalOptions = {
        windowClass: 'vte_view_modal'
      };
      const modalRef = this.modalSvc.openModal(PatientfoldermlComponent, { readonly: true }, options);

    }
    else {
      this.patientDetails.AdmissionID = this.selectedPrescription?.IPID;
      sessionStorage.setItem("PatientDetails", JSON.stringify(this.patientDetails));
      sessionStorage.setItem("selectedView", JSON.stringify(this.patientDetails));
      sessionStorage.setItem("selectedPatientAdmissionId", this.selectedPrescription?.IPID);
      sessionStorage.setItem("PatientID", this.patientDetails.PatientID);
      sessionStorage.setItem("SummaryfromCasesheet", "true");
      sessionStorage.setItem("fromOtDashboard", "true");

      const options: NgbModalOptions = {
        windowClass: 'vte_view_modal',
        size: 'xl'
      };
      const modalRef = this.modalSvc.openModal(PatientfoldermlComponent, {
        data: this.patientDetails,
        readonly: true,
        selectedView: this.selectedView
      }, options);
    }
  }

  navigateBacktoNotBilledOrders() {
    if (this.fromNotBilledOrders) {
      this.router.navigate(['/pharmacy/not-billed-orders']);
    }
  }

  prescPrint() {
    const url = this.service.fetchData(cashissue.FetchOPPharmacyPrescriptionPrint, {
      patientId: this.selectedPrescription.PatientID,
      admissionId: this.selectedPrescription.IPID,
      patientType: this.selectedPrescription.PatientType,
      prescriptionId: this.selectedPrescription.PrescriptionID,
      userId: this.doctorDetails[0].UserId,
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID,
    });

    this.us.get(url)
      .subscribe((response: any) => {
        // if (response.Code == 200) {
        this.trustedUrl = response?.Message
        this.showModal();
        // }
      },
        (err) => {
        })
  }

  isOneMonthBeforePrescription(date1: Date, d2: Date): boolean {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const expected = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());

    // Subtract 1 month from date2
    expected.setMonth(expected.getMonth() - 1);

    // Handle overflow (e.g. March 31 -> Feb 28/29)
    if (expected.getDate() !== d2.getDate()) {
      expected.setDate(0); // set to last day of previous month
    }

    return d1.getTime() < expected.getTime();
  }

  fetchCompanyCardCollectable() {
    const url = this.us.getApiUrl(cashissue.collectabledetails, {
      companyId: this.patientPrescriptionCompanyDetails.CompanyID,
      gradeId: this.patientPrescriptionCompanyDetails.GradeID,
      specialityId: -1,
      hospitalId: this.hospitalID
    });
    this.us.getfullurl(url)
      .subscribe((response: any) => {
        if (response.status == "Success") {
          this.isCardCollectable = response.cardCollectable;
        }
      },
        (err) => {

        })
  }



parseGS1(barcode: string) {
  // NETUM sends "*" instead of FNC1 → remove it
  barcode = barcode.replace(/\*/g, "");

  const result: any = {
    gtin: "",
    expiryDate: "",
    batchNumber: "",
    serialNumber: ""
  };

  let i = 0;

  while (i < barcode.length) {
    const ai = barcode.substring(i, i + 2);

    switch (ai) {
      case "01": {
        result.gtin = barcode.substring(i + 2, i + 2 + 14);
        i += 2 + 14;
        break;
      }

      case "17": {
        result.expiryDate = barcode.substring(i + 2, i + 2 + 6);
        i += 2 + 6;
        break;
      }

      case "10": {  // variable length
        i += 2;
        let start = i;

        // scan until next AI (01/17/21)
        while (
          i < barcode.length &&
          !["01", "17", "21"].includes(barcode.substring(i, i + 2))
        ) {
          i++;
        }

        result.batchNumber = barcode.substring(start, i);
        break;
      }

      case "21": {  // variable length
        i += 2;
        let start = i;

        // serial goes until end
        while (i < barcode.length) i++;

        result.serialNumber = barcode.substring(start, i);
        break;
      }

      default:
        // Skip any unsupported number to avoid mis-parsing
        i++;
        break;
    }
  }
  result.expiryDate = this.formatExpiry(result.expiryDate);

  return result;
}

formatExpiry(yyMMdd: string): string {
  if (!yyMMdd || yyMMdd.length !== 6) return yyMMdd;

  const yy = yyMMdd.substring(0, 2);
  const mm = yyMMdd.substring(2, 4);
  const dd = yyMMdd.substring(4, 6);

  // GS1 rule → years 00–49 => 2000–2049, 50–99 => 1950–1999
  const yearNum = parseInt(yy, 10);
  const fullYear = yearNum <= 49 ? 2000 + yearNum : 1900 + yearNum;

  return `${fullYear}-${mm}-${dd}`;
}



  // onBarcodeScanned(event: any, item: any, index: number) {
  //   // Scanner usually ends with Enter
  //   if (event.key === 'Enter') {
  //     const scannedValue = item.Barcode;
  //     item.barcodeDetails = this.parseGS1(scannedValue.trim());
  //     setTimeout(() => {
  //     this.barcodeInputs.toArray()[index + 1]?.nativeElement.focus();
  //   });
  //   }

  // }

  onBarcodeScanned(item: any, index: number) {
    const scannedValue = item.Barcode?.trim();
    if (!scannedValue) return;

    //item.barcodeDetails = this.parseGS1(scannedValue);
    const parsed  = this.parseGS1(scannedValue);

  // Prevent duplicate entries
  const exists = item.barcodeDetails.some((x: any) => x.gtin === parsed.gtin && x.serialNumber === parsed.serialNumber
  );

  if (exists) {
    // Optional: play beep, flash warning UI, etc.
    alert("Duplicate barcode scanned!");
    // this.scanInput.nativeElement.value = "";
    // this.focusInput();
    return;
  }
  if (!exists) {
    item.barcodeDetails.push(parsed);
  }

  const textarea = this.barcodeInputs.toArray()[index]?.nativeElement;
  textarea.value += "\n";
  
    // setTimeout(() => {
    //   this.barcodeInputs.toArray()[index + 1]?.nativeElement.focus();
    // });
  }

  scanTimers: any[] = [];

  onBarcodeInput(item: any, index: number) {
    clearTimeout(this.scanTimers[index]);

    this.scanTimers[index] = setTimeout(() => {
      const scannedValue = item.Barcode?.trim();

      if (!scannedValue) return;

      // Optional: minimum length check
      if (scannedValue.length < 6) return;

      //item.barcodeDetails = this.parseGS1(scannedValue);
    const parsed  = this.parseGS1(scannedValue);

    // Prevent duplicate entries
    
      const exists = item.barcodeDetails?.find((x: any) => x.gtin === parsed.gtin && x.serialNumber === parsed.serialNumber);
    

    if (exists) {
      // Optional: play beep, flash warning UI, etc.
      alert("Duplicate barcode scanned!");
      // this.scanInput.nativeElement.value = "";
      // this.focusInput();
      return;
    }
    if (!exists) {
      item.barcodeDetails = parsed;
    }

    const textarea = this.barcodeInputs.toArray()[index]?.nativeElement;
    textarea.value += "\n";

      // Move focus to next input
      // setTimeout(() => {
      //   this.barcodeInputs.toArray()[index + 1]?.nativeElement.focus();
      // });
    }, 50); // scanner finishes within 30–50ms
  }

  
scannedItems: any[] = [];

handleScan(textarea: HTMLTextAreaElement) {
  // Get full text
  const allText = textarea.value.trim();

  // Extract last scanned line
  const lines = allText.split(/\r?\n/);
  const raw = lines[lines.length - 1].trim();

  if (!raw) return;

  // Parse barcode
  const parsed = this.parseGS1(raw);

  // Duplicate check (GTIN + SERIAL)
  const duplicate = this.scannedItems.some(
    x => x.gtin === parsed.gtin && x.serialNumber === parsed.serialNumber
  );

  if (duplicate) {
    console.warn("Duplicate barcode:", raw);
  } else {
    this.scannedItems.push(parsed);
  }

  // Add new empty line for next scan
  //textarea.value += "\n";

  // Focus & move cursor to last position
  setTimeout(() => {
    textarea.focus();
    const len = textarea.value.length;
    textarea.setSelectionRange(len, len);
  }, 10);
}




  openScanBarcodesModal() {
    setTimeout(() => {
      this.barcodeInputs.first?.nativeElement.focus();
    });
    $('#scanBarcodesModal').modal('show');
  }

  prepareConsumePostingData() {
    const barcodesItems: any[] = [];
    this.scannedItems.forEach((element: any) => {  
        //if(element.Barcode != null && element.Barcode != undefined && element.Barcode != '') {    
        barcodesItems.push({
          "gtin": element.gtin,
          "xd": element.expiryDate,
          "bn": element.batchNumber,
          "sn": element.serialNumber,
          "mfg": "",
          "qty": element.Qty,
          "rc": "",
          "notificationID": "",
          "prescriptionid": this.selectedPrescription.PrescriptionID,
          "prescriptiondate": this.selectedPrescription.OrderDate
        });
      //}
    });
    var consumePosting = {
      "refNo": this.selectedPrescription.ORDERSLNO,
      "transactionType": "Consume",
      "gln": this.hospitalID == '3' ? "6286402000013" : "6286352000026",
      "tO_GLN": "9999999999999",
      barcodes: barcodesItems
    }
    return barcodesItems.length > 0 ? consumePosting : {};
  }

  clearBarcodeInput(index: number, item: any) {
    item.Barcode = '';
    item.barcodeDetails = [];
    setTimeout(() => {
      this.barcodeInputs.toArray()[index]?.nativeElement.focus();
    });
  }

  clearBarcodeDetails() {
    this.patientPrescriptionsDetails.forEach((element: any) => {
      element.barcodeDetails = [];
      element.Barcode = '';
    });
  }

  checkAllDrugBarcodesScanned() {
    //return this.patientPrescriptionsDetails?.filter((x: any) => Number(x.Qty) > 0 && (x.HoldStatus === '' || x.HoldStatus === '0') && (x.Barcode == '' || x.Barcode == null || x.Barcode == undefined)).length > 0;
    return this.scannedItems.length == 0;
  }

  filterSFDADrugs() {
    if(this.patientPrescriptionsDetails && this.patientPrescriptionsDetails?.length > 0)
      return this.patientPrescriptionsDetails?.filter((x: any) => x.IsSFDAApproved?.toString().toLowerCase() == 'true');
    else 
      return [];
  }

}



export const cashissue = {
  fetchDrugPrescriptionAdv: 'FetchDrugPrescriptionAdv?SSN=${Ssn}&OrderDate=${OrderDate}&PatientID=${PatientID}&UserID=${UserID}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
  fetchCashIssuePatientOrderedOrPrescribedDrugs: 'FetchCashIssuePatientOrderedOrPrescribedDrugs?PatientId=${PatientId}&AdmissionId=${AdmissionId}&MonitorId=${MonitorId}&PrescriptionId=${PrescriptionId}&UserID=${UserID}&WorkstationID=${WorkstationID}&HospitalId=${HospitalID}',
  fetchCounterMaster: 'FetchGlobalMaster?Type=${Type}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchCashIssuePatientOrderedOrPrescribedDrugsN: 'FetchCashIssuePatientOrderedOrPrescribedDrugsN?PatientId=${PatientId}&AdmissionId=${AdmissionId}&DoctorID=${DoctorID}&SpecialiseID=${SpecialiseID}&MonitorId=${MonitorId}&PrescriptionId=${PrescriptionId}&rblIssueMode=0&UserID=${UserID}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
  substitute: 'FetchSubstituteItemsIP?ItemID=${ItemID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  holdpresitem: 'holdPrescriptionItems',
  FetchCashIssueSubstituteItem: 'FetchCashIssueSubstituteItem',
  FetchCashIssueItemUOMChange: 'FetchCashIssueItemUOMChange',
  FetchCashIssueSubstituteItemUOMChange: 'FetchCashIssueSubstituteItemUOMChange',
  fetchSSItems: 'FetchOTCPharmacyItems?Name=${Name}&userId=${userId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchCashIssuePatientInfoN: 'FetchCashIssuePatientInfoN?PatientId=${PatientId}&rblIssueMode=${rblIssueMode}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchSpecializationDoctorC: 'FetchSpecializationDoctorC?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchCashIssueItemSelection: 'FetchCashIssueItemSelection?ItemID=${ItemID}&rblIssueMode=${rblIssueMode}&DoctorCode=${DoctorCode}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchDrugPrescriptionH: 'FetchDrugPrescriptionH?FromDate=${FromDate}&ToDate=${ToDate}&PatientID=${PatientID}&UserID=${UserID}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
  FetchDrugPrescriptionHN: 'FetchDrugPrescriptionHN?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&UserID=${UserID}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',

  FetchPrescriptionRxPrint: 'FetchPrescriptionRxPrint?PatientID=${PatientID}&IPID=${IPID}&MonitorID=${MonitorID}&DoctorID=${DoctorID}&PrescriptionID=${PrescriptionID}&UserId=${UserId}&UserName=${UserName}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  calculatepharmacybill: `${config.rcmapiurl}` + 'OPBilling/calculatepharmacybill',
  saveoutpatientpharmacyissue: `${config.rcmapiurl}` + 'OPBilling/saveoutpatientpharmacyissue',
  saveoppharmacycreditissue: `${config.rcmapiurl}` + 'OPBilling/saveoppharmacycreditissue',
  // calculatepharmacybill: 'https://token.alhammadi.com/RCMAHHAPI/OPBilling/calculatepharmacybill',
  // saveoutpatientpharmacyissue: 'https://token.alhammadi.com/RCMAHHAPI/OPBilling/saveoutpatientpharmacyissue',
  // saveoppharmacycreditissue: 'https://token.alhammadi.com/RCMAHHAPI/OPBilling/saveoppharmacycreditissue',
  CashIssueDiscountCal: 'CashIssueDiscountCal',
  FetchCheckOrderStatus: 'FetchCheckOrderStatus',
  FetchItemStickerPrint: 'FetchItemStickerPrint?PatientID=${PatientID}&PrescriptionID=${PrescriptionID}&WardID=${WorkStationID}&UserID=${UserID}&UserName=${UserName}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchRxStickerPrint: 'FetchRxStickerPrint?PatientID=${PatientID}&IPID=${IPID}&ItemIDS=${ItemIDS}&PrescriptionTokenNumber=${PrescriptionTokenNumber}&PrescriptionID=${PrescriptionID}&UserId=${UserId}&UserName=${UserName}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchViewBillInfo: 'FetchViewBillInfo?FromDate=${FromDate}&ToDate=${ToDate}&PatientID=${PatientID}&UserID=${UserID}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
  FetchAdviceDiagnosis: 'FetchAdviceDiagnosis?TBL=1&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  SavePatientPrescriptionInjectionSchedules: 'SavePatientPrescriptionInjectionSchedules',
  FetchPrescriptionsPerTray: 'FetchPrescriptionsPerTray?TokenNumber=${TokenNumber}&CounterNoValue=${CounterNoValue}&CounterNo=${CounterNo}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  PrintOPPharmacyBill: 'PrintOPPharmacyBill?salesNo=${salesNo}&userId=${userId}&WorkStationID=${WorkStationID}&hospitalId=${hospitalId}',
  FetchPatientCashIssues: 'FetchPatientCashIssues?SalesSlno=${SalesSlno}&UserId=${UserId}&WorkstationId=${WorkstationId}&HospitalID=${HospitalID}',
  //https://localhost:7069/OPBilling/collectabledetails?admissionId=1&loaId=1&companyId=1&gradeId=1&specId=1&isPharmacy=1&userId=1&workstationId=1&hospitalId=1
  //calculatepharmacybill: `${config.rcmapiurl}` + 'OPBilling/calculatepharmacybill',
  collectabledetails: `${config.rcmapiurl}` + 'OPBilling/collectabledetails?admissionId=${admissionId}&loaId=${loaId}&companyId=${companyId}&gradeId=${gradeId}&specId=${specId}&isPharmacy=${isPharmacy}&userId=${userId}&workstationId=${workstationId}&hospitalId=${hospitalId}',
  UserWiseDailyCollection: 'UserWiseDailyCollection?fromDate=${fromDate}&toDate=${toDate}&userName=${userName}&hospitalId=${hospitalId}',
  FetchViewBillInfoN: 'FetchViewBillInfoN?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&UserID=${UserID}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
  FetchOPPharmacyPrescriptionPrint: 'FetchOPPharmacyPrescriptionPrint?patientId=${patientId}&admissionId=${admissionId}&patientType=${patientType}&prescriptionId=${prescriptionId}&userId=${userId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  cardcollectable: `${config.rcmapiurl}` + 'OPBilling/cardcollectable?companyId=${companyId}&gradeId=${gradeId}&specialityId=${specialityId}&hospitalId=${hospitalId}',
};