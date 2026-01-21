import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthguardGuard } from '../authguard.guard';
import { MastersComponent } from './masters.component';
import { MastersLandingComponent } from './masters-landing/masters-landing.component';
import { TestDefinitionComponent } from './test-definition/test-definition.component';
import { TestSpecimenComponent } from './test-specimen/test-specimen.component';

const routes: Routes = [
  {
    path: '', component: MastersComponent, children: [
      { path: '', component: MastersLandingComponent, canActivate: [AuthguardGuard], },
      { path: 'testdefinition', component: TestDefinitionComponent, canActivate: [AuthguardGuard], },
      { path: 'testspecimen', component: TestSpecimenComponent, canActivate: [AuthguardGuard], },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MastersRoutingModule { }