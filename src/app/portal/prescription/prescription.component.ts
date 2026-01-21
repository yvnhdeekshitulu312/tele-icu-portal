import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { IInvestigations, InvestigationProcedures } from './prescription-interface';
import { DrugDetails, ProcedureDetails, InvestigationDetails, TeethInfoDetails, IvfDetails } from './models/prescription.model';
import { Observable, ObservableInput, Subject, catchError, combineLatest, combineLatestAll, concatMap, debounceTime, first, forkJoin, of } from 'rxjs';
import { FormBuilder, Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { TreeviewComponent, TreeviewConfig, TreeviewItem } from 'ngx-treeview';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import BulletModule from 'highcharts/modules/bullet';
import { AntibioticComponent } from '../antibiotic/antibiotic.component';
import { cloneDeep } from 'lodash';
import { UtilityService } from 'src/app/shared/utility.service';
import { TherapeuticPhlebotomyFormComponent } from 'src/app/templates/therapeutic-phlebotomy-form/therapeutic-phlebotomy-form.component';

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
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.scss'],
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
export class PrescriptionComponent implements OnInit {
  @Output() savechanges = new EventEmitter<any>();
  @ViewChild('therapeuticForm', { static: false })
  therapeuticForm: TherapeuticPhlebotomyFormComponent | undefined;
  groupedData: { [key: string]: FavouriteInvProc[] } = {};
  groupedDataFilter: { groupkey: string, values: FavouriteInvProc[] }[] = [];
  groupedDataPFilter: { groupkey: string, values: FavouriteInvProc[] }[] = [];
  groupedDataArray: { groupkey: string, values: FavouriteInvProc[] }[] = [];
  FavouriteInv: FavouriteInvProc[] = [];

  groupedDataProc: { [key: string]: FavouriteInvProc[] } = {};
  groupedDataMedic: { [key: string]: FavouriteMedication[] } = {};
  groupedDataMedicArray: { groupkey: string, values: FavouriteMedication[] }[] = [];
  groupedMedicationFilter: { groupkey: string, values: FavouriteMedication[] }[] = [];
  groupedDataProcArray: { groupkey: string, values: FavouriteInvProc[] }[] = [];
  FavouriteProcs: FavouriteInvProc[] = [];
  FavouriteMedic: FavouriteMedication[] = [];
  showHomeMedInPrevMed: string = "no";
  items: any = [];
  itemProcedures: any = [];
  itemMedications: any = [];
  selectedInvestigations: any = [];
  selectedProcedures: any = [];
  selectedMedications: any = [];
  trimesterOrderPackMsg = "";
  patientDetails: any;
  patientName: any;
  age: any;
  ageValue: any;
  ctasScore: string = "0";
  gender: any;
  nationality: any;
  mobileNo: any;
  payer: any;
  langData: any;
  hospitalId: any;
  facility: any;
  uhid: any;
  PatientId: any;
  selectData: any;
  searchData: Array<InvestigationProcedures> = [];
  investigationsForm: FormGroup;
  proceduresForm: FormGroup;
  formInv: FormGroup;
  searchProceduresData: Array<InvestigationProcedures> = [];
  investigationsList: IInvestigations[] = [];
  isInvesigationsAll: boolean = false;
  isProceduresAll: boolean = false;
  investigationData: any;
  proceduresList: IInvestigations[] = [];
  drugDetails: DrugDetails[] = [];
  ivfDetails: IvfDetails[] = [];
  investigationDetails: InvestigationDetails[] = [];
  procedureDetails: ProcedureDetails[] = [];
  proceduresData: any;
  private investigationresults$ = new Subject();
  private procedureresults$ = new Subject();
  doctorDetails: any;
  AdmRoutesList: any;
  filteredAdmRoutesList: any;
  AdmRoutesListMaster: any;
  AdmRoutesListGridRow: any;
  durationList: any;
  frequenciesList: any;
  medicationReasonsList: any;
  drugFrequenciesList: any;
  filteredDrugFrequenciesList: any;
  medicationInstructions: any;
  listOfItems: any;
  itemSelected: string = "false";
  isPRN: boolean = false;
  selectedPatientAdmissionId: any;
  selectedItemsList: any = [];
  selectedTeethList: any = [];
  medicationsForm!: FormGroup;
  previousMedicationList: any = [];
  previousMedicationListDetails: any = []
  filteredpreviousMedicationList: any = [];
  viewPreviousMedicationForm!: FormGroup;
  showPrevMedFiltersData: boolean = true;
  previousMedicationListDetailsFilterData: any = [];
  PatientVisitsList: any = [];
  selectedPreviousMedications: string = "";
  selectedPreviousMedicationsList: any = [];
  issuedPrescriptionItems: any = [];
  issuedItemsAgainstPresc: any = [];
  isEditmode: boolean = false;
  orderPacks: any = [];
  orderPackDetails: any = [];
  orderpackJustifications: any = [];
  visitDiagnosis: any = [];
  selectedOrderPackIds: string = "";
  selectedOrderPacksJustification: any = [];
  showOrderPackNotUsingJustification: boolean = false;
  selectedopJustificationIds: string = "";
  loggedinDoctor: string = "";
  orderPackClass: string = "p-3 rounded-2 suggested_order  h-100 d-flex flex-column align-items-center justify-content-between";
  enableOrderPackRemarks: boolean = false;
  selectedCard: any;
  savedDrugPrescriptions: any = [];
  savedInvPrescriptions: any = [];
  savedProcPrescriptions: any = [];
  savedMonitorId: number = 0;
  savedDrugPrescriptionId: number = 0;
  savedInvPrescriptionId: number = 0;
  savedProcPrescriptionId: number = 0;
  loggedInDoctorIsDentalSpec: boolean = false;
  isMedicationFormSubmitted: boolean = false;
  showInvListdiv: boolean = false;
  showProcListdiv: boolean = false;
  actionableAlert: any;
  actionableAlertmsg: any;
  disableQty: boolean = true;
  tempSelectedInvProcList: any = [];
  tempSelectedMedicationList: any = [];
  remarksForSelectedInvName: any;
  remarksForSelectedInvId: any;
  remarksForSelectedDiscontinuedItemId: any;
  remarksForSelectedDiscontinuedPrescId: any;
  remarksForSelectedDiscontinuedItemName: any;
  remarksForSelectedHoldItemId: any;
  remarksForSelectedHoldPrescId: any;
  remarksForSelectedHoldItemName: any;
  selectedHoldReason: string = "0";
  selectedHoldReason_prev: string = "0";
  remarksForSelectedHoldItemId_prev: any;
  remarksForSelectedHoldPrescId_prev: any;
  remarksForSelectedHoldItemName_prev: any;
  holdReasonValidation: boolean = false;
  holdReasonValidation_prev: boolean = false;
  holdMasterList: any = [];
  ipPrescriptionList: any = [];
  allPrescriptionList: any = [];
  allPrescriptionListDetails: any = []
  selectedInvRemarks: any;
  remarksForSelectedProcName: any;
  remarksForSelectedProcId: any;
  remarksForSelectedMedName: any;
  selectedProcRemarks: any;
  favProc: any = [];
  favInv: any = [];
  favMed: any = [];
  searchMediTerm: any;
  showMore: boolean = false; toggleValue: string = 'Normal';
  showFavProcSelectedValidation: boolean = false;
  showFavInvSelectedValidation: boolean = false;
  showFavMedSelectedValidation: boolean = false;
  endofEpisode: boolean = false;
  prescriptionValidationMsg: any;
  prescriptionValidationMsgEnddate: any;
  tempprescriptionSelected: any;
  IsprescriptionSelectedValid: boolean = false;
  remarksMap: Map<number, string> = new Map<number, string>();
  recordRemarks: Map<number, string> = new Map<number, string>();
  remarksSelectedIndex: any = -1;
  isInvSub: boolean = false;
  isProSub: boolean = false;
  substituteItems: any = [];
  showSubstituteSelectValidationMsg = false;
  expandedIndex: number = -1;
  teethMaster: any = [];
  teethbabyMaster: any = [];
  teethInfoDetails: TeethInfoDetails[] = [];
  PatientDiagnosisDataList: any;
  selectedInvProc: any;
  orderPacksSelected: boolean = true;
  configTree = TreeviewConfig.create({
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 600
  });
  diagerrorMessages: any;
  errorMessages: any;
  patientRadiologyRequestId: any = 0;
  patientRadiologyRequestIdForMapping: any = 0;
  InvPrescriptionIDForMapping: any = 0;
  patientAge: any;
  selectedOption: string = "No";
  IsCTScan: any = false;
  IsMRI: any = false;
  isTherapeutic: any = false;
  showTherapeuticForm: boolean = false;
  SpecialiseID: any = undefined;
  IsPreg: any = false;
  IsPed: any = false;
  disableDelete: boolean = false;
  prescriptionSaveData: any = {};
  IsMRIClick: any = 0;
  ipPrescriptionCount: any;
  prescribingDoctor: any;
  tempProceduresList: any;
  tempMedicationsList: any;
  tempInvestigationList: any;
  changedMedicationsList: any = [];
  changedProceduresList: any = [];
  changedInvestigationsList: any = [];
  orderpackSelectedAndModified: boolean = false;
  duplicateItemsList: any;
  lexicomData: any;
  lexicomTooltipMsg: string = "";
  lexicomAlertsList: any = [];
  lexicomInlineAlertsList: any = [];
  lexicomInlineAlertsListPassed: any = [];
  lexicomAlertsWithTextList: any = [];
  lexicomSummaryAlertsList: any = [];
  lexicomSummaryAlertsListPassed: any = [];
  lexicomDrugName: string = "";
  showPassedLexicomAlerts: boolean = false;
  showPassedLexicomSummaryAlerts: boolean = false;
  medicationSchedules: any;
  selectedMedDrugFreqScheduleTime: any;
  medicationSchedulesForm!: FormGroup;
  patientType: any;
  tariffId: number = 0;
  ConsultationAmount: any;
  LOALimit: any;
  justificationArr: any = [];
  loaDataList: any = [];
  loaServicesDataList: any = [];
  loaDiagnosis: string = "";
  loaCc: any;
  selectedPrevMedItem: any;
  selectedService: any;
  holdBtnName: string = 'Hold';
  holdBtnName_prev: string = 'Hold';
  medicineHistory: any = [];
  showMedicineHistorydiv = false;
  selectedHistoryItem: any;
  orderPackId = "0";
  isVteEntered = true;
  isAdmReconEntered = true;
  isIniAsmntEntered = true;
  prevChiefCompl: any;
  prevPhyExam: any;
  entryId = 0;
  trustedUrl: any;
  PrescriptionRestriction: string = "";
  dentalSpecialisations = [30, 273, 275, 283, 279, 284, 274, 276];
  @ViewChild('divPhysicalExamination')
  divPhysicalExamination!: ElementRef;

  searchFrequencyTerm: any;
  searchRouteTerm: any;
  minDate: any;
  selectAllPrevMedFilter: boolean = false;

  teeth1: string = "teeth ur_1 d-flex align-items-center flex-row-reverse";
  teeth2: string = "teeth ur_2 d-flex align-items-center flex-row-reverse";
  teeth3: string = "teeth ur_3 d-flex align-items-center flex-row-reverse";
  teeth4: string = "teeth ur_4 d-flex align-items-center flex-row-reverse";
  teeth5: string = "teeth ur_5 d-flex align-items-center flex-row-reverse";
  teeth6: string = "teeth ur_6 d-flex align-items-center flex-row-reverse";
  teeth7: string = "teeth ur_7 d-flex align-items-center flex-row-reverse";
  teeth8: string = "teeth ur_8 d-flex align-items-center flex-row-reverse";
  teeth9: string = "teeth ul_8 d-flex align-items-center";
  teeth10: string = "teeth ul_7 d-flex align-items-center";
  teeth11: string = "teeth ul_6 d-flex align-items-center";
  teeth12: string = "teeth ul_5 d-flex align-items-center";
  teeth13: string = "teeth ul_4 d-flex align-items-center";
  teeth14: string = "teeth ul_3 d-flex align-items-center";
  teeth15: string = "teeth ul_2 d-flex align-items-center";
  teeth16: string = "teeth ul_1 d-flex align-items-center";
  teeth17: string = "teeth bl_8 d-flex align-items-center";
  teeth18: string = "teeth bl_7 d-flex align-items-center";
  teeth19: string = "teeth bl_6 d-flex align-items-center";
  teeth20: string = "teeth bl_5 d-flex align-items-center";
  teeth21: string = "teeth bl_4 d-flex align-items-center";
  teeth22: string = "teeth bl_3 d-flex align-items-center";
  teeth23: string = "teeth bl_2 d-flex align-items-center";
  teeth24: string = "teeth bl_1 d-flex align-items-center";
  teeth25: string = "teeth br_1 d-flex align-items-center flex-row-reverse";
  teeth26: string = "teeth br_2 d-flex align-items-center flex-row-reverse";
  teeth27: string = "teeth br_3 d-flex align-items-center flex-row-reverse";
  teeth28: string = "teeth br_4 d-flex align-items-center flex-row-reverse";
  teeth29: string = "teeth br_5 d-flex align-items-center flex-row-reverse";
  teeth30: string = "teeth br_6 d-flex align-items-center flex-row-reverse";
  teeth31: string = "teeth br_7 d-flex align-items-center flex-row-reverse";
  teeth32: string = "teeth br_8 d-flex align-items-center flex-row-reverse";

  babyteeth1: string = "teeth ul_1 d-flex align-items-center"
  babyteeth2: string = "teeth ul_2 d-flex align-items-center"
  babyteeth3: string = "teeth ul_3 d-flex align-items-center"
  babyteeth4: string = "teeth ul_4 d-flex align-items-center"
  babyteeth5: string = "teeth ul_5 d-flex align-items-center"
  babyteeth6: string = "teeth ur_1 d-flex align-items-center flex-row-reverse"
  babyteeth7: string = "teeth ur_2 d-flex align-items-center flex-row-reverse"
  babyteeth8: string = "teeth ur_3 d-flex align-items-center flex-row-reverse"
  babyteeth9: string = "teeth ur_4 d-flex align-items-center flex-row-reverse"
  babyteeth10: string = "teeth ur_5 d-flex align-items-center flex-row-reverse"
  babyteeth11: string = "teeth br_1 d-flex align-items-center flex-row-reverse"
  babyteeth12: string = "teeth br_2 d-flex align-items-center flex-row-reverse"
  babyteeth13: string = "teeth br_3 d-flex align-items-center flex-row-reverse"
  babyteeth14: string = "teeth br_4 d-flex align-items-center flex-row-reverse"
  babyteeth15: string = "teeth br_5 d-flex align-items-center flex-row-reverse"
  babyteeth16: string = "teeth bl_1 d-flex align-items-center"
  babyteeth17: string = "teeth bl_2 d-flex align-items-center"
  babyteeth18: string = "teeth bl_3 d-flex align-items-center"
  babyteeth19: string = "teeth bl_4 d-flex align-items-center"
  babyteeth20: string = "teeth bl_5 d-flex align-items-center"
  dentalOthers: boolean = false;
  DischargeMedication: boolean = false;
  selectall = false;
  private searchInput$ = new Subject<string>();
  private searchInputInvProc$ = new Subject<string>();
  private searchInputProc$ = new Subject<string>();
  timeout = 1000;
  monographData: any;
  MedAlerts = "0";
  PBADrugInfoData: any;
  pdbRejectedItems: string = "";
  ICDCodeData: any;
  isPbmChecked = true;
  pbmRemarks = false;
  pbmRemarksText = "";
  GenericBrand: any = "0";
  GenericBrandtoggleValue: string = 'Brand';
  pregnancyHistory: any = [];
  SerumLevel: any;
  dischargeIntimationRiased = false;
  selectedIPPrescription: any = [];

  antibioticTemplateValue = '';
  gaugeChart1: any;
  gaugeChart2: any;
  bulletChart1: any;
  bulletChart2: any;
  showDentalTooth: boolean = false;
  baseSolutions: any = [];
  baseSolutionsNSS: any = [];
  baseSolutionsDEX: any = [];
  selectedIvMedicationForBaseSolution: any;
  isBaseSolutionAdding: boolean = false;
  selectedSearchedMedItem: any;

  orderScheduling: any = {
    orderId: '',
    specialiseId: '',
    serviceId: '',
    orderName: '',
    orderDate: new Date(),
    ordertime: this.setCurrentTime(),
    orderQty: '',
    orderQtyUom: '',
    orderFreq: '',
    orderDuration: '',
    orderDurationUom: '',
  }
  orderSchedules: any = [];
  multipleOrderSchedules: any = [];
  multipleOrderPayload: any = [];
  procedureSchedules: any = [];
  showSetBtn: boolean = true;
  currentFilter: any;
  isIvFluid: boolean = false;
  activeMedications: any = [];
  activeMedicationsCount: any = [];
  therapeuticInvPrescriptionId: any;
  mismatchedMedications: any = [];
  isMedicationRemarksRequired: boolean = false;
  isSelctedFromFav: boolean = false;
  pregnancyHistoryDetails: any;
  patientAllergies: any = [];
  ageFromDOB: any;
  validatedMilkMedItemsfav: any = [];
  selectOption(option: string): void {
    this.selectedOption = option;
  }

  selectedPaediatricOption: string = "No";

  selectPaediatricOption(option: string): void {
    this.selectedPaediatricOption = option;
  }

  selectedSpecialOption: string = "No";

  selectSpecialOption(option: string): void {
    this.selectedSpecialOption = option;
  }

  selectedSedationOption: string = "No";

  selectSedationOption(option: string): void {
    this.selectedSedationOption = option;
  }

  selectedContrastOption: string = "No";

  selectContrastOption(option: string): void {
    this.selectedContrastOption = option;
  }

  selectedPreviousOption: string = "No";

  selectPreviousOption(option: string): void {
    this.selectedPreviousOption = option;
  }

  radiologyRequestDataList: any = [];
  radForm: any;
  treeviewItems!: TreeviewItem[];
  @ViewChild(TreeviewComponent, { static: true }) trvComponent!: TreeviewComponent;

  private saveClickSubject = new Subject<void>();

  isMappingAll: boolean = false;

  constructor(private config: ConfigService, public datepipe: DatePipe, private fb: FormBuilder, private modalSvc: NgbModal, private us: UtilityService) {
    this.langData = this.config.getLangData();
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    this.selectedCard = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.patientAllergies = JSON.parse(sessionStorage.getItem("PatientAllergies") || '{}');

    if (this.selectedCard.PatientType == "2" || this.selectedCard.PatientType == "4") {
      this.ageValue = this.patientDetails.AgeValue;
    }
    else if (this.selectedCard.PatientType == "3") {
      this.ctasScore = this.selectedCard.CTASSCore;
      this.ageValue = this.patientDetails.Age.trim().split(' ')[0];
      this.toggleStatNormal('stat');
    }
    else if (this.patientDetails.Age.toString().trim().split(' ').length > 1) {
      this.ageValue = this.patientDetails.Age.trim().split(' ')[0];
    }
    else {
      this.ageValue = this.patientDetails.Age;
    }

    if ((this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4') ? this.patientDetails.AgeValue : this.patientDetails.Age >= 16 && this.patientDetails.Gender === "Female") {
      this.IsPreg = true;
    }

    if ((this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4') ? this.patientDetails.AgeValue : this.patientDetails.Age < 12) {
      this.IsPed = true;
    }

    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.selectedPatientAdmissionId = sessionStorage.getItem("selectedPatientAdmissionId")
    this.investigationsForm = this.fb.group({
      InvestigationId: ['', Validators.required],
      InvestigationName: ['', Validators.required],
      Remarks: ['', Validators.required]
    });

    this.proceduresForm = this.fb.group({
      ProcedureId: ['', Validators.required],
      ProcedureName: ['', Validators.required],
      Quantity: [''],
      Remarks: ['', Validators.required]
    });
    this.formInv = this.fb.group({
      name: ['']
    })
    this.medicationSchedulesForm = this.fb.group({
      ItemId: [''],
      ScheduleTime: [''],
      Dose: ['']
    });

    this.saveClickSubject.pipe(
      debounceTime(1000)
    ).subscribe(() => this.savePrescription());

  }
  form = new FormGroup({
    items: new FormArray([])
  });

  initializeMedicationsForm(): void {
    this.medicationsForm = this.fb.group({
      ItemId: ['', Validators.required],
      ItemName: ['', Validators.required],
      AdmRouteId: ['', Validators.required],
      AdmRoute: ['', Validators.required],
      FrequencyId: ['', Validators.required],
      Frequency: ['', Validators.required],
      ScheduleStartDate: ['', Validators.required],
      StartFrom: [''],
      Dosage: [''],
      DosageId: ['', Validators.required],
      Strength: ['', Validators.required],
      StrengthUoMID: ['', Validators.required],
      StrengthUoM: ['', Validators.required],
      IssueUOMValue: ['', Validators.required],
      IssueUoM: ['', Validators.required],
      IssueUOMID: ['', Validators.required],
      IssueTypeUOM: ['', Validators.required],
      DefaultUOMID: ['', Validators.required],
      DurationValue: ['', Validators.required],
      DurationId: ['', Validators.required],
      Duration: ['', Validators.required],
      medInstructionId: [''], // ['', this.selectedCard.PatientType == 1 ? Validators.required : []],
      PresInstr: [''],
      Quantity: ['', Validators.required],
      PresTypeId: [''],
      PresType: [''],
      PRNType: [''],
      QuantityUOM: ['', Validators.required],
      QuantityUOMId: ['', Validators.required],
      GenericId: ['', Validators.required],
      IsPRN: [''],
      PRNREASON: [''],
      Remarks: [''],
      IsFav: [''],
      ScheduleTime: [''],
      ScheduleEndDate: [''],
      CustomizedDosage: [''],
      QOH: [''],
      IVFluidStorageCondition: [''],
      BaseSolutionID: [''],
      IVFluidExpiry: [''],
      Price: [''],
      DiagnosisId: ['', Validators.required],
      DiagnosisName: [''],
      DiagnosisCode: [''],
      IsAntibiotic: [''],
      IsAntibioticForm: [''],
      PrescribedQty: [''],
      IsHighValueDrug: [''],
      ItemCode: [''],
      IsMilk: [''],
    });
  }
  initiatePreviousMedicationForm() {
    this.viewPreviousMedicationForm = this.fb.group({
      fromdate: [''],
      todate: [''],
      PrescriptionID: ['0']
    });
  }

  initiateRadForm() {
    this.radForm = this.fb.group({
      LMPDate: [''],
      IsNormalKidneyFunction: [false],
      IsChronicRenalImpairment: [false],
      IsAcuteKidneyInjury: [false],
      IsHaemodialysis: [false],
      SerumCreatinineLevel: [''],
      ActiveIssues: [''],
      Diagnosis: [''],
      QAndA: ['']
    });
  }
  get medicationScheduleitems(): FormArray {
    return this.medicationSchedulesForm.get('items') as FormArray;
  }
  ngOnInit(): void {
    this.minDate = new Date();
    HighchartsMore(Highcharts);
    BulletModule(Highcharts);
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.hospitalId = sessionStorage.getItem('hospitalId');
    this.pregnancyHistory = JSON.parse(sessionStorage.getItem("PregnancyHistory") || '{}');

    this.prevChiefCompl = sessionStorage.getItem('prevChiefCompl');
    this.prevPhyExam = sessionStorage.getItem('prevPhyExam');
    // this.divPhysicalExamination.nativeElement.innerHTML = this.prevPhyExam;

    this.loggedinDoctor = this.doctorDetails[0].EmployeeName;
    this.PrescriptionRestriction = this.doctorDetails[0].PrescriptionRestriction;
    if (this.doctorDetails[0].EmpSpecialisationId == 30)
      this.loggedInDoctorIsDentalSpec = true;
    this.uhid = this.patientDetails.RegCode;
    this.PatientId = this.patientDetails.PatientId === undefined ? this.patientDetails.PatientID : this.patientDetails.PatientId;

    if (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '3' || this.selectedCard.PatientType == '4') {
      this.PatientId = this.patientDetails.PatientID;
    }
    if (sessionStorage.getItem('lang') == "ar") {
      this.patientName = this.patientDetails.FirstName2l + ' ' + this.patientDetails.MiddleName2L + ' ' + this.patientDetails.Familyname2l;
    }
    else {
      this.patientName = this.patientDetails.FirstName + ' ' + this.patientDetails.MiddleName + ' ' + this.patientDetails.Familyname;
    }
    if (sessionStorage.getItem("ISEpisodeclose") === "true") {
      this.endofEpisode = true;
    } else {
      this.endofEpisode = false;
    }
    this.age = this.patientDetails.Age + ' ' + this.patientDetails.AgeUoM;
    this.gender = this.patientDetails.Gender;
    this.nationality = this.patientDetails.Nationality;
    this.mobileNo = this.patientDetails.MobileNo;
    this.payer = this.patientDetails.InsuranceName;
    this.patientType = this.selectedCard.PatientType;

    this.prescribingDoctor = this.selectedCard.Consultant;
    if (this.selectedCard.IsPregnancy) {
      this.selectOption("Yes");
    }

    this.fetchDiagnosis();
    //Medication Master Data
    this.FetchMedicationDemographics();
    this.FetchDrugFrequencies();
    this.FetchMedicationInstructions();
    this.initializeMedicationsForm();
    this.FetchOrderPacks();
    if (this.selectedCard.PatientType == '1')
      this.FetchPrescriptionInfo();
    //this.getFetchFavouriteitemsDoctorWise(this.doctorDetails[0].EmpId);
    this.initiatePreviousMedicationForm();
    var d = new Date();
    d.setMonth(d.getMonth() - 12);
    var endd = new Date(); endd.setMonth(endd.getMonth() + 3)
    this.viewPreviousMedicationForm.patchValue({
      fromdate: d,
      todate: endd
    })
    this.medicationsForm.patchValue({
      ScheduleStartDate: new Date()
    })
    this.initiateRadForm();
    this.FetchMasterTeethInfo();
    this.FetchHoldMaster();
    this.fetchListOfPrescription();
    this.initializeSearchListener();
    this.initializeSearchInvProcListener();
    this.initializeSearchProcListener();
    this.fetchPatientDataEforms();
    this.medicationSchedulesForm = this.fb.group({
      items: this.fb.array([])
    });
    if (this.selectedCard.IsFitForDischarge !== undefined && this.selectedCard.IsFitForDischarge) {
      this.dischargeIntimationRiased = true;
    }
    //this.CheckIsAdmReconVTEIntialAsmntCompleted();
    this.getPatientDiagnosis();
    this.tariffId = this.selectedCard.Tariffid ? this.selectedCard.Tariffid : this.selectedCard.TariffId ? this.selectedCard.TariffId : '0';
    this.ConsultationAmount = this.selectedCard.ConsultationAmount;
    this.LOALimit = Number(this.selectedCard.LOALimit);
    const dentalspecs = this.dentalSpecialisations.find((x: any) => x === Number(this.doctorDetails[0].EmpSpecialisationId));
    if (dentalspecs) {
      this.showDentalTooth = true;
    }
    this.ageFromDOB = this.calculateAge(new Date(this.patientDetails.DOB));
  }
  allowInvProcSelected() {
    $("#showActionableAlerts").modal('hide');
    if (this.tempSelectedInvProcList.ServiceID == "3") {
      this.showInvListdiv = true;
      this.investigationsList.push({
        ID: this.investigationsList.length + 1, SOrN: 'N', Name: this.tempSelectedInvProcList.Name, Specialisation: this.tempSelectedInvProcList.Specialisation, Quantity: 1,
        ServiceItemId: this.tempSelectedInvProcList.ServiceItemID, SpecialisationId: this.tempSelectedInvProcList.SpecialiseID, ServiceTypeId: this.tempSelectedInvProcList.ServiceTypeID, SpecimenId: this.tempSelectedInvProcList.SpecimenID,
        Remarks: this.tempSelectedInvProcList.Remarks, IsFav: this.tempSelectedInvProcList.IsFav, Status: 0, disableDelete: false, TATRemarks: this.tempSelectedInvProcList.TATRemarks, ResultStatus: this.tempSelectedInvProcList.ResultStatus,
        ItemPrice: this.selectedCard.BillType === 'Insured' ? this.tempSelectedInvProcList.CompanyPrice : this.tempSelectedInvProcList.BasePrice,
        DEPARTMENTID: this.tempSelectedInvProcList.DepartmentID
      })
    }
    else if (this.tempSelectedInvProcList.ServiceID == "5") {
      this.showProcListdiv = true;
      this.proceduresList.push({
        ID: this.proceduresList.length + 1, SOrN: 'N', Name: this.tempSelectedInvProcList.Name, Specialisation: this.tempSelectedInvProcList.Specialisation, Quantity: 1,
        ServiceItemId: this.tempSelectedInvProcList.ServiceItemID, SpecialisationId: this.tempSelectedInvProcList.SpecialiseID, ServiceTypeId: this.tempSelectedInvProcList.ServiceTypeID,
        Remarks: this.tempSelectedInvProcList.Remarks, IsFav: this.tempSelectedInvProcList.IsFav, Status: 0, disableDelete: false, TATRemarks: '', ResultStatus: '',
        ItemPrice: this.selectedCard.BillType === 'Insured' ? this.tempSelectedInvProcList.CompanyPrice : this.tempSelectedInvProcList.BasePrice,
        DEPARTMENTID: this.tempSelectedInvProcList.DepartmentID
      })
    }
    this.tempSelectedInvProcList = [];
    this.createGaugeChart();
  }
  addInvestigationsRow(data?: any) {

    this.config.FetchServiceActionableAlerts(this.selectedPatientAdmissionId, this.ageValue, data.ServiceItemID).subscribe((response) => {
      if (response.Status === "Success") {
        if (response.ActionItemDataList.length > 0) {
          if (response.ActionItemDataList[0].PopupMessage == true) {
            this.actionableAlert = response.ActionItemDataList[0].Justifications;
            $("#showActionableAlerts").modal('show');
            this.tempSelectedInvProcList = data;
          }
          else if (response.ActionItemDataList[0].PopupMessage == false && response.ActionItemDataList[0].strMessage != "" && response.ActionItemDataList[0].strMessage != null) {
            this.actionableAlertmsg = response.ActionItemDataList[0].strMessage;
            $("#showActionableAlertsMsg").modal('show');
          }
          else {
            if (data.ServiceID == "3") {
              let findInv;
              if (this.investigationsList.length > 0) {
                findInv = this.investigationsList.filter((x: any) => x?.ServiceItemId === data.ServiceItemID);
              }
              if (findInv != undefined && findInv.length > 0) {
                this.selectedInvProc = findInv[0].Name;
                $("#invProcAlreadySelected").modal('show');
              }
              else {
                this.showInvListdiv = true;
                let DISID = '';
                if (this.investigationsList.length > 0 && this.isInvesigationsAll) {
                  DISID = this.investigationsList[0].DISID;
                }
                this.investigationsList.push({
                  ID: this.investigationsList.length + 1, SOrN: this.selectedCard.PatientType === "3" ? "S" : 'N', Name: data.Name, Specialisation: data.Specialisation, Quantity: 1,
                  ServiceItemId: data.ServiceItemID, SpecialisationId: data.SpecialiseID, ServiceTypeId: data.ServiceTypeID, SpecimenId: data.SpecimenID,
                  Remarks: data.Remarks == undefined ? "" : data.Remarks, IsFav: data.IsFav, Status: 0, disableDelete: false, TATRemarks: data.TATRemarks,
                  ResultStatus: data.ResultStatus, ItemPrice: this.selectedCard.BillType === 'Insured' ? data.CompanyPrice : data.BasePrice,
                  DEPARTMENTID: data.DepartmentID,
                  DISID
                });
                if (data.SpecialiseID == '214' || data.SpecialiseID == '217' || data.SpecialiseID == '13') {
                  const item = this.investigationsList.find((x: any) => x.ServiceItemId === data.ServiceItemID);
                  this.openInvRemarksPopup(item);
                }
              }
            }
            else if (data.ServiceID == "5") {
              let findProc;
              if (this.proceduresList.length > 0) {
                findProc = this.proceduresList.filter((x: any) => x?.ServiceItemId === data.ServiceItemID);
              }
              if (findProc != undefined && findProc.length > 0) {
                this.selectedInvProc = findProc[0].Name;
                $("#invProcAlreadySelected").modal('show');
              }
              else {
                this.showProcListdiv = true;
                this.proceduresList.push({
                  ID: this.proceduresList.length + 1, SOrN: this.selectedCard.PatientType === "3" ? "S" : 'N', Name: data.Name, Specialisation: data.Specialisation, Quantity: 1,
                  ServiceItemId: data.ServiceItemID, SpecialisationId: data.SpecialiseID, ServiceTypeId: data.ServiceTypeID, Remarks: data.Remarks == undefined ? "" : data.Remarks,
                  IsFav: data.IsFav, Status: 0, TATRemarks: '', ResultStatus: '', ItemPrice: this.selectedCard.BillType === 'Insured' ? data.CompanyPrice : data.BasePrice,
                  DEPARTMENTID: data.DepartmentID
                })
              }
            }
          }
        }
        $("#invprocSmartSearch").val('');
        this.createGaugeChart();
        // this.showSpeedMeterPopUp();
      }
    },
      (err) => {
      })
  }

  deleteInvestigation(index: any) {

    const inv = this.savedInvPrescriptions.find((x: any) => x.PID === this.investigationsList[index].ServiceItemId);
    if (inv && Number(inv.SavedDoctorEmpID) !== this.doctorDetails[0].EmpId) {
      this.errorMessages = "Cannot delete as the Order has been raised by another doctor";
      $("#errorMsg").modal('show');
      return;
    }

    if (this.patientType === '2' || this.patientType === '4') {
      if (Number(this.investigationsList[index].ResultStatus) > 1) {
        this.errorMessages = "Cannot delete as the Order has been already processed";
        $("#errorMsg").modal('show');
        return;
      }
    }
    else if (this.patientType === '1' || this.patientType === '3') {
      if (Number(this.investigationsList[index].ResultStatus) >= 1) {
        this.errorMessages = "Cannot delete as the Order has been already processed";
        $("#errorMsg").modal('show');
        return;
      }
    }
    this.investigationsList.splice(index, 1);
    if (this.investigationsList.length === 0) {
      this.showInvListdiv = false;
      this.isInvesigationsAll = false;
    }
    this.createGaugeChart();
  }

  deleteProcedure(index: any) {

    const inv = this.savedProcPrescriptions.find((x: any) => x.PID === this.proceduresList[index].ServiceItemId);
    if (inv && Number(inv.SavedDoctorEmpID) !== this.doctorDetails[0].EmpId) {
      this.errorMessages = "Cannot delete as the Order has been raised by another doctor";
      $("#errorMsg").modal('show');
      return;
    }

    if (this.patientType === '2' || this.patientType === '4') {
      if (Number(this.proceduresList[index].ResultStatus) > 1) {
        this.errorMessages = "Cannot delete as the Order has been already processed";
        $("#errorMsg").modal('show');
        return;
      }
    }
    else if (this.patientType === '1') {
      if (Number(this.proceduresList[index].ResultStatus) >= 1) {
        this.errorMessages = "Cannot delete as the Order has been already processed";
        $("#errorMsg").modal('show');
        return;
      }
    }
    this.proceduresList.splice(index, 1);
    if (this.proceduresList.length === 0) {
      this.showProcListdiv = false;
      this.isProceduresAll = false;
    }
    this.createGaugeChart();
    if (this.procedureSchedules.length > 0) {
      this.procedureSchedules = this.procedureSchedules.filter((x: any) => x.ServiceItemId != inv.ServiceItemId);
    }
  }

  ProcedureQuantity(index: any, event: any) {
    this.proceduresList[index].Quantity = event.target.value;
  }
  InvestigationQuantity(index: any, event: any) {
    this.investigationsList[index].Quantity = event.target.value;
  }
  SaveData() {
    this.savechanges.emit('Prescription');
  }

  addProceduresRow(data?: any) {
    if (data) {
      let DISID = '';
      if (this.proceduresList.length > 0 && this.isProceduresAll) {
        DISID = this.proceduresList[0].DISID;
      }
      this.proceduresList.push({
        ID: this.proceduresList.length + 1, SOrN: 'N', Name: data.Name, Specialisation: data.Specialisation, Quantity: 1,
        ServiceItemId: data.ServiceItemID, SpecialisationId: data.SpecialiseID, ServiceTypeId: data.ServiceTypeID, IsFav: data.IsFav, TATRemarks: '',
        ResultStatus: '',
        ItemPrice: this.selectedCard.BillType === 'Insured' ? data.CompanyPrice : data.BasePrice,
        DISID,
        Remarks: ''
      })
      this.showProcListdiv = true;
    }
    setTimeout(() => {
      $("#procSmartSearch").val('');
    }, 0);
    this.createGaugeChart();
    // this.showSpeedMeterPopUp();
  }

  get control() {
    return this.form.get('items') as FormArray;
  }

  selectedFavInvestigation(selectedFav: any) {
    if (!this.selectedInvestigations.includes(selectedFav.ProcedureID)) {
      selectedFav.isSelected = true;
      if (this.patientType === '1') {
        const restrictionServiceItems = this.doctorDetails[0].RestrictionServiceItems.split(',').map((item: string) => {
          const splitItems = item.split('-');
          return {
            ServiceItemID: splitItems[0],
            Duration: Number(splitItems[1]),
            DurationType: splitItems[2]
          };
        });
        const restrictionItem = restrictionServiceItems.find((item: any) => item.ServiceItemID ===  selectedFav.ProcedureID);
        if (restrictionItem) {
          const url = this.us.getApiUrl(prescription.FetchPatientPrescriptionDetails, {
            PatientID: this.PatientId,
            ItemID: selectedFav.ProcedureID,
            WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
            HospitalID: this.hospitalId
          });
          this.us.get(url).subscribe((res: any) => {
            if (res.Code === 200 && res.FetchPatientPrescriptionDetailsDataList.length > 0) {
              // Patient has previous prescriptions for the restricted item
              const lastPrescription = res.FetchPatientPrescriptionDetailsDataList[0];
              const lastPrescribedDate = new Date(lastPrescription.PrescriptionDate);
              const currentDate = new Date();
              const nextAllowedDate = new Date(lastPrescribedDate);
              switch (restrictionItem.DurationType) {
                case 'Months':
                  nextAllowedDate.setMonth(nextAllowedDate.getMonth() + restrictionItem.Duration);
                  break;
              }
              if (currentDate < nextAllowedDate) {
                this.isSelctedFromFav = true;
                this.selectedService = selectedFav;
                this.errorMessages = `The item ${lastPrescription.ProcedureName} is already prescribed by ${lastPrescription.DoctorName} on ${lastPrescription.PrescriptionDate}. You can prescribe it again after ${this.formatDate(nextAllowedDate)}. Do you wish to continue ?`;
                $('#restrictedItemsYesNo').modal('show');
              } else {
                this.selectedInvestigations.push(selectedFav.ProcedureID);
              }
            } else {
              this.selectedInvestigations.push(selectedFav.ProcedureID);
            }
          });
        } else {
          this.selectedInvestigations.push(selectedFav.ProcedureID);
        }
      } else {
        this.selectedInvestigations.push(selectedFav.ProcedureID);
      }
    } else {
      selectedFav.isSelected = false;
      this.selectedInvestigations.splice(this.selectedInvestigations.indexOf(selectedFav.ProcedureID), 1);
    }
  }
  selectedFavProcedure(selectedFav: any) {

    if (!this.selectedProcedures.includes(selectedFav.ProcedureID)) {
      this.selectedProcedures.push(selectedFav.ProcedureID);
    } else {
      this.selectedProcedures.splice(this.selectedProcedures.indexOf(selectedFav.ProcedureID), 1);
    }
  }

  assignedInvestigations1() {
    if (this.selectedInvestigations.length > 0) {
      const apiCalls = this.selectedInvestigations.map((element: any) => {
        //return this.config.getInvestigationProcedureDetailsNH(element, 3, this.tariffId, this.patientType, 
        return this.config.getInvestigationProcedureDetailsNHPR(element, 3, this.tariffId, this.patientType,
          this.hospitalId, this.doctorDetails[0].EmpId).pipe(
            catchError(error => of(error))
          );
      });
      forkJoin(apiCalls).subscribe({
        next: (responses: any) => {
          responses.forEach((response: any, index: any) => {
            if (response.Status === "Success") {
              this.addInvestigationsRow(response.InvestigationsAndProceduresList[0]);
            }
          });
        },
        complete: () => {
          console.log('All API calls finished.');
        }
      });
      this.showFavInvSelectedValidation = false;
      $("#modalProcedureFavorite").modal('hide');
      $("#modalFavorite").modal('hide');
      $("#lab_reports").modal('hide');
    }
    else {
      this.showFavInvSelectedValidation = true;
    }
  }

  assignedInvestigations() {
    if (this.selectedInvestigations.length > 0) {
      const serviceItemIds = this.selectedInvestigations.map((item: any) => item).join(',');
      this.config.getInvestigationProcedureDetailsNHPR(serviceItemIds, 3, this.tariffId, this.patientType, this.hospitalId, this.doctorDetails[0].EmpId).subscribe((response) => {
        if (response.Status === "Success") {
          response.InvestigationsAndProceduresList.forEach((data: any) => {
            const itemAlreadyExist = this.investigationsList.find((x: any) => x.ServiceItemId == data.ServiceItemID);
            if (!itemAlreadyExist) {
              this.showInvListdiv = true;
              let DISID = '';
              if (this.investigationsList.length > 0 && this.isInvesigationsAll) {
                DISID = this.investigationsList[0].DISID;
              }
              this.investigationsList.push({
                ID: this.investigationsList.length + 1, SOrN: this.selectedCard.PatientType === "3" ? "S" : 'N', Name: data.Name, Specialisation: data.Specialisation, Quantity: 1,
                ServiceItemId: data.ServiceItemID, SpecialisationId: data.SpecialiseID, ServiceTypeId: data.ServiceTypeID, SpecimenId: data.SpecimenID,
                Remarks: data.Remarks == undefined ? "" : data.Remarks, IsFav: data.IsFav, Status: 0, disableDelete: false, TATRemarks: data.TATRemarks,
                ResultStatus: data.ResultStatus, ItemPrice: this.selectedCard.BillType === 'Insured' ? data.CompanyPrice : data.BasePrice,
                DEPARTMENTID: data.DepartmentID,
                DISID
              });
              if (data.SpecialiseID == '214' || data.SpecialiseID == '217' || data.SpecialiseID == '13') {
                const item = this.investigationsList.find((x: any) => x.ServiceItemId === data.ServiceItemID);
                this.openInvRemarksPopup(item);
              }
            }
          });
        }
      },
        (err) => {

        })
      this.showFavInvSelectedValidation = false;
      $("#modalProcedureFavorite").modal('hide');
      $("#modalFavorite").modal('hide');
      $("#lab_reports").modal('hide');
    }
    else {
      this.showFavInvSelectedValidation = true;
    }
  }

  clearFavProcedures() {
    this.selectedProcedures = [];
    this.FavouriteProcs = [];
    this.groupedDataProc = {};
    this.itemProcedures.forEach((element: any, index: any) => {
      this.FavouriteProcs.push({ ServiceID: element.ServiceID, ProcedureID: element.ProcedureID, ItemSpecialiseID: element.ItemSpecialiseID, group: element.ItemSpecialisation, name: element.ProcedureName })
    });
    this.FavouriteProcs.forEach((data) => {
      if (!this.groupedDataProc[data.group]) {
        this.groupedDataProc[data.group] = [];
      }
      this.groupedDataProc[data.group].push(data);
    });
    this.groupedDataProcArray = Object.keys(this.groupedDataProc).map((groupkey) => ({
      groupkey,
      values: this.groupedDataProc[groupkey],
    }));
  }
  clearFavInvestigations() {
    this.FavouriteInv = [];
    this.selectedInvestigations = [];
    this.groupedData = {};
    this.items.forEach((element: any, index: any) => {
      this.FavouriteInv.push({ ServiceID: element.ServiceID, ProcedureID: element.ProcedureID, ItemSpecialiseID: element.ItemSpecialiseID, group: element.ItemSpecialisation, name: element.ProcedureName })
    });
    this.FavouriteInv.forEach((data) => {
      if (!this.groupedData[data.group]) {
        this.groupedData[data.group] = [];
      }
      this.groupedData[data.group].push(data);
    });
    this.groupedDataArray = Object.keys(this.groupedData).map((groupkey) => ({
      groupkey,
      values: this.groupedData[groupkey],
    }));
  }
  clearFavMedications() {
    this.selectedMedications = [];
    this.FavouriteMedic = [];
    this.groupedDataMedicArray = []; this.groupedDataMedic = {};
    this.itemMedications.forEach((element: any, index: any) => {
      //this.FavouriteMedic.push({ GenericID: element.GenericID, ItemID: element.ItemID, DoseID: element.DoseID, LexicomItemID: element.LexicomItemID, group: element.GenericName, name: element.DrugName, Dose: element.Dose, AdmRoute: element.AdmRoute, StrengthDosage: element.StrengthDosage, NoStockColor: "0", StockColor: element.StockColor });
      this.FavouriteMedic.push({ group: element.GenericName, name: element.DrugName, ItemID: element.ItemID, DrugName: element.DrugName, StrengthDosage: element.StrengthDosage, Dose: element.Dose, DoseID: element.DoseID, DoseUOM: element.DoseUOM, AdmRouteID: element.AdmRouteID, AdmRoute: element.AdmRoute, GenericID: element.GenericID, GenericName: element.GenericName, FrequencyID: element.FrequencyID, Frequency: element.Frequency, DurationID: element.DurationID, Duration: element.Duration, DurationUOM: element.DurationUOM, IsGenericDouble: element.IsGenericDouble, LexicomItemID: element.LexicomItemID, IssueUOM: element.IssueUOM, IssueUOMID: element.IssueUOMID, totQty: element.totQty, IssuingtotQty: element.IssuingtotQty, NoStockColor: element.NoStockColor, StockColor: element.StockColor, Remarks: element.Remarks, IsMilk: element.IsMilk });
    });

    this.FavouriteMedic.forEach((data) => {
      if (!this.groupedDataMedic[data.group]) {
        this.groupedDataMedic[data.group] = [];
      }
      this.groupedDataMedic[data.group].push(data);
    });

    this.groupedDataMedicArray = Object.keys(this.groupedDataMedic).map((groupkey) => ({
      groupkey,
      values: this.groupedDataMedic[groupkey],
    }));

  }
  assignedProcedures() {
    if (this.selectedProcedures.length > 0) {
      this.selectedProcedures.forEach((element: any, index: any) => {
        // this.config.getInvestigationProcedureDetailsNH(element, 5, this.tariffId, this.patientType, this.hospitalId, this.doctorDetails[0].EmpId).subscribe((response) => {
        this.config.getInvestigationProcedureDetailsNHPR(element, 5, this.tariffId, this.patientType, this.hospitalId, this.doctorDetails[0].EmpId).subscribe((response) => {
          if (response.Status === "Success") {
            // if (response.InvestigationsAndProceduresList.length == 0) {
            //   this.actionableAlertmsg = "You are not authorized to request this Procedure as it falls outside the scope of your agreed privileges.!";
            //   $("#showActionableAlertsMsg").modal('show');
            //   return;
            // }
            this.addProceduresRow(response.InvestigationsAndProceduresList[0]);
          }
        },
          (err) => {

          })
      });
      this.showFavProcSelectedValidation = false;
      $("#modalProcedureFavorite").modal('hide');
    }
    else {
      this.showFavProcSelectedValidation = true;
    }
  }

  selectedFavMedication(selectedFav: any) {
    // if (!this.selectedMedications.includes(selectedFav.ItemID)) {
    //   this.selectedMedications.push(selectedFav);
    // } else {
    //   this.selectedMedications.splice(this.selectedMedications.indexOf(selectedFav.ItemID), 1);
    // }
    selectedFav.ischecked = !selectedFav.ischecked;
    if (selectedFav.ischecked) {
      this.config.FetchPrescriptionValidations(this.selectedPatientAdmissionId, selectedFav.ItemID, selectedFav.GenericID, selectedFav.DrugName.replace(/[^\w\s]/gi, ''),
        this.PatientId, this.ageValue, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalId, this.selectedCard.PatientType)
        .subscribe((valresponse: any) => {
          if (valresponse.FetchPrescValidationsDataaList.length === 0) {
            selectedFav.ischecked = true;
            if (this.selectedMedications.find((x: any) => x.ItemID === selectedFav.ItemID) == '' || this.selectedMedications.find((x: any) => x.ItemID === selectedFav.ItemID) == undefined) {
              this.selectedMedications.push(selectedFav);
            } else {
              this.selectedMedications.splice(this.selectedMedications.indexOf(selectedFav.ItemID), 1);
            }
          }
          else {
            selectedFav.ischecked = true;
            if (valresponse.FetchPrescValidationsDataaList[0].Buttons == "YESNO") {
              if (this.selectedMedications.find((x: any) => x.ItemID === selectedFav.ItemID) == '' || this.selectedMedications.find((x: any) => x.ItemID === selectedFav.ItemID) == undefined) {
                this.selectedMedications.push(selectedFav);
              } else {
                this.selectedMedications.splice(this.selectedMedications.indexOf(selectedFav.ItemID), 1);
              }
            }
            else {
              selectedFav.ischecked = false;
              this.prescriptionValidationMsg = valresponse.FetchPrescValidationsDataaList[0].strMessage;
              $("#prescriptionValidationMsgModal").modal('show');
            }
          }
        },
          (err) => {
          })
    }
  }

  isMedicationSelected(pl: any): boolean {
    //return this.selectedMedications.some((m: any) => m.ItemID === pl.ItemID);
    return pl.ischecked;
  }

  prescribeFavMedicationBtnClick() {
    if (this.selectedMedications.length > 0) {
      const url = this.us.getApiUrl(prescription.FetchItemSpecialisationValidation, {
        ItemIDs: this.selectedMedications.map((e: any) => e.ItemID).toString(),
        WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
        HospitalID: this.hospitalId
      });
      this.us.get(url).subscribe((response: any) => {
        if (response.Code === 200) {
          
          //Milk Products Prescription Limit
          
        //   this.validatedMilkMedItemsfav = this.selectedMedications.filter((item: any) => {

        //     if (!(item.IsMilk == 1 && this.selectedCard.PatientType == '1')) {
        //       return false;
        //     }

        //   const quantity = Number(item.totQty);
        //   const age = Number(this.ageFromDOB?.totalMonths); // age in months

        //   //Less than 6 months -- 10 bottles
        //   if (age < 6 && quantity > 10) {
        //     item.ValidationMessage = "Milk Product cannot be prescribed more than 10 bottles.";
        //     return true;
        //   }
        //   //6-12 months -- 8 bottles
        //   if (age >= 6 && age <= 8 && quantity > 8) {
        //     item.ValidationMessage = "Milk Product cannot be prescribed more than 8 bottles.";
        //     return true;
        //   }
        //   //More than one year - 6 bottles 
        //   if (age >= 12 && quantity > 6) {
        //     item.ValidationMessage = "Milk Product cannot be prescribed more than 6 bottles.";
        //     return true;
        //   }

        //   return false;
        // });

        if(this.validatedMilkMedItemsfav.length > 0) {
          const invalidIds = new Set(this.validatedMilkMedItemsfav.map((x: any) => x.ItemID));
          this.selectedMedications = this.selectedMedications.filter((item: any) => !invalidIds.has(item.ItemID));
          $("#validatedMilkMedItemsfavModal").modal('show');
        }

          if (response.FetchItemSpecialisationValidationDataList.length === 0) {
            this.prescribeFavMedication();
          } else {
            this.mismatchedMedications = [];
            this.selectedMedications.forEach((selected: any) => {
              const itemResponses = response.FetchItemSpecialisationValidationDataList.filter((a: any) => a.ItemID === selected.ItemID);

              if (itemResponses.length > 0) {
                const hasMatchingSpecialization = itemResponses.some(
                  (resp: any) => resp.SpecialiseID === this.doctorDetails[0].EmpSpecialisationId
                );

                if (!hasMatchingSpecialization) {
                  selected.specializations = itemResponses.map((b: any) => b.Specialisation).toString();
                  this.mismatchedMedications.push(selected);
                }
              }
            });
            if (this.mismatchedMedications.length > 0) {
              this.selectedMedications = this.selectedMedications.filter((selected: any) => {
                return !this.mismatchedMedications.some((mis: any) => mis.ItemID === selected.ItemID);
              });
              $('#medicationValidationModal').modal('show');
            }
            this.prescribeFavMedication();
          }
        }
      });
    }
  }

  prescribeFavMedication() {
    let subscribes: ObservableInput<any>[] = [];

    if (this.selectedMedications.length > 0) {
      this.selectedMedications.forEach((element: any, index: any) => {
        subscribes.push(this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, element.FrequencyID, 1, element.Dose, element.Duration, element.DurationID, 1, 0, element.ItemID,
          element.IssueUOMID, moment(new Date()).format('DD-MMM-YYYY'), this.patientType == "3" ? "1" : this.patientType, 0, this.hospitalId));

      });

      combineLatest(subscribes).subscribe(responses => {
        responses.forEach((response, index) => {
          if (response.Code === 200) {
            this.selectedMedications[index].Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
            this.selectedMedications[index].ScheduleEndDate = response.FetchItemQtyDataCDataaList[0].EDT;
          }
        });
        if (this.selectedMedications.length > 0) {
          this.selectedMedications.forEach((element: any, index: any) => {
            this.config.fetchItemForPrescriptions(this.patientType, this.selectedMedications[index].ItemID, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
              .subscribe((response: any) => {
                if (response.Code == 200) {
                  const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
                  this.selectedItemsList.push({
                    SlNo: this.selectedItemsList.length + 1,
                    Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
                    ClassSelected: false,
                    ItemId: this.selectedMedications[index].ItemID,
                    ItemCode: response.ItemDataList[0].ItemCode,
                    ItemName: response.ItemDataList[0].DisplayName,
                    StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
                    Strength: response.ItemDataList[0].Strength + " " + response.ItemDataList[0].StrengthUoM,
                    StrengthUoM: response.ItemDataList[0].StrengthUoM,
                    Dosage: this.selectedMedications[index].Dose + " " + response.ItemDataList[0].QTYUOM, //response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
                    DosageId: response.ItemDataList[0].QtyUomID,
                    AdmRouteId: this.selectedMedications[index].AdmRouteID,
                    Route: this.selectedMedications[index].AdmRoute,
                    StrengthDosage: this.selectedMedications[index].StrengthDosage,
                    NoStockColor: this.selectedMedications[index].NoStockColor,
                    StockColor: this.selectedMedications[index].StockColor,
                    FrequencyId: this.selectedMedications[index].FrequencyID,
                    Frequency: this.selectedMedications[index].Frequency,
                    ScheduleStartDate: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                    StartFrom: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                    DurationId: this.selectedMedications[index].DurationID,
                    Duration: this.selectedMedications[index].Duration + " " + this.selectedMedications[index].DurationUOM,
                    DurationValue: this.selectedMedications[index].Duration,
                    PresInstr: "",//item.PresInstr,
                    Quantity: this.selectedMedications[index].IssuingtotQty,
                    QuantityUOMId: response.DefaultUOMDataaList[0].IssueUOMID,//this.selectedMedications[index].QtyUOMID,
                    QuantityUOM: response.DefaultUOMDataaList[0].IssueUOM,//this.selectedMedications[index].QtyUOMID,
                    PresType: "",//item.PresType,
                    PRNType: this.selectedMedications[index].PRNMedicationReason,//item.PRNType,
                    GenericId: this.selectedMedications[index].GenericID,
                    DefaultUOMID: (this.patientType === '2' || this.patientType === '4') ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
                    medInstructionId: "",//item.medInstructionId,
                    PRNReason: "",//item.PRNReason,
                    IssueUoM: this.selectedMedications[index].IssueUOM,
                    IssueUOMID: this.selectedMedications[index].IssueUOMID,
                    IssueUOMValue: this.selectedMedications[index].IssuingtotQty,//response.ItemDataList[0].Quantity,
                    IssueTypeUOM: itempacking[0].FromUoMID,
                    PrescriptionID: '',
                    lexicomAlertIcon: '',
                    QOH: (this.patientType == "2" || this.patientType == "4") ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
                    IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
                    BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '' ? response.ItemDataList[0].Basesolution : '',
                    IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '' ? response.ItemDataList[0].IVFluidExpiry : '',
                    Price: response.ItemPriceDataList[0].MRP,
                    ScheduleEndDate: this.selectedMedications[index].ScheduleEndDate,
                    viewMore: this.selectedMedications[index].Remarks ? true : false,
                    IsAntibiotic: response.ItemDataList[0].IsAntibiotic,
                    IsAntibioticForm: response.ItemDataList[0].IsAntibioticForm,
                    Remarks: this.selectedMedications[index].Remarks,
                    PrescribedQty: response.ItemDataList[0].PrescribedQty
                  });
                  //this.LexicomAlert();
                }
                this.createGaugeChart();
              });
            this.showFavMedSelectedValidation = false;
            $("#modalMedicationFavorite").modal('hide');
          });
        }
        else {
          this.showFavMedSelectedValidation = true;
        }
      });
    }
  }
  getFetchFavouriteitemsDoctorWise(doctorID: any) {
    this.items = [];
    this.itemProcedures = []; this.selectedProcedures = [];
    this.itemMedications = []; this.selectedInvestigations = [];
    this.FavouriteInv = []; this.selectedMedications = [];
    this.FavouriteProcs = [];
    this.FavouriteMedic = [];

    this.config.getFetchFavouriteitemsDoctorWise(this.patientType, doctorID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? 0 : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
      if (response.Status === "Success") {

        this.items = response.DoctorFavInvestigationList;
        this.itemProcedures = response.DoctorFavProcedureList;
        this.itemMedications = response.DoctorFavMedicationList;

        this.groupedData = {};
        this.groupedDataProc = {};
        this.groupedDataMedic = {};
        this.groupedDataFilter = [];
        this.groupedDataMedicArray = [];

        this.items.forEach((element: any, index: any) => {
          this.FavouriteInv.push({ ServiceID: element.ServiceID, ProcedureID: element.ProcedureID, ItemSpecialiseID: element.ItemSpecialiseID, group: element.ItemSpecialisation, name: element.ProcedureName, isSelected: false })
        });

        this.itemProcedures.forEach((element: any, index: any) => {
          this.FavouriteProcs.push({ ServiceID: element.ServiceID, ProcedureID: element.ProcedureID, ItemSpecialiseID: element.ItemSpecialiseID, group: element.ItemSpecialisation, name: element.ProcedureName })
        });

        this.itemMedications.forEach((element: any, index: any) => {
          //this.FavouriteMedic.push({ GenericID: element.GenericID, ItemID: element.ItemID, DoseID: element.DoseID, LexicomItemID: element.LexicomItemID, group: element.GenericName, name: element.DrugName, Dose: element.Dose, AdmRoute: element.AdmRoute, StrengthDosage: element.StrengthDosage, NoStockColor: element.NoStockColor, StockColor: element.StockColor });
          this.FavouriteMedic.push({ group: element.GenericName, name: element.DrugName, ItemID: element.ItemID, DrugName: element.DrugName, StrengthDosage: element.StrengthDosage, Dose: element.Dose, DoseID: element.DoseID, DoseUOM: element.DoseUOM, AdmRouteID: element.AdmRouteID, AdmRoute: element.AdmRoute, GenericID: element.GenericID, GenericName: element.GenericName, FrequencyID: element.FrequencyID, Frequency: element.Frequency, DurationID: element.DurationID, Duration: element.Duration, DurationUOM: element.DurationUOM, IsGenericDouble: element.IsGenericDouble, LexicomItemID: element.LexicomItemID, IssueUOM: element.IssueUOM, IssueUOMID: element.IssueUOMID, totQty: element.totQty, IssuingtotQty: element.IssuingtotQty, NoStockColor: element.NoStockColor, StockColor: element.StockColor, Remarks: element.Remarks, IsMilk: element.IsMilk, });
        });

        this.FavouriteInv.forEach((data) => {
          if (!this.groupedData[data.group]) {
            this.groupedData[data.group] = [];
          }
          this.groupedData[data.group].push(data);
        });

        this.FavouriteProcs.forEach((data) => {
          if (!this.groupedDataProc[data.group]) {
            this.groupedDataProc[data.group] = [];
          }
          this.groupedDataProc[data.group].push(data);
        });
        this.FavouriteMedic.forEach((data) => {
          if (!this.groupedDataMedic[data.group]) {
            this.groupedDataMedic[data.group] = [];
          }
          this.groupedDataMedic[data.group].push(data);
        });

        this.convertToArray();
      }
    },
      (err) => {
        console.log(err)
      })
  }

  private convertToArray(): void {
    this.groupedDataArray = Object.keys(this.groupedData).map((groupkey) => ({
      groupkey,
      values: this.groupedData[groupkey],
    }));

    this.groupedDataProcArray = Object.keys(this.groupedDataProc).map((groupkey) => ({
      groupkey,
      values: this.groupedDataProc[groupkey],
    }));
    this.groupedDataMedicArray = Object.keys(this.groupedDataMedic).map((groupkey) => ({
      groupkey,
      values: this.groupedDataMedic[groupkey],
    }));
    this.groupedDataFilter = this.groupedDataArray;
    this.groupedDataPFilter = this.groupedDataProcArray;
    this.groupedMedicationFilter = this.groupedDataMedicArray;
  }
  filterGroupedProcData(searchTerm: string): void {

    if (!searchTerm) {
      this.groupedDataProcArray = this.groupedDataPFilter; // No filter, return the original data
    }

    this.groupedDataProcArray = this.groupedDataPFilter.map(group => ({
      groupkey: group.groupkey,
      values: group.values.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
      items: group.values.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    })).filter(group => group.items.length > 0);
  }

  filterGroupedData(searchTerm: string): void {

    if (!searchTerm) {
      this.groupedDataArray = this.groupedDataFilter; // No filter, return the original data
    }

    this.groupedDataArray = this.groupedDataFilter.map(group => ({
      groupkey: group.groupkey,
      values: group.values.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
      items: group.values.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    })).filter(group => group.items.length > 0);
  }

  getInvestigationProcedureDetails(Name: any, Param1: any) {
    this.config.getInvestigationProcedureDetailsNH(Name.trim(), 3, this.tariffId, this.patientType, this.hospitalId, this.doctorDetails[0].EmpId).subscribe((response) => {
      if (response.Status === "Success") {
        if (Param1 === "3") {
          this.searchData = [];
          this.investigationData = response.InvestigationsAndProceduresList;
          response.InvestigationsAndProceduresList.forEach((element: any, index: any) => {
            let d = new InvestigationProcedures(element.Name);
            this.searchData.push(d);
          });
          // if (this.searchData.length == 0) {
          //   this.actionableAlertmsg = "You are not authorized to request this Procedure as it falls outside the scope of your agreed privileges.!";
          //   $("#showActionableAlertsMsg").modal('show');
          //   return;
          // }
          if (this.searchData) {
            this.investigationresults$.next(this.searchData);
            // this.investigations = this.completerService.local(this.investigationresults$, 'name', 'name');
          }
        }
        else if (Param1 === 5) {
          this.proceduresData = response.InvestigationsAndProceduresList;
          response.InvestigationsAndProceduresList.forEach((element: any, index: any) => {
            let d = new InvestigationProcedures(element.Name);
            this.searchProceduresData.push(d);
          });
          if (this.searchProceduresData) {
            this.procedureresults$.next(this.searchProceduresData);
          }

        }
      }
    },
      (err) => {

      })
  }
  getProcedureDetails(Name: any, Param1: any) {
    this.config.getInvestigationProcedureDetailsNH(Name.trim(), 5, this.tariffId, this.patientType, this.hospitalId, this.doctorDetails[0].EmpId).subscribe((response) => {
      if (response.Status === "Success") {
        if (Param1 === "5") {
          this.searchProceduresData = [];
          this.proceduresData = response.InvestigationsAndProceduresList;
          response.InvestigationsAndProceduresList.forEach((element: any, index: any) => {
            let d = new InvestigationProcedures(element.Name);
            this.searchProceduresData.push(d);
          });
          // if (this.searchProceduresData.length == 0) {
          //   this.actionableAlertmsg = "You are not authorized to request this Procedure as it falls outside the scope of your agreed privileges.!";
          //   $("#showActionableAlertsMsg").modal('show');
          //   return;
          // }
          if (this.searchProceduresData) {
            this.procedureresults$.next(this.searchProceduresData);
          }
        }
      }
    },
      (err) => {

      })
  }
  initializeSearchInvProcListener() {
    this.searchInputInvProc$
      .pipe(
        debounceTime(this.timeout)
      )
      .subscribe(filter => {
        if (filter.length > 2) {
          this.getInvestigationProcedureDetails(filter, '3');
        }
        else {
          this.investigationData = []; this.proceduresData = [];
        }
      });
  }
  initializeSearchProcListener() {
    this.searchInputProc$
      .pipe(
        debounceTime(this.timeout)
      )
      .subscribe(filter => {
        if (filter.length > 2) {
          this.getProcedureDetails(filter, '5');
        }
        else {
          this.investigationData = []; this.proceduresData = [];
        }
      });
  }

  onInvestigationMouseDown(event: any) {
    if (event.target.value.length === 0) {
      this.searchInputInvProc$.next('%%%');
    }
  }

  investigationDatasource(event: any) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      const inputValue = event.target.value;
      this.searchInputInvProc$.next(inputValue);
    }
  }

  onProceduresMouseDown(event: any) {
    if (event.target.value.length === 0) {
      this.searchInputProc$.next('%%%');
    }
  }

  procedureDatasource(event: any) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      const inputValue = event.target.value;
      this.searchInputProc$.next(inputValue);
    }
    // if (event.target.value.length > 2) {
    //   this.getInvestigationProcedureDetails(event.target.value, 5);
    // }
  }

  onItemSelect(selected: any): void {
    // if (selected.IsDocMap == 0) {
    //   this.actionableAlertmsg = "You are not authorized to request this Procedure as it falls outside the scope of your agreed privileges.!";
    //   $("#showActionableAlertsMsg").modal('show');
    //   return;
    // }
    if (selected) {
      if (this.patientType == "3") {
        this.config.CheckValidPrescribedItems(this.PatientId, this.selectedPatientAdmissionId, 3, selected.ServiceItemID, this.facility.FacilityID == undefined ? 0 : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
          if (response.Code === 200 && response.CheckValidPrescribedItemsDataList.length > 0) {
            this.errorMessages = response.CheckValidPrescribedItemsDataList[0].ItemName + " already prescribed by " + response.CheckValidPrescribedItemsDataList[0].DoctorName + " on " + response.CheckValidPrescribedItemsDataList[0].CreateDate + ". Do you wish to continue ?";
            this.selectedService = selected;
            $("#activeInvYesNo").modal('show');
          }
          else {
            //if (this.checkProcedureCanPrescribe(selected) === true) {
            this.continuePrescribingInvService(selected);
            //}
          }
        },
          (err) => {
          })
      }
      else if (this.patientType === '1') {
        const restrictionServiceItems = this.doctorDetails[0].RestrictionServiceItems.split(',').map((item: string) => {
          const splitItems = item.split('-');
          return {
            ServiceItemID: splitItems[0],
            Duration: Number(splitItems[1]),
            DurationType: splitItems[2]
          };
        });
        const restrictionItem = restrictionServiceItems.find((item: any) => item.ServiceItemID === selected.ServiceItemID);
        if (restrictionItem) {
          const url = this.us.getApiUrl(prescription.FetchPatientPrescriptionDetails, {
            PatientID: this.PatientId,
            ItemID: selected.ServiceItemID,
            WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
            HospitalID: this.hospitalId
          });
          this.us.get(url).subscribe((res: any) => {
            if (res.Code === 200 && res.FetchPatientPrescriptionDetailsDataList.length > 0) {
              // Patient has previous prescriptions for the restricted item
              const lastPrescription = res.FetchPatientPrescriptionDetailsDataList[0];
              const lastPrescribedDate = new Date(lastPrescription.PrescriptionDate);
              const currentDate = new Date();
              const nextAllowedDate = new Date(lastPrescribedDate);
              switch (restrictionItem.DurationType) {
                case 'Months':
                  nextAllowedDate.setMonth(nextAllowedDate.getMonth() + restrictionItem.Duration);
                  break;
              }
              if (currentDate < nextAllowedDate) {
                this.isSelctedFromFav = false;
                this.selectedService = selected;
                this.errorMessages = `The item ${selected.Name} is already prescribed by ${lastPrescription.DoctorName} on ${lastPrescription.PrescriptionDate}. You can prescribe it again after ${this.formatDate(nextAllowedDate)}. Do you wish to continue ?`;
                $('#restrictedItemsYesNo').modal('show');
              } else {
                this.continuePrescribingInvService(selected);
              }
            } else {
              this.continuePrescribingInvService(selected);
            }
          });
        } else {
          this.continuePrescribingInvService(selected);
        }
      } else {
        this.continuePrescribingInvService(selected);
      }
    }
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  continuePrescribingInvService(selected: any) {
    var data = this.investigationData.filter((i: any) => i.Name == selected.Name);
    //Below code - To push specific lab test specimen as selected by user if Lab test is having multiple specimens
    if (data) {
      let inv = data[0];
      if (selected.ServiceID == '3' && selected.IsResult == '4') {
        const invData = data.filter((x: any) => x.ServiceItemID == selected.ServiceItemID && x.SpecimenID == selected.SpecimenID);
        if (invData.length > 0) {
          inv = invData[0];
        }
      }
      this.changedInvestigationsList.push(inv);
      this.addInvestigationsRow(inv);
    }
    this.investigationData = [];
    this.investigationsForm.setValue({
      InvestigationId: '',
      InvestigationName: '',
      Remarks: ['']
    });
  }

  clearSelectedService() {
    this.selectedService = [];
    $("procSmartSearch").val('');
    $("#invprocSmartSearch").val('');
  }

  onProcedureItemSelect(selected: any): void {
    // if (selected.IsDocMap == 0) {
    //   this.actionableAlertmsg = "You are not authorized to request this Procedure as it falls outside the scope of your agreed privileges.!";
    //   $("#showActionableAlertsMsg").modal('show');
    //   return;
    // }
    if (selected) {
      if (this.patientType == "3") {
        this.config.CheckValidPrescribedItems(this.PatientId, this.selectedPatientAdmissionId, 3, selected.ServiceItemID, this.facility.FacilityID == undefined ? 0 : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
          if (response.Code === 200 && response.CheckValidPrescribedItemsDataList.length > 0) {
            this.errorMessages = "Service " + response.CheckValidPrescribedItemsDataList[0].ItemName + " already prescribed. Do you wish to continue ?";
            this.selectedService = selected;
            $("#activeProcYesNo").modal('show');
          }
          else {
            this.continuePrescribingProcService(selected);
          }
        },
          (err) => {
          })
      }
      else {
        this.continuePrescribingProcService(selected);
      }
    }
  }

  continuePrescribingProcService(selected: any) {
    var data = this.proceduresData.filter((i: any) => i.Name == selected.Name);
    if (data) {
      this.addProceduresRow(data[0]);
    }
    if (this.patientType == '2' && this.selectedCard.BillType == 'Insured' && this.selectedCard.CompanyID) {
      this.openProvRemarksPopup(data[0]);
    }
    this.proceduresData = [];
    this.proceduresForm.setValue({
      ProcedureId: [''],
      ProcedureName: '',
      Quantity: [''],
      Remarks: ['']
    });
  }

  FetchMedicationDemographics() {
    this.config.fetchMedicationDemographics("2,65,77,826", this.doctorDetails[0].EmpId, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.AdmRoutesListMaster = response.MedicationDemographicsAdministrationDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          this.AdmRoutesList = response.MedicationDemographicsAdministrationDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          this.filteredAdmRoutesList = cloneDeep(this.AdmRoutesListMaster);
          this.searchRouteTerm = '';
          // this.durationList = response.MedicationDemographicsDurationDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          // this.durationList.splice(3, 1);
          this.durationList = [];
          this.durationList.push({ "Type": "2", "Id": "3", "Names": "Days", "Names2L": "يوم" });
          this.durationList.push({ "Type": "2", "Id": "7", "Names": "Week(s)", "Names2L": "يوم" });
          this.durationList.push({ "Type": "2", "Id": "2", "Names": "Months", "Names2L": "يوم" });
          this.durationList.splice(2, 1); this.durationList.splice(3, 1);
          this.frequenciesList = response.MedicationDemographicsFrequencyDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          this.medicationReasonsList = response.MedicationDemographicsMedicationReasonDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
        }
      },
        (err) => {

        })

  }

  filterRouteList() {
    if (this.searchRouteTerm.trim()) {
      this.filteredAdmRoutesList = this.AdmRoutesList.filter((route: any) => {
        const name = route.Names || route.RouteName;
        return name.toLowerCase().includes(this.searchRouteTerm.toLowerCase())
      }
      );
    } else {
      this.filteredAdmRoutesList = cloneDeep(this.AdmRoutesList);
    }
  }

  filterFrequencyList() {
    if (this.searchFrequencyTerm.trim()) {
      this.filteredDrugFrequenciesList = this.drugFrequenciesList.filter((freq: any) =>
        freq.Frequency.toLowerCase().includes(this.searchFrequencyTerm.toLowerCase())
      );
    } else {
      this.filteredDrugFrequenciesList = cloneDeep(this.drugFrequenciesList);
    }
  }
  FetchDrugFrequencies() {
    this.config.fetchDrugFrequenciesNew(this.patientType, this.doctorDetails[0].EmpId, "0", this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.drugFrequenciesList = response.DrugFrequenciesDataList.sort((a: any, b: any) => a.Frequency.localeCompare(b.Frequency));
          this.filteredDrugFrequenciesList = cloneDeep(this.drugFrequenciesList);
        }
      },
        (err) => {

        })
  }
  FetchMedicationInstructions() {
    this.config.fetchMedicationInstructions(this.doctorDetails[0].EmpId, "blocked=0", "0", this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.medicationInstructions = response.AdminMastersInstructionsDataList.sort((a: any, b: any) => a.name.localeCompare(b.name));
        }
      },
        (err) => {

        })
  }

  initializeSearchListener() {
    this.searchInput$
      .pipe(
        debounceTime(0)
      )
      .subscribe(filter => {
        if (filter.length >= 3) {

          //this.config.fetchItemDetails(1, 500, 3, filter, this.doctorDetails[0].EmpId, "0", this.hospitalId, this.doctorDetails[0].EmpId)
          this.config.FetchItemDetailsNIV(filter, "0", this.hospitalId, this.doctorDetails[0].EmpId, this.GenericBrand, this.isIvFluid ? 1 : 0, this.patientType)
            .subscribe((response: any) => {
              if (response.Code == 200) {
                this.listOfItems = response.ItemDetailsDataList;
              }
            },
              (err) => {

              })
        }

        else {
          this.listOfItems = [];
        }
      });
  }

  searchItem(event: any) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      const inputValue = event.target.value;
      this.searchInput$.next(inputValue);
    }
  }
  onRouteChange(event: any) {
    this.medicationsForm.get('AdmRoute')?.setValue(event.target.options[event.target.options.selectedIndex].text);
  }
  onFrequencyChange(event: any) {
    this.medicationsForm.get('Frequency')?.setValue(event.target.options[event.target.options.selectedIndex].text);
    this.selectedMedDrugFreqScheduleTime = this.drugFrequenciesList.find((x: any) => x.FrequencyID == event.target.value);
    this.CalculateQuantity();
  }
  onDurationChange(event: any) {
    this.medicationsForm.get('Duration')?.setValue(event.target.options[event.target.options.selectedIndex].text);
    this.CalculateQuantity();
  }
  onPresInstrChange(event: any) {
    this.medicationsForm.get('PresInstr')?.setValue(event.target.options[event.target.options.selectedIndex].text);
  }
  onPresTypeChange(event: any) {
    this.medicationsForm.get('PresType')?.setValue(event.target.options[event.target.options.selectedIndex].text);
    if (event.target.value == 1) {
      this.isPRN = true;
      this.medicationsForm.patchValue({
        IsPRN: true,

      })
    }
    else {
      this.isPRN = false;
      this.medicationsForm.patchValue({
        IsPRN: false,

      })
    }
  }
  onPRNTypeChange(event: any) {
    this.medicationsForm.get('PRNType')?.setValue(event.target.options[event.target.options.selectedIndex].text);
    this.medicationsForm.get('PRNReason')?.setValue(event.target.options[event.target.options.selectedIndex].text);
  }

  allowMedicationSelected() {
    $("#medicationActionableAlerts").modal('hide');
    this.config.fetchItemForPrescriptions(this.patientType, this.tempSelectedMedicationList.ItemID, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.itemSelected = "true";
          this.AdmRoutesList = response.ItemRouteDataList;
          this.filteredAdmRoutesList = cloneDeep(this.AdmRoutesList);
          this.searchRouteTerm = '';
          const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
          this.medicationsForm.patchValue({
            ItemId: this.tempSelectedMedicationList.ItemID,
            ItemCode: this.tempSelectedMedicationList.ItemCode,
            ItemName: response.ItemDataList[0].DisplayName,
            DosageId: response.ItemDataList[0].QtyUomID,
            Strength: response.ItemDataList[0].Strength,
            StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
            StrengthUoM: response.ItemDataList[0].StrengthUoM,
            IssueUOMValue: response.ItemDataList[0].Quantity,
            IssueUoM: response.ItemDataList[0].QTYUOM,
            IssueUOMID: response.ItemDataList[0].IssueUOMID,
            ScheduleStartDate: new Date(),
            DefaultUOMID: (this.patientType === '2' || this.patientType === '4') ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
            IssueTypeUOM: itempacking[0].FromUoMID,
            QuantityUOMId: itempacking[0].FromUoMID,
            QuantityUOM: itempacking[0].FromUoM,
            GenericId: response.ItemGenericsDataList[0].GenericID,
            QOH: (this.patientType === '2' || this.patientType === '4') ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
            IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
            BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '' ? response.ItemDataList[0].Basesolution : '',
            IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '' ? response.ItemDataList[0].IVFluidExpiry : '',
            Remarks: '',
            Price: response.ItemPriceDataList[0].MRP
          })
          $('#StrengthUoM').html(response.ItemDataList[0].StrengthUoM);
          $('#IssueUoM').html(response.ItemDataList[0].QTYUOM);
          this.listOfItems = [];
        }
      },
        (err) => {
        })
  }
  onItemSelected(item: any) {
    // if (item.IsDocMap == 0) {
    //   this.actionableAlertmsg = "You are not authorized to request this Procedure as it falls outside the scope of your agreed privileges.!";
    //   $("#showActionableAlertsMsg").modal('show');
    //   return;
    // }

    var itemId = item.ItemID;
    this.config.FetchServiceActionableAlerts(this.selectedPatientAdmissionId, this.ageValue, itemId).subscribe((response) => {
      if (response.Status === "Success" && response.ActionItemDataList.length > 0) {
        this.listOfItems = [];
        if (response.ActionItemDataList[0].PopupMessage == true) {
          this.actionableAlert = response.ActionItemDataList[0].Justifications;
          $("#medicationActionableAlerts").modal('show');
          this.tempSelectedMedicationList = item;
        }
        else if (response.ActionItemDataList[0].PopupMessage == false && response.ActionItemDataList[0].strMessage != "" && response.ActionItemDataList[0].strMessage != null) {
          this.actionableAlertmsg = response.ActionItemDataList[0].strMessage;
          $("#showActionableAlertsMsg").modal('show');
        }
        else {
          this.config.fetchItemForPrescriptions(this.patientType, itemId, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
            .subscribe((response: any) => {
              if (response.Code == 200) {
                this.config.FetchPrescriptionValidations(this.selectedPatientAdmissionId, itemId, response.ItemGenericsDataList.length > 0 ? response.ItemGenericsDataList[0].GenericID : 0, response.ItemDataList[0].DisplayName.replace(/[^\w\s]/gi, ''), this.PatientId, this.ageValue, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalId, this.selectedCard.PatientType)
                  .subscribe((valresponse: any) => {
                    const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
                    if (valresponse.FetchPrescValidationsDataaList.length === 0 || this.DischargeMedication) {
                      this.itemSelected = "true";
                      this.selectedSearchedMedItem = response.ItemDataList[0];
                      this.AdmRoutesList = response.ItemRouteDataList;
                      this.filteredAdmRoutesList = cloneDeep(this.AdmRoutesList);
                      this.searchRouteTerm = '';
                      this.medicationsForm.patchValue({
                        ItemId: itemId,
                        ItemCode: response.ItemDataList[0].ItemCode,
                        ItemName: response.ItemDataList[0].DisplayName,
                        DosageId: response.ItemDataList[0].QtyUomID,
                        Dosage: response.ItemDataList[0].QTYUOM,
                        Strength: response.ItemDataList[0].Strength,
                        StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
                        StrengthUoM: response.ItemDataList[0].StrengthUoM,
                        IssueUOMValue: response.ItemDataList[0].Quantity,
                        IssueUoM: response.DefaultUOMDataaList[0].IssueUOM,
                        IssueUOMID: response.DefaultUOMDataaList[0].IssueUOMID,
                        ScheduleStartDate: new Date(),
                        DefaultUOMID: (this.patientType === '2' || this.patientType === '4') ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
                        IssueTypeUOM: itempacking[0].FromUoMID,
                        QuantityUOMId: response.DefaultUOMDataaList[0].IssueUOMID,
                        QuantityUOM: response.DefaultUOMDataaList[0].IssueUOM,
                        GenericId: response.ItemGenericsDataList.length > 0 ? response.ItemGenericsDataList[0].GenericID : 0,//response.ItemGenericsDataList[0].GenericID,
                        DurationValue: "1",
                        DurationId: "3",
                        Duration: "Days",
                        AdmRouteId: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteID : "",
                        AdmRoute: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteName : "",
                        IsFav: response.ItemDataList[0].IsFav,
                        QOH: (this.patientType === '2' || this.patientType === '4') ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
                        FrequencyId: this.patientType == "3" ? 41 : '',
                        Frequency: "STAT",
                        IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
                        BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '' ? response.ItemDataList[0].Basesolution : '',
                        IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '' ? response.ItemDataList[0].IVFluidExpiry : '',
                        Remarks: '',
                        Price: response.ItemPriceDataList.length > 0 ? response.ItemPriceDataList[0].MRP : 0,//response.ItemPriceDataList[0].MRP
                        IsAntibiotic: response.ItemDataList[0].IsAntibiotic,
                        IsAntibioticForm: response.ItemDataList[0].IsAntibioticForm,
                        PrescribedQty: response.ItemDataList[0].PrescribedQty,
                        IsHighValueDrug: response.ItemDataList[0].IsHighValueDrug,
                        IsMilk: response.ItemDataList[0].IsMilk
                      })
                      $('#StrengthUoM').html(response.ItemDataList[0].StrengthUoM);
                      $('#IssueUoM').html(response.DefaultUOMDataaList[0].IssueUOM);
                      $('#QuantityUOM').html(response.DefaultUOMDataaList[0].IssueUOM);
                      $('#Dosage').html(response.ItemDataList[0].QTYUOM);
                      this.CalculateQuantity();
                      // if (Number(this.medicationsForm.get('QOH')?.value) === 0) {
                      //   this.prescriptionValidationMsg = this.medicationsForm.get('ItemName')?.value + " does not have enough quantity in Pharmacy. Please select a substitute.";
                      //   $("#NoQohMsgModal").modal('show');
                      // }
                      this.listOfItems = [];
                    }
                    else {
                      if (valresponse.FetchPrescValidationsDataaList[0].Buttons == "YESNO") {
                        this.tempprescriptionSelected = response;
                        this.prescriptionValidationMsg = valresponse.FetchPrescValidationsDataaList[0].strMessage;
                        this.prescriptionValidationMsgEnddate = valresponse.FetchPrescValidationsDataaList[0].EndDate;
                        $("#prescriptionValidationMsgModalYesNo").modal('show');
                      }
                      else {
                        this.prescriptionValidationMsg = valresponse.FetchPrescValidationsDataaList[0].strMessage;
                        $("#prescriptionValidationMsgModal").modal('show');
                      }
                    }
                  },
                    (err) => {
                    })
              }
            },
              (err) => {
              })
        }
      }
      else {

        this.config.fetchItemForPrescriptions(this.patientType, itemId, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.config.FetchPrescriptionValidations(this.selectedPatientAdmissionId, itemId, response.ItemGenericsDataList[0].GenericID, response.ItemDataList[0].DisplayName, this.PatientId, this.ageValue, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalId, this.patientType)
                .subscribe((valresponse: any) => {
                  if (valresponse.FetchPrescValidationsDataaList.length === 0) {
                    this.itemSelected = "true";
                    this.AdmRoutesList = response.ItemRouteDataList;
                    this.filteredAdmRoutesList = cloneDeep(this.AdmRoutesList);
                    this.searchRouteTerm = '';
                    const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
                    this.medicationsForm.patchValue({
                      ItemId: itemId,
                      ItemCode: response.ItemDataList[0].ItemCode,
                      ItemName: response.ItemDataList[0].DisplayName,
                      DosageId: response.ItemDataList[0].QtyUomID,
                      Dosage: response.ItemDataList[0].QTYUOM,
                      Strength: response.ItemDataList[0].Strength,
                      StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
                      StrengthUoM: response.ItemDataList[0].StrengthUoM,
                      IssueUOMValue: response.ItemDataList[0].Quantity,
                      IssueUoM: response.DefaultUOMDataaList[0].IssueUOM,
                      IssueUOMID: response.DefaultUOMDataaList[0].IssueUOMID,
                      ScheduleStartDate: new Date(),
                      DefaultUOMID: (this.patientType === '2' || this.patientType === '4') ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
                      IssueTypeUOM: itempacking[0].FromUoMID,
                      QuantityUOMId: response.DefaultUOMDataaList[0].IssueUOMID,
                      QuantityUOM: response.DefaultUOMDataaList[0].IssueUOM,
                      GenericId: response.ItemGenericsDataList[0].GenericID,
                      DurationId: "3",
                      Duration: "Days",
                      AdmRouteId: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteID : "",
                      AdmRoute: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteName : "",
                      IsFav: response.ItemDataList[0].IsFav,
                      QOH: (this.patientType === '2' || this.patientType === '4') ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
                      IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
                      BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '' ? response.ItemDataList[0].Basesolution : '',
                      IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '' ? response.ItemDataList[0].IVFluidExpiry : '',
                      Remarks: '',
                      Price: response.ItemPriceDataList[0].MRP,
                      IsAntibiotic: response.ItemDataList[0].IsAntibiotic,
                      IsAntibioticForm: response.ItemDataList[0].IsAntibioticForm,
                      PrescribedQty: response.ItemDataList[0].PrescribedQty,
                      IsHighValueDrug: response.ItemDataList[0].IsHighValueDrug
                    })
                    $('#StrengthUoM').html(response.ItemDataList[0].StrengthUoM);
                    $('#IssueUoM').html(response.DefaultUOMDataaList[0].IssueUOM);
                    $('#QuantityUOM').html(response.DefaultUOMDataaList[0].IssueUOM);
                    $('#Dosage').html(response.ItemDataList[0].QTYUOM);
                    this.listOfItems = [];
                  }
                  else {

                    $("#prescriptionValidationMsgModal").modal('show');
                    this.prescriptionValidationMsg = valresponse.FetchPrescValidationsDataaList[0].strMessage;
                    this.ClearPrescriptionItems();
                  }
                },
                  (err) => {
                  })
            }
          },
            (err) => {
            })
      }
    },
      (err) => {

      })

  }
  public findInvalidControls() {
    const invalid = [];
    const controls = this.medicationsForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }
  allowGenericItemPrescribe() {
    if (this.medicationsForm.valid) {
      $('#StrengthUoM').html('');
      $('#IssueUoM').html('');
      if (this.medicationsForm.get('ItemId')?.value != '') {
        this.selectedItemsList.push({
          SlNo: this.selectedItemsList.length + 1,
          Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
          ClassSelected: false,
          ItemId: this.medicationsForm.get('ItemId')?.value,
          ItemCode: this.medicationsForm.get('ItemCode')?.value,
          ItemName: this.medicationsForm.get('ItemName')?.value,
          Strength: this.medicationsForm.get('Strength')?.value + " " + this.medicationsForm.get('StrengthUoM')?.value,
          StrengthUoMID: this.medicationsForm.get('StrengthUoMID')?.value,
          Dosage: this.medicationsForm.get('IssueUOMValue')?.value + " " + this.medicationsForm.get('Dosage')?.value,
          DosageId: this.medicationsForm.get('DosageId')?.value,
          AdmRouteId: this.medicationsForm.get('AdmRouteId')?.value,
          Route: this.medicationsForm.get('AdmRoute')?.value,
          FrequencyId: this.medicationsForm.get('FrequencyId')?.value,
          Frequency: this.medicationsForm.get('Frequency')?.value,
          ScheduleStartDate: this.datepipe.transform(this.medicationsForm.value['ScheduleStartDate'], "dd-MMM-yyyy")?.toString(),
          StartFrom: this.medicationsForm.get('StartFrom')?.value,
          DurationId: this.medicationsForm.get('DurationId')?.value,
          Duration: this.medicationsForm.get('DurationValue')?.value + " " + this.medicationsForm.get('Duration')?.value,
          DurationValue: this.medicationsForm.get('DurationValue')?.value,
          PresInstr: this.medicationsForm.get('PresInstr')?.value,
          Quantity: this.medicationsForm.get('Quantity')?.value,
          QuantityUOMId: this.medicationsForm.get('QuantityUOMId')?.value,
          PresType: this.medicationsForm.get('PresType')?.value,
          PRNType: this.medicationsForm.get('PRNType')?.value,
          GenericId: this.medicationsForm.get('GenericId')?.value,
          DefaultUOMID: this.medicationsForm.get('DefaultUOMID')?.value,
          medInstructionId: this.medicationsForm.get('medInstructionId')?.value,
          PRNReason: this.medicationsForm.get('PRNReason')?.value,
          Remarks: this.medicationsForm.get('Remarks')?.value,
          IssueUoM: this.medicationsForm.get('IssueUoM')?.value,
          ScheduleEndDate: this.medicationsForm.get('ScheduleEndDate')?.value,
          ScheduleTime: this.medicationsForm.get('ScheduleTime')?.value,
          PrescriptionID: '',
          lexicomAlertIcon: '',
          CustomizedDosage: this.medicationsForm.get('CustomizedDosage')?.value,
          QOH: this.medicationsForm.get('QOH')?.value,
          IssueUOMValue: this.medicationsForm.get('IssueUOMValue')?.value,
          IVFluidStorageCondition: this.medicationsForm.get('IVFluidStorageCondition')?.value,
          BaseSolutionID: this.medicationsForm.get('BaseSolutionID')?.value,
          IVFluidExpiry: this.medicationsForm.get('IVFluidExpiry')?.value,
          Price: this.medicationsForm.get('Price')?.value,
          DiagnosisId: this.medicationsForm.get('DiagnosisId')?.value,
          DISID: this.medicationsForm.get('DiagnosisId')?.value,
          DiagnosisName: this.medicationsForm.get('DiagnosisName')?.value,
          DiagnosisCode: this.medicationsForm.get('DiagnosisCode')?.value,
          viewMore: this.medicationsForm.get('Remarks')?.value === '' ? false : true,
          IsAntibiotic: this.medicationsForm.get('IsAntibiotic')?.value,
          IsAntibioticForm: this.medicationsForm.get('IsAntibioticForm')?.value,
          PrescribedQty: this.medicationsForm.get('PrescribedQty')?.value
        });
        this.createGaugeChart();
        this.isMedicationFormSubmitted = false;
        if (this.medicationsForm.get('Remarks')?.value != '' && this.medicationsForm.get('Remarks')?.value != undefined) {
          const med = this.selectedItemsList.find((x: any) => x.ItemId === this.medicationsForm.get('ItemId')?.value)
          this.maximizeSelectedDrugItems(med);
        }
      }
      this.ClearMedicationForm();
    }
  }
  AddPrescriptionItemsToTable() {
    this.isMedicationFormSubmitted = true;
    var findInvalidControls = this.findInvalidControls();
    if (this.medicationsForm.valid) {
      let find; let findPrescQty;
      if (this.selectedItemsList.length > 0) {
        find = this.selectedItemsList.filter((x: any) => x?.ItemId === this.medicationsForm.get('ItemId')?.value || x.GenericId == this.medicationsForm.get('GenericId')?.value);
        findPrescQty = this.selectedItemsList.filter((x: any) => x?.ItemId === "162156" && x.GenericId == this.medicationsForm.get('Quantity')?.value);
      }
      if (find != undefined && find.length > 0) {
        // $("#itemAlreadySelected").modal('show');
        this.prescriptionValidationMsg = "Drug/Generic Already Prescribed. Do you wish to continue.";
        $("#sameGenericMsg").modal('show');
        return;
      }

      //Milk Products Prescription Limit
      // if (this.medicationsForm.get('IsMilk')?.value == 1 && this.selectedCard?.PatientType == '1') {
      //   //Less than 6 months -- 10 bottles
      //   if (Number(this.ageFromDOB?.totalMonths) < 6 &&  Number(this.medicationsForm.get('Quantity')?.value) > 10) {
      //     this.prescriptionValidationMsg = this.medicationsForm.get('ItemName')?.value + " - Milk Product cannot be prescribed more than 10 bottles. Do you still want to proceed?";
      //     $("#sameGenericMsg").modal('show');
      //     return;
      //   }
      //   //6-12 months -- 8 bottles
      //   if ((Number(this.ageFromDOB?.totalMonths) >= 6 && Number(this.ageFromDOB?.totalMonths) <= 8) &&  Number(this.medicationsForm.get('Quantity')?.value) > 8) {
      //     this.prescriptionValidationMsg = this.medicationsForm.get('ItemName')?.value + " - Milk Product cannot be prescribed more than 8 bottles. Do you still want to proceed?";
      //     $("#sameGenericMsg").modal('show');
      //     return;
      //   }
      //   //More than one year - 6 bottles 
      //   if (Number(this.ageFromDOB?.totalMonths) >= 12 &&  Number(this.medicationsForm.get('Quantity')?.value) > 6) {
      //     this.prescriptionValidationMsg = this.medicationsForm.get('ItemName')?.value + " - Milk Product cannot be prescribed more than 6 bottles. Do you still want to proceed?";
      //     $("#sameGenericMsg").modal('show');
      //     return;
      //   }
      // }

      //if (this.medicationsForm.get('ItemId')?.value == "162156" && Number(this.medicationsForm.get('Quantity')?.value) > 1) {
      //$("#cannotPrescribeGreaterQty").modal('show');
      //}
      //else {
      $('#StrengthUoM').html('');
      $('#IssueUoM').html('');
      if (this.medicationsForm.get('ItemId')?.value != '') {
        this.selectedItemsList.push({
          SlNo: this.selectedItemsList.length + 1,
          Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
          ClassSelected: false,
          ItemId: this.medicationsForm.get('ItemId')?.value,
          ItemCode: this.medicationsForm.get('ItemCode')?.value,
          ItemName: this.medicationsForm.get('ItemName')?.value,
          Strength: this.medicationsForm.get('Strength')?.value + " " + this.medicationsForm.get('StrengthUoM')?.value,
          StrengthUoMID: this.medicationsForm.get('StrengthUoMID')?.value,
          Dosage: this.medicationsForm.get('IssueUOMValue')?.value + " " + this.medicationsForm.get('Dosage')?.value,
          DosageId: this.medicationsForm.get('DosageId')?.value,
          AdmRouteId: this.medicationsForm.get('AdmRouteId')?.value,
          Route: this.medicationsForm.get('AdmRoute')?.value,
          FrequencyId: this.medicationsForm.get('FrequencyId')?.value,
          Frequency: this.medicationsForm.get('Frequency')?.value,
          ScheduleStartDate: this.datepipe.transform(this.medicationsForm.value['ScheduleStartDate'], "dd-MMM-yyyy")?.toString(),
          StartFrom: this.medicationsForm.get('StartFrom')?.value,
          DurationId: this.medicationsForm.get('DurationId')?.value,
          Duration: this.medicationsForm.get('DurationValue')?.value + " " + this.medicationsForm.get('Duration')?.value,
          DurationValue: this.medicationsForm.get('DurationValue')?.value,
          PresInstr: this.medicationsForm.get('PresInstr')?.value,
          Quantity: this.medicationsForm.get('Quantity')?.value,
          QuantityUOMId: this.medicationsForm.get('QuantityUOMId')?.value,
          PresType: this.medicationsForm.get('PresType')?.value,
          PRNType: this.medicationsForm.get('PRNType')?.value,
          GenericId: this.medicationsForm.get('GenericId')?.value,
          DefaultUOMID: this.medicationsForm.get('DefaultUOMID')?.value,
          medInstructionId: this.medicationsForm.get('medInstructionId')?.value,
          PRNReason: this.medicationsForm.get('PRNReason')?.value,
          Remarks: this.medicationsForm.get('Remarks')?.value,
          IssueUoM: this.medicationsForm.get('IssueUoM')?.value,
          ScheduleEndDate: this.medicationsForm.get('ScheduleEndDate')?.value,
          ScheduleTime: this.medicationsForm.get('ScheduleTime')?.value,
          PrescriptionID: '',
          lexicomAlertIcon: '',
          CustomizedDosage: this.medicationsForm.get('CustomizedDosage')?.value,
          QOH: this.medicationsForm.get('QOH')?.value,
          IssueUOMValue: this.medicationsForm.get('IssueUOMValue')?.value,
          IVFluidStorageCondition: this.medicationsForm.get('IVFluidStorageCondition')?.value,
          BaseSolutionID: this.medicationsForm.get('BaseSolutionID')?.value,
          IVFluidExpiry: this.medicationsForm.get('IVFluidExpiry')?.value,
          Price: this.medicationsForm.get('Price')?.value,
          DiagnosisId: this.medicationsForm.get('DiagnosisId')?.value,
          DISID: this.medicationsForm.get('DiagnosisId')?.value,
          DiagnosisName: this.medicationsForm.get('DiagnosisName')?.value,
          DiagnosisCode: this.medicationsForm.get('DiagnosisCode')?.value,
          viewMore: this.medicationsForm.get('Remarks')?.value === '' ? false : true,
          IsAntibiotic: this.medicationsForm.get('IsAntibiotic')?.value,
          IsAntibioticForm: this.medicationsForm.get('IsAntibioticForm')?.value,
          PrescribedQty: this.medicationsForm.get('PrescribedQty')?.value,
          IsHighValueDrug: this.medicationsForm.get('IsHighValueDrug')?.value
        });
        this.createGaugeChart();
        this.isMedicationFormSubmitted = false;
        if (this.medicationsForm.get('Remarks')?.value != '' && this.medicationsForm.get('Remarks')?.value != undefined) {
          const med = this.selectedItemsList.find((x: any) => x.ItemId === this.medicationsForm.get('ItemId')?.value)
          this.maximizeSelectedDrugItems(med);
        }
        // if(this.medicationsForm.get('IVFluidStorageCondition')?.value === '1' && !this.isBaseSolutionAdding) {
        //   this.isBaseSolutionAdding = false;
        //   const ivmed = this.selectedItemsList.find((x: any) => x.ItemId === this.medicationsForm.get('ItemId')?.value);
        //   this.openBaseSolutionSelectionPopup(ivmed);
        // }
        //}
      }
      //this.LexicomAlert();
      this.ClearMedicationForm();
      // this.showSpeedMeterPopUp();
    }
    else {
      this.medicationsForm.patchValue({
        DiagnosisId: '',
        DiagnosisName: '',
        DiagnosisCode: '',
      });
    }
  }
  EditPrescriptionItemsToTable() {
    let find = this.selectedItemsList.find((x: any) => x?.ItemId === this.medicationsForm.get('ItemId')?.value);
    if (find) {
      if (find.ItemId == "162156" && Number(find.Quantity) > 1) {
        $("#cannotPrescribeGreaterQty").modal('show');
      }
      const index = this.selectedItemsList.indexOf(find, 0);
      if (index > -1) {
        find.ItemId = this.medicationsForm.get('ItemId')?.value;
        find.ItemName = this.medicationsForm.get('ItemName')?.value;
        find.Strength = this.medicationsForm.get('Strength')?.value + " " + this.medicationsForm.get('StrengthUoM')?.value;
        find.StrengthUoMID = this.medicationsForm.get('StrengthUoMID')?.value,
          find.Dosage = this.medicationsForm.get('Dosage')?.value;
        find.DosageId = this.medicationsForm.get('DosageId')?.value;
        find.AdmRouteId = this.medicationsForm.get('AdmRouteId')?.value;
        find.Route = this.medicationsForm.get('AdmRoute')?.value;
        find.FrequencyId = this.medicationsForm.get('FrequencyId')?.value;
        find.Frequency = this.medicationsForm.get('Frequency')?.value;
        find.ScheduleStartDate = this.datepipe.transform(this.medicationsForm.value['ScheduleStartDate'], "dd-MMM-yyyy")?.toString();
        find.StartFrom = this.medicationsForm.get('StartFrom')?.value;
        find.DurationId = this.medicationsForm.get('DurationId')?.value;
        find.Duration = this.medicationsForm.get('DurationValue')?.value + " " + this.medicationsForm.get('Duration')?.value;
        find.PresInstr = this.medicationsForm.get('PresInstr')?.value;
        find.Quantity = this.medicationsForm.get('Quantity')?.value;
        find.QuantityUOMId = this.medicationsForm.get('QuantityUOMId')?.value;
        find.PresType = this.medicationsForm.get('PresType')?.value;
        find.PRNType = this.medicationsForm.get('PRNType')?.value;
        find.GenericId = this.medicationsForm.get('GenericId')?.value;
        find.DefaultUOMID = this.medicationsForm.get('DefaultUOMID')?.value;
        find.medInstructionId = this.medicationsForm.get('medInstructionId')?.value;
        find.PRNReason = this.medicationsForm.get('PRNReason')?.value;
        find.DurationValue = this.medicationsForm.get('Quantity')?.value;
        find.IssueUOM = this.medicationsForm.get('IssueUOM')?.value;
        find.Remarks = this.medicationsForm.get('Remarks')?.value;
        find.ScheduleEndDate = this.datepipe.transform(this.medicationsForm.get('ScheduleEndDate')?.value, "dd-MMM-yyyy")?.toString();
        find.ScheduleTime = this.medicationsForm.get('ScheduleTime')?.value,
          find.CustomizedDosage = this.medicationsForm.get('CustomizedDosage')?.value,
          find.QOH = this.medicationsForm.get('QOH')?.value,
          find.IssueUOMValue = this.medicationsForm.get('IssueUOMValue')?.value,
          find.Price = this.medicationsForm.get('Price')?.value,
          find.DiagnosisId = this.medicationsForm.get('DiagnosisId')?.value,
          find.DISID = this.medicationsForm.get('DiagnosisId')?.value,
          find.DiagnosisName = this.medicationsForm.get('DiagnosisName')?.value,
          find.DiagnosisCode = this.medicationsForm.get('DiagnosisCode')?.value,
          find.viewMore = (this.medicationsForm.get('Remarks')?.value === '' || this.medicationsForm.get('Remarks')?.value == undefined) ? false : true

        this.selectedItemsList[index] = find;
        //this.selectedItemsList.splice(index, 1);
        if (this.medicationsForm.get('Remarks')?.value != '' && this.medicationsForm.get('Remarks')?.value != undefined) {
          const med = this.selectedItemsList.find((x: any) => x.ItemId === this.medicationsForm.get('ItemId')?.value)
          this.maximizeSelectedDrugItems(med);
        }
      }
      this.isEditmode = false;
    }
    $('#StrengthUoM').html('');
    $('#IssueUoM').html('');

    this.ClearMedicationForm();
  }
  remove(index: any) {
    this.selectedItemsList.splice(index, 1);
    this.createGaugeChart();
    alert("deleted")
  }

  CalculateQuantity() {
    var UserId = 0;
    var WorkStationID = 0;
    var FreqVal = this.medicationsForm.get('FrequencyId')?.value == "" ? 0 : this.medicationsForm.get('FrequencyId')?.value;
    var CurrentIndx = 0;
    var DosageUnit = this.medicationsForm.get('IssueUOMValue')?.value;
    var DurationUnit = this.medicationsForm.get('DurationValue')?.value;
    var DurationVal = this.medicationsForm.get('DurationId')?.value;
    var Type = 0;
    var IssueTypeUOM = this.medicationsForm.get('IssueTypeUOM')?.value;
    var ItemId = this.medicationsForm.get('ItemId')?.value;
    var DefaultUOMID = this.medicationsForm.get('DefaultUOMID')?.value;
    var PrescStartDate = this.datepipe.transform(this.medicationsForm.value['ScheduleStartDate'], "dd-MMM-yyyy")?.toString();
    var PatientType = this.patientType;
    //Patient Type need to be changed when implementing Inpatient Prescriptions
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, FreqVal, 1, DosageUnit, DurationUnit, DurationVal, 1, 0, ItemId, DefaultUOMID, PrescStartDate, this.patientType == "3" ? "1" : this.patientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.medicationsForm.patchValue({
            Quantity: response.FetchItemQtyDataCDataaList[0].totQty,//response.Quantity.split('^')[1],
            ScheduleEndDate: response.FetchItemQtyDataCDataaList[0].EDT,
            ScheduleTime: response.FetchItemQtyDataCDataaList[0].ScheduleTime,
            //StartFrom: response.Quantity.split('^')[0],
          });
          this.errorMessages = [];
          if (this.medicationsForm.get('PrescribedQty')?.value && this.selectedCard.PatientType == '1' &&
            (Number(response.FetchItemQtyDataCDataaList[0].totQty) > Number(this.medicationsForm.get('PrescribedQty')?.value))) {
            //this.errorMessages.push('Issuing Quantity is more than Prescribed Quantity');
            this.errorMessages.push('Prescribed Qty is Exceeding the allowed Qty for  ' + this.medicationsForm.get('ItemName')?.value);
          }
          if (this.errorMessages.length > 0) {
            $('#errorMsg').modal('show');
            this.medicationsForm.patchValue({
              Quantity: ''
            });
          }
          $('#QuantityUOM').html(this.medicationsForm.get('QuantityUOM')?.value);
        }
      },
        (err) => {

        })
  }

  CalculateQuantityForPrevFavMeds(FrequencyId: any, IssueUOMValue: any, DurationValue: any, DurationId: any, ItemId: any, DefaultUOMID: any, PrescStartDate: any, patientType: any) {

    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, FrequencyId, 1, IssueUOMValue, DurationValue, DurationId, 1, 0, ItemId, DefaultUOMID, PrescStartDate, patientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          return response.FetchItemQtyDataCDataaList[0].EDT //response.FetchItemQtyDataCDataaList[0].totQty + '|' + response.FetchItemQtyDataCDataaList[0].EDT;
        }
        else
          return '';
      },
        (err) => {

        })
  }

  onSavePrescriptionClick() {
    this.saveClickSubject.next();
  }

  savePrescription() {
    if (!this.isAdmReconEntered || !this.isVteEntered || !this.isIniAsmntEntered) {
      if (!this.isVteEntered) {
        if (this.selectedCard.AdmitDate != null && (this.selectedCard.PatientType === '2' || this.selectedCard.PatientType === '4')) {
          const startDate = moment(new Date(this.selectedCard.AdmitDate)).format('DD-MMM-YYYY HH:mm:ss');
          const datepart = this.selectedCard.AdmitDate.split(' ')[0].split('-');
          const timepart = this.selectedCard.AdmitDate.split(' ')[1].split(':');
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const monthIndex = monthNames.indexOf(datepart[1]);
          const freqtime = new Date(datepart[2], monthIndex, datepart[0], timepart[0], timepart[1]);
          freqtime.setHours(freqtime.getHours() + 24);
          if (new Date().getTime() > freqtime.getTime()) {
            $("#VteAmdReconIniAsmntMsg").modal('show');
            return;
          }
        }
      }
      else {
        $("#VteAmdReconIniAsmntMsg").modal('show');
        return;
      }
    }
    this.saveAllPrescription();


  }

  ontherapeuticFormSaved() {
    this.fetchListOfPrescription();
    $('#therapeuticModal').modal('hide');
    this.showTherapeuticForm = false;
    if (this.patientType != '2' && this.patientType != '4') {
      this.FetchPrescriptionInfo();
    }
    $("#savePrescriptionMsg").modal('show');
    setTimeout(() => {
      $("#savePrescriptionMsg").modal('hide');
      this.clearPrescriptionScreen();
    }, 1000);
  }

  ontherapeuticFormSaveClick() {
    this.therapeuticForm?.save(this.therapeuticInvPrescriptionId);
  }

  ontherapeuticFormClearClick() {
    this.therapeuticForm?.clear();
  }

  saveAllPrescription() {
    this.prescriptionSaveData = {};
    this.IsMRIClick = 0;
    if (this.selectedItemsList.length > 0 || this.investigationsList.length > 0 || this.proceduresList.length > 0) {
      //Validation Diagnosis Mapping
      const diagMapping = this.selectedItemsList.filter((x: any) => x.DiagnosisId === '' || x.DiagnosisId === undefined);
      if (diagMapping.length > 0) {
        this.isMappingAll = false;
        this.selectedItemsList.forEach((element: any) => {
          if (!element.DISID && !element.DiagnosisId) {
            element.DISID = '';
            element.DiagnosisId = '';
            element.DiagnosisName = '';
          }
        });
        $("#mapDiagnosisMedicationdiv").modal('show');
        return;
      }
      const Antibiotics = this.getAntibioticsCount();
      if (Antibiotics > 0 && this.antibioticTemplateValue === '') {
        $('#antibioticsMsg').modal('show');
        return;
      }

      //Antibiotic remarks
      const antibioticsCount = this.selectedItemsList.filter((item: any) => item.IsAntibiotic == '1');
      if (antibioticsCount.length > 0) {
        const antibioticsWithoutRemarks = antibioticsCount.filter((item: any) => item.Remarks === '' || item.Remarks === undefined);
        if (antibioticsWithoutRemarks.length > 0) {
          this.errorMessages = "Please enter justification for medications : " + antibioticsWithoutRemarks.map((item: any) => '<br>' + item.ItemName).join('<br>');
          $("#errorMsghtml").modal('show');
          return;
        }
      }

      //High Price Drugs remarks
      const highPriceCount = this.selectedItemsList.filter((item: any) => item.IsHighValueDrug == 'True' || item.IsHighValueDrug == true || item.IsHighValueDrug == '1');
      if (highPriceCount.length > 0) {
        const highPriceWithoutRemarks = highPriceCount.filter((item: any) => item.Remarks === '' || item.Remarks === undefined);
        if (highPriceWithoutRemarks.length > 0) {
          this.errorMessages = "Please enter justification for High Price medications : " + highPriceWithoutRemarks.map((item: any) => '<br>' + item.ItemName).join('<br>');
          $("#errorMsghtml").modal('show');
          return;
        }
      }

      if (this.investigationsList.length > 0) {
        const investigationDiagnosisNotEntered = this.investigationsList.filter((item: any) => !item.DISID);
        if (investigationDiagnosisNotEntered.length > 0) {
          this.errorMessages = "Please select diagnosis for investigations.";
          $("#errorMsg").modal('show');
          return;
        }
        var invRem = this.investigationsList.filter((x: any) => x.SpecialisationId == '217' || x.SpecialisationId == '214' || x.SpecialisationId == '13');
        invRem = invRem.filter((x: any) => x.Remarks === '' || x.Remarks === undefined);
        if (invRem.length > 0) {
          const radiologyRem = this.investigationsList.filter((x: any) => x.SpecialisationId == '217' || x.SpecialisationId == '214' || x.SpecialisationId == '13').map((item: any) => item.Name).join(',');
          this.errorMessages = "Please enter justification for Radiology services." + radiologyRem;
          $("#errorMsg").modal('show');
          return;
        }
      }

      if (this.proceduresList.length > 0) {
        const procedureDiagnosisNotEntered = this.proceduresList.filter((item: any) => !item.DISID);
        if (procedureDiagnosisNotEntered.length > 0) {
          this.errorMessages = "Please select diagnosis for procedures.";
          $("#errorMsg").modal('show');
          return;
        }
      }

      //For OP - medication Instructions mandatory validation
      // if(this.selectedCard.PatientType == '1' && this.selectedItemsList.length > 0) {
      //   const medInstrNotgiven = this.selectedItemsList.filter((x: any) => x.medInstructionId == '');
      //   if(medInstrNotgiven.length > 0) {
      //     this.errorMessages = "Please select Medication <b>Instruction</b> for below items. " + medInstrNotgiven.map((item: any) => '<br>' + item.ItemName).join('<br>');
      //     $("#errorMsghtml").modal('show');
      //     return;
      //   }
      // }

      //For OP - procedure Instructions mandatory validation
      if (this.proceduresList.length > 0 && this.selectedCard.CompanyID == '1838') {
        const procRemarksNotExist = this.proceduresList.filter((x: any) => x.Remarks == '');
        if (procRemarksNotExist.length > 0) {
          this.errorMessages = "Please enter <b>Remarks</b> for below items. " + procRemarksNotExist.map((item: any) => '<br>' + item.Name).join('<br>');
          $("#errorMsghtml").modal('show');
          return;
        }
      }

      var validate = this.ValidateDrugDetails();
      if (validate.toString().split("^")[0] != "false" && (this.isPbmChecked || this.selectedItemsList.length === 0)) {
        this.FormDrugDetails();
        let postData = {
          "DrugPrescriptionID": this.savedDrugPrescriptionId != 0 ? this.savedDrugPrescriptionId : 0,
          "TestPrescriptionID": this.savedInvPrescriptionId != 0 ? this.savedInvPrescriptionId : 0,
          "ProcPrescriptionID": this.savedProcPrescriptionId != 0 ? this.savedProcPrescriptionId : 0,
          "MonitorID": this.savedMonitorId != 0 ? this.savedMonitorId : (this.patientType == '2' || this.patientType == '4') ? this.savedMonitorId : 0,
          "Prescriptiondate": this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
          "PatientID": this.PatientId,
          "DoctorID": (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4') ? this.selectedCard.ConsultantID : this.doctorDetails[0].EmpId,
          "IPID": parseInt(this.selectedPatientAdmissionId),
          "BedID": (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4') ? this.selectedCard.BedID : 0,
          "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
          "Patienttype": this.patientType,
          "MonitorIndex": 1,
          "BillID": this.selectedCard.BillID,
          "LetterID": this.selectedCard.LetterID,
          "BillType": this.selectedCard.BillType == 'Insured' ? 'CR' : 'CS',
          "CompanyID": this.selectedCard.CompanyID,
          "GradeID": this.selectedCard.GradeID,
          "BillItemSeq": 0,
          "PackageID": 0,
          "Ddetails": JSON.stringify(this.drugDetails),
          "Pdetails": JSON.stringify(this.procedureDetails),
          "Idetails": JSON.stringify(this.investigationDetails),
          "UserID": this.doctorDetails[0].UserId,
          "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, //this.patientType == '2' ? this.facility.FacilityID : 0,
          "OneTimeIssue": 1,
          "STATUS": (this.patientType == '2' || this.patientType == '4') ? 2 : 1,
          "ScheduleID": 0,
          "IsDisPrescription": this.DischargeMedication == true ? 1 : 0,//0,
          "RaiseDrugOrder": (this.patientType == '2' || this.patientType == '4') ? 1 : 0,//0,
          "ActionType": 0,
          "PrescriptionType": "D",
          "Dremarks": "",
          "CSTemplateID": 0,
          "ComponentID": 0,
          "DrugOrdertypeId": this.selectedItemsList.filter((x: any) => x.FrequencyId == '41').length > 0 ? "47" : '36',
          "POrdertypeId": this.proceduresList.filter((x: any) => x.SOrN == 'S').length > 0 ? '101' : "37",
          "IOrdertypeId": this.investigationsList.filter((x: any) => x.SOrN == 'S').length > 0 ? '15' : "13",
          "PrscritionStats": 0,
          "PainScoreID": 0,
          "IsPatientDrugAlleric": 0,
          "HasPreviousMedication": 0,
          "IsAdminReconciliation": 0,
          "IsDrugPresciptionNotModified": 0,
          "Iwadtaskdetails": JSON.stringify(this.drugDetails),
          "AntiMicrobialOrderSheet": this.antibioticTemplateValue,
          "InvestigationSchedules": "",
          "InvestigationSchedulesXML": JSON.stringify(this.procedureSchedules),
          "Hospitalid": this.hospitalId,
          "LexcomIntractions": "",
          "IsContrastAllergic": 0,
          "IVFDetails": JSON.stringify(this.ivfDetails),
          "PBMJustification": this.pbmRemarksText,
          "CTASScore": this.ctasScore,
          "OrderPackID": this.orderPackId,
          "EntryId": this.entryId,
          "IsFollowup": this.selectedCard.OrderTypeID === '50' ? 1 : 0,
          "InsuranceCompanyID": this.selectedCard.InsuranceCompanyID
        };

        if (this.SpecialiseID === undefined || this.savedInvPrescriptionId > 0) {
          const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
            backdrop: 'static'
          });
          modalRef.componentInstance.dataChanged.subscribe((data: any) => {
            if (data.success) {
              this.config.saveAllPrescription(postData).subscribe(
                (response) => {
                  if (response.Code == 200) {
                    if (response.appReqList && response.appReqList.items.length > 0 && this.patientType === '1' &&
                      (response.appReqList.items.filter((x: any) => x.isCovered === 'Not Covered' || x.isCovered === 'Approval Required' || x.isCovered === 'Need Approval' || x.isCovered === 'Limit Exceeded' || x.isCovered === 'Pharmacy Duration').length > 0) &&
                      (this.selectedCard.BillType == 'Insured' || this.selectedCard.BillType == 'CR')) {
                      //this.loaDataList = response.LOADataList;
                      //this.loaServicesDataList = response.LOAServicesDataList;
                      this.loaDataList = response.appReqList;//response.LOADataList;
                      this.loaServicesDataList = response.appReqList.items;
                      this.loaDiagnosis = response.appReqList.diagnosis?.map((item: any) => item.name).join(', ');
                      this.loaCc = response.appReqList.cc?.map((item: any) => item.name).join(', ');
                      this.pbmRemarksText = "";
                      this.trimesterOrderPackMsg = "";
                      $("#approvalRequest").modal('show');
                    }
                    else {
                      $("#selectedMessage").modal('hide');
                      this.selectedItemsList = []; this.investigationsList = []; this.proceduresList = [];
                      this.createGaugeChart();
                      if (this.isTherapeutic) {
                        this.therapeuticInvPrescriptionId = response.InvPrescriptionID;
                        this.showTherapeuticForm = true;
                        $('#therapeuticModal').modal('show');
                      } else {
                        if (this.patientType != '2' && this.patientType != '4') {
                          this.FetchPrescriptionInfo();
                        }
                        $("#savePrescriptionMsg").modal('show');
                        setTimeout(() => {
                          $("#savePrescriptionMsg").modal('hide');
                          this.clearPrescriptionScreen();
                        }, 1000);
                      }
                    }
                  } else {

                  }
                },
                (err) => {
                  console.log(err)
                });
            }
            modalRef.close();
          });

        }
        else {
          this.prescriptionSaveData = postData;
          if (this.savedInvPrescriptionId > 0) {
            this.config.fetchPatientRadiologyRequestForms(this.savedInvPrescriptionId, this.hospitalId)
              .subscribe((response: any) => {
                if (response.Code == 200) {
                  if (response.FetchPatientRadiologyRequestFDataList.length > 0) {
                    this.fetchDiagnosisForMRIForm();
                    $("#refill_modal").modal('show');
                    var radData = response.FetchPatientRadiologyRequestFDataList[0];
                    var checkList = response.FetchPatientRadiologySafetyChecklistFDataList;

                    this.selectedOption = radData.IsPregnant === 0 ? "No" : radData.IsPregnant === 1 ? "Yes" : radData.IsPregnant === 2 ? "Unsure" : "Check";
                    this.selectedPaediatricOption = radData.IsPaediatricSpecialNeed ? "Yes" : "No";
                    this.selectedSpecialOption = radData.SpecialNeed ? "Yes" : "No";
                    this.selectedSedationOption = radData.IsSedationRequired ? "Yes" : "No";
                    this.selectedContrastOption = radData.IsContrastRequired ? "Yes" : "No";
                    this.selectedPreviousOption = radData.IsPreviousRadiologyStudy ? "Yes" : "No";
                    this.patientRadiologyRequestId = radData.PatientRadiologyRequestId;

                    this.radForm.patchValue({
                      LMPDate: new Date(radData.LMPDate),
                      IsNormalKidneyFunction: radData.IsNormalKidneyFunction,
                      IsChronicRenalImpairment: radData.IsChronicRenalImpairment,
                      IsAcuteKidneyInjury: radData.IsAcuteKidneyInjury,
                      IsHaemodialysis: radData.IsHaemoDialysis,
                      SerumCreatinineLevel: radData.LastSerumCreatinineLevel,
                      ActiveIssues: radData.BriefClinicalHistory,
                      QAndA: radData.ClinicalQuestion
                    });

                    this.radiologyRequestDataList = [];
                    checkList.forEach((element: any, index: any) => {
                      let chk = {
                        "SafetyChecklistId": element.SafetyChecklistId,
                        "SpecialiseID": element.SpecialiseID,
                        "Specialisation": element.Specialisation,
                        "SafetyChecklistName": element.SafetyChecklistName,
                        "SafetyChecklistName2L": element.SafetyChecklistName2L,
                        "selectedValue": element.IsSafety
                      }
                      this.radiologyRequestDataList.push(chk);
                    });

                  }
                }
              });
          }
          else {
            this.LoadCheckList();
          }

        }

      }
      else {
        if (!this.isPbmChecked) {
          this.PBMIntegrationCall();
          return;
        }
        if (validate.toString().split("^")[1] == "openOrderPackModifiedPopup") {
          $("#selectedMessage").modal('show');
          this.openOrderPackNotUsingJustification();
        }
        else {
          validate.toString().split("^")[1] == "NoProcQty" ? $("#validateProceduresMsg").modal('show') : $("#validatePrescriptionMsg").modal('show');
        }
      }
    }
    else {
      if (this.savedDrugPrescriptionId != 0 || this.savedInvPrescriptionId != 0 || this.savedProcPrescriptionId != 0) {
        let postData = {
          "DrugPrescriptionID": this.savedDrugPrescriptionId != 0 ? this.savedDrugPrescriptionId : 0,//this.patientType == '1' ? this.savedDrugPrescriptionId : 0,
          "TestPrescriptionID": this.savedInvPrescriptionId != 0 ? this.savedInvPrescriptionId : 0,
          "ProcPrescriptionID": this.savedProcPrescriptionId != 0 ? this.savedProcPrescriptionId : 0, //this.patientType == '1' ? this.savedProcPrescriptionId : 0,
          "MonitorID": this.savedMonitorId != 0 ? this.savedMonitorId : (this.patientType == '2' || this.patientType == '4') ? this.savedMonitorId : 0,
          "Prescriptiondate": this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
          "PatientID": this.PatientId,
          "DoctorID": (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4') ? this.selectedCard.ConsultantID : this.doctorDetails[0].EmpId,
          "IPID": parseInt(this.selectedPatientAdmissionId),
          "BedID": (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4') ? this.selectedCard.BedID : 0,//0,
          "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
          "Patienttype": this.patientType,
          "MonitorIndex": 1,
          "BillID": this.selectedCard.BillID,
          "LetterID": this.selectedCard.LetterID,
          "BillType": this.selectedCard.BillType == 'Insured' ? 'CR' : 'CS',
          "CompanyID": this.selectedCard.CompanyID,
          "GradeID": this.selectedCard.GradeID,
          "BillItemSeq": 0,
          "PackageID": 0,
          "Ddetails": JSON.stringify(this.drugDetails),
          "Pdetails": JSON.stringify(this.procedureDetails),
          "Idetails": JSON.stringify(this.investigationDetails),
          "UserID": this.doctorDetails[0].UserId,
          "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, //this.patientType == '2' ? this.facility.FacilityID : 0,
          "OneTimeIssue": 1,
          "STATUS": 1,
          "ScheduleID": 0,
          "IsDisPrescription": this.DischargeMedication == true ? 1 : 0,//0,
          "RaiseDrugOrder": (this.patientType == '2' || this.patientType == '4') ? 1 : 0,//0,
          "ActionType": 0,
          "PrescriptionType": "D",
          "Dremarks": "",
          "CSTemplateID": 0,
          "ComponentID": 0,
          "DrugOrdertypeId": this.selectedItemsList.filter((x: any) => x.FrequencyId == '41').length > 0 ? "47" : '36',
          "POrdertypeId": this.proceduresList.filter((x: any) => x.SOrN == 'S').length > 0 ? '101' : "37",
          "IOrdertypeId": this.investigationsList.filter((x: any) => x.SOrN == 'S').length > 0 ? '15' : "13",
          "PrscritionStats": 0,
          "PainScoreID": 0,
          "IsPatientDrugAlleric": 0,
          "HasPreviousMedication": 0,
          "IsAdminReconciliation": 0,
          "IsDrugPresciptionNotModified": 0,
          "Iwadtaskdetails": JSON.stringify(this.drugDetails),
          "AntiMicrobialOrderSheet": this.antibioticTemplateValue,
          "InvestigationSchedules": "",
          "InvestigationSchedulesXML": JSON.stringify(this.procedureSchedules),
          "Hospitalid": this.hospitalId,
          "LexcomIntractions": "",
          "IsContrastAllergic": 0,
          "IVFDetails": JSON.stringify(this.ivfDetails),
          "PBMJustification": this.pbmRemarksText,
          "CTASScore": this.ctasScore,
          "OrderPackID": this.orderPackId,
          "EntryId": this.entryId,
          "IsFollowup": this.selectedCard.OrderTypeID === '50' ? 1 : 0,
          "InsuranceCompanyID": this.selectedCard.InsuranceCompanyID
        };

        const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
          backdrop: 'static'
        });
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
          if (data.success) {
            this.config.saveAllPrescription(postData).subscribe(
              (response) => {
                if (response.Code == 200) {
                  if (response.appReqList && response.appReqList.items.length > 0 && this.patientType === '1' &&
                    (response.appReqList.items.filter((x: any) => x.isCovered === 'Not Covered' || x.isCovered === 'Approval Required' || x.isCovered === 'Need Approval' || x.isCovered === 'Limit Exceeded' || x.isCovered === 'Pharmacy Duration').length > 0) &&
                    (this.selectedCard.BillType == 'Insured' || this.selectedCard.BillType == 'CR')) {
                    //this.loaDataList = response.LOADataList;
                    //this.loaServicesDataList = response.LOAServicesDataList;
                    this.loaDataList = response.appReqList;//response.LOADataList;
                    this.loaServicesDataList = response.appReqList.items;
                    this.loaDiagnosis = response.appReqList.diagnosis?.map((item: any) => item.name).join(', ');
                    this.loaCc = response.appReqList.cc?.map((item: any) => item.name).join(', ');
                    this.pbmRemarksText = "";
                    this.trimesterOrderPackMsg = "";
                    $("#approvalRequest").modal('show');
                  }
                  else {
                    $("#selectedMessage").modal('hide');
                    this.selectedItemsList = []; this.investigationsList = []; this.proceduresList = [];
                    this.createGaugeChart();
                    if (this.patientType != '2' && this.patientType != '4')
                      this.FetchPrescriptionInfo();
                    $("#savePrescriptionMsg").modal('show');
                    setTimeout(() => {
                      $("#savePrescriptionMsg").modal('hide');
                      this.clearPrescriptionScreen();
                    }, 1000)
                  }
                } else {

                }
              },
              (err) => {
                console.log(err)
              });
          }
          modalRef.close();
        });
      }
      else {
        $("#noPrescriptionSelected").modal('show');
      }
    }

  }
  clearPrescriptionScreen() {
    this.ClearMedicationForm();
    this.drugDetails = []; this.investigationDetails = []; this.procedureDetails = [];
    this.selectedItemsList = []; this.investigationsList = []; this.proceduresList = [];
    this.changedInvestigationsList = []; this.changedMedicationsList = []; this.changedProceduresList = [];
    if (this.patientType !== '2') {
      this.SaveData();
    }
    this.createGaugeChart();
  }
  ValidateDrugDetails() {
    var validateDrugDet = this.selectedItemsList.filter((s: any) => s.Duration == "" || s.AdmRouteId == "" || s.DurationId == "" || s.DurationValue == ""
      || s.FrequencyId == "" || s.Route == "");
    var validateProcDet = this.proceduresList.filter((p: any) => p.Quantity == 0 || p.Quantity == undefined)
    if (this.changedProceduresList.length == 0 && this.changedMedicationsList.length == 0 && this.changedInvestigationsList.length == 0)
      this.ValidateOrderPackModification();
    if (validateDrugDet.length > 0) {
      return "false" + "^" + "NotValidDrug";
    }
    else if (validateProcDet.length > 0) {
      return "false" + "^" + "NoProcQty";
    }
    else if ((this.changedProceduresList.length > 0 || this.changedMedicationsList.length > 0 || this.changedInvestigationsList.length > 0) && this.orderpackSelectedAndModified) {
      return "false" + "^" + "openOrderPackModifiedPopup"
    }
    else
      return true;
  }


  //Lexicom
  LexicomAlert() {

    var drugsInfo: { DrugId: any; Strength: any; StrengthUnit: any; RouteOfAdminId: any; Dose: any; DoseUnit: any; FrequencyId: any; Duration: any; DurationUnit: any; IsStat: boolean; IsPrn: boolean; ScheduledAt: Date; Sequence: any; }[] = [];
    this.selectedItemsList.forEach((element: any, index: any) => {
      drugsInfo.push({
        DrugId: element.ItemId, Strength: element.Strength.split(' ')[0], StrengthUnit: element.StrengthUoMID,
        RouteOfAdminId: element.AdmRouteId, Dose: element.Strength.split(' ')[0], DoseUnit: element.StrengthUoMID, FrequencyId: element.FrequencyId,
        Duration: element.Duration.split(' ')[0], DurationUnit: element.DurationId, IsStat: false, IsPrn: false, ScheduledAt: new Date(),
        Sequence: index
      })
    });
    var payload = {
      "ClinicalDrugInfoRequest": {
        "PatientId": this.PatientId,
        "AdmissionId": this.selectedPatientAdmissionId,
        "UserId": this.doctorDetails[0].UserId,
        "UserProfile": "",
        "IsGeneric": false,
        "RequestType": 3,
        "ClinicianType": 0,
        "DrugsInfo": drugsInfo
      }
    }

    this.config.getLexicomAlerts(payload).subscribe((response) => {
      if (response != "") {
        this.lexicomSummaryAlertsList = []; this.lexicomSummaryAlertsListPassed = [];
        var InlineAlertIcons = Object.keys(response.Content.InlineAlertIcons).map((groupkey) => ({ groupkey, values: response.Content.InlineAlertIcons[groupkey], }));
        var SummaryAlertIcons = Object.keys(response.Content.SummaryAlertIcons).map((groupkey) => ({ groupkey, values: response.Content.SummaryAlertIcons[groupkey], }));
        var Alerts = Object.keys(response.Content.Alerts).map((groupkey) => ({ groupkey, values: response.Content.Alerts[groupkey], }));
        this.lexicomAlertsList = InlineAlertIcons;
        this.lexicomAlertsWithTextList = Alerts;
        InlineAlertIcons?.forEach((item: any, index: any) => {
          let find = this.selectedItemsList.find((x: any) => x?.ItemId === item.groupkey);
          if (find) {
            const index = this.selectedItemsList.indexOf(find, 0);
            if (index > -1) {
              find.lexicomAlertIcon = item.values.Multiple.Base64;
              this.selectedItemsList[index] = find;
            }
          }
        })
        this.lexicomData = "";
        this.MedAlerts = this.selectedItemsList.length;
      }
    },
      (err) => {

      })
  }

  LexicomAlertSummary() {

    var drugsInfo: { DrugId: any; Strength: any; StrengthUnit: any; RouteOfAdminId: any; Dose: any; DoseUnit: any; FrequencyId: any; Duration: any; DurationUnit: any; IsStat: boolean; IsPrn: boolean; ScheduledAt: Date; Sequence: any; }[] = [];
    this.selectedItemsList.forEach((element: any, index: any) => {
      drugsInfo.push({
        DrugId: element.ItemId, Strength: element.Strength.split(' ')[0], StrengthUnit: element.StrengthUoMID,
        RouteOfAdminId: element.AdmRouteId, Dose: element.Strength.split(' ')[0], DoseUnit: element.StrengthUoMID, FrequencyId: element.FrequencyId,
        Duration: element.Duration.split(' ')[0], DurationUnit: element.DurationId, IsStat: false, IsPrn: false, ScheduledAt: new Date(),
        Sequence: index
      })
    });
    var payload = {
      "ClinicalDrugInfoRequest": {
        "PatientId": this.PatientId,
        "AdmissionId": this.selectedPatientAdmissionId,
        "UserId": this.doctorDetails[0].UserId,
        "UserProfile": "",
        "IsGeneric": false,
        "RequestType": 3,
        "ClinicianType": 0,
        "DrugsInfo": drugsInfo
      }
    }

    this.config.getLexicomAlerts(payload).subscribe((response) => {
      if (response != "") {
        this.lexicomSummaryAlertsList = [];
        var InlineAlertIcons = Object.keys(response.Content.InlineAlertIcons).map((groupkey) => ({ groupkey, values: response.Content.InlineAlertIcons[groupkey], }));
        var SummaryAlertIcons = Object.keys(response.Content.SummaryAlertIcons).map((groupkey) => ({ groupkey, values: response.Content.SummaryAlertIcons[groupkey], }));
        var Alerts = Object.keys(response.Content.Alerts).map((groupkey) => ({ groupkey, values: response.Content.Alerts[groupkey], }));

        SummaryAlertIcons?.forEach((icon: any, index: any) => {
          if (SummaryAlertIcons[index]?.values.Alerts.length > 0) {
            SummaryAlertIcons[index]?.values.Alerts.forEach((alert: any, ind: any) => {
              if (SummaryAlertIcons[index].groupkey != "Multiple") {
                this.lexicomSummaryAlertsList.push({
                  "Category": SummaryAlertIcons[index].groupkey,
                  "Text": Alerts[alert].values.Text,
                  "ApiName": Alerts[alert].values.APIName,
                  "Base64": Alerts[alert].values.Icon.Base64
                })
              }
            })
          }
          else {
            this.lexicomSummaryAlertsListPassed.push({
              "Category": SummaryAlertIcons[index].groupkey,
              "Text": "",
              "ApiName": "",
              "Base64": SummaryAlertIcons[index].values.Base64
            })
          }
        })
        this.lexicomData = "";
        this.MedAlerts = this.lexicomSummaryAlertsList.length;
        $("#lexicomSummaryAlerts").modal('show');
      }
    },
      (err) => {

      })
  }

  ValidateOrderPackModification() {
    this.changedProceduresList = [];
    this.changedMedicationsList = [];
    this.changedInvestigationsList = [];

    this.tempProceduresList?.forEach((item: any, index: any) => {
      let findproc = this.proceduresList.filter((x: any) => x?.ServiceItemId === item.ServiceItemId);
      if (findproc.length > 0) {
        if (item.Quantity != findproc[0].Quantity) {
          this.changedProceduresList.push(this.proceduresList[index]);
          this.orderpackSelectedAndModified = true;
        }
      }
      else {
        this.changedProceduresList.push(item);
        this.orderpackSelectedAndModified = true;
      }
    })
    this.tempMedicationsList?.forEach((item: any, index: number) => {
      let findmed = this.selectedItemsList.filter((x: any) => x?.ItemId === item.ItemId);
      if (findmed.length > 0) {
        //this.changedMedicationsList.push(this.selectedItemsList[index])
      }
      else {
        this.changedMedicationsList.push(item);
        this.orderpackSelectedAndModified = true;
      }
      // if(JSON.stringify(item) != JSON.stringify(this.tempMedicationsList[index])) {
      //   this.changedMedicationsList.push(this.selectedItemsList[index])
      // }
    })

    this.tempInvestigationList?.forEach((item: any, index: any) => {
      let findinv = this.investigationsList.filter((x: any) => x?.ServiceItemId === item.ServiceItemId);
      if (findinv.length > 0) {
        // if(item.Quantity != findinv[0].Quantity) {
        //   this.changedInvestigationsList.push(this.investigationsList[index])
        // }
      }
      else {
        this.changedInvestigationsList.push(item);
        this.orderpackSelectedAndModified = true;
      }
    })
  }
  FormDrugDetails() {

    this.IsCTScan = false;
    this.IsMRI = false;
    this.SpecialiseID = undefined;

    this.drugDetails = []; this.investigationDetails = []; this.procedureDetails = []; this.ivfDetails = [];
    this.selectedItemsList.forEach((element: any) => {
      this.drugDetails.push({
        SEQ: this.drugDetails.length + 1,
        ITM: element.ItemId,
        ITNAME: element.ItemName,
        DOS: element.Dosage.split(" ")[0],
        DOID: element.DosageId,
        FID: element.FrequencyId,
        DUR: element.Duration.split(" ")[0],
        DUID: element.DurationId,
        SFRM: this.datepipe.transform(element.ScheduleStartDate, "dd-MMM-yyyy hh:mm a")?.toString(),
        REM: element.Remarks,
        ARI: element.AdmRouteId,
        STM: element.ScheduleTime == undefined ? '' : element.ScheduleTime,
        FQTY: element.Quantity,
        EDT: element.ScheduleEndDate,
        CF: false,
        CD: element.CustomizedDosage == undefined ? '' : element.CustomizedDosage,
        // IUMVAL:
        QTYUOMID: element.QuantityUOMId,
        //QTYUOMID: element.StrengthUoMID,
        QTY: Number(element.Quantity),
        //QTY: Number(element.Strength.split(' ')[0]),
        STA: 0,
        // UCAFAPR: false,
        GID: element.GenericId,
        TQT: Number(element.Quantity),
        TID: element.DefaultUOMID,
        ISPSD: false,
        // TPOID:
        PATINS: element.PresInstr == "" ? "select" : element.PresInstr,
        PIID: element.medInstructionId == '' ? 0 : element.medInstructionId,
        REQQTY: Number(element.Quantity),
        REQUID: element.DefaultUOMID,
        // PISTATUS:
        // ARID:
        ISDRUGFLOW: false,
        ISPRN: element.IsPRN,
        PRNREASON: element.PRNReason,
        // LGDA:
        REM2L: "",
        JUST: "",
        // FCONFIG:
        ISANTIC: false,
        ANTICSTATUS: -1,
        OPACKID: 0,
        DISID: element.DISID,
        DefaultUOMID: element.DefaultUOMID,
        PrescriptionItemStatusNew: element.PrescriptionItemStatusNew == undefined ? "0" : element.PrescriptionItemStatusNew,

      })
      if (element.IVFluidStorageCondition === '1') {
        this.ivfDetails.push({
          SEQ: this.ivfDetails.length + 1,
          ItemID: element.ItemId,
          QTY: element.Quantity,
          DET: "",
          ItemName: element.ItemName,
          BaseSolutionID: element.BaseSolutionID,
          UOMID: element.DefaultUOMID,
          AdditiveCategoryID: 1,
          ExpiryTime: element.IVFluidExpiry + " hrs"
        });
      }
    });
    this.proceduresList.forEach((element: any) => {
      this.procedureDetails.push({
        // SEQ: this.investigationDetails.length +1,
        PID: element.ServiceItemId,
        PROCEDURE: element.Name,
        SID: 5,
        QTY: Number(element.Quantity),
        ISQ: this.proceduresList.length + 1,
        REM: element.Remarks,
        STID: element.ServiceTypeId,
        OTYID: element.SOrN == "N" ? 37 : 101,
        PRID: 0,
        RTID: 1,
        SLOC: 2,
        SDT: this.datepipe.transform(new Date(), "dd-MMM-yyyy HH:mm:ss tt")?.toString(),
        TOID: 0,
        ORDERTYPE: "Routine",
        COMPONENTID: 0,
        COMPONENTNAME: "",
        APPROVALDATE: this.datepipe.transform(new Date(), "dd-MMM-yyyy HH:mm:ss tt")?.toString(),
        ISPSD: false,
        FAV: false,
        ISMANDATORY: false,
        TEMPLATE: "",
        SCREENDESIGNID: "",
        HOLDINGREASONID: 0,
        ISCONTRASTALLERGIC: false,
        STATUS: element.Status,
        DISID: element.DISID,
        DEPARTMENTID: element.DEPARTMENTID === undefined ? 0 : element.DEPARTMENTID
      })
    });
    this.isTherapeutic = false;
    this.investigationsList.forEach((element: any) => {

      if (element.SpecialisationId === "214") {
        this.IsCTScan = true;
        this.SpecialiseID = element.SpecialisationId;
      }

      if (element.SpecialisationId === "217") {
        this.IsMRI = true;
        this.SpecialiseID = element.SpecialisationId;
      }

      if (element.ServiceItemId === '3548' && this.doctorDetails[0]?.TherapeticReport === 'YES') {
        this.isTherapeutic = true;
      }

      if (this.IsMRI & this.IsCTScan) {
        this.SpecialiseID = 0;
      }

      this.investigationDetails.push({
        PID: element.ServiceItemId,
        PROCEDURE: element.Name,
        SID: 3,
        QTY: Number(element.Quantity),
        ISQ: this.investigationsList.length + 1,
        SPID: element.SpecimenId,
        REM: element.Remarks,
        STID: element.ServiceTypeId,
        OTYID: element.SOrN == "N" ? 13 : 15,
        SPEID: element.SpecialisationId,
        ISPSD: false,
        ISMANDATORY: false,
        TEMPLATE: "",
        SCREENDESIGNID: 0,
        HOLDINGREASONID: 0,
        ISSCHEDULE: false,
        ISNONSTAT: false,
        ISSTATTEST: false,
        STATUS: element.Status,
        DISID: element.DISID,
        DEPARTMENTID: element.DEPARTMENTID === undefined ? 0 : element.DEPARTMENTID
      })
    });
  }

  ClearMedicationForm() {
    this.searchFrequencyTerm = '';
    this.searchRouteTerm = '';
    this.filteredDrugFrequenciesList = cloneDeep(this.drugFrequenciesList);
    this.filteredAdmRoutesList = cloneDeep(this.AdmRoutesListMaster);
    this.medicationsForm.patchValue({
      ItemId: [''],
      ItemName: [''],
      AdmRouteId: [''],
      AdmRoute: [''],
      FrequencyId: [''],
      Frequency: [''],
      ScheduleStartDate: new Date(),
      StartFrom: [''],
      DosageId: [''],
      Strength: [''],
      StrengthUoMID: [''],
      StrengthUoM: [''],
      IssueUOMValue: [''],
      IssueUoM: [''],
      IssueUOMID: [''],
      IssueTypeUOM: [''],
      DefaultUOMID: [''],
      DurationValue: [''],
      DurationId: [''],
      Duration: [''],
      medInstructionId: [''],
      medInstructionName: [''],
      PresInstr: [''],
      Quantity: [''],
      PresTypeId: [''],
      PresType: [''],
      PRNType: [''],
      QuantityUOM: [''],
      QuantityUOMId: [''],
      GenericId: [''],
      IsPRN: [''],
      PRNREASON: [''],
      Remarks: [''],
      DiagnosisId: '',
      DISID: '',
      DiagnosisName: [''],
      DiagnosisCode: [''],
      IsAntibiotic: [''],
      IsAntibioticForm: [''],
      PrescribedQty: [''],
      IsHighValueDrug: [''],
      ItemCode: [''],
    });
    $('#QuantityUOM').html('');
    $('#Dosage').html('');
    this.isMedicationFormSubmitted = false;
    this.selectedIvMedicationForBaseSolution = [];
    this.isBaseSolutionAdding = false;
  }
  medicationRemarksPopup(med: any, remarksRequired: boolean = false) {
    this.remarksForSelectedMedName = med;
    if (this.isEditmode) {
      const remarks = this.medicationsForm.get('Remarks')?.value;
      $("#medRem").val(remarks);
    }
    else {
      $("#medRem").val('');
    }
    this.isMedicationRemarksRequired = remarksRequired;
    $('#medication_remark').modal('show');
  }
  saveMedicationRemarks(invRem: any) {
    this.medicationsForm.patchValue({
      Remarks: invRem
    });
    if (this.isMedicationRemarksRequired) {
      this.AddPrescriptionItemsToTable();
    }
  }
  showFavorites() {
    $("#modalFavorite").modal('show');
  }

  showProcedureFavorites() {
    $("#modalProcedureFavorite").modal('show');
  }

  showFavoritesMedication() {
    //if (this.itemMedications.length === 0) {
    this.getFetchFavouriteitemsDoctorWise(this.doctorDetails[0].EmpId)
    $("#modalMedicationFavorite").modal('show');
    // } else {
    //   $("#modalMedicationFavorite").modal('show');
    // }
  }
  filterMedicationData(searchMediTerm: string): void {

    if (!searchMediTerm) {
      this.groupedDataMedicArray = this.groupedMedicationFilter; // No filter, return the original data
    }

    this.groupedDataMedicArray = this.groupedMedicationFilter.map(group => ({
      groupkey: group.groupkey,
      values: group.values.filter(item => item.name.toLowerCase().includes(searchMediTerm.toLowerCase())),
      items: group.values.filter(item => item.name.toLowerCase().includes(searchMediTerm.toLowerCase()))
    })).filter(group => group.items.length > 0);
  }



  renameKey(obj: any, oldKey: any, newKey: any) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
  }
  PreviousMedicationClick(value: boolean = false) {
    var startdate = moment(this.viewPreviousMedicationForm.get('fromdate')?.value).format('DD-MMM-YYYY');
    var enddate = moment(this.viewPreviousMedicationForm.get('todate')?.value).format('DD-MMM-YYYY');

    this.config.getPreviousMedicationPFN(this.patientType == '2' || this.patientType == '3' || this.patientType == '4' ? this.patientDetails.RegCode : this.patientDetails.RegCode, startdate, enddate, 0, 0).subscribe((response) => {
      if (response.Status === "Success") {
        //$("#viewPreviousMedication").modal('show');
        $("#previousMedication").modal('show');
        this.previousMedicationList = response.PreviousMedicationDataList;
        this.issuedPrescriptionItems = response.PreviousMedicationIssuedDataList;
        //this.previousMedicationList = this.previousMedicationList.filter((data: any) => Date.parse(data.StartFrom) > Date.parse(startdate.toString()) && Date.parse(data.EndDatetime) < Date.parse(enddate));
        this.PatientVisitsList = this.previousMedicationList.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.PrescriptionNO === thing.PrescriptionNO) === i);
        const distinctThings = response.PreviousMedicationDataList.filter(
          (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.PrescriptionNO === thing.PrescriptionNO) === i);
        this.filteredpreviousMedicationList = distinctThings;
        this.filteredpreviousMedicationList = this.filteredpreviousMedicationList.sort((a: any, b: any) => new Date(b.PrescriptionCreateDate).getTime() - new Date(a.PrescriptionCreateDate).getTime());
        this.PatientVisitsList = this.PatientVisitsList.sort((a: any, b: any) => b.PrescriptionID - a.PrescriptionID);
        // this.previousMedicationList.forEach((med: any, index: any) => {
        //   med.selected = false;
        //   med.isChecked = false;
        //   var qty = 0;
        //   this.config.displayScheduleAndQuantity(0, 0, med.FrequencyID, 1, med.Dose, med.Duration, med.DurationID, 1, 0, med.ItemID,
        //     this.patientType == '2' ? med.IPDefaultUomID : med.OPDefaultUomID, moment(new Date()).format('DD-MMM-YYYY'), this.patientType == "3" ? "1" : this.patientType, 0)
        //     .subscribe((response: any) => {
        //       if (response.Code == 200) {
        //         med.Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
        //       }
        //     },
        //       (err) => {

        //       })
        // });
        this.previousMedicationListDetails = this.previousMedicationList.filter((x: any) => x.PrescriptionID === this.filteredpreviousMedicationList[0].PrescriptionID);
        this.issuedItemsAgainstPresc = this.issuedPrescriptionItems.filter((x: any) => x.PrescriptionID == this.filteredpreviousMedicationList[0].PrescriptionID);
        this.previousMedicationListDetails[0].selected = true;
        this.previousMedicationListDetails[0].selectall = false;
        this.showPrevMedFiltersData = value;
        if (value === true) {
          this.showPreviousMedications(this.currentFilter);
        }
        this.showHomeMedInPrevMed = 'no';
      }
    },
      (err) => {

      })
  }

  showPreviousMedications(filter: string) {
    this.currentFilter = filter;
    this.showPrevMedFiltersData = true;
    if (filter === "W") {
      var week = new Date();
      week.setDate(week.getDate() - 7);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(week.toString()));
    } else if (filter === "T") {
      var today = new Date();
      today.setDate(today.getDate());
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(today.toString()));
    }
    else if (filter === "M") {
      var onem = new Date();
      onem.setMonth(onem.getMonth() - 1);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(onem.toString()));
    } else if (filter === "3M") {
      var threem = new Date();
      threem.setMonth(threem.getMonth() - 3);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(threem.toString()));
    } else if (filter === "6M") {
      var sixm = new Date();
      sixm.setMonth(sixm.getMonth() - 6);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(sixm.toString()));
    } else if (filter === "1Y") {
      var twelvem = new Date();
      twelvem.setMonth(twelvem.getMonth() - 12);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(twelvem.toString()));
    }
  }

  filterPreviousMedications(event: any) {
    var prescid = event.target.value;
    if (prescid === "0") {
      this.filteredpreviousMedicationList = this.previousMedicationList;
      const distinctThings = this.filteredpreviousMedicationList.filter(
        (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.PrescriptionNO === thing.PrescriptionNO) === i);
      this.filteredpreviousMedicationList = distinctThings;
      this.previousMedicationListDetails = this.previousMedicationList.filter((x: any) => x.PrescriptionID === this.filteredpreviousMedicationList[0].PrescriptionID);
      this.issuedItemsAgainstPresc = this.issuedPrescriptionItems.filter((x: any) => x.PrescriptionID == this.filteredpreviousMedicationList[0].PrescriptionID);
      this.previousMedicationListDetails[0].selected = true;
      this.previousMedicationListDetails[0].selectall = false;
    }
    else {
      const distinctThings = this.previousMedicationList.filter(
        (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.PrescriptionID === prescid) === i);
      this.filteredpreviousMedicationList = distinctThings;
      this.previousMedicationListDetails = this.previousMedicationList.filter((x: any) => x.PrescriptionID === prescid);
      this.issuedItemsAgainstPresc = this.issuedPrescriptionItems.filter((x: any) => x.PrescriptionID == prescid);
      this.previousMedicationListDetails[0].selected = true;
      this.previousMedicationListDetails[0].selectall = false;
    }
  }

  filterFunction(presc: any, prescdate: any) {
    return presc.filter((buttom: any) => buttom.PrescriptionID == prescdate);
  }

  filterPrevMedication(prescid: any) {
    return this.previousMedicationList.filter((buttom: any) => buttom.PrescriptionID == prescid);
  }

  selectallPresc(presc: any) {
    presc.selectall = !presc.selectall;
    this.previousMedicationListDetails.forEach((element: any, index: any) => {
      if (presc.selectall) {
        if (element.StatusID != 1) {

        }
        else {
          this.selectedPrevMedItem = element;
          $("#activeMedicationYesNo").modal('show');
        }
        let find = this.previousMedicationListDetails.filter((x: any) => x?.ItemID === element.ItemID && x?.PrescriptionID === element.PrescriptionID);
        if (find && find[0].Frequency !== 'STAT') {
          find.forEach((element: any, index: any) => {
            find[index].isChecked = true;
          });
        }
      }
      else {
        let find = this.previousMedicationListDetails.filter((x: any) => x?.ItemID === element?.ItemID && x?.PrescriptionID === element?.PrescriptionID);
        if (find) {
          find.forEach((element: any, index: any) => {
            find[index].isChecked = false;
          });
        }
      }
    });

  }
  showPrevMedDetails(pres: any) {
    this.showMedicineHistorydiv = false;
    this.selectedHistoryItem = []; this.previousMedicationListDetails = [];
    this.filteredpreviousMedicationList.forEach((element: any, index: any) => {
      if (element.PrescriptionID === pres.PrescriptionID)
        element.selected = true;
      else
        element.selected = false;
    });
    //pres.selected = !pres.selected;
    if (pres.selected) {
      this.previousMedicationListDetails = this.previousMedicationList.filter((buttom: any) => buttom.PrescriptionID == pres.PrescriptionID);
      this.previousMedicationListDetails = this.previousMedicationListDetails.map((prevmedlst: any) => ({
        ...prevmedlst,
        viewMorePrevMed: false,
      }));
    }
    else
      this.previousMedicationListDetails = [];

    this.issuedItemsAgainstPresc = this.issuedPrescriptionItems.filter((x: any) => x.PrescriptionID == pres.PrescriptionID)
  }

  filterIssuedItems(view: any) {
    return this.issuedItemsAgainstPresc.filter((x: any) => x.PrescriptionItemID === view.ItemID);
  }

  PrescribePreviousMedicationBtnClick() {
    let find = this.previousMedicationListDetails.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
    if (this.showPrevMedFiltersData) {
      find = this.previousMedicationListDetailsFilterData.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
    }
    if (find.length > 0) {
      const url = this.us.getApiUrl(prescription.FetchItemSpecialisationValidation, {
        ItemIDs: find.map((e: any) => e.ItemID).toString(),
        WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
        HospitalID: this.hospitalId
      });
      this.us.get(url).subscribe((response: any) => {
        if (response.Code === 200) {
          if (response.FetchItemSpecialisationValidationDataList.length === 0) {
            this.PrescribePreviousMedication();
          } else {
            this.mismatchedMedications = [];
            find.forEach((selected: any) => {
              const itemResponses = response.FetchItemSpecialisationValidationDataList.filter((a: any) => a.ItemID === selected.ItemID);

              if (itemResponses.length > 0) {
                const hasMatchingSpecialization = itemResponses.some(
                  (resp: any) => resp.SpecialiseID === this.doctorDetails[0].EmpSpecialisationId
                );

                if (!hasMatchingSpecialization) {
                  selected.specializations = itemResponses.map((b: any) => b.Specialisation).toString();
                  this.mismatchedMedications.push(selected);
                }
              }
            });
            if (this.mismatchedMedications.length > 0) {
              find.forEach((selected: any) => {
                // If the medication exists in mismatchedMedications, mark it as unchecked
                if (this.mismatchedMedications.some((mis: any) => mis.ItemID === selected.ItemID)) {
                  selected.isChecked = false;
                }
              });
              $('#medicationValidationModal').modal('show');
            }
            this.PrescribePreviousMedication();
          }
        }
      });
    } else {
      this.PrescribePreviousMedication();
    }
  }

  PrescribePreviousMedication() {
    let find = this.previousMedicationListDetails.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
    if (this.showPrevMedFiltersData) {
      find = this.previousMedicationListDetailsFilterData.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
    }
    let subscribes: ObservableInput<any>[] = [];

    find.forEach((med: any, index: any) => {
      med.selected = false;
      med.isChecked = false;
      //med.Duration = "1"; med.DurationID = "3"; med.DurationUOM = "Days";
      subscribes.push(this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, med.FrequencyID, 1, med.Dose, med.Duration, med.DurationID, 1, 0, med.ItemID,
        (this.patientType == '2' || this.patientType == '4') ? med.IPDefaultUomID : med.OPDefaultUomID, moment(med.EndDatetime).format('DD-MMM-YYYY'), this.patientType == "3" ? "1" : this.patientType, 0, this.hospitalId));

    });
    combineLatest(subscribes).subscribe(responses => {
      responses.forEach((response, index) => {
        if (response.Code === 200) {
          find[index].Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
          find[index].ScheduleEndDate = find[index].Blocked == '1' ? moment(new Date).format('DD-MMM-YYYY HH:mm') : response.FetchItemQtyDataCDataaList[0].EDT;
        }
      })
      if (find.length > 0) {
        let duplicateItemsList = "";
        find.forEach((element: any, index: any) => {
          find[index].isChecked = true;
          let findDuplicateItem;
          if (this.selectedItemsList.length > 0) {
            findDuplicateItem = this.selectedItemsList.filter((x: any) => x?.ItemId === find[index].ItemID || x.GenericId == find[index].GenericID);
          }
          if (findDuplicateItem != undefined && findDuplicateItem.length > 0) {
            duplicateItemsList = duplicateItemsList != "" ? duplicateItemsList + "," + findDuplicateItem[0].ItemName : findDuplicateItem[0].ItemName;
          }
          else {
            this.config.fetchItemForPrescriptions(this.patientType, find[index].ItemID, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
              .subscribe((response: any) => {
                if (response.Code == 200) {
                  const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
                  this.selectedItemsList.push({
                    SlNo: this.selectedItemsList.length + 1,
                    Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
                    ClassSelected: false,
                    ItemId: find[index].ItemID,
                    ItemCode: find[index].ItemCode,
                    ItemName: find[index].GenericItemName,
                    StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
                    Strength: response.ItemDataList[0].Strength + " " + response.ItemDataList[0].StrengthUoM,
                    StrengthUoM: response.ItemDataList[0].StrengthUoM,
                    Dosage: find[index].Dose + " " + find[index].DoseUoM, //response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
                    DosageId: response.ItemDataList[0].QtyUomID,
                    AdmRouteId: find[index].AdmRouteID,
                    Route: find[index].AdmRoute,
                    FrequencyId: find[index].FrequencyID,
                    Frequency: find[index].Frequency,
                    ScheduleStartDate: find[index].Blocked == '1' ? moment(new Date).format('DD-MMM-YYYY') :
                      new Date(find[index].EndDatetime) > new Date() ?
                        this.datepipe.transform(new Date(find[index].EndDatetime).setDate(new Date(find[index].EndDatetime).getDate() + 1), "dd-MMM-yyyy")?.toString()
                        : moment(new Date()).format('DD-MMM-YYYY'),
                    StartFrom: find[index].Blocked == '1' ? moment(new Date()).format('DD-MMM-YYYY') :
                      new Date(find[index].EndDatetime) > new Date() ?
                        this.datepipe.transform(new Date(find[index].EndDatetime).setDate(new Date(find[index].EndDatetime).getDate() + 1), "dd-MMM-yyyy")?.toString()
                        : moment(new Date()).format('DD-MMM-YYYY'),
                    DurationId: find[index].DurationID,
                    Duration: find[index].Duration + " " + find[index].DurationUOM,
                    DurationValue: find[index].Duration,
                    PresInstr: "",//item.PresInstr,
                    Quantity: find[index].Quantity,
                    QuantityUOMId: find[index].QtyUOMID,
                    PresType: "",//item.PresType,
                    PRNType: find[index].PRNMedicationReason,//item.PRNType,
                    GenericId: find[index].GenericID,
                    DefaultUOMID: (this.patientType == '2' || this.patientType == '4') ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
                    medInstructionId: "",//item.medInstructionId,
                    PRNReason: "",//item.PRNReason,
                    IssueUoM: response.DefaultUOMDataaList[0].IssueUOM,
                    IssueUOMID: response.DefaultUOMDataaList[0].IssueUOMID,
                    IssueUOMValue: response.ItemDataList[0].Quantity,
                    IssueTypeUOM: itempacking[0].FromUoMID,
                    lexicomAlertIcon: '',
                    QOH: (this.patientType == "2" || this.patientType == "4") ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
                    IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
                    BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '1' ? '0' : response.ItemDataList[0].Basesolution,
                    IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '1' ? '0' : response.ItemDataList[0].IVFluidExpiry,
                    Price: response.ItemPriceDataList[0].MRP,
                    ScheduleEndDate: find[index].Blocked == '1' ? this.datepipe.transform(new Date().setDate(new Date(new Date()).getDate() + 1), "dd-MMM-yyyy")?.toString() : find[index].ScheduleEndDate,
                    viewMore: false,
                    IsAntibiotic: response.ItemDataList[0].IsAntibiotic,
                    IsAntibioticForm: response.ItemDataList[0].IsAntibioticForm,
                    PrescribedQty: response.ItemDataList[0].PrescribedQty,
                    Remarks: find[index].Remarks
                  });
                }
                //this.LexicomAlert();
                this.createGaugeChart();
              })
          }
        });
        if (duplicateItemsList != undefined && duplicateItemsList != "") {
          this.duplicateItemsList = duplicateItemsList;
          $("#itemAlreadySelected").modal('show');
        }
        $("#previousMedication").modal('hide');
      }
      else {
        $("#noSelectedMedToPrescribe").modal('show');
      }
    });
  }

  prevMedSelected(isChecked: any, index: any, item: any) {

    //Milk Products Prescription Limit
      // if (item?.IsMilk == 1 && this.selectedCard?.PatientType == '1') {
      //   //Less than 6 months -- 10 bottles
      //   if (Number(this.ageFromDOB?.totalMonths) < 6 &&  Number(item.Quantity) > 10) {
      //     this.prescriptionValidationMsg = item.GenericItemName + " : Milk Product cannot be prescribed more than 10 bottles.";
      //     $("#validatedMilkMedItemsprevmedModal").modal('show');
      //     return;
      //   }
      //   //6-12 months -- 8 bottles
      //   if ((Number(this.ageFromDOB?.totalMonths) >= 6 && Number(this.ageFromDOB?.months) <= 8) &&  Number(item.Quantity) > 8) {
      //     this.prescriptionValidationMsg = item.GenericItemName + " : Milk Product cannot be prescribed more than 8 bottles.";
      //     $("#validatedMilkMedItemsprevmedModal").modal('show');
      //     return;
      //   }
      //   //More than one year - 6 bottles 
      //   if (Number(this.ageFromDOB?.totalMonths) >= 12 &&  Number(item.Quantity) > 6) {
      //     this.prescriptionValidationMsg = item.GenericItemName + " : Milk Product cannot be prescribed more than 6 bottles.";
      //     $("#validatedMilkMedItemsprevmedModal").modal('show');
      //     return;
      //   }
      // }

    this.config.FetchPrescriptionValidations(this.selectedPatientAdmissionId, item.ItemID, item.GenericID, item.GenericItemName.replace(/[^\w\s]/gi, ''),
      this.PatientId, this.ageValue, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalId, this.selectedCard.PatientType)
      .subscribe((valresponse: any) => {
        if (valresponse.FetchPrescValidationsDataaList.length === 0) {
          this.onNewPreviousMedicationSelected(isChecked, index, item);
        }
        else {
          if (valresponse.FetchPrescValidationsDataaList[0].Buttons == "YESNO") {
            this.onNewPreviousMedicationSelected(isChecked, index, item);
          }
          else {
            this.prescriptionValidationMsg = valresponse.FetchPrescValidationsDataaList[0].strMessage;
            $("#prescriptionValidationMsgModal").modal('show');
          }
        }
      },
        (err) => {
        })
  }

  onNewPreviousMedicationSelected(isChecked: any, index: any, item: any) {
    if (isChecked) {
      if (item.Frequency === 'STAT') {
        $("#cannotPrescribeStatMedMsg").modal('show');
        return;
      }
      if (item.StatusID != 1) {

      }
      else {
        this.selectedPrevMedItem = item;
        $("#activeMedicationYesNo").modal('show');
      }
      let find = this.previousMedicationListDetails.filter((x: any) => x?.ItemID === item.ItemID && x?.PrescriptionID === item.PrescriptionID);
      if (find.length > 0) {
        find.forEach((element: any, index: any) => {
          find[index].isChecked = true;
        });
      }
      else {
        let find = this.previousMedicationListDetailsFilterData.filter((x: any) => x?.ItemID === item.ItemID && x?.PrescriptionID === item.PrescriptionID);
        if (find.length > 0) {
          find.forEach((element: any, index: any) => {
            find[index].isChecked = true;
          });
        }
      }
    }
    else {
      item.isChecked = false;
      // let find = this.previousMedicationListDetails.filter((x: any) => x?.ItemID === item?.ItemID && x?.PrescriptionID === item?.PrescriptionID);
      // if (find) {
      //   find.forEach((element: any, index: any) => {
      //     find[index].isChecked = false;
      //   });
      // }
    }
  }

  checkIfDiscontinueMedSelected() {
    const discontinueMed = this.previousMedicationListDetailsFilterData.filter((x: any) => x.Blocked == '1' && x.isChecked);
    if (discontinueMed.length > 0) {
      return false;
    }
    return true;
  }

  onNewPreviousMedicationSelectedAll() {
    this.selectAllPrevMedFilter = !this.selectAllPrevMedFilter;
    const activeMed = this.previousMedicationListDetailsFilterData.filter((x: any) => x.StatusID == 1);
    if (this.selectAllPrevMedFilter) {
      activeMed.filter((x: any) => x.StatusID == 1).forEach((item: any) => {
        item.isChecked = true;
      });
    }
    else {
      activeMed.forEach((element: any, index: any) => {
        element.isChecked = false;
      });
    }
  }

  onPreviousMedicationSelected(event: any, index: any, item: any) {
    if (event.target.checked) {
      if (item.StatusID != 1) {

      }
      else {
        this.selectedPrevMedItem = item;
        $("#activeMedicationYesNo").modal('show');
      }
      let find = this.previousMedicationList.filter((x: any) => x?.ItemID === item.ItemID && x?.PrescriptionID === item.PrescriptionID);
      if (find) {
        find.forEach((element: any, index: any) => {
          find[index].isChecked = true;
        });
      }
    }
    else {
      let find = this.previousMedicationList.filter((x: any) => x?.ItemID === this.selectedPrevMedItem?.ItemID && x?.PrescriptionID === this.selectedPrevMedItem?.PrescriptionID);
      if (find) {
        find.forEach((element: any, index: any) => {
          find[index].isChecked = false;
        });
      }
    }
  }
  continuePrescribingPrevMed(type: string) {
    if (type === 'yes') {
      let find = this.previousMedicationList.filter((x: any) => x?.ItemID === this.selectedPrevMedItem?.ItemID && x?.PrescriptionID === this.selectedPrevMedItem?.PrescriptionID);
      if (find) {
        find.forEach((element: any, index: any) => {
          find[index].isChecked = true;
        });
      }
    }
    else {
      let find = this.previousMedicationList.filter((x: any) => x?.ItemID === this.selectedPrevMedItem?.ItemID && x?.PrescriptionID === this.selectedPrevMedItem?.PrescriptionID);
      if (find) {
        find.forEach((element: any, index: any) => {
          find[index].isChecked = false;
        });
      }
    }
  }
  DeletePrescriptionItem(index: any, medi: any) {

    const med = this.savedDrugPrescriptions.find((x: any) => x.ItemId === medi.ItemID);
    if (med && Number(med.SavedDoctorEmpID) !== this.doctorDetails[0].EmpId) {
      this.errorMessages = "Cannot delete as the Order has been raised by another doctor";
      $("#errorMsg").modal('show');
      return;
    }

    this.selectedItemsList.splice(index, 1);
    this.createGaugeChart();
    //this.LexicomAlert();
  }
  EditPrescriptionItem(med: any) {
    this.isEditmode = true;
    this.medicationsForm.patchValue({
      ItemId: med.ItemId,
      ItemCode: med.ItemCode,
      ItemName: med.ItemName,
      Dosage: med.Dosage,
      DosageId: med.DosageId,
      Strength: med.Strength.split(' ')[0],
      StrengthUoM: med.Strength.split(' ')[1],
      StrengthUoMID: med.StrengthUoMID,
      IssueUOMValue: med.Dosage.split(' ')[0],
      IssueUoM: med.Dosage.split(' ')[1],
      IssueUOMID: med.IssueUOMID,
      ScheduleStartDate: new Date(med.ScheduleStartDate),
      StartFrom: new Date(med.ScheduleStartDate),
      ScheduleEndDate: new Date(med.ScheduleEndDate),
      DefaultUOMID: med.DefaultUOMID,
      IssueTypeUOM: med.IssueTypeUOM,
      QuantityUOMId: med.QuantityUOMId,
      QuantityUOM: med.IssueUoM,
      GenericId: med.GenericId,
      DurationValue: med.Duration?.split(' ')[0],
      DurationId: med.DurationId == "" ? '3' : med.DurationId,
      Duration: med.Duration ? med.Duration?.split(' ')[1] : "Days",
      Quantity: med.Quantity,
      FrequencyId: med.FrequencyId,
      AdmRouteId: med.AdmRouteId,
      AdmRoute: med.Route,
      Frequency: med.Frequency,
      PresInstr: med.PresInstr,
      PresType: med.PresType,
      PRNType: med.PRNType,
      PRNReason: med.PRNReason,
      medInstructionId: med.medInstructionId,
      Remarks: med.Remarks,
      CustomizedDosage: med.CustomizedDosage,
      QOH: med.QOH,
      IVFluidStorageCondition: med.IVFluidStorageCondition,
      BaseSolutionID: med.BaseSolutionID,
      IVFluidExpiry: med.IVFluidExpiry,
      DiagnosisId: med.DiagnosisId,
      DISID: med.DISID,
      DiagnosisName: med.DiagnosisName,
      DiagnosisCode: med.DiagnosisCode,
      IsAntibiotic: med.IsAntibiotic,
      IsAntibioticForm: med.IsAntibioticForm,
      PrescribedQty: med.PrescribedQty,
      IsHighValueDrug: med.IsHighValueDrug
    })
    this.selectedMedDrugFreqScheduleTime = this.drugFrequenciesList.find((x: any) => x.FrequencyID == med.FrequencyId);

    $('#StrengthUoM').html(med.Strength.split(' ')[1]);
    $('#IssueUoM').html(med.Dosage.split(' ')[1]);
    $('#QuantityUOM').html(med.IssueUoM);
    $('#Dosage').html(med.Dosage.split(' ')[1]);
  }

  onScheduleDateChange(event: any) {
    if (this.isEditmode) {
      const selectedschdDate = event.target.value._d;
      const selectedMedToEdit = this.selectedItemsList.find((x: any) => x.ItemId === this.medicationsForm.get('ItemId')?.value);
      if (new Date(selectedschdDate) < new Date(selectedMedToEdit.ScheduleStartDate)) {
        this.config.FetchPrescriptionValidations(this.selectedPatientAdmissionId, this.medicationsForm.get('ItemId')?.value, this.medicationsForm.get('GenericId')?.value,
          this.medicationsForm.get('ItemName')?.value.replace(/[^\w\s]/gi, ''), this.PatientId, this.ageValue, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalId, this.selectedCard.PatientType)
          .subscribe((valresponse: any) => {
            if (valresponse.FetchPrescValidationsDataaList.length === 0 || this.DischargeMedication) {
              this.CalculateQuantity();
            }
            else {
              if (valresponse.FetchPrescValidationsDataaList[0].Buttons == "YESNO") {
                this.errorMessages = valresponse.FetchPrescValidationsDataaList[0].strMessage;
                $("#errorMsg").modal('show');
                this.medicationsForm.patchValue({
                  ScheduleStartDate: new Date(selectedMedToEdit.ScheduleStartDate),
                  StartFrom: new Date(selectedMedToEdit.ScheduleStartDate)
                });
              }
              else {
                this.errorMessages = valresponse.FetchPrescValidationsDataaList[0].strMessage;
                $("#errorMsg").modal('show');
                this.medicationsForm.patchValue({
                  ScheduleStartDate: new Date(selectedMedToEdit.ScheduleStartDate),
                  StartFrom: new Date(selectedMedToEdit.ScheduleStartDate)
                });
              }
            }
          },
            (err) => {
            })
      }
      else {
        this.CalculateQuantity();
      }
    }
  }

  checkAllPrevMedItems(event: any, PrescriptionID: any) {
    let find = this.previousMedicationList.filter((x: any) => x?.PrescriptionID === PrescriptionID);
    if (find) {
      find.forEach((element: any, index: any) => {
        find[index].isChecked = event.target.checked;
      });
    }
  }
  FetchOrderPacks() {
    this.config.FetchPackagePrescriptionOrderPacks("1000", "19", 0, 0, "null", "null", this.selectedPatientAdmissionId, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 300 && response.PackagePrescriptionOrderPacksDataList.length > 0) {
          this.orderPacks = response.PackagePrescriptionOrderPacksDataList;
          this.orderPacks.forEach((element: any, index: any) => {
            element.Class = "p-3 rounded-2 suggested_order  h-100 d-flex flex-column align-items-center justify-content-between";
            element.Selected = false;
          });
          if (response.PackagePrescriptionOrderPacksDataList.length > 0) {
            $("#orderPacks").modal('show');
            this.showOrderPackNotUsingJustification = false;
          }
        }
        if (this.selectedCard.PatientType === '2' && this.selectedCard.IsnewBorn) {
          this.fetchNewBornOrderPacks();
        }
        else {
          this.fetchPregenencyHistory();
        }
      })
  }

  fetchNewBornOrderPacks() {
    this.config.FetchPackagePrescriptionOrderPackPediatrics(this.selectedCard.PatientID, 1, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPackagePrescriptionOrderPackPediatricsDataList.length > 0) {
          this.trimesterOrderPackMsg = "Order Pack loaded for New Born";
          this.showInvListdiv = true; this.showProcListdiv = true;
          this.orderPackId = response.FetchPackagePrescriptionOrderPackPediatricsDataList[0].OrderPackID;
          response.FetchPackagePrescriptionOrderPackPediatricsDataList.forEach((element: any, index: any) => {
            if (element.ServiceID === '3') {
              this.investigationsList.push({
                ID: this.investigationsList.length + 1, SOrN: 'N', Name: element.ProcedureName, Specialisation: element.ItemSpecialisation, Quantity: 1,
                ServiceItemId: element.ProcedureID, SpecialisationId: element.ItemSpecialisationID, ServiceTypeId: 3, SpecimenId: element.SpecimenID, Remarks: element.Remarks, disableDelete: false,
                TATRemarks: '', ResultStatus: '', ItemPrice: this.selectedCard.BillType === 'Insured' ? element.CompanyPrice : element.BasePrice,
                DEPARTMENTID: element.DepartmentID
              })
            }
            else if (element.ServiceID === '5') {
              this.proceduresList.push({
                ID: this.proceduresList.length + 1, SOrN: 'N', Name: element.ProcedureName, Specialisation: element.ItemSpecialisation, Quantity: 1,
                ServiceItemId: element.ProcedureID, SpecialisationId: element.ItemSpecialisationID, ServiceTypeId: 5, Remarks: element.Remarks, disableDelete: false,
                TATRemarks: '', ResultStatus: '', ItemPrice: this.selectedCard.BillType === 'Insured' ? element.CompanyPrice : element.BasePrice,
                DEPARTMENTID: element.DepartmentID
              })
            }
          });
          this.createGaugeChart();
        }
      });
  }

  fetchPregenencyHistory() {
    this.config.fetchPregenencyHistoryADV(this.selectedCard.PatientID, this.selectedPatientAdmissionId).subscribe((response: any) => {
      if (response.Code == "200") {
        if (response.PregnancyHisDataList.length > 0 && this.patientType === '1') {
          const preghist = response.PregnancyHisDataList[0];
          this.pregnancyHistoryDetails = preghist;

          this.config.FetchPackagePrescriptionOrderPackTrimesters(this.selectedCard.PatientID, this.selectedPatientAdmissionId, preghist.TriSemister, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId)
            .subscribe((response: any) => {
              if (response.Code == 200 && response.FetchPackagePrescriptionOrderPackTrimestersDataList.length > 0) {
                this.trimesterOrderPackMsg = "Order Pack loaded for " + preghist.TriSemister + " Trimester";
                this.showInvListdiv = true; this.showProcListdiv = true;
                this.orderPackId = response.FetchPackagePrescriptionOrderPackTrimestersDataList[0].OrderPackID;
                response.FetchPackagePrescriptionOrderPackTrimestersDataList.forEach((element: any, index: any) => {
                  if (element.ServiceID === '3') {
                    this.investigationsList.push({
                      ID: this.investigationsList.length + 1, SOrN: 'N', Name: element.ProcedureName, Specialisation: element.ItemSpecialisation, Quantity: 1,
                      ServiceItemId: element.ProcedureID, SpecialisationId: element.ItemSpecialisationID, ServiceTypeId: 3, SpecimenId: element.SpecimenID, Remarks: element.Remarks, disableDelete: false,
                      TATRemarks: '', ResultStatus: '', ItemPrice: this.selectedCard.BillType === 'Insured' ? element.CompanyPrice : element.BasePrice,
                      DEPARTMENTID: element.DepartmentID
                    })
                  }
                  else if (element.ServiceID === '5') {
                    this.proceduresList.push({
                      ID: this.proceduresList.length + 1, SOrN: 'N', Name: element.ProcedureName, Specialisation: element.ItemSpecialisation, Quantity: 1,
                      ServiceItemId: element.ProcedureID, SpecialisationId: element.ItemSpecialisationID, ServiceTypeId: 5, Remarks: element.Remarks, disableDelete: false,
                      TATRemarks: '', ResultStatus: '', ItemPrice: this.selectedCard.BillType === 'Insured' ? element.CompanyPrice : element.BasePrice,
                      DEPARTMENTID: element.DepartmentID
                    })
                  }
                });
                this.createGaugeChart();
              }
            });
        }
      }
    });
  }

  selectedOrderPacks(event: any, orderpack: any) {
    if (this.selectedOrderPackIds != "")
      this.selectedOrderPackIds = this.selectedOrderPackIds + "," + orderpack.OrderPackID;
    else
      this.selectedOrderPackIds = orderpack.OrderPackID;
  }
  getSelectedOrderPackDetails() {
    if (this.selectedOrderPackIds != "") {
      this.orderPacksSelected = true;
      this.tempMedicationsList = []; this.tempInvestigationList = []; this.tempProceduresList = [];
      this.config.FetchPackagePrescriptionOrderPacks("1000,1080,4324,5871,5893,5894,5896", "1,2,3,4,10,11,12,13,14,15,16,17,18", 0, 0, "null", this.selectedOrderPackIds, this.selectedPatientAdmissionId, this.hospitalId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            if (this.selectedOrderPackIds != "") {
              //this.selectedItemsList = response.OrderPackMedicationsDataList;
              response.OrderPackMedicationsDataList.forEach((element: any, index: any) => {
                this.config.fetchItemForPrescriptions(this.patientType, element.ItemID, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
                  .subscribe((response: any) => {
                    if (response.Code == 200) {
                      const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
                      this.selectedItemsList.push({
                        SlNo: this.selectedItemsList.length + 1,
                        Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
                        ClassSelected: false,
                        ItemId: element.ItemID,
                        ItemCode: response.ItemDataList[0].ItemCode,
                        ItemName: response.ItemDataList[0].DisplayName,
                        StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
                        Strength: response.ItemDataList[0].Strength + " " + response.ItemDataList[0].StrengthUoM,
                        StrengthUoM: response.ItemDataList[0].StrengthUoM,
                        Dosage: response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM, //response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
                        DosageId: response.ItemDataList[0].QtyUomID,
                        AdmRouteId: element.AdmRouteID,
                        Route: element.AdmRoute,
                        FrequencyId: "",//this.selectedMedications[index].FrequencyID,
                        Frequency: "",//this.selectedMedications[index].Frequency,
                        ScheduleStartDate: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                        StartFrom: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                        DurationId: "",//this.selectedMedications[index].DurationID,
                        Duration: "",//this.selectedMedications[index].Duration + " " + this.selectedMedications[index].DurationUOM,
                        DurationValue: "",//this.selectedMedications[index].Duration,
                        PresInstr: "",//item.PresInstr,
                        Quantity: "",//this.selectedMedications[index].Quantity,
                        QuantityUOMId: response.DefaultUOMDataaList[0].IssueUOMID,//this.selectedMedications[index].QtyUOMID,
                        QuantityUOM: response.DefaultUOMDataaList[0].IssueUOM,//this.selectedMedications[index].QtyUOMID,
                        PresType: "",//item.PresType,
                        PRNType: "",//this.selectedMedications[index].PRNMedicationReason,//item.PRNType,
                        GenericId: element.GenericID,
                        DefaultUOMID: response.ItemDataList[0].OPDefaultUomID,
                        medInstructionId: "",//item.medInstructionId,
                        PRNReason: "",//item.PRNReason,
                        IssueUoM: response.DefaultUOMDataaList[0].IssueUOM,
                        IssueUOMID: response.DefaultUOMDataaList[0].IssueUOMID,
                        IssueUOMValue: response.ItemDataList[0].Quantity,
                        IssueTypeUOM: itempacking[0].FromUoMID,
                        lexicomAlertIcon: '',
                        QOH: (this.patientType == "2" || this.patientType == "4") ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
                        IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
                        BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '' ? response.ItemDataList[0].Basesolution : '',
                        IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '' ? response.ItemDataList[0].IVFluidExpiry : '',
                        Price: response.ItemPriceDataList[0].MRP,
                        viewMore: false,
                        IsAntibiotic: response.ItemDataList[0].IsAntibiotic,
                        IsAntibioticForm: response.ItemDataList[0].IsAntibioticForm,
                        PrescribedQty: response.ItemDataList[0].PrescribedQty
                      });
                    }
                    this.createGaugeChart();
                  })

              })

              setTimeout(() => {
                this.tempMedicationsList = JSON.parse(JSON.stringify(this.selectedItemsList));
              }, 5000);
              response.OrderPackInvProcDataList.forEach((element: any, index: any) => {
                //if (element.SpecimenID != null && element.SpecimenID != "" && element.ServiceID=="3") {
                if (element.ServiceID == "3") {
                  this.showInvListdiv = true;
                  this.investigationsList.push({
                    ID: this.investigationsList.length + 1, SOrN: 'N', Name: element.ProcedureName, Specialisation: element.ItemSpecialisation, Quantity: 1,
                    ServiceItemId: element.ProcedureID, SpecialisationId: element.SpecialiseID, ServiceTypeId: 3, SpecimenId: element.SpecimenID, Remarks: element.Remarks, disableDelete: false,
                    TATRemarks: element.TATRemarks, ResultStatus: element.ResultStatus, ItemPrice: this.selectedCard.BillType === 'Insured' ? element.CompanyPrice : element.BasePrice,
                    DEPARTMENTID: element.DepartmentID
                  })
                }
                else {
                  this.showProcListdiv = true;
                  this.proceduresList.push({
                    ID: this.proceduresList.length + 1, SOrN: 'N', Name: element.ProcedureName, Specialisation: element.ItemSpecialisation, Quantity: 1,
                    ServiceItemId: element.ProcedureID, SpecialisationId: element.SpecialiseID, ServiceTypeId: 5, Remarks: element.Remarks, disableDelete: false,
                    TATRemarks: '', ResultStatus: element.ResultStatus, ItemPrice: this.selectedCard.BillType === 'Insured' ? element.CompanyPrice : element.BasePrice,
                    DEPARTMENTID: element.DepartmentID
                  })
                }
              })
              this.tempInvestigationList = JSON.parse(JSON.stringify(this.investigationsList));
              this.tempProceduresList = JSON.parse(JSON.stringify(this.proceduresList));
              this.createGaugeChart();
            }
            else {
              this.orderPackDetails = response.PackagePrescriptionOrderPacksDataList;
              $("#orderPacks").modal('show');
            }
            $("#orderPacks").modal('hide');
          }
        })
    }
    else {
      this.orderPacksSelected = false;
    }
  }
  openOrderPackNotUsingJustification() {
    if (this.showOrderPackNotUsingJustification) {
      this.showOrderPackNotUsingJustification = false;
    }
    else {
      this.config.FetchOrderPackJustification(this.selectedPatientAdmissionId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.orderpackJustifications = response.OrderPackJustList;
          }
        })
      this.showOrderPackNotUsingJustification = true;
    }
  }
  selectOrderPackJustification(event: any, opJustification: any) {

    if (event.target.checked) {
      this.justificationArr.push(opJustification.OrderPackJustificationID);
      // if (this.selectedopJustificationIds != "") {
      //   this.selectedopJustificationIds = this.selectedopJustificationIds + "," + opJustification.OrderPackJustificationID;
      // }
      // else {
      //   this.selectedopJustificationIds = opJustification.OrderPackJustificationID;
      // }
      if (opJustification.Justification == "Remarks") {
        this.enableOrderPackRemarks = true;
      }
    }
    else {
      this.enableOrderPackRemarks = false;
      const index = this.justificationArr.indexOf(opJustification.OrderPackJustificationID, 0);
      if (index > -1) {
        this.justificationArr.splice(index, 1);
      }
    }
    this.selectedopJustificationIds = this.justificationArr.join(",");
  }
  saveOrderPackJustification() {
    if (this.selectedOrderPackIds != "") {

      this.selectedOrderPackIds.split(',').forEach((element: any, index: any) => {
        if (this.selectedopJustificationIds.split(',').length > 1) {
          this.selectedopJustificationIds.split(',').forEach(ele => {
            this.selectedOrderPacksJustification.push({
              ORDERPACKID: element[index], ORPJUSTID: ele[index]

            });
          });
        }
        else {
          this.selectedOrderPacksJustification.push({
            ORDERPACKID: element[index], ORPJUSTID: this.selectedopJustificationIds[0]

          });
        }
      })
      let savejustpayload = {
        "PatientOrderPackRejectedID": 0,
        "PatientID": this.PatientId,
        "Admissionid": this.selectedPatientAdmissionId,
        "DoctorID": this.doctorDetails[0].EmpId,
        "OrderPackIDs": this.selectedOrderPacksJustification,
        "UserId": this.doctorDetails[0].UserId
      }
      this.config.savePatientOrderPackRejected(savejustpayload).subscribe(
        (response) => {
          if (response.Code == 200) {
            $("#orderPacks").modal('hide');

          } else {

          }
        },
        (err) => {
          console.log(err)
        });
    }
    else {
      this.orderPacksSelected = false;
      this.errorMessages = "Please select Order Packs and Justification";
      $("#errorMsg").modal('show');
    }
  }
  selectedOrderPackItem(orderPackClass: any) {
    if (orderPackClass.Class == "p-3 rounded-2 suggested_order  h-100 d-flex flex-column align-items-center justify-content-between") {
      orderPackClass.Class = "p-3 rounded-2 suggested_order  h-100 d-flex flex-column align-items-center justify-content-between active";
      orderPackClass.Selected = true; this.orderPacksSelected = true;
      if (this.selectedOrderPackIds != "")
        this.selectedOrderPackIds = this.selectedOrderPackIds + "," + orderPackClass.OrderPackID;
      else
        this.selectedOrderPackIds = orderPackClass.OrderPackID;
    }
    else {
      orderPackClass.Class = "p-3 rounded-2 suggested_order  h-100 d-flex flex-column align-items-center justify-content-between";
      orderPackClass.Selected = false;
      if (this.selectedOrderPackIds.split(',').length > 1) {
        this.selectedOrderPackIds.split(',').forEach((element, index) => {
          this.selectedOrderPackIds.split(',').splice(index, 1);
        });
      }
      else {
        this.selectedOrderPackIds = ""; this.orderPacksSelected = false;
      }
    }
  }
  FetchPrescriptionInfo() {
    var admId = this.selectedCard.AdmissionID;
    this.isProceduresAll = false;
    this.isInvesigationsAll = false;
    if (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4')
      admId = this.selectedCard.IPID;
    this.config.FetchPrescriptionInfo(this.patientType, this.selectedCard.EpisodeID, admId, this.selectedCard.PatientID, this.hospitalId, this.doctorDetails[0].EmpId, this.DischargeMedication)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.savedDrugPrescriptions = response.objPatientPrescriptionDataList;
          this.savedInvPrescriptions = response.objPatientPrescriptionInvDataList;
          this.savedProcPrescriptions = response.objPatientPrescriptionProcDataList;
          this.savedMonitorId = response.objPatientPrescriptionList[0]?.MonitorID;
          this.savedDrugPrescriptionId = response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Medication').length > 0 ? response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Medication')[0].PrescID : 0;
          this.savedInvPrescriptionId = response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Investigation').length > 0 ? response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Investigation')[0].PrescID : 0;
          this.savedProcPrescriptionId = response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Procedure').length > 0 ? response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Procedure')[0].PrescID : 0;
          if (this.savedInvPrescriptions.length > 0) {
            this.showInvListdiv = true;
            this.entryId = this.savedInvPrescriptions[0].EntryID === "" ? 0 : this.savedInvPrescriptions[0].EntryID;
            this.savedInvPrescriptions.forEach((element: any, index: any) => {
              if (element.Status >= 1) {
                this.disableDelete = true;
                element.disableDelete = true;
              } else {
                this.disableDelete = false;
                element.disableDelete = false;
              }
              if (element.SPEID === "214") {
                this.IsCTScan = true;
                this.SpecialiseID = element.SPEID;
              }

              if (element.SPEID === "217") {
                this.IsMRI = true;
                this.SpecialiseID = element.SPEID;
              }

              if (this.IsMRI & this.IsCTScan) {
                this.SpecialiseID = 0;
              }

              this.investigationsList.push({
                ID: this.investigationsList.length + 1, SOrN: element.OTYID === "15" ? 'S' : 'N', Name: element.Procedure, Specialisation: element.Specialization, Quantity: element.QTY,
                ServiceItemId: element.PID, SpecialisationId: element.SPEID, ServiceTypeId: 3,
                SpecimenId: element.SPID, Remarks: element.REM, IsFav: element.IsFav, Status: Number(element.Status), disableDelete: element.disableDelete,
                TATRemarks: element.TATRemarks, ResultStatus: element.ResultStatus, ItemPrice: this.selectedCard.BillType === 'Insured' ? element.CompanyPrice : element.BasePrice,
                DISID: element.DiseaseID,
                DEPARTMENTID: element.DepartmentId
              });
            });
          }
          if (this.savedProcPrescriptions.length > 0) {
            this.showProcListdiv = true;
            this.entryId = this.savedProcPrescriptions[0].EntryID === "" ? 0 : this.savedProcPrescriptions[0].EntryID;
            this.savedProcPrescriptions.forEach((element: any, index: any) => {
              if (element.Status >= 1) {
                this.disableDelete = true;
                element.disableDelete = true;
              } else {
                this.disableDelete = false;
                element.disableDelete = false;
              }
              this.proceduresList.push({
                ID: this.proceduresList.length + 1, SOrN: element.OTYID === "15" ? 'S' : 'N', Name: element.Procedure, Specialisation: element.Specialization, Quantity: element.QTY,
                ServiceItemId: element.PID, SpecialisationId: element.SPEID, ServiceTypeId: 5,
                SpecimenId: element.SPEID, Remarks: element.REM, IsFav: element.IsFav, Status: Number(element.Status), disableDelete: element.disableDelete, TATRemarks: '',
                ResultStatus: element.ResultStatus, ItemPrice: this.selectedCard.BillType === 'Insured' ? element.CompanyPrice : element.BasePrice,
                DISID: element.DiseaseID,
                DEPARTMENTID: element.DepartmentId
              });
            })
          }
          if (this.savedDrugPrescriptions.length > 0) {
            this.entryId = this.savedDrugPrescriptions[0].EntryID === "" ? 0 : this.savedDrugPrescriptions[0].EntryID;
            this.savedDrugPrescriptions.forEach((element: any, index: any) => {
              this.selectedItemsList.push({
                SlNo: this.selectedItemsList.length + 1,
                Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
                ClassSelected: false,
                ItemId: element.PrescribedItemID,
                ItemCode: element.ItemCode,
                ItemName: element.DRUGNAME,
                StrengthUoMID: element.QtyUomID,
                Strength: element.ActItemStrength + " " + element.QtyUom,
                StrengthUoM: element.QtyUom,
                Dosage: element.DOS + " " + element.DOSE, //response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
                DosageId: element.DOID,
                AdmRouteId: element.ARI,
                Route: element.AdmRoute,
                FrequencyId: element.FID,
                Frequency: element.Frequency,
                ScheduleStartDate: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                StartFrom: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                DurationId: element.DUID,
                Duration: element.DUR,
                DurationValue: element.DUR.split(' ')[0],
                PresInstr: element.PatientInstructions == 'select' ? "" : element.PatientInstructions,//item.PresInstr,
                Quantity: element.FQTY,
                QuantityUOMId: element.QtyUomID,
                PresType: "",//item.PresType,
                PRNType: element.PRNREASON,//item.PRNType,
                GenericId: element.PrescribedGenericItemID,
                //DefaultUOMID: element.QtyUomID,
                DefaultUOMID: element.IssuedQtyUOMName,
                medInstructionId: "",//item.medInstructionId,
                PRNReason: "",//item.PRNReason,
                IssueUoM: element.FQTYUOM,
                IssueUOMID: element.IssuedQtyUOMName,
                IssueUOMValue: element.Qty,
                IssueTypeUOM: element.QtyUomID,
                Remarks: element.REM,
                IsFav: element.IsFav,
                DiseaseID: element.DiseaseID,
                DiagnosisId: element.DiseaseID,
                DISID: element.DiseaseID,
                ScheduleEndDate: element.EDT,
                ScheduleTime: element.STM,
                PrescriptionItemStatusNew: element.PrescriptionItemStatusNew,
                PrescriptionID: element.PrescriptionID,
                HoldStatus: element.HoldStatus,
                ReasonForHolding: element.ReasonForHolding,
                PrescriptionItemsHoldReasonID: element.PrescriptionItemsHoldReasonID,
                PrescriptionItemsHoldReason: element.ReasonForHolding,
                HoldDate: element.HoldDate,
                lexicomAlertIcon: '',
                CustomizedDosage: element.CD != '' ? this.setTapringDosage(element.CD) : '',
                QOH: '',
                viewMore: false,
                IsAntibiotic: element.IsAntibiotic,
                IsAntibioticForm: element.IsAntibioticForm,
                PrescribedQty: element.PrescribedQty,
                AntiMicrobialOrderSheet: element.AntiMicrobialOrderSheet,
                DiagnosisName: element.DiseaseName
              });
              const med = this.selectedItemsList.find((x: any) => x.ItemId === element.PrescribedItemID)
              if (med.Remarks != '') {
                this.maximizeSelectedDrugItems(med);
              }
            });
            const antibitotictemplate = this.selectedItemsList.filter((x: any) => x?.AntiMicrobialOrderSheet !== null && x?.AntiMicrobialOrderSheet !== "");
            if (antibitotictemplate.length > 0) {
              this.antibioticTemplateValue = antibitotictemplate[0].AntiMicrobialOrderSheet;
            }
            //this.LexicomAlert();
          }
        }
        this.createGaugeChart();
        this.showSpeedMeterPopUp();
      })
  }

  private setTapringDosage(cd: any) {
    var cd = JSON.parse(cd);
    var doses =
    {
      "NoOfDays": cd.NoOfDays,
      "IsSliding": cd.IsSliding,
      "SDays": cd.SDays,
      "ObjTaperData": [
        {
          "DrugID": parseInt(cd.ObjTaperData[0].DrugID),
          "DrugName": cd.ObjTaperData[0].DrugName,
          "Day": cd.ObjTaperData[0].Day,
          "Checked": cd.ObjTaperData[0].Checked,
          "Strength": cd.ObjTaperData[0].Strength,
          "StrengthUOM": cd.ObjTaperData[0].StrengthUOM,
          "Dose": cd.ObjTaperData[0].Dose,
          "DoseUOM": cd.ObjTaperData[0].DoseUOM,
          "Frequency": cd.ObjTaperData[0].Frequency,
          "FrequencyID": parseInt(cd.ObjTaperData[0].FrequencyID),
          "CustomizedSchedule": cd.ObjTaperData[0].CustomizedSchedule,
          "CustomizedQty": cd.ObjTaperData[0].CustomizedQty,
          "CustomizedDays": cd.ObjTaperData[0].CustomizedDays,
          "StartFrom": cd.ObjTaperData[0].StartFrom,
          "TotalQty": cd.ObjTaperData[0].TotalQty,
          "CustomizedRemarks": cd.ObjTaperData[0].CustomizedRemarks,
          "TotalCustQty": cd.ObjTaperData[0].TotalCustQty,
          "ListSatrtDate": [],
          "FrequencyQty": cd.ObjTaperData[0].FrequencyQty,
          "SCIT": cd.ObjTaperData[0].SCIT
        }
      ],
      "IsDosEdit": cd.IsDosEdit,
      "InterVal": cd.InterVal
    }
    return JSON.stringify(doses);
  }

  MapDiagnosisMedication(pbm: string) {
    if (pbm === 'false') {
      this.isMappingAll = false;
      $("#mapDiagnosisMedicationdiv").modal('show');
    }
    //this.getPatientDiagnosis();
  }
  getPatientDiagnosis() {
    this.config.FetchVisitDiagnosis(this.selectedPatientAdmissionId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.visitDiagnosis = response.GetVisitDiagnosisList.sort((a: any, b: any) => a.DiseaseName.localeCompare(b.DiseaseName));;
        }
      })
  }
  /**
   * @description here function for searching favourite Investigations
   */
  searchTerm: any;
  filteredItems: any[] | undefined;

  maximizeSelectedDrugItems(med: any) {
    med.vireMore = true;
    // let find = this.selectedItemsList.find((x: any) => x?.ItemId === med.ItemId);
    // if (find) {
    //   const index = this.selectedItemsList.indexOf(find, 0);
    //   if (index > -1) {
    //     if (find.ClassSelected) {
    //       find.ClassSelected = false;
    //       find.Class = "row card_item_div mx-0 gx-2 w-100 align-items-center";
    //     }
    //     else {
    //       find.Class = "row card_item_div mx-0 gx-2 w-100 align-items-center maxim";
    //       find.ClassSelected = true;
    //     }
    //   }
    // }
    // var text = document.getElementById("viewMore_toggle_a");
    // if (text?.innerHTML === "View More") {
    //   $('#viewMore_toggle_a').html('View Less')
    // }
    // else {
    //   $('#viewMore_toggle_a').html('View More')
    // }
  }
  searchReset() {
    this.searchTerm = '';
    this.groupedDataArray = this.groupedDataFilter;
    this.clearFavInvestigations();
  }
  searchMedicationReset() {
    this.searchMediTerm = '';
    this.groupedDataMedicArray = this.groupedMedicationFilter;
    this.clearFavMedications();
  }
  ClearPrescriptionsSelected() {
    this.proceduresList = [];
    this.showProcListdiv = false;
    this.isProceduresAll = false;
    this.investigationsList = [];
    this.showInvListdiv = false;
    this.isInvesigationsAll = false;
    this.selectedItemsList = [];
    //this.medicationsForm.reset();
    this.ClearMedicationForm();
    $("#invprocSmartSearch").val('');
    if (this.patientType != '2' && this.patientType != '4')
      this.FetchPrescriptionInfo();
    this.selectedIPPrescription = [];
    this.createGaugeChart();
    this.selectedIvMedicationForBaseSolution = [];
    this.isBaseSolutionAdding = false;
    this.procedureSchedules = [];
    this.multipleOrderSchedules = [];
    this.multipleOrderPayload = [];
    this.selectall = false;
  }

  openInvRemarksPopup(index: any) {
    this.isInvSub = true;
    this.remarksForSelectedInvName = index.Name;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedInvId = index.ServiceItemId;
    const remarks = index.Remarks;//this.recordRemarks.get(index) || '';
    this.investigationsForm.get('Remarks')?.setValue(remarks);
    $("#investigation_remark").modal('show');
    // this.investigationsForm.reset();
    this.isInvSub = false;
  }
  openProvRemarksPopup(index: any) {
    this.remarksForSelectedProcName = index.Name;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedProcId = index.ServiceItemId || index.ServiceItemID;
    const remarks = index.Remarks;//this.recordRemarks.get(index) || '';
    this.proceduresForm.get('Remarks')?.setValue(remarks);
    setTimeout(() => {
      $('#procedure_remark').modal('show');
    }, 100);
  }

  investigationRemarksSave() {
    this.isInvSub = true;
    const remark = this.investigationsForm.get('Remarks')?.value || '';
    if (remark) {
      this.remarksSelectedIndex.Remarks = remark;
      $("#investigation_remark").modal('hide');
      this.isInvSub = false;
    }
  }

  investigationRemarks(invId: any) {
    this.isInvSub = true;
    const remark = this.investigationsForm.get('Remarks')?.value || '';
    // this.remarksMap.set(this.remarksSelectedIndex, remark);
    // this.recordRemarks.set(this.remarksSelectedIndex, remark);
    let findInv = this.investigationsList.find((x: any) => x?.ServiceItemId === invId);
    if (findInv) {
      const index = this.investigationsList.indexOf(findInv, 0);
      if (index > -1) {
        findInv.ID = findInv.ID
        findInv.SOrN = findInv.SOrN;
        findInv.Name = findInv.Name;
        findInv.Specialisation = findInv.Specialisation;
        findInv.Quantity = findInv.Quantity,
          findInv.ServiceItemId = findInv.ServiceItemId;
        findInv.SpecialisationId = findInv.SpecialisationId;
        findInv.ServiceTypeId = findInv.ServiceTypeId;
        findInv.SpecimenId = findInv.SpecimenId;
        findInv.Remarks = remark;
        this.investigationsList[index] = findInv;
      }
    }
    if (remark == '')
      $("#investigation_remark").modal('show');
    else
      $("#investigation_remark").modal('hide');
  }
  procedureRemarks(proc: any, procid: any) {
    this.isProSub = true;
    const remark = this.proceduresForm.get('Remarks')?.value || '';
    if (remark) {
      $("#procedure_remark").modal('hide');
      this.isProSub = false;
    } else {
      return;
    }
    // this.remarksMap.set(this.remarksSelectedIndex, remark);
    // this.recordRemarks.set(this.remarksSelectedIndex, remark);
    let findProc = this.proceduresList.find((x: any) => x?.ServiceItemId === procid);
    if (findProc) {
      const index = this.proceduresList.indexOf(findProc, 0);
      if (index > -1) {
        findProc.ID = findProc.ID
        findProc.SOrN = findProc.SOrN;
        findProc.Name = findProc.Name;
        findProc.Specialisation = findProc.Specialisation;
        findProc.Quantity = findProc.Quantity,
          findProc.ServiceItemId = findProc.ServiceItemId;
        findProc.SpecialisationId = findProc.SpecialisationId;
        findProc.ServiceTypeId = findProc.ServiceTypeId;
        findProc.Remarks = remark;
        this.proceduresList[index] = findProc;
      }
    }
  }

  saveFavouriteProcedure(proc: any, type: any) {
    if (proc.IsFav == 1) proc.IsFav = 3; else proc.IsFav = 1;
    if (type == "5") {
      this.favProc.push({
        "PID": proc.ServiceItemId, "PROCEDURE": proc.Name, "QTY": 1, "SID": "5", "ISQ": 0, "REM": "test"
      })
    }
    if (type == "3") {
      this.favInv.push({
        "PID": proc.ServiceItemId, "SID": "3", "QTY": "1", "ISQ": 0, "SPID": proc.SpecimenId, "REM": "testtttt", "STID": proc.ServiceTypeId,
        "OTYID": "13",  //ItemOrderTypeID
        "SPEID": proc.SpecialisationId
      })
    }
    let payload = {
      "EmpID": this.doctorDetails[0].EmpId,
      "SpecilizationID": this.doctorDetails[0].EmpSpecialisationId,
      "ActionType": proc.IsFav.toString(),
      "PDetails": this.favProc,
      "IDetails": this.favInv,
      "DDetails": [],
      "DADetails": []
    }
    this.config.saveFavouriteProcedure(payload).subscribe(
      (response) => {
        if (response.Code == 200) {

        }
      },
      (err) => {
        console.log(err)
      });
    this.favProc = []; this.favInv = [];
  }
  toggleAccordion(prescriptiondate: any) {
    prescriptiondate.isExpanded = !prescriptiondate.isExpanded;
  }
  toggleShowMore(view: any) {
    view.expanded = !view.expanded;
  }
  ClearPrescriptionItems() {
    //this.medicationsForm.reset();
    this.ClearMedicationForm();
    this.itemSelected = "false";
    this.AdmRoutesList = cloneDeep(this.AdmRoutesListMaster);
    this.filteredAdmRoutesList = cloneDeep(this.AdmRoutesListMaster);
    this.searchRouteTerm = '';
  }
  decline() {
    this.ClearPrescriptionItems();
    $("#prescriptionValidationMsgModalYesNo").modal('hide');
  }

  accept() {
    this.itemSelected = "true";
    this.AdmRoutesList = this.tempprescriptionSelected.ItemRouteDataList;
    this.filteredAdmRoutesList = cloneDeep(this.AdmRoutesList);
    this.searchRouteTerm = '';
    this.medicationsForm.patchValue({
      ItemId: this.tempprescriptionSelected.ItemDataList[0].ItemID,
      ItemCode: this.tempprescriptionSelected.ItemDataList[0].ItemCode,
      ItemName: this.tempprescriptionSelected.ItemDataList[0].DisplayName,
      DosageId: this.tempprescriptionSelected.ItemDataList[0].QtyUomID,
      Dosage: this.tempprescriptionSelected.ItemDataList[0].QTYUOM,
      Strength: this.tempprescriptionSelected.ItemDataList[0].Strength,
      StrengthUoMID: this.tempprescriptionSelected.ItemDataList[0].StrengthUoMID,
      StrengthUoM: this.tempprescriptionSelected.ItemDataList[0].StrengthUoM,
      IssueUOMValue: this.tempprescriptionSelected.ItemDataList[0].Quantity,
      IssueUoM: this.tempprescriptionSelected.ItemDataList[0].QTYUOM,
      IssueUOMID: this.tempprescriptionSelected.ItemDataList[0].IssueUOMID,
      ScheduleStartDate: this.prescriptionValidationMsgEnddate,
      DefaultUOMID: this.tempprescriptionSelected.ItemDataList[0].OPDefaultUomID,
      IssueTypeUOM: this.tempprescriptionSelected.ItemPackageDataList[0].FromUoMID,
      QuantityUOMId: this.tempprescriptionSelected.ItemPackageDataList[0].FromUoMID,
      QuantityUOM: this.tempprescriptionSelected.ItemPackageDataList[0].FromUoM,
      GenericId: this.tempprescriptionSelected.ItemGenericsDataList[0].GenericID,
      DurationId: "3",
      Duration: "Days",
      DurationValue: "1",
      AdmRouteId: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteID : "",
      AdmRoute: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteName : "",
      IsFav: this.tempprescriptionSelected.ItemDataList[0].IsFav,
      QOH: (this.patientType == "2" || this.patientType == "4") ? this.tempprescriptionSelected.ItemDefaultUOMDataList[0].IPQOH : this.tempprescriptionSelected.ItemDefaultUOMDataList[0].OPQOH,
      IVFluidStorageCondition: this.tempprescriptionSelected.ItemDataList[0].IVFluidStorageCondition,
      Remarks: '',
      IsAntibiotic: this.tempprescriptionSelected.ItemDataList[0].IsAntibiotic,
      IsAntibioticForm: this.tempprescriptionSelected.ItemDataList[0].IsAntibioticForm,
      PrescribedQty: this.tempprescriptionSelected.ItemDataList[0].PrescribedQty,
      IsHighValueDrug: this.tempprescriptionSelected.ItemDataList[0].IsHighValueDrug
    })
    $('#StrengthUoM').html(this.tempprescriptionSelected.ItemDataList[0].StrengthUoM);
    $('#IssueUoM').html(this.tempprescriptionSelected.ItemDataList[0].QTYUOM);
    this.listOfItems = []; this.tempprescriptionSelected = []; this.prescriptionValidationMsgEnddate = "";
  }

  saveDiagnosisMapping() {
    $("#mapDiagnosisMedicationdiv").modal('hide');
  }
  onDiagnosisSelected(event: any, med: any) {
    let find = this.selectedItemsList.find((x: any) => x?.ItemId === med.ItemId.toString());
    if (find) {
      const index = this.selectedItemsList.indexOf(find, 0);
      if (index > -1) {
        find.DISID = event.target.value;
        find.DiagnosisId = event.target.value;
        find.DiagnosisName = event.target.options[event.target.options.selectedIndex].text;
        this.selectedItemsList[index] = find;
      }
      this.isEditmode = false;
    }
  }
  fetchSubstituteItems(itemid: any) {
    if (itemid !== '') {
      this.config.FetchSubstituteItems(itemid, this.hospitalId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.substituteItems = response.FetchSubstituteItemsDataaList;
            $("#modalSubstituteItems").modal('show');

          }
        })
    }
    else {
      this.errorMessages = [];
      this.errorMessages.push("Please select any Drug to show substitutes");
      $("#errorMsg").modal('show');
    }
  }

  selectSubstituteItem(sub: any) {
    this.substituteItems.forEach((element: any, index: any) => {
      if (element.ItemID === sub.ItemID && element.GenericId === sub.GenericId) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.showSubstituteSelectValidationMsg = false;
  }

  loadSubstituteItem() {
    const selectedSubsItem = this.substituteItems.find((x: any) => x.selected);
    this.onItemSelected(selectedSubsItem);
    $("#modalSubstituteItems").modal('hide');
  }

  getLabReports() {
    this.selectedInvestigations = [];
    this.config.fetchInvestigationOrders(this.hospitalId, this.doctorDetails[0].EmpId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          let lab = response.FetchInvestigationOrdersDataaList.filter((x: any) => x?.ServiceName.toString().toUpperCase() === "LABORATORY");

          this.treeviewItems = this.createTreeItems(lab);
        }
      })
  }

  onSelectedChange(value: any): void {
    this.selectedInvestigations = value;
  }

  onFilterChange(value: string): void {
  }

  selectChildren(i: TreeviewItem) {
    i.collapsed = false;
    if (i.children) {
      this.selectInsideChildren(i);
      i.checked = !i.checked;
    }
    this.trvComponent.raiseSelectedChange();
  }
  selectInsideChildren(item: any) {
    item.children.forEach((i: any) => {
      i.checked = !i.checked;
      if (i.children) {
        this.selectInsideChildren(i);
      }
    });
  }

  createTreeItems(data: any[]): TreeviewItem[] {
    const topLevelItems: TreeviewItem[] = [];

    const groupedBySubSection = this.groupBy(data, 'SubSectionName');

    for (const subsectionKey in groupedBySubSection) {
      if (groupedBySubSection.hasOwnProperty(subsectionKey)) {
        const subsectionItem = new TreeviewItem({
          text: subsectionKey,
          value: subsectionKey,
          collapsed: true,
          checked: false,
          children: [{ text: '0', value: 0 }]
        });

        const groupedByChapter = this.groupBy(
          groupedBySubSection[subsectionKey],
          'ChapterName'
        );

        for (const chapterKey in groupedByChapter) {
          if (groupedByChapter.hasOwnProperty(chapterKey)) {
            const chapterItem = new TreeviewItem({
              text: chapterKey,
              value: chapterKey,
              checked: false,
              collapsed: true,
              children: [{ text: '0', value: 0 }]
            });

            const items = groupedByChapter[chapterKey];
            items.forEach((item: any) => {
              const itemItem = new TreeviewItem({
                text: item.ItemName,
                collapsed: true,
                checked: false,
                value: item.ItemName
              });

              chapterItem.children.push(itemItem);
            });
            chapterItem.children = chapterItem.children.filter(
              (child: TreeviewItem) => child.text !== '0'
            );
            subsectionItem.children.push(chapterItem);
          }
        }
        subsectionItem.children = subsectionItem.children.filter(
          (child: TreeviewItem) => child.text !== '0'
        );
        topLevelItems?.push(subsectionItem);
      }
    }

    return topLevelItems;
  }

  groupBy(list: any[], key: string): { [key: string]: any[] } {
    return list.reduce((acc, obj) => {
      const groupKey = obj[key];
      acc[groupKey] = acc[groupKey] || [];
      acc[groupKey].push(obj);
      return acc;
    }, {});
  }

  onCollapseExpand(item: TreeviewItem): void {
    item.collapsed = !item.collapsed;
  }

  saveFavouriteMedications() {
    this.isMedicationFormSubmitted = true;
    this.medicationsForm.patchValue({
      DiagnosisId: '0'
    });
    if (this.medicationsForm.valid) {
      if (this.medicationsForm.get('IsFav')?.value == 1) {
        this.medicationsForm.patchValue({
          IsFav: 3
        });
      }
      else {
        this.medicationsForm.patchValue({
          IsFav: 1
        });
      }
      this.favMed.push({
        "SEQ": 1,
        "ITM": this.medicationsForm.get('ItemId')?.value,
        "DOS": this.medicationsForm.get('IssueUOMValue')?.value,
        "DOID": this.medicationsForm.get('DosageId')?.value,
        "FID": this.medicationsForm.get('FrequencyId')?.value,
        "DUR": this.medicationsForm.get('DurationValue')?.value,
        "ARI": this.medicationsForm.get('AdmRouteId')?.value,
        "DUID": this.medicationsForm.get('DurationId')?.value,
        "SFRM": new Date(),
        "REM": this.medicationsForm.get('Remarks')?.value,
        "JUST": "",
        "REM2L": "",
        "STM": new Date(),
        "FQTY": this.medicationsForm.get('IssueUOMID')?.value,
        "QTY": this.medicationsForm.get('Quantity')?.value,
        "QTYUOMID": this.medicationsForm.get('DosageId')?.value,
        "PIID": 0,
      })

      let payload = {
        "EmpID": this.doctorDetails[0].EmpId,
        "SpecilizationID": this.doctorDetails[0].EmpSpecialisationId,
        "ActionType": this.medicationsForm.get('IsFav')?.value,
        "PDetails": [],
        "IDetails": [],
        "DDetails": this.favMed,
        "DADetails": []
      }
      this.config.saveFavouriteProcedure(payload).subscribe(
        (response) => {
          if (response.Code == 200) {
            this.isMedicationFormSubmitted = false;
            this.medicationsForm.patchValue({
              DiagnosisId: ''
            });
          }
        },
        (err) => {
          console.log(err)
        });
      this.favMed = [];
    }
  }
  onDischargeMedication1(event: any) {
    this.DischargeMedication = event.target.checked;
    if (this.selectedItemsList.length > 0) {
      $("#dischargeMedicationYesNo").modal('show');
    }
  }
  onDischargeMedication() {
    this.selectall = !this.selectall;
    if (this.selectall)
      this.DischargeMedication = true;
    else
      this.DischargeMedication = false;
    //this.DischargeMedication = event.target.checked;
    if (this.selectedItemsList.length > 0) {
      $("#dischargeMedicationYesNo").modal('show');
    }
  }

  fetchRefillMedications() {
    this.config.fetchRefill(this.PatientId, this.selectedCard.PatientType, this.selectedCard.EpisodeID, 0, this.selectedPatientAdmissionId, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalId, this.DischargeMedication).subscribe(
      (response) => {
        if (response.Code == 200) {
          if (response.objPatientPrescriptionDataList.length > 0) {
            response.objPatientPrescriptionDataList.forEach((element: any, index: any) => {
              this.selectedItemsList.push({
                SlNo: this.selectedItemsList.length + 1,
                Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
                ClassSelected: false,
                ItemId: element.ItemID,
                ItemCode: element.ItemCode,
                ItemName: element.DRUGNAME,
                StrengthUoMID: element.QtyUomID,
                Strength: element.ActItemStrength + " " + element.QtyUom,
                StrengthUoM: element.QtyUom,
                Dosage: element.DOS + " " + element.DOSE, //response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
                DosageId: element.DOID,
                AdmRouteId: element.ARI,
                Route: element.AdmRoute,
                FrequencyId: element.FID,
                Frequency: element.Frequency,
                ScheduleStartDate: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                StartFrom: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                DurationId: element.DUID,
                Duration: element.DUR,
                DurationValue: element.DUR.split(' '),
                PresInstr: "",//item.PresInstr,
                Quantity: element.Qty,
                QuantityUOMId: element.QtyUomID,
                PresType: "",//item.PresType,
                PRNType: element.PRNREASON,//item.PRNType,
                GenericId: element.PrescribedGenericItemID,
                DefaultUOMID: element.QtyUomID,
                medInstructionId: "",//item.medInstructionId,
                PRNReason: "",//item.PRNReason,
                IssueUoM: element.QtyUom,
                IssueUOMID: element.IssuedQtyUOMName,
                IssueUOMValue: element.Qty,
                IssueTypeUOM: element.QtyUomID,
                Remarks: element.REM,
                IsFav: element.IsFav,
                DiseaseID: element.DiseaseID,
                DISID: element.DiseaseID,
                lexicomAlertIcon: '',
                viewMore: false,
                IsAntibiotic: element.IsAntibiotic,
                IsAntibioticForm: element.IsAntibioticForm,
                PrescribedQty: element.PrescribedQty
              });
            });
          }
          $("#noRefillMedication").modal('show');
        }
        this.createGaugeChart();
      },
      (err) => {
        console.log(err)
      });
  }

  fetchDiagnosisForMRIForm() {
    this.config.fetchAdviceDiagnosis(this.selectedPatientAdmissionId, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          var diag = "";
          response.PatientDiagnosisDataList.forEach((element: any, index: any) => {
            if (diag != "")
              diag = diag + "\n" + response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
            else
              diag = response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
          });
          this.radForm.get('Diagnosis')?.setValue(diag);
        }
      },
        (err) => {

        })
  }

  fetchRadiologyRequestSafetyChecklists() {
    this.IsMRIClick = 0;
    this.config.fetchPatientRadiologyRequestForms(this.savedInvPrescriptionId, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatientRadiologyRequestFDataList.length > 0) {
            this.fetchDiagnosisForMRIForm();
            this.IsMRIClick = 1;
            $("#refill_modal").modal('show');
            var radData = response.FetchPatientRadiologyRequestFDataList[0];
            var checkList = response.FetchPatientRadiologySafetyChecklistFDataList;

            this.selectedOption = radData.IsPregnant === 0 ? "No" : radData.IsPregnant === 1 ? "Yes" : radData.IsPregnant === 2 ? "Unsure" : "Check";
            this.selectedPaediatricOption = radData.IsPaediatricSpecialNeed ? "Yes" : "No";
            this.selectedSpecialOption = radData.SpecialNeed ? "Yes" : "No";
            this.selectedSedationOption = radData.IsSedationRequired ? "Yes" : "No";
            this.selectedContrastOption = radData.IsContrastRequired ? "Yes" : "No";
            this.selectedPreviousOption = radData.IsPreviousRadiologyStudy ? "Yes" : "No";
            this.patientRadiologyRequestId = radData.PatientRadiologyRequestId;

            this.radForm.patchValue({
              LMPDate: new Date(radData.LMPDate),
              IsNormalKidneyFunction: radData.IsNormalKidneyFunction,
              IsChronicRenalImpairment: radData.IsChronicRenalImpairment,
              IsAcuteKidneyInjury: radData.IsAcuteKidneyInjury,
              IsHaemodialysis: radData.IsHaemoDialysis,
              SerumCreatinineLevel: radData.LastSerumCreatinineLevel,
              ActiveIssues: radData.BriefClinicalHistory,
              QAndA: radData.ClinicalQuestion
            });

            this.radiologyRequestDataList = [];
            checkList.forEach((element: any, index: any) => {
              let chk = {
                "SafetyChecklistId": element.SafetyChecklistId,
                "SpecialiseID": element.SpecialiseID,
                "Specialisation": element.Specialisation,
                "SafetyChecklistName": element.SafetyChecklistName,
                "SafetyChecklistName2L": element.SafetyChecklistName2L,
                "selectedValue": element.IsSafety
              }
              this.radiologyRequestDataList.push(chk);
            });

          }
          else {
            if (!this.savedInvPrescriptionId) {
              this.errorMessages = "Please save the Prescription to check MRI Form";
              $("#errorMsg").modal('show');
              return;
            }
          }
        }
      })


  }

  LoadCheckList() {
    this.fetchDiagnosisForMRIForm();
    $("#refill_modal").modal('show');
    this.config.fetchRadiologyRequestSafetyChecklists(this.SpecialiseID, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.radiologyRequestDataList = response.FetchRadiologyRequestDataList;
          this.radiologyRequestDataList.forEach((element: any, index: any) => {
            element.selectedValue = false;
          });
        }
      })
  }

  onToggleClick(index: number, value: boolean): void {
    // Update the corresponding item in the array based on the index and value
    this.radiologyRequestDataList[index].selectedValue = value;
  }
  closeRadiologyForm() {
    $("#refill_modal").modal('hide');
  }

  clearRad() {
    this.radForm.patchValue({
      LMPDate: '',
      IsNormalKidneyFunction: false,
      IsChronicRenalImpairment: false,
      IsAcuteKidneyInjury: false,
      IsHaemodialysis: false,
      SerumCreatinineLevel: '',
      ActiveIssues: '',
      QAndA: ''
    });

    if (this.selectedCard.IsPregnancy) {
      this.selectOption("Yes");
    }
    else {
      this.selectOption("No");
    }

    this.selectContrastOption("No");
    this.selectPaediatricOption("No");
    this.selectSpecialOption("No");
    this.selectSedationOption("No");
    this.selectPreviousOption("No");

    this.radiologyRequestDataList.forEach((element: any, index: any) => {
      element.selectedValue = false;
    });
  }

  CloseRad() {
    if (this.IsMRIClick == 1) {
      $("#refill_modal").modal('hide');
    }
    else {
      this.errorMessages = "Please fill the form to save the Prescription";
      $("#errorMsg").modal('show');
    }
  }

  saveRad() {

    var radList: any = [];
    this.radiologyRequestDataList.forEach((element: any, index: any) => {
      let rad = {
        "SPID": this.SpecialiseID,
        "SCHKID": element.SafetyChecklistId,
        "ISSTY": element.selectedValue ? 1 : 0
      }
      radList.push(rad);
    });

    let payload = {
      "PatientRadiologyRequestId": this.patientRadiologyRequestId,
      "Patientid": this.PatientId,
      "AdmissionId": this.selectedPatientAdmissionId,
      "PrescriptionID": this.savedInvPrescriptionId,
      "IsPregnant": this.selectedOption === "No" ? 0 : this.selectedOption === "Yes" ? 1 : this.selectedOption === "Unsure" ? 2 : 3,
      "LMPDate": this.datepipe.transform(this.radForm.get('LMPDate')?.value, "dd-MMM-yyyy")?.toString(),
      "IsPaediatricSpecialNeed": this.selectedPaediatricOption === "Yes" ? 1 : 0,
      "SpecialNeed": this.selectedSpecialOption === "Yes" ? 1 : 0,
      "IsSedationRequired": this.selectedSedationOption === "Yes" ? 1 : 0,
      "IsContrastRequired": this.selectedContrastOption === "Yes" ? 1 : 0,
      "IsNormalKidneyFunction": this.radForm.get('IsNormalKidneyFunction')?.value ? 1 : 0,
      "IsChronicRenalImpairment": this.radForm.get('IsChronicRenalImpairment')?.value ? 1 : 0,
      "IsAcuteKidneyInjury": this.radForm.get('IsAcuteKidneyInjury')?.value ? 1 : 0,
      "IsHaemoDialysis": this.radForm.get('IsHaemodialysis')?.value ? 1 : 0,
      "LastSerumCreatinineLevel": this.radForm.get('SerumCreatinineLevel')?.value,
      "IsPreviousRadiologyStudy": this.selectedPreviousOption === "Yes" ? 1 : 0,
      "BriefClinicalHistory": this.radForm.get('ActiveIssues')?.value,
      "ClinicalQuestion": this.radForm.get('QAndA')?.value,
      "SafetyCheckList": radList,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, //this.patientType == '2' ? this.facility.FacilityID : 0
    }
    $("#refill_modal").modal('hide');
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.config.savePatientRadiologyRequestForms(payload).subscribe(
          (response) => {
            if (response.Code == 200) {
              if (this.IsMRIClick == 0) {
                this.patientRadiologyRequestIdForMapping = response.PatientRadiologyRequestId;
                this.config.saveAllPrescription(this.prescriptionSaveData).subscribe(
                  (response) => {
                    if (response.Code == 200) {
                      this.InvPrescriptionIDForMapping = response.InvPrescriptionID;

                      this.config.updatePatientRadiologyRequestForms(this.patientRadiologyRequestIdForMapping, this.InvPrescriptionIDForMapping, this.hospitalId)
                        .subscribe((response: any) => {
                          if (response.Code == 200) {
                          }
                        })
                      if (response.appReqList && response.appReqList.items.length > 0 && this.patientType === '1' &&
                        (response.appReqList.items.filter((x: any) => x.isCovered === 'Not Covered' || x.isCovered === 'Approval Required' || x.isCovered === 'Need Approval' || x.isCovered === 'Limit Exceeded' || x.isCovered === 'Pharmacy Duration').length > 0) &&
                        (this.selectedCard.BillType == 'Insured' || this.selectedCard.BillType == 'CR')) {
                        //this.loaDataList = response.LOADataList;
                        //this.loaServicesDataList = response.LOAServicesDataList;
                        this.loaDataList = response.appReqList;//response.LOADataList;
                        this.loaServicesDataList = response.appReqList.items;
                        this.loaDiagnosis = response.appReqList.diagnosis?.map((item: any) => item.name).join(', ');
                        this.loaCc = response.appReqList.cc?.map((item: any) => item.name).join(', ');
                        this.pbmRemarksText = "";
                        this.trimesterOrderPackMsg = "";
                        $("#approvalRequest").modal('show');
                      }
                      else {
                        this.selectedItemsList = []; this.investigationsList = []; this.proceduresList = [];
                        this.createGaugeChart();
                        if (this.patientType != '2' && this.patientType != '4')
                          this.FetchPrescriptionInfo();
                        $("#refill_modal").modal('hide');
                        $("#savePrescriptionMsg").modal('show');
                        setTimeout(() => {
                          $("#savePrescriptionMsg").modal('hide');
                          this.clearPrescriptionScreen();
                        }, 1000)
                      }
                    }
                  },
                  (err) => {
                    console.log(err)
                  });
              }
              else {
                $("#refill_modal").modal('hide');
                $("#saveMsg").modal('show');
              }

            }
          },
          (err) => {
            console.log(err)
          });
      }
      modalRef.close();
    });


  }
  FetchMasterTeethInfo() {
    this.config.fetchTeethMasters(this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.teethMaster = response.FetchTeethMastersFDataList;
        }
      })
  }
  babyTeethClick(teethNum: any, position: any) {
    // if(this.dentalOthers) {
    //   this.clearDental(true);
    //   this.errorMessages = "Cannot select teetch when Others is selected";
    //   $("#errorMsg").modal('show');
    //   return;
    // }
    let findTeeth = this.teethbabyMaster.filter((t: any) => t.TeethID == Number(teethNum));
    if (this.selectedTeethList.filter((x: any) => x.TeethID == Number(teethNum)).length === 0) {
      this.selectedTeethList.push({
        TeethNo: findTeeth[0].TeethNo, TeethFDI: findTeeth[0].TeethFDI, TeethID: findTeeth[0].TeethID, TeethName: findTeeth[0].TeethName, TeethSection: findTeeth[0].TeethSection,
        ProcedureID: 0
      })
    }
    this.AssignBabyTeethClass(teethNum);
  }
  teethClick(teethNum: any, position: any) {
    // if(this.dentalOthers) {
    //   this.clearDental(true);
    //   this.errorMessages = "Cannot select teetch when Others is selected";
    //   $("#errorMsg").modal('show');
    //   return;
    // }
    let findTeeth = this.teethMaster.filter((t: any) => t.TeethID == Number(teethNum));
    if (this.selectedTeethList.filter((x: any) => x.TeethID == Number(teethNum)).length === 0) {
      this.selectedTeethList.push({
        TeethNo: findTeeth[0].TeethNo, TeethFDI: findTeeth[0].TeethFDI, TeethID: findTeeth[0].TeethID, TeethName: findTeeth[0].TeethName, TeethSection: findTeeth[0].TeethSection,
        ProcedureID: 0
      })
    }
    this.AssignTeethClass(teethNum);
  }
  AssignTeethClass(teethNum: any) {
    let findTooth = this.selectedTeethList.filter((t: any) => t.TeethID == Number(teethNum));
    switch (teethNum) {
      case "1": {
        if (this.teeth1.trim().split(' ')[5] == undefined)
          this.teeth1 = this.teeth1 + " active";
        else {
          this.teeth1 = this.teeth1.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "2": {
        if (this.teeth2.trim().split(' ')[5] == undefined)
          this.teeth2 = this.teeth2 + " active";
        else {
          this.teeth2 = this.teeth2.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "3": {
        if (this.teeth3.trim().split(' ')[5] == undefined)
          this.teeth3 = this.teeth3 + " active";
        else {
          this.teeth3 = this.teeth3.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "4": {
        if (this.teeth4.trim().split(' ')[5] == undefined)
          this.teeth4 = this.teeth4 + " active";
        else {
          this.teeth4 = this.teeth4.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "5": {
        if (this.teeth5.trim().split(' ')[5] == undefined)
          this.teeth5 = this.teeth5 + " active";
        else {
          this.teeth5 = this.teeth5.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "6": {
        if (this.teeth6.trim().split(' ')[5] == undefined)
          this.teeth6 = this.teeth6 + " active";
        else {
          this.teeth6 = this.teeth6.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "7": {
        if (this.teeth7.trim().split(' ')[5] == undefined)
          this.teeth7 = this.teeth7 + " active";
        else {
          this.teeth7 = this.teeth7.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "8": {
        if (this.teeth8.trim().split(' ')[5] == undefined)
          this.teeth8 = this.teeth8 + " active";
        else {
          this.teeth8 = this.teeth8.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "9": {
        if (this.teeth9.trim().split(' ')[4] == undefined)
          this.teeth9 = this.teeth9 + " active";
        else {
          this.teeth9 = this.teeth9.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "10": {
        if (this.teeth10.trim().split(' ')[4] == undefined)
          this.teeth10 = this.teeth10 + " active";
        else {
          this.teeth10 = this.teeth10.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "11": {
        if (this.teeth11.trim().split(' ')[4] == undefined)
          this.teeth11 = this.teeth11 + " active";
        else {
          this.teeth11 = this.teeth11.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "12": {
        if (this.teeth12.trim().split(' ')[4] == undefined)
          this.teeth12 = this.teeth12 + " active";
        else {
          this.teeth12 = this.teeth12.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "13": {
        if (this.teeth13.trim().split(' ')[4] == undefined)
          this.teeth13 = this.teeth13 + " active";
        else {
          this.teeth13 = this.teeth13.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "14": {
        if (this.teeth14.trim().split(' ')[4] == undefined)
          this.teeth14 = this.teeth14 + " active";
        else {
          this.teeth14 = this.teeth14.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "15": {
        if (this.teeth15.trim().split(' ')[4] == undefined)
          this.teeth15 = this.teeth15 + " active";
        else {
          this.teeth15 = this.teeth15.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "16": {
        if (this.teeth16.trim().split(' ')[4] == undefined)
          this.teeth16 = this.teeth16 + " active";
        else {
          this.teeth16 = this.teeth16.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "17": {
        if (this.teeth17.trim().split(' ')[4] == undefined)
          this.teeth17 = this.teeth17 + " active";
        else {
          this.teeth17 = this.teeth17.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "18": {
        if (this.teeth18.trim().split(' ')[4] == undefined)
          this.teeth18 = this.teeth18 + " active";
        else {
          this.teeth18 = this.teeth18.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "19": {
        if (this.teeth19.trim().split(' ')[4] == undefined)
          this.teeth19 = this.teeth19 + " active";
        else {
          this.teeth19 = this.teeth19.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "20": {
        if (this.teeth20.trim().split(' ')[4] == undefined)
          this.teeth20 = this.teeth20 + " active";
        else {
          this.teeth20 = this.teeth20.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "21": {
        if (this.teeth21.trim().split(' ')[4] == undefined)
          this.teeth21 = this.teeth21 + " active";
        else {
          this.teeth21 = this.teeth21.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "22": {
        if (this.teeth22.trim().split(' ')[4] == undefined)
          this.teeth22 = this.teeth22 + " active";
        else {
          this.teeth22 = this.teeth22.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "23": {
        if (this.teeth23.trim().split(' ')[4] == undefined)
          this.teeth23 = this.teeth23 + " active";
        else {
          this.teeth23 = this.teeth23.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "24": {
        if (this.teeth24.trim().split(' ')[4] == undefined)
          this.teeth24 = this.teeth24 + " active";
        else {
          this.teeth24 = this.teeth24.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "25": {
        if (this.teeth25.trim().split(' ')[5] == undefined)
          this.teeth25 = this.teeth25 + " active";
        else {
          this.teeth25 = this.teeth25.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "26": {
        if (this.teeth26.trim().split(' ')[5] == undefined)
          this.teeth26 = this.teeth26 + " active";
        else {
          this.teeth26 = this.teeth26.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "27": {
        if (this.teeth27.trim().split(' ')[5] == undefined)
          this.teeth27 = this.teeth27 + " active";
        else {
          this.teeth27 = this.teeth27.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "28": {
        if (this.teeth28.trim().split(' ')[5] == undefined)
          this.teeth28 = this.teeth28 + " active";
        else {
          this.teeth28 = this.teeth28.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "29": {
        if (this.teeth29.trim().split(' ')[5] == undefined)
          this.teeth29 = this.teeth29 + " active";
        else {
          this.teeth29 = this.teeth29.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "30": {
        if (this.teeth30.trim().split(' ')[5] == undefined)
          this.teeth30 = this.teeth30 + " active";
        else {
          this.teeth30 = this.teeth30.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "31": {
        if (this.teeth31.trim().split(' ')[5] == undefined)
          this.teeth31 = this.teeth31 + " active";
        else {
          this.teeth31 = this.teeth31.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "32": {
        if (this.teeth32.trim().split(' ')[5] == undefined)
          this.teeth32 = this.teeth32 + " active";
        else {
          this.teeth32 = this.teeth32.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      default: {
        break;
      }
    }
  }
  AssignBabyTeethClass(teethNum: any) {
    let findTooth = this.selectedTeethList.filter((t: any) => t.TeethID == Number(teethNum));
    switch (teethNum) {
      case "1": {
        if (this.babyteeth1.trim().split(' ')[4] == undefined)
          this.babyteeth1 = this.babyteeth1 + " active";
        else {
          this.babyteeth1 = this.babyteeth1.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "2": {
        if (this.babyteeth2.trim().split(' ')[4] == undefined)
          this.babyteeth2 = this.babyteeth2 + " active";
        else {
          this.babyteeth2 = this.babyteeth2.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "3": {
        if (this.babyteeth3.trim().split(' ')[4] == undefined)
          this.babyteeth3 = this.babyteeth3 + " active";
        else {
          this.babyteeth3 = this.babyteeth3.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "4": {
        if (this.babyteeth4.trim().split(' ')[4] == undefined)
          this.babyteeth4 = this.babyteeth4 + " active";
        else {
          this.babyteeth4 = this.babyteeth4.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "5": {
        if (this.babyteeth5.trim().split(' ')[4] == undefined)
          this.babyteeth5 = this.babyteeth5 + " active";
        else {
          this.babyteeth5 = this.babyteeth5.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "6": {
        if (this.babyteeth6.trim().split(' ')[5] == undefined)
          this.babyteeth6 = this.babyteeth6 + " active";
        else {
          this.babyteeth6 = this.babyteeth6.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "7": {
        if (this.babyteeth7.trim().split(' ')[5] == undefined)
          this.babyteeth7 = this.babyteeth7 + " active";
        else {
          this.babyteeth7 = this.babyteeth7.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "8": {
        if (this.babyteeth8.trim().split(' ')[5] == undefined)
          this.babyteeth8 = this.babyteeth8 + " active";
        else {
          this.babyteeth8 = this.babyteeth8.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "9": {
        if (this.babyteeth9.trim().split(' ')[5] == undefined)
          this.babyteeth9 = this.babyteeth9 + " active";
        else {
          this.babyteeth9 = this.babyteeth9.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "10": {
        if (this.babyteeth10.trim().split(' ')[5] == undefined)
          this.babyteeth10 = this.babyteeth10 + " active";
        else {
          this.babyteeth10 = this.babyteeth10.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "11": {
        if (this.babyteeth11.trim().split(' ')[5] == undefined)
          this.babyteeth11 = this.babyteeth11 + " active";
        else {
          this.babyteeth11 = this.babyteeth11.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "12": {
        if (this.babyteeth12.trim().split(' ')[5] == undefined)
          this.babyteeth12 = this.babyteeth12 + " active";
        else {
          this.babyteeth12 = this.babyteeth12.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "13": {
        if (this.babyteeth13.trim().split(' ')[5] == undefined)
          this.babyteeth13 = this.babyteeth13 + " active";
        else {
          this.babyteeth13 = this.babyteeth13.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "14": {
        if (this.babyteeth14.trim().split(' ')[5] == undefined)
          this.babyteeth14 = this.babyteeth14 + " active";
        else {
          this.babyteeth14 = this.babyteeth14.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "15": {
        if (this.babyteeth15.trim().split(' ')[5] == undefined)
          this.babyteeth15 = this.babyteeth15 + " active";
        else {
          this.babyteeth15 = this.babyteeth15.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "16": {
        if (this.babyteeth16.trim().split(' ')[4] == undefined)
          this.babyteeth16 = this.babyteeth16 + " active";
        else {
          this.babyteeth16 = this.babyteeth16.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "17": {
        if (this.babyteeth17.trim().split(' ')[4] == undefined)
          this.babyteeth17 = this.babyteeth17 + " active";
        else {
          this.babyteeth17 = this.babyteeth17.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "18": {
        if (this.babyteeth18.trim().split(' ')[4] == undefined)
          this.babyteeth18 = this.babyteeth18 + " active";
        else {
          this.babyteeth18 = this.babyteeth18.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "19": {
        if (this.babyteeth19.trim().split(' ')[4] == undefined)
          this.babyteeth19 = this.babyteeth19 + " active";
        else {
          this.babyteeth19 = this.babyteeth19.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      case "20": {
        if (this.babyteeth20.trim().split(' ')[4] == undefined)
          this.babyteeth20 = this.babyteeth20 + " active";
        else {
          this.babyteeth20 = this.babyteeth20.replace("active", "");
          const index = this.selectedTeethList.findIndex((x: any) => x.TeethID == teethNum);
          if (index !== -1) {
            this.selectedTeethList.splice(index, 1);
          }
        }
        break;
      }
      default: {
        break;
      }
    }
  }
  onDentalFormProcedureSelection(event: any, tooth: any) {
    let findTooth = this.selectedTeethList.filter((t: any) => t.TeethID == Number(tooth.TeethID));
    findTooth[0].ProcedureID = event.target.value;
  }
  FormDentalFormDetails() {
    this.teethInfoDetails = [];
    this.selectedTeethList.forEach((element: any) => {
      const remarks = element.Remarks;
      this.teethInfoDetails.push({
        TID: element.TeethID,
        PID: element.ProcedureID,
        RMK: remarks,
      })
    });
  }
  deleteDental(tooth: any) {
    const index = this.selectedTeethList.indexOf(tooth);
    if (index !== -1) {
      this.selectedTeethList.splice(index, 1);
    }
    if (tooth.TeethNo == 'Others') {
      this.dentalOthers = false;
    }
    this.AssignTeethClass(tooth.TeethID.toString());
  }
  saveDentalForm() {

    if (this.dentalOthers) {
      if (this.selectedTeethList.filter((x: any) => x.TeetchNo == 'Others' && x.Remarks === '').length > 0) {
        this.errorMessages = "Please enter remarks for Others";
        $("#errorMsg").modal('show');
        return;
      }
    }

    if (this.selectedTeethList.length > 0 && this.selectedTeethList.filter((t: any) => t.ProcedureID == 0).length == 0) {
      this.FormDentalFormDetails();
      let postData = {
        "AdmissionId": this.selectedPatientAdmissionId,
        "TeethInfoDetails": this.teethInfoDetails,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, //this.patientType == '2' ? this.facility.FacilityID : 0
      };
      this.config.saveDentalForm(postData).subscribe(
        (response) => {
          if (response.Code == 200) {
            $("#saveDentalForm").modal('show');
            this.selectedTeethList.forEach((teeth: any) => {
              this.AssignTeethClass(teeth.TeethID.toString());
            })
          } else {

          }
        },
        (err) => {
          console.log(err)
        });
    }
    else {
      if (this.selectedTeethList.length == 0)
        this.errorMessages = "Select any teeth to save";
      else if (this.selectedTeethList.filter((t: any) => t.ProcedureID == 0).length > 0)
        this.errorMessages = "Select Procedure for teeth";
      $("#errorMsg").modal('show');
    }
  }
  clearDental(otherFlag: boolean = false) {
    this.teeth1 = "teeth ur_1 d-flex align-items-center flex-row-reverse";
    this.teeth2 = "teeth ur_2 d-flex align-items-center flex-row-reverse";
    this.teeth3 = "teeth ur_3 d-flex align-items-center flex-row-reverse";
    this.teeth4 = "teeth ur_4 d-flex align-items-center flex-row-reverse";
    this.teeth5 = "teeth ur_5 d-flex align-items-center flex-row-reverse";
    this.teeth6 = "teeth ur_6 d-flex align-items-center flex-row-reverse";
    this.teeth7 = "teeth ur_7 d-flex align-items-center flex-row-reverse";
    this.teeth8 = "teeth ur_8 d-flex align-items-center flex-row-reverse";
    this.teeth9 = "teeth ul_8 d-flex align-items-center";
    this.teeth10 = "teeth ul_7 d-flex align-items-center";
    this.teeth11 = "teeth ul_6 d-flex align-items-center";
    this.teeth12 = "teeth ul_5 d-flex align-items-center";
    this.teeth13 = "teeth ul_4 d-flex align-items-center";
    this.teeth14 = "teeth ul_3 d-flex align-items-center";
    this.teeth15 = "teeth ul_2 d-flex align-items-center";
    this.teeth16 = "teeth ul_1 d-flex align-items-center";
    this.teeth17 = "teeth bl_8 d-flex align-items-center";
    this.teeth18 = "teeth bl_7 d-flex align-items-center";
    this.teeth19 = "teeth bl_6 d-flex align-items-center";
    this.teeth20 = "teeth bl_5 d-flex align-items-center";
    this.teeth21 = "teeth bl_4 d-flex align-items-center";
    this.teeth22 = "teeth bl_3 d-flex align-items-center";
    this.teeth23 = "teeth bl_2 d-flex align-items-center";
    this.teeth24 = "teeth bl_1 d-flex align-items-center";
    this.teeth25 = "teeth br_1 d-flex align-items-center flex-row-reverse";
    this.teeth26 = "teeth br_2 d-flex align-items-center flex-row-reverse";
    this.teeth27 = "teeth br_3 d-flex align-items-center flex-row-reverse";
    this.teeth28 = "teeth br_4 d-flex align-items-center flex-row-reverse";
    this.teeth29 = "teeth br_5 d-flex align-items-center flex-row-reverse";
    this.teeth30 = "teeth br_6 d-flex align-items-center flex-row-reverse";
    this.teeth31 = "teeth br_7 d-flex align-items-center flex-row-reverse";
    this.teeth32 = "teeth br_8 d-flex align-items-center flex-row-reverse";

    this.babyteeth1 = "teeth ul_1 d-flex align-items-center"
    this.babyteeth2 = "teeth ul_2 d-flex align-items-center"
    this.babyteeth3 = "teeth ul_3 d-flex align-items-center"
    this.babyteeth4 = "teeth ul_4 d-flex align-items-center"
    this.babyteeth5 = "teeth ul_5 d-flex align-items-center"
    this.babyteeth6 = "teeth ur_1 d-flex align-items-center flex-row-reverse"
    this.babyteeth7 = "teeth ur_2 d-flex align-items-center flex-row-reverse"
    this.babyteeth8 = "teeth ur_3 d-flex align-items-center flex-row-reverse"
    this.babyteeth9 = "teeth ur_4 d-flex align-items-center flex-row-reverse"
    this.babyteeth10 = "teeth ur_5 d-flex align-items-center flex-row-reverse"
    this.babyteeth11 = "teeth br_1 d-flex align-items-center flex-row-reverse"
    this.babyteeth12 = "teeth br_2 d-flex align-items-center flex-row-reverse"
    this.babyteeth13 = "teeth br_3 d-flex align-items-center flex-row-reverse"
    this.babyteeth14 = "teeth br_4 d-flex align-items-center flex-row-reverse"
    this.babyteeth15 = "teeth br_5 d-flex align-items-center flex-row-reverse"
    this.babyteeth16 = "teeth bl_1 d-flex align-items-center"
    this.babyteeth17 = "teeth bl_2 d-flex align-items-center"
    this.babyteeth18 = "teeth bl_3 d-flex align-items-center"
    this.babyteeth19 = "teeth bl_4 d-flex align-items-center"
    this.babyteeth20 = "teeth bl_5 d-flex align-items-center"
    if (!otherFlag) {
      this.FetchSavedDentalForm();
    }

  }
  FetchSavedDentalForm() {
    this.dentalOthers = false;
    this.config.fetchPatientTeethInfoDetails(this.selectedPatientAdmissionId, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedTeethList = response.FetchPatientTeethInfoDetailsFDataList;
          this.selectedTeethList.forEach((teeth: any) => {
            this.AssignTeethClass(teeth.TeethID.toString());
          })
        }
      })
  }
  adultTeethtoggleClick() {
    this.config.fetchTeethMasters(this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.teethMaster = response.FetchTeethMastersFDataList;
          this.FetchSavedDentalForm();
        }
      })
  }
  babyTeethtoggleClick() {
    this.config.fetchPediaTeethMasters(this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.teethbabyMaster = response.FetchTeethMastersFDataList;
          this.FetchPatientPediaTeethInfoDetails();
        }
      })
  }
  FetchPatientPediaTeethInfoDetails() {
    this.config.fetchPatientPediaTeethInfoDetails(this.selectedPatientAdmissionId, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedTeethList = response.FetchPatientTeethInfoDetailsFDataList;
        }
      })
  }
  fetchDiagnosis() {
    this.config.fetchAdviceDiagnosis(this.selectedPatientAdmissionId, this.hospitalId).subscribe((response) => {
      this.PatientDiagnosisDataList = response.PatientDiagnosisDataList;
      this.PatientDiagnosisDataList.forEach((element: any, index: any) => {
        element.selected = true;
      });

      if (this.PatientDiagnosisDataList.length === 0) {
        // this.diagerrorMessages = "No Diagnosis for the patient";
        this.diagerrorMessages = "Please review and save Clinical Info and proceed to Rx orders.";
        $("#errorDiagonsisMsg").modal('show');
      }
    },
      (err) => {

      })
  }
  SaveDiag() {
    this.savechanges.emit('');
  }
  selectedDiscontinuedItem(index: any) {
    this.remarksForSelectedDiscontinuedItemName = index.ItemName;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedDiscontinuedItemId = index.ItemId;
    this.remarksForSelectedDiscontinuedPrescId = index.PrescriptionID;
    $("#discontinueRem").val('');
  }
  selectedDiscontinuedPrevMedItem(index: any) {
    $("#discontinue_prevmedremarks").modal('show');
    this.remarksForSelectedDiscontinuedItemName = index.GenericItemName;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedDiscontinuedItemId = index.ItemID;
    this.remarksForSelectedDiscontinuedPrescId = index.PrescriptionID;
    $("#discontinueRem").val('');
  }
  discontinuePrescriptionItem(med: any, rem: any, type: string) {
    var discontinueMedXml = [
      {
        "PID": this.remarksForSelectedDiscontinuedPrescId,
        "IID": this.remarksForSelectedDiscontinuedItemId,
        "MID": this.savedMonitorId,
        "DCR": rem.value
      }
    ]

    let advReactionPayload = {
      "DoctorID": this.doctorDetails[0].EmpId,
      "BlockPresItemsXML": discontinueMedXml
    }
    this.config.blockPrescriptionItems(advReactionPayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          if (type == 'prevmed') {
            $("#discontinuePrevMedSaveMsg").modal('show');
          }
          else {
            $("#discontinueMedSaveMsg").modal('show');
          }
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }
  FetchPrescription() {
    this.selectedItemsList = []; this.investigationsList = []; this.proceduresList = [];
    this.createGaugeChart();
    if (this.patientType != '2' && this.patientType != '4')
      this.FetchPrescriptionInfo();
  }
  FetchHoldMaster() {
    this.config.fetchMedicationHold(this.doctorDetails[0].EmpId, this.hospitalId).subscribe(
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
  selectedHoldItem(index: any) {
    if (this.patientType !== '1') {
      $("#hold_remarks").modal('show');
      this.remarksForSelectedHoldItemName = index.ItemName;
      this.remarksSelectedIndex = index;
      this.remarksForSelectedHoldItemId = index.ItemId;
      this.remarksForSelectedHoldPrescId = index.PrescriptionID;
      this.holdReasonValidation = false;
      this.selectedHoldReason = index.PrescriptionItemsHoldReasonID;
      if (index.HoldStatus == null || index.HoldStatus == 0)
        this.holdBtnName = 'Hold';
      else
        this.holdBtnName = 'Release';
      $("#holdRem").val(index.ReasonForHolding);
    }
  }
  selectedHoldReasonEvent(event: any) {
    this.selectedHoldReason = event.target.value;
  }
  showHoldReasonPopUp() {
    $("#holdRemarksLabel").modal('show');
  }
  clearHoldReason(rem: any) {
    rem.value = "";
    this.selectedHoldReason = "0";
  }
  holdPrescriptionItem(med: any, rem: any, btName: string) {
    if (this.selectedHoldReason != "0" && rem.value != "") {
      $("#hold_remarks").modal('hide');
      var currentDate = this.datepipe.transform(new Date(), "dd-MM-yyyy HH:MM")?.toString();
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
      this.config.holdPrescriptionItems(holdPayload).subscribe(
        (response) => {
          if (response.Code == 200) {

            $("#holdMedSaveMsg").modal('show');
          } else {

          }
        },
        (err) => {
          console.log(err)
        });
    }
    else {
      this.holdReasonValidation = true;
      $("#holdRemarksLabel").modal('show');
    }
  }
  selectedHoldItem_prev(index: any) {
    $("#hold_remarks_prev").modal('show');
    this.remarksForSelectedHoldItemName_prev = index.GenericItemName;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedHoldItemId_prev = index.ItemID;
    this.remarksForSelectedHoldPrescId_prev = index.PrescriptionID;
    this.holdReasonValidation_prev = false;
    this.selectedHoldReason_prev = (index.HoldingReasonID != undefined && index.HoldingReasonID != null && index.HoldingReasonID != '') ? index.HoldingReasonID : index.PrescriptionItemsHoldReasonID;
    this.selectedHoldReason = this.selectedHoldReason_prev;
    if (index.HoldStatus == null || index.HoldStatus == 0)
      this.holdBtnName_prev = 'Hold';
    else
      this.holdBtnName_prev = 'Release';
    $("#holdRem_prev").val((index.HoldingReason != undefined && index.HoldingReason != null && index.HoldingReason != '') ? index.ReasonForHolding : index.ReasonForHolding);
    // $("#holdRem_prev").val('');
  }
  selectedHoldReasonEvent_prev(event: any) {
    this.selectedHoldReason_prev = event.target.value;
  }
  showHoldReasonPopUp_prev() {
    $("#holdRemarksLabel").modal('show');
  }
  clearHoldReason_prev(rem: any) {
    rem.value = "";
    this.selectedHoldReason_prev = "0";
  }
  holdPrescriptionItem_prev(med: any, rem: any, btName_prev: string) {
    if (this.selectedHoldReason_prev != "0" && rem.value != "") {
      $("#hold_remarks").modal('hide');
      var currentDate = this.datepipe.transform(new Date(), "dd-MM-yyyy HH:MM")?.toString();
      var holdMedXml = [
        {
          "PID": this.remarksForSelectedHoldPrescId_prev,
          "IID": this.remarksForSelectedHoldItemId_prev,
          "ISEQ": 1,
          "REASON": " | " + this.doctorDetails[0].UserName + "  " + currentDate + " : " + rem.value,
          "HOLDSTATUS": btName_prev == 'Hold' ? "1" : "0",
          "HRID": this.selectedHoldReason,
          "BLK": "0"
        }
      ]

      let holdPayload = {
        "DoctorID": this.doctorDetails[0].EmpId,
        "HoldPresItemsXML": holdMedXml
      }
      this.config.holdPrescriptionItems(holdPayload).subscribe(
        (response) => {
          if (response.Code == 200) {

            $("#holdMedSaveMsg_prev").modal('show');
          } else {

          }
        },
        (err) => {
          console.log(err)
        });
    }
    else {
      this.holdReasonValidation = true;
      $("#holdRemarksLabel").modal('show');
    }
  }
  fetchListOfPrescription() {
    this.config.fetchListOfPrescription(this.selectedPatientAdmissionId, this.hospitalId).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.ipPrescriptionList = response.FetchListOfPrescriptionDataList;
          this.allPrescriptionListDetails = response.FetchListOfPrescriptionCompleteDataList;
          var distinctPresciptions = response.FetchListOfPrescriptionCompleteDataList.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.MonitorID === thing.MonitorID) === i);
          distinctPresciptions = distinctPresciptions.sort((a: any, b: any) => new Date(b.OrderDate).getDate() - new Date(a.OrderDate).getDate());
          this.allPrescriptionList = distinctPresciptions;
          this.ipPrescriptionList.forEach((element: any, index: any) => {
            element.Class = "icon-w cursor-pointer";
          })
          this.ipPrescriptionCount = this.ipPrescriptionList.length;
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }
  openIPPrescriptions() {
    $("#divIpPrescription").modal('show');
    this.ipPrescriptionList.forEach((element: any, index: any) => {
      element.Class = "icon-w cursor-pointer";
    })
  }
  addSelectedIPPrescription(presc: any) {
    this.selectedIPPrescription = presc;
    this.isProceduresAll = false;
    this.isInvesigationsAll = false;
    if (presc.Class == "icon-w cursor-pointer")
      presc.Class = "icon-w cursor-pointer active";
    var admId = this.selectedCard.AdmissionID;
    if (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4')
      admId = this.selectedCard.IPID;
    this.config.FetchPrescriptionInfoIP(presc.PrescriptionID, presc.MonitorID, this.patientType, this.selectedCard.EpisodeID, this.selectedPatientAdmissionId, this.selectedCard.PatientID, this.hospitalId, this.doctorDetails[0].EmpId, this.DischargeMedication)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.savedDrugPrescriptions = response.objPatientPrescriptionDataList;
          //this.savedDrugPrescriptions = this.savedDrugPrescriptions.filter((f: any) => f.PrescriptionID == presc.PrescriptionID);
          this.savedDrugPrescriptions = this.savedDrugPrescriptions.filter((f: any) => f.MonitorID == presc.MonitorID);
          this.savedInvPrescriptions = response.objPatientPrescriptionInvDataList;
          // this.savedInvPrescriptions = this.savedInvPrescriptions.filter((f: any) => f.PrescID == presc.PrescriptionID);
          this.savedInvPrescriptions = this.savedInvPrescriptions.filter((f: any) => f.MonitorID == presc.MonitorID);
          this.savedProcPrescriptions = response.objPatientPrescriptionProcDataList;
          // this.savedProcPrescriptions = this.savedProcPrescriptions.filter((f: any) => f.PrescID == presc.PrescriptionID);
          this.savedProcPrescriptions = this.savedProcPrescriptions.filter((f: any) => f.MonitorID == presc.MonitorID);
          this.savedMonitorId = response.objPatientPrescriptionList[0]?.MonitorID;
          this.savedDrugPrescriptionId = response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Medication').length > 0 ? response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Medication')[0].PrescID : 0;
          this.savedInvPrescriptionId = response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Investigation').length > 0 ? response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Investigation')[0].PrescID : 0;
          this.savedProcPrescriptionId = response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Procedure').length > 0 ? response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Procedure')[0].PrescID : 0;
          this.procedureSchedules = this.multipleOrderSchedules = response.FetchPrescriptionProcScheduleDataList;
          if (this.savedInvPrescriptions.length > 0) {
            this.showInvListdiv = true;
            if (this.patientType == '3') {
              this.entryId = this.savedInvPrescriptions[0].EntryID === "" ? 0 : this.savedInvPrescriptions[0].EntryID;
            }
            this.investigationsList = [];
            this.savedInvPrescriptions.forEach((element: any, index: any) => {
              if (element.ResultStatus > 1) {
                this.disableDelete = true;
                element.disableDelete = true;
              } else {
                this.disableDelete = false;
                element.disableDelete = false;
              }
              if (element.SPEID === "214") {
                this.IsCTScan = true;
                this.SpecialiseID = element.SPEID;
              }

              if (element.SPEID === "217") {
                this.IsMRI = true;
                this.SpecialiseID = element.SPEID;
              }

              if (this.IsMRI & this.IsCTScan) {
                this.SpecialiseID = 0;
              }

              this.investigationsList.push({
                ID: this.investigationsList.length + 1, SOrN: 'N', Name: element.Procedure, Specialisation: element.Specialization, Quantity: element.QTY,
                ServiceItemId: element.PID, SpecialisationId: element.SPEID, ServiceTypeId: 3,
                SpecimenId: element.SPID, Remarks: element.REM, IsFav: element.IsFav, disableDelete: element.disableDelete, TATRemarks: element.TATRemarks,
                ResultStatus: element.ResultStatus, ItemPrice: this.selectedCard.BillType === 'Insured' ? element.CompanyPrice : element.BasePrice,
                DISID: element.DiseaseID,
                DEPARTMENTID: element.DepartmentId
              });
            })
          } else {
            this.showInvListdiv = false;
            this.investigationsList = [];
          }
          if (this.savedProcPrescriptions.length > 0) {
            this.showProcListdiv = true;
            if (this.patientType == '3') {
              this.entryId = this.savedProcPrescriptions[0].EntryID === "" ? 0 : this.savedProcPrescriptions[0].EntryID;
            }
            this.proceduresList = [];
            this.savedProcPrescriptions.forEach((element: any, index: any) => {
              if (element.Status >= 1) {
                this.disableDelete = true;
                element.disableDelete = true;
              } else {
                this.disableDelete = false;
                element.disableDelete = false;
              }
              this.proceduresList.push({
                ID: this.proceduresList.length + 1, SOrN: 'N', Name: element.Procedure, Specialisation: element.Specialization, Quantity: element.QTY,
                ServiceItemId: element.PID, SpecialisationId: element.SPEID, ServiceTypeId: 5,
                SpecimenId: element.SPEID, Remarks: element.REM, IsFav: element.IsFav, disableDelete: element.disableDelete, TATRemarks: '', ResultStatus: element.ResultStatus
                , ItemPrice: this.selectedCard.BillType === 'Insured' ? element.CompanyPrice : element.BasePrice,
                DISID: element.DiseaseID,
                DEPARTMENTID: element.DepartmentId
              });
            })
          }
          else {
            this.showProcListdiv = false;
            this.proceduresList = [];
          }
          if (this.savedDrugPrescriptions.length > 0) {
            if (this.patientType == '3') {
              this.entryId = this.savedDrugPrescriptions[0].EntryID === "" ? 0 : this.savedDrugPrescriptions[0].EntryID;
            }
            this.selectedItemsList = [];
            if (this.savedDrugPrescriptions.filter((x: any) => x.IsDisPrescription.toLowerCase() == 'true').length > 0) {
              this.selectall = true;
            }

            this.savedDrugPrescriptions.forEach((element: any, index: any) => {
              let find = this.selectedItemsList.find((x: any) => x?.ItemId === element.PrescribedItemID);
              if (find == undefined) {
                this.selectedItemsList.push({
                  SlNo: this.selectedItemsList.length + 1,
                  Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
                  ClassSelected: false,
                  ItemId: element.PrescribedItemID,
                  ItemCode: element.ItemCode,
                  ItemName: element.DRUGNAME,
                  StrengthUoMID: element.QtyUomID,
                  Strength: element.ActItemStrength + " " + element.QtyUom,
                  StrengthUoM: element.QtyUom,
                  Dosage: element.DOS + " " + element.DOSE, //response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
                  DosageId: element.DOID,
                  AdmRouteId: element.ARI,
                  Route: element.AdmRoute,
                  FrequencyId: element.FID,
                  Frequency: element.Frequency,
                  ScheduleStartDate: this.datepipe.transform(element.SFRM, "dd-MMM-yyyy")?.toString(),
                  EndDate: this.datepipe.transform(element.EDT, "dd-MMM-yyyy")?.toString(),
                  StartFrom: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                  DurationId: element.DUID,
                  Duration: element.DUR,
                  DurationValue: element.DUR.split(' '),
                  PresInstr: element.PatientInstructions == 'select' ? "" : element.PatientInstructions,//item.PresInstr,
                  Quantity: element.FQTY,
                  QuantityUOMId: element.QtyUomID,
                  PresType: "",//item.PresType,
                  PRNType: element.PRNREASON,//item.PRNType,
                  GenericId: element.PrescribedGenericItemID,
                  DefaultUOMID: element.QtyUomID,
                  medInstructionId: "",//item.medInstructionId,
                  PRNReason: "",//item.PRNReason,
                  IssueUoM: element.FQTYUOM,
                  IssueUOMID: element.IssuedQtyUOMName,
                  IssueUOMValue: element.Qty,
                  IssueTypeUOM: element.QtyUomID,
                  Remarks: element.REM,
                  IsFav: element.IsFav,
                  DiseaseID: element.DiseaseID,
                  DiagnosisId: element.DiseaseID,
                  DISID: element.DiseaseID,
                  ScheduleEndDate: element.EDT,
                  ScheduleTime: element.STM,
                  PrescriptionItemStatusNew: element.PrescriptionItemStatusNew,
                  PrescriptionID: element.PrescriptionID,
                  HoldStatus: element.HoldStatus,
                  ReasonForHolding: element.ReasonForHolding,
                  PrescriptionItemsHoldReasonID: element.PrescriptionItemsHoldReasonID,
                  PrescriptionItemsHoldReason: element.ReasonForHolding,
                  HoldDate: element.HoldDate,
                  lexicomAlertIcon: '',
                  viewMore: false,
                  IsAntibiotic: element.IsAntibiotic,
                  IsAntibioticForm: element.IsAntibioticForm,
                  PrescribedQty: element.PrescribedQty,
                  AntiMicrobialOrderSheet: element.AntiMicrobialOrderSheet,
                  DiagnosisName: element.DiseaseName,
                  IVFluidStorageCondition: element.IVFluidStorageCondition,
                  IVFluidExpiry: element.IVFluidExpiry,
                  BaseSolutionID: element.BaseSolutionID
                });
                const med = this.selectedItemsList.find((x: any) => x.ItemId === element.PrescribedItemID)
                if (med.Remarks != '') {
                  this.maximizeSelectedDrugItems(med);
                }
              }
            });
            const antibitotictemplate = this.selectedItemsList.filter((x: any) => x?.AntiMicrobialOrderSheet !== null && x?.AntiMicrobialOrderSheet !== "");
            if (antibitotictemplate.length > 0) {
              this.antibioticTemplateValue = antibitotictemplate[0].AntiMicrobialOrderSheet;
            }
          } else {
            this.selectedItemsList = [];
          }
        }
        this.createGaugeChart();
      })
    $("#divIpPrescription").modal('hide');
    //this.LexicomAlert();
  }

  clearMecicationSelected(flag: string) {
    if (flag == "Yes") {
      $("#dischargeMedicationYesNo").modal('hide');
      if (this.selectedItemsList.length > 0) {
        this.selectedItemsList = [];
        this.createGaugeChart();
      }
    }
    else {
      this.DischargeMedication = false;
      this.selectall = false;
    }
  }

  saveOrderPackModifyJustification() {

    if (this.selectedOrderPackIds != "") {
      this.orderpackSelectedAndModified = false;
      this.selectedOrderPackIds.split(',').forEach((element: any, index: any) => {
        if (this.selectedopJustificationIds.split(',').length > 1) {

          if (this.changedInvestigationsList.length > 0) {
            this.selectedopJustificationIds?.split(',').forEach(ele => {
              this.changedInvestigationsList.forEach((el: any) => {
                this.selectedOrderPacksJustification.push({
                  ORDERPACKID: element[index], ORPITEMJUSTID: ele[index], SID: el.ServiceTypeId, IID: el.ServiceItemId
                });
              });
            });
          }
          if (this.changedMedicationsList.length > 0) {
            this.selectedopJustificationIds?.split(',').forEach(ele => {
              this.changedMedicationsList.forEach((el: any) => {
                this.selectedOrderPacksJustification.push({
                  ORDERPACKID: element[index], ORPITEMJUSTID: ele[index], SID: 8, IID: el.ItemId
                });
              });
            });
          }
          if (this.changedProceduresList.length > 0) {
            this.selectedopJustificationIds?.split(',').forEach(ele => {
              this.changedProceduresList.forEach((el: any) => {
                this.selectedOrderPacksJustification.push({
                  ORDERPACKID: element[index], ORPITEMJUSTID: ele[index], SID: el.ServiceTypeId, IID: el.ServiceItemId
                });
              });
            });
          }
        }
        else {

          if (this.changedInvestigationsList.length > 0) {
            this.selectedopJustificationIds?.split(',').forEach(ele => {
              this.changedInvestigationsList.forEach((el: any) => {
                this.selectedOrderPacksJustification.push({
                  ORDERPACKID: element[index], ORPITEMJUSTID: this.selectedopJustificationIds, SID: this.changedInvestigationsList[0].ServiceTypeId, IID: this.changedInvestigationsList[0].ServiceItemId
                });
              });
            });
          }
          if (this.changedMedicationsList.length > 0) {
            this.selectedopJustificationIds?.split(',').forEach(ele => {
              this.changedMedicationsList.forEach((el: any) => {
                this.selectedOrderPacksJustification.push({
                  ORDERPACKID: element[index], ORPITEMJUSTID: this.selectedopJustificationIds, SID: 8, IID: el.ItemId
                });
              });
            });
          }
          if (this.changedProceduresList.length > 0) {
            this.selectedopJustificationIds?.split(',').forEach(ele => {
              this.changedProceduresList.forEach((el: any) => {
                this.selectedOrderPacksJustification.push({
                  ORDERPACKID: element[index], ORPITEMJUSTID: this.selectedopJustificationIds, SID: el.ServiceTypeId, IID: el.ServiceItemId
                });
              });
            });
          }
          // this.selectedOrderPacksJustification.push({
          //   ORDERPACKID: element[index], ORPITEMJUSTID: this.selectedopJustificationIds, SID: this.changedInvestigationsList[0].ServiceTypeId, IID: this.changedInvestigationsList[0].ServiceItemId
          // });
        }
      })
      var opmodifiedDetails: any = [];
      this.selectedOrderPacksJustification.forEach((element: any) => {
        let modifiedOrderPack = {
          "ORDERPACKID": element.ORDERPACKID,
          "ORPITEMJUSTID": element.ORPITEMJUSTID,
          "SID": element.SID,
          "IID": element.IID
        }
        opmodifiedDetails.push(modifiedOrderPack);
      });
      let savejustpayload = {

        "PatientItemLevelOrderPackRejectedID": "0",
        "PatientID": this.PatientId,
        "Admissionid": this.selectedCard.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "OrderPackIDXMLDetails": opmodifiedDetails,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, //this.patientType == '2' ? this.facility.FacilityID : 0,
        "Hospitalid": this.hospitalId

      }
      this.config.savePatientItemLevelOrderPackRejected(savejustpayload).subscribe(
        (response) => {
          if (response.Code == 200) {
            $("#orderPacks").modal('hide');
            $("#selectedMessage").modal('hide');
            this.saveAllPrescription();
          } else {

          }
        },
        (err) => {
          console.log(err)
        });
    }
    else {
      this.orderPacksSelected = false;
      this.errorMessages = "Please select Order Packs and Justification";
      $("#errorMsg").modal('show');
    }
  }

  showLexicomAlerts(med: any) {
    this.lexicomInlineAlertsList = []; this.lexicomInlineAlertsListPassed = [];
    this.lexicomDrugName = med.ItemName;
    var lexicomInlineAlertsList = this.lexicomAlertsList.filter((f: any) => f.groupkey === med.ItemId);
    lexicomInlineAlertsList = Object.keys(lexicomInlineAlertsList).map((key) => [key, lexicomInlineAlertsList[key]])[0];
    var lca = Object.keys(lexicomInlineAlertsList[1].values).map((key) => [key, lexicomInlineAlertsList[1].values[key]]);
    lca?.forEach((icon: any, index: any) => {
      if (lca[index][1].Alerts.length > 0) {
        lca[index][1].Alerts.forEach((alert: any, ind: any) => {
          if (lca[index][0] != "Multiple") {
            this.lexicomInlineAlertsList.push({
              "Category": lca[index][0],
              "Text": this.lexicomAlertsWithTextList[alert].values.Text,
              "ApiName": this.lexicomAlertsWithTextList[alert].values.APIName,
              "Base64": this.lexicomAlertsWithTextList[alert].values.Icon.Base64,
              "Monograph": this.lexicomAlertsWithTextList[alert].values.Monograph,
            })
          }
        })
      }
      else {
        if (lca[index][0] != "Multiple") {
          this.lexicomInlineAlertsListPassed.push({
            "Category": lca[index][0],
            "Text": "",
            "ApiName": "",
            "Base64": lca[index][1].Base64
          })
        }
      }
    })

    $("#lexicomTooltip").modal('show');
  }

  collapseExpandLexicomPassedAlerts() {
    if (this.showPassedLexicomAlerts) {
      this.showPassedLexicomAlerts = false;
    } else {
      this.showPassedLexicomAlerts = true;
    }
  }

  collapseExpandSummaryLexicomPassedAlerts() {
    if (this.showPassedLexicomSummaryAlerts) {
      this.showPassedLexicomSummaryAlerts = false;
    } else {
      this.showPassedLexicomSummaryAlerts = true;
    }
  }
  showMonographData(monograph: any) {
    this.monographData = monograph;
    $("#monographData").modal('show');
  }

  openTaperingPopup() {
    if (this.isEditmode) {
      this.medicationScheduleitems.clear();
      var drugSchedule = this.medicationsForm.get('CustomizedDosage')?.value;
      if (drugSchedule != null && drugSchedule != "") {
        if (drugSchedule.ObjTaperData === undefined)
          drugSchedule = JSON.parse(drugSchedule);
        for (let i = 0; i < drugSchedule.ObjTaperData[0].CustomizedQty.split('-').length; i++) {
          const itemFormGroup = this.fb.group({
            Dose: drugSchedule.ObjTaperData[0].CustomizedQty.split('-')[i],
            ScheduleTime: drugSchedule.ObjTaperData[0].CustomizedSchedule.split('-')[i]
          })
          this.medicationScheduleitems.push(itemFormGroup);
          $("#divTapering").addClass('d-flex');
          $("#divTapering").removeClass('d-none');
        }
      }
      else {
        this.createTapering();
      }
    }
    else {
      this.createTapering();
    }
  }
  closeTapering() {
    $("#divTapering").addClass('d-none');
    $("#divTapering").removeClass('d-flex');
  }


  createTapering() {
    this.medicationScheduleitems.clear();
    if (this.selectedMedDrugFreqScheduleTime != undefined && this.selectedMedDrugFreqScheduleTime != "") {
      var drugSchedule = this.selectedMedDrugFreqScheduleTime.ScheduleTime;
      for (let i = 0; i < drugSchedule.split('-').length; i++) {
        //schedule.push({"Schedule" : drugSchedule.split('-')[i]});
        const itemFormGroup = this.fb.group({
          Dose: '',
          ScheduleTime: drugSchedule.split('-')[i] + ":00"
        })
        this.medicationScheduleitems.push(itemFormGroup);
      }
      //this.medicationSchedules = schedule;
      $("#divTapering").addClass('d-flex');
      $("#divTapering").removeClass('d-none');
    }
    else {
      this.errorMessages = "Please select Frequency";
      $("#errorMsg").modal('show');
    }
  }

  CalculateTaperedQuantity(totDose: any) {
    var UserId = 0;
    var WorkStationID = 0;
    var FreqVal = -2;
    var CurrentIndx = 0;
    var DosageUnit = totDose;
    var DurationUnit = this.medicationsForm.get('DurationValue')?.value;
    var DurationVal = this.medicationsForm.get('DurationId')?.value;
    var Type = 0;
    var IssueTypeUOM = this.medicationsForm.get('IssueTypeUOM')?.value;
    var ItemId = this.medicationsForm.get('ItemId')?.value;
    var DefaultUOMID = this.medicationsForm.get('DefaultUOMID')?.value;
    var PrescStartDate = this.datepipe.transform(this.medicationsForm.value['ScheduleStartDate'], "dd-MMM-yyyy")?.toString();
    var PatientType = this.patientType;
    //Patient Type need to be changed when implementing Inpatient Prescriptions
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, FreqVal, 1, DosageUnit, DurationUnit, DurationVal, 1, 0, ItemId, DefaultUOMID, PrescStartDate, this.patientType == "3" ? "1" : this.patientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.medicationsForm.patchValue({
            Quantity: response.FetchItemQtyDataCDataaList[0].totQty,//response.Quantity.split('^')[1],
            ScheduleEndDate: response.FetchItemQtyDataCDataaList[0].EDT,
            ScheduleTime: response.FetchItemQtyDataCDataaList[0].ScheduleTime,
            //StartFrom: response.Quantity.split('^')[0],

          })
          $('#QuantityUOM').html(this.medicationsForm.get('QuantityUOM')?.value);
        }
      },
        (err) => {

        })
  }

  saveTapering() {
    var schedDoses = this.medicationSchedulesForm;
    var dose: string[] = []; var time: string[] = []; var totalDose = 0;
    this.medicationSchedulesForm.value.items.forEach((element: any) => {
      dose.push(element.Dose);
      time.push(element.ScheduleTime);
      totalDose = Number(totalDose) + Number(element.Dose);
    });
    //this.CalculateQuantity();
    var doses =
    {
      "NoOfDays": 0,
      "IsSliding": false,
      "SDays": 0,
      "ObjTaperData": [
        {
          "DrugID": this.medicationsForm.get('ItemId')?.value,
          "DrugName": this.medicationsForm.get('ItemName')?.value,
          "Day": null,
          "Checked": false,
          "Strength": this.medicationsForm.get('Strength')?.value,
          "StrengthUOM": this.medicationsForm.get('StrengthUOM')?.value,
          "Dose": null,
          "DoseUOM": null,
          "Frequency": this.medicationsForm.get('Frequency')?.value,
          "FrequencyID": this.medicationsForm.get('FrequencyId')?.value,
          "CustomizedSchedule": time.join("-"),
          "CustomizedQty": dose.join("-"),
          "CustomizedDays": this.medicationsForm.get('DurationValue')?.value,
          "StartFrom": this.medicationsForm.get('ScheduleStartDate')?.value,
          "TotalQty": 0,
          "CustomizedRemarks": null,
          "TotalCustQty": totalDose,
          "ListSatrtDate": [],
          "FrequencyQty": 0,
          "SCIT": 0
        }
      ],
      "IsDosEdit": true,
      "InterVal": 0
    }

    this.medicationsForm.patchValue({
      CustomizedDosage: JSON.stringify(doses)
    });
    this.CalculateTaperedQuantity(totalDose);
    //$("#divTapering").modal('hide');
    $("#divTapering").removeClass('d-none');
  }
  clearTapering() {
    this.medicationScheduleitems.clear();
    var drugSchedule = this.selectedMedDrugFreqScheduleTime.ScheduleTime;
    var schedule: any[] = [];
    for (let i = 0; i < drugSchedule.split('-').length; i++) {
      //schedule.push({"Schedule" : drugSchedule.split('-')[i]});
      const itemFormGroup = this.fb.group({
        Dose: drugSchedule.split('-')[i],
        ScheduleTime: ''
      })
      this.medicationScheduleitems.push(itemFormGroup);
    }
  }

  toggleDropdown(med: any) {
    med.displayDropdown = true;
  }

  toggledisplayStartDateDropdown(med: any) {
    med.displayStartDateDropdown = true;
  }

  toggleDuraion(med: any) {
    med.displayDuration = true;
  }

  toggleRouteDropdown(med: any) {
    this.config.fetchItemForPrescriptions(this.patientType, med.ItemId, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.AdmRoutesListGridRow = response.ItemRouteDataList;
          med.displayRouteDropdown = true;
        }
      },
        (err) => {
        })

  }

  onFrequencyRowChange(event: any, med: any) {
    med.FrequencyId = event.target.value;
    med.Frequency = event.target.options[event.target.options.selectedIndex].text;
    var PrescStartDate = this.datepipe.transform(med.ScheduleStartDate, "dd-MMM-yyyy")?.toString();
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, med.FrequencyId, 1, med.IssueUOMValue, med.DurationValue, med.DurationId, 1, 0, med.ItemId, med.DefaultUOMID, PrescStartDate, this.patientType == "3" ? "1" : this.patientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          med.Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
          med.ScheduleEndDate = response.FetchItemQtyDataCDataaList[0].EDT;
          med.ScheduleTime = response.FetchItemQtyDataCDataaList[0].ScheduleTime;
        }
      },
        (err) => {

        })
    med.displayDropdown = false;
  }

  onRouteRowChange(event: any, med: any) {
    med.AdmRouteId = event.target.value;
    med.Route = event.target.options[event.target.options.selectedIndex].text;
    med.displayRouteDropdown = false;
  }
  onDateRowChange(event: any, med: any) {
    med.ScheduleStartDate = this.datepipe.transform(new Date(event.target.value), "dd-MMM-yyyy")?.toString();
    var PrescStartDate = this.datepipe.transform(med.ScheduleStartDate, "dd-MMM-yyyy")?.toString();
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, med.FrequencyId, 1, med.IssueUOMValue, med.DurationValue, med.DurationId, 1, 0, med.ItemId, med.DefaultUOMID, PrescStartDate, this.patientType == "3" ? "1" : this.patientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          med.displayStartDateDropdown = false;
          med.Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
          med.ScheduleEndDate = response.FetchItemQtyDataCDataaList[0].EDT;
          med.ScheduleTime = response.FetchItemQtyDataCDataaList[0].ScheduleTime;
        }
      },
        (err) => {

        })
  }

  onDurationTextRowChange(event: any, med: any) {
    med.DurationValue = event.target.value;
    const Name = this.durationList.find((x: any) => x.Id == med.DurationId).Names;
    med.Duration = event.target.value + ' ' + Name;
    var PrescStartDate = this.datepipe.transform(med.ScheduleStartDate, "dd-MMM-yyyy")?.toString();
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, med.FrequencyId, 1, med.IssueUOMValue, med.DurationValue, med.DurationId, 1, 0, med.ItemId, med.DefaultUOMID, PrescStartDate, this.patientType == "3" ? "1" : this.patientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          med.displayDuration = false;
          med.Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
          med.ScheduleEndDate = response.FetchItemQtyDataCDataaList[0].EDT;
          med.ScheduleTime = response.FetchItemQtyDataCDataaList[0].ScheduleTime;
        }
      },
        (err) => {

        })
  }

  onDurationSelectRowChange(event: any, med: any) {
    med.DurationId = event.target.value;
    const Name = this.durationList.find((x: any) => x.Id == med.DurationId).Names;
    med.Duration = med.DurationValue + ' ' + Name;
    var PrescStartDate = this.datepipe.transform(med.ScheduleStartDate, "dd-MMM-yyyy")?.toString();
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, med.FrequencyId, 1, med.IssueUOMValue, med.DurationValue, med.DurationId, 1, 0, med.ItemId, med.DefaultUOMID, PrescStartDate, this.patientType == "3" ? "1" : this.patientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          med.displayDuration = false;
          med.Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
          med.ScheduleEndDate = response.FetchItemQtyDataCDataaList[0].EDT;
          med.ScheduleTime = response.FetchItemQtyDataCDataaList[0].ScheduleTime;
        }
      },
        (err) => {

        })
  }

  private calculateMedQuantity(med: any) {
    var qty = 0;
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, med.FrequencyID, 1, med.Dose, med.DurationValue, med.DurationID, 1, 0, med.ItemID, med.QtyUOMID, med.StartFrom, this.patientType == "3" ? "1" : this.patientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          qty = response.FetchItemQtyDataCDataaList[0].totQty;
          return qty;
        }
        else
          return qty;
      },
        (err) => {

        })
  }

  closeApprovalPopup() {
    this.selectedItemsList = []; this.investigationsList = []; this.proceduresList = [];
    this.createGaugeChart();
    if (this.patientType != '2' && this.patientType != '4')
      this.FetchPrescriptionInfo();
    $("#savePrescriptionMsg").modal('show');
    setTimeout(() => {
      $("#savePrescriptionMsg").modal('hide');
      this.clearPrescriptionScreen();
    }, 1000)
  }

  toggleStatNormal(type: string) {
    if (type === 'normal') {
      this.toggleValue = 'Normal';
      this.investigationsList.forEach(element => {
        element.SOrN = 'N';
      });
      this.proceduresList.forEach(element => {
        element.SOrN = 'N';
      });
    }
    else {
      this.toggleValue = 'Stat';
      this.investigationsList.forEach(element => {
        element.SOrN = 'S';
      });
      this.proceduresList.forEach(element => {
        element.SOrN = 'S';
      });
    }
  }

  showMedicineHistory(item: any) {
    this.selectedHistoryItem = item;
    this.config.FetchPatientPrescibedDrugHistory(item.ItemID, this.PatientId, this.facility.FacilityID, this.hospitalId, this.selectedCard.SSN)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientPrescibedDrugHistoryDataList.length > 0) {
          this.medicineHistory = [];
          this.medicineHistory = response.FetchPatientPrescibedDrugHistoryDataList.sort((a: any, b: any) => new Date(b.PrescriptionDate).getTime() - new Date(a.PrescriptionDate).getTime());;
          this.showMedicineHistorydiv = true;
        }
      },
        (err) => {

        })
  }

  PBMIntegrationCall() {

    if (this.selectedItemsList.length > 0) {

      var druglist: any[] = [];
      this.selectedItemsList.forEach((element: any, index: any) => {
        druglist.push({
          "ItemID": element.ItemId,
          "QTY": element.Quantity,
          "Price": element.Price == undefined ? 0 : element.Price,
          "Duration": element.Duration.split(' ')[0]
        });
      });

      var pbmpyld = {
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        "HospitalID": this.hospitalId,
        "PrescID": this.savedDrugPrescriptionId,
        "PatientID": this.selectedCard.PatientID,
        "PatientType": this.selectedCard.PatientType,
        "IPID": this.selectedCard.AdmissionID,
        "memberId": this.selectedCard.RegCode,
        "memberGender": this.selectedCard.Gender.toString().toUpperCase(),
        "dateOfBirth": moment(this.selectedCard.DOB).format('DD/MM/YYYY'),
        "drugList": druglist
      }

      this.config.PBMIntegrationCall(pbmpyld).subscribe(
        (response) => {
          if (response.Code == 200) {
            this.PBADrugInfoData = response.PBADrugInfoData;
            this.ICDCodeData = response.ICDCodeData;
            if (this.PBADrugInfoData.length > 0) {
              this.MapDiagnosisMedication('true');
              const pbmRejItem = this.PBADrugInfoData.filter((x: any) => x.status === 'REJECTED');
              if (pbmRejItem.length > 0)
                this.pdbRejectedItems = pbmRejItem?.map((item: any) => item.ndcDrugCode + "-" + item.drugDescription).join('| ');

              if (!this.pbmRemarks && this.pdbRejectedItems != '') {
                this.pbmRemarks = true;
              }

              $("#divPbmData").modal('show');
            }
            else {
              this.isPbmChecked = true;
              this.saveAllPrescription();
            }
          } else {

          }
        },
        (err) => {
          console.log(err)
        });
    }
  }
  showPBMIntegrationCall() {

    if (this.selectedItemsList.length > 0) {

      var druglist: any[] = [];
      this.selectedItemsList.forEach((element: any, index: any) => {
        druglist.push({
          "ItemID": element.ItemId,
          "QTY": element.Quantity,
          "Price": element.Price == undefined ? 0 : element.Price,
          "Duration": element.Duration.split(' ')[0]
        });
      });

      var pbmpyld = {
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
        "HospitalID": this.hospitalId,
        "PrescID": "0",
        "PatientID": this.selectedCard.PatientID,
        "PatientType": this.selectedCard.PatientType,
        "IPID": this.selectedCard.AdmissionID,
        "memberId": this.selectedCard.RegCode,
        "memberGender": this.selectedCard.Gender.toString().toUpperCase(),
        "dateOfBirth": moment(this.selectedCard.DOB).format('DD/MM/YYYY'),
        "drugList": druglist
      }

      this.config.PBMIntegrationCall(pbmpyld).subscribe(
        (response) => {
          if (response.Code == 200) {
            this.PBADrugInfoData = response.PBADrugInfoData;
            this.ICDCodeData = response.ICDCodeData;
            $("#divPbmDataDisplay").modal('show');
          } else {

          }
        },
        (err) => {
          console.log(err)
        });
    }
  }

  savePbmPrescription() {
    if (this.PBADrugInfoData.length > 0) {
      const pbmRejItem = this.PBADrugInfoData.filter((x: any) => x.status === 'REJECTED');
      if (pbmRejItem.length > 0)
        this.pdbRejectedItems = pbmRejItem?.map((item: any) => item.ndcDrugCode + "-" + item.drugDescription).join('| ');

      if (this.pdbRejectedItems != '' && this.pbmRemarksText === '') {
        this.pbmRemarks = true;
        return;
      }

    }
    this.isPbmChecked = true;
    $("#divPbmData").modal('hide');
    this.saveAllPrescription();
  }

  deleteItems(pbmitem: any, index: any) {
    this.PBADrugInfoData.splice(index, 1);
    const findItem = this.selectedItemsList.find((x: any) => Number(x.ItemId) === pbmitem.ItemID)
    const arrindex = this.selectedItemsList.indexOf(findItem, 0);
    if (index > -1) {
      this.selectedItemsList.splice(arrindex, 1);
      this.createGaugeChart();
    }
  }
  toggleGenericBrand(type: string) {
    if (type === 'Generic') {
      this.GenericBrandtoggleValue = 'Generic';
      this.GenericBrand = "1";
    }
    else {
      this.GenericBrandtoggleValue = 'Brand';
      this.GenericBrand = "0";
    }
  }

  setRouteIdValue(route: any) {
    this.medicationsForm.patchValue({
      AdmRouteId: route.RouteID == undefined ? route.Id : route.RouteID,
      AdmRoute: route.RouteName == undefined ? route.Names : route.RouteName,
    });
  }

  getRouteName(routeid: string) {
    if (routeid.length != undefined && routeid.length > 0) {
      if (routeid[0] === '') {
        return 'Route';
      }
    }
    else if (routeid === "" || routeid === null || routeid === '0') {
      return 'Route';
    }
    const rout = this.itemSelected == 'false' ? this.AdmRoutesList?.find((x: any) => x.Id == routeid) : this.AdmRoutesList?.find((x: any) => x.RouteID == routeid);
    return this.itemSelected == 'false' ? rout.Names : rout.RouteName;
  }

  setFrequencyValue(freq: any) {
    this.medicationsForm.patchValue({
      FrequencyId: freq.FrequencyID
    });
    this.medicationsForm.get('Frequency')?.setValue(freq.Frequency);
    this.selectedMedDrugFreqScheduleTime = this.drugFrequenciesList.find((x: any) => x.FrequencyID == freq.FrequencyID);
    if (freq.FrequencyID == '51' || freq.FrequencyID == '52' || freq.FrequencyID == '60') {
      const dur = this.durationList?.find((x: any) => x.Id == '7');
      this.setDurationValue(dur);
    }
    this.CalculateQuantity();
  }

  getFrequencyName(freqid: string) {
    if (freqid.length != undefined && freqid.length > 0) {
      if (freqid[0] === '') {
        return 'Frequency';
      }
    }
    else if (freqid === "" || freqid === null || freqid === '0') {
      return 'Frequency';
    }
    const freq = this.drugFrequenciesList?.find((x: any) => x.FrequencyID == freqid);
    return freq.Frequency;
  }

  setDurationValue(dur: any) {
    if ((this.medicationsForm.get('FrequencyId')?.value == '51' || this.medicationsForm.get('FrequencyId')?.value == '52' || this.medicationsForm.get('FrequencyId')?.value == '60')
      && dur.Id != '7') {
      this.errorMessages = "Cannot select Duration as " + dur.Names + " when Frequency is selected as Week";
      $("#errorMsg").modal('show');
      return;
    }
    this.medicationsForm.patchValue({
      DurationId: dur.Id
    });
    this.medicationsForm.get('Duration')?.setValue(dur.Names);
    this.CalculateQuantity();
  }

  getDurationName(durid: string) {
    if (durid.length != undefined && durid.length > 0) {
      if (durid[0] === '') {
        return 'Duration';
      }
    }
    else if (durid === "" || durid === null || durid === '0') {
      return 'Duration';
    }
    const dur = this.durationList?.find((x: any) => x.Id == durid);
    return dur.Names;
  }

  setPatientInstructionsValue(instr: any) {
    this.medicationsForm.patchValue({
      medInstructionId: instr.id,
      PresInstr: instr.name
    });
  }

  getPatientInstructionName(instrid: string) {
    if (instrid.length != undefined && instrid.length > 0) {
      if (instrid[0] === '') {
        return 'Instruction';
      }
    }
    else if (instrid === "" || instrid === null || instrid === '0') {
      return 'Instruction';
    }
    const dur = this.medicationInstructions?.find((x: any) => x.id == instrid);
    return dur.name;
  }

  setDiagnosisMappingValue(diag: any) {
    this.medicationsForm.patchValue({
      DiagnosisId: diag.DiseaseID,
      DiagnosisName: diag.DiseaseName,
      DiagnosisCode: diag.Code
    });
    if (this.isEditmode) {
      this.EditPrescriptionItemsToTable();
    }
    else {
      if (this.selectedSearchedMedItem.IsAntibiotic == '1' || this.selectedSearchedMedItem.IsHighValueDrug == 'True') {
        this.medicationRemarksPopup(this.medicationsForm.get('ItemName')?.value, true);
      } else {
        this.AddPrescriptionItemsToTable();
      }
    }
  }

  getDiagnosisMappingName(diagId: string) {
    if (diagId?.length != undefined && diagId?.length > 0) {
      if (diagId[0] === '') {
        return 'Diagnosis';
      }
    }
    else if (diagId === "" || diagId === null || diagId === '0' || diagId === undefined) {
      return 'Diagnosis';
    }
    const diag = this.visitDiagnosis?.find((x: any) => x.DiseaseID == diagId);
    return diag?.DiseaseName;
  }

  showItemViewMore(item: any) {
    item.viewMore = !item.viewMore;
  }

  disableControls(med: any) {
    med.displayRouteDropdown = false;
    med.displayDropdown = false;
    med.displayStartDateDropdown = false;
    med.displayDuration = false;
  }

  showViewMorePrevMed(prevmed: any) {
    prevmed.viewMorePrevMed = !prevmed.viewMorePrevMed;
  }

  checkProcedureCanPrescribe(proc: any) {
    this.config.getInvestigationProcedureDetailsN(proc.Name, 5, this.doctorDetails[0].EmpId).subscribe((response) => {
      if (response.Status === "Success" && response.InvestigationsAndProceduresList.length === 0) {
        this.actionableAlertmsg = "You are not authorized to request this Procedure as it falls outside the scope of your agreed privileges.!";
        $("#showActionableAlertsMsg").modal('show');
        return false;
      }
      else {
        return true;
      }
    },
      (err) => {

      })
    return true;
  }
  fetchPatientDataEforms() {
    this.config.FetchPatientDataEForms(this.selectedCard.AdmissionID, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.SerumLevel = response.FetchPatientDataEFormsDataList[0].SERUMCREATININE;
          this.radForm = this.fb.group({
            SerumCreatinineLevel: this.SerumLevel
          });
        }
      },
        (err) => {

        })
  }


  CheckIsAdmReconVTEIntialAsmntCompleted() {
    this.config.FetchIsAdmissionRecVTEAndIntialAssessmentCompleted(this.selectedCard.AdmissionID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchIsAdmissionRecVTEAndIntialAssessmentCompletedDataList.length > 0) {
          this.isAdmReconEntered = response.FetchIsAdmissionRecVTEAndIntialAssessmentCompletedDataList[0].IsAdmissionRec === 0 ? false : true;
          this.isVteEntered = response.FetchIsAdmissionRecVTEAndIntialAssessmentCompletedDataList[0].IsVTE === 0 ? false : true;
          this.isIniAsmntEntered = response.FetchIsAdmissionRecVTEAndIntialAssessmentCompletedDataList[0].IsIntialMedicalAssessment === 0 ? false : true;
        }
        if (!this.isAdmReconEntered || !this.isVteEntered || !this.isIniAsmntEntered) {
          $("#VteAmdReconIniAsmntMsg").modal('show');
        }
      },
        (err) => {

        })
  }

  ngAfterViewInit() {
    this.createGaugeChart();
  }

  private createGaugeChart() {
    if (this.selectedCard.BillType === 'Insured' && this.patientType === '1') {
      const ConsultationPrice = Number(this.ConsultationAmount);
      const invPrice = this.investigationsList.map((item: any) => (item.ItemPrice != null && item.ItemPrice != "") ? Number.parseFloat(item.ItemPrice) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
      const procPrice = this.proceduresList.map((item: any) => (item.ItemPrice != null && item.ItemPrice != "") ? Number.parseFloat(item.ItemPrice) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
      const totalPrice = ConsultationPrice + invPrice + procPrice;
      //const totalPharmacy = this.selectedItemsList.length * 25;
      const totalPharmacy = this.selectedItemsList.map((item: any) => (item.Price != null && item.Price != "") ? Number.parseFloat(item.Price) * Number(item.Quantity) : 0).reduce((acc: any, curr: any) => acc + curr, 0);

      const pharmacyValue = Number((totalPharmacy > this.LOALimit ? this.LOALimit : totalPharmacy).toFixed(2));
      const priceValue = Number((totalPrice > this.LOALimit ? this.LOALimit : totalPrice).toFixed(2));
      if (!this.gaugeChart1) {
        this.gaugeChart1 = this.prepareChart('gauge-chart', `Cons.& Services`, priceValue);
      } else {
        const point = this.gaugeChart1.series[0].points[0];
        point.update(priceValue);
      }

      if (!this.gaugeChart2) {
        this.gaugeChart2 = this.prepareChartPM('gauge-chartM', `Pharmacy`, pharmacyValue);
      } else {
        const point = this.gaugeChart2.series[0].points[0];
        point.update(pharmacyValue);
      }

      if (!this.bulletChart1) {
        this.bulletChart1 = this.prepareBulletChart('bulletGraph1', 'Cons.& Services', priceValue);
      } else {
        this.bulletChart1.series[0].setData([{
          y: priceValue,
          target: priceValue
        }]);
      }

      if (!this.bulletChart2) {
        this.bulletChart2 = this.prepareBulletChartM('bulletGraph2', 'Pharmacy', pharmacyValue);
      } else {
        this.bulletChart2.series[0].setData([{
          y: pharmacyValue,
          target: pharmacyValue
        }]);
      }
    }
  }

  private prepareChart(element: any, title: string, value: any) {
    return Highcharts.chart(element, {
      chart: {
        type: 'gauge',
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false,
        height: 170,
        width: 170
      },
      title: {
        text: title,
        style: {
          color: '#368796',
          fontSize: '12px'
        }
      },
      pane: {
        startAngle: -90,
        endAngle: 89.9,
        background: null,
        center: ['50%', '75%'],
        size: '100%'
      },
      yAxis: {
        min: 0,
        max: this.LOALimit,
        tickPixelInterval: 50,
        tickPosition: 'inside',
        tickColor: '#FFFFFF',
        tickLength: 20,
        tickWidth: 0,
        minorTickInterval: null,
        labels: {
          distance: 10,
          style: {
            fontSize: '10px'
          }
        },
        lineWidth: 0,
        plotBands: [{
          from: 0,
          to: 300,
          color: '#ACCC98',
          thickness: 10,
          borderRadius: '50%'
        }, {
          from: 300,
          to: 600,
          color: '#639248',
          thickness: 10,
          borderRadius: '50%'
        }, {
          from: 600,
          to: this.LOALimit,
          color: '#497231',
          thickness: 10,
          borderRadius: '50%'
        }],

      },
      tooltip: {
        enabled: false
      },
      series: [{
        name: 'Score',
        data: [value],
        tooltip: {
          enabled: false
        },
        dataLabels: {
          format: '{y} (SAR)',
          borderWidth: 0,
          color: (
            Highcharts.defaultOptions.title &&
            Highcharts.defaultOptions.title.style &&
            Highcharts.defaultOptions.title.style.color
          ) || '#333333',
          style: {
            fontSize: '10px'
          }
        },
        dial: {
          radius: '75%',
          backgroundColor: '#A4BC92',
          baseWidth: 12,
          baseLength: '0%',
          rearLength: '0%'
        },
        pivot: {
          backgroundColor: '#A4BC92',
          radius: 6
        }
      }]
    } as any);
  }

  private prepareChartPM(element: any, title: string, value: any) {
    return Highcharts.chart(element, {
      chart: {
        type: 'gauge',
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false,
        height: 170,
        width: 170
      },
      title: {
        text: title,
        style: {
          color: '#368796',
          fontSize: '12px'
        }
      },
      pane: {
        startAngle: -90,
        endAngle: 89.9,
        background: null,
        center: ['50%', '75%'],
        size: '100%'
      },
      yAxis: {
        min: 0,
        max: this.LOALimit,
        tickPixelInterval: 50,
        tickPosition: 'inside',
        tickColor: '#FFFFFF',
        tickLength: 20,
        tickWidth: 0,
        minorTickInterval: null,
        labels: {
          distance: 10,
          style: {
            fontSize: '10px'
          }
        },
        lineWidth: 0,
        plotBands: [{
          from: 0,
          to: this.LOALimit,
          color: '#ACCC98',
          thickness: 10,
          borderRadius: '50%'
        }],
      },
      tooltip: {
        enabled: false
      },
      series: [{
        name: 'Score',
        data: [value],
        tooltip: {
          enabled: false
        },
        dataLabels: {
          format: '{y} (SAR)',
          borderWidth: 0,
          color: (
            Highcharts.defaultOptions.title &&
            Highcharts.defaultOptions.title.style &&
            Highcharts.defaultOptions.title.style.color
          ) || '#333333',
          style: {
            fontSize: '10px'
          }
        },
        dial: {
          radius: '75%',
          backgroundColor: '#A4BC92',
          baseWidth: 12,
          baseLength: '0%',
          rearLength: '0%'
        },
        pivot: {
          backgroundColor: '#A4BC92',
          radius: 6
        }
      }]
    } as any);
  }

  private prepareBulletChart(element: any, title: string, value: any) {
    return Highcharts.chart(element, {
      chart: {
        marginTop: 17,
        height: 70,
        width: 310,
        inverted: true,
        marginLeft: 120,
        type: 'bullet',
        backgroundColor: null
      },
      title: false,
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      xAxis: {
        categories: [title]
      },
      yAxis: {
        gridLineWidth: 0,
        max: this.LOALimit,
        plotBands: [{
          from: 0,
          to: 300,
          color: '#ACCC98'
        }, {
          from: 300,
          to: 600,
          color: '#639248'
        }, {
          from: 600,
          to: this.LOALimit,
          color: '#497231'
        }],
        title: null
      },
      plotOptions: {
        series: {
          pointPadding: 0.25,
          borderWidth: 0,
          color: '#597445',
          targetOptions: {
            width: '200%'
          },
          dataLabels: {
            enabled: true,
            format: '{point.y}'
          }
        }
      },
      series: [{
        data: [{
          y: value,
          target: value
        }]
      }],
      tooltip: {
        enabled: false
      }
    } as any);
  }

  private prepareBulletChartM(element: any, title: string, value: any) {
    return Highcharts.chart(element, {
      chart: {
        marginTop: 17,
        height: 70,
        width: 310,
        inverted: true,
        marginLeft: 120,
        type: 'bullet',
        backgroundColor: null
      },
      title: false,
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      xAxis: {
        categories: [title]
      },
      yAxis: {
        gridLineWidth: 0,
        max: this.LOALimit,
        plotBands: [{
          from: 0,
          to: this.LOALimit,
          color: '#ACCC98'
        }],
        title: null
      },
      plotOptions: {
        series: {
          pointPadding: 0.25,
          borderWidth: 0,
          color: '#597445',
          targetOptions: {
            width: '200%'
          },
          dataLabels: {
            enabled: true,
            format: '{point.y}'
          }
        }
      },
      series: [{
        data: [{
          y: value,
          target: value
        }]
      }],
      tooltip: {
        enabled: false
      }
    } as any);
  }



  viewAllPrescriptions() {
    $("#divViewAllPrescriptions").modal('show');
  }

  filterViewAllPresc(presc: any) {
    return this.allPrescriptionListDetails.filter((x: any) => x.MonitorID === presc.MonitorID);
  }
  showSpeedMeterPopUp() {
    $('.prescMeter_tooltip').css({ display: 'block' });
  }
  CloseSpeedMeterPopUp() {
    $('.prescMeter_tooltip').css({ display: 'none' });
  }

  getAntibioticsCount() {
    //return this.selectedItemsList.filter((item: any) => ['1', '2', '3'].includes(item.IsAntibiotic)).length;
    return this.selectedItemsList.filter((item: any) => item.IsAntibioticForm.toString().toLowerCase() === 'true').length;
  }

  openAntibioticTemplate() {
    if (this.getAntibioticsCount() > 0) {
      $('#antibioticsMsg').modal('hide');
      const antibioticModal = this.modalSvc.open(AntibioticComponent, {
        backdrop: 'static',
        size: 'xl',
        windowClass: 'vte_view_modal'
      });
      antibioticModal.componentInstance.data = this.antibioticTemplateValue;
      antibioticModal.componentInstance.dataChanged.subscribe((data: string) => {
        this.antibioticTemplateValue = data;
        antibioticModal.close();
      });
    }
  }
  filterNotCoveredItems(items: any) {
    return items.filter((x: any) => x.isCovered === 'Not Covered');
  }
  filterNeedApprovalItems(items: any) {
    return items.filter((x: any) => x.isCovered !== 'Not Covered');
  }

  getNeedApprovalReason(view: any) {
    if (this.loaDataList && this.loaDataList?.diagnosis?.length > 0 && this.loaDataList?.diagnosis.filter((x: any) => x.isCovered === 'Approval Required').length > 0) {
      const diaglst = this.loaDataList?.diagnosis.filter((x: any) => x.isCovered === 'Approval Required');
      return diaglst.map((item: any) => item.name).join(', ') + " - Need Approval";
    }
    else if (this.loaDataList && this.loaDataList?.cc?.length > 0 && this.loaDataList?.cc.filter((x: any) => x.isCovered === 'Approval Required').length > 0) {
      const cclst = this.loaDataList?.cc.filter((x: any) => x.isCovered === 'Approval Required');
      return cclst.map((item: any) => item.name).join(', ') + " - Need Approval";
    }
    else if (view.isCovered === 'Need Approval') {
      return "Service Need Approval";
    }
    return "";
  }

  getNotCoveredReason(view: any) {
    if (this.loaDataList && this.loaDataList?.diagnosis?.length > 0 && this.loaDataList?.diagnosis.filter((x: any) => x.isCovered === 'Not Covered').length > 0) {
      const diaglst = this.loaDataList?.diagnosis.filter((x: any) => x.isCovered === 'Not Covered');
      return diaglst.map((item: any) => item.name).join(', ') + " - Not Covered";
    }
    else if (this.loaDataList && this.loaDataList?.cc?.length > 0 && this.loaDataList?.cc.filter((x: any) => x.isCovered === 'Not Covered').length > 0) {
      const cclst = this.loaDataList?.cc.filter((x: any) => x.isCovered === 'Not Covered');
      return cclst.map((item: any) => item.name).join(', ') + " - Not Covered";
    }
    else if (view.isCovered === 'Not Covered') {
      return "Service Not Covered";
    }
    return "";
  }

  changeDiagnosisMapping() {
    if (this.selectedItemsList.length > 0) {
      this.isMappingAll = !this.isMappingAll;
      const firstItem = this.selectedItemsList[0];
      this.selectedItemsList.forEach((item: any) => {
        if (this.isMappingAll) {
          item.DISID = firstItem.DISID;
          item.DiagnosisId = firstItem.DiagnosisId;
          item.DiagnosisName = firstItem.DiagnosisName;
        } else {
          item.DISID = '';
          item.DiagnosisId = '';
          item.DiagnosisName = '';
        }
      })
    }
  }

  changeInvestigationDiagnosis() {
    if (this.investigationsList.length > 0) {
      this.isInvesigationsAll = !this.isInvesigationsAll;
      const firstItem = this.investigationsList[0];
      this.investigationsList.forEach((item: any) => {
        item.DISID = this.isInvesigationsAll ? firstItem.DISID : '';
      })
    }
  }

  changeProcedureDiagnosis() {
    if (this.proceduresList.length > 0) {
      this.isProceduresAll = !this.isProceduresAll;
      const firstItem = this.proceduresList[0];
      this.proceduresList.forEach((item: any) => {
        item.DISID = this.isProceduresAll ? firstItem.DISID : '';
      })
    }
  }

  toggleIsHomeMedInPrevMedClick(option: string) {
    this.showHomeMedInPrevMed = option === 'no' ? 'yes' : 'no';
    this.showPrevMedFiltersData = false;
    if (this.showHomeMedInPrevMed === 'yes') {
      this.previousMedicationListDetailsFilterData = [];
      this.showPrevMedFiltersData = true;
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => x.isDischargeMedication.toString().toLowerCase() === 'true');
    }
    else {
      this.showHomeMedInPrevMed = 'no';
      this.showPrevMedFiltersData = false;
    }
  }

  discontinueMedFromPrevMedConfirmation() {
    if (!this.showPrevMedFiltersData) {
      let discMed = this.previousMedicationListDetails.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
      if (discMed.length === 0) {
        this.errorMessages = "Please select atleast one medication to discontinue";
        $("#errorMsg").modal('show');
        return;
      }
      let discInactMed = this.previousMedicationListDetails.filter((x: any) => x?.StatusID === 0);
      if (discInactMed.length > 0) {
        this.errorMessages = "Cannot discontinue Inactive medication";
        $("#errorMsg").modal('show');
        return;
      }
    }
    $("#discontinue_multiple_prevmedremarks").modal('show');
  }

  discontinueMultipleMedFromPrevMed() {
    let discMed = this.previousMedicationListDetails.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
    if (this.showPrevMedFiltersData) {
      discMed = this.previousMedicationListDetailsFilterData.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
    }
    var discMedXml: any[] = [];
    discMed.forEach((element: any) => {
      discMedXml.push({
        "PID": element.PrescriptionID,
        "IID": element.ItemID,
        "MID": element.MonitorID,
        "DCR": $("#discontinue_multiple_Rem").val()
      })
    });
    var payload = {
      "DetailsXML": discMedXml,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? 0 : this.facility.FacilityID,
      "HospitalID": this.hospitalId
    }
    this.config.saveBlockPrescriptionItems(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#discontinue_multiple_Rem").val('');
          $("#discontinueMedSaveMsg").modal('show');
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }

  openBaseSolutionSelectionPopup(med: any) {
    this.config.FetchBaseSolutionHHH(this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
      if (response.Status === "Success") {
        this.baseSolutions = response.FetchBaseSolutionDataList;
        this.baseSolutionsNSS = this.baseSolutions.filter((x: any) => x.DisplayName.toLowerCase().includes("normal saline"));
        const distinctNSS = this.baseSolutionsNSS.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.ItemID === thing.ItemID) === i);
        this.baseSolutionsNSS = distinctNSS;
        this.baseSolutionsDEX = this.baseSolutions.filter((x: any) => x.DisplayName.toLowerCase().includes("dextrose"));
        const distinctDEX = this.baseSolutionsDEX.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.ItemID === thing.ItemID) === i);
        this.baseSolutionsDEX = distinctDEX;
        this.selectedIvMedicationForBaseSolution = med;
        $("#baseSolutionItemsModal").modal('show');
      }
      else {

      }
    },
      (err) => {

      })
  }

  selectBaseSolution(sub: any) {
    this.baseSolutions.forEach((element: any, index: any) => {
      if (element.ItemID === sub.ItemID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.showSubstituteSelectValidationMsg = false;
  }

  loadSelectedBaseSolutionItem() {
    var selectedbs = this.baseSolutions.filter((x: any) => x.selected);
    if (selectedbs.length === 0) {
      this.showSubstituteSelectValidationMsg = true;
      return;
    }
    else {
      selectedbs = this.baseSolutions.find((x: any) => x.selected);
      this.showSubstituteSelectValidationMsg = false;
    }
    this.onBaseSolutionItemSelected(selectedbs);
    $("#baseSolutionItemsModal").modal('hide');
  }

  onBaseSolutionItemSelected(item: any) {
    const itemId = item.ItemID;
    this.config.fetchItemForPrescriptions(this.patientType, itemId, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
          this.itemSelected = "true";
          this.AdmRoutesList = response.ItemRouteDataList;
          this.filteredAdmRoutesList = cloneDeep(this.AdmRoutesList);
          this.searchRouteTerm = '';
          this.medicationsForm.patchValue({
            ItemId: itemId,
            ItemName: response.ItemDataList[0].DisplayName,
            ItemCode: response.ItemDataList[0].ItemCode,
            DosageId: response.ItemDataList[0].QtyUomID,
            Dosage: response.ItemDataList[0].QTYUOM,
            Strength: response.ItemDataList[0].Strength,
            StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
            StrengthUoM: response.ItemDataList[0].StrengthUoM,
            IssueUOMValue: response.ItemDataList[0].Quantity,
            IssueUoM: response.DefaultUOMDataaList[0].IssueUOM,
            IssueUOMID: response.DefaultUOMDataaList[0].IssueUOMID,
            ScheduleStartDate: new Date(),
            DefaultUOMID: (this.patientType === '2' || this.patientType === '4') ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
            IssueTypeUOM: itempacking[0].FromUoMID,
            QuantityUOMId: response.DefaultUOMDataaList[0].IssueUOMID,
            QuantityUOM: response.DefaultUOMDataaList[0].IssueUOM,
            GenericId: response.ItemGenericsDataList.length > 0 ? response.ItemGenericsDataList[0].GenericID : 0,//response.ItemGenericsDataList[0].GenericID,
            DurationValue: "1",
            DurationId: "3",
            Duration: "Days",
            AdmRouteId: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteID : "",
            AdmRoute: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteName : "",
            IsFav: response.ItemDataList[0].IsFav,
            QOH: (this.patientType === '2' || this.patientType === '4') ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
            FrequencyId: this.patientType == "3" ? 41 : '',
            Frequency: "STAT",
            IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
            BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '' ? response.ItemDataList[0].Basesolution : '',
            IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '' ? response.ItemDataList[0].IVFluidExpiry : '',
            Remarks: '',
            Price: response.ItemPriceDataList.length > 0 ? response.ItemPriceDataList[0].MRP : 0,//response.ItemPriceDataList[0].MRP
            IsAntibiotic: response.ItemDataList[0].IsAntibiotic,
            IsAntibioticForm: response.ItemDataList[0].IsAntibioticForm,
            PrescribedQty: response.ItemDataList[0].PrescribedQty,
            DiagnosisId: this.selectedIvMedicationForBaseSolution?.DiagnosisId,
            DiagnosisName: this.selectedIvMedicationForBaseSolution?.DiagnosisName,
            DiagnosisCode: this.selectedIvMedicationForBaseSolution?.DiagnosisCode
          })
          $('#StrengthUoM').html(response.ItemDataList[0].StrengthUoM);
          $('#IssueUoM').html(response.DefaultUOMDataaList[0].IssueUOM);
          $('#QuantityUOM').html(response.DefaultUOMDataaList[0].IssueUOM);
          $('#Dosage').html(response.ItemDataList[0].QTYUOM);
          this.CalculateQuantity();
          this.listOfItems = [];
          this.isBaseSolutionAdding = true;
          this.AddPrescriptionItemsToTable();
        }
      },
        (err) => {
        })
  }

  onStrengthChange(event: any) {
    const changedStrength = event.target.value;
    const actStrength = this.selectedSearchedMedItem.Strength;
    const dosage = this.medicationsForm.get('IssueUOMValue')?.value
    const calcValue = parseFloat(changedStrength) * parseFloat(dosage) / parseFloat(actStrength);
    this.medicationsForm.patchValue({
      "IssueUOMValue": calcValue
    });
    this.CalculateQuantity();
  }

  setCurrentTime(): string {
    const now = new Date();
    const hours = this.padZero(now.getHours());
    const minutes = this.padZero(now.getMinutes());
    return `${hours}:${minutes}`;
  }
  setCurrentTime1(time: string): string {
    const now = new Date(time);
    const hours = this.padZero(now.getHours());
    const minutes = this.padZero(now.getMinutes());
    return `${hours}:${minutes}`;
  }
  padZero(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  openProcedureSchedulePopup(proc: any) {
    const procOrderPayload = this.multipleOrderPayload.find((x: any) => x.orderId == proc.ServiceItemId);
    const procConfigSchedules = this.multipleOrderSchedules.filter((x: any) => x.TestId == proc.ServiceItemId);
    if (procConfigSchedules.length > 0) {
      if (procConfigSchedules.PrecriptionScheduleID == undefined || procConfigSchedules.PrecriptionScheduleID == null || procConfigSchedules.PrecriptionScheduleID == '') {
        this.showSetBtn = false;
      }
      else {
        this.showSetBtn = true;
      }
      this.orderSchedules = procConfigSchedules;
    }
    else {
      this.orderSchedules = [];
    }
    if (procOrderPayload) {
      this.orderScheduling.orderId = procOrderPayload?.orderId;
      this.orderScheduling.specialiseId = procOrderPayload?.specialiseId;
      this.orderScheduling.serviceId = procOrderPayload?.serviceId;
      this.orderScheduling.orderName = procOrderPayload?.orderName;
      this.orderScheduling.orderDate = new Date(procOrderPayload?.orderDate);
      this.orderScheduling.ordertime = procOrderPayload?.ordertime;
      this.orderScheduling.orderQty = procOrderPayload?.orderQty;
      this.orderScheduling.orderQtyUom = procOrderPayload?.orderQtyUom;
      this.orderScheduling.orderFreq = procOrderPayload?.orderFreq;
      this.orderScheduling.orderDuration = procOrderPayload?.orderDuration;
      this.orderScheduling.orderDurationUom = procOrderPayload?.orderDurationUom;
    }
    else {
      this.orderScheduling = {
        orderId: proc.ServiceItemId,
        specialiseId: proc.SpecialisationId,
        serviceId: 5,
        orderName: proc.Name,
        orderDate: new Date(),
        ordertime: this.setCurrentTime(),
        orderQty: proc.Quantity,
        orderQtyUom: 2,
        orderFreq: '',
        orderDuration: '',
        orderDurationUom: 2,
      }
    }
    $("#schedulefor_Modal").modal('show');
  }

  procedureOrderScheduling() {
    if (this.orderScheduling.orderFreq === '' || this.orderScheduling.orderDuration === '') {
      this.errorMessages = "Please select Interval & Duration";
      $("#errorMsg").modal('show');
      return;
    }
    if (this.orderScheduling.orderQtyUom == this.orderScheduling.orderDurationUom) {
      if (Number(this.orderScheduling.OrderDuration) < Number(this.orderScheduling.orderQty)) {
        this.errorMessages = "Interval should not greater than" + this.orderScheduling.orderDuration;
        $("#errorMsg").modal('show');
        return;
      }
    }
    if (this.orderScheduling.orderQtyUom == "1") {
      if (Number(this.orderScheduling.orderQty) > 12) {
        this.errorMessages = "Interval in Months should not greater than 12";
        $("#errorMsg").modal('show');
        return;
      }
    }
    if (this.orderScheduling.orderDurationUom == "1") {
      if (Number(this.orderScheduling.orderDuration) > 12) {
        this.errorMessages = "Duration in Months should not greater than 12";
        $("#errorMsg").modal('show');
        return;
      }
    }

    var time = this.orderScheduling.ordertime.toString() + ':00';
    const orderSchedulepayload = this.orderScheduling;
    var payload = {
      "StartDate": moment(this.orderScheduling.orderDate).format('DD-MMM-YYYY'),
      "StartTime": moment(this.convertStringToTime(time)).format('hh:mm A'),
      "Interval": this.orderScheduling.orderFreq,
      "NoofDay": this.orderScheduling.orderQty,
      "NoofDayUOM": this.orderScheduling.orderQtyUom,
      "TotalDuation": this.orderScheduling.orderDuration,
      "TotalDuationUOM": this.orderScheduling.orderDurationUom,
      "TestID": this.orderScheduling.orderId,
      "TestName": this.orderScheduling.orderName,
      "SpecialisationID": this.orderScheduling.specialiseId,
      "ServiceID": this.orderScheduling.serviceId,
      "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalId
    }
    this.config.FetchProcedureSchedules(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.orderSchedules = response.FetchProcedureSchedulesDDDataList;
          if (this.multipleOrderPayload.length > 0) {
            this.multipleOrderPayload = [...this.multipleOrderPayload, ...[orderSchedulepayload]];
          }
          else {
            this.multipleOrderPayload = [orderSchedulepayload];
          }
          if (this.multipleOrderSchedules.length > 0) {
            this.multipleOrderSchedules = [...this.multipleOrderSchedules, ...this.orderSchedules]
          }
          else {
            this.multipleOrderSchedules = this.orderSchedules;
          }
          if (this.orderSchedules.length > 0) {
            var procSchedules: any = [];
            this.orderSchedules.forEach((element: any, index: any) => {
              procSchedules.push({
                "TSTID": element.TestId,
                "SPID": element.TSpecID,
                "SEQ": index + 1,
                "SID": element.ServiceID,
                "SDT": element.TobeDoneOn
              })
            });
            var proc = this.proceduresList.find((x: any) => x.ServiceItemId == this.orderScheduling.orderId);
            if (proc) {
              proc.Quantity = procSchedules.length;
            }
            if (procSchedules) {
              this.procedureSchedules = [...this.procedureSchedules, ...procSchedules];
            }
          }
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }

  clearOrderSchedules() {
    this.orderScheduling.orderDate = new Date();
    this.orderScheduling.ordertime = this.setCurrentTime(),
      this.orderScheduling.orderQty = '';
    this.orderScheduling.orderFreq = '';
    this.orderScheduling.orderDuration = '';
    this.orderSchedules = [];
  }
  convertStringToTime(timeString: string): Date {
    let [hours, minutes, seconds] = timeString.split(':').map(num => parseInt(num, 10));
    // Assuming you want to use today's date with the parsed time
    let today = new Date();
    today.setHours(hours, minutes, seconds);
    return today;
  }
  closeProcOrderScheduling() {
    $("#schedulefor_Modal").modal('hide');
    this.orderScheduling = [];
  }

  onIVFluidSelect() {
    const selectedMed = this.selectedItemsList.filter((x: any) => x.IVFluidStorageCondition != '1');
    if (selectedMed.length > 0) {
      this.errorMessages = "Cannot prescribe IV Medication when Normal medication is selected";
      $("#errorMsg").modal('show');
      return;
    }
    this.isIvFluid = !this.isIvFluid;
    const ivmed = this.selectedItemsList.filter((x: any) => x.IVFluidStorageCondition == '1');
    if (!this.isIvFluid && ivmed.length > 0) {
      $("#isIvFluidRemoveYesNo").modal('show');
    }
  }

  removeSelectedIVMedication() {
    this.selectedItemsList = [];
  }

  keepIVMedication() {
    this.isIvFluid = true;
  }

  showActiveMedication() {
    $("#divActiveMedication").modal('show');
    const params = {
      PatientID: this.selectedCard.PatientID,
      AdmissionID: this.selectedPatientAdmissionId,
      WardID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalId
    };
    const url = this.us.getApiUrl(prescription.FetchPatientActiveMedication, params);
    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.activeMedications = response.FetchPatientActiveMedicationDataList;
        this.activeMedicationsCount = response.FetchPatientActiveMedicationCountDataList[0].PrescriptionCount;
      }
    },
      (err) => {
      });
  }
  PrintActiveMedication() {
    const params = {
      PatientID: this.selectedCard.PatientID,
      AdmissionID: this.selectedPatientAdmissionId,
      WardID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      UserName: this.doctorDetails[0].UserName,
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalId
    };
    const url = this.us.getApiUrl(prescription.FetchPatientActiveMedicationPrint, params);
    this.us.get(url).subscribe((response: any) => {
      if (response.Status === "Success") {
        this.trustedUrl = response?.FTPPATH
        $("#reviewAndPayment").modal('show');
      } else {
      }
    },
      (err) => {
      });
  }

  orderPacksCollection: any = [];
  orderPacksCollection1: any = [];
  selectedOrderPackMedData: any = [];
  selectedOrderPackInvProcData: any = [];
  orderPackSearchText: any = '';

  openOrderPacksModal() {
    this.getOrderPacks();
    $('#orderPacksModal').modal('show');
  }

  getOrderPacks() {
    this.orderPackSearchText = '';
    this.orderPacksCollection = this.orderPacksCollection1 = [];
    const params = {
      EmpID: this.doctorDetails[0].EmpId,
      SpecialisationID: this.doctorDetails[0].EmpSpecialisationId ?? 0,
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalId
    };
    const url = this.us.getApiUrl(prescription.FetchPrescriptionOrderPacksPedia, params);
    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.orderPacksCollection = this.orderPacksCollection1 = response.FetchPrescriptionOrderPacksPediaDataList;
      }
    },
      (err) => {
      });
  }

  onExpandClick(item: any) {
    this.orderPacksCollection.forEach((element: any) => element.expand = false);
    item.expand = true;
    this.getOrderPackDetails(item.OrderPackID);
  }

  getOrderPackDetails(OrderPackID: any, addItems: boolean = false) {
    this.selectedOrderPackMedData = []; this.selectedOrderPackInvProcData = [];
    const params = {
      OrderPackID,
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalId
    };
    const url = this.us.getApiUrl(prescription.FetchPrescriptionOrderPacksPediaSelected, params);
    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.selectedOrderPackMedData = response.FetchPrescriptionOrderPacksPediaSelectedMedicationDataList;
        this.selectedOrderPackInvProcData = response.FetchPrescriptionOrderPacksPediaSelectedInvProcDataList;
        const orderPackInvItems = this.selectedOrderPackInvProcData.filter((x: any) => x.ServiceID === '3');
        const orderPackProcItems = this.selectedOrderPackInvProcData.filter((x: any) => x.ServiceID === '5');
        if (addItems) {
          this.addOrderPacksItems(this.selectedOrderPackMedData, orderPackInvItems, orderPackProcItems);
        }
      }
    },
      (err) => {
      });
  }

  onOrderPackItemSelect(item: any) {
    console.log('selected drug', item);
    $('#orderPacksModal').modal('hide');
  }

  onOrderPackSearch(event: any) {
    const item = event.target.value;
    this.orderPacksCollection = this.orderPacksCollection1.filter((element: any) => element.OrderPack.toLowerCase().indexOf(item.toLowerCase()) > -1)
  }

  prescribeOrderPacks(item: any) {
    this.getOrderPackDetails(item.OrderPackID, true);
  }

  addOrderPacksItems(medItems: any, invItems: any, procItems: any) {
    //Adding medication items
    // medItems.forEach((ordEle: any) => {
    //   this.selectedItemsList.push({
    //     SlNo: this.selectedItemsList.length + 1,
    //     Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
    //     ClassSelected: false,
    //     ItemId: ordEle.ItemID,
    //     ItemName: ordEle.DrugName,
    //     StrengthUoMID: ordEle.StrengthUoMID,
    //     Strength: ordEle.ActItemStrength + " " + ordEle.StrengthUoM,
    //     StrengthUoM: ordEle.StrengthUoM,
    //     Dosage: ordEle.Dose + " " + ordEle.DoseUOM,
    //     DosageId: ordEle.QtyUomID,
    //     AdmRouteId: ordEle.AdmRouteID,
    //     Route: ordEle.AdmRoute,
    //     FrequencyId: ordEle.FrequencyID,
    //     Frequency: ordEle.Frequency,
    //     ScheduleStartDate: moment(new Date()).format('DD-MMM-YYYY'),
    //     StartFrom: moment(new Date()).format('DD-MMM-YYYY'),
    //     DurationId: ordEle.DurationID,
    //     Duration: ordEle.Duration + " " + ordEle.DurationUOM,
    //     DurationValue: ordEle.DurationUOM,
    //     PresInstr: "",//item.PresInstr,
    //     Quantity: ordEle.Quantity,
    //     QuantityUOMId: ordEle.QtyUomID,
    //     PresType: "",//item.PresType,
    //     PRNType: "",
    //     GenericId: ordEle.GenericID,
    //     DefaultUOMID: (this.patientType == '2' || this.patientType == '4') ? ordEle.IPDefaultUomID : ordEle.OPDefaultUomID,
    //     medInstructionId: "",//item.medInstructionId,
    //     PRNReason: "",//item.PRNReason,
    //     IssueUoM: ordEle.IssueUOM,
    //     IssueUOMID: ordEle.IssueUOMID,
    //     IssueUOMValue: ordEle.IssueUOMValue,
    //     IssueTypeUOM: ordEle.QtyUomID,
    //     lexicomAlertIcon: '',
    //     QOH: (this.patientType == "2" || this.patientType == "4") ? ordEle.IPQOH : ordEle.OPQOH,
    //     IVFluidStorageCondition: ordEle.IVFluidStorageCondition !== '1' ? '0' : ordEle.IVFluidStorageCondition,
    //     BaseSolutionID: ordEle.BaseSolutionID !== '1' ? '0' : ordEle.Basesolution,
    //     IVFluidExpiry: ordEle.IVFluidExpiry !== '1' ? '0' : ordEle.IVFluidExpiry,
    //     Price: ordEle.MRP,
    //     ScheduleEndDate: this.datepipe.transform(new Date().setDate(new Date(new Date()).getDate()), "dd-MMM-yyyy")?.toString(),
    //     viewMore: false,
    //     IsAntibiotic: ordEle.IsAntibiotic,
    //     IsAntibioticForm: ordEle.IsAntibioticForm,
    //     Remarks:ordEle.Remarks
    //   });
    // });

    let find = medItems;
    let subscribes: ObservableInput<any>[] = [];

    find.forEach((med: any, index: any) => {
      med.selected = false;
      med.isChecked = false;
      //med.Duration = "1"; med.DurationID = "3"; med.DurationUOM = "Days";
      subscribes.push(this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, med.FrequencyID, 1, med.IssueUOMValue, med.Duration, med.DurationID, 1, 0, med.ItemID,
        (this.patientType == '2' || this.patientType == '4') ? med.IPDefaultUomID : med.OPDefaultUomID, moment(med.EndDatetime).format('DD-MMM-YYYY'), this.patientType == "3" ? "1" : this.patientType, 0, this.hospitalId));

    });
    combineLatest(subscribes).subscribe(responses => {
      responses.forEach((response, index) => {
        if (response.Code === 200) {
          find[index].Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
          find[index].ScheduleEndDate = response.FetchItemQtyDataCDataaList[0].EDT;
        }
      })
      if (find.length > 0) {
        let duplicateItemsList = "";
        find.forEach((element: any, index: any) => {
          find[index].isChecked = true;
          let findDuplicateItem;
          if (this.selectedItemsList.length > 0) {
            findDuplicateItem = this.selectedItemsList.filter((x: any) => x?.ItemId === find[index].ItemID || x.GenericId == find[index].GenericID);
          }
          if (findDuplicateItem != undefined && findDuplicateItem.length > 0) {
            duplicateItemsList = duplicateItemsList != "" ? duplicateItemsList + "," + findDuplicateItem[0].ItemName : findDuplicateItem[0].ItemName;
          }
          else {
            this.config.fetchItemForPrescriptions(this.patientType, find[index].ItemID, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
              .subscribe((response: any) => {
                if (response.Code == 200) {
                  const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
                  this.selectedItemsList.push({
                    SlNo: this.selectedItemsList.length + 1,
                    Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
                    ClassSelected: false,
                    ItemId: find[index].ItemID,
                    ItemCode: find[index].ItemCode,
                    ItemName: find[index].DrugName,
                    StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
                    Strength: response.ItemDataList[0].Strength + " " + response.ItemDataList[0].StrengthUoM,
                    StrengthUoM: response.ItemDataList[0].StrengthUoM,
                    Dosage: find[index].Dose + " " + find[index].DoseUOM, //response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
                    DosageId: response.ItemDataList[0].QtyUomID,
                    AdmRouteId: find[index].AdmRouteID,
                    Route: find[index].AdmRoute,
                    FrequencyId: find[index].FrequencyID,
                    Frequency: find[index].Frequency,
                    ScheduleStartDate: find[index].Blocked == '1' ? moment(new Date).format('DD-MMM-YYYY') :
                      new Date(find[index].EndDatetime) > new Date() ?
                        this.datepipe.transform(new Date(find[index].EndDatetime).setDate(new Date(find[index].EndDatetime).getDate() + 1), "dd-MMM-yyyy")?.toString()
                        : moment(new Date()).format('DD-MMM-YYYY'),
                    StartFrom: find[index].Blocked == '1' ? moment(new Date()).format('DD-MMM-YYYY') :
                      new Date(find[index].EndDatetime) > new Date() ?
                        this.datepipe.transform(new Date(find[index].EndDatetime).setDate(new Date(find[index].EndDatetime).getDate() + 1), "dd-MMM-yyyy")?.toString()
                        : moment(new Date()).format('DD-MMM-YYYY'),
                    DurationId: find[index].DurationID,
                    Duration: find[index].Duration + " " + find[index].DurationUOM,
                    DurationValue: find[index].Duration,
                    PresInstr: "",//item.PresInstr,
                    Quantity: find[index].Quantity,
                    QuantityUOMId: find[index].QtyUomID,
                    PresType: "",//item.PresType,
                    PRNType: "",//find[index].PRNMedicationReason,//item.PRNType,
                    GenericId: find[index].GenericID,
                    DefaultUOMID: (this.patientType == '2' || this.patientType == '4') ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
                    medInstructionId: "",//item.medInstructionId,
                    PRNReason: "",//item.PRNReason,
                    IssueUoM: response.DefaultUOMDataaList[0].IssueUOM,
                    IssueUOMID: response.DefaultUOMDataaList[0].IssueUOMID,
                    IssueUOMValue: response.ItemDataList[0].Quantity,
                    IssueTypeUOM: itempacking[0].FromUoMID,
                    lexicomAlertIcon: '',
                    QOH: (this.patientType == "2" || this.patientType == "4") ? find[index].IPQOH : find[index].OPQOH,
                    IVFluidStorageCondition: find[index].IVFluidStorageCondition !== '1' ? '0' : find[index].IVFluidStorageCondition,
                    BaseSolutionID: find[index].BaseSolutionID !== '1' ? '0' : find[index].Basesolution,
                    IVFluidExpiry: find[index].IVFluidExpiry !== '1' ? '0' : find[index].IVFluidExpiry,
                    Price: find[index].MRP,
                    ScheduleEndDate: find[index].ScheduleEndDate,
                    viewMore: false,
                    IsAntibiotic: find[index].IsAntibiotic,
                    IsAntibioticForm: find[index].IsAntibioticForm,
                    PrescribedQty: find[index].PrescribedQty,
                    Remarks: find[index].Remarks
                  });
                }
                //this.LexicomAlert();
                this.createGaugeChart();
              })
          }
        });
        if (duplicateItemsList != undefined && duplicateItemsList != "") {
          this.duplicateItemsList = duplicateItemsList;
          $("#itemAlreadySelected").modal('show');
        }
      }
      else {
        // $("#noSelectedMedToPrescribe").modal('show');
      }
    });

    //Adding Investigation Items
    if (invItems.length > 0) {
      this.showInvListdiv = true;
      invItems.forEach((invEle: any) => {
        this.investigationsList.push({
          ID: this.investigationsList.length + 1, SOrN: 'N', Name: invEle.ProcedureName, Specialisation: invEle.ItemSpecialisation, Quantity: 1,
          ServiceItemId: invEle.ProcedureID, SpecialisationId: invEle.ItemSpecialisationID, ServiceTypeId: invEle.ServiceTypeID, SpecimenId: invEle.SpecimenID,
          Remarks: invEle.Remarks, IsFav: 0, Status: 0, disableDelete: false, TATRemarks: "", ResultStatus: invEle.ResultStatus,
          ItemPrice: this.selectedCard.BillType === 'Insured' ? invEle.CompanyPrice : invEle.BasePrice,
          DEPARTMENTID: invEle.DepartmentID
        });
      });

    }
    //Adding Procedure Items
    if (procItems.length > 0) {
      this.showProcListdiv = true;
      procItems.forEach((procEle: any) => {
        this.proceduresList.push({
          ID: this.proceduresList.length + 1, SOrN: 'N', Name: procEle.Name, Specialisation: procEle.Specialisation, Quantity: 1,
          ServiceItemId: procEle.ProcedureID, SpecialisationId: procEle.SpecialiseID, ServiceTypeId: procEle.ServiceTypeID,
          Remarks: procEle.Remarks, IsFav: procEle.IsFav, Status: 0, disableDelete: false, TATRemarks: '', ResultStatus: '',
          ItemPrice: this.selectedCard.BillType === 'Insured' ? procEle.CompanyPrice : procEle.BasePrice,
          DEPARTMENTID: procEle.DepartmentID
        });
      });

    }
    $('#orderPacksModal').modal('hide');
  }

  dentalOtherClick() {
    this.dentalOthers = !this.dentalOthers;
    if (this.dentalOthers) {
      this.selectedTeethList.push({
        TeethNo: 'Others', TeethFDI: 0, TeethID: 0, TeethName: 'Others', TeethSection: 'Others',
        ProcedureID: 0
      });
    }
    else {

    }
    this.clearDental(true);
  }

  getActiveMedication(): number {
    let count = 0;
    if (this.previousMedicationListDetails?.length > 0) {
      count = this.previousMedicationListDetails.filter((element: any) => element.StatusID.toString() === '1').length;
    }
    return count;
  }

  getActiveHomeMedication(): number {
    let count = 0;
    if (this.previousMedicationListDetailsFilterData?.length > 0) {
      count = this.previousMedicationListDetailsFilterData.filter((element: any) => element.StatusID.toString() === '1').length;
    }
    return count;
  }

  FetchPrescriptionIVIMDataList: any = [];

  openIVIM() {
    this.FetchPrescriptionIVIMDataList = [];
    const url = this.us.getApiUrl('FetchPrescriptionIVIM?AdmissionID=${AdmissionID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}', {
      AdmissionID: this.selectedPatientAdmissionId,
      WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalId
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.FetchPrescriptionIVIMDataList = [...response.FetchPrescriptionIVIMDataList];
        $('#IVModal').modal('show');
      }
    });
  }

  onIVIMSelect() {
    const selectedItems = this.FetchPrescriptionIVIMDataList.filter((element: any) => element.selected);
    if (selectedItems.length > 0) {
      $('#IVModal').modal('hide');
      let find = selectedItems;
      let subscribes: ObservableInput<any>[] = [];
      find.forEach((item: any) => {
        subscribes.push(
          this.config.fetchItemForPrescriptions(this.patientType,
            item.ItemID,
            "1",
            this.doctorDetails[0].UserId,
            this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
            this.hospitalId,
            this.doctorDetails[0].EmpId)
        );
      });
      combineLatest(subscribes).subscribe(responses => {
        responses.forEach((response, index) => {
          this.config.displayScheduleAndQuantity(
            this.doctorDetails[0].UserId,
            this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
            1, //Freq Val
            1, //Current Index
            1, //Dosage Unit
            1, //Duration Unit
            3,
            1,
            0,
            response.ItemDataList[0].ItemID,
            response.ItemDataList[0].OPDefaultUomID,
            moment(new Date()).format('DD-MMM-YYYY'),
            this.patientType == "3" ? "1" : this.patientType,
            0,
            this.hospitalId).subscribe((res: any) => {
              const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
              this.selectedItemsList.push({
                SlNo: this.selectedItemsList.length + 1,
                Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
                ClassSelected: false,
                ItemId: response.ItemDataList[0].ItemID,
                ItemCode: response.ItemDataList[0].ItemCode,
                ItemName: response.ItemDataList[0].DisplayName,
                Strength: response.ItemDataList[0].Strength + " " + response.ItemDataList[0].StrengthUoM,
                StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
                Dosage: response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
                DosageId: response.ItemDataList[0].QtyUomID,
                AdmRouteId: selectedItems[index].AdmRouteID,
                Route: selectedItems[index].AdmRoute,
                StrengthDosage: '',
                NoStockColor: '',
                StockColor: '',
                FrequencyId: 1,
                Frequency: 'Once Daily',
                ScheduleStartDate: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                StartFrom: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                DurationId: 3,
                Duration: '1 Days',
                DurationValue: 1,
                PresInstr: "",
                Quantity: res.FetchItemQtyDataCDataaList[0].IssuingtotQty,
                QuantityUOMId: response.DefaultUOMDataaList[0].IssueUOMID,
                QuantityUOM: response.DefaultUOMDataaList[0].IssueUOM,
                PresType: "",
                PRNType: '',
                GenericId: response.ItemDataList[0].GenericID,
                DefaultUOMID: (this.patientType === '2' || this.patientType === '4') ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
                medInstructionId: "",
                PRNReason: "",
                IssueUoM: response.DefaultUOMDataaList[0].IssueUOM,
                IssueUOMID: response.DefaultUOMDataaList[0].IssueUOMID,
                IssueUOMValue: res.FetchItemQtyDataCDataaList[0].IssuingtotQty,
                IssueTypeUOM: itempacking[0].FromUoMID,
                PrescriptionID: '',
                lexicomAlertIcon: '',
                QOH: (this.patientType == "2" || this.patientType == "4") ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
                IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
                BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '' ? response.ItemDataList[0].Basesolution : '',
                IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '' ? response.ItemDataList[0].IVFluidExpiry : '',
                Price: response.ItemPriceDataList[0].MRP,
                ScheduleEndDate: res.FetchItemQtyDataCDataaList[0].EDT,
                viewMore: false,
                IsAntibiotic: response.ItemDataList[0].IsAntibiotic,
                IsAntibioticForm: response.ItemDataList[0].IsAntibioticForm,
                Remarks: '',
                PrescribedQty: response.ItemDataList[0].PrescribedQty
              });
              this.createGaugeChart();
            });
        });
      });
    }
  }

  showDiagnosisModal = false;
  openAddDiagnosisModal() {
    this.showDiagnosisModal = true;
    $('#addDiagnosisModal').modal('show');
  }

  async onDiagnosisSaveChanges() {
    $('#addDiagnosisModal').modal('hide');
    this.showDiagnosisModal = false;
    const response = await this.config.FetchVisitDiagnosis(this.selectedPatientAdmissionId).toPromise();
    if (response.Code === 200) {
      this.visitDiagnosis = response.GetVisitDiagnosisList.sort((a: any, b: any) => a.DiseaseName.localeCompare(b.DiseaseName));
    }

    this.investigationsList.forEach((element: any) => {
      const id = element.DISID || element.DiagnosisId;
      const isFound = this.visitDiagnosis.find((e: any) => e.DiseaseID == id);
      if (!isFound) {
        element.DISID = '';
        element.DiagnosisId = '';
        element.DiagnosisName = '';
      }
    });
    this.proceduresList.forEach((element: any) => {
      const id = element.DISID || element.DiagnosisId;
      const isFound = this.visitDiagnosis.find((e: any) => e.DiseaseID == id);
      if (!isFound) {
        element.DISID = '';
        element.DiagnosisId = '';
        element.DiagnosisName = '';
      }
    });

    this.selectedItemsList.forEach((element: any) => {
      const id = element.DISID || element.DiagnosisId;
      const isFound = this.visitDiagnosis.find((e: any) => e.DiseaseID == id);
      if (!isFound) {
        element.DISID = '';
        element.DiagnosisId = '';
        element.DiagnosisName = '';
      }
    });
    this.savechanges.emit('Diagnosis Update');
  }

  deleteFavoriteItem(index: any, item: any, items: any) {
    const favMed = [{
      "SEQ": 1,
      "ITM": item.ItemID,
      "DOS": item.IssueUOM,
      "DOID": item.DoseID,
      "FID": item.FrequencyID,
      "DUR": item.Duration,
      "ARI": item.AdmRouteID,
      "DUID": item.DurationID,
      "SFRM": new Date(),
      "REM": item.Remarks,
      "JUST": "",
      "REM2L": "",
      "STM": new Date(),
      "FQTY": item.IssueUOMID,
      "QTY": item.IssuingtotQty,
      "QTYUOMID": item.DoseID,
      "PIID": 0,
    }];

    let payload = {
      "EmpID": this.doctorDetails[0].EmpId,
      "SpecilizationID": this.doctorDetails[0].EmpSpecialisationId,
      "ActionType": 3,
      "PDetails": [],
      "IDetails": [],
      "DDetails": favMed,
      "DADetails": []
    }
    this.config.saveFavouriteProcedure(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          items.splice(index, 1);
        }
      },
      (err) => {
        console.log(err)
      });
  }

  calculateAge(dob: Date): AgeResult {
    const today = new Date();

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();

  if (today.getDate() < dob.getDate()) months--;

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = years * 12 + months;

  return { years, months, totalMonths };
  }



  prepareMediSpanPayload() {
    let drugs: any[] = [];
    drugs = this.selectedItemsList.map((item: any, index: number) => {
      return {
        "InstanceId": "D0" + (index + 1),//D & slno
        "Code": item.ItemCode,//itemcode
        "Name": item.ItemName,//itemname
        "Category": 1,//take from enumeration
        "Route": item.AdmRouteId.toString(),//admrouteid from our table
        "Instruction": {
          "InstanceId": "D0" + (index + 1) + ".I" + (index + 1),//d %slno .I & slno
          "DoseValue": parseFloat(item.Dosage.split(' ')[0]),//strength value
          "DoseUnit": item.Strength?.split(' ')[1].toString(),//strength unit
          "DoseTotal": null,//null always
          "DoseDuration": null,//null always
          "Frequency": item.FrequencyId.toString(),//frequencyid from our table
          "FirstAdministration": new Date().toISOString(),//current datetime in iso format
          "Duration": item.Duration.split(' ')[0],//duration days
          "LastAdministration": null//null always
        },
        "Instructions": [],//empty array always
        "LifetimeDoseValue": null,//null always
        "LifetimeDoseUnit": "",//empty string always
        "OneTime": null,//null always  
        "PRN": false,//false always
        "SetId": ""//empty string always
      };
    });

    let diagnosis: any[] = [];
    diagnosis = this.visitDiagnosis.map((diag: any, index: number) => {
      return {
        "InstanceId": "C" + (index + 1),//C & slno
        "Code": diag.DiseaseCode.split('-')[0],//diag code
        "Name": diag.DiseaseName.split('-')[1],//diag name
        "Category": 2//take from enumeration
      };
    });

    let allergies: any[] = [];
    const foodAllergies = this.patientAllergies.filter((allergy: any) => allergy.type === 'food');
    const drugAllergies = this.patientAllergies.filter((allergy: any) => allergy.type === 'drug');
    const otherAllergies = this.patientAllergies.filter((allergy: any) => allergy.type === 'other');
    let allergyIndex = 1;
    foodAllergies.forEach((allergy: any) => {
      allergies.push({
        "InstanceId": "A" + (allergyIndex),//A & slno
        "Code": "F" + (allergyIndex),//allergy code
        "Name": allergy.FdIngrName,//allergy name
        "Category": 1,//take from enumeration
        "Severity": "",//empty string always
        "Symptoms": []//list of symptoms if any
      });
      allergyIndex++;
    });
    drugAllergies.forEach((allergy: any) => {
      allergies.push({
        "InstanceId": "A" + (allergyIndex),//A & slno
        "Code": "D" + (allergyIndex),//allergy code
        "Name": allergy.GenericName,//allergy name
        "Category": 1,//take from enumeration
        "Severity": "",//empty string always
        "Symptoms": []//list of symptoms if any
      });
      allergyIndex++;
    });
    otherAllergies.forEach((allergy: any) => {
      allergies.push({
        "InstanceId": "A" + (allergyIndex),//A & slno
        "Code": "O" + (allergyIndex),//allergy code
        "Name": allergy.Allergy,//allergy name
        "Category": 1,//take from enumeration
        "Severity": "",//empty string always
        "Symptoms": []//list of symptoms if any
      });
      allergyIndex++;
    });
    
    const payload =
    {
        "SessionId": this.selectedCard?.AdmissionID.toString(),//admissionid
        "OrderId": "RX-" + this.selectedCard?.AdmissionID,//"RX-123456",//admissionnumber
        "ClinicianType": ClinicianTypes.Doctor,//refer from enumaration
        "ClinicianWorkFlow": ClinicianWorkFlow.OrderEntry,//refer from enumaration
        //static- send as is
        "Settings": {
            "OverrideSet": null,
            "InlineIcons": 3,
            "SummaryIcons": 2,
            "ShowPreviousOrderIcons": false,
            "NameFormatting": {
                "MessagePrefix": "\u003Cb\u003E",
                "MessageSuffix": "\u003C/b\u003E",
                "SummaryPrefix": "\u003Cb\u003E",
                "SummarySuffix": "\u003C/b\u003E",
                "TooltipPrefix": "\u003Cb\u003E",
                "TooltipSuffix": "\u003C/b\u003E"
            },
            "ShowMonograph": true,
            "ShowLexicompMonograph": false,
            "Interactions": {
                "EnableDrugDrug": true,
                "EnableFood": true,
                "EnableAlcohol": true,
                "IgnoreSameSet": false,
                "IgnoreNotScreenedHistory": true,
                "Severity": "",
                "DocumentationForMajor": "",
                "DocumentationForModerate": "",
                "DocumentationForMinor": "",
                "Management": "",
                "LabeledAvoidance": ""
            },
            "Allergies": {
                "Enable": true,
                "AllergenicActivity": 2,
                "ShowIngredientMonograph": false
            },
            "DuplicateTherapy": {
                "Enable": true,
                "IgnoreNewOrderGeneric": false,
                "IgnoreSameSet": false,
                "ShowDuplicateProduct": true,
                "ShowDuplicateIngredient": true,
                "UseClassesAlways": true,
                "ShowMonograph": false
            },
            "Dosing": {
                "EnableDrug": true,
                "EnableIngredient": true,
                "MatchDoseType": 1,
                "AllowConditionalPass": false,
                "UseDefaultWeightBSA": false,
                "IgnoreNoRenalFunction": false,
                "IgnoreInfoOnly": false,
                "IgnoreNotSetInstructions": false,
                "ShowSingleDose": true,
                "ShowDailyDose": true,
                "ShowFrequency": true,
                "ShowDuration": true,
                "ShowLifetime": true,
                "ShowMonograph": false
            },
            "Disease": {
                "Enable": true,
                "Severity": ""
            },
            "Pregnancy": {
                "Enable": true,
                "Severity": ""
            },
            "Lactation": {
                "Enable": true,
                "Severity": ""
            },
            "Age": {
                "Enable": true,
                "Severity": ""
            },
            "Gender": {
                "Enable": true,
                "Severity": ""
            },
            "Route": {
                "Enable": true,
                "Severity": ""
            }
        },
        //dynamic- send as per patient data
        "Patient": {
            "PatientId": this.selectedCard.SSN,//ssn
            "BirthDate": this.datepipe.transform(new Date(this.selectedCard.DOB.replace(/-/g, ' ')),'yyyy-MM-ddTHH:mm:ss'), //this.selectedCard.DOB,//dob 
            "ExpectedBirthDate": null,//null always
            "Gender": this.selectedCard.GenderID,//genderid - take from enumeration
            "Weight": this.selectedCard.Weight,//weight
            "BodySurfaceArea": null,//null always
            "Height": this.selectedCard.Height,//height
            "SerumCreatinine": null,//0.9//if there is serum creatinine value latest one else null
            "SerumCreatinineUnit": null,//"mg/dL",//same as is
            "CreatinineClearance": null,//127,//if there is creatinine clearance value latest one else null
            "CreatinineClearanceUnit": null,//"mL/min",//same as is
            "GlomerularFiltrationRate": null,//99,//if there is egfr value latest one else null
            "GlomerularFiltrationRateUnit": null,//"mL/min/1.73m2",//same as is
            "Pregnant": this.selectedCard.IsPregnancy == 1 ? true : false,//if patient is pregnant true else false
            "Lactating": this.pregnancyHistoryDetails?.Lactating == '1' ? true : false,//if patient is lactating true else false
            "Drugs": drugs,
            "Conditions": diagnosis,
            "Allergies": allergies,
        },
        "SuppressMessageIds": {}//empty object always
    }

    this.us.postfullurl(prescription.MediSpanUrl, payload).subscribe((response: any) => {
      if (response.Code === 200) {
      }
      },
      (err) => {

      });

    //http://10.132.23.200:9090/Medispan/Screen
  }

}

interface FavouriteInvProc {
  ServiceID: string
  ProcedureID: string,
  ItemSpecialiseID: string;
  group: string;
  name: string;
  isSelected?: boolean;
}
interface FavouriteMedication {

  group: string;
  name: string;
  ItemID: string;
  DrugName: string;
  StrengthDosage: string;
  Dose: string;
  DoseID: string;
  DoseUOM: string;
  AdmRouteID: string;
  AdmRoute: string;
  GenericID: string;
  GenericName: string;
  FrequencyID: string;
  Frequency: string;
  DurationID: string;
  Duration: string;
  DurationUOM: string;
  IsGenericDouble: string;
  LexicomItemID: string;
  IssueUOM: string;
  IssueUOMID: string;
  totQty: string;
  IssuingtotQty: string;
  NoStockColor: string;
  StockColor: string;
  Remarks: string;
  IsMilk: number;
}
interface TreeItem {
  text: string;
  value: any;
  disabled?: boolean;
  checked?: boolean;
  collapsed?: boolean;
  children?: TreeItem[];
}

const prescription = {
  FetchPatientActiveMedication: 'FetchPatientActiveMedication?PatientID=${PatientID}&AdmissionID=${AdmissionID}&WardID=${WardID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientActiveMedicationPrint: 'FetchPatientActiveMedicationPrint?PatientID=${PatientID}&AdmissionID=${AdmissionID}&WardID=${WardID}&UserName=${UserName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPrescriptionOrderPacksPedia: 'FetchPrescriptionOrderPacksPedia?EmpID=${EmpID}&SpecialisationID=${SpecialisationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPrescriptionOrderPacksPediaSelected: 'FetchPrescriptionOrderPacksPediaSelected?OrderPackID=${OrderPackID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchItemSpecialisationValidation: 'FetchItemSpecialisationValidation?ItemIDs=${ItemIDs}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientPrescriptionDetails: 'FetchPatientPrescriptionDetails?PatientID=${PatientID}&ItemID=${ItemID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  MediSpanUrl: 'http://10.132.23.200:9090/Medispan/Screen'
}

export const enum ClinicianTypes
{
    //
    // Summary:
    //     The user who reviewed this alert is a doctor.
    Doctor,
    //
    // Summary:
    //     The user who reviewed this alert is a nurse.
    
    Nurse,
    //
    // Summary:
    //     The user who reviewed this alert is a pharmacist.
    Pharmacist,
    //
    // Summary:
    //     The user who reviewed this alert is a physician assistant.
    PhysicianAssistant,
    //
    // Summary:
    //     The user who reviewed this alert is other than defined.
    Other,
    //
    // Summary:
    //     The user who reviewed this alert is not specified.
    NotSpecified
}

export const enum ClinicianWorkFlow
{
    //
    // Summary:
    //     The purpose of screening when it is for Order Entry.
    
    OrderEntry,
    //
    // Summary:
    //     The purpose of screening when it is for Pharmacy Review.
    
    PharmacyReview,
    //
    // Summary:
    //     The purpose of screening when it is for Pharmacy Dispensing.
    
    PharmacyDispensing,
    //
    // Summary:
    //     The purpose of screening when it is for Medication Administration.
    
    MedicationAdministration,
    //
    // Summary:
    //     The purpose of screening when it is for Medication Reconciliation.
    
    MedicationReconciliation,
    //
    // Summary:
    //     The purpose of screening when it is for Clinical Documentation.
    
    ClinicalDocumentation,
    //
    // Summary:
    //     The purpose of screening when it is for Allergy Recording.
    
    AllergyRecording,
    //
    // Summary:
    //     The purpose of screening when it is for Patient History.
    
    PatientHistory,
    //
    // Summary:
    //     The purpose of screening when it is for Configuration.
    
    Configuration,
    //
    // Summary:
    //     The purpose of screening when it is for Other.
    
    Other,
    //
    // Summary:
    //     The purpose of screening when it is not specified.
    
    NotSpecified
}

export const enum ScreenCategory
{
    /// <summary>
    /// Newly ordered/prescribed medications.
    /// This will trigger all alerts.
    /// </summary>
    NewOrder = 1,

    /// <summary>
    /// Previously ordered medications, either current or history.
    /// This will only trigger alerts if it has a problem with another new/search input.
    /// </summary>
    PreviousOrder = 2,

    /// <summary>
    /// Candidate drugs that the user may be considering, e.g., from a drug search or order set.
    /// This will trigger all alerts, but not with other Search Result drugs.
    /// </summary>
    SearchResult = 3
}

export const enum ScreenCategory
{
    /// <summary>
    /// Known allergy for the patient.
    /// </summary>
    CurrentAllergy = 1,

    /// <summary>
    /// Only used if the user is entering this as a new allergy now.
    /// This will trigger alerts, including those against previously ordered medications.
    /// </summary>
    NewAllergy = 2
}

export const enum ScreenCategory
{
    /// <summary>
    /// Indications for the new order.
    /// This will only trigger alerts for new/search medications, but will also be used as the drug indication for dosing.
    /// </summary>
    CurrentDiagnosis = 1,

    /// <summary>
    /// Chronic conditions or other conditions unrelated to the new order.
    /// This will only trigger alerts for new/search medications.
    /// </summary>
    ExistingCondition = 2,

    /// <summary>
    /// Only used if the user is entering this as a new condition now.
    /// This will trigger all alerts, including those against previously ordered medications.
    /// </summary>
    NewCondition = 3
}
interface AgeResult {
  years: number;
  months: number;
  totalMonths: number;
}
