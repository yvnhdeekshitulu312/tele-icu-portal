import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { LoaderService } from 'src/app/services/loader.service';
import { getLandingPage } from 'src/app/app.utils';

declare var $: any;

@Component({
  selector: 'app-ot-header',
  templateUrl: './ot-header.component.html',
  styleUrls: ['./ot-header.component.scss']
})
export class OtHeaderComponent implements OnInit {
  doctorDetails: any;
  hospitalId: any;
  location: any;
  currentdate: any;
  ward: any;
  wardID: any;
  langData: any;
  IsSwitch = false;
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
  IsHome: boolean = false;

  @Input() IsSwitchWard: any = false;
  @Output() selectedWard = new EventEmitter<any>();
  @Output() filteredDataChange = new EventEmitter<any[]>();
  FetchUserFacilityDataList: any;
  constructor(private portalConfig: ConfigService, private config: BedConfig, private router: Router,@Inject(DOCUMENT) private document: Document, private loader: LoaderService) {
    this.langData = this.portalConfig.getLangData();
  }
  startClock(): void {
    this.interval = setInterval(() => {
      this.currentTimeN = new Date();
    }, 1000);
  }

  stopClock(): void {
    clearInterval(this.interval);
  }

  ngOnInit(): void {
    this.IsHome = sessionStorage.getItem("fromDocHomePage") === "true" ? true : false;
    this.IsSwitch = this.IsSwitchWard;
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY | H:mm');
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
    this.startClock();
    this.fetchUserFacility();
    this.loader.getDefaultLangCode().subscribe((res) => {
      this.loadStyle(res);
    })
  }

  onLogout() {
    this.portalConfig.onLogout();
   }

   fetchUserFacility() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
    .subscribe((response: any) => {
      this.FetchUserFacilityDataList = response.FetchUserFacilityDataList;
    },
    (err) => {
      })

  }
  getSSNSearch(key: any) {
    this.filteredDataChange.emit(key.target.value);   
    }
  selectFacility() {
    if (this.FetchUserFacilityDataList) {
      const selectedItem = this.FetchUserFacilityDataList.find((value: any) => value.FacilityID === this.wardID);
      sessionStorage.setItem("facility", JSON.stringify(selectedItem));
      this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
      $("#facilityMenu").modal('hide');
      this.selectedWard.emit();
      if(selectedItem.FacilityType === 'Ward')
        this.router.navigate(['/ward']);
      else
        this.router.navigate(['/suit'])
    }
  }
  openFacilityMenu() {
    $("#facilityMenu").modal('show');
  }
  // GoBackToHome() {
  //   sessionStorage.setItem("FacilityID", JSON.stringify(''));
  //   sessionStorage.setItem("facility", JSON.stringify(''));
  //   this.router.navigate(['/suit'])
  // } 

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

  suittype(featureTypeID: any) {
    this.suitType = featureTypeID;
    this.hospitalFeatures = this.hospitalFilterFeatures.filter(feature => feature.FeatureTypeID === featureTypeID);
    this.hospitalModules = this.hospitalFilterModules.filter((module) => {
      const features = this.getFeaturesByModuleId(module.ModuleID);
      return features.length > 0;
    });
    this.hospitalModules.forEach((element: any, index: any) => {        
      if((index + 1) % 3 == 0 || (index + 2) % 3 == 0) {
        element.Class = "block left";
      }
      else {
        element.Class = "block";
      }
      var featuresCount = this.hospitalFeatures.filter(feature => feature.ModuleID === element.ModuleID);
      if(featuresCount.length <= 10) {
        element.Class = element.Class + " lessten";
      }
    });
  }

  getFeaturesByModuleId(moduleId: string) {
    return this.hospitalFeatures.filter(feature => feature.ModuleID === moduleId);
  }

  redirecttourl(url: any) {
    if(url == "suit/WorkList?PTYP=1") {
      this.router.navigate(['/suit/labworklist']);
    }
    else if(url == "suit/ReferralWorklist") {
      this.router.navigate(['/suit/radiologyworklist']);
    }
    else this.router.navigate(['/' + url]);
  }

  onFacilitySelectChange(event:any) {
    sessionStorage.setItem("FacilityID", JSON.stringify(event.target.value));
  }

  GoBackToHome() {
    sessionStorage.removeItem("fromLoginToWard");
    sessionStorage.removeItem("fromDocHomePage");
    sessionStorage.removeItem("facility");
    if (sessionStorage.getItem("homescreen") === "suit") {
      sessionStorage.setItem("FromRadiology", "false");
      this.router.navigate(['/suit'])
    }
    else {
      //this.router.navigate(['/login/doctor-home'])
      this.router.navigate(getLandingPage());
    }
  }
}
