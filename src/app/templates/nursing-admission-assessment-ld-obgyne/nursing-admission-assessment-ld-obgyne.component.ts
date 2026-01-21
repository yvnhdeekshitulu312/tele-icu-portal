import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { AdviceComponent } from 'src/app/portal/advice/advice.component';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { ReferralComponent } from 'src/app/shared/referral/referral.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
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
  selector: 'app-nursing-admission-assessment-ld-obgyne',
  templateUrl: './nursing-admission-assessment-ld-obgyne.component.html',
  styleUrls: ['./nursing-admission-assessment-ld-obgyne.component.scss'],
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
export class NursingAdmissionAssessmentLdObgyneComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divnaalo') divnaalo!: ElementRef;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  showContent = true;
  typeOfAdmission = "";
  modeOfAdmission = "";
  accompaniedBy = "";
  InformationObtained = "";
  Temperature: string = '';
  PulseRates:string = '';
  PulseRates2:string = '';
  PulseRates1:string = '';
  chiefcomplaints: any;
  @ViewChild('signature1') signature1!: SignatureComponent;
  @ViewChild('signature2') signature2!: SignatureComponent;
  @ViewChild('admdate', { static: false }) admdate!: ElementRef;
  @ViewChild('disdate', { static: false }) disdate!: ElementRef;
  @ViewChild('conducteddate', { static: false }) conducteddate!: ElementRef;
  @ViewChild('glasgowContainer') glasgowContainer!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
  glasgowItems = [
    { id: 'checkbox_Spontaneous', value: 4 },
    { id: 'checkbox_ToSpeech', value: 3 },
    { id: 'checkbox_ToPain', value: 2 },
    { id: 'checkbox_NonePain', value: 1 },
    { id: 'checkbox_Oriented', value: 5 },
    { id: 'checkbox_Verbal_Confused', value: 4 },
    { id: 'checkbox_InappropriateSpeech', value: 3 },
    { id: 'checkbox_IncomprehensibleSounds', value: 2 },
    { id: 'checkbox_Verbal_None', value: 1 },
    { id: 'checkbox_ObeysCommand', value: 6 },
    { id: 'checkbox_LocalizesPain', value: 5 },
    { id: 'checkbox_WithdrawsFromPain', value: 4 },
    { id: 'checkbox_AbnormalFlexion', value: 3 },
    { id: 'checkbox_AbnormalExtension', value: 2 },
    { id: 'checkbox_None1R', value: 1 }
  ];

  modeOfAdmissionIds: string[] = ['checkbox_AdmissionMode_Ambulatory', 'checkbox_Wheelchair', 'checkbox_Stretcher', 'checkbox_Mode_Others'];
  typeOfAdmissionIds: string[] = ['checkbox_Elective', 'checkbox_EmergencyDepartment', 'checkbox_TypeofAdmissionOthers'];

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private renderer1: Renderer2) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  }
  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }
  ngOnInit(): void {
    this.getreoperative("41");
  }

  ngAfterViewInit() {
   
    setTimeout(() => {
      this.showdefault(this.divnaalo.nativeElement);
      this.bindTextboxValue('textbox_Admittedto', this.patientData?.Ward);
      this.bindTextboxValue('text_Room', this.patientData?.Bed);
      const dateArray = this.patientData?.AdmitDate.split(' ');
      this.bindTextboxValue('textbox_admdate', dateArray[0]);
     // this.timerData.find((item: any)=> item.id === 'textbox_generic_time1').value = dateArray[1];
      if (this.defaultData.length > 0 && this.defaultData[1].FetchPatientDataEFormsDataList.length > 0) {
        const typeofAdm = this.defaultData[1].FetchPatientDataEFormsDataList[0].TypeofAdmission;
        if (typeofAdm.indexOf('Emergency') !== -1) {
          document.getElementById("checkbox_EmergencyDepartment")?.classList.add('active');
          this.typeOfAdmission = "checkbox_EmergencyDepartment";
        }
        else if (typeofAdm.indexOf('Elective') !== -1) {
          document.getElementById("checkbox_Elective")?.classList.add('active');
          this.typeOfAdmission = "checkbox_Elective";
        }
        if (this.defaultData[1].FetchPatientDataEFormsDataList[0].LMP) {
          const lmpDate = moment(this.defaultData[1].FetchPatientDataEFormsDataList[0].LMP).format('DD-MMM-YYYY');
          this.bindTextboxValue('text_LMP', lmpDate);
        }
        if (this.defaultData[1].FetchPatientDataEFormsDataList[0].EDD) {
          const eddDate = moment(this.defaultData[1].FetchPatientDataEFormsDataList[0].EDD).format('DD-MMM-YYYY');
          this.bindTextboxValue('text_EDD', eddDate);
        }
      }
      this.chiefcomplaints = this.defaultData[0]?.FetcTemplateDefaultDataListM[0]?.ChiefComplaint;
      this.bindTextboxValue("textbox_Name", this.doctorDetails[0].EmployeeName);
      this.bindTextboxValue("textbox_ID", this.doctorDetails[0].EmpNo);
    }, 3000);

    if (this.admdate) {
      this.admdate.nativeElement.id = 'textbox_admdate';
    }

    if (this.disdate) {
      this.disdate.nativeElement.id = 'textbox_disdate';
    }
    if (this.conducteddate) {
      this.conducteddate.nativeElement.id = 'textbox_conducteddate';
    }
    const now = new Date();
    this.timerData.push({id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes()})
    this.addListeners(this.datepickers);
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
  //   this.showElementsData(this.divnaalo.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
            this.showElementsData(this.divnaalo.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
    const tags = this.findHtmlTagIds(this.divnaalo);

    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 41,
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
            this.getreoperative("41");
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

  onCheckboxClicked(id: string, key: any) {
    if (id === (this as any)[key]) {
      (this as any)[key] = "";
    }
    else {
      (this as any)[key] = id;
    }
  }

  getScore(): number {
    if (this.divnaalo) {
      const glasgowDivs = this.divnaalo.nativeElement.querySelectorAll('.Glasgow');
      let totalScore = 0;

      glasgowDivs.forEach((div: HTMLElement) => {
        if (div.classList.contains('active')) {
          const id = div.getAttribute('id');
          const item = this.glasgowItems.find(item => item.id === id);
          if (item) {
            totalScore += Number(item.value);
          }
        }
      });

      return totalScore;
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
        const originalParent = this.divnaalo.nativeElement.parentNode;
        const nextSibling = this.divnaalo.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divnaalo.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divnaalo.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divnaalo.nativeElement);
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
