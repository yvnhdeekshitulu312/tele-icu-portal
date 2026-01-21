import { Component, OnInit, Optional, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FingerprintService } from './services/fingerprint.service';
import { BiometricService } from 'src/app/services/biometric.service';
import { ValidateEmployeeComponent } from '../validate-employee/validate-employee.component';
import { UtilityService } from '../utility.service';

@Component({
  selector: 'app-fingerprint',
  templateUrl: './fingerprint.component.html',
  styleUrls: ['./fingerprint.component.scss']
})
export class FingerprintComponent implements OnInit {
  @Input() patient: any;
  @Input() category: any;
  errorMessage: string = '';
  timeout: number = 10000;
  fakeDetection: number = 0;
  quality: number = 50;
  templateFormat: string = 'ISO';

  fingerprintImage: string = 'assets/PlaceFinger.bmp';
  scanResult: FingerprintResult | null = null;
  isScanning: boolean = false;
  isVerifying: boolean = false;
  selectedFingerType: any;

  fingerTypeMap: { [key: number]: number } = {
    1: 1,  // Right Thumb
    2: 2,  // Right Index
    3: 3,  // Right Middle
    4: 4,  // Right Ring
    5: 5,  // Right Pinky
    6: 6,  // Left Thumb
    7: 7,  // Left Index
    8: 8,  // Left Middle
    9: 9,  // Left Ring
    10: 10 // Left Pinky
  };

  fakeDetectionOptions = [
    { value: 0, label: '0=Disabled' },
    { value: 1, label: '1=Touch Chip Only' },
    { value: 2, label: '2=Touch Chip + Lowest Fake Threshold' },
    { value: 3, label: '3=Touch Chip + Fake Threshold 2' },
    { value: 4, label: '4=Touch Chip + Fake Threshold 3' },
    { value: 5, label: '5=Touch Chip + Fake Threshold 4' },
    { value: 6, label: '6=Touch Chip + Fake Threshold 5' },
    { value: 7, label: '7=Touch Chip + Fake Threshold 6' },
    { value: 8, label: '8=Touch Chip + Fake Threshold 7' },
    { value: 9, label: '9=Touch Chip + Highest Fake Threshold' }
  ];

  templateFormats = [
    { value: 'ISO', label: 'ISO-19794' },
    { value: 'ANSI', label: 'ANSI' }
  ];

  reasonsList = [
    { id: 0, label: 'Select' },
    { id: 1, label: 'Integration not working' },
    { id: 2, label: 'Patient Finger print not detected' }
  ];

  reasonId: any = 0;
  reasonOtherRemarks: any = '';
  doctorDetails: any;
  facility: any;
  hospitalID: any;
  fingerPrintFailed: boolean = true;

  constructor(
    private fingerprintService: FingerprintService, private biometricService: BiometricService,
    private modalSvc: NgbModal,
    private us: UtilityService,
    @Optional() public activeModal?: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.hospitalID = sessionStorage.getItem("hospitalId");
    setTimeout(() => {
      this.initializeFingerClickListeners();
    }, 0);
  }

  initializeFingerClickListeners(): void {
    const fingerElements = document.querySelectorAll('.finger');

    fingerElements.forEach((element: Element) => {
      element.addEventListener('click', (event: Event) => {
        event.stopPropagation();

        const target = event.currentTarget as HTMLElement;
        const fingerCountElement = target.querySelector('.finger-count');

        if (fingerCountElement) {
          const fingerCount = fingerCountElement.textContent?.trim();
          if (fingerCount) {
            const fingerNumber = parseInt(fingerCount);

            if (this.selectedFingerType === this.fingerTypeMap[fingerNumber]) {
              this.selectedFingerType = null;
              target.classList.remove('active');
            } else {
              this.onFingerClick(fingerNumber);

              fingerElements.forEach(el => el.classList.remove('active'));
              target.classList.add('active');
            }
          }
        }
      });
    });
  }

  onFingerClick(fingerNumber: number): void {
    this.selectedFingerType = this.fingerTypeMap[fingerNumber];
    console.log(`Finger selected: ${fingerNumber}, Type: ${this.selectedFingerType}`);

    if (this.selectedFingerType) {
      localStorage.setItem('selectedFingerType', this.selectedFingerType.toString());
      localStorage.setItem('selectedFingerNumber', fingerNumber.toString());
    } else {
      localStorage.removeItem('selectedFingerType');
      localStorage.removeItem('selectedFingerNumber');
    }
  }

  captureFP(): void {
    if (!this.selectedFingerType) {
      return;
    }

    this.isScanning = true;
    this.scanResult = null;

    const params = {
      Timeout: this.timeout,
      Quality: this.quality,
      fakeDetection: this.fakeDetection,
      templateFormat: this.templateFormat
    };

    this.fingerprintService.captureFingerprint().subscribe({
      next: (result: FingerprintResult) => {
        this.isScanning = false;
        if (result.ErrorCode === 0) {
          this.scanResult = result;
          if (result.BMPBase64 && result.BMPBase64.length > 0) {
            this.fingerprintImage = `data:image/bmp;base64,${result.BMPBase64}`;
          }
          console.log('Fingerprint captured successfully');
        } else {
          alert(`Fingerprint Capture Error Code: ${result.ErrorCode}.\nDescription: ${this.getErrorDescription(result.ErrorCode)}.`);
        }
      },
      error: (error) => {
        this.isScanning = false;
        this.handleConnectionError(error);
      }
    });
  }

  private handleConnectionError(error: any): void {
    let errorMessage = '⚠️ Cannot Connect to Fingerprint Scanner\n\n';

    if (error.status === 0 || error.name === 'HttpErrorResponse') {
      errorMessage += '📋 Please follow these steps:\n\n';
      errorMessage += '1. Verify SGIBIOSRV service is running\n';
      errorMessage += '   • Check Windows Services\n';
      errorMessage += '   • Restart if needed\n\n';
      errorMessage += '2. Trust the SSL Certificate:\n';
      errorMessage += '   • Visit: https://localhost:8443/SGIFPCapture\n';
      errorMessage += '   • Click "Advanced" → "Proceed to localhost"\n';
      errorMessage += '   • You should see a response from the service\n\n';
      errorMessage += '3. Check fingerprint device is connected\n\n';
      errorMessage += '4. Refresh this page after completing steps\n';

      // Provide clickable link option
      if (confirm(errorMessage + '\n\nOpen certificate trust page now?')) {
        window.open('https://localhost:8443/SGIFPCapture', '_blank');
      }
    } else {
      errorMessage += `Error Details:\n`;
      errorMessage += `Status: ${error.status}\n`;
      errorMessage += `Message: ${error.message || error.statusText}`;
      alert(errorMessage);
    }
  }

  validateFingerprint() {
    this.errorMessage = '';

    if (!this.patient || !this.scanResult?.TemplateBase64) {
      this.errorMessage = 'Missing patient info or fingerprint data';
      return;
    }
    this.fingerPrintFailed = true;
    this.isVerifying = true;
    const patientKey = this.patient.patientInfo?.SSN || this.patient.id || this.patient.SSN;
    this.biometricService.validateBiometricWithHeaders(
      patientKey,
      this.selectedFingerType,
      this.scanResult.BMPBase64
    ).subscribe({
      next: (response: any) => {
        this.isVerifying = false;

        if (response.MatchFlag) {
          console.log(`Biometric verification Success`);
          this.errorMessage = 'Validated Successfully';
          setTimeout(() => {
            if (this.activeModal) {
              this.activeModal.close(true);
            }
          }, 5000);
        } else {
          this.fingerPrintFailed = true;
          this.errorMessage = 'Biometric verification Failed — please try again.';
        }
      },
      error: (error: any) => {
        this.isVerifying = false;
        let errorMessage = 'Biometric verification error:\n\n';

        if (error.error?.message) {
          errorMessage += error.error.message;
        } else if (error.status === 0) {
          errorMessage += 'Cannot connect to verification service.';
        } else {
          errorMessage += `Status: ${error.status}\nMessage: ${error.message || error.statusText}`;
        }

        this.errorMessage = errorMessage;
      }
    });
  }

  closeModal(): void {
    if (this.activeModal) {
      this.activeModal.dismiss('cancelled');
    }
  }

  private getErrorDescription(errorCode: number): string {
    const errorMap: { [key: number]: string } = {
      0: 'Success',
      51: 'System file load failure',
      52: 'Sensor chip initialization failed',
      53: 'Device not found',
      54: 'Fingerprint image capture timeout',
      55: 'No finger detected',
      56: 'Driver load failed',
      57: 'Wrong Image',
      58: 'Lack of bandwidth',
      59: 'Device Busy',
      60: 'Cannot get serial number of the device',
      61: 'Unsupported device',
      63: 'Driver load failed',
      10001: 'Invalid parameter',
      10002: 'Not initialized',
      10003: 'Device not connected or not responding',
      10004: 'Capture failed',
      10005: 'Template extraction failed',
      10006: 'Invalid license key'
    };
    return errorMap[errorCode] || `Unknown error (Code: ${errorCode})`;
  }

  overrideFinferPrint() {
    if (this.reasonId.toString() == '0') {
      return;
    }
    document.querySelector('.fingerprintModal.modal')?.classList.add('hidden-modal');
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
      backdrop: 'static',
    });
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      document.querySelector('.fingerprintModal.modal')?.classList.remove('hidden-modal');
      if (data.success) {
        const patientID = this.patient?.patientInfo?.PatientID || this.patient.PatientID || 0;
        const admissionID = this.patient?.patientInfo?.AdmissionID || this.patient.AdmissionID || 0;
        const payload = {
          "OverridingID": "0",
          "PatientID": patientID,
          "AdmissionID": admissionID,
          "OverrideReasons": this.reasonId,
          "OverrideOtherRemarks": this.reasonId == -1 ? this.reasonOtherRemarks : '',
          "OverrideUserID": this.doctorDetails[0].UserId,
          "FingerTypeCategory": this.category,
          "UserID": this.doctorDetails[0].UserId,
          "WorkStationID": this.facility.FacilityID ?? 0,
          "HospitalID": this.hospitalID
        };
        this.us.post('SavePatientFingerprintoverridings', payload).subscribe((response) => {
          if (response.Code == 200) {
            if (this.activeModal) {
              this.activeModal.close(true);
            }
          }
        },
          (_) => {

          });
      }
      modalRef.close();
    });
  }
}

export interface FingerprintResult {
  ErrorCode: number;
  BMPBase64: string;
  SerialNumber: string;
  ImageHeight: number;
  ImageWidth: number;
  ImageDPI: number;
  ImageQuality: number;
  NFIQ: number;
  TemplateBase64: string;
  WSQImageSize: number;
  WSQImage: string;
}

export interface BiometricValidationResponse {
  success: boolean;
  message?: string;
  score?: number;
}