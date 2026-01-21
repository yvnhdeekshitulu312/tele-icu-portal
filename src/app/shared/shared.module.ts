// shared.module.ts
import { NgModule } from '@angular/core';
import { TwoDigitDecimaNumberDirective } from '../two-digit-decima-number.directive';
import { FocusNextDirective } from '../focus-next.directive';
import { OthersResultsComponent } from '../portal/others-results/others-results.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { OthersResultsBannerComponent } from '../portal/others-results-banner/others-results-banner.component';
import { SafePipe } from '../safe.pipe';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { DynamicComponent } from './dynamic-date-picker/dynamic.component';
import { HeaderComponent } from '../ward/header/header.component';
import { PatientQuickInformationComponent } from './patient-quick-information/patient-quick-information.component';
import { SignatureComponent } from './signature/signature.component';
import { PaginationComponent } from './pagination/pagination.component';
import { SuitHeaderComponent } from '../suit/suit-header/suit-header.component';
import { ValidateEmployeeComponent } from './validate-employee/validate-employee.component';
import { SummaryComponent } from '../portal/summary/summary.component';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { PatientQuickWalkthroughInfoComponent } from './patient-quick-walkthrough-info/patient-quick-walkthrough-info.component';
import { NumberDirective } from '../numbers-only.directive';
import { PatientQuickActionsComponent } from './patient-quick-actions/patient-quick-actions.component';
import { PreOpChecklistComponent } from './pre-op-checklist/pre-op-checklist.component';
import { SharedRoutingModule } from './shared-routing.module';
import { PatientfolderComponent } from './patientfolder/patientfolder.component';
import { SharedComponent } from './shared.component';
import { SummaryComponent as WardHeaderSummary } from '../ward//summary/summary.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { PrimaryDoctorChangeComponent } from './primary-doctor-change/primary-doctor-change.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PatientAlertsComponent } from './patient-alerts/patient-alerts.component';
import { VteRiskAssessmentComponent } from '../ward/vte-risk-assessment/vte-risk-assessment.component';
import { AlertComponent } from './alert/alert.component';
import { VteSurgicalRiskAssessmentComponent } from '../ward/vte-surgical-risk-assessment/vte-surgical-risk-assessment.component';
import { VteObgAssessmentComponent } from '../ward/vte-obg-assessment/vte-obg-assessment.component';
import { GenericCloseComponent } from './generic-close/generic-close.component';
import { DietCounsellingComponent } from '../ward/diet-counselling/diet-counselling.component';
import { InstructionsToNurseComponent } from '../../app/portal/instructions-to-nurse/instructions-to-nurse.component';
import { BradenScaleComponent } from './braden-scale/braden-scale.component';
import { FallRiskAssessmentComponent } from './fall-risk-assessment/fall-risk-assessment.component';
import { CardiologyAssessmentComponent } from '../portal/cardiology-assessment/cardiology-assessment.component';
import { AnesthesiaAssessmentComponent } from '../portal/anesthesia-assessment/anesthesia-assessment.component'; 
import { MedicalAssessmentComponent } from '../portal/medical-assessment/medical-assessment.component';
import { MedicalAssessmentPediaComponent } from '../portal/medical-assessment-pedia/medical-assessment-pedia.component';
import { MedicalAssessmentObstericComponent } from '../portal/medical-assessment-obsteric/medical-assessment-obsteric.component';
import { StatisticsComponent } from '../reports/statistics/statistics.component';
import { YesNoModalComponent } from './yes-no-modal/yes-no-modal.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { HomeMedicationComponent } from '../ward/home-medication/home-medication.component';
import { QuickMedicationComponent } from '../ward/quick-medication/quick-medication.component';
import { PatientBannerComponent } from './patient-banner/patient-banner.component';
import { AllergyComponent } from './allergy/allergy.component';
import { TimeSelectorComponent } from './time-selector/time-selector.component';
import { ReferralComponent } from './referral/referral.component';
import { PatientEformsComponent } from './patient-eforms/patient-eforms.component';
import { TemplateService } from './template.service';
import { InPatientDischargeSummaryComponent } from './inpatient-discharge-summary/inpatient-discharge-summary.component';
import { DoctorappointmentComponent } from '../frontoffice/doctorappointment/doctorappointment.component';
import { AuditLogDirective } from '../audit-log.directive';
import { MedicalReportComponent } from './medical-report/medical-report.component';
import { VoiceTextComponent } from './voice-text/voice-text.component';
import { OtQuickActionsComponent } from './ot-quick-actions/ot-quick-actions.component';
import { OkCancelModalComponent } from './ok-cancel-modal/ok-cancel-modal.component';
import { GeneralconsentComponent } from '../portal/generalconsent/generalconsent.component';
import { ConsentMedicalComponent } from '../portal/consent-medical/consent-medical.component';
import { ConsentHroComponent } from '../portal/consent-hro/consent-hro.component';
import { MediInvProcComponent } from './medi-inv-proc/medi-inv-proc.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { Coding3mWorklistComponent } from './3m-coding-worklist/3m-coding-worklist.component';
import { VitalsComponent } from './vitals/vitals.component';
import { ScanDocumentsComponent } from './scan-documents/scan-documents.component';
import { SignaturePadComponent } from './signature-pad/signature-pad.component';
import { PediaFallriskAssessmentComponent } from './pedia-fallrisk-assessment/pedia-fallrisk-assessment.component';
import { TwoDigitNumberOnlyDirective } from '../two-digit-number-only.directive';
import { FutureAppointmentsWorklistComponent } from '../frontoffice/future-appointments-worklist/future-appointments-worklist.component';
import { WoundAssessmentComponent } from '../ward/wound-assessment/wound-assessment.component';
import { HasPermissionDirective } from './has-permission.directive';
import { FeatureIdService } from './feature-id.service';
import { DoctorappointmentsComponent } from './doctorappointments/doctorappointments.component';
import { ButtonVisibilityDirective } from './button-visibility.directive';
import { PatientfoldermlComponent } from './patientfolderml/patientfolderml.component';
import { EmrNursingChecklistComponent } from '../templates/emr-nursing-checklist/emr-nursing-checklist.component';
import { BloodrequestComponent } from '../ward/bloodrequest/bloodrequest.component';
import { EformPeriodComponent } from './eform-period/eform-period.component';
import { EditorModule } from 'primeng/editor';
import { SickLeaveOPDApprovalComponent } from './sick-leave-opd-approval/sick-leave-opd-approval.component';
import { SickLeaveMedApprovalComponent } from './sick-leave-med-approval/sick-leave-med-approval.component';
import { TransfusionReactionReportComponent } from '../templates/transfusion-reaction-report/transfusion-reaction-report.component';
import { TransfusionFeedbackComponent } from '../blood-bank/transfusion-feedback/transfusion-feedback.component';
import { VteAntenatalComponent } from '../ward/vte-antenatal/vte-antenatal.component';
import { PendingReportsWorklistComponent } from './pending-reports-worklist/pending-reports-worklist.component';
import { CoordinatorWorklistComponent } from './coordinator-worklist/coordinator-worklist.component';
import { VteSurgicalNewComponent } from '../ward/vte-surgical-new/vte-surgical-new.component';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component'
import { ContenteditableModelDirective } from './contenteditableModel.directive';
import { ReferredToMeComponent } from './referred-to-me/referred-to-me.component';
import { PhysioReferralWorklistComponent } from './physio-referral-worklist/physio-referral-worklist.component';
import { FingerprintComponent } from './fingerprint/fingerprint.component';
import { ZoomComponent } from './zoom/zoom.component';
import { ChiDischargesummaryComponent } from './chi-dischargesummary/chi-dischargesummary.component';
import { TranslateLoaderComponent } from '../translate-loader/translate-loader.component';
import { ClaraModalComponent } from './clara-modal/clara-modal.component';
import { ClaraTriggerComponent } from './clara-trigger/clara-trigger.component';
import { PerformanceDashboardComponent } from '../reports/performance-dashboard/performance-dashboard.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PatSummaryComponent } from './pat-summary/pat-summary.component';

@NgModule({
  declarations: [
    TwoDigitDecimaNumberDirective,
    TwoDigitNumberOnlyDirective,
    FocusNextDirective, 
    OthersResultsComponent, 
    OthersResultsBannerComponent,
    SafePipe, 
    ConfirmationDialogComponent, 
    DynamicComponent, 
    HeaderComponent, 
    PatientQuickInformationComponent, 
    SignatureComponent, 
    SignaturePadComponent,
    PaginationComponent, 
    SuitHeaderComponent, 
    ValidateEmployeeComponent, 
    SummaryComponent,
    PatientQuickWalkthroughInfoComponent, 
    NumberDirective, 
    PatientQuickActionsComponent, 
    PreOpChecklistComponent, 
    PatientfolderComponent, 
    SharedComponent, 
    WardHeaderSummary, 
    PrimaryDoctorChangeComponent, 
    PatientAlertsComponent,
    VteRiskAssessmentComponent,
    AlertComponent,
    VteSurgicalRiskAssessmentComponent,
    VteObgAssessmentComponent,
    GenericCloseComponent,
    DietCounsellingComponent,
    InstructionsToNurseComponent,
    BradenScaleComponent,
    FallRiskAssessmentComponent,
    PediaFallriskAssessmentComponent,
    CardiologyAssessmentComponent,
    AnesthesiaAssessmentComponent,
    MedicalAssessmentComponent,
    MedicalAssessmentPediaComponent,
    MedicalAssessmentObstericComponent,
    StatisticsComponent,
    PerformanceDashboardComponent,
    YesNoModalComponent,
    ErrorMessageComponent,
    HomeMedicationComponent,
    QuickMedicationComponent,
    PatientBannerComponent,
    AllergyComponent,
    TimeSelectorComponent,
    ReferralComponent,
    PatientEformsComponent,
    InPatientDischargeSummaryComponent,
    DoctorappointmentComponent,
    AuditLogDirective,
    MedicalReportComponent,
    VoiceTextComponent,
    OtQuickActionsComponent,
    OkCancelModalComponent,
    GeneralconsentComponent,
    ConsentMedicalComponent,
    ConsentHroComponent,
    MediInvProcComponent,
    Coding3mWorklistComponent,
    VitalsComponent,
    ScanDocumentsComponent,
    PediaFallriskAssessmentComponent,
    FutureAppointmentsWorklistComponent,
    WoundAssessmentComponent,
    HasPermissionDirective,
    DoctorappointmentsComponent,
    ButtonVisibilityDirective,
    PatientfoldermlComponent,
    EmrNursingChecklistComponent,
    BloodrequestComponent,
    EformPeriodComponent,
    SickLeaveOPDApprovalComponent,
    SickLeaveMedApprovalComponent,
    TransfusionReactionReportComponent,
    TransfusionFeedbackComponent,
    VteAntenatalComponent,
    PendingReportsWorklistComponent,
    CoordinatorWorklistComponent,
    VteSurgicalNewComponent,
    PdfViewerComponent,
    ContenteditableModelDirective,
    ReferredToMeComponent,
    PhysioReferralWorklistComponent,
    FingerprintComponent,
    ZoomComponent,
    ChiDischargesummaryComponent,
    TranslateLoaderComponent,
    ClaraModalComponent,
    ClaraTriggerComponent,
    PatSummaryComponent
  ],
  exports: [
    TwoDigitDecimaNumberDirective, 
    TwoDigitNumberOnlyDirective,
    FocusNextDirective,
    OthersResultsComponent, 
    OthersResultsBannerComponent, 
    SafePipe, 
    DynamicComponent,
    HeaderComponent, 
    PatientQuickInformationComponent, 
    SignatureComponent,
    SignaturePadComponent, 
    PaginationComponent, 
    SuitHeaderComponent, 
    ValidateEmployeeComponent, 
    SummaryComponent, 
    CdkAccordionModule, 
    PatientQuickWalkthroughInfoComponent, 
    PatientQuickActionsComponent, 
    PreOpChecklistComponent, 
    SharedComponent, 
    PatientfolderComponent, 
    NumberDirective, 
    WardHeaderSummary,
    VteRiskAssessmentComponent,
    AlertComponent,
    VteSurgicalRiskAssessmentComponent,
    VteObgAssessmentComponent,
    GenericCloseComponent,
    DietCounsellingComponent,
    InstructionsToNurseComponent,
    BradenScaleComponent,
    FallRiskAssessmentComponent,
    PediaFallriskAssessmentComponent,
    CardiologyAssessmentComponent,
    AnesthesiaAssessmentComponent,
    MedicalAssessmentComponent,
    MedicalAssessmentPediaComponent,
    MedicalAssessmentObstericComponent,
    StatisticsComponent,
    PerformanceDashboardComponent,
    HomeMedicationComponent,
    QuickMedicationComponent,
    PatientBannerComponent,
    TimeSelectorComponent,
    InPatientDischargeSummaryComponent,
    DoctorappointmentComponent,
    AuditLogDirective,
    MedicalReportComponent,
    VoiceTextComponent,
    OtQuickActionsComponent,
    GeneralconsentComponent,
    ConsentMedicalComponent, 
    ConsentHroComponent,
    PatientEformsComponent,
    MediInvProcComponent,
    MatCheckboxModule,
    MatSelectModule,
    VitalsComponent,
    FutureAppointmentsWorklistComponent,
    WoundAssessmentComponent,
    HasPermissionDirective,
    ButtonVisibilityDirective,
    PatientfoldermlComponent,
    EmrNursingChecklistComponent,
    BloodrequestComponent,
    EformPeriodComponent,
    EditorModule ,
    TransfusionReactionReportComponent,
    TransfusionFeedbackComponent,
    VteAntenatalComponent,
    VteSurgicalNewComponent,
    PdfViewerComponent,
    ContenteditableModelDirective,
    ZoomComponent,
    TranslateLoaderComponent,
    ClaraModalComponent,
    ClaraTriggerComponent
  ],
  providers: [
    MatDatepickerModule, 
    DatePipe,
    TemplateService,
    FeatureIdService
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    ReactiveFormsModule,
    FormsModule,
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
    CdkAccordionModule,
    CarouselModule,
    OverlayModule,
    MatCheckboxModule,
    MatSelectModule,
    EditorModule,
    NgApexchartsModule
  ]
})
export class SharedModule { }
