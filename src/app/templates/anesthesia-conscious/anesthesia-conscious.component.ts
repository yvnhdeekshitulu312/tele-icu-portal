import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { ConfigService } from 'src/app/services/config.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { DatePipe } from '@angular/common';
import { ConfigService as WardConfigService } from 'src/app/ward/services/config.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS } from '../against-medical-advice/against-medical-advice.component';
import { MatDatepicker } from '@angular/material/datepicker';
declare var $: any;

@Component({
  selector: 'app-anesthesia-conscious',
  templateUrl: './anesthesia-conscious.component.html',
  styleUrls: ['./anesthesia-conscious.component.scss'],
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
export class AnesthesiaConsciousComponent extends DynamicHtmlComponent implements OnInit {

  

  @ViewChild('divact') divact!: ElementRef;
  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  @ViewChild('Signature3') Signature3!: SignatureComponent;
  @ViewChild('DateAndTime', { static: false }) DateAndTime!: ElementRef;
  @ViewChild('DateAndTime1', { static: false }) DateAndTime1!: ElementRef;
  @ViewChild('DateAndTime2', { static: false }) DateAndTime2!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
  @Input() data: any;
  possible_en_content: string = '';
  possible_ar_content: string = '';
  potential_en_content: string = '';
  potential_ar_content: string = '';
  procedures_en_content: string = '';
  procedures_ar_content: string = '';
  readonly = false;
  url = "";
  selectedView: any;
  item: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  Constitutional: boolean = false;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsView = false;
  showContent = true;
  HospitalID: any;
  doctorsData: any[] = [];
  IsPrint = false;
  IsViewActual = false;
  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private us: UtilityService, private service: MedicalAssessmentService, private config: ConfigService, private datepipe: DatePipe, private wardConfigService: WardConfigService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
    if (sessionStorage.getItem("otpatient") != 'undefined'){
      this.item = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
    }
  }

  ngOnInit(): void { 
    if (this.data) {
      this.readonly = this.data.readonly;
      this.IsView = true;
    }
    this.getreoperative("54");
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
    if(this.item.AdmissionID != undefined) {
      this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOTSaf, { ClinicalTemplateID: 0, AdmissionID: this.item.AdmissionID ?? this.selectedView.AdmissionID, PatientTemplatedetailID: tem.PatientTemplatedetailID, AssesmentOrderID: this.item.SurgeryRequestid ?? '0', TBL: 2 });
    }    
    this.us.get(this.url)
      .subscribe((response: any) => {  
        console.log(response)
        if (response.Code == 200) {
         
          if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
            tem = response.FetchPatienClinicalTemplateDetailsNNList[0];
            let sameUser = true;
            if (tem.CreatedBy != this.doctorDetails[0]?.UserName) {
              sameUser = false;
            }
            this.dataChangesMap = {};
            this.showElementsData(this.divact.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            $("#savedModal").modal('hide');
          }
          
 
        }
      },
        (err) => {
        })
  }

  getreoperative(templateid: any) {
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: 0, TBL: 1 });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
           this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
            this.IsView = true;
            this.IsViewActual = true;
            const chkLst = this.FetchPatienClinicalTemplateDetailsNList.find((x: any) => x.AssessmentOrderId == this.item.SurgeryRequestid);
            if(chkLst!=undefined)
            this.selectedTemplate(chkLst);
          }
        }
      },
        (err) => {
        })
  }
  

  save() {
    const tags = this.findHtmlTagIds(this.divact);
    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID==undefined?this.item.SurgeonSpecialiseID:this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 54,
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
        "Signature10": this.signatureForm.get('Signature10').value,
        "AssessmentOrderId" : this.item.SurgeryRequestid
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("54");
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

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showdefault(this.divact.nativeElement);
      var patname = this.readonly ? this.patientData.NAME : this.patientData.PatientName;
      if(patname == undefined) {
        patname = this.selectedView.PatientName;
      }
      this.bindTextboxValue("txt_generic_ContactNameKin", patname);    
    }, 3000);

    if (this.DateAndTime) {
      this.DateAndTime.nativeElement.id = 'textbox_DateAndTime';
      this.DateAndTime.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
    }
    if (this.DateAndTime1) {
      this.DateAndTime1.nativeElement.id = 'textbox_DateAndTime1';
      this.DateAndTime1.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
    }
    if (this.DateAndTime2) {
      this.DateAndTime2.nativeElement.id = 'textbox_DateAndTime2';
      this.DateAndTime2.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
    }
    const now = new Date();
    this.timerData.push({ id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes() });
    this.addListeners(this.datepickers);
  }

  searchDoctor(event: any) {
    if (event.target.value.length >= 3) {
      this.wardConfigService.FetchHospitalNurse("FetchBathHospitalDoctors", event.target.value.trim(), this.doctorDetails[0].UserId, 3403, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.doctorsData = response.FetchHospitalNurseDataaList;
          }
        },
          () => {

          })
    }
  }

  onDoctorSelection(item: any, id: string) {
    this.doctorsData = [];
    this.bindTextboxValue(id, item.EmpNo);
  }
  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divact.nativeElement.parentNode;
        const nextSibling = this.divact.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divact.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divact.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divact.nativeElement);
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


onInputChange(spanType: string, event: Event){
  const content = (event.target as HTMLElement).textContent?.trim() || '';
  switch(spanType) {
    case 'possible_en':
      this.possible_en_content = content;
   
      if (this.possible_ar_content !== content) {
        this.possible_ar_content = content;
      }
      break;
    case 'possible_ar':
      this.possible_ar_content = content;
   
      if (this.possible_en_content !== content) {
        this.possible_en_content = content;
      }
      break;
    case 'potential_en':
      this.potential_en_content = content;
      
      if (this.potential_ar_content !== content) {
        this.potential_ar_content = content;
      }
      break;
    case 'potential_ar':
      this.potential_ar_content = content;
      
      if (this.potential_en_content !== content) {
        this.potential_en_content = content;
      }
      break;
    default:
      break;
  }
  this.updateSpans();
}

updateSpans(): void {
  // Get the references to the spans
  const possibleEnSpan = document.getElementById('ta_PossibleComplications') as HTMLElement;
  const possibleArSpan = document.getElementById('ta_PossibleComplicationsAr') as HTMLElement;
  const potentialEnSpan = document.getElementById('ta_PotentialComplications') as HTMLElement;
  const potentialArSpan = document.getElementById('ta_PotentialComplicationsAre') as HTMLElement;

  if (possibleEnSpan) {
    possibleEnSpan.textContent = this.possible_en_content;
  }
  if (possibleArSpan) {
    possibleArSpan.textContent = this.possible_ar_content;
  }
  if (potentialEnSpan) {
    potentialEnSpan.textContent = this.potential_en_content;
  }
  if (potentialArSpan) {
    potentialArSpan.textContent = this.potential_ar_content;
  }
}

// Method to handle changes and synchronize content
onInputChangeProcedure(spanType: string, event: Event) {
  const content = (event.target as HTMLElement).textContent?.trim() || '';

  switch(spanType) {
    case 'procedures_en':
      this.procedures_en_content = content;
      if (this.procedures_ar_content !== content) {
        this.procedures_ar_content = content;
      }
      break;
    case 'procedures_ar':
      this.procedures_ar_content = content;
      if (this.procedures_en_content !== content) {
        this.procedures_en_content = content;
      }
      break;
    default:
      break;
  }
  // Update the content of the corresponding spans
  this.updateSpansProcedure();
}

// Method to update the content of all spans
updateSpansProcedure(): void {
  // Get the references to the spans and update their content
  const proceduresEnSpan = document.getElementById('txt_generic_Procedures') as HTMLElement;
  const proceduresArSpan = document.getElementById('txt_generic_ProceduresA') as HTMLElement;

  if (proceduresEnSpan) {
    proceduresEnSpan.textContent = this.procedures_en_content;
  }
  if (proceduresArSpan) {
    proceduresArSpan.textContent = this.procedures_ar_content;
  }
}
  
}
