import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
declare var $: any;

@Component({
  selector: 'app-medical-photography-consent',
  templateUrl: './medical-photography-consent.component.html',
  styleUrls: ['./medical-photography-consent.component.scss'],
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
export class MedicalPhotographyConsentComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divmpcf') divmpcf!: ElementRef;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  showContent = true;
  today = new Date();

  @ViewChild('Date1', { static: false }) Date1!: ElementRef;
  @ViewChild('Date2', { static: false }) Date2!: ElementRef;
  @ViewChild('Date3', { static: false }) Date3!: ElementRef;
  @ViewChild('Date4', { static: false }) Date4!: ElementRef;


  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  @ViewChild('Signature3') Signature3!: SignatureComponent;
  @ViewChild('Signature4') Signature4!: SignatureComponent;
  @ViewChild('Signature5') Signature5!: SignatureComponent;
  @ViewChild('Signature6') Signature6!: SignatureComponent;
  @ViewChild('Signature7') Signature7!: SignatureComponent;
  @ViewChild('Signature8') Signature8!: SignatureComponent;
  @ViewChild('Signature9') Signature9!: SignatureComponent;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;

  requiredFields = [];

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private datepipe: DatePipe) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  }

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  ngOnInit(): void {
    this.getreoperative("138");
  }

  ngAfterViewInit() {
    if (this.divmpcf) {
      this.bindTextboxValue("textbox_Date1", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Date2", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
    }

    setTimeout(() => {
      this.showdefault(this.divmpcf.nativeElement);
    }, 3000);

    const now = new Date();
    this.timerData.push({ id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time4', value: now.getHours() + ':' + now.getMinutes() });
    this.addListeners(this.datepickers);
  }

  viewWorklist() {
    $("#savedModal").modal('show');
  }

  selectedTemplate(tem: any) {
    this.showContent = false;
    setTimeout(() => {
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
            this.showElementsData(this.divmpcf.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
    this.errorMessages = [];

    const isMyself = document.getElementById('myself')?.classList.contains("active");
    const onBehalf = document.getElementById('onbehalf')?.classList.contains("active");
    const gaurdian = document.getElementById('gaurdian')?.classList.contains("active");

    if (!isMyself && !onBehalf && !gaurdian) {
      this.errorMessages.push({
        message: 'Please select type of consent - MySelf / OnBehalf of Patient / Gaurdian'
      });
    }

    if (!$('#textbox_PatientName').val()) {
      this.errorMessages.push({
        message: 'Please enter Patient Name'
      });
    }

    if (!$('#PhysiciansName').val()) {
      this.errorMessages.push({
        message: 'Please enter Doctor Name'
      });
    }

    if (!this.signatureForm.get('Signature3')?.value) {
      this.errorMessages.push({
        message: 'Please enter Doctor Signature'
      });
    }

    if (isMyself) {
      if (!this.signatureForm.get('Signature9')?.value) {
        this.errorMessages.push({
          message: 'Please enter Patient Signature'
        });
      }
    }

    if (onBehalf) {
      if (!$('#txt_generic_ContactNameKin').val()) {
        this.errorMessages.push({
          message: 'Please enter First Next of Kin Name'
        });
      }

      if (!this.signatureForm.get('Signature1')?.value) {
        this.errorMessages.push({
          message: 'Please enter First Next of Kin Signature'
        });
      }
    }

    if (gaurdian) {
      if (!$('#MedicalDirectorName').val()) {
        this.errorMessages.push({
          message: 'Please enter Medical Director Name'
        });
      }

      if (!this.signatureForm.get('Signature7')?.value) {
        this.errorMessages.push({
          message: 'Please enter Medical Director Signature'
        });
      }

      if (!$('#ManagerOnDutyName').val()) {
        this.errorMessages.push({
          message: 'Please enter Manager on Duty Name'
        });
      }

      if (!this.signatureForm.get('Signature8')?.value) {
        this.errorMessages.push({
          message: 'Please enter Manager on Duty Signature'
        });
      }
    }

    if (this.errorMessages.length > 0) {
      const options: NgbModalOptions = {
        windowClass: 'ngb_error_modal'
      };
      const modalRef = this.modalService.open(ErrorMessageComponent, options);
      modalRef.componentInstance.errorMessages = this.errorMessages;
      modalRef.componentInstance.showCheckbox = false;
      modalRef.componentInstance.dataChanged.subscribe((data: string) => {
        modalRef.close();
      });
      return;
    }

    const tags = this.findHtmlTagIds(this.divmpcf, this.requiredFields);

    if (tags && tags.length > 0) {
      const mergedArray = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 138,
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
        "Signature9": this.signatureForm.get('Signature9').value
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
    this.dataChangesMap = {};
    this.showContent = false;
    this.PatientTemplatedetailID = 0;
    setTimeout(() => {
      this.showContent = true;
    }, 0);
  }


  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divmpcf.nativeElement.parentNode;
        const nextSibling = this.divmpcf.nativeElement.nextSibling;

        const space = document.createElement('div');
        space.style.height = '60px';
        header.appendChild(space);

        header.appendChild(this.divmpcf.nativeElement);

        this.print(header, name);

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divmpcf.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divmpcf.nativeElement);
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

  onCheckboxSelection(event: any, groupIds?: string[]) {
    const divElement = event.currentTarget as HTMLElement;
    if (divElement.classList.contains('active')) {
      divElement.classList.remove('active');
    } else {
      divElement.classList.add('active');
    }
    groupIds?.forEach(id => {
      if (id !== event.currentTarget.id) {
        document.getElementById(id)?.classList.remove('active');
      }
    });
  }
}
