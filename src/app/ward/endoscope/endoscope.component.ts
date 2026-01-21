import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService as BedConfig } from '../services/config.service';
import { ConfigService } from 'src/app/services/config.service';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as Highcharts from 'highcharts';
import { UtilityService } from 'src/app/shared/utility.service';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { BedTransfereRequestComponent } from '../bed-transfere-request/bed-transfere-request.component';

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
  selector: 'app-endoscope',
  templateUrl: './endoscope.component.html',
  styleUrls: ['./endoscope.component.scss'],
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
export class EndoscopeComponent implements OnInit {
  @Input() data: any;
  readonly = false;
  errorMessage: any;
  selectedView: any;
  hospId: any;
  SSNPatientVisitsDataList: any = [];
  admissionID: any;
  endoScopyForm: any;
  doctorDetails: any;
  facility: any;
  PreprocedureType: any = 1;
  errorMessages: any = [];
  duringactiveButton: any = 'spline';
  postactiveButton: any = 'spline';
  IsVitalDisplay = true;
  tableVitals: any;
  recordRemarks: Map<number, string> = new Map<number, string>();
  showVitalsValidation: boolean = false;
  parameterErrorMessage: string = "";
  showParamValidationMessage: boolean = false;
  PatientPreProcedurePreVitalsList: any;
  EndoScopyResults: any;
  PatientPreProcedureAssessmentsDataList: any;
  PatientPreprocAssID: any = 0;
  DoseUOMEndoDataList: any = [];
  SurgeryDemographicsDataaList: any = [];
  drugTableForm: any;
  FetchEndoDrugsDataList: any;
  drugForm: any;
  EffectsList: any;
  PrePostList: any;
  IsEdit = false;
  isdetailShow = false;
  editIndex = 0;
  intakeForm: any;
  outputForm: any;
  procedureForm: any;
  anesthesiaForm: any;
  endoDoctorList: any;
  endoNurseList: any;
  anesDoctorList: any;
  anesNurseList: any;
  VsDetails: any = [];
  langData: any;
  PatientPreProcedureDuringVitalsList: any = [];
  PatientPreProcedurePostVitalsList: any = [];
  IsFromBedsBoard: any;
  PatientEndoTotalRequestDataList: any;
  PatientDiagnosisList: any;
  childClickName: any;
  IsHeadNurse: any;
  IsHome = true;
  patinfo: any;
  vteType: any;
  IsDoctor: any;
  DoctorSignatureID: any;
  NurseSignatureID: any;
  AnesthesiaDoctorSignatureID: any;
  AnesthesiaNurseSignatureID: any;
  fromRadiology = false;
  ConsciousSedation = false;
  base64StringSig2 = '';
  base64StringSig3 = '';
  showSignature: boolean = true;
  showSignature1: boolean = true;
  isWardNurse = false;
  isORHeadNurse = false;
  proceduresPerformedList: any = [];
  isEmergency : boolean = false;

  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @ViewChild('Sign2Ref', { static: false }) signComponent2: SignatureComponent | undefined;
  @ViewChild('Sign3Ref', { static: false }) signComponent3: SignatureComponent | undefined;

  @Output() dataChanged = new EventEmitter<boolean>();

  get items(): FormArray {
    return this.drugTableForm.get('items') as FormArray;
  }

  get intakeitems(): FormArray {
    return this.intakeForm.get('items') as FormArray;
  }

  get outputitems(): FormArray {
    return this.outputForm.get('items') as FormArray;
  }

  get procedureitems(): FormArray {
    return this.procedureForm.get('procedureitems') as FormArray;
  }

  get anesthesiaitems(): FormArray {
    return this.anesthesiaForm.get('items') as FormArray;
  }

  constructor(private datePipe: DatePipe, private us: UtilityService, private fb: FormBuilder, private config: BedConfig, private router: Router, private con: ConfigService, public datepipe: DatePipe, private changeDetectorRef: ChangeDetectorRef, private modalService: GenericModalBuilder) {
    this.langData = this.con.getLangData();
    this.initializeForm();

    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
  }

  initializeForm() {
    this.endoScopyForm = this.fb.group({
      Diagnosis: ['', Validators.required],
      AdmissionID: [0],
      BPSystolic: [''],
      BPDiastolic: [''],
      RR: [''],
      PR: [''],
      Temp: [''],
      SP02: [''],
      Conscious: [false],
      Drowsy: [false],
      Comatose: [false],
      Comments: [''],
      GlascowScale: [''],
      ECGDuringproc: [''],
      SkinIntegrityDuringproc: [''],
      ECGPostgproc: [''],
      SkinIntegrityPostproc: [''],
      DoctorNote: [''],
      OrdersO2Mask: [''],
      OrdersIV: [''],
      OrdersAT: [''],
      IsAntiemetics: [false],
      AntiemeticsRemarks: [''],
      IsAnalgesic: [false],
      AnalgesicRemarks: [''],
      IsAnexate: [false],
      AnexateRemarks: [''],
      DischargeNote: [''],
      IsFitForDischarge: [''],
      DoctorSignatureID: [''],
      NurseSignatureID: [''],
      AnesthesiaDoctorSignatureID: [''],
      AnesthesiaNurseSignatureID: [''],
      EndoscopyDocSignature: [''],
      AnesthesiologistDocSignature: ['']

    });

    this.drugTableForm = this.fb.group({
      DrugID: ['', Validators.required],
      DrugName: ['', Validators.required],
      Dose: ['', Validators.required],
      UOM: ['', Validators.required],
      UOMName: [''],
      AdminRouteID: ['', Validators.required],
      AdminRoute: ['', Validators.required],
      DrugDate: [new Date(), Validators.required],
      Time: ['', Validators.required],
      Effects: ['-100', Validators.required],
      PrePost: ['-100', Validators.required],
      DoctorNote: [''],
      PPAIID: ['']
    });

    this.drugForm = this.fb.group({
      DrugID: ['', Validators.required],
      DrugName: ['', Validators.required],
      Dose: ['', Validators.required],
      UOM: ['-100', Validators.required],
      UOMName: [''],
      AdminRouteID: ['-100', Validators.required],
      AdminRoute: ['', Validators.required]
    });

    this.intakeForm = this.fb.group({
      INID: [''],
      Name: ['', Validators.required]
    });

    this.outputForm = this.fb.group({
      INID: [''],
      Name: ['', Validators.required]
    });

    this.procedureForm = this.fb.group({
      PERID: [''],
      StartNote: ['', Validators.required],
      StartDate: [new Date(), Validators.required],
      StartTime: ['00:00', Validators.required],
      EndNote: ['', Validators.required],
      EndDate: [new Date(), Validators.required],
      EndTime: ['00:00', Validators.required],
    });

    this.anesthesiaForm = this.fb.group({
      PERID: [''],
      StartNote: ['', Validators.required],
      StartDate: [new Date(), Validators.required],
      StartTime: ['00:00', Validators.required],
      EndNote: ['', Validators.required],
      EndDate: [new Date(), Validators.required],
      EndTime: ['00:00', Validators.required],
    });
  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    if(this.facility?.FacilityName === 'EMERGENCY WARD') {
      this.isEmergency = true;
    }
    this.IsFromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospId = sessionStorage.getItem("hospitalId");
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.fromRadiology = JSON.parse(sessionStorage.getItem("FromRadiology") || '{}');
    this.admissionID = this.selectedView.IPID;
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
    this.endoScopyForm.get('AdmissionID')?.setValue(this.admissionID);
    this.isWardNurse = this.doctorDetails[0].IsNurse || this.doctorDetails[0].IsDoctor;
    if (this.doctorDetails[0].IsHeadNurse)
      this.isWardNurse = true;
    this.isORHeadNurse = this.doctorDetails[0].IsORHeadNurse;
    if (this.selectedView.SSN) {
      this.fetchSSNPatientVisits();
    }
    this.fetchDiagnosis();
    this.patientPreProcedureAssessments();
    this.fetchDoseUOM();
    this.fetchRouteofAdminEndo();

    this.fetchEndoDrugEffects();
    this.fetchEndoDrugPrePost();


    this.drugTableForm = this.fb.group({
      items: this.fb.array([])
    });

    this.intakeForm = this.fb.group({
      items: this.fb.array([])
    });

    this.outputForm = this.fb.group({
      items: this.fb.array([])
    });

    this.procedureForm = this.fb.group({
      procedureitems: this.fb.array([])
    });

    this.anesthesiaForm = this.fb.group({
      items: this.fb.array([])
    });

    this.addIntake();
    this.addOutput();
    this.addProcedure();
    this.addAnesthesia();
    if (this.data) {
      this.readonly = this.data.readonly;
      this.patientPreProcedureAssessmentData(this.data.data);
      this.us.disabledElement(this.divreadonly.nativeElement);
    }
  }

  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  fetchSSNPatientVisits() {
    if (this.selectedView.SSN) {
      this.config.fetchSSNPatientVisits(this.selectedView.SSN, this.hospId).subscribe(
        (results) => {
          this.SSNPatientVisitsDataList = results.SSNPatientVisitsDataList;
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
    }
  }

  fetchDoseUOM() {
    this.config.fetchDoseUOM(this.hospId).subscribe(
      (results) => {
        this.DoseUOMEndoDataList = results.DoseUOMEndoDataList;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  fetchRouteofAdminEndo() {
    this.config.fetchRouteofAdminEndo(this.hospId).subscribe(
      (results) => {
        this.SurgeryDemographicsDataaList = results.SurgeryDemographicsDataaList;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  patientPreProcedureAssessments() {
    this.config.patientPreProcedureAssessments(this.selectedView.IPID, this.hospId).subscribe(
      (results) => {
        if (results.Code == 200) {
          this.anesthesiaitems.clear();
          this.procedureitems.clear();
          this.outputitems.clear();
          this.intakeitems.clear();
          this.items.clear();

          this.EndoScopyResults = results;
          this.PatientPreProcedurePreVitalsList = results.PatientPreProcedurePreVitalsList;
          this.PatientPreProcedureDuringVitalsList = results.PatientPreProcedureDuringVitalsList;
          this.PatientPreProcedurePostVitalsList = results.PatientPreProcedurePostVitalsList;
          this.PatientPreProcedureAssessmentsDataList = results.PatientPreProcedureAssessmentsDataList[0];
          this.PatientPreprocAssID = this.PatientPreProcedureAssessmentsDataList.PatientPreprocAssID;
          this.toggleConsciousSedation(this.PatientPreProcedureAssessmentsDataList.AnesthesiaPerformed);
          if (results.PatientPreProcedurePreVitalsList.length > 0) {
            this.endoScopyForm.patchValue({
              BPSystolic: this.PatientPreProcedurePreVitalsList.Systolic,
              BPDiastolic: this.PatientPreProcedurePreVitalsList.Diastolic,
              RR: this.PatientPreProcedurePreVitalsList.Respiration,
              PR: this.PatientPreProcedurePreVitalsList.Pulse,
              Temp: this.PatientPreProcedurePreVitalsList.Temparature,
              SP02: this.PatientPreProcedurePreVitalsList.SPO2
            });
          }

          if (results.PatientPreProcedureAssessmentsDataList[0]) {
            this.endoScopyForm.patchValue({
              Conscious: this.PatientPreProcedureAssessmentsDataList.Conscious === "True" ? true : false,
              Drowsy: this.PatientPreProcedureAssessmentsDataList.Drowsy === "True" ? true : false,
              Comatose: this.PatientPreProcedureAssessmentsDataList.Comatose === "True" ? true : false,
              GlascowScale: this.PatientPreProcedureAssessmentsDataList.GlascowScale,
              Comments: this.PatientPreProcedureAssessmentsDataList.Comments,
              ECGDuringproc: this.PatientPreProcedureAssessmentsDataList.ECGDuringproc,
              SkinIntegrityDuringproc: this.PatientPreProcedureAssessmentsDataList.SkinIntegrityDuringproc,
              ECGPostgproc: this.PatientPreProcedureAssessmentsDataList.ECGPostgproc,
              SkinIntegrityPostproc: this.PatientPreProcedureAssessmentsDataList.SkinIntegrityPostproc,
              DoctorNote: this.PatientPreProcedureAssessmentsDataList.DoctorNote,
              OrdersO2Mask: this.PatientPreProcedureAssessmentsDataList.OrdersO2Mask,
              OrdersIV: this.PatientPreProcedureAssessmentsDataList.OrdersIV,
              OrdersAT: this.PatientPreProcedureAssessmentsDataList.OrdersAT,
              IsAntiemetics: this.PatientPreProcedureAssessmentsDataList.IsAntiemetics,
              AntiemeticsRemarks: this.PatientPreProcedureAssessmentsDataList.AntiemeticsRemarks,
              IsAnalgesic: this.PatientPreProcedureAssessmentsDataList.IsAnalgesic,
              AnalgesicRemarks: this.PatientPreProcedureAssessmentsDataList.AnalgesicRemarks,
              IsAnexate: this.PatientPreProcedureAssessmentsDataList.IsAnexate,
              AnexateRemarks: this.PatientPreProcedureAssessmentsDataList.AnexateRemarks,
              DischargeNote: this.PatientPreProcedureAssessmentsDataList.DischargeNote,
              IsFitForDischarge: this.PatientPreProcedureAssessmentsDataList.IsFitForDischarge,

              DoctorSignatureID: this.PatientPreProcedureAssessmentsDataList.DoctorName,
              NurseSignatureID: this.PatientPreProcedureAssessmentsDataList.NurseName,
              AnesthesiaDoctorSignatureID: this.PatientPreProcedureAssessmentsDataList.AnesthesiaDoctorName,
              AnesthesiaNurseSignatureID: this.PatientPreProcedureAssessmentsDataList.AnesthesiaNurseName,
              
              EndoscopyDocSignature: this.PatientPreProcedureAssessmentsDataList.EndoscopyDocSignature,
              AnesthesiologistDocSignature: this.PatientPreProcedureAssessmentsDataList.AnesthesiologistDocSignature
            });

            this.DoctorSignatureID = this.PatientPreProcedureAssessmentsDataList.DoctorSignatureID;
            this.NurseSignatureID = this.PatientPreProcedureAssessmentsDataList.NurseSignatureID;
            this.AnesthesiaDoctorSignatureID = this.PatientPreProcedureAssessmentsDataList.AnesthesiaDoctorSignatureID;
            this.AnesthesiaNurseSignatureID = this.PatientPreProcedureAssessmentsDataList.AnesthesiaNurseSignatureID;

            this.base64StringSig2 = this.PatientPreProcedureAssessmentsDataList.EndoscopyDocSignature;
            this.base64StringSig3 = this.PatientPreProcedureAssessmentsDataList.AnesthesiologistDocSignature;

          }

          if (results.PatientPreProcedureMedicationList.length > 0) {
            results.PatientPreProcedureMedicationList.forEach((element: any, index: any) => {
              var filteredData = this.DoseUOMEndoDataList.filter((x: any) => x?.UoM === element.DoseUOM);
              var filterRoute = this.SurgeryDemographicsDataaList.filter((x: any) => x?.Names === element.AdmRoute);
              const itemFormGroup = this.fb.group({
                DrugID: element.ItemID,
                DrugName: element.ItemName,
                Dose: element.Dose,
                UOM: filteredData.length > 0 ? filteredData[0].UomID : 0,
                UOMName: element.DoseUOM,
                AdminRouteID: filterRoute.length > 0 ? filterRoute[0].Id : 0,
                AdminRoute: element.AdmRoute,
                DrugDate: new Date(element.FromDate),
                Time: this.convertTo24HourFormat(element.Time),
                Effects: element.AssessmentEffectID,
                PrePost: element.PrePost,
                DoctorNote: element.Remarks,
                PPAIID: element.PatientPreprocAssItemID
              })
              this.items.push(itemFormGroup);
            });
          }

          if (results.PatientPreProcedureOuttakeList.length > 0) {
            results.PatientPreProcedureOuttakeList.forEach((element: any, index: any) => {
              const itemFormGroup = this.fb.group({
                Name: element.InTakeOutTakeValue,
                INID: element.InTakeOutTakeID
              })
              this.intakeitems.push(itemFormGroup);
            });
          }

          if (results.PatientPreProcedureIntakeList.length > 0) {
            results.PatientPreProcedureIntakeList.forEach((element: any, index: any) => {
              const itemFormGroup = this.fb.group({
                Name: element.InTakeOutTakeValue,
                INID: element.InTakeOutTakeID
              })
              this.outputitems.push(itemFormGroup);
            });
          }

          if (results.PatientPreProcedureProcedureList.length > 0) {
            results.PatientPreProcedureProcedureList.forEach((element: any, index: any) => {
              const itemFormGroup = this.fb.group({
                PERID: element.PatientPreprocPerformedID,
                StartNote: element.PerformedNote,
                StartDate: new Date(element.PerformedStartDate),
                StartTime: this.convertTo24HourFormat(element.PerformedStartDateTime),
                EndNote: element.PerformedRemarks,
                EndDate: new Date(element.PerformedEndDate),
                EndTime: this.convertTo24HourFormat(element.PerformedEndDateTime)
              })
              this.procedureitems.push(itemFormGroup);
            });
          }

          if (results.PatientPreProcedureAnaesthesiaList.length > 0) {
            results.PatientPreProcedureAnaesthesiaList.forEach((element: any, index: any) => {
              const itemFormGroup = this.fb.group({
                PERID: element.PatientPreprocPerformedID,
                StartNote: element.PerformedNote,
                StartDate: new Date(element.PerformedStartDate),
                StartTime: this.convertTo24HourFormat(element.PerformedStartDateTime),
                EndNote: element.PerformedRemarks,
                EndDate: new Date(element.PerformedEndDate),
                EndTime: this.convertTo24HourFormat(element.PerformedEndDateTime)
              })
              this.anesthesiaitems.push(itemFormGroup);
            });
          }

          this.addIntake();
          this.addOutput();
          this.addProcedure();
          this.addAnesthesia();
          setTimeout(() => {
            if (this.PatientPreProcedureDuringVitalsList.length > 0) {
              this.getChart('spline');
            }

            if (this.PatientPreProcedurePostVitalsList.length > 0) {
              this.getPostChart('spline');
            }

          }, 1000);
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }
  isdetailHide() {
    this.isdetailShow = false;
    if (this.isdetailShow === false) {
      $('.patient_card').removeClass('maximum')
    }
  }
  isdetailShows() {
    this.isdetailShow = true;
    if (this.isdetailShow = true) {
      $('.patient_card').addClass('maximum')
    }
    // else{
    //   $('.patient_card').removeClass('maximum')
    // }
  }

  dynamicChartData(type: any) {
    let vitaldata: any = {};

    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];


    this.PatientPreProcedureDuringVitalsList.forEach((element: any, index: any) => {

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
        type: type,
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

  dynamicPostChartData(type: any) {
    let vitaldata: any = {};

    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];


    this.PatientPreProcedurePostVitalsList.forEach((element: any, index: any) => {

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

    const chart = Highcharts.chart('chart-postline', {
      chart: {
        type: type,
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

  fetchDiagnosis() {
    this.con.fetchAdviceDiagnosis(this.admissionID, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          this.PatientDiagnosisList = response.PatientDiagnosisDataList;
          var diag = "";
          response.PatientDiagnosisDataList.forEach((element: any, index: any) => {
            if (diag != "")
              diag = diag + "\n" + response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
            else
              diag = response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
          });
          this.endoScopyForm.get('Diagnosis')?.setValue(diag);
        }
      },
        (err) => {

        })
  }

  addVitals() {
    $("#vitalsModal").modal('show');
    this.clearVital();
  }
  toggleConsciousSedation(type: string) {
    this.ConsciousSedation = type === '1' ? true : false;
  }

  changeCaseSheetView() {
    if (!$('#divCaseSheet').hasClass('mini_casesheet')) {
      // $('#divCaseSheet').removeClass("casesheet_div");
      $('#divCaseSheet').addClass("mini_casesheet");
    }
    else {
      $('#divCaseSheet').removeClass("mini_casesheet");
      // $('#divCaseSheet').addClass("casesheet_div");
    }
  }

  clearVital() {
    this.IsVitalDisplay = false;
    setTimeout(() => {
      this.IsVitalDisplay = true;
    }, 0);
  }

  receivedData(data: { vitalData: any, remarksData: any }) {
    this.tableVitals = data.vitalData;
    this.recordRemarks = data.remarksData;
  }

  saveVitals() {
    let find = this.tableVitals.filter((x: any) => x?.PARAMVALUE === null);
    let bpsys = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP -Systolic");
    let bpdia = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP-Diastolic");
    let temp = this.tableVitals.filter((x: any) => x?.PARAMETER === "Temperature");
    let remarksEntered = true;
    if (bpsys[0].PARAMVALUE === null || bpsys[0].PARAMVALUE === "" || bpdia[0].PARAMVALUE === null || bpdia[0].PARAMVALUE === "" || temp[0].PARAMVALUE === null || temp[0].PARAMVALUE === "") {
      this.showVitalsValidation = true;
    } else {
      this.VsDetails = [];
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
        this.VsDetails.push({
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
        "PatientPreprocAssID": this.PatientPreprocAssID,
        "PatientID": this.selectedView.PatientID,
        "Admissionid": this.selectedView.IPID,
        "BedID": this.selectedView.BedID,
        "IsVitalSave": 1,
        "PreprocedureType": this.PreprocedureType,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "PatientType": this.selectedView.PatientType,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID,
        "Hospitalid": this.hospId,
        "VSPreVitals": this.VsDetails
      };

      this.config.savePatientPreProcedureAssessments(payload).subscribe(response => {
        if (response.Code == 200) {
          $("#saveVitalsMsg").modal('show');
          $("#vitalsModal").modal('hide');
          //this.patientPreProcedureAssessments();
          outOfRangeParameters.forEach(parameter => {
            const index = this.tableVitals.findIndex((element: any) => element.PARAMETER === parameter);
            this.recordRemarks.delete(index);
          });
        }
      })
      this.showParamValidationMessage = false;
    }
  }

  assignProcedure(input: any) {
    this.PreprocedureType = input;
  }

  searchItem(event: any) {
    if (event.target.value.length >= 3) {
      this.config.fetchEndoDrugs(event.target.value, this.hospId).subscribe(
        (results) => {
          this.FetchEndoDrugsDataList = results.FetchEndoDrugsDataList;
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
    }

  }

  onItemSelected(item: any) {
    this.FetchEndoDrugsDataList = [];
    var itemId = item.ItemID;
    this.clearDrug();
    this.config.fetchEndoDrugSelected(itemId, this.hospId).subscribe((response) => {
      if (response.Code === 200) {
        var DrugID: any = item.ItemID;
        var RouteName = '';
        var RouteID = '-100';
        var DrugDoseUomID: any = '-100';
        var DrugDose = '';
        var DrugName = item.DisplayName;
        var UOMName = '';

        if (response.FetchEndoDrugSelectedDataList.length > 0) {
          DrugName = response.FetchEndoDrugSelectedDataList[0].DisplayName;
          DrugID = response.FetchEndoDrugSelectedDataList[0].ItemID;
        }

        if (response.FetchEndoDrugRouteofAdminDataList.length > 0) {
          RouteName = response.FetchEndoDrugRouteofAdminDataList[0].RouteName;
          RouteID = response.FetchEndoDrugRouteofAdminDataList[0].RouteID;
        }
        if (response.FetchEndoDrugDoseDataList.length > 0) {
          DrugDoseUomID = response.FetchEndoDrugDoseDataList[0].DrugDoseUomID;
          DrugDose = response.FetchEndoDrugDoseDataList[0].DrugDose;

          var filteredData = this.DoseUOMEndoDataList.filter((x: any) => x?.UomID === DrugDoseUomID);

          if (filteredData.length > 0) {
            UOMName = filteredData[0].UoM;
          }
        }
        this.drugForm.patchValue({
          DrugID: DrugID,
          DrugName: DrugName,
          Dose: DrugDose,
          UOM: DrugDoseUomID,
          UOMName: UOMName,
          AdminRouteID: RouteID,
          AdminRoute: RouteName
        });
      }
    },
      (err) => {

      })

  }

  addDrug() {
    const itemFormGroup = this.fb.group({
      DrugID: this.drugForm.get("DrugID").value,
      DrugName: this.drugForm.get("DrugName").value,
      Dose: this.drugForm.get("Dose").value,
      UOM: this.drugForm.get("UOM").value,
      UOMName: this.drugForm.get("UOMName").value,
      AdminRouteID: this.drugForm.get("AdminRouteID").value,
      AdminRoute: this.drugForm.get("AdminRoute").value,
      DrugDate: new Date(),
      Time: '00:00',
      Effects: "-100",
      PrePost: "-100",
      DoctorNote: ''
    })
    this.items.push(itemFormGroup);
    this.clearDrug();
  }

  updateDrug() {
    const selectedItem = this.items.at(this.editIndex);

    selectedItem.patchValue({
      DrugID: this.drugForm.get("DrugID").value,
      DrugName: this.drugForm.get("DrugName").value,
      Dose: this.drugForm.get("Dose").value,
      UOM: this.drugForm.get("UOM").value,
      UOMName: this.drugForm.get("UOMName").value,
      AdminRouteID: this.drugForm.get("AdminRouteID").value,
      AdminRoute: this.drugForm.get("AdminRoute").value,
    });

    this.clearDrug();
  }

  editDrug(item: any, index: any) {
    this.editIndex = index;
    this.IsEdit = true;
    this.drugForm.patchValue({
      DrugID: item.value.DrugID,
      DrugName: item.value.DrugName,
      Dose: item.value.Dose,
      UOM: item.value.UOM,
      UOMName: item.value.UOMName,
      AdminRouteID: item.value.AdminRouteID,
      AdminRoute: item.value.AdminRoute
    });
  }

  clearDrug() {
    this.IsEdit = false;
    this.drugForm.reset();
    this.drugForm.patchValue({
      UOM: '-100',
      AdminRouteID: '-100'
    });
  }

  fetchEndoDrugEffects() {
    this.config.fetchEndoDrugEffects(this.hospId).subscribe(
      (results) => {
        this.EffectsList = results.FetchAdverseDrugDataList;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  fetchEndoDrugPrePost() {
    this.config.fetchEndoDrugPrePost(this.hospId).subscribe(
      (results) => {
        this.PrePostList = results.FetchAdverseDrugDataList;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  doseChange(item: any) {
    var filteredData = this.DoseUOMEndoDataList.filter((x: any) => x?.UomID === item.target.value);
    this.drugForm.patchValue({
      UOM: filteredData[0].UomID,
      UOMName: filteredData[0].UoM
    });
  }

  routeChange(item: any) {
    var filteredData = this.SurgeryDemographicsDataaList.filter((x: any) => x?.Id === item.target.value);
    this.drugForm.patchValue({
      AdminRouteID: filteredData[0].Id,
      AdminRoute: filteredData[0].Names
    });
  }

  deleteDrug(index: any) {
    this.items.removeAt(index);
  }

  addIntake() {
    const itemFormGroup = this.fb.group({
      Name: ''
    })
    this.intakeitems.push(itemFormGroup);
  }

  deleteIntake(index: any) {
    this.intakeitems.removeAt(index);
  }

  addOutput() {
    const itemFormGroup = this.fb.group({
      Name: ''
    })
    this.outputitems.push(itemFormGroup);
  }

  deleteOutput(index: any) {
    this.outputitems.removeAt(index);
  }

  addProcedure() {
    const itemFormGroup = this.fb.group({
      StartNote: '',
      StartDate: new Date(),
      StartTime: '00:00',
      EndNote: '',
      EndDate: new Date(),
      EndTime: '00:00'
    })
    this.procedureitems.push(itemFormGroup);
  }

  deleteProcedure(index: any) {
    this.procedureitems.removeAt(index);
  }

  addAnesthesia() {
    const itemFormGroup = this.fb.group({
      StartNote: '',
      StartDate: new Date(),
      StartTime: '00:00',
      EndNote: '',
      EndDate: new Date(),
      EndTime: '00:00'
    })
    this.anesthesiaitems.push(itemFormGroup);
  }

  deleteAnesthesia(index: any) {
    this.anesthesiaitems.removeAt(index);
  }

  fetchEndoDoctor(event: any) {
    if (event.target.value.length >= 3) {
      this.config.fetchEndoscopyDoctor(event.target.value, this.hospId).subscribe(
        (results) => {
          this.endoDoctorList = results.FetchRODNursesDataList;
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
    }

  }

  onEndoDoctorItemSelected(item: any) {
    this.endoScopyForm.get('DoctorSignatureID').setValue(item.EmpNoFullname);
    this.DoctorSignatureID = item.Empid;
    this.endoDoctorList = [];
  }

  fetchEndoNurse(event: any) {
    if (event.target.value.length >= 3) {
      this.config.fetchEndoscopyNurse(event.target.value, this.hospId).subscribe(
        (results) => {
          this.endoNurseList = results.FetchRODNursesDataList;
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
    }

  }

  onEndoNurseItemSelected(item: any) {
    this.endoScopyForm.get('NurseSignatureID').setValue(item.EmpNoFullname);
    this.NurseSignatureID = item.Empid;
    this.endoNurseList = [];
  }

  fetchAnesDoctor(event: any) {
    if (event.target.value.length >= 3) {
      this.config.fetchEndoscopyAnesthesiologist(event.target.value, this.hospId).subscribe(
        (results) => {
          this.anesDoctorList = results.FetchRODNursesDataList;
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
    }

  }

  onAnesDoctorItemSelected(item: any) {
    this.endoScopyForm.get('AnesthesiaDoctorSignatureID').setValue(item.EmpNoFullname);
    this.AnesthesiaDoctorSignatureID = item.Empid;
    this.anesDoctorList = [];
  }

  fetchAnesNurse(event: any) {
    if (event.target.value.length >= 3) {
      this.config.fetchEndoscopyNurse(event.target.value, this.hospId).subscribe(
        (results) => {
          this.anesNurseList = results.FetchRODNursesDataList;
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
    }

  }

  onAnesNurseItemSelected(item: any) {
    this.endoScopyForm.get('AnesthesiaNurseSignatureID').setValue(item.EmpNoFullname);
    this.AnesthesiaNurseSignatureID = item.Empid;
    this.anesNurseList = [];
  }

  saveEndoScopy() {
    this.errorMessages = [];

    if (this.SSNPatientVisitsDataList.length === 0 || !this.endoScopyForm.get('AdmissionID').value || Number(this.endoScopyForm.get('AdmissionID').value) === 0) {
      this.errorMessages.push("Visit is required");
    }

    if (!this.endoScopyForm.get('DoctorSignatureID').value) {
      this.errorMessages.push("Doctor Signature is required");
    }

    if (!this.endoScopyForm.get('AnesthesiaDoctorSignatureID').value&&this.ConsciousSedation == true) {
      this.errorMessages.push("Anesthesia Doctor Signature is required");
    }

    if (!this.endoScopyForm.get('NurseSignatureID').value) {
      this.errorMessages.push(this.errorMessage = "Scrub Nurse is required");
    }

    if (!this.endoScopyForm.get('AnesthesiaNurseSignatureID').value) {
      this.errorMessages.push(this.errorMessage = "Circulating  Nurse is required");
    }

    if (this.errorMessages.length > 0) {
      $("#errorMsg").modal('show');
      return;
    }

    var assessmentItems: any = [];
    var inTakeOutTake: any = [];
    var performedXML: any = [];
    var sequence = 1;

    this.drugTableForm.value.items.forEach((element: any) => {
      let assessment = {
        "PPAIID": element.PPAIID ? element.PPAIID : "",
        "IID": element.DrugID,
        "DOSE": element.Dose,
        "DOSEID": element.UOM,
        "ARID": element.AdminRouteID,
        "TIME": this.datepipe.transform(element.DrugDate, "dd-MMM-yyyy")?.toString() + " " + element.Time,
        "EID": element.Effects,
        "RMK": element.DoctorNote,
        "PPST": element.PrePost
      }
      assessmentItems.push(assessment);
    });

    this.intakeForm.value.items.forEach((element: any) => {
      if (element.Name) {
        let inOut = {
          "INID": element.INID ? element.INID : "",
          "IOV": element.Name,
          "ISINT": "1"
        }
        inTakeOutTake.push(inOut);
      }

    });

    this.outputForm.value.items.forEach((element: any) => {
      if (element.Name) {
        let inOut = {
          "INID": element.INID ? element.INID : "",
          "IOV": element.Name,
          "ISINT": "0"
        }

        inTakeOutTake.push(inOut);
      }
    });

    this.procedureForm.value.procedureitems.forEach((element: any) => {
      if (element.StartNote) {
        let performed = {
          "PERID": element.PERID ? element.PERID : "",
          "SEQID": sequence,
          "ISO": "1",
          "PNOTE": element.StartNote,
          "PST": this.datepipe.transform(element.StartDate, "dd-MMM-yyyy")?.toString() + " " + element.StartTime,
          "PED": this.datepipe.transform(element.EndDate, "dd-MMM-yyyy")?.toString() + " " + element.EndTime,
          "PRMK": element.EndNote
        }
        sequence = sequence + 1;
        performedXML.push(performed);
      }
    });

    this.anesthesiaForm.value.items.forEach((element: any) => {
      if (element.StartNote) {
        let performed = {
          "PERID": element.PERID ? element.PERID : "",
          "SEQID": sequence,
          "ISO": "2",
          "PNOTE": element.StartNote,
          "PST": this.datepipe.transform(element.StartDate, "dd-MMM-yyyy")?.toString() + " " + element.StartTime,
          "PED": this.datepipe.transform(element.EndDate, "dd-MMM-yyyy")?.toString() + " " + element.EndTime,
          "PRMK": element.EndNote
        }
        sequence = sequence + 1;
        performedXML.push(performed);
      }
    });

    let payload = {
      "PatientPreprocAssID": this.PatientPreprocAssID,
      "PatientID": this.selectedView.PatientID,
      "Admissionid": this.selectedView.IPID,
      "BedID": this.selectedView.BedID,
      "Conscious": this.endoScopyForm.get('Conscious').value ? 1 : 0,
      "Drowsy": this.endoScopyForm.get('Drowsy').value ? 1 : 0,
      "Comatose": this.endoScopyForm.get('Comatose').value ? 1 : 0,
      "Comments": this.endoScopyForm.get('Comments').value,
      "Diagnosis": this.endoScopyForm.get('Diagnosis').value,
      "GlascowScale": this.endoScopyForm.get('GlascowScale').value,
      "ECGDuringproc": this.endoScopyForm.get('ECGDuringproc').value,
      "SkinIntegrityDuringproc": this.endoScopyForm.get('SkinIntegrityDuringproc').value,
      "ECGPostgproc": this.endoScopyForm.get('ECGPostgproc').value,
      "SkinIntegrityPostproc": this.endoScopyForm.get('SkinIntegrityPostproc').value,
      "DoctorNote": this.endoScopyForm.get('DoctorNote').value,
      "OrdersO2Mask": this.endoScopyForm.get('OrdersO2Mask').value,
      "OrdersIV": this.endoScopyForm.get('OrdersIV').value,
      "OrdersAT": this.endoScopyForm.get('OrdersAT').value,
      "IsAntiemetics": this.endoScopyForm.get('IsAntiemetics').value ? 1 : 0,
      "AntiemeticsRemarks": this.endoScopyForm.get('AntiemeticsRemarks').value,
      "IsAnalgesic": this.endoScopyForm.get('IsAnalgesic').value ? 1 : 0,
      "AnalgesicRemarks": this.endoScopyForm.get('AnalgesicRemarks').value,
      "IsAnexate": this.endoScopyForm.get('IsAnexate').value ? 1 : 0,
      "AnexateRemarks": this.endoScopyForm.get('AnexateRemarks').value,
      "DischargeNote": this.endoScopyForm.get('DischargeNote').value,
      "IsFitForDischarge": Number(this.endoScopyForm.get('IsFitForDischarge').value),
      //"DoctorSignatureID": this.endoScopyForm.get('DoctorSignatureID').value,
      "DoctorSignatureID": this.DoctorSignatureID,
      //"NurseSignatureID": this.endoScopyForm.get('NurseSignatureID').value,
      "NurseSignatureID": this.NurseSignatureID,
      // "AnesthesiaDoctorSignatureID": this.endoScopyForm.get('AnesthesiaDoctorSignatureID').value,
      // "AnesthesiaNurseSignatureID": this.endoScopyForm.get('AnesthesiaNurseSignatureID').value,
      "AnesthesiaDoctorSignatureID": this.AnesthesiaDoctorSignatureID==""?0:this.AnesthesiaDoctorSignatureID,
      "AnesthesiaNurseSignatureID": this.AnesthesiaNurseSignatureID,
      "IsVitalSave": 0,
      "DoctorID": this.doctorDetails[0].EmpId,
      "SpecialiseID": this.selectedView.SpecialiseID,
      "PatientType": this.selectedView.PatientType,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID,
      "Hospitalid": this.hospId,
      "VSPreVitals": this.VsDetails,
      "AssessmentItemXML": assessmentItems,
      "InTakeOutTakeXML": inTakeOutTake,
      "PerformedXML": performedXML,
      "AnesthesiaPerformed": this.ConsciousSedation == true ? 1 : 0,
      "EndoscopyDocSignature": this.endoScopyForm.get('EndoscopyDocSignature')?.value,
      "AnesthesiologistDocSignature": this.endoScopyForm.get('AnesthesiologistDocSignature')?.value
    }

    this.config.savePatientPreProcedureAssessmentsMain(payload).subscribe(response => {
      if (response.Code == 200) {
        $("#saveMsg").modal('show');
        this.patientPreProcedureAssessments();
      }
    })
  }

  convertTo24HourFormat(time12: string): string {
    const date = new Date(`2000-01-01 ${time12}`);
    return this.datePipe.transform(date, 'HH:mm') || '';
  }

  getChart(type: any) {
    this.duringactiveButton = type;
    this.dynamicChartData(type);
  }

  getPostChart(type: any) {
    this.postactiveButton = type;
    this.dynamicPostChartData(type);
  }

  clear(type: any) {

    this.initializeForm();
    this.fetchDiagnosis();
    this.drugTableForm = this.fb.group({
      items: this.fb.array([])
    });

    this.intakeForm = this.fb.group({
      items: this.fb.array([])
    });

    this.outputForm = this.fb.group({
      items: this.fb.array([])
    });

    this.procedureForm = this.fb.group({
      procedureitems: this.fb.array([])
    });

    this.anesthesiaForm = this.fb.group({
      items: this.fb.array([])
    });

    this.addIntake();
    this.addOutput();
    this.addProcedure();
    this.addAnesthesia();
    this.PatientPreProcedureDuringVitalsList = [];
    this.PatientPreProcedurePostVitalsList = [];
    this.PatientPreProcedurePreVitalsList = [];

    this.DoctorSignatureID = "";
    this.NurseSignatureID = "";
    this.AnesthesiaDoctorSignatureID = "";
    this.AnesthesiaNurseSignatureID = "";

    this.VsDetails = [];
    if (type === "N") {
      this.PatientPreprocAssID = 0;
    }

    this.endoScopyForm.get('AdmissionID')?.setValue(this.admissionID);

    setTimeout(() => {
      if (this.PatientPreProcedureDuringVitalsList.length > 0) {
        this.getChart('spline');
      }

      if (this.PatientPreProcedurePostVitalsList.length > 0) {
        this.getPostChart('spline');
      }

    }, 1000);

    this.clearR2Signature();
    this.clearR3Signature();
  }

  fetchPatientEndoTotalRequest() {
    this.config.patientEndoTotalRequest(this.selectedView.IPID, this.hospId).subscribe(
      (results) => {
        this.PatientEndoTotalRequestDataList = results.PatientEndoTotalRequestDataList;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  showRequests() {
    this.fetchPatientEndoTotalRequest();
    $("#requestModal").modal('show');
  }


  patientPreProcedureAssessmentData(ID: any) {
    this.config.patientPreProcedureAssessmentData(ID, this.hospId).subscribe(
      (results) => {
        if (results.Code == 200) {
          this.anesthesiaitems.clear();
          this.procedureitems.clear();
          this.outputitems.clear();
          this.intakeitems.clear();
          this.items.clear();

          this.EndoScopyResults = results;
          this.PatientPreProcedurePreVitalsList = results.PatientPreProcedurePreVitalsList;
          this.PatientPreProcedureDuringVitalsList = results.PatientPreProcedureDuringVitalsList;
          this.PatientPreProcedurePostVitalsList = results.PatientPreProcedurePostVitalsList;
          this.PatientPreProcedureAssessmentsDataList = results.PatientPreProcedureAssessmentsDataList[0];
          this.PatientPreprocAssID = this.PatientPreProcedureAssessmentsDataList.PatientPreprocAssID;

          this.toggleConsciousSedation(this.PatientPreProcedureAssessmentsDataList.AnesthesiaPerformed);
          if (results.PatientPreProcedurePreVitalsList.length > 0) {
            this.endoScopyForm.patchValue({
              BPSystolic: this.PatientPreProcedurePreVitalsList.Systolic,
              BPDiastolic: this.PatientPreProcedurePreVitalsList.Diastolic,
              RR: this.PatientPreProcedurePreVitalsList.Respiration,
              PR: this.PatientPreProcedurePreVitalsList.Pulse,
              Temp: this.PatientPreProcedurePreVitalsList.Temparature,
              SP02: this.PatientPreProcedurePreVitalsList.SPO2
            });
          }

          if (results.PatientPreProcedureAssessmentsDataList[0]) {
            this.endoScopyForm.patchValue({
              Conscious: this.PatientPreProcedureAssessmentsDataList.Conscious === "True" ? true : false,
              Drowsy: this.PatientPreProcedureAssessmentsDataList.Drowsy === "True" ? true : false,
              Comatose: this.PatientPreProcedureAssessmentsDataList.Comatose === "True" ? true : false,
              GlascowScale: this.PatientPreProcedureAssessmentsDataList.GlascowScale,
              Comments: this.PatientPreProcedureAssessmentsDataList.Comments,
              ECGDuringproc: this.PatientPreProcedureAssessmentsDataList.ECGDuringproc,
              SkinIntegrityDuringproc: this.PatientPreProcedureAssessmentsDataList.SkinIntegrityDuringproc,
              ECGPostgproc: this.PatientPreProcedureAssessmentsDataList.ECGPostgproc,
              SkinIntegrityPostproc: this.PatientPreProcedureAssessmentsDataList.SkinIntegrityPostproc,
              DoctorNote: this.PatientPreProcedureAssessmentsDataList.DoctorNote,
              OrdersO2Mask: this.PatientPreProcedureAssessmentsDataList.OrdersO2Mask,
              OrdersIV: this.PatientPreProcedureAssessmentsDataList.OrdersIV,
              OrdersAT: this.PatientPreProcedureAssessmentsDataList.OrdersAT,
              IsAntiemetics: this.PatientPreProcedureAssessmentsDataList.IsAntiemetics,
              AntiemeticsRemarks: this.PatientPreProcedureAssessmentsDataList.AntiemeticsRemarks,
              IsAnalgesic: this.PatientPreProcedureAssessmentsDataList.IsAnalgesic,
              AnalgesicRemarks: this.PatientPreProcedureAssessmentsDataList.AnalgesicRemarks,
              IsAnexate: this.PatientPreProcedureAssessmentsDataList.IsAnexate,
              AnexateRemarks: this.PatientPreProcedureAssessmentsDataList.AnexateRemarks,
              DischargeNote: this.PatientPreProcedureAssessmentsDataList.DischargeNote,
              IsFitForDischarge: this.PatientPreProcedureAssessmentsDataList.IsFitForDischarge,

              DoctorSignatureID: this.PatientPreProcedureAssessmentsDataList.DoctorName,
              NurseSignatureID: this.PatientPreProcedureAssessmentsDataList.NurseName,
              AnesthesiaDoctorSignatureID: this.PatientPreProcedureAssessmentsDataList.AnesthesiaDoctorName,
              AnesthesiaNurseSignatureID: this.PatientPreProcedureAssessmentsDataList.AnesthesiaNurseName,

              EndoscopyDocSignature: this.PatientPreProcedureAssessmentsDataList.EndoscopyDocSignature,
              AnesthesiologistDocSignature: this.PatientPreProcedureAssessmentsDataList.AnesthesiologistDocSignature


            });
            this.base64StringSig2 = this.PatientPreProcedureAssessmentsDataList.EndoscopyDocSignature;
              this.base64StringSig3 = this.PatientPreProcedureAssessmentsDataList.AnesthesiologistDocSignature;


            this.DoctorSignatureID = this.PatientPreProcedureAssessmentsDataList.DoctorSignatureID;
            this.NurseSignatureID = this.PatientPreProcedureAssessmentsDataList.NurseSignatureID;
            this.AnesthesiaDoctorSignatureID = this.PatientPreProcedureAssessmentsDataList.AnesthesiaDoctorSignatureID;
            this.AnesthesiaNurseSignatureID = this.PatientPreProcedureAssessmentsDataList.AnesthesiaNurseSignatureID;
          }

          if (results.PatientPreProcedureMedicationList.length > 0) {
            results.PatientPreProcedureMedicationList.forEach((element: any, index: any) => {
              var filteredData = this.DoseUOMEndoDataList.filter((x: any) => x?.UoM === element.DoseUOM);
              var filterRoute = this.SurgeryDemographicsDataaList.filter((x: any) => x?.Names === element.AdmRoute);
              const itemFormGroup = this.fb.group({
                DrugID: element.ItemID,
                DrugName: element.ItemName,
                Dose: element.Dose,
                UOM: filteredData.length > 0 ? filteredData[0].UomID : 0,
                UOMName: element.DoseUOM,
                AdminRouteID: filterRoute.length > 0 ? filterRoute[0].Id : 0,
                AdminRoute: element.AdmRoute,
                DrugDate: new Date(element.FromDate),
                Time: this.convertTo24HourFormat(element.Time),
                Effects: element.AssessmentEffectID,
                PrePost: element.PrePost,
                DoctorNote: element.Remarks,
                PPAIID: element.PatientPreprocAssItemID
              })
              this.items.push(itemFormGroup);
            });
          }

          if (results.PatientPreProcedureOuttakeList.length > 0) {
            results.PatientPreProcedureOuttakeList.forEach((element: any, index: any) => {
              const itemFormGroup = this.fb.group({
                Name: element.InTakeOutTakeValue,
                INID: element.InTakeOutTakeID
              })
              this.intakeitems.push(itemFormGroup);
            });
          }

          if (results.PatientPreProcedureIntakeList.length > 0) {
            results.PatientPreProcedureIntakeList.forEach((element: any, index: any) => {
              const itemFormGroup = this.fb.group({
                Name: element.InTakeOutTakeValue,
                INID: element.InTakeOutTakeID
              })
              this.outputitems.push(itemFormGroup);
            });
          }

          if (results.PatientPreProcedureProcedureList.length > 0) {
            results.PatientPreProcedureProcedureList.forEach((element: any, index: any) => {
              const itemFormGroup = this.fb.group({
                PERID: element.PatientPreprocPerformedID,
                StartNote: element.PerformedNote,
                StartDate: new Date(element.PerformedStartDate),
                StartTime: this.convertTo24HourFormat(element.PerformedStartDateTime),
                EndNote: element.PerformedRemarks,
                EndDate: new Date(element.PerformedEndDate),
                EndTime: this.convertTo24HourFormat(element.PerformedEndDateTime)
              })
              this.procedureitems.push(itemFormGroup);
            });
          }

          if (results.PatientPreProcedureAnaesthesiaList.length > 0) {
            results.PatientPreProcedureAnaesthesiaList.forEach((element: any, index: any) => {
              const itemFormGroup = this.fb.group({
                PERID: element.PatientPreprocPerformedID,
                StartNote: element.PerformedNote,
                StartDate: new Date(element.PerformedStartDate),
                StartTime: this.convertTo24HourFormat(element.PerformedStartDateTime),
                EndNote: element.PerformedRemarks,
                EndDate: new Date(element.PerformedEndDate),
                EndTime: this.convertTo24HourFormat(element.PerformedEndDateTime)
              })
              this.anesthesiaitems.push(itemFormGroup);
            });
          }

          this.addIntake();
          this.addOutput();
          this.addProcedure();
          this.addAnesthesia();
          setTimeout(() => {
            if (this.PatientPreProcedureDuringVitalsList.length > 0) {
              this.getChart('spline');
            }

            if (this.PatientPreProcedurePostVitalsList.length > 0) {
              this.getPostChart('spline');
            }

          }, 1000);
          $("#requestModal").modal('hide');
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  toggleConscious(value: any) {
    this.endoScopyForm.patchValue({
      Conscious: !value,
    });
  }

  toggleDrowsy(value: any) {
    this.endoScopyForm.patchValue({
      Drowsy: !value,
    });
  }

  toggleComatose(value: any) {
    this.endoScopyForm.patchValue({
      Comatose: !value,
    });
  }

  toggleAntiemetics(value: any) {
    this.endoScopyForm.patchValue({
      IsAntiemetics: !value,
      AntiemeticsRemarks: ''
    });
  }

  toggleAnalgesic(value: any) {
    this.endoScopyForm.patchValue({
      IsAnalgesic: !value,
      AnalgesicRemarks: ''
    });
  }

  toggleAnexate(value: any) {
    this.endoScopyForm.patchValue({
      IsAnexate: !value,
      AnexateRemarks: ''
    });
  }
  tabclick(input: any) {
    this.childClickName = "";
    console.log(input);
    setTimeout(() => {
      this.childClickName = input;
    }, 500);
  }

  openQuickActions() {
    this.patinfo = this.selectedView;
    $("#quickaction_info1").modal('show');
  }
  clearPatientInfo() {
    this.patinfo = "";
  }
  closeModal() {
    $("#quickaction_info1").modal('hide');
  }

  toggleVte(type: any) {
    this.vteType = type;
  }
  navigateBackToRadiologyWorklist() {
    sessionStorage.removeItem("InPatientDetails");
    sessionStorage.setItem("FromRadiology", "false");
    this.router.navigate(['/suit/radiologyworklist']);
  }
  navigatetoLTCAU() {
    // sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    // sessionStorage.setItem("selectedView", JSON.stringify(item));
    // sessionStorage.setItem("selectedPatientAdmissionId", item.IPID);
    // sessionStorage.setItem("PatientID", item.PatientID);
    sessionStorage.setItem("FromBedBoard", "true");
    this.router.navigate(['/ward/longterm-adultcareunit']);
  }
  base64DoctorSignature(event: any) {
    this.endoScopyForm.patchValue({ EndoscopyDocSignature: event });
  }
  base641DoctorSignature(event: any) {
    this.endoScopyForm.patchValue({ AnesthesiologistDocSignature: event });
  }
  clearR2Signature() {
    if (this.signComponent2) {
      this.signComponent2.clearSignature();
      this.endoScopyForm.patchValue({ EndoscopyDocSignature: '' });
    }
  }
  clearR3Signature() {
    if (this.signComponent3) {
      this.signComponent3.clearSignature();
      this.endoScopyForm.patchValue({ AnesthesiologistDocSignature: '' });
    }
  }

  openBedTransfer() {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'pre_op_bedtransfer_modal'
    };
    const modalRef = this.modalService.openModal(BedTransfereRequestComponent, {
      data: "bedtransferrequest",
      readonly: true
    }, options);
  }

  searchProceduresPerformed(event: any) {
    if (event.target.value.length >= 3) {
      this.config.FetchHospitalServiceEndscopyItems(event.target.value, this.doctorDetails[0].UserId, this.facility.FacilityID, this.hospId).subscribe(
        (results) => {
          this.proceduresPerformedList = results.FetchHospitalServiceItemsCountList;
        },
        (error) => {
          console.error('Error fetching data:', error);
        }
      );
    }
  }

  onProcedurePerformedSelect(item: any) {
    this.addProcedure();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (sessionStorage.getItem("navigation") === 'AdmissionReconciliation') {
        document.getElementById('ad-tab-btn')?.click();
      }
      else if (sessionStorage.getItem("navigation") === 'VTEForms') {
        document.getElementById('vte-forms-btn')?.click();
      }
      sessionStorage.removeItem("navigation");
    });
  }
}
