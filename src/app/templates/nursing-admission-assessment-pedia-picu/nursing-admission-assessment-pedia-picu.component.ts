import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { AdviceComponent } from 'src/app/portal/advice/advice.component';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { FallRiskAssessmentComponent } from 'src/app/shared/fall-risk-assessment/fall-risk-assessment.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { PatientAssessmentToolComponent } from 'src/app/ward/patient-assessment-tool/patient-assessment-tool.component';
import { ConfigService } from 'src/app/ward/services/config.service';
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
  selector: 'app-nursing-admission-assessment-pedia-picu',
  templateUrl: './nursing-admission-assessment-pedia-picu.component.html',
  styleUrls: ['./nursing-admission-assessment-pedia-picu.component.scss'],
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
export class NursingAdmissionAssessmentPediaPicuComponent extends DynamicHtmlComponent implements OnInit {
  @ViewChild('divnaapp') divnaapp!: ElementRef;
  nursesData: any = [];
  yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
  today = new Date();
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsViewActual = false;
  IsView = false;
  showContent = true;
  typeOfAdmission = "";
  modeOfAdmission = "";
  accompaniedBy = "";
  InformationObtained = "";
  Temperature: string = '';
  PulseRates:string = '';
  PulseRates2:string = '';
  PulseRates1:string = '';
  CapillaryRefill:string = '';
  chiefcomplaints: any;
  @ViewChild('conducteddate', { static: false }) conducteddate!: ElementRef;
  @ViewChild('admdate', {static: false}) admdate!: ElementRef;
  @ViewChild('Date1', {static: false}) Date1!: ElementRef;
  @ViewChild('Date2', {static: false}) Date2!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
  glasgowItems = [
    { id: 'checkbox_Spontaneous', value: 4 },
    { id: 'checkbox_ToSpeech', value: 3 },
    { id: 'checkbox_ToPain', value: 2 },
    { id: 'checkbox_NonePain', value: 1 },
    { id: 'checkbox_Oriented', value: 5 },
    { id: 'checkbox_Verbal_Confused', value: 4 },
    { id: 'checkbox_InappropriateSpeech', value: 3 },
    { id: 'checkbox_IncomprehensibleSounds', value: 2 },
    { id: 'checkbox_Verbal_None', value: 1 },
    { id: 'checkbox_ObeysCommand', value: 6 },
    { id: 'checkbox_LocalizesPain', value: 5 },
    { id: 'checkbox_WithdrawsFromPain', value: 4 },
    { id: 'checkbox_AbnormalFlexion', value: 3 },
    { id: 'checkbox_AbnormalExtension', value: 2 },
    { id: 'checkbox_None1R', value: 1 }
  ];

  modeOfAdmissionIds: string[] = ['checkbox_Ambulatory', 'checkbox_Wheelchair', 'checkbox_Stretcher', 'checkbox_OthersModeofAdmission'];
  typeOfAdmissionIds: string[] = ['checkbox_ElectiveBooked', 'checkbox_EmergencyDepartment', 'checkbox_OthersTypeofAdmission'];
  informationObtainedIds: string[] = ['checkbox_Unabletoobtain', 'checkbox_Patient', 'checkbox_Familymember', 'checkbox_Friend', 'checkbox_Others'];
  jointsValue = '';
  doctorsData: any = [];
  doctorId: any;
  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private configService: ConfigService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  }

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  ngOnInit(): void {
    this.getreoperative("38");
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
  //   this.showElementsData(this.divnaapp.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
  //   $("#savedModal").modal('hide');
  // }
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
            this.showElementsData(this.divnaapp.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
    const tags = this.findHtmlTagIds(this.divnaapp);

    if (tags) {
      const mergedArray  = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 38,
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
            this.getreoperative("38");
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

  ngAfterViewInit() {
    const now = new Date();
    this.timerData.push({id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes()})
    this.timerData.push({id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes()})

    if (this.conducteddate) {
      this.conducteddate.nativeElement.id = 'textbox_conducteddate';
    }

    if (this.Date1) {
      this.Date1.nativeElement.id = 'textbox_Date1';
    }
    if (this.Date2) {
      this.Date2.nativeElement.id = 'textbox_Date2';
    }

    if (this.admdate) {
      this.admdate.nativeElement.id = 'textbox_AdmitDate';
    }
    setTimeout(() => {
      this.showdefault(this.divnaapp.nativeElement);
      this.bindTextboxValue('textbox_Admittedto',this.patientData?.Ward);
      this.bindTextboxValue('textbox_Room',this.patientData?.Bed);
      this.bindTextboxValue('textbox_MostresponsiblephysicianName',this.patientData?.Consultant);
      this.bindTextboxValue('textbox_Code',this.patientData?.Bed);
      if(this.defaultData?.length > 0 && this.defaultData[1].FetchPatientDataEFormsDataList.length > 0) {
        const typeofAdm = this.defaultData[1].FetchPatientDataEFormsDataList[0].TypeofAdmission;
        if(typeofAdm.indexOf('Emergency') !== -1) {
          document.getElementById("checkbox_EmergencyDepartment")?.classList.add('active');
          this.typeOfAdmission = "checkbox_EmergencyDepartment";
        }
        else if(typeofAdm.indexOf('Elective') !== -1) {
          document.getElementById("checkbox_ElectiveBooked")?.classList.add('active');
          this.typeOfAdmission = "checkbox_ElectiveBooked";
        }
        this.chiefcomplaints = this.defaultData[0]?.FetcTemplateDefaultDataListM[0]?.ChiefComplaint;
      }
    }, 4000);
   
    this.bindTextboxValue("textbox_Name", this.doctorDetails[0].EmployeeName);
    this.bindTextboxValue("textbox_ID", this.doctorDetails[0].EmpNo);
    this.bindTextboxValue('textbox_conducteddate', moment().format('DD-MMM-YYYY'));
    this.addListeners(this.datepickers);
  }

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
    if (id === (this as any)[key]) {
      (this as any)[key] = "";
    }
    else {
      (this as any)[key] = id;
    }
  }

  togglePanel(button: any, header: any, toggle: any) {
    const x: any = document.getElementById(toggle);
    const toggleButton = document.getElementById(button);
    const toggleHeader = document.getElementById(header);
    if (x?.style.display === "none") {
      x.style.display = "block";
      toggleButton?.classList.add("active");
      toggleHeader?.classList.remove("headertoggle_bottom_radius");
    } else {
      x.style.display = "none";
      toggleButton?.classList.remove("active");
      toggleHeader?.classList.add("headertoggle_bottom_radius");
    }
  }

  searchDoctor(event: any) {
    if (event.target.value.length >= 3) {
      this.configService.FetchHospitalNurse("FetchBathHospitalDoctors", event.target.value.trim(), this.doctorDetails[0].UserId, 3403, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.doctorsData = response.FetchHospitalNurseDataaList;
          }
        },
          (err) => {

          })
    }
  }

  onDoctorSelection(item: any) {
    this.doctorsData = [];
    this.doctorId = item.EmpNo;
  }

  getScore(): number {
    if(this.divnaapp) {
      const glasgowDivs = this.divnaapp.nativeElement.querySelectorAll('.Glasgow');
      let totalScore = 0;
  
      glasgowDivs.forEach((div: HTMLElement) => {
        if (div.classList.contains('active')) {
          const id = div.getAttribute('id');
          const item = this.glasgowItems.find(item => item.id === id);
          if (item) {
            totalScore += Number(item.value);
          }
        }
      });
  
      return totalScore;
    }
    return 0;
  }

  showRisk() {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.ms.openModal(FallRiskAssessmentComponent, {
      data: '',
      inputPainScore: '',
      readonly: true,
      showSave: true
    }, options);
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
        const originalParent = this.divnaapp.nativeElement.parentNode;
        const nextSibling = this.divnaapp.nativeElement.nextSibling; 

        const space = document.createElement('div');
        space.style.height = '60px'; 
        header.appendChild(space);

        header.appendChild(this.divnaapp.nativeElement); 

        this.print(header, name); 

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divnaapp.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divnaapp.nativeElement);
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
