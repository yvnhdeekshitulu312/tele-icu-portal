import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { MatDatepicker } from '@angular/material/datepicker';
declare var $: any;
@Component({
  selector: 'app-dnr-form',
  templateUrl: './dnr-form.component.html',
  styleUrls: ['./dnr-form.component.scss'],
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
export class DnrFormComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divdnr') divdnr!: ElementRef;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  IsWaterMark= false;
  showContent = true;
  @ViewChild('Date1', {static: false}) Date1!: ElementRef;
  @ViewChild('Date2', {static: false}) Date2!: ElementRef;
  @ViewChild('Date3', {static: false}) Date3!: ElementRef;
  @ViewChild('Date4', {static: false}) Date4!: ElementRef;
  @ViewChild('Date5', {static: false}) Date5!: ElementRef;
  @ViewChild('Date6', {static: false}) Date6!: ElementRef;
  @ViewChild('Date7', {static: false}) Date7!: ElementRef;
  @ViewChild('Date8', {static: false}) Date8!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;

  requiredFields = [
    { id: 'textarea_diagnosis', message: 'DIAGNOSIS(ES)', required: true },
    { id: 'textarea_Justification', message: 'Justification', required: true },
    { id: 'textbox_name1', message: 'Please enter Name 1', required: true },
    { id: 'textbox_name2', message: 'Please enter Name 2', required: true },
    { id: 'textbox_name3', message: 'Please enter Name 3', required: true },
  ];

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef,private service: MedicalAssessmentService, private us: UtilityService, private datepipe: DatePipe) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');

    this.signarureNameCollection = [
      {nameId: 'textbox_name1', signatureId: 'Signature1', nameMessage: 'Please enter Name 1', signatureMessage: 'Please enter Signature 1'},
      {nameId: 'textbox_name2', signatureId: 'Signature2', nameMessage: 'Please enter Name 2', signatureMessage: 'Please enter Signature 2'},
      {nameId: 'textbox_name3', signatureId: 'Signature3', nameMessage: 'Please enter Name 3', signatureMessage: 'Please enter Signature 3'},
    ]
   }

   ngOnInit(): void {
    this.getreoperative("19");
  }
  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
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
  //   this.showElementsData(this.divdnr.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser,tem);
  //   $("#savedModal").modal('hide');
  // }
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
            this.showElementsData(this.divdnr.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
    const tags = this.findHtmlTagIds(this.divdnr,this.requiredFields);

    if (tags && tags.length>0) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 19,
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
        "Signature7": this.signatureForm.get('Signature7').value,
        "Signature8": this.signatureForm.get('Signature8').value,
        "Signature9": this.signatureForm.get('Signature9').value,
       "Signature10": this.signatureForm.get('Signature10').value
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("19");
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

  ngAfterViewInit() {
    setTimeout(()=>{
      this.showdefault(this.divdnr.nativeElement);

      if (this.Date1) {
        this.Date1.nativeElement.id = 'textbox_Date1';
        this.Date1.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
      }
      if (this.Date2) {
        this.Date2.nativeElement.id = 'textbox_Date2';
        this.Date2.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
      }
      if (this.Date3) {
        this.Date3.nativeElement.id = 'textbox_Date3';
        this.Date3.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
      }
      if (this.Date4) {
        this.Date4.nativeElement.id = 'textbox_Date4';
        //this.Date4.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
      }
      if (this.Date5) {
        this.Date5.nativeElement.id = 'textbox_Date5';
        //this.Date5.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
      }
      if (this.Date6) {
        this.Date6.nativeElement.id = 'textbox_Date6';
        //this.Date6.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
      }
      if (this.Date7) {
        this.Date7.nativeElement.id = 'textbox_Date7';
        //this.Date7.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
      }
      if (this.Date8) {
        this.Date8.nativeElement.id = 'textbox_Date8';
        //this.Date8.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
      }

      const now = new Date();
      this.timerData.push({id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes()});
      this.timerData.push({id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes()});
      this.timerData.push({id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes()});
      this.timerData.push({id: 'textbox_generic_time4', value: '00'+ ':' + '00'})
      this.timerData.push({id: 'textbox_generic_time5', value: '00'+ ':' + '00'})
      this.timerData.push({id: 'textbox_generic_time6', value: '00'+ ':' + '00'})
      this.timerData.push({id: 'textbox_generic_time7', value: '00'+ ':' + '00'})
      this.timerData.push({id: 'textbox_generic_time8', value: '00'+ ':' + '00'})

      // this.bindTextboxValue("textbox_time1", this.setCurrentTime());
      // this.bindTextboxValue("textbox_time2", this.setCurrentTime());
      // this.bindTextboxValue("textbox_time3", this.setCurrentTime());
      // this.bindTextboxValue("textbox_time4", this.setCurrentTime());
      // this.bindTextboxValue("textbox_time5", this.setCurrentTime());
      // this.bindTextboxValue("textbox_time6", this.setCurrentTime());
      // this.bindTextboxValue("textbox_time7", this.setCurrentTime());
      // this.bindTextboxValue("textbox_time8", this.setCurrentTime());
    }, 3000);
    this.addListeners(this.datepickers);
  }

  showHideAttendingPhysician() {
    const reverseDnr = document.getElementById("reverseDnr");
    const reviseDnr = document.getElementById("reviseDnr");
    if(reviseDnr?.classList.contains('active')){
      this.IsWaterMark=true;
      return true;
    }
    else if(reverseDnr?.classList.contains('active')){
      this.IsWaterMark=true;
      return true;
    }
    else{
      this.IsWaterMark=false;
      return false;
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
        const originalParent = this.divdnr.nativeElement.parentNode;
        const nextSibling = this.divdnr.nativeElement.nextSibling;

        const space = document.createElement('div');
        space.style.height = '60px';
        header.appendChild(space);

        header.appendChild(this.divdnr.nativeElement);

        this.print(header, name);

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divdnr.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divdnr.nativeElement);
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
