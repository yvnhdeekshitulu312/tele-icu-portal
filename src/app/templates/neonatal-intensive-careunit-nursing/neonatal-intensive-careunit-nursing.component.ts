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
declare var $: any;

@Component({
  selector: 'app-neonatal-intensive-careunit-nursing',
  templateUrl: './neonatal-intensive-careunit-nursing.component.html',
  styleUrls: ['./neonatal-intensive-careunit-nursing.component.scss'],
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
export class NeonatalIntensiveCareunitNursingComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {

  @ViewChild('divnicun') divnicun!: ElementRef;
  @ViewChild('date1', {static: false}) date1!: ElementRef;
  @ViewChild('date2', {static: false}) date2!: ElementRef;
  @ViewChild('signature1') signature1!: SignatureComponent;
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
  today = new Date();
  HospitalID: any;
  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef,private service: MedicalAssessmentService, private us: UtilityService, private config: ConfigService, private datepipe: DatePipe) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
   }

  ngOnInit(): void {
    this.getreoperative("107");
  }

  ngAfterViewInit() {
    if (this.date1) {
      this.date1.nativeElement.id = 'textbox_date1';
    }

    if (this.date2) {
      this.date2.nativeElement.id = 'textbox_date2';
      this.date2.nativeElement.value = this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString()
    }

    const now = new Date();
    this.timerData.push({id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes()})

    setTimeout(()=>{
      this.showdefault(this.divnicun.nativeElement);
      this.bindTextboxValue("textbox_Weight", this.selectedView.Weight);
      this.bindTextboxValue("textbox_Height", this.selectedView.Height);
      this.bindTextboxValue("textbox_ID", this.doctorDetails[0].UserName);
      this.bindTextboxValue("textbox_Name", this.doctorDetails[0].EmployeeName);
      this.bindTextboxValue("textbox_Age", this.selectedView.AgeValue);
      
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
            this.showElementsData(this.divnicun.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
    const tags = this.findHtmlTagIds(this.divnicun);

    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 107,
        "ClinicalTemplateValues": JSON.stringify(mergedArray),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID,
        "Signature1": this.signatureForm.get('Signature1').value
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("107");
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
    setTimeout(()=>{
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

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divnicun.nativeElement.parentNode;
        const nextSibling = this.divnicun.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divnicun.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divnicun.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divnicun.nativeElement);
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
