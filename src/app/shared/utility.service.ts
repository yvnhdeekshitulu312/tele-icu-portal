import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, forkJoin } from 'rxjs';
import { PatientAlertsComponent } from './patient-alerts/patient-alerts.component';
import { config } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  public devApiUrl = `${config.apiurl}`;
  public hijApiUrl = `${config.hijapiurl}`;
  public rcmapiUrl = `${config.rcmapiurl}`; 
  public reportapiUrl = `${config.reportsapi}`; 
  baseApiUrl = "https://file.io";//
  public prodApiUrl = "";
  closeModalEvent: EventEmitter<void> = new EventEmitter<void>();

  private alertSubject = new Subject<string>(); // Creating a Subject

  alertData$: Observable<string> = this.alertSubject.asObservable();

  setAlertPatientId(patientId: string) {
    this.alertSubject.next(patientId);  
  }

  // Construct URL with dynamic parameters
  getApiUrl(baseUrl: string, replacements: any): any {
    baseUrl = baseUrl.replace(/\${\s*\w+\s*}/g, function(url) {
      const key = url.substring(2, url.length - 1).trim()
      return (replacements[key] != undefined && (typeof replacements[key] === 'string' || typeof replacements[key] === 'number' || typeof replacements[key] === null))
      ? replacements[key] : url;
    });

    return baseUrl;
  }

  constructor(private https: HttpClient, private modalService: NgbModal) { 
  }

  post(url: any, payload:any, headers?: any) {
    return this.https.post<any>(this.devApiUrl + url , payload, { headers });
  }

  postfullurl(url: any, payload:any) {
    return this.https.post<any>(url , payload);
  }

  postbill(url: any, payload:any) {
    return this.https.post<any>(url , payload);
  }

  savecashissuebill(url: any, payload:any) {
    return this.https.post<any>(url , payload);
  }

  get(url: any, headers?: any) {
    return this.https.get<any>(this.devApiUrl + url, { headers });
  }

  getReport(url: any) {
    return this.https.get<any>(this.reportapiUrl + '/'+ url);
  }

  getfullurl(url: any) {
    return this.https.get<any>(url);
  }

  getbill(url: any) {
    return this.https.get<any>(url);
  }

  getMultipleData(apiList: string[]): Observable<any[]> {
    const observables: Observable<any>[] = [];
    
    apiList.forEach(api => {
      const observable = this.https.get(this.devApiUrl + api);
      observables.push(observable);
    });

    return forkJoin(observables);
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  // getPatientAlert(PatientID: any) {
  //   const options: NgbModalOptions = {
  //     backdrop: false
  //   };
  //   const modalRef = this.modalService.open(PatientAlertsComponent, options);
  //   modalRef.componentInstance.PatientID = PatientID;
  //   modalRef.componentInstance.dataChanged.subscribe((data: string) => {
  //     modalRef.close();
  //   });
  // }

  disabledElement(divElementRef: HTMLElement) {
    const elements: NodeListOf<Element> = divElementRef.querySelectorAll('input, textarea, select, div, button');
    elements.forEach((element: Element) => {
      const typedElement = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLDivElement | HTMLButtonElement;
      if (typedElement instanceof HTMLInputElement ||
          typedElement instanceof HTMLTextAreaElement ||
          typedElement instanceof HTMLSelectElement ||
          typedElement instanceof HTMLButtonElement) {
        typedElement.disabled = true;
        typedElement.classList.add('disabled'); 
      }
    });
  }

  printOPBill(billId: Number, hospItalId: Number) {
    return this.https.get(
      this.rcmapiUrl +
        `OPBilling/opbillprint?billId=${billId}&hospitalId=${hospItalId}`,
      { responseType: 'arraybuffer' }
    );
  }
}
