import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontofficeComponent } from './frontoffice.component';
import { ResourceAvailabilityConfigurationComponent } from './resource-availability-configuration/resource-availability-configuration.component';
import { DoctorappointmentComponent } from './doctorappointment/doctorappointment.component';
import { ResourceblockingComponent } from './resourceblocking/resourceblocking.component';
import { ProcedureappointmentComponent } from './procedureappointment/procedureappointment.component';
import { PhysioResourceAvailabilityConfigComponent } from './physio-resource-availability-config/physio-resource-availability-config.component';
import { AuthguardGuard } from '../authguard.guard';
import { FutureAppointmentsWorklistComponent } from './future-appointments-worklist/future-appointments-worklist.component';
import { findPatient, FindPatientComponent } from './find-patient/find-patient.component';
import { InvestigationappointmentComponent } from './investigationappointment/investigationappointment.component';
import { RadiologyAppointmentsWorklistComponent } from './radiology-appointments-worklist/radiology-appointments-worklist.component';
import { PhysiotherapyAppointmentsWorklistComponent } from './physiotherapy-appointments-worklist/physiotherapy-appointments-worklist.component';
import { BlockedAppointmentsWorklistComponent } from './blocked-appointments-worklist/blocked-appointments-worklist.component';
import { NeurologyAppointmentComponent } from './neurology-appointment/neurology-appointment.component';
import { PinBlockPatientComponent } from './pin-block/pin-block.component';

const routes: Routes = [
  {
    path: '', component: FrontofficeComponent, children: [
      { path: '', component: FrontofficeComponent, canActivate: [AuthguardGuard] },
      { path: 'resourceavailabilityconfig', component: ResourceAvailabilityConfigurationComponent, canActivate: [AuthguardGuard] },
      { path: 'doctorappointment', component: DoctorappointmentComponent, canActivate: [AuthguardGuard] },
      { path: 'resourceblocking', component: ResourceblockingComponent, canActivate: [AuthguardGuard] },
      { path: 'procedureappointment', component: ProcedureappointmentComponent, canActivate: [AuthguardGuard] },
      { path: 'investigationappointment', component: InvestigationappointmentComponent, canActivate: [AuthguardGuard] },
      { path: 'physioresourceavailabilityconfig', component: PhysioResourceAvailabilityConfigComponent, canActivate: [AuthguardGuard] },
      { path: 'futureappointmentworklist', component: FutureAppointmentsWorklistComponent, canActivate: [AuthguardGuard] },
      { path: 'findpatient', component: FindPatientComponent, canActivate: [AuthguardGuard] },
      { path: 'radiologyappointmentsworklist', component: RadiologyAppointmentsWorklistComponent, canActivate: [AuthguardGuard] },
      { path: 'physiotherapyappointmentsworklist', component: PhysiotherapyAppointmentsWorklistComponent, canActivate: [AuthguardGuard] },
      { path: 'blockedappointmentworklist', component: BlockedAppointmentsWorklistComponent, canActivate: [AuthguardGuard] },
      { path: 'neurologyappointment', component: NeurologyAppointmentComponent, canActivate: [AuthguardGuard] },
      { path: 'pinblock', component: PinBlockPatientComponent, canActivate: [AuthguardGuard] },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontofficeRoutingModule { }
