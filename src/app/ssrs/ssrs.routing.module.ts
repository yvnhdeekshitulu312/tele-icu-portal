import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SsrsComponent } from './ssrs.component';
import { SsrsReportComponent } from './ssrs-report/ssrs-report.component';
import { AuthguardGuard } from '../authguard.guard';
import { SsrsReportConfigComponent } from './ssrs-reports-config/ssrs-report-config.component';

const routes: Routes = [
  {
    path: '', component: SsrsComponent, children: [
       { path: 'report/:moduleId', component: SsrsReportComponent, canActivate: [AuthguardGuard] },
       { path: 'config', component: SsrsReportConfigComponent, canActivate: [AuthguardGuard] },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SsrsRoutingModule { }