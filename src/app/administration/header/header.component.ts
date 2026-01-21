import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-admin-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  doctorDetails: any;
  hospitalId: any;
  location: any;
  currentdate: any;
  currentdateN:any;
  currentTimeN: Date = new Date();
  interval: any;
  ward: any;
  wardID: any;
  langData: any;
  IsSwitch = false;
  IsHome = false;
  @Input() IsSwitchWard: any = false;
  @Input() InputHome: any = true;
  @Output() selectedWard = new EventEmitter<any>();
  @Output() filteredDataChange = new EventEmitter<any[]>();
  FetchUserFacilityDataList: any;
  constructor(private portalConfig: ConfigService, private config: BedConfig, private router: Router) {
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
    this.IsSwitch = this.IsSwitchWard;
    this.IsHome = this.InputHome;
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY, H:mm');
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
    this.startClock();
    this.fetchUserFacility();
  }

  onLogout() {
    this.portalConfig.onLogout();
   }

   fetchUserFacility() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
    .subscribe((response: any) => {
      this.FetchUserFacilityDataList = response.FetchUserWardFacilityDataaList;
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
      this.router.navigate(['/ward']);
    }
  }
  GoBackToHome() {
    this.router.navigate(['/login/doctor-home'])
  }

  openFacilityMenu() {
    $("#facilityMenu").modal('show');
  }
}
