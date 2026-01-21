import { Component, OnInit } from '@angular/core';
import { SuitConfigService } from '../services/suitconfig.service';
import { Router } from '@angular/router';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { mapUserDetails } from 'src/app/administration/mapuser/mapuser.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
  selector: 'app-suit-dashboard',
  templateUrl: './suit-dashboard.component.html',
  styleUrls: ['./suit-dashboard.component.scss']

})
export class SuitDashboardComponent implements OnInit {
  doctorDetails: any;
  hospitalId: any;
  facilityId: any;
  currentGreeting!: string;
  hospitalModules: any[] = [];
  hospitalFeatures: any[] = [];
  hospitalFilterModules: any[] = [];
  hospitalFilterFeatures: any[] = [];
  hospitalFilterFeaturesRoles: any[] = [];
  favouritesList: any[] = [];
  filteredFavouritesList: any[] = [];
  suitType = '4';
  moduleFeatures: any[] = [];
  filteredmoduleFeatures: any[] = [];
  moduleName: string = "";
  selectedModule: any;
  FetchUserFacilityDataList: any;
  wardID: any;
  selectedFacility: string = "";
  ward: any;
  searchTerm: any;
  usersList: any = [];
  selectedUser: any = null;
  userSearchText: any;
  ReferalDataCount: any[] = [];
  IsPhysiotherapy: any;
  IsSocialWorker: any;
  constructor(private config: SuitConfigService, private router: Router, private bedconfig: BedConfig, private us: UtilityService) {
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
  }

  ngOnInit(): void {
    this.setCurrentGreeting();
    this.fetchHospitalUserModuleDetails();
    //this.fetchHospitalUserRoleDetails();
    this.fetchUserFavourite();
    this.fetchUserFacility();

        this.IsSocialWorker = sessionStorage.getItem("IsSocialWorker");
      this.IsPhysiotherapy = sessionStorage.getItem("IsPhysiotherapy");
       
    if(sessionStorage.getItem("IsSocialWorker")||sessionStorage.getItem("IsPhysiotherapy"))
      this.FetchReferalData();
  }


  FetchReferalData() {
    const selectedUserId = this.doctorDetails[0].EmpId;
    var SpecialiseID =0;  
    if((sessionStorage.getItem("IsSocialWorker")||'')=='true')
      SpecialiseID=317;
    else if((sessionStorage.getItem("IsPhysiotherapy")||'')=='true')
      SpecialiseID=101;

      this.config.FetchReferalSocialWorkerDoctorOrders(SpecialiseID,selectedUserId, this.hospitalId).subscribe((response) => {
      this.ReferalDataCount = response.FetchReferalSocialWorkerDoctorOrdersCountDataLists;
      
    },
      (err) => {

      })
  }

  private setCurrentGreeting(): void {
    const currentHour = new Date().getHours();

    if (currentHour >= 0 && currentHour < 12) {
      this.currentGreeting = 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 17) {
      this.currentGreeting = 'Good Afternoon';
    } else {
      this.currentGreeting = 'Good Evening';
    }
  }

  fetchUserFacility() {
    const selectedUserId = this.selectedUser ? this.selectedUser.ID : this.doctorDetails[0].UserId;
    this.bedconfig.fetchUserFacility(selectedUserId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserFacilityDataList;
      },
        (err) => {
        })

  }
  onFacilitySelectChange(event: any) {
    var facid = event.target.value;
    this.selectedFacility = facid;
    if (this.FetchUserFacilityDataList) {
      const selectedUserId = this.selectedUser ? this.selectedUser.ID : this.doctorDetails[0].UserId;
      this.config.FetchHospitalUserRoleFacilityDetails(selectedUserId, facid, this.hospitalId).subscribe((response) => {
        this.hospitalFilterFeaturesRoles = response.FetchHospitalFeatureOutputLists;
        
        this.hospitalFeatures = response.FetchHospitalFeatureOutputLists;
        this.hospitalFilterModules = response.FetchHospitalModulesOutputLists;
        this.hospitalFilterFeatures = response.FetchHospitalFeatureOutputLists;
        this.suittype(this.suitType);
      },
        (err) => {

        })
      const selectedItem = this.FetchUserFacilityDataList.find((value: any) => value.FacilityID === this.wardID);
      sessionStorage.setItem("facility", JSON.stringify(selectedItem));
      sessionStorage.setItem("FacilityID", JSON.stringify(facid));
      this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');

    }
    //this.selectedFacility = facid;
    sessionStorage.setItem("FacilityID", JSON.stringify(facid));
  }
  fetchHospitalUserModuleDetails() {
    this.config.FetchHospitalUserModuleDetails(this.doctorDetails[0].UserId, this.hospitalId).subscribe((response) => {
      this.hospitalModules = response.FetchHospitalModulesOutputLists;
    },
      (err) => {

      })
  }

  fetchHospitalUserRoleDetails() {
    const selectedUserId = this.selectedUser ? this.selectedUser.ID : this.doctorDetails[0].UserId
    this.config.FetchHospitalUserRoleDetails(selectedUserId, this.hospitalId).subscribe((response) => {
      //this.hospitalModules = response.FetchHospitalModulesOutputLists;
      this.hospitalFeatures = response.FetchHospitalFeatureOutputLists;
      this.hospitalFilterModules = response.FetchHospitalModulesOutputLists;
      this.hospitalFilterFeatures = response.FetchHospitalFeatureOutputLists;
      this.suittype(this.suitType);
    },
      (err) => {

      })
  }

  getFeaturesByModuleId(module: any) {
    this.selectedUser = null;
    this.userSearchText = `${this.doctorDetails[0].EmpNo}-${this.doctorDetails[0].EmployeeName}`
    this.fetchUserFacility();
    this.config.FetchHospitalUserRoleDetails(this.doctorDetails[0].UserId, this.hospitalId).subscribe((response) => {
      this.hospitalFeatures = response.FetchHospitalFeatureOutputLists;
      this.hospitalFilterModules = response.FetchHospitalModulesOutputLists;
      this.hospitalFilterFeatures = response.FetchHospitalFeatureOutputLists;
      
      this.wardID = "0";
      $("#acc_receivable").modal('show');
      this.moduleFeatures = this.hospitalFeatures.filter(feature => feature.ModuleID === module.ModuleID);
      this.filteredmoduleFeatures = this.moduleFeatures;
      this.moduleName = module.ModuleName;
      this.selectedModule = module;
      this.suittype(this.suitType);
    },
      (err) => {

      })
  }

  suittype(featureTypeID: any) {
    this.suitType = featureTypeID;
    if (this.selectedModule != undefined && this.selectedModule != "") {

      this.hospitalFeatures = this.hospitalFilterFeatures.filter(feature => feature.FeatureTypeID === featureTypeID && feature.ModuleID === this.selectedModule.ModuleID);
      this.hospitalModules = this.hospitalFilterModules.filter((module) => {
        const features = this.hospitalFeatures.filter(feature => feature.ModuleID === this.selectedModule.ModuleID);//this.getFeaturesByModuleId(module.ModuleID);
        return features.length > 0;
      });
      this.moduleFeatures = this.hospitalFeatures.filter(feature => feature.ModuleID === this.selectedModule.ModuleID);//this.getFeaturesByModuleId(module.ModuleID);
      this.filteredmoduleFeatures = this.moduleFeatures;
    }
    this.hospitalModules.forEach((element: any, index: any) => {
      if ((index + 1) % 3 == 0 || (index + 2) % 3 == 0) {
        element.Class = "block left";
      }
      else {
        element.Class = "block";
      }
      var featuresCount = this.hospitalFeatures.filter(feature => feature.ModuleID === this.selectedModule.ModuleID);
      if (featuresCount.length <= 10) {
        element.Class = element.Class + " lessten";
      }
    });

  }

  favouriteclick(data: any) {
    var facid;
    if(data.WorkStationId==null)
      facid= this.selectedFacility
    else
      facid = data.WorkStationId;
      this.selectedFacility=facid;
    //data.IsFavourite = 1;
    const selectedUserId = this.selectedUser ? this.selectedUser.ID : this.doctorDetails[0].UserId 
      if (this.FetchUserFacilityDataList) {
        this.config.FetchHospitalUserRoleFacilityDetails(selectedUserId, facid, this.hospitalId).subscribe((response) => {
          if(response.Code === 200) {
            this.hospitalFilterFeaturesRoles = response.FetchHospitalFeatureOutputLists;
            if (this.selectedFacility != '') {
              var roleid = this.hospitalFilterFeaturesRoles.find(x => x.FeatureID === data.FeatureID && x.ModuleID === data.ModuleID);
              let payload = {
                "RoleFavouriteID": 0,
                "SID": selectedUserId,
                "RoleID": roleid.RoleID,
                "Moduleid": data.ModuleID,
                "Featureid": data.FeatureID,
                "HospitalId": this.hospitalId,
                "IsFavourite": data.IsFavourite === 1 ? 0 : 1,
                "USERID": selectedUserId,
                "WORKSTATIONID": this.selectedFacility
              }
              this.config.SaveHospitalFeatureFavourites(payload).subscribe(
                (response) => {
                  if (response.Code == 200) {
                    this.fetchHospitalUserRoleDetails();
                    this.fetchUserFavourite();
                  }
                },
                (err) => {
                  console.log(err)
                });
            }
            else {
              $("#facilityValidation").modal('show');
            }
          }
        },
          (err) => {
  
          })
        const selectedItem = this.FetchUserFacilityDataList.find((value: any) => value.FacilityID === this.wardID);
        sessionStorage.setItem("facility", JSON.stringify(selectedItem));
        // sessionStorage.setItem("FacilityID", JSON.stringify(facid));
        if(sessionStorage.getItem("facility")!='undefined')
        this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
  
      }      



    
  }

  fetchUserFavourite() {
    this.config.FetchUserFavourite(this.doctorDetails[0].UserId, this.hospitalId).subscribe((response) => {
      this.favouritesList = response.FetchHospitalFeatureOutputLists;
      this.filteredFavouritesList = response.FetchHospitalFeatureOutputLists;
    },
      (err) => {

      })
  }

  redirecttourl(url: string, FacilityID: string, data: any) {

     if(data.KPIAccessID=='2')
    {    
      $("#KPIValidation").modal('show');
      return;
    }
    sessionStorage.setItem("FeatureID", data.FeatureID);
    if (!url) {
      console.error("Invalid URL", url);
      return;
    }

    if (this.selectedFacility) {
      sessionStorage.setItem("worklisturl", url);
      FacilityID = this.selectedFacility;
      $("#acc_receivable").modal('hide');
  
      const urlMap: { [key: string]: string } = {
        "suit/WorkList?PTYP=1": "/suit/labworklist",
        "suit/ReferralWorklist": "/suit/radiologyworklist",
        "suit/physiotherapyworklist": "/suit/physiotherapyworklist",
        "suit/radiologyworklist": "/suit/radiologyworklist"
      };
  
      if (urlMap[url]) {
        this.router.navigate([urlMap[url]]);
      } else if (url.startsWith("suit/") && url.endsWith("worklist")) {
        this.router.navigate(['/suit/worklist']);
      } else {
        this.router.navigate(['/' + url]);
      }
  
      sessionStorage.setItem("FacilityID", JSON.stringify(FacilityID));
    } else {
      $("#facilityValidation").modal('show');
    }
  }
  

  redirecttourlFav(url: string, FacilityID: string, data: any) {
    if(data.KPIAccessID=='2')
    {    
      $("#KPIValidation").modal('show');
      return;
    }
    sessionStorage.setItem("FeatureID", data.FeatureID);
    if (!url) {
      console.error("Invalid URL", url);
      return;
    }

    if (FacilityID) {
      sessionStorage.setItem("worklisturl", url);
      const facilityName = this.FetchUserFacilityDataList.find((x: any) => x.FacilityID === FacilityID);
      sessionStorage.setItem("facility", JSON.stringify(facilityName));
      $("#acc_receivable").modal('hide');
  
      const urlMap: { [key: string]: string } = {
        "suit/WorkList?PTYP=1": "/suit/labworklist",
        "suit/ReferralWorklist": "/suit/radiologyworklist",
        "suit/physiotherapyworklist": "/suit/physiotherapyworklist",
        "suit/radiologyworklist": "/suit/radiologyworklist",
         "suit/employeewise-worklist": "/suit/employeewise-worklist"
      };
  
      if (urlMap[url]) {
        this.router.navigate([urlMap[url]]);
      } else if (url.startsWith("suit/") && url.endsWith("worklist")) {
        this.router.navigate(['/suit/worklist']);
      } else {
        this.router.navigate(['/' + url]);
      }
      sessionStorage.removeItem('selectedView');
      sessionStorage.removeItem('FromBedBoard');
      sessionStorage.removeItem('BedList');
      sessionStorage.removeItem('InPatientDetails');
      sessionStorage.setItem("FacilityID", JSON.stringify(FacilityID));
    } else {
      $("#facilityValidation").modal('show');
    }
  }

  filterGroupedData(searchTerm: string): void {

    this.filteredmoduleFeatures = this.moduleFeatures.filter((x: any) => x.FeatureName.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  navigateToFacility() {
    this.router.navigate(['/ward']);
  }

  filterLinks(event: any) {
    this.filteredFavouritesList = this.favouritesList.filter((item: any) =>
      item.FeatureName.toLowerCase().includes(event.target.value.toLowerCase().trim())
    );
  }

  fetchUsers(event: any) {
    if (event.target.value.length > 2) {
      const params = {
        WorkStationID: 3747,
        Name: event.target.value,
        HospitalID: this.hospitalId
      };
      const url = this.us.getApiUrl(mapUserDetails.FetchSSUSERSData, params);
      this.us.get(url).subscribe((response: any) => {
        if (response.Code === 200) {
          this.usersList = response.FetchSSUSERSDataKList;
        }
      },
        (err) => {

        });
    } else {
      this.usersList = [];
    }
  }

  onUserSelected(item: any) {
    this.selectedUser = item;
    this.usersList = [];
    this.fetchHospitalUserRoleDetails();
    this.fetchUserFacility();
  }

  onModalClose() {
    this.selectedUser = null;
    this.userSearchText = '';
    this.selectedModule = undefined;
    this.fetchHospitalUserModuleDetails();
  }

  navigateToReferralWorklist() {
    sessionStorage.setItem("isFromSuitDashboard", 'true');
    if((sessionStorage.getItem("IsSocialWorker")||'')=='true') {      
      this.router.navigate(['/shared/referredToMe']);
    }      
    else if((sessionStorage.getItem("IsPhysiotherapy")||'')=='true') {
      this.router.navigate(['/shared/physioReferralWorklist']);
    }
  }
}

interface Feautures {
  FeatureID: string
  FeatureName: string
}
