import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { LoaderService } from 'src/app/services/loader.service';
import { SuitConfigService } from '../services/suitconfig.service';
import { getLandingPage } from 'src/app/app.utils';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'src/app/shared/utility.service';
import { ipissues } from 'src/app/login/changepassword/changepassword.component';
import { Subscription } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-suit-header',
  templateUrl: './suit-header.component.html',
  styleUrls: ['./suit-header.component.scss']
})
export class SuitHeaderComponent implements OnInit {
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
  employeeInfo: any;
  base64StringSig1 = '';
  showSignature: boolean = false;
  employeeSignInfoForm!: FormGroup;
  isChangePassword = false;
  changePwdForm!: FormGroup;
  changePwdValidationMSg: string = '';
  showPasswordValidationMsg: boolean = false;
  ValidationMSG: string = '';
  selectedFacilityId: number = 0;

  @Input() IsSwitchWard: any = false;
  @Output() selectedWard = new EventEmitter<any>();
  @Output() filteredDataChange = new EventEmitter<any[]>();
  FetchUserFacilityDataList: any;
  patientID: any;
  alertSubscription!: Subscription;
  constructor(private fb: FormBuilder, private us: UtilityService, private portalConfig: ConfigService, private config: BedConfig, private suitconfig: SuitConfigService, private router: Router,@Inject(DOCUMENT) private document: Document, private loader: LoaderService) {
    this.langData = this.portalConfig.getLangData();
    this.employeeSignInfoForm = this.fb.group({
      Signature1: ['']
    });
    this.changePwdForm = this.fb.group({
      UserName: [''],
      OldPassword: ['', Validators.required],
      NewPassword: ['', Validators.required],
      ConfirmPassword: ['', Validators.required]
    });
  }
  startClock(): void {
    this.interval = setInterval(() => {
      this.currentTimeN = new Date();
    }, 1000);

    this.changePwdForm.patchValue({
      UserName: this.doctorDetails[0].UserName
    });
  }

  stopClock(): void {
    clearInterval(this.interval);
  }

  ngOnInit(): void {
    this.IsSwitch = this.IsSwitchWard;
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.selectedFacilityId = this.doctorDetails[0]?.FacilityId || JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY | H:mm');
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    if(sessionStorage.getItem("facility")!='undefined'){
      this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
      this.wardID = this.ward.FacilityID || this.selectedFacilityId;
    }
   
    this.startClock();
    this.fetchUserFacility();
    this.fetchUserFavourite();
    this.loader.getDefaultLangCode().subscribe((res) => {
      this.loadStyle(res);
    })

    this.alertSubscription = this.us.alertData$.subscribe((patientID: any) => {
      this.patientID = patientID;
    });
  }

  onLogout() {
    this.portalConfig.onLogout();
   }

   fetchUserFacility() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
    .subscribe((response: any) => {
      this.FetchUserFacilityDataList = response.FetchUserFacilityDataList;
      if (this.doctorDetails[0].IsPharmacist || this.doctorDetails[0].IsIPPharmacist) {
        const facilityid = sessionStorage.getItem("facility");
        const fac = this.FetchUserFacilityDataList.find((x:any) => x.FacilityID == facilityid);
        if (fac) {
          this.ward = fac;
          this.wardID = fac.FacilityID;
          sessionStorage.setItem("facility", JSON.stringify(fac));
          sessionStorage.setItem("FacilityID", JSON.stringify(this.wardID));
        }
      }
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
      //this.selectedWard.emit();
      if(selectedItem.FacilityType === 'Ward') {
        this.wardID = this.ward.FacilityID;
        this.selectedWard.emit();
        this.router.navigate(['/ward']);
      }
      else
        this.router.navigate(['/suit'])
    }
  }
  openFacilityMenu() {
    $("#facilityMenu").modal('show');
  }
  GoBackToHome() {
    if(!this.doctorDetails[0].IsERHeadNurse && !this.doctorDetails[0].IsWardNurse) {
      sessionStorage.setItem("FacilityID", JSON.stringify(''));
      sessionStorage.setItem("facility", JSON.stringify(''));
      sessionStorage.removeItem("selectedPatientForAdmission");
      sessionStorage.removeItem("fromDocCalendar");
      sessionStorage.removeItem("fromDocCalendarSSN");
      sessionStorage.removeItem("fromRadiology");
        sessionStorage.removeItem("RadiologyPatientData");
        sessionStorage.removeItem("fromBlockedAppointments");
        sessionStorage.removeItem("fromFutureAppointments");
        sessionStorage.removeItem("dischargefollowups");
      //this.router.navigate(['/suit']);
      this.router.navigate(getLandingPage());
    }
    else {
      this.router.navigate(getLandingPage());
    }
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

  fetchUserFavourite() {
    this.suitconfig.FetchUserFavourite(this.doctorDetails[0].UserId, this.hospitalId).subscribe((response) => {
      this.favouritesList = response.FetchHospitalFeatureOutputLists;
    },
      (err) => {

      })
  }

  favouriteclick(data: any) {
    let payload = {
      "RoleFavouriteID": 0,
      "SID": this.doctorDetails[0].UserId,
      "RoleID": data.RoleID,
      "Moduleid": data.ModuleID,
      "Featureid": data.FeatureID,
      "HospitalId": this.hospitalId,
      "IsFavourite": data.IsFavourite === 1 ? 0 : 1,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": 1
    }
    this.suitconfig.SaveHospitalFeatureFavourites(payload).subscribe(
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

  fetchHospitalUserRoleDetails() {
    this.suitconfig.FetchHospitalUserRoleDetails(this.doctorDetails[0].UserId, this.hospitalId).subscribe((response) => {
      this.hospitalModules = response.FetchHospitalModulesOutputLists;
      this.hospitalFeatures = response.FetchHospitalFeatureOutputLists;
      this.hospitalFilterModules = response.FetchHospitalModulesOutputLists;
      this.hospitalFilterFeatures = response.FetchHospitalFeatureOutputLists;      
      this.suittype(this.suitType);
    },
      (err) => {

      })
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

  redirecttourl(url: any,KPIAccessID:any) {
    if(KPIAccessID=='2')
    {
       this.ValidationMSG = "No Access to View Report";
      $("#paswordNoMatchMsg").modal('show');
      return;
    }
    sessionStorage.removeItem('selectedView');
    sessionStorage.setItem("worklisturl", url);
    const selectedItem = this.FetchUserFacilityDataList.find((value: any) => value.FacilityID === this.wardID);
    if (selectedItem) {
      sessionStorage.setItem("facility", JSON.stringify(selectedItem));
    }
    let updatedUrl = url;
    if (url == "suit/WorkList?PTYP=1") {
      updatedUrl = 'suit/labworklist';
    }
    else if (url == "suit/ReferralWorklist") {
      updatedUrl = 'suit/radiologyworklist';
    }
    else if(url == "suit/Dentalworklist" || url == 'suit/Opthamaologyworklist' || url == 'suit/Dermatologyworklist' || url == 'suit/Cardiologyworklist' || url == 'suit/NeuroPhysiologyworklist') {
      updatedUrl = 'suit/worklist';       
    }
    window.location.href = updatedUrl;
  }

  onFacilitySelectChange(event:any) {
    sessionStorage.setItem("FacilityID", JSON.stringify(event.target.value));
  }

  getEmployeeInfo(type: number) {
    this.portalConfig.FetchEmployeeInfo(this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, 3392, this.hospitalId).subscribe(response => {
      this.employeeInfo = response.FetchEmployeeInfoDataList[0];
      this.base64StringSig1 = this.employeeInfo.Base64Signature;
      this.showSignature = false;
      setTimeout(() => {
        this.showSignature = true;
      }, 0);
    })
    if (type == 0)
      $("#doctorlist_modal").modal('show');
  }

  clearEmployeeInfo() {
    this.employeeInfo = "";
    this.base64StringSig1 = '';
    this.showSignature = false;
    setTimeout(() => {
      this.showSignature = true;
    }, 0);
    this.employeeSignInfoForm.patchValue({ Signature1: '' });
  }

  base64Relative1Signature(event: any) {
    this.employeeSignInfoForm.patchValue({ Signature1: event });
  }

  updateDoctorSignature() {
    const signPayload = {
      EMPID: this.doctorDetails[0].EmpId,
      Signature: this.employeeSignInfoForm.get('Signature1')?.value,
      Hospitalid: Number(this.hospitalId),
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: 3392
    }
    this.portalConfig.SaveEmployeeSignatures(signPayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#doctorSignatureSavedMsg").modal('show');
          this.getEmployeeInfo(1);
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }

  clearSignature() {
    this.base64StringSig1 = '';
    this.showSignature = false;
    setTimeout(() => {
      this.showSignature = true;
    }, 0);
    this.employeeSignInfoForm.patchValue({ Signature1: '' });
  }

  updatePassword() {
    this.showPasswordValidationMsg = false;
    if (this.changePwdForm.valid) {
      const newpwd = this.changePwdForm.get('NewPassword')?.value;
      const conpwd = this.changePwdForm.get('ConfirmPassword')?.value;
      if (conpwd != newpwd) {
        this.changePwdValidationMSg = "New password and confirm password doesn't match";
        this.showPasswordValidationMsg = true;
        return;
      }

      const payload = {
        "NAME": this.doctorDetails[0].UserName,
        "NEWpassword": this.changePwdForm.get('NewPassword')?.value,
        "OLDpassword": this.changePwdForm.get('OldPassword')?.value,
        "WorkStationID": 3395,
        "HospitalID": this.hospitalId,
      };

      this.us.post(ipissues.SaveChangedPassword, payload).subscribe((response: any) => {
        if (response.Status === "Success") {
          $("#changePwdSaveMsg").modal('show');
        }
        else {
          if (response.Status == 'Fail') {
            this.ValidationMSG = response.Message;
            $("#paswordNoMatchMsg").modal('show');
          }
        }
      },
        (err) => {
        })
    }
    else {
      this.changePwdValidationMSg = "Please enter all fields";
      this.showPasswordValidationMsg = true;
    }
  }

  closeChangePwdModal() {
    $("#doctorlist_modal").modal('hide');
    sessionStorage.clear()
    localStorage.clear();
    this.router.navigate(['/login'])
  }

  ngOnDestroy() {
    this.alertSubscription.unsubscribe()
  }
}
