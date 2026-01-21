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
  selector: 'app-against-medical-advice',
  templateUrl: './against-medical-advice.component.html',
  styleUrls: ['./against-medical-advice.component.scss'],
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
export class AgainstMedicalAdviceComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divama') divama!: ElementRef;
  @ViewChild('contentprint') contentprint!: ElementRef;
  IsPrint = false;
  divContentForPrint: any;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsView = false;
  IsViewActual = false;
  showContent = true;
  isPatientRefused: boolean = false;
  @ViewChild('Date1', { static: false }) Date1!: ElementRef;
  @ViewChild('Date2', { static: false }) Date2!: ElementRef;
  @ViewChild('Date3', { static: false }) Date3!: ElementRef;
  @ViewChild('Date4', { static: false }) Date4!: ElementRef;
  @ViewChild('Date5', { static: false }) Date5!: ElementRef;
  @ViewChild('Date6', { static: false }) Date6!: ElementRef;
  @ViewChild('Date7', { static: false }) Date7!: ElementRef;
  @ViewChild('Date8', { static: false }) Date8!: ElementRef;
  @ViewChild('Date9', { static: false }) Date9!: ElementRef;
  @ViewChild('Date10', { static: false }) Date10!: ElementRef;
  @ViewChild('Date11', { static: false }) Date11!: ElementRef;
  @ViewChild('Date12', { static: false }) Date12!: ElementRef;
  @ViewChild('Date13', { static: false }) Date13!: ElementRef;
  @ViewChild('Date14', { static: false }) Date14!: ElementRef;

  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  @ViewChild('Signature3') Signature3!: SignatureComponent;
  @ViewChild('Signature4') Signature4!: SignatureComponent;
  @ViewChild('Signature5') Signature5!: SignatureComponent;
  @ViewChild('Signature6') Signature6!: SignatureComponent;
  @ViewChild('Signature7') Signature7!: SignatureComponent;

  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;

  requiredFields = [
    { id: 'ta_ByPhysician', message: 'Please enter This section to be completed by the Physician ', required: true },
    { id: 'ta_ByPhysicianAr', message: 'Please enter This section to be completed by the Physician in Arabic', required: true },
    { id: 'ta_AlternativeCare', message: 'Please enter alternative care', required: true },
    { id: 'ta_AlternativeCareAr', message: 'Please enter alternative care in Arabic', required: true },
    { id: 'text_Code', message: 'Please enter Doctor ID', required: true },
    { id: 'text_Name', message: 'Please enter Doctor Name', required: true },
    // { id: 'ta_AlternativeCare', message: 'Alternative Care and Treatment', required: true },
    // { id: 'text_Code1', message: 'Id', required: true },
    // { id: 'text_Name_1', message: 'Name', required: true },
    // { id: 'ta_Reasons', message: 'Reasons for Refusal to Accept Care', required: true }, 
    { id: 'text_PatientSign', message: 'Please enter Name of patient/parent/legal guardian', required: true }, //
    // { id: 'textbox_NurseName1', message: 'Exact relationship to patient', required: true },
    // { id: 'text_TelephoneNumber', message: 'Telephone Number', required: true },
    // { id: 'text_WitnessCode1', message: 'Witness1 Id', required: true },
    { id: 'text_Witness_Name_1', message: 'Please enter Name of Witness 1', required: true },
    // { id: 'text_WitnessCode2', message: 'Witness2 Id', required: true },
    // { id: 'text_Witness_Name_2', message: ' Name of Witness 2', required: true },
    // { id: 'ta_SocialWorker', message: 'Intervention of the Social Worker / Manager on Duty', required: true },
    // { id: 'text_ID1A', message: 'Id', required: true },
    // { id: 'textbox_socialworker', message: 'Name', required: true },
  ];

  private additionalSignnatureNameCollection: any = { nameId: 'text_PatientSign', signatureId: 'Signature3', nameMessage: 'Please enter patient/parent/legal guardian Name', signatureMessage: 'Please enter patient/parent/legal guardian Signature' };

  signReason: string = '';

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private datepipe: DatePipe) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.signarureNameCollection = [
      { nameId: 'text_Name', signatureId: 'Signature1', nameMessage: 'Please enter Name', signatureMessage: 'Please enter Doctor Signature' },
      { nameId: 'text_Name_1', signatureId: 'Signature2', nameMessage: 'Please enter Name 1', signatureMessage: 'Please enter Signature 1' },
      { nameId: 'text_Name_2', signatureId: 'Signature4', nameMessage: 'Please enter patient/parent/legal guardian Name 1', signatureMessage: 'Please enter patient/parent/legal guardian Signature 1' },
      { nameId: 'text_Witness_Name_1', signatureId: 'Signature5', nameMessage: 'Please enter Witness Name 1', signatureMessage: 'Please enter Witness Signature 1' },
      { nameId: 'text_Witness_Name_2', signatureId: 'Signature6', nameMessage: 'Please enter Witness Name 2', signatureMessage: 'Please enter Witness Signature 2' },
      { nameId: 'textbox_socialworker', signatureId: 'Signature7', nameMessage: 'Please enter Social Worker Name', signatureMessage: 'Please enter Social Worker Signature' }
    ]
  }

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  ngOnInit(): void {
    this.getreoperative("9");
  }

  ngAfterViewInit() {
    if (this.Date1) {
      this.Date1.nativeElement.id = 'textbox_Date1';
    }
    if (this.Date2) {
      this.Date2.nativeElement.id = 'textbox_Date2';
    }
    if (this.Date3) {
      this.Date3.nativeElement.id = 'textbox_Date3';
    }
    if (this.Date4) {
      this.Date4.nativeElement.id = 'textbox_Date4';
    }
    if (this.Date5) {
      this.Date5.nativeElement.id = 'textbox_Date5';
    }
    if (this.Date6) {
      this.Date6.nativeElement.id = 'textbox_Date6';
    }
    if (this.Date7) {
      this.Date7.nativeElement.id = 'textbox_Date7';
    }
    if (this.Date8) {
      this.Date8.nativeElement.id = 'textbox_Date8';
    }
    if (this.Date9) {
      this.Date9.nativeElement.id = 'textbox_Date9';
    }
    if (this.Date10) {
      this.Date10.nativeElement.id = 'textbox_Date10';
    }
    if (this.Date11) {
      this.Date11.nativeElement.id = 'textbox_Date11';
    }
    if (this.Date12) {
      this.Date12.nativeElement.id = 'textbox_Date12';
    }
    if (this.Date13) {
      this.Date13.nativeElement.id = 'textbox_Date13';
    }
    if (this.Date14) {
      this.Date14.nativeElement.id = 'textbox_Date14';
    }

    if (this.divama) {
      this.bindTextboxValue("textbox_bp", this.selectedView.BP ? this.selectedView.BP : '');
      this.bindTextboxValue("textbox_temp", this.selectedView.Temperature ? this.selectedView.Temperature : '');
      this.bindTextboxValue("textbox_pulse", this.selectedView.Pulse ? this.selectedView.Pulse : '');
      this.bindTextboxValue("textbox_rr", this.selectedView.Respiration ? this.selectedView.Respiration : '');
      this.bindTextboxValue("textbox_o2", this.selectedView.SPO2 ? this.selectedView.SPO2 : '');
      this.bindTextboxValue("textbox_conductedby", this.doctorDetails[0].UserName);
      this.bindTextboxValue("textbox_amtcode", this.doctorDetails[0].EmpNo);
      this.bindTextboxValue("textbox_Date1", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date2", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date3", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date4", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date5", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date6", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date7", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date8", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date9", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date10", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date11", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date12", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date13", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date14", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Time1", this.setCurrentTime());
      this.bindTextboxValue("textbox_Time3", this.setCurrentTime());
      this.bindTextboxValue("textbox_Time7", this.setCurrentTime());
      this.bindTextboxValue("textbox_Time9", this.setCurrentTime());
      this.bindTextboxValue("textbox_Time11", this.setCurrentTime());
      this.bindTextboxValue("textbox_Time13", this.setCurrentTime());
    }

    setTimeout(() => {
      this.showdefault(this.divama.nativeElement);
    }, 1000);

    const now = new Date();
    this.timerData.push({ id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time4', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time5', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time6', value: now.getHours() + ':' + now.getMinutes() });
    this.addListeners(this.datepickers);
  }

  viewWorklist() {
    $("#savedModal").modal('show');
  }

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
            this.dataChangesMap = {};
            this.showElementsData(this.divama.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
            this.IsViewActual = true;
          }
        }
      },
        (err) => {
        })
  }

  save() {
    if (this.isPatientRefused) {
      this.requiredFields = this.requiredFields.filter((x: any) => x.id != 'text_PatientSign');
      this.signarureNameCollection = this.signarureNameCollection.filter((x: any) => x.signatureId != 'Signature3');
    } else {
      if (this.signarureNameCollection.findIndex((x: any) => x.signatureId == 'Signature3') == -1) {
        this.signarureNameCollection.push(this.additionalSignnatureNameCollection);
      }
    }

    const tags = this.findHtmlTagIds(this.divama, this.requiredFields);

    if (tags && tags.length > 0) {
      const mergedArray = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 9,
        "ClinicalTemplateValues": JSON.stringify(mergedArray),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID,
        "Signature1": this.signatureForm.get('Signature1').value,
        "Signature2": this.signatureForm.get('Signature2').value,
        "Signature3": this.signatureForm.get('Signature3').value,
        "Signature4": this.signatureForm.get('Signature4').value,
        "Signature5": this.signatureForm.get('Signature5').value,
        "Signature6": this.signatureForm.get('Signature6').value,
        "Signature7": this.signatureForm.get('Signature7').value
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("9");
          }
        },
          (err) => {

          });
    }
  }

  clear() {
    this.isPatientRefused = false;
    this.dataChangesMap = {};
    this.showContent = false;
    this.PatientTemplatedetailID = 0;
    this.signatureForm.reset();
    this.signatureList = [];
    setTimeout(() => {
      this.showContent = true;
    }, 0);
  }

  onCheckboxClicked(id: string, key: any) {
    if (id === (this as any)[key]) {
      (this as any)[key] = "";
    }
    else {
      (this as any)[key] = id;
    }
  }

  templatePrint_Old(name: any) {
    this.print(this.divama.nativeElement, name);
  }
  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divama.nativeElement.parentNode;
        const nextSibling = this.divama.nativeElement.nextSibling;

        const space = document.createElement('div');
        space.style.height = '60px';
        header.appendChild(space);

        header.appendChild(this.divama.nativeElement);

        this.print(header, name);

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divama.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divama.nativeElement);
          }

          header.removeChild(space);

          $('#divscroll').addClass("template_scroll");
          this.IsView = this.IsViewActual;
        }, 500);
      }, 500);

      return;
    }
  }

}
