import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { sugsftchklst } from '../consent-medical/consent-medical.component';
import { UtilityService } from 'src/app/shared/utility.service';
declare var $: any;
@Component({
  selector: 'app-generalconsent',
  templateUrl: './generalconsent.component.html',
  styleUrls: ['./generalconsent.component.scss']
})
export class GeneralconsentComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('signatureCanvas') signatureCanvas1!: ElementRef<HTMLCanvasElement>;
  @ViewChild('signatureCanvas') signatureCanvas2!: ElementRef<HTMLCanvasElement>;

  @ViewChild('Sign1Ref', { static: false }) signComponent1: SignatureComponent | undefined;
  @ViewChild('Sign2Ref', { static: false }) signComponent2: SignatureComponent | undefined;
  @ViewChild('Sign3Ref', { static: false }) signComponent3: SignatureComponent | undefined;
  @ViewChild('Sign4Ref', { static: false }) signComponent4: SignatureComponent | undefined;
  @ViewChild('Sign5Ref', { static: false }) signComponent5: SignatureComponent | undefined;
  @Input() surgeryIds: string = "";
  showContent = true;
  IsSignature1Edit = true;
  IsSignature2Edit = true;
  IsSignature3Edit = true;
  isSameUser = true;
  private ctx: CanvasRenderingContext2D | null = null;
  private ctx1: CanvasRenderingContext2D | null = null;
  private ctx2: CanvasRenderingContext2D | null = null;
  private isDrawing: boolean = false;
  inputDynamicType = '';
  inputDynamicValue: any;
  @ViewChild('contentDiv') contentDiv!: ElementRef;
  hospId: any;
  doctorDetails: any;
  selectedView: any;
  AdmissionID: any;
  PatientID: any;
  langData: any;
  patientDetails: any;
  SpecialiseID: any;
  isMyself: boolean = false;
  onBehalfofPatient: boolean = false;
  unableToSign: boolean = false;
  relationshipList:any;
  nextOfKinDetails:any;
  generalConsentForm!: FormGroup;
  currentdate: any;
  currentTime:any;
  currentDateTime:any;
  PhysicianNameDoc:any;
  PhysicianNameDocDesignation:any;
  admissionGeneralConsent:any;
  savedGeneralConsent:any;
  myTextForm: FormGroup;
  myArabicTextForm: FormGroup;
  base64StringSig1 = '';
  base64StringSig2 = '';
  showSignature: boolean = false;
  IsView: boolean = false;
  GeneralConsentID= 0;
  trustedUrl: any;
  @Output() savechanges = new EventEmitter<any>();
  @Input() data: any;
  readonly = false;
  IsPrint = false;
  IsViewActual = false;
  isMyselfEdit: boolean = true;

  base64StringSig4 = '';
  base64StringSig5 = '';

  requiredFields = [
    { id: 'text_patient_name', message: 'Patient Name Required', required: true }
  ];
  listOfAnesthetists: any = [];

  handleFormClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    this.inputDynamicType = '';
  
      if (target && target.tagName === 'SPAN') {
        setTimeout(() => {
          this.inputDynamicType = target.classList.value;
          this.inputDynamicValue = target.textContent;
          this.config.triggerDynamicUpdate(false);
          $("#modalDynamic").modal('show');
        }, 500);
      }
    }

  constructor(el: ElementRef, cdr: ChangeDetectorRef, 
    private config: ConfigService, renderer: Renderer2, private fb: FormBuilder, private us: UtilityService) { 
    super(renderer, el, cdr);
    this.langData = this.config.getLangData();
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    this.hospId = sessionStorage.getItem("hospitalId");
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.PatientID = this.selectedView.PatientID;
    this.AdmissionID = this.selectedView.AdmissionID;
    this.SpecialiseID = this.selectedView.SpecialiseID;
    if(this.selectedView.PatientType == "2") {
      this.AdmissionID = this.selectedView.IPID;
    }
    this.subscription = this.config.trigger$.subscribe(status => {
      if(status) {
        this.saveGeneralConsentForm();
      }
    });
    this.subscription = this.config.triggerPrint$.subscribe(status => {
      if(status) {
        this.GeneralConsentPrint();
      }
    });

    this.generalConsentForm = this.fb.group({
      GeneralConsentID: [''],
      PatientName: [''],
      PatientName2L: [''],
      PatientName1: [''],
      PatientName2L1: [''],
      OnbehalfOfPatientName: [''],
      OnbehalfOfPatientName2L : [''],
      GeneralConsent : [''],
      GeneralConsent2L : [''],
      PatientOrRepresentativeSignature : [''],
      PatientOrRepresentativeSignatureDate : [''],
      base64StringSig2: [''],
      PatientOrRepresentativeName: [''],
      PatientOrRepresentativeName2l: [''],
      PatientOrRepresentativeRelationID : ['0'],
      FirstNextOfKinName : [''],
      FirstNextOfKinName2L : [''],
      RelationID1 : ['0'],
      FirstNextOfKinMobileNo:[''],
      SecondNextOfKinName : [''],
      SecondNextOfKinName2L : [''],
      RelationID2 : ['0'],
      MobileNo : [''],      
      SpecialiseID : [''],
      DoctorConsentDate : [''],
      Signature1: [''],
      Signature2: ['']
    });

    this.myTextForm = this.fb.group({
      input1: [''], 
      input2: [''],
      input3: [''],
      combinedText: ['']
    });

    this.myArabicTextForm = this.fb.group({
      input4: [''], 
      input5: [''],
      input6: [''],
      combinedArabicText: ['']
    });
  }

  ngOnInit(): void {
    this.initialiseGeneralConsentForm();
    this.LoadRelationshipData();
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY');
    this.currentTime = moment(new Date()).format('H:mm');
    this.currentDateTime = this.currentdate + " " + this.currentTime;
    this.PhysicianNameDoc= this.doctorDetails[0].EmployeeName + '-' + this.doctorDetails[0]?.UserName;
    this.PhysicianNameDocDesignation= this.doctorDetails[0].EmpDesignation; 
    
    if (this.data) {
      this.readonly = this.data.readonly;
      this.admissionGeneralConsent = this.data.data;
      this.FetchPatientGeneralConsent(this.data.data.GeneralConsentID.replace(/,/g, ""));
    }
    else {
      this.FetchPatientadmissionGeneralConsent();
    }
    this.FetchConsentFormPatientAdmissionDetails();
  }

  initialiseGeneralConsentForm() {
    this.GeneralConsentID = 0;
    this.generalConsentForm = this.fb.group({
      GeneralConsentID: [''],
      PatientName: this.selectedView.PatientName,
      PatientName2L: this.selectedView.PatientType === '3' ? this.selectedView.PatientName2L : this.selectedView.PatientName2l,
      PatientName1: [''],
      PatientName2L1 : [''],
      OnbehalfOfPatientName: [''],
      OnbehalfOfPatientName2L : [''],
      GeneralConsent : [''],
      GeneralConsent2L : [''],
      PatientOrRepresentativeName: [''],
      PatientOrRepresentativeName2l: [''],
      PatientOrRepresentativeSignature : [''],
      base64StringSig2 : [''],
      PatientOrRepresentativeSignatureDate : [''],
      PatientOrRepresentativeRelationID : ['0'],
      FirstNextOfKinName : [''],
      FirstNextOfKinName2L : [''],
      RelationID1 : ['0'],
      FirstNextOfKinMobileNo:[''],
      SecondNextOfKinName : [''],
      SecondNextOfKinName2L : [''],
      RelationID2 : ['0'],
      MobileNo : [''],
      SpecialiseID : [''],
      DoctorConsentDate : moment(new Date()).format('DD-MMM-YYYY'),
      Signature1: [''],
      Signature2: [''],
      ManagerOnDutyName: ['', Validators.required],
      MedicalDirectorName: ['', Validators.required],
      MedicalDirectorSignature: ['', Validators.required],
      ManagerOnDutySignature: ['', Validators.required],
      MedicalDirectorSignatureDate: [moment(new Date()).format('DD-MMM-YYYY HH:mm'), Validators.required],
      ManagerOnDutySignatureDate: [moment(new Date()).format('DD-MMM-YYYY HH:mm'), Validators.required] 
    });
    this.myTextForm = this.fb.group({
      input1: [''], 
      input2: [''],
      input3: [''],
      combinedText: ['']
    });

    this.myArabicTextForm = this.fb.group({
      input4: [''], 
      input5: [''],
      input6: [''],
      combinedArabicText: ['']
    });
  }
  
  FetchPatientadmissionGeneralConsent() {
    this.config.FetchPatientadmissionGeneralConsent(this.AdmissionID, this.hospId)
      .subscribe((response: any) => {
        this.admissionGeneralConsent = response.FetchPatientadmissionGeneralConsentDataList;
        this.admissionGeneralConsent.forEach((element: any, index: any) => {
          element.Class = "icon-w cursor-pointer";
        })
        // if(this.admissionGeneralConsent.length === 1) {
        //   this.FetchPatientGeneralConsent(this.admissionGeneralConsent[0].GeneralConsentID.replace(/,/g, ""));
        // }
        // else {
          this.showSignature = true;          
        //}
        if(this.admissionGeneralConsent.length > 0) {
          this.IsView = true;
          this.IsViewActual = true;
          //$("#savedConsentsmodal").modal('show');
        }

      },
        (err) => {
        })
  }
  FetchPatientGeneralConsent(generalConsentID:any) {
    var genconsid = generalConsentID;
    this.config.FetchPatientGeneralConsent(genconsid, this.hospId)
      .subscribe((response: any) => {
        this.savedGeneralConsent = response.FetchPatientGeneralConsentDataList;
        this.GeneralConsentID = this.savedGeneralConsent[0].GeneralConsentID;
        this.isMyself = this.savedGeneralConsent[0].Myself == 1 ? true : false;
        this.onBehalfofPatient = this.savedGeneralConsent[0].OnbehalfOfPatient == 1 ? true : false;
        if (!this.isMyself && !this.onBehalfofPatient) {
          this.unableToSign = true;
        } else {
          this.unableToSign = false;
        }
        this.generalConsentForm.patchValue({
          GeneralConsentID: this.savedGeneralConsent[0].GeneralConsentID,
          PatientName: this.savedGeneralConsent[0].PatientName.split('$')[0],
          PatientName2L: this.savedGeneralConsent[0].PatientName2L.split('$')[0],
          PatientName1: this.savedGeneralConsent[0].PatientName.split('$')[1],
          PatientName2L1: this.savedGeneralConsent[0].PatientName2L.split('$')[1],
          Myself: this.savedGeneralConsent[0].Myself,
          OnbehalfOfPatientName: this.savedGeneralConsent[0].OnbehalfOfPatientName,
          OnbehalfOfPatientName2L : this.savedGeneralConsent[0].OnbehalfOfPatientName2L,
          //GeneralConsent : this.savedGeneralConsent[0].GeneralConsent,
          //GeneralConsent2L : this.savedGeneralConsent[0].GeneralConsent2L,
          PatientOrRepresentativeName : this.savedGeneralConsent[0].PatientOrRepresentativeName,          
          PatientOrRepresentativeSignature : this.savedGeneralConsent[0].PatientOrRepresentativeSignature,
          PatientOrRepresentativeSignatureDate : this.savedGeneralConsent[0].PatientOrRepresentativeSignatureDate,
          base64StringSig2: this.savedGeneralConsent[0].DoctorSignature,
          PatientOrRepresentativeRelationID : this.savedGeneralConsent[0].PatientOrRepresentativeRelationID,
          FirstNextOfKinName : this.savedGeneralConsent[0].FirstNextOfKinName,
          FirstNextOfKinName2L : this.savedGeneralConsent[0].FirstNextOfKinName2L,
          RelationID1 : this.savedGeneralConsent[0].RelationID1,
          FirstNextOfKinMobileNo : this.savedGeneralConsent[0].FirstNextOfKinMobileNo,          
          SecondNextOfKinName : this.savedGeneralConsent[0].SecondNextOfKinName,
          SecondNextOfKinName2L : this.savedGeneralConsent[0].SecondNextOfKinName2L,
          RelationID2 : this.savedGeneralConsent[0].RelationID2,
          MobileNo : this.savedGeneralConsent[0].MobileNo,
          SpecialiseID : this.savedGeneralConsent[0].SpecialiseID,
          DoctorConsentDate : this.savedGeneralConsent[0].DoctorConsentDate,
          MedicalDirectorName: this.savedGeneralConsent[0].MedicalDirectorName,
          MedicalDirectorSignature: this.savedGeneralConsent[0].MedicalDirectorSignature,
          MedicalDirectorSignatureDate: this.savedGeneralConsent[0].MedicalDirectorSignatureDate,
          ManagerOnDutyName: this.savedGeneralConsent[0].ManagerOnDutyName,
          ManagerOnDutySignature: this.savedGeneralConsent[0].ManagerOnDutySignature,
          ManagerOnDutySignatureDate: this.savedGeneralConsent[0].ManagerOnDutySignatureDate
        })

        

        this.currentDateTime=this.savedGeneralConsent[0].DoctorConsentDate;
        this.currentdate=this.savedGeneralConsent[0].PatientOrRepresentativeSignatureDate.split(' ')[0];
        this.currentTime=this.savedGeneralConsent[0].PatientOrRepresentativeSignatureDate.split(' ')[1];
        this.PhysicianNameDoc=this.savedGeneralConsent[0].doctorName;
        this.PhysicianNameDocDesignation=this.savedGeneralConsent[0].Designation;
        this.base64StringSig1 = this.savedGeneralConsent[0].PatientOrRepresentativeSignature;
        this.base64StringSig2 = this.savedGeneralConsent[0].DoctorSignature;
        this.base64StringSig4 = this.savedGeneralConsent[0].MedicalDirectorSignature;
        this.base64StringSig5 = this.savedGeneralConsent[0].ManagerOnDutySignature;
        //this.fetchDoctorSignature();
        this.showSignature = false; // to load the common component
            setTimeout(() => {
              this.showSignature = true;
            }, 0);

        if (this.savedGeneralConsent[0].GeneralConsent) {
          this.generalConsentForm.patchValue({ GeneralConsent: this.savedGeneralConsent[0].GeneralConsent });
          
          var array = this.savedGeneralConsent[0].GeneralConsent.split('$');

          if (array.length > 0) {
            this.myTextForm.patchValue({
              input1: array.length > 0 ? array[0] : '',
              input2: array.length > 1 ? array[1] : '',
              input3: array.length > 2 ? array[2] : '',
            });
          }
        }
        else {
          this.myTextForm.reset();
        }

        if (this.savedGeneralConsent[0].GeneralConsent2L) {
          this.generalConsentForm.patchValue({ GeneralConsent2L: this.savedGeneralConsent[0].GeneralConsent2L });
          var array = this.savedGeneralConsent[0].GeneralConsent2L.split('$');

          if (array.length > 0) {
            this.myArabicTextForm.patchValue({
              input4: array.length > 0 ? array[0] : '',
              input5: array.length > 1 ? array[1] : '',
              input6: array.length > 2 ? array[2] : '',
            });
          }
        }
        else {
          this.myArabicTextForm.reset();
        }


        if (this.savedGeneralConsent[0].CreatedBy != this.doctorDetails[0]?.UserId) {
          this.isSameUser = false;
          // if(this.base64StringSig) {
          //   this.IsSignature1Edit = false;
          // }
          if(this.base64StringSig1) {
            this.IsSignature2Edit = false;
          }
          if(this.base64StringSig2) {
            this.IsSignature3Edit = false;
          }

          if(this.savedGeneralConsent[0].Myself == 1 ? true : false || this.savedGeneralConsent[0].OnbehalfOfPatient == 1 ? true : false) {
            this.isMyselfEdit = false;
          }

          Object.keys(this.generalConsentForm.controls).forEach(controlName => {
            const control = this.generalConsentForm.get(controlName);
            if(controlName.includes("Relation") && control?.value > 0) {
              control?.disable();
            }
            else if (!controlName.includes("Relation") && control?.value) {
              control.disable();
            }
          });

          Object.keys(this.myTextForm.controls).forEach(controlName => {
            const control = this.myTextForm.get(controlName);
            if (control?.value) {
              control.disable();
            }
          });

          Object.keys(this.myArabicTextForm.controls).forEach(controlName => {
            const control = this.myArabicTextForm.get(controlName);
            if (control?.value) {
              control.disable();
            }
          });
        }
        setTimeout(()=>{
          if(this.generalConsentForm.get("FirstNextOfKinName")?.value != '') {
            $('#ddlobop').val(1);
          }
          if(this.generalConsentForm.get("SecondNextOfKinName")?.value != '') {
            $('#ddlobop').val(2);
          }
        }, 0);
        

      },
        (err) => {
        })
  }

  base64DoctorSignature(event: any) {
    this.generalConsentForm.patchValue({ PatientOrRepresentativeSignature: event });
  }

  base64Relative1Signature(event: any) {
    this.generalConsentForm.patchValue({ Signature1: event });
  }

  base64Relative2Signature(event: any) {
    this.generalConsentForm.patchValue({ Signature2: event });
  }
  
  base64PhysicianSignature(event: any) {
    this.generalConsentForm.patchValue({ base64StringSig2: event });
  }

  updateCombinedText(): void {
    const inputValues = Object.values(this.myTextForm.value).join('$');
    this.generalConsentForm.patchValue({ GeneralConsent: inputValues });
  }

  updateCombinedArabicText(): void {
    const inputValues = Object.values(this.myArabicTextForm.value).join('$');
    this.generalConsentForm.patchValue({ GeneralConsent2L: inputValues });
  }

  LoadRelationshipData() {
    this.config.FetchPatientRelatives(this.hospId)
      .subscribe((response: any) => {
        this.relationshipList = response.SurgeryDemographicsDataaList;

      },
        (err) => {
        })
  }

  FetchConsentFormPatientAdmissionDetails() {
    this.config.FetchConsentFormPatientAdmissionDetails(this.AdmissionID, this.hospId)
      .subscribe((response: any) => {
        this.nextOfKinDetails = response.PatientInfoDataList;
        // this.generalConsentForm.patchValue({
        //   FirstNextOfKinName : this.nextOfKinDetails[0].RelativeName,
        //   FirstNextOfKinName2L : '',
        //   RelationID1 : this.nextOfKinDetails[0].RelativeRelativeID,
        //   MobileNo : this.nextOfKinDetails[0].RelativeMobileNo
        // })
        this.selectedView.PatientName=response.PatientInfoDataList[0]?.PatientName;
        this.selectedView.PatientName2L=response.PatientInfoDataList[0]?.PatientName2l;
      },
        (err) => {
        })
  }

  consentBy(type:any) {
    if(type == 'Myself') {
      this.isMyself = true;
      this.onBehalfofPatient = false;
      this.unableToSign = false;
      this.generalConsentForm.patchValue({
        PatientName: this.selectedView.PatientName,
        PatientName2L: this.selectedView.PatientName2L,
        PatientName1: '',
        PatientName2L1: '',
        OnbehalfOfPatientName: '',
        OnbehalfOfPatientName2L : '',
        GeneralConsent : '',
        GeneralConsent2L : '',
        PatientOrRepresentativeSignature : '',
        PatientOrRepresentativeSignatureDate : '',
        base64StringSig2: '',
        PatientOrRepresentativeName: '',
        PatientOrRepresentativeName2l: '',
        PatientOrRepresentativeRelationID : '0',
        FirstNextOfKinName : '',
        FirstNextOfKinName2L : '',
        RelationID1 : '0',
        FirstNextOfKinMobileNo:'',
        SecondNextOfKinName : '',
        SecondNextOfKinName2L : '',
        RelationID2 : '0',
        MobileNo : '',
        SpecialiseID : '',
        DoctorConsentDate : moment(new Date()).format('DD-MMM-YYYY')
      })
    }
    else if(type == "onBehalfofPatient") {
      this.isMyself = false;
      this.onBehalfofPatient = true;
      this.unableToSign = false;
      this.generalConsentForm.patchValue({
        PatientName: this.selectedView.PatientName,
        PatientName2L: this.selectedView.PatientName2l,
        PatientName1: '',
        PatientName2L1: '',
        OnbehalfOfPatientName: '',
        OnbehalfOfPatientName2L : '',
        GeneralConsent : '',
        GeneralConsent2L : '',
        PatientOrRepresentativeSignature : '',
        PatientOrRepresentativeSignatureDate : '',
        base64StringSig2: '',
        PatientOrRepresentativeName: '',
        PatientOrRepresentativeName2l: '',
        PatientOrRepresentativeRelationID : '0',        
        SecondNextOfKinName : '',
        SecondNextOfKinName2L : '',
        RelationID2 : '0',
        MobileNo : this.nextOfKinDetails.RelativeMobileNo,
        SpecialiseID : this.SpecialiseID,
        DoctorConsentDate : moment(new Date()).format('DD-MMM-YYYY')
      })
    } else if(type == "unableToSign") {
      this.isMyself = false;
      this.onBehalfofPatient = false;
      this.unableToSign = true;
      this.generalConsentForm.patchValue({
        PatientName: this.selectedView.PatientName,
        PatientName2L: this.selectedView.PatientName2l,
        PatientName1: '',
        PatientName2L1: '',
        OnbehalfOfPatientName: '',
        OnbehalfOfPatientName2L : '',
        GeneralConsent : '',
        GeneralConsent2L : '',
        PatientOrRepresentativeSignature : '',
        PatientOrRepresentativeSignatureDate : '',
        base64StringSig2: '',
        PatientOrRepresentativeName: '',
        PatientOrRepresentativeName2l: '',
        PatientOrRepresentativeRelationID : '0',        
        SecondNextOfKinName : '',
        SecondNextOfKinName2L : '',
        RelationID2 : '0',
        MobileNo : '',
        SpecialiseID : '',
        DoctorConsentDate : moment(new Date()).format('DD-MMM-YYYY')
      })
    }
  }

  saveGeneralConsentForm() {
    this.errorMessages = [];  this.errorMessagesF = [];
    this.errorMessagesF.push("The Following Fields are Mandatory");
    if (!this.isMyself && !this.onBehalfofPatient && !this.unableToSign) {
      this.errorMessages.push("Select type");
    }
    if ($('#physicianName').val() && !this.generalConsentForm.get('base64StringSig2')?.value) {
      this.errorMessages.push("Doctor Signature");
    }
    if (!$('#physicianName').val() && this.generalConsentForm.get('base64StringSig2')?.value) {
      this.errorMessages.push("Doctor Name");
    }
  if (!this.generalConsentForm.get("PatientName")?.value) {
      this.errorMessages.push("PatientName");
    }

     if (!this.generalConsentForm.get("PatientName2L")?.value) {
      this.errorMessages.push("PatientName in Arabic");
    }
    

    if (!this.generalConsentForm.get("PatientOrRepresentativeSignature")?.value && this.isMyself) {
      this.errorMessages.push("Patient Signature");
    }
    



    if (!this.myTextForm.get("input1")?.value) {
      this.errorMessages.push("Consent confirmation");
    }
    if (!this.myArabicTextForm.get("input4")?.value) {
      this.errorMessages.push("Consent confirmation in Arabic");
    }

    if (this.onBehalfofPatient) {
      const ddlobopval = $('#ddlobop').val();
      if (ddlobopval == '0') {
        this.errorMessages.push("Please select On Behalf of Pateint type");
      }
      if (this.generalConsentForm.get('FirstNextOfKinName')?.value == '' && ddlobopval == '1') {
        this.errorMessages.push("First Next of Kin (Name) / اسم القريب الأول");
      }
      if (!this.generalConsentForm.get("PatientOrRepresentativeSignature")?.value && this.onBehalfofPatient && ddlobopval == '1') {
        this.errorMessages.push("First Next of Kin (Name) Signature");
      }
      if (this.generalConsentForm.get('SecondNextOfKinName')?.value == '' && ddlobopval == '2') {
        this.errorMessages.push("Second Next of Kin (Name) / اسم القريب الأول");
      }
    }

    if (this.unableToSign) {
      if (!this.generalConsentForm.get('MedicalDirectorName')?.value) {
        this.errorMessages.push("Medical Director Name");
      }
      if (this.generalConsentForm.get('MedicalDirectorSignature')?.value == '') {
        this.errorMessages.push("Medical Director Signature");
      }
      if (!this.generalConsentForm.get('ManagerOnDutyName')?.value) {
        this.errorMessages.push("Manager On Duty Name");
      }
      if (this.generalConsentForm.get('ManagerOnDutySignature')?.value == '') {
        this.errorMessages.push("Manager On Duty Signature");
      }
    }

    if (this.errorMessages.length > 0) {
      $("#errorMsg").modal('show');
      return;
    }

    let payload = {
      "GeneralConsentID": this.GeneralConsentID,
      "PatientId": this.selectedView.PatientID,
      "Admissionid": this.AdmissionID,
      "PatientName": this.generalConsentForm.get('PatientName')?.value + "$" + this.generalConsentForm.get('PatientName1')?.value,
      "PatientName2L": this.generalConsentForm.get('PatientName2L')?.value + "$" + this.generalConsentForm.get('PatientName2L1')?.value,
      "Myself": this.isMyself ? 1 : 0,
      "OnbehalfOfPatient": this.onBehalfofPatient ? 1 : 0,
      "OnbehalfOfPatientName": this.generalConsentForm.get('OnbehalfOfPatientName')?.value,
      "OnbehalfOfPatientName2L": this.generalConsentForm.get('OnbehalfOfPatientName2L')?.value,
      "GeneralConsent": this.generalConsentForm.get('GeneralConsent')?.value,
      "GeneralConsent2L": this.generalConsentForm.get('GeneralConsent2L')?.value,
      "PatientOrRepresentativeName": this.generalConsentForm.get('PatientOrRepresentativeName')?.value,
      "PatientOrRepresentativeName2l": this.generalConsentForm.get('PatientOrRepresentativeName2l')?.value,
      "PatientOrRepresentativeSignature": this.generalConsentForm.get('PatientOrRepresentativeSignature')?.value,
      "PatientOrRepresentativeSignatureDate": this.currentdate + " " + this.currentTime,
      "DoctorSignature": this.generalConsentForm.get('base64StringSig2')?.value,
      "DoctorSignatureDate": this.currentdate + " " + this.currentTime,
      "PatientOrRepresentativeRelationID": this.generalConsentForm.get('PatientOrRepresentativeRelationID')?.value == '' ? "0" : this.generalConsentForm.get('PatientOrRepresentativeRelationID')?.value,
      "FirstNextOfKinName": this.generalConsentForm.get('FirstNextOfKinName')?.value,
      "FirstNextOfKinName2L": this.generalConsentForm.get('FirstNextOfKinName2L')?.value,
      "RelationID1": this.generalConsentForm.get('RelationID1')?.value == '' ? "0" : this.generalConsentForm.get('RelationID1')?.value,
      "FirstNextOfKinMobileNo": this.generalConsentForm.get('FirstNextOfKinMobileNo')?.value,
      "SecondNextOfKinName": this.generalConsentForm.get('SecondNextOfKinName')?.value,
      "SecondNextOfKinName2L": this.generalConsentForm.get('SecondNextOfKinName2L')?.value,
      "RelationID2": this.generalConsentForm.get('RelationID2')?.value == '' ? "0" : this.generalConsentForm.get('RelationID2')?.value,
      "MobileNo": this.generalConsentForm.get('MobileNo')?.value,
      "DoctorId": this.doctorDetails[0].EmpId,
      "SpecialiseID": this.SpecialiseID,
      "DoctorConsentDate": this.currentdate + " " + this.currentTime,
      "Hospitalid": this.hospId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": "333", //this.facility.FacilityID
      "SurgeryIds": this.surgeryIds !== '' ? this.surgeryIds : '',
      MedicalDirectorName: this.generalConsentForm.get('MedicalDirectorName')?.value,
      MedicalDirectorSignature: this.generalConsentForm.get('MedicalDirectorSignature')?.value,
      MedicalDirectorSignatureDate: this.generalConsentForm.get('MedicalDirectorSignatureDate')?.value,
      ManagerOnDutyName: this.generalConsentForm.get('ManagerOnDutyName')?.value,
      ManagerOnDutySignature: this.generalConsentForm.get('ManagerOnDutySignature')?.value,
      ManagerOnDutySignatureDate: this.generalConsentForm.get('ManagerOnDutySignatureDate')?.value,
    }
    this.config.SavePatientGeneralConsent(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#saveGeneralConsentMsg").modal('show');
          this.FetchPatientadmissionGeneralConsent();
        } else {

        }
      },
      (err) => {
        console.log(err)
      });

  }

  savenavigation() {
    this.savechanges.emit();
  }

  clear() {
    this.showContent = false;
    setTimeout(()=>{
      this.showContent = true;
    }, 0);
   this.unableToSign = false;
    this.IsSignature1Edit = true;
    this.IsSignature2Edit = true;
    this.IsSignature3Edit = true;
    this.isSameUser = true;
    this.isMyselfEdit = true;

    this.initialiseGeneralConsentForm();
    this.isMyself = false;
    this.onBehalfofPatient = false;
    this.unableToSign = false;
    this.showSignature = false;
    this.base64StringSig1 = '';
    this.base64StringSig2 = '';
    this.base64StringSig4 = '';
    this.base64StringSig5 = '';
    setTimeout(() => {
      this.showSignature = true;
    }, 0);
  }

  addSelectedGeneralConsent(con:any) {
    if (con.Class == "icon-w cursor-pointer") {
      con.Class = "icon-w cursor-pointer active";
    }
    $("#savedConsentsmodal").modal('hide');
    this.FetchPatientGeneralConsent(con.GeneralConsentID);
  }

  viewWorklist() {
    $("#savedConsentsmodal").modal('show');
  }
  fetchDoctorSignature() {
    const modalRef = this.modalService.open(ValidateEmployeeComponent);

    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.config.FetchEmployeeSignaturesBase64(this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, 3392, this.hospId)
          .subscribe((response: any) => {
            this.base64StringSig2 = response.FetchEmployeeSignaturesBase64DList[0].Base64Signature;
            this.showSignature = false; // to load the common component
            setTimeout(() => {
              this.showSignature = true;
            }, 0);

          },
            (err) => {
            })
      }
      modalRef.close();
    });
    
  }
  clearR1Signature() {
    if (this.signComponent1) {
      this.signComponent1.clearSignature();     
      this.generalConsentForm.patchValue({ PatientOrRepresentativeSignature: '' });
    }
  }
  clearR2Signature() {
    if (this.signComponent2) {
      this.signComponent2.clearSignature();     
      this.generalConsentForm.patchValue({ Signature1: '' });
    }
  }
  clearR3Signature() {
    if (this.signComponent3) {
      this.signComponent3.clearSignature();     
      this.generalConsentForm.patchValue({ Signature2: '' });
    }
  }
  GeneralConsentPrint() {        
    this.config.FetchPatientGeneralConsentPrint(this.GeneralConsentID, this.hospId).subscribe((response) => {
      if (response.Code == 200) {
        this.trustedUrl = response.FTPPATH;
        $("#showLabReportsModal").modal('show');
      }
    },
      (err) => {

      })
  }

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.contentDiv.nativeElement.parentNode;
        const nextSibling = this.contentDiv.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.contentDiv.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.contentDiv.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.contentDiv.nativeElement);
          }

          header.removeChild(space);

          $('#divscroll').addClass("template_scroll");
          this.IsPrint = false;
          this.IsView = this.IsViewActual;
        }, 500);
      }, 500);

      return;
    }
  }

  clearMedicalDirectorSignature() {
    if (this.signComponent4) {
      this.signComponent4.clearSignature();
      this.generalConsentForm.patchValue({ MedicalDirectorSignature: '' });
    }
  }

  clearManagerOnDutySignature() {
    if (this.signComponent5) {
      this.signComponent5.clearSignature();
      this.generalConsentForm.patchValue({ ManagerOnDutySignature: '' });
    }
  }

  base64MedicalDirectorSignature(event: any) {
    this.generalConsentForm.patchValue({ MedicalDirectorSignature: event });
  }

  base64ManagerOnDutySignature(event: any) {
    this.generalConsentForm.patchValue({ ManagerOnDutySignature: event });
  }

    onMedicalDirectorSelected(item:any) {
      this.listOfAnesthetists = [];
      this.generalConsentForm.patchValue({
        MedicalDirectorName : item.Name.trim()
      })
    }
  
    onManagerOnDutySelected(item:any) {
      this.listOfAnesthetists = [];
      this.generalConsentForm.patchValue({
        ManagerOnDutyName : item.Name.trim()
      })
    }
  
    searchEmployee(event: any) {
      if (event.target.value.length > 2) {
        const url = this.us.getApiUrl(sugsftchklst.FetchSSEmployees, 
          { name: event.target.value, UserId: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
        this.us.get(url)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.listOfAnesthetists = response.FetchSSEmployeesDataList;
            }
          },
            (err) => {
            })
      }
    }

  saveDisable() {
    if (this.GeneralConsentID) {
      const selectedConsent = this.admissionGeneralConsent.find((element: any) => {
        return element.GeneralConsentID === this.GeneralConsentID;
      });

      if (selectedConsent) {
        const modDate = new Date(selectedConsent.Createdate);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate.getTime() - modDate.getTime());
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours > this.doctorDetails[0]?.EformRestriction) {
          return true;
        }
      }
    }
    return false;
  }

  getOnBehalfTypeValue() {
    const obtv = $('#ddlobop').val();
    return obtv;
  }
}
