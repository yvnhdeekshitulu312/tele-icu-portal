import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { EmergencyConfigService as EmergencyConfig } from '../services/config.service';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { LoaderService } from 'src/app/services/loader.service';
import { getLandingPage } from 'src/app/app.utils';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ipissues } from 'src/app/login/changepassword/changepassword.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
  selector: 'app-emergency-header',
  templateUrl: './emergency-header.component.html',
  styleUrls: ['./emergency-header.component.scss']
})
export class EmergencyHeaderComponent implements OnInit {
  doctorDetails: any;
  hospitalId: any;
  location: any;
  currentdate: any;
  ward: any;
  wardID: any;
  langData: any;
  IsSwitch = false;
  IsHome = true;
  currentdateN: any;
  currentTime: any;
  currentTimeN: Date = new Date();
  interval: any;
  hospitalModules: any[] = [];
  hospitalFeatures: any[] = [];
  hospitalFilterModules: any[] = [];
  hospitalFilterFeatures: any[] = [];
  favouritesList: any[] = [];
  suitType = '4';
  FetchUserFacilityDataList: any;
  @Input() IsSwitchWard: any = false;
  @Input() InputHome: any = true;
  @Output() filteredDataChange = new EventEmitter<any[]>();
  @Output() selectedWard = new EventEmitter<any>();

  employeeInfo: any;
  base64StringSig1 = '';
  showSignature: boolean = false;
  employeeSignInfoForm!: FormGroup;
  isChangePassword = false;
  changePwdForm!: FormGroup;
  changePwdValidationMSg: string = '';
  showPasswordValidationMsg: boolean = false;
  ValidationMSG: string = '';

  constructor(private fb: FormBuilder, private portalConfig: ConfigService, private config: EmergencyConfig, private router: Router, private loader: LoaderService, @Inject(DOCUMENT) private document: Document, private us: UtilityService) {
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
  }

  stopClock(): void {
    clearInterval(this.interval);
  }

  ngOnInit(): void {
    this.IsSwitch = this.IsSwitchWard;
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY | H:mm');
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    //this.wardID = this.ward.FacilityID;
    this.startClock();
    this.loader.getDefaultLangCode().subscribe((res) => {
      this.loadStyle(res);
    })
    this.fetchUserFacility();
    this.changePwdForm.patchValue({
      UserName: this.doctorDetails[0].UserName
    });
  }

  onLogout() {
    this.portalConfig.onLogout();
  }

  GoBackToHome() {
    sessionStorage.setItem("FacilityID", JSON.stringify(''));
    //this.router.navigate(['/login/doctor-home'])
    // this.router.navigate(['/suit'])
    if (sessionStorage.getItem("homescreen") === "suit") {
      sessionStorage.setItem("FromRadiology", "false");
      this.router.navigate(['/suit'])
    }
    else {
      //this.router.navigate(['/login/doctor-home'])
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

  getSSNSearch(key: any) {
    this.filteredDataChange.emit(key.target.value);
  }

  openFacilityMenu() {
    $("#facilityMenu").modal('show');
  }

  fetchUserFacility() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserFacilityDataList;
        var facid = this.ward?.FacilityID?.toString();
        if (facid === undefined) {
          facid = this.ward;
        }
        var facility = this.FetchUserFacilityDataList.find((x: any) => x.FacilityID === facid.toString());
        sessionStorage.setItem("facility", JSON.stringify(facility));
        this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.wardID = this.ward.FacilityID;
        //this.router.navigate(['/ward']);
      },
        (err) => {
        })

  }
  selectFacility() {
    if (this.FetchUserFacilityDataList) {
      const selectedItem = this.FetchUserFacilityDataList.find((value: any) => value.FacilityID === this.wardID);
      sessionStorage.setItem("facility", JSON.stringify(selectedItem));
      this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
      $("#facilityMenu").modal('hide');
      this.selectedWard.emit();
      if (this.ward.FacilityName.includes('EMERGENCY'))
        this.router.navigate(['/ward']);
      else
        this.router.navigate(['/ward']);
    }
  }

  openVisualTriage() {
    $("#facilityMenu").modal('hide');
    this.router.navigate(['/emergency/visualtriage']);
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
}
