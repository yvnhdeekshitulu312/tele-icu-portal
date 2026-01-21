import { AuthguardGuard } from './authguard.guard';
import { AuthguardService } from './authguard.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeadersInterceptor } from './services/headers.interceptor';
import { LoaderComponent } from './loader/loader.component';
import { LoaderInterceptor } from './services/loader.interceptor';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PortalComponent } from './portal/portal.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BnNgIdleService } from 'bn-ng-idle';
import { WardComponent } from './ward/ward.component';
import { SuitComponent } from './suit/suit.component';
import { PharmacyComponent } from './pharmacy/pharmacy.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { AdmissionComponent } from './admission/admission.component';
import { OtComponent } from './ot/ot.component';
import { TemplatesComponent } from './templates/templates.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReportsComponent } from './reports/reports.component';
import { TemplatesModule } from './templates/templates.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent,
    LoginComponent,
    SidebarComponent,
    PortalComponent,
    WardComponent,
    SuitComponent,
    PharmacyComponent,
    AdmissionComponent,
    OtComponent,
    TemplatesComponent,
    ReportsComponent
    // SafePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    CarouselModule,
    OverlayModule,
    MatAutocompleteModule,
    MatDatepickerModule,
	  MatNativeDateModule,
	  TemplatesModule,
    SharedModule
  ],
  providers: [
    BnNgIdleService,
    AuthguardService,
    AuthguardGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HeadersInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true,
    },],
  bootstrap: [AppComponent]
  
})
export class AppModule { }
