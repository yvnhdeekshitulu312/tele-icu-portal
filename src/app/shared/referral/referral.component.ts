import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';

import { UtilityService } from 'src/app/shared/utility.service';
declare var $: any;
@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.scss']
})
export class ReferralComponent implements OnInit, AfterViewInit {
  @Input() data: any;
  readonly = false;
  @Output() savechanges = new EventEmitter<any>();
  @Output() clearchanges = new EventEmitter<any>();
  @ViewChild('referral', { static: true }) referral!: ElementRef;
  imageUrlParent: any;
  minDate = new Date();
  langData: any;
  AdmissionID: any;
  hospId: any;
  selectedView: any;
  selectedCard: any;
  PatientDiagnosisDataList: any;
  dietType: any;
  followupForm: any;
  referralForm: any;
  currentDate!: any;
  doctorDetails: any;
  fetchAdmin: any;
  activeTab1: any = "followup";
  FollowUpType: any = 1;
  FollowAfter: any = 0;
  FollowUpOn: any = moment(new Date()).format('DD-MMM-YYYY');
  adviceToPatient: any = '';
  diagnosis: any = [];
  intMonitorId: any = 0;
  locationList: any;
  SpecializationList: any;
  SpecializationList1: any;
  reasonsList: any;
  priorityList: any;
  listOfItems: any;
  listOfSpecItems: any;
  listOfSpecItems1: any;
  referralList: any = [];
  referralList1: any = [];
  referralList2: any = [];
  refDetailsList: any = [];
  Cosession = false;
  editIndex: any;
  isEdit: any = false;
  endofEpisode: boolean = false;
  isSurgery: any = false;
  listOfSurgeryItems: any;
  listOfEquipmentItems: any;
  listOfConsumablesItems: any;
  surgeryForm: any;
  surgeryTableForm: any;
  priorities: any;
  departments: any;
  doctorsList: any;
  SurgeryList: any;
  estTime: any;
  bloodOrderBedID: any = 0;
  IsInfected: any = 0;
  IsBloodRequired: any = 0;
  SurgeryRequestid: any = 0;
  MonitorID: any = 0;
  errorMessages: any[] = [];
  isReferral: any = false;
  equipmentTableForm: any;
  consumablesTableForm: any;
  bloodTableForm: any;
  FetchBloodComponentssDataaList: any = [];
  showChildComponent = false;
  surgeryIDFromParent: any;
  markedinputData: any = [];

  defObGynProcedures: string[] = ['6191', '6981', '6193', '6907', '6183', '7590'];
  defGitProcedures: string[] = ['32289', '27356', '33718', '4960'];
  defGsProcedures: string[] = ['6813', '5912', '26784', '7447', '8144'];
  defEntProcedures: string[] = ['6006', '6779', '6011', '6003', '5982'];
  fastingtimearr: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
  cannotPrescribeProcName: any;
  adviceReasonForAdmSubmitted: boolean = false;
  noofdaysToFollowup: boolean = false;
  followupRemarks: boolean = false;
  referralRemarks: boolean = false;
  referralSpecialization: boolean = false;
  referralReason: boolean = false;
  referralPriority: boolean = false;
  surgeryRequestSubmitted: boolean = false;
  showNoofDaysFollowUp: boolean = false;
  NoofFollowUp: string = "0";
  NoofDays: string = "0";
  surgeryRequestDataDetailsLevel: any = [];
  facility: any;
  fromCasesheet = false;
  isNotScheduled = false;
  disableSave = false;

  obgyneFormType = "";
  smartDataList: any;
  showHideFormTabs = false;
  activeAssessmentTab = '';
  savedSpecialisationAssessmentsList: any = [];
  templateArray: any = [];

  constructor(private fb: FormBuilder, private config: ConfigService, private router: Router, private modalService: GenericModalBuilder,
    private changeDetectorRef: ChangeDetectorRef, private modalSvc: NgbModal, private us: UtilityService) {
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
   
    this.referralForm = this.fb.group({
      Type: [1, Validators.required],
      Location: [0, Validators.required],
      LocationName: ['', Validators.required],
      DoctorID: ['', Validators.required],
      DoctorName: ['', Validators.required],
      Remarks: ['', Validators.required],
      Specialization: [0, Validators.required],
      SpecializationName: ['', Validators.required],
      Reason: [0, Validators.required],
      ReasonName: ['', Validators.required],
      Priority: [0, Validators.required],
      PriorityName: ['', Validators.required],
      Duration: ['', Validators.required],
      Cosession: [false, Validators.required],
      REFERRALORDERID: [0],
      BKD: [0],
      SpecialisationDoctorName: ['0', Validators.required],
      SpecialisationDoctorID: ['', Validators.required],
      StartDate: [''],
      EndDate: ['']
    });

    const currentDateTime = new Date();
    const currentTime = currentDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  }

  createItemFormGroup() {
    return this.fb.group({
      DepartmentList: this.fb.array([])
    });
  }

  fetchDiagnosis() {
    this.config.fetchAdviceDiagnosis(this.AdmissionID, this.hospId).subscribe((response) => {
      this.PatientDiagnosisDataList = response.PatientDiagnosisDataList;
      this.PatientDiagnosisDataList.forEach((element: any, index: any) => {
        element.selected = true;
        //element.MODDATE = this.datepipe.transform(new Date(element.MODDATE), "dd-MMM-yyyy")?.toString()
      });

      if (this.PatientDiagnosisDataList.length === 0) {
        this.errorMessages.push("No Diagnosis for the patient");
        $("#errorDiagonsisMsg").modal('show');
      }
    },
      (err) => {

      })
  }

  ngOnInit(): void {
    if (this.data) {
      this.readonly = this.data.readonly;
    }

    this.langData = this.config.getLangData();
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    if (sessionStorage.getItem("ISEpisodeclose") === "true") {
      this.endofEpisode = true;
    } else {
      this.endofEpisode = false;
    }
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.AdmissionID = this.selectedView.AdmissionID == undefined ? this.selectedView.IPID : this.selectedView.AdmissionID;
    if (this.selectedView.PatientType == '2') {
      this.AdmissionID = this.selectedView.IPID;
    }
    this.hospId = sessionStorage.getItem("hospitalId");
    this.fetchDietType();
    this.fetchDiagnosis();
    this.fetchAdminMasters();
    this.fetchHospitalLocations();
    this.fetchReferalAdminMasters();
    this.fetchReasons();
    this.fetchPriority();
  }

  ngAfterViewInit(): void {
    this.fetchAdviceData();
  }

  fetchAdviceData() {
    this.config.fetchAdviceData(this.AdmissionID, this.hospId).subscribe((response) => {

      //const element = this.followup.nativeElement.querySelector('.nav-link');
      //element.click();

      if (response.PatientAdviceDatasList.length > 0) {
        this.adviceToPatient = response.PatientAdviceDatasList[0].Advice;
        this.intMonitorId = response.PatientAdviceDatasList[0].MonitorID;
        this.FollowAfter = response.PatientAdviceDatasList[0].FollowAfter;
      }

      if (response.PatientAdviceReferalDataList.length > 0) {
        //const element = this.referral.nativeElement.querySelector('.nav-link');
        //element.click();
        response.PatientAdviceReferalDataList.forEach((element: any, index: any) => {
          const selectedItem = this.locationList.find((value: any) => value.HospitalID === Number(element.LocationID));
          let refer = {
            "Type": element.IsInternalReferral === true ? 1 : 0,
            "Location": selectedItem.HospitalID,
            "LocationName": selectedItem.Name,
            "SpecialisationDoctorID": element.DoctorID,
            "SpecialisationDoctorName": element.DoctorName,
            "Remarks": element.Remarks,
            "Specialization": element.SpecialiseID,
            "SpecializationName": element.Specialisation,
            "Reason": element.ReasonID,
            "ReasonName": element.ReasonName,
            "Priority": element.Priority,
            "PriorityName": element.PriorityName,
            "Duration": element.duration,
            "Cosession": element.CoSession,
            "REFERRALORDERID": element.ReferralOrderID,
            "BKD": 0,
            "StartDate": element.StartDate,
            "EndDate": element.EndDate,
            "Status": element.Status
          };

          this.referralList.push(refer);
        });
      }

      if (response.PatientAdviceSurgeryDataList.length > 0) {
        //this.SurgeryRequestid = response.PatientAdviceSurgeryDataList[0].SurgeryRequestid;
        //const element = this.surgery.nativeElement.querySelector('.nav-link');
        //element.click();
      }
    },
      (err) => {

      })

  }

  fetchDietTypeOld() {
    this.config.fetchDietTypesOld().subscribe((response) => {
      this.dietType = response.GetMasterDataList;
    });
  }
  fetchDietType() {
    this.config.fetchDietTypes(this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response) => {
      this.dietType = response.FetchAdmissionTypeHDataList;
    });
  }

  fetchAdminMastersOld() {
    this.config.fetchAdminMasters(39).subscribe((response) => {
      this.fetchAdmin = response.SmartDataList;
    });
  }
  fetchAdminMasters() {
    this.config.FetchAdmissionTypeH(this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response) => {
      this.fetchAdmin = response.FetchAdmissionTypeHDataList;
    });
  }

  fetchReferalAdminMasters1() {
    this.config.fetchAdminMasters(11).subscribe((response) => {
      this.SpecializationList = this.SpecializationList1 = response.SmartDataList;
    });
  }
  fetchReferalAdminMasters() {
    this.config.fetchConsulSpecialisation(this.hospId).subscribe((response) => {
      this.SpecializationList = this.SpecializationList1 = response.FetchConsulSpecialisationDataList;
    });
  }

  fetchReasons() {
    this.config.fetchAdminMasters(76).subscribe((response) => {
      this.reasonsList = response.SmartDataList;
    });
  }

  selectedRow(item: any) {
    const selectedItem = this.PatientDiagnosisDataList.find((value: any) => value.Code === item);
    if (selectedItem) {
      selectedItem.selected = !selectedItem.selected;
    }
  }


  futureDatesFilter = (date: Date | null): boolean => {
    const currentDate = new Date();
    return date ? date >= currentDate : false;
  };

  saveAdvice() {
    this.errorMessages = [];

    if (this.referralList.length === 0) {
      this.errorMessages.push("Add atleast one Referral")
    }

    if (this.errorMessages.length > 0) {
      $("#errorReferralMsg").modal('show');
      return;
    }

    this.diagnosis = [];

    this.PatientDiagnosisDataList?.forEach((element: any, index: any) => {
      if (element.selected) {
        this.diagnosis.push({
          "DID": element.DID,
          "DISEASENAME": element.DiseaseName,
          "CODE": element.Code,
          "DTY": element.DiagnosisType,
          "UID": this.doctorDetails[0].EmpId,
          "ISEXISTING": "1",
          "PPID": "0",
          "STATUS": element.STATUS,
          "DTID": element.DTID,
          "DIAGNOSISTYPEID": element.DIAGNOSISTYPEID,
          "ISPSD": "0",
          "REMARKS": "",
          "MNID": element.MonitorID,
          "IAD": "1"
        })
      }
    });

    this.referralList.forEach((element: any, index: any) => {
      this.refDetailsList.push({
        "RTID": element.Reason,
        "SPID": element.Specialization,
        "PRTY": element.Priority,
        "DID": element.SpecialisationDoctorID,
        "RMKS": element.Remarks,
        "BKD": element.BKD,
        "RRMKS": "0",
        "RID": element.Reason,
        "DRN": element.Duration,
        "IIRF": element.Type,
        "COSS": element.Cosession === true ? 1 : 0,
        "RHOSPID": element.Location,
        "REFERRALORDERID": element.REFERRALORDERID
      })
    });

    let payload = {
      "intMonitorID": this.intMonitorId, //this.PatientDiagnosisDataList[0].MonitorID,
      "PatientID": this.selectedView.PatientID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "IPID": this.AdmissionID,
      "SpecialiseID": this.selectedView.SpecialiseID,
      "PatientType": this.selectedView.PatientType,
      "BillID": this.selectedView.BillID,
      "FollowUpType": this.FollowUpType,
      "Advicee": this.adviceToPatient,
      "FollowAfter": this.FollowAfter,
      "FollowUpOn": this.FollowUpOn,
      "DiagDetailsList": this.diagnosis,
      "ReasonforAdm": "",
      "RefDetailsList": this.refDetailsList,
      "LengthOfStay": 0,
      "DietTypeID": 0,
      "FollowUpRemarks": "",
      "PrimaryDoctorID": this.doctorDetails[0].EmpId,
      "AdmissionTypeID": 0,
      "FollowUpCount": this.NoofFollowUp,
      "Followupdays": this.NoofDays,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": sessionStorage.getItem('hospitalId'),
      "BillType": this.selectedView.BillType == 'Insured' ? 'CR' : 'CS',
      "CompanyID": this.selectedView.CompanyID == "" ? 0 : this.selectedView.CompanyID,
      "GradeID": this.selectedView.GradeID,
      "WardID": 0,
      "PrimaryDoctorSpecialiseID": 0
    }

    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.config.saveAdvice(payload).subscribe((response: any) => {
          if (response.Status === "Success" || response.Status === "True") {
            $("#saveReferralMsg").modal("show");
          }
        },
          () => {

          })
      }
      modalRef.close();
    });
  }

  close() {
    this.us.closeModal();
  }

  SaveData() {
    this.savechanges.emit('Advice');
  }

  SaveDiag() {
    this.savechanges.emit('');
  }

  clear() {
    this.clearchanges.emit();
  }

  fetchHospitalLocations() {
    this.config.fetchFetchHospitalLocations().subscribe((response) => {
      if (response.Status === "Success") {
        this.locationList = response.HospitalLocationsDataList;
        
        var res = response.HospitalLocationsDataList.filter((h: any) => h.HospitalID == this.hospId);
        this.referralForm.get('Location')?.setValue(res[0].HospitalID);
        this.referralForm.get('LocationName')?.setValue(res[0].Name);
      } else {
      }
    },
      (err) => {

      })
  }

  fetchPriority() {
    this.config.fetchPriority().subscribe((response) => {
      this.priorityList = response.SmartDataList;
    });
  }

  fetchSpecializationDoctorSearch() {
    this.config.fetchSpecialisationDoctors('%%%', this.referralForm.get("Specialization").value, this.doctorDetails[0].EmpId, this.hospId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.listOfSpecItems = this.listOfSpecItems1 = response.FetchDoctorDataList;
        setTimeout(() => {
          const selectedItem = this.listOfSpecItems.find((value: any) => Number(value.Empid) === Number(this.referralForm.get("SpecialisationDoctorID").value));
          if (selectedItem) {
            this.referralForm.patchValue({
              SpecialisationDoctorName: selectedItem.EmpNo + ' - ' + selectedItem.Fullname,
              SpecialisationDoctorID: selectedItem.Empid
            });
          }
        }, 500);

      }
    }, error => {
      console.error('Get Data API error:', error);
    });

  }

  fetchDoctorSearch(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.config.fetchDoctorSearch(filter).subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfItems = response.ReferalDoctorDataList;
        }
      }, error => {
        console.error('Get Data API error:', error);
      });

    }
    else {
      this.listOfItems = [];
    }
  }

  selectItem(item: any) {
    this.referralForm.patchValue({
      DoctorName: item.DoctorName,
      DoctorID: item.DoctorID
    });

    this.listOfItems = [];
  }

  selectSpecItem(item: any) {
    const selectedItem = this.listOfSpecItems.find((value: any) => Number(value.EmpNo) === Number(item.target.value.split('-')[0].trim()));
    this.referralForm.patchValue({
      SpecialisationDoctorName: item.target.value,
      SpecialisationDoctorID: selectedItem.Empid
    });
  }

  doctorType(type: any) {
    if (type == 1) {
      $("#btnInternal").addClass("selected");
      $("#btnExternal").removeClass("selected");
    }
    else {
      $("#btnInternal").removeClass("selected");
      $("#btnExternal").addClass("selected");
    }

    this.referralForm.patchValue({
      Type: type
    });
    this.listOfSpecItems = [];
  }

  addReferral() {
    this.errorMessages = [];
    if (!this.referralForm.get("Location").value || this.referralForm.get("Location").value === "0") {
      this.errorMessages.push("Select Refer to Location")
    }

    if (!this.referralForm.get("SpecialisationDoctorName").value) {
      this.errorMessages.push("Add the Specialization Doctor Details")
    }

    if (!this.referralForm.get("Remarks").value) {
      this.referralRemarks = true;
      this.errorMessages.push("Enter Referral Remarks")
    }

    if (!this.referralForm.get("Specialization").value || this.referralForm.get("Specialization").value === "0") {
      this.referralSpecialization = true;
      this.errorMessages.push("Select Specialization")
    }

    if (!this.referralForm.get("Reason").value || this.referralForm.get("Reason").value === "0") {
      this.referralReason = true;
      this.errorMessages.push("Select Reason")
    }

    if (!this.referralForm.get("Priority").value || this.referralForm.get("Priority").value === "0") {
      this.referralPriority = true;
      this.errorMessages.push("Select Priority")
    }
    if (!this.referralForm.get("Duration").value && this.selectedView.PatientType === '2') {
      this.referralRemarks = true;
      this.errorMessages.push("Enter Duration")
    }
    if (this.referralForm.get("Duration").value === "0" && this.selectedView.PatientType === '2') {
      this.referralRemarks = true;
      this.errorMessages.push("Duration cant be zero")
    }

    // var reflist = this.referralList.filter((x: any) => x.SpecialisationDoctorID === this.referralForm.get('SpecialisationDoctorID')?.value);
    // if (reflist.length > 0) {
    //   this.errorMessages.push("Referral Doctor Already Added")
    // }
    const refDocExists = this.referralList.filter((x: any) => x.SpecialisationDoctorID === this.referralForm.get("SpecialisationDoctorID").value);
    if (refDocExists.length > 0 && this.selectedView.PatientType === '2') {
      refDocExists.forEach((element: any, index: any) => {
        const today = new Date();
        const enddate = new Date(element.EndDate);
        if (today < enddate) {
          this.errorMessages.push("Referral Doctor Already Added");
        }
      });
    }
    if (this.errorMessages.length > 0) {
      $("#errorReferralMsg").modal('show');
      return;
    }

    var res = this.locationList.filter((h: any) => h.HospitalID == this.hospId);
    if (this.selectedView.PatientType === '2') {
      var enddate = new Date(new Date().setDate(new Date().getDate() + Number(this.referralForm.get("Duration").value)));
      this.referralForm.patchValue({
        "StartDate": moment(new Date()).format('DD-MMM-YYYY'),
        "EndDate": moment(enddate).format('DD-MMM-YYYY')
      });
    }

    this.referralList.push(this.referralForm.value);
    this.referralForm = this.fb.group({
      Type: [1, Validators.required],
      Location: [res[0].HospitalID, Validators.required],
      LocationName: [res[0].Name, Validators.required],
      DoctorID: ['', Validators.required],
      DoctorName: ['', Validators.required],
      Remarks: ['', Validators.required],
      Specialization: [0, Validators.required],
      SpecializationName: ['', Validators.required],
      Reason: [0, Validators.required],
      ReasonName: ['', Validators.required],
      Priority: [0, Validators.required],
      PriorityName: ['', Validators.required],
      Duration: ['', Validators.required],
      Cosession: [false, Validators.required],
      REFERRALORDERID: [0],
      BKD: [0],
      SpecialisationDoctorName: ['0', Validators.required],
      SpecialisationDoctorID: ['', Validators.required],
      StartDate: [''],
      EndDate: ['']
    });


    if (this.locationList.length == 1) {
      this.referralForm.get('Location')?.setValue(this.locationList[0].HospitalID);
      this.referralForm.get('LocationName')?.setValue(this.locationList[0].Name);
    }

    this.doctorType(1);
  }

  locationChange(data: any) {
    const selectedItem = this.locationList.find((value: any) => value.HospitalID === Number(data.target.value));
    this.referralForm.patchValue({
      Location: selectedItem.HospitalID,
      LocationName: selectedItem.Name
    });
  }

  specializationChange(data: any) {
    const selectedItem = this.SpecializationList.find((value: any) => value.id === Number(data.target.value));
    this.referralForm.patchValue({
      Specialization: selectedItem.id,
      SpecializationName: selectedItem.name
    });
    this.fetchSpecializationDoctorSearch();
  }

  reasonChange(data: any) {
    const selectedItem = this.reasonsList.find((value: any) => value.id === Number(data.target.value));
    this.referralForm.patchValue({
      Reason: selectedItem.id,
      ReasonName: selectedItem.name
    });
  }

  priorityChange(data: any) {
    const selectedItem = this.priorityList.find((value: any) => value.id === Number(data.target.value));
    this.referralForm.patchValue({
      Priority: selectedItem.id,
      PriorityName: selectedItem.name
    });
  }

  deleteItem(item: any) {
    item.BKD = 1;
  }

  editRow(row: any, editIndex: any) {
    this.editIndex = editIndex;
    this.referralForm.patchValue({
      Type: row.Type,
      Location: row.Location,
      LocationName: row.LocationName,
      DoctorID: row.DoctorID,
      DoctorName: row.DoctorName,
      Remarks: row.Remarks,
      Specialization: row.Specialization,
      SpecializationName: row.SpecializationName,
      Reason: row.Reason,
      ReasonName: row.ReasonName,
      Priority: row.Priority,
      PriorityName: row.PriorityName,
      Duration: row.Duration,
      Cosession: row.Cosession,
      SpecialisationDoctorID: row.SpecialisationDoctorID,
      SpecialisationDoctorName: row.SpecialisationDoctorName
    });

    this.fetchSpecializationDoctorSearch();

    this.doctorType(row.Type);
    this.isEdit = true;
  }

  updateReferral() {
    this.errorMessages = [];
    if (!this.referralForm.get("Location").value || this.referralForm.get("Location").value === "0") {
      this.errorMessages.push("Select Refer to Location")
    }

    if (!this.referralForm.get("SpecialisationDoctorName").value) {
      this.errorMessages.push("Add the Specialization Doctor Details")
    }

    if (!this.referralForm.get("Remarks").value) {
      this.errorMessages.push("Enter Referral Remarks")
    }

    if (!this.referralForm.get("Specialization").value || this.referralForm.get("Specialization").value === "0") {
      this.errorMessages.push("Select Specialization")
    }

    if (!this.referralForm.get("Reason").value || this.referralForm.get("Reason").value === "0") {
      this.errorMessages.push("Select Reason")
    }

    if (!this.referralForm.get("Priority").value || this.referralForm.get("Priority").value === "0") {
      this.errorMessages.push("Select Priority")
    }

    if (this.errorMessages.length > 0) {
      $("#errorReferralMsg").modal('show');
      return;
    }

    this.isEdit = false;
    var enddate = new Date(new Date().setDate(new Date().getDate() + Number(this.referralForm.get("Duration").value)));
    this.referralForm.patchValue({
      "StartDate": moment(new Date()).format('DD-MMM-YYYY'),
      "EndDate": moment(enddate).format('DD-MMM-YYYY')
    });

    this.referralList[this.editIndex].Type = this.referralForm.get("Type").value;
    this.referralList[this.editIndex].Location = this.referralForm.get("Location").value;
    this.referralList[this.editIndex].LocationName = this.referralForm.get("LocationName").value;
    this.referralList[this.editIndex].DoctorID = this.referralForm.get("DoctorID").value;
    this.referralList[this.editIndex].DoctorName = this.referralForm.get("DoctorName").value;
    this.referralList[this.editIndex].Remarks = this.referralForm.get("Remarks").value;
    this.referralList[this.editIndex].Specialization = this.referralForm.get("Specialization").value;
    this.referralList[this.editIndex].SpecializationName = this.referralForm.get("SpecializationName").value;
    this.referralList[this.editIndex].Reason = this.referralForm.get("Reason").value;
    this.referralList[this.editIndex].ReasonName = this.referralForm.get("ReasonName").value;
    this.referralList[this.editIndex].Priority = this.referralForm.get("Priority").value;
    this.referralList[this.editIndex].PriorityName = this.referralForm.get("PriorityName").value;
    this.referralList[this.editIndex].Duration = this.referralForm.get("Duration").value;
    this.referralList[this.editIndex].Cosession = this.referralForm.get("Cosession").value;
    this.referralList[this.editIndex].SpecialisationDoctorName = this.referralForm.get("SpecialisationDoctorName").value;
    this.referralList[this.editIndex].SpecialisationDoctorID = this.referralForm.get("SpecialisationDoctorID").value;
    this.referralList[this.editIndex].StartDate = this.referralForm.get("StartDate").value;
    this.referralList[this.editIndex].EndDate = this.referralForm.get("EndDate").value;

    this.referralForm = this.fb.group({
      Type: [1, Validators.required],
      Location: [0, Validators.required],
      LocationName: ['', Validators.required],
      DoctorID: ['', Validators.required],
      DoctorName: ['', Validators.required],
      Remarks: ['', Validators.required],
      Specialization: [0, Validators.required],
      SpecializationName: ['', Validators.required],
      Reason: [0, Validators.required],
      ReasonName: ['', Validators.required],
      Priority: [0, Validators.required],
      PriorityName: ['', Validators.required],
      Duration: ['', Validators.required],
      Cosession: [false, Validators.required],
      REFERRALORDERID: [0],
      BKD: [0],
      SpecialisationDoctorName: ['0', Validators.required],
      SpecialisationDoctorID: ['', Validators.required]
    });

    if (this.locationList.length == 1) {
      this.referralForm.get('Location')?.setValue(this.locationList[0].HospitalID);
      this.referralForm.get('LocationName')?.setValue(this.locationList[0].Name);
    }

    this.doctorType(1);
  }

  fetchEquipments(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.config.fetchSurgeryEquipments(filter, this.hospId).subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfEquipmentItems = response.FetchSurgeryEquipmentsFDataList;
        }
      }, error => {
        console.error('Get Data API error:', error);
      });

    }
    else {
      this.listOfEquipmentItems = [];
    }
  }

  checkProcedureCanPrescribe(data: any) {
    let SpecialiseID: any;
    this.config.FetchSpecialisationSurgery(data.ProcedureID, this.hospId).subscribe((response) => {
      this.SurgeryList = response.FetchSpecialisationSurgeryOutputLists;
      return this.SurgeryList[0].SpecialiseID;
    });
    // let find = this.SurgeryList.filter((x: any) => x?.ProcedureID === data.ProcedureID);
    // if (find) {
    //   find.forEach((element: any, index: any) => {
    //     find[index].SpecialiseID = this.doctorDetails[0].EmpSpecialisationId
    //   });
    // }

    //   if(this.doctorDetails[0].EmpSpecialisationId==SpecialiseID[0].SpecialiseID)
    //     return true;
    //  else 
    //     return false;





    // switch(this.doctorDetails[0].EmpSpecialisationId)
    // {
    // case "78":
    //   return this.defObGynProcedures.includes(data.ProcedureID);
    // case "247":
    //   return this.defGitProcedures.includes(data.ProcedureID);
    // case "106":
    //   return this.defGsProcedures.includes(data.ProcedureID);
    // case "34":
    //   return this.defEntProcedures.includes(data.ProcedureID);
    // case "89":
    //     return this.defEntProcedures.includes(data.ProcedureID);
    //   default:
    //     return false;
    // }
  }

  clearCannotPrescriveProcName() {
    this.cannotPrescribeProcName = "";
  }

  fetchPriorities() {
    this.config.fetchSurgeryPriority().subscribe((response) => {
      this.priorities = response.SmartDataList;
    });
  }

  fetchSurgeryDoctors() {
    //var docid = this.selectedView.PatientType == '1' ? this.doctorDetails[0].EmpId : this.selectedView.ConsultantID;
    var docid = this.doctorDetails[0].EmpId;
    this.config.fetchSurgeryDoctors(docid, this.hospId).subscribe((response) => {
      this.doctorsList = response.FetchSurgeryDoctorsDataList;
    });
  }

  getDepartments(item: any) {
    this.config.fetchSurgeryDoctorDept(item.get('Surgeon').value, this.hospId).subscribe((response) => {
      this.departments = response.FetchSurgeryDoctorDeptDataaList;
      item.get('DepartmentList').value = this.departments;
      setTimeout(() => {
        item.get('Department')?.setValue(this.departments[0].DepartmentID);
      }, 1000);

    });
  }

  togglePrimary(item: any) {
    const primaryValue = item.get('Primary')?.value;
    item.patchValue({ Primary: !primaryValue });
  }

  closeOtSchedule() {
    const isScheduled = sessionStorage.getItem("isScheduled") || 'false';
    // if(isScheduled === 'false') {
    //   this.isNotScheduled = true;
    //   return;
    // }
    sessionStorage.removeItem("otpatient");
    sessionStorage.removeItem("fromCasesheet");
    sessionStorage.removeItem("isScheduled");
    this.fromCasesheet = false;
    $("#otdoctorAppointment").modal('hide');
    $("#saveSurgeryMsg").modal("show");
  }

  fetchotdetails(surReqId: any) {
    const fromdate = moment(new Date()).format('DD-MMM-YYYY');
    const todate = moment(new Date()).format('DD-MMM-YYYY');
    const SSNN = this.selectedView.SSN;
    this.config.FetchSurgerRecordsForDashboard(fromdate, todate, SSNN, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response: any) => {
      if (response.Code == 200) {
        const item = response.SurgeryRequestsDataList.find((x: any) => x.SurgeryRequestid == surReqId);
        sessionStorage.setItem("otpatient", JSON.stringify(item));
        sessionStorage.setItem("fromCasesheet", 'true');
        this.fromCasesheet = true;
        setTimeout(() => {
          $("#otdoctorAppointment").modal('show');
        });
      }
    });
  }

  searchSpecItem(event: any) {
    const item = event.target.value;
    this.SpecializationList = this.SpecializationList1;
    let arr = this.SpecializationList1.filter((spec: any) => spec.name.toLowerCase().indexOf(item.toLowerCase()) === 0);
    this.SpecializationList = arr.length ? arr : [{ name: 'No Item found' }];
  }

  onSpecItemSelected(item: any) {
    this.referralForm.patchValue({
      Specialization: item.id,
      SpecializationName: item.name
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

  onDocItemSelected(item: any) {
    this.referralForm.patchValue({
      SpecialisationDoctorName: item.EmpNo + '-' + item.Fullname,
      SpecialisationDoctorID: item.Empid
    });
  }

  cosessionClick() {
    this.Cosession = !this.Cosession;
    this.referralForm.patchValue({
      Cosession: this.Cosession
    })
  }
 
  openPrenatalForm(val: string) {
    this.obgyneFormType = val;
    this.activeAssessmentTab = val;
    this.selectedView.BMI = this.smartDataList && this.smartDataList[0]?.BMI;
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
  }
  showHideAsmntsFormsTabs() {
    this.showHideFormTabs = !this.showHideFormTabs;
  }

}

