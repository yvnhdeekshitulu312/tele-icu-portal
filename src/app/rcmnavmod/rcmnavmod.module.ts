import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RcmRoutingModule } from './rcmnavmod-routing.module';
import { RcmNavModComponent } from './rcmnavmod.component';

@NgModule({
  declarations: [RcmNavModComponent],
  imports: [CommonModule, RcmRoutingModule],
})
export class RcmNavModModule {}
