import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { SuitConfigService } from '../services/suitconfig.service';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { DomSanitizer } from '@angular/platform-browser';
import { PrintService } from 'src/app/shared/print.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TranslationService } from 'src/app/shared/translation/translation.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { isEmptyOrDots } from 'src/app/app.utils';


declare var $: any;
declare function openPACS(test: any, hospitalId: any, ssn: any): any;

@Component({
  selector: 'app-radiology-resultentry',
  templateUrl: './radiology-resultentry.component.html',
  styleUrls: ['./radiology-resultentry.component.scss']
})

export class RadiologyResultentryComponent extends BaseComponent implements OnInit {
  @ViewChild('divprint') divprint!: ElementRef;
  arabicText: any = "";
   arabicTextL: boolean = false;
  selectedPatientData: any;
  showAllergydiv: boolean = false;
  testTemplates: any;
  radiologyDoctors: any
  patientDiagnosis: any;
  patientDiagnosisName: any;
  htmlContent: any;
  htmlContentForPreviousResult: any;
  selectedTemplateId: any;
  errorMessages: any[] = [];
  isPanic: boolean = false;
  ISPANICFORM: boolean = false;
  isInteresting: boolean = false;
  confirmationMessage: string = "";
  isVerify: boolean = false;
  isResultsReview: boolean = false;
  resultRemarks: any;
  successMessage: string = "";
  addendumResults: any;
  showTemplateDiagnosisDoctordiv: boolean = false;
  editordivClass: string = "col-lg-8 left_expand";
  selectedDocumentID: any;
  informedToList: any;
  selectedInformedToEmpDetails: any[] = [];
  currentDate: any;
  readBackDate: string = "";
  IsReadBack: boolean = false;
  savedPatientPanicResultReportingDetails: any = [];
  selectedInformedByEmpDetails: any[] = [];
  sowPanicFormSave: boolean = true;
  showHtmlEditor: boolean = false;
  showSaveAddendum: boolean = false;
  verifyMsg: string = "";
  reviewMsg: string = "";
  pacsForm!: FormGroup;

  selectedPatientSSN: any;
  selectedPatientName: any;
  selectedPatientGender: any;
  selectedPatientAge: any;
  selectedPatientMobile: any;
  selectedPatientVTScore: any;
  selectedPatientHeight: any;
  selectedPatientWeight: any;
  selectedPatientBloodGrp: any;
  selectedPatientVitalsDate: any;
  selectedPatientBPSystolic: any;
  selectedPatientBPDiastolic: any;
  selectedPatientTemperature: any;
  selectedPatientPulse: any;
  selectedPatientSPO2: any;
  selectedPatientRespiration: any;
  selectedPatientConsciousness: any;
  selectedPatientO2FlowRate: any;
  selectedPatientAllergies: any;
  selectedPatientMedications: any = [];
  selectedPatientIsVip: boolean = false;
  selectedPatientClinicalInfo: any;
  selectedPatientIsPregnancy: boolean = false;
  selectedPatientPregnancyTrisemister: any;
  AddEndumSelected: any;
  trustedUrl: any;
  radiologyPdfDetails: any;
  RadEndServiceType: any;
  facility: any;
  fromRadiologyWorklist: boolean = true;
  cardiologyContentHTML: any = '';
  location: any;
  resultEntered: boolean = false;

  conclusion: any = '';
  parameterID: any = '';

  editorConfig: AngularEditorConfig = {
    sanitize: false,
    editable: true
  };
  editorConfigArabic: AngularEditorConfig = {
    editable: true,

    enableToolbar: false,   // ⬅️ disables the toolbar
    showToolbar: false,
    sanitize: false,
    defaultFontName: 'DroidKufi-Regular',
    fonts: [
      { class: 'droid-kufi', name: 'DroidKufi-Regular' },
      { class: 'poppins', name: 'Poppins' }
    ],
    customClasses: [
      {
        name: 'arabic-text',
        class: 'droid-kufi',
        tag: 'div'
      }
    ]
  };
  initializePACSForm() {
    this.pacsForm = this.fb.group({
      PACSURL: [],
      Username: [],
      Password: [],
      AccessionNumber: [],
      PatientID: [''],
      hdnintTestOrderItemId: [],
      hdnpatientFileNumber: [],
    });
  }

  selectedAIType = "infographic";
  showHisReport: boolean = false;

  constructor(private config: SuitConfigService, private router: Router, private configService: ConfigService, public datepipe: DatePipe,
    private op_config: ConfigService, private fb: FormBuilder, private modalSvc: NgbModal, private sanitizer: DomSanitizer, private printService: PrintService, private translationService: TranslationService, private us: UtilityService) {
    super();
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.fromRadiologyWorklist = sessionStorage.getItem("radresult") === "true" ? true : false;
    this.RadEndServiceType = this.facility.FacilityName
    if (this.RadEndServiceType === 'ENDOSCOPY')
      this.RadEndServiceType = "Endoscopy";
    else if (this.RadEndServiceType === 'CATH LAB')
      this.RadEndServiceType = "CATH LAB";
    else if (this.RadEndServiceType === 'CARDIOLOGY')
      this.RadEndServiceType = "CARDIOLOGY";
    else
      this.RadEndServiceType = "Radiology";

  }

  ngOnInit(): void {
    this.currentDate = this.datepipe.transform(new Date(), "dd-MMM-yyyy HH:mm")?.toString();
    this.location = sessionStorage.getItem("locationName");
    this.selectedPatientData = JSON.parse(sessionStorage.getItem("selectedPatientData") || '{}');
    if (this.selectedPatientData.ISPanic == "1") {
      this.isPanic = true;
    }
    if (this.selectedPatientData.Status == 5) {
      this.isVerify = true;
      this.htmlContent = '';
      this.showHtmlEditor = false;
    }
    else {
      this.showHtmlEditor = true;
    }
    this.FetchHospitalResultTemplates();
    this.FetchAdviceDiagnosis();
    this.FetchRadiologyDoctors();
    // this.FetchSaveRadiologyResults();
    if (this.isVerify)
      this.FetchSaveAddEndNumRadiologyResults();

    this.initializePACSForm();
    this.setPACSformValues();
  }

  setPACSformValues() {
    this.pacsForm.controls['PACSURL'].setValue("http://172.16.17.96/Launch_Viewer.asp");
    this.pacsForm.controls['Username'].setValue("hisuser");
    this.pacsForm.controls['Password'].setValue("hisuser");
    this.pacsForm.controls['PatientID'].setValue(this.selectedPatientData.RegCode.split('.')[1]);
  }
  FetchHospitalResultTemplates() {
    this.config.FetchHospitalResultTemplates(this.selectedPatientData.TestID, 0, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response) => {
      if (response.Code == 200) {
        this.testTemplates = response.FetchHospitalResultTemplatesDataList;
      }
    },
      (err) => {

      })
  }

  FetchRadiologyDoctors() {
    this.config.FetchRadiologyDoctors(this.selectedPatientData.TestOrderItemID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response) => {
      if (response.Code == 200) {
        this.radiologyDoctors = response.FetchRadiologyDoctorsDataList;
        this.radiologyDoctors.forEach((element: any, index: any) => {
          element.docSelected = element.Checked;
        });
        var finddoc = this.radiologyDoctors.find((x: any) => Number(x.DOCID) === this.doctorDetails[0].EmpId);
        if (finddoc != undefined)
          finddoc.docSelected = true;
        this.FetchSaveRadiologyResults();
      }
    },
      (err) => {

      })
  }

  FetchAdviceDiagnosis() {
    this.config.FetchAdviceDiagnosis(1, this.selectedPatientData.IPID, this.hospitalID).subscribe((response) => {
      if (response.Code == 200) {
        this.patientDiagnosis = response.PatientDiagnosisDataList;
        this.patientDiagnosis.forEach((element: any, index: any) => {
          this.patientDiagnosisName = element.DiseaseName + ",";
        });
      }
    },
      (err) => {

      })
  }

  onChangeTestTemplates(event: any) {
    this.selectedTemplateId = event.target.value;
    this.config.FetchHospitalTestResultTemplates(this.selectedPatientData.TestID, this.selectedTemplateId, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response) => {
      if (response) {
        $("#htmeditor").val(response[0].TextValue);
        this.htmlContent = response[0].TextValue;
      }
    },
      (err) => {

      })
  }

  selectRadiologyDoctor(doc: any) {
    this.radiologyDoctors.forEach((element: any) => {
      if (element.DOCID === doc.DOCID) {
        element.docSelected = true;
      }
      else {
        element.docSelected = false;
      }
    });
    // if (!doc.docSelected) {
    //   doc.docSelected = true;
    // }
    // else
    //   doc.docSelected = false;
  }

  selectPanicorIntersting(type: string) {
    if (type == "panic") {
      if (!this.isPanic) {
        this.isPanic = true;
      }
      else {
        this.isPanic = false;
      }
    }
    else if (type == "interesting") {
      if (!this.isInteresting) {
        this.isInteresting = true;
      }
      else {
        this.isInteresting = false;
      }
    }
  }

  openAllergyPopup() {
    this.showAllergydiv = true;
  }

  goBackToRadiologyWorklist() {
    sessionStorage.setItem("selectedPatientData", "");
    if (this.fromRadiologyWorklist) {
      $('#selectPatientYesNoModal').modal('show');
    } else {
      this.router.navigate(['/suit/worklist']);
    }
  }

  onAccept() {
    const SSN = this.selectedPatientData.SSN;
    $('#selectPatientYesNoModal').modal('hide');
    sessionStorage.setItem('navigateToRadiologyWorklist', SSN)
    this.router.navigate(['/suit/radiologyworklist']);
  }

  onDecline() {
    $('#selectPatientYesNoModal').modal('hide');
    this.router.navigate(['/suit/radiologyworklist']);
  }

  saveRadiologyResultEntry() {

    if (!this.ISPANICFORM && this.isPanic)
      this.openPanicResultReportingForm();
    else {
      var selectedRadDocDet = this.radiologyDoctors.filter((x: any) => x.docSelected == true);
      this.errorMessages = [];
      if (selectedRadDocDet.length === 0) {
        this.errorMessages.push("Please select Doctors");
      }
      if (!this.htmlContent) {
        this.errorMessages.push("Please Enter Result");
      }
      if (isEmptyOrDots(this.conclusion)) {
        this.errorMessages.push("Please Enter Conclusion");
      }
      if (this.errorMessages.length > 0) {
        $("#resultEntryValidationMsg").modal('show');
        return;
      }
      var radResultEntryPayload = {
        "TestID": this.selectedPatientData.TestID,
        "TemplateID": this.selectedTemplateId,
        "OrderId": this.selectedPatientData.TestOrderID,
        "OrderItemId": this.selectedPatientData.TestOrderItemID,
        "EquipmentId": "0",
        "MethodId": "0",
        "ReagentProfileId": "0",
        "Sequence": this.selectedPatientData.Sequence,
        "TemplateData": this.convertHtmlForCrystalReports(this.htmlContent.toString()),//this.htmlContent.toString(),
        "IsPanic": this.isPanic,
        "TestReagents": [],
        "TestDoctors": [
          {
            "DOCID": selectedRadDocDet[0].DOCID,
            "DoctorName": selectedRadDocDet[0].DoctorName,
            "Checked": "1",
            "Signature": "",
            "Designation": "",
            "DSEQ": "0"
          }
        ]
        ,
        "TestTechnicians": [],
        "Remarks": this.resultRemarks,
        "ResultType": "1",
        "EmpID": this.doctorDetails[0].EmpId,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        "HospitalID": this.hospitalID,
        "FacilityID": "0",
        "ismicrobiology": "0",
        "BiRadsRatingID": "0",
        "Conclusion": this.conclusion
      }
      const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.config.SaveRadiologyTestResults(radResultEntryPayload).subscribe((response) => {
            if (response.Code == 200) {
              this.successMessage = "Result Saved Successfully";
              $("#resultEntrySavedMsg").modal('show');
              //this.resultEntered = true;
              this.FetchSaveRadiologyResults();
            }
            if (response.Code == 404 && response.FetchRadiologyValidationsDataList[0].PopupMessage == true) {
              this.errorMessages = [];
              this.errorMessages.push(response.FetchRadiologyValidationsDataList[0].strMessage);
              if (this.errorMessages.length > 0) {
                $("#resultEntryValidationMsg").modal('show');
              }

            }
          },
            (err) => {

            })
        }
        modalRef.close();
      });
    }
  }
  deleteResultEntryConfirmationPopup() {
    this.confirmationMessage = "Are you sure you want to Delete the Resule entered ?";
    $("#deleteResultEntryConfirmation").modal('show');
  }
  deleteRadiologyResults(type: string) {
    if (type == "Yes") {
      this.config.DeleteRadiologyResults(this.selectedPatientData.TestOrderID, this.selectedPatientData.TestOrderItemID, this.selectedPatientData.Sequence, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response) => {
        if (response.Code == 200) {
          $("#resultEntryDeletedMsg").modal('show');
        }
      },
        (err) => {

        })
    }
    $("#deleteResultEntryConfirmation").modal('hide');
  }
  clearRadiologyResultEnrty() {
    this.htmlContent = '';
    this.conclusion = '';
    this.parameterID = '';
    this.arabicText = '';
    this.arabicTextL = false;
    this.radiologyDoctors.forEach((element: any, index: any) => {
      element.docSelected = false;
    });

  }

  verifyResultEntryConfirmation() {
    if (!this.resultEntered) {
      this.errorMessages = [];
      this.errorMessages.push("Please enter result before verifying");
      $("#resultEntryValidationMsg").modal('show');
      return;
    }
    if (this.isVerify) {
      this.verifyMsg = "Are you sure you want to Un-Verify Result ?";
    }
    else {
      this.verifyMsg = "Are you sure you want to Verify Result ?";
    }
    $("#verifyResultEntryConfirmation").modal('show');
  }

  verifyRadiologyResultEntry(type: any) {
    if (type == "Yes") {
      if (this.isVerify)
        this.isVerify = false;
      else
        this.isVerify = true;
      const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.config.VerifyRadiologyResults(this.selectedPatientData.TestOrderID, this.selectedPatientData.TestOrderItemID, this.selectedPatientData.TestID, this.selectedPatientData.Sequence, this.resultRemarks == '' ? null : this.resultRemarks, this.isVerify, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response) => {
            if (response.Code == 200) {
              if (this.isVerify) {
                this.successMessage = "Result Verified Successfully";
                $("#resultEntrySavedMsg").modal('show');
                this.FetchSaveAddEndNumRadiologyResults();
              }
              else {
                this.successMessage = "Result Un-Verified Successfully";
                $("#resultEntrySavedMsg").modal('show');
              }
            }
          },
            (err) => {

            })
        }
        else if (!data.success) {
          this.isVerify = !this.isVerify;
        }
        modalRef.close();
      });
    }
  }
  ReloadScreen() {
    window.location.reload();
  }

  FetchSaveRadiologyResults() {
    this.config.FetchSaveRadiologyResults(this.selectedPatientData.TestOrderID, this.selectedPatientData.TestOrderItemID, this.selectedPatientData.TestID, this.selectedPatientData.PatientID, this.selectedPatientData.IPID, this.selectedPatientData.PatientType, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response) => {
      if (response.Code == 200 && response.FetchSaveRadiologyResultsDataList.length > 0) {
        if (Number(this.selectedPatientData.Status) <= 4) {
          this.htmlContent = response.FetchSaveRadiologyResultsDataList[0].ExtValue;
          this.resultRemarks = response.FetchSaveRadiologyResultsDataList[0].Remarks;
          this.isResultsReview = response.FetchSaveRadiologyResultsDataList[0].IsResultReview == 'True' ? true : false;
          this.isPanic = response.FetchSaveRadiologyResultsDataList[0].Ispanic == '1' ? true : false;
          this.ISPANICFORM = response.FetchSaveRadiologyResultsDataList[0].ISPANICFORM == '1' ? true : false;
        }
        else {
          this.htmlContentForPreviousResult = response.FetchSaveRadiologyResultsDataList[0].ExtValue;
          this.resultRemarks = response.FetchSaveRadiologyResultsDataList[0].Remarks;
          this.isResultsReview = response.FetchSaveRadiologyResultsDataList[0].IsResultReview == 'True' ? true : false;
          this.isPanic = response.FetchSaveRadiologyResultsDataList[0].Ispanic == '1' ? true : false;
          this.ISPANICFORM = response.FetchSaveRadiologyResultsDataList[0].ISPANICFORM == '1' ? true : false;
        }
        this.conclusion = response.FetchSaveRadiologyResultsDataList[0].Conclusion;
        this.parameterID = response.FetchSaveRadiologyResultsDataList[0].ParameterId;
        this.arabicText = response.FetchSaveRadiologyResultsDataList[0].AIGeneratedArabicResult;
        if(response.FetchSaveRadiologyResultsDataList[0].AIGeneratedArabicResult!='')
           this.arabicTextL = true;
        response.FetchSaveRadiologyDoctorsDataList.forEach((element: any, index: any) => {
          this.radiologyDoctors.find((x: any) => x.DOCID == element.DoctorID).docSelected = true;
        });

        if (Number(this.selectedPatientData.Status) >= 4) {
          this.resultEntered = true;
        }

      }
    },
      (err) => {

      })
  }
  FetchSaveAddEndNumRadiologyResults() {
    if (this.isVerify) {
      this.config.FetchSaveAddEndNumRadiologyResults(this.selectedPatientData.TestOrderID, this.selectedPatientData.TestOrderItemID, 0, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response) => {
        if (response.Code == 200) {
          this.addendumResults = response.FetchSaveAddEndNumRadiologyResultsDataList;

        }
      },
        (err) => {

        })
    }
  }
  navigateToResultsOld() {
    sessionStorage.setItem("FromRadiology", "true");
    this.router.navigate(['/home/otherresults']);
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.selectedPatientData));
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedPatientData));
  }
  showResultsinPopUp: boolean = false;
  navigateToResults() {
    sessionStorage.setItem("navigateFromCasesheet", 'true');
    //this.router.navigate(['/home/otherresults']);
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.selectedPatientData));
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedPatientData));
    this.showResultsinPopUp = true;
    $("#viewResults").modal("show");
  }
  closeViewResultsPopup() {
    sessionStorage.setItem("navigateFromCasesheet", 'false');
    $("#viewResults").modal("hide");
    setTimeout(() => {
      this.showResultsinPopUp = false;
    }, 1000);
  }
  showPatientSummaryinPopUp: boolean = false;
  openPatientFolder() {
    this.showPatientSummaryinPopUp = true;
    sessionStorage.setItem("PatientID", this.selectedView.PatientID);
    sessionStorage.setItem("SummaryfromCasesheet", 'true');
    $("#pateintFolderPopup").modal("show");
  }
  closePatientSummaryPopup() {
    $("#pateintFolderPopup").modal("hide");
    setTimeout(() => {
      this.showPatientSummaryinPopUp = false;
    }, 1000);
  }

  SaveRadiologyAddenddumTestResults() {
    var addendumPayload =
    {
      "TestResultsAddendumID": "0",
      "TestOrderID": this.selectedPatientData.TestOrderID,
      "TestOrderItemID": this.selectedPatientData.TestOrderItemID,
      "Sequence": this.selectedPatientData.Sequence,
      "DocID": this.doctorDetails[0].EmpId,
      "AddEndNumResult": this.htmlContent,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalID,
      "IsVerified": this.isVerify,
      "Blocked": false
    }
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.config.SaveRadiologyAddendumTestResults(addendumPayload).subscribe((response) => {
          if (response.Code == 200) {
            this.successMessage = "Addendum Result Saved Successfully";
            $("#resultEntrySavedMsg").modal('show');
          }
        },
          (err) => {

          })
      }
      modalRef.close();
    });

  }
  showHideTemplateDiagnosisDoctordiv() {
    if (!this.showTemplateDiagnosisDoctordiv) {
      this.showTemplateDiagnosisDoctordiv = true;
    }
    else {
      this.showTemplateDiagnosisDoctordiv = false;
    }
  }

  fetchAddendumResult(addr: any) {
    this.config.FetchSaveAddEndNumRadiologyResults(this.selectedPatientData.TestOrderID, this.selectedPatientData.TestOrderItemID, addr.DocumentID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response) => {
      if (response.Code == 200) {
        //this.addendumResults = response.FetchSaveAddEndNumRadiologyResultsDataList;
        this.htmlContent = response.FetchSaveAddEndNumRadiologyResultsDataList[0].Result;
        this.showSaveAddendum = false;
        this.showHtmlEditor = true;
        this.AddEndumSelected = addr.DocumentName;
      }
    },
      (err) => {

      })
  }

  verifyAddendumResultEntryConfirmation(addr: any) {
    this.selectedDocumentID = addr.DocumentID;
    $("#verifyAddendumResultEntryConfirmation").modal('show');
  }

  verifyAddendumResult(type: any) {
    if (type == "Yes") {
      var addendumPayload =
      {
        "TestResultsAddendumID": this.selectedDocumentID,
        "TestOrderID": this.selectedPatientData.TestOrderID,
        "TestOrderItemID": this.selectedPatientData.TestOrderItemID,
        "Sequence": this.selectedPatientData.Sequence,
        "DocID": this.doctorDetails[0].EmpId,
        "AddEndNumResult": this.htmlContent,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        "HospitalID": this.hospitalID,
        "IsVerified": true,
        "Blocked": false
      }
      this.config.SaveRadiologyAddendumTestResults(addendumPayload).subscribe((response) => {
        if (response.Code == 200) {
          this.selectedDocumentID = "";
          this.successMessage = "Addendum Result Verified Successfully";
          $("#resultEntrySavedMsg").modal('show');
        }
      },
        (err) => {

        })
    }
  }

  deleteAddendumResultComfirmation(addr: any) {
    this.selectedDocumentID = addr.DocumentID;
    $("#deleteAddendumResultEntryConfirmation").modal('show');
  }

  deleteAddendumResult(type: any) {
    if (type == "Yes") {
      var addendumPayload =
      {
        "TestResultsAddendumID": this.selectedDocumentID,
        "TestOrderID": this.selectedPatientData.TestOrderID,
        "TestOrderItemID": this.selectedPatientData.TestOrderItemID,
        "Sequence": this.selectedPatientData.Sequence,
        "DocID": this.doctorDetails[0].EmpId,
        "AddEndNumResult": this.htmlContent,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        "HospitalID": this.hospitalID,
        "IsVerified": this.isVerify,
        "Blocked": true
      }
      this.config.SaveRadiologyAddendumTestResults(addendumPayload).subscribe((response) => {
        if (response.Code == 200) {
          this.selectedDocumentID = "";
          this.successMessage = "Addendum Result Deleted Successfully";
          $("#resultEntrySavedMsg").modal('show');
        }
      },
        (err) => {

        })
    }
  }

  searchEmployee(event: any) {
    if (event.target.value.length > 2) {
      this.config.FetchDoctorName(event.target.value, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.informedToList = response.FetchDoctorDataList;
          }
        },
          (err) => {

          })
    }
  }
  onItemSelected(emp: any) {
    //this.selectedInformedToEmpDetails = emp;
    this.selectedInformedToEmpDetails = [];
    this.selectedInformedToEmpDetails.push({
      InformedToEmpNo: emp.EmpNo,
      InformedToEmpId: emp.Empid,
      InformedToFullName: emp.Fullname
    })
  }
  onReadBackChanges(event: any) {
    if (event.target.checked == true) {
      this.IsReadBack = true
      this.readBackDate = this.currentDate;
    }
    else {
      this.readBackDate = "";
    }
  }

  openPanicResultReportingForm() {
    this.FetchSavePanicRadiologyForm();
    $("#panicReportForm").modal('show');
  }

  savePanicResultReportingForm() {
    if (this.selectedInformedToEmpDetails != undefined) {
      var savePanicFormpayload = {
        "PatientCriticalPanicTestID": "0",
        "PatientID": this.selectedPatientData.PatientID,
        "Admissionid": this.selectedPatientData.IPID,
        "TestOrderID": this.selectedPatientData.TestOrderID,
        "TestOrderItemID": this.selectedPatientData.TestOrderItemID,
        "TestID": this.selectedPatientData.TestID,
        "InformedToEmpID": this.selectedInformedToEmpDetails[0].InformedToEmpId,
        "InformedByEmpID": this.doctorDetails[0].EmpId,
        "IsReadBack": this.IsReadBack,
        "Remarks": $("#panicFormRemarks").val(),
        "CriticalPanicRadResultXML": [
          {
            "CMDID": "0",
            "PANICRESULT": "1",
            "REFRANGE": "6817",
          }
        ],
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        "HospitalID": this.hospitalID
      }
      this.config.SaveRadiologyPanicReportingForm(savePanicFormpayload).subscribe((response) => {
        if (response.Code == 200) {
          this.ISPANICFORM = true;
          this.successMessage = "Panic Result Reporting Form Submitted Successfully";
          $("#resultEntrySavedMsg").modal('show');
          $("#panicReportForm").modal('hide');
          this.saveRadiologyResultEntry();
        }
      },
        (err) => {

        })
    }
    else {
      this.errorMessages.push("Please select Informed To");
      if (this.errorMessages.length > 0) {
        $("#resultEntryValidationMsg").modal('show');
      }
    }
  }

  FetchSavePanicRadiologyForm() {
    this.config.FetchSavePanicRadiologyForm(this.selectedPatientData.TestOrderItemID, this.hospitalID).subscribe((response) => {
      if (response.Code == 200 && response.FetchSavePanicRadiologyFormDataList.length > 0) {
        if (response.FetchSavePanicRadiologyTestDataList.length > 0)
          this.sowPanicFormSave = false;
        this.savedPatientPanicResultReportingDetails = response.FetchSavePanicRadiologyFormDataList;
        this.IsReadBack = this.savedPatientPanicResultReportingDetails[0].IsReadBack;
        this.readBackDate = this.savedPatientPanicResultReportingDetails[0].ReadBackDateTime;
        $("#panicFormRemarks").val(this.savedPatientPanicResultReportingDetails[0].Remarks);
        this.selectedInformedToEmpDetails = []; this.selectedInformedByEmpDetails = [];
        if (this.savedPatientPanicResultReportingDetails[0].InformedToEmpNO != '') {
          this.selectedInformedByEmpDetails.push({
            EmpNo: this.savedPatientPanicResultReportingDetails[0].InformedByEmpNO,
            EmpId: this.savedPatientPanicResultReportingDetails[0].InformedByEmpID,
            FullName: this.savedPatientPanicResultReportingDetails[0].InformedByEmployeeName,
          })
        } else {
          this.selectedInformedByEmpDetails.push({
            EmpNo: this.doctorDetails[0].EmpNo,
            EmpId: this.doctorDetails[0].EmpId,
            FullName: this.doctorDetails[0].EmployeeName,
          })
        }
        this.selectedInformedToEmpDetails.push({
          InformedToEmpNo: this.savedPatientPanicResultReportingDetails[0].InformedToEmpNO,
          InformedToEmpId: this.savedPatientPanicResultReportingDetails[0].InformedToEmpID,
          InformedToFullName: this.savedPatientPanicResultReportingDetails[0].InformedToEmployeeName,
        })

      }
      else {
        this.selectedInformedByEmpDetails.push({
          EmpNo: this.doctorDetails[0].EmpNo,
          EmpId: this.savedPatientPanicResultReportingDetails[0].EmpId,
          FullName: this.savedPatientPanicResultReportingDetails[0].EmployeeName,
        })
      }
    },
      (err) => {

      })
  }
  clearPanicResultReportingForm() {

  }

  navigateToReportResultView() {
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.selectedPatientData));
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedPatientData));
    sessionStorage.setItem("FromRadiology", "true");
    this.router.navigate(['/home/otherresults']);
  }
  showPatientInfo(pinfo: any) {
    $("#quick_info").modal('show');
    this.selectedPatientSSN = pinfo.SSN;
    this.selectedPatientName = pinfo.PatientName;
    this.selectedPatientGender = pinfo.Gender;
    this.selectedPatientAge = pinfo.FullAge;
    this.selectedPatientMobile = pinfo.MobileNo;
    this.selectedPatientHeight = pinfo.Height;
    this.selectedPatientWeight = pinfo.Weight;
    this.selectedPatientBloodGrp = pinfo.BloodGroup;
    this.selectedPatientIsVip = pinfo.IsVIP == "Non-VIP" ? false : true;
    if (pinfo.IsPregnancy) {
      this.selectedPatientIsPregnancy = true;
      this.selectedPatientPregnancyTrisemister = pinfo.PregnancyContent;
    }
    else {
      this.selectedPatientIsPregnancy = false;
      this.selectedPatientPregnancyTrisemister = "";
    }
    this.op_config.FetchPatientFileInfo(pinfo.EpisodeID, pinfo.IPID, this.hospitalID, pinfo.PatientID, pinfo.RegCode).subscribe((response: any) => {
      if (response.objPatientMedicationsList.length > 0) {
        this.selectedPatientMedications = response.objPatientMedicationsList;
      }
      else {
        this.selectedPatientMedications = [];
      }
      if (response.objPatientVitalsList.length > 0) {
        this.selectedPatientVitalsDate = response.objPatientVitalsList[0].CreateDate;
        this.selectedPatientBPSystolic = response.objPatientVitalsList[0].Value;
        this.selectedPatientBPDiastolic = response.objPatientVitalsList[1].Value;
        this.selectedPatientTemperature = response.objPatientVitalsList[2].Value;
        this.selectedPatientPulse = response.objPatientVitalsList[3].Value;
        this.selectedPatientSPO2 = response.objPatientVitalsList[4].Value;
        this.selectedPatientRespiration = response.objPatientVitalsList[5].Value;
        if (response.objPatientVitalsList.length > 6 && response.objPatientVitalsList[6].Value != undefined)
          this.selectedPatientConsciousness = response.objPatientVitalsList[6].Value;
        else
          this.selectedPatientConsciousness = "";
        if (response.objPatientVitalsList.length > 7 && response.objPatientVitalsList[7].Value != undefined)
          this.selectedPatientO2FlowRate = response.objPatientVitalsList[7].Value;
        else
          this.selectedPatientO2FlowRate = "";
      }
      else {
        this.selectedPatientVitalsDate = "";
        this.selectedPatientBPSystolic = "";
        this.selectedPatientBPDiastolic = "";
        this.selectedPatientTemperature = "";
        this.selectedPatientPulse = "";
        this.selectedPatientSPO2 = "";
        this.selectedPatientRespiration = "";
      }
      if (response.objPatientAllergyList.length > 0) {
        this.selectedPatientAllergies = response.objPatientAllergyList;
      }
      else {
        this.selectedPatientAllergies = [];
      }
      if (response.objobjPatientClinicalInfoList.length > 0) {
        this.selectedPatientClinicalInfo = response.objobjPatientClinicalInfoList[0].ClinicalCondtion;
        this.selectedPatientVTScore = response.objobjPatientClinicalInfoList[0].VTScore;
      }
      else {
        this.selectedPatientClinicalInfo = ""
        this.selectedPatientVTScore = "";
      }
    })
  }
  addAddendum() {
    if (this.isVerify) {
      this.htmlContent = '';
      this.showSaveAddendum = true;
      this.showHtmlEditor = true;
    }
  }
  reviewResultEntryConfirmation() {
    if (!this.resultEntered) {
      this.errorMessages = [];
      this.errorMessages.push("Please enter result before verifying");
      $("#resultEntryValidationMsg").modal('show');
      return;
    }
    if (this.reviewMsg) {
      this.reviewMsg = "Are you sure you want to Un-Review Result ?";
    }
    else {
      this.reviewMsg = "Are you sure you want to Review Result ?";
    }
    $("#reviewResultEntryConfirmation").modal('show');
  }
  reviewRadiologyResultEntry(type: any) {
    if (type == "Yes") {
      if (this.isResultsReview)
        this.isResultsReview = false;
      else
        this.isResultsReview = true;
      this.config.UpdateTestResultReview(this.selectedPatientData.TestOrderID, this.selectedPatientData.TestOrderItemID, this.selectedPatientData.TestID, this.isResultsReview, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID).subscribe((response) => {
        if (response.Code == 200) {
          if (this.isResultsReview) {
            this.successMessage = "Result Reviewed Successfully";
            $("#resultEntrySavedMsg").modal('show');
          }
          else {
            this.successMessage = "Result Un-Reviewed Successfully";
            $("#resultEntrySavedMsg").modal('show');
          }
        }
      },
        (err) => {

        })
    }
  }
  submitPACSForm(test: any) {
    openPACS(test.TestOrderItemID, this.hospitalID, this.selectedPatientData.SSN);

  }
  RadioLogyReportPrintPDF() {
    this.config.fetchRadReportGroupPDF(this.selectedPatientData.RegCode, this.selectedPatientData.TestOrderItemID, this.selectedPatientData.TestOrderID, this.doctorDetails[0].UserId, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        this.radiologyPdfDetails = response;
        this.trustedUrl = response?.FTPPATH
        if (response.objLabReportNList.length > 0) {
          const content = response.objLabReportNList[0].VALUE;
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/html');
          const extractedText = doc.body.innerHTML;
          this.cardiologyContentHTML = this.sanitizer.bypassSecurityTrustHtml(extractedText);
          $('#cardiology_report').modal('show');
        } else {
          this.radiologyPdfDetails = response;
          this.trustedUrl = response?.FTPPATH
          this.showModal();
        }
      }
    },
      (err) => {

      })
  }
  showModal(): void {
    $("#reviewAndPayment").modal('show');
  }

  navigatetoPatientSummary() {
    this.selectedPatientData.Bed = this.selectedPatientData.OrderBed;
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.selectedPatientData));
    sessionStorage.setItem("selectedView", JSON.stringify(this.selectedPatientData));
    sessionStorage.setItem("selectedPatientAdmissionId", this.selectedPatientData.IPID);
    sessionStorage.setItem("PatientID", this.selectedPatientData.PatientID);
    sessionStorage.setItem("radresult", "true");
    this.router.navigate(['/shared/patientfolder']);
  }

  print() {
    if ($('#divscroll').hasClass('template_scroll')) {
      $('#divscroll').removeClass("template_scroll");
    }

    if ($('#divscrollOverflow').hasClass('overflow-auto')) {
      $('#divscrollOverflow').removeClass("overflow-auto");
      $('#divscrollOverflow').addClass("overflow-visible");
    }
    this.printService.print(this.divprint.nativeElement, 'Report');

    setTimeout(() => {
      $('#divscroll').addClass("template_scroll");
      $('#divscrollOverflow').addClass("overflow-auto");
      $('#divscrollOverflow').removeClass("overflow-visible");
    }, 1000);
  }

  convertHtmlForCrystalReports(html: string): string {
    if (!html) return '';

    let cleaned = html
      // Convert modern tags to Crystal-compatible tags
      .replace(/<strong\b[^>]*>/gi, '<b>')
      .replace(/<\/strong>/gi, '</b>')
      .replace(/<em\b[^>]*>/gi, '<i>')
      .replace(/<\/em>/gi, '</i>')
      .replace(/<div\b[^>]*>/gi, '<p>')
      .replace(/<\/div>/gi, '</p>')
      .replace(/<span\b[^>]*>/gi, '')
      .replace(/<\/span>/gi, '')

      // Convert headers to bold + line break
      .replace(/<(h[1-6])[^>]*>(.*?)<\/\1>/gi, '<b>$2</b><br>')

      // Replace <br> variations
      .replace(/<br\s*\/?>/gi, '<br>')

      // Remove unsupported tags (script, style, etc.)
      .replace(/<(script|iframe|header|footer|section|article|nav)[^>]*>.*?<\/\1>/gis, '')

      // Strip attributes from tags (except <font>)
      //.replace(/<(?!font)(\w+)\s+[^>]*>/gi, '<$1>')

      // Remove malformed tags or unknown closing tags
      .replace(/<\/?[^a-zA-Z0-9]+>/g, '');

    // --- Whitespace Cleanup ---

    cleaned = cleaned
      // Replace multiple spaces with a single space
      .replace(/\s{2,}/g, ' ')
      // Remove unnecessary line breaks (except where used in tags)
      .replace(/(\r\n|\n|\r)/g, ' ')
      // Remove space between tags like </b> <i>
      //.replace(/>\s+</g, '><')
      // Avoid double <br> or <p> tags
      .replace(/(<br>\s*){2,}/g, '<br>')
      .replace(/(<p>\s*){2,}/g, '<p>')

      // Final trim
      .trim();

    return cleaned;
  }


  // translate() {
  //   if (!this.htmlContentForPreviousResult.trim()) return;

  //   if (this.arabicText) {
  //     $("#arabicModal").modal('show');
  //     return;
  //   }


  //   this.translationService.translateToArabic(this.htmlContentForPreviousResult).subscribe({
  //     next: (res) => {
  //       $("#arabicModal").modal('show');
  //       this.arabicText = res.translation;
  //     },
  //     error: () => {
  //       this.errorMessages = [];
  //       this.errorMessages.push('Translation failed. Try again.');
  //       if (this.errorMessages.length > 0) {
  //         $("#resultEntryValidationMsg").modal('show');
  //       }
  //     }
  //   });
  // }

  translate() {
    if (!this.htmlContentForPreviousResult.trim() || !this.selectedAIType) return;

    $("#arabicModal").modal('show');

    if (this.arabicText) {
      return;
    }

    const prompts: any = {
      arabic: `Translate the following radiology report from English to Arabic. Keep the medical meaning accurate and professional.
      Return only the translated content inside <div>...</div> without any extra text before or after the div`,

      detail:!this.showHisReport ? `Generate a patient-friendly detailed radiology report from the given input.Keep the medical meaning accurate and professional, Return only the report content wrapped inside <div>...</div> without any extra text before or after the div and report width 90% and use bright colors`:
      `Generate a patient-friendly detailed radiology report from the given input.Keep the medical meaning accurate and professional, Return only the report content wrapped inside <div>...</div> without any extra text before or after the div and report and use bright colors`,

      infographic: !this.showHisReport?`Generate a patient-friendly detailed radiology infographic report from the given input. Return only the infographic content wrapped inside <div>...</div> without any extra text before or after the div and dont add any + icons on Headers and report width 90% and use bright colors`:
      `Generate a patient-friendly detailed radiology infographic report from the given input. Return only the infographic content wrapped inside <div>...</div> without any extra text before or after the div and dont add any + icons on Headers and report and use bright colors`,
    };

    const payload = {
      prompt: prompts[this.selectedAIType],
      englishText: this.htmlContentForPreviousResult
    };

    this.translationService.generateAIReport(payload).subscribe({
      next: (res: any) => {
        if(res.Status==200)
        this.arabicText = res.translation || res.Output;
      else
        this.arabicText ="";
        this.errorMessages = ['AI generation failed. Try again.'];
      },
      error: () => {
        this.arabicText ="";
        this.errorMessages = ['AI generation failed. Try again.'];
      }
    });
  }

  saveArabicTextConfirmation() {
    $("#arabicTextSaveConfirmModal").modal('show');
  }

  saveArabicText() {
    const payload = {
      "TestOrderID": this.selectedPatientData.TestOrderID,
      "TestOrderItemID": this.selectedPatientData.TestOrderItemID,
      "ParameterID": this.parameterID,
      "AIGeneratedArabicResult": this.arabicText,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalID,
    };
    this.us.post('UpdateRadiologyAITestResults', payload).subscribe((response: any) => {
      if (response.Code == 200) {
        this.successMessage = "Arabic Text Saved Successfully";
        $("#resultEntrySavedMsg").modal('show');
        $("#arabicModal").modal('hide');
      }
    });
  }

  onAIOptionSelect(type: string) {
if (type === 'detail' || type === 'infographic') 
  this.showHisReport = false;
else
  this.showHisReport = true;  

  
  this.arabicText='';
    this.selectedAIType = type;
    this.translate();
  }

}