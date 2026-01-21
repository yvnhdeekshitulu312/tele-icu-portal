import { Renderer2, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Injectable } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AppInjector } from 'src/app/services/app-injector.service';
import { ValidateEmployeeComponent } from '../validate-employee/validate-employee.component';
import { FormBuilder } from '@angular/forms';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { UtilityService } from '../utility.service';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { Observable, Subscription } from 'rxjs';
import { PatientAssessmentToolComponent } from 'src/app/ward/patient-assessment-tool/patient-assessment-tool.component';
import { GenericModalBuilder } from '../generic-modal-builder.service';
import { AllergyComponent } from '../allergy/allergy.component';
import { ReferralComponent } from '../referral/referral.component';
import { TemplateService } from '../template.service';
import { multipleSaveEnabledTemplates } from 'src/app/templates/template.utils';
import { ConfigService } from 'src/app/ward/services/config.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { LoaderService } from 'src/app/services/loader.service';
import { isOnlyDots } from 'src/app/app.utils';

declare var $: any;
@Injectable()
export abstract class DynamicHtmlComponent implements OnDestroy {

  tagIds: { id: string, value: string, userId?: string }[] = [];
  idValues: { [key: string]: string } = {};
  htmlShow: any;
  modalService: NgbModal;
  signatureList: any = [];
  signatureForm: any;
  formBuilder: any;
  urlcommon = '';
  urlcommonV = '';
  urlcommonP = '';
  commonservice: MedicalAssessmentService;
  utilityservice: UtilityService;
  tempService: TemplateService;
  templateConfigService: ConfigService;
  ms: GenericModalBuilder;
  patientData: any;
  ORPatientData: any;
  doctorData: any;
  hospitalID: any;
  FetcTemplateDefaultDataListM: any = [];
  defaultData: any;
  PatientsVitalsList: any;
  PatientsTemplateListData: any;
  PatientsTemplateListDataNN:any;
  bpSystolic: string = "";
  bpSysVal: string = "";
  bpDiastolic: string = "";
  bpDiaVal: string = "";
  temperature: string = "";
  tempVal: string = "";
  pulse: string = "";
  pulseVal: string = "";
  spo2: string = "";
  respiration: string = "";
  consciousness: string = "";
  o2FlowRate: string = "";
  errorMessages: any = [];
   errorMessagesF: any = [];
  facility: any;
  data$!: Observable<any[]>;
  urlDefault = '';
  dropdownItems = [
    { id:1, score: 0, image: 'assets/images/image1.png', text: 'No Hurt' },
    { id:2, score: 2, image: 'assets/images/image2.png', text: 'Hurts Little Bit' },
    { id:3, score: 4, image: 'assets/images/image3.png', text: 'Hurts Little More' },
    { id:4, score: 6, image: 'assets/images/image4.png', text: 'Hurts Even More' },
    { id:5, score: 8, image: 'assets/images/image5.png', text: 'Hurts Whole A Lot' },
    { id:6, score: 10, image: 'assets/images/image6.png', text: 'Hurts Worst' }
  ];
  minDate = new Date();
  isOthersSelected: { [key: string]: boolean } = {};

  subscription: Subscription;
  timerData: any = [];
  fromShared = false;
  isDotsPresent: boolean = false;

  dataChangesMap: { [key: string]: string } = {};

  doctorsList: any = [];
  socialWorkersList: any = [];
  nursesList: any = [];
  printerService: LoaderService;
  signarureNameCollection: any = [];
  defaultDataReady: boolean = false;

  constructor(private renderer: Renderer2, private el: ElementRef, private cdr: ChangeDetectorRef) {
    const injector = AppInjector.getInjector();
    this.modalService = injector.get<NgbModal>(NgbModal);
    this.formBuilder = injector.get<FormBuilder>(FormBuilder);
    this.commonservice = injector.get<MedicalAssessmentService>(MedicalAssessmentService);
    this.utilityservice = injector.get<UtilityService>(UtilityService);
    this.tempService = injector.get<TemplateService>(TemplateService);
    this.templateConfigService = injector.get<ConfigService>(ConfigService);
    this.printerService = injector.get<LoaderService>(LoaderService);

    this.subscription = this.tempService.getMessage().subscribe(message => {
      if(message) {
        this.fromShared = true;
      }
    });

    
    this.ms = injector.get<GenericModalBuilder>(GenericModalBuilder);
    this.patientData = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorData = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    if (sessionStorage.getItem("otpatient") != 'undefined')
      this.ORPatientData = JSON.parse(sessionStorage.getItem("otpatient") || '{}');

    this.hospitalID = sessionStorage.getItem("hospitalId");
    this.signatureForm = this.formBuilder.group({
      Signature1: [''],
      Signature2: [''],
      Signature3: [''],
      Signature4: [''],
      Signature5: [''],
      Signature6: [''],
      Signature7: [''],
      Signature8: [''],
      Signature9: [''],
      Signature10: [''],
      Signature11: [''],
      Signature12: [''],
      Signature13: [''],
      Signature14: [''],
    });

    if(!this.fromShared) {
     this.fetchDefaults();
    }
  }

  ngOnDestroy() {
    this.tempService.sendMessage("");
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  addToDataChangesMap(id: string) {
    const currentTemplateId = sessionStorage.getItem('currentTemplateId');
    if (multipleSaveEnabledTemplates.includes(Number(currentTemplateId))) {
      this.dataChangesMap[id] = this.doctorData[0].EmpId;
    }
  }

  removeFromDataChangesMap(id: string) {
    delete this.dataChangesMap[id];
  }

  findSignatureIds() {
    const keys = Object.keys(this.signatureForm.value);
    keys.forEach(key => {
      if(this.signatureForm.get(key).value && this.dataChangesMap[key]) {
        this.tagIds.push({
          id: key,
          value: '',
          userId: this.dataChangesMap[key]
        })
      }
    });
  }
  

  findHtmlTagIds(divcontent: ElementRef, requiredFields?: any): any {
    this.errorMessages = [];
    this.signarureNameCollection.forEach((element: any) => {
      if ($(`#${element.nameId}`).val() && !this.signatureForm.get(element.signatureId)?.value) {
        this.errorMessages.push({
          message: element.signatureMessage
        });
      }
      if (!$(`#${element.nameId}`).val() && this.signatureForm.get(element.signatureId)?.value) {
        this.errorMessages.push({
          message: element.nameMessage
        });
      }
    });
    if (this.errorMessages.length > 0) {
      const options: NgbModalOptions = {
        windowClass: 'ngb_error_modal'
      };
      const modalRef = this.modalService.open(ErrorMessageComponent, options);
      modalRef.componentInstance.errorMessages = this.errorMessages;
      modalRef.componentInstance.showCheckbox = false;
      modalRef.componentInstance.dataChanged.subscribe((data: string) => {
        modalRef.close();
      });
      return;
    }

    this.tagIds = [];
    this.idValues = {};
    this.errorMessages = [];
    this.isDotsPresent = false;
    const tempDiv = this.renderer.createElement('div');
    this.renderer.setProperty(tempDiv, 'innerHTML', divcontent.nativeElement.innerHTML);
    this.findSignatureIds();
    this.traverseElements(tempDiv, requiredFields);
    this.renderer.removeChild(this.el.nativeElement, tempDiv);
    if (this.isDotsPresent) {
      this.errorMessages.push({
        message: 'Please Enter Proper Text'
      });
    }
    if (this.errorMessages.length > 0) {
      // const modalRef = this.modalService.open(ErrorMessageComponent);
      const options: NgbModalOptions = {
        windowClass: 'ngb_error_modal'
      };
      const modalRef = this.modalService.open(ErrorMessageComponent, options);
      modalRef.componentInstance.errorMessages = this.errorMessages;
      modalRef.componentInstance.dataChanged.subscribe((data: string) => {
        modalRef.close();
      });
      return;
    }
    else {
      return this.tagIds;
    }

  }

  fetchDefaults() {
    let AdmissionID = this.patientData.AdmissionID == undefined ? this.ORPatientData.AdmissionID : this.patientData.AdmissionID;
    if (this.patientData.isNursingChecklist) {
      //AdmissionID = this.patientData.AdmissionReqAdmissionid;
      if(this.patientData.AdmissionReqAdmissionid=='' || this.patientData.AdmissionReqAdmissionid === undefined)
        AdmissionID=this.patientData.AdmissionID;
      else 
      AdmissionID=this.patientData.AdmissionReqAdmissionid;
    }


    if(!AdmissionID) {
      AdmissionID = this.patientData.IPAdmissionID;
    }

    if(!AdmissionID) {
      AdmissionID = this.patientData.IPID;
    }

    this.urlcommon = this.commonservice.getData(otPatientDetails.FetchTemplateDefaultData, { AdmissionID, PatientId: this.patientData.PatientID == undefined ? this.ORPatientData.PatientID : this.patientData.PatientID, UserID: this.doctorData[0].UserId, WorkStationID: 3403, HospitalID: this.hospitalID });
    this.urlDefault = this.commonservice.getData(otPatientDetails.FetchPatientDataEFormsDataList, { AdmissionID, WorkStationID: 3403, HospitalID: this.hospitalID });
    this.data$ = this.utilityservice.getMultipleData([this.urlcommon, this.urlDefault]);
    this.data$.subscribe(
      data => {
        if(data[0]) {
          this.defaultData = data;
          this.FetcTemplateDefaultDataListM = data[0].FetcTemplateDefaultDataListM;
          this.PatientsVitalsList = data[0].PatientSummaryVitalsDataList;
         this.PatientsTemplateListData = data[0].FetchPatientsTemplateListData;
         this.PatientsTemplateListDataNN = data[1].FetchPatientDataEFormsDataList;
  
          var bpsys = this.PatientsVitalsList.find((x: any) => x.Vital == "BP -Systolic");
          this.bpSystolic = bpsys === undefined ? '' : bpsys.Value;
          var bpdia = this.PatientsVitalsList.find((x: any) => x.Vital == "BP-Diastolic");
          this.bpDiastolic = bpdia === undefined ? '' : bpdia.Value;
          var temp = this.PatientsVitalsList.find((x: any) => x.Vital == "Temperature");
          this.temperature = temp === undefined ? '' : temp.Value;
          var pulse = this.PatientsVitalsList.find((x: any) => x.Vital == "Pulse");
          this.pulse = pulse === undefined ? '' : pulse.Value;
          var spo2 = this.PatientsVitalsList.find((x: any) => x.Vital == "SPO2");
          this.spo2 = spo2 === undefined ? '' : spo2.Value;
          var respiration = this.PatientsVitalsList.find((x: any) => x.Vital == "Respiration");
          this.respiration = respiration === undefined ? '' : respiration.Value;
          var consciousness = this.PatientsVitalsList.find((x: any) => x.Vital == "Consciousness");
          this.consciousness = consciousness === undefined ? '' : consciousness.Value;
          var o2FlowRate = this.PatientsVitalsList.find((x: any) => x.Vital == "O2 Flow Rate");
          this.o2FlowRate = o2FlowRate === undefined ? '' : o2FlowRate.Value;
          const dateTimeString = data[1]?.FetchPatientDataEFormsDataList[0]?.DOB;//this.patientData.DOB;
          let datePart: any, timePart: any, adatePart: any, atimePart: any;
          if(dateTimeString) {
            datePart = dateTimeString?.split(" ")[0];
            timePart = dateTimeString?.split(" ")[1];
          }
          const adateTimeString = this.patientData.AdmitDate;
          if(adateTimeString) {
            adatePart = adateTimeString?.split(" ")[0];
            atimePart = adateTimeString?.split(" ")[1];
          }
          this.FetcTemplateDefaultDataListM = data[0].FetcTemplateDefaultDataListM.map((item: any) => ({
            id_value_pairs: [
              { id: "txt_generic_ProvisionalDiagnosis", value: item.ProvisionalDiagnosis },
              { id: "txt_generic_FinalDiagnosis", value: item.FinalDiagnosis },
              { id: "textbox_diagnosis", value: item.FinalDiagnosis + item.ProvisionalDiagnosis },
              { id: "textarea_diagnosis", value: item.FinalDiagnosis + item.ProvisionalDiagnosis },
              { id: "text_DiagnosisAr", value: item.FinalDiagnosis + item.ProvisionalDiagnosis },
              { id: "txt_generic_ChiefComplaint", value: item.ChiefComplaint },
              { id: "txt_generic_Investigations", value: item.Investigations },
              { id: "txt_generic_Medications", value: item.Medications },
              { id: "txt_generic_Procedures", value: item.Procedures },
              { id: "txt_generic_ProceduresA", value: item.Procedures },
  
              { id: "textbox_bp", value: this.bpSystolic + "/" + this.bpDiastolic },
              { id: "textbox_temp", value: this.temperature },
              { id: "textbox_pulse", value: this.pulse },
              { id: "textbox_rr", value: this.respiration },
              { id: "textbox_o2", value: this.o2FlowRate },
  
              { id: "textbox_AdmitDate", value: this.patientData.AdmitDate ? adatePart : '' },
              { id: "textbox_FullAge", value: this.patientData.FullAge },
              { id: "textbox_DOB", value: datePart },
              { id: "textbox_DOBTime", value: timePart },
              { id: "textbox_DoctorName", value: this.patientData.DoctorName },
              { id: "textbox_Gender", value: this.patientData.Gender },
              { id: "textbox_Height", value: this.patientData.Height },
              { id: "textbox_Nationality", value: this.patientData.Nationality },
              { id: "textbox_PatientName", value: this.patientData.PatientName },
              { id: "textbox_LoginHospitalName", value: sessionStorage.getItem("locationName")},           
              { id: "textbox_SSN", value: this.patientData.SSN },
              { id: "textbox_RegCode", value: this.patientData.RegCode },
              { id: "textbox_Weight", value: this.patientData.Weight },              
              { id: "text_Ward", value: this.patientData?.Ward },
              { id: "textbox_NationalityA", value: this.patientData.Nationality },
              { id: "textbox_PatientNameA", value: this.patientData.PatientName },
              { id: "textbox_SSNA", value: this.patientData.SSN },
              
              { id: "txt_generic_Religion", value: this.PatientsTemplateListData[0]?.Religion },
              { id: "txt_generic_City", value: this.PatientsTemplateListData[0]?.City },
              { id: "textbox_generic_Address01", value: this.PatientsTemplateListData[0]?.Address01 },
              { id: "txt_generic_PhoneNo", value: this.PatientsTemplateListData[0]?.PhoneNo },
              { id: "txt_generic_MobileNo", value: this.PatientsTemplateListData[0]?.MobileNo },
              { id: "txt_generic_SSN", value: this.PatientsTemplateListData[0]?.SSN },
              { id: "txt_generic_ContactNameKin", value: this.PatientsTemplateListData[0]?.ContactName },
              { id: "txt_generic_ContRelation", value: this.PatientsTemplateListData[0]?.ContRelation },
              { id: "txt_generic_PPhoneNo", value: this.PatientsTemplateListData[0]?.PPhoneNo },
              { id: "txt_generic_ContAddress", value: this.PatientsTemplateListData[0]?.ContAddress },
              { id: "txt_generic_ISVIP", value: this.PatientsTemplateListData[0]?.ISVIP },
              { id: "txt_generic_DOB", value: this.PatientsTemplateListData[0]?.DOB },
              { id: "txt_generic_Nationality", value: this.PatientsTemplateListData[0]?.Nationality },
              { id: "txt_generic_MarStatus", value: this.PatientsTemplateListData[0]?.MarStatus },
              { id: "txt_generic_FullAge", value: this.PatientsTemplateListData[0]?.FullAge },
              { id: "txt_generic_PatientName", value: this.PatientsTemplateListDataNN[0]?.PatientName },
              { id: "txt_generic_PatientNameA", value: this.PatientsTemplateListDataNN[0]?.PatientName2l },
              { id: "txt_generic_ContPhoneNoKin", value: this.PatientsTemplateListData[0]?.ContPhoneNo }
            ]
          }));
        }

        if (data[1]) {
       
          const transformedData = data[1].FetchPatientDataEFormsDataList.map((item: any) => [
            { id: "ta_MainComplaint", value: item.ChiefComplaint },
            { id: "ta_HistoryofPresentIllness", value: item.HistoryofPresentIllness },
            { id: "txt_generic_PatientID", value: item.PatientID },
            { id: "txt_generic_PatientType", value: item.PatientType === 'IP' ? 'Inpatient' : 'Outpatient' },
            { id: "textbox_areaunit", value: item.Ward + ' / ' + item.BedName },
            { id: "textbox_DOBB", value: item.DOB  },
            { id: "textbox_hr", value: item.Pulse},
            { id: "textbox_o2sat", value: item.SPO2},
            { id: "textbox_PrimaryDocEmpNO", value: item.EMPNO},
            { id: "textbox_PrimaryDocFullName", value: item.Primarydoctor},
            { id: "textbox_PrimaryDocEmpNo", value: item.EMPNO},
            { id: "textbox_PrimaryDocFullNameEmpNo", value: item.EMPNO + ' - ' + item.Primarydoctor},
            { id: "text_Ward", value: item.Ward },
            { id: "text_bed", value: item.BedName },
            { id: "text_SERUMCREATININE", value: item.SERUMCREATININE },
            { id: "textbox_MothersName", value: item.MotherPatientName },
            { id: "textbox_MothersFileNumber", value: item.MotherSSN },
            { id: "textbox_BMI", value: item?.BMI },
            { id: "textbox_BSA", value: item?.BSA },
            { id: "textbox_LMP", value: item?.LMP },
            { id: "textbox_EDD", value: item?.EDD },
            { id: "textbox_Gravidity", value: item?.Gravidity },
            { id: "textbox_Parity", value: item?.Parity },
            { id: "textbox_Abortions", value: item?.Abortions },
            { id: "txt_generic_BloodGroup", value: item?.BloodGroup },

            { id: "txt_generic_BabyRegCode", value: item?.BabyRegCode },
            { id: "txt_generic_BabyPatientName", value: item?.BabyPatientName },
            { id: "txt_generic_BabyGenderID", value: item?.BabyGenderID },
            { id: "txt_generic_BabyGender", value: item?.BabyGender },
            { id: "txt_generic_BabyDOB", value: item?.BabyDOB },
            { id: "txt_generic_BabyAdmitDate", value: item?.BabyAdmitDate },
            { id: "txt_generic_BabyNationality", value: item?.BabyNationality },
            { id: "txt_generic_BabyHeight", value: item?.BabyHeight },
            { id: "txt_generic_BabyWeight", value: item?.BabyWeight },
            

          ]);
        
          if (this.FetcTemplateDefaultDataListM[0].id_value_pairs.push) {
            transformedData.forEach((subArray: any) => {
              this.FetcTemplateDefaultDataListM[0].id_value_pairs.push(...subArray);
            });
          } else {
            this.FetcTemplateDefaultDataListM = data[1].FetchPatientDataEFormsDataList.map((item: any) => ({
              id_value_pairs: [
                { id: "ta_MainComplaint", value: item.ChiefComplaint },
                { id: "ta_HistoryofPresentIllness", value: item.HistoryofPresentIllness },
                { id: "txt_generic_PatientID", value: item.PatientID },
                { id: "txt_generic_PatientType", value: item.PatientType === 'IP' ? 'Inpatient' : 'Outpatient' },
                { id: "textbox_areaunit", value: item.Ward + ' / ' + item.BedName },
                { id: "textbox_hr", value: item.Pulse},
                { id: "textbox_o2sat", value: item.SPO2},
                { id: "textbox_PrimaryDocEmpNO", value: item.EMPNO},
                { id: "textbox_PrimaryDocFullName", value: item.Primarydoctor},
                { id: "textbox_PrimaryDocFullNameEmpNo", value: item.EMPNO + ' - ' + item.Primarydoctor},
                { id: "text_bed", value: item.BedName },
              ]
            }));
          }

          if(data[1].FetchPatientDataEFormsDataList[0].AllergyData) {
            this.FetcTemplateDefaultDataListM[0].id_value_pairs.push(
              {
                id: "allergyDataDynamicDiv",
                value: data[1].FetchPatientDataEFormsDataList[0].AllergyData,
              }
            );
            this.FetcTemplateDefaultDataListM[0].id_value_pairs.push(
              {
                id: "generic_AlleryType",
                value: data[1].FetchPatientDataEFormsDataList[0].IsAllergy === "1" ? 'Yes' : 'No',
              }
            );
          }

          if(data[1].FetchPatientDataEFormsDataList[0].PrevIPAdmitDate) {
            this.FetcTemplateDefaultDataListM[0].id_value_pairs.push(
              {
                id: "txt_PreviousAdmissions",
                value: data[1].FetchPatientDataEFormsDataList[0].PrevIPAdmitDate==""?"No Previous Admission":data[1].FetchPatientDataEFormsDataList[0].PrevIPAdmitDate,
              }
            );
          }else{
            this.FetcTemplateDefaultDataListM[0].id_value_pairs.push(
              {
                id: "txt_PreviousAdmissions",
                value: "No Previous Admission",
              }
            );
          }


          if(data[1].FetchPatientDataEFormsDataList[0].PainScore) {
            this.FetcTemplateDefaultDataListM[0].id_value_pairs.push(
              {
                id: "textbox_PainScale",
                value: data[1].FetchPatientDataEFormsDataList[0].PainScore,
              }
            );
          }
          
          var pastsurgery = data[1].FetchPatientSurgeryDataEFormsDataList?.map((item: any) => item.SurgeryName)?.join(', ')
          if(pastsurgery) {
            this.FetcTemplateDefaultDataListM[0].id_value_pairs.push(
              {
                id: "ta_PastSurgicalHistory",
                value: pastsurgery,
              }
            );
          }

          var prevAdm = data[1].FetchPatientPrevAdmDiagnosisDataList?.map((item: any) => item.SurgeryName)?.join(', ')
          if(prevAdm) {
            this.FetcTemplateDefaultDataListM[0].id_value_pairs.push(
              {
                id: "ta_PastMedicalHistory",
                value: prevAdm,
              }
            );
          }

          var prevSurgical = data[1].FetchPatientPrevSuregryDataList?.map((item: any) => item.DiseaseName)?.join(', ')
          if(prevSurgical) {
            this.FetcTemplateDefaultDataListM[0].id_value_pairs.push(
              {
                id: "ta_PrevSurgicalHistory",
                value: prevSurgical==""?"No Previous Surgical History":prevSurgical,
              }
            );
          }else{
            this.FetcTemplateDefaultDataListM[0].id_value_pairs.push(
              {
                id: "ta_PrevSurgicalHistory",
                value: "No Previous Surgical History",
              }
            );
          }
        }
        this.defaultDataReady = true;
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }

  private traverseElements(element: HTMLElement, requiredFields?: any) {
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];

      const id = (child.getAttribute('id') ?? '') as string;
      if (id) {

        let value = '';
        const targetElement = document.getElementById(id);
        if (targetElement) {
          if (targetElement instanceof HTMLDivElement) {
            const selectedButton = child.querySelector('.selected');
            if (selectedButton) {
              value = selectedButton.textContent?.trim() ?? '';
            }
            else {
              const isActive = child.classList.contains('active');
              value = isActive ? 'true' : 'false';
            }
          }
          else if (targetElement instanceof HTMLInputElement) {
            value = targetElement.value;
          } else if (targetElement instanceof HTMLTextAreaElement) {
            value = targetElement.value;
          } else if (targetElement instanceof HTMLSelectElement) {
            value = targetElement.value;
          }
          else if (targetElement instanceof HTMLButtonElement) {
            value = targetElement.classList.contains('active') ? 'true' : 'false';
          } else {
            value = targetElement.innerText;
          }

          if (targetElement.classList.contains('ButtonScore')) {
            const imgElement = targetElement.querySelector('.imgpain') as HTMLImageElement;
            const pElement = targetElement.querySelector('.textpain') as HTMLParagraphElement;
            const divElement = targetElement.querySelector('.scorepain') as HTMLDivElement;
  
            const imgValue = imgElement ? imgElement.src : '';
            const pValue = pElement ? pElement.textContent?.trim() : '';
            const divValue = divElement ? divElement.textContent?.trim() : '';
  
            value = `${imgValue}$${pValue}$${divValue}`;
          }
        }
        if (requiredFields != undefined) {
          const requiredField = requiredFields.find((rf: any) => rf.id === id);
          if (requiredField && requiredField.required && !value.trim()) {
            this.errorMessages.push(requiredField);
          }
        }
        if (isOnlyDots(value)) {
          this.isDotsPresent = true;
        }
        let data: any = { id: id, value: value };
        if (this.dataChangesMap[id]) {
          data.userId = this.dataChangesMap[id];
        }
        this.tagIds.push(data);
      }

      if (child.children.length > 0) {
        this.traverseElements(child as HTMLElement, requiredFields);
      }
    }
  }

  toggleSelection(event: Event) {
    const button = event.target as HTMLElement;
    const parentDiv = button.parentElement;
    const buttons = parentDiv?.querySelectorAll('.btn');
    buttons?.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
  }

  toggleButtonSelection(event: Event) {
    const button = event.target as HTMLElement;
    const isActive = button.classList.contains('active');
    if (isActive) {
      button.classList.remove('active');
    } else {
      button.classList.add('active');
    }
  }
  selectItemNO(btn: string, item: any) {
    const button = $('#' + btn);
    if (button.length) {
      const imgElement = button.find('.imgpain');
      const pElement = button.find('.textpain');
      const divElement = button.find('.scorepain');

      if (imgElement.length) {
        imgElement.attr('src', item.image);
      }

      if (pElement.length) {
        pElement.text(item.text);
      }

      if (divElement.length) {
        divElement.text(item.score.toString());
      }

      if(Number(item.score) > 0) {
        const options: NgbModalOptions = {
          size: 'xl',
          windowClass: 'vte_view_modal'
        };
        // const modalRef = this.ms.openModal(PatientAssessmentToolComponent, {
        //   data: '',
        //   inputPainScore: item.id,
        //   readonly: false
        // }, options);
      }
    }
  }

  selectItem(btn: string, item: any) {
    const button = $('#' + btn);
    if (button.length) {
      const imgElement = button.find('.imgpain');
      const pElement = button.find('.textpain');
      const divElement = button.find('.scorepain');

      if (imgElement.length) {
        imgElement.attr('src', item.image);
      }

      if (pElement.length) {
        pElement.text(item.text);
      }

      if (divElement.length) {
        divElement.text(item.score.toString());
      }

      if(Number(item.score) > 0) {
        const options: NgbModalOptions = {
          size: 'xl',
          windowClass: 'vte_view_modal'
        };
        const modalRef = this.ms.openModal(PatientAssessmentToolComponent, {
          data: '',
          inputPainScore: item.id,
          readonly: false
        }, options);
      }
    }
  }

  toggleCheckboxSelection(event: Event) {
    const divElement = event.currentTarget as HTMLElement;
    if (divElement.classList.contains('active')) {
      divElement.classList.remove('active');
    } else {
      divElement.classList.add('active');
    }
  }

  unCheckboxSelection(id: string | string[]): void {
    if (Array.isArray(id)) {
      id.forEach(singleId => this.removeActiveClass(singleId));
    } else {
      this.removeActiveClass(id);
    }
  }

  private removeActiveClass(id: string): void {
    const element = document.getElementById(id);
    if (element && element.classList.contains('active')) {
      element.classList.remove('active');
    }
  }


  selectCheckbox(id: string | string[]): void {
    if (Array.isArray(id)) {
      id.forEach(singleId => this.addActiveClass(singleId));
    } else {
      this.addActiveClass(id);
    }
  }
  
  private addActiveClass(id: string): void {
    const element = document.getElementById(id);
    if (element && !element.classList.contains('active')) {
      element.classList.add('active');
    } else if (element && element.classList.contains('active')) {
      element.classList.remove('active');
    }
  }

  showdefault(element: HTMLElement) {

    if (this.FetcTemplateDefaultDataListM?.length > 0) {
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i] as HTMLElement;

        const id = (child.getAttribute('id') ?? '') as string;
        if (id) {
          const idvalue = this.FetcTemplateDefaultDataListM.map((item: any) => {
            const val = item.id_value_pairs.find((pair: any) => pair.id === id);
            return val ? val.value : null;
          });

          const targetElement = document.getElementById(id);
          if (targetElement && idvalue[0]) {
            if (targetElement instanceof HTMLInputElement ||
              targetElement instanceof HTMLTextAreaElement) {
              (targetElement as HTMLInputElement | HTMLTextAreaElement).value = idvalue[0] ? idvalue[0] : '';
            }
            else if (targetElement instanceof HTMLSelectElement) {
              (targetElement as HTMLSelectElement).value = idvalue[0] ? idvalue[0] : '0';
            }
            else if (targetElement instanceof HTMLSpanElement) {
              (targetElement as HTMLSpanElement).innerText = idvalue[0] ? idvalue[0] : '';
            } else if (targetElement instanceof HTMLDivElement && idvalue[0]) {
              const buttons = targetElement.querySelectorAll('button');
              buttons.forEach(button => {
                if (button.innerText.trim() === idvalue[0]) {
                  button.classList.add('selected');
                } else {
                  button.classList.remove('selected');
                }
              });
            }

            if(targetElement instanceof HTMLDivElement && targetElement.id === 'allergyDataDynamicDiv') {
              targetElement.innerHTML = idvalue[0];
            }
          }

          const targetElementClass = document.getElementsByClassName(id);

          if (targetElementClass.length > 0 && idvalue[0]) {
            Array.from(targetElementClass).forEach(element => {
              if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                element.value = idvalue[0] ? idvalue[0] : '';
              }
              else if(element instanceof HTMLSpanElement) {
                element.innerText = idvalue[0] ? idvalue[0] : '';
              }
            });
          }
        }

        if (child.children.length > 0) {
          this.showdefault(child);
        }
      }
      this.cdr.detectChanges();
    }
  }

  showElementsData(element: HTMLElement, dataFromDB: { id: string, value: string, userId?: any }[], issame: any = true, tem?: any) {    if (tem) {
      this.signatureForm.patchValue({
        Signature1: tem.Signature1,
        Signature2: tem.Signature2,
        Signature3: tem.Signature3,
        Signature4: tem.Signature4,
        Signature5: tem.Signature5,
        Signature6: tem.Signature6,
        Signature7: tem.Signature7,
        Signature8: tem.Signature8,
        Signature9: tem.Signature9,
        Signature10: tem.Signature10,
      });

      if (tem.Signature1) {
        this.signatureList.push({ class: 'Signature1', signature: tem.Signature1 });
      }

      if (tem.Signature2) {
        this.signatureList.push({ class: 'Signature2', signature: tem.Signature2 });
      }

      if (tem.Signature3) {
        this.signatureList.push({ class: 'Signature3', signature: tem.Signature3 });
      }

      if (tem.Signature4) {
        this.signatureList.push({ class: 'Signature4', signature: tem.Signature4 });
      }

      if (tem.Signature5) {
        this.signatureList.push({ class: 'Signature5', signature: tem.Signature5 });
      }

      if (tem.Signature6) {
        this.signatureList.push({ class: 'Signature6', signature: tem.Signature6 });
      }

      if (tem.Signature7) {
        this.signatureList.push({ class: 'Signature7', signature: tem.Signature7 });
      }

      if (tem.Signature8) {
        this.signatureList.push({ class: 'Signature8', signature: tem.Signature8 });
      }
      if (tem.Signature9) {
        this.signatureList.push({ class: 'Signature9', signature: tem.Signature9 });
      }
      if (tem.Signature10) {
        this.signatureList.push({ class: 'Signature10', signature: tem.Signature10 });
      }
    }
    const currentTemplateId = sessionStorage.getItem('currentTemplateId');
    if (multipleSaveEnabledTemplates.includes(Number(currentTemplateId))) {
      const regex = /\bSignature\d+\b/g;
      const signatureData = dataFromDB.filter((item: any) => item.id.match(regex));
      signatureData.forEach((signature: any) => {
        this.dataChangesMap[signature.id] = signature.userId;
        if(signature.userId !== this.doctorData[0].EmpId) {
          (this as any)[signature.id]?.elementRef?.nativeElement?.parentElement?.parentElement?.classList?.add('disabled');
        }        
      });
    }

    this.timerData = dataFromDB.filter((item: any) => item.id.includes('textbox_generic_time'));

    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i] as HTMLElement;

      const id = (child.getAttribute('id') ?? '') as string;
      if (id) {
        const data = dataFromDB.find(item => item.id === id);
        let value = data ? data.value : '';

        const targetElement = document.getElementById(id);
        if (targetElement) {
          if (targetElement instanceof HTMLInputElement ||
            targetElement instanceof HTMLTextAreaElement ||
            targetElement instanceof HTMLSelectElement) {
            (targetElement as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value = value;
            
            if (multipleSaveEnabledTemplates.includes(Number(currentTemplateId))) {
              if (data?.userId) {
                this.dataChangesMap[id] = data.userId;
                if (data?.userId !== this.doctorData[0].EmpId) {
                  targetElement.setAttribute('disabled', 'true');
                }
              }
            } else if (!issame && value) {
              targetElement.setAttribute('disabled', 'true');
            }
          } else if (targetElement instanceof HTMLDivElement) {
            if (targetElement.classList.contains('toggle__switch')) {
              const buttons = targetElement.querySelectorAll('.btn');
              buttons.forEach(button => {
                if (button?.textContent?.trim() === value) {
                  button.classList.add('selected');
                }
                else {
                  button.classList.remove('selected');
                }
              });
              if (multipleSaveEnabledTemplates.includes(Number(currentTemplateId))) {
                if (data?.userId) {
                  this.dataChangesMap[id] = data.userId;
                  if (data?.userId !== this.doctorData[0].EmpId) {
                    targetElement.classList.add('disabled');
                  }
                }
              } else if (!issame) {
                targetElement.classList.add('disabled');
              }
            } else if (targetElement.classList.contains('custom_check')) {
              if (value === "true") {
                targetElement.classList.add('active');
                if (multipleSaveEnabledTemplates.includes(Number(currentTemplateId))) {
                  if (data?.userId) {
                    this.dataChangesMap[id] = data.userId;
                    if (data?.userId !== this.doctorData[0].EmpId) {
                      targetElement.classList.add('disabled');
                    }
                  }
                } else if (!issame) {
                  targetElement.classList.add('disabled');
                }
              }
            }
          } else if (targetElement instanceof HTMLButtonElement) {
            if (value === "true") {
              targetElement.classList.add('active');
              if(!issame) {
                targetElement.disabled = true;
              }
            }
          }
          else {
            targetElement.innerText = value;
            if (targetElement instanceof HTMLSpanElement && multipleSaveEnabledTemplates.includes(Number(currentTemplateId))) {
              if (data?.userId) {
                this.dataChangesMap[id] = data.userId;
                if (data?.userId !== this.doctorData[0].EmpId) {
                  targetElement.classList.add('disabled');
                }
              }
            }
          }

          if (targetElement.classList.contains('ButtonScore')) {
            const [imgValue, pValue, divValue] = value.split('$');
            const imgElement = targetElement.querySelector('.imgpain') as HTMLImageElement;
            const pElement = targetElement.querySelector('.textpain') as HTMLParagraphElement;
            const divElement = targetElement.querySelector('.scorepain') as HTMLDivElement;

            if (imgElement) imgElement.src = imgValue;
            if (pElement) pElement.textContent = pValue;
            if (divElement) divElement.textContent = divValue;

         }

         if (id.includes("_activeclass_") && value === 'true') {
          targetElement.click();
        }

        }
        this.tagIds.push({ id: id, value: value });
      }

      if (child.children.length > 0) {
        this.showElementsData(child, dataFromDB, issame);
      }
    }
    this.cdr.detectChanges();
  }

  getValueById(id: string): any {
    const selectedButton = document.getElementById(id)?.querySelector('.selected');
    return selectedButton ? selectedButton.textContent?.trim() : '';
  }

  setValueById(id: any, value: any) {
    const targetElement = document.getElementById(id);
    const buttons = targetElement?.querySelectorAll('.btn');
    buttons?.forEach(button => {
      if (button?.textContent?.trim() === value) {
        button.classList.add('selected');
      }
      else {
        button.classList.remove('selected');
      }
    });
  }

  bindTextboxValue(id: any, value: any) {
    const targetElement = document.getElementById(id);
    if (targetElement) {
      (targetElement as HTMLInputElement).value = value;
    }
  }

  getClassExistence(id: any) {
    const targetElement = document.getElementById(id);

    if (targetElement && targetElement.classList.contains("active")) {
      return true;
    } else {
      return false;
    }
  }

  getClassButtonSelectionExistence(id: any) {
    const targetElement = document.getElementById(id);

    if(targetElement) {
      const selectedButton = targetElement.querySelector('.btn.selected');
      if (selectedButton) {
        return selectedButton?.textContent?.trim();
      } 
    }
   
    return '';
  }

  addSignature(signatureClassName: any) {
    const modalRef = this.modalService.open(ValidateEmployeeComponent);
    modalRef.componentInstance.IsSignature = true;
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        modalRef.componentInstance.signature.subscribe((data: string) => {
          if (data) {
            this.signatureList.push({ class: signatureClassName, signature: data });
            this.base64Signature(signatureClassName, data);
          }
          modalRef.close();
        });
      }
      modalRef.close();
    });
  }

  getSignature(signatureClassName: any): string | null {
    const signatureData = this.signatureList.find((signature: any) => signature.class === signatureClassName);
    return signatureData ? signatureData.signature : null;
  }

  clearSignature(signatureClassName: any) {
    const index = this.signatureList.findIndex((signature: any) => signature.class === signatureClassName);
    if (index !== -1) {
      this.signatureList.splice(index, 1);
      this.base64Signature(signatureClassName, '');
    }
  }

  base64Signature(key: any, event: any) {
    if(event) {
      this.addToDataChangesMap(key);
    } else {
      this.removeFromDataChangesMap(key);
    }
    switch (key) {
      case 'Signature1':
        this.signatureForm.patchValue({ Signature1: event });
        break;
      case 'Signature2':
        this.signatureForm.patchValue({ Signature2: event });
        break;
      case 'Signature3':
        this.signatureForm.patchValue({ Signature3: event });
        break;
      case 'Signature4':
        this.signatureForm.patchValue({ Signature4: event });
        break;
      case 'Signature5':
        this.signatureForm.patchValue({ Signature5: event });
        break;
      case 'Signature6':
        this.signatureForm.patchValue({ Signature6: event });
        break;
      case 'Signature7':
        this.signatureForm.patchValue({ Signature7: event });
        break;
      case 'Signature8':
        this.signatureForm.patchValue({ Signature8: event });
        break;
      case 'Signature9':
        this.signatureForm.patchValue({ Signature9: event });
        break;
      case 'Signature10':
        this.signatureForm.patchValue({ Signature10: event });
        break;
      default:
    }
  }

  onOptionChange(event: any, selectId: string): void {
    const selectedOption = event.target.value;
    if (selectedOption === 'Others') {
      this.isOthersSelected[selectId] = true;
    } else {
      delete this.isOthersSelected[selectId];
    }
  }

  hide(elementId: string) {
    const element = this.el.nativeElement.querySelector(`#${elementId}`);
    if (element) {
      this.renderer.setStyle(element, 'display', 'none');
    }
  }

  show(elementId: string) {
    const element = this.el.nativeElement.querySelector(`#${elementId}`);
    if (element) {
      this.renderer.setStyle(element, 'display', 'block');
    }
  }

  toggleVisibility(showElementId: string, hideElementId: string) {
    const showElement = this.el.nativeElement.querySelector(`#${showElementId}`);
    const hideElement = this.el.nativeElement.querySelector(`#${hideElementId}`);

    if (showElement && hideElement) {
      this.renderer.setStyle(showElement, 'display', 'block');
      this.renderer.setStyle(hideElement, 'display', 'none');
    }
  }

  showDefaultOntoggle(id: string) {
    setTimeout(() => {
      const idvalue = this.FetcTemplateDefaultDataListM.map((item: any) => {
        const val = item.id_value_pairs.find((pair: any) => pair.id === id);
        return val ? val.value : null;
      });

      const targetElement = document.getElementById(id);
      if (targetElement) {
        (targetElement as HTMLInputElement).value = idvalue;

        if(targetElement instanceof HTMLDivElement && targetElement.id === 'allergyDataDynamicDiv') {
          targetElement.innerHTML = idvalue[0];
        }
      }
    }, 500);
  }

  setCurrentTime(): string {
    const now = new Date();
    const hours = this.padZero(now.getHours());
    const minutes = this.padZero(now.getMinutes());
    return `${hours}:${minutes}`;
  }

  padZero(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  openAllergyModal() {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    // const modalRef = this.ms.openModal(AllergyComponent, {
    //   data: '',
    //   readonly: false
    // }, options);

    const modalRef = this.modalService.open(AllergyComponent, options);
    modalRef.componentInstance.dataChanged.subscribe((data: string) => {
      modalRef.close();
      this.fetchDefaults();
      setTimeout(() => {
      this.showDefaultOntoggle('allergyDataDynamicDiv')
      , 5000});
      
    });
  }

  getCheckBoxStatus(id: string): boolean {
    if (document.getElementById(id)?.classList.contains('active')) {
      return true;
    } 

    return false;
  }

  checkinputvalue(id: string): boolean {
    if($('#' + id).val()) {
      return true;
    }
    return false;
  }

  onTimeChange(event: any, key: any) {
    const selector = this.timerData.find((ts: any) => ts.id === key);
    const currentTemplateId = sessionStorage.getItem('currentTemplateId');

    if (selector) {
      selector.value = event.hour + ':' + event.minute;
      if (multipleSaveEnabledTemplates.includes(Number(currentTemplateId))) {
        selector.userId = this.doctorData[0].EmpId;
      }
    }
    else {
      let data: any = {
        'id': key, 
        'value': event.hour + ':' + event.minute
      };
      if (multipleSaveEnabledTemplates.includes(Number(currentTemplateId))) {
        data.userId = this.doctorData[0].EmpId;
      }
      this.timerData.push(data);
    }
  }

  
  getHours(id: any) {
    const selector = this.timerData.find((ts: any) => ts.id === id);
    if(selector) {
      return selector.value.split(':')[0];
    }
  }

  getMinutes(id: any) {
    const selector = this.timerData.find((ts: any) => ts.id === id);
    if(selector) {
      return selector.value.split(':')[1];
    }
  }

  isTimeSelectorDisable(id: any) {
    const selector = this.timerData.find((ts: any) => ts.id === id);
    if (selector?.userId && selector.userId !== this.doctorData[0].EmpId) {
      return true;
    } 
    return false;
  }

  referclick() {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.ms.openModal(ReferralComponent, {
      data: '',
      readonly: true
    }, options);
  }

  addListeners(datepickers: any) {
    setTimeout(() => {    
      const container: any = document.getElementsByClassName('main-container');
      if (container.length > 0) {
        const index = container.length - 1;
        container[index].addEventListener('input', (event: any) => {
          if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
            if (event.target.value !== null && event.target.value !== undefined && event.target.value.trim() !== '') {
              this.addToDataChangesMap(event.target.id);
            } else {
              this.removeFromDataChangesMap(event.target.id);
            }
          }
          if ((event.target instanceof HTMLSpanElement && event.target.contentEditable.toString() === 'true')) {
            if (event.target.innerText !== null && event.target.innerText !== undefined && event.target.innerText.trim() !== '' && event.target.innerText.trim() !== '\n') {
              this.addToDataChangesMap(event.target.id);
            } else {
              this.removeFromDataChangesMap(event.target.id);
            }
          }
        });
        container[index].addEventListener('click', (event: any) => {
          if (event.target.parentElement?.classList?.contains('custom_check')) {
            if (this.dataChangesMap[event.target.parentElement.id]) {
              this.removeFromDataChangesMap(event.target.parentElement.id);
            } else {
              this.addToDataChangesMap(event.target.parentElement.id);
            }          
          } else if (event.target.parentElement?.parentElement?.classList?.contains('custom_check')){
            if (this.dataChangesMap[event.target.parentElement.parentElement.id]) {
              this.removeFromDataChangesMap(event.target.parentElement.parentElement.id);
            } else {
              this.addToDataChangesMap(event.target.parentElement.parentElement.id);
            }          
          } else if(event.target instanceof HTMLButtonElement && event.target.parentElement?.classList?.contains('toggle__switch')) {
            this.addToDataChangesMap(event.target.parentElement.id);
          }
        });
        datepickers?.forEach((datepicker: any) => {
          const id = datepicker.datepickerInput?._elementRef.nativeElement.id;
          datepicker.datepickerInput?.dateChange.subscribe(() => {
            this.addToDataChangesMap(id);
          });
        });
      }
    }, 0);
  }

  onSearchDoctors(event: any) {
    this.doctorsList = [];
    if (event.target.value.length >= 3) {
      this.templateConfigService.FetchHospitalNurse("FetchBathHospitalDoctors", event.target.value.trim(), this.doctorData[0].UserId, 3403, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.doctorsList = response.FetchHospitalNurseDataaList;
          }
        },
          () => {

          })
    }
  }
  onSearchDoctorsAll(event: any) {
    this.doctorsList = [];
    if (event.target.value.length >= 3) {
      this.templateConfigService.FetchSSEmployees("FetchSSEmployees", event.target.value.trim(), this.doctorData[0].UserId, 3403, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.doctorsList = response.FetchSSEmployeesDataList;
          }
        },
          () => {

          })
    }
  }
  
  

  onDoctorSelect(item: any, id?: any) {
    this.doctorsList = [];
    if(id) {
      this.bindTextboxValue(id, item.EmpNo);
    }
  }

  onSearchSocialWorker(event: any) {
    if (event.target.value.length >= 3) {
      this.templateConfigService.FetchHospitalNurse("FetchHospitalSocialWorker", event.target.value.trim(), this.doctorData[0].UserId, 3403, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.socialWorkersList = response.FetchHospitalNurseDataaList;
          }
        },
          (err) => {

          })
    }
  }

  onSocialWorkerSelect(item: any, id?: any) {
    this.socialWorkersList = [];
    if(id) {
      this.bindTextboxValue(id, item.EmpNo);
    }
  }

  onSearchNurse(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.utilityservice.get("FetchWitnessNurse?Filter=" + filter + "&HospitalID=" + this.hospitalID + "")
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.nursesList = response.FetchRODNursesDataList;
          }
        },
          (err) => {

          })
    }
  }

  onNurseSelect(item: any, codeId?: string, nameId?: string) {
    this.nursesList = [];
    if (codeId) {
      this.bindTextboxValue(codeId, item.EmpNo);
    }
    if (nameId) {
      this.bindTextboxValue(nameId, item.Fullname);
    }
  }

  print(printContent: any, name: string) {
    setTimeout(() => {
      this.printerService.show();
    }, 500);
  
    this.doctorData = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    if (printContent) {
      html2canvas(printContent).then(canvas => {
        const image = { type: 'jpeg' };
        const margin = [0.3, 0.3];
  
        const pageWidth = 8.5;
        const pageHeight = 11;
  
        const footerHeightInInches = 0.5;
        const headerHeightInInches = 0.7;
  
        const innerPageWidth = pageWidth - margin[0] * 2;
        const innerPageHeight = pageHeight - margin[1] * 2 - footerHeightInInches - headerHeightInInches;
  
        const pxFullHeight = canvas.height;
        const pxPageHeight = Math.floor(canvas.width * (innerPageHeight / innerPageWidth));
        const nPages = Math.ceil(pxFullHeight / pxPageHeight);
  
        const pdf = new jsPDF('p', 'in', [pageWidth, pageHeight]);
  
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
  
        const headerImage = 'assets/images/header.jpeg';
        const footerImage = 'assets/images/footer.jpeg';
  
        for (let page = 0; page < nPages; page++) {
          let pageHeightToDraw = pxPageHeight;
          if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) {
            pageHeightToDraw = pxFullHeight % pxPageHeight;
          }
  
          pageCanvas.height = pageHeightToDraw;
          pageCtx?.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx?.drawImage(canvas, 0, page * pxPageHeight, canvas.width, pageHeightToDraw, 0, 0, pageCanvas.width, pageHeightToDraw);
  
          const imgData = pageCanvas.toDataURL(`image/${image.type}`);
  
          if (page > 0) {
            pdf.addPage();
          }
  
          pdf.addImage(headerImage, 'JPEG', margin[1], 0.2, innerPageWidth, headerHeightInInches);
  
          pdf.addImage(imgData, image.type, margin[1], margin[0] + headerHeightInInches, innerPageWidth, (pageHeightToDraw * innerPageWidth) / canvas.width);
  
          pdf.addImage(footerImage, 'JPEG', margin[1], pageHeight - footerHeightInInches, innerPageWidth, footerHeightInInches);
  
          pdf.setFontSize(8);
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          const pageNumText = `Page ${page + 1} of ${nPages}`;
          const pageNumX = pageWidth / 2;
          const pageNumY = pageHeight - footerHeightInInches - 0.1; 
          pdf.text(pageNumText, pageNumX, pageNumY, { align: 'center' });
  
          pdf.setFontSize(8);
          pdf.text('Printed by ' + this.doctorData[0].UserName, pageWidth + 0.3, pageHeight - 0.2, {
            angle: 90,
            align: 'center'
          });
        }
  
        pdf.save(`${name ?? 'eform'}_${new Date().toISOString()}.pdf`);
      });
    } else {
      console.error('Element not found');
    }
  
    setTimeout(() => {
      this.printerService.hide();
    }, 500);
  }
  
}
