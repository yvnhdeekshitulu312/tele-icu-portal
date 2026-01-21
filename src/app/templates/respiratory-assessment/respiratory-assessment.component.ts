import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { ConfigService } from 'src/app/services/config.service';
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
  selector: 'app-respiratory-assessment',
  templateUrl: './respiratory-assessment.component.html',
  styleUrls: ['./respiratory-assessment.component.scss'],
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
export class RespiratoryAssessmentComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divrespa') divrespa!: ElementRef;
  doctorsData: any[] = [];
  item: any;
  IsPrint = false;
  divContentForPrint: any;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  FetchPatienClinicalTemplateDetailsNRTList: any = [];
  IsView = false;
  IsViewActual = false;
  showContent = true;
  isRemarksVisible: boolean = false;
  words: string[] = ['Intubation Assisst', 'Extubation', 'Tracheostomy Assisst Procedure', 'Surfactant Therapy', 'Dose',
    'Bronchoscopy Assist', 'Chest Physiotherapy G5', 'Apnea Test', 'Result', 'Transort ≥ 20 Min', 'Transort ≥ 30 Min', 'Transort ≥ 2 Hours', 'Sputum Culture', 'Nasal Suctioning', 'Tracheostomy Change Assisst', 'Re-Intubation', 'Reasone', 'Open Suction (Ambu Lavage)', 'Inline Suction Of Artificial Airway', 'Rt Fee', 'Transort Outside Hospital', 'Others'];
  activeWords: number[] = [];
  // Index to track which word is active
  activeWordIndex: number | null = null;
  isDullActive: boolean = false;
  isStonyDullness: boolean = false;
  isHyperResonance: boolean = false;
  isDiminishedAirEntry: boolean = false;
  isBronchialBreathSound: boolean = false;
  isWheeze: boolean = false;
  isStridor: boolean = false;
  isCoarsecrackles: boolean = false;
  isFineendinspiratorycrackles: boolean = false;
  isDActive: boolean = false;
  isStonyActive: boolean = false;
  isHyperActive: boolean = false;
  isDiminishedActive: boolean = false;
  isBronchialActive: boolean = false;
  isWheezeActive: boolean = false;
  isStridorActive: boolean = false;
  isCoarseActive: boolean = false;
  isFineendActive: boolean = false;
  isNormal: boolean = false;
  isNormalActive: boolean = false;
  deformityType: 'none' | 'chest_wall' = 'none';
  ArtificialAirwayType: 'none' | 'artificial_wall' = 'none';
  scarType: 'none' | 'scar' = 'none';
  minDate1 = new Date();
  @ViewChild('Signature3') Signature3!: SignatureComponent;
  @ViewChild('DateAndTime2', { static: false }) DateAndTime2!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;

  requiredFields = [];
  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private datepipe: DatePipe, private wardConfigService: ConfigService, private config: ConfigService) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  }


  ngOnInit(): void {
    this.getreoperativeN("116");
    this.getreoperative("116");
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showdefault(this.divrespa.nativeElement);
    }, 3000);
    this.addListeners(this.datepickers);
  }

  viewWorklist() {
    $("#savedModal").modal('show');
  }

  selectedTemplate(tem: any, changeId: boolean = true) {
    this.showContent = false;
    setTimeout(() => {
      this.showContent = true;
    }, 0);
    if (changeId) {
      this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
    }
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: 0, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: tem.PatientTemplatedetailID, TBL: 2 });
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
            this.showElementsData(this.divrespa.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            $("#savedModal").modal('hide');
          }
        }
      },
        (err) => {
        })
  }
  selectedTemplateN(tem: any, changeId: boolean = true) {
    this.showContent = false;
    setTimeout(() => {
      this.showContent = true;
    }, 0);
    if (changeId) {
      this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
    }
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOTRT, { ClinicalTemplateID: 0, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: tem.PatientTemplatedetailID, TBL: 2 });
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
            this.showElementsData(this.divrespa.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
           // $("#savedModal").modal('hide');
          }
        }
      },
        (err) => {
        })
  }

  getRespiratoryTherapyData() {
    const url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOTRT, { ClinicalTemplateID: 117, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: 0, TBL: 1 });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.selectedTemplate(response.FetchPatienClinicalTemplateDetailsNList[0], false);
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
            this.IsViewActual = true;
            //this.selectedTemplate(this.FetchPatienClinicalTemplateDetailsNList[0], false);
          } 
          // else {
          //   this.getRespiratoryTherapyData();
          // }
        }
      },
        (err) => {
        })
  }
  getreoperativeN(templateid: any) {    
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOTRT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: 0, TBL: 1 });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNRTList = response.FetchPatienClinicalTemplateDetailsNList;
            this.IsView = true;
            this.IsViewActual = true;
            this.selectedTemplateN(this.FetchPatienClinicalTemplateDetailsNRTList[0], false);
          } else {
            this.getRespiratoryTherapyData();
          }
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divrespa, this.requiredFields);

    if (tags && tags.length > 0) {
      const mergedArray = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 116,
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
        "Signature7": this.signatureForm.get('Signature7').value
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative("116");
          }
        },
          (err) => {

          });
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

  onCheckboxClicked(id: string, key: any) {
    if (id === (this as any)[key]) {
      (this as any)[key] = "";
    }
    else {
      (this as any)[key] = id;
    }
  }


  searchDoctor(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(otPatientDetails.FetchSSEmployees, { name: event.target.value, UserId: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.doctorsData = response.FetchSSEmployeesDataList;
          }
        },
          (err) => {
          })
    }
  }

  onDoctorSelection(item: any) {
    this.doctorsData = [];
  }

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  templatePrint_Old(name: any) {
    this.print(this.divrespa.nativeElement, name);
  }
  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divrespa.nativeElement.parentNode;
        const nextSibling = this.divrespa.nativeElement.nextSibling;

        const space = document.createElement('div');
        space.style.height = '60px';
        header.appendChild(space);

        header.appendChild(this.divrespa.nativeElement);

        this.print(header, name);

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divrespa.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divrespa.nativeElement);
          }

          header.removeChild(space);

          $('#divscroll').addClass("template_scroll");
          this.IsView = this.IsViewActual;
        }, 500);
      }, 500);

      return;
    }
  }
  toggleRemarks() {
    this.isRemarksVisible = !this.isRemarksVisible;
  }

  toggleActive(index: number) {
    // Check if the word is already active
    const wordIndex = this.activeWords.indexOf(index);

    if (wordIndex === -1) {
      // Add the word index if not active
      this.activeWords.push(index);
    } else {
      // Remove the word index if already active
      this.activeWords.splice(wordIndex, 1);
    }
  }
  // Method to check if a word is active
  isActive(index: number): boolean {
    return this.activeWords.includes(index);
  }
  isDullToggle() {
    this.isDullActive = !this.isDullActive;
    this.isDActive = !this.isDActive;
  }
  toggleStonyDullness() {
    this.isStonyDullness = !this.isStonyDullness;
    this.isStonyActive = !this.isStonyActive;
  }
  toggleHyperResonance() {
    this.isHyperResonance = !this.isHyperResonance;
    this.isHyperActive = !this.isHyperActive;
  }
  toggleDiminishedAirEntry() {
    this.isDiminishedAirEntry = !this.isDiminishedAirEntry;
    this.isDiminishedActive = !this.isDiminishedActive;
  }
  toggleNormal() {
    this.isNormal = !this.isNormal;
    this.isNormalActive = !this.isNormalActive;
  }
  toggleBronchialBreathSound() {
    this.isBronchialBreathSound = !this.isBronchialBreathSound;
    this.isBronchialActive = !this.isBronchialActive;
  }
  toggleWheeze() {
    this.isWheeze = !this.isWheeze;
    this.isWheezeActive = !this.isWheezeActive;
  }
  toggleStridor() {
    this.isStridor = !this.isStridor;
    this.isStridorActive = !this.isStridorActive;
  }
  toggleCoarsecrackles() {
    this.isCoarsecrackles = !this.isCoarsecrackles;
    this.isCoarseActive = !this.isCoarseActive;
  }
  toggleFineendinspiratorycrackles() {
    this.isFineendinspiratorycrackles = !this.isFineendinspiratorycrackles;
    this.isFineendActive = !this.isFineendActive;
  }
  toggleSSelection(type: 'none' | 'chest_wall'): void {
    this.deformityType = type; // Update the selection state
  }
  toggleVentilated(type: 'none' | 'artificial_wall'): void {
    this.ArtificialAirwayType = type; // Update the selection state
  }
  toggleScarSelection(type: 'none' | 'scar'): void {
    this.scarType = type; // Update the selection state
  }

  onCheckboxSelection(event:any, ids: string[], disable?: boolean) {
    const divElement = event.currentTarget as HTMLElement;
    if (divElement.classList.contains('active')) {
      divElement.classList.remove('active');
      ids.forEach(id => {
        document.getElementById(id)?.classList.remove('disabled');
      });
    } else {
      divElement.classList.add('active');
      if(disable) {
        ids.forEach(id => {
          if(id !== divElement.id) {
            document.getElementById(id)?.classList.add('disabled');
          }
        });
      }
    }

    ids.forEach(id => {
      if (id !== event.currentTarget.id) {
        document.getElementById(id)?.classList.remove('active');
      }
    });
  }
}
