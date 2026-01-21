import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { MatDatepicker } from '@angular/material/datepicker';
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
  selector: 'app-critical-care-monitoring-sheet',
  templateUrl: './critical-care-monitoring-sheet.component.html',
  styleUrls: ['./critical-care-monitoring-sheet.component.scss'],
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
export class CriticalCareMonitoringSheetComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divccms') divccms!: ElementRef;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  showContent = true;
  @ViewChild('Date1', {static: false}) Date1!: ElementRef;
  @ViewChild('Date2', {static: false}) Date2!: ElementRef;
  @ViewChild('Date3', {static: false}) Date3!: ElementRef;
  @ViewChild('Date4', {static: false}) Date4!: ElementRef;
  @ViewChild('Date5', {static: false}) Date5!: ElementRef;
  @ViewChild('Date6', {static: false}) Date6!: ElementRef;
  @ViewChild('Date7', {static: false}) Date7!: ElementRef;
  @ViewChild('Date8', {static: false}) Date8!: ElementRef;
  @ViewChild('Date9', {static: false}) Date9!: ElementRef;
  @ViewChild('Date10', {static: false}) Date10!: ElementRef;
  @ViewChild('Date11', {static: false}) Date11!: ElementRef;
  @ViewChild('Date12', {static: false}) Date12!: ElementRef;
  @ViewChild('Date13', {static: false}) Date13!: ElementRef;
  @ViewChild('Date14', {static: false}) Date14!: ElementRef;
  @ViewChild('Date15', {static: false}) Date15!: ElementRef;
  @ViewChild('Date16', {static: false}) Date16!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
  today = new Date();

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef,private service: MedicalAssessmentService, private us: UtilityService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
   }

  ngOnInit(): void {
    this.getreoperative("45");
  }

  viewWorklist() {
    $("#savedModal").modal('show');
  }
  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
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
            this.showElementsData(this.divccms.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
            this.IsViewActual = true;

          }
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divccms);

    if (tags) {
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 45,
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
            this.getreoperative("45");
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
    if (this.Date1) {
      this.Date1.nativeElement.id = 'textbox_AdmitDate';
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

    if (this.Date15) {
      this.Date15.nativeElement.id = 'textbox_Date15';
    }
    if (this.Date16) {
      this.Date16.nativeElement.id = 'textbox_Date16';
    }

    setTimeout(()=>{
      this.showdefault(this.divccms.nativeElement);
    }, 4000);
    this.addListeners(this.datepickers);
  }

  getSum(id: string): number {
    if(this.divccms) {
      let total = 0;
      const selects = this.divccms.nativeElement.querySelectorAll(`.${id}`);
      selects.forEach((select: HTMLSelectElement) => {
        const value = parseInt(select.value);
        if (!isNaN(value)) {
          total += value;
        }
      });
  
     return total;
    }
    return 0;
  }

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divccms.nativeElement.parentNode;
        const nextSibling = this.divccms.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divccms.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divccms.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divccms.nativeElement);
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
