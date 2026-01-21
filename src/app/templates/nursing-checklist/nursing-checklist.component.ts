import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
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
  selector: 'app-nursing-checklist',
  templateUrl: './nursing-checklist.component.html',
  styleUrls: ['./nursing-checklist.component.scss'],
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
export class NursingChecklistComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divnuct') divnuct!: ElementRef;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  showContent = true;
  employeeList: any = [];
  endoNurseList: any;
  ctasScore1Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore2Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore3Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore4Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  ctasScore5Class: string = "cursor-pointer circle d-flex align-items-center justify-content-center";
  patientType = "1"
  chiefcomplaints: any;
  ctasScore = "0";
  modeOfArrival = "";
  Consciousness = "";
  @ViewChild('DisDate', {static: false}) DisDate!: ElementRef;
  @ViewChild('NurseDate', {static: false}) NurseDate!: ElementRef;
  @ViewChild('TriageDate', {static: false}) TriageDate!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef,private service: MedicalAssessmentService, private us: UtilityService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
   }

   clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  ngOnInit(): void {
    this.getreoperative("110");
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
            this.showElementsData(this.divnuct.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
            this.IsViewActual;
          }
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divnuct);

    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 110,
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
            this.getreoperative("110");
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
    if (this.DisDate) {
      this.DisDate.nativeElement.id = 'textbox_DisDate';
    }
    if (this.TriageDate) {
      this.TriageDate.nativeElement.id = 'textbox_TriageDate';
    }
    if (this.NurseDate) {
      this.NurseDate.nativeElement.id = 'textbox_NurseDate';
    }
    setTimeout(()=>{
      this.showdefault(this.divnuct.nativeElement);

      if (this.divnuct) {
        this.bindTextboxValue("text_Weight1", this.selectedView.Weight);
        this.bindTextboxValue("text_Height1", this.selectedView.Height);
        if(this.defaultData.length > 0 && this.defaultData[1]?.FetchPatientDataEFormsDataList.length > 0) {
          this.chiefcomplaints = this.defaultData[0]?.FetcTemplateDefaultDataListM[0]?.ChiefComplaint;
          this.patientType = this.defaultData[1].FetchPatientDataEFormsDataList[0].BillType;
          const assignNurseTime = this.defaultData[1].FetchPatientDataEFormsDataList[0].NurseAssignStartDate;
          this.bindTextboxValue('textbox_TimeTakenbyNurse', assignNurseTime?.split(' ')[1]);
          const assignDoctorTime = this.defaultData[1].FetchPatientDataEFormsDataList[0]?.ClinicalConditionEnteredDate;
          this.bindTextboxValue('textbox_TimeSeenbyDoctor', assignDoctorTime?.split(' ')[1]);
          const admittedTime = this.defaultData[1].FetchPatientDataEFormsDataList[0].AdmitDate;
          this.bindTextboxValue('textbox_TimeSeenbyDoctor', admittedTime?.split(' ')[1]);
          const dischargeTime = this.defaultData[1].FetchPatientDataEFormsDataList[0].DischargeDate;
          if(dischargeTime != null)
            this.bindTextboxValue('textbox_TimeSeenbyDoctor', dischargeTime?.split(' ')[1]);
          const admRoom = this.defaultData[1]?.FetchPatientDataEFormsDataList[0].BedName;
          this.bindTextboxValue("text_Height1", admRoom);
          $("#modeOfArrival").val(this.defaultData[1]?.FetchPatientDataEFormsDataList[0]?.VTModeOfArrivalID);
          this.modeOfArrival = this.defaultData[1]?.FetchPatientDataEFormsDataList[0]?.VTModeOfArrival;
          this.ctasScore = this.defaultData[1]?.FetchPatientDataEFormsDataList[0]?.NurseCTASScore;
          this.Consciousness = this.defaultData[1]?.FetchPatientDataEFormsDataList[0]?.Consciousness;
          // if (score == "1") {
          //   this.ctasScore1Class = "cursor-pointer circle d-flex align-items-center justify-content-center active red";
          //   this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class = this.ctasScore5Class =
          //     "cursor-pointer circle d-flex align-items-center justify-content-center";
          // }
          // else if (score == "2") {
          //   this.ctasScore2Class = "cursor-pointer circle d-flex align-items-center justify-content-center active red";
          //   this.ctasScore1Class = this.ctasScore3Class = this.ctasScore4Class = this.ctasScore5Class =
          //     "cursor-pointer circle d-flex align-items-center justify-content-center";
          // }
          // else if (score == "3") {
          //   this.ctasScore3Class = "cursor-pointer circle d-flex align-items-center justify-content-center active";
          //   this.ctasScore1Class = this.ctasScore2Class = this.ctasScore4Class = this.ctasScore5Class =
          //     "cursor-pointer circle d-flex align-items-center justify-content-center";
          // }
          // else if (score == "4") {
          //   this.ctasScore4Class = "cursor-pointer circle d-flex align-items-center justify-content-center active";
          //   this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore5Class =
          //     "cursor-pointer circle d-flex align-items-center justify-content-center";
          // }
          // else if (score == "5") {
          //   this.ctasScore5Class = "cursor-pointer circle d-flex align-items-center justify-content-center active";
          //   this.ctasScore1Class = this.ctasScore2Class = this.ctasScore3Class = this.ctasScore4Class =
          //     "cursor-pointer circle d-flex align-items-center justify-content-center";
          // }
        }
      }
    }, 3000);

    const now = new Date();
    this.timerData.push({id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time4', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time5', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time6', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time7', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time8', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time9', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time10', value: now.getHours() + ':' + now.getMinutes()});
    this.timerData.push({id: 'textbox_generic_time11', value: now.getHours() + ':' + now.getMinutes()});
    this.addListeners(this.datepickers);
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
  onNurseSelected(item: any, textbox1: string) {
    this.bindTextboxValue(textbox1, item.Name);
    if(textbox1 === 'textbox_TriageNurse') {
      this.bindTextboxValue("textbox_IDNumber1", item.EmpNo);
    }
    else if(textbox1 === 'textbox_AttendingAEDOPDNurse') {
      this.bindTextboxValue("textbox_IDNumber2", item.EmpNo);
    }
  }

  fetchEndoNurse(event: any) {
    if (event.target.value.length >= 3) {
      this.url = this.service.getData(otPatientDetails.FetchRODNurses, { Filter: event.target.value, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.endoNurseList = response.FetchRODNursesDataList;
          }
        },
          (err) => {
          })
    }
  }

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divnuct.nativeElement.parentNode;
        const nextSibling = this.divnuct.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divnuct.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divnuct.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divnuct.nativeElement);
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
