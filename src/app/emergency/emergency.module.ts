import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CheckboxControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { EmergencyRoutingModule } from './emergency-routing.module';
import { VisualtriageComponent } from './visualtriage/visualtriage.component';
import { EmergencyHeaderComponent } from './emergency-header/emergency-header.component';
import { WorklistComponent } from './worklist/worklist.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { EmergencyComponent } from './emergency.component';
import { TriageVitalsComponent } from './triage-vitals/triage-vitals.component';
import { EmrBedsComponent } from './emr-beds/emr-beds.component';
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
import { EmrHodWorklistComponent } from './emr-hod-worklist/emr-hod-worklist.component';
import { WardModule } from '../ward/ward.module';


@NgModule({
  declarations: [
    EmergencyComponent,
    VisualtriageComponent,
    EmergencyHeaderComponent,
    WorklistComponent,
    TriageVitalsComponent,
    EmrBedsComponent,
    EmrHodWorklistComponent
  ],
  providers: [MatDatepickerModule, DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmergencyRoutingModule,
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
    WardModule
  ]
})
export class EmergencyModule { }
