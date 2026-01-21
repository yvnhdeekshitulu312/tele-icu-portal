import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SharedModule } from '../shared/shared.module';
import { BloodBankRoutingModule } from './blood-bank-routing.module';
import { BloodBankComponent } from './blood-bank.component';
import { CrossMatchComponent } from './cross-match/cross-match.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { IPIssuesWorklistComponent } from './ip-issues-worklist/ip-issues-worklist.component';
import { BloodIssueAcknowledgeComponent } from './blood-issue-acknowledge/blood-issue-acknowledge.component';
import { OutsideBloodCollectionsComponent } from './outside-blood-collections/outside-blood-collections.component';
import { BloodBagHistoryComponent } from './blood-bag-history/blood-bag-history.component';

@NgModule({
  declarations: [
    BloodBankComponent,
    CrossMatchComponent,
    IPIssuesWorklistComponent,
    BloodIssueAcknowledgeComponent,
    OutsideBloodCollectionsComponent,
    BloodBagHistoryComponent
  ],
  imports: [
    CommonModule,
    BloodBankRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatFormFieldModule,
    SharedModule,
    MatAutocompleteModule
  ]
})
export class BloodBankModule { }
