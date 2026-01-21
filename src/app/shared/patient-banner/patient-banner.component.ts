import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '../base.component';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';

declare var $: any;

@Component({
  selector: 'app-patient-banner',
  templateUrl: './patient-banner.component.html',
  styleUrls: ['./patient-banner.component.scss']
})



export class PatientBannerComponent extends BaseComponent implements OnInit {
  // @Input() patientDetails: any;
  patientDetails: any;
  IsEmergency: any;
  isdetailShow = true;
  endofEpsiodeDate: any;
  Disposition: any;
  SelectedViewClass: any;
  lang: any;

  constructor(private router: Router, private config: ConfigService) {
    super();
    this.patientDetails = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    const emergencyValue = sessionStorage.getItem("IsEmergencyTile");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsEmergency = (emergencyValue === 'true');
    } else {
      this.IsEmergency = false;
    }
   }

  ngOnInit(): void {

    this.lang = sessionStorage.getItem("lang");
    if (this.selectedView.PatientType == "2") {
      if (this.selectedView?.Bed.includes('ISO'))
        this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
      else
        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }
  }

  GoBackTodashboard() {
    var fromdocCal = sessionStorage.getItem("FromDocCalendar");
    if (this.IsEmergency) {
      this.router.navigate(['/emergency']);
    }
    else if (this.patientDetails.PatientType == '2' && fromdocCal != "true") {
      this.router.navigate(['/ward']);
    }
    else if (this.selectedView.PatientType == "3") {
      this.router.navigate(['/ward']);
    }
    else {
      this.router.navigate(['/home/patients']);
    }
    sessionStorage.setItem("navigateFromCasesheet", 'false');
    sessionStorage.setItem("FromDocCalendar", "false");
    sessionStorage.removeItem("PregnancyHistory");
    sessionStorage.removeItem("FromPrevRefDocCalendar");
  }

  navigateToResults() {
    sessionStorage.setItem("FromCaseSheet", "true");
    this.router.navigate(['/home/otherresults']);
  }

  showGrowthChartInfo() {
    $("#exampleModal").modal('show');
  }

  isdetailShows() {
    this.isdetailShow = true;
    if (this.isdetailShow = true) {
      $('.patient_card').addClass('maximum')
    }
    // else{
    //   $('.patient_card').removeClass('maximum')
    // }
  }
  isdetailHide() {
    this.isdetailShow = false;
    if (this.isdetailShow === false) {
      $('.patient_card').removeClass('maximum')
    }
  }
  endofEpisodeClick() {
    if (!this.endofEpsiodeDate) {
      this.config.FetchEmergencyDischargeDispositions(this.doctorDetails[0].EmpId, this.hospitalID)
        .subscribe((response: any) => {
          this.Disposition = response.FetchEmergencyDischargeDispositionsDataList;
        },
          (err) => {
          })
      $('#endofEpisodeJustification').modal('show');
    }
  }

}
