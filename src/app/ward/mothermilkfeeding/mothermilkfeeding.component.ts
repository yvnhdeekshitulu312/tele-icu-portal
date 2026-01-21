import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/shared/base.component';
import { ConfigService } from 'src/app/services/config.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';

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
  selector: 'app-mothermilkfeeding',
  templateUrl: './mothermilkfeeding.component.html',
  styleUrls: ['./mothermilkfeeding.component.scss'],
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
export class MothermilkfeedingComponent extends BaseComponent implements OnInit {
  @Input() IsSwitchWard: any = false;
  isNational = false;
  IsHeadNurse: any;
  IsHome = true;
  IsSwitch = false;
  uhid: any;
  nationalID: any;
  patientDetails: any;
  currentTime: any;
  FetchAdmittedChildDetailsListD: any = [];
  FetchAdmittedMotherDetailsListD: any = [];
  FetchActiveMotherMilkInfoListD: any = [];
  selectedBottleId: string = "";
  FetchMilkBottleQtyListD: any = [];
  feedingMilkInfoForm!: FormGroup;
  cotinuousFeedingForm!: FormGroup;
  feedingMilkToBabyDetailsForm!: FormGroup;
  errorMessages: any[] = [];
  fetchFeedingSchedules: any = [];
  disableFeedWasteQty = false;
  isFeeding = false;
  patinfo:any;

  constructor(private router: Router, private changeDetectorRef: ChangeDetectorRef, private config: ConfigService, public formBuilder: FormBuilder, public datepipe: DatePipe) {
    super();

    this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');

    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
    this.feedingMilkInfoForm = this.formBuilder.group({
      TotalQuantity: ['', Validators.required],
      BalanceQuantity: ['', Validators.required],
      FeedQuantity: ['', Validators.required],
      WasteQuantity: ['', Validators.required],
      Remarks: [''],
      ManualEntryRemarks: ['']
    });

    this.cotinuousFeedingForm = this.formBuilder.group({
      Quantity: ['', Validators.required],
      FromDate: [new Date(), Validators.required],
      FromTime: ['', Validators.required],
      NoofHours: ['', Validators.required]
    });

    this.feedingMilkToBabyDetailsForm = this.formBuilder.group({
      TotalQuantity: ['', Validators.required],
      BalanceQuantity: ['', Validators.required],
      FeedQuantity: ['', Validators.required],
      WasteQuantity: ['', Validators.required],
      Remarks: [''],
      ManualEntryRemarks: ['']
    });

  }

  ngOnInit(): void {
    this.IsSwitch = this.IsSwitchWard;
    this.wardID = this.ward.FacilityID;
    this.admissionID = this.selectedView.IPID;
    this.uhid = this.selectedView.RegCode;
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.currentTime = moment(new Date()).format('H:mm');
    this.cotinuousFeedingForm.patchValue({
      FromTime: this.currentTime
    })
  }

  openCreateFeedingPopup() {
    this.cotinuousFeedingForm.patchValue({
      FromTime: this.currentTime
    })
  }

  onNationalIDEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.onchangeNationalID();
      this.changeDetectorRef.detectChanges();
    }
  }

  onchangeNationalID() {
    this.isNational = false;
    if (this.nationalID) {
      this.FetchBabyInfo();
      // var BedList = JSON.parse(sessionStorage.getItem("BedList") || '{}');
      // const selectedItem = BedList.find((value: any) => value.SSN === this.nationalID);
      // if (selectedItem) {
      //   this.selectedView = selectedItem;
      //   this.patientDetails = selectedItem;
      //   const currentdate = new Date();
      //   sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientDetails));
      //   this.isNational = true;
      // }
    }
  }

  FetchBabyInfo() {
    this.config.FetchBabyInfo(this.nationalID, this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {

        this.selectedView = response.FetchBedsFromWardDataList[0];
        this.patientDetails = response.FetchBedsFromWardDataList[0];
        const currentdate = new Date();
        sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientDetails));
        this.isNational = true;
        this.fetchAdmittedMotherDetails();
      }
    },
      (err) => {

      })
  }

  fetchAdmittedChildDetails() {
    this.config.FetchAdmittedChildDetails(this.selectedView.PatientID, this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        this.FetchAdmittedChildDetailsListD = response.FetchAdmittedChildDetailsListD;

      }
    },
      (err) => {

      })
  }

  fetchAdmittedMotherDetails() {
    this.config.FetchAdmittedMotherDetails(this.selectedView.PatientID, this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        this.FetchAdmittedMotherDetailsListD = response.FetchAdmittedChildDetailsListD;
        this.fetchActiveMotherMilkInfo(this.FetchAdmittedMotherDetailsListD[0].MotherPatientID);
      }
    },
      (err) => {

      })
  }

  fetchActiveMotherMilkInfo(patientid: string) {
    this.config.FetchActiveMotherMilkInfo(patientid, this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        this.FetchActiveMotherMilkInfoListD = response.FetchActiveMotherMilkInfoListD;
        this.FetchMilkFeedingSchedules();
      }
    },
      (err) => {

      })
  }


  onBottleSelected(event: any) {
    this.selectedBottleId = event.target.value;
    this.fetchMilkBottleQty();
  }

  fetchMilkBottleQty() {
    this.config.FetchMilkBottleQty(this.selectedBottleId, this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        this.FetchMilkBottleQtyListD = response.FetchMilkBottleQtyListD;
        if (response.FetchMilkBottleQtyListD[0].BalanceQuantity != '' && response.FetchMilkBottleQtyListD[0].Quantity != '') {
          this.disableFeedWasteQty = false;
          if (this.isFeeding) {
            this.feedingMilkToBabyDetailsForm.patchValue({
              BalanceQuantity: response.FetchMilkBottleQtyListD[0].BalanceQuantity,
              TotalQuantity: response.FetchMilkBottleQtyListD[0].Quantity,
            })
          }
          else {
            this.feedingMilkInfoForm.patchValue({
              BalanceQuantity: response.FetchMilkBottleQtyListD[0].BalanceQuantity,
              TotalQuantity: response.FetchMilkBottleQtyListD[0].Quantity,
            })
          }
        }
        else {
          this.disableFeedWasteQty = true;
        }
      }
    },
      (err) => {

      })
  }

  saveMilkFeeding() {
    this.errorMessages = [];
    if (this.feedingMilkInfoForm.get('TotalQuantity')?.value == '') {
      this.errorMessages.push("Please enter Total Quantity");
    }
    if (this.feedingMilkInfoForm.get('BalanceQuantity')?.value == '') {
      this.errorMessages.push("Please enter Balance Quantity");
    }
    if (this.feedingMilkInfoForm.get('FeedQuantity')?.value == '') {
      this.errorMessages.push("Please enter Feed Quantity");
    }
    if (this.feedingMilkInfoForm.get('WasteQuantity')?.value == '') {
      this.errorMessages.push("Please enter Wasted Quantity");
    }
    if (this.errorMessages.length === 0) {
      var payload = {
        "FeedingID": "0",
        "MotherMilkExtractionID": this.selectedBottleId,
        "BabyIPID": this.selectedView.IPID,
        "ScheduleTime": this.currentTime,
        "FeedDate": this.currentTime,
        "FeedTime": new Date().getHours(),//currenthour
        "GivenBy": this.doctorDetails[0].UserId,
        "FeedQuantity": this.feedingMilkInfoForm.get('FeedQuantity')?.value,
        "WastedQuantity": this.feedingMilkInfoForm.get('WasteQuantity')?.value,
        "PendingQuantity": 0,
        "FacilityId": this.wardID,
        "Remarks": this.feedingMilkInfoForm.get('Remarks')?.value,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.wardID,
        "Hospitalid": this.hospitalID,
        "BalanceQuantity": this.feedingMilkInfoForm.get('BalanceQuantity')?.value,
        "ScanUHID": false,
        "AllDetailsVeified": false,
        "ScanBottle": false,
        "ManualEntryRemarks": this.feedingMilkInfoForm.get('ManualEntryRemarks')?.value,
      }
      this.config.SaveMilkFeedingBaby(payload).subscribe(response => {
        if (response.Code == 200) {
          $("#milkfeedingSavedMsg").modal('show');
        }
      })
    }
    else {
      $("#motherMilkExtractionValidationMsgs").modal('show');
    }
  }

  FetchMilkFeedingSchedules() {
    this.config.FetchMilkFeedingSchedules(this.selectedView.IPID, this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        this.fetchFeedingSchedules = response.FetchMilkFeedingSchedulesListD;
        this.fetchFeedingSchedules.forEach((element:any, index:any) => {
          element.selected = false;
        });
      }
    },
      (err) => {

      })
  }

  SaveMilkContinousFeedingBaby() {
    var fromtime = new Date(`2000-01-01T${this.cotinuousFeedingForm.get('FromTime')?.value}`)
    var contfeedpld = {
      "ChildIPID": this.selectedView.IPID,
      "TotalHours": this.cotinuousFeedingForm.get('NoofHours')?.value,
      "FromDate": this.datepipe.transform(this.cotinuousFeedingForm.get('FromDate')?.value, "dd-MMM-yyyy")?.toString(),
      "FromTimeHr": String(fromtime.getHours() + 1).padStart(2, '0'),
      "FromTimeMin": String(fromtime.getMinutes()).padStart(2, '0'),
      "Qty": this.cotinuousFeedingForm.get('Quantity')?.value,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "Hospitalid": this.hospitalID
    }

    this.config.SaveMilkContinousFeedingBaby(contfeedpld).subscribe(response => {
      if (response.Code == 200) {
        $("#createfeeding").modal('hide');
        $("#milkfeedingSavedMsg").modal('show');
      }
    })
  }

  validateFeedQty() {
    var feedQty = this.feedingMilkInfoForm.get('FeedQuantity')?.value;
    var balQty = this.feedingMilkInfoForm.get('BalanceQuantity')?.value;
    if (this.isFeeding) {
      feedQty = this.feedingMilkToBabyDetailsForm.get('FeedQuantity')?.value;
      balQty = this.feedingMilkToBabyDetailsForm.get('BalanceQuantity')?.value;
    }
    if (feedQty != '' && balQty != '') {
      if (Number(feedQty) > Number(balQty)) {
        this.errorMessages = [];
        this.errorMessages.push("Feed Quantity cannot be greater then Balance Quantity");
        if (this.isFeeding) {
          this.feedingMilkToBabyDetailsForm.patchValue({
            FeedQuantity: ''
          });
        }
        else {
          this.feedingMilkInfoForm.patchValue({
            FeedQuantity: ''
          });
        }
        $("#motherMilkExtractionValidationMsgs").modal('show');
      }
    }
  }
  validateWasteQty() {
    var wasteQty = this.feedingMilkInfoForm.get('WasteQuantity')?.value;
    var feedQty = this.feedingMilkInfoForm.get('FeedQuantity')?.value;
    var balQty = this.feedingMilkInfoForm.get('BalanceQuantity')?.value;
    if (this.isFeeding) {
      wasteQty = this.feedingMilkToBabyDetailsForm.get('WasteQuantity')?.value;
      feedQty = this.feedingMilkToBabyDetailsForm.get('FeedQuantity')?.value;
      balQty = this.feedingMilkToBabyDetailsForm.get('BalanceQuantity')?.value;
    }
    if (wasteQty != '' && balQty != '' && feedQty != '') {
      if (Number(wasteQty) > Number(balQty)) {
        this.errorMessages = [];
        this.errorMessages.push("Waste Quantity cannot be greater then Balance Quantity/Feed Quantity");
        this.feedingMilkInfoForm.patchValue({
          WasteQuantity: ''
        });
        $("#motherMilkExtractionValidationMsgs").modal('show');
      }
      const diffqty = Number(balQty) - Number(feedQty);
      if (Number(wasteQty) > diffqty) {
        this.errorMessages = [];
        this.errorMessages.push("Waste Quantity cannot be greater then Balance Quantity/Feed Quantity");
        if (this.isFeeding) {
          this.feedingMilkToBabyDetailsForm.patchValue({
            WasteQuantity: ''
          });
        }
        else {
          this.feedingMilkInfoForm.patchValue({
            WasteQuantity: ''
          });
        }
        $("#motherMilkExtractionValidationMsgs").modal('show');
      }
    }
  }

  feedingDetails(feed: any) {
    this.isFeeding = true;
    this.feedingMilkToBabyDetailsForm.patchValue({
      FeedQuantity: feed.Quantity
    })
    $("#feedingDetails").modal('show');
  }

  SavefeedingMilkToBabyDetails() {
    this.errorMessages = [];
    if (this.feedingMilkToBabyDetailsForm.get('TotalQuantity')?.value == '') {
      this.errorMessages.push("Please enter Total Quantity");
    }
    if (this.feedingMilkToBabyDetailsForm.get('BalanceQuantity')?.value == '') {
      this.errorMessages.push("Please enter Balance Quantity");
    }
    if (this.feedingMilkToBabyDetailsForm.get('FeedQuantity')?.value == '') {
      this.errorMessages.push("Please enter Feed Quantity");
    }
    if (this.feedingMilkToBabyDetailsForm.get('WasteQuantity')?.value == '') {
      this.errorMessages.push("Please enter Wasted Quantity");
    }
    if (this.errorMessages.length === 0) {
      var payload = {
        "FeedingID": "0",
        "MotherMilkExtractionID": this.selectedBottleId,
        "BabyIPID": this.selectedView.IPID,
        "ScheduleTime": this.currentTime,
        "FeedDate": this.currentTime,
        "FeedTime": new Date().getHours(),//currenthour
        "GivenBy": this.doctorDetails[0].UserId,
        "FeedQuantity": this.feedingMilkToBabyDetailsForm.get('FeedQuantity')?.value,
        "WastedQuantity": this.feedingMilkToBabyDetailsForm.get('WasteQuantity')?.value,
        "PendingQuantity": 0,
        "FacilityId": this.wardID,
        "Remarks": this.feedingMilkToBabyDetailsForm.get('Remarks')?.value,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.wardID,
        "Hospitalid": this.hospitalID,
        "BalanceQuantity": this.feedingMilkToBabyDetailsForm.get('BalanceQuantity')?.value,
        "ScanUHID": false,
        "AllDetailsVeified": false,
        "ScanBottle": false,
        "ManualEntryRemarks": this.feedingMilkToBabyDetailsForm.get('ManualEntryRemarks')?.value,
      }
      this.config.SaveMilkFeedingBabySchedule(payload).subscribe(response => {
        if (response.Code == 200) {
          this.isFeeding = false;
          $("#feedingDetails").modal('hide');
          $("#milkfeedingSavedMsg").modal('show');
        }
      })
    }
    else {
      $("#motherMilkExtractionValidationMsgs").modal('show');
    }
  }

  selectFeedSchedule(feed:any) {
    if(feed.selected)
      feed.selected = false;
    else
      feed.selected = true;
  }

  ModifyFeedingQuantityInSchedule() {
    var selectedSchedules = this.fetchFeedingSchedules.filter((x:any) => x.selected);
    if(selectedSchedules.length > 0) {
    var wardTaskIntrvls = selectedSchedules?.map((item: any) => item.WardTaskIntervalID).join(', ');
    var discontuepyld =
    {
      "WardTaskIntervalIDs": wardTaskIntrvls,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "Hospitalid": this.hospitalID

    }
    this.config.ModifyFeedingQuantityInSchedule(discontuepyld).subscribe(response => {
      if (response.Code == 200) {
        $("#milkfeedingDiscontinueMsg").modal('show');
      }
    })
  }
  else {
    this.errorMessages = [];
    this.errorMessages.push("Please select any schedule to discontinue");
    $("#motherMilkExtractionValidationMsgs").modal('show');

  }
  }


  clearMilkFeedingScreen() {
    this.isNational = false;
    this.nationalID = "";
    this.patientDetails = [];
    this.FetchAdmittedChildDetailsListD = [];
    this.FetchAdmittedMotherDetailsListD = [];
    this.FetchActiveMotherMilkInfoListD = [];
    this.selectedBottleId = "";
    this.FetchMilkBottleQtyListD = [];
    this.errorMessages = [];
    this.fetchFeedingSchedules = [];
    this.disableFeedWasteQty = false;

    this.feedingMilkInfoForm.patchValue({
      TotalQuantity: '',
      BalanceQuantity: '',
      FeedQuantity: '',
      WasteQuantity: '',
      Remarks: [''],
      ManualEntryRemarks: ['']
    });

    this.cotinuousFeedingForm.patchValue({
      Quantity: '',
      FromDate: new Date(),
      FromTime: '',
      NoofHours: ''
    });

    this.feedingMilkToBabyDetailsForm.patchValue({
      TotalQuantity: '',
      BalanceQuantity: '',
      FeedQuantity: '',
      WasteQuantity: '',
      Remarks: [''],
      ManualEntryRemarks: ['']
    });

  }

  clearContinuousFeeding() {
    this.cotinuousFeedingForm.patchValue({
      Quantity: '',
      FromDate: new Date(),
      FromTime: this.currentTime,
      NoofHours: ''
    });
  }

  clearfeedingMilkToBabyDetails() {
    this.feedingMilkToBabyDetailsForm.patchValue({
      TotalQuantity: '',
      BalanceQuantity: '',
      FeedQuantity: '',
      WasteQuantity: '',
      Remarks: [''],
      ManualEntryRemarks: ['']
    });

  }

  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
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

}
