import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { SharedModule } from '../shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ReportDashboardComponent } from './report-dashboard/report-dashboard.component';
import { RevenueComponent } from './revenue/revenue.component';
import { RateDashboardComponent } from './rate-dashboard/rate-dashboard.component';
import { ErDashboardComponent } from './er-dashboard/er-dashboard.component';
import { RadiologyDashboardComponent } from './radiology-dashboard/radiology-dashboard.component';
import { LaboratotyDashboardComponent } from './laboratoty-dashboard/laboratoty-dashboard.component';
import { OperationDashboardComponent } from './operation-dashboard/operation-dashboard.component';
import { PopulationDashboardComponent } from './population-dashboard/population-dashboard.component';
import { ExternalDashboardComponent } from './external-kpi-dashboard/external-kpi-dashboard.component';
import { PharmacyDashboardComponent } from './pharmacy-dashboard/pharmacy-dashboard.component';
import { IpcDashboardComponent } from './ipc-dashboard/ipc-dashboard.component';
import { PrescriptionDashboardComponent } from './prescription-dashboard/prescription-dashboard.component';
import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';

@NgModule({
  declarations: [
    ReportDashboardComponent,
    RevenueComponent,
    RateDashboardComponent,
    ErDashboardComponent,
    RadiologyDashboardComponent,
    LaboratotyDashboardComponent,
    OperationDashboardComponent,
    PopulationDashboardComponent,
    ExternalDashboardComponent,
    PharmacyDashboardComponent,
    IpcDashboardComponent,
    PrescriptionDashboardComponent,
    SalesDashboardComponent
  ],
  providers: [MatDatepickerModule, DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ReportsRoutingModule,
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
    NgApexchartsModule
  ]
})
export class ReportsModule { }
