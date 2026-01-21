import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
import moment from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { values } from 'lodash';
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
  selector: 'app-maternal-history',
  templateUrl: './maternal-history.component.html',
  styleUrls: ['./maternal-history.component.scss'],
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
export class MaternalHistoryComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divmths') divmths!: ElementRef;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  showContent = true;
  @ViewChild('deliveryDate', {static: false}) deliveryDate!: ElementRef;
  @ViewChild('delivery1Date', {static: false}) delivery1Date!: ElementRef;
  @ViewChild('delivery2Date', {static: false}) delivery2Date!: ElementRef;
  @ViewChild('delivery3Date', {static: false}) delivery3Date!: ElementRef;
  @ViewChild('labourdate', {static: false}) labourdate!: ElementRef;
  @ViewChild('doctordate', {static: false}) doctordate!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
  deliveries = [
    { date: '' as string | Date, gestation: '', deliveryType: '', gender: 'Male', weight: '', remarks: '' }
  ];

  // Array to store date picker references
  pickerArray: MatDatepicker<any>[] = [];

  @ViewChildren('picker') datePickers!: QueryList<MatDatepicker<any>>;

  addRow() {
    this.deliveries.push({ date: '', gestation: '', deliveryType: '', gender: 'Male', weight: '', remarks: '' });
    setTimeout(() => {
      this.pickerArray = this.datePickers.toArray();
    });
  }

  toggleLocalSelection(event: Event, delivery: any) {
    const button = event.target as HTMLButtonElement;
    delivery.gender = button.textContent?.trim() || 'Male';
  }
  
  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef,private service: MedicalAssessmentService, private us: UtilityService, private datePipe: DatePipe) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
   }

  ngOnInit(): void {
    this.getreoperative("63");
  }

  ngAfterViewInit() {
    this.pickerArray = this.datePickers.toArray();

    setTimeout(()=>{
      this.showdefault(this.divmths.nativeElement);
      if (this.defaultData[1].FetchPatientDataEFormsDataList[0].LMP) {
        const lmpDate = moment(this.defaultData[1].FetchPatientDataEFormsDataList[0].LMP).format('DD-MMM-YYYY');
        this.bindTextboxValue('text_LMP', lmpDate);
      }
      if (this.defaultData[1].FetchPatientDataEFormsDataList[0].EDD) {
        const eddDate = moment(this.defaultData[1].FetchPatientDataEFormsDataList[0].EDD).format('DD-MMM-YYYY');
        this.bindTextboxValue('text_EDD', eddDate);
      }
    }, 4000);

    if (this.deliveryDate) {
      this.deliveryDate.nativeElement.id = 'textbox_deliveryDate';
    }
    if(this.delivery1Date) {
      this.delivery1Date.nativeElement.id = 'textbox_delivery1Date';
    }
    if(this.delivery2Date) {
      this.delivery2Date.nativeElement.id = 'textbox_delivery2Date';
    }
    if(this.delivery3Date) {
      this.delivery3Date.nativeElement.id = 'textbox_delivery3Date';
    }
    if(this.labourdate) {
      this.labourdate.nativeElement.id = 'textbox_labourdate';
    }
    if(this.doctordate) {
      this.doctordate.nativeElement.id = 'textbox_doctordate';
    }

    const now = new Date();
    this.timerData.push({id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes()});
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
            this.showElementsData(this.divmths.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);

            const del = JSON.parse(tem.ClinicalTemplateValues)?.filter((item: any) => item.id.includes('list_deliveries'));

            if(del?.length > 0) {
              this.deliveries = del[0].values;

              this.deliveries.forEach(((delivery, index) => {
                delivery.date = new Date(delivery.date) || '';
                setTimeout(() => {
                  this.pickerArray = this.datePickers.toArray();
                });
              }));
            }

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
    const tags = this.findHtmlTagIds(this.divmths);

    if (tags) {
      
      const dd = this.deliveries.map(delivery => ({ ...delivery }));
      const mergedArray  = tags.concat(this.timerData);
      
      dd.forEach(((delivery, index) => {
        delivery.date = this.datePipe.transform(delivery.date, 'dd-MMM-yyyy') || '';
      }));

      tags.push({id: 'list_deliveries', values: dd});

      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 63,
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
            this.getreoperative("63");
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
    this.deliveries = [];
    this.pickerArray = [];

    setTimeout(()=>{
      this.showContent = true;
      this.pickerArray = this.datePickers.toArray();
      this.deliveries.push({ date: '', gestation: '', deliveryType: '', gender: 'Male', weight: '', remarks: '' });
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
        const originalParent = this.divmths.nativeElement.parentNode;
        const nextSibling = this.divmths.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divmths.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divmths.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divmths.nativeElement);
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
