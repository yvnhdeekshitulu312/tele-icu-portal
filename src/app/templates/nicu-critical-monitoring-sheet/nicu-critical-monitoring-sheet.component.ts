import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { ConfigService } from 'src/app/services/config.service';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
declare var $: any;

@Component({
  selector: 'app-nicu-critical-monitoring-sheet',
  templateUrl: './nicu-critical-monitoring-sheet.component.html',
  styleUrls: ['./nicu-critical-monitoring-sheet.component.scss'],
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
export class NicuCriticalMonitoringSheetComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {

  
  @ViewChild('divncms') divncms!: ElementRef;
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
  @ViewChild('Date17', {static: false}) Date17!: ElementRef;
  @ViewChild('orderdate', {static: false}) orderdate!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
  
  @ViewChild('signature1') signature1!: SignatureComponent;
  requiredFields = [
    { id: 'textbox_name', message: 'Name is required', required: true },
    { id: 'textbox_AdmitDate', message: 'Admit date is required', required: true }
  ];

  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  showContent = true;
  HospitalID: any;
  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef,private service: MedicalAssessmentService, private us: UtilityService, private config: ConfigService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
   }

  ngOnInit(): void {
    this.getreoperative("108");
  }

  ngAfterViewInit() {
    if (this.Date1) {
      this.Date1.nativeElement.id = 'textbox_Date1';
    }
    if (this.Date2) {
      this.Date2.nativeElement.id = 'textbox_AdmitDate';
    }
    if (this.Date3) {
      this.Date3.nativeElement.id = 'textbox_DOBB';
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
    if (this.Date17) {
      this.Date17.nativeElement.id = 'textbox_Date17';
    }
    if (this.orderdate) {
      this.orderdate.nativeElement.id = 'textbox_orderdate';
    }

    setTimeout(()=>{
      this.showdefault(this.divncms.nativeElement);
    }, 4000);

    const now = new Date();
    this.timerData.push({id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time4', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time5', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time6', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time7', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time8', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time9', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time10', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time11', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time12', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time13', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time14', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time15', value: now.getHours() + ':' + now.getMinutes()});
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
            this.showElementsData(this.divncms.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
    const tags = this.findHtmlTagIds(this.divncms, this.requiredFields);

    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 108,
        // "ClinicalTemplateValues": JSON.stringify(tags),
        "ClinicalTemplateValues": JSON.stringify(mergedArray),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID,
        "Signature1": this.signatureForm.get('Signature1').value
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("108");
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


  getDiagnosis() {
    this.config.fetchAdviceDiagnosis(this.selectedView.AdmissionID, this.HospitalID)
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

  getSum(className: string): number {
    const selects = document.querySelectorAll(`.${className}`);
    let sum = 0;

    selects.forEach((select: any) => {
        const selectedValue = select.options[select.selectedIndex].text;
        if (selectedValue !== '-') {
            sum += parseFloat(selectedValue) || 0; 
        }
    });

    return sum;
}

templatePrint(name: any, header?: any) {
  if (header) {
    if ($('#divscroll').hasClass('template_scroll')) {
      $('#divscroll').removeClass("template_scroll");
    }

    this.IsPrint = true;
    this.IsView = false;

    setTimeout(() => {
      const originalParent = this.divncms.nativeElement.parentNode;
      const nextSibling = this.divncms.nativeElement.nextSibling; 

      const space = document.createElement('div');
      space.style.height = '60px'; 
      header.appendChild(space);

      header.appendChild(this.divncms.nativeElement); 

      this.print(header, name); 

      setTimeout(() => {
        if (nextSibling) {
          originalParent.insertBefore(this.divncms.nativeElement, nextSibling);
        } else {
          originalParent.appendChild(this.divncms.nativeElement);
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
