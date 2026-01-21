import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AkuWorklistComponent } from './aku-worklist/aku-worklist.component';
import { AkuVitalsComponent } from './aku-vitals/aku-vitals.component';
import { DialysisComponent } from './dialysis.component';
import { AkuAppointmentComponent } from './aku-appointment/aku-appointment.component';
import { AuthguardGuard } from '../authguard.guard';
import { DaycareAdmissionComponent } from './daycareadmission/daycareadmission.component';

const routes: Routes = [
  {
    path: '', component: DialysisComponent, children: [
      { path: 'aku-worklist', component: AkuWorklistComponent, canActivate: [AuthguardGuard] },
      { path: 'aku-vitals', component: AkuVitalsComponent, canActivate: [AuthguardGuard] },
      { path: 'aku-appointment', component: AkuAppointmentComponent, canActivate: [AuthguardGuard] },
      { path: 'daycareadmission', component: DaycareAdmissionComponent, canActivate: [AuthguardGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DialysisRoutingModule { }
