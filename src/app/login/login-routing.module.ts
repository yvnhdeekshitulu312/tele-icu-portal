import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { AuthguardGuard } from '../authguard.guard';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'changepassword', component: ChangepasswordComponent, canActivate: [AuthguardGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
