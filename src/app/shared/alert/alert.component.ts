import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { BaseComponent } from '../base.component';
import { PatientAlertsService } from '../patient-alerts/patient-alerts.service';
import { UtilityService } from '../utility.service';
import { patientAlertDetails } from '../patient-alerts/urls';
import { Subject, takeUntil } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent extends BaseComponent implements OnInit, OnChanges {
  url = "";
  @Input() PatientID: any;
  @Output() dataChanged = new EventEmitter<boolean>();
  FetchPatientAlertsDataList: any =[];
  FetchPatientAlertsobjPatientAllergyList:any=[];
  FetchPatientAlertsDataListFiltered:any=[];
  showalertmodal=false;
   private destroy$ = new Subject<void>();
  constructor(private service: PatientAlertsService, private us: UtilityService, private renderer: Renderer2, private el: ElementRef) { 
    super()
  }

   ngOnInit(): void {
    this.service.patientId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.PatientID = id;
        this.openAlertModal();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.openAlertModal();
  }

  removeClass() {
    const element = this.el.nativeElement.querySelector('#alertModal');
    if (element) {
      this.renderer.removeClass(element, 'alertclick');
      this.renderer.addClass(element, "d-none");
    }
    this.showalertmodal=false;
  }

  FetchPatientallertsHeader() {
    this.url = this.service.getData(patientAlertDetails.FetchPatientallertsHeader, { PatientID: this.PatientID ,UserID: this.doctorDetails[0].UserId, WorkstationId: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatientAlertsDataList = response.FetchPatientAlertsDataList;
          if(this.FetchPatientAlertsDataList.length > 0 || this.FetchPatientAlertsobjPatientAllergyList.length > 0) {
            this.showalertmodal=true;
            if(this.patientTypeClick === 'IP') {
              setTimeout(()=>{
                this.removeClass();
              }, 5000);
            }
          }
          this.FetchPatientAlertsDataList.forEach((element: any, index: any) => {        
            if (element.AlertTypeID == '2')
              element.Class = "alert_bg_HighRisk p-2 d-flex align-items-center justify-content-between";
            else if (element.AlertTypeID == '1')
              element.Class = "alert_bg p-2 d-flex align-items-center justify-content-between";
            else  if (element.AlertTypeID == '3')
              element.Class = "alert_bg p-2 d-flex align-items-center justify-content-between";
            
          });

          this.FetchPatientAlertsobjPatientAllergyList = response.objPatientAllergyList;
          this.FetchPatientAlertsDataListFiltered = this.FetchPatientAlertsDataList.filter(
            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.AlertTypeID === thing.AlertTypeID) === i);
        }
      },
        (err) => {

        })
  }

  filterAlerts(alert:any) {
    return this.FetchPatientAlertsDataList.filter((x:any) => x.AlertTypeID === alert.AlertTypeID);
  }

  openAlertModal(){
    if (!this.PatientID) {
      this.FetchPatientAlertsDataList = [];
    } else {
      this.FetchPatientallertsHeader();
    }
  }

}
