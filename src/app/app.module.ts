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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BnNgIdleService } from 'bn-ng-idle';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TemplatesModule } from './templates/templates.module';
import { DoctorCallComponent } from './doctor-call/doctor-call.component';
import { TeleIcuComponent } from './tele-icu/tele-icu.component';

@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent,
    DoctorCallComponent,
    TeleIcuComponent
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
    TemplatesModule
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
