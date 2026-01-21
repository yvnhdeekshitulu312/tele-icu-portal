import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from './../pharmacy/services/config.service';
import { BaseComponent } from 'src/app/shared/base.component';
import * as moment from 'moment';


@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.scss']
})
export class PharmacyComponent extends BaseComponent implements OnInit {
  IsSwitch = false;
  interval: any;
  IsHome = false;
  location:any;
  currentdate: any;
  currentdateN:any;
  currentTimeN: Date = new Date();
  
  @Input() InputHome: any = true;
  @Output() selectedWard = new EventEmitter<any>();
  @Output() filteredDataChange = new EventEmitter<any[]>();
  FetchUserFacilityDataList: any;
  
  constructor(private router: Router, private config: ConfigService) { 
    super()
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
    this.IsHome = this.InputHome;
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY, H:mm');
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
    this.startClock();
    this.fetchUserFacility();
  }

  onLogout() {
    this.config.onLogout();
   }
   fetchUserFacility() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalID)
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
      this.selectedWard.emit();
    }
  }
  GoBackToHome() {
    sessionStorage.setItem("FacilityID", JSON.stringify(''));
    this.router.navigate(['/suit'])
  }
  navigateToGlobalItemMaster() {
    this.router.navigate(['/pharmacy/globalitemmaster']);
  }
}
