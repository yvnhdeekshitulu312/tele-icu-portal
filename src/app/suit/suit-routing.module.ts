import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhlebotomyDashboardComponent } from './phlebotomy-dashboard/phlebotomy-dashboard.component';
import { SuitComponent } from './suit.component';
import { SuitDashboardComponent } from './suit-dashboard/suit-dashboard.component';
import { LabworklistComponent } from './labworklist/labworklist.component';
import { RadiologyWorklistComponent } from './suit/radiology-worklist/radiology-worklist.component';
import { UpdatedBedsComponent } from './updated-beds/updated-beds.component';
import { RadiologyResultentryComponent } from './radiology-resultentry/radiology-resultentry.component';
import { LabResultentryComponent } from './lab-resultentry/lab-resultentry.component';
import { LabBulkverificationComponent } from './lab-bulkverification/lab-bulkverification.component';
import { ResultsTemplateComponent } from './results-template/results-template.component';
import { AuthguardGuard } from '../authguard.guard';
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

const routes: Routes = [
  {
    path: '', component: SuitComponent, children: [
      { path: '', component: SuitDashboardComponent, canActivate: [AuthguardGuard], },
      { path: 'phlebotomy', component: PhlebotomyDashboardComponent, canActivate: [AuthguardGuard], },
      { path: 'labworklist', component: LabworklistComponent, canActivate: [AuthguardGuard], },
      { path: 'radiologyworklist', component: RadiologyWorklistComponent, canActivate: [AuthguardGuard], },
      { path: 'UpdateBedStatus', component: UpdatedBedsComponent, canActivate: [AuthguardGuard], },
      { path: 'radiology-resultentry', component: RadiologyResultentryComponent, canActivate: [AuthguardGuard], },
      { path: 'lab-resultentry', component: LabResultentryComponent, canActivate: [AuthguardGuard], },
      { path: 'lab-bulkverification', component: LabBulkverificationComponent, canActivate: [AuthguardGuard], },
      { path: 'resultstemplate', component: ResultsTemplateComponent, canActivate: [AuthguardGuard], },
      { path: 'physiotherapyworklist', component: PhysiotherapyWorklistComponent, canActivate: [AuthguardGuard], },
      { path: 'physiotherapy-resultentry', component: PhysiotherapyResultentryComponent, canActivate: [AuthguardGuard], },
      { path: 'LabResultRelease', component: LabResultReleaseComponent, canActivate: [AuthguardGuard], },
      { path: 'worklist', component: SharedWorklistComponent, canActivate: [AuthguardGuard], },
      { path: 'foodorders', component: FoodOrderInpatientComponent, canActivate: [AuthguardGuard] },
      { path: 'RadiologyAppointment', component: RadiologyAppointmentComponent, canActivate: [AuthguardGuard] },
      { path: 'referenceranges', component: ReferenceRangesComponent, canActivate: [AuthguardGuard] },
      { path: 'bulkResultsVerification', component: BulkResultsVerificationComponent, canActivate: [AuthguardGuard] },
      { path: 'employeewise-worklist', component: EmployeewiseWorklistComponent, canActivate: [AuthguardGuard] },
      { path: 'schedule-reports', component: ScheduleReportsComponent, canActivate: [AuthguardGuard] },
      { path: 'rad-schedule-reports', component: RadiologyScheduleReportsComponent, canActivate: [AuthguardGuard] },
      { path: 'test-components', component: TestComponentsComponent, canActivate: [AuthguardGuard] },
      { path: 'test-component-word', component: TestComponentWordComponent, canActivate: [AuthguardGuard] },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuitRoutingModule { }
