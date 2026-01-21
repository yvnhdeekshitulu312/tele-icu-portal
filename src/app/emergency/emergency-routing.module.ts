import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisualtriageComponent } from './visualtriage/visualtriage.component';
import { WorklistComponent } from './worklist/worklist.component';
import { EmergencyComponent } from './emergency.component';
import { TriageVitalsComponent } from './triage-vitals/triage-vitals.component';
import { EmrBedsComponent } from './emr-beds/emr-beds.component';
import { EmrHodWorklistComponent } from './emr-hod-worklist/emr-hod-worklist.component';
import { AuthguardGuard } from '../authguard.guard';

const routes: Routes = [
  {
    path: '', component: EmergencyComponent, children: [
      { path: '', component: WorklistComponent, canActivate: [AuthguardGuard] },
      { path: 'visualtriage', component: VisualtriageComponent, canActivate: [AuthguardGuard] },
      { path: 'worklist', component: WorklistComponent, canActivate: [AuthguardGuard] },
      { path: 'emr-hod-worklist', component: EmrHodWorklistComponent, canActivate: [AuthguardGuard] },
      { path: 'triagevitals', component: TriageVitalsComponent, canActivate: [AuthguardGuard] },
      { path: 'beds', component: EmrBedsComponent, canActivate: [AuthguardGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmergencyRoutingModule { }
