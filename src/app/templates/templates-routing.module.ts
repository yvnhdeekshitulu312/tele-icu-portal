import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplatesComponent } from './templates.component';
import { TemplatesLandingComponent } from './templates-landing/templates-landing.component';
import { AuthguardGuard } from '../authguard.guard';

const routes: Routes = [
  {
    path: '', component: TemplatesComponent, children: [
      { path: '', component: TemplatesLandingComponent, canActivate: [AuthguardGuard], },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplatesRoutingModule { }
