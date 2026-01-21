import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ConfigService } from 'src/app/services/config.service';
import * as moment from 'moment';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import { sugsftchklst } from '../consent-medical/consent-medical.component';
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
  selector: 'app-consent-hro',
  templateUrl: './consent-hro.component.html',
  styleUrls: ['./consent-hro.component.scss'],
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
export class ConsentHroComponent extends DynamicHtmlComponent implements OnInit {
  @Input() data: any;
  showContent = true;
  readonly = false;
  consentForm: any;
  myTextForm: any;
  myArabicTextForm: any;
  relations: any = [];
  selectedPatient: any;
  @Output() savechanges = new EventEmitter<any>();
  FetchPatadmAgaintDataList: any = [];
  ConsentHighRiskOperationID = 0;
  base64StringSig = '';
  base64StringSig1 = '';
  base64StringSig2 = '';
  base64StringSig3 = '';
  base64StringSig4 = '';
  base64StringSig5 = '';
  showSignature = false;
  IsView = false;
  @ViewChild('Sign1Ref', { static: false }) signComponent1: SignatureComponent | undefined;
  @ViewChild('Sign2Ref', { static: false }) signComponent2: SignatureComponent | undefined;
  @ViewChild('Sign3Ref', { static: false }) signComponent3: SignatureComponent | undefined;
  @ViewChild('Sign4Ref', { static: false }) signComponent4: SignatureComponent | undefined;
  @ViewChild('Sign5Ref', { static: false }) signComponent5: SignatureComponent | undefined;
  @Input() surgeryIds: string = "";

  @ViewChild('contentDiv') contentDiv!: ElementRef;
  IsSignature1Edit = true;
  IsSignature2Edit = true;
  IsSignature3Edit = true;
  isSameUser = true;
  PhysicianNameDocDesignation:any;
  selectedType: number = -1;


  requiredFields = [
    // { id: 'ta_SurgicalProdureName', message: 'Surgery Procedure Required', required: true }
  ];
  admissionID: any;
  doctorDetails: any;
  ward: any;
  IsPrint = false;
  IsViewActual = false;
  IsBloodTransfusionEdit = true;
  IsOtherProceduresEdit = true;
  listOfAnesthetists: any = [];
  
  constructor(private config: ConfigService, el: ElementRef, cdr: ChangeDetectorRef, renderer: Renderer2, private us: UtilityService) {
    super(renderer, el, cdr);
    this.selectedPatient = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.admissionID = this.selectedPatient.AdmissionID;
    if (!this.admissionID) {
      this.admissionID = sessionStorage.getItem("selectedPatientAdmissionId");
    }
    this.initializeForm();
  }

  initializeForm() {
    this.ConsentHighRiskOperationID = 0;
    this.consentForm = this.formBuilder.group({
      SurgicalProdureName: ['', Validators.required],
      SurgicalProdureName2L: ['', Validators.required],
      PerformedDate: [new Date(), Validators.required],
      ConsentRisk: ['', Validators.required],
      ConsentRisk2L: ['', Validators.required],
      IsBloodTransfusion: ['', Validators.required],
      BloodTransfusionRemarks: ['', Validators.required],
      BloodTransfusionRemarks2L: ['', Validators.required],
      IsOtherProcedures: ['', Validators.required],
      OtherProceduresRemarks: ['', Validators.required],
      OtherProceduresRemarks2L: ['', Validators.required],
      DoctorSignature: ['', Validators.required],
      RelativeName1: ['', Validators.required],
      RelativeName12L: ['', Validators.required],
      MobileNo1: ['', Validators.required],
      Signature1: ['', Validators.required],
      RelationID1: ['', Validators.required],
      RelativeName2: ['', Validators.required],
      RelativeName22L: ['', Validators.required],
      MobileNo2: ['', Validators.required],
      Signature2: ['', Validators.required],
      RelationID2: ['', Validators.required],
      DoctorName: [this.doctorDetails[0].EmployeeName + '-' + this.doctorDetails[0]?.UserName, Validators.required],
      Date: [moment(new Date()).format('DD-MMM-YYYY HH:mm'), Validators.required],
      Signature3: ['', Validators.required],
      ManagerOnDutyName: ['', Validators.required],
      MedicalDirectorName: ['', Validators.required],
      MedicalDirectorSignature: ['', Validators.required],
      ManagerOnDutySignature: ['', Validators.required],
      MedicalDirectorSignatureDate: [moment(new Date()).format('DD-MMM-YYYY HH:mm'), Validators.required],
      ManagerOnDutySignatureDate: [moment(new Date()).format('DD-MMM-YYYY HH:mm'), Validators.required] 
    });

    this.myTextForm = this.formBuilder.group({
      input1: [''],
      input2: [''],
      input3: [''],
      input4: [''],
      combinedText: ['']

    });

    this.myArabicTextForm = this.formBuilder.group({
      input5: [''],
      input6: [''],
      input7: [''],
      input8: [''],
      combinedArabicText: ['']
    });
  }

  ngOnInit(): void {
    this.PhysicianNameDocDesignation= this.doctorDetails[0].EmpDesignation; 

    
    this.FetchConsentFormPatientAdmissionDetails();
    this.FetchPatientRelatives();

    if (this.data) {
      this.readonly = this.data.readonly;
      this.FetchPatientConsentForHighRiskOperations(this.data.data.ConsentHighRiskOperationID);
    }
    else {
      this.FetchPatientadmissionAgaintConsentForHighRiskOperations();
    }
  }

  clear() {
    this.showContent = false;
    setTimeout(()=>{
      this.showContent = true;
    }, 0);

    this.selectedType = -1;
    this.IsSignature1Edit = true;
    this.IsSignature2Edit = true;
    this.IsSignature3Edit = true;
    this.isSameUser = true;
    this.IsBloodTransfusionEdit = true;
    this.IsOtherProceduresEdit = true;

    this.initializeForm();
    this.showSignature = false;
    this.base64StringSig = '';
    this.base64StringSig1 = '';
    this.base64StringSig2 = '';
    this.base64StringSig3 = '';
    this.base64StringSig4 = '';
    this.base64StringSig5 = '';
    setTimeout(() => {
      this.showSignature = true;
    }, 0);
    this.FetchConsentFormPatientAdmissionDetails();
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
          this.consentForm.patchValue({
            SurgicalProdureName: SurgicalProdureName,
            SurgicalProdureName2L: SurgicalProdureName2L ? SurgicalProdureName2L : SurgicalProdureName
          });
        }
      },
        (err) => {
        })
  }

  FetchPatientadmissionAgaintConsentForHighRiskOperations() {
    this.config.FetchPatientadmissionAgaintConsentForHighRiskOperations(this.admissionID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          // if (response.FetchPatadmAgaintDataList.length === 1) {
          //   this.FetchPatientConsentForHighRiskOperations(response.FetchPatadmAgaintDataList[0].ConsentHighRiskOperationID);
          // }
          // else {
            this.showSignature = true;
            this.FetchPatadmAgaintDataList = response.FetchPatadmAgaintDataList;
            if(this.FetchPatadmAgaintDataList.length > 0) {
              this.IsView = true;
              this.IsViewActual = true;
            }
          //}
        }
      },
        (err) => {
        })
  }

  FetchPatientConsentForHighRiskOperations(ConsentHighRiskOperationID: any) {
    $("#consentModal").modal('hide');
    this.config.FetchPatientConsentForHighRiskOperations(ConsentHighRiskOperationID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatientConsentForHighRiskOperationsDataList.length > 0) {
            var data = response.FetchPatientConsentForHighRiskOperationsDataList[0];
            if (data.ConsentRisk) {
              var array = data.ConsentRisk.split('$');

              if (array.length > 0) {
                this.myTextForm.patchValue({
                  input1: array.length > 0 ? array[0] : '',
                  input2: array.length > 1 ? array[1] : '',
                  input3: array.length > 2 ? array[2] : '',
                  input4: array.length > 3 ? array[3] : '',
                });
              }
            }
            else {
              this.myTextForm.reset();
            }

            if (data.ConsentRisk2L) {
              var array = data.ConsentRisk2L.split('$');

              if (array.length > 0) {
                this.myArabicTextForm.patchValue({
                  input5: array.length > 0 ? array[0] : '',
                  input6: array.length > 1 ? array[1] : '',
                  input7: array.length > 2 ? array[2] : '',
                  input8: array.length > 3 ? array[3] : '',
                });
              }
            }
            else {
              this.myArabicTextForm.reset();
            }
            this.base64StringSig = data.Signature3;
            this.base64StringSig1 = data.Signature1;
            this.base64StringSig2 = data.Signature2;
            //this.base64StringSig3 = data.Signature3;
            this.base64StringSig4 = data.MedicalDirectorSignature;
            this.base64StringSig5 = data.ManagerOnDutySignature;
            this.showSignature = false; // to load the common component
            setTimeout(() => {
              this.showSignature = true;
            }, 0);
            this.ConsentHighRiskOperationID = data.ConsentHighRiskOperationID;
            this.selectedType = Number(data.Myself);
            this.consentForm.patchValue({
              SurgicalProdureName: data.SurgicalProdureName,
              SurgicalProdureName2L: data.SurgicalProdureName2L,
              PerformedDate: new Date(data.PerformedDate),
              ConsentRisk: data.ConsentRisk,
              ConsentRisk2L: data.ConsentRisk2L,
              IsBloodTransfusion: data.IsBloodTransfusion,
              BloodTransfusionRemarks: data.BloodTransfusionRemarks,
              BloodTransfusionRemarks2L: data.BloodTransfusionRemarks2L,
              IsOtherProcedures: data.IsOtherProcedures,
              OtherProceduresRemarks: data.OtherProceduresRemarks,
              OtherProceduresRemarks2L: data.OtherProceduresRemarks2L,
             // DoctorSignature: data.DoctorSignature,
              RelativeName1: data.RelativeName1,
              RelativeName12L: data.RelativeName12L,
              MobileNo1: data.MobileNo1,
              Signature1: data.Signature1,
              RelationID1: data.RelationID1,
              RelativeName2: data.RelativeName2,
              RelativeName22L: data.RelativeName22L,
              MobileNo2: data.MobileNo2,
              Signature2: data.Signature2,
              DoctorSignature: data.Signature3,
              RelationID2: data.RelationID2,
              DoctorName:data.doctorName,
              Date: data.DoctorConsentDate,
              MedicalDirectorName: data.MedicalDirectorName,
              MedicalDirectorSignature: data.MedicalDirectorSignature,
              MedicalDirectorSignatureDate: data.MedicalDirectorSignatureDate,
              ManagerOnDutyName: data.ManagerOnDutyName,
              ManagerOnDutySignature: data.ManagerOnDutySignature,
              ManagerOnDutySignatureDate: data.ManagerOnDutySignatureDate
            });

            if (data.CreatedBy != this.doctorDetails[0]?.UserId) {
              this.isSameUser = false;
              if(this.base64StringSig) {
                this.IsSignature1Edit = false;
              }
              if(this.base64StringSig1) {
                this.IsSignature2Edit = false;
              }
              if(this.base64StringSig2) {
                this.IsSignature3Edit = false;
              }

             
              Object.keys(this.consentForm.controls).forEach(controlName => {
                const control = this.consentForm.get(controlName);
                if(controlName.includes("Relation") && control?.value > 0) {
                  control.disable();
                }
                else if (!controlName.includes("Relation") && control?.value) {
                  control.disable();
                }
              });

              if(data.IsBloodTransfusion) {
                this.IsBloodTransfusionEdit = false;
              }
              
              if(data.IsOtherProcedures) {
                this.IsOtherProceduresEdit = false;
              }

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
              if(this.consentForm.get("RelativeName1")?.value != '') {
                $('#ddlobop').val(1);
              }
              if(this.consentForm.get("RelativeName2")?.value != '') {
                $('#ddlobop').val(2);
              }
            }, 0);
          }
        }
      },
        (err) => {
        })
  }

  FetchPatientRelatives() {
    this.config.FetchPatientRelatives(this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.relations = response.SurgeryDemographicsDataaList;
        }
      },
        (err) => {
        })
  }

  updateCombinedText(): void {
    const inputValues = Object.values(this.myTextForm.value).join('$');
    this.consentForm.patchValue({ ConsentRisk: inputValues });
  }

  updateCombinedArabicText(): void {
    const inputValues = Object.values(this.myArabicTextForm.value).join('$');
    this.consentForm.patchValue({ ConsentRisk2L: inputValues });
  }

  toggleBloodTransfusion(): void {
    this.consentForm.get('IsBloodTransfusion').setValue(!this.consentForm.get('IsBloodTransfusion').value);
  }

  toggleOthers(): void {
    this.consentForm.get('IsOtherProcedures').setValue(!this.consentForm.get('IsOtherProcedures').value);
  }

  base64DoctorSignature(event: any) {
    this.consentForm.patchValue({ DoctorSignature: event });
  }

  base64Relative1Signature(event: any) {
    this.consentForm.patchValue({ Signature1: event });
  }

  base64Relative2Signature(event: any) {
    this.consentForm.patchValue({ Signature2: event });
  }

  SaveConsentHro() {
    this.errorMessages = [];this.errorMessagesF = [];
    this.errorMessagesF.push("The Following Fields are Mandatory");
    if (this.selectedType === -1) {
      this.errorMessages.push('Select type');
    }

     if (!this.consentForm.get('SurgicalProdureName').value) {
        this.errorMessages.push("Surgical procedure");
      }
       if (!this.consentForm.get('SurgicalProdureName2L').value) {
        this.errorMessages.push("Surgical procedure in Arabic");
      }
    if (!this.consentForm.get('DoctorName').value && this.consentForm.get('DoctorSignature').value) {
          this.errorMessages.push("Doctor Name");
        }

    if (this.consentForm.get('DoctorName').value && !this.consentForm.get('DoctorSignature').value) {
      this.errorMessages.push("Doctor Signature");
    }
    

    if (this.selectedType === 0 || this.selectedType === 1) {
      const ddlobopval = $('#ddlobop').val();
      if (ddlobopval == '0') {
        this.errorMessages.push("Please select On Behalf of Pateint type");
      }
      if (!this.consentForm.get('RelativeName1').value && ddlobopval == '1') {
        this.errorMessages.push("1st Relative Name /اسم القريب الأول");
      }
      if (this.consentForm.get('Signature1').value == '' && ddlobopval == '1') {
        this.errorMessages.push("1st Relative Signature");
      }
      if (!this.consentForm.get('RelativeName2').value && ddlobopval == '2') {
        this.errorMessages.push("2nd Relative Name: / الاسم النسبي الثاني");
      }
      if (this.consentForm.get('Signature2').value == '' && ddlobopval == '2') {
        this.errorMessages.push("2nd Relative Signature");
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

    if (this.errorMessages.length > 0) {
      $("#errorMsg").modal('show');
      return;
    }
    var payload = {
      "ConsentHighRiskOperationID": this.ConsentHighRiskOperationID,
      "PatientId": this.selectedPatient.PatientID,
      "Admissionid": this.admissionID,
      "SurgicalProdureName": this.consentForm.get('SurgicalProdureName').value,
      "SurgicalProdureName2L": this.consentForm.get('SurgicalProdureName2L').value,
      "PerformedDate": moment(this.consentForm.get('PerformedDate').value).format('DD-MMM-YYYY HH:mm'),
      "ConsentRisk": this.consentForm.get('ConsentRisk').value,
      "ConsentRisk2L": this.consentForm.get('ConsentRisk2L').value,
      "IsBloodTransfusion": this.consentForm.get('IsBloodTransfusion').value == "" ? false : true,
      "BloodTransfusionRemarks": this.consentForm.get('BloodTransfusionRemarks').value,
      "BloodTransfusionRemarks2L": this.consentForm.get('BloodTransfusionRemarks2L').value,
      "IsOtherProcedures": this.consentForm.get('IsOtherProcedures').value == '' ? false : this.consentForm.get('IsOtherProcedures').value,
      "OtherProceduresRemarks": this.consentForm.get('OtherProceduresRemarks').value,
      "OtherProceduresRemarks2L": this.consentForm.get('OtherProceduresRemarks2L').value,
      "DoctorId": this.doctorDetails[0].EmpId,
      "SpecialiseID": this.selectedPatient.SpecialiseID,
      "DoctorConsentDate": this.consentForm.get('Date').value,
      "RelativeName1": this.consentForm.get('RelativeName1').value,
      "RelativeName12L": this.consentForm.get('RelativeName12L').value,
      "Signature1": this.consentForm.get('Signature1').value,
      "MobileNo1": this.consentForm.get('MobileNo1').value,
      "RelationID1": this.consentForm.get('RelationID1').value == "" ? 0 : this.consentForm.get('RelationID1').value,
      "RelativeName2": this.consentForm.get('RelativeName2').value,
      "RelativeName22L": this.consentForm.get('RelativeName22L').value,
      "Signature2": this.consentForm.get('Signature2').value,
      "MobileNo2": this.consentForm.get('MobileNo2').value,
      "RelationID2": this.consentForm.get('RelationID2').value == "" ? 0 : this.consentForm.get('RelationID2').value,
      "Hospitalid": this.hospitalID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID ? this.ward.FacilityID : "3403",
      "SurgeryIds": this.surgeryIds !== '' ? this.surgeryIds : '',
      "Signature3": this.consentForm.get('DoctorSignature').value,
      MedicalDirectorName: this.consentForm.get('MedicalDirectorName').value,
      MedicalDirectorSignature: this.consentForm.get('MedicalDirectorSignature').value,
      MedicalDirectorSignatureDate: this.consentForm.get('MedicalDirectorSignatureDate').value,
      ManagerOnDutyName: this.consentForm.get('ManagerOnDutyName').value,
      ManagerOnDutySignature: this.consentForm.get('ManagerOnDutySignature').value,
      ManagerOnDutySignatureDate: this.consentForm.get('ManagerOnDutySignatureDate').value,
      "Myself": this.selectedType,
    }

    this.config.SaveConsentForHighRiskOperations(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#saveConsentMsg").modal('show');
          this.FetchPatientadmissionAgaintConsentForHighRiskOperations();
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

  viewWorklist() {
    $("#consentModal").modal('show');
  }

  clearDoctorSignature() {
    if (this.signComponent1) {
      this.signComponent1.clearSignature();
      this.consentForm.patchValue({ DoctorSignature: '' });
    }
  }

  clearR1Signature() {
    if (this.signComponent2) {
      this.signComponent2.clearSignature();
      this.consentForm.patchValue({ Signature1: '' });
    }
  }

  clearR2Signature() {
    if (this.signComponent3) {
      this.signComponent3.clearSignature();
      this.consentForm.patchValue({ Signature2: '' });
    }
  }

  clearMedicalDirectorSignature() {
    if (this.signComponent4) {
      this.signComponent4.clearSignature();
      this.consentForm.patchValue({ MedicalDirectorSignature: '' });
    }
  }

  clearManagerOnDutySignature() {
    if (this.signComponent5) {
      this.signComponent5.clearSignature();
      this.consentForm.patchValue({ ManagerOnDutySignature: '' });
    }
  }

  base64MedicalDirectorSignature(event: any) {
    this.consentForm.patchValue({ MedicalDirectorSignature: event });
  }

  base64ManagerOnDutySignature(event: any) {
    this.consentForm.patchValue({ ManagerOnDutySignature: event });
  }

  onMedicalDirectorSelected(item:any) {
    this.listOfAnesthetists = [];
    this.consentForm.patchValue({
      MedicalDirectorName : item.Name.trim()
    })
  }

  onManagerOnDutySelected(item:any) {
    this.listOfAnesthetists = [];
    this.consentForm.patchValue({
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

  fetchDoctorSignature() {
    const modalRef = this.modalService.open(ValidateEmployeeComponent);

    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.config.FetchEmployeeSignaturesBase64(this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, 3392, this.hospitalID)
        .subscribe((response: any) => {
          this.base64StringSig = response.FetchEmployeeSignaturesBase64DList[0].Base64Signature;
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

  onDateChange(event: any) {
    this.consentForm.patchValue({
      PerformedDate: event.value
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

  saveDisable() {
    if (this.ConsentHighRiskOperationID) {
      const selectedConsent = this.FetchPatadmAgaintDataList.find((element: any) => {
        return element.ConsentHighRiskOperationID === this.ConsentHighRiskOperationID;
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
