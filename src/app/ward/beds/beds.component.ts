import { Component, ElementRef, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from '../services/config.service';
import { Router } from '@angular/router';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { InstructionsToNurseComponent } from 'src/app/portal/instructions-to-nurse/instructions-to-nurse.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { cloneDeep } from 'lodash';
import { patientadmission } from 'src/app/admission/patientadmission/patientadmission.component';

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
  selector: 'app-beds',
  templateUrl: './beds.component.html',
  styleUrls: ['./beds.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe,
  ],
})
export class BedsComponent implements OnInit {
  doctorDetails: any;
  hospitalId: any;
  location: any;
  currentdate: any;
  langData: any;
  ward: any;
  FetchBedsFromWardDataList: any;
  FetchBedsFromWardDataList1: any;
  FetchMETCALLWardDataList: any;
  selectedOption: string = 'Bed';
  selectedBedOption: string = 'Occupied';
  filterIntubated: boolean = false;
  filterBedSore: boolean = false;
  FetchUserFacilityDataList: any;
  FetchBedStatusList: any;
  AllocatedCount: any;
  BedTransfercount: any;
  wardID: any;
  wardIdForVirtualDischarge: any;
  Status: any;
  // selectedWard: any;

  isFilter: boolean = false;
  PatientsListToFilter: any;

  selectedPatientSSN: any;
  selectedPatientName: any;
  selectedPatientGender: any;
  selectedPatientAge: any;
  selectedPatientMobile: any;
  selectedPatientVTScore: any;
  selectedPatientHeight: any;
  selectedPatientWeight: any;
  selectedPatientBloodGrp: any;
  selectedPatientVitalsDate: any;
  selectedPatientBPSystolic: any;
  selectedPatientBPDiastolic: any;
  selectedPatientTemperature: any;
  selectedPatientPulse: any;
  selectedPatientSPO2: any;
  selectedPatientRespiration: any;
  selectedPatientConsciousness: any;
  selectedPatientO2FlowRate: any;
  selectedPatientAllergies: any;
  selectedPatientMedications: any = [];
  moreInfoTranfersList: any = [];
  selectedPatientIsVip: boolean = false;
  selectedPatientClinicalInfo: any;
  selectedPatientIsPregnancy: boolean = false;
  selectedPatientPregnancyTrisemister: any;
  selectall = false;
  datesForm!: FormGroup;
  procdatesForm!: FormGroup;
  toDate = new FormControl(new Date());
  IsApproval = false;
  selectedInstructionsList: any = [];
  FetchApprovalInfoDataList: any;
  FetchDoctorReferralOrdersDataList: any;
  WardDoctorID: any;
  IsDoctor: any;
  IsNurse: any;
  IsHeadNurse: any;
  IsRODoctor: any;
  IsRespiratoryTherapist: any;
  patinfo: any;
  selectedPatient: any;
  showNurseInst = false;
  showDailyCharges = false;
  fitForDischarge = false;
  dischargeIntimationRiased = false;
  ClinicVisitAfterDays = "0";
  BedTransferRequestID = "0";
  dailyCharges: any = [];
  drugOrders: any = [];
  procOrders: any = [];
  selectdrugOrderAll = false;
  selectprocOrderAll = false;
  selectdrugOrderQtyAll = false;
  selectprocOrderQtyAll = false;
  yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
  today = new Date();
  filteredemrBedsDataList: any = [];
  emrBedsDataList: any;
  userForm: any;
  FetchHospitalNurseDataaList: any;
  NurseBedCount: string = "";
  NurseBedDetails: string = "";
  NurseID: any;
  SelectedBedInfo: any = [];
  bedNo: string = "";
  showBedValidation: boolean = false;
  quantity = 1;
  errorMessage: any;
  clinicalProceduresViewD: any = [];
  clinicalProceduresView: any = [];
  showPainAssessment = false;
  IsScoreSaved = false;
  selectedPainScore: any = 0;
  savedbedsBoardFeaturesList: any = [];
  isSurgical: boolean = false;
  isShowAllBeds: boolean = false;
  number = Number;
  ettData: any;
  markerType: string = '';
  markers: any = [];
  lastMarkerIndex: any;
  currentdateD = new Date();
  errorMessages: any = [];
  HistoryCheck = false;
  isVerified = false;
  FetchBedsFromWardDataListGM: any;
  FetchBedsFromWardDataListGF: any;
  BedSoreCount: Number = 0;
  IntubatedCount: Number = 0;
  saveMsg: any;
  ValidationMsg: any;
  FetchDoctorReferralOrdersDataListD: any;
  VerifiedBy: any;
  VerifiedDate: any;
  showPatientNotSelectedValidation = false;
  selectedPatientForVirtualDischarge: any;
  bedsListForVirtualDischarge: any = [];
  showVirtualDischargeValidation: boolean = false;
  InititalAssement: any;
  trustedUrl: any;
  trustedUrlBase64: any;
  isAdultPrint = true;

  reprintReason: string = "";
  reprintReasons: any = [];
  showRemarksMandatoryMsg = false;
  showTypeMandatoryMsg = false;
  showRemarksForOther = false;
  reprintSelectedItem: any;

  markersTypeCollection: any = {
    'line': {
      TNAME: 'Line',
      TID: '1'
    },
    'drain': {
      TNAME: 'Drain',
      TID: '2'
    },
    'airways': {
      TNAME: 'Airways',
      TID: '3'
    }
  }

  placedByCollection: any = [
    { id: '1', label: 'Anesthesiologist' },
    { id: '2', label: 'ED Physician' },
    { id: '3', label: 'Fellow' },
    { id: '4', label: 'Physician' },
    { id: '5', label: 'Nurse' },
    { id: '6', label: 'PA/APRN' },
    { id: '7', label: 'Resident' },
    { id: '8', label: 'RT' },
    { id: '9', label: 'Other' }
  ];

  sizeCollection: any = ['2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5'];

  attemptsCollection: any = [
    { id: '1', label: '1' },
    { id: '2', label: '2' },
    { id: '3', label: '3 or more' }
  ]

  ettForm!: FormGroup;
  subscription: any;
  selectedItem: any;

  selectBedOption(option: string) {
    this.selectedBedOption = option;
  }

  selectOption(option: string) {
    this.selectedOption = option;

    if (option === "Bed") {
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => a.Bed.localeCompare(b.Bed));
    }
    else if (option === "Doctor") {
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => a.DoctorName.localeCompare(b.DoctorName));
    }
    else if (option === "BedSore") {
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((b: any, a: any) => a.Bedsore.localeCompare(b.Bedsore));
    }
    else if (option === "Intubated") {
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((b: any, a: any) => a.IntubatedID.localeCompare(b.IntubatedID));
    }
    else {
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => new Date(b.AdmitDate).getTime() - new Date(a.AdmitDate).getTime());
    }
  }

  selectBedSore() {
    this.filterBedSore = !this.filterBedSore;
    this.filterBedSoreAndIntubated();
  }

  selectIntubated() {
    this.filterIntubated = !this.filterIntubated;
    this.filterBedSoreAndIntubated();
  }

  filterBedSoreAndIntubated() {
    if (this.filterBedSore && this.filterIntubated) {
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList1.filter((a: any) => (a.Bedsore != '' && a.Bedsore != '0') || (a.IntubatedID != '' && a.IntubatedID != '0'));
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((b: any, a: any) => a.Bedsore.localeCompare(b.Bedsore));
    }
    else if (this.filterBedSore) {
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList1.filter((a: any) => a.Bedsore != '' && a.Bedsore != '0');
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((b: any, a: any) => a.Bedsore.localeCompare(b.Bedsore));
    }
    else if (this.filterIntubated) {
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList1.filter((a: any) => a.IntubatedID != '' && a.IntubatedID != '0');
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((b: any, a: any) => a.IntubatedID.localeCompare(b.IntubatedID));
    }
    else if (!this.filterIntubated && !this.filterBedSore) {
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList1;
    }
  }

  constructor(private fb: FormBuilder, private us: UtilityService, private portalConfig: ConfigService, private config: BedConfig, private op_config: ConfigService, private router: Router, public datepipe: DatePipe, private modalService: GenericModalBuilder, private modalSvc: NgbModal) {
    sessionStorage.setItem("FeatureID", "2434");
    this.langData = this.portalConfig.getLangData();
    this.datesForm = this.fb.group({
      fromdate: [''],
      todate: ['']
    });

    this.procdatesForm = this.fb.group({
      fromdate: [''],
      todate: ['']
    });

    this.userForm = this.fb.group({
      EmpNo: ['', Validators.required],
      EmpName: ['', Validators.required],
      EmpID: ['', Validators.required],
      Department: ['', Validators.required],
      NurseID: ['', Validators.required],
      NurseBedCount: ['', Validators.required],
      NurseBedDetails: ['', Validators.required]
    });

    this.ettForm = this.fb.group({
      placementDate: [moment(), Validators.required],
      placementTime: [this.setCurrentTime(), Validators.required],
      removalDate: [moment().add(3, 'days'), Validators.required],
      removalTime: [this.setCurrentTime(), Validators.required],
      ekpDate: new Date(),
      placedBy: [],
      placedByComment: '',
      size: '2',
      attempts: '1',
      attemptOthers: '3',
      days: 3
    });

    this.ettForm.valueChanges.subscribe((value: any) => {
      const currentMarker = this.markers.find((marker: any) => marker.current === true);
      if (currentMarker) {
        let placedByArray: any = [];
        value.placedBy?.forEach((id: any) => {
          const placedByItem = this.placedByCollection.find((by: any) => by.id === id);
          let placedByText = `${placedByItem.id}-${placedByItem.label}`;
          if (id === '9' && value.placedByComment) {
            placedByText += `:${value.placedByComment}`
          }
          placedByArray.push(placedByText);
        });
        currentMarker.placementDate = value.placementDate;
        currentMarker.placementTime = value.placementTime;
        const removalDate = moment(value.placementDate).add(value.days, 'days');
        this.ettForm.patchValue({
          removalDate
        }, {
          emitEvent: false
        });
        currentMarker.removalDate = value.removalDate;
        currentMarker.removalTime = value.removalTime;
        currentMarker.value = `Placement Date: ${moment(value.placementDate).format('DD-MMM-YYYY')} ${value.placementTime} Removal Date: ${moment(removalDate).format('DD-MMM-YYYY')} ${value.removalTime}`;
        currentMarker.placedBy = placedByArray.toString();
        currentMarker.size = value.size;
        currentMarker.attempts = value.attempts !== '3' ? value.attempts : value.attemptOthers.toString()
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit(): void {

    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY, H:mm');
    this.Status = 3;
    this.WardDoctorID = this.doctorDetails[0].EmpId;
    this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
    this.IsNurse = sessionStorage.getItem("IsNurse");
    this.IsRODoctor = sessionStorage.getItem("IsRODoctor");
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.IsRespiratoryTherapist = sessionStorage.getItem("IsRespiratoryTherapist");
    //this.wardID = this.ward.FacilityID;




    this.fetchBedStatus();

    this.fetchUserFacility();
    sessionStorage.setItem("FromBedBoard", "false");

    this.datesForm.patchValue({
      fromdate: this.toDate.value,
      todate: this.toDate.value
    });
    this.procdatesForm.patchValue({
      fromdate: this.toDate.value,
      todate: this.toDate.value
    });

    this.subscription = this.us.closeModalEvent.subscribe(() => {
      this.RelaodBedsBoard();
    });
  }
  FetchVaccantBedsFromWard() {
    this.filterIntubated = false;
    this.filterBedSore = false;

    this.config.FetchVaccantBedsFromWard(this.wardID, 1, this.doctorDetails[0].UserId, this.wardID, this.hospitalId)
      .subscribe((response: any) => {
        this.AllocatedCount = response.FetchVaccantBedsFromWardDataList.length;
      },
        (err) => {
        })
  }

  fetchWardBedTransferRequests() {
    //var FromDate = this.datepipe.transform(this.datesForm.value['fromdate'], "dd-MMM-yyyy")?.toString();
    var FromDate = this.datepipe.transform(new Date().setDate(new Date().getDate() - 60), "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.datesForm.value['todate'], "dd-MMM-yyyy")?.toString();

    this.config.FetchBedTransferWardRequests(this.wardID, FromDate, ToDate, this.hospitalId)
      .subscribe((response: any) => {
        this.BedTransfercount = response.FetchBedTransferWardRequestsDataList.filter((x: any) => x.STATUS != '3').length;
      },
        (err) => {
        })
  }




  fetchBedStatus() {
    this.config.fetchBedStatus(this.hospitalId)
      .subscribe((response: any) => {
        this.FetchBedStatusList = response.FetchBedStatusDataList;
      },
        (err) => {
        })
  }
  fetchBedStatusByValue(filteredvalue: any = "") {
    this.config.fetchBedsFromWard(this.wardID, 0, filteredvalue, this.doctorDetails[0].EmpId, this.hospitalId, this.isSurgical)
      .subscribe((response: any) => {
        this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList1 = response.FetchBedsFromWardDataList;
        this.FetchMETCALLWardDataList = response.FetchMETCALLWardDataList;
        this.mapMedications(response.PreviousMedicationBedDataList);
        this.mapAnnotations(response.BedsboardPatientAnnotationDataList);
        if (this.FetchBedsFromWardDataList) {
          this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => a.Bed.localeCompare(b.Bed));
          this.FetchBedsFromWardDataListGM = this.FetchBedsFromWardDataList.filter((x: any) => x.GenderID === '1').length;
          this.FetchBedsFromWardDataListGF = this.FetchBedsFromWardDataList.filter((x: any) => x.GenderID === '2').length;

          this.BedSoreCount = this.FetchBedsFromWardDataList.filter((x: any) => x.Bedsore != '' && x.Bedsore != '0').length;
          this.IntubatedCount = this.FetchBedsFromWardDataList.filter((x: any) => x.IntubatedID != '' && x.IntubatedID != '0').length;
        }
        if (this.ward?.FacilityName?.toLowerCase().indexOf('nicu') !== -1) {
          this.InititalAssement = 1;
        } else if (this.ward?.FacilityName?.toLowerCase().indexOf('nursery ward') !== -1) {
          this.InititalAssement = 2;
        } else {
          this.InititalAssement = 0;
        }
      },
        (err) => {
        })

  }
  ShowAllBeds(type: any, item: any) {

    if (type === "yes" && this.selectall) {
      sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
      sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
      this.router.navigate(['/ward/DrugAdministration']);
      return;
    }

    this.selectall = !this.selectall;

    if (this.selectall)
      this.WardDoctorID = 0;
    else {
      this.WardDoctorID = this.doctorDetails[0].EmpId;
    }


    this.config.fetchBedsFromWard(this.wardID, this.WardDoctorID, this.Status, this.doctorDetails[0].EmpId, this.hospitalId, this.isSurgical)
      .subscribe((response: any) => {
        this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList1 = response.FetchBedsFromWardDataList;
        this.FetchMETCALLWardDataList = response.FetchMETCALLWardDataList;
        this.mapMedications(response.PreviousMedicationBedDataList);
        this.mapAnnotations(response.BedsboardPatientAnnotationDataList);



        if (this.FetchBedsFromWardDataList) {
          this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => a.Bed.localeCompare(b.Bed));
          this.FetchBedsFromWardDataListGM = this.FetchBedsFromWardDataList.filter((x: any) => x.GenderID === '1').length;
          this.FetchBedsFromWardDataListGF = this.FetchBedsFromWardDataList.filter((x: any) => x.GenderID === '2').length;

          this.BedSoreCount = this.FetchBedsFromWardDataList.filter((x: any) => x.Bedsore != '' && x.Bedsore != '0').length;
          this.IntubatedCount = this.FetchBedsFromWardDataList.filter((x: any) => x.IntubatedID != '' && x.IntubatedID != '0').length;


        }
        this.PatientsListToFilter = JSON.parse(JSON.stringify(this.FetchBedsFromWardDataList));

        if (type === 'yes') {
          sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
          sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
          this.router.navigate(['/ward/DrugAdministration']);
        }
        if (this.ward?.FacilityName?.toLowerCase().indexOf('nicu') !== -1) {
          this.InititalAssement = 1;
        } else if (this.ward?.FacilityName?.toLowerCase().indexOf('nursery ward') !== -1) {
          this.InititalAssement = 2;
        } else {
          this.InititalAssement = 0;
        }
      },
        (err) => {
        })
  }

  fetchBedsFromWard() {
    this.config.fetchBedsFromWard(this.wardID, this.WardDoctorID, this.Status, this.doctorDetails[0].EmpId, this.hospitalId, this.isSurgical)
      .subscribe((response: any) => {
        this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList1 = response.FetchBedsFromWardDataList;
        this.FetchMETCALLWardDataList = response.FetchMETCALLWardDataList;
        this.mapMedications(response.PreviousMedicationBedDataList);
        this.mapAnnotations(response.BedsboardPatientAnnotationDataList);
        if (this.FetchBedsFromWardDataList) {
          this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => a.Bed.localeCompare(b.Bed));
          this.FetchBedsFromWardDataListGM = this.FetchBedsFromWardDataList.filter((x: any) => x.GenderID === '1').length;
          this.FetchBedsFromWardDataListGF = this.FetchBedsFromWardDataList.filter((x: any) => x.GenderID === '2').length;

          this.BedSoreCount = this.FetchBedsFromWardDataList.filter((x: any) => x.Bedsore != '' && x.Bedsore != '0').length;
          this.IntubatedCount = this.FetchBedsFromWardDataList.filter((x: any) => x.IntubatedID != '' && x.IntubatedID != '0').length;
        }
        this.PatientsListToFilter = JSON.parse(JSON.stringify(this.FetchBedsFromWardDataList));
        if (this.ward?.FacilityName?.toLowerCase().indexOf('nicu') !== -1) {
          this.InititalAssement = 1;
        } else if (this.ward?.FacilityName?.toLowerCase().indexOf('nursery ward') !== -1) {
          this.InititalAssement = 2;
        } else {
          this.InititalAssement = 0;
        }

      },
        (err) => {
        })
  }

  mapMedications(medicationList: any) {
    this.FetchBedsFromWardDataList.forEach((item: any) => {
      item.medications = medicationList.filter((data: any) => data.AdmissionID.toString() === item.AdmissionID.toString())
    })
  }

  mapAnnotations(annotationsList: any) {
    this.FetchBedsFromWardDataList.forEach((item: any) => {
      item.annotations = annotationsList.filter((data: any) => data.Admissionid.toString() === item.AdmissionID.toString());
      item.lineAnnotations = annotationsList.filter((data: any) => data.Admissionid.toString() === item.AdmissionID.toString() && data.AnnotationTypeID === '1' && new Date(data.RemovalDateTime) > new Date());
      item.drainAnnotations = annotationsList.filter((data: any) => data.Admissionid.toString() === item.AdmissionID.toString() && data.AnnotationTypeID === '2' && new Date(data.RemovalDateTime) > new Date());
      item.airwaysAnnotations = annotationsList.filter((data: any) => data.Admissionid.toString() === item.AdmissionID.toString() && data.AnnotationTypeID === '3' && new Date(data.RemovalDateTime) > new Date());
    })
  }

  fetchUserFacility() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserWardFacilityDataaList;
        this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');


        this.wardID = this.wardIdForVirtualDischarge = this.ward.FacilityID === undefined ? this.ward : this.ward.FacilityID;
        if (this.wardID === undefined) {
          this.wardID = this.ward;
        }
        if (this.IsDoctor === 'false')
          this.ShowAllBeds("no", []);
        else if (this.IsRODoctor === 'true')
          this.ShowAllBeds("no", []);
        else
          this.fetchBedsFromWard();

        this.FetchVaccantBedsFromWard();
        this.fetchWardBedTransferRequests();
        this.FetchMedicalTypeBedsBoardConfigurations();


      },
        (err) => {
        })



  }
  GoBackToHome() {
    this.router.navigate(['/login/doctor-home'])
  }

  redirecttoVitalScreen(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/ward/ipvitals']);
  }

  redirectToLabTrend(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.router.navigate(['/ward/labtrend']);
  }
  redirectToDrugAdministration(item: any) {
    this.ShowAllBeds("yes", item);
  }

  redirectToSampleCollection(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/ward/samplecollection']);
  }

  redirecttoProgressNotesScreen(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    if (item.Ward === 'ICCU' && (this.IsDoctor === 'true' || this.IsRODoctor === 'true'))
      this.router.navigate(['/ward/icu-progress-note']);
    else
      this.router.navigate(['/ward/progress-note']);
  }

  redirecttoProgressNotesNewScreen(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    if (item.Ward === 'ICCU' && (this.IsDoctor === 'true' || this.IsRODoctor === 'true'))
      this.router.navigate(['/ward/icu-progress-note-new']);
    else
      this.router.navigate(['/ward/progress-note']);
  }

  redirecttoProgressNotes(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.router.navigate(['/ward/progress-note']);
  }


  redirecttoDischargeSummary(item: any) {
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("PatientID", item.PatientID);
    this.router.navigate(['/shared/dischargeSummary']);
  }

  redirecttoCNHIDischargeSummary(item: any) {
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("PatientID", item.PatientID);
    this.router.navigate(['/shared/chi-dischargeSummary']);
  }

  filterChangeData(event: any) {
    this.isFilter = true;
    if (event.length === 0) {
      this.FetchBedsFromWardDataList = this.PatientsListToFilter;
      this.isFilter = false;
    }
    else if (event.length > 2) {
      let filteredresponse = this.PatientsListToFilter.filter((x: any) => (x?.SSN.includes(event) || x?.PatientName.toLowerCase().includes(event.toLowerCase())));
      this.FetchBedsFromWardDataList = filteredresponse;
    }
  }
  onSelectWard() {
    this.isSurgical = false;
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
    this.fetchBedsFromWard();
    this.FetchVaccantBedsFromWard();
    this.fetchWardBedTransferRequests();
  }
  navigatetoCaseSheet(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedCard", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    this.router.navigate(['/home/doctorcasesheet']);
  }

  redirectToEndoScopy(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("FromRadiology", "false");
    sessionStorage.setItem("FromBedBoard", "true");
    this.router.navigate(['/ward/endoscopy']);
  }
  navigatetoAdmissionReconciliation(item: any) {
    // sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    // sessionStorage.setItem("FromRadiology", "false");
    // sessionStorage.setItem("navigation", "AdmissionReconciliation");
    // this.router.navigate(['/ward/endoscopy']);
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedCard", JSON.stringify(item));
    sessionStorage.setItem("navigation", "AdmissionReconciliation");
    this.router.navigate(['/home/doctorcasesheet']);
  }
  navigatetoVTEForms(item: any) {
    // sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    // sessionStorage.setItem("FromRadiology", "false");
    // sessionStorage.setItem("navigation", "VTEForms");
    // this.router.navigate(['/ward/endoscopy']);
    if (item.VTEOrderID != '') {
      this.config.FetchFinalSaveVTERiskAssessment(item.AdmissionID, this.doctorDetails[0].UserId, this.wardID, this.hospitalId)
        .subscribe((response: any) => {
          if (response.Code === 200 && response.FetchFinalSaveVTERiskAssessmentDataList.length > 0) {
            const vterisk = response.FetchFinalSaveVTERiskAssessmentDataList.find((x: any) => x.RiskAssessmentOrderID === item.VTEOrderID);
            if (vterisk) {
              const vteformtype = vterisk.AssessmentType;
              sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
              sessionStorage.setItem("PatientDetails", JSON.stringify(item));
              sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
              sessionStorage.setItem("selectedView", JSON.stringify(item));
              sessionStorage.setItem("selectedCard", JSON.stringify(item));
              sessionStorage.setItem("navigation", vteformtype);
              this.router.navigate(['/home/doctorcasesheet']);
            }
            else {
              this.FetchPatientFinalObgVTEFrom(item);
            }
          }
          else {
            this.FetchPatientFinalObgVTEFrom(item);
          }
        },
          (err) => {
          })
    }
    else {
      this.redirecttoVte(item);
    }
  }
  FetchPatientFinalObgVTEFrom(item: any) {
    this.config.FetchPatientFinalObgVTEFrom("0", item.AdmissionID, this.doctorDetails[0].UserId, this.wardID, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code === 200 && response.FetchPatientFinalObgVTEFromPatDataList.length > 0) {
          const vterisk = response.FetchPatientFinalObgVTEFromPatDataList.find((x: any) => x.RiskAssessmentOrderID === item.VTEOrderID);
          if (vterisk) {
            const vteformtype = vterisk.AssessmentType;
            sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
            sessionStorage.setItem("PatientDetails", JSON.stringify(item));
            sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
            sessionStorage.setItem("selectedView", JSON.stringify(item));
            sessionStorage.setItem("selectedCard", JSON.stringify(item));
            sessionStorage.setItem("navigation", "VTE ObGyne");
            this.router.navigate(['/home/doctorcasesheet']);
          }
          else {
            this.redirecttoVte(item);
          }
        }
        else {
          this.redirecttoVte(item);
        }
      },
        (err) => {
        })
  }
  redirecttoVte(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedCard", JSON.stringify(item));
    sessionStorage.setItem("navigation", "VTEForms");
    this.router.navigate(['/home/doctorcasesheet']);
  }

  navigateToMedicalAssesment(item: any) {
    if (this.ward?.FacilityName?.toLowerCase().indexOf('nicu') !== -1) {
      item.HospitalID = this.hospitalId;
      sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
      sessionStorage.setItem("selectedView", JSON.stringify(item));
      sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
      sessionStorage.setItem('selectedTemplateId', '23');
      this.router.navigate(['/templates']);
    } else if (this.ward?.FacilityName?.toLowerCase().indexOf('nursery ward') !== -1) {
      item.HospitalID = this.hospitalId;
      sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
      sessionStorage.setItem("selectedView", JSON.stringify(item));
      sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
      sessionStorage.setItem('selectedTemplateId', '66');
      this.router.navigate(['/templates']);
    } else {
      sessionStorage.setItem("PatientDetails", JSON.stringify(item));
      sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
      sessionStorage.setItem("selectedView", JSON.stringify(item));
      sessionStorage.setItem("selectedCard", JSON.stringify(item));
      sessionStorage.setItem("navigation", "MedicalAssessment");
      this.router.navigate(['/home/doctorcasesheet']);
    }
  }
  navigatetoDischargeReconciliation(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    this.router.navigate(['/ward/dischargereconciliation']);
  }
  navigatetoPatientSummary(item: any) {
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    sessionStorage.setItem("PatientID", item.PatientID);
    this.router.navigate(['/shared/patientfolder']);
    //this.router.navigate(['/home/summary']);
  }
  redirectToNursingDashboard(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/ward/nursingdashboard']);
  }
  navigatetoLTCAU(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("FromRadiology", "false");
    sessionStorage.setItem("FromBedBoard", "true");
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/ward/longterm-adultcareunit']);
  }
  navigatetoPatAdmission(item: any) {
    sessionStorage.setItem("FromBedBoard", "true");
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.router.navigate(['/admission/patientadmission']);
  }

  navigateToCommunications(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    this.router.navigate(['/communications']);
  }

  navigateToMedicalEmrEvents(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    this.router.navigate(['/ward/medical-emr-events']);
  }

  showPatientInfo(pinfo: any) {
    $("#quick_info").modal('show');
    this.selectedPatientSSN = pinfo.SSN;
    this.selectedPatientName = pinfo.PatientName;
    this.selectedPatientGender = pinfo.Gender;
    this.selectedPatientAge = pinfo.FullAge;
    this.selectedPatientMobile = pinfo.MobileNo;
    this.selectedPatientHeight = pinfo.Height;
    this.selectedPatientWeight = pinfo.Weight;
    this.selectedPatientBloodGrp = pinfo.BloodGroup;
    this.selectedPatientIsVip = pinfo.IsVIP == "Non-VIP" ? false : true;
    if (pinfo.IsPregnancy) {
      this.selectedPatientIsPregnancy = true;
      this.selectedPatientPregnancyTrisemister = pinfo.PregnancyContent;
    }
    else {
      this.selectedPatientIsPregnancy = false;
      this.selectedPatientPregnancyTrisemister = "";
    }
    this.op_config.FetchPatientFileInfo(pinfo.EpisodeID, pinfo.IPID, this.hospitalId, pinfo.PatientID, pinfo.RegCode).subscribe((response: any) => {
      if (response.objPatientMedicationsList.length > 0) {
        this.selectedPatientMedications = response.objPatientMedicationsList;
      }
      else {
        this.selectedPatientMedications = [];
      }
      if (response.objPatientVitalsList.length > 0) {
        this.selectedPatientVitalsDate = response.objPatientVitalsList[0].CreateDate;
        this.selectedPatientBPSystolic = response.objPatientVitalsList[0].Value;
        this.selectedPatientBPDiastolic = response.objPatientVitalsList[1].Value;
        this.selectedPatientTemperature = response.objPatientVitalsList[2].Value;
        this.selectedPatientPulse = response.objPatientVitalsList[3].Value;
        this.selectedPatientSPO2 = response.objPatientVitalsList[4].Value;
        this.selectedPatientRespiration = response.objPatientVitalsList[5].Value;
        if (response.objPatientVitalsList.length > 6 && response.objPatientVitalsList[6].Value != undefined)
          this.selectedPatientConsciousness = response.objPatientVitalsList[6].Value;
        else
          this.selectedPatientConsciousness = "";
        if (response.objPatientVitalsList.length > 7 && response.objPatientVitalsList[7].Value != undefined)
          this.selectedPatientO2FlowRate = response.objPatientVitalsList[7].Value;
        else
          this.selectedPatientO2FlowRate = "";
      }
      else {
        this.selectedPatientVitalsDate = "";
        this.selectedPatientBPSystolic = "";
        this.selectedPatientBPDiastolic = "";
        this.selectedPatientTemperature = "";
        this.selectedPatientPulse = "";
        this.selectedPatientSPO2 = "";
        this.selectedPatientRespiration = "";
      }
      if (response.objPatientAllergyList.length > 0) {
        this.selectedPatientAllergies = response.objPatientAllergyList;
      }
      else {
        this.selectedPatientAllergies = [];
      }
      if (response.objobjPatientClinicalInfoList.length > 0) {
        this.selectedPatientClinicalInfo = response.objobjPatientClinicalInfoList[0].ClinicalCondtion;
        this.selectedPatientVTScore = response.objobjPatientClinicalInfoList[0].VTScore;
      }
      else {
        this.selectedPatientClinicalInfo = ""
        this.selectedPatientVTScore = "";
      }
      if (response.FetchPatientadmissionBedHistoryDataList.length > 0) {
        this.moreInfoTranfersList = response.FetchPatientadmissionBedHistoryDataList;
      }
      else {

      }
    })
  }

  redirectToShiftHandover(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.router.navigate(['/ward/shifthandover']);
  }

  navigatetoResults(item: any) {
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("FromBedBoard", "true");
    this.router.navigate(['/home/otherresults']);
  }

  getViewApproval(item: any) {
    this.FetchApprovalInfoDataList = [];
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.IsApproval = false;
    setTimeout(() => {
      this.IsApproval = true;
    }, 0);

    this.datesForm = this.fb.group({
      fromdate: [''],
      todate: [''],
    });
    var wm = new Date(item.AdmitDate); //moment(item.AdmitDate).format('yyyy-MM-DD');
    wm.setMonth(wm.getMonth() - 1);
    var d = new Date();
    this.datesForm.patchValue({
      fromdate: wm,
      todate: d
    })


    var FromDate = this.datepipe.transform(this.datesForm.value['fromdate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.datesForm.value['todate'], "dd-MMM-yyyy")?.toString();
    this.config.FetchLOAApprovalRequestDetails(item.PatientID, FromDate, ToDate, this.wardID, this.hospitalId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.FetchApprovalInfoDataList = response.FetchLOAApprovalRequestDetailsListM;
        $("#viewApproval").modal('show');
      }
    }, error => {
      console.error('Get Data API error:', error);
    });


  }
  navigateToUpdateBedStatus() {
    sessionStorage.setItem("FromBedBoard", "true");
    this.router.navigate(['/suit/UpdateBedStatus']);
  }
  redirectToMotherMilkExtraction(item: any) {
    sessionStorage.setItem("FromBedBoard", "true");
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/ward/mothermilkextraction']);
  }
  redirectToMotherMilkFeeding(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/ward/mothermilkfeeding']);
  }
  redirectToIntakeoutput(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/ward/intakeoutput']);
  }

  redirectToTemplates(item: any) {
    item.HospitalID = this.hospitalId;
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.router.navigate(['/templates']);
  }

  navigatetoCPC(item: any) {
    item.HospitalID = this.hospitalId;
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem('selectedTemplateId', '27');
    this.router.navigate(['/templates']);
  }
  navigateToNursingdashboard() {
    this.router.navigate(['/ward/wardnursingdashboard']);
  }
  navigateToBedTransfer() {
    this.router.navigate(['/ward/bedtransfer']);
  }
  redirectToPreOpCheckList(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("FromBedBoard", "true");
    this.router.navigate(['/shared/pre-op-checklist']);
  }

  selectedWard() {
    $("#facilityMenu").modal('hide');
  }

  showDoctorInstructions(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(InstructionsToNurseComponent, {
      data: "doctorinstructions",
      readonly: true
    }, options);
  }
  showDoctorReferal(item: any) {
    this.FetchDoctorReferralOrdersDataList = [];
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.IsApproval = false;
    setTimeout(() => {
      this.IsApproval = true;
    }, 0);
    this.config.FetchDoctorReferralOrders(item.AdmissionID, this.wardID, this.hospitalId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.FetchDoctorReferralOrdersDataList = response.FetchDoctorReferralOrdersDataList;

        this.FetchDoctorReferralOrdersDataList.forEach((element: any, index: any) => {
          element.isVerified = element?.IsVisited === 'True' ? true : false;
          element.VerifiedBy = element.VisitUpdatedByName;
          element.VerifiedDate = element.VisitedDate;
          element.Comments = element.Comments;
        });

        // if (this.FetchDoctorReferralOrdersDataList.length > 0) {
        //   this.isVerified = this.FetchDoctorReferralOrdersDataList[0]?.IsVisited === 'True' ? true : false;
        //   this.VerifiedBy = this.FetchDoctorReferralOrdersDataList[0]?.VisitUpdatedByName;
        //   this.VerifiedDate = this.FetchDoctorReferralOrdersDataList[0]?.VisitedDate;
        // }

        $("#viewReferal").modal('show');
      }
    }, error => {
      console.error('Get Data API error:', error);
    });


  }




  validateNurseUser(index: any, item: any) {
    $("#divNursingInstructions").modal('hide');
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        $("#divNursingInstructions").modal('show');
        this.saveAcknowledgeInstruction(index, item);
      }
      modalRef.close();
    });

  }

  nursingType: any = 'New';
  filteredInstructionsList: any = [];
  tablePatientsForm!: FormGroup;

  selectNursingType(type: any) {
    this.nursingType = type;
    this.filterItems();
  }

  filterItems() {
    if (this.tablePatientsForm.get('FromDate')?.value && this.tablePatientsForm.get('ToDate')?.value) {
      const startDate = moment(this.tablePatientsForm.get('FromDate')?.value).format('DD-MMM-YYYY');
      const toDate = moment(this.tablePatientsForm.get('ToDate')?.value).format('DD-MMM-YYYY');
      const filteredCollection = this.selectedInstructionsList.filter((item: any) => {
        var itemDate = new Date(item.StartDate);
        return itemDate >= new Date(startDate) && itemDate <= new Date(toDate);
      });
      this.filteredInstructionsList = filteredCollection.filter((element: any) => {
        if (this.nursingType === 'New') {
          return element.AcknowledgeByUser === '';
        } else {
          return element.AcknowledgeByUser !== '';
        }
      });
      this.filteredInstructionsList.sort((a: any, b: any) => new Date(b.StartDate + ' ' + b.StartDateTime).getTime() - new Date(a.StartDate + ' ' + a.StartDateTime).getTime());
    }
  }

  initializeNursingForm() {
    var wm = new Date();
    wm.setDate(wm.getDate() - 7);
    this.tablePatientsForm = this.fb.group({
      FromDate: wm,
      ToDate: new Date()
    });
  }

  onDateChange() {
    this.filterItems();
  }


  showNursingInstructions(item: any) {
    this.initializeNursingForm();
    this.nursingType === 'New';
    this.selectedPatient = item;
    this.showNurseInst = true;
    this.selectedInstructionsList = [];
    this.filteredInstructionsList = [];
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.config.FetchPatientNursingInstructions(item.PatientID, item.AdmissionID, this.doctorDetails[0].UserId, this.wardID, this.hospitalId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.selectedInstructionsList = [];
        var nurInstr = response.FetchPatientNursingInstructionsOutputLists;
        nurInstr.forEach((element: any, index: any) => {
          this.selectedInstructionsList.push({
            InstructionId: element.InstructionID,
            InstructiondetailID: element.InstructiondetailID,
            Instruction: element.Instruction,
            StartDate: element.ActualDate,
            StartDateTime: element.ActualTime,
            FrequencyId: element.FrequencyID,
            Frequency: element.Frequency,
            FrequencyName: element.FrequencyName,
            OrderDate: element.CREATEDATE,
            NoofDays: element.Noofdays,
            DoctorName: element.DoctorName,
            PerformedByName: element.PerformedByName,
            AcknowledgeBy: element.AcknowledgeBy,
            AcknowledgeByUser: element.AcknowledgeByUser,
            AcknowledgeDatetime: element.AcknowledgeDatetime,
            ActualDate: element.ActualDate,
            ActualTime: element.ActualTime,
            DoctorId: element.DoctorId,
            InstructionDetailsStatus: element.InstructionDetailsStatus,
            UserEmployeeName: element.UserEmployeeName,
            UserName: element.UserName,
            isNewInstruction: false,
            isAcknowledge: element.AcknowledgeByUser === '' ? false : true
          })
        });
        this.filterItems();
        $("#divNursingInstructions").modal('show');
      }
    }, error => {
      console.error('Get Data API error:', error);
    });
  }

  saveAcknowledgeInstruction(index: any, inst: any) {
    var NurseInstDetails: any[] = [];
    NurseInstDetails.push({
      "FQID": inst.FrequencyId,
      "NOD": inst.NoofDays,
      "STDT": inst.StartDate,
      "FRQDT": inst.StartDate + ' ' + (inst.StartDateTime == 24 ? "23:59" : inst.StartDateTime + ":00"),
      "FRQDTT": inst.StartDateTime == 24 ? "23:59" : inst.StartDateTime + ":00",
      "STS": "1",
      "INDID": inst.InstructiondetailID,
      "ACKBY": this.doctorDetails[0].UserId,
      "ACKDT": moment(new Date()).format('DD-MMM-yyyy HH:mm:ss')

    })
    var ackPayload = {
      "InstructionID": inst.InstructionId,
      // "MonitorID": 0,
      "Instruction": inst.Instruction,
      "Instructiondate": inst.StartDate,
      "DoctorID": inst.DoctorId,
      "AdmissionID": this.selectedPatient.AdmissionID,
      "STATUS": "0",
      "remarks": "",
      "IsFav": false,
      "Orderpackid": "0",
      "Hospitalid": this.hospitalId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID,
      "NurseInstDetails": NurseInstDetails
    }
    this.config.SaveNursingInstructionsAck(ackPayload).subscribe(response => {
      if (response.Code == 200) {
        $("#instructionAckSaveMsg").modal('show');
      }
    })
  }
  RelaodBedsBoard() {
    sessionStorage.removeItem("InPatientDetails");
    this.showNurseInst = false;
    this.showDailyCharges = false;
    this.selectdrugOrderAll = false;
    this.selectprocOrderAll = false;
    this.selectdrugOrderQtyAll = false;
    this.selectprocOrderQtyAll = false;
    this.fetchBedsFromWard();
  }
  fitForDischargeClick(item: any) {
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.dischargeIntimationRiased = item.IsFitForDischarge && item.BedTransferRequestID !== 0 && item.BedTransferRequestID !== '';
    item.fitForDischarge = true;
    this.fitForDischarge = true;
    this.ClinicVisitAfterDays = item.ClinicVisitAfterDays !== '' ? item.ClinicVisitAfterDays : '0';
    this.BedTransferRequestID = item.BedTransferRequestID !== '' ? item.BedTransferRequestID : '0';
    $("#fitfordischarge").modal('show');
  }
  closeFitForDischarge() {
    this.fitForDischarge = false;
    this.RelaodBedsBoard();
  }

  openDailyCharges(item: any) {
    this.selectedPatient = item;
    this.showDailyCharges = true;
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));

    this.config.FetchWardWiseDailyCharges(Number(this.wardID), Number(this.ward.FacilityID), Number(this.hospitalId)).subscribe((response: any) => {
      if (response.Code == 200) {
        $("#dailycharges").modal('show');
        this.dailyCharges = response.FetchWardWiseDailyChargesDataList;
        this.dailyCharges.forEach((element: any, index: any) => {
          element.orderDate = new Date();
          element.quantity = "1";
          element.selected = false;
          element.Remarks = '';
        });
        this.drugOrders = this.dailyCharges.filter((x: any) => x.ChargeTypeID === '1' && x.ServiceID != '10');
        this.procOrders = this.dailyCharges.filter((x: any) => x.ChargeTypeID === '3' && x.ServiceID != '10');
        this.FetchClinicalProceduresView();
      }
    });
  }

  openProcOrders() {
    this.drugOrders = this.dailyCharges.filter((x: any) => x.ChargeTypeID === '1' && x.ServiceID != '10');
    this.procOrders = this.dailyCharges.filter((x: any) => x.ChargeTypeID === '3' && x.ServiceID != '10');
  }

  openRespiratoryTherapistDailyCharges() {

    this.config.FetchWardWiseDailyCharges(0, Number(this.ward.FacilityID), Number(this.hospitalId)).subscribe((response: any) => {
      if (response.Code == 200) {
        $("#dailycharges").modal('show');
        this.procOrders = response.FetchWardWiseDailyChargesDataList.filter((x: any) => x.ServiceID != '17');
        this.dailyCharges.forEach((element: any, index: any) => {
          element.orderDate = new Date();
          element.quantity = "1";
          element.selected = false;
          element.Remarks = '';
        });
      }
    });
  }

  onQuantityChange(event: any, item: any) {
    item.quantity = event.target.value;
    this.quantity = event.target.value;
    item.selected = true;
  }

  onOrderDateChange(event: any, item: any) {
    item.orderDate = event.target.value;
  }

  selectAllDrugOrders() {
    this.selectdrugOrderAll = !this.selectdrugOrderAll;
    if (this.selectdrugOrderAll) {
      this.drugOrders.forEach((element: any, index: any) => {
        element.selected = true;
      });
    }
    else {
      this.drugOrders.forEach((element: any, index: any) => {
        element.selected = false;
      });
    }
  }
  selectAllProcOrders() {
    this.selectprocOrderAll = !this.selectprocOrderAll;
    if (this.selectprocOrderAll) {
      this.procOrders.forEach((element: any, index: any) => {
        element.selected = true;
      });
    }
    else {
      this.procOrders.forEach((element: any, index: any) => {
        element.selected = false;
      });
    }
  }

  selectAllDrugOrdersQty() {
    this.selectdrugOrderQtyAll = !this.selectdrugOrderQtyAll;
    if (this.selectdrugOrderQtyAll) {
      this.drugOrders.forEach((element: any, index: any) => {
        if (element.selected)
          element.quantity = this.quantity;
      });
    }
    else {
      this.drugOrders.forEach((element: any, index: any) => {
        element.quantity = 1;
        this.quantity = 1;
      });
    }
  }
  selectAllProcOrdersQty() {
    this.selectprocOrderQtyAll = !this.selectprocOrderQtyAll;
    if (this.selectprocOrderQtyAll) {
      this.procOrders.forEach((element: any, index: any) => {
        if (element.selected)
          element.quantity = this.quantity;
      });
    }
    else {
      this.drugOrders.forEach((element: any, index: any) => {
        element.quantity = 1;
        this.quantity = 1;
      });
    }
  }

  clearDrugOrders() {
    this.selectdrugOrderAll = false;
    this.selectdrugOrderQtyAll = false;
    this.drugOrders.forEach((element: any, index: any) => {
      element.selected = false;
      element.orderDate = new Date();
      element.quantity = "1";
      element.Remarks = "";
    });
    this.datesForm.patchValue({
      fromdate: this.toDate.value,
      todate: this.toDate.value
    });
    this.FetchDrugOrderView();
  }
  clearProcOrders() {
    this.selectprocOrderAll = false;
    this.selectprocOrderQtyAll = false;
    this.procOrders.forEach((element: any, index: any) => {
      element.selected = false;
      element.orderDate = new Date();
      element.quantity = "1";
      element.Remarks = "";
    });
    this.procdatesForm.patchValue({
      fromdate: this.toDate.value,
      todate: this.toDate.value
    });
    this.FetchProceduresView();
  }

  selectDrugOrder(item: any) {
    item.selected = !item.selected;
  }

  selectProcOrder(item: any) {
    item.selected = !item.selected;
  }

  onRemarksChange(event: any, item: any) {
    item.Remarks = event.target.value;
  }

  save(type: string) {
    var TestDetails: any = [];
    var selectedOrders: any = [];
    if (type === 'do') {
      selectedOrders = this.drugOrders.filter((x: any) => x.selected);
    }
    else if (type === 'po') {
      selectedOrders = this.procOrders.filter((x: any) => x.selected);
    }
    selectedOrders.forEach((element: any, index: any) => {
      TestDetails.push({
        "PRID": "13",
        "TSTID": element.ItemID,
        "SEQ": index + 1,
        "TOIQ": element.quantity,
        "SDT": moment(element.orderDate).format('DD-MMM-YYYY') + ' ' + moment(new Date()).format('HH:mm'),
        "REM": element.Remarks ?? ''
      })
    });

    if (selectedOrders.length === 0) {
      this.errorMessage = "Please select any item to charge.";
      $("#errorMsg").modal('show');
      return;
    }

    if (selectedOrders.filter((x: any) => x.quantity === '0').length > 0) {
      this.errorMessage = "Quantity cannot be 0.";
      $("#errorMsg").modal('show');
      return;
    }

    // const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    // modalRef.componentInstance.dataChanged.subscribe((data: string) => {
    //   if (data) {
    //     this.saveData(TestDetails);
    //   }
    //   modalRef.close();
    // });
    this.saveData(TestDetails);
  }

  saveData(testDetails: any) {
    let payload = {
      "IPID": this.selectedPatient.AdmissionID,
      "OrderTypeID": "13",
      "WardID": this.wardID,
      "PatientID": this.selectedPatient.PatientID,
      "PatientType": this.selectedPatient.PatientType,
      "Remarks": "",
      "UserId": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.ward.FacilityID,
      "HospitalId": this.hospitalId,
      "TestDetails": testDetails
    }

    this.config.SaveWardProcedureOrder(payload).subscribe(response => {
      if (response.Code == 200) {
        $("#saveDailyCharges").modal('show');
      }
    })
  }

  clearDailyCharges() {
    $("#dailycharges").modal('hide');
    this.clearDrugOrders();
    this.clearProcOrders();
  }

  assignNurse() {
    $("#emergencyward").modal('show');
    this.FetchEMRBeds(1);
  }
  FetchEMRBeds(Type: any) {
    this.config.FetchEMRBeds(this.wardID, '0', this.doctorDetails[0].UserId, '3403', this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.emrBedsDataList = response.FetchEMRBedsDataList;
          if (Type == 1) {
            this.emrBedsDataList = this.emrBedsDataList.filter((x: any) => x.BedStatus == '3')
          }
          this.emrBedsDataList.forEach((element: any, index: any) => {
            if (element.BedStatus == "1")
              element.bedClass = "room_card warning";
            if (element.BedStatus == "3")
              element.bedClass = "room_card primary";
            else if (element.BedStatus == "4" || element.BedStatus == "8" || element.BedStatus == "6")
              element.bedClass = "room_card warning";
          });
          this.emrBedsDataList = this.emrBedsDataList.filter((x: any) => x.NurseID == "");
          const distinctThings = this.emrBedsDataList.filter(
            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.BedID === thing.BedID) === i);
          console.dir(distinctThings);
          this.filteredemrBedsDataList = distinctThings;
          this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList1 = distinctThings;
          this.clearuser();
        }

      },
        (err) => {
        })
  }
  clearuser() {
    this.userForm = this.fb.group({
      EmpNo: ['', Validators.required],
      EmpName: ['', Validators.required],
      EmpID: ['', Validators.required],
      Department: ['', Validators.required]
    });
    this.NurseBedCount = "";
    this.NurseBedDetails = "";
    this.NurseID = "";
    this.emrBedsDataList.forEach((element: any, index: any) => {
      if (element.BedStatus == "1")
        element.bedClass = "room_card warning";
      if (element.BedStatus == "3")
        element.bedClass = "room_card primary";
      else if (element.BedStatus == "4" || element.BedStatus == "8" || element.BedStatus == "6")
        element.bedClass = "room_card warning";
    });
  }
  onFetchNurse(event: any) {

    this.config.FetchHospitalNurses(event.target.value.trim(), this.hospitalId)
      .subscribe((response: any) => {
        this.FetchHospitalNurseDataaList = response.FetchHospitalNursesDataaList;
        if (response.FetchHospitalNursesDataaList.length > 0) {
          this.NurseID = this.FetchHospitalNurseDataaList[0].EMPID;
          this.userForm.patchValue({
            EmpNo: this.FetchHospitalNurseDataaList[0].EMPNO,
            EmpName: this.FetchHospitalNurseDataaList[0].EmployeeName,
            NurseID: this.FetchHospitalNurseDataaList[0].EMPID,
            Department: this.FetchHospitalNurseDataaList[0].Department
          });
          if (response.FetchPatientEMRBedsAssignedToNurseDataList.length > 0) {
            var beddetails = "";
            response.FetchPatientEMRBedsAssignedToNurseDataList.forEach((element: any, index: any) => {
              if (beddetails == '')
                beddetails = element.Room + "-" + element.BedName
              else
                beddetails = beddetails + " , " + element.Room + "-" + element.BedName
            });
            this.userForm.patchValue({
              NurseID: response.FetchPatientEMRBedsAssignedToNurseDataList[0].NurseID,
              NurseBedCount: response.FetchPatientEMRBedsAssignedToNurseDataList.length,
              NurseBedDetails: beddetails
            });
            this.NurseBedCount = response.FetchPatientEMRBedsAssignedToNurseDataList.length;
            this.NurseBedDetails = beddetails;
            this.NurseID = this.FetchHospitalNurseDataaList[0].EMPID;
          }
          // else {
          //   this.clearuser();
          // }
          //this.FetchNurseID(this.FetchHospitalNurseDataaList[0].EMPID);
        }
        else {
          this.clearuser();
        }

        event.target.value = '';
      },
        (err) => {
        })
  }

  FetchNurseID(EmpId: any) {
    this.config.FetchPatientEMRBedsAssignedToNurse(EmpId, this.hospitalId)
      .subscribe((response: any) => {
        if (response.FetchPatientEMRBedsAssignedToNurseDataList.length > 0) {
          var beddetails = "";
          response.FetchPatientEMRBedsAssignedToNurseDataList.forEach((element: any, index: any) => {
            if (beddetails == '')
              beddetails = element.Room + "-" + element.BedName
            else
              beddetails = beddetails + " , " + element.Room + "-" + element.BedName
          });
          this.userForm.patchValue({
            NurseID: response.FetchPatientEMRBedsAssignedToNurseDataList[0].NurseID,
            NurseBedCount: response.FetchPatientEMRBedsAssignedToNurseDataList.length,
            NurseBedDetails: beddetails
          });
        }
        else {
          this.clearuser();
        }

      },
        (err) => {
        })
  }

  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.onFetchNurse(event);
    }
  }
  filterFunction(roomlist: any, roomid: any) {
    return roomlist.filter((buttom: any) => buttom.RoomID == roomid);
  }
  ShowAllEmrBeds(type: any, item: any) {
    this.selectall = !this.selectall;
    var status = this.selectall == false ? 1 : 2;
    this.FetchEMRBeds(status);
  }

  selectemrBed(bed: any, index: any) {
    // if (bed.BedStatus == '3') {
    //   this.SelectedBedInfo = '';
    //   bed.bedClass = "room_card primary";
    // } else 
    if (bed.NurseID == "") {
      if (bed.BedStatus == '4') {
        this.SelectedBedInfo = [];
        bed.bedClass = "room_card warning";
      }
      else {
        //this.SelectedBedInfo=bed;
        this.emrBedsDataList.forEach((element: any, index: any) => {
          if (element.BedID == bed.BedID) {
            if (element.BedStatus == "1") {
              if (element.bedClass == "room_card warning") {
                element.bedClass = "room_card warning active";
                this.SelectedBedInfo.push(bed);
                this.showBedValidation = false;
              }
              else {
                element.bedClass = "room_card warning";
                this.SelectedBedInfo.splice(this.SelectedBedInfo.indexOf(bed), 1);
              }
            }
            else if (element.BedStatus == "3") {
              if (element.bedClass == "room_card primary") {
                element.bedClass = "room_card primary active";
                this.SelectedBedInfo.push(bed);
                this.showBedValidation = false;
              }
              else {
                element.bedClass = "room_card primary";
                this.SelectedBedInfo.splice(this.SelectedBedInfo.indexOf(bed), 1);
              }
            }
            else if (element.BedStatus == "4" || element.BedStatus == "8" || element.BedStatus == "6") {
              if (element.bedClass == "room_card warning") {
                element.bedClass = "room_card warning active";
                this.SelectedBedInfo.push(bed);
                this.showBedValidation = false;
              }
              else {
                element.bedClass = "room_card warning";
                this.SelectedBedInfo.splice(this.SelectedBedInfo.indexOf(bed), 1);
              }
            }
          }
          // else {
          //   if (element.BedStatus == "1")
          //     element.bedClass = "room_card warning";
          //   else if (element.BedStatus == "3")
          //     element.bedClass = "room_card primary";
          //   else if (element.BedStatus == "4")
          //     element.bedClass = "room_card warning";
          // }
        });
      }
    }
  }
  saveBedAssign() {
    if (this.SelectedBedInfo != '' && this.SelectedBedInfo != undefined && this.NurseID != '') {
      var BedDetails: any[] = [];
      this.SelectedBedInfo.forEach((element: any) => {
        BedDetails.push({
          "PID": element.PatientID,
          "ADMID": element.AdmissionID,
          "BEDID": element.BedID
        })
      });
      var payload = {
        "NurseID": this.NurseID,
        "HospitalID": this.hospitalId,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.wardID,
        "BedNurseStatus": BedDetails
      }
      this.config.SaveNursetoBeds(payload).subscribe(response => {
        if (response.Code == 200) {
          $("#assignNurseMsg").modal('show');
        }
      })
    }
    else {
      this.showBedValidation = true;
    }
  }

  closeAssignBedsPopUp() {
    $("#assignNurseMsg").modal('hide');
    this.assignNurse();
  }

  FetchProceduresView() {
    var FromDate = this.datepipe.transform(this.datesForm.value['fromdate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.datesForm.value['todate'], "dd-MMM-yyyy")?.toString();
    this.config.FetchClinicalProceduresView(this.selectedPatient.SSN, FromDate, ToDate, this.wardID, '3403', this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          //this.clinicalProceduresView = response.FetchClinicalProceduresViewDataList;
          //this.clinicalProceduresViewD = response.FetchClinicalProceduresViewDataList.filter((x:any) => x.ChargeTypeID === '1');
          this.clinicalProceduresView = response.FetchClinicalProceduresViewDataList.filter((x: any) => x.ChargeTypeID === '3');
        }

      },
        (err) => {
        })
  }

  FetchDrugOrderView() {
    var FromDate = this.datepipe.transform(this.datesForm.value['fromdate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.datesForm.value['todate'], "dd-MMM-yyyy")?.toString();
    this.config.FetchClinicalProceduresView(this.selectedPatient.SSN, FromDate, ToDate, this.wardID, '3403', this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          //this.clinicalProceduresView = response.FetchClinicalProceduresViewDataList;
          this.clinicalProceduresViewD = response.FetchClinicalProceduresViewDataList.filter((x: any) => x.ChargeTypeID === '1');
          //this.clinicalProceduresView = response.FetchClinicalProceduresViewDataList.filter((x:any) => x.ChargeTypeID === '3');
        }

      },
        (err) => {
        })
  }

  FetchClinicalProceduresView() {
    var FromDate = this.datepipe.transform(this.procdatesForm.value['fromdate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.procdatesForm.value['todate'], "dd-MMM-yyyy")?.toString();
    this.config.FetchClinicalProceduresView(this.selectedPatient.SSN, FromDate, ToDate, this.wardID, '3403', this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          //this.clinicalProceduresView = response.FetchClinicalProceduresViewDataList;
          this.clinicalProceduresViewD = response.FetchClinicalProceduresViewDataList.filter((x: any) => x.ChargeTypeID === '1');
          this.clinicalProceduresView = response.FetchClinicalProceduresViewDataList.filter((x: any) => x.ChargeTypeID === '3');
        }

      },
        (err) => {
        })
  }

  findPrecautions(item: any, type: string) {
    if (item.PrecautionIDs == undefined) {
      return false;
    }
    if (item.PrecautionIDs !== null && item.PrecautionIDs !== '' && item.PrecautionIDs !== 'undefined') {
      if (item.PrecautionIDs.split(',').length > 0) {
        const prec = item.PrecautionIDs.split(',');
        return prec.includes(type);
      }
      else {
        return item.PrecautionIDs.split('-')[0] === type;

      }
    }
    else
      return false;
  }

  closePopup() {
    //this.IsScoreSaved = true;    
    sessionStorage.removeItem("InPatientDetails");
    sessionStorage.removeItem("FromBedBoard");
    this.fetchBedsFromWard();
    this.showPainAssessment = false;
    $("#modalPainScore").modal('hide');
  }

  openPainAssessment(item: any) {
    this.showPainAssessment = true;
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("FromBedBoard", "true");
    setTimeout(() => {
      $("#modalPainScore").modal('show');
    }, 200);
  }

  startTimers1(date: any): any {
    if (date.PainAssessmentOrderDate != null) {
      const startDate = new Date(date.PainAssessmentOrderDate);
      const datepart = date.PainAssessmentOrderDate.split(' ')[0].split('-');
      const timepart = date.PainAssessmentOrderDate.split(' ')[1].split(':');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = monthNames.indexOf(datepart[1]);
      const freqtime = new Date(datepart[2], monthIndex, datepart[0], timepart[0], timepart[1]);
      freqtime.setMinutes(freqtime.getMinutes() + Number(date.ReAssesmentPainInterventionTime));

      const now = new Date();
      const differenceMs: number = now.getTime() - freqtime.getTime();
      const seconds: number = Math.floor((differenceMs / 1000) % 60);
      const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
      const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
      const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
      const totalHours = hours + (days * 24);
      const formattedHours = totalHours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");
      return `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
    }
  }
  startTimers(date: any): any {
    if (date.PainAssessmentOrderDate != null) {
      const startDate = moment(new Date(date.PainAssessmentOrderDate)).format('DD-MMM-YYYY HH:mm:ss');
      const datepart = date.PainAssessmentOrderDate.split(' ')[0].split('-');
      const timepart = date.PainAssessmentOrderDate.split(' ')[1].split(':');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = monthNames.indexOf(datepart[1]);
      const freqtime = new Date(datepart[2], monthIndex, datepart[0], timepart[0], timepart[1]);
      freqtime.setMinutes(freqtime.getMinutes() + Number(date.ReAssesmentPainInterventionTime));
      let differenceMs;
      if (new Date().getTime() > freqtime.getTime()) {
        differenceMs = new Date().getTime() - freqtime.getTime();
      } else {
        return `00:00:00`;
      }
      const seconds: number = Math.floor((differenceMs / 1000) % 60);
      const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
      const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
      const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
      const totalHours = hours + (days * 24);
      const formattedHours = totalHours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");
      return `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
    }
  }
  startTimersForVTE(date: any): any {
    if (date.AdmitDate != null && date.IsVTE === '0' && Number(date.AgeValue) >= 14 && date.PatientType === '2') {
      const startDate = moment(new Date(date.AdmitDate)).format('DD-MMM-YYYY HH:mm:ss');
      const datepart = date.AdmitDate.split(' ')[0].split('-');
      const timepart = date.AdmitDate.split(' ')[1].split(':');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = monthNames.indexOf(datepart[1]);
      const freqtime = new Date(datepart[2], monthIndex, datepart[0], timepart[0], timepart[1]);
      freqtime.setHours(freqtime.getHours() + 24);
      let differenceMs;
      if (freqtime.getTime() > new Date().getTime()) {
        differenceMs = freqtime.getTime() - new Date().getTime();
      } else {
        return `00:00:00`;
      }
      //differenceMs = freqtime.getTime() - new Date().getTime();
      const seconds: number = Math.floor((differenceMs / 1000) % 60);
      const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
      const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
      const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
      const totalHours = hours + (days * 24);
      const formattedHours = totalHours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");
      return `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
    }
  }

  startDispositionTimer(item: any) {
    const datepart = item.EndOfTheEpisodeCloseDate.split(' ')[0].split('-');
    const timepart = item.EndOfTheEpisodeCloseDate.split(' ')[1].split(':');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(datepart[1]);
    const freqtime = new Date(datepart[2], monthIndex, datepart[0], timepart[0], timepart[1]);
    freqtime.setHours(freqtime.getHours() + 10);
    let differenceMs;
    if (freqtime.getTime() > new Date().getTime()) {
      differenceMs = freqtime.getTime() - new Date().getTime();
    } else {
      return `00:00:00`;
    }
    //differenceMs = freqtime.getTime() - new Date().getTime();
    const seconds: number = Math.floor((differenceMs / 1000) % 60);
    const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
    const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
    const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
    const totalHours = hours + (days * 24);
    const formattedHours = totalHours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");
    return `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
  }

  FetchMedicalTypeBedsBoardConfigurations() {
    this.us.get(`FetchMedicalTypeBedsBoardConfigurations?MedicalType=${this.IsDoctor === 'true' ? 1 : 2}&WorkStationID=${this.wardID}&HospitalID=${this.hospitalId}`).subscribe((response: any) => {
      if (response.Code === 200) {
        this.savedbedsBoardFeaturesList = response.FetchMedicalTypeBedsBoardConfigurationsDataList;
      }
    }, () => {

    });
  }

  showBedsBoardActionButton(configId: number) {
    const featureExist = this.savedbedsBoardFeaturesList.find((x: any) => x.BedsConfigValueID == configId);
    if (featureExist)
      return true;
    else
      return false;
  }

  toggleWardSelection() {
    this.selectall = false;
    this.FetchBedsFromWardDataList = [];
    this.isSurgical = !this.isSurgical;
    if (this.IsDoctor === 'false')
      this.ShowAllBeds("no", []);
    else if (this.IsRODoctor === 'true')
      this.ShowAllBeds("no", []);
    else
      this.fetchBedsFromWard();
  }

  isDischarge: boolean = false;

  toggleDischargeSelection() {
    this.isDischarge = !this.isDischarge;
  }

  isItemHide(item: any) {
    if (this.ward?.FacilityName === 'EMERGENCY WARD') {
      if ((this.isDischarge && item.DispositionID) || (!this.isDischarge && !item.DispositionID)) {
        return false;
      } else {
        return true;
      }
    } 
    return false;
  }

  openETTForm(item: any) {
    this.ettData = cloneDeep(item);
    this.markerType = '';
    this.markers = [];
    this.ettForm.reset();
    $('#view_ett').modal('show');
    setTimeout(() => {
      this.ettData.annotations.forEach((annotation: any) => {
        if (new Date(annotation.RemovalDateTime) > new Date()) {
          let image;
          if (this.ettData.GenderID === '1') {
            image = $('#maleImage')[0];
          } else {
            image = $('#femaleImage')[0];
          }
          let position = 'right';
          if (Number(annotation.XAxis) < image.width / 2) {
            position = 'left';
          }
          this.markers.push({
            BBPAID: annotation.BedsboardPatientAnnotationID,
            x: annotation.XAxis,
            y: annotation.YAxis,
            type: annotation.AnnotationTypeID.toString() === '1' ? 'line' : annotation.AnnotationTypeID.toString() === '2' ? 'drain' : 'airways',
            position,
            value: annotation.Description,
            placementDate: annotation.PlacementDateTime.split(' ')[0],
            placementTime: annotation.PlacementDateTime.split(' ')[1],
            removalDate: annotation.RemovalDateTime.split(' ')[0],
            removalTime: annotation.RemovalDateTime.split(' ')[1],
            size: annotation.Size,
            attempts: annotation.Attempts,
            placedBy: annotation.PlacedBy
          });
        }
      });
    }, 0);
  }

  closeETTForm() {
    this.ettData = null;
    this.markers = [];
    this.ettForm.reset();
    $('#view_ett').modal('hide');
  }

  selectMarkerType(type: string) {
    this.markerType = type;
  }

  addMarker(event: MouseEvent) {
    if (!this.markerType) {
      this.errorMessages = ['Please Select Annotation Type'];
      $('#errorMessages').modal('show');
      return;
    }
    let position = 'right';
    if (event.target && event.offsetX < (event.target as any).width / 2) {
      position = 'left';
    }
    this.markers.forEach((marker: any) => {
      marker.current = false;
    });
    this.markers.push({
      x: event.offsetX,
      y: event.offsetY,
      type: this.markerType,
      position,
      value: '',
      current: true
    });
    this.ettForm.patchValue({
      placementDate: moment(),
      placementTime: this.setCurrentTime(),
      removalDate: moment().add(3, 'days'),
      removalTime: this.setCurrentTime(),
      ekpDate: new Date(),
      placedBy: [],
      placedByComment: '',
      size: '2',
      attempts: '1',
      attemptOthers: '3',
      days: 3
    });
  }

  deleteMarker(deleteIndex: number) {
    this.markers = this.markers.filter((_: any, index: any) => index !== deleteIndex);
  }

  clearETTData() {
    this.markers = [];
    this.ettForm.reset();
    this.markerType = '';
  }
  HistoryETTData() {
    this.HistoryCheck = !this.HistoryCheck;
  }

  saveDoctorVisited(item: any) {
    this.showPatientNotSelectedValidation = false;
    if (item.Status == '0') {
      this.showPatientNotSelectedValidation = true;
      return;
    }
    $("#viewReferal").modal('hide');
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        $("#viewReferal").modal('show');
        this.SaveIsSeenbyDoctorReferal(item);
      }
      modalRef.close();
    });
  }



  SaveIsSeenbyDoctorReferal(data: any) {
    this.isVerified = !this.isVerified;
    var payload = {
      "ReferralOrderID": data.ReferralOrderID,
      "Comments": '',
      "VisitedUpdatedBy": this.doctorDetails[0].UserId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "HospitalID": this.hospitalId,
    };
    this.config.UpdateDoctorReferralOrdersVisit(payload).subscribe(response => {
      if (response.Code == 200) {
        //this.FetchDoctorReferralOrdersDataListD=data;
        this.saveMsg = "Updated Successfully";
        $("#assignReferalMsg").modal('show');
      }
    })
  }

  closeIsSeenbyDoctorReferalPopUp() {
    $("#assignReferalMsg").modal('hide');
    //this.showDoctorReferal(this.FetchDoctorReferralOrdersDataListD);
  }



  saveETTData() {
    this.errorMessages = [];
    if (this.markers.length === 0) {
      this.errorMessages.push('Please Add Annotations');
    }

    if (this.markers.length > 0) {
      const descriptionNotEntered = this.markers.filter((marker: any) => !marker.value.trim());
      if (descriptionNotEntered.length > 0) {
        this.errorMessages.push('Please Enter Description for Each Annotation');
      }
    }

    if (this.errorMessages.length > 0) {
      $('#errorMessages').modal('show');
      return;
    }

    const SaveBedsboardPatientAnnotationXML = this.markers.map((marker: any) => {
      if (marker.BBPAID == undefined) {
        return {
          "TID": this.markersTypeCollection[marker.type].TID,
          "TNAME": this.markersTypeCollection[marker.type].TNAME,
          "XAxis": marker.x,
          "YAxis": marker.y,
          "DESCS": marker.value,
          "PDateTime": `${moment(marker.placementDate).format('DD-MMM-YYYY')} ${marker.placementTime}`,
          "RDateTime": `${moment(marker.removalDate).format('DD-MMM-YYYY')} ${marker.removalTime}`,
          "PLACEDBY": marker.placedBy,
          "ATTEMPTS": marker.attempts,
          "SIZE": marker.size
        }
      } else {
        return {
          "BBPAID": marker.BBPAID,
          "TID": this.markersTypeCollection[marker.type].TID,
          "TNAME": this.markersTypeCollection[marker.type].TNAME,
          "XAxis": marker.x,
          "YAxis": marker.y,
          "DESCS": marker.value,
          "PDateTime": `${moment(marker.placementDate).format('DD-MMM-YYYY')} ${marker.placementTime}`,
          "RDateTime": `${moment(marker.removalDate).format('DD-MMM-YYYY')} ${marker.removalTime}`,
          "PLACEDBY": marker.placedBy,
          "ATTEMPTS": marker.attempts,
          "SIZE": marker.size
        }
      }

    });
    const { PatientID, AdmissionID } = this.ettData;
    let payload = {
      PatientID,
      AdmissionID,
      SaveBedsboardPatientAnnotationXML,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "HospitalID": this.hospitalId
    }
    this.config.SaveBedsboardPatientAnnotations(payload).subscribe(response => {
      if (response.Code == 200) {
        $('#saveETTDataMsg').modal('show');
        this.closeETTForm();
        if (this.IsDoctor === 'false')
          this.ShowAllBeds("no", []);
        else if (this.IsRODoctor === 'true')
          this.ShowAllBeds("no", []);
        else
          this.fetchBedsFromWard();
      }
    });
  }

  setCurrentTime(): string {
    const now = new Date();
    const hours = this.padZero(now.getHours());
    const minutes = this.padZero(now.getMinutes());
    return `${hours}:${minutes}`;
  }

  padZero(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  onPlacedByCheckboxSelection(item: any) {
    let placedByValues = this.ettForm.get('placedBy')?.value;
    if (!placedByValues) {
      placedByValues = [];
    }
    if (placedByValues?.includes(item.id)) {
      placedByValues = placedByValues.filter((id: any) => id !== item.id);
    } else {
      placedByValues.push(item.id);
    }
    this.ettForm.patchValue({
      placedBy: placedByValues
    });
  }

  onSizeChange(size: any) {
    this.ettForm.patchValue({
      size
    });
  }

  onAttemptsChange(attempt: any) {
    this.ettForm.patchValue({
      attempts: attempt.id
    });
  }

  getDifferenceDays(annotation: any) {
    const duration = moment.duration(moment(annotation.RemovalDateTime).diff(moment()));
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    return `${days} Days ${hours} Hours ${minutes} Minutes`
  }
  OncloseRelaod() {
    this.fetchBedsFromWard();
  }

  fetchPatientWalkthroughInfo(pinfo: any) {
    $("#walkthrough_info").modal('hide');
    if (pinfo.AdmissionReqAdmissionid != '' || pinfo.PatientType === '3') {
      pinfo.FullAge = pinfo.Age;
      pinfo.FromDoctor = pinfo.Consultant;
      pinfo.AdmissionID = pinfo.PatientType === '3' ? pinfo.AdmissionID : pinfo.AdmissionReqAdmissionid;
      this.patinfo = pinfo;
      $("#walkthrough_info").modal('show');
    } else {
      this.ValidationMsg = "NO Previous Visit Info Found";
      $("#WalkthorughMsg").modal('show');
    }
  }
  clearPatientInfo() {
    this.patinfo = "";
  }
  navigateToEmrNursingChecklist(item: any) {
    item.isNursingChecklist = true;
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.router.navigate(['/ward/emr-nursing-checklist']);
  }

  navigateToCarePlan(item: any) {
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.router.navigate(['/ward/care-plan']);
  }

  woundassessment(item: any) {
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.router.navigate(['/ward/wound-assessment']);
  }

  openHospitalAcquiredEvents(item: any) {
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.router.navigate(['/ward/hospital-events']);
  }

  navigateToTransfusionEntry(item: any) {
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("FromBedBoard", "true");
    this.router.navigate(['/bloodbank/transfusionfeedback']);
  }

  showVirtualDischargeConformPopup(item: any) {
    if (!item.IsVirtualDischarge) {
      this.selectedPatientForVirtualDischarge = item;
      $("#virtualDischargeConfirmModal").modal('show');
    }
  }

  virtualDischarge() {
    let payload = {
      "VirtualDischargeID": "0",
      "PatientID": this.selectedPatientForVirtualDischarge.PatientID,
      "AdmissionID": this.selectedPatientForVirtualDischarge.AdmissionID,
      "HospitalID": this.hospitalId,
      "IsVirtualDischarge": true,
      "Remarks": "",
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID
    }
    this.config.SavePatientAdmissionVirtualDischarges(payload).subscribe(response => {
      if (response.Code == 200) {
        $('#saveETTDataMsg').modal('show');
        this.selectall = false;
        if (this.IsDoctor === 'false')
          this.ShowAllBeds("no", []);
        else if (this.IsRODoctor === 'true')
          this.ShowAllBeds("no", []);
        else
          this.fetchBedsFromWard();
      }
    });
  }

  openVirtualDischarge() {
    $('#virtualDischarge_modal').modal('show');
    this.bedsListForVirtualDischarge = this.FetchBedsFromWardDataList.filter((x: any) => !x.IsVirtualDischarge);;
  }

  wardChange(event: any) {
    this.wardIdForVirtualDischarge = event.target.value;
    this.config.fetchBedsFromWard(this.wardIdForVirtualDischarge, 0, this.Status, this.doctorDetails[0].EmpId, this.hospitalId, this.isSurgical)
      .subscribe((response: any) => {
        this.bedsListForVirtualDischarge = response.FetchBedsFromWardDataList.filter((x: any) => !x.IsVirtualDischarge);
        this.bedsListForVirtualDischarge.forEach((element: any) => {
          element.selected = false;
        });
        if (this.ward?.FacilityName?.toLowerCase().indexOf('nicu') !== -1) {
          this.InititalAssement = 1;
        } else if (this.ward?.FacilityName?.toLowerCase().indexOf('nursery ward') !== -1) {
          this.InititalAssement = 2;
        } else {
          this.InititalAssement = 0;
        }
      },
        (err) => {
        })
  }

  selectBedForVirtualDischarge(item: any) {
    item.selected = !item.selected;
    if (this.bedsListForVirtualDischarge.filter((x: any) => x.selected).length > 0) {
      this.showVirtualDischargeValidation = false;
    }
  }

  clearVirtualDischargeSelection() {
    this.bedsListForVirtualDischarge.forEach((element: any) => {
      element.selected = false;
    });
  }

  saveVirtualDischarge() {
    const beds = this.bedsListForVirtualDischarge.filter((x: any) => x.selected);
    if (beds.length === 0) {
      this.showVirtualDischargeValidation = true;
      return;
    }
    else {
      this.showVirtualDischargeValidation = false;
    }
    var VirtualDischargeXML: any[] = [];
    beds.forEach((element: any) => {
      VirtualDischargeXML.push({
        "PID": element.PatientID,
        "AID": element.AdmissionID,
        "HID": this.hospitalId,
        "RMK": "Virtaul discharge",
        "BID": element.BedID
      })
    });

    let payload =
    {
      "VirtualDischargeXML": VirtualDischargeXML,
      "IsVirtualDischarge": true,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID
    }

    this.config.SavePatientAdmissionVirtualDischarges(payload).subscribe(response => {
      if (response.Code == 200) {
        this.showVirtualDischargeValidation = false;
        $('#saveVirtualDischargeModal').modal('show');
        $('#virtualDischarge_modal').modal('hide');
      }
    });
  }

  closeVirtualDischargeModal() {
    $('#virtualDischarge_modal').modal('hide');
    this.RelaodBedsBoard();
  }

  navigateToRespiratoryEform(item: any) {
    item.HospitalID = this.hospitalId;
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem('selectedTemplateId', '117');
    this.router.navigate(['/templates']);
  }

  navigateToPrimaryDoctorChange(item: any) {
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("FromBedBoard", "true");
    this.router.navigate(['/shared/primarydoctor']);
  }

  PatientPrintCard(item: any) {
    this.config.FetchRegistrationAdmissionCard(item.RegCode,item.AdmissionID, this.doctorDetails[0]?.UserId, this.ward.FacilityID, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH;
          this.showModal()
        }
      },
        (err) => {

        })
  }
  showModal(): void {
    $("#caseRecordModal").modal('show');
  }

  onIntubatedChange(event: any, item: any) {
    this.selectedItem = cloneDeep(item);
    $('#IntubatedConfirmationModal').modal('show');
  }
  onBedSoreChange(event: any, item: any) {
    this.selectedItem = cloneDeep(item);
    $('#BedSoreConfirmationModal').modal('show');
  }
  onCancelBedSore() {
    const index = this.FetchBedsFromWardDataList.findIndex((element: any) => element.PatientID === this.selectedItem.PatientID);
    if (index !== -1) {
      this.FetchBedsFromWardDataList[index] = { ...this.FetchBedsFromWardDataList[index] };
    }
    $('#BedSoreConfirmationModal').modal('hide');
  }

  onCancelIntubated() {
    const index = this.FetchBedsFromWardDataList.findIndex((element: any) => element.PatientID === this.selectedItem.PatientID);
    if (index !== -1) {
      this.FetchBedsFromWardDataList[index] = { ...this.FetchBedsFromWardDataList[index] };
    }
    $('#IntubatedConfirmationModal').modal('hide');
  }

  onSaveIntubated() {
    this.us.post('UpdatePatientIntubated', {
      "AdmissionID": this.selectedItem.AdmissionID,
      "IntubatedID": this.selectedItem.IntubatedID,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.ward.FacilityID,
      "HospitalID": this.hospitalId
    }).subscribe((response: any) => {
      if (response.Code === 200) {
        this.fetchBedsFromWard();
        $('#IntubatedConfirmationModal').modal('hide');
      }
    });
  }

  onSaveBedSore() {
    this.us.post('UpdatePatientBedsore', {
      "AdmissionID": this.selectedItem.AdmissionID,
      "BedSoreID": this.selectedItem.Bedsore,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.ward.FacilityID,
      "HospitalID": this.hospitalId
    }).subscribe((response: any) => {
      if (response.Code === 200) {
        this.fetchBedsFromWard();
        $('#BedSoreConfirmationModal').modal('hide');
      }
    });
  }
  FetchPatientAdultBandPrint(item: any) {
    this.isAdultPrint = true;
    var adultbppayload = {
      "PatientID": item.PatientID,
      "IPID": item.AdmissionID,
      "UserName": this.doctorDetails[0]?.UserName,
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.ward.FacilityID,
      "Hospitalid": this.hospitalId,
      "JustificationID": 0,
      "PatientName": item.PatientName,
      "Gender": item.Gender,
      "DOB": item.DOB,
      "Nationality": item.Nationality,
      "SSN": item.SSN,
      "ConsultantName": item.Consultant,
      "BandPrintSuperVisior": 1
    }
    this.us.post(patientadmission.FetchPatientAdultBandPrint, adultbppayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.trustedUrlBase64 = response?.FTPPATHBase64
          this.showbase64Modal();
          // this.showModal();
        }
        else {
          if (response.Code === 604 || response.objLabReportNList.length > 0) {
            this.reprintReasons = response.objLabReportNList;
            $("#cancelReasons").modal('show');
          }
        }

      },
      (err) => {
        console.log(err);
      }
    );
  }

  FetchPatientInfantBandPrint(item: any) {
    this.isAdultPrint = false;
    var adultbppayload = {
      "PatientID": item.PatientID,
      "IPID": item.AdmissionID,
      "UserName": this.doctorDetails[0]?.UserName,
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.ward.FacilityID,
      "Hospitalid": this.hospitalId,
      "JustificationID": 0,
      "PatientName": item.PatientName,
      "Gender": item.Gender,
      "DOB": item.DOB,
      "Nationality": item.Nationality,
      "SSN": item.SSN,
      "ConsultantName": item.Consultant,
      "BandPrintSuperVisior": 1
    }

    this.us.post(patientadmission.FetchPatientInfantBandPrint, adultbppayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.trustedUrlBase64 = response?.FTPPATHBase64
          this.showbase64Modal();
          // this.showModal();
        }

      },
      (err) => {
        console.log(err);
      }
    );

  }

  clearReprintReasons() {
    $("#CancelReasonID").val('0');
    $("#reprintRemarks").val('');
  }

  saveRePrintReason() {
    this.showTypeMandatoryMsg = false;
    this.showRemarksMandatoryMsg = false;
    if(this.reprintReason === '0' || this.reprintReason === '') {
      this.showTypeMandatoryMsg = true;
      return;
    }

    if (this.reprintReason == '5' && $("#reprintRemarks").val() == '') {
      this.showRemarksMandatoryMsg = true;
      return;
    }
    var payld = {
      "PatientID": this.reprintSelectedItem.PatientID,
      "IPID": this.reprintSelectedItem.AdmissionID,
      "UserName": this.doctorDetails[0]?.UserName,
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.ward.FacilityID,
      "Hospitalid": this.hospitalId,
      "JustificationID": this.reprintReason,
      "Justification": $("#reprintRemarks").val(),
      "PatientName": this.reprintSelectedItem.PatientName,
      "Gender": this.reprintSelectedItem.Gender,
      "DOB": this.reprintSelectedItem.DOB,
      "Nationality": this.reprintSelectedItem.Nationality,
      "PrintType": this.isAdultPrint ? "Adult" : "Infant",
      "SSN": this.reprintSelectedItem.SSN,
      "ConsultantName": this.reprintSelectedItem.Consultant,
      "BandPrintSuperVisior": 1
    }

    this.us.post(patientadmission.SavePatientBandPrintingHistory, payld).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH;
          this.trustedUrlBase64 = response?.FTPPATHBase64;
          $("#cancelReasons").modal('hide');
          $("#reprintSavedMsg").modal('show');
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onReprintReasonChange(event: any) {
    this.reprintReason = event.target.value;
    if (this.reprintReason == "5")
      this.showRemarksForOther = true;
    else
      this.showRemarksForOther = false;
  }

  onPrintRemarksChange() {
    this.showRemarksMandatoryMsg = false;
  }

  FetchPatientConfirmAdultBandPrint(item: any) {
    this.isAdultPrint = true;
    var adultbppayload = {
      "PatientID": item.PatientID,
      "IPID": item.AdmissionID,
      "UserName": this.doctorDetails[0]?.UserName,
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.ward.FacilityID,
      "Hospitalid": this.hospitalId,
      "JustificationID": 0,
      "PatientName": item.PatientName,
      "Gender": item.Gender,
      "DOB": item.DOB,
      "Nationality": item.Nationality,
      "SSN": item.SSN,
      "ConsultantName": item.Consultant,
      "BandPrintSuperVisior": 1
    }
    this.us.post(patientadmission.FetchPatientAdultBandPrint, adultbppayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModal();          
        }
        else {
          if (response.objLabReportNList.length > 0) {
            this.reprintReasons = response.objLabReportNList;
            this.showRemarksForOther = false;
            this.reprintSelectedItem = item;
            $("#cancelReasons").modal('show');
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  FetchPatientConfirmInfantBandPrint(item: any) {
    this.isAdultPrint = false;
    var adultbppayload = {
      "PatientID": item.PatientID,
      "IPID": item.AdmissionID,
      "UserName": this.doctorDetails[0]?.UserName,
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.ward.FacilityID,
      "Hospitalid": this.hospitalId,
      "JustificationID": 0,
      "PatientName": item.PatientName,
      "Gender": item.Gender,
      "DOB": item.DOB,
      "Nationality": item.Nationality,
      "SSN": item.SSN,
      "ConsultantName": item.Consultant,
      "BandPrintSuperVisior": 1
    }
    // this.us.get(this.url)
    //   .subscribe((response: any) => {
    //     if (response.Code == 200) {

    //     }
    //   },
    //     (err) => {
    //     })

    this.us.post(patientadmission.FetchPatientInfantBandPrint, adultbppayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModal();
        }
        else {
          if (response.objLabReportNList.length > 0) {
            this.reprintReasons = response.objLabReportNList;
            this.showRemarksForOther = false;
            this.reprintSelectedItem = item;
            $("#cancelReasons").modal('show');
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  showbase64Modal() {
    this.loadPdfAndPrint(this.trustedUrlBase64);
  }

  loadPdfAndPrint(base64String: string): void {
    const byteCharacters = atob(base64String);
    const byteNumbers = Array.from(byteCharacters).map((char) => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const url = URL.createObjectURL(blob);

    const iframe = document.getElementById('pdfIframe') as HTMLIFrameElement;
    iframe.src = url;

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      setTimeout(() => {
        //window.location.reload();
        URL.revokeObjectURL(url);
      }, 5000); 
    };
  }
}



export const vteriskassessment = {
  FetchFinalSaveVTERiskAssessment: 'FetchFinalSaveVTERiskAssessment?AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientFinalObgVTEFrom: 'FetchPatientFinalObgVTEFrom?PatientObgVTEID=${PatientObgVTEID}&AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientAdultBandPrintEMR: 'FetchPatientAdultBandPrintEMR',
};
