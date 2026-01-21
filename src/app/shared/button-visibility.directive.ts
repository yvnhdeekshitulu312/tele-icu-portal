import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appButtonVisibility]'
})
export class ButtonVisibilityDirective implements OnInit {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const view = sessionStorage.getItem("selectedView");
    const card = sessionStorage.getItem("selectedCard");
    const details = sessionStorage.getItem("patientDetails");
    const inpatientdetails = sessionStorage.getItem("InPatientDetails");
    const patientDetails = view && view !== '{}' ? JSON.parse(view) : card && card !== '{}' ? JSON.parse(card): details && details !== '{}' ? JSON.parse(details) : inpatientdetails && inpatientdetails !== '{}' ? JSON.parse(inpatientdetails) : {};

    if(patientDetails.DischargeStatusID=='2')
      patientDetails.IsExpired=true;
    else
    patientDetails.IsExpired=false;
    const isExpired = patientDetails?.IsExpired;

    if (isExpired) {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    } else {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'inline-block'); 
    }
  }
}