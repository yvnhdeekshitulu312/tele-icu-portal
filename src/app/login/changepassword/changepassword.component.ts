import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Patterns } from 'global-constants';
import * as moment from 'moment';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ChangepasswordService } from './changepassword.service';
declare var $: any;
@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.scss']
})
export class ChangepasswordComponent extends BaseComponent implements OnInit {
  employeeChangePwdForm!: FormGroup;
  showPasswordValidationMsg = false;
  ValidationMSG: any;
  employeeInfo:any;
  currentTime: Date = new Date();
  currentdate: any;
  interval: any;
  location: any;
  currentGreeting!: string;
  lang:any;
  changePwdValidationMSg: string = "Please enter all fields";

  constructor(private fb: FormBuilder, private us: UtilityService, private router: Router, private service: ChangepasswordService) { 
    super();
    this.employeeChangePwdForm= this.fb.group({
      UserName: [''],
      OldPassword: ['', Validators.required],
      NewPassword: ['', Validators.required],
      ConfirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY, hh:mm A');
    this.lang = sessionStorage.getItem("lang");
    this.currentTime = new Date();
    this.employeeChangePwdForm.patchValue({
      UserName: this.doctorDetails[0].UserName
    });
    this.location = sessionStorage.getItem("locationName");
    this.fetchEmployeeInfo();
    this.setCurrentGreeting();
  }

  startClock(): void {
    this.interval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }
  private setCurrentGreeting(): void {
    const currentHour = new Date().getHours();

    if (currentHour >= 0 && currentHour < 12) {     
         this.currentGreeting = this.langData?.common?.currentGreetingG;        
      //this.currentGreeting = 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 17) {     
         this.currentGreeting = this.langData?.common?.currentGreetingA;
      //this.currentGreeting = 'Good Afternoon';
    } else {     
         this.currentGreeting = this.langData?.common?.currentGreetingE;
      //this.currentGreeting = 'Good Evening';
    }
  }

  fetchEmployeeInfo() {
    const url = this.service.getData(ipissues.FetchEmployeeInfo, {
      EmpID: this.doctorDetails[0].EmpId, UserID: this.doctorDetails[0]?.UserId,
       WorkStationID: 3395,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.employeeInfo = response.FetchEmployeeInfoDataList[0];
          $("#changepwd_modal").modal('show');
        }
      },
        (err) => {
        })
  }

  
  updatePassword() {
    if(this.employeeChangePwdForm.valid) {    
    const oldpwd = this.employeeChangePwdForm.get('NewPassword')?.value;
    const newpwd = this.employeeChangePwdForm.get('ConfirmPassword')?.value;
    if(oldpwd != newpwd) {
      this.changePwdValidationMSg = "New password and confirm password doesn't match";
      this.showPasswordValidationMsg = true;
      return;
    }

    var payload = {
      "NAME": this.doctorDetails[0].UserName,
      "NEWpassword": this.employeeChangePwdForm.get('NewPassword')?.value,
      "OLDpassword": this.employeeChangePwdForm.get('OldPassword')?.value,
      "WorkStationID": 3395,      
      "HospitalID": this.hospitalID,
    }

    this.us.post(ipissues.SaveChangedPassword, payload).subscribe((response) => {
      if (response.Code == 604) {
        this.ValidationMSG = response.Message;          
          $("#paswordNoMatchMsg").modal('show');
      }
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
    this.onLogout();
    $("#changepwd_modal").modal('hide');
  }
  onLogout() {
    let isLoggedIn = "isLoggedIn";
    $("#changepwd_modal").modal('hide');
    sessionStorage.removeItem(isLoggedIn);
    sessionStorage.removeItem("doctorDetails");
    sessionStorage.removeItem("IsHeadNurse");
    sessionStorage.clear()
    localStorage.clear();
    this.router.navigate(['/login'])
  }

}


export const ipissues = {
  FetchEmployeeInfo:'FetchEmployeeInfo?EmpID=${EmpID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SaveChangedPassword: 'SaveChangedPassword'
};