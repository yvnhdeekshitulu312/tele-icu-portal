import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { ConfigService } from 'src/app/services/config.service';
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
  selector: 'app-discharge-instructions-nursery',
  templateUrl: './discharge-instructions-nursery.component.html',
  styleUrls: ['./discharge-instructions-nursery.component.scss'],
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
export class DischargeInstructionsNurseryComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divdin') divdin!: ElementRef;

  @ViewChild('SocialDate5', { static: false }) SocialDate5!: ElementRef;
  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  @ViewChild('Signature3') Signature3!: SignatureComponent;
  @ViewChild('Signature4') Signature4!: SignatureComponent;
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
  SpecializationList: any;
  SpecializationListCopy: any;
  
  SpecializationListR: any;
  SpecializationListR1: any;
  SpecializationListR2: any;
  
  listOfSpecItems: any;
  listOfSpecItemsCopy: any;
  listOfSpecItemsR: any;
  listOfSpecItemsR1: any;
  listOfSpecItemsR2: any;

  @ViewChild('nursedate', {static: false}) nursedate!: ElementRef;
  @ViewChild('docdate', {static: false}) docdate!: ElementRef;
  @ViewChild('patdate', {static: false}) patdate!: ElementRef;
  @ViewChild('SocialDate', {static: false}) SocialDate!: ElementRef;

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef,private service: MedicalAssessmentService, private us: UtilityService,
    private config: ConfigService,private datepipe: DatePipe) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
   }

  ngOnInit(): void {
    this.getreoperative("22");
    this.fetchReferalAdminMasters();
    this.FetchPatientDisSummaryData();
  }

  FetchPatientDisSummaryData() {
    this.config.FetchPatientDischargeSummary(this.selectedView.AdmissionID, this.hospitalID, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID).subscribe(response => {
      if (response.Code == 200 && response.FetchPatientDischargeSummaryDataList.length > 0) {
        const FetchPatientDischargeSummaryDataList = response.FetchPatientDischargeSummaryDataList[0];
        const medications = JSON.parse(FetchPatientDischargeSummaryDataList.DischargeMedication);
        const finalData = medications.map((item: any) => item.GenericItemName).toString();
        $('#textarea_TakeHomeMedications').text(finalData);
        $('#textarea_TakeHomeMedicationsA').text(finalData);
      }
    });
  }

  viewWorklist() {
    $("#savedModal").modal('show');
  }
  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  selectedTemplate1(tem: any) {
    this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
    let sameUser = true;
    if(tem.CreatedBy != this.doctorDetails[0]?.UserName) {
      sameUser = false;
    }
    this.showElementsData(this.divdin.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser,tem);
    $("#savedModal").modal('hide');
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
            this.showElementsData(this.divdin.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            $("#savedModal").modal('hide');
          }
        }
      },
        (err) => {
        })
  }
  fetchReferalAdminMasters() {
    this.config.fetchConsulSpecialisation(this.selectedView.HospitalID).subscribe((response) => {
      this.SpecializationList = this.SpecializationListCopy = this.SpecializationListR = this.SpecializationListR1 = this.SpecializationListR2 = response.FetchConsulSpecialisationDataList;
    });
  }
  onSpecItemSelected(item: any) {    
    $("#SpecializationA").val(item.name2l);
    $("#Specialization").val(item.name);
    this.fetchSpecializationDoctorSearch(item.id);
  }
  onSpecDocItemSelected(item: any) {   
    $("#DoctorA").val(item.EmpNo + '-' + item.Fullname2l ? item.Fullname2l : item.Fullname);
    $("#Doctor").val(item.EmpNo + '-' + item.Fullname);   
  }
  onSpecItemSelectedR(item: any) {    
    $("#SpecializationRA").val(item.name2l);
    $("#SpecializationR").val(item.name);
    this.fetchSpecializationDoctorSearchR(item.id);
  }
  onSpecDocItemSelectedR(item: any) {   
    $("#DoctorRA").val(item.EmpNo + '-' + item.Fullname2l ? item.Fullname2l : item.Fullname);
    $("#DoctorR").val(item.EmpNo + '-' + item.Fullname);   
  }
  onSpecItemSelectedR1(item: any) {
    $("#textbox_SpecializationA").val(item.name2l);
    $("#textbox_Specialization").val(item.name);
    this.fetchSpecializationDoctorSearchR1(item.id);
  }
  onSpecDocItemSelectedR1(item: any) {
    $("#textbox_DoctornameA").val(item.EmpNo + '-' + item.Fullname2l ? item.Fullname2l : item.Fullname);
    $("#textbox_Doctorname").val(item.EmpNo + '-' + item.Fullname); 
  }

  onSpecItemSelectedR2(item: any) {
    $("#SpecializationR2A").val(item.name2l);
    $("#SpecializationR2").val(item.name);
    this.fetchSpecializationDoctorSearchR2(item.id);
  }
  onSpecDocItemSelectedR2(item: any) {
    $("#DoctorR2A").val(item.EmpNo + '-' + item.Fullname2l ? item.Fullname2l : item.Fullname);
    $("#DoctorR2").val(item.EmpNo + '-' + item.Fullname); 
  }

  getSpecItemValue(item: any): string {
    return `${item.EmpNo}-${item.Fullname2l || item.Fullname}`;
  }

  fetchSpecializationDoctorSearch(SpecID:any) {
    this.config.fetchSpecialisationDoctors('%%%', SpecID, this.doctorDetails[0].EmpId, this.selectedView.HospitalID).subscribe((response: any) => {
      if (response.Code == 200) {
        this.listOfSpecItems = this.listOfSpecItemsCopy = response.FetchDoctorDataList;     
      }
    }, error => {
      console.error('Get Data API error:', error);
    });
  }

  fetchSpecializationDoctorSearchR(SpecID:any) {
    this.config.fetchSpecialisationDoctors('%%%', SpecID, this.doctorDetails[0].EmpId, this.selectedView.HospitalID).subscribe((response: any) => {
      if (response.Code == 200) {
        this.listOfSpecItemsR = response.FetchDoctorDataList;     
      }
    }, error => {
      console.error('Get Data API error:', error);
    });
  }

  fetchSpecializationDoctorSearchR1(SpecID:any) {
    this.config.fetchSpecialisationDoctors('%%%', SpecID, this.doctorDetails[0].EmpId, this.selectedView.HospitalID).subscribe((response: any) => {
      if (response.Code == 200) {
        this.listOfSpecItemsR1 = response.FetchDoctorDataList;     
      }
    }, error => {
      console.error('Get Data API error:', error);
    });
  }

  fetchSpecializationDoctorSearchR2(SpecID:any) {
    this.config.fetchSpecialisationDoctors('%%%', SpecID, this.doctorDetails[0].EmpId, this.selectedView.HospitalID).subscribe((response: any) => {
      if (response.Code == 200) {
        this.listOfSpecItemsR2 = response.FetchDoctorDataList;     
      }
    }, error => {
      console.error('Get Data API error:', error);
    });
  }

  searchSpecItem(event: any) {
    const item = event.target.value;
    this.SpecializationList = this.SpecializationListCopy;
    let arr = this.SpecializationListCopy.filter((spec: any) => spec.name.toLowerCase().indexOf(item.toLowerCase()) === 0);
    this.SpecializationList = arr.length ? arr : [{ name: 'No Item found' }];
  }

  searchDocItem(event: any) {
    const item = event.target.value;
    this.listOfSpecItems = this.listOfSpecItemsCopy;
    let arr = this.listOfSpecItemsCopy.filter((doc: any) => doc.Fullname.toLowerCase().indexOf(item.toLowerCase()) === 0);
    if (arr.length === 0) {
      arr = this.listOfSpecItemsCopy.filter((proc: any) => proc.EmpNo.toLowerCase().indexOf(item.toLowerCase()) === 0);
    }
    this.listOfSpecItems = arr.length ? arr : [{ name: 'No Item found' }];
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
            this.IsViewActual = true;
          }
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divdin);

    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 22,
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
            this.getreoperative("22");
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

  ngAfterViewInit() {

    setTimeout(() => {
      this.showdefault(this.divdin.nativeElement);
      
      if (this.defaultData && this.defaultData[0]) {
        const diagnosisString = `${this.defaultData[0].FetcTemplateDefaultDataListM[0].FinalDiagnosis},${this.defaultData[0].FetcTemplateDefaultDataListM[0].ProvisionalDiagnosis}`
        const diagnosis = diagnosisString.split(',')
          .map((procedure: any, index: number) => {
            return `${index + 1}. ${procedure}`
          }).join('\n');
        this.bindTextboxValue('textarea_diagnosis', diagnosis);
      }

      
      this.bindTextboxValue('textbox_SocialDate5', this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString())
      this.bindTextboxValue('textbox_DischargedSocialTime1', this.setCurrentTime());
      this.bindTextboxValue('textbox_DischargedDocSocialTime1', this.setCurrentTime());
      this.bindTextboxValue('textbox_PatientFSocialTime1', this.setCurrentTime());
      this.bindTextboxValue('textbox_docdate', this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue('textbox_patdate', this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString())
    }, 3000);

    if (this.nursedate) {
      this.nursedate.nativeElement.id = 'textbox_nursedate';
    }
    if(this.docdate) {
      this.docdate.nativeElement.id = 'textbox_docdate';
    }
    if(this.patdate) {
      this.patdate.nativeElement.id = 'textbox_patdate';
    }
    if(this.SocialDate5) {
      this.SocialDate5.nativeElement.id = 'textbox_SocialDate5';
    }
  

    

    const now = new Date();
    this.timerData.push({id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes()});
    this.addListeners(this.datepickers);
  }

  assignDischargeConditionDAMA(id: string, lang: string) {
    if(lang === 'E') {
      this.setValueById(id, 'رفض نصيحة الطبيب')
    }
    else {
      this.setValueById(id, 'DAMA')
    }
    
  }

  assignDischargeConditionWell(id: string, lang: string) {
    if(lang === 'E') {
      this.setValueById(id, 'جيده')
    }
    else {
      this.setValueById(id, 'Well')
    }
  }

  assignDischargeConditionDone(id: string, lang: string) {
    if(lang === 'E') {
      this.setValueById(id, 'أجريت')
    }
    else {
      this.setValueById(id, 'Done')
    }
    
  }

  assignDischargeConditionNotDone(id: string, lang: string) {
    if(lang === 'E') {
      this.setValueById(id, 'لم تعمل')
    }
    else {
      this.setValueById(id, 'Not Done')
    }
  }

  assignVaccinationStatusDone(id: string, lang: string) {
    if(lang === 'E') {
      this.setValueById(id, 'أجريت')
    }
    else {
      this.setValueById(id, 'Done')
    }
    
  }

  assignVaccinationStatusNotDone(id: string, lang: string) {
    if(lang === 'E') {
      this.setValueById(id, 'لم تعمل')
    }
    else {
      this.setValueById(id, 'Not Done')
    }
  }

  assignHearingTestDone(id: string, lang: string) {
    if(lang === 'E') {
      this.setValueById(id, 'أجريت')
    }
    else {
      this.setValueById(id, 'Done')
    }
    
  }

  assignHearingTestNotDone(id: string, lang: string) {
    if(lang === 'E') {
      this.setValueById(id, 'لم تعمل')
    }
    else {
      this.setValueById(id, 'Not Done')
    }
  }

  onFormulaChange(event: any) {
    const value = event.target.value;
    $("#textbox_TakehomeMilkFormulaName").val(value);
    $("#textbox_TakehomeMilkFormulaNameA").val(value);
  }

  onQuantityChange(event: any) {
    const value = event.target.value;
    $("#textbox_TakehomeMilkQuantity").val(value);
    $("#textbox_TakehomeMilkQuantityA").val(value);
  }

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divdin.nativeElement.parentNode;
        const nextSibling = this.divdin.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divdin.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divdin.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divdin.nativeElement);
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
