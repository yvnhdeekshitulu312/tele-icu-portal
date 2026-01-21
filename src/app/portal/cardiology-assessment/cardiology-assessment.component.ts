import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { CardiologyAssessmentService } from './cardiology-assessment.service';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
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
  selector: 'app-cardiology-assessment',
  templateUrl: './cardiology-assessment.component.html',
  styleUrls: ['./cardiology-assessment.component.scss'],
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
export class CardiologyAssessmentComponent extends DynamicHtmlComponent implements OnInit {
  @Input() data: any;
  readonly = false;
  @ViewChild('divcardassessment') divcardassessment!: ElementRef;
  langData: any;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  Constitutional: boolean = false;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsView = false;
  showContent = true;
  HospitalID: any;
  physicalExamination: string = '';
  palpitationOthers: boolean = false;

  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @Output() dataChanged = new EventEmitter<boolean>();

  constructor(private con: ConfigService, renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private us: UtilityService, private service: CardiologyAssessmentService, private datepipe: DatePipe) {
    super(renderer, el, cdr);
    this.langData = this.con.getLangData();
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
  }

  ngOnInit(): void {
    this.getreoperative("16");
    if (this.data) {
      this.readonly = this.data.readonly;
      this.selectedTemplate(this.data.data);
      //this.us.disabledElement(this.divreadonly.nativeElement);
    }
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
  //   this.showElementsData(this.divcardassessment.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser);
  //   $("#savedModal").modal('hide');
  // }
  selectedTemplate(tem: any) {
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
            this.showElementsData(this.divcardassessment.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
          }
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divcardassessment);

    if (tags) {
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 16,
        "ClinicalTemplateValues": JSON.stringify(tags),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID//this.selectedView.HospitalID == undefined ? this.HospitalID : this.selectedView.HospitalID
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("16");
          }
        },
          (err) => {

          })
    }
  }

  clear() {
    this.showContent = false;
    this.PatientTemplatedetailID = 0;
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
    if(id === (this as any)[key]) {
      (this as any)[key] = "";
    }
    else {
      (this as any)[key] = id;
    }
  }

  onPalpationOthersClicked() {
    this.palpitationOthers = !this.palpitationOthers;
  }
}
