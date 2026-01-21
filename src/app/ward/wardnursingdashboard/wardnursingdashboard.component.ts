import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService as BedConfig } from '../services/config.service';
import { DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { BaseComponent } from 'src/app/shared/base.component';
import { ValidationType } from '../nursingdashboard/enum';
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
  selector: 'app-wardnursingdashboard',
  templateUrl: './wardnursingdashboard.component.html',
  styleUrls: ['./wardnursingdashboard.component.scss'],
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
export class WardnursingdashboardComponent extends BaseComponent implements OnInit, AfterViewInit {
  @ViewChild('timeSlotsContainer', { static: true }) timeSlotsContainer!: ElementRef;
  step = 1;
  itemselected: any = [];
  itemselectedName: any = [];
  NursingDashBoard= 'Ward Nursing DashBoard';
  FetchwardtasksPatientDataList: any = [];
  timeSlots: string[] = [];
  FetchTaskServicemapeOutputLists: any[] = [];
  FetchVitalGroupsOutputDataLists: any[] = [];
  SurgeryDemographicsDataaList: any[] = [];
  nursingForm: any;
  WardTaskID = 0;
  FetchNursingDashBoardDisplayDataaList: any[] = [];
  wardTaskEntryServices: any;
  addServiceSubmitted: boolean = false;
  NursingInterventionDetails: any;
  FetchNursingInterventionsDataaList: any;
  nursingTableForm: any;
  isheaderclicked = false;
  prevStatus = '';
  showAllergydiv: boolean = false;
  careMaster: any;
  savedBathCareForm: any;
  bedSideForm: any;
  userForm: any;
  FetchHospitalNurseDataaList: any;
  errorMessage: any;
  type = 0;
  selectedIndex: any;
  errorMessages: any = [];
  bathCareValidation: boolean = false;
  bathDataList: any = [];
  bathDataForm: any;
  IsHeadNurse: any;
  fallRiskFactors: any;
  filteredFallRiskFactors: any;
  fallRiskFactorParameter: any;
  filteredFallRiskFactorParameter: any;
  fallRiskNursingInterventions: any;
  FetchDVTMasterRiskFactor1List: any;
  distinctRiskFactors1: any = [];
  distinctRiskFactors2: any = [];
  distinctRiskFactors3: any = [];
  distinctRiskFactors4: any = [];
  FetchRiskFactors1: any = [];
  FetchRiskFactors2: any = [];
  FetchRiskFactors3: any = [];
  FetchRiskFactors4: any = [];
  FetchActionPlan: any = [];
  FetchDVTRiskLevelDataList: any;
  FetchActionPlanDataList: any;
  results: any;
  totalRiskFactorScore: number = 0;
  totalRiskFactorParameterScore: any;
  additionalScore: any;
  IsHome = true;
  environmentPreventiveActions: any;
  nursingInterventions: any;
  multiDisciplinary: any;
  patientCentered: any;
  scoreBgColor1: string = "White";
  scoreBgColor2: string = "White";
  scoreBgColor3: string = "White";
  OverAllScore: any;
  RiskLevelID: any = '0';
  IsEdit = false;
  convertedData: any = [];
  totalSelectedScore = 0;
  nursingInterventionsAfterSave: any;
  nursingScaleMandatoryList: any = [];
  selectedInstructionsList: any = [];
  constructor(
    private fb: FormBuilder,
    public datepipe: DatePipe,
    private router: Router,
    private config: BedConfig
  ) {
    super();
    this.generateTimeSlots();
    this.type = ValidationType.Nurse;
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.nursingForm = this.fb.group({
      Service: ['', Validators.required],
      Vitals: [''],
      Frequency: ['', Validators.required],
      FromDate: [''],
      ToDate: [''],
      Schedule: ['', Validators.required]
    });

    this.nursingTableForm = this.fb.group({
      TaskITemID: ['', Validators.required],
      TaskItemName: ['', Validators.required],
      WardTaskEntryID: ['', Validators.required],
      NursingInterventionDate: ['', Validators.required],
      NursingInterventionTime: ['', Validators.required],
      FrequencyTime: ['', Validators.required],
      Status: ['0', Validators.required],
      Remarks: ['', Validators.required]
    });

    this.bedSideForm = this.fb.group({
      BedDate: ['', Validators.required],
      BedTime: ['', Validators.required],
      Position: [''],
      Diaper: [''],
      Bedding: [''],
      Remarks: [''],
      LoginUser: [''],
      NurseSignature: [''],
      NurseUserID: [''],
      NurseEmpNo: [''],
      SocialworkerSignature: [''],
      SocialWorkerUserID: [''],
      SocialEmpNo: [''],
      PatientBedSideCareID: ['0']
    });

    this.userForm = this.fb.group({
      EmpNo: ['', Validators.required],
      EmpName: ['', Validators.required],
      EmpID: ['', Validators.required],
      Department: ['', Validators.required],
      UserName: ['', Validators.required],
      Password: ['', Validators.required]
    });


    var d = new Date();
    this.nursingForm.patchValue({
      FromDate: d,
      ToDate: d
    })

    this.bathDataForm = this.fb.group({
      BathDate: ['', Validators.required],
      BathTime: ['', Validators.required],
      PatientRoom: [''],
      PatientRoomID: [''],
      ShowerRoom: [''],
      ShowerRoomID: [''],
      Remarks: [''],
      LoginUser: [''],
      DoctorSignature: [''],
      DoctorUserID: ['', Validators.required],
      DoctorEmpNo: [''],
      NailHairCutting: [''],
      NailHairCutID: [''],
      NurseSignature: [''],
      NurseUserID: ['', Validators.required],
      NurseEmpNo: [''],
      SocialworkerSignature: [''],
      SocialWorkerUserID: [''],
      SocialEmpNo: [''],
      PatientBathingCareID: ['0']
    });

    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
  }






  get items(): FormArray {
    return this.nursingTableForm.get('items') as FormArray;
  }

  get bathDataitems(): FormArray {
    return this.bathDataForm.get('items') as FormArray;
  }

  get bedSideitems(): FormArray {
    return this.bedSideForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    sessionStorage.setItem("fromwardnursingdashboard", "true");
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    if(this.admissionID) {
      this.fetchNursingDashBoardDisplay();
    }
    
    this.fetchTaskServicemap();
    this.FetchVitalGroups();
    this.FetchNursingFrequency();

    this.nursingTableForm = this.fb.group({
      items: this.fb.array([])
    });

    this.FetchCareMaster();
    this.bathDataForm = this.fb.group({
      items: this.fb.array([])
    });

    this.bedSideForm = this.fb.group({
      items: this.fb.array([])
    });

    this.FetchwardtasksCountwithColor();
  }


  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  generateTimeSlots() {
    for (let hour = 0; hour < 24; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      this.timeSlots.push(timeSlot);
    }
  }
  openAllergyPopup() {
    this.showAllergydiv = true;
  }

  ngAfterViewInit() {
    this.scrollToCurrentTime();
  }

  scrollToCurrentTime() {
    const currentTimeElement = this.timeSlotsContainer.nativeElement.querySelector(`[data-time="${this.getCurrentTime()}"]`);

    if (currentTimeElement) {
      currentTimeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    return `${hours}:00`;
  }

  fetchNursingDashBoardDisplay() {
    this.config.FetchNursingDashBoardDisplay(this.wardID, this.datepipe.transform(this.today, "dd-MMM-yyyy")?.toString(), this.admissionID, this.hospitalID)
      .subscribe((response: any) => {
        this.FetchNursingDashBoardDisplayDataaList = response.FetchNursingDashBoardDisplayDataaList;
        var resArr: { Color: any, DisplayName: any, DoneCount: any, EndTime: any, FrequencyTime: any, FrequencyTimeinHHMM: any, FrquencyDate: any, PendingCount: any, SClass: any, Sequence: any, TaskID: any, TaskItemID: any, TaskItemName: any; TaskCount: any }[] = [];
        this.FetchNursingDashBoardDisplayDataaList.forEach((item: any, index: any) => {
          var i = resArr.findIndex(x => x.TaskID == item.TaskID && x.FrequencyTime == item.FrequencyTime);
          var taskCount = this.FetchNursingDashBoardDisplayDataaList.filter((x: any) => x.TaskID == item.TaskID && x.FrequencyTime == item.FrequencyTime).length;
          if (i <= -1) {
            resArr.push({
              Color: item.Color, DisplayName: item.DisplayName, DoneCount: item.DoneCount, EndTime: item.EndTime, FrequencyTime: item.FrequencyTime,
              FrequencyTimeinHHMM: item.FrequencyTimeinHHMM, FrquencyDate: item.FrquencyDate,
              PendingCount: item.PendingCount, SClass: item.SClass, Sequence: item.Sequence, TaskID: item.TaskID, TaskItemID: item.TaskItemID, TaskItemName: item.TaskItemName,
              TaskCount: taskCount
            });
          }
        });
        this.FetchNursingDashBoardDisplayDataaList.forEach(function (item) {

        });
        this.FetchNursingDashBoardDisplayDataaList = resArr;
        this.FetchNursingDashBoardDisplayDataaList.forEach((element: any, index: any) => {
          const [hours, minutes] = element.FrequencyTimeinHHMM.split(':').map(Number);
          const endTimeHours = hours + 1;
          const endTimeHHMM = `${endTimeHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          element.EndTime = endTimeHHMM;
          if (element.Color == "16711680")
            element.SClass = "task_card due p-2";
          else if (element.Color == "45296")
            element.SClass = "task_card due_comp p-2";
          else if (element.Color == "16760832" || element.Color == "45136" || element.DoneCount == "1")
            element.SClass = "task_card task_comp p-2";

        });

      },
        (err) => {
        })
  }

  fetchTaskServicemap() {
    this.config.FetchTaskServicemap(this.doctorDetails[0].UserId, this.wardID, this.hospitalID)
      .subscribe((response: any) => {
        this.FetchTaskServicemapeOutputLists = response.FetchTaskServicemapeOutputLists;
      },
        (err) => {
        })
  }

  FetchVitalGroups() {
    this.config.FetchVitalGroups(this.doctorDetails[0].UserId, this.wardID, this.hospitalID)
      .subscribe((response: any) => {
        this.FetchVitalGroupsOutputDataLists = response.FetchVitalGroupsOutputDataLists;
      },
        (err) => {
        })
  }

  FetchNursingFrequency() {
    this.config.FetchNursingFrequency(this.hospitalID)
      .subscribe((response: any) => {
        this.SurgeryDemographicsDataaList = response.SurgeryDemographicsDataaList;
      },
        (err) => {
        })
  }

  FetchNursingFrequencySelected() {
    this.config.FetchNursingFrequencySelected(this.nursingForm.get('Frequency').value, this.hospitalID)
      .subscribe((response: any) => {
        this.nursingForm.get('Schedule').setValue(response.FetchNursingFrequencySelectedDataaList[0]?.ScheduleTime);
      },
        (err) => {
        })
  }

  saveservice() {
    this.addServiceSubmitted = true;
    if (this.nursingForm.valid) {
      let payload = {
        "WardTaskID": this.WardTaskID,
        "AdmissionID": this.admissionID,
        "HospitalID": this.hospitalID,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.wardID,
        "TItemsDetail": [
          {
            "NTSKID": this.nursingForm.get('Service').value,
            //"TSKIID": this.nursingForm.get('Service').value === "1" ? this.nursingForm.get('Vitals').value : "-1",
            "TSKIID": this.nursingForm.get('Service').value === "1" ? "-2" : "-1",
            "FDT": this.datepipe.transform(this.nursingForm.get('FromDate').value, "dd-MMM-yyyy")?.toString(),
            "TDT": this.datepipe.transform(this.nursingForm.get('ToDate').value, "dd-MMM-yyyy")?.toString(),
            "FREQ": this.nursingForm.get('Frequency').value,
            "SD": this.nursingForm.get('Schedule').value
          }
        ]
      }


      this.config.SaveNursingService(payload).subscribe(response => {
        if (response.Code == 200) {
          $("#saveMsg").modal('show');
          this.ClearAddServiceForm();
          this.fetchNursingDashBoardDisplay();
        }
      })
    }

  }

  ClearAddServiceForm() {
    this.addServiceSubmitted = false;
    this.nursingForm.reset();
    var d = new Date();
    this.nursingForm.patchValue({
      FromDate: d,
      ToDate: d
    })
  }
  reloadData() {
    this.fetchWardTaskEntryforAllServices();
    this.fetchNursingDashBoardDisplay();
    this.fetchTaskServicemap();
    this.FetchVitalGroups();
    this.FetchNursingFrequency();
    this.FetchPatientNursingInstructions();
    $("#addservice").modal('hide');
  }

  getDetails(slot: any) {
    return this.FetchNursingDashBoardDisplayDataaList.filter((a: any) => a.FrequencyTimeinHHMM == slot);
  }

  getPatientDetails(slot: any) {
    //return this.FetchwardtasksPatientDataList.filter((a: any) => a.FrequencyTimeinHHMM == slot && a.FrequencyTime == this.itemselected?.FrequencyTime); 
    this.FetchwardtasksPatientDataList.forEach((element: any, index: any) => {
      if (element.Color == "16711680")
        element.SClass = "task_card due p-2";
      else if (element.Color == "45296")
        element.SClass = "task_card due_comp p-2";
      else if (element.Color == "16760832" || element.Color == "45136" || element.DoneCount == "1")
        element.SClass = "task_card task_comp p-2";

    });
    return this.FetchwardtasksPatientDataList.filter((a: any) => a.FrequencyTimeinHHMM == slot);  
    
  }

  showvitals() {
    var result = this.FetchTaskServicemapeOutputLists.filter((a: any) => a.TaskID == this.nursingForm.get('Service').value);

    if (result && result[0].TaskID != "1") {
      this.nursingForm.get('Vitals').setValue(result[0].DisplayName);
    }
  }

  fetchWardTaskEntryforAllServices() {
    this.config.fetchWardTaskEntryforAllServices(this.admissionID, this.hospitalID)
      .subscribe((response: any) => {
        this.wardTaskEntryServices = response.FetchWardTaskEntryforAllServicesDataaList;
      },
        (err) => {
        })
  }

  navigateToVitals() {
    var item = this.itemselected;
    if (item.TaskID == "1" && item.DoneCount == "0") {
      sessionStorage.setItem("NursingInterventionDetails", JSON.stringify(item));
      this.router.navigate(['/ward/ipvitals']);
    }
    if (item.TaskID == "3" && item.DoneCount == "0") {
      this.NursingInterventionDetails = item;
      this.FetchNursingInterventions();
      $("#nursingInterventions").modal('show');
    }
    if (item.TaskID == "31" && item.DoneCount == "0") {
      this.NursingInterventionDetails = item;
      this.FetchPatientBedSideCareFrom();
      $("#bedsideModal").modal('show');
    }
    if (item.TaskID == "32" && item.DoneCount == "0") {
      this.NursingInterventionDetails = item;
      this.FetchPatientBathSideCareFrom();
      $("#bathingcareModal").modal('show');
    }

    if (item.TaskID == "21" && item.DoneCount == "0") {
      this.NursingInterventionDetails = item;
      this.FetchDVTMasterRiskFactor1();
      $("#riskassessment").modal('show');
    }
    if (item.TaskID == "20" && item.DoneCount == "0") {
      this.NursingInterventionDetails = item;
      this.fetchFallRiskFactor();
      this.fetchNursingInterventions();
      $("#fallriskassessment").modal('show');
    }
    if (item.TaskID == "22" && item.DoneCount == "0") {
      this.NursingInterventionDetails = item;
      this.FetchBradenScaleMaster();
      $("#bradenscale").modal('show');
    }
    if (item.TaskID == "14" && item.DoneCount == "0") {
      this.NursingInterventionDetails = item;
      this.FetchPatientNursingInstructions();
      $("#NursingInstruction").modal('show');
    }
  }


  FetchNursingInterventions() {
    this.config.fetchNursingInterventions(this.doctorDetails[0].UserId, this.wardID, this.hospitalID, this.admissionID, this.wardID, this.datepipe.transform(this.today, "dd-MMM-yyyy")?.toString(), this.NursingInterventionDetails.FrequencyTime)
      .subscribe((response: any) => {
        this.FetchNursingInterventionsDataaList = response.FetchNursingInterventionsDataaList;
        this.items.clear();
        this.FetchNursingInterventionsDataaList.forEach((item: any) => {
          const currentTime = new Date(item.NursingInterventionDate).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          const itemFormGroup = this.fb.group({
            TaskITemID: item.TaskITemID,
            TaskItemName: item.TaskItemName,
            WardTaskEntryID: item.WardTaskEntryID,
            NursingInterventionDate: new Date(item.NursingInterventionDate),
            NursingInterventionTime: currentTime,
            FrequencyTime: this.NursingInterventionDetails.FrequencyTime,
            Status: item.Status,
            Remarks: ''
          })
          this.items.push(itemFormGroup);
        });
      },
        (err) => {
        })
  }

  headerclick() {
    this.isheaderclicked = true;

    this.nursingTableForm.value.items.forEach((element: any) => {
      element.Status = this.prevStatus;
    });

    this.nursingTableForm.get('items').patchValue(this.nursingTableForm.value.items);
  }

  setStatus(item: any, status: any) {
    item.get('Status')?.setValue(status);
    this.prevStatus = status;
    this.isheaderclicked = false;
  }

  deleteItem(index: any) {
    this.nursingTableForm.get('items').removeAt(index);
  }
  ClearPatientNursingInterventions() {
    this.nursingTableForm.value.items.forEach((element: any) => {
      element.Remarks= '';
    });
    this.nursingTableForm.get('items').patchValue(this.nursingTableForm.value.items);
  }

  SavePatientNursingInterventions() {
    var Details: any[] = [];

    this.nursingTableForm.value.items.forEach((element: any) => {
      Details.push({
        "NIID": element.TaskITemID,
        "NID": this.datepipe.transform(element.NursingInterventionDate, "dd-MMM-yyyy")?.toString() + " " + element.NursingInterventionTime,
        "WTEID": element.WardTaskEntryID,
        "FRDT": this.datepipe.transform(this.today, "dd-MMM-yyyy")?.toString(),
        "FRTM": this.NursingInterventionDetails.FrequencyTime,
        "STS": element.Status,
        "REMARKS": element.Remarks
      })
    });

    let payload = {
      "DoctorID": this.doctorDetails[0].EmpId,
      "AdmissionID": this.admissionID,
      "Blocked": 0,
      "HospitalID": this.hospitalID,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.wardID,
      "Details": Details
    }

    this.config.SavePatientNursingInterventions(payload).subscribe(response => {
      if (response.Code == 200) {
        $("#nursingInterventions").modal('hide');
        $("#saveNursingMsg").modal('show');
      }
    })
  }

  AddDefaultRowForBedSide() {

    if (this.bedSideitems.length > 0) {
      var items = this.bedSideForm.value.items[this.bedSideitems.length - 1];
      this.errorMessages = [];
      if (!items.BedTime) {
        this.errorMessages.push("Please select Time");
      }

      if (!items.Position) {
        this.errorMessages.push("Please select Position");
      }

      if (!items.NurseUserID) {
        this.errorMessages.push("Please validate Nurse");
      }

      if (!items.SocialWorkerUserID) {
        this.errorMessages.push("Please validate Social Worker");
      }

      if (this.errorMessages.length > 0) {
        $("#errorMessageModal").modal("show");
      }
      else {
        this.AddBedRow();
      }
    }
    else {
      this.AddBedRow();
    }

  }

  AddBedRow() {
    const currentTime = new Date(new Date()).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const itemFormGroup = this.fb.group({
      BedDate: new Date(),
      BedTime: currentTime,
      Position: '',
      Diaper: 'No',
      Bedding: 'No',
      Remarks: '',
      LoginUser: this.doctorDetails[0].UserName,
      NurseSignature: '',
      SocialworkerSignature: '',
      NurseUserID: '',
      SocialWorkerUserID: '',
      PatientBedSideCareID: '0',
      NurseEmpNo: '',
      SocialEmpNo: ''
    })
    this.bedSideitems.push(itemFormGroup);
  }

  AddDefaultRowForBathData() {

    if (this.bathDataitems.length > 0) {
      var items = this.bathDataForm.value.items[this.bathDataitems.length - 1];
      this.errorMessages = [];
      if (!items.NurseUserID) {
        this.errorMessages.push("Please validate Nurse");
      }

      if (!items.DoctorUserID) {
        this.errorMessages.push("Please validate Doctor");
      }

      if (this.errorMessages.length > 0) {
        $("#errorMessageModal").modal("show");
      }
      else {
        this.AddBathRow();
      }
    }
    else {
      this.AddBathRow();
    }
  }

  AddBathRow() {


    const currentTime = new Date(new Date()).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const itemFormGroup = this.fb.group({

      BathDate: new Date(),
      BathTime: currentTime,
      PatientRoom: 'No',
      PatientRoomID: 0,
      ShowerRoom: 'No',
      ShowerRoomID: 0,
      Remarks: '',
      LoginUser: '',
      DoctorSignature: '',
      DoctorUserID: 0,
      DoctorEmpNo: '',
      NailHairCutting: 'No',
      NailHairCutID: 0,
      NurseSignature: '',
      NurseUserID: 0,
      NurseEmpNo: '',
      SocialworkerSignature: '',
      SocialWorkerUserID: 0,
      SocialEmpNo: '',
      PatientBathingCareID: '0'


    })
    this.bathDataitems.push(itemFormGroup);
  }
  setBathDataValues(type: any, item: any, status: any) {
    item.get(type)?.setValue(status);
  }

  setBedDataValues(type: any, item: any, status: any) {
    item.get(type)?.setValue(status);
  }

  SavePatientDailyBathingCareForm() {
    var bathDetails: any[] = [];

    this.bathDataForm.value.items.forEach((element: any) => {
      bathDetails.push({
        "PBSCID": 0,
        "BD": this.datepipe.transform(element.BathDate, "dd-MMM-yyyy")?.toString(),
        "BT": element.BathTime,
        "PRID": this.careMaster.filter((f: any) => f.CareID == "4" && f.SectionName == element.PatientRoom)[0].CareSectionID,
        "SHRID": this.careMaster.filter((f: any) => f.CareID == "5" && f.SectionName == element.ShowerRoom)[0].CareSectionID,
        "NHCID": this.careMaster.filter((f: any) => f.CareID == "6" && f.SectionName == element.NailHairCutting)[0].CareSectionID,
        "DCNOTE": element.Remarks,
        "DOCID": element.DoctorUserID,
        "NURID": element.NurseUserID,
        "SOCID": element.SocialWorkerUserID,
        "LUID": this.doctorDetails[0].UserId
      })
    });

    var bathdet = bathDetails.filter((x: any) => x.DOCID == "0" || x.NURID == "0");
    if (bathdet.length == 0) {
      let bathpayload = {
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.IPID,
        "WardID": this.wardID,
        "EntryDate": this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
        "BedID": this.selectedView.BedID,
        "FrequencyTime": this.NursingInterventionDetails.FrequencyTime,
        "HospitalID": this.hospitalID,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.wardID,
        "BathingCareXML": bathDetails
      }

      this.config.SavePatientBathSideCareFrom(bathpayload).subscribe(response => {
        if (response.Code == 200) {
          $("#bathingcareModal").modal('hide');
          $("#saveBathCareDataMsg").modal('show');
        }
      })
    }
    else {
      this.errorMessages.push("Please validate Nurse/Doctor");
      if (this.errorMessages.length > 0) {
        $("#errorMessageModal").modal("show");
      }
    }
  }

  FetchCareMaster() {
    this.config.FetchCareMaster(this.hospitalID).subscribe(response => {
      if (response.Code == 200) {
        this.careMaster = response.FetchCareMasterDataaList;
      }
    })
  }

  FetchPatientBathSideCareFrom() {

    var FromDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();

    this.config.FetchPatientBathSideCareFrom(this.selectedView.IPID, FromDate, ToDate, this.hospitalID).subscribe(response => {
      this.bathDataitems.clear();
      if (response.Code == 200 && response.FetchPatientBathSideCareFromDataaList.length > 0) {
        this.savedBathCareForm = response.FetchPatientBathSideCareFromDataaList
        response.FetchPatientBathSideCareFromDataaList.forEach((element: any) => {
          const itemFormGroup = this.fb.group({
            BathDate: new Date(element.BathDate),
            BathTime: element.BathTime,
            PatientRoom: element.PatientRoom,
            PatientRoomID: element.PatientRoomID,
            ShowerRoom: element.ShowerRoom,
            ShowerRoomID: element.ShowerRoomID,
            Remarks: '',
            LoginUser: element.LoginuserEMPNo,
            DoctorSignature: element.Signature1EMPNo,
            DoctorUserID: element.DoctorSignID,
            DoctorEmpNo: element.Signature1EMPNo,
            NailHairCutting: element.NailHairCutting,
            NailHairCutID: element.NailHairCuttingID,
            NurseSignature: element.Signature2EMPNo,
            NurseUserID: element.NurseSignID,
            NurseEmpNo: element.Signature2EMPNo,
            SocialworkerSignature: '',
            SocialWorkerUserID: element.SocialWorkerSignID,
            SocialEmpNo: element.Signature3EMPNo,
            PatientBathSideCareID: element.PatientBathingCareID
          })
          this.bathDataitems.push(itemFormGroup);
        });
      }
      else {
        this.AddDefaultRowForBathData();
      }
    })
  }

  FetchDVTMasterRiskFactor1() {
    this.config.FetchDVTRiskAssessmentFactors(this.admissionID, this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe(response => {
      if (response) {

        if (response?.FetchDVTMasterRiskFactor1List?.length > 0) {
          this.IsEdit = true;
          this.FetchRiskFactors1 = response.FetchDVTMasterRiskFactor1List.filter((f: any) => f.RiskFactorValue == "Yes");
        }
        if (response?.FetchDVTMasterRiskFactor2List?.length > 0) {
          this.IsEdit = true;
          this.FetchRiskFactors2 = response.FetchDVTMasterRiskFactor2List.filter((f: any) => f.RiskFactorValue == "Yes");
        }
        if (response?.FetchDVTMasterRiskFactor3List?.length > 0) {
          this.IsEdit = true;
          this.FetchRiskFactors3 = response.FetchDVTMasterRiskFactor3List.filter((f: any) => f.RiskFactorValue == "Yes");
        }
        if (response?.FetchDVTMasterRiskFactor4List?.length > 0) {
          this.IsEdit = true;
          this.FetchRiskFactors4 = response.FetchDVTMasterRiskFactor4List.filter((f: any) => f.RiskFactorValue == "Yes");
        }

        if (response?.FetchActionPlanDataList.length > 0) {
          this.IsEdit = true;
          this.FetchActionPlan = response?.FetchActionPlanDataList;
        }
      }
    })

    this.config.FetchDVTMasterRiskFactor1(this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe(response => {
      if (response) {
        this.results = response;

        this.results.forEach((element: any, index: any) => {
          if (index >= 0 && index <= 3) {
            this.FetchDVTMasterRiskFactor1List = element.FetchDVTMasterRiskFactor1List;

            const distinctRiskFactorIDs = Array.from(new Set(this.FetchDVTMasterRiskFactor1List.map((item: any) => item.RiskFactorID)));
            const riskFactorsWithScore = distinctRiskFactorIDs.map(riskFactorID => {
              const correspondingRiskFactors = this.FetchDVTMasterRiskFactor1List.filter((item: any) => item.RiskFactorID === riskFactorID);

              const yesScore = correspondingRiskFactors.find((item: any) => item.RiskFactorValue === 'Yes')?.AssessmentScore || 0;
              const noScore = correspondingRiskFactors.find((item: any) => item.RiskFactorValue === 'No')?.AssessmentScore || 0;
              let res;
              if (index === 0) {
                res = this.FetchRiskFactors1.filter((f: any) => f.RiskFactorID == riskFactorID);
              }
              else if (index === 1) {
                res = this.FetchRiskFactors2.filter((f: any) => f.RiskFactorID == riskFactorID);
              }
              else if (index === 2) {
                res = this.FetchRiskFactors3.filter((f: any) => f.RiskFactorID == riskFactorID);
              }
              else if (index === 3) {
                res = this.FetchRiskFactors4.filter((f: any) => f.RiskFactorID == riskFactorID);
              }
              return {
                RiskFactorID: riskFactorID,
                RiskFactor: correspondingRiskFactors[0].RiskFactor,
                RiskFactorSubGroupID: correspondingRiskFactors[0].RiskFactorSubGroupID,
                YesAssessmentScore: yesScore,
                NoAssessmentScore: noScore,
                YesRiskFactorValueID: correspondingRiskFactors.find((item: any) => item.RiskFactorValue === 'Yes')?.RiskFactorValueID,
                NoRiskFactorValueID: correspondingRiskFactors.find((item: any) => item.RiskFactorValue === 'No')?.RiskFactorValueID,
                SelectedValue: res?.length > 0 ? 'Yes' : 'No'
              };
            });

            if (index === 0) {
              this.distinctRiskFactors1 = riskFactorsWithScore;
            }
            else if (index === 1) {
              this.distinctRiskFactors2 = riskFactorsWithScore;
            }
            else if (index === 2) {
              this.distinctRiskFactors3 = riskFactorsWithScore;
            }
            else if (index === 3) {
              this.distinctRiskFactors4 = riskFactorsWithScore;
            }
          }
          else if (index === 4) {
            this.FetchDVTRiskLevelDataList = element.FetchDVTRiskLevelDataList;
          }
          else if (index === 5) {
            this.FetchActionPlanDataList = element.FetchActionPlanDataList;

            this.FetchActionPlanDataList.forEach((element: any, index: any) => {
              let res = this.FetchActionPlan.filter((f: any) => f.NursingInterventionID == element.NursingInterventionID);
              element.selectedValue = res?.length > 0 ? true : false;
            });
          }

        });
      }
    })
  }

  toggleRiskPresence(risk: any, value: any) {
    risk.SelectedValue = value;
  }

  calculateRiskTotalScore(array: any) {
    const totalScore = array.reduce((total: any, risk: any) => {
      return total + (risk.SelectedValue === 'Yes' ? risk.YesAssessmentScore : risk.NoAssessmentScore);
    }, 0);

    return totalScore;
  }

  calculateAllScore() {
    let totalScore = 0;
    totalScore = totalScore + this.calculateRiskTotalScore(this.distinctRiskFactors1) + this.calculateRiskTotalScore(this.distinctRiskFactors2) + this.calculateRiskTotalScore(this.distinctRiskFactors3) + this.calculateRiskTotalScore(this.distinctRiskFactors4);
    this.OverAllScore = totalScore;
    if (this.OverAllScore >= 0 && this.OverAllScore < 2) {
      this.RiskLevelID = '1';
    }
    else if (this.OverAllScore >= 2 && this.OverAllScore < 4) {
      this.RiskLevelID = '2';
    }
    else if (this.OverAllScore >= 4 && this.OverAllScore < 6) {
      this.RiskLevelID = '3';
    }
    else if (this.OverAllScore >= 5) {
      this.RiskLevelID = '4';
    }
    else {
      this.RiskLevelID = '0';
    }

    return totalScore;
  }

  FetchPatientBedSideCareFrom() {
    this.config.fetchPatientBedSideCareFrom(this.admissionID, this.datepipe.transform(this.today, "dd-MMM-yyyy")?.toString(), this.datepipe.transform(this.today, "dd-MMM-yyyy")?.toString(), this.hospitalID)
      .subscribe((response: any) => {
        this.bedSideitems.clear();
        if (response.FetchPatientBedSideCareFromDataaList.length > 0) {
          response.FetchPatientBedSideCareFromDataaList.forEach((element: any) => {
            const itemFormGroup = this.fb.group({
              BedDate: new Date(element.CareDate),
              BedTime: element.CareTime,
              Position: element.PositionID,
              Diaper: element.ChangeofDiaper,
              Bedding: element.ChangeofBedding,
              Remarks: element.Remarks,
              LoginUser: this.doctorDetails[0].UserName,
              NurseUserID: element.SignatureID1,
              SocialWorkerUserID: element.SignatureID2,
              PatientBedSideCareID: element.PatientBedSideCareID,
              NurseEmpNo: element.Signature1EMPNo,
              SocialEmpNo: element.Signature2EMPNo
            })
            this.bedSideitems.push(itemFormGroup);
          });

        }
        else {
          this.AddDefaultRowForBedSide();
        }
      },
        (err) => {
        })
  }

  filterPosition() {
    return this.careMaster?.filter((x: any) => x.CareID == "1");
  }

  openUserModal(item: any, type: any) {
    if (type == "BathCare") {
      this.bathCareValidation = true;
    }
    this.selectedIndex = item;
    this.type = ValidationType.Nurse;
    this.clearuser();
    $("#usercredentials").modal('show');
  }

  openSocialUserModal(item: any, type: any) {
    if (type == "BathCare") {
      this.bathCareValidation = true;
    }
    this.selectedIndex = item;
    this.type = ValidationType.SocialWorker;
    this.clearuser();
    $("#usercredentials").modal('show');
  }

  openDoctorUserModal(item: any, type: any) {
    if (type == "BathCare") {
      this.bathCareValidation = true;
    }
    this.selectedIndex = item;
    this.type = ValidationType.Doctor;
    this.clearuser();
    $("#usercredentials").modal('show');
  }

  onFetchNurse(event: any) {
    let APIName = "FetchHospitalNurse";

    if (this.type == ValidationType.SocialWorker) {
      APIName = "FetchHospitalSocialWorker";
    }

    if (this.type == ValidationType.Doctor) {
      APIName = "FetchBathHospitalDoctors";
    }

    this.config.FetchHospitalNurse(APIName, event.target.value.trim(), this.doctorDetails[0].UserId, this.wardID, this.hospitalID)
      .subscribe((response: any) => {
        this.FetchHospitalNurseDataaList = response.FetchHospitalNurseDataaList;
        if (response.FetchHospitalNurseDataaList.length > 0) {
          this.userForm.patchValue({
            EmpNo: this.FetchHospitalNurseDataaList[0].EmpNo,
            EmpName: this.FetchHospitalNurseDataaList[0].Fullname,
            EmpID: this.FetchHospitalNurseDataaList[0].EmpID,
            Department: this.FetchHospitalNurseDataaList[0].Department,
            UserName: this.FetchHospitalNurseDataaList[0].EmpNo
          });
        }
        else {
          this.clearuser();
        }

        event.target.value = '';
      },
        (err) => {
        })
  }

  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.onFetchNurse(event);
    }
  }

  validateuser() {
    this.con.validateDoctorLogin(this.userForm.get('EmpNo').value, this.userForm.get('Password').value, this.hospitalID).subscribe((response) => {
      this.errorMessage = '';
      if (response.length === 0) {
        this.errorMessage = "Invalid UserName / Password"
      } else if (response[0].CredentialsMessage) {
        this.errorMessage = response[0].CredentialsMessage;
      }
      else {
        let updatedValues: any;
        if (this.type == ValidationType.Nurse) {
          updatedValues = {
            NurseUserID: response[0].UserId,
            NurseEmpNo: response[0].UserName
          };
        }
        else if (this.type == ValidationType.SocialWorker) {
          updatedValues = {
            SocialWorkerUserID: response[0].UserId,
            SocialEmpNo: response[0].UserName
          };
        }
        else if (this.type == ValidationType.Doctor) {
          updatedValues = {
            DoctorUserID: response[0].UserId,
            DoctorEmpNo: response[0].UserName
          };
        }
        if (this.bathCareValidation)
          this.updateBathFormValue(this.selectedIndex, updatedValues);
        else
          this.updateFormValue(this.selectedIndex, updatedValues);

        $("#usercredentials").modal('hide');
      }
    },
      (err) => {

      })
  }

  clearuser() {
    this.userForm = this.fb.group({
      EmpNo: ['', Validators.required],
      EmpName: ['', Validators.required],
      EmpID: ['', Validators.required],
      Department: ['', Validators.required],
      UserName: ['', Validators.required],
      Password: ['', Validators.required]
    });

    this.errorMessage = '';
  }

  savebedside() {
    var BedDetails: any[] = [];

    this.bedSideForm.value.items.forEach((element: any) => {
      BedDetails.push({
        "PBSCID": element.PatientBedSideCareID,
        "CD": this.datepipe.transform(element.BedDate, "dd-MMM-yyyy")?.toString(),
        "CT": element.BedTime,
        "PID": element.Position,
        "CDID": this.careMaster.filter((f: any) => f.CareID == "2" && f.SectionName == element.Diaper)[0].CareSectionID,
        "CBID": this.careMaster.filter((f: any) => f.CareID == "3" && f.SectionName == element.Bedding)[0].CareSectionID,
        "RMK": element.Remarks,
        "SID1": element.NurseUserID,
        "SID2": element.SocialWorkerUserID,
        "LUID": this.doctorDetails[0].UserId
      })
    });

    let bathpayload = {
      "PatientID": this.selectedView.PatientID,
      "AdmissionID": this.selectedView.IPID,
      "WardID": this.wardID,
      "EntryDate": this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
      "BedID": this.selectedView.BedID,
      "FrequencyTime": this.NursingInterventionDetails.FrequencyTime,
      "HospitalID": this.hospitalID,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.wardID,
      "BedSideCareXML": BedDetails
    }

    this.config.SavePatientBedSideCareFrom(bathpayload).subscribe(response => {
      if (response.Code == 200) {
        $("#bedsideModal").modal('hide');
        $("#saveBedSideDataMsg").modal('show');
      }
    })
  }

  updateFormValue(index: number, updatedValues: any) {
    const itemsArray = this.bedSideForm.get('items') as FormArray;

    if (index >= 0 && index < itemsArray.length) {
      const currentFormGroup = itemsArray.at(index) as FormGroup;
      currentFormGroup.patchValue(updatedValues);
    }
  }

  clearBedSide() {
    this.FetchPatientBedSideCareFrom();
  }

  updateBathFormValue(index: number, updatedValues: any) {
    const itemsArray = this.bathDataForm.get('items') as FormArray;

    if (index >= 0 && index < itemsArray.length) {
      const currentFormGroup = itemsArray.at(index) as FormGroup;
      currentFormGroup.patchValue(updatedValues);
    }
  }

  clearBathCare() {
    this.FetchPatientBathSideCareFrom();
  }

  fetchFallRiskFactor() {
    this.config.FetchFallRiskFactor(this.doctorDetails[0].UserId, this.wardID, this.hospitalID)
      .subscribe((response: any) => {
        this.fallRiskFactors = response.FetchFallRiskFactorDataList;
        this.fallRiskFactors.forEach((element: any, index: any) => {
          if (element.AssessmentScore == 0) {
            element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2 active";
            element.Score = 0;
            element.Selected = true;
          }
          else {
            element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2";
            element.Score = 0;
            element.Selected = false;
          }
        });
        const distinctThings = response.FetchFallRiskFactorDataList.filter(
          (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.RiskFactorID === thing.RiskFactorID) === i);
        console.dir(distinctThings);
        this.filteredFallRiskFactors = distinctThings;
        this.fetchFallRiskFactorParameter();
      },
        (err) => {
        })
  }

  fetchFallRiskFactorParameter() {
    this.config.FetchFallRiskFactorParameter(this.doctorDetails[0].UserId, this.wardID, this.hospitalID)
      .subscribe((response: any) => {
        this.fallRiskFactorParameter = response.FetchFallRiskFactorDataList;
        this.fallRiskFactorParameter.forEach((element: any, index: any) => {
          if (element.RiskFactorValue == "No") {
            element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2 active";
            element.Score = 0;
            element.Selected = true;
          }
          else {
            element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2";
            element.Score = 0;
            element.Selected = false;
          }
        });
        const distinctThings = response.FetchFallRiskFactorDataList.filter(
          (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.RiskFactorID === thing.RiskFactorID) === i);
        console.dir(distinctThings);
        this.filteredFallRiskFactorParameter = distinctThings;
      },
        (err) => {
        })
  }
  fetchNursingInterventions() {
    this.config.FetchNursingInterventions(this.doctorDetails[0].UserId, this.wardID, this.hospitalID)
      .subscribe((response: any) => {
        this.fallRiskNursingInterventions = response.FetchActionPlanDataList;
        this.fallRiskNursingInterventions.forEach((element: any, index: any) => {
          element.Class = "d-flex action_select align-items-center gap-2 mb-2";
          element.Selected = false;
        });
        this.environmentPreventiveActions = this.fallRiskNursingInterventions.filter((e: any) => e.Type == 3);
        this.nursingInterventions = this.fallRiskNursingInterventions.filter((e: any) => e.Type == 4);
        this.multiDisciplinary = this.fallRiskNursingInterventions.filter((e: any) => e.Type == 5);
        this.patientCentered = this.fallRiskNursingInterventions.filter((e: any) => e.Type == 6);
      },
        (err) => {
        })
  }

  filterFunction(riskfactors: any, RiskFactorID: any) {
    return riskfactors.filter((buttom: any) => buttom.RiskFactorID == RiskFactorID);
  }

  riskFactorToggle(index: any, item: any) {
    // this.fallRiskFactors[index].Score = item.AssessmentScore;
    var updateRiskFactor = this.fallRiskFactors.filter((x: any) => x.RiskFactorID == item.RiskFactorID);
    updateRiskFactor.forEach((element: any, index: any) => {
      if (element.RiskFactorID == item.RiskFactorID && element.AssessmentScore == item.AssessmentScore) {
        element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2 active";
        element.Score = item.AssessmentScore;
        element.Selected = true;
      }
      else {
        element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2";
        element.Score = item.AssessmentScore;
        element.Selected = false;
      }
    });
    var totScore = 0;
    this.filteredFallRiskFactors.forEach((element: any, index: any) => {
      totScore = totScore + element.Score;
    });
    this.totalRiskFactorScore = totScore;
    const totScoreGb = Number(this.totalRiskFactorScore);
    if (totScoreGb >= 0 && totScoreGb <= 24)
      this.scoreBgColor1 = "#AEDCE8";
    else
      this.scoreBgColor1 = "White";
    if (totScoreGb >= 25 && totScoreGb <= 44)
      this.scoreBgColor2 = "#AEDCE8";
    else
      this.scoreBgColor2 = "White";
    if (totScoreGb >= 45)
      this.scoreBgColor3 = "#AEDCE8";
    else
      this.scoreBgColor3 = "White";

    this.calculateTotalScore();
  }
  riskFactorParameterToggle(index: any, item: any) {
    var updateRiskFactorParameter = this.fallRiskFactorParameter.filter((x: any) => x.RiskFactorID == item.RiskFactorID);
    updateRiskFactorParameter.forEach((element: any, index: any) => {
      if (element.RiskFactorID == item.RiskFactorID && element.CriteriaClass == "d-flex action_select align-items-center gap-2 mb-2") {
        element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2 active";
        element.Score = "Yes";
        element.Selected = true;
      }
      else {
        element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2";
        element.Score = "No";
        element.Selected = false;
      }
    });
    var totScore = 0;
    this.filteredFallRiskFactorParameter.forEach((element: any, index: any) => {
      totScore = totScore + element.Score;
    });

    this.calculateTotalScore();
  }

  calculateTotalScore() {
    var anyOneSelectedAsYes = this.filteredFallRiskFactorParameter.filter((x: any) => x.Score == "Yes");
    var anyOneSelectedAsYesCount = this.filteredFallRiskFactorParameter.filter((x: any) => x.Score == "Yes").length;
    var totRiskFactorScore = Number(this.totalRiskFactorScore);
    if (Number(anyOneSelectedAsYesCount) == 2) {
      this.scoreBgColor3 = "#AEDCE8";
      this.scoreBgColor2 = "White";
      this.scoreBgColor1 = "White";
      this.totalRiskFactorParameterScore = "3";
      this.additionalScore = "High";
    }
    else if (totRiskFactorScore >= 0 && totRiskFactorScore <= 24) {
      this.additionalScore = "";
      if (anyOneSelectedAsYes.length > 0) {
        this.scoreBgColor3 = "White";
        this.scoreBgColor2 = "#AEDCE8";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "2";
      }
      else {
        this.scoreBgColor3 = "White";
        this.scoreBgColor2 = "White";
        this.scoreBgColor1 = "#AEDCE8";
        this.totalRiskFactorParameterScore = "1";
      }
    }
    else if (totRiskFactorScore >= 25 && totRiskFactorScore <= 44) {
      this.additionalScore = "";
      if (anyOneSelectedAsYes.length > 0) {
        this.scoreBgColor3 = "#AEDCE8";
        this.scoreBgColor2 = "White";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "3";
      }
      else {
        this.scoreBgColor3 = "White";
        this.scoreBgColor2 = "#AEDCE8";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "2";
      }
    }
    else if (totRiskFactorScore >= 45 && totRiskFactorScore <= 300) {
      this.additionalScore = "";
      if (anyOneSelectedAsYes.length > 0) {
        this.scoreBgColor3 = "#AEDCE8";
        this.scoreBgColor2 = "White";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "3";
      }
      else {
        this.scoreBgColor3 = "#AEDCE8";
        this.scoreBgColor2 = "White";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "3";
      }
    }
  }
  selectPreventiveActions(env: any) {
    if (env.Class == "d-flex action_select align-items-center gap-2 mb-2") {
      env.Class = "d-flex action_select align-items-center gap-2 mb-2 active";
      env.Selected = true;
    }
    else {
      env.Class = "d-flex action_select align-items-center gap-2 mb-2";
      env.Selected = false;
    }
  }

  saveFallRiskAssessment() {
    var riskAssessmentDetails: any[] = [];
    var riskAssessmentNiDetails: any[] = [];

    this.fallRiskFactors.forEach((element: any) => {
      if (element.Selected) {
        riskAssessmentDetails.push({
          "RFSGID": element.RiskFactorSubGroupID,
          "RFID": element.RiskFactorID,
          "RFVID": element.RiskFactorValueID,
          "VAL": this.totalRiskFactorScore
        })
      }
    });

    this.fallRiskFactorParameter.forEach((element: any) => {
      if (element.Selected) {
        riskAssessmentDetails.push({
          "RFSGID": element.RiskFactorSubGroupID,
          "RFID": element.RiskFactorID,
          "RFVID": element.RiskFactorValueID,
          "VAL": this.totalRiskFactorScore
        })
      }
    });

    var payload = {
      "AdmissionID": this.selectedView.IPID,
      "NursingTaskID": this.nursingInterventions.TaskID,
      "WardID": this.wardID,
      "FrequencyDate": this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
      "FrequencyTime": this.nursingInterventions.FrequencyTime,
      "Reassement": this.totalRiskFactorParameterScore,
      "OverAllScore": this.totalRiskFactorScore,
      "RiskLevelID": this.totalRiskFactorParameterScore,
      "HospitalID": this.hospitalID,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.wardID,
      "RiskAssessmentDetails": riskAssessmentDetails,
      "RiskAssessmentNIDetails": riskAssessmentNiDetails
    }

    this.config.SavePatientFallRisk(payload).subscribe(response => {
      if (response.Code == 200) {
        $("#fallRiskSaveMsg").modal('show');
      }
    })
  }

  selectActionPlan(item: any) {
    item.selectedValue = !item.selectedValue;
  }

  SaveDVT() {
    const mergedArray = [
      ...this.distinctRiskFactors1,
      ...this.distinctRiskFactors2,
      ...this.distinctRiskFactors3,
      ...this.distinctRiskFactors4
    ];

    let RiskAssessmentDetails: any = [];
    mergedArray.forEach((element: any, index: any) => {
      let data = {
        "RFSGID": element.RiskFactorSubGroupID,
        "RFID": element.RiskFactorID,
        "RFVID": element.SelectedValue === 'Yes' ? element.YesRiskFactorValueID : element.NoRiskFactorValueID,
        "VAL": element.SelectedValue === 'Yes' ? element.YesAssessmentScore : element.NoAssessmentScore,
      }

      RiskAssessmentDetails.push(data);
    });

    let RiskAssessmentNIDetails: any = [];
    this.FetchActionPlanDataList.forEach((element: any, index: any) => {
      if (element.selectedValue) {
        let data = {
          "NIID": element.NursingInterventionID,
        }

        RiskAssessmentNIDetails.push(data);
      }

    });

    let payload = {
      "AdmissionID": this.admissionID,
      "NursingTaskID": "21",
      "WardID": this.wardID,
      "FrequencyDate": this.datepipe.transform(this.today, "dd-MMM-yyyy")?.toString(),
      "FrequencyTime": this.NursingInterventionDetails.FrequencyTime,
      "OverAllScore": this.OverAllScore,
      "RiskLevelID": this.RiskLevelID,
      "HospitalID": this.hospitalID,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.wardID,
      "RiskAssessmentDetails": RiskAssessmentDetails,
      "RiskAssessmentNIDetails": RiskAssessmentNIDetails
    };


    this.config.SavePatientDVTFrom(payload).subscribe(response => {
      if (response.Code == 200) {
        $("#saveDVTDataMsg").modal('show');
        $("#riskassessment").modal('hide');
        this.FetchDVTMasterRiskFactor1();
      }
    })
  }

  clearDVT() {
    this.FetchDVTMasterRiskFactor1();
  }


  FetchBradenScaleMaster() {
    this.config.FetchBradenScaleMaster(this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe(response => {
      if (response) {
        if (response.FetchBradenScaleMasterDataaList) {
          this.convertedData = [];
          const groupedData = response.FetchBradenScaleMasterDataaList.reduce((acc: any, obj: any) => {
            const { RiskFactorID, RiskFactor, RiskFactorSubGroupID, RiskFactorSubGroup, Description, Sequence } = obj;
            if (!acc[RiskFactorID]) {
              acc[RiskFactorID] = {
                RiskFactorID,
                RiskFactor,
                RiskFactorSubGroupID,
                RiskFactorSubGroup,
                Description,
                Sequence,
                Options: []
              };
            }
            acc[RiskFactorID].Options.push({
              RiskFactorValue: obj.RiskFactorValue,
              RiskFactorValueID: obj.RiskFactorValueID,
              AssessmentScore: obj.AssessmentScore,
              Selected: false
            });
            return acc;
          }, {});

          for (const key in groupedData) {
            if (groupedData.hasOwnProperty(key)) {
              this.convertedData.push(groupedData[key]);
            }
          }
        }
      }
    });
  }

  toggleActive(item: any, index: number, option: any) {
    item.Options.forEach((option: any) => {
      option.Selected = false;
    });
    item.Options.forEach((option: any, idx: any) => {
      if (idx === index) {
        option.Selected = true;
        item.SelectedScore = option.AssessmentScore;
      }
    });
  }

  calculateTotalSelectedScore(): number {
    let total = 0;
    for (const item of this.convertedData) {
      if (item.SelectedScore) {
        total += item.SelectedScore;
      }
    }
    this.totalSelectedScore = total;
    return total;
  }

  SavePatientBradenScale() {
    var riskAssessmentDetails: any[] = [];
    this.nursingScaleMandatoryList = [];
    this.convertedData.forEach((element: any) => {
      var optionselected = false;
      element.Options.forEach((ele: any) => {
        if (ele.Selected) {
          optionselected = true;
          riskAssessmentDetails.push({
            "RFSGID": element.RiskFactorSubGroupID,
            "RFID": element.RiskFactorID,
            "RFVID": ele.RiskFactorValueID,
            "VAL": ele.AssessmentScore
          })
        }
      })

      if (!optionselected) {
        this.nursingScaleMandatoryList.push(element.RiskFactor);
      }
    });

    if (this.nursingScaleMandatoryList.length > 0) {
      $("#scaleModal").modal("show");
      return;
    }

    var payload = {
      "AdmissionID": this.selectedView.IPID,
      "NursingTaskID": this.NursingInterventionDetails.TaskID,
      "WardID": this.wardID,
      "FrequencyDate": this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
      "FrequencyTime": this.NursingInterventionDetails.FrequencyTime,
      "OverAllScore": this.totalSelectedScore,
      "HospitalID": this.hospitalID,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.wardID,
      "RiskAssessmentDetails": riskAssessmentDetails
    }

    this.config.SavePatientBradenScale(payload).subscribe(response => {
      if (response.Code == 200) {
        $("#BradenScaleMsg").modal('show');
        $("#bradenscale").modal('hide');
        this.nursingInterventionsAfterSave = response.VitalsInterventionsDataaList;
      }
    })
  }
  FetchPatientNursingInstructions() {
    this.config.FetchPatientNursingInstructions(this.selectedView.PatientID, this.admissionID, this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe((response: any) => {
      if (response.Code == 200) {
        this.selectedInstructionsList = [];


        response.FetchPatientNursingInstructionsOutputLists.forEach((element: any, index: any) => {
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
            isNewInstruction: false
          })
        });



        this.selectedInstructionsList.forEach((element: any, index: any) => {
          element.ItemSelected = false;
          element.itemSelectClass = "custom_check d-flex align-items-center";
          if (this.NursingInterventionDetails.FrequencyTimeinHHMM === element.ActualTime && this.NursingInterventionDetails.FrquencyDate === element.ActualDate) {
            element.showBorder = true;
            this.individualProcess = element;
            element.ItemSelected = true;
            element.itemSelectClass = "custom_check d-flex align-items-center justify-content-center w-100 active readonly";
          }

          if (element.Status == 1)
            element.Class = "legend_color prescribed";
          else if (element.Status == 2)
            element.Class = "legend_color partial";
          else if (element.Status == 3)
            element.Class = "legend_color issued";
          if (element.AcknowledgeBy != '') {
            element.ItemSelected = true;
            element.itemSelectClass = "custom_check d-flex align-items-center justify-content-center w-100 active readonly";
          }

          // if (element.AcknowledgeBy != '') {
          //   element.ItemSelected = true;
          //   element.itemSelectClass = "custom_check d-flex align-items-center w-100 active readonly";
          // } else {
          //   element.ItemSelected = false;
          //   element.itemSelectClass = "custom_check d-flex align-items-center w-100";
          // }

        });
      }
    }, error => {
      console.error('Get Data API error:', error);
    });
  }

  saveAcknowledgeInstruction() {
    var NurseInstDetails: any[] = [];
    NurseInstDetails.push({
      "FQID": this.individualProcess.FrequencyId,
      "NOD": this.individualProcess.NoofDays,
      "STDT": this.individualProcess.StartDate,
      "FRQDT": this.individualProcess.StartDate + ' ' + (this.individualProcess.ActualTime == 24 ? "23:59" : this.individualProcess.ActualTime + ":00"),
      "FRQDTT": this.individualProcess.ActualTime == 24 ? "23:59" : this.individualProcess.ActualTime + ":00",
      "STS": "1",
      "INDID": this.individualProcess.InstructiondetailID,
      "ACKBY": this.doctorDetails[0].UserId,
      "ACKDT": this.datepipe.transform(this.today, "dd-MMM-yyyy HH:mm")?.toString()//moment(new Date()).format('DD-MMM-yyyy')

    })
    var ackPayload = {
      "InstructionID": this.individualProcess.InstructionId,
      // "MonitorID": 0,
      "Instruction": this.individualProcess.Instruction,
      "Instructiondate": this.individualProcess.StartDate,
      "DoctorID": this.individualProcess.DoctorId,
      "AdmissionID": this.admissionID,
      "WardID": this.wardID,
      "EntryDate": this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
      "FrequencyTime": this.NursingInterventionDetails.FrequencyTime,
      "STATUS": "1",
      "remarks": "",
      "IsFav": false,
      "Orderpackid": "0",
      "Hospitalid": this.hospitalID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "NurseInstDetails": NurseInstDetails
    }
    this.config.SaveNursingInstructionsAck(ackPayload).subscribe(response => {
      if (response.Code == 200) {
        this.FetchPatientNursingInstructions();
        $("#instructionAckSaveMsg").modal('show');
      }
    })
  }

  viewselectItemForPatient(item: any) {
    var item = this.selectedInstructionsList.find((x: any) => x.InstructiondetailID === item.InstructiondetailID);
    this.individualProcess = item;
    this.selectedInstructionsList.forEach((element: any, index: any) => {
      element.ItemSelected = false;
      element.itemSelectClass = "custom_check d-flex align-items-center w-100";

      if (element.AcknowledgeBy != '') {
        element.ItemSelected = true;
        element.itemSelectClass = "custom_check d-flex align-items-center w-100 active readonly";
      }

    });
    if (!item.ItemSelected) {
      item.ItemSelected = true;
      item.itemSelectClass = "custom_check d-flex align-items-center w-100 active";
    }
    else {
      item.ItemSelected = false;
      item.itemSelectClass = "custom_check d-flex align-items-center w-100";
    }


  }
  clearAcknowledgeInstruction() {
    this.FetchPatientNursingInstructions();
  }

  FetchwardtasksCountwithColor() {
    this.step = 1;
    this.itemselectedName='';
    this.NursingDashBoard= 'Ward Nursing DashBoard';
    this.config.FetchwardtasksCountwithColor(this.wardID, 0, this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(), this.doctorDetails[0].UserId, this.wardID, this.hospitalID)
      .subscribe((response: any) => {
        this.FetchNursingDashBoardDisplayDataaList = response.FetchwardtasksCountwithColorDataList;
        this.FetchwardtasksPatientDataList = response.FetchwardtasksPatientDataList; 

        var tasksPatientDataList: { Color: any,PatientName: any,SSN: any,FullAge: any,Gender: any,Nationality: any,MobileNo: any,BedName: any, FrequencyTime: any, FrequencyTimeinHHMM: any,PendingCount:any }[] = [];
        this.FetchwardtasksPatientDataList.forEach((item: any, index: any) => {
          tasksPatientDataList.push({
            Color: item.Color, PatientName: item.PatientName,SSN: item.SSN,FullAge: item.FullAge,Gender: item.Gender,Nationality: item.Nationality,MobileNo: item.MobileNo,BedName: item.BedName,FrequencyTime: item.FrequencyTime, FrequencyTimeinHHMM: item.FrequencyTimeinHHMM,PendingCount: item.PendingCount
          });
        });

        this.FetchwardtasksPatientDataList = tasksPatientDataList;
        var resArr: { Color: any, DisplayName: any, DoneCount: any, EndTime: any, FrequencyTime: any, FrequencyTimeinHHMM: any, FrquencyDate: any, PendingCount: any, SClass: any, Sequence: any, TaskID: any, TaskItemID: any, TaskItemName: any; TaskCount: any }[] = [];
        this.FetchNursingDashBoardDisplayDataaList.forEach((item: any, index: any) => {
          var i = resArr.findIndex(x => x.TaskID == item.TaskID && x.FrequencyTime == item.FrequencyTime);
          var taskCount = this.FetchNursingDashBoardDisplayDataaList.filter((x: any) => x.TaskID == item.TaskID && x.FrequencyTime == item.FrequencyTime).length;
          if (i <= -1) {
            resArr.push({
              Color: item.Color, DisplayName: item.DisplayName, DoneCount: item.DoneCount, EndTime: item.EndTime, FrequencyTime: item.FrequencyTime,
              FrequencyTimeinHHMM: item.FrequencyTimeinHHMM, FrquencyDate: item.FrquencyDate,
              PendingCount: item.PendingCount, SClass: item.SClass, Sequence: item.Sequence, TaskID: item.TaskID, TaskItemID: item.TaskItemID, TaskItemName: item.TaskItemName,
              TaskCount: taskCount
            });
          }
        });
        this.FetchNursingDashBoardDisplayDataaList.forEach(function (item) {

        });
        this.FetchNursingDashBoardDisplayDataaList = resArr;
        this.FetchNursingDashBoardDisplayDataaList.forEach((element: any, index: any) => {
          const [hours, minutes] = element.FrequencyTimeinHHMM.split(':').map(Number);
          const endTimeHours = hours + 1;
          const endTimeHHMM = `${endTimeHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          element.EndTime = endTimeHHMM;
          if (element.Color == "16711680")
            element.SClass = "task_card due p-2";
          else if (element.Color == "45296")
            element.SClass = "task_card due_comp p-2";
          else if (element.Color == "16760832" || element.Color == "45136" || element.DoneCount == "1")
            element.SClass = "task_card task_comp p-2";

        });
      },
        (err) => {
        })
  }

  showpatient(item:any) {
    this.itemselected = item;
    this.itemselectedName=item.DisplayName;
    this.NursingDashBoard= 'Patient Nursing DashBoard';
    this.step = 2;
  }
}
