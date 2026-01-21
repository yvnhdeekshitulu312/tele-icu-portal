import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
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
  selector: 'app-metabolic-screening-test-consent',
  templateUrl: './metabolic-screening-test-consent.component.html',
  styleUrls: ['./metabolic-screening-test-consent.component.scss'],
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
export class MetabolicScreeningTestConsentComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divmstc') divmstc!: ElementRef;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  showContent = true;
  @ViewChild('parentDate', {static: false}) parentDate!: ElementRef;
  @ViewChild('doctorDate', {static: false}) doctorDate!: ElementRef;
  @ViewChild('parent2Date', {static: false}) parent2Date!: ElementRef;
  @ViewChild('doctor2Date', {static: false}) doctor2Date!: ElementRef;
  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent; 
  @ViewChild('Signature3') Signature3!: SignatureComponent; 
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;

  requiredFields = [
    { id: 'text_Patient_ParentName', message: "Patient's Parent Name", required: true },
     {id: 'textbox_PrimaryDocFullName', message: "Doctor's Name", required: true }
  ];

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef,private service: MedicalAssessmentService, private us: UtilityService,private datepipe: DatePipe) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    // this.signarureNameCollection = [
    //   {nameId: 'text_Patient_ParentName', signatureId: 'Signature1', nameMessage: "Please enter Patient's Parent Name ", signatureMessage: "Please enter Patient's Parent Name Signature"},
    //   {nameId: 'textbox_PrimaryDocFullName', signatureId: 'Signature2', nameMessage: "Please enter Doctor's Name ", signatureMessage: "Please enter Doctor's Signature"},
    // ]
   }
   clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }
  ngOnInit(): void {
    this.getreoperative("47");
  }

  ngAfterViewInit() {
    setTimeout(()=>{
      this.showdefault(this.divmstc.nativeElement);
      this.bindTextboxValue("textbox_PrimaryDocFullName", this.doctorDetails[0].EmployeeName);
    }, 4000);

    if (this.parentDate) {
      this.parentDate.nativeElement.id = 'textbox_parentDate';
      this.bindTextboxValue('textbox_parentDate', this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString())
    }
    if(this.doctorDate) {
      this.doctorDate.nativeElement.id = 'textbox_doctorDate';
      this.bindTextboxValue('textbox_doctorDate', this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString())
    }
    if(this.parent2Date) {
      this.parent2Date.nativeElement.id = 'textbox_parent2Date';
      this.bindTextboxValue('textbox_parent2Date', this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString())
    }
    if(this.doctor2Date) {
      this.doctor2Date.nativeElement.id = 'textbox_doctor2Date';
      this.bindTextboxValue('textbox_doctor2Date', this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString())
    }
    this.addListeners(this.datepickers);
  }

  viewWorklist() {
    $("#savedModal").modal('show');
  }
  
  selectedTemplate(tem: any) {
    this.showContent = false;
    setTimeout(()=>{
      this.showContent = true;
    }, 0);
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
            this.dataChangesMap = {};
            this.showElementsData(this.divmstc.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            $("#savedModal").modal('hide');
          }
        }
      },
        (err) => {
        })
  }

  getreoperative(templateid: any) {
    //this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID });
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID,PatientTemplatedetailID:0,TBL:1 });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if(response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
            this.IsView = true;
            this.IsViewActual=true;
          }
        }
      },
        (err) => {
        })
  }

  save() {
    
    const tags = this.findHtmlTagIds(this.divmstc,this.requiredFields);

    if (tags && tags.length > 0) {
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 47,
        "ClinicalTemplateValues": JSON.stringify(tags),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID,
        "Signature1": this.signatureForm.get('Signature1').value,
        "Signature2": this.signatureForm.get('Signature2').value,
        "Signature3": this.signatureForm.get('Signature3').value,
        "Signature4": this.signatureForm.get('Signature4').value,
        "Signature5": this.signatureForm.get('Signature5').value,
        "Signature6": this.signatureForm.get('Signature6').value,
        "Signature7": this.signatureForm.get('Signature7').value,
        "Signature8": this.signatureForm.get('Signature8').value,
        "Signature9": this.signatureForm.get('Signature9').value,
        "Signature10": this.signatureForm.get('Signature10').value
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("47");
          }
        },
          (err) => {
  
          })
    }
  }

  clear() {
    this.dataChangesMap = {};
    this.showContent = false;
    this.PatientTemplatedetailID = 0;
    this.signatureForm.reset();
    this.signatureList = [];
    setTimeout(()=>{
      this.showContent = true;
    }, 0);
  }

  assignAgreeDisagree(id: string) {
    this.selectCheckbox(id);
  }

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divmstc.nativeElement.parentNode;
        const nextSibling = this.divmstc.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divmstc.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divmstc.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divmstc.nativeElement);
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

}
