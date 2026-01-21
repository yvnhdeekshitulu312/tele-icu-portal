import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { MedicalAssessmentService } from '../medical-assessment/medical-assessment.service';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { DatePipe } from '@angular/common';
import { ConfigService } from 'src/app/services/config.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientAssessmentToolComponent } from 'src/app/ward/patient-assessment-tool/patient-assessment-tool.component';
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
  selector: 'app-medical-assessment-obsteric',
  templateUrl: './medical-assessment-obsteric.component.html',
  styleUrls: ['./medical-assessment-obsteric.component.scss'],
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
export class MedicalAssessmentObstericComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  vteType: any = '';
  @ViewChild('divmedicalassessmentobsteric') divmedicalassessmentobsteric!: ElementRef;
  @ViewChild('date', { static: false }) date!: ElementRef;
  @ViewChild('dischargedate', { static: false }) dischargedate!: ElementRef;
  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  @ViewChild('Date1', { static: false }) Date1!: ElementRef;
  @Input() data: any;
  readonly = false;
  admissionID = 0;
  isEdit = false;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsView = false;
  showContent = true;
  HospitalID: any;
  cheifcomplaint:any;
  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @Output() dataChanged = new EventEmitter<boolean>();
  langData: any;

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private us: UtilityService, private service: MedicalAssessmentService, private datepipe: DatePipe, private config: ConfigService) {
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
      this.getreoperative("6");
    }


    if (this.selectedView.BillType === "Self") {
      this.setValueById("toggle_modeofpayment", "Self");
    }
    else {
      this.setValueById("toggle_modeofpayment", "Insured");
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
    }

    if (this.Date1) {
      this.Date1.nativeElement.id = 'textbox_Date1';
      this.Date1.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString();
    }

    if (this.divmedicalassessmentobsteric) {
      this.bindTextboxValue("textbox_bp", this.selectedView.BP);
      this.bindTextboxValue("textbox_temp", this.selectedView.Temperature);
      this.bindTextboxValue("textbox_pulse", this.selectedView.Pulse);
      this.bindTextboxValue("textbox_rr", this.selectedView.Respiration);
      this.bindTextboxValue("textbox_o2", this.selectedView.SPO2);
      this.bindTextboxValue("textbox_assessmentconductedby", this.doctorDetails[0].EmpNo + ' - ' + this.doctorDetails[0].EmployeeName);
      this.bindTextboxValue("textbox_datetimeassessmentconducted", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_datetimeassessmentconductedTime", this.setCurrentTime());
      this.bindTextboxValue("textbox_physicianname", this.doctorDetails[0].EmployeeName);
    }

    setTimeout(() => {
      this.showdefault(this.divmedicalassessmentobsteric.nativeElement);
      this.cheifcomplaint=this.defaultData[0].FetcTemplateDefaultDataListM[0].ChiefComplaint;
      this.bindTextboxValue("textarea_historyofthepresentillness", this.defaultData[0].FetcTemplateDefaultDataListM[0].ChiefComplaint);
      setTimeout(() => {
        if (this.selectedView.fromHomePage) {
          this.bindTextboxValue("textbox_assessmentreviewedby", this.doctorDetails[0].EmployeeName);          
          this.bindTextboxValue("textbox_Date1", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
          this.bindTextboxValue("textbox_timeassessmentreviewed", this.setCurrentTime());
        }
      }, 0)
    }, 4000);
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
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divmedicalassessmentobsteric);

    if (tags) {
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.admissionID > 0 ? this.admissionID : this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 6,
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
            this.getreoperative("6");
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

          this.bindTextboxValue("textarea_provisionaldiagnosis", diag);
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
  //   this.showElementsData(this.divmedicalassessmentobsteric.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser);
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
            this.showElementsData(this.divmedicalassessmentobsteric.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  showVTE() {
    this.vteType = 'medical';
    $("#modalPainScore").modal('show');
  }

  toggleVte(type: any) {
    this.vteType = type;
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

  onCheckboxSelection(event: any, groupIds?: string[]) {
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
