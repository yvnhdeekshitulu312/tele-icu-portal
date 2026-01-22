import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Patterns } from 'global-constants';
import * as moment from 'moment';
import { ConfigService } from '../services/config.service';
import { LoaderService } from '../services/loader.service';
import { BroadcastService } from '../services/broadcast.service';
declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: any;
  mfaForm: any;
  isOTPError: boolean = false;
  otpDetails: any;
  selectedLang: any;
  position!: number;
  showLogin: boolean = true;
  apiResponse: any = {};
  isSubmitted: boolean = false;
  locationList: any;
  doctorDetails: any;
  errorMessage: any;
  location: any;
  trailCount = 0;
  IpAddress: any;
  Checklogin = 1;
  UserOTP: any;
  otp = {
    one: "",
    two: "",
    three: "",
    four: ""
  }
  patientInfo: any;
  listOfLanguages = [
    { Id: 1, value: "English", code: "en" },
    { Id: 2, value: "العربية", code: "ar" }
  ]
  timeLeft: number = 60;
  interval: any;
  showResendOTP: boolean = false;
  currentdate: any;
  currenttime: Date = new Date();
  datetime: any;
  loginLangData: any;
  isDefaultPwd = false;
  employeeChangePwdForm!: FormGroup;
  selectedLocation = '';
  locations = [
    {
      name: 'Suwaidi',
      id: 2,
      centerLat: 24.5923482,
      centerLng: 46.6707433,
      delta: 0.05
    },
    {
      name: 'Nuzha',
      id: 3,
      centerLat: 24.758312,
      centerLng: 46.713914,
      delta: 0.05
    }
  ];
  loginResponse: any;
  showLoader: any = false;

  @ViewChild('otpFirst') otpFirstInput!: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder, private config: ConfigService, private router: Router,
    private loader: LoaderService, private broadcastService: BroadcastService) {
    sessionStorage.clear()
    localStorage.clear();
    if ("lang" in sessionStorage) {
      let langCode = sessionStorage.getItem('lang');
      if (langCode === "en") {
        this.selectedLang = { Id: 1, value: "English", code: "en" };
      } else if (langCode === "ar") {
        this.selectedLang = { Id: 2, value: "Arabic", code: "ar" };
      }
      this.loader.setDefaultLangCode(langCode);
      this.getSelectedLangData(langCode);
      this.getDate(langCode);
    } else {
      this.selectedLang = { Id: 1, value: "English", code: "en" };
      sessionStorage.setItem("lang", `${this.selectedLang.code}`);
      this.loader.setDefaultLangCode(this.selectedLang.code);
      this.getSelectedLangData(this.selectedLang.code);
      this.getDate(this.selectedLang.code);
    }
    this.position = 1;

  }

  ngOnInit(): void {
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href);
    };
    this.loginForm = this.fb.group({
      UserName: ['', Validators.required],
      Password: ['', Validators.required],
      Location: ['', Validators.required]
    });
    this.mfaForm = this.fb.group({
      mfaCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
    })
    this.FetchFetchHospitalLocations();
    this.startClock();
    this.getUserLocation();
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.matchLocation(lat, lng);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  matchLocation(lat: number, lng: number) {
    const match = this.locations.find(loc =>
      Math.abs(lat - loc.centerLat) <= loc.delta &&
      Math.abs(lng - loc.centerLng) <= loc.delta
    );

    this.selectedLocation = match ? match.name : '';
    this.loginForm.get('Location')?.setValue(match ? match.id : '');
  }

  FetchFetchHospitalLocations() {
    this.config.fetchFetchHospitalLocations().subscribe((response) => {
      if (response.Status === "Success") {
        this.locationList = response.HospitalLocationsDataList;
        if (response.HospitalLocationsDataList.length == 1) {
          this.loginForm.get('Location')?.setValue(response.HospitalLocationsDataList[0].HospitalID);
        }
      } else {
      }
    },
      (err) => {

      })
  }

  onSubmit(): void {

    if (this.loginForm.valid) {
      this.isSubmitted = false;
      this.Checklogin = 0;
      this.validateDoctorLogin();

    } else {
      this.showLogin = true;
      this.isSubmitted = true;
    }
  }
  onSubmitNo(): void {

    if (this.loginForm.valid) {
      this.isSubmitted = false;
      this.Checklogin = 1;
      this.validateDoctorLogin();

    } else {
      this.showLogin = true;
      this.isSubmitted = true;
    }
  }

  validateDoctorLogin() {
    this.errorMessage = "";
    if (this.loginForm.valid) {
      setTimeout(() => {
        this.getIPforAudit();
        this.rcmLoginDetails();
      }, 2000);
      //this.config.validateDoctorLogin(this.loginForm.get('UserName').value,this.loginForm.get('Password').value,this.loginForm.get('Location').value).subscribe((response) => {
      //this.config.validateDoctorLoginHH(this.loginForm.get('UserName').value,this.loginForm.get('Password').value, this.trailCount, this.loginForm.get('Location').value).subscribe((response) => {

    }
  }

  backToLogin() {
    this.showLogin = true;
  }

  selectedLanguage(lang: any) {
    this.selectedLang = lang;
    sessionStorage.setItem("lang", `${this.selectedLang.code}`);
    this.loader.setDefaultLangCode(this.selectedLang.code);
    this.getSelectedLangData(this.selectedLang.code);
    this.getDate(this.selectedLang.code);
  }
  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 60;
      }
      if (this.timeLeft == 0) {
        this.pauseTimer();
      }
    }, 1000)
  }

  pauseTimer() {
    clearInterval(this.interval);
    this.showResendOTP = true;
  }
  showToastrModal() {
    $("#otpMessage").modal('show');
  }
  closeToastr() {
    $("#otpMessage").modal('hide');
  }
  // showOtpFailModal() {
  //   $("#otpFail").modal('show');
  // }
  // closeOtpFailModal() {
  //   $("#otpFail").modal('hide');
  // }
  getSelectedLangData(lang: any) {
    this.config.getSelectedLang(lang).subscribe((response: any) => {
      this.loginLangData = response;
      sessionStorage.setItem("langData", JSON.stringify(this.loginLangData))
    });
  }
  getDate(langCode: any) {
    if (langCode === "en") {
      this.currentdate = moment(new Date()).format('DD-MMM-YYYY');
    } else if (langCode === "ar") {
    }
  }

  ngOnDestroy(): void {
    this.stopClock();
  }

  startClock(): void {
    this.interval = setInterval(() => {
      this.currenttime = new Date();
    }, 1000);
  }

  stopClock(): void {
    clearInterval(this.interval);
  }

  rcmLoginDetails() {
    const loginData = {
      sid: 0,
      userName: this.loginForm.get('UserName').value,
      password: this.loginForm.get('Password').value,
      email: 'string',
      phoneNumber: 'string',
      isLocked: true,
      ispwdExpired: true,
      hospitalId: this.loginForm.get('Location').value
    };

    this.config.loginUser(loginData).subscribe((response) => {
      if (response?.data?.token) {
        sessionStorage.setItem('rcmToken', response.data.token);
        sessionStorage.setItem('rcmTokenGuid', response.data.tokenGuId);
      }
    });
  }
  loginchangePassword() {
    this.router.navigate(['/login/changepassword'])
  }

  getIPforAudit() {
    sessionStorage.setItem("ipaddress", "");
    this.IpAddress = "";
    var payload = {
      username: this.loginForm.get('UserName').value,
      password: this.loginForm.get('Password').value,
      HostName: this.IpAddress,
      _intTrialCount: this.trailCount,
      location: this.loginForm.get('Location').value,
      Checklogin: this.Checklogin,
    }
    this.config.ValidateUser(payload).subscribe((response) => {
      this.loginResponse = response;
      if (response.Code === 604) {
        this.trailCount++;
        this.errorMessage = response.Message;
        $("#loginValidationMsg").modal('show');
      } else if (response.Code === 200 && response.SmartDataList[0]?.MFAAuthentication === 'YES') {
        this.openMFAModal();
      } else {
        this.continueLogin(response);
      }
    },
      (err) => {

      });
    // this.config.getipdetails().subscribe((data) => {
    //   if(data.ipAddress) {

    //   }
    // });
  }

  openMFAModal() {
    this.mfaForm.reset();
    this.isOTPError = false;
    this.checkOtpExpiry()
    this.showLoader = false;
    setTimeout(() => {
      this.showLoader = true;
    }, 0);
    this.otp = {
      one: "",
      two: "",
      three: "",
      four: ""
    };
    this.position = 1;
    setTimeout(() => {
      this.otpFirstInput.nativeElement.focus();
    }, 1000);
    $('#MFAModal').modal('show');
  }

  calculateSeconds(): number {
    if (this.loginResponse) {
      const expiry = new Date(this.loginResponse.SmartDataList[0].OTPExpiryDateTime);
      const now = new Date();
      const diff = Math.floor((expiry.getTime() - now.getTime()) / 1000);
      return Math.max(diff, 0); // avoid negative values
    }
    return 0;
  }

  checkOtpExpiry() {
    const check = () => {
      const secondsLeft = this.calculateSeconds();
      this.showResendOTP = secondsLeft <= 0;
    };

    check(); // initial call
    setInterval(check, 1000); // update every second
  }

  getUserLoginOTP(response: any) {
    this.UserOTP = "";
    this.config.FetchUserToken(response.SmartDataList[0].UserId, this.loginForm.get('Location').value).subscribe((response) => {
      if (response.Code === 200) {
        this.UserOTP = response.FetchUserTokenNList[0]?.FirebaseToken;
        if (this.mfaForm.get('mfaCode').value === this.UserOTP) {
          $('#MFAModal').modal('hide');
          this.continueLogin(this.loginResponse);
        } else {
          this.isOTPError = true;
        }
      }
    },
      (err) => {

      });

  }

  verifyMFACode() {
    // TODO: Validate OTP with API.
    this.getUserLoginOTP(this.loginResponse);
  }

  continueLogin(response: any) {
    this.broadcastService.sendMessage('appOpened');
    this.trailCount = 0;
    sessionStorage.setItem("token", response.SmartDataList[0]?.SessionId);
    sessionStorage.setItem("doctorDetails", JSON.stringify(response.SmartDataList))
    sessionStorage.setItem("hospitalId", this.loginForm.get('Location').value)
    sessionStorage.setItem("isLoggedIn", 'true');
    this.location = this.locationList.filter((a: any) => a.HospitalID == this.loginForm.get('Location').value)[0].Name;

    sessionStorage.setItem("locationName", this.location);
    sessionStorage.setItem("IsDoctorLogin", response.SmartDataList[0].IsDoctor);
    sessionStorage.setItem("IsDietitian", response.SmartDataList[0].IsDietitian);
    sessionStorage.setItem("IsRODoctor", response.SmartDataList[0].IsRODoctor);
    sessionStorage.setItem("IsEmergency", response.SmartDataList[0].IsEmergencyDoc);
    sessionStorage.setItem("IsHeadNurse", response.SmartDataList[0].IsERHeadNurse);
    sessionStorage.setItem("IsORHeadNurse", response.SmartDataList[0].IsORHeadNurse);
    sessionStorage.setItem("IsAKUNurse", response.SmartDataList[0].IsAKUNurse);
    sessionStorage.setItem("IsITSTaff", response.SmartDataList[0].IsITSTaff);
    sessionStorage.setItem("IsOPDReception", response.SmartDataList[0].IsOPDReception);
    sessionStorage.setItem("IsPharmacist", response.SmartDataList[0].IsPharmacist);
    sessionStorage.setItem("LabTechnician", response.SmartDataList[0].LabTechnician);
    sessionStorage.setItem("RadTechnician", response.SmartDataList[0].RadTechnician);
    sessionStorage.setItem("IsWardNurse", response.SmartDataList[0].IsWardNurse);
    sessionStorage.setItem("IsAnesthestiaNurse", response.SmartDataList[0].IsAnesthestiaNurse);
    sessionStorage.setItem("IsEndoscopyNurse", response.SmartDataList[0].IsEndoscopyNurse);
    sessionStorage.setItem("IsCathNurse", response.SmartDataList[0].IsCathNurse);
    sessionStorage.setItem("IsFinance", response.SmartDataList[0].IsFinance);
    sessionStorage.setItem("IsRespiratoryTherapist", response.SmartDataList[0].IsRespiratoryTherapist);
    sessionStorage.setItem("IsSocialWorker", response.SmartDataList[0].IsSocialWorker);
    sessionStorage.setItem("IsPhysiotherapy", response.SmartDataList[0].IsPhysiotherapy);
    sessionStorage.setItem("IsNurse", response.SmartDataList[0].IsWardNurse);

    if (response.SmartDataList[0].FacilityId != null) {
      sessionStorage.setItem("facility", response.SmartDataList[0].FacilityId);
    }

    if (response.Code === 704) {
      this.trailCount++;
      this.errorMessage = response.Message;
      $("#loginValidationMsgChange").modal('show');
    } else if (response.Code === 804) {
      this.trailCount++;
      this.errorMessage = response.Message;
      $("#loginExpiryMsg").modal('show');
    } else {
      this.isDefaultPwd = response.SmartDataList[0].IsdefaultPsw === 'False' ? false : true;
      if (this.isDefaultPwd) {
        this.router.navigate(['/login/changepassword'])
      } else {
        this.router.navigate(['/ward/icu-beds']);
      }
    }
  }
  keytab(event: any) {
    const key = event.key;
    if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Tab') {
      return;
    }
    if (key === 'Backspace') {
      event.preventDefault();
      const prev = event.srcElement.previousElementSibling;
      if (prev) {
        this.pressOperator('');
        prev.focus();
      }
      return;
    }
    let element = event.srcElement.nextElementSibling;
    this.pressNum(event.target.value);
    if (element) {
      element.focus();
    }
  }
  onOtpChange() {
    if (this.otp.one != "" && this.otp.two != "" && this.otp.three != "" && this.otp.four != "") {
      this.mfaForm.get('mfaCode').value = this.otp.one + this.otp.two + this.otp.three + this.otp.four
      this.verifyMFACode();
    }
  }
  pressNum(selectedNum: any) {
    if (this.position < 5) {
      if (this.position === 1) {
        this.otp.one = selectedNum;
      }
      if (this.position === 2) {
        this.otp.two = selectedNum;
      }
      if (this.position === 3) {
        this.otp.three = selectedNum;
      }
      if (this.position === 4) {
        this.otp.four = selectedNum;
      }
      this.position++;
      // console.log("position is " + this.position + " " + "PIN is " + this.otp.one + this.otp.two + this.otp.three + this.otp.four);
      let otp = this.otp.one + this.otp.two + this.otp.three + this.otp.four;
      if (this.position == 5) {
        if (otp.length === 4) {
          this.onOtpChange();
        }
      }
    }
  }
  pressOperator(deleteOperator: any) {
    if (this.position > 1) {
      this.position--;
      if (this.position === 1) {
        this.otp.one = "";
      }
      if (this.position === 2) {
        this.otp.two = "";
      }
      if (this.position === 3) {
        this.otp.three = "";
      }
      if (this.position === 4) {
        this.otp.four = "";
      }

    }
  }
  resendOtp() {
    this.getOtp(this.loginResponse);
  }
  getOtp(response: any) {
    const loginData = {
      UserID: response.SmartDataList[0].UserId,
      HospitalID: this.loginForm.get('Location').value
    };
    this.config.getOtp(loginData).subscribe((response: any) => {
      if (response.Status === "Success") {
        this.showLogin = false;
        this.showResendOTP = false;
        this.otpDetails = response;
        this.otpDetails.lastDigit = response?.MobileNo?.substring(response?.MobileNo?.length - 3);
        this.apiResponse = response;

        const currentExpiry = new Date();
        // Add 5 minutes
        currentExpiry.setMinutes(currentExpiry.getMinutes() + 5);

        const month = currentExpiry.getMonth() + 1;
        const day = currentExpiry.getDate();
        const year = currentExpiry.getFullYear();

        let hours = currentExpiry.getHours();
        const minutes = currentExpiry.getMinutes().toString().padStart(2, '0');
        const seconds = currentExpiry.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12;

        const formatted = `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;

        // Set it back in the same format
        this.loginResponse.SmartDataList[0].OTPExpiryDateTime = formatted;

        this.showLoader = false;
        setTimeout(() => {
          this.showLoader = true;
        }, 0);
      } else if (response.Status === "Fail") {
        this.apiResponse = response;
        this.showLogin = true;
      }
    },
      (err) => {
        this.pauseTimer();
      })
  }
}