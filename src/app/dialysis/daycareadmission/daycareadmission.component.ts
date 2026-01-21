import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { Router } from '@angular/router';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { DaycareAdmissionService } from './daycareadmission.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import KeenSlider, { KeenSliderInstance } from "keen-slider";

declare var $: any;
export const MY_FORMATS = {
  parse: {
    dateInput: 'dd-MMM-yyyy HH:mm:ss',
  },
  display: {
    dateInput: 'DD-MMM-yyyy',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'dd-MMM-yyyy',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-daycareadmission',
  templateUrl: './daycareadmission.component.html',
  styleUrls: ['./daycareadmission.component.scss'],
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
export class DaycareAdmissionComponent extends BaseComponent implements OnInit {

  url = '';
  patientAdmissionMasterData: any;
  patientAdmissionMastertempData: any;
  genderList: any = [];
  maritalStatusList: any = [];
  primaryConsultantList: any = [];
  specialisationsList: any = [];
  admissionSourceList: any = [];
  admissionTypeList: any = [];
  eligibleBedTypeList: any = [];
  allotedBedTypesList: any = [];
  Nationalities: any = [];
  bedAllocationRemarksList: any = [];
  gendersList: any = [];
  wardsList: any = [];
  bedsList: any = [];
  requestedbedsList: any = [];
  patientAdmissionForm!: FormGroup;
  motherSelectionForm!: FormGroup;
  selectedPatientForAdmission: any = [];
  hospitalEmployees: any;
  hospitalEmployeesFiltered: any;
  hospitalPrimaryEmployees: any;
  employeeSpecilisations: any;
  patientRegDetails: any = [];
  patientRegCompanyDetails: any = [];
  patientAdmissionDetails: any = [];
  patientDiagnosisList: any = [];
  isNewBorn = false;
  isSubmitted = false;
  currentDate: any;
  multiplePatients: any;
  selectedPatientIPID: string = "";
  selectedPatientPatientID: string = "";
  showPatientNotSelectedValidation = false;
  diagStr: string = "";
  trustedUrl: any;
  navigatedFromAdmReq = false;
  patientAdmitted = false;
  pregnancyContent: string = '';
  docIntOrExt = true;
  errorMessages: any[] = [];
  errorMsg: any;
  selectedMotherDetails: any = [];
  reprintReason: string = "";
  reprintReasons: any = [];
  isAdultPrint = true;
  showRemarksMandatoryMsg = false;
  showRemarksForOther = false;
  billType: string = "";
  showSaveBtn = true;
  fromBedsBoard = false;
  saveMsg = "";
  thumbnailImageSlider: KeenSliderInstance | undefined;
  @ViewChild("thumbailImageSlider") sliderForNew: ElementRef<HTMLElement> | undefined;
  currentSlide: number = 1;
  PcurrentSlide: number = 1;
  age = "";
  SpecializationList: any;
  selectedSpecialisationData: any = [];
  selectedSpecialisationDataFiltered: any = [];
  selectedProcData: any = [];
  showNoRecFound = true;
  hospitalName: any;
  PatientID: any;
  noPatientSelected = false;
  patientVisits: any = [];
  listOfSpecItems: any = [];
  listOfSpecItems1: any = [];
  SpecializationList1: any = [];
  fromAkuWorklist: string = "false";
  akuWrklstPatient: any;
  babySSN: any;
  surgeryNames: string = "";
  requestedBedTypeEnable: boolean = false;
  currentProductImage = './assets/images/RoyalSuite/SuiteRoom5.jpg';
  images = [
    './assets/images/RoyalSuite/SuiteRoom5.jpg',
    './assets/images/RoyalSuite/SuiteRoom1.jpg',
    './assets/images/RoyalSuite/SuiteRoom2.jpg',
    './assets/images/RoyalSuite/SuiteRoom3.jpg',
    './assets/images/RoyalSuite/SuiteRoom4.jpg',


  ];

  PrivatecurrentProductImage = './assets/images/PrivateRoom/PrivateRoom1.jpg';
  Pimages = [
    './assets/images/PrivateRoom/PrivateRoom1.jpg',
    './assets/images/PrivateRoom/PrivateRoom2.jpg',
    './assets/images/PrivateRoom/PrivateRoom3.jpg',
  ];

  constructor(private router: Router, private us: UtilityService, private service: DaycareAdmissionService, public formBuilder: FormBuilder, public datepipe: DatePipe) {
    super();
    this.service.param = {
      ...this.service.param,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID
    };

    this.patientAdmissionForm = this.formBuilder.group({
      AdmissionID: [''],
      AdmissionNumber: [''],
      PatientID: [''],
      PatientType: [''],
      VisitID: [''],
      VisitType: [''],
      NewVisitID: [''],
      EpisodeID: [''],
      IsNewBorn: [''],
      TimeofBirth: [''],
      TitleID: [''],
      Firstname: [''],
      MiddleName: [''],
      LastName: [''],
      GenderID: ['0'],
      MaidenName: [''],
      GuardianName: [''],
      IsGuardianSpouse: [''],
      DOB: [''],
      Age: [''],
      AgeUoMID: [''],
      IsAgebyDoB: [''],
      Address01: [''],
      Address02: [''],
      Address03: [''],
      ZipCode: [''],
      CityID: [''],
      PhoneNo: [''],
      MobileNo: [''],
      EMail: [''],
      SSN: [''],
      ContactName: [''],
      ContAddress: [''],
      ContPhoneNo: [''],
      ContFaxNo: [''],
      ContEmail: [''],
      RelationID: [''],
      IsVIP: [''],
      ParentIPID: [''],
      IsForeigner: [''],
      PassportNo: [''],
      PassIssueDate: [''],
      PassExpiryDate: [''],
      PassIssuePlace: [''],
      ConsultantID: ['', Validators.required],
      ConsultantName: [''],
      ExptDisChargeDate: [new Date(), Validators.required],
      IsRefDocExternal: [''],
      ExRefDocID: [''],
      RefDocID: [''],
      QualificationID: [''],
      OccupationID: [''],
      MaritalStatusID: [''],
      CompanyID: [''],
      ReligionID: [''],
      BedID: ['0', Validators.required],
      WardID: ['0', Validators.required],
      BillBedTypID: ['0', Validators.required],
      AllocBedTypID: ['0', Validators.required],
      EligibleBedType: ['0', Validators.required],
      RequestedBedID: ['0', Validators.required],
      CODE: [''],
      NationalityID: [''],
      AdmTypeID: ['0'],
      AdmSourceID: ['0'],
      BloodGroupID: [''],
      HospitalID: [''],
      MLCTypeID: [''],
      MLCTransportID: [''],
      BroughtBy: [''],
      IncidentSite: [''],
      PoliceStation: [''],
      ConstableName: [''],
      ARCopy: [''],
      BillType: [''],
      BillNo: [''],
      AccReportNo: [''],
      ReqBedTypID: ['0', Validators.required],
      FoodAllergies: [''],
      OtherAllergies: [''],
      DrugAllergies: [''],
      workPermitID: [''],
      WPIssuedDate: [''],
      WPExpiryDate: [''],
      WPIssuedAT: [''],
      WPIssuedBy: [''],
      ReferalBasisNo: [''],
      EscortRelationID: [''],
      VisaIssueDate: [''],
      VisaExpiryDate: [''],
      VisaIssuedAt: [''],
      VisaIssuedBy: [''],
      USERID: [''],
      WORKSTATIONID: [''],
      Error: [''],
      SpecialiseID: ['0', Validators.required],
      SpecialisationName: [''],
      Remarks: [''],
      FeatureId: [''],
      FunctionId: [''],
      CallContext: [''],
      PatientEmpId: [''],
      Mrno: [''],
      RelationCode: [''],
      LetterIDS: [''],
      FirstName2L: [''],
      MiddleName2L: [''],
      LastName2L: [''],
      MaidenName2L: [''],
      GaurdianName2L: [''],
      Address012L: [''],
      Address022L: [''],
      Address032L: [''],
      ContactName2L: [''],
      ContAddress2L: [''],
      BroughtBy2l: [''],
      IncidentSite2l: [''],
      PoliceStation2l: [''],
      ConstableName2l: [''],
      ARCopy2L: [''],
      GradeID: [''],
      DepositRequestAmount: [''],
      DepositRemarks: [''],
      PoliceBuckleNo: [''],
      MLCReportDelivery: [''],
      MLCRemarks: [''],
      OnCallDoctor: [''],
      AdviceMonitorID: [''],
      ScheduleID: [''],
      PreviousBillDate: [''],
      ScanDocumentPath: [''],
      PatientAttender: [''],
      PatientAttenderPassNo: [''],
      SpecialInstruction: [''],
      IsServicePatient: [''],
      Resident: [''],
      ismlc: [''],
      IdentifyMark01: [''],
      IdentifyMark02: [''],
      FormIssued: [''],
      DiffbedAllocationReasonID: ['0'],
      PatientVehicleNo: [''],
      Isorgandonor: [''],
      RecepientIPID: [''],
      IsinformtoPolice: [''],
      EstimationAmount: [''],
      IsFormIssued: [''],
      BroughtByPersonPhoneNo: [''],
      BroughtByPersonAddress: [''],
      NameofCM: [''],
      mechanismofinjuryID: [''],
      Allegedcause: [''],
      DutyConstable: [''],
      DutyConstableNo: [''],
      Familyname: [''],
      Diseases: [''],
      TriagePriorityId: [''],
      PolicyNo: [''],
      InsuranceNo: [''],
      CardExpiryDate: [''],
      FamilyName2l: ['']
    });

    this.fromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;

    this.motherSelectionForm = this.formBuilder.group({
      MotherSSN: [''],
      MotherName: [''],
      MotherIPID: [''],
      Dateofbirth: [''],
      Timeofbirth: ['']
    });
  }


  ngOnInit(): void {

    //this.selectedPatientForAdmission = JSON.parse(sessionStorage.getItem("selectedPatientForAdmission") ?? '{}');//JSON.parse(sessionStorage.getItem("selectedPatientForAdmission") || '{}');
    //this.selectedPatientForAdmission = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');

    this.fromAkuWorklist = sessionStorage.getItem("fromAkuWorklist") || 'false';
    this.akuWrklstPatient =this.selectedPatientForAdmission =JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');


    this.currentDate = moment(new Date()).format('DD-MMM-YYYY');
    this.fetchSpecialisations();

    //if (this.fromBedsBoard) {
      const fac = JSON.parse(sessionStorage.getItem("facility") || '{}');
      this.facilitySessionId = fac.FacilityID;
      if(this.facilitySessionId === undefined) {
        this.facilitySessionId = fac;
      }
    //}
    this.getPatientAdmissionMasterData();
    //this.fetchHospitalEmployees();
    this.hospitalName = sessionStorage.getItem("locationName");
    if (this.selectedPatientForAdmission.length != undefined || this.selectedPatientForAdmission.PatientID != undefined) {
      this.loadWardsForSelectedBedType("0", "0", "");
      this.surgeryNames = this.selectedPatientForAdmission?.SurgeryName;
      this.age = this.selectedPatientForAdmission.Age.split(' ')[0];
      //this.fetchHospitalPrimaryEmployees(this.hospitalID, this.selectedPatientForAdmission.SpecialiseID); 
      if (this.akuWrklstPatient.IPAdmissionID=='')    
            this.FetchPatientEMRIP();
      //this.getSelectedDoctorSpecialisations(this.selectedPatientForAdmission.DoctorID, "0");
      this.patientAdmissionForm.patchValue({
        ConsultantID: this.selectedPatientForAdmission.DoctorID,
        ConsultantName: this.selectedPatientForAdmission.Consultant,
        SpecialiseID: this.selectedPatientForAdmission.SpecialiseID,
        SpecialisationName: this.selectedPatientForAdmission.Specialisation
      });
      this.navigatedFromAdmReq = true;
      this.patientAdmissionForm.patchValue({
        Remarks: this.selectedPatientForAdmission.ReasonForAdm,
        ExptDisChargeDate: (this.selectedPatientForAdmission.ExptDisChargeDate != null && this.selectedPatientForAdmission.ExptDisChargeDate != '') ? new Date(this.selectedPatientForAdmission.ExptDisChargeDate) : new Date(),
        AdmTypeID: this.selectedPatientForAdmission.AdmissionTypeID,
        ConsultantID: this.selectedPatientForAdmission.DoctorID,
        SpecialiseID: this.selectedPatientForAdmission.SpecialiseID,
        WardID: this.selectedPatientForAdmission.WardID,
      });
      if (this.patientAdmissionForm.get('WardID')?.value != '') {
        var wardid = this.patientAdmissionForm.get('WardID')?.value;
        this.fetchBeds(wardid, "0", "0");
      }

      if (this.selectedPatientForAdmission.IPAdmissionID != undefined && this.selectedPatientForAdmission.IPAdmissionID != "")
        this.selectedPatientIPID = this.selectedPatientForAdmission.IPAdmissionID;
      else
        this.selectedPatientIPID = this.selectedPatientForAdmission.AdmissionID;

      this.selectedPatientPatientID = this.selectedPatientForAdmission.PatientID;
      //this.fetchEligibleBedTypes(this.selectedPatientForAdmission.CompanyID, this.selectedPatientForAdmission.GradeID);
      if (this.selectedPatientForAdmission.IsPregnancy) {
        this.setPregnancyContent(this.selectedPatientForAdmission.TriSemister);
      }

      this.fetchPatientFromReg();
      setTimeout(() => {
        this.fetchAdmissionInPatient();
      }, 2000);

    }


   
    if (this.fromAkuWorklist === 'true' &&this.akuWrklstPatient.IPAdmissionID=='') {
      $("#txtSsn").val(this.akuWrklstPatient.SSN);
      this.fetchPatientDetails(this.akuWrklstPatient.SSN, '0', '0');
    }
  }

  ngAfterViewInit() {
    if (this.sliderForNew != null) {
      this.thumbnailImageSlider = new KeenSlider(this.sliderForNew.nativeElement, {
        loop: true,
        mode: "free",
        initial: this.currentSlide,
        slideChanged: (s: { track: { details: { rel: number; }; }; }) => {
          this.currentSlide = s.track.details.rel;
          this.currentProductImage = this.images[this.currentSlide];
          this.currentSlide = this.currentSlide == 0 ? 1 : this.currentSlide;
        },
        slides: {
          perView: 4,
          spacing: 16,
        },
      })
    }
  }

  setThumbSlider(index: number) {
    this.currentProductImage = this.images[index - 1];
    this.currentSlide = (index - 1);
  }
  PsetThumbSlider(index: number) {
    this.PrivatecurrentProductImage = this.Pimages[index - 1];
    this.PcurrentSlide = (index - 1);
  }
  // get currentProductImage(): string {
  //   return this.images[this.currentSlide];
  // }
  previousImage(): void {
    if (this.currentSlide < 1) {
      this.currentSlide = 1;
    }
    this.currentSlide = this.currentSlide - 1;
    this.currentProductImage = this.images[this.currentSlide];
    // this.currentSlide = (this.currentSlide > 0) ? this.currentSlide - 1 : this.images.length - 1;
  }

  nextImage(): void {
    if (this.currentSlide >= 4) {
      this.currentSlide = -1;
    }
    this.currentSlide = this.currentSlide + 1;
    this.currentProductImage = this.images[this.currentSlide]
    // this.currentSlide = (this.currentSlide < this.images.length - 1) ? this.currentSlide + 1 : 0;
  }

  previousPrivateImage(): void {
    if (this.PcurrentSlide < 1) {
      this.PcurrentSlide = 1;
    }
    this.PcurrentSlide = this.PcurrentSlide - 1;
    this.PrivatecurrentProductImage = this.Pimages[this.PcurrentSlide];
    // this.currentSlide = (this.currentSlide > 0) ? this.currentSlide - 1 : this.images.length - 1;
  }

  nextPrivateImage(): void {
    if (this.PcurrentSlide >= 2) {
      this.PcurrentSlide = -1;
    }
    this.PcurrentSlide = this.PcurrentSlide + 1;
    this.PrivatecurrentProductImage = this.Pimages[this.PcurrentSlide]
    // this.currentSlide = (this.currentSlide < this.images.length - 1) ? this.currentSlide + 1 : 0;
  }


  getPatientAdmissionMasterData() {
    let inputData = {
      Type: '1,3,5,9,11,12,26,27,38,39,228',
      UserID: 0,
      LanguageID: 0,
    };
    this.us.post(patientadmission.getPatientRegMasterData, inputData).subscribe(
      (response) => {
        if (response.Status == 'Success' && response.Code == 200) {
          this.patientAdmissionMasterData = response.MasterDataList;
          this.patientAdmissionMastertempData = this.patientAdmissionMasterData.reduce(
            (obj: any, v: any, i: any) => {
              obj[v.TableName] = obj[v.TableName] || [];
              obj[v.TableName].push(v);
              return obj;
            },
            {}
          );
          this.admissionTypeList = this.patientAdmissionMastertempData.AdmissionType[0].DemoGraphicsData;
          this.admissionSourceList = this.patientAdmissionMastertempData.AdmissionSource[0].DemoGraphicsData;
          this.bedAllocationRemarksList = this.patientAdmissionMastertempData.BedAllocationRemarks[0].DemoGraphicsData;
          this.gendersList = this.patientAdmissionMastertempData.Genders[0].DemoGraphicsData;
          this.gendersList.splice(3, 1); this.gendersList.splice(2, 1);
        } else {
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.fetchPatientDetailsBySsn(event);
    }
  }

  fetchPatientDetailsBySsn(event: any) {
    var inputval = event.target.value;
    var ssn = "0"; var mobileno = "0"; var patientid = "0";
    if (inputval.charAt(0) === "0") {
      ssn = "0";
      mobileno = inputval;
      patientid = "0";
    }
    else {
      ssn = inputval;
      mobileno = "0";
      patientid = "0";
    }

    this.fetchPatientDetails(ssn, mobileno, patientid)
  }

  FetchPatientEMRIP() {
    var ret = true;
    this.url = this.service.getData(patientadmission.FetchPatientEMRIP, {
      RegCode: this.akuWrklstPatient.Regcode,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code === 604) {
          this.errorMessages = [];
          this.errorMessages.push(response.FetchPatientEMRIPDataList[0].strMessage);
          this.showSaveBtn = false;
          $("#patientIPAdmissionValidationMsgs").modal('show');

        }
      },
        (err) => {

        })
  }

  fetchPatientDetails(ssn: string, mobileno: string, patientId: string) {
    this.url = this.service.getData(patientadmission.fetchPatientDataBySsn, {
      SSN: ssn,
      PatientID: patientId,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatientDependCLists.length > 1) {
            this.multiplePatients = response.FetchPatientDependCLists;
            $("#divMultiplePatients").modal('show');
          }
          else {
            if (response.FetchPatientDataCCList.length > 0) {
              if (this.fromAkuWorklist === 'true') {
                this.selectedPatientPatientID = this.akuWrklstPatient.PatientID;
                this.selectedPatientIPID = this.akuWrklstPatient.AdmissionID;
              }
              else {
                this.selectedPatientPatientID = response.FetchPatientDataCCList[0].PatientID;
                this.selectedPatientIPID = response.FetchPatientDataCCList[0].IPAdmissionID;
              }
              this.age = response.FetchPatientDataCCList[0].Age;
              $("#txtSsn").val(this.selectedPatientForAdmission.SSN === undefined ? response.FetchPatientDataCCList[0].SSN : this.selectedPatientForAdmission.SSN);
              this.fetchPatientFromReg();
              // if (this.akuWrklstPatient.IPAdmissionID=='')
              //   this.FetchPatientEMRIP();
              //this.fetchHospitalPrimaryEmployees(this.hospitalID, '0');
              setTimeout(() => {
                this.fetchAdmissionInPatient();
              }, 2000);
              this.loadWardsForSelectedBedType("0", "0", "");
            }
            else {
              this.errorMessages = [];
              this.errorMessages.push("No Records Found");
              $("#patientIPAdmissionValidationMsgs").modal('show');
            }

          }
          //this.showNoRecFound = false;
        }
      },
        (err) => {

        })
  }

  fetchSelectedPatientPrescription() {
    this.fetchAdmissionInPatient();
    $("#divMultiplePatients").modal('hide');
  }

  selectPatient(pat: any) {
    this.selectedPatientPatientID = pat.PatientID;
    this.selectedPatientIPID = pat.IPAdmissionID;
    this.multiplePatients.forEach((element: any, index: any) => {
      if (element.PatientID === pat.PatientID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
  }

  fetchPatientFromReg() {
    this.url = this.service.getData(patientadmission.FetchPatientFromReg, {
      PatientID: this.selectedPatientPatientID,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId,
      Hospitalid: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientRegDetails = response.FetchRegistrationPatientDataList;
          if(this.patientRegDetails[0].CardExpirydate !== null && this.patientRegDetails[0].CardExpirydate !== "") {
            if(new Date(this.patientRegDetails[0].CardExpirydate) < new Date()) {
              this.errorMsg = "Patient Card Validity has been expired.";
              this.showSaveBtn = false;
              $("#errorMsg").modal('show');
            }
          }
          this.patientRegCompanyDetails = response.FetchRegistrationCompanyPatientDataList[0];
          if (response.FetchRegistrationCompanyPatientDataList?.length > 0)
            this.fetchEligibleBedTypes(response.FetchRegistrationCompanyPatientDataList[0].PayerID, response.FetchRegistrationCompanyPatientDataList[0].GradeID);
          else
            this.fetchEligibleBedTypes("0", "0");
        }
      },
        (err) => {
        })
  }

  fetchAdmissionInPatient() {

    this.url = this.service.getData(patientadmission.FetchAdmissionInPatient, {
      PatientID: this.selectedPatientPatientID,
      IPID: this.selectedPatientIPID,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId,
      Hospitalid: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientAdmissionDetails = response.FetchAdmissionInPatientDataList[0];
          this.billType = this.patientAdmissionDetails.BillType;
          if (this.billType === '') {
            this.billType = "1";
          }
          if (this.selectedPatientIPID != '' && !this.navigatedFromAdmReq) {
            this.selectedPatientForAdmission = response.FetchAdmissionInPatientDataList[0];
            this.selectedPatientForAdmission.PatientName =
              response.FetchAdmissionInPatientDataList[0].Title + " " + response.FetchAdmissionInPatientDataList[0].FirstName + " " +
              response.FetchAdmissionInPatientDataList[0].MiddleName;
            this.selectedPatientForAdmission.insuranceCompanyName = response.FetchAdmissionInPatientDataList[0].InsuranceCompany;
            this.selectedPatientForAdmission.VisitID = response.FetchAdmissionInPatientDataList[0].VisitID;
            this.selectedPatientForAdmission.GenderID = response.FetchAdmissionInPatientDataList[0].GenderID;
            this.selectedPatientForAdmission.SSN = response.FetchAdmissionInPatientDataList[0].SSN;
            this.selectedPatientForAdmission.DoctorID = response.FetchAdmissionInPatientDataList[0].ConsultantID;
            this.selectedPatientForAdmission.CompanyID = response.FetchAdmissionInPatientDataList[0].CompanyId;
            this.selectedPatientForAdmission.SpecialiseID = response.FetchAdmissionInPatientDataList[0].SpecialiseID;
            this.selectedPatientForAdmission.GradeID = response.FetchAdmissionInPatientDataList[0].GradeID;
          }
          if (response.FetchAdmissionWardNBedsList.length > 0) {
            this.patientAdmitted = true;
            this.requestedBedTypeEnable = false;
          }
          this.patientDiagnosisList = response.FetchAdmissionDiagnosisList;
          this.diagStr = this.patientDiagnosisList?.map((item: any) => item.Code + "-" + item.DiseaseName).join(', ');
          if (this.patientDiagnosisList?.length === 0) {
            this.diagStr = this.selectedPatientForAdmission.Diagnosis;
          }
          if (this.fromAkuWorklist === 'true') {
            this.diagStr = this.akuWrklstPatient.Diagnosis;              
          }
          if (response.FetchAdmissionWardNBedsList.length > 0) {
            this.patientAdmissionForm.patchValue({
              //ConsultantID: response.FetchAdmissionInPatientDataList[0].ConsultantID,
              ExptDisChargeDate: response.FetchAdmissionInPatientDataList[0].ExptDisChargeDate === null ? '' : new Date(response.FetchAdmissionInPatientDataList[0].ExptDisChargeDate),
              EligibleBedType: response.FetchAdmissionWardNBedsList[0].AllocBedTypID,
              AllocBedTypID: response.FetchAdmissionWardNBedsList[0].AllocBedTypID,
              BillBedTypID: response.FetchAdmissionWardNBedsList[0].BillBedTypID,
              ReqBedTypID: response.FetchAdmissionWardNBedsList[0].ReqBedTypID,
              AdmTypeID: response.FetchAdmissionInPatientDataList[0].AdmTypeID,
              AdmSourceID: response.FetchAdmissionInPatientDataList[0].AdmSourceID,
              Remarks: response.FetchAdmissionInPatientDataList[0].Remarks,
              SpecialInstruction: response.FetchAdmissionInPatientDataList[0].SpecialInstruction,
              WardID: response.FetchAdmissionWardNBedsList[0].WardID,
              BedID: response.FetchAdmissionWardNBedsList[0].BedID
            });
            //if (this.hospitalEmployees.filter((x: any) => x.empid == response.FetchAdmissionInPatientDataList[0].ConsultantID).length > 0)
            //this.getSelectedDoctorSpecialisations(response.FetchAdmissionInPatientDataList[0].ConsultantID, response.FetchAdmissionInPatientDataList[0].SpecialiseID);

            //this.loadWardsForSelectedBedType(response.FetchAdmissionWardNBedsList[0].AllocBedTypID, response.FetchAdmissionWardNBedsList[0].WardID, response.FetchAdmissionWardNBedsList[0].BedID);
            this.fetchBeds(response.FetchAdmissionWardNBedsList[0].WardID, response.FetchAdmissionWardNBedsList[0].BedID, response.FetchAdmissionInPatientDataList[0].IPID);

            //this.fetchBeds(response.FetchAdmissionWardNBedsList[0].BedID, response.FetchAdmissionWardNBedsList[0].BedID);

          }
          else {
            // if (this.selectedPatientForAdmission.PatientType == 'EMR') {
            //   this.getSelectedDoctorSpecialisations(this.selectedPatientForAdmission.PrimaryDoctorID, this.selectedPatientForAdmission.PrimaryDoctorSpecialiseID);
            // }
            // else if (this.hospitalEmployees.filter((x: any) => x.empid == response.FetchAdmissionInPatientDataList[0].ConsultantID).length > 0)
            //   this.getSelectedDoctorSpecialisations(this.selectedPatientForAdmission.DoctorID, "0");
          }
          if (this.patientAdmissionForm.get("ConsultantID")?.value === '') {
            this.patientAdmissionForm.patchValue({
              ConsultantID: response.FetchAdmissionInPatientDataList[0].ConsultantID,
              ConsultantName: response.FetchAdmissionInPatientDataList[0].Consultant,
              SpecialiseID: response.FetchAdmissionInPatientDataList[0].SpecialiseID,
              SpecialisationName: response.FetchAdmissionInPatientDataList[0].Specialisation
            });
          }
          this.validations();
        }
      },
        (err) => {
        })
  }

  fetchEligibleBedTypes(companyid: string, gradeid: string) {
    this.url = this.service.getData(patientadmission.FetchEligibleBedTypes, {
      CompanyID: companyid == "" ? "0" : companyid,
      GradeID: gradeid == "" ? "0" : gradeid,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.eligibleBedTypeList = response.FetchEligibleBedTypesDataList.filter((x:any) => x.BedType.trim().toString().toLowerCase().includes('dialysis') || x.BedType.trim().toString().toLowerCase().includes('iccu'));
          this.allotedBedTypesList = response.FetchAllottedBedTypesDataList;
          if (this.selectedPatientForAdmission.PatientType == 'EMR') {
            // this.patientAdmissionForm.patchValue({
            //   EligibleBedType: this.selectedPatientForAdmission.WardID
            // });
            this.loadBedTypesAndWard(this.selectedPatientForAdmission.WardID);
          }
        }
      },
        (err) => {
        })
  }
  fetchHospitalEmployees() {
    this.url = this.service.getData(patientadmission.FetchHospitalEmployees, { HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.hospitalEmployees = this.hospitalEmployeesFiltered = response.HospitalEmployeesDataList;
          setTimeout(() => {
            this.FetchPatientEMRIP();
          }, 500);
        }
      },
        (err) => {
        })
  }
  fetchHospitalPrimaryEmployees(hospId: any, specid: any) {
    this.url = this.service.getData(patientadmission.FetchAdmitingPrimaryDoctors, { HospitalID: hospId, SpecialisationID: specid, Age: this.age == "" ? 1 : this.age });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.hospitalEmployees = this.hospitalEmployeesFiltered = response.HospitalPrimaryEmployeesDataList;
          setTimeout(() => {
            this.FetchPatientEMRIP();
          }, 500);
        }
      },
        (err) => {
        })
  }
  onHospitalEmployeeChange(event: any) {
    var docid = event.target.value;
    this.getSelectedDoctorSpecialisations(docid, "0");
  }
  getSelectedDoctorSpecialisations(docid: string, specid: string) {
    var selectedDoctorId = docid;//this.patientAdmissionForm.get('DoctorID')?.value;

    //this.url = this.service.getData(patientadmission.FetchEmployeeSpecializations, {
    this.url = this.service.getData(patientadmission.FetchEmployeePrimarySpecializations, {
      Type: 1,
      Filter: selectedDoctorId,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {

        this.employeeSpecilisations = response.EmployeeDocSpecialisationsDataList;
        if (specid != "0") {
          setTimeout(() => {
            if (this.selectedPatientForAdmission.PatientType == 'EMR') {
              this.patientAdmissionForm.patchValue({
                ConsultantID: docid,
                SpecialiseID: specid
              });
              const doc = this.hospitalEmployees.find((x: any) => x.empid === this.patientAdmissionForm.get('ConsultantID')?.value);
              if (doc)
                $('#Consultant').val(doc.FullName);
            }
            else {
              this.patientAdmissionForm.patchValue({
                ConsultantID: this.patientAdmissionDetails.DoctorID === undefined ? this.patientAdmissionDetails.ConsultantID : this.patientAdmissionDetails.DoctorID,
                SpecialiseID: this.patientAdmissionDetails.SpecialiseID
              });
              const doc = this.hospitalEmployees.find((x: any) => x.empid === this.patientAdmissionForm.get('ConsultantID')?.value);
              if (doc)
                $('#Consultant').val(doc.FullName);
            }
          }, 0);
        }

        else {
          this.patientAdmissionForm.patchValue({
            SpecialiseID: response.EmployeeDocSpecialisationsDataList[0].SpecialiseID
          });
          if (response.EmployeeDocSpecialisationsDataList.length === 1) {
            this.patientAdmissionForm.patchValue({
              ConsultantID: docid,
              SpecialiseID: response.EmployeeDocSpecialisationsDataList[0].SpecialiseID
            });
            const doc = this.hospitalEmployees.find((x: any) => x.empid === this.patientAdmissionForm.get('ConsultantID')?.value);
            if (doc)
              $('#Consultant').val(doc.FullName);
          }
          else {
            this.patientAdmissionForm.patchValue({
              ConsultantID: this.selectedPatientForAdmission.DoctorID,
              SpecialiseID: this.selectedPatientForAdmission.SpecialiseID
            });
            const doc = this.hospitalEmployees.find((x: any) => x.empid === this.patientAdmissionForm.get('ConsultantID')?.value);
            if (doc)
              $('#Consultant').val(doc.FullName);
          }
        }
      },
        (err) => {
        })
  }

  selectIsNewBorn() {
    if (this.isNewBorn) {
      this.isNewBorn = false;
    }
    else {
      this.isNewBorn = true;
      $("#motherDetails").modal('show');
    }
  }

  clearIsNewBorn() {
    this.isNewBorn = false;
  }

  onEligibleBedTypeChanged(event: any) {
    var elgBedTypeId = event.target.value;
    this.loadBedTypesAndWard(elgBedTypeId);
    // this.patientAdmissionForm.patchValue({     
    //   ReqBedTypID: elgBedTypeId
    // })


  }

  loadBedTypesAndWard(elgbedtypeid: any) {
    this.url = this.service.getData(patientadmission.FetchSelectionEligibleBedTypes, {
      BedTypeID: elgbedtypeid,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchSelectionEligibleBedTypesDataList.length > 0) {
          this.patientAdmissionForm.patchValue({
            AllocBedTypID: response.FetchSelectionEligibleBedTypesDataList[0].BedTypeID == "0" ? elgbedtypeid : response.FetchSelectionEligibleBedTypesDataList[0].BedTypeID,
            ReqBedTypID: response.FetchSelectionEligibleBedTypesDataList[0].BedTypeID == "0" ? elgbedtypeid : response.FetchSelectionEligibleBedTypesDataList[0].BedTypeID,
            BillBedTypID: response.FetchSelectionEligibleBedTypesDataList[0].BedTypeID == "0" ? elgbedtypeid : response.FetchSelectionEligibleBedTypesDataList[0].BedTypeID
          })

          var WardID = this.patientAdmissionForm.get('WardID')?.value == "" ? 0 : this.patientAdmissionForm.get('WardID')?.value;
          this.loadWardsForSelectedBedType(this.patientAdmissionForm.get('EligibleBedType')?.value, WardID, "");
        }
      },
        (err) => {
        })
  }

  loadWardsForSelectedBedType(eligibleBedType: string, wardid: string, bedid: string) {

    this.url = this.service.getData(patientadmission.FetchAdmissionWards, {
      BedTypeID: eligibleBedType,
      GenderID: this.selectedPatientForAdmission.GenderID || this.akuWrklstPatient.GenderID,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchAdmissionWardsDataList.length > 0) {
          this.wardsList = response.FetchAdmissionWardsDataList.filter((x:any) => x.Ward.trim().toString().toLowerCase().includes('dialysis') || x.Ward.trim().toString().toLowerCase().includes('iccu'));
          const dialysisWard = this.wardsList.find((x:any) => x.Ward.includes('DIALYSIS'));
          if (wardid != "0") {
            setTimeout(() => {
              this.patientAdmissionForm.patchValue({
                WardID: wardid
              })
            }, 0);
          }
          if (bedid != "0" && wardid != "0") {
            //this.fetchBeds(wardid, bedid, this.selectedPatientIPID);
            this.fetchBeds(wardid, bedid, "0");
          }
          if (this.fromAkuWorklist) {
            const eligibleBedType = this.eligibleBedTypeList.find((x: any) => x.BedType.toUpperCase().includes("DIALYSIS") || x.BedType.toUpperCase().includes("ICCU"));
            // if (eligibleBedType) {
            //   this.patientAdmissionForm.patchValue({
            //     EligibleBedType: eligibleBedType.BedTypeID
            //   });
            // }
            // this.patientAdmissionForm.patchValue({
            //   WardID: dialysisWard.WardID
            // })
            this.fetchBeds(dialysisWard.WardID, '0', '0');
          }
        }
      },
        (err) => {
        })
  }

  onWardSelectedChange(event: any) {
    var wardid = event.target.value;
    this.fetchBeds(wardid, "0", "0");
  }

  fetchBeds(wardid: string, bedid: string, ipid: string) {
    this.url = this.service.getData(patientadmission.FetchAdmissionWardBeds, {
      BedTypeID: this.patientAdmissionForm.get('EligibleBedType')?.value,
      IPID: ipid != "0" ? ipid : "0",
      WardID: wardid,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.bedsList = response.FetchAdmissionWardBedsDataList;
        }
        if (bedid != "0") {
          setTimeout(() => {
            this.patientAdmissionForm.patchValue({
              BedID: bedid,
              WardID: wardid,
            })
          }, 0);

        }
        if (this.fromAkuWorklist) {
          // const dialysisWard = this.wardsList.find((x:any) => x.Ward.includes('DIALYSIS') || x.Ward.includes('ICCU'));
          // const eligibleBedType = this.eligibleBedTypeList.find((x: any) => x.BedType.toUpperCase().includes("DIALYSIS") || x.BedType.toUpperCase().includes("ICCU"));
          // if (eligibleBedType) {
          //   this.patientAdmissionForm.patchValue({
          //     EligibleBedType: eligibleBedType.BedTypeID
          //   });
          // }
          // this.patientAdmissionForm.patchValue({
          //   WardID: dialysisWard.WardID
          // });
        }
      },
        (err) => {
        })
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.patientAdmissionForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  savePatientAdmission() {

    var diagnosisXml: any = [];
    this.patientDiagnosisList.forEach((element: any, index: any) => {
      diagnosisXml.push({
        DID: element.DiseaseID,
        BLOCKED: 0
      })
    });

    this.isSubmitted = true;
    var findInvalidControls = this.findInvalidControls();
    var newbornage; var parentipid; var visittype;
    if (this.isNewBorn) {
      //   const birthtime = new Date(`2000-01-01T${this.motherSelectionForm.get('Timeofbirth')?.value}`);
      //   const currenttime = new Date(`2000-01-01T${new Date()}`)
      //   newbornage = currenttime - birthtime;

      parentipid = this.motherSelectionForm.get('MotherIPID')?.value;


    }
    var compid = this.patientRegCompanyDetails?.PayerID;
    var gradeid = this.patientRegCompanyDetails?.GradeID;
    if (this.billType === '2' && compid === undefined) {
      compid = this.patientAdmissionDetails.CompanyId;
      gradeid = this.patientAdmissionDetails.GradeID
    }
    if (this.patientAdmissionForm.valid && this.patientAdmissionForm.get('EligibleBedType')?.value != '0' && this.patientAdmissionForm.get('AllocBedTypID')?.value != '0'
      && this.patientAdmissionForm.get('BillBedTypID')?.value != '0' && this.patientAdmissionForm.get('ReqBedTypID')?.value != '0' && this.patientAdmissionForm.get('WardID')?.value
      && this.patientAdmissionForm.get('BedID')?.value != '0' && this.patientAdmissionForm.get('ConsultantID')?.value != '0' && this.patientAdmissionForm.get('SpecialiseID')?.value) {
      const patRegDetails = this.patientRegDetails[0];
      let payload = {
        "AdmissionID": "0", //this.selectedPatientIPID == "" ? "0" : this.selectedPatientIPID,
        "AdmissionNumber": "",
        "PatientID": this.isNewBorn ? 0 : Number(this.selectedPatientPatientID),
        "PatientType": 4,
        "VisitID": this.isNewBorn ? "" : this.selectedPatientForAdmission.VisitID,
        "VisitType": "1",//this.isNewBorn ? "1" : patRegDetails?.VisitType == "" ? 2 : patRegDetails?.VisitType,
        "NewVisitID": "",
        "EpisodeID": "",
        "IsNewBorn": this.isNewBorn ? 1 : 0,
        "TimeofBirth": this.motherSelectionForm.get('Timeofbirth')?.value == '' ? "0" : this.datepipe.transform(this.motherSelectionForm.value['Dateofbirth'], "dd-MMM-yyyy")?.toString() + ' ' + this.motherSelectionForm.get('Timeofbirth')?.value,
        "TitleID": this.isNewBorn ? '17' : patRegDetails?.TitleID,
        "Firstname": this.isNewBorn ? this.patientAdmissionForm.get('Firstname')?.value : patRegDetails?.FirstName,
        "MiddleName": this.isNewBorn ? this.patientAdmissionForm.get('MiddleName')?.value : patRegDetails?.MiddleName,
        "LastName": this.isNewBorn ? this.patientAdmissionForm.get('LastName')?.value : patRegDetails?.LastName,
        "GenderID": this.isNewBorn ? this.patientAdmissionForm.get('GenderID')?.value : this.selectedPatientForAdmission.GenderID,
        "MaidenName": patRegDetails?.MaidenName,
        "GuardianName": patRegDetails?.GuardianName,
        "IsGuardianSpouse": patRegDetails?.IsGuardianSpouse,
        "DOB": this.isNewBorn ? this.datepipe.transform(this.motherSelectionForm.get('Dateofbirth')?.value, "dd-MMM-yyyy")?.toString() + ' ' + this.motherSelectionForm.get('Timeofbirth')?.value : patRegDetails?.DOB,
        "Age": this.isNewBorn ? '1' : patRegDetails?.Age,
        "AgeUoMID": this.isNewBorn ? '3' : patRegDetails?.AgeUOMID,
        "IsAgebyDoB": 0,
        "Address01": patRegDetails?.Address01,
        "Address02": patRegDetails?.Address02,
        "Address03": patRegDetails?.Address03,
        "ZipCode": patRegDetails?.ZipCode,
        "CityID": patRegDetails?.CityID,
        "PhoneNo": patRegDetails?.PPhoneNo,
        "MobileNo": patRegDetails?.MobileNo,
        "EMail": patRegDetails?.Email,
        "SSN": this.isNewBorn ? this.babySSN : this.selectedPatientForAdmission.SSN,
        "ContactName": patRegDetails?.ContactName,
        "ContAddress": patRegDetails?.ContAddress,
        "ContPhoneNo": patRegDetails?.ContPhoneNo,
        "ContFaxNo": patRegDetails?.ContFaxNo,
        "ContEmail": patRegDetails?.ContEmail,
        "RelationID": patRegDetails?.ContRelationID,
        "IsVIP": patRegDetails?.ISVIP ? "1" : "0",
        "ParentIPID": this.isNewBorn ? parentipid : patRegDetails?.ParentIPID == "" ? "0" : patRegDetails?.ParentIPID,
        "IsForeigner": patRegDetails?.IsForeigner,
        "PassportNo": patRegDetails?.PassportNo,
        "PassIssueDate": patRegDetails?.PassIssueDate,
        "PassExpiryDate": patRegDetails?.PassExpiryDate,
        "PassIssuePlace": patRegDetails?.PassIssuePlace,
        "ConsultantID": this.patientAdmissionForm.get('ConsultantID')?.value,
        "ExptDisChargeDate": this.datepipe.transform(this.patientAdmissionForm.value['ExptDisChargeDate'], "dd-MMM-yyyy")?.toString(),
        "IsRefDocExternal": 0,
        "ExRefDocID": "0",
        "RefDocID": patRegDetails?.RefDocID == "" ? "0" : patRegDetails?.RefDocID,
        "QualificationID": patRegDetails?.QualificationID == "" ? "0" : patRegDetails?.QualificationID,
        "OccupationID": patRegDetails?.OccupationID == "" ? "0" : patRegDetails?.OccupationID,
        "MaritalStatusID": patRegDetails?.MaritalStatusID == "" ? "0" : patRegDetails?.MaritalStatusID,
        "CompanyID": this.billType === '1' ? "0" : compid,
        "ReligionID": patRegDetails?.ReligionID,
        "BedID": this.patientAdmissionForm.get('BedID')?.value,
        "WardID": this.patientAdmissionForm.get('WardID')?.value,
        "BillBedTypID": this.patientAdmissionForm.get('BillBedTypID')?.value,
        "AllocBedTypID": this.patientAdmissionForm.get('AllocBedTypID')?.value,
        "EligibleBedType": this.patientAdmissionForm.get('EligibleBedType')?.value,
        "CODE": patRegDetails?.Code,
        "NationalityID": patRegDetails?.NationalityID,
        "AdmTypeID": this.patientAdmissionForm.get('AdmTypeID')?.value,
        "AdmSourceID": this.patientAdmissionForm.get('AdmSourceID')?.value,
        "BloodGroupID": patRegDetails?.BloodGroupID == "" ? "0" : patRegDetails?.BloodGroupID,
        "HospitalID": this.hospitalID,
        "MLCTypeID": patRegDetails?.MLCTypeID == "" ? "0" : patRegDetails?.MLCTypeID,
        "MLCTransportID": patRegDetails?.MLCTransportID == "" ? "0" : patRegDetails?.MLCTransportID,
        "BroughtBy": patRegDetails?.BroughtBy,
        "IncidentSite": patRegDetails?.IncidentSite,
        "PoliceStation": patRegDetails?.PoliceStation,
        "ConstableName": patRegDetails?.ConstableName,
        "ARCopy": patRegDetails?.ARCopy,
        "BillType": this.billType,
        "BillNo": patRegDetails?.BillNo,
        "AccReportNo": patRegDetails?.AccReportNo,
        "ReqBedTypID": this.patientAdmissionForm.get('ReqBedTypID')?.value,
        "FoodAllergies": null,
        "OtherAllergies": null,
        "DrugAllergies": null,
        "workPermitID": null,
        "WPIssuedDate": "0",
        "WPExpiryDate": "0",
        "WPIssuedAT": patRegDetails?.WPIssuedAT,
        //"WPIssuedBy": null,
        "ReferalBasisNo": patRegDetails?.ReferalBasisNo,
        "EscortRelationID": patRegDetails?.EscortRelationID == "" ? "0" : patRegDetails?.EscortRelationID,
        "VisaIssueDate": patRegDetails?.VisaIssueDate,
        "VisaExpiryDate": patRegDetails?.VisaExpiryDate,
        "VisaIssuedAt": patRegDetails?.VisaIssuedAt,
        "VisaIssuedBy": patRegDetails?.VisaIssuedBy,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.facilitySessionId,//Object.keys(this.facilitySessionId).length ?? this.service.param.WorkStationID,
        "Error": 0,
        "SpecialiseID": this.patientAdmissionForm.get('SpecialiseID')?.value,
        "Remarks": this.patientAdmissionForm.get('Remarks')?.value,
        "FeatureId": 0,
        "FunctionId": 0,
        "CallContext": "save patient admission",
        "PatientEmpId": patRegDetails?.PatientEmpID,
        "Mrno": patRegDetails?.MRNo,
        "RelationCode": patRegDetails?.RelationCode,
        "LetterIDs": null,
        "FirstName2L": patRegDetails?.FirstName2l,
        "MiddleName2L": patRegDetails?.MiddleName2l,
        "LastName2L": patRegDetails?.LastName2l,
        "MaidenName2L": patRegDetails?.MaidenName2l,
        "GaurdianName2L": patRegDetails?.GuardianName2l,
        "Address012L": patRegDetails?.Address012l,
        "Address022L": patRegDetails?.Address022l,
        "Address032L": patRegDetails?.Address032l,
        "ContactName2L": patRegDetails?.ContactName2l,
        "ContAddress2L": patRegDetails?.ContAddress2l,
        "BroughtBy2l": null,
        "IncidentSite2l": null,
        "PoliceStation2l": null,
        "ConstableName2l": null,
        "ARCopy2L": null,
        "GradeID": this.selectedPatientForAdmission.GradeID == "" ? "0" : gradeid,
        "DepositRequestAmount": null,
        "DepositRemarks": null,
        "PoliceBuckleNo": null,
        "MLCReportDelivery": "",
        "MLCRemarks": null,
        "OnCallDoctor": "0",
        "AdviceMonitorID": "0",
        "ScheduleID": "0",
        //"PreviousBillDate": null,
        "ScanDocumentPath": patRegDetails?.ScanDocumentPath,
        "PatientAttender": null,
        "PatientAttenderPassNo": null,
        "SpecialInstruction": this.patientAdmissionForm.get('SpecialInstruction')?.value,
        "IsServicePatient": null,
        "Resident": "False",
        //"ismlc": null,
        "IdentifyMark01": patRegDetails?.IdentifyMark01,
        "IdentifyMark02": patRegDetails?.IdentifyMark02,
        "FormIssued": "",
        "DiffbedAllocationReasonID": "0",
        "PatientVehicleNo": null,
        "Isorgandonor": null,
        "RecepientIPID": null,
        "IsinformtoPolice": null,
        "EstimationAmount": null,
        "IsFormIssued": null,
        "BroughtByPersonPhoneNo": null,
        "BroughtByPersonAddress": null,
        "NameofCM": null,
        "mechanismofinjuryID": null,
        "Allegedcause": null,
        "DutyConstable": null,
        "DutyConstableNo": null,
        "Familyname": patRegDetails?.Familyname,
        "Diseases": JSON.stringify(diagnosisXml),
        "TriagePriorityId": null,
        "PolicyNo": patRegDetails?.PolicyNo,
        "InsuranceNo": patRegDetails?.InsuranceNo,
        "CardExpiryDate": patRegDetails?.CardExpirydate,
        "FamilyName2l": patRegDetails?.Familyname2l,
        "Hospitalid": this.hospitalID,
        "OPAdmissionID": this.akuWrklstPatient.AdmissionID == "" ? "0" : this.akuWrklstPatient.AdmissionID,
        "TestOrderItemID": this.akuWrklstPatient.TestOrderItemID == "" ? "0" : this.akuWrklstPatient.TestOrderItemID,
      }
      this.us.post(patientadmission.SavePatientAdmission, payload).subscribe((response) => {
        if (response.Code == 200) {
          this.saveMsg = "Patient Admitted Successfully. Admission No : " + response.AdmissionNumber;
          $("#patientAdmissionSaveMsg").modal('show');
          if (this.selectedPatientForAdmission.length != undefined || this.selectedPatientForAdmission.PatientID != undefined) {
            if (this.selectedPatientForAdmission.SurgeryRequestID != "" && this.selectedPatientForAdmission.SurgeryRequestID != undefined && response.AdmissionID != "") {
              this.mergeOpToIP(this.selectedPatientForAdmission.SurgeryRequestID, response.AdmissionID);
            }
          }
          this.fetchPatientDetails(payload.SSN, "0", "0")
        }
        else {
          if (response.Status == 'Fail') {

          }
        }
      },
        (err) => {

        })
    }
  }

  mergeOpToIP(surReqId: any, admissionId: any) {
    var payload = {
      "SurgeryRequestID": Number(surReqId),
      "AdmissionID": Number(admissionId),
      "UserID": Number(this.doctorDetails[0].UserId),
      "WorkStationID": Number(this.facilitySessionId) ?? Number(this.service.param.WorkStationID),
      "HospitalID": Number(this.hospitalID)
    }
    this.us.post(patientadmission.ConversionOPtoIPforsurgeryRecord, payload)
      .subscribe((response: any) => {
        if (response.Status === "Success") {

        }
      },
        (err) => {

        })
  }

  clearPatientAdmission() {
    if (this.navigatedFromAdmReq) {
      this.fetchAdmissionInPatient();
    }
    else {
      window.location.reload();
    }
  }

  navigateBackToAdmissionRequests() {
    if (this.fromAkuWorklist === 'true') {
      sessionStorage.removeItem("otpatient");
      this.router.navigate(['/dialysis/aku-worklist']);
    }
    else if (this.fromBedsBoard) {
      this.router.navigate(['/ward']);
    }
    else {
      this.navigatedFromAdmReq = false;
      sessionStorage.removeItem("selectedPatientForAdmission");
      this.router.navigate(['/admission/admissionrequests']);
    }
  }

  onMotherSssnEnter(event: any) {
    const currentDateTime = new Date();
    const currentTime = currentDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    var ssn = event.target.value;
    this.url = this.service.getData(patientadmission.fetchInPatientInfo, {
      filter: ssn,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatientInfoDataList.length > 0) {
            this.selectedMotherDetails = response.FetchPatientInfoDataList[0];
            this.motherSelectionForm.patchValue({
              MotherSSN: response.FetchPatientInfoDataList[0].SSN,
              MotherName: response.FetchPatientInfoDataList[0].PatientName,
              MotherIPID: response.FetchPatientInfoDataList[0].IPID,
              Dateofbirth: new Date(),
              Timeofbirth: currentTime
            })
            this.selectedPatientPatientID = response.FetchPatientInfoDataList[0].PatientID;
            this.selectedPatientIPID = response.FetchPatientInfoDataList[0].IPID;
            this.FetchBabyAdmissionDetails(this.selectedPatientIPID, response.FetchPatientInfoDataList[0].SSN);
          }
        }
      },
        (err) => {
        })
  }

  selectMotherDetails() {
    $("#motherDetails").modal('hide');
    this.url = this.service.getData(patientadmission.FetchAdmissionInPatient, {
      PatientID: this.selectedPatientPatientID,
      IPID: this.selectedPatientIPID,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId,
      Hospitalid: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientAdmissionDetails = response.FetchAdmissionInPatientDataList[0];
          this.billType = this.patientAdmissionDetails.BillType;
          if (this.selectedPatientIPID != '') {
            this.selectedPatientForAdmission = response.FetchAdmissionInPatientDataList[0];
            this.selectedPatientForAdmission.PatientName =
              response.FetchAdmissionInPatientDataList[0].Title + " " + response.FetchAdmissionInPatientDataList[0].FirstName + " " +
              response.FetchAdmissionInPatientDataList[0].MiddleName;
            this.selectedPatientForAdmission.insuranceCompanyName = response.FetchAdmissionInPatientDataList[0].InsuranceCompany;
            this.selectedPatientForAdmission.VisitID = response.FetchAdmissionInPatientDataList[0].VisitID;
            this.selectedPatientForAdmission.GenderID = response.FetchAdmissionInPatientDataList[0].GenderID;
            this.selectedPatientForAdmission.SSN = response.FetchAdmissionInPatientDataList[0].SSN;
            this.selectedPatientForAdmission.DoctorID = response.FetchAdmissionInPatientDataList[0].ConsultantID;
            this.selectedPatientForAdmission.CompanyID = response.FetchAdmissionInPatientDataList[0].CompanyId;
            this.selectedPatientForAdmission.SpecialiseID = response.FetchAdmissionInPatientDataList[0].SpecialiseID;
            this.selectedPatientForAdmission.GradeID = response.FetchAdmissionInPatientDataList[0].GradeID;

          }
          //this.fetchHospitalPrimaryEmployees(this.hospitalID, 0);
          this.patientDiagnosisList = response.FetchAdmissionDiagnosisList;
          this.diagStr = this.patientDiagnosisList?.map((item: any) => item.Code + "-" + item.DiseaseName).join(', ');
          this.fetchPatientFromReg();
          setTimeout(() => {
            if (response.FetchAdmissionWardNBedsList.length > 0) {
              this.patientAdmissionForm.patchValue({
                Firstname: "Baby of " + response.FetchAdmissionInPatientDataList[0].FirstName,
                MiddleName: response.FetchAdmissionInPatientDataList[0].MiddleName,
                Familyname: response.FetchAdmissionInPatientDataList[0].FamilyName,
                //ExptDisChargeDate: new Date(response.FetchAdmissionInPatientDataList[0].ExptDisChargeDate),
                Remarks: response.FetchAdmissionInPatientDataList[0].Remarks
              })
              //if (this.hospitalEmployees.find((x: any) => x.empid == response.FetchAdmissionInPatientDataList[0].ConsultantID).length > 0)
              //this.getSelectedDoctorSpecialisations(response.FetchAdmissionInPatientDataList[0].ConsultantID, response.FetchAdmissionInPatientDataList[0].SpecialiseID);

              this.loadWardsForSelectedBedType(response.FetchAdmissionWardNBedsList[0].AllocBedTypID, "0", "0");
            }
            else {
              //if (this.hospitalEmployees.find((x: any) => x.empid == response.FetchAdmissionInPatientDataList[0].ConsultantID).length > 0)
              //this.getSelectedDoctorSpecialisations(this.selectedPatientForAdmission.DoctorID, "0");
            }
            this.patientAdmissionForm.patchValue({
              ConsultantID: response.FetchAdmissionInPatientDataList[0].ConsultantID,
              ConsultantName: response.FetchAdmissionInPatientDataList[0].Consultant,
              SpecialiseID: response.FetchAdmissionInPatientDataList[0].SpecialiseID,
              SpecialisationName: response.FetchAdmissionInPatientDataList[0].Specialisation
            });
          }, 2000);
        }
      },
        (err) => {
        })
  }

  FetchPatientAdultBandPrint() {
    this.isAdultPrint = true;
    var adultbppayload = {
      "PatientID": this.selectedPatientPatientID,
      "IPID": this.selectedPatientIPID,
      "UserName": this.doctorDetails[0]?.UserName,
      "UserID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      "WorkStationID": this.facilitySessionId,
      "Hospitalid": this.hospitalID,
      "JustificationID": 0,
      "PatientName": this.selectedPatientForAdmission.PatientName,
      "Gender": this.selectedPatientForAdmission.Gender,
      "DOB": this.selectedPatientForAdmission.DOB == undefined ? this.patientAdmissionDetails.DOB : this.selectedPatientForAdmission.DOB,
      "Nationality": this.selectedPatientForAdmission.Nationality,
      "SSN": this.selectedPatientForAdmission.SSN,
      "ConsultantName": this.selectedPatientForAdmission.Consultant != undefined ? this.selectedPatientForAdmission.Consultant : this.selectedPatientForAdmission.DoctorName,
      "BandPrintSuperVisior": 1
    }
    this.us.post(patientadmission.FetchPatientAdultBandPrint, adultbppayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModal();
        }
        else {
          if (response.objLabReportNList.length > 0) {
            this.reprintReasons = response.objLabReportNList;
            $("#cancelReasons").modal('show');
          }
          else {
            this.errorMessages = [];
            this.errorMessages.push(response.Message);
            $("#patientAdmissionValidationMsgs").modal('show');
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  FetchPatientInfantBandPrint() {
    this.isAdultPrint = false;
    var adultbppayload = {
      "PatientID": this.selectedPatientPatientID,
      "IPID": this.selectedPatientIPID,
      "UserName": this.doctorDetails[0]?.UserName,
      "UserID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      "WorkStationID": this.facilitySessionId,
      "Hospitalid": this.hospitalID,
      "JustificationID": 0,
      "PatientName": this.selectedPatientForAdmission.PatientName,
      "Gender": this.selectedPatientForAdmission.Gender,
      "DOB": this.selectedPatientForAdmission.DOB == undefined ? this.patientAdmissionDetails.DOB : this.selectedPatientForAdmission.DOB,
      "Nationality": this.selectedPatientForAdmission.Nationality,
      "SSN": this.selectedPatientForAdmission.SSN,
      "ConsultantName": this.selectedPatientForAdmission.Consultant != undefined ? this.selectedPatientForAdmission.Consultant : this.selectedPatientForAdmission.DoctorName,
      "BandPrintSuperVisior": 1
    }
    // this.us.get(this.url)
    //   .subscribe((response: any) => {
    //     if (response.Code == 200) {

    //     }
    //   },
    //     (err) => {
    //     })

    this.us.post(patientadmission.FetchPatientInfantBandPrint, adultbppayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModal();
        }
        else {
          if (response.objLabReportNList.length > 0) {
            this.reprintReasons = response.objLabReportNList;
            $("#cancelReasons").modal('show');
          }
          else {
            this.errorMessages = [];
            this.errorMessages.push(response.Message);
            $("#patientAdmissionValidationMsgs").modal('show');
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  saveRePrintReason() {
    if (this.reprintReason == '5' && $("#reprintRemarks").val() == '') {
      this.showRemarksMandatoryMsg = true;
      return;
    }
    var payld = {
      "PatientID": this.selectedPatientPatientID,
      "IPID": this.selectedPatientIPID,
      "UserName": this.doctorDetails[0]?.UserName,
      "UserID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      "WorkStationID": this.facilitySessionId,
      "Hospitalid": this.hospitalID,
      "JustificationID": this.reprintReason,
      "Justification": $("#reprintRemarks").val(),
      "PatientName": this.selectedPatientForAdmission.PatientName,
      "Gender": this.selectedPatientForAdmission.Gender,
      "DOB": this.selectedPatientForAdmission.DOB == undefined ? this.patientAdmissionDetails.DOB : this.selectedPatientForAdmission.DOB,
      "Nationality": this.selectedPatientForAdmission.Nationality,
      "PrintType": this.isAdultPrint ? "Adult" : "Infant",
      "SSN": this.selectedPatientForAdmission.SSN,
      "ConsultantName": this.selectedPatientForAdmission.Consultant != undefined ? this.selectedPatientForAdmission.Consultant : this.selectedPatientForAdmission.DoctorName,
      "BandPrintSuperVisior": 1
    }

    this.us.post(patientadmission.SavePatientBandPrintingHistory, payld).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH;
          $("#cancelReasons").modal('hide');
          $("#reprintSavedMsg").modal('show');
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  showModal(): void {
    $("#reviewAndPayment").modal('show');
  }

  clearReprintReasons() {
    $("#CancelReasonID").val('0');
    $("#reprintRemarks").val('');
  }

  setPregnancyContent(trimester: string) {
    if (trimester === '1') {
      this.pregnancyContent = "1st Tr";
    }
    else if (trimester === '2') {
      this.pregnancyContent = "2nd Tr";
    }
    else if (trimester === '3') {
      this.pregnancyContent = "3rd Tr";
    }
  }

  onDocIntExtClick(type: string) {
    if (type == 'internal') {
      this.docIntOrExt = true;
    }
    else {
      this.docIntOrExt = false;
    }
  }
  clearMotherDetails() {
    this.selectedMotherDetails = [];
    this.motherSelectionForm = this.formBuilder.group({
      MotherSSN: '',
      MotherName: '',
      MotherIPID: '',
      Dateofbirth: '',
      Timeofbirth: ''
    });
  }

  onReprintReasonChange(event: any) {
    this.reprintReason = event.target.value;
    if (this.reprintReason == "5")
      this.showRemarksForOther = true;
    else
      this.showRemarksForOther = false;
  }
  onRemarksChange() {
    this.showRemarksMandatoryMsg = false;
  }
  validations() {
    this.errorMessages = [];
    // Insurance card expiry
    if (this.patientRegCompanyDetails != undefined) {
      const compExpirydate = this.patientRegCompanyDetails[0]?.ValidTo;
      if (new Date(compExpirydate) < new Date()) {
        this.errorMessages.push("Insurance Card Expired.");
      }

      //Insurance card going to expire in less than 30 days
      const startDate = new Date(compExpirydate);
      const now = new Date();
      const differenceMs: number = startDate.getTime() - now.getTime();
      const seconds: number = Math.floor((differenceMs / 1000) % 60);
      const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
      const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
      const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));

      if (days < 30) {
        this.errorMessages.push("Insurance card is going to Expire in " + days + "day(s).");
      }
    }
    //Company Blocked
    if (this.patientRegCompanyDetails !== undefined && this.patientRegCompanyDetails.length > 0) {
      if (this.patientRegCompanyDetails[0].Blocked === '1') {
        this.errorMessages.push("Company has been Blocked");
      }
    }
    //
    if (this.patientRegCompanyDetails !== undefined && this.patientRegCompanyDetails.length > 0 && this.patientRegCompanyDetails[0].ContractValidTo != "") {
      if (new Date(this.patientRegCompanyDetails[0].ContractValidTo) < new Date()) {
        this.errorMessages.push("Company Contract Date has been Expired");
      }
    }

    if (this.errorMessages.length > 0) {
      $("#patientAdmissionValidationMsgs").modal('show');
    }
  }
  changeBillType(type: string) {
    this.billType = type;
    this.fetchPatientFromReg();
  }

  fetchReferalAdminMasters1() {
    $("#code").val('');
    $("#procedure").val('0')
    $("#specialization").val('0');
    this.url = this.service.getData(patientadmission.FetchAdminMasters, {
      Type: '11',
      Filter: 'blocked=0'
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.SpecializationList = response.SmartDataList;
        }
      },
        (err) => {
        })
  }

  fetchRoomInfo() {
    this.fetchEligibleBedTypes("0", "0");
  }

  specializationChange(data: any) {

    const specdata = this.SpecializationList.find((value: any) => value.id === data.target.value);
    this.url = this.service.getData(patientadmission.FetchSpecialisationWiseProcedure, {
      SpecialiseID: specdata.id,
      Name: '0',
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedSpecialisationData = this.selectedSpecialisationDataFiltered = response.FetchSpecialisationWiseProcedureDataList;
        }
      },
        (err) => {
        })

  }
  procedureChange(event: any) {
    $("#code").val('');
    this.selectedProcData = this.selectedSpecialisationData.find((x: any) => x.ProcedureID === event.target.value);
    if (this.selectedProcData === undefined)
      this.showNoRecFound = true;
    else
      this.showNoRecFound = false;
  }

  onCodeEnter(event: any) {
    $("#procedure").val('0');
    this.selectedProcData = this.selectedSpecialisationData.find((x: any) => x.Code === event.target.value);
    if (this.selectedProcData === undefined)
      this.showNoRecFound = true;
    else
      this.showNoRecFound = false;
  }
  ClearPrescriptionItems() {
    this.selectedSpecialisationData = [];
    this.patientVisits = [];
    $("#specialization").val('0');
    $("#procedure").val('0');
    $("#code").val('');
    $("#VisitID").val('0');
    $("#txtPrSsn").val('');
    $("#Procedure").val('');

    this.showNoRecFound = true;

  }
  fetchRoomInfoSpecialisation() {
    $("#code").val('');
    $("#procedure").val('0')
    $("#specialization").val('0');
    this.url = this.service.getData(patientadmission.FetchSpecialisationForProcedure, {
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.SpecializationList = response.FetchSpecialisationForProcedureDataList;
        }
      },
        (err) => {
        })
  }
  onEnterPressPriceInfo(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.fetchPatientDetailsBySsnPriceInfo(event);
    }
  }
  fetchPatientDetailsBySsnPriceInfo(event: any) {
    var inputval = event.target.value;
    var ssn = "0"; var mobileno = "0"; var patientid = "0";
    if (inputval.charAt(0) === "0") {
      ssn = "0";
      mobileno = inputval;
      patientid = "0";
    }
    else {
      ssn = inputval;
      mobileno = "0";
      patientid = "0";
    }

    this.fetchPatientDetailsPriceInfo(ssn, mobileno, patientid)
  }

  fetchPatientDetailsPriceInfo(ssn: string, mobileno: string, patientId: string) {
    this.url = this.service.getData(patientadmission.fetchPatientDataBySsn, {
      SSN: ssn,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.doctorDetails[0]?.FacilityId,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (ssn === '0') {
            this.PatientID = response.FetchPatientDependCLists[0].PatientID;
            this.selectedView = response.FetchPatientDependCLists[0];
          }
          else if (mobileno === '0') {
            this.PatientID = response.FetchPatientDataCCList[0].PatientID;
            this.selectedView = response.FetchPatientDataCCList[0];
          }

          this.noPatientSelected = true;
          this.fetchPatientVisits();
        }
      },
        (err) => {

        })
  }

  fetchPatientVisits() {
    this.url = this.service.getData(patientadmission.FetchPatientVisits, { Patientid: this.PatientID, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientVisits = response.PatientVisitsDataList;
          var admid = response.PatientVisitsDataList[0].AdmissionID;
          // setTimeout(() => {
          //   this.visitChange(admid);
          // }, 1000);
        }
      },
        (err) => {
        })
  }

  searchConsultantItem(event: any) {
    const item = event.target.value;
    this.hospitalEmployeesFiltered = this.hospitalEmployees;
    let arr = this.hospitalEmployees.filter((proc: any) => proc.FullName.toLowerCase().indexOf(item.toLowerCase()) === 0);
    if (arr.length === 0) {
      arr = this.hospitalEmployees.filter((proc: any) => proc.Name.toLowerCase().indexOf(item.toLowerCase()) === 0);
    }
    this.hospitalEmployeesFiltered = arr.length ? arr : [{ name: 'No Item found' }];
  }

  onConsultantItemSelected(emp: any) {
    this.patientAdmissionForm.patchValue({
      "ConsultantID": emp.Empid,
      "ConsultantName": emp.EmpNo + '-' + emp.Fullname
    });
    this.getSelectedDoctorSpecialisations(emp.empid, "0");
  }

  searchItem(event: any) {
    const item = event.target.value;
    this.selectedSpecialisationData = this.selectedSpecialisationDataFiltered;
    let arr = this.selectedSpecialisationData.filter((proc: any) => proc.ProcedureName.toLowerCase().indexOf(item.toLowerCase()) === 0);
    if (arr.length === 0) {
      arr = this.selectedSpecialisationData.filter((proc: any) => proc.Code.toLowerCase().indexOf(item.toLowerCase()) === 0);
    }
    this.selectedSpecialisationData = arr.length ? arr : [{ name: 'No Item found' }];

  }

  onItemSelected(item: any) {
    $("#code").val('');
    $("#Procedure").val(item.ProcedureName);
    this.selectedProcData = this.selectedSpecialisationData.find((x: any) => x.ProcedureID === item.ProcedureID);
    if (this.selectedProcData === undefined)
      this.showNoRecFound = true;
    else
      this.showNoRecFound = false;
  }

  fetchSpecialisations() {
    this.url = this.service.getData(patientadmission.FetchConsulSpecialisationNew, {
      Type: 'distinct SpecialiseID id,Specialisation name,Specialisation2l name2L,SpecializationCode code,blocked,Blocked BitBlocked,HospitalID HospitalID,IsPediatric',
      Filter: 'IsAdminpri=1 and IsMedical=1 and MedicalType=1 and Blocked=0 and HospitalID=3',
      WorkstationID: 0,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.SpecializationList = this.SpecializationList1 = response.FetchConsulSpecialisationDataList;
        }
      },
        (err) => {
        })
  }

  searchSpecItem(event: any) {
    const item = event.target.value;
    this.SpecializationList = this.SpecializationList1;
    let arr = this.SpecializationList1.filter((spec: any) => spec.name.toLowerCase().indexOf(item.toLowerCase()) === 0);
    this.SpecializationList = arr.length ? arr : [{ name: 'No Item found' }];
  }

  onSpecItemSelected(event: any) {
    const item = this.SpecializationList.find((data: any) => data.name === event.option.value);
    var IsAdult = Number(this.age) >= 14 ? true : false;
    if (IsAdult && item.IsPediatric === '1') {
      this.listOfSpecItems = [];
      this.errorMessages = [];
      this.errorMessages.push("Cannot select Pediatric specialisations for adults.");
      $("#patientIPAdmissionValidationMsgs").modal('show');
      return;
    }
    else {
      this.errorMessages = [];
      $("#patientIPAdmissionValidationMsgs").modal('hide');
    }
    this.patientAdmissionForm.patchValue({
      SpecialiseID: item.id,
      SpecialisationName: item.name
    });
    this.fetchSpecializationDoctorSearch();
  }

  searchDocItem(event: any) {
    const item = event.target.value;
    this.listOfSpecItems = this.listOfSpecItems1;
    let arr = this.listOfSpecItems1.filter((doc: any) => doc.Fullname.toLowerCase().indexOf(item.toLowerCase()) === 0);
    if (arr.length === 0) {
      arr = this.listOfSpecItems1.filter((proc: any) => proc.EmpNo.toLowerCase().indexOf(item.toLowerCase()) === 0);
    }
    this.listOfSpecItems = arr.length ? arr : [{ name: 'No Item found' }];
  }
  fetchSpecializationDoctorSearch() {
    this.url = this.service.getData(patientadmission.FetchSpecialisationDoctors, { Filter: '%%%', SpecialisationID: this.patientAdmissionForm.get("SpecialiseID")?.value, DoctorID: this.doctorDetails[0].EmpId, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfSpecItems = this.listOfSpecItems1 = response.FetchDoctorDataList;
        }
      },
        (err) => {
        })
  }

  FetchBabyAdmissionDetails(motherAdmissionId: any, ssn: any) {
    this.url = this.service.getData(patientadmission.FetchBabyAdmissionDetails, { AdmissionID: motherAdmissionId, WorkStationID: 0, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchBabyAdmissionDetailsDataList.length > 0) {
            if (response.FetchBabyAdmissionDetailsDataList.length === 1) {
              this.babySSN = 'BB' + ssn;
            }
            else if (response.FetchBabyAdmissionDetailsDataList.length === 2) {
              this.babySSN = 'BBB' + ssn;
            }
            else if (response.FetchBabyAdmissionDetailsDataList.length === 3) {
              this.babySSN = 'BBBB' + ssn;
            }
          }
          else {
            this.babySSN = 'B' + ssn;
          }
        }
      },
        (err) => {
        })
  }
  enbaleRequestedBedType() {
    this.requestedBedTypeEnable = !this.requestedBedTypeEnable;
    this.requestedbedsList = this.bedsList;
    this.patientAdmissionForm.patchValue({
      RequestedBedID: 0
    })
  }
  loadRequestedBedTypeBeds(event: any) {
    const bedtype = event.target.value;
    this.url = this.service.getData(patientadmission.FetchAdmissionWardBeds, {
      BedTypeID: bedtype,
      IPID: this.selectedPatientForAdmission.AdmissionID,
      WardID: this.patientAdmissionForm.get('WardID')?.value,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.requestedbedsList = response.FetchAdmissionWardBedsDataList;
        }
      },
        (err) => {
        })
  }
}

export const patientadmission = {
  getPatientRegMasterData: 'getPatientRegMasterData',
  FetchHospitalSpecialisations: 'FetchHospitalSpecialisations',
  FetchHospitalEmployees: 'FetchHospitalEmployees?HospitalID=${HospitalID}',
  FetchEmployeeSpecializations: 'FetchEmployeeSpecializationsForPA?Type=${Type}&Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchEligibleBedTypes: 'FetchEligibleBedTypes?CompanyID=${CompanyID}&GradeID=${GradeID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchSelectionEligibleBedTypes: 'FetchSelectionEligibleBedTypes?BedTypeID=${BedTypeID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdmissionWards: 'FetchAdmissionWards?BedTypeID=${BedTypeID}&GenderID=${GenderID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdmissionWardBeds: 'FetchAdmissionWardBeds?BedTypeID=${BedTypeID}&IPID=${IPID}&WardID=${WardID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SavePatientAdmission: 'SavePatientAdmission',
  FetchPatientFromReg: 'FetchPatientFromReg?PatientID=${PatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&Hospitalid=${Hospitalid}',
  FetchAdmissionInPatient: 'FetchAdmissionInPatient?PatientID=${PatientID}&IPID=${IPID}&UserID=${UserID}&WorkStationID=${WorkStationID}&Hospitalid=${Hospitalid}',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchInPatientInfo: 'FetchInPatientInfo?filter=${filter}&HospitalID=${HospitalID}',
  FetchPatientAdultBandPrint: 'FetchPatientAdultBandPrint',
  FetchPatientAdultBandPrintEMR: 'FetchPatientAdultBandPrintEMR',
  FetchPatientInfantBandPrint: 'FetchPatientInfantBandPrint',
  SavePatientBandPrintingHistory: 'SavePatientBandPrintingHistory',
  FetchPatientEMRIP: 'FetchPatientEMRIP?RegCode=${RegCode}&&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdmitingPrimaryDoctors: 'FetchAdmitingPrimaryDoctors?HospitalID=${HospitalID}&SpecialisationID=${SpecialisationID}&Age=${Age}',
  FetchEmployeePrimarySpecializations: 'FetchEmployeePrimarySpecializations?Type=${Type}&Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchSpecialisationWiseProcedure: 'FetchSpecialisationWiseProcedure?SpecialiseID=${SpecialiseID}&Name=${Name}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdminMasters: 'FetchAdminMasters?Type=${Type}&Filter=${Filter}',
  FetchSpecialisationForProcedure: 'FetchSpecialisationForProcedure?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientVisits: 'FetchPatientVisits?Patientid=${Patientid}&HospitalID=${HospitalID}',
  FetchConsulSpecialisation: 'FetchConsulSpecialisation?HospitalID=${HospitalID}',
  FetchConsulSpecialisationNew: 'FetchConsulSpecialisationNew?Type=${Type}&Filter=${Filter}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
  FetchSpecialisationDoctors: 'FetchSpecialisationDoctors?Filter=${Filter}&SpecialisationID=${SpecialisationID}&DoctorID=${DoctorID}&HospitalID=${HospitalID}',
  ConversionOPtoIPforsurgeryRecord: 'ConversionOPtoIPforsurgeryRecord?SurgeryRequestID=${SurgeryRequestID}&AdmissionID=${AdmissionID}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
  FetchBabyAdmissionDetails: 'FetchBabyAdmissionDetails?AdmissionID=${AdmissionID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
};
