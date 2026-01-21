import { Component, OnInit } from '@angular/core';
import { SuitConfigService } from '../services/suitconfig.service';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { OptionsBoostBlendingValue } from 'highcharts';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientfolderComponent } from 'src/app/shared/patientfolder/patientfolder.component';
import { ScheduleReportsComponent } from '../schedule-reports/schedule-reports.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { PatientfoldermlComponent } from 'src/app/shared/patientfolderml/patientfolderml.component';

declare var $: any;

@Component({
  selector: 'app-physiotherapy-worklist',
  templateUrl: './physiotherapy-worklist.component.html',
  styleUrls: ['./physiotherapy-worklist.component.scss'],
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
export class PhysiotherapyWorklistComponent implements OnInit {
  langData: any;
  hospitalId: any;
  loggedinUserDetails: any;
  tablePatientsForm!: FormGroup;
  examinationDetailsForm!: FormGroup;
  selectedPatientType = "1";
  classEd: string = "fs-7 btn";
  classIp: string = "fs-7 btn";
  classOp: string = "fs-7 btn selected";
  minValue: number = 1;
  maxValue: number = 10;
  radWorklistData: any;
  radWorklistDataF: any;
  patientSelected: boolean = false;
  IsFitForDischarge:boolean=false;
  worklistCount: number = 0;
  selectedPatientData: any;
  showAllergydiv: boolean = false;
  perfDoctor: any;
  PerfDOCID:number = 0;
  perfTechnician: any;
  SavedperfDoctor: any;
  facilityId: any;
  PerfUserID:number = 0;
  startDate: any;
  startTime: any;
  endDate: any;
  endTime: any;
  disableEndExam: boolean = true;
  disableEndExamIcon: boolean = false;
  examCompletedSaveSubmitted: boolean = false;
  FetchRadStatusList: any;
  htmlContentForPreviousResult: any;
  //htmlContent: any;
  trustedUrl: any;
  radiologyPdfDetails: any;
  PatientArrivedMSG: any;
  PatientCancelArrivedMsg: any;
  examCompletedMsg: any;
  totalCount: any = 1;
  currentPage: any = 1;
  RadEndServiceType: any;
  facility: any;
  ValidationMsg: any;
  showNoRecFound: boolean = true;
  errorMessage: any;
  PatientRefuse: any;
  referralAcceptRejectRemarks: string = "";
  sortedGroupedByOrderDate: any = [];
  isRemarksSubmitted: boolean = false;
  selectedSSNSearch: any;
  selectedMobileSearch: any;
  selectedRoomSearch: any;
  activeTab: number = 1;
  number: Number = 0;
  NewOrderSummCountC: number = 0;
  ArrivedSummCountC: number = 0;
  SucessMsg: string = '';
  doctorsList: any;
  PerdoctorsList:any;
  filteredDoctorsList: any;
  classOrderDate: string = "fs-7 btn selected";
  classExamDate: string = "fs-7 btn ";
  classScheduleDate: string = "fs-7 btn ";
  selectedOrderDate: any = "0";
  taskStaus: any;

  constructor(private config: SuitConfigService, private router: Router, private configService: ConfigService, public datepipe: DatePipe, private fb: FormBuilder, private modalService: NgbModal, private modalBuilder: GenericModalBuilder) {
    this.langData = this.configService.getLangData();
    this.loggedinUserDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.RadEndServiceType = this.facility.FacilityName
    if (this.RadEndServiceType === 'ENDOSCOPY')
      this.RadEndServiceType = "Endoscopy";
    else if (this.RadEndServiceType === 'CATH LAB')
      this.RadEndServiceType = "CathLab";
    else
      this.RadEndServiceType = "Radiology";

    if (Object.keys(this.facilityId).length == 0) this.facilityId = "0";
  }

  ngOnInit(): void {
    let taskStatus = 0;
    if (sessionStorage.getItem('navigateToPhysiotheraphyWorklist')) {
      const SSN = sessionStorage.getItem('navigateToPhysiotheraphyWorklist');
      const patientType = sessionStorage.getItem('navigateToPhysiotheraphyWorklistpatientType');
      $('#NationalId').val(SSN);
      // this.selectedPatientType=patientType;
      if (patientType == "3")
        this.selectedPatientType = "3";
      else if (patientType == "2")
        this.selectedPatientType = "2";
      else if (patientType == "1")
        this.selectedPatientType = "1";
      this.patientSelected = false;
  
      if (this.selectedPatientType == "3") {
        this.classEd = "fs-7 btn selected";
        this.classIp = "fs-7 btn";
        this.classOp = "fs-7 btn";
      }
      else if (this.selectedPatientType == "2") {
        this.classEd = "fs-7 btn";
        this.classIp = "fs-7 btn selected";
        this.classOp = "fs-7 btn";
      }
      else if (this.selectedPatientType == "1") {
        this.classEd = "fs-7 btn";
        this.classIp = "fs-7 btn";
        this.classOp = "fs-7 btn selected";
      }
      sessionStorage.removeItem('navigateToPhysiotheraphyWorklistpatientType');
      sessionStorage.removeItem('navigateToPhysiotheraphyWorklist');      
    } else if (sessionStorage.getItem('physiotherapySessionData')) {
      const sessionData = JSON.parse(sessionStorage.getItem('physiotherapySessionData') || '{}');
      taskStatus = sessionData.taskStaus;
      this.IsFitForDischarge = sessionData.isFitForDischarge;
      this.selectedPatientType = sessionData.patientType;
      if (this.selectedPatientType == "3") {
        this.classEd = "fs-7 btn selected";
        this.classIp = "fs-7 btn";
        this.classOp = "fs-7 btn";
      }
      else if (this.selectedPatientType == "2") {
        this.classEd = "fs-7 btn";
        this.classIp = "fs-7 btn selected";
        this.classOp = "fs-7 btn";
      }
      else if (this.selectedPatientType == "1") {
        this.classEd = "fs-7 btn";
        this.classIp = "fs-7 btn";
        this.classOp = "fs-7 btn selected";
      }
      sessionStorage.removeItem('physiotherapySessionData');
    }
    this.initializetablePatientsForm();
    this.initiateExaminationDetailsForm();
    this.FetchRadWorklistData(taskStatus);
    this.fetchRadiologyStatus();
    this.FetchPerfDoctors();
  }

  initializetablePatientsForm() {
    this.tablePatientsForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });
    var wm = new Date();
    var d = new Date();
    //wm.setMonth(wm.getMonth() - 3);   
    d.setDate(d.getDate());
    this.tablePatientsForm.patchValue({
      FromDate: wm,
      ToDate: d
    })
  }
  fetchRadiologyStatus() {
    this.config.fetchRadiologyStatus(this.hospitalId)
      .subscribe((response: any) => {
        this.FetchRadStatusList = response.FetchRadiologyLegendsDataList;
      },
        (err) => {
        })
  }
  fetchRadStatusByValue(TaskStatus: number) {
    // this.clearSearchCriteria();
    this.patientSelected = false;
    this.FetchRadWorklistData(TaskStatus, true);
  }
  initiateExaminationDetailsForm() {
    this.examinationDetailsForm = this.fb.group({
      ProcedureName: [''],
      PerfDoctor: ['', Validators.required],
      PerfDoctorName: ['', Validators.required],
      // PerfTechnician: ['', Validators.required],
      // PerfTechnicianName: ['', Validators.required],
      PerfTechnician: [''],
      PerfTechnicianName: [''],
      StartExam: ['', Validators.required],
      EndExam: [''],
      Remarks: ['']
    });
  }

  FetchRadWorklistDataDisplay(patientType: string) {
    
    
    // if(!this.IsFitForDischarge)
    //   this.IsFitForDischarge=true;
    //  else 
    //  this.IsFitForDischarge=false;

    if (patientType == "3")
      this.selectedPatientType = "3";
    else if (patientType == "2")
      this.selectedPatientType = "2";
    else if (patientType == "1")
      this.selectedPatientType = "1";
    this.patientSelected = false;

    if (this.selectedPatientType == "3") {
      this.classEd = "fs-7 btn selected";
      this.classIp = "fs-7 btn";
      this.classOp = "fs-7 btn";
    }
    else if (this.selectedPatientType == "2") {
      this.classEd = "fs-7 btn";
      this.classIp = "fs-7 btn selected";
      this.classOp = "fs-7 btn";
    }
    else if (this.selectedPatientType == "1") {
      this.classEd = "fs-7 btn";
      this.classIp = "fs-7 btn";
      this.classOp = "fs-7 btn selected";
    }
    this.selectedSSNSearch = '';
    this.selectedMobileSearch = '';
    this.selectedRoomSearch = '';
    $('#Barcode').val('');
    $('#NationalId').val('');
    $('#MobileNo').val('');
    this.radWorklistData = [];   
    this.radWorklistDataF=[];
    this.sortedGroupedByOrderDate=[];
    this.patientSelected = false;   
    // this.initializetablePatientsForm();
    // this.initiateExaminationDetailsForm();
    // this.fetchRadiologyStatus();
    this.FetchRadWorklistData(0);
    
  }

  FetchRadWorklistData(Lstatus: number, showAll: boolean = false) {
    this.taskStaus = Lstatus;
    if (!this.tablePatientsForm.value['FromDate'] || !this.tablePatientsForm.value['ToDate']) {
      return;
    }
    var SSN = $('#NationalId').val();
    var RoomNoID = $('#RoomNoID').val();
    var MobileNo = $('#MobileNo').val();
    // if (SSN == '' && MobileNo == '' && RoomNoID == '' && !showAll) {
    //   this.errorMessage = "Please Enter SSN/MobileNo/Room No. to Fetch the Data"
    //   $("#errorMsg").modal('show');
    //   return;
    // } else {
      if (SSN != '')
        this.selectedSSNSearch = SSN;
      else if (MobileNo != '')
        this.selectedMobileSearch = MobileNo;
      else if (RoomNoID != '')
        this.selectedRoomSearch = RoomNoID;
    //}

    const FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    const inputDate = new Date(this.tablePatientsForm.value['ToDate']);
    const newDate = new Date(inputDate);
    newDate.setDate(inputDate.getDate() + 0);
    const ToDate = this.datepipe.transform(newDate, "dd-MMM-yyyy")?.toString();

    if (this.selectedPatientType == "3") {
      this.classEd = "fs-7 btn selected";
      this.classIp = "fs-7 btn";
      this.classOp = "fs-7 btn";
    }
    else if (this.selectedPatientType == "2") {
      this.classEd = "fs-7 btn";
      this.classIp = "fs-7 btn selected";
      this.classOp = "fs-7 btn";
    }
    else if (this.selectedPatientType == "1") {
      this.classEd = "fs-7 btn";
      this.classIp = "fs-7 btn";
      this.classOp = "fs-7 btn selected";
    }
    if(this.IsFitForDischarge==true){
      this.PerfUserID=this.loggedinUserDetails[0].EmpId;
    }else if(this.PerfDOCID>0){
      this.PerfUserID=this.PerfDOCID;
    }else
    this.PerfUserID=0;
    let payload =
    {
      "SSN": $('#NationalId').val() != "" && $('#NationalId').val() != undefined ? $('#NationalId').val() : "0",
      "MobileNo": $('#MobileNo').val() != "" && $('#MobileNo').val() != undefined ? $('#MobileNo').val() : "0",
      "RoomNo": $('#RoomNoID').val() != "" && $('#RoomNoID').val() != undefined ? $('#RoomNoID').val() : "0",
      "UserID": this.loggedinUserDetails[0].UserId,
      "WorkStationID": this.facilityId,
      "PatientType": this.selectedPatientType,    
      "PerfUserID":this.PerfUserID,//this.IsFitForDischarge==true?this.loggedinUserDetails[0].EmpId:0,
      "FromDate": FromDate,
      "ToDate": ToDate,
      "HospitalID": this.hospitalId,
      "PatientArrivedDateBased": this.selectedOrderDate,
    }
    this.config.FetchnxgTestRequisitionsWithFlowPhysio(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.radWorklistDataF = response.FetchnxgTestRequisitionsWithFlowPhysioDataList;
        this.radWorklistData = this.radWorklistDataF;
        if (Lstatus != 0)
          this.radWorklistData = this.radWorklistData.filter((x: any) => x.Status == Lstatus);
        this.radWorklistData.forEach((element: any, index: any) => {
          element.Class = "worklist_card";
          element.Selected = false;
          if (element.Status <= 2) // Billed
            element.bedClass = "NewOrder";
          else if (element.Status == 3) // Patient Arrived
            element.bedClass = "PatientArrived";
          else if (element.Status == 7) // Examination completed
            element.bedClass = "ExaminationCompleted";
          else if (element.Status >= 5 && element.Status != 7)
            element.bedClass = "ResultVerified";
          else if (element.Status >= 4 && element.Status != 7)
            element.bedClass = "ResultEntered";

          if (element.IsRefused == 'True')
            element.Refuse = "btn btn-main-fill";
          else if (element.IsRefused == '')
            element.Refuse = "btn btn-main-outline";


        });

        // const groupedByOrderDate = this.radWorklistData.reduce((acc: any, current: any) => {
        //   const OrderDate = current.OrderDate.split(' ')[0];
        //   if (!acc[OrderDate]) {
        //     acc[OrderDate] = [];
        //   }
        //   acc[OrderDate].push(current);

        //   return acc;
        // }, {});

        // this.sortedGroupedByOrderDate = Object.entries(groupedByOrderDate)
        //   .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        //   .map(([OrderDate, items]) => ({ OrderDate, items }));

        // if (this.radWorklistData.length > 0) {
        //   this.showNoRecFound = false;
        // } else
        //   this.showNoRecFound = true;

       
        if(this.IsFitForDischarge){
          this.activeTab=3;
          this.filterPhysioRecords(3);
        }else{
          this.filterPhysioRecords(Lstatus);
        }
      }
    },
      (err) => {

      })
  }

  FetchRadWorklistDataAss(Lstatus: number, showAll: boolean = false) {
    if(!this.IsFitForDischarge)
       this.IsFitForDischarge=true;
      else 
      this.IsFitForDischarge=false;
    if (!this.tablePatientsForm.value['FromDate'] || !this.tablePatientsForm.value['ToDate']) {
      return;
    }
    var SSN = $('#NationalId').val();
    var RoomNoID = $('#RoomNoID').val();
    var MobileNo = $('#MobileNo').val();   
      if (SSN != '')
        this.selectedSSNSearch = SSN;
      else if (MobileNo != '')
        this.selectedMobileSearch = MobileNo;
      else if (RoomNoID != '')
        this.selectedRoomSearch = RoomNoID;
    //}

    const FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    const inputDate = new Date(this.tablePatientsForm.value['ToDate']);
    const newDate = new Date(inputDate);
    newDate.setDate(inputDate.getDate() + 1);
    const ToDate = this.datepipe.transform(newDate, "dd-MMM-yyyy")?.toString();

    if (this.selectedPatientType == "3") {
      this.classEd = "fs-7 btn selected";
      this.classIp = "fs-7 btn";
      this.classOp = "fs-7 btn";
    }
    else if (this.selectedPatientType == "2") {
      this.classEd = "fs-7 btn";
      this.classIp = "fs-7 btn selected";
      this.classOp = "fs-7 btn";
    }
    else if (this.selectedPatientType == "1") {
      this.classEd = "fs-7 btn";
      this.classIp = "fs-7 btn";
      this.classOp = "fs-7 btn selected";
    }
    let payload =
    {
      "SSN": $('#NationalId').val() != "" && $('#NationalId').val() != undefined ? $('#NationalId').val() : "0",
      "MobileNo": $('#MobileNo').val() != "" && $('#MobileNo').val() != undefined ? $('#MobileNo').val() : "0",
      "RoomNo": $('#RoomNoID').val() != "" && $('#RoomNoID').val() != undefined ? $('#RoomNoID').val() : "0",
      "UserID": this.loggedinUserDetails[0].UserId,
      "WorkStationID": this.facilityId,
      "PatientType": this.selectedPatientType,
      "PerfUserID":this.IsFitForDischarge==true?this.loggedinUserDetails[0].EmpId:0,
      "FromDate": FromDate,
      "ToDate": ToDate,
      "HospitalID": this.hospitalId,
      "PatientArrivedDateBased": this.selectedOrderDate
    }
    this.config.FetchnxgTestRequisitionsWithFlowPhysio(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.radWorklistDataF = response.FetchnxgTestRequisitionsWithFlowPhysioDataList;
        this.radWorklistData = this.radWorklistDataF;
        if (Lstatus != 0)
          this.radWorklistData = this.radWorklistData.filter((x: any) => x.Status == Lstatus);
        this.radWorklistData.forEach((element: any, index: any) => {
          element.Class = "worklist_card";
          element.Selected = false;
          if (element.Status <= 2) // Billed
            element.bedClass = "NewOrder";
          else if (element.Status == 3) // Patient Arrived
            element.bedClass = "PatientArrived";
          else if (element.Status == 7) // Examination completed
            element.bedClass = "ExaminationCompleted";
          else if (element.Status >= 5 && element.Status != 7)
            element.bedClass = "ResultVerified";
          else if (element.Status >= 4 && element.Status != 7)
            element.bedClass = "ResultEntered";

          if (element.IsRefused == 'True')
            element.Refuse = "btn btn-main-fill";
          else if (element.IsRefused == '')
            element.Refuse = "btn btn-main-outline";


        });

      

        this.filterPhysioRecords(Lstatus);

      }
    },
      (err) => {

      })
  }

  onSSNEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.patientSelected = false;
      this.FetchRadWorklistData(0);
    }
  }
  onRoomNoEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.patientSelected = false;
      this.FetchRadWorklistData(0);
    }
  }

  clearSearchCriteria() {
    this.PerfUserID=0;
    this.PerfDOCID=0;
    this.IsFitForDischarge=false;
    this.selectedSSNSearch = '';
    this.selectedMobileSearch = '';
    this.selectedRoomSearch = '';
    $('#Barcode').val('');
    $('#NationalId').val('');
    $('#MobileNo').val('');
    this.radWorklistData = [];
    window.location.reload();
    this.patientSelected = false;
    //this.FetchRadWorklistData(0);
    this.initializetablePatientsForm();
    this.initiateExaminationDetailsForm();
    this.fetchRadiologyStatus();
    this.FetchPerfDoctors();
  }

  fetchPanicwithdates(filter: any) {
    if (filter === "M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() - 1);
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "3M") {

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 3);
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "6M") {

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 6);
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "1Y") {

      var wm = new Date();
      wm.setMonth(wm.getMonth() - 12);
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "W") {

      var d = new Date();
      d.setDate(d.getDate() - 7); // Subtract 7 days for the past week.
      var wm = d;
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    } else if (filter === "T") {

      var d = new Date();
      d.setDate(d.getDate()); // Subtract 7 days for the past week.
      var wm = d;
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    else if (filter === "Y") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      this.tablePatientsForm.patchValue({
        FromDate: d,
        ToDate: d,
      });
    }
    this.patientSelected = false;
    this.FetchRadWorklistData(0);
  }

  onDateChange() {
    this.patientSelected = false;
    this.FetchRadWorklistData(0);
  }

  loadPreviousPageWorklistData() {
    if (this.minValue != 1) {
      this.minValue = this.minValue - 10;
      this.maxValue = this.maxValue - 10;
      this.patientSelected = false;
      this.FetchRadWorklistData(0);
    }
  }

  loadNextPageWorklistData() {
    if (Number(this.worklistCount) >= Number(this.maxValue)) {
      this.minValue = this.minValue + 10;
      this.maxValue = this.maxValue + 10;
      this.patientSelected = false;
      this.FetchRadWorklistData(0);
    }
  }

  loadRadOrderData(wrk: any) {
    this.radWorklistData.forEach((element: any, index: any) => {
      if (element.TestOrderID == wrk.TestOrderID && element.TestOrderItemID == wrk.TestOrderItemID && element.Class == "worklist_card") {
        element.Class = "worklist_card active";
      }
      else {
        element.Class = "worklist_card";
      }


      element.SampleStatus = parseInt(element.Status);
      if (element.ScheduleID != '' && element.ScheduleID != '0') {
        element.ScheduledClass = "collected custom_tooltip custom_tooltip_left text-center active";
      }
      else {
        element.ScheduledClass = "collected custom_tooltip custom_tooltip_left text-center";
      }
      if (element.SampleStatus >= 3) {
        element.PatientArrivedClass = "collected custom_tooltip custom_tooltip_left text-center active";
      }
      else {
        element.PatientArrivedClass = "collected custom_tooltip custom_tooltip_left text-center";
      }
      if (element.SampleStatus > 3) {
        element.EndoscopyClass = "ted custom_tooltip custom_tooltip_left text-center";
      }
      else {
        element.EndoscopyClass = "ted collected custom_tooltip custom_tooltip_left text-center";
      }
      if (element.ExamEndDateTime != null && element.ExamEndDateTime != "") {
        element.ExamCompletedClass = "collected custom_tooltip custom_tooltip_left text-center active";
      }
      else {
        element.ExamCompletedClass = "collected custom_tooltip custom_tooltip_left text-center";
      }
      if (element.PatientPreprocAssID != "" && element.SampleStatus >= 3) {
        element.EndoscopyClass = "ted custom_tooltip custom_tooltip_left text-center";
      }
      else {
        element.EndoscopyClass = "ted collected custom_tooltip custom_tooltip_left text-center";
      }
    });
    this.selectedPatientData = wrk;
    this.selectedPatientData.expand = !this.selectedPatientData.expand;
    this.patientSelected = true;

    if (Number(wrk.Status == 7)) {

      this.startDate = moment(wrk.ExamStartDateTime).format('DD-MMM-yyyy');// this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
      this.startTime = moment(wrk.ExamStartDateTime).format('HH:mm:ss');
      this.disableEndExam = false;
      this.examinationDetailsForm.get('StartExam')?.setValue(this.startDate + " " + this.startTime);

      this.endDate = moment(wrk.ExamEndDateTime).format('DD-MMM-yyyy');
      this.endTime = moment(wrk.ExamEndDateTime).format('HH:mm:ss');
      this.examinationDetailsForm.get('EndExam')?.setValue(this.endDate + " " + this.endTime);
    }


    // if (Number(wrk.Status >= 4 && wrk.Status != 7) && this.selectedPatientData.expand)
    //   this.FetchSaveRadiologyResults(wrk.TestOrderID, wrk.TestOrderItemID, wrk.TestID, wrk.PatientID, wrk.IPID, wrk.PatientType);
    // else
    //   this.htmlContentForPreviousResult = '';
  }

  openAllergyPopup() {
    this.showAllergydiv = true;
  }



  ChangeRadiologyPatientArrivedStatus() {
    this.selectedPatientData.PatientArrivedClass = "collected custom_tooltip custom_tooltip_left text-center active";
    let payload = {
      "ProcOrderID": this.selectedPatientData.TestOrderID,
      "ProcOrderItemID": this.selectedPatientData.TestOrderItemID,
      "ProcedureID": this.selectedPatientData.TestID,
      "Sequence": this.selectedPatientData.Sequence,
      "UserID": this.loggedinUserDetails[0].UserId,
      "WorkStationID": this.facilityId,
      "Status": this.selectedPatientData.SampleStatus < 3 ? "3" : "2",
      "Remarks": "",
      "HospitalID": this.hospitalId
    }
    this.config.changePatientArrivedStatus(payload).subscribe((response) => {
      if (response.Code == 200) {
        if (this.selectedPatientData.SampleStatus < 3)
          this.PatientCancelArrivedMsg = 'Patient Arrived Successfully';
        if (this.selectedPatientData.SampleStatus >= 3)
          this.PatientCancelArrivedMsg = 'Cancel Patient Arrived Successfully';

        $("#PatientArrivedMsg").modal('show');

        setTimeout(() => {
          $("#PatientArrivedMsg").modal('hide');
          this.ReloadRadOrderData();
        }, 1000);
      }
    },
      (err) => {

      })
  }
  openPatientArrivedPopUp(status: any) {
    // if ((this.selectedPatientData.ScheduleID === '' || this.selectedPatientData.ScheduleID === '0') && this.selectedPatientData.PatientType != '2') {
    //   this.errorMessage = "Please book appointment for the patient."
    //   $("#errorMsg").modal('show');
    //   return;
    // }
    if (Number(status) > 3) {
    }
    else if (Number(status) < 3) {
      this.PatientArrivedMSG = 'Do you want to change status as Patient Arrived?';
      $("#patientArrivedConfirmationPopup").modal('show');
    } else {
      this.PatientArrivedMSG = 'Do you want to Cancel Patient Arrived status?';
      $("#patientArrivedConfirmationPopup").modal('show');
    }

  }
  openExaminationDetailsPopup(status: any, TestOrderItemID: any) {
    if (Number(status) > 3 && Number(status) != 7) {

    }
    else if (Number(status) < 3) {
      $("#validateSampleNumberMsg").modal('show');
    } else {
      $("#examinationDetails").modal('show');
      // this.startExam();
      this.examinationDetailsForm.patchValue({
        ProcedureName: this.selectedPatientData?.ProcedureName
        // PerfDoctor: [''],
        // PerfTechnician: [''],
        // Remarks: [''],
        // ExamStartDatetime: [''],
        // ExamEndDatetime: ['']
      })
      if (this.selectedPatientData?.ExamStartDateTime != null) {
        this.startDate = moment(this.selectedPatientData?.ExamStartDateTime).format('DD-MMM-yyyy');// this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
        this.startTime = moment(this.selectedPatientData?.ExamStartDateTime).format('HH:mm:ss');
        this.disableEndExam = false;
        this.examinationDetailsForm.get('StartExam')?.setValue(this.startDate + " " + this.startTime);

      } else {
        this.startDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
        this.startTime = this.datepipe.transform(new Date(), "HH:mm:ss")?.toString();
        this.disableEndExam = true;
        this.examinationDetailsForm.get('StartExam')?.setValue(this.startDate + " " + this.startTime);
      }

      this.fetchPerformingDoctors();
      this.fetchPerformingTechnician();
      this.FetchTestPerformingDoctors(TestOrderItemID);
    }
  }
  fetchPerformingDoctors() {
    this.config.fetchRadiologyPerfDoctor(this.loggedinUserDetails[0].UserId, this.facilityId, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        this.perfDoctor = response.FetchRadiologyPerfDocDataaList;
      }
    },
      (err) => {

      })
  }

  FetchTestPerformingDoctors(TestOrderItemID: any) {
    this.config.FetchTestPerformingDoctors(TestOrderItemID, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        this.SavedperfDoctor = response.FetchTestPerformingDoctorsDataLists;
        this.SavedperfDoctor.forEach((element: any, index: any) => {
          if (element.IsTechnician == true) {
            this.examinationDetailsForm.patchValue({
              PerfTechnician: element.DoctorID,
              PerfTechnicianName: element.Doctorname,
            })
          } else {
            this.examinationDetailsForm.patchValue({
              PerfDoctor: element.DoctorID,
              PerfDoctorName: element.Doctorname,
            })
          }
          // if (element.TestOrderID == wrk.TestOrderID && element.TestOrderItemID == wrk.TestOrderItemID && element.Class == "worklist_card") {
          //   element.Class = "worklist_card active";
          // }
          // else {
          //   element.Class = "worklist_card";
          // }       
        });
      }
    },
      (err) => {

      })
  }

  fetchPerformingTechnician() {
    this.config.fetchRadiologyTechnician(this.loggedinUserDetails[0].UserId, this.facilityId, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        this.perfTechnician = response.FetchRadiologyTechnicianDataList;
      }
    },
      (err) => {

      })
  }

  onPerfDoctorChange(event: any) {
    this.examinationDetailsForm.get('PerfDoctorName')?.setValue(event.target.options[event.target.options.selectedIndex].text);
  }

  onPerfTechnicianChange(event: any) {
    this.examinationDetailsForm.get('PerfTechnicianName')?.setValue(event.target.options[event.target.options.selectedIndex].text);
  }

  startExam() {
    this.startDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
    this.startTime = this.datepipe.transform(new Date(), "HH:mm:ss")?.toString();
    this.disableEndExam = false;
    this.examinationDetailsForm.get('StartExam')?.setValue(this.startDate + " " + this.startTime);
    let endExamPayload = {
      "orderitemid": this.selectedPatientData.TestOrderItemID,
      "ExamStartDateTime": this.startDate + " " + this.startTime,
      "ExamEndDateTime": null,
      "TechnicianRemarks": this.examinationDetailsForm.get('Remarks')?.value,
      "UserID": this.loggedinUserDetails[0].UserId,
      "WorkStationID": this.facilityId,
      "HospitalID": this.hospitalId
    }
    this.config.changeEndDateTimeStatus(endExamPayload).subscribe((response) => {
      if (response.Code == 200) {
        this.examCompletedMsg = 'Examinationation started Successfully';
        $("#examCompletedMsg").modal('show');
        this.ReloadRadOrderData();
      }
    },
      (err) => {

      })

  }

  endExam() {
    this.examCompletedSaveSubmitted = true;
    if (this.examinationDetailsForm.valid) {
      this.endDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
      this.endTime = this.datepipe.transform(new Date(), "HH:mm:ss")?.toString();
      this.examinationDetailsForm.get('EndExam')?.setValue(this.endDate + " " + this.endTime);
      this.disableEndExamIcon = true;
      this.selectedPatientData.ExamCompletedClass = "collected custom_tooltip custom_tooltip_left text-center active";
      let endExamPayload = {
        "orderitemid": this.selectedPatientData.TestOrderItemID,
        "ExamStartDateTime": this.startDate + " " + this.startTime,
        "ExamEndDateTime": this.endDate + " " + this.endTime,
        "TechnicianRemarks": this.examinationDetailsForm.get('Remarks')?.value,
        "UserID": this.loggedinUserDetails[0].UserId,
        "WorkStationID": this.facilityId,
        "HospitalID": this.hospitalId
      }

      this.config.changeEndDateTimeStatus(endExamPayload).subscribe((response) => {
        if (response.Code == 200) {
          this.saveExmainationCompleted();
        }
      },
        (err) => {

        })
    }
  }

  saveExmainationCompleted() {
    this.examCompletedSaveSubmitted = true;
    if (this.examinationDetailsForm.valid) {
      let endExamPayload = {
        "orderitemid": this.selectedPatientData?.TestOrderItemID,
        "ExamStartDateTime": this.startDate + " " + this.startTime,
        "ExamEndDateTime": this.endDate + " " + this.endTime,
        "TechnicianRemarks": this.examinationDetailsForm.get('Remarks')?.value,
        "UserID": this.loggedinUserDetails[0].UserId,
        "WorkStationID": this.facilityId,
        "HospitalID": this.hospitalId,
        "Cancellation": "0",
        "Status": "7",
        "ItemXMLDetails": [
          {
            "TOIID": this.selectedPatientData?.TestOrderItemID,
            "DID": this.examinationDetailsForm.get('PerfDoctor')?.value,
            "DNAME": this.examinationDetailsForm.get('PerfDoctorName')?.value,
            "TID": 0,//this.examinationDetailsForm.get('PerfTechnician')?.value,
            "TNAME": "",//this.examinationDetailsForm.get('PerfTechnicianName')?.value,
          }
        ]
      }
      this.config.changeEndDateTimeFinalSaveStatus(endExamPayload).subscribe((response) => {
        if (response.Code == 200) {
          this.examCompletedMsg = 'Examination Completed Successfully';
          $("#examCompletedMsg").modal('show');
          this.ReloadRadOrderData();
        }
      },
        (err) => {

        })
    }
  }



  cancelSurgeryRequest(selectedPatientData: any) {
    this.PatientRefuse = selectedPatientData;
    $("#acceptRejectRemarks").modal('show');
    //$("#cancelSurgeryRequestConfirmationPopup").modal("show");
  }
  clearRefRemarks() {
    this.referralAcceptRejectRemarks = "";
  }


  UpdatePhysiotherapyOrderRefuse() {
    if(this.referralAcceptRejectRemarks==''){
      return;
    }
    const payload = {
      "TestOrderID": this.selectedPatientData?.TestOrderID,
      "TestOrderItemID": this.selectedPatientData?.TestOrderItemID,
      "IsRefused": true,
      "UserID": this.loggedinUserDetails[0].UserId,
      "WorkStationID": this.facilityId,
      "HospitalID": this.hospitalId,
      "RefuseRemarks": this.referralAcceptRejectRemarks
    };
    this.config.UpdatePhysiotherapyOrderRefuse(payload).subscribe((response) => {
      if (response.Code === 200) {
        this.examCompletedMsg = 'Patient Refused Successfully';
        this.PatientRefuse='';
        $("#acceptRejectRemarks").modal('hide');
        $("#examCompletedMsg").modal('show');
        this.ReloadRadOrderData();
      }
    },
      (err) => {
        console.log(err)
      });
  }


  CancelExmainationCompleted() {
    this.examCompletedSaveSubmitted = true;
    if (this.examinationDetailsForm.valid) {
      let endExamPayload = {
        "orderitemid": this.selectedPatientData?.TestOrderItemID,
        "ExamStartDateTime": this.startDate + " " + this.startTime,
        "ExamEndDateTime": this.startDate + " " + this.startTime,
        "TechnicianRemarks": this.examinationDetailsForm.get('Remarks')?.value,
        "UserID": this.loggedinUserDetails[0].UserId,
        "WorkStationID": this.facilityId,
        "HospitalID": this.hospitalId,
        "Cancellation": "1",
        "Status": "3",
        "ItemXMLDetails": ''
      }
      this.config.changeEndDateTimeFinalSaveStatus(endExamPayload).subscribe((response) => {
        if (response.Code == 200) {
          this.examCompletedMsg = 'Exam Details Cancelled Successfully';
          $("#examCompletedMsg").modal('show');
          this.ReloadRadOrderData();
        }
      },
        (err) => {

        })
    }
  }

  ReloadRadOrderData() {

    var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    // var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(new Date(new Date(this.tablePatientsForm.value['ToDate']).setDate(new Date().getDate() + 1)), "dd-MMM-yyyy")?.toString();

    if (this.selectedPatientType == "3") {
      this.classEd = "fs-7 btn selected";
      this.classIp = "fs-7 btn";
      this.classOp = "fs-7 btn";
    }
    else if (this.selectedPatientType == "2") {
      this.classEd = "fs-7 btn";
      this.classIp = "fs-7 btn selected";
      this.classOp = "fs-7 btn";
    }
    else if (this.selectedPatientType == "1") {
      this.classEd = "fs-7 btn";
      this.classIp = "fs-7 btn";
      this.classOp = "fs-7 btn selected";
    }

    if(this.selectedSSNSearch!='')
      $('#NationalId').val(this.selectedSSNSearch);
    else  if(this.selectedMobileSearch!='')
      $('#MobileNo').val(this.selectedMobileSearch);
    else  if(this.selectedRoomSearch!='')
      $('#RoomNoID').val(this.selectedRoomSearch);

    let payload =
    {
      "SSN": $('#NationalId').val() != "" && $('#NationalId').val() != undefined ? $('#NationalId').val() : "0",
      "MobileNo": $('#MobileNo').val() != "" && $('#MobileNo').val() != undefined ? $('#MobileNo').val() : "0",
      "RoomNo": $('#RoomNoID').val() != "" && $('#RoomNoID').val() != undefined ? $('#RoomNoID').val() : "0",
      "UserID": this.loggedinUserDetails[0].UserId,
      "WorkStationID": this.facilityId,
      "PatientType": this.selectedPatientType,
      "PerfUserID":this.loggedinUserDetails[0].EmpId,
      "FromDate": FromDate,
      "ToDate": ToDate,
      "HospitalID": this.hospitalId,
      "PatientArrivedDateBased": this.selectedOrderDate,
    }
    this.config.FetchnxgTestRequisitionsWithFlowPhysio(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.radWorklistData = response.FetchnxgTestRequisitionsWithFlowPhysioDataList;
        //this.worklistCount = response.FetchLabWorklistDisplaycOutputLists[0].TCount;
        this.radWorklistData.forEach((element: any, index: any) => {
          element.Class = "worklist_card";
          element.Selected = false;
          if (element.TestOrderID == this.selectedPatientData.TestOrderID && element.TestOrderItemID == this.selectedPatientData.TestOrderItemID) {
            element.Class = "worklist_card active";
          }
          else {
            element.Class = "worklist_card";
          }
          element.SampleStatus = parseInt(element.Status);
          if (element.ScheduleID != '') {
            element.ScheduledClass = "collected custom_tooltip custom_tooltip_left text-center active";
          }
          else {
            element.ScheduledClass = "collected custom_tooltip custom_tooltip_left text-center";
          }
          if (element.SampleStatus >= 3) {
            element.PatientArrivedClass = "collected custom_tooltip custom_tooltip_left text-center active";
          }
          else {
            element.PatientArrivedClass = "collected custom_tooltip custom_tooltip_left text-center";
          }
          if (element.SampleStatus > 3) {
            element.EndoscopyClass = "ted custom_tooltip custom_tooltip_left text-center";
          }
          else {
            element.EndoscopyClass = "ted collected custom_tooltip custom_tooltip_left text-center";
          }
          if (element.SampleStatus >= 7) {
            element.ExamCompletedClass = "collected custom_tooltip custom_tooltip_left text-center active";
          }
          else {
            element.ExamCompletedClass = "collected custom_tooltip custom_tooltip_left text-center";
          }
          if (element.Status <= 2) // Billed
            element.bedClass = "NewOrder";
          else if (element.Status == 3) // Patient Arrived
            element.bedClass = "PatientArrived";
          else if (element.Status == 7) // Examination completed
            element.bedClass = "ExaminationCompleted";
          else if (element.Status >= 5 && element.Status != 7)
            element.bedClass = "ResultVerified";
          else if (element.Status >= 4 && element.Status != 7)
            element.bedClass = "ResultEntered";

          if (element.IsRefused == 'True')
            element.Refuse = "btn btn-main-fill";
          else if (element.IsRefused == '')
            element.Refuse = "btn btn-main-outline";


        });
        // const groupedByOrderDate = this.radWorklistData.reduce((acc: any, current: any) => {
        //   const OrderDate = current.OrderDate.split(' ')[0];
        //   if (!acc[OrderDate]) {
        //     acc[OrderDate] = [];
        //   }
        //   acc[OrderDate].push(current);

        //   return acc;
        // }, {});

        // this.sortedGroupedByOrderDate = Object.entries(groupedByOrderDate)
        //   .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        //   .map(([OrderDate, items]) => ({ OrderDate, items }));

        var updatedPatientData = this.radWorklistData.filter((x: any) => x.TestOrderID == this.selectedPatientData.TestOrderID && x.TestOrderItemID == this.selectedPatientData.TestOrderItemID);
        this.selectedPatientData = updatedPatientData[0];
        this.patientSelected = true;
        $("#examinationDetails").modal('hide');

        this.filterPhysioRecords(this.activeTab);
      }
    },
      (err) => {

      })


  }
  navigateToPhysiotherapyResultEntry(selectedPatientData: any) {
    sessionStorage.setItem('physiotherapySessionData', JSON.stringify({
      patientType: this.selectedPatientType,
      isFitForDischarge: this.IsFitForDischarge,
      taskStaus: this.taskStaus
    }));
    if (Number(this.selectedPatientData.Status) >= 4 || Number(this.selectedPatientData.Status) == 7) {
      sessionStorage.setItem("selectedPatientData", JSON.stringify(selectedPatientData));
      this.router.navigate(['/suit/physiotherapy-resultentry']);
    }
    else {
      if (this.selectedPatientData?.ExamStartDateTime != null) {
        sessionStorage.setItem("selectedPatientData", JSON.stringify(selectedPatientData));
        this.router.navigate(['/suit/physiotherapy-resultentry']);
      } else {
        this.ValidationMsg = "Please Start/End Examination before proceeding to Enter Results";
        $("#validationResultEntryMsg").modal('show');
      }

    }
  }

  FetchSaveRadiologyResults(TestOrderID: any, TestOrderItemID: any, TestID: any, PatientID: any, IPID: any, PatientType: any) {
    this.config.FetchSaveRadiologyResults(TestOrderID, TestOrderItemID, TestID, PatientID, IPID, PatientType, this.loggedinUserDetails[0].UserId, 3434, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        if (Number(this.selectedPatientData.Status) <= 4) {
          this.htmlContentForPreviousResult = response.FetchSaveRadiologyResultsDataList[0].ExtValue;
        }
        else {
          this.htmlContentForPreviousResult = response.FetchSaveRadiologyResultsDataList[0].ExtValue;
        }
      }
    },
      (err) => {

      })
  }

  RadioLogyReportPrintPDF(selectedPatientData: any) {
    if (selectedPatientData.SampleStatus >= 4 && selectedPatientData.SampleStatus != 7) {
      this.config.fetchRadReportGroupPDF(this.selectedPatientData.RegCode, this.selectedPatientData.TestOrderItemID, this.selectedPatientData.TestOrderID,this.loggedinUserDetails[0].UserId, this.hospitalId).subscribe((response) => {
        if (response.Status === "Success") {
          this.radiologyPdfDetails = response;
          this.trustedUrl = response?.FTPPATH
          this.showModal()
        }
      },
        (err) => {

        })
    }
  }
  showModal(): void {
    $("#reviewAndPayment").modal('show');
  }

  navigateToEndoscopyForm(item: any) {
    if (Number(this.selectedPatientData.Status) >= 3) {
      this.config.FetchBabyInfoEndo(item.IPID, this.loggedinUserDetails[0].UserId, item.RoomID, this.hospitalId).subscribe((response) => {
        if (response.Status === "Success") {
          sessionStorage.setItem("InPatientDetails", JSON.stringify(response.FetchBedsFromWardDataList[0]));
          sessionStorage.setItem("homescreen", "suit");
          sessionStorage.setItem("FromRadiology", "true");
          this.router.navigate(['/ward/endoscopy']);
        }
      },
        (err) => {

        })
    } else {
      this.ValidationMsg = "Patient not Arrived";
      $("#validationResultEntryMsg").modal('show');
    }

  }

  handlePageChange(newPage: any) {
    this.minValue = newPage.min > 0 ? newPage.min + 1 : newPage.min;
    this.maxValue = newPage.max;
    this.FetchRadWorklistData(0);
  }

  navigateEforms(selectedPatientData: any) {
    sessionStorage.setItem("selectedView", JSON.stringify(selectedPatientData));
    sessionStorage.setItem("PatientID", selectedPatientData.PatientID);
    sessionStorage.setItem("PatientDetails", JSON.stringify(selectedPatientData));
    sessionStorage.setItem("ssnEForms", selectedPatientData.SSN);
    this.router.navigate(['/shared/patienteforms'], { state: { ssn: selectedPatientData.SSN } });
  }
  navigateToProcedureScheduler(wrk: any) {
    sessionStorage.setItem("fromPhysiotherapy", "true");
    sessionStorage.setItem("PhysiotherapyPatientData", JSON.stringify(wrk));
    this.router.navigate(['/frontoffice/procedureappointment']);
  }
  preventDot(event: any): void {
    if (event.key === '.') {
      event.preventDefault();
    }
  }

  filterPhysioRecords(status: number) {
    this.activeTab = status;
    var phyorders = this.radWorklistData;
    this.NewOrderSummCountC=phyorders.filter((x:any) => Number(x.Status) <= 2).length;
    this.ArrivedSummCountC=phyorders.filter((x:any) => Number(x.Status) >= 3).length;
    if(status <= 2) {
      phyorders = phyorders.filter((x:any) => Number(x.Status) <= 2);
      //this.NewOrderSummCountC=phyorders.length;
    }
    else {
      //phyorders = phyorders.filter((x:any) => Number(x.Status) >= 3 && x.PatientArrivalDoneBy == this.loggedinUserDetails[0].UserId);
      phyorders = phyorders.filter((x:any) => Number(x.Status) >= 3);
      //this.ArrivedSummCountC=phyorders.length;
    }
    //const groupedByOrderDate:any;const OrderDate
    if(this.selectedOrderDate=="0"){
      const groupedByOrderDate = phyorders.reduce((acc: any, current: any) => {
        const OrderDate = current.OrderDate.split(' ')[0];
        if (!acc[OrderDate]) {
          acc[OrderDate] = [];
        }
        acc[OrderDate].push(current);
  
        return acc;
      }, {});

      this.sortedGroupedByOrderDate = Object.entries(groupedByOrderDate)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([OrderDate, items]) => ({ OrderDate, items }));
    }
    if(this.selectedOrderDate=="1"){
      const groupedByOrderDate = phyorders.reduce((acc: any, current: any) => {
        const OrderDate = current.ExamStartDateTime.split(' ')[0];
        if (!acc[OrderDate]) {
          acc[OrderDate] = [];
        }
        acc[OrderDate].push(current);
  
        return acc;
      }, {});

      this.sortedGroupedByOrderDate = Object.entries(groupedByOrderDate)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([OrderDate, items]) => ({ OrderDate, items }));
    }

    if(this.selectedOrderDate=="2"){
      const groupedByOrderDate = phyorders.reduce((acc: any, current: any) => {
        const OrderDate = current.ScheduleDate.split(' ')[0];
        if (!acc[OrderDate]) {
          acc[OrderDate] = [];
        }
        acc[OrderDate].push(current);
  
        return acc;
      }, {});

      this.sortedGroupedByOrderDate = Object.entries(groupedByOrderDate)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([OrderDate, items]) => ({ OrderDate, items }));
    }
  

   

    if (this.radWorklistData.length > 0) {
      this.showNoRecFound = false;
    } else
      this.showNoRecFound = true;
    if (this.selectedPatientData) {
      this.loadRadOrderData(this.selectedPatientData);
    }
  }

  openEform(wrk: any) {
    wrk.AdmissionID = wrk.IPID;
    sessionStorage.setItem("InPatientDetails", JSON.stringify(wrk));
    sessionStorage.setItem("selectedView", JSON.stringify(wrk));
    sessionStorage.setItem("fromPhysiotherapy", "true");
    sessionStorage.setItem('selectedTemplateId', '119');
    sessionStorage.setItem("selectedPatientAdmissionId", wrk.IPID);
    this.router.navigate(['/templates']);
  }
  getTasksCount(TaskStatus: any) {
    if (!this.radWorklistDataF) {
      return 0;
    }
    return this.radWorklistDataF.filter((e: any) => e.Status == TaskStatus).length;
  }
  openPatientSummary1(item: any, event: any) {
      event.stopPropagation();
      sessionStorage.setItem("PatientDetails", JSON.stringify(item));   
      item.Bed=item.BedName;
      sessionStorage.setItem("selectedView", JSON.stringify(item));
      sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
      sessionStorage.setItem("PatientID", item.PatientID);
      sessionStorage.setItem("SummaryfromCasesheet", "true");
      sessionStorage.setItem("FromPhysioTherapyWorklist", "true");
  
      const options: NgbModalOptions = {
        windowClass: 'vte_view_modal'
      };
      const modalRef = this.modalService.open(PatientfoldermlComponent, options);
      modalRef.componentInstance.readonly = true;
    }

    isAnyDoctorSelected(): boolean {
      return this.sortedGroupedByOrderDate?.some((group: any) =>
        group.items?.some((item: any) => item.selectedforDoctor)
      );
    }

  FetchPerfDoctor() {
    this.config.fetchRadiologyPerfDoctor(this.loggedinUserDetails[0].UserId, this.facilityId, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        this.doctorsList = this.perfDoctor= this.filteredDoctorsList =  response.FetchRadiologyPerfDocDataaList;

        $("#EmployeeHospitalLocations").modal('show');
      }
    },
      (err) => {

      })
  }
  FetchPerfDoctors() {
    this.config.fetchRadiologyPerfDoctor(this.loggedinUserDetails[0].UserId, this.facilityId, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        this.PerdoctorsList = this.perfDoctor= this.filteredDoctorsList =  response.FetchRadiologyPerfDocDataaList;       
      }
    },
      (err) => {

      })
  }

  onPerfDoctorChangeD(event: any) {
    this.PerfDOCID = event.target.value;    
    this.FetchRadWorklistData(0);
  }

  selectDoctor(loc: any) {
    loc.selected = !loc.selected;
  }

  SaveTestPerformingDoctors() {
    let selectedDocs = this.perfDoctor.filter((x: any) => x.selected);
    let selectedItems = this.sortedGroupedByOrderDate
      ?.flatMap((group: any) => group.items?.filter((item: any) => item.selectedforDoctor))
      .map((item: any) => item.TestOrderItemID);

    let empDocxml = selectedDocs.flatMap((doc: any) =>
      selectedItems.map((toiid: any) => ({
        "DID": doc.DOCID,
        "DNAME": doc.DoctorName,
        "TOIID": toiid
      }))
    );

    var payload = {
      "IsTechnician": "0",
      "UserID": this.loggedinUserDetails[0].UserId,
      "WorkStationID": this.facilityId,
      "HospitalID": this.hospitalId,
      "ItemXMLDetails": empDocxml
    }
    this.config.SaveTestPerformingDoctors(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.SucessMsg = "Performing Doctor mapped successfully";
        $("#EmployeeHospitalLocations").modal('hide');
        $("#SucessMsg").modal('show');
        this.FetchRadWorklistData(0);
      }
    },
      (err) => {

      })
  }
  closeEmpMapLocation() {
    $("#EmployeeHospitalLocations").modal('hide');
  }

  printPhysiotherapySchedule(wrk: any) {
    if(wrk.ScheduleID != '' && wrk.ScheduleID !='0') {
      this.config.printPhysiotherapySchedule(wrk.ScheduleID, this.loggedinUserDetails[0].UserId, this.facilityId, this.hospitalId).subscribe((response) => {
        if (response.Status === "Success") {
          this.radiologyPdfDetails = response;
          this.trustedUrl = response?.FTPPATH
          $("#reviewAndPayment").modal('show');
        }
      },
        (err) => {
  
        })
    }
  }

  openSchedulerReport() {
    const options: NgbModalOptions = {
      windowClass: 'vte_view_modal'
    };
    const modalref = this.modalBuilder.openModal(ScheduleReportsComponent, {
      readonly: true
    },options);
  }

  filterDoctors(event: any) {
    this.filteredDoctorsList = this.doctorsList.filter((doctor: any) =>
      doctor.DoctorName.toLowerCase().includes(event.target.value.toLowerCase())
    );
  }
  FetchRadWorklistDataDisplayOrderDate(Type: string) {
    if (Type == "0")
      this.selectedOrderDate = "0";
    else if (Type == "1")
      this.selectedOrderDate = "1";  
    else if (Type == "2")
      this.selectedOrderDate = "2";  


    if (Type == "0") {
      this.classOrderDate = "fs-7 btn selected";
      this.classExamDate = "fs-7 btn";     
      this.classScheduleDate = "fs-7 btn";  
    }
    else if (Type == "1") {
      this.classOrderDate = "fs-7 btn";
      this.classExamDate = "fs-7 btn selected";   
      this.classScheduleDate = "fs-7 btn";    
    }   
    else if (Type == "2") {
      this.classOrderDate = "fs-7 btn";
      this.classExamDate = "fs-7 btn ";   
      this.classScheduleDate = "fs-7 btn selected";    
    } 


    sessionStorage.setItem('radiologyWorklistOrderDate', this.selectedOrderDate);    
    this.FetchRadWorklistData(0);
  }

  fetchProcedureOrder() {
    sessionStorage.setItem("isFrom", "physiotherapy");
    this.router.navigate(['/ward/procedureorder']);
  }
}
