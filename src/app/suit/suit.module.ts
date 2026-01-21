import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuitDashboardComponent } from './suit-dashboard/suit-dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SuitRoutingModule } from './suit-routing.module';
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
import { SharedModule } from '../shared/shared.module';
import { PhlebotomyDashboardComponent } from './phlebotomy-dashboard/phlebotomy-dashboard.component';
import { LabworklistComponent } from './labworklist/labworklist.component';
import { RadiologyWorklistComponent } from './suit/radiology-worklist/radiology-worklist.component';
import { UpdatedBedsComponent } from './updated-beds/updated-beds.component';
import { RadiologyResultentryComponent } from './radiology-resultentry/radiology-resultentry.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { LabResultentryComponent } from './lab-resultentry/lab-resultentry.component';
import { LabBulkverificationComponent } from './lab-bulkverification/lab-bulkverification.component';
import { ResultsTemplateComponent } from './results-template/results-template.component';
import { PhysiotherapyWorklistComponent } from './physiotherapy-worklist/physiotherapy-worklist.component';
import { PhysiotherapyResultentryComponent } from './physiotherapy-resultentry/physiotherapy-resultentry.component';
import { LabResultReleaseComponent } from './lab-result-release/lab-result-release.component';
import { SharedWorklistComponent } from './shared-worklist/shared-worklist.component';
import { FoodOrderInpatientComponent } from './food-order-inpatient/food-order-inpatient.component';
import { RadiologyAppointmentComponent } from './radiology-appointment/radiology-appointment.component';
import { ReferenceRangesComponent } from './reference-ranges/reference-ranges.component';
import { BulkResultsVerificationComponent } from './bulk-results-verification/bulk-results-verification.component';
import { EmployeewiseWorklistComponent } from './employeewise-worklist/employeewise-worklist.component';
import { ScheduleReportsComponent } from './schedule-reports/schedule-reports.component';
import { RadiologyScheduleReportsComponent } from './radiology-schedule-reports/radiology-schedule-reports.component';
import { TestComponentsComponent } from './test-components/test-components.component';
import { TestComponentWordComponent } from './test-component-word/test-component-word.component';

@NgModule({
  declarations: [
    SuitDashboardComponent,
    PhlebotomyDashboardComponent,
    LabworklistComponent,
    RadiologyWorklistComponent,
    UpdatedBedsComponent,
    RadiologyResultentryComponent,
    LabResultentryComponent,
    LabBulkverificationComponent,
    ResultsTemplateComponent,
    PhysiotherapyWorklistComponent,
    PhysiotherapyResultentryComponent,
    LabResultReleaseComponent,
    SharedWorklistComponent,
    FoodOrderInpatientComponent, 
    RadiologyAppointmentComponent,
    ReferenceRangesComponent,
    BulkResultsVerificationComponent,
    EmployeewiseWorklistComponent,
    ScheduleReportsComponent,
    RadiologyScheduleReportsComponent,
    TestComponentsComponent,
    TestComponentWordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SuitRoutingModule,
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
    SharedModule,
    AngularEditorModule,
    //MatCheckboxModule
  ]
})
export class SuitModule { }
