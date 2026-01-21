import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { AuthguardGuard } from '../authguard.guard';
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

const routes: Routes = [
  {
    path: '', component: ReportsComponent, children: [
      { path: '', component: StatisticsComponent, canActivate: [AuthguardGuard] },
      { path: 'dashboard', component: ReportDashboardComponent, canActivate: [AuthguardGuard] },
      { path: 'revenue', component: RevenueComponent, canActivate: [AuthguardGuard] },
      { path: 'rates-dashboard', component: RateDashboardComponent, canActivate: [AuthguardGuard] },
      { path: 'er-dashboard', component: ErDashboardComponent, canActivate: [AuthguardGuard] },
      { path: 'radiology-dashboard', component: RadiologyDashboardComponent, canActivate: [AuthguardGuard] },
      { path: 'laboratory-dashboard', component: LaboratotyDashboardComponent, canActivate: [AuthguardGuard] },
      { path: 'operation-dashboard', component: OperationDashboardComponent, canActivate: [AuthguardGuard] },
      { path: 'population-dashboard', component: PopulationDashboardComponent, canActivate: [AuthguardGuard] },
      { path: 'external-dashboard', component: ExternalDashboardComponent, canActivate: [AuthguardGuard] },
      { path: 'pharmacy-dashboard', component: PharmacyDashboardComponent, canActivate: [AuthguardGuard] },
      { path: 'prescription-dashboard', component: PrescriptionDashboardComponent, canActivate: [AuthguardGuard] },
      { path: 'sales-dashboard', component: SalesDashboardComponent, canActivate: [AuthguardGuard] },
      { path: 'ipc-dashboard', component: IpcDashboardComponent, canActivate: [AuthguardGuard] },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
