import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService as BedConfig } from '../services/config.service';
import { DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { BaseComponent } from 'src/app/shared/base.component';
import { ValidationType } from './enum';
import * as Highcharts from 'highcharts';
import { BradenScaleComponent } from 'src/app/shared/braden-scale/braden-scale.component';
import { FallRiskAssessmentComponent } from 'src/app/shared/fall-risk-assessment/fall-risk-assessment.component';
import { PediaFallriskAssessmentComponent } from 'src/app/shared/pedia-fallrisk-assessment/pedia-fallrisk-assessment.component';

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
  selector: 'app-nursingdashboard',
  templateUrl: './nursingdashboard.component.html',
  styleUrls: ['./nursingdashboard.component.scss'],
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
export class NursingdashboardComponent extends BaseComponent implements OnInit, AfterViewInit {
  @ViewChild('timeSlotsContainer', { static: true }) timeSlotsContainer!: ElementRef;
  timeSlots: string[] = [];
  IsBraden = false;
  FetchTaskServicemapeOutputLists: any[] = [];
  FetchVitalGroupsOutputDataLists: any[] = [];
  SurgeryDemographicsDataaList: any[] = [];
  nursingForm: any;
  WardTaskID = 0;
  FetchNursingDashBoardDisplayDataaList: any[] = [];
  FetchNursingDashBoardDisplayDataaList1: any[] = [];
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
  IsHome = true;
  environmentPreventiveActions: any;
  nursingInterventions: any;
  multiDisciplinary: any;
  patientCentered: any;
  OverAllScore: any;
  RiskLevelID: any = '0';
  IsEdit = false;
  selectedInstructionsList: any = [];
  patinfo: any;
  painScoreGraphForm!: FormGroup;
  painScoreHistory: any;
  charAreaSpline!: Highcharts.Chart
  isAreaSplineActive: boolean = false;
  isSplineActive: boolean = true;
  isLineActive: boolean = false;
  isColumnActive: boolean = false;
  activeButton: string = 'spline';
  datesForm: any;
  taskIntervalNameForJustf = "";
  @ViewChild('braden', { static: false }) braden: BradenScaleComponent | undefined;
  @ViewChild('fallrisk', { static: false }) fallrisk: FallRiskAssessmentComponent | undefined;
  @ViewChild('pediafallrisk', { static: false }) pediafallrisk: PediaFallriskAssessmentComponent | undefined;
  IsFallRisk = false;
  IsPediaFallRisk = false;
  showJustificationMandt = false;
  justification = "";
  ContinueNavigation: boolean = false;
  selectedItem: any;

  selectedService: any = '0';
  selectedTaskView: any = '1';

  constructor(
    private fb: FormBuilder,
    public datepipe: DatePipe,
    private router: Router,
    private config: BedConfig
  ) {
    super();
    var d = new Date();
    this.datesForm = this.fb.group({
      fromdate: d,
      todate: d,
      SSN: ['']
    });
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
      EmpNoName: ['', Validators.required],
      EmpName: ['', Validators.required],
      EmpID: ['', Validators.required],
      Department: ['', Validators.required],
      UserName: ['', Validators.required],
      Password: ['', Validators.required]
    });



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

    this.painScoreGraphForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });

    var wm = new Date();
    var d = new Date();
    wm.setMonth(wm.getMonth() - 12);
    this.painScoreGraphForm.patchValue({
      FromDate: wm,
      ToDate: d
    })

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
    sessionStorage.setItem("fromwardnursingdashboard", "false");
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.fetchNursingDashBoardDisplay();
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

    //this.AddDefaultRowForBathData();
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
        this.FetchNursingDashBoardDisplayDataaList = this.FetchNursingDashBoardDisplayDataaList1 = response.FetchNursingDashBoardDisplayDataaList;
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
    //$("#addservice").modal('hide');
  }

  getDetails(slot: any) {
    return this.FetchNursingDashBoardDisplayDataaList.filter((a: any) => a.FrequencyTimeinHHMM == slot);
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

  navigateToVitals(item: any) {
    this.selectedItem = item;
    if (item.TaskID !== '31') {
      const freqTime = new Date(new Date(item.FrquencyDate + " " + item.FrequencyTimeinHHMM)).getTime();
      var now = new Date().getTime();
      if (freqTime > now) {
        now = new Date(now + 2 * 60 * 60 * 1000).getTime();
        if (freqTime > now && !this.ContinueNavigation) {
          this.justification = "";
          this.showJustificationMandt = false;
          this.taskIntervalNameForJustf = item.DisplayName + ":" + item.FrequencyTimeinHHMM + "-" + item.EndTime;
          $("#justificationMsg").modal('show');
          return;
        }
      }
      else {
        now = new Date(now - 2 * 60 * 60 * 1000).getTime();
        if (now < freqTime && !this.ContinueNavigation) {
          this.justification = "";
          this.showJustificationMandt = false;
          $("#justificationMsg").modal('show');
          return;
        }
      }
    }
    this.taskIntervalNameForJustf = "";

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
    if (item.TaskID == "20" && item.DoneCount == "0" && (Number(this.selectedView.AgeValue))>14 && this.selectedView.AgeUOMID=='1') {
      this.NursingInterventionDetails = item;
      this.fetchNursingInterventions();
      this.IsFallRisk = true;
      $("#fallriskassessment").modal('show');
    }
    else if (item.TaskID == "20" && item.DoneCount == "0") {
      this.NursingInterventionDetails = item;
      this.fetchNursingInterventions();
      this.IsPediaFallRisk = true;
      $("#fallriskassessmentPedia").modal('show');
    }
    if (item.TaskID == "22" && item.DoneCount == "0") {
      this.NursingInterventionDetails = item;
      this.IsBraden = true;
      $("#bradenscale").modal('show');
    }
    if (item.TaskID == "14" && item.DoneCount == "0") {
      this.NursingInterventionDetails = item;
      this.FetchPatientNursingInstructions();
      $("#NursingInstruction").modal('show');
    }
  }

  closebraden() {
    this.IsBraden = false;
    $("#bradenscale").modal('hide');
  }

  closefallrisk() {
    this.IsFallRisk = false;
    $("#fallriskassessment").modal('hide');
  }

  closepediafallrisk() {
    this.IsPediaFallRisk = false;
    $("#fallriskassessmentPedia").modal('hide');
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
      element.Remarks = '';
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
            EmpNoName: this.FetchHospitalNurseDataaList[0].EmpNo +"-"+this.FetchHospitalNurseDataaList[0].Fullname,
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
            NurseUserID: response[0].EmpId,
            NurseEmpNo: response[0].UserName
          };
        }
        else if (this.type == ValidationType.SocialWorker) {
          updatedValues = {
            SocialWorkerUserID: response[0].EmpId,
            SocialEmpNo: response[0].UserName
          };
        }
        else if (this.type == ValidationType.Doctor) {
          updatedValues = {
            DoctorUserID: response[0].EmpId,
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
      EmpNoName: ['', Validators.required],
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

  SavePatientBradenScale() {
    this.braden?.SavePatientBradenScale();
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

  openQuickActions() {
    this.patinfo = this.selectedView;
    $("#quickaction_info").modal('show');
  }
  clearPatientInfo() {
    this.patinfo = "";
  }
  closeModal() {
    $("#quickaction_info").modal('hide');
  }
  fetchPainScoreHistory() {
    var FromDate = this.datepipe.transform(this.painScoreGraphForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.painScoreGraphForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    this.config.FetchPainscoreHistory(this.selectedView.IPID, FromDate, ToDate, this.doctorDetails[0].UserId, this.wardID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.painScoreHistory = response.FetchPainscoreHistoryDataList.sort((a: any, b: any) => b.CREATEDATE - a.CREATEDATE);
          this.fillPSChart('line');
          $("#painScoreGraph").modal('show');

        }
      },
        (err) => {

        })
  }
  openPainScoreGraph() {
    this.fetchPainScoreHistory();

  }

  fillPSChart(chartType: any) {
    var highchartOption;
    if (chartType == "column") {
      this.isAreaSplineActive = false;
      this.isSplineActive = false;
      this.isLineActive = false;
      this.isColumnActive = true;
      this.activeButton = 'column';
    }
    else if (chartType == "line") {
      this.isAreaSplineActive = false;
      this.isSplineActive = false;
      this.isLineActive = true;
      this.isColumnActive = false;
      this.activeButton = 'line';
    }
    else if (chartType == "spline") {
      this.isAreaSplineActive = false;
      this.isSplineActive = true;
      this.isLineActive = false;
      this.isColumnActive = false;
      this.activeButton = 'spline';
    }
    else if (chartType == "areaSpline") {
      this.isAreaSplineActive = true;
      this.isSplineActive = false;
      this.isLineActive = false;
      this.isColumnActive = false;
      this.activeButton = 'areaSpline';
    }
    let data: any = {};
    let type = 1;
    if (this.selectedView.PatientType == '2')
      type = 2;
    const painScoreData: any[] = [];

    this.painScoreHistory.forEach((element: any, index: any) => {
      painScoreData.push([element.CREATEDATE, parseFloat(element.PainScoreID)])
    });

    data = [{ name: 'PainScore', data: painScoreData }];

    if (chartType == "column") {
      this.charAreaSpline = Highcharts.chart('chart-ps-line', {
        chart: {
          type: chartType,
          zoomType: 'x'
        },
        title: {
          text: null,
        },
        credits: {
          enabled: false,
        },
        legend: {
          enabled: true,
        },
        yAxis: {
          min: 0,
          title: {
            text: null,
          }
        },
        xAxis: {
          type: 'category',
          min: 0,
          max: 9
        },
        tooltip: {
          headerFormat: `<div>Date: {point.key}</div>`,
          pointFormat: `<div>{series.name}: {point.y}</div>`,
          shared: true,
          useHTML: true,
          valueDecimals: 1,
          crosshairs: [{
            width: 1,
            color: 'Gray'
          }, {
            width: 1,
            color: 'gray'
          }]
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0.5
          }
        },
        series: data,
        scrollbar: {
          enabled: true,
          barBackgroundColor: 'gray',
          barBorderRadius: 7,
          barBorderWidth: 0,
          buttonBackgroundColor: 'gray',
          buttonBorderWidth: 0,
          buttonArrowColor: 'yellow',
          buttonBorderRadius: 7,
          rifleColor: 'yellow',
          trackBackgroundColor: 'white',
          trackBorderWidth: 1,
          trackBorderColor: 'silver',
          trackBorderRadius: 7
        }
      } as any);
    }
    else if (chartType == "areaSpline") {
      this.charAreaSpline = Highcharts.chart('chart-ps-line', {
        chart: {
          type: 'areaspline',
          zoomType: 'x'
        },
        title: {
          text: null,
        },
        credits: {
          enabled: false,
        },
        legend: {
          enabled: true,
        },
        yAxis: {
          min: 0,
          title: {
            text: null,
          }
        },
        xAxis: {
          type: 'category',
          min: 0,
          max: 9
        },
        tooltip: {
          headerFormat: `<div>Date: {point.key}</div>`,
          pointFormat: `<div>{series.name}: {point.y}</div>`,
          shared: true,
          useHTML: true,
          valueDecimals: 1,
          crosshairs: [{
            width: 1,
            color: 'Gray'
          }, {
            width: 1,
            color: 'gray'
          }]
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0.5
          }
        },
        series: data,
        scrollbar: {
          enabled: true,
          barBackgroundColor: 'gray',
          barBorderRadius: 7,
          barBorderWidth: 0,
          buttonBackgroundColor: 'gray',
          buttonBorderWidth: 0,
          buttonArrowColor: 'yellow',
          buttonBorderRadius: 7,
          rifleColor: 'yellow',
          trackBackgroundColor: 'white',
          trackBorderWidth: 1,
          trackBorderColor: 'silver',
          trackBorderRadius: 7
        }
      } as any);
    }
    else if (chartType == "spline") {
      this.charAreaSpline = Highcharts.chart('chart-ps-line', {
        chart: {
          type: 'spline',
          zoomType: 'x'
        },
        title: {
          text: null,
        },
        credits: {
          enabled: false,
        },
        legend: {
          enabled: true,
        },
        yAxis: {
          min: 0,
          title: {
            text: null,
          }
        },
        xAxis: {
          type: 'category',
          min: 0,
          max: 9
        },
        tooltip: {
          headerFormat: `<div>Date: {point.key}</div>`,
          pointFormat: `<div>{series.name}: {point.y}</div>`,
          shared: true,
          useHTML: true,
          valueDecimals: 1,
          crosshairs: [{
            width: 1,
            color: 'Gray'
          }, {
            width: 1,
            color: 'gray'
          }]
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0.5
          }
        },
        series: data,
        scrollbar: {
          enabled: true,
          barBackgroundColor: 'gray',
          barBorderRadius: 7,
          barBorderWidth: 0,
          buttonBackgroundColor: 'gray',
          buttonBorderWidth: 0,
          buttonArrowColor: 'yellow',
          buttonBorderRadius: 7,
          rifleColor: 'yellow',
          trackBackgroundColor: 'white',
          trackBorderWidth: 1,
          trackBorderColor: 'silver',
          trackBorderRadius: 7
        }
      } as any);
    }
    else if (chartType == "line") {
      this.charAreaSpline = Highcharts.chart('chart-ps-line', {
        chart: {
          type: 'line',
          zoomType: 'x'
        },
        title: {
          text: null,
        },
        credits: {
          enabled: false,
        },
        legend: {
          enabled: true,
        },
        yAxis: {
          min: 0,
          title: {
            text: null,
          }
        },
        xAxis: {
          type: 'category',
          min: 0,
          max: 9
        },
        tooltip: {
          headerFormat: `<div>Date: {point.key}</div>`,
          pointFormat: `<div>{series.name}: {point.y}</div>`,
          shared: true,
          useHTML: true,
          valueDecimals: 1,
          crosshairs: [{
            width: 1,
            color: 'Gray'
          }, {
            width: 1,
            color: 'gray'
          }]
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0.5
          }
        },
        series: data,
        scrollbar: {
          enabled: true,
          barBackgroundColor: 'gray',
          barBorderRadius: 7,
          barBorderWidth: 0,
          buttonBackgroundColor: 'gray',
          buttonBorderWidth: 0,
          buttonArrowColor: 'yellow',
          buttonBorderRadius: 7,
          rifleColor: 'yellow',
          trackBackgroundColor: 'white',
          trackBorderWidth: 1,
          trackBorderColor: 'silver',
          trackBorderRadius: 7
        }
      } as any);
    }
  }

  FetchFallRiskView() {
    const fromDate = this.datesForm.get('fromdate').value;
    const todate = this.datesForm.get('todate').value;
    this.config.FetchFallRiskView(this.admissionID, this.datepipe.transform(fromDate, "dd-MMM-yyyy")?.toString(), this.datepipe.transform(todate, "dd-MMM-yyyy")?.toString(), this.doctorDetails[0].UserId, this.wardID, this.hospitalID)
      .subscribe((response: any) => {
        console.log(response);
      },
        (err) => {
        })
  }

  viewFallRisk() {
    $("#savedModal").modal('show');
    this.FetchFallRiskView();
  }

  saveFallRiskAssessment() {
    this.fallrisk?.saveFallRiskAssessment();
  }
  saveFallRiskAssessmentPedia() {
    this.pediafallrisk?.saveFallRiskAssessmentPedia();
  }

  saveJustification() {
    if (this.justification === '') {
      this.showJustificationMandt = true;
      this.ContinueNavigation = false;
    }
    else {
      this.showJustificationMandt = false;
      this.ContinueNavigation = true;
      $("#justificationMsg").modal('hide');
      this.UpdatewardtaskintervalRemarks();
    }

  }
  UpdatewardtaskintervalRemarks() {
    var ackPayload = {
      "AdmissionID": this.admissionID,
      "WardID": this.wardID,
      "TaskID": this.selectedItem.TaskID,
      "EntryDate": this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
      "Remarks": $("#justificationremarks").val(),
      "Hospitalid": this.hospitalID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "FrequencyTime": this.selectedItem.FrequencyTime
    }
    this.config.UpdatewardtaskintervalRemarks(ackPayload).subscribe(response => {
      if (response.Code == 200) {
        this.ContinueNavigation = true;
        this.navigateToVitals(this.selectedItem);
      } else
        this.ContinueNavigation = false;
    })
  }

  filterNurseTasks() {
    if(this.selectedTaskView === '1') 
      this.FetchNursingDashBoardDisplayDataaList = this.FetchNursingDashBoardDisplayDataaList1;
    else if(this.selectedTaskView === '2')
      this.FetchNursingDashBoardDisplayDataaList = this.FetchNursingDashBoardDisplayDataaList1.filter((x:any) => x.DoneCount === '0');
    else if(this.selectedTaskView === '3')
      this.FetchNursingDashBoardDisplayDataaList = this.FetchNursingDashBoardDisplayDataaList1.filter((x:any) => x.DoneCount === '1');

    if (this.selectedService !== '0') {
      this.FetchNursingDashBoardDisplayDataaList = this.FetchNursingDashBoardDisplayDataaList.filter((x:any) => x.TaskID === this.selectedService);
    } 

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
  }

}
