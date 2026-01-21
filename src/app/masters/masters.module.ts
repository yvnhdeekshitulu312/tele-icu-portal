import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MastersRoutingModule } from './masters.routing.module';
import { MastersLandingComponent } from './masters-landing/masters-landing.component';
import { RouterModule } from '@angular/router';
import { MastersComponent } from './masters.component';
import { SpecializationComponent } from './specialization/specialization.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TestDefinitionComponent } from './test-definition/test-definition.component';
import { TestSpecimenComponent } from './test-specimen/test-specimen.component';
import { BedsMasterComponent } from './beds-master/beds-master.component';

@NgModule({
  declarations: [
    MastersLandingComponent,
    MastersComponent,
    SpecializationComponent,
    TestDefinitionComponent,
    TestSpecimenComponent,
    BedsMasterComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MastersRoutingModule,
    SharedModule,
    RouterModule,
    MatAutocompleteModule
  ],
  exports: []
})
export class MastersModule { }
