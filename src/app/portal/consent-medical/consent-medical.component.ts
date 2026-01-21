import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfigService } from 'src/app/services/config.service';
import * as moment from 'moment';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { MedicalAssessmentService } from '../medical-assessment/medical-assessment.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
declare var $: any;

@Component({
  selector: 'app-consent-medical',
  templateUrl: './consent-medical.component.html',
  styleUrls: ['./consent-medical.component.scss']
})
export class ConsentMedicalComponent extends DynamicHtmlComponent implements OnInit, OnDestroy {
  @Input() data: any;
  @Input() surgeryIds: string = "";
  readonly = false;
  MedicalInformedConsentID = 0;
  consentForm: any;
  selectedPatient: any;
  currentdate: any;
  currentTime: any;
  showSignature = true;
  base64StringPatientSig = '';
  PhysicianNameDoc: any;
  @ViewChild('SignPatient', { static: false }) signComponent1: SignatureComponent | undefined;
  base64StringSurgeonSig = '';
  @ViewChild('SignSurgeon', { static: false }) signComponent2: SignatureComponent | undefined;
  base64StringWitnessSig = '';
  @ViewChild('SignWitness', { static: false }) signComponent3: SignatureComponent | undefined;
  base64StringNextSig = '';
  @ViewChild('SignNextOfKin', { static: false }) signComponent4: SignatureComponent | undefined;
  base64StringGuardianSig = '';
  @ViewChild('SignGuardian', { static: false }) signComponent5: SignatureComponent | undefined;
  myComplicationsForm: any;
  myComplicationsArabicForm: any;
  @Output() savechanges = new EventEmitter<any>();
  FetchPatAdmMedicalInfConsentDataList: any = [];
  IsView = false;
  templateContent: any;
  selectedType: number = -1;

  showContent = true;
  IsSignature1Edit = true;
  IsSignature2Edit = true;
  IsSignature3Edit = true;
  IsSignature4Edit = true;
  IsSignature5Edit = true;
  isSameUser = true;
  IsSurgeryEdit = true;

  @ViewChild('contentDiv') contentDiv!: ElementRef;

  requiredFields = [];
  listOfAnesthetists: any = [];
  doctorDetails: any;
  admissionID: any;
  ward: any;
  IsPrint = false;
  IsViewActual = false;
  wardID: any;
  surgeriesList: any = [];
  PhysicianNameDocDesignation: any;
  PhysicianNameDocDesignationT: any;

  @ViewChild('Sign4Ref', { static: false }) signComponent6: SignatureComponent | undefined;
  @ViewChild('Sign5Ref', { static: false }) signComponent7: SignatureComponent | undefined;

  base64StringSig4 = '';
  base64StringSig5 = '';

  constructor(private config: ConfigService, private service: MedicalAssessmentService, private us: UtilityService, el: ElementRef, cdr: ChangeDetectorRef, renderer: Renderer2) {
    super(renderer, el, cdr);
    this.selectedPatient = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    if (this.selectedPatient.PatientType === '3') {
      this.selectedPatient.PatientName2l = this.selectedPatient.PatientName2L;
    }
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
    if (!this.wardID) {
      this.wardID = this.doctorDetails[0].FacilityId;
    }
    this.admissionID = this.selectedPatient.AdmissionID;
    if (!this.admissionID) {
      this.admissionID = sessionStorage.getItem("selectedPatientAdmissionId");
    }
    this.initializeForm();
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY');
    this.currentTime = moment(new Date()).format('H:mm');
  }

  ngOnInit(): void {
    this.PhysicianNameDoc = this.doctorDetails[0].EmployeeName + '-' + this.doctorDetails[0]?.UserName;
    this.PhysicianNameDocDesignation = this.doctorDetails[0].EmpDesignation;
    this.PhysicianNameDocDesignationT = this.doctorDetails[0]?.UserName + '-' + this.doctorDetails[0].EmployeeName + '-' + this.doctorDetails[0].EmpDesignation;
    this.FetchConsentFormPatientAdmissionDetails();
    if (this.data) {
      this.readonly = this.data.readonly;
      this.FetchPatientMedicalInformedConsent(this.data.data.MedicalInformedConsentID);
    }
    else {
      this.FetchPatientAdmissionMedicalInformedConsent();
    }
    this.FetchTemplateSurgeryDataNN();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const storedContent = sessionStorage.getItem("templatecontent");
      if (storedContent) {
        this.templateContent = JSON.parse(storedContent);
        const procedureNames = this.templateContent.map((item: any) => item.ProcedureName).join(', ');
        const ProcedureName2L = this.templateContent.map((item: any) => item.ProcedureName2L).join(', ');
        const mostCommonGeneralComplications = this.templateContent.map((item: any) => item.MostCommonGeneralComplications).join(', ');
        const mostCommonGeneralComplications2L = this.templateContent.map((item: any) => item.MostCommonGeneralComplications2L).join(', ');
        const mostCommonSpecificComplications = this.templateContent.map((item: any) => item.MostCommonSpecificComplications).join(', ');
        const mostCommonSpecificComplications2L = this.templateContent.map((item: any) => item.MostCommonSpecificComplications2L).join(', ');

        this.bindTextboxValue('text_surgical_procedure_name', procedureNames);
        this.bindTextboxValue('txtArea_SurgicalProdureName2L', ProcedureName2L == "" ? procedureNames : ProcedureName2L);
        // this.bindTextboxValue('txtArea_PossibleAlternatives', mostCommonGeneralComplications);
        // this.bindTextboxValue('txtArea_PossibleAlternatives2l', mostCommonGeneralComplications2L);
        this.bindTextboxValue('txtArea_PotentialComplication', mostCommonGeneralComplications);
        this.bindTextboxValue('txtArea_PotentialComplication2l', mostCommonGeneralComplications2L);
      }
    }, 3000);
  }

  toggleSurgery(): void {
    this.consentForm.get('IsSurgery').setValue(!this.consentForm.get('IsSurgery').value);
    this.consentForm.get('IsInvasiveProcedure').setValue(false);
  }

  toggleInvasiveProcedure(): void {
    this.consentForm.get('IsInvasiveProcedure').setValue(!this.consentForm.get('IsInvasiveProcedure').value);
    this.consentForm.get('IsSurgery').setValue(false);
  }

  initializeForm() {
    this.MedicalInformedConsentID = 0;
    this.consentForm = this.formBuilder.group({
      IsSurgery: [false],
      IsInvasiveProcedure: [false],
      SurgicalProdureName: ['', Validators.required],
      SurgicalProdureName2L: ['', Validators.required],

      PossibleAlternatives: ['', Validators.required],
      PossibleAlternatives2l: ['', Validators.required],

      MedicallyNecessary: ['', Validators.required],
      MedicallyNecessary2L: ['', Validators.required],
      PotentialComplication: ['', Validators.required],
      PotentialComplication2L: ['', Validators.required],
      PatientName: [''],
      PatientName2L: [''],
      Undersigned: [''],
      Undersigned2L: [''],
      PatientSignature: [''],
      PatientCensentDate: [new Date()],
      SurgeonOrTreatingPhysicianID: [''],
      SurgeonOrTreatingPhysicianDesignation: [''],
      SurgeonOrPhysicianCensentDate: [new Date()],
      WitnessName: [''],
      WitnessName2L: [''],
      WitnessSignature: [''],
      WitnessCensentDate: [new Date()],
      NextOfKinName: [''],
      NextOfKinName2L: [''],
      NextOfKinSignature: [''],
      NextOfKinCensentDate: [new Date()],
      GuardianName: [''],
      GuardianName2L: [''],
      GuardianOthers: [''],
      GuardianSignature: [''],
      GuardianCensentDate: [new Date()],
      GuardianRelationID: [''],
      SurgeonSignature: [''],
      GuardianSignConsent: [''],
      GuardianSignConsent2l: [''],
      Myself: [''],
      onBehalfofPatient: [''],
      RelativeName: [''],
      ManagerOnDutyName: ['', Validators.required],
      MedicalDirectorName: ['', Validators.required],
      MedicalDirectorSignature: ['', Validators.required],
      ManagerOnDutySignature: ['', Validators.required],
      MedicalDirectorSignatureDate: [moment(new Date()).format('DD-MMM-YYYY HH:mm'), Validators.required],
      ManagerOnDutySignatureDate: [moment(new Date()).format('DD-MMM-YYYY HH:mm'), Validators.required]
    });

    this.myComplicationsForm = this.formBuilder.group({
      input1: [''],
      input2: [''],
      combinedText: ['']
    });

    this.myComplicationsArabicForm = this.formBuilder.group({
      input3: [''],
      input4: [''],
      combinedArabicText: ['']
    });
  }

  updateCombinedText(): void {
    const inputValues = Object.values(this.myComplicationsForm.value).join('$');
    this.consentForm.patchValue({ PotentialComplication: inputValues });
  }

  updateCombinedArabicText(): void {
    const inputValues = Object.values(this.myComplicationsArabicForm.value).join('$');
    this.consentForm.patchValue({ PotentialComplication2L: inputValues });
  }

  FetchConsentFormPatientAdmissionDetails() {
    this.config.FetchConsentFormPatientAdmissionDetails(this.admissionID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          var SurgicalProdureName = '';
          var SurgicalProdureName2L = '';

          if (response.PatientConsentSurgeryInfoList.length > 0) {
            SurgicalProdureName = response.PatientConsentSurgeryInfoList.filter((item: any) => item.SurgeryName !== '').map((item: any) => item.SurgeryName).join(', ');
            SurgicalProdureName2L = response.PatientConsentSurgeryInfoList.filter((item: any) => item.SurgeryName2l !== '').map((item: any) => item.SurgeryName2l).join(', ');
          }

          // if (response.PatientConsentProceduresInfoList.length > 0) {
          //   SurgicalProdureName += response.PatientConsentProceduresInfoList.filter((item: any) => item.TestName !== '').map((item: any) => item.TestName).join(', ');
          //   SurgicalProdureName2L += response.PatientConsentProceduresInfoList.filter((item: any) => item.TestName2l !== '').map((item: any) => item.TestName2l).join(', ');
          // }
          this.selectedPatient.PatientName = response.PatientInfoDataList[0]?.PatientName;
          this.selectedPatient.PatientName2L = response.PatientInfoDataList[0]?.PatientName2l;
          this.consentForm.patchValue({
            PatientName: response.PatientInfoDataList[0]?.PatientName,
            PatientName2L: response.PatientInfoDataList[0]?.PatientName2l,
            Undersigned: response.PatientInfoDataList[0]?.PatientName,
            Undersigned2L: response.PatientInfoDataList[0]?.PatientName2l,
            //NextOfKinName : response.PatientInfoDataList[0]?.RelativeName,
            SurgicalProdureName: SurgicalProdureName,
            SurgicalProdureName2L: SurgicalProdureName2L ? SurgicalProdureName2L : SurgicalProdureName,
            SurgeonOrTreatingPhysicianID: this.doctorDetails[0]?.UserName + '-' + this.doctorDetails[0].EmployeeName,
            SurgeonOrTreatingPhysicianDesignation: this.doctorDetails[0]?.EmpDesignation
          });
        }
      },
        (err) => {
        })
  }

  base64PatientSignature(event: any) {
    this.consentForm.patchValue({ PatientSignature: event });
  }

  clearPatientSignature() {
    if (this.signComponent1) {
      this.signComponent1.clearSignature();
      this.consentForm.patchValue({ PatientSignature: '' });
    }
  }
  base64SurgeonSignature(event: any) {
    this.consentForm.patchValue({ SurgeonSignature: event });
  }

  clearSurgeonSignature() {
    if (this.signComponent2) {
      this.signComponent2.clearSignature();
      this.consentForm.patchValue({ SurgeonSignature: '' });
    }
  }

  base64WitnessSignature(event: any) {
    this.consentForm.patchValue({ WitnessSignature: event });
  }

  clearWitnessSignature() {
    if (this.signComponent3) {
      this.signComponent3.clearSignature();
      this.consentForm.patchValue({ WitnessSignature: '' });
    }
  }

  base64NextSignature(event: any) {
    this.consentForm.patchValue({ NextOfKinSignature: event });
  }

  clearNextSignature() {
    if (this.signComponent4) {
      this.signComponent4.clearSignature();
      this.consentForm.patchValue({ NextOfKinSignature: '' });
    }
  }

  base64GuardianSignature(event: any) {
    this.consentForm.patchValue({ GuardianSignature: event });
  }

  clearGuardianSignature() {
    if (this.signComponent5) {
      this.signComponent5.clearSignature();
      this.consentForm.patchValue({ GuardianSignature: '' });
    }
  }

  clear() {
    this.showContent = false;
    setTimeout(() => {
      this.showContent = true;
    }, 0);
    this.selectedType = -1;
    this.IsSignature1Edit = true;
    this.IsSignature2Edit = true;
    this.IsSignature3Edit = true;
    this.IsSignature4Edit = true;
    this.IsSignature5Edit = true;
    this.isSameUser = true;
    this.IsSurgeryEdit = true;

    this.initializeForm();
    this.showSignature = false;
    this.base64StringPatientSig = '';
    this.base64StringSurgeonSig = '';
    this.base64StringWitnessSig = '';
    this.base64StringNextSig = '';
    this.base64StringGuardianSig = '';
    this.base64StringSig4 = '';
    this.base64StringSig5 = '';
    setTimeout(() => {
      this.showSignature = true;
    }, 0);
    this.FetchConsentFormPatientAdmissionDetails();
  }

  SaveConsentMedical() {
    this.errorMessages = [];  this.errorMessagesF = [];
    this.errorMessagesF.push("The Following Fields are Mandatory");
    if (this.selectedType === -1) {
      this.errorMessages.push('select type');
    }
    if (this.consentForm.get('SurgeonOrTreatingPhysicianID').value && !this.consentForm.get('SurgeonSignature').value) {
      this.errorMessages.push("Surgeon Signature");
    }
    if (!this.consentForm.get('SurgeonOrTreatingPhysicianID').value && this.consentForm.get('SurgeonSignature').value) {
      this.errorMessages.push("Surgeon Name");
    }

    if (!this.consentForm.get('WitnessName').value) {
      this.errorMessages.push("Witness Name");
    }
    if (this.consentForm.get('WitnessSignature').value == '') {
      this.errorMessages.push("Witness Signature");
    }

    if (this.selectedType === 0) { 
      if (!this.consentForm.get('PatientName').value) {
        this.errorMessages.push("Patient Name");
      }
      if (!this.consentForm.get('PatientSignature').value) {
        this.errorMessages.push("Patient Signature");
      }
      if (!this.consentForm.get('PatientName2L').value) {
        this.errorMessages.push("Patient Name in Arabic");
      }
    }

    if (this.selectedType === 1) {
      const ddlobopval = $('#ddlobop').val();
      if (ddlobopval == '0') {
        this.errorMessages.push("Please select On Behalf of Pateint type");
      }
      if (this.consentForm.get('GuardianName').value == '' && ddlobopval == '2') {
        this.errorMessages.push("Guardian / Relationship");
      }
      if (this.consentForm.get('GuardianSignature').value == '' && ddlobopval == '2') {
        this.errorMessages.push("Guardian Signature");
      }
      if (!this.consentForm.get('GuardianOthers').value && ddlobopval == '2') {
        this.errorMessages.push("Guardian Name");
      }
      if (!this.consentForm.get('NextOfKinSignature').value && ddlobopval == '1') {
        this.errorMessages.push("Next of kin Signature");
      }
      if (!this.consentForm.get('NextOfKinName').value && ddlobopval == '1') {
        this.errorMessages.push("Next of kin Name");
      }
    }

    if (this.selectedType === 2) {
      if (!this.consentForm.get('MedicalDirectorName').value) {
        this.errorMessages.push("Medical Director Name");
      }
      if (this.consentForm.get('MedicalDirectorSignature').value == '') {
        this.errorMessages.push("Medical Director Signature");
      }
      if (!this.consentForm.get('ManagerOnDutyName').value) {
        this.errorMessages.push("Manager On Duty Name");
      }
      if (this.consentForm.get('ManagerOnDutySignature').value == '') {
        this.errorMessages.push("Manager On Duty Signature");
      }
    }

    if (!this.consentForm.get('Undersigned').value) {
      this.errorMessages.push("'I undersigned' Name");
    }
    if (!this.consentForm.get('Undersigned2L').value) {
      this.errorMessages.push("'I undersigned' Name in Arabic");
    }
    if(!$("#txt_PhysicianNameDocDesignationT").val()) {
      this.errorMessages.push("'Authorize the Surgeon/Treating Physician'");
    }
    if (!$("#text_surgical_procedure_name").val()) {
      this.errorMessages.push("'To perform the following Surgery/Invasive Procedure'");
    }
    if(!$("#txtArea_SurgicalProdureName2L").val()) {
      this.errorMessages.push("'To perform the following Surgery/Invasive Procedure in Arabic'");
    }

    if (!this.consentForm.get('IsSurgery').value && !this.consentForm.get('IsInvasiveProcedure').value) {
      this.errorMessages.push("Select Surgery / Invasive Procedure");
    }

    if (!this.consentForm.get('PossibleAlternatives').value) {
      this.errorMessages.push("Possible Alternatives");
    }
    if(!this.consentForm.get('PossibleAlternatives2l').value) {
      this.errorMessages.push("Possible Alternatives in Arabic");
    }

    if (!$("#txtArea_PotentialComplication").val()) {
      this.errorMessages.push("Potential Complications");
    }
    if(!$("#txtArea_PotentialComplication2l").val()) {
      this.errorMessages.push("Potential Complications in Arabic");
    }

    if (this.errorMessages.length > 0) {
      $("#errorMsg").modal('show');
      return;
    }
    var payload = {
      "MedicalInformedConsentID": this.MedicalInformedConsentID,
      "PatientId": this.selectedPatient.PatientID,
      "Admissionid": this.admissionID,
      "IsSurgery": this.consentForm.get('IsSurgery').value,
      "IsInvasiveProcedure": this.consentForm.get('IsInvasiveProcedure').value,
      "AuthorizeSurgeonOrPhysicianID": this.doctorDetails[0]?.EmpId,
      "SpecialiseID": this.selectedPatient.SpecialiseID,
      "ProcedureName": $("#text_surgical_procedure_name").val(),//this.consentForm.get('SurgicalProdureName').value,
      "ProcedureName2L": $("#txtArea_SurgicalProdureName2L").val(),
      "PossibleAlternatives": this.consentForm.get('PossibleAlternatives').value,
      "PossibleAlternatives2l": this.consentForm.get('PossibleAlternatives2l').value,
      "MedicallyNecessary": this.consentForm.get('MedicallyNecessary').value,
      "MedicallyNecessary2L": this.consentForm.get('MedicallyNecessary2L').value,
      "PotentialComplication": $("#txtArea_PotentialComplication").val(),//this.consentForm.get('PotentialComplication').value,
      "PotentialComplication2L": $("#txtArea_PotentialComplication2l").val(),//this.consentForm.get('PotentialComplication2L').value,
      "PatientName": this.consentForm.get('PatientName').value,
      "PatientName2L": this.consentForm.get('PatientName2L').value,
      "Undersigned": this.consentForm.get('Undersigned').value,
      "Undersigned2L": this.consentForm.get('Undersigned2L').value,
      "PatientSignature": this.consentForm.get('PatientSignature').value,
      "PatientCensentDate": moment(this.consentForm.get('PatientCensentDate').value).format('DD-MMM-YYYY HH:mm'),
      "SurgeonOrTreatingPhysicianID": this.consentForm.get('SurgeonOrTreatingPhysicianID').value,//this.doctorDetails[0]?.EmpId,
      "SurgeonOrPhysicianCensentDate": moment(this.consentForm.get('SurgeonOrPhysicianCensentDate').value).format('DD-MMM-YYYY HH:mm'),
      "SurgeonOrTreatingPhysicianSignature": this.consentForm.get('SurgeonSignature').value,
      "WitnessName": this.consentForm.get('WitnessName').value,
      "WitnessName2L": this.consentForm.get('WitnessName').value,
      "WitnessSignature": this.consentForm.get('WitnessSignature').value,
      "WitnessCensentDate": moment(this.consentForm.get('WitnessCensentDate').value).format('DD-MMM-YYYY HH:mm'),
      "NextOfKinName": this.consentForm.get('NextOfKinName').value,
      "NextOfKinName2L": this.consentForm.get('NextOfKinName').value,
      "NextOfKinSignature": this.consentForm.get('NextOfKinSignature').value,
      "NextOfKinCensentDate": moment(this.consentForm.get('NextOfKinCensentDate').value).format('DD-MMM-YYYY HH:mm'),
      "GuardianName": this.consentForm.get('GuardianName').value + '-' + this.consentForm.get('GuardianOthers').value,
      "GuardianName2L": this.consentForm.get('GuardianName').value + '-' + this.consentForm.get('GuardianOthers').value,
      "GuardianSignature": this.consentForm.get('GuardianSignature').value,
      "GuardianCensentDate": moment(this.consentForm.get('GuardianCensentDate').value).format('DD-MMM-YYYY HH:mm'),
      "GuardianRelationID": "0",
      "Hospitalid": this.hospitalID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID ? this.ward.FacilityID : this.wardID,
      "GuardianSignConsent": this.consentForm.get('GuardianSignConsent').value,
      "GuardianSignConsent2l": this.consentForm.get('GuardianSignConsent2l').value,
      "SurgeryIds": this.surgeryIds !== '' ? this.surgeryIds : '',
      "Myself": this.selectedType,
      MedicalDirectorName: this.consentForm.get('MedicalDirectorName')?.value,
      MedicalDirectorSignature: this.consentForm.get('MedicalDirectorSignature')?.value,
      MedicalDirectorSignatureDate: this.consentForm.get('MedicalDirectorSignatureDate')?.value,
      ManagerOnDutyName: this.consentForm.get('ManagerOnDutyName')?.value,
      ManagerOnDutySignature: this.consentForm.get('ManagerOnDutySignature')?.value,
      ManagerOnDutySignatureDate: this.consentForm.get('ManagerOnDutySignatureDate')?.value,
    }

    this.config.SavePatientMedicalInformedConsent(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#saveConsentMedicalMsg").modal('show');
          this.FetchPatientAdmissionMedicalInformedConsent();
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

  FetchPatientAdmissionMedicalInformedConsent() {
    this.config.FetchPatientAdmissionMedicalInformedConsent(this.admissionID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          // if (response.FetchPatAdmMedicalInfConsentDataList.length === 1) {
          //   this.FetchPatientMedicalInformedConsent(response.FetchPatAdmMedicalInfConsentDataList[0].MedicalInformedConsentID);
          // }
          // else {
          this.showSignature = true;
          this.FetchPatAdmMedicalInfConsentDataList = response.FetchPatAdmMedicalInfConsentDataList;
          if (this.FetchPatAdmMedicalInfConsentDataList.length > 0) {
            this.IsView = true;
            this.IsViewActual = true;
          }
          //}
        }
      },
        (err) => {
        })
  }

  FetchPatientMedicalInformedConsent(MedicalInformedConsentID: any) {
    $("#consentMedicalModal").modal('hide');
    this.config.FetchPatientMedicalInformedConsent(MedicalInformedConsentID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatientMedicalInformedConsentDataList.length > 0) {

            this.showContent = false;
            setTimeout(() => {
              this.showContent = true;
            }, 0);

            this.IsSignature1Edit = true;
            this.IsSignature2Edit = true;
            this.IsSignature3Edit = true;
            this.IsSignature4Edit = true;
            this.IsSignature5Edit = true;
            this.IsSurgeryEdit = true;
            this.isSameUser = true;

            var data = response.FetchPatientMedicalInformedConsentDataList[0];

            if (data.PotentialComplication) {
              var array = data.PotentialComplication.split('$');

              if (array.length > 0) {
                this.myComplicationsForm.patchValue({
                  input1: array.length > 0 ? array[0] : '',
                  input2: array.length > 1 ? array[1] : '',
                });
              }
            }
            else {
              this.myComplicationsForm.reset();
            }

            if (data.PotentialComplication2L) {
              var array = data.PotentialComplication2L.split('$');

              if (array.length > 0) {
                this.myComplicationsArabicForm.patchValue({
                  input3: array.length > 0 ? array[0] : '',
                  input4: array.length > 1 ? array[1] : '',
                });
              }
            }
            else {
              this.myComplicationsArabicForm.reset();
            }
            this.base64StringPatientSig = data.PatientSignature;
            this.base64StringSurgeonSig = data.SurgeonOrTreatingPhysicianSignature;
            this.base64StringWitnessSig = data.WitnessSignature;
            this.base64StringNextSig = data.NextOfKinSignature;
            this.base64StringGuardianSig = data.GuardianSignature;
            this.base64StringSig4 = data.MedicalDirectorSignature;
            this.base64StringSig5 = data.ManagerOnDutySignature;
            this.showSignature = false; // to load the common component
            setTimeout(() => {
              this.showSignature = true;
            }, 0);
            this.MedicalInformedConsentID = data.MedicalInformedConsentID;
            this.PhysicianNameDoc = data.AuthorizeSurgeonOrPhysician;
            this.PhysicianNameDocDesignation = data.AuthorizeSurgeonOrPhysicianDesignation;

            this.selectedType = Number(data.Myself);
            this.consentForm.patchValue({
              IsSurgery: data.IsSurgery === "True" ? true : false,
              IsInvasiveProcedure: data.IsInvasiveProcedure === "True" ? true : false,
              SurgicalProdureName: data.ProcedureName,
              SurgicalProdureName2L: data.ProcedureName2L,
              PossibleAlternatives: data.PossibleAlternatives,
              PossibleAlternatives2l: data.PossibleAlternatives2l,
              MedicallyNecessary: data.MedicallyNecessary,
              MedicallyNecessary2L: data.MedicallyNecessary2L,
              PotentialComplication: data.PotentialComplication,
              PotentialComplication2L: data.PotentialComplication2L,
              PatientName: data.PatientName,
              PatientName2L: data.PatientName2L,
              Undersigned: data.Undersigned,
              Undersigned2L: data.Undersigned2L,
              PatientSignature: data.PatientSignature,
              PatientCensentDate: data.PatientCensentDate,
              SurgeonOrTreatingPhysicianID: data.SurgeonOrTreatingPhysicianEmpNo,// +"-"+data.SurgeonOrTreatingPhysician,
              SurgeonOrTreatingPhysicianDesignation: data.SurgeonOrTreatingPhysicianDesignation,
              //SurgeonOrTreatingPhysicianDesignation:data.
              SurgeonOrPhysicianCensentDate: data.SurgeonOrPhysicianCensentDate,
              WitnessName: data.WitnessName,
              WitnessName2L: data.WitnessName2L,
              WitnessSignature: data.WitnessSignature,
              WitnessCensentDate: data.WitnessCensentDate,
              NextOfKinName: data.NextOfKinName,
              NextOfKinName2L: data.NextOfKinName2L,
              NextOfKinSignature: data.NextOfKinSignature,
              NextOfKinCensentDate: data.NextOfKinCensentDate,
              GuardianName: data.GuardianName?.split('-')[0],
              GuardianName2L: data.GuardianName2L?.split('-')[0],
              GuardianOthers: data.GuardianName?.split('-').length > 1 ? data.GuardianName?.split('-')[1] : '',
              GuardianSignature: data.GuardianSignature,
              GuardianCensentDate: data.GuardianCensentDate,
              GuardianRelationID: data.GuardianRelationID,
              SurgeonSignature: data.SurgeonOrTreatingPhysicianSignature,
              GuardianSignConsent: data.GuardianSignConsent,
              GuardianSignConsent2l: data.GuardianSignConsent2l,
              Myself: data.Myself === '0' ? false : true,
              MedicalDirectorName: data.MedicalDirectorName,
              MedicalDirectorSignature: data.MedicalDirectorSignature,
              MedicalDirectorSignatureDate: data.MedicalDirectorSignatureDate,
              ManagerOnDutyName: data.ManagerOnDutyName,
              ManagerOnDutySignature: data.ManagerOnDutySignature,
              ManagerOnDutySignatureDate: data.ManagerOnDutySignatureDate
            });

            this.PhysicianNameDocDesignationT = data?.AuthorizeSurgeonOrPhysicianEmpNo + '-' + data?.AuthorizeSurgeonOrPhysicianName + '-' + data?.AuthorizeSurgeonOrPhysicianDesignation;

            if (data.CreatedBy != this.doctorDetails[0]?.UserId) {
              this.isSameUser = false;
              // if(this.base64StringSig) {
              //   this.IsSignature1Edit = false;
              // }
              if (this.base64StringPatientSig) {
                this.IsSignature1Edit = false;
              }
              if (this.base64StringSurgeonSig) {
                this.IsSignature2Edit = false;
              }
              if (this.base64StringWitnessSig) {
                this.IsSignature3Edit = false;
              }
              if (this.base64StringNextSig) {
                this.IsSignature4Edit = false;
              }
              if (this.base64StringGuardianSig) {
                this.IsSignature5Edit = false;
              }

              if (data.IsSurgery === "True" ? true : false || data.IsInvasiveProcedure === "True" ? true : false) {
                this.IsSurgeryEdit = false;
              }

              Object.keys(this.consentForm.controls).forEach(controlName => {
                const control = this.consentForm.get(controlName);
                if (controlName.includes("Relation") && control?.value > 0) {
                  control?.disable();
                }
                else if (!controlName.includes("Relation") && control?.value) {
                  control.disable();
                }
              });

              Object.keys(this.myComplicationsForm.controls).forEach(controlName => {
                const control = this.myComplicationsForm.get(controlName);
                if (control?.value) {
                  control.disable();
                }
              });

              Object.keys(this.myComplicationsArabicForm.controls).forEach(controlName => {
                const control = this.myComplicationsArabicForm.get(controlName);
                if (control?.value) {
                  control.disable();
                }
              });
            }
            setTimeout(()=>{
              if(this.consentForm.get("NextOfKinName")?.value != '') {
                $('#ddlobop').val(1);
              }
              if(this.consentForm.get("GuardianName")?.value != '') {
                $('#ddlobop').val(2);
              }
            }, 0);
            
          }
        }
      },
        (err) => {
        })
  }

  saveDisable() {
    if (this.MedicalInformedConsentID) {
      const selectedConsent = this.FetchPatAdmMedicalInfConsentDataList.find((element: any) => {
        return element.MedicalInformedConsentID === this.MedicalInformedConsentID;
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

  viewWorklist() {
    $("#consentMedicalModal").modal('show');
  }

  searchEmployee(event: any) {
    if (event.target.value.length > 2) {
      const url = this.service.getData(sugsftchklst.FetchSSEmployees,
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

  onWitnessnurseSelected(item: any) {
    this.consentForm.patchValue({
      WitnessName: item.Name.trim()
    })
  }
  onSurgeontechinicainSelected(item: any) {
    this.consentForm.patchValue({
      SurgeonOrTreatingPhysicianID: item.Name.trim(),
      SurgeonOrTreatingPhysicianDesignation: item.Designation.trim()
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

  FetchTemplateSurgeryDataNN() {
    const url = this.service.getData(sugsftchklst.FetchTemplateSurgeryDataNN,
      { WorkStationID: this.ward.FacilityID ? this.ward.FacilityID : this.wardID, HospitalID: this.hospitalID });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.surgeriesList = response.FetchTemplateSurgeryDataNNDataList;
        }
      },
        (err) => {
        })
  }

  onSurgeriesSelected(event: any) {
    const surgerid = event.target.value;
    const surgeryCompl = this.surgeriesList.find((x: any) => x.ProcedureID === surgerid);
    if (surgeryCompl) {
      this.myComplicationsForm.patchValue({
        input1: surgeryCompl.PotentialComplications,
      });
      this.myComplicationsArabicForm.patchValue({
        input3: surgeryCompl.PotentialComplicationsAR,
      });
      this.consentForm.patchValue({
        PossibleAlternatives: surgeryCompl.PossibleAlternatives,
        PossibleAlternatives2l: surgeryCompl.PossibleAlternativesAR,
      });
    }
    else {
      this.myComplicationsForm.patchValue({
        input1: '',
      });
      this.myComplicationsArabicForm.patchValue({
        input3: '',
      });
      this.consentForm.patchValue({
        PossibleAlternatives: '',
        PossibleAlternatives2l: '',
      });
    }
  }

  clearMedicalDirectorSignature() {
    if (this.signComponent6) {
      this.signComponent6.clearSignature();
      this.consentForm.patchValue({ MedicalDirectorSignature: '' });
    }
  }

  clearManagerOnDutySignature() {
    if (this.signComponent7) {
      this.signComponent7.clearSignature();
      this.consentForm.patchValue({ ManagerOnDutySignature: '' });
    }
  }

  base64MedicalDirectorSignature(event: any) {
    this.consentForm.patchValue({ MedicalDirectorSignature: event });
  }

  base64ManagerOnDutySignature(event: any) {
    this.consentForm.patchValue({ ManagerOnDutySignature: event });
  }

  onMedicalDirectorSelected(item: any) {
    this.listOfAnesthetists = [];
    this.consentForm.patchValue({
      MedicalDirectorName: item.Name.trim()
    })
  }

  onManagerOnDutySelected(item: any) {
    this.listOfAnesthetists = [];
    this.consentForm.patchValue({
      ManagerOnDutyName: item.Name.trim()
    })
  }
  
  getOnBehalfTypeValue() {
    const obtv = $('#ddlobop').val();
    return obtv;
  }
}

export const sugsftchklst = {
  FetchSSEmployees: "FetchSSEmployees?name=${name}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
  FetchTemplateSurgeryDataNN: 'FetchTemplateSurgeryDataNN?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
}