import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../base.component';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
declare var $: any;
@Component({
  selector: 'app-braden-scale',
  templateUrl: './braden-scale.component.html',
  styleUrls: ['./braden-scale.component.scss']
})
export class BradenScaleComponent extends BaseComponent implements OnInit {
  @Input() data: any;
  readonly = false;
  convertedData: any = [];
  totalSelectedScore = 0;
  nursingScaleMandatoryList: any = [];
  nursingInterventionsAfterSave: any;
  @Input() NursingInterventionDetails: any;
  @Output() close = new EventEmitter<any>();
  constructor(
    private config: BedConfig) {
    super();
   }

  ngOnInit(): void {
    if (this.data) {
      this.readonly = this.data.readonly;
    }
    this.FetchBradenScaleMaster();
  }

  toggleActive(item: any, index: number, option: any) {
    item.Options.forEach((option: any) => {
      option.Selected = false;
    });
    item.Options.forEach((option: any, idx: any) => {
      if (idx === index) {
        option.Selected = true;
        item.SelectedScore = option.AssessmentScore;
      }
    });
  }

  calculateTotalSelectedScore(): number {
    let total = 0;
    for (const item of this.convertedData) {
      if (item.SelectedScore) {
        total += item.SelectedScore;
      }
    }
    this.totalSelectedScore = total;
    return total;
  }

  SavePatientBradenScale() {
    var riskAssessmentDetails: any[] = [];
    this.nursingScaleMandatoryList = [];
    this.convertedData.forEach((element: any) => {
      var optionselected = false;
      element.Options.forEach((ele: any) => {
        if (ele.Selected) {
          optionselected = true;
          riskAssessmentDetails.push({
            "RFSGID": element.RiskFactorSubGroupID,
            "RFID": element.RiskFactorID,
            "RFVID": ele.RiskFactorValueID,
            "VAL": ele.AssessmentScore
          })
        }
      })

      if (!optionselected) {
        this.nursingScaleMandatoryList.push(element.RiskFactor);
      }
    });

    if (this.nursingScaleMandatoryList.length > 0) {
      $("#scaleModal").modal("show");
      return;
    }

    var payload = {
      "AdmissionID": this.selectedView.IPID,
      "NursingTaskID": this.NursingInterventionDetails.TaskID,
      "WardID": this.wardID,
      "FrequencyDate": moment(new Date()).format('DD-MMM-yyyy'),
      "FrequencyTime": this.NursingInterventionDetails.FrequencyTime,
      "OverAllScore": this.totalSelectedScore,
      "HospitalID": this.hospitalID,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.wardID,
      "RiskAssessmentDetails": riskAssessmentDetails
    }

    this.config.SavePatientBradenScale(payload).subscribe(response => {
      if (response.Code == 200) {
        $("#BradenScaleMsg").modal('show');
        this.nursingInterventionsAfterSave = response.VitalsInterventionsDataaList;
      }
    })
  }

  FetchBradenScaleMaster() {
    this.config.FetchBradenScaleMaster(this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe(response => {
      if (response) {
        if (response.FetchBradenScaleMasterDataaList) {
          this.convertedData = [];
          const groupedData = response.FetchBradenScaleMasterDataaList.reduce((acc: any, obj: any) => {
            let filteredData: any = [];
            if(this.data) {
              filteredData = this.data.data.filter((item: any) => item.RiskFactorValueID === obj.RiskFactorValueID);
            }
            
            const { RiskFactorID, RiskFactor, RiskFactorSubGroupID, RiskFactorSubGroup, Description, Sequence } = obj;
            if (!acc[RiskFactorID]) {
              acc[RiskFactorID] = {
                RiskFactorID,
                RiskFactor,
                RiskFactorSubGroupID,
                RiskFactorSubGroup,
                Description,
                Sequence,
                Options: []
              };
            }
            acc[RiskFactorID].Options.push({
              RiskFactorValue: obj.RiskFactorValue,
              RiskFactorValueID: obj.RiskFactorValueID,
              AssessmentScore: obj.AssessmentScore,
              Selected: filteredData.length > 0 ? true: false
            });

            return acc;
          }, {});

          for (const key in groupedData) {
            if (groupedData.hasOwnProperty(key)) {
              this.convertedData.push(groupedData[key]);
            }
          }

          this.convertedData.forEach((data: any) => {
            let selectedIndex = -1; 
            for (let i = 0; i < data.Options.length; i++) {
              if (data.Options[i].Selected) {
                selectedIndex = i; 
                break;
              }
            }

            if(selectedIndex > -1) {
              this.toggleActive(data, selectedIndex, data.Options);
            }
          });
        }
      }
    });
  }

  bradenclose() {
    this.close.emit();
  }

}
