import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef, Renderer2, EventEmitter, QueryList, ViewChildren, AfterViewInit, Output, Input, OnDestroy } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DrugAllergy, FoodAllergy, OtherAllergy } from '../patient-casesheet/prescription-interface';
import { PrescriptionComponent } from '../prescription/prescription.component';
import { CanComponentDeactivate } from 'src/app/can-deactivate.guard';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { DischargeSummaryComponent } from '../portal/discharge-summary/discharge-summary.component';
import { PulmonologyDiseasesComponent } from '../pulmonology-diseases/pulmonology-diseases.component';
import { ConsentHroComponent } from '../consent-hro/consent-hro.component';
import { GeneralconsentComponent } from '../generalconsent/generalconsent.component';
import { ConsentMedicalComponent } from '../consent-medical/consent-medical.component';
import { MedicalAssessmentComponent } from '../medical-assessment/medical-assessment.component';
import { MedicalAssessmentObstericComponent } from '../medical-assessment-obsteric/medical-assessment-obsteric.component';
import { MedicalAssessmentPediaComponent } from '../medical-assessment-pedia/medical-assessment-pedia.component';
import { MedicalAssessmentSurgicalComponent } from '../medical-assessment-surgical/medical-assessment-surgical.component';
import { CardiologyAssessmentComponent } from '../cardiology-assessment/cardiology-assessment.component';
import { AnesthesiaAssessmentComponent } from '../anesthesia-assessment/anesthesia-assessment.component';
import { PreAnesthesiaAssessmentComponent } from '../pre-anesthesia-assessment/pre-anesthesia-assessment.component';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { UtilityService } from 'src/app/shared/utility.service';
import { ParentalCareInitialComponent } from '../parental-care-initial/parental-care-initial.component';
import { PulmonologyDiseasesOpdnoteComponent } from '../pulmonology-diseases-opdnote/pulmonology-diseases-opdnote.component';
import { DoctorDiagnosisComponent } from '../doctor-diagnosis/doctor-diagnosis.component';
import { OpProgressNotesComponent } from '../op-progress-notes/op-progress-notes.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { SickleaveComponent } from '../sickleave/sickleave.component';
import { ViewapprovalrequestComponent } from '../viewapprovalrequest/viewapprovalrequest.component';
import { BiometricService } from 'src/app/services/biometric.service';
import { SpeechService, SpeechState } from 'src/app/shared/speech.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  selector: 'app-doctor-casesheet',
  templateUrl: './doctor-casesheet.component.html',
  styleUrls: ['./doctor-casesheet.component.scss'],
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
export class DoctorCasesheetComponent implements OnInit, CanComponentDeactivate, OnDestroy {
  activeAssessmentTab = 'chief_complaints';
  charAreaSpline!: Highcharts.Chart
  isAllergySubmitted: any;
  allergiesList: any;
  drugallergiesList: any;
  foodallergiesList: any;
  otherallergiesList: any;
  allergyType: any = 'Drug';
  isAllergy: any = false;
  showEndofEpisodeDateTime: boolean = false;
  showFollowupForm: boolean = false;
  showResultsinPopUp = false;
  showPatientSummaryinPopUp = false;
  eyeLensForm: any;
  followupForm: any;
  followupFormNA: boolean = false;
  FollowAfter: any = 0;
  IsBiometric = true;
  isDisabled = false;
  nphiesPatientDataHtmlContent: SafeHtml | undefined;

  @ViewChild('chartLineAreaSpline', { static: true }) chartLineAreaSpline!: ElementRef;
  @ViewChild('chartLineSpline', { static: true }) chartLineSpline!: ElementRef;
  @ViewChild('chartLine', { static: true }) chartLine!: ElementRef;
  @ViewChild('chartColumn', { static: true }) chartColumn!: ElementRef;
  @ViewChild('allergyYes') allergyYes!: ElementRef<HTMLElement>;

  @ViewChild('clinical', { static: true }) clinical!: ElementRef;
  @ViewChild('assessment', { static: true }) assessment!: ElementRef;
  @ViewChild('diagnosis', { static: true }) diagnosis!: ElementRef;
  @ViewChild('prescription', { static: true }) prescription!: ElementRef;
  @ViewChild('advice', { static: true }) advice!: ElementRef;
  @ViewChild('typeofprecautions', { static: true }) typeofprecautions!: ElementRef;
  @ViewChild('summary', { static: true }) summary!: ElementRef;
  @ViewChild('others', { static: true }) others!: ElementRef;
  @ViewChild('eforms', { static: true }) eforms!: ElementRef;
  @ViewChild('doctorrequest', { static: true }) doctorrequest!: ElementRef;
  @ViewChild('sickleave', { static: true }) sickleave!: ElementRef;
  @ViewChild('instructionstonurse', { static: true }) instructionstonurse!: ElementRef;
  @ViewChild('DoctorDiagnosis', { static: false }) DoctorDiagnosisComponent: DoctorDiagnosisComponent | undefined;
  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;

  number = Number;

  drugList: DrugAllergy[] = [];
  foodList: FoodAllergy[] = [];
  otherallergyList: OtherAllergy[] = [];
  severityForFoodAllergy: any;
  allergyList: any;
  topFoodAllergyList: any;
  allergyForm!: FormGroup;
  drugAllergy!: DrugAllergy;
  childClickName: any;
  charttype = 'W';
  childTabClickName: any;

  tablePatientsForm!: FormGroup;
  painScoreGraphForm!: FormGroup;
  @ViewChild(PrescriptionComponent) PrescriptionComponent!: PrescriptionComponent;
  recordsAddedAndRemoved: any;
  isAllergydeleted: boolean = false;
  deletedAllergy: string = "";
  listOfSpecItems: any;
  FetchClinicalInfoDataList: any;
  selectedPrevCcVisitdate = "";
  trustedUrl: any;
  patientCaseRecVisits: any = [];
  EyeLensInfoID: any = '0';
  clinicalConditionMessage: string = '';
  lmpMinDate: any;
  physicalExaminationStatus: any = '';
  inputDynamicType: any;
  inputDynamicValue: any;
  inputDynamicList: any;
  inputErrorMessage: any;
  @ViewChild('divPhysicalExamination')
  divPhysicalExamination!: ElementRef;
  @ViewChild('divPrevPhysicalExamination')
  divPrevPhysicalExamination!: ElementRef;

  FetchPhysicalExaminationStatusDataList: any;
  showNoofDaysFollowUp: boolean = false;
  callChildFunction() {
    this.isRXorder = true;
    this.PrescriptionComponent?.FetchOrderPacks();
  }
  paramter: any;
  tableVitals: any;
  tableVitalHypertensionParameters: any;
  hypertension: any;
  remarkForm: any;
  isSubmitted: any = false;
  paitentRowData: any;
  episodeId: any;
  VisitID: any;
  MonitorID: any;
  tokenNoLabel: string = '';
  selectedItems: any[] = [];
  admisionID: any;
  afterSaveData: any;
  seletedPreviewsData: any;
  isSeletedRowData = true;
  doctorDetails: any;
  selectedView: any;
  selectedCard: any;
  doctorID: any;
  OPConsultationID: any;
  PatientID: any;
  AdmissionID: any;
  SpecialiseID: any;
  BillID: any;
  searchQuery: string = '';
  allergyQuery: string = '';
  filters: any;
  selectedRows: any
  selected: boolean = false;
  listOfItems: any;
  isSelctedRow = true;
  selectedPatientAdmissionId: any;
  OrderType: any;
  favNewDetailListData: any[] = [];
  filteredData: any[] = [];
  Admissionid: any;
  tableVitalsList: any;
  tableVitalsListFiltered: any;
  hospId: any;
  patientDetails: any;
  colorN: any;
  isRXorder: boolean = false;
  isdetailShow = false;
  location: any;
  currentdate: any;
  currentdateN: any;
  currentTime: any;
  currentTimeN: Date = new Date();
  interval: any;
  painScore: any;
  clinicalCondition: any;
  pregnancyValue: any = 'No';
  allrgyValue: any = 'No';
  smokingValue: any = 'No';
  alcoholValue: any = 'No';
  sleepValue: any = 'No';
  educatedValue: any = 'Yes';
  smokingInfoSaved: boolean = false;
  age: number = 16;
  gender: string = 'female';
  pregnancyToggle: boolean = false;
  langData: any;
  lang: any;
  EpisodeID: any;
  pregenencyHistoryList: any;
  LMPEDDList: any;
  openToggleYes: boolean = false;
  smokingYesNo = true;
  smokingIconStick = true;
  smokingIconPack = false;
  smokingIconHookah = false;
  smokelength = "2";
  smokevalue = "0";
  showHidePregnancyToggle: boolean = false;
  Age_Gender: any;
  scheduleStartDate!: Array<any>;
  pregnancyForm: FormGroup;
  clinicalConditionsForm: FormGroup;
  lmpDate: any;
  lactationToggleYes: any = "fs-7 btn";
  lactationToggleNo: any = "fs-7 btn selected";
  lactationSelected: any;
  Disposition: any;
  admissionRequestRaised: boolean = false;
  FetchPatientAdmissionRequestAndSurgeryRequestDataList: any;
  isBPsys: boolean = false;
  isBPdia: boolean = false;
  isTemperature: boolean = false;
  testorderresults: any;
  svgHighLow: any;
  isPulse: boolean = false;
  isSPO2: boolean = false;
  isRespiration: boolean = false;
  isO2FlowRate: boolean = false;
  bpmsg: boolean = false;
  temparaturepmsg: boolean = false;
  ishigh: any
  islow: any
  BPsys_value: any = null
  BPdia_value: any = null
  Temp_value: any = null
  low: any;
  high: any;
  AllergyData: any;
  isAreaSplineActive: boolean = false;
  isSplineActive: boolean = true;
  isLineActive: boolean = false;
  isColumnActive: boolean = false;
  activeButton: string = 'spline';
  endofEpisode: any;
  showendofEpisodeRemarks = false;
  endofEpsiodeDate: any;
  showAllergydiv: boolean = false;
  painScoreSelected: boolean = false;
  showPSValidation: boolean = false;
  showVitalsValidation: boolean = false;
  showdurationofIllnessValidation: boolean = false;
  showHeightValidation: boolean = false;
  showWeightValidation: boolean = false;
  clinicalConditionValidation: boolean = false;
  PaitentArrivalValidation: boolean = false;
  vitalsValidation: boolean = false;
  selectedParameter: any;
  remarksMap: Map<number, string> = new Map<number, string>();
  recordRemarks: Map<number, string> = new Map<number, string>();
  patientVisits: any = [];
  primaryDoctors: any = [];
  diffInDays: any;
  printformats: any = [];
  selectedPrintFormat: string = "";
  validationMsg: string = "";
  sickDatesValid: boolean = true;
  btnOP: string = "fs-7 btn selected";
  btnIP: string = "fs-7 btn";
  btnEnglish: string = "fs-7 btn selected";
  btnArabic: string = "fs-7 btn";
  errorMessage: any;
  rowIndex: any;
  algType: any;
  isEdit: any = false;
  tableVitalsScores: any;
  showParamValidationMessage: boolean = false;
  parameterErrorMessage: string = "";
  clinicalConditionsValidationMsg: any;
  SelectedViewClass: any;
  pendingChanges = false;
  clickedtab = '';
  SmokingCategory = 1;
  SmokingInfoId = 0;
  isClearAllergyPopup: boolean = false;
  ctasScore: string = "";
  ctasScoreDesc: string = "";
  endofepisodedate: string = moment(new Date()).format('DD-MMM-YYYY');
  ctasScore1Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore2Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore3Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore4Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore5Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  emrNurseChiefComplaint: any;
  emrTriageChiefComplaint: any;
  emrNurseHistoryofPresentIllness: any;
  emrNurseAssessmentPlan: any;

  multipleChiefComplaints: any = [];
  emrNursePhysicalExamination: any;
  ChiefExaminationID: number = 0;
  errorMessages: any[] = [];
  modeofArrival: any;
  SavedChiefComplaints: any;
  TriageLOS: any;
  VTCreateDate: any;
  isMyself: boolean = true;
  onBehalfofPatient: boolean = true;
  relationshipList: any;
  IsNurse: any;
  painScoreHistory: any;
  emrAdmissionForm: any;
  referralSpecialization = false;
  referralDoctor = false;
  referralWard = false;
  FetchPatientVisitDataList: any = [];
  FetchPatientChiefComplaintDataaList: any = [];
  prevChiefCompl = "";
  prevPhyExam = "";
  prevHistoryPresent = "";
  prevAssessmentPlan = "";
  RiskScore: string = "";
  RiskScoreTooltip: string = "";
  showHideFormTabs = false;
  dischargeIntimationRiased = false;
  isPrimarydoc = true;
  deleteAllergyRemarks: any;
  showPatientNotSelectedValidation = false;
  IsNephrologyReferralOrder: any;
  IsOpthalmologyReferralOrder: any;
  IsObgReferralOrder: any;
  IsMamoDiabHyper: any = 0;
  CopiedChiefComplaint = "";
  CopiedPhysicalExamination = "";
  CopiedHistoryofPresentIllness = "";
  CopiedAssessmentPlan = "";
  Copied = '';
  fromOtDashboard: boolean = false;
  followUpSubmitted: boolean = false;

  get items(): FormArray {
    return this.remarkForm.get('items') as FormArray;
  }
  /**
   *
   * @param event here used for reloading function
   */
  // @HostListener('click', ['$event'])
  // isRXorders(event: MouseEvent) {

  // if (this.clickCount === 0) {
  //   this.isRXorder = true;
  // } else {
  //   this.isRXorder = false;
  // }

  // }

  showChildComponent = false;
  remarksSelectedIndex: number = -1;
  todayDate: any;
  selectedPainScoreId = "0";
  favDiag: any = [];
  totalScore = 0;


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
  selectedPatientIsVip: boolean = false;
  selectedPatientClinicalInfo: any;
  selectedPatientIsPregnancy: boolean = false;
  selectedPatientPregnancyTrisemister: any;
  selectall = false;
  FetchGrowthChartOutputLists: any = [];
  FetchGrowthChartPatientOutputLists: any = [];
  selectedButtonType = "";
  duringactiveButton: any = 'spline';
  toggleSelected(type: string): void {
    this.duringactiveButton = type;
    this.selectedButtonType = type;
  }
  IsBornBaby = true;
  IsAdult = true;
  IsHeadCircumference = true;
  initialFormValue: any;
  isDirty = false;
  afterFetch = false;
  activeTab: string = 'clinical';
  facility: any;
  FetchSmokingInfoOutputLists: any;
  IsDoctor: any;
  IsEmergency: any;
  PrescriptionRestriction: string = "";
  eligibleBedTypeList: any = [];
  SpecializationList: any;
  isemrPatientAdmission = false;
  obgyneFormType = "";
  patientRace = "0";
  unitType = "1";
  isDiabetic = "0";
  isSmoker = "0";
  isHypertension = "0";
  FromPrevRefDocCalendar = 'false';
  patientAge = 0;

  remarksNotEntered: any;
  showRemarksMessage: boolean = false;
  consciousnessData: any = [];
  FetchPatientBMIGrowthChartData: any = [];
  behaviourData: any = [];
  consciousnessSelectionValue: any;
  behaviourSelectionValue: any;
  fromAkuWorklist: string = "false";
  patinfo: any;
  heightClass = "afterlabel_form d-flex align-items-end gap-2 border-end";
  HeightWeightt: any;
  heightClassColor = "form-label alert_label_Height fw-bold fs-7";
  showNephroOrthoReferral: boolean = false;
  raiseRefSpecList: any = [];
  raiseobgyneSpecList: any = [];
  showMamography: boolean = false;
  isNephro: boolean = false;
  isOptha: boolean = false;

  doctorFavourites: any[] = [];
  selectedDoctorFavourite: any;
  favouriteChiefComplaintsText: any;
  favouritePhysicalExaminationText: any;
  favouriteSubjectiveText: any;
  favouriteAssessmentText: any;
  favouriteTemplateName: any;
  favouriteDoctorNameText: any;
  fromAnesthesiaWorklist: boolean = false;

  showDiagnosisContent: boolean = true;

  @ViewChild('SignRef', { static: false }) signComponent: DischargeSummaryComponent | undefined;
  @ViewChild('PulmRef', { static: false }) pulmComponent: PulmonologyDiseasesComponent | undefined;
  @ViewChild('PulmDisRef', { static: false }) pulmdisComponent: PulmonologyDiseasesOpdnoteComponent | undefined;
  @ViewChild('HRORef', { static: false }) hroComponent: ConsentHroComponent | undefined;
  @ViewChild('GenRef', { static: false }) genConsComponent: GeneralconsentComponent | undefined;
  @ViewChild('MedicalRef', { static: false }) medicalComponent: ConsentMedicalComponent | undefined;
  @ViewChild('medicalassessment', { static: false }) medicalassessment: MedicalAssessmentComponent | undefined;
  @ViewChild('medicalobsteric', { static: false }) medicalobsteric: MedicalAssessmentObstericComponent | undefined;
  @ViewChild('medicalpedia', { static: false }) medicalpedia: MedicalAssessmentPediaComponent | undefined;
  @ViewChild('medicalsurgical', { static: false }) medicalsurgical: MedicalAssessmentSurgicalComponent | undefined;
  @ViewChild('parentalcareinitial', { static: false }) parentalcareinitialassessment: ParentalCareInitialComponent | undefined;
  @ViewChild('cardiology', { static: false }) cardiologyassessment: CardiologyAssessmentComponent | undefined;
  @ViewChild('anesthesia', { static: false }) anesthesia: AnesthesiaAssessmentComponent | undefined;
  @ViewChild('preanesthesia', { static: false }) preanesthesia: PreAnesthesiaAssessmentComponent | undefined;

  @Output() savechanges = new EventEmitter<any>();
  @ViewChild('DoctorDiagnosis', { static: false }) DoctorDiagnosis: DoctorDiagnosisComponent | undefined;
  speechState: SpeechState = {
    isRecording: false,
    isProcessing: false,
    transcript: '',
    error: ''
  };

  private destroy$ = new Subject<void>();
  private currentFocusedTextarea: HTMLTextAreaElement | null = null;

  constructor(private sanitizer: DomSanitizer, private fb: FormBuilder, private config: ConfigService,
    private router: Router, public datepipe: DatePipe, private changeDetectorRef: ChangeDetectorRef,
    private renderer: Renderer2, public dialog: MatDialog, private us: UtilityService,
    private modalService: GenericModalBuilder, private biometricService: BiometricService, private speechService: SpeechService) {
    this.langData = this.config.getLangData();
    this.lang = sessionStorage.getItem("lang");
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    this.selectedPatientAdmissionId = sessionStorage.getItem("selectedPatientAdmissionId");
    if (this.patientDetails.PatientType == '2' || this.patientDetails.PatientType == '4') {
      this.tokenNoLabel = 'Bed No';
      this.IsAdult = Number(this.patientDetails.AgeValue) > 14 ? true : false;
      // this.IsHeadCircumference = Number(this.patientDetails.AgeValue) >= 3 ? true : false;
      this.IsHeadCircumference = ((Number(this.patientDetails.AgeUOMID) == 3 || Number(this.patientDetails.AgeUOMID) == 2 || (Number(this.patientDetails.AgeUOMID) == 1 && Number(this.patientDetails.AgeValue) <= 3))) ? true : false;
      this.IsBornBaby = ((Number(this.patientDetails.AgeUOMID) == 3 || Number(this.patientDetails.AgeUOMID) == 2 || (Number(this.patientDetails.AgeUOMID) == 1 && Number(this.patientDetails.AgeValue) <= 5))) ? true : false;
    }
    else if (this.patientDetails.PatientType == '3') {
      this.tokenNoLabel = '';
      this.IsAdult = Number(this.patientDetails.Age.trim().split(' ')[0]) > 14 ? true : false;
      //this.IsHeadCircumference = Number(this.patientDetails.Age.trim().split(' ')[0]) >= 3 ? true : false;
      this.IsHeadCircumference = ((Number(this.patientDetails.AGeUOMID) == 3 || Number(this.patientDetails.AGeUOMID) == 2 || (Number(this.patientDetails.AGeUOMID) == 1 && Number(this.patientDetails.Age.trim().split(' ')[0]) <= 3))) ? true : false;
      this.IsBornBaby = ((Number(this.patientDetails.AGeUOMID) == 3 || Number(this.patientDetails.AGeUOMID) == 2 || (Number(this.patientDetails.AGeUOMID) == 1 && Number(this.patientDetails.AgeF) <= 5))) ? true : false;
    }
    else {
      this.tokenNoLabel = 'Token No';
      if (this.patientDetails.Age.toString().trim().split(' ').length > 1) {
        const age = this.patientDetails.Age?.trim().split(' ')[0];
        this.IsAdult = Number(age) > 14 ? true : false;
        //this.IsHeadCircumference = Number(age) >= 3 ? true : false;
        this.IsHeadCircumference = ((Number(this.patientDetails.AgeUoMID) == 3 || Number(this.patientDetails.AgeUoMID) == 2 || (Number(this.patientDetails.AgeUoMID) == 1 && Number(age) <= 3))) ? true : false;
        this.IsBornBaby = ((Number(this.patientDetails.AgeUoMID) == 3 || Number(this.patientDetails.AgeUoMID) == 2 || (Number(this.patientDetails.AgeUoMID) == 1 && Number(this.patientDetails.Age) <= 5))) ? true : false;
      }
      else {
        this.IsAdult = Number(this.patientDetails.Age) > 14 ? true : false;
        this.IsHeadCircumference = ((Number(this.patientDetails.AgeUoMID) == 3 || Number(this.patientDetails.AgeUoMID) == 2 || (Number(this.patientDetails.AgeUoMID) == 1 && Number(this.patientDetails.Age) <= 3))) ? true : false;//Number(this.patientDetails.Age) >= 3 ? true : false;
        this.IsBornBaby = ((Number(this.patientDetails.AgeUoMID) == 3 || Number(this.patientDetails.AgeUoMID) == 2 || (Number(this.patientDetails.AgeUoMID) == 1 && Number(this.patientDetails.Age) <= 5))) ? true : false;
      }
    }

    this.remarkForm = this.fb.group({
      CMD: ['', Validators.required]
    });
    this.pregnancyForm = this.fb.group({
      pregYesNo: ['false'],
      lactation: ['false'],
      triSemister: ['0'],
      lmp: [''],
      contraception: ['0'],
      edd: [{ value: '', disabled: true }],
    });
    this.clinicalConditionsForm = this.fb.group({
      DurationOfIllness: [''],
      DurationOfIllnessUOMID: ['0'],
      Weight: [''],
      Height: [''],
      HeadCircumference: [''],
      ClinicalCondtionid: ['0'],
      PatientArrivalStatusID: ['0'],
      Contraception: ['3'],
      RTAWhen: new Date(),
      RTAWhere: ['']
    });

    this.initialFormValue = this.clinicalConditionsForm.value;

    this.clinicalConditionsForm.valueChanges.subscribe(() => {
      if (this.afterFetch) {
        this.detectChanges();
      }

    });


    this.allergyForm = this.fb.group({
      DrugId: ['', Validators.required],
      GenericId: ['', Validators.required],
      DrugName: ['', Validators.required],
      Severity: [0, Validators.required],
      Description: [''],
    });
    // this.diagnosisList = this.fb.array([]);
    // this.diagnosis = this.fb.group({
    //   ItemCode: [null, Validators.required],
    //   ItemName: [null, Validators.required],
    //   ItemID: [null, Validators.required],
    //   DiagnosisType: [null, Validators.required],
    //   Type: [null, Validators.required],
    //   IsExisting: [null, Validators.required],
    //   MNID: [null, Validators.required],
    //   Remarks: [null]
    // });
    //this.diagnosis.addControl('diagnosisList', this.diagnosisList);
    this.painScoreGraphForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });

    var wm = new Date();
    var d = new Date();
    wm.setMonth(wm.getMonth() - 12);
    this.painScoreGraphForm.patchValue({
      FromDate: wm,
      ToDate: d
    })

    this.emrAdmissionForm = this.fb.group({
      WardID: ['0'],
      Specialization: ['0'],
      SpecializationName: [''],
      SpecialisationDoctorID: ['0'],
      SpecialisationDoctorName: [''],
      TodayAfter: ['T', Validators.required],
      AfterDays: ['0'],
      Admission: [new Date(), Validators.required],
      Expectedlengthofstay: ['0', Validators.required],
      DischargeDate: ['', Validators.required]
    });

    this.followupForm = this.fb.group({
      FollowupAfter: ['', Validators.required],
      FollowupDate: ['', Validators.required],
      Remarks: ['', Validators.required],
      NoofFollowUp: ['0'],
      NoofDays: [''],
      adviceToPatient: ['']
    });

    this.initializeEyeInformationForm();
  }

  tabclick(input: any) {
    sessionStorage.removeItem("InPatientDetails");
    if (this.clickedtab === input) {
      return;
    }
    this.clickedtab = input;
    if (this.pendingChanges) {

      let removeClassName = "";
      let addClassName = "";
      const clinicalelement = this.clinical.nativeElement.querySelector('.nav-link');
      //const diagnosiselement = this.diagnosis.nativeElement.querySelector('.nav-link');
      const prescriptionelement = this.prescription.nativeElement.querySelector('.nav-link');
      const adviceelement = this.advice.nativeElement.querySelector('.nav-link');
      //const assessmentelement = this.assessment.nativeElement.querySelector('.nav-link');
      const otherselement = this.others.nativeElement.querySelector('.nav-link');
      const summaryelement = this.summary.nativeElement.querySelector('.nav-link');
      const doctorrequestelement = this.others.nativeElement.querySelector('.nav-link');
      const eformselement = this.eforms?.nativeElement.querySelector('.nav-link');

      if (input === 'clinical') {
        removeClassName = clinicalelement;
      }
      // else if (input === 'assessment') {
      //   removeClassName = assessmentelement;
      // }
      else if (input === 'diagnosis') {
        //removeClassName = diagnosiselement;
      }
      else if (input === 'prescription') {
        removeClassName = prescriptionelement;
      }
      else if (input === 'advice') {
        removeClassName = adviceelement;
      }
      else if (input === 'others') {
        removeClassName = otherselement;
      }
      else if (input === 'doctorrequest') {
        removeClassName = doctorrequestelement;
      }
      else if (input === 'summary') {
        removeClassName = summaryelement;
      }
      else if (input === 'eforms') {
        removeClassName = eformselement;
      }

      if (this.childClickName === 'clinical' || !this.childClickName) {
        addClassName = clinicalelement;
      }
      // else if (this.childClickName === 'assessment') {
      //   addClassName = assessmentelement;
      // }
      else if (this.childClickName === 'diagnosis') {
        //addClassName = diagnosiselement;
      }
      else if (this.childClickName === 'prescription') {
        addClassName = prescriptionelement;
      }
      else if (this.childClickName === 'advice') {
        addClassName = adviceelement;
      }
      else if (this.childClickName === 'others') {
        addClassName = otherselement;
      }
      else if (this.childClickName === 'doctorrequest') {
        addClassName = doctorrequestelement;
      }
      else if (this.childClickName === 'summary') {
        sessionStorage.setItem("PatientID", this.selectedView.PatientID);
        sessionStorage.setItem("SummaryfromCasesheet", 'true');
        addClassName = summaryelement;
      }
      else if (this.childClickName === 'eforms') {
        addClassName = eformselement;
      }

      if (this.isDirty) {
        const confirmationResult = this.openConfirmationDialog('');
        confirmationResult.subscribe((result) => {
          if (result) {
            this.pendingChanges = false;
            this.isDirty = false;
            this.childClickName = "";
            this.activeTab = "";
            setTimeout(() => {
              this.activeTab = this.clickedtab;
              this.childClickName = this.clickedtab;
            }, 500);
          }
        });
      }

      this.renderer.removeClass(removeClassName, "active");
      this.renderer.addClass(addClassName, "active");
    }
    else {
      this.childClickName = "";
      this.activeTab = "";
      if (input == "clinical") {
        this.fetchPregenencyHistory();
        this.fetchSavedClinicalCondition();
        this.FetchPatientChiefComplaintAndExaminations();
      }
      else if (input == 'summary') {
        sessionStorage.setItem("PatientID", this.selectedView.PatientID);
        sessionStorage.setItem("SummaryfromCasesheet", 'true');
      }
      setTimeout(() => {
        this.childClickName = input;
        this.activeTab = input;
      }, 500);
    }
  }

  childtabclick(input: any) {
    this.childTabClickName = "";

    setTimeout(() => {
      this.childTabClickName = input;
    }, 500);
  }

  startClock(): void {
    this.interval = setInterval(() => {
      this.currentTimeN = new Date();
    }, 1000);
  }

  stopClock(): void {
    clearInterval(this.interval);
  }

  //  async toggleRecording(): Promise<void> {
  //   try {
  //     if (this.speechState.isRecording) {
  //       await this.speechService.recordAndTranscribe();
  //     } else {
  //       await this.speechService.startRecording();
  //     }
  //   } catch (error) {
  //     console.error('Recording toggle error:', error);
  //   }
  // }

  appendTranscript(): void {
    if (this.speechState.transcript) {
      const separator = this.emrNurseChiefComplaint ? '\n' : '';
      this.emrNurseChiefComplaint += separator + this.speechState.transcript;
      this.clearTranscript();
    }
  }

  replaceWithTranscript(): void {
    if (this.speechState.transcript) {
      this.emrNurseChiefComplaint = this.speechState.transcript;
      this.clearTranscript();
    }
  }

  clearTranscript(): void {
    this.speechService.resetState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.speechService.resetState();
    setTimeout(() => {
      this.speechService.state$
        .pipe(takeUntil(this.destroy$))
        .subscribe(state => {
          this.speechState = state;

          if (state.transcript && !state.isProcessing) {
            this.appendTranscriptToFocusedTextarea(state.transcript);
          }
        });
    }, 0);

    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.fromAnesthesiaWorklist = sessionStorage.getItem("fromAnesthesiaWorklist") === "true" ? true : false;
    this.fromOtDashboard = sessionStorage.getItem("fromOtDashboard") === "true" ? true : false;
    this.patientAge = Number(this.selectedView.AgeValue);
    if (this.selectedView.PatientType == '3') {
      this.emrTriageChiefComplaint = "The patient presents to the Emergency Department with a chief complaint of " + this.selectedView.NurseChiefComplaints + ", which began " + this.selectedView.DurationofIllNess + " " + this.selectedView.DurationofIllNessUOMName + " ago";
      if (this.selectedView.IsPregnancy === 1) {
        this.pregnancyToggle = true; this.pregnancyValue = "Yes";
        //this.togglePregnancy(true);
      }
    }
    if ((this.selectedView.PatientType == '2' || this.selectedView.PatientType == '1' || this.selectedView.PatientType == '4') && !this.selectedView.IsPregnancySavedForIPVisit) {
      if (this.selectedView.IsPregnancy === 1) {
        this.pregnancyToggle = true; this.pregnancyValue = "Yes";
        var triSemister = this.selectedView.TriSemister;
        if (triSemister == "1")
          this.selectedView.PregnancyContent = "1st";
        else if (triSemister == "2")
          this.selectedView.PregnancyContent = "2nd";
        else if (triSemister == "3")
          this.selectedView.PregnancyContent = "3rd";
        else
          this.selectedView.PregnancyContent = "";

        const edd = this.selectedView.EDD;
        if (edd) {
          if (new Date(edd) >= new Date()) {
            this.pregnancyToggle = true; this.pregnancyValue = "Yes";
            if (this.selectedView.Lactation === 'True') {
              this.lactationToggleYes = "fs-7 btn selected";
              this.lactationToggleNo = "fs-7 btn";
            }
            this.pregnancyForm.setValue({
              pregYesNo: true,
              lactation: triSemister === '1' ? true : false,
              triSemister: triSemister,
              lmp: moment(this.selectedView.LMP).format('yyyy-MM-DD'), //this.datepipe.transform(this.pregenencyHistoryList[0].LMP), //this.pregenencyHistoryList[0].LMP,
              contraception: this.selectedView.Contraception,
              edd: moment(this.selectedView.EDD).format('yyyy-MM-DD'), //this.pregenencyHistoryList[0].EDD, //this.datepipe.transform(this.pregenencyHistoryList[0].EDD, "dd-MMM-yyyy")?.toString(),
            });
            this.clinicalConditionsForm.patchValue({
              Contraception: this.selectedView.Contraception
            })
          }
        }
      }
    }
    const emergencyValue = sessionStorage.getItem("IsEmergencyTile");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsEmergency = (emergencyValue === 'true');
    } else {
      this.IsEmergency = false;
    }

    if (this.IsEmergency) {
      //this.startTimers(this.selectedView);
      this.clinicalConditionsForm.patchValue({
        DurationOfIllness: this.selectedView.DurationofIllNess,
        DurationOfIllnessUOMID: this.selectedView.DurationofIllNessUOM,
        Weight: this.selectedView.Weight,
        Height: this.selectedView.Height,
        PatientArrivalStatusID: this.selectedView.ModeOfArrivalID == "" ? '0' : this.selectedView.ModeOfArrivalID,
      })
    }

    this.initializetablePatientsForm();
    this.hospId = sessionStorage.getItem("hospitalId");
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY | H:mm');
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.currentTime = moment(new Date()).format('H:mm');
    this.todayDate = moment(new Date()).format('MM-DD-YYYY');
    sessionStorage.setItem("navigateFromCasesheet", 'true');
    this.fromAkuWorklist = sessionStorage.getItem("fromAkuWorklist") || 'false';
    this.FetchModeOfarrival();
    this.FetchPhysicalExaminationStatus();
    this.PrescriptionRestriction = this.doctorDetails[0].PrescriptionRestriction;

    /**
     * @ this 68 line i'm geeting local storage data which i select
     */
    this.selectedCard = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.OPConsultationID = this.selectedView.OPConsultationID;
    this.MonitorID = this.selectedView.MonitorID;
    this.PatientID = this.selectedView.PatientID;
    this.AdmissionID = this.selectedView.AdmissionID;
    if (this.selectedView.PatientType == "2" || this.selectedView.PatientType == "4") {
      this.AdmissionID = this.selectedView.IPID;
    }
    if (this.selectedView.PatientType == "2" || this.selectedView.PatientType == "4") {
      if (this.selectedView?.Bed.includes('ISO'))
        this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
      else
        this.SelectedViewClass = "m-0 fw-bold alert_animate token";



    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }

    if (this.selectedView.PatientType == '2' || this.selectedView.PatientType == '4') {
      this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
      this.isPrimarydoc = Number(this.selectedView.ConsultantID) === this.doctorDetails[0].EmpId;
    }
    else
      this.IsDoctor = false;


    this.startClock();
    this.SpecialiseID = this.selectedView.SpecialiseID;
    this.BillID = this.selectedView.BillID;
    this.EpisodeID = this.selectedView.EpisodeID;
    this.Age_Gender = this.selectedView.Age_Gender;
    this.doctorID = this.doctorDetails[0].EmpId;
    this.selectedPatientAdmissionId = sessionStorage.getItem("selectedPatientAdmissionId");
    this.OrderType = this.selectedView.OrderType;

    this.GetVitalScores();
    this.afterSave(); this.getHight();
    this.fetchPainScoreMaster();
    //this.fetchClinicalCondition();
    this.fetchSpecialisationClinicalCondition();
    this.fetchPregenencyHistory();
    this.ShowHidePregnancyOption();
    this.fetchPatientAllergies();
    this.fetchSavedClinicalCondition();
    this.fetchCaseSheetConfigurations("doccasesheet");
    this.FetchSmokingInfo(1);
    this.printformats = [
      { id: 1, name: 'English', checked: 'true' },
      { id: 2, name: 'Arabic', checked: 'false' },
    ]
    if (!this.IsAdult) {
      this.getChart('W');

    }
    this.ctasScore = this.selectedView.CTASSCore;
    var ctasScoreDesc = "";
    if (this.ctasScore == "1")
      ctasScoreDesc = "Resuscitation";
    else if (this.ctasScore == "2")
      ctasScoreDesc = "Emergent";
    else if (this.ctasScore == "3")
      ctasScoreDesc = "Urgent";
    else if (this.ctasScore == "4")
      ctasScoreDesc = "Less Urgent";
    else if (this.ctasScore == "4")
      ctasScoreDesc = "Non Urgent";
    this.calcCtasScore(this.ctasScore, ctasScoreDesc);
    this.FetchPatientChiefComplaintAndExaminations();
    if (this.selectedView.PatientType === '1') {
      this.restrictPrescriptionSave();
    }
    this.IsNurse = sessionStorage.getItem("IsNurse");

    this.fetchFraminghamRiskScoreForMenandWomen();
    this.getConciousnessAndBehavior();
    this.FetchPatientBMIGrowthChart(this.selectedCard.Height, this.selectedCard.Weight, 0);
    if (!this.IsBornBaby) {
      this.GetVitalsParams();
    }
    this.checkPatVisitAvaForDiabeticsHyperTension();
    this.CheckMammographyTestLastOneYear();
    this.checkCoverageClinicalCondition();
    this.FetchDentalDermaSpecialSpecialisation();
    this.fetchPregnancyHistoryForAntenatal();
    this.initializeSearchListener();
  }

  ngAfterViewInit() {
    this.setupTextareaListeners();
  }

  private setupTextareaListeners(): void {
    const textareaIds = [
      'Chiefcomplaint',
      'HistoryofPresentIllness',
      'AssessmentPlan'
    ];

    textareaIds.forEach(id => {
      const textarea = document.getElementById(id) as HTMLTextAreaElement;
      if (textarea) {
        textarea.addEventListener('focus', () => {
          this.currentFocusedTextarea = textarea;
          this.speechService.setActiveTextarea(textarea);
          console.log('Focused on:', id);
        });
      }
    });

    // Handle contenteditable div for Physical Examination
    if (this.divPhysicalExamination) {
      const div = this.divPhysicalExamination.nativeElement;
      div.addEventListener('focus', () => {
        this.currentFocusedTextarea = div; // Store the div as current
        console.log('Focused on: Physical Examination');
      });
    }
  }

  async toggleRecording(): Promise<void> {
    if (!this.currentFocusedTextarea) {
      alert('Please click on a text field first before recording');
      return;
    }

    if (this.speechState.isRecording) {
      // Stop recording and transcribe
      try {
        await this.speechService.recordAndTranscribe();
      } catch (error) {
        console.error('Recording error:', error);
        alert('Recording failed. Please try again.');
      }
    } else {
      // Start recording
      try {
        await this.speechService.startRecording();
      } catch (error) {
        console.error('Failed to start recording:', error);
        alert('Could not access microphone. Please check permissions.');
      }
    }
  }

  private appendTranscriptToFocusedTextarea(transcript: string): void {
    if (!this.currentFocusedTextarea) return;

    if (this.currentFocusedTextarea.id === 'Chiefcomplaint') {
      this.emrNurseChiefComplaint = this.appendText(this.emrNurseChiefComplaint, transcript);
    } else if (this.currentFocusedTextarea.id === 'HistoryofPresentIllness') {
      this.emrNurseHistoryofPresentIllness = this.appendText(this.emrNurseHistoryofPresentIllness, transcript);
    } else if (this.currentFocusedTextarea.id === 'AssessmentPlan') {
      this.emrNurseAssessmentPlan = this.appendText(this.emrNurseAssessmentPlan, transcript);
    } else if (this.currentFocusedTextarea === this.divPhysicalExamination.nativeElement) {
      // For contenteditable div
      const div = this.divPhysicalExamination.nativeElement;
      const currentText = div.innerText || '';
      div.innerText = this.appendText(currentText, transcript);
    }

    // Reset transcript after appending
    this.speechService.resetState();
  }

  private appendText(currentText: string, newText: string): string {
    const trimmed = currentText?.trim() || '';
    return trimmed ? `${trimmed} ${newText}` : newText;
  }

  // Show visual feedback of focused field
  getRecordingLabel(): string {
    if (!this.currentFocusedTextarea) return 'Select a field first';

    const id = this.currentFocusedTextarea.id;
    switch (id) {
      case 'Chiefcomplaint': return 'Recording: Chief Complaints';
      case 'HistoryofPresentIllness': return 'Recording: History';
      case 'AssessmentPlan': return 'Recording: Assessment';
      default:
        if (this.currentFocusedTextarea === this.divPhysicalExamination?.nativeElement) {
          return 'Recording: Physical Exam';
        }
        return 'Recording...';
    }
  }

  fetchPainScoreHistory() {
    var FromDate = this.datepipe.transform(this.painScoreGraphForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.painScoreGraphForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    this.config.FetchPainscoreHistory(this.selectedPatientAdmissionId, FromDate, ToDate, this.doctorDetails[0].UserId, this.facility.FacilityID, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.painScoreHistory = response.FetchPainscoreHistoryDataList.sort((a: any, b: any) => b.CREATEDATE - a.CREATEDATE);
          this.fillPSChart('line');

        }
      },
        (err) => {

        })
  }
  openPainScoreGraph() {
    this.fetchPainScoreHistory();
    $("#painScoreGraph").modal('show');
  }
  fetchSavedClinicalCondition() {
    this.config.fetchSavedClinicalCondition(this.selectedPatientAdmissionId, this.PatientID)
      .subscribe((response: any) => {
        this.FetchClinicalInfoDataList = response.FetchClinicalInfoDataList;
        if (response.FetchClinicalInfoDataList[0]?.EpisodeCloseDate != null && response.FetchClinicalInfoDataList[0]?.EpisodeCloseDate != undefined) {
          //this.endofEpisode = true; sessionStorage.setItem("ISEpisodeclose", "true");
          this.endofEpsiodeDate = this.datepipe.transform(response.FetchClinicalInfoDataList[0].EpisodeCloseDate, "dd-MMM-yyyy")?.toString();
        }
        else {
          this.endofEpisode = false;
          sessionStorage.setItem("ISEpisodeclose", "false");
          this.restrictPrescriptionSave()
        }
        this.FromPrevRefDocCalendar = sessionStorage.getItem("FromPrevRefDocCalendar") || 'false';
        if (this.FromPrevRefDocCalendar === 'true') {
          this.endofEpisode = true; sessionStorage.setItem("ISEpisodeclose", "true");
        }
        if (!this.doctorDetails[0].IsDoctor && !this.doctorDetails[0].IsRODoctor && !this.doctorDetails[0].IsAnesthetia) {
          this.endofEpisode = true; sessionStorage.setItem("ISEpisodeclose", "true");
        }
        if (this.selectedView.IsFitForDischarge !== undefined && this.selectedView.IsFitForDischarge) {
          this.dischargeIntimationRiased = true;
          this.endofEpisode = true; sessionStorage.setItem("ISEpisodeclose", "true");
        }

        if (response.Code == 200 && response.FetchClinicalInfoDataList.length > 0) {

          this.clinicalConditionsForm.patchValue({
            DurationOfIllness: response.FetchClinicalInfoDataList[0].DurationOfIllness.split(' ')[0],
            DurationOfIllnessUOMID: response.FetchClinicalInfoDataList[0].DurationOfIllnessUOMID == "" ? '3' : response.FetchClinicalInfoDataList[0].DurationOfIllnessUOMID,
            Weight: response.FetchClinicalInfoDataList[0].Weight,
            Height: response.FetchClinicalInfoDataList[0].Height,
            HeadCircumference: response.FetchClinicalInfoDataList[0].HeadCircumference,
            ClinicalCondtionid: response.FetchClinicalInfoDataList[0].ClinicalCondtionid,
            PatientArrivalStatusID: response.FetchClinicalInfoDataList[0].PatientarrivedStatusID == "" ? '0' : response.FetchClinicalInfoDataList[0].PatientarrivedStatusID,
            Contraception: response.FetchClinicalInfoDataList[0].ContraceptionID == "" ? '0' : response.FetchClinicalInfoDataList[0].ContraceptionID,
            RTAWhen: (response.FetchClinicalInfoDataList[0].RTAWHEN === '' || response.FetchClinicalInfoDataList[0].RTAWHEN === "") ? '' : new Date(response.FetchClinicalInfoDataList[0].RTAWHEN),
            RTAWhere: response.FetchClinicalInfoDataList[0].RTAWHERE
          });
          this.checkCoverageClinicalCondition();
          this.smokingValue = response.FetchClinicalInfoDataList[0].IsSmoke == "True" ? "Yes" : "No";
          sessionStorage.setItem("IsAdmissionRec", response.FetchClinicalInfoDataList[0].IsAdmissionRec);
          if (this.smokingValue == "Yes")
            this.smokingInfoSaved = true;
          this.educatedValue = response.FetchClinicalInfoDataList[0].IsEducated == "True" ? "Yes" : "No";
          this.sleepValue = response.FetchClinicalInfoDataList[0].ISsleep == "True" ? "Yes" : "No";
          this.alcoholValue = response.FetchClinicalInfoDataList[0].Isalcohol == "True" ? "Yes" : "No";
          this.painScore?.forEach((element: any, index: any) => {
            if (element.id == response.FetchClinicalInfoDataList[0].PainScoreID)
              element.Class = "pain_reaction position-relative cursor-pointer active text-center justify-content-between";
            this.painScoreSelected = true; this.showPSValidation = false;
            this.selectedPainScoreId = response.FetchClinicalInfoDataList[0].PainScoreID;
            this.selectedView.PainScore = this.selectedPainScoreId;
            sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
          });
          if (response.FetchClinicalInfoDataList[0].CTASScoreColorID != "0") {
            var ctasScoreDesc = "";
            this.selectedCard.CTASSCore = response.FetchClinicalInfoDataList[0].CTASScoreColorID;
            if (response.FetchClinicalInfoDataList[0].CTASScoreColorID == "1")
              ctasScoreDesc = "Resuscitation";
            else if (response.FetchClinicalInfoDataList[0].CTASScoreColorID == "2")
              ctasScoreDesc = "Emergent";
            else if (response.FetchClinicalInfoDataList[0].CTASScoreColorID == "3")
              ctasScoreDesc = "Urgent";
            else if (response.FetchClinicalInfoDataList[0].CTASScoreColorID == "4")
              ctasScoreDesc = "Less Urgent";
            else if (response.FetchClinicalInfoDataList[0].CTASScoreColorID == "4")
              ctasScoreDesc = "Non Urgent";
            if (response.FetchClinicalInfoDataList[0].CTASScoreColorID != "")
              this.calcCtasScore(response.FetchClinicalInfoDataList[0].CTASScoreColorID, ctasScoreDesc);
          }

          this.isIVIM = response.FetchClinicalInfoDataList[0].IsIVIM;
        }
        else {

          if (!this.IsEmergency) {
            this.clinicalConditionsForm.get('PatientArrivalStatusID')?.setValue(3); // Selecting as Walkin by default
            this.clinicalConditionsForm.patchValue({
              DurationOfIllnessUOMID: '3',
              // Weight: this.OrderType.toString().toLowerCase() == "followup" ? this.selectedView.Weight : "",
              // Height: this.OrderType.toString().toLowerCase() == "followup" ? this.selectedView.Height : "",
            })
          }
          this.clinicalConditionsForm.patchValue({
            Weight: this.selectedView.Weight,
            Height: this.selectedView.Height,
          })
          // if (this.IsEmergency) {
          //   this.clinicalConditionsForm.get('ClinicalCondtionid')?.setValue(1);
          // }
        }

        setTimeout(() => {
          this.initialFormValue = this.clinicalConditionsForm.value;
          this.afterFetch = true;
        }, 3000);
      },
        (err) => {

        })
  }


  changeCaseSheetView() {
    if (!$('#divCaseSheet').hasClass('mini_casesheet')) {
      // $('#divCaseSheet').removeClass("casesheet_div");
      $('#divCaseSheet').addClass("mini_casesheet");
    }
    else {
      $('#divCaseSheet').removeClass("mini_casesheet");
      // $('#divCaseSheet').addClass("casesheet_div");
    }
  }



  filterData() {
    if (this.searchQuery) {
      this.filteredData = this.listOfItems.filter((item: any) => item.Name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    } else {
      this.filteredData = this.listOfItems;
    }
  }
  deleteItem(item: any) {
    item.get('BLK').setValue(1);
  }
  GoBackTodashboard() {
    var fromdocCal = sessionStorage.getItem("FromDocCalendar");
    if (this.fromAkuWorklist === 'true') {
      this.router.navigate(['/dialysis/aku-worklist']);
    }
    else if (this.fromAnesthesiaWorklist) {
      this.router.navigate(['/portal/anesthetia-worklist']);
    }
    else if (this.IsEmergency) {
      this.router.navigate(['/emergency']);
    }
    else if ((this.patientDetails.PatientType == '2' || this.patientDetails.PatientType == '4') && this.fromOtDashboard) {
      this.router.navigate(['/ot/ot-dashboard'])
    }
    else if ((this.patientDetails.PatientType == '2' || this.patientDetails.PatientType == '4') && fromdocCal != "true") {
      this.router.navigate(['/ward']);
    }
    else if (this.selectedView.PatientType == "3") {
      this.router.navigate(['/ward']);
    }
    else {
      this.router.navigate(['/home/patients']);
    }
    sessionStorage.setItem("navigateFromCasesheet", 'false');
    sessionStorage.setItem("FromDocCalendar", "false");
    sessionStorage.removeItem("PregnancyHistory");
    sessionStorage.removeItem("FromPrevRefDocCalendar");
    sessionStorage.removeItem("prevChiefCompl");
    sessionStorage.removeItem("prevPhyExam");
    sessionStorage.removeItem("IsAdmissionRec");
    sessionStorage.removeItem("fromOtDashboard");
    sessionStorage.removeItem("ISEpisodeclose");
  }

  GetVitalScores() {
    this.config.fetchVitalScores(this.doctorDetails[0].UserId, this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitalsScores = response.FetchVitalScoresDataList;
        this.GetVitalsData();
      } else {
      }
    },
      (err) => {

      })
  }
  GetVitalsData() {
    var vm = new Date(); vm.setMonth(vm.getMonth() - 12);
    var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();

    if (this.selectedCard.PatientType == '1') {
      //this.config.fetchOutPatientData(this.selectedCard.PatientID, FromDate, ToDate, this.hospId)
      this.config.fetchOutPatientDataRR(this.selectedCard.PatientID, FromDate, ToDate, this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.PatientVitalsDataList.length > 0) {
            this.tableVitalsList = response.PatientVitalsDataList;
            this.tableVitalsListFiltered = this.tableVitalsList;

            this.selectedCard.BP = response.PatientVitalsDataList[0].BPSystolic + "/" + response.PatientVitalsDataList[0].BPDiastolic;
            this.selectedCard.Temperature = response.PatientVitalsDataList[0].Temparature;

            this.createChartLine(1);
          }
        },
          (err) => {

          })
    } else if (this.selectedCard.PatientType == '3') {
      this.config.fetchOutPatientData(this.patientDetails.PatientID, FromDate, ToDate, this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.tableVitalsList = response.PatientVitalsDataList;
            this.tableVitalsListFiltered = this.tableVitalsList;

            this.selectedCard.BP = response.PatientVitalsDataList[0].BPSystolic + "/" + response.PatientVitalsDataList[0].BPDiastolic;
            this.selectedCard.Temperature = response.PatientVitalsDataList[0].Temparature;
            this.createChartLine(1);
          }
        },
          (err) => {

          })
    }
    else {
      // this.config.fetchInPatientData(this.PatientID, FromDate, ToDate, this.hospId)
      //   .subscribe((response: any) => {
      //     if (response.Code == 200) {
      //       this.tableVitalsList = response.PatientVitalsDataList;
      //       this.createChartLine(2);
      //     }
      //   },
      //     (err) => {

      //     })
      // var vm = new Date(); vm.setMonth(vm.getMonth() - 3);
      var vm = new Date(); //vm.setMonth(vm.getMonth() - 12);
      vm.setDate(vm.getDate() - 2);
      var FromDate = this.datepipe.transform(vm, "dd-MMM-yyyy")?.toString();//this.datepipe.transform(vm, "dd-MMM-yyyy")?.toString();
      var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
      this.config.FetchIPPatientVitalsRR(this.selectedView.IPID, FromDate, ToDate, this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.tableVitalsList = response.FetchIPPatientVitalsRRDataList;
            const distinctThings = response.FetchIPPatientVitalsRRDataList.filter(
              (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.VitalSignDateOnly === thing.VitalSignDateOnly) === i);
            console.dir(distinctThings);
            this.tableVitalsListFiltered = distinctThings;
            this.createChartLine(2);
          }
        },
          (err) => {

          })
    }
  }

  checkBpHigh(bp: any) {
    const bpsys = bp.split('/')[0];
    const bpdia = bp.split('/')[1];
    if (this.tableVitals?.length && bpsys != '') {
      const bpsysrefrange = this.tableVitals.find((x: any) => x.PARAMETERID === '6');
      const bpdiarefrange = this.tableVitals.find((x: any) => x.PARAMETERID === '7');
      if (bpsys != null && bpsys != "" && parseFloat(bpsys) > parseFloat(bpsysrefrange.NORMALMAXRANGE)) {
        return true;
      }
      if (bpdia != null && bpdia != "" && parseFloat(bpdia) > parseFloat(bpdiarefrange.NORMALMINRANGE)) {
        return true;
      }
    }
    return false;
  }

  checkBpLow(bp: any) {
    const bpsys = bp.split('/')[0];
    const bpdia = bp.split('/')[1];
    if (this.tableVitals?.length && bpsys != '') {
      const bpsysrefrange = this.tableVitals.find((x: any) => x.PARAMETERID === '6');
      const bpdiarefrange = this.tableVitals.find((x: any) => x.PARAMETERID === '7');
      if (bpsys != null && bpsys != "" && parseFloat(bpsys) < parseFloat(bpsysrefrange.NORMALMAXRANGE)) {
        return true;
      }
      if (bpdia != null && bpdia != "" && parseFloat(bpdia) < parseFloat(bpdiarefrange.NORMALMINRANGE)) {
        return true;
      }
    }
    return false;
  }

  checkBpHighLow(bp: any) {
    if (bp) {
      const bpsys = bp.split('/')[0];
      const bpdia = bp.split('/')[1];
      if (this.tableVitals?.length && bpsys != '') {
        const bpsysrefrange = this.tableVitals.find((x: any) => x.PARAMETERID === '6');
        const bpdiarefrange = this.tableVitals.find((x: any) => x.PARAMETERID === '7');
        if (bpsys != null && bpsys != "" && parseFloat(bpsys) > parseFloat(bpsysrefrange.NORMALMAXRANGE)) {
          return 'high';
        }
        if (bpdia != null && bpdia != "" && parseFloat(bpdia) < parseFloat(bpdiarefrange.NORMALMINRANGE)) {
          return 'high';
        }

        if (bpsys != null && bpsys != "" && parseFloat(bpsys) > parseFloat(bpsysrefrange.NORMALMAXRANGE)) {
          return 'low';
        }
        if (bpdia != null && bpdia != "" && parseFloat(bpdia) < parseFloat(bpdiarefrange.NORMALMINRANGE)) {
          return 'low';
        }
      }
    }
    return '';
  }


  // isRXorders() {
  //   this.isRXorder = true;
  // }
  // clickCount: number = 0;
  // ngAfterViewInit() {

  //   this.isRXorder = false;
  // }
  //   isRXorders(){
  //     // this.clickCount++;
  //     // if (this.clickCount === 1) {
  //     //   this.isRXorder = true;
  //     // } else {
  //     //   this.isRXorder = false;
  //     //   this.clickCount = 0;
  //     // }
  //     //this next
  //     // this.isRXorder = !this.isRXorder;
  //     // if (this.isRXorder) {
  //     //   this.clickCount++;
  //     // }

  //     if (this.clickCount === 0) {
  //       this.isRXorder = true;
  //       this.clickCount++;
  //     } else {
  //       this.isRXorder = false;
  //       this.clickCount = 0;
  //     }
  // }


  /**
  * @previews Paitents Details function section
  */

  filterFunction(vitals: any, visitid: any) {
    if (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4')
      return vitals.filter((buttom: any) => buttom.VitalSignDateOnly == visitid);
    else
      return vitals.filter((buttom: any) => buttom.VisitID == visitid);
  }

  private createPainScoreChartLine(): void {
    let painScoredata: any = {};

    const PainScoreID: any[] = [];


    this.painScoreHistory.forEach((element: any, index: any) => {

      if (element.PainScoreID != 0) {
        PainScoreID.push([element.CREATEDATE, parseFloat(element.PainScoreID)])
      }
    });

    painScoredata = [{ name: 'PainScore', data: PainScoreID }
    ];

    const chart = Highcharts.chart('chart-ps-line', {
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
      series: painScoredata,
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

    const chartviewmore = Highcharts.chart('chart-ps-line', {
      chart: {
        type: 'areaspline',
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
      series: painScoredata,
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
  private createChartLine(type: number): void {
    let vitaldata: any = {};

    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];


    this.tableVitalsList.forEach((element: any, index: any) => {

      if (type == 1) {
        element.VisitDateTime = element.VitalSignDateOnly.split(' ')[0];//element.VitalSignDateOnly?.split('-')[2];
        element.VisitDate = element.VitalSignDateOnly.split(' ')[0];//element.VitalSignDateOnly?.split('-')[0];
      }
      else {
        element.VisitDate = element.VitalSignDateOnly;
      }
      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      }
      if (element.Temperature != 0) {
        TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
      }
    });

    vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
    { name: 'BP-Diastolic', data: BPDiastolicData },
    { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
    { name: 'Pulse', data: PulseData, visible: false },
    { name: 'Respiration', data: RespirationData, visible: false },
    { name: 'SPO2', data: SPO2Data, visible: false },
    { name: 'Temparature', data: TemparatureData, visible: false }
    ];

    const chart = Highcharts.chart('chart-line', {
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
      series: vitaldata,
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

    const chartviewmore = Highcharts.chart('chart-line', {
      chart: {
        type: 'areaspline',
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
      series: vitaldata,
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

  fillPSChart(chartType: any) {
    var highchartOption;
    if (chartType == "column") {
      this.isAreaSplineActive = false;
      this.isSplineActive = false;
      this.isLineActive = false;
      this.isColumnActive = true;
      this.activeButton = 'column';
    }
    else if (chartType == "line") {
      this.isAreaSplineActive = false;
      this.isSplineActive = false;
      this.isLineActive = true;
      this.isColumnActive = false;
      this.activeButton = 'line';
    }
    else if (chartType == "spline") {
      this.isAreaSplineActive = false;
      this.isSplineActive = true;
      this.isLineActive = false;
      this.isColumnActive = false;
      this.activeButton = 'spline';
    }
    else if (chartType == "areaSpline") {
      this.isAreaSplineActive = true;
      this.isSplineActive = false;
      this.isLineActive = false;
      this.isColumnActive = false;
      this.activeButton = 'areaSpline';
    }
    let data: any = {};
    let type = 1;
    if (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4')
      type = 2;
    const painScoreData: any[] = [];

    this.painScoreHistory.forEach((element: any, index: any) => {
      painScoreData.push([element.CREATEDATE, parseFloat(element.PainScoreID)])
    });

    data = [{ name: 'PainScore', data: painScoreData }];

    if (chartType == "column") {
      this.charAreaSpline = Highcharts.chart('chart-ps-line', {
        chart: {
          type: chartType,
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
    else if (chartType == "areaSpline") {
      this.charAreaSpline = Highcharts.chart('chart-ps-line', {
        chart: {
          type: 'areaspline',
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
    else if (chartType == "spline") {
      this.charAreaSpline = Highcharts.chart('chart-ps-line', {
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
    else if (chartType == "line") {
      this.charAreaSpline = Highcharts.chart('chart-ps-line', {
        chart: {
          type: 'line',
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
  }

  fillChart(chartType: any) {
    var highchartOption;
    if (chartType == "column") {
      this.isAreaSplineActive = false;
      this.isSplineActive = false;
      this.isLineActive = false;
      this.isColumnActive = true;
      this.activeButton = 'column';
    }
    else if (chartType == "line") {
      this.isAreaSplineActive = false;
      this.isSplineActive = false;
      this.isLineActive = true;
      this.isColumnActive = false;
      this.activeButton = 'line';
    }
    else if (chartType == "spline") {
      this.isAreaSplineActive = false;
      this.isSplineActive = true;
      this.isLineActive = false;
      this.isColumnActive = false;
      this.activeButton = 'spline';
    }
    else if (chartType == "areaSpline") {
      this.isAreaSplineActive = true;
      this.isSplineActive = false;
      this.isLineActive = false;
      this.isColumnActive = false;
      this.activeButton = 'areaSpline';
    }
    let vitaldata: any = {};
    let type = 1;
    if (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4')
      type = 2;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];

    this.tableVitalsList.forEach((element: any, index: any) => {
      if (type == 1) {
        element.VisitDate = element.VitalSignDateOnly?.split('-')[0];
      }
      else {
        element.VisitDate = element.VitalSignDateOnly;
      }
      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      }
      if (element.Temperature != 0) {
        TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
      }
    });

    vitaldata = [
      { name: 'BP-Systolic', data: BPSystolicData },
      { name: 'BP-Diastolic', data: BPDiastolicData },
      { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
      { name: 'Pulse', data: PulseData, visible: false },
      { name: 'Respiration', data: RespirationData, visible: false },
      { name: 'SPO2', data: SPO2Data, visible: false },
      { name: 'Temparature', data: TemparatureData, visible: false }
    ];

    if (chartType == "column") {
      this.charAreaSpline = Highcharts.chart(this.chartColumn.nativeElement, {
        chart: {
          type: chartType,
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
        series: vitaldata,
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
    else if (chartType == "areaSpline") {
      this.charAreaSpline = Highcharts.chart(this.chartLineAreaSpline.nativeElement, {
        chart: {
          type: 'areaspline',
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
        series: vitaldata,
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
    else if (chartType == "spline") {
      this.charAreaSpline = Highcharts.chart(this.chartLineSpline.nativeElement, {
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
        series: vitaldata,
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
    else if (chartType == "line") {
      this.charAreaSpline = Highcharts.chart(this.chartLine.nativeElement, {
        chart: {
          type: 'line',
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
        series: vitaldata,
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
  }

  selectTableRow(isChecked: any, item: any) {
    let rowCheck = isChecked.target.checked
    if (rowCheck) {
      this.isSeletedRowData = false
      this.selectedItems.push(item);
    } else {
      const index = this.selectedItems.indexOf(item);
      if (index > -1) {
        this.selectedItems.splice(index, 1);
        this.deleteRow(item);
        item.isChecked = false; // uncheck the row
        this.isSeletedRowData = true
      }
    }
    let seletPreData: any = []
    seletPreData = this.selectedItems
    sessionStorage.setItem("seletedPreviewsData", JSON.stringify(seletPreData));

  }

  searchDigo(event: any) {
    const inputValue = event.target.value.trim().toLowerCase();
    const filteredList = this.afterSaveData.FetchDiagnosisList.filter((item: any) =>
      item.Name.trim().toLowerCase().includes(inputValue)
    );
  }
  onItemSelect(item: any) {

  }

  deleteRow(item: any) {
    const index = this.selectedItems.indexOf(item);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
      item.isChecked = false; // uncheck the row
    }
  }

  /**
   * @desc this add saveDaigonasis
   */

  saveDiagnosis() {
    let payload = {
      "OPConsultationID": this.paitentRowData.OPConsultationID,
      "intMonitorID": this.paitentRowData.MonitorID,
      "PatientID": this.paitentRowData.PatientID,
      "DoctorID": this.paitentRowData.DoctorID,
      "IPID": this.paitentRowData.AdmissionID,
      "SpecialiseID": this.paitentRowData.SpecialiseID,
      "PatientType": this.paitentRowData.PatientType,
      "BillID": this.paitentRowData.BillID,
      "DiagDetailsList": this.selectedItems
    }
    this.config.SaveDiagnosisSelected(payload).subscribe((data) => {
      this.afterSave()
    })
  }

  afterSave() {
    this.config.afterSaveDiagnosis(this.admisionID).subscribe((data) => {
      this.afterSaveData = data;
    })
  }
  /**@ give the condition show hide  devraj*/
  isdetailShows() {
    this.isdetailShow = true;
    if (this.isdetailShow = true) {
      $('.patient_card').addClass('maximum')
    }
    // else{
    //   $('.patient_card').removeClass('maximum')
    // }
  }
  isdetailHide() {
    this.isdetailShow = false;
    if (this.isdetailShow === false) {
      $('.patient_card').removeClass('maximum')
    }
  }
  patientHigh: any;
  smartDataList: any;
  getHight() {
    this.config.getPatientHight(this.PatientID).subscribe(res => {
      this.patientHigh = res
      // this.PatientHW = res.SmartDataList
      this.smartDataList = this.patientHigh.SmartDataList;
      this.createHWChartLine();
    })
  }
  clearClinicalCondData() {
    this.painScore.forEach((element: any, index: any) => {
      element.Class = "pain_reaction position-relative cursor-pointer text-center justify-content-between";
    });
    this.clinicalConditionsForm.reset({
      DurationOfIllness: [''],
      DurationOfIllnessUOMID: ['0'],
      Weight: [''],
      Height: [''],
      ClinicalCondtionid: ['0'],
      PatientArrivalStatusID: ['5']
    });
    this.checkCoverageClinicalCondition();
    this.fetchSavedClinicalCondition();
    this.FetchSmokingInfo(1);
  }
  painScoreClick(ps: any) {
    this.isDirty = true;
    this.pendingChanges = true;
    ps.Class = "pain_reaction position-relative cursor-pointer active text-center justify-content-between";
    this.selectedPainScoreId = ps.id;
    this.painScore.forEach((element: any, index: any) => {
      if (element.id != ps.id)
        element.Class = "pain_reaction position-relative cursor-pointer text-center justify-content-between";
      this.painScoreSelected = true; this.showPSValidation = false;
    });
  }

  checkReferralVitals() {
    if ((this.selectedCard.OrderTypeID === '51' || (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4')) && !this.vitalsValidation && this.FetchClinicalInfoDataList.length == 0) {
      this.FetchPatientVitalsWithDiseases();
    }
    else {
      this.saveClinicalConditions();
    }
  }

  showCLCondCcDiagValidations(event: any) {
    if (event != '') {
      this.errorMessages.push(event);
      $("#clinicalConditionsValidation").modal('show');
    }
    else {
      if (this.IsEmergency) {
        this.selectedView.CTASSCore = this.ctasScore;
        this.selectedView.PainScore = this.selectedPainScoreId;
        sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
      }
      this.selectedCard.Weight = this.clinicalConditionsForm.get('Weight')?.value;
      this.selectedCard.Height = this.clinicalConditionsForm.get('Height')?.value;
      //$("#saveClinicalConditionsMsg").modal('show');
      //setTimeout(() => {
      //$("#saveClinicalConditionsMsg").modal('hide');
      //this.fetchCaseSheetConfigurations('Clinical Conditions');
      //}, 1000)
      this.initialFormValue = this.clinicalConditionsForm.value;
      this.isDirty = false;
      this.pendingChanges = false;
      if (!this.IsAdult) {
        this.getHight();
        this.getChart('W');
      }
    }
  }

  enableRTA() {
    if (this.clinicalConditionsForm.get('ClinicalCondtionid')?.value.toString() === '3') {
      return true;
    }
    else {
      const diag = this.DoctorDiagnosisComponent?.items;
      if (diag && diag?.value !== undefined) {
        const diagSelected = this.DoctorDiagnosisComponent?.items.value.find((x: any) => x.BLK === 0 && (x.ItemCode.trim() === 'Y85.9' || x.ItemCode.trim() === 'Y85.0'));
        if (diagSelected) {
          this.clinicalConditionsForm.patchValue({
            RTAWhen: new Date()
          });
          return true;
        }
      }
    }
    return false;
  }

  saveClinicalConditions() {
    this.errorMessages = [];
    if (!this.painScoreSelected) {
      this.showPSValidation = true;
      this.errorMessages.push(this.langData?.casesheet?.pain_score_required);
      // this.clinicalConditionsValidationMsg = this.clinicalConditionsValidationMsg == "" ? this.langData?.casesheet?.pain_score_required : this.clinicalConditionsValidationMsg + this.langData?.casesheet?.pain_score_required;
    }
    if (this.clinicalConditionsForm.get('PatientArrivalStatusID')?.value == '') {
      this.PaitentArrivalValidation = true;
      this.errorMessages.push(this.langData?.common?.PatientArrival_required);
      //this.clinicalConditionsValidationMsg = this.clinicalConditionsValidationMsg == "" ? this.langData?.common?.clinical_condition_required : this.clinicalConditionsValidationMsg + this.langData?.common?.clinical_condition_required;
    } else {
      this.PaitentArrivalValidation = false;
    }
    if ($("#durationofIllness").val() === '') {
      this.showdurationofIllnessValidation = true;
      this.errorMessages.push(this.langData?.common?.duration_of_illness);
      //this.clinicalConditionsValidationMsg = this.clinicalConditionsValidationMsg == "" ? this.langData?.common?.Durationisrequired : this.clinicalConditionsValidationMsg + this.langData?.common?.Durationisrequired;
    }
    if (this.clinicalConditionsForm.get('Height')?.value == '') {
      this.showHeightValidation = true;
      this.errorMessages.push(this.langData?.common?.Heightisrequired);
    } else {
      this.showHeightValidation = false;
    }
    if (this.clinicalConditionsForm.get('Weight')?.value == '') {
      this.showWeightValidation = true;
      this.errorMessages.push(this.langData?.common?.Weightisrequired);
    } else {
      this.showWeightValidation = false;
    }
    if ($("#ddlClinicalCondition").val() == '0') {
      this.clinicalConditionValidation = true;
      this.errorMessages.push(this.langData?.common?.clinical_condition_required);
      //this.clinicalConditionsValidationMsg = this.clinicalConditionsValidationMsg == "" ? this.langData?.common?.clinical_condition_required : this.clinicalConditionsValidationMsg + this.langData?.common?.clinical_condition_required;
    }
    if (this.selectedView.PatientType == "1") {
      if (Number(this.patientDetails.AgeValue) > 14 && Number(this.patientDetails.AgeUOMID) == 1) {
        if ((this.tableVitalsList === undefined && this.selectedView.PatientType == "1") ||
          (this.tableVitalsList === undefined && this.tableVitalsList.filter((x: any) => x.VisitID == this.selectedPatientAdmissionId).length == 0)) {
          this.vitalsValidation = true;
          this.errorMessages.push(this.langData?.common?.vital_required);
          //this.clinicalConditionsValidationMsg = this.clinicalConditionsValidationMsg == "" ? this.langData?.common?.vital_required : this.clinicalConditionsValidationMsg + this.langData?.common?.vital_required;
        }
        else
          this.vitalsValidation = false;
      }
      else
        this.vitalsValidation = false;
    } else
      this.vitalsValidation = false;

    if (this.IsEmergency == true && this.ctasScore == '') {
      this.errorMessages.push("Please select CTAS score");
    }

    if ($("#Chiefcomplaint").val() === '') {
      this.errorMessages.push('Please enter Chief Complaints');
    }

    if ($("#Chiefcomplaint").val().trim().indexOf('....') === 0) {
      this.errorMessages.push('Please enter proper Chief Complaints');
    }

    if ($("#HistoryofPresentIllness").val().trim().indexOf('....') === 0) {
      this.errorMessages.push('Please enter proper History of Present Illness');
    }

    if ($("#AssessmentPlan").val().trim().indexOf('....') === 0) {
      this.errorMessages.push('Please enter proper Assessment and Plan');
    }

    //if ($("#PhysicalExamination").val() === '' || $("#PhysicalExamination").val().length < 5) {
    const physicalExaminationContent = this.divPhysicalExamination.nativeElement.innerHTML;

    if (physicalExaminationContent.trim().indexOf('....') === 0) {
      this.errorMessages.push('Please enter proper Physical Examination');
    }

    if (!physicalExaminationContent.trim() || physicalExaminationContent === '<br>') {
      this.errorMessages.push('Please enter Physical Examination');
    }
    if ($("#HistoryofPresentIllness").val() === '') {
      this.errorMessages.push('Please enter Subjective / History of present illness');
    }
    if ($("#AssessmentPlan").val() === '') {
      this.errorMessages.push('Please enter Assessment and Plan');
    }

    if (this.pregnancyToggle) {
      if (this.pregnancyForm.get("lmp")?.value === '') {
        this.errorMessages.push('Please enter pregnancy information');
      }
      else if ((this.selectedView.PatientType === '2' || this.selectedView.PatientType == '1' || this.selectedView.PatientType == '4') && this.selectedView.IsPregnancy === 1 && !this.selectedView.IsPregnancySavedForIPVisit && this.errorMessages.length === 0) {
        this.savePregenencyHistoryList(true);
      }
    }

    const diag = this.DoctorDiagnosisComponent?.validateDiagnosisData();
    if (diag) {
      this.errorMessages.push(diag);
    }
    if (this.errorMessages.length === 0) {
      let payload = {
        "MonitorId": "0",
        "PatientID": this.selectedView.PatientID,
        "Admissionid": this.selectedPatientAdmissionId,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
        "PatientType": this.selectedView.PatientType,
        "ScheduleID": this.selectedView.ScheduleID != "" ? this.selectedView.ScheduleID : "0",
        "EpisodeName": this.selectedView.EpisodeID,
        "DurationOfIllness": this.clinicalConditionsForm.get('DurationOfIllness')?.value,
        "DurationOfIllnessUOMID": this.clinicalConditionsForm.get('DurationOfIllnessUOMID')?.value,
        "Height": this.clinicalConditionsForm.get('Height')?.value,
        "Weight": this.clinicalConditionsForm.get('Weight')?.value,
        "HeadCircumference": this.clinicalConditionsForm.get('HeadCircumference')?.value,
        "PainScoreID": this.selectedPainScoreId,
        "IsSmoke": this.smokingValue == "Yes" ? true : false,
        "IsEducated": this.educatedValue == "Yes" ? true : false,
        "ContraceptionID": this.clinicalConditionsForm.get('Contraception')?.value,
        "ClinicalCondtionid": this.clinicalConditionsForm.get('ClinicalCondtionid')?.value,
        "HospitalID": this.hospId,
        "IsPatientDrugAlleric": this.drugList.length > 0 ? true : false,
        "CTASScoreColorID": this.IsEmergency == true ? this.ctasScore : 0,
        "ISsleep": this.sleepValue == "Yes" ? true : false,
        "Isalcohol": this.alcoholValue == "Yes" ? true : false,
        "PatientArrivalStatusID": this.clinicalConditionsForm.get('PatientArrivalStatusID')?.value,
        "VTOrderID": (this.selectedView.VTOrderID == "" || this.selectedView.VTOrderID == undefined) ? "0" : this.selectedView.VTOrderID,
        "UserID": this.doctorDetails[0].UserId,
        "ChiefExaminationID": this.ChiefExaminationID,
        "ChiefComplaint": $("#Chiefcomplaint").val().toUpperCase(),
        "PhysicalExamination": physicalExaminationContent,
        "CopiedChiefComplaint": this.CopiedChiefComplaint.toUpperCase(),
        "CopiedPhysicalExamination": this.CopiedPhysicalExamination.toUpperCase(),

        "HistoryofPresentIllness": $("#HistoryofPresentIllness").val().toUpperCase(),
        "AssessmentPlan": $("#AssessmentPlan").val().toUpperCase(),
        "CopiedHistoryofPresentIllness": this.CopiedHistoryofPresentIllness.toUpperCase(),
        "CopiedAssessmentPlan": this.CopiedAssessmentPlan.toUpperCase(),
        "RTAWHEN": this.clinicalConditionsForm.get('RTAWhen')?.value === '' ? '' : moment(this.clinicalConditionsForm.get('RTAWhen')?.value).format('DD-MMM-YYYY'),
        "RTAWHERE": this.clinicalConditionsForm.get('RTAWhere')?.value,
      }
      // this.config.triggerSaveDiagnosis(payload);
      const diagRes = this.DoctorDiagnosisComponent?.saveDiagnosisData(payload);
      if (diagRes === 'pass') {
        if (this.IsEmergency) {
          this.selectedView.CTASSCore = this.ctasScore;
          this.selectedView.PainScore = this.selectedPainScoreId;
          sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
        }
        this.selectedCard.Weight = this.clinicalConditionsForm.get('Weight')?.value;
        this.selectedCard.Height = this.clinicalConditionsForm.get('Height')?.value;
        $("#saveClinicalConditionsMsg").modal('show');
        setTimeout(() => {
          $("#saveClinicalConditionsMsg").modal('hide');
          this.fetchCaseSheetConfigurations('Diagnosis');
        }, 1000)
        this.initialFormValue = this.clinicalConditionsForm.value;
        this.isDirty = false;
        this.pendingChanges = false;
        if (!this.IsAdult) {
          this.getHight();
          this.getChart('W');
        }
      }

      // this.config.saveClinicalConditions(payload).subscribe(
      //   (response) => {
      //     if (response.Code == 200) {
      //       if(this.IsEmergency) {
      //         this.selectedView.CTASSCore = this.ctasScore;
      //         sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
      //       }
      //       this.selectedCard.Weight = this.clinicalConditionsForm.get('Weight')?.value;
      //       this.selectedCard.Height = this.clinicalConditionsForm.get('Height')?.value;
      //       $("#saveClinicalConditionsMsg").modal('show');
      //       setTimeout(() => {
      //         $("#saveClinicalConditionsMsg").modal('hide');
      //         this.fetchCaseSheetConfigurations('Clinical Conditions');
      //       }, 1000)
      //       this.initialFormValue = this.clinicalConditionsForm.value;
      //       this.isDirty = false;
      //       this.pendingChanges = false;
      //       if (!this.IsAdult) {
      //         this.getHight();
      //         this.getChart('W');
      //       }
      //       this.config.triggerSaveDiagnosis(true);
      //       //this.saveAssessment();
      //     } else {
      //     }
      //   },
      //   (err) => {
      //     console.log(err)
      //   });

    }
    else if (this.errorMessages.length > 0) {
      $("#clinicalConditionsValidation").modal('show');
    }
  }
  DischargeObgPrint() {
    switch (this.activeAssessmentTab) {
      case 'chief_complaints':
        this.SaveCheifComplaints();
        break;
      case 'pulmonology':
        if (this.pulmComponent) {

        }
        break;
      case 'pulmonology-diseases':
        if (this.pulmdisComponent) {

        }
        break;
      case 'gynecology':
        this.config.triggerPrint(true);
        break;
      case 'generalconsent':
        if (this.genConsComponent) {
          this.genConsComponent.GeneralConsentPrint();
        }
        break;
      case 'HighRiskOperation':
        if (this.hroComponent) {

        }
        break;
      case 'medicalconsent':
        if (this.medicalComponent) {

        }
        break;
      default:
        break;
    }
  }

  saveAssessment() {
    switch (this.activeAssessmentTab) {
      case 'chief_complaints':
        this.SaveCheifComplaints();
        break;
      case 'pulmonology':
        if (this.pulmComponent) {
          this.pulmComponent.save();
        }
        break;
      case 'pulmonology-diseases':
        if (this.pulmdisComponent) {
          this.pulmdisComponent.save();
        }
        break;
      case 'gynecology':
        this.config.trigger(true);
        break;
      case 'generalconsent':
        if (this.genConsComponent) {
          //this.config.trigger(true);
          this.genConsComponent.saveGeneralConsentForm();
        }
        break;
      case 'HighRiskOperation':
        if (this.hroComponent) {
          this.hroComponent.SaveConsentHro();
        }
        break;
      case 'medicalconsent':
        if (this.medicalComponent) {
          this.medicalComponent.SaveConsentMedical();
        }
        break;
      case 'medicalassessment':
        if (this.medicalassessment) {
          this.medicalassessment.save();
        }
        break;
      case 'medicalobsteric':
        if (this.medicalobsteric) {
          this.medicalobsteric.save();
        }
        break;
      case 'medicalpedia':
        if (this.medicalpedia) {
          this.medicalpedia.save();
        }
        break;
      case 'parentalcareinitial':
        if (this.parentalcareinitialassessment) {
          this.parentalcareinitialassessment.save();
        }
        break;
      case 'medicalsurgical':
        if (this.medicalsurgical) {
          this.medicalsurgical.save();
        }
        break;
      case 'cardiology':
        if (this.cardiologyassessment) {
          this.cardiologyassessment.save();
        }
        break;
      case 'anesthesia':
        if (this.anesthesia) {
          this.anesthesia.save();
        }
        break;
      case 'preanesthesia':
        if (this.preanesthesia) {
          this.preanesthesia.save();
        }
        break;
      default:
        break;
    }
  }
  ClearAssessment() {
    switch (this.activeAssessmentTab) {
      case 'chief_complaints':
        this.SavedChiefComplaints = '';
        this.emrNurseChiefComplaint = '';
        this.emrNursePhysicalExamination = '';
        this.divPhysicalExamination.nativeElement.innerHTML = '';
        this.emrNurseHistoryofPresentIllness = '';
        this.emrNurseAssessmentPlan = '';
        this.ChiefExaminationID = 0;
        this.FetchPatientChiefComplaintAndExaminations();
        break;
      case 'pulmonology':
        if (this.pulmComponent) {
          this.pulmComponent.clear();
        }
        break;
      case 'pulmonology-diseases':
        if (this.pulmdisComponent) {
          this.pulmdisComponent.clear();
        }
        break;
      case 'gynecology':
        if (this.signComponent) {
          this.signComponent.clearSignature();
        }
        break;
      case 'HighRiskOperation':
        if (this.hroComponent) {
          this.hroComponent.clear();
        }
        break;
      case 'generalconsent':
        if (this.genConsComponent) {
          this.genConsComponent.clear();
        }
        break;
      case 'medicalconsent':
        if (this.medicalComponent) {
          this.medicalComponent.clear();
        }
        break;
      case 'medicalassessment':
        if (this.medicalassessment) {
          this.medicalassessment.clear();
        }
        break;
      case 'medicalobsteric':
        if (this.medicalobsteric) {
          this.medicalobsteric.clear();
        }
        break;
      case 'medicalpedia':
        if (this.medicalpedia) {
          this.medicalpedia.clear();
        }
        break;
      case 'medicalsurgical':
        if (this.medicalsurgical) {
          this.medicalsurgical.clear();
        }
        break;
      case 'cardiology':
        if (this.cardiologyassessment) {
          this.cardiologyassessment.clear();
        }
        break;
      case 'anesthesia':
        if (this.anesthesia) {
          this.anesthesia.clear();
        }
        break;
      case 'preanesthesia':
        if (this.preanesthesia) {
          this.preanesthesia.clear();
        }
        break;
      default:
        break;
    }
  }
  SaveCheifComplaints() {
    if ($("#Chiefcomplaint").val() != '' && $("#PhysicalExamination").val() != '') {
      let payload = {
        "ChiefExaminationID": this.ChiefExaminationID,
        "PatientId": this.selectedView.PatientID,
        "Admissionid": this.selectedPatientAdmissionId,
        "DoctorId": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
        "ChiefComplaint": $("#Chiefcomplaint").val(),
        "PhysicalExamination": $("#PhysicalExamination").val(),
        "HospitalID": this.hospId,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.facility.FacilityID

      }
      this.config.SavePatientChiefComplaint(payload).subscribe(
        (response) => {
          if (response.Code == 200) {
            $("#saveCheifcomplaintssMsg").modal('show');
            setTimeout(() => {
              $("#saveCheifcomplaintssMsg").modal('hide');
              this.fetchCaseSheetConfigurations('Assessments');
            }, 1000)
            this.initialFormValue = this.clinicalConditionsForm.value;
            this.isDirty = false;
            this.pendingChanges = false;
            // if (!this.IsAdult) {
            //   this.getHight();
            //   this.getChart('W');
            // }
          } else {

          }
        },
        (err) => {
          console.log(err)
        });
    }
    else {
      this.errorMessage = "Please enter Chief Complaints & Physical Examination";
      $("#errorMsg").modal('show');
    }

  }

  SaveData() {
    $('#pills-diagnosis-tab').tab('show');
    this.tabclick('diagnosis');
  }

  onChangeDurationofIllness() {
    this.showdurationofIllnessValidation = false;
  }
  onChangeClinicalCondition() {
    this.clinicalConditionValidation = false;
  }
  fetchPainScoreMaster() {
    this.config.fetchPainScoreMasters().subscribe(response => {
      this.painScore = response.SmartDataList;
      this.painScore.forEach((element: any, index: any) => {
        if (element.id == 1) { element.imgsrc = "assets/images/image1.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 2) { element.imgsrc = "assets/images/image2.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 3) { element.imgsrc = "assets/images/image3.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 4) { element.imgsrc = "assets/images/image4.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 5) { element.imgsrc = "assets/images/image5.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 6) { element.imgsrc = "assets/images/image6.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
      });
      if (this.IsEmergency && this.selectedView.NursePainScoreID != '') {
        this.painScore.forEach((element: any, index: any) => {
          if (element.id == this.selectedView.NursePainScoreID)
            element.Class = "pain_reaction position-relative cursor-pointer active text-center justify-content-between";
          this.painScoreSelected = true; this.showPSValidation = false;
          this.selectedPainScoreId = this.selectedView.NursePainScoreID;
        });
      }
    })
  }
  fetchClinicalCondition() {
    this.config.fetchClinicalConditions().subscribe(response => {
      this.clinicalCondition = response.SmartDataList;
    })
  }
  fetchSpecialisationClinicalCondition() {
    this.config.fetchSpecialisationClinicalConditions(this.SpecialiseID, this.hospId).subscribe(response => {
      // this.clinicalCondition = response.SmartDataList;
      if (this.patientDetails.GenderID == '1')
        this.clinicalCondition = response.SmartDataList.filter((x: any) => x.GenderID == '0');
      else
        this.clinicalCondition = response.SmartDataList;
    })
  }
  ShowHidePregnancyOption() {
    // this.Age_Gender = this.selectedView.Age_Gender;
    // const ageRegex = /\d+/;
    // const ageMatch = this.Age_Gender.match(ageRegex);
    // const age = ageMatch ? ageMatch[0] : null;
    // const gender = this.Age_Gender.split("/")[1];
    var age = this.selectedView.Age?.trim().toString().split(' ').length > 1 ? this.selectedView.Age?.trim().split(' ')[0] : this.selectedView.Age.trim();

    this.openToggleYes = this.selectedView.Age.trim() && this.selectedView.Gender.trim() === "Female" && age > 15;
    if (this.openToggleYes) {
      this.showHidePregnancyToggle = true;
    }
  }
  togglePregnancy(option: boolean) {
    this.isDirty = true;
    this.pendingChanges = true; var age;
    //this.Age_Gender = this.selectedView.Age_Gender;
    //const ageRegex = /\d+/;
    //const ageMatch = this.Age_Gender.match(ageRegex);
    if (this.selectedView.PatientType == '3')
      age = this.selectedView.Age; //ageMatch ? ageMatch[0] : null;
    else
      age = this.selectedView.AgeValue;
    if (this.selectedView.PatientType === '1' || this.selectedView.PatientType === '3') {
      //age = this.selectedView.Age.split(' ')[0];
      age = this.selectedView.Age.trim().split(' ')[0];
    }
    const gender = this.selectedView.Gender.trim();
    this.openToggleYes = age && gender === "Female" && age > 15;
    this.pregnancyToggle = option === false ? true : false;
    const today = moment();
    this.lmpMinDate = today.subtract(9, 'months').subtract(15, 'days');

    if (option === true && this.openToggleYes) {
      $("#showPregnancyInfo").modal('show');
    }
  }
  pregnancyClick(preg: any) {
    if (preg == "Yes")
      this.pregnancyValue = "Yes";
    else
      this.pregnancyValue = "No";
  }
  closePregPopup() {
    if ((this.selectedView.PatientType === '3' || this.selectedView.PatientType === '2' || this.selectedView.PatientType === '4') && this.selectedView.IsPregnancy === 1) {
      this.pregnancyToggle = true;
    }
    else if (this.pregenencyHistoryList === undefined || this.pregenencyHistoryList?.length === 0) {
      //this.togglePregnancy(false);
      this.pregnancyToggle = false;
    }
  }
  toggleAllrgy(option: string) {
    this.isDirty = true;
    this.pendingChanges = true;
    this.allrgyValue = option === 'No' ? 'Yes' : 'No';
    if (option === 'Yes')
      $("#allergies_modal").modal('show');
  }
  toggleSmoking(option: string) {
    this.isDirty = true;
    this.pendingChanges = true;
    this.smokingValue = option === 'No' ? 'Yes' : 'No';
    if (option === "Yes" && this.IsAdult) {
      $("#saveSmokeInfo").modal('show');
      this.FetchSmokingInfo(2);
    }
  }
  toggleAlcoholUse(option: string) {
    this.isDirty = true;
    this.pendingChanges = true;
    this.alcoholValue = option === 'No' ? 'Yes' : 'No';
  }
  toggleSleep(option: string) {
    this.isDirty = true;
    this.pendingChanges = true;
    this.sleepValue = option === 'No' ? 'Yes' : 'No';;
  }
  togglePatEducated(option: string) {
    this.isDirty = true;
    this.pendingChanges = true;
    this.educatedValue = option === 'No' ? 'Yes' : 'No';;
  }
  lactationClick(lac: any) {
    if (lac == "Yes") {
      this.lactationToggleYes = "fs-7 btn selected";
      this.lactationToggleNo = "fs-7 btn";
      this.lactationSelected = true;
    }
    else {
      this.lactationToggleNo = "fs-7 btn selected";
      this.lactationToggleYes = "fs-7 btn";
      this.lactationSelected = false;
    }
  }
  savePregenencyHistoryList(ccSave: boolean = false) {
    let payload = {
      "PatientID": this.selectedView.PatientID,
      "EpisodeID": this.selectedView.EpisodeID,
      "AdmissionID": this.selectedView.AdmissionID,
      "MonitorID": this.selectedView.MonitorID,
      "Pregnency": 1,
      "LMP": this.datepipe.transform(this.pregnancyForm.value['lmp'], "dd-MMM-yyyy")?.toString(),
      "Lactation": this.lactationSelected == true ? "1" : "0",
      "Contraception": this.pregnancyForm.get('contraception')?.value,
      "TriSemister": this.pregnancyForm.get('triSemister')?.value,
      "EDD": this.datepipe.transform(this.pregnancyForm.get("edd")?.value, "dd-MMM-yyyy")?.toString(),
      "UserID": this.doctorDetails[0].UserId
    }
    let lmp = moment(this.pregnancyForm.value['lmp']).format('yyyy-MM-DD');
    let edd = moment(this.pregnancyForm.get("edd")?.value).format('yyyy-MM-DD');
    if (lmp === edd) {
      $("#showLMPEDDSameDateAlert").modal('show');
    }
    else {
      this.config.savePregenencyHistory(payload).subscribe(response => {
        //this.fetchPregenencyHistory();
        if (!ccSave) {
          $("#savePregnancyDetMsg").modal('show');
        }
        var triSemister = this.pregnancyForm.get('triSemister')?.value;
        if (triSemister.split(' ').length > 1) {
          if (this.pregnancyForm.get('triSemister')?.value.split(' ')[0] == "1")
            this.selectedView.PregnancyContent = "1st";
          else if (this.pregnancyForm.get('triSemister')?.value.split(' ')[0] == "2")
            this.selectedView.PregnancyContent = "2nd";
          else if (this.pregnancyForm.get('triSemister')?.value.split(' ')[0] == "3")
            this.selectedView.PregnancyContent = "3rd";
          else
            this.selectedView.PregnancyContent = "";
        } else {
          if (this.pregnancyForm.get('triSemister')?.value == "1")
            this.selectedView.PregnancyContent = "1st";
          else if (this.pregnancyForm.get('triSemister')?.value == "2")
            this.selectedView.PregnancyContent = "2nd";
          else if (this.pregnancyForm.get('triSemister')?.value == "3")
            this.selectedView.PregnancyContent = "3rd";
          else
            this.selectedView.PregnancyContent = "";
        }



      })
    }
  }
  fetchPregenencyHistory() {
    this.config.fetchPregenencyHistoryADV(this.PatientID, this.selectedPatientAdmissionId).subscribe((response: any) => {
      if (response.Code == "200") {
        if (response.PregnancyHisDataList.length > 0) {
          const preghist = response.PregnancyHisDataList.sort((a: any, b: any) => a.Seq - b.Seq);
          const edd = preghist[0].EDD;
          if (edd) {
            if (new Date(edd) >= new Date()) {
              this.pregnancyToggle = true; this.pregnancyValue = "Yes";
              this.pregenencyHistoryList = response.PregnancyHisDataList;
              if (this.pregenencyHistoryList[0].Lactation) {
                this.lactationToggleYes = "fs-7 btn selected";
                this.lactationToggleNo = "fs-7 btn";
              }
              this.pregnancyForm.setValue({
                pregYesNo: true,
                lactation: this.pregenencyHistoryList[0].TriSemister == 1 ? true : false,
                triSemister: this.pregenencyHistoryList[0].TriSemister,
                lmp: moment(this.pregenencyHistoryList[0].LMP).format('yyyy-MM-DD'), //this.datepipe.transform(this.pregenencyHistoryList[0].LMP), //this.pregenencyHistoryList[0].LMP,
                contraception: this.pregenencyHistoryList[0].Contraception,
                edd: moment(this.pregenencyHistoryList[0].EDD).format('yyyy-MM-DD'), //this.pregenencyHistoryList[0].EDD, //this.datepipe.transform(this.pregenencyHistoryList[0].EDD, "dd-MMM-yyyy")?.toString(),
              });
              this.clinicalConditionsForm.patchValue({
                Contraception: this.pregenencyHistoryList[0].Contraception
              })
            }
          }
        }
      }
    });

  }

  fetchPregnancyHistoryForAntenatal() {
    this.config.fetchPregnancyHistoryForAntenatal(this.PatientID, this.selectedPatientAdmissionId, this.doctorDetails[0].UserId, 1, this.hospId).subscribe((response: any) => {
      if (response.Code == "200") {
        if (response.FetchPatientPregnancyAntenatalDataList.length > 0) {
          const pregHistAntenatal = response.FetchPatientPregnancyAntenatalDataList[0];
          if (pregHistAntenatal.IsPatientVTEAntenatalDone == '0') {
            this.errorMessage = "VTE Antenatal Risk assessment is not done. Please proceed saving the form.";
            $('#errorMsg').modal('show');
          }
        }
      }
    });
  }


  onChangeEDDDate(event: any) {
    let lmp = moment(this.pregnancyForm.value['lmp']).format('yyyy-MM-DD');
    let edd = moment(this.pregnancyForm.value['edd']).format('yyyy-MM-DD');
    if (lmp === edd) {
      $("#showLMPEDDSameDateAlert").modal('show');
      event.target.value = "";
    }
  }
  onChangeLMPDate(event: any) {
    let lmp = moment(this.pregnancyForm.value['lmp']).format('yyyy-MM-DD');
    let edd = moment(this.pregnancyForm.value['edd']).format('yyyy-MM-DD');
    let lmpS = moment(this.pregnancyForm.value['lmp']).format('DD-MMM-yyyy');
    this.config.FetchEstimatedDeliveryDates(lmpS, this.hospId).subscribe((response: any) => {
      if (response.Code == "200") {
        if (response.FetchEstimatedDeliveryDatesDataaList.length > 0) {
          this.LMPEDDList = response.FetchEstimatedDeliveryDatesDataaList;
          this.pregnancyForm.patchValue({
            triSemister: this.LMPEDDList[0].Trimester,
            edd: moment(this.LMPEDDList[0].EDD).format('yyyy-MM-DD'),
          });
        }
      }
    });

    if (lmp === edd) {
      $("#showLMPEDDSameDateAlert").modal('show');
      event.target.value = "";
    }
  }

  onConsciousnessSelection(item: any) {
    this.tableVitals = [];
    this.consciousnessSelectionValue = item;
    this.behaviourSelectionValue = '';
    if (this.consciousnessSelectionValue && this.behaviourSelectionValue) {
      this.GetVitalsParams();
    }
    // if (this.consciousnessSelectionValue.ConsciousnessTypeID === '2') {
    //   this.GetVitalsParams();
    // }
    // else if (this.consciousnessSelectionValue && this.behaviourSelectionValue) {
    //   this.GetVitalsParams();
    // }
  }

  onBehaviourSelection(item: any) {
    this.tableVitals = [];
    this.behaviourSelectionValue = item;
    if (this.consciousnessSelectionValue && this.behaviourSelectionValue) {
      this.GetVitalsParams();
    }
  }

  GetVitalsParams() {
    var age = this.patientDetails.Age;
    if (this.selectedView.PatientType == '2' || this.selectedView.PatientType == '4')
      age = this.patientDetails.AgeValue;
    else if (this.selectedView.PatientType == '3')
      age = age.toString().trim().split(' ')[0];
    else if (age.toString().trim().split(' ').length > 1) {
      age = age.toString().trim().split(' ')[0];
    }

    const FacilityID = this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID
    if (this.selectedCard.PatientType === '3') {
      this.patientDetails.AgeUoMID = this.patientDetails.AGeUOMID;
    }
    else if (this.selectedCard.PatientType === '2' || this.selectedCard.PatientType === '4') {
      this.patientDetails.AgeUoMID = this.patientDetails.AgeUOMID;
    }
    const { GenderID, AgeUoMID } = this.patientDetails;
    const { SpecialiseID } = this.selectedView;

    let consciousnessTypeID = 0;
    let behaviorTypeID = 0
    if (!this.IsAdult) {
      consciousnessTypeID = this.consciousnessSelectionValue?.ConsciousnessTypeID;
      behaviorTypeID = this.behaviourSelectionValue?.BehaviorTypeID ?? 0;
    }
    this.config.getVitalsParamsSpec(this.hospId, SpecialiseID, FacilityID, GenderID, age, AgeUoMID, consciousnessTypeID === undefined ? 0 : consciousnessTypeID, behaviorTypeID).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitals = response.GetVitalsParamsDataSPList;
        if (this.tableVitals.length) {
          setTimeout(() => {
            if (this.inputFields && this.inputFields.first) {
              this.inputFields.first.nativeElement.focus();
            }
          }, 1000);
        } else {
          this.errorMessage = 'No Vital Parameters Found';
          $('#errorMsg').modal('show');
        }
      } else {
      }
    },
      () => {

      });
  }

  FetchVitalHypertensionParameters() {
    this.config.fetchVitalHypertensionParameters(this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitalHypertensionParameters = response.FetchHypertensionParametersOutputLists;
      } else {
      }
    },
      (err) => {

      })
  }

  addVitals() {
    $("#vitalsModal").modal('show');
    this.hypertension = "";
    this.consciousnessSelectionValue = '';
    this.behaviourSelectionValue = '';
    if (this.IsAdult) {
      this.GetVitalsParams();
    } else {
      this.tableVitals = [];
    }
    this.FetchVitalHypertensionParameters();
  }

  preventDot(event: any): void {
    if (event.key === '.') {
      event.preventDefault();
    }
  }

  checkInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (target.value.includes('.')) {
      target.value = target.value.replace(/\./g, '');
    }
  }

  saveVitals(remarksSelectedIndex?: number) {
    let find = this.tableVitals.filter((x: any) => x?.PARAMVALUE === null);
    let bpsys = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP -Systolic");
    let bpdia = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP-Diastolic");
    let temp = this.tableVitals.filter((x: any) => x?.PARAMETER === "Temperature");
    let remarksEntered = true;
    this.remarksNotEntered = [];
    if (bpsys[0].PARAMVALUE === null || bpsys[0].PARAMVALUE === "" || bpdia[0].PARAMVALUE === null || bpdia[0].PARAMVALUE === "" || temp[0].PARAMVALUE === null || temp[0].PARAMVALUE === "") {
      this.showVitalsValidation = true;
    } else {
      let VsDetails: any = [];
      let outOfRangeParameters: string[] = [];
      this.tableVitals.forEach((element: any, index: any) => {

        let RST: any;
        let ISPANIC: any;
        if ((element.PARAMVALUE >= element.ALLOWUOMMINRANGE && element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE && element.PARAMVALUE <= element.ALLOWUOMMAXRANGE))
          RST = 2;
        else
          RST = 1;

        if ((!element.PARAMVALUE) && ((element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE)))
          ISPANIC = 1;
        else
          ISPANIC = 0;
        const remark = this.recordRemarks.get(index);
        if (element.PARAMVALUE !== null && element.VitalHigh || element.VitalLow) {
          outOfRangeParameters.push(element.PARAMETER);
          if (remark === undefined || remark.trim() === "") {
            this.remarksNotEntered.push({
              index,
              element
            });
            this.parameterErrorMessage = `Please enter Remarks for ${element.PARAMETER}`;
            remarksEntered = false;
          }
        }
        VsDetails.push({
          "VSPID": element.PARAMETERID,
          "VSNAME": element.PARAMETER,
          "VSGID": element.GROUPID,
          "VSGDID": element.GroupDETAILID,
          "PV": element.PARAMVALUE,
          "CMD": remark,
          "RST": RST,
          "ISPANIC": ISPANIC
        });
      });
      if (outOfRangeParameters.length > 0 && !remarksEntered) {
        if (this.selectedView.PatientType != "1") {
          this.showRemarksMessage = false;
          $("#remarks").modal('show');
          this.showParamValidationMessage = true;
          this.showVitalsValidation = false;
          return;
        }
      }
      let payload = {
        "MonitorId": "0",
        "PatientID": this.PatientID,
        "Admissionid": this.selectedPatientAdmissionId,
        "DoctorID": this.doctorDetails[0].EmpId,
        "HospitalId": this.hospId,
        "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
        "PatientType": this.selectedView.PatientType,
        "ScheduleID": (this.selectedView.ScheduleID == "" || this.selectedView.ScheduleID == undefined) ? "0" : this.selectedView.ScheduleID,
        "VSDetails": VsDetails,
        "UserId": this.doctorDetails[0].UserId
      };

      this.config.SaveClinicalVitals(payload).subscribe(response => {
        if (response.Code == 200) {
          $("#saveVitalsMsg").modal('show');
          $("#vitalsModal").modal('hide');
          this.vitalsValidation = false;
          outOfRangeParameters.forEach(parameter => {
            const index = this.tableVitals.findIndex((element: any) => element.PARAMETER === parameter);
            this.recordRemarks.delete(index);
          });
        }
        this.GetVitalsData();
      })
      this.showParamValidationMessage = false;

      // SaveClinicalVitals
    }

    // this.tableVitals.forEach((element: any, index: any) => {
    //   if(element.PARAMVALUE === null) {
    //     this.showVitalsValidation = true;
    //   }
    //   else {
    //     this.showVitalsValidation = false;
    //   }
    // });
  }

  onRemarksChange(value: any, index: any) {
    if (value.key === '.') {
      value.preventDefault();
      return;
    }
    this.recordRemarks.set(index, value);
  }

  onRemarksSave() {
    let isRemarksEntered = true;
    this.remarksNotEntered.forEach((item: any) => {
      if (!this.recordRemarks.get(item.index)) {
        isRemarksEntered = false;
      }
    });
    if (isRemarksEntered) {
      this.showRemarksMessage = false;
      $("#remarks").modal('hide');
      this.saveVitals();
    } else {
      this.showRemarksMessage = true;
    }
  }

  initializetablePatientsForm() {
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
    })
  }
  private createPSChartLine(): void {
    let data: any = {};

    const painScoreData: any[] = [];

    this.painScoreHistory.forEach((element: any, index: any) => {
      painScoreData.push([element.CREATEDATE, parseFloat(element.PainScoreID)])
    });

    data = [{ name: 'PainScore', data: painScoreData }];

    const chart = Highcharts.chart('chart-ps-line', {
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

  fetchPatientAllergies() {
    this.allergiesList = [];
    this.foodallergiesList = [];
    this.drugallergiesList = [];
    this.otherallergiesList = [];
    this.drugList = [];
    this.foodList = [];
    this.otherallergyList = [];

    this.config.fetchPatientAllergies(this.PatientID, this.patientDetails.RegCode, this.hospId).subscribe((response) => {
      if (response.Status === "Success") {

        this.allergiesList = response.PatientAllergiesDataList;        
        this.foodallergiesList = response.PatientFoodAllergiesDataList;
        this.drugallergiesList = response.PatientDrugAllergiesDataList;
        this.otherallergiesList = response.PatientAllergiesDataList;
        let allergiesList : any[] = [];
        allergiesList = allergiesList.concat(...this.foodallergiesList.map((food: any) => ({ ...food, type: 'food' })),
        ...this.drugallergiesList.map((drug: any) => ({ ...drug, type: 'drug' })),
        ...this.otherallergiesList.map((other: any) => ({ ...other, type: 'other' })),);
        sessionStorage.setItem("PatientAllergies", JSON.stringify(allergiesList));
        this.AllergyData = response.ToolTipAllergyData;
        this.drugallergiesList.forEach((element: any, index: any) => {
          let d = new DrugAllergy(element.Remark, element.GenericID, element.FromDate
            , "0", element.Description, element.AllergieTypes, element.GenericName);
          this.drugList.push(d);
        });

        this.foodallergiesList.forEach((element: any, index: any) => {
          let d = new FoodAllergy(element.Remark, element.FoodID, element.FromDate
            , "0", element.Description, element.AllergieTypes, "0");
          this.foodList.push(d);
        });

        this.otherallergiesList.forEach((element: any, index: any) => {
          let d = new OtherAllergy(element.Allergy, element.OtherAllergyID, element.FromDate
            , "0", element.Description, element.AllergieTypes, "0");
          this.otherallergyList.push(d);
        });

        if (this.allergiesList?.length > 0 || this.foodallergiesList?.length > 0 || this.drugallergiesList?.length > 0 || this.otherallergiesList.length > 0) {
          //$("#quick_info").modal('show');
          // if (!this.isClearAllergyPopup)
          //   $("#quick_info_Allergies").modal('show');
          if (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4') {
            this.selectedPatientSSN = this.selectedView.SSN;
            this.selectedPatientName = this.selectedView.PatientName;
            this.selectedPatientGender = this.selectedView.Gender;
            this.selectedPatientAge = this.selectedView.FullAge;
            this.selectedPatientMobile = this.selectedView.MobileNo;
            this.selectedPatientHeight = this.selectedView.Height;
            this.selectedPatientWeight = this.selectedView.Weight;
            this.selectedPatientBloodGrp = this.selectedView.BloodGroup;
            this.selectedPatientIsVip = this.selectedView.IsVIP == "Non-VIP" ? false : true;
            if (this.selectedView.IsPregnancy) {
              this.selectedPatientIsPregnancy = true;
              this.selectedPatientPregnancyTrisemister = this.selectedView.PregnancyContent;
            }
            else {
              this.selectedPatientIsPregnancy = false;
              this.selectedPatientPregnancyTrisemister = "";
            }
            this.config.FetchPatientFileInfo(this.selectedView.EpisodeID, this.selectedView.IPID, this.hospId, this.selectedView.PatientID, this.selectedView.RegCode).subscribe((response: any) => {
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
                this.selectedPatientPulse = response.objPatientVitalsList[3]?.Value != undefined ? response.objPatientVitalsList[3].Value : '';
                this.selectedPatientSPO2 = response.objPatientVitalsList[4]?.Value != undefined ? response.objPatientVitalsList[4].Value : '';
                this.selectedPatientRespiration = response.objPatientVitalsList[5]?.Value != undefined ? response.objPatientVitalsList[5].Value : '';
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
            })
          } else {

            this.selectedPatientSSN = this.selectedCard.SSN;
            this.selectedPatientName = this.selectedCard.PatientName;
            this.selectedPatientGender = this.selectedCard?.FullAge_Gender?.split('/')[1];
            this.selectedPatientAge = this.selectedCard?.FullAge_Gender?.split('/')[0];
            this.selectedPatientMobile = this.selectedCard.MobileNo;
            this.selectedPatientHeight = this.selectedCard.Height;
            this.selectedPatientWeight = this.selectedCard.Weight;
            this.selectedPatientBloodGrp = this.selectedCard.BloodGroup;
            this.selectedPatientIsVip = this.selectedCard.ISVIP == "Non-VIP" ? false : true;
            if (this.selectedCard.IsPregnancy) {
              this.selectedPatientIsPregnancy = true;
              this.selectedPatientPregnancyTrisemister = this.selectedCard.PregnancyContent;
            }
            else {
              this.selectedPatientIsPregnancy = false;
              this.selectedPatientPregnancyTrisemister = "";
            }
            this.config.FetchPatientFileInfo(this.selectedCard.EpisodeID, this.selectedCard.AdmissionID, this.hospId, this.selectedCard.PatientID, this.selectedCard.RegCode).subscribe((response: any) => {
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
                this.selectedPatientPulse = response.objPatientVitalsList[3]?.Value != undefined ? response.objPatientVitalsList[3].Value : '';
                this.selectedPatientSPO2 = response.objPatientVitalsList[4]?.Value != undefined ? response.objPatientVitalsList[4].Value : '';
                this.selectedPatientRespiration = response.objPatientVitalsList[5]?.Value != undefined ? response.objPatientVitalsList[5].Value : '';
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
            })
          }



          this.isAllergy = true;
          // let el: HTMLElement = this.allergyYes.nativeElement;
          // el.click();
          $("#btnNo").removeClass("selected");
          $("#btnYes").addClass("selected");

          this.allrgyValue = "Yes";
        } else {
          this.allrgyValue = "No";
          this.isAllergy = false;
          $("#btnNo").addClass("selected");
          $("#btnYes").removeClass("selected");

        }

        this.fetchTopAllergySearch();
      }
    },
      (err) => {

      })
  }

  showPatientInfo() {
    $("#quick_info").modal('show');
    this.selectedPatientSSN = this.selectedView.SSN;
    this.selectedPatientName = this.selectedView.PatientName;
    this.selectedPatientGender = this.selectedView.Gender;
    this.selectedPatientAge = this.selectedView.FullAge;
    this.selectedPatientMobile = this.selectedView.MobileNo;
    this.selectedPatientHeight = this.selectedView.Height;
    this.selectedPatientWeight = this.selectedView.Weight;
    this.selectedPatientBloodGrp = this.selectedView.BloodGroup;
    this.selectedPatientIsVip = this.selectedView.IsVIP == "Non-VIP" ? false : true;
    if (this.selectedView.IsPregnancy) {
      this.selectedPatientIsPregnancy = true;
      this.selectedPatientPregnancyTrisemister = this.selectedView.PregnancyContent;
    }
    else {
      this.selectedPatientIsPregnancy = false;
      this.selectedPatientPregnancyTrisemister = "";
    }
    this.config.FetchPatientFileInfo(this.selectedView.EpisodeID, this.selectedView.IPID, this.hospId, this.selectedView.PatientID, this.selectedView.RegCode).subscribe((response: any) => {
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
    })
  }

  allergyTypeSelection(type: any) {
    this.allergyType = type;
    this.allergyList = [];
    this.resetAllergy();
    if (type == 'Drug') {
      $("#btnDrug").addClass("btn-main-fill");
      $("#btnFood").addClass("btn-main-outline");
      $("#btnContrast").addClass("btn-main-outline");
      $("#btnOthers").addClass("btn-main-outline");

      $("#btnDrug").removeClass("btn-main-outline");
      $("#btnFood").removeClass("btn-main-fill");
      $("#btnContrast").removeClass("btn-main-fill");
      $("#btnOthers").removeClass("btn-main-fill");
    } else if (type == 'Food') {
      $("#btnDrug").addClass("btn-main-outline");
      $("#btnFood").addClass("btn-main-fill");
      $("#btnContrast").addClass("btn-main-outline");
      $("#btnOthers").addClass("btn-main-outline");

      $("#btnDrug").removeClass("btn-main-fill");
      $("#btnFood").removeClass("btn-main-outline");
      $("#btnContrast").removeClass("btn-main-fill");
      $("#btnOthers").removeClass("btn-main-fill");
    } else if (type == 'Contrast') {
      $("#btnDrug").addClass("btn-main-outline");
      $("#btnFood").addClass("btn-main-outline");
      $("#btnContrast").addClass("btn-main-fill");
      $("#btnOthers").addClass("btn-main-outline");

      $("#btnDrug").removeClass("btn-main-fill");
      $("#btnFood").removeClass("btn-main-fill");
      $("#btnContrast").removeClass("btn-main-outline");
      $("#btnOthers").removeClass("btn-main-fill");
    } else if (type == 'Others') {
      $("#btnDrug").addClass("btn-main-outline");
      $("#btnFood").addClass("btn-main-outline");
      $("#btnContrast").addClass("btn-main-outline");
      $("#btnOthers").addClass("btn-main-fill");

      $("#btnDrug").removeClass("btn-main-fill");
      $("#btnFood").removeClass("btn-main-fill");
      $("#btnContrast").removeClass("btn-main-fill");
      $("#btnOthers").removeClass("btn-main-outline");
    }
  }

  fetchAllergySearch(event: any) {
    if (event.target.value.length === 0) {
      this.allergyList = [];
    }

    if (event.target.value.length >= 3) {
      var filter = event.target.value;

      if (this.allergyType == 'Drug') {
        this.config.fetchDrugSmartSearch(filter).subscribe((response: any) => {
          if (response.Code == 200) {
            this.allergyList = response.GetDrugAllergiesList;
            //this.filterData();
          }
        }, error => {
          console.error('Get Data API error:', error);
        });
      }
      else if (this.allergyType == 'Food') {
        this.config.fetchFoodSmartSearch(filter).subscribe((response: any) => {
          if (response.Code == 200) {
            this.allergyList = response.GetFoodAllergiesList;
            //this.filterData();
          }
        }, error => {
          console.error('Get Data API error:', error);
        });
      }

    }
  }

  fetchTopAllergySearch() {
    this.config.fetchFoodSmartSearch('%%').subscribe((response: any) => {
      if (response.Code == 200) {
        this.topFoodAllergyList = response.GetFoodAllergiesList.sort((a: any, b: any) => a.Seq - b.Seq);
        this.topFoodAllergyList = this.topFoodAllergyList.slice(0, 5);
      }
    }, error => {
      console.error('Get Data API error:', error);
    });
  }

  selectAllergyItem(item: any) {
    this.allergyQuery = item.name;

    this.allergyForm.patchValue({
      DrugName: item.name,
      DrugId: item.id,
      GenericId: item.id
    });

    this.allergyList = [];
    //this.drugList = [];
    //this.foodList = [];

    //console.log(this.allergyForm);

    // const itemFormGroup = this.fb.group({
    //   ItemCode: item.itemCode,
    //   ItemName: item.Name,
    //   ItemID: item.itemid,
    //   DiagnosisType: 1,
    //   Type: 1,
    //   IsExisting: 0,
    //   MNID: 0,
    //   Remarks: "",
    //   BLK: 0
    // })

    // this.items.push(itemFormGroup);
  }

  addDrug() {
    this.isAllergySubmitted = true;

    let find = this.drugList.filter((x: any) => x?.GENERICID == this.allergyForm.get('GenericId')?.value);
    if (find.length > 0) {
      this.errorMessage = "Duplicate Drug is not allowed";
      $("#errorMsg").modal('show');
      return;
    }

    let find1 = this.foodList.filter((x: any) => x?.REMARKS == this.allergyForm.get('DrugName')?.value);
    if (find1.length > 0) {
      this.errorMessage = "Duplicate Food is not allowed";
      $("#errorMsg").modal('show');
      return;
    }
    if (this.allergyType !== 'Others') {
      if (!this.allergyForm.valid || this.allergyForm.get('Severity')?.value === 0) {
        return;
      }
    }
    else {
      if (this.allergyForm.get('DrugName')?.value === '' || this.allergyForm.get('Severity')?.value === 0) {
        return;
      }
    }
    // drugList
    if (this.allergyType == 'Drug') {
      let d = new DrugAllergy(this.allergyForm.get('DrugName')?.value, this.allergyForm.get('GenericId')?.value, this.todayDate
        , "0", this.allergyForm.get('Description')?.value, this.allergyForm.get('Severity')?.value, this.allergyForm.get('DrugName')?.value);
      this.drugList.push(d);
    }
    else if (this.allergyType == 'Food') {
      let d = new FoodAllergy(this.allergyForm.get('DrugName')?.value, this.allergyForm.get('DrugId')?.value, this.todayDate
        , "0", this.allergyForm.get('Description')?.value, this.allergyForm.get('Severity')?.value, "0");
      this.foodList.push(d);
    }
    else if (this.allergyType == 'Others') {
      let d = new OtherAllergy(this.allergyForm.get('DrugName')?.value, '0', this.todayDate
        , "0", this.allergyForm.get('Description')?.value, this.allergyForm.get('Severity')?.value, "0");
      this.otherallergyList.push(d);
    }

    this.isAllergySubmitted = false;

    this.resetAllergy();
  }

  resetAllergy() {
    this.allergyForm.reset({
      DrugId: '',
      GenericId: '',
      DrugName: '',
      Severity: 0,
      Description: '',
    });
  }

  ClearAllergy() {
    this.isClearAllergyPopup = true;
    this.allergyType = '';
    $("#btnFood").removeClass("btn-main-fill");
    $("#btnDrug").removeClass("btn-main-fill");
    this.fetchPatientAllergies();
    this.resetAllergy();
    this.isAllergydeleted = false;
    this.deletedAllergy = "";
  }
  close() {
    // this.allergyType = '';
    // $("#btnFood").removeClass("btn-main-fill");
    // $("#btnDrug").removeClass("btn-main-fill");
    // if (this.allrgyValue == "No" && (this.allrgyValue.length > 0 || this.foodList.length > 0)) {
    //   this.allrgyValue = "Yes";
    // }
    if (this.allergiesList?.length === 0 && this.foodallergiesList?.length === 0 && this.otherallergyList?.length === 0 && this.drugallergiesList?.length === 0) {
      //this.toggleAllrgy('No');
      this.allrgyValue = 'No';
    }
    else {
      this.allrgyValue = 'Yes';
    }
  }
  clearVitals() {
    this.tableVitals.forEach((item: any) => {
      item.PARAMVALUE = '';
      item.VitalLow = '';
      item.VitalHigh = '';
      item.Score = '';
      this.totalScore = 0;
    });
    this.hypertension = "";
  }

  SaveAllergy() {
    if (this.foodList.length === 0 && this.drugList.length === 0 && this.otherallergyList.length === 0) {
      if (!this.recordsAddedAndRemoved) {
        this.isAllergySubmitted = true;
        return;
      }
    }
    else {
      if (this.foodList.length > 0) {
        let findFoodAllg = this.foodList.filter((f: any) => f.ALLERGIETYPES == '');
        if (findFoodAllg.length > 0) {
          this.severityForFoodAllergy = "Please enter severity for " + findFoodAllg[0].REMARKS;
          return;
        }
        else {
          this.severityForFoodAllergy = "";
        }
      }
    }
    const allgydeleterem = $("#deleteAlrgyRemarks").val();
    if (this.isAllergydeleted && allgydeleterem === '') {
      this.errorMessage = "Please enter remarks for deleting allergy.";
      $('#errorMessage').modal('show');
      return;
    }

    let payload = {
      "PatientID": this.PatientID,
      "IPID": this.AdmissionID,
      "FoodAllergies": this.foodList,
      "DrugAllergies": this.drugList,
      "OtherAllergies": this.otherallergyList,
      "ContrastAllergies": []
    };

    this.config.SaveAllergies(payload).subscribe(response => {
      this.fetchPatientAllergies();
      $("#saveAllergyMsg").modal('show');
      $("#allergies_modal").modal('hide');

      this.isAllergySubmitted = false;
      this.recordsAddedAndRemoved = false;
    });
  }

  deleteFoodAllergy(index: any) {
    this.foodList.splice(index, 1);
    this.recordsAddedAndRemoved = true;
    this.isAllergydeleted = true;
    this.deletedAllergy = "Food Allergy";
  }
  deleteDrugAllergy(index: any) {
    this.drugList.splice(index, 1);
    this.recordsAddedAndRemoved = true;
    this.isAllergydeleted = true;
    this.deletedAllergy = "Drug Allergy";
  }
  deleteOtherAllergy(index: any) {
    this.otherallergyList.splice(index, 1);
    this.recordsAddedAndRemoved = true;
    this.isAllergydeleted = true;
    this.deletedAllergy = "Other Allergy";
  }

  showallergyModal() {
    $("#allergies_modal").modal('show');
    this.fetchPatientAllergies();
  }
  showAllergyDEtails() {
    $("#allergies_modal").modal('show');
  }
  checkMaxRangeValue(event: any, current_parameter: any, current_value: any, min_value: any, max_value: any, index: any) {
    current_value = parseFloat(current_value);
    min_value = parseFloat(min_value);
    max_value = parseFloat(max_value)
    this.paramter = current_parameter;
    this.tableVitals.forEach((element: any, index: any) => {
      if (element.PARAMETER == "BP -Systolic") {
        this.BPsys_value = "";
        this.isBPsys = false;
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = false;
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.BPsys_value = "Abnormal";
          this.isBPsys = true; this.bpmsg = true;
          this.tableVitals[index].VitalHigh = true;
          this.tableVitals[index].VitalLow = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.BPsys_value = "Low";
          this.isBPsys = true; this.bpmsg = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else {

        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0) {
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
          element.Color = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].Color;
        }
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (element.PARAMETER == "BP-Diastolic") {
        this.BPdia_value = "";
        this.isBPdia = false;
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = false;
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.BPdia_value = "Abnormal";
          this.isBPdia = true; this.bpmsg = true;
          this.tableVitals[index].VitalHigh = true;
          this.tableVitals[index].VitalLow = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.BPdia_value = "Low";
          this.isBPdia = true; this.bpmsg = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else {
          this.BPdia_value = "";
          this.isBPdia = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (current_parameter == "Temparature") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isTemperature = true; this.bpmsg = true; this.temparaturepmsg = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Low"; this.bpmsg = true; this.temparaturepmsg = true;
          this.isTemperature = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else {
          this.Temp_value = "";
          this.isTemperature = false; this.temparaturepmsg = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        } var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }

      else if (current_parameter == "Pulse") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isPulse = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Low";
          this.isPulse = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else {
          this.Temp_value = "";
          this.isPulse = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }

      else if (current_parameter == "SPO2") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isSPO2 = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Low";
          this.isSPO2 = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else {
          this.Temp_value = "";
          this.isSPO2 = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (current_parameter == "Respiration") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isRespiration = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Low";
          this.isRespiration = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else {
          this.Temp_value = "";
          this.isRespiration = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (current_parameter == "O2 Flow Rate") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isO2FlowRate = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Low";
          this.isO2FlowRate = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            if (this.selectedView.PatientType != "1")
              this.openRemarks(index);
          }
        }
        else {
          this.Temp_value = "";
          this.isO2FlowRate = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      this.totalScore = this.tableVitals.map((item: any) => (item.PARAMVALUE != null && item.Score != "" && item.Score != "METCALL") ? Number.parseInt(item.Score) : 0).reduce((acc: any, curr: any) => acc + curr, 0);

      // if((this.tableVitals[0].PARAMVALUE != null && this.tableVitals[0].PARAMVALUE != "")|| (this.tableVitals[1].PARAMVALUE != null && this.tableVitals[1].PARAMVALUE != "")) {
      //   this.getVitalsHypertensionParameter(parseFloat(this.tableVitals[0].PARAMVALUE), parseFloat(this.tableVitals[1].PARAMVALUE));
      //   console.log(this.hypertension)
      // } 
      if ((this.tableVitals[0].PARAMVALUE != null && this.tableVitals[0].PARAMVALUE != "")) {
        this.getVitalsHypertensionParameter(parseFloat(this.tableVitals[0].PARAMVALUE));
      }


    });
  }
  getVitalsHypertensionParameter(bpSys: any) {
    this.tableVitalHypertensionParameters.forEach((element: any, index: any) => {
      if (element.ParameterID == "1") {
        if (
          bpSys > parseFloat(element.SYS.split('>')[1])
          //|| bpDia > parseFloat(element.DIA.split('>')[1])
        ) {
          this.hypertension = element;
        }
      }
      else if (element.ParameterID == "5") {
        if (
          bpSys < parseFloat(element.SYS.split('<')[1])
          //||  bpDia < parseFloat(element.DIA.split('<')[1])
        ) {
          this.hypertension = element;
        }
      }
      else {
        if (
          (bpSys >= parseFloat(element.SYS.split('-')[0]) && bpSys <= parseFloat(element.SYS.split('-')[1]))
          //|| (bpDia >= parseFloat(element.DIA.split('-')[0]) && bpDia <= parseFloat(element.DIA.split('-')[1]))
        ) {
          this.hypertension = element;
        }
      }
    });
  }

  // getVitalsHypertensionParameter(bpSys:any, bpDia:any) {
  //   this.tableVitalHypertensionParameters.forEach((element: any, index: any) => {
  //     if(element.ParameterID == "1") {
  //       if(
  //         bpSys > parseFloat(element.SYS.split('>')[1]) 
  //         //|| bpDia > parseFloat(element.DIA.split('>')[1])
  //         ) {
  //         this.hypertension =  element;
  //       }        
  //     }
  //     else if(element.ParameterID == "5") {
  //       if(
  //         bpSys < parseFloat(element.SYS.split('<')[1]) 
  //         //||  bpDia < parseFloat(element.DIA.split('<')[1])
  //         ) {            
  //           this.hypertension = element;
  //       }
  //     }
  //     else {
  //       if(
  //         (bpSys >= parseFloat(element.SYS.split('-')[0]) && bpSys <= parseFloat(element.SYS.split('-')[1]))
  //          //|| (bpDia >= parseFloat(element.DIA.split('-')[0]) && bpDia <= parseFloat(element.DIA.split('-')[1]))
  //         ) {
  //           this.hypertension = element;
  //       }
  //     }
  //   });
  // }
  // diagnosisLoadClick() {
  //   let el: HTMLElement = this.myDiag.nativeElement;
  //   el.focus();
  // }
  openAllergyPopup() {
    this.showAllergydiv = true;
  }
  trimesterChange(event: any) {

  }

  addFavAllergy(selectedAllergy: any) {

    this.topFoodAllergyList.forEach((element: any, index: any) => {
      $("#btntop_" + this.trimSpaces(element.name)).removeClass("btn-main-fill btn-main-outline");
      $("#btntop_" + this.trimSpaces(element.name)).addClass("btn-main-outline");
    });

    $("#btntop_" + this.trimSpaces(selectedAllergy.name)).addClass("btn-main-fill");

    let find = this.foodList.filter((x: any) => x?.REMARKS.trim() == selectedAllergy.name.trim());
    if (find.length > 0) {
      this.errorMessage = "Duplicate Food is not allowed";
      $("#errorMsg").modal('show');
      return;
    }
    // let d = new FoodAllergy(selectedAllergy.name, selectedAllergy.id, this.todayDate
    //     , "0", '', '', "0");    
    //   this.foodList.push(d);

    this.allergyForm.patchValue({
      DrugName: selectedAllergy.name,
      DrugId: selectedAllergy.id,
      GenericId: selectedAllergy.id
    });
  }

  endofEpisodeClick() {
    this.addDays();
    if (!this.endofEpsiodeDate) {
      if (this.clickedtab !== 'clinical') {
        this.tabclick('clinical');
      }
      this.config.FetchEmergencyDischargeDispositions(this.doctorDetails[0].EmpId, this.hospId)
        .subscribe((response: any) => {
          this.Disposition = response.FetchEmergencyDischargeDispositionsDataList;
          this.fetchAdmissionRequestAlreadyRaised();
        },
          (err) => {
          })
      $('#endofEpisodeJustification').modal('show');
    }
  }

  fetchAdmissionRequestAlreadyRaised() {
    this.config.FetchPatientAdmissionRequestAndSurgeryRequest(this.selectedView.AdmissionID, this.doctorDetails[0].UserId, this.hospId)
      .subscribe((response: any) => {
        if (response.Code === 200 && response.FetchPatientAdmissionRequestAndSurgeryRequestDataList.length > 0) {
          this.FetchPatientAdmissionRequestAndSurgeryRequestDataList = response.FetchPatientAdmissionRequestAndSurgeryRequestDataList;
          this.admissionRequestRaised = true;
        }
      },
        (err) => {
        })
  }

  clearEndOfEpisode() {

    if (this.showFollowupForm) {
      this.followupForm.patchValue({
        FollowupAfter: '',
        FollowupDate: '',
        Remarks: '',
        NoofFollowUp: '0',
        NoofDays: '',
        adviceToPatient: ''
      });
    }
    else if (this.isemrPatientAdmission) {
      this.emrAdmissionForm.patchValue({
        WardID: '0',
        Specialization: '0',
        SpecializationName: '',
        SpecialisationDoctorID: '0',
        SpecialisationDoctorName: '',
        TodayAfter: 'T',
        AfterDays: '0',
        Admission: new Date(),
        Expectedlengthofstay: '0',
        DischargeDate: '',
      });
    }
    $("endofEpisodeRemarks").val('');
    this.followupFormNA = false;
  }

  saveEndofEpisodeRemarks() {
    if (this.FetchClinicalInfoDataList.length === 0) {
      this.saveClinicalConditions();
    }
    this.showendofEpisodeRemarks = false;
    if (this.selectedView.PatientType == "3" || this.selectedView.PatientType == "1") {

      const wardid = this.emrAdmissionForm.get('WardID')?.value;
      const specid = this.emrAdmissionForm.get('Specialization')?.value;
      const docid = this.emrAdmissionForm.get('SpecialisationDoctorID')?.value;
      const FollowUpOn = moment(this.emrAdmissionForm.get('Admission')?.value).format('DD-MMM-YYYY');//this.emrAdmissionForm.get('Admission')?.value;
      const LengthOfStay = this.emrAdmissionForm.get('Expectedlengthofstay')?.value;

      const DischargeDate = moment(this.emrAdmissionForm.get('DischargeDate')?.value).format('DD-MMM-YYYY');//this.emrAdmissionForm.get('DischargeDate')?.value;


      if ($("#DispositionsID").val() == '4') {
        var IsAdmissionRec = "1";
        if (this.FetchPatientAdmissionRequestAndSurgeryRequestDataList && this.FetchPatientAdmissionRequestAndSurgeryRequestDataList.length > 0) {
          IsAdmissionRec = this.FetchPatientAdmissionRequestAndSurgeryRequestDataList[0].IsAdmissionRec;
        }
        //IsAdmissionRec = sessionStorage.getItem("IsAdmissionRec");
        if (IsAdmissionRec == "0") {
          this.showPatientNotSelectedValidation = true;
          //return;
        }
        else
          this.showPatientNotSelectedValidation = false;
        // if (wardid == '0')
        //   this.referralWard = true;
        // else 
        if (specid == '0')
          this.referralSpecialization = true;
        else if (docid == '0')
          this.referralDoctor = true;
      }

      //FollowUp validation if NA
      if ($("#DispositionsID").val() == '1' && !this.followupFormNA && this.followupForm.get("FollowupAfter")?.value === '') {
        this.followUpSubmitted = true;
        return;
      }

      this.startTimers(this.selectedView);
      if (($("#DispositionsID").val() == '4' || $("#DispositionsID").val() == '1') && $("#endofEpisodeRemarks").val() != '') {
        var endofepisoderemarks = $("#endofEpisodeRemarks").val();
        if (this.showFollowupForm && !this.followupFormNA) {
          endofepisoderemarks = this.followupForm.get("Remarks")?.value;
        }
        var ExpiryDate = "0";
        if ($("#ScheduleStartDate").val() != '' && $("#ScheduleStartDate").val() != undefined && $("#endofEpisodeTime").val() != '' && $("#endofEpisodeTime").val() != undefined)
          ExpiryDate = $("#ScheduleStartDate").val() + " " + $("#endofEpisodeTime").val();
        this.config.UpdateEMRPatientEpisodeclose(this.PatientID, this.selectedPatientAdmissionId, true, this.doctorID, this.selectedView.SpecialiseID,
          this.selectedView.BillID, endofepisoderemarks, $("#DispositionsID").val(), ExpiryDate, this.TriageLOS, this.hospId, docid, specid, wardid,
          this.selectedView.PatientType, FollowUpOn, LengthOfStay,
          this.selectedView.BillType == 'Insured' ? 'CR' : 'CS', (this.selectedView.CompanyID === '' || this.selectedView.CompanyID === undefined) ? 0 : this.selectedView.CompanyID, (this.selectedView.GradeID === '' || this.selectedView.GradeID === undefined) ? 0 : this.selectedView.GradeID,
          (this.selectedView.TariffId === '' || this.selectedView.TariffId === undefined) ? 0 : this.selectedView.TariffId, this.selectedView.MonitorID === '' ? 0 : this.selectedView.MonitorID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
        ).subscribe(response => {
          if (response.Code == 200) {
            $("#endofEpisodeSaveMsg").modal('show');
            if ($("#DispositionsID").val() == '1' && !this.followupFormNA) {
              this.saveFollowUpFromEndofEpisode();
            }
          }
        })
      }
      else {
        if (($("#DispositionsID").val() == '4' || $("#DispositionsID").val() == '1') && $("#endofEpisodeRemarks").val() == '' && $("#endofEpisodeRemarks").val() == null) {
          this.showendofEpisodeRemarks = true;
        }
        else if ($("#endofEpisodeRemarks").val() != '') {
          var endofepisoderemarks = $("#endofEpisodeRemarks").val();
          this.config.UpdateEMRPatientEpisodeclose(this.PatientID, this.selectedPatientAdmissionId, true, this.doctorID, this.selectedView.SpecialiseID,
            this.selectedView.BillID, endofepisoderemarks, $("#DispositionsID").val(), "0", this.TriageLOS, this.hospId, docid, specid, wardid,
            this.selectedView.PatientType, FollowUpOn, LengthOfStay,
            this.selectedView.BillType == 'Insured' ? 'CR' : 'CS', (this.selectedView.CompanyID === '' || this.selectedView.CompanyID === undefined) ? 0 : this.selectedView.CompanyID, (this.selectedView.GradeID === '' || this.selectedView.GradeID === undefined) ? 0 : this.selectedView.GradeID,
            (this.selectedView.TariffId === '' || this.selectedView.TariffId === undefined) ? 0 : this.selectedView.TariffId, this.selectedView.MonitorID === '' ? 0 : this.selectedView.MonitorID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
          )
            .subscribe(response => {
              if (response.Code == 200) {
                $("#endofEpisodeSaveMsg").modal('show');
              }
            })
        }
      }

    } else {
      if ($("#endofEpisodeRemarks").val() != '') {
        var endofepisoderemarks = $("#endofEpisodeRemarks").val();
        this.config.UpdatePatientEpisodeclose(this.selectedPatientAdmissionId, true, this.doctorID, endofepisoderemarks).subscribe(response => {
          if (response.Code == 200) {
            $("#endofEpisodeSaveMsg").modal('show');
          }
        })
      }
    }

  }
  saveEndofEpisodeclose() {
    $("#endofEpisodeJustification").modal('hide');
    this.showPatientNotSelectedValidation = false;
    this.isemrPatientAdmission = false;
    $("#endofEpisodeRemarks").val('');
    if (this.showFollowupForm) {
      this.followupForm.patchValue({
        FollowupAfter: '',
        FollowupDate: '',
        Remarks: '',
        NoofFollowUp: '0',
        NoofDays: '',
        adviceToPatient: ''
      });
    }
    else if (this.isemrPatientAdmission) {
      this.emrAdmissionForm.patchValue({
        WardID: '0',
        Specialization: '0',
        SpecializationName: '',
        SpecialisationDoctorID: '0',
        SpecialisationDoctorName: '',
        TodayAfter: 'T',
        AfterDays: '0',
        Admission: new Date(),
        Expectedlengthofstay: '0',
        DischargeDate: '',
      });
    }
    this.followupFormNA = false;
  }

  closeEndofEpisodePopUp() {
    $("#endofEpisodeJustification").modal('hide');
    window.location.reload();
  }

  saveFavouriteDiagnosis(diag: any) {
    this.favDiag.push({
      "ISQ": 0, "DID": diag.controls.ItemID.value, "DIC": diag.controls.ItemCode.value, "DNAME": diag.controls.ItemName.value
    })
    let payload = {
      "EmpID": this.doctorDetails[0].EmpId,
      "SpecilizationID": this.doctorDetails[0].EmpSpecialisationId,
      "ActionType": "1",
      "PDetails": [],
      "IDetails": [],
      "DDetails": [],
      "DADetails": this.favDiag
    }
    this.config.saveFavouriteProcedure(payload).subscribe(
      (response) => {
        if (response.Code == 200) {

        }
      },
      (err) => {
        console.log(err)
      });
    this.favDiag = [];
  }
  openRemarks(index: any) {
    this.selectedParameter = this.tableVitals[index]
    this.remarksSelectedIndex = index;
    const itemsArray = this.remarkForm.get('items') as FormArray | null;
    if (itemsArray) {
      const selectedCMDValue = itemsArray.at(index)?.get('CMD')?.value || '';
      this.remarkForm.get('CMD')?.setValue(selectedCMDValue);
      this.isSubmitted = false;
    }
    const remarks = this.recordRemarks.get(index) || '';
    this.remarkForm.get('CMD')?.setValue(remarks);
    $("#vitalsComments").modal('show');

  }

  saveRemarks() {
    this.isSubmitted = true;
    if (this.remarkForm && this.remarkForm.valid) {
      const remark = this.remarkForm.get('CMD')?.value || '';
      this.remarksMap.set(this.remarksSelectedIndex, remark);
      this.recordRemarks.set(this.remarksSelectedIndex, remark);
      this.remarkForm.reset();
      this.isSubmitted = false;
      $('#vitalsComments').modal('hide');
    }
  }

  pendingFromDiagnosis(isPending: any) {
    this.pendingChanges = isPending;
    this.isDirty = isPending;
  }

  fetchCaseSheetConfigurations(currentComponentName: any) {
    if (currentComponentName === 'Diagnosis Update') {
      this.showDiagnosisContent = false;
      setTimeout(() => {
        this.showDiagnosisContent = true;
      }, 0);
      return;
    }
    //$('#pills-assessment-tab').tab('show');
    let nextComponentName = currentComponentName;
    this.config.fetchCaseSheetConfigurations(this.doctorDetails[0].EmpId, this.hospId).subscribe(response => {
      if (currentComponentName) {
        const filteredData = response.FetchCaseSheetConfigList.filter((obj: any) => obj.componentname === currentComponentName);
        const sequences = filteredData.map((obj: any) => Number(obj.DoctorNavigationSequence));
        const maxSequence = Math.max(...sequences);
        const nextSequence = maxSequence;

        if (response.FetchCaseSheetConfigList[nextSequence]) {
          nextComponentName = response.FetchCaseSheetConfigList[nextSequence].componentname;
        }
      }

      if (!sessionStorage.getItem("navigation")) {
        if (nextComponentName == "" && currentComponentName != 'doccasesheet') {
          const e1 = this.clinical.nativeElement.querySelector('.nav-link');
          e1.click();
        }
        else if (nextComponentName == "Diagnosis") {
          const element = this.diagnosis.nativeElement.querySelector('.nav-link');
          element.click();
        }
        else if (nextComponentName == "Prescription") {
          const element = this.prescription.nativeElement.querySelector('.nav-link');
          element.click();
        }
        else if (nextComponentName == "Advice") {
          const element = this.advice.nativeElement.querySelector('.nav-link');
          element.click();
        }
        else if (nextComponentName == "Assessments") {
          const element = this.assessment.nativeElement.querySelector('.nav-link');
          element.click();
        }
        else if (nextComponentName == "Typeofprecautions") {
          const element = this.typeofprecautions.nativeElement.querySelector('.nav-link');
          element.click();
        }
        else if (nextComponentName == "sickleave") {
          const element = this.sickleave.nativeElement.querySelector('.nav-link');
          element.click();
        }
        else if (nextComponentName == "instructionstonurse") {
          const element = this.instructionstonurse.nativeElement.querySelector('.nav-link');
          element.click();
        }
      } else {
        const navcomp = sessionStorage.getItem("navigation");
        if (navcomp === 'MedicalAssessment') {
          const element = this.advice.nativeElement.querySelector('.nav-link');
          element.click();
          // setTimeout(() => {
          //   document.getElementById('medical-assesment-btn')?.click();
          // }, 1000);
          // sessionStorage.removeItem("navigation");
        }
        else if (navcomp === 'AdmissionReconciliation') {
          const element = this.doctorrequest.nativeElement.querySelector('.nav-link');
          element.click();
          // setTimeout(() => {
          //   document.getElementById('adm-recon-btn')?.click();
          // }, 1000);
        }
        else if (navcomp === 'VTEForms' || navcomp === 'VTE Medical' || navcomp === 'VTE Surgical' || navcomp === 'VTE Surgery' || navcomp === 'VTE ObGyne') {
          const element = this.doctorrequest.nativeElement.querySelector('.nav-link');
          element.click();
          // setTimeout(() => {
          //   document.getElementById('vte-forms-btn')?.click();
          // }, 1000);
        }
        //sessionStorage.removeItem("navigation");
      }
    })
  }
  GetPrimaryDoctor() {
    this.config.fetchPrimaryDoctor(this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.primaryDoctors = response.PrimaryDoctorDataList;
        }
      },
        (err) => {

        })
  }
  editAllergy(item: any, row: any, type: any) {
    this.rowIndex = row;
    this.algType = type;
    this.isEdit = true;
    this.severityForFoodAllergy = "";
    if (type === "F") {
      this.allergyForm.patchValue({
        DrugId: item.FOODID,
        DrugName: item.REMARKS,
        Severity: item.ALLERGIETYPES,
        Description: item.DSC,
      });
    }
    if (type === "O") {
      this.allergyForm.patchValue({
        DrugId: item.OtherAlrgyID,
        DrugName: item.ALLERGY,
        Severity: item.ALLERGIETYPES,
        Description: item.DSC,
      });
    }
    if (type === "D") {
      this.allergyForm.patchValue({
        GenericId: item.GENERICID,
        DrugName: item.DrugName,
        Severity: item.ALLERGIETYPES,
        Description: item.DSC,
      });
    }
  }

  updateAllergy() {

    if (this.algType === "D") {
      let find = this.drugList.filter((x: any, index: number) => {
        return index !== this.rowIndex && x?.GENERICID === this.allergyForm.get('GenericId')?.value;
      });
      if (find.length > 0) {
        this.errorMessage = "Duplicate Drug is not allowed";
        $("#errorMsg").modal('show');
        return;
      }
      this.drugList[this.rowIndex].DrugName = this.allergyForm.get('DrugName')?.value;
      this.drugList[this.rowIndex].GENERICID = this.allergyForm.get('GenericId')?.value;
      this.drugList[this.rowIndex].DSC = this.allergyForm.get('Description')?.value;
      this.drugList[this.rowIndex].ALLERGIETYPES = this.allergyForm.get('Severity')?.value;
    }
    else {

      if (this.allergyForm.get('Severity')?.value == "") {
        this.isAllergySubmitted = true;
        return;
      }
      else {
        this.isAllergySubmitted = false;
      }

      if (this.algType === 'O') {
        let find2 = this.otherallergyList.filter((x: any, index: number) => {
          return index !== this.rowIndex && x?.REMARKS === this.allergyForm.get('DrugName')?.value;
        });

        if (find2.length > 0) {
          this.errorMessage = "Duplicate Other is not allowed";
          $("#errorMsg").modal('show');
          return;
        }
        this.otherallergyList[this.rowIndex].REMARKS = this.allergyForm.get('DrugName')?.value;
        this.otherallergyList[this.rowIndex].ALLERGY = this.allergyForm.get('DrugName')?.value;
        this.otherallergyList[this.rowIndex].OtherAlrgyID = this.allergyForm.get('DrugId')?.value;
        this.otherallergyList[this.rowIndex].DSC = this.allergyForm.get('Description')?.value;
        this.otherallergyList[this.rowIndex].ALLERGIETYPES = this.allergyForm.get('Severity')?.value;
      }
      else {
        let find1 = this.foodList.filter((x: any, index: number) => {
          return index !== this.rowIndex && x?.REMARKS === this.allergyForm.get('DrugName')?.value;
        });

        if (find1.length > 0) {
          this.errorMessage = "Duplicate Food is not allowed";
          $("#errorMsg").modal('show');
          return;
        }
        this.foodList[this.rowIndex].REMARKS = this.allergyForm.get('DrugName')?.value;
        this.foodList[this.rowIndex].FOODID = this.allergyForm.get('DrugId')?.value;
        this.foodList[this.rowIndex].DSC = this.allergyForm.get('Description')?.value;
        this.foodList[this.rowIndex].ALLERGIETYPES = this.allergyForm.get('Severity')?.value;
      }
    }
    this.resetAllergy();
    this.isEdit = false;
  }

  trimSpaces(name: string): string {
    return name.trim().replace(/\s/g, '');
  }

  validateWeight() {
    var weight = this.clinicalConditionsForm.get('Weight')?.value ? this.clinicalConditionsForm.get('Weight')?.value : 0;
    if ((this.IsAdult && (weight.length < 2 || Number(weight) > 300))) {
      this.errorMessage = "Enter weight between 10-300 Kg(s)";
      $("#errorMsg").modal('show');
      this.clinicalConditionsForm.get('Weight')?.setValue("");
    }

    if ((!this.IsAdult)) {
      if (weight.split('.').length > 1) {
        if (weight.length > 3) {
          this.errorMessage = "Enter valid Weight";
          $("#errorMsg").modal('show');
          this.clinicalConditionsForm.get('Weight')?.setValue("");
        }
      }
      else if (weight.length > 2) {
        this.errorMessage = "Enter valid Weight";
        $("#errorMsg").modal('show');
        this.clinicalConditionsForm.get('Weight')?.setValue("");
      }
    }
    if (!this.IsBornBaby)
      this.FetchPatientBMIGrowthChart(this.clinicalConditionsForm.get('Height')?.value, this.clinicalConditionsForm.get('Weight')?.value, 1);
  }

  validateHeight() {
    var height = this.clinicalConditionsForm.get('Height')?.value ? this.clinicalConditionsForm.get('Height')?.value : 0;
    var prevHeight = this.selectedView.Height;
    if (prevHeight != "" && prevHeight != undefined) {
      if (Number(height) < Number(prevHeight)) {
        this.errorMessage = "Height cannot be less than previous height entered";
        $("#errorMsg").modal('show');
        this.clinicalConditionsForm.get('Height')?.setValue(this.selectedView.Height);
      }
    }
    if (Number(this.patientDetails.IsYearBaby) === 1) {
      if ((!this.IsAdult && (Number(this.patientDetails.IsYearBaby) <= 1) && (Number(height) < 20 || Number(height) > 100))) {
        this.errorMessage = "Enter Height between 20-100 cm(s)";
        $("#errorMsg").modal('show');
        this.clinicalConditionsForm.get('Height')?.setValue("");
        return;
      }
    } else {

      if ((!this.IsAdult && (Number(height) < 50 || Number(height) > 250))) {
        this.errorMessage = "Enter Height between 50-250 cm(s)";
        $("#errorMsg").modal('show');
        this.clinicalConditionsForm.get('Height')?.setValue("");
        return;
      }

      if ((this.IsAdult && (Number(height) < 50 || Number(height) > 250))) {
        this.errorMessage = "Enter Height between 50-250 cm(s)";
        $("#errorMsg").modal('show');
        this.clinicalConditionsForm.get('Height')?.setValue("");
        return;
      }

      // if ((!this.IsAdult && Number(height) > 50)) {
      //   this.errorMessage = "Enter valid Height";
      //   $("#errorMsg").modal('show');
      //   this.clinicalConditionsForm.get('Height')?.setValue("");
      // }
    }
    if (!this.IsBornBaby)
      this.FetchPatientBMIGrowthChart(this.clinicalConditionsForm.get('Height')?.value, this.clinicalConditionsForm.get('Weight')?.value, 1);


  }

  clearSmoking() {
    this.FetchSmokingInfo(2);
  }

  // SmokingClick(smoke: any) {
  //   this.smokingYesNo = false;
  //   this.smokelength = "1";
  //   this.smokevalue = "0";
  //   this.SmokingCategory = 2;
  //   if (smoke === "Yes") {
  //     this.smokingYesNo = true;
  //     this.smokingIconPack = false;
  //     this.smokingIconStick = true;
  //     this.smokelength = "2";
  //     this.SmokingCategory = 1;
  //   } else {
  //     this.smokingIconPack = true;
  //     this.smokingIconStick = false;
  //   }
  // }

  SmokingClick(smoke: string) {
    this.smokingYesNo = false;
    this.smokevalue = "0";
    this.smokelength = "1";
    this.SmokingCategory = 2;
    this.smokingIconStick = false;
    this.smokingIconPack = false;
    this.smokingIconHookah = false;

    if (smoke === "Yes") {
      this.smokingYesNo = true;
      this.smokingIconStick = true;
      this.smokelength = "2";
      this.SmokingCategory = 1;
    } else if (smoke === "No") {
      this.smokingYesNo = true;
      this.smokingIconPack = true;
      this.smokelength = "3";
      this.SmokingCategory = 2;
    } else if (smoke === "Hookah") {
      this.smokingYesNo = true;
      this.smokingIconHookah = true;
      this.smokelength = "4";
      this.SmokingCategory = 3;
    }
  }

  getChart(type: any) {
    this.charttype = type;
    this.config.fetchGrowthChartResults(this.PatientID, type, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchGrowthChartOutputLists = response.FetchGrowthChartOutputLists;
          this.FetchGrowthChartPatientOutputLists = response.FetchAgeGrowthChartOutputLists;

          if (this.FetchGrowthChartOutputLists.length > 0) {
            const testNames = Array.from(new Set(Object.keys(this.FetchGrowthChartOutputLists[0]))).filter(name => name !== "Agemos" && name !== "Agemos");

            const dynamicArray = testNames.map((testName, index) => {
              return {
                name: testName,
                data: this.FetchGrowthChartOutputLists.map((result: any) => {
                  if (testName == 'P3')
                    this.colorN = '#0000FF';
                  if (testName == 'P5')
                    this.colorN = '#115FA6';
                  if (testName == 'P10')
                    this.colorN = '#94AE0A';
                  if (testName == 'P25')
                    this.colorN = '#A61120';
                  if (testName == 'P50')
                    this.colorN = '#FF8809';
                  if (testName == 'P75')
                    this.colorN = '#FFD13E';
                  if (testName == 'P90')
                    this.colorN = '#A61187';
                  if (testName == 'P95')
                    this.colorN = '#24AD9A';
                  if (testName == 'P97')
                    this.colorN = '#8B4513';
                  return [result.Agemos, result[testName] ? parseFloat(result[testName]) : result[testName]]
                }),
                connectNulls: true,
                color: this.colorN,
                lineWidth: 0.5
              };
            });



            setTimeout(() => {
              const chart = Highcharts.chart('chart-line-growth', {
                chart: {
                  type: this.selectedButtonType,
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
                  title: {
                    text: null,
                  },
                  tickPixelInterval: 20,
                  gridLineWidth: 1

                },
                xAxis: {
                  type: 'category',
                  min: 0
                },
                tooltip: {
                  headerFormat: `<div>Age: {point.key}</div>`,
                  pointFormat: `<div>{series.name}: {point.y}</div>`,
                  shared: true,
                  useHTML: true,
                  enabled: false,
                  valueDecimals: 2
                },

                plotOptions: {
                  column: {
                    pointPadding: 0.2,
                    borderWidth: 0.5
                  },
                  line: {
                    marker: {
                      enabled: false
                    },
                    series: {
                      lineWidth: 1,
                      states: {
                        hover: {
                          enabled: true,
                          lineWidth: 1
                        }
                      }
                    },
                    states: {
                      hover: {
                        enabled: false
                      },
                      inactive: {
                        opacity: 1
                      }
                    }
                  }
                },
                series: dynamicArray,
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

              if (type != "C") {
                const circleMarksData: any = [];
                this.FetchGrowthChartPatientOutputLists.forEach((item: any) => {
                  const ageInMonths = parseInt(item.Agemos);
                  var weightInKg = 0;
                  weightInKg = parseFloat(item.PatientValue);
                  circleMarksData.push([ageInMonths, weightInKg]);
                });

                const lineSeriesData = circleMarksData.map((point: any) => [point[0], point[1]]);
                chart.addSeries({
                  type: 'spline',
                  name: 'Patient',
                  data: lineSeriesData,
                  color: '#229954',
                  lineWidth: 2,
                  tooltip: {
                    headerFormat: '<small>{point.key}</small><table>',
                    pointFormat: '<tr><td style="color: {series.color}">{series.name}:{point.y} </td>',
                    footerFormat: '</table>',
                    valueDecimals: 1,
                  },
                  marker: {
                    symbol: 'diamond',
                    radius: 4,
                    fillColor: '#196F3D',
                    enabled: true
                  },
                  dataLabels: {
                    enabled: true,
                    color: 'black',
                    align: 'left'
                  }
                });
              }
            }, 1000);
          }

        }
      },
        (err) => {

        })
  }

  canDeactivate(destinationRoute: any): boolean {
    if (this.isDirty) {
      const confirmationResult = this.openConfirmationDialog(destinationRoute);
      confirmationResult.subscribe((result) => {
        if (result) {
          this.isDirty = false;
          this.router.navigate([destinationRoute]);
        }
      });

      return false;
    }

    return true;
  }

  detectChanges() {
    const currentFormValue = this.clinicalConditionsForm.value;
    const changesDetected = !this.isEqual(currentFormValue, this.initialFormValue);

    if (changesDetected) {
      this.isDirty = true;
      this.pendingChanges = true;
    }
  }

  isEqual(objA: any, objB: any): boolean {
    return JSON.stringify(objA) === JSON.stringify(objB);
  }

  openConfirmationDialog(destinationRoute: any): Subject<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirmation',
        message: 'You have unsaved changes. Do you really want to leave this page?',
      },
    });

    const resultSubject = new Subject<boolean>();

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        resultSubject.next(true);
      } else {
        resultSubject.next(false);
      }
      resultSubject.complete();
    });

    return resultSubject;
  }

  saveSmoking() {
    let payload = {
      "SmokingInfoId": this.SmokingInfoId,
      "Patientid": this.PatientID,
      "AdmissionId": this.AdmissionID,
      "SmokingCategory": this.SmokingCategory,
      "NoOfCigarette": this.smokevalue,
      "HosptalId": this.hospId,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.facility.FacilityID
    }
    this.config.SavePatientSmokingInfo(payload).subscribe((data) => {
      $("#saveSmokeMsg").modal("show");
      $("#saveSmokeInfo").modal('hide');
      this.smokingInfoSaved = true;
    })
  }
  showGrowthChartInfo() {
    $("#exampleModal").modal('show');
  }
  navigateToResults() {
    sessionStorage.setItem("FromCaseSheet", "false");
    //this.router.navigate(['/home/otherresults']);
    this.showResultsinPopUp = true;
    $("#viewResults").modal("show");
  }
  closeViewResultsPopup() {
    $("#viewResults").modal("hide");
    setTimeout(() => {
      this.showResultsinPopUp = false;
    }, 1000);
  }
  openPatientFolder() {
    this.showPatientSummaryinPopUp = true;
    sessionStorage.setItem("PatientID", this.selectedView.PatientID);
    sessionStorage.setItem("SummaryfromCasesheet", 'true');
    $("#pateintFolderPopup").modal("show");
  }
  closePatientSummaryPopup() {
    $("#pateintFolderPopup").modal("hide");
    setTimeout(() => {
      this.showPatientSummaryinPopUp = false;
    }, 1000);
  }


  FetchSmokingInfo(type: any) {
    this.config.FetchSmokingInfo(this.PatientID, this.AdmissionID, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchSmokingInfoOutputLists = response.FetchSmokingInfoOutputLists;

          if (type === 1) {
            if (this.FetchSmokingInfoOutputLists.length > 0) {
              this.smokingValue = "Yes";
              this.smokingInfoSaved = true;
              this.isSmoker = "1";
            }
          }

          if (this.FetchSmokingInfoOutputLists[0]?.SmokingCategory === "1") {
            this.SmokingClick("Yes");
          }
          else if (this.FetchSmokingInfoOutputLists[0]?.SmokingCategory === "2") {
            this.SmokingClick("No");
          }
          else if (this.FetchSmokingInfoOutputLists[0]?.SmokingCategory === "3") {
            this.SmokingClick("Hookah");
          }
          this.smokevalue = this.FetchSmokingInfoOutputLists[0]?.NoOfCigarette;
          this.SmokingInfoId = this.FetchSmokingInfoOutputLists[0]?.SmokingInfoId;
        }
      },
        (err) => {

        })
  }

  getNumbers(): number[] {
    if (this.SmokingCategory === 1) {
      return Array.from({ length: 20 }, (_, i) => i + 1);
    } else if (this.SmokingCategory === 2 || this.SmokingCategory === 3) {
      return Array.from({ length: 10 }, (_, i) => i + 1);
    }
    return [];
  }

  closeSmokeInfoPopup() {
    if (!this.smokingInfoSaved) {
      this.smokingValue = "No";
    }
  }
  calcCtasScore(score: string, ctasDesc: string) {
    this.ctasScore = score;
    this.ctasScoreDesc = ctasDesc;
    this.selectedCard.CTASSCore = score;
    if (score == "1") {
      this.ctasScore1Class = "cursor-pointer circle d-flex align-items-center justify-content-center active Resuscitation";
      this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "2") {
      this.ctasScore2Class = "cursor-pointer circle d-flex align-items-center justify-content-center active Emergent";
      this.ctasScore1Class = this.ctasScore3Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "3") {
      this.ctasScore3Class = "cursor-pointer circle d-flex align-items-center justify-content-center active Urgent";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "4") {
      this.ctasScore4Class = "cursor-pointer circle d-flex align-items-center justify-content-center active LessUrgent";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "5") {
      this.ctasScore5Class = "cursor-pointer circle d-flex align-items-center justify-content-center active NonUrgent";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
  }

  onchangeEndofEpisodeDisposition(event: any) {
    const val = event.target.value;
    if (val == '7') {
      this.showEndofEpisodeDateTime = true;
      this.isemrPatientAdmission = false;
      this.showFollowupForm = false;
    }
    else if (val == '4') {
      this.showEndofEpisodeDateTime = false;
      this.showFollowupForm = false;
      this.followupFormNA = true;
      this.isemrPatientAdmission = true;
      //this.fetchEligibleBedTypes('0', '0');
      //this.fetchReferalAdminMasters1();
      this.fetchTransferWards();
      this.fetchReferalAdminMasters2();
    }
    else if (val === '1') {
      this.showFollowupForm = true;
      this.showEndofEpisodeDateTime = false;
      this.isemrPatientAdmission = false;
    }
    else {
      this.showEndofEpisodeDateTime = false;
      this.isemrPatientAdmission = false;
      this.showFollowupForm = false;
    }
  }

  fetchEligibleBedTypes(companyid: string, gradeid: string) {
    this.config.FetchEligibleBedTypes(companyid, gradeid, this.doctorDetails[0].UserId, '3403', this.hospId)
      .subscribe((response: any) => {
        this.eligibleBedTypeList = response.FetchEligibleBedTypesDataList;

      },
        (err) => {
        })
  }
  fetchReferalAdminMasters1() {
    this.config.fetchAdminMasters(11).subscribe((response) => {
      this.SpecializationList = response.SmartDataList;
    });
  }
  fetchReferalAdminMasters2() {
    this.config.fetchConsulSpecialisationNew(
      'distinct SpecialiseID id,Specialisation name,Specialisation2l name2L,SpecializationCode code,blocked,Blocked BitBlocked,HospitalID HospitalID,IsPediatric',
      'IsConsPri=1 and Blocked=0 and HospitalID=' + this.hospId,
      0, this.hospId).subscribe((response) => {
        this.SpecializationList = response.FetchConsulSpecialisationDataList;
        if (this.selectedCard.PatientType === '1') {
          this.emrAdmissionForm.patchValue({
            Specialization: this.doctorDetails[0].EmpSpecialisationId,
            SpecialisationDoctorID: this.doctorDetails[0].EmpId,
          });
          this.fetchSpecializationDoctorSearchALL();
        }
      });
  }

  fetchTransferWards() {
    this.config.FetchTransferWards(this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.eligibleBedTypeList = response.FetchWardsBedtypesBedsDataList;
        }
      },
        (err) => {

        })
  }


  specializationChange(data: any) {
    const selectedItem = this.SpecializationList.find((value: any) => value.id === Number(data.target.value));
    this.emrAdmissionForm.patchValue({
      Specialization: selectedItem.id,
      SpecializationName: selectedItem.name
    });
    this.fetchSpecializationDoctorSearchALL();
  }
  fetchSpecializationDoctorSearch() {
    this.config.fetchSpecialisationDoctors('%%%', this.emrAdmissionForm.get("Specialization")?.value, this.doctorDetails[0].EmpId, this.hospId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.listOfSpecItems = response.FetchDoctorDataList;

      }
    }, error => {
      console.error('Get Data API error:', error);
    });

  }

  fetchSpecializationDoctorSearchALL() {
    this.config.fetchSpecialisationDoctorsAll('%%%', this.emrAdmissionForm.get("Specialization")?.value, this.doctorDetails[0].EmpId, this.selectedCard.PatientType, this.hospId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.listOfSpecItems = response.FetchDoctorDataList;
      }
    }, error => {
      console.error('Get Data API error:', error);
    });

  }

  selectSpecItem(item: any) {
    const selectedItem = this.listOfSpecItems.find((value: any) => Number(value.EmpNo) === Number(item.target.value.split('-')[0].trim()));
    this.emrAdmissionForm.patchValue({
      SpecialisationDoctorName: item.target.value,
      SpecialisationDoctorID: selectedItem.Empid
    });
  }

  FetchModeOfarrival() {

    this.config.FetchCasesheetModeOfarrival(this.doctorDetails[0].UserId, '3403', this.hospId)
      .subscribe((response: any) => {
        if (this.patientDetails.PatientType == '2' || this.patientDetails.PatientType == '3' || this.patientDetails.PatientType == '4')
          this.modeofArrival = response.FetchModeOfarrivalDataaList;
        else
          this.modeofArrival = response.FetchModeOfarrivalDataaList.filter((x: any) => x?.PatientType === "0");
      },
        (err) => {
        })
  }
  FetchPatientChiefComplaintAndExaminations() {

    this.config.FetchPatientChiefComplaintAndExaminations(this.selectedPatientAdmissionId, this.doctorDetails[0].UserId, '3403', this.hospId)
      .subscribe((response: any) => {
        if (response.FetchPatientChiefComplaintAndExaminationsDataaList.length > 0 && (this.selectedView.PatientType != '2' && this.selectedView.PatientType != '4')) {
          if (this.fromAnesthesiaWorklist) {
            this.SavedChiefComplaints = response.FetchPatientChiefComplaintAndExaminationsDataaList;
            this.emrNurseChiefComplaint = this.SavedChiefComplaints[0]?.ChiefComplaint;
            this.emrNursePhysicalExamination = this.SavedChiefComplaints[0]?.PhysicalExamination;
            this.ChiefExaminationID = this.SavedChiefComplaints[0]?.ChiefExaminationID;

            this.emrNurseHistoryofPresentIllness = this.SavedChiefComplaints[0]?.HistoryofPresentIllness;
            this.emrNurseAssessmentPlan = this.SavedChiefComplaints[0]?.AssessmentPlan;
          }
          else {
            this.SavedChiefComplaints = response.FetchPatientChiefComplaintAndExaminationsDataaList.filter((x: any) => x?.DoctorId === this.doctorDetails[0].EmpId.toString());
          }
          if (this.doctorDetails[0]?.EmpId.toString() == this.SavedChiefComplaints[0]?.DoctorId) {
            this.emrNurseChiefComplaint = this.SavedChiefComplaints[0]?.ChiefComplaint;
            this.emrNursePhysicalExamination = this.SavedChiefComplaints[0]?.PhysicalExamination;
            this.ChiefExaminationID = this.SavedChiefComplaints[0]?.ChiefExaminationID;

            this.emrNurseHistoryofPresentIllness = this.SavedChiefComplaints[0]?.HistoryofPresentIllness;
            this.emrNurseAssessmentPlan = this.SavedChiefComplaints[0]?.AssessmentPlan;

          }
        }
        else {
          if (this.selectedView.PatientType != '3') {
            if (response.FetchPatientChiefComplaintAndExaminationsDataaList.length > 0) {
              this.emrNurseChiefComplaint = response.FetchPatientChiefComplaintAndExaminationsDataaList[0]?.ChiefComplaint;
              this.emrNursePhysicalExamination = response.FetchPatientChiefComplaintAndExaminationsDataaList[0]?.PhysicalExamination;

              this.emrNurseHistoryofPresentIllness = response.FetchPatientChiefComplaintAndExaminationsDataaList[0]?.HistoryofPresentIllness;
              this.emrNurseAssessmentPlan = response.FetchPatientChiefComplaintAndExaminationsDataaList[0]?.AssessmentPlan;
            }
            else if (response.FetchPatientPrevChiefComplaintAndExaminationsDataList.length > 0) {
              this.emrNurseChiefComplaint = response.FetchPatientPrevChiefComplaintAndExaminationsDataList[0]?.ChiefComplaint;
              this.emrNursePhysicalExamination = response.FetchPatientPrevChiefComplaintAndExaminationsDataList[0]?.PhysicalExamination;

              this.emrNurseHistoryofPresentIllness = response.FetchPatientPrevChiefComplaintAndExaminationsDataList[0]?.HistoryofPresentIllness;
              this.emrNurseAssessmentPlan = response.FetchPatientPrevChiefComplaintAndExaminationsDataList[0]?.AssessmentPlan;

              this.clinicalConditionsForm.patchValue({
                DurationOfIllness: response.FetchPatientPrevChiefComplaintAndExaminationsDataList[0].DurationOfIllness,
                DurationOfIllnessUOMID: response.FetchPatientPrevChiefComplaintAndExaminationsDataList[0].DurationOfIllnessUOMID,
                ClinicalCondtionid: response.FetchPatientPrevChiefComplaintAndExaminationsDataList[0].ClinicalCondtionID
              });
              this.selectedPainScoreId = response.FetchPatientPrevChiefComplaintAndExaminationsDataList[0].PainScoreID;
            }
          }
        }
        if (response.FetchPatientChiefComplaintAndExaminationsDataaList.length >= 1) {
          this.multipleChiefComplaints = response.FetchPatientChiefComplaintAndExaminationsDataaList;
        }
        if (!this.emrNursePhysicalExamination) {
          this.emrNursePhysicalExamination = this.physicalExaminationStatus;
        }
        this.divPhysicalExamination.nativeElement.innerHTML = this.emrNursePhysicalExamination;
        sessionStorage.setItem("prevChiefCompl", this.emrNurseChiefComplaint);
        sessionStorage.setItem("prevPhyExam", this.emrNursePhysicalExamination);
        sessionStorage.setItem("prevHistoryPresent", this.emrNurseHistoryofPresentIllness);
        sessionStorage.setItem("prevAssessmentPlan", this.emrNurseAssessmentPlan);

      },
        (err) => {
        })
  }
  startTimers(date: any): any {
    if (date.VTCreateDate) {
      const startDate = new Date(date.VTCreateDate);
      const now = new Date();
      const differenceMs: number = now.getTime() - startDate.getTime();
      const seconds: number = Math.floor((differenceMs / 1000) % 60);
      const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
      const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
      const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
      const totalHours = hours + (days * 24);
      const formattedHours = totalHours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");
      //this.TriageLOS=`${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
      this.TriageLOS = formattedHours + ":" + formattedMinutes + ":" + formattedSeconds
      // return `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
    }
  }

  checkIsActive(): boolean {
    if ($("#pills-pulmonology").hasClass("active")) {
      return true;
    }
    return false;
  }

  restrictPrescriptionSave() {
    if (this.selectedView.PatientType === '1') {
      const startDate = new Date(this.selectedView.Orderdate);
      const now = new Date();
      const differenceMs: number = now.getTime() - startDate.getTime();
      const seconds: number = Math.floor((differenceMs / 1000) % 60);
      const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
      const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
      const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
      const totalHours = hours + (days * 24);
      if (this.fromAnesthesiaWorklist) {
        if (totalHours > 72) {
          this.endofEpisode = true;
          sessionStorage.setItem("ISEpisodeclose", "true");
        }
      }
      else if (totalHours > Number(this.PrescriptionRestriction)) {
        this.endofEpisode = true;
        sessionStorage.setItem("ISEpisodeclose", "true");
      }
    }
  }

  FetchPatientVitalsWithDiseases() {
    this.config.FetchPatientVitalsWithDiseases(this.selectedCard.PatientID, '0', '3403', this.hospId)
      .subscribe((response: any) => {
        if (response.Code === 200) {
          if (response.PatientVitalsDataFList.length > 0) {
            if (this.selectedCard.PatientType == '2' || this.selectedCard.PatientType == '4') {
              if (response.PatientVitalsDataFList.filter((x: any) => x.VisitDoctorId === this.selectedCard.AdmissionReqDoctorId && x.VisitSpecialiseID === this.selectedCard.AdmissionReqSpecialiseID).length > 0) {
                if (response.PatientDiagnosisDataFList.length > 0) {
                  sessionStorage.setItem("ReferralDiagnosis", JSON.stringify(response.PatientDiagnosisDataFList));
                }
                this.saveVitalsForRefferalPatient(response.PatientVitalsDataFFList);

              }
              else {
                this.saveClinicalConditions();
              }
            } else {
              if (response.PatientVitalsDataFList.filter((x: any) => x.VisitDoctorId === this.selectedCard.PrevVisitDoctorId && x.VisitSpecialiseID === this.selectedCard.PrevVisitSpecialiseID).length > 0) {
                if (response.PatientDiagnosisDataFList.length > 0) {
                  sessionStorage.setItem("ReferralDiagnosis", JSON.stringify(response.PatientDiagnosisDataFList));
                }
                this.saveVitalsForRefferalPatient(response.PatientVitalsDataFFList);

              }
            }
          }
          else {
            this.saveClinicalConditions();
          }
        }
      },
        (err) => {
        })
  }

  saveVitalsForRefferalPatient(vitals: any) {
    let remarksEntered = true;
    let VsDetails: any = [];
    let outOfRangeParameters: string[] = [];
    vitals.forEach((element: any, index: any) => {
      let RST: any;
      let ISPANIC: any;
      if ((element.PARAMVALUE >= element.ALLOWUOMMINRANGE && element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE && element.PARAMVALUE <= element.ALLOWUOMMAXRANGE))
        RST = 2;
      else
        RST = 1;

      if ((!element.PARAMVALUE) && ((element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE)))
        ISPANIC = 1;
      else
        ISPANIC = 0;
      //const remark = this.recordRemarks.get(index);

      VsDetails.push({
        "VSPID": element.VITALSIGNPARAMETERID,
        "VSNAME": element.PARAMETERNAME,
        "VSGID": element.VITALSIGNGROUPID,
        "VSGDID": element.VITALSIGNGROUPDETAILSID,
        "PV": element.Value,
        "CMD": "",
        "RST": RST,
        "ISPANIC": ISPANIC
      });
    });
    let payload = {
      "MonitorId": "0",
      "PatientID": this.PatientID,
      "Admissionid": this.selectedPatientAdmissionId,
      "DoctorID": this.doctorDetails[0].EmpId,
      "HospitalId": this.hospId,
      "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
      "PatientType": this.selectedView.PatientType,
      "ScheduleID": (this.selectedView.ScheduleID == "" || this.selectedView.ScheduleID == undefined) ? "0" : this.selectedView.ScheduleID,
      "VSDetails": VsDetails,
      "UserId": this.doctorDetails[0].UserId
    };

    this.config.SaveClinicalVitals(payload).subscribe(response => {
      if (response.Code == 200) {
        this.vitalsValidation = false;
        this.GetVitalsData();
        this.saveClinicalConditions();
      }

    });
  }

  openPrenatalForm(val: string) {
    this.obgyneFormType = val;
    this.selectedView.BMI = this.smartDataList[0].BMI;
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
  }

  BackToClinicalInfo() {
    this.obgyneFormType = "";
    this.fetchPregenencyHistory();
  }

  fetchPreviousChiefComplaints() {
    this.config.FetchPatientVisitsAndChiefComplaint(this.selectedCard.PatientID, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId)
      .subscribe((response: any) => {
        if (response.Code === 200) {
          this.FetchPatientVisitDataList = response.FetchPatientVisitDataList;
          this.FetchPatientVisitDataList.forEach((element: any, index: any) => {
            element.selected = false;
          });
          this.FetchPatientChiefComplaintDataaList = response.FetchPatientChiefComplaintDataaList;
          $("#previouschiefcomplaints").modal('show');
        }
      },
        (err) => {
        })
  }

  showSelectedPrevChiefCompl(ccom: any) {
    this.FetchPatientVisitDataList.forEach((element: any, index: any) => {
      if (ccom.VisitID === element.VisitID) {
        element.selected = true;
      }
      else
        element.selected = false;
    });
    this.selectedPrevCcVisitdate = '  :' + ccom.VisitDate + '-' + (ccom.PatientType === '1' ? 'OP' : ccom.PatientType === '2' ? 'IP' : ccom.PatientType === '3' ? 'EMR' : ccom.PatientType === '4' ? 'DYC' : '') + '-' + ccom.DoctorName
    const prechiefcomp = this.FetchPatientChiefComplaintDataaList.find((x: any) => x.AdmissionID === ccom.AdmissionID);
    if (prechiefcomp !== undefined) {
      this.prevChiefCompl = prechiefcomp.ChiefComplaint;
      this.prevPhyExam = prechiefcomp.PhysicalExamination;
      this.prevHistoryPresent = prechiefcomp.HistoryofPresentIllness;
      this.prevAssessmentPlan = prechiefcomp.AssessmentPlan;

    }
    else {
      this.prevChiefCompl = "";
      this.prevPhyExam = "";
      this.prevHistoryPresent = "";
      this.prevAssessmentPlan = "";

    }
    this.divPrevPhysicalExamination.nativeElement.innerHTML = this.prevPhyExam;
  }

  copyChiefComplaints() {
    this.emrNurseChiefComplaint = this.prevChiefCompl;
    this.emrNursePhysicalExamination = this.prevPhyExam;
    this.divPhysicalExamination.nativeElement.innerHTML = this.prevPhyExam;
    this.emrNurseHistoryofPresentIllness = this.prevHistoryPresent;
    this.emrNurseAssessmentPlan = this.prevAssessmentPlan;
    $("#previouschiefcomplaints").modal('hide');
  }

  fetchFraminghamRiskScoreForMenandWomen() {
    this.config.FetchFraminghamRiskScoreForMenandWomen(this.selectedCard.PatientID, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId)
      .subscribe((response: any) => {
        if (response.Code === 200 && response.FetchFraminghamRiskScoreForMenandWomenDataList.length > 0) {
          this.RiskScore = response.FetchFraminghamRiskScoreForMenandWomenDataList[0].RiskPer;
          this.RiskScoreTooltip = response.FetchFraminghamRiskScoreForMenandWomenDataList[0].RiskAnalysis;
        }
      },
        (err) => {
        })
  }

  toggleSelection(type: string, val: string) {
    if (type === 'unittype') {
      this.unitType = val;
    }
    else if (type === 'patientrace') {
      this.patientRace = val;
    }
    else if (type === 'diabetic') {
      this.isDiabetic = val;
    }
    else if (type === 'smoker') {
      this.isSmoker = val;
    }
    else if (type === 'hypertension') {
      this.isHypertension = val;
    }
  }

  showHideAsmntsFormsTabs() {
    this.showHideFormTabs = !this.showHideFormTabs;
  }

  setPatintArrivalModevalue(mode: any) {
    this.clinicalConditionsForm.patchValue({
      PatientArrivalStatusID: mode.ModeOfTravelID
    });
  }
  getPatientArrivalModeName(modeId: string) {
    if (modeId === null || modeId === '0') {
      return 'Select';
    }
    const modeofArrival = this.modeofArrival?.find((x: any) => x.ModeOfTravelID == modeId);
    return modeofArrival?.ModeOfTravel
  }

  setDurationOfIllnessId(durill: any) {
    this.clinicalConditionsForm.patchValue({
      DurationOfIllnessUOMID: durill
    });
  }
  setClinicalCondvalue(clicond: any) {
    this.clinicalConditionsForm.patchValue({
      ClinicalCondtionid: clicond.id
    });
    this.checkCoverageClinicalCondition();
  }

  checkCoverageClinicalCondition() {
    this.clinicalConditionMessage = '';
    if (this.selectedCard.PatientType == '1' && this.selectedCard.BillType === 'Insured') {
      this.config.CheckCoverageClinicalConditions(this.hospId,
        this.selectedCard.InsuranceCompanyID,
        this.selectedCard.CompanyID,
        this.selectedCard.GradeID,
        this.clinicalConditionsForm.get('ClinicalCondtionid')?.value)
        .subscribe((response: any) => {
          if (response.Code === 200 && response.DiagnosisCoverageDataList.length > 0) {
            if (response.DiagnosisCoverageDataList[0].LimitType === '-1' || response.DiagnosisCoverageDataList[0].LimitType === '3')
              this.clinicalConditionMessage = response.DiagnosisCoverageDataList[0].Type;
          }
        });
    }
  }
  getClinicalConditionName(clicondid: string) {
    if (clicondid === null || clicondid === '0') {
      return 'Select';
    }
    const cliCond = this.clinicalCondition?.find((x: any) => x.id == clicondid);
    return cliCond?.name
  }
  setPainScorevalue(ps: any) {
    this.selectedPainScoreId = ps.id;
    this.painScoreSelected = true;
    this.showPSValidation = false;
  }
  getPainScoreName(psid: string) {
    if (psid === null || psid === '0') {
      return 'Select' + '-' + '';
    }
    const ps = this.painScore?.find((x: any) => x.id == psid);
    return ps?.name.split('-')[0] + '-' + ps?.code
  }

  toggleAllergy(type: string) {
    console.log("Allergy switch" + type)
  }

  setContraceptionvalue(con: string) {
    this.clinicalConditionsForm.patchValue({
      Contraception: con
    });
  }

  showModal() {
    $("#modalCasesheet").modal('show');
  }

  viewMoreChiefComplaints() {
    $("#viewMoreChiefComplaints").modal('show');
  }

  getConciousnessAndBehavior() {
    this.config.getConciousnessAndBehavior(sessionStorage.getItem('hospitalId'), this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID).subscribe((response) => {
      if (response.Code === 200) {
        this.consciousnessData = response.FetchConsciousnessDataList;
        this.behaviourData = response.FetchBehaviorTypesDataList;
      }
    })
  }
  openQuickActions() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientDetails));
    this.patinfo = this.patientDetails;
    $("#quickaction_info").modal('show');
  }
  clearPatientInfo() {
    this.patinfo = "";
  }
  closeModal() {
    $("#quickaction_info").modal('hide');
  }
  FetchPatientBMIGrowthChart(height: any, weight: any, Type: any) {
    if (height !== '' && height != '0' && weight != '' && weight !== '') {
      this.config.FetchPatientBMIGrowthChart(height, weight, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, sessionStorage.getItem('hospitalId')).subscribe((response) => {
        if (response.Code === 200) {
          this.FetchPatientBMIGrowthChartData = response.FetchPatientBMIGrowthChartDataList;
          if (this.FetchPatientBMIGrowthChartData[0]?.WeightStatus === '' && Type == 1) {
            this.clinicalConditionsForm.patchValue({
              Weight: this.selectedView.Weight,
              Height: this.selectedView.Height,
            })
            this.errorMessage = "Height & Weight does not match";
            $("#errorMsg").modal('show');
            return;
          }
          if (this.FetchPatientBMIGrowthChartData.length > 0) {
            if (this.FetchPatientBMIGrowthChartData[0]?.ColorCode === 'LIGHT GREEN') {
              this.heightClass = "afterlabel_form d-flex align-items-end gap-2 border-end indicator_lightGreen_border";
              this.HeightWeightt = this.FetchPatientBMIGrowthChartData[0]?.WeightStatus;
              this.heightClassColor = "form-label alert_label_Height fw-bold isolate_patient_lightGreen_anim fs-7";
            }
            else if (this.FetchPatientBMIGrowthChartData[0]?.ColorCode === 'BLUE') {
              this.heightClass = "afterlabel_form d-flex align-items-end gap-2 border-end indicator_blue_border";
              this.HeightWeightt = this.FetchPatientBMIGrowthChartData[0]?.WeightStatus;
              this.heightClassColor = "form-label alert_label_Height fw-bold isolate_patient_blue_anim fs-7";
            }
            else if (this.FetchPatientBMIGrowthChartData[0]?.ColorCode === 'YELLOW') {
              this.heightClass = "afterlabel_form d-flex align-items-end gap-2 border-end indicator_yellow_border";
              this.HeightWeightt = this.FetchPatientBMIGrowthChartData[0]?.WeightStatus;
              this.heightClassColor = "form-label alert_label_Height fw-bold isolate_patient_yellow_anim fs-7";
            }
            else if (this.FetchPatientBMIGrowthChartData[0]?.ColorCode === 'GREEN') {
              this.heightClass = "afterlabel_form d-flex align-items-end gap-2 border-end indicator_green_border";
              this.HeightWeightt = this.FetchPatientBMIGrowthChartData[0]?.WeightStatus;
              this.heightClassColor = "form-label alert_label_Height fw-bold isolate_patient_green_anim fs-7";
            }
            else if (this.FetchPatientBMIGrowthChartData[0]?.ColorCode === 'ORANGE') {
              this.heightClass = "afterlabel_form d-flex align-items-end gap-2 border-end indicator_Orange_border";
              this.HeightWeightt = this.FetchPatientBMIGrowthChartData[0]?.WeightStatus;
              this.heightClassColor = "form-label alert_label_Height fw-bold isolate_patient_Orange_anim fs-7";
            }
            else {
              this.heightClass = "afterlabel_form d-flex align-items-end gap-2 border-end";
              this.HeightWeightt = "";
              this.heightClassColor = "form-label alert_label_Height fw-bold fs-7";
            }
          }
        }
      })
    }
  }

  showCaseRecord() {
    this.FetchPatientCaseRecord(this.selectedCard.AdmissionID, this.selectedCard.PatientID);
    this.showCareRecordModal();
    this.fetchPatientVisits();
  }

  FetchPatientCaseRecord(admid: any, patintieid: any) {
    this.config.FetchPatientCaseRecord(admid, patintieid, 0, 3000, this.doctorDetails[0]?.UserId, 3403, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          // const request: BiometricValidationRequest = {
          //   personId: this.selectedCard.SSN,
          //   fingerType: 1,
          //   fingerString: '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',
          // };

          // this.biometricService.validateBiometricWithHeaders(request.personId, request.fingerType, request.fingerString).subscribe({
          //   next: (response) => {
          //     if (response.matchFlag) {
          //       this.IsBiometric = true;
          //     } else {
          //       this.IsBiometric = false;
          //     }
          //   },
          //   error: (error) => {
          //     this.IsBiometric = false;
          //     console.error('Biometric validation error:', error);
          //   }
          // });
          this.trustedUrl = response?.FTPPATH;
        }
      },
        (err) => {

        })
  }

  showCareRecordModal() {
    $("#caseRecordModal").modal('show');
  }

  fetchPatientVisits() {
    this.config.fetchPatientVisits(this.selectedCard.PatientID, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientCaseRecVisits = response.PatientVisitsDataList;
        }
      },
        (err) => {

        })
  }
  onVisitsChange(event: any) {
    const admissionID = event.target.value;
    const patientdata = this.patientCaseRecVisits.find((visit: any) => visit.AdmissionID == admissionID);
    this.FetchPatientCaseRecord(patientdata.AdmissionID, patientdata.PatientID);
  }

  openViewVitals() {
    $("#viewVitals").modal('show');
  }

  onWindowClick() {
  }
  showNephoOpthoReferralPopup() {
    $('.mammoNepho_tooltip').css({ display: 'block' });
  }

  closeNphroOrthoRefPopup() {
    $('.mammoNepho_tooltip').css({ display: 'none ' });
  }
  CheckDiagHyperTension() {
    if (this.IsMamoDiabHyper == 1)
      this.checkPatVisitAvaForDiabeticsHyperTension();
    else if (this.IsMamoDiabHyper = 2)
      this.CheckMammographyTestLastOneYear();
  }

  checkPatVisitAvaForDiabeticsHyperTension() {
    this.config.CheckIsPatientVisitAvailableForDiabeticsAndHyperTension(this.selectedView.PatientID, this.AdmissionID, 3403, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.CheckAvailableForDiabeticsAndHyperTensionDataList.length > 0) {

          const IsPatientDiabeticsORHyperTension = response.CheckAvailableForDiabeticsAndHyperTensionDataList[0].IsPatientDiabeticsORHyperTension;
          const IsNephrologyVisit = response.CheckAvailableForDiabeticsAndHyperTensionDataList[0].IsNephrologyVisit;
          const IsOpthalmologyVisit = response.CheckAvailableForDiabeticsAndHyperTensionDataList[0].IsOpthalmologyVisit;

          this.IsNephrologyReferralOrder = response.CheckAvailableForDiabeticsAndHyperTensionDataList[0].IsNephrologyReferralOrder;
          this.IsOpthalmologyReferralOrder = response.CheckAvailableForDiabeticsAndHyperTensionDataList[0].IsOpthalmologyReferralOrder;
          // if(!this.IsNephrologyReferralOrder||!this.IsOpthalmologyReferralOrder)
          //   this.showNephoOpthoReferralPopup();
          // else
          //   this.closeNphroOrthoRefPopup();
          if (IsPatientDiabeticsORHyperTension && (!this.IsNephrologyReferralOrder || !this.IsOpthalmologyReferralOrder) && this.selectedCard.PatientType === '1') {
            this.showNephoOpthoReferralPopup();
            this.showNephroOrthoReferral = true;
          }
          else {
            this.closeNphroOrthoRefPopup();
            this.showNephroOrthoReferral = false;
          }
          this.raiseRefSpecList = [];
          if (!IsNephrologyVisit) {
            this.raiseRefSpecList.push({
              SPECID: response.CheckAvailableForDiabeticsAndHyperTensionDataList[0].NephrologySpecialiseID,
              SPECNAME: "NEPHROLOGY"
            });
          }
          if (!IsOpthalmologyVisit) {
            this.raiseRefSpecList.push({
              SPECID: response.CheckAvailableForDiabeticsAndHyperTensionDataList[0].OpthalmologySpecialiseID,
              SPECNAME: "OPTHALMOLOGY"

            });
          }
        }
      },
        (err) => {

        })
  }

  toggleNephroOpthaButtonSelection(type: string) {
    if (type === 'nephro') {
      this.isNephro = !this.isNephro;
      const nephro = this.raiseRefSpecList.find((x: any) => x.SPECID === '73');
      nephro.selected = !nephro.selected;
    }
    else {
      this.isOptha = !this.isOptha;
      const optha = this.raiseRefSpecList.find((x: any) => x.SPECID === '83');
      optha.selected = !optha.selected;
    }
  }

  raiseReferralForNephroOptha(type: string) {
    if (this.raiseRefSpecList.filter((x: any) => x.selected).length === 0) {
      this.errorMessage = "Please select atleast one specialisation to raise referral."
      $("#errorMsg").modal('show');
      return;
    }
    var diagnosis1: any[] = [];
    // if(this.DoctorDiagnosis?.savedDiagnosis.length === 0) {
    //   this.errorMessage = "Please enter Diagnosis and then refer";
    //   $("#nephroOrthoReferral").modal('hide');
    //   $("#errorMsg").modal('show');
    //   return;
    // }
    this.DoctorDiagnosis?.savedDiagnosis.forEach((element: any) => {
      diagnosis1.push({
        "DID": element.DID,
        "DISEASENAME": element.DiseaseName,
        "CODE": element.Code,
        "DTY": element.DTY,
        "UID": this.doctorDetails[0].EmpId,
        "ISEXISTING": "1",
        "PPID": "0",
        "STATUS": element.DStatus,
        "DTID": element.DTID,
        "DIAGNOSISTYPEID": element.DTID,
        "ISPSD": "0",
        "REMARKS": "",
        "MNID": element.MNID,
        "IAD": "1"
      })
    })
    var referralList: any[] = [];
    this.raiseRefSpecList.filter((x: any) => x.selected).forEach((element: any) => {
      referralList.push({
        "RTID": 1,
        "SPID": element.SPECID,
        "PRTY": 1,
        "DID": "",
        "RMKS": "Referral for Nephro/Optha",
        "BKD": 0,
        "RRMKS": "Referral for Nephro/Optha",
        "RID": 1,
        "DRN": "1",
        "IIRF": 1,
        "COSS": 1,
        "RHOSPID": this.hospId,
        "REFERRALORDERID": 0
      });
    });

    let payload = {
      "intMonitorID": 0,
      "PatientID": this.selectedView.PatientID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "IPID": this.AdmissionID,
      "SpecialiseID": this.selectedView.SpecialiseID,
      "PatientType": this.selectedView.PatientType,
      "BillID": this.selectedView.BillID,
      "FollowUpType": 0,
      "Advicee": "Patient is Diabetic/Hypertensive and no visit in last 6 months. Need to raise referral for Nephro/Optha",
      "FollowAfter": 0,
      "FollowUpOn": moment(new Date()).format('DD-MMM-YYYY'),
      "DiagDetailsList": diagnosis1,
      "ReasonforAdm": "",
      "RefDetailsList": referralList,
      "LengthOfStay": "0",
      "DietTypeID": 0,
      "FollowUpRemarks": "",
      "PrimaryDoctorID": this.doctorDetails[0].EmpId,
      "AdmissionTypeID": 0,
      "FollowUpCount": 0,
      "Followupdays": 0,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospId,
      "BillType": this.selectedView.BillType == 'Insured' ? 'CR' : 'CS',
      "CompanyID": this.selectedView.CompanyID == "" ? 0 : this.selectedView.CompanyID,
      "GradeID": this.selectedView.GradeID,
      "WardID": 0,
      "PrimaryDoctorSpecialiseID": 0
    }

    this.config.saveAdvice(payload).subscribe((response: any) => {
      if (response.Status === "Success" || response.Status === "True") {
        this.IsMamoDiabHyper = 1;
        $("#saveAdviceMsg").modal("show");
      }
    },
      () => {

      })
  }

  CheckMammographyTestLastOneYear() {
    this.config.CheckMammographyTestLastOneYear(this.selectedView.PatientID, this.AdmissionID, 3403, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.CheckMammographyTestLastOneYearDataList.length > 0) {
          if (response.CheckMammographyTestLastOneYearDataList[0].IsPatient50YearMoreAndFemale === 'True') {
            this.IsObgReferralOrder = response.CheckMammographyTestLastOneYearDataList[0].IsObgReferralOrder;
            if (response.CheckMammographyTestLastOneYearDataList[0].IsMammographyTest === 'False') {
              if (!this.IsObgReferralOrder && this.selectedCard.PatientType === '1') {
                this.showMamography = true;
                this.showMamographyPopUp();
              }
              else {
                this.showMamography = false;
                this.closeMammographyPopup();
              }
              this.raiseobgyneSpecList = [];
              this.raiseobgyneSpecList.push({
                SPECID: response.CheckMammographyTestLastOneYearDataList[0].ObgSpecialiseID,
                SPECNAME: "OBSTETRICS GYNE"
              });
            }
          }
        }
      },
        (err) => {

        })
  }

  showMamographyPopUp() {
    // $("#mamographyReferral").modal('show');
    $('.mammoNepho_tooltip').css({ display: 'block' });
  }


  closeMammographyPopup() {
    $('.mammoNepho_tooltip').css({ display: 'none' });
  }

  // closemammoNepho_tooltipPopup() {
  //   $('#mammoNepho_tooltip').css({display:'none'});
  // }

  raiseReferralForMamographyObGyn(type: string) {
    var diagnosis1: any[] = [];
    // if(this.DoctorDiagnosis?.savedDiagnosis.length === 0) {
    //   this.errorMessage = "Please enter Diagnosis and then refer";
    //   $("#nephroOrthoReferral").modal('hide');
    //   $("#errorMsg").modal('show');
    //   return;
    // }
    this.DoctorDiagnosis?.savedDiagnosis.forEach((element: any) => {
      diagnosis1.push({
        "DID": element.DID,
        "DISEASENAME": element.DiseaseName,
        "CODE": element.Code,
        "DTY": element.DTY,
        "UID": this.doctorDetails[0].EmpId,
        "ISEXISTING": "1",
        "PPID": "0",
        "STATUS": element.DStatus,
        "DTID": element.DTID,
        "DIAGNOSISTYPEID": element.DTID,
        "ISPSD": "0",
        "REMARKS": "",
        "MNID": element.MNID,
        "IAD": "1"
      })
    })
    var referralList: any[] = [];
    this.raiseobgyneSpecList.forEach((element: any) => {
      referralList.push({
        "RTID": 1,
        "SPID": element.SPECID,
        "PRTY": 1,
        "DID": "",
        "RMKS": "Referral for Ob-Gyn to perform Mammograph",
        "BKD": 0,
        "RRMKS": "Referral for Ob-Gyn to perform Mammograph",
        "RID": 1,
        "DRN": "1",
        "IIRF": 1,
        "COSS": 1,
        "RHOSPID": this.hospId,
        "REFERRALORDERID": 0
      });
    });

    let payload = {
      "intMonitorID": 0,
      "PatientID": this.selectedView.PatientID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "IPID": this.AdmissionID,
      "SpecialiseID": this.selectedView.SpecialiseID,
      "PatientType": this.selectedView.PatientType,
      "BillID": this.selectedView.BillID,
      "FollowUpType": 0,
      "Advicee": "Referral for Ob-Gyn to perform Mammograph",
      "FollowAfter": 0,
      "FollowUpOn": moment(new Date()).format('DD-MMM-YYYY'),
      "DiagDetailsList": diagnosis1,
      "ReasonforAdm": "",
      "RefDetailsList": referralList,
      "LengthOfStay": "0",
      "DietTypeID": 0,
      "FollowUpRemarks": "",
      "PrimaryDoctorID": this.doctorDetails[0].EmpId,
      "AdmissionTypeID": 0,
      "FollowUpCount": 0,
      "Followupdays": 0,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospId,
      "BillType": this.selectedView.BillType == 'Insured' ? 'CR' : 'CS',
      "CompanyID": this.selectedView.CompanyID == "" ? 0 : this.selectedView.CompanyID,
      "GradeID": this.selectedView.GradeID,
      "WardID": 0,
      "PrimaryDoctorSpecialiseID": 0
    }

    this.config.saveAdvice(payload).subscribe((response: any) => {
      if (response.Status === "Success" || response.Status === "True") {
        this.IsMamoDiabHyper = 2;
        $("#saveAdviceMsg").modal("show");
      }
    },
      () => {

      })
  }

  onPasteInChiefComplaints(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    const textarea = event.target as HTMLTextAreaElement;
    const startPos = textarea.selectionStart ?? 0;
    const endPos = textarea.selectionEnd ?? 0;

    const currentText = textarea.value;
    const textBefore = currentText.substring(0, startPos);
    const textAfter = currentText.substring(endPos);

    const topText = '***** ReUsed *****\n';
    const bottomText = '\n***** ReUsed *****';
    this.Copied = '**ReUsed**';
    //const modifiedText = `${textBefore}${topText}${pastedText}${bottomText}${textAfter}`
    const modifiedText = `${textBefore}${pastedText}${textAfter}`
    this.CopiedPhysicalExamination = '';
    this.CopiedChiefComplaint = pastedText;

    textarea.value = modifiedText;

    textarea.selectionStart = textarea.selectionEnd = startPos + `${topText}${pastedText}${bottomText}`.length;
  }

  onPasteInPhysicalExamination(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    const textarea = event.target as HTMLTextAreaElement;
    const startPos = textarea.selectionStart ?? 0;
    const endPos = textarea.selectionEnd ?? 0;

    const currentText = textarea.value;
    const textBefore = currentText.substring(0, startPos);
    const textAfter = currentText.substring(endPos);

    const topText = '***** ReUsed *****\n';
    const bottomText = '\n***** ReUsed *****';
    this.Copied = '**ReUsed**';
    //const modifiedText = `${textBefore}${topText}${pastedText}${bottomText}${textAfter}`
    const modifiedText = `${textBefore}${pastedText}${textAfter}`
    this.CopiedPhysicalExamination = pastedText;
    //this.CopiedChiefComplaint=pastedText;

    textarea.value = modifiedText;

    textarea.selectionStart = textarea.selectionEnd = startPos + `${topText}${pastedText}${bottomText}`.length;
  }

  onPasteInHistoryPresentIllness(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    const textarea = event.target as HTMLTextAreaElement;
    const startPos = textarea.selectionStart ?? 0;
    const endPos = textarea.selectionEnd ?? 0;

    const currentText = textarea.value;
    const textBefore = currentText.substring(0, startPos);
    const textAfter = currentText.substring(endPos);

    const topText = '***** ReUsed *****\n';
    const bottomText = '\n***** ReUsed *****';
    this.Copied = '**ReUsed**';
    //const modifiedText = `${textBefore}${topText}${pastedText}${bottomText}${textAfter}`
    const modifiedText = `${textBefore}${pastedText}${textAfter}`
    this.CopiedHistoryofPresentIllness = pastedText;
    //this.CopiedChiefComplaint=pastedText;

    textarea.value = modifiedText;

    textarea.selectionStart = textarea.selectionEnd = startPos + `${topText}${pastedText}${bottomText}`.length;
  }

  onPasteInAssessmentPlan(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    const textarea = event.target as HTMLTextAreaElement;
    const startPos = textarea.selectionStart ?? 0;
    const endPos = textarea.selectionEnd ?? 0;

    const currentText = textarea.value;
    const textBefore = currentText.substring(0, startPos);
    const textAfter = currentText.substring(endPos);

    const topText = '***** ReUsed *****\n';
    const bottomText = '\n***** ReUsed *****';
    this.Copied = '**ReUsed**';
    //const modifiedText = `${textBefore}${topText}${pastedText}${bottomText}${textAfter}`
    const modifiedText = `${textBefore}${pastedText}${textAfter}`
    this.CopiedAssessmentPlan = pastedText;
    //this.CopiedChiefComplaint=pastedText;

    textarea.value = modifiedText;

    textarea.selectionStart = textarea.selectionEnd = startPos + `${topText}${pastedText}${bottomText}`.length;
  }
  initializeEyeInformationForm() {
    $('#eyeLensRemaks').html('');
    this.EyeLensInfoID = '0';
    this.eyeLensForm = this.fb.group({
      RightEyeSPH: [''],
      RightEyeCYL: [''],
      RightEyeAXIS: [''],
      RightEyePRISM: [''],
      RightEyeBASE: [''],
      RightEyeADD: [''],
      LeftEyeSPH: [''],
      LeftEyeCYL: [''],
      LeftEyeAXIS: [''],
      LeftEyePRISM: [''],
      LeftEyeBASE: [''],
      LeftEyeADD: [''],
      CL: ['0'],
      GLASS: ['0'],
      READING: ['0'],
      PLASTIC: ['0'],
      DISTANCE: ['0'],
      BC: [''],
      DIAM: [''],
      PD: ['']
    }, { validators: this.atLeastOneRequired });
  }

  atLeastOneRequired(control: AbstractControl): { [key: string]: boolean } | null {
    const controls = control as FormGroup;
    const requiredControls = ['RightEyeSPH', 'RightEyeCYL', 'RightEyeAXIS', 'RightEyePRISM', 'RightEyeBASE', 'RightEyeADD',
      'LeftEyeSPH', 'LeftEyeCYL', 'LeftEyeAXIS', 'LeftEyePRISM', 'LeftEyeBASE', 'LeftEyeADD'
    ];
    const isAtLeastOneFilled = requiredControls.some(ctrl => controls.get(ctrl)?.value);

    return isAtLeastOneFilled ? null : { required: true };
  }

  openEyeInformationPanel() {
    this.config.fetchPatientEyeLensInfo(this.PatientID, this.AdmissionID, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response: any) => {
      if (response.Code === 200) {
        if (response.FetchPatientEyeLensInfoDataList.length > 0) {
          const data = response.FetchPatientEyeLensInfoDataList[0];
          this.EyeLensInfoID = data.EyeLensInfoID;
          $('#eyeLensRemaks').html(data.Remarks);
          this.eyeLensForm.patchValue({
            RightEyeSPH: data.RightEyeSPH,
            RightEyeCYL: data.RightEyeCYL,
            RightEyeAXIS: data.RightEyeAXIS,
            RightEyePRISM: data.RightEyePRISM,
            RightEyeBASE: data.RightEyeBASE,
            RightEyeADD: data.RightEyeADD,
            LeftEyeSPH: data.LeftEyeSPH,
            LeftEyeCYL: data.LeftEyeCYL,
            LeftEyeAXIS: data.LeftEyeAXIS,
            LeftEyePRISM: data.LeftEyePRISM,
            LeftEyeBASE: data.LeftEyeBASE,
            LeftEyeADD: data.LeftEyeADD,
            CL: data.CL ? '1' : '0',
            GLASS: data.GLASS ? '1' : '0',
            READING: data.READING ? '1' : '0',
            PLASTIC: data.PLASTIC ? '1' : '0',
            DISTANCE: data.DISTANCE ? '1' : '0',
            BC: data.BC,
            DIAM: data.DIAM,
            PD: data.PD
          });
        } else {
          this.initializeEyeInformationForm();
        }
        $('#eyeInformation_modal').modal('show');
      }
    });
  }

  onEyeLensCheckboxSelection(key: any) {
    const value = this.eyeLensForm.get(key).value;
    this.eyeLensForm.patchValue({
      [key]: value === '0' ? '1' : '0'
    })
  }

  clearEyeInformation() {
    this.initializeEyeInformationForm();
  }

  saveEyeInformation() {
    if (!this.eyeLensForm.valid) {
      return;
    }
    const payload = {
      "EyeLensInfoID": this.EyeLensInfoID,
      "PatientID": this.PatientID,
      "AdmissionID": this.AdmissionID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "RightEyeSPH": this.eyeLensForm.get('RightEyeSPH').value,
      "RightEyeCYL": this.eyeLensForm.get('RightEyeCYL').value,
      "RightEyeAXIS": this.eyeLensForm.get('RightEyeAXIS').value,
      "RightEyePRISM": this.eyeLensForm.get('RightEyePRISM').value,
      "RightEyeBASE": this.eyeLensForm.get('RightEyeBASE').value,
      "RightEyeADD": this.eyeLensForm.get('RightEyeADD').value,
      "LeftEyeSPH": this.eyeLensForm.get('LeftEyeSPH').value,
      "LeftEyeCYL": this.eyeLensForm.get('LeftEyeCYL').value,
      "LeftEyeAXIS": this.eyeLensForm.get('LeftEyeAXIS').value,
      "LeftEyePRISM": this.eyeLensForm.get('LeftEyePRISM').value,
      "LeftEyeBASE": this.eyeLensForm.get('LeftEyeBASE').value,
      "LeftEyeADD": this.eyeLensForm.get('LeftEyeADD').value,
      "CL": this.eyeLensForm.get('CL').value,
      "BC": this.eyeLensForm.get('BC').value,
      "DIAM": this.eyeLensForm.get('DIAM').value,
      "PD": this.eyeLensForm.get('PD').value,
      "GLASS": this.eyeLensForm.get('GLASS').value,
      "READING": this.eyeLensForm.get('READING').value,
      "PLASTIC": this.eyeLensForm.get('PLASTIC').value,
      "DISTANCE": this.eyeLensForm.get('DISTANCE').value,
      "Remarks": $('#eyeLensRemaks').html(),
      "HospitalID": this.hospId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
    };

    this.config.savePatientEyeLensInfo(payload).subscribe((response: any) => {
      if (response.Code === 200) {
        this.EyeLensInfoID = response.PatientVitalEndoscopyDataaList[0].PreProcedureAssessment;
        $('#saveEyeInformationMsg').modal('show');
      }
    });
  }
  futureDatesFilter = (date: Date | null): boolean => {
    const currentDate = new Date();
    return date ? date >= currentDate : false;
  };
  onDateChange(event: any) {
    this.emrAdmissionForm.get('TodayAfter').setValue("A");
    const timeDifference = new Date(event.value).getTime() - new Date().getTime();
    const daysDifference = (timeDifference / (1000 * 60 * 60 * 24)) + 1;
    this.emrAdmissionForm.get('AfterDays').setValue(Math.floor(daysDifference));
    if (this.emrAdmissionForm.get('Expectedlengthofstay').value >= 0) {
      this.addDays();
    }
  }
  addDays() {
    let Expectedlengthofstay = this.emrAdmissionForm.get('Expectedlengthofstay')?.value == undefined ? "0" : this.emrAdmissionForm.get('Expectedlengthofstay')?.value;

    const admissionDate = new Date(this.emrAdmissionForm.get('Admission')?.value);
    if (Expectedlengthofstay >= 0) {
      const endDate = new Date(admissionDate.getTime() + (Expectedlengthofstay * 24 * 60 * 60 * 1000));
      this.emrAdmissionForm.get('DischargeDate')?.setValue(endDate);
    }


  }

  openFavouritePanel(selectTemplate?: boolean) {
    if (!selectTemplate) {
      this.clearDoctorFavourites();
    }
    this.config.FetchDoctorFavourites(
      this.doctorDetails[0].EmpSpecialisationId,
      this.doctorDetails[0].EmpId,
      this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      this.hospId).subscribe(response => {
        this.doctorFavourites = response.FetchDoctorFavouriteChiefComplaintAndExaminationsDataList ?? [];
        this.doctorFavourites = this.doctorFavourites.sort((a: any, b: any) => a.TemplateName.localeCompare(b.TemplateName));
        if (!selectTemplate) {
          this.favouriteDoctorNameText = this.doctorDetails[0].EmployeeName;
          $('#add_fav_chiefComplaints').modal('show');
        } else {
          this.onDoctorFavouriteSelect(this.doctorFavourites[this.doctorFavourites.length - 1]);
        }
      });
  }

  saveDoctorFavourites() {
    if (!this.favouriteTemplateName) {
      this.errorMessage = 'Please Enter Template Name';
      $('#errorMsg').modal('show');
      return;
    }
    const payload = {
      "DocFavouriteChiefExaminationID": this.selectedDoctorFavourite ? this.selectedDoctorFavourite.DocFavouriteChiefExaminationID : 0,
      "DoctorId": this.doctorDetails[0].EmpId,
      "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
      "TemplateName": this.favouriteTemplateName,
      "ChiefComplaint": this.favouriteChiefComplaintsText,
      "PhysicalExamination": this.favouritePhysicalExaminationText,
      "HistoryofPresentIllness": this.favouriteSubjectiveText,
      "AssessmentPlan": this.favouriteAssessmentText,
      "Hospitalid": this.hospId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID
    };
    this.config.saveDoctorFavourites(payload).subscribe(response => {
      if (response.Code === 200) {
        $('#saveFavouriteMsg').modal('show');
        if (!this.selectedDoctorFavourite) {
          this.openFavouritePanel(true);
        }
      }
    });
  }

  clearDoctorFavourites() {
    this.selectedDoctorFavourite = null;
    this.favouriteTemplateName = '';
    this.favouriteChiefComplaintsText = '';
    this.favouritePhysicalExaminationText = '';
    this.favouriteSubjectiveText = '';
    this.favouriteAssessmentText = '';
    this.favouriteDoctorNameText = this.doctorDetails[0].EmployeeName;
  }

  onDoctorFavouriteSelect(template: any) {
    this.selectedDoctorFavourite = template;
    this.favouriteTemplateName = template.TemplateName;
    this.favouriteChiefComplaintsText = template.ChiefComplaint;
    this.favouritePhysicalExaminationText = template.PhysicalExamination;
    this.favouriteSubjectiveText = template.HistoryofPresentIllness;
    this.favouriteAssessmentText = template.AssessmentPlan;
    this.favouriteDoctorNameText = this.doctorDetails[0].EmployeeName;
  }

  onCopyFavouriteClick() {
    $('#add_fav_chiefComplaints').modal('hide');
    this.emrNurseChiefComplaint = this.selectedDoctorFavourite.ChiefComplaint;
    this.emrNursePhysicalExamination = this.selectedDoctorFavourite.PhysicalExamination;
    this.divPhysicalExamination.nativeElement.innerHTML = this.selectedDoctorFavourite.PhysicalExamination;
    this.emrNurseHistoryofPresentIllness = this.selectedDoctorFavourite.HistoryofPresentIllness;
    this.emrNurseAssessmentPlan = this.selectedDoctorFavourite.AssessmentPlan;
  }

  FetchPhysicalExaminationStatus() {
    this.config.FetchPhysicalExaminationStatus(
      this.doctorDetails[0].EmpSpecialisationId,
      this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      this.hospId
    ).subscribe((response: any) => {
      this.physicalExaminationStatus = '';
      this.FetchPhysicalExaminationStatusDataList = response.FetchPhysicalExaminationStatusDataList;
      if (response.FetchPhysicalExaminationStatusDataList.length > 0) {
        response.FetchPhysicalExaminationStatusDataList.forEach((element: any) => {
          this.physicalExaminationStatus += `${element.ExaminationName}: <span class="dropdown_${element.ExaminationName.split(' ').join('-')}">None</span><br>`;
        });
      }
    });
  }

  handleFormClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    this.inputDynamicType = null;
    this.inputDynamicValue = null;
    this.inputDynamicList = null;
    this.inputErrorMessage = null;

    if (target && target.tagName === 'SPAN') {
      setTimeout(() => {
        this.inputDynamicType = target.classList.value;
        this.inputDynamicValue = target.textContent;
        const elementName = this.inputDynamicType.split('_')[1];
        const element = this.FetchPhysicalExaminationStatusDataList.find((item: any) => {
          return item.ExaminationName.split(' ').join('-') === elementName
        });
        this.inputDynamicList = element.Descriptions.split(',')
          .filter((item: any) => item.trim())
          .map((item: any, index: any) => {
            return {
              ID: index + 1,
              Name: item.trim()
            }
          });
        if (this.inputDynamicList.length === 0) {
          this.inputErrorMessage = `No Data found for ${element.ExaminationName}`
        }
        this.config.triggerDynamicUpdate(false);
        $("#modalDynamic").modal('show');
      }, 500);
    }
  }

  receivedData(data: { spanid: any, content: any }) {
    this.inputDynamicType = null;
    this.inputDynamicValue = null;
    this.inputDynamicList = null;
    this.inputErrorMessage = null;
    $("#modalDynamic").modal('hide');

    const divContent = this.divPhysicalExamination.nativeElement;
    const spanElements = divContent.querySelectorAll('span');

    spanElements.forEach((span: Element) => {
      if (span.classList.contains(data.spanid)) {
        this.renderer.setProperty(span, 'textContent', data.content);
      }
    });
  }

  Update() {
    this.config.triggerDynamicUpdate(true);
  }

  addFollowupDays() {
    let afterDays = this.followupForm.get('FollowupAfter').value;
    const admissionDate = new Date();
    const endDate = new Date(admissionDate.getTime() + (afterDays * 24 * 60 * 60 * 1000));
    this.followupForm.get('FollowupDate').setValue(endDate);
    this.FollowAfter = afterDays;
  }

  saveFollowUpFromEndofEpisode() {
    const diag = this.DoctorDiagnosisComponent?.items; let diagSelected: any = []; const refdata: any = []; let DoctorSelected: any = [];

    if (this.selectedView.OrderTypeID === '49') {
      DoctorSelected.push({
        "DOCID": this.doctorDetails[0].EmpId,
        "SPID": this.selectedView.SpecialiseID,
        "CVAD": this.FollowAfter,
        "SCHID": 0
      });
    }

    if (diag && diag?.value !== undefined) {
      this.DoctorDiagnosisComponent?.items.value.forEach((element: any, index: any) => {
        diagSelected.push({
          "DID": element.ItemID,
          "DISEASENAME": element.ItemName,
          "CODE": element.ItemCode,
          "DTY": element.Type,
          "UID": this.doctorDetails[0].EmpId,
          "ISEXISTING": "1",
          "PPID": "0",
          "STATUS": element.STATUS,
          "DTID": element.Type,
          "DIAGNOSISTYPEID": element.DiagnosisType,
          "ISPSD": "0",
          "REMARKS": "",
          "MNID": element.MNID,
          "IAD": "1"
        });
      });

      let payload = {
        "intMonitorID": this.selectedView.MonitorID === '' ? 0 : this.selectedView.MonitorID, //this.PatientDiagnosisDataList[0].MonitorID,
        "PatientID": this.selectedView.PatientID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "IPID": this.selectedPatientAdmissionId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "PatientType": this.selectedView.PatientType,
        "BillID": this.selectedView.BillID,
        "FollowUpType": "1",
        "Advicee": this.followupForm.get('adviceToPatient').value,
        "FollowAfter": this.FollowAfter,
        "FollowUpOn": moment(this.followupForm.get('FollowupDate').value).format('DD-MMM-YYYY'),
        "DiagDetailsList": diagSelected,
        "ReasonforAdm": "",
        "RefDetailsList": refdata,
        "LengthOfStay": 0,
        "DietTypeID": 0,
        "FollowUpRemarks": this.followupForm.get('Remarks').value,
        "PrimaryDoctorID": this.doctorDetails[0].EmpId,
        "AdmissionTypeID": 0,
        "FollowUpCount": this.followupForm.get('NoofFollowUp')?.value,
        "Followupdays": this.followupForm.get("NoofDays").value == "" ? "0" : this.followupForm.get("NoofDays").value,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        "HospitalID": sessionStorage.getItem('hospitalId'),
        "BillType": this.selectedView.BillType == 'Insured' ? 'CR' : 'CS',
        "CompanyID": this.selectedView.CompanyID == "" ? 0 : this.selectedView.CompanyID,
        "GradeID": this.selectedView.GradeID,
        "WardID": 0,
        "PrimaryDoctorSpecialiseID": 0,
        "DoctorXML": this.selectedView.OrderTypeID === '49' ? DoctorSelected : []


      }

      this.config.saveAdvice(payload).subscribe((response: any) => {
        if (response.Status === "Success" || response.Status === "True") {
          // $("#saveAdviceMsg").modal("show");
        }
      },
        () => {

        })
    }
  }

  FetchDentalDermaSpecialSpecialisation() {
    this.config.fetchDentalDermaSpecialSpecialisation(this.hospId).subscribe((response: any) => {
      if (response.Code == 200) {
        // if (response.SmartDataList[0]?.SpecialisationID.includes(this.doctorDetails[0].EmpSpecialisationId)) {
        //   this.showNoofDaysFollowUp = true;
        // }
        if (response.SmartDataList[0].SpecialisationID.split(',').filter((x: any) => x === this.doctorDetails[0].EmpSpecialisationId).length) {
          this.showNoofDaysFollowUp = true;
        }
      }
    });
  }

  openProgressNotes() {
    const options: NgbModalOptions = {

      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(OpProgressNotesComponent, {
      readonly: true
    }, options);
  }

  openSickLeave() {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal sickLeave_modal'
    };
    const modalRef = this.modalService.openModal(SickleaveComponent, {
      showClose: true
    }, options);
  }

  openApproval() {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(ViewapprovalrequestComponent, {
      showClose: true
    }, options);
  }

  isIVIM: string = '0';
  private searchInput$ = new Subject<string>();
  searchText: string = '';
  FetchPrescriptionIVIMDataList: any = [];
  ivSelectedItems: any = [];
  routeId: any = '';
  selectedItem: any;
  AdmRoutesList: any;
  AdmRoutesMastersList: any;

  isIVSelected(value: string) {
    this.isIVIM = value;
    if (this.isIVIM === '1') {
      this.ivSelectedItems = [];
      this.FetchPrescriptionIVIMDataList = [];
      this.selectedItem = null;
      this.routeId = '';
      this.searchText = '';
      this.listOfItems = [];
      if (!this.AdmRoutesMastersList) {
        this.FetchMedicationDemographics();
      } else {
        this.AdmRoutesList = [...this.AdmRoutesMastersList];
      }
      const url = this.us.getApiUrl('FetchPrescriptionIVIM?AdmissionID=${AdmissionID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}', {
        AdmissionID: this.selectedPatientAdmissionId,
        WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
        HospitalID: this.hospId
      });
      this.us.get(url).subscribe((response: any) => {
        if (response.Code === 200) {
          this.FetchPrescriptionIVIMDataList = [...response.FetchPrescriptionIVIMDataList];
          this.ivSelectedItems = [...response.FetchPrescriptionIVIMDataList];
          $('#IVModal').modal('show');
        }
      });
    }
  }

  FetchMedicationDemographics() {
    this.routeId = '';
    this.config.fetchMedicationDemographics("77", this.doctorDetails[0].EmpId, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.AdmRoutesList = response.MedicationDemographicsAdministrationDataList.map((element: any) => {
            return {
              RouteName: element.Names,
              RouteID: element.Id
            }
          }).sort((a: any, b: any) => a.RouteName.localeCompare(b.RouteName));
          this.AdmRoutesMastersList = [...this.AdmRoutesList];
        }
      },
        (_) => {

        });
  }

  onAddClick() {
    this.ivSelectedItems.push({ ...this.selectedItem, AdmRouteID: this.routeId });
    this.selectedItem = null;
    this.routeId = '';
    this.searchText = '';
    this.AdmRoutesList = [...this.AdmRoutesMastersList];
  }

  onIVCloseClick() {
    if (this.FetchPrescriptionIVIMDataList.length === 0) {
      this.isIVIM = '0';
    }
    $('#IVModal').modal('hide');
  }

  searchItem(event: any) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      const inputValue = event.target.value;
      this.searchInput$.next(inputValue);
    }
  }
  onContextMenu(event: Event) {
    event.preventDefault(); // Attempt to prevent the default context menu
  }

  initializeSearchListener() {
    this.searchInput$
      .pipe(
        debounceTime(0)
      )
      .subscribe(filter => {
        if (filter.length >= 3) {
          this.config.FetchItemDetailsNIV(filter, "0", this.hospId, this.doctorDetails[0].EmpId, 0, 0, this.selectedCard.PatientType)
            .subscribe((response: any) => {
              if (response.Code == 200) {
                this.listOfItems = response.ItemDetailsDataList;
              }
            },
              (_) => {

              })
        }
        else {
          this.listOfItems = [];
        }
      });
  }

  onItemSelected(item: any) {
    const isAvailable = this.ivSelectedItems.find((el: any) => el.ItemID === item.ItemID);
    if (!isAvailable) {
      this.selectedItem = item;
      this.config.fetchItemForPrescriptions(this.selectedCard.patientType,
        item.ItemID,
        "1",
        this.doctorDetails[0].EmpId,
        this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
        this.hospId, this.doctorDetails[0].EmpId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.AdmRoutesList = response.ItemRouteDataList;
          }
        });
    } else {
      setTimeout(() => {
        this.searchText = '';
        this.listOfItems = [];
      }, 0);
    }
    this.listOfItems = [];
  }

  deleteIVItem(index: any) {
    this.ivSelectedItems.splice(index, 1);
  }

  onIVSaveClick() {
    this.us.post('SavePrescriptionIVIM', {
      "PrescriptionIVIMID": 0,
      "PatientID": this.PatientID,
      "AdmissionID": this.selectedPatientAdmissionId,
      "DoctorID": this.doctorID,
      "ItemsXML": this.ivSelectedItems.map((el: any) => {
        return { ITM: el.ItemID, ADMROUTID: el.AdmRouteID }
      }),
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospId
    }).subscribe((response: any) => {
      if (response.Code === 200) {
        $('#IVModal').modal('hide');
      }
    });
  }

  showClaraModal: boolean = false;

  showAI() {
    this.showClaraModal = true;
  }

  openNphiesPatientData() {
    const payload = {
      "hospitalId": "2",//this.hospId,
      "doctorId": "2091895926",//this.doctorDetails[0].Health_ID,
      "patientId": "30000091731053",//this.selectedCard.HealthID,
    }
    this.config.getnphiesPatientData(payload)
      .subscribe((response: any) => {
        if (response.status == 1) {
          this.nphiesPatientDataHtmlContent = this.sanitizer.bypassSecurityTrustHtml(response.content);// response.content;
          //$('#viewNphiesPatientDataModal').modal('show');   
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.open();
            newWindow.document.write(response.content);
            newWindow.document.close();
          }     
        }
      },
        (_) => {

        })
  }
}

