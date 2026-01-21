import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/shared/base.component';
import { ConfigService } from 'src/app/services/config.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { patientfolder } from 'src/app/shared/patientfolderml/patientfolderml.component';
import { UtilityService } from 'src/app/shared/utility.service';

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
  selector: 'app-mothermilkextraction',
  templateUrl: './mothermilkextraction.component.html',
  styleUrls: ['./mothermilkextraction.component.scss'],
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
export class MothermilkextractionComponent extends BaseComponent implements OnInit {
  @Input() IsSwitchWard: any = false;
  isNational = false;
  IsHeadNurse: any;
  IsHome = true;
  IsSwitch = false;
  uhid: any;
  nationalID: any;
  patientDetails: any;
  FetchAdmittedChildDetailsListD: any = [];
  milkBottle: any = [];
  FetchActiveMilkBottlesInfoListD: any = [];
  extractedMilkInfoForm!: FormGroup;
  storageChangeForm!: FormGroup;
  currentTime: any;
  selectedBottleId: string = "";
  trustedUrl: any;
  tempStorageTypes: any = [];
  selectedItemToChangeStorage: any = [];
  errorMessages: any[] = [];
  patinfo: any;
  fromBedsBoard: boolean = false;
  patientsCollection: any = [];
  patientVisits: any = [];

  constructor(private router: Router, private changeDetectorRef: ChangeDetectorRef, private config: ConfigService, public formBuilder: FormBuilder, public datepipe: DatePipe, private us: UtilityService) {
    super();

    this.extractedMilkInfoForm = this.formBuilder.group({
      Quantity: ['', Validators.required],
      ExtractedDate: [new Date(), Validators.required],
      ExtractedTime: ['', Validators.required],
      StorageType: ['0', Validators.required],
      ExpiryDate: ['', Validators.required],
      ManualEntryRemarks: ['']
    });

    this.storageChangeForm = this.formBuilder.group({
      Quantity: ['', Validators.required],
      ExtractedDate: [new Date(), Validators.required],
      ExtractedTime: ['', Validators.required],
      StorageType: ['0', Validators.required],
      ExpiryDate: ['', Validators.required],
    });

    this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');

    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }

    this.fromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;

  }

  ngOnInit(): void {
    this.IsSwitch = this.IsSwitchWard;
    this.wardID = this.ward.FacilityID;
    this.admissionID = this.selectedView.IPID;
    this.uhid = this.selectedView.RegCode;
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.currentTime = moment(new Date()).format('H:mm');
    this.extractedMilkInfoForm.patchValue({
      ExtractedTime: this.currentTime
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
      let BedList = [];
      if (sessionStorage.getItem("BedList")) {
        BedList = JSON.parse(sessionStorage.getItem("BedList") || '{}');
      }
      const selectedItem = BedList.find((value: any) => value.SSN === this.nationalID);
      if (selectedItem) {
        this.selectedView = selectedItem;
        this.patientDetails = selectedItem;
        sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientDetails));
        this.fetchAdmittedChildDetails();
        this.isNational = true;
      } else {
        this.fetchPatientUHIDSSN(this.nationalID);
      }
    }
  }

  fetchPatientUHIDSSN(SSN: any) {
    const url = this.us.getApiUrl(patientfolder.FetchPatientUHIDSSN, {
      SSN,
      HospitalID: this.hospitalID,
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code === 200) {
          this.patientsCollection = response.FetchPatientUHIDSSNDataList;
          this.fetchPatientDetails(this.patientsCollection[0].SSN, '0', '0');
        }
      });
  }

  fetchPatientDetails(ssn: string, mobileno: string, patientId: string) {
    const url = this.us.getApiUrl(patientfolder.fetchPatientDataBySsn, {
      SSN: ssn,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId,
      WorkStationID: this.doctorDetails[0]?.FacilityId,
      HospitalID: this.hospitalID,
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (ssn === '0') {
            this.selectedView = response.FetchPatientDependCLists[0];
          }
          else if (mobileno === '0') {
            this.selectedView = response.FetchPatientDataCCList[0];
          }
          this.fetchPatientVisits();
        }
      },
        (err) => {

        })
  }

  fetchPatientVisits() {
    const url = this.us.getApiUrl(patientfolder.FetchPatientVisitsPFN, {
      UHID: this.patientsCollection.map((element: any) => element.Regcode).join(),
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientVisits = response.PatientVisitsDataList;
          const admid = this.selectedView.AdmissionID || this.selectedView.IPAdmissionID || this.selectedView.IPID;
          setTimeout(() => {
            this.visitChange(admid);
          }, 1000);
        }
      },
        (err) => {
        })
  }

  onSectionVisitChange(event: any) {
    this.isNational = false;
    this.visitChange(event.target.value);
  }

  visitChange(admissionId: any) {
    this.admissionID = admissionId;
    const patientdata = this.patientVisits.find((visit: any) => visit.AdmissionID == admissionId);
    this.fetchPatientVistitInfo(patientdata);
  }

  fetchPatientVistitInfo(patientdata: any) {
    const url = this.us.getApiUrl(patientfolder.FetchPatientVistitInfoN, {
      UHID: patientdata.RegCode,
      IsnewVisit: patientdata.IsNewVisit,
      Admissionid: patientdata.AdmissionID,
      HospitalID: patientdata.HospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatientVistitInfoDataList.length > 0) {
            this.selectedView = response.FetchPatientVistitInfoDataList[0];
            this.patientDetails = response.FetchPatientVistitInfoDataList[0];
            sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientDetails));
            this.fetchAdmittedChildDetails();
            this.isNational = true;
          }
        }
      },
        (err) => {

        })
  }

  fetchAdmittedChildDetails() {
    this.config.FetchAdmittedChildDetails(this.selectedView.PatientID, this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        this.FetchAdmittedChildDetailsListD = response.FetchAdmittedChildDetailsListD;

        this.FetchActiveMilkBottlesInfo('beforeqty');
      }
    },
      (err) => {

      })
  }

  SaveMilkBottleBarCodeGeneration() {
    if (this.nationalID) {
      var payload = {
        "MotherMilkExtractionID": "0",
        "MotherPatientID": this.selectedView.PatientID,
        "MotherIPID": this.admissionID,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.wardID,
        "Hospitalid": this.hospitalID,
        "Status": "0",
        "ScanPatient": false,
        "AllDetailsVeified": false,
        "ScanBottle": false,
        "ManualReason": $("#manualEntryRemarks").val()
      }
      this.config.SaveMilkBottleBarCodeGeneration(payload).subscribe(response => {
        if (response.Code == 200) {
          this.selectedBottleId = response.PatientVitalEndoscopyDataaList[0].PreProcedureAssessment
          this.FetchActiveMilkBottlesInfo('beforeqty');
          //this.FetchPrintBarCodeGener(this.selectedBottleId, this.nationalID);
          var ssn = this.FetchAdmittedChildDetailsListD?.map((item: any) => item.ChildSSN).join(', ');
          this.FetchPrintBarCodeGener(this.selectedBottleId, ssn);
          $("#milkextractionSavedMsg").modal('show');
          //this.milkBottle = response.PatientVitalEndoscopyDataaList;
        }
      })
    }
  }

  FetchPrintBarCodeGener(barcodeid: string, ssn: string) {
    var barcodepld = {
      "BottleNumber": barcodeid,
      "PatientID": this.selectedView.PatientID,
      "IPID": this.admissionID,
      "SSN": this.nationalID,
      "MotherName": this.selectedView.PatientName,
      "ChildSSN": ssn,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "Hospitalid": this.hospitalID,
      "UserName": "BottleScan"
    }
    this.config.FetchPrintBarCodeGener(barcodepld).subscribe(response => {
      if (response.Code == 200) {
        this.trustedUrl = response?.FTPPATH
        $("#barcodePdf").modal('show');
      }
    })

  }

  FetchPrintBarCodeGenerAfterQty(item: any) {
    var ChildSSNN = this.FetchAdmittedChildDetailsListD?.map((item: any) => item.ChildSSN).join(', ');
    var barcodepld = {
      "BottleNumber": item.MotherMilkExtractionID,
      "PatientID": this.selectedView.PatientID,
      "IPID": this.admissionID,
      "SSN": item.MotherSSN,
      "MotherName": item.MotherName,
      "ChildSSN": ChildSSNN,
      "ExtractedDatetime": item.ExtractedDateTime,
      "ExpiryDatetime": item.ExpiryDateTime,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "Hospitalid": this.hospitalID,
      "UserName": this.doctorDetails[0].UserName
    }
    this.config.FetchPrintBarCodeGenerAfterQty(barcodepld).subscribe(response => {
      if (response.Code == 200) {
        this.trustedUrl = response?.FTPPATH
        $("#barcodePdf").modal('show');
      }
    })

  }

  FetchActiveMilkBottlesInfo(type: string) {
    this.config.FetchActiveMilkBottlesInfo(this.selectedView.PatientID, this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        this.FetchActiveMilkBottlesInfoListD = response.FetchActiveMilkBottlesInfoListD;
        if (type == 'afterqty') {
          var res = this.FetchActiveMilkBottlesInfoListD.filter((h: any) => h.MotherMilkExtractionID == this.selectedBottleId);
          this.FetchPrintBarCodeGenerAfterQty(res[0]);
        }
      }
    },
      (err) => {

      })
  }

  onBottleSelected(event: any) {
    this.selectedBottleId = event.target.value;
  }


  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  onStorageTypeChange(event: any, type: string) {
    if (this.extractedMilkInfoForm.get('ExtractedDate')?.value != '' && this.extractedMilkInfoForm.get('ExtractedTime')?.value != '') {
      const extractedDateTime = this.extractedMilkInfoForm.get('ExtractedDate')?.value;
      var extdatetime = new Date(extractedDateTime);
      var expiryDate = ""; var expiryTime = this.extractedMilkInfoForm.get('ExtractedTime')?.value;
      if (event.target.value === '1') {
        expiryDate = new Date(extdatetime).setMonth(new Date(extdatetime).getMonth() + 6).toString();
      }
      else if (event.target.value === '2') {
        expiryDate = new Date(extdatetime).setMonth(new Date(extdatetime).getMonth() + 1).toString();
      }
      else if (event.target.value === '3') {
        expiryDate = new Date(extdatetime).setDate(new Date(extdatetime).getDate() + 1).toString();
      }
      else if (event.target.value === '4') {
        //expiryDate = new Date(expiryTime).setTime(new Date(expiryTime).getTime() + 1).toString();
        const exptime = new Date(`2000-01-01T${expiryTime}`)
        const hours = String(exptime.getHours() + 1).padStart(2, '0');
        const minutes = String(exptime.getMinutes()).padStart(2, '0');
        const seconds = String(exptime.getSeconds()).padStart(2, '0');
        expiryTime = `${hours}:${minutes}:${seconds}`;
        expiryDate = this.extractedMilkInfoForm.get('ExtractedDate')?.value;
      }
      else {
        expiryDate = "";
      }
      if (expiryDate != "" && type == 'temp') {
        this.storageChangeForm.patchValue({
          ExpiryDate: this.datepipe.transform(expiryDate, "dd-MMM-yyyy")?.toString() + ' ' + expiryTime
        })
      }
      else {
        this.extractedMilkInfoForm.patchValue({
          ExpiryDate: this.datepipe.transform(expiryDate, "dd-MMM-yyyy")?.toString() + ' ' + expiryTime
        })
      }
    }
  }

  saveMilkExtraction() {
    this.errorMessages = [];
    if (this.extractedMilkInfoForm.get('Quantity')?.value == '') {
      this.errorMessages.push("Please enter Quantity");
    }
    if (this.extractedMilkInfoForm.get('StorageType')?.value == '0') {
      this.errorMessages.push("Please enter Storage Type");
    }
    if ($("#BottleID").val() == '0') {
      this.errorMessages.push("Please enter Bottle");
    }
    if (this.errorMessages.length === 0) {
      var barcodepld = {
        "MotherMilkExtractionID": this.selectedBottleId,
        "MotherPatientID": this.selectedView.PatientID,
        "MotherIPID": this.admissionID,
        "Quantity": this.extractedMilkInfoForm.get('Quantity')?.value,
        "MotherMilkStorageTypeID": this.extractedMilkInfoForm.get('StorageType')?.value,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.wardID,
        "Hospitalid": this.hospitalID,
        "ExtractedDateTime": this.datepipe.transform(this.extractedMilkInfoForm.get('ExtractedDate')?.value, "dd-MMM-yyyy")?.toString() + ' ' + this.extractedMilkInfoForm.get('ExtractedTime')?.value,
        "ExpiryDateTime": this.extractedMilkInfoForm.get('ExpiryDate')?.value,
        "Status": "0",
        "ScanPatient": false,
        "AllDetailsVeified": false,
        "ScanBottle": false,
        "ManualReason": this.extractedMilkInfoForm.get('Quantity')?.value
      }
      this.config.SaveMilkBottleQty(barcodepld).subscribe(response => {
        if (response.Code == 200) {
          var ssn = this.FetchAdmittedChildDetailsListD?.map((item: any) => item.ChildSSN).join(', ');
          this.FetchActiveMilkBottlesInfo('afterqty');
          // setTimeout(() => {
          //   var res = this.FetchActiveMilkBottlesInfoListD.filter((h: any) => h.MotherMilkExtractionID == this.selectedBottleId);
          // this.FetchPrintBarCodeGenerAfterQty(res[0]);   
          // }, 500);
          this.extractedMilkInfoForm.patchValue({
            Quantity: '',
            ExtractedDate: new Date(),
            ExtractedTime: '',
            StorageType: '0',
            ExpiryDate: ''
          });

        }
      })
    }
    else {
      $("#motherMilkExtractionValidationMsgs").modal('show');
    }
  }

  openStorageChange(item: any) {
    this.selectedItemToChangeStorage = item;
    if (item.StorageTypeID === '1') {
      this.tempStorageTypes = [];
      this.tempStorageTypes.push({ StorageTypeId: "2", StorageTypeName: "Freezer" });
      this.tempStorageTypes.push({ StorageTypeId: "3", StorageTypeName: "Refregirator" });
      this.tempStorageTypes.push({ StorageTypeId: "4", StorageTypeName: "Direct" });
    }
    else if (item.StorageTypeID === '2') {
      this.tempStorageTypes = [];
      this.tempStorageTypes.push({ StorageTypeId: "3", StorageTypeName: "Refregirator" });
      // this.tempStorageTypes.push({ StorageTypeId: "4", StorageTypeName: "Direct" });
    }
    else if (item.StorageTypeID === '3') {
      this.tempStorageTypes = [];
      //this.tempStorageTypes.push({ StorageTypeId: "4", StorageTypeName: "Direct" });
    }
    this.storageChangeForm.patchValue({
      ExtractedTime: item.ExtractedDateTime,
      Quantity: item.Quantity,
      ExpiryDate: item.ExpiryDateTime,
      StorageType: item.StorageTypeID,
      // Quantity: "",
      // ExtractedDate: new Date(),
      // ExtractedTime: '',
      // StorageType: "0",
      // ExpiryDate: "",


    })
    $("#storageChange").modal('show');
  }

  clearTempStorageType() {
    this.storageChangeForm.patchValue({
      Quantity: "",
      ExtractedDate: new Date(),
      ExtractedTime: this.currentTime,
      StorageType: "0",
      ExpiryDate: "",
    });
  }

  saveTempStorageType() {
    this.errorMessages = [];
    if (this.storageChangeForm.get('Quantity')?.value == '') {
      this.errorMessages.push("Please enter Quantity");
    }
    if (this.storageChangeForm.get('StorageType')?.value == '0') {
      this.errorMessages.push("Please enter Storage Type");
    }

    if (this.errorMessages.length === 0) {
      var barcodepld = {
        "MotherMilkExtractionID": this.selectedItemToChangeStorage.MotherMilkExtractionID,
        "MotherPatientID": this.selectedView.PatientID,
        "MotherIPID": this.admissionID,
        "Quantity": this.storageChangeForm.get('Quantity')?.value,
        "MotherMilkStorageTypeID": this.storageChangeForm.get('StorageType')?.value,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.wardID,
        "Hospitalid": this.hospitalID,
        "ExtractedDateTime": this.storageChangeForm.get('ExtractedTime')?.value,
        "ExpiryDateTime": this.storageChangeForm.get('ExpiryDate')?.value,
        "Status": "1",
        "ScanPatient": false,
        "AllDetailsVeified": false,
        "ScanBottle": false,
        "ManualReason": $("#SelectedBottlemanualEntryRemarks").val()
      }
      this.config.SaveMilkBottleQty(barcodepld).subscribe(response => {
        if (response.Code == 200) {
          var ssn = this.FetchAdmittedChildDetailsListD?.map((item: any) => item.ChildSSN).join(', ');
          this.FetchActiveMilkBottlesInfo('afterqty');
          this.FetchPrintBarCodeGener(this.selectedBottleId, ssn);
          $("#storageChange").modal('hide');
          $("#milkextractionSavedMsg").modal('show');

        }
      })
    }
    else {
      $("#motherMilkExtractionValidationMsgs").modal('show');
    }
  }
  clearMotherMilkExtractionScreen() {
    this.isNational = false;
    this.FetchAdmittedChildDetailsListD = []
    this.FetchActiveMilkBottlesInfoListD = []
    this.selectedBottleId = "";
    this.trustedUrl = "";
    this.tempStorageTypes = [];
    this.selectedItemToChangeStorage = [];
    this.extractedMilkInfoForm.patchValue({
      Quantity: '',
      ExtractedDate: new Date(),
      ExtractedTime: this.currentTime,
      StorageType: '0',
      ExpiryDate: ''
    });

    this.storageChangeForm.patchValue({
      Quantity: '',
      ExtractedDate: new Date(),
      ExtractedTime: '',
      StorageType: '0',
      ExpiryDate: ''
    });
    this.nationalID = "";
    this.patientsCollection = [];
    this.patientVisits = [];
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
