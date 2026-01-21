import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CheckboxControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
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
import { BedsComponent } from './beds/beds.component';
import { WardRoutingModule } from './ward-routing.module';
import { IpvitalsComponent } from './ipvitals/ipvitals.component';
import { LabTrendComponent } from './lab-trend/lab-trend.component';
import { ProgressNoteComponent } from './progress-note/progress-note.component';
import { PatientAssessmentToolComponent } from './patient-assessment-tool/patient-assessment-tool.component';
import { EndoscopeComponent } from './endoscope/endoscope.component';
import { SharedModule } from '../shared/shared.module';
import { AdmissionreconciliationComponent } from './admissionreconciliation/admissionreconciliation.component';
import { ShiftHandoverComponent } from './shift-handover/shift-handover.component';
import { BedTransfereRequestComponent } from './bed-transfere-request/bed-transfere-request.component';
import { DischargereconciliationComponent } from './dischargereconciliation/dischargereconciliation.component';
import { DrugAdministrationComponent } from './drug-administration/drug-administration.component';
import { NursingdashboardComponent } from './nursingdashboard/nursingdashboard.component';
import { SampleCollectionComponent } from './sample-collection/sample-collection.component';
import { UpdateBedstatusComponent } from './update-bedstatus/update-bedstatus.component';
import { MothermilkextractionComponent } from './mothermilkextraction/mothermilkextraction.component';
import { MothermilkfeedingComponent } from './mothermilkfeeding/mothermilkfeeding.component';
import { IntakeoutputComponent } from './intakeoutput/intakeoutput.component';
import { WardnursingdashboardComponent } from './wardnursingdashboard/wardnursingdashboard.component';
import { BedtransferComponent } from './bedtransfer/bedtransfer.component';
import { ProcedureOrderComponent } from './procedure-order/procedure-order.component';
import { DietchartWorklistComponent } from './dietchart-worklist/dietchart-worklist.component';
import { MedicationErrorComponent } from './medication-error/medication-error.component';
import { IpIssuesComponent } from './ip-issues/ip-issues.component';
import { IpReturnsComponent } from './ip-returns/ip-returns.component';
import { IcuProgressnotesComponent } from './icu-progressnotes/icu-progressnotes.component';
import { LongtermAdultcareunitComponent } from './longterm-adultcareunit/longterm-adultcareunit.component';
import { DietPlanWorklistComponent } from './diet-plan-worklist/diet-plan-worklist.component';
import { MedicalEmergencyEventsComponent } from './medical-emergency-events/medical-emergency-events.component';
import { IcuProgressnotesNewComponent } from './icu-progressnotes-new/icu-progressnotes-new.component';
import { CarePlanComponent } from './care-plan/care-plan.component';
import { HospitalEventsComponent } from './hospital-events/hospital-events.component';
import { DischargeCasesComponent } from './discharge-cases/discharge-cases.component';
import { ICUBedsComponent } from './iccu-beds/icu-beds.component';


@NgModule({
  declarations: [
    BedsComponent,
    IpvitalsComponent,
    LabTrendComponent,
    ProgressNoteComponent,
    PatientAssessmentToolComponent,
    EndoscopeComponent,
    AdmissionreconciliationComponent,
    ShiftHandoverComponent,
    BedTransfereRequestComponent,
    DischargereconciliationComponent,
    DrugAdministrationComponent,
    BedTransfereRequestComponent,
    NursingdashboardComponent,
    SampleCollectionComponent,
    UpdateBedstatusComponent,
    MothermilkextractionComponent,
    MothermilkfeedingComponent,
    IntakeoutputComponent,
    WardnursingdashboardComponent,
    BedtransferComponent,
    ProcedureOrderComponent,
    DietchartWorklistComponent,
    MedicationErrorComponent,
    IpIssuesComponent,
    IpReturnsComponent,
    IcuProgressnotesComponent,
    LongtermAdultcareunitComponent,
    DietPlanWorklistComponent,
    MedicalEmergencyEventsComponent,
    IcuProgressnotesNewComponent,
    CarePlanComponent,
    HospitalEventsComponent,
    DischargeCasesComponent,
    ICUBedsComponent
  ],
  providers: [MatDatepickerModule, DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    WardRoutingModule,
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
    SharedModule
  ],
  exports: [
    PatientAssessmentToolComponent,
    AdmissionreconciliationComponent,
    DischargereconciliationComponent
  ]
})
export class WardModule { }
