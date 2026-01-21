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
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ProcedureOrderComponent } from 'src/app/ward/procedure-order/procedure-order.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service'
import { RadiologyScheduleReportsComponent } from '../radiology-schedule-reports/radiology-schedule-reports.component';

declare var $: any;
declare function openPACS(test: any, hospitalId: any, ssn: any): any;

@Component({
  selector: 'app-shared-worklist',
  templateUrl: './shared-worklist.component.html',
  styleUrls: ['./shared-worklist.component.scss'],
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
export class SharedWorklistComponent implements OnInit {
  langData: any;
  hospitalId: any;
  loggedinUserDetails: any;
  tablePatientsForm!: FormGroup;
  examinationDetailsForm!: FormGroup;
  selectedPatientType = "1";
  classEd: string = "fs-7 btn";
  classIp: string = "fs-7 btn selected";
  classOp: string = "fs-7 btn ";
  minValue: number = 1;
  maxValue: number = 10;
  radWorklistData: any;
  radWorklistDataF: any;
  patientSelected: boolean = false;
  worklistCount: number = 0;
  selectedPatientData: any;
  showAllergydiv: boolean = false;
  perfDoctor: any;
  perfTechnician: any;
  SavedperfDoctor: any;
  facilityId: any;
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
  ValidationMsg:any;
  showNoRecFound: boolean = true;
  sortedGroupedByOrderDate: any = [];
  pinfo: any;
  errorMsg: any;
  pageTitle: any;
  selectedPatientID = 0;
  fromDocCalendar: boolean = false;
  fromDocCalendarSSN: any;
  techList: any = [];
  
  constructor(private config: SuitConfigService, private router: Router, private configService: ConfigService, public datepipe: DatePipe, private fb: FormBuilder, private bedconfig: BedConfig, private modalService: GenericModalBuilder) {
    this.langData = this.configService.getLangData();
    this.loggedinUserDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.fromDocCalendar = sessionStorage.getItem("fromDocCalendar") === "true" ? true : false;
    this.fromDocCalendarSSN = sessionStorage.getItem("fromDocCalendarSSN") || '';    
    this.RadEndServiceType = this.facility.FacilityName
    if(this.RadEndServiceType === 'ENDOSCOPY')
      this.RadEndServiceType = "Endoscopy";
    else if(this.RadEndServiceType === 'CATH LAB')
      this.RadEndServiceType = "CathLab";
    else
      this.RadEndServiceType = "Radiology";
    
    if (Object.keys(this.facilityId).length == 0) this.facilityId = "0";

    const url = sessionStorage.getItem("worklisturl");
    const match = url?.match(/suit\/([A-Za-z]+)worklist/);
      if (match && match[1]) {
        const worklistType = match[1];
        
        // Format the title
        this.pageTitle = `${this.capitalize(worklistType)} Worklist`;
      } else {
        this.pageTitle = 'Worklist';
      }
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  ngOnInit(): void {
    this.initializetablePatientsForm();
    this.initiateExaminationDetailsForm();
    if(this.fromDocCalendar) {
      $('#NationalId').val(this.fromDocCalendarSSN);
    }
    if (sessionStorage.getItem('navigateToNeurologyWorklist')) {
      const SSN = sessionStorage.getItem('navigateToNeurologyWorklist');
      $('#NationalId').val(SSN);
      sessionStorage.removeItem('navigateToNeurologyWorklist');      
    }
    this.FetchRadWorklistData(0);
    this.fetchRadiologyStatus();
  }

  initializetablePatientsForm() {
    this.tablePatientsForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });
    var wm = new Date();
    var d = new Date();
    wm.setDate(wm.getDate() - 3);
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
    this.FetchRadWorklistData(TaskStatus);
  }
  initiateExaminationDetailsForm() {
    this.examinationDetailsForm = this.fb.group({
      ProcedureName: [''],
      PerfDoctor: ['', Validators.required],
      PerfDoctorName: ['', Validators.required],
      PerfTechnician: ['', Validators.required],
      PerfTechnicianName: ['', Validators.required],
      StartExam: ['', Validators.required],
      EndExam: ['', Validators.required],
      Remarks: ['']
    });
  }

  FetchRadWorklistDataDisplay(patientType: string) {
    if (patientType == "3")
      this.selectedPatientType = "3";
    else if (patientType == "2")
      this.selectedPatientType = "2";
    else if (patientType == "1")
      this.selectedPatientType = "1";
    this.patientSelected = false;
    this.FetchRadWorklistData(0);
  }

  FetchRadWorklistData(status: number) {
    var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();

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
      "OrderType": "0",
      "SSN": $('#NationalId').val() != "" && $('#NationalId').val() != undefined ? $('#NationalId').val() : "",
      "MobileNo": $('#MobileNo').val() != "" && $('#MobileNo').val() != undefined ? $('#MobileNo').val() : "",
      "ProcedureName": $('#ProcedureName').val() != "" && $('#ProcedureName').val() != undefined ? $('#ProcedureName').val() : "",
      "Filter": "Blocked = 0",
      "intUserId": this.loggedinUserDetails[0].UserId,
      "intWorkstationId": this.facilityId,
      "min": this.minValue,
      "max": this.maxValue,
      "order": "0",
      "PatientType": this.selectedPatientType,
      "Specializationid": null,
      "FromDate": FromDate,
      "ToDate": ToDate,
      "FromDateCon": "",
      "ToDateCon": "",
      "Type": "1",
      "PatientArrivedDateBased": "0",
      "ServiceID": "5",
      "HospitalID": this.hospitalId,
      "Status": status

    }
    this.config.fetchRadWorklistDataDisplay(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.radWorklistData = response.FetchRadWorklistDisplayOutputLists.filter((x: any) => x.DocID == this.loggedinUserDetails[0].EmpId);
        if(this.radWorklistData.length === 0) {
          this.radWorklistData = response.FetchRadWorklistDisplayOutputLists;
        }
        this.worklistCount = response.FetchLabWorklistDisplaycOutputLists[0].TCount;
        this.totalCount = response.FetchLabWorklistDisplaycOutputLists[0]?.TCount || 0;
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
        });
        this.radWorklistDataF = this.radWorklistData;
        const groupedByOrderDate = this.radWorklistData.reduce((acc: any, current: any) => {
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

        if (this.radWorklistData.length > 0) {
          this.showNoRecFound = false;
        } else
          this.showNoRecFound = true;
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
  onProcedureEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.patientSelected = false;
      this.FetchRadWorklistData(0);
    }
  }
   openSchedulerReport() {
        const options: NgbModalOptions = {
          windowClass: 'vte_view_modal'
        };
        const modalref = this.modalService.openModal(RadiologyScheduleReportsComponent, {
          readonly: true
        },options);
      }

  clearSearchCriteria() {
    $('#Barcode').val('');
    $('#NationalId').val('');
    $('#ProcedureName').val('');
    
    $('#Mobile').val('');
    this.patientSelected = false;
    this.initializetablePatientsForm();
    this.FetchRadWorklistData(0);
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
    } else if (filter === "Y") {
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
    this.selectedPatientID = wrk.PatientID;
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
      if (element.ExamEndDateTime != null) {
        element.ExamCompletedClass = "collected custom_tooltip custom_tooltip_left text-center active";
      }
      else {
        element.ExamCompletedClass = "collected custom_tooltip custom_tooltip_left text-center";
      }
      if (element.PatientPreprocAssID != "" && element.SampleStatus >=3) {
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

      this.startDate =  moment(wrk.ExamStartDateTime).format('DD-MMM-yyyy');// this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
      this.startTime = moment(wrk.ExamStartDateTime).format('HH:mm:ss');
      this.disableEndExam = false;
      this.examinationDetailsForm.get('StartExam')?.setValue(this.startDate + " " + this.startTime);

      this.endDate = moment(wrk.ExamEndDateTime).format('DD-MMM-yyyy');
      this.endTime = moment(wrk.ExamEndDateTime).format('HH:mm:ss');
      this.examinationDetailsForm.get('EndExam')?.setValue(this.endDate + " " + this.endTime);
    }


    if (Number(wrk.Status >= 4 && wrk.Status != 7) && this.selectedPatientData.expand)
      this.FetchSaveRadiologyResults(wrk.TestOrderID, wrk.TestOrderItemID, wrk.TestID, wrk.PatientID, wrk.IPID, wrk.PatientType);
    else
      this.htmlContentForPreviousResult = '';
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
      }
    },
      (err) => {

      })
  }
  openPatientArrivedPopUp(status: any) {
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
      if(this.selectedPatientData?.ExamStartDateTime!=null){
        this.startDate =  moment(this.selectedPatientData?.ExamStartDateTime).format('DD-MMM-yyyy');// this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString();
        this.startTime = moment(this.selectedPatientData?.ExamStartDateTime).format('HH:mm:ss');
        this.disableEndExam = false;
        this.examinationDetailsForm.get('StartExam')?.setValue(this.startDate + " " + this.startTime);
  
      }else {
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
              PerfTechnicianName:element.Doctorname,
            })
          } else {
            this.examinationDetailsForm.patchValue({
              PerfDoctor: element.DoctorID,
              PerfDoctorName:element.Doctorname,
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
      }
    },
      (err) => {

      })

  }

  endExam() {
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
        //this.perfTechnician = response.FetchRadiologyTechnicianDataList;
        this.saveExmainationCompleted();
        this.examCompletedMsg = 'Examinationation Ended Successfully';
        $("#examCompletedMsg").modal('show');
      }
    },
      (err) => {

      })
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
            "TID": this.examinationDetailsForm.get('PerfTechnician')?.value,
            "TNAME": this.examinationDetailsForm.get('PerfTechnicianName')?.value,
          }
        ]
      }
      this.config.changeEndDateTimeFinalSaveStatus(endExamPayload).subscribe((response) => {
        if (response.Code == 200) {
          this.examCompletedMsg = 'Examination Completed Successfully';
          $("#examCompletedMsg").modal('show');
        }
      },
        (err) => {

        })
    }
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
        }
      },
        (err) => {

        })
    }
  }

  ReloadRadOrderData() {

    var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();

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
      "OrderType": "0",
      "SSN": $('#NationalId').val() != "" && $('#NationalId').val() != undefined ? $('#NationalId').val() : "",
      "MobileNo": $('#MobileNo').val() != "" && $('#MobileNo').val() != undefined ? $('#MobileNo').val() : "",
      "ProcedureName": $('#ProcedureName').val() != "" && $('#ProcedureName').val() != undefined ? $('#ProcedureName').val() : "",
      "Filter": "Blocked = 0",
      "intUserId": this.loggedinUserDetails[0].UserId,
      "intWorkstationId": this.facilityId,
      "min": this.minValue,
      "max": this.maxValue,
      "order": "0",
      "PatientType": this.selectedPatientType,
      "Specializationid": null,
      "FromDate": FromDate,
      "ToDate": ToDate,
      "FromDateCon": "",
      "ToDateCon": "",
      "Type": "1",
      "PatientArrivedDateBased": "0",
      "ServiceID": "5",
      "HospitalID": this.hospitalId

    }
    this.config.fetchRadWorklistDataDisplay(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.radWorklistData = response.FetchRadWorklistDisplayOutputLists;
        this.worklistCount = response.FetchLabWorklistDisplaycOutputLists[0].TCount;
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
        });
        var updatedPatientData = this.radWorklistData.filter((x: any) => x.TestOrderID == this.selectedPatientData.TestOrderID && x.TestOrderItemID == this.selectedPatientData.TestOrderItemID);
        this.selectedPatientData = updatedPatientData[0];
        this.patientSelected = true;
        const groupedByOrderDate = this.radWorklistData.reduce((acc: any, current: any) => {
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
        
        $("#examinationDetails").modal('hide');

        this.expandPatient(this.selectedPatientID);
      }
    },
      (err) => {

      })


  }
  navigateToRadiologyResultEntry(selectedPatientData: any) {
    if (Number(this.selectedPatientData.Status) >= 4 || Number(this.selectedPatientData.Status) == 7) {
      sessionStorage.setItem("fromRadiologyWorklist", "false");      
      sessionStorage.setItem("radresult", "false");
      sessionStorage.setItem("selectedPatientData", JSON.stringify(selectedPatientData));
      this.router.navigate(['/suit/radiology-resultentry']);
    }
    else {
      if(this.selectedPatientData?.ExamStartDateTime!=null){
        sessionStorage.setItem("fromRadiologyWorklist", "false");      
      sessionStorage.setItem("radresult", "false");
        sessionStorage.setItem("selectedPatientData", JSON.stringify(selectedPatientData));
        this.router.navigate(['/suit/radiology-resultentry']);
      }else {
        this.ValidationMsg="Please Start/End Examination before proceeding to Enter Results";
        $("#validationResultEntryMsg").modal('show');
      }
      
    }
  }

  FetchSaveRadiologyResults(TestOrderID: any, TestOrderItemID: any, TestID: any, PatientID: any, IPID: any, PatientType: any) {
    this.config.FetchSaveRadiologyResults(TestOrderID, TestOrderItemID, TestID, PatientID, IPID, PatientType, this.loggedinUserDetails[0].UserId, this.facilityId, this.hospitalId).subscribe((response) => {
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
    if(selectedPatientData.SampleStatus>=4&&selectedPatientData.SampleStatus!=7){
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

  navigateToEndoscopyForm(item:any) {    
      if (Number(this.selectedPatientData.Status) >= 3 ) {
        if(item.PatientType !== '1') {
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
        }
        else {
          item.GenderID = item.GenderId;
          item.AgeValue = item.Age;
          item.DoctorName = item.DocName;
          item.DoctorID = item.DocID;
          item.PayerName = item.InsuranceCompanyName;
          sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
          sessionStorage.setItem("homescreen", "suit");
          sessionStorage.setItem("FromRadiology", "true");
          this.router.navigate(['/ward/endoscopy']);
        }        
    }
    else {     
        this.ValidationMsg="Patient not Arrived";       
        $("#validationResultEntryMsg").modal('show');
    }
    
  }

  handlePageChange(newPage: any) {
    this.minValue = newPage.min > 0 ? newPage.min + 1 : newPage.min;
    this.maxValue = newPage.max;
    this.FetchRadWorklistData(0);
  }

  navigateEforms(selectedPatientData: any) {
    $("#cathLab_quickaction_info").modal('hide');
    sessionStorage.setItem("selectedView", JSON.stringify(selectedPatientData));
    sessionStorage.setItem("PatientID", selectedPatientData.PatientID);
    sessionStorage.setItem("PatientDetails", JSON.stringify(selectedPatientData));
    sessionStorage.setItem("ssnEForms", selectedPatientData.SSN );
    this.router.navigate(['/shared/patienteforms'], { state: { ssn: selectedPatientData.SSN } });
  }

  submitPACSForm(test: any) {
    openPACS(test.TestOrderItemID, this.hospitalId, this.selectedPatientData.SSN);

  }

  openCathLabQuickActions(wrk: any) {
    this.pinfo = wrk;
    $("#cathLab_quickaction_info").modal('show');
  }

  redirectToEforms(item: any) {
    $("#cathLab_quickaction_info").modal('hide');
    if(item.WardID === '') {
      this.errorMsg = "Patient not yet admitted";
      $("#errorMsg").modal('show');
      return;
    }   
    this.getUserFacility(item, 'eforms'); 
    
  }
  
  getUserFacility(item: any, screen: string) {
    this.bedconfig.fetchUserFacility(this.loggedinUserDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        const FetchUserFacilityDataList = response.FetchUserFacilityDataList;        
        const selectedItem = FetchUserFacilityDataList.find((value: any) => value.FacilityID === item.WardID.toString());
        sessionStorage.setItem("facility", JSON.stringify(selectedItem));
        sessionStorage.setItem("cathLabfacility", JSON.stringify(this.facility));
        this.getWardPatientData(item, screen);        
      },
        (err) => {
        })

  }

  getWardPatientData(item: any, screen: string) {
    this.bedconfig.fetchBedsFromWard(item.WardID, 0, 3, this.loggedinUserDetails[0].EmpId, this.hospitalId, false)
      .subscribe((response: any) => {
        const wardPatientData = response.FetchBedsFromWardDataList.find((x:any) => x.PatientID === item.PatientID);
        if(wardPatientData) {
          item.HospitalID = this.hospitalId;
          sessionStorage.setItem("InPatientDetails", JSON.stringify(wardPatientData));
          sessionStorage.setItem("selectedView", JSON.stringify(wardPatientData));
          sessionStorage.setItem("BedList", JSON.stringify(response.FetchBedsFromWardDataList));
          sessionStorage.setItem("fromCathLab", "true");
          if(screen === 'eforms') {
            this.router.navigate(['/templates']);
          }
          else if(screen === 'procorder') {
            this.openProcedureOrder(item);
          }
        }
        else {
          this.errorMsg = "Patient not in the ward";
          $("#errorMsg").modal('show');
        }
      },
      (err) => {
      })
  }

  clearPatientInfo() {
    this.pinfo = "";
  }

  navToProcedureOrder(item: any) {
    $("#cathLab_quickaction_info").modal('hide');
    if(item.WardID === '') {
      this.errorMsg = "Patient not yet admitted";
      $("#errorMsg").modal('show');
      return;
    }   
    this.getUserFacility(item, 'procorder'); 
  }

  openProcedureOrder(item: any) {
    $("#cathLab_quickaction_info").modal('hide');
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass : 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(ProcedureOrderComponent, {
      data: item,
      readonly: true
    }, options);
  }

  expandPatient(patientId: any): void {
    const matchingData = this.sortedGroupedByOrderDate.find((group: any) =>
      group.items.some((wrk: any) => wrk.PatientID === patientId)
    );
  
    if (matchingData) {
      const expandedItem = matchingData.items.find((wrk: any) => wrk.PatientID === patientId);
      if (expandedItem) {
        this.loadRadOrderData(expandedItem);
      }
    }
  }

  getTasksCount(TaskStatus: any) {
    if (!this.radWorklistDataF) {
      return 0;
    }
    return this.radWorklistDataF.filter((e: any) => e.Status == TaskStatus).length;
  }

  filterByStatus(status: string) {    
    this.radWorklistData = this.radWorklistDataF;
    this.radWorklistData = this.radWorklistData.filter((x: any) => x.Status === status);

    const groupedByOrderDate = this.radWorklistData.reduce((acc: any, current: any) => {
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
    
    if (this.radWorklistData.length > 0) {
      this.showNoRecFound = false;
    }
    else {
      this.showNoRecFound = true;
    }
  }

  fetchTechSearch(event: any) {
    if (event.target.value.length === 0) {
      this.techList = [];
    }

    if (event.target.value.length >= 3) {
      var filter = event.target.value;

      this.config.fetchWitnessNurse(filter, this.hospitalId).subscribe((response: any) => {
        if (response.Code == 200) {
          this.techList = response.FetchRODNursesDataList;
        }
      }, error => {
        console.error('Get Data API error:', error);
      });
    }
  }

  selectTechItem(item: any) {
    this.examinationDetailsForm.get('PerfTechnician')?.setValue(item.Empid);
    this.examinationDetailsForm.get('PerfTechnicianName')?.setValue(item.EmpNoFullname);
    this.techList = [];
  }

  navigateToProcedureScheduler(item: any) {
    sessionStorage.setItem("NeuroPatientData", JSON.stringify(item));
    this.router.navigate(['/frontoffice/neurologyappointment']);
  }
}
