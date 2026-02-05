import { AuthguardGuard } from './authguard.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
  { path: 'home', loadChildren: () => import('./portal/portal.module').then(m => m.PortalModule), canActivate: [AuthguardGuard] },
  { path: 'ward', loadChildren: () => import('./ward/ward.module').then(m => m.WardModule), canActivate: [AuthguardGuard] },
  { path: 'suit', loadChildren: () => import('./suit/suit.module').then(m => m.SuitModule), canActivate: [AuthguardGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'ot', loadChildren: () => import('./ot/ot.module').then(m => m.OtModule), canActivate: [AuthguardGuard] },
  { path: 'shared', loadChildren: () => import('./shared/shared.module').then(m => m.SharedModule), canActivate: [AuthguardGuard] },
  { path: 'templates', loadChildren: () => import('./templates/templates.module').then(m => m.TemplatesModule), canActivate: [AuthguardGuard] },
  { path: 'administration', loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationModule), canActivate: [AuthguardGuard] },
  { path: 'portal', loadChildren: () => import('./portal/portal.module').then(m => m.PortalModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
