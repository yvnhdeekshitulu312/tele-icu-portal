import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SsrsComponent } from './ssrs.component';
import { SsrsRoutingModule } from './ssrs.routing.module';
import { SsrsReportComponent } from './ssrs-report/ssrs-report.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SsrsReportConfigComponent } from './ssrs-reports-config/ssrs-report-config.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMomentDateModule } from "@angular/material-moment-adapter";

@NgModule({
  declarations: [
    SsrsComponent,
    SsrsReportComponent,
    SsrsReportConfigComponent
  ],
  providers: [MatDatepickerModule, DatePipe],
  imports: [
    CommonModule,
    SsrsRoutingModule,
    SharedModule,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
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
  ],
  exports: []
})
export class SsrsModule { }
