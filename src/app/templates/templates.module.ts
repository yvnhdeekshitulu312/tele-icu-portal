import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplatesLandingComponent } from './templates-landing/templates-landing.component';
import { TemplatesRoutingModule } from './templates-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgainstMedicalAdviceComponent } from './against-medical-advice/against-medical-advice.component';
import { CodeBlueDocumentationComponent } from './code-blue-documentation/code-blue-documentation.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PsychoSocialComponent } from './psycho-social/psycho-social.component';
import { ReferralSocialServiceComponent } from './referral-social-service/referral-social-service.component';
import { BabiesDataComponent } from './babies-data/babies-data.component';
import { BreastFeedingSheetComponent } from './breast-feeding-sheet/breast-feeding-sheet.component';
import { InfantFeedingSheetComponent } from './infant-feeding-sheet/infant-feeding-sheet.component';
import { CriticalCareTransferComponent } from './critical-care-transfer/critical-care-transfer.component';
import { DnrFormComponent } from './dnr-form/dnr-form.component';
import { PatientOutpassFormComponent } from './patient-outpass-form/patient-outpass-form.component';
import { BabyReceivedComponent } from './baby-received/baby-received.component';
import { DischargeInstructionsNurseryComponent } from './discharge-instructions-nursery/discharge-instructions-nursery.component';
import { NeonatalExaminationComponent } from './neonatal-examination/neonatal-examination.component';
import { InvasiveProcedureSafetyChecklistComponent } from './invasive-procedure-safety-checklist/invasive-procedure-safety-checklist.component';
import { AdultVentilatorBundleComponent } from './adult-ventilator-bundle/adult-ventilator-bundle.component';
import { ComplicationsSideeffectsOfEpiduralanaesthesiaComponent } from './complications-sideeffects-of-epiduralanaesthesia/complications-sideeffects-of-epiduralanaesthesia.component';
import { ComprehensivePlanOfCareComponent } from './comprehensive-plan-of-care/comprehensive-plan-of-care.component';
import { CriesPainScaleComponent } from './cries-pain-scale/cries-pain-scale.component';
import { EpiduralRecordComponent } from './epidural-record/epidural-record.component';
import { MdroBundleInfectionComponent } from './mdro-bundle-infection/mdro-bundle-infection.component';
import { MultidisciplanaryPatientFamilyEducationFormComponent } from './multidisciplanary-patient-family-education-form/multidisciplanary-patient-family-education-form.component';
import { NeonatalIntensiveCareUnitComponent } from './neonatal-intensive-care-unit/neonatal-intensive-care-unit.component';
import { PreAnestheticEvalutionRecordComponent } from './pre-anesthetic-evalution-record/pre-anesthetic-evalution-record.component';
import { SkinCareBundleComponent } from './skin-care-bundle/skin-care-bundle.component';
import { TransferChecklistComponent } from './transfer-checklist/transfer-checklist.component';
import { DischargeInstCbahiPfrPostDischComponent } from './discharge-inst-cbahi-pfr-post-disch/discharge-inst-cbahi-pfr-post-disch.component';
import { PreCardiacCatheterizationChecklistComponent } from './pre-cardiac-catheterization-checklist/pre-cardiac-catheterization-checklist.component';
import { NursingAdmissionAssessmentPediaPicuComponent } from './nursing-admission-assessment-pedia-picu/nursing-admission-assessment-pedia-picu.component';
import { RestraintsMonitoringSheetComponent } from './restraints-monitoring-sheet/restraints-monitoring-sheet.component';
import { NursingAdmissionAssessmentLdObgyneComponent } from './nursing-admission-assessment-ld-obgyne/nursing-admission-assessment-ld-obgyne.component';
import { NursingAdmissionAssessmentAdultSurgicalComponent } from './nursing-admission-assessment-adult-surgical/nursing-admission-assessment-adult-surgical.component';
import { ClinicalpathNormalNewbornComponent } from './clinicalpath-normal-newborn/clinicalpath-normal-newborn.component';
import { BreastfeedingObservationJobonaidComponent } from './breastfeeding-observation-jobonaid/breastfeeding-observation-jobonaid.component';
import { InfectionControlBundleformComponent } from './infection-control-bundleform/infection-control-bundleform.component';
import { CriticalCareMonitoringSheetComponent } from './critical-care-monitoring-sheet/critical-care-monitoring-sheet.component';
import { InstrumentSuturesCountChecklistComponent } from './instrument-sutures-count-checklist/instrument-sutures-count-checklist.component';
import { PreOperativeChecklistComponent } from './pre-operative-checklist/pre-operative-checklist.component';
import { MetabolicScreeningTestConsentComponent } from './metabolic-screening-test-consent/metabolic-screening-test-consent.component';
import { AckExistenceMedMonitoringCamerasFormComponent } from './ack-existence-med-monitoring-cameras-form/ack-existence-med-monitoring-cameras-form.component';
import { CentralLineBundleComponent } from './central-line-bundle/central-line-bundle.component';
import { ConsentHighriskOperationComponent } from './consent-highrisk-operation/consent-highrisk-operation.component';
import { ElectronicOperativeNoteComponent } from './electronic-operative-note/electronic-operative-note.component';
import { NewAdmissionIcuFormComponent } from './new-admission-icu-form/new-admission-icu-form.component';
import { NurseNoteComponent } from './nurse-note/nurse-note.component';
import { AnesthesiaConsciousComponent } from './anesthesia-conscious/anesthesia-conscious.component';
import { CriticalCareUnitComponent } from './critical-care-unit/critical-care-unit.component';
import { ElectronicRespiratoryComponent } from './electronic-respiratory/electronic-respiratory.component';
import { AdultNutritionAssessmentComponent } from './adult-nutrition-assessment/adult-nutrition-assessment.component';
import { EstimatedBloodLossComponent } from './estimated-blood-loss/estimated-blood-loss.component';
import { FallsVisualTriageFormComponent } from './falls-visual-triage-form/falls-visual-triage-form.component';
import { GeneralConsentComponent } from './general-consent/general-consent.component';
import { HandOverFormComponent } from './hand-over-form/hand-over-form.component';
import { MaternalHistoryComponent } from './maternal-history/maternal-history.component';
import { MedicalConsentFormComponent } from './medical-consent-form/medical-consent-form.component';
import { MedicalRecordsDocumentsChecklistComponent } from './medical-records-documents-checklist/medical-records-documents-checklist.component';
import { NewbornPageComponent } from './newborn-page/newborn-page.component';
import { NursingDuschargeSummaryComponent } from './nursing-duscharge-summary/nursing-duscharge-summary.component';
import { NursingFeedingChartComponent } from './nursing-feeding-chart/nursing-feeding-chart.component';
import { OfficeOfMedicalAffairsComponent } from './office-of-medical-affairs/office-of-medical-affairs.component';
import { AdmissionDischargeDocumentChecklistComponent } from './admission-discharge-document-checklist/admission-discharge-document-checklist.component';
import { BloodBloodComponentTranfusionComponent } from './blood-blood-component-tranfusion/blood-blood-component-tranfusion.component';
import { InitialMedicalAssessmentPatientsComponent } from './initial-medical-assessment-patients/initial-medical-assessment-patients.component';
import { MedicalInformedConsentLaserTreatmentComponent } from './medical-informed-consent-laser-treatment/medical-informed-consent-laser-treatment.component';
import { MedicalInformedConsentComponent } from './medical-informed-consent/medical-informed-consent.component';
import { OperationTheatreMinorSurgeryComponent } from './operation-theatre-minor-surgery/operation-theatre-minor-surgery.component';
import { OrSurgicalSafetyChecklistPhase4Component } from './or-surgical-safety-checklist-phase4/or-surgical-safety-checklist-phase4.component';
import { PatientConsentCardiacCatherizationComponent } from './patient-consent-cardiac-catherization/patient-consent-cardiac-catherization.component';
import { PaymentGuaranteeComponent } from './payment-guarantee/payment-guarantee.component';
import { PediatricNutritionAssessmentComponent } from './pediatric-nutrition-assessment/pediatric-nutrition-assessment.component';
import { PhysiotheraphyComprehensiveFunctionalAssessmentComponent } from './physiotheraphy-comprehensive-functional-assessment/physiotheraphy-comprehensive-functional-assessment.component';
import { PostConsciousSedationComponent } from './post-conscious-sedation/post-conscious-sedation.component';
import { PreOperativeCardiologyAssessmentComponent } from './pre-operative-cardiology-assessment/pre-operative-cardiology-assessment.component';
import { PricesOfRoomsComponent } from './prices-of-rooms/prices-of-rooms.component';
import { ScreeningFormForMRIComponent } from './screening-form-for-mri/screening-form-for-mri.component';
import { HemodialysisUnitHemodialysisComponent } from './hemodialysis-unit-hemodialysis/hemodialysis-unit-hemodialysis.component';
import { RadiologyDepartmentInformedConsentComponent } from './radiology-department-informed-consent/radiology-department-informed-consent.component';
import { NursingKardexComponent } from './nursing-kardex/nursing-kardex.component';
import { AKUSafteyChecklistComponent } from './aku-saftey-checklist/aku-saftey-checklist.component';
import { AnesthesiaRecordDuringOperationComponent } from './anesthesia-record-during-operation/anesthesia-record-during-operation.component';
import { CathlabSurgicalSafetyChecklistComponent } from './cathlab-surgical-safety-checklist/cathlab-surgical-safety-checklist.component';
import { CriteriaAndMedicalConditionsComponent } from './criteria-and-medical-conditions/criteria-and-medical-conditions.component';
import { UrinaryCatheterCareComponent } from './urinary-catheter-care/urinary-catheter-care.component';
import { PatientIDDataAuthenticationFormComponent } from './patient-id-data-authentication-form/patient-id-data-authentication-form.component';
import { RespiratoryTriageChecklistComponent } from './respiratory-triage-checklist/respiratory-triage-checklist.component';
import { ObstetricsRecordComponent } from './obstetrics-record/obstetrics-record.component';
import { OperationTheatreMajorSurgeryComponent } from './operation-theatre-major-surgery/operation-theatre-major-surgery.component';
import { FollowupReassessmentComponent } from './followup-reassessment/followup-reassessment.component';
import { NeonatalIntensiveCareunitNursingComponent } from './neonatal-intensive-careunit-nursing/neonatal-intensive-careunit-nursing.component';
import { NicuCriticalMonitoringSheetComponent } from './nicu-critical-monitoring-sheet/nicu-critical-monitoring-sheet.component';
import { NursingChecklistComponent } from './nursing-checklist/nursing-checklist.component';
import { ComprehensiveDentalHealthAsmntformComponent } from './comprehensive-dental-health-asmntform/comprehensive-dental-health-asmntform.component';
import { InfectionPreventionControlDepartmentComponent } from './infection-prevention-control-department/infection-prevention-control-department.component';
import { RespiratoryAssessmentComponent } from './respiratory-assessment/respiratory-assessment.component';
import { RespiratoryTherapyComponent } from './respiratory-therapy/respiratory-therapy.component';
import { RecoveryRoomRecordComponent } from './recovery-room-record/recovery-room-record.component';
import { FallsRiskAssessmentAndPreventionFormComponent } from './falls-risk-assessment-and-prevention-form/falls-risk-assessment-and-prevention-form.component';
import { BeforeTransferringPatientComponent } from './before-transferring-patient/before-transferring-patient.component';
import { PediatricIntensiveCareUnitComponent } from './pediatric-intensive-care-unit/pediatric-intensive-care-unit.component';
import { AdmixtureServicesComponent } from './admixture-services/admixture-services.component';
import { SharedtemplateviewComponent } from './sharedtemplateview/sharedtemplateview.component';
import { PsychologyAssessmentComponent } from './psychology-assessment/psychology-assessment.component';
import { DentalTreatmentConsentComponent } from './dental-treatment-consent/dental-treatment-consent.component';
import { IronInjectionAckComponent } from './iron-injection-ack/iron-injection-ack.component';
import { DeliveryNotesComponent } from './delivery-notes/delivery-notes.component';
import { HemoDialysisGraftComponent } from './hemo-dialysis-graft/hemo-dialysis-graft.component';
import { HemoDialysisCatheterComponent } from './hemo-dialysis-catheter/hemo-dialysis-catheter.component';
import { SpecimenRejectionComponent } from './specimen-rejection/specimen-rejection.component';
import { CorrectedFormComponent } from './corrected-form/corrected-form.component';
import { OtPatientCasesheetComponent } from '../ot/ot-patient-casesheet/ot-patient-casesheet.component';
import { RadiologyDepartmentInformedConsentDuringPregnancyComponent } from './radiology-department-informed-consent-during-pregnancy/radiology-department-informed-consent-during-pregnancy.component';
import { PremammographyQuestionnaireComponent } from './premammography-questionnaire/premammography-questionnaire.component';
import { RadiologySafetyChecklistComponent } from './radiology-safety-checklist/radiology-safety-checklist.component';
import { HistopathologyRequestFormComponent } from './histopathology-request-form/histopathology-request-form.component';
import { TemplateBlockComponent } from './template-block/template-block.component';
import { EmployeeSearchComponent } from './employee-search/employee-search.component';
import { MedicalPhotographyConsentComponent } from './medical-photography-consent/medical-photography-consent.component';
import { TherapeuticPhlebotomyFormComponent } from './therapeutic-phlebotomy-form/therapeutic-phlebotomy-form.component';
import { ProcedureNoteDocumentationComponent } from './procedure-note-documentation/procedure-note-documentation.component';
import { FallsRiskAssessmentAndPreventionFormEndoscopyComponent } from './falls-risk-assessment-and-prevention-form-endoscopy/falls-risk-assessment-and-prevention-form-endoscopy.component';

@NgModule({
  declarations: [
    TemplatesLandingComponent,
    AgainstMedicalAdviceComponent,
    CodeBlueDocumentationComponent,
    PsychoSocialComponent,
    ReferralSocialServiceComponent,
    BabiesDataComponent,
    BreastFeedingSheetComponent,
    InfantFeedingSheetComponent,
    CriticalCareTransferComponent,
    DnrFormComponent,
    PatientOutpassFormComponent,
    BabyReceivedComponent,
    DischargeInstructionsNurseryComponent,
    NeonatalExaminationComponent,
    InvasiveProcedureSafetyChecklistComponent,
    AdultVentilatorBundleComponent,
    ComplicationsSideeffectsOfEpiduralanaesthesiaComponent,
    ComprehensivePlanOfCareComponent,
    CriesPainScaleComponent,
    EpiduralRecordComponent,
    MdroBundleInfectionComponent,
    MultidisciplanaryPatientFamilyEducationFormComponent,
    NeonatalIntensiveCareUnitComponent,
    PreAnestheticEvalutionRecordComponent,
    SkinCareBundleComponent,
    TransferChecklistComponent,
    DischargeInstCbahiPfrPostDischComponent,
    PreCardiacCatheterizationChecklistComponent,
    NursingAdmissionAssessmentPediaPicuComponent,
    RestraintsMonitoringSheetComponent,
    NursingAdmissionAssessmentLdObgyneComponent,
    NursingAdmissionAssessmentAdultSurgicalComponent,
    ClinicalpathNormalNewbornComponent,
    BreastfeedingObservationJobonaidComponent,
    InfectionControlBundleformComponent,
    CriticalCareMonitoringSheetComponent,
    InstrumentSuturesCountChecklistComponent,
    PreOperativeChecklistComponent,
    MetabolicScreeningTestConsentComponent,
    AckExistenceMedMonitoringCamerasFormComponent,
    CentralLineBundleComponent,
    ConsentHighriskOperationComponent,
    ElectronicOperativeNoteComponent,
    NewAdmissionIcuFormComponent,
    NurseNoteComponent,
    EstimatedBloodLossComponent,
    FallsVisualTriageFormComponent,
    GeneralConsentComponent,
    AnesthesiaConsciousComponent,
    CriticalCareUnitComponent,
    ElectronicRespiratoryComponent,
    AdultNutritionAssessmentComponent,
    HandOverFormComponent,
    MaternalHistoryComponent,
    MedicalConsentFormComponent,
    MedicalRecordsDocumentsChecklistComponent,
    NewbornPageComponent,
    NursingDuschargeSummaryComponent,
    NursingFeedingChartComponent,
    OfficeOfMedicalAffairsComponent,
    AdmissionDischargeDocumentChecklistComponent,
    BloodBloodComponentTranfusionComponent,
    InitialMedicalAssessmentPatientsComponent,
    MedicalInformedConsentLaserTreatmentComponent,
    MedicalInformedConsentComponent,
    OperationTheatreMinorSurgeryComponent,
    OrSurgicalSafetyChecklistPhase4Component,
    PatientConsentCardiacCatherizationComponent,
    PaymentGuaranteeComponent,
    PediatricNutritionAssessmentComponent,
    PhysiotheraphyComprehensiveFunctionalAssessmentComponent,
    PostConsciousSedationComponent,
    PreOperativeCardiologyAssessmentComponent,
    PricesOfRoomsComponent,
    ScreeningFormForMRIComponent,
    HemodialysisUnitHemodialysisComponent,
    RadiologyDepartmentInformedConsentComponent,
    NursingKardexComponent,
    AKUSafteyChecklistComponent,
    AnesthesiaRecordDuringOperationComponent,
    CathlabSurgicalSafetyChecklistComponent,
    CriteriaAndMedicalConditionsComponent,
    UrinaryCatheterCareComponent,
    PatientIDDataAuthenticationFormComponent,
    RespiratoryTriageChecklistComponent,
    ObstetricsRecordComponent,
    OperationTheatreMajorSurgeryComponent,
    FollowupReassessmentComponent,
    NeonatalIntensiveCareunitNursingComponent,
    NicuCriticalMonitoringSheetComponent,
    NursingChecklistComponent,
    ComprehensiveDentalHealthAsmntformComponent,
    InfectionPreventionControlDepartmentComponent,
    RespiratoryAssessmentComponent,
    RespiratoryTherapyComponent,
    RecoveryRoomRecordComponent,
    FallsRiskAssessmentAndPreventionFormComponent,
    BeforeTransferringPatientComponent,
    PediatricIntensiveCareUnitComponent,
    AdmixtureServicesComponent,
    SharedtemplateviewComponent,
    PsychologyAssessmentComponent,
    DentalTreatmentConsentComponent,
    IronInjectionAckComponent,
    DeliveryNotesComponent,
    HemoDialysisGraftComponent, 
    HemoDialysisCatheterComponent, 
    SpecimenRejectionComponent, 
    CorrectedFormComponent,
    OtPatientCasesheetComponent,
    RadiologyDepartmentInformedConsentDuringPregnancyComponent,
    PremammographyQuestionnaireComponent,
    RadiologySafetyChecklistComponent,
    HistopathologyRequestFormComponent,
    TemplateBlockComponent,
    EmployeeSearchComponent,
    MedicalPhotographyConsentComponent,
    TherapeuticPhlebotomyFormComponent,
    ProcedureNoteDocumentationComponent,
    FallsRiskAssessmentAndPreventionFormEndoscopyComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TemplatesRoutingModule,
    SharedModule,
    MatDatepickerModule,
    MatInputModule,
    MatAutocompleteModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatToolbarModule,
    MatMomentDateModule,
	  MatTooltipModule,
  ],
  exports: [
    MatDatepickerModule,
    MatInputModule,
    MatAutocompleteModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatToolbarModule,
    MatMomentDateModule,
    MatTooltipModule,
    TemplatesLandingComponent,
    MultidisciplanaryPatientFamilyEducationFormComponent,
    TherapeuticPhlebotomyFormComponent
  ]
})
export class TemplatesModule { }
