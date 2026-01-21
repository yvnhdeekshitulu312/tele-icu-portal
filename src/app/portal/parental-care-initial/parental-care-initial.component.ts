import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ParentalCareInitialService } from './parental-care-initial.service';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { DatePipe } from '@angular/common';
import { ConfigService } from 'src/app/services/config.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
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
  selector: 'app-parental-care-initial',
  templateUrl: './parental-care-initial.component.html',
  styleUrls: ['./parental-care-initial.component.scss'],
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
export class ParentalCareInitialComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divparentalcare') divparentalcare!: ElementRef;
  @ViewChild('date', { static: false }) date!: ElementRef;
  @ViewChild('lmpdate', { static: false }) lmpdate!: ElementRef;
  @ViewChild('edddate', { static: false }) edddate!: ElementRef;
  @ViewChild('eddultradate', { static: false }) eddultradate!: ElementRef;
  @ViewChild('prevpregdate1', { static: false }) prevpregdate1!: ElementRef;
  @ViewChild('prevpregdate2', { static: false }) prevpregdate2!: ElementRef;
  @ViewChild('prevpregdate3', { static: false }) prevpregdate3!: ElementRef;
  @ViewChild('prevpregdate4', { static: false }) prevpregdate4!: ElementRef;
  @ViewChild('prevpregdate5', { static: false }) prevpregdate5!: ElementRef;
  @ViewChild('prevpregdate6', { static: false }) prevpregdate6!: ElementRef;
  @ViewChild('prevpregdate7', { static: false }) prevpregdate7!: ElementRef;
  @ViewChild('prevpregdate8', { static: false }) prevpregdate8!: ElementRef;
  @ViewChild('prevpregdate9', { static: false }) prevpregdate9!: ElementRef;
  @ViewChild('prevpregdate10', { static: false }) prevpregdate10!: ElementRef;

  @ViewChild('dischargedate', { static: false }) dischargedate!: ElementRef;
  @ViewChild('outcomedate1', { static: false }) outcomedate1!: ElementRef;
  @ViewChild('outcomedate2', { static: false }) outcomedate2!: ElementRef;
  @ViewChild('outcomedate3', { static: false }) outcomedate3!: ElementRef;
  @ViewChild('outcomedate4', { static: false }) outcomedate4!: ElementRef;
  @ViewChild('outcomedate5', { static: false }) outcomedate5!: ElementRef;
  @ViewChild('outcomedate6', { static: false }) outcomedate6!: ElementRef;
  @ViewChild('outcomedate7', { static: false }) outcomedate7!: ElementRef;
  @ViewChild('outcomedate8', { static: false }) outcomedate8!: ElementRef;
  @ViewChild('outcomedate9', { static: false }) outcomedate9!: ElementRef;
  @ViewChild('outcomedate10', { static: false }) outcomedate10!: ElementRef;
  @ViewChild('PWeight', { static: false }) PWeight!: ElementRef;
  @ViewChild('PHeight', { static: false }) PHeight!: ElementRef;
  @ViewChild('PBMI', { static: false }) PBMI!: ElementRef;
  @ViewChild('PBSA', { static: false }) PBSA!: ElementRef;
  //@ViewChild('toggle_Pallor', { static: false }) toggle_Pallor!: ElementRef;

  requiredFields = [
    { id: 'textbox_lmpdate', message: 'LMP Date is required', required: true }
  ];

  @Input() data: any;
  readonly = false;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  Constitutional: boolean = false;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsView = false;
  showContent = true;
  HospitalID: any;
  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @Output() dataChanged = new EventEmitter<boolean>();
  LMPEDDList: any;
  langData: any;
  PatientID = "";
  AdmissionID = "";
  Trimester = "";
  TemplateDisable: string = "p-3";
  pastObsHistory = false;
  countOfPrevPregs: number = 0;
  Pallor: string = "";
  Edema: string = "";
  Varicosevein: string = "";
  Fetalheartsound: string = "";
  Symphysisfundalheight = "";
  HeadEngagement: string = "";
  OtherFindings = "";
  Fetalpresentation = "";
  Fetallie = "";
  PhysicalExaminationstring = "";
  ChiefExaminationID: number = 0;
  lactation: number = 0;


  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private us: UtilityService, private service: ParentalCareInitialService, private datepipe: DatePipe, private config: ConfigService) {
    super(renderer, el, cdr);
    this.langData = this.config.getLangData();
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
  }

  ngOnInit(): void {
    if (this.selectedView.BillType === "Self") {
      this.setValueById("toggle_economicassessment", "Self");
    }
    else {
      this.setValueById("toggle_economicassessment", "Insured");
    }
    if (this.selectedView.MartialStatus === "3") {
      this.setValueById("toggle_maritalstatus", "Single");
    }
    else if (this.selectedView.MartialStatus === "2") {
      this.setValueById("toggle_maritalstatus", "Married");
    }
    else
      this.setValueById("toggle_maritalstatus", "Other");

  }

  ngAfterViewInit() {
    if (this.date) {
      this.date.nativeElement.id = 'textbox_date';
    }
    if (this.lmpdate) {
      this.lmpdate.nativeElement.id = 'textbox_lmpdate';
    }
    if (this.edddate) {
      this.edddate.nativeElement.id = 'textbox_edddate';
    }
    if (this.eddultradate) {
      this.eddultradate.nativeElement.id = 'textbox_eddultradate';
    }
    if (this.prevpregdate1) {
      this.prevpregdate1.nativeElement.id = 'textbox_prevpregdate1';
    }
    if (this.prevpregdate1) {
      this.prevpregdate2.nativeElement.id = 'textbox_prevpregdate2';
    }
    if (this.prevpregdate1) {
      this.prevpregdate3.nativeElement.id = 'textbox_prevpregdate3';
    }
    if (this.prevpregdate4) {
      this.prevpregdate4.nativeElement.id = 'textbox_prevpregdate4';
    }
    if (this.prevpregdate5) {
      this.prevpregdate5.nativeElement.id = 'textbox_prevpregdate5';
    }
    if (this.prevpregdate6) {
      this.prevpregdate6.nativeElement.id = 'textbox_prevpregdate6';
    }
    if (this.prevpregdate7) {
      this.prevpregdate7.nativeElement.id = 'textbox_prevpregdate7';
    }
    if (this.prevpregdate8) {
      this.prevpregdate8.nativeElement.id = 'textbox_prevpregdate8';
    }
    if (this.prevpregdate9) {
      this.prevpregdate9.nativeElement.id = 'textbox_prevpregdate9';
    }
    if (this.prevpregdate10) {
      this.prevpregdate10.nativeElement.id = 'textbox_prevpregdate10';
    }

    if (this.dischargedate) {
      this.dischargedate.nativeElement.id = 'textbox_dischargedate';
    }
    if (this.outcomedate1) {
      this.outcomedate1.nativeElement.id = 'textbox_outcomedate1';
    }
    if (this.outcomedate1) {
      this.outcomedate2.nativeElement.id = 'textbox_outcomedate2';
    }
    if (this.outcomedate1) {
      this.outcomedate3.nativeElement.id = 'textbox_outcomedate3';
    }
    if (this.outcomedate4) {
      this.outcomedate4.nativeElement.id = 'textbox_outcomedate4';
    }
    if (this.outcomedate5) {
      this.outcomedate5.nativeElement.id = 'textbox_outcomedate5';
    }
    if (this.outcomedate6) {
      this.outcomedate6.nativeElement.id = 'textbox_outcomedate6';
    }
    if (this.outcomedate7) {
      this.outcomedate7.nativeElement.id = 'textbox_outcomedate7';
    }
    if (this.outcomedate8) {
      this.outcomedate8.nativeElement.id = 'textbox_outcomedate8';
    }
    if (this.outcomedate9) {
      this.outcomedate9.nativeElement.id = 'textbox_outcomedate9';
    }
    if (this.outcomedate10) {
      this.outcomedate10.nativeElement.id = 'textbox_outcomedate10';
    }
    if (this.PWeight) {
      this.PWeight.nativeElement.id = 'textbox_Weight';
    }
    if (this.PHeight) {
      this.PHeight.nativeElement.id = 'textbox_Height';
    }
    if (this.PBMI) {
      this.PBMI.nativeElement.id = 'textbox_BMI';
    }
    if (this.PBSA) {
      this.PBSA.nativeElement.id = 'textbox_BSA';
    }
    // if (this.toggle_Pallor) {
    //   this.toggle_Pallor.nativeElement.id = 'toggle_Pallor';
    // }

    if (this.divparentalcare) {
      this.bindTextboxValue("textbox_bp", this.selectedView.BP ? this.selectedView.BP : '');
      this.bindTextboxValue("textbox_temp", this.selectedView.Temperature ? this.selectedView.Temperature : '');
      this.bindTextboxValue("textbox_pulse", this.selectedView.Pulse ? this.selectedView.Pulse : '');
      this.bindTextboxValue("textbox_rr", this.selectedView.Respiration ? this.selectedView.Respiration : '');
      this.bindTextboxValue("textbox_o2", this.selectedView.SPO2 ? this.selectedView.SPO2 : '');
      this.bindTextboxValue("textbox_conductedby", this.doctorDetails[0].UserName);
      this.bindTextboxValue("textbox_amtcode", this.doctorDetails[0].EmpNo);
      this.bindTextboxValue("textbox_datetime", this.datepipe.transform(new Date().setDate(new Date().getDate() - 10), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_physicianname", this.doctorDetails[0].EmployeeName);
      
    }

    setTimeout(() => {
      this.showdefault(this.divparentalcare.nativeElement);
      this.getDiagnosis();
      this.FetchPatientChiefComplaintAndExaminations();
      if (this.data) {
        this.readonly = this.data.readonly;
        this.selectedTemplate(this.data.data);
        //this.us.disabledElement(this.divreadonly.nativeElement);
      }
      this.PatientID = this.selectedView.PatientID;
      this.AdmissionID = this.selectedView.AdmissionID;
      if (this.selectedView.PatientType == "2") {
        this.AdmissionID = this.selectedView.IPID;
      }
      this.fetchPregenencyHistory();
      this.getreoperative("71");
    }, 3000);

    setTimeout(() => {
      this.bindTextboxValue("ta_MainComplaint", this.defaultData[1].FetchPatientDataEFormsDataList[0].ChiefComplaint);
      this.bindTextboxValue("textbox_BSA", this.defaultData[1].FetchPatientDataEFormsDataList[0].BSA);
      this.bindTextboxValue("textbox_BMI", this.defaultData[1].FetchPatientDataEFormsDataList[0].BMI);
    }, 4000);

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
  //   this.showElementsData(this.divmedicalassessment.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser);
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
            this.showElementsData(this.divparentalcare.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            if ($("#dropdown_PreviousPregnancies").val() != 0 && $("#dropdown_PreviousPregnancies").val() != undefined) {
              const prevpregcount = $("#dropdown_PreviousPregnancies").val();
              this.countOfPrevPregs = Number(prevpregcount);
              this.pastObsHistory = true;
            }

            const Cephalic = document.getElementById("btn_Cephalic")?.classList.contains('active');

            $("#savedModal").modal('hide');
          }
        }
      },
        (err) => {
        })
  }

  getreoperative(templateid: any) {
    //this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID });
    //this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: 0, TBL: 1 });
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsPreg, { ClinicalTemplateID: templateid, AdmissionID: 0, PatientID: this.selectedView.PatientID, PatientTemplatedetailID: 0, TBL: 1 });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;

            this.FetchPatienClinicalTemplateDetailsNList.forEach((element: any, index: any) => {
              if (element.ClinicalTemplateID === "71") {
                this.TemplateDisable = "p-3 disabled";
              }
              else {
                this.TemplateDisable = "p-3";
              }

            });

            this.IsView = true;
            this.selectedTemplate(this.FetchPatienClinicalTemplateDetailsNList[0]);
          }
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divparentalcare, this.requiredFields);

    if (tags && tags.length > 0) {
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 71,
        "ClinicalTemplateValues": JSON.stringify(tags),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID//this.selectedView.HospitalID == undefined ? this.HospitalID : this.selectedView.HospitalID
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("71");
            this.savePregenencyHistoryList();
          }
        },
          (err) => {

          })
    }
  }

  savePregenencyHistoryList() {

    const paroll = document.getElementById("toggle_Pallor")?.querySelector('.selected');
    const Edema = document.getElementById("toggle_Edema")?.querySelector('.selected');
    const Varicosevein = document.getElementById("toggle_VaricoseVein")?.querySelector('.selected');
    const Fetalheartsound = document.getElementById("toggle_Fetalheartsound")?.querySelector('.selected');
    var Fetalheartsoundtxt = $("#textbox_FetalheartsoundFetalheartrate").val();
    var Symphysisfundalheight = $("#textbox_Symphysisfundalheight").val();
    const HeadEngagement = document.getElementById("toggle_HeadEngagement")?.querySelector('.selected');
    var OtherFindings = $("#txt_OtherFindings").val();
    var systemExamination = $("#textbox_MedicalHistoryOthers").val();
    const Cephalic = document.getElementById("btn_Cephalic")?.classList.contains('active');
    const Breech = document.getElementById("btn_Breech")?.classList.contains('active');
    const Longitudianl = document.getElementById("btn_Longitudianl")?.classList.contains('active');
    const Transverse = document.getElementById("btn_Transverse")?.classList.contains('active');
    const Oblique = document.getElementById("btn_Oblique")?.classList.contains('active');

    const Uterinetenderness = document.getElementById("btn_Uterinetenderness")?.classList.contains('active');
    const Uterinerigidity = document.getElementById("btn_Uterinerigidity")?.classList.contains('active');
    const Uterinecontraction = document.getElementById("btn_Uterinecontraction")?.classList.contains('active');

    const Lactation = document.getElementById("toggle_Lactation")?.querySelector('.selected');

    if (Lactation?.textContent?.trim() === 'Yes')
      this.lactation = 1;
    else
      this.lactation = 0;

    if (paroll?.textContent?.trim() === 'Yes')
      this.Pallor = "Yes";
    else
      this.Pallor = "No";
    if (Edema?.textContent?.trim() === 'Yes')
      this.Edema = "Yes";
    else
      this.Edema = "No";
    if (Varicosevein?.textContent?.trim() === 'Yes')
      this.Varicosevein = "Yes";
    else
      this.Varicosevein = "No";
    if (Fetalheartsound?.textContent?.trim() === 'Yes')
      this.Fetalheartsound = "Yes";
    else
      this.Fetalheartsound = "No";
    if (HeadEngagement?.textContent?.trim() === 'Yes')
      this.HeadEngagement = "Yes";
    else
      this.HeadEngagement = "No";

    var Pallortxt = "Pallor :" + this.Pallor;
    var Edematxt = "Edema :" + this.Edema;
    var Varicoseveintxt = "Varicose vein :" + this.Varicosevein;
    var Fetalheartsounds = "Fetal heart sound :" + this.Fetalheartsound;
    var Fetalheartratetxts = "Fetal heart rate :" + Fetalheartsoundtxt;
    var Symphysisfundalheights = "Symphysis-fundal height :" + Symphysisfundalheight;
    var Uterinetendernesss = Uterinetenderness == true ? "Uterinetenderness" : "";
    var Uterinerigiditys = Uterinerigidity == true ? "Uterinerigidity" : "";
    var Uterinecontractions = Uterinecontraction == true ? "Uterinecontraction" : "";

    var HeadEngagements = "Head Engagement :" + this.HeadEngagement;
    var OtherFindingss = "Other Findings :" + OtherFindings;

    var Cephalics = Cephalic == true ? "Cephalic" : "";
    var Breechs = Breech == true ? "Breech" : "";
    var Longitudianls = Longitudianl == true ? "Longitudianl" : "";
    var Transverses = Transverse == true ? "Transverse" : "";
    var Obliques = Oblique == true ? "Oblique" : "";

    this.PhysicalExaminationstring = Pallortxt + "\n" + Edematxt + "\n" + Varicoseveintxt + "\n" + Fetalheartsounds + "\n" + Fetalheartratetxts + "\n" + Symphysisfundalheights + "\n" +Uterinetendernesss+"\n" +Uterinerigiditys+"\n" +Uterinecontractions+
                                     "\n" +HeadEngagements+"\n" +OtherFindingss+"\n" +"Fetal presentation :"+Cephalics+","+Breechs+
                                     "\n" +"Fetal lie :"+Longitudianls+","+Transverses+","+Obliques;




    let payload = {
      "PatientID": this.selectedView.PatientID,
      "EpisodeID": this.selectedView.EpisodeID,
      "AdmissionID": this.selectedView.AdmissionID,
      "MonitorID": this.selectedView.MonitorID == '' ? 0 : this.selectedView.MonitorID,
      "Pregnency": 1,
      "LMP": this.datepipe.transform($("#textbox_lmpdate").val(), "dd-MMM-yyyy")?.toString(),
      "Lactation": this.lactation,
      "Contraception": "0",
      "TriSemister": this.Trimester == "" ? "0" : this.Trimester,
      "EDD": this.datepipe.transform($("#textbox_edddate").val(), "dd-MMM-yyyy")?.toString(),
      "UserID": this.doctorDetails[0].UserId,
      "ChiefExaminationID": this.ChiefExaminationID,
      "DoctorId": this.doctorDetails[0].EmpId,
      "SpecialiseID": this.selectedView.SpecialiseID,
      "ChiefComplaint": $("#txt_generic_ChiefComplaint").val(),
      "PhysicalExamination": this.PhysicalExaminationstring,
      "Height": $("#textbox_Height").val(),
      "Weight": $("#textbox_Weight").val(),
      "Hospitalid": this.hospitalID,
      "Gravidity": $("#dropdown_Gravidity").val(),
      "Parity": $("#dropdown_Parity").val(),
      "Abortions": $("#dropdown_Abortions").val(),
    }
    let lmp = moment($("#textbox_lmpdate").val()).format('yyyy-MM-DD');
    let edd = moment($("#textbox_edddate").val()).format('yyyy-MM-DD');
    if (lmp === edd) {
      $("#showLMPEDDSameDateAlert").modal('show');
    }
    else {
      // this.config.savePregenencyHistory(payload).subscribe(response => {     
      // })
      this.config.SavePregenencyHistoryH(payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {

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
  FetchPatientChiefComplaintAndExaminations() {

    this.config.FetchPatientChiefComplaintAndExaminations(this.selectedView.AdmissionID, this.doctorDetails[0].UserId, '3403', this.hospitalID)
      .subscribe((response: any) => {
        if (response.FetchPatientChiefComplaintAndExaminationsDataaList.length > 0) {
          this.ChiefExaminationID = response.FetchPatientChiefComplaintAndExaminationsDataaList[0]?.ChiefExaminationID;
        }
      },
        (err) => {
        })
  }

  getDiagnosis() {
    this.config.fetchAdviceDiagnosis(this.selectedView.AdmissionID, this.hospitalID)
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

  toggleconceptionButtonSelection(event: Event) {
    const button = event.target as HTMLElement;
    // const isActive = button.classList.contains('active');
    const sponActive = document.getElementById("btn_Spontaneous")?.classList.contains('active');
    const ivfActive = document.getElementById("btn_IVF")?.classList.contains('active');

    if (button.id === 'btn_Spontaneous') {
      if (sponActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_IVF")?.classList.remove('active');
      }
    }
    if (button.id === 'btn_IVF') {
      if (ivfActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Spontaneous")?.classList.remove('active');
      }
    }
  }

  togglefetusesButtonSelection(event: Event) {
    const button = event.target as HTMLElement;
    // const isActive = button.classList.contains('active');
    const singleActive = document.getElementById("btn_Single")?.classList.contains('active');
    const twinActive = document.getElementById("btn_Twin")?.classList.contains('active');
    const tripletActive = document.getElementById("btn_Triplet")?.classList.contains('active');
    const fetusesffOthersActive = document.getElementById("btn_fetusesffOthers")?.classList.contains('active');

    if (button.id === 'btn_Single') {
      if (singleActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Twin")?.classList.remove('active');
        document.getElementById("btn_Triplet")?.classList.remove('active');
        document.getElementById("btn_fetusesffOthers")?.classList.remove('active');
      }
    }
    if (button.id === 'btn_Twin') {
      if (twinActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Single")?.classList.remove('active');
        document.getElementById("btn_Triplet")?.classList.remove('active');
        document.getElementById("btn_fetusesffOthers")?.classList.remove('active');
      }
    }
    if (button.id === 'btn_Triplet') {
      if (tripletActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Single")?.classList.remove('active');
        document.getElementById("btn_Twin")?.classList.remove('active');
        document.getElementById("btn_fetusesffOthers")?.classList.remove('active');
      }
    }
    if (button.id === 'btn_fetusesffOthers') {
      if (fetusesffOthersActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Single")?.classList.remove('active');
        document.getElementById("btn_Twin")?.classList.remove('active');
        document.getElementById("btn_Single")?.classList.remove('active');
      }
    }
  }

  togglesiteButtonSelection(event: Event) {
    const button = event.target as HTMLElement;
    // const isActive = button.classList.contains('active');
    const intraActive = document.getElementById("btn_Intrauterine")?.classList.contains('active');
    const ectActive = document.getElementById("btn_Ectopic")?.classList.contains('active');

    if (button.id === 'btn_Intrauterine') {
      if (intraActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Ectopic")?.classList.remove('active');
      }
    }
    if (button.id === 'btn_Ectopic') {
      if (ectActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Intrauterine")?.classList.remove('active');
      }
    }
  }

  toggleOutcomeButtonSelection(event: Event) {
    const button = event.target as HTMLElement;
    // const isActive = button.classList.contains('active');
    const delActive = document.getElementById("btn_Deliveryoffulltermbaby")?.classList.contains('active');
    const pretActive = document.getElementById("btn_Deliveryofpretermbaby")?.classList.contains('active');
    const miscActive = document.getElementById("btn_Miscarriage")?.classList.contains('active');
    const termActive = document.getElementById("btn_Termination")?.classList.contains('active');
    const pregActive = document.getElementById("btn_Excisionofectopicpregnancy")?.classList.contains('active');

    if (button.id === 'btn_Deliveryoffulltermbaby') {
      if (delActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Deliveryofpretermbaby")?.classList.remove('active');
        document.getElementById("btn_Miscarriage")?.classList.remove('active');
        document.getElementById("btn_Termination")?.classList.remove('active');
        document.getElementById("btn_Excisionofectopicpregnancy")?.classList.remove('active');
      }
    }
    if (button.id === 'btn_Deliveryofpretermbaby') {
      if (pretActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Deliveryoffulltermbaby")?.classList.remove('active');
        document.getElementById("btn_Miscarriage")?.classList.remove('active');
        document.getElementById("btn_Termination")?.classList.remove('active');
        document.getElementById("btn_Excisionofectopicpregnancy")?.classList.remove('active');
      }
    }
    if (button.id === 'btn_Miscarriage') {
      if (miscActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Deliveryoffulltermbaby")?.classList.remove('active');
        document.getElementById("btn_Deliveryofpretermbaby")?.classList.remove('active');
        document.getElementById("btn_Termination")?.classList.remove('active');
        document.getElementById("btn_Excisionofectopicpregnancy")?.classList.remove('active');
      }
    }
    if (button.id === 'btn_Termination') {
      if (termActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Deliveryoffulltermbaby")?.classList.remove('active');
        document.getElementById("btn_Deliveryofpretermbaby")?.classList.remove('active');
        document.getElementById("btn_Miscarriage")?.classList.remove('active');
        document.getElementById("btn_Excisionofectopicpregnancy")?.classList.remove('active');
      }
    }
    if (button.id === 'btn_Excisionofectopicpregnancy') {
      if (pregActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Deliveryoffulltermbaby")?.classList.remove('active');
        document.getElementById("btn_Deliveryofpretermbaby")?.classList.remove('active');
        document.getElementById("btn_Miscarriage")?.classList.remove('active');
        document.getElementById("btn_Termination")?.classList.remove('active');
      }
    }
  }

  toggleComplicationsButtonSelection(event: Event) {
    const button = event.target as HTMLElement;
    // const isActive = button.classList.contains('active');
    const postActive = document.getElementById("btn_Postpartumhemorrhage")?.classList.contains('active');
    const venousActive = document.getElementById("btn_Venousthromboembolism")?.classList.contains('active');
    const surgActive = document.getElementById("btn_Surgicalsiteinfection")?.classList.contains('active');
    const thirdActive = document.getElementById("btn_ThirddegreeperinealtearCausth")?.classList.contains('active');
    const fourthActive = document.getElementById("btn_fourthdegreeperinealtearCausth")?.classList.contains('active');

    if (button.id === 'btn_Postpartumhemorrhage') {
      if (postActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Venousthromboembolism")?.classList.remove('active');
        document.getElementById("btn_Surgicalsiteinfection")?.classList.remove('active');
        document.getElementById("btn_ThirddegreeperinealtearCausth")?.classList.remove('active');
        document.getElementById("btn_fourthdegreeperinealtearCausth")?.classList.remove('active');
      }
    }
    if (button.id === 'btn_Venousthromboembolism') {
      if (venousActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Postpartumhemorrhage")?.classList.remove('active');
        document.getElementById("btn_Surgicalsiteinfection")?.classList.remove('active');
        document.getElementById("btn_ThirddegreeperinealtearCausth")?.classList.remove('active');
        document.getElementById("btn_fourthdegreeperinealtearCausth")?.classList.remove('active');
      }
    }
    if (button.id === 'btn_Surgicalsiteinfection') {
      if (surgActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Postpartumhemorrhage")?.classList.remove('active');
        document.getElementById("btn_Venousthromboembolism")?.classList.remove('active');
        document.getElementById("btn_ThirddegreeperinealtearCausth")?.classList.remove('active');
        document.getElementById("btn_fourthdegreeperinealtearCausth")?.classList.remove('active');
      }
    }
    if (button.id === 'btn_ThirddegreeperinealtearCausth') {
      if (thirdActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Postpartumhemorrhage")?.classList.remove('active');
        document.getElementById("btn_Venousthromboembolism")?.classList.remove('active');
        document.getElementById("btn_Surgicalsiteinfection")?.classList.remove('active');
        document.getElementById("btn_fourthdegreeperinealtearCausth")?.classList.remove('active');
      }
    }
    if (button.id === 'btn_fourthdegreeperinealtearCausth') {
      if (fourthActive) {
        button.classList.remove('active');
      }
      else {
        button.classList.add('active');
        document.getElementById("btn_Postpartumhemorrhage")?.classList.remove('active');
        document.getElementById("btn_Venousthromboembolism")?.classList.remove('active');
        document.getElementById("btn_Surgicalsiteinfection")?.classList.remove('active');
        document.getElementById("btn_ThirddegreeperinealtearCausth")?.classList.remove('active');
      }
    }
  }

  onChangeLMPDate(event: any) {
    let lmp = moment(this.lmpdate.nativeElement.value).format('yyyy-MM-DD');
    let edd = moment(this.edddate.nativeElement.value).format('yyyy-MM-DD');
    let lmpS = moment(this.lmpdate.nativeElement.value).format('DD-MMM-yyyy');
    this.FetchEstimatedDeliveryDates(lmpS);
    if (lmp === edd) {
      $("#showLMPEDDSameDateAlert").modal('show');
      event.target.value = "";
    }

  }
  FetchEstimatedDeliveryDates(lmpS: any) {
    this.config.FetchEstimatedDeliveryDates(lmpS, this.hospitalID).subscribe((response: any) => {
      if (response.Code == "200") {
        if (response.FetchEstimatedDeliveryDatesDataaList.length > 0) {
          this.LMPEDDList = response.FetchEstimatedDeliveryDatesDataaList;
          this.edddate.nativeElement.value = moment(this.LMPEDDList[0].EDD).format('DD-MMM-YYYY');
          var noofweeks = Number(this.LMPEDDList[0].NoofWeeks);
          this.Trimester = this.LMPEDDList[0].Trimester;
          if (noofweeks > 43) {
            noofweeks = 43;
          }
          $("#dropdown_Gestationalage").val(noofweeks);
          $("#dropdown_plus").val(this.LMPEDDList[0].NoofDays);
        }
      }
    });
  }

  fetchPregenencyHistory() {
    this.config.fetchPregenencyHistoryADV(this.PatientID, this.AdmissionID).subscribe((response: any) => {
      if (response.Code == "200") {
        if (response.PregnancyHisDataList.length > 0) {
          this.lmpdate.nativeElement.value = moment(response.PregnancyHisDataList[0].LMP).format('DD-MMM-YYYY');
          const lmpS = moment(response.PregnancyHisDataList[0].LMP).format('DD-MMM-YYYY');
          this.FetchEstimatedDeliveryDates(lmpS);

        }
      }
    });

  }

  togglePastObsHist() {
    this.pastObsHistory = !this.pastObsHistory;
  }

  countOfPreviousPregnancies(event: any) {
    this.countOfPrevPregs = event.target.value;
  }
}
