import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorLoggingService {
  //private logUrl = 'https://your-server-url.com/api/logs';

  constructor(private http: HttpClient) {}

  logError(error: any) {
    const errorData = {
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace',
      timestamp: new Date()
    };
    console.log(errorData);
    // this.http.post(this.logUrl, errorData).pipe(
    //   catchError(err => {
    //     console.error('Error logging to server:', err);
    //     return of(null);
    //   })
    // ).subscribe();
  }
}