import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { ConfigService as BedConfig } from '../../ward/services/config.service';
import { HostListener } from '@angular/core';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { cloneDeep } from 'lodash';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

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
  selector: 'app-drug-administration',
  templateUrl: './drug-administration.component.html',
  styleUrls: ['./drug-administration.component.scss'],
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
export class DrugAdministrationComponent implements OnInit, AfterViewInit {
  @ViewChild('timeSlotsContainer', { static: true }) timeSlotsContainer!: ElementRef;
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
  adtDate: any;
  dischargeDate: any;
  payer: any;
  episodeId: any;
  vitalDate: any;
  admissionID: any;
  PatientID: any;
  FetchUserFacilityDataList: any = [];
  FetchNotAdministeredReasonDataList: any = [];
  FetchAdministerTimeDeviationReasonDataList: any = [];
  FetchManualEntryReasonDataList: any = [];
  @Input() IsSwitchWard: any = false;
  @Output() selectedWard = new EventEmitter<any>();
  @Output() filteredDataChange = new EventEmitter<any[]>();
  errorMessage: any;
  drugForm: any;
  drugAdministrationForm: any;
  witnessNurseData: any = [];
  selectedDrug: any;
  selectedDocRemarks: any;
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
  allFiltered: any = [];
  dateArray!: any[];
  listOfDates!: any[];
  selectedDate: any = {};
  timeSlots: string[] = [];
  patinfo: any;
  drugadmChartViewForm!: FormGroup;
  dateRangeValidation = false;
  AllIssueMedications: any = [];
  AllIssueMedications1: any = [];
  checkAllIssues = false;
  drugDataArray: any[] = [];
  drugs: any[] = [];
  showAlert = false;
  scannedItems: any = [];
  remarksRequired = false;
  HoldDisable = false;
  NotAdministeredDisable = false;
  enableOnHold = false;
  savemsgg: any;
  hoursArray: string[] = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  showChart = false;
patientvaccinationsList: any = [];
  searchDrugText: any = '';
    errorMsg: string = "";

  vaccinationsList: any = [];
  reasonsList: any = [];
  doseOrderList: any = [
      { "DoseOrderID": 1, "DoseOrderName": "1" },
      { "DoseOrderID": 2, "DoseOrderName": "2" },
      { "DoseOrderID": 3, "DoseOrderName": "3" },
      { "DoseOrderID": 4, "DoseOrderName": "4" },
      { "DoseOrderID": 5, "DoseOrderName": "5" }
  ];

  constructor(private config: ConfigService,private us: UtilityService, private bed_config: BedConfig, private router: Router, public datepipe: DatePipe, private fb: FormBuilder, private changeDetectorRef: ChangeDetectorRef, private modalService: NgbModal) {
    this.langData = this.config.getLangData();
    this.hospitalId = sessionStorage.getItem('hospitalId');
    this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY, H:mm');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');

    this.initializeDrugMaster();
    this.initializeDrug();

    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }

    this.drugadmChartViewForm = this.fb.group({
      fromdate: new Date(),
      todate: new Date(new Date().setDate(new Date().getDate() + 17))
    });

  }

  initializeDrugMaster() {
    this.drugForm = this.fb.group({
      ScanDrug: [''],
      IsScan: [false],
      OtherDrug: [''],
      IVFluids: ['0']
    });
  }

  initializeDrug() {
    this.drugAdministrationForm = this.fb.group({
      Dose: ['', Validators.required],
      UOM: ['', Validators.required],
      Time: [this.setCurrentTime()],
      Nurse: [''],
      NurseID: [''],
      Remarks: [''],
      IsNotAdministeredReason: [false],
      NotAdministeredReason: [''],
      ManualEntryReason: ['0'],
      AdministerTimeDeviationReason: [''],
      AdministerDoseChangeReason: [''],
      isOnHold: [false],
      HoldStatus: [0],
      VaccinationDoseCount: [1],
      VaccinationType: [1],
      VaccinationID: [0],
      VaccinationReasonID: [0],
      VaccinationReasonOther: ['']
    });
  }

  ngOnInit(): void {
    this.selectedDate.fullDate = moment(new Date()).format('DD-MMM-YYYY');
    this.calculateWeekRange();
    this.IsSwitch = this.IsSwitchWard;
    this.wardID = this.ward.FacilityID;
    this.admissionID = this.selectedView.IPID;
    this.PatientID = this.selectedView.PatientID;
    this.fetchUserFacility();
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
    this.fetchDrugMasters();
    this.fetchVaccinationsAndReasons();
  }

  fetchVaccinationsAndReasons() {
    const url = this.us.getApiUrl(DrugAdministration.FetchSehaVaccinationsAndReasons, {
      HospitalID: this.hospitalId,
      WorkStationID: this.wardID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code === 200) {
          this.vaccinationsList = response.FetchSehaVaccinationsAndReasonsData1List;
          this.reasonsList = response.FetchSehaVaccinationsAndReasonsData2List;
        }
      },
        (err) => {
          console.log(err);
        });
  }

  fetchDrugMasters() {
    this.config.fetchDrugAdministrationM(this.doctorDetails[0].UserId, this.hospitalId).subscribe((response) => {
      if (response.Status === "Success") {
        this.FetchManualEntryReasonDataList = response.FetchManualEntryReasonDataList;
        this.FetchAdministerTimeDeviationReasonDataList = response.FetchAdministerTimeDeviationReasonDataList;
        this.FetchNotAdministeredReasonDataList = response.FetchNotAdministeredReasonDataList;
      }
    },
      (err) => {

      })
  }

  fetchUserFacility() {
    this.bed_config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserWardFacilityDataaList;
      },
        (err: any) => {
        })

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

  calculateWeekRange() {
    //const currentDay = this.currentDate.getDay();

    let currentDate = new Date(this.currentDate);
    this.firstDayOfWeek = new Date(currentDate.setDate(currentDate.getDate() - 1));
    //this.firstDayOfWeek.setDate(this.currentDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
    //this.firstDayOfWeek = new Date(new Date().setDate(new Date().getDate() - 2));

    this.lastDayOfWeek = new Date(this.firstDayOfWeek);
    this.lastDayOfWeek.setDate(this.firstDayOfWeek.getDate() + 6);

    this.currentWeekDates = this.generateDateRange(this.firstDayOfWeek, this.lastDayOfWeek);
    this.currentWeekdate = this.firstDayOfWeek;
    if (this.isNational) {
      this.FetchDrugAdministrationDrugs(moment(this.firstDayOfWeek).format("DD-MMM-YYYY"), moment(this.lastDayOfWeek).format("DD-MMM-YYYY"));
    }
  }

  goToPreviousWeek() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.calculateWeekRange();
  }

  goToNextWeek() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.calculateWeekRange();
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
      datesArray.push({ date: this.datepipe.transform(currentDate, "dd-MMM-yyyy"), value: value, CompletedCount: 0, AllCount: 0 });
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
  FetchDrugAdministrationDrugs(FromDate: any, ToDate: any) {
    this.config.FetchDrugAdministrationDrugs(FromDate, ToDate, this.patientDetails.IPID, this.hospitalId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.calendarMedications = response.FetchDrugAdministrationDrugsDataList;
        this.calendarFilteredMedications = response.FetchDrugAdministrationDrugsDataList;
        this.changeDetectorRef.detectChanges();

        this.drugDataArray = [];
        const groupedData = response.FetchDrugAdministrationDrugsDataList.reduce((acc: any, currentValue: any) => {
          const key = currentValue.Drugname + currentValue.FrequencyDate;
          (acc[key] = acc[key] || []).push(currentValue);
          return acc;
        }, {});

        for (const key in groupedData) {
          if (groupedData.hasOwnProperty(key)) {
            const group = groupedData[key];
            const firstItem = group[0];
            var Dose = firstItem.Dose + " " + firstItem.DoseUOMName + " " + firstItem.Frequency + " " + firstItem.AdmRoute + " " + firstItem.duration + " " + firstItem.durationUOM;
            var StartDate = "Start Date - " + firstItem.StartFrom;
            const drugData: any = {
              Drugname: firstItem.Drugname + ';' + Dose + ';' + StartDate + ';' + firstItem.DoseUOMName + ';' + firstItem.Frequency + ';' + firstItem.AdmRoute + ';' + firstItem.duration + ';' + firstItem.durationUOM,
              FrequencyDate: firstItem.FrequencyDate,
              FrequencyDateTime: group.map((item: any) => {
                let minDate = new Date(item.FrequencyDate);
                minDate.setDate(minDate.getDate() - 1);
                return {
                  time: item.FrequencyDateTime,
                  isEdit: false,
                  wardTaskIntervalID: item.WardTaskIntervalID,
                  remarks: '',
                  drugName: firstItem.Drugname,
                  statusName: item.STATUSName,
                  date: new Date(item.FrequencyDate),
                  minDate,
                  savedRemarks: item.WardTaskRemarks,
                  savedUserName: item.FreqTimeModifiedUserName,
                  savedDate: item.FreqTimeModifiedDate
                }
              }),
              DoseUOMName: firstItem.DoseUOMName,
              Frequency: firstItem.Frequency,
              AdmRoute: firstItem.AdmRoute,
              duration: firstItem.duration,
              durationUOM: firstItem.durationUOM,
            };
            this.drugDataArray.push(drugData);
          }
        }

        const uniqueDrugNames = new Set(this.drugDataArray.map(item => item.Drugname));
        this.drugs = Array.from(uniqueDrugNames);
      }
    },
      (err) => { })
  }

  fetchMedicineForChart(date: any, drugName: any) {
    const result = this.drugDataArray?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date) && data.Drugname === drugName);
    if (result.length > 0) {
        result[0].FrequencyDateTime.forEach((element: any) => {
        const value = this.processTime(element, date, drugName.split(';')[0]);
        let pillName = 'Ppill';
        if (value === 'C') {
          pillName = 'Cpill';
        } else if (value === 'H') {
          pillName = 'Holdpill';
        } else if (value === 'U') {
          pillName = 'UHpill';
        } else if (value === 'M') {
          pillName = 'Mpill';
        } else if (value === 'F') {
          pillName = 'Fpill';
        } 
        element.timeValue = value;
        element.pillName = pillName;
      });
      return result[0].FrequencyDateTime;
    }
    return null;
  }

  fetchMedicineForChartlength(date: any, drugName: any) {
    const result = this.drugDataArray?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date) && data.Drugname === drugName);
    return result.length;
  }

  fetchDateWiseMedicines(date: any) {

    if (this.IsScan && this.scannedItems) {
      const item = this.scannedItems?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date));

      this.currentWeekDates.forEach((element: any) => {
        if (element.date == date) {
          element.CompletedCount = 0;
          element.AllCount = item.length;
        }
      });
      return item;
    }

    this.allFiltered = this.calendarMedications?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date));
    this.currentWeekDates.forEach((element: any) => {
      if (element.date == date) {
        var completed = this.allFiltered?.filter((data: any) => data.STATUSName == "Completed")
        if (completed.length > 0) {
          element.CompletedCount = completed.length;
        }
        element.AllCount = this.allFiltered.length;
      }
    });
    return this.allFiltered;
  }
  OpenAdministrationSave(data: any) {
    var value = false;
    this.isSubmitted = false;
    const cDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
    // if (this.IsScan && data.FrequencyDate == this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString() && data.STATUSName != "Completed") {
    if (this.IsScan && data.STATUSName != "Completed") {
      value = true;
    }
    // else if (Date.parse(data.FrequencyDate) < Date.parse(cDate ? cDate : "") && data.STATUSName != "Completed") {
    //   value = true;
    // }

    // var currentTime;
    // const now = new Date();
    // const hours = String(now.getHours() - 1).padStart(2, '0');
    // const minutes = String(now.getMinutes()).padStart(2, '0');
    // currentTime = `${hours}:${minutes}`;
    // const freqtime = new Date(data.FrequencyDateTime).setHours(-1);
    // if (new Date(`2000-01-01T${freqtime}`) >= new Date(`2000-01-01T${currentTime}`)) {
    //   value = false;
    //   this.errorMessage = "Cannot administer drug before scheduled time.";
    //   $("#errorMsg").modal('show');
    // }
    var currentTime;
    const datepart = data.FrequencyDate.split('-');
    const timepart = data.FrequencyDateTime.split(':');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(datepart[1]);
    const freqtime = new Date(datepart[2], monthIndex, datepart[0], timepart[0], timepart[1]);
    freqtime.setHours(freqtime.getHours() - 1);
    currentTime = new Date();
    if (freqtime >= currentTime) {
      value = false;
      this.errorMessage = "Cannot administer drug before scheduled time.";
      $("#errorMsg").modal('show');
    }

    if (value) {
      this.selectedDrugDetails = data;
      $("#administered_modal").modal('show');
      this.fetchItemPacking(data);
      this.initializeDrug();
      this.drugAdministrationForm.get('Dose')?.setValue(data.DOSE);
      if (Number(data.STATUS) === 3) {
        this.drugAdministrationForm.get('isOnHold')?.setValue(true);
        this.drugAdministrationForm.get('Remarks')?.setValue(data.Remarks);
        this.NotAdministeredDisable = true;
        this.enableOnHold = true;
        this.drugAdministrationForm.get('HoldStatus')?.setValue(1);
      }
      if (Number(data.STATUS) === 4) {
        this.drugAdministrationForm.get('isOnHold')?.setValue(true);
        this.drugAdministrationForm.get('Remarks')?.setValue(data.Remarks);
        this.NotAdministeredDisable = true;
        this.enableOnHold = true;
        this.drugAdministrationForm.get('HoldStatus')?.setValue(2);
      }
      this.selectedDrug = data.Drugname;
      this.selectedDocRemarks = data.DocRemarks;
      this.selectedDrugDateTime = data.FrequencyDate + '-' + data.FrequencyDateTime;
    }
  }

  OpenAllIssuesAdministrationSave(data: any) {
    var value = true;
    this.isSubmitted = false;
    const cDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
    // if (this.IsScan && data.FrequencyDate == this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString() && data.STATUSName != "Completed") {
    //   value = true;
    // }
    // else if (Date.parse(data.FrequencyDate) < Date.parse(cDate ? cDate : "") && data.STATUSName != "Completed") {
    //   value = true;
    // }

    // var currentTime;
    // const now = new Date();
    // const hours = String(now.getHours() - 1).padStart(2, '0');
    // const minutes = String(now.getMinutes()).padStart(2, '0');
    // currentTime = `${hours}:${minutes}`;
    // const freqtime = new Date(data.FrequencyDateTime).setHours(-1);
    // if (new Date(`2000-01-01T${freqtime}`) >= new Date(`2000-01-01T${currentTime}`)) {
    //   value = false;
    //   this.errorMessage = "Cannot administer drug before scheduled time.";
    //   $("#errorMsg").modal('show');
    // }

    var currentTime;
    const datepart = data.FrequencyDate.split('-');
    //const timepart = data.FrequencyDateTime.split(':');
    const timepart = data.FrequencyTime.split(':');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(datepart[1]);
    const freqtime = new Date(datepart[2], monthIndex, datepart[0], timepart[0], timepart[1]);
    freqtime.setHours(freqtime.getHours() - 1);
    currentTime = new Date();
    //const freqtime = new Date(this.selectedDrugDetails.FrequencyDate + ' ' + this.selectedDrugDetails.FrequencyDateTime).setHours(1);
    if (freqtime >= currentTime) {
      value = false;
      this.errorMessage = "Cannot administer drug before scheduled time.";
      $("#errorMsg").modal('show');
    }

    if (value) {
      this.selectedDrugDetails = data;
      $("#administered_modal").modal('show');
      this.fetchItemPacking(data);
      this.initializeDrug();
      this.drugAdministrationForm.get('Dose')?.setValue(data.DOSE);
      if (Number(data.STATUS) === 3) {
        this.drugAdministrationForm.get('isOnHold')?.setValue(data.DOSE);
        this.NotAdministeredDisable = true;
      }
      this.selectedDrug = data.Drugname;
      this.selectedDrugDateTime = cDate + '-' + currentTime;
    }
  }

  parseDate(dateString: any) {
    const parts = dateString.split('-');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(parts[1]);
    const standardizedDate = new Date(parts[2], monthIndex + 1, parts[0]);
    return standardizedDate;
  }

  processTimeForCompletedStatus(inputTime: any, inputDate: any, drug: any, Type: number) {
    let currentDate = new Date();
    var ReturnContent: string = "";
    const parts = inputDate.split('-');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(parts[1]);
    const inputDateTime = new Date(parts[2], monthIndex, parts[0], inputTime.time.split(':')[0], inputTime.time.split(':')[1]);

    inputDateTime.setHours(inputDateTime.getHours() - 2);

    const filteredData = this.calendarFilteredMedications.filter((item: any) => item.Drugname === drug && item.FrequencyDate === inputDate && item.FrequencyDateTime === inputTime.time);

    if (filteredData[0]?.STATUSName === 'Completed') {
      if (Type == 1)
        ReturnContent = filteredData[0]?.AdminDose;
      if (Type == 2)
        ReturnContent = filteredData[0]?.AdministeredDoseUOM;
      if (Type == 3)
        ReturnContent = filteredData[0]?.AdministrationDate;
      if (Type == 4)
        ReturnContent = filteredData[0]?.AdministeredBy;
      if (Type == 5)
        ReturnContent = filteredData[0]?.VerifiedUser;
      if (Type == 6)
        ReturnContent = filteredData[0]?.Remarks;
      if (Type == 7)
        ReturnContent = filteredData[0]?.DrugAdmReasonSectionName;
      if (Type == 8)
        ReturnContent = filteredData[0]?.NotAdministeredReason;
      if (Type == 9)
        ReturnContent = filteredData[0]?.AdministerTimeDeviationReason;
      if (Type == 10)
        ReturnContent = filteredData[0]?.ManualEntryReason;
      //return filteredData[0];
      return ReturnContent;
    }
    else {
      return "";
    }

  }

  processTime(inputTime: any, inputDate: any, drug: any) {
    let currentDate = new Date();

    const parts = inputDate.split('-');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(parts[1]);
    const inputDateTime = new Date(parts[2], monthIndex, parts[0], inputTime.time.split(':')[0], inputTime.time.split(':')[1]);

    inputDateTime.setHours(inputDateTime.getHours() - 2);

    const filteredData = this.calendarFilteredMedications.filter((item: any) => item.Drugname === drug && item.FrequencyDate === inputDate && item.FrequencyDateTime === inputTime.time);

    if (filteredData[0]?.STATUSName === 'Completed') {
      return "C";
    }
    if (filteredData[0]?.STATUSName === 'On Hold') {
      return "H";
    }
    if (filteredData[0]?.STATUSName === 'UnHold') {
      return "U";
    }


    if (new Date(inputDate) > currentDate) {
      return "F";
    }

    if (inputDateTime < currentDate) {
      return "M";
    } else if (inputDateTime > currentDate) {
      return "P";
    }

    return "N";
  }

  fetchItemPacking(data: any) {
    this.bed_config.fetchItemPacking(data.ItemID, this.hospitalId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.FetchScanDrugDataList = response.FetchScanDrugDataList;
        setTimeout(() => {
          this.drugAdministrationForm.get('UOM')?.setValue(data.UOMID);
        }, 500)
      }
    },
      (err) => { })
  }

  onBardCodeIdScanDrug() {
    this.IsScan = false;
    var drug = this.drugForm.get('ScanDrug').value
    if (!drug) {
      this.calendarMedications = this.calendarFilteredMedications;
      return;
    }
    if (drug.length < 3) {
      this.errorMessage = "Invalid Drug";
      $("#errorMsg").modal('show');
      this.calendarMedications = this.calendarFilteredMedications;
    }
    else {
      this.bed_config.FetchPatientPharmacyItemBarCodeString(this.PatientID, this.admissionID, drug, this.wardID, this.hospitalId)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.FetchPatientPharmacyItemBarCodeStringDataList.length > 0) {
            drug = response.FetchPatientPharmacyItemBarCodeStringDataList[0].BarCodeString;
            var drugName = response.FetchPatientPharmacyItemBarCodeStringDataList[0].ItemName;
            const IPID = drug.split('-')[0];
            const ItemId = drug.split('-')[1];
            const BatchNumber = drug.split('-')[2];
            const IssueIDForPatient = drug.split('-')[3];
            var filteredItem = this.calendarMedications.filter((value: any) => Number(value.ItemID) === Number(ItemId) && Number(value.IssueID) === Number(IssueIDForPatient) && Number(value.BatchID) === Number(BatchNumber) && (Number(value.STATUS) == 0 || Number(value.STATUS) === 3 || Number(value.STATUS) === 4) && Date.parse(moment(value.FrequencyDate).format('DD-MMM-YYYY')) == Date.parse(moment(new Date()).format("DD-MMM-YYYY")));

            if (filteredItem.length == 0 && drugName.legend > 0) {
              this.errorMessage = "Scanned Drug : " + drugName + " is not availble for the CurrentDay";//"Invalid Drug";
              $("#errorMsg").modal('show');
              this.calendarMedications = this.calendarFilteredMedications;
            }
            else {
              this.calendarMedications = this.calendarMedications?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) != Date.parse(moment(new Date()).format("DD-MMM-YYYY")));

              if (filteredItem.length === 1) {
                this.calendarMedications.push(filteredItem[0]);
                //const data = this.fetchDateWiseMedicines(moment(new Date()).format('DD-MMM-YYYY'));
                this.allFiltered = this.calendarMedications?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(moment(new Date()).format('DD-MMM-YYYY')));
                this.currentWeekDates.forEach((element: any) => {
                  if (element.date == moment(new Date()).format('DD-MMM-YYYY')) {
                    var completed = this.allFiltered?.filter((data: any) => data.STATUSName == "Completed")
                    if (completed.length > 0) {
                      element.CompletedCount = completed.length;
                    }
                    element.AllCount = this.allFiltered.length;
                  }
                });
                this.IsScan = true;
                this.OpenAdministrationSave(this.allFiltered[0]);
              }
              else {
                filteredItem.forEach((element: any) => {
                  this.calendarMedications.push(element);
                });
              }
              this.scannedItems = filteredItem;
              this.IsScan = true;
            }
          }
          else {
            this.errorMessage = "Invalid Drug";
            $("#errorMsg").modal('show');
            this.calendarMedications = this.calendarFilteredMedications;
          }
        },
          (err) => {

          })



    }
  }

  onchangeScanDrug() {
    this.IsScan = false;
    var drug = this.drugForm.get('ScanDrug').value
    if (!drug) {
      this.calendarMedications = this.calendarFilteredMedications;
      return;
    }
    if (drug.split('-').length < 3) {
      this.errorMessage = "Invalid Drug";
      $("#errorMsg").modal('show');
      this.calendarMedications = this.calendarFilteredMedications;
    }
    else {
      const IPID = drug.split('-')[0];
      const ItemId = drug.split('-')[1];
      const BatchNumber = drug.split('-')[2];
      const IssueIDForPatient = drug.split('-')[3];
     
      // var filteredItem = this.calendarMedications.filter((value: any) => Number(value.ItemID) === Number(ItemId) && Number(value.IssueID) === Number(IssueIDForPatient) && Number(value.BatchID) === Number(BatchNumber) && (Number(value.STATUS) == 0 || Number(value.STATUS) === 3 || Number(value.STATUS) === 4));
    
      // var drugName = this.calendarMedications.filter((value: any) => Number(value.ItemID) === Number(ItemId) && Number(value.BatchID) === Number(BatchNumber) && Number(value.STATUS) == 0);

      var filteredItem = this.calendarMedications.filter((value: any) => Number(value.ItemID) === Number(ItemId) && (Number(value.STATUS) == 0 || Number(value.STATUS) === 3 || Number(value.STATUS) === 4));
    
      var drugName = this.calendarMedications.filter((value: any) => Number(value.ItemID) === Number(ItemId)  && Number(value.STATUS) == 0);



      if (filteredItem.length == 0 && drugName.legend > 0) {
        this.errorMessage = "Scanned Drug :" + drugName[0].Drugname + " is not availble for the CurrentDay";//"Invalid Drug";
        $("#errorMsg").modal('show');
        this.calendarMedications = this.calendarFilteredMedications;
      }
      else {
        this.calendarMedications = this.calendarMedications?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) != Date.parse(moment(new Date()).format("DD-MMM-YYYY")));

        if (filteredItem.length === 1) {
          this.calendarMedications.push(filteredItem[0]);
          //const data = this.fetchDateWiseMedicines(moment(new Date()).format('DD-MMM-YYYY'));
          this.allFiltered = this.calendarMedications?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(moment(new Date()).format('DD-MMM-YYYY')));
          this.currentWeekDates.forEach((element: any) => {
            if (element.date == moment(new Date()).format('DD-MMM-YYYY')) {
              var completed = this.allFiltered?.filter((data: any) => data.STATUSName == "Completed")
              if (completed.length > 0) {
                element.CompletedCount = completed.length;
              }
              element.AllCount = this.allFiltered.length;
            }
          });
          this.IsScan = true;
          this.OpenAdministrationSave(this.allFiltered[0]);
        }
        else {
          filteredItem.forEach((element: any) => {
            this.calendarMedications.push(element);
          });
          const activeItem = filteredItem.find((element: any) => element.STATUSName == "Active");
          if (activeItem) {
            this.IsScan = true;
            this.OpenAdministrationSave(activeItem);
          }
        }
        this.scannedItems = filteredItem;
        this.IsScan = true;
      }
    }
  }

  setCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  searchWitnessNurse(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.bed_config.fetchWitnessNurse(filter, this.hospitalId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.witnessNurseData = response.FetchRODNursesDataList;
          }
        },
          (err) => {

          })
    }
  }
  onWitnessNurseSelected(item: any) {
    if (this.selectedDrugDetails?.IsHighRisk == 'True') {
      if (item.EmpNo === this.doctorDetails[0].EmpNo) {
        this.errorMessage = "Administering Person and Witness should not be the same.";
        this.drugAdministrationForm.get('Nurse')?.setValue('');
        this.drugAdministrationForm.get('NurseID')?.setValue('');
        $('#errorMsg').modal('show');
        return;
      }
      $("#administered_modal").modal('hide');
      const modalRef = this.modalService.open(ValidateEmployeeComponent);
      modalRef.componentInstance.data = {
        UserName: item.EmpNo
      };
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.drugAdministrationForm.get('Nurse')?.setValue(item.EmpNo + '-' + item.Fullname);
          this.drugAdministrationForm.get('NurseID')?.setValue(item.Empid);

        } else {
          this.drugAdministrationForm.get('Nurse')?.setValue('');
          this.drugAdministrationForm.get('NurseID')?.setValue('');
        }
        this.witnessNurseData = [];
        modalRef.close();
        $("#administered_modal").modal('show');
      });
    } else {
      this.drugAdministrationForm.get('Nurse')?.setValue(item.EmpNo + '-' + item.Fullname);
      this.drugAdministrationForm.get('NurseID')?.setValue(item.Empid);
      this.witnessNurseData = [];
    }
  }

  clearDrug() {
    this.IsScan = false;
    this.initializeDrugMaster();
    this.calendarMedications = this.calendarFilteredMedications;
  }

  CheckAllIssues() {
    this.searchDrugText = '';
    this.AllIssueMedications = this.AllIssueMedications1 = [];
    this.config.FetchDrugAdministrationDrugsIPIssues(this.patientDetails.IPID, this.doctorDetails[0].UserId, this.wardID, this.hospitalId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.checkAllIssues = true;
        this.AllIssueMedications = this.AllIssueMedications1 = response.FetchDrugAdministrationDrugsIPIssuesDataList;
      }
    },
      (err) => { })
  }

  onSearchDrug() {
    this.AllIssueMedications = cloneDeep(this.AllIssueMedications1).filter((item: any) =>
      item.Drugname.toLowerCase().includes(this.searchDrugText.toLowerCase().trim())
    );
  }

  selectAllIssuesItem(item: any) {
    this.AllIssueMedications.forEach((element: any, index: any) => {
      if (element.ItemID === item.ItemID && element.IssueID === item.IssueID) {
        element.selected = true;
        this.OpenAllIssuesAdministrationSave(item);
      }
      else {
        element.selected = false;
      }
    });
  }

  clearAdminDrug() {
    this.drugAdministrationForm?.patchValue({
      Nurse: '',
      NurseID: '',
      Remarks: '',
      Time: this.setCurrentTime(),
      IsNotAdministeredReason: false,
      NotAdministeredReason: '',
      ManualEntryReason: '',
      AdministerTimeDeviationReason: '',
      AdministerDoseChangeReason: '',
      HoldStatus: 0,
      VaccinationDoseCount: 1,
      VaccinationType: 1,
      VaccinationID: 0,
      VaccinationReasonID: 0,
      VaccinationReasonOther: ''
    })
  }

  saveDrug() {
    this.isSubmitted = true;
    if (!this.drugAdministrationForm.valid || (this.selectedDrugDetails?.IsHighRisk == 'True' && this.drugAdministrationForm.get('Nurse')?.value === '')) {

      for (const controlName in this.drugAdministrationForm.controls) {
        if (this.drugAdministrationForm.controls.hasOwnProperty(controlName)) {
          const control = this.drugAdministrationForm.get(controlName);
          if (control.invalid) {
          }
        }
      }


      return;
    }

    if (this.isSubmitted && this.checkAllIssues && this.drugAdministrationForm.get('ManualEntryReason')?.value === '0') {
      return;
    }

    if (this.isSubmitted && this.drugAdministrationForm.get('IsNotAdministeredReason')?.value === true && this.drugAdministrationForm.get('NotAdministeredReason')?.value === '') {
      return;
    }

    if (this.isSubmitted && this.drugAdministrationForm.get('isOnHold')?.value === true && this.drugAdministrationForm.get('Remarks')?.value === '') {
      return;
    }

    if (this.doctorDetails[0].EnableNVR === 'YES' && this.selectedDrugDetails?.IsVaccine == 'True' && this.isSubmitted) {
      if (this.drugAdministrationForm.get('VaccinationID')?.value == 0 ||
        this.drugAdministrationForm.get('VaccinationDoseCount')?.value == 0 ||
        this.drugAdministrationForm.get('VaccinationReasonID')?.value == 0 ||
        (this.drugAdministrationForm.get('VaccinationReasonID')?.value == 34 && this.drugAdministrationForm.get('VaccinationReasonOther')?.value === '')) {
        return;
      }
    }

    var currentTime;
    const datepart = this.selectedDrugDetails.FrequencyDate.split('-');
    // const timepart = this.selectedDrugDetails.FrequencyDateTime.split(':');
    const timepart = this.selectedDrugDetails.FrequencyTime;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(datepart[1]);
    const freqtime = new Date(datepart[2], monthIndex, datepart[0], timepart[0], timepart[1]);
    freqtime.setHours(freqtime.getHours() + 1);
    currentTime = new Date();
    //const freqtime = new Date(this.selectedDrugDetails.FrequencyDate + ' ' + this.selectedDrugDetails.FrequencyDateTime).setHours(1);
    const isStatMed = this.selectedDrugDetails.Frequency === 'STAT';
    if (this.isSubmitted && this.drugAdministrationForm.get('isOnHold')?.value === false && this.isSubmitted &&
      this.drugAdministrationForm.get('HoldStatus')?.value == 0 && !isStatMed) {
      if (currentTime > freqtime && this.drugAdministrationForm.get('AdministerTimeDeviationReason')?.value === '') {
        this.remarksRequired = true;
        return;
      }
      else {
        this.remarksRequired = false;
      }
    }
    var STATUSH;
    if (this.drugAdministrationForm.get('HoldStatus')?.value == 1)
      STATUSH = 3;
    else if (this.drugAdministrationForm.get('HoldStatus')?.value == 2)
      STATUSH = 4;
    else
      STATUSH = this.drugAdministrationForm.get('IsNotAdministeredReason')?.value ? 2 : 1;

    var ItemXMLDetails = [];
    ItemXMLDetails.push({
      "ITID": this.selectedDrugDetails.ItemID,
      "FID": this.selectedDrugDetails.FreqID == '' ? 0 : this.selectedDrugDetails.FreqID,
      "SEQ": "1",
      "ST": this.datepipe.transform(new Date(), "dd-MMM-yyyy HH:mm:ss")?.toString(),
      "GB": this.doctorDetails[0].UserId,
      "PID": this.selectedDrugDetails.PrescID == '' ? 0 : this.selectedDrugDetails.PrescID,
      "REM": this.drugAdministrationForm.get('Remarks')?.value,
      "UMD": this.drugAdministrationForm.get('UOM')?.value,
      "BID": this.selectedDrugDetails.BatchID,
      "SAID": this.selectedDrugDetails.IssueID,
      "STAT": STATUSH,//this.drugAdministrationForm.get('isOnHold')?.value ? 3 : this.drugAdministrationForm.get('IsNotAdministeredReason')?.value ? 2 : 1,
      "VBY": this.drugAdministrationForm.get('NurseID')?.value,//this.doctorDetails[0].EmpId,
      "RSN": "",
      "DOS": this.drugAdministrationForm.get('Dose')?.value,
      "WTII": this.selectedDrugDetails.WardTaskIntervalID == '' ? 0 : this.selectedDrugDetails.WardTaskIntervalID,
      "PRD": this.drugForm.get('IVFluids')?.value,
      "PITID": this.selectedDrugDetails.PrescriptionItemId,
      "WTEID": this.selectedDrugDetails.WardTaskEntryID == '' ? 0 : this.selectedDrugDetails.WardTaskEntryID,
      "FRDT": this.selectedDrugDetails.FrequencyDate,
      "FRTM": this.selectedDrugDetails.FrequencyDateTime == undefined ? '' : this.selectedDrugDetails.FrequencyDateTime.split(':')[0],
      "SCANDRUG": this.drugForm.get('IsScan')?.value,
      "TDIFF": "",
      "DDIFF": this.drugAdministrationForm.get('AdministerDoseChangeReason')?.value,
      "MER": "",
      "NARID": this.drugAdministrationForm.get('NotAdministeredReason')?.value,
      "ATDRID": this.drugAdministrationForm.get('AdministerTimeDeviationReason')?.value,
      "MERID": this.drugAdministrationForm.get('ManualEntryReason')?.value,
      "PAID": this.selectedDrugDetails.PrescriptionAdminID
    });

    let payload = {
      "PrescriptionID": this.selectedDrugDetails.PrescID == '' ? 0 : this.selectedDrugDetails.PrescID,
      "IPID": this.selectedDrugDetails.IPID,
      "ItemID": 0,
      "AdministrationDate": this.datepipe.transform(new Date(), "dd-MMM-yyyy HH:mm:ss")?.toString(),
      "ItemXMLDetails": ItemXMLDetails,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "scanPatient": true,
      "AllDetailsVerified": true,
      "Hospitalid": this.hospitalId,
      "VaccinationID": this.drugAdministrationForm.get('VaccinationID')?.value,
      "VaccinationDoseCount": this.drugAdministrationForm.get('VaccinationDoseCount')?.value,
      "VaccinationReasonID": this.drugAdministrationForm.get('VaccinationReasonID')?.value,
      "VaccinationReasonOther": this.drugAdministrationForm.get('VaccinationReasonID')?.value == 34 ? this.drugAdministrationForm.get('VaccinationReasonOther')?.value : '',
      "VaccinationType": this.drugAdministrationForm.get('VaccinationType')?.value
    };

    this.bed_config.saveDrugPrescriptionAdministration(payload).subscribe(response => {
      if (response.Code == 200) {
        $("#administered_modal").modal('hide');
        if (this.isSubmitted && this.drugAdministrationForm.get('isOnHold')?.value === true)
          this.savemsgg = "Medication was Hold";
        else
          this.savemsgg = "Drug Administration Saved Successfully";

        $("#saveMsg").modal('show');
        this.IsScan = false;
        this.clearDrug();
        // this.currentWeekdate = new Date();
        // const currentdate = new Date();
        // this.currentWeekDates = this.generateDateRange(new Date(), new Date(currentdate.getFullYear(), currentdate.getMonth(),currentdate.getDate() + 6)); 
        // this.FetchDrugAdministrationDrugs(moment(new Date()).format("DD-MMM-YYYY"), moment(new Date(currentdate.getFullYear(), currentdate.getMonth(),currentdate.getDate() + 6)).format("DD-MMM-YYYY"));
        this.calculateWeekRange();
        if(this.checkAllIssues)
          this.CheckAllIssues();
      }
    })
  }


  onEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      const drug = this.drugForm.get('ScanDrug').value
      if (!drug.includes('-')) {
        this.onBardCodeIdScanDrug();
      }
      else
        this.onchangeScanDrug();
      this.changeDetectorRef.detectChanges();
      this.drugForm = this.fb.group({
        ScanDrug: [''],
        IsScan: [true]
      });
    }
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
    this.calendarMedications = [];
    this.calendarFilteredMedications = [];
    if (this.nationalID) {
      var BedList = JSON.parse(sessionStorage.getItem("BedList") || '{}');
      const selectedItem = BedList.find((value: any) => value.SSN.toString().toUpperCase() === this.nationalID.toString().toUpperCase());
      if (selectedItem) {
        this.selectedView = selectedItem;
        this.patientDetails = selectedItem;
        sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientDetails));
        this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
        // const admitDate = new Date(this.selectedView.AdmitDate);
        // admitDate.setDate(admitDate.getDate() + 7);
        // const currentdate = new Date();
        // if (currentdate > admitDate) {
        //   this.currentDate = new Date();
        // } else {
        //   this.currentDate = new Date(this.selectedView.AdmitDate);
        // }
        this.currentDate = new Date();
        this.calculateWeekRange();
        this.admissionID = this.selectedView.IPID;
        this.PatientID = this.selectedView.PatientID;
        this.us.setAlertPatientId(this.PatientID);
        //this.FetchDrugAdministrationDrugs(moment(new Date()).format("DD-MMM-YYYY"), moment(new Date(currentdate.getFullYear(), currentdate.getMonth(),currentdate.getDate() + 6)).format("DD-MMM-YYYY"));
        this.FetchDrugAdministrationDrugs(moment(this.firstDayOfWeek).format("DD-MMM-YYYY"), moment(this.lastDayOfWeek).format("DD-MMM-YYYY"));
        this.isNational = true;
        this.showAlert = true;
      }

    }

  }

  createcarousel() {
    // customcarousel
    this.itemContainer = document.getElementById('item-container')!;
    this.prevButton = document.getElementById('drug_prev-btn')!;
    this.nextButton = document.getElementById('drug_next-btn')!;

    this.showItems(this.currentIndex);
    this.addEventListeners();
  }

  // customcarousel
  itemContainer!: HTMLElement;
  prevButton!: HTMLElement;
  nextButton!: HTMLElement;
  currentIndex = 0;
  itemsPerPage = 6;

  showItems(startIndex: number): void {
    if (this.itemContainer) {
      const cards = this.itemContainer.getElementsByClassName('avail_card');
      const endIndex = Math.min(startIndex + this.itemsPerPage, cards.length);

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        if (i >= startIndex && i < endIndex) {
          card.style.display = 'inline-block';
        } else {
          card.style.display = 'none';
        }
      }
    }
  }

  showNextItems(): void {
    if (this.currentIndex + this.itemsPerPage < this.itemContainer.childElementCount) {
      this.currentIndex += 1;
      this.showItems(this.currentIndex);
    }
  }

  showPrevItems(): void {
    if (this.currentIndex - 1 >= 0) {
      this.currentIndex -= 1;
      this.showItems(this.currentIndex);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateItemsPerPage();
  }

  updateItemsPerPage(): void {
    if (window.innerWidth > 768) {
      this.itemsPerPage = 6; // Adjust for desktop view
    } else if (window.innerWidth <= 768 && window.innerWidth > 480) {
      this.itemsPerPage = 6; // Adjust for tablet view
    } else {
      this.itemsPerPage = 3; // Adjust for mobile view
    }
    this.showItems(this.currentIndex);
  }

  addEventListeners(): void {
    this.prevButton.addEventListener('click', () => this.showPrevItems());
    this.nextButton.addEventListener('click', () => this.showNextItems());
  }
  // customcarouselend==============


  filterMedication(type: string) {
    if (type == "notadministered")
      this.calendarMedications = this.calendarFilteredMedications.filter((x: any) => x.STATUSName == "Not Administered");
    else if (type == "active")
      this.calendarMedications = this.calendarFilteredMedications.filter((x: any) => x.STATUSName == "Active");
    else if (type == "completed")
      this.calendarMedications = this.calendarFilteredMedications.filter((x: any) => x.STATUSName == "Completed");
    else if (type == "hold")
      this.calendarMedications = this.calendarFilteredMedications.filter((x: any) => x.STATUSName == "On Hold");
     else if (type == "STAT")
      this.calendarMedications = this.calendarFilteredMedications.filter((x: any) => x.Frequency == "STAT");
    else if (type == "all")
      this.calendarMedications = this.calendarFilteredMedications;
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

  showNewChartDetails() {
    $("#modalNewCalender").modal('show');
    this.showChart = true;
  }

  generateCustomDateArray() {
    this.dateRangeValidation = false;
    const fromdate = this.drugadmChartViewForm.get("fromdate")?.value;
    const todate = this.drugadmChartViewForm.get("todate")?.value;
    if (!fromdate || !todate) {
      return;
    }
    const startDate = new Date(fromdate);
    const endDate = new Date(todate);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


    const diff = endDate.getTime() - startDate.getTime();
    const diffindays = diff / (1000 * 60 * 60 * 24);
    if (diffindays > 18) {
      this.dateRangeValidation = true;
      return;
    }
    const dateArray = [];
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayCode = days[d.getDay()];
      const fullDate = `${d.getDate()}-${this.getMonthString(d.getMonth())}-${d.getFullYear()}`;

      dateArray.push({
        date: d.getDate(),
        dayCode: dayCode,
        fullDate: fullDate
      });
    }

    this.listOfDates = dateArray;
  }

  generateDateArray() {
    const currentDay = this.currentDate.getDay();
    const diff = currentDay - 1;

    this.firstDayOfWeek = new Date(this.currentDate);
    this.firstDayOfWeek.setDate(this.currentDate.getDate() - diff);

    this.lastDayOfWeek = new Date(this.firstDayOfWeek);

    this.lastDayOfWeek.setDate(this.firstDayOfWeek.getDate() + 30);

    const startDate = this.firstDayOfWeek;
    const endDate = this.lastDayOfWeek;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    this.dateArray = [];

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayCode = days[d.getDay()];
      const fullDate = `${d.getDate()}-${this.getMonthString(d.getMonth())}-${d.getFullYear()}`;

      this.dateArray.push({
        date: d.getDate(),
        dayCode: dayCode,
        fullDate: fullDate
      });
    }

    this.listOfDates = this.dateArray;
  }

  getMonthString(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month];
  }

  generateTimeSlots() {
    for (let hour = 0; hour < 24; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      this.timeSlots.push(timeSlot);
    }
  }

  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    return `${hours}:00`;
  }

  scrollToCurrentTime() {
    const currentTimeElement = this.timeSlotsContainer.nativeElement?.querySelector(`[data-time="${this.getCurrentTime()}"]`);

    if (currentTimeElement) {
      currentTimeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  ngAfterViewInit(): void {
    if (this.timeSlotsContainer) {
      this.timeSlotsContainer = this.timeSlotsContainer.nativeElement;
    }
  }

  getDetails(date: any, slot: any) {
    return this.calendarMedications?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date.fullDate) && data.FrequencyDateTime === slot)
  }

  timeselected(date: any) {
    this.selectedDate = date;
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

  openCalendarView() {
    this.checkAllIssues = false;
  }

  onIsHoldChange(onHold: any, Status: any) {
    this.NotAdministeredDisable = !this.NotAdministeredDisable;
    if (this.drugAdministrationForm.get('HoldStatus')?.value == 2 || this.drugAdministrationForm.get('HoldStatus')?.value == 1) {
      this.drugAdministrationForm.patchValue({
        isOnHold: this.NotAdministeredDisable,
        HoldStatus: 0,
        Remarks: ""
      });
    } else {
      this.drugAdministrationForm.patchValue({
        isOnHold: this.NotAdministeredDisable,
        HoldStatus: Status,
        Remarks: ""
      });
    }
  }

  onNotAdministeredChange(event: any) {
    this.HoldDisable = !this.HoldDisable;
  }

  getHourValue(item: any) {
    return item.time.split(':')[0];
  }

  onHourChange(event: any, item: any, date: any) {
    const freqArr = this.drugDataArray?.find((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date.date) && data.Drugname.split(';')[0] === item.drugName).FrequencyDateTime;
    if (freqArr.filter((x: any) => x.time === `${event.target.value}:00`).length > 0) {
      this.errorMessage = "Frequency time " + `${event.target.value}:00` + " already exists for : " + item.drugName;
      $('#errorMsg').modal('show');
    }
    else {
      item.time = `${event.target.value}:00`;
      item.isModified = true;
    }
  }

  onDateChange(event: any, item: any) {
    const modifieDate: any = this.datepipe.transform(event.target.value, "dd-MMM-yyyy")?.toString();
    const freqArr = this.drugDataArray?.find((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(modifieDate) && data.Drugname.split(';')[0] === item.drugName).FrequencyDateTime;
    if (freqArr.filter((x: any) => x.time === item.time).length > 0) {
      this.errorMessage = "Frequency date time " + `${modifieDate} ${item.time}` + " already exists for : " + item.drugName;
      $('#errorMsg').modal('show');
    }
    else {
      item.isModified = true;
    }
  }

  saveWardTaskInterval() {
    let savedArray: any = [];
    this.drugDataArray.forEach((item: any) => {
      item.FrequencyDateTime.forEach((obj: any) => {
        if (obj.isModified) {
          savedArray.push(obj);
        }
      });
    });
    if (savedArray.length === 0) {
      return;
    }
    if (savedArray.length > 0) {
      const noRemarksItem = savedArray.filter((item: any) => !item.remarks);
      if (noRemarksItem.length > 0) {
        this.errorMessage = 'Please Enter Remarks for<br>';
        savedArray.forEach((item: any) => {
          this.errorMessage += `${item.drugName}-${item.time}<br>`;
        });
        $('#errorMsg').modal('show');
        return;
      }
    }

    const payload = {
      "WardTaskIntervalXML": savedArray.map((item: any) => {
        return {
          "WTIID": item.wardTaskIntervalID,
          "FRT": item.time.split(':')[0],
          "RMK": item.remarks,
          "FRD": moment(item.date).format("DD-MMM-YYYY")
        }
      }),
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "HospitalID": this.hospitalId
    };

    this.bed_config.UpdatePatientwardtaskinterval(payload).subscribe((response: any) => {
      if (response.Code === 200) {
        this.savemsgg = "Updated Successfully";
        $("#saveMsg").modal('show');
        this.FetchDrugAdministrationDrugs(moment(this.firstDayOfWeek).format("DD-MMM-YYYY"), moment(this.lastDayOfWeek).format("DD-MMM-YYYY"));
      }
    });
  }

  onPillClick(item: any) {
    if (item.statusName !== 'Completed') {
      item.isEdit = !item.isEdit;
    }
  }

  shouldBlink(item: any) {
    if (item.FrequencyDate && item.FrequencyDateTime) {
      const frequencyDateTime = new Date(`${item.FrequencyDate} ${item.FrequencyDateTime}`);
      const now = new Date();

      const oneHourBefore = new Date(now.getTime() - 60 * 60 * 1000);
      const oneHourAfter = new Date(now.getTime() + 60 * 60 * 1000);

      if (frequencyDateTime >= oneHourBefore && frequencyDateTime <= oneHourAfter) {
        return true;
      }
    }
    return false;
  }
  SaveRetrySeha(item: any) {
    const payload = {
      "InjectionScheduleID": item.InjectionScheduleID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "Hospitalid": this.hospitalId
    };
    this.us.post(DrugAdministration.UpdatePatientPrescriptionInjectionSchedulesStatusSeha, payload).subscribe((response) => {
      if (response.Code === 200) {
        $('#administered_modal').modal('hide');

        this.savemsgg = "Updated Successfully";

        $("#saveMsg").modal('show');
        this.IsScan = false;
        this.clearDrug();
        this.calculateWeekRange();
        if (this.checkAllIssues)
          this.CheckAllIssues();

        //this.searchDrugAdministration()
      } else {
        this.errorMessage = response.SehaerrorMessage;
        $("#errorMsg").modal('show');
        //$('#modalValidationMessage').modal('show');
      }
    },
      (err) => {
        console.log(err)
      });
  }
      FetchPatientVaccinationDetailSeha() {
              $('#SehaVaccResultsModal').modal('show');
              const url = this.us.getApiUrl(DrugAdministration.FetchIPPatientVaccinationDetailSeha, {
                  IPID: this.admissionID,
                  UserID: this.doctorDetails[0].UserId,
                  WorkStationID: this.wardID,
                  HospitalID: this.hospitalId,
              });
              this.us.get(url)
                  .subscribe((response: any) => {
                      if (response.Code === 200) {
                          this.patientvaccinationsList = response.FetchPatientVaccinationDetailSehaVaccDependList;
      
                      }
                  },
                      (err) => {
                          console.log(err);
                      });
          }
}

export const DrugAdministration = {
    FetchSehaVaccinationsAndReasons: 'FetchSehaVaccinationsAndReasons?HospitalID=${HospitalID}&WorkStationID=${WorkStationID}',
    UpdatePatientPrescriptionInjectionSchedulesStatusSeha: 'UpdatePatientPrescriptionInjectionSchedulesStatusSeha',
     FetchIPPatientVaccinationDetailSeha: 'FetchIPPatientVaccinationDetailSeha?IPID=${IPID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
};