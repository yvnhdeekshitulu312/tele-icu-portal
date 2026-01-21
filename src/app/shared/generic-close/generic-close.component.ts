import { Component, Input, OnInit } from '@angular/core';
import { UtilityService } from '../utility.service';
import { BaseComponent } from '../base.component';
import moment from 'moment';

@Component({
  selector: 'app-generic-close',
  templateUrl: './generic-close.component.html',
  styleUrls: ['./generic-close.component.scss']
})
export class GenericCloseComponent extends BaseComponent implements OnInit {
  @Input() title = 'nonname';
  @Input() isCardRequired = false;
  @Input() isPrint = false;
  SelectedViewClass: any;
  location: any;
  currentdate: any;
  constructor(private us: UtilityService) {
    super()
  }

  ngOnInit(): void {
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY');
    this.location = sessionStorage.getItem("locationName");
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    if (this.selectedView.PatientType == "2") {
      if (this.selectedView.Bed != undefined) {
        if (this.selectedView?.Bed.includes('ISO'))
          this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
        else
          this.SelectedViewClass = "m-0 fw-bold alert_animate token";
      } else
        this.SelectedViewClass = "m-0 fw-bold alert_animate token";

    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }
  }

  close() {
    this.us.closeModal();
  }

  print() {
    setTimeout(() => {
      document.title = `${'form'}_${new Date().toISOString()}`;
      window.print();
    }, 500);
  }
    getCTASScoreClass() {
    if(this.selectedView?.CTASScore == '1') {
      return 'Resuscitation';
    }
    else if(this.selectedView?.CTASScore == '2') {
      return 'Emergent';
    }
    else if(this.selectedView?.CTASScore == '3') {
      return 'Urgent';
    }
    else if(this.selectedView?.CTASScore == '4') {
      return 'LessUrgent';
    }
    else if(this.selectedView?.CTASScore == '5') {
      return 'NonUrgent';
    }
    return '';
  }

}
