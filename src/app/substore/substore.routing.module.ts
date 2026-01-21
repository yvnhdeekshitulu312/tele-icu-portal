import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthguardGuard } from '../authguard.guard';
import { SubstoreComponent } from './substore.component';
import { IndentComponent } from './indent/indent.component';
import { IndentIssueComponent } from './indent-issue/indent-issue.component';
import { IndentIssueDetailsComponent } from './indent-issue-details/indent-issue-details.component';
import { IndentRecieptComponent } from './indent-reciept/indent-reciept.component';
import { IndentRecieptDetailsComponent } from './indent-reciept-details/indent-reciept-details.component';
import { PhysicalStockEntryComponent } from './physical-stock-entry/physical-stock-entry.component';
import { IndentReturnComponent } from './indent-return/indent-return.component';
import { ItemSubStoreComponent } from './item-sub-store/item-sub-store.component';
import { AlterMRPComponent } from './alter-mrp/alter-mrp.component';
import { DepartmentalSaleComponent } from './departmental-sale/departmental-sale.component';
import { DepartmentalReturnsComponent } from './departmental-returns/departmental-returns.component';
import { StoreConsumptionComponent } from './store-consumption/store-consumption.component';
import { AdjustmentsComponent } from './adjustments/adjustments.component';
import { IndentReturnAckComponent } from './indent-return-ack/indent-return-ack.component';
import { IndentReturnAckDetailsComponent } from './indent-return-ack-details/indent-return-ack-details.component';

const routes: Routes = [
  {
    path: '', component: SubstoreComponent, children: [
      { path: 'indent', component: IndentComponent, canActivate: [AuthguardGuard] },
      { path: 'indent-issue', component: IndentIssueComponent, canActivate: [AuthguardGuard]},
      { path: 'indent-issue-details', component: IndentIssueDetailsComponent, canActivate: [AuthguardGuard]},
      { path: 'indent-reciept', component: IndentRecieptComponent, canActivate: [AuthguardGuard]},
      { path: 'indent-reciept-details', component: IndentRecieptDetailsComponent, canActivate: [AuthguardGuard]},
      { path: 'physical-stock-entry', component: PhysicalStockEntryComponent, canActivate: [AuthguardGuard]},
      { path: 'indent-return', component: IndentReturnComponent, canActivate: [AuthguardGuard]},
      { path: 'item-substore', component: ItemSubStoreComponent, canActivate: [AuthguardGuard]},
      { path: 'alter-mrp', component: AlterMRPComponent, canActivate: [AuthguardGuard]},
      { path: 'departmental-sale', component: DepartmentalSaleComponent, canActivate: [AuthguardGuard]},
      { path: 'departmental-returns', component: DepartmentalReturnsComponent, canActivate: [AuthguardGuard]},
      { path: 'store-consumption', component: StoreConsumptionComponent, canActivate: [AuthguardGuard]},
      { path: 'adjustments', component: AdjustmentsComponent, canActivate: [AuthguardGuard]},
      { path: 'indent-return-ack', component: IndentReturnAckComponent, canActivate: [AuthguardGuard]},
      { path: 'indent-return-ack-details', component: IndentReturnAckDetailsComponent, canActivate: [AuthguardGuard]},
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubstoreRoutingModule { }