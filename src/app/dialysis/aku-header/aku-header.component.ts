import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { DialysisConfigService as EmergencyConfig } from '../services/config.service';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-aku-header',
  templateUrl: './aku-header.component.html',
  styleUrls: ['./aku-header.component.scss']
})
export class AkuHeaderComponent implements OnInit {
  doctorDetails: any;
  hospitalId: any;
  location: any;
  currentdate: any;
  ward: any;
  wardID: any;
  langData: any;
  IsSwitch = false;
  IsHome = true;
  currentdateN:any;
  currentTime:any;
  currentTimeN: Date = new Date();
  interval: any;
  hospitalModules: any[] = [];
  hospitalFeatures: any[] = [];
  hospitalFilterModules: any[] = [];
  hospitalFilterFeatures: any[] = [];
  favouritesList: any[] = [];
  suitType = '4';
  @Input() InputHome: any = true;
  @Output() filteredDataChange = new EventEmitter<any[]>();

  constructor(private portalConfig: ConfigService, private router: Router, private loader: LoaderService, @Inject(DOCUMENT) private document: Document) {
    this.langData = this.portalConfig.getLangData();
   }

  ngOnInit(): void {
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY | H:mm');
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
    this.startClock();
    this.loader.getDefaultLangCode().subscribe((res) => {
      this.loadStyle(res);
    })
  }

  startClock(): void {
    this.interval = setInterval(() => {
      this.currentTimeN = new Date();
    }, 1000);
  }

  stopClock(): void {
    clearInterval(this.interval);
  }

  onLogout() {
    this.portalConfig.onLogout();
   }

   GoBackToHome() {
    sessionStorage.setItem("FacilityID", JSON.stringify(''));
    //this.router.navigate(['/login/doctor-home'])
    this.router.navigate(['/suit'])
  } 

  loadStyle(code: string) {
    let enStyle = './assets/styles/suit-style-EN.css';
    let arStyle = './assets/styles/suit-style-AR.css';
    let loadStyle = ""
    if (code === 'en') {
      loadStyle = enStyle;
    } else if (code === 'ar') {
      loadStyle = arStyle;
    }
    const head = this.document.getElementsByTagName('head')[0];
    let linkElement = document.getElementById("client-theme");
    
    if (linkElement === null) {
      const style = this.document.createElement('link');
      style.id = 'client-theme';
      style.rel = 'stylesheet';
      style.href = `${loadStyle}`;
      head.appendChild(style);
    } else {
      linkElement.setAttribute('href', `${loadStyle}`)
    }

  }

  getSSNSearch(key: any) {
    this.filteredDataChange.emit(key.target.value);   
  }
}
