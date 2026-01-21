import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BaseComponent } from '../base.component';
import { PatientfolderService } from './patientfolder.service';
import { UtilityService } from '../utility.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as Highcharts from 'highcharts';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { HostListener } from '@angular/core';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { VteRiskAssessmentComponent } from 'src/app/ward/vte-risk-assessment/vte-risk-assessment.component';
import { GenericModalBuilder } from '../generic-modal-builder.service';
import { VteSurgicalRiskAssessmentComponent } from 'src/app/ward/vte-surgical-risk-assessment/vte-surgical-risk-assessment.component';
import { VteObgAssessmentComponent } from 'src/app/ward/vte-obg-assessment/vte-obg-assessment.component';
import { EndoscopeComponent } from 'src/app/ward/endoscope/endoscope.component';
import { DietCounsellingComponent } from 'src/app/ward/diet-counselling/diet-counselling.component';
import { BradenScaleComponent } from '../braden-scale/braden-scale.component';
import { TemplatesLandingComponent } from 'src/app/templates/templates-landing/templates-landing.component';
import { FallRiskAssessmentComponent } from '../fall-risk-assessment/fall-risk-assessment.component';
import { CardiologyAssessmentComponent } from 'src/app/portal/cardiology-assessment/cardiology-assessment.component';
import { AnesthesiaAssessmentComponent } from 'src/app/portal/anesthesia-assessment/anesthesia-assessment.component';
import { MedicalAssessmentComponent } from 'src/app/portal/medical-assessment/medical-assessment.component';
import { MedicalAssessmentPediaComponent } from 'src/app/portal/medical-assessment-pedia/medical-assessment-pedia.component';
import { MedicalAssessmentObstericComponent } from 'src/app/portal/medical-assessment-obsteric/medical-assessment-obsteric.component';
import { MedicalAssessmentSurgicalComponent } from 'src/app/portal/medical-assessment-surgical/medical-assessment-surgical.component';
import { GeneralconsentComponent } from 'src/app/portal/generalconsent/generalconsent.component';
import { ConsentMedicalComponent } from 'src/app/portal/consent-medical/consent-medical.component';
import { ConsentHroComponent } from 'src/app/portal/consent-hro/consent-hro.component';
import { PatientAssessmentToolComponent } from 'src/app/ward/patient-assessment-tool/patient-assessment-tool.component';
import { SurgicalSafetyChecklistComponent } from 'src/app/ot/surgical-safety-checklist/surgical-safety-checklist.component';
import { OrNursesComponent } from 'src/app/ot/or-nurses/or-nurses.component';
import { SurgeryrecordComponent } from 'src/app/ot/surgeryrecord/surgeryrecord.component';
import { OtSurgerynotesComponent } from 'src/app/ot/ot-surgerynotes/ot-surgerynotes.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { cloneDeep } from 'lodash';
import { links } from './patientfolder.utils';
import { ConfigService } from 'src/app/services/config.service';
import { PhysiotherapyResultentryComponent } from 'src/app/suit/physiotherapy-resultentry/physiotherapy-resultentry.component';
import { PediaFallriskAssessmentComponent } from '../pedia-fallrisk-assessment/pedia-fallrisk-assessment.component';
import { SuitConfigService } from 'src/app/suit/services/suitconfig.service';
import { ConfigService as WardConfig } from 'src/app/ward/services/config.service';
import { PrintService } from '../print.service';
import { labresultentry } from 'src/app/suit/lab-resultentry/lab-resultentry.component';
import { CarePlanComponent } from 'src/app/ward/care-plan/care-plan.component';


declare var $: any;
declare function openPACS(test: any, hospId: any, patientId: any): any;

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
  selector: 'app-patientfolder',
  templateUrl: './patientfolder.component.html',
  styleUrls: ['./patientfolder.component.scss'],
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
export class PatientfolderComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() readonly: any = false;
  @ViewChild('divprint') divprint!: ElementRef;
  @ViewChild('timeSlotsContainer', { static: true }) timeSlotsContainer!: ElementRef;
  @ViewChild('diagnosis', { static: true }) diagnosis!: ElementRef;
  @ViewChild('vitals', { static: true }) vitals!: ElementRef;
  @ViewChild('investigations', { static: true }) investigations!: ElementRef;
  @ViewChild('medications', { static: true }) medications!: ElementRef;
  @ViewChild('procedures', { static: true }) procedures!: ElementRef;
  @ViewChild('surgeryrequests', { static: true }) surgeryrequests!: ElementRef;
  @ViewChild('bloodrequests', { static: true }) bloodrequests!: ElementRef;
  @ViewChild('assessments', { static: true }) assessments!: ElementRef;
  @ViewChild('progressnotes', { static: true }) progressnotes!: ElementRef;
  @ViewChild('nursinginstructions', { static: true }) nursinginstructions!: ElementRef;
  @ViewChild('careplan', { static: true }) careplan!: ElementRef;
  @ViewChild('intakeoutput', { static: true }) intakeoutput!: ElementRef;

  charAreaSpline!: Highcharts.Chart
  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;
  @ViewChild('chartLineAreaSpline', { static: true }) chartLineAreaSpline!: ElementRef;
  @ViewChild('chartLineSpline', { static: true }) chartLineSpline!: ElementRef;
  @ViewChild('chartLine', { static: true }) chartLine!: ElementRef;
  @ViewChild('chartColumn', { static: true }) chartColumn!: ElementRef;
  medSearchText: string = ''; 
  eformsSearchText: string = '';
  assessmentSearchText: string = '';
  @ViewChild('labTestDiv', { static: false }) labTestDiv!: ElementRef;
  number = Number;
  isAreaSplineActive: boolean = false;
  sectionDataCount = 0;
  isSplineActive: boolean = true;
  isLineActive: boolean = false;
  isColumnActive: boolean = false;
  isViewMoreData = false;
  url: any;
  pinfo: any;
  patientFolderForm!: FormGroup;
  patientVisits: any = [];
  episodeId: any;
  PatientDiagnosisList: any;
  PatientDiagnosisListViewMore: any;
  PatientViewMoreSearchDiagnosisList: any = [];
  PatientInvestigationsList: any;
  PatientInvestigationsListViewMore: any;
  PatientRadiologyList: any;
  PatientRadiologyListViewMore: any;
  PatientProceduresList: any;
  PatientProceduresListViewMore: any;
  PatientsVitalsList: any;
  PatientsVitalsListViewMore: any;
  PatientsAssessmentsList: any;
  PatientsAssessmentsListViewMore: any;
  PatientType: any;
  PatientID: any;
  PatientMedicationsList: any;
  PatientMedicationsListViewMore: any;
  patientdata: any;
  bpSystolic: string = "";
  bpSysVal: string = "";
  bpDiastolic: string = "";
  bpDiaVal: string = "";
  temperature: string = "";
  tempVal: string = "";
  pulse: string = "";
  pulseVal: string = "";
  spo2: string = "";
  respiration: string = "";
  consciousness: string = "";
  o2FlowRate: string = "";
  serviceType = 'investigations';
  patientActiveMedicationList: any;
  patientActiveMedicationListViewMore: any;
  patientInActiveMedicationList: any;
  patientInActiveMedicationListViewMore: any;
  vitalsDatetime: any;
  medicationType = 'active';
  servicesCount = 0;
  FetchBloodRequestDataaList: any;
  FetchBloodRequestDataaListViewMore: any;
  FetchAllSurgeriesDataList: any;
  FetchAllSurgeriesDataListViewMore: any;
  FetchEFormsDataaList: any;
  FetchEFormsDataaListViewMore: any;
  FilteredFetchMainProgressNoteDataList: any;
  FetchMainProgressNoteDataList: any;
  FetchMainProgressNoteDataListViewMore: any;
  FetchNursingInstructionsDataaList: any;
  FetchNursingInstructionsDataaListViewMore: any;
  FetchCarePlanDataaList: any;
  FetchCarePlanDataaListViewMore: any;
  FetchInTakeOutPutDataaList: any;
  FetchInTakeOutPutDataaListViewMore: any;
  viewMoreForm!: FormGroup;
  viewMoreData: any[] = [];
  viewMoreData1: any = [];
  viewMoreDataHeaders: any = [];
  viewMoreType: string = "";
  viewMoreTypeHeader: string = "";
  sectionLocation: string = "";
  facility: any;
  IsDiagnosisMore = false;
  toDate = new FormControl(new Date());
  tableVitalsForm!: FormGroup;
  filterDataForm!: FormGroup;
  filterlocation: string = '0';
  PatientViewMoreSearchCareList: any = [];
  PatientViewMoreSearchNoteList: any = [];
  PatientViewMoreSearchMedicationsList: any;
  PatientViewMoreSearchMedicationsList1: any;
  PatientViewMoreSearchLabList: any;
  PatientViewMoreSearcheFormList: any = [];
  PatientViewMoreSearchNursingList: any = [];
  PatientViewMoreSearchInTakeOutPutList: any = [];
  PatientViewMoreSearchBloodList: any = [];
  IsCareMore = false;
  IseFormMore = false;
  IsNursingMore = false;
  IsBloodMore = false;
  IsDrugAdmChartMore = false;
  IsSurgeryRecordViewMore = false;
  IsInTakeOutMore = false;
  IsMedicationMore = false;
  IsProcedureMore = false;
  IsNoteMore = false;
  IsBathViewMore = false;
  IsBedSideViewMore = false;
  IsShiftHandoverViewMore = false;
  tableVitalsList: any;
  tableVitalsListFiltered: any;
  FetchEFormSelectedDataaList: any = [];
  btnActive: string = "btn selected";
  btnInactive: string = "btn";
  medStatus: string = "active";
  btnActiveMed: string = "btn btn-select btn-tab";
  btnInActiveMed: string = "btn btn-tab";
  displayActMed: string = "block";
  displayInActMed: string = "none";
  PatientProceduresFilterViewMoreList: any;
  activeButton: string = 'spline';
  viewMoreDiagnosisForm!: FormGroup;
  viewMoreProceduresForm!: FormGroup;
  viewMoreMedicationsForm!: FormGroup;
  interval: any;
  currentdateN: any;
  currentTimeN: Date = new Date();
  location: any;
  IsHome: any;
  @Input() InputHome: any = true;
  fromBedsBoard = false;
  fromDoctorDashboard: boolean = false;
  fromOtDashboard = false;
  fromIVDashboard = false;
  fromAdmissionRequest = false;
  fromIDDashboard = false;
  noPatientSelected = false;
  SelectedViewClass: any;
  isdetailShow = false;
  PatientViewMoreMedicationsList: any;
  activeMedicationCount: any;
  inactiveMedicationCount: any;
  medicationsCount: any;
  SummaryfromCasesheet = 'false';
  remarksSelectedIndex: number = -1;
  remarksForSelectedHoldItemName: any;
  remarksForSelectedHoldItemId: any;
  remarksForSelectedHoldPrescId: any;
  holdReasonValidation: boolean = false;
  selectedHoldReason: string = "0";
  holdBtnName: string = 'Hold';
  holdMasterList: any = [];
  remarksForSelectedDiscontinuedItemId: any;
  remarksForSelectedDiscontinuedPrescId: any;
  remarksForSelectedDiscontinuedItemName: any;
  trustedUrl: any;
  currentDate: any = new Date();
  firstDayOfWeek!: Date;
  lastDayOfWeek!: Date;
  currentWeekdate: any;
  currentWeekDates: any;
  calendarMedications: any = [];
  calendarFilteredMedications: any = [];
  timeSlots: string[] = [];
  dateArray!: any[];
  listOfDates!: any[];
  selectedDate: any = {};
  IsHeadNurse: any;
  surgeryRequests: any = [];
  resourceDetails: any = [];
  surgeryActivities: any = [];
  anesthetiaTypeList: any = [];
  positioningData: any = [];
  positioningDevicesData: any = [];
  surgeonDetails: any;
  sickLeaveData: any = [];
  medicalCertificateData: any = [];
  dischargeSummaryData: any;
  FetchPatientBathSideCareFromDataaList: any = [];
  FetchPatientBathSideCareFromDataaListViewMore: any = [];
  FetchPatientBedSideCareFromDataaList: any = [];
  FetchPatientBedSideCareFromDataaListViewMore: any = [];
  FetchPatientHandOverformDataaList: any = [];
  FetchPatientHandOverformDataaListViewMore: any = [];
  isResultAreaSplineActive: boolean = false
  isResultSplineActive: boolean = true;
  isResultLineActive: boolean = true;
  isResultcolumnActive: boolean = true;
  activeResultButton: string = 'Spline'
  testGraphsData: any;
  visitID: any;
  fromDate: any;
  drugadmChartViewForm!: FormGroup;
  dateRangeValidation = false;
  surgeryNotesForm!: FormGroup;
  patientDiagnosis: any = [];
  showSurgeryNotes = false;
  vteAssessmentType = 'med';
  motherSsn: string = "";
  childSsn: string = "";
  FetchDietRequisitionDataList: any;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  drugDataArray: any[] = [];
  drugs: any[] = [];
  FetchBradenScaleViewDataList: any;
  FetchBradenScaleSelctedViewDataList: any;
  tableSummaryForm!: FormGroup;
  gridData: any[] = [];
  summaryData: any[] = [];
  listOfUOM: any = [];
  listofUoms: any = [];
  SucessMsg:any = [];
  totalIntakeQty: string = "";
  totalOutputQty: string = "";
  balanceQty: string = "";
  admissionGeneralConsent: any = [];
  FetchPatAdmMedicalInfConsentDataList: any = [];
  FetchPatadmAgaintDataList: any = [];
  painAssessmentWorklist: any = [];
  showPhysioResult: boolean = false;
  painAssessmentWorklistDetails: any = [];
  assessmentContent: string = "";

  EffectiveDate: any;
  Blocktype: any;
  Blockreason: any;
  Discription: any;
  
  selectedOptions: string = '0';
  reportName: string = "Cardiology Report";
  assessmentContenthtml!: SafeHtml;
  carouselOptions: OwlOptions = {
    loop: false,
    mouseDrag: false,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    margin: 10,
    navSpeed: 200,
    startPosition: 1,
    // autoWidth: true,
    responsive: {
      0: {
        items: 1
      },
      940: {
        items: 12
      },
      1500: {
        items: 15
      }
    },

    navText: ['', ''],
    nav: true
  }
  sickleavePdfDetails: any;
  medcertPdfDetails: any;
  data: any;
  dataToFilter: any;
  distinctSpecialisations: any = [];
  selectedReport: any;
  patientDetails: any;
  labReportPdfDetails: any;
  labReportDocPdfDetails: any;
  allResults: string = "btn selected";
  panicResults: string = "btn";
  abnormalResults: string = "btn";
  showLabTest: boolean = false;
  IsTab: any = 'L';
  radiologyPdfDetails: any;
  savedSurgeryNotes: any;
  base64StringSig1 = '';
  showSignature = false;
  savedRiskAssessmentDetails: any;
  savedSurgicalRiskAssessmentDetails: any;
  FetchPatientFinalObgVTEFromPatDataList: any;
  motherDetails: any;
  bedSideitems: any;
  bathingCareitems: any;
  viewMedCertificatesList: any;
  PatientEndoTotalRequestDataList: any;
  bradenScaleForm: any;
  painAssessmentForm: any;
  SavedChiefComplaints: any;
  emrNurseChiefComplaint: any;
  emrNursePhysicalExamination: any;
  ChiefExaminationID: number = 0;
  assessmentsDetails: any = [];
  consentFromTypes = 'generalconsent';
  fromSuitPage = false;
  FetchPatientFolderReasonsDataList: any = [];
  selectedReasonValue: any = 0;
  isSSNEnter: boolean = false;
  isShowModal: boolean = false;
  patientFolderSurgeryId: any;
  modalTitle: string = '';
  modalType: string = '';
  filteredLinks: any[] = [];
  fromPatients: boolean = false;
  selectedOption: string = 'All';
  visitAdmissionId: string = "0";
  labresult: any;
  radresult: any;
  radworklist: boolean = false;
  investigationData: any;
  physiotherapyResults: any;
  invFilter: boolean = false;
  isssnfromothersource = false;
  ssnfromothersource = "";
  selectedSection: any;
  oldChiefcomplaints: any;

  cardiologyContentHTML: any = '';
  showContent: boolean = false;
  FetchPhysiotherapyAssessmentSectionsDataList: any = [];
  FetchPhysiotherapyAssessmentSectionsGoalsDataList: any = [];
  FetchPhysiotherapyAssessmentSectionsTreatmentDataList: any = [];
  PatientPhyAssessmentOrderID: any = 0;
  selectedPainScoreId = "0";
  phyWorklist: boolean;
  selectedPatientData: any = {};
  selectedPatientLabData: any = {};
  showPanicForm: boolean = false;
  readBackDate: string = "";
  IsReadBack: boolean = false;
  successMessage: string = "";
  savedPatientPanicResultReportingDetails: any = [];
  selectedInformedByEmpDetails: any[] = [];
  selectedInformedToEmpDetails: any[] = [];
  informedToList: any;
  showAllergydiv: boolean = false;
  panicabnormalresults: any = [];
  currentdate: any;

  constructor(private service: PatientfolderService, private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private datePipe: DatePipe,private utilityService: UtilityService,
    private modalService: GenericModalBuilder, private changeDetectorRef: ChangeDetectorRef, private sanitizer: DomSanitizer, private presconfig: ConfigService, private suitconfig: SuitConfigService, private printService: PrintService, private wardConfig: WardConfig) {
    super();
    const ssnfromothersource = sessionStorage.getItem("ssnfromothersource");
    if (ssnfromothersource) {
      this.isssnfromothersource = true;
      this.ssnfromothersource = ssnfromothersource;
      $("#txtSsn").val(this.ssnfromothersource);
      this.fetchPatientDetails(this.ssnfromothersource, "0", "0");
    }
    this.PatientID = sessionStorage.getItem("PatientID");
    this.SummaryfromCasesheet = sessionStorage.getItem("SummaryfromCasesheet") || 'false';
    this.fromSuitPage = sessionStorage.getItem("fromSuitPage") === "true" ? true : false;
    this.fromOtDashboard = sessionStorage.getItem("fromOtDashboard") === "true" ? true : false;
    this.fromIVDashboard = sessionStorage.getItem("fromIVDashboard") === "true" ? true : false;
    this.fromAdmissionRequest = sessionStorage.getItem("fromAdmissionRequest") === "true" ? true : false;
    this.fromIDDashboard = sessionStorage.getItem("fromIDDashboard") === "true" ? true : false;
    this.fromDoctorDashboard = sessionStorage.getItem("fromDoctorDashboard") === "true" ? true : false;
    this.labresult = sessionStorage.getItem("labresult") === "true" ? true : false;
    this.radresult = sessionStorage.getItem("radresult") === "true" ? true : false;
    this.radworklist = sessionStorage.getItem("radworklist") === "true" ? true : false;
    this.phyWorklist = sessionStorage.getItem('FromPhysioTherapyWorklist') === "true" ? true : false;
    sessionStorage.removeItem('FromPhysioTherapyWorklist');
    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");

    if (this.PatientID !== undefined && this.PatientID !== '' && this.PatientID !== null)
      this.fromBedsBoard = true;
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    if (this.PatientID == '' || this.PatientID == null)
      this.PatientID = this.selectedView.PatientID;
    this.patientFolderForm = this.formBuilder.group({
      VisitID: ['0']
    });

    let toDateFilter = new Date();
    let fromDateFilter = new Date(toDateFilter);
    fromDateFilter.setMonth(toDateFilter.getMonth() - 6);

    this.filterDataForm = this.formBuilder.group({
      fromdate: fromDateFilter,
      todate: toDateFilter,
      location: ['0'],
      searchitem: ['0']
    });

    this.viewMoreForm = this.formBuilder.group({
      fromdate: [''],
      todate: ['']
    });

    this.tableVitalsForm = this.formBuilder.group({
      vitalFromDate: [''],
      vitalToDate: [''],
    });
    var d = new Date();
    var vm = new Date();
    vm.setMonth(vm.getMonth() - 1);
    this.tableVitalsForm.patchValue({
      vitalFromDate: vm,
      vitalToDate: d
    });

    this.viewMoreProceduresForm = this.formBuilder.group({
      procfromdate: [''],
      proctodate: ['']
    });

    this.viewMoreDiagnosisForm = this.formBuilder.group({
      fromdate: [''],
      todate: ['']
    });

    this.viewMoreMedicationsForm = this.formBuilder.group({
      medfromdate: [''],
      medtodate: ['']
    });

    this.drugadmChartViewForm = this.formBuilder.group({
      fromdate: new Date(),
      todate: new Date(new Date().setDate(new Date().getDate() + 17))
    });

    this.bradenScaleForm = this.formBuilder.group({
      fromdate: vm,
      todate: d
    });

    this.painAssessmentForm = this.formBuilder.group({
      fromdate: d,
      todate: d
    });

    this.surgeryNotesForm = this.formBuilder.group({
      SurgeryNoteID: ['0'],
      PatientID: [''],
      Admissionid: [''],
      SurgeryRequestID: [''],
      Surgeon: [''],
      Anesthesia: [''],
      CirculatingNurse: [''],
      Assistant: [''],
      PreOpDiagnosis: [''],
      PostOpDiagnosis: [''],
      TimeProcedureStarted: [''],
      ScrubNurse: [''],
      Ended: [''],
      CorrectPatient: ['2'],
      CorrectOperation: ['2'],
      CorrectSiteDone: ['2'],
      AntibioticAs: ['2'],
      Prophylaxis: ['2'],
      Treatment: ['2'],
      OperationPerformed: [''],
      Grade: ['2'],
      Type: ['1'],
      IncisionPorts: [''],
      Findings: [''],
      Procedure: [''],
      Closure: [''],
      Drains: [''],
      ExpectedBloodLoss: [''],
      BloodTransfusion: ['2'],
      Complications: [''],
      Bleeding: ['2'],
      InjuryDuringSurgery: ['2'],
      Death: ['2'],
      ExtendedSurgery: ['2'],
      ChangeSurgery: ['2'],
      None: ['2'],
      XRayClosure: ['2'],
      AnyprosthesisUsedWithSerialNo: [''],
      SwabsinstrumentsCountComplete: [''],
      ConfirmationOfProcedure: ['2'],
      AnyConcern: ['2'],
      SpecimenSmall: ['2'],
      SpecimenMedium: ['2'],
      SpecimenLarge: ['2'],
      SpecimenQuantity: ['2'],
      SpecimenNone: ['2'],
      StableCondition: [''],
      PostOperativeinstructions: [''],
      DoctorName: [''],
      DoctorNo: [''],
      Date: moment(new Date()).format('DD-MMM-YYYY'),
      DoctorSignature: [''],
      HospitalID: [''],
      USERID: [''],
      WorkStationId: [''],
      Blocked: [''],
      Status: [''],
      Enddate: [''],
      Createdate: [''],
      Moddate: ['']
    });

    this.tableSummaryForm = this.formBuilder.group({
      SummaryFromDate: [''],
      SummaryToDate: [''],
    });
    var wm = new Date();
    var d = new Date();
    wm.setMonth(wm.getMonth() - 1);
    this.tableSummaryForm.patchValue({
      SummaryFromDate: d,
      SummaryToDate: d
    })

    this.filteredLinks = cloneDeep(links);
  }
  @HostListener('window:beforeunload', ['$event'])
  unloadEvent($event: any): void {
    sessionStorage.removeItem('selectedView');
  }

  ngOnInit() {
    const storedValue = sessionStorage.getItem("FromPatients");
    this.fromPatients = storedValue === "true";
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY H:mm');
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.location = sessionStorage.getItem("locationName");
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    // this.IsHome = this.InputHome;
    this.fetchPatientVisits();
    // this.getPatientAlert();
    if (this.selectedView.PatientType == "2") {
      if(this.selectedView.Bed!=undefined){
        if (this.selectedView?.Bed.includes('ISO'))
          this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
        else
          this.SelectedViewClass = "m-0 fw-bold alert_animate token";
      } else
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
     
    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }
    this.FetchPatientFolderReasons();

    if (this.data) {
      this.readonly = this.data.readonly;
    }
  }

  // selectOption(option: string) {
  //   this.selectedOption = option;
  //   this.FilteredFetchMainProgressNoteDataList = [];
  //   let filteredData: any[] = [];
  //   if (option === "All") {
  //     filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList));
  //   } else if (option === "Doctor") {
  //     filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList.filter((x: any) => x?.NoteTypeID === "3")));
  //   } else if (option === "Nurse") {
  //     filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList.filter((x: any) => x?.NoteTypeID === "1")));
  //   } else {
  //     filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList.filter((x: any) => x?.NoteTypeID === "0")));
  //   }
  //   this.FilteredFetchMainProgressNoteDataList = filteredData;
  // }
  
  onItemActionsChange(event: any) {
    const selectedValue = event.target.value;
    this.selectOptionN(selectedValue);
  }
   
  selectOptionN(option: string) {
    this.FilteredFetchMainProgressNoteDataList = [];
    var filteredData: any[] = [];
    this.selectedOptions = option;
    if (option === "0") {
      filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList));
    }  else if (option === "1") {
      filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList.filter((x: any) => x?.NoteTypeID === "1")));
    } else if (option === "2") {
      filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList.filter((x: any) => x?.NoteTypeID === "2")));
    }else if (option === "3") {
      filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList.filter((x: any) => x?.NoteTypeID === "3")));
    }else if (option === "4") {
      filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList.filter((x: any) => x?.NoteTypeID === "4")));
    } else if (option === "5") {
      filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList.filter((x: any) => x?.NoteTypeID === "5")));
    } else if (option === "6") {
      filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList.filter((x: any) => x?.NoteTypeID === "6")));
    } else if (option === "7") {
      filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList.filter((x: any) => x?.NoteTypeID === "7")));
    } else if (option === "8") {
      filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList.filter((x: any) => x?.NoteTypeID === "8")));
    } else if (option === "9") {
      filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList.filter((x: any) => x?.NoteTypeID === "9")));
    } 
    else {
      filteredData = JSON.parse(JSON.stringify(this.FetchMainProgressNoteDataList.filter((x: any) => x?.NoteTypeID === "0")));
    }
    const distinctThings = filteredData.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.NoteDate === thing.NoteDate) === i);
    this.FilteredFetchMainProgressNoteDataList = distinctThings;
    
  }

  linkClick(item: any) {
    this.selectedSection = item;
    // if (item.header === 'Diagnosis' || item.header === 'Vitals' || item.header === 'Medications' || item.header === 'Investigations & Radiology' || item.header === 'Surgery Requests') {
    //   this.patientFolderForm.patchValue({
    //     VisitID: 0
    //   });
    //   this.visitAdmissionId = '0';
    // }
    // else {
    //   // this.patientFolderForm.patchValue({
    //   //   VisitID: this.patientVisits[0]?.VisitID
    //   // });
    //   this.visitAdmissionId = this.patientVisits[0]?.VisitID;
    //   this.visitDataLoad(this.patientVisits[0]?.AdmissionID);
    // }

    if (!item.method) {
      this.scrollTo(item.scrollName, item.scrollValue)
    } else {
      (this as any)[item.method]();
    }
  }

  filterLinks(event: any) {
    this.filteredLinks = cloneDeep(links).filter((link: any) =>
      link.title.toLowerCase().includes(event.target.value.toLowerCase().trim())
    );
  }

  FetchPatientFolderReasons() {
    const url = this.service.getData(patientfolder.FetchPatientFolderReasons, {
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.doctorDetails[0]?.FacilityId,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });

    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatientFolderReasonsDataList = response.FetchPatientFolderReasonsDataList
        }
      },
        (err) => {

        });
  }

  onResonSelection() {
    if (this.selectedReasonValue == "0") {
      this.selectedReasonValue = 0;
      return;
    }
    const payload = {
      "PatientID": this.PatientID,
      "ReasonID": this.selectedReasonValue,
      "UserID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      "WorkStationID": this.doctorDetails[0]?.FacilityId,
      "Hospitalid": this.hospitalID ?? this.service.param.HospitalID
    }
    this.us.post(patientfolder.SavePatientFolderViewLogging, payload).subscribe((response) => {
      if (response.Code == 200) {
        this.isSSNEnter = false;
        this.noPatientSelected = true;
        $('#patientFolderReasonModal').modal('hide');
        this.showContent = true;
      }
    },
      (err) => {
        console.log(err)
      });
  }

  ngOnDestroy(): void {
    sessionStorage.setItem("SummaryfromCasesheet", "false");
    sessionStorage.setItem("PatientID", "");
    sessionStorage.setItem("FromPatients", String(false));

    if (this.ssnfromothersource) {
      sessionStorage.removeItem("FacilityID");
      sessionStorage.removeItem("ssnfromothersource");
      sessionStorage.removeItem("doctorDetails");
      sessionStorage.removeItem("hospitalId");
      sessionStorage.removeItem("isLoggedIn");
    }

  }

  isdetailShows() {
    this.isdetailShow = true;
    if (this.isdetailShow = true) {
      $('.patient_card').addClass('maximum')
    }
  }
  isdetailHide() {
    this.isdetailShow = false;
    if (this.isdetailShow === false) {
      $('.patient_card').removeClass('maximum')
    }
  }
  GoBackToHome() {
    this.router.navigate(['/login/doctor-home'])
  }
  // getPatientAlert() {
  //   this.us.getPatientAlert(this.selectedView.PatientID);
  // }
  onLogout() {
    let isLoggedIn = "isLoggedIn";

    sessionStorage.removeItem(isLoggedIn);
    sessionStorage.removeItem("doctorDetails");
    sessionStorage.removeItem("IsHeadNurse");
    sessionStorage.clear()
    localStorage.clear();
    this.router.navigate(['/login'])
  }
  onEnterPress(event: any) {
    event.preventDefault();
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.fetchPatientDetailsBySsn(event);
    }
  }

  fetchPatientDetailsBySsn(event: any) {
    var inputval = event.target.value;
    var ssn = "0"; var mobileno = "0"; var patientid = "0";
    if (inputval.charAt(0) === "0") {
      ssn = "0";
      mobileno = inputval;
      patientid = "0";
    }
    else {
      ssn = inputval;
      mobileno = "0";
      patientid = "0";
    }
    this.isSSNEnter = true;
    this.noPatientSelected = false;
    this.fetchPatientDetails(ssn, mobileno, patientid);
  }

  fetchPatientDetails(ssn: string, mobileno: string, patientId: string) {
    this.url = this.service.getData(patientfolder.fetchPatientDataBySsn, {
      SSN: ssn,
      MobileNO: mobileno,
      //PatientID: patientId,     
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.doctorDetails[0]?.FacilityId,//this.facilitySessionId==undefined?this.doctorDetails[0]?.FacilityId:this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (ssn === '0') {
            this.PatientID = response.FetchPatientDependCLists[0].PatientID;
            this.selectedView = response.FetchPatientDependCLists[0];
          }
          else if (mobileno === '0') {
            this.PatientID = response.FetchPatientDataCCList[0].PatientID;
            this.selectedView = response.FetchPatientDataCCList[0];
this.Blocktype=response.FetchPatientDataCCList[0].Blocktype;
this.Blockreason=response.FetchPatientDataCCList[0].Blockreason;
this.Discription=response.FetchPatientDataCCList[0].Discription;
this.EffectiveDate=response.FetchPatientDataCCList[0].EffectiveDate;
          }
          this.utilityService.setAlertPatientId(this.PatientID);
          this.fetchPatientVisits();
          if (this.isSSNEnter || (this.doctorDetails[0].IsDoctor === false && this.doctorDetails[0].IsRODoctor === false)) {
            this.selectedReasonValue = 0;
          } else {
            this.noPatientSelected = true;
          }
        }
      },
        (err) => {

        })
  }

  fetchPatientVisits() {
    this.url = this.service.getData(patientfolder.FetchPatientVisits, { Patientid: this.PatientID == "" ? this.patientDetails.PatientId : this.PatientID, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientVisits = response.PatientVisitsDataList;
          var admid = 0;
          if (this.fromOtDashboard)
            admid = this.selectedView.AdmissionID;
          else
            admid = this.selectedView.AdmissionID == undefined ? this.selectedView.IPAdmissionID : this.selectedView.AdmissionID;
          if (this.fromBedsBoard) {
            this.patientFolderForm.get('VisitID')?.setValue(admid);
            this.noPatientSelected = true;
          }
          else {
            admid = response.PatientVisitsDataList[0].AdmissionID;
            this.patientFolderForm.get('VisitID')?.setValue(admid);
          }
          //this.episodeId = response.PatientVisitsDataList[0].EpisodeID;
          if (this.isSSNEnter || (this.doctorDetails[0].IsDoctor === false && this.doctorDetails[0].IsRODoctor === false)) {
            this.selectedReasonValue = 0
            $('#patientFolderReasonModal').modal('show');
          } else {
            this.showContent = true;
          }
          setTimeout(() => {
            if (this.labresult || this.radresult || this.radworklist || this.phyWorklist) {
              admid = this.patientDetails.IPID;
            }
            this.visitChange(admid);
          }, 1000);
        }
      },
        (err) => {
        })
  }
  startClock(): void {
    this.interval = setInterval(() => {
      this.currentTimeN = new Date();
    }, 1000);
  }
  onVisitsChange(event: any) {
    this.admissionID = event.target.value;
    this.visitAdmissionId = event.target.value;
    this.visitChange(event.target.value);
  }
  visitChange(admissionId: any) {
    this.admissionID = admissionId;
    this.patientdata = this.patientVisits.find((visit: any) => visit.AdmissionID == admissionId);
    this.episodeId = this.patientdata?.EpisodeID;
    this.PatientType = this.patientdata?.PatientType;

    // this.fetchPatientSummary('');
    this.fetchPatientVistitInfo(admissionId, this.patientdata.PatientID);
    //this.FetchPatientFileData();
    // this.FetchPatientMedication();
    // this.fetchSSurgeries();
    // this.fetchBloodRequests();
    // this.fetchEForms();
    // this.fetchMainProgressNote();
    // this.fetchNursingInstructions();
    // this.fetchCarePlan();
    //this.fetchInTakeOutPut();
    //this.fetchPatientSickLeave();
    //this.fetchPatientMedicalCertificate();
    this.fetchMotherDetails(this.patientdata.PatientID);
  }

  fetchMotherDetails(patientid: string) {
    this.url = this.service.getData(patientfolder.FetchAdmittedMotherDetails, {
      ChildPatientID: patientid,
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility == undefined ? this.doctorDetails[0]?.FacilityId : this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.motherDetails = response.FetchAdmittedChildDetailsListD[0];
        }
      },
        (err) => {

        })
  }

  openMotherSsnDetails(motherDet: any) {
    $("#txtSsn").val(motherDet.MotherSSN);
    this.childSsn = motherDet.ChildSSN;
    this.fetchPatientDetails(motherDet.MotherSSN, "0", "0");
  }

  openChildSsnDetails(ssn: string) {
    this.motherDetails = [];
    this.fetchPatientDetails(ssn, "0", "0");
  }

  fetchPatientVistitInfo(admissionid: any, patientid: any) {
    this.url = this.service.getData(patientfolder.FetchPatientVistitInfo, { Patientid: patientid, Admissionid: admissionid, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedView = response.FetchPatientVistitInfoDataList[0];
          //this.FetchPatientMedication();
          const ccSectionItem = this.filteredLinks.find((x:any) => x.scrollName === 'chiefcomplaints');
          this.linkClick(ccSectionItem);
          // this.scrollTo('vitals', '');
        }
        if (this.selectedView.PatientType == "2") {
          if (this.selectedView?.Bed.includes('ISO'))
            this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
          else
            this.SelectedViewClass = "m-0 fw-bold alert_animate token";
        } else {
          this.SelectedViewClass = "m-0 fw-bold alert_animate token";
        }
      },
        (err) => {

        })
  }
  fetchPatientHandOverform(admissionid: any, patientid: any) {
    this.url = this.service.getData(patientfolder.fetchPatientHandOverform, { Admissionid: admissionid, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatientHandOverformDataaList = response.FetchPatientHandOverformDataaList;
        }
      },
        (err) => {

        })
  }

  fetchPatientHandOverformPDF(ID: any) {

    this.url = this.service.getData(patientfolder.fetchPatientHandOverform, {
      HandOverformID: ID,
      Admissionid: this.selectedView.AdmissionID, HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.fetchPatientHandOverformPDFD(ID, response.FetchPatientHandOverformDataaList[0].Strpath);
        }
      },
        (err) => {

        })
  }

  fetchPatientHandOverformPDFD(ID: any, strpath: any) {
    this.url = this.service.getData(patientfolder.FetchPatientHandOverformPDFD, {
      HandOverformID: ID,
      Admissionid: this.selectedView.AdmissionID,
      strpath: strpath,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          $("#requestModal").modal('hide');
          this.showModal();
        }
      },
        (err) => {

        });
  }

  fetchPatientSummary(tbl: string, section: string) {
    if (tbl != ''&&tbl != '11') {
      var facid = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
      if (this.SummaryfromCasesheet === 'true' && facid === undefined) {
        facid = this.facility;
      }
      this.url = this.service.getData(patientfolder.FetchPatientSummary, {
        Admissionid: this.visitAdmissionId, PatientId: this.PatientID, TBL: tbl, WorkStationID: facid, HospitalID: this.hospitalID
      });     
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.assignData(tbl, response);
          }
        },
          (err) => {

          })
    }
    else if (section === 'procedures') {
      this.viewMoreData = [];   
      this.viewMoreTypeHeader = "Procedures";  
     this.url = this.service.getData(patientfolder.FetchPatientAdmissionInvestigationsAndProcedures, {
      UHID: this.patientdata.RegCode, Admissionid: this.admissionID,WorkStationID: this.wardID, HospitalID: this.hospitalID
    });

    this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {       
            this.viewMoreData = [];
              this.viewMoreTypeHeader = "Procedures";
              const procs = response.InvestigationsProceduresDataPFList.filter((x: any) => x.ServiceId === '5');        
              procs.forEach((element: any, index: any) => {
                this.viewMoreData.push({
                  "Type": element.ServiceName,
                  "Name": element.ItemCode + '-' + element.ItemName,
                  "Specialisation": element.Specialisation,
                  "Date": moment(element.PrescriptionDate).format('DD-MMM-YYYY HH:MM'),
                  "TestOrderID" : element.TestOrderID,
                  "TestOrderItemID" : element.TestOrderItemID,
                  "SpecialiseID" : element.SpecialiseID,
                  "PrescriptionID" : element.PrescriptionID,
                  "ItemID" : element.ItemID,
                  "ResultStatus" : element.ResultStatus,
                  "ResultStatusName" : element.ResultStatusName,
                  "admissionid" : element.admissionid,
                  "ResultEnteredDate" : element.ResultEnteredDate,
                  "ResultEnteredBy" : element.ResultEnteredBy,
                })
              });
              this.viewMoreData = this.viewMoreData.sort((a: any, b: any) => new Date(a.PrescriptionDate).getDate() - new Date(b.PrescriptionDate).getDate());
              if (procs.length > 0) {
                this.sectionLocation = response.PatientDiseasesDataList[0]?.HospitalName;
              }
              else {
                this.sectionLocation = "";
              }
          }
        },
          (err) => {

          })
    
    }
    else if (section === 'vitals') {
      this.viewMoreTypeHeader = "Vitals";
      this.GetVitalsData();
    }
    else if (section === 'investigations') {
      this.viewMoreTypeHeader = "Investigations & Radiology";
      this.ActiveTab('L');
      //this.fetchLabOrderResults();
    }
    else if (section === 'medications') {
      this.FetchPatientMedication();
    }
    else if (section === 'CaseRecord') {    
      this.FetchPatientCaseRecord();
    }
    
    else if (section == 'surgeryrequests') {
      this.viewMoreTypeHeader = "Surgery Requests";
      this.fetchSSurgeries();
    }
    else if (section == 'progressnotes') {
      this.viewMoreTypeHeader = "Progress Notes";
      var d = new Date(this.patientdata.AdmitDate);
      this.viewMoreDiagnosisForm.patchValue({
        fromdate: d,
        todate: new Date()
      })
      this.fetchMainProgressNote();
    }
    else if (section == 'nursinginstructions') {
      this.viewMoreTypeHeader = "Nursing Instructions";
      this.fetchNursingInstructions();
    }
    else if (section == 'intakeoutput') {
      this.viewMoreTypeHeader = "Intake Output";
      this.fetchSummaryData();
    }
    else if (section == 'careplan') {
      this.viewMoreTypeHeader = "Care Plan";
      this.fetchCarePlan();
    }
    else if (section == 'medicalcertificate') {
      this.viewMoreTypeHeader = "Medical Certificate";
      this.fetchPatientMedicalCertificate();
    }
    else if (section == 'sickleave') {
      this.viewMoreTypeHeader = "Sick Leave";
      this.fetchPatientSickLeave();
    }
    else if (section == 'vte') {
      this.viewMoreTypeHeader = "VTE Forms";
      this.vteAssessmentType = 'med';
      this.fetchVteRiskAssessment()
    }
    else if (section == 'bedsidecare') {
      this.viewMoreTypeHeader = "Daily BedSide/Turning Sheet";
      this.FetchPatientBedSideCareForm();
    }
    else if (section == 'bathingcare') {
      this.viewMoreTypeHeader = "Daily Bathing Care";
      this.FetchPatientBathingCareForm();
    }
    else if (section == 'shifthandover') {
      this.viewMoreTypeHeader = "Shift Handover";
      this.fetchPatientHandOverform(this.selectedView.AdmissionID, this.selectedView.PatientID);
    }
    else if (section == 'endoscopy') {
      this.viewMoreTypeHeader = "Endoscopy";
      this.fetchPatientEndoTotalRequest();
    }
    else if (section == 'dietchart') {
      this.viewMoreTypeHeader = "Diet Chart";
      this.fetchDietRequisitionADV();
    }
    else if (section == 'eforms') {
      this.viewMoreTypeHeader = "E-Forms";
      this.getreoperative('0');
    }
    else if (section == 'bradenscale') {
      this.FetchBradenScaleViewDataList = [];
      this.FetchBradenScaleSelctedViewDataList = [];
      this.viewMoreTypeHeader = "Braden Scale";
      this.FetchBradenScaleView();
    }
    else if (section == 'chiefcomplaints') {
      this.viewMoreTypeHeader = "Chief Complaints";
      this.FetchPatientChiefComplaintAndExaminations();
    }
    else if (section == 'fallrisk') {
      this.FetchBradenScaleViewDataList = [];
      this.FetchBradenScaleSelctedViewDataList = [];
      this.viewMoreTypeHeader = "Fall Risk Assessment";
      this.FetchFallRiskView();
    }
    else if (section == 'assessments') {
      this.viewMoreTypeHeader = "Assessments";
      this.FetchPatienFolderAssementView();
    }
    else if (section === 'painassessment') {
      this.viewMoreTypeHeader = "Pain Assessment";
      this.FetchPainAssessmentOrderItemDetails();
    } else if (section === 'physiotherapyresult') {
      this.viewMoreTypeHeader = "Physiotherapy Result";
      this.FetchPhysiotherapyResults();
    }
    else if (section === 'MedicalReport') {
      this.viewMoreTypeHeader = "Medical Report";
      this.LoadMedicalCertificateData();
    }
    else if (section === 'DischargeSummary') {
      this.viewMoreTypeHeader = "Discharge Summary";
      this.LoadDischargeSummaryData();
    }
    else if (section === 'WoundAssessment') {
      this.viewMoreTypeHeader = "Wound Assessment";
    }
    this.clearFilterDataForm();
  }

  clearFilterDataForm() {
    let toDateFilter = new Date();
    let fromDateFilter = new Date(toDateFilter);
    fromDateFilter.setMonth(toDateFilter.getMonth() - 6);
    this.filterDataForm.patchValue({
      fromdate: fromDateFilter,
      todate: toDateFilter,
      location: '0',
      searchitem: '0'
    })
  }

  assignData(tbl: string, response: any) {
    this.viewMoreData = [];
    switch (tbl) {
      case "1": {
        this.viewMoreData = this.viewMoreData1 = response.PatientVisitDetailsList;
        break;
      }
      case "2": {
        //this.viewMoreData = response.BloodOrdersDataList; 
        this.viewMoreTypeHeader = "Blood Request";
        response.BloodOrdersDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "RequestedBy": element.RequestedByName,
            "Name": element.BloodGroup,
            "IsSampleCollected": element.IsSampleCollected,
            "CreateDate": moment(element.RequestDatetime).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "3": {
        //this.viewMoreData = response.NurseNotesDataList; 
        this.viewMoreTypeHeader = "Nurse Notes";
        response.NurseNotesDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.NoteType,
            "Name": element.Note,
            "CreateDate": moment(element.NoteDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "4": {
        //this.viewMoreData = response.MRFilesDataList; 
        this.viewMoreTypeHeader = "MRD Files";
        response.MRFilesDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "Name": element.ScanFilename,
            "CreateDate": moment(element.ScanDate).format('DD-MMM-YYYY HH:MM'),
            "ImageID": element.ImagesID
          })
        });
        break;
      }
      case "5": {
        //this.viewMoreData = response.AdviceFollowupDataList; 
        this.viewMoreTypeHeader = "Advice";
        response.AdviceFollowupDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "Name": element.Advice,
            "CreateDate": moment(element.CreateDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "6": {
        //this.viewMoreData = response.ScreenDesignDataList; 
        this.viewMoreTypeHeader = "Screen Design";
        response.ScreenDesignDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "Name": element.TemplateName,
            "CreateDate": moment(element.CreateDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "7": {
        //this.viewMoreData = response.ReferralOrdersDataList; 
        this.viewMoreTypeHeader = "Referral Orders";
        response.ReferralOrdersDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.ReferralType,
            "Specialisation": element.Specialisation,
            "Remarks": element.Remarks,
            "Doctor": element.DoctornameName,
            "Reason": element.Reason
          })
        });
        break;
      }
      case "8": {
        //this.viewMoreData = response.DietSummaryDataList; 
        this.viewMoreTypeHeader = "Diet Summary";
        response.DietSummaryDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "Name": element.DietCategory,
            "CreateDate": moment(element.OrderDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "9": {
        //this.viewMoreData = response.MedicalCertificateDataList; 
        this.viewMoreTypeHeader = "Merdical Certificate";
        response.MedicalCertificateDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "Name": element.TemplateName,
            "CreateDate": moment(element.CertificateDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      case "10": {
        //this.viewMoreData = response.SickleaveDataList; 
        this.viewMoreTypeHeader = "Sick Leave";
        response.SickleaveDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "FromDate": element.FromDate,
            "ToDate": element.ToDate,
            "Doctor": element.Doctorname
          })
        });
        break;
      }
      case "11": {
        //this.viewMoreData = response.InvestigationsProceduresDataList; 
        this.viewMoreTypeHeader = "Procedures";
        const procs = response.InvestigationsProceduresDataList.filter((x: any) => x.ServiceId === '5');        
        procs.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.ServiceName,
            "Name": element.ItemCode + '-' + element.ItemName,
            "Specialisation": element.Specialisation,
            "Date": moment(element.PrescriptionDate).format('DD-MMM-YYYY HH:MM'),
            "TestOrderID" : element.TestOrderID,
            "TestOrderItemID" : element.TestOrderItemID,
            "SpecialiseID" : element.SpecialiseID,
            "PrescriptionID" : element.PrescriptionID,
            "ItemID" : element.ItemID,
            "ResultStatus" : element.ResultStatus,
            "ResultStatusName" : element.ResultStatusName,
            "admissionid" : element.admissionid
          })
        });
        this.viewMoreData = this.viewMoreData.sort((a: any, b: any) => new Date(b.ResultEnteredDate).getDate() - new Date(a.ResultEnteredDate).getDate());
        if (procs.length > 0) {
          this.sectionLocation = response.PatientDiseasesDataList[0]?.HospitalName;
        }
        else {
          this.sectionLocation = "";
        }
        break;
      }
      case "12": {
        //this.viewMoreData = response.PatientDiseasesDataList;
        this.viewMoreTypeHeader = "Diagnosis";
        response.PatientDiseasesDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Code": element.Code,
            "Name": element.DiseaseName,
            "DiagnosisType": element.DiagonosisType,
            "DiagnosisStatus": element.DiagnosisStatus,
            "PrePostType": element.PrePostType,
            "CreateDate": moment(element.CreateDate).format('DD-MMM-YYYY HH:MM'),
            "Doctorname": element.Doctorname,
            "HospitalID": element.HospitalID,
            "HospitalName": element.HospitalName,
            "PatientType": element.PatientType,
          })
        });
        if (response.PatientDiseasesDataList.length > 0) {
          this.sectionLocation = response.PatientDiseasesDataList[0]?.HospitalName;
        }
        else {
          this.sectionLocation = "";
        }
        this.viewMoreData1 = this.viewMoreData;
        break;
      }
      case "13": {
        //this.viewMoreData = response.PatientSummaryVitalsDataList; 
        // this.viewMoreTypeHeader = "Vitals";
        // response.PatientSummaryVitalsDataList.forEach((element: any, index: any) => {
        //   this.viewMoreData.push({
        //     "Vital": element.Vital,
        //     "Value": element.Value,
        //     "CreateDate": moment(element.VitalSignDate).format('DD-MMM-YYYY HH:MM')
        //   })
        // });
        // this.PatientsVitalsList = this.PatientsVitalsListViewMore = response.PatientSummaryVitalsDataList;
        // this.PatientsVitalsList = this.PatientsVitalsList.slice(0, 10);
        // this.vitalsDatetime = this.PatientsVitalsList[0];

        // var bpsys = this.PatientsVitalsList.find((x: any) => x.Vital == "BP -Systolic");
        // if(bpsys!=undefined){
        //   this.bpSystolic = bpsys.Value;
        //   this.bpSysVal = this.getHighLowValue(bpsys);
        // }


        // var bpdia = this.PatientsVitalsList.find((x: any) => x.Vital == "BP-Diastolic");
        // if(bpdia!=undefined){
        //   this.bpDiastolic = bpdia.Value;
        //   this.bpDiaVal = this.getHighLowValue(bpdia);
        // }


        // var temp = this.PatientsVitalsList.find((x: any) => x.Vital == "Temperature");
        // if(temp!=undefined){
        //   this.temperature = temp.Value;
        //   this.tempVal = this.getHighLowValue(temp);
        // }


        // var pulse = this.PatientsVitalsList.find((x: any) => x.Vital == "Pulse");
        // if(pulse!=undefined){
        //   this.pulse = pulse.Value;
        //   this.pulseVal = this.getHighLowValue(pulse);
        // }


        // this.spo2 = this.PatientsVitalsList.find((x: any) => x.Vital == "SPO2")?.Value;
        // this.respiration = this.PatientsVitalsList.find((x: any) => x.Vital == "Respiration")?.Value;
        // this.consciousness = this.PatientsVitalsList.find((x: any) => x.Vital == "Consciousness")?.Value;
        // this.o2FlowRate = this.PatientsVitalsList.find((x: any) => x.Vital == "O2 Flow Rate")?.Value;
        // if(this.patientdata.PatientType === '2') {
        //   this.tableVitalsForm.patchValue({
        //     vitalFromDate: new Date(this.patientdata.AdmitDate),
        //     vitalToDate: new Date()
        //   });
        // }
        this.GetVitalsData();
        break;
      }
      case "14": {
        //this.viewMoreData = response.PatientSummaryAssessmentsDataList; 
        this.viewMoreTypeHeader = "Assessments";
        response.PatientSummaryAssessmentsDataList.forEach((element: any, index: any) => {
          this.viewMoreData.push({
            "Type": element.Type,
            "Name": element.CSTName,
            "CreateDate": moment(element.CreateDate).format('DD-MMM-YYYY HH:MM')
          })
        });
        break;
      }
      default: {
        //statements; 
        break;
      }
    }
  }

  receiveData(data: { visit: any, fromdate: any, todate: any, type: string }) {
    if (data.type === '') {
      this.visitID = data.visit;
      this.fromDate = data.fromdate;
      this.toDate = data.todate;
      if (this.IsTab === "L") {
        this.fetchLabOrderResults();
      }
      else if (this.IsTab === "R") {
        this.fetchRadOrderResults();
      }
      else if (this.IsTab === "C") {
        this.fetchCardiologyOrderResults();
      }
      else if (this.IsTab === "N") {
        this.fetchNeurologyOrderResults();
      }
      else if (this.IsTab === "P") {
        //this.fetchNeurologyOrderResults();
        this.data = [];
      }
      else if (this.IsTab === "D") {
        this.data = [];
        //this.fetchNeurologyOrderResults();
      }
    }
    else {
      this.filterTestResults(data.type);
    }
  }

  ActiveTab(tab: any) {
    $('#invprocSmartSearch').val('');
    this.filterDataForm.patchValue({
      searchitem: 0
    });
    this.IsTab = tab;
    this.loadInvRad("0");
  }
  fetchLabByValue(filteredvalue: any = "") {
    if (filteredvalue) {
      let filteredData = this.dataToFilter.filter((value: any) => value.specialisation.trim().toLowerCase() === filteredvalue.trim().toLowerCase());
      this.data = filteredData;
      this.invFilter = true;
    }
    else {
      this.invFilter = false;
      this.data = this.dataToFilter;
    }
    this.showLabTest = false;
  }
  submitPACSForm(test: any) {
    if(test.IsNewVisits == '1') {
      openPACS(test.SampleNumber, this.hospitalID, this.selectedView.SSN);
    }
    else {
      openPACS(test.TestOrderItemID, this.hospitalID, this.selectedView.SSN);
    }
  }

  addSelectedReport(dept: any) {
    if(dept.Status=='5'){
      this.selectedReport = dept;
      this.radioLogyReportPDF();
    }else {
      this.SucessMsg = "Results are not Verified";   
      $("#SucessMsg").modal('show');
    }
    
  }
  radioLogyReportPDF() {
    const url = this.service.getData(patientfolder.FetchRadReportGroupPDF, {
      RegCode: this.patientDetails.RegCode ?? this.selectedView.RegCode,
      TestOrderItemId: this.selectedReport.TestOrderItemID,
      TestOrderId: this.selectedReport.TestOrderId,
      UserID: this.doctorDetails[0].UserId,
      HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Status === "Success") {
        if (this.IsTab === 'C'||this.IsTab === 'R') {
          if(response.objLabReportNList.length>0){
            const content = response.objLabReportNList[0].VALUE;
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const extractedText = doc.body.innerHTML;
            this.cardiologyContentHTML = this.sanitizer.bypassSecurityTrustHtml(extractedText);
            $('#cardiology_report').modal('show');
          } else {
            this.radiologyPdfDetails = response;
            this.trustedUrl = response?.FTPPATH
            this.showModal();
          }
          
        } else {
          this.radiologyPdfDetails = response;
          this.trustedUrl = response?.FTPPATH
          this.showModal();
        }
      }
    },
      (err) => {

      })
  }

  fetchLabOrderResults() {
    this.data = [];
    this.dataToFilter = [];
    this.distinctSpecialisations = [];
    var fromdate = this.filterDataForm.get("fromdate")?.value === '0' ? '0' : moment(this.filterDataForm.get("fromdate")?.value).format('DD-MMM-YYYY');
    var todate = this.filterDataForm.get("todate")?.value === '0' ? '0' : moment(this.filterDataForm.get("todate")?.value).format('DD-MMM-YYYY');
    const hospid = this.filterDataForm.get("location")?.value;
    const searchid = this.filterDataForm.get("searchitem")?.value;
    //if(this.visitAdmissionId === '0') {
    this.url = this.service.getData(patientfolder.FetchLabOrderResultsPF, { fromDate: fromdate, ToDate: todate, PatientID: this.selectedView.PatientID, AdmissionID: this.visitAdmissionId, SearchID: searchid, HospitalID: hospid });
    //}
    // else {
    //   this.url = this.service.getData(patientfolder.FetchLabOrderResults, { fromDate: fromdate, ToDate: todate, PatientID: this.selectedView.PatientID, HospitalID: this.hospitalID });
    // }
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.data = response.FetchLabOrderResultsDataaList.filter((val: any) => val.IsResult == "4");
        this.dataToFilter = response.FetchLabOrderResultsDataaList;
        this.data.forEach((element: any, index: any) => {
          if (Number(element.Status) >= 7 && Number(element.Status) != 13) {
            element.viewRecord = true;
          }
          else {
            element.viewRecord = false;
          }
          if (element.HasDocuments == "1") {
            element.HasDocuments = true;
          } else {
            element.HasDocuments = false;
          }
          if (element.IsPanic == "True") {
            element.RowColor = "background-color:red;padding:0.36rem;";
            element.RowColorW = "color:white";
          }
          else if (element.IsAbnormal == "True") {
            element.RowColor = "background-color:orange;padding:0.36rem;"
            element.RowColorW = "color:white";
          }
          element.SampleStatus = parseInt(element.Status);
        });
        this.distinctSpecialisations = Array.from(new Set(this.data.map((item: any) => item.specialisation)));
      }
    });
  }
  fetchRadOrderResults() {
    this.data = [];
    this.dataToFilter = [];

    var fromdate = moment(this.filterDataForm.get("fromdate")?.value).format('DD-MMM-YYYY');
    var todate = moment(this.filterDataForm.get("todate")?.value).format('DD-MMM-YYYY');
    const hospid = this.filterDataForm.get("location")?.value;
    const searchid = this.filterDataForm.get("searchitem")?.value;

    //if(this.visitAdmissionId === '0') {
    this.url = this.service.getData(patientfolder.FetchRadOrderResultsPF, {
      fromDate: fromdate, ToDate: todate, PatientID: this.selectedView.PatientID, AdmissionID: this.visitAdmissionId, SearchID: searchid, HospitalID: hospid
    });
    //}
    // else {
    //     this.url = this.service.getData(patientfolder.FetchRadOrderResults, {
    //       fromDate: this.fromDate, ToDate: this.toDate, PatientID: this.selectedView.PatientID, HospitalID: this.hospitalID
    //     });
    //   }
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.data = response.FetchRadOrderResultsDataaList.filter((val: any) => val.IsResult == "7");
        this.dataToFilter = response.FetchRadOrderResultsDataaList;
        this.data.forEach((element: any, index: any) => {
          if (Number(element.Status) >= 4 && Number(element.Status) <= 6) {
            element.viewRecord = true;
          }
          else {
            element.viewRecord = false;
          }
        });
      }
    },
      (err) => {

      })
  }

  fetchCardiologyOrderResults() {
    this.data = [];
    this.dataToFilter = [];

    var fromdate = moment(this.filterDataForm.get("fromdate")?.value).format('DD-MMM-YYYY');
    var todate = moment(this.filterDataForm.get("todate")?.value).format('DD-MMM-YYYY');
    const hospid = this.filterDataForm.get("location")?.value;
    const searchid = this.filterDataForm.get("searchitem")?.value;

    this.url = this.service.getData(patientfolder.FetchCardOrderResultsPF, {
      fromDate: fromdate, ToDate: todate, PatientID: this.selectedView.PatientID, AdmissionID: this.visitAdmissionId, SearchID: searchid, HospitalID: hospid
    });
    // this.url = this.service.getData(patientfolder.FetchCardOrderResults, {
    //   fromDate: this.fromDate, ToDate: this.toDate, PatientID: this.selectedView.PatientID, HospitalID: this.hospitalID
    // });
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.data = response.FetchRadOrderResultsDataaList.filter((val: any) => val.IsResult == "7");
        this.dataToFilter = response.FetchLabOrderResultsDataaList;
        this.data.forEach((element: any, index: any) => {
          if (Number(element.Status) >= 4 && Number(element.Status) <= 6) {
            element.viewRecord = true;
          }
          else {
            element.viewRecord = false;
          }
        });
      }
    },
      (err) => {

      })
  }
  fetchNeurologyOrderResults() {
    this.data = [];
    this.dataToFilter = [];

    var fromdate = moment(this.filterDataForm.get("fromdate")?.value).format('DD-MMM-YYYY');
    var todate = moment(this.filterDataForm.get("todate")?.value).format('DD-MMM-YYYY');
    const hospid = this.filterDataForm.get("location")?.value;
    const searchid = this.filterDataForm.get("searchitem")?.value;

    this.url = this.service.getData(patientfolder.FetchNeurologyOrderResultsPF, {
      fromDate: fromdate, ToDate: todate, PatientID: this.selectedView.PatientID, AdmissionID: this.visitAdmissionId, SearchID: searchid, HospitalID: hospid
    });
    // this.url = this.service.getData(patientfolder.FetchNeurologyOrderResults, {
    //   fromDate: this.fromDate, ToDate: this.toDate, PatientID: this.selectedView.PatientID, HospitalID: this.hospitalID
    // });
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.data = response.FetchLabOrderResultsDataaList.filter((val: any) => val.IsResult == "7");
        this.dataToFilter = response.FetchLabOrderResultsDataaList;
        this.data.forEach((element: any, index: any) => {
          if (Number(element.Status) >= 4 && Number(element.Status) <= 6) {
            element.viewRecord = true;
          }
          else {
            element.viewRecord = false;
          }
        });
      }
    },
      (err) => {

      })
  }

  fetchDentalOrderResults() {
    this.data = [];
    this.dataToFilter = [];

    var fromdate = moment(this.filterDataForm.get("fromdate")?.value).format('DD-MMM-YYYY');
    var todate = moment(this.filterDataForm.get("todate")?.value).format('DD-MMM-YYYY');
    const hospid = this.filterDataForm.get("location")?.value;
    const searchid = this.filterDataForm.get("searchitem")?.value;

    this.url = this.service.getData(patientfolder.FetchDentalOrderResultsPF, {
      fromDate: fromdate, ToDate: todate, PatientID: this.selectedView.PatientID, AdmissionID: this.visitAdmissionId, SearchID: searchid, HospitalID: hospid
    });
    // this.url = this.service.getData(patientfolder.FetchNeurologyOrderResults, {
    //   fromDate: this.fromDate, ToDate: this.toDate, PatientID: this.selectedView.PatientID, HospitalID: this.hospitalID
    // });
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.data = response.FetchLabOrderResultsDataaList.filter((val: any) => val.IsResult == "7");
        this.dataToFilter = response.FetchLabOrderResultsDataaList;
        this.data.forEach((element: any, index: any) => {
          if (Number(element.Status) >= 4 && Number(element.Status) <= 6) {
            element.viewRecord = true;
          }
          else {
            element.viewRecord = false;
          }
        });
      }
    },
      (err) => {

      })
  }

  addSelectedResult(dept: any) {
    this.selectedReport = dept;
    this.getLabReportPdf()
  }
  addSelectedItemResult(dept: any) {
    this.selectedReport = dept;
    this.getItemLabReportPdf()
  }
  getItemLabReportPdf() {

    let reqPayload = {
      "RegCode": this.patientDetails.RegCode ?? this.selectedView.RegCode,//this.patientDetails.RegCode,
      "HospitalId": this.hospitalID,
      "TestOrderId": this.selectedReport.TestOrderId
    }
    this.url = this.service.getData(patientfolder.FetchLabReportItemlevelGroupPDF, { RegCode: reqPayload.RegCode, TestOrderId: this.selectedReport.TestOrderId,TestOrderItemID: this.selectedReport.TestOrderItemID, HospitalID: this.hospitalID });
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Status === "Success") {
        this.labReportPdfDetails = response;
        this.trustedUrl = response?.FTPPATH;
        // this.showLabReportsModal();
        if(response.objHtmlReport != '' && response.objHtmlReport != null) {
          this.reportName = "Lab Report";
          const content = response.objHtmlReport;
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/html');
          const extractedText = doc.body.innerHTML;
          this.cardiologyContentHTML = this.sanitizer.bypassSecurityTrustHtml(extractedText);
          $('#cardiology_report').modal('show');
        }
        else {
          this.showLabReportsModal();
        } 
      } else if (response.Status === "Fail") {
        this.labReportPdfDetails = response;
        this.showToastrModal();
      }
    },
      (err) => {

      })
  }

  isSelectedRow(rowData: any): boolean {
    return rowData === this.selectedReport;
  }

  getLabReportPdf() {

    let reqPayload = {
      "RegCode": this.patientDetails.RegCode ?? this.selectedView.RegCode,//this.patientDetails.RegCode,
      "HospitalId": this.hospitalID,
      "TestOrderId": this.selectedReport.TestOrderId
    }
    this.url = this.service.getData(patientfolder.FetchLabReportGroupPDF, { RegCode: reqPayload.RegCode, TestOrderId: this.selectedReport.TestOrderId,UserID:this.doctorDetails[0].UserId, HospitalID: this.hospitalID });
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Status === "Success") {
        this.labReportPdfDetails = response;
        this.trustedUrl = response?.FTPPATH;
        if(response.objHtmlReport != '' && response.objHtmlReport != null) {
          this.reportName = "Lab Report";
          const content = response.objHtmlReport;
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const extractedText = doc.body.innerHTML;
            this.cardiologyContentHTML = this.sanitizer.bypassSecurityTrustHtml(extractedText);
            $('#cardiology_report').modal('show');
        }
        else {
          this.showLabReportsModal();
        }        
      } else if (response.Status === "Fail") {
        this.labReportPdfDetails = response;
        this.showToastrModal();
      }
    },
      (err) => {

      })
  }
  showLabReportsModal(): void {
    $("#showLabReportsModal").modal('show');
  }
  showToastrModal() {
    $("#saveMessage").modal('show');
  }
  addSelectedDocResult(dept: any) {
    this.selectedReport = dept;
    this.getLabDocReportPdf()
  }
  getLabDocReportPdfold() {
    const url = this.service.getData(patientfolder.fetchLabDocReportGroupPDF, {
      TestOrderID: this.selectedReport.TestOrderId,
      TestOrderItemID: this.selectedReport.TestOrderItemID,
      HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Status === "Success") {
        this.labReportDocPdfDetails = response;
        this.trustedUrl = response?.FTPPATH;
        this.showLabReportsModal();
      } else if (response.Status === "Fail") {
        this.labReportDocPdfDetails = response;
        this.showToastrModal();
      }
    },
      (err) => {

      })
  }

  getLabDocReportPdf() {
    const url = this.service.getData(patientfolder.FetchLabDocumentsPF, {
      TestOrderID: this.selectedReport.TestOrderId,
      TestOrderItemID: this.selectedReport.TestOrderItemID,
      HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.trustedUrl = response?.FTPPATH;
        this.showModal()
    }
    },
      (err) => {

      })
  }

  filterTestResults(type: any) {
    if (type == "all") {
      this.allResults = "btn selected"; this.panicResults = this.abnormalResults = "btn";
      this.data = this.dataToFilter;
    }
    else if (type == "panic") {
      this.allResults = this.abnormalResults = "btn"; this.panicResults = "btn selected";
      this.data = this.dataToFilter.filter((r: any) => r.IsPanic == "True");
    }
    else if (type == "abnormal") {
      this.allResults = this.panicResults = "btn"; this.abnormalResults = "btn selected"
      this.data = this.dataToFilter.filter((r: any) => r.IsAbnormal == "True");
    }
  }

  fetchLabTestGraphsold(test: any, event: Event) {
    event.stopPropagation();
    const url = this.service.getData(patientfolder.fetchLabTestGraph, {
      TestName: test.TestName,
      PatientID: this.selectedView.PatientID,
      HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      this.testGraphsData = response;
      this.createResultsChart();
      if (this.labTestDiv && this.labTestDiv.nativeElement) {
        this.labTestDiv.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
      (err) => {

      })

  }

  fetchLabTestGraphs(test: any, event: Event) {
    event.stopPropagation();
    const url = this.service.getData(patientfolder.FetchLabTestGraphNew, {
      UHID: this.patientDetails.RegCode ?? this.selectedView.RegCode,
      TestID: test.TestId,
      HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      this.testGraphsData = response;
      this.createResultsChart();
      if (this.labTestDiv && this.labTestDiv.nativeElement) {
        this.labTestDiv.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
      (err) => {

      })

  }



  loadLabTest() {
    this.showLabTest = true;
  }

  FetchPatientFileData() {
    this.url = this.service.getData(patientfolder.FetchPatientSummaryFileData, {
      //EpisodeID: this.episodeId, Admissionid: this.admissionID, HospitalID: this.hospitalID 
      PatientID: this.PatientID, AdmissionID: this.admissionID, EpisodeID: this.episodeId, WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {

          //Visit Info
          this.selectedView = response.FetchPatientVistitInfoDataList[0];

          //Diagnosis
          this.PatientDiagnosisList = this.PatientDiagnosisListViewMore = response.PatientDiagnosisDataList;
          this.PatientDiagnosisList = this.PatientDiagnosisList.slice(0, 10);

          //Investigations & Radiology
          this.PatientInvestigationsList = this.PatientInvestigationsListViewMore = response.PatientInvestigationsDataList.filter((inv: any) => inv.Isresult == 4);
          this.PatientInvestigationsList = this.PatientInvestigationsList.slice(0, 10);
          this.PatientRadiologyList = this.PatientRadiologyListViewMore = response.PatientInvestigationsDataList.filter((inv: any) => inv.Isresult == 7);
          this.PatientRadiologyList = this.PatientRadiologyList.slice(0, 10);
          this.servicesCount = Number(this.PatientInvestigationsList.length) + Number(this.PatientRadiologyList.length);

          //Procedures
          this.PatientProceduresList = this.PatientProceduresListViewMore = response.PatientProceduresDataList;
          this.PatientProceduresList = this.PatientProceduresList.slice(0, 10);

          //Assessments
          this.PatientsAssessmentsList = this.PatientsAssessmentsListViewMore = response.PatientAssessmentsDataList;
          this.PatientsAssessmentsList = this.PatientsAssessmentsList.slice(0, 10);

          //Vitals
          this.PatientsVitalsList = this.PatientsVitalsListViewMore = response.PatientDataVitalsList;
          this.PatientsVitalsList = this.PatientsVitalsList.slice(0, 10);
          this.vitalsDatetime = this.PatientsVitalsList[0];

          var bpsys = this.PatientsVitalsList.find((x: any) => x.Vital == "BP -Systolic");
          this.bpSystolic = bpsys.Value;
          this.bpSysVal = this.getHighLowValue(bpsys);

          var bpdia = this.PatientsVitalsList.find((x: any) => x.Vital == "BP-Diastolic");
          this.bpDiastolic = bpdia.Value;
          this.bpDiaVal = this.getHighLowValue(bpdia);

          var temp = this.PatientsVitalsList.find((x: any) => x.Vital == "Temperature");
          this.temperature = temp.Value;
          this.tempVal = this.getHighLowValue(temp);

          var pulse = this.PatientsVitalsList.find((x: any) => x.Vital == "Pulse");
          this.pulse = pulse.Value;
          this.pulseVal = this.getHighLowValue(pulse);

          this.spo2 = this.PatientsVitalsList.find((x: any) => x.Vital == "SPO2")?.Value;
          this.respiration = this.PatientsVitalsList.find((x: any) => x.Vital == "Respiration")?.Value;
          this.consciousness = this.PatientsVitalsList.find((x: any) => x.Vital == "Consciousness")?.Value;
          this.o2FlowRate = this.PatientsVitalsList.find((x: any) => x.Vital == "O2 Flow Rate")?.Value;

          //Medications
          var startDate = moment(new Date().setMonth(new Date().getMonth() - 3)).format('DD-MMM-YYYY');
          var endDate = moment(new Date()).format('DD-MMM-YYYY');

          response.PatientOrderedOrPrescribedDrugsList.forEach((element: any, index: any) => {
            const start = new Date(element.StartFrom);
            const end = new Date(element.EndDateTime);
            element.Class = "row card_item_div mx-0 w-100 align-items-center maxim";
            element.DatesArray = this.generateDateRange(start, end);
          });

          this.PatientMedicationsList = this.PatientViewMoreMedicationsList = this.PatientViewMoreSearchMedicationsList = response.PatientOrderedOrPrescribedDrugsList;
          this.patientActiveMedicationList = response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString()));
          this.patientActiveMedicationList = this.patientActiveMedicationList.slice(0, 4);
          this.patientInActiveMedicationList = response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.StartFrom) >= Date.parse(startDate.toString().split(' ')[0]) && Date.parse(data.EndDateTime) < Date.parse(endDate));
          this.patientInActiveMedicationList = this.patientInActiveMedicationList.slice(0, 4);
          this.activeMedicationCount = response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString())).length;
          this.inactiveMedicationCount = response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.StartFrom) >= Date.parse(startDate.toString().split(' ')[0]) && Date.parse(data.EndDateTime) < Date.parse(endDate)).length;
          this.medicationsCount = this.activeMedicationCount + this.inactiveMedicationCount;


          //Surgeries
          this.FetchAllSurgeriesDataList = this.FetchAllSurgeriesDataListViewMore = response.FetchAllSurgeriesDataList;

          //Blood Requests
          this.FetchBloodRequestDataaList = this.FetchBloodRequestDataaListViewMore = response.FetchBloodRequestDataaList;

          //EForms
          this.FetchEFormsDataaList = this.FetchEFormsDataaListViewMore = response.FetchEFormsDataaList;

          //Progress Notes
          this.FetchMainProgressNoteDataList = this.FetchMainProgressNoteDataListViewMore = response.FetchMainProgressNoteDataList;

          //Nursing Instructions
          this.FetchNursingInstructionsDataaList = this.FetchNursingInstructionsDataaListViewMore = response.FetchNursingInstructionsDataaList;

          //Care Plan
          this.FetchCarePlanDataaList = this.FetchCarePlanDataaListViewMore = response.FetchCarePlanDataaList;

          //Bathing Care
          this.FetchPatientBathSideCareFromDataaList = this.FetchPatientBathSideCareFromDataaListViewMore = response.FetchPatientBathSideCareFromDataaList;

          //Bed Side Care
          this.FetchPatientBedSideCareFromDataaList = this.FetchPatientBedSideCareFromDataaListViewMore = response.FetchPatientBedSideCareFromDataaList;

          //Shift Handover
          this.FetchPatientHandOverformDataaList = this.FetchPatientHandOverformDataaListViewMore = response.FetchPatientHandOverformDataaList;

        }
      },
        (err) => {

        })
  }

  getHighLowValue(element: any) {
    if (element.Value != null && element.Value != "" && parseFloat(element.Value) > parseFloat(element.MAXVALUE)) {
      return 'high';
    }
    else if (element.Value != null && element.Value != "" && parseFloat(element.Value) < parseFloat(element.MINVALUE)) {
      return 'low';
    }
    else {
      return 'normal'
    }
  }

  fetchPatientSickLeave() {
    var startdate = moment(new Date().setMonth(new Date().getMonth() - 6)).format('YYYY-MM-DD');
    var enddate = moment(new Date()).format('YYYY-MM-DD');

    this.url = this.service.getData(patientfolder.FetchPatientSickLeaveWorkList, { PatientID: this.PatientID, FromDate: startdate, ToDate: enddate, HospitalID: this.hospitalID });
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.sickLeaveData = response.FetchPatientSickLeaveWorkListFDataList;
      }
    });
  }
  fetchPatientMedicalCertificate() {
    // var startdate = moment(new Date().setMonth(new Date().getMonth() - 6)).format('YYYY-MM-DD');
    // var enddate = moment(new Date()).format('YYYY-MM-DD');

    // this.url = this.service.getData(patientfolder.FetchMedicalCertificateRequest, { PatientID: this.PatientID, FromDate: startdate, ToDate: enddate, HospitalID: this.hospitalID });
    // this.us.get(this.url).subscribe((response: any) => {
    //   if (response.Code == 200) {
    //     this.medicalCertificateData = response.FetchMedicalCertificateRequestFDataList;
    //   }
    // });
    //FetchMedicalCertificateRequestPF?RegCode=${RegCode}&PatientID=${PatientID}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    var Fromdate = this.selectedView.AdmitDate;
    var ToDate = moment(new Date()).format('DD-MMM-YYYY');
    const url = this.service.getData(patientfolder.FetchMedicalCertificateRequestPFIPID, {
      RegCode: this.patientdata.RegCode,
      AdmissionID: this.admissionID,
      // FromDate: Fromdate,
      // ToDate: ToDate,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.viewMedCertificatesList = response.FetchMedicalCertificateRequestFDataList;
        }
      },
        (err) => {
        })
  }



  // FetchPatientMedication() {
  //   this.url = this.service.getData(patientfolder.FetchPatientOrderedOrPrescribedDrugs, { PatientType: this.PatientType, IPID: this.admissionID, PatientID: this.PatientID, HospitalID: this.hospitalID });
  //   this.us.get(this.url)
  //     .subscribe((response: any) => {
  //       if (response.Code == 200) {
  //         var startDate = moment(new Date().setMonth(new Date().getMonth() - 3)).format('DD-MMM-YYYY');
  //         var endDate = moment(new Date()).format('DD-MMM-YYYY');
  //         this.PatientMedicationsList = this.PatientMedicationsListViewMore = this.PatientViewMoreSearchMedicationsList = response.PatientOrderedOrPrescribedDrugsList;
  //         this.PatientMedicationsList = this.PatientMedicationsList.slice(0, 10);
  //         this.patientActiveMedicationList = this.patientActiveMedicationListViewMore = response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString()));
  //         this.patientInActiveMedicationList = this.patientInActiveMedicationListViewMore = response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.StartFrom) > Date.parse(startDate.toString()) && Date.parse(data.EndDateTime) < Date.parse(endDate));

  //       }
  //     },
  //       (err) => {

  //       })
  // }
  FetchPatientMedication() {
    this.viewMoreTypeHeader = "Medications";

    if (this.visitAdmissionId === '0') {
      this.con.fetchPatientMedication('0', this.visitAdmissionId, this.patientdata.PatientID, "0")
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.fillMedicationData(response);

            // setTimeout(() => {
            //   this.createcarousel();
            // }, 500);

          }
        },
          (err) => {

          })
    }
    else {
      this.con.fetchPatientMedication(this.patientdata.PatientType == '2' ? '2' : '1', this.admissionID, this.patientdata.PatientID, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.fillMedicationData(response);

            // setTimeout(() => {
            //   this.createcarousel();
            // }, 500);

          }
        },
          (err) => {

          })
    }
  }

  fillMedicationData(response: any) {
    var startDate = this.patientdata.AdmitDate;
    //var startDate = moment(new Date().setMonth(new Date().getMonth() - 24)).format('DD-MMM-YYYY');
    var endDate = moment(new Date()).format('DD-MMM-YYYY');
    if (response.PatientOrderedOrPrescribedDrugsList.length > 0) {
      this.sectionLocation = response.PatientOrderedOrPrescribedDrugsList[0]?.HospitalName;
    }
    else {
      this.sectionLocation = "";
    }
    response.PatientOrderedOrPrescribedDrugsList.forEach((element: any, index: any) => {
      const start = new Date(element.StartFrom);
      const end = new Date(element.EndDateTime);
      element.Class = "row card_item_div mx-0 w-100 align-items-center maxim";
      element.DatesArray = this.generateDateRange(start, end);
    });

    this.PatientMedicationsList = this.PatientViewMoreMedicationsList = this.PatientViewMoreSearchMedicationsList = response.PatientOrderedOrPrescribedDrugsList;
    this.patientActiveMedicationList = response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString()));
    this.patientActiveMedicationList = this.patientActiveMedicationList.slice(0, 4);
    this.patientInActiveMedicationList = response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.StartFrom) >= Date.parse(startDate.toString().split(' ')[0]) && Date.parse(data.EndDateTime) < Date.parse(endDate));
    this.patientInActiveMedicationList = this.patientInActiveMedicationList.slice(0, 4);
    this.activeMedicationCount = this.patientActiveMedicationList.length;//response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString())).length;
    this.inactiveMedicationCount = this.patientInActiveMedicationList.length;//response.PatientOrderedOrPrescribedDrugsList.filter((data: any) => Date.parse(data.StartFrom) > Date.parse(startDate.toString()) && Date.parse(data.EndDateTime) < Date.parse(endDate)).length;
    this.medicationsCount = this.activeMedicationCount + this.inactiveMedicationCount


    //var md = new Date(new Date().setMonth(new Date().getMonth() - 24));
    // var md=this.patientdata.AdmitDate;
    var md = new Date(this.patientdata.AdmitDate);
    this.viewMoreMedicationsForm.patchValue({
      medfromdate: md,
      medtodate: this.toDate.value
    })
    if (this.activeMedicationCount > 0)
      this.changeMedicationStatus("active");
    else
      this.changeMedicationStatus("inactive");
    this.FetchViewMoreMedicationsData("search");
    this.FetchHoldMaster();
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
      datesArray.push({ date: this.datePipe.transform(currentDate, "dd-MMM-yyyy"), value: value });
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

  fetchBloodRequests() {
    this.url = this.service.getData(patientfolder.FetchBloodRequest, { Admissionid: this.admissionID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchBloodRequestDataaList = this.FetchBloodRequestDataaListViewMore = results.FetchBloodRequestDataaList;
            //this.FetchBloodRequestDataaList = this.FetchBloodRequestDataaList.slice(0,6);
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  fetchSSurgeries() {
    if (this.visitAdmissionId === '0') {
      this.url = this.service.getData(patientfolder.FetchSSurgeriesPF, {
        fromDate: "0", ToDate: "0", PatientID: this.PatientID, AdmissionID: "0", SearchID: "0", HospitalID: "0"
      });
    }
    else {
      this.url = this.service.getData(patientfolder.FetchSSurgeries, { Admissionid: this.admissionID, HospitalID: this.hospitalID });
    }

    this.us.get(this.url)
      .subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchAllSurgeriesDataList = this.FetchAllSurgeriesDataListViewMore = results.FetchAllSurgeriesDataList;
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  fetchEForms() {
    this.url = this.service.getData(patientfolder.FetchEForms, { Admissionid: this.admissionID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchEFormsDataaList = this.FetchEFormsDataaListViewMore = results.FetchEFormsDataaList;
            //this.FetchEFormsDataaList = this.FetchEFormsDataaList.slice(0,4);
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  fetchMainProgressNote() {

    // var FromDate = moment(this.viewMoreDiagnosisForm.value['fromdate']).format("DD-MMM-yyyy");
    // var ToDate = moment(this.viewMoreDiagnosisForm.value['todate']).format('DD-MMM-YYYY');
    const uhid = this.patientdata.RegCode;
    const admid = this.patientdata.AdmissionID;
    this.url = this.service.getData(patientfolder.FetchMainProgressNoteNewPF,
      {
        UHID: uhid, Admissionid: admid, UserID: this.doctorDetails[0].UserId, 
        WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, HospitalID: this.hospitalID
      });
    this.us.get(this.url)
      .subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchMainProgressNoteDataList = this.FetchMainProgressNoteDataListViewMore = results.FetchMainProgressNoteDataList;
            this.selectOptionN(this.selectedOptions);
            //this.FetchMainProgressNoteDataList = this.FetchMainProgressNoteDataList.slice(0,6);
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  fetchNursingInstructions() {
    //this.url = this.service.getData(patientfolder.FetchNursingInstructions, { PatientID: this.PatientID, Admissionid: this.admissionID, HospitalID: this.hospitalID });
    this.url = this.service.getData(patientfolder.FetchNursingInstructionsPF, { UHID: this.patientdata.RegCode, Admissionid: this.admissionID,WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchNursingInstructionsDataaList = this.FetchNursingInstructionsDataaListViewMore = results.FetchNursingInstructionsDataaList;
            //this.FetchNursingInstructionsDataaList = this.FetchNursingInstructionsDataaList.slice(0, 4);
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  fetchCarePlan() {
    this.url = this.service.getData(patientfolder.FetchCarePlan, { Admissionid: this.admissionID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchCarePlanDataaList = this.FetchCarePlanDataaListViewMore = results.FetchCarePlanDataaList;
            //this.FetchCarePlanDataaList = this.FetchCarePlanDataaList.slice(0,4);
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  fetchInTakeOutPut() {
    this.url = this.service.getData(patientfolder.FetchInTakeOutPut, { Admissionid: this.admissionID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchInTakeOutPutDataaList = this.FetchInTakeOutPutDataaListViewMore = results.FetchInTakeOutPutDataaList;
            //this.FetchInTakeOutPutDataaList = this.FetchInTakeOutPutDataaList.slice(0,6);
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }
  fetchSummaryData() {
    var fromdate = this.tableSummaryForm.get("SummaryFromDate")?.value;
    fromdate = moment(fromdate).format('DD-MMM-YYYY');
    var todate = this.tableSummaryForm.get("SummaryToDate")?.value;
    if (todate != null) {
      todate = moment(todate).format('DD-MMM-YYYY');
      this.url = this.service.getData(patientfolder.FetchPatientIntakOutputSave, { IPID: this.selectedView.AdmissionID, FromDate: fromdate, ToDate: todate });
      this.gridData = [];
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.summaryData = [];
            const uniqueUoms = response.FetchPatientIntakOutputSaveListD.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.UoMID === thing.UoMID) === i);
            this.listofUoms = uniqueUoms;
            uniqueUoms.forEach((ele: any, ind: any) => {
              var intakedata = response.FetchPatientIntakOutputSaveListD.filter((x: any) => x.UoMID === ele.UoMID && x.Isintake == 'True');
              var outputdata = response.FetchPatientIntakOutputSaveListD.filter((x: any) => x.UoMID === ele.UoMID && x.Isintake == 'False');

              const totalintakeqty = intakedata.map((item: any) => Number.parseInt(item.Quantity)).reduce((acc: any, curr: any) => acc + curr, 0);
              this.totalIntakeQty = totalintakeqty.toString() + ele.UOM;

              const totaloutputqty = Number(outputdata.map((item: any) => Number.parseInt(item.Quantity)).reduce((acc: any, curr: any) => acc + curr, 0));
              this.totalOutputQty = totaloutputqty.toString() + ele.UOM;

              const balQty = Number(totalintakeqty) - Number(totaloutputqty);
              this.balanceQty = balQty.toString() + ele.UOM;

              response.FetchPatientIntakOutputSaveListD.forEach((element: any, index: any) => {
                if (intakedata[index] != undefined || outputdata[index] != undefined) {
                  this.summaryData.push({
                    Uom: intakedata[index] != undefined ? intakedata[index].UOM : "",
                    Intake: intakedata[index] != undefined ? intakedata[index].IntakeOutput : "",
                    IntakeQty: intakedata[index] != undefined ? intakedata[index].Quantity + intakedata[index].UOM : "",
                    Output: outputdata[index] != undefined ? outputdata[index].IntakeOutput : "",
                    OutputQty: outputdata[index] != undefined ? outputdata[index].Quantity + intakedata[index].UOM : "",
                    BalanceQty: ""
                  })
                }
              });
            });

          }
        },
          (err) => {
          })
    }
  }

  scrollTo(section: string, type: string) {
    // if (section == 'diagnosis') {
    //   var currentTimeElement = this.diagnosis.nativeElement.querySelector('.diagnosis_card');
    // }
    // if (section == 'vitals')
    //   currentTimeElement = this.vitals.nativeElement.querySelector('.card');
    // else if (section == 'investigations')
    //   currentTimeElement = this.investigations.nativeElement.querySelector('.card');
    // else if (section == 'medications')
    //   currentTimeElement = this.medications.nativeElement.querySelector('.card');
    // else if (section == 'investigations')
    //   currentTimeElement = this.investigations.nativeElement.querySelector('.card');
    // else if (section == 'procedures')
    //   currentTimeElement = this.procedures.nativeElement.querySelector('.card');
    // else if (section == 'surgeryrequests')
    //   currentTimeElement = this.surgeryrequests.nativeElement.querySelector('.card');
    // else if (section == 'bloodrequests')
    //   currentTimeElement = this.bloodrequests.nativeElement.querySelector('.card');
    // else if (section == 'assessments')
    //   currentTimeElement = this.assessments.nativeElement.querySelector('.card');
    // else if (section == 'progressnotes')
    //   currentTimeElement = this.progressnotes.nativeElement.querySelector('.card');
    // else if (section == 'nursinginstructions')
    //   currentTimeElement = this.nursinginstructions.nativeElement.querySelector('.card');
    // else if (section == 'careplan')
    //   currentTimeElement = this.careplan.nativeElement.querySelector('.card');
    // else if (section == 'intakeoutput')
    //   currentTimeElement = this.intakeoutput.nativeElement.querySelector('.card');

    // if (currentTimeElement) {
    //   currentTimeElement.scrollIntoView({ behavior: 'smooth' });
    // }

    this.fetchPatientSummary(type, section);
  }
  
  onAccept() {
    const SSN = this.selectedView.SSN;
    $('#selectPatientYesNoModal').modal('hide');
    sessionStorage.setItem('navigateToRadiologyWorklist', SSN)
    this.router.navigate(['/suit/radiologyworklist']);
  }

  onDecline() {
    $('#selectPatientYesNoModal').modal('hide');
    this.router.navigate(['/suit/radiologyworklist']);
  }
  
  navigatetoBedBoard() {
    sessionStorage.setItem("FromEMR", "false");
    sessionStorage.setItem("PatientID", "");
    sessionStorage.removeItem("fromSuitPage");
    sessionStorage.removeItem("fromOtDashboard");
    sessionStorage.removeItem("fromIVDashboard");
    sessionStorage.removeItem("fromAdmissionRequest");
    sessionStorage.removeItem("fromIDDashboard");
    sessionStorage.removeItem("fromDoctorDashboard");
    sessionStorage.removeItem("labresult");
    sessionStorage.removeItem("radresult");
    sessionStorage.removeItem("radworklist");
    sessionStorage.removeItem("PatientDetails");
    sessionStorage.removeItem("selectedView");
    sessionStorage.removeItem("selectedPatientAdmissionId");

    if (this.labresult) {
      this.router.navigate(['/suit/lab-resultentry']);
      return;
    }
    else if (this.radresult) {
      this.router.navigate(['/suit/radiology-resultentry']);
      return;
    }
    else if (this.radworklist) {
      $('#selectPatientYesNoModal').modal('show');
      return;
    }
    else if (this.fromDoctorDashboard) {
      this.router.navigate(['/home/patients']);
    }
    else if (this.fromOtDashboard) {
      this.router.navigate(['/ot/ot-dashboard']);
    }
    else if (this.fromIVDashboard) {
      this.router.navigate(['/pharmacy/ivf-order-details'])
    }
    else if (this.fromAdmissionRequest) {
      this.router.navigate(['/admission/admissionrequests'])
    }
    else if (this.fromIDDashboard) {
      this.router.navigate(['/pharmacy/individual-details'])
    }
    else if (this.IsHeadNurse == 'true' && !this.IsHome) {
      this.router.navigate(['/emergency/beds']);
    }
    else
      this.router.navigate(['/ward']);

  }


  openNotesModal() {
    var d = new Date(this.patientdata.AdmitDate);
    this.viewMoreDiagnosisForm.patchValue({
      fromdate: d,
      todate: new Date()
    })
    this.IsNoteMore = true;
    setTimeout(() => {
      $("#viewMoreNoteDataModal").modal('show');
    }, 200);

    this.FetchViewMoreNotesData("default");
  }

  FetchViewMoreNotesData(type: any) {
    if (type == "search") {
      this.FetchMainProgressNoteDataListViewMore = this.FetchMainProgressNoteDataListViewMore.filter((data: any) => Date.parse(data.NoteDate.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.NoteDate.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
    }
    else {
      //this.PatientViewMoreSearchDiagnosisList = this.PatientViewMoreDiagnosisList.filter((data:any) => Date.parse(data.CreateDate) >= Date.parse(this.viewMoreForm.get('fromdate')?.value) && Date.parse(data.CreateDate) <= Date.parse(this.viewMoreForm.value['todate']));
    }
  }

  openViewMoremodal(type: string) {
    if (type === 'progressnotes') {
      $("#viewMoreNoteDataModal").modal('show');
    }
    else {
      this.viewMoreType = type;
      this.fetchViewMoreData();
      $("#viewMoreData").modal('show');
    }
  }

  fetchViewMoreData() {
    this.viewMoreData = [];
    if (this.viewMoreType === 'diagnosis') {
      this.viewMoreTypeHeader = "Diagnosis";
      this.PatientDiagnosisListViewMore.forEach((element: any, index: any) => {
        this.viewMoreData.push({
          "Code": element.Code,
          "Name": element.DiseaseName,
          "CreateDate": element.CreateDate
        })
      });
    }
    else if (this.viewMoreType === 'vitals') {
      this.viewMoreTypeHeader = "Vitals";
      this.PatientsVitalsListViewMore.forEach((element: any, index: any) => {
        this.viewMoreData.push({
          "Vital": element.Vital,
          "Value": element.Value,
          "CreateDate": element.Datetime
        })
      });
    }
    else if (this.viewMoreType === 'investigations') {
      this.viewMoreTypeHeader = "Investigations";
      this.PatientInvestigationsListViewMore.forEach((element: any, index: any) => {
        this.viewMoreData.push({
          "Code": element.ItemCode,
          "Name": element.ItemName,
          "CreateDate": element.CreateDate
        })
      });
    }
    else if (this.viewMoreType === 'procedures') {
      this.viewMoreTypeHeader = "Procedures";
      this.PatientProceduresListViewMore.forEach((element: any, index: any) => {
        this.viewMoreData.push({
          "Code": element.ItemCode,
          "Name": element.ItemName,
          "CreateDate": element.CreateDate
        })
      });
    }
    else if (this.viewMoreType === 'medications') {
      this.viewMoreTypeHeader = "Medications";
      this.PatientMedicationsListViewMore.forEach((element: any, index: any) => {
        this.viewMoreData.push({
          "Medicine Name": element.ItemCode,
          "Strength": element.Strength + " " + element.StrengthUOM,
          "Dose": element.Dose + " " + element.DoseUoM,
          "Frequency": element.Frequency,
          "Duration": element.Quantity + " " + element.Unit,
          "Date": element.StartFrom + " " + element.EndDateTime
        })
      });
    }
    else if (this.viewMoreType === 'surgeryrequests') {
      this.viewMoreTypeHeader = "Surgery Requests";
      this.FetchAllSurgeriesDataListViewMore.forEach((element: any, index: any) => {
        this.viewMoreData.push({
          "Name": element.ItemCode,
          "Doctor": element.DoctorName,
          "CreateDate": element.SurgeryDate
        })
      });
    }
    else if (this.viewMoreType === 'bloodrequests') {
      this.viewMoreTypeHeader = "Blood Requests";
      this.FetchBloodRequestDataaListViewMore.forEach((element: any, index: any) => {
        this.viewMoreData.push({
          "Blood Group": element.BloodGroup,
          "CreateDate": element.RequestDatetime
        })
      });
    }
    else if (this.viewMoreType === 'nursinginstructions') {
      this.viewMoreTypeHeader = "Nursing Instructions";
      this.FetchNursingInstructionsDataaListViewMore.forEach((element: any, index: any) => {
        this.viewMoreData.push({
          "Instruction": element.Instruction,
          "Doctor Name": element.DoctorName,
          "Actual Date": element.ActualDateF,
          "Actual Time": element.ActualTime,
          "Acknowledge By User": element.AcknowledgeByUser,
          "Acknowledge Date": element.AcknowledgeDateTimeF
        })
      });
    }
    else if (this.viewMoreType === 'careplan') {
      this.viewMoreTypeHeader = "Care Plan";
      this.FetchCarePlanDataaListViewMore.forEach((element: any, index: any) => {
        this.viewMoreData.push({
          "Plan": element.TreatmentPlan,
          "CreateDate": element.CreateDate
        })
      });
    }
    else if (this.viewMoreType === 'intakeoutput') {
      this.viewMoreTypeHeader = "Intake Output";
      this.FetchInTakeOutPutDataaListViewMore.forEach((element: any, index: any) => {
        this.viewMoreData.push({
          "Intake Output": element.IntakeOutput,
          "Intake": element.Intake,
          "CreateDate": element.CreateDate
        })
      });
    }
  }

  closeViewMoreModal() {
    this.viewMoreData = [];
  }

  keys(): Array<string> {
    return Object.keys(this.viewMoreData);
  }

  openDiagnosisModal() {
    var d = new Date(this.patientdata.AdmitDate);
    this.viewMoreDiagnosisForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    this.IsDiagnosisMore = true;
    setTimeout(() => {
      $("#viewMoreDiagnosisDataModal").modal('show');
    }, 200);

    this.FetchViewMoreDiagnosisData("default");

  }
  openCaseRecordModal() {
    this.viewMoreTypeHeader = "Case Record";
    this.FetchPatientCaseRecord();
  }

  openConsentformsModal() {
    this.viewMoreTypeHeader = "Consent Forms";
    this.FetchPatientadmissionGeneralConsent();
  }

  FetchPatientadmissionGeneralConsent() {
    this.url = this.service.getData(patientfolder.FetchPatientadmissionGeneralConsent, { AdmissionID: this.selectedView.AdmissionID, HospitalID: this.hospitalID });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.admissionGeneralConsent = response.FetchPatientadmissionGeneralConsentDataList;
          this.admissionGeneralConsent.forEach((element: any, index: any) => {
            element.Class = "icon-w cursor-pointer";
          })
        }
      },
        (err) => {

        })
  }

  showConsentFromTypes(type: any) {
    this.consentFromTypes = type;
    if (type === 'generalconsent') {
      this.FetchPatientadmissionGeneralConsent();
    }
    else if (type === 'medicalconsent') {
      this.FetchPatientAdmissionMedicalInformedConsent();
    }
    else if (type === 'HighRiskOperation') {
      this.FetchPatientadmissionAgaintConsentForHighRiskOperations();
    }
  }

  FetchPatientCaseRecord() {
    this.url = this.service.getData(patientfolder.FetchPatientCaseRecordPFF, { 
      AdmissionID: this.admissionID, 
      //PatientID: this.patientdata.PatientID,
      //EpisodeID: 0,
      UHID: this.patientdata.RegCode, 
      UserName: 3000, 
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID, 
      WorkStationID: 3403, 
      HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModal();
        }
      },
        (err) => {

        })
  }
  showModal(): void {
    $("#reviewAndPayment").modal('show');
  }



  FetchViewMoreDiagnosisData(type: any) {
    if (type == "search") {
      this.PatientViewMoreSearchDiagnosisList = this.PatientDiagnosisListViewMore.filter((data: any) => Date.parse(data.CreateDate.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.CreateDate.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
    }
    else {
      //this.PatientViewMoreSearchDiagnosisList = this.PatientViewMoreDiagnosisList.filter((data:any) => Date.parse(data.CreateDate) >= Date.parse(this.viewMoreForm.get('fromdate')?.value) && Date.parse(data.CreateDate) <= Date.parse(this.viewMoreForm.value['todate']));
    }
  }

  FetchViewMoreMedicationsData(type: any) {

    if (type == "search") {

      //this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data: any) => Date.parse(data.StartFrom.split(' ')[0]) >= Date.parse(this.viewMoreMedicationsForm.value['medfromdate']) && Date.parse(data.StartFrom.split(' ')[0]) <= Date.parse(this.viewMoreMedicationsForm.value['medtodate']));
      //var startDate = moment(new Date().setMonth(new Date().getMonth() - 24)).format('DD-MMM-YYYY');

      var startDate = this.patientdata.AdmitDate;
      var endDate = moment(new Date()).format('DD-MMM-YYYY');
      if (this.medStatus == "active") {
        this.PatientViewMoreSearchMedicationsList = this.PatientMedicationsList.filter((data: any) => Date.parse(data.EndDateTime) >= Date.parse(endDate.toString()));
      }
      else {
        this.PatientViewMoreSearchMedicationsList = this.PatientMedicationsList.filter((data: any) => Date.parse(data.StartFrom) >= Date.parse(startDate.toString().split(' ')[0]) && Date.parse(data.EndDateTime) < Date.parse(endDate));
      }
    }
    else {
      //this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data:any) => Date.parse(data.StartFrom) >= Date.parse(this.viewMoreMedicationsForm.get('medfromdate')?.value) && Date.parse(data.StartFrom) <= Date.parse(this.viewMoreMedicationsForm.value['medtodate']));
    }

  }

  changeMedicationStatus(type: any) {
    //var startDate = moment(new Date().setMonth(new Date().getMonth() - 24)).format('DD-MMM-YYYY');
    var startDate = this.patientdata.AdmitDate;
    var endDate = moment(new Date().setDate(new Date().getDate() + 1)).format('DD-MMM-YYYY');
    if (type == "active") {
      this.medStatus = "active";
      this.btnActive = "btn selected";
      this.btnInactive = "btn";
      if (this.PatientViewMoreMedicationsList) {
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data: any) =>
          Date.parse(data.StartFrom.split(' ')[0]) >= Date.parse(moment(data.PrescriptionDate).format('DD-MMM-YYYY')) &&
          Date.parse(data.StartFrom.split(' ')[0]) <= Date.parse(endDate));
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList.filter((data: any) =>
          Date.parse(data.EndDateTime) >= Date.parse(endDate.toString()));
      }
    }
    else {
      this.medStatus = "inactive";
      this.btnActive = "btn";
      this.btnInactive = "btn Statselected";
      if (this.PatientViewMoreMedicationsList) {
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreMedicationsList.filter((data: any) =>
          Date.parse(data.StartFrom.split(' ')[0]) >= Date.parse(moment(data.PrescriptionDate).format('DD-MMM-YYYY')) &&
          Date.parse(data.StartFrom.split(' ')[0]) <= Date.parse(endDate));
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList.filter((data: any) =>
          Date.parse(data.StartFrom) >= Date.parse(startDate.toString().split(' ')[0]) && Date.parse(data.EndDateTime) < Date.parse(endDate));
      }
    }
    this.PatientViewMoreSearchMedicationsList1 = this.PatientViewMoreSearchMedicationsList;
  }
  loadActiveMedication() {
    this.btnActiveMed = "btn btn-select btn-tab";
    this.btnInActiveMed = "btn btn-tab";
    this.displayActMed = "block";
    this.displayInActMed = "none";
  }

  loadInActiveMedication() {
    this.btnInActiveMed = "btn btn-select btn-tab";
    this.btnActiveMed = "btn btn-tab";
    this.displayActMed = "none";
    this.displayInActMed = "block";
  }

  openMedicationsModal() {

    var md = new Date(this.selectedView.AdmitDate);
    this.IsMedicationMore = true;
    this.viewMoreMedicationsForm.patchValue({
      medfromdate: md,
      medtodate: this.toDate.value
    })
    this.changeMedicationStatus("active");
    setTimeout(() => {
      $("#viewMoreMedicationsDataModal").modal('show');
    }, 200);

    this.FetchViewMoreMedicationsData("default");
    this.FetchHoldMaster();

    setTimeout(() => {
      this.createcarousel();
    }, 500);
  }
  maximizeSelectedDrugItems(med: any) {
    const index = this.PatientViewMoreSearchMedicationsList.findIndex((x: any) => x?.ItemID === med.ItemID);
    if (index > -1) {
      this.PatientViewMoreSearchMedicationsList[index].ClassSelected = !this.PatientViewMoreSearchMedicationsList[index].ClassSelected;
      if (this.PatientViewMoreSearchMedicationsList[index].ClassSelected) {
        this.PatientViewMoreSearchMedicationsList[index].Class = "row card_item_div mx-0 w-100 align-items-start maxim";
      } else {
        this.PatientViewMoreSearchMedicationsList[index].Class = "row card_item_div mx-0 w-100 align-items-start maxim";
      }
    }
  }

  createcarousel() {
    // customcarousel
    this.itemContainer = document.getElementById('item-container')!;
    this.prevButton = document.getElementById('prev-btn')!;
    this.nextButton = document.getElementById('next-btn')!;

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
      const cards = this.itemContainer.getElementsByClassName('status_calendar_block');
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
      this.itemsPerPage = 9; // Adjust for mobile view
    }
    this.showItems(this.currentIndex);
  }

  addEventListeners(): void {
    this.prevButton.addEventListener('click', () => this.showPrevItems());
    this.nextButton.addEventListener('click', () => this.showNextItems());
  }
  // customcarouselend==============

  openCareModal() {

    var d = new Date(this.patientdata.AdmitDate);
    this.viewMoreDiagnosisForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    this.IsCareMore = true;
    setTimeout(() => {
      $("#viewMoreCareDataModal").modal('show');
    }, 200);

    this.FetchViewMoreCareData();

  }
  FetchViewMoreCareData() {
    this.PatientViewMoreSearchCareList = this.FetchCarePlanDataaListViewMore.filter((data: any) => Date.parse(data.CreateDate.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.CreateDate.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
  } openeFormModal() {

    var d = new Date(this.patientdata.AdmitDate);
    this.viewMoreForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    this.IseFormMore = true;
    setTimeout(() => {
      $("#viewMoreeFormDataModal").modal('show');
    }, 200);

    this.FetchViewMoreeFormData();

  }
  FetchViewMoreeFormData() {
    this.PatientViewMoreSearcheFormList = this.FetchEFormsDataaListViewMore.filter((data: any) => Date.parse(data.CreateDate.split(' ')[0]) >= Date.parse(this.viewMoreForm.value['fromdate']) && Date.parse(data.CreateDate.split(' ')[0]) <= Date.parse(this.viewMoreForm.value['todate']));
  }

  getSelectedEForm(item: any) {
    // this.config.fetchEFormSelected(this.patientdata.IPID, item.ScreenDesignId, item.PatientTemplateid, this.hospId)
    this.url = this.service.getData(patientfolder.FetchEFormSelected, { Admissionid: this.admissionID, ScreenDesignId: item.ScreenDesignId, PatientTemplateid: item.PatientTemplateid, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchEFormSelectedDataaList = results.FetchEFormSelectedDataaList;
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  openNursingModal() {

    var d = new Date(this.patientdata.AdmitDate);
    this.viewMoreDiagnosisForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    this.IsNursingMore = true;
    setTimeout(() => {
      $("#viewMoreNursingDataModal").modal('show');
    }, 200);

    this.FetchViewMoreNursingData();
  }

  FetchViewMoreNursingData() {
    this.PatientViewMoreSearchNursingList = this.FetchNursingInstructionsDataaListViewMore.filter((data: any) => Date.parse(data.ActualDateF.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.ActualDateF.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
  }

  openInTakeOutPutModal() {

    var d = new Date(this.patientdata.AdmitDate);
    this.viewMoreForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    this.IsInTakeOutMore = true;
    setTimeout(() => {
      $("#viewMoreInTakeOutDataModal").modal('show');
    }, 200);

    this.FetchViewMoreInTakeOutPutData();
  }

  FetchViewMoreInTakeOutPutData() {
    this.PatientViewMoreSearchInTakeOutPutList = this.FetchInTakeOutPutDataaListViewMore.filter((data: any) => Date.parse(data.CreateDate.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.CreateDate.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
  }
  openBloodModal() {
    var d = new Date(this.patientdata.AdmitDate);
    this.viewMoreDiagnosisForm.patchValue({
      fromdate: d,
      todate: this.toDate.value
    })
    this.IsBloodMore = true;
    setTimeout(() => {
      $("#viewMoreBloodDataModal").modal('show');
    }, 200);

    this.FetchViewMoreBloodData();
  }

  FetchViewMoreBloodData() {
    this.PatientViewMoreSearchBloodList = this.FetchBloodRequestDataaListViewMore.filter((data: any) => Date.parse(data.RequestDatetime.split(' ')[0]) >= Date.parse(this.viewMoreDiagnosisForm.value['fromdate']) && Date.parse(data.RequestDatetime.split(' ')[0]) <= Date.parse(this.viewMoreDiagnosisForm.value['todate']));
  }
  GetVitals() {
    $("#modalVitals").modal('show');
    this.GetVitalsData();
  }

  GetVitalsData() {
    var FromDate = moment(this.tableVitalsForm.value['vitalFromDate']).format("DD-MMM-yyyy");
    var ToDate = this.datePipe.transform(this.tableVitalsForm.value['vitalToDate'], "dd-MMM-yyyy")?.toString();
    if (this.visitAdmissionId === '0') {
      this.con.fetchOutPatientData_PF(this.patientdata.RegCode == undefined ? this.patientdata.RegCode : this.patientdata.RegCode, this.admissionID, FromDate, ToDate, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            // this.tableVitalsList = response.PatientVitalsDataList;
            // this.tableVitalsListFiltered = response.PatientVitalsDataList;
            //  this.createChartLine(1);
            this.tableVitalsList = response.PatientVitalsDataList;
            const distinctThings = response.PatientVitalsDataList.filter(
              (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.CreateDateNew === thing.CreateDateNew) === i);
            console.dir(distinctThings);
            this.tableVitalsListFiltered = distinctThings
            this.spline();
          }
        },
          (err) => {

          })
    }
    else
      if (this.patientdata.PatientType == 1) {
        // this.con.fetchOutPatientData_PF(this.patientdata.patientID==undefined?this.patientdata.PatientID:this.patientdata.patientID, FromDate, ToDate, this.hospitalID)
        this.con.FetchPatientVitalsByPatientIdPatientSummary(this.patientdata.patientID == undefined ? this.patientdata.PatientID : this.patientdata.patientID, this.admissionID, FromDate, ToDate, 0)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.tableVitalsList = response.PatientVitalsDataList;
              this.tableVitalsListFiltered = response.PatientVitalsDataList;
              //  this.createChartLine(1);
              this.spline();
            }
          },
            (err) => {

            })
      }
      else {
        //this.con.fetchIPPatientVitals_PF(this.patientdata.patientID==undefined?this.patientdata.PatientID:this.patientdata.patientID, this.admissionID, FromDate, ToDate, this.hospitalID)
        this.con.FetchPatientVitalsByPatientIdPatientSummary(this.patientdata.patientID == undefined ? this.patientdata.PatientID : this.patientdata.patientID, this.admissionID, FromDate, ToDate, 0)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.tableVitalsList = response.PatientVitalsDataList;
              const distinctThings = response.PatientVitalsDataList.filter(
                (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.CreateDateNew === thing.CreateDateNew) === i);
              console.dir(distinctThings);
              this.tableVitalsListFiltered = distinctThings
              //this.createChartLine(2);
              this.spline();
            }
          },
            (err) => {

            })
      }

  }
  filterFunction(vitals: any, visitid: any) {
    return vitals.filter((vital: any) => vital.CreateDateNew == visitid);
  }



  openLabModal() {
    $("#showLabRadTestRsults").modal('show');
  }

  FetchVitalParams() {
    this.GetVitalsData();
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

      //if(type == 1) {
      element.VisitDate = element.VisitDate.split('-')[0];
      //}

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.CreateDateTimeNew, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.CreateDateTimeNew, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.CreateDateTimeNew, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.CreateDateTimeNew, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.CreateDateTimeNew, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.CreateDateTimeNew, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.CreateDateTimeNew, parseFloat(element.Temperature)])
    });

    vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
    { name: 'BP-Diastolic', data: BPDiastolicData },
    { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
    { name: 'Pulse', data: PulseData, visible: false },
    { name: 'Respiration', data: RespirationData, visible: false },
    { name: 'SPO2', data: SPO2Data, visible: false },
    { name: 'Temperature', data: TemparatureData, visible: false }
    ];

    const chart = Highcharts.chart('chart-line', {
      chart: {
        type: 'areaspline',
        zoomType: 'x'
      },
      title: {
        text: 'Vital Graph',
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
        pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
        shared: true,
        valueDecimals: 1,
        useHTML: true,
        crosshairs: [{
          width: 1,
          color: 'Gray'
        }, {
          width: 1,
          color: 'gray'
        }]
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

  areaSpline(): void {
    this.isAreaSplineActive = true;
    this.isSplineActive = false;
    this.isLineActive = false;
    this.isColumnActive = false;
    this.activeButton = 'areaSpline';
    let vitaldata: any = {};
    let type = 1;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];
    this.tableVitalsList.forEach((element: any, index: any) => {

      //if (type == 1) {
      //element.VisitDate = this.patientdata.PatientType == '2' ? element.CreateDateNew : element.VisitDate;
      element.VisitDate = element.CreateDateNew;
      //}

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Temperature)])
    });

    vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
    { name: 'BP-Diastolic', data: BPDiastolicData },
    { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
    { name: 'Pulse', data: PulseData, visible: false },
    { name: 'Respiration', data: RespirationData, visible: false },
    { name: 'SPO2', data: SPO2Data, visible: false },
    { name: 'Temperature', data: TemparatureData, visible: false }
    ];
    this.charAreaSpline = Highcharts.chart(this.chartLineAreaSpline.nativeElement, {
      chart: {
        type: 'areaspline',
        zoomType: 'x'
      },
      title: {
        text: 'Vital Graph',
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
        pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
        shared: true,
        valueDecimals: 1,
        useHTML: true,
        crosshairs: [{
          width: 1,
          color: 'Gray'
        }, {
          width: 1,
          color: 'gray'
        }]
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
  spline() {
    this.isAreaSplineActive = false;
    this.isSplineActive = true;
    this.isLineActive = false;
    this.isColumnActive = false;
    this.activeButton = 'spline';
    let vitaldata: any = {};
    let type = 1;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];


    this.tableVitalsList.forEach((element: any, index: any) => {

      //if (type == 1) {
      // element.VisitDate = this.patientdata.PatientType == '2' ? element.CreateDateNew : element.VisitDate;
      element.VisitDate = element.CreateDateNew;
      //}

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Temperature)])
    });

    vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
    { name: 'BP-Diastolic', data: BPDiastolicData },
    { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
    { name: 'Pulse', data: PulseData, visible: false },
    { name: 'Respiration', data: RespirationData, visible: false },
    { name: 'SPO2', data: SPO2Data, visible: false },
    { name: 'Temperature', data: TemparatureData, visible: false }
    ];
    this.charAreaSpline = Highcharts.chart(this.chartLineSpline.nativeElement, {
      chart: {
        type: 'spline',
        zoomType: 'x'
      },
      title: {
        text: 'Vital Graph',
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
        pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
        shared: true,
        valueDecimals: 1,
        useHTML: true,
        crosshairs: [{
          width: 1,
          color: 'Gray'
        }, {
          width: 1,
          color: 'gray'
        }]
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
  line() {
    this.isAreaSplineActive = false;
    this.isSplineActive = false;
    this.isLineActive = true;
    this.isColumnActive = false;
    this.activeButton = 'line';
    let vitaldata: any = {};
    let type = 1;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];

    this.tableVitalsList.forEach((element: any, index: any) => {
      //if (type == 1) {
      //element.VisitDate = this.patientdata.PatientType == '2' ? element.CreateDateNew : element.VisitDate;
      element.VisitDate = element.CreateDateNew;
      //}

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Temperature)])
    });

    vitaldata = [
      { name: 'BP-Systolic', data: BPSystolicData },
      { name: 'BP-Diastolic', data: BPDiastolicData },
      { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
      { name: 'Pulse', data: PulseData, visible: false },
      { name: 'Respiration', data: RespirationData, visible: false },
      { name: 'SPO2', data: SPO2Data, visible: false },
      { name: 'Temperature', data: TemparatureData, visible: false }
    ];

    this.charAreaSpline = Highcharts.chart(this.chartLine.nativeElement, {
      chart: {
        type: 'line',
        zoomType: 'x'
      },
      title: {
        text: 'Vital Graph',
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
        pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
        shared: true,
        valueDecimals: 1,
        useHTML: true,
        crosshairs: [{
          width: 1,
          color: 'Gray'
        }, {
          width: 1,
          color: 'gray'
        }]
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
  column() {
    this.isAreaSplineActive = false;
    this.isSplineActive = false;
    this.isLineActive = false;
    this.isColumnActive = true;
    this.activeButton = 'column';
    let vitaldata: any = {};
    let type = 1;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];

    this.tableVitalsList.forEach((element: any, index: any) => {
      //if (type == 1) {
      //element.VisitDate = this.patientdata.PatientType == '2' ? element.CreateDateNew : element.VisitDate;
      element.VisitDate = element.CreateDateNew;
      //}

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Temperature)])
    });

    vitaldata = [
      { name: 'BP-Systolic', data: BPSystolicData },
      { name: 'BP-Diastolic', data: BPDiastolicData },
      { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
      { name: 'Pulse', data: PulseData, visible: false },
      { name: 'Respiration', data: RespirationData, visible: false },
      { name: 'SPO2', data: SPO2Data, visible: false },
      { name: 'Temperature', data: TemparatureData, visible: false }
    ];

    this.charAreaSpline = Highcharts.chart(this.chartColumn.nativeElement, {
      chart: {
        type: 'column',
        zoomType: 'x'
      },
      title: {
        text: 'Vital Graph',
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
        pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
        shared: true,
        valueDecimals: 1,
        useHTML: true,
        crosshairs: [{
          width: 1,
          color: 'Gray'
        }, {
          width: 1,
          color: 'gray'
        }]
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

  openProceduresModal() {
    var d = new Date(this.patientdata.AdmitDate);
    this.IsProcedureMore = true;
    this.viewMoreProceduresForm.patchValue({
      procfromdate: d,
      proctodate: this.toDate.value
    })
    setTimeout(() => {
      $("#viewMoreProceduresDataModal").modal('show');
    }, 200);

    this.FetchViewMoreProceduressData();
  }

  FetchViewMoreProceduressData() {
    this.PatientProceduresFilterViewMoreList = this.PatientProceduresListViewMore.filter((data: any) => Date.parse(data.CreateDate.split(' ')[0]) >= Date.parse(this.viewMoreProceduresForm.value['procfromdate']) && Date.parse(data.CreateDate.split(' ')[0]) <= Date.parse(this.viewMoreProceduresForm.value['proctodate']));
  }

  clearPatientFolder() {
    $("#txtSsn").val('');
    this.noPatientSelected = false;
    this.childSsn = "";

    this.Blocktype = "";
    this.Blockreason = "";
    this.EffectiveDate = "";
    this.Discription = "";

    this.motherDetails = [];
    this.episodeId;
    this.PatientDiagnosisList = [];
    this.PatientDiagnosisListViewMore;
    this.PatientViewMoreSearchDiagnosisList = [];
    this.PatientInvestigationsList;
    this.PatientInvestigationsListViewMore;
    this.PatientRadiologyList = [];
    this.PatientRadiologyListViewMore = [];
    this.PatientProceduresList = [];
    this.PatientProceduresListViewMore = [];
    this.PatientsVitalsList = [];
    this.PatientsVitalsListViewMore = [];
    this.PatientsAssessmentsList = [];
    this.PatientsAssessmentsListViewMore = [];
    this.PatientType = "";
    this.PatientID = ""
    this.PatientMedicationsList = [];
    this.PatientMedicationsListViewMore = [];
    this.patientdata = [];
    this.bpSystolic = "";
    this.bpSysVal = "";
    this.bpDiastolic = "";
    this.bpDiaVal = "";
    this.temperature = "";
    this.tempVal = "";
    this.pulse = "";
    this.pulseVal = "";
    this.spo2 = "";
    this.respiration = "";
    this.consciousness = "";
    this.o2FlowRate = "";
    this.serviceType = 'investigations';
    this.patientActiveMedicationList = [];
    this.patientActiveMedicationListViewMore = [];
    this.patientInActiveMedicationList = [];
    this.patientInActiveMedicationListViewMore = [];
    this.vitalsDatetime = "";
    this.medicationType = 'active';
    this.servicesCount = 0;
    this.FetchBloodRequestDataaList = [];
    this.FetchBloodRequestDataaListViewMore = [];
    this.FetchAllSurgeriesDataList = [];
    this.FetchAllSurgeriesDataListViewMore = [];
    this.FetchEFormsDataaList = [];
    this.FetchEFormsDataaListViewMore = [];
    this.FetchMainProgressNoteDataList = [];
    this.FetchMainProgressNoteDataListViewMore = [];
    this.FetchNursingInstructionsDataaList = [];
    this.FetchNursingInstructionsDataaListViewMore = [];
    this.FetchCarePlanDataaList = [];
    this.FetchCarePlanDataaListViewMore = [];
    this.FetchInTakeOutPutDataaList = [];
    this.FetchInTakeOutPutDataaListViewMore = [];
    this.viewMoreData = [];
    this.viewMoreDataHeaders = [];
    this.viewMoreType = "";
    this.viewMoreTypeHeader = "";
    this.facility = [];
    this.IsDiagnosisMore = false;
    this.PatientViewMoreSearchCareList = [];
    this.PatientViewMoreSearchNoteList = [];
    this.PatientViewMoreSearchMedicationsList = [];
    this.PatientViewMoreSearchLabList;
    this.PatientViewMoreSearcheFormList = [];
    this.PatientViewMoreSearchNursingList = [];
    this.PatientViewMoreSearchInTakeOutPutList = [];
    this.PatientViewMoreSearchBloodList = [];
    this.IsCareMore = false;
    this.IseFormMore = false;
    this.IsNursingMore = false;
    this.IsBloodMore = false;
    this.IsInTakeOutMore = false;
    this.IsMedicationMore = false;
    this.IsProcedureMore = false;
    this.IsNoteMore = false;
    this.tableVitalsList;
    this.tableVitalsListFiltered = [];
    this.FetchEFormSelectedDataaList = [];
    this.btnActive = "btn selected";
    this.btnInactive = "btn";
    this.medStatus = "active";
    this.btnActiveMed = "btn btn-select btn-tab";
    this.PatientProceduresFilterViewMoreList = [];
    this.activeButton = 'spline';
    this.interval = "";
    this.location = "";
    this.SelectedViewClass = "";
    this.isdetailShow = false;
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
  }

  FetchHoldMaster() {
    this.url = this.service.getData(patientfolder.FetchMedicationHold, { Demographic: 824, UserId: this.doctorDetails[0].EmpId, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe(
        (response) => {
          if (response.Code === 200) {
            this.holdMasterList = response.FetchMedicationHoldDataList;
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }
  selectedHoldItem(index: any) {
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
    $("#holdRemarksLabel").modal('show');
  }
  showHoldReasonPopUp() {
    $("#holdRemarksLabel").modal('show');
  }
  selectedHoldReasonEvent(event: any) {
    this.selectedHoldReason = event.target.value;
  }
  clearHoldReason(rem: any) {
    rem.value = "";
    this.selectedHoldReason = "0";
  }
  holdPrescriptionItem(med: any, rem: any, btName: string) {
    if (this.selectedHoldReason != "0" && rem.value != "") {
      $("#hold_remarks").modal('hide');
      var currentDate = this.datePipe.transform(new Date(), "dd-MM-yyyy HH:MM")?.toString();
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
      this.us.post(patientfolder.holdPrescriptionItems, holdPayload).subscribe((response) => {
        if (response.Code == 200) {

          $("#holdMedSaveMsg").modal('show');
        } else {

        }
      },
        (err) => {
          console.log(err)
        })
    }
    else {
      this.holdReasonValidation = true;
      $("#holdRemarksLabel").modal('show');
    }
  }

  selectedDiscontinuedItem(index: any) {
    this.remarksForSelectedDiscontinuedItemName = index.ItemName;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedDiscontinuedItemId = index.ItemId;
    this.remarksForSelectedDiscontinuedPrescId = index.PrescriptionID;
    $("#discontinueRem").val('');
    $("#discontinue_remarks").modal('show');
  }

  discontinuePrescriptionItem(med: any, rem: any, type: string) {
    var discontinueMedXml = [
      {
        "PID": this.remarksForSelectedDiscontinuedPrescId,
        "IID": this.remarksForSelectedDiscontinuedItemId,
        "MID": 0,
        "DCR": rem.value
      }
    ]

    let advReactionPayload = {
      "DoctorID": this.doctorDetails[0].EmpId,
      "BlockPresItemsXML": discontinueMedXml
    }
    this.us.post(patientfolder.BlockPrescriptionItems, advReactionPayload).subscribe((response) => {
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
      })
  }

  goToPreviousWeek() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.calculateWeekRange();
  }

  goToNextWeek() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.calculateWeekRange();
  }

  calculateWeekRange() {
    const currentDay = this.currentDate.getDay();

    this.firstDayOfWeek = new Date(this.currentDate);
    this.firstDayOfWeek.setDate(this.currentDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1));

    this.lastDayOfWeek = new Date(this.firstDayOfWeek);
    this.lastDayOfWeek.setDate(this.firstDayOfWeek.getDate() + 6);

    this.currentWeekDates = this.generateDateRange(this.firstDayOfWeek, this.lastDayOfWeek);
    this.currentWeekdate = this.firstDayOfWeek;
    this.FetchDrugAdministrationDrugs(moment(this.firstDayOfWeek).format("DD-MMM-YYYY"), moment(this.lastDayOfWeek).format("DD-MMM-YYYY"));

  }
  FetchDrugAdministrationDrugs1(FromDate: any, ToDate: any) {
    this.url = this.service.getData(patientfolder.FetchDrugAdministrationDrugs, { FromDate: FromDate, ToDate: ToDate, IPID: this.admissionID, HospitalID: this.hospitalID });
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.calendarMedications = response.FetchDrugAdministrationDrugsDataList;
        this.calendarFilteredMedications = response.FetchDrugAdministrationDrugsDataList;
        this.timeSlots = [];
        this.generateTimeSlots();
        this.generateDateArray();
        $("#modalCalender").modal('show');
        setTimeout(() => {
          this.scrollToCurrentTime()
        }, 1000);
      }
    },
      (err) => { })
  }
  FetchDrugAdministrationDrugs(FromDate: any, ToDate: any) {
    this.url = this.service.getData(patientfolder.FetchDrugAdministrationDrugs, { FromDate: FromDate, ToDate: ToDate, IPID: this.admissionID, HospitalID: this.hospitalID });
    this.us.get(this.url).subscribe((response: any) => {
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
              Drugname: firstItem.Drugname + ';' + Dose + ';' + StartDate,
              FrequencyDate: firstItem.FrequencyDate,
              FrequencyDateTime: group.map((item: any) => item.FrequencyDateTime)
            };
            this.drugDataArray.push(drugData);
          }
        }

        this.drugs = this.drugDataArray.reduce((acc, item) => {
          const name = (item.Drugname || '').trim();
          if (name && !acc.set.has(name)) {
            acc.set.add(name);
            acc.list.push(name);
          }
          return acc;
        }, { set: new Set(), list: [] }).list;
        
      }
    },
      (err) => { })
  }
  fetchMedicineForChart(date: any, drugName: any) {
    const result = this.drugDataArray?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date) && data.Drugname === drugName);
    if (result.length > 0) {
      return result[0].FrequencyDateTime;
    }
    return null;
  }
  fetchMedicineForChartlength(date: any, drugName: any) {
    const result = this.drugDataArray?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date) && data.Drugname === drugName);
    return result.length;
  }
  processTime(inputTime: any, inputDate: any) {
    let currentDate = new Date();

    const parts = inputDate.split('-');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(parts[1]);
    const inputDateTime = new Date(parts[2], monthIndex, parts[0], inputTime.split(':')[0], inputTime.split(':')[1]);

    inputDateTime.setHours(inputDateTime.getHours() - 2);

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

  scrollToCurrentTime() {
    const currentTimeElement = this.timeSlotsContainer.nativeElement.querySelector(`[data-time="${this.getCurrentTime()}"]`);

    if (currentTimeElement) {
      currentTimeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    return `${hours}:00`;
  }
  showDetails() {
    this.viewMoreTypeHeader = "Drug Administration Chart";
    this.IsDrugAdmChartMore = true;
    this.calculateWeekRange();
    this.timeSlots = [];
    this.generateTimeSlots();
    //this.generateDateArray();
    this.generateCustomDateArray();
    //$("#modalNewCalender").modal('show');
    setTimeout(() => {
      this.scrollToCurrentTime()
    }, 1000);
    setTimeout(() => {
      this.createcarousel();
    }, 500);
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
  generateTimeSlots() {
    for (let hour = 0; hour < 24; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      this.timeSlots.push(timeSlot);
    }
  }
  generateDateArray() {
    const currentDay = this.currentDate.getDay();
    const diff = currentDay - 1;

    this.firstDayOfWeek = new Date(this.currentDate);
    this.firstDayOfWeek.setDate(this.currentDate.getDate() - diff);

    this.lastDayOfWeek = new Date(this.firstDayOfWeek);

    this.lastDayOfWeek.setDate(this.firstDayOfWeek.getDate() + 20);

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
  addremoveclass(classname: any, event: Event) {
    event.stopPropagation();
    if (classname.STATUSColor.includes('maxim')) {
      classname.STATUSColor = classname.STATUSColor.replace(' maxim', ' ');
    }
    else {
      classname.STATUSColor = classname.STATUSColor + " maxim";
    }
  }
  timeselected(date: any) {
    this.selectedDate = date;
  }
  getDetails(date: any, slot: any) {
    return this.calendarMedications?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date.fullDate) && data.FrequencyDateTime === slot)
  }
  toggleSelectionForm(formCtrlName: string, val: string) {
    if (val != undefined)
      this.surgeryNotesForm.controls[formCtrlName].setValue(val);
  }
  base64NurseSignature1(event: any) {
    this.surgeryNotesForm.patchValue({ DoctorSignature: event });
  }
  fetchDiagnosis() {

    this.url = this.service.getData(patientfolder.FetchAdviceDiagnosis, {
      Admissionid: this.selectedView.AdmissionID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          this.patientDiagnosis = response.PatientDiagnosisDataList;
        }
      },
        (err) => {
        })
  }
  openSurgeryNotes(sur: any) {
    this.url = this.service.getData(patientfolder.FetchPatientSurgeryNote, { SurgeryRequestID: sur.SurgeryRequestID, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientSurgeryNoteDataList.length > 0) {
          this.showSurgeryNotes = true;
          this.savedSurgeryNotes = response.FetchPatientSurgeryNoteDataList[0];
          for (let key in this.savedSurgeryNotes) {
            this.toggleSelectionForm(key, this.savedSurgeryNotes[key]);
          }
          this.base64StringSig1 = this.savedSurgeryNotes.DoctorSignature;
          this.showSignature = false;
          setTimeout(() => {
            this.showSignature = true;
          }, 0);
          this.fetchDiagnosis();
        }
      },
        (err) => {
        })
  }

  openSurgeryRecordModal(sur: any) {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'openSurgeryRecordModal'
    };
    const modalRef = this.modalService.openModal(SurgeryrecordComponent, {
      data: sur,
      readonly: true,
      selectedView: this.selectedView
    }, options);
  }

  openSurgeryNotesModal(sur: any) {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(OtSurgerynotesComponent, {
      data: sur,
      readonly: true,
      selectedView: this.selectedView
    }, options);
  }

  openPreoperativeChecklist(sur: any) {
    this.modalTitle = 'Pre-operative Checklist';
    this.modalType = 'preoperative';
    this.patientFolderSurgeryId = sur.SurgeryRequestID;
    this.isShowModal = false;
    this.selectedView.surgeryRequest = sur;
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.selectedView));
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));

    $('#PreOpChecklistModal').modal('show');
    setTimeout(() => {
      this.isShowModal = true;
    }, 100);
  }

  openSurgicalSafetyChecklist(sur: any) {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'openSurgicalSafetyChecklist'
    };
    const modalRef = this.modalService.openModal(SurgicalSafetyChecklistComponent, {
      data: sur,
      readonly: true,
      selectedView: this.selectedView
    }, options);
  }

  openCountingSheet(sur: any) {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(OrNursesComponent, {
      data: sur,
      readonly: true,
      selectedView: this.selectedView
    }, options);
  }

  openSurgeryRecord(sur: any) {
    this.IsSurgeryRecordViewMore = true;
    this.url = this.service.getData(patientfolder.FetchSurgeryorders, { OrderID: sur.OrderID, UserID: this.doctorDetails[0].UserId, WorkstationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Code == 200 && response.FetchSurgeryorders1DataList.length > 0) {
        //this.surgeryRequests = response.FetchSurgeryorders1DataList
        this.surgeryRequests = []; this.resourceDetails = []; this.surgeonDetails = []; this.surgeryActivities = [];
        response.FetchSurgeryorders1DataList.forEach((element: any, index: any) => {
          this.surgeryRequests.push({
            "Code": element.ProcedureId,
            "SurgeryName": element.ProcedureName,
            "PriorityID": element.PriorityID,
            "Priority": element.Priority,
            "Seq": element.Sequence,
            "FromTime": moment(element.FromDateTime).format('HH:mm'),
            "ToTime": moment(element.ToDateTime).format('HH:mm'),
            "IsPrimary": element.IsPrimary === 'True' ? true : false,
            "SurgeryDate": element.OStartTime
          });
        });
        response.FetchSurgeryorders2DataList.forEach((element: any, index: any) => {
          this.resourceDetails.push({
            "Resource": element.ServiceItemName,
            "ResourceID": element.ServiceItemID,
            "ResourceType": element.DomainName,
            "ResourceTypeID": element.DomainID,
            "Seq": element.sequence,
            "FromTime": moment(element.FromDateTime).format('HH:mm'),
            "ToTime": moment(element.ToDateTime).format('HH:mm')
          });
        });
        this.surgeonDetails = this.resourceDetails.find((x: any) => x.ResourceTypeID === '82');
        this.anesthetiaTypeList = response.FetchSurgeryorders1DataList[0];
        if (this.anesthetiaTypeList) {
          this.anesthetiaTypeList.OrderDate = moment(this.anesthetiaTypeList.OrderDate).format('DD-MMM-YYYY HH:mm')
        }

        response.SurgeryOrderActivitiesDataList.forEach((element: any, index: any) => {
          this.surgeryActivities.push({
            "SurgeryActivityName": element.SurgeryActivityName,
            "SurgeryActivityID": element.SurgeryActivityID,
            "ActivityDate": element.ActualDateTime != '' ? moment(element.ActualDateTime).format('DD-MMM-YYYY HH:mm') : '',
            "ActivityTime": element.ActualDateTime,
            "ActivityRemarks": element.ReasonforDelay
          });
        });
        response.SurgeryOrderPositioningDataList.forEach((element: any, index: any) => {
          let find = this.positioningData.find((x: any) => x.id === element.PositioningDuringSurgeryID);
          if (find) {
            find.selected = true;
          }
        });
        response.SurgeryOrderPoistioningDevicesDataList.forEach((element: any, index: any) => {
          let find = this.positioningDevicesData.find((x: any) => x.id === element.PositioningDeviceID);
          if (find) {
            find.selected = true;
          }
        });

        $("#viewSurgeryRecordDataModal").modal('show');
      }
    },
      (err) => { })
  }


  openBathCareModal(bath: any) {
    this.IsBathViewMore = true;
    this.FetchPatientBathSideCareFromDataaListViewMore = this.FetchPatientBathSideCareFromDataaList.filter((x: any) => x.PatientBathingCareID === bath.PatientBathingCareID);
    setTimeout(() => {
      $("#viewBathingCareModal").modal('show');
    }, 200);
  }
  openBedSideCareModal(bed: any) {
    this.IsBedSideViewMore = true;
    this.FetchPatientBedSideCareFromDataaListViewMore = this.FetchPatientBedSideCareFromDataaList.filter((x: any) => x.PatientBedSideCareID === bed.PatientBedSideCareID);
    setTimeout(() => {
      $("#viewBedSideCareModal").modal('show');
    }, 200);
  }
  openShiftHandoverModal(shift: any) {
    //this.IsShiftHandoverViewMore = true;
    //pdf to open
  }

  openSickLeave(sickleave: any) {
    this.url = this.service.getData(patientfolder.FetchPatientSickLeavePDF, { AdmissionID: this.admissionID, SickLeaveID: sickleave.SickLeaveID, HospitalID: this.hospitalID });
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.sickleavePdfDetails = response;
        this.trustedUrl = response?.FTPPATH;
        this.showSickLeaveModal();
      }
    });
  }
  showSickLeaveModal(): void {
    $("#SickLeaveViewModal").modal('show');
  }
  openMedicalCertificate(medcert: any) {
    this.url = this.service.getData(patientfolder.FetchMedicalCertificatePDF, { RegCode: this.patientdata.RegCode, PatientID: this.PatientID, MedicalCertificationID: medcert.MedicalCertificationID, HospitalID: this.hospitalID });
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.medcertPdfDetails = response;
        this.trustedUrl = response?.FTPPATH;
        this.showMedCertModal();
      }
    })
  }
  showMedCertModal() {
    $("#MedCertViewModal").modal('show');
  }

  resultSpline(): void {
    this.isResultAreaSplineActive = false;
    this.isResultSplineActive = true;
    this.isResultLineActive = false;
    this.isResultcolumnActive = false;
    this.activeResultButton = 'Spline';

    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseInt(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'spline',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'spline',
        zoomType: 'x',
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
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        headerFormat: '<div>Date: {point.key}</div>',
        pointFormat: '<div>{series.name}: {point.y}</div>',
        shared: true,
        useHTML: true,
      },
      series: series,
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
        trackBorderRadius: 7,
      },
    } as any);
  }
  resultAreaSpline(): void {
    this.isResultAreaSplineActive = true;
    this.isResultSplineActive = false;
    this.isResultLineActive = false;
    this.isResultcolumnActive = false;
    this.activeResultButton = 'areaSpline';
    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseInt(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'areaspline',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'areaspline',
        zoomType: 'x',
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
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        headerFormat: '<div>Date: {point.key}</div>',
        pointFormat: '<div>{series.name}: {point.y}</div>',
        shared: true,
        useHTML: true,
      },
      series: series,
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
        trackBorderRadius: 7,
      },
    } as any);
  }
  resultLine(): void {
    this.isResultAreaSplineActive = false;
    this.isResultSplineActive = false;
    this.isResultLineActive = true;
    this.isResultcolumnActive = false;
    this.activeResultButton = 'line';
    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseInt(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'line',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'line',
        zoomType: 'x',
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
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        headerFormat: '<div>Date: {point.key}</div>',
        pointFormat: '<div>{series.name}: {point.y}</div>',
        shared: true,
        useHTML: true,
      },
      series: series,
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
        trackBorderRadius: 7,
      },
    } as any);
  }
  resultColumn(): void {
    this.isResultAreaSplineActive = true;
    this.isResultSplineActive = false;
    this.isResultLineActive = false;
    this.isResultcolumnActive = true;
    this.activeResultButton = 'column';
    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseInt(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'column',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'column',
        zoomType: 'x',
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
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        headerFormat: '<div>Date: {point.key}</div>',
        pointFormat: '<div>{series.name}: {point.y}</div>',
        shared: true,
        useHTML: true,
      },
      series: series,
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
        trackBorderRadius: 7,
      },
    } as any);
  }
  private createResultsChart(): void {
    const dates = this.testGraphsData.map((data: any) => data.ResultsDate);
    const testValues: { [key: string]: number[] } = {};

    for (const data of this.testGraphsData) {
      for (const key in data) {
        if (key !== 'ResultsDate') {
          if (!testValues[key]) {
            testValues[key] = [];
          }

          testValues[key].push(parseInt(data[key]));
        }
      }
    }

    const series: Highcharts.SeriesOptionsType[] = Object.keys(testValues).map((key) => {
      return {
        name: key,
        type: 'spline',
        data: testValues[key],
      };
    });

    const chart = Highcharts.chart('lab-test', {
      chart: {
        type: 'spline',
        zoomType: 'x',
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
      },
      xAxis: {
        type: 'category',
        categories: dates,
      },
      tooltip: {
        useHTML: true,
        shared: true,
        formatter: function (this: Highcharts.TooltipFormatterContextObject): string {
          let tooltipContent = '<table>';

          tooltipContent += '<tr><td>Date:</td><td>' + this.x + '</td></tr>';

          this.points?.forEach(point => {
            tooltipContent += '<tr><td>' + point.series.name + ':</td><td>' + point.y + '</td></tr>';
          });

          tooltipContent += '</table>';
          return tooltipContent;
        }
      },
      series: series,
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
        trackBorderRadius: 7,
      },
    } as any);
  }

  FetchPatientBedSideCareForm() {
    // this.url = this.service.getData(patientfolder.fetchPatientBedSideCareFrom, {
    //   Admissionid: this.admissionID,
    //   FromDate: this.selectedView.AdmitDate,
    //   ToDate: moment(new Date()).format('DD-MMM-YYYY'),
    //   HospitalID: this.hospitalID
    // });
    this.bedSideitems=[];
    this.url = this.service.getData(patientfolder.FetchPatientBedSideCareFromPF, {
      UHID: this.patientdata?.RegCode,
      Admissionid: this.admissionID,
      WorkStationID: this.wardID,     
      HospitalID: this.hospitalID
    });
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Code == 200 && response.FetchPatientBedSideCareFromDataaList.length > 0) {
        this.bedSideitems = response.FetchPatientBedSideCareFromDataaList;
      }

    },
      (err) => {
      })
  }

  FetchPatientBathingCareForm() {
    this.url = this.service.getData(patientfolder.FetchPatientBathSideCareFrom, {
      Admissionid: this.admissionID,
      FromDate: this.selectedView.AdmitDate,
      ToDate: moment(new Date()).format('DD-MMM-YYYY'),
      HospitalID: this.hospitalID
    });
    this.us.get(this.url).subscribe((response: any) => {
      if (response.Code == 200 && response.FetchPatientBathSideCareFromDataaList.length > 0) {
        this.bathingCareitems = response.FetchPatientBathSideCareFromDataaList;
      }

    },
      (err) => {
      })
  }

  showVteAssessmentView(type: string) {
    this.vteAssessmentType = type;
    if (type === 'med') {
      this.fetchVteRiskAssessment();
    }
    else if (type === 'sur') {
      this.fetchVteSurgicalRiskAssessment();
    }
    else if (type === 'obg') {
      this.FetchPatientFinalObgVTEFrom();
    }
  }
  //VTE-Medical
  fetchVteRiskAssessment() {
    this.url = this.service.getData(patientfolder.FetchFinalSaveVTERiskAssessment, {
      AdmissionID: this.selectedView.AdmissionID,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchFinalSaveVTERiskAssessmentDataList.length > 0) {
          this.savedRiskAssessmentDetails = response.FetchFinalSaveVTERiskAssessmentDataList.filter((x: any) => x.AssessmentType === 'VTE Medical');
        }
        else {

        }
      },
        (err) => {
        })
  }
  //VTE-Surgical
  fetchVteSurgicalRiskAssessment() {
    this.url = this.service.getData(patientfolder.FetchFinalSaveVTESurgicalRiskAssessment, {
      AdmissionID: this.selectedView.AdmissionID,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchFinalSaveVTERiskAssessmentDataList.length > 0) {
          this.savedSurgicalRiskAssessmentDetails = response.FetchFinalSaveVTERiskAssessmentDataList.filter((x: any) => x.AssessmentType === 'VTE Surgery');
        }
        else {

        }
      },
        (err) => {
        })
  }

  //VTE-OBG
  FetchPatientFinalObgVTEFrom() {
    this.url = this.service.getData(patientfolder.FetchPatientFinalObgVTEFrom, { PatientObgVTEID: 0, AdmissionID: this.selectedView.AdmissionID, UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatientFinalObgVTEFromPatDataList = response.FetchPatientFinalObgVTEFromPatDataList;

        }
      },
        (err) => {
        })
  }

  view(key: any, value: any) {

    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    if (key === 'med') {
      const modalRef = this.modalService.openModal(VteRiskAssessmentComponent, {
        data: value,
        readonly: true
      }, options);
    }
    else if (key === 'sur') {
      const modalRef = this.modalService.openModal(VteSurgicalRiskAssessmentComponent, {
        data: value,
        readonly: true
      }, options);
    }
    else if (key === 'obg') {
      const modalRef = this.modalService.openModal(VteObgAssessmentComponent, {
        data: value,
        readonly: true
      }, options);
    }
    else if (key === 'bs') {
      const filteredData = this.FetchBradenScaleSelctedViewDataList.filter((item: any) => item.RiskAssessmentOrderID === value.RiskAssessmentOrderID);
      const modalRef = this.modalService.openModal(BradenScaleComponent, {
        data: filteredData,
        readonly: true
      }, options);
    }
    else if (key === 'fs') {
      if (Number(this.patientdata.Age) > 14 && this.patientdata.AgeUoMID == '1') {
        const filteredData = this.FetchBradenScaleSelctedViewDataList.filter((item: any) => item.RiskAssessmentOrderID === value.RiskAssessmentOrderID);
        const modalRef = this.modalService.openModal(FallRiskAssessmentComponent, {
          data: filteredData,
          readonly: true
        }, options);
      }
      else {
        const filteredData = this.FetchBradenScaleSelctedViewDataList.filter((item: any) => item.RiskAssessmentOrderID === value.RiskAssessmentOrderID);
        const modalRef = this.modalService.openModal(PediaFallriskAssessmentComponent, {
          data: filteredData,
          readonly: true
        }, options);
      }
    }

    else if (key === 'fr') {
      const filteredData = this.painAssessmentWorklist.filter((item: any) => item.PainScoreID === value.PainScoreID);
      this.url = this.service.getData(patientfolder.FetchPainAssessmentOrderItems, { PainAssessmentOrderID: value.PainAssessmentOrderID, WorkStationID: this.wardID, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.painAssessmentWorklistDetails = [];
            this.painAssessmentWorklistDetails.push(response.FetchPainAssessmentOrderItemsDataList);
            this.painAssessmentWorklistDetails.push(response.FetchPainAssessmentNonVerbalItemsDataList);
            this.painAssessmentWorklistDetails.push(response.FetchPainAssessmentIntervenationDataList);
            this.painAssessmentWorklistDetails.push(response.FetchPainAssessmentAdverseDrugDataList);
            const modalRef = this.modalService.openModal(PatientAssessmentToolComponent, {
              data: this.painAssessmentWorklistDetails,
              readonly: true
            }, options);
          }
        },
          (err) => {
          })

    }

    else if (key === 'generalconsent') {
      const modalRef = this.modalService.openModal(GeneralconsentComponent, {
        data: value,
        readonly: true
      }, options);
    }

    else if (key === 'medicalconsent') {
      const modalRef = this.modalService.openModal(ConsentMedicalComponent, {
        data: value,
        readonly: true
      }, options);
    }

    else if (key === 'HighRiskOperation') {
      const modalRef = this.modalService.openModal(ConsentHroComponent, {
        data: value,
        readonly: true
      }, options);
    } else if (key === 're') {
      const modalRef = this.modalService.openModal(PhysiotherapyResultentryComponent, {
        data: value,
        readonly: true
      }, options);
    }
  }

  openCarePlanModal(value: any) {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(CarePlanComponent, {
        data: this.selectedView,
        readonly: true
    }, options);
  }

  fetchPatientEndoTotalRequest() {
    this.url = this.service.getData(patientfolder.PatientEndoTotalRequest, { IPID: this.selectedView.AdmissionID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.PatientEndoTotalRequestDataList = response.PatientEndoTotalRequestDataList;
        }
      },
        (err) => {
        })
  }

  patientPreProcedureAssessmentData(item: any) {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal ehr_EndoscopeComponent'
    };
    const modalRef = this.modalService.openModal(EndoscopeComponent, {
      data: item,
      readonly: true
    }, options);
  }
  fetchDietRequisitionADV() {
    const url = this.service.getData(patientfolder.FetchDietRequisitionADV, {
      Type: "0",
      Filter: "IPID=" + this.selectedView.AdmissionID,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.wardID,
      Hospitalid: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchDietRequisitionDataList.length > 0) {
          this.FetchDietRequisitionDataList = response.FetchDietRequisitionDataList;
        }
      },
        (err) => {
        })
  }
  viewDietChart(pln: any) {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(DietCounsellingComponent, {
      data: pln,
      readonly: true
    }, options);
  }

  FetchBradenScaleView() {
    const fromdate = this.bradenScaleForm.get("fromdate")?.value;
    const todate = this.bradenScaleForm.get("todate")?.value;
    this.url = this.service.getData(patientfolder.FetchBradenScaleView, { IPID: this.admissionID, FromDate: moment(fromdate).format('DD-MMM-YYYY'), ToDate: moment(todate).format('DD-MMM-YYYY'), UserID: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchBradenScaleViewDataList = results.FetchBradenScaleViewDataHHList;
            this.FetchBradenScaleSelctedViewDataList = results.FetchBradenScaleSelctedViewDataList;
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  FetchFallRiskView() {
    const fromdate = this.bradenScaleForm.get("fromdate")?.value;
    const todate = this.bradenScaleForm.get("todate")?.value;
    this.url = this.service.getData(patientfolder.FetchFallRiskView, { IPID: this.admissionID, FromDate: moment(fromdate).format('DD-MMM-YYYY'), ToDate: moment(todate).format('DD-MMM-YYYY'), UserID: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe(
        (results) => {
          if (results.Code === 200) {
            this.FetchBradenScaleViewDataList = results.FetchBradenScaleViewDataList;
            this.FetchBradenScaleSelctedViewDataList = results.FetchBradenScaleSelctedViewDataList;
            this.FetchBradenScaleViewDataList = this.FetchBradenScaleViewDataList.sort((a: any, b: any) => new Date(b.CREATEDATE).getTime() - new Date(a.CREATEDATE).getTime());
          }
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
  }

  viewEformTemplate(templ: any) {
    if(templ.ClinicalTemplateID === '113') {      
      sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
      templ.SurgeryRequestID = templ.AssessmentOrderId;
      templ.AdmissionID = templ.Admissionid;
      templ.PatientID = this.selectedView.PatientID;
      sessionStorage.setItem("otpatient", JSON.stringify(templ));
      const sur = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
      const options: NgbModalOptions = {
        size: 'xl',
        windowClass : 'vte_view_modal'
      };
      const modalRef = this.modalService.openModal(OrNursesComponent, {
        data: sur,
        readonly: true
      }, options);
    }
    else if(templ.ClinicalTemplateID === '70') {
      templ.SurgeryRequestID = templ.AssessmentOrderId;
      templ.AdmissionID = templ.Admissionid;
      templ.PatientID = this.selectedView.PatientID;
      sessionStorage.setItem("otpatient", JSON.stringify(templ));
      const sur = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
      
      const options: NgbModalOptions = {
        size: 'xl',
        windowClass : 'vte_view_modal'
      };
      const modalRef = this.modalService.openModal(SurgicalSafetyChecklistComponent, {
        data: sur,
        readonly: true
      }, options);
    }
    else if (templ.IsNewTemplate === '1') {
      const options: NgbModalOptions = {
        size: 'xl',
        windowClass: 'vte_view_modal'
      };
      const modalRef = this.modalService.openModal(TemplatesLandingComponent, {
        data: templ,
        readonly: true,
        fromshared: true,
        admissionID: this.admissionID,
        selectedView: this.selectedView
      }, options);
    }
    else {
      this.url = this.service.getData(patientfolder.FetchPatienClinicalTemplateDetailsOT,
        { ClinicalTemplateID: 0, AdmissionID: this.admissionID, PatientTemplatedetailID: templ.PatientTemplatedetailID, TBL: 2, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
              this.assessmentContent = response.FetchPatienClinicalTemplateDetailsNNList[0].ClinicalTemplateValues;
              $('#oldAssessmentsModal').modal('show');
            }
          }
        },
          (err) => {
          })
    }
  }

  getreoperative(templateid: any) {
    //this.url = this.service.getData(patientfolder.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID });
    this.url = this.service.getData(patientfolder.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: 0, TBL: 1, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
          } else {
            this.FetchPatienClinicalTemplateDetailsNList = [];
          }
        } else
          this.FetchPatienClinicalTemplateDetailsNList = [];
      },
        (err) => {
        })
  }
  filterofEforms() {
    if (!this.eformsSearchText) {
      return this.FetchPatienClinicalTemplateDetailsNList.filter((x: any) => x.IsAssessment === 'False');
    }
  
    const searchText = this.eformsSearchText.toLowerCase();
  
    return this.FetchPatienClinicalTemplateDetailsNList.filter((x: any) => x.IsAssessment === 'False').filter((med: any) =>
      (med.ClinicalTemplateName?.toLowerCase().includes(searchText))
    );
  }

  FetchPatientChiefComplaintAndExaminations() {
    this.oldChiefcomplaints = []; this.SavedChiefComplaints = []; this.emrNurseChiefComplaint = []; this.ChiefExaminationID = 0;
    if (this.patientdata.IsNewVisit == '0') {
      //FetchPatientChiefComplaintAndExaminationsOld?Admissionid=${Admissionid}&RegCode=${RegCode}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}
      this.url = this.service.getData(patientfolder.FetchPatientChiefComplaintAndExaminationsOld,
        {
          Admissionid: this.visitAdmissionId,
          RegCode: this.patientdata.RegCode,
                    
          WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
          HospitalID: this.hospitalID
        });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.oldChiefcomplaints = response.FetchPatientChiefComplaintAndExaminationsOldDataList[0];
          }
        },
          (err) => {
          })
    }
    else {
      this.url = this.service.getData(patientfolder.FetchPatientChiefComplaintAndExaminations,
        {
          Admissionid: this.admissionID,
          UserId: this.doctorDetails[0].UserId,
          WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
          HospitalID: this.hospitalID
        });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {

            this.SavedChiefComplaints = response.FetchPatientChiefComplaintAndExaminationsDataaList;
            this.emrNurseChiefComplaint = this.SavedChiefComplaints[0]?.ChiefComplaint;
            this.emrNursePhysicalExamination = this.SavedChiefComplaints[0]?.PhysicalExamination;
            this.ChiefExaminationID = this.SavedChiefComplaints[0]?.ChiefExaminationID;

          }
        },
          (err) => {
          })
    }

  }

  FetchPatienFolderAssementView() {
    ////FetchPatienClinicalTemplateDetailsOTPF(int AdmissionID,int PatientID, int ClinicalTemplateID, int PatientTemplatedetailID, int TBL, int UserID, 
    // int WorkStationID, int HospitalID)
    this.url = this.service.getData(patientfolder.FetchPatienClinicalTemplateDetailsOTPF,
      {
        AdmissionID: this.patientdata?.AdmissionID,
        UHID: this.patientdata?.RegCode,
        ClinicalTemplateID: 0,
        PatientTemplatedetailID: 0,
        TBL: 1,
        UserId: this.doctorDetails[0].UserId,
        WorkStationID: "0",
        HospitalID: this.hospitalID
      });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.assessmentsDetails = response.FetchPatienClinicalTemplateDetailsNList.filter((x: any) => (x.IsAssessment === '1' || (x.IsAssessment === '0' && x.IsNewTemplate === '0')));
        }
        else
          this.assessmentsDetails = [];
      },
        (err) => {
        })
  }
  //FetchPainAssessmentOrderItemDetails?AdmissionID=2268892&FromDate=01-Jul-2024&ToDate=11-Jul-2024&UserID=4394&WorkStationID=3403&HospitalID=3
  FetchPainAssessmentOrderItemDetails() {
    const fromdate = this.painAssessmentForm.get("fromdate")?.value;
    const todate = this.painAssessmentForm.get("todate")?.value;
    this.url = this.service.getData(patientfolder.FetchPainAssessmentOrderItemDetails,
      {
        AdmissionID: this.selectedView.AdmissionID,
        FromDate: moment(fromdate).format('DD-MMM-YYYY'),
        ToDate: moment(todate).format('DD-MMM-YYYY'),
        UserID: this.doctorDetails[0].UserId,
        WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        HospitalID: this.hospitalID
      });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.painAssessmentWorklist = response.FetchPainAssessmentOrderItemDetailsDataList;
        }
      },
        (err) => {
        })
  }

  FetchPhysiotherapyResults() {
    this.url = this.service.getData(patientfolder.FetchPatientPhysiotherapyAssessmentOrdersF, {
      PatientID: this.PatientID,
      AdmissionID: this.selectedView.AdmissionID,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.physiotherapyResults = response.FetchPatientPhysiotherapyAssessmentOrdersDDataList.sort((a: any, b: any) => {
            const dateA = new Date(a.OrderDate);
            const dateB = new Date(b.OrderDate);
            return dateB.getTime() - dateA.getTime();
          });
        }
      },
        (err) => {

        });
  }

  LoadMedicalCertificateData() {
    var startdate = moment(new Date().setMonth(new Date().getMonth() - 6)).format('YYYY-MM-DD');
    var enddate = moment(new Date()).format('YYYY-MM-DD');
    this.presconfig.FetchPatientAdmissionMedicalReportWorkList(this.PatientID, this.selectedView.AdmissionID, 1, startdate, enddate, this.hospitalID).subscribe((res: any) => {
      this.medicalCertificateData = res.FetchPatientAdmissionMedicalReportWorkListDataList
    })
  }

  LoadDischargeSummaryData() {
    var startdate = moment(new Date().setMonth(new Date().getMonth() - 6)).format('YYYY-MM-DD');
    var enddate = moment(new Date()).format('YYYY-MM-DD');
    this.presconfig.FetchPatientAdmissionMedicalReportWorkList(this.PatientID, this.selectedView.AdmissionID, 2, startdate, enddate, this.hospitalID).subscribe((res: any) => {
      this.dischargeSummaryData = res.FetchPatientAdmissionMedicalReportWorkListDataList
    })
  }

  FetchPatientMedicalReportPrint(medcert: any) {
    this.presconfig.FetchPatientMedicalReportPrint(medcert.AdmissionID, 0, this.doctorDetails[0]?.UserId, this.hospitalID, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH;
          this.showMedCertModal();
        }
      },
        (err) => {
        })
  }
  FetchPatientMedicalReportPrintMR(medcert: any) {
    this.presconfig.FetchPatientMedicalReportPrintMR(medcert.MedicalReportID,medcert.AdmissionID, this.doctorDetails[0]?.UserId, this.hospitalID, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH;
          this.showMedCertModal();
        }
      },
        (err) => {
        })
  }
  FetchPatientDischargeSummaryPrint(medcert: any) {
    this.presconfig.FetchPatientDischargeSummaryPrint(medcert.AdmissionID, medcert.VirtualDischargeID, this.hospitalID, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH;
          this.showMedCertModal();
        }
      },
        (err) => {
        })
  }

  viewAssessmentsTemplate(item: any) {
    item.admissionID = item.Admissionid;
    item.hospitalId = item.HospitalID;
    sessionStorage.setItem('selectedView', JSON.stringify(this.selectedView));
    if (item.IsNewTemplate === '1') {
      const options: NgbModalOptions = {
        size: 'xl',
        windowClass: 'vte_view_modal'
      };
      if (item.ClinicalTemplateID === '16') {
        const modalRef = this.modalService.openModal(CardiologyAssessmentComponent, {
          data: item,
          readonly: true
        }, options);
      }
      if (item.ClinicalTemplateID === '17') {
        const modalRef = this.modalService.openModal(AnesthesiaAssessmentComponent, {
          data: item,
          readonly: true
        }, options);
      }
      if (item.ClinicalTemplateID === '2') {
        const modalRef = this.modalService.openModal(MedicalAssessmentComponent, {
          data: item,
          readonly: true
        }, options);
      }
      if (item.ClinicalTemplateID === '7') {
        const modalRef = this.modalService.openModal(MedicalAssessmentPediaComponent, {
          data: item,
          readonly: true
        }, options);
      }
      if (item.ClinicalTemplateID === '6') {
        const modalRef = this.modalService.openModal(MedicalAssessmentObstericComponent, {
          data: item,
          readonly: true
        }, options);
      }
      if (item.ClinicalTemplateID === '8') {
        const modalRef = this.modalService.openModal(MedicalAssessmentSurgicalComponent, {
          data: item,
          readonly: true
        }, options);
      }
    }
    else {
      ////FetchPatienClinicalTemplateDetailsOTPF(int AdmissionID,int PatientID, int ClinicalTemplateID, int PatientTemplatedetailID, int TBL, int UserID, 
      // int WorkStationID, int HospitalID)
      this.url = this.service.getData(patientfolder.FetchPatienClinicalTemplateDetailsOTPF,
        {
          AdmissionID: this.patientdata?.AdmissionID, UHID: this.patientdata?.RegCode, ClinicalTemplateID: item.ClinicalTemplateID,
          PatientTemplatedetailID: item.PatientTemplatedetailID, TBL: 2, UserID: this.doctorDetails[0].UserId,
          WorkStationID: "0", HospitalID: this.hospitalID
        });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
              this.assessmentContent = response.FetchPatienClinicalTemplateDetailsNNList[0].ClinicalTemplateValues;
              const parser = new DOMParser();
              const doc = parser.parseFromString(this.assessmentContent, 'text/html');
              const extractedText = doc.body.innerHTML;
              this.assessmentContenthtml = this.sanitizer.bypassSecurityTrustHtml(extractedText);
              $('#oldAssessmentsModal').modal('show');
            }
          }
        },
          (err) => {
          })
    }
  }

  closeOldAssessmentPopup() {
    this.assessmentContent = "";
  }

  FetchPatientAdmissionMedicalInformedConsent() {
    this.url = this.service.getData(patientfolder.FetchPatientAdmissionMedicalInformedConsent, { AdmissionID: this.selectedView.AdmissionID, HospitalID: this.hospitalID });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatAdmMedicalInfConsentDataList = response.FetchPatAdmMedicalInfConsentDataList;
        }
      },
        (err) => {

        })
  }

  FetchPatientadmissionAgaintConsentForHighRiskOperations() {
    this.url = this.service.getData(patientfolder.FetchPatientadmissionAgaintConsentForHighRiskOperations, { AdmissionID: this.selectedView.AdmissionID, HospitalID: this.hospitalID });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatadmAgaintDataList = response.FetchPatadmAgaintDataList;
        }
      },
        (err) => {

        })

  }

  showHideLabTestGraph() {
    this.showLabTest = !this.showLabTest;
  }

  openMRDReport(item: any) {
    this.url = this.service.getData(patientfolder.FetchPatientSummaryMRDFiles, {
      PatientID: this.PatientID,
      AdmissionID: this.selectedView.AdmissionID,
      ImageID: item.ImageID,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          const fileContent = response.FetchPatientSummaryMRDFilesDataList[0].byteImage;
          const byteCharacters = atob(fileContent); // Decode Base64 string
          const byteNumbers = new Uint8Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i); // Convert to byte array
          }
          const blob = new Blob([byteNumbers], { type: 'application/pdf' });
          this.trustedUrl = URL.createObjectURL(blob);
          $('#mrdReportModal').modal('show');
        }
      },
        (err) => {

        });
  }

  getSanitizedSvg(svgContent: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  GoBackTodashboard() {
    this.router.navigate(['/home/patients']);
  }

  changeFilterLocation(type: string) {
    this.filterlocation = type;
    if (this.viewMoreTypeHeader === 'Vitals') {

    }
    else if (this.viewMoreTypeHeader === 'Diagnosis') {
      if (type === '0') {
        this.viewMoreData = this.viewMoreData1;
      }
      else {
        this.viewMoreData = this.viewMoreData1.filter((x: any) => x.HospitalID === type);
      }
    }
    else if (this.viewMoreTypeHeader === 'Medications') {
      if (type === '0') {
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList1;
      }
      else {
        this.PatientViewMoreSearchMedicationsList = this.PatientViewMoreSearchMedicationsList1.filter((x: any) => x.HospitalID === type);
      }
    }
    else if (this.viewMoreTypeHeader === 'Investigations & Radiology') {
      if (type === '0') {
        this.data = this.dataToFilter;
      }
      else {
        this.data = this.dataToFilter.filter((x: any) => x.HospitalID === type);
      }
    }
  }

  filterDataWithDatesLocationId(filter: any) {
    if (filter === "M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 1);
      var pd = new Date();
      this.filterDataForm.patchValue({
        fromdate: wm,
        todate: pd,
      });
    } else if (filter === "3M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 3);
      var pd = new Date();
      this.filterDataForm.patchValue({
        fromdate: wm,
        todate: pd,
      });
    } else if (filter === "6M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 6);
      var pd = new Date();
      this.filterDataForm.patchValue({
        fromdate: wm,
        todate: pd,
      });
    } else if (filter === "1Y") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 12);
      var pd = new Date();
      this.filterDataForm.patchValue({
        fromdate: wm,
        todate: pd,
      });
    } else if (filter === "W") {
      var d = new Date();
      d.setDate(d.getDate() - 7);
      var wm = d;
      var pd = new Date();
      this.filterDataForm.patchValue({
        fromdate: wm,
        todate: pd,
      });
    } else if (filter === "T") {
      var d = new Date();
      d.setDate(d.getDate());
      var wm = d;
      var pd = new Date();
      this.filterDataForm.patchValue({
        fromdate: wm,
        todate: pd,
      });
    }
    this.getSelectedSectionData();
  }

  getSelectedSectionData() {

    const fromdate = moment(this.filterDataForm.value['fromdate']).format("DD-MMM-yyyy");
    const todate = moment(this.filterDataForm.value['todate']).format("DD-MMM-yyyy");
    const hospid = this.filterDataForm.get("location")?.value;
    const searchid = this.filterDataForm.get("searchitem")?.value;

    if (this.viewMoreTypeHeader === 'Vitals') {
      this.con.fetchOutPatientData_PF(this.patientdata.RegCode == undefined ? this.patientdata.RegCode : this.patientdata.RegCode, this.visitAdmissionId, fromdate, todate, hospid)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.tableVitalsList = response.PatientVitalsDataList;
            this.tableVitalsListFiltered = response.PatientVitalsDataList;
            this.spline();
          }
        },
          (err) => { })
    }
    else if (this.viewMoreTypeHeader === 'Diagnosis') {
      var facid = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
      if (this.SummaryfromCasesheet === 'true' && facid === undefined) {
        facid = this.facility;
      }
      this.url = this.service.getData(patientfolder.FetchPatientSummary, {
        Admissionid: this.visitAdmissionId, PatientId: this.PatientID, TBL: '12', WorkStationID: facid, HospitalID: hospid
      });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.assignData('12', response);
          }
        },
          (err) => {

          })
    }
    else if (this.viewMoreTypeHeader === 'Medications') {
      this.con.fetchPatientMedication('0', this.visitAdmissionId, this.patientdata.PatientID, hospid)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.fillMedicationData(response);
          }
        },
          (err) => {

          })
    }
    else if (this.viewMoreTypeHeader === 'Investigations & Radiology') {
      const type = '0';
      this.loadInvRad(type);
    }

  }

  loadInvRad(type: string) {
    if (type === '0') {
      if (this.IsTab !== 'L') {
        this.invFilter = false;
      }
      if (this.IsTab === "L" && !this.invFilter) {
        this.fetchLabOrderResults();
      }
      else if (this.IsTab === "R") {
        this.fetchRadOrderResults();
      }
      else if (this.IsTab === "C") {
        this.fetchCardiologyOrderResults();
      }
      else if (this.IsTab === "N") {
        this.fetchNeurologyOrderResults();
      }
      else if (this.IsTab === "P") {
        //this.fetchNeurologyOrderResults();
        this.data = [];
      }
      else if (this.IsTab === "D") {
        this.data = [];
        this.fetchDentalOrderResults();
      }
    }
    else {
      this.filterTestResults("");
    }
  }
  getInvestigationProcedureDetails(event: any) {
    const Name = event.target.value;
    if (Name.length === 0) {
      let toDateFilter = new Date();
      let fromDateFilter = new Date(toDateFilter);
      fromDateFilter.setMonth(toDateFilter.getMonth() - 6);
      this.filterDataForm.patchValue({
        searchitem: '0',
        fromdate: fromDateFilter,
        todate: toDateFilter,
        location: '0',
      });
      this.loadInvRad("0");
    }
    else if (Name.length > 2) {
      this.presconfig.getInvestigationProcedureDetailsNH(Name.trim(), 3, "-1", "1", this.hospitalID, this.doctorDetails[0].EmpId).subscribe((response) => {
        if (response.Status === "Success") {
          this.investigationData = response.InvestigationsAndProceduresList;
        }
      },
        (err) => {

        })
    }
  }
  onItemSelect(item: any) {
    let toDateFilter = new Date();
    let fromDateFilter = new Date(toDateFilter);
    fromDateFilter.setMonth(toDateFilter.getMonth() - 6);
      
    this.filterDataForm.patchValue({
      searchitem: item.ServiceItemID,
      fromdate: fromDateFilter,
      todate: toDateFilter,
      location: '0',
    });
    this.loadInvRad("0");
  }

  onSectionVisitChange(event: any) {
    this.admissionID = event.target.value;
    this.visitAdmissionId = event.target.value;
    this.visitDataLoad(this.admissionID);
  }
  visitDataLoad(admissionId: any) {
    this.patientdata = this.patientVisits.find((visit: any) => visit.AdmissionID == admissionId);
    this.episodeId = this.patientdata?.EpisodeID == undefined ? '' : this.patientdata.EpisodeID;
    this.PatientType = this.patientdata.PatientType;

    this.url = this.service.getData(patientfolder.FetchPatientVistitInfo, { Patientid: this.patientdata.PatientID, Admissionid: admissionId, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedView = response.FetchPatientVistitInfoDataList[0];
        }
        if (this.selectedView.PatientType == "2") {
          if (this.selectedView?.Bed.includes('ISO'))
            this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
          else
            this.SelectedViewClass = "m-0 fw-bold alert_animate token";
        } else {
          this.SelectedViewClass = "m-0 fw-bold alert_animate token";
        }
        this.fetchPatientSummary(this.selectedSection.scrollValue, this.selectedSection.scrollName);
      },
        (err) => {

        })
  }

  viewPhysiotherapyResult(res: any) {
    this.suitconfig.FetchPhysiotherapyAssessmentSections(this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response: any) => {
      if (response.Code == 200) {
        this.FetchPhysiotherapyAssessmentSectionsDataList = response.FetchPhysiotherapyAssessmentSectionsDataList;
        this.FetchPhysiotherapyAssessmentSectionsGoalsDataList = response.FetchPhysiotherapyAssessmentSectionsGoalsDataList;
        this.FetchPhysiotherapyAssessmentSectionsTreatmentDataList = response.FetchPhysiotherapyAssessmentSectionsTreatmentDataList;
        this.FetchPatientPhysiotherapyAssessmentOrders(res);
      }
    });
  }
  FetchPatientPhysiotherapyAssessmentOrders(test: any) {
    this.suitconfig.FetchPatientPhysiotherapyAssessmentOrders(test.TestOrderItemID, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response: any) => {
      if (response.Code == 200 && response.FetchPatientPhysiotherapyAssessmentOrdersDataList.length > 0) {
        this.showPhysioResult = true;
        $('#physioResult').modal('show');
        const data = response.FetchPatientPhysiotherapyAssessmentOrdersDataList[0];
        this.PatientPhyAssessmentOrderID = data.PatientPhyAssessmentOrderId;
        this.selectedPainScoreId = data.PainScoreID;
        $("#progressNotesText").html(data.ProgressNotes);
        const PhysiotherapyAssIDs = data.PhysiotherapyAssIDs.split(',');
        PhysiotherapyAssIDs.forEach((id: any) => {
          let item = this.FetchPhysiotherapyAssessmentSectionsDataList.find((item: any) => item.PhysicaltherapyAssID.toString() === id.toString());
          if (item) {
            item.selected = true;
          } else if (!item) {
            item = this.FetchPhysiotherapyAssessmentSectionsGoalsDataList.find((item: any) => item.PhysicaltherapyAssID.toString() === id.toString());
            if (item) {
              item.selected = true;
            } else if (!item) {
              item = this.FetchPhysiotherapyAssessmentSectionsTreatmentDataList.find((item: any) => item.PhysicaltherapyAssID.toString() === id.toString());
              if (item) {
                item.selected = true;
              }
            }
          }
        });
        const AssessmentOtherIDs = data.AssessmentOtherIDs.split(',');
        AssessmentOtherIDs.forEach((othersData: any) => {
          const id = othersData.split(':')[0];
          const data = othersData.split(':')[1];
          let item = this.FetchPhysiotherapyAssessmentSectionsDataList.find((item: any) => item.PhysicaltherapyAssID.toString() === id.toString());
          if (item) {
            item.selected = true;
            item.OthersText = data;
          } else if (!item) {
            item = this.FetchPhysiotherapyAssessmentSectionsGoalsDataList.find((item: any) => item.PhysicaltherapyAssID.toString() === id.toString());
            if (item) {
              item.selected = true;
              item.OthersText = data;
            } else if (!item) {
              item = this.FetchPhysiotherapyAssessmentSectionsTreatmentDataList.find((item: any) => item.PhysicaltherapyAssID.toString() === id.toString());
              if (item) {
                item.selected = true;
                item.OthersText = data;
              }
            }
          }
        });
      }
    })
  }

  print() {
    if ($('#divscroll').hasClass('template_scroll')) {
      $('#divscroll').removeClass("template_scroll");
    }

    if ($('#divscrollOverflow').hasClass('overflow-auto')) {
      $('#divscrollOverflow').removeClass("overflow-auto");
      $('#divscrollOverflow').addClass("overflow-visible");
    }
    this.printService.print(this.divprint.nativeElement, 'Report');

    setTimeout(() => {
      $('#divscroll').addClass("template_scroll");
      $('#divscrollOverflow').addClass("overflow-auto");
      $('#divscrollOverflow').removeClass("overflow-visible");
    }, 1000);
  }

  onPrintClick() {
    if (this.viewMoreTypeHeader === 'Vitals') {
      var FromDate = moment(this.tableVitalsForm.value['vitalFromDate']).format("DD-MMM-yyyy");
      var ToDate = moment(this.tableVitalsForm.value['vitalToDate']).format("DD-MMM-yyyy");
      this.presconfig.FetchIPPatientVitalsRRPrint(this.selectedView.PatientID, this.patientDetails.IPID ?? this.selectedView.AdmissionID, FromDate, ToDate, this.doctorDetails[0].UserName, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.trustedUrl = response?.FTPPATH
            $("#reviewAndPayment").modal('show');
          }
        },
          (err) => {

          })
    } else if (this.viewMoreTypeHeader === 'Progress Notes') {
      var FromDate = moment(this.viewMoreDiagnosisForm.value['fromdate']).format("DD-MMM-yyyy");
      var ToDate = moment(this.viewMoreDiagnosisForm.value['todate']).format("DD-MMM-yyyy")
      var UserID = this.doctorDetails[0].UserId;
      this.wardConfig.FetchMainProgressNoteHHNewPrint(this.patientDetails.IPID ?? this.selectedView.AdmissionID, FromDate, ToDate, this.doctorDetails[0].UserName, UserID, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response) => {
        if (response.Status === "Success") {
          this.trustedUrl = response?.FTPPATH
          $("#reviewAndPayment").modal('show');
        } else {
        }
      },
        (err) => {

        })
    }
  }

  filterMedications() {
    if (!this.medSearchText) {
      return this.PatientViewMoreSearchMedicationsList;
    }
  
    const searchText = this.medSearchText.toLowerCase();
  
    return this.PatientViewMoreSearchMedicationsList.filter((med: any) =>
      (med.ItemName?.toLowerCase().includes(searchText))
    );
  }

  filterAssessments() {
    if (!this.assessmentSearchText) {
      return this.assessmentsDetails;
    }
  
    const searchText = this.assessmentSearchText.toLowerCase();
  
    return this.assessmentsDetails.filter((med: any) =>
      (med.ClinicalTemplateName?.toLowerCase().includes(searchText))
    );
  }

  searchEmployee(event: any) {
    if (event.target.value.length > 2) {
      const url = this.service.getData(labresultentry.FetchDoctorName, {
        Filter: event.target.value,
        HospitalID: this.hospitalID
      });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.informedToList = response.FetchDoctorDataList;
          }
        },
          (err) => {
          })
    }
  }
  onItemSelected(emp: any) {
    //this.selectedInformedToEmpDetails = emp;
    this.selectedInformedToEmpDetails = [];
    this.selectedInformedToEmpDetails.push({
      InformedToEmpNo: emp.EmpNo,
      InformedToEmpId: emp.Empid,
      InformedToFullName: emp.Fullname
    })
  }

  onReadBackChanges(event: any) {
    if (event.target.checked == true) {
      this.IsReadBack = true
      this.readBackDate = this.currentDate;
    }
    else {
      this.readBackDate = "";
    }
  }

  openPanicResultReportingForm(item: any) {
    this.selectedPatientLabData = item;
    this.selectedPatientData = this.selectedView;
    this.FetchSavePanicRadiologyForm();
    $("#panicReportForm").modal('show');
    this.showPanicForm = true;
  }
  
  openAllergyPopup() {
    this.showAllergydiv = true;
  }

  navigateToResults() {
    sessionStorage.setItem("FromRadiology", "true");
    this.router.navigate(['/home/otherresults']);
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.selectedPatientData));
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedPatientData));
  }

  FetchSavePanicRadiologyForm() {
      const url = this.service.getData(labresultentry.FetchSavePanicRadiologyForm, {
        TestOrderItemId: this.selectedPatientLabData.TestOrderItemID,
        HospitalID: this.hospitalID
      });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            if (response.Code == 200 && response.FetchSavePanicRadiologyFormDataList.length > 0) {
              //if (response.FetchSavePanicRadiologyTestDataList.length > 0)
                //this.sowPanicFormSave = false;
              this.savedPatientPanicResultReportingDetails = response.FetchSavePanicRadiologyFormDataList;
              this.IsReadBack = this.savedPatientPanicResultReportingDetails[0].IsReadBack;
              this.readBackDate = this.savedPatientPanicResultReportingDetails[0].ReadBackDateTime;
              $("#panicFormRemarks").val(this.savedPatientPanicResultReportingDetails[0].Remarks);
              this.selectedInformedToEmpDetails = []; this.selectedInformedByEmpDetails = [];
              if (this.savedPatientPanicResultReportingDetails[0].InformedToEmpNO != '') {
                this.selectedInformedByEmpDetails.push({
                  EmpNo: this.savedPatientPanicResultReportingDetails[0].InformedByEmpNO,
                  EmpId: this.savedPatientPanicResultReportingDetails[0].InformedByEmpID,
                  FullName: this.savedPatientPanicResultReportingDetails[0].InformedByEmployeeName,
                })
              } else {
                this.selectedInformedByEmpDetails.push({
                  EmpNo: this.doctorDetails[0].EmpNo,
                  EmpId: this.doctorDetails[0].EmpId,
                  FullName: this.doctorDetails[0].EmployeeName,
                })
              }
              this.selectedInformedToEmpDetails.push({
                InformedToEmpNo: this.savedPatientPanicResultReportingDetails[0].InformedToEmpNO,
                InformedToEmpId: this.savedPatientPanicResultReportingDetails[0].InformedToEmpID,
                InformedToFullName: this.savedPatientPanicResultReportingDetails[0].InformedToEmployeeName,
              })
  
            }
            else {
              this.selectedInformedByEmpDetails.push({
                EmpNo: this.doctorDetails[0].EmpNo,
                EmpId: this.savedPatientPanicResultReportingDetails[0].EmpId,
                FullName: this.savedPatientPanicResultReportingDetails[0].EmployeeName,
              })
            }
          }
        },
          (err) => {
          })
    }

  smartDataList: any = [];

  showGrowthChartInfo() {
    $('#BMIModal').modal('show');
    this.getHeight();
  }

  getHeight() {
    this.presconfig.getPatientHight(this.PatientID).subscribe((res: any) => {
      this.smartDataList = res.SmartDataList;
      this.createHWChartLine();
    })
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

    Highcharts.chart('chart-hw-line', {
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
}

export const patientfolder = {
  //FetchPatientVisits: 'FetchPatientVisits?Patientid=${Patientid}&HospitalID=${HospitalID}',
  FetchPatientVisitsPFMRD: 'FetchPatientVisitsPFMRD?Patientid=${Patientid}&HospitalID=${HospitalID}',
  FetchPatientVisits: 'FetchPatientVisitsPF?Patientid=${Patientid}&HospitalID=${HospitalID}',
  FetchPatientVistitInfo: 'FetchPatientVistitInfo?Patientid=${Patientid}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchPatientFileData: 'FetchPatientFileData?EpisodeID=${EpisodeID}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchPatientOrderedOrPrescribedDrugs: 'FetchPatientOrderedOrPrescribedDrugs?PatientType=${PatientType}&IPID=${IPID}&PatientID=${PatientID}&HospitalID=${HospitalID}',
  FetchBloodRequest: 'FetchBloodRequest?Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchSSurgeries: 'FetchSSurgeries?Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchSSurgeriesPF: 'FetchSSurgeriesPF?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&AdmissionID=${AdmissionID}&SearchID=${SearchID}&HospitalID=${HospitalID}',
  FetchEForms: 'FetchEForms?Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchMainProgressNote: 'FetchMainProgressNote?Admissionid=${Admissionid}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchMainProgressNoteNew: 'FetchMainProgressNoteNew?Admissionid=${Admissionid}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchMainProgressNoteNewPF: 'FetchMainProgressNoteNewPF?UHID=${UHID}&Admissionid=${Admissionid}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchNursingInstructions: 'FetchNursingInstructions?PatientID=${PatientID}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchNursingInstructionsPF: 'FetchNursingInstructionsPF?UHID=${UHID}&Admissionid=${Admissionid}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchCarePlan: 'FetchCarePlan?Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchInTakeOutPut: 'FetchInTakeOutPut?Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchEFormSelected: 'FetchEFormSelected?Admissionid=${Admissionid}&ScreenDesignId=${ScreenDesignId}&PatientTemplateid=${PatientTemplateid}&HospitalID=${HospitalID}',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchMedicationHold: 'FetchMedicationHold?Demographic=${Demographic}&UserId=${UserId}&HospitalID=${HospitalID}',
  holdPrescriptionItems: 'holdPrescriptionItems',
  BlockPrescriptionItems: 'BlockPrescriptionItems',
  FetchPatientCaseRecord: 'FetchPatientCaseRecord?AdmissionID=${AdmissionID}&PatientID=${PatientID}&EpisodeID=${EpisodeID}&UserName=${UserName}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientCaseRecordPFF: 'FetchPatientCaseRecordPFF?AdmissionID=${AdmissionID}&UHID=${UHID}&UserName=${UserName}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchDrugAdministrationDrugs: 'FetchDrugAdministrationDrugs?FromDate=${FromDate}&ToDate=${ToDate}&IPID=${IPID}&HospitalID=${HospitalID}',
  FetchSurgeryorders: 'FetchSurgeryorders?OrderID=${OrderID}&UserID=${UserID}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
  FetchPatientSummaryFileData: 'FetchPatientSummaryFileData?PatientID=${PatientID}&AdmissionID=${AdmissionID}&EpisodeID=${EpisodeID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientSickLeaveWorkList: 'FetchPatientSickLeaveWorkList?PatientID=${PatientID}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
  FetchMedicalCertificateRequest: 'FetchMedicalCertificateRequest?PatientID=${PatientID}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
  FetchMedicalCertificateRequestPF: 'FetchMedicalCertificateRequestPF?RegCode=${RegCode}&PatientID=${PatientID}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
  FetchMedicalCertificateRequestPFIPID: 'FetchMedicalCertificateRequestPFIPID?RegCode=${RegCode}&AdmissionID=${AdmissionID}&HospitalID=${HospitalID}',
  FetchPatientSickLeavePDF: 'FetchPatientSickLeavePDF?AdmissionID=${AdmissionID}&SickLeaveID=${SickLeaveID}&HospitalID=${HospitalID}',
  FetchMedicalCertificatePDF: 'FetchMedicalCertificatePDF?RegCode=${RegCode}&PatientID=${PatientID}&MedicalCertificationID=${MedicalCertificationID}&HospitalID=${HospitalID}',
  FetchPatientSummary: 'FetchPatientSummary?Admissionid=${Admissionid}&PatientId=${PatientId}&TBL=${TBL}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientAdmissionInvestigationsAndProcedures: 'FetchPatientAdmissionInvestigationsAndProcedures?UHID=${UHID}&Admissionid=${Admissionid}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',

  FetchLabOrderResults: 'FetchLabOrderResults?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&HospitalID=${HospitalID}',
  FetchLabOrderResultsPF: 'FetchLabOrderResultsPF?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&AdmissionID=${AdmissionID}&SearchID=${SearchID}&HospitalID=${HospitalID}',
  FetchLabReportGroupPDF: 'FetchLabReportGroupPDF?RegCode=${RegCode}&TestOrderId=${TestOrderId}&UserID=${UserID}&HospitalID=${HospitalID}',
  FetchLabReportItemlevelGroupPDF: 'FetchLabReportItemlevelGroupPDF?RegCode=${RegCode}&TestOrderId=${TestOrderId}&TestOrderItemID=${TestOrderItemID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',

  fetchLabDocReportGroupPDF: 'FetchLabDocuments?TestOrderID=${TestOrderID}&TestOrderItemID=${TestOrderItemID}&HospitalID=${HospitalID}',
  FetchLabDocumentsPF: 'FetchLabDocumentsPF?TestOrderID=${TestOrderID}&TestOrderItemID=${TestOrderItemID}&HospitalID=${HospitalID}',

  fetchLabTestGraph: 'FetchLabTestGraph?TestName=${TestName}&PatientID=${PatientID}&HospitalID=${HospitalID}',
  FetchLabTestGraphNew: 'FetchLabTestGraphNew?UHID=${UHID}&TestID=${TestID}&HospitalID=${HospitalID}',


  FetchRadReportGroupPDF: 'FetchRadReportGroupPDF?RegCode=${RegCode}&TestOrderItemId=${TestOrderItemId}&TestOrderId=${TestOrderId}&UserID=${UserID}&HospitalID=${HospitalID}',
  FetchRadOrderResults: 'FetchRadOrderResults?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&HospitalID=${HospitalID}',
  FetchRadOrderResultsPF: 'FetchRadOrderResultsPF?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&AdmissionID=${AdmissionID}&SearchID=${SearchID}&HospitalID=${HospitalID}',
  FetchCardOrderResults: 'FetchCardOrderResults?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&HospitalID=${HospitalID}',
  //FetchCardOrderResultsPF?fromDate=01-Jan-2000&ToDate=01-Jan-2000&PatientID=2213756&AdmissionID=0&SearchID=0&HospitalID=0
  FetchCardOrderResultsPF: 'FetchCardOrderResultsPF?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&AdmissionID=${AdmissionID}&SearchID=${SearchID}&HospitalID=${HospitalID}',
  FetchNeurologyOrderResults: 'FetchNeurologyOrderResults?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&HospitalID=${HospitalID}',
  // FetchNeurologyOrderResultsPF?fromDate=01-Jan-2000&ToDate=01-Jan-2000&PatientID=2213756&AdmissionID=0&SearchID=0&HospitalID=0
  FetchNeurologyOrderResultsPF: 'FetchNeurologyOrderResultsPF?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&AdmissionID=${AdmissionID}&SearchID=${SearchID}&HospitalID=${HospitalID}',
  //FetchDentalOrderResultsPF?fromDate=01-Jan-2000&ToDate=01-Jan-2000&PatientID=2213756&AdmissionID=0&SearchID=0&HospitalID=0
  FetchDentalOrderResultsPF: 'FetchDentalOrderResultsPF?fromDate=${fromDate}&ToDate=${ToDate}&PatientID=${PatientID}&AdmissionID=${AdmissionID}&SearchID=${SearchID}&HospitalID=${HospitalID}',
  FetchPatientSurgeryNote: 'FetchPatientSurgeryNote?SurgeryRequestID=${SurgeryRequestID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdviceDiagnosis: 'FetchAdviceDiagnosis?TBL=1&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchFinalSaveVTERiskAssessment: 'FetchFinalSaveVTERiskAssessment?AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchFinalSaveVTESurgicalRiskAssessment: 'FetchFinalSaveVTERiskAssessment?AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientFinalObgVTEFrom: 'FetchPatientFinalObgVTEFrom?PatientObgVTEID=${PatientObgVTEID}&AdmissionID=${AdmissionID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdmittedMotherDetails: 'FetchAdmittedMotherDetails?ChildPatientID=${ChildPatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchPatientHandOverform: 'fetchPatientHandOverform?Admissionid=${Admissionid}&HandOverformID=0&HospitalID=${HospitalID}',
  fetchPatientBedSideCareFrom: 'FetchPatientBedSideCareFrom?Admissionid=${Admissionid}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
  FetchPatientBedSideCareFromPF: 'FetchPatientBedSideCareFromPF?UHID=${UHID}&Admissionid=${Admissionid}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientBathSideCareFrom: 'FetchPatientBathSideCareFrom?Admissionid=${Admissionid}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
  FetchPatientHandOverformPDF: 'FetchPatientHandOverformPDF?HandOverformID=${HandOverformID}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchPatientHandOverformPDFD: 'FetchPatientHandOverformPDF?HandOverformID=${HandOverformID}&Admissionid=${Admissionid}&strpath=${strpath}&HospitalID=${HospitalID}',
  FetchMedicalCertificateRequestV: 'FetchMedicalCertificateRequestV?SSN=${SSN}&FromDate=${FromDate}&ToDate=${ToDate}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchMedicalCertificationDescriptions: 'FetchMedicalCertificationDescriptions?MedicalCertificationTemplateID=${MedicalCertificationTemplateID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  PatientEndoTotalRequest: 'PatientEndoTotalRequest?IPID=${IPID}&HospitalID=${HospitalID}',
  FetchDietRequisitionADV: 'FetchDietRequisitionADV?Type=${Type}&Filter=${Filter}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchBradenScaleView: 'FetchBradenScaleView?IPID=${IPID}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientChiefComplaintAndExaminations: 'FetchPatientChiefComplaintAndExaminations?Admissionid=${Admissionid}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  //FetchPatienClinicalTemplateDetailsOT: 'FetchPatienClinicalTemplateDetailsOT?AdmissionID=${AdmissionID}&ClinicalTemplateID=${ClinicalTemplateID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
  FetchPatienClinicalTemplateDetailsOT: 'FetchPatienClinicalTemplateDetailsOT?AdmissionID=${AdmissionID}&ClinicalTemplateID=${ClinicalTemplateID}&PatientTemplatedetailID=${PatientTemplatedetailID}&TBL=${TBL}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  //FetchPatienClinicalTemplateDetailsOTPF(int AdmissionID,int PatientID, int ClinicalTemplateID, int PatientTemplatedetailID, int TBL, int UserID, int WorkStationID, int HospitalID)
  FetchPatienClinicalTemplateDetailsOTPF: 'FetchPatienClinicalTemplateDetailsOTPF?AdmissionID=${AdmissionID}&UHID=${UHID}&ClinicalTemplateID=${ClinicalTemplateID}&PatientTemplatedetailID=${PatientTemplatedetailID}&TBL=${TBL}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchFallRiskView: 'FetchFallRiskView?IPID=${IPID}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientIntakOutputSave: 'FetchPatientIntakeOutputsH?IPID=${IPID}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatienFolderAssementView: 'FetchPatienFolderAssementView?AdmissionID=${AdmissionID}&ClinicalTemplateID=${ClinicalTemplateID}&PatientTemplatedetailID=${PatientTemplatedetailID}&TBL=${TBL}&&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPainAssessmentOrderItemDetails: 'FetchPainAssessmentOrderItemDetails?AdmissionID=${AdmissionID}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPainAssessmentOrderItems: 'FetchPainAssessmentOrderItems?PainAssessmentOrderID=${PainAssessmentOrderID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientadmissionGeneralConsent: 'FetchPatientadmissionGeneralConsent?AdmissionID=${AdmissionID}&HospitalID=${HospitalID}',
  FetchPatientAdmissionMedicalInformedConsent: 'FetchPatientAdmissionMedicalInformedConsent?AdmissionID=${AdmissionID}&HospitalID=${HospitalID}',
  FetchPatientadmissionAgaintConsentForHighRiskOperations: 'FetchPatientadmissionAgaintConsentForHighRiskOperations?AdmissionID=${AdmissionID}&HospitalID=${HospitalID}',
  FetchPatientFolderReasons: 'FetchPatientFolderReasons?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SavePatientFolderViewLogging: 'SavePatientFolderViewLogging',
  FetchPatientSummaryMRDFiles: 'FetchPatientSummaryMRDFiles?PatientID=${PatientID}&AdmissionID=${AdmissionID}&ImageID=${ImageID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientPhysiotherapyAssessmentOrdersF: 'FetchPatientPhysiotherapyAssessmentOrdersF?PatientID=${PatientID}&AdmissionID=${AdmissionID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientChiefComplaintAndExaminationsOld: 'FetchPatientChiefComplaintAndExaminationsOld?Admissionid=${Admissionid}&RegCode=${RegCode}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'

};


