import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { Router } from '@angular/router';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EmergencyConfigService as EmergencyConfig } from '../services/config.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { InstructionsToNurseComponent } from 'src/app/portal/instructions-to-nurse/instructions-to-nurse.component';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';

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
  selector: 'app-emr-beds',
  templateUrl: './emr-beds.component.html',
  styleUrls: ['./emr-beds.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe,
  ],
})
export class EmrBedsComponent implements OnInit {
  doctorDetails: any;
  hospitalId: any;
  location: any;
  currentdate: any;
  langData: any;
  ward: any;
  FetchBedsFromWardDataList: any;
  selectedOption: string = 'Bed';
  selectedBedOption: string = 'Occupied';
  FetchUserFacilityDataList: any;
  FetchBedStatusList: any;
  wardID: any;
  Status: any;
  //selectedWard: any;
  isFilter: boolean = false;
  PatientsListToFilter: any;

  selectedPatientSSN: any;
  selectedPatientName: any;
  selectedPatientGender: any;
  selectedPatientAge: any;
  selectedPatientMobile: any;
  selectedPatientVTScore: any;
  selectedPatientHeight: any;
  selectedPatientWeight: any;
  selectedPatientBloodGrp: any;
  selectedPatientVitalsDate: any;
  selectedPatientBPSystolic: any;
  selectedPatientBPDiastolic: any;
  selectedPatientTemperature: any;
  selectedPatientPulse: any;
  selectedPatientSPO2: any;
  selectedPatientRespiration: any;
  selectedPatientConsciousness: any;
  selectedPatientO2FlowRate: any;
  selectedPatientAllergies: any;
  selectedPatientMedications: any = [];
  selectedPatientIsVip: boolean = false;
  selectedPatientClinicalInfo: any;
  selectedPatientIsPregnancy: boolean = false;
  selectedPatientPregnancyTrisemister: any;
  selectall = false;
  datesForm!: FormGroup;
  toDate = new FormControl(new Date());
  IsApproval = false;


  WardDoctorID: any;
  IsDoctor: any;
  filteredemrBedsDataList: any = [];
  emrBedsDataList: any;
  showBedValidation: boolean = false;
  SelectedBedInfo: any = [];
  bedNo: string = "";
  emrPatientDetails: any;
  FetchHospitalNurseDataaList: any;
  userForm: any;
  NurseBedCount: string = "";
  NurseBedDetails: string = "";
  NurseID: any;
  selectedPatient: any;
  showNurseInst = false;
  selectedInstructionsList: any = [];
  selectBedOption(option: string) {
    this.selectedBedOption = option;
  }

  selectOption(option: string) {
    this.selectedOption = option;

    if (option === "Bed") {
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => a.Bed.localeCompare(b.Bed));
    }
    else if (option === "Doctor") {
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => a.DoctorName.localeCompare(b.DoctorName));
    }
    else {
      this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => new Date(b.AdmitDate).getTime() - new Date(a.AdmitDate).getTime());
    }
  }

  constructor(private fb: FormBuilder, private portalConfig: ConfigService, private config: BedConfig, private op_config: ConfigService, private router: Router, public datepipe: DatePipe,
    private emrconfig: EmergencyConfig,private modalSvc: NgbModal,private modalService: GenericModalBuilder) {
    this.langData = this.portalConfig.getLangData();
    this.datesForm = this.fb.group({
      fromdate: [''],
      todate: ['']
    });

    this.userForm = this.fb.group({
      EmpNo: ['', Validators.required],
      EmpName: ['', Validators.required],
      EmpID: ['', Validators.required],
      Department: ['', Validators.required],
      NurseID: ['', Validators.required],
      NurseBedCount: ['', Validators.required],
      NurseBedDetails: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.location = sessionStorage.getItem("locationName");
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY, H:mm');
    //this.wardID = this.doctorDetails[0].FacilityId;//3403;//this.ward.FacilityID

    this.wardID = this.ward.FacilityID;
      if(this.wardID === undefined) {
        this.wardID = this.ward;
      }
    
    
    this.Status = 3;
    this.WardDoctorID = this.doctorDetails[0].EmpId;
    this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
    this.fetchBedStatus();
    //this.fetchBedsFromWard();
    this.selectall = !this.selectall;
    var status = this.selectall == false ? 1 : 2;
    this.FetchEMRBeds(status);
    this.fetchUserFacility();
    sessionStorage.setItem("FromBedBoard", "false");

    this.datesForm.patchValue({
      fromdate: this.toDate.value,
      todate: this.toDate.value
    })
  }


  fetchBedStatus() {
    this.config.fetchBedStatus(this.hospitalId)
      .subscribe((response: any) => {
        this.FetchBedStatusList = response.FetchBedStatusDataList;
      },
        (err) => {
        })
  }
  fetchBedStatusByValue(filteredvalue: any = "") {
    this.config.fetchBedsFromWard(this.wardID, this.WardDoctorID, filteredvalue, this.doctorDetails[0].EmpId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchBedsFromWardDataList = response.FetchBedsFromWardDataList;
        if (this.FetchBedsFromWardDataList) {
          this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => a.Bed.localeCompare(b.Bed));
        }
      },
        (err) => {
        })

  }
  ShowAllBeds(type: any, item: any) {

    if (type === "yes" && this.selectall) {
      sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
      sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
      sessionStorage.setItem("FromEMR", "true");
      this.router.navigate(['/ward/DrugAdministration']);
      return;
    }

    this.selectall = !this.selectall;

    if (this.selectall)
      this.WardDoctorID = 0;
    else {
      this.WardDoctorID = this.doctorDetails[0].EmpId;
    }

    this.config.fetchBedsFromWard(this.wardID, this.WardDoctorID, this.Status, this.doctorDetails[0].EmpId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchBedsFromWardDataList = response.FetchBedsFromWardDataList;
        if (this.FetchBedsFromWardDataList) {
          this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => a.Bed.localeCompare(b.Bed));
        }
        this.PatientsListToFilter = JSON.parse(JSON.stringify(this.FetchBedsFromWardDataList));

        if (type === 'yes') {
          sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
          sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
          sessionStorage.setItem("FromEMR", "true");
          this.router.navigate(['/ward/DrugAdministration']);
        }
      },
        (err) => {
        })
  }

  fetchBedsFromWard() {
    this.config.fetchBedsFromWard(this.wardID, 0, this.Status, this.doctorDetails[0].EmpId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchBedsFromWardDataList = response.FetchBedsFromWardDataList;
        if (this.FetchBedsFromWardDataList) {
          this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => a.Bed.localeCompare(b.Bed));
        }
        this.PatientsListToFilter = JSON.parse(JSON.stringify(this.FetchBedsFromWardDataList));
      },
        (err) => {
        })
  }

  fetchUserFacility() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserWardFacilityDataaList;
      },
        (err) => {
        })

  }
  GoBackToHome() {
    this.router.navigate(['/login/doctor-home'])
  }

  redirecttoVitalScreen(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/ward/ipvitals']);
  }

  redirectToLabTrend(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/ward/labtrend']);
  }
  redirectToDrugAdministration(item: any) {
    this.ShowAllBeds("yes", item);
  }

  redirecttoProgressNotesScreen(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/ward/progress-note']);
  }
  filterChangeData(event: any) {
    this.isFilter = true;
    if (event.length === 0) {
      this.FetchBedsFromWardDataList = this.PatientsListToFilter;
      this.isFilter = false;
    }
    else if (event.length > 2) {
      let filteredresponse = this.PatientsListToFilter.filter((x: any) => (x?.SSN.includes(event) || x?.PatientName.toLowerCase().includes(event.toLowerCase())));
      this.FetchBedsFromWardDataList = filteredresponse;
    }
  }
  onSelectWard() {
    $("#facilityMenu").modal('hide');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
    this.fetchBedsFromWard();
  }
  navigatetoCaseSheet(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedCard", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/home/doctorcasesheet']);
  }

  redirectToEndoScopy(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem("FromRadiology", "false");
    sessionStorage.setItem("FromBedBoard", "true");
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/ward/endoscopy']);
  }
  navigatetoAdmissionReconciliation(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/ward/admissionreconciliation']);
  }
  navigatetoDischargeReconciliation(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/ward/dischargereconciliation']);
  }
  navigatetoPatientSummary(item: any) {
    // sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    // sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    // sessionStorage.setItem("selectedView", JSON.stringify(item));
    // sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    // sessionStorage.setItem("FromEMR", "true");
    // this.router.navigate(['/home/summary']);
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    sessionStorage.setItem("PatientID", item.PatientID);
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/shared/patientfolder']);
  }
  redirectToNursingDashboard(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/ward/nursingdashboard']);
  }
  showPatientInfo(pinfo: any) {
    $("#quick_info").modal('show');
    this.selectedPatientSSN = pinfo.SSN;
    this.selectedPatientName = pinfo.PatientName;
    this.selectedPatientGender = pinfo.Gender;
    this.selectedPatientAge = pinfo.FullAge;
    this.selectedPatientMobile = pinfo.MobileNo;
    this.selectedPatientHeight = pinfo.Height;
    this.selectedPatientWeight = pinfo.Weight;
    this.selectedPatientBloodGrp = pinfo.BloodGroup;
    this.selectedPatientIsVip = pinfo.IsVIP == "Non-VIP" ? false : true;
    if (pinfo.IsPregnancy) {
      this.selectedPatientIsPregnancy = true;
      this.selectedPatientPregnancyTrisemister = pinfo.PregnancyContent;
    }
    else {
      this.selectedPatientIsPregnancy = false;
      this.selectedPatientPregnancyTrisemister = "";
    }
    this.op_config.FetchPatientFileInfo(pinfo.EpisodeID, pinfo.IPID, this.hospitalId, pinfo.PatientID, pinfo.RegCode).subscribe((response: any) => {
      if (response.objPatientMedicationsList.length > 0) {
        this.selectedPatientMedications = response.objPatientMedicationsList;
      }
      else {
        this.selectedPatientMedications = [];
      }
      if (response.objPatientVitalsList.length > 0) {
        this.selectedPatientVitalsDate = response.objPatientVitalsList[0].CreateDate;
        this.selectedPatientBPSystolic = response.objPatientVitalsList[0].Value;
        this.selectedPatientBPDiastolic = response.objPatientVitalsList[1].Value;
        this.selectedPatientTemperature = response.objPatientVitalsList[2].Value;
        this.selectedPatientPulse = response.objPatientVitalsList[3].Value;
        this.selectedPatientSPO2 = response.objPatientVitalsList[4].Value;
        this.selectedPatientRespiration = response.objPatientVitalsList[5].Value;
        if (response.objPatientVitalsList.length > 6 && response.objPatientVitalsList[6].Value != undefined)
          this.selectedPatientConsciousness = response.objPatientVitalsList[6].Value;
        else
          this.selectedPatientConsciousness = "";
        if (response.objPatientVitalsList.length > 7 && response.objPatientVitalsList[7].Value != undefined)
          this.selectedPatientO2FlowRate = response.objPatientVitalsList[7].Value;
        else
          this.selectedPatientO2FlowRate = "";
      }
      else {
        this.selectedPatientVitalsDate = "";
        this.selectedPatientBPSystolic = "";
        this.selectedPatientBPDiastolic = "";
        this.selectedPatientTemperature = "";
        this.selectedPatientPulse = "";
        this.selectedPatientSPO2 = "";
        this.selectedPatientRespiration = "";
      }
      if (response.objPatientAllergyList.length > 0) {
        this.selectedPatientAllergies = response.objPatientAllergyList;
      }
      else {
        this.selectedPatientAllergies = [];
      }
      if (response.objobjPatientClinicalInfoList.length > 0) {
        this.selectedPatientClinicalInfo = response.objobjPatientClinicalInfoList[0].ClinicalCondtion;
        this.selectedPatientVTScore = response.objobjPatientClinicalInfoList[0].VTScore;
      }
      else {
        this.selectedPatientClinicalInfo = ""
        this.selectedPatientVTScore = "";
      }
    })
  }

  redirectToShiftHandover(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/ward/shifthandover']);
  }

  navigatetoResults(item: any) {
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("FromBedBoard", "true");
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/home/otherresults']);
  }

  redirectToSampleCollection(item:any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem("FromBedBoard", "true");
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/ward/samplecollection']);
  }

  redirectToTemplates(item: any) {
    item.HospitalID = this.hospitalId;
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/templates']);
  }

  getViewApproval(item: any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("BedList", JSON.stringify(this.FetchBedsFromWardDataList));
    this.IsApproval = false;
    setTimeout(() => {
      this.IsApproval = true;
    }, 0);
    $("#viewApproval").modal('show');
  }

  FetchEMRBeds(Type: any) {
    this.emrconfig.FetchEMRBeds(this.wardID, '0', this.doctorDetails[0].UserId, '3403', this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.emrBedsDataList = response.FetchEMRBedsDataList;
          if (Type == 1) {
            this.emrBedsDataList = this.emrBedsDataList.filter((x: any) => x.BedStatus == '3')
          }
          this.emrBedsDataList.forEach((element: any, index: any) => {
            if (element.BedStatus == "1")
              element.bedClass = "room_card warning";
            if (element.BedStatus == "3")
              element.bedClass = "room_card primary";
            else if (element.BedStatus == "4"||element.BedStatus == "8"||element.BedStatus == "6")
              element.bedClass = "room_card warning";
          });
          this.emrBedsDataList = this.emrBedsDataList.filter((x:any) => x.NurseID == "");
          const distinctThings = this.emrBedsDataList.filter(
            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.BedID === thing.BedID) === i);
          console.dir(distinctThings);
          this.filteredemrBedsDataList = distinctThings;
          this.FetchBedsFromWardDataList=distinctThings;
          this.clearuser();
        }

      },
        (err) => {
        })
  }
  filterFunction(roomlist: any, roomid: any) {
    return roomlist.filter((buttom: any) => buttom.RoomID == roomid);
  }
  ShowAllEmrBeds(type: any, item: any) {
    this.selectall = !this.selectall;
    var status = this.selectall == false ? 1 : 2;
    this.FetchEMRBeds(status);
  }

  selectemrBed(bed: any, index:any) {
    // if (bed.BedStatus == '3') {
    //   this.SelectedBedInfo = '';
    //   bed.bedClass = "room_card primary";
    // } else 
    if (bed.NurseID == "") {
      if (bed.BedStatus == '4') {
        this.SelectedBedInfo = [];
        bed.bedClass = "room_card warning";
      }
      else {
        //this.SelectedBedInfo=bed;
        this.emrBedsDataList.forEach((element: any, index: any) => {
          if (element.BedID == bed.BedID) {
            if (element.BedStatus == "1") {
              if (element.bedClass == "room_card warning") {
                element.bedClass = "room_card warning active";
                this.SelectedBedInfo.push(bed);
                this.showBedValidation = false;
              }
              else {
                element.bedClass = "room_card warning";
                this.SelectedBedInfo.splice(this.SelectedBedInfo.indexOf(bed), 1);
              }
            }
            else if (element.BedStatus == "3") {
              if (element.bedClass == "room_card primary") {
                element.bedClass = "room_card primary active";
                this.SelectedBedInfo.push(bed);
                this.showBedValidation = false;
              }
              else {
                element.bedClass = "room_card primary";
                this.SelectedBedInfo.splice(this.SelectedBedInfo.indexOf(bed), 1);
              }
            }
            else if (element.BedStatus == "4"||element.BedStatus == "8"||element.BedStatus == "6") {
              if (element.bedClass == "room_card warning") {
                element.bedClass = "room_card warning active";
                this.SelectedBedInfo.push(bed);
                this.showBedValidation = false;
              }
              else {
                element.bedClass = "room_card warning";
                this.SelectedBedInfo.splice(this.SelectedBedInfo.indexOf(bed), 1);
              }
            }
          }
          // else {
          //   if (element.BedStatus == "1")
          //     element.bedClass = "room_card warning";
          //   else if (element.BedStatus == "3")
          //     element.bedClass = "room_card primary";
          //   else if (element.BedStatus == "4")
          //     element.bedClass = "room_card warning";
          // }
        });
      }
    }
  }
  saveBedAssign() {
    if (this.SelectedBedInfo != '' && this.SelectedBedInfo != undefined && this.NurseID != '') {
      var BedDetails: any[]= [];
      this.SelectedBedInfo.forEach((element: any) => {
        BedDetails.push({
          "PID": element.PatientID, 
          "ADMID": element.AdmissionID, 
          "BEDID": element.BedID
        })
      });
      var payload = {
        "NurseID": this.NurseID,   
        "HospitalID": this.hospitalId,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.wardID,
        "BedNurseStatus": BedDetails
      }
      this.emrconfig.SaveNursetoBeds(payload).subscribe(response => {
        if (response.Code == 200) {          
          $("#assignNurseMsg").modal('show');
        }
      })
    }
    else {
      this.showBedValidation = true;
    }
  }
  assignNurse() {
    $("#emergencyward").modal('show');
    this.FetchEMRBeds(1);
  }

  onFetchNurse(event: any) {

    this.config.FetchHospitalNurses(event.target.value.trim(), this.hospitalId)
    .subscribe((response: any) => {
      this.FetchHospitalNurseDataaList = response.FetchHospitalNursesDataaList;
      if (response.FetchHospitalNursesDataaList.length > 0) {
        this.userForm.patchValue({
          EmpNo: this.FetchHospitalNurseDataaList[0].EMPNO,
          EmpName: this.FetchHospitalNurseDataaList[0].EmployeeName,
          NurseID: this.FetchHospitalNurseDataaList[0].EMPID,
          Department: this.FetchHospitalNurseDataaList[0].Department
        });
        if(response.FetchPatientEMRBedsAssignedToNurseDataList.length > 0) {
          var beddetails = "";
          response.FetchPatientEMRBedsAssignedToNurseDataList.forEach((element:any, index:any) => {
            if(beddetails == '')
            beddetails = element.Room + "-" + element.BedName
          else
            beddetails = beddetails + " , " + element.Room + "-" + element.BedName
          });
          this.userForm.patchValue({
            NurseID : response.FetchPatientEMRBedsAssignedToNurseDataList[0].NurseID,
            NurseBedCount : response.FetchPatientEMRBedsAssignedToNurseDataList.length ,
           NurseBedDetails : beddetails
          });
          this.NurseBedCount = response.FetchPatientEMRBedsAssignedToNurseDataList.length;
          this.NurseBedDetails = beddetails;
          this.NurseID=this.FetchHospitalNurseDataaList[0].EMPID;
        }
        // else {
        //   this.clearuser();
        // }
        //this.FetchNurseID(this.FetchHospitalNurseDataaList[0].EMPID);
      }
      else {
        this.clearuser();
      }

      event.target.value = '';
    },
      (err) => {
      })
  }

  FetchNurseID(EmpId:any) {
    this.config.FetchPatientEMRBedsAssignedToNurse(EmpId, this.hospitalId)
    .subscribe((response: any) => {
      if(response.FetchPatientEMRBedsAssignedToNurseDataList.length > 0) {
        var beddetails = "";
        response.FetchPatientEMRBedsAssignedToNurseDataList.forEach((element:any, index:any) => {
          if(beddetails == '')
          beddetails = element.Room + "-" + element.BedName
        else
          beddetails = beddetails + " , " + element.Room + "-" + element.BedName
        });
        this.userForm.patchValue({
          NurseID : response.FetchPatientEMRBedsAssignedToNurseDataList[0].NurseID,
          NurseBedCount : response.FetchPatientEMRBedsAssignedToNurseDataList.length ,
         NurseBedDetails : beddetails
        });
      }
      else {
        this.clearuser();
      }

    },
      (err) => {
      })
  }

  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.onFetchNurse(event);
    }
  }
  clearuser() {
    this.userForm = this.fb.group({
      EmpNo: ['', Validators.required],
      EmpName: ['', Validators.required],
      EmpID: ['', Validators.required],
      Department: ['', Validators.required]
    });
    this.NurseBedCount = "";
    this.NurseBedDetails = "";
    this.NurseID = "";
    this.emrBedsDataList.forEach((element: any, index: any) => {
      if (element.BedStatus == "1")
        element.bedClass = "room_card warning";
      if (element.BedStatus == "3")
        element.bedClass = "room_card primary";
      else if (element.BedStatus == "4"||element.BedStatus == "8"||element.BedStatus == "6")
        element.bedClass = "room_card warning";
    });
  }
  closeAssignBedsPopUp() {
        $("#assignNurseMsg").modal('hide');
        this.assignNurse();
  }
  navigateToUpdateBedStatus() {
    sessionStorage.setItem("FromEMR", "true");
    this.router.navigate(['/suit/UpdateBedStatus']);
  }
  showNursingInstructions(item:any) {
    this.selectedPatient = item;
    this.showNurseInst = true;
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.config.FetchPatientNursingInstructions(item.PatientID, item.AdmissionID, this.doctorDetails[0].UserId, this.wardID, this.hospitalId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.selectedInstructionsList = [];
        var nurInstr = response.FetchPatientNursingInstructionsOutputLists.filter((x:any) => x.AcknowledgeByUser === '');
        nurInstr.forEach((element: any, index: any) => {
          this.selectedInstructionsList.push({
            InstructionId: element.InstructionID,
            InstructiondetailID: element.InstructiondetailID,
            Instruction: element.Instruction,
            StartDate: element.ActualDate,
            StartDateTime: element.ActualTime,
            FrequencyId: element.FrequencyID,
            Frequency: element.Frequency,
            NoofDays: element.Noofdays,
            DoctorName: element.DoctorName,
            PerformedByName: element.PerformedByName,
            AcknowledgeBy: element.AcknowledgeBy,
            AcknowledgeByUser: element.AcknowledgeByUser,
            AcknowledgeDatetime: element.AcknowledgeDatetime,
            ActualDate: element.ActualDate,
            ActualTime: element.ActualTime,
            DoctorId: element.DoctorId,
            InstructionDetailsStatus: element.InstructionDetailsStatus,
            UserEmployeeName: element.UserEmployeeName,
            UserName: element.UserName,
            isNewInstruction: false,
            isAcknowledge : element.AcknowledgeByUser === '' ? false : true
          })
        });
        
        $("#divNursingInstructions").modal('show');
      }
    }, error => {
      console.error('Get Data API error:', error);
    });
  }

  saveAcknowledgeInstruction(index: any, inst: any) {
    var NurseInstDetails: any[] = [];
    NurseInstDetails.push({
      "FQID": inst.FrequencyId,
      "NOD": inst.NoofDays,
      "STDT": inst.StartDate,
      "FRQDT": inst.StartDate + ' ' + (inst.StartDateTime == 24 ? "23:59" : inst.StartDateTime + ":00"),
      "FRQDTT": inst.StartDateTime == 24 ? "23:59" : inst.StartDateTime + ":00",
      "STS": "1",
      "INDID": inst.InstructiondetailID,
      "ACKBY": this.doctorDetails[0].UserId,
      "ACKDT": moment(new Date()).format('DD-MMM-yyyy')

    })
    var ackPayload = {
      "InstructionID": inst.InstructionId,
      // "MonitorID": 0,
      "Instruction": inst.Instruction,
      "Instructiondate": inst.StartDate,
      "DoctorID": inst.DoctorId,
      "AdmissionID": this.selectedPatient.AdmissionID,
      "STATUS": "0",
      "remarks": "",
      "IsFav": false,
      "Orderpackid": "0",
      "Hospitalid": this.hospitalId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID,
      "NurseInstDetails": NurseInstDetails
    }
    this.config.SaveNursingInstructionsAck(ackPayload).subscribe(response => {
      if (response.Code == 200) {
        $("#instructionAckSaveMsg").modal('show');
      }
    })
  }
  showDoctorInstructions(item:any) {
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    const options: NgbModalOptions = {
      size: 'xl'
    };
    const modalRef = this.modalService.openModal(InstructionsToNurseComponent, {
      data: "doctorinstructions",
      readonly: true
    }, options);
  }
  RelaodBedsBoard() {
    sessionStorage.removeItem("InPatientDetails");
    this.showNurseInst = false;
    this.fetchBedsFromWard();
  }
  validateNurseUser(index:any, item:any) {
    $("#divNursingInstructions").modal('hide');
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        $("#divNursingInstructions").modal('show');
       this.saveAcknowledgeInstruction(index, item);
      }
      modalRef.close();
    });
    
  }
}

