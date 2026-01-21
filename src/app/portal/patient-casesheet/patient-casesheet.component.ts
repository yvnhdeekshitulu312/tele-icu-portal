import { ChangeDetectorRef, HostListener, Component, OnInit, ViewChild, ElementRef, Renderer2, EventEmitter, QueryList, ViewChildren, AfterViewInit, Output } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DrugAllergy, FoodAllergy } from './prescription-interface';
import { PrescriptionComponent } from '../prescription/prescription.component';
import { CanComponentDeactivate } from 'src/app/can-deactivate.guard';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { Subject, debounceTime } from 'rxjs';
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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PatientAlertsComponent } from 'src/app/shared/patient-alerts/patient-alerts.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ParentalCareInitialComponent } from '../parental-care-initial/parental-care-initial.component';
import { PulmonologyDiseasesOpdnoteComponent } from '../pulmonology-diseases-opdnote/pulmonology-diseases-opdnote.component';


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
  selector: 'app-patient-casesheet',
  templateUrl: './patient-casesheet.component.html',
  styleUrls: ['./patient-casesheet.component.scss'],
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
export class PatientCasesheetComponent implements OnInit, CanComponentDeactivate {
  activeAssessmentTab = 'chief_complaints';
  charAreaSpline!: Highcharts.Chart
  isAllergySubmitted: any;
  allergiesList: any;
  drugallergiesList: any;
  foodallergiesList: any;
  allergyType: any = 'Drug';
  isAllergy: any = false;
  showEndofEpisodeDateTime: boolean = false;
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
  @ViewChild('sickleave', { static: true }) sickleave!: ElementRef;
  @ViewChild('instructionstonurse', { static: true }) instructionstonurse!: ElementRef;
  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;

  drugList: DrugAllergy[] = [];
  foodList: FoodAllergy[] = [];
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
  listOfSpecItems: any;
  FetchClinicalInfoDataList: any;
  selectedPrevCcVisitdate = "";
  // @ViewChild('myDiag') myDiag!: ElementRef<HTMLElement>;
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
  emrAdmissionForm!: FormGroup;
  referralSpecialization = false;
  referralDoctor = false;
  referralWard = false;
  FetchPatientVisitDataList: any = [];
  FetchPatientChiefComplaintDataaList: any = [];
  prevChiefCompl = "";
  prevPhyExam = "";
  RiskScore: string = "";
  RiskScoreTooltip: string = "";
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
  selectedPainScoreId: any;
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


  constructor(private fb: FormBuilder, private config: ConfigService, private router: Router, public datepipe: DatePipe, private changeDetectorRef: ChangeDetectorRef, private renderer: Renderer2, public dialog: MatDialog, private us: UtilityService) {
    this.langData = this.config.getLangData();
    this.lang = sessionStorage.getItem("lang");
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    if (this.patientDetails.PatientType == '2') {
      this.tokenNoLabel = 'Bed No';
      this.IsAdult = Number(this.patientDetails.AgeValue) > 14 ? true : false;
      this.IsHeadCircumference = Number(this.patientDetails.AgeValue) >= 3 ? true : false;
    }
    else if (this.patientDetails.PatientType == '3') {
      this.tokenNoLabel = '';
      this.IsAdult = Number(this.patientDetails.Age.trim().split(' ')[0]) > 14 ? true : false;
      this.IsHeadCircumference = Number(this.patientDetails.Age.trim().split(' ')[0]) >= 3 ? true : false;
    }
    else {
      this.tokenNoLabel = 'Token No';
      if (this.patientDetails.Age.toString().trim().split(' ').length > 1) {
        const age = this.patientDetails.Age?.trim().split(' ')[0];
        this.IsAdult = Number(age) > 14 ? true : false;
        this.IsHeadCircumference = Number(age) >= 3 ? true : false;
      }
      else {
        this.IsAdult = Number(this.patientDetails.Age) > 14 ? true : false;
        this.IsHeadCircumference = Number(this.patientDetails.Age) >= 3 ? true : false;
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
      edd: [''],
    });
    this.clinicalConditionsForm = this.fb.group({
      DurationOfIllness: [''],
      DurationOfIllnessUOMID: ['0'],
      Weight: [''],
      Height: [''],
      HeadCircumference: [''],
      ClinicalCondtionid: ['0'],
      PatientArrivalStatusID: ['0']
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
      SpecialisationDoctorName: ['']
    })

  }

  tabclick(input: any) {
    this.clickedtab = input;
    if (this.pendingChanges) {

      let removeClassName = "";
      let addClassName = "";
      const clinicalelement = this.clinical.nativeElement.querySelector('.nav-link');
      const diagnosiselement = this.diagnosis.nativeElement.querySelector('.nav-link');
      const prescriptionelement = this.prescription.nativeElement.querySelector('.nav-link');
      const adviceelement = this.advice.nativeElement.querySelector('.nav-link');
      const assessmentelement = this.assessment.nativeElement.querySelector('.nav-link');
      const otherselement = this.others.nativeElement.querySelector('.nav-link');
      const summaryelement = this.summary.nativeElement.querySelector('.nav-link');

      if (input === 'clinical') {
        removeClassName = clinicalelement;
      }
      else if (input === 'assessment') {
        removeClassName = assessmentelement;
      }
      else if (input === 'diagnosis') {
        removeClassName = diagnosiselement;
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
      else if (input === 'summary') {
        removeClassName = summaryelement;
      }

      if (this.childClickName === 'clinical' || !this.childClickName) {
        addClassName = clinicalelement;
      }
      else if (this.childClickName === 'assessment') {
        addClassName = assessmentelement;
      }
      else if (this.childClickName === 'diagnosis') {
        addClassName = diagnosiselement;
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
      else if (this.childClickName === 'summary') {
        sessionStorage.setItem("PatientID", this.selectedView.PatientID);
        addClassName = summaryelement;
      }

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
      this.renderer.removeClass(removeClassName, "active");
      this.renderer.addClass(addClassName, "active");
    }
    else {
      this.childClickName = "";
      this.activeTab = "";
      if (input == "clinical") {
        this.fetchPregenencyHistory();
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

  ngOnInit(): void {
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    if (this.selectedView.PatientType == '3')
      this.emrNurseChiefComplaint = "The patient presents to the Emergency Department with a chief complaint of " + this.selectedView.NurseChiefComplaints + ", which began " + this.selectedView.DurationofIllNess + " " + this.selectedView.DurationofIllNessUOMName + " ago";
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
    this.FetchModeOfarrival();

    this.PrescriptionRestriction = this.doctorDetails[0].PrescriptionRestriction;

    /**
     * @ this 68 line i'm geeting local storage data which i select
     */
    this.selectedCard = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.OPConsultationID = this.selectedView.OPConsultationID;
    this.MonitorID = this.selectedView.MonitorID;
    this.PatientID = this.selectedView.PatientID;
    this.AdmissionID = this.selectedView.AdmissionID;
    if (this.selectedView.PatientType == "2") {
      this.AdmissionID = this.selectedView.IPID;
    }
    if (this.selectedView.PatientType == "2") {
      if (this.selectedView?.Bed.includes('ISO'))
        this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
      else
        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }

    if (this.selectedView.PatientType == '2')
      this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
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
    this.GetVitalsData();
    this.GetVitalScores();
    this.afterSave(); this.getHight();
    this.fetchPainScoreMaster();
    //this.fetchClinicalCondition();
    this.fetchSpecialisationClinicalCondition();
    this.fetchPregenencyHistory();
    this.ShowHidePregnancyOption();
    this.fetchPatientAllergies();
    this.fetchSavedClinicalCondition();
    this.fetchCaseSheetConfigurations("");
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

    this.restrictPrescriptionSave();

    this.IsNurse = sessionStorage.getItem("IsNurse");

    this.fetchFraminghamRiskScoreForMenandWomen();    

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
          this.endofEpisode = true; sessionStorage.setItem("ISEpisodeclose", "true");
          this.endofEpsiodeDate = this.datepipe.transform(response.FetchClinicalInfoDataList[0].EpisodeCloseDate, "dd-MMM-yyyy")?.toString();
        }
        else {
          this.endofEpisode = false;
          sessionStorage.setItem("ISEpisodeclose", "false");
          this.restrictPrescriptionSave()
        }
        this.FromPrevRefDocCalendar = sessionStorage.getItem("FromPrevRefDocCalendar") || 'false';
        if(this.FromPrevRefDocCalendar === 'true') {
          this.endofEpisode = true; sessionStorage.setItem("ISEpisodeclose", "true");
        }
        if (response.Code == 200 && response.FetchClinicalInfoDataList.length > 0) {

          this.clinicalConditionsForm.patchValue({
            DurationOfIllness: response.FetchClinicalInfoDataList[0].DurationOfIllness.split(' ')[0],
            DurationOfIllnessUOMID: response.FetchClinicalInfoDataList[0].DurationOfIllnessUOMID == "" ? 3 : response.FetchClinicalInfoDataList[0].DurationOfIllnessUOMID,
            Weight: response.FetchClinicalInfoDataList[0].Weight,
            Height: response.FetchClinicalInfoDataList[0].Height,
            HeadCircumference: response.FetchClinicalInfoDataList[0].HeadCircumference,
            ClinicalCondtionid: response.FetchClinicalInfoDataList[0].ClinicalCondtionid,
            PatientArrivalStatusID: response.FetchClinicalInfoDataList[0].PatientarrivedStatusID == "" ? '0' : response.FetchClinicalInfoDataList[0].PatientarrivedStatusID
          })
          this.smokingValue = response.FetchClinicalInfoDataList[0].IsSmoke == "True" ? "Yes" : "No";
          if (this.smokingValue == "Yes")
            this.smokingInfoSaved = true;
          this.educatedValue = response.FetchClinicalInfoDataList[0].IsEducated == "True" ? "Yes" : "No";
          this.sleepValue = response.FetchClinicalInfoDataList[0].ISsleep == "True" ? "Yes" : "No";
          this.alcoholValue = response.FetchClinicalInfoDataList[0].Isalcohol == "True" ? "Yes" : "No";
          this.painScore.forEach((element: any, index: any) => {
            if (element.id == response.FetchClinicalInfoDataList[0].PainScoreID)
              element.Class = "pain_reaction position-relative cursor-pointer active text-center";
            this.painScoreSelected = true; this.showPSValidation = false;
            this.selectedPainScoreId = response.FetchClinicalInfoDataList[0].PainScoreID;
            this.selectedView.PainScore = this.selectedPainScoreId;
            sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
          });
          if (response.FetchClinicalInfoDataList[0].CTASScoreColorID != "0") {
            var ctasScoreDesc = "";
            this.selectedCard.CTASSCore=response.FetchClinicalInfoDataList[0].CTASScoreColorID;
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
        }
        else {

          if (!this.IsEmergency) {
            this.clinicalConditionsForm.get('PatientArrivalStatusID')?.setValue(3); // Selecting as Walkin by default
            this.clinicalConditionsForm.patchValue({
              DurationOfIllnessUOMID: 3,
              // Weight: this.OrderType.toString().toLowerCase() == "followup" ? this.selectedView.Weight : "",
              // Height: this.OrderType.toString().toLowerCase() == "followup" ? this.selectedView.Height : "",
            })
          }
          this.clinicalConditionsForm.patchValue({
            Weight: this.selectedView.Weight,
            Height: this.selectedView.Height,
          })
          if (this.IsEmergency) {
            this.clinicalConditionsForm.get('ClinicalCondtionid')?.setValue(1);
          }
        }

        this.afterFetch = true;
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
    if (this.IsEmergency) {
      this.router.navigate(['/emergency']);
    }
    else if (this.patientDetails.PatientType == '2' && fromdocCal != "true") {
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
  }

  GetVitalScores() {
    this.config.fetchVitalScores(this.doctorDetails[0].UserId, this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitalsScores = response.FetchVitalScoresDataList;
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
      this.config.fetchOutPatientData(this.selectedCard.PatientID, FromDate, ToDate, this.hospId)
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
      var vm = new Date(); vm.setMonth(vm.getMonth() - 3);
      var FromDate = this.datepipe.transform(vm, "dd-MMM-yyyy")?.toString();
      var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
      this.config.fetchPatientVitalsByIPID(this.selectedView.IPID, FromDate, ToDate, this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.tableVitalsList = response.PatientVitalsDataList;
            const distinctThings = response.PatientVitalsDataList.filter(
              (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.VitalSignDateOnly === thing.VitalSignDateOnly) === i);
            console.dir(distinctThings);
            this.tableVitalsListFiltered = distinctThings
            this.createChartLine(2);
          }
        },
          (err) => {

          })
    }
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
    if (this.selectedCard.PatientType == '2')
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
        element.VisitDateTime = element.VisitDate.split('-')[2];
        element.VisitDate = element.VisitDate.split('-')[0];
      }
      else {
        element.VisitDate = element.VitalSignDate;
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
    if (this.selectedCard.PatientType == '2')
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
    if (this.selectedCard.PatientType == '2')
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
        element.VisitDate = element.VisitDate.split('-')[0];
      }
      else {
        element.VisitDate = element.VitalSignDate;
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
      element.Class = "pain_reaction position-relative cursor-pointer text-center";
    });
    this.clinicalConditionsForm.reset({
      DurationOfIllness: [''],
      DurationOfIllnessUOMID: ['0'],
      Weight: [''],
      Height: [''],
      ClinicalCondtionid: ['0'],
      PatientArrivalStatusID: ['5']
    });
  }
  painScoreClick(ps: any) {
    this.isDirty = true;
    this.pendingChanges = true;
    ps.Class = "pain_reaction position-relative cursor-pointer active text-center";
    this.selectedPainScoreId = ps.id;
    this.painScore.forEach((element: any, index: any) => {
      if (element.id != ps.id)
        element.Class = "pain_reaction position-relative cursor-pointer text-center";
      this.painScoreSelected = true; this.showPSValidation = false;
    });
  }

  checkReferralVitals() {
    if ((this.selectedCard.OrderTypeID === '51' || this.selectedCard.PatientType == '2') && !this.vitalsValidation && this.FetchClinicalInfoDataList.length == 0) {
      this.FetchPatientVitalsWithDiseases();
    }
    else {
      this.saveClinicalConditions();
    }
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
    if ($("#durationofIllness").val() == '') {
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
    if (this.tableVitalsList.filter((x: any) => x.VisitID == this.selectedPatientAdmissionId).length == 0 && this.selectedView.PatientType == "1") {
      this.vitalsValidation = true;
      this.errorMessages.push(this.langData?.common?.vital_required);
      //this.clinicalConditionsValidationMsg = this.clinicalConditionsValidationMsg == "" ? this.langData?.common?.vital_required : this.clinicalConditionsValidationMsg + this.langData?.common?.vital_required;
    }
    else
      this.vitalsValidation = false;
    if (this.IsEmergency == true && this.ctasScore == '') {
      this.errorMessages.push("Please select CTAS score");
    }

    if (!this.showPSValidation && !this.showdurationofIllnessValidation && !this.clinicalConditionValidation && !this.vitalsValidation && !this.PaitentArrivalValidation && !this.showHeightValidation && !this.showWeightValidation) {
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
        "ContraceptionID": this.pregnancyForm.get('contraception')?.value,
        "ClinicalCondtionid": this.clinicalConditionsForm.get('ClinicalCondtionid')?.value,
        "HospitalID": this.hospId,
        "IsPatientDrugAlleric": this.drugList.length > 0 ? true : false,
        "CTASScoreColorID": this.IsEmergency == true ? this.ctasScore : 0,
        "ISsleep": this.sleepValue == "Yes" ? true : false,
        "Isalcohol": this.alcoholValue == "Yes" ? true : false,
        "PatientArrivalStatusID": this.clinicalConditionsForm.get('PatientArrivalStatusID')?.value,
        "VTOrderID": (this.selectedView.VTOrderID == "" || this.selectedView.VTOrderID == undefined) ? "0" : this.selectedView.VTOrderID,
        "UserID": this.doctorDetails[0].UserId
      }
      this.config.saveClinicalConditions(payload).subscribe(
        (response) => {
          if (response.Code == 200) {
            if(this.IsEmergency) {
              this.selectedView.CTASSCore = this.ctasScore;
              this.selectedView.PainScore = this.selectedPainScoreId;
              sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
            }
            this.selectedCard.Weight = this.clinicalConditionsForm.get('Weight')?.value;
            this.selectedCard.Height = this.clinicalConditionsForm.get('Height')?.value;
            $("#saveClinicalConditionsMsg").modal('show');
            setTimeout(() => {
              $("#saveClinicalConditionsMsg").modal('hide');
              this.fetchCaseSheetConfigurations('Clinical Conditions');
            }, 1000)
            this.initialFormValue = this.clinicalConditionsForm.value;
            this.isDirty = false;
            this.pendingChanges = false;
            if (!this.IsAdult) {
              this.getHight();
              this.getChart('W');
            }
          } else {

          }
        },
        (err) => {
          console.log(err)
        });

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
        if (element.id == 1) { element.imgsrc = "assets/images/image1.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center"; }
        else if (element.id == 2) { element.imgsrc = "assets/images/image2.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center"; }
        else if (element.id == 3) { element.imgsrc = "assets/images/image3.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center"; }
        else if (element.id == 4) { element.imgsrc = "assets/images/image4.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center"; }
        else if (element.id == 5) { element.imgsrc = "assets/images/image5.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center"; }
        else if (element.id == 6) { element.imgsrc = "assets/images/image6.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center"; }
      });
      if (this.IsEmergency && this.selectedView.NursePainScoreID != '') {
        this.painScore.forEach((element: any, index: any) => {
          if (element.id == this.selectedView.NursePainScoreID)
            element.Class = "pain_reaction position-relative cursor-pointer active text-center";
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
      this.clinicalCondition = response.SmartDataList;
    })
  }
  ShowHidePregnancyOption() {
    // this.Age_Gender = this.selectedView.Age_Gender;
    // const ageRegex = /\d+/;
    // const ageMatch = this.Age_Gender.match(ageRegex);
    // const age = ageMatch ? ageMatch[0] : null;
    // const gender = this.Age_Gender.split("/")[1];
    var age = this.selectedView.Age?.toString().split(' ').length > 1 ? this.selectedView.Age.split(' ')[0] : this.selectedView.Age;

    this.openToggleYes = this.selectedView.Age && this.selectedView.Gender === "Female" && age > 15;
    if (this.openToggleYes) {
      this.showHidePregnancyToggle = true;
    }
  }
  togglePregnancy(option: boolean) {
    this.isDirty = true;
    this.pendingChanges = true;
    //this.Age_Gender = this.selectedView.Age_Gender;
    //const ageRegex = /\d+/;
    //const ageMatch = this.Age_Gender.match(ageRegex);
    var age = this.selectedView.AgeValue; //ageMatch ? ageMatch[0] : null;
    if (this.selectedView.PatientType === '1') {
      age = this.selectedView.Age.split(' ')[0];
    }
    const gender = this.selectedView.Gender;
    this.openToggleYes = age && gender === "Female" && age > 15;
    this.pregnancyToggle = option;
    if (option === true && this.openToggleYes) {
      $("#savePrescriptionMsg").modal('show');
    }
  }
  pregnancyClick(preg: any) {
    if (preg == "Yes")
      this.pregnancyValue = "Yes";
    else
      this.pregnancyValue = "No";
  }
  closePregPopup() {
    if (this.pregenencyHistoryList === undefined || this.pregenencyHistoryList?.length === 0) {
      this.togglePregnancy(false);
    }
  }
  toggleAllrgy(option: string) {
    this.isDirty = true;
    this.pendingChanges = true;
    this.allrgyValue = option;
    if (option === 'Yes')
      $("#allergies_modal").modal('show');
  }
  toggleSmoking(option: string) {
    this.isDirty = true;
    this.pendingChanges = true;
    this.smokingValue = option;
    if (option === "Yes" && this.IsAdult) {
      $("#saveSmokeInfo").modal('show');
      this.FetchSmokingInfo(2);
    }
  }
  toggleAlcoholUse(option: string) {
    this.isDirty = true;
    this.pendingChanges = true;
    this.alcoholValue = option;
  }
  toggleSleep(option: string) {
    this.isDirty = true;
    this.pendingChanges = true;
    this.sleepValue = option;
  }
  togglePatEducated(option: string) {
    this.isDirty = true;
    this.pendingChanges = true;
    this.educatedValue = option;
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
  savePregenencyHistoryList() {
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
      "EDD": this.datepipe.transform(this.pregnancyForm.value['edd'], "dd-MMM-yyyy")?.toString(),
      "UserID": this.doctorDetails[0].UserId
    }
    let lmp = moment(this.pregnancyForm.value['lmp']).format('yyyy-MM-DD');
    let edd = moment(this.pregnancyForm.value['edd']).format('yyyy-MM-DD');
    if (lmp === edd) {
      $("#showLMPEDDSameDateAlert").modal('show');
    }
    else {
      this.config.savePregenencyHistory(payload).subscribe(response => {
        //this.fetchPregenencyHistory();
        $("#savePregnancyDetMsg").modal('show');
        if (this.pregnancyForm.get('triSemister')?.value.split(' ')[0] == "1")
          this.selectedView.PregnancyContent = "1st";
        else if (this.pregnancyForm.get('triSemister')?.value.split(' ')[0] == "2")
          this.selectedView.PregnancyContent = "2nd";
        else if (this.pregnancyForm.get('triSemister')?.value.split(' ')[0] == "3")
          this.selectedView.PregnancyContent = "3rd";
        else {
          this.selectedView.PregnancyContent = "";
        }
      })
    }
  }
  fetchPregenencyHistory() {
    this.config.fetchPregenencyHistoryADV(this.PatientID, this.selectedPatientAdmissionId).subscribe((response: any) => {
      if (response.Code == "200") {
        if (response.PregnancyHisDataList.length > 0) {
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



  GetVitalsParams() {
    var age = this.patientDetails.Age;
    if (this.selectedView.PatientType == '2')
      age = this.patientDetails.AgeValue;
    else if (this.selectedView.PatientType == '3')
      age = age.toString().trim().split(' ')[0];
    else if (age.toString().trim().split(' ').length > 1) {
      age = age.toString().trim().split(' ')[0];
    }
    this.config.getVitalsParams(this.hospId, this.patientDetails.GenderID, age).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitals = response.GetAllVitalsList;

        setTimeout(() => {
          if (this.inputFields && this.inputFields.first) {
            this.inputFields.first.nativeElement.focus();
          }
        }, 1000);

      } else {
      }
    },
      (err) => {

      })
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
    this.GetVitalsParams();
    this.FetchVitalHypertensionParameters();
  }
  saveVitals(remarksSelectedIndex: number) {
    let find = this.tableVitals.filter((x: any) => x?.PARAMVALUE === null);
    let bpsys = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP -Systolic");
    let bpdia = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP-Diastolic");
    let temp = this.tableVitals.filter((x: any) => x?.PARAMETER === "Temperature");
    let remarksEntered = true;
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
        this.showParamValidationMessage = true;
        this.showVitalsValidation = false;
        return;
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
    this.drugList = [];
    this.foodList = [];

    this.config.fetchPatientAllergies(this.PatientID, this.patientDetails.RegCode, this.hospId).subscribe((response) => {
      if (response.Status === "Success") {

        this.allergiesList = response.PatientAllergiesDataList;
        this.foodallergiesList = response.PatientFoodAllergiesDataList;
        this.drugallergiesList = response.PatientDrugAllergiesDataList;
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

        if (this.allergiesList?.length > 0 || this.foodallergiesList?.length > 0 || this.drugallergiesList?.length > 0) {
          //$("#quick_info").modal('show');
          // if (!this.isClearAllergyPopup)
          //   $("#quick_info_Allergies").modal('show');
          if (this.selectedCard.PatientType == '2') {
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
            this.selectedPatientGender = this.selectedCard.FullAge_Gender.split('/')[1];
            this.selectedPatientAge = this.selectedCard.FullAge_Gender.split('/')[0];
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
    if (!this.allergyForm.valid || this.allergyForm.get('Severity')?.value === 0) {
      return;
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
  }
  close() {
    // this.allergyType = '';
    // $("#btnFood").removeClass("btn-main-fill");
    // $("#btnDrug").removeClass("btn-main-fill");
    // if (this.allrgyValue == "No" && (this.allrgyValue.length > 0 || this.foodList.length > 0)) {
    //   this.allrgyValue = "Yes";
    // }
    if (this.allergiesList?.length === 0 && this.foodallergiesList?.length === 0 && this.drugallergiesList?.length === 0) {
      this.toggleAllrgy('No');
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
    if (this.foodList.length === 0 && this.drugList.length === 0) {
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
    let payload = {
      "PatientID": this.PatientID,
      "IPID": this.AdmissionID,
      "FoodAllergies": this.foodList,
      "DrugAllergies": this.drugList,
      "OtherAllergies": [],
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
  }
  deleteDrugAllergy(index: any) {
    this.drugList.splice(index, 1);
    this.recordsAddedAndRemoved = true;
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
    if (!this.endofEpsiodeDate) {
      this.config.FetchEmergencyDischargeDispositions(this.doctorDetails[0].EmpId, this.hospId)
        .subscribe((response: any) => {
          this.Disposition = response.FetchEmergencyDischargeDispositionsDataList;
        },
          (err) => {
          })
      $('#endofEpisodeJustification').modal('show');
    }
  }
  saveEndofEpisodeRemarks() {
    if (this.FetchClinicalInfoDataList.length === 0) {
      this.saveClinicalConditions();
    }
    this.showendofEpisodeRemarks = false;
    if (this.selectedView.PatientType == "3") {

      const wardid = this.emrAdmissionForm.get('WardID')?.value;
      const specid = this.emrAdmissionForm.get('Specialization')?.value;
      const docid = this.emrAdmissionForm.get('SpecialisationDoctorID')?.value;
      const FollowUpOn =0;//this.emrAdmissionForm.get('Admission')?.value;
      const LengthOfStay = 0;

      if ($("#DispositionsID").val() == '4') {
        if (wardid == '0')
          this.referralWard = true;
        else if (specid == '0')
          this.referralSpecialization = true;
        else if (docid == '0')
          this.referralDoctor = true;
      }

      this.startTimers(this.selectedView);
      if ($("#endofEpisodeRemarks").val() != '') {
        var endofepisoderemarks = $("#endofEpisodeRemarks").val();
        var ExpiryDate = "0";
        if ($("#ScheduleStartDate").val() != '' && $("#ScheduleStartDate").val() != undefined && $("#endofEpisodeTime").val() != '' && $("#endofEpisodeTime").val() != undefined)
          ExpiryDate = $("#ScheduleStartDate").val() + " " + $("#endofEpisodeTime").val();
        this.config.UpdateEMRPatientEpisodeclose(this.PatientID, this.selectedPatientAdmissionId, true, this.doctorID, this.selectedView.SpecialiseID, this.selectedView.BillID, endofepisoderemarks, $("#DispositionsID").val(), ExpiryDate, this.TriageLOS, this.hospId, docid, specid, wardid,this.selectedView.PatientType,FollowUpOn,LengthOfStay,
        this.selectedView.BillType == 'Insured' ? 'CR' : 'CS', this.selectedView.CompanyID, this.selectedView.GradeID, this.selectedView.TariffId, this.selectedView.MonitorID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
      ).subscribe(response => {
          if (response.Code == 200) {
            $("#endofEpisodeSaveMsg").modal('show');
          }
        })
      }
      else {
        if ($("#DispositionsID").val() == '1' && $("#endofEpisodeRemarks").val() == '')
          this.showendofEpisodeRemarks = true;
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

      if (nextComponentName == "") {
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
    this.resetAllergy();
    this.isEdit = false;
  }

  trimSpaces(name: string): string {
    return name.trim().replace(/\s/g, '');
  }

  validateWeight() {
    var weight = this.clinicalConditionsForm.get('Weight')?.value;
   // if ((this.IsAdult && (weight.length < 2 || Number(weight) > 300))) {
    if ((this.IsAdult && (Number(weight) < 10 || Number(weight) > 300))) {
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
  }

  validateHeight() {
    var height = this.clinicalConditionsForm.get('Height')?.value;
    var prevHeight = this.selectedView.Height;
    if (prevHeight != "" && prevHeight != undefined) {
      if (Number(height) < Number(prevHeight)) {
        this.errorMessage = "Height cannot be less than previous height entered";
        $("#errorMsg").modal('show');
        this.clinicalConditionsForm.get('Height')?.setValue(this.selectedView.Height);
      }
    }
    if ((this.IsAdult && (Number(height) < 50 || Number(height) > 250)) || (!this.IsAdult && Number(height) > 50)) {
      this.errorMessage = "Enter Height between 50-250 cm(s)";
      $("#errorMsg").modal('show');
      this.clinicalConditionsForm.get('Height')?.setValue("");
    }

    if ((!this.IsAdult && Number(height) > 50)) {
      this.errorMessage = "Enter valid Height";
      $("#errorMsg").modal('show');
      this.clinicalConditionsForm.get('Height')?.setValue("");
    }
  }

  clearSmoking() {
    this.FetchSmokingInfo(2);
  }

  SmokingClick(smoke: any) {
    this.smokingYesNo = false;
    this.smokelength = "1";
    this.smokevalue = "0";
    this.SmokingCategory = 2;
    if (smoke === "Yes") {
      this.smokingYesNo = true;
      this.smokingIconPack = false;
      this.smokingIconStick = true;
      this.smokelength = "2";
      this.SmokingCategory = 1;
    } else {
      this.smokingIconPack = true;
      this.smokingIconStick = false;
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
    sessionStorage.setItem("FromCaseSheet", "true");
    this.router.navigate(['/home/otherresults']);
  }

  FetchSmokingInfo(type: any) {
    this.config.FetchSmokingInfo(this.PatientID, this.AdmissionID, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchSmokingInfoOutputLists = response.FetchSmokingInfoOutputLists;

          if (type === 1) {
            if (this.FetchSmokingInfoOutputLists.length > 0) {
              this.smokingValue = "Yes";
              this.isSmoker = "1";
              this.smokingInfoSaved = true;
            }
          }

          if (this.FetchSmokingInfoOutputLists[0]?.SmokingCategory === "2") {
            this.SmokingClick("No");
          }
          else {
            this.SmokingClick("Yes");
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
    } else if (this.SmokingCategory === 2) {
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
    this.selectedCard.CTASSCore=score;
    if (score == "1") {
      this.ctasScore1Class = "cursor-pointer circle d-flex align-items-center justify-content-center active red";
      this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "2") {
      this.ctasScore2Class = "cursor-pointer circle d-flex align-items-center justify-content-center active red";
      this.ctasScore1Class = this.ctasScore3Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "3") {
      this.ctasScore3Class = "cursor-pointer circle d-flex align-items-center justify-content-center active";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "4") {
      this.ctasScore4Class = "cursor-pointer circle d-flex align-items-center justify-content-center active";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "5") {
      this.ctasScore5Class = "cursor-pointer circle d-flex align-items-center justify-content-center active";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
  }

  onchangeEndofEpisodeDisposition(event: any) {
    const val = event.target.value;
    if (val == '7') {
      this.showEndofEpisodeDateTime = true;
      this.isemrPatientAdmission = false;
    }
    else if (val == '4') {
      this.showEndofEpisodeDateTime = false;
      this.isemrPatientAdmission = true;
      this.fetchEligibleBedTypes('0', '0');
      this.fetchReferalAdminMasters1();
    }
    else {
      this.showEndofEpisodeDateTime = false;
      this.isemrPatientAdmission = false;
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
  specializationChange(data: any) {
    const selectedItem = this.SpecializationList.find((value: any) => value.id === Number(data.target.value));
    this.emrAdmissionForm.patchValue({
      Specialization: selectedItem.id,
      SpecializationName: selectedItem.name
    });
    this.fetchSpecializationDoctorSearch();
  }
  fetchSpecializationDoctorSearch() {
    this.config.fetchSpecialisationDoctors('%%%', this.emrAdmissionForm.get("Specialization")?.value, this.doctorDetails[0].EmpId, this.hospId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.listOfSpecItems = response.FetchDoctorDataList;
        // setTimeout(() => {
        //   const selectedItem = this.listOfSpecItems.find((value: any) => Number(value.Empid) === Number(this.emrAdmissionForm.get("SpecialisationDoctorID")?.value));
        //   if (selectedItem) {
        //     this.emrAdmissionForm.patchValue({
        //       SpecialisationDoctorName: selectedItem.EmpNo + ' - ' + selectedItem.Fullname,
        //       SpecialisationDoctorID: selectedItem.Empid
        //     });
        //   }
        // }, 500);

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
        if (this.patientDetails.PatientType == '2' || this.patientDetails.PatientType == '3')
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
        if (response.FetchPatientChiefComplaintAndExaminationsDataaList.length > 0) {
          this.SavedChiefComplaints = response.FetchPatientChiefComplaintAndExaminationsDataaList;
          this.emrNurseChiefComplaint = this.SavedChiefComplaints[0]?.ChiefComplaint;
          this.emrNursePhysicalExamination = this.SavedChiefComplaints[0]?.PhysicalExamination;
          this.ChiefExaminationID = this.SavedChiefComplaints[0]?.ChiefExaminationID;
        }
        else {
          if (response.FetchPatientPrevChiefComplaintAndExaminationsDataList.length > 0 && this.selectedView.PatientType === '2') {
            this.emrNurseChiefComplaint = response.FetchPatientPrevChiefComplaintAndExaminationsDataList[0]?.ChiefComplaint;
            this.emrNursePhysicalExamination = response.FetchPatientPrevChiefComplaintAndExaminationsDataList[0]?.PhysicalExamination;
          }
        }
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
    const startDate = new Date(this.selectedView.Orderdate);
    const now = new Date();
    const differenceMs: number = now.getTime() - startDate.getTime();
    const seconds: number = Math.floor((differenceMs / 1000) % 60);
    const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
    const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
    const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
    const totalHours = hours + (days * 24);

    if (totalHours > Number(this.PrescriptionRestriction)) {
      this.endofEpisode = true;
      sessionStorage.setItem("ISEpisodeclose", "true");
    }
  }

  FetchPatientVitalsWithDiseases() {
    this.config.FetchPatientVitalsWithDiseases(this.selectedCard.PatientID, '0', '3403', this.hospId)
      .subscribe((response: any) => {
        if (response.Code === 200) {
          if (response.PatientVitalsDataFList.length > 0) {
            if (this.selectedCard.PatientType == '2') {
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

  openPrenatalForm() {
    this.obgyneFormType = "prenatal";
    this.selectedView.BMI = this.smartDataList[0].BMI;
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
  }

  BackToClinicalInfo() {
    this.obgyneFormType = "";
    this.fetchPregenencyHistory();
  }

  fetchPreviousChiefComplaints() {
    this.config.FetchPatientVisitsAndChiefComplaint(this.selectedCard.PatientID, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, this.hospId)
      .subscribe((response: any) => {
        if (response.Code === 200) {
          this.FetchPatientVisitDataList = response.FetchPatientVisitDataList;
          this.FetchPatientVisitDataList.forEach((element:any, index:any) => {
            element.selected = false;
          });
          this.FetchPatientChiefComplaintDataaList = response.FetchPatientChiefComplaintDataaList;
          $("#previouschiefcomplaints").modal('show');
        }
      },
        (err) => {
        })
  }

  showSelectedPrevChiefCompl(ccom:any) {
    this.FetchPatientVisitDataList.forEach((element:any, index:any) => {
      if(ccom.VisitID === element.VisitID) {
        element.selected = true;
      }
      else 
        element.selected = false;
    });
    this.selectedPrevCcVisitdate = '  :' + ccom.VisitDate + '-' + (ccom.PatientType === '1' ? 'OP' : ccom.PatientType === '2' ? 'IP' : ccom.PatientType === '3' ? 'EMR' : '') + '-' + ccom.DoctorName
    const prechiefcomp = this.FetchPatientChiefComplaintDataaList.find((x:any) => x.AdmissionID === ccom.AdmissionID);
    if(prechiefcomp !== undefined) {
      this.prevChiefCompl = prechiefcomp.ChiefComplaint; 
      this.prevPhyExam = prechiefcomp.PhysicalExamination;
    }
    else {
      this.prevChiefCompl = ""; 
      this.prevPhyExam = "";
    }
  }

  copyChiefComplaints() {
    this.emrNurseChiefComplaint = this.prevChiefCompl;
    this.emrNursePhysicalExamination = this.prevPhyExam;
    $("#previouschiefcomplaints").modal('hide');
  }

  fetchFraminghamRiskScoreForMenandWomen() {
    this.config.FetchFraminghamRiskScoreForMenandWomen(this.selectedCard.PatientID, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, this.hospId)
      .subscribe((response: any) => {
        if (response.Code === 200 && response.FetchFraminghamRiskScoreForMenandWomenDataList.length>0) {
          this.RiskScore = response.FetchFraminghamRiskScoreForMenandWomenDataList[0].RiskPer;
          this.RiskScoreTooltip=response.FetchFraminghamRiskScoreForMenandWomenDataList[0].RiskAnalysis;
        }
      },
        (err) => {
        })
  }

  toggleSelection(type: string, val: string) {
    if(type === 'unittype') {
      this.unitType = val;
    }
    else if(type === 'patientrace') {
      this.patientRace = val;
    }
    else if(type === 'diabetic') {
      this.isDiabetic = val;
    }
    else if(type === 'smoker') {
      this.isSmoker = val;
    }
    else if(type === 'hypertension') {
      this.isHypertension = val;
    }
  }

}

