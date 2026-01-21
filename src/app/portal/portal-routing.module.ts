import { PortalComponent } from './portal.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { VideoConsultationComponent } from './video-consultation/video-consultation.component';
import { DoctorAppointmentsComponent } from './doctor-appointments/doctor-appointments.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { PatientsummaryComponent } from './patientsummary/patientsummary.component';
import { SummaryComponent } from './summary/summary.component';
import { PrescriptionComponent } from './prescription/prescription.component';
import { PatientCasesheetComponent } from './patient-casesheet/patient-casesheet.component';
import { OthersResultsComponent } from './others-results/others-results.component';
import { CanDeactivateGuard } from '../can-deactivate.guard';
import { PatientfolderComponent } from '../shared/patientfolder/patientfolder.component';
import { DoctorCasesheetComponent } from './doctor-casesheet/doctor-casesheet.component';
import { AuthguardGuard } from '../authguard.guard';
import { AnesthetiaWorklistComponent } from './anesthetia-worklist/anesthetia-worklist.component';
import { SickleaveComponent } from './sickleave/sickleave.component';
import { PatientAlertsComponent } from './patient-alerts/patient-alerts.component';
import { PatientfoldermlComponent } from '../shared/patientfolderml/patientfolderml.component';

const routes: Routes = [
  {
    path: '', component: PortalComponent, children: [
      { path: '', component: HomepageComponent, canActivate: [AuthguardGuard] },
      { path: 'appointment', loadChildren: () => import('../appointment/appointment.module').then(m => m.AppointmentModule), canActivate: [AuthguardGuard] },
      { path: 'video-consultation', component: VideoConsultationComponent, canActivate: [AuthguardGuard] },
      { path: 'appointments', component: DoctorAppointmentsComponent, canActivate: [AuthguardGuard] },
      { path: 'patients', component: PatientDetailsComponent, canActivate: [AuthguardGuard] },
      { path: 'patientsummary', component: PatientsummaryComponent, canActivate: [AuthguardGuard] },
      { path: 'summary', component: SummaryComponent, canActivate: [AuthguardGuard] },
      { path: 'prescription', component: PrescriptionComponent, canActivate: [AuthguardGuard] },
      { path: 'otherresults', component: OthersResultsComponent, canActivate: [AuthguardGuard] },
      { path: 'casesheet', component: PatientCasesheetComponent, canDeactivate: [CanDeactivateGuard], canActivate: [AuthguardGuard] },
      { path: 'doctorcasesheet', component: DoctorCasesheetComponent, canDeactivate: [CanDeactivateGuard], canActivate: [AuthguardGuard] },
      { path: 'patientfolder', component: PatientfoldermlComponent, canActivate: [AuthguardGuard] },
      { path: 'anesthetia-worklist', component: AnesthetiaWorklistComponent, canActivate: [AuthguardGuard] },
      { path: 'sickleave', component: SickleaveComponent, canActivate: [AuthguardGuard] },
      { path: 'patientalerts', component: PatientAlertsComponent, canActivate: [AuthguardGuard] }

    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalRoutingModule { }
