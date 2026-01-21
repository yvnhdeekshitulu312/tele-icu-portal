import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { MedicalAssessmentService } from './medical-assessment.service';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { DatePipe } from '@angular/common';
import { ConfigService } from 'src/app/services/config.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { AdviceComponent } from '../advice/advice.component';
import { PatientAssessmentToolComponent } from 'src/app/ward/patient-assessment-tool/patient-assessment-tool.component';
import { ReferralComponent } from 'src/app/shared/referral/referral.component';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { LoaderService } from 'src/app/services/loader.service';
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
  selector: 'app-medical-assessment',
  templateUrl: './medical-assessment.component.html',
  styleUrls: ['./medical-assessment.component.scss'],
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
export class MedicalAssessmentComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divmedicalassessment') divmedicalassessment!: ElementRef;
  @ViewChild('date', { static: false }) date!: ElementRef;
  @ViewChild('dischargedate', { static: false }) dischargedate!: ElementRef;
  @ViewChild('divMedicalCondition') divMedicalCondition!: ElementRef;

  @Input() data: any;
  listOfSpecItems: any = [];
  readonly = false;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  Constitutional: boolean = false;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsView = false;
  showContent = true;
  HospitalID: any;
  admissionID = 0;
  isEdit = false;
  MedicalCondition: any;
  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  @ViewChild('Date1', { static: false }) Date1!: ElementRef;
  @Output() dataChanged = new EventEmitter<boolean>();
  vteType: any = '';
  base64StringSig = '';
  base64StringSig1 = '';
  base64StringSig2 = '';
  showSignature = false;
  langData: any;

  
  buttons = [
    { id: 'buttoncheckbox_ambulatory', label: 'Ambulatory', selected: false },
    { id: 'buttoncheckbox_requireassistance', label: 'Require Assistance', selected: false },
    { id: 'buttoncheckbox_crutches', label: 'Crutches', selected: false },
    { id: 'buttoncheckbox_bedridden', label: 'Bedridden', selected: false },
    { id: 'buttoncheckbox_wheelchair', label: 'Wheel chair', selected: false }
  ];

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private us: UtilityService, private service: MedicalAssessmentService, private datepipe: DatePipe, private config: ConfigService, private loaderService: LoaderService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
    this.langData = JSON.parse(sessionStorage.getItem("langData") || '{}');
  }

  toggleButtonSelectionDerived(index: number): void {
    this.buttons.forEach((button, i) => {
      button.selected = i === index;
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.readonly = this.data.readonly;
      this.isEdit = this.data.isEdit;
      if (this.data.selectedView) {
        this.selectedView = this.data.selectedView;
      }

      if (this.data.admissionID) {
        this.admissionID = this.data.admissionID;
      }
      this.selectedTemplate(this.data.data);

    }
    else {
      this.getreoperative("2");
    }

    if (this.selectedView.BillType === "Self") {
      this.setValueById("toggle_economicassessment", "Self");
    }
    else {
      this.setValueById("toggle_economicassessment", "Insured");
    }
    if (this.selectedView.MartialStatus === "3") {
      this.setValueById("toggle_maritalstatus", "Single");
    }
    else if (this.selectedView.MartialStatus === "2") {
      this.setValueById("toggle_maritalstatus", "Married");
    }
    else
      this.setValueById("toggle_maritalstatus", "Other");
    this.getDiagnosis();
  }

  ngAfterViewInit() {
    if (this.date) {
      this.date.nativeElement.id = 'textbox_date';
    }

    if (this.dischargedate) {
      this.dischargedate.nativeElement.id = 'textbox_dischargedate';
      this.dischargedate.nativeElement.value = this.selectedView.ExptDisChargeDate;
    }

    // if (this.selectedView.fromHomePage) {
    //   this.bindTextboxValue("textbox_assessmentreviewedby", this.doctorDetails[0].EmployeeName);
    //   this.bindTextboxValue("textbox_assessmentreviewedbycode", this.doctorDetails[0].EmpNo);
    // }

    setTimeout(() => {
      if (this.selectedView.fromHomePage) {
        this.bindTextboxValue("textbox_assessmentreviewedbycode", this.doctorDetails[0].EmpNo);
        this.bindTextboxValue("textbox_assessmentreviewedby", this.doctorDetails[0].EmployeeName);
        //this.bindTextboxValue("textbox_Date1", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
        this.bindTextboxValue("textbox_datetime1", this.setCurrentTime());

        if (this.Date1) {
      this.Date1.nativeElement.id = 'textbox_Date1';
      this.Date1.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString();
    }
      }
    }, 2000);

    // if (this.Date1) {
    //   this.Date1.nativeElement.id = 'textbox_Date1';
    //   this.Date1.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString();
    // }


    if (!this.data?.data) {
      setTimeout(() => {
        this.showdefault(this.divmedicalassessment.nativeElement);
        if (this.divmedicalassessment) {
          this.bindTextboxValue("textbox_bp", this.selectedView.BP ? this.selectedView.BP : '');
          this.bindTextboxValue("textbox_temp", this.selectedView.Temperature ? this.selectedView.Temperature : '');
          this.bindTextboxValue("textbox_pulse", this.selectedView.Pulse ? this.selectedView.Pulse : '');
          this.bindTextboxValue("textbox_rr", this.selectedView.Respiration ? this.selectedView.Respiration : '');
          this.bindTextboxValue("textbox_o2", this.selectedView.SPO2 ? this.selectedView.SPO2 : '');
          this.bindTextboxValue("textbox_conductedby", this.doctorDetails[0].UserName);
          this.bindTextboxValue("textbox_amtcode", this.doctorDetails[0].EmpNo);
          //this.bindTextboxValue("textbox_datetime", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
          this.bindTextboxValue("textbox_physicianname", this.doctorDetails[0].EmployeeName);

          // this.bindTextboxValue("textbox_assessmentreviewedbycode", this.doctorDetails[0].EmpNo);
          this.bindTextboxValue("textbox_AssessmentPrimaryDocFullNameEmpNo", this.doctorDetails[0].EmployeeName);
          this.bindTextboxValue("textbox_Assessmentamtcode", this.doctorDetails[0].EmpNo);
          this.bindTextboxValue("textbox_ConductedDateAndTime", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
          this.bindTextboxValue("textbox_datetime", this.setCurrentTime());
          //this.bindTextboxValue("textbox_datetime1", this.setCurrentTime());
          
        }
        this.loaderService.hide();
      }, 4000);
      this.loaderService.show();
    }

  }

  viewWorklist() {
    $("#savedModal").modal('show');
  }

  // selectedTemplate(tem: any) {
  //   this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
  //   let sameUser = true;
  //   if(tem.CreatedBy != this.doctorDetails[0]?.UserName) {
  //     sameUser = false;
  //   }
  //   this.showElementsData(this.divmedicalassessment.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser);
  //   $("#savedModal").modal('hide');
  // }
  selectedTemplate(tem: any) {
    this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: 0, AdmissionID: this.admissionID > 0 ? this.admissionID : this.selectedView.AdmissionID, PatientTemplatedetailID: this.PatientTemplatedetailID, TBL: 2 });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
            tem = response.FetchPatienClinicalTemplateDetailsNNList[0];
            let sameUser = true;
            if (tem.CreatedBy != this.doctorDetails[0]?.UserName) {
              sameUser = false;
            }
            if(this.selectedView.ConsultantID == this.doctorDetails[0].EmpId) {
              sameUser = true;
            }
            this.IsView = true;
            this.showElementsData(this.divmedicalassessment.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            this.base64StringSig = this.signatureForm.get('Signature1').value;
            $("#savedModal").modal('hide');
          }
        }
      },
        (err) => {
        })
  }

  getreoperative(templateid: any) {
    //this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID });
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.admissionID > 0 ? this.admissionID : this.selectedView.AdmissionID, PatientTemplatedetailID: 0, TBL: 1 });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
            this.IsView = true;
          }
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divmedicalassessment);

    if (tags) {
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.admissionID > 0 ? this.admissionID : this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 2,
        "ClinicalTemplateValues": JSON.stringify(tags),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID,//this.selectedView.HospitalID == undefined ? this.HospitalID : this.selectedView.HospitalID,
        "Signature1": this.signatureForm.get('Signature1').value,
        "Signature2": this.signatureForm.get('Signature2').value,
        "PrimaryDoctorID": this.selectedView.ConsultantID,
        "IsReview": this.selectedView.fromHomePage ? 1 : 0,
        "ReviewedBy": this.selectedView.fromHomePage ? this.doctorDetails[0].EmpId : 0,
        "MedicalHistory" : this.divMedicalCondition.nativeElement.innerHTML// $("ta_PastMedicalHistory").val()
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("2");
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
          
          this.signatureForm.patchValue({
            Signature1 : this.base64StringSig
          }) 
          this.showSignature = false;// to load the common component
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

  clear() {
    this.showContent = false;
    this.PatientTemplatedetailID = 0;
    this.base64StringSig = '';
    this.base64StringSig1 = '';
    this.signatureForm.patchValue({
      Signature1 : '',
      Signature2 : ''
    })
    setTimeout(() => {
      this.showContent = true;
    }, 0);
  }

  getDiagnosis() {
    this.showSignature = true;
    this.config.fetchAdviceDiagnosis(this.admissionID > 0 ? this.admissionID : this.selectedView.AdmissionID, this.selectedView.hospitalId==undefined?this.hospitalID:this.selectedView.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          var diag = "";
          response.PatientDiagnosisDataList.forEach((element: any, index: any) => {
            if (diag != "")
              diag = diag + "\n" + response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
            else
              diag = response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
          });

          this.bindTextboxValue("textarea_diagnosis", diag);
        }
      },
        (err) => {

        })
  }
  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  toggleVte(type: any) {
    this.vteType = type;
  }

  showVTE() {
    this.vteType = 'medical';
    $("#modalPainScore").modal('show');
  }

  showRisk() {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.ms.openModal(PatientAssessmentToolComponent, {
      data: '',
      inputPainScore: '',
      readonly: false
    }, options);
  }

  toggleButtonSelectionPhyExam(event: any, groupIds?: string[]) {
    const divElement = event.currentTarget as HTMLElement;
    if (divElement.classList.contains('active')) {
      divElement.classList.remove('active');
    } else {
      divElement.classList.add('active');
    }
    groupIds?.forEach(id => {
      if (id !== event.currentTarget.id) {
        document.getElementById(id)?.classList.remove('active');
      }
    });
  }
  getCTASScoreClass() {
    if(this.selectedView?.CTASScore == '1') {
      return 'Resuscitation';
    }
    else if(this.selectedView?.CTASScore == '2') {
      return 'Emergent';
    }
    else if(this.selectedView?.CTASScore == '3') {
      return 'Urgent';
    }
    else if(this.selectedView?.CTASScore == '4') {
      return 'LessUrgent';
    }
    else if(this.selectedView?.CTASScore == '5') {
      return 'NonUrgent';
    }
    return '';
  }
}
