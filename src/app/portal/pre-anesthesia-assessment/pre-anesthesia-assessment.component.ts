import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { PreAnesthesiaAssessmentService } from './pre-anesthesia-assessment.service';
import { DatePipe } from '@angular/common';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { QuickMedicationComponent } from 'src/app/ward/quick-medication/quick-medication.component';
import * as moment from 'moment';

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
  selector: 'app-pre-anesthesia-assessment',
  templateUrl: './pre-anesthesia-assessment.component.html',
  styleUrls: ['./pre-anesthesia-assessment.component.scss'],
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
export class PreAnesthesiaAssessmentComponent extends DynamicHtmlComponent implements OnInit {

  @Input() data: any;
  readonly = false;
  @ViewChild('divanesassessment') divanesassessment!: ElementRef;
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
  patientDiagnosis: any = [];
  patientPlannedProcs: any = [];
  templateId = "0";
  patientAnesthesiaMedications: any = [];
  currentDate = moment(new Date()).format('DD-MMM-YYYY');
  currentTime = moment(new Date()).format('HH-mm');
  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @Output() dataChanged = new EventEmitter<boolean>();
  @ViewChild('Signature1') signature1!: SignatureComponent;
  @ViewChild('Date1', { static: false }) Date1!: ElementRef;
  @ViewChild('Date2', { static: false }) Date2!: ElementRef;
  @ViewChild('PWeight', { static: false }) PWeight!: ElementRef;
  @ViewChild('PHeight', { static: false }) PHeight!: ElementRef;
  @ViewChild('qmed', { static: false }) qmed: QuickMedicationComponent | undefined;
  // @Output() saveAllPrescription = new EventEmitter<any>();

  plannedAnesthesia: string = '';
  typeOfAnesthesia: string = ''

  constructor(private con: ConfigService, renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private us: UtilityService, private service: PreAnesthesiaAssessmentService, private datepipe: DatePipe) {
    super(renderer, el, cdr);
    this.langData = this.con.getLangData();
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
  }

  ngOnInit(): void {
    this.getreoperative("17");
    this.fetchDiagnosis();
    this.fetchPatientDataEforms();
    if (this.data) {
      this.readonly = this.data.readonly;
      this.selectedTemplate(this.data.data);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showdefault(this.divanesassessment.nativeElement);

    }, 4000);
    if (this.Date1) {
      this.Date1.nativeElement.id = 'textbox_Date1';
    }
    if (this.Date2) {
      this.Date2.nativeElement.id = 'textbox_Date2';
    }
    if (this.PWeight) {
      this.PWeight.nativeElement.id = 'textbox_Weight';
    }
    if (this.PHeight) {
      this.PHeight.nativeElement.id = 'textbox_Height';
    }
    if (this.divanesassessment) {
      this.bindTextboxValue("textbox_bp", this.selectedView.BP ? this.selectedView.BP : '');
      this.bindTextboxValue("textbox_temp", this.selectedView.Temperature ? this.selectedView.Temperature : '');
      this.bindTextboxValue("textbox_pulse", this.selectedView.Pulse ? this.selectedView.Pulse : '');
      this.bindTextboxValue("textbox_rr", this.selectedView.Respiration ? this.selectedView.Respiration : '');
      this.bindTextboxValue("textbox_o2", this.selectedView.SPO2 ? this.selectedView.SPO2 : '');
      this.bindTextboxValue("textbox_conductedby", this.doctorDetails[0].UserName);
      this.bindTextboxValue("textbox_amtcode", this.doctorDetails[0].EmpNo);
      this.bindTextboxValue("textbox_datetime", this.datepipe.transform(new Date().setDate(new Date().getDate() - 10), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_physicianname", this.doctorDetails[0].EmployeeName);
      this.bindTextboxValue("textbox_Weight", this.selectedView.Weight ? this.selectedView.Weight : '');
      this.bindTextboxValue("textbox_Height", this.selectedView.Height ? this.selectedView.Height : '');
    }
  }

  viewWorklist() {
    $("#savedModal").modal('show');
  }



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
            this.showElementsData(this.divanesassessment.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            if(document.getElementById("checkbox_fit")?.classList.contains('active')) {
              this.plannedAnesthesia = "checkbox_fit";
            }
            else if(document.getElementById("checkbox_not_fit")?.classList.contains('active')) {
              this.plannedAnesthesia = "checkbox_not_fit";
            }
            //this.fetchAnesthesiaMedications(this.PatientTemplatedetailID);
            this.con.triggerFetchAnesthsiaPrescription(this.PatientTemplatedetailID);
            $("#savedModal").modal('hide');
          }
        }
      },
        (err) => {
        })
  }

  getreoperative(templateid: any) {
    //this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID,PatientTemplatedetailID:0,TBL:1 });
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: 0, TBL: 1 });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
            this.IsView = true;
            //this.selectedTemplate(this.FetchPatienClinicalTemplateDetailsNList[0]);
          }
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divanesassessment);

    if (tags) {
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 17,
        "ClinicalTemplateValues": JSON.stringify(tags),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID,//this.selectedView.HospitalID == undefined ? this.HospitalID : this.selectedView.HospitalID,
        "Signature1": this.signatureForm.get('Signature1').value
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.templateId = response.PatientVitalEndoscopyDataaList[0].PreProcedureAssessment;
            //this.saveAllPrescription.emit();
            //const qmedcmp = (this as any)['qmed'];
            // if(qmedcmp.selectedItemsList.length > 0) {
            //   qmedcmp.anesthesiaType = response.PatientVitalEndoscopyDataaList[0].PreProcedureAssessment;
            //   qmedcmp.saveAllPrescription();
            // }
            // if(this.qmedi.selectedItemsList.length > 0) {
            //   this.qmedi.anesthesiaType = response.PatientVitalEndoscopyDataaList[0].PreProcedureAssessment;
            //   this.qmedi.saveAllPrescription();
            // }
            this.con.triggerSavePrescription(this.templateId);
            this.UpdateIsFitForSurgery();
            $("#saveMsg").modal('show');
            this.getreoperative("17");
          }
        },
          (err) => {

          })
    }
  }

  UpdateIsFitForSurgery() {
    var payload = {
      "AdmissionID": this.selectedView.AdmissionID,
      "PatientID": document.getElementById("checkbox_fit")?.classList.contains('active') ? true : false,
      "AnesthesiaNote": "",
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": 3395,
      "HospitalID": this.selectedView.HospitalID == undefined ? this.HospitalID : this.selectedView.HospitalID,
    }

    this.us.post("UpdateIsFitForSurgery", payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
        }
      },
        (err) => {

        })
  }

  clear() {
    this.showContent = false;
    this.PatientTemplatedetailID = 0;
    setTimeout(() => {
      this.showContent = true;
    }, 0);
  }

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  fetchDiagnosis() {

    this.url = this.service.getData(otPatientDetails.FetchAdviceDiagnosis, {
      Admissionid: this.selectedView.AdmissionID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          this.patientDiagnosis = response.PatientDiagnosisDataList;
          // this.Date2.nativeElement.value = moment(new Date()).format('DD-MMM-YYYY');
          // $("#text_Anesthesiologist_Time").val(moment(new Date()).format('HH:mm'))
        }
      },
        (err) => {
        })
  }

  fetchPatientDataEforms() {
    this.url = this.service.getData(otPatientDetails.FetchPatientDataEForms, {
      AdmissionID: this.selectedView.AdmissionID,
      WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientPlannedProcs = response.FetchPatientProceduresDataEFormsDataList.filter((item: any) => item.ProcedureStatus === '1');
        }
      },
        (err) => {
        })
  }

  // fetchAnesthesiaMedications(tempid: any) {
  //   this.url = this.service.getData(otPatientDetails.FetchPrescriptionInfoAnesthesia, {
  //     PatientType: this.selectedView.PatientType,
  //     episodeId:this.selectedView.EpisodeID,
  //     visitId:this.selectedView.AdmissionID,
  //     PatientID:this.selectedView.PatientID,
  //     HospitalID:this.hospitalID,
  //     DoctorID:this.doctorDetails[0].EmpId,
  //     ChkDischargeCheck:'false',
  //     AnestheisiaID:tempid,
  //   });
  //   this.us.get(this.url)
  //     .subscribe((response: any) => {
  //       if (response.Code == 200) {
  //         this.patientAnesthesiaMedications = response.objPatientPrescriptionDataList;
  //         if(this.patientAnesthesiaMedications.length > 0) {
  //           this.con.triggerFetchAnesthsiaPrescription(this.patientAnesthesiaMedications);
  //         }
  //       }
  //     },
  //       (err) => {
  //       })
  // }

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

  selecPainScoretItem(btn: string, item: any) {
    const button = $('#' + btn);
    if (button.length) {
      const imgElement = button.find('.imgpain');
      const pElement = button.find('.textpain');
      const divElement = button.find('.scorepain');

      if (imgElement.length) {
        imgElement.attr('src', item.image);
      }

      if (pElement.length) {
        pElement.text(item.text);
      }

      if (divElement.length) {
        divElement.text(item.score.toString());
      }
    }
  }

}
