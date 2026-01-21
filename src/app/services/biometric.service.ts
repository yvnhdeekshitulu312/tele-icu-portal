import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FingerprintComponent } from '../shared/fingerprint/fingerprint.component';
import { config, environment } from 'src/environments/environment';

export interface BiometricValidationRequest {
  personId: string;
  fingerType: number;
  fingerString: string;
}

export interface BiometricValidationResponse {
  matchFlag: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BiometricService {
  //private biometricApiUrl = 'https://rabet-fingerprint.api.elm.sa/api/v4/authenticate';//'/rabet-fingerprint.api.elm.sa/api/v4/authenticate';
  private biometricApiUrl = environment.production 
    ? config.apiurl+'/biometric/authenticate'
    : config.apiurl+'/biometric/authenticate';
    
  private verifiedPatients: Map<string, boolean> = new Map();
  doctorDetails: any;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient, private ngbModal: NgbModal) { 
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  }

  // validateBiometricWithHeaders(
  //   personId: string,
  //   fingerType: number,
  //   finger: string
  // ): Observable<BiometricValidationResponse> {

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json',
  //     'app-id': 'CkrS1kBZ',
  //     'app-key': 'f022c0964ba540e6b2f59680ac74de76',
  //     'client-contract-id': '223f360c-f9bd-485c-adec-8237b5fd5155'
  //   });

  //   const body = {
  //     personId,
  //     fingerType,
  //     finger
  //   };

  //   return this.http.post<BiometricValidationResponse>(
  //     this.biometricApiUrl,
  //     body,
  //     { headers }
  //   );
  // }
  validateBiometricWithHeaders(
    personId: string,
    fingerType: number,
    finger: string
  ): Observable<BiometricValidationResponse> {
    const body = {
      personId,
      fingerType,
      finger
    };
 
    return this.http.post<BiometricValidationResponse>(
      this.biometricApiUrl,
      body
    );
  }

  verifyPatient(patient: any, category: any): Observable<boolean> {
    const patientKey = patient.patientInfo?.SSN || patient.id|| patient.SSN;

    // Check if already verified
    if (this.isPatientVerified(patientKey)) {
      return of(true);
    }

    // Check if biometric is enabled
    if (!this.isBiometricEnabled()) {
      return of(true); // Proceed with normal flow
    }

    // Open biometric modal
    return new Observable(observer => {
      const modalRef = this.ngbModal.open(FingerprintComponent, {
        windowClass: 'fingerprintModal',
        backdrop: 'static',
        keyboard: false
      });

      modalRef.componentInstance.patient = patient;
      modalRef.componentInstance.showClose = false;
      modalRef.componentInstance.category = category;

      modalRef.result.then(
        (result: any) => {
          if (result === true) {
            this.markPatientAsVerified(patientKey);
            observer.next(true);
          } else {
            observer.next(false);
          }
          observer.complete();
        },
        () => {
          observer.next(false);
          observer.complete();
        }
      );
    });
  }

  /**
   * Check if biometric authentication is enabled
   */
  private isBiometricEnabled(): boolean {
    var flag : string | boolean = this.doctorDetails[0]?.FINGERPRINTENABLE;
    if (typeof flag === 'boolean') {
      return flag;
    }
    if (typeof flag === 'string') {
      return flag.toLowerCase() === 'yes' || flag === 'Y' || flag === '1';
    }
    return false;
  }

  /**
   * Check if patient is already verified
   */
  isPatientVerified(patientKey: string): boolean {
    return this.verifiedPatients.get(patientKey) === true;
  }

  /**
   * Mark patient as verified
   */
  private markPatientAsVerified(patientKey: string): void {
    this.verifiedPatients.set(patientKey, true);
  }

  /**
   * Clear verification status (useful for logout)
   */
  clearVerifications(): void {
    this.verifiedPatients.clear();
  }

  /**
   * Remove specific patient verification
   */
  removePatientVerification(patientKey: string): void {
    this.verifiedPatients.delete(patientKey);
  }
}