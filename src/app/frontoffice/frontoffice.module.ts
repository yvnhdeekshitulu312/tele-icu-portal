import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrontofficeRoutingModule } from './frontoffice-routing.module';
import { FrontofficeComponent } from './frontoffice.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ResourceAvailabilityConfigurationComponent } from './resource-availability-configuration/resource-availability-configuration.component';
import { ResourceblockingComponent } from './resourceblocking/resourceblocking.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ProcedureappointmentComponent } from './procedureappointment/procedureappointment.component';
import { PhysioResourceAvailabilityConfigComponent } from './physio-resource-availability-config/physio-resource-availability-config.component';
import { FindPatientComponent } from './find-patient/find-patient.component';
import { InvestigationappointmentComponent } from './investigationappointment/investigationappointment.component';
import { RadiologyAppointmentsWorklistComponent } from './radiology-appointments-worklist/radiology-appointments-worklist.component';
import { PhysiotherapyAppointmentsWorklistComponent } from './physiotherapy-appointments-worklist/physiotherapy-appointments-worklist.component';
import { BlockedAppointmentsWorklistComponent } from './blocked-appointments-worklist/blocked-appointments-worklist.component';
import { NeurologyAppointmentComponent } from './neurology-appointment/neurology-appointment.component';
import { PinBlockPatientComponent } from './pin-block/pin-block.component';

@NgModule({
  declarations: [
    FrontofficeComponent,
    ResourceAvailabilityConfigurationComponent,
    ResourceblockingComponent,
    ProcedureappointmentComponent,
    PhysioResourceAvailabilityConfigComponent,
    FindPatientComponent,
    InvestigationappointmentComponent,
    RadiologyAppointmentsWorklistComponent,
    PhysiotherapyAppointmentsWorklistComponent,
    BlockedAppointmentsWorklistComponent,
    NeurologyAppointmentComponent,
    PinBlockPatientComponent
  ],
  imports: [
    CommonModule,
    FrontofficeRoutingModule,
    ReactiveFormsModule,
    FormsModule,
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
    CarouselModule
  ]
})
export class FrontofficeModule { }
