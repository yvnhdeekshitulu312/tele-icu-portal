import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ConfigService } from '../services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { FormBuilder } from '@angular/forms';
import { ConfigService as PresConfig } from 'src/app/services/config.service';
import * as Highcharts from 'highcharts';
import { Router } from '@angular/router';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientfoldermlComponent } from 'src/app/shared/patientfolderml/patientfolderml.component';
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
  selector: 'app-bulkprocessing',
  templateUrl: './bulkprocessing.component.html',
  styleUrls: ['./bulkprocessing.component.scss'],
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
export class BulkprocessingComponent extends BaseComponent implements OnInit {
  type = 'collapse';
  viewType = 'collapse';
  bulkMedicationIssueList: any;
  filteredbulkMedicationIssueList: any;
  listOfWards: any;
  facilityId: any;
  selectedWardID: string = "";
  cuttoffTime: string = "";
  selectedViewWardID: string = "";
  ProcessDate: any;
  bulkprocessDate: string = moment(new Date()).format('DD-MMM-YYYY');
  errorMessages: any = [];
  viewbulkMedicationIssueList: any;
  filteredviewbulkMedicationIssueList: any;
  showViewBulkProcessingdiv: boolean = false;
  viewBulkProcForm: any;
  bulkProcessingForm: any;
  pinfo: any;
  collapseAllClass: string = "btn selected";
  expandAllClass: string = "btn";
  showNoRecFound: boolean = true;
  substituteItems: any;
  showFavMedSelectedValidation: boolean = false;
  trustedUrl: any;
  showResultsinPopUp = false;
  patientHigh: any;
  smartDataList: any;
  medType: string = "normal";
  showMedTypetoggle: boolean = false;
  barcodeprint = false;
  discontinuedItems: any = [];

  constructor(private config: ConfigService, private fb: FormBuilder, public datepipe: DatePipe, private presconfig: PresConfig, private router: Router, private modalService: GenericModalBuilder, private modalSvc: NgbModal) {
    super()
    this.facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
    this.viewBulkProcForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
      SSN: [''],
      WardId: ['']
    });

    this.bulkProcessingForm = this.fb.group({
      ProcessDate: [''],
      WardId: ['']
    });
  }

  ngOnInit(): void {
    this.ProcessDate = moment(new Date()).format('DD-MMM-YYYY');
    var d = new Date();
    this.viewBulkProcForm.patchValue({
      FromDate: d,
      ToDate: d
    })
    var d = new Date();
    this.bulkProcessingForm.patchValue({
      ProcessDate: d
    })
  }


  searchWard(event: any) {
    var filter = event.target.value;
    if (filter.length >= 3) {

      this.config.FetchSSWards(filter, this.hospitalID)
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
    this.selectedWardID = ward.ID;
    this.FetchBulkMedicationIssue(ward);
    this.listOfWards = [];
  }

  onViewItemSelected(ward: any) {
    this.selectedViewWardID = ward.ID;
    var fromdate = this.datepipe.transform(this.viewBulkProcForm.get('FromDate').value, "dd-MMM-yyyy")?.toString();
    var todate = this.datepipe.transform(this.viewBulkProcForm.get('ToDate').value, "dd-MMM-yyyy")?.toString();
    this.FetchViewBulkProcessingData(ward.ID, fromdate, todate, 'null');
    this.listOfWards = [];
  }

  onProcessDateChange(event: any) {
    // this.errorMessages = [];
    // let selectedDate = this.bulkProcessingForm.value['ProcessDate'];
    // let currentdate = new Date();
    // if (selectedDate <= currentdate) {
    //   if (this.selectedWardID != "") {
    //     this.FetchBulkMedicationIssue(this.selectedWardID);
    //   }
    // }
    // else {
    //   this.errorMessages.push("Process Date cannot be future date");
    //   $("#errorMessageModal").modal("show");
    //   var d = new Date();
    //   this.bulkProcessingForm.patchValue({
    //     ProcessDate: d
    //   })
    // }
    this.FetchBulkMedicationIssue(this.selectedWardID);
  }

  onQtyChange(event: any, item: any) {
    var qty = event.target.value;
    this.errorMessages = [];
    item.changedQty = qty;
    // if (Number(qty) > item.Qty) {
    //   this.errorMessages.push("Quantity cannot be greater than Prescribed Quantity");
    //   $("#errorMessageModal").modal("show");
    //   $("#" + item.PatientID + '-' + item.Itemid).val(item.Qty);
    // }
    // else {
    //   item.changedQty = qty;
    // }
  }

  FetchBulkMedicationIssue(WardD: any) {
    if (this.ProcessDate != undefined) {
      var processDate = moment(this.bulkProcessingForm.get('ProcessDate').value).format('DD-MMM-YYYY');//moment(this.ProcessDate).format('DD-MMM-YYYY');
      this.config.FetchBulkMedicationIssue(processDate, this.selectedWardID, this.doctorDetails[0].UserId, this.hospitalID, this.facilityId)
        .subscribe((response: any) => {
          this.bulkMedicationIssueList = response.FetchBulkMedicationIssueDataList;
          this.showMedTypetoggle = true;
          if (response.FetchBulkMedicationIssueDataList.length > 0)
            this.cuttoffTime = response.FetchBulkMedicationIssueDataList[0].CutoffTime;
          if (this.bulkMedicationIssueList.length > 0) {
            this.showNoRecFound = false;
          }
          this.bulkMedicationIssueList.forEach((element: any, index: any) => {
            element.ItemSelected = false;
            element.patientSelectClass = "custom_check d-flex align-items-center";
            element.itemSelectClass = "custom_check d-flex justify-content-center align-items-center w-100";
            element.itemSelectBarcodeClass = "icon_disabled";
            //element.showHideItemsClass = "p-2 bg-white row mx-0 vital_block border-bottom-primary-200 align-items-center d-none";
            element.showHideItemsClass = "collapse";
            element.changedQty = element.Qty;
          });
          const distinctThings = response.FetchBulkMedicationIssueDataList.filter(
            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.PatientID === thing.PatientID) === i);
          console.dir(distinctThings);
          this.filteredbulkMedicationIssueList = distinctThings
        },
          (err) => {
          })
    }
  }
  filterFunction(medications: any, patientid: any) {
    if (this.medType === 'IV') {
      return medications.filter((x: any) => x.PatientID == patientid && x.IVFluid == '1');
    }
    else if (this.medType === 'normal') {
      return medications.filter((x: any) => x.PatientID == patientid && x.IVFluid == '0');
    }
    else {
      return medications.filter((x: any) => x.PatientID == patientid);
    }

  }
  viewfilterFunction(medications: any, orderno: any) {
    if (this.medType === 'IV') {
      return medications.filter((x: any) => x.OrderNo == orderno && x.IVFluid == '1');
    }
    else if (this.medType === 'normal') {
      return medications.filter((x: any) => x.OrderNo == orderno && x.IVFluid == '0');
    }
    else {
      return medications.filter((x: any) => x.OrderNo == orderno);
    }
  }

  showHideItemsList(patientid: any) {
    this.filteredbulkMedicationIssueList.forEach((element: any, index: any) => {
      if (element.PatientID == patientid) {
        // if (element.showHideItemsClass == "p-2 bg-white row mx-0 vital_block border-bottom-primary-200 align-items-center") {
        //   element.showHideItemsClass = "p-2 bg-white row mx-0 vital_block border-bottom-primary-200 align-items-center d-none";
        // }
        // else {
        //   element.showHideItemsClass = "p-2 bg-white row mx-0 vital_block border-bottom-primary-200 align-items-center";
        // }
        if (element.showHideItemsClass == "collapse") {
          element.showHideItemsClass = "expand";
        }
        else {
          element.showHideItemsClass = "collapse";
        }
      }
    });
  }

  selectAllItemsForPatient(patient: any) {
    this.bulkMedicationIssueList.forEach((element: any, index: any) => {
      if (element.PatientID == patient.PatientID && Number(element.QOH > 0)) {
        if (!element.ItemSelected) {
          element.ItemSelected = true;
          element.patientSelectClass = "custom_check d-flex align-items-center active";
          element.itemSelectClass = "custom_check d-flex justify-content-center align-items-center w-100 active";
          element.itemSelectBarcodeClass = "active";
        }
        else {
          element.ItemSelected = false;
          element.patientSelectClass = "custom_check d-flex align-items-center";
          element.itemSelectClass = "custom_check d-flex justify-content-center align-items-center w-100";
          element.itemSelectBarcodeClass = "icon_disabled";
        }
      }
    });
  }

  selectItemForPatient(item: any) {
    var item = this.bulkMedicationIssueList.find((x: any) => x.prescriptionid === item.prescriptionid && x.Itemid === item.Itemid);
    if (item && Number(item.QOH) == 0) {
      this.errorMessages = [];
      this.errorMessages.push("Cannot issue medicine as there is No Stock.");
      $("#errorMessageModal").modal("show");
      return;
    }
    if (!item.ItemSelected) {
      item.ItemSelected = true;
      item.itemSelectClass = "custom_check d-flex justify-content-center align-items-center w-100 active";
      item.itemSelectBarcodeClass = "active";
    }
    else {
      item.ItemSelected = false;
      item.itemSelectClass = "custom_check d-flex justify-content-center align-items-center w-100";
      item.itemSelectBarcodeClass = "icon_disabled";
    }
  }

  clearScreen() {
    this.bulkMedicationIssueList = [];
    this.filteredbulkMedicationIssueList = [];
    this.listOfWards = [];
    this.selectedWardID = "";
    this.selectedViewWardID = "";
    this.showMedTypetoggle = false;
    $("#wardSearch").val('');
    var d = new Date();
    this.bulkProcessingForm.patchValue({
      ProcessDate: d
    })
  }

  saveBulkProcessing() {
    let selectedItems = this.bulkMedicationIssueList.filter((x: any) => x.ItemSelected == true);
    if (this.medType === 'IV') {
      selectedItems = selectedItems.filter((x: any) => x.IVFluid == '1');
    } else if (this.medType === 'normal') {
      selectedItems = selectedItems.filter((x: any) => x.IVFluid == '0');
    }
    if (selectedItems.length > 0) {
      var ItemXMLDetails: any[] = [];
      selectedItems.forEach((element: any, index: any) => {
        if (element.ItemSelected) {
          ItemXMLDetails.push({
            "OrderNo": element.OrderNo,
            "prescriptionid": element.prescriptionid,
            "PatientName": element.PatientName,
            "CutoffTime": "22-Dec-2023 20:00:00",
            "FinalCutoffTime": "22-Dec-2023 20:00:00",
            "UHID": element.UHID,
            "SSN": element.SSN,
            "AdmissionNumber": element.AdmissionNumber,
            "Itemid": element.Itemid,
            "ItemName": element.ItemName,
            "Doctorname": element.Doctorname,
            "BedName": element.BedName,
            "MonitorDate": element.MonitorDate,
            "Ward": element.Ward,
            "PatientID": element.PatientID,
            "IPID": element.IPID,
            "DoctorID": element.DoctorID,
            "BedID": element.BedID,
            "frequencyqty": element.frequencyqty,
            "Frequency": element.Frequency,
            "duration": element.Duration,
            "PerDayQty": element.PerDayQty,
            "issueqty": element.issueqty,
            "UOMID": element.UOMID,
            "PackID": element.PackID,
            "DoseUOM": element.DoseUOM,
            "Status": element.Status,
            "TransferID": element.TransferID,
            "IsDisPrescription": element.IsDisPrescription,
            "Isonetime": element.Isonetime,
            "IssueUomValue": element.IssueUomValue,
            "Duration": element.Duration,
            "DurationUOM": element.DurationUOM,
            "Dose": element.Dose,
            "QOHPACKID": element.QOHPACKID,
            "QOHUOMID": element.QOHUOMID,
            "startfrom": element.startfrom,
            "EndDatetime": element.EndDatetime,
            "Remarks": element.Remarks,
            "MonitorId": element.MonitorId,
            "OrderDate": element.OrderDate,
            "AdmRouteID": element.AdmRouteID,
            "AdmRoute": element.AdmRoute,
            "AdmRoute2L": element.AdmRoute2L,
            "QOH": element.QOH,
            "GenericItemID": element.GenericItemID,
            "Strength": element.Strength,
            "StrengthUOMID": element.StrengthUOMID,
            "DurationID": element.DurationID,
            "FrequencyID": element.FrequencyID,
            "DoseID": element.DoseID,
            "ISPRN": element.ISPRN,
            "GenderID": element.GenderID,
            "DrugOrderID": element.DrugOrderID,
            "IsBlockedBulkProcess": element.IsBlockedBulkProcess,
            "Qty": element.changedQty
          })
        }
      });


      var bulkProcPayload =
      {
        "ProcessDate": moment(this.bulkProcessingForm.get('ProcessDate').value).format('DD-MMM-YYYY'),
        "CutoffTime": this.cuttoffTime,
        "WardID": this.selectedWardID,
        "HospDeptId": this.facilityId,
        "IsIVFluidBulkRequest": "0",
        "Salesdate": "23-Dec-2023 13:20:00",
        "Hospitalid": this.hospitalID,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.facilityId,
        "ItemXMLDetails": ItemXMLDetails
      }
      const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
        backdrop: 'static'
      });
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.config.SavePharmacyBulkIssue(bulkProcPayload).subscribe(response => {
            if (response.Code == 200) {
              $("#saveMsg").modal('show');
            } else if (response.Code == 604) {
              this.errorMessages = [];
              this.errorMessages.push(response.Message);
              $("#errorMessageModal").modal("show");
            }
          })
        }
        modalRef.close();
      });

    }
    else {
      this.errorMessages = [];
      this.errorMessages.push("Please select atleast one medicine to proceed");
      $("#errorMessageModal").modal("show");
    }
  }

  reloadData() {
    this.FetchBulkMedicationIssue(this.selectedWardID);
  }

  showViewBulkProcessing() {
    this.clearViewScreen();
    this.showViewBulkProcessingdiv = true;
  }

  showViewBulkProcessingPrint() {
    var ssnD = "0";
    if ($("#ssn").val() != '') {
      ssnD = $("#ssn").val();
    }

    if (this.selectedViewWardID == "") {
      this.errorMessages = [];
      this.errorMessages.push("Please select Ward");
      $("#errorMessageModal").modal("show");
    } else {
      // this.clearViewScreen();
      // this.showViewBulkProcessingdiv = true;
      const disctinctsalesids = this.viewbulkMedicationIssueList.filter((x: any) => x.ItemSelected).filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.SalesID === thing.SalesID) === i);
      const salesids = disctinctsalesids.filter((x: any) => x.ItemSelected).map((item: any) => item.SalesID).join(',');
      const distinctssn = this.viewbulkMedicationIssueList.filter((x: any) => x.ItemSelected).filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.SSN === thing.SSN) === i);
      const ssn = distinctssn.map((item: any) => item.SSN).join(',');
      var fromdate = this.datepipe.transform(this.viewBulkProcForm.get('FromDate').value, "dd-MMM-yyyy")?.toString();
      var todate = this.datepipe.transform(this.viewBulkProcForm.get('ToDate').value, "dd-MMM-yyyy")?.toString();
      var ssnV = $("#ssn").val();
      if (salesids == '') {
        this.FetchViewBulkMedicationOrderPrint(fromdate, todate, this.selectedViewWardID, ssn == "" ? ssnD : ssn, this.doctorDetails[0].UserName);
      }
      else {
        this.FetchViewBulkMedicationOrderItemPrint(fromdate, todate, ssn == "" ? ssnD : ssn, this.viewbulkMedicationIssueList.filter((x: any) => x.ItemSelected));
        //this.FetchViewBulkMedicationOrderPrintHHH(fromdate, todate, this.selectedViewWardID, ssn, salesids, this.doctorDetails[0].UserName);
        //this.FetchViewBulkMedicationOrderPrint(fromdate, todate, this.selectedViewWardID, ssn==""?ssnD:ssn, this.doctorDetails[0].UserName); 
      }
    }


  }


  showBulkProcMaindiv() {
    this.clearScreen();
    this.showViewBulkProcessingdiv = false;
  }

  searchViewBulkProcessing() {
    var fromdate = this.datepipe.transform(this.viewBulkProcForm.get('FromDate').value, "dd-MMM-yyyy")?.toString();
    var todate = this.datepipe.transform(this.viewBulkProcForm.get('ToDate').value, "dd-MMM-yyyy")?.toString();

    var ssn = "0";
    if ($("#ssn").val() != '') {
      ssn = $("#ssn").val();
    }
    this.FetchViewBulkProcessingData(this.selectedViewWardID, fromdate, todate, ssn);
  }

  clearViewScreen() {
    this.viewbulkMedicationIssueList = [];
    this.filteredviewbulkMedicationIssueList = [];
    this.listOfWards = [];
    this.selectedWardID = "";
    this.selectedViewWardID = "";
    $("#viewWardSearch").val('');
    $("#ssn").val('');
    var d = new Date();
    this.viewBulkProcForm.patchValue({
      FromDate: d,
      ToDate: d
    })
  }

  FetchViewBulkProcessingData(wardId: string, fromdate: any, todate: any, ssn: any) {
    this.config.FetchViewBulkMedicationOrder(wardId, fromdate, todate, ssn, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.viewbulkMedicationIssueList = response.FetchViewBulkMedicationOrderDataList;
          if (this.viewbulkMedicationIssueList.length > 0) {
            this.showNoRecFound = false; this.showMedTypetoggle = true;
          }
          this.viewbulkMedicationIssueList.forEach((element: any, index: any) => {
            element.ItemSelected = false;
            element.patientSelectClass = "custom_check d-flex align-items-center";
            element.itemSelectClass = "custom_check d-flex justify-content-center align-items-center";
            element.showHideItemsClass = "collapse";
            element.itemSelectBarcodeClass = "icon_disabled";
          });
          const distinctThings = response.FetchViewBulkMedicationOrderDataList.filter(
            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.OrderNo === thing.OrderNo) === i);
          console.dir(distinctThings);
          this.filteredviewbulkMedicationIssueList = distinctThings

        }
      },
        (err) => {
        })
  }
  FetchViewBulkMedicationOrderPrint(fromdate: any, todate: any, wardId: string, ssn: any, UserName: any) {
    this.config.FetchViewBulkMedicationOrderPrint(fromdate, todate, wardId, ssn, UserName, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModal()
        }
      },
        (err) => {
        })
  }

  FetchViewBulkMedicationOrderPrintHHH(fromdate: any, todate: any, wardId: string, ssn: any, salesids: any, UserName: any) {
    this.config.FetchViewBulkMedicationOrderPrintHHH(fromdate, todate, wardId, ssn, salesids, UserName, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModal()
        }
      },
        (err) => {
        })
  }
  UpdatePrintQty(event: any, view: any) {
    view.NoofPrint = event.target.value;
  }

  FetchViewBulkMedicationOrderItemPrint(fromdate: any, todate: any, ssn: any, items: any) {
    const payload = {
      "ProcessFromDate": fromdate,
      "ProcessToDate": todate,
      "WardID": this.selectedViewWardID,
      "SSN": ssn,
      "UserName": this.doctorDetails[0].UserName,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facilityId,
      "HospitalID": this.hospitalID,
      "SalesItemsXMLDataXML": items.map((element: any) => {
        return {
          SLID: element.SalesID,
          IID: element.ItemId,
          NoofPrint: element.NoofPrint ?? element.IssuedQty
        }
      })
    };
    this.config.FetchViewBulkMedicationOrderItemPrint(payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModal()
        }
      },
        (err) => {
        })
  }
  showModal(): void {
    $("#reviewAndPayment").modal('show');
  }

  filterViewMedications(event: any) {
    this.viewbulkMedicationIssueList = this.viewbulkMedicationIssueList.filter((x: any) => x.SSN == event.target.value);
    this.viewbulkMedicationIssueList.forEach((element: any, index: any) => {
      element.ItemSelected = false;
      element.patientSelectClass = "custom_check d-flex align-items-center";
      element.itemSelectClass = "custom_check d-flex justify-content-center align-items-center";
      element.showHideItemsClass = "collapse";
      element.itemSelectBarcodeClass = "icon_disabled";
    });
    const distinctThings = this.viewbulkMedicationIssueList.filter(
      (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.OrderNo === thing.OrderNo) === i);
    console.dir(distinctThings);
    this.filteredviewbulkMedicationIssueList = distinctThings
  }
  onEnterPress(event: any) {
    // if (event instanceof KeyboardEvent && event.key === 'Enter') {
    //   this.filterViewMedications(event);
    // }
    this.searchViewBulkProcessing();
  }

  showHideViewItemsList(patientid: any) {
    this.filteredviewbulkMedicationIssueList.forEach((element: any, index: any) => {
      if (element.OrderNo == patientid) {
        if (element.showHideItemsClass == "collapse") {
          element.showHideItemsClass = "expand";
        }
        else {
          element.showHideItemsClass = "collapse";
        }
      }
    });
  }

  viewselectAllItemsForPatient(patient: any) {
    this.viewbulkMedicationIssueList.forEach((element: any, index: any) => {
      if (element.OrderNo == patient.OrderNo) {
        if (!element.ItemSelected) {
          element.ItemSelected = true;
          element.patientSelectClass = "custom_check d-flex align-items-center active";
          element.itemSelectClass = "custom_check d-flex justify-content-center align-items-center active";
          element.itemSelectBarcodeClass = "active";
        }
        else {
          element.ItemSelected = false;
          element.patientSelectClass = "custom_check d-flex align-items-center";
          element.itemSelectClass = "custom_check d-flex justify-content-center align-items-center";
          element.itemSelectBarcodeClass = "icon_disabled";
        }
      }
    });
  }

  viewselectItemForPatient(item: any) {
    // if (!this.barcodeprint) 
    //   this.barcodeprint = !this.barcodeprint;
    item.ItemSelected = !item.ItemSelected;
    // var item = this.viewbulkMedicationIssueList.find((x: any) => x.ItemId === item.ItemId);
    // if (!item.ItemSelected) {
    //   item.ItemSelected = true;      
    //   item.itemSelectClass = "custom_check d-flex justify-content-center align-items-center active";
    //   item.itemSelectBarcodeClass = "active";
    // }
    // else {
    //   item.ItemSelected = false;
    //   item.itemSelectClass = "custom_check d-flex justify-content-center align-items-center";
    //   item.itemSelectBarcodeClass = "icon_disabled";
    // }
  }

  showPatientInfo(pinfo: any) {
    pinfo.AdmissionID = pinfo.IPID;
    pinfo.HospitalID = this.hospitalID;
    this.pinfo = pinfo;
    $("#quick_info").modal('show');

  }

  onExpandCollapseClick(type: string) {
    if (type == "collapse") {
      this.type = 'collapse';
    }
    else {
      this.type = 'expand';
    }
    this.filteredbulkMedicationIssueList.forEach((element: any, index: any) => {
      if (type == "expand") {
        element.showHideItemsClass = "expand";
      }
      else {
        element.showHideItemsClass = "collapse";
      }
    });
  }

  fetchSubstiteItem(item: any) {
    this.config.FetchSubstituteItemsIP(item.Itemid, this.doctorDetails[0].UserId, this.facilityId, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.substituteItems = response.FetchSubstituteItemsDList;
          $("#modalSubstituteItems").modal('show');
        }
      },
        (err) => {
        })
  }

  selectSubstituteItem(sub: any) {
    //this.onItemSelected(sub);
    $("#modalSubstituteItems").modal('hide');
  }

  clearPatientInfo() {
    this.pinfo = "";
  }

  navigateToResults() {
    sessionStorage.setItem("FromCaseSheet", "false");
    sessionStorage.setItem("selectedView", JSON.stringify(this.individualProcess));
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.individualProcess));
    this.showResultsinPopUp = true;
    $("#viewResults").modal("show");
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

  navigatetoPatientSummary(patient: any) {
    patient.Bed = patient.OrderBed;
    this.individualProcess.AdmissionID = this.individualProcess.IPID;
    sessionStorage.setItem("PatientDetails", JSON.stringify(patient));
    sessionStorage.setItem("selectedView", JSON.stringify(patient));
    sessionStorage.setItem("selectedPatientAdmissionId", patient.IPID);
    sessionStorage.setItem("PatientID", patient.PatientID);
    //this.router.navigate(['/shared/patientfolder']);
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(PatientfoldermlComponent, {
      data: patient,
      readonly: true
    }, options);
  }

  onFilterBulkMed(type: any) {
    this.medType = type;
    this.bulkMedicationIssueList?.forEach((element: any) => {
      element.ItemSelected = false;
      element.patientSelectClass = "custom_check d-flex align-items-center";
      element.itemSelectClass = "custom_check d-flex justify-content-center align-items-center w-100";
      element.itemSelectBarcodeClass = "icon_disabled";
    });
    this.viewbulkMedicationIssueList?.forEach((element: any) => {
      element.ItemSelected = false;
      element.patientSelectClass = "custom_check d-flex align-items-center";
      element.itemSelectClass = "custom_check d-flex justify-content-center align-items-center";
      element.itemSelectBarcodeClass = "icon_disabled";
    });
  }

  PatientPrintCard(item: any) {
    this.config.FetchRegistrationCard(item.PatientID, this.doctorDetails[0]?.UserId, this.ward.FacilityID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH;
          $("#caseRecordModal").modal('show');
        }
      },
        (err) => {

        })
  }

  onDiscontinueClick(item: any) {
    const items = this.filterFunction(this.bulkMedicationIssueList, item.PatientID);
    const discontinuedItems = items.filter((a: any) => a.isDiscontinue);
    this.errorMessages = [];
    if (discontinuedItems.length === 0) {
      this.errorMessages.push('Please select atleast one medication to discontinue')
    }

    if (this.errorMessages.length > 0) {
      $("#errorMessageModal").modal('show');
      return;
    }
    this.discontinuedItems = discontinuedItems;
    $("#discontinue_medication_remarks").modal('show');
  }

  discontinueMedication() {
    var discMedXml: any[] = [];
    this.discontinuedItems.forEach((element: any) => {
      discMedXml.push({
        "PID": element.prescriptionid,
        "IID": element.Itemid,
        "MID": element.MonitorId,
        "DCR": $("#discontinue_multiple_Rem").val()
      })
    });
    var payload = {
      "DetailsXML": discMedXml,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facilityId,
      "HospitalID": this.hospitalID
    }
    this.presconfig.saveBlockPrescriptionItems(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#discontinue_multiple_Rem").val('');
          $("#discontinueMedSaveMsg").modal('show');
          this.FetchBulkMedicationIssue(this.selectedWardID);
        }
      },
      (err) => {
        console.log(err)
      });
  }
}
