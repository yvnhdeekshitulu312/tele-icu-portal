import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanDeactivateGuard } from '../can-deactivate.guard';
import { PreOpChecklistComponent } from './pre-op-checklist/pre-op-checklist.component';
import { SharedComponent } from './shared.component';
import { PrimaryDoctorChangeComponent } from './primary-doctor-change/primary-doctor-change.component';
import { AlertComponent } from './alert/alert.component';
import { AuthguardGuard } from '../authguard.guard';
import { PatientEformsComponent } from './patient-eforms/patient-eforms.component';
import { InPatientDischargeSummaryComponent } from './inpatient-discharge-summary/inpatient-discharge-summary.component';
import { MedicalReportComponent } from './medical-report/medical-report.component';
import { Coding3mWorklistComponent } from './3m-coding-worklist/3m-coding-worklist.component';
import { ScanDocumentsComponent } from './scan-documents/scan-documents.component';
import { DoctorappointmentsComponent } from './doctorappointments/doctorappointments.component';
import { PatientfoldermlComponent } from './patientfolderml/patientfolderml.component';
import { EformPeriodComponent } from './eform-period/eform-period.component';
import { SickLeaveOPDApprovalComponent } from './sick-leave-opd-approval/sick-leave-opd-approval.component';
import { SickLeaveMedApprovalComponent } from './sick-leave-med-approval/sick-leave-med-approval.component';
import { PendingReportsWorklistComponent } from './pending-reports-worklist/pending-reports-worklist.component';
import { CoordinatorWorklistComponent } from './coordinator-worklist/coordinator-worklist.component';
import { ReferredToMeComponent } from './referred-to-me/referred-to-me.component';
import { PhysioReferralWorklistComponent } from './physio-referral-worklist/physio-referral-worklist.component';
import { ChiDischargesummaryComponent } from './chi-dischargesummary/chi-dischargesummary.component';
import { PatSummaryComponent } from './pat-summary/pat-summary.component';

const routes: Routes = [
  {
    path: '', component: SharedComponent, children: [
      { path: 'pre-op-checklist', component: PreOpChecklistComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'patientfolder', component: PatientfoldermlComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'patientfolderml', component: PatientfoldermlComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'primarydoctor', component: PrimaryDoctorChangeComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'alert', component: AlertComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'patienteforms', component: PatientEformsComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'dischargeSummary', component: InPatientDischargeSummaryComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'medicalReport', component: MedicalReportComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: '3mworklist', component: Coding3mWorklistComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'scanDocuments', component: ScanDocumentsComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'doctorappointments', component: DoctorappointmentsComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'eformperiod', component: EformPeriodComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'sickLeaveOPDApproval', component: SickLeaveOPDApprovalComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'sickLeaveMedApproval', component: SickLeaveMedApprovalComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'pendingReportsWorklist', component: PendingReportsWorklistComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'coordinatorWorklist', component: CoordinatorWorklistComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'referredToMe', component: ReferredToMeComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'physioReferralWorklist', component: PhysioReferralWorklistComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'chi-dischargeSummary', component: ChiDischargesummaryComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
      { path: 'pat-summary', component: PatSummaryComponent, canActivate: [AuthguardGuard], canDeactivate: [CanDeactivateGuard] },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedRoutingModule { } 
