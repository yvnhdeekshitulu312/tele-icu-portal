import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthguardGuard } from '../authguard.guard';
import { BloodBankComponent } from './blood-bank.component';
import { CrossMatchComponent } from './cross-match/cross-match.component';
import { IPIssuesWorklistComponent } from './ip-issues-worklist/ip-issues-worklist.component';
import { BloodIssueAcknowledgeComponent } from './blood-issue-acknowledge/blood-issue-acknowledge.component';
import { TransfusionFeedbackComponent } from './transfusion-feedback/transfusion-feedback.component';
import { OutsideBloodCollectionsComponent } from './outside-blood-collections/outside-blood-collections.component';
import { BloodBagHistoryComponent } from './blood-bag-history/blood-bag-history.component';

const routes: Routes = [
  {
    path: '', component: BloodBankComponent, children: [
      { path: 'crossmatch', component: CrossMatchComponent, canActivate: [AuthguardGuard] },
      { path: 'ipissuesworklist', component: IPIssuesWorklistComponent, canActivate: [AuthguardGuard] },
      { path: 'bloodissueack', component: BloodIssueAcknowledgeComponent, canActivate: [AuthguardGuard] },
      { path: 'transfusionfeedback', component: TransfusionFeedbackComponent, canActivate: [AuthguardGuard] },
      { path: 'outsidebloodcollections', component: OutsideBloodCollectionsComponent, canActivate: [AuthguardGuard] },
      { path: 'bloodbaghistory', component: BloodBagHistoryComponent, canActivate: [AuthguardGuard] }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BloodBankRoutingModule { }
