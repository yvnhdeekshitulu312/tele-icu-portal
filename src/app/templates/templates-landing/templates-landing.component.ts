import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AgainstMedicalAdviceComponent } from '../against-medical-advice/against-medical-advice.component';
import { CodeBlueDocumentationComponent } from '../code-blue-documentation/code-blue-documentation.component';
import { PsychoSocialComponent } from '../psycho-social/psycho-social.component';
import { ReferralSocialServiceComponent } from '../referral-social-service/referral-social-service.component';
import { BabiesDataComponent } from '../babies-data/babies-data.component';
import { BreastFeedingSheetComponent } from '../breast-feeding-sheet/breast-feeding-sheet.component';
import { InfantFeedingSheetComponent } from '../infant-feeding-sheet/infant-feeding-sheet.component';
import { CriticalCareTransferComponent } from '../critical-care-transfer/critical-care-transfer.component';
import { DnrFormComponent } from '../dnr-form/dnr-form.component';
import { PatientOutpassFormComponent } from '../patient-outpass-form/patient-outpass-form.component';
import { BabyReceivedComponent } from '../baby-received/baby-received.component';
import { DischargeInstructionsNurseryComponent } from '../discharge-instructions-nursery/discharge-instructions-nursery.component';
import { NeonatalExaminationComponent } from '../neonatal-examination/neonatal-examination.component';
import { InvasiveProcedureSafetyChecklistComponent } from '../invasive-procedure-safety-checklist/invasive-procedure-safety-checklist.component';
import { AdultVentilatorBundleComponent } from '../adult-ventilator-bundle/adult-ventilator-bundle.component';
import { ComplicationsSideeffectsOfEpiduralanaesthesiaComponent } from '../complications-sideeffects-of-epiduralanaesthesia/complications-sideeffects-of-epiduralanaesthesia.component';
import { ComprehensivePlanOfCareComponent } from '../comprehensive-plan-of-care/comprehensive-plan-of-care.component';
import { CriesPainScaleComponent } from '../cries-pain-scale/cries-pain-scale.component';
import { EpiduralRecordComponent } from '../epidural-record/epidural-record.component';
import { MdroBundleInfectionComponent } from '../mdro-bundle-infection/mdro-bundle-infection.component';
import { MultidisciplanaryPatientFamilyEducationFormComponent } from '../multidisciplanary-patient-family-education-form/multidisciplanary-patient-family-education-form.component';
import { NeonatalIntensiveCareUnitComponent } from '../neonatal-intensive-care-unit/neonatal-intensive-care-unit.component';
import { PreAnestheticEvalutionRecordComponent } from '../pre-anesthetic-evalution-record/pre-anesthetic-evalution-record.component';
import { SkinCareBundleComponent } from '../skin-care-bundle/skin-care-bundle.component';
import { TransferChecklistComponent } from '../transfer-checklist/transfer-checklist.component';
import { DischargeInstCbahiPfrPostDischComponent } from '../discharge-inst-cbahi-pfr-post-disch/discharge-inst-cbahi-pfr-post-disch.component';
import { PreCardiacCatheterizationChecklistComponent } from '../pre-cardiac-catheterization-checklist/pre-cardiac-catheterization-checklist.component';
import { NursingAdmissionAssessmentPediaPicuComponent } from '../nursing-admission-assessment-pedia-picu/nursing-admission-assessment-pedia-picu.component';
import { RestraintsMonitoringSheetComponent } from '../restraints-monitoring-sheet/restraints-monitoring-sheet.component';
import { NursingAdmissionAssessmentLdObgyneComponent } from '../nursing-admission-assessment-ld-obgyne/nursing-admission-assessment-ld-obgyne.component';
import { ClinicalpathNormalNewbornComponent } from '../clinicalpath-normal-newborn/clinicalpath-normal-newborn.component';
import { BreastfeedingObservationJobonaidComponent } from '../breastfeeding-observation-jobonaid/breastfeeding-observation-jobonaid.component';
import { InfectionControlBundleformComponent } from '../infection-control-bundleform/infection-control-bundleform.component';
import { CriticalCareMonitoringSheetComponent } from '../critical-care-monitoring-sheet/critical-care-monitoring-sheet.component';
import { InstrumentSuturesCountChecklistComponent } from '../instrument-sutures-count-checklist/instrument-sutures-count-checklist.component';
import { PreOperativeChecklistComponent } from '../pre-operative-checklist/pre-operative-checklist.component';
import { MetabolicScreeningTestConsentComponent } from '../metabolic-screening-test-consent/metabolic-screening-test-consent.component';
import { AckExistenceMedMonitoringCamerasFormComponent } from '../ack-existence-med-monitoring-cameras-form/ack-existence-med-monitoring-cameras-form.component';
import { CentralLineBundleComponent } from '../central-line-bundle/central-line-bundle.component';
import { ElectronicOperativeNoteComponent } from '../electronic-operative-note/electronic-operative-note.component';
import { NewAdmissionIcuFormComponent } from '../new-admission-icu-form/new-admission-icu-form.component';
import { NurseNoteComponent } from '../nurse-note/nurse-note.component';
import { AnesthesiaConsciousComponent } from '../anesthesia-conscious/anesthesia-conscious.component';
import { CriticalCareUnitComponent } from '../critical-care-unit/critical-care-unit.component';
import { ElectronicRespiratoryComponent } from '../electronic-respiratory/electronic-respiratory.component';
import { AdultNutritionAssessmentComponent } from '../adult-nutrition-assessment/adult-nutrition-assessment.component';
import { EstimatedBloodLossComponent } from '../estimated-blood-loss/estimated-blood-loss.component';
import { FallsVisualTriageFormComponent } from '../falls-visual-triage-form/falls-visual-triage-form.component';
import { GeneralconsentComponent } from 'src/app/portal/generalconsent/generalconsent.component';
import { HandOverFormComponent } from '../hand-over-form/hand-over-form.component';
import { MaternalHistoryComponent } from '../maternal-history/maternal-history.component';
import { MedicalConsentFormComponent } from '../medical-consent-form/medical-consent-form.component';
import { MedicalRecordsDocumentsChecklistComponent } from '../medical-records-documents-checklist/medical-records-documents-checklist.component';
import { NewbornPageComponent } from '../newborn-page/newborn-page.component';
import { NursingDuschargeSummaryComponent } from '../nursing-duscharge-summary/nursing-duscharge-summary.component';
import { NursingFeedingChartComponent } from '../nursing-feeding-chart/nursing-feeding-chart.component';
import { OfficeOfMedicalAffairsComponent } from '../office-of-medical-affairs/office-of-medical-affairs.component';
import { AdmissionDischargeDocumentChecklistComponent } from '../admission-discharge-document-checklist/admission-discharge-document-checklist.component';
import { BloodBloodComponentTranfusionComponent } from '../blood-blood-component-tranfusion/blood-blood-component-tranfusion.component';
import { InitialMedicalAssessmentPatientsComponent } from '../initial-medical-assessment-patients/initial-medical-assessment-patients.component';
import { MedicalInformedConsentLaserTreatmentComponent } from '../medical-informed-consent-laser-treatment/medical-informed-consent-laser-treatment.component';
import { OperationTheatreMinorSurgeryComponent } from '../operation-theatre-minor-surgery/operation-theatre-minor-surgery.component';
import { OrSurgicalSafetyChecklistPhase4Component } from '../or-surgical-safety-checklist-phase4/or-surgical-safety-checklist-phase4.component';
import { PatientConsentCardiacCatherizationComponent } from '../patient-consent-cardiac-catherization/patient-consent-cardiac-catherization.component';
import { PaymentGuaranteeComponent } from '../payment-guarantee/payment-guarantee.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { PediatricNutritionAssessmentComponent } from '../pediatric-nutrition-assessment/pediatric-nutrition-assessment.component';
import { PhysiotheraphyComprehensiveFunctionalAssessmentComponent } from '../physiotheraphy-comprehensive-functional-assessment/physiotheraphy-comprehensive-functional-assessment.component';
import { PostConsciousSedationComponent } from '../post-conscious-sedation/post-conscious-sedation.component';
import { PreOperativeCardiologyAssessmentComponent } from '../pre-operative-cardiology-assessment/pre-operative-cardiology-assessment.component';
import { PricesOfRoomsComponent } from '../prices-of-rooms/prices-of-rooms.component';
import { ScreeningFormForMRIComponent } from '../screening-form-for-mri/screening-form-for-mri.component';
import { HemodialysisUnitHemodialysisComponent } from '../hemodialysis-unit-hemodialysis/hemodialysis-unit-hemodialysis.component';
import { RadiologyDepartmentInformedConsentComponent } from '../radiology-department-informed-consent/radiology-department-informed-consent.component';
import { NursingKardexComponent } from '../nursing-kardex/nursing-kardex.component';
import { AKUSafteyChecklistComponent } from '../aku-saftey-checklist/aku-saftey-checklist.component';
import { AnesthesiaRecordDuringOperationComponent } from '../anesthesia-record-during-operation/anesthesia-record-during-operation.component';
import { CathlabSurgicalSafetyChecklistComponent } from '../cathlab-surgical-safety-checklist/cathlab-surgical-safety-checklist.component';
import { CriteriaAndMedicalConditionsComponent } from '../criteria-and-medical-conditions/criteria-and-medical-conditions.component';
import { UrinaryCatheterCareComponent } from '../urinary-catheter-care/urinary-catheter-care.component';
import { PatientIDDataAuthenticationFormComponent } from '../patient-id-data-authentication-form/patient-id-data-authentication-form.component';
import { RespiratoryTriageChecklistComponent } from '../respiratory-triage-checklist/respiratory-triage-checklist.component';
import { ObstetricsRecordComponent } from '../obstetrics-record/obstetrics-record.component';
import { OperationTheatreMajorSurgeryComponent } from '../operation-theatre-major-surgery/operation-theatre-major-surgery.component';
import { FollowupReassessmentComponent } from '../followup-reassessment/followup-reassessment.component';
import { NeonatalIntensiveCareunitNursingComponent } from '../neonatal-intensive-careunit-nursing/neonatal-intensive-careunit-nursing.component';
import { NicuCriticalMonitoringSheetComponent } from '../nicu-critical-monitoring-sheet/nicu-critical-monitoring-sheet.component';
import { NursingChecklistComponent } from '../nursing-checklist/nursing-checklist.component';
import { TemplateService } from 'src/app/shared/template.service';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';

import { multipleSaveEnabledTemplates, noRestrictionTemplates } from '../template.utils';
import { NursingAdmissionAssessmentAdultSurgicalComponent } from '../nursing-admission-assessment-adult-surgical/nursing-admission-assessment-adult-surgical.component';
import { ComprehensiveDentalHealthAsmntformComponent } from '../comprehensive-dental-health-asmntform/comprehensive-dental-health-asmntform.component';
import { InfectionPreventionControlDepartmentComponent } from '../infection-prevention-control-department/infection-prevention-control-department.component';
import { ConsentHroComponent } from 'src/app/portal/consent-hro/consent-hro.component';
import { ConsentMedicalComponent } from 'src/app/portal/consent-medical/consent-medical.component';
import { RespiratoryAssessmentComponent } from '../respiratory-assessment/respiratory-assessment.component';
import { RespiratoryTherapyComponent } from '../respiratory-therapy/respiratory-therapy.component';
import { RecoveryRoomRecordComponent } from '../recovery-room-record/recovery-room-record.component';
import { FallsRiskAssessmentAndPreventionFormComponent } from '../falls-risk-assessment-and-prevention-form/falls-risk-assessment-and-prevention-form.component';
import { BeforeTransferringPatientComponent } from '../before-transferring-patient/before-transferring-patient.component';
import { PediatricIntensiveCareUnitComponent } from '../pediatric-intensive-care-unit/pediatric-intensive-care-unit.component';
import { AdmixtureServicesComponent } from '../admixture-services/admixture-services.component';
import { PsychologyAssessmentComponent } from '../psychology-assessment/psychology-assessment.component';
import { DentalTreatmentConsentComponent } from '../dental-treatment-consent/dental-treatment-consent.component';
import { IronInjectionAckComponent } from '../iron-injection-ack/iron-injection-ack.component';
import { filter } from 'rxjs';
import { DeliveryNotesComponent } from '../delivery-notes/delivery-notes.component';
import { HemoDialysisGraftComponent } from '../hemo-dialysis-graft/hemo-dialysis-graft.component';
import { HemoDialysisCatheterComponent } from '../hemo-dialysis-catheter/hemo-dialysis-catheter.component';
import { ReloadtemplateService } from 'src/app/shared/reloadtemplate.service';
import { OtPatientCasesheetComponent } from 'src/app/ot/ot-patient-casesheet/ot-patient-casesheet.component';
import moment from 'moment';
import { RadiologyDepartmentInformedConsentDuringPregnancyComponent } from '../radiology-department-informed-consent-during-pregnancy/radiology-department-informed-consent-during-pregnancy.component';
import { PremammographyQuestionnaireComponent } from '../premammography-questionnaire/premammography-questionnaire.component';
import { RadiologySafetyChecklistComponent } from '../radiology-safety-checklist/radiology-safety-checklist.component';
import { HistopathologyRequestFormComponent } from '../histopathology-request-form/histopathology-request-form.component';
import { MedicalPhotographyConsentComponent } from '../medical-photography-consent/medical-photography-consent.component';
import { TherapeuticPhlebotomyFormComponent } from '../therapeutic-phlebotomy-form/therapeutic-phlebotomy-form.component';
import { ProcedureNoteDocumentationComponent } from '../procedure-note-documentation/procedure-note-documentation.component';
declare var $: any;

@Component({
  selector: 'app-templates-landing',
  templateUrl: './templates-landing.component.html',
  styleUrls: ['./templates-landing.component.scss']
})
export class TemplatesLandingComponent implements OnInit {
  @Input() data: any;
  @Input() fromshared = false;
  @Input() patientDetailsFromOP: any;
  isPrinting: boolean = false;
  @Input() admissionID = 0;
  canEdit: boolean = true;

  readonly = false;
  templatesList: any = [];
  templateID: any = 0;
  showTemplate = false;
  patinfo: any;
  searchText: string = '';
  filteredTemplates: any[] = [];
  showSections = false;
  IsHome: any;
  IsHeadNurse: any;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  FetchPatienClinicalTemplateDetailsNList1: any = [];
  PatientTemplatedetailID = 0;
  doctorDetails: any;
  showSave = true;
  url = '';
  isEdit = false;
  selectedView: any;
  childSsn = '';
  SelectedViewClass: any;
  fromCathLab: boolean = false;
  fromRadiologyWorklist: boolean = false;
  hospitalId: any;
  @Output() dataChanged = new EventEmitter<boolean>();
  IsOPPatient = false;
  fromPhysiotherapy = false;
  eformRestriction = 0;

  @ViewChild('ama', { static: false }) ama: AgainstMedicalAdviceComponent | undefined;
  @ViewChild('cbd', { static: false }) cbd: CodeBlueDocumentationComponent | undefined;
  @ViewChild('psa', { static: false }) psa: PsychoSocialComponent | undefined;
  @ViewChild('rss', { static: false }) rss: ReferralSocialServiceComponent | undefined;
  @ViewChild('bdc', { static: false }) bdc: BabiesDataComponent | undefined;
  @ViewChild('bfs', { static: false }) bfs: BreastFeedingSheetComponent | undefined;
  @ViewChild('ifs', { static: false }) ifs: InfantFeedingSheetComponent | undefined;
  @ViewChild('cct', { static: false }) cct: CriticalCareTransferComponent | undefined;
  @ViewChild('dnr', { static: false }) dnr: DnrFormComponent | undefined;
  @ViewChild('pof', { static: false }) pof: PatientOutpassFormComponent | undefined;
  @ViewChild('brv', { static: false }) brv: BabyReceivedComponent | undefined;
  @ViewChild('din', { static: false }) din: DischargeInstructionsNurseryComponent | undefined;
  @ViewChild('nne', { static: false }) nne: NeonatalExaminationComponent | undefined;
  @ViewChild('ips', { static: false }) ips: InvasiveProcedureSafetyChecklistComponent | undefined;
  @ViewChild('avb', { static: false }) avb: AdultVentilatorBundleComponent | undefined;
  @ViewChild('csoe', { static: false }) csoe: ComplicationsSideeffectsOfEpiduralanaesthesiaComponent | undefined;
  @ViewChild('cpc', { static: false }) cpc: ComprehensivePlanOfCareComponent | undefined;
  @ViewChild('cps', { static: false }) cps: CriesPainScaleComponent | undefined;
  @ViewChild('epr', { static: false }) epr: EpiduralRecordComponent | undefined;
  @ViewChild('mbc', { static: false }) mbc: MdroBundleInfectionComponent | undefined;
  @ViewChild('mpfef', { static: false }) mpfef: MultidisciplanaryPatientFamilyEducationFormComponent | undefined;
  @ViewChild('nicu', { static: false }) nicu: NeonatalIntensiveCareUnitComponent | undefined;
  @ViewChild('paer', { static: false }) paer: PreAnestheticEvalutionRecordComponent | undefined;
  @ViewChild('scb', { static: false }) scb: SkinCareBundleComponent | undefined;
  @ViewChild('tcouo', { static: false }) tcouo: TransferChecklistComponent | undefined;
  @ViewChild('dinst', { static: false }) dinst: DischargeInstCbahiPfrPostDischComponent | undefined;
  @ViewChild('pccc', { static: false }) pccc: PreCardiacCatheterizationChecklistComponent | undefined;
  @ViewChild('naapp', { static: false }) naapp: NursingAdmissionAssessmentPediaPicuComponent | undefined;
  @ViewChild('rms', { static: false }) rms: RestraintsMonitoringSheetComponent | undefined;
  @ViewChild('naalo', { static: false }) naalo: NursingAdmissionAssessmentLdObgyneComponent | undefined;
  @ViewChild('naaas', { static: false }) naaas: NursingAdmissionAssessmentAdultSurgicalComponent | undefined;
  @ViewChild('cpnn', { static: false }) cpnn: ClinicalpathNormalNewbornComponent | undefined;
  @ViewChild('bfoj', { static: false }) bfoj: BreastfeedingObservationJobonaidComponent | undefined;
  @ViewChild('icbf', { static: false }) icbf: InfectionControlBundleformComponent | undefined;
  @ViewChild('ccms', { static: false }) ccms: CriticalCareMonitoringSheetComponent | undefined;
  @ViewChild('iscc', { static: false }) iscc: InstrumentSuturesCountChecklistComponent | undefined;
  @ViewChild('poc', { static: false }) poc: PreOperativeChecklistComponent | undefined;
  @ViewChild('mstc', { static: false }) mstc: MetabolicScreeningTestConsentComponent | undefined;
  @ViewChild('aemmcf', { static: false }) aemmcf: AckExistenceMedMonitoringCamerasFormComponent | undefined;
  @ViewChild('clb', { static: false }) clb: CentralLineBundleComponent | undefined;
  @ViewChild('cho', { static: false }) cho: ConsentHroComponent | undefined;
  @ViewChild('eon', { static: false }) eon: ElectronicOperativeNoteComponent | undefined;
  @ViewChild('naif', { static: false }) naif: NewAdmissionIcuFormComponent | undefined;
  @ViewChild('nuno', { static: false }) nuno: NurseNoteComponent | undefined;
  @ViewChild('act', { static: false }) act: AnesthesiaConsciousComponent | undefined;
  @ViewChild('ccu', { static: false }) ccu: CriticalCareUnitComponent | undefined;
  @ViewChild('erf', { static: false }) erf: ElectronicRespiratoryComponent | undefined;
  @ViewChild('ana', { static: false }) ana: AdultNutritionAssessmentComponent | undefined; @ViewChild('ebl', { static: false }) ebl: EstimatedBloodLossComponent | undefined;
  @ViewChild('fvtf', { static: false }) fvtf: FallsVisualTriageFormComponent | undefined;
  @ViewChild('gnct', { static: false }) gnct: GeneralconsentComponent | undefined;
  @ViewChild('hof', { static: false }) hof: HandOverFormComponent | undefined;
  @ViewChild('mths', { static: false }) mths: MaternalHistoryComponent | undefined;
  @ViewChild('mcf', { static: false }) mcf: MedicalConsentFormComponent | undefined;
  @ViewChild('mrdc', { static: false }) mrdc: MedicalRecordsDocumentsChecklistComponent | undefined;
  @ViewChild('nbp', { static: false }) nbp: NewbornPageComponent | undefined;
  @ViewChild('nds', { static: false }) nds: NursingDuschargeSummaryComponent | undefined;
  @ViewChild('nfc', { static: false }) nfc: NursingFeedingChartComponent | undefined;
  @ViewChild('ooma', { static: false }) ooma: OfficeOfMedicalAffairsComponent | undefined;
  @ViewChild('addc', { static: false }) addc: AdmissionDischargeDocumentChecklistComponent | undefined;
  @ViewChild('bbct', { static: false }) bbct: BloodBloodComponentTranfusionComponent | undefined;
  @ViewChild('imap', { static: false }) imap: InitialMedicalAssessmentPatientsComponent | undefined;
  @ViewChild('miclt', { static: false }) miclt: MedicalInformedConsentLaserTreatmentComponent | undefined;
  @ViewChild('mic', { static: false }) mic: ConsentMedicalComponent | undefined;
  @ViewChild('otms', { static: false }) otms: OperationTheatreMinorSurgeryComponent | undefined;
  @ViewChild('osscp', { static: false }) osscp: OrSurgicalSafetyChecklistPhase4Component | undefined;
  @ViewChild('ptccc', { static: false }) ptccc: PatientConsentCardiacCatherizationComponent | undefined;
  @ViewChild('pyge', { static: false }) pyge: PaymentGuaranteeComponent | undefined;
  @ViewChild('pnsra', { static: false }) pnsra: PediatricNutritionAssessmentComponent | undefined;
  @ViewChild('pcfa', { static: false }) pcfa: PhysiotheraphyComprehensiveFunctionalAssessmentComponent | undefined;
  @ViewChild('pcsi', { static: false }) pcsi: PostConsciousSedationComponent | undefined;
  @ViewChild('poca', { static: false }) poca: PreOperativeCardiologyAssessmentComponent | undefined;
  @ViewChild('pors', { static: false }) pors: PricesOfRoomsComponent | undefined;
  @ViewChild('sffm', { static: false }) sffm: ScreeningFormForMRIComponent | undefined;
  @ViewChild('huhr', { static: false }) huhr: HemodialysisUnitHemodialysisComponent | undefined;
  @ViewChild('rdic', { static: false }) rdic: RadiologyDepartmentInformedConsentComponent | undefined;
  @ViewChild('nkx', { static: false }) nkx: NursingKardexComponent | undefined;
  @ViewChild('asct', { static: false }) asct: AKUSafteyChecklistComponent | undefined;
  @ViewChild('ardo', { static: false }) ardo: AnesthesiaRecordDuringOperationComponent | undefined;
  @ViewChild('cssc', { static: false }) cssc: CathlabSurgicalSafetyChecklistComponent | undefined;
  @ViewChild('cmcrp', { static: false }) cmcrp: CriteriaAndMedicalConditionsComponent | undefined;
  @ViewChild('ucc', { static: false }) ucc: UrinaryCatheterCareComponent | undefined;
  @ViewChild('pidaf', { static: false }) pidaf: PatientIDDataAuthenticationFormComponent | undefined;
  @ViewChild('rtc', { static: false }) rtc: RespiratoryTriageChecklistComponent | undefined;
  @ViewChild('obrc', { static: false }) obrc: ObstetricsRecordComponent | undefined;
  @ViewChild('otmjs', { static: false }) otmjs: OperationTheatreMajorSurgeryComponent | undefined;
  @ViewChild('flrs', { static: false }) flrs: FollowupReassessmentComponent | undefined;
  @ViewChild('nicun', { static: false }) nicun: NeonatalIntensiveCareunitNursingComponent | undefined;
  @ViewChild('ncms', { static: false }) ncms: NicuCriticalMonitoringSheetComponent | undefined;
  @ViewChild('nuct', { static: false }) nuct: NursingChecklistComponent | undefined;
  @ViewChild('cdha', { static: false }) cdha: ComprehensiveDentalHealthAsmntformComponent | undefined;
  @ViewChild('ipcd', { static: false }) ipcd: InfectionPreventionControlDepartmentComponent | undefined;
  @ViewChild('respa', { static: false }) respa: RespiratoryAssessmentComponent | undefined;
  @ViewChild('resty', { static: false }) resty: RespiratoryTherapyComponent | undefined;
  @ViewChild('recrr', { static: false }) recrr: RecoveryRoomRecordComponent | undefined;
  @ViewChild('fraapf', { static: false }) fraapf: FallsRiskAssessmentAndPreventionFormComponent | undefined;
  @ViewChild('btprcu', { static: false }) btprcu: BeforeTransferringPatientComponent | undefined;
  @ViewChild('picu', { static: false }) picu: PediatricIntensiveCareUnitComponent | undefined;
  @ViewChild('axss', { static: false }) axss: AdmixtureServicesComponent | undefined;
  @ViewChild('paf', { static: false }) paf: PsychologyAssessmentComponent | undefined;
  @ViewChild('dtcf', { static: false }) dtcf: DentalTreatmentConsentComponent | undefined;
  @ViewChild('paaii', { static: false }) paaii: IronInjectionAckComponent | undefined;
  @ViewChild('dns', { static: false }) dns: DeliveryNotesComponent | undefined;
  @ViewChild('hbfg', { static: false }) hbfg: HemoDialysisGraftComponent | undefined;
  @ViewChild('hbfc', { static: false }) hbfc: HemoDialysisCatheterComponent | undefined;
  @ViewChild('ossc', { static: false }) ossc: OtPatientCasesheetComponent | undefined;
  @ViewChild('icrdp', { static: false }) icrdp: RadiologyDepartmentInformedConsentDuringPregnancyComponent | undefined;
  @ViewChild('pmq', { static: false }) pmq: PremammographyQuestionnaireComponent | undefined;
  @ViewChild('rsc', { static: false }) rsc: RadiologySafetyChecklistComponent | undefined;
  @ViewChild('hrf', { static: false }) hrf: HistopathologyRequestFormComponent | undefined;
  @ViewChild('mpcc', { static: false }) mpcc: MedicalPhotographyConsentComponent | undefined;
  @ViewChild('tpfc', { static: false }) tpfc: TherapeuticPhlebotomyFormComponent | undefined;
  @ViewChild('pnd', { static: false }) pnd: ProcedureNoteDocumentationComponent | undefined;
  @ViewChild('fraapfe', { static: false }) fraapfe: FallsRiskAssessmentAndPreventionFormComponent | undefined;

  @ViewChild('headercontent') headercontent!: ElementRef;
  langData: any;
  patientDetails: any;
  isdetailShow = false;
  showComponent = true;
  currentdate: any;
  location: any;
  endofEpisode: boolean = false;

  constructor(private router: Router, private us: UtilityService, private service: MedicalAssessmentService,
    private temService: TemplateService, private con: ConfigService, private bedconfig: BedConfig, private templateService: TemplateService, private reloadService: ReloadtemplateService) {
    // this.templatesList.push({ 'Id': 2, 'Name': 'Initial Medical Assessment Of Patients (medical)', templatename: 'IMAP' });
    this.templatesList.push({ 'Id': 4, 'Name': 'OR Surgical Safety Checklist', templatename: 'ossc' });
    this.templatesList.push({ 'Id': 9, 'Name': 'Against Medical Advice (AMA)', templatename: 'ama' });
    this.templatesList.push({ 'Id': 10, 'Name': 'Code Blue Documentation', templatename: 'cbd' });
    this.templatesList.push({ 'Id': 11, 'Name': 'Psycho-Social Assessment', templatename: 'psa' });
    this.templatesList.push({ 'Id': 12, 'Name': 'Referral to Social Services', templatename: 'rss' });
    this.templatesList.push({ 'Id': 13, 'Name': 'Babies DATA copy', templatename: 'bdc' });
    this.templatesList.push({ 'Id': 14, 'Name': 'Breast Feeding Monitoring Sheet', templatename: 'bfs' });
    this.templatesList.push({ 'Id': 15, 'Name': 'Infant Feeding / Rooming In Refusal Form', templatename: 'ifs' });
    this.templatesList.push({ 'Id': 18, 'Name': 'Critical Care Transfer Checklist And Plan Order Sheet', templatename: 'cct' });
    this.templatesList.push({ 'Id': 19, 'Name': 'Do Not Resuscitate (DNR) Order Form', templatename: 'dnr' });
    this.templatesList.push({ 'Id': 20, 'Name': 'Patient Outpass Form', templatename: 'pof' });
    this.templatesList.push({ 'Id': 21, 'Name': 'Baby Received', templatename: 'brv' });
    this.templatesList.push({ 'Id': 22, 'Name': 'Discharge instructions nursery / NICU', templatename: 'din' });
    this.templatesList.push({ 'Id': 23, 'Name': 'Neonatal Examination', templatename: 'nne' });
    this.templatesList.push({ 'Id': 24, 'Name': 'Invasive Procedure Safety Checklist', templatename: 'ips' });
    this.templatesList.push({ 'Id': 25, 'Name': 'Ventilator Bundle Audit Tool', templatename: 'avb' });
    this.templatesList.push({ 'Id': 26, 'Name': 'Complications and Side Effects of Epidural Anaesthesia', templatename: 'csoe' });
    this.templatesList.push({ 'Id': 27, 'Name': 'Comprehensive Plan Of Care', templatename: 'cpc' });
    this.templatesList.push({ 'Id': 28, 'Name': 'CRIES Pain Scale', templatename: 'cps' });
    this.templatesList.push({ 'Id': 29, 'Name': 'Epidural Record Maternal & Child Team', templatename: 'epr' });
    this.templatesList.push({ 'Id': 30, 'Name': 'MDRO Bundle Infection Control Surveillance Form', templatename: 'mbc' });
    this.templatesList.push({ 'Id': 31, 'Name': 'Multidisciplinary Patient Family Education Form', templatename: 'mpfef' });
    // this.templatesList.push({ 'Id': 32, 'Name': 'Baby Received (NICU)', templatename: 'nicu' });
    this.templatesList.push({ 'Id': 33, 'Name': 'Pre-Anesthetic Evaluation', templatename: 'paer' });
    this.templatesList.push({ 'Id': 34, 'Name': 'SSKIN Care Bundle', templatename: 'scb' });
    this.templatesList.push({ 'Id': 35, 'Name': 'Transfer Checklist From One Unit To Another', templatename: 'tcouo' });
    this.templatesList.push({ 'Id': 36, 'Name': 'Discharge Instructions', templatename: 'dinst' });
    this.templatesList.push({ 'Id': 37, 'Name': 'Pre-Cardiac Catheterization Checklist', templatename: 'pccc' });
    this.templatesList.push({ 'Id': 38, 'Name': 'Nursing Admission Assessment Form (Pedia and PICU Patients)', templatename: 'naapp' });
    this.templatesList.push({ 'Id': 39, 'Name': 'Restraints Monitoring Sheet', templatename: 'rms' });
    this.templatesList.push({ 'Id': 40, 'Name': 'Nursing Admission Assessment Form (Adult Medical and Surgical Patients)', templatename: 'naaas' });
    this.templatesList.push({ 'Id': 41, 'Name': 'Nursing Admission Assessment Form (OB-Gyne and L&D Patients)', templatename: 'naalo' });
    this.templatesList.push({ 'Id': 42, 'Name': 'Clinical Path For Normal Newborn', templatename: 'cpnn' });
    this.templatesList.push({ 'Id': 43, 'Name': 'Breastfeeding Observation Job On Aid', templatename: 'bfoj' });
    this.templatesList.push({ 'Id': 44, 'Name': 'Infection Prevention & Control Program Surgical Site Infection Bundle Infection Control Surveillance Form', templatename: 'icbf' });
    this.templatesList.push({ 'Id': 45, 'Name': 'Critical Care Monitoring Sheet', templatename: 'ccms' });
    this.templatesList.push({ 'Id': 46, 'Name': 'Labour and Delivery Unit Instrument, Sutures Count Sheets And Placement Checklist', templatename: 'iscc' });
    this.templatesList.push({ 'Id': 3, 'Name': 'Pre-Operative Checklist', templatename: 'poc' });
    this.templatesList.push({ 'Id': 47, 'Name': 'Metabolic Screen Test Consent', templatename: 'mstc' });
    this.templatesList.push({ 'Id': 48, 'Name': 'Acknowledgment of the existence of medical monitoring cameras', templatename: 'aemmcf' });
    this.templatesList.push({ 'Id': 49, 'Name': 'Infection Prevention & Control Program Central Line Bundle (CVC) Infection Control Surveillance Form', templatename: 'clb' });
    this.templatesList.push({ 'Id': 50, 'Name': 'Consent for High Risk Operation', templatename: 'cho' });
    this.templatesList.push({ 'Id': 51, 'Name': 'Electronic Operative Note', templatename: 'eon' });
    this.templatesList.push({ 'Id': 52, 'Name': 'New Admission In ICU', templatename: 'naif' });
    this.templatesList.push({ 'Id': 53, 'Name': 'Nurse Note', templatename: 'nuno' });
    this.templatesList.push({ 'Id': 54, 'Name': 'Anesthesia Conscious Sedation Consent Form', templatename: 'act' });
    this.templatesList.push({ 'Id': 55, 'Name': 'Critical Care Unit Code Status', templatename: 'ccu' });
    // this.templatesList.push({ 'Id': 56, 'Name': 'Electronic Respiratory', templatename: 'erf' });
    this.templatesList.push({ 'Id': 57, 'Name': 'Adult Nutrition Assessment', templatename: 'ana' }); this.templatesList.push({ 'Id': 58, 'Name': 'Estimated Blood Loss', templatename: 'ebl' });
    this.templatesList.push({ 'Id': 59, 'Name': 'Falls Visual Triage Form', templatename: 'fvtf' });
    this.templatesList.push({ 'Id': 60, 'Name': 'General Consent', templatename: 'gnct' });
    this.templatesList.push({ 'Id': 61, 'Name': 'Hand-Over Form', templatename: 'hof' });
    this.templatesList.push({ 'Id': 63, 'Name': 'Maternal History Form', templatename: 'mths' });
    // this.templatesList.push({ 'Id': 64, 'Name': 'Medical Consent Form', templatename: 'mcf' });
    this.templatesList.push({ 'Id': 65, 'Name': 'Medical Records Documents Checklist', templatename: 'mrdc' });
    this.templatesList.push({ 'Id': 66, 'Name': 'Newborn Examination Form', templatename: 'nbp' });
    // this.templatesList.push({ 'Id': 67, 'Name': 'Nursing Discharge Summary', templatename: 'nds' });
    // this.templatesList.push({ 'Id': 68, 'Name': 'Nurse Feeding Chart', templatename: 'nfc' });
    // this.templatesList.push({ 'Id': 69, 'Name': 'Office Of The Medical Affairs / مكتب الشؤون الطبية', templatename: 'ooma' });
    // this.templatesList.push({ 'Id': 72, 'Name': 'Nursing Department Admission & Discharge Document Checklist', templatename: 'addc' });
    this.templatesList.push({ 'Id': 73, 'Name': 'Blood & Blood Component Transfusion Consent / اقرار بالموافقه علي نقل الدم ومشتقاته', templatename: 'bbct' });
    // this.templatesList.push({ 'Id': 74, 'Name': 'Initial Medical Assessment of Patients', templatename: 'imap' });
    this.templatesList.push({ 'Id': 75, 'Name': 'Medical Informed Consent For Laser Treatment', templatename: 'miclt' });
    this.templatesList.push({ 'Id': 76, 'Name': 'Medical Informed Consent', templatename: 'mic' });
    this.templatesList.push({ 'Id': 77, 'Name': 'Operation Theater Medium And Minor Surgery Form', templatename: 'otms' });
    this.templatesList.push({ 'Id': 78, 'Name': 'OR Surgical Safety Checklist-Recovery Room Phase IV', templatename: 'osscp' });
    this.templatesList.push({ 'Id': 79, 'Name': 'Patient Consent for Cardiac Catheterization', templatename: 'ptccc' });
    this.templatesList.push({ 'Id': 80, 'Name': 'Payment Guarantee / تعهد بالسداد', templatename: 'pyge' });
    this.templatesList.push({ 'Id': 81, 'Name': 'Pediatric Nutrition Assessment / Reassessment', templatename: 'pnsra' });
    this.templatesList.push({ 'Id': 83, 'Name': 'PHYSIOTHERAPY COMPREHENSIVE FUNCTIONAL ASSESSMENT/RE-ASSESSMENT FORM', templatename: 'pcfa' });
    this.templatesList.push({ 'Id': 84, 'Name': 'Post Conscious Sedation Instructions For Adult Patient', templatename: 'pcsi' });
    this.templatesList.push({ 'Id': 85, 'Name': 'Pre-Operative Cardiology Assessment and Management Plan', templatename: 'poca' });
    // this.templatesList.push({ 'Id': 86, 'Name': 'Prices of Rooms & Suits', templatename: 'pors' });
    this.templatesList.push({ 'Id': 87, 'Name': 'Screening Form For MRI Examination', templatename: 'sffm' });
    this.templatesList.push({ 'Id': 92, 'Name': 'Hemodialysis Unit Run Sheet', templatename: 'huhr' });
    this.templatesList.push({ 'Id': 93, 'Name': 'Informed Consent Form For IV Contrast Examination', templatename: 'rdic' });
    // this.templatesList.push({ 'Id': 94, 'Name': 'Nursing Kardex', templatename: 'nkx' });
    this.templatesList.push({ 'Id': 88, 'Name': 'AKU Safety Checklist', templatename: 'asct' });
    this.templatesList.push({ 'Id': 89, 'Name': 'Anesthesia Record During Operation/Procedure', templatename: 'ardo' });
    this.templatesList.push({ 'Id': 90, 'Name': 'Cathlab Surgical Safety Checklist', templatename: 'cssc' });
    // this.templatesList.push({ 'Id': 91, 'Name': 'Criteria and Medical Conditions Requiring Preoperative Evaluation Before Surgery', templatename: 'cmcrp' });
    this.templatesList.push({ 'Id': 96, 'Name': 'Bundle: Urinary Catheter Care', templatename: 'ucc' });
    this.templatesList.push({ 'Id': 98, 'Name': 'Patient ID Data Authentication Form', templatename: 'pidaf' });
    this.templatesList.push({ 'Id': 99, 'Name': 'Respiratory Triage Checklist Accident and Emergency (AED)', templatename: 'rtc' });
    this.templatesList.push({ 'Id': 103, 'Name': 'Obstetric Record', templatename: 'obrc' });
    this.templatesList.push({ 'Id': 104, 'Name': 'Operation Theatre Major Surgery Form #1: Instrument And Sponge Count', templatename: 'otmjs' });
    // this.templatesList.push({ 'Id': 101, 'Name': 'Follow-up & Re-assessment', templatename: 'flrs' });
    this.templatesList.push({ 'Id': 107, 'Name': 'Neonatal Intensive Care Unit Nursing Assessment Checklist', templatename: 'nicun' });
    this.templatesList.push({ 'Id': 108, 'Name': 'Neonatal Intensive Care Unit Critical Monitoring Sheet', templatename: 'ncms' });
    this.templatesList.push({ 'Id': 110, 'Name': 'Nursing Checklist', templatename: 'nuct' });
    this.templatesList.push({ 'Id': 114, 'Name': 'Comprehensive Dental Health Assessment Form', templatename: 'cdha' });
    this.templatesList.push({ 'Id': 115, 'Name': 'Infection Prevention and Control Department', templatename: 'ipcd' });
    this.templatesList.push({ 'Id': 113, 'Name': 'Majour counting Sheet', templatename: 'mcs' });
    this.templatesList.push({ 'Id': 116, 'Name': 'Respiratory Re-Assessment', templatename: 'respa' });
    this.templatesList.push({ 'Id': 117, 'Name': 'Respiratory Therapy Initial', templatename: 'resty' });
    this.templatesList.push({ 'Id': 118, 'Name': 'Recovery Room Record', templatename: 'recrr' });
    this.templatesList.push({ 'Id': 119, 'Name': 'FALLS RISK ASSESSMENT AND PREVENTION FORM (Physiotherapy)', templatename: 'fraapf' });
    this.templatesList.push({ 'Id': 120, 'Name': 'Before Transferring Patient From Recovery Room To The Concerned Units', templatename: 'btprcu' });
    this.templatesList.push({ 'Id': 121, 'Name': 'Pediatric Intensive Care Unit', templatename: 'picu' });
    this.templatesList.push({ 'Id': 122, 'Name': 'IV ADMIXTURE SERVICES', templatename: 'axss' });
    this.templatesList.push({ 'Id': 124, 'Name': 'Psychology Assessment Form', templatename: 'paf' });
    this.templatesList.push({ 'Id': 125, 'Name': 'Dental Treatment Consent Form', templatename: 'dtcf' });
    this.templatesList.push({ 'Id': 126, 'Name': 'Patient Acknowledgment of the Adverse Effects of Iron Injection', templatename: 'paaii' });
    this.templatesList.push({ 'Id': 127, 'Name': 'Delivery Notes', templatename: 'dns' });
    this.templatesList.push({ 'Id': 128, 'Name': 'HEMODIALYSIS BUNDLE FORM FOR FISTULA/GRAFT', templatename: 'hbfg' });
    this.templatesList.push({ 'Id': 129, 'Name': 'HEMODIALYSIS BUNDLE FORM FOR CATHETER', templatename: 'hbfc' });
    this.templatesList.push({ 'Id': 134, 'Name': 'Informed Consent for Radiology Examination During Pregnancy', templatename: 'icrdp' });
    this.templatesList.push({ 'Id': 135, 'Name': 'Pre-Mammography Questionnaire', templatename: 'pmq' });
    this.templatesList.push({ 'Id': 136, 'Name': 'Radiology Safety Checklist', templatename: 'rsc' });
    this.templatesList.push({ 'Id': 137, 'Name': 'Histopathology Request Form', templatename: 'hrf' });
    this.templatesList.push({ 'Id': 138, 'Name': 'Medical Photography Consent Form', templatename: 'mpcc' });
    this.templatesList.push({ 'Id': 139, 'Name': 'Therapeutic Phlebotomy Form', templatename: 'tpfc' });
    this.templatesList.push({ 'Id': 141, 'Name': 'Procedure Note Documentation', templatename: 'pnd' });
    this.templatesList.push({ 'Id': 142, 'Name': 'FALLS RISK ASSESSMENT AND PREVENTION FORM (Endoscopy)', templatename: 'fraapfe' });

    this.filteredTemplates = this.templatesList.sort((a: any, b: any) => a.Name > b.Name ? 1 : -1);
    this.langData = this.con.getLangData();
  }

  ngOnInit(): void {
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY H:mm');
    this.location = sessionStorage.getItem("locationName");
    this.reloadService.reload$.subscribe(() => {
      this.reloadTemplate();
    });

    this.fromPhysiotherapy = sessionStorage.getItem("fromPhysiotherapy") === "true" ? true : false;
    if (this.patientDetailsFromOP) {
      this.patientDetails = this.patientDetailsFromOP;
      this.IsOPPatient = true;
    }
    else {
      this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    }

    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.eformRestriction = this.doctorDetails[0]?.EformRestriction;
    this.fromCathLab = sessionStorage.getItem("fromCathLab") === "true" ? true : false;
    this.fromRadiologyWorklist = sessionStorage.getItem("fromRadiologyWorklist") === "true" ? true : false;
    const emergencyValue = sessionStorage.getItem("FromEMR");
    this.hospitalId = sessionStorage.getItem("hospitalId");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    if(this.patientDetails?.PatientType === '1') {
      if (sessionStorage.getItem("ISEpisodeclose") === "true") {
        this.endofEpisode = true;
      } else {
        this.endofEpisode = false;
      }
    }

    const selectedTemplateId = sessionStorage.getItem("selectedTemplateId");

    if (selectedTemplateId) {
      this.open(Number(selectedTemplateId));
      sessionStorage.removeItem('selectedTemplateId');
    }

    if (this.data) {
      this.readonly = this.data.readonly;

      if (this.data.fromshared) {
        this.admissionID = this.data.admissionID;
        this.isEdit = this.data.isEdit;
        this.temService.sendMessage(true);
      }
      this.templateID = Number(this.data.data.ClinicalTemplateID);
      sessionStorage.setItem('currentTemplateId', this.templateID);
      setTimeout(() => {
        const tempname = this.templatesList.find((x: any) => x.Id === this.templateID).templatename;
        const template = (this as any)[tempname];
        if (template) {
          this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: this.templateID, AdmissionID: this.admissionID, PatientTemplatedetailID: 0, TBL: 1 });
          this.us.get(this.url)
            .subscribe((response: any) => {
              if (response.Code == 200) {
                if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
                  this.FetchPatienClinicalTemplateDetailsNList = this.FetchPatienClinicalTemplateDetailsNList1 = response.FetchPatienClinicalTemplateDetailsNList;
                  const selectedItem = this.FetchPatienClinicalTemplateDetailsNList.find((item: any) => item.PatientTemplatedetailID === this.data.data.PatientTemplatedetailID);
                  template.admissionIDFromShared = this.admissionID;
                  template.selectedView = this.data.selectedView;
                  this.selectedView = this.data.selectedView;
                  if (this.selectedView.PatientType == "2") {
                    if (this.selectedView?.Bed.includes('ISO'))
                      this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
                    else
                      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
                  } else {
                    this.SelectedViewClass = "m-0 fw-bold alert_animate token";
                  }
                  template.selectedTemplate(selectedItem);
                }
              }
            },
              (err) => {
              })
        }
      }, 1000);
    }

    if (!this.admissionID) {
      const selectedId = sessionStorage.getItem("selectedPatientAdmissionId");
      if (selectedId) {
        this.admissionID = Number(selectedId);
      }
    }

    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(() => {
      this.templateService.setCanEditStatus(true);
    });

    this.templateService.canEdit$.subscribe(status => {
      this.canEdit = status;
    });
  }

  filterTemplates(event: any) {
    this.filteredTemplates = this.templatesList.filter((template: any) =>
      template.Name.toLowerCase().includes(event.target.value.toLowerCase().trim())
    );
  }

  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  open(Id: any) {
    if (this.templateID !== Id) {
      this.templateService.setCanEditStatus(true);
    }

    this.templateID = Id;
    sessionStorage.setItem('currentTemplateId', this.templateID);
    this.showSave = true;
  }


  save() {
    switch (this.templateID) {
      case 9:
        this.ama?.save();
        break;
      case 4:
        this.ossc?.save();
        break;
      case 10:
        this.cbd?.save();
        break;
      case 11:
        this.psa?.save();
        break;
      case 12:
        this.rss?.save();
        break;
      case 13:
        this.bdc?.save();
        break;
      case 14:
        this.bfs?.save();
        break;
      case 15:
        this.ifs?.save();
        break;
      case 18:
        this.cct?.save();
        break;
      case 19:
        this.dnr?.save();
        break;
      case 20:
        this.pof?.save();
        break;
      case 21:
        this.brv?.save();
        break;
      case 22:
        this.din?.save();
        break;
      case 23:
        this.nne?.save();
        break;
      case 24:
        this.ips?.save();
        break;
      case 25:
        this.avb?.save();
        break;
      case 26:
        this.csoe?.save();
        break;
      case 27:
        this.cpc?.save();
        break;
      case 28:
        this.cps?.save();
        break;
      case 29:
        this.epr?.save();
        break;
      case 30:
        this.mbc?.save();
        break;
      case 31:
        this.mpfef?.save();
        break;
      case 32:
        this.nicu?.save();
        break;
      case 33:
        this.paer?.save();
        break;
      case 34:
        this.scb?.save();
        break;
      case 35:
        this.tcouo?.save();
        break;
      case 36:
        this.dinst?.save();
        break;
      case 37:
        this.pccc?.save();
        break;
      case 38:
        this.naapp?.save();
        break;
      case 39:
        this.rms?.save();
        break;
      case 40:
        this.naaas?.save();
        break;
      case 41:
        this.naalo?.save();
        break;
      case 42:
        this.cpnn?.save();
        break;
      case 43:
        this.bfoj?.save();
        break;
      case 44:
        this.icbf?.save();
        break;
      case 45:
        this.ccms?.save();
        break;
      case 46:
        this.iscc?.save();
        break;
      case 3:
        this.poc?.save();
        break;
      case 47:
        this.mstc?.save();
        break;
      case 48:
        this.aemmcf?.save();
        break;
      case 49:
        this.clb?.save();
        break;
      case 50:
        this.cho?.SaveConsentHro();
        break;
      case 51:
        this.eon?.save();
        break;
      case 52:
        this.naif?.save();
        break;
      case 53:
        this.nuno?.save();
        break;
      case 54:
        this.act?.save();
        break;
      case 55:
        this.ccu?.save();
        break;
      case 56:
        this.erf?.save();
        break;
      case 57:
        this.ana?.save();
        break;
      case 58:
        this.ebl?.save();
        break;
      case 59:
        this.fvtf?.save();
        break;
      case 60:
        this.gnct?.saveGeneralConsentForm();
        break;
      case 61:
        this.hof?.save();
        break;
      case 63:
        this.mths?.save();
        break;
      case 64:
        this.mcf?.save();
        break;
      case 65:
        this.mrdc?.save();
        break;
      case 66:
        this.nbp?.save();
        break;
      case 67:
        this.nds?.save();
        break;
      case 68:
        this.nfc?.save();
        break;
      case 69:
        this.ooma?.save();
        break;
      case 72:
        this.addc?.save();
        break;
      case 73:
        this.bbct?.save();
        break;
      case 74:
        this.imap?.save();
        break;
      case 75:
        this.miclt?.save();
        break;
      case 76:
        this.mic?.SaveConsentMedical();
        break;
      case 77:
        this.otms?.save();
        break;
      case 78:
        this.osscp?.save();
        break;
      case 79:
        this.ptccc?.save();
        break;
      case 80:
        this.pyge?.save();
        break;
      case 81:
        this.pnsra?.save();
        break;
      case 83:
        this.pcfa?.save();
        break;
      case 84:
        this.pcsi?.save();
        break;
      case 85:
        this.poca?.save();
        break;
      case 86:
        this.pors?.save();
        break;
      case 87:
        this.sffm?.save();
        break;
      case 92:
        this.huhr?.save();
        break;
      case 93:
        this.rdic?.save();
        break;
      case 94:
        this.nkx?.save();
        break;
      case 88:
        this.asct?.save();
        break;
      case 89:
        this.ardo?.save();
        break;
      case 90:
        this.cssc?.save();
        break;
      case 91:
        this.cmcrp?.save();
        break;
      case 96:
        this.ucc?.save();
        break;
      case 98:
        this.pidaf?.save();
        break;
      case 99:
        this.rtc?.save();
        break;
      case 103:
        this.obrc?.save();
        break;
      case 104:
        this.otmjs?.save();
        break;
      case 101:
        this.flrs?.save();
        break;
      case 107:
        this.nicun?.save();
        break;
      case 108:
        this.ncms?.save();
        break;
      case 110:
        this.nuct?.save();
        break;
      case 114:
        this.cdha?.save();
        break;
      case 115:
        this.ipcd?.save();
        break;
      case 116:
        this.respa?.save();
        break;
      case 117:
        this.resty?.save();
        break;
      case 118:
        this.recrr?.save()
        break;
      case 119:
        this.fraapf?.save()
        break;
      case 120:
        this.btprcu?.save();
        break;
      case 121:
        this.picu?.save();
        break;
      case 122:
        this.axss?.save();
        break;
      case 124:
        this.paf?.save();
        break;
      case 125:
        this.dtcf?.save();
        break;
      case 126:
        this.paaii?.save();
        break;
      case 127:
        this.dns?.save();
        break;
      case 128:
        this.hbfg?.save();
        break;
      case 129:
        this.hbfc?.save();
        break;
      case 134:
        this.icrdp?.save();
        break;
      case 135:
        this.pmq?.save();
        break;
      case 136:
        this.rsc?.save();
        break;
      case 137:
        this.hrf?.save();
        break;
      case 138:
        this.mpcc?.save();
      break;
      case 141:
        this.pnd?.save();
      break;
      case 142:
        this.fraapfe?.save()
        break;
      default:
        break;
    }
  }

  // print() {
  //   if (this.templateID) {
  //     const template = this.templatesList.find((item: any) => item.Id === this.templateID);
  //     if (template && (this as any)[template.templatename]?.templatePrint) {
  //       this.isPrinting = true;

  //       (this as any)[template.templatename]?.templatePrint(template.Name, this.headercontent.nativeElement);

  //       setTimeout(() => {
  //         this.isPrinting = false;
  //       }, 500);
  //     }
  //   }
  // }

  print() {
    const headerImage = 'assets/images/header.jpeg';
    const footerImage = 'assets/images/footer.jpeg';

    // Remove any existing headers and footers
    const existingHeader = document.getElementById('dynamic-header');
    const existingFooter = document.getElementById('dynamic-footer');

    if (existingHeader) {
      existingHeader.remove();
    }
    if (existingFooter) {
      existingFooter.remove();
    }

    // Set a timeout to wait for the elements to be added before triggering print
    setTimeout(() => {
      const template = this.templatesList.find((item: any) => item.Id === this.templateID);
      document.title = `${template.Name ?? 'eform'}_${new Date().toISOString()}`;
      window.print();  // Trigger print dialog

    }, 500);
  }

  clear() {
    this.templateService.setCanEditStatus(true);
    switch (this.templateID) {
      case 9:
        this.ama?.clear();
        break;
      case 4:
        this.ossc?.clear();
        break;
      case 10:
        this.cbd?.clear();
        break;
      case 11:
        this.psa?.clear();
        break;
      case 12:
        this.rss?.clear();
        break;
      case 13:
        this.bdc?.clear();
        break;
      case 14:
        this.bfs?.clear();
        break;
      case 15:
        this.ifs?.clear();
        break;
      case 18:
        this.cct?.clear();
        break;
      case 19:
        this.dnr?.clear();
        break;
      case 20:
        this.pof?.clear();
        break;
      case 21:
        this.brv?.clear();
        break;
      case 22:
        this.din?.clear();
        break;
      case 23:
        this.nne?.clear();
        break;
      case 24:
        this.ips?.clear();
        break;
      case 25:
        this.avb?.clear();
        break;
      case 26:
        this.ips?.clear();
        break;
      case 27:
        this.cpc?.clear();
        break;
      case 28:
        this.cps?.clear();
        break;
      case 29:
        this.epr?.clear();
        break;
      case 30:
        this.mbc?.clear();
        break;
      case 31:
        this.mpfef?.clear();
        break;
      case 32:
        this.nicu?.clear();
        break;
      case 33:
        this.paer?.clear();
        break;
      case 34:
        this.scb?.clear();
        break;
      case 35:
        this.tcouo?.clear();
        break;
      case 36:
        this.dinst?.clear();
        break;
      case 37:
        this.pccc?.clear();
        break;
      case 38:
        this.naapp?.clear();
        break;
      case 39:
        this.rms?.clear();
        break;
      case 40:
        this.naalo?.clear();
        break;
      case 41:
        this.naaas?.clear();
        break;
      case 42:
        this.cpnn?.clear();
        break;
      case 43:
        this.bfoj?.clear();
        break;
      case 44:
        this.icbf?.clear();
        break;
      case 45:
        this.ccms?.clear();
        break;
      case 46:
        this.iscc?.clear();
        break;
      case 3:
        this.poc?.clear();
        break;
      case 47:
        this.mstc?.clear();
        break;
      case 48:
        this.aemmcf?.clear();
        break;
      case 49:
        this.clb?.clear();
        break;
      case 50:
        this.cho?.clear();
        break;
      case 51:
        this.eon?.clear();
        break;
      case 52:
        this.naif?.clear();
        break;
      case 53:
        this.nuno?.clear();
        break;
      case 54:
        this.act?.clear();
        break;
      case 55:
        this.ccu?.clear();
        break;
      case 56:
        this.erf?.clear();
        break;
      case 57:
        this.ana?.clear();
        break;
      case 58:
        this.ebl?.clear();
        break;
      case 59:
        this.fvtf?.clear();
        break;
      case 60:
        this.gnct?.clear();
        break;
      case 61:
        this.hof?.clear();
        break;
      case 63:
        this.mths?.clear();
        break;
      case 64:
        this.mcf?.clear();
        break;
      case 65:
        this.mrdc?.clear();
        break;
      case 66:
        this.nbp?.clear();
        break;
      case 67:
        this.nds?.clear();
        break;
      case 68:
        this.nfc?.clear();
        break;
      case 69:
        this.ooma?.clear();
        break;
      case 72:
        this.addc?.clear();
        break;
      case 73:
        this.bbct?.clear();
        break;
      case 74:
        this.imap?.clear();
        break;
      case 75:
        this.miclt?.clear();
        break;
      case 76:
        this.mic?.clear();
        break;
      case 77:
        this.otms?.clear();
        break;
      case 78:
        this.osscp?.clear();
        break;
      case 79:
        this.ptccc?.clear();
        break;
      case 80:
        this.pyge?.clear();
        break;
      case 81:
        this.pnsra?.clear();
        break;
      case 83:
        this.pcfa?.clear();
        break;
      case 84:
        this.pcsi?.clear();
        break;
      case 85:
        this.poca?.clear();
        break;
      case 86:
        this.pors?.clear();
        break;
      case 87:
        this.sffm?.clear();
        break;
      case 92:
        this.huhr?.clear();
        break;
      case 93:
        this.rdic?.clear();
        break;
      case 94:
        this.nkx?.clear();
        break;
      case 88:
        this.asct?.clear();
        break;
      case 89:
        this.ardo?.clear();
        break;
      case 90:
        this.cssc?.clear();
        break;
      case 91:
        this.cmcrp?.clear();
        break;
      case 96:
        this.ucc?.clear();
        break;
      case 98:
        this.pidaf?.clear();
        break;
      case 99:
        this.rtc?.clear();
        break;
      case 103:
        this.obrc?.clear();
        break;
      case 104:
        this.otmjs?.clear();
        break;
      case 101:
        this.flrs?.clear();
        break;
      case 107:
        this.nicun?.clear();
        break;
      case 107:
        this.ncms?.clear();
        break;
      case 110:
        this.nuct?.clear();
        break;
      case 114:
        this.cdha?.clear();
        break;
      case 114:
        this.ipcd?.clear();
        break;
      case 116:
        this.respa?.clear();
        break;
      case 117:
        this.resty?.clear();
        break;
      case 118:
        this.recrr?.clear()
        break;
      case 119:
        this.fraapf?.clear()
        break;
      case 120:
        this.btprcu?.clear();
        break;
      case 121:
        this.picu?.clear();
        break;
      case 122:
        this.axss?.clear();
        break;
      case 124:
        this.paf?.clear();
        break;
      case 125:
        this.dtcf?.clear();
        break;
      case 126:
        this.paaii?.clear();
        break;
      case 127:
        this.dns?.clear();
        break;
      case 128:
        this.hbfg?.clear();
        break;
      case 129:
        this.hbfc?.clear();
        break;
      case 134:
        this.icrdp?.clear();
        break;
      case 135:
        this.pmq?.clear();
        break;
      case 136:
        this.rsc?.clear();
        break;
      case 137:
        this.hrf?.clear();
        break;
      case 138:
        this.mpcc?.clear();
        break;
      case 141:
        this.pnd?.clear();
        break;
      default:
        break;
      case 142:
      this.fraapfe?.clear()
      break;
    }
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

  changeEformsView() {
    this.showSections = !this.showSections;
    if (this.showSections) {
      $('.eforms_left_content').addClass("d-none");
      $('.eforms_right_content').addClass("eforms_right_content_min");
    }
    else {
      $('.eforms_left_content').removeClass("d-none");
      $('.eforms_right_content').removeClass("eforms_right_content_min");
    }
  }

  view() {
    const url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: 0, AdmissionID: this.patientDetails.AdmissionID ? this.patientDetails.AdmissionID : this.admissionID, PatientTemplatedetailID: 0, TBL: 1 });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNList = this.FetchPatienClinicalTemplateDetailsNList1 = response.FetchPatienClinicalTemplateDetailsNList;
            this.FetchPatienClinicalTemplateDetailsNList.forEach((item: any) => {
              const modDate = new Date(item.Moddate);

              const currentDate = new Date();

              if (isNaN(modDate.getTime())) {
                console.error(`Invalid date format: ${item.Moddate}`);
                item.diffHours = null;
                return;
              }

              const diffTime = Math.abs(currentDate.getTime() - modDate.getTime());
              const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

              item.diffHours = diffHours;

              if (item.diffHours > this.eformRestriction && noRestrictionTemplates.indexOf(Number(item.ClinicalTemplateID)) === -1) {
                item.edit = false;
              }
              else {
                item.edit = true;
              }
            });
            $("#savedModal1").modal('show');
          }
        }
      },
        (err) => {
        })
  }

  selectedTemplate(tem: any, type: string) {
    this.templateService.setCanEditStatus(tem.edit);
    if (type === 'view') {
      this.showSave = false;
    }
    else {
      const startDate = new Date(tem.Createdate);
      const now = new Date();
      const differenceMs: number = now.getTime() - startDate.getTime();
      const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
      const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
      const totalHours = hours + (days * 24);

      if (tem.CreatedBy === this.doctorDetails[0].UserName && totalHours < Number(this.doctorDetails[0].PrescriptionRestriction)) {
        this.showSave = true;
      }
      else {
        this.showSave = false;
      }
    }
    this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
    const url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: 0, AdmissionID: this.patientDetails.AdmissionID, PatientTemplatedetailID: this.PatientTemplatedetailID, TBL: 2 });

    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
            tem = response.FetchPatienClinicalTemplateDetailsNNList[0];
            let sameUser = true;
            if (tem.CreatedBy != this.doctorDetails[0]?.UserName) {
              sameUser = false;
            }
            this.templateID = Number(tem.ClinicalTemplateID);
            sessionStorage.setItem('currentTemplateId', this.templateID);
            if (multipleSaveEnabledTemplates.includes(this.templateID)) {
              this.showSave = true;
            }
            setTimeout(() => {
              const timeInterval = setInterval(() => {
                const tempname = this.templatesList.find((x: any) => x.Id === this.templateID).templatename;
                const template = (this as any)[tempname];
                if (template?.IsView) {
                  const selectedItem = template.FetchPatienClinicalTemplateDetailsNList.find((item: any) => item.PatientTemplatedetailID === tem.PatientTemplatedetailID);
                  template.selectedTemplate(selectedItem);
                  clearInterval(timeInterval);
                }
              }, 1000);
            });
            $("#savedModal1").modal('hide');
          }
        }
      },
        (err) => {
        })
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

  ngOnDestroy() {
    sessionStorage.removeItem('currentTemplateId');
  }

  navtigateBackToPhysiotherapy() {
    sessionStorage.removeItem("InPatientDetails");
    sessionStorage.removeItem("selectedView");
    sessionStorage.removeItem("fromPhysiotherapy");
    sessionStorage.removeItem('selectedTemplateId');
    this.router.navigate(['/suit/physiotherapyworklist']);
  }

  onAccept() {
    const SSN = this.patientDetails.SSN;
    $('#selectPatientYesNoModal').modal('hide');
    sessionStorage.setItem('navigateToRadiologyWorklist', SSN)
    this.router.navigate(['/suit/radiologyworklist']);
  }

  onDecline() {
    $('#selectPatientYesNoModal').modal('hide');
    this.router.navigate(['/suit/radiologyworklist']);
  }

  navtigateBackToCathLab() {
    if (this.fromRadiologyWorklist) {
      sessionStorage.removeItem('fromRadiologyWorklist');
      sessionStorage.removeItem('BedList');
      sessionStorage.removeItem('selectedView');
      $('#selectPatientYesNoModal').modal('show');
    }
    else {
      const cathLabfacility = JSON.parse(sessionStorage.getItem("cathLabfacility") || '{}');
      sessionStorage.removeItem('fromCathLab');
      sessionStorage.removeItem('InPatientDetails');
      sessionStorage.removeItem('BedList');
      sessionStorage.removeItem('selectedView');
      this.bedconfig.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
        .subscribe((response: any) => {
          var facilityName = response.FetchUserFacilityDataList.find((x: any) => x.FacilityID === cathLabfacility.FacilityID);
          sessionStorage.setItem("facility", JSON.stringify(facilityName));
          sessionStorage.setItem("FacilityID", JSON.stringify(cathLabfacility.FacilityID));
          sessionStorage.removeItem('cathLabfacility');
          this.router.navigate(['/suit/radiologyworklist']);
        },
          (err) => {
          })
    }
  }

  reloadTemplate() {
    this.showComponent = false;
    setTimeout(() => this.showComponent = true, 0);
  }

  searchSavedEforms(event: any) {
    if (event.target.value === '') {
      this.FetchPatienClinicalTemplateDetailsNList = this.FetchPatienClinicalTemplateDetailsNList1;
    }
    else {
      this.FetchPatienClinicalTemplateDetailsNList = this.FetchPatienClinicalTemplateDetailsNList1.filter((x: any) =>
        x.ClinicalTemplateName.toLowerCase().includes(event.target.value.toLowerCase().trim())
      );
    }

  }
    getCTASScoreClass() {
    if(this.selectedView?.CTASScore == '1') {
      return 'Resuscitation';
    }
    else if(this.selectedView?.CTASScore == '2') {
      return 'Emergent';
    }
    else if(this.selectedView?.CTASScore == '3') {
      return 'Urgent';
    }
    else if(this.selectedView?.CTASScore == '4') {
      return 'LessUrgent';
    }
    else if(this.selectedView?.CTASScore == '5') {
      return 'NonUrgent';
    }
    return '';
  }
}
