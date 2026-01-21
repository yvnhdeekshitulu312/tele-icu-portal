import { Component, Input, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from '../base.component';

@Component({
  selector: 'app-patient-quick-information',
  templateUrl: './patient-quick-information.component.html',
  styleUrls: ['./patient-quick-information.component.scss']
})
export class PatientQuickInformationComponent extends BaseComponent implements OnInit {
  @Input() patientInfo: any;
  selectedPatientMedications: any = [];
  selectedPatientAllergies: any = [];
  objPatientVitalsList: any = [];

  bpSystolic: string = "";
  bpDiastolic: string = "";
  temperature: string = "";
  pulse: string = "";
  spo2: string = "";
  respiration: string = "";
  consciousness: string = "";
  o2FlowRate: string = "";
  moreInfoTranfersList: any = [];
  selectedPatientClinicalInfo: any = [];
  selectedPatientInfo: any = [];
  pinfo:any;
  constructor(private appconfig: ConfigService) {
    super()
  }

  ngOnInit(): void {
    this.pinfo = this.patientInfo;
    if(this.pinfo.AdmissionID) {
      this.fetchPatientFileInfo();
      this.FetchPatientadmissionBedHistory();
    }
  }

  fetchPatientFileInfo() {
    this.appconfig.FetchPatientAdmissionClinicalDetails(this.pinfo.PatientID, this.pinfo.AdmissionID, this.hospitalID).subscribe((response: any) => {

        if (response.FetchPatientMedicationDataLists.length > 0) {
          this.selectedPatientMedications = response.FetchPatientMedicationDataLists;
        }

        if (response.FetchPatientVitalssDataLists.length > 0) {
          this.objPatientVitalsList = response.FetchPatientVitalssDataLists;
          this.bpSystolic = this.objPatientVitalsList.find((x:any) => x.VITALSIGNPARAMETERID == "6")?.Value;
          this.bpDiastolic = this.objPatientVitalsList.find((x:any) => x.VITALSIGNPARAMETERID == "7")?.Value;
          this.temperature = this.objPatientVitalsList.find((x:any) => x.VITALSIGNPARAMETERID == "1")?.Value;
          this.pulse = this.objPatientVitalsList.find((x:any) => x.VITALSIGNPARAMETERID == "2")?.Value;
          this.spo2 = this.objPatientVitalsList.find((x:any) => x.VITALSIGNPARAMETERID == "4")?.Value;
          this.respiration = this.objPatientVitalsList.find((x:any) => x.VITALSIGNPARAMETERID == "3")?.Value;
          this.consciousness = this.objPatientVitalsList.find((x:any) => x.VITALSIGNPARAMETERID == "8")?.Value;
          this.o2FlowRate = this.objPatientVitalsList.find((x:any) => x.VITALSIGNPARAMETERID == "9")?.Value;
        }

        if (response.FetchPatientAllergiesDataLists.length > 0) {
          this.selectedPatientAllergies = response.FetchPatientAllergiesDataLists;
        }

        if (response.FetchPatientInfoDataLists.length > 0) {
          this.selectedPatientClinicalInfo = response.FetchPatientInfoDataLists[0].ClinicalCondtion;
          this.selectedPatientInfo = response.FetchPatientInfoDataLists[0];
        }
      })
  }


  FetchPatientadmissionBedHistory() {
    this.appconfig.FetchPatientadmissionBedHistory(this.pinfo.AdmissionID,this.wardID, this.hospitalID).subscribe((response: any) => {
        if (response.FetchPatientadmissionBedHistoryDataList.length > 0) {
          this.moreInfoTranfersList = response.FetchPatientadmissionBedHistoryDataList;
        }
      })
  }
}
