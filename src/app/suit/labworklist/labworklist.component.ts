import { Component, OnInit } from '@angular/core';
import { SuitConfigService } from '../services/suitconfig.service';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { sample } from 'lodash';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientfolderComponent } from 'src/app/shared/patientfolder/patientfolder.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { CommonService } from 'src/app/shared/common.service';
import { SpecimenRejectionComponent } from 'src/app/templates/specimen-rejection/specimen-rejection.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { PatientfoldermlComponent } from 'src/app/shared/patientfolderml/patientfolderml.component';
import { map, Observable, startWith } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-labworklist',
  templateUrl: './labworklist.component.html',
  styleUrls: ['./labworklist.component.scss'],
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
export class LabworklistComponent implements OnInit {
  langData: any;
  hospitalId: any;
  labWorklistData: any;
  labWorklistDataF: any;
  loggedinUserDetails: any;
  labOrderData: any;
  classEd: string = "fs-7 btn selected";
  classIp: string = "fs-7 btn";
  classOp: string = "fs-7 btn";
  selectedPatientType = "1";
  worklistCount: number = 0;
  minValue: number = 1;
  maxValue: number = 10;
  selectedPatientData: any;
  specialisationWiseFilteredOrderDetails: any;
  patientTypeSelectedClass: string = "fs-7 btn";
  tablePatientsForm!: FormGroup;
  patientSelected: boolean = false;
  trustedUrl: any;
  testHistory: any[] = [];
  reCollectRemarks: any;
  reCollectRemarksTestOrderDetails: any;
  reCollectRemarksFor: any;
  unAcknowledgeRemarksFor: any;
  unAcknowledgeRemarksTestOrderDetails: any;
  enableSave: boolean = false;
  testandSpecialisation: any;
  showAllergydiv: boolean = false;
  validationMsg: string = "";
  showRecollect: boolean = false;
  number = Number;
  showNoRecFound: boolean = true;
  ValidationMsgg: any = "No Orders for the Day";
  facility: any;
  sortedGroupedByOrderDate: any = [];
  errorMsg: any;
  FetchUserFacilityDataList: any;
  wardID: any;
  ward: any;
  refreshHeader = true;
  showRejectedSamplesOnly: boolean = false;
  labOrderFullData: any;
  enableSampleRecollectSave: boolean = false;
  allBarCodeSelect: boolean = false;
  labSpecimens: any = [];
  selectedSpecimens: any = [];
  specimenSearchText: any = '';
  filteredSpecimens: Observable<any> | undefined;

  specimenSearchCtrl = new FormControl('');

  constructor(private common: CommonService, private bedconfig: BedConfig, private config: SuitConfigService, private router: Router, private configService: ConfigService, public datepipe: DatePipe, private fb: FormBuilder, private modalService: NgbModal, private us: UtilityService, private ms: GenericModalBuilder) {
    this.langData = this.configService.getLangData();
    this.loggedinUserDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
  }

  fetchUserFacility() {
    this.bedconfig.fetchUserFacility(this.loggedinUserDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserFacilityDataList;
      },
        (err) => {
        })

  }

  ngOnInit(): void {
    this.fetchUserFacility();
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.initializetablePatientsForm();
    const pattype = sessionStorage.getItem("LabWrklstSelectedPatType")?.toString();
    if (pattype != undefined)
      this.selectedPatientType = pattype != "" ? pattype : "1";
    const datefilter = sessionStorage.getItem("LabWrklstSelectedFilter")?.toString();
    if (datefilter != undefined && datefilter != "")
      this.fetchPanicwithdates(datefilter);

    if (sessionStorage.getItem('navigateToLabWorklist')) {
      let navFromDate = sessionStorage.getItem('navigateToLabWorklist')?.split('|')[1] || new Date();
      let navToDate = sessionStorage.getItem('navigateToLabWorklist')?.split('|')[2] || new Date();
      const SSN = sessionStorage.getItem('navigateToLabWorklist')?.split('|')[0];
      $('#NationalId').val(SSN);
      this.tablePatientsForm.patchValue({
        FromDate: new Date(navFromDate),
        ToDate: new Date(navToDate)
      })
      sessionStorage.removeItem('navigateToLabWorklist');
    }

    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;

    this.FetchLabWorklistData(false);
    this.fetchLabSpecimen();

    this.filteredSpecimens = this.specimenSearchCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string | null): any[] {
    const filterValue = (value || '').toLowerCase();
    return this.labSpecimens.filter((specimen: any) =>
      specimen.Name.toLowerCase().includes(filterValue)
    );
  }

  selectFacility() {
    if (this.FetchUserFacilityDataList) {
      const selectedItem = this.FetchUserFacilityDataList.find((value: any) => value.FacilityID === this.wardID);
      sessionStorage.setItem("facility", JSON.stringify(selectedItem));
      this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
      this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
      this.wardID = this.ward.FacilityID;
      this.refreshHeader = false;
      this.FetchLabWorklistData(false);

      setTimeout(() => {
        this.refreshHeader = true;
      }, 0);
    }
  }

  initializetablePatientsForm() {
    this.tablePatientsForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });

    var wm = new Date();
    var d = new Date();
    //wm.setMonth(wm.getMonth() - 1);   
    d.setDate(d.getDate());
    this.tablePatientsForm.patchValue({
      FromDate: wm,
      ToDate: d
    })
  }

  fetchPanicwithdates(filter: any) {
    if (filter === "M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 1);
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "3M") {

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 3);
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "6M") {

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 6);
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "1Y") {

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 12);
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "W") {

      var d = new Date();
      d.setDate(d.getDate() - 7); // Subtract 7 days for the past week.
      var wm = d;
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "T") {
      var d = new Date();
      d.setDate(d.getDate());
      var wm = d;
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    else if (filter === "Y") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      this.tablePatientsForm.patchValue({
        FromDate: d,
        ToDate: d,
      });
    }
    sessionStorage.setItem("LabWrklstSelectedFilter", filter);
    this.FetchLabWorklistData(false);
  }

  FetchLabWorklistDataDisplay(patientType: string) {
    if (patientType == "3")
      this.selectedPatientType = "3";
    else if (patientType == "2")
      this.selectedPatientType = "2";
    else if (patientType == "1")
      this.selectedPatientType = "1";
    sessionStorage.setItem("LabWrklstSelectedPatType", patientType);
    this.FetchLabWorklistData(false);
  }

  onSSNEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.patientSelected = false;
      this.FetchLabWorklistData(true);
    }
  }

  FetchLabWorklistData(search: boolean) {
    this.enableSampleRecollectSave = false;
    var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();

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

    let payload =
    {
      "min": this.minValue,
      "max": this.maxValue,
      "OrderType": 0,
      "SSN": $('#NationalId').val() != "" && $('#NationalId').val() != undefined ? $('#NationalId').val() : "",
      "MobileNo": $('#MobileNo').val() != "" && $('#MobileNo').val() != undefined ? $('#MobileNo').val() : "",
      "SampleNumber": $('#Barcode').val() != "" && $('#Barcode').val() != undefined ? $('#Barcode').val() : null,
      "FromDate": FromDate,
      "ToDate": ToDate,
      "PatientType": this.selectedPatientType,
      "Type": "4",
      "CollectedDateBased": "0",
      "SpecimenIDs": this.selectedSpecimens.length > 0 ? this.selectedSpecimens.map((e: any) => e.ID).join(',') : '',
      "intUserId": this.loggedinUserDetails[0].UserId,
      "intWorkstationId": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalId
    }

    this.config.fetchLabWorklistDataDisplay(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.labWorklistData = response.FetchLabWorklistDisplayOutputLists;
        this.worklistCount = response.FetchLabWorklistDisplaycOutputLists[0].TCount;
        this.labWorklistData.forEach((element: any, index: any) => {
          element.Class = "worklist_card gx-2 p-2 rounded-2 mx-0 row";
          element.Selected = false;

          if (element.Status === "1")
            element.AClass = "NewRequest";
          if (element.Status === "3")
            element.AClass = "SampleCollected";
          if (element.Status === "4")
            element.AClass = "SampleAck";
          if (element.Status === "7")
            element.AClass = "ResultEntered";
          if (element.Status === "8")
            element.AClass = "ResultVerified";
          if (element.Status === "13")
            element.AClass = "SampleRejected";
          if (element.Status === "12")
            element.AClass = "PartialSampleCollected";
          if (element.Status === "-1")
            element.AClass = "TestRecollect";

        });
        this.labWorklistDataF = this.labWorklistData;

        if (this.showRejectedSamplesOnly) {
          this.labWorklistData = this.labWorklistData.filter((element: any) => element.IsSpecimenRejForm == '1');
        }

        const groupedByOrderDate = this.labWorklistData.reduce((acc: any, current: any) => {
          const OrderDate = current.OrderDate.split(' ')[0];
          if (!acc[OrderDate]) {
            acc[OrderDate] = [];
          }
          acc[OrderDate].push(current);

          return acc;
        }, {});

        this.sortedGroupedByOrderDate = Object.entries(groupedByOrderDate)
          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
          .map(([OrderDate, items]) => ({ OrderDate, items }));

        if (this.labWorklistDataF.length > 0) {
          this.showNoRecFound = false;
        }
        else {
          this.showNoRecFound = true;
        }
      }
    },
      (err) => {

      })
  }

  clearSearchCriteria() {
    this.enableSampleRecollectSave = false;
    $('#Barcode').val('');
    $('#NationalId').val('');
    $('#MobileNo').val('');
    this.patientSelected = false;
    this.showRejectedSamplesOnly = false;
    this.selectedSpecimens = [];
    this.labSpecimens?.forEach((item: any) => {
      item.selected = false;
    });
    this.specimenSearchCtrl.setValue('');
    this.FetchLabWorklistData(false);
  }

  loadPreviousPageWorklistData() {
    if (this.minValue != 1) {
      this.minValue = this.minValue - 10;
      this.maxValue = this.maxValue - 10;
      this.FetchLabWorklistData(false);
    }
  }

  loadNextPageWorklistData() {
    if (Number(this.worklistCount) >= Number(this.maxValue)) {
      this.minValue = this.minValue + 10;
      this.maxValue = this.maxValue + 10;
      this.FetchLabWorklistData(false);
    }
  }

  loadLabOrderData(wrk: any) {
    this.labWorklistData.forEach((element: any, index: any) => {
      if (element.TestOrderID == wrk.TestOrderID && element.Class == "worklist_card gx-2 p-2 rounded-2 mx-0 row") {
        element.Class = "worklist_card gx-2 p-2 rounded-2 mx-0 row active";
      }
      else {
        element.Class = "worklist_card gx-2 p-2 rounded-2 mx-0 row";
      }
    });
    this.selectedPatientData = wrk;
    this.selectedPatientData.expand = !this.selectedPatientData.expand;
    if (this.selectedPatientData.expand) {

      this.config.fetchLabOrderDetails(wrk.TestOrderID, this.loggedinUserDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
        if (response.Code == 200) {
          this.enableSave = false;
          this.labOrderData = response.FetchLabOrderDetailsOutputLists;

          const distinctThings = response.FetchLabOrderDetailsOutputLists.filter(
            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.SpecialiseID === thing.SpecialiseID) === i);
          this.specialisationWiseFilteredOrderDetails = distinctThings;
          this.specialisationWiseFilteredOrderDetails.forEach((element: any, index: any) => {
            element.Class = "d-flex";
            element.Selected = false;
          });
          this.labOrderData.forEach((element: any, index: any) => {

            if (element.IsSpecimenRejForm == '1')
              element.IsSpecimenRejForm = true;
            else
              element.IsSpecimenRejForm = false;

            if (Number(element.Status) >= 4)
              element.SampleCollectedClass = "collected text-center custom_tooltip custom_tooltip_left active";
            else
              element.SampleCollectedClass = "collected text-center custom_tooltip custom_tooltip_left";

            if (element.Status == "-1")
              element.SampleReCollectedClass = "collected text-center custom_tooltip custom_tooltip_left active";
            else
              element.SampleReCollectedClass = "collected text-center custom_tooltip custom_tooltip_left";

            element.BarCodeClass = "collected text-center custom_tooltip custom_tooltip_left";
            element.SampleStatus = parseInt(element.Status);
          });
          this.labOrderFullData = [...this.labOrderData];
          if (this.showRejectedSamplesOnly) {
            this.labOrderData = this.labOrderFullData.filter((element: any) => element.IsSpecimenRejForm);
          }
          this.patientSelected = true;
        }
      },
        (err) => {

        })
    }
  }

  filterFunction(wrklstData: any, SpecId: any) {
    return wrklstData.filter((buttom: any) => buttom.SpecialiseID == SpecId);
  }

  filterLabOrder(wrk: any) {

    const sampleNo = $("#Barcode").val();
    if (sampleNo != '') {
      return this.labOrderData?.filter((x: any) => x.TestOrderID === wrk.TestOrderID && x.SampleNumber === sampleNo);
    }
    return this.labOrderData?.filter((x: any) => x.TestOrderID === wrk.TestOrderID);
  }

  openAllergyPopup() {
    this.showAllergydiv = true;
  }

  selectSample(wrkdet: any) {
    if (wrkdet.Class == "d-flex") {
      wrkdet.Class = "d-flex active";
      wrkdet.Selected = true;
    }
    else {
      wrkdet.Class = "d-flex";
      wrkdet.Selected = false;
    }
  }

  printBarcodes() {
    var sampleNos = "";
    this.labOrderData.forEach((element: any, index: any) => {
      if (element.Selected) {
        if (sampleNos != "")
          sampleNos = sampleNos + "," + element.SampleNumber;
        else
          sampleNos = element.SampleNumber;
      }
    });
    var patientType = "1,3,4";
    if (this.selectedPatientType == "2") {
      patientType = "2";
    }
    else if (this.selectedPatientType == "3") {
      patientType = "3";
    }
    else {
      patientType = "1,3,4";
    }
    if (sampleNos != "") {
      this.config.FetchBarCodePrint(sampleNos, patientType, 1, 0, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
        if (response.Code == 200) {
          if (response.FTPPATH != "") {
            //window.open(response.FTPPATH);
            this.trustedUrl = response.FTPPATH;
            $("#showLabReportsModal1").modal('show');
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

  OrderItemWiseBarCodePrint(orderItem: any) {
    this.enableSave = true;
    var patientType = "1,3,4";
    if (this.selectedPatientType == "2") {
      patientType = "2";
    }
    else if (this.selectedPatientType == "3") {
      patientType = "3";
    }
    else {
      patientType = "1,3,4";
    }
    var testOrder = this.labOrderData.filter((x: any) => x.TestOrderID === orderItem.TestOrderID && x.TestOrderItemID === orderItem.TestOrderItemID && x.SpecialiseID === orderItem.SpecialiseID);
    if (testOrder.filter((f: any) => f.SampleNumber != "" && f.SampleNumber != null).length > 0) {
      testOrder.forEach((element: any, index: any) => {
        if (element.BarCodeClass == "collected text-center custom_tooltip custom_tooltip_left") {
          element.BarCodeClass = "collected text-center custom_tooltip custom_tooltip_left active";
          element.Selected = true;
        }
        else {
          element.BarCodeClass = "collected text-center custom_tooltip custom_tooltip_left";
          element.Selected = false;
        }
      });
    }
    else {
      $("#validateSampleNumberMsg").modal('show');

    }

  }


  filterLabOrdersData() {
    if ($('#Barcode').val() != '' && $('#Barcode').val() != undefined) {
      this.labWorklistData = this.labWorklistData.filter((x: any) => x.SampleNumber == $('#Barcode').val());
    }
    if ($('#NationalId').val() != '' && $('#NationalId').val() != undefined) {
      this.labWorklistData = this.labWorklistData.filter((x: any) => x.SSN == $('#NationalId').val());
    }
    if ($('#MobileNo').val() != '' && $('#MobileNo').val() != undefined) {
      this.labWorklistData = this.labWorklistData.filter((x: any) => x.mobileno == $('#MobileNo').val());
    }
    this.patientSelected = false;
  }

  sortLabOrderData(event: any) {
    if (event.target.value == "1") {
      this.labWorklistData.sort(function (a: any, b: any) {
        if (a.DocName < b.DocName) { return -1; }
        if (a.DocName > b.DocName) { return 1; }
        return 0;
      });
    }
    else if (event.target.value == "2") {
      this.labWorklistData.sort(function (a: any, b: any) {
        if (a.Specialization < b.Specialization) { return -1; }
        if (a.Specialization > b.Specialization) { return 1; }
        return 0;
      });
    }
    else if (event.target.value == "3") {
      this.labWorklistData.sort(function (a: any, b: any) {
        if (a.Priority < b.Priority) { return -1; }
        if (a.Priority > b.Priority) { return 1; }
        return 0;
      });
    }
    else {
      this.labWorklistData.sort(function (a: any, b: any) {
        if (a.DocName < b.DocName) { return -1; }
        if (a.DocName > b.DocName) { return 1; }
        return 0;
      });
    }

  }

  isAcknowldgeDisable(wrk: any) {
    const items = this.filterLabOrder(wrk);
    if (items) {
      const eneteredItems = items.filter((element: any) => Number(element.Status) >= 4);
      if (items.length === 0 || eneteredItems.length === items.length) {
        return true;
      }
    }
    return false;
  }

  getAcknowldgeStatus(wrk: any) {
    const items = this.filterLabOrder(wrk);
    if (items) {
      const notAcknowldgedItems = items.filter((element: any) =>
        element.SampleCollectedClass == "collected text-center custom_tooltip custom_tooltip_left");
      if (notAcknowldgedItems.length > 0 || items.length === 0) {
        wrk.isAllAcknowldge = false;
        return false;
      } else {
        wrk.isAllAcknowldge = true;
        return true;
      }
    }
    return false;
  }

  acknowledgeItems(wrk: any) {
    const items = this.filterLabOrder(wrk);
    items.forEach((element: any) => {
      if (Number(element.STATUS) === 3) {
        this.enableSave = true;
        if (wrk.isAllAcknowldge) {
          element.SampleCollectedClass = "collected text-center custom_tooltip custom_tooltip_left";
          element.SampleAckSelected = false;
        } else {
          element.SampleCollectedClass = "collected text-center custom_tooltip custom_tooltip_left active";
          element.SampleAckSelected = true;
        }
      }
    })
  }

  MulBarCodePrint(wrk: any) {
    this.allBarCodeSelect = !this.allBarCodeSelect;
    const items = this.filterLabOrder(wrk);
    items.forEach((element: any) => {
      if (Number(element.STATUS) >= 3) {
        this.enableSave = true;
        if (!this.allBarCodeSelect) {
          element.BarCodeClass = "collected text-center custom_tooltip custom_tooltip_left";
          element.Selected = false;
        } else {
          element.BarCodeClass = "collected text-center custom_tooltip custom_tooltip_left active";
          element.Selected = true;
        }
      }
    })
  }

  ChangeLabTestOrderSampleAckStatus(data: any, status: any) {
    if (Number(data.STATUS) === 3 || Number(data.STATUS) === 4 || Number(data.STATUS) === -1) {
      this.enableSave = true;
      var testOrder = this.labOrderData.filter((x: any) => x.TestOrderID === data.TestOrderID && x.TestOrderItemID === data.TestOrderItemID && x.SpecialiseID === data.SpecialiseID);
      if (testOrder.filter((f: any) => f.SampleNumber != "" && f.SampleNumber != null).length > 0) {
        testOrder.forEach((element: any, index: any) => {
          if (element.SampleCollectedClass == "collected text-center custom_tooltip custom_tooltip_left" && element.STATUS != "4") {
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
          this.unAcknowledgeRemarksFor = unackFilter[0].Specialisation + '-' + unackFilter[0].Test;
          this.unAcknowledgeRemarksTestOrderDetails = unackFilter;
          $('#unAcktRem').val('');
          $("#unAcknowledgeRemarks").modal('show');
        }
      }
      else {
        $("#validateSampleNumberMsg").modal('show');
      }
    }
  }

  clearReCollectRemarks() {
    $('#reCollectRem').val('');
  }

  clearUnAckRemarks() {

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

  saveUnAcknowledgeRemarks(unackRem: any) {
    if ($('#unAcktRem').val() != '') {
      var testOrder = this.labOrderData.filter((x: any) => x.TestOrderID === this.unAcknowledgeRemarksTestOrderDetails[0].TestOrderID && x.SpecialiseID === this.unAcknowledgeRemarksTestOrderDetails[0].SpecialiseID && x.TestOrderItemID === this.unAcknowledgeRemarksTestOrderDetails[0].TestOrderItemID);
      testOrder.forEach((element: any, index: any) => {
        element.SampleUnAcknowledgeRemarks = $('#unAcktRem').val();
        element.SampleUnAcknowledge = true;
      });
    }
  }
  showVisitSummary(view: any) {
    this.config.fetchLabOrderVisitSummary(view.TestID, view.TestOrderID, view.TestOrderItemID, this.loggedinUserDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        if (response.FTPPATH != "") {
          //window.open(response.FTPPATH);
          this.trustedUrl = response.FTPPATH;
          $("#showLabReportsModal1").modal('show');
        }
      }
    },
      (err) => {

      })
  }

  showHistory(view: any) {
    this.testandSpecialisation = view.Specialisation + '-' + view.Test;
    this.config.fetchLabOrderSummary(view.TestID, view.TestOrderID, view.TestOrderItemID, this.loggedinUserDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        this.testHistory = response.FetchLabOrderSummaryOutputLists;
      }
    },
      (err) => {

      })
  }

  showIPRUpdate(view: any) {

    if (view.SampleNumber != "") {
      this.config.FetchBarCodePrintPanacea(view.SampleNumber, view.TestOrderID, view.TestOrderItemID, this.loggedinUserDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
        if (response.Code == 200) {
          $("#BardCodePanacea").modal('show');
        }
      },
        (err) => {

        })
    }
    else {
      $("#BardCodePanacea").modal('show');
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

  saveReCollectRemarks(reCollectRem: any) {
    if ($('#reCollectRem').val() != '') {
      var testOrder = this.labOrderData.filter((x: any) => x.TestOrderID === this.reCollectRemarksTestOrderDetails[0].TestOrderID && x.SpecialiseID === this.reCollectRemarksTestOrderDetails[0].SpecialiseID);
      testOrder.forEach((element: any, index: any) => {
        element.SampleRecollectRemarks = $('#reCollectRem').val();
      });
    }
  }

  saveSampleAcknowledge() {
    var ItemXMLDetails: any[] = [];
    this.labOrderData.forEach((element: any, index: any) => {
      if (element.SampleAckSelected) {
        var item = {
          "ORD": element.TestOrderID,
          "ORDITM": element.TestOrderItemID,
          "STS": element.Status,
          "SEQ": element.Sequence,
          "ROUTID": element.RoutID,
          "RMK": element.SampleUnAcknowledgeRemarks,
          "IsSampleUnAck": element.SampleUnAcknowledgeRemarks != '' && element.SampleUnAcknowledgeRemarks != undefined ? true : false,
          "SampleCollect": true,
          "SampleAcknowledge": true,
          "SampleRecollect": false,
          "SampleRejected": false,
          "Status": element.Status
        }
        ItemXMLDetails.push(item);
        this.showRecollect = false;
      }
      else if (element.SampleUnAcknowledge) {
        var item2 = {
          "ORD": element.TestOrderID,
          "ORDITM": element.TestOrderItemID,
          "STS": element.Status,
          "SEQ": element.Sequence,
          "ROUTID": element.RoutID,
          "RMK": element.SampleUnAcknowledgeRemarks,
          "IsSampleUnAck": true,
          "SampleCollect": true,
          "SampleAcknowledge": false,
          "SampleRecollect": false,
          "SampleRejected": false,
          "Status": element.Status
        }
        ItemXMLDetails.push(item2);
        this.showRecollect = false;
      }
      else if (!element.SampleAckSelected && element.SampleRecollectSelected) {
        var item1 = {
          "ORD": element.TestOrderID,
          "ORDITM": element.TestOrderItemID,
          "STS": element.Status,
          "SEQ": element.Sequence,
          "ROUTID": element.RoutID,
          "RMK": element.SampleRecollectRemarks,
          "SampleCollect": true,
          "SampleAcknowledge": true,
          "SampleRecollect": true,
          "SampleRejected": false,
          "Status": element.Status
        }
        ItemXMLDetails.push(item1);
        this.showRecollect = true;
      }
    });
    if (ItemXMLDetails.length > 0) {
      let payload = {
        "UserID": this.loggedinUserDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        "Hospitalid": this.hospitalId,
        "ItemXMLDetails": ItemXMLDetails
      }
      this.config.ChangeLabTestOrderStatus(payload).subscribe(
        (response) => {
          if (response.Code == 200) {
            if (this.showRecollect == true)
              this.validationMsg = "Recollect Successfully";
            else
              this.validationMsg = "Sample Acknowledged Successfully";
            $("#sampleAckSuccessMsg").modal('show');
            this.FetchLabWorklistData(false);
            this.enableSampleRecollectSave = false;
          }
        },
        (err) => {
          console.log(err)
        });
    }
  }

  ReloadLabOrderData() {

    this.config.fetchLabOrderDetails(this.selectedPatientData.TestOrderID, this.loggedinUserDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        this.enableSave = false;
        this.labOrderData = response.FetchLabOrderDetailsOutputLists;

        const distinctThings = response.FetchLabOrderDetailsOutputLists.filter(
          (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.SpecialiseID === thing.SpecialiseID) === i);
        this.specialisationWiseFilteredOrderDetails = distinctThings;
        this.specialisationWiseFilteredOrderDetails.forEach((element: any, index: any) => {
          element.Class = "d-flex";
          element.Selected = false;
        });
        this.labOrderData.forEach((element: any, index: any) => {
          if (element.Status == "4")
            element.SampleCollectedClass = "collected text-center custom_tooltip custom_tooltip_left active";
          else
            element.SampleCollectedClass = "collected text-center custom_tooltip custom_tooltip_left";

          if (element.Status == "-1")
            element.SampleReCollectedClass = "collected text-center custom_tooltip custom_tooltip_left active";
          else
            element.SampleReCollectedClass = "collected text-center custom_tooltip custom_tooltip_left";

          element.BarCodeClass = "collected text-center custom_tooltip custom_tooltip_left";
          element.SampleStatus = parseInt(element.Status);
        });
        this.patientSelected = true;
      }
    },
      (err) => {

      })
  }
  navigateToLabResultEntry(selectedPatientData: any, testdata: any) {
    if (Number(testdata.STATUS) >= 4) {
      sessionStorage.removeItem('FromBedBoard');
      this.selectedPatientData.filterFromDate = moment(this.tablePatientsForm.get("FromDate")?.value).format('DD-MMM-YYYY');
      this.selectedPatientData.filterToDate = moment(this.tablePatientsForm.get("ToDate")?.value).format('DD-MMM-YYYY');
      sessionStorage.setItem("selectedPatientData", JSON.stringify(selectedPatientData));
      sessionStorage.setItem("selectedPatientLabData", JSON.stringify(testdata));
      this.router.navigate(['/suit/lab-resultentry']);
    }
    else {
      $("#validationResultEntryMsg").modal('show');
    }
  }
  filterSurgeryRequests(type: string, TypeName: string) {
    $("#NationalId").val('');
    this.labWorklistData = this.labWorklistDataF;
    if (type) {
      this.labWorklistData = this.labWorklistData.filter((x: any) => x.Status === type);
    }

    if (this.showRejectedSamplesOnly) {
      this.labWorklistData = this.labWorklistData.filter((element: any) => element.IsSpecimenRejForm == '1');
    }

    const groupedByOrderDate = this.labWorklistData.reduce((acc: any, current: any) => {
      const OrderDate = current.OrderDate.split(' ')[0];
      if (!acc[OrderDate]) {
        acc[OrderDate] = [];
      }
      acc[OrderDate].push(current);

      return acc;
    }, {});

    this.sortedGroupedByOrderDate = Object.entries(groupedByOrderDate)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([OrderDate, items]) => ({ OrderDate, items }));

    if (this.labWorklistData.length > 0) {
      this.showNoRecFound = false;
    }
    else {
      this.ValidationMsgg = 'No ' + TypeName + ' Orders for the Day';
      this.showNoRecFound = true;
    }
  }

  onDateChange() {
    this.FetchLabWorklistData(false);
  }

  selectTestForBarCode(test: any) {
    test.selectedTest = !test.selectedTest;

  }
  individualBarcodePrint() {
    const items = this.labOrderData.filter((x: any) => x.selectedTest);
    if (items.length === 0) {
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
    var patientType = "1,3,4";
    if (this.selectedPatientType == "2") {
      patientType = "2";
    }
    else if (this.selectedPatientType == "3") {
      patientType = "3";
    }
    else {
      patientType = "1,3,4";
    }
    if (sampleNos != "") {
      this.config.FetchBarCodePrintSingle(testirderitemids, sampleNos, patientType, 1, 0, this.hospitalId).subscribe((response) => {
        if (response.Code == 200) {
          if (response.FTPPATH != "") {
            //window.open(response.FTPPATH);
            this.trustedUrl = response.FTPPATH;
            $("#showLabReportsModal1").modal('show');
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

  selectSpecimen(data: any) {
    data.sepecimenSelected = !data.sepecimenSelected;
    if (Number(data.STATUS) === 3 || Number(data.STATUS) === 4 || Number(data.STATUS) === -1) {
      this.enableSave = true;
      var testOrder = this.labOrderData.filter((x: any) => x.TestOrderID === data.TestOrderID && x.SpecimenID === data.SpecimenID);
      if (testOrder.filter((f: any) => f.SampleNumber != "" && f.SampleNumber != null).length > 0) {
        testOrder.forEach((element: any, index: any) => {
          if (element.SampleCollectedClass == "collected text-center custom_tooltip custom_tooltip_left" && element.STATUS != "4") {
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
          this.unAcknowledgeRemarksFor = unackFilter[0].Specialisation + '-' + unackFilter[0].Test;
          this.unAcknowledgeRemarksTestOrderDetails = unackFilter;
          $('#unAcktRem').val('');
          $("#unAcknowledgeRemarks").modal('show');
        }
      }
      else {
        $("#validateSampleNumberMsg").modal('show');
      }
    }

  }

  getTasksCount(TaskStatus: any) {
    if (!this.labWorklistDataF) {
      return 0;
    }
    return this.labWorklistDataF.filter((e: any) => e.Status == TaskStatus).length;
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
    // const modalRef = this.ms.openModal(PatientfoldermlComponent, options);
    // modalRef.componentInstance.readonly = true;
    const modalRef = this.ms.openModal(PatientfoldermlComponent, {
      data: item,
      readonly: true,
      selectedView: item
    }, options);
  }

  sendSms(wrk: any) {
    const payload = {
      "TestOrderID": wrk.TestOrderID,
      "PatientID": wrk.PatientID,
      "PatientFullName": wrk.PatientName,
      "PatientFullName2L": wrk.PatientName,
      "SSN": wrk.SSN,
      "MobileNo": wrk.MobileNo,
      "NationalityID": wrk.NationalityID ?? '1',
      "HospitalID": this.hospitalId,
    };
    this.us.post(labwrklst.LabResultsSMS, payload).subscribe((response: any) => {
      if (response.Code === 200) {
        $('#labReportSms').modal('show');
      }
    },
      (err) => {

      });
  }

  openSpecimenRejection(p: any, testdata: any) {
    this.common.fetchPatientVistitInfo(p.IPID, p.PatientID).subscribe({
      next: (response) => {
        if (response?.Code === 200) {
          const options: NgbModalOptions = {
            size: 'lg',
            windowClass: 'vte_view_modal specimenRejectionmodal'
          };
          const modalRef = this.ms.openModal(SpecimenRejectionComponent, {
            selectedPatientData: testdata,
            selectedPatientOrderData: p
          }, options);
        }
      },
      error: (err) => {
        console.error("Error fetching patient details", err);
      }
    });
  }

  toggleRejectedSamples() {
    this.showRejectedSamplesOnly = !this.showRejectedSamplesOnly;
    this.filterSurgeryRequests('', '');
  }

  sampleRecollectClick(view: any) {
    view.recollectEnable = !view.recollectEnable;
    if (this.labOrderData.filter((x: any) => x.recollectEnable).length > 0) {
      this.enableSampleRecollectSave = true;
    }
    else {
      this.enableSampleRecollectSave = false;
    }
  }

  SaveSampleRecollection() {
    var ItemXMLDetails: any[] = [];
    const recollectedSamples = this.labOrderData.filter((x: any) => x.recollectEnable);
    recollectedSamples.forEach((element: any, index: any) => {
      var item = {
        "ORD": element.TestOrderID,
        "ORDITM": element.TestOrderItemID,
        "STS": element.SampleStatus,
        "SEQ": element.Sequence,
        "ROUTID": element.RoutID,
        "RMK": 'Sample Recllection',
        "SampleCollect": true,
        "SampleAcknowledge": false,
        "SampleRecollect": false,
        "Status": element.SampleStatus
      }
      ItemXMLDetails.push(item);
    });

    let payload = {
      "UserID": this.loggedinUserDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "Hospitalid": this.hospitalId,
      "ItemXMLDetails": ItemXMLDetails
    }
    this.config.ChangeTestOrderStatus(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          // $("#remarksModal").modal('hide');
          $("#sampleRecollectMsg").modal('show');
          this.FetchLabWorklistData(false);
          // this.FetchLabPhlebtomyCount();
          // this.dataclick(this.IsLastWeek, this.strStatus, this.strPatientIds, this.intOrderType, this.tdcss, this.activeTab);
        }
      },
      (err) => {
        console.log(err)
      });
  }

  fetchLabSpecimen() {
    const url = this.us.getApiUrl(labwrklst.FetchLabSpecimen, {
      UserID: this.loggedinUserDetails[0].UserId,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalId
    });

    this.us.get(url).subscribe((res: any) => {
      if (res.Code === 200) {
        this.labSpecimens = res.FetchLabSpecimenDataLists;
        this.specimenSearchCtrl.setValue('');
      }
    });
  }

  specimenOptionClicked(event: any, item: any) {
    event.stopPropagation();
    this.toggleSpecimenSelection(item);
  }

  toggleSpecimenSelection(item: any) {
    item.selected = !item.selected;
    if (item.selected) {
      const i = this.selectedSpecimens.findIndex((value: any) => value.ID === item.ID);
      if (i === -1) {
        this.selectedSpecimens.push(item);
      }
    } else {
      const i = this.selectedSpecimens.findIndex((value: any) => value.ID === item.ID);
      this.selectedSpecimens.splice(i, 1);
    }
  }
}

export const labwrklst = {
  LabResultsSMS: "LabResultsSMS",
  FetchLabSpecimen: 'FetchLabSpecimen?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
};