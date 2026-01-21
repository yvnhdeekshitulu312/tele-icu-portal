import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { ConfigService } from 'src/app/services/config.service';


declare var $: any;
@Component({
  selector: 'app-pulmonology-diseases',
  templateUrl: './pulmonology-diseases.component.html',
  styleUrls: ['./pulmonology-diseases.component.scss']
})
export class PulmonologyDiseasesComponent extends BaseComponent implements OnInit {

  patientDetails: any;
  medicalData:any;
  breathDuration: any;
  coughDuration: any;
  hemoptysisDuration: any;
  wheezingDuration: any;
  selectedPatient: any;
  savedMedicalData: any = [];
  @Output() savechanges = new EventEmitter<any>();
  PatientTemplatedetailID = 0;
  FetchPatienAdmissionClinicalTemplateDetailsDataaList = [];
  TriggerOthers: any;
  ExacerbatingOthers: any;
  AlleviatingOthers: any;
  url = "";

  constructor(private config: ConfigService) { 
    super()
    this.langData = this.config.getLangData();
    this.selectedPatient = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
  }

  ngOnInit(): void {
    this.FetchPulmologyClinicalTemplateSavedDetails();
    this.FetchPulmologyClinicalTemplateDetails();
  }

  clear() {
    this.PatientTemplatedetailID = 0;
    this.FetchPulmologyClinicalTemplateDetails();
  }

  FetchPulmologyClinicalTemplateSavedDetails() {
    this.config.FetchPulmologyClinicalTemplateSavedDetails(this.admissionID ,this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.savedMedicalData = response.FetchPatienClinicalTemplateDetailsDataaList;
        }
      },
        (err) => {
        })
  }
 

  viewWorklist() {
    $("#modalSaved").modal('show');
  }

  FetchPulmologyClinicalTemplateDetails() {
    this.config.FetchPulmologyClinicalTemplateDetails(this.admissionID,this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.medicalData = response;

          if(this.selectedPatient?.PatientType === "1") {
            if(this.selectedPatient?.OrderType.toLowerCase() === "followup") {
              var result = this.medicalData['FetchReasonofVisitList'].filter((x: any) => x.ItemName === 'Follow-up');
              result[0].selected = true;

              var result1 = this.medicalData['FetchReasonofVisitList'].filter((x: any) => x.ItemName === 'New consultation');
              result1[0].disabled = true;
            }
            else {
              var result = this.medicalData['FetchReasonofVisitList'].filter((x: any) => x.ItemName === 'New consultation');
              result[0].selected = true;

              var result1 = this.medicalData['FetchReasonofVisitList'].filter((x: any) => x.ItemName === 'Follow-up');
              result1[0].disabled = true;
            }
          }
          else 
          {
            var result = this.medicalData['FetchReasonofVisitList'].filter((x: any) => x.ItemName === 'New consultation');
            result[0].selected = true;

            var result1 = this.medicalData['FetchReasonofVisitList'].filter((x: any) => x.ItemName === 'Follow-up');
              result1[0].disabled = true;
          }
        }
      },
        (err) => {

        })
  }

  getDataByKey(key: string) : any {
    return this.medicalData ? this.medicalData[key] : [];
  }

  selectItem(item: any, key: any) {
    if((key === "FetchPulmonologyDiseasesDataList" || key === "FetchChronicMedicalDiseasesList") && item.ItemName.trim() === "None") {
      var IsSelected = false;
      this.medicalData[key].forEach((dataItem : any) => {
        if(dataItem.ItemName.trim() != "None") {
          dataItem.selected = false;
          dataItem.disabled = IsSelected ? true : false;
        }
        else {
          dataItem.selected = !dataItem.selected;
          dataItem.disabled = false;

          if(dataItem.selected) {
            IsSelected = true
          }
        }
      });
    }
    else {
      this.medicalData[key].forEach((dataItem : any) => {
        if(dataItem === item) {
          dataItem.selected = !dataItem.selected;
        } else {
          dataItem.selected = false;
        }
      });
    }
  }

  updateSelection(condition: any, option: any) {
    condition.selectedOption = option;
    
    var filtered = this.medicalData['FetchHistoryChiefCompliantYESNOList'].filter((x: any) => x.SubSectionName === condition.SubSectionName);
    filtered[0].selected = option === "YES" ? true : false;
  }

  updateDurationText(key: any, value: any, text: any) {
    var filtered = this.medicalData[key].filter((x: any) => x.ChapterName === value);
    filtered[0].Text = text.target.value;
  }

  updateOthersText(key: any, value: any, text: any) {
    var filtered = this.medicalData[key].filter((x: any) => x.ItemName === value);
    filtered[0].Text = text.target.value;
  }

  getVisibility(key: any, value: any) : boolean {
    if(this.medicalData) {
      var filtered = this.medicalData[key].filter((x: any) => x.SubSectionName === value);
      var filtered1 = this.medicalData[key].filter((x: any) => x.ItemName === value);
      if(filtered && filtered[0]?.selectedOption === 'YES') {
        return true;
      }

      if(filtered1 && filtered1[0]?.selected) {
        return true;
      }
    }
    return false;
  }

  save() {
    var ClinicalAssessmentXMLDetails: any = [];

    for (const key in this.medicalData) {
      if (key != 'FetchExaminationVitalsList' && Array.isArray(this.medicalData[key])) {
        this.medicalData[key].forEach((item: any) => {
          if (item.selected) {
            ClinicalAssessmentXMLDetails.push({"DTID": item.TemplatedetailID, "RMK": ""});
          }

          if (item.Text) {
            ClinicalAssessmentXMLDetails.push({"DTID": item.TemplatedetailID, "RMK": item.Text});
          }
        });
      }
      else if (key == 'FetchExaminationVitalsList') {
        this.medicalData['FetchExaminationVitalsList'].forEach((item: any) => {
          ClinicalAssessmentXMLDetails.push({"DTID": item.TemplatedetailID, "RMK": item.ItemValue});
        });
      }
    }

    var payload = {
      "PatientTemplatedetailID": this.PatientTemplatedetailID,
      "PatientID": this.selectedPatient.PatientID,
      "AdmissionID": this.admissionID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "SpecialiseID": this.selectedPatient.SpecialiseID,
      "ClinicalTemplateID": "1",
      "ClinicalAssessmentXMLDetails": ClinicalAssessmentXMLDetails,
      "HospitalID": this.hospitalID,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.ward.FacilityID ? this.ward.FacilityID : this.wardID
    }

    this.config.SavePatientPulmologyAssessments(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#saveMsg").modal('show');
        } else {
        }
      },
      (err) => {
        console.log(err)
      });
  }

  savenavigation() {
    this.savechanges.emit();
  }

  getDetails(event: Event, PatientTemplatedetailID: any) {
    event.preventDefault();
    this.config.FetchPatienAdmissionClinicalTemplateDetails(PatientTemplatedetailID ,this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatienAdmissionClinicalTemplateDetailsDataaList = response.FetchPatienAdmissionClinicalTemplateDetailsDataaList;
          this.PatientTemplatedetailID = PatientTemplatedetailID;

          this.FetchPatienAdmissionClinicalTemplateDetailsDataaList.forEach((dataItem : any) => {
            if(dataItem.ItemName === 'YES' || dataItem.ItemName === 'NO') {
              var filtered = this.medicalData['FetchHistoryChiefCompliantList'].filter((x: any) => x.SubSectionName === dataItem.SubSectionName);
              if(filtered.length >0) {
                filtered[0].selectedOption = dataItem.ItemName;
              }

              var filtered1 = this.medicalData['FetchHistoryChiefCompliantYESNOList'].filter((x: any) => x.SubSectionName === dataItem.SubSectionName);
              filtered1[0].selected = dataItem.ItemName === "YES" ? true : false;
            }
            else {
              for (const key in this.medicalData) {
                if (key != 'FetchExaminationVitalsList' &&Array.isArray(this.medicalData[key])) {
                  var filtered: any = this.medicalData[key].filter((x: any) => x.TemplatedetailID === dataItem.TemplatedetailID);
                  if(filtered.length > 0 && filtered[0].ChapterName === 'Duration') {
                    filtered[0].Text = dataItem.Remarks;
                    switch (filtered[0].SubSectionName) {
                      case "Shortness of breath" :
                        this.breathDuration = dataItem.Remarks;
                        break;
                      case "Cough" :
                        this.coughDuration = dataItem.Remarks;
                        break;
                      case "Hemoptysis" :
                        this.hemoptysisDuration = dataItem.Remarks;
                        break;
                      case "Wheezing/Stridor" :
                        this.wheezingDuration = dataItem.Remarks;
                        break;
                      default:
                        break;
                    }
                  }
                  else if(filtered.length > 0) {
                    if(filtered[0].ItemName.includes("specify")) {
                      filtered[0].Text = dataItem.Remarks;
                      filtered[0].selected = true;
                      switch (key) {
                        case "FetchHistoryChiefCompliantCoughSputumExacerbatingList" :
                          this.ExacerbatingOthers = dataItem.Remarks;
                          break;
                        case "FetchHistoryChiefCompliantCoughSputumAlleviatingList" :
                          this.AlleviatingOthers = dataItem.Remarks;
                          break;
                        case "FetchHistoryChiefCompliantWheezingTriggerList" :
                          this.TriggerOthers = dataItem.Remarks;
                          break;
                        default:
                          break;
                      }
                    }
                    else {
                      filtered[0].selected = true;
                    }
                    break;
                  }
                }
              }
            }
          });

          const diseases = this.medicalData["FetchPulmonologyDiseasesDataList"];

          const selectedNoneDiseases = diseases.filter((item: any) => item.ItemName === 'None' && item.selected);
          
          if (selectedNoneDiseases.length > 0) {
            diseases.forEach((item: any) => {
              if (item.ItemName !== 'None') {
                item.disabled = true;
              }
            });
          }

          const diseases1 = this.medicalData["FetchChronicMedicalDiseasesList"];

          const selectedNoneDiseases1 = diseases1.filter((item: any) => item.ItemName === 'None' && item.selected);
          
          if (selectedNoneDiseases1.length > 0) {
            diseases1.forEach((item: any) => {
              if (item.ItemName !== 'None') {
                item.disabled = true;
              }
            });
          }
        }

        $("#modalSaved").modal('hide');
      },
        (err) => {
        })
  }

  getClassButtonSelectionExistence(classname: string): string {
    const targetElements = document.getElementsByClassName(classname);

    if (targetElements.length > 0) {
      for (let i = 0; i < targetElements.length; i++) {
        const button = targetElements[i] as HTMLElement;

        if (button.classList.contains('btn')) {
          if (button.classList.contains('selected')) {
            return button.textContent?.trim() || '';
          } else if (button.classList.contains('active')) {
            return button.textContent?.trim() || '';
          }
        }
      }
    }

    return '';
  }

}
