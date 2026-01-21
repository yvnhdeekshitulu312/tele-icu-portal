import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FingerprintResult } from '../fingerprint.component';
import { environment } from 'src/environments/environment';
import { BYPASS_LOG } from 'src/app/services/headers.interceptor';
 
@Injectable({
  providedIn: 'root'
})
export class FingerprintService {
  private apiUrl = this.getApiUrl();
 
  constructor(private http: HttpClient) {}
 
  private getApiUrl(): string {
    if (!environment.production) {
      return '/SGIFPCapture';
    }
    return 'https://localhost:8000/SGIFPCapture';
  }

  /**
   * Get SecuGen license from doctor details in session storage
   * Returns empty string if license is not valid or not available
   */
  private getSecugenLicense(): string {
    try {
      const doctorDetailsStr = sessionStorage.getItem("doctorDetails");
      if (!doctorDetailsStr) {
        return '';
      }

      const doctorDetails = JSON.parse(doctorDetailsStr);
      
      // Check if it's an array and has at least one element
      if (!Array.isArray(doctorDetails) || doctorDetails.length === 0) {
        return '';
      }

      // Check if license is valid (fix typo: SecugenLicenValid -> SecugenLicenseValid)
      const isLicenseValid = doctorDetails[0]?.SecugenLicenValid === "YES";
      
      return isLicenseValid ? (environment.secugenLicense || '') : '';
    } catch (error) {
      console.error('Error reading doctor details from session storage:', error);
      return '';
    }
  }
 
  captureFingerprint(): Observable<FingerprintResult> {
    // Get license dynamically (fresh from session storage each time)
    const secugenLicense = this.getSecugenLicense();
    
    const body = secugenLicense 
      ? `licstr=${encodeURIComponent(secugenLicense)}`
      : '';  // Empty body if no license
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    
    return this.http.post<FingerprintResult>(
      this.apiUrl,
      body,
      {
        headers: headers,
        context: new HttpContext().set(BYPASS_LOG, true)
      }
    );
  }
}