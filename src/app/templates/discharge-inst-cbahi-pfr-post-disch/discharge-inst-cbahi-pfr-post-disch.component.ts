import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { ConfigService } from 'src/app/ward/services/config.service';
import { MatDatepicker } from '@angular/material/datepicker';
import moment from 'moment';
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
  selector: 'app-discharge-inst-cbahi-pfr-post-disch',
  templateUrl: './discharge-inst-cbahi-pfr-post-disch.component.html',
  styleUrls: ['./discharge-inst-cbahi-pfr-post-disch.component.scss'],
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
export class DischargeInstCbahiPfrPostDischComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divdinst') divdinst!: ElementRef;
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

  typeOfDiet = '';

  mode: string = '';
  medicalReport: string = '';
  sickLeave: string = '';
  valuables: string = '';
  socialWorker: string = '';
  respiratory: string = '';
  physiotherapy: any = {
    a: '',
    b: '',
    c: '',
    d: '',
    e: '',
    f: '',
    g: ''
  };
  supportServiceNeeds: string = '';
  healthSupport: string = '';
  specialCareNeeds: string = '';
  specialCareTypes:any = {
    a: '',
    b: '',
    c: '',
    d: '',
    e: '',
    f: ''
  };
  funtionalNeeds: string = '';
  functionalNeedTypes: any = {
    a: '',
    b: '',
    c: '',
    d: '',
    e: '',
    f: '',
    g: '',
    h: ''
  };

  nursesData: any = [];
  doctorsData: any = [];
  doctorId: any;
  nurseId: any;

  @ViewChild('followupdate', { static: false }) followupdate!: ElementRef;
  @ViewChild('followupdatear', { static: false }) followupdatear!: ElementRef;
  @ViewChild('notedate', { static: false }) notedate!: ElementRef;
  @ViewChild('notedate1', { static: false }) notedate1!: ElementRef;
  @ViewChild('notedate2', { static: false }) notedate2!: ElementRef;
  @ViewChild('notedate3', { static: false }) notedate3!: ElementRef;
  @ViewChild('notedate4', { static: false }) notedate4!: ElementRef;
  @ViewChild('notedate5', { static: false }) notedate5!: ElementRef;
  @ViewChild('dietdate', { static: false }) dietdate!: ElementRef;
  @ViewChild('socialdate', { static: false }) socialdate!: ElementRef;
  @ViewChild('physiodate', { static: false }) physiodate!: ElementRef;
  @ViewChild('physiciandate', { static: false }) physiciandate!: ElementRef;
  @ViewChild('finaldate', { static: false }) finaldate!: ElementRef;
  @ViewChild('doctordate', { static: false }) doctordate!: ElementRef;
  @ViewChild('doctordate1', { static: false }) doctordate1!: ElementRef;
  @ViewChild('doctordate2', { static: false }) doctordate2!: ElementRef;
  @ViewChild('nursedate', { static: false }) nursedate!: ElementRef;
  @ViewChild('patientdate', { static: false }) patientdate!: ElementRef;

  @ViewChild('signature1') signature1!: SignatureComponent;
  @ViewChild('signature2') signature2!: SignatureComponent;
  @ViewChild('signature3') signature3!: SignatureComponent;
  @ViewChild('signature4') signature4!: SignatureComponent;
  @ViewChild('signature5') signature5!: SignatureComponent;
  @ViewChild('signature6') signature6!: SignatureComponent;
  @ViewChild('signature7') signature7!: SignatureComponent;
  @ViewChild('signature8') signature8!: SignatureComponent;
  @ViewChild('signature9') signature9!: SignatureComponent;


  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private configService: ConfigService, private datepipe: DatePipe) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  }

  ngOnInit(): void {
    this.getreoperative("36");
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
            this.showElementsData(this.divdinst.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
    const tags = this.findHtmlTagIds(this.divdinst);

    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 36,
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
            this.getreoperative("36");
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

  ngAfterViewInit() {
    if (this.followupdate) {
      this.followupdate.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.followupdatear) {
      this.followupdatear.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.notedate) {
      this.notedate.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.notedate1) {
      this.notedate1.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.notedate2) {
      this.notedate2.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.notedate3) {
      this.notedate3.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.notedate4) {
      this.notedate4.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.notedate5) {
      this.notedate5.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }

    if (this.doctordate) {
      this.doctordate.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.doctordate1) {
      this.doctordate1.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }
    if (this.doctordate2) {
      this.doctordate2.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
    }

    if(this.divdinst) {
      this.bindTextboxValue("textbox_followupdate", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
    }

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
    this.addListeners(this.datepickers);
  }

  typeOfDietCheckboxSelection(value: any) {
    if (this.typeOfDiet === value) {
      this.typeOfDiet = '';
    } else {
      this.typeOfDiet = value;
    }
  }

  onCheckboxClicked(id: string, key: any, subKey?: any) {
    if (subKey) {
      if (id === (this as any)[key][subKey]) {
        (this as any)[key][subKey] = "";
      }
      else {
        (this as any)[key][subKey] = id;
      }
    } else {
      if (id === (this as any)[key]) {
        (this as any)[key] = "";
      }
      else {
        (this as any)[key] = id;
      }
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

  onDoctorSelection(item: any) {
    this.doctorsData = [];
    this.doctorId = item.EmpNo;
  }

  onNurseSelection(item: any) {
    this.nursesData = [];
    this.nurseId = item.EmpNo;
  }

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divdinst.nativeElement.parentNode;
        const nextSibling = this.divdinst.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divdinst.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divdinst.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divdinst.nativeElement);
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

  toggletypeOfDietCheckboxSelection(event: any, groupIds?: string[]) {
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

  toggletypeOfDietCheckbox1Selection(event: any, groupIds?: string[]) {
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
  toggletypeOfDietCheckbox2Selection(event: any, groupIds?: string[]) {
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
