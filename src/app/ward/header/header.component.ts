import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from '../services/config.service';
import { Router } from '@angular/router';
import { getLandingPage } from 'src/app/app.utils';
import { SuitConfigService } from 'src/app/suit/services/suitconfig.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ipissues } from 'src/app/login/changepassword/changepassword.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { Subscription } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  doctorDetails: any;
  hospitalId: any;
  location: any;
  currentdate: any;
  currentdateN: any;
  currentTimeN: Date = new Date();
  interval: any;
  ward: any;
  wardID: any;
  langData: any;
  IsSwitch = false;
  IsHome = false;
  selectedView: any;
  @Input() IsSwitchWard: any = false;
  @Input() InputHome: any = true;
  @Output() selectedWard = new EventEmitter<any>();
  @Output() filteredDataChange = new EventEmitter<any[]>();
  @Input() showAlert: any = false;
  patientID: any;
  FetchUserFacilityDataList: any;
  favouritesList: any[] = [];

  employeeInfo: any;
  base64StringSig1 = '';
  showSignature: boolean = false;
  employeeSignInfoForm!: FormGroup;
  isChangePassword = false;
  changePwdForm!: FormGroup;
  changePwdValidationMSg: string = '';
  showPasswordValidationMsg: boolean = false;
  ValidationMSG: string = '';

  IsDoctor: any;
  IsRODoctor: any;

  alertSubscription!: Subscription;

  constructor(private fb: FormBuilder, private us: UtilityService, private portalConfig: ConfigService, private config: BedConfig, private suitConfig: SuitConfigService, private router: Router) {
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
    this.IsHome = this.InputHome;
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.location = sessionStorage.getItem("locationName");
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY, H:mm');
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || sessionStorage.getItem("selectedView") || '{}');
    this.patientID = this.selectedView.PatientID;
    this.wardID = this.ward.FacilityID;
    this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
    this.IsRODoctor = sessionStorage.getItem("IsRODoctor");

    this.startClock();
    this.fetchUserFacility();
    this.fetchUserFavourite();
    this.changePwdForm.patchValue({
      UserName: this.doctorDetails[0].UserName
    });

    this.alertSubscription = this.us.alertData$.subscribe((patientID: any) => {
      this.patientID = patientID;
      if (patientID) {
        this.showAlert = true;
      }
    });
  }

  fetchUserFavourite() {
    this.suitConfig.FetchUserFavourite(this.doctorDetails[0].UserId, this.hospitalId).subscribe((response) => {
      this.favouritesList = response.FetchHospitalFeatureOutputLists;
    },
      (err) => {

      })
  }

  onLogout() {
    this.portalConfig.onLogout();
  }

  fetchUserFacility() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserFacilityDataList; //response.FetchUserWardFacilityDataaList;
        const fromlogintoWard = sessionStorage.getItem("fromLoginToWard");
        if (this.doctorDetails[0].IsERHeadNurse && fromlogintoWard === 'true' && this.ward === undefined) {
          const emrFacility = this.FetchUserFacilityDataList.find((x: any) => x.FacilityName === 'EMERGENCY WARD');
          if (emrFacility) {
            this.ward = emrFacility;
            this.wardID = emrFacility.FacilityID;
            sessionStorage.setItem("facility", JSON.stringify(emrFacility));
            sessionStorage.removeItem("fromLoginToWard");
          }
        }
        else {
          //this.wardID = this.ward;
          const facid = this.ward.FacilityID === undefined ? this.ward : this.ward.FacilityID;
          const selectedItem = this.FetchUserFacilityDataList.find((value: any) => value.FacilityID === facid.toString());
          this.ward = selectedItem;
          sessionStorage.setItem("facility", JSON.stringify(selectedItem));
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
      this.wardID = this.ward.FacilityID
      $("#facilityMenu").modal('hide');
      this.selectedWard.emit();
      if (selectedItem.FacilityType === 'Ward')
        this.router.navigate(['/ward']);
      else if (selectedItem.FacilityTypeID === '11') {
        this.router.navigate(['/ot/ot-dashboard'])
      }
      else
        this.router.navigate(['/suit'])
    }
  }
  GoBackToHome() {
    sessionStorage.removeItem("fromLoginToWard");
    if (sessionStorage.getItem("homescreen") === "suit") {
      sessionStorage.setItem("FromRadiology", "false");
      this.router.navigate(['/suit'])
    }
    else {
      //this.router.navigate(['/login/doctor-home'])
      this.router.navigate(getLandingPage());
    }
  }

  openFacilityMenu() {
    $("#facilityMenu").modal('show');
  }

  navigateToDietPlan() {
    $("#facilityMenu").modal('hide');
    this.router.navigate(['/ward/diet-plan'])
  }
  navigateToPatientSummary() {
    $("#facilityMenu").modal('hide');
    sessionStorage.setItem("fromSuitPage", "true");
    this.router.navigate(['/shared/patientfolder'])
  }
  navigateToDischargeSummary() {
    $("#facilityMenu").modal('hide');
    sessionStorage.setItem("fromSuitPage", "true");
    this.router.navigate(['/shared/dischargeSummary'])
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

  redirecttourlFav(url: any, FacilityID: any, data: any) {
    sessionStorage.setItem("FeatureID", data.FeatureID);
    $("#facilityMenu").modal('hide');
    if (data.FeatureName.toLowerCase().indexOf('indent') !== -1) {
      this.router.navigate(['/' + url]);
    }
    else if (FacilityID != "") {
      sessionStorage.setItem("worklisturl", url);
      var facilityName = this.FetchUserFacilityDataList.find((x: any) => x.FacilityID === FacilityID);
      sessionStorage.setItem("facility", JSON.stringify(facilityName));
      $("#acc_receivable").modal('hide');
      if (url == "suit/WorkList?PTYP=1") {
        this.router.navigate(['/suit/labworklist']);
      }
      else if (url == "suit/ReferralWorklist") {
        this.router.navigate(['/suit/radiologyworklist']);
      }
      else if (url == "suit/Dentalworklist" || url == 'suit/Opthamaologyworklist' || url == 'suit/Dermatologyworklist' || url == 'suit/Cardiologyworklist' || url == 'suit/NeuroPhysiologyworklist' || url == 'suit/ENTworklist') {
        this.router.navigate(['/suit/worklist']);
      }
      else {
        if (FacilityID != '') {
          this.router.navigate(['/' + url]);
        }
      }
      sessionStorage.setItem("FacilityID", JSON.stringify(FacilityID));
    }
    else {
      $("#facilityValidation").modal('show');
    }
  }

  ngOnDestroy() {
    this.alertSubscription.unsubscribe()
  }
}
