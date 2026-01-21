import { Component, OnInit } from '@angular/core';
import { SuitConfigService } from '../../services/suitconfig.service';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ProcedureOrderComponent } from 'src/app/ward/procedure-order/procedure-order.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service'
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { ConfigService as PrescConfig } from 'src/app/services/config.service';
import { RadiologyScheduleReportsComponent } from '../../radiology-schedule-reports/radiology-schedule-reports.component';
import { PatientfoldermlComponent } from 'src/app/shared/patientfolderml/patientfolderml.component';
declare var $: any;
declare function openPACS(test: any, hospitalId: any, ssn: any): any;

@Component({
  selector: 'app-radiology-worklist',
  templateUrl: './radiology-worklist.component.html',
  styleUrls: ['./radiology-worklist.component.scss'],
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
export class RadiologyWorklistComponent implements OnInit {
  langData: any;
  hospitalId: any;
  loggedinUserDetails: any;
  tablePatientsForm!: FormGroup;
  examinationDetailsForm!: FormGroup;
  selectedPatientType: any = "1";
  selectedSpecialisation = "0";
  classEd: string = "fs-7 btn";
  classIp: string = "fs-7 btn selected";
  classOp: string = "fs-7 btn ";
  classOrderDate: string = "fs-7 btn selected";
  classExamDate: string = "fs-7 btn ";
  classScheduleDate: string = "fs-7 btn ";
  selectedOrderDate: any = "0";

  minValue: number = 1;
  maxValue: number = 10;
  radWorklistData: any;
  radWorklistDataF: any;
  patientSelected: boolean = false;
  IsFitForDischarge: boolean = true;
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
  FetchSpecialisationList: any;
  htmlContentForPreviousResult: any;
  //htmlContent: any;
  trustedUrl: any;
  radiologyPdfDetails: any;
  PatientArrivedMSG: any;
  PatientCancelArrivedMsg: any;
  examCompletedMsg: any;
  totalCount = 1;
  currentPage = 0;
  RadEndServiceType: any;
  facility: any;
  ValidationMsg: any;
  showNoRecFound: boolean = true;
  sortedGroupedByOrderDate: any = [];
  pinfo: any;
  errorMsg: any;
  selectedOption: string = "No";
  selectedPaediatricOption: string = "No";
  prevPhyExam: any;
  enableRadForm: boolean = false;
  SucessMsg: any = [];
  BarCode: any;
  BarCodeRoomText: any;
  BarCodeRoomValue: any;
  selectedProcedureName: string = '';
  filteredWorklist: any[] = [];
  pageSize = 20;
  seltdPtForRadForm: any;

  selectPaediatricOption(option: string): void {
    this.selectedPaediatricOption = option;
  }

  selectedSpecialOption: string = "No";

  selectSpecialOption(option: string): void {
    this.selectedSpecialOption = option;
  }

  selectedSedationOption: string = "No";

  selectSedationOption(option: string): void {
    this.selectedSedationOption = option;
  }

  selectedContrastOption: string = "No";

  selectContrastOption(option: string): void {
    this.selectedContrastOption = option;
  }

  selectedPreviousOption: string = "No";

  selectPreviousOption(option: string): void {
    this.selectedPreviousOption = option;
  }

  radiologyRequestDataList: any = [];
  patientRadiologyRequestId: any = 0;
  radForm: any;
  uniqueProcedureNames: string[] = [];

  constructor(private config: SuitConfigService, private router: Router, private configService: ConfigService, public datepipe: DatePipe, private fb: FormBuilder,
    private bedconfig: BedConfig, private modalService: GenericModalBuilder, private modalSvc: NgbModal,
    private prescconfig: PrescConfig) {
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

    const storedSpecialisation = sessionStorage.getItem('radiologySelectedSpecialisation');
    if (storedSpecialisation) {
      this.selectedSpecialisation = storedSpecialisation;
      sessionStorage.removeItem('radiologySelectedSpecialisation');
    }
  }

  ngOnInit(): void {
    this.initiateRadForm();

    this.selectedOrderDate = "1";
    this.IsFitForDischarge = true;

    this.classOrderDate = "fs-7 btn";
    this.classExamDate = "fs-7 btn selected"; 
    this.classScheduleDate = "fs-7 btn";

    if (sessionStorage.getItem('radiologyWorklistPatientType')) {
      this.selectedPatientType = sessionStorage.getItem('radiologyWorklistPatientType');
    }
    if (sessionStorage.getItem('RadiologyAppointment')) {
      const patientDetails = JSON.parse(sessionStorage.getItem('RadiologyAppointment') || '{}');
      $('#NationalId').val(patientDetails.SSN);
      this.selectedPatientType = patientDetails.PatientType;
      sessionStorage.removeItem('RadiologyAppointment');
    }
    let selectedDates;
    if (sessionStorage.getItem('navigateToRadiologyWorklist')) {
      const SSN = sessionStorage.getItem('navigateToRadiologyWorklist');
      $('#NationalId').val(SSN);
      const dates = JSON.parse(sessionStorage.getItem('radiologyWorklistDates') || '{}');
      if (dates.fromDate && dates.toDate) {
        selectedDates = dates;
      }
      let assignedToMe = true;
      if (sessionStorage.getItem('radiologyWorklistAssignToMe')) {
        assignedToMe = sessionStorage.getItem('radiologyWorklistAssignToMe') === 'true' ? true : false;
      }
      this.IsFitForDischarge = assignedToMe;
      sessionStorage.removeItem('navigateToRadiologyWorklist');
    }

    this.initializetablePatientsForm(selectedDates);
    this.initiateExaminationDetailsForm();

    if (this.IsFitForDischarge) {
      this.FetchRadWorklistDataAss(0, false);
    } else {
      this.FetchRadWorklistData(0);
    }

    this.fetchRadiologyStatus();
    this.fetchPerformingDoctors();
    this.fetchPerformingTechnician();
    this.FetchSpecializationDepartments();
  }

  initiateRadForm() {
    this.radForm = this.fb.group({
      LMPDate: [''],
      IsNormalKidneyFunction: [false],
      IsChronicRenalImpairment: [false],
      IsAcuteKidneyInjury: [false],
      IsHaemodialysis: [false],
      SerumCreatinineLevel: [''],
      ActiveIssues: [''],
      Diagnosis: [''],
      QAndA: ['']
    });
  }

  initializetablePatientsForm(dates?: any) {
    this.tablePatientsForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });
    if (!dates) {
      var wm = new Date();
      var d = new Date();
      wm.setDate(wm.getDate() - 2);
      d.setDate(d.getDate());
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: d
      })
    } else {
      this.tablePatientsForm.patchValue({
        FromDate: new Date(dates.fromDate),
        ToDate: new Date(dates.toDate)
      })
    }
  }
  fetchRadiologyStatus() {
    this.config.fetchRadiologyStatus(this.hospitalId)
      .subscribe((response: any) => {
        this.FetchRadStatusList = response.FetchRadiologyLegendsDataList;
      },
        (err) => {
        })
  }
  FetchSpecializationDepartments() {
    this.config.FetchSpecializationDepartments(this.facilityId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchSpecialisationList = response.FetchSpecializationDepartmentsDataList;

        setTimeout(() => {
          const dropdown = document.getElementById('ddlSpecialisation') as HTMLSelectElement;
          if (dropdown && this.selectedSpecialisation) {
            dropdown.value = this.selectedSpecialisation;
            this.FetchRadWorklistData(0);
          }
        });
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
      StartExam: [''],
      EndExam: [''],
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
    sessionStorage.setItem('radiologyWorklistPatientType', this.selectedPatientType);
    this.patientSelected = false;
    this.FetchRadWorklistData(0);
  }

  FetchRadWorklistDataDisplayOrderDate(Type: string) {
    if (Type == "0")
      this.selectedOrderDate = "0";
    else if (Type == "1")
      this.selectedOrderDate = "1";
    else if (Type == "2")
      this.selectedOrderDate = "2";


    // if (Type == "0") {
    //   this.classOrderDate = "fs-7 btn selected";
    //   this.classExamDate = "fs-7 btn";     
    // }
    // else if (Type == "1") {
    //   this.classOrderDate = "fs-7 btn";
    //   this.classExamDate = "fs-7 btn selected";     
    // }   
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



  SpecialisationChange(event: any) {
    this.selectedSpecialisation = event.target.value;
    sessionStorage.setItem('radiologySelectedSpecialisation', this.selectedSpecialisation);
    this.FetchRadWorklistData(0);
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

  clearSearchCriteria() {
    //this.selectedSpecialisation='0';
    this.IsFitForDischarge = true;
    $('#Barcode').val('');
    //$('#ddlSpecialisation').val('0');    
    $('#NationalId').val('');
    $('#Mobile').val('');
    $('#ProcedureName').val('');
    this.patientSelected = false;
    this.selectedOrderDate = "0";
    this.classOrderDate = "fs-7 btn selected";
    this.classExamDate = "fs-7 btn ";
    this.initializetablePatientsForm();
    if (this.IsFitForDischarge) {
      this.FetchRadWorklistDataAss(0, false);
    } else {
      this.FetchRadWorklistData(0);
    }
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
    if (this.tablePatientsForm.value['FromDate'] && this.tablePatientsForm.value['ToDate']) {
      sessionStorage.setItem('radiologyWorklistDates', JSON.stringify({
        fromDate: this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString(),
        toDate: this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString()
      }))
      this.patientSelected = false;
      this.FetchRadWorklistData(0);
    }
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
      if (element.ExamEndDateTime != null) {
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


    if (Number(wrk.Status >= 4 && wrk.Status != 7) && this.selectedPatientData.expand)
      this.FetchSaveRadiologyResults(wrk.TestOrderID, wrk.TestOrderItemID, wrk.TestID, wrk.PatientID, wrk.IPID, wrk.PatientType);
    else
      this.htmlContentForPreviousResult = '';

    this.fetchRadiologyForm(wrk);

  }

  openAllergyPopup() {
    this.showAllergydiv = true;
  }

  openRadiologyForm(wrk: any) {
    this.seltdPtForRadForm = wrk;
    $("#refill_modal").modal('show');
  }

  fetchRadiologyForm(wrk: any) {
    const prescid = wrk.PrescriptionID;
    this.prescconfig.fetchPatientRadiologyRequestForms(prescid, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatientRadiologyRequestFDataList.length > 0) {
            this.enableRadForm = true;
            this.fetchDiagnosisForMRIForm(wrk);
            var radData = response.FetchPatientRadiologyRequestFDataList[0];
            var checkList = response.FetchPatientRadiologySafetyChecklistFDataList;

            this.selectedOption = radData.IsPregnant === 0 ? "No" : radData.IsPregnant === 1 ? "Yes" : radData.IsPregnant === 2 ? "Unsure" : "Check";
            this.selectedPaediatricOption = radData.IsPaediatricSpecialNeed ? "Yes" : "No";
            this.selectedSpecialOption = radData.SpecialNeed ? "Yes" : "No";
            this.selectedSedationOption = radData.IsSedationRequired ? "Yes" : "No";
            this.selectedContrastOption = radData.IsContrastRequired ? "Yes" : "No";
            this.selectedPreviousOption = radData.IsPreviousRadiologyStudy ? "Yes" : "No";
            this.patientRadiologyRequestId = radData.PatientRadiologyRequestId;

            this.radForm.patchValue({
              LMPDate: radData.LMPDate === null || radData.LMPDate == '' ? '' : new Date(radData.LMPDate),
              IsNormalKidneyFunction: radData.IsNormalKidneyFunction,
              IsChronicRenalImpairment: radData.IsChronicRenalImpairment,
              IsAcuteKidneyInjury: radData.IsAcuteKidneyInjury,
              IsHaemodialysis: radData.IsHaemoDialysis,
              SerumCreatinineLevel: radData.LastSerumCreatinineLevel,
              ActiveIssues: radData.BriefClinicalHistory,
              QAndA: radData.ClinicalQuestion
            });

            this.radiologyRequestDataList = [];
            checkList.forEach((element: any, index: any) => {
              let chk = {
                "SafetyChecklistId": element.SafetyChecklistId,
                "SpecialiseID": element.SpecialiseID,
                "Specialisation": element.Specialisation,
                "SafetyChecklistName": element.SafetyChecklistName,
                "SafetyChecklistName2L": element.SafetyChecklistName2L,
                "selectedValue": element.IsSafety
              }
              this.radiologyRequestDataList.push(chk);
            });

          }
        }
      });
  }

  fetchDiagnosisForMRIForm(wrk: any) {
    this.prescconfig.fetchAdviceDiagnosis(wrk.IPID, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          var diag = "";
          response.PatientDiagnosisDataList.forEach((element: any, index: any) => {
            if (diag != "")
              diag = diag + "\n" + response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
            else
              diag = response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
          });
          this.radForm.get('Diagnosis')?.setValue(diag);
        }
      },
        (err) => {

        })
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
    if (payload.Status == '2') {
      const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
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
        modalRef.close();
      });
    }
    else {
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

      // this.fetchPerformingDoctors();
      // this.fetchPerformingTechnician();
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
        if (this.SavedperfDoctor.length > 0) {
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
        else {
          this.examinationDetailsForm.patchValue({
            ProcedureName: '',
            PerfDoctor: '',
            PerfDoctorName: '',
            PerfTechnician: '',
            PerfTechnicianName: '',
            StartExam: '',
            EndExam: '',
            Remarks: ''
          });
        }
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
    this.examCompletedSaveSubmitted = true;
    if (this.examinationDetailsForm.valid) {
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
          $("#StartexamCompletedMsg").modal('show');
          //$("#examinationDetails").modal('hide');        
        }
      },
        (err) => {

        })
    }
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

  navigateToRadiologyResultEntry(selectedPatientData: any) {
    const status = Number(this.selectedPatientData?.Status);
    const hasExamStarted = this.selectedPatientData?.ExamStartDateTime != null;

    if (status >= 4 || status === 7 || hasExamStarted) {
      sessionStorage.setItem("fromRadiologyWorklist", "true");
      sessionStorage.setItem("radresult", "true");
      sessionStorage.setItem("selectedPatientData", JSON.stringify(selectedPatientData));
      sessionStorage.setItem('radiologySelectedSpecialisation', this.selectedSpecialisation);
      this.router.navigate(['/suit/radiology-resultentry']);
    } else {
      this.ValidationMsg = "Please Start/End Examination before proceeding to Enter Results";
      $("#validationResultEntryMsg").modal('show');
    }
  }

  FetchSaveRadiologyResults(TestOrderID: any, TestOrderItemID: any, TestID: any, PatientID: any, IPID: any, PatientType: any) {
    this.config.FetchSaveRadiologyResults(TestOrderID, TestOrderItemID, TestID, PatientID, IPID, PatientType, this.loggedinUserDetails[0].UserId, this.facilityId, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        if (Number(this.selectedPatientData.Status) <= 4) {
          this.htmlContentForPreviousResult = response.FetchSaveRadiologyResultsDataList[0]?.ExtValue;
        }
        else {
          this.htmlContentForPreviousResult = response.FetchSaveRadiologyResultsDataList[0]?.ExtValue;
        }
      }
    },
      (err) => {

      })
  }

  RadioLogyReportPrintPDF(selectedPatientData: any) {
    if (selectedPatientData.SampleStatus >= 4 && selectedPatientData.SampleStatus != 7) {
      this.config.fetchRadReportGroupPDF(this.selectedPatientData.RegCode, this.selectedPatientData.TestOrderItemID, this.selectedPatientData.TestOrderID, this.loggedinUserDetails[0].UserId, this.hospitalId).subscribe((response) => {
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
    $("#reviewAndPaymentReportModal").modal('show');
  }

  navigateToEndoscopyForm(item: any) {
    if (Number(this.selectedPatientData.Status) >= 3) {
      if (item.PatientType !== '1') {
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
    $("#cathLab_quickaction_info").modal('hide');
    if (this.selectedPatientData.AdmissionID == undefined)
      this.selectedPatientData.AdmissionID = this.selectedPatientData.IPID;
    sessionStorage.setItem("selectedView", JSON.stringify(selectedPatientData));
    sessionStorage.setItem("PatientID", selectedPatientData.PatientID);
    sessionStorage.setItem("PatientDetails", JSON.stringify(selectedPatientData));
    sessionStorage.setItem("ssnEForms", selectedPatientData.SSN);
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
    if (item.WardID === '') {
      this.errorMsg = "Patient not yet admitted";
      $("#errorMsg").modal('show');
      return;
    }
    this.getUserFacility(item, 'eforms');

  }

  redirectToEformsForRadiology(item: any) {
    item.HospitalID = this.hospitalId;
    if (item.AdmissionID == undefined)
      item.AdmissionID = this.selectedPatientData.IPID;
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("fromRadiologyWorklist", "true");
    this.router.navigate(['/templates']);
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
        const wardPatientData = response.FetchBedsFromWardDataList.find((x: any) => x.PatientID === item.PatientID);
        if (wardPatientData) {
          item.HospitalID = this.hospitalId;
          sessionStorage.setItem("InPatientDetails", JSON.stringify(wardPatientData));
          sessionStorage.setItem("selectedView", JSON.stringify(wardPatientData));
          sessionStorage.setItem("BedList", JSON.stringify(response.FetchBedsFromWardDataList));
          sessionStorage.setItem("fromCathLab", "true");
          if (screen === 'eforms') {
            this.router.navigate(['/templates']);
          }
          else if (screen === 'procorder') {
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
    if (item.WardID === '') {
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
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(ProcedureOrderComponent, {
      data: item,
      readonly: true
    }, options);
  }

  navigateToProcedureScheduler(item: any) {
    sessionStorage.setItem("fromRadiology", "true");
    sessionStorage.setItem("RadiologyPatientData", JSON.stringify(item));
    this.router.navigate(['/frontoffice/investigationappointment']);
  }

  navigatetoPatientSummary(pat: any, event: any) {
    // pat.Bed = pat.OrderBed;
    // sessionStorage.setItem("PatientDetails", JSON.stringify(pat));
    // sessionStorage.setItem("selectedView", JSON.stringify(pat));
    // sessionStorage.setItem("selectedPatientAdmissionId", pat.IPID);
    // sessionStorage.setItem("PatientID", pat.PatientID);
    // sessionStorage.setItem("radworklist", "true");
    // this.router.navigate(['/shared/patientfolder']);

    event.stopPropagation();
    sessionStorage.setItem("PatientDetails", JSON.stringify(pat));
    sessionStorage.setItem("selectedView", JSON.stringify(pat));
    sessionStorage.setItem("selectedPatientAdmissionId", pat.AdmissionID);
    sessionStorage.setItem("PatientID", pat.PatientID);
    sessionStorage.setItem("SummaryfromCasesheet", "true");
    sessionStorage.setItem("FromPhysioTherapyWorklist", "true");

    const options: NgbModalOptions = {
      windowClass: 'vte_view_modal'
    };
    // const modalRef = this.ms.openModal(PatientfoldermlComponent, options);
    // modalRef.componentInstance.readonly = true;
    const modalRef = this.modalService.openModal(PatientfoldermlComponent, {
      data: pat,
      readonly: true,
      selectedView: pat
    }, options);
  }

  getTasksCount(TaskStatus: any) {
    if (!this.radWorklistDataF) {
      return 0;
    }
    return this.radWorklistDataF.filter((e: any) => e.Status == TaskStatus).length;
  }

  FetchPerfDoctor() {
    this.config.fetchRadiologyPerfDoctor(this.loggedinUserDetails[0].UserId, this.facilityId, this.hospitalId).subscribe((response) => {
      if (response.Code == 200) {
        this.perfDoctor = response.FetchRadiologyPerfDocDataaList;
        $("#EmployeeHospitalLocations").modal('show');
      }
    },
      (err) => {

      })
  }
  selectDoctor(loc: any) {
    loc.selected = !loc.selected;
  }

  SaveTestPerformingDoctors() {
    // var empDocs = this.perfDoctor.filter((x:any) => x.selected);
    // var empDocxml: any[] = [];
    // empDocs.forEach((element:any, index:any) => {
    //   empDocxml.push({
    //     "DID" : element.DOCID,
    //     "DNAME" : element.DoctorName
    //   });
    // });  

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

  isAnyDoctorSelected(): boolean {
    return this.sortedGroupedByOrderDate?.some((group: any) =>
      group.items?.some((item: any) => item.selectedforDoctor)
    );
  }


  openSchedulerReport() {
    const options: NgbModalOptions = {
      windowClass: 'vte_view_modal'
    };
    const modalref = this.modalService.openModal(RadiologyScheduleReportsComponent, {
      readonly: true
    }, options);
  }

  PatientPrintCard(item: any) {
    this.config.FetchRegistrationCard(item.PatientID, this.loggedinUserDetails[0]?.UserId, this.facilityId, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH;
          this.showModal()
        }
      },
        (err) => {

        })
  }

  roomchange(event: any) {
    this.BarCodeRoomText = this.getSelectedText(event.target.value);
    this.BarCodeRoomValue = event.target.value;
  }
  getSelectedText(selectedValue: string): string {
    const valueToTextMap: any = {
      '17216R1717': '01',
      '17216R1718': '02',
      '17216R1719': '03',
      '17216R1720': '04',
      '17216R1721': '05',
      '17216R1722': '06',
      '17216R1723': '07',
      '17216R1724': '08',
      '17216R1725': '09',
      '17216R1726': '10',
      '17216R1727': '11',
      '17216R1728': '12',
      '17216R1729': '13',
      '17216R1730': '14',
      '17216R1731': '15',
      '17216R1732': '16',
    };
    return valueToTextMap[selectedValue] || '';
  }
  onBarCodePress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.ScannedBarcode();
    }

  }

  openPatientSummary() {
    const options: NgbModalOptions = {
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(PatientfoldermlComponent, { readonly: true }, options);
  }

  filterByProcedureName() {
    this.currentPage = 0;
    this.filteredWorklist = this.selectedProcedureName
      ? this.radWorklistDataF.filter((item: any) => item.ProcedureName === this.selectedProcedureName)
      : this.radWorklistDataF;

    this.groupAndPaginate(this.filteredWorklist);
  }

  filterByStatus(status: number) {
    this.currentPage = 0;
    this.filteredWorklist = this.radWorklistDataF.filter((x: any) => x.Status === status);
    this.groupAndPaginate(this.filteredWorklist);
  }

  private setPatientTypeClasses() {
    const classes: any = {
      "1": () => {
        this.classEd = "fs-7 btn";
        this.classIp = "fs-7 btn";
        this.classOp = "fs-7 btn selected";
      },
      "2": () => {
        this.classEd = "fs-7 btn";
        this.classIp = "fs-7 btn selected";
        this.classOp = "fs-7 btn";
      },
      "3": () => {
        this.classEd = "fs-7 btn selected";
        this.classIp = "fs-7 btn";
        this.classOp = "fs-7 btn";
      },
    };
    (classes[this.selectedPatientType] || (() => { }))();
  }

  private buildPayload(extra: any = {}): any {
    return {
      OrderType: "0",
      SSN: $('#NationalId').val() || "",
      MobileNo: $('#MobileNo').val() || "",
      ProcedureName: $('#ProcedureName').val() || "",
      Filter: "Blocked = 0",
      intUserId: this.loggedinUserDetails[0].UserId,
      intWorkstationId: this.facilityId,
      min: this.minValue,
      max: this.maxValue,
      order: "0",
      PatientType: this.selectedPatientType,
      Specializationid: this.selectedSpecialisation,
      FromDate: this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString(),
      ToDate: this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString(),
      FromDateCon: "",
      ToDateCon: "",
      Type: "1",
      PatientArrivedDateBased: this.selectedOrderDate,
      ServiceID: "5",
      HospitalID: this.hospitalId,
      ...extra
    };
  }

  private processWorklistData(response: any) {
    this.radWorklistData = response.FetchRadWorklistDisplayOutputLists || [];
    this.worklistCount = response.FetchLabWorklistDisplaycOutputLists?.[0]?.TCount || 0;
    this.totalCount = this.worklistCount;

    this.radWorklistData.forEach((element: any) => {
      element.Class = "worklist_card";
      element.Selected = false;
      const status = element.Status;
      element.bedClass = status <= 2 ? "NewOrder" :
        status == 3 ? "PatientArrived" :
          status == 7 ? "ExaminationCompleted" :
            status >= 5 && status != 7 ? "ResultVerified" :
              status >= 4 ? "ResultEntered" : "";
    });

    this.radWorklistDataF = this.radWorklistData;

    this.filteredWorklist = this.radWorklistDataF;

    this.uniqueProcedureNames = Array.from(
      new Set(this.radWorklistDataF.map((item: any) => item.ProcedureName).filter(Boolean))
    );

    this.currentPage = 0;
    this.groupAndPaginate(this.filteredWorklist);
  }

  fetchWorklist(status = 0, extraPayload = {}, apiMethod: any = 'fetchRadWorklistDataDisplay', callback?: (res: any) => void) {
    this.setPatientTypeClasses();
    let payload = this.buildPayload({ Status: status, ...extraPayload });

    if (this.IsFitForDischarge) {
      const PerfUserID = this.loggedinUserDetails[0].EmpId;
      payload = {
        PerfUserID,
        UserID: this.loggedinUserDetails[0].UserId,
        WorkStationID: this.facilityId,
        ...payload
      };
    }

    const apiMethodMap: any = {
      fetchRadWorklistDataDisplay: this.config.fetchRadWorklistDataDisplay.bind(this.config),
      fetchRadWorklistDataDisplayToken: this.config.fetchRadWorklistDataDisplayToken.bind(this.config)
    };

    apiMethodMap[apiMethod](payload).subscribe(
      (res: any) => {
        if (res.Code === 200) {
          this.processWorklistData(res);
          if (callback) callback(res);
        }
      }
    );
  }

  FetchRadWorklistData(status: number) {
    this.fetchWorklist(status);
  }

  onPerfTechnicianChangeLoad(event: any) {
    const PerfUserID = event.target.value === '' ? 0 : event.target.value;
    this.fetchWorklist(0, { PerfUserID, UserID: this.loggedinUserDetails[0].UserId, WorkStationID: this.facilityId });
  }

  ReloadRadOrderData() {
    const extra = { Specializationid: null };
    this.fetchWorklist(0, extra);
    $("#examinationDetails").modal('hide');
  }

  ReloadRadOrderDataN() {
    const extra = { Specializationid: null };
    this.fetchWorklist(0, extra);
    $("#examinationDetails").modal('show');
  }

  FetchRadWorklistDataAss(status: number, shouldToggle: boolean = true) {
    if (shouldToggle) {
      this.IsFitForDischarge = !this.IsFitForDischarge;
      sessionStorage.setItem('radiologyWorklistAssignToMe', this.IsFitForDischarge.toString());
    }

    if (this.IsFitForDischarge) {
      const PerfUserID = this.loggedinUserDetails[0].EmpId;
      const payload = {
        PerfUserID,
        UserID: this.loggedinUserDetails[0].UserId,
        WorkStationID: this.facilityId
      };

      this.fetchWorklist(status, payload, 'fetchRadWorklistDataDisplay', (res: any) => {
        const worklist = res?.FetchRadWorklistDisplayOutputLists || [];
        if (worklist.length === 0) {
          this.IsFitForDischarge = false;
          sessionStorage.setItem('radiologyWorklistAssignToMe', 'false');
          this.FetchRadWorklistData(status);
        }
      });
    } else {
      this.FetchRadWorklistData(status);
    }
  }

  ScannedBarcode() {
    if (!this.BarCode || !this.BarCodeRoomText) {
      this.ValidationMsg = "Select Counter";
      $("#ValidMsg").modal("show");
      this.sortedGroupedByOrderDate = [];
      return;
    }

    const extra = {
      PerfUserID: this.IsFitForDischarge ? this.loggedinUserDetails[0].EmpId : 0,
      Status: 0,
      BarCode: this.BarCode,
      TokenCounterValue: this.BarCodeRoomValue,
      TokenCounterRoom: this.BarCodeRoomText,
    };
    this.fetchWorklist(0, extra, 'fetchRadWorklistDataDisplayToken');
  }

  private groupAndPaginate(data: any[]) {
    const slice = data.slice(0, (this.currentPage + 1) * this.pageSize);
    const grouped = slice.reduce((acc: any, curr: any) => {
      const key = curr.OrderDate.split(' ')[0];
      (acc[key] ||= []).push(curr);
      return acc;
    }, {});

    this.sortedGroupedByOrderDate = Object.entries(grouped)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([OrderDate, items]) => ({ OrderDate, items }));

    this.showNoRecFound = slice.length === 0;
  }

  loadNextAppointmentsPage() {
    this.currentPage++;
    this.groupAndPaginate(this.filteredWorklist);
  }

  onScroll(event: any): void {
    const element = event.target;
    const threshold = 200;

    if (element.scrollHeight - element.scrollTop <= element.clientHeight + threshold) {
      this.loadNextAppointmentsPage();
    }
  }

}
