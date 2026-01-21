import { Component, OnInit, ElementRef, QueryList, ViewChildren, ViewChild, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { ConfigService as BedConfig } from '../services/config.service'
import * as _ from 'lodash';

declare var $: any;
import * as Highcharts from 'highcharts';
import { SuitConfigService } from 'src/app/suit/services/suitconfig.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'dd-MMM-yyyy',
  },
  display: {
    dateInput: 'DD-MMM-yyyy',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'dd-MMM-yyyy',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-sample-collection',
  templateUrl: './sample-collection.component.html',
  styleUrls: ['./sample-collection.component.scss']
})
export class SampleCollectionComponent implements OnInit {
  currentdate: any;
  currentWeekdate: any;
  currentWeekDates: any;
  calendarMedications: any = [];
  calendarFilteredMedications: any = [];
  FetchScanDrugDataList: any = [];
  datewiseMedications: any;
  patientDetails: any;
  langData: any;
  selectedView: any;
  selectedCard: any;
  isNational: any = false;
  IsSwitch = false;
  hospitalId: any;
  doctorDetails: any;
  location: any;
  ward: any;
  wardID: any;
  uhid: any;
  patientName: any;
  age: any;
  gender: any;
  nationality: any;
  mobileNo: any;
  doctorName: any;
  PatientType: any;
  admitDate: any;
  adtDate: any;
  dischargeDate: any;
  payer: any;
  episodeId: any;
  vitalDate: any;
  admissionID: any;
  FetchUserFacilityDataList: any = [];
  FetchNotAdministeredReasonDataList: any = [];
  FetchAdministerTimeDeviationReasonDataList: any = [];
  FetchManualEntryReasonDataList: any = [];
  @Input() IsSwitchWard: any = false;
  @Output() selectedWard = new EventEmitter<any>();
  @Output() filteredDataChange = new EventEmitter<any[]>();
  errorMessage: any;
  witnessNurseData: any = [];
  selectedDrug: any;
  selectedDrugDateTime: any;
  selectedDrugDetails: any;
  IsScan = false;
  isSubmitted = false;
  nationalID: any;
  currentDate: Date = new Date();
  firstDayOfWeek!: Date;
  lastDayOfWeek!: Date;
  todayDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy");
  IsHeadNurse: any;
  IsHome = true;
  FetchLabPhlebtomyDisplayOutputLists: any[] = [];
  FetchLabPhlebtomyDisplayOutputListsFiltered: any[] = [];
  FetchLabPhlebtomyDisplayOutputListsFiltered1: any[] = [];
  samplecollected = false;
  porter = false;
  samplerecieved = false;
  sampleacknowledge = false;
  samplerecollect = false;
  barcodeprint = false;
  selecteddata: any;
  groupedArray: any;
  groupedData: any;
  saveenable = false;
  trustedUrl: any;
  selectall = false;
  enableSave: boolean = false;
  filterType: string = "";
  tabType: string = "neworder";
  patinfo: any;
  specialisationWiseFilteredOrderDetails: any;
  specialisationWiseFilteredOrderDetails1: any;
  specialisationWiseFilteredOrderDetailsdrugDataArray: any[] = [];
  labOrderData: any;
  unAcknowledgeRemarksFor: any;
  unAcknowledgeRemarksTestOrderDetails: any;
  reCollectRemarks: any;
  reCollectRemarksTestOrderDetails: any;
  reCollectRemarksFor: any;
  showSampleCollectedData = false;
  showRecollect: boolean = false;
  validationMsg: string = "";
  selectedPatientData: any;
  testHistory: any[] = [];
  testandSpecialisation: any;
  errorMsg: any;

  constructor(private config: ConfigService, private bed_config: BedConfig, private router: Router, public datepipe: DatePipe, private fb: FormBuilder, private changeDetectorRef: ChangeDetectorRef, private suitconfig: SuitConfigService) {
    this.langData = this.config.getLangData();
    this.hospitalId = sessionStorage.getItem('hospitalId');
    this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY, H:mm');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    //this.selectedCard=JSON.parse(sessionStorage.getItem("selectedView") || '{}');

    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
  }

  ngOnInit(): void {
    this.IsSwitch = this.IsSwitchWard;
    this.wardID = this.ward.FacilityID;
    this.admissionID = this.selectedView.IPID;
    this.uhid = this.patientDetails.RegCode;
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    if (sessionStorage.getItem('lang') == "ar") {
      this.patientName = this.patientDetails.FirstName2l + ' ' + this.patientDetails.MiddleName2L + ' ' + this.patientDetails.Familyname2l;
    }
    else {
      this.patientName = this.patientDetails.FirstName + ' ' + this.patientDetails.MiddleName + ' ' + this.patientDetails.Familyname;
    }
    this.age = this.patientDetails.Age + ' ' + this.patientDetails.AgeUoM;
    this.gender = this.patientDetails.Gender;
    this.nationality = this.patientDetails.Nationality;
    this.mobileNo = this.patientDetails.MobileNo;

    this.payer = this.patientDetails.InsuranceName;

   

  }

  getLangData() {
    this.langData = JSON.parse(sessionStorage.getItem("langData") || '{}');
    return this.langData;
  }
  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  onNationalIDEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.onchangeNationalID();
      //this.onchangeSSN();
      this.changeDetectorRef.detectChanges();
    }
  }

  onchangeNationalID() {
    this.isNational = false;
    this.calendarMedications = [];
    this.calendarFilteredMedications = [];
    if (this.nationalID) {
      this.onchangeSSN();
      var BedList = JSON.parse(sessionStorage.getItem("BedList") || '{}');
      const selectedItem = BedList.find((value: any) => value.SSN.toString().toUpperCase() === this.nationalID.toString().toUpperCase());
      if (selectedItem) {
        this.selectedView = selectedItem;
        this.patientDetails = selectedItem;
        const currentdate = new Date();
        sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientDetails));
        this.isNational = true;
      }

    }

  }

  addremoveclass(classname: any, event: Event) {
    event.stopPropagation();
    if (classname.STATUSColor.includes('maxim')) {
      classname.STATUSColor = classname.STATUSColor.replace(' maxim', ' ');
    }
    else {
      classname.STATUSColor = classname.STATUSColor + " maxim";
    }
  }

  onchangeSSN() {
    if (!this.nationalID) {
      this.FetchLabPhlebtomyDisplayOutputLists = [];
      this.FetchLabPhlebtomyDisplayOutputListsFiltered = [];
      return;
    }
    let payload = {
      "SpecimenIDs": "",
      "intUserId": this.doctorDetails[0].UserId,
      "intWorkstationId": this.selectedView.PatientType == '4' ? '2147' : this.wardID,
      "strSmplNo": "",
      "strSSN": this.nationalID,
      "IsLastweek": "2",
      "strTbl": "1,2",
      "strStatus": "",
      "fromDate": "",
      "toDate": "",
      "strPatientIds": "",
      "strMobileNo": "",
      "intOrderType": "0",
      "intWardId": "0",
      "isTransfer": 0,
      "isReceived": 0,
      "strPatientSerNumber": "",
      "BagNumber": "",
      "DonorNo": ""
    }
    this.suitconfig.FetchLabPhlebtomyDataDisplay(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.FetchLabPhlebtomyDisplayOutputLists = response.FetchLabPhlebtomyDisplayOutputLists;

        if (this.FetchLabPhlebtomyDisplayOutputLists.length === 0) {
          $("#errorMsg").modal("show");
        }

        this.FetchLabPhlebtomyDisplayOutputLists.forEach((element: any, index: any) => {
          if (element.SampleNumber) {
            element.groupclick = true;

          }
          else {
            element.groupclick = false;
          }
          this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputLists
          .filter((x: any) => x.IsBarCodePrint == '' || x.IsBarCodePrint == "False");
        });
        this.FetchLabPhlebtomyDisplayOutputListsFiltered1 = this.FetchLabPhlebtomyDisplayOutputListsFiltered;
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputListsFiltered.sort((a: any, b: any) => new Date(b.RequisitionDate).getTime() - new Date(a.RequisitionDate).getTime());
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputListsFiltered.sort((a: any, b: any) => b.Orderslno.localeCompare(a.Orderslno));
        
      }
    },
      (err) => {

      })
  }

  filterOrders(type: string) {
    if (type === "neworder") {
      this.filterType = "";
      this.tabType = "neworder";
      this.showSampleCollectedData = false;
      this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputLists.filter((x: any) => (x.IsBarCodePrint === '' || x.IsBarCodePrint === 'False'));
      this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputListsFiltered.sort((a: any, b: any) => new Date(b.RequisitionDate).getTime() - new Date(a.RequisitionDate).getTime());
      this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputListsFiltered.sort((a: any, b: any) => b.Orderslno.localeCompare(a.Orderslno));
    }
    else if (type === "samplecollected") {
      this.filterType = "";
      this.tabType = "samplecollected";
      this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputLists.filter((x: any) => x.IsBarCodePrint === 'True');
      this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputListsFiltered.sort((a: any, b: any) => new Date(b.RequisitionDate).getTime() - new Date(a.RequisitionDate).getTime());
      this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputListsFiltered.sort((a: any, b: any) => b.Orderslno.localeCompare(a.Orderslno));
      this.showSampleCollectedData = true;
      this.FetchLabWorklistData(4);
    }
    else if (type === "T") {
      if (this.tabType == "neworder") {
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputLists.filter((x: any) => (x.IsBarCodePrint === '' || x.IsBarCodePrint === 'False') && new Date(x.ReqDate) == new Date());
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputListsFiltered.sort((a: any, b: any) => new Date(b.RequisitionDate).getTime() - new Date(a.RequisitionDate).getTime());
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputListsFiltered.sort((a: any, b: any) => b.Orderslno.localeCompare(a.Orderslno));
        this.showSampleCollectedData = false;
      }
      else if (this.tabType == "samplecollected") {
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputLists.filter((x: any) => x.IsBarCodePrint === 'True' && new Date(x.ReqDate) == new Date());
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputListsFiltered.sort((a: any, b: any) => new Date(b.RequisitionDate).getTime() - new Date(a.RequisitionDate).getTime());
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputListsFiltered.sort((a: any, b: any) => b.Orderslno.localeCompare(a.Orderslno));
        this.showSampleCollectedData = true;
        //this.loadLabOrderData(this.FetchLabPhlebtomyDisplayOutputListsFiltered[0]);
        this.FetchLabWorklistData(4);
      }
    }
    else if (type === "W") {
      var week = new Date().getDate() - 7;
      if (this.tabType == "neworder") {
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputLists.filter((x: any) => (x.IsBarCodePrint === '' || x.IsBarCodePrint === 'False') && new Date(x.ReqDate) >= new Date(week));
        this.showSampleCollectedData = false;
      }
      else if (this.tabType == "samplecollected") {
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputLists.filter((x: any) => x.IsBarCodePrint === 'True' && new Date(x.ReqDate) >= new Date(week));
        this.showSampleCollectedData = true;
        //this.loadLabOrderData(this.FetchLabPhlebtomyDisplayOutputListsFiltered[0]);
        this.FetchLabWorklistData(7);
      }
    }
    else if (type === "M") {
      var month = new Date().setMonth(new Date().getMonth() - 1);
      if (this.tabType == "neworder") {
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputLists.filter((x: any) => (x.IsBarCodePrint === '' || x.IsBarCodePrint === 'False') && new Date(x.ReqDate) >= new Date(month));
        this.showSampleCollectedData = false;
      }
      else
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputLists.filter((x: any) => x.IsBarCodePrint === 'True' && new Date(x.ReqDate) >= new Date(month));

        this.FetchLabWorklistData(30);
    }
    else if (type === "A") {
      var month = new Date().setMonth(new Date().getMonth() - 1);
      if (this.tabType == "neworder") {
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputLists.filter((x: any) => (x.IsBarCodePrint === '' || x.IsBarCodePrint === 'False'));
        this.showSampleCollectedData = false;
      }
      else
        this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputLists.filter((x: any) => x.IsBarCodePrint === 'True');

        this.FetchLabWorklistData(0);
    }
  }

  selectedpatient(data: any) {
    this.samplecollected = false;
    this.porter = false;
    this.samplerecieved = false;
    this.sampleacknowledge = false;
    this.samplerecollect = false;
    this.barcodeprint = false;

    if (data.SampleCollectedAt) {
      this.samplecollected = true;
    }

    if (data.PorterReceivedBy) {
      this.porter = true;
    }

    if (data.SampleReceivedBy) {
      this.samplerecieved = true;
    }

    this.selecteddata = data;
    this.groupedData = this.groupedArray.filter((item: any) => item.SSN === data.SSN && item.ReqDate === data.ReqDate && item.Specialisation === data.Specialisation);
  }

  groupData() {
    const groupedData = _.groupBy(this.FetchLabPhlebtomyDisplayOutputLists, (item: any) => [item.SSN, item.ReqDate, item.Specialisation].join('$'));

    this.groupedArray = Object.keys(groupedData).map((key) => ({
      SSN: key.split('$')[0],
      ReqDate: key.split('$')[1],
      Specialisation: key.split('$')[2],
      items: groupedData[key],
      Tests: groupedData[key].filter((item) => item.groupclick).length > 0 ?
        groupedData[key].filter((item) => item.groupclick).map((item) => item.Test).join(', ') : groupedData[key].map((item) => item.Test).join(', ')
    }));
  }

  groupelement(data: any) {
    data.groupclick = !data.groupclick;
  }

  samplecollectionchange() {
    if (!this.samplecollected) {
      this.samplecollected = !this.samplecollected;
      this.saveenable = true;
    }
  }

  barcodeprintchange(data: any) {
    if (!this.barcodeprint) {
      this.barcodeprint = !this.barcodeprint;
      this.saveenable = true;
      this.suitconfig.FetchBarCodePrint(data.SampleNumber, "", "2", 0, this.wardID, this.hospitalId).subscribe((response) => {
        if (response.Code == 200) {
          this.trustedUrl = response.FTPPATH;
          $("#showLabReportsModal").modal('show');
        }
      },
        (err) => {

        })
    }
  }

  SaveSampleCollectionBarCodePrint(data: any) {
    var payload = {
      "BarCodePrintID": 0,
      "PatientID": this.selectedView.PatientID,
      "AdmissionID": this.admissionID,
      // "OrderID" : 0,
      // "OrderItemID" : 0,
      // "ItemID" : 0,
      "BarCodeXML": data,
      "PrintIngFrom": "LAB",
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "HospitalId": this.hospitalId
    }
    this.suitconfig.SaveSampleCollectionBarCodePrint(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.onchangeSSN();
        }
      },
      (err) => {
        console.log(err)
      });
  }

  samplerecollectchange() {
    if (!this.samplerecollect) {
      this.samplerecollect = !this.samplerecollect;
      this.saveenable = true;
    }
  }

  sampleacknowledgechange() {
    if (!this.sampleacknowledge) {
      this.sampleacknowledge = !this.sampleacknowledge;
      this.saveenable = true;
    }
  }

  samplerecievedchange() {
    if (!this.samplerecieved) {
      this.samplerecieved = !this.samplerecieved;
      this.saveenable = true;
    }
  }

  porterchange() {
    if (!this.porter) {
      this.porter = !this.porter;
      this.saveenable = true;
    }
  }

  ChangeTestOrderStatus(data: any) {
    var ItemXMLDetails: any[] = [];
    const hasTrueGroupClick = this.groupedData[0].items.some((element: any) => element.groupclick === true);
    this.groupedData[0].items.forEach((element: any, index: any) => {
      if (hasTrueGroupClick) {
        if (element.groupclick === true) {
          var item = {
            "ORD": element.TestOrderID,
            "ORDITM": element.TestOrderItemID,
            "STS": element.CurrentStatus,
            "SEQ": element.Sequence,
            "ROUTID": element.Routid,
            "RMK": "",
            "SampleCollect": this.samplecollected,
            "SampleAcknowledge": this.sampleacknowledge,
            "SampleRecollect": this.samplerecollect,
            "Status": element.CurrentStatus
          }
          ItemXMLDetails.push(item);
        }
      }
      else {
        var item = {
          "ORD": element.TestOrderID,
          "ORDITM": element.TestOrderItemID,
          "STS": element.CurrentStatus,
          "SEQ": element.Sequence,
          "ROUTID": element.Routid,
          "RMK": "",
          "SampleCollect": this.samplecollected,
          "SampleAcknowledge": this.sampleacknowledge,
          "SampleRecollect": this.samplerecollect,
          "Status": element.CurrentStatus
        }
        ItemXMLDetails.push(item);
      }
    });

    let payload = {
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "Hospitalid": this.hospitalId,
      "ItemXMLDetails": ItemXMLDetails
    }
    this.suitconfig.ChangeTestOrderStatus(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
        }
      },
      (err) => {
        console.log(err)
      });
  }

  UpdatePorterReceiveDetails(data: any) {
    var ItemXMLDetails: any[] = [];

    const hasTrueGroupClick = this.groupedData[0].items.some((element: any) => element.groupclick === true);

    this.groupedData[0].items.forEach((element: any, index: any) => {
      if (hasTrueGroupClick) {
        if (element.groupclick === true) {
          var item = {
            "TIID": element.TestOrderItemID
          };
          ItemXMLDetails.push(item);
        }
      } else {
        var item = {
          "TIID": element.TestOrderItemID
        };
        ItemXMLDetails.push(item);
      }
    });


    let payload = {
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "Hospitalid": this.hospitalId,
      "ItemXMLDetails": ItemXMLDetails
    }
    this.suitconfig.UpdatePorterReceiveDetails(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
        }
      },
      (err) => {
        console.log(err)
      });
  }

  UpdateSampleReceiveDetails(data: any) {
    var ItemXMLDetails: any[] = [];

    const hasTrueGroupClick = this.groupedData[0].items.some((element: any) => element.groupclick === true);

    this.groupedData[0].items.forEach((element: any, index: any) => {
      if (hasTrueGroupClick) {
        if (element.groupclick === true) {
          var item = {
            "TIID": element.TestOrderItemID,
          }
          ItemXMLDetails.push(item);
        }
      }
      else {
        var item = {
          "TIID": element.TestOrderItemID,
        }
        ItemXMLDetails.push(item);
      }
    });

    let payload = {
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "Hospitalid": this.hospitalId,
      "ItemXMLDetails": ItemXMLDetails
    }
    this.suitconfig.UpdateSampleReceiveDetails(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
        }
      },
      (err) => {
        console.log(err)
      });
  }

  SaveInfo(data: any) {
    this.ChangeTestOrderStatus(data);

    if (this.porter) {
      this.UpdatePorterReceiveDetails(data);
    }

    if (this.samplerecieved) {
      this.UpdateSampleReceiveDetails(data);
    }

    this.saveenable = false;

    setTimeout(() => {
      $("#quick_info").modal('hide');
      $("#savemsg").modal('show');
      this.onchangeSSN();
    }, 2000);
  }

  SaveSample() {
    var ItemXMLDetails: any[] = [];

    const hasTrueGroupClick = this.FetchLabPhlebtomyDisplayOutputLists.some((element: any) => element.groupclick === true);
    if (hasTrueGroupClick) {
      const ssnList = this.FetchLabPhlebtomyDisplayOutputLists.filter((item) => item.groupclick).map(item => item.SSN);
      const distinctSSNCount = new Set(ssnList).size;
      if (distinctSSNCount === 1) {
        this.FetchLabPhlebtomyDisplayOutputLists.filter((item) => item.groupclick).forEach((element: any, index: any) => {
          if (element.groupclick === true && !element.SampleNumber) {
            var item = {
              "ORD": element.TestOrderID,
              "ORDITM": element.TestOrderItemID,
              "STS": element.CurrentStatus,
              "SEQ": element.Sequence,
              "ROUTID": element.Routid,
              "RMK": "",
              "SampleCollect": true,
              "SampleAcknowledge": false,
              "SampleRecollect": false,
              "Status": element.CurrentStatus
            }
            ItemXMLDetails.push(item);
          }
        });

        let payload = {
          "UserID": this.doctorDetails[0].UserId,
          "WorkStationID": this.selectedView.PatientType == '4' ? '2147' : this.wardID,
          "Hospitalid": this.hospitalId,
          "ItemXMLDetails": ItemXMLDetails
        }
        this.suitconfig.ChangeTestOrderStatus(payload).subscribe(
          (response) => {
            if (response.Code == 200) {
              $("#savemsg").modal('show');
              this.onchangeSSN();
            }
          },
          (err) => {
            console.log(err)
          });
      }
    }
  }


  selectallsamples() {

    this.FetchLabPhlebtomyDisplayOutputLists.forEach((element: any, index: any) => {
      if (element.groupclick)
        element.groupclick = false;
      else
        element.groupclick = true;
    });

    // else {
    //   this.FetchLabPhlebtomyDisplayOutputLists.forEach((element: any, index: any) => {
    //     element.groupclick = false;

    //   });
    // }
    this.selectall = !this.selectall;

  }

  clear() {
    this.isNational = false;
    this.showSampleCollectedData = false;
    this.FetchLabPhlebtomyDisplayOutputListsFiltered = [];
    // this.SSNNumber = '';
    // this.BarCode = '';
    this.FetchLabPhlebtomyDisplayOutputLists = [];

  }
  OrderItemWiseBarCodePrint(orderItem: any) {
    
    var patientType = "0";
    var testOrder = this.FetchLabPhlebtomyDisplayOutputLists.filter((x: any) => x.TestOrderID === orderItem.TestOrderID && x.SpecialiseID === orderItem.SpecialiseID && x.SampleNumber != '' && x.SampleNumber != null);
    if (testOrder.filter((f: any) => f.SampleNumber != "" && f.SampleNumber != null).length > 0) {
      this.enableSave = true;
      testOrder.forEach((element: any, index: any) => {
        if (element.Selected) {
          element.Selected = false;
        }
        else {
          element.Selected = true;
        }
      });
    }
    else {
      $("#validateSampleNumberMsg").modal('show');

    }
  }

  printBarcodes() {
    var sampleNos = "";
    var barcodePrintXml: any[] = []
    this.FetchLabPhlebtomyDisplayOutputLists.forEach((element: any, index: any) => {
      if (element.Selected) {
        if (sampleNos != "")
          sampleNos = sampleNos + "," + element.SampleNumber;
        else
          sampleNos = element.SampleNumber;

        barcodePrintXml.push({
          OID: element.TestOrderID,
          OIID: element.TestOrderItemID,
          IID: element.TestId,
          BARCODE: "Sample Collection"
        })
      }
    });
    var patientType = "0";
    if (sampleNos != "") {
      this.suitconfig.FetchBarCodePrint(sampleNos, patientType, 1, 0, this.wardID, this.hospitalId).subscribe((response) => {
        if (response.Code == 200) {
          if (response.FTPPATH != "") {
            //window.open(response.FTPPATH);
            this.trustedUrl = response.FTPPATH;
            this.SaveSampleCollectionBarCodePrint(barcodePrintXml);
            $("#showLabReportsModal").modal('show');
          }
        }
      },
        (err) => {

        })
    }
    else {
      $("#validateSampleNumberMsg").modal('show');
    }
  }

  openQuickActions() {
    this.patinfo = this.patientDetails;
    $("#quickaction_info").modal('show');
  }
  clearPatientInfo() {
    this.patinfo = "";
  }
  closeModal() {
    $("#quickaction_info").modal('hide');
  }

  filterFunction(wrklstData: any, SpecId: any, TestOrderID: any) {
    return wrklstData.filter((x: any) => x.SpecialiseID == SpecId && x.TestOrderID === TestOrderID);
  }

  FetchLabWorklistData(days: number) {
    var frmdt = new Date();
    frmdt.setDate(frmdt.getDate() - days);
    var FromDate = this.datepipe.transform(frmdt, "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();

    let payload =
    {
      "min": 1,
      "max": 10,
      "OrderType": 0,
      "SSN": this.selectedView.SSN,
      "MobileNo": "",
      "SampleNumber": null,
      "FromDate": FromDate,
      "ToDate": ToDate,
      "PatientType": this.selectedView.PatientType,
      "Type": "4",
      "CollectedDateBased": "0",
      "SpecimenIDs": "",
      "intUserId": this.doctorDetails[0].UserId,
      "intWorkstationId": this.wardID,
      "HospitalID": this.hospitalId
    }
    this.suitconfig.fetchLabWorklistDataDisplay(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.selectedPatientData = response.FetchLabWorklistDisplayOutputLists[0];
        const smplClctd = response.FetchLabWorklistDisplayOutputLists.filter((x:any) => Number(x.Status) >= 3);
        const testOrderids = smplClctd.map((item: any) => item.TestOrderID).join(',');
        this.loadLabOrderDataSamples(this.selectedPatientData?.PatientID, testOrderids);        
      }
    },
      (err) => {

      })
  }

  loadLabOrderDataSamples(patientId: any, testOrderids: any) {
    this.specialisationWiseFilteredOrderDetails = [];
    this.suitconfig.FetchLabOrderDetailsNN(patientId, testOrderids, this.doctorDetails[0].UserId, this.wardID, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        this.enableSave = false;
        this.labOrderData = response.FetchLabOrderDetailsOutputLists;
        this.specialisationWiseFilteredOrderDetails = this.labOrderData;
        this.specialisationWiseFilteredOrderDetails.forEach((element: any, index: any) => {
          element.Class = "d-flex";
          element.Selected = false;
        });
        this.labOrderData.forEach((element: any, index: any) => {
          if (Number(element.Status) >= 4)
            element.SampleCollectedClass = "collected text-center custom_tooltip custom_tooltip_left active";
          else
            element.SampleCollectedClass = "collected_barcode text-center custom_tooltip custom_tooltip_left";

          if (element.Status == "-1")
            element.SampleReCollectedClass = "collected text-center custom_tooltip custom_tooltip_left active";
          else
            element.SampleReCollectedClass = "collected_barcode text-center custom_tooltip custom_tooltip_left";

          element.BarCodeClass = "collected_barcode text-center custom_tooltip custom_tooltip_left";
          element.SampleStatus = parseInt(element.Status);
        });
        this.specialisationWiseFilteredOrderDetails = this.specialisationWiseFilteredOrderDetails1 = this.specialisationWiseFilteredOrderDetails.sort((a: any, b: any) => new Date(b.SampleCollectedAt).getTime() - new Date(a.SampleCollectedAt).getTime());
      }
    },
      (err) => {

      })
  }

  loadLabOrderData(samples: any) {
    this.specialisationWiseFilteredOrderDetails = [];
    samples.forEach((wrk: any) => {
      this.suitconfig.fetchLabOrderDetails(wrk.TestOrderID, this.doctorDetails[0].UserId, this.wardID, this.hospitalId).subscribe((response) => {
        if (response.Code == 200) {
          this.enableSave = false;
          this.labOrderData = response.FetchLabOrderDetailsOutputLists;
  
          // const distinctThings = response.FetchLabOrderDetailsOutputLists.filter(
          //   (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.SpecialiseID === thing.SpecialiseID) === i);
          // console.dir(distinctThings);
          //this.specialisationWiseFilteredOrderDetails = distinctThings;
          this.specialisationWiseFilteredOrderDetails.push(this.labOrderData[0]);
          // this.specialisationWiseFilteredOrderDetails="";
          // if(response.FetchLabOrderDetailsOutputLists.length>0){
          //   this.specialisationWiseFilteredOrderDetailsdrugDataArray.push(this.labOrderData[0]);
          //   this.specialisationWiseFilteredOrderDetails=this.specialisationWiseFilteredOrderDetailsdrugDataArray;
          // }
          
         // this.specialisationWiseFilteredOrderDetails=
          this.specialisationWiseFilteredOrderDetails.forEach((element: any, index: any) => {
            element.Class = "d-flex";
            element.Selected = false;
          });
          this.labOrderData.forEach((element: any, index: any) => {
            if (Number(element.Status) >= 4)
              element.SampleCollectedClass = "collected text-center custom_tooltip custom_tooltip_left active";
            else
              element.SampleCollectedClass = "collected_barcode text-center custom_tooltip custom_tooltip_left";
  
            if (element.Status == "-1")
              element.SampleReCollectedClass = "collected text-center custom_tooltip custom_tooltip_left active";
            else
              element.SampleReCollectedClass = "collected_barcode text-center custom_tooltip custom_tooltip_left";
  
            element.BarCodeClass = "collected_barcode text-center custom_tooltip custom_tooltip_left";
            element.SampleStatus = parseInt(element.Status);
          });
        }
      },
        (err) => {
  
        })
    });
    
  }
  ChangeLabTestOrderSampleAckStatus(data: any, status: any) {
    this.enableSave = true;
    var testOrder = this.labOrderData.filter((x: any) => x.TestOrderID === data.TestOrderID && x.SpecialiseID === data.SpecialiseID);
    if (testOrder.filter((f: any) => f.SampleNumber != "" && f.SampleNumber != null).length > 0) {
      testOrder.forEach((element: any, index: any) => {
        //if (element.SampleCollectedClass == "collected text-center custom_tooltip custom_tooltip_left" && element.STATUS != "4") {
          if (Number(element.STATUS) === 3) {
          element.SampleCollectedClass = "collected text-center custom_tooltip custom_tooltip_left active";
          element.Status = data.Status;
          element.SampleAckSelected = true;
        }
        else {
          element.SampleCollectedClass = "collected text-center custom_tooltip custom_tooltip_left";
          element.Status = data.Status;
          element.SampleAckSelected = false;
        }
      });
      var unackFilter = this.labOrderData.filter((f: any) => f.SampleAckSelected == false);
      if (unackFilter.length > 0) {
        this.unAcknowledgeRemarksFor = unackFilter[0].Specialisation;
        this.unAcknowledgeRemarksTestOrderDetails = unackFilter;
        $('#unAcktRem').val('');
        $("#unAcknowledgeRemarks").modal('show');
      }
      this.saveSampleAcknowledge();
    }
    else {
      $("#validateSampleNumberMsg").modal('show');
    }
  }

  ChangeLabTestOrderSampleRecollecteStatus(data: any, status: any) {
    this.enableSave = true;
    var testOrder = this.labOrderData.filter((x: any) => x.TestOrderID === data.TestOrderID && x.SpecialiseID === data.SpecialiseID);
    if (testOrder.filter((f: any) => f.SampleNumber != "" && f.SampleNumber != null).length > 0) {
      testOrder.forEach((element: any, index: any) => {
        if (element.SampleReCollectedClass == "collected text-center custom_tooltip custom_tooltip_left" && element.STATUS != "-1") {
          element.SampleReCollectedClass = "collected text-center custom_tooltip custom_tooltip_left active";
          element.Status = data.Status;
          element.SampleRecollectSelected = true;
        }
        else {
          element.SampleReCollectedClass = "collected text-center custom_tooltip custom_tooltip_left";
          element.Status = data.Status;
          element.SampleRecollectSelected = false;
        }
      });
      this.reCollectRemarksFor = data.Specialisation;
      this.reCollectRemarksTestOrderDetails = testOrder;
      $('#reCollectRem').val('');
      $("#reCollectRemarks").modal('show');
    }
    else {
      $("#validateSampleNumberMsg").modal('show');
    }
  }
  navigateToLabResultEntry(testdata: any) {
    if (Number(testdata.STATUS) >= 4) {
      sessionStorage.setItem("FromBedBoard", "true");
      sessionStorage.setItem("selectedPatientData", JSON.stringify(this.selectedPatientData));
      sessionStorage.setItem("selectedPatientLabData", JSON.stringify(testdata));
      this.router.navigate(['/suit/lab-resultentry']);
    }
    else {
      $("#validationResultEntryMsg").modal('show');
    }
  }

  saveSampleAcknowledge() {
    var ItemXMLDetails: any[] = [];
    this.labOrderData.forEach((element: any, index: any) => {
      if (element.SampleAckSelected) {
        var item = {
          "ORD": element.TestOrderID,
          "ORDITM": element.TestOrderItemID,
          "STS": element.STATUS,
          "SEQ": element.Sequence,
          "ROUTID": element.RoutID,
          "RMK": element.SampleUnAcknowledgeRemarks,
          "IsSampleUnAck": element.SampleUnAcknowledgeRemarks != '' && element.SampleUnAcknowledgeRemarks != undefined ? true : false,
          "SampleCollect": true,
          "SampleAcknowledge": true,
          "SampleRecollect": false,
          "SampleRejected": false,
          "Status": element.STATUS
        }
        ItemXMLDetails.push(item);
        this.showRecollect = false;
      }
      else if (element.SampleUnAcknowledge) {
        var item2 = {
          "ORD": element.TestOrderID,
          "ORDITM": element.TestOrderItemID,
          "STS": element.STATUS,
          "SEQ": element.Sequence,
          "ROUTID": element.RoutID,
          "RMK": element.SampleUnAcknowledgeRemarks,
          "IsSampleUnAck": true,
          "SampleCollect": true,
          "SampleAcknowledge": false,
          "SampleRecollect": false,
          "SampleRejected": false,
          "Status": element.STATUS
        }
        ItemXMLDetails.push(item2);
        this.showRecollect = false;
      }
      else if (!element.SampleAckSelected && element.SampleRecollectSelected) {
        var item1 = {
          "ORD": element.TestOrderID,
          "ORDITM": element.TestOrderItemID,
          "STS": element.STATUS,
          "SEQ": element.Sequence,
          "ROUTID": element.RoutID,
          "RMK": element.SampleRecollectRemarks,
          "SampleCollect": true,
          "SampleAcknowledge": true,
          "SampleRecollect": true,
          "SampleRejected": false,
          "Status": element.STATUS
        }
        ItemXMLDetails.push(item1);
        this.showRecollect = true;
      }
    });
    if (ItemXMLDetails.length > 0) {
      let payload = {
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.wardID,
        "Hospitalid": this.hospitalId,
        "ItemXMLDetails": ItemXMLDetails
      }
      this.suitconfig.ChangeLabTestOrderStatus(payload).subscribe(
        (response) => {
          if (response.Code == 200) {
            if (this.showRecollect == true)
              this.validationMsg = "Recollect Successfully";
            else
              this.validationMsg = "Sample Acknowledged Successfully";
            $("#sampleAckSuccessMsg").modal('show');
          }
        },
        (err) => {
          console.log(err)
        });
    }
  }
  saveUnAcknowledgeRemarks(unackRem: any) {
    if ($('#unAcktRem').val() != '') {
      var testOrder = this.labOrderData.filter((x: any) => x.TestOrderID === this.unAcknowledgeRemarksTestOrderDetails[0].TestOrderID && x.SpecialiseID === this.unAcknowledgeRemarksTestOrderDetails[0].SpecialiseID);
      testOrder.forEach((element: any, index: any) => {
        element.SampleUnAcknowledgeRemarks = $('#unAcktRem').val();
        element.SampleUnAcknowledge = true;
      });
    }
  }
  saveReCollectRemarks(reCollectRem: any) {
    if ($('#reCollectRem').val() != '') {
      var testOrder = this.labOrderData.filter((x: any) => x.TestOrderID === this.reCollectRemarksTestOrderDetails[0].TestOrderID && x.SpecialiseID === this.reCollectRemarksTestOrderDetails[0].SpecialiseID);
      testOrder.forEach((element: any, index: any) => {
        element.SampleRecollectRemarks = $('#reCollectRem').val();
      });
    }
  }
  closeReCollectRemarksPopup() {
    var testOrder = this.labOrderData.filter((x: any) => x.TestOrderID === this.reCollectRemarksTestOrderDetails[0].TestOrderID && x.SpecialiseID === this.reCollectRemarksTestOrderDetails[0].SpecialiseID);
    if (testOrder.filter((f: any) => f.SampleNumber != "" && f.SampleNumber != null).length > 0) {
      testOrder.forEach((element: any, index: any) => {
        element.SampleReCollectedClass = "collected text-center custom_tooltip custom_tooltip_left";
        element.SampleRecollectSelected = false;
      });
    }
  }

  closeUnAckRemarksPopup() {
    var testOrder = this.labOrderData.filter((x: any) => x.TestOrderID === this.unAcknowledgeRemarksTestOrderDetails[0].TestOrderID && x.SpecialiseID === this.unAcknowledgeRemarksTestOrderDetails[0].SpecialiseID);
    if (testOrder.filter((f: any) => f.SampleNumber != "" && f.SampleNumber != null).length > 0) {
      testOrder.forEach((element: any, index: any) => {
        element.SampleCollectedClass = "collected text-center custom_tooltip custom_tooltip_left";
        element.SampleAckSelected = false;
      });
    }
  }
  clearReCollectRemarks() {
    $('#reCollectRem').val('');
  }

  showVisitSummary(view: any) {
    this.config.FetchPatientCaseRecord(this.admissionID, this.selectedView.PatientID, 0, 3000, this.doctorDetails[0]?.UserId, this.wardID, this.hospitalId)
    .subscribe((response: any) => {
      if (response.Code == 200) {
          //window.open(response.FTPPATH);
          this.trustedUrl = response?.FTPPATH;         
          $("#showLabReportsModal").modal('show');
        }
    },
      (err) => {

      })
  }
  showHistory(view: any) {
    this.testandSpecialisation = view.Specialisation + '-' + view.Test;
    this.suitconfig.fetchLabOrderSummary(view.TestID, view.TestOrderID, view.TestOrderItemID, this.doctorDetails[0].UserId, this.wardID, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        this.testHistory = response.FetchLabOrderSummaryOutputLists;
      }
    },
      (err) => {

      })
  }

  barCodePrintForSampleCollected(item:any) {
    this.suitconfig.FetchBarCodePrint(item.SampleNumber, 2, 1, 0, this.wardID, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        if (response.FTPPATH != "") {
          //window.open(response.FTPPATH);
          this.trustedUrl = response.FTPPATH;
          $("#showLabReportsModal").modal('show');
        }
      }
    },
      (err) => {

      })
  }

  filterNewOrders(event: any) {
    if(this.tabType === 'neworder') {
    if(event.target.value === '') {
      this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputListsFiltered1;
    }
    else {
      this.FetchLabPhlebtomyDisplayOutputListsFiltered = this.FetchLabPhlebtomyDisplayOutputListsFiltered1.filter((x: any) =>
        x.Test.toLowerCase().includes(event.target.value.toLowerCase().trim())
      );
    }
  }
  else {
    if(event.target.value === '') {
      this.specialisationWiseFilteredOrderDetails = this.specialisationWiseFilteredOrderDetails1;
    }
    else {
      this.specialisationWiseFilteredOrderDetails = this.specialisationWiseFilteredOrderDetails1.filter((x: any) =>
        x.Test.toLowerCase().includes(event.target.value.toLowerCase().trim())
      );
    }
  }
  }

  selectTestForBarCode(test: any) {
    test.selectedTest = !test.selectedTest;

  }

  individualBarcodePrint() {
    const items = this.labOrderData.filter((x:any) => x.selectedTest);
    if(items.length === 0) {
      this.errorMsg = "Please select any sample to print Barcode";
      $('#errorMsg').modal('show');
      return;
    }
    var sampleNos = ""; var testirderitemids = "";
    this.labOrderData.forEach((element: any, index: any) => {
      if (element.selectedTest) {
        if (sampleNos != "") {
          sampleNos = sampleNos + "," + element.SampleNumber;
        }
        else {
          sampleNos = element.SampleNumber;
        }
        if (testirderitemids != "") {
          testirderitemids = testirderitemids + "," + element.TestOrderItemID;
        }
        else {
          testirderitemids = element.TestOrderItemID;
        }
      }
    });
    
    if (sampleNos != "") {
      this.suitconfig.FetchBarCodePrintSingle(testirderitemids, sampleNos, "2", 1, 0, this.hospitalId).subscribe((response) => {
        if (response.Code == 200) {
          if (response.FTPPATH != "") {
            //window.open(response.FTPPATH);
            this.trustedUrl = response.FTPPATH;
            $("#showLabReportsModal").modal('show');
          }
        }
      },
        (err) => {

        })
    }
    else {
      $("#validateSampleNumberMsg").modal('show');
    }
 
  }

  getPrescriptionRemarks(wrkdet: any) {
    let remarks = "";
    const testOrderItem = this.FetchLabPhlebtomyDisplayOutputLists.find((x: any) => x.TestOrderItemID === wrkdet.TestOrderItemID);
    if(testOrderItem) {
      remarks = testOrderItem.PrescriptionRemarks;
    }
    return remarks;
  }

}
