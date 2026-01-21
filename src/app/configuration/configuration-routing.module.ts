import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigurationComponent } from './configuration.component';
import { BedsboardFeaturesConfigComponent } from './bedsboard-features-config/bedsboard-features-config.component';
import { AuthguardGuard } from '../authguard.guard';

const routes: Routes = [
  {
      path: '', component: ConfigurationComponent, children: [
          { path: 'bedsboardfeaturesconfig', component: BedsboardFeaturesConfigComponent, canActivate: [AuthguardGuard], },
      ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
