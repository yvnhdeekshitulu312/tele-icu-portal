import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { ConfigService } from 'src/app/services/config.service';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ConfigService as WardConfigService } from 'src/app/ward/services/config.service';
declare var $: any;
@Component({
  selector: 'app-cathlab-surgical-safety-checklist',
  templateUrl: './cathlab-surgical-safety-checklist.component.html',
  styleUrls: ['./cathlab-surgical-safety-checklist.component.scss'],
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
export class CathlabSurgicalSafetyChecklistComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divcssc') divardo!: ElementRef;
  @ViewChild('date1', { static: false }) date1!: ElementRef;
  @ViewChild('date2', { static: false }) date2!: ElementRef;
  @ViewChild('date3', { static: false }) date3!: ElementRef;
  @ViewChild('date4', { static: false }) date4!: ElementRef;
  @ViewChild('date5', { static: false }) date5!: ElementRef;
  @ViewChild('date6', { static: false }) date6!: ElementRef;
  @ViewChild('date7', { static: false }) date7!: ElementRef;
  @ViewChild('date8', { static: false }) date8!: ElementRef;
  @ViewChild('date9', { static: false }) date9!: ElementRef;
  @ViewChild('date10', { static: false }) date10!: ElementRef;


  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  @ViewChild('Signature3') Signature3!: SignatureComponent;
  @ViewChild('Signature4') Signature4!: SignatureComponent;
  @ViewChild('Signature5') Signature5!: SignatureComponent;
  @ViewChild('Signature6') Signature6!: SignatureComponent;
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
  nursesData: any = [];
  doctorsData: any = [];
  selectedPainScoreId = "0";
  selectedPainScoreName: any;
  painScore: any;
  painScoreSelected: boolean = false;

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private datepipe: DatePipe, private us: UtilityService, private config: ConfigService,  private wardConfigService: WardConfigService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
  }

  ngOnInit(): void {
    this.getreoperative("90");
    this.fetchPainScoreMaster();
  }

  ngAfterViewInit() {
    if (this.date1) {
      this.date1.nativeElement.id = 'textbox_date1';
      this.date1.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
    }

    if (this.date2) {
      this.date2.nativeElement.id = 'textbox_date2';
      this.date2.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
    }

    if (this.date3) {
      this.date3.nativeElement.id = 'textbox_date3';
      this.date3.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
    }

    if (this.date4) {
      this.date4.nativeElement.id = 'textbox_date4';
      this.date4.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
    }

    if (this.date5) {
      this.date5.nativeElement.id = 'textbox_date5';
      this.date5.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
    }

    if (this.date6) {
      this.date6.nativeElement.id = 'textbox_date6';
      this.date6.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
    }
    if (this.date7) {
      this.date7.nativeElement.id = 'textbox_date7';
      this.date7.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
    }

    if (this.date8) {
      this.date8.nativeElement.id = 'textbox_date8';
      this.date8.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
    }
    if (this.date9) {
      this.date9.nativeElement.id = 'textbox_date9';
      this.date9.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
    }
    if (this.date10) {
      this.date10.nativeElement.id = 'textbox_date10';
      this.date10.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
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

    

    setTimeout(() => {
      this.showdefault(this.divardo.nativeElement);

      this.getDiagnosis();

      this.bindTextboxValue("textbox_Weight", this.selectedView.Weight);
      this.bindTextboxValue("textbox_Height", this.selectedView.Height);
    }, 4000);

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
            this.showElementsData(this.divardo.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            this.selectedPainScoreId = $("#text_PainScore").val();
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
    const tags = this.findHtmlTagIds(this.divardo);

    if (tags) {
      const mergedArray = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 90,
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
            this.getreoperative("90");
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
      this.wardConfigService.FetchHospitalNurse("FetchBathHospitalDoctors", event.target.value.trim(), this.doctorDetails[0].UserId, 3403, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.doctorsData = response.FetchHospitalNurseDataaList;
          }
        },
          () => {

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

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divardo.nativeElement.parentNode;
        const nextSibling = this.divardo.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divardo.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divardo.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divardo.nativeElement);
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

  fetchPainScoreMaster() {
    this.config.fetchPainScoreMasters().subscribe(response => {
      this.painScore = response.SmartDataList;
      this.painScore.forEach((element: any, index: any) => {
        if (element.id == 1) { element.imgsrc = "assets/images/image1.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 2) { element.imgsrc = "assets/images/image2.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 3) { element.imgsrc = "assets/images/image3.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 4) { element.imgsrc = "assets/images/image4.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 5) { element.imgsrc = "assets/images/image5.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
        else if (element.id == 6) { element.imgsrc = "assets/images/image6.png"; element.Class = "pain_reaction position-relative cursor-pointer text-center  justify-content-between"; }
      });
    })
  }

  getPainScoreName(psid: string) {
    if (psid === null || psid === '0') {
      return 'Select' + '-' + '';
    }
    const ps = this.painScore?.find((x: any) => x.id == psid);
    return ps?.name.split('-')[0] + '-' + ps?.code
  }

  setPainScorevalue(ps: any) {
    this.selectedPainScoreId = ps.id;
    this.painScoreSelected = true;
    $("#text_PainScore").val(ps.id);
  }

}
