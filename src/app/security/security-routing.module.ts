import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecurityComponent } from './security.component';
import { AuthguardGuard } from '../authguard.guard';
import { SecurityOptionsComponent } from './security-options/security-options.component';

const routes: Routes = [
    {
        path: '', 
        component: SecurityComponent, 
        children: [
            { path: 'options', component: SecurityOptionsComponent, canActivate: [AuthguardGuard] }
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }