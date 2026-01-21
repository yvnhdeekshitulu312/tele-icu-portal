import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RcmNavModComponent } from './rcmnavmod.component';

const routes: Routes = [{ path: '', component: RcmNavModComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RcmRoutingModule {}
