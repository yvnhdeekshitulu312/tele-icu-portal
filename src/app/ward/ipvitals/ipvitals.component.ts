import { Component, OnInit, ElementRef, QueryList, ViewChildren, ViewChild, ChangeDetectorRef, OnDestroy, ɵgetSanitizationBypassType } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { UtilityService } from 'src/app/shared/utility.service';

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
  selector: 'app-ipvitals',
  templateUrl: './ipvitals.component.html',
  styleUrls: ['./ipvitals.component.scss'],
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
export class IpvitalsComponent implements OnInit, OnDestroy {

  currentdate: any;
  location: any;
  hospId: any;
  langData: any;
  tablePatientsForm!: FormGroup;
  patientDetails: any;
  doctorDetails: any;
  facility: any;
  selectedView: any;
  tableVitalsList: any;
  tableVitalsListC:number=0;
  tableVitalsListFiltered: any;
  tableVitals: any;
  tableVitalsScores: any;
  painScoreMaster: any;
  PatientID: any;
  FrequencyTime: any;
  TaskID: any;
  paramter: any;
  BPsys_value: any = null
  BPdia_value: any = null
  Temp_value: any = null
  isBPsys: boolean = false;
  isBPdia: boolean = false;
  isTemperature: boolean = false;
  isPulse: boolean = false;
  isSPO2: boolean = false;
  isRespiration: boolean = false;
  isO2FlowRate: boolean = false;
  bpmsg: boolean = false;
  temparaturepmsg: boolean = false;
  ishigh: any
  islow: any
  low: any;
  high: any;
  totalScore = 0;
  IsHeadNurse: any;
  selectedCard: any;
  isAreaSplineActive: boolean = false;
  isSplineActive: boolean = true;
  isLineActive: boolean = false;
  isColumnActive: boolean = false;
  activeButton: string = 'spline';

  isSubmitted: any = false;
  selectedParameter: any;
  remarksMap: Map<number, string> = new Map<number, string>();
  recordRemarks: Map<number, string> = new Map<number, string>();
  showParamValidationMessage: boolean = false;
  showVitalsValidation: boolean = false;
  vitalsValidation: boolean = false;
  parameterErrorMessage: string = "";
  remarksSelectedIndex: number = -1;
  remarkForm: any;
  nursingInterventions: any;
  IsScore = false;
  selectedPainScore: any = 0;
  IsScoreSaved = false;
  errorMessages: any;
  nursingInterventionDetails: any;
  NursingReDirect: boolean = false;
  hypertension: any;
  tableVitalHypertensionParameters: any;
  IsHome = true;
  isNational = false;
  nationalID: any;
  dashboardtype = "false";
  patinfo: any;
  Ventilated: any = '0';
  Bipap: any = '0';
  Cpap: any = '0';
  remarksNotEntered: any;
  showRemarksMessage: boolean = false;
  consciousnessValue: any = "0";
  trustedUrl: any;
  consciousnessData: any = [];
  behaviourData: any = [];
  consciousnessSelectionValue: any;
  behaviourSelectionValue: any;
  niForm!: FormGroup;
  number = Number;
  nursingInventions: any = [];

  get items(): FormArray {
    return this.remarkForm.get('items') as FormArray;
  }

  charAreaSpline!: Highcharts.Chart
  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;
  @ViewChild('chartLineAreaSpline', { static: true }) chartLineAreaSpline!: ElementRef;
  @ViewChild('chartLineSpline', { static: true }) chartLineSpline!: ElementRef;
  @ViewChild('chartLine', { static: true }) chartLine!: ElementRef;
  @ViewChild('chartColumn', { static: true }) chartColumn!: ElementRef;

  constructor(private fb: FormBuilder, private config: ConfigService, private router: Router, public datepipe: DatePipe, private changeDetectorRef: ChangeDetectorRef, private us: UtilityService) {
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    this.dashboardtype = sessionStorage.getItem("fromwardnursingdashboard") || 'false';
    this.remarkForm = this.fb.group({
      CMD: ['', Validators.required]
    });

    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }

    this.niForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });

    var d = new Date();
    this.niForm.patchValue({
      FromDate: d,
      ToDate: d
    })
  }


  ngOnInit(): void {
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY, H:mm',);
    this.hospId = sessionStorage.getItem("hospitalId");
    this.location = sessionStorage.getItem("locationName");
    this.langData = this.config.getLangData();
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.PatientID = this.selectedView.PatientID;
    this.nursingInterventionDetails = JSON.parse(sessionStorage.getItem("NursingInterventionDetails") || '{}');
    this.FrequencyTime = this.nursingInterventionDetails.FrequencyTime;
    this.TaskID = this.nursingInterventionDetails.TaskID;
    this.initializetablePatientsForm();
    this.hypertension = "";
    this.getConciousnessAndBehavior();
    // this.GetVitalsParams();
    // this.FetchVitalHypertensionParameters();
    // this.fetchVitalPainScoreMaster();
    // this.GetVitalsData();
  }


  ngOnDestroy(): void {
    sessionStorage.setItem("fromwardnursingdashboard", "");
  }

  initializetablePatientsForm() {
    this.tablePatientsForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });
    var wm = moment(this.selectedView.AdmitDate).format('yyyy-MM-DD');
    var d = new Date();
    this.tablePatientsForm.patchValue({
      FromDate: wm,
      ToDate: d
    })
  }

  onNationalIDEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.onchangeNationalID();
      this.changeDetectorRef.detectChanges();
    }
  }

  onchangeNationalID() {
    this.isNational = false;
    if (this.nationalID) {
      this.consciousnessSelectionValue = '';
      this.behaviourSelectionValue = '';
      //this.fetchAdmittedChildDetails();

      var BedList = JSON.parse(sessionStorage.getItem("BedList") || '{}');
      const selectedItem = BedList.find((value: any) => value.SSN.toString().toUpperCase() === this.nationalID.toString().toUpperCase());
      if (selectedItem) {
        this.selectedView = selectedItem;
        this.patientDetails = selectedItem;
        sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientDetails));
        this.isNational = true;
        if (Number(this.selectedView.FullAgeValue) > 14) {
          this.GetVitalsParams();
        } else {
          this.tableVitals = [];
        }
        this.FetchVitalHypertensionParameters();
        this.fetchVitalPainScoreMaster();
        setTimeout(() => {
          this.GetVitalsData();
        }, 1000);
       
      }
    }

  }

  fetchVitalPainScoreMaster() {
    this.config.fetchVitalPainScoreMaster(sessionStorage.getItem('hospitalId')).subscribe((response) => {
      if (response.Status === "Success") {
        this.painScoreMaster = response.SmartDataList;
      } else {
      }
    },
      (err) => {

      })
  }

  getConciousnessAndBehavior() {
    this.config.getConciousnessAndBehavior(sessionStorage.getItem('hospitalId'), this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID).subscribe((response) => {
      if (response.Code === 200) {
        this.consciousnessData = response.FetchConsciousnessDataList;
        this.behaviourData = response.FetchBehaviorTypesDataList;
      }
    })
  }

  onConsciousnessSelection(item: any) {
    this.tableVitals = [];
    this.consciousnessSelectionValue = item;
    this.behaviourSelectionValue = '';
    // if (this.consciousnessSelectionValue.ConsciousnessTypeID === '2') {
    //   this.GetVitalsParams();
    // }
    // else 
    if (this.consciousnessSelectionValue && this.behaviourSelectionValue) {
      this.GetVitalsParams();
    }
  }

  onBehaviourSelection(item: any) {
    this.tableVitals = [];
    this.behaviourSelectionValue = item;
    if (this.consciousnessSelectionValue && this.behaviourSelectionValue) {
      this.GetVitalsParams();
    }
  }

  GetVitalsParams() {
    const { SpecialiseID, GenderID, FullAgeValue, FullAgeUOMID } = this.selectedView;
    let consciousnessTypeID = 0;
    let behaviorTypeID = 0
    if (Number(FullAgeValue) <= 14) {
      consciousnessTypeID = this.consciousnessSelectionValue.ConsciousnessTypeID;
      behaviorTypeID = this.behaviourSelectionValue?.BehaviorTypeID ?? 0;
    }
    this.config.getVitalsParamsSpec(this.hospId, SpecialiseID, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, GenderID, FullAgeValue, FullAgeUOMID, consciousnessTypeID, behaviorTypeID).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitals = response.GetVitalsParamsDataSPList;
        if (this.tableVitals.length) {
          this.tableVitals.forEach((element: any, index: any) => {
            element.FinalScore = 0
          });
          this.GetVitalScores();
          setTimeout(() => {
            if (this.inputFields && this.inputFields.first) {
              this.inputFields.first.nativeElement.focus();
            }
          }, 1000);
        } else {
          this.errorMessages = [];
          this.errorMessages.push('No Vital Parameters Found');
          $('#errorMessage').modal('show');
        }
      } else {
      }
    },
      (err) => {

      })
  }
  GetVitalScores() {
    this.config.fetchVitalScores(this.doctorDetails[0].UserId, this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitalsScores = response.FetchVitalScoresDataList;
        //this.GetVitalsData();
      } else {
      }
    },
      (err) => {

      })
  }
  GetVitalsData() {
    var vm = new Date(); //vm.setMonth(vm.getMonth() - 12);
    vm.setDate(vm.getDate() - 5);
   // var FromDate = this.datepipe.transform(this.selectedView.AdmitDate, "dd-MMM-yyyy")?.toString();
   var FromDate = this.datepipe.transform(vm, "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    //this.config.fetchIPPatientVitals(this.selectedView.IPID, FromDate, ToDate, this.hospId)
    this.config.FetchIPPatientVitalsRR(this.selectedView.IPID, FromDate, ToDate, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchIPPatientVitalsRRDataList.length > 0) {
          this.tableVitalsList = response.FetchIPPatientVitalsRRDataList;
          this.tableVitalsListC=1;
          let bpsys = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP -Systolic");
          let bpdia = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP-Diastolic");
          let temp = this.tableVitals.filter((x: any) => x?.PARAMETER === "Temperature");
          //updating BP,Temp in sessionStorage
          if(bpsys[0]?.PARAMVALUE) {
            this.selectedView.BPSystolic = bpsys[0].PARAMVALUE;
          }
          if(bpdia[0]?.PARAMVALUE) {
            this.selectedView.BPDiastolic = bpdia[0].PARAMVALUE;
          }
          if(bpsys[0]?.PARAMVALUE && bpdia[0]?.PARAMVALUE) {
            this.selectedView.BP = bpsys[0].PARAMVALUE + '/' + bpdia[0].PARAMVALUE;
          }
          if(temp[0]?.PARAMVALUE) {
            this.selectedView.Temperature = temp[0].PARAMVALUE;
          }
          sessionStorage.setItem("InPatientDetails", JSON.stringify(this.selectedView));

          const distinctThings = response.FetchIPPatientVitalsRRDataList.filter(
            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.CreateDateNew === thing.CreateDateNew) === i);
          this.tableVitalsListFiltered = distinctThings;
          //this.createChartLine(2);
          this.spline();
        }
        else{
          this.tableVitalsListC=0;
        }
      },
        (err) => {

        })

  }
  filterFunction(vitals: any, visitid: any) {
    return vitals.filter((buttom: any) => buttom.CreateDateNew == visitid);
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
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.BPsys_value = "Abnormal";
          this.isBPsys = true; this.bpmsg = true;
          this.tableVitals[index].VitalHigh = true;
          this.tableVitals[index].VitalLow = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.BPsys_value = "Low";
          this.isBPsys = true; this.bpmsg = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else {

        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0) {
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
          element.Color = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].Color;
          element.FinalScore = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        }
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (element.PARAMETER == "BP-Diastolic") {
        this.BPdia_value = "";
        this.isBPdia = false;
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = false;
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.BPdia_value = "Abnormal";
          this.isBPdia = true; this.bpmsg = true;
          this.tableVitals[index].VitalHigh = true;
          this.tableVitals[index].VitalLow = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.BPdia_value = "Low";
          this.isBPdia = true; this.bpmsg = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else {
          this.BPdia_value = "";
          this.isBPdia = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0) {
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
          element.FinalScore = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;

        } else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (current_parameter == "Temperature") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isTemperature = true; this.bpmsg = true; this.temparaturepmsg = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Low"; this.bpmsg = true; this.temparaturepmsg = true;
          this.isTemperature = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else {
          this.Temp_value = "";
          this.isTemperature = false; this.temparaturepmsg = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0) {
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
          element.FinalScore = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;

        }
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }

      else if (current_parameter == "Pulse") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isPulse = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Low";
          this.isPulse = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else {
          this.Temp_value = "";
          this.isPulse = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0) {
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
          element.FinalScore = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;

        } else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }

      else if (current_parameter == "SPO2") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isSPO2 = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Low";
          this.isSPO2 = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else {
          this.Temp_value = "";
          this.isSPO2 = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0) {
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
          element.FinalScore = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;

        }
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (current_parameter == "Respiration") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isRespiration = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Low";
          this.isRespiration = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else {
          this.Temp_value = "";
          this.isRespiration = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0) {
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
          element.FinalScore = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;

        }
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (current_parameter == "O2 Flow Rate") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isO2FlowRate = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Low";
          this.isO2FlowRate = true;
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          // if (remark === undefined || remark.trim() === "") {
          //   this.openRemarks(index);
          // }
        }
        else {
          this.Temp_value = "";
          this.isO2FlowRate = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0) {
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
          element.FinalScore = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        }
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      this.totalScore = this.tableVitals.map((item: any) => (item.PARAMVALUE != null && item.FinalScore != "" && item.FinalScore != "METCALL") ? Number.parseInt(item.FinalScore) : 0).reduce((acc: any, curr: any) => acc + curr, 0);

      if ((this.tableVitals[0].PARAMVALUE != null && this.tableVitals[0].PARAMVALUE != "")) {
        this.getVitalsHypertensionParameter(parseFloat(this.tableVitals[0].PARAMVALUE));
      }

    });
  }

  getVitalsHypertensionParameter(bpSys: any) {
    this.tableVitalHypertensionParameters.forEach((element: any, index: any) => {
      if (element.ParameterID == "1") {
        if (
          bpSys > parseFloat(element.SYS.split('>')[1])
          //|| bpDia > parseFloat(element.DIA.split('>')[1])
        ) {
          this.hypertension = element;
        }
      }
      else if (element.ParameterID == "5") {
        if (
          bpSys < parseFloat(element.SYS.split('<')[1])
          //||  bpDia < parseFloat(element.DIA.split('<')[1])
        ) {
          this.hypertension = element;
        }
      }
      else {
        if (
          (bpSys >= parseFloat(element.SYS.split('-')[0]) && bpSys <= parseFloat(element.SYS.split('-')[1]))
          //|| (bpDia >= parseFloat(element.DIA.split('-')[0]) && bpDia <= parseFloat(element.DIA.split('-')[1]))
        ) {
          this.hypertension = element;
        }
      }
    });
  }
  FetchVitalHypertensionParameters() {
    this.config.fetchVitalHypertensionParameters(this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitalHypertensionParameters = response.FetchHypertensionParametersOutputLists;
      } else {
      }
    },
      (err) => {

      })
  }

  private createChartLine(type: number): void {
    let vitaldata: any = {};

    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];


    this.tableVitalsList.forEach((element: any, index: any) => {

      if (type == 1) {
        element.VisitDate = element.CreateDateNew;
      }

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      }
      if (element.Temperature != 0) {
        TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
      }
    });

    vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
    { name: 'BP-Diastolic', data: BPDiastolicData },
    { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
    { name: 'Pulse', data: PulseData, visible: false },
    { name: 'Respiration', data: RespirationData, visible: false },
    { name: 'SPO2', data: SPO2Data, visible: false },
    { name: 'Temparature', data: TemparatureData, visible: false }
    ];

    const chart = Highcharts.chart('chart-line', {
      chart: {
        type: 'spline',
        zoomType: 'x'
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category',
        min: 0,
        max: 9
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
      },
      series: vitaldata,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
      }
    } as any);

    const chartviewmore = Highcharts.chart('chart-line-viewmore', {
      chart: {
        type: 'areaspline',
        zoomType: 'x'
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category',
        min: 0,
        max: 9
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
      },
      series: vitaldata,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
      }
    } as any);
  }
  areaSpline(): void {
    this.isAreaSplineActive = true;
    this.isSplineActive = false;
    this.isLineActive = false;
    this.isColumnActive = false;
    this.activeButton = 'areaSpline';
    let vitaldata: any = {};
    let type = 1;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];
    this.tableVitalsList.forEach((element: any, index: any) => {

      if (type == 1) {
        element.VisitDate = element.CreateDateNew;
      }

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
    });

    vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
    { name: 'BP-Diastolic', data: BPDiastolicData },
    { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
    { name: 'Pulse', data: PulseData, visible: false },
    { name: 'Respiration', data: RespirationData, visible: false },
    { name: 'SPO2', data: SPO2Data, visible: false },
    { name: 'Temparature', data: TemparatureData, visible: false }
    ];
    this.charAreaSpline = Highcharts.chart(this.chartLineAreaSpline.nativeElement, {
      chart: {
        type: 'areaspline',
        zoomType: 'x'
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category',
        min: 0,
        max: 9
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
      },
      series: vitaldata,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
      }
    } as any);
  }
  spline() {
    this.isAreaSplineActive = false;
    this.isSplineActive = true;
    this.isLineActive = false;
    this.isColumnActive = false;
    this.activeButton = 'spline';
    let vitaldata: any = {};
    let type = 1;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];


    this.tableVitalsList.forEach((element: any, index: any) => {

      if (type == 1) {
        element.VisitDate = element.CreateDateTimeNew;
      }

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
    });

    vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
    { name: 'BP-Diastolic', data: BPDiastolicData },
    { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
    { name: 'Pulse', data: PulseData, visible: false },
    { name: 'Respiration', data: RespirationData, visible: false },
    { name: 'SPO2', data: SPO2Data, visible: false },
    { name: 'Temparature', data: TemparatureData, visible: false }
    ];
    this.charAreaSpline = Highcharts.chart(this.chartLineSpline.nativeElement, {
      chart: {
        type: 'spline',
        zoomType: 'x'
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category',
        min: 0,
        max: 9
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
      },
      series: vitaldata,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
      }
    } as any);
  }
  line() {
    this.isAreaSplineActive = false;
    this.isSplineActive = false;
    this.isLineActive = true;
    this.isColumnActive = false;
    this.activeButton = 'line';
    let vitaldata: any = {};
    let type = 1;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];

    this.tableVitalsList.forEach((element: any, index: any) => {
      if (type == 1) {
        element.VisitDate = element.CreateDateNew;
      }

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
    });

    vitaldata = [
      { name: 'BP-Systolic', data: BPSystolicData },
      { name: 'BP-Diastolic', data: BPDiastolicData },
      { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
      { name: 'Pulse', data: PulseData, visible: false },
      { name: 'Respiration', data: RespirationData, visible: false },
      { name: 'SPO2', data: SPO2Data, visible: false },
      { name: 'Temparature', data: TemparatureData, visible: false }
    ];

    this.charAreaSpline = Highcharts.chart(this.chartLine.nativeElement, {
      chart: {
        type: 'line',
        zoomType: 'x'
      },
      title: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category',
        min: 0,
        max: 9
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
      },
      series: vitaldata,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
      }
    } as any);
  }
  column() {
    this.isAreaSplineActive = false;
    this.isSplineActive = false;
    this.isLineActive = false;
    this.isColumnActive = true;
    this.activeButton = 'column';
    let vitaldata: any = {};
    let type = 1;
    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];

    this.tableVitalsList.forEach((element: any, index: any) => {
      if (type == 1) {
        element.VisitDate = element.CreateDateNew;
      }

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      }
      TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
    });

    vitaldata = [
      { name: 'BP-Systolic', data: BPSystolicData },
      { name: 'BP-Diastolic', data: BPDiastolicData },
      { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
      { name: 'Pulse', data: PulseData, visible: false },
      { name: 'Respiration', data: RespirationData, visible: false },
      { name: 'SPO2', data: SPO2Data, visible: false },
      { name: 'Temparature', data: TemparatureData, visible: false }
    ];

    this.charAreaSpline = Highcharts.chart(this.chartColumn.nativeElement, {
      chart: {
        type: 'column',
        zoomType: 'x'
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category',
        min: 0,
        max: 9
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
      },
      series: vitaldata,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
      }
    } as any);
  }

  openRemarks(index: any) {
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
  saveRemarks() {
    this.isSubmitted = true;
    if (this.remarkForm && this.remarkForm.valid) {
      const remark = this.remarkForm.get('CMD')?.value || '';
      this.remarksMap.set(this.remarksSelectedIndex, remark);
      this.recordRemarks.set(this.remarksSelectedIndex, remark);
      this.remarkForm.reset();
      $('#vitalsComments').modal('hide');
      this.isSubmitted = false;
    }
  }
  saveIpVitals() {
    if (this.selectedPainScore == 0) {
      this.errorMessages = "Please Select the Pain score";
      $('#errorMessage').modal('show');
      return;
    }

    if (!this.IsScoreSaved && this.selectedPainScore > 1) {
      this.errorMessages = "Please save the Pain score";
      $('#errorMessage').modal('show');
      return;
    }

    let find = this.tableVitals.filter((x: any) => x?.PARAMVALUE === null);
    let bpsys = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP -Systolic");
    let bpdia = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP-Diastolic");
    let temp = this.tableVitals.filter((x: any) => x?.PARAMETER === "Temperature");
    let cons = this.tableVitals.filter((x: any) => x?.PARAMETER === "Consciousness");
    let remarksEntered = true;
    this.remarksNotEntered = [];
    if (bpsys[0].PARAMVALUE === null || bpsys[0].PARAMVALUE === "" || bpdia[0].PARAMVALUE === null || bpdia[0].PARAMVALUE === "" || temp[0].PARAMVALUE === null || temp[0].PARAMVALUE === "" || this.consciousnessValue === "0") {
      this.showVitalsValidation = true;
    } else {
      let VsDetails: any = [];
      let outOfRangeParameters: string[] = [];
      const metcallparams = this.tableVitals.filter((x: any) => x.Score === 'METCALL');
      this.tableVitals.forEach((element: any, index: any) => {
        let RST: any; let ISPANIC: any;
        if (element.PARAMVALUE != "" && element.PARAMVALUE != null) {

          if ((element.PARAMVALUE >= element.ALLOWUOMMINRANGE && element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE && element.PARAMVALUE <= element.ALLOWUOMMAXRANGE))
            RST = 2;
          else
            RST = 1;

          if ((!element.PARAMVALUE) && ((element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE)))
            ISPANIC = 1;
          else
            ISPANIC = 0;

          const remark = this.recordRemarks.get(index);
          if ((element.PARAMVALUE !== null && element.VitalHigh || element.VitalLow) && element.PARAMETERID !== '3') {
            if (metcallparams.length === 0) {
              outOfRangeParameters.push(element.PARAMETER);
              if (remark === undefined || remark.trim() === "") {
                this.remarksNotEntered.push({
                  index,
                  element
                })
                this.parameterErrorMessage = `Please enter Remarks for ${element.PARAMETER}`;
                remarksEntered = false;
              }
            }
          }
          VsDetails.push({
            "VSPID": element.PARAMETERID,
            "VSNAME": element.PARAMETER,
            "VSGID": element.GROUPID,
            "VSGDID": element.GroupDETAILID,
            "PV": element.PARAMVALUE,
            "CMD": remark,
            "RST": RST,
            "ISPANIC": ISPANIC
          });
        }
        else if ((element.PARAMETERID === '10' || element.PARAMETERID === '11' || element.PARAMETERID === '12') && element.PARAMVALUE === null) {
          element.PARAMVALUE = 'NO';
          RST = 0;
          VsDetails.push({
            "VSPID": element.PARAMETERID,
            "VSNAME": element.PARAMETER,
            "VSGID": element.GROUPID,
            "VSGDID": element.GroupDETAILID,
            "PV": element.PARAMVALUE,
            "CMD": '',
            "RST": RST,
            "ISPANIC": 0
          });
        }
        else if ((element.PARAMETERID === '10' || element.PARAMETERID === '11' || element.PARAMETERID === '12') && element.PARAMVALUE === 'YES') {
          RST = 1;
          VsDetails.push({
            "VSPID": element.PARAMETERID,
            "VSNAME": element.PARAMETER,
            "VSGID": element.GROUPID,
            "VSGDID": element.GroupDETAILID,
            "PV": element.PARAMVALUE,
            "CMD": '',
            "RST": RST,
            "ISPANIC": 0
          });
        }

      });
      if (metcallparams.length > 0) {
        metcallparams.forEach((element: any, index: any) => {
          const remark = this.recordRemarks.get(index);
          outOfRangeParameters.push(element.PARAMETER);
          if (remark === undefined || remark.trim() === "") {
            this.remarksNotEntered.push({
              index,
              element
            })
            this.parameterErrorMessage = `Please enter Remarks for ${element.PARAMETER}`;
            remarksEntered = false;
          }
        });
      }
      if (outOfRangeParameters.length > 0 && !remarksEntered) {
        this.showRemarksMessage = false;
        const isMetCallRecordAvaialble = this.remarksNotEntered.find((item: any) => item.element.Score === 'METCALL')
        this.remarksNotEntered.forEach((data: any) => {
          data.value = isMetCallRecordAvaialble ? 'METCALL' : '';
        });
        $("#remarks").modal('show');
        this.showParamValidationMessage = true;
        this.showVitalsValidation = false;
        return;
      }
      let payload = {
        "VitalGroupID": "3",
        "MonitorId": "0",
        "PatientID": this.selectedView.PatientID,
        "Admissionid": this.selectedView.IPID,
        "DoctorID": this.patientDetails.ConsultantID,//this.doctorDetails[0].EmpId,CompanyID
        "HospitalId": this.hospId,
        "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId == undefined ? this.patientDetails.SpecialiseID : this.doctorDetails[0].EmpSpecialisationId,
        "PatientType": this.selectedView.PatientType,
        "ScheduleID": "0",
        "FacilityID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,//sessionStorage.getItem("facilityID"),
        "UserId": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,// sessionStorage.getItem("facilityID"),
        "BedID": this.selectedView.BedID,
        "VitalScore": this.totalScore,
        "WardTaskEntryID": 0,
        "FrequencyDate": moment(new Date()).format('DD-MMM-yyyy HH:MM'),
        "FrequencyTime": this.FrequencyTime,
        "TaskID": this.TaskID,
        "VSDetails": VsDetails
      };
      this.config.SaveClinicalIPVitals(payload).subscribe(response => {
        if (response.Code == 200) {
          $("#saveVitalsMsg").modal('show');
          $("#vitalsModal").modal('hide');
          this.nursingInterventions = response.VitalsInterventionsDataaList;
          this.vitalsValidation = false;
          this.Bipap = '0'; this.Ventilated = '0'; this.Cpap = '0';
          outOfRangeParameters.forEach((parameter: any) => {
            const index = this.tableVitals.findIndex((element: any) => element.PARAMETER === parameter);
            this.recordRemarks.delete(index);
          });
        }
        this.GetVitalsData();
      })
      this.showParamValidationMessage = false;
    }
  }

  onRemarksSave() {
    let isRemarksEntered = true;
    this.remarksNotEntered.forEach((item: any) => {
      if (!item.value) {
        isRemarksEntered = false;
      }
    });
    if (isRemarksEntered) {
      this.remarksNotEntered.forEach((item: any) => {
        this.recordRemarks.set(item.index, item.value);
      });
      this.showRemarksMessage = false;
      $("#remarks").modal('hide');
      this.saveIpVitals();
    } else {
      this.showRemarksMessage = true;
    }
  }

  NavigationURL() {
    // if (this.TaskID != "")
    //   this.navigatetoNursingBoard();
    this.onchangeNationalID();

  }
  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }
  onLogout() {
    this.config.onLogout();
  }
  clearVitals() {
    this.tableVitals.forEach((item: any) => {
      item.PARAMVALUE = '';
      item.VitalLow = '';
      item.VitalHigh = '';
      item.Score = '';
      this.totalScore = 0;
    });
    this.hypertension = "";
    this.isNational = false;
    this.nationalID = "";
    this.tableVitalsListC=0;
  }

  onPainScoreChange(event: any) {

    if (event === -1) {
      $("#modalPainScore").modal('show');
      return;
    }

    const selectedValue = (event.target as HTMLSelectElement).value;
    this.IsScore = false;
    this.selectedPainScore = Number(selectedValue);
    if (Number(selectedValue) > 1) {
      this.IsScore = true;
      $("#modalPainScore").modal('show');
    }
  }

  closePopup() {
    this.IsScoreSaved = true;
    $("#modalPainScore").modal('hide');
  }
  navigatetoNursingBoard() {
    if (!this.nationalID) {
      const patDet = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
      sessionStorage.setItem("InPatientDetails", JSON.stringify(patDet));
    }
    if (this.dashboardtype === "true") {
      this.router.navigate(['/ward/wardnursingdashboard']);
    }
    else {
      this.router.navigate(['/ward/nursingdashboard']);
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
  toggleVentilated(vitalparamid: string, value: string) {
    if (vitalparamid === '10') {
      this.Ventilated = value;
      if (value === '1') {
        this.Bipap = '0';
        this.Cpap = '0';
      }
    }
    else if (vitalparamid === '11') {
      this.Bipap = value;
      if (value === '1') {
        this.Ventilated = '0';
        this.Cpap = '0';
      }
    }
    else if (vitalparamid === '12') {
      this.Cpap = value;
      if (value === '1') {
        this.Bipap = '0';
        this.Ventilated = '0';
      }
    }

    var ventilated = this.tableVitals.find((x: any) => x?.PARAMETERID === vitalparamid);
    ventilated.PARAMVALUE = value === '1' ? 'YES' : 'NO';
  }

  onConsciousnessValueChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.consciousnessValue = target.value;
  }

  GetVitalsDataPrint() {
    if(this.tableVitalsList.length>0){
      var vm = new Date(); 
      vm.setDate(vm.getDate() - 5);
      var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
     //var FromDate = this.datepipe.transform(vm, "dd-MMM-yyyy")?.toString();
      var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString(); 
      this.config.FetchIPPatientVitalsRRPrint(this.selectedView.PatientID,this.selectedView.IPID, FromDate, ToDate,this.doctorDetails[0].UserName,this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200 ) {
            this.trustedUrl = response?.FTPPATH
          $("#reviewAndPayment").modal('show');
          }
        },
          (err) => {
  
          })
  
    }
    }

    openNursingInterventions() {
      $("#divnursingInventions").modal('show');
      const params = {
        AdmissionID: this.selectedView.AdmissionID,
        FromDate: moment(this.niForm.get("FromDate")?.value).format('DD-MMM-YYYY'),
        ToDate: moment(this.niForm.get("ToDate")?.value).format('DD-MMM-YYYY'),
        UserID: this.doctorDetails[0]?.UserId,
        WorkStationID: 3747,
        HospitalID: this.hospId
      };
      const url = this.us.getApiUrl(ipvitalsApis.FetchNursingWardTaskEntryDetails, params);
      this.us.get(url).subscribe((response: any) => {
        if (response.Code === 200) {
            this.nursingInventions = response.FetchNursingWardTaskEntryDetailsDataList;
        }
      },
        (err) => {

        });
    }

    closeNursingInterventions() {
      this.nursingInventions = [];
    }
   
}

export const ipvitalsApis = {
  FetchNursingWardTaskEntryDetails: 'FetchNursingWardTaskEntryDetails?AdmissionID=${AdmissionID}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
}