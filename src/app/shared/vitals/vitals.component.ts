import { Component, ElementRef, EventEmitter, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ConfigService } from 'src/app/services/config.service';
declare var $: any;

@Component({
  selector: 'app-vitals',
  templateUrl: './vitals.component.html',
  styleUrls: ['./vitals.component.scss']
})
export class VitalsComponent implements OnInit {
  isSubmitted: any = false;
  tableVitals: any;
  selectedView: any;
  hospId: any;
  paramter: any;
  isBPsys: boolean = false;
  isBPdia: boolean = false;
  isTemperature: boolean = false;
  testorderresults: any;
  svgHighLow: any;
  isPulse: boolean = false;
  isSPO2: boolean = false;
  isRespiration: boolean = false;
  isO2FlowRate: boolean = false;
  bpmsg: boolean = false;
  temparaturepmsg: boolean = false;
  ishigh: any
  islow: any
  BPsys_value: any = null
  BPdia_value: any = null
  Temp_value: any = null
  low: any;
  high: any;
  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;
  selectedParameter:any;
  remarksMap: Map<number, string> = new Map<number, string>();
  recordRemarks: Map<number, string> = new Map<number, string>();
  remarksSelectedIndex: number = -1;
  remarkForm: any;
  langData: any;
  get items(): FormArray {
    return this.remarkForm.get('items') as FormArray;
  }
  @Output() receivedData=  new EventEmitter<{ vitalData: any, remarksData: any }>();

  constructor(private con: ConfigService,private fb: FormBuilder) { 
    this.langData = this.con.getLangData();
    this.remarkForm = this.fb.group({
      CMD: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.hospId = sessionStorage.getItem("hospitalId");
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.GetVitalsParams();
  }

  GetVitalsParams() {
    var age = this.selectedView.Age;
    //if(this.selectedView.PatientType == '2')
      age = this.selectedView.AgeValue;
    this.con.getVitalsParams(this.hospId, this.selectedView.GenderID, age).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitals = response.GetAllVitalsList;

        setTimeout(() => {
            if (this.inputFields && this.inputFields.first) {
              this.inputFields.first.nativeElement.focus();
            }
        }, 2000);

        this.receivedData.emit({ vitalData: this.tableVitals, remarksData: this.recordRemarks });

      } else {
      }
    },
      (err) => {

      })
  }

  checkMaxRangeValue(event: any, current_parameter: any, current_value: any, min_value: any, max_value: any, index: any) {
    current_value = parseFloat(current_value);
    min_value = parseFloat(min_value);
    max_value = parseFloat(max_value)
    this.paramter = current_parameter;
    this.tableVitals.forEach((element: any, index: any) => {
      if (element.PARAMETER == "BP -Systolic") {
        this.BPsys_value = "";
        this.isBPsys = false;
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = false;
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          this.BPsys_value = "Abnormal";
          this.isBPsys = true; this.bpmsg = true;
          this.tableVitals[index].VitalHigh = true;
          this.tableVitals[index].VitalLow = false;
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          this.BPsys_value = "Low";
          this.isBPsys = true; this.bpmsg = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
        }
        else {

        }
      }
      else if (element.PARAMETER == "BP-Diastolic") {
        this.BPdia_value = "";
        this.isBPdia = false;
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = false;
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          this.BPdia_value = "Abnormal";
          this.isBPdia = true; this.bpmsg = true;
          this.tableVitals[index].VitalHigh = true;
          this.tableVitals[index].VitalLow = false;
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          this.BPdia_value = "Low";
          this.isBPdia = true; this.bpmsg = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
        }
        else {
          this.BPdia_value = "";
          this.isBPdia = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
      }
      else if (current_parameter == "Temparature") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          this.Temp_value = "Abnormal";
          this.isTemperature = true; this.bpmsg = true; this.temparaturepmsg = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          this.Temp_value = "Low"; this.bpmsg = true; this.temparaturepmsg = true;
          this.isTemperature = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
        }
        else {
          this.Temp_value = "";
          this.isTemperature = false; this.temparaturepmsg = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
      }

    else if (current_parameter == "Pulse") {
      if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
        this.Temp_value = "Abnormal";
        this.isPulse = true;
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = true;
      }
      else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
        this.Temp_value = "Low";
        this.isPulse = true;
        this.tableVitals[index].VitalLow = true;
        this.tableVitals[index].VitalHigh = false;
      }
      else {
        this.Temp_value = "";
        this.isPulse = false;
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = false;
      }
    }

    else if (current_parameter == "SPO2") {
      if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
        this.Temp_value = "Abnormal";
        this.isSPO2 = true;
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = true;
      }
      else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
        this.Temp_value = "Low";
        this.isSPO2 = true;
        this.tableVitals[index].VitalLow = true;
        this.tableVitals[index].VitalHigh = false;
      }
      else {
        this.Temp_value = "";
        this.isSPO2 = false;
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = false;
      }
    }
    else if (current_parameter == "Respiration") {
      if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
        this.Temp_value = "Abnormal";
        this.isRespiration = true;
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = true;
      }
      else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
        this.Temp_value = "Low";
        this.isRespiration = true;
        this.tableVitals[index].VitalLow = true;
        this.tableVitals[index].VitalHigh = false;
      }
      else {
        this.Temp_value = "";
        this.isRespiration = false;
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = false;
      }
    }
    else if (current_parameter == "O2 Flow Rate") {
      if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
        this.Temp_value = "Abnormal";
        this.isO2FlowRate = true;
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = true;
      }
      else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
        this.Temp_value = "Low";
        this.isO2FlowRate = true;
        this.tableVitals[index].VitalLow = true;
        this.tableVitals[index].VitalHigh = false;
      }
      else {
        this.Temp_value = "";
        this.isO2FlowRate = false;
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = false;
      }
    }
  });

  this.receivedData.emit({ vitalData: this.tableVitals, remarksData: this.recordRemarks });
  }

  openRemarks(index:any){
    this.selectedParameter = this.tableVitals[index]
    this.remarksSelectedIndex = index;
    const itemsArray = this.remarkForm.get('items') as FormArray | null;
    if (itemsArray) {
      const selectedCMDValue = itemsArray.at(index)?.get('CMD')?.value || '';
      this.remarkForm.get('CMD')?.setValue(selectedCMDValue);
      this.isSubmitted = false;
    }
    const remarks = this.recordRemarks.get(index) || '';
    this.remarkForm.get('CMD')?.setValue(remarks);
  $("#vitalsComments").modal('show');
  
  }
  saveRemarks(){
    this.isSubmitted = true;
    if (this.remarkForm && this.remarkForm.valid) {
      const remark = this.remarkForm.get('CMD')?.value || '';
      this.remarksMap.set(this.remarksSelectedIndex, remark);
      this.recordRemarks.set(this.remarksSelectedIndex, remark);
      this.remarkForm.reset();
      $('#vitalsComments').modal('hide');
    }

    this.receivedData.emit({ vitalData: this.tableVitals, remarksData: this.recordRemarks });
  }
  
}

