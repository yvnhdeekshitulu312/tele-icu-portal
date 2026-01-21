import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PharmacyRoutingModule } from './pharmacy-routing.module';
import { GlobalitemmasterComponent } from './globalitemmaster/globalitemmaster.component';
import { BulkprocessingComponent } from './bulkprocessing/bulkprocessing.component';
import { SharedModule } from '../shared/shared.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IndividualProcessingComponent } from './individual-processing/individual-processing.component';
import { IndividualDetailsComponent } from './individual-details/individual-details.component';
import { CashissueComponent } from './cashissue/cashissue.component';
import { IvfOrderComponent } from './ivf-order/ivf-order.component';
import { IvfOrderDetailsComponent } from './ivf-order-details/ivf-order-details.component';
import { DrugreturnsPatientwiseIpComponent } from './drugreturns-patientwise-ip/drugreturns-patientwise-ip.component';
import { WorklistComponent } from './worklist/worklist.component';
import { OpDrugAdministrationComponent } from './op-drug-administration/op-drug-administration.component';
import { PharmacyReturnsComponent } from './pharmacy-returns/pharmacy-returns.component';
import { MMSStockManagementComponent } from './mms-stock-management/mms-stock-management.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotBilledOrderComponent } from './not-billed-order/not-billed-order.component';
import { ItemMappingComponent } from './item-mapping/item-mapping.component';

@NgModule({
  declarations: [
    GlobalitemmasterComponent,
    BulkprocessingComponent,
    IndividualProcessingComponent,
    IndividualDetailsComponent,
    CashissueComponent,
    IvfOrderComponent,
    IvfOrderDetailsComponent,
    DrugreturnsPatientwiseIpComponent,
    WorklistComponent,
    OpDrugAdministrationComponent,
    PharmacyReturnsComponent,
    MMSStockManagementComponent,
    NotBilledOrderComponent,
    ItemMappingComponent
  ],
  providers: [MatDatepickerModule, DatePipe],
  imports: [
    CommonModule,
    SharedModule,
    PharmacyRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatAutocompleteModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatToolbarModule,
    MatMomentDateModule,
    NgxDatatableModule,
    MatSnackBarModule
  ]
})
export class PharmacyModule { }
