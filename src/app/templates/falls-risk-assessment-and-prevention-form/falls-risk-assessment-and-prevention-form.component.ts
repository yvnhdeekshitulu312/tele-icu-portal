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
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
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
  selector: 'app-falls-risk-assessment-and-prevention-form',
  templateUrl: './falls-risk-assessment-and-prevention-form.component.html',
  styleUrls: ['./falls-risk-assessment-and-prevention-form.component.scss'],
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
export class FallsRiskAssessmentAndPreventionFormComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divfrarat') divfrarat!: ElementRef;
  readonly = false;
  HospitalID: any;
  doctorsData: any[] = [];
  item: any;
  IsPrint = false;
  divContentForPrint: any;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsView = false;
  IsViewActual = false;
  showContent = true;
  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('nursedate', { static: false }) nursedate!: ElementRef;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
  filteredFallRiskFactors: any;
  fallRiskFactors: any;
  fallRiskFactorParameter: any;
  filteredFallRiskFactorParameter: any;
  scoreBgColor1: string = "White";
  scoreBgColor2: string = "White";
  scoreBgColor3: string = "White";
  totalRiskFactorScore: number = 0;
  totalRiskFactorParameterScore: any;
  additionalScore: any;
  requiredFields = [];
  ward: any;
  wardID: any;
  employeeList: any = [];

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private datepipe: DatePipe, private config: BedConfig) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
  }


  ngOnInit(): void {
    this.getreoperative("119");
    this.fetchFallRiskFactor();
  }

  ngAfterViewInit() {
    if (this.nursedate) {
      this.nursedate.nativeElement.id = 'textbox_nursedate';
      this.bindTextboxValue("textbox_nursedate", this.datepipe.transform(new Date().setDate(new Date().getDate()), "dd-MMM-yyyy")?.toString());
    }
    this.bindTextboxValue("text_Doctors_Name", this.patientData.DoctorName);
    setTimeout(() => {
      this.showdefault(this.divfrarat.nativeElement);
    }, 3000);
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
            this.showElementsData(this.divfrarat.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
            this.IsViewActual = true;
          }
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divfrarat, this.requiredFields);
    if (tags && tags.length > 0) {
      const mergedArray = tags.concat(this.timerData);
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": 119,
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
            this.getreoperative("119");
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
    this.fetchFallRiskFactor();
    this.totalRiskFactorScore = 0;
    this.totalRiskFactorParameterScore = 0;
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

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  templatePrint_Old(name: any) {
    this.print(this.divfrarat.nativeElement, name);
  }
  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divfrarat.nativeElement.parentNode;
        const nextSibling = this.divfrarat.nativeElement.nextSibling;

        const space = document.createElement('div');
        space.style.height = '60px';
        header.appendChild(space);

        header.appendChild(this.divfrarat.nativeElement);

        this.print(header, name);

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divfrarat.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divfrarat.nativeElement);
          }

          header.removeChild(space);

          $('#divscroll').addClass("template_scroll");
          this.IsView = this.IsViewActual;
        }, 500);
      }, 500);

      return;
    }
  }

  riskFactorParameterToggle(index: any, item: any) {
    var updateRiskFactorParameter = this.fallRiskFactorParameter.filter((x: any) => x.RiskFactorID == item.RiskFactorID);
    updateRiskFactorParameter.forEach((element: any, index: any) => {
      if(this.readonly) {
        if (element.RiskFactorValueID == item.RiskFactorValueID) {
          element.CriteriaClass = "d-flex custom_check align-items-center gap-1 mb-2 active";
          element.Score = "Yes";
          element.Selected = true;
        }
        else {
          element.CriteriaClass = "d-flex custom_check align-items-center gap-1 mb-2";
          element.Score = "No";
          element.Selected = false;
        }
      }
      else {
        if (element.RiskFactorID == item.RiskFactorID && element.Score == item.Score) {
          element.CriteriaClass = "d-flex custom_check align-items-center gap-1 mb-2 active";
          element.Score = "Yes";
          element.Selected = true;
        }
        else {
          element.CriteriaClass = "d-flex custom_check align-items-center gap-1 mb-2";
          element.Score = "No";
          element.Selected = false;
        }
      }
    });
    var totScore = 0;
    this.filteredFallRiskFactorParameter.forEach((element: any, index: any) => {
      totScore = totScore + element.Score;
    });

    this.calculateTotalScore();
  }

  calculateTotalScore() {
    var anyOneSelectedAsYes = this.filteredFallRiskFactorParameter?.filter((x: any) => x.Score == "Yes");
    var anyOneSelectedAsYesCount = this.filteredFallRiskFactorParameter?.filter((x: any) => x.Score == "Yes").length;
    var totRiskFactorScore = Number(this.totalRiskFactorScore);
    if (Number(anyOneSelectedAsYesCount) == 2) {
      this.scoreBgColor3 = "#AEDCE8";
      this.scoreBgColor2 = "White";
      this.scoreBgColor1 = "White";
      this.totalRiskFactorParameterScore = "3";
      this.additionalScore = "High";
    }
    else if (totRiskFactorScore >= 0 && totRiskFactorScore <= 24) {
      this.additionalScore = "";
      if (anyOneSelectedAsYes?.length > 0) {
        this.scoreBgColor3 = "White";
        this.scoreBgColor2 = "#AEDCE8";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "2";
      }
      else {
        this.scoreBgColor3 = "White";
        this.scoreBgColor2 = "White";
        this.scoreBgColor1 = "#AEDCE8";
        this.totalRiskFactorParameterScore = "1";
      }
    }
    else if (totRiskFactorScore >= 25 && totRiskFactorScore <= 44) {
      this.additionalScore = "";
      if (anyOneSelectedAsYes?.length > 0) {
        this.scoreBgColor3 = "#AEDCE8";
        this.scoreBgColor2 = "White";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "3";
      }
      else {
        this.scoreBgColor3 = "White";
        this.scoreBgColor2 = "#AEDCE8";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "2";
      }
    }
    else if (totRiskFactorScore >= 45 && totRiskFactorScore <= 300) {
      this.additionalScore = "";
      if (anyOneSelectedAsYes?.length > 0) {
        this.scoreBgColor3 = "#AEDCE8";
        this.scoreBgColor2 = "White";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "3";
      }
      else {
        this.scoreBgColor3 = "#AEDCE8";
        this.scoreBgColor2 = "White";
        this.scoreBgColor1 = "White";
        this.totalRiskFactorParameterScore = "3";
      }
    }
  }

  fetchFallRiskFactor() {
    this.config.FetchFallRiskFactor(this.doctorDetails[0].UserId, this.wardID, this.hospitalID)
      .subscribe((response: any) => {
        this.fallRiskFactors = response.FetchFallRiskFactorDataList;
        this.fallRiskFactors.forEach((element: any, index: any) => {
          if (element.AssessmentScore == 0) {
            element.CriteriaClass = "d-flex custom_check align-items-center gap-1 mb-2 active";
            element.Score = 0;
            element.Selected = true;
          }
          else {
            element.CriteriaClass = "d-flex custom_check align-items-center gap-1 mb-2";
            element.Score = 0;
            element.Selected = false;
          }
        });
        const distinctThings = response.FetchFallRiskFactorDataList.filter(
          (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.RiskFactorID === thing.RiskFactorID) === i);
        console.dir(distinctThings);
        this.filteredFallRiskFactors = distinctThings;
        this.fetchFallRiskFactorParameter();

        let filteredData: any = [];
      },
        (err) => {
        })
  }

  
  fetchFallRiskFactorParameter() {
    this.config.FetchFallRiskFactorParameter(this.doctorDetails[0].UserId, this.wardID, this.hospitalID)
      .subscribe((response: any) => {
        this.fallRiskFactorParameter = response.FetchFallRiskFactorDataList;
        this.fallRiskFactorParameter.forEach((element: any, index: any) => {
          if (element.RiskFactorValue == "No") {
            element.CriteriaClass = "d-flex custom_check align-items-center gap-1 mb-2 active";
            element.Score = 0;
            element.Selected = true;
          }
          else {
            element.CriteriaClass = "d-flex custom_check align-items-center gap-1 mb-2";
            element.Score = 0;
            element.Selected = false;
          }
        });
        const distinctThings = response.FetchFallRiskFactorDataList.filter(
          (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.RiskFactorID === thing.RiskFactorID) === i);
        console.dir(distinctThings);
        this.filteredFallRiskFactorParameter = distinctThings;
      },
        (err) => {
        })
  }

  riskFactorToggle(index: any, item: any) {
    // this.fallRiskFactors[index].Score = item.AssessmentScore;
    var updateRiskFactor = this.fallRiskFactors.filter((x: any) => x.RiskFactorID == item.RiskFactorID);
    updateRiskFactor.forEach((element: any, index: any) => {
     
      if(this.readonly) {
        if (element.RiskFactorValueID == item.RiskFactorValueID) {
          element.CriteriaClass = "d-flex custom_check align-items-center gap-1 mb-2 active";
          //element.Score = element.AssessmentScore;
          element.Selected = true;
        }
        else {
          element.CriteriaClass = "d-flex custom_check align-items-center gap-1 mb-2";
          //element.Score = element.Score;
          element.Selected = false;
        }
        const findscore = this.fallRiskFactors.find((x:any) => x.RiskFactorID == item.RiskFactorID && x.RiskFactorValueID == item.RiskFactorValueID);
        element.Score = findscore.AssessmentScore;
      }
      else {
        if (element.RiskFactorID == item.RiskFactorID && element.AssessmentScore == item.AssessmentScore) {
          element.CriteriaClass = "d-flex custom_check align-items-center gap-1 mb-2 active";
          element.Score = item.AssessmentScore;
          element.Selected = true;
        }
        else {
          element.CriteriaClass = "d-flex custom_check align-items-center gap-1 mb-2";
          element.Score = item.AssessmentScore;
          element.Selected = false;
        }
      }
    });
    var totScore = 0;
    this.filteredFallRiskFactors.forEach((element: any, index: any) => {
      totScore = totScore + element.Score;
    });
    this.totalRiskFactorScore = totScore;
    const totScoreGb = Number(this.totalRiskFactorScore);
    if (totScoreGb >= 0 && totScoreGb <= 24)
      this.scoreBgColor1 = "#AEDCE8";
    else
      this.scoreBgColor1 = "White";
    if (totScoreGb >= 25 && totScoreGb <= 44)
      this.scoreBgColor2 = "#AEDCE8";
    else
      this.scoreBgColor2 = "White";
    if (totScoreGb >= 45)
      this.scoreBgColor3 = "#AEDCE8";
    else
      this.scoreBgColor3 = "White";

    this.calculateTotalScore();
  }

  filterFunction(riskfactors: any, RiskFactorID: any) {
    return riskfactors.filter((buttom: any) => buttom.RiskFactorID == RiskFactorID);
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
onEmployeeSelected(item: any) {
  this.employeeList = [];
}

getTotalPoints() {
  return this.filteredFallRiskFactors.map((item: any) => (item.Score != null && item.FinalScore != "") ? Number.parseInt(item.Score) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
}
}
