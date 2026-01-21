import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { FormBuilder } from '@angular/forms';
import { ConfigService } from 'src/app/ward/services/config.service';
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
  selector: 'app-code-blue-documentation',
  templateUrl: './code-blue-documentation.component.html',
  styleUrls: ['./code-blue-documentation.component.scss'],
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
export class CodeBlueDocumentationComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divcbd') divcbd!: ElementRef;
  // @ViewChild('contentprint') contentprint!: ElementRef;
  IsPrint = false;
  IsViewActual = false;

  divContentForPrint: any;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsView = false;
  showContent = true;
  @ViewChild('patientdate', { static: false }) patientdate!: ElementRef;
  @ViewChild('nursedate', { static: false }) nursedate!: ElementRef;
  @ViewChild('physiciandate', { static: false }) physiciandate!: ElementRef;
  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  @ViewChild('Signature3') Signature3!: SignatureComponent;
  @ViewChild('Signature4') Signature4!: SignatureComponent;
  rows: any[] = [];
  rows1: any[] = [];
  @ViewChildren(MatAutocomplete) autoWitnessNurseList!: QueryList<MatAutocomplete>;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;

  tableData: any[] = [
    { id: 1, name: '', idNo: '', time: '', specialty: '' },
    { id: 2, name: '', idNo: '', time: '', specialty: '' },
    { id: 3, name: '', idNo: '', time: '', specialty: '' },
    { id: 4, name: '', idNo: '', time: '', specialty: '' },
    { id: 5, name: '', idNo: '', time: '', specialty: '' },
    { id: 6, name: '', idNo: '', time: '', specialty: '' },
    { id: 7, name: '', idNo: '', time: '', specialty: '' },
    { id: 8, name: '', idNo: '', time: '', specialty: '' }
  ];

  timeForm: any;

  autocompleteIds: string[] = [];
  admissionIDFromShared = 0;

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private fb: FormBuilder, private configService: ConfigService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');

    for (let i = 0; i < 8; i++) {
      this.autocompleteIds.push(`autoWitnessNurse${i}`);
    }

    this.timeForm = this.fb.group({
      timeInitiated: [''],
      timeEnded: [''],
      lengthOfCode: ['']
    });
  }

  ngOnInit(): void {
    this.addRow();
    this.addRow1();
    if (!this.fromShared) {
      this.getreoperative("10");
    }
  }

  addRow() {
    this.rows.push({
      count: null
    });
  }

  addRow1() {
    this.rows1.push({
      count: null
    });
  }

  viewWorklist() {
    $("#savedModal").modal('show');
  }

  calculateLengthOfCode() {
    const timeInitiated = this.timeForm.get('timeInitiated')?.value;
    const timeEnded = this.timeForm.get('timeEnded')?.value;
    const lengthOfCodeControl = this.timeForm.get('lengthOfCode');

    if (timeInitiated && timeEnded) {
      const [startHours, startMinutes] = timeInitiated.split(':').map(Number);
      const [endHours, endMinutes] = timeEnded.split(':').map(Number);

      const startDate = new Date(0, 0, 0, startHours, startMinutes, 0);
      const endDate = new Date(0, 0, 0, endHours, endMinutes, 0);

      let diff = endDate.getTime() - startDate.getTime();

      if (diff < 0) {
        endDate.setDate(endDate.getDate() + 1);
        diff = endDate.getTime() - startDate.getTime();
      }

      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);

      const formattedHours = String(hours).padStart(2, '0');
      const formattedMinutes = String(minutes).padStart(2, '0');

      lengthOfCodeControl?.setValue(`${formattedHours}:${formattedMinutes}`);
    } else {
      lengthOfCodeControl?.setValue('');
    }
  }

  selectedTemplate(tem: any) {
    this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: 0, AdmissionID: this.selectedView.AdmissionID ? this.selectedView.AdmissionID : this.admissionIDFromShared, PatientTemplatedetailID: this.PatientTemplatedetailID, TBL: 2 });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
            tem = response.FetchPatienClinicalTemplateDetailsNNList[0];
            this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNNList;
            this.IsView = true;
            this.IsViewActual = true;
            let sameUser = true;
            // if (tem.CreatedBy != this.doctorDetails[0]?.UserName) {
            //   sameUser = false;
            // }
            this.dataChangesMap = {};

            const rowscount = JSON.parse(tem.ClinicalTemplateValues)?.filter((item: any) => item.id.includes('textbox_Rhythmnumber'));

            
            for (let i = 0; i < rowscount.length; i++) {
              this.rows.push({
                count: null
              });
            }

            this.rows.pop();

            const rowscount1 = JSON.parse(tem.ClinicalTemplateValues)?.filter((item: any) => item.id.includes('textbox_Typemnumber'));

            for (let i = 0; i < rowscount1.length; i++) {
              this.rows1.push({
                count: null
              });
            }

            this.rows1.pop();

            this.showElementsData(this.divcbd.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            const parsedValues = JSON.parse(tem.ClinicalTemplateValues);
            const mappingFields = [
              {oldId: 'textbox_monitortime', newId: 'textbox_generic_time200'},
              {oldId: 'textbox_openairwaytime', newId: 'textbox_generic_time201'},
              {oldId: 'textbox_ambubagtime', newId: 'textbox_generic_time202'},
              {oldId: 'textbox_backboardtime', newId: 'textbox_generic_time203'},
              {oldId: 'textbox_chestcomptime', newId: 'textbox_generic_time204'},
              {oldId: 'textbox_intubationtime', newId: 'textbox_generic_time205'},
              {oldId: 'textbox_ventilationtime', newId: 'textbox_generic_time206'},
              {oldId: 'textbox_ivaccesstime', newId: 'textbox_generic_time207'},
              {oldId: 'textbox_abgtime', newId: 'textbox_generic_time208'},
              {oldId: 'textbox_ecgtime', newId: 'textbox_generic_time209'},
              {oldId: 'textbox_centrallinetime', newId: 'textbox_generic_time210'},
              {oldId: 'textbox_pacemakertime', newId: 'textbox_generic_time211'},
              {oldId: 'textbox_otherstime', newId: 'textbox_generic_time212'}
            ];
            mappingFields.forEach(mapping => {
              const item = parsedValues.find((pv: any) => pv.id === mapping.oldId);
              if (item) {
                let index = this.timerData.findIndex((td: any) => td.id === mapping.newId);
                const updatedValue = item.value.split(':').map((val: string) => Number(val)).join(':');
                if (index !== -1) {
                  this.timerData[index].value = updatedValue;
                  this.timerData[index].userId = item.userId;
                }
                else {
                  this.timerData.push({ id: mapping.newId, value: updatedValue, userId: item.userId });
                }
              }
            });
            $("#savedModal").modal('hide');
          }
        }
      },
        (err) => {
        })


  }

  getreoperative(templateid: any) {
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID });
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
    const tags = this.findHtmlTagIds(this.divcbd);

    if (tags) {
      const mergedArray = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID ? this.selectedView.AdmissionID : this.admissionIDFromShared,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 10,
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
            if (!this.fromShared) {
              this.getreoperative("10");
            }
          }
        },
          (err) => {

          })
    }
  }

  clear() {
    this.rows = [];
    this.addRow();

    this.rows1 = [];
    this.addRow1();
    this.dataChangesMap = {};
    this.showContent = false;
    this.PatientTemplatedetailID = 0;
    this.signatureForm.reset();
    this.signatureList = [];
    setTimeout(() => {
      this.showContent = true;
    }, 0);
  }
  clearR1Signature() {

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showdefault(this.divcbd.nativeElement);

    }, 3000);
    if (this.patientdate) {
      this.patientdate.nativeElement.id = 'textbox_patientdate';
    }

    if (this.physiciandate) {
      this.physiciandate.nativeElement.id = 'textbox_physiciandate';
    }

    if (this.nursedate) {
      this.nursedate.nativeElement.id = 'textbox_nursedate';
    }

    const now = new Date();
    this.timerData.push({ id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time4', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time5', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time6', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time7', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time8', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time9', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time10', value: now.getHours() + ':' + now.getMinutes() })

    this.timerData.push({ id: 'textbox_generic_time200', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time201', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time202', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time203', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time204', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time205', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time206', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time207', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time208', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time209', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time210', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time211', value: now.getHours() + ':' + now.getMinutes() })
    this.timerData.push({ id: 'textbox_generic_time212', value: now.getHours() + ':' + now.getMinutes() })

    this.addListeners(this.datepickers);
  }
  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divcbd.nativeElement.parentNode;
        const nextSibling = this.divcbd.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divcbd.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divcbd.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divcbd.nativeElement);
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