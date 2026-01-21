import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { LabResultentryService } from './lab-resultentry.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { combineLatest, map, Observable, Subscriber } from 'rxjs';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { Guid } from 'guid-typescript';
import { CorrectedFormComponent } from 'src/app/templates/corrected-form/corrected-form.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { DomSanitizer } from '@angular/platform-browser';
import { PrintService } from 'src/app/shared/print.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TranslationService } from 'src/app/shared/translation/translation.service';

declare var $: any;

@Component({
  selector: 'app-lab-resultentry',
  templateUrl: './lab-resultentry.component.html',
  styleUrls: ['./lab-resultentry.component.scss'],
  providers: [DatePipe]
})
export class LabResultentryComponent extends BaseComponent implements OnInit {
  config: AngularEditorConfig = {
    sanitize: false,
    width: '1000px',
    editable: true
  };
  @Input() data: any;
  readonly = false;
  selectedPatientData: any;
  selectedPatientLabData: any;
  currentDate: any;
  FetchLabTestComponentsList: any = [];
  FetchLabTestParameterData: any = [];
  FetchLabTestParameterDataAnti: any = [];
  resultRemarks: any;
  labDoctors: any
  patientDiagnosis: any;
  patientDiagnosisName: any
  isVerify: boolean = false;
  verifyMsg: string = "";
  isPanic: boolean = false;
  isAbnormal: boolean = false;
  ISPANICFORM: boolean = false;
  showTemplateDiagnosisDoctordiv: boolean = false;
  htmlContentForPreviousResult: any;
  showAllergydiv: boolean = false;
  pinfo: any;
  patinfo: any;
  selectedDoctors: any;
  errorMessages: any[] = [];
  selectedInformedToEmpDetails: any[] = [];
  informedToList: any;
  readBackDate: string = "";
  IsReadBack: boolean = false;
  successMessage: string = "";
  sowPanicFormSave: boolean = true;
  savedPatientPanicResultReportingDetails: any = [];
  selectedInformedByEmpDetails: any[] = [];
  showHtmlEditor: boolean = false;
  showSaveAddendum: boolean = false;
  testData: any = [];
  saveMsg = "Lab-Result Entry Saved Successfully";
  continueWithPanicAbnormal = false;
  panicabnormalresults: any = [];
  selectedUploadCompDetails: any;
  fromWards = false;
  isPreliminary = false;
  htmlContent: any;
  labTestResults: any;
  fileError: string = "";
  myPhoto!: string;
  selectedFile = "";
  testOrderID = "";
  testOrderItemID = "";
  SampleNo = "";
  testID = "";
  genderID = "";
  SampleCollectedAt = "";
  Age = "";
  dob = "";
  patientType = "";
  ipid = "";
  patientid = "";
  @ViewChild('divreadonly') divreadonly!: ElementRef;
  //@Output() dataChanged = new EventEmitter<boolean>();
  sensitvitySourceSourceId: any;
  cultureSources: any;
  organisms: any;
  OrganismSearchText = '';
  selectedOrganisms: any = [];
  FetchMicroAntiBioticsDataList: any = [];
  sensitivityData: any;
  facility: any;
  BloodGroup = '';
  BloodGroupID = '';
  Antibiodies = '';
  AntibiodiesID = '';
  DINNumber = '';
  DCT = '';
  suspectibilityCollection: any = [{
    value: '1',
    name: 'Resistant'
  },
  {
    value: '2',
    name: 'Intermediate Sensitive'
  },
  {
    value: '3',
    name: 'Sensitive'
  }
  ];
  fromLabResultRelease: boolean = false;
  fromTestComponentWord: boolean = false;
  labReportPdfDetails: any;
  trustedUrl: any;
  cardiologyContentHTML: any = '';
  @ViewChild('divprint') divprint!: ElementRef;
  location: any;
  isRemarksVisible: boolean = false;
  bloodGroupChangeMessage: string = '';
  LabTestResultJsonValue: any;
  selectedAIType = "infographic";
  arabicText = "";

  editorConfigArabic: AngularEditorConfig = {
    editable: true,

    enableToolbar: false,   // ⬅️ disables the toolbar
    showToolbar: false,
    sanitize: false,
    defaultFontName: 'DroidKufi-Regular',
    fonts: [
      { class: 'droid-kufi', name: 'DroidKufi-Regular' },
      { class: 'poppins', name: 'Poppins' }
    ],
    customClasses: [
      {
        name: 'arabic-text',
        class: 'droid-kufi',
        tag: 'div'
      }
    ]
  };

  arabicTextL: boolean = false;

  constructor(private us: UtilityService, private sanitizer: DomSanitizer, private service: LabResultentryService,
    public datepipe: DatePipe, private router: Router, private modalSvc: NgbModal, private modalService: GenericModalBuilder, private printService: PrintService, private translationService: TranslationService) {
    super();
  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.fromWards = sessionStorage.getItem("FromBedBoard") === 'true' ? true : false;
    this.fromLabResultRelease = sessionStorage.getItem("fromLabResultRelease") === 'true' ? true : false;
    this.fromTestComponentWord = sessionStorage.getItem("fromTestComponentWord") === 'true' ? true : false;
    this.currentDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy HH:mm")?.toString();
    this.location = sessionStorage.getItem("locationName");
    this.selectedPatientData = JSON.parse(sessionStorage.getItem("selectedPatientData") || '{}');
    this.selectedPatientLabData = JSON.parse(sessionStorage.getItem("selectedPatientLabData") || '{}');
    // if (this.fromWards) {
    //   this.selectedPatientData = this.selectedPatientLabData;
    //   this.testOrderID = this.selectedPatientLabData.TestOrderID;
    //   this.testOrderItemID = this.selectedPatientLabData.TestOrderItemID;
    //   this.testID = this.selectedPatientLabData.TestID;
    //   this.genderID = this.selectedPatientLabData.Gender === 'Male' ? '1' : '2';
    //   this.Age = this.selectedPatientLabData.Age;
    //   this.dob = this.selectedPatientLabData.DOB;
    //   this.SampleCollectedAt = this.selectedPatientLabData.SampleCollectedAt;
    //   this.patientType = this.selectedPatientLabData.PatientType;
    //   this.ipid = this.selectedPatientLabData.IPID;
    // }
    // else {
    if (this.data) {
      this.readonly = this.data.readonly;
      this.patientid = this.data.data.PatientID;
      this.testOrderID = this.data.data.TestOrderID || this.data.data.TestOrderid;
      this.testOrderItemID = this.data.data.TestOrderItemId || this.data.data.TestOrderItemID;
      this.testID = this.data.data.TestID;
      this.genderID = this.data.data.Gender === 'Male' ? '1' : '2';
      this.Age = this.data.data.Age;
      this.dob = this.data.data.DOB;
      this.SampleCollectedAt = this.data.data.SampleCollectedAt;
      this.patientType = this.data.data.PatientType;
      this.ipid = this.data.data.IPID;
      this.SampleNo = this.data.data.SampleNumber;
      //this.us.disabledElement(this.divreadonly.nativeElement);
      this.fetchTestData();
    }
    else {
      this.patientid = this.selectedPatientData.PatientID;
      this.testOrderID = this.selectedPatientLabData.TestOrderID;
      this.testOrderItemID = this.selectedPatientLabData.TestOrderItemID;
      this.SampleNo = this.selectedPatientLabData.SampleNumber;
      this.testID = this.selectedPatientLabData.TestID;
      this.genderID = this.selectedPatientData.GenderId;
      this.Age = this.selectedPatientData.Age;
      this.dob = this.selectedPatientData.DOB;
      this.SampleCollectedAt = this.selectedPatientLabData.SampleCollectedAt;
      this.patientType = this.selectedPatientData.PatientType;
      this.ipid = this.selectedPatientData.IPID;
      this.fetchPrevTestData();
    }
    //}

    this.FetchAdviceDiagnosis();
    if (this.selectedPatientLabData.PanaceaBloodOrder != '')
      this.fetchPanaceaResults(this.selectedPatientLabData);

    // this.fetchLabDoctors();
  }
  fetchPanaceaResults(item: any) {

    const url = this.us.getApiUrl(labresultentry.FetchBloodPanaceaResults, {
      BloodOrderID: item.PrescriptionID ?? '0',
      PanaceaOrderID: item.PanaceaBloodOrder ?? '0',
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        if (response.FetchBloodPanaceaResultsDataList.length > 0) {
          this.DCT = response.FetchBloodPanaceaResultsDataList[0].Interpretation;
        }
        if (response.FetchBloodPanaceaResultsFinalDataList.length > 0) {
          this.BloodGroup = response.FetchBloodPanaceaResultsFinalDataList[0].BloodGroup;
          this.BloodGroupID = response.FetchBloodPanaceaResultsFinalDataList[0].BloodGroupID;

          this.Antibiodies = response.FetchBloodPanaceaResultsFinalDataList[0].Antibiodies;
          this.AntibiodiesID = response.FetchBloodPanaceaResultsFinalDataList[0].AntibiodiesID;




          this.DINNumber = response.FetchBloodPanaceaResultsFinalDataList[0].DINNumber;
          var BloodGroupID = this.FetchLabTestParameterData.filter((x: any) => x?.PanaceBloodGroup === this.BloodGroup.toUpperCase());
          var AntibiodiesIDD = this.FetchLabTestParameterDataAnti.filter((x: any) => x?.Name === this.Antibiodies.toUpperCase());

          if (BloodGroupID.length > 0) {
            this.FetchLabTestComponentsList.forEach((element: any, index: any) => {
              if ((element.ControlType === 'Single Selection' && element.TextValue == '') && (element.TestCompID == '3810' || element.TestCompID == '6132' || element.TestCompID == '3944')) {
                element.TextValue = BloodGroupID[0].Name + '#' + BloodGroupID[0].ID;
              }
              if (element.ControlType === 'Normal TextBox' && element.TextValue == '' && (element.TestCompID == '6165')) {
                element.TextValue = "Compatible with :" + this.DINNumber;
              }

            });
          }
          if (AntibiodiesIDD.length > 0) {
            this.FetchLabTestComponentsList.forEach((element: any, index: any) => {
              if ((element.ControlType === 'Single Selection' && element.TextValue == '') && (element.TestCompID == '6133' || element.TestCompID == '5366')) {
                element.TextValue = AntibiodiesIDD[0].Name + '#' + AntibiodiesIDD[0].ID;
              }
            });
          }
          if (this.DCT.length > 0) {
            this.FetchLabTestComponentsList.forEach((element: any, index: any) => {

              if (element.ControlType === 'Normal TextBox' && element.TextValue == '' && (element.TestCompID == '6155')) {
                element.TextValue = this.DCT;
              }

            });
          }


        } else {
          this.BloodGroup = ""; this.BloodGroupID = ""; this.DINNumber = ""; this.DCT = "";
        }
      }
    });
  }

  fetchTestData() {
    const url = this.service.getData(labresultentry.FetchLabTestComponents, {
      PatientID: this.patientid,
      GenderID: this.genderID,
      DOB: moment(this.dob).format('DD-MMM-YYYY'),
      SampleCollectedAtDt: this.SampleCollectedAt,
      TestID: this.testID,
      TestOrderID: this.testOrderID,
      TestOrderItemID: this.testOrderItemID,
      PatientType: this.patientType,
      UserId: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID,
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.testData = response;
          this.FetchLabTestComponentsList = response.FetchLabTestComponentsListM;

          this.FetchLabTestComponentsList.forEach((element: any, index: any) => {
            element.ISModifiedValue = "0";
            element.Color = "white";
            element.panic = false;
            element.abnormal = false;
            if (element.ControlType === 'Rich TextBox') {
              this.htmlContent = element.DefaultValue;
            }
            if (element.ControlType === 'Numeric TextBox') {
              if (element.TextValue != "") {
                this.onNumericTextboxChange(null, element);
              }
            }
            if (element.ControlType === 'Grid' && element.TextValue) {
              this.parseSensitivityData(element.TextValue);
            }
            if (element.ControlType === 'Dynamic Image' && element.TextValue == '') {
              if (this.selectedUploadCompDetails != undefined)
                element.TextValue = this.selectedUploadCompDetails.TextValue;
            }
            if (response.FetchLabTestPrevResultDataM.length > 0 && element.ControlType !== 'Grid') {
              const prevres = response.FetchLabTestPrevResultDataM.find((x: any) => x.TestCompID === element.TestCompID);
              if (prevres) {
                element.PrevResult = prevres.PreviousResult;
                //element.PrevResDate = moment(new Date(prevres.PrevDate)).format('DD-MMM-YYYY HH:mm');
                element.PrevResDate = prevres.PrevDate != '' ? moment(new Date(prevres.PrevDate)).format('DD-MMM-YYYY HH:mm') : '';
              }
            }
          });
          if (response.FetchLabTestResultsListM.length > 0) {
            this.labTestResults = response.FetchLabTestResultsListM[0];
            if (Number(this.labTestResults.STATUS) === 7) {
              this.isVerify = false;
            }
            if (Number(this.labTestResults.STATUS) === 8) {
              this.isVerify = true;
            }
            this.resultRemarks = this.labTestResults.Remarks;
            // if (this.labTestResults.ResultVerifyedAt != "") {
            //   this.isVerify = true;
            // }
            if (this.labTestResults.IsPreliminary === 'True')
              this.isPreliminary = true;
            else
              this.isPreliminary = false;

            if (this.labTestResults.IsPanic === 'True')
              this.isPanic = true;
            else
              this.isPanic = false;

            if (this.labTestResults.IsAbnormal === 'True')
              this.isAbnormal = true;
            else
              this.isAbnormal = false;
          }
          else {
            this.labTestResults = [];
            this.isVerify = false;
            this.isPreliminary = false;
          }
          this.fetchLabDoctors(response.FetchLabTestDocResultsListM);
          this.fetchPrevTestData();
        }
      },
        (err) => {

        })
  }
  fetchPrevTestData() {
    this.arabicTextL = false;
    this.arabicText = '';
    const url = this.service.getData(labresultentry.FetchPrevLabTestComponents, {
      PatientID: this.patientid,
      GenderID: this.genderID,
      DOB: moment(this.dob).format('DD-MMM-YYYY'),
      SampleCollectedAtDt: this.SampleCollectedAt,
      TestID: this.testID,
      TestOrderID: this.testOrderID,
      TestOrderItemID: this.testOrderItemID,
      PatientType: this.patientType,
      UserId: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID,
      SampleNo: this.SampleNo
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.testData = response;
          this.FetchLabTestComponentsList = response.FetchLabTestComponentsListM;
          this.FetchLabTestParameterData = response.FetchLabTestParameterDataM.filter((x: any) => (x?.ParameterID === '1550' || x?.ParameterID === '1553'));
          this.FetchLabTestParameterDataAnti = response.FetchLabTestParameterDataM.filter((x: any) => x?.ParameterID === '305');

          if (response.FetchLabTestComponentsListM[0]?.AIGeneratedArabicResult) {
            this.arabicText = response.FetchLabTestComponentsListM[0].AIGeneratedArabicResult;
            this.arabicTextL = true;
          }

          this.FetchLabTestComponentsList.forEach((element: any, index: any) => {
            element.ISModifiedValue = "0";
            element.Color = "white";
            element.panic = false;
            element.abnormal = false;
            if (element.ControlType === 'Rich TextBox') {
              if (element.TextValue === '') {
                this.htmlContent = element.DefaultValue;
              }
              else {
                this.htmlContent = element.TextValue;
              }
              //this.htmlContent = element.TextValue;
            }
            if (element.ControlType === 'Numeric TextBox') {
              if (element.TextValue != "") {
                this.onNumericTextboxChange(null, element);
              }
            }
            if (element.ControlType === 'Dynamic Image' && element.TextValue == '') {
              if (this.selectedUploadCompDetails != undefined)
                element.TextValue = this.selectedUploadCompDetails.TextValue;
            }
            if (element.ControlType === 'Grid' && element.TextValue) {
              this.parseSensitivityData(element.TextValue);
            }
            if (response.FetchLabTestPrevResultDataM.length > 0 && element.ControlType !== 'Grid') {
              const prevres = response.FetchLabTestPrevResultDataM.find((x: any) => x.TestCompID === element.TestCompID);
              if (prevres) {
                element.PrevResult = prevres.PreviousResult;
                //element.PrevResDate = moment(new Date(prevres.PrevDate)).format('DD-MMM-YYYY HH:mm');
                element.PrevResDate = prevres.PrevDate != '' ? moment(new Date(prevres.PrevDate)).format('DD-MMM-YYYY HH:mm') : '';
                if (element.ControlType == 'Single Selection') {
                  if (prevres.PreviousResult.split('#').length > 0) {
                    element.PrevResult = prevres.PreviousResult.split('#')[0];
                  }
                }
              }
            }
            if (element.Keyword != '') {
              element.Keyword1 = element.Keyword.replace(/\n/g, '<br />');
            }
          });
          if (response.FetchLabTestResultsListM.length > 0) {
            this.labTestResults = response.FetchLabTestResultsListM[0];
            if (Number(this.labTestResults.STATUS) === 7) {
              this.isVerify = false;
            }
            if (Number(this.labTestResults.STATUS) === 8) {
              if (this.labTestResults.ResultVerifyedAt != "") {
                this.isVerify = true;
              }
              //this.isVerify = true;
            }


            // if (Number(this.labTestResults.STATTUS) === 7) {

            // }
            this.resultRemarks = this.labTestResults.Remarks;
            // if (this.labTestResults.ResultVerifyedAt != "") {
            //   this.isVerify = true;
            // }
            if (this.labTestResults.IsPreliminary === 'True')
              this.isPreliminary = true;
            else
              this.isPreliminary = false;

            if (this.labTestResults.IsPanic === 'True')
              this.isPanic = true;
            else
              this.isPanic = false;

            if (this.labTestResults.IsAbnormal === 'True')
              this.isAbnormal = true;
            else
              this.isAbnormal = false;


          }
          else {
            this.labTestResults = [];
            this.isVerify = false;
            this.isPreliminary = false;
          }


          if (response.FetchLabTestResultJsonDataList.length > 0) {
            this.LabTestResultJsonValue = response.FetchLabTestResultJsonDataList[0].LabTestResultJsonValue;
          }

          // response.FetchLabTestDocResultsListM.forEach((element:any, index:any) => {
          //   var finddoc = this.labDoctors.find((x:any) => x.DOCID === element.DOCID);
          //   finddoc.docSelected = true;
          // });
          this.fetchLabDoctors(response.FetchLabTestDocResultsListM);
        }
      },
        (err) => {

        })
  }

  getControl(type: string) {
    let returnValue = '';
    switch (type) {
      case 'Numeric TextBox':
        returnValue = '<input></input>';
        break;
      case 'Large TextBox':
        returnValue = '<textarea></textarea>';
        break;
    }
    return returnValue;
  }

  filterParameterData(item: any) {
    return this.testData.FetchLabTestParameterDataM.filter((x: any) => x.ParameterID === item.ParameterID);
  }

  updateSelectedValue(event: any, item: any) {
    item.TextValue = event.target.value;
  }

  onNumericTextboxChange(event: any, item: any) {

    // "PanicMax": "30.00000",--Red
    // "PanicMin": "3.40000",--Red
    // "MaxLimit": "13.50000",--Pink
    // "MinLimit": "4.50000",--Pink
    var txtVal = "";
    if (event != null)
      txtVal = event.target.value;
    else
      txtVal = item.TextValue;

    const minLim = item.MinLimit;
    const maxLim = item.MaxLimit;
    const panicMin = item.PanicMin;
    const panicMax = item.PanicMax;
    if (txtVal != "") {
      if (parseFloat(txtVal) > parseFloat(maxLim) || parseFloat(txtVal) < parseFloat(minLim)) {
        item.Color = "pink";
        item.abnormal = true;
      }
      else {
        item.abnormal = false;
      }
      if (parseFloat(txtVal) > parseFloat(panicMax) || parseFloat(txtVal) < parseFloat(panicMin)) {
        item.Color = "red";
        item.panic = true;
      }
      else {
        item.panic = false;
      }
      if (!item.panic && !item.abnormal) {
        item.Color = "white";
        item.panic = false;
        item.abnormal = false;
      }
    }
    item.TextValue = txtVal;
  }

  onNormalTextboxChange(event: any, item: any) {
    item.TextValue = event.target.value;
  }

  isNumberKey(evt: any) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57))
      return false;

    return true;
  }

  FetchAdviceDiagnosis() {
    const url = this.service.getData(labresultentry.FetchAdviceDiagnosis, {
      Admissionid: this.selectedPatientData.IPID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          this.patientDiagnosis = response.PatientDiagnosisDataList;
          this.patientDiagnosisName = this.patientDiagnosis?.map((item: any) => item.Code + "-" + item.DiseaseName).join(', ');
        }
      },
        (err) => {
        })
  }

  fetchLabDoctors(docs: any) {
    const url = this.service.getData(labresultentry.FetchLabTestDoctors, {
      TestID: this.testID,
      UserID: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.labDoctors = response.FetchLabTestDoctorsListM;
          this.labDoctors.forEach((element: any, index: any) => {
            element.docSelected = element.Checked;
          });
          if (docs.length > 0) {
            docs.forEach((element: any, index: any) => {
              var finddoc = this.labDoctors.find((x: any) => x.DOCID === element.DOCID);
              finddoc.docSelected = true;
            });
          }
          else {
            if (this.FetchLabTestComponentsList[0].DefaultDocID != "") {
              var finddoc = this.labDoctors.find((x: any) => x.DOCID === this.FetchLabTestComponentsList[0].DefaultDocID);
              finddoc.docSelected = true;
            }
            else {
              var finddoc = this.labDoctors.find((x: any) => x.DOCID === this.doctorDetails[0].EmpId);
              finddoc.docSelected = true;
            }
          }
        }
      },
        (err) => {
        })
  }

  selectLabDoctor(doc: any) {
    if (!doc.docSelected) {
      doc.docSelected = true;
    }
    else
      doc.docSelected = false;
    this.selectedDoctors = doc;
  }
  verifyResultEntryConfirmation() {
    if (Number(this.labTestResults?.STATUS) >= 7) {
      if (this.isVerify) {
        this.verifyMsg = "Are you sure you want to Un-Verify Result ?";
      }
      else {
        this.verifyMsg = "Are you sure you want to Verify Result ?";
      }
      $("#verifyResultEntryConfirmation").modal('show');
    }
  }
  selectPanicorAbnormal(type: string) {
    if (type == "panic") {
      if (!this.isPanic) {
        this.isPanic = true;
      }
      else {
        this.isPanic = false;
      }
    }
    else if (type === 'abnormal') {
      if (!this.isAbnormal) {
        this.isAbnormal = true;
      }
      else {
        this.isAbnormal = false;
      }
    }
  }

  showHideTemplateDiagnosisDoctordiv() {
    if (!this.showTemplateDiagnosisDoctordiv) {
      this.showTemplateDiagnosisDoctordiv = true;
    }
    else {
      this.showTemplateDiagnosisDoctordiv = false;
    }
  }
  FetchOutSideReport(Template: any) {
    const url = this.service.getData(labresultentry.DownloadExternalLabReport, {
      FileName: Template,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH;
          this.showModal()
        }
      },
        (err) => {
        })
  }
  showModal(): void {
    $("#caseRecordModal").modal('show');
  }
  showResultsinPopUp: boolean = false;
  navigateToResults() {
    sessionStorage.setItem("navigateFromCasesheet", 'true');
    //this.router.navigate(['/home/otherresults']);
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.selectedPatientData));
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedPatientData));
    this.showResultsinPopUp = true;
    $("#viewResults").modal("show");
  }

  closeViewResultsPopup() {
    sessionStorage.setItem("navigateFromCasesheet", 'false');
    $("#viewResults").modal("hide");
    setTimeout(() => {
      this.showResultsinPopUp = false;
    }, 1000);
  }

  openAllergyPopup() {
    this.showAllergydiv = true;
  }
  showPatientInfo(pinfo: any) {
    pinfo.AdmissionID = pinfo.IPID;
    this.pinfo = pinfo;

    $("#quick_info").modal('show');
  }
  clearPatientInfo() {
    this.pinfo = "";
    this.patinfo = "";
  }
  goBackToLabWorklist() {
    sessionStorage.setItem("selectedPatientData", "");
    sessionStorage.setItem("selectedPatientLabData", "");
    sessionStorage.setItem("fromLabResultRelease", "");
    sessionStorage.removeItem("fromTestComponentWord");
    if (this.fromTestComponentWord) {
      this.router.navigate(['/suit/test-component-word']);
    }
    else if (this.fromLabResultRelease) {
      this.router.navigate(['/suit/LabResultRelease']);
    }
    else if (this.fromWards) {
      this.router.navigate(['/ward/samplecollection']);
    }
    else {
      $('#selectPatientYesNoModal').modal('show');
      //this.router.navigate(['/suit/labworklist']);
    }
  }

  onAccept() {
    const SSN = this.selectedPatientData.SSN;
    $('#selectPatientYesNoModal').modal('hide');
    sessionStorage.setItem('navigateToLabWorklist', SSN + '|' + this.selectedPatientData.filterFromDate + '|' + this.selectedPatientData.filterToDate);
    this.router.navigate(['/suit/labworklist']);
  }

  onDecline() {
    $('#selectPatientYesNoModal').modal('hide');
    this.router.navigate(['/suit/labworklist']);
  }

  onSaveClick() {
    var pnabrs = this.FetchLabTestComponentsList.filter((x: any) => x.panic);
    if (pnabrs.length > 0 && !this.continueWithPanicAbnormal) {
      this.panicabnormalresults = [];
      pnabrs.forEach((element: any, index: any) => {
        this.panicabnormalresults.push({
          "ComponentID": element.ParameterID,
          "RRValue": element.RRValue,
          "Parameter": element.ParameterName,
          "Unit": element.Unitname,
          "TextValue": element.TextValue,
          "PanicMax": element.MaxLimit,
        });
      });
      $("#panicAbnormalConfirmation").modal('show');
      return;
    }
    this.FetchLabTestComponentsList.forEach((element: any) => {
      if (element.ControlType === "Rich TextBox") {
        element.TextValue = this.htmlContent.toString();//.replace(/<td/gm, '<td style="border: 1px solid #000"');
        element.DefaultValue = "";
      }
    });
    var resEntered = this.FetchLabTestComponentsList.filter((x: any) => x.TextValue === '' && x.DefaultValue === '');
    if (resEntered.length === this.FetchLabTestComponentsList.length) {
      this.errorMessages = [];
      this.errorMessages.push("Please enter result to save");
      $("#labresultEntryValidation").modal('show');
      return;
    }
    // if (!this.ISPANICFORM && (this.isPanic || this.isAbnormal)) {
    //   this.openPanicResultReportingForm();
    //   return;
    // }


    var selecteddocs = this.labDoctors.filter((x: any) => x.docSelected);
    if (selecteddocs.length === 0) {
      this.errorMessages = [];
      this.errorMessages.push("Please select doctors");
      $("#labresultEntryValidation").modal('show');
      return;
    }

    const url = this.us.getApiUrl(labresultentry.FetchPatientBloodGroupTestResults, {
      PatientID: this.selectedPatientData.PatientID,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });

    const isBloodGroupEntered = this.FetchLabTestComponentsList.find((el: any) => el.TestCompID === '3810' && el.TestID === '3344' && el.TextValue);

    if (isBloodGroupEntered) {
      this.us.get(url).subscribe((response: any) => {
        if (response.Code === 200) {
          if (response.FetchPatientBloodGroupTestResultsDataList.length > 0) {
            const lastSelectedBloodGroup = response.FetchPatientBloodGroupTestResultsDataList[response.FetchPatientBloodGroupTestResultsDataList.length - 1].Results;
            if (lastSelectedBloodGroup === isBloodGroupEntered.TextValue.split('#')[0]) {
              this.validateNurseUser();
            } else {
              this.bloodGroupChangeMessage = `Previous selected Blood Group is ${lastSelectedBloodGroup}. Do you want to update Blood Group to ${isBloodGroupEntered.TextValue.split('#')[0]}?`
              $('#bloodGroupChangeModal').modal('show');
            }
          } else {
            this.validateNurseUser();
          }
        }
      });
    } else {
      this.validateNurseUser();
    }

  }

  validateNurseUser() {
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        $("#divNursingInstructions").modal('show');
        this.saveResultEntry();
      }
      modalRef.close();
    });
  }

  saveResultEntry() {
    var docs: any[] = [];
    var selecteddocs = this.labDoctors.filter((x: any) => x.docSelected);
    selecteddocs.forEach((element: any, index: any) => {
      docs.push({
        "DOCID": element.DOCID,
        "DOCTORNAME": element.DoctorName,
        "SIGNATURE": "",
        "DESIGNATION": element.Designation,
        "DSEQ": index + 1
      })
    });

    const abnormalVals = this.FetchLabTestComponentsList.filter((x: any) => x.abnormal);
    if (abnormalVals.length > 0) {
      this.isAbnormal = true;
      this.isPanic = false;
    }
    const panicVals = this.FetchLabTestComponentsList.filter((x: any) => x.panic);
    if (panicVals.length > 0) {
      this.isPanic = true;
      this.isAbnormal = false;
    }

    var payload =
    {
      "TestID": this.testID,
      "OrderID": this.testOrderID,
      "OrderItemID": this.testOrderItemID,
      "EquipmentID": "0",
      "MethodID": "0",
      "ReagentProfileID": "0",
      "Remarks": this.resultRemarks,
      "IsPanic": this.isPanic ? "True" : "False",
      "IsAbnormal": this.isAbnormal ? "True" : "False",
      "IsDeltaCheck": 0,
      "StageID": "0",
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalID,
      "TestResultsXML": this.FetchLabTestComponentsList,
      "TestDoctorsXML": docs
    }
    // isRemarksVisible

    this.us.post(labresultentry.SaveLabResultEntry, payload).subscribe((response) => {
      if (response.Status === "Success") {
        sessionStorage.removeItem('sensitivityData');
        this.saveMsg = "Lab-Result Entry Saved Successfully";
        $("#labResultEntrySaveMsg").modal('show');
        //Update Patient BloodGroup in Patients table
        const isBloodGroupEntered = this.FetchLabTestComponentsList.find((el: any) => (el.TestCompID === '3810' && el.TestID === '3344') || (el.TestCompID === '3944' && el.TestID === '3347') && el.TextValue);
        if (isBloodGroupEntered) {
          this.fetchBloodGroupMaster(isBloodGroupEntered.TextValue, this.selectedPatientData.PatientID);
        }

      }
      else {
        if (response.Status == 'Fail') {
          this.errorMessages = [];
          this.errorMessages.push(response.Message);
          this.errorMessages.push(response.Message2L);
          $("#labresultEntryValidation").modal('show');
        }
      }
    },
      (err) => {

      })
  }

  DeleteLabResultEntry() {
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        var delpayload = {
          "TestOrderID": this.testOrderID,
          "TestOrderItemID": this.testOrderItemID,
          "Sequence": "1",
          "UserID": this.doctorDetails[0].UserId,
          "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
          "HospitalID": this.hospitalID
        }
        this.us.post(labresultentry.DeleteLabResultEntry, delpayload).subscribe((response) => {
          if (response.Status === "Success") {
            this.saveMsg = "Result Deleted Successfully";
            $("#labResultEntrySaveMsg").modal('show');
          }
          else {
            if (response.Status == 'Fail') {
              this.errorMessages = [];
              this.errorMessages.push(response.Message);
              this.errorMessages.push(response.Message2L);
              $("#labresultEntryValidation").modal('show');
            }
          }
        },
          (err) => {

          })
      }
      modalRef.close();
    });
  }

  VerifyUnVerifyLabResultEntry(type: string) {
    if (type == "Yes") {
      if (this.isVerify)
        this.isVerify = false;
      else
        this.isVerify = true;
    }
    var verifypayload = {
      "TestVerifyXML": [
        {
          "SEQ": this.selectedPatientLabData?.Sequence,
          "ORD": this.testOrderID,
          "ORDITM": this.testOrderItemID,
          "STS": this.isVerify ? "8" : "7",
          "REVER": ""
        }
      ],
      "TestOrderID": this.testOrderID,
      "TestOrderItemID": this.testOrderItemID,
      "Status": this.isVerify ? "8" : "7",
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalID
    }
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.us.post(labresultentry.VerifyUnVerifyLabResultEntry, verifypayload).subscribe((response) => {
          if (response.Status === "Success") {
            if (this.isVerify) {
              this.saveMsg = "Result Verified Successfully";
            }
            else {
              this.saveMsg = "Result Un-Verified Successfully";
            }
            $("#labResultEntrySaveMsg").modal('show');
          }
          else {
            if (response.Status == 'Fail') {
              this.errorMessages = [];
              this.errorMessages.push(response.Message);
              this.errorMessages.push(response.Message2L);
              $("#labresultEntryValidation").modal('show');
            }
          }
        },
          (err) => {

          })
      }
      else if (!data.success) {
        this.isVerify = !this.isVerify;
      }
      modalRef.close();
    });
  }

  searchEmployee(event: any) {
    if (event.target.value.length > 2) {
      const url = this.service.getData(labresultentry.FetchDoctorName, {
        Filter: event.target.value,
        HospitalID: this.hospitalID
      });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.informedToList = response.FetchDoctorDataList;
          }
        },
          (err) => {
          })
    }
  }
  onItemSelected(emp: any) {
    //this.selectedInformedToEmpDetails = emp;
    this.selectedInformedToEmpDetails = [];
    this.selectedInformedToEmpDetails.push({
      InformedToEmpNo: emp.EmpNo,
      InformedToEmpId: emp.Empid,
      InformedToFullName: emp.Fullname
    })
  }
  onReadBackChanges(event: any) {
    if (event.target.checked == true) {
      this.IsReadBack = true
      this.readBackDate = this.currentDate;
    }
    else {
      this.readBackDate = "";
    }
  }

  openPanicResultReportingForm() {
    this.FetchSavePanicRadiologyForm();
    this.continueWithPanicAbnormal = true
    $("#panicReportForm").modal('show');
  }

  savePanicResultReportingForm() {

    var panicabmvals: any[] = [];
    this.panicabnormalresults.forEach((element: any, index: any) => {
      panicabmvals.push({
        "CMDID": element.ComponentID,
        "PANICRESULT": element.TextValue,
        "REFRANGE": element.RRValue,
      })
    });

    if (this.selectedInformedToEmpDetails != undefined) {
      var savePanicFormpayload = {
        "PatientCriticalPanicTestID": "0",
        "PatientID": this.selectedPatientData.PatientID,
        "Admissionid": this.selectedPatientData.IPID,
        "TestOrderID": this.selectedPatientLabData.TestOrderID,
        "TestOrderItemID": this.selectedPatientLabData.TestOrderItemID,
        "TestID": this.selectedPatientLabData.TestID,
        "InformedToEmpID": this.selectedInformedToEmpDetails[0].InformedToEmpId,
        "InformedByEmpID": this.doctorDetails[0].EmpId,
        "IsReadBack": this.IsReadBack,
        "Remarks": $("#panicFormRemarks").val(),
        "CriticalPanicRadResultXML": panicabmvals,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        "HospitalID": this.hospitalID
      }
      this.us.post(labresultentry.SaveRadiologyPanicReportingForm, savePanicFormpayload).subscribe((response) => {
        if (response.Code == 200) {
          this.ISPANICFORM = true;
          this.successMessage = "Panic Result Reporting Form Submitted Successfully";
          $("#resultEntrySavedMsg").modal('show');
          $("#panicReportForm").modal('hide');
          this.saveResultEntry();
        }
      },
        (err) => {

        })
    }
    else {
      this.errorMessages.push("Please select Informed To");
      if (this.errorMessages.length > 0) {
        $("#resultEntryValidationMsg").modal('show');
      }
    }
  }

  clearResultEntry() {
    this.FetchLabTestComponentsList.forEach((item: any) => {
      item.TextValue = '';
      item.Color = "white";
    });
  }

  ReloadScreen() {
    //window.location.reload();
  }

  clearPanicResultReportingForm() {
    this.selectedInformedToEmpDetails = [];
    this.IsReadBack = false;
    this.readBackDate = '';
    $("#panicFormRemarks").val('');
  }

  FetchSavePanicRadiologyForm() {
    const url = this.service.getData(labresultentry.FetchSavePanicRadiologyForm, {
      TestOrderItemId: this.selectedPatientLabData.TestOrderItemID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.Code == 200 && response.FetchSavePanicRadiologyFormDataList.length > 0) {
            if (response.FetchSavePanicRadiologyTestDataList.length > 0)
              this.sowPanicFormSave = false;
            this.savedPatientPanicResultReportingDetails = response.FetchSavePanicRadiologyFormDataList;
            this.IsReadBack = this.savedPatientPanicResultReportingDetails[0].IsReadBack;
            this.readBackDate = this.savedPatientPanicResultReportingDetails[0].ReadBackDateTime;
            $("#panicFormRemarks").val(this.savedPatientPanicResultReportingDetails[0].Remarks);
            this.selectedInformedToEmpDetails = []; this.selectedInformedByEmpDetails = [];
            if (this.savedPatientPanicResultReportingDetails[0].InformedToEmpNO != '') {
              this.selectedInformedByEmpDetails.push({
                EmpNo: this.savedPatientPanicResultReportingDetails[0].InformedByEmpNO,
                EmpId: this.savedPatientPanicResultReportingDetails[0].InformedByEmpID,
                FullName: this.savedPatientPanicResultReportingDetails[0].InformedByEmployeeName,
              })
            } else {
              this.selectedInformedByEmpDetails.push({
                EmpNo: this.doctorDetails[0].EmpNo,
                EmpId: this.doctorDetails[0].EmpId,
                FullName: this.doctorDetails[0].EmployeeName,
              })
            }
            this.selectedInformedToEmpDetails.push({
              InformedToEmpNo: this.savedPatientPanicResultReportingDetails[0].InformedToEmpNO,
              InformedToEmpId: this.savedPatientPanicResultReportingDetails[0].InformedToEmpID,
              InformedToFullName: this.savedPatientPanicResultReportingDetails[0].InformedToEmployeeName,
            })

          }
          else {
            this.selectedInformedByEmpDetails.push({
              EmpNo: this.doctorDetails[0].EmpNo,
              EmpId: this.savedPatientPanicResultReportingDetails[0].EmpId,
              FullName: this.savedPatientPanicResultReportingDetails[0].EmployeeName,
            })
          }
        }
      },
        (err) => {
        })
  }
  saveIsPreliminaryResult() {
    if (Number(this.labTestResults?.STATUS) >= 7) {
      var delpayload = {
        "TestOrderItemID": this.testOrderItemID,
        "IsPreliminary": !this.isPreliminary ? 1 : 0,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        "HospitalID": this.hospitalID
      }
      this.us.post(labresultentry.SaveIsPreliminaryResult, delpayload).subscribe((response) => {
        if (response.Status === "Success") {
          this.saveMsg = "Status Changed Successfully";
          $("#labResultEntrySaveMsg").modal('show');
        }
        else {
          if (response.Status == 'Fail') {
            this.errorMessages = [];
            this.errorMessages.push(response.Message);
            this.errorMessages.push(response.Message2L);
            $("#labresultEntryValidation").modal('show');
          }
        }
      },
        (err) => {

        })
    }
  }
  openUploadPopUp(item: any) {
    this.selectedUploadCompDetails = item;
    $("#divOutsideResultUpload").modal('show');
  }
  openSensitivity() {
    this.clearSensitity();
    this.loadCultureSources();
    if (this.sensitivityData?.length > 0) {
      this.FetchMicroAntiBioticsDataList = this.sensitivityData.map((item: any) => {
        return {
          organismId: item.OrganismID,
          organismName: item.Organism,
          sourceId: item.SourceID,
          sourceName: item.Source,
          AntiBioticID: item.AntibioticID,
          Name: item.Antibiotic,
          Abbreviation: item.Abbreviation,
          suspectibilityValue: item.SusceptibilityID,
          suspectibilityName: item.Susceptibility,
          CODE: item.Code,
          micValue: item.Value,
          selected: item.Suppress === 'true' || item.Suppress === true,
          noDelete: true
        };
      });
    }
    $("#sensitivityModal").modal('show');
  }

  clearSensitity() {
    this.sensitvitySourceSourceId = null;
    this.organisms = [];
    this.OrganismSearchText = '';
    this.selectedOrganisms = [];
    this.FetchMicroAntiBioticsDataList = [];
  }

  saveSensitivity() {
    let sensitivityData = this.FetchMicroAntiBioticsDataList.filter((item: any) => !!item.suspectibilityValue);
    if (sensitivityData.length > 0) {
      sensitivityData = sensitivityData.map((item: any) => {
        return {
          OrganismID: item.organismId,
          Organism: item.organismName,
          SourceID: item.sourceId,
          Source: item.sourceName,
          AntibioticID: item.AntiBioticID,
          Antibiotic: item.Name,
          ZoneDiaMM: '',
          Abbreviation: item.Abbreviation,
          SusceptibilityID: item.suspectibilityValue,
          Susceptibility: this.getSuspectibilityName(item.suspectibilityValue),
          Code: item.CODE,
          Value: item.micValue,
          Suppress: item.selected
        }
      });
      this.sensitivityData = [...sensitivityData];

      let sensitivityString = '<ZoneDiameter>';
      sensitivityData.forEach((item: any) => {
        sensitivityString += '<Antibiotics>';
        const keys = Object.keys(item);
        keys.forEach((key: string) => {
          sensitivityString += `<${key}>${item[key]}</${key}>`
        });
        sensitivityString += '</Antibiotics>';
      });
      sensitivityString += '</ZoneDiameter>';
      this.FetchLabTestComponentsList.forEach((item: any) => {
        if (item.ControlType === 'Grid') {
          item.TextValue = this.escapeHtmlEntities(sensitivityString);
        }
      });
    }
    $("#sensitivityModal").modal('hide');
  }

  loadCultureSources() {
    this.cultureSources = [];
    const params = {
      SpecimenID: 83,
      UserID: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    };
    const url = this.service.getData(labresultentry.FetchCultureSources, params);
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.cultureSources = response.FetchCultureSourcesDataList;
          if (this.cultureSources.length === 1) {
            this.sensitvitySourceSourceId = this.cultureSources[0].SourceID;
          }
        }
      });
  }

  fetchOrganisms(event: any) {
    if (event.target.value.length > 2) {
      const params = {
        Code: event.target.value,
        UserID: this.doctorDetails[0]?.UserId,
        WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        HospitalID: this.hospitalID
      };
      const url = this.service.getData(labresultentry.FetchMicroOrganisms, params);
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.organisms = response.FetchMicroOrganismsDataList;
          }
        });
    } else {
      this.organisms = [];
    }
  }

  organismsOptionClicked(event: Event, item: any) {
    event.stopPropagation();
    this.toggleOrganismsSelection(item);
  }

  toggleOrganismsSelection(item: any) {
    item.selected = !item.selected;
    if (item.selected) {
      const i = this.selectedOrganisms.findIndex((value: any) => value.OrganismID === item.OrganismID);
      if (i === -1) {
        this.selectedOrganisms.push(item);
      }
    } else {
      const i = this.selectedOrganisms.findIndex((value: any) => value.OrganismID === item.OrganismID);
      this.selectedOrganisms.splice(i, 1);
    }
  }

  onMicroAntibioticsSearch() {
    const sensitvitySource = this.cultureSources.find((item: any) => item.SourceID === this.sensitvitySourceSourceId);
    if (this.selectedOrganisms.length > 0 && this.sensitvitySourceSourceId) {
      const observables = this.selectedOrganisms.map((organism: any) => {
        const params = {
          OrganismID: organism.OrganismID,
          SourceID: this.sensitvitySourceSourceId,
          UserID: this.doctorDetails[0]?.UserId,
          WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
          HospitalID: this.hospitalID
        }
        const url = this.service.getData(labresultentry.FetchMicroAntiBiotics, params);
        return this.us.get(url).pipe(map(response => {
          return {
            response, organism
          }
        }));
      });
      combineLatest(observables).subscribe((response: any) => {
        let finalResult: any = [];
        response.forEach((data: any) => {
          if (data.response.Code === 200) {
            data.response.FetchMicroAntiBioticsDataList.forEach((item: any) => {
              finalResult.push({ ...item, sourceName: sensitvitySource.SourceName, sourceId: sensitvitySource.SourceID, organismName: data.organism.Name, organismId: data.organism.OrganismID, selected: false, micValue: '', suspectibilityValue: '' })
            });
          }
        });
        this.FetchMicroAntiBioticsDataList = [...this.FetchMicroAntiBioticsDataList.filter((element: any) => element.noDelete), ...finalResult];
      });
    }
  }

  getSuspectibilityName(value: any) {
    return this.suspectibilityCollection.find((data: any) => data.value === value)?.name;
  }

  onSelectFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0].name;
      var type = event.target.files[0].name.split(".").pop();
      if (event.target.files[0].size > 5242880) {
        this.fileError = 'File size limit should not exceed 5MB';
        alert(this.fileError);
      }
      else if (type.toLowerCase() !== 'jpeg' && type.toLowerCase() !== 'jpg' && type.toLowerCase() !== 'bmp' && type.toLowerCase() !== 'pdf'
        && type.toLowerCase() !== 'gif' && type.toLowerCase() !== 'png' && type.toLowerCase() !== 'tiff' && type.toLowerCase() !== 'tif') {
        this.fileError = 'File type should be  jpeg, jpg, bmp, gif, png, tiff';
        alert(this.fileError);
      }
      else {
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        this.convertToBase64(file, event.target.id);
      }
    }
  }
  cleanBase64String(base64Str: string): string {
    const match = base64Str.match(/^data:.+;base64,(.*)/);
    if (match) {
      return match[1];
    }
    return base64Str;
  }
  convertToBase64(file: File, inputType: any) {
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber);
    })
    observable.subscribe((d) => {
      this.myPhoto = d;
    })
  }
  readFile(file: File, subscriber: Subscriber<any>) {
    const filereader = new FileReader();
    filereader.readAsDataURL(file);
    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete();
    }
    filereader.onerror = () => {
      subscriber.error();
      subscriber.complete();
    }
  }
  uploadOutsideTestResult() {
    const guid = Guid.create();
    const filename = this.selectedPatientData.SSN + "_" + guid + "." + this.selectedFile;
    this.selectedUploadCompDetails.TextValue = filename;
    var payload =
    {
      "FileName": filename,
      "Base64": this.cleanBase64String(this.myPhoto),
    }

    this.us.post(labresultentry.UploadOutsideTestResult, payload).subscribe((response) => {
      if (response == "File Uploaded Successfully") {
        this.saveMsg = "File Uploaded Successfully";
        this.selectedUploadCompDetails.TextValue = filename;
        $("#labResultEntrySaveMsg").modal('show');
        $("#divOutsideResultUpload").modal('hide');
      }
    },
      (err) => {

      })
  }
  closePanicResultForm() {
    this.continueWithPanicAbnormal = false;
  }

  escapeHtmlEntities(text: string) {
    return text.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  unescapeHtmlEntities(text: string) {
    return text.replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  parseSensitivityData(value: string) {
    const data = this.unescapeHtmlEntities(value);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');
    const antibiotics = xmlDoc.getElementsByTagName('Antibiotics');
    this.sensitivityData = [];
    for (let i = 0; i < antibiotics.length; i++) {
      this.sensitivityData.push({
        OrganismID: antibiotics[i].getElementsByTagName('OrganismID')[0]?.textContent,
        Organism: antibiotics[i].getElementsByTagName('Organism')[0]?.textContent,
        SourceID: antibiotics[i].getElementsByTagName('SourceID')[0]?.textContent,
        Source: antibiotics[i].getElementsByTagName('Source')[0]?.textContent,
        AntibioticID: antibiotics[i].getElementsByTagName('AntibioticID')[0]?.textContent,
        Antibiotic: antibiotics[i].getElementsByTagName('Antibiotic')[0]?.textContent,
        ZoneDiaMM: antibiotics[i].getElementsByTagName('ZoneDiaMM')[0]?.textContent,
        Abbreviation: antibiotics[i].getElementsByTagName('Abbreviation')[0]?.textContent,
        SusceptibilityID: antibiotics[i].getElementsByTagName('SusceptibilityID')[0]?.textContent,
        Susceptibility: antibiotics[i].getElementsByTagName('Susceptibility')[0]?.textContent,
        Code: antibiotics[i].getElementsByTagName('Code')[0]?.textContent,
        Value: antibiotics[i].getElementsByTagName('Value')[0]?.textContent,
        Suppress: antibiotics[i].getElementsByTagName('Suppress')[0]?.textContent
      })
    }
  }

  navigatetoPatientSummary() {
    this.selectedPatientData.Bed = this.selectedPatientData.OrderBed;
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.selectedPatientData));
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedPatientData));
    sessionStorage.setItem("selectedPatientAdmissionId", this.selectedPatientData.IPID);
    sessionStorage.setItem("PatientID", this.selectedPatientData.PatientID);
    sessionStorage.setItem("labresult", "true");
    this.router.navigate(['/shared/patientfolder']);
  }

  getLabReportPdf() {

    let reqPayload = {
      "RegCode": this.selectedPatientData.RegCode ?? this.selectedView.RegCode,
      "HospitalId": this.hospitalID,
      "TestOrderId": this.selectedPatientData.TestOrderID
    }
    const url = this.service.getData(labresultentry.FetchLabReportItemlevelGroupPDFN,
      {
        RegCode: reqPayload.RegCode,
        IPID: this.selectedPatientData.IPID,
        TestID: this.selectedPatientLabData.TestID,
        TestOrderId: this.selectedPatientLabData.TestOrderID,
        TestOrderItemID: this.selectedPatientLabData.TestOrderItemID,
        IsnewVisit: 1,
        WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        HospitalID: this.hospitalID

      });
    this.us.get(url).subscribe((response: any) => {
      if (response.Status === "Success") {
        this.labReportPdfDetails = response;
        this.trustedUrl = response?.FTPPATH;
        //this.showLabReportsModal();
        if (response.objHtmlReport != '' && response.objHtmlReport != null) {
          const content = response.objHtmlReport;
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/html');
          const extractedText = doc.body.innerHTML;
          this.cardiologyContentHTML = this.sanitizer.bypassSecurityTrustHtml(extractedText);
          $('#cardiology_report').modal('show');
        }
        else {
          this.showLabReportsModal();
        }
      } else if (response.Status === "Fail") {
        this.labReportPdfDetails = response;
        this.showToastrModal();
      }
    },
      (err) => {

      })
  }
  getAuditLabReportPdf() {

    let reqPayload = {
      "AdmissionID": this.selectedPatientData.IPID,
      "TestOrderID": this.testOrderID,
      "TestOrderIDItemID": this.testOrderItemID,
      "UserName": this.doctorDetails[0]?.UserName,
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalID,
    }
    const url = this.service.getData(labresultentry.FetchAuditTestResults, { AdmissionID: reqPayload.AdmissionID, TestOrderID: reqPayload.TestOrderID, TestOrderIDItemID: reqPayload.TestOrderIDItemID, UserName: reqPayload.UserName, UserID: reqPayload.UserID, WorkStationID: reqPayload.WorkStationID, HospitalID: this.hospitalID });
    this.us.get(url).subscribe((response: any) => {
      if (response.Status === "Success") {
        this.labReportPdfDetails = response;
        this.trustedUrl = response?.FTPPATH;
        this.showLabReportsModal();
      } else if (response.Code === 604) {
        this.labReportPdfDetails = response.Message;
        this.showToastrModal();
      }
    },
      (err) => {

      })
  }
  showLabReportsModal(): void {
    $("#showLabReportsModal").modal('show');
  }
  showToastrModal() {
    $("#saveMessage").modal('show');
  }

  sendSms(wrk: any) {
    const payload = {
      "TestOrderID": wrk.TestOrderID,
      "PatientID": wrk.PatientID,
      "PatientFullName": wrk.PatientName,
      "PatientFullName2L": wrk.PatientName,
      "SSN": wrk.SSN,
      "MobileNo": wrk.MobileNo,
      "NationalityID": wrk.NationalityID ?? '1',
      "HospitalID": this.hospitalID,
    };
    this.us.post(labresultentry.LabResultsSMS, payload).subscribe((response: any) => {
      if (response.Code === 200) {
        $('#labReportSms').modal('show');
      }
    },
      (err) => {

      });
  }

  openCorrectedForm() {
    sessionStorage.setItem('selectedView', JSON.stringify(this.selectedPatientData));
    const options: NgbModalOptions = {
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(CorrectedFormComponent, {}, options);
  }

  print() {
    if ($('#divscroll').hasClass('template_scroll')) {
      $('#divscroll').removeClass("template_scroll");
    }

    if ($('#divscrollOverflow').hasClass('overflow-auto')) {
      $('#divscrollOverflow').removeClass("overflow-auto");
      $('#divscrollOverflow').addClass("overflow-visible");
    }
    this.printService.print(this.divprint.nativeElement, 'Report');

    setTimeout(() => {
      $('#divscroll').addClass("template_scroll");
      $('#divscrollOverflow').addClass("overflow-auto");
      $('#divscrollOverflow').removeClass("overflow-visible");
    }, 1000);
  }

  multiItemsList: any = [];
  totalItemsCount: any = 0;
  searchString: any = '';
  currentPage: any = 1;
  selectedMultiItemsList: any = [];
  showSelectedMultipleItems: boolean = false;

  openAntibioticsModal() {
    this.selectedMultiItemsList = [];
    this.multiItemsList = [];
    this.totalItemsCount = 0;
    this.searchString = '';
    this.currentPage = 0;
    this.showSelectedMultipleItems = false;
    $('#drugNameTextMulti').val('');
    $('#antibioticsModal').modal('show');
  }

  showSelectedMultipleItemsClick() {
    this.showSelectedMultipleItems = !this.showSelectedMultipleItems;
  }

  searchMultiItems(event: any, min: number = 1, max: number = 10, currentPage: number = 1) {
    const searchval = event.target.value;
    if (searchval.length > 2) {
      this.searchString = searchval;
      const url = this.us.getApiUrl(labresultentry.FetchAntiBioticsAdv, {
        Filter: searchval,
        FromWokstationID: this.facility.FacilityID,
        UserID: this.doctorDetails[0]?.UserId,
        WorkStationID: this.facility.FacilityID,
        HospitalID: this.hospitalID,
        min,
        max
      });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code === 200) {
            this.currentPage = currentPage;
            this.totalItemsCount = Number(response.FetchHospitalNurseCountaList[0]?.TotalCount);
            this.multiItemsList = response.FetchAntiBioticsAdvDataList;
            if (this.selectedMultiItemsList.length > 0) {
              this.multiItemsList.forEach((element: any) => {
                const elementFound = this.selectedMultiItemsList.find((x: any) => x.AntiBioticID === element.AntiBioticID);
                if (elementFound) {
                  element.selected = true;
                }
              });
            }
          }
        },
          () => {
          });
    } else {
      this.totalItemsCount = 0;
      this.multiItemsList = [];
      this.currentPage = 0;
    }
  }

  selectMultiItem(item: any) {
    item.selected = !item.selected;
    if (item.selected) {
      this.selectedMultiItemsList.push(item);
    }
    else {
      this.selectedMultiItemsList.splice(this.selectedMultiItemsList.indexOf(item), 1);
    }
  }
  loadSelectedMultiItems() {
    $('#antibioticsModal').modal('hide');
    const sensitvitySource = this.cultureSources.find((item: any) => item.SourceID === this.sensitvitySourceSourceId);
    this.selectedMultiItemsList.forEach((item: any) => {
      this.selectedOrganisms.forEach((organism: any) => {
        this.FetchMicroAntiBioticsDataList.push({
          ...item,
          sourceName: sensitvitySource.SourceName,
          sourceId: sensitvitySource.SourceID,
          organismName: organism.Name,
          organismId: organism.OrganismID,
          selected: false,
          micValue: '',
          suspectibilityValue: ''
        })
      });
    });
  }

  handlePageChange(event: any) {
    this.searchMultiItems({
      target: {
        value: this.searchString
      }
    }, event.min, event.max, event.currentPage);
  }

  fetchBloodGroupMaster(bldGrp: any, patientId: any) {
    const url = this.us.getApiUrl(labresultentry.FetchBloodGroupMasters, {
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        const bloodGroupsMaster = response.FetchBloodGroupMastersDetailsList;
        const matchedBldGrp = bloodGroupsMaster.find((x: any) => x.PanaceBloodGroup == bldGrp.split('#')[0].replace(/"/g, ''));
        if (matchedBldGrp) {
          this.updatePatientBloodGroup(matchedBldGrp.BloodGroupID, patientId);
        }
      }
    });
  }

  updatePatientBloodGroup(bldgrpId: any, patientId: any) {
    var payload = {
      "PatientId": patientId,
      "BloodGroupId": bldgrpId,
      "UserId": this.doctorDetails[0].UserId,
      "WorkstationId": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalID
    }

    this.us.post(labresultentry.UpdatePatientBloodGroup, payload).subscribe((response) => {
      if (response.Status === "Success") {

      }
    },
      (err) => {

      })
  }

  translateAI() {
    if (!this.LabTestResultJsonValue.trim() || !this.selectedAIType) return;

    $("#arabicModal").modal('show');
    if (this.arabicText) {
      return;
    }

    const prompts: any = {
      detail: `IMPORTANT: Return ONLY pure HTML without any markdown formatting or code blocks. Do not wrap in \`\`\`html or \`\`\`. Start directly with the <div> tag.

        Generate a patient-friendly detailed Clinical Laboratory report and visualizes a 'Risk Meter' Comparison from reference Range and provide description for each component below Riskmeter from the given input. Return only the Detailed content wrapped inside <div>...</div> without any extra text before or after the div and dont add any + icons on Headers and report width 90% and use bright colors and add in Report Header` + this.selectedPatientLabData?.Test,

      infographic: `
      CRITICAL OUTPUT RULE:
      Respond with RAW HTML ONLY.
      Start exactly with <div> and end exactly with </div>.
      No explanations.
      No labels.
      No formatting markers.
      No text before or after the <div>.

      Return HTML directly starting with <div>.
        IMPORTANT: Return ONLY pure HTML without any markdown formatting or code blocks. Do not wrap in \`\`\`html or \`\`\`. Start directly with the <div> tag.

        Generate a clean, modern, patient-friendly Clinical Laboratory infographic report.

        Requirements:
        - Overall report width: 90%
        - Add a bright modern Report Header
        - Each parameter in an individual card
        - Result value in bold rounded badge with color based on reference range
        - Previous Result in bold rounded badge with color
        - Dashboard-style spacing
        - Friendly description for each component
        - Bright colors, soft shadows, rounded corners
        - No "+" icons
        - Left border color based on result vs reference range
        - Simple, readable text

        Report Header: ${this.selectedPatientLabData?.Test}
        `,


     Arabicinfographic: `
        IMPORTANT: Return ONLY pure HTML without any markdown formatting or code blocks. Do not wrap in \`\`\`html or \`\`\`. Start directly with the <div> tag.
        CRITICAL OUTPUT RULE:
        Respond with RAW HTML ONLY.
        Start exactly with <div> and end exactly with </div>.
        No explanations.
        No labels.
        No formatting markers.
        No text before or after the <div>.

        Generate the SAME infographic layout translated from English to Arabic.
        Use professional medical Arabic.
        Preserve medical accuracy.

        Requirements:
        - Overall report width: 90%
        - Bright modern Report Header (Arabic)
        - Each parameter in an individual card
        - Result value in bold rounded badge with color
        - Previous Result in bold rounded badge
        - Dashboard-style spacing
        - Friendly Arabic description for each component
        - Bright colors, soft shadows, rounded corners
        - No "+" icons
        - Left border color based on reference range
        - Simple, readable Arabic text

        Report Header: ${this.selectedPatientLabData?.Test}
        `
    };

    const payload = {
      aiType: this.selectedAIType,
      prompt: prompts[this.selectedAIType],
      englishText: this.LabTestResultJsonValue
    };

    this.translationService.generateAIReport(payload).subscribe({
      next: (res: any) => {
        if(res.translation)
        this.arabicText = res.translation || res.Output;
      else
        this.arabicText ="";
        this.errorMessages = ['AI generation failed. Try again.'];
      },
      error: () => {
        this.arabicText ="";
        this.errorMessages = ['AI generation failed. Try again.'];
      }
    });
  }

  saveArabicTextConfirmation() {
    $("#arabicTextSaveConfirmModal").modal('show');
  }

  saveArabicText() {
    const payload = {
      "TestOrderID": this.testOrderID,
      "TestOrderItemID": this.testOrderItemID,
      "ParameterID": this.testID,
      "AIGeneratedArabicResult": this.arabicText,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalID,
    };
    this.us.post('UpdateRadiologyAITestResults', payload).subscribe((response: any) => {
      if (response.Code == 200) {
        this.successMessage = "Arabic Text Saved Successfully";
        $("#resultEntrySavedMsg").modal('show');
        $("#arabicModal").modal('hide');
      }
    });
  }

  onAIOptionSelect(type: string) {
    this.arabicText = '';
    this.selectedAIType = type;
    this.translateAI();
  }
}


export const labresultentry = {
  FetchLabTestComponents: 'FetchLabTestComponents?PatientID=${PatientID}&GenderID=${GenderID}&DOB=${DOB}&SampleCollectedAtDt=${SampleCollectedAtDt}&TestID=${TestID}&TestOrderID=${TestOrderID}&TestOrderItemID=${TestOrderItemID}&PatientType=${PatientType}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPrevLabTestComponents: 'FetchPrevLabTestComponents?PatientID=${PatientID}&GenderID=${GenderID}&DOB=${DOB}&SampleCollectedAtDt=${SampleCollectedAtDt}&TestID=${TestID}&TestOrderID=${TestOrderID}&TestOrderItemID=${TestOrderItemID}&SampleNo=${SampleNo}&PatientType=${PatientType}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdviceDiagnosis: 'FetchAdviceDiagnosis?TBL=1&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchLabTestDoctors: 'FetchLabTestDoctors?TestID=${TestID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  DownloadExternalLabReport: 'DownloadExternalLabReport?FileName=${FileName}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SaveLabResultEntry: 'SaveLabResultEntry',
  DeleteLabResultEntry: 'DeleteLabResultEntry',
  VerifyUnVerifyLabResultEntry: 'VerifyUnVerifyLabResultEntry',
  FetchDoctorName: 'FetchDoctorName?Filter=${Filter}&HospitalID=${HospitalID}',
  SaveRadiologyPanicReportingForm: 'SaveRadiologyPanicReportingForm',
  FetchSavePanicRadiologyForm: 'FetchSavePanicRadiologyForm?TestOrderItemId=${TestOrderItemId}&HospitalID=${HospitalID}',
  SaveIsPreliminaryResult: 'SaveIsPreliminaryResult',
  UploadOutsideTestResult: 'FileUpload',
  FetchCultureSources: 'FetchCultureSources?SpecimenID=${SpecimenID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchMicroOrganisms: 'FetchMicroOrganisms?Code=${Code}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchMicroAntiBiotics: 'FetchMicroAntiBiotics?OrganismID=${OrganismID}&SourceID=${SourceID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchLabReportGroupPDF: 'FetchLabReportGroupPDF?RegCode=${RegCode}&TestOrderId=${TestOrderId}&UserID=${UserID}&HospitalID=${HospitalID}',
  //https://localhost:44350//API/FetchLabReportItemlevelGroupPDF?RegCode=ALHH.0001486627&TestOrderId=159&TestOrderItemID=559&WorkStationID=2345&HospitalID=2
  FetchLabReportItemlevelGroupPDF: 'FetchLabReportItemlevelGroupPDF?RegCode=${RegCode}&TestOrderId=${TestOrderId}&TestOrderItemID=${TestOrderItemID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  LabResultsSMS: "LabResultsSMS",
  FetchBloodPanaceaResults: 'FetchBloodPanaceaResults?BloodOrderID=${BloodOrderID}&PanaceaOrderID=${PanaceaOrderID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAuditTestResults: 'FetchAuditTestResults?AdmissionID=${AdmissionID}&TestOrderID=${TestOrderID}&TestOrderIDItemID=${TestOrderIDItemID}&UserName=${UserName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAntiBioticsAdv: 'FetchAntiBioticsAdv?min=${min}&max=${max}&Filter=${Filter}&FromWokstationID=${FromWokstationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchLabReportItemlevelGroupPDFN: 'FetchLabReportItemlevelGroupPDFN?RegCode=${RegCode}&IPID=${IPID}&TestID=${TestID}&TestOrderId=${TestOrderId}&TestOrderItemID=${TestOrderItemID}&IsnewVisit=${IsnewVisit}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientBloodGroupTestResults: 'FetchPatientBloodGroupTestResults?PatientID=${PatientID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  UpdatePatientBloodGroup: 'UpdatePatientBloodGroup',
  FetchBloodGroupMasters: 'FetchBloodGroupMasters?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}