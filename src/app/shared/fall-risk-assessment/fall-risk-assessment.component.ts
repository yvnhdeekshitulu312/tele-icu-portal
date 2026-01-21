import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../base.component';
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import * as moment from 'moment';
declare var $: any;

@Component({
  selector: 'app-fall-risk-assessment',
  templateUrl: './fall-risk-assessment.component.html',
  styleUrls: ['./fall-risk-assessment.component.scss']
})
export class FallRiskAssessmentComponent extends BaseComponent implements OnInit {
  @Input() data: any;
  readonly = false;
  showSave = false;
  filteredFallRiskFactors: any;
  fallRiskFactors: any;
  fallRiskFactorParameter: any;
  filteredFallRiskFactorParameter: any;
  scoreBgColor1: string = "White";
  scoreBgColor2: string = "White";
  scoreBgColor3: string = "White";
  totalRiskFactorScore: number = 0;
  totalRiskFactorParameterScore: any;
  additionalScore: any;
  nursingFallRiskInterventions: any;
  @Input() environmentPreventiveActions: any;
  @Input() NursingInterventionDetails: any;
  @Input() nursingInterventions: any;
  @Input() multiDisciplinary: any;
  @Input() patientCentered: any;
  @Output() closefallrisk = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private config: BedConfig
  ) {
    super();
   }

  ngOnInit(): void {
    if (this.data) {
      this.readonly = this.data.readonly;
      this.showSave = this.data.showSave;
      if (this.data.selectedView) {
        this.selectedView = this.data.selectedView;
      }
    }
    this.fetchFallRiskFactor();
  }

  riskFactorParameterToggle(index: any, item: any) {
    var updateRiskFactorParameter = this.fallRiskFactorParameter.filter((x: any) => x.RiskFactorID == item.RiskFactorID);
    updateRiskFactorParameter.forEach((element: any, index: any) => {
      if(this.readonly) {
        if (element.RiskFactorValueID == item.RiskFactorValueID) {
          element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2 active";
          element.Score = "Yes";
          element.Selected = true;
        }
        else {
          element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2";
          element.Score = "No";
          element.Selected = false;
        }
      }
      else {
        if (element.RiskFactorID == item.RiskFactorID && element.CriteriaClass == "d-flex action_select align-items-center gap-2 mb-2") {
          element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2 active";
          element.Score = "Yes";
          element.Selected = true;
        }
        else {
          element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2";
          element.Score = "No";
          element.Selected = false;
        }
      }
    });
    var totScore = 0;
    this.filteredFallRiskFactorParameter.forEach((element: any, index: any) => {
      totScore = totScore + element.Score;
    });

    this.calculateTotalScore();
  }

  calculateTotalScore() {
    var anyOneSelectedAsYes = this.filteredFallRiskFactorParameter?.filter((x: any) => x.Score == "Yes");
    var anyOneSelectedAsYesCount = this.filteredFallRiskFactorParameter?.filter((x: any) => x.Score == "Yes").length;
    var totRiskFactorScore = Number(this.totalRiskFactorScore);
    if (Number(anyOneSelectedAsYesCount) == 2) {
      this.scoreBgColor3 = "#AEDCE8";
      this.scoreBgColor2 = "White";
      this.scoreBgColor1 = "White";
      this.totalRiskFactorParameterScore = "3";
      this.additionalScore = "High";
    }
    else if (totRiskFactorScore >= 0 && totRiskFactorScore <= 24) {
      this.additionalScore = "";
      if (anyOneSelectedAsYes?.length > 0) {
        this.scoreBgColor3 = "White";
        this.scoreBgColor2 = "#AEDCE8";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "2";
      }
      else {
        this.scoreBgColor3 = "White";
        this.scoreBgColor2 = "White";
        this.scoreBgColor1 = "#AEDCE8";
        this.totalRiskFactorParameterScore = "1";
      }
    }
    else if (totRiskFactorScore >= 25 && totRiskFactorScore <= 44) {
      this.additionalScore = "";
      if (anyOneSelectedAsYes?.length > 0) {
        this.scoreBgColor3 = "#AEDCE8";
        this.scoreBgColor2 = "White";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "3";
      }
      else {
        this.scoreBgColor3 = "White";
        this.scoreBgColor2 = "#AEDCE8";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "2";
      }
    }
    else if (totRiskFactorScore >= 45 && totRiskFactorScore <= 300) {
      this.additionalScore = "";
      if (anyOneSelectedAsYes?.length > 0) {
        this.scoreBgColor3 = "#AEDCE8";
        this.scoreBgColor2 = "White";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "3";
      }
      else {
        this.scoreBgColor3 = "#AEDCE8";
        this.scoreBgColor2 = "White";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "3";
      }
    }
  }

  fetchFallRiskFactor() {
    this.config.FetchFallRiskFactor(this.doctorDetails[0].UserId, this.wardID, this.hospitalID)
      .subscribe((response: any) => {
        this.fallRiskFactors = response.FetchFallRiskFactorDataList;
        this.fallRiskFactors.forEach((element: any, index: any) => {
          if (element.AssessmentScore == 0) {
            element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2 active";
            element.Score = 0;
            element.Selected = true;
          }
          else {
            element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2";
            element.Score = 0;
            element.Selected = false;
          }
        });
        const distinctThings = response.FetchFallRiskFactorDataList.filter(
          (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.RiskFactorID === thing.RiskFactorID) === i);
        console.dir(distinctThings);
        this.filteredFallRiskFactors = distinctThings;
        this.fetchFallRiskFactorParameter();

        let filteredData: any = [];
        if (this.data?.data) {
          this.filteredFallRiskFactors.forEach((data: any) => {
            filteredData = this.data.data.filter((item: any) => item.RiskFactorID === data.RiskFactorID);
            if(filteredData.length > 0) {
              this.riskFactorToggle(0, filteredData[0]);
            }
          });
        }
      },
        (err) => {
        })
  }

  
  fetchFallRiskFactorParameter() {
    this.config.FetchFallRiskFactorParameter(this.doctorDetails[0].UserId, this.wardID, this.hospitalID)
      .subscribe((response: any) => {
        this.fallRiskFactorParameter = response.FetchFallRiskFactorDataList;
        this.fallRiskFactorParameter.forEach((element: any, index: any) => {
          if (element.RiskFactorValue == "No") {
            element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2 active";
            element.Score = 0;
            element.Selected = true;
          }
          else {
            element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2";
            element.Score = 0;
            element.Selected = false;
          }
        });
        const distinctThings = response.FetchFallRiskFactorDataList.filter(
          (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.RiskFactorID === thing.RiskFactorID) === i);
        console.dir(distinctThings);
        this.filteredFallRiskFactorParameter = distinctThings;
        
        if (this.data?.data) {
          let filteredData: any = [];
          this.filteredFallRiskFactorParameter.forEach((data: any) => {
            filteredData = this.data.data.filter((item: any) => item.RiskFactorID === data.RiskFactorID);
            if(filteredData.length > 0) {
              this.riskFactorParameterToggle(0, filteredData[0]);
            }
          });
        }
      },
        (err) => {
        })
  }

  riskFactorToggle(index: any, item: any) {
    // this.fallRiskFactors[index].Score = item.AssessmentScore;
    var updateRiskFactor = this.fallRiskFactors.filter((x: any) => x.RiskFactorID == item.RiskFactorID);
    updateRiskFactor.forEach((element: any, index: any) => {
     
      if(this.readonly) {
        if (element.RiskFactorValueID == item.RiskFactorValueID) {
          element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2 active";
          //element.Score = element.AssessmentScore;
          element.Selected = true;
        }
        else {
          element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2";
          //element.Score = element.Score;
          element.Selected = false;
        }
        const findscore = this.fallRiskFactors.find((x:any) => x.RiskFactorID == item.RiskFactorID && x.RiskFactorValueID == item.RiskFactorValueID);
        element.Score = findscore.AssessmentScore;
      }
      else {
        if (element.RiskFactorID == item.RiskFactorID && element.AssessmentScore == item.AssessmentScore) {
          element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2 active";
          element.Score = item.AssessmentScore;
          element.Selected = true;
        }
        else {
          element.CriteriaClass = "d-flex action_select align-items-center gap-2 mb-2";
          element.Score = item.AssessmentScore;
          element.Selected = false;
        }
      }
    });
    var totScore = 0;
    this.filteredFallRiskFactors.forEach((element: any, index: any) => {
      totScore = totScore + element.Score;
    });
    this.totalRiskFactorScore = totScore;
    const totScoreGb = Number(this.totalRiskFactorScore);
    if (totScoreGb >= 0 && totScoreGb <= 24)
      this.scoreBgColor1 = "#AEDCE8";
    else
      this.scoreBgColor1 = "White";
    if (totScoreGb >= 25 && totScoreGb <= 44)
      this.scoreBgColor2 = "#AEDCE8";
    else
      this.scoreBgColor2 = "White";
    if (totScoreGb >= 45)
      this.scoreBgColor3 = "#AEDCE8";
    else
      this.scoreBgColor3 = "White";

    this.calculateTotalScore();
  }

  
  saveFallRiskAssessment() {
    var riskAssessmentDetails: any[] = [];
    var riskAssessmentNiDetails: any[] = [];

    this.fallRiskFactors.forEach((element: any) => {
      if (element.Selected) {
        riskAssessmentDetails.push({
          "RFSGID": element.RiskFactorSubGroupID,
          "RFID": element.RiskFactorID,
          "RFVID": element.RiskFactorValueID,
          "VAL": this.totalRiskFactorScore
        })
      }
    });

    this.fallRiskFactorParameter.forEach((element: any) => {
      if (element.Selected) {
        riskAssessmentDetails.push({
          "RFSGID": element.RiskFactorSubGroupID,
          "RFID": element.RiskFactorID,
          "RFVID": element.RiskFactorValueID,
          "VAL": this.totalRiskFactorScore
        })
      }
    });

    var payload = {
      "AdmissionID": this.selectedView.IPID,
      "NursingTaskID": "20",//this.nursingInterventions.TaskID,
      "WardID": this.wardID,
      "FrequencyDate": moment(new Date()).format('DD-MMM-yyyy'),
      "FrequencyTime": this.NursingInterventionDetails?.FrequencyTime ?? "0",
      "Reassement": this.totalRiskFactorParameterScore,
      "OverAllScore": this.totalRiskFactorScore,
      "RiskLevelID": this.totalRiskFactorParameterScore,
      "HospitalID": this.hospitalID,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.wardID,
      "RiskAssessmentDetails": riskAssessmentDetails,
      "RiskAssessmentNIDetails": riskAssessmentNiDetails
    }

    this.config.SavePatientFallRisk(payload).subscribe(response => {
      if (response.Code == 200) {
        $("#fallRiskSaveMsg").modal('show');
        this.nursingFallRiskInterventions = response.VitalsInterventionsDataaList;
      }
    })
  }

  
  filterFunction(riskfactors: any, RiskFactorID: any) {
    // var score = riskfactors.filter((buttom: any) => buttom.RiskFactorID == RiskFactorID && buttom.Selected === true);
    // if(score.length > 0) {
    //   riskfactors.Score = score[0].Score;
    // }

    return riskfactors.filter((buttom: any) => buttom.RiskFactorID == RiskFactorID);
  }

  selectPreventiveActions(env: any) {
    if (env.Class == "d-flex action_select align-items-center gap-2 mb-2") {
      env.Class = "d-flex action_select align-items-center gap-2 mb-2 active";
      env.Selected = true;
    }
    else {
      env.Class = "d-flex action_select align-items-center gap-2 mb-2";
      env.Selected = false;
    }
  }

  fallriskclose() {
    this.closefallrisk.emit();
  }

  getCTASScoreClass() {
    if(this.selectedView?.CTASScore == '1') {
      return 'Resuscitation';
    }
    else if(this.selectedView?.CTASScore == '2') {
      return 'Emergent';
    }
    else if(this.selectedView?.CTASScore == '3') {
      return 'Urgent';
    }
    else if(this.selectedView?.CTASScore == '4') {
      return 'LessUrgent';
    }
    else if(this.selectedView?.CTASScore == '5') {
      return 'NonUrgent';
    }
    return '';
  }

}
