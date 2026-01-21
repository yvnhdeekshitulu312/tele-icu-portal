import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SubstoreRoutingModule } from './substore.routing.module';
import { RouterModule } from '@angular/router';
import { SubstoreComponent } from './substore.component';
import { IndentComponent } from './indent/indent.component';
import { SharedModule } from '../shared/shared.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
import { IndentReturnAckDetailsComponent } from './indent-return-ack-details/indent-return-ack-details.component';
import { IndentReturnAckComponent } from './indent-return-ack/indent-return-ack.component';

@NgModule({
  declarations: [
    SubstoreComponent,
    IndentComponent,
    IndentIssueComponent,
    IndentIssueDetailsComponent,
    IndentRecieptComponent,
    IndentRecieptDetailsComponent,
    PhysicalStockEntryComponent,
    IndentReturnComponent,
    ItemSubStoreComponent, 
    AlterMRPComponent,
    DepartmentalSaleComponent,
    DepartmentalReturnsComponent,
    StoreConsumptionComponent,
    AdjustmentsComponent,
    IndentReturnAckComponent,
    IndentReturnAckDetailsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    SubstoreRoutingModule,
    RouterModule,
    SharedModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatInputModule
  ],
  exports: []
})
export class SubstoreModule { }
