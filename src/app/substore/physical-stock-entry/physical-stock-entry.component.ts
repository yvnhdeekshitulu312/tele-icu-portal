import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
  selector: 'app-physical-stock-entry',
  templateUrl: './physical-stock-entry.component.html',
  styleUrls: ['./physical-stock-entry.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe
  ],
})
export class PhysicalStockEntryComponent extends BaseComponent implements OnInit {
  physicalEntryForm!: FormGroup;
  viewPhysicalEntryForm!: FormGroup;
  itemsList: any = [];
  errorMessages: any = [];
  facility: any;
  itemUomList: any = [];
  selectedItems: any = [];
  todayDate = moment(new Date()).format('DD-MMM-YYYY');
  viewItemsList: any = [];
  isView: boolean = false;

  constructor(private us: UtilityService, private formBuilder: FormBuilder, private config: ConfigService, private router: Router) {
    super();
    this.physicalEntryForm = this.formBuilder.group({
      ItemId: '',
      ItemName: '',
      Quantity: "",
      UomId: "0",
      Uom: "",
      PackId: "",
      PackName : '',
      PRate: "", //-- PRATE
      MRP: "",//--MRP
      BatchNo: "",
      ExpiryDate: new Date(),
      EpRate: "",//-- PRATE
      SPR: ""//--MRP
    });
    var d = new Date();
    d.setDate(d.getDate() + 1);
    this.viewPhysicalEntryForm = this.formBuilder.group({
      fromDate: new Date(),
      toDate: d
    });
  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
  }

  searchItems(event: any) {

    const searchval = event.target.value;
    if (searchval.length > 2) {
      const url = this.us.getApiUrl(indent.FetchItemsOfDepartmentPhyStockEntry, {
        filter: searchval,
        UserID: this.doctorDetails[0]?.UserId,
        WorkStationID: this.facility.FacilityID,
        HospitalID: this.hospitalID
      });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code === 200) {
            this.itemsList = response.FetchItemsOfDepartmentDataList;
          }
        },
          () => {
          });
    }
  }

  selectItem(item: any) {
    this.physicalEntryForm.patchValue({
      ItemId: item.ItemID,
      ItemName: item.DisplayName,
      PackId: item.PackId,
      PackName: item.PackName,
    });
    this.itemsList = [];
    const url = this.us.getApiUrl(indent.FetchItemPackingPhyStockEntry, {
      ItemID: item.ItemID,
      PackID: item.PackId,
      UserID: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code === 200 && response.FetchItemPackingPhyStockEntryDataList.length > 0) {
          this.itemUomList = response.FetchItemPackingPhyStockEntryDataList;
          this.physicalEntryForm.patchValue({
            UomId: this.itemUomList[0].UoMID,
            Uom: this.itemUomList[0].FullUoM
          });
        }
      },
        () => {
        });
  }

  itemUomChange(event: any) {
    this.physicalEntryForm.patchValue({
      UomId: event.target.value,
      Uom: event.target.options[event.target.options.selectedIndex].text
    });
  }

  addItem() {
    if (this.physicalEntryForm.get("ItemId")?.value == '') {
      this.errorMessages = [];
      this.errorMessages.push('Please select any item to add');
      $('#errorMessagesModal').modal('show');
      return;
    }
    if (this.physicalEntryForm.get("Quantity")?.value == '') {
      this.errorMessages = [];
      this.errorMessages.push('Please enter quantity');
      $('#errorMessagesModal').modal('show');
      return;
    }
    const qty = this.physicalEntryForm.get("Quantity")?.value;
    if (parseFloat(qty) === 0) {
      this.errorMessages = [];
      this.errorMessages.push('Please enter quantity greater than 0');
      $('#errorMessagesModal').modal('show');
      return;
    }
    if (this.physicalEntryForm.get("PRate")?.value == '' || this.physicalEntryForm.get("MRP")?.value == '') {
      this.errorMessages = [];
      this.errorMessages.push('Please enter PRate/MRP');
      $('#errorMessagesModal').modal('show');
      return;
    }
    if (this.physicalEntryForm.get("BatchNo")?.value == '') {
      this.errorMessages = [];
      this.errorMessages.push('Please enter Batch No');
      $('#errorMessagesModal').modal('show');
      return;
    }
    const prate = this.physicalEntryForm.get("PRate")?.value;
    const mrp = this.physicalEntryForm.get("MRP")?.value;
    if(parseFloat(prate) > parseFloat(mrp)) {
      this.errorMessages = [];
      this.errorMessages.push('PRate should be less than or equal to MRP');
      $('#errorMessagesModal').modal('show');
      return;
    }
    const item = this.selectedItems.find((x: any) => x.ItemId === this.physicalEntryForm.get("ItemId")?.value);
    if (item) {
      this.errorMessages = [];
      this.errorMessages.push('Item Already Exists');
      $('#errorMessagesModal').modal('show');
      return;
    }
    this.selectedItems.push({
      ItemId: this.physicalEntryForm.get("ItemId")?.value,
      ItemName: this.physicalEntryForm.get("ItemName")?.value,
      Quantity: this.physicalEntryForm.get("Quantity")?.value,
      UomId: this.physicalEntryForm.get("UomId")?.value,
      Uom: this.physicalEntryForm.get("Uom")?.value,
      PackId: this.physicalEntryForm.get("PackId")?.value,
      PackName: this.physicalEntryForm.get("PackName")?.value,
      PRate: this.physicalEntryForm.get("PRate")?.value, //-- PRATE
      MRP: this.physicalEntryForm.get("MRP")?.value,//--MRP
      BatchNo: this.physicalEntryForm.get("BatchNo")?.value,
      ExpiryDate: moment(this.physicalEntryForm.get("ExpiryDate")?.value).format('DD-MMM-YYYY'),
      EpRate: this.physicalEntryForm.get("PRate")?.value,//-- PRATE
      SPR: this.physicalEntryForm.get("MRP")?.value//--MRP
    });
    this.physicalEntryForm.patchValue({
      ItemId: '',
      ItemName: '',
      Quantity: "",
      UomId: "0",
      PackId: "",
      PackName: '',
      PRate: "", //-- PRATE
      MRP: "",//--MRP
      BatchNo: "",
      ExpiryDate: new Date(),
      EpRate: "",//-- PRATE
      SPR: ""//--MRP
    });
  }
  deleteSelectedItem(index: any) {
    this.selectedItems.splice(index, 1);
  }

  onSaveClick() {
    if (this.selectedItems.length === 0) {
      this.errorMessages = [];
      this.errorMessages.push('Please select an item to save');
      $('#errorMessagesModal').modal('show');
      return;
    }
    var itemxml: any = [];
    this.selectedItems.forEach((element: any) => {
      itemxml.push({
        "SEQ": this.selectedItems.length,
        "ITM": element.ItemId,
        "QTY": element.Quantity,
        "UID": element.UomId,
        "PID": element.PackId,
        "RPU": element.PRate, //-- PRATE
        "MRP": element.MRP,//--MRP
        "BNO": element.BatchNo,
        "XDT": element.ExpiryDate,
        "EPR": element.EpRate,//-- PRATE
        "SPR": element.SPR,
      });
    });

    var payload = {
      "ItemsXML": itemxml,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID,
      "HospitalID": this.hospitalID
    }


    this.us.post(indent.SavePhysicalStockEntry, payload).subscribe((response) => {
      if (response.Code === 200) {
        this.clearForm();
        $("#successMsgModal").modal('show');
      }
    },
      (err) => {
        console.log(err)
      });
  }

  clearForm() {
    
    this.physicalEntryForm.patchValue({
      ItemId: '',
      ItemName: '',
      Quantity: "",
      UomId: "0",
      PackId: "",
      PackName: '',
      PRate: "", //-- PRATE
      MRP: "",//--MRP
      BatchNo: "",
      ExpiryDate: new Date(),
      EpRate: "",//-- PRATE
      SPR: ""//--MRP
    });
    this.selectedItems = [];
    this.itemUomList = [];
    this.errorMessages = [];
    this.viewItemsList = [];
    this.isView = false;
  }

  navigatetoBedBoard() {
    this.router.navigate(['/ward']);
  }

  viewPhyStockEntry() {
    this.viewPhysicalStockEntrySaved();
    $("#physicalStockEntryViewModal").modal('show');
  }

  viewPhysicalStockEntrySaved() {
    const url = this.us.getApiUrl(indent.FetchPurchaseReceiptsViewPhyStockEntry, {
      FromDate: moment(this.viewPhysicalEntryForm.get('fromDate')?.value).format('DD-MMM-YYYY'),
      ToDate: moment(this.viewPhysicalEntryForm.get('toDate')?.value).format('DD-MMM-YYYY'),
      UserID: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code === 200) {
          this.viewItemsList = response.FetchPurchaseReceiptsViewPhyStockEntryDataList;
        }
      },
        () => {
        });
  }

  onPhyEntrySelected(item: any) {
    const url = this.us.getApiUrl(indent.FetchPurchaseReceiptPhyStockEntry, {
      ReceiptID: item.PRID,
      UserID: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code === 200) {
          this.isView = true;
          const orderDetails = response.FetchPurchaseReceiptPhyStockEntryDataList;
          orderDetails.forEach((element: any) => {
            this.selectedItems.push({
              ItemId: element.ItemID,
              ItemName: element.DisplayName,
              Quantity: element.Quantity,
              UomId: element.UoMID,
              Uom: element.UOM,
              PackId: element.PackId,
              PackName: element.PackName,
              PRate: element.EPR,
              MRP: element.MRP,
              BatchNo: element.BatchNo,
              ExpiryDate: moment(element.ExpiryDate).format('DD-MMM-YYYY'),
              EpRate: element.EPR,
              SPR: element.MRP
            });
          });
          $("#physicalStockEntryViewModal").modal('hide');
        }
      },
        () => {
        });
  }
}


export const indent = {
  FetchItemsOfDepartmentPhyStockEntry: 'FetchItemsOfDepartmentPhyStockEntry?filter=${filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchItemPackingPhyStockEntry: 'FetchItemPackingPhyStockEntry?ItemID=${ItemID}&PackID=${PackID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SavePhysicalStockEntry: 'SavePhysicalStockEntry',
  FetchPurchaseReceiptsViewPhyStockEntry: 'FetchPurchaseReceiptsViewPhyStockEntry?FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPurchaseReceiptPhyStockEntry: 'FetchPurchaseReceiptPhyStockEntry?ReceiptID=${ReceiptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}