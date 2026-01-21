import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { ConfigService } from 'src/app/ward/services/config.service';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
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
  selector: 'app-patient-outpass-form',
  templateUrl: './patient-outpass-form.component.html',
  styleUrls: ['./patient-outpass-form.component.scss'],
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
export class PatientOutpassFormComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divpof') divpof!: ElementRef;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  showContent = true;
  nursesData: any = [];
  doctorsData: any = [];
  medicationList: any = [];

  @ViewChild('Date1', {static: false}) Date1!: ElementRef;
  @ViewChild('Date2', {static: false}) Date2!: ElementRef;
  @ViewChild('Date3', {static: false}) Date3!: ElementRef;
  @ViewChild('Date4', {static: false}) Date4!: ElementRef;
  @ViewChild('Date5', {static: false}) Date5!: ElementRef;
  @ViewChild('Date6', {static: false}) Date6!: ElementRef;
  @ViewChild('Date7', {static: false}) Date7!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private configService: ConfigService, private datepipe: DatePipe) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  }

  ngOnInit(): void {
    this.getreoperative("20");
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.showdefault(this.divpof.nativeElement);
      this.bindTextboxValue('textbox_ward', this.patientData?.Ward);
      this.bindTextboxValue('textbox_roomno', this.patientData?.Bed);
      this.medicationList = this.defaultData[1].FetchPatientMedicationDataEFormsDataList;

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
        this.Date4.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
      }
      if (this.Date5) {
        this.Date5.nativeElement.id = 'textbox_Date5';
        this.Date5.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
      }
      if (this.Date6) {
        this.Date6.nativeElement.id = 'textbox_Date6';
        this.Date6.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
      }
      if (this.Date7) {
        this.Date7.nativeElement.id = 'textbox_Date7';
        this.Date7.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
      }
      const now = new Date();
      this.timerData.push({id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes()});
      this.timerData.push({id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes()});
      this.timerData.push({id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes()});
      this.timerData.push({id: 'textbox_generic_time4', value: now.getHours() + ':' + now.getMinutes()});
      this.timerData.push({id: 'textbox_generic_time5', value: now.getHours() + ':' + now.getMinutes()});
      this.timerData.push({id: 'textbox_generic_time6', value: now.getHours() + ':' + now.getMinutes()});
    }, 4000);
    this.addListeners(this.datepickers);
  }

  viewWorklist() {
    $("#savedModal").modal('show');
  }
  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  // selectedTemplate(tem: any) {
  //   this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
  //   let sameUser = true;
  //   if(tem.CreatedBy != this.doctorDetails[0]?.UserName) {
  //     sameUser = false;
  //   }
  //   this.showElementsData(this.divpof.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser,tem);
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
            this.showElementsData(this.divpof.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
            this.IsViewActual=true;
          }
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divpof);

    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 20,
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
            this.getreoperative("20");
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
          (err) => {

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
  onDurationChange(event: any, key: any) {
    const selector = this.timerData.find((ts: any) => ts.id === key);
    const dur = event.target.value;
    var currentHour = new Date(); //currentHour = Number(currentHour) + Number(dur);
    currentHour.setHours(currentHour.getHours() + Number(dur));
    var currentMin = new Date().getMinutes();
    if (selector) {
      selector.value = currentHour.getHours().toString() + ':' + currentMin;
    }
    else {
      let data: any = {
        'id': key, 
        'value': currentHour + ':' + currentMin
      };
      this.timerData.push(data);
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
        const originalParent = this.divpof.nativeElement.parentNode;
        const nextSibling = this.divpof.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divpof.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divpof.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divpof.nativeElement);
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
