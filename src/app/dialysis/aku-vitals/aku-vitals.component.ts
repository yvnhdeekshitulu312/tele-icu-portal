import { ChangeDetectorRef, HostListener, Component, OnInit, ViewChild, ElementRef, Renderer2, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { DialysisConfigService as DialysisConfig } from '../services/config.service';
import { DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { BaseComponent } from 'src/app/shared/base.component';
import { ConfigService } from 'src/app/services/config.service';
import * as Highcharts from 'highcharts';

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
  selector: 'app-aku-vitals',
  templateUrl: './aku-vitals.component.html',
  styleUrls: ['./aku-vitals.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe,
  ]
})
export class AkuVitalsComponent extends BaseComponent implements OnInit {
  tableVitals: any;
  tableVitalsScores: any;
  emrPatientDetails: any;
  emrBedsDataList: any;
  filteredemrBedsDataList: any = [];

  patientInfoList: any = [];
  selectedPatientSSN: any;
  selectedPatientName: any;
  selectedPatientGender: any;
  selectedPatientAge: any;
  selectedPatientMobile: any;
  selectedPatientVTScore: any;
  selectedPatientHeight: any;
  selectedPatientWeight: any;
  selectedPatientWeightCreatedate: any;
  selectedPatientBloodGrp: any;
  selectedPatientVitalsDate: any;
  selectedPatientBPSystolic: any;
  selectedPatientBPDiastolic: any;
  selectedPatientTemperature: any;
  selectedPatientPulse: any;
  selectedPatientSPO2: any;
  selectedPatientRespiration: any;
  selectedPatientConsciousness: any;
  selectedPatientO2FlowRate: any;
  selectedPatientAllergies: any;
  selectedPatientMedications: any = [];
  selectedPatientIsVip: boolean = false;
  selectedPatientClinicalInfo: any;
  selectedPatientIsPregnancy: boolean = false;
  selectedPatientPregnancyTrisemister: any;
  smartDataList: any;
  patientHigh: any;
  parameterErrorMessage: string = "";
  selectedParameter: any;
  remarksSelectedIndex: number = -1;
  remarkForm: any;
  selectall = false;
  showBedValidation: boolean = false;
  get items(): FormArray {
    return this.remarkForm.get('items') as FormArray;
  }
  isSubmitted: any = false;
  recordRemarks: Map<number, string> = new Map<number, string>();
  remarksMap: Map<number, string> = new Map<number, string>();
  vitalsValidation: boolean = false;
  showVitalsValidation: boolean = false;
  showParamValidationMessage: boolean = false;
  tableVitalHypertensionParameters: any;
  hypertension: any;
  totalScore = 0;
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
  paramter: any;
  SelectedBedInfo: any;
  errorMessages: any;
  bedNo: string = "";
  IsAdult: boolean = true;
  ctasScore: string = "";
  ctasScoreDesc: any;
  ctasScore1Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore2Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore3Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore4Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore5Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  painScore: any;
  isDirty = false;
  selectedPainScoreId= 0;
  painScoreSelected: boolean = false;
  
  charAreaSpline!: Highcharts.Chart
  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;
  @ViewChild('chartLineAreaSpline', { static: true }) chartLineAreaSpline!: ElementRef;
  @ViewChild('chartLineSpline', { static: true }) chartLineSpline!: ElementRef;
  @ViewChild('chartLine', { static: true }) chartLine!: ElementRef;
  @ViewChild('chartLine', { static: true }) chartColumn!: ElementRef;

  constructor(private fb: FormBuilder,
    public datepipe: DatePipe,
    private router: Router,
    private config: DialysisConfig,
    private appconfig: ConfigService) {
      super();
      this.remarkForm = this.fb.group({
        CMD: ['', Validators.required]
      });
     }

  ngOnInit(): void {
    this.emrPatientDetails = JSON.parse(sessionStorage.getItem("EmrPatientDetails") || '{}');
    var score = this.emrPatientDetails.CTASSCore;
    this.ctasScore= this.emrPatientDetails.CTASSCore;
    this.selectedPainScoreId = this.emrPatientDetails.NursePainScoreID;

    if (score == "1") {
      this.ctasScore1Class = "cursor-pointer circle d-flex align-items-center justify-content-center active red";
      this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "2") {
      this.ctasScore2Class = "cursor-pointer circle d-flex align-items-center justify-content-center active red";
      this.ctasScore1Class = this.ctasScore3Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "3") {
      this.ctasScore3Class = "cursor-pointer circle d-flex align-items-center justify-content-center active";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "4") {
      this.ctasScore4Class = "cursor-pointer circle d-flex align-items-center justify-content-center active";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "5") {
      this.ctasScore5Class = "cursor-pointer circle d-flex align-items-center justify-content-center active";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    this.bedNo = this.emrPatientDetails.BedName;

    this.IsAdult = Number(this.emrPatientDetails.Age.trim().split(' ')[0]) > 14 ? true : false;
    this.hypertension = "";
    this.GetVitalsParams();
    this.GetVitalScores();
    this.FetchVitalHypertensionParameters();
    //this.FetchEMRBeds();
    this.getHight(this.emrPatientDetails);
    this.fetchPainScoreMaster();
  }
  getHight(emrPatientDetails: any) {
    this.appconfig.getPatientHight(this.emrPatientDetails.PatientID).subscribe(res => {
      this.patientHigh = res
      // this.PatientHW = res.SmartDataList
      this.smartDataList = this.patientHigh.SmartDataList;
      this.createHWChartLine();
    })
  }
  private createHWChartLine(): void {
    let data: any = {};

    const heightData: any[] = [];
    const weigthData: any[] = [];
    const BMIData: any[] = [];

    this.smartDataList.forEach((element: any, index: any) => {
      heightData.push([element.Createdate, parseFloat(element.Height)])
      weigthData.push([element.Createdate, parseFloat(element.Weight)])
      BMIData.push([element.Createdate, parseFloat(element.BMI)])
    });

    data = [{ name: 'Height', data: heightData }, { name: 'Weight', data: weigthData }];

    const chart = Highcharts.chart('chart-hw-line', {
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
        min: 0,
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
        valueDecimals: 1,
        crosshairs: [{
          width: 1,
          color: 'Gray'
        }, {
          width: 1,
          color: 'gray'
        }]
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0.5
        }
      },
      series: data,
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

  FetchEMRBeds(Type: any) {
    this.config.fetchBedsFromWard(3606, 0, '1', this.doctorDetails[0].EmpId, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.emrBedsDataList = response.FetchBedsFromWardDataList;
          if (Type == 1) {
            this.emrBedsDataList = this.emrBedsDataList.filter((x: any) => x.BedStatus == '1')
          }
          this.emrBedsDataList.forEach((element: any, index: any) => {
            if (element.BedStatus == "1")
              element.bedClass = "room_card warning";
            if (element.BedStatus == "3")
              element.bedClass = "room_card primary";
            else if (element.BedStatus == "4"||element.BedStatus == "8"||element.BedStatus == "6")
              element.bedClass = "room_card warning";
          });
          const distinctThings = response.FetchBedsFromWardDataList.filter(
            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.RoomID === thing.RoomID) === i);
          console.dir(distinctThings);
          this.filteredemrBedsDataList = distinctThings
          this.filteredemrBedsDataList = this.filteredemrBedsDataList.sort((a: any, b: any) => a.BedStatus - b.BedStatus);
        }

      },
        (err) => {
        })
  }
  filterFunction(roomlist: any, roomid: any) {
    return roomlist.filter((buttom: any) => buttom.RoomID == roomid);
  }
  GetVitalsParams() {
    this.appconfig.getVitalsParams(this.hospitalID, this.emrPatientDetails.GenderId, this.emrPatientDetails.AGeUOMID).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitals = response.GetAllVitalsList;
        this.GetVitalScores();
        setTimeout(() => {
          if (this.inputFields && this.inputFields.first) {
            this.inputFields.first.nativeElement.focus();
          }
        }, 1000);

      } else {
      }
    },
      (err) => {

      })
  }

  GetVitalScores() {
    this.appconfig.fetchVitalScores(this.doctorDetails[0].UserId, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitalsScores = response.FetchVitalScoresDataList;
      } else {
      }
    },
      (err) => {

      })
  }
  fetchPainScoreMaster() {
    this.appconfig.fetchPainScoreMasters().subscribe(response => {
      this.painScore = response.SmartDataList;
      this.painScore.forEach((element: any, index: any) => {
        if (element.id == 1) { element.imgsrc = "assets/images/image1.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center"; }
        else if (element.id == 2) { element.imgsrc = "assets/images/image2.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center"; }
        else if (element.id == 3) { element.imgsrc = "assets/images/image3.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center"; }
        else if (element.id == 4) { element.imgsrc = "assets/images/image4.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center"; }
        else if (element.id == 5) { element.imgsrc = "assets/images/image5.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center"; }
        else if (element.id == 6) { element.imgsrc = "assets/images/image6.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center"; }

      });
      this.painScore.forEach((element: any, index: any) => {
        if (element.id == this.selectedPainScoreId)
          element.Class = "pain_reaction position-relative cursor-pointer active text-center";
        this.painScoreSelected = true;         
      });
    })
  }
  painScoreClick(ps: any) {
    this.isDirty = true;    
    ps.Class = "pain_reaction position-relative cursor-pointer active text-center";
    this.selectedPainScoreId = ps.id;
    this.painScore.forEach((element: any, index: any) => {
      if (element.id != ps.id)
        element.Class = "pain_reaction position-relative cursor-pointer text-center";
      this.painScoreSelected = true; 
    });
  }

  showPatientInfo(pinfo: any) {
    $("#quick_info").modal('show');
    this.selectedPatientSSN = pinfo.SSN;
    this.selectedPatientName = pinfo.PatientName;
    this.selectedPatientGender = pinfo.Age_Gender.split('|')[0];
    this.selectedPatientAge = pinfo.Age_Gender.split('|')[1];
    this.selectedPatientMobile = pinfo.MobileNo;
    this.selectedPatientHeight = pinfo.Height;
    this.selectedPatientWeight = pinfo.Weight;
    this.selectedPatientWeightCreatedate = pinfo.WeightCreateDate;
    this.selectedPatientBloodGrp = pinfo.BloodGroup;
    this.selectedPatientVTScore = pinfo.VTScore;
    this.selectedPatientIsVip = pinfo.ISVIP == "NonVIP" ? false : true;
    if (pinfo.IsPregnancy) {
      this.selectedPatientIsPregnancy = true;
      this.selectedPatientPregnancyTrisemister = pinfo.PregnancyContent;
    }
    else {
      this.selectedPatientIsPregnancy = false;
      this.selectedPatientPregnancyTrisemister = "";
    }
    this.appconfig.FetchPatientFileInfo(pinfo.EpisodeID, pinfo.AdmissionID, this.hospitalID, pinfo.PatientID, pinfo.RegCode).subscribe((response: any) => {
      if (response.objPatientMedicationsList.length > 0) {
        this.selectedPatientMedications = response.objPatientMedicationsList;
      }
      else {
        this.selectedPatientMedications = [];
      }
      if (response.objPatientVitalsList.length > 0) {
        this.selectedPatientVitalsDate = response.objPatientVitalsList[0].CreateDate;
        this.selectedPatientBPSystolic = response.objPatientVitalsList[0].Value;
        this.selectedPatientBPDiastolic = response.objPatientVitalsList[1].Value;
        this.selectedPatientTemperature = response.objPatientVitalsList[2].Value;
        this.selectedPatientPulse = response.objPatientVitalsList[3].Value;
        this.selectedPatientSPO2 = response.objPatientVitalsList[4].Value;
        this.selectedPatientRespiration = response.objPatientVitalsList[5].Value;
        if (response.objPatientVitalsList.length > 6 && response.objPatientVitalsList[6].Value != undefined)
          this.selectedPatientConsciousness = response.objPatientVitalsList[6].Value;
        else
          this.selectedPatientConsciousness = "";
        if (response.objPatientVitalsList.length > 7 && response.objPatientVitalsList[7].Value != undefined)
          this.selectedPatientO2FlowRate = response.objPatientVitalsList[7].Value;
        else
          this.selectedPatientO2FlowRate = "";
      }
      else {
        this.selectedPatientVitalsDate = "";
        this.selectedPatientBPSystolic = "";
        this.selectedPatientBPDiastolic = "";
        this.selectedPatientTemperature = "";
        this.selectedPatientPulse = "";
        this.selectedPatientSPO2 = "";
        this.selectedPatientRespiration = "";
      }
      if (response.objPatientAllergyList.length > 0) {
        this.selectedPatientAllergies = response.objPatientAllergyList;
      }
      else {
        this.selectedPatientAllergies = [];
      }
      if (response.objobjPatientClinicalInfoList.length > 0) {
        this.selectedPatientClinicalInfo = response.objobjPatientClinicalInfoList[0].ClinicalCondtion;
        //this.selectedPatientVTScore=response.objobjPatientClinicalInfoList[0].VTScore;
      }
      else {
        this.selectedPatientClinicalInfo = ""
        //this.selectedPatientVTScore="";
      }
    })
  }
  clearSelectedPatientData() {
    // this.selectedPatientSSN="";
    // this.selectedPatientName="";
    // this.selectedPatientGender="";
    // this.selectedPatientAge="";
    // this.selectedPatientMobile="";
    // this.selectedPatientHeight="";
    // this.selectedPatientWeight="";
    // this.selectedPatientBloodGrp="";
    // this.selectedPatientIsPregnancy = false;
    // this.selectedPatientPregnancyTrisemister = "";

    // this.selectedPatientMedications = [];
    // this.selectedPatientAllergies = [];
    // this.selectedPatientBPSystolic="";
    // this.selectedPatientBPDiastolic= "";
    // this.selectedPatientTemperature=""
    // this.selectedPatientPulse="";
    // this.selectedPatientSPO2="";
    // this.selectedPatientRespiration="";
    // this.selectedPatientConsciousness="";
    // this.selectedPatientO2FlowRate="";
    // this.selectedPatientAllergies="";
    // this.selectedPatientClinicalInfo = "";
    // this.selectedPatientVTScore="";

  }

  FetchVitalHypertensionParameters() {
    this.appconfig.fetchVitalHypertensionParameters(this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitalHypertensionParameters = response.FetchHypertensionParametersOutputLists;
      } else {
      }
    },
      (err) => {

      })
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
      this.isSubmitted = false;
      $('#vitalsComments').modal('hide');
    }
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
  }

  validateWeight() {
    var weight = $("#vitalWeight").val();
    if ((this.IsAdult && (weight.length < 2 || Number(weight) > 300))) {
      this.errorMessages = "Enter weight between 10-300 Kg(s)";
      $("#errorMsg").modal('show');
      $("#vitalWeight").val('');
    }

    if ((!this.IsAdult && weight.length > 2)) {
      this.errorMessages = "Enter valid Weight";
      $("#errorMessageModal").modal('show');
      $("#vitalWeight").val('');
    }
  }

  validateHeight() {
    var height = $("#vitalHeight").val();
    var prevHeight = this.emrPatientDetails.Height;
    if(prevHeight != "" && prevHeight != undefined) {
      if (Number(height) < Number(prevHeight)) {
        this.errorMessages = "Height cannot be less than previous height entered";
        $("#errorMessageModal").modal('show');
        $("#vitalHeight").val(this.emrPatientDetails.Height);
      }
    }

    if ((this.IsAdult && (Number(height) < 50 || Number(height) > 250)) || (!this.IsAdult && Number(height) > 50)) {
      this.errorMessages = "Enter Height between 50-250 cm(s)";
      $("#errorMessageModal").modal('show');
      $("#vitalHeight").val('');
    }

    if ((!this.IsAdult && Number(height) > 50)) {
      this.errorMessages = "Enter valid Height";
      $("#errorMessageModal").modal('show');
      $("#vitalHeight").val('');
    }
  }

  calcCtasScore(score: string, ctasDesc: string) {
    this.ctasScore = score;
    this.ctasScoreDesc = ctasDesc;
    if (score == "1") {
      this.ctasScore1Class = "cursor-pointer circle d-flex align-items-center justify-content-center active red";
      this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "2") {
      this.ctasScore2Class = "cursor-pointer circle d-flex align-items-center justify-content-center active red";
      this.ctasScore1Class = this.ctasScore3Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "3") {
      this.ctasScore3Class = "cursor-pointer circle d-flex align-items-center justify-content-center active";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore4Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "4") {
      this.ctasScore4Class = "cursor-pointer circle d-flex align-items-center justify-content-center active";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore5Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
    else if (score == "5") {
      this.ctasScore5Class = "cursor-pointer circle d-flex align-items-center justify-content-center active";
      this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class =
        "cursor-pointer circle d-flex align-items-center justify-content-center";
    }
  }


  saveTriageVitals(remarksSelectedIndex: number) {
    if ($("#vitalWeight").val() != '' && $("#vitalHeight").val() != '') {
      var hwPayload = {

        "AdmissionID": this.emrPatientDetails.AdmissionID,
        "PatientID": this.emrPatientDetails.PatientID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "VTOrderID": this.emrPatientDetails.VTOrderID === null ? '0' : this.emrPatientDetails.VTOrderID,
        "Weight": $("#vitalWeight").val(),
        "Height": $("#vitalHeight").val(),
        "CTASScore": this.ctasScore === null ? '0' : this.ctasScore,
        "HospitalID": this.hospitalID,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": "3606",
        "NursePainScoreID": this.selectedPainScoreId,
      }
      this.config.SavePatientBodyMassHeightWeight(hwPayload).subscribe(response => {
        if (response.Code == 200) {
          this.saveVitals(remarksSelectedIndex);
        }
      })
    }
    else {
      this.errorMessages = "Please enter Height & Weight";
      $("#errorMessageModal").modal('show');
    }
  }
  saveVitals(remarksSelectedIndex: number) {
    let find = this.tableVitals.filter((x: any) => x?.PARAMVALUE === null);
    let bpsys = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP -Systolic");
    let bpdia = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP-Diastolic");
    let temp = this.tableVitals.filter((x: any) => x?.PARAMETER === "Temperature");
    let remarksEntered = true;
    if (bpsys[0].PARAMVALUE === null || bpsys[0].PARAMVALUE === "" || bpdia[0].PARAMVALUE === null || bpdia[0].PARAMVALUE === "" || temp[0].PARAMVALUE === null || temp[0].PARAMVALUE === "") {
      this.showVitalsValidation = true;
    } else {
      let VsDetails: any = [];
      let outOfRangeParameters: string[] = [];
      this.tableVitals.forEach((element: any, index: any) => {

        let RST: any;
        let ISPANIC: any;
        if ((element.PARAMVALUE >= element.ALLOWUOMMINRANGE && element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE && element.PARAMVALUE <= element.ALLOWUOMMAXRANGE))
          RST = 2;
        else
          RST = 1;

        if ((!element.PARAMVALUE) && ((element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE)))
          ISPANIC = 1;
        else
          ISPANIC = 0;
        const remark = this.recordRemarks.get(index);
        if (element.PARAMVALUE !== null && element.VitalHigh || element.VitalLow) {
          outOfRangeParameters.push(element.PARAMETER);
          if (remark === undefined || remark.trim() === "") {
            this.parameterErrorMessage = `Please enter Remarks for ${element.PARAMETER}`;
            remarksEntered = false;
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
      });
      if (outOfRangeParameters.length > 0 && !remarksEntered) {
        this.showParamValidationMessage = true;
        this.showVitalsValidation = false;
        return;
      }
      let payload = {
        "MonitorId": "0",
        "PatientID": this.emrPatientDetails.PatientID,
        "Admissionid": this.emrPatientDetails.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "HospitalId": this.hospitalID,
        "SpecialiseID": this.emrPatientDetails.SpecialiseID,
        "PatientType": "3",
        "ScheduleID": "0",
        "VSDetails": VsDetails,
        "UserId": this.doctorDetails[0].UserId,
        "WorkStationID": "3606"
      };

      this.appconfig.SaveClinicalVitals(payload).subscribe(response => {
        if (response.Code == 200) {
          $("#bedAllocationYesNo").modal('show');
          this.showVitalsValidation = false;
          this.emrPatientDetails.BP = bpsys[0].PARAMVALUE + '/' + bpdia[0].PARAMVALUE;
          this.emrPatientDetails.Temperature = temp[0].PARAMVALUE;
          outOfRangeParameters.forEach(parameter => {
            const index = this.tableVitals.findIndex((element: any) => element.PARAMETER === parameter);
            this.recordRemarks.delete(index);
          });
        }
      })
      this.showParamValidationMessage = false;

      // SaveClinicalVitals
    }
  }

  clearTriageVitals() {
    $("#vitalWeight").val('');
    $("#vitalHeight").val('');
    this.ctasScore = "";
    this.ctasScoreDesc = "";
    this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class =
      this.ctasScore5Class = "cursor-pointer circle d-flex align-items-center justify-content-center";

    this.tableVitals.forEach((item: any) => {
      item.PARAMVALUE = '';
      item.VitalLow = '';
      item.VitalHigh = '';
      item.Score = '';
      this.totalScore = 0;
    });
    this.hypertension = "";
    this.selectedPainScoreId=0;
    this.painScore.forEach((element: any, index: any) => {
      element.Class = "pain_reaction position-relative cursor-pointer text-center";
    });

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
          if(parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " +element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.BPsys_value = "Abnormal";
          this.isBPsys = true; this.bpmsg = true;
          this.tableVitals[index].VitalHigh = true;
          this.tableVitals[index].VitalLow = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if(parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
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
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else {

        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0) {
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
          element.Color = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].Color;
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
          if(parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " +element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }          
          this.BPdia_value = "Abnormal";
          this.isBPdia = true; this.bpmsg = true;
          this.tableVitals[index].VitalHigh = true;
          this.tableVitals[index].VitalLow = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if(parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
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
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else {
          this.BPdia_value = "";
          this.isBPdia = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (current_parameter == "Temparature") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if(parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " +element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isTemperature = true; this.bpmsg = true; this.temparaturepmsg = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if(parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
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
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else {
          this.Temp_value = "";
          this.isTemperature = false; this.temparaturepmsg = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        } var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }

      else if (current_parameter == "Pulse") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if(parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " +element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isPulse = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if(parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
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
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else {
          this.Temp_value = "";
          this.isPulse = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }

      else if (current_parameter == "SPO2") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if(parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " +element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isSPO2 = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if(parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
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
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else {
          this.Temp_value = "";
          this.isSPO2 = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (current_parameter == "Respiration") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if(parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " +element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isRespiration = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if(parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
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
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else {
          this.Temp_value = "";
          this.isRespiration = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (current_parameter == "O2 Flow Rate") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if(parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessages = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " +element.ALLOWUOMMAXRANGE;
            $('#errorMessage').modal('show');
            return;
          }
          this.Temp_value = "Abnormal";
          this.isO2FlowRate = true;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if(parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
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
          if (remark === undefined || remark.trim() === "") {
            this.openRemarks(index);  
          }
        }
        else {
          this.Temp_value = "";
          this.isO2FlowRate = false;
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      this.totalScore = this.tableVitals.map((item: any) => (item.PARAMVALUE != null && item.Score != "" && item.Score != "METCALL") ? Number.parseInt(item.Score) : 0).reduce((acc: any, curr: any) => acc + curr, 0);

      // if((this.tableVitals[0].PARAMVALUE != null && this.tableVitals[0].PARAMVALUE != "")|| (this.tableVitals[1].PARAMVALUE != null && this.tableVitals[1].PARAMVALUE != "")) {
      //   this.getVitalsHypertensionParameter(parseFloat(this.tableVitals[0].PARAMVALUE), parseFloat(this.tableVitals[1].PARAMVALUE));
      // } 
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
  navigateToTriageWorklist() {
    this.router.navigate(['/emergency/worklist']);
  }

  selectemrBed(bed: any) {
    if (bed.BedStatus == '3') {
      this.SelectedBedInfo = '';
      bed.bedClass = "room_card primary";
    } else if (bed.BedStatus == '4'||bed.BedStatus == '8'||bed.BedStatus == '6') {
      this.SelectedBedInfo = '';
      bed.bedClass = "room_card warning";
    }
    else {
      //this.SelectedBedInfo=bed;
      this.emrBedsDataList.forEach((element: any, index: any) => {
        if (element.BedID == bed.BedID) {
          if (element.BedStatus == "1") {
            if (element.bedClass == "room_card warning") {
              element.bedClass = "room_card warning active";
              this.SelectedBedInfo = bed;
              this.showBedValidation = false;
            }
            else {
              element.bedClass = "room_card warning";
              this.SelectedBedInfo = '';
            }
          }
          else if (element.BedStatus == "3") {
            if (element.bedClass == "room_card primary") {
              element.bedClass = "room_card primary active";
              this.SelectedBedInfo = bed;
              this.showBedValidation = false;
            }
            else {
              element.bedClass = "room_card primary";
              this.SelectedBedInfo = '';
            }
          }
          else if (element.BedStatus == "4"||element.BedStatus == "8"||element.BedStatus == "6") {
            if (element.bedClass == "room_card warning") {
              element.bedClass = "room_card warning active";
              this.SelectedBedInfo = bed;
              this.showBedValidation = false;
            }
            else {
              element.bedClass = "room_card warning";
              this.SelectedBedInfo = '';
            }
          }
        }
        else {
          if (element.BedStatus == "1")
            element.bedClass = "room_card warning";
          else if (element.BedStatus == "3")
            element.bedClass = "room_card primary";
          else if (element.BedStatus == "4"||element.BedStatus == "8"||element.BedStatus == "6")
            element.bedClass = "room_card warning";
        }
      });
    }

  }
  saveBedAssign() {
    if (this.SelectedBedInfo != '' && this.SelectedBedInfo != undefined) {
      var payload = {
        "AdmissionID": this.emrPatientDetails.AdmissionID,
        "PatientID": this.emrPatientDetails.PatientID,
        "BedID": this.SelectedBedInfo.BedID,
        "BillBedTypID": this.SelectedBedInfo.BedTypeID,
        "ReqBedTypID": this.SelectedBedInfo.BedTypeID,
        "AllocBedTypID": this.SelectedBedInfo.BedTypeID,
        "HospitalID": this.hospitalID,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": "3403"
      }
      this.config.SaveEMRBedAllocations(payload).subscribe(response => {
        if (response.Code == 200) {
          this.bedNo = this.SelectedBedInfo.Bed;
          $("#emergencyward").modal('hide');
          $("#saveConsultanceMsg").modal('show');
        }
      })
    }
    else {
      this.showBedValidation = true;
    }
  }

  openBedAllocationPopup() {
    this.selectall=false;
    if (this.emrPatientDetails.BedID == "") {
      this.FetchEMRBeds(1);

      // if(this.emrPatientDetails.BedID == "") {
      //   this.emrBedsDataList.forEach((element:any, index:any) => {
      //       if(element.BedStatus == "1")
      //         element.bedClass = "room_card primary";   
      //         if(element.BedStatus == "3")
      //         element.bedClass = "room_card warning";     
      //         else if(element.BedStatus == "4")
      //         element.bedClass = "room_card primary";        
      //   });
      $("#emergencyward").modal('show');
    }
  }
  ShowAllBeds(type: any, item: any) {
    this.selectall = !this.selectall;
    var status = this.selectall == false ? 1 : 2;
    this.FetchEMRBeds(status);
  }
}
