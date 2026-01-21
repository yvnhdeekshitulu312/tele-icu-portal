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
  selector: 'app-infection-prevention-control-department',
  templateUrl: './infection-prevention-control-department.component.html',
  styleUrls: ['./infection-prevention-control-department.component.scss'],
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
export class InfectionPreventionControlDepartmentComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divipcd') divipcd!: ElementRef;
  @ViewChild('patientdate', {static: false}) patientdate!: ElementRef;
  @ViewChild('patient1date', {static: false}) patient1date!: ElementRef;
  @ViewChild('physiciandate', {static: false}) physiciandate!: ElementRef;
  @ViewChild('physician1date', {static: false}) physician1date!: ElementRef;
  @ViewChild('physician2date', {static: false}) physician2date!: ElementRef;
  @ViewChild('physician3date', {static: false}) physician3date!: ElementRef;
  @ViewChild('Date1', {static: false}) date1!: ElementRef;
  @ViewChild('Date2', {static: false}) date2!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  showContent = true;

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef,private service: MedicalAssessmentService, private us: UtilityService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
   }

  
   ngOnInit(): void {
    this.getreoperative("115");
  }

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
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
            this.showElementsData(this.divipcd.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
            this.IsViewActual=true
          }
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divipcd);

    if (tags) {
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 115,
        "ClinicalTemplateValues": JSON.stringify(tags),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID,
        "Signature1": this.signatureForm.get('Signature1').value,
        "Signature2": this.signatureForm.get('Signature2').value,
        "Signature3": this.signatureForm.get('Signature3').value,

      }
  
      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("115");
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
    const now = new Date();
    this.timerData.push({ id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time4', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time5', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time6', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time7', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time8', value: now.getHours() + ':' + now.getMinutes() })
    setTimeout(()=>{
      this.bindTextboxValue("textbox_PatientName", this.patientData.PatientName);
      this.bindTextboxValue("textbox_PatientNameAr", this.patientData.PatientName);
    }, 2000);
    if (this.patientdate) {
      this.patientdate.nativeElement.id = 'textbox_patientdate';
      this.patientdate.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.patient1date) {
      this.patient1date.nativeElement.id = 'textbox_patient1date';
      this.patient1date.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.physiciandate) {
      this.physiciandate.nativeElement.id = 'textbox_physiciandate';
      this.physiciandate.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.physician1date) {
      this.physician1date.nativeElement.id = 'textbox_physician1date';
      this.physician1date.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.physician2date) {
      this.physician2date.nativeElement.id = 'textbox_physician2date';
      this.physician2date.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.physician3date) {
      this.physician3date.nativeElement.id = 'textbox_physician3date';
      this.physician3date.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.date1) {
      this.date1.nativeElement.id = 'textbox_date1';
      this.date1.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.date2) {
      this.date2.nativeElement.id = 'textbox_date2';
      this.date2.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    this.addListeners(this.datepickers);
  }

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divipcd.nativeElement.parentNode;
        const nextSibling = this.divipcd.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divipcd.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divipcd.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divipcd.nativeElement);
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
