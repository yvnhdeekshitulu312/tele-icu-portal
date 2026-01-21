import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, HostListener, Renderer2 } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { AdmissionreconciliationComponent } from 'src/app/ward/admissionreconciliation/admissionreconciliation.component';
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
import { ParentalCareInitialComponent } from '../parental-care-initial/parental-care-initial.component';
import { PulmonologyDiseasesOpdnoteComponent } from '../pulmonology-diseases-opdnote/pulmonology-diseases-opdnote.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { InPatientDischargeSummaryComponent } from 'src/app/shared/inpatient-discharge-summary/inpatient-discharge-summary.component';
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { debounceTime, Subject } from 'rxjs';
import { MultidisciplanaryPatientFamilyEducationFormComponent } from 'src/app/templates/multidisciplanary-patient-family-education-form/multidisciplanary-patient-family-education-form.component';
declare var $: any;

@Component({
  selector: 'app-advice',
  templateUrl: './advice.component.html',
  styleUrls: ['./advice.component.scss']
})
export class AdviceComponent implements OnInit, AfterViewInit {
  @Input() data: any;
  readonly = false;
  @Output() savechanges = new EventEmitter<any>();
  @Output() clearchanges = new EventEmitter<any>();
  @ViewChild('admission', { static: true }) admission!: ElementRef;
  @ViewChild('followup', { static: true }) followup!: ElementRef;
  @ViewChild('referral', { static: true }) referral!: ElementRef;
  @ViewChild('surgery', { static: true }) surgery!: ElementRef;
  @ViewChild('followupAfter') followupAfter!: ElementRef;
  imageUrlParent: any;
  minDate = new Date();
  imageUrl = 'assets/images/Human-body-male.png';
  langData: any;
  AdmissionID: any;
  hospId: any;
  selectedView: any;
  selectedCard: any;
  PatientDiagnosisDataList: any;
  dietType: any;
  admissionForm: any;
  admissionForSurgeryForm: any;
  followupForm: any;
  referralForm: any;
  currentDate!: any;
  doctorDetails: any;
  fetchAdmin: any;
  activeTab1: any = "followup";
  FollowUpType: any = 1;
  FollowAfter: any = 0;
  FollowUpOn: any = moment(new Date()).format('DD-MMM-YYYY');
  //adviceToPatient: any = '';
  diagnosis: any = [];
  intMonitorId: any = 0;
  locationList: any;
  SpecializationList: any;
  SpecializationList1: any;
  reasonsList: any;
  priorityList: any;
  listOfItems: any;
  listOfSpecItems: any;
  listOfSpecItems1: any;
  referralList: any = [];
  referralList1: any = [];
  referralList2: any = [];
  refDetailsList: any = [];
  Cosession = false;
  editIndex: any;
  isEdit: any = false;
  endofEpisode: boolean = false;
  dischargeIntimationRiased = false;
  isSurgery: any = false;
  listOfSurgeryItems: any;
  listOfEquipmentItems: any;
  listOfConsumablesItems: any;
  surgeryForm: any;
  surgeryTableForm: any;
  priorities: any;
  departments: any;
  doctorsList: any;
  doctorsList1: any;
  SurgeryList: any;
  estTime: any;
  bloodOrderBedID: any = 0;
  IsInfected: any = 0;
  IsBloodRequired: any = 0;
  SurgeryRequestid: any = 0;
  MonitorID: any = 0;
  errorMessages: any[] = [];
  isReferral: any = false;
  equipmentTableForm: any;
  consumablesTableForm: any;
  bloodTableForm: any;
  FetchBloodComponentssDataaList: any = [];
  showChildComponent = false;
  surgeryIDFromParent: any;
  markedinputData: any = [];

  defObGynProcedures: string[] = ['6191', '6981', '6193', '6907', '6183', '7590'];
  defGitProcedures: string[] = ['32289', '27356', '33718', '4960'];
  defGsProcedures: string[] = ['6813', '5912', '26784', '7447', '8144'];
  defEntProcedures: string[] = ['6006', '6779', '6011', '6003', '5982'];
  fastingtimearr: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
  cannotPrescribeProcName: any;
  adviceReasonForAdmSubmitted: boolean = false;
  noofdaysToFollowup: boolean = false;
  followupRemarks: boolean = false;
  referralRemarks: boolean = false;
  referralSpecialization: boolean = false;
  referralReason: boolean = false;
  referralPriority: boolean = false;
  surgeryRequestSubmitted: boolean = false;
  showNoofDaysFollowUp: boolean = false;
  NoofFollowUp: string = "0";
  NoofDays: string = "0";
  surgeryRequestDataDetailsLevel: any = [];
  facility: any;
  fromCasesheet = false;
  isNotScheduled = false;
  disableSave = false;

  obgyneFormType = "";
  obgyneFormType1 = "";
  smartDataList: any;
  showHideFormTabs = false;
  activeAssessmentTab = '';
  activeAssessmentTab1 = '';
  savedSpecialisationAssessmentsList: any = [];
  savedSpecialisationConsentsList: any = [];
  templateArray: any = [];
  surgeryIds: string = "";
  consentSaved: boolean = false;
  isSmallScreen: boolean = false;
  PrescriptionRestriction: string = "";
  consentPrint: any = [];

  generalConsentSaved = false;
  medicalConsentSaved = false;
  hrContentSaved = false;
  enableCancelSurReq = false;
  referralType: number = 0;

  remarkForm: any;

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
  @ViewChild('multidisciplanary', { static: false }) multidisciplanary: MultidisciplanaryPatientFamilyEducationFormComponent | undefined;

  @ViewChild('PatientDischargeSummaryRef', { static: false }) patientDischargeSummaryRef: InPatientDischargeSummaryComponent | undefined;

  get equipmentitems(): FormArray {
    return this.equipmentTableForm.get('items') as FormArray;
  }

  get consumablesitems(): FormArray {
    return this.consumablesTableForm.get('items') as FormArray;
  }

  get blooditems(): FormArray {
    return this.bloodTableForm.get('items') as FormArray;
  }

  get items(): FormArray {
    return this.surgeryTableForm.get('items') as FormArray;
  }

  @ViewChild('surgeryInput') surgeryInput!: ElementRef;

  private saveClickSubject = new Subject<void>();
  private saveAssesmentClickSubject = new Subject<void>();

  constructor(private fb: FormBuilder, private config: ConfigService, private router: Router, private modalService: GenericModalBuilder,
    private changeDetectorRef: ChangeDetectorRef, private modalSvc: NgbModal, private us: UtilityService, private renderer: Renderer2, private el: ElementRef) {
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.admissionForm = this.fb.group({
      TodayAfter: ['T', Validators.required],
      AfterDays: ['0'],
      Admission: [new Date(), Validators.required],
      Expectedlengthofstay: ['0', Validators.required],
      DischargeDate: ['', Validators.required],
      DietType: ['', Validators.required],
      PrimaryConsultant: [this.doctorDetails[0].EmployeeName, Validators.required],
      AdmissionType: ['', Validators.required],
      Reason: ['', Validators.required],
      adviceToPatient: ['']
    });

    this.addDays();

    this.admissionForSurgeryForm = this.fb.group({
      TodayAfter: ['T', Validators.required],
      AfterDays: ['0'],
      Admission: [new Date(), Validators.required],
      Expectedlengthofstay: ['0', Validators.required],
      DischargeDate: ['', Validators.required],
      DietType: ['', Validators.required],
      PrimaryConsultant: [this.doctorDetails[0].EmployeeName, Validators.required],
      AdmissionType: ['', Validators.required],
      Reason: ['', Validators.required],
      adviceToPatient: ['']
    });

    this.addDaysForSurgery();

    this.followupForm = this.fb.group({
      FollowupAfter: ['', Validators.required],
      FollowupDate: ['', Validators.required],
      Remarks: ['', Validators.required],
      NoofFollowUp: ['0'],
      NoofDays: [''],
      adviceToPatient: ['']
    });

    this.referralForm = this.fb.group({
      Type: [1, Validators.required],
      Location: [0, Validators.required],
      LocationName: ['', Validators.required],
      DoctorID: ['', Validators.required],
      DoctorName: ['', Validators.required],
      Remarks: ['', Validators.required],
      Specialization: [0, Validators.required],
      SpecializationName: ['', Validators.required],
      Reason: [0, Validators.required],
      ReasonName: ['', Validators.required],
      Priority: [0, Validators.required],
      PriorityName: ['', Validators.required],
      Duration: ['', Validators.required],
      Cosession: [false, Validators.required],
      REFERRALORDERID: [0],
      BKD: [0],
      SpecialisationDoctorName: ['0', Validators.required],
      SpecialisationDoctorID: ['', Validators.required],
      StartDate: [''],
      EndDate: [''],
      adviceToPatient: [''],
      Status:[0],
      StatusName:['']
    });

    const currentDateTime = new Date();
    const currentTime = currentDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    this.surgeryForm = this.fb.group({
      SurgeryID: ['', Validators.required],
      SurgeryName: ['', Validators.required],
      SurgeryCode: ['', Validators.required],
      ProposedDate: [new Date()],
      ProposedTime: [currentTime],
      FastingTime: ['1', Validators.required],
      Consent: [false, Validators.required],
      OTInstructions: ['', Validators.required],
      WardsInstructions: ['', Validators.required],
      ANESTHESIOLOGISTINSTRUCTIONS: ['', Validators.required],
      HighRiskPatient: [false, Validators.required],
      Remarks: ['']
    });

    this.surgeryTableForm = this.fb.group({
      SurgeryID: ['', Validators.required],
      SurgeryName: ['', Validators.required],
      SurgeryCode: ['', Validators.required],
      Priority: ['0', Validators.required],
      Primary: [false, Validators.required],
      Department: ['0', Validators.required],
      Surgeon: ['0', Validators.required],
      EstTime: ['0', Validators.required],
      EstTimeValue: ['1', Validators.required],
      SpecialiseID: [''],
      DepartmentList: this.fb.array([
        this.createItemFormGroup() // Create initial item form group
      ])
    });

    this.equipmentTableForm = this.fb.group({
      EquipmentID: ['', Validators.required],
      EquipmentName: ['', Validators.required],
      QOH: ['', Validators.required],
      Quantity: ['', Validators.required]
    });

    this.consumablesTableForm = this.fb.group({
      ImplantID: ['', Validators.required],
      ImplantName: ['', Validators.required],
      ItemCode: ['', Validators.required],
      Category: ['', Validators.required]
    });

    this.bloodTableForm = this.fb.group({
      IsSelected: [false],
      ComponentId: ['', Validators.required],
      Component: ['', Validators.required],
      Code: ['', Validators.required],
      Quantity: ['', Validators.required]
    });

    //this.items.push(this.surgeryTableForm);

    this.saveClickSubject.pipe(
      debounceTime(1000)
    ).subscribe(() => this.saveSurgeryThenAdmission());

    this.saveAssesmentClickSubject.pipe(
      debounceTime(1000)
    ).subscribe(() => this.saveAssessment());
  }

  createItemFormGroup() {
    return this.fb.group({
      DepartmentList: this.fb.array([])
    });
  }

  addItem(element: any) {
    const itemFormGroup = this.fb.group({
      SurgeryID: element.SurgeryID,
      SurgeryName: element.SurgeryName,
      SurgeryCode: element.SurgeryCode
    })
    this.items.push(itemFormGroup);
  }

  ngOnInit(): void {
    this.remarkForm = this.fb.group({
        remarks: ['', [Validators.required]]
    });
    if (this.data) {
      this.readonly = this.data.readonly;
    }

    this.langData = this.config.getLangData();
    this.assignTemplateScreenNamesValues();
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');

       
    if (sessionStorage.getItem("ISEpisodeclose") === "true") {
      this.endofEpisode = true;
    } else {
      this.endofEpisode = false;
    }
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.AdmissionID = this.selectedView.AdmissionID == undefined ? this.selectedView.IPID : this.selectedView.AdmissionID;
    if (this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4'||this.selectedView.PatientType == '1') {
      if(this.selectedView.PatientType == '1')
        this.AdmissionID = this.selectedView.AdmissionID == undefined ? this.selectedView.IPID : this.selectedView.AdmissionID;
      else
      this.AdmissionID = this.selectedView.IPID;
      this.activeMainTab('referral');
      this.activeTab('referral');
    }
    if (this.selectedView.IsFitForDischarge !== undefined && this.selectedView.IsFitForDischarge) {
      this.dischargeIntimationRiased = true;      
    } 
    this.PrescriptionRestriction = this.doctorDetails[0].PrescriptionRestriction;
    this.hospId = sessionStorage.getItem("hospitalId");
    this.fetchDiagnosis();
    this.fetchDietType();
    this.fetchAdminMasters();
    this.fetchHospitalLocations();
    this.fetchReferalAdminMasters();
    this.fetchReasons();
    this.fetchPriority();
    this.viewSurgery();

    this.surgeryTableForm = this.fb.group({
      items: this.fb.array([]) // FormArray for storing the dropdown items
    });

    this.equipmentTableForm = this.fb.group({
      items: this.fb.array([]) // FormArray for storing the dropdown items
    });

    this.consumablesTableForm = this.fb.group({
      items: this.fb.array([]) // FormArray for storing the dropdown items
    });

    this.bloodTableForm = this.fb.group({
      items: this.fb.array([]) // FormArray for storing the dropdown items
    });

    this.FetchDentalDermaSpecialSpecialisation();
    this.FetchMapClinicalTemplateSpecializations();

    this.updateScreenCondition(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateScreenCondition(event.target.innerWidth);
  }

  updateScreenCondition(width: number) {
    this.isSmallScreen = width < 992;
  }

  ngAfterViewInit(): void {
    this.fetchAdviceData();
  }

  fetchAdviceData() {
    this.config.fetchAdviceData(this.AdmissionID, this.hospId).subscribe((response) => {

      //const element = this.followup.nativeElement.querySelector('.nav-link');
      //element.click();

      if (response.PatientAdviceDatasList.length > 0) {
        this.intMonitorId = response.PatientAdviceDatasList[0].MonitorID;
        this.FollowAfter = response.PatientAdviceDatasList[0].FollowAfter;
        const adviceToPatient = response.PatientAdviceDatasList[0].Advice;
        if (response.PatientAdviceDatasList[0].FollowUpType === "2") {
          // const element = this.admission.nativeElement.querySelector('.nav-link');
          // element.click();
          let TodayAfter = 'T';
          if (response.PatientAdviceDatasList[0].FollowAfter != 0) {
            TodayAfter = 'A';
          }

          this.admissionForm.patchValue({
            TodayAfter: TodayAfter,
            AfterDays: response.PatientAdviceDatasList[0].FollowAfter,
            Admission: new Date(response.PatientAdviceDatasList[0].FollowUpOn),//moment(response.PatientAdviceDatasList[0].FollowUpOn).format('DD-MMM-YYYY'),
            Expectedlengthofstay: response.PatientAdviceDatasList[0].LengthOfStay,
            DietType: response.PatientAdviceDatasList[0].DietTypeID,
            PrimaryConsultant: this.doctorDetails[0].EmployeeName,
            AdmissionType: response.PatientAdviceDatasList[0].AdmissionTypeID,
            Reason: response.PatientAdviceDatasList[0].ReasonForAdm,
            adviceToPatient: adviceToPatient
          });

          this.admissionForSurgeryForm.patchValue({
            TodayAfter: TodayAfter,
            AfterDays: response.PatientAdviceDatasList[0].FollowAfter,
            Admission: new Date(response.PatientAdviceDatasList[0].FollowUpOn),//moment(response.PatientAdviceDatasList[0].FollowUpOn).format('DD-MMM-YYYY'),
            Expectedlengthofstay: response.PatientAdviceDatasList[0].LengthOfStay,
            DietType: response.PatientAdviceDatasList[0].DietTypeID,
            PrimaryConsultant: this.doctorDetails[0].EmployeeName,
            AdmissionType: response.PatientAdviceDatasList[0].AdmissionTypeID,
            Reason: response.PatientAdviceDatasList[0].ReasonForAdm,
            adviceToPatient: adviceToPatient
          });

          this.addDays(); this.addDaysForSurgery();
        }
        else if (response.PatientAdviceDatasList[0].FollowUpType === "1") {
          //const element = this.followup.nativeElement.querySelector('.nav-link');
          //element.click();

          this.followupForm.patchValue({
            FollowupAfter: response.PatientAdviceDatasList[0].FollowAfter,
            Remarks: response.PatientAdviceDatasList[0].Remarks,
            NoofDays: response.PatientAdviceDatasList[0].Followupdays,
            NoofFollowUp: response.PatientAdviceDatasList[0].FollowUpCount,
            adviceToPatient: adviceToPatient
          });

          this.addFollowupDays();
        }

      }

      if (response.PatientAdviceReferalDataList.length > 0) {
        //const element = this.referral.nativeElement.querySelector('.nav-link');
        //element.click();
        response.PatientAdviceReferalDataList.forEach((element: any, index: any) => {
          const selectedItem = this.locationList.find((value: any) => value.HospitalID === Number(element.LocationID));
          let refer = {
            "Type": element.IsInternalReferral === true ? 1 : 0,
            "Location": selectedItem.HospitalID,
            "LocationName": selectedItem.Name,
            "SpecialisationDoctorID": element.DoctorID,
            "SpecialisationDoctorName": element.DoctorName,
            "Remarks": element.Remarks,
            "Specialization": element.SpecialiseID,
            "SpecializationName": element.Specialisation,
            "Reason": element.ReasonID,
            "ReasonName": element.ReasonName,
            "Priority": element.Priority,
            "PriorityName": element.PriorityName,
            "Duration": element.duration,
            "Cosession": element.CoSession,
            "REFERRALORDERID": element.ReferralOrderID,
            "BKD": 0,
            "StartDate": element.StartDate,
            "EndDate": element.EndDate,
            "Status": element.Status,
            "StatusName": element.StatusName,
            "AcceptRejectRemarks": element.AcceptRejectRemarks,
            "IsVisited": element.IsVisited,
            "IsVisitedUpdatedBy": element.IsVisitedUpdatedBy,
            "VisitUpdatedByName": element.VisitUpdatedByName
          };

          this.referralList.push(refer);
        });
      }

      if (response.PatientAdviceSurgeryDataList.length > 0) {
        //this.SurgeryRequestid = response.PatientAdviceSurgeryDataList[0].SurgeryRequestid;
        //const element = this.surgery.nativeElement.querySelector('.nav-link');
        //element.click();
      }
    },
      (err) => {

      })

  }

  activeTab(tab: any) {
    if (this.activeTab1 != tab) {
      // this.admissionForm = this.fb.group({
      //   TodayAfter: ['T', Validators.required],
      //   AfterDays: ['0'],
      //   Admission: [new Date(), Validators.required],
      //   Expectedlengthofstay: ['0', Validators.required],
      //   DischargeDate: ['', Validators.required],
      //   DietType: ['', Validators.required],
      //   PrimaryConsultant: [this.doctorDetails[0].EmployeeName, Validators.required],
      //   AdmissionType: ['', Validators.required],
      //   Reason: ['', Validators.required]
      // });

      // this.addDays();

      this.followupForm = this.fb.group({
        FollowupAfter: ['', Validators.required],
        FollowupDate: ['', Validators.required],
        Remarks: ['', Validators.required],
        NoofFollowUp: ['0'],
        NoofDays: ['']
      });
    }

    if (tab == "admission") {
      this.FollowUpType = 2;
    }
    else if (tab == "followup") {
      this.FollowUpType = 1;
    }
    else {
      this.FollowUpType = 0;
    }

    this.activeTab1 = tab;
  }

  fetchDietTypeOld() {
    this.config.fetchDietTypesOld().subscribe((response) => {
      this.dietType = response.GetMasterDataList;
    });
  }
  fetchDietType() {
    this.config.fetchDietTypes(this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response) => {
      this.dietType = response.FetchAdmissionTypeHDataList;
    });
  }

  fetchAdminMastersOld() {
    this.config.fetchAdminMasters(39).subscribe((response) => {
      this.fetchAdmin = response.SmartDataList;
    });
  }
  fetchAdminMasters() {
    this.config.FetchAdmissionTypeH(this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response) => {
      this.fetchAdmin = response.FetchAdmissionTypeHDataList;
    });
  }

  fetchReferalAdminMasters1() {
    this.config.fetchAdminMasters(11).subscribe((response) => {
      this.SpecializationList = this.SpecializationList1 = response.SmartDataList;
    });
  }
  fetchReferalAdminMasters() {
    this.config.fetchConsulSpecialisationNew(
      'distinct SpecialiseID id,Specialisation name,Specialisation2l name2L,SpecializationCode code,blocked,Blocked BitBlocked,HospitalID HospitalID,IsPediatric',
      'IsConsPri=1 and IsReferral=1 and Blocked=0 and HospitalID=' + this.hospId,
      0, this.hospId).subscribe((response) => {
        this.SpecializationList = this.SpecializationList1 = response.FetchConsulSpecialisationDataList;
      });
  }

  fetchReasons() {
    this.config.fetchAdminMasters(76).subscribe((response) => {
      this.reasonsList = response.SmartDataList;
    });
  }

  fetchDiagnosis() {
    this.config.fetchAdviceDiagnosis(this.AdmissionID, this.hospId).subscribe((response) => {
      this.PatientDiagnosisDataList = response.PatientDiagnosisDataList;
      this.PatientDiagnosisDataList.forEach((element: any, index: any) => {
        element.selected = true;
        //element.MODDATE = this.datepipe.transform(new Date(element.MODDATE), "dd-MMM-yyyy")?.toString()
      });

      if (this.PatientDiagnosisDataList.length === 0) {
        this.errorMessages.push("No Diagnosis for the patient");
        $("#errorDiagonsisMsg").modal('show');
      }
    },
      (err) => {

      })
  }

  selectedRow(item: any) {
    const selectedItem = this.PatientDiagnosisDataList.find((value: any) => value.Code === item);
    if (selectedItem) {
      selectedItem.selected = !selectedItem.selected;
    }
  }

  addDays() {
    let Expectedlengthofstay = this.admissionForm.get('Expectedlengthofstay').value;
    const admissionDate = new Date(this.admissionForm.get('Admission').value);
    if (Expectedlengthofstay >= 0) {
      const endDate = new Date(admissionDate.getTime() + (Expectedlengthofstay * 24 * 60 * 60 * 1000));
      this.admissionForm.get('DischargeDate').setValue(endDate);
    }
  }

  addDaysForSurgery() {
    let Expectedlengthofstay = this.admissionForSurgeryForm.get('Expectedlengthofstay').value;
    const admissionDate = new Date(this.admissionForSurgeryForm.get('Admission').value);
    if (Expectedlengthofstay >= 0) {
      const endDate = new Date(admissionDate.getTime() + (Expectedlengthofstay * 24 * 60 * 60 * 1000));
      this.admissionForSurgeryForm.get('DischargeDate').setValue(endDate);
    }
  }

  onDateChange(event: any) {
    this.admissionForm.get('TodayAfter').setValue("A");
    const timeDifference = new Date(event.value).getTime() - new Date().getTime();
    const daysDifference = (timeDifference / (1000 * 60 * 60 * 24)) + 1;
    this.admissionForm.get('AfterDays').setValue(Math.floor(daysDifference));
    if (this.admissionForm.get('Expectedlengthofstay').value >= 0) {
      this.addDays();
    }
  }

  onDateChangeForSurgery(event: any) {
    this.admissionForSurgeryForm.get('TodayAfter').setValue("A");
    const timeDifference = new Date(event.value).getTime() - new Date().getTime();
    const daysDifference = (timeDifference / (1000 * 60 * 60 * 24)) + 1;
    this.admissionForSurgeryForm.get('AfterDays').setValue(Math.floor(daysDifference));
    if (this.admissionForSurgeryForm.get('Expectedlengthofstay').value >= 0) {
      this.addDaysForSurgery();
    }
  }

  futureDatesFilter = (date: Date | null): boolean => {
    const currentDate = new Date();
    return date ? date >= currentDate : false;
  };

  addAfterDays() {
    let afterDays = this.admissionForm.get('AfterDays').value;
    const admissionDate = new Date();
    const endDate = new Date(admissionDate.getTime() + (afterDays * 24 * 60 * 60 * 1000));
    this.admissionForm.get('Admission').setValue(endDate);

    if (this.admissionForm.get('Expectedlengthofstay').value >= 0) {
      this.addDays();
    }

    this.FollowAfter = afterDays;
  }

  addFollowupDays() {
    let afterDays = this.followupForm.get('FollowupAfter').value;
    const admissionDate = new Date();
    const endDate = new Date(admissionDate.getTime() + (afterDays * 24 * 60 * 60 * 1000));
    this.followupForm.get('FollowupDate').setValue(endDate);
    this.FollowAfter = afterDays;
  }

  saveAdvice() {
    this.errorMessages = [];
    // if (!this.isSurgery && this.adviceToPatient === '') {
    //   this.errorMessages.push("Enter valid Advice");
    // }

    if (!this.isReferral) {
      if (this.FollowUpType === 2) {

        var IsAdmissionRec = sessionStorage.getItem("IsAdmissionRec");
        if (IsAdmissionRec == "0") {
          this.errorMessages.push("Save Admission Reconciliation Before Admission Raise");
          if (this.errorMessages.length > 0) {
            $("#errorAdviceMsg").modal('show');
            return;
          }

        }

        if (!this.admissionForm.get('AfterDays').value) {
          this.errorMessages.push("Enter After Days");
        }

        if (!this.admissionForm.get('Expectedlengthofstay').value) {
          this.errorMessages.push("Enter Expected length of stay");
        }

        if (this.admissionForm.get('Reason').value === '') {
          this.adviceReasonForAdmSubmitted = true;
          this.errorMessages.push("Enter Reason for Admission");
        }
      }

      if (this.FollowUpType === 1) {
        if (!this.followupForm.get("FollowupAfter").value) {
          this.noofdaysToFollowup = true;
          this.errorMessages.push("Enter Number of Days to do Followup");
          $("#followupAfter").focus();
        }

        // if (!this.followupForm.get("Remarks").value) {
        //   this.followupRemarks = true;
        //   this.errorMessages.push("Enter Followup Remarks");
        // }
      }
      this.NoofFollowUp = this.followupForm.get("NoofFollowUp").value == "0" ? "0" : this.followupForm.get("NoofFollowUp").value;
      this.NoofDays = this.followupForm.get("NoofDays").value == "" ? "0" : this.followupForm.get("NoofDays").value;
    }
    else {
      if (this.referralList.length === 0) {
        this.errorMessages.push("Add atleast one Referral")
      }
    }

    if (this.errorMessages.length > 0) {
      $("#errorAdviceMsg").modal('show');
      return;
    }


    if (this.FollowUpType === 2 && this.admissionForm.get('TodayAfter').value === 'A') {
      this.FollowUpOn = moment(this.admissionForm.get('Admission').value).format('DD-MMM-YYYY');
    }
    else if (this.FollowUpType === 1) {
      this.FollowUpOn = moment(this.followupForm.get('FollowupDate').value).format('DD-MMM-YYYY');
    }
    else if (this.FollowUpType === 0) {
      this.FollowUpOn = moment(new Date()).format('DD-MMM-YYYY');
      this.FollowUpType = 0;
      this.FollowAfter = 0;
    }

    this.diagnosis = [];

    this.PatientDiagnosisDataList.forEach((element: any, index: any) => {
      if (element.selected) {
        this.diagnosis.push({
          "DID": element.DID,
          "DISEASENAME": element.DiseaseName,
          "CODE": element.Code,
          "DTY": element.DiagnosisType,
          "UID": this.doctorDetails[0].EmpId,
          "ISEXISTING": "1",
          "PPID": "0",
          "STATUS": element.STATUS,
          "DTID": element.DTID,
          "DIAGNOSISTYPEID": element.DIAGNOSISTYPEID,
          "ISPSD": "0",
          "REMARKS": "",
          "MNID": element.MonitorID,
          "IAD": "1"
        })
      }
    });

    this.referralList.forEach((element: any, index: any) => {
      this.refDetailsList.push({
        "RTID": element.Reason,
        "SPID": element.Specialization,
        "PRTY": element.Priority,
        "DID": element.SpecialisationDoctorID,
        "RMKS": element.Remarks,
        "BKD": element.BKD,
        "RRMKS": "0",
        "RID": element.Reason,
        "DRN": 1,//element.Duration,
        "IIRF": element.Type,
        "COSS": element.Cosession === true ? 1 : 0,
        "RHOSPID": element.Location,
        "REFERRALORDERID": element.REFERRALORDERID
      })
    });

    let payload = {
      "intMonitorID": this.intMonitorId, //this.PatientDiagnosisDataList[0].MonitorID,
      "PatientID": this.selectedView.PatientID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "IPID": this.AdmissionID,
      "SpecialiseID": this.selectedView.SpecialiseID,
      "PatientType": this.selectedView.PatientType,
      "BillID": this.selectedView.BillID,
      "FollowUpType": this.FollowUpType,
      "Advicee": this.FollowUpType === 1 ? this.followupForm.get('adviceToPatient').value : this.admissionForm.get('adviceToPatient').value,
      "FollowAfter": this.FollowAfter,
      "FollowUpOn": this.FollowUpOn,
      "DiagDetailsList": this.diagnosis,
      "ReasonforAdm": this.admissionForm.get('Reason').value,
      "RefDetailsList": this.refDetailsList,
      "LengthOfStay": this.admissionForm.get('Expectedlengthofstay').value ? this.admissionForm.get('Expectedlengthofstay').value : 0,
      "DietTypeID": this.admissionForm.get('DietType').value ? this.admissionForm.get('DietType').value : 0,
      "FollowUpRemarks": this.followupForm.get('Remarks').value,
      "PrimaryDoctorID": this.doctorDetails[0].EmpId,
      "AdmissionTypeID": this.admissionForm.get('AdmissionType').value ? this.admissionForm.get('AdmissionType').value : 0,
      "FollowUpCount": this.NoofFollowUp === '' ? '0' : this.NoofFollowUp,
      "Followupdays": this.NoofDays,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": sessionStorage.getItem('hospitalId'),
      "BillType": this.selectedView.BillType == 'Insured' ? 'CR' : 'CS',
      "CompanyID": this.selectedView.CompanyID == "" ? 0 : this.selectedView.CompanyID,
      "GradeID": this.selectedView.GradeID,
      "WardID": 0,
      "PrimaryDoctorSpecialiseID": 0
    }

    const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        if(this.isReferral) {
          this.config.saveAdviceReferral(payload).subscribe((response: any) => {
            if (response.Status === "Success" || response.Status === "True") {
              $("#saveAdviceMsg").modal("show");
            }
          },
            () => {

            })
        }
        else {
          this.config.saveAdvice(payload).subscribe((response: any) => {
            if (response.Status === "Success" || response.Status === "True") {
              $("#saveAdviceMsg").modal("show");
            }
          },
            () => {

            })
        }
      }
      modalRef.close();
    });
  }

  focusOnFollowUp() {
    if (this.FollowUpType === 1) {
      if (!this.followupForm.get("FollowupAfter").value) {
        setTimeout(() => {
          // $("#followupAfter").focus();
          this.followupAfter.nativeElement.focus();
        }, 0);
      }
    }
  }

  todayClick() {
    this.admissionForm.get('Admission').setValue(new Date());
    this.admissionForm.get('AfterDays').setValue('0');
    this.FollowAfter = 0;
    this.addDays();
  }

  SaveData() {
    this.consentSaved = true;
    this.savechanges.emit('Advice');
  }

  onCloseConsentTemplatesModal() {
    if (this.selectedView.PatientType === '3') {
      this.consentSaved = true;
      $("#consentTemplates").modal("hide");
    } else if (!this.medicalConsentSaved || !this.generalConsentSaved) {
      this.errorMessages = [];
      this.errorMessages.push('General Consent and Medial Consent Mandatory');
      $('#errorAdviceMsg').modal('show');
    } else {
      $("#consentTemplates").modal("hide");
    }
  }

  SaveConsentForms(type: string) {
    if (type === 'hrConsent') {
      this.hrContentSaved = true;
    } else if (type === 'generalConsent') {
      this.generalConsentSaved = true;
    } else if(type === 'medicalConsent') {
      this.medicalConsentSaved = true;
    }

    if (this.selectedView.PatientType === '3') {
      this.consentSaved = true;
    }
    else if (!this.medicalConsentSaved || !this.generalConsentSaved) {
      this.consentSaved = false;
      return;
    } else {
      this.consentSaved = true;
    }

    $("#consentTemplates").modal("hide");
    if (this.selectedView.PatientType !== '2' && this.selectedView.PatientType !== '4') {
      this.saveAdviceForAdmissionInSurgeryTab();
    }
    else {
      this.fetchotdetails(this.surgeryIds);
    }
  }

  SaveDiag() {
    this.savechanges.emit('');
  }

  clear() {
    this.clearchanges.emit();
  }

  fetchHospitalLocations() {
    this.config.fetchFetchHospitalLocations().subscribe((response) => {
      if (response.Status === "Success") {
        this.locationList = response.HospitalLocationsDataList;
        // if (response.HospitalLocationsDataList.length == 1) {
        //   this.referralForm.get('Location')?.setValue(response.HospitalLocationsDataList[0].HospitalID);
        //   this.referralForm.get('LocationName')?.setValue(response.HospitalLocationsDataList[0].Name);
        // }
        var res = response.HospitalLocationsDataList.filter((h: any) => h.HospitalID == this.hospId);
        this.referralForm.get('Location')?.setValue(res[0].HospitalID);
        this.referralForm.get('LocationName')?.setValue(res[0].Name);
      } else {
      }
    },
      (err) => {

      })
  }

  fetchPriority() {
    this.config.fetchPriority().subscribe((response) => {
      this.priorityList = response.SmartDataList;
    });
  }

  fetchSpecializationDoctorSearch() {
    this.config.fetchSpecialisationDoctors('%%%', this.referralForm.get("Specialization").value, this.doctorDetails[0].EmpId, this.hospId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.listOfSpecItems = this.listOfSpecItems1 = response.FetchDoctorDataList;
        setTimeout(() => {
          const selectedItem = this.listOfSpecItems.find((value: any) => Number(value.Empid) === Number(this.referralForm.get("SpecialisationDoctorID").value));
          if (selectedItem) {
            this.referralForm.patchValue({
              SpecialisationDoctorName: selectedItem.EmpNo + ' - ' + selectedItem.Fullname,
              SpecialisationDoctorID: selectedItem.Empid
            });
          }
        }, 500);

      }
    }, error => {
      console.error('Get Data API error:', error);
    });
  }

  fetchDoctors(item: any) {
    this.config.fetchSpecialisationDoctors(item, 0, this.doctorDetails[0].EmpId, this.hospId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.listOfSpecItems = this.listOfSpecItems1 = response.FetchDoctorDataList;
      }
    }, error => {
      console.error('Get Data API error:', error);
    });
  }

  fetchDoctorSearch(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.config.fetchDoctorSearch(filter).subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfItems = response.ReferalDoctorDataList;
        }
      }, error => {
        console.error('Get Data API error:', error);
      });

    }
    else {
      this.listOfItems = [];
    }
  }

  selectItem(item: any) {
    this.referralForm.patchValue({
      DoctorName: item.DoctorName,
      DoctorID: item.DoctorID
    });

    this.listOfItems = [];
  }

  selectSpecItem(item: any) {
    const selectedItem = this.listOfSpecItems.find((value: any) => Number(value.EmpNo) === Number(item.target.value.split('-')[0].trim()));
    this.referralForm.patchValue({
      SpecialisationDoctorName: item.target.value,
      SpecialisationDoctorID: selectedItem.Empid
    });
  }

  doctorType(type: any) {
    if (type == 1) {
      $("#btnInternal").addClass("selected");
      $("#btnExternal").removeClass("selected");
    }
    else {
      $("#btnInternal").removeClass("selected");
      $("#btnExternal").addClass("selected");
    }

    this.referralForm.patchValue({
      Type: type
    });
    this.listOfSpecItems = [];
  }

  addReferral() {
    this.errorMessages = [];
    if (!this.referralForm.get("Location").value || this.referralForm.get("Location").value === "0") {
      this.errorMessages.push("Select Refer to Location")
    }

    if (!this.referralForm.get("SpecialisationDoctorName").value) {
      this.errorMessages.push("Add the Specialization Doctor Details")
    }

    if (!this.referralForm.get("Remarks").value) {
      this.referralRemarks = true;
      this.errorMessages.push("Enter Referral Remarks")
    }

    if (!this.referralForm.get("Specialization").value || this.referralForm.get("Specialization").value === "0") {
      this.referralSpecialization = true;
      this.errorMessages.push("Select Specialization")
    }

    if (!this.referralForm.get("Reason").value || this.referralForm.get("Reason").value === "0") {
      this.referralReason = true;
      this.errorMessages.push("Select Reason")
    }

    if (!this.referralForm.get("Priority").value || this.referralForm.get("Priority").value === "0") {
      this.referralPriority = true;
      this.errorMessages.push("Select Priority")
    }
    // if (!this.referralForm.get("Duration").value && this.selectedView.PatientType !== '1') {
    //   this.referralRemarks = true;
    //   this.errorMessages.push("Enter Duration")
    // }
    if (this.referralForm.get("Duration").value === "0" && this.selectedView.PatientType !== '1') {
      this.referralRemarks = true;
      this.errorMessages.push("Duration cant be zero")
    }

    // var reflist = this.referralList.filter((x: any) => x.SpecialisationDoctorID === this.referralForm.get('SpecialisationDoctorID')?.value);
    // if (reflist.length > 0) {
    //   this.errorMessages.push("Referral Doctor Already Added")
    // }
    const refDocExists = this.referralList.filter((x: any) => x.SpecialisationDoctorID === this.referralForm.get("SpecialisationDoctorID").value);
    if (refDocExists.length > 0 && (this.selectedView.PatientType === '2'||this.selectedView.PatientType === '4')) {
      refDocExists.forEach((element: any, index: any) => {
        const today = new Date();
        const enddate = new Date(element.EndDate);
        if (today < enddate) {
          this.errorMessages.push("Referral Doctor Already Added");
        }
      });
    }
    if (this.errorMessages.length > 0) {
      $("#errorAdviceMsg").modal('show');
      return;
    }
    this.referralForm.patchValue({
      "Status":'0',
      "StatusName":"New Request"
    });

    var res = this.locationList.filter((h: any) => h.HospitalID == this.hospId);
    if (this.selectedView.PatientType === '2'||this.selectedView.PatientType === '4') {
      var enddate = new Date(new Date().setDate(new Date().getDate() + Number(this.referralForm.get("Duration").value)));
      this.referralForm.patchValue({
        "StartDate": moment(new Date()).format('DD-MMM-YYYY'),
        "EndDate": moment(enddate).format('DD-MMM-YYYY')
     
      });
    }

    this.referralList.push(this.referralForm.value);
    this.referralForm = this.fb.group({
      Type: [1, Validators.required],
      Location: [res[0].HospitalID, Validators.required],
      LocationName: [res[0].Name, Validators.required],
      DoctorID: ['', Validators.required],
      DoctorName: ['', Validators.required],
      Remarks: ['', Validators.required],
      Specialization: [0, Validators.required],
      SpecializationName: ['', Validators.required],
      Reason: [0, Validators.required],
      ReasonName: ['', Validators.required],
      Priority: [0, Validators.required],
      PriorityName: ['', Validators.required],
      Duration: ['', Validators.required],
      Cosession: [false, Validators.required],
      REFERRALORDERID: [0],
      BKD: [0],
      SpecialisationDoctorName: ['0', Validators.required],
      SpecialisationDoctorID: ['', Validators.required],
      StartDate: [''],
      EndDate: ['']
    });


    if (this.locationList.length == 1) {
      this.referralForm.get('Location')?.setValue(this.locationList[0].HospitalID);
      this.referralForm.get('LocationName')?.setValue(this.locationList[0].Name);
    }

    this.doctorType(1);
  }

  locationChange(data: any) {
    const selectedItem = this.locationList.find((value: any) => value.HospitalID === Number(data.target.value));
    this.referralForm.patchValue({
      Location: selectedItem.HospitalID,
      LocationName: selectedItem.Name
    });
  }

  specializationChange(data: any) {
    const selectedItem = this.SpecializationList.find((value: any) => value.id === Number(data.target.value));
    this.referralForm.patchValue({
      Specialization: selectedItem.id,
      SpecializationName: selectedItem.name
    });
    this.fetchSpecializationDoctorSearch();
  }

  reasonChange(data: any) {
    const selectedItem = this.reasonsList.find((value: any) => value.id === Number(data.target.value));
    this.referralForm.patchValue({
      Reason: selectedItem.id,
      ReasonName: selectedItem.name
    });
  }

  priorityChange(data: any) {
    const selectedItem = this.priorityList.find((value: any) => value.id === Number(data.target.value));
    this.referralForm.patchValue({
      Priority: selectedItem.id,
      PriorityName: selectedItem.name
    });
  }

  deleteItem(item: any) {
    item.BKD = 1;
  }

  editRow(row: any, editIndex: any) {
    this.editIndex = editIndex;
    this.referralForm.patchValue({
      Type: row.Type,
      Location: row.Location,
      LocationName: row.LocationName,
      DoctorID: row.DoctorID,
      DoctorName: row.DoctorName,
      Remarks: row.Remarks,
      Specialization: row.Specialization,
      SpecializationName: row.SpecializationName,
      Reason: row.Reason,
      ReasonName: row.ReasonName,
      Priority: row.Priority,
      PriorityName: row.PriorityName,
      Duration: row.Duration,
      Cosession: row.Cosession,
      SpecialisationDoctorID: row.SpecialisationDoctorID,
      SpecialisationDoctorName: row.SpecialisationDoctorName
    });

    this.fetchSpecializationDoctorSearch();

    this.doctorType(row.Type);
    this.isEdit = true;
  }

  updateReferral() {
    this.errorMessages = [];
    if (!this.referralForm.get("Location").value || this.referralForm.get("Location").value === "0") {
      this.errorMessages.push("Select Refer to Location")
    }

    if (!this.referralForm.get("SpecialisationDoctorName").value) {
      this.errorMessages.push("Add the Specialization Doctor Details")
    }

    if (!this.referralForm.get("Remarks").value) {
      this.errorMessages.push("Enter Referral Remarks")
    }

    if (!this.referralForm.get("Specialization").value || this.referralForm.get("Specialization").value === "0") {
      this.errorMessages.push("Select Specialization")
    }

    if (!this.referralForm.get("Reason").value || this.referralForm.get("Reason").value === "0") {
      this.errorMessages.push("Select Reason")
    }

    if (!this.referralForm.get("Priority").value || this.referralForm.get("Priority").value === "0") {
      this.errorMessages.push("Select Priority")
    }

    if (this.errorMessages.length > 0) {
      $("#errorAdviceMsg").modal('show');
      return;
    }

    this.isEdit = false;
    var enddate = new Date(new Date().setDate(new Date().getDate() + Number(this.referralForm.get("Duration").value)));
    this.referralForm.patchValue({
      "StartDate": moment(new Date()).format('DD-MMM-YYYY'),
      "EndDate": moment(enddate).format('DD-MMM-YYYY')
    });

    this.referralList[this.editIndex].Type = this.referralForm.get("Type").value;
    this.referralList[this.editIndex].Location = this.referralForm.get("Location").value;
    this.referralList[this.editIndex].LocationName = this.referralForm.get("LocationName").value;
    this.referralList[this.editIndex].DoctorID = this.referralForm.get("DoctorID").value;
    this.referralList[this.editIndex].DoctorName = this.referralForm.get("DoctorName").value;
    this.referralList[this.editIndex].Remarks = this.referralForm.get("Remarks").value;
    this.referralList[this.editIndex].Specialization = this.referralForm.get("Specialization").value;
    this.referralList[this.editIndex].SpecializationName = this.referralForm.get("SpecializationName").value;
    this.referralList[this.editIndex].Reason = this.referralForm.get("Reason").value;
    this.referralList[this.editIndex].ReasonName = this.referralForm.get("ReasonName").value;
    this.referralList[this.editIndex].Priority = this.referralForm.get("Priority").value;
    this.referralList[this.editIndex].PriorityName = this.referralForm.get("PriorityName").value;
    this.referralList[this.editIndex].Duration = this.referralForm.get("Duration").value;
    this.referralList[this.editIndex].Cosession = this.referralForm.get("Cosession").value;
    this.referralList[this.editIndex].SpecialisationDoctorName = this.referralForm.get("SpecialisationDoctorName").value;
    this.referralList[this.editIndex].SpecialisationDoctorID = this.referralForm.get("SpecialisationDoctorID").value;
    this.referralList[this.editIndex].StartDate = this.referralForm.get("StartDate").value;
    this.referralList[this.editIndex].EndDate = this.referralForm.get("EndDate").value;

    this.referralForm = this.fb.group({
      Type: [1, Validators.required],
      Location: [0, Validators.required],
      LocationName: ['', Validators.required],
      DoctorID: ['', Validators.required],
      DoctorName: ['', Validators.required],
      Remarks: ['', Validators.required],
      Specialization: [0, Validators.required],
      SpecializationName: ['', Validators.required],
      Reason: [0, Validators.required],
      ReasonName: ['', Validators.required],
      Priority: [0, Validators.required],
      PriorityName: ['', Validators.required],
      Duration: ['', Validators.required],
      Cosession: [false, Validators.required],
      REFERRALORDERID: [0],
      BKD: [0],
      SpecialisationDoctorName: ['0', Validators.required],
      SpecialisationDoctorID: ['', Validators.required]
    });

    if (this.locationList.length == 1) {
      this.referralForm.get('Location')?.setValue(this.locationList[0].HospitalID);
      this.referralForm.get('LocationName')?.setValue(this.locationList[0].Name);
    }

    this.doctorType(1);
  }

  activeMainTab(tab: any) {
    if (tab === "surgery") {
      this.isSurgery = true;
      this.isReferral = false;
      this.fetchPriorities();
      this.fetchSurgeryDoctors();
      this.fetchSurgeryEstTime();
      if (this.selectedView.PatientType == '1')
        this.fetchSurgeryData();
    }
    else if (tab === "referral") {
      this.isReferral = true;
      this.isSurgery = false;
    }
    else {
      this.isSurgery = false;
      this.isReferral = false;
    }
  }

  fetchEquipments(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.config.fetchSurgeryEquipments(filter, this.hospId).subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfEquipmentItems = response.FetchSurgeryEquipmentsFDataList;
        }
      }, error => {
        console.error('Get Data API error:', error);
      });

    }
    else {
      this.listOfEquipmentItems = [];
    }
  }

  selectEquipmentItem(item: any) {
    this.listOfEquipmentItems = [];

    const itemFormGroup = this.fb.group({
      EquipmentID: item.EquipmentID,
      EquipmentName: item.EquipmentName,
      QOH: item.QOH,
      Quantity: null
    })
    this.equipmentitems.push(itemFormGroup);
  }

  fetchConsumables(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.config.fetchDrugsConsumables(filter, this.hospId).subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfConsumablesItems = response.FetchDrugsConsumablesFDataList;
        }
      }, error => {
        console.error('Get Data API error:', error);
      });

    }
    else {
      this.listOfConsumablesItems = [];
    }
  }

  selectConsumablesItem(item: any) {
    this.listOfConsumablesItems = [];

    const itemFormGroup = this.fb.group({
      ImplantID: item.ImplantID,
      ImplantName: item.ImplantName,
      ItemCode: item.ItemCode,
      Category: item.Category
    })
    this.consumablesitems.push(itemFormGroup);
  }

  onSurgeriesMousedown(event: any) {
    if (event.target.value.length === 0) {
      this.fetchSurgeries({
        target: {
          value: '%%%'
        }
      });
    }
  }

  fetchSurgeries(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      //this.config.fetchSurgeries(filter).subscribe((response: any) => {
      this.config.fetchSurgeriesH(filter.trim(), this.doctorDetails[0].EmpId).subscribe((response: any) => {
        if (response.Code == 200 && response.FetchSurgeriesDataaList.length > 0) {
          this.listOfSurgeryItems = response.FetchSurgeriesDataaList;
        } else {
          // this.errorMessages = [];
          // this.errorMessages.push("You are not authorized to request this surgery as it falls outside the scope of your agreed privileges.");
          // $("#errorAdviceMsg").modal('show');

        }
      }, error => {
        console.error('Get Data API error:', error);
      });

    }
    else {
      this.listOfSurgeryItems = [];
    }
  }

  selectSurgeryItem(item: any) {
    setTimeout(() => {
      this.surgeryInput?.nativeElement.blur();
    });
    this.errorMessages = [];
    var isDuplicate = this.items.controls.some(control => {
      const surgeryIdControl = control.get('SurgeryID');
      return surgeryIdControl && surgeryIdControl.value === item.ProcedureID;
    });

    const existingsurgeries = this.surgeryRequestDataDetailsLevel.filter((x: any) => x.ProcedureID === item.ProcedureID);
    const find = existingsurgeries.sort((a: any, b: any) => b.SurgeryRequestId - a.SurgeryRequestId)[0];
    if (find) {
      const startDate = new Date(find.ScheduleDate);
      const now = new Date();
      const differenceMs: number = now.getTime() - startDate.getTime();
      const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
      const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
      const totalHours = hours + (days * 24);

      if (find && totalHours < 24 && find.STATUSID != '12') {
        this.errorMessages.push("Selected surgery was already scheduled on" + find.ScheduleDate + ". Cannot order same surgery within 24 hrs of Scheduled date.");
        $("#errorAdviceMsg").modal('show');
        return;
      }
    }

    if (isDuplicate) {
      this.errorMessages.push("Duplicate Surgery details are not allowed");
      $("#errorAdviceMsg").modal('show');
      return;
    }
    // this.surgeryForm.patchValue({
    //   SurgeryID: item.ProcedureID,
    //   SurgeryName: item.Name,
    //   SurgeryCode: item.PCode,
    // });
    this.listOfSurgeryItems = [];
    this.config.FetchSpecialisationSurgery(item.ProcedureID, this.hospId).subscribe((response) => {
     
      if(response.FetchSpecialisationSurgeryOutputLists.length > 0) {
        var newProcedure = response.FetchSpecialisationSurgeryOutputLists[0];
        const existingIndex = this.consentPrint.findIndex((item: any) => item.ProcedureID === newProcedure.ProcedureID);

        if (existingIndex !== -1) {
          this.consentPrint.splice(existingIndex, 1);
        }

        this.consentPrint.push(newProcedure);
      }
     
      this.SurgeryList = response.FetchSpecialisationSurgeryOutputLists;
      //if (this.SurgeryList[0].SpecialiseID == this.doctorDetails[0].EmpSpecialisationId) {
      const itemFormGroup = this.fb.group({
        SurgeryID: item.ProcedureID,
        SurgeryName: item.Name,
        SurgeryCode: item.PCode,
        Priority: this.priorities.find((value: any) => value.name === "Routine") ? "0" : "-1",
        Primary: false,
        Department: "0",
        Surgeon: this.doctorsList.length === 1 ? this.doctorsList[0].Doctorid : "0",
        EstTime: this.estTime.find((value: any) => value.Names === "Hours") ? "4" : "0",
        EstTimeValue: '1',
        DepartmentList: this.fb.array([]),
        SpecialiseID: this.doctorsList[0].SpecialiseID,
        HighRiskPatient: false
      })
      this.getDepartments(itemFormGroup);
      this.items.push(itemFormGroup);

      // }
      // else {
      //   this.cannotPrescribeProcName = item.Name;
      //   $("#showCannotPrescribeMsg").modal('show');
      // }      
    });
  }

  checkProcedureCanPrescribe(data: any) {
    let SpecialiseID: any;
    this.config.FetchSpecialisationSurgery(data.ProcedureID, this.hospId).subscribe((response) => {
      this.SurgeryList = response.FetchSpecialisationSurgeryOutputLists;
      return this.SurgeryList[0].SpecialiseID;
    });
    // let find = this.SurgeryList.filter((x: any) => x?.ProcedureID === data.ProcedureID);
    // if (find) {
    //   find.forEach((element: any, index: any) => {
    //     find[index].SpecialiseID = this.doctorDetails[0].EmpSpecialisationId
    //   });
    // }

    //   if(this.doctorDetails[0].EmpSpecialisationId==SpecialiseID[0].SpecialiseID)
    //     return true;
    //  else 
    //     return false;





    // switch(this.doctorDetails[0].EmpSpecialisationId)
    // {
    // case "78":
    //   return this.defObGynProcedures.includes(data.ProcedureID);
    // case "247":
    //   return this.defGitProcedures.includes(data.ProcedureID);
    // case "106":
    //   return this.defGsProcedures.includes(data.ProcedureID);
    // case "34":
    //   return this.defEntProcedures.includes(data.ProcedureID);
    // case "89":
    //     return this.defEntProcedures.includes(data.ProcedureID);
    //   default:
    //     return false;
    // }
  }

  clearCannotPrescriveProcName() {
    this.cannotPrescribeProcName = "";
  }

  fetchPriorities() {
    this.config.fetchSurgeryPriority().subscribe((response) => {
      this.priorities = response.SmartDataList;
    });
  }

  fetchSurgeryDoctors() {
    //var docid = this.selectedView.PatientType == '1' ? this.doctorDetails[0].EmpId : this.selectedView.ConsultantID;
    var docid = this.doctorDetails[0].EmpId;
    this.config.fetchSurgeryDoctors(docid, this.hospId).subscribe((response) => {
      this.doctorsList = this.doctorsList1 = response.FetchSurgeryDoctorsDataList;
    });
  }

  getDepartments(item: any) {
    this.config.fetchSurgeryDoctorDept(item.get('Surgeon').value, this.hospId).subscribe((response) => {
      const departments = response.FetchSurgeryDoctorDeptDataaList;
      item.get('DepartmentList').value = departments;
      setTimeout(() => {
        if (departments[0]) {
          item.get('Department')?.setValue(departments[0].DepartmentID);
        }
      }, 1000);

    });
  }

  fetchSurgeryEstTime() {
    this.config.fetchSurgeryEstTime(this.hospId).subscribe((response) => {
      this.estTime = response.SurgeryDemographicsDataaList;
    });
  }

  clearSurgery() {
    const element = this.surgery.nativeElement.querySelector('.nav-link');
    element.click();
    this.items.controls.forEach((element: any, index: any) => {
      this.deleteSurgery(element);
    });
  }



  bloodRequest(type: any) {
    this.blooditems.clear();
    if (type === 1) {
      $("#btnBloodYes").addClass("selected");
      $("#btnBloodNo").removeClass("selected");
      this.IsBloodRequired = 1;

      this.config.fetchSurgeryBloodComponents(this.hospId).subscribe((response: any) => {
        if (response.Code == 200) {
          this.blooditems.clear();
          response.FetchSurgeryBloodComponentsFDataList.forEach((element: any, index: any) => {
            const selectItem = this.FetchBloodComponentssDataaList.find((value: any) => Number(value.BloodComponentID) === element.ComponentId);

            const itemFormGroup = this.fb.group({
              IsSelected: selectItem ? true : false,
              ComponentId: element.ComponentId,
              Component: element.Component,
              Code: element.Code,
              Quantity: selectItem ? selectItem.Quantity : null
            })
            this.blooditems.push(itemFormGroup);
          });
        }
      }, error => {
        console.error('Get Data API error:', error);
      });
    }
    else {
      $("#btnBloodYes").removeClass("selected");
      $("#btnBloodNo").addClass("selected");
      this.IsBloodRequired = 0;
    }
  }

  infectedClick(type: any) {
    if (type === 1) {
      $("#btnInfectedYes").addClass("selected");
      $("#btnInfectedNo").removeClass("selected");
      this.IsInfected = 1;
    }
    else {
      $("#btnInfectedYes").removeClass("selected");
      $("#btnInfectedNo").addClass("selected");
      this.IsInfected = 0;
    }
  }

  viewSurgery() {
    //this.config.fetchListofSurgies(this.AdmissionID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response) => {
    this.config.FetchViewSurgeriesH(this.AdmissionID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response) => {
      if (response.Code == 200) {
        this.surgeryRequestDataDetailsLevel = response.FetchViewSurgeriesHDataList;
        this.surgeryRequestDataDetailsLevel.forEach((element: any, index: any) => {
          element.selected = false;
        });

        //$("#divSurgeryRequests").modal('show');
      }
    },
      (err) => {

      })
  }

  showViewSurgeryPopup() {
    this.viewSurgery();
    $("#divSurgeryRequests").modal('show');
  }

  fetchSurgeryData() {
    this.items.clear();
    $("#divSurgeryRequests").modal('hide');
    this.config.fetchSurgeryData(this.SurgeryRequestid, this.hospId).subscribe((response) => {
      this.items.clear();
      response.FetchSurgeryDataDetailLevelDataList.forEach((element: any, index: any) => {
        const itemFormGroup = this.fb.group({
          SurgeryID: element.SurgeryID,
          SurgeryName: element.SurgeryName,
          SurgeryCode: element.Code,
          Priority: element.Priority,
          Primary: element.IsPrimary,
          Department: element.Departmentid,
          Surgeon: element.Surgeonid,
          EstTime: element.EstTimeID,
          EstTimeValue: element.EstDuration,
          DepartmentList: this.fb.array([])
        })

        this.getDepartments(itemFormGroup);
        this.items.push(itemFormGroup);

        this.surgeryForm.patchValue({
          ProposedDate: response.FetchSurgeryDataOrderLevelDataList[0].Tentativesurgeryplaned,
          ProposedTime: response.FetchSurgeryDataOrderLevelDataList[0].TentavtiveStartTime,
          Consent: response.FetchSurgeryDataOrderLevelDataList[0].Consenttaken,
          OTInstructions: response.FetchSurgeryDataOrderLevelDataList[0].OtInstructions,
          WardsInstructions: response.FetchSurgeryDataOrderLevelDataList[0].WardsInstructions,
          ANESTHESIOLOGISTINSTRUCTIONS: response.FetchSurgeryDataOrderLevelDataList[0].AnesthesiologistInstructions,
          FastingTime: response.FetchSurgeryDataOrderLevelDataList[0].FastingTIme,
          Remarks: response.FetchSurgeryDataOrderLevelDataList[0].Remarks,
        });

        if(response.FetchSurgeryDataOrderLevelDataList.length > 0) {
          const surReqStatus = response.FetchSurgeryDataOrderLevelDataList[0].Status;
          if(Number(surReqStatus) < 12) {
            this.enableCancelSurReq = true;
          }
          else {
            this.disableSave = true;
            this.enableCancelSurReq = false;
          }
        }

        this.MonitorID = response.FetchSurgeryDataOrderLevelDataList[0].MonitorID;

        if (response.FetchSurgeryDataOrderLevelDataList[0].IsBloodRequired) {
          this.bloodRequest(1);
        }

        if (response.FetchSurgeryDataOrderLevelDataList[0].IsInfected) {
          this.infectedClick(1);
        }
        if (response.FetchSurgeryDataOrderLevelDataList[0].IsGeneral === '1' || response.FetchSurgeryDataOrderLevelDataList[0].IsPatConsentHighRisk === '1' || response.FetchSurgeryDataOrderLevelDataList[0].IsPatMedical === '1') {
          this.consentSaved = true;
        }
      });

      this.equipmentitems.clear();
      response.FetchSurgeryEquLevelDataaList.forEach((element: any, index: any) => {
        const itemFormGroup = this.fb.group({
          EquipmentID: element.EquipmentID,
          EquipmentName: element.EquipmentName,
          QOH: element.QOH,
          Quantity: null
        })
        this.equipmentitems.push(itemFormGroup);
      });

      this.consumablesitems.clear();

      response.FetchDrugConsumablesDataaList.forEach((element: any, index: any) => {
        const itemFormGroup = this.fb.group({
          ImplantID: element.ImplantID,
          ImplantName: element.ImplantName,
          ItemCode: element.ItemCode,
          Category: element.Category
        })
        this.consumablesitems.push(itemFormGroup);
      });

      this.FetchBloodComponentssDataaList = [];
      this.FetchBloodComponentssDataaList = response.FetchBloodComponentssDataaList;

      response.FetchSurgeryAnnotationsDataList.forEach((element: any, index: any) => {
        let annotation = {
          "ATID": Number(element.AnnotationId),
          "PRID": Number(element.ProcedureID),
          "XX": element.XAxis,
          "YX": element.YAxis,
          "PDIS": element.PlotDescription,
          "TYPE": 'Edit',
          "SEQ": Number(element.Sequence)
        };
        this.markedinputData.push(annotation);
      });
    },
      (err) => {

      })

  }

  deleteSurgery(index: any) {
    const surgeryIDToDelete = this.items.at(index).value.SurgeryID;
    this.items.removeAt(index);

    const existingIndex = this.consentPrint.findIndex((item: any) => item.ProcedureID === surgeryIDToDelete);

    if (existingIndex !== -1) {
        this.consentPrint.splice(existingIndex, 1);
    }
  }

  deleteConsumables(index: any) {
    this.consumablesitems.removeAt(index);
  }

  deleteEquipment(index: any) {
    this.equipmentitems.removeAt(index);
  }

  getImage(index: any) {
    let sur = {
      SurgeryID: this.surgeryTableForm.value.items[index].SurgeryID,
      SurgeryName: this.surgeryTableForm.value.items[index].SurgeryName
    };
    this.surgeryIDFromParent = sur;

    $("#modalHumanBody").modal('show');
    if (this.selectedView.GenderID === "2")
      this.imageUrl = 'assets/images/Human-body-female.png';
    this.imageUrlParent = this.imageUrl;
    if (this.showChildComponent) {
      this.showChildComponent = false;
    }
    this.changeDetectorRef.detectChanges();
    this.showChildComponent = true;
  }

  onMarkedSelect(event: any) {
    this.markedinputData = event;
    $("#modalHumanBody").modal('hide');
  }

  FetchDentalDermaSpecialSpecialisation() {
    this.config.fetchDentalDermaSpecialSpecialisation(this.hospId).subscribe((response: any) => {
      if (response.Code == 200) {
        if (response.SmartDataList[0]?.SpecialisationID.includes(this.doctorDetails[0].EmpSpecialisationId)) {
          this.showNoofDaysFollowUp = true;
        }
      }
    });
  }

  fetchSurgeryRequest(sur: any) {
    this.surgeryRequestDataDetailsLevel.forEach((element: any, index: any) => {
      if (element.SurgeryRequestId === sur.SurgeryRequestId) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });

    this.SurgeryRequestid = sur.SurgeryRequestId;
    // if (sur.STATUSID !== '1') {
    //   this.disableSave = true;
    // }
    // else
    //   this.disableSave = false;
    //$("#divSurgeryRequests").modal('hide');
  }

  onFastingTimeInput(event: any) {
    this.errorMessages = [];
    const inputVal = event.target.value;
    if (inputVal !== '') {
      const value = parseInt(inputVal, 10);
      if (value > 24) {
        this.errorMessages.push("Fasting time should not be greater than 24 hours");
        $("#errorAdviceMsg").modal('show');
        this.surgeryForm.get('FastingTime').setValue('');
      }
    }
  }

  onFastingTimeInputTable(event: any, item: any) {
    this.errorMessages = [];
    const inputVal = event.target.value;
    if (inputVal !== '') {
      const value = parseInt(inputVal, 10);
      if (value > 24) {
        this.errorMessages.push("Est. time should not be greater than 24 hours");
        $("#errorAdviceMsg").modal('show');
        item.get('EstTimeValue').setValue('1');
      }
    }
  }

  toggleCheckboxSelection() {
    this.surgeryForm.get('Consent').setValue(!this.surgeryForm.get('Consent').value);
  }
  toggleHighRiskCheckboxSelection() {
    this.surgeryForm.get('HighRiskPatient').setValue(!this.surgeryForm.get('HighRiskPatient').value);
  }

  togglePrimary(item: any) {
    const primaryValue = item.get('Primary')?.value;
    item.patchValue({ Primary: !primaryValue });
  }

  closeOtSchedule() {
    const isScheduled = sessionStorage.getItem("isScheduled") || 'false';
    // if(isScheduled === 'false') {
    //   this.isNotScheduled = true;
    //   return;
    // }
    sessionStorage.removeItem("otpatient");
    sessionStorage.removeItem("fromCasesheet");
    sessionStorage.removeItem("isScheduled");
    this.fromCasesheet = false;
    $("#otdoctorAppointment").modal('hide');
    $("#saveSurgeryMsg").modal("show");
  }

  fetchotdetails(surReqId: any) {
    const fromdate = moment(new Date()).format('DD-MMM-YYYY');
    const todate = moment(new Date()).format('DD-MMM-YYYY');
    const SSNN = this.selectedView.SSN;
    this.config.FetchSurgerRecordsForDashboard(fromdate, todate, SSNN, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response: any) => {
      if (response.Code == 200) {
        const item = response.SurgeryRequestsDataList.find((x: any) => x.SurgeryRequestid == surReqId);
        sessionStorage.setItem("otpatient", JSON.stringify(item));
        sessionStorage.setItem("fromCasesheet", 'true');
        this.fromCasesheet = true;
        setTimeout(() => {
          $("#otdoctorAppointment").modal('show');
        });
      }
    });
  }
  openAdmissionReconciliation() {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.selectedView));
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(AdmissionreconciliationComponent, {
      data: '',
      readonly: true
    }, options);
  }

  getSurgeonName(item: any) {
    const surgeonValue = item.get('Surgeon')?.value;
    if (surgeonValue) {
      const surgeonData = this.doctorsList1.find((element: any) => element.Doctorid === surgeonValue);
      return  surgeonData ? surgeonData.NameSpec : '';
    } 
    return '';
  }

  searchSurgeonItem(event: any) {
    const item = event.target.value;
    let arr = this.doctorsList1.filter((spec: any) => spec.NameSpec.toLowerCase().indexOf(item.toLowerCase()) === 0);
    this.doctorsList = arr.length ? arr : [{ NameSpec: 'No Item found' }];
  }

  onSurgeonItemSelected(event: any, item: any) {
    this.doctorsList = this.doctorsList1;
    const surgeonItem = this.doctorsList1.find((data: any) => data.NameSpec === event.option.value);
    item.get('Surgeon')?.setValue(surgeonItem.Doctorid);
  }

  searchSpecItem(event: any) {
    const item = event.target.value;
    this.SpecializationList = this.SpecializationList1;
    let arr = this.SpecializationList1.filter((spec: any) => spec.name.toLowerCase().indexOf(item.toLowerCase()) === 0);
    this.SpecializationList = arr.length ? arr : [{ name: 'No Item found' }];
  }

  onSpecItemSelected(event: any) {
    const item = this.SpecializationList.find((data: any) => data.name === event.option.value);
    var IsAdult = true;
    if (this.selectedView.PatientType == '2'||this.selectedView.PatientType === '4') {
      IsAdult = Number(this.selectedView.AgeValue) >= 14 ? true : false;
    }
    else if (this.selectedView.PatientType == '3') {
      IsAdult = Number(this.selectedView.Age.trim().split(' ')[0]) >= 14 ? true : false;
    }
    else {
      if (this.selectedView.Age.toString().trim().split(' ').length > 1) {
        const age = this.selectedView.Age?.trim().split(' ')[0];
        IsAdult = Number(age) >= 14 ? true : false;
      }
      else {
        IsAdult = Number(this.selectedView.Age) >= 14 ? true : false;
      }
    }
    // if (IsAdult && item.IsPediatric === '1') {
    //   this.listOfSpecItems = [];
    //   this.errorMessages = [];
    //   this.errorMessages.push("Cannot select Pediatric specialisations for adults.");
    //   $("#errorAdviceMsg").modal('show');
    //   return;
    // }
    // else {
    //   this.errorMessages = [];
    //   $("#errorAdviceMsg").modal('hide');
    // }
    this.referralForm.patchValue({
      Specialization: item.id,
      SpecializationName: item.name
    });
    this.fetchSpecializationDoctorSearch();
  }

  searchDocItem(event: any) {
    const item = event.target.value;
    if (this.referralForm.get("Specialization")?.value !== 0) {
      this.listOfSpecItems = this.listOfSpecItems1;
      let arr = this.listOfSpecItems1.filter((doc: any) => doc.Fullname.toLowerCase().indexOf(item.toLowerCase()) === 0);
      if (arr.length === 0) {
        arr = this.listOfSpecItems1.filter((proc: any) => proc.EmpNo.toLowerCase().indexOf(item.toLowerCase()) === 0);
      }
      this.listOfSpecItems = arr.length ? arr : [{ name: 'No Item found' }];
    }
    else {
      if (item.length > 2) {
        this.fetchDoctors(item);
      }
    }
  }

  onDocItemSelected(event: any) {
    const empno = event?.option.value.split('-')[0];
    const item = this.listOfSpecItems.find((x:any) => x.EmpNo.trim() === empno.trim());
    this.referralForm.patchValue({
      SpecialisationDoctorName: item.EmpNo + '-' + item.Fullname,
      SpecialisationDoctorID: item.Empid
    });
    if (this.referralForm.get("Specialization")?.value === 0) {
      $("#Specialization").val(item.specialisation);
      this.referralForm.patchValue({
        Specialization: item.specialiseid,
        SpecializationName: item.specialisation
      });
    }
  }

  cosessionClick() {
    this.Cosession = !this.Cosession;
    this.referralForm.patchValue({
      Cosession: this.Cosession
    })
  }

  onSaveClick() {
    if(this.selectedView.BillType == 'Insured' && this.selectedView.CompanyID == '1838' && (this.surgeryForm.get("Remarks").value == null || this.surgeryForm.get("Remarks").value.trim() == '')) {
      this.errorMessages = [];
      this.errorMessages.push("Please enter Justification for Surgery Request.");
      $("#errorAdviceMsg").modal('show');
      return;
    }

    this.saveClickSubject.next();
  }

  saveSurgeryThenAdmission() {
    sessionStorage.setItem("templatecontent", JSON.stringify(this.consentPrint));
    this.errorMessages = [];
    //Admission Validations
    if(this.selectedView.PatientType === '1' || this.selectedView.PatientType === '3') {
      if (!this.admissionForSurgeryForm.get('AfterDays').value) {
        this.errorMessages.push("Enter After Days");
      }
      const expctedlengofstay = this.admissionForSurgeryForm.get('Expectedlengthofstay').value;
      if (expctedlengofstay === '0') {
        this.errorMessages.push("Enter Expected length of stay cannot be 0");
      }
      if (this.admissionForSurgeryForm.get('Reason').value === '') {
        this.adviceReasonForAdmSubmitted = true;
        this.errorMessages.push("Enter Reason for Admission");
      }
      this.NoofFollowUp = this.followupForm.get("NoofFollowUp").value == "0" ? "0" : this.followupForm.get("NoofFollowUp").value;
      this.NoofDays = this.followupForm.get("NoofDays").value == "" ? "0" : this.followupForm.get("NoofDays").value;
    }
    //Surgery request Validations

    if (this.surgeryTableForm.value.items.length === 0) {
      this.errorMessages.push("Add atlease one Surgery Details")
    }

    if (!this.surgeryForm.get("ProposedDate").value) {
      this.errorMessages.push("Select Proposed Date")
    }

    if (!this.surgeryForm.get("FastingTime").value) {
      this.errorMessages.push("Enter Fasting Time")
    }

    if (this.surgeryForm.get("Consent").value === false) {
      this.errorMessages.push("Please select consent taken")
    }

    var time = this.surgeryForm.get("ProposedTime").value;
    if (time.split(':')[0] === '24') {
      time = '00:' + time.split(':')[1];
    }

    let selectedSurgery: any = [];
    let primaryCount = 0;
    let surgeryID = 0;
    this.surgeryTableForm.value.items.forEach((element: any) => {
      if (element.Primary) {
        primaryCount = primaryCount + 1;
      }
      surgeryID = element.SurgeryID;
      selectedSurgery.push({
        "TDATE": moment(this.surgeryForm.get("ProposedDate").value).format('DD-MMM-YYYY')?.toString() + " " + time,
        "PID": element.SurgeryID,
        "SRB": this.doctorDetails[0].UserId,
        "RMK": "",
        "PRTY": element.Priority,
        "ISPRI": element.Primary === true ? 1 : 0,
        "SUID": element.Surgeon,
        "DID": element.Department,
        "ISPSD": "0",
        "SPID": element.SpecialiseID
      })
    });

    if (primaryCount == 0) {
      this.errorMessages.push("Please select atleast one primary Surgery");
    }
    else if (primaryCount > 1) {
      this.errorMessages.push("Only one primary Surgery should be selected");
    }

    if (this.errorMessages.length > 0) {
      $("#errorAdviceMsg").modal('show');
      return;
    }

    if (this.errorMessages.length > 0) {
      $("#errorAdviceMsg").modal('show');
      return;
    }

    let PatientSurgeriesEquList: any = [];
    this.equipmentTableForm.value.items.forEach((element: any) => {
      var item = {
        "SURGERYEQUIPMENTID": element.EquipmentID,
        "SURGERYID": surgeryID
      };
      PatientSurgeriesEquList.push(item);
    });

    let PatientSurgeriesDrugList: any = [];
    this.consumablesTableForm.value.items.forEach((element: any) => {
      var item = {
        "IMPLANTID": element.ImplantID,
        "SURGERYID": surgeryID
      };
      PatientSurgeriesDrugList.push(item);
    });

    let PatientSurgeriesBloodList: any = [];
    this.bloodTableForm.value.items.forEach((element: any) => {
      if (element.IsSelected) {
        var item = {
          "CID": element.ComponentId,
          "QTY": element.Quantity,
          "RDT": moment(this.surgeryForm.get("ProposedDate").value).format('DD-MMM-YYYY')?.toString()
        };
        PatientSurgeriesBloodList.push(item);
      }
    });

    let payload = {
      "SURGERYREQUESTID": this.SurgeryRequestid,
      "PATIENTID": this.selectedView.PatientID,
      "MONITORID": this.MonitorID,
      "IPID": this.AdmissionID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "PatientSurgeriesList": selectedSurgery,
      "PatientSurgeriesDiagList": [],
      "TentativeSurgeryPlaned": moment(this.surgeryForm.get("ProposedDate").value).format('DD-MMM-YYYY')?.toString(),
      "TENTAVTIVESTARTTIME": time,
      "PatientSurgeriesEquList": PatientSurgeriesEquList,
      "PatientSurgeriesDrugList": PatientSurgeriesDrugList,
      "ANESTHESIOLOGISTINSTRUCTIONS": this.surgeryForm.get("ANESTHESIOLOGISTINSTRUCTIONS").value,
      "OTInstructions": this.surgeryForm.get("OTInstructions").value,
      "WardsInstructions": this.surgeryForm.get("WardsInstructions").value,
      "UserID": this.doctorDetails[0].UserId,
      "ANESTHESIOLOGIST": "0",
      "IsInfected": this.IsInfected,
      "IsBloodRequired": this.IsBloodRequired,
      "Consenttaken": this.surgeryForm.get("Consent").value === true ? "1" : "0",
      "InfectionDetails": "",
      "BloodOrderBedID": this.bloodOrderBedID,
      "ClinicalDiagNosis": "",
      "PatientSurgeriesBloodList": PatientSurgeriesBloodList,
      "SpecialiseID": this.selectedView.SpecialiseID,
      "FastingTime": this.surgeryForm.get("FastingTime").value,
      "PatientSurgeryAnnotationsList": this.markedinputData,
      "BillID": this.selectedView.BillID,
      "PatientType": this.selectedView.PatientType,
      "WorkStationID": this.facility.FacilityID,
      "HospitalID": sessionStorage.getItem('hospitalId'),
      "BillType": this.selectedView.BillType == 'Insured' ? 'CR' : 'CS',
      "CompanyID": this.selectedView.CompanyID === '' || this.selectedView.CompanyID === undefined ? '0' : this.selectedView.CompanyID,
      "GradeID": this.selectedView.GradeID || this.selectedView.GradeID === undefined ? '0' : this.selectedView.GradeID,
      "IsHighRiskPatient": this.surgeryForm.get("HighRiskPatient").value ? 1 : 0,
      "Remarks": this.surgeryForm.get("Remarks").value,
    }
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.disableSave = true;
        this.config.savePatientSurgery(payload).subscribe((response: any) => {
          if (response.Status === "Success" || response.Status === "True") {
            this.disableSave = false;            
            if(this.SurgeryRequestid === 0) {
              this.raiseAnesthetiaReferralOrder();
            }
            this.surgeryIds = this.SurgeryRequestid = response.SURGERYREQUESTID;
            if (!this.consentSaved && this.selectedView.IsAdmissionRequest == '1') {
              $("#consentTemplates").modal("show");
              return;
            }
            if (this.selectedView.PatientType !== '2'&&this.selectedView.PatientType != '4') {
              this.saveAdviceForAdmissionInSurgeryTab();
            }
            else {
              this.fetchotdetails(this.surgeryIds);
            }

          }
        },
          (err) => {

          })
      }
      modalRef.close();
    });
  }
  saveAdviceForAdmissionInSurgeryTab() {
    if (this.selectedView.PatientType === '1' || this.selectedView.PatientType === '3') {
      this.errorMessages = [];
      //Admission Validations
      if (!this.admissionForSurgeryForm.get('AfterDays').value) {
        this.errorMessages.push("Enter After Days");
      }
      const expctedlengofstay = this.admissionForSurgeryForm.get('Expectedlengthofstay').value;
      if (expctedlengofstay === '0') {
        this.errorMessages.push("Enter Expected length of stay cannot be 0");
      }
      if (this.admissionForSurgeryForm.get('Reason').value === '') {
        this.adviceReasonForAdmSubmitted = true;
        this.errorMessages.push("Enter Reason for Admission");
      }
      this.NoofFollowUp = this.followupForm.get("NoofFollowUp").value == "0" ? "0" : this.followupForm.get("NoofFollowUp").value;
      this.NoofDays = this.followupForm.get("NoofDays").value == "" ? "0" : this.followupForm.get("NoofDays").value;

      //Surgery request Validations

      if (this.surgeryTableForm.value.items.length === 0) {
        this.errorMessages.push("Add atlease one Surgery Details")
      }

      if (!this.surgeryForm.get("ProposedDate").value) {
        this.errorMessages.push("Select Proposed Date")
      }

      if (!this.surgeryForm.get("FastingTime").value) {
        this.errorMessages.push("Enter Fasting Time")
      }

      if (this.surgeryForm.get("Consent").value === false) {
        this.errorMessages.push("Please select consent taken")
      }

      var time = this.surgeryForm.get("ProposedTime").value;
      if (time.split(':')[0] === '24') {
        time = '00:' + time.split(':')[1];
      }

      let selectedSurgery: any = [];
      let primaryCount = 0;
      let surgeryID = 0;
      this.surgeryTableForm.value.items.forEach((element: any) => {
        if (element.Primary) {
          primaryCount = primaryCount + 1;
        }
        surgeryID = element.SurgeryID;
        selectedSurgery.push({
          "TDATE": moment(this.surgeryForm.get("ProposedDate").value).format('DD-MMM-YYYY')?.toString() + " " + time,
          "PID": element.SurgeryID,
          "SRB": this.doctorDetails[0].UserId,
          "RMK": "",
          "PRTY": element.Priority,
          "ISPRI": element.Primary === true ? 1 : 0,
          "SUID": element.Surgeon,
          "DID": element.Department,
          "ISPSD": "0",
          "SPID": element.SpecialiseID
        })
      });

      if (primaryCount == 0) {
        this.errorMessages.push("Please select atleast one primary Surgery");
      }
      else if (primaryCount > 1) {
        this.errorMessages.push("Only one primary Surgery should be selected");
      }

      if (this.errorMessages.length > 0) {
        $("#errorAdviceMsg").modal('show');
        return;
      }

      if (this.errorMessages.length > 0) {
        $("#errorAdviceMsg").modal('show');
        return;
      }



      if (this.admissionForSurgeryForm.get('TodayAfter').value === 'A') {
        this.FollowUpOn = moment(this.admissionForSurgeryForm.get('Admission').value).format('DD-MMM-YYYY');
      }

      this.diagnosis = [];

      this.PatientDiagnosisDataList.forEach((element: any, index: any) => {
        if (element.selected) {
          this.diagnosis.push({
            "DID": element.DID,
            "DISEASENAME": element.DiseaseName,
            "CODE": element.Code,
            "DTY": element.DiagnosisType,
            "UID": this.doctorDetails[0].EmpId,
            "ISEXISTING": "1",
            "PPID": "0",
            "STATUS": element.STATUS,
            "DTID": element.DTID,
            "DIAGNOSISTYPEID": element.DIAGNOSISTYPEID,
            "ISPSD": "0",
            "REMARKS": "",
            "MNID": element.MonitorID,
            "IAD": "1"
          })
        }
      });

      let payload = {
        "intMonitorID": this.intMonitorId, //this.PatientDiagnosisDataList[0].MonitorID,
        "PatientID": this.selectedView.PatientID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "IPID": this.AdmissionID,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "PatientType": this.selectedView.PatientType,
        "BillID": this.selectedView.BillID,
        "FollowUpType": "2",
        "Advicee": this.admissionForSurgeryForm.get('adviceToPatient').value,
        "FollowAfter": this.FollowAfter,
        "FollowUpOn": moment(this.admissionForSurgeryForm.get('Admission').value).format('DD-MMM-YYYY'),//this.FollowUpOn,
        "DiagDetailsList": this.diagnosis,
        "ReasonforAdm": this.admissionForSurgeryForm.get('Reason').value,
        "RefDetailsList": this.refDetailsList,
        "LengthOfStay": this.admissionForSurgeryForm.get('Expectedlengthofstay').value ? this.admissionForSurgeryForm.get('Expectedlengthofstay').value : 0,
        "DietTypeID": this.admissionForSurgeryForm.get('DietType').value ? this.admissionForSurgeryForm.get('DietType').value : 0,
        "FollowUpRemarks": this.followupForm.get('Remarks').value,
        "PrimaryDoctorID": this.doctorDetails[0].EmpId,
        "AdmissionTypeID": this.admissionForSurgeryForm.get('AdmissionType').value ? this.admissionForSurgeryForm.get('AdmissionType').value : 0,
        "FollowUpCount": this.NoofFollowUp === '' ? '0' : this.NoofFollowUp,
        "Followupdays": this.NoofDays,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        "HospitalID": sessionStorage.getItem('hospitalId'),
        "BillType": this.selectedView.BillType == 'Insured' ? 'CR' : 'CS',
        "CompanyID": this.selectedView.CompanyID == "" ? 0 : this.selectedView.CompanyID,
        "GradeID": this.selectedView.GradeID,
        "WardID": 0,
        "PrimaryDoctorSpecialiseID": 0,
        "SurgeryRequestID": this.surgeryIds
      }

      this.config.saveAdvice(payload).subscribe((response: any) => {
        if (response.Status === "Success" || response.Status === "True") {
          this.fetchotdetails(this.surgeryIds);
        }
      },
        (err) => {

        })
    }
    else {

    }
  }

  saveAdmissionForSurgery() {
    if (this.selectedView.PatientType === '1' || this.selectedView.PatientType === '3') {
      this.errorMessages = [];
      //Admission Validations
      if (!this.admissionForSurgeryForm.get('AfterDays').value) {
        this.errorMessages.push("Enter After Days");
      }
      const expctedlengofstay = this.admissionForSurgeryForm.get('Expectedlengthofstay').value;
      if (expctedlengofstay === '0') {
        this.errorMessages.push("Enter Expected length of stay cannot be 0");
      }
      if (this.admissionForSurgeryForm.get('Reason').value === '') {
        this.adviceReasonForAdmSubmitted = true;
        this.errorMessages.push("Enter Reason for Admission");
      }
      this.NoofFollowUp = this.followupForm.get("NoofFollowUp").value == "0" ? "0" : this.followupForm.get("NoofFollowUp").value;
      this.NoofDays = this.followupForm.get("NoofDays").value == "" ? "0" : this.followupForm.get("NoofDays").value;

      //Surgery request Validations

      if (this.surgeryTableForm.value.items.length === 0) {
        this.errorMessages.push("Add atlease one Surgery Details")
      }

      if (!this.surgeryForm.get("ProposedDate").value) {
        this.errorMessages.push("Select Proposed Date")
      }

      if (!this.surgeryForm.get("FastingTime").value) {
        this.errorMessages.push("Enter Fasting Time")
      }

      if (this.surgeryForm.get("Consent").value === false) {
        this.errorMessages.push("Please select consent taken")
      }

      var time = this.surgeryForm.get("ProposedTime").value;
      if (time.split(':')[0] === '24') {
        time = '00:' + time.split(':')[1];
      }

      let selectedSurgery: any = [];
      let primaryCount = 0;
      let surgeryID = 0;
      this.surgeryTableForm.value.items.forEach((element: any) => {
        if (element.Primary) {
          primaryCount = primaryCount + 1;
        }
        surgeryID = element.SurgeryID;
        selectedSurgery.push({
          "TDATE": moment(this.surgeryForm.get("ProposedDate").value).format('DD-MMM-YYYY')?.toString() + " " + time,
          "PID": element.SurgeryID,
          "SRB": this.doctorDetails[0].UserId,
          "RMK": "",
          "PRTY": element.Priority,
          "ISPRI": element.Primary === true ? 1 : 0,
          "SUID": element.Surgeon,
          "DID": element.Department,
          "ISPSD": "0",
          "SPID": element.SpecialiseID
        })
      });

      if (primaryCount == 0) {
        this.errorMessages.push("Please select atleast one primary Surgery");
      }
      else if (primaryCount > 1) {
        this.errorMessages.push("Only one primary Surgery should be selected");
      }

      if (this.errorMessages.length > 0) {
        $("#errorAdviceMsg").modal('show');
        return;
      }

      if (this.errorMessages.length > 0) {
        $("#errorAdviceMsg").modal('show');
        return;
      }



      if (this.admissionForSurgeryForm.get('TodayAfter').value === 'A') {
        this.FollowUpOn = moment(this.admissionForSurgeryForm.get('Admission').value).format('DD-MMM-YYYY');
      }

      this.diagnosis = [];

      this.PatientDiagnosisDataList.forEach((element: any, index: any) => {
        if (element.selected) {
          this.diagnosis.push({
            "DID": element.DID,
            "DISEASENAME": element.DiseaseName,
            "CODE": element.Code,
            "DTY": element.DiagnosisType,
            "UID": this.doctorDetails[0].EmpId,
            "ISEXISTING": "1",
            "PPID": "0",
            "STATUS": element.STATUS,
            "DTID": element.DTID,
            "DIAGNOSISTYPEID": element.DIAGNOSISTYPEID,
            "ISPSD": "0",
            "REMARKS": "",
            "MNID": element.MonitorID,
            "IAD": "1"
          })
        }
      });

      let payload = {
        "intMonitorID": this.intMonitorId, //this.PatientDiagnosisDataList[0].MonitorID,
        "PatientID": this.selectedView.PatientID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "IPID": this.AdmissionID,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "PatientType": this.selectedView.PatientType,
        "BillID": this.selectedView.BillID,
        "FollowUpType": "2",
        "Advicee": this.admissionForSurgeryForm.get('adviceToPatient').value,
        "FollowAfter": this.FollowAfter,
        "FollowUpOn": moment(this.admissionForSurgeryForm.get('Admission').value).format('DD-MMM-YYYY'),//this.FollowUpOn,
        "DiagDetailsList": this.diagnosis,
        "ReasonforAdm": this.admissionForSurgeryForm.get('Reason').value,
        "RefDetailsList": this.refDetailsList,
        "LengthOfStay": this.admissionForSurgeryForm.get('Expectedlengthofstay').value ? this.admissionForSurgeryForm.get('Expectedlengthofstay').value : 0,
        "DietTypeID": this.admissionForSurgeryForm.get('DietType').value ? this.admissionForSurgeryForm.get('DietType').value : 0,
        "FollowUpRemarks": this.followupForm.get('Remarks').value,
        "PrimaryDoctorID": this.doctorDetails[0].EmpId,
        "AdmissionTypeID": this.admissionForSurgeryForm.get('AdmissionType').value ? this.admissionForSurgeryForm.get('AdmissionType').value : 0,
        "FollowUpCount": this.NoofFollowUp === '' ? '0' : this.NoofFollowUp,
        "Followupdays": this.NoofDays,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        "HospitalID": sessionStorage.getItem('hospitalId'),
        "BillType": this.selectedView.BillType == 'Insured' ? 'CR' : 'CS',
        "CompanyID": this.selectedView.CompanyID == "" ? 0 : this.selectedView.CompanyID,
        "GradeID": this.selectedView.GradeID,
        "WardID": 0,
        "PrimaryDoctorSpecialiseID": 0
      }

      const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
        backdrop: 'static'
      });
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.config.saveAdvice(payload).subscribe((response: any) => {
            if (response.Status === "Success" || response.Status === "True") {
              this.saveSurgery('schedule');
            }
          },
            (err) => {

            })
        }
        modalRef.close();
      });


    }
    else {
      const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
        backdrop: 'static'
      });
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.saveSurgery('schedule');
        }
        modalRef.close();
      });
    }
  }
  saveSurgery(type: string) {
    this.errorMessages = [];
    this.surgeryRequestSubmitted = true;
    //Surgery request Validations

    if (this.surgeryTableForm.value.items.length === 0) {
      this.errorMessages.push("Add atlease one Surgery Details")
    }

    if (!this.surgeryForm.get("ProposedDate").value) {
      this.errorMessages.push("Select Proposed Date")
    }

    if (!this.surgeryForm.get("FastingTime").value) {
      this.errorMessages.push("Enter Fasting Time")
    }

    if (this.surgeryForm.get("Consent").value === false) {
      this.errorMessages.push("Please select consent taken")
    }

    var time = this.surgeryForm.get("ProposedTime").value;
    if (time.split(':')[0] === '24') {
      time = '00:' + time.split(':')[1];
    }

    let selectedSurgery: any = [];
    let primaryCount = 0;
    let surgeryID = 0;
    this.surgeryTableForm.value.items.forEach((element: any) => {
      if (element.Primary) {
        primaryCount = primaryCount + 1;
      }
      surgeryID = element.SurgeryID;
      selectedSurgery.push({
        "TDATE": moment(this.surgeryForm.get("ProposedDate").value).format('DD-MMM-YYYY')?.toString() + " " + time,
        "PID": element.SurgeryID,
        "SRB": this.doctorDetails[0].UserId,
        "RMK": "",
        "PRTY": element.Priority,
        "ISPRI": element.Primary === true ? 1 : 0,
        "SUID": element.Surgeon,
        "DID": element.Department,
        "ISPSD": "0",
        "SPID": element.SpecialiseID
      })
    });

    if (primaryCount == 0) {
      this.errorMessages.push("Please select atleast one primary Surgery");
    }
    else if (primaryCount > 1) {
      this.errorMessages.push("Only one primary Surgery should be selected");
    }

    if (this.errorMessages.length > 0) {
      $("#errorAdviceMsg").modal('show');
      return;
    }

    let PatientSurgeriesEquList: any = [];
    this.equipmentTableForm.value.items.forEach((element: any) => {
      var item = {
        "SURGERYEQUIPMENTID": element.EquipmentID,
        "SURGERYID": surgeryID
      };
      PatientSurgeriesEquList.push(item);
    });

    let PatientSurgeriesDrugList: any = [];
    this.consumablesTableForm.value.items.forEach((element: any) => {
      var item = {
        "IMPLANTID": element.ImplantID,
        "SURGERYID": surgeryID
      };
      PatientSurgeriesDrugList.push(item);
    });

    let PatientSurgeriesBloodList: any = [];
    this.bloodTableForm.value.items.forEach((element: any) => {
      if (element.IsSelected) {
        var item = {
          "CID": element.ComponentId,
          "QTY": element.Quantity,
          "RDT": moment(this.surgeryForm.get("ProposedDate").value).format('DD-MMM-YYYY')?.toString()
        };
        PatientSurgeriesBloodList.push(item);
      }
    });

    let payload = {
      "SURGERYREQUESTID": this.SurgeryRequestid,
      "PATIENTID": this.selectedView.PatientID,
      "MONITORID": this.MonitorID,
      "IPID": this.AdmissionID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "PatientSurgeriesList": selectedSurgery,
      "PatientSurgeriesDiagList": [],
      "TentativeSurgeryPlaned": moment(this.surgeryForm.get("ProposedDate").value).format('DD-MMM-YYYY')?.toString(),
      "TENTAVTIVESTARTTIME": time,
      "PatientSurgeriesEquList": PatientSurgeriesEquList,
      "PatientSurgeriesDrugList": PatientSurgeriesDrugList,
      "ANESTHESIOLOGISTINSTRUCTIONS": this.surgeryForm.get("ANESTHESIOLOGISTINSTRUCTIONS").value,
      "OTInstructions": this.surgeryForm.get("OTInstructions").value,
      "WardsInstructions": this.surgeryForm.get("WardsInstructions").value,
      "UserID": this.doctorDetails[0].UserId,
      "ANESTHESIOLOGIST": "0",
      "IsInfected": this.IsInfected,
      "IsBloodRequired": this.IsBloodRequired,
      "Consenttaken": this.surgeryForm.get("Consent").value === true ? "1" : "0",
      "InfectionDetails": "",
      "BloodOrderBedID": this.bloodOrderBedID,
      "ClinicalDiagNosis": "",
      "PatientSurgeriesBloodList": PatientSurgeriesBloodList,
      "SpecialiseID": this.selectedView.SpecialiseID,
      "FastingTime": this.surgeryForm.get("FastingTime").value,
      "PatientSurgeryAnnotationsList": this.markedinputData,
      "BillID": this.selectedView.BillID,
      "PatientType": this.selectedView.PatientType,
      "WorkStationID": this.facility.FacilityID,
      "HospitalID": sessionStorage.getItem('hospitalId'),
      "BillType": this.selectedView.BillType == 'Insured' ? 'CR' : 'CS',
      "CompanyID": this.selectedView.CompanyID === '' || this.selectedView.CompanyID === undefined ? '0' : this.selectedView.CompanyID,
      "GradeID": this.selectedView.GradeID || this.selectedView.GradeID === undefined ? '0' : this.selectedView.GradeID,
      "IsHighRiskPatient": this.surgeryForm.get("HighRiskPatient").value ? 1 : 0
    }

    this.config.savePatientSurgery(payload).subscribe((response: any) => {
      if (response.Status === "Success" || response.Status === "True") {
        //$("#saveSurgeryMsg").modal("show");
        if (type == 'save') {
          setTimeout(() => {
            //$("#saveSurgeryMsg").modal('hide');
            this.SaveData();
          }, 1000);
        }
        if (type == 'schedule') {
          if (!this.consentSaved && this.selectedView.IsAdmissionRequest == '1') {
            this.surgeryIds = response.SURGERYREQUESTID;
            $("#consentTemplates").modal("show");
            return;
          }
          this.fetchotdetails(response.SURGERYREQUESTID);
        }
      }
    },
      (err) => {

      })

  }

  openPrenatalForm(val: string) {
    this.obgyneFormType = val;
    sessionStorage.removeItem("templatecontent");
    this.activeAssessmentTab = val;
    this.selectedView.BMI = this.smartDataList && this.smartDataList[0]?.BMI;
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
  }
  openPrenatalForm1(val: string) {
    this.obgyneFormType1 = val;
    this.activeAssessmentTab1 = val;
    this.selectedView.BMI = this.smartDataList && this.smartDataList[0]?.BMI;
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
  }
  showHideAsmntsFormsTabs() {
    this.showHideFormTabs = !this.showHideFormTabs;
  }

  BackToAdvice() {
    this.obgyneFormType = '';
  }

  DischargeObgPrint() {
    switch (this.activeAssessmentTab) {
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
      case 'summary':
        if (this.patientDischargeSummaryRef) {
          this.patientDischargeSummaryRef.DischargeSummaryPrint();
        }
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

  findHtmlTagIds(template: any, requiredFields?: any): any {
    this.errorMessages = [];
    const tempDiv = this.renderer.createElement('div');
    this.renderer.setProperty(tempDiv, 'innerHTML', template.contentDiv.nativeElement.innerHTML);
    this.traverseElements(tempDiv, requiredFields);
    this.renderer.removeChild(this.el.nativeElement, tempDiv);
    if (this.errorMessages.length > 0) {
      const options: NgbModalOptions = {
        windowClass: 'error_mandatoryFields_modal'
      };
      const modalRef = this.modalSvc.open(ErrorMessageComponent, options);
      modalRef.componentInstance.errorMessages = this.errorMessages;
      modalRef.componentInstance.dataChanged.subscribe((data: string) => {
        modalRef.close();
      });
      return false;
    }
    else {
      return true;
    }
  }

  private traverseElements(element: HTMLElement, requiredFields?: any) {
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      const id = (child.getAttribute('id') ?? '') as string;
      if (id) {
        let value = '';
        const targetElement = document.getElementById(id);
        if (targetElement) {
          if (targetElement instanceof HTMLDivElement) {
            const selectedButton = child.querySelector('.selected');
            if (selectedButton) {
              value = selectedButton.textContent?.trim() ?? '';
            }
            else {
              const isActive = child.classList.contains('active');
              value = isActive ? 'true' : 'false';
            }
          }
          else if (targetElement instanceof HTMLInputElement) {
            value = targetElement.value;
          } else if (targetElement instanceof HTMLTextAreaElement) {
            value = targetElement.value;
          } else if (targetElement instanceof HTMLSelectElement) {
            value = targetElement.value;
          }
          else if (targetElement instanceof HTMLButtonElement) {
            value = targetElement.classList.contains('active') ? 'true' : 'false';
          } else {
            value = targetElement.innerText;
          }

          if (targetElement.classList.contains('ButtonScore')) {
            const imgElement = targetElement.querySelector('.imgpain') as HTMLImageElement;
            const pElement = targetElement.querySelector('.textpain') as HTMLParagraphElement;
            const divElement = targetElement.querySelector('.scorepain') as HTMLDivElement;
  
            const imgValue = imgElement ? imgElement.src : '';
            const pValue = pElement ? pElement.textContent?.trim() : '';
            const divValue = divElement ? divElement.textContent?.trim() : '';
  
            value = `${imgValue}$${pValue}$${divValue}`;
          }
        }
        if (requiredFields != undefined) {
          const requiredField = requiredFields.find((rf: any) => rf.id === id);
          if (requiredField && requiredField.required && !value) {
            this.errorMessages.push(requiredField);
          }
        }
      }
      if (child.children.length > 0) {
        this.traverseElements(child as HTMLElement, requiredFields);
      }
    }
  }

  onSaveAssessmentClick() {
    this.saveAssesmentClickSubject.next()
  }

  isSaveDisabled() {
    if (this.activeAssessmentTab === 'medicalconsent' && this.medicalComponent) {
      return this.medicalComponent.saveDisable();
    } else if (this.activeAssessmentTab === 'HighRiskOperation' && this.hroComponent) {
      return this.hroComponent.saveDisable();
    } else if (this.activeAssessmentTab === 'generalconsent' && this.genConsComponent) {
      return this.genConsComponent.saveDisable();
    }
    return false;
  }

  saveAssessment() {
    switch (this.activeAssessmentTab) {

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
      case 'summary':
        if (this.patientDischargeSummaryRef) {
          this.patientDischargeSummaryRef.saveDischargeSummary();
        }
        break;
      case 'generalconsent':
        if (this.genConsComponent) {
          let saveCall = true;
          if(this.genConsComponent.requiredFields?.length > 0) {
            saveCall = this.findHtmlTagIds(this.genConsComponent as any, this.genConsComponent.requiredFields);
          }
          if (saveCall) {
            this.genConsComponent.saveGeneralConsentForm();
          }
        }
        break;
      case 'HighRiskOperation':
        if (this.hroComponent) {
          let saveCall = true;
          if(this.hroComponent.requiredFields?.length > 0) {
            saveCall = this.findHtmlTagIds(this.hroComponent as any, this.hroComponent.requiredFields);
          }
          if (saveCall) {
            this.hroComponent.SaveConsentHro();
          }
        }
        break;
      case 'medicalconsent':
        if (this.medicalComponent) {
          let saveCall = true;
          if(this.medicalComponent.requiredFields?.length > 0) {
            saveCall = this.findHtmlTagIds(this.medicalComponent as any, this.medicalComponent.requiredFields);
          }
          if (saveCall) {
            this.medicalComponent.SaveConsentMedical();
          }
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
      case 'multidisciplanary':
      if (this.multidisciplanary) {
        this.multidisciplanary.save();
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
  saveAssessment1() {
    switch (this.activeAssessmentTab1) {

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
      case 'summary':
        if (this.patientDischargeSummaryRef) {
          this.patientDischargeSummaryRef.saveDischargeSummary();
        }
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
      case 'multidisciplanary':
      if (this.multidisciplanary) {
        this.multidisciplanary.save();
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
      case 'summary':
        if (this.patientDischargeSummaryRef) {
          this.patientDischargeSummaryRef.clearR3Signature();
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
      case 'multidisciplanary':
      if (this.multidisciplanary) {
        this.multidisciplanary.clear();
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
  ClearAssessment1() {
    switch (this.activeAssessmentTab1) {
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
      case 'summary':
        if (this.patientDischargeSummaryRef) {
          this.patientDischargeSummaryRef.clearR3Signature();
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
      case 'multidisciplanary':
      if (this.multidisciplanary) {
        this.multidisciplanary.clear();
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

  assignTemplateScreenNamesValues() {
    this.templateArray = [
      {
        id: 16,
        name: 'cardiology',
        screenname: this.langData?.medical?.cardiology_assessment
      },
      {
        id: 17,
        name: 'preanesthesia',
        screenname: this.langData?.medical?.anesthesia_assessment
      },
      {
        id: 111,
        name: 'pulmonology',
        screenname: 'Pulmonology'
      },
      {
        id: 1,
        name: 'pulmonology-diseases',
        screenname: 'Pulmonology Diseases'
      },
      {
        id: 112,
        name: 'gynecology',
        screenname: 'Discharge Gynecology'
      },
      {
        id: 50,
        name: 'HighRiskOperation',
        screenname: 'Consent for High Risk Operation'
      },
      {
        id: 60,
        name: 'generalconsent',
        screenname: 'General Consent'
      },
      {
        id: 76,
        name: 'medicalconsent',
        screenname: 'Medical Informed Consent'
      },
      {
        id: 2,
        name: 'medicalassessment',
        screenname: 'Medical Assessment'
      },
      {
        id: 6,
        name: 'medicalobsteric',
        screenname: 'Medical Assessment Obstetric'
      },
      {
        id: 7,
        name: 'medicalpedia',
        screenname: 'Medical Assessment Pedia'
      },
      {
        id: 8,
        name: 'medicalsurgical',
        screenname: 'Medical Assessment Surgical'
      },
      {
        id: 31,
        name: 'multidisciplanary',
        screenname: 'Multidisciplanary Patient Family Education Form'
      },
    ]
  }
  FetchMapClinicalTemplateSpecializations() {
    this.us.get(`FetchMapClinicalTemplateSpecializations?SpecialiseID=${this.doctorDetails[0].EmpSpecialisationId}&WorkStationID=3441&HospitalID=${this.hospId}`).subscribe((response: any) => {
      if (response.Code === 200) {
        this.savedSpecialisationAssessmentsList = response.FetchMapClinicalTempSpecDataList;
        this.savedSpecialisationConsentsList = response.FetchMapClinicalTempSpecDataList.filter((x: any) => x.ClinicalTemplateName.toString().toLowerCase().includes('consent'));
        const navcomp = sessionStorage.getItem("navigation");
        if (navcomp && navcomp === 'MedicalAssessment') {
          setTimeout(() => {
            const element = document.querySelector('[data-bs-target="#medicalassessment"]');
            (element as any)?.click();
          }, 1000);
          sessionStorage.removeItem("navigation");
        }
        this.savedSpecialisationAssessmentsList.forEach((element: any) => {
          const templ = this.templateArray.find((x: any) => x.id === Number(element.ClinicalTemplateID));
          if (templ) {
            element.name = templ.name;
            element.screenname = templ.screenname;
          }
        })
      }
    }, () => {

    });
  }

  showAssessment(configId: number) {
    const configExist = this.savedSpecialisationAssessmentsList.find((x: any) => x.ClinicalTemplateID.toString() === configId.toString());
    if (configExist) {
      return true;
    }
    else {
      return false;
    }
  }

  getdatabstarget(id: string) {
    const templateid = Number(id);
    if (templateid === 16)
      return "#pills-cardiology";
    else if (templateid === 17)
      return "#pills-pre-anesthesia";
    else if (templateid === 111)
      return "#pills-pulmonology";
    else if (templateid === 1)
      return "#pills-pulmonology-diseases";
    else if (templateid === 112)
      return "#pills-discharge";
    else if (templateid === 16)
      return "#cardiology";
    else if (templateid === 50)
      return "#consent-hro";
    else if (templateid === 60)
      return "#generalConsent";
    else if (templateid === 76)
      return "#medicalConsent";
    else if (templateid === 2)
      return "#medicalassessment";
    else if (templateid === 6)
      return "#medicalobsteric";
    else if (templateid === 7)
      return "#medicalpedia";
    else if (templateid === 8)
      return "#medicalsurgical";
    else if (templateid === 304)
      return "#multidisciplanary";
    else
      return "";
  }

  getdatabstarget1(id: string) {
    const templateid = Number(id);
    if (templateid === 16)
      return "#pills-cardiology1";
    else if (templateid === 17)
      return "#pills-pre-anesthesia1";
    else if (templateid === 111)
      return "#pills-pulmonology1";
    else if (templateid === 1)
      return "#pills-pulmonology-diseases1";
    else if (templateid === 112)
      return "#pills-discharge1";
    else if (templateid === 16)
      return "#cardiology1";
    else if (templateid === 50)
      return "#consent-hro1";
    else if (templateid === 60)
      return "#generalConsent1";
    else if (templateid === 76)
      return "#medicalConsent1";
    else if (templateid === 2)
      return "#medicalassessment1";
    else if (templateid === 6)
      return "#medicalobsteric1";
    else if (templateid === 7)
      return "#medicalpedia1";
    else if (templateid === 8)
      return "#medicalsurgical1";
    else if (templateid === 304)
      return "#multidisciplanary";
    else
      return "";
  }

  toggleBloodRequired() {
    this.IsBloodRequired = this.IsBloodRequired === 0 ? 1 : 0;
  }

  toggleInfected() {
    this.IsInfected = this.IsInfected === 0 ? 1 : 0;
  }

  raiseAnesthetiaReferralOrder() {
    var diagnosis: any[] = [];

    this.PatientDiagnosisDataList.forEach((element: any, index: any) => {
      if (element.selected) {
        diagnosis.push({
          "DID": element.DID,
          "DISEASENAME": element.DiseaseName,
          "CODE": element.Code,
          "DTY": element.DiagnosisType,
          "UID": this.doctorDetails[0].EmpId,
          "ISEXISTING": "1",
          "PPID": "0",
          "STATUS": element.STATUS,
          "DTID": element.DTID,
          "DIAGNOSISTYPEID": element.DIAGNOSISTYPEID,
          "ISPSD": "0",
          "REMARKS": "",
          "MNID": element.MonitorID,
          "IAD": "1"
        })
      }
    });
    var referralList: any[] = [];
    referralList.push({
      "RTID": 1,
      "SPID": 5,
      "PRTY": 1,
      "DID": "",
      "RMKS": "Referral to ANAESTHESIA for surgery",
      "BKD": 0,
      "RRMKS": "Referral to ANAESTHESIA for surgery",
      "RID": 1,
      "DRN": "1",
      "IIRF": 1,
      "COSS": 1,
      "RHOSPID": this.hospId,
      "REFERRALORDERID": 0
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
      "Advicee": "Referral to ANAESTHESIA for surgery",
      "FollowAfter": 0,
      "FollowUpOn": moment(new Date()).format('DD-MMM-YYYY'),
      "DiagDetailsList": diagnosis,
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
        //$("#saveAdviceMsg").modal("show");
      }
    },
      () => {

      })
  }

  cancelSurgeryRequest() {
    $("#cancelSurgeryRequestConfirmationPopup").modal("show");    
  }

  confirmCancelSurReq() {
    var params = {
      "SurgeryRequestID": this.SurgeryRequestid,    
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalId": this.hospId,
      }
      this.us.post(advice.UpdateSurgeryRequestPAC, params)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          $("#cancelSurReqSuccess").modal("show");
          this.surgeryForm.reset();
          this.surgeryTableForm.reset();
        }
      },
      (err) => {

      })
  }

  saveReferralConfirmation(type: number) {
    this.referralType = type;
    $("#swPhyDietConfirmationPopup").modal("show");
  }

  cancelReferral() {
    this.referralType = 0;
    $("#swPhyDietConfirmationPopup").modal("hide");
  }

  openRemarks() {
    this.remarkForm.patchValue({
      remarks: ''
    });
    $("#swPhyDietConfirmationPopup").modal("hide");
    $("#referRemarks").modal("show");
  }

  closeRemarks() {
    this.referralType = 0;
    $("#referRemarks").modal("hide");
  }

  saveReferral() {
    var diagnosis: any[] = [];
    $("#referRemarks").modal("hide");
    let remarks = this.remarkForm.get('remarks').value ? this.remarkForm.get('remarks').value : '';
    this.PatientDiagnosisDataList.forEach((element: any) => {
      if (element.selected) {
        diagnosis.push({
          "DID": element.DID,
          "DISEASENAME": element.DiseaseName,
          "CODE": element.Code,
          "DTY": element.DiagnosisType,
          "UID": this.doctorDetails[0].EmpId,
          "ISEXISTING": "1",
          "PPID": "0",
          "STATUS": element.STATUS,
          "DTID": element.DTID,
          "DIAGNOSISTYPEID": element.DIAGNOSISTYPEID,
          "ISPSD": "0",
          "REMARKS": "",
          "MNID": element.MonitorID,
          "IAD": "1"
        })
      }
    });
    //var referralList: any[] = [];
    this.referralList.forEach((element: any, index: any) => {
      this.refDetailsList.push({
        "RTID": element.Reason,
        "SPID": element.Specialization,
        "PRTY": element.Priority,
        "DID": element.SpecialisationDoctorID,
        "RMKS": element.Remarks,
        "BKD": element.BKD,
        "RRMKS": "0",
        "RID": element.Reason,
        "DRN": 1,//element.Duration,
        "IIRF": element.Type,
        "COSS": element.Cosession === true ? 1 : 0,
        "RHOSPID": element.Location,
        "REFERRALORDERID": element.REFERRALORDERID
      })
    });
    this.refDetailsList.push({
      "RTID": 1,
      "SPID": this.referralType === 1 ? 317 : this.referralType === 2 ? 101 : this.referralType === 2 ? 264 : 0,
      "PRTY": 1,
      "DID": "",
      "RMKS": remarks,
      "BKD": 0,
      "RRMKS": remarks,
      "RID": 1,
      "DRN": "1",
      "IIRF": 1,
      "COSS": 1,
      "RHOSPID": this.hospId,
      "REFERRALORDERID": 0
    });
    let payload = {
      "intMonitorID": this.intMonitorId, //this.PatientDiagnosisDataList[0].MonitorID,
      "PatientID": this.selectedView.PatientID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "IPID": this.AdmissionID,
      "SpecialiseID": this.selectedView.SpecialiseID,
      "PatientType": this.selectedView.PatientType,
      "BillID": this.selectedView.BillID,
      "FollowUpType": this.FollowUpType,
      "Advicee": this.FollowUpType === 1 ? this.followupForm.get('adviceToPatient').value : this.admissionForm.get('adviceToPatient').value,
      "FollowAfter": this.FollowAfter,
      "FollowUpOn": this.FollowUpOn,
      "DiagDetailsList": this.diagnosis,
      "ReasonforAdm": this.admissionForm.get('Reason').value,
      "RefDetailsList": this.refDetailsList,
      "LengthOfStay": this.admissionForm.get('Expectedlengthofstay').value ? this.admissionForm.get('Expectedlengthofstay').value : 0,
      "DietTypeID": this.admissionForm.get('DietType').value ? this.admissionForm.get('DietType').value : 0,
      "FollowUpRemarks": this.followupForm.get('Remarks').value,
      "PrimaryDoctorID": this.doctorDetails[0].EmpId,
      "AdmissionTypeID": this.admissionForm.get('AdmissionType').value ? this.admissionForm.get('AdmissionType').value : 0,
      "FollowUpCount": this.NoofFollowUp === '' ? '0' : this.NoofFollowUp,
      "Followupdays": this.NoofDays,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": sessionStorage.getItem('hospitalId'),
      "BillType": this.selectedView.BillType == 'Insured' ? 'CR' : 'CS',
      "CompanyID": this.selectedView.CompanyID == "" ? 0 : this.selectedView.CompanyID,
      "GradeID": this.selectedView.GradeID,
      "WardID": 0,
      "PrimaryDoctorSpecialiseID": 0
    }

    const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.config.saveAdviceReferral(payload).subscribe((response: any) => {
          if (response.Status === "Success" || response.Status === "True") {
            $("#saveAdviceMsg").modal("show");
            this.referralType = 0;
            this.refDetailsList = [];
          }
        },
          () => {

          })
      }
      if(!data.success) {
        this.referralType = 0;
        this.refDetailsList = [];
      }
      modalRef.close();
      });
  }
}

export const advice = {
  UpdateSurgeryRequestPAC:'UpdateSurgeryRequestPAC',
}