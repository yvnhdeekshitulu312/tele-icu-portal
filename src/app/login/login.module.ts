import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginRoutingModule } from './login-routing.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { LoginComponent } from './login.component';

@NgModule({
  declarations: [
    LoginComponent,
    ChangepasswordComponent
  ],
  providers: [MatDatepickerModule, DatePipe],
  imports: [
    CommonModule,
    LoginRoutingModule,
    MatDatepickerModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class LoginModule { }
