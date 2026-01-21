import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OtDashboardComponent } from './ot-dashboard/ot-dashboard.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from '../shared/shared.module';
import { OtRoutingModule } from './ot-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { OtHeaderComponent } from './ot-header/ot-header.component';
import { OtDoctorappointmentComponent } from './ot-doctorappointment/ot-doctorappointment.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { OtSurgerynotesComponent } from './ot-surgerynotes/ot-surgerynotes.component';
import { SurgeryrecordComponent } from './surgeryrecord/surgeryrecord.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SurgicalSafetyChecklistComponent } from './surgical-safety-checklist/surgical-safety-checklist.component';
import { OrChargesComponent } from './or-charges/or-charges.component';
import { DischargeFollowupsComponent } from './discharge-followups/discharge-followups.component';
import { OrNursesComponent } from './or-nurses/or-nurses.component';


@NgModule({
  declarations: [
    OtDashboardComponent,
    OtHeaderComponent,
    OtDoctorappointmentComponent,
    OtSurgerynotesComponent,
    SurgeryrecordComponent,
    SurgicalSafetyChecklistComponent,
    OrChargesComponent,
    DischargeFollowupsComponent,
    OrNursesComponent
  ],
  providers: [MatDatepickerModule, DatePipe],
  imports: [
    CommonModule,
    SharedModule,
    OtRoutingModule,
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
    CarouselModule,
    NgxDaterangepickerMd.forRoot()
  ],
  exports: [
    OtDoctorappointmentComponent
  ]
})
export class OtModule { }
