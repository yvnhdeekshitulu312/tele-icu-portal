import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
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
  selector: 'app-multidisciplanary-patient-family-education-form',
  templateUrl: './multidisciplanary-patient-family-education-form.component.html',
  styleUrls: ['./multidisciplanary-patient-family-education-form.component.scss'],
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
export class MultidisciplanaryPatientFamilyEducationFormComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divmpfef') divmpfef!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  showContent = true;
  langOthers: boolean = false;
  learnerOthers: boolean = false;
  learnerBarriersOthers: boolean = false;

  @ViewChild('assessmentdate', {static: false}) assessmentdate!: ElementRef;
  @ViewChild('assessment1date', {static: false}) assessment1date!: ElementRef;
  @ViewChild('assessment2date', {static: false}) assessment2date!: ElementRef;
  @ViewChild('assessment3date', {static: false}) assessment3date!: ElementRef;
  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef,private service: MedicalAssessmentService, private us: UtilityService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
   }

  ngOnInit(): void {
    this.getreoperative("31");
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
  //   this.showElementsData(this.divmpfef.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser);
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
            this.showElementsData(this.divmpfef.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
    const tags = this.findHtmlTagIds(this.divmpfef);

    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 31,
        // "ClinicalTemplateValues": JSON.stringify(tags),
        "ClinicalTemplateValues": JSON.stringify(mergedArray),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID
      }
  
      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("31");
          }
        },
          (err) => {
  
          })
    }
  }

  clear() {
    this.showContent = false;
    this.PatientTemplatedetailID = 0;
    this.dataChangesMap = {};
    setTimeout(()=>{
      this.showContent = true;
    }, 0);
  }

  ngAfterViewInit() {
    this.addListeners(this.datepickers);
    if (this.assessmentdate) {
      this.assessmentdate.nativeElement.id = 'textbox_assessmentdate';
    }
    if (this.assessment1date) {
      this.assessment1date.nativeElement.id = 'textbox_assessment1date';
    }
    if (this.assessment2date) {
      this.assessment2date.nativeElement.id = 'textbox_assessment2date';
    }
    if (this.assessment3date) {
      this.assessment3date.nativeElement.id = 'textbox_assessment3date';
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

  }

  selectAllPatientPhyLearningNeeds(event: any, groupIds?: string[]) {
    const divElement = event.currentTarget as HTMLElement;
    if (divElement.classList.contains('active')) {
      divElement.classList.remove('active');
      groupIds?.forEach(id => {
        document.getElementById(id)?.classList.remove('active');
      });
    } else {
      divElement.classList.add('active');
      groupIds?.forEach(id => {
        document.getElementById(id)?.classList.add('active');
        this.addToDataChangesMap(id);
      });
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
        const originalParent = this.divmpfef.nativeElement.parentNode;
        const nextSibling = this.divmpfef.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divmpfef.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divmpfef.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divmpfef.nativeElement);
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
