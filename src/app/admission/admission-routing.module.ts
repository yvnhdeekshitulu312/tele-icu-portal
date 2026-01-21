import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdmissionComponent } from './admission.component';
import { AdmissionrequestsComponent } from './admissionrequests/admissionrequests.component';
import { PatientadmissionComponent } from './patientadmission/patientadmission.component';
import { UpdateBillableBedTypeComponent } from './update-billable-bed-type/update-billable-bed-type.component';
import { DischargeIntimationsComponent } from './discharge-intimations/discharge-intimations.component';
import { AuthguardGuard } from '../authguard.guard';
import { DischargeIntimationComponent } from './discharge-intimation/discharge-intimation.component';
import { AdmissionAssignmentWorklistComponent } from './admission-assignment-worklist/admission-assignment-worklist.component';

const routes: Routes = [
  {
    path: '', component: AdmissionComponent, children: [
      { path: '', component: AdmissionComponent, canActivate: [AuthguardGuard] },
      { path: 'admissionrequests', component: AdmissionrequestsComponent, canActivate: [AuthguardGuard] },
      { path: 'patientadmission', component: PatientadmissionComponent, canActivate: [AuthguardGuard] },
      { path: 'update-billable-bed-type', component: UpdateBillableBedTypeComponent, canActivate: [AuthguardGuard] },
      { path: 'discharge-intimations', component: DischargeIntimationsComponent, canActivate: [AuthguardGuard] },
      { path: 'dischargeintimation', component: DischargeIntimationComponent, canActivate: [AuthguardGuard] },
      { path: 'admission-assignment-worklist', component: AdmissionAssignmentWorklistComponent, canActivate: [AuthguardGuard] },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdmissionRoutingModule { }
