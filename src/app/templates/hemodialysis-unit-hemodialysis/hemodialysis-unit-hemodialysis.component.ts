import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { ConfigService } from 'src/app/services/config.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import { MatDatepicker } from '@angular/material/datepicker';

declare var $: any;
@Component({
  selector: 'app-hemodialysis-unit-hemodialysis',
  templateUrl: './hemodialysis-unit-hemodialysis.component.html',
  styleUrls: ['./hemodialysis-unit-hemodialysis.component.scss'],
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
export class HemodialysisUnitHemodialysisComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divhuh') divhuh!: ElementRef;
  @ViewChild('signature1') signature1!: SignatureComponent;
  @ViewChild('signature2') signature2!: SignatureComponent;
  @ViewChild('signature3') signature3!: SignatureComponent;
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
  HospitalID: any;
  medicationList: any = [];
  nursesData: any = [];
  doctorsData: any = [];
  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private config: ConfigService,private configService: ConfigService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
  }

  ngOnInit(): void {
    this.getreoperative("92");
  }

  ngAfterViewInit() {
    const now = new Date();
    this.timerData.push({id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time4', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time5', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time6', value: now.getHours() + ':' + now.getMinutes()})

    this.timerData.push({id: 'textbox_generic_time7', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time8', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time9', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time10', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time11', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time12', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time13', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time14', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time15', value: now.getHours() + ':' + now.getMinutes()})
   
    setTimeout(() => {
      this.showdefault(this.divhuh.nativeElement);
      this.bindTextboxValue('text_patientDate', moment(new Date()).format('DD-MMM-YYYY'))
      this.medicationList = this.defaultData[1].FetchPatientMedicationDataEFormsDataList;
    }, 3000);
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
            this.showElementsData(this.divhuh.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
    const tags = this.findHtmlTagIds(this.divhuh);

    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 92,
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
            this.getreoperative("92");
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
  searchDoctor(event: any) {
    if (event.target.value.length >= 3) {
      this.config.FetchHospitalNurse("FetchBathHospitalDoctors", event.target.value.trim(), this.doctorDetails[0].UserId, 3403, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.doctorsData = response.FetchHospitalNurseDataaList;
          }
        },
          (err) => {

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
        const originalParent = this.divhuh.nativeElement.parentNode;
        const nextSibling = this.divhuh.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divhuh.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divhuh.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divhuh.nativeElement);
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
