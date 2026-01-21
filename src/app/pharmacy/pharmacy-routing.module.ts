import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PharmacyComponent } from './pharmacy.component';
import { GlobalitemmasterComponent } from './globalitemmaster/globalitemmaster.component';
import { BulkprocessingComponent } from './bulkprocessing/bulkprocessing.component';
import { IndividualProcessingComponent } from './individual-processing/individual-processing.component';
import { IndividualDetailsComponent } from './individual-details/individual-details.component';
import { CashissueComponent } from './cashissue/cashissue.component';
import { IvfOrderComponent } from './ivf-order/ivf-order.component';
import { IvfOrderDetailsComponent } from './ivf-order-details/ivf-order-details.component';
import { DrugreturnsPatientwiseIpComponent } from './drugreturns-patientwise-ip/drugreturns-patientwise-ip.component';
import { AuthguardGuard } from '../authguard.guard';
import { WorklistComponent } from './worklist/worklist.component';
import { OpDrugAdministrationComponent } from './op-drug-administration/op-drug-administration.component';
import { PharmacyReturnsComponent } from './pharmacy-returns/pharmacy-returns.component';
import { MMSStockManagementComponent } from './mms-stock-management/mms-stock-management.component';
import { NotBilledOrderComponent } from './not-billed-order/not-billed-order.component';
import { ItemMappingComponent } from './item-mapping/item-mapping.component';

const routes: Routes = [
  {
    path: '', component: PharmacyComponent, children: [
      { path: '', component: PharmacyComponent, canActivate: [AuthguardGuard] },
      { path: 'globalitemmaster', component: GlobalitemmasterComponent, canActivate: [AuthguardGuard] },
      { path: 'bulkprocessing', component: BulkprocessingComponent, canActivate: [AuthguardGuard] },
      { path: 'IndividualProcessing', component: IndividualProcessingComponent, canActivate: [AuthguardGuard] },
      { path: 'individual-details', component: IndividualDetailsComponent, canActivate: [AuthguardGuard] },
      { path: 'cashissue', component: CashissueComponent, canActivate: [AuthguardGuard] },
      { path: 'ivf-order', component: IvfOrderComponent, canActivate: [AuthguardGuard] },
      { path: 'ivf-order-details', component: IvfOrderDetailsComponent, canActivate: [AuthguardGuard] },
      { path: 'drugreturns-patientwise-ip', component: DrugreturnsPatientwiseIpComponent, canActivate: [AuthguardGuard] },
      { path: 'worklist', component: WorklistComponent, canActivate: [AuthguardGuard] },
      { path: 'op-drug-administration', component: OpDrugAdministrationComponent, canActivate: [AuthguardGuard] },
      { path: 'pharmacyreturns', component: PharmacyReturnsComponent, canActivate: [AuthguardGuard] },
      { path: 'mms-stock-management', component: MMSStockManagementComponent, canActivate: [AuthguardGuard] },
      { path: 'not-billed-orders', component: NotBilledOrderComponent, canActivate: [AuthguardGuard] },
      { path: 'item-mapping', component: ItemMappingComponent, canActivate: [AuthguardGuard] },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PharmacyRoutingModule { }
