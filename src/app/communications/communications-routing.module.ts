import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthguardGuard } from '../authguard.guard';
import { CommunicationsComponent } from './communications.component';
import { CommunicationsLandingComponent } from './communications-landing/communications-landing.component';

const routes: Routes = [
    {
        path: '', component: CommunicationsComponent, children: [
            { path: '', component: CommunicationsLandingComponent, canActivate: [AuthguardGuard], },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommunicationsRoutingModule { }