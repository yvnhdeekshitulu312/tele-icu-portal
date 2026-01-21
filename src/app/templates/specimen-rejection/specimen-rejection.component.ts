import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { AppInjector } from 'src/app/services/app-injector.service';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { CommonService } from 'src/app/shared/common.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
declare var $: any;
@Component({
  selector: 'app-specimen-rejection',
  templateUrl: './specimen-rejection.component.html',
  styleUrls: ['./specimen-rejection.component.scss'],
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
export class SpecimenRejectionComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divsrr') divasct!: ElementRef;
  @ViewChild('date1', { static: false }) date1!: ElementRef;
  @ViewChild('date2', { static: false }) date2!: ElementRef;
  @ViewChild('date3', { static: false }) date3!: ElementRef;
  @ViewChild('date4', { static: false }) date4!: ElementRef;
  @ViewChild('date5', { static: false }) date5!: ElementRef;
  @ViewChild('date6', { static: false }) date6!: ElementRef;
  @ViewChild('date7', { static: false }) date7!: ElementRef;
  tem: any;
  sameUser: boolean = true;
  PatientTemplatedetailID = 0;
  showContent = true;
  selectedView: any;
  doctorDetails: any;
  @Input() data!: any;
  selectedPatientData: any;
  common: CommonService;
  url = "";
  TestOrderItemID = 0;
  FetchPatienClinicalTemplateDetailsNList: any;
  currentdate: any;
  location: any;

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private us: UtilityService, private service: MedicalAssessmentService) {
    super(renderer, el, cdr);
    const injector = AppInjector.getInjector();
    this.common = injector.get<CommonService>(CommonService);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  }


  ngOnInit(): void {
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY H:mm');
    this.location = sessionStorage.getItem("locationName");
    this.TestOrderItemID = this.data.selectedPatientData.TestOrderItemID ;
    this.getreoperative("132");
  }

  ngAfterViewInit() {
    this.bindTextboxValue("Physician", this.data.selectedPatientData.Doctor ??  this.data.selectedPatientData.DocName??this.data.selectedPatientOrderData.DocName);
    this.bindTextboxValue("RejectionLocation", this.data.selectedPatientData.OrderHospitalName ?? sessionStorage.getItem("locationName"));
    if (this.date1) {
      this.date1.nativeElement.id = 'textbox_date1';
      this.date1.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.date2) {
      this.date2.nativeElement.id = 'textbox_date2';
      this.date2.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.date3) {
      this.date3.nativeElement.id = 'textbox_date3';
      this.date3.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.date4) {
      this.date4.nativeElement.id = 'textbox_date4';
      this.date4.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.date5) {
      this.date5.nativeElement.id = 'textbox_date5';
      this.date5.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.date6) {
      this.date6.nativeElement.id = 'textbox_date6';
      this.date6.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.date7) {
      this.date7.nativeElement.id = 'textbox_date7';
      this.date7.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }

    const now = new Date();
    this.timerData.push({ id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time4', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time5', value: now.getHours() + ':' + now.getMinutes() })

  }

  getreoperative(templateid: any) {
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: 0, TBL: 1 });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
            // this.selectedTemplate(this.FetchPatienClinicalTemplateDetailsNList[0]);
            const chkLst = this.FetchPatienClinicalTemplateDetailsNList.find((x: any) => x.AssessmentOrderId == this.TestOrderItemID);
            this.selectedTemplate(chkLst);
          }
        }
      },
        () => {
        })
  }

  selectedTemplate(tem: any) {
          this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
          // this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: 0, AdmissionID: this.item.AdmissionID, PatientTemplatedetailID: this.PatientTemplatedetailID, TBL: 2 });
          this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOTSaf, { ClinicalTemplateID: 0, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: tem.PatientTemplatedetailID, AssesmentOrderID: this.TestOrderItemID, TBL: 2 });
  
          this.us.get(this.url)
              .subscribe((response: any) => {
                  if (response.Code == 200) {
                      if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
                          tem = response.FetchPatienClinicalTemplateDetailsNNList[0];
                          let sameUser = true;
                          this.tem = tem;
                          if (tem.CreatedBy != this.doctorDetails[0]?.UserName) {
                              sameUser = false;
                              this.sameUser = false;
                          }
                          this.showElementsData(this.divasct.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
                          $("#savedModal").modal('hide');
                      }
                  }
              },
                  () => {
                  })
      }

  save() {
    const tags = this.findHtmlTagIds(this.divasct);

    if (tags) {
      const mergedArray = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.selectedView.ConsultantID,
        "SpecialiseID": this.selectedView.SpecialiseID?? '50',
        "ClinicalTemplateID": 132,
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
        "AssessmentOrderId": this.TestOrderItemID
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            //this.getreoperative("132");
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

  onCheckboxSelection(event: any, groupIds?: string[], disable?: boolean) {
    const divElement = event.currentTarget as HTMLElement;
    if (divElement.classList.contains('active')) {
      divElement.classList.remove('active');
      groupIds?.forEach(id => {
        document.getElementById(id)?.classList.remove('disabled');
      });
    } else {
      divElement.classList.add('active');
      if (disable) {
        groupIds?.forEach(id => {
          if (id !== divElement.id) {
            document.getElementById(id)?.classList.add('disabled');
          }
        });
      }
    }
    groupIds?.forEach(id => {
      if (id !== event.currentTarget.id) {
        document.getElementById(id)?.classList.remove('active');
      }
    });
  }

  
  templatePrint() {
    // Remove any existing headers and footers
    const existingHeader = document.getElementById('dynamic-header');
    const existingFooter = document.getElementById('dynamic-footer');
    
    if (existingHeader) {
      existingHeader.remove();
    }
    if (existingFooter) {
      existingFooter.remove();
    }
  
    // Set a timeout to wait for the elements to be added before triggering print
    setTimeout(() => {
      document.title = 'Rejection_'+ new Date().toISOString();
      window.print();  // Trigger print dialog

    }, 500);
  }

  // templatePrint(name: any, header?: any) {
  //   if (header) {
  //     if ($('#divscroll').hasClass('template_scroll')) {
  //       $('#divscroll').removeClass("template_scroll");
  //     }

  //     //this.IsPrint = true;
  //     // this.IsView = false;

  //     setTimeout(() => {
  //       const originalParent = this.divasct.nativeElement.parentNode;
  //       const nextSibling = this.divasct.nativeElement.nextSibling;

  //       const space = document.createElement('div');
  //       space.style.height = '60px';
  //       header.appendChild(space);

  //       header.appendChild(this.divasct.nativeElement);

  //       this.print(header, name);

  //       setTimeout(() => {
  //         if (nextSibling) {
  //           originalParent.insertBefore(this.divasct.nativeElement, nextSibling);
  //         } else {
  //           originalParent.appendChild(this.divasct.nativeElement);
  //         }

  //         header.removeChild(space);

  //         $('#divscroll').addClass("template_scroll");
  //         //this.IsPrint = false;
  //         //this.IsView = this.IsViewActual;
  //       }, 500);
  //     }, 500);

  //     return;
  //   }
  // }
}
