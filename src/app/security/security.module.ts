import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityRoutingModule } from './security-routing.module';
import { SecurityComponent } from './security.component';
import { SecurityOptionsComponent } from './security-options/security-options.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SecurityComponent,
    SecurityOptionsComponent,
  ],
  providers: [],
  imports: [
    CommonModule,
    SharedModule,
    SecurityRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SecurityModule { }
