import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import moment from 'moment';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
declare var $: any;

@Component({
  selector: 'app-admixture-services',
  templateUrl: './admixture-services.component.html',
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
export class AdmixtureServicesComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divaxs') divaxs!: ElementRef;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsView = false;
  showContent = true;
  HospitalID: any;
  IsPrint: boolean = false;
  IsViewActual = false;
  nursesData: any = [];
  @ViewChild('date1', { static: false }) Date1!: ElementRef;
  @ViewChild('date2', { static: false }) Date2!: ElementRef;
  @ViewChild('date3', { static: false }) Date3!: ElementRef;
  @ViewChild('date4', { static: false }) Date4!: ElementRef;
  @ViewChild('date5', { static: false }) Date5!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
  }

  ngOnInit(): void {
    this.getreoperative("122");
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

    setTimeout(() => {
      this.showdefault(this.divaxs.nativeElement);
    }, 5000);
    const now = new Date();
    this.timerData.push({ id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes() });
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
            this.showElementsData(this.divaxs.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
          }
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divaxs);

    if (tags) {
      const mergedArray = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 122,
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
            this.getreoperative("122");
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
    }, 0);
  }

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divaxs.nativeElement.parentNode;
        const nextSibling = this.divaxs.nativeElement.nextSibling;

        const space = document.createElement('div');
        space.style.height = '60px';
        header.appendChild(space);

        header.appendChild(this.divaxs.nativeElement);

        this.print(header, name);

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divaxs.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divaxs.nativeElement);
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

  onNurseSelection(item: any, id: string) {
    this.nursesData = [];
    this.bindTextboxValue(id, item.EmpNo);
  }

}
