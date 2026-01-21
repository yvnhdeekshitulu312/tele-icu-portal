import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as WardConfigService } from 'src/app/ward/services/config.service';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { MatDatepicker } from '@angular/material/datepicker';
declare var $: any;

@Component({
  selector: 'app-obstetrics-record',
  templateUrl: './obstetrics-record.component.html',
  styleUrls: ['./obstetrics-record.component.scss'],
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
export class ObstetricsRecordComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {

  @ViewChild('divobrc') divobrc!: ElementRef;
  @ViewChild('date1', { static: false }) date1!: ElementRef;
  @ViewChild('date2', { static: false }) date2!: ElementRef;
  @ViewChild('date3', { static: false }) date3!: ElementRef;
  @ViewChild('date4', { static: false }) date4!: ElementRef;
  @ViewChild('date5', { static: false }) date5!: ElementRef;
  @ViewChild('date6', { static: false }) date6!: ElementRef;
  @ViewChild('date7', { static: false }) date7!: ElementRef;
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
  doctorsData: any = [];
  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private config: ConfigService, private wardConfigService: WardConfigService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
  }

  ngOnInit(): void {
    this.getreoperative("103");
  }

  ngAfterViewInit() {
    if (this.date1) {
      this.date1.nativeElement.id = 'textbox_date1';
    }

    if (this.date2) {
      this.date2.nativeElement.id = 'textbox_date2';
    }

    if (this.date3) {
      this.date3.nativeElement.id = 'textbox_date3';
    }

    if (this.date4) {
      this.date4.nativeElement.id = 'textbox_date4';
    }

    if (this.date5) {
      this.date5.nativeElement.id = 'textbox_date5';
    }

    if (this.date6) {
      this.date6.nativeElement.id = 'textbox_date6';
    }

    if (this.date7) {
      this.date7.nativeElement.id = 'textbox_date7';
    }

    const now = new Date();
    this.timerData.push({ id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time4', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time5', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time6', value: now.getHours() + ':' + now.getMinutes() });

    setTimeout(() => {
      this.showdefault(this.divobrc.nativeElement);

      this.getDiagnosis();

      this.bindTextboxValue("textbox_Weight", this.selectedView.Weight);
      this.bindTextboxValue("textbox_Height", this.selectedView.Height);
    }, 1000);
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
            this.showElementsData(this.divobrc.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
    const tags = this.findHtmlTagIds(this.divobrc);

    if (tags) {
      const mergedArray = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 103,
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
            this.getreoperative("103");
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


  getDiagnosis() {
    this.config.fetchAdviceDiagnosis(this.selectedView.AdmissionID, this.HospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          var diag = "";
          response.PatientDiagnosisDataList.forEach((element: any, index: any) => {
            if (diag != "")
              diag = diag + "\n" + response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
            else
              diag = response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
          });

          this.bindTextboxValue("textarea_diagnosis", diag);
        }
      },
        (err) => {

        })
  }

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  getOneValue() {
    const ids = ['select_colour_1', 'select_effort_1', 'select_heart_beat_1', 'select_muscle_tone_1', 'select_stimuli_1'];
    let value = 0;
    ids.forEach(id => {
      value += (document.getElementById(id) as any)?.value ? Number((document.getElementById(id) as any)?.value) : 0;
    })
    return value;
  }

  getTwoValue() {
    const ids = ['select_colour_2', 'select_effort_2', 'select_heart_beat_2', 'select_muscle_tone_2', 'select_stimuli_2'];
    let value = 0;
    ids.forEach(id => {
      value += (document.getElementById(id) as any)?.value ? Number((document.getElementById(id) as any)?.value) : 0;
    })
    return value;
  }

  getThreeValue() {
    const ids = ['select_colour_3', 'select_effort_3', 'select_heart_beat_3', 'select_muscle_tone_3', 'select_stimuli_3'];
    let value = 0;
    ids.forEach(id => {
      value += (document.getElementById(id) as any)?.value ? Number((document.getElementById(id) as any)?.value) : 0;
    })
    return value;
  }

  searchDoctor(event: any) {
    if (event.target.value.length >= 3) {
      this.wardConfigService.FetchHospitalNurse("FetchBathHospitalDoctors", event.target.value.trim(), this.doctorDetails[0].UserId, 3403, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.doctorsData = response.FetchHospitalNurseDataaList;
          }
        },
          (err) => {

          })
    }
  }

  getValue(type: string, endDateId: string, endTimeId: string, startDateId: string, startTimeId: string) {
    if ((document.getElementById(endDateId) as any)?.value && (document.getElementById(startDateId) as any)?.value) {
      const endTime = this.timerData.find((item: any) => item.id === endTimeId).value;
      const endMinutes = this.timeToMinutes(endTime);
      const endDate = new Date((document.getElementById(endDateId) as any).value).setMinutes(endMinutes);

      const startTime = this.timerData.find((item: any) => item.id === startTimeId).value;
      const startMinutes = this.timeToMinutes(startTime);
      const startDate = new Date((document.getElementById(startDateId) as any).value).setMinutes(startMinutes);

      const diff = endDate - startDate;
      return this.secondsToHoursMinutes(diff)[type];
    } 
    return 0;
  }

  timeToMinutes(timeString: any) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 60) + minutes;
  }

  secondsToHoursMinutes(milliseconds: any): any {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const remainingSecondsAfterHours = totalSeconds % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    return {
      hours: hours,
      minutes: minutes
    };
  }

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divobrc.nativeElement.parentNode;
        const nextSibling = this.divobrc.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divobrc.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divobrc.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divobrc.nativeElement);
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
