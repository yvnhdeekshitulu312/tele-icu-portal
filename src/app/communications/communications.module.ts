import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationsRoutingModule } from './communications-routing.module';
import { CommunicationsComponent } from './communications.component';
import { CommunicationsLandingComponent } from './communications-landing/communications-landing.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommunicationsNotesComponent } from './communications-notes/communications-notes.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    declarations: [
        CommunicationsComponent,
        CommunicationsLandingComponent,
        CommunicationsNotesComponent
    ],
    imports: [
        CommonModule,
        CommunicationsRoutingModule,
        SharedModule,
        FormsModule, 
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule
    ],
    exports: [
    ]
})
export class CommunicationsModule { }
