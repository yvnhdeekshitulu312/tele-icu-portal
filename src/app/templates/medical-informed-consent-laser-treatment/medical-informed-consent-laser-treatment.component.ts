import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import moment from 'moment';
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
  selector: 'app-medical-informed-consent-laser-treatment',
  templateUrl: './medical-informed-consent-laser-treatment.component.html',
  styleUrls: ['./medical-informed-consent-laser-treatment.component.scss'],
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
export class MedicalInformedConsentLaserTreatmentComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divmiclt') divmiclt!: ElementRef;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  showContent = true;
  @ViewChild('signature1') signature1!: SignatureComponent;
  @ViewChild('signature2') signature2!: SignatureComponent;
  @ViewChild('emrdate', { static: false }) emrdate!: ElementRef;
  @ViewChild('emr1date', { static: false }) emr1date!: ElementRef;
  @ViewChild('physiciandate', { static: false }) physiciandate!: ElementRef;
  @ViewChild('physician1date', { static: false }) physician1date!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
  currentDate = new Date();

  requiredFields = [
    { id: 'textbox_PatientsName', message: "Patient’s Name", required: true },
    { id: 'textbox_Procedure', message: 'To perform the following Procedure', required: true },
    { id: 'textbox_PatientSign', message: 'Patient or representative Name', required: true },
    {id: 'textbox_PrimaryDocFullNameEmpNo', message: "Physician's Name", required: true}
  ];

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.signarureNameCollection = [
      {nameId: 'textbox_PatientSign', signatureId: 'Signature1', nameMessage: "Plese enter Patient or representative Name", signatureMessage: "Please enter Patient or representative Signature"},
      {nameId: 'textbox_PrimaryDocFullNameEmpNo', signatureId: 'Signature5', nameMessage: "Please enter Physician's Name ", signatureMessage: "Please enter Physician's Signature"},
    ]
  }
  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  ngOnInit(): void {
    this.getreoperative("75");
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.showdefault(this.divmiclt.nativeElement);
      this.bindTextboxValue('textbox_AuthorizeDr', this.defaultData[1]?.FetchPatientDataEFormsDataList[0].Primarydoctor);
      this.bindTextboxValue('textbox_AuthorizeDr_Ar', this.defaultData[1]?.FetchPatientDataEFormsDataList[0].Primarydoctor);
      this.bindTextboxValue('textbox_Procedure', this.defaultData[0]?.FetcTemplateDefaultDataListM[0].Procedures);
      this.bindTextboxValue('textbox_ProcedureAr', this.defaultData[0]?.FetcTemplateDefaultDataListM[0].Procedures);
      this.bindTextboxValue('textbox_physiciandate', moment(new Date()).format('DD-MMM-YYYY'));
      this.bindTextboxValue('textbox_physician1date', moment(new Date()).format('DD-MMM-YYYY'));
    }, 4000);
    if (this.emrdate) {
      this.emrdate.nativeElement.id = 'textbox_emrdate';
    }
    if (this.emr1date) {
      this.emr1date.nativeElement.id = 'textbox_emr1date';
    }
    if (this.physiciandate) {
      this.physiciandate.nativeElement.id = 'textbox_physiciandate';
    }
    if (this.physician1date) {
      this.physician1date.nativeElement.id = 'textbox_physician1date';
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
            this.showElementsData(this.divmiclt.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            $("#savedModal").modal('hide');
          }
        }
      },
        (err) => {
        })
  }

  getreoperative(templateid: any) {
    //this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID });
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: 0, TBL: 1 });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
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
    const tags = this.findHtmlTagIds(this.divmiclt,this.requiredFields);

    if (tags && tags.length>0) {
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 75,
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
            this.getreoperative("75");
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
    setTimeout(() => {
      this.showContent = true;
    }, 0);
  }

  autoFillPatientName(event: any, value: boolean, id: string) {
    const divElement = event.currentTarget as HTMLElement;
    if (value && divElement.classList.contains('active')) {
      (document.getElementById(id) as any).value = this.patientData.PatientName;
    } else {
      (document.getElementById(id) as any).value = '';
    }
  }

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divmiclt.nativeElement.parentNode;
        const nextSibling = this.divmiclt.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divmiclt.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divmiclt.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divmiclt.nativeElement);
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
