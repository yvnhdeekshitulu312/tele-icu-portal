import { AuthguardGuard } from './authguard.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // { path: 'login', component: LoginComponent },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
  { path: 'home', loadChildren: () => import('./portal/portal.module').then(m => m.PortalModule), canActivate: [AuthguardGuard] },
  { path: 'ward', loadChildren: () => import('./ward/ward.module').then(m => m.WardModule), canActivate: [AuthguardGuard] },
  { path: 'suit', loadChildren: () => import('./suit/suit.module').then(m => m.SuitModule), canActivate: [AuthguardGuard] },
  { path: 'emergency', loadChildren: () => import('./emergency/emergency.module').then(m => m.EmergencyModule), canActivate: [AuthguardGuard] },
  { path: 'pharmacy', loadChildren: () => import('./pharmacy/pharmacy.module').then(m => m.PharmacyModule), canActivate: [AuthguardGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'frontoffice', loadChildren: () => import('./frontoffice/frontoffice.module').then(m => m.FrontofficeModule), canActivate: [AuthguardGuard] },
  { path: 'admission', loadChildren: () => import('./admission/admission.module').then(m => m.AdmissionModule), canActivate: [AuthguardGuard] },
  { path: 'ot', loadChildren: () => import('./ot/ot.module').then(m => m.OtModule), canActivate: [AuthguardGuard] },
  { path: 'shared', loadChildren: () => import('./shared/shared.module').then(m => m.SharedModule), canActivate: [AuthguardGuard] },
  { path: 'templates', loadChildren: () => import('./templates/templates.module').then(m => m.TemplatesModule), canActivate: [AuthguardGuard] },
  { path: 'dialysis', loadChildren: () => import('./dialysis/dialysis.module').then(m => m.DialysisModule), canActivate: [AuthguardGuard] },
  { path: 'administration', loadChildren: () => import('./administration/administration.module').then(m => m.AdministrationModule), canActivate: [AuthguardGuard] },
  { path: 'stats', loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule), canActivate: [AuthguardGuard] },
  { path: 'communications', loadChildren: () => import('./communications/communications.module').then(m => m.CommunicationsModule), canActivate: [AuthguardGuard] },
  { path: 'configuration', loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationModule), canActivate: [AuthguardGuard] },
  { path: 'security', loadChildren: () => import('./security/security.module').then(m => m.SecurityModule) },
  { path: 'masters', loadChildren: () => import('./masters/masters.module').then(m => m.MastersModule) },
  { path: 'substore', loadChildren: () => import('./substore/substore.module').then(m => m.SubstoreModule) },
  { path: 'portal', loadChildren: () => import('./portal/portal.module').then(m => m.PortalModule) },
  { path: 'bloodbank', loadChildren: () => import('./blood-bank/blood-bank.module').then(m => m.BloodBankModule) },
  { path: 'ssrs', loadChildren: () => import('./ssrs/ssrs.module').then(m => m.SsrsModule) },
  { path: 'rcmnavmod', loadChildren: () => import('./rcmnavmod/rcmnavmod.module').then(m => m.RcmNavModModule) },
  // { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
