import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { ConfigService } from 'src/app/services/config.service';
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
  selector: 'app-invasive-procedure-safety-checklist',
  templateUrl: './invasive-procedure-safety-checklist.component.html',
  styleUrls: ['./invasive-procedure-safety-checklist.component.scss'],
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
export class InvasiveProcedureSafetyChecklistComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divips') divips!: ElementRef;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  showContent = true;
  @ViewChild('ddate', {static: false}) ddate!: ElementRef;
  
  @ViewChild('pddate', {static: false}) pddate!: ElementRef;

  @ViewChild('nsdate1', {static: false}) nsdate1!: ElementRef;
  @ViewChild('nsdate2', {static: false}) nsdate2!: ElementRef;
  @ViewChild('nsdate3', {static: false}) nsdate3!: ElementRef;
  @ViewChild('nsdate4', {static: false}) nsdate4!: ElementRef;
  @ViewChild('nsdate5', {static: false}) nsdate5!: ElementRef;
  @ViewChild('nsdate6', {static: false}) nsdate6!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
  
  nursesData: any = [];
  doctorsData: any = [];

  preConsciousIds: string[] = ['checkbox_Aalert1', 'checkbox_Vvoice1', 'checkbox_Ppain1', 'checkbox_Uunresponsive1'];
  postConsciousIds: string[] = ['checkbox_Aalert2', 'checkbox_Vvoice2', 'checkbox_Ppain2', 'checkbox_Uunresponsive2'];
  procedureIds: string[] = ['checbox_Stat', 'checkbox_EmergencyE', 'checkbox_UrgentU', 'checkbox_Eelective'];

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef,private service: MedicalAssessmentService, private us: UtilityService, private datepipe: DatePipe, private configService: ConfigService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
   }

  ngOnInit(): void {
    this.getreoperative("24");
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
  //   this.showElementsData(this.divips.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser,tem);
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
            this.showElementsData(this.divips.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
    const tags = this.findHtmlTagIds(this.divips);

    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 24,
        // "ClinicalTemplateValues": JSON.stringify(tags),
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
            this.getreoperative("24");
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
    this.timerData.push({ id: 'textbox_generic_time9', value: now.getHours() + ':' + now.getMinutes() })
    
    if (this.ddate) {
      this.ddate.nativeElement.id = 'textbox_ddate';
    }
    if(this.pddate) {
      this.pddate.nativeElement.id = 'textbox_pddate';
    }
    if(this.nsdate1) {
      this.nsdate1.nativeElement.id = 'textbox_nsdate1';
    }
    if(this.nsdate2) {
      this.nsdate2.nativeElement.id = 'textbox_nsdate2';
    }
    if(this.nsdate3) {
      this.nsdate3.nativeElement.id = 'textbox_nsdate3';
    }
    if(this.nsdate4) {
      this.nsdate4.nativeElement.id = 'textbox_nsdate4';
    }
    if(this.nsdate5) {
      this.nsdate5.nativeElement.id = 'textbox_nsdate5';
    }
    if(this.nsdate6) {
      this.nsdate6.nativeElement.id = 'textbox_nsdate6';
    }

    setTimeout(()=>{
      this.showdefault(this.divips.nativeElement);
      this.bindTextboxValue('textbox_ddate', this.datepipe.transform(new Date(), "dd-MMM-yyyy"));
      this.bindTextboxValue('textbox_pddate', this.datepipe.transform(new Date(), "dd-MMM-yyyy"));
      this.bindTextboxValue('textbox_nsdate1', this.datepipe.transform(new Date(), "dd-MMM-yyyy"));
      this.bindTextboxValue('textbox_nsdate2', this.datepipe.transform(new Date(), "dd-MMM-yyyy"));
      this.bindTextboxValue('textbox_nsdate3', this.datepipe.transform(new Date(), "dd-MMM-yyyy"));
      this.bindTextboxValue('textbox_nsdate4', this.datepipe.transform(new Date(), "dd-MMM-yyyy"));
      this.bindTextboxValue('textbox_nsdate5', this.datepipe.transform(new Date(), "dd-MMM-yyyy"));
      this.bindTextboxValue('textbox_nsdate6', this.datepipe.transform(new Date(), "dd-MMM-yyyy"));
    }, 3000);
    this.addListeners(this.datepickers);
  }

  onCheckboxSelection(event:any, ids: string[]) {
    const divElement = event.currentTarget as HTMLElement;
    if (divElement.classList.contains('active')) {
      divElement.classList.remove('active');
    } else {
      divElement.classList.add('active');
    }
    ids.forEach(id => {
      if (id !== event.currentTarget.id) {
        document.getElementById(id)?.classList.remove('active');
      }
    });
  }

  searchNurse(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.us.get("FetchWitnessNurse?Filter=" + filter + "&HospitalID=" + this.hospitalID + "")
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.nursesData = response.FetchRODNursesDataList;
          }
        },
          (err) => {

          })
    }
  }

  searchDoctor(event: any) {
    if (event.target.value.length >= 3) {
      this.configService.FetchHospitalNurse("FetchBathHospitalDoctors", event.target.value.trim(), this.doctorDetails[0].UserId, 3403, this.hospitalID)
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

  onNurseSelection(item: any, id: string) {
    this.nursesData = [];
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
        const originalParent = this.divips.nativeElement.parentNode;
        const nextSibling = this.divips.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divips.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divips.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divips.nativeElement);
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
