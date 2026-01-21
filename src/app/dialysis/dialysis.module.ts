import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { DialysisRoutingModule } from './dialysis-routing.module';
import { DialysisComponent } from './dialysis.component';
import { AkuWorklistComponent } from './aku-worklist/aku-worklist.component';
import { SharedModule } from '../shared/shared.module';
import { AkuHeaderComponent } from './aku-header/aku-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AkuVitalsComponent } from './aku-vitals/aku-vitals.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { AkuAppointmentComponent } from './aku-appointment/aku-appointment.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { DaycareAdmissionComponent } from './daycareadmission/daycareadmission.component';
import { DaycarevisualtriageComponent } from './daycarevisualtriage/daycarevisualtriage.component';


@NgModule({
  declarations: [
    DialysisComponent,
    AkuWorklistComponent,
    AkuHeaderComponent,
    AkuVitalsComponent,
    AkuAppointmentComponent,
    DaycareAdmissionComponent,
    DaycarevisualtriageComponent
  ],
  providers: [MatDatepickerModule, DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialysisRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    DialysisRoutingModule,
    SharedModule,
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
    CarouselModule
  ]
})
export class DialysisModule { }
