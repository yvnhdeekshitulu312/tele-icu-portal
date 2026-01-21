import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import moment from 'moment';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
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
  selector: 'app-nursing-admission-assessment-adult-surgical',
  templateUrl: './nursing-admission-assessment-adult-surgical.component.html',
  styleUrls: ['./nursing-admission-assessment-adult-surgical.component.scss'],
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
export class NursingAdmissionAssessmentAdultSurgicalComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divnaaas') divnaaas!: ElementRef;
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
  chiefcomplaints: any;
  @ViewChild('signature1') signature1!: SignatureComponent;
  @ViewChild('signature2') signature2!: SignatureComponent;
  @ViewChild('admdate', { static: false }) admdate!: ElementRef;
  @ViewChild('disdate', { static: false }) disdate!: ElementRef;
  @ViewChild('conducteddate', { static: false }) conducteddate!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;

  glasgowItems = [
    { id: 'checkbox_Spontaneous', value: 4 },
    { id: 'checkbox_ToSpeech', value: 3 },
    { id: 'checkbox_ToPain', value: 2 },
    { id: 'checkbox_ToNone', value: 1 },
    { id: 'checkbox_Oriented', value: 5 },
    { id: 'checkbox_Verbal_Confused', value: 4 },
    { id: 'checkbox_InAppropriate', value: 3 },
    { id: 'checkbox_Incomprehensible', value: 2 },
    { id: 'checkbox_Verbal_None', value: 1 },
    { id: 'checkbox_ObeysCommand', value: 6 },
    { id: 'checkbox_LocalizesPain', value: 5 },
    { id: 'checkbox_PainWithdraws', value: 4 },
    { id: 'checkbox_AbnormalFlexion', value: 3 },
    { id: 'checkbox_AbnormalEtension', value: 2 },
    { id: 'checkbox_None2', value: 1 }
  ];

  modeOfAdmissionIds: string[] = ['checkbox_Ambulatory', 'checkbox_Wheelchair', 'checkbox_Stretcher', 'checkbox_ModeOthers'];
  typeOfAdmissionIds: string[] = ['checkbox_Elective', 'checkbox_Emergency', 'checkbox_Others'];

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  }
  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  ngOnInit(): void {
    this.getreoperative("40");
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.showdefault(this.divnaaas.nativeElement);
      this.chiefcomplaints = this.defaultData[0]?.FetcTemplateDefaultDataListM[0]?.ChiefComplaint;
      this.bindTextboxValue('text_AdmittedTo', this.patientData?.Ward);
      this.bindTextboxValue('text_Room', this.patientData?.Bed);
      const dateArray = this.patientData?.AdmitDate.split(' ');
      this.bindTextboxValue('textbox_admdate', dateArray[0]);
      this.timerData.push({ id: 'textbox_generic_time1', value: dateArray[1] });
      this.timerData.push({ id: 'textbox_generic_time2', value: dateArray[1] });

      if (this.defaultData.length > 0 && this.defaultData[1].FetchPatientDataEFormsDataList.length > 0) {
        const typeofAdm = this.defaultData[1].FetchPatientDataEFormsDataList[0].TypeofAdmission;
        if (typeofAdm.indexOf('Emergency') !== -1) {
          document.getElementById("checkbox_Emergency")?.classList.add('active');
          this.typeOfAdmission = "checkbox_Emergency";
        }
        else if (typeofAdm.indexOf('Elective') !== -1) {
          document.getElementById("checkbox_Elective")?.classList.add('active');
          this.typeOfAdmission = "checkbox_Elective";
        }
      }
      this.bindTextboxValue("textbox_Name", this.doctorDetails[0].EmployeeName);
      this.bindTextboxValue("textbox_ID", this.doctorDetails[0].EmpNo);
    }, 3000);
    this.bindTextboxValue('textbox_conducteddate', moment().format('DD-MMM-YYYY'));
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
  //   this.showElementsData(this.divnaaas.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
            this.showElementsData(this.divnaaas.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
    const tags = this.findHtmlTagIds(this.divnaaas);

    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 40,
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
            this.getreoperative("40");
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

  onCheckboxSelection(event: any, ids?: string[]) {
    const divElement = event.currentTarget as HTMLElement;
    if (divElement.classList.contains('active')) {
      divElement.classList.remove('active');
    } else {
      divElement.classList.add('active');
    }
    ids?.forEach(id => {
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

  togglePanel(button: any, header: any, toggle: any) {
    const x: any = document.getElementById(toggle);
    const toggleButton = document.getElementById(button);
    const toggleHeader = document.getElementById(header);
    if (x?.style.display === "none") {
      x.style.display = "block";
      toggleButton?.classList.add("active");
      toggleHeader?.classList.remove("headertoggle_bottom_radius");
    } else {
      x.style.display = "none";
      toggleButton?.classList.remove("active");
      toggleHeader?.classList.add("headertoggle_bottom_radius");
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
        const originalParent = this.divnaaas.nativeElement.parentNode;
        const nextSibling = this.divnaaas.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divnaaas.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divnaaas.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divnaaas.nativeElement);
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

  getScore(): number {
    if(this.divnaaas) {
      const glasgowDivs = this.divnaaas.nativeElement.querySelectorAll('.Glasgow');
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

}
