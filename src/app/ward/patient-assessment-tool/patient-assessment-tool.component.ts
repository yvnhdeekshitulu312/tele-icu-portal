import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService as BedConfig } from '../services/config.service';
import { ConfigService } from 'src/app/services/config.service';
import { FormBuilder, Validators } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-patient-assessment-tool',
  templateUrl: './patient-assessment-tool.component.html',
  styleUrls: ['./patient-assessment-tool.component.scss']
})
export class PatientAssessmentToolComponent implements OnInit {
  hospId: any;
  scoreLocationList: any;
  scoreQualityList: any;
  FetchNonVerbalScoreDataList: any;
  FetchPainScoreInterventionsDataList: any;
  FetchAdverseDrugDataList: any;
  postInterventionList: any;
  parametersNonVerbalData: any
  painScoreForm: any;
  painScoreMaster: any;
  showOtherLocationTextbox = false;
  selectedInterventions: any = [];
  selectedAdverse: any = [];
  public showOtherInterventionTextbox = false;
  public showPharmaInstruction = false;
  public showOtherAdverseTextbox = false;
  @Input() inputPainScore?: any;
  @Output() close = new EventEmitter<any>();
  selectedValues: any[] = [];
  IsNonVerbal = true;
  IsVerbal = true;
  selectedView: any;
  emrPatientDetails: any;
  doctorDetails: any;
  facility: any;
  IsVisible = true;
  locationIds: any = [];
  qualityIds: any = [];
  @Input() data: any;
  readonly = false;
  IsFromBedsBoard: any;
  errorMessages: any[] = [];

  constructor(private fb: FormBuilder, private config: BedConfig, private router: Router, private con: ConfigService) {
    this.painScoreForm = this.fb.group({
      VerbalPainAssessmentLocationID: ['0', Validators.required],
      VerbalPainAssessmentQualityID: ['0', Validators.required],
      PostInterventionTime: ['0', Validators.required],
      LocationRemarks: [''],
      IsChronic: [''],
      IsAcute: [''],
      OtherIntervention: [''],
      OtherAdverse: [''],
      IsBaker: ['']
    });
  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospId = sessionStorage.getItem("hospitalId");
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.emrPatientDetails = JSON.parse(sessionStorage.getItem("EmrPatientDetails") || '{}');
    this.IsFromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;
    this.fetchPainScoreLocation();
    this.fetchPainScoreQuality();
    this.fetchPainScoreInterventions();
    this.fetchNonVerbalScore();
    this.fetchAdverseDrugEffects();
    this.fetchPostIntervention();
    this.fetchVitalPainScoreMaster();
    if (this.data) {
      this.readonly = this.data.readonly;
      if (this.data.data) {
        this.inputPainScore = this.data.data[0].length > 0 ? this.data.data[0][0].PainScoreID : "";
      }
      else {
        this.inputPainScore = this.data.inputPainScore ? this.data.inputPainScore : '';
      }


      this.painScoreForm.patchValue({
        VerbalPainAssessmentLocationID: "",
        VerbalPainAssessmentQualityID: this.data.data[0]?.length > 0 ? this.data.data[0][0]?.VerbalPainAssessmentQualityID : "",
        PostInterventionTime: this.data.data[0][0]?.ReAssesmentPainIntervention,
        LocationRemarks: '',
        IsChronic: this.data.data[0][0]?.IsChronic,
        IsAcute: this.data.data[0][0]?.IsAcute,
        OtherIntervention: '',
        OtherAdverse: '',
        IsBaker: this.data.data[0][0]?.WongBaker
      });
    }
  }

  onLocationChange() {
    this.verbalClick();
    this.showOtherLocationTextbox = false;
    if (this.painScoreForm.get('VerbalPainAssessmentLocationID').value === '10') {
      this.showOtherLocationTextbox = true;
      if (!this.showOtherLocationTextbox) {
        this.painScoreForm.get('LocationRemarks')?.setValue('');
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.painScoreMaster) {
      this.painScoreMaster.forEach((element: any, index: any) => {
        if (this.inputPainScore === element.id) {
          element.Class = "pain_reaction position-relative align-items-center p-2 gap-2 cursor-pointer text-center active";
          element.active="1";
        }
        else {
          element.Class = "pain_reaction position-relative align-items-center p-2 gap-2 cursor-pointer text-center";
          element.active="0";
        }
      });
    }
  }

  psStyleChange(ps: any) {
    if (this.IsFromBedsBoard || !this.inputPainScore || ps.id != this.inputPainScore) {
      this.painScoreMaster.forEach((element: any, index: any) => {
        if (ps.id === element.id) {
          element.Class = "pain_reaction position-relative align-items-center p-2 gap-2 cursor-pointer text-center active";
          this.inputPainScore = ps.id;
          element.active="1";
        }
        else {
          element.Class = "pain_reaction position-relative align-items-center p-2 gap-2 cursor-pointer text-center";
          element.active="0";
        }
      });
    }
  }

  fetchPainScoreLocation() {
    this.config.fetchPainScoreLocation(this.hospId).subscribe(
      (results) => {
        this.scoreLocationList = results.SmartDataList;
        if (this.data?.data.length > 0 && this.data?.data[0].length > 0) {
          const location = this.data.data[0][0]?.VerbalPainAssessmentID;
          location.split(',').forEach((element: any, index: any) => {
            if (element === '1') { document.getElementById("btn_Head")?.classList.add('active'); }
            else if (element === '2') { document.getElementById("btn_IVF")?.classList.add('active'); }
            else if (element === '3') { document.getElementById("btn_Uerl")?.classList.add('active'); }
            else if (element === '4') { document.getElementById("btn_Back")?.classList.add('active'); }
            else if (element === '5') { document.getElementById("btn_Chest")?.classList.add('active'); }
            else if (element === '6') { document.getElementById("btn_Abdomen")?.classList.add('active'); }
            else if (element === '7') { document.getElementById("btn_Lerl")?.classList.add('active'); }
            else if (element === '8') { document.getElementById("btn_Flank")?.classList.add('active'); }
            else if (element === '9') { document.getElementById("btn_Incision")?.classList.add('active'); }
            else if (element === '10') { document.getElementById("btn_Others")?.classList.add('active'); }
          });
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  fetchPainScoreQuality() {
    this.config.fetchPainScoreQuality(this.hospId).subscribe(
      (results) => {
        this.scoreQualityList = results.SmartDataList;
        if (this.data?.data.length > 0 && this.data?.data[0].length > 0) {
          const location = this.data.data[0][0]?.VerbalPainAssessmentQualityID;
          location.split(',').forEach((element: any, index: any) => {
            if (element === '1') { document.getElementById("btn_Aching")?.classList.add('active'); }
            else if (element === '2') { document.getElementById("btn_Burning")?.classList.add('active'); }
            else if (element === '3') { document.getElementById("btn_Cramping")?.classList.add('active'); }
            else if (element === '4') { document.getElementById("btn_Dull")?.classList.add('active'); }
            else if (element === '5') { document.getElementById("btn_Pricking")?.classList.add('active'); }
            else if (element === '6') { document.getElementById("btn_Radiating")?.classList.add('active'); }
            else if (element === '7') { document.getElementById("btn_Sharp")?.classList.add('active'); }
            else if (element === '8') { document.getElementById("btn_Tearing")?.classList.add('active'); }
            else if (element === '9') { document.getElementById("btn_Throbbing")?.classList.add('active'); }
          });
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  fetchPainScoreInterventions() {
    this.config.fetchPainScoreInterventions(this.hospId).subscribe(
      (results) => {
        this.FetchPainScoreInterventionsDataList = results.FetchPainScoreInterventionsDataList;
        this.FetchPainScoreInterventionsDataList.forEach((element: any, index: any) => {
          element.selectedIntervention = false;
        });
        if (this.data?.data.length > 0 && this.data?.data[2].length > 0) {
          this.data.data[2]?.forEach((element: any, index: any) => {
            const invId = this.FetchPainScoreInterventionsDataList.find((x: any) => x.NursingInterventionID === element.VerbalParameterID);
            if (invId)
              invId.selectedIntervention = true;
            else
              invId.selectedIntervention = false;
          });
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  fetchNonVerbalScore() {
    this.config.fetchNonVerbalScore(this.hospId).subscribe(
      (results) => {
        this.FetchNonVerbalScoreDataList = results.FetchNonVerbalScoreDataList;
        const groupedData: any = {};
        for (const parameter of this.FetchNonVerbalScoreDataList) {
          if (!groupedData[parameter.NonVerbalParameterID]) {
            groupedData[parameter.NonVerbalParameterID] = [];
          }
          groupedData[parameter.NonVerbalParameterID].push({
            NonVerbalParameterScoreValuesID: parameter.NonVerbalParameterScoreValuesID,
            NonVerbalParameterScoreValues: parameter.NonVerbalParameterScoreValues,
            Selected: false
          });
        }

        this.parametersNonVerbalData = Object.keys(groupedData).map((NonVerbalParameterID) => ({
          NonVerbalParameterID,
          NonVerbalParameter: this.FetchNonVerbalScoreDataList.find((p: any) => p.NonVerbalParameterID === NonVerbalParameterID)?.NonVerbalParameter || '',
          ScoreValues: groupedData[NonVerbalParameterID],
        }));

        this.data?.data[1].forEach((element: any, index1: any) => {
          const noverbalpid = this.parametersNonVerbalData.find((x: any) => x.NonVerbalParameterID === element.VerbalParameterID);
          noverbalpid.ScoreValues.forEach((element1: any, index2: any) => {
            if (element.NonVerbalParameterScoreValuesID == element1.NonVerbalParameterScoreValuesID) {
              element1.Selected = true;
            }
          });
        });
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  fetchAdverseDrugEffects() {
    this.config.fetchAdverseDrugEffects(this.hospId).subscribe(
      (results) => {
        this.FetchAdverseDrugDataList = results.FetchAdverseDrugDataList;
        this.FetchAdverseDrugDataList.forEach((element: any, index: any) => {
          element.selectedAdvDrug = false;
        });
        if (this.data?.data.length > 0 && this.data?.data[3].length > 0) {
          this.data.data[3]?.forEach((element: any, index: any) => {
            const invId = this.FetchAdverseDrugDataList.find((x: any) => x.ID === element.VerbalParameterID);
            if (invId)
              invId.selectedAdvDrug = true;
            else
              invId.selectedAdvDrug = false;
          });
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  fetchPostIntervention() {
    this.config.fetchPostIntervention(this.hospId).subscribe(
      (results) => {
        this.postInterventionList = results.FetchAdverseDrugDataList;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  fetchVitalPainScoreMaster() {
    this.con.fetchVitalPainScoreMaster(sessionStorage.getItem('hospitalId')).subscribe((response) => {
      if (response.Status === "Success") {
        this.painScoreMaster = response.SmartDataList;

        this.painScoreMaster.forEach((element: any, index: any) => {
          if (element.id == 1) { element.imgsrc = "assets/images/image1.png"; element.Class = "pain_reaction position-relative align-items-center p-2 gap-2 cursor-pointer text-center"; }
          else if (element.id == 2) { element.imgsrc = "assets/images/image2.png"; element.Class = "pain_reaction position-relative align-items-center p-2 gap-2 cursor-pointer text-center"; }
          else if (element.id == 3) { element.imgsrc = "assets/images/image3.png"; element.Class = "pain_reaction position-relative align-items-center p-2 gap-2 cursor-pointer text-center"; }
          else if (element.id == 4) { element.imgsrc = "assets/images/image4.png"; element.Class = "pain_reaction position-relative align-items-center p-2 gap-2 cursor-pointer text-center"; }
          else if (element.id == 5) { element.imgsrc = "assets/images/image5.png"; element.Class = "pain_reaction position-relative align-items-center p-2 gap-2 cursor-pointer text-center"; }
          else if (element.id == 6) { element.imgsrc = "assets/images/image6.png"; element.Class = "pain_reaction position-relative align-items-center p-2 gap-2 cursor-pointer text-center"; }

          if (Number(this.inputPainScore) === element.id) {
            element.Class = "pain_reaction position-relative align-items-center p-2 gap-2 cursor-pointer text-center active";
          }
        });
      } else {
      }
    },
      (err) => {

      })
  }

  onInterventionChange(item: any) {
    const index = this.selectedInterventions.findIndex(
      (selectedItem: any) => selectedItem.NursingIntervention === item.NursingIntervention
    );

    if (index === -1) {
      this.selectedInterventions.push(item);
    } else {
      this.selectedInterventions.splice(index, 1);
    }

    const indexOfOthers = this.selectedInterventions.findIndex(
      (selectedItem: any) => selectedItem.NursingIntervention === "Others"
    );
    const indexOfPharma = this.selectedInterventions.findIndex(
      (selectedItem: any) => selectedItem.NursingIntervention === "13 Pharmaceutical"
    );


    this.showOtherInterventionTextbox = false;
    if (indexOfOthers >= 0) {
      this.showOtherInterventionTextbox = true;
    }
    this.showPharmaInstruction = false;
    if (indexOfPharma >= 0) {
      this.showPharmaInstruction = true;
    }

  }

  onAdverseChange(item: any) {
    const index = this.selectedAdverse.findIndex(
      (selectedItem: any) => selectedItem.Name === item.Name
    );

    if (index === -1) {
      this.selectedAdverse.push(item);
    } else {
      this.selectedAdverse.splice(index, 1);
    }

    const indexOfOthers = this.selectedAdverse.findIndex(
      (selectedItem: any) => selectedItem.Name === "Others"
    );

    this.showOtherAdverseTextbox = false;
    if (indexOfOthers >= 0) {
      this.showOtherAdverseTextbox = true;
    }
  }

  onRadioSelect(parameter: any, scoreValueID: any, index: any, scoreValue: any) {
    const parameterIndex = this.selectedValues.findIndex((item) => item.parameter === parameter.NonVerbalParameterID);

    parameter.ScoreValues.forEach((element: any, index1: any) => {
      element.Selected = false;
      if (index == index1) {
        element.Selected = true;
      }
    });

    if (parameterIndex === -1) {
      this.selectedValues.push({
        parameter: parameter.NonVerbalParameterID,
        scoreValueID: scoreValueID,
        selectedIndex: index
      });
    } else {
      this.selectedValues[parameterIndex].scoreValueID = scoreValueID;
      this.selectedValues[parameterIndex].selectedIndex = index;
    }

    this.nonverbalClick();
  }

  nonverbalClick() {
    this.IsNonVerbal = true;
    this.painScoreForm.get("VerbalPainAssessmentLocationID").setValue('0');
    this.painScoreForm.get("VerbalPainAssessmentQualityID").setValue('0');
    this.painScoreForm.get("LocationRemarks").setValue('');
    this.showOtherLocationTextbox = false;
  }

  verbalClick() {
    this.selectedValues = [];
    this.IsNonVerbal = false;
    setTimeout(() => {
      this.IsNonVerbal = true, 500
    });
  }


  bakerCheckBoxChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.verbalClick();
    }
  }

  SavePainAssessmentOrder() {

    if(this.inputPainScore!='1'){
      this.errorMessages = [];
      if (this.locationIds.length==0) {
       this.errorMessages.push("Location");
      }
      if (this.qualityIds.length==0) {
       this.errorMessages.push("Quality");
      }
      if (this.selectedInterventions.length==0) {
       this.errorMessages.push("Intervention");
      }
      if (this.painScoreForm.get("PostInterventionTime").value==0) {
       this.errorMessages.push("Reassessment of Pain");
      }
      if (this.errorMessages.length > 0) {
       $("#errorMessageM").modal('show');
       return;
     }
    }



    let details: any = [];
    let intervention: any = [];
    this.selectedInterventions.forEach((element: any, index: any) => {
      var inter = {
        "NursingInterventionID": element.NursingInterventionID
      };
      intervention.push(inter);

      var det = {
        "PRT": element.NursingInterventionID,
        "Val": "",
        "TYPE": "PNI",
        "DES": "PatientInterventions",
        "ORMK": element.NursingIntervention === 'Others' ? this.painScoreForm.get("OtherIntervention").value : ""
      }

      details.push(det);
    });

    this.selectedAdverse.forEach((element: any, index: any) => {
      var det = {
        "PRT": element.ID,
        "Val": "",
        "TYPE": "PADE",
        "DES": "PatientAdverseDrugEffects",
        "ORMK": element.Name === 'Others' ? this.painScoreForm.get("OtherAdverse").value : ""
      }

      details.push(det);
    });

    let PainScoreVal = 0;
    let painScore = 0;
    this.selectedValues.forEach((element: any, index: any) => {
      var det = {
        "PRT": element.parameter,
        "Val": element.scoreValueID,
        "TYPE": "NVP",
        "DES": "NonVerbalPainAssessment",
        "ORMK": ""
      }


      PainScoreVal = PainScoreVal + Number(element.selectedIndex);
      details.push(det);
    });

    if (PainScoreVal > 0)
      painScore = PainScoreVal;
    else {
      if (this.painScoreForm.get("IsBaker").value)
        painScore = Number(this.inputPainScore);
      else
        painScore = Number(PainScoreVal);
    }


    let payload = {
      "AdmissionID": this.selectedView.IPID == undefined ? this.emrPatientDetails.AdmissionID : this.selectedView.IPID,
      "WardTaskID": "0",
      "VerbalPainAssessmentLocationID": this.locationIds.join(','),
      "VerbalPainAssessmentQualityID": this.qualityIds.join(','),
      "PainScoreID": painScore,
      "UserId": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID,
      "HospitalID": this.hospId,
      "PostInterventionTime": this.painScoreForm.get("PostInterventionTime").value,
      "LocationRemarks": this.painScoreForm.get("LocationRemarks").value,
      "PainAssessmentOrderID": "0",
      "IsChronic": this.painScoreForm.get("IsChronic").value ? 1 : 0,
      "IsAcute": this.painScoreForm.get("IsAcute").value ? 1 : 0,
      "Details": details,
      "InterventionsXML": intervention
    }

    this.config.savePainAssessmentOrder(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#painScoreMessage").modal('show');
        } else {

        }
      },
      (err) => {
        console.log(err)
      });

  }

  closeScore() {
    this.clear();
    $("#painScoreMessage").modal('hide');
    sessionStorage.removeItem("InPatientDetails");
    this.close.emit();
  }

  clear() {
    this.IsVisible = false;
    setTimeout(() => {
      this.IsVisible = true, 500
    });
    this.verbalClick();
    this.selectedInterventions = [];
    this.showOtherInterventionTextbox = false;
    this.showPharmaInstruction = false;
    this.showOtherAdverseTextbox = false;
    this.showOtherLocationTextbox = false;
    this.locationIds = [];
    this.qualityIds = [];
    this.selectedAdverse = [];
    this.painScoreForm = this.fb.group({
      VerbalPainAssessmentLocationID: ['0', Validators.required],
      VerbalPainAssessmentQualityID: ['0', Validators.required],
      PostInterventionTime: ['0', Validators.required],
      LocationRemarks: [''],
      IsChronic: [''],
      IsAcute: [''],
      OtherIntervention: [''],
      OtherAdverse: [''],
      IsBaker: ['']
    });
  }

  toggleIsChronic(value: any) {
    this.painScoreForm.patchValue({
      IsChronic: !value,
    });
  }
  toggleIsAcute(value: any) {
    this.painScoreForm.patchValue({
      IsAcute: !value,
    });
  }

  toggleIsBaker(value: any) {
    this.painScoreForm.patchValue({
      IsBaker: !value,
    });
  }

  toggleButtonSelection(event: Event, id: string) {
    if (this.locationIds.includes(id)) {
      this.locationIds = this.locationIds.filter((item: any) => item !== id);
    } else {
      this.locationIds.push(id);
    }

    if (id === '10') {
      if (this.locationIds.includes(id)) {
        this.showOtherLocationTextbox = true;        
      } else {
        this.showOtherLocationTextbox = false;
        this.painScoreForm.get('LocationRemarks')?.setValue('');
      }
    }
  }

  toggleQualityButtonSelection(event: Event, id: string) {
    if (this.qualityIds.includes(id)) {
      this.qualityIds = this.qualityIds.filter((item: any) => item !== id);
    } else {
      this.qualityIds.push(id);
    }
  }
}
