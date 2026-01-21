import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { preoperativechekclist } from 'src/app/shared/pre-op-checklist/pre-op-checklist.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
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
  selector: 'app-surgical-safety-checklist',
  templateUrl: './surgical-safety-checklist.component.html',
  styleUrls: ['./surgical-safety-checklist.component.scss'],
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
export class SurgicalSafetyChecklistComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divpsa') divpsa!: ElementRef;
  @Input() data: any;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsView = false;
  showContent = true;
  item: any;
  navigatedFromCasesheet = 'false';
  listOfAnesthetists: any = [];
  listOfItems: any = [];
  errorMessage : string = "";

  textbox_AnesthetistSurgeonSelected : boolean = false;
  textbox_NurseSelected : boolean = false;
  textbox_CirculatingNurseSelected : boolean = false;
  textbox_ScrubNurse3Selected : boolean = false;
  textbox_ScrubNurseSelected : boolean = false;
  textbox_ScrubNurse2Selected : boolean = false;
  textbox_CirculatingNurse2Selected : boolean = false;
  textbox_Surgeon2Selected : boolean = false;
  otpatinfo: any;

  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  @ViewChild('Signature3') Signature3!: SignatureComponent;
  @ViewChild('Signature4') Signature4!: SignatureComponent;
  @ViewChild('Signature5') Signature5!: SignatureComponent;
  @ViewChild('Signature6') Signature6!: SignatureComponent;
  @ViewChild('Signature7') Signature7!: SignatureComponent;
  @ViewChild('Signature8') Signature8!: SignatureComponent;
  @ViewChild('socialdate', { static: false }) socialdate!: ElementRef;
  @ViewChild('employeedate', { static: false }) employeedate!: ElementRef;
  @ViewChild('Phase1Date', { static: false }) Phase1Date!: ElementRef;
  @ViewChild('Phase2Date', { static: false }) Phase2Date!: ElementRef;
  @ViewChild('Phase3Date', { static: false }) Phase3Date!: ElementRef;
  readonly: any = false;
  tem: any;
  sameUser: boolean = true;
  requiredFields = [
    { id: 'textbox_bp1', message: 'Please enter BP', required: true },
    { id: 'textbox_hr1', message: 'Please enter Pulse Rate', required: true },
    { id: 'textbox_rr1', message: 'Please enter Respiratory', required: true },
    { id: 'textbox_o2sat1', message: 'Please enter SPO2', required: true },
    { id: 'textbox_temp1', message: 'Please enter Temperature', required: true },
  ];

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private router: Router, private datepipe: DatePipe) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    if (sessionStorage.getItem("otpatient") != 'undefined'){
      this.item = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
    }    
      
  }

  ngOnInit(): void {
    if (this.data) {
      this.readonly = this.data.readonly;
      this.selectedView = this.data.selectedView;
       if(this.data.fromEHR==true)
      {
         sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
      }
      this.fetchotdetails();
    } else {
      this.getreoperative("70");
    }
  } 

  fetchotdetails() {
    const fromdate = moment(this.selectedView.AdmitDate).format('DD-MMM-YYYY');
    const todate = moment(new Date()).format('DD-MMM-YYYY');
    var SSNN = this.selectedView.SSN;
    this.url = this.service.getData(preoperativechekclist.fetch, { FromDate: fromdate, ToDate: todate, SSN: SSNN, FacilityId: 3395, Hospitalid: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (this.data.data.SurgeryRequestID) {
            this.item = response.SurgeryRequestsDataList.find((item: any) => item.SurgeryRequestid.toString() === this.data.data.SurgeryRequestID.toString());
            this.getreoperative("70");
          }
        }
      },
        (err) => {
        });
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.showdefault(this.divpsa.nativeElement);
    }, 2000);
    if (this.socialdate) {
      this.socialdate.nativeElement.id = 'textbox_socialdate';
    }

    if (this.employeedate) {
      this.employeedate.nativeElement.id = 'textbox_employeedate';
    }

    if (this.Phase1Date) {
      this.Phase1Date.nativeElement.id = 'textbox_Phase1Date';
    }
    if (this.Phase2Date) {
      this.Phase2Date.nativeElement.id = 'textbox_Phase2Date';
    }
    if (this.Phase3Date) {
      this.Phase3Date.nativeElement.id = 'textbox_Phase3Date';
    }
    if(this.divpsa) {
      this.bindTextboxValue("textbox_Phase1Date", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Phase2Date", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      this.bindTextboxValue("textbox_Phase3Date", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
      const now = new Date();
      this.timerData.push({id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes()});
      this.timerData.push({id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes()});
      this.timerData.push({id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes()});
    }
  }

  viewWorklist() {
    $("#savedModal").modal('show');
  }
  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  selectedTemplate(tem: any) {
    
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOTSaf, { ClinicalTemplateID: 0, AdmissionID: this.item.AdmissionID, PatientTemplatedetailID: tem.PatientTemplatedetailID, AssesmentOrderID: this.item.SurgeryRequestid, TBL: 2 });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
            this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
            tem = response.FetchPatienClinicalTemplateDetailsNNList[0];
            this.tem = tem;
            let sameUser = true;
            if (tem.CreatedBy != this.doctorDetails[0]?.UserName) {
              sameUser = false;
              this.sameUser = false;
            }
            this.showElementsData(this.divpsa.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            $("#savedModal").modal('hide');
            this.checkIfEmpSelectedAndSaved();
          }
        }
      },
        (err) => {
        })
  }

  checkIfEmpSelectedAndSaved() {
    const textbox_AnesthetistSurgeon = $("#textbox_AnesthetistSurgeon").val();
    const textbox_Nurse = $("#textbox_Nurse").val();
    const textbox_CirculatingNurse = $("#textbox_CirculatingNurse").val();
    const textbox_ScrubNurse3 = $("#textbox_ScrubNurse3").val();
    const textbox_ScrubNurse = $("#textbox_ScrubNurse").val();
    const textbox_ScrubNurse2 = $("#textbox_ScrubNurse2").val();
    const textbox_CirculatingNurse2 = $("#textbox_CirculatingNurse2").val();
    const textbox_Surgeon2 = $("#textbox_Surgeon2").val();

    if(textbox_AnesthetistSurgeon != '') {
      this.textbox_AnesthetistSurgeonSelected = true;
    }
    if(textbox_Nurse != '') {
      this.textbox_NurseSelected = true;
    }
    if(textbox_CirculatingNurse != '') {
      this.textbox_CirculatingNurseSelected = true;
    }
    if(textbox_ScrubNurse3 != '') {
      this.textbox_ScrubNurse3Selected = true;
    }
    if(textbox_ScrubNurse != '') {
      this.textbox_ScrubNurseSelected = true;
    }

    if(textbox_ScrubNurse2 != '') {
      this.textbox_ScrubNurse2Selected = true;
    }
    if(textbox_CirculatingNurse2 != '') {
      this.textbox_CirculatingNurse2Selected = true;
    }
    if(textbox_CirculatingNurse != '') {
      this.textbox_CirculatingNurseSelected = true;
    }
    if(textbox_Surgeon2 != '') {
      this.textbox_Surgeon2Selected = true;
    }
  }

  getreoperative(templateid: any) {
    //this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID });
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.item.AdmissionID, PatientTemplatedetailID: 0, TBL: 1 });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
            //this.IsView = true;
            const chkLst = this.FetchPatienClinicalTemplateDetailsNList.find((x: any) => x.AssessmentOrderId == this.item.SurgeryRequestid);
            this.selectedTemplate(chkLst);
          }
        }
      },
        (err) => {
        })
  }

  save() {

    const textbox_AnesthetistSurgeon = $("#textbox_AnesthetistSurgeon").val();
    const textbox_Nurse = $("#textbox_Nurse").val();
    const textbox_CirculatingNurse = $("#textbox_CirculatingNurse").val();
    const textbox_ScrubNurse3 = $("#textbox_ScrubNurse3").val();
    const textbox_ScrubNurse = $("#textbox_ScrubNurse").val();
    const textbox_ScrubNurse2 = $("#textbox_ScrubNurse2").val();
    const textbox_CirculatingNurse2 = $("#textbox_CirculatingNurse2").val();
    const textbox_Surgeon2 = $("#textbox_Surgeon2").val();
    if(textbox_AnesthetistSurgeon != '' && !this.textbox_AnesthetistSurgeonSelected) {
      this.errorMessage = "Please select Anesthetist/ Surgeon from Phase-I" ;
      $("#errorMsg").modal("show");
      return;
    }
    if(textbox_Nurse != '' && !this.textbox_NurseSelected) {
      this.errorMessage = "Please select Nurse from Phase-I";
      $("#errorMsg").modal("show");
      return;
    }
    if(textbox_CirculatingNurse != '' && !this.textbox_CirculatingNurseSelected) {
      this.errorMessage = "Please select Circulating Nurse from Phase-II";
      $("#errorMsg").modal("show");
      return;
    }
    if(textbox_ScrubNurse3 != '' && !this.textbox_ScrubNurse3Selected) {
      this.errorMessage = "Please select Scrub Nurse from Phase-II";
      $("#errorMsg").modal("show");
      return;
    }
    if(textbox_ScrubNurse != '' && !this.textbox_ScrubNurseSelected) {
      this.errorMessage = "Please select Surgeon from Phase-II";
      $("#errorMsg").modal("show");
      return;
    }

    if(textbox_ScrubNurse2 != '' && !this.textbox_ScrubNurse2Selected) {
      this.errorMessage = "Please select Scrub Nurse from Phase-III";
      $("#errorMsg").modal("show");
      return;
    }
    if(textbox_CirculatingNurse2 != '' && !this.textbox_CirculatingNurse2Selected) {
      this.errorMessage = "Please select Circulating Nurse from Phase-III";
      $("#errorMsg").modal("show");
      return;
    }
    if(textbox_CirculatingNurse != '' && !this.textbox_CirculatingNurseSelected) {
      this.errorMessage = "Please select Circulating Nurse from Phase-I";
      $("#errorMsg").modal("show");
      return;
    }
    if(textbox_Surgeon2 != '' && !this.textbox_Surgeon2Selected) {
      this.errorMessage = "Please select Surgeon from Phase-III";
      $("#errorMsg").modal("show");
      return;
    }

    if(!this.checkActiveClass(['checkbox_Conscious','checkbox_Drowsy','checkbox_Comatose','checkbox_AnesthesiaEquipmentAndMedication'])) {
      this.errorMessage = "Please select Level Of Consciousness";
      $("#errorMsg").modal("show");
      return;
    }

    if(!this.checkActiveClass(['checkbox_PatientConfirmationIdentity','checkbox_PatientConfirmationSite','checkbox_PatientConfirmationRight','checkbox_PatientConfirmationLeft','checkbox_PatientConfirmationNA','checkbox_Procedure','checkbox_Consent'])) {
      this.errorMessage = "Please select Patient Confirmation";
      $("#errorMsg").modal("show");
      return;
    }

    // if(!this.checkActiveClass(['checkbox_PulseOximeterFunctioning','checkbox_IVAccess','checkbox_Available','checkbox_NotAvailable'])) {
    //   this.errorMessage = "Please select Patient Confirmation";
    //   $("#errorMsg").modal("show");
    //   return;
    // }

    const tags = this.findHtmlTagIds(this.divpsa, this.requiredFields);
    if (tags && tags.length > 0) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.item.PatientID,
        "AdmissionID": this.item.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.item.SurgeonSpecialiseID,
        "ClinicalTemplateID": 70,
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
        "Signature10": this.signatureForm.get('Signature10').value,
        "AssessmentOrderId" : this.item.SurgeryRequestid
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("70");
          }
        },
          (err) => {

          })
    }
  }

  checkActiveClass(groupIds?: string[]) {
    let activeClassExist = 0;
    groupIds?.forEach(id => {
        if(document.getElementById(id)?.classList.contains('active')) {
          activeClassExist = activeClassExist + 1;
        }
    });
    return activeClassExist > 0;
  }

  clear() {
    this.showContent = false;
    this.PatientTemplatedetailID = 0;
    this.signatureForm.reset();
    this.signatureList = [];
    setTimeout(() => {
      this.showContent = true;
    }, 0);
    this.tem = [];
  }

  

  navigateBackToOtDashboard() {
    $('#selectPatientYesNoModal').modal('show'); 
  }

  onAccept() {
    const otpatient = JSON.parse(sessionStorage.getItem("otpatient") || '{}');
    const SSN = otpatient.SSN;
    $('#selectPatientYesNoModal').modal('hide');
    sessionStorage.setItem('navigateToDashboard', SSN)
    this.router.navigate(['/ot/ot-dashboard']);
  }

  onDecline() {
    $('#selectPatientYesNoModal').modal('hide');
    this.router.navigate(['/ot/ot-dashboard']);
  }

  searchSurgeon(event: any) {
    var searchval = event.target.value;
    if (searchval.length > 2) {
      this.url = this.service.getData(sugsftchklst.FetchSSDomainAgainstServiceItems, {
        DomainID: 82,
        Name: searchval,
        HospitalID: this.hospitalID
      });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.DomainServiceItemsDataList.length > 0) {
            this.listOfAnesthetists = response.DomainServiceItemsDataList;
          }
        },
          (err) => {
          })
    }
  }

  searchEmployee(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(sugsftchklst.FetchSSEmployees, { name: event.target.value, UserId: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfAnesthetists = response.FetchSSEmployeesDataList;
          }
        },
          (err) => {
          })
    }
  }

  onSurgeonSelected(item: any) {
    $("#textbox_AnesthetistSurgeon").text(item.ServiceitemName);
  }

  searchScrubNurse(event: any) {
    var searchval = event.target.value;
    if (searchval.length > 2) {
      this.url = this.service.getData(sugsftchklst.FetchSSDomainAgainstServiceItems, {
        DomainID: 85,
        Name: searchval,
        HospitalID: this.hospitalID
      });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.DomainServiceItemsDataList.length > 0) {
            this.listOfItems = response.DomainServiceItemsDataList;
          }
        },
          (err) => {
          })
    }
  }
  searchNurse(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.us.get("FetchWitnessNurse?Filter=" + filter + "&HospitalID=" + this.hospitalID + "")
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfItems = response.FetchRODNursesDataList;
          }
        },
          (err) => {

          })
    }
  }

  onNurseSelected(item: any) {
    $("#textbox_Nurse").text(item.ServiceitemName);
  }
  onCirculatingNurseSelected(item: any) {
    $("#textbox_CirculatingNurse").text(item.ServiceitemName);
  }
  onScrubNurseSelected(item: any) {
    $("#textbox_ScrubNurse").text(item.ServiceitemName);
  }
  onCirculatingNurse2Selected(item: any) {
    $("#textbox_CirculatingNurse2").text(item.ServiceitemName);
  }
  onScrubNurse2Selected(item: any) {
    $("#textbox_ScrubNurse2").text(item.ServiceitemName);
  }
  onSurgeon2Selected(item: any) {
    $("#textbox_Surgeon2").text(item.ServiceitemName);
  }

  clearSmartSearchData(control: any) {

    this.listOfItems = [];
    this.listOfAnesthetists = [];
    if(control === "textbox_AnesthetistSurgeon") {
      this.textbox_AnesthetistSurgeonSelected = true;
    }
    else if(control === "textbox_Nurse") {
      this.textbox_NurseSelected = true;
    }
    else if(control === "textbox_CirculatingNurse") {
      this.textbox_CirculatingNurseSelected = true;
    }
    else if(control === "textbox_ScrubNurse3") {
      this.textbox_ScrubNurse3Selected = true;
    }
    else if(control === "textbox_ScrubNurse") {
      this.textbox_ScrubNurseSelected = true;
    }
    else if(control === "textbox_CirculatingNurse2") {
      this.textbox_CirculatingNurse2Selected = true;
    }
    else if(control === "textbox_ScrubNurse2") {
      this.textbox_ScrubNurse2Selected = true;
    }
    else if(control === "textbox_Surgeon2") {
      this.textbox_Surgeon2Selected = true;
    }
  }

  openOtQuickActions() {
    this.otpatinfo = this.item;
    $("#ot_quickaction_info").modal('show');
  }

  closeOtModal() {
    this.otpatinfo = "";
    $("#ot_quickaction_info").modal('hide');
  }

}

export const sugsftchklst = {
  FetchSSDomainAgainstServiceItems: 'FetchSSDomainAgainstServiceItems?Name=${Name}&DomainID=${DomainID}&HospitalID=${HospitalID}',
  FetchSSEmployees: "FetchSSEmployees?name=${name}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
}

