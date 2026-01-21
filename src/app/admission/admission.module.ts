import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdmissionRoutingModule } from './admission-routing.module';
import { AdmissionrequestsComponent } from './admissionrequests/admissionrequests.component';
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
import { PatientadmissionComponent } from './patientadmission/patientadmission.component';
import { UpdateBillableBedTypeComponent } from './update-billable-bed-type/update-billable-bed-type.component';
import { DischargeIntimationsComponent } from './discharge-intimations/discharge-intimations.component';
import { BedsAvailabilityComponent } from './beds-availability/beds-availability.component';
import { DischargeIntimationComponent } from './discharge-intimation/discharge-intimation.component';
import { PayerDetailsComponent } from './payer-details/payer-details.component';
import { AdmissionAssignmentWorklistComponent } from './admission-assignment-worklist/admission-assignment-worklist.component';


@NgModule({
  declarations: [
    AdmissionrequestsComponent,
    PatientadmissionComponent,
    UpdateBillableBedTypeComponent,
    DischargeIntimationsComponent,
    BedsAvailabilityComponent,
    DischargeIntimationComponent,
    PayerDetailsComponent,
    AdmissionAssignmentWorklistComponent
  ],
  imports: [
    CommonModule,
    AdmissionRoutingModule,
    CommonModule,
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
    SharedModule
  ]
})
export class AdmissionModule { }
