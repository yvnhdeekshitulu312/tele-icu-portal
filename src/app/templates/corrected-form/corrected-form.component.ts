import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { MY_FORMATS } from '../against-medical-advice/against-medical-advice.component';
import { DatePipe } from '@angular/common';
import moment from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
declare var $: any;
@Component({
  selector: 'app-corrected-form',
  templateUrl: './corrected-form.component.html',
  styleUrls: ['./corrected-form.component.scss'],
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
export class CorrectedFormComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divcf') divcf!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  @ViewChild('Signature3') Signature3!: SignatureComponent;
  @ViewChild('Signature4') Signature4!: SignatureComponent;

  selectedPatientData: any;
  selectedPatientLabData: any;
  tem: any;
  sameUser: boolean = true;
  PatientTemplatedetailID = 0;
  showContent = true;
  doctorDetails: any;
  url = "";
  FetchPatienClinicalTemplateDetailsNList: any;
  employeeList: any;
  testOrderItemID: any;

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private us: UtilityService, private service: MedicalAssessmentService) {
    super(renderer, el, cdr)
  }

  ngOnInit(): void {
    this.selectedPatientData = JSON.parse(sessionStorage.getItem("selectedPatientData") || '{}');
    this.selectedPatientLabData = JSON.parse(sessionStorage.getItem("selectedPatientLabData") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.testOrderItemID = this.selectedPatientLabData.TestOrderItemID;
    this.getreoperative("133");
  }

  ngAfterViewInit(): void {
    const now = new Date();
    this.timerData.push({ id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes() });
    this.bindTextboxValue('textbox_date1', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date2', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date3', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date4', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date5', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date6', moment().format('DD-MMM-YYYY'));
    this.addListeners(this.datepickers);
  }

  getreoperative(templateid: any) {
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedPatientData.IPID, PatientTemplatedetailID: this.testOrderItemID, TBL: 1 });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
            const chkLst = this.FetchPatienClinicalTemplateDetailsNList.find((x: any) => x.AssessmentOrderId == this.testOrderItemID);
            if(chkLst) {
              this.selectedTemplate(chkLst);
            }
          }
        }
      },
        () => {
        })
  }

  selectedTemplate(tem: any) {
    this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOTSaf, { ClinicalTemplateID: 0, AdmissionID: this.selectedPatientData.IPID, PatientTemplatedetailID: tem.PatientTemplatedetailID, AssesmentOrderID: this.testOrderItemID, TBL: 2 });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
            tem = response.FetchPatienClinicalTemplateDetailsNNList[0];
            let sameUser = true;
            this.tem = tem;
            if (tem.CreatedBy != this.doctorDetails[0]?.UserName) {
              sameUser = false;
              this.sameUser = false;
            }
            this.dataChangesMap = {};
            this.showElementsData(this.divcf.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
          }
        }
      },
        () => {
        })
  }

  searchEmployee(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(otPatientDetails.FetchSSEmployees, { name: event.target.value, UserId: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.employeeList = response.FetchSSEmployeesDataList;
          }
        },
          (err) => {
          })
    }
  }

  onEmployeeSelected(item: any, id?: any) {
    this.employeeList = [];
    if (id) {
      this.bindTextboxValue(id, item.EmpNo);
    }
  }

  save() {
    const tags = this.findHtmlTagIds(this.divcf);

    if (tags) {
      const mergedArray = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedPatientData.PatientID,
        "AdmissionID": this.selectedPatientData.IPID,
        "DoctorID": this.selectedPatientData.DocID,
        "SpecialiseID": this.selectedPatientData.SpecialiseID ?? '50',
        "ClinicalTemplateID": 133,
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
        "Signature10": this.signatureForm.get('Signature10').value,
        "AssessmentOrderId": this.testOrderItemID
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
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

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }
}
