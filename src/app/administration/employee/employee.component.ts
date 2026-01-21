import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { EmployeeService } from './employee.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { employeeDetails } from './urls';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { Observable, Subscriber } from 'rxjs';
import { AuditlogService } from 'src/app/services/auditlog.service';
declare var $: any;
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe,
  ]
})
export class EmployeeComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('personal', { static: true }) personal!: ElementRef;
  @ViewChild('hr', { static: true }) hr!: ElementRef;
  @ViewChild('academic', { static: true }) academic!: ElementRef;
  @ViewChild('contact', { static: true }) contact!: ElementRef;
  url = '';
  AdminMastersInstructionsDataList: any;
  FetchEmployeeGenderDataList: any;
  FetchEmployeeBloodGDataList: any;
  FetchEmployeeMartialDataList: any;
  FetchEmployeeQualificationDataList: any;
  FetchEmployeeTitleDataList: any;
  FetchEmployeeTypeDataList: any;
  FetchEmployeeLocationDataList: any;
  FetchEmployeeTitleGenderDataList: any;
  FetchEmployeeDepartmentsDataList: any;
  FetchEmployeeDesignationDataList: any;
  FetchReligionsDataList: any;
  FetchEmploymentRoleNamesDataList:any;
  empForm!: FormGroup;
  HRProfileQualification!: FormGroup;
  qualificationList: any[] = [];
  editingIndex: number = -1;
  editingCertIndex: number = -1;
  selectedOptions: string[] = [];
  GetMasterDataList: any[] = [];
  HRProfileCertification!: FormGroup;
  certificationDetails: any[] = [];
  ProfessionalDetails!: FormGroup;
  pDetails: any[] = [];
  editingPIndex: number = -1;
  hrProfileList: any;
  selectedHRProfile: any = [];
  SpecialisationList: any = [];
  selectedSpecialisation: any = [];
  cityList: any = [];
  employeeList: any = [];
  FetchEmployeeData1List: any;
  selectedLang: any = [];
  IsModify = false;
  errorMessages: any = [];
  fieldErrorMessages: { [key: string]: string } = {};
  isDischargeReturn = false;
  SucessMsg:any = [];
  hospitalLocations: any;
  FetchEmployeeHospitalsDataList: any;
  employeeSignInfoForm!: FormGroup;
  base64StringSig1 = '';
  showSignature: boolean = false;
  isDefaultPassword = false;
  isPasswordExpired = false;
  fileError: string = "";

  prifilePhoto!: string;
  profilePhotoUploaded: boolean = false;
  myPhoto!: string;
  IsFitForDischarge: boolean = false;
  SehaVerifiedDate: any;
errorMsg: any = '';
  constructor(@Inject(EmployeeService) private service: EmployeeService, private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private datePipe: DatePipe, private audit: AuditlogService) {
    super();
    sessionStorage.setItem("homescreen", "suit");
    this.initializeEmployeeForm();
    this.initializeHRProfileQualification();
    this.initializeHRProfileCertification();
    this.intializeProfessionalDetails();
    this.initFieldErrorMessages();
    this.employeeSignInfoForm= this.formBuilder.group({
      Signature1: ['']
    });
  }

  clear() {
    this.IsFitForDischarge = false;
    this.FetchEmployeeData1List = null;
    this.isDischargeReturn = false;
    this.initializeEmployeeForm();
    this.initializeHRProfileQualification();
    this.initializeHRProfileCertification();
    this.intializeProfessionalDetails();
    this.qualificationList = [];
    this.certificationDetails = [];
    this.pDetails = [];
    this.selectedHRProfile = [];
    this.selectedLang = [];
    this.selectedSpecialisation = [];
    this.IsModify = false;
    this.isDefaultPassword=false;
    this.isPasswordExpired=false;
    this.SehaVerifiedDate='';
    this.myPhoto = '';
  }

  ngOnDestroy() {
    sessionStorage.setItem("homescreen", "");
  }

  ngOnInit(): void {
    this.FetchAdminMasters();
    this.FetchEmployeeMasters();
    // this.FetchEmployeeTitleGender();
    this.FetchEmployeeLocation();
    this.FetchReligions();
    this.FetchEmploymentRoleNames();
    // this.FetchLanguages();
  }

  initFieldErrorMessages() {
    this.fieldErrorMessages = {
      EmpName: 'Employee No ',
      Title: 'Title ',
      FirstName: 'First Name ',
      DateofBirth: 'Date of Birth ',
      Gender: 'Gender ',
      EmployeeType: 'Employee Type ',
      Location: 'Location ',
      Department: 'Department ',
      Designation: 'Designation ',
      BloodGroup: 'Blood group ',
      empFunctionType: 'Function type ',
      empPresentAddress: 'Present address ',
      empPresentPhone: 'Present Mobile number ',
      empPresentCity: 'Present city ',
      Religion: 'Religion ',
      Nationality: 'Nationality ',
      EmploymentRoleID:'Role',
    };
  }

  initializeEmployeeForm() {
    this.empForm = this.formBuilder.group({
      EmpNo: [''],
      EmpName: ['', Validators.required],
      EmpID: [0],
      EmpCode: [''],
      RoomNo: [''],
      Title: ['', Validators.required],
      FirstName: ['', Validators.required],
      MiddleName: [''],
      LastName: [''],
      FirstName2l: [''],
      MiddleName2l: [''],
      LastName2l: [''],
      DateofBirth: ['', Validators.required],
      Age: [''],
      Gender: ['', Validators.required],
      MaritalStatus: [''],
      EmployeeType: ['', Validators.required],
      Location: ['', Validators.required],
      Department: ['', Validators.required],
      Designation: ['', Validators.required],
      Religion: ['', Validators.required],
      Nationality: ['', Validators.required],
      UHID: [''],
      SSN: [''],
      IqamaExpiry: [''],
      BloodGroup: ['', Validators.required],
      Region: [''],
      PassportNumber: [''],
      IssueDate: [''],
      ExpiryDate: [''],
      Issueat: [''],
      PanNumber: [''],
      empFunctionType: ['', Validators.required],
      empSubFunctionType: [''],
      admission: false,
      consultation: false,
      applycharges: false,
      Maxconsultation: [''],
      Followupdays: [''],
      Followuplimit: [''],
      SpecialNote: [''],
      empPresentAddress: ['', Validators.required],
      empPresentState: [''],
      empPresentCountry: [''],
      empPresentPinCode: [''],
      empPresentPhone: ['', Validators.required],
      empPresentMobile: ['', Validators.required],
      empPresEmail:[''],
      empPermanentAddress: [''],
      empPermanentState: [''],
      empPermanentCountry: [''],
      empPermanentPinCode: [''],
      empPermanentPhone: [''],
      empPermanentMobile: [''],
      sameaspresent: [false],
      empPermanentCity: [''],
      empPermanentCityId: [''],
      empPresentCity: ['', Validators.required],
      empPresentCityId: [''],
      empPresentCityToShow: [''],
      IsFullTime: [false],
      SID:[0],
      UserDescription:[''],
      PwdSetDate:['']     ,
      EmploymentRoleID:[''],
      QualificationDisc:[''],
      QualificationDisc2L:[''],
      SpecialNote2L:[''],
      CasesToBeSeen:[''],
      CasesToBeSeen2L :[''],
      AgeGroups2L:[''],
      AgeGroups:[''],
      SehaDoB:[''],
      SehaNationality:['']
    });
  }

  initializeHRProfileQualification() {
    this.HRProfileQualification = this.formBuilder.group({
      empQualification: ['', Validators.required],
      empInstitute: ['', Validators.required],
      empUniversity: ['', Validators.required],
      empYOP: ['', [Validators.required]]
    });
  }

  initializeHRProfileCertification() {
    this.HRProfileCertification = this.formBuilder.group({
      hrCertificate: ['', Validators.required],
      hrInstitute: ['', Validators.required],
      hrIssueDate: ['', Validators.required],
    });
  }

  intializeProfessionalDetails() {
    this.ProfessionalDetails = this.formBuilder.group({
      empLicenseNo: ['', Validators.required],
      empInstitute1: ['', Validators.required],
      empIssuePlace: ['', Validators.required],
      empIssueDate: ['', Validators.required],
      empExpDate: ['', Validators.required],
    });
  }


  FetchEmployeeMasters() {
    this.url = this.service.getData(employeeDetails.FetchEmployeeMasters, { UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchEmployeeGenderDataList = response.FetchEmployeeGenderDataList;
          this.FetchEmployeeBloodGDataList = response.FetchEmployeeBloodGDataList;
          this.FetchEmployeeMartialDataList = response.FetchEmployeeMartialDataList;
          this.FetchEmployeeQualificationDataList = response.FetchEmployeeQualificationDataList;
          this.FetchEmployeeTitleDataList = response.FetchEmployeeTitleDataList;
          this.FetchEmployeeTypeDataList = response.FetchEmployeeTypeDataList;
        }
      },
        (err) => {

        })
  }

  FetchAdminMasters() {
    this.url = this.service.getData(employeeDetails.FetchAdminMasters, { UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.AdminMastersInstructionsDataList = response.AdminMastersInstructionsDataList;
        }
      },
        (err) => {

        })
  }

  FetchEmployeeLocation() {
    this.url = this.service.getData(employeeDetails.FetchEmployeeLocation, { UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchEmployeeLocationDataList = response.FetchEmployeeLocationDataList;
        }
      },
        (err) => {

        })
  }

  FetchEmployeeDepartments(SelectedHospitalID: any) {
    this.FetchEmployeeDepartmentsDataList = [];
    this.FetchEmployeeDesignationDataList = [];
    this.url = this.service.getData(employeeDetails.FetchEmployeeDepartments, { SelectedHospitalID: SelectedHospitalID, UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchEmployeeDepartmentsDataList = response.FetchEmployeeDepartmentsDataList;

          let selectedItem = this.FetchEmployeeDepartmentsDataList.filter((x: any) => x?.HospDeptID === this.FetchEmployeeData1List.HospDeptID);
            this.FetchEmployeeDesignation(selectedItem[0].DepartmentID);
        }
      },
        (err) => {

        })
  }

  FetchEmployeeDesignation(DepartmentID: any) {
    this.FetchEmployeeDesignationDataList = [];
    this.url = this.service.getData(employeeDetails.FetchEmployeeDesignation, { DepartmentID: DepartmentID, UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchEmployeeDesignationDataList = response.FetchEmployeeDesignationDataList;
        }
      },
        (err) => {

        })
  }

  FetchReligions() {
    this.url = this.service.getData(employeeDetails.FetchReligions, { UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchReligionsDataList = response.FetchReligionsDataList;
        }
      },
        (err) => {

        })
  }
  FetchEmploymentRoleNames() {
    this.url = this.service.getData(employeeDetails.FetchEmploymentRoleNames, { WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchEmploymentRoleNamesDataList = response.FetchEmploymentRoleNamesDataList;
        }
      },
        (err) => {

        })
  }

  NationalityChange(event: any) {

  }

  genderChange(event: any) {

  }

  locationChange(event: any) {
    this.FetchEmployeeDepartments(event.target.value);
  }

  titleChange(event: any) {
    this.FetchEmployeeTitleGender(event.target.value);
  }

  departmentChange(event: any) {
    //const selectedItem = this.FetchEmployeeDepartmentsDataList.find((value: any) => value.HospDeptID === Number(event.target.value));
    let selectedItem = this.FetchEmployeeDepartmentsDataList.filter((x: any) => x?.HospDeptID === event.target.value);
    this.FetchEmployeeDesignation(selectedItem[0].DepartmentID);
    //DepartmentID
  }

  designationChange(event: any) {

  }

  religionChange(event: any) {

  }
  FetchEmployeeTitleGender(TitleID: any) {
    this.url = this.service.getData(employeeDetails.FetchEmployeeTitleGender, { TitleID: TitleID, UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchEmployeeGenderDataList = response.FetchEmployeeTitleGenderDataList;
        }
      },
        (err) => {

        })
  }

  addItem(): void {
    if (this.HRProfileQualification.valid) {
      if (this.editingIndex > -1) {
        this.qualificationList[this.editingIndex] = this.HRProfileQualification.value;
        this.editingIndex = -1;
      } else {
        this.qualificationList.push(this.HRProfileQualification.value);
      }
      this.HRProfileQualification.reset();
    } else {
    }
  }

  editItem(index: number): void {
    this.HRProfileQualification.patchValue(this.qualificationList[index]);
    this.editingIndex = index;
  }

  deleteItem(index: number): void {
    this.qualificationList.splice(index, 1);
  }

  addCertificateItem(): void {
    if (this.HRProfileCertification.valid) {
      if (this.editingCertIndex > -1) {
        this.certificationDetails[this.editingCertIndex] = this.HRProfileCertification.value;
        this.editingCertIndex = -1;
      } else {
        this.certificationDetails.push(this.HRProfileCertification.value);
      }
      this.HRProfileCertification.reset();
    } else {
    }
  }

  editCertificateItem(index: number): void {
    this.HRProfileCertification.patchValue(this.certificationDetails[index]);
    this.editingCertIndex = index;
  }

  deleteCertificateItem(index: number): void {
    this.certificationDetails.splice(index, 1);
  }


  addProfessionalItem(): void {
    if (this.ProfessionalDetails.valid) {
      const newItem = this.ProfessionalDetails.value;
      if (this.editingPIndex > -1) {
        this.pDetails[this.editingPIndex] = newItem;
        this.editingPIndex = -1;
      } else {
        this.pDetails.push(newItem);
      }
      this.ProfessionalDetails.reset();
    } else {
    }
  }

  editProfessionalItem(index: number): void {
    const item = this.pDetails[index];
    this.ProfessionalDetails.patchValue({
      empLicenseNo: item.empLicenseNo,
      empInstitute1: item.empInstitute1,
      empIssuePlace: item.empIssuePlace,
      empIssueDate: item.empIssueDate,
      empExpDate: item.empExpDate
    });
    this.editingPIndex = index;
  }

  deleteProfessionalItem(index: number): void {
    this.pDetails.splice(index, 1);
  }

  FetchLanguages() {
    this.url = this.service.getData(employeeDetails.FetchAdmRoutes, { Type: 4, DisplayName: '%%%' });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.GetMasterDataList = response.GetMasterDataList;
        }
      },
        (err) => {

        })
  }

  searchHRProfile(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(employeeDetails.FetchGDomain, { DisplayName: event.target.value, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.hrProfileList = response.FetchGDomainDataList;
          }
        },
          (err) => {
          })
    }
  }

  onHRItemSelected(item: any) {
    this.errorMessages = [];
    const existingId = this.selectedHRProfile.find((profile: any) => profile.DomainID === item.DomainID);
    const existingName = this.selectedHRProfile.find((profile: any) => profile.DomainName === item.DomainName);

    if (!existingId && !existingName) {
      this.hrProfileList = [];
      this.selectedHRProfile.push(item);
    } else {
      this.errorMessages.push("Duplicates are not allowed");
      $("#errorMessagesModal").modal('show');
    }
  }

  removeItem(index: number): void {
    this.selectedHRProfile.splice(index, 1);
  }

  searchSpecialisation(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(employeeDetails.FetchAdmRoutes, { DisplayName: event.target.value, Type: 11 });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.SpecialisationList = response.GetMasterDataList;
          }
        },
          (err) => {
          })
    }
  }

  onSpecialisationSelected(item: any) {
    this.errorMessages = [];
    const existingId = this.selectedSpecialisation.find((spec: any) => spec.id === item.id);
    const existingName = this.selectedSpecialisation.find((spec: any) => spec.name === item.name);

    if (!existingId && !existingName) {
      this.SpecialisationList = [];
      this.selectedSpecialisation.push(item);
    } else {
      this.errorMessages.push("Duplicates are not allowed");
      $("#errorMessagesModal").modal('show');
    }
  }

  removeSpecialisationItem(index: number): void {
    this.selectedSpecialisation.splice(index, 1);
  }

  copyPresentToPermanent(): void {
    this.empForm.get("sameaspresent")?.setValue(!this.empForm.get("sameaspresent")?.value);

    if (this.empForm.get("sameaspresent")?.value) {
      const presentAddress = this.empForm.value;
      this.empForm.patchValue({
        empPermanentAddress: presentAddress.empPresentAddress,
        empPermanentCity: presentAddress.empPresentCity,
        empPermanentCityId: presentAddress.empPresentCityId,
        empPermanentState: presentAddress.empPresentState,
        empPermanentCountry: presentAddress.empPresentCountry,
        empPermanentPinCode: presentAddress.empPresentPinCode,
        empPermanentPhone: presentAddress.empPresentPhone
      });
    }
    else {
      this.empForm.patchValue({
        empPermanentAddress: '',
        empPermanentCity: '',
        empPermanentCityId: '',
        empPermanentState: '',
        empPermanentCountry: '',
        empPermanentPinCode: '',
        empPermanentPhone: ''
      });
    }
  }

  getErrorMessage(): void {
    Object.keys(this.empForm.controls).forEach(controlName => {
      const control = this.empForm.get(controlName);

      if (control && control.invalid) {
          this.errorMessages.push(this.fieldErrorMessages[controlName]);
      }
    });
    if(!this.isDefaultPassword && this.empForm.get("EmpID")?.value===0) {
      this.errorMessages.push("Please select Default Password for new Employee");
    }
    if(this.empForm.get("EmploymentRoleID")?.value==='') {
      this.errorMessages.push("Please select Role");
    }
    if(this.selectedLang.length === 0 ) {
      this.errorMessages.push("Add known languages");
    }

    if(this.selectedHRProfile.length === 0 ) {
      this.errorMessages.push("Add atleast one HR profile");
    }
    
  }

  save(type: string) {
    console.log(this.audit.getLogs());
    this.errorMessages = [];
    this.getErrorMessage();

    if (this.errorMessages.length > 0) {
      $("#errorMessagesModal").modal('show');
    }
    else {
      var Specilization: any = [];
      var Profile: any = [];
      var Language: any = [];
      var Qualification: any = [];
      var Certification: any = [];
      var License: any = [];

      this.selectedSpecialisation.forEach((element: any, index: any) => {
        Specilization.push({ "SPZID": element.id, "NAME": element.name });
      });

      this.selectedHRProfile.forEach((element: any, index: any) => {
        Profile.push({ "HRPID": element.DomainID, "NAME": element.DomainName });
      });

      this.selectedLang.forEach((element: any, index: any) => {
        Language.push({ "LANG": element.id, "NAME": element.name, "NAME2L": element.name });
      });

      this.qualificationList.forEach((element: any, index: any) => {
        Qualification.push({
          "SLNO": index + 1,
          "EMPQ": element.empQualification,
          "INST": element.empInstitute,
          "BOARD": element.empUniversity,
          "PYEAR": element.empYOP
        });
      });

      this.certificationDetails.forEach((element: any, index: any) => {
        Certification.push({
          "SLNO": index + 1,
          "EMPC": element.hrCertificate,
          "INST": element.hrInstitute,
          "IDATE": moment(new Date(element.hrIssueDate)).format('DD-MMM-YYYY')
        });
      });


      this.pDetails.forEach((element: any, index: any) => {
        License.push({
          "SLNO": index + 1,
          "LIC": element.empLicenseNo,
          "ORG": element.empInstitute1,
          "ISSPLC": element.empIssuePlace,
          "IDATE": moment(new Date(element.empIssueDate)).format('DD-MMM-YYYY'),
          "RDATE": moment(new Date(element.empExpDate)).format('DD-MMM-YYYY')
        });
      });

      let payload = {
        "EmpID": this.empForm.get("EmpID")?.value,
        "EmpNo": this.empForm.get("EmpName")?.value.split('-')[0].trim(),
        "EmpCode": this.empForm.get("EmpCode")?.value,
        "TitleID": this.empForm.get("Title")?.value,
        "FirstName": this.empForm.get("FirstName")?.value,
        "FirstName2l": this.empForm.get("FirstName2l")?.value,
        "LastName": this.empForm.get("LastName")?.value,
        "LastName2l": this.empForm.get("LastName2l")?.value,
        "MiddleName": this.empForm.get("MiddleName")?.value,
        "MiddleName2l": this.empForm.get("MiddleName2l")?.value,
        "RoomNumber": this.empForm.get("RoomNo")?.value,
        "SSN": this.empForm.get("SSN")?.value,
        "MaritalStatusID": this.empForm.get("MaritalStatus")?.value,
        "SexID": this.empForm.get("Gender")?.value,
        "BloodGroupID": this.empForm.get("BloodGroup")?.value,
        "NationalityID": this.empForm.get("Nationality")?.value,
        "ReligionID": this.empForm.get("Religion")?.value,
        "PatientID": 0, // ADDED UHID as PatientID
        "DoB": moment(new Date(this.empForm.get("DateofBirth")?.value)).format('DD-MMM-YYYY'),
        "IsMedical": this.empForm.get("empFunctionType")?.value,
        "MedicalType": this.empForm.get("empSubFunctionType")?.value,
        "IsAdminpri": this.empForm.get("admission")?.value ? 1 : 0,
        "IsConsPri": this.empForm.get("consultation")?.value ? 1 : 0,
        "IsFullTime": this.empForm.get("IsFullTime")?.value ? 1 : 0,
        "PassportNo": this.empForm.get("PassportNumber")?.value,
        "PassIssueDate": this.empForm.get("IssueDate")?.value,
        "PassExpiryDate": this.empForm.get("ExpiryDate")?.value,
        "PassIssuedAt": this.empForm.get("Issueat")?.value,
        "PermAddresss01": this.empForm.get("empPermanentAddress")?.value,
        "PermAddresss02": this.empForm.get("empPermanentState")?.value,
        "PermAddresss03": this.empForm.get("empPermanentCountry")?.value,
        "PermAddress012l": "",
        "PermAddress022l": "",
        "PermAddress032l": "",
        "PermCityID": this.empForm.get("empPermanentCityId")?.value,
        "PermZip": this.empForm.get("empPermanentPinCode")?.value,
        "PermPhone": this.empForm.get("empPermanentPhone")?.value,
        "PermMobile": this.empForm.get("empPermanentMobile")?.value,
        "PermFax": "",
        "PermEmail": "",
        "PresAddress01": this.empForm.get("empPresentAddress")?.value,
        "PresAddress02": this.empForm.get("empPresentState")?.value,
        "PresAddress03": this.empForm.get("empPresentCountry")?.value,
        "PresAddress012l": "",
        "PresAddress022l": "",
        "PresAddress032l": "",
        "PresCityId": this.empForm.get("empPermanentCityId")?.value,
        "PresZip": this.empForm.get("empPresentPinCode")?.value,
        "PresPhone": this.empForm.get("empPresentPhone")?.value,
        "PresMobile": this.empForm.get("empPresentMobile")?.value,
        "PresEmail": this.empForm.get("empPresEmail")?.value,
        "PresFax": "",
        "HospDeptId": this.empForm.get("Department")?.value,
        "DeptDesigID": this.empForm.get("Designation")?.value,
        "EmpType": this.empForm.get("EmployeeType")?.value,
        "Qualification": Qualification,
        "Certification": Certification,
        "License": License,
        "Specilization": Specilization,
        "Profile": Profile,
        "Language": Language,
        "PhotoPath": "",
        "SignaturePath": "",
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": 3395,
        "IqamaExpiry": this.empForm.get("EmployeIqamaExpiryeType")?.value,
        "MaxConsultation": this.empForm.get("Maxconsultation")?.value,
        "ConFollowupDays": this.empForm.get("Followupdays")?.value,
        "Followuplimit": this.empForm.get("Followuplimit")?.value,
        "PanNo": this.empForm.get("PanNumber")?.value,
        "IsProfChargesApplicable": this.empForm.get("applycharges")?.value ? 1 : 0,
        "SpecialNote": this.empForm.get("SpecialNote")?.value,
        "SID": this.empForm.get("SID")?.value==""?0:this.empForm.get("SID")?.value,
        "PwdSetDate":this.empForm.get("PwdSetDate")?.value,        
        "DESCRIPTION":this.empForm.get("UserDescription")?.value,
        "PWDEXPIRED":this.isPasswordExpired==true?1:0,
        "LOGGEDHOSTID":"",
        "LOGGEDHOSTNAME":"",
        "ISLOCKED":0,
        "IsdefaultPsw":this.isDefaultPassword==true?1:0,
        "Blocked":0,
        "BlockedDate":"",
        "Signature":this.employeeSignInfoForm.get('Signature1')?.value,
        "EmployeePhoto" : this.myPhoto,
        "EmploymentRoleID": this.empForm.get("EmploymentRoleID")?.value,
        "SpecialNote2L": this.empForm.get("SpecialNote2L")?.value,
        "QualificationDisc": this.empForm.get("QualificationDisc")?.value,
        "QualificationDisc2L": this.empForm.get("QualificationDisc2L")?.value,
        "CasesToBeSeen": this.empForm.get("CasesToBeSeen")?.value,
        "CasesToBeSeen2L": this.empForm.get("CasesToBeSeen2L")?.value,
        "AgeGroups": this.empForm.get("AgeGroups")?.value,
        "AgeGroups2L": this.empForm.get("AgeGroups2L")?.value,
      }
      this.us.post(type === "save" ? employeeDetails.SaveEmployee : employeeDetails.UpdateEmployee, payload).subscribe((response) => {
        if (response.Status == "Success") {
          
          $("#savemsg").modal('show');
          this.clear();
        } else {

        }
      },
        (err) => {
          console.log(err)
        })
    }

  }

  UpdateEmployeeSehaVerified(empId: any) {
    var payload = {
        "EMPID": empId,
        "IsSehaVerified": true,
        "SehaVerifiedBy": this.doctorDetails[0].UserId,
        "UserID":this.doctorDetails[0].UserId,
        "WorkStationID": "3539",
        "HospitalID": this.hospitalID
    }
    this.us.post(employeeDetails.UpdateEmployeeSehaVerified, payload).subscribe((response) => {
        if (response.Status == "Success") {
        } 
      },
        (err) => {
          console.log(err)
        })
  }

  searchCity(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(employeeDetails.FetchPlaces, { city: event.target.value, UserId: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.cityList = response.FetchPlacesDataList;
          }
        },
          (err) => {
          })
    }
  }

  onCitySelected(item: any) {
    this.cityList = [];
    this.empForm.patchValue({
      empPermanentCity: item.City,
      empPermanentCityId: item.CityID,
      empPermanentState: item.State,
      empPermanentCountry: item.Country
    });
  }

  onPresentCitySelected(item: any) {
    this.empForm.patchValue({
      empPresentCity: item.City,
      empPresentCityToShow: item.City,
      empPresentCityId: item.CityID,
      empPresentState: item.State,
      empPresentCountry: item.Country
    });
  }

  searchEmployee(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(employeeDetails.FetchSSEmployeesE, { name: event.target.value, UserId: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.employeeList = response.FetchSSEmployeesDataList;
          }
        },
          (err) => {
          })
    }
  }

  onEmployeeSelected(item: any) {
    this.employeeList = [];
    this.empForm.patchValue({
      EmpName: item.Name,
      EmpID: item.ID
    });

    this.FetchEmployee(item.ID);
  }

  FetchEmployee(EmpID: any) {
    this.url = this.service.getData(employeeDetails.FetchEmployee, { EmpId: EmpID, UserId: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchEmployeeData1List = response.FetchEmployeeData1List[0];

          if (this.FetchEmployeeData1List) {
            this.IsModify = true;
            this.isDischargeReturn=this.FetchEmployeeData1List.Blocked=='0'?false:true;
            this.empForm.patchValue({
              EmpNo: this.FetchEmployeeData1List.EmpNo,
              EmpName: this.FetchEmployeeData1List.EmpNo + ' - ' + this.FetchEmployeeData1List.FullName,
              EmpID: this.FetchEmployeeData1List.EmpID,
              EmpCode: this.FetchEmployeeData1List.CODE,
              RoomNo: this.FetchEmployeeData1List.RoomNumber,
              Title: this.FetchEmployeeData1List.TitleID,
              FirstName: this.FetchEmployeeData1List.FirstName,
              MiddleName: this.FetchEmployeeData1List.MiddleName,
              LastName: this.FetchEmployeeData1List.LastName,
              FirstName2l: this.FetchEmployeeData1List.FirstName2L,
              MiddleName2l: this.FetchEmployeeData1List.MiddleName2L,
              LastName2l: this.FetchEmployeeData1List.LastName2L,
              DateofBirth: new Date(this.FetchEmployeeData1List.DoB),
              Gender: this.FetchEmployeeData1List.GenderID,
              MaritalStatus: this.FetchEmployeeData1List.MaritalStatusID,
              EmployeeType: this.FetchEmployeeData1List.EmpTypeID,
              Location: this.FetchEmployeeData1List.HospitalID,
              Religion: this.FetchEmployeeData1List.ReligionID,
              Nationality: this.FetchEmployeeData1List.NationalityID,
              SSN: this.FetchEmployeeData1List.SSN,
              IqamaExpiry: this.FetchEmployeeData1List.IqamaExpiry ? new Date(this.FetchEmployeeData1List.IqamaExpiry) : "",
              BloodGroup: this.FetchEmployeeData1List.BloodGroupID,
              PassportNumber: this.FetchEmployeeData1List.PassportNo,
              IssueDate: this.FetchEmployeeData1List.PassIssueDate ? new Date(this.FetchEmployeeData1List.PassIssueDate) : "",
              ExpiryDate: this.FetchEmployeeData1List.PassExpiryDate ? new Date(this.FetchEmployeeData1List.PassExpiryDate) : "",
              Issueat: this.FetchEmployeeData1List.PassIssuedAt,
              PanNumber: this.FetchEmployeeData1List.PanNo,
              empFunctionType: this.FetchEmployeeData1List.IsMedical ? 1 : 2,
              empSubFunctionType: this.FetchEmployeeData1List.MedicalType,
              admission: this.FetchEmployeeData1List.IsAdminpri,
              consultation: this.FetchEmployeeData1List.IsConsPri,
              applycharges: this.FetchEmployeeData1List.IsProfChargesApplicable,
              Maxconsultation: this.FetchEmployeeData1List.MaxConsultation,
              Followupdays: this.FetchEmployeeData1List.ConFollowupDays,
              Followuplimit: this.FetchEmployeeData1List.Followuplimit,
              SpecialNote: this.FetchEmployeeData1List.SpecialNote,
              empPresentAddress: this.FetchEmployeeData1List.PresAddress01,
              empPresentState: this.FetchEmployeeData1List.PresState,
              empPresentCountry: this.FetchEmployeeData1List.PresCountry,
              empPresentPinCode: this.FetchEmployeeData1List.PresZip,
              empPresentPhone: this.FetchEmployeeData1List.PresPhone,
              empPresentMobile: this.FetchEmployeeData1List.PresMobile,
              empPresEmail: this.FetchEmployeeData1List.PresEmail,
              empPermanentAddress: this.FetchEmployeeData1List.PermAddress01,
              empPermanentState: this.FetchEmployeeData1List.PermState,
              empPermanentCountry: this.FetchEmployeeData1List.PermCountry,
              empPermanentPinCode: this.FetchEmployeeData1List.PermZip,
              empPermanentPhone: this.FetchEmployeeData1List.PermPhone,
              empPermanentMobile: this.FetchEmployeeData1List.PermMobile,
              empPermanentCity: this.FetchEmployeeData1List.PermCity,
              empPermanentCityId: this.FetchEmployeeData1List.PermCityID,
              empPresentCity: this.FetchEmployeeData1List.PresCity,
              empPresentCityId: this.FetchEmployeeData1List.PresCityID,
              empPresentCityToShow: this.FetchEmployeeData1List.PresCity,
              IsFullTime: this.FetchEmployeeData1List.IsFullTime === "False" ? false : true,
              SID:this.FetchEmployeeData1List.UserID,
              PwdSetDate:this.FetchEmployeeData1List.PWDSetDate,
              UserDescription:this.FetchEmployeeData1List.Description,
              EmploymentRoleID: this.FetchEmployeeData1List.EmpRoleID,
              //this.employeeSignInfoForm.get('Signature1')?.value
              SpecialNote2L: this.FetchEmployeeData1List.SpecialNote2L,
              QualificationDisc: this.FetchEmployeeData1List.QualificationDisc,
              QualificationDisc2L: this.FetchEmployeeData1List.QualificationDisc2L,
              CasesToBeSeen: this.FetchEmployeeData1List.CasesToBeSeen,
              CasesToBeSeen2L: this.FetchEmployeeData1List.CasesToBeSeen2L,
              AgeGroups: this.FetchEmployeeData1List.AgeGroups,
              AgeGroups2L: this.FetchEmployeeData1List.AgeGroups2L,
              SehaDoB: this.FetchEmployeeData1List.SehaDoB,
              SehaNationality: this.FetchEmployeeData1List.SehaNationality,
            });
            this.empForm.patchValue({
              Signature1:this.FetchEmployeeData1List.Base64Signature,
            });

            this.base64StringSig1 = this.FetchEmployeeData1List.Base64Signature;
            this.isDefaultPassword=this.FetchEmployeeData1List.IsdefaultPsw=== "False" ? false : true;
            this.isPasswordExpired=this.FetchEmployeeData1List.ISPWDExpired=== "False" ? false : true;

             this.IsFitForDischarge = this.FetchEmployeeData1List.IsSehaVerified;
             this.SehaVerifiedDate = this.FetchEmployeeData1List.SehaVerifiedDate;

            response.FetchEmployeeData2List.forEach((element: any, index: any) => {
              this.selectedLang.push({
                "id": element.LanguageId,
                "name": element.Language,
                "Seq": null
              });
            });

            response.FetchEmployeeData3List.forEach((element: any, index: any) => {
              this.selectedHRProfile.push({
                "DomainID": element.HRProfileID,
                "DomainName": element.HRProfile,
                "Code": ""
              });
            });

            response.FetchEmployeeData4List.forEach((element: any, index: any) => {
              this.selectedSpecialisation.push({
                "id": element.SpecialiseID,
                "name": element.Specialisation,
                "Seq": null
              });
            });

            response.FetchEmployeeData5List.forEach((element: any, index: any) => {
              this.pDetails.push({
                "empLicenseNo": element.License,
                "empInstitute1": element.Organization,
                "empIssuePlace": element.IssuePlace,
                "empIssueDate": element.IssueDate ? new Date(element.IssueDate) : '',
                "empExpDate": element.RenewDate ? new Date(element.RenewDate) : ''
              });
            });

            response.FetchEmployeeData6List.forEach((element: any, index: any) => {
              this.certificationDetails.push({
                "hrCertificate": element.Certificate,
                "hrInstitute": element.Institute,
                "hrIssueDate": element.IssueDate ? new Date(element.IssueDate) : ''
              });
            });

            response.FetchEmployeeData7List.forEach((element: any, index: any) => {
              this.qualificationList.push({
                "empQualification": element.QualificationID,
                "empInstitute": element.Institute,
                "empUniversity": element.Board,
                "empYOP": element.PassingYear ? new Date(element.PassingYear).getFullYear() : ''
              });
            });

            //this.myPhoto =  this.FetchEmployeeData1List.PhotoPath;
            this.myPhoto =  this.FetchEmployeeData1List.EmployeePhoto;
            //"data:image/" + this.FetchEmployeeData1List.PhotoPath.split('.')[0] + ";base64," + this.FetchEmployeeData1List.PhotoPath.split('.')[1] ;

            this.calculateAge();
            this.FetchEmployeeDepartments(this.FetchEmployeeData1List.HospitalID);

            
           // this.FetchEmployeeDesignation(this.FetchEmployeeData1List.HospDeptID);

            setTimeout(() => {
              this.empForm.patchValue({
                Department: this.FetchEmployeeData1List.HospDeptID,
                Designation: this.FetchEmployeeData1List.DeptDesigID
              })
            }, 2000);
          }
        }
      },
        (err) => {

        })
  }

  scrollTo(section: string) {
    if (section == 'personal') {
      var currentTimeElement = this.personal.nativeElement.querySelector('.card');
    }
    else if (section == 'hr') {
      var currentTimeElement = this.hr.nativeElement.querySelector('.card');
    }
    else if (section == 'academic') {
      var currentTimeElement = this.academic.nativeElement.querySelector('.card');
    }
    else if (section == 'contact') {
      var currentTimeElement = this.contact.nativeElement.querySelector('.card');
    }

    if (currentTimeElement) {
      currentTimeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  calculateAge(): void {
    const birthdate = new Date(this.empForm.get("DateofBirth")?.value);
    const ageDiffMs = new Date().getTime() - birthdate.getTime();
    const ageDate = new Date(ageDiffMs);
    this.empForm.get("Age")?.setValue(Math.abs(ageDate.getUTCFullYear() - 1970) + "  "+"Years");
  }

  searchLanguage(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(employeeDetails.FetchAdmRoutes, { Type: 4, DisplayName: event.target.value });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.GetMasterDataList = response.GetMasterDataList;
          }
        },
          (err) => {
          })
    }
  }

  onLangSelected(item: any) {
    this.errorMessages = [];
    const existingId = this.selectedLang.find((lang: any) => lang.id === item.id);
    const existingName = this.selectedLang.find((lang: any) => lang.name === item.name);

    if (!existingId && !existingName) {
        this.GetMasterDataList = [];
        this.selectedLang.push(item);
    } else {
      this.errorMessages.push("Duplicates are not allowed");
      $("#errorMessagesModal").modal('show');
    }
  }

  removeLangItem(index: number): void {
    this.selectedLang.splice(index, 1);
  } 

  DefaultPassword() {
    this.isDefaultPassword = !this.isDefaultPassword;    
  }
  DefaultPasswordExpired() {
    this.isPasswordExpired = !this.isPasswordExpired;    
  }
  BlockedEmployee() {
    this.isDischargeReturn = !this.isDischargeReturn; 
      let payload = {
      "EmpID": this.empForm.get("EmpID")?.value,   
      "Revert": !this.isDischargeReturn?0:1,   
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": 3395,
        "HospitalID":this.hospitalID
      }
      this.us.post(employeeDetails.BlockEmployee, payload).subscribe((response) => {
        if (response.Status == "Success") {
          this.SucessMsg=this.isDischargeReturn==true?"Blocked Successfully":"UnBlocked Successfully";
          $("#SucessMsg").modal('show');
        }
      },
        (err) => {
          console.log(err)
        })
  }
  BlockedEmployeeP() {
    this.isPasswordExpired = !this.isPasswordExpired; 

      let payload = {
        "EmpID": this.empForm.get("EmpID")?.value,   
        "Revert": !this.isPasswordExpired?0:1,      
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": 3395,
        "HospitalID":this.hospitalID
      }
      this.us.post(employeeDetails.BlockEmployee, payload).subscribe((response) => {
        if (response.Status == "Success") {
          this.SucessMsg=this.isPasswordExpired==true?"Password Reset Success":"Password Reset UnSuccess";
          $("#SucessMsg").modal('show');
        }
      },
        (err) => {
          console.log(err)
        })
  }

  fetchLocations() {
    this.url = this.service.getData(employeeDetails.FetchHospitalLocations, { HospitalID : this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.hospitalLocations = response.HospitalLocationsDataList;
            this.hospitalLocations.forEach((element:any, index:any) => {
              element.selected = false;
            });
            this.getEmployeeMappedLocations();
          }
        },
          (err) => {
          })
  }
  
  getEmployeeMappedLocations() {
    
    if(this.empForm.get("EmpID")?.value != "") {
    this.url = this.service.getData(employeeDetails.FetchEmployeeHospitals, { 
      EmpID: this.empForm.get("EmpID")?.value,
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: 3395,
      HospitalID: this.hospitalID
    });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.FetchEmployeeHospitalsDataList = response.FetchEmployeeHospitalsDataList;
            this.FetchEmployeeHospitalsDataList.forEach((element:any, index:any) => {
              var findhosp = this.hospitalLocations.find((x:any) => x.HospitalID == element.HospitalID);
              if(findhosp!=undefined)
              findhosp.selected = true;
            });
            $("#EmployeeHospitalLocations").modal('show');
          }
        },
          (err) => {
          })
      }
      else {
        this.errorMessages = [];
        this.errorMessages.push("Please select Employee to map location.");
        $("#errorMessagesModal").modal('show');
      }
  }

  selectLocation(loc:any) {
    loc.selected = !loc.selected;
  }

  SaveEmployeeHospitals() {
    var emplocs = this.hospitalLocations.filter((x:any) => x.selected);
    var empHospxml: any[] = [];
    emplocs.forEach((element:any, index:any) => {
      empHospxml.push({
        "HID" : element.HospitalID
      });
    });

    var payload = {
      "EmpID": this.empForm.get("EmpID")?.value,
      "EmployeeHospitalsXML": empHospxml,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": 3395,
      "HospitalID": this.hospitalID
    }
    this.us.post(employeeDetails.SaveEmployeeHospitals, payload).subscribe((response) => {
      if (response.Status === "Success") {
        this.SucessMsg = "Locations mapped successfully";
        $("#EmployeeHospitalLocations").modal('hide');
        $("#SucessMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {
          this.errorMessages = [];
          this.errorMessages.push(response.Message);
          this.errorMessages.push(response.Message2L);
          $("#errorMessagesModal").modal('show');
        }
      }
    },
      (err) => {

      })
  }

  closeEmpMapLocation() {
    $("#EmployeeHospitalLocations").modal('hide');
  }
  navigatetoRoleMapping() {   
    this.router.navigate(['/administration/mapuser']); 
}

  openEmployeeSignature() {
    if(this.empForm.get("EmpID")?.value != "") {
      this.showSignature = false; 
        setTimeout(() => {
          this.showSignature = true;
        }, 0);
      $("#divEmployeeSignature").modal('show');
    }
    else {
      this.errorMessages = [];
        this.errorMessages.push("Please select Employee to upload Signature.");
        $("#errorMessagesModal").modal('show');
    }
  }
  base64Relative1Signature(event: any) {
    this.employeeSignInfoForm.patchValue({ Signature1: event });
  }
  SickleaveVerifyDoctor() {   
    var dataPayload = {
      isCitizen: this.empForm.get("SehaNationality")?.value,
      idIqamaNumber: this.empForm.get("SSN")?.value,
      mobileNumber: this.empForm.get("empPresentMobile")?.value.slice(1),
      email: this.empForm.get("empPresEmail")?.value,
      birthDate: this.empForm.get("SehaDoB")?.value,
    }

     var signPayload = {
      issuerNationalId: this.empForm.get("SSN")?.value,
      issuerDoB: this.empForm.get("SehaDoB")?.value,
      data:dataPayload,    
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.ward.FacilityID,
      HospitalID: Number(this.empForm.get("Location")?.value),
    }

    this.us.post(employeeDetails.SickleaveVerifyDoctor, signPayload).subscribe((response) => {
      if (response.StatusCode == 200) {    
        this.UpdateEmployeeSehaVerified(this.empForm.get("EmpID")?.value);  
        this.errorMsg = response.errorMessage;
        $('#errorMsg').modal('show');
        this.FetchEmployee(this.empForm.get("EmpID")?.value);

      }
      else {      
          this.errorMsg = response.errorMessage;
        $('#errorMsg').modal('show');
        
      }
    },
      (err) => {
      })
}
  updateDoctorSignature() {
    var signPayload = {
      EMPID: this.empForm.get("EmpID")?.value,
      Signature : this.employeeSignInfoForm.get('Signature1')?.value,
      Hospitalid: Number(this.hospitalID),
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: 3392
    }
    this.us.post(employeeDetails.SaveEmployeeSignatures, signPayload).subscribe((response) => {
      if (response.Code == 200) {
        $("#divEmployeeSignature").modal('hide');
        $("#doctorSignatureSavedMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {
          this.errorMessages = [];
          this.errorMessages.push(response.Message);
          this.errorMessages.push(response.Message2L);
          $("#errorMessagesModal").modal('show');
        }
      }
    },
      (err) => {
      })
  }
  clearEmployeeInfo() {
    this.base64StringSig1 = '';
  this.showSignature = false;
  setTimeout(() => {
    this.showSignature = true;
  }, 0);
  this.employeeSignInfoForm.patchValue({ Signature1: '' });
}
  clearSignature() {
    this.base64StringSig1 = '';
    this.showSignature = false;
    setTimeout(() => {
      this.showSignature = true;
    }, 0);
    this.employeeSignInfoForm.patchValue({ Signature1: '' });
  }
  closeEmployeeSignature() {
    this.base64StringSig1 = '';
    this.showSignature = false;
    setTimeout(() => {
      this.showSignature = true;
    }, 0);
    this.employeeSignInfoForm.patchValue({ Signature1: '' });
    $("#divEmployeeSignature").modal('hide');
  }

  onSelectFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      var type = event.target.files[0].name.split(".").pop();
      if (event.target.files[0].size > 5242880) {
        this.fileError = 'File size limit should not exceed 5MB';
        alert(this.fileError);
      }
      else if (type.toLowerCase() !== 'jpeg' && type.toLowerCase() !== 'jpg' && type.toLowerCase() !== 'bmp'
        && type.toLowerCase() !== 'gif' && type.toLowerCase() !== 'png' && type.toLowerCase() !== 'tiff' && type.toLowerCase() !== 'tif') {
        this.fileError = 'File type should be  jpeg, jpg, bmp, gif, png, tiff';
        alert(this.fileError);
      }
      else {
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        this.convertToBase64(file, event.target.id);
      }
    }
  }
  convertToBase64(file: File, inputType: any) {    
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber);
    })
    observable.subscribe((d) => {
      // console.log(d);
      this.myPhoto = d;
      this.profilePhotoUploaded = true;
    });    
  }
  readFile(file: File, subscriber: Subscriber<any>) {
    const filereader = new FileReader();
    filereader.readAsDataURL(file);
    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete();
    }
    filereader.onerror = () => {
      subscriber.error();
      subscriber.complete();
    }
  }

}
