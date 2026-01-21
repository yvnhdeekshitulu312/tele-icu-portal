import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { MedicalAssessmentSurgicalService } from './medical-assessment-surgical.service';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { DatePipe } from '@angular/common';
import { ConfigService } from 'src/app/services/config.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientAssessmentToolComponent } from 'src/app/ward/patient-assessment-tool/patient-assessment-tool.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';

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
  selector: 'app-medical-assessment-surgical',
  templateUrl: './medical-assessment-surgical.component.html',
  styleUrls: ['./medical-assessment-surgical.component.scss'],
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
export class MedicalAssessmentSurgicalComponent extends DynamicHtmlComponent implements OnInit {
  vteType: any = '';
  @ViewChild('divmedicalassessmentsurgical') divmedicalassessmentsurgical!: ElementRef;
  @ViewChild('date', { static: false }) date!: ElementRef;
  @ViewChild('dischargedate', { static: false }) dischargedate!: ElementRef;
  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  @ViewChild('Date1', { static: false }) Date1!: ElementRef;
  @Input() data: any;
  readonly = false;
  url = "";
  isEdit = false;
  admissionID = 0;
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsView = false;
  showContent = true;
  HospitalID: any;
  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @Output() dataChanged = new EventEmitter<boolean>();
  base64StringSig = '';
  base64StringSig1 = '';
  base64StringSig2 = '';
  showSignature = false;
  langData: any;

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private us: UtilityService, private service: MedicalAssessmentSurgicalService, private datepipe: DatePipe, private config: ConfigService) {
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
      this.getreoperative("8");
    }
    if(this.selectedView.BillType === "Self") {
      this.setValueById("toggle_paymentmode", "Self");
    }
    else {
      this.setValueById("toggle_paymentmode", "Insured");
    }   
    if(this.selectedView.MartialStatus === "3") {
      this.setValueById("toggle_maritalstatus", "Single");
    }
    else  if(this.selectedView.MartialStatus === "2") {
      this.setValueById("toggle_maritalstatus", "Married");
    }
    else
    this.setValueById("toggle_maritalstatus", "Other");
    
    this.getDiagnosis();
    // this.getreoperative("8");
    // if (this.data) {
    //   this.readonly = this.data.readonly;
    //   this.selectedTemplate(this.data.data);
    //   //this.us.disabledElement(this.divreadonly.nativeElement);
    // }
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
        this.bindTextboxValue("textbox_assessmentreviewedbycode", this.doctorDetails[0].EmpNo);
        this.bindTextboxValue("textbox_assessmentreviewedby", this.doctorDetails[0].EmployeeName);       
        this.bindTextboxValue("textbox_datetime1", this.setCurrentTime());

        if (this.Date1) {
      this.Date1.nativeElement.id = 'textbox_Date1';
      this.Date1.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString();
    }
      }
    }, 2000);

    if (this.divmedicalassessmentsurgical) {
      this.bindTextboxValue("textbox_bp", this.selectedView.BP);
      this.bindTextboxValue("textbox_temp", this.selectedView.Temperature);
      this.bindTextboxValue("textbox_pulse", this.selectedView.Pulse);
      this.bindTextboxValue("textbox_rr", this.selectedView.Respiration);
      this.bindTextboxValue("textbox_o2", this.selectedView.SPO2);

      this.bindTextboxValue("textbox_AssessmentPrimaryDocFullNameEmpNo", this.doctorDetails[0].EmployeeName);
      this.bindTextboxValue("textbox_assessmentconductedby", this.doctorDetails[0].UserName);
      this.bindTextboxValue("textbox_assessmentconductedcode", this.doctorDetails[0].EmpNo);
      this.bindTextboxValue("textbox_assessmentconducteddatetime", this.datepipe.transform(new Date().setDate(new Date().getDate() - 10), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_physicianname", this.doctorDetails[0].EmployeeName);

      const now = new Date();
      this.timerData.push({id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes()})
    }

    
    setTimeout(()=>{
      this.showdefault(this.divmedicalassessmentsurgical.nativeElement);
      if (this.divmedicalassessmentsurgical) {
        if (this.dischargedate) {
          this.dischargedate.nativeElement.id = 'textbox_dischargedate';
        }
      }
    }, 3000);

    setTimeout(() => {
      this.bindTextboxValue("textarea_historyofthepresentillness", this.defaultData[0].FetcTemplateDefaultDataListM[0].ChiefComplaint);
    }, 4000);
  }

  getreoperative(templateid: any) {
    //this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID });
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID,PatientTemplatedetailID:0,TBL:1 });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          //if (response.FetchPatienClinicalTemplateDetailsNList[0]?.ClinicalTemplateValues) {
            if(response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
              this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
              this.IsView = true;
            }
           
          //}
        }
      },
        (err) => {
        })
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

  save() {
    const tags = this.findHtmlTagIds(this.divmedicalassessmentsurgical);

    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID, 
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 8,
        "ClinicalTemplateValues": JSON.stringify(mergedArray),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID,//this.selectedView.HospitalID==undefined?this.HospitalID:this.selectedView.HospitalID,
        "Signature1": this.signatureForm.get('Signature1').value,
        "Signature2": this.signatureForm.get('Signature2').value,
        "PrimaryDoctorID": this.selectedView.ConsultantID,
        "IsReview": this.selectedView.fromHomePage ? 1 : 0,
        "ReviewedBy": this.selectedView.fromHomePage ? this.doctorDetails[0].EmpId : 0,
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("8");
          }
        },
          (err) => {

          })
    }
  }

  getDiagnosis() {
    this.config.fetchAdviceDiagnosis(this.selectedView.AdmissionID, this.selectedView.hospitalId)
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
  //   this.showElementsData(this.divmedicalassessmentsurgical.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser);
  //   $("#savedModal").modal('hide');
  // }
  selectedTemplate(tem: any) {
    this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: 0, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: this.PatientTemplatedetailID, TBL: 2 });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
            tem = response.FetchPatienClinicalTemplateDetailsNNList[0];          
            let sameUser = true;
            if (tem.CreatedBy != this.doctorDetails[0]?.UserName) {
              sameUser = false;
            }
            this.showElementsData(this.divmedicalassessmentsurgical.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            this.base64StringSig = this.signatureForm.get('Signature1').value;
            this.base64StringSig2 = this.signatureForm.get('Signature2').value;
            $("#savedModal").modal('hide');
          }
        }
      },
        (err) => {
        })
  }

  fetchDoctorSignature(type:any) {
    const modalRef = this.modalService.open(ValidateEmployeeComponent);

    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.config.FetchEmployeeSignaturesBase64(this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, 3392, this.hospitalID)
        .subscribe((response: any) => {
          
          if(type === 'Signature1') {
            this.base64StringSig = response.FetchEmployeeSignaturesBase64DList[0].Base64Signature;
            this.signatureForm.patchValue({
              Signature1 : this.base64StringSig
            });
          }
          else if(type === 'Signature2') {
            this.base64StringSig1 = response.FetchEmployeeSignaturesBase64DList[0].Base64Signature;
            this.signatureForm.patchValue({
              Signature2 : this.base64StringSig
            });
          }
          this.showSignature = false; // to load the common component
              setTimeout(() => {
                this.showSignature = true;                
              }, 100);
  
        },
          (err) => {
          })
      }
      modalRef.close();
    });
    
  }

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }


  clear() {
    this.showContent = false;
    this.PatientTemplatedetailID = 0;
    this.signatureForm.patchValue({
      Signature1 : '',
      Signature2 : ''
    })
    setTimeout(()=>{
      this.showContent = true;
    }, 0);
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
