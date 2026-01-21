import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';

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
  selector: 'app-others-adverse',
  templateUrl: './others-adverse.component.html',
  styleUrls: ['./others-adverse.component.scss']
})
export class OthersAdverseComponent implements OnInit {
  selectedView: any;
  HospitalID: any;
  PatientID: any;
  patientDetails: any;
  RegCode: any;
  langData: any;
  doctorDetails: any;
  FetchEventTypeDataList: any = [];
  ManifestationDataList: any = [];
  SeriousnessAdverseNameDataList: any = [];
  ActiontakenNameNDataList: any = [];
  OutcomeOfCaseNameNDataList: any = [];
  VaccineAdverseEventNameNDataList: any = [];
  FetchAdvPatientAllergiesFDataList: any = [];
  FetchAdvPatientActiveMedicationFDataList: any = [];
  FetchAdvPatientVaccinationList: any = [];
  FetchUsersGroupsFDataList: any = [];
  doctorName: any;
  eventType: string = 'drug';
  selectedAdmissionId: any;
  adverseEventForm: FormGroup;
  selectedADRManifestations: any = [];
  suspectedDrugs: any = [];
  seriousnessEffects: any = [];
  actionsTaken: any = [];
  outcomeCases: any = [];
  vaccineAdverseEvent: any = [];
  vaccineDetails: any = [];
  rodNurseSearch: any = [];
  doctorSearch: any = [];
  endofEpisode: boolean = false;
  toggleEventType(eventType: string): void {
    this.eventType = eventType;
  }

  showTextArea(): boolean {
    // Check if "Others" is selected in ManifestationDataList
    return this.ManifestationDataList.some((item: any) => item.Manifestation === 'Other (specify)' && item.isSelected);
  }

  constructor(private fb: FormBuilder, private config: ConfigService, public datepipe: DatePipe, private router: Router) {
    this.adverseEventForm = this.fb.group({
      AdverseEventDate: [''],
      EventTypeId: [''],
      IncidentDate: [''],
      NotifiedRODDate: [''],
      NotifiedMRPDate: [''],
      ADRDescription: [''],
      RODNurseEMPID: [''],
      RODNurseDate: [''],
      ClinicalConditionalSummary: [''],
      PhysicianSignatureDate: [''],
      VaccineGivenempid: [''],
      VaccineGivenDate: [''],
      NurseName:[''],
      NurseID: [''],
      DoctorName: [''],
      DoctorID: ['']
    });
    this.langData = this.config.getLangData();
  }

  ngOnInit(): void {
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.PatientID = this.selectedView.PatientID;
    this.RegCode = this.patientDetails.RegCode;
    this.selectedAdmissionId = sessionStorage.getItem("selectedPatientAdmissionId");
    this.fetchAdverseFormsMasters();
    this.fetchAdvPatientAllergies();
    this.fetchAdvPatientActiveMedication();
    this.fetchUsersGroups();
    if (sessionStorage.getItem("ISEpisodeclose") === "true") {
      this.endofEpisode = true;
    } else {
      this.endofEpisode = false;
    }

    var d = new Date();
    this.adverseEventForm.patchValue({
      AdverseEventDate: d, IncidentDate: d, NotifiedRODDate: d, NotifiedMRPDate: d, RODNurseDate: d, PhysicianSignatureDate: d,
      DoctorName: this.doctorName, DoctorID: this.doctorDetails[0].EmpId, NurseName: this.doctorName, NurseID: this.doctorDetails[0].EmpId
    })

  }

  fetchRODNurse(event:any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
    this.config.fetchRODNurses(filter, this.HospitalID)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          this.rodNurseSearch = response.FetchRODNursesDataList;
        }
      },
        (err) => {
        })
      }
  }
  onItemSelected(item: any) {
    this.adverseEventForm.patchValue({
      NurseName: item.Fullname, NurseID: item.Empid
    })
  }
  fetchDoctor(event:any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
    this.config.fetchDoctor(filter, this.HospitalID)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          this.doctorSearch = response.FetchDoctorDataList;
        }
      },
        (err) => {
        })
      }
  }
  onDoctorItemSelected(doc:any) {
    this.adverseEventForm.patchValue({
      DoctorName: doc.Fullname, DoctorID: doc.Empid
    })
  }
  fetchSavedAdverseEvents() {
    this.config.fetchSavedAdverseEvents(this.selectedAdmissionId, this.HospitalID)
      .subscribe((response: any) => {
        if (response.Status === "Success" && response.FetchPatientAllAdverseEventsFDataList.length > 0) {
          this.adverseEventForm.patchValue({
            AdverseEventDate: moment(response.FetchPatientAllAdverseEventsFDataList[0].AdverseEventDate), 
            EventTypeId: response.FetchPatientAllAdverseEventsFDataList[0].EventTypeId,
            IncidentDate: moment(response.FetchPatientAllAdverseEventsFDataList[0].IncidentDate),            
            NotifiedRODDate: moment(response.FetchPatientAllAdverseEventsFDataList[0].NotifiedRODDate),
            NotifiedMRPDate: moment(response.FetchPatientAllAdverseEventsFDataList[0].NotifiedMRPDate),
            ADRDescription: response.FetchPatientAllAdverseEventsFDataList[0].ADRDescription,
            RODNurseEMPID: response.FetchPatientAllAdverseEventsFDataList[0].ADRDescriptionRODNurseEMPID,
            RODNurseDate: moment(response.FetchPatientAllAdverseEventsFDataList[0].RODNurseDate),
            ClinicalConditionalSummary: response.FetchPatientAllAdverseEventsFDataList[0].ClinicalConditionalSummary,
            PhysicianSignatureDate: moment(response.FetchPatientAllAdverseEventsFDataList[0].PhysicianSignatureDate),
            VaccineGivenempid: response.FetchPatientAllAdverseEventsFDataList[0].VaccineGivenempid,
            VaccineGivenDate: moment(response.FetchPatientAllAdverseEventsFDataList[0].VaccineGivenDate),
            DoctorName: response.FetchPatientAllAdverseEventsFDataList[0].Physician, 
            DoctorID: response.FetchPatientAllAdverseEventsFDataList[0].DoctorId,
            NurseName: response.FetchPatientAllAdverseEventsFDataList[0].RODNurse, 
            NurseID: response.FetchPatientAllAdverseEventsFDataList[0].RODNurseEMPID,            
          })
          response.FetchPatientADRManifestationDataList.forEach((element: any, index: any) => {
            this.selectedADRManifestations.push({
              "ID": element.ADRManifestationID,
              "RMK": ""
            });
            let findAdrMani = this.ManifestationDataList.filter((a: any) => a.ADRManifestationID == element.ADRManifestationID);
            if (findAdrMani)
              findAdrMani[0].isSelected = true;
          });
          response.FetchPatientAdverseSuspectedDataList.forEach((element: any, index: any) => {
            this.suspectedDrugs.push({
              "PRID": element.PrescriptionId,
              "IID": element.ItemID,
            });
            let findSusDrug = this.FetchAdvPatientActiveMedicationFDataList.filter((a: any) => a.ItemID == element.ItemID);
            if (findSusDrug)
              findSusDrug[0].isSelected = true;
          });
          response.FetchPatientActiontakenDataList.forEach((element: any, index: any) => {
            this.seriousnessEffects.push({
              "ID": element.SeriousnessAdverseID,
              "RMK": ""
            });
            let findActiontaken = this.ActiontakenNameNDataList.filter((a: any) => a.ActiontakenID == element.ActiontakenID);
            if (findActiontaken)
              findActiontaken[0].isSelected = true;
          });
          response.FetchPatientSeriousnessAdverseDataList.forEach((element: any, index: any) => {
            this.actionsTaken.push({
              "ID": element.ActiontakenID,
              "RMK": ""
            });
            let findSerious = this.SeriousnessAdverseNameDataList.filter((a: any) => a.SeriousnessAdverseID == element.SeriousnessAdverseID);
            if (findSerious)
              findSerious[0].isSelected = true;
          });
          response.PatientOutcomeOfCaseDataList.forEach((element: any, index: any) => {
            this.outcomeCases.push({
              "ID": element.OutcomeOfCaseID,
              "RMK": ""
            });
            let findOutcome = this.OutcomeOfCaseNameNDataList.filter((a: any) => a.OutcomeOfCaseID == element.OutcomeOfCaseID);
            if (findOutcome)
              findOutcome[0].isSelected = true;
          });
          response.PatientvaccineListDataList.forEach((element: any, index: any) => {
            this.vaccineAdverseEvent.push({
              "ID": element.OutcomeOfCaseID,
              "RMK": ""
            });
            let findVaccine = this.VaccineAdverseEventNameNDataList.filter((a: any) => a.VaccineAdverseEventID == element.VaccineAdverseEventID);
            if (findVaccine)
              findVaccine[0].isSelected = true;
          });
          response.PatientvaccineTypeDataList.forEach((element: any, index: any) => {
            this.vaccineDetails.push({
              "ID": element.VaccineID,
              "RMK": ""
            });
            let findVaccineDet = this.FetchAdvPatientVaccinationList.filter((a: any) => a.VaccineAdversID == element.VaccineAdversID);
            if (findVaccineDet)
              findVaccineDet[0].isSelected = true;
          });
        }
        else {
          this.adverseEventForm.patchValue({
            DoctorName: this.doctorName, DoctorID: this.doctorDetails[0].EmpId,
            NurseName: this.doctorName, 
            NurseID: this.doctorDetails[0].EmpId
          })
        }
      },
        (err) => {
        })
  }

  fetchAdverseFormsMasters() {
    this.config.fetchAdverseFormsMasters(this.HospitalID)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          this.FetchEventTypeDataList = response.FetchEventTypeDataList;
          this.ManifestationDataList = response.ManifestationDataList;
          this.SeriousnessAdverseNameDataList = response.SeriousnessAdverseNameDataList;
          this.ActiontakenNameNDataList = response.ActiontakenNameNDataList;
          this.OutcomeOfCaseNameNDataList = response.OutcomeOfCaseNameNDataList;
          this.VaccineAdverseEventNameNDataList = response.VaccineAdverseEventNameNDataList;
          this.fetchSavedAdverseEvents();
        }
      },
        (err) => {
        })
  }

  fetchAdvPatientAllergies() {
    this.config.fetchAdvPatientAllergies(this.PatientID, this.RegCode, this.HospitalID)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          this.FetchAdvPatientAllergiesFDataList = response.FetchAdvPatientAllergiesFDataList;
        }
      },
        (err) => {
        })
  }

  fetchAdvPatientActiveMedication() {
    this.config.fetchAdvPatientActiveMedication(this.PatientID, this.HospitalID)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          this.FetchAdvPatientActiveMedicationFDataList = response.FetchAdvPatientActiveMedicationFDataList;
        }
      },
        (err) => {
        })
  }

  fetchAdvPatientVaccination() {
    this.config.fetchAdvPatientVaccination(this.PatientID, this.HospitalID)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          this.FetchAdvPatientVaccinationList = response.FetchAdvPatientActiveMedicationFDataList;
        }
      },
        (err) => {
        })
  }

  fetchUsersGroups() {
    this.config.fetchUsersGroups(this.doctorDetails[0].EmpId, this.HospitalID)
      .subscribe((response: any) => {
        this.FetchUsersGroupsFDataList = response.FetchUsersGroupsFDataList;
        this.doctorName = this.FetchUsersGroupsFDataList[0].FullName;
      },
        (err) => {
        })

  }
  selectedADRManifestation(selectedADRItem: any) {
    if (!this.selectedADRManifestations.includes(selectedADRItem.ADRManifestationID)) {
      this.selectedADRManifestations.push({
        "ID": selectedADRItem.ADRManifestationID,
        "RMK": ""
      });
    } else {
      this.selectedADRManifestations.splice(this.selectedADRManifestations.indexOf(selectedADRItem.ADRManifestationID), 1);
    }
  }
  selectedSuspectedDrugs(selectedSuspectedDrugs: any) {
    if (!this.suspectedDrugs.includes(selectedSuspectedDrugs.ItemID)) {
      this.suspectedDrugs.push({
        "PRID": selectedSuspectedDrugs.PresID,
        "IID": selectedSuspectedDrugs.ItemID,
      });
    } else {
      this.suspectedDrugs.splice(this.suspectedDrugs.indexOf(selectedSuspectedDrugs.ItemID), 1);
    }
  }
  selectedSeriousEffects(selectedSeriousEffects: any) {
    if (!this.seriousnessEffects.includes(selectedSeriousEffects.SeriousnessAdverseID)) {
      this.seriousnessEffects.push({
        "ID": selectedSeriousEffects.SeriousnessAdverseID,
        "RMK": ""
      });
    } else {
      this.seriousnessEffects.splice(this.seriousnessEffects.indexOf(selectedSeriousEffects.SeriousnessAdverseID), 1);
    }
  }
  selectedActionTaken(action: any) {
    if (!this.actionsTaken.includes(action.ActiontakenID)) {
      this.actionsTaken.push({
        "ID": action.ActiontakenID,
        "RMK": ""
      });
    } else {
      this.actionsTaken.splice(this.actionsTaken.indexOf(action.ActiontakenID), 1);
    }
  }
  selectedOutcome(outcome: any) {
    if (!this.outcomeCases.includes(outcome.OutcomeOfCaseID)) {
      this.outcomeCases.push({
        "ID": outcome.OutcomeOfCaseID,
        "RMK": ""
      });
    } else {
      this.outcomeCases.splice(this.outcomeCases.indexOf(outcome.OutcomeOfCaseID), 1);
    }
  }
  selectedVaccineAdverseEvent(vaccine: any) {
    if (!this.vaccineAdverseEvent.includes(vaccine.OutcomeOfCaseID)) {
      this.vaccineAdverseEvent.push({
        "ID": vaccine.VaccineID,
        "RMK": ""
      });
    } else {
      this.vaccineAdverseEvent.splice(this.vaccineAdverseEvent.indexOf(vaccine.VaccineID), 1);
    }
  }
  selectedVaccineDetails(vaccinedet: any) {
    if (!this.vaccineDetails.includes(vaccinedet.VaccineID)) {
      this.vaccineDetails.push({
        "ID": vaccinedet.VaccineID,
        "RMK": ""
      });
    } else {
      this.vaccineDetails.splice(this.vaccineDetails.indexOf(vaccinedet.VaccineID), 1);
    }
  }
  saveAdverseEvents() {
    if (this.suspectedDrugs.length > 0 && this.selectedADRManifestations.length > 0) {
      let advReactionPayload = {
        "PatientAdverseId": 0,
        "PatientID": this.PatientID,
        "Admissionid": this.selectedAdmissionId,
        "AdverseEventDate": this.adverseEventForm.get('AdverseEventDate')?.value,
        "EventTypeId": "1",
        "IncidentDate": this.adverseEventForm.get('IncidentDate')?.value,
        "NotifiedRODDate": this.adverseEventForm.get('NotifiedRODDate')?.value,
        "NotifiedMRPDate": this.adverseEventForm.get('NotifiedMRPDate')?.value,
        "ADRDescription": this.adverseEventForm.get('ADRDescription')?.value,
        "RODNurseEMPID": this.adverseEventForm.get('NurseID')?.value,
        "RODNurseDate": this.adverseEventForm.get('RODNurseDate')?.value,
        "ClinicalConditionalSummary": this.adverseEventForm.get('ClinicalConditionalSummary')?.value,
        "DoctorId": this.adverseEventForm.get('DoctorID')?.value,
        "PhysicianSignatureDate": this.adverseEventForm.get('PhysicianSignatureDate')?.value,
        "VaccineGivenempid": "",
        "VaccineGivenDate": this.adverseEventForm.get('VaccineGivenDate')?.value,
        "ADRManifestationsXMLs": this.selectedADRManifestations,
        "AdverseSuspectedDrugsXMLs": this.suspectedDrugs,
        "SeriousnessOfTheAdversesXMLs": this.seriousnessEffects,
        "ActiontakenXMLs": this.actionsTaken,
        "OutcomeOfCaseXMLs": this.outcomeCases,
        "VaccineAdverseEventXMLs": this.vaccineAdverseEvent,
        "VaccineDetailsXMLs": this.vaccineDetails,
        "UserID": 0
      }
      this.config.saveAdverseEvents(advReactionPayload).subscribe(
        (response) => {
          if (response.Code == 200) {
            $("#saveAdverseEvent").modal('show');

          } else {

          }
        },
        (err) => {
          console.log(err)
        });
    }

    else {
      $("#saveAdverseEventValidation").modal('show');
    }
  }
}
