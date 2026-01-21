import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { proceduresDetails } from './urls';
import { ResultsTemplateService } from './results-template.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
declare var $: any;

@Component({
  selector: 'app-results-template',
  templateUrl: './results-template.component.html',
  styleUrls: ['./results-template.component.scss']
})
export class ResultsTemplateComponent extends BaseComponent implements OnInit {
  url = '';
  NameList: any;
  isNew = false;
  resultsForm: any;
  FetchProceduresTestTemplateDataList: any;
  constructor(private service: ResultsTemplateService, private us: UtilityService, public formBuilder: FormBuilder, private datePipe: DatePipe) {
    super();
    this.initializeForm();
   }

   initializeForm() {
    this.resultsForm = this.formBuilder.group({
      Name: ['', Validators.required],
      ProcedureID: ['', Validators.required],
      TemplateName: [''],
      TemplateID: ['0'],
      ComponentID: ['0'],
      ComponentValue: ['']
    });
   }

  ngOnInit(): void {
    this.service.param = {
      ...this.service.param,     
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
      WorkStationID: Object.keys(this.facilitySessionId).length > 0 ? this.facilitySessionId : this.service.param.WorkStationID,
    };
  }

  newClick() {
    this.isNew = !this.isNew;
  }

  searchProcedure(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(proceduresDetails.FetchTemplateProcedures, { Filter: event.target.value });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.NameList = response.FetchSurgeriesDataaList;
            this.FetchProceduresTestTemplateDataList = [];
          }
        },
          (err) => {
          })
    }
  }

  onNameSelected(item: any) {
    this.NameList = [];
    if(!item.CMPID) {
      $("#errorMsg").modal('show');
      return;
    }

    this.NameList = [];
    this.FetchProceduresTestTemplateDataList = [];
    this.resultsForm.patchValue({
      Name: item.Name,
      ProcedureID: item.ProcedureID,
      ComponentID:item.CMPID,
    });

    this.FetchProcedure(item.ProcedureID);
  }

  FetchProcedure(TestID: any) {
    this.url = this.service.getData(proceduresDetails.FetchProceduresTestTemplate, { TestID: TestID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchProceduresTestTemplateDataList = response.FetchProceduresTestTemplateDataList;
        }
      },
        (err) => {

        })
  }

  FetchProceduresTestTemplateData(event: any) {
    this.url = this.service.getData(proceduresDetails.FetchProceduresTestTemplateData, { TestTemplateID: this.resultsForm.get("TemplateID").value,TestID: this.resultsForm.get("ProcedureID").value });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.resultsForm.patchValue({
            ComponentID: response.FetchProceduresTestTemplateDataFList[0]?.ComponentID,
            ComponentValue: response.FetchProceduresTestTemplateDataFList[0]?.ComponentValue,
            TemplateName: event.target.options[event.target.options.selectedIndex].text,
            TemplateID: event.target.options[event.target.options.selectedIndex].value
          });
        }
      },
        (err) => {

        })
  }

  save() {
    var TemplateValues: any = [{
      "CMPID": this.resultsForm.get("ComponentID").value,
      "VAL": this.resultsForm.get("ComponentValue").value
    }];

    var payload = {
      "TemplateID": this.resultsForm.get("TemplateID").value,
      "TestID": this.resultsForm.get("ProcedureID").value,
      "TamplateName": this.resultsForm.get("TemplateName").value,
      "TemplateValues": TemplateValues,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": Object.keys(this.facilitySessionId).length > 0 ? this.facilitySessionId : this.service.param.WorkStationID,
      "HospitalID": this.hospitalID 
     
    };

    this.us.post(proceduresDetails.SaveHospitalResultTemplates, payload).subscribe((response) => {
      if (response.Status == "Success") {
        $("#savemsg").modal('show');
      } else {

      }
    },
      (err) => {
        console.log(err)
      })

  }

  clear() {
    this.initializeForm();
    this.isNew = false;
  }

}
