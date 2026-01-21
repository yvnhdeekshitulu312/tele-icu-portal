import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpContextToken,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { LoaderService } from './loader.service';
import { environment } from 'src/environments/environment';
import { config } from 'src/environments/environment';
import { ErrorLoggingService } from '../shared/error.logging.service';

export const BYPASS_LOG = new HttpContextToken(() => false);

@Injectable()
export class HeadersInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService, private errorLoggingService: ErrorLoggingService) { }

  // intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
  //   if (!this.isExcludedAPI(request.url)) {
  //     this.loaderService.show();
  //   }

  //   if (request.context.get(BYPASS_LOG) === true) {
  //     request = request.clone({
  //       setHeaders: {
  //         'Access-Control-Allow-Origin': '*'
  //       }
  //     });
  //     return next.handle(request);
  //   } else {
  //     const token = sessionStorage.getItem("token");
  //     const logDet = JSON.parse(sessionStorage.getItem("doctorDetails") || '[]');
  //       request = request.clone({
  //         setHeaders: {
  //           'Content-Type': 'application/json',
  //           'Access-Control-Allow-Origin': '*',
  //           Authorization: request.url.includes('ValidateLoginUserHIS') || request.url.includes('rabet-api') ? 'No Auth' : 'Bearer ' + logDet[0]?.UserId + ':' + token,
  //         }
  //       });
  //       return next.handle(request).pipe(
  //         catchError((error: HttpErrorResponse) => {
  //           this.errorLoggingService.logError(error);
  //           return throwError(() => error);
  //         }),
  //         finalize(() => this.loaderService.hide()),
  //       );      
  //   }
  // }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  // Skip interceptor for fingerprint device
   if (request.url.includes('SGIFPCapture') || 
      request.url.includes('localhost:8443') ||
      request.url.includes('/webhook/')) {
    return next.handle(request);
  }
 
  if (!this.isExcludedAPI(request.url)) {
    this.loaderService.show();
  }
 
  if (request.context.get(BYPASS_LOG) === true) {
    // Remove the Access-Control-Allow-Origin header - it does nothing on client side
    return next.handle(request);
  } else {
    const token = sessionStorage.getItem("token");
    const isFormData = request.body instanceof FormData;
    const logDet = JSON.parse(sessionStorage.getItem("doctorDetails") || '[]');
    const rcmToken = sessionStorage.getItem('rcmToken') || null;

    const rcmapi = config.rcmapiurl.split('/');
    const rcmapiKey = rcmapi[rcmapi.length - 2];
    
    //const rcmToken = (logDet[0]?.RCMJwtToken == null || logDet[0].RCMJwtToken == undefined) ? null : logDet[0]?.RCMJwtToken;

    const headers: { [key: string]: string } = {
      Authorization: request.url.includes('ValidateLoginUserHIS') || request.url.includes('rabet-fingerprint.api.elm.sa') 
        ? 'No Auth' 
        : request.url.includes(rcmapiKey) ? 'Bearer ' + rcmToken : 'Bearer ' + logDet[0]?.UserId + ':' + token
    };

    const sessionHeader = request.headers.get('X-Session-ID');
    if (sessionHeader) {
      headers['X-Session-ID'] = sessionHeader;
    }

    


    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    request = request.clone({
      setHeaders: headers
    });
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.errorLoggingService.logError(error);
        return throwError(() => error);
      }),
      finalize(() => this.loaderService.hide()),
    );      
  }
}



  private isExcludedAPI(url: string): boolean {
    return environment.loaderExclude.some(excludedUrl =>
      url.includes(excludedUrl)
    );
  }
}
