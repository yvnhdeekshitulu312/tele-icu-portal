import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { MedicalAssessmentPediaService } from './medical-assessment-pedia.service';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { DatePipe } from '@angular/common';
import { ConfigService } from 'src/app/services/config.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientAssessmentToolComponent } from 'src/app/ward/patient-assessment-tool/patient-assessment-tool.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { AdviceComponent } from '../advice/advice.component';
import * as moment from 'moment';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';

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
  selector: 'app-medical-assessment-pedia',
  templateUrl: './medical-assessment-pedia.component.html',
  styleUrls: ['./medical-assessment-pedia.component.scss'],
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
export class MedicalAssessmentPediaComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divmedicalassessmentpedia') divmedicalassessmentpedia!: ElementRef;
  @ViewChild('date', { static: false }) date!: ElementRef;
  @ViewChild('dischargedate', { static: false }) dischargedate!: ElementRef;
  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  
  @Input() data: any;
  readonly = false;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsView = false;
  showContent = true;
  HospitalID: any;
  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @ViewChild('Date1', { static: false }) Date1!: ElementRef;
  @Output() dataChanged = new EventEmitter<boolean>();
  vteType = '';
  admissionID = 0;
  isEdit = false;
  langData: any;

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private us: UtilityService, private service: MedicalAssessmentPediaService, private datepipe: DatePipe, private config: ConfigService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
    this.langData = JSON.parse(sessionStorage.getItem("langData") || '{}');
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
      this.getreoperative("7");
    }
    this.getDiagnosis();
  }
  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  ngAfterViewInit() {
    if (this.date) {
      this.date.nativeElement.id = 'textbox_date';
    }
    if (this.dischargedate) {
      this.dischargedate.nativeElement.id = 'textbox_dischargedate';
    }

    setTimeout(() => {
      if (this.selectedView.fromHomePage) {
        this.bindTextboxValue("textbox_AssessmentReviewedBy", this.doctorDetails[0].EmployeeName);
       // this.bindTextboxValue("textbox_Date1", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
        this.bindTextboxValue("textbox_datetime1", this.setCurrentTime());
        if (this.Date1) {
          this.Date1.nativeElement.id = 'textbox_Date1';
          this.Date1.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString();
        }
      }
    }, 2000);
    
    
    if (!this.data?.data) {
      setTimeout(() => {
        this.showdefault(this.divmedicalassessmentpedia.nativeElement);
        if (this.divmedicalassessmentpedia) {
          this.bindTextboxValue("text_VitalSignsBP", this.selectedView.BP);
          this.bindTextboxValue("text_VitalSignsTemp", this.selectedView.Temperature);
          this.bindTextboxValue("text_VitalSignsPulse", this.selectedView.Pulse);
          this.bindTextboxValue("text_VitalSignsRR", this.selectedView.Respiration);
          this.bindTextboxValue("text_VitalSignsO2", this.selectedView.SPO2);
          this.bindTextboxValue("textbox_GrowthParamWeight1", this.selectedView.Weight);
          this.bindTextboxValue("textbox_GrowthParamHeight", this.selectedView.Height);
          this.bindTextboxValue("textbox_AssessmentConductedBy", this.doctorDetails[0].EmployeeName);
          this.bindTextboxValue("textbox_ConductedCode", this.doctorDetails[0].EmpNo);
          //this.bindTextboxValue("textbox_ConductedDateAndTime", this.datepipe.transform(new Date().setDate(new Date().getDate() - 10), "dd-MMM-yyyy")?.toString());
          this.bindTextboxValue("textbox_ConductedDateAndTime", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
          this.bindTextboxValue("textbox_PhysicianName", this.doctorDetails[0].EmployeeName);
          //this.bindTextboxValue("textbox_datetime", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
          this.bindTextboxValue("textbox_datetime", this.setCurrentTime());
          //this.bindTextboxValue("textbox_datetime1", this.setCurrentTime());
          this.bindTextboxValue("textbox_datetime3", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
          // if (this.dischargedate) {
          //   this.dischargedate.nativeElement.id = 'textbox_dischargedate';
          // }
          // setTimeout(() => {

          // }, 1000)
        }
      }, 4000);
    }
  }
  addDischargeDate() {
    let afterDays = $('#textbox_ProposedLengthofstay').val();//this.followupForm.get('FollowupAfter').value;
    const admissionDate = new Date();
    const endDate = new Date(admissionDate.getTime() + (afterDays * 24 * 60 * 60 * 1000));
    // $('#PDischargeDate').val(moment(endDate).format('DD-MMM-YYYY') );
    this.dischargedate.nativeElement.value = moment(endDate).format('DD-MMM-YYYY');
  }

  getreoperative(templateid: any) {
    //this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID });
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.admissionID > 0 ? this.admissionID : this.selectedView.AdmissionID, PatientTemplatedetailID: 0, TBL: 1 });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          //if(response.FetchPatienClinicalTemplateDetailsNList[0]?.ClinicalTemplateValues) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
            this.IsView = true;
          }

          //}
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divmedicalassessmentpedia);

    if (tags) {
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.admissionID > 0 ? this.admissionID : this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 7,
        "ClinicalTemplateValues": JSON.stringify(tags),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID,//this.selectedView.HospitalID == undefined ? this.HospitalID : this.selectedView.HospitalID,
        "Signature1": this.signatureForm.get('Signature1').value,
        "Signature2": this.signatureForm.get('Signature2').value,
        "PrimaryDoctorID": this.selectedView.ConsultantID,
        "IsReview": this.selectedView.fromHomePage ? 1 : 0,
        "ReviewedBy": this.selectedView.fromHomePage ? this.doctorDetails[0].EmpId : 0
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("7");
          }
        },
          (err) => {

          })
    }
  }

  getDiagnosis() {
    this.config.fetchAdviceDiagnosis(this.admissionID > 0 ? this.admissionID : this.selectedView.AdmissionID, this.selectedView.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          var diag = "";
          response.PatientDiagnosisDataList.forEach((element: any, index: any) => {
            if (diag != "")
              diag = diag + "\n" + response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
            else
              diag = response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
          });

          this.bindTextboxValue("textarea_ProvisionalDiagnosis", diag);
          this.bindTextboxValue("textarea_ProvisionalDiagnosis_laboratory", diag);
        }
      },
        (err) => {

        })
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
  //   this.showElementsData(this.divmedicalassessmentpedia.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser);
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
            this.IsView = true;
            this.showElementsData(this.divmedicalassessmentpedia.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            $("#savedModal").modal('hide');
          }
        }
      },
        (err) => {
        })
  }

  clear() {
    this.showContent = false;
    this.PatientTemplatedetailID = 0;
    setTimeout(() => {
      this.showContent = true;
    }, 0);
  }


  openPainAssessment() {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.ms.openModal(PatientAssessmentToolComponent, {
      data: '',
      readonly: true
    }, options);
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
