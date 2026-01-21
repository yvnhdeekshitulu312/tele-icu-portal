import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OtComponent } from './ot.component';
import { OtDashboardComponent } from './ot-dashboard/ot-dashboard.component';
import { OtDoctorappointmentComponent } from './ot-doctorappointment/ot-doctorappointment.component';
import { PreOpChecklistComponent } from '../shared/pre-op-checklist/pre-op-checklist.component';
import { OtSurgerynotesComponent } from './ot-surgerynotes/ot-surgerynotes.component';
import { SurgeryrecordComponent } from './surgeryrecord/surgeryrecord.component';
import { SurgicalSafetyChecklistComponent } from './surgical-safety-checklist/surgical-safety-checklist.component';
import { AuthguardGuard } from '../authguard.guard';
import { OrChargesComponent } from './or-charges/or-charges.component';
import { DischargeFollowupsComponent } from './discharge-followups/discharge-followups.component';
import { OrNursesComponent } from './or-nurses/or-nurses.component';

const routes: Routes = [
  {
    path: '', component: OtComponent, children: [
      { path: 'ot-dashboard', component: OtDashboardComponent, canActivate: [AuthguardGuard] },
      { path: 'ot-doctorappointments', component: OtDoctorappointmentComponent, canActivate: [AuthguardGuard] },
      { path: 'pre-op-checklist', component: PreOpChecklistComponent, canActivate: [AuthguardGuard] },
      { path: 'ot-surgerynotes', component: OtSurgerynotesComponent, canActivate: [AuthguardGuard] },
      { path: 'surgeryrecord', component: SurgeryrecordComponent, canActivate: [AuthguardGuard] },
      { path: 'surgical-safety-checklist', component: SurgicalSafetyChecklistComponent, canActivate: [AuthguardGuard] },
      { path: 'or-charges', component: OrChargesComponent, canActivate: [AuthguardGuard] },
      { path: 'or-nurses', component: OrNursesComponent, canActivate: [AuthguardGuard] },
      { path: 'discharge-followups', component: DischargeFollowupsComponent, canActivate: [AuthguardGuard] },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OtRoutingModule { }
