import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  pageUrl!: any;
  langData: any;
  doctorDetails: any;
  constructor(private config: ConfigService, private router: Router) {
    this.langData = this.config.getLangData();
  }

  ngOnInit(): void {
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.pageUrl = this.router.url;
    });
    // this.router.events.subscribe((url: any) => {

    // });
  }
  onLogout() {
    // sessionStorage.removeItem("patientInfo");
    // sessionStorage.removeItem("PatientDetails");
    // sessionStorage.removeItem("appointment");
    // sessionStorage.removeItem("selectedRegCode");
    // this.router.navigate(['/login']);
    this.config.onLogout();
  }

  bookAppointment(type: number): void {
    if(type == 2) {
      sessionStorage.setItem("isVideoConsultation", "true");
    }
    else {
      sessionStorage.setItem("isVideoConsultation", "false");
    }
  }
  gotoMyFamily() {
    this.router.navigate(['/home/myfamily'])
  }
}
