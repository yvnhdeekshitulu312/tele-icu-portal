import { Component, OnInit, ElementRef, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { ConfigService } from 'src/app/ward/services/config.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';
import { InstructionsToNurseComponent } from 'src/app/portal/instructions-to-nurse/instructions-to-nurse.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from '../../shared/generic-modal-builder.service';
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
  selector: 'app-op-progress-notes',
  templateUrl: './op-progress-notes.component.html',
  styleUrls: ['./op-progress-notes.component.scss'],
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
export class OpProgressNotesComponent implements OnInit {

 currentdate: any;
   patientDetails: any;
   doctorDetails: any;
   facility: any;
   notesTypes: any= [];
   progressNotesVitals: any[] = [];
   progressNotesDiagnosis: any;
   progressNotesVitalsNN: any;
   viewProgressNotesData: any[] = [];
   hospId: any;
   btnSaveEnable: boolean = true;
   btnSaveEnableLoad: boolean = false;
   complaientEnable: boolean = false;
   errorMessage: string = '';
   filteredViewProgressNotesData: any[] = [];
   monitorId: any;
   NoteEmployeeId: any;
   progressNotesForm: FormGroup;
   viewProgressNotesForm: FormGroup;
   selectedOption: string = 'All';
   IsHeadNurse: any;
   IsHome = true;
   IsEditAddEndum: boolean = false;
   IsEditNotAddEndum: boolean = true;
   patinfo: any;
   NurseAlliged: boolean = false;
   IsDoctor: any;
   notesTypesdisable = false;
   tableVitalsListFiltered: any;
   tableVitalsList: any;
 
   constructor(private fb: FormBuilder, private config: ConfigService, private router: Router, public datepipe: DatePipe, private modalService: GenericModalBuilder) {
     this.progressNotesForm = this.fb.group({
       NoteID: ['0'],
       Note: [''],
       DomainID: ['0'],
       ProblemList: [''],
       Subjective: [''],
       Objective: [''],
       Assessment: [''],
       Plan: [''],
       InterventionsNotes: [''],
       NurseAlligedhealthCareNotes: [''],
       ObservationBy: [''],
       CurrentDate: [''],
       AddEndnum: ['']
     });
     this.viewProgressNotesForm = this.fb.group({
       FromDate: [''],
       ToDate: [''],
     });
 
     const emergencyValue = sessionStorage.getItem("FromEMR");
     if (emergencyValue !== null && emergencyValue !== undefined) {
       this.IsHome = !(emergencyValue === 'true');
     } else {
       this.IsHome = true;
     }
   }
 
   ngOnInit(): void {
     this.currentdate = moment(new Date()).format('DD-MMM-YYYY, H:mm',);
     this.hospId = sessionStorage.getItem("hospitalId");
     this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
     this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
     this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
     this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
     this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
     this.patientDetails.IPID = this.patientDetails.AdmissionID;
     var wm = new Date();
     var d = new Date();
     wm.setMonth(wm.getMonth() - 1);
     d.setDate(d.getDate() + 1);
     this.viewProgressNotesForm.patchValue({
       FromDate: wm,
       ToDate: d
     });
     this.progressNotesForm.patchValue({
       ObservationBy: this.doctorDetails[0].EmployeeName,
       CurrentDate: new Date()
     });
     this.fetchNotesTypes();
     this.fetchProgressNotesVitals();
     this.fetchProgressNotesDiagnosis();
     // this.fetchProgressNotesSaved();
   }
 
   fetchNotesTypes() {
     this.config.fetchUserNotes(this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response) => {
       if (response.Status === "Success") {
         this.notesTypes = response.FetchUserNotesDataList;
 
         // if (this.notesTypes.length >0) {
         //   this.notesTypesdisable=true;
         // }
         this.progressNotesForm.patchValue({
           DomainID: this.notesTypes[0].Value
         });
 
         if (this.notesTypes[0].Value == "3")
           this.NurseAlliged = false;
         else
           this.NurseAlliged = true;
         //}
       } else {
       }
     },
       (err) => {
 
       })
   }
 
   onVoiceTextChange(text: any ) {
     const currentValue = this.progressNotesForm.get('NurseAlligedhealthCareNotes')?.value;
     let delimiter = '';
     if(currentValue) {
       delimiter = '\n';
     }
     this.progressNotesForm.get('NurseAlligedhealthCareNotes')?.setValue(currentValue + delimiter + text);
   }
 
   fetchProgressNotesVitals() {
     // this.config.fetchProgressNoteVitals(this.patientDetails.IPID, this.patientDetails.PatientID, this.patientDetails.GenderID, this.doctorDetails[0].EmpId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response) => {
     //   if (response.Status === "Success") {
     //     this.progressNotesVitals = response.FetchProgressNoteVitalsDataList;
     //   } else {
     //   }
     // },
     //   (err) => {
 
     //   })
 
     this.progressNotesVitals.push({ "VitalSign" : 'BP -Systolic', "VALUE" : this.patientDetails.BPSystolic });
     this.progressNotesVitals.push({ "VitalSign" : 'BP-Diastolic', "VALUE" : this.patientDetails.BPDiastolic });
     this.progressNotesVitals.push({ "VitalSign" : 'Temperature', "VALUE" : this.patientDetails.Temperature });
     this.progressNotesVitals.push({ "VitalSign" : 'Pulse', "VALUE" : this.patientDetails.Pulse });
     this.progressNotesVitals.push({ "VitalSign" : 'SPO2', "VALUE" : this.patientDetails.SPO2 });
     this.progressNotesVitals.push({ "VitalSign" : 'Respiration', "VALUE" : this.patientDetails.Respiration });
     this.progressNotesVitals.push({ "VitalSign" : 'Consciousness', "VALUE" : this.patientDetails.Consciousness });
     this.progressNotesVitals.push({ "VitalSign" : 'O2 Flow Rate', "VALUE" : this.patientDetails.O2FlowRate });
 
     var BPSystolic="BP -Systolic :"+ this.patientDetails.BPSystolic;
     var BPDiastolic="BP-Diastolic :"+ this.patientDetails.BPDiastolic;
     var Temperature="Temperature :"+this.patientDetails.Temperature;
     var Pulse="Pulse :"+this.patientDetails.Pulse;
     var SPO2="SPO2 :"+this.patientDetails.SPO2;
     var Respiration="Respiration :"+this.patientDetails.Respiration;
     var Consciousness="Consciousness :"+this.patientDetails.Consciousness;
     var O2FlowRate="O2 Flow Rate :"+this.patientDetails.O2FlowRate;
 
     this.progressNotesVitalsNN=BPSystolic+";"+BPDiastolic+";"+Temperature+Pulse+";"+SPO2+Respiration+";"+Consciousness+";"+O2FlowRate;
   }
   fetchProgressNotesDiagnosis() {
     this.config.fetchProgressNoteDiagnosis(this.patientDetails.IPID, this.hospId).subscribe((response) => {
       if (response.Status === "Success") {
         this.progressNotesDiagnosis = response.FetchProgressNoteDiagnosisDataaList;
         this.progressNotesForm.patchValue({
           Assessment: this.progressNotesDiagnosis[0].FinalDiagnosis + " " + this.progressNotesDiagnosis[0].ProvisionalDiagnosis
         });
       } else {
       }
     },
       (err) => {
 
       })
   }
   fetchProgressNotesSaved() {
     var FromDate = this.datepipe.transform(this.viewProgressNotesForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
     var ToDate = this.datepipe.transform(this.viewProgressNotesForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
     var UserID = this.doctorDetails[0].UserId;
     this.config.FetchMainProgressNoteHH(this.patientDetails.IPID, FromDate, ToDate, UserID, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospId).subscribe((response) => {
       if (response.Status === "Success") {
         this.viewProgressNotesData = response.FetchMainProgressNoteDataList;
         this.filteredViewProgressNotesData = this.viewProgressNotesData;
         this.tableVitalsList = response.FetchMainProgressNoteDataList;
         const distinctThings = response.FetchMainProgressNoteDataList.filter(
           (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.NoteDate === thing.NoteDate) === i);
         this.filteredViewProgressNotesData = distinctThings;
 
 
       } else {
       }
     },
       (err) => {
 
       })
   }
   filterFunction(vitals: any, visitid: any) {
     return vitals.filter((buttom: any) => buttom.NoteDate == visitid);
   }
   changeNotesType(event: any) {
     this.progressNotesForm.patchValue({
       DomainID: event.target.value
     });
     if (event.target.value == "3")
       this.NurseAlliged = false;
     else
       this.NurseAlliged = true;
   }
   saveProgressNotes() {
     if (this.progressNotesForm.get('Subjective')?.value === "" && !this.NurseAlliged) {
       this.complaientEnable = false;
       this.errorMessage = 'Please enter Chief Complaints / Subjective';
       return;
     } else {
       this.complaientEnable = true;
       let progressNotesPayload =
       {
         "NoteID": this.progressNotesForm.get('NoteID')?.value,
         "IPID": this.patientDetails.IPID,
         "EmployeeID": this.doctorDetails[0].EmpId,
         "BedID": this.patientDetails.BedID,
         "Note": "",
         "UserId": this.doctorDetails[0].UserId,
         "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
         "HospitalID": this.hospId,
         "PatientID": this.patientDetails.PatientID,
         "PatientType": this.patientDetails.PatientType,
         "DomainID": this.progressNotesForm.get('DomainID')?.value,
         "ProblemList": "",
         "Subjective": this.progressNotesForm.get('Subjective')?.value,
         "Objective": this.progressNotesForm.get('Objective')?.value,
         "Assessment": this.progressNotesForm.get('Assessment')?.value,
         "Plan": this.progressNotesForm.get('Plan')?.value,
         "MonitorID": 0,
         "Interventions": this.progressNotesForm.get('InterventionsNotes')?.value,
         "NurseAlliged": this.progressNotesForm.get('NurseAlligedhealthCareNotes')?.value,
         "Vitals": this.progressNotesVitalsNN
       }
       this.config.saveProgressNotes(progressNotesPayload).subscribe(
         (response) => {
           if (response.Code == 200) {
             $("#progressNotesSaveMsg").modal('show');
             this.clearProgressNotes();
           } else {
 
           }
         },
         (err) => {
           console.log(err)
         });
     }
   }
 
   ModifyProgressNotes() {
     let progressNotesPayload =
     {
       "NoteID": this.progressNotesForm.get('NoteID')?.value,
       "IPID": this.patientDetails.IPID,
       "EmployeeID": this.doctorDetails[0].EmpId,
       "BedID": this.patientDetails.BedID,
       "Note": "",
       "UserId": this.doctorDetails[0].UserId,
       "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
       "HospitalID": this.hospId,
       "PatientID": this.patientDetails.PatientID,
       "PatientType": this.patientDetails.PatientType,
       "DomainID": this.progressNotesForm.get('DomainID')?.value,
       "Subjective": this.progressNotesForm.get('Subjective')?.value,
       "Objective": this.progressNotesForm.get('Objective')?.value,
       "Assessment": this.progressNotesForm.get('Assessment')?.value,
       "Plan": this.progressNotesForm.get('Plan')?.value,
       "MonitorID": this.monitorId,//this.progressNotesForm.get('MonitorID')?.value,
       "Interventions": this.progressNotesForm.get('InterventionsNotes')?.value,
       "ProblemList": this.progressNotesForm.get('AddEndnum')?.value,
       "NurseAlliged": this.progressNotesForm.get('NurseAlligedhealthCareNotes')?.value,
       "Vitals": this.progressNotesVitalsNN
     }
     this.config.saveProgressNotes(progressNotesPayload).subscribe(
       (response) => {
         if (response.Code == 200) {
           $("#progressNotesSaveMsg").modal('show');
           this.clearProgressNotes();
         } else {
 
         }
       },
       (err) => {
         console.log(err)
       });
 
   }
 
   navigatetoBedBoard() {
     if (this.IsHeadNurse == 'true' && !this.IsHome)
       this.router.navigate(['/emergency/beds']);
     else
       this.router.navigate(['/ward']);
     sessionStorage.setItem("FromEMR", "false");
   }
   EditNurseNotes(notes: any) {
 
     this.progressNotesForm.patchValue({
       NoteID: notes.NoteID,
       Note: notes.Note,
       DomainID: notes.NoteTypeID,
       ProblemList: notes.ProblemList,
       Subjective: notes.Subjective,
       Objective: notes.Objective,
       Assessment: notes.Assessment,
       Plan: notes.NurseNotePlan,
       InterventionsNotes: notes.InterventionsNotes,
       AddEndnum: notes.ProblemList,
       NurseAlligedhealthCareNotes: notes.NurseAlligedhealthCareNotes,
       CurrentDate: new Date(notes.NoteDateonly)
 
     });
     this.monitorId = notes.MonitorID;
     this.NoteEmployeeId = notes.EmployeeID;
     this.btnSaveEnable = false;
     this.btnSaveEnableLoad = notes.IsModifyEnable;
     this.IsEditAddEndum = true;
 
     const currentTime = new Date();
     const timeDiff = currentTime.getHours() - new Date(notes.NoteDate).getHours();
     if(timeDiff > Number(this.doctorDetails[0].ProgressNoteEditHrs)) {
       this.IsEditNotAddEndum = false;
     }
     else {
       this.IsEditNotAddEndum = true;
     }
     $("#viewNotemodal").modal('hide');
   }
   openViewNotesModal() {
     this.fetchProgressNotesSaved();
     $("#viewNotemodal").modal('show');
   }
   clearProgressNotes() {
     this.btnSaveEnable = true;
     this.btnSaveEnableLoad = false;
     this.progressNotesForm.patchValue({
       NoteID: ['0'],
       Note: [''],
       DomainID: this.notesTypes[0].Value,
       ProblemList: [''],
       Subjective: [''],
       Objective: [''],
       Assessment: [''],
       Plan: [''],
       InterventionsNotes: [''],
       AddEndnum: [''],
       NurseAlligedhealthCareNotes: [''],
       ObservationBy: this.doctorDetails[0].EmployeeName,
       CurrentDate: new Date()
     });
   }
   selectOption(option: string) {
     this.filteredViewProgressNotesData = [];
     var filteredData: any[] = [];
     this.selectedOption = option;
     if (option === "All") {
       filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData));
     } else if (option === "Doctor") {
       filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "3")));
     } else if (option === "Nurse") {
       filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "1")));
     } else {
       filteredData = JSON.parse(JSON.stringify(this.viewProgressNotesData.filter((x: any) => x?.NoteTypeID === "0")));
     }
     const distinctThings = filteredData.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.NoteDate === thing.NoteDate) === i);
     this.filteredViewProgressNotesData = distinctThings;
   }
 
   DeleteProgressNotes() {
     if (this.doctorDetails[0].EmpId == this.NoteEmployeeId) {
       let progressNotesPayload =
       {
         "NoteID": this.progressNotesForm.get('NoteID')?.value,
         "UserId": this.doctorDetails[0].UserId,
         "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
         "HospitalID": this.hospId
       }
       this.config.DeleteProgressNote(progressNotesPayload).subscribe(
         (response) => {
           if (response.Code == 200) {
             $("#progressNotesdeleteMsg").modal('show');
             this.clearProgressNotes();
           } else {
 
           }
         },
         (err) => {
           console.log(err)
         });
 
     } else {
       $("#progressNotesErrorMsg").modal('show');
     }
 
   }
   openQuickActions() {
     this.patinfo = this.patientDetails;
     $("#quickaction_info").modal('show');
   }
   clearPatientInfo() {
     this.patinfo = "";
   }
   closeModal() {
     $("#quickaction_info").modal('hide');
   }
 
   openNurseInstructions() {
     const options: NgbModalOptions = {
       size: 'xxl',
       windowClass : 'vte_view_modal'
     };
     const modalRef = this.modalService.openModal(InstructionsToNurseComponent, {
       data: "doctorinstructions",
       readonly: true
     }, options);
   }
   viewMoreChiefComplaints() {
     $("#viewMoreChiefComplaints").modal('show');
   }
 }
 