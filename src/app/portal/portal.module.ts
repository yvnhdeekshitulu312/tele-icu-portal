import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CheckboxControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { PortalRoutingModule } from './portal-routing.module';
import { AppointmentComponent } from '../appointment/appointment.component';
import { HomepageComponent } from './homepage/homepage.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { FormsModule } from '@angular/forms';
import { VideoConsultationComponent } from './video-consultation/video-consultation.component';
import { DoctorAppointmentsComponent } from './doctor-appointments/doctor-appointments.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PatientsummaryComponent } from './patientsummary/patientsummary.component';
import { PrescriptionComponent } from './prescription/prescription.component';
import { PatientCasesheetComponent } from './patient-casesheet/patient-casesheet.component';
import { TreePipe } from './prescription/TreePipe';
import { SelectGroupDirective } from './prescription/SelectGroup';
import { CheckChildrenDirective } from './prescription/CheckChildren';
// import { SidebarComponent } from '../sidebar/sidebar.component';
import { TreeviewModule } from 'ngx-treeview';
import { IdcSearchComponent } from './idc-search/idc-search.component';
import { DiagnosisComponent } from './diagnosis/diagnosis.component';
import { AdviceComponent } from './advice/advice.component';
import { TypesOfPrecautionsComponent } from './types-of-precautions/types-of-precautions.component';
import { OthersReportsComponent } from './others-reports/others-reports.component';
import { OthersAdverseComponent } from './others-adverse/others-adverse.component';
import { MarkerComponent } from './marker/marker.component';
import { DynamicWidthDirective } from '../dynamic-width.directive';
import { SharedModule } from '../shared/shared.module';
import { DischargeSummaryComponent } from './portal/discharge-summary/discharge-summary.component';
import { QuickOrdersComponent } from './quick-orders/quick-orders.component';
import { PulmonologyDiseasesComponent } from './pulmonology-diseases/pulmonology-diseases.component';
import { SickleaveComponent } from './sickleave/sickleave.component';
// import { InstructionsToNurseComponent } from './instructions-to-nurse/instructions-to-nurse.component';
import { ViewapprovalrequestComponent } from './viewapprovalrequest/viewapprovalrequest.component';
// import { MedicalAssessmentComponent } from './medical-assessment/medical-assessment.component';
// import { MedicalAssessmentObstericComponent } from './medical-assessment-obsteric/medical-assessment-obsteric.component';
// import { MedicalAssessmentPediaComponent } from './medical-assessment-pedia/medical-assessment-pedia.component';
import { MedicalAssessmentSurgicalComponent } from './medical-assessment-surgical/medical-assessment-surgical.component';
import { OtModule } from '../ot/ot.module';
// import { CardiologyAssessmentComponent } from './cardiology-assessment/cardiology-assessment.component';
// import { AnesthesiaAssessmentComponent } from './anesthesia-assessment/anesthesia-assessment.component';
import { PatientAlertsComponent } from './patient-alerts/patient-alerts.component';
import { MedicalCertificateComponent } from './medical-certificate/medical-certificate.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ParentalCareInitialComponent } from './parental-care-initial/parental-care-initial.component';
import { PulmonologyDiseasesOpdnoteComponent } from './pulmonology-diseases-opdnote/pulmonology-diseases-opdnote.component';
import { DoctorCasesheetComponent } from './doctor-casesheet/doctor-casesheet.component';
import { PreAnesthesiaAssessmentComponent } from './pre-anesthesia-assessment/pre-anesthesia-assessment.component';
import { DoctorDiagnosisComponent } from './doctor-diagnosis/doctor-diagnosis.component';
import { DoctorRequestsComponent } from './doctor-requests/doctor-requests.component';
import { WardModule } from '../ward/ward.module';
import { AntibioticComponent } from './antibiotic/antibiotic.component';
import { TemplatesModule } from '../templates/templates.module';
import { AnesthetiaWorklistComponent } from './anesthetia-worklist/anesthetia-worklist.component';
import { OpProgressNotesComponent } from './op-progress-notes/op-progress-notes.component';


@NgModule({
  declarations: [
    AppointmentComponent,
     VideoConsultationComponent, DoctorAppointmentsComponent, PatientDetailsComponent, 
     PatientsummaryComponent, PrescriptionComponent, PatientCasesheetComponent,
    TreePipe,
    SelectGroupDirective,
    CheckChildrenDirective,
    IdcSearchComponent,
    DiagnosisComponent,
    AdviceComponent,
    TypesOfPrecautionsComponent,
    OthersReportsComponent,
    OthersAdverseComponent,
    MarkerComponent,
    DynamicWidthDirective,
    DischargeSummaryComponent,
    QuickOrdersComponent,
    PulmonologyDiseasesComponent,
    SickleaveComponent,
    //InstructionsToNurseComponent,
    ViewapprovalrequestComponent,
    // MedicalAssessmentComponent,
    // MedicalAssessmentObstericComponent,
    // MedicalAssessmentPediaComponent,
    MedicalAssessmentSurgicalComponent,
    // CardiologyAssessmentComponent,
    // AnesthesiaAssessmentComponent,
    PatientAlertsComponent,
    MedicalCertificateComponent,
    ParentalCareInitialComponent,
    PulmonologyDiseasesOpdnoteComponent,
    DoctorCasesheetComponent,
    PreAnesthesiaAssessmentComponent,
    DoctorDiagnosisComponent,
    DoctorRequestsComponent,
    AntibioticComponent,
    AnesthetiaWorklistComponent,
    OpProgressNotesComponent,    
  ],
  providers: [MatDatepickerModule, DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    PortalRoutingModule,
    FormsModule,
    SharedModule,
    OtModule,
    TreeviewModule.forRoot(),
    AngularEditorModule,
    WardModule,
    TemplatesModule
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
    MatTooltipModule
  ],
})
export class PortalModule { }
