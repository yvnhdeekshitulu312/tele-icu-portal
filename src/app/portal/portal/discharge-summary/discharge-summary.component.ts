import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigService } from 'src/app/services/config.service';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
declare var $: any;
@Component({
  selector: 'app-discharge-summary',
  templateUrl: './discharge-summary.component.html',
  styleUrls: ['./discharge-summary.component.scss']
})
export class DischargeSummaryComponent implements OnInit, AfterViewInit {
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('Sign3Ref', { static: false }) signComponent3: SignatureComponent | undefined;

  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing: boolean = false;
  inputDynamicType = '';
  inputDynamicValue: any;
  @ViewChild('contentDiv') contentDiv!: ElementRef;
  @ViewChild('divDiagnosis') divDiagnosis!: ElementRef;
  @ViewChild('divHistory') divHistory!: ElementRef;
  @ViewChild('divResAdmission') divResAdmission!: ElementRef;
  @ViewChild('divTreatment') divTreatment!: ElementRef;
  @ViewChild('divHospital') divHospital!: ElementRef;
  @ViewChild('divComplications') divComplications!: ElementRef;
  @ViewChild('divConsultations') divConsultations!: ElementRef;
  @ViewChild('divRecommendations') divRecommendations!: ElementRef;
  @ViewChild('divFunctional') divFunctional!: ElementRef;
  @ViewChild('divAdvance') divAdvance!: ElementRef;
  @ViewChild('divDischargeStatus') divDischargeStatus!: ElementRef;
  @ViewChild('divPatientEducation') divPatientEducation!: ElementRef;
  @ViewChild('divDischargeInstructions') divDischargeInstructions!: ElementRef;
  @ViewChild('divAppointments') divAppointments!: ElementRef;
  @ViewChild('divFamilyAcknowledgment') divFamilyAcknowledgment!: ElementRef;
  @Output() savechanges = new EventEmitter<any>();
  ObgGynDischargeSummaryID = 0;
  textareaHistoryofPresentIllnessContent = "";
  Diagnosis: any;
  OnExamination: any;
  ReasonforAdmission: any;
  TreatmentandProcedures: any;
  MedicationDuringAdmission: any;
  LabTests: any;
  DischargeMedication: any;
  AllergyDataHTML: any;
  HospitalCourse: any;
  Complications: any;
  Consultations: any;
  RecommendationsFollowUpCare: any;
  FunctionalStatus: any;
  AdvanceDirectives: any;
  DischargeStatus: any;
  PatientEducation: any;
  DischargeInstructions: any;
  FollowUpAppointments: any;
  PatientandFamilyAcknowledgment: any;
  facility: any;
  langData: any;
  patientDetails: any;
  hospId: any;
  doctorDetails: any;
  selectedView: any;
  AdmissionID: any;
  PatientID: any;
  doctorID: any;
  DoctorName: any;
  DoctorSpecialisation: any;
  DocEmpNo: any;
  trustedUrl: any;
  private subscription: Subscription;
  spanErrorList: any = [];
  base64StringSig2 = '';
  showSignature: boolean = true;
  doctorSignature:any;
  handleFormClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  this.inputDynamicType = '';

    if (target && target.tagName === 'SPAN') {
      setTimeout(() => {
        this.inputDynamicType = target.classList.value;
        this.inputDynamicValue = target.textContent;
        this.config.triggerDynamicUpdate(false);
        $("#modalDynamic").modal('show');
      }, 500);
    }
  }
  constructor(private config: ConfigService, private renderer: Renderer2) {
    this.langData = this.config.getLangData();
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    this.hospId = sessionStorage.getItem("hospitalId");
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.PatientID = this.selectedView.PatientID;
    this.AdmissionID = this.selectedView.AdmissionID;
    if(this.selectedView.PatientType == "2") {
      this.AdmissionID = this.selectedView.IPID;
    }
    this.doctorID = this.doctorDetails[0].EmpId;
    this.DoctorName = this.doctorDetails[0].EmployeeName;
    this.DoctorSpecialisation = this.doctorDetails[0].EmpSpecialisation;
    this.DocEmpNo = this.doctorDetails[0].EmpNo;
    
    this.subscription = this.config.trigger$.subscribe(status => {
      if(status) {
        this.saveDischargeSummary();
      }
    });
    this.subscription = this.config.triggerPrint$.subscribe(status => {
      if(status) {
        this.DischargeSummaryPrint();
      }
    });

   }

  ngOnInit(): void {
    this.FetchPatientObGDisSummaryTempData();
  }

  ngAfterViewInit(): void {
    const canvas = this.signatureCanvas.nativeElement;
    if (canvas) {
      this.ctx = this.signatureCanvas.nativeElement.getContext('2d');
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    this.renderer.listen(this.signatureCanvas.nativeElement, 'mousedown', (event) => this.startDrawing(event));
    this.renderer.listen(this.signatureCanvas.nativeElement, 'mousemove', (event) => this.draw(event));
    this.renderer.listen(this.signatureCanvas.nativeElement, 'mouseup', () => this.endDrawing());

    // Touch events
    this.renderer.listen(this.signatureCanvas.nativeElement, 'touchstart', (event) => this.startDrawing(event));
    this.renderer.listen(this.signatureCanvas.nativeElement, 'touchmove', (event) => this.draw(event));
    this.renderer.listen(this.signatureCanvas.nativeElement, 'touchend', () => this.endDrawing());
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.isDrawing = true;
    const pos = this.getCursorPosition(event);
    if(this.ctx) {
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
    }
  }

  draw(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    if (this.isDrawing) {
      const pos = this.getCursorPosition(event);
      if(this.ctx) {
        this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
      }
    }
  }

  endDrawing() {
    this.isDrawing = false;
  }

  getCursorPosition(event: MouseEvent | TouchEvent) {
    let clientX, clientY;

    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (event instanceof TouchEvent) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    const canvasRect = this.signatureCanvas.nativeElement.getBoundingClientRect();
    return {
      x: (clientX !== undefined ? clientX : 0) - canvasRect.left,
      y: (clientY !== undefined ? clientY : 0) - canvasRect.top
    };
  }

  clearSignature() {
    if (this.ctx) {
      const canvas = this.signatureCanvas.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  saveSignature() {
    if (this.ctx) {
      const canvas = this.signatureCanvas.nativeElement;
      const imageData = canvas.toDataURL();
    }
  }

  receivedData(data: { spanid: any, content: any }) {
    $("#modalDynamic").modal('hide');

    const divContent = this.contentDiv.nativeElement;
    const spanElements = divContent.querySelectorAll('span');

    spanElements.forEach((span: Element) => {
      if (span.classList.contains(data.spanid)) {
        this.renderer.setProperty(span, 'textContent', data.content);
      } 
    });
  }

  FetchPatientObGDisSummaryTempData() {
    var FetchPatientObgDischargeSummaryDataaList: any;
    this.config.FetchPatientObgDischargeSummary(this.AdmissionID, this.hospId).subscribe(response => {
      if(response.Code == 200 && response.FetchPatientObgDischargeSummaryDataaList.length === 0) {
        this.config.FetchPatientObGDisSummaryTempData(this.AdmissionID, this.hospId).subscribe(response => {
          if(response.Code == 200) {
            FetchPatientObgDischargeSummaryDataaList = response.FetchPatientObGDisSummaryTempDataDataaList[0];
            this.textareaHistoryofPresentIllnessContent = FetchPatientObgDischargeSummaryDataaList.HistoryofPresentIllness + "<br><br>"+FetchPatientObgDischargeSummaryDataaList.OnExamination;
            this.Diagnosis = FetchPatientObgDischargeSummaryDataaList.Diagnosis;
            this.OnExamination = FetchPatientObgDischargeSummaryDataaList.OnExamination;
            this.ReasonforAdmission = FetchPatientObgDischargeSummaryDataaList.ReasonforAdmission;
            this.TreatmentandProcedures = FetchPatientObgDischargeSummaryDataaList.TreatmentandProcedures;
            this.MedicationDuringAdmission = FetchPatientObgDischargeSummaryDataaList.MedicationDuringAdmission;
            this.LabTests = FetchPatientObgDischargeSummaryDataaList.LabTests;
            this.DischargeMedication = FetchPatientObgDischargeSummaryDataaList.DischargeMedication;
            this.AllergyDataHTML = FetchPatientObgDischargeSummaryDataaList.AllergyData;
            this.HospitalCourse = FetchPatientObgDischargeSummaryDataaList.HospitalCourse;
            this.Complications = FetchPatientObgDischargeSummaryDataaList.Complications;
            this.Consultations = FetchPatientObgDischargeSummaryDataaList.Consultations;
            this.RecommendationsFollowUpCare = FetchPatientObgDischargeSummaryDataaList.RecommendationsFollowUpCare;
            this.FunctionalStatus = FetchPatientObgDischargeSummaryDataaList.FunctionalStatus;
            this.AdvanceDirectives = FetchPatientObgDischargeSummaryDataaList.AdvanceDirectives;
            this.DischargeStatus = FetchPatientObgDischargeSummaryDataaList.DischargeStatus;
            this.PatientEducation = FetchPatientObgDischargeSummaryDataaList.PatientEducation;
            this.DischargeInstructions = FetchPatientObgDischargeSummaryDataaList.DischargeInstructions;
            this.FollowUpAppointments = FetchPatientObgDischargeSummaryDataaList.FollowUpAppointments;
            this.PatientandFamilyAcknowledgment = FetchPatientObgDischargeSummaryDataaList.PatientandFamilyAcknowledgment;
            this.base64StringSig2=FetchPatientObgDischargeSummaryDataaList.DocsignBase64;
            this.showSignature = false; // to load the common component
            setTimeout(() => {
              this.showSignature = true;
            }, 0);
          }
        })
      }
      else if(response.Code == 200) {
        this.ObgGynDischargeSummaryID = response.FetchPatientObgDischargeSummaryDataaList[0].ObgGynDischargeSummaryID
        FetchPatientObgDischargeSummaryDataaList = response.FetchPatientObgDischargeSummaryDataaList[0];
        this.textareaHistoryofPresentIllnessContent = FetchPatientObgDischargeSummaryDataaList.HistoryOfPresentIllness+ "<br><br>"+FetchPatientObgDischargeSummaryDataaList.OnExamination;
        this.Diagnosis = FetchPatientObgDischargeSummaryDataaList.Diagnosis;
        // this.OnExamination = FetchPatientObgDischargeSummaryDataaList.OnExamination;
        this.ReasonforAdmission = FetchPatientObgDischargeSummaryDataaList.ReasonForAdmission;
        this.TreatmentandProcedures = FetchPatientObgDischargeSummaryDataaList.TreatmentAndProcedures;
        this.MedicationDuringAdmission = FetchPatientObgDischargeSummaryDataaList.MedicationDuringAdmission;
        this.LabTests = FetchPatientObgDischargeSummaryDataaList.LabTests;
        this.DischargeMedication = FetchPatientObgDischargeSummaryDataaList.DischargeMedication;
        this.AllergyDataHTML = FetchPatientObgDischargeSummaryDataaList.AllergiesAndAdverseReactions;
        this.HospitalCourse = FetchPatientObgDischargeSummaryDataaList.HospitalCourse;
        this.Complications = FetchPatientObgDischargeSummaryDataaList.Complications;
        this.Consultations = FetchPatientObgDischargeSummaryDataaList.Consultations;
        this.RecommendationsFollowUpCare = FetchPatientObgDischargeSummaryDataaList.RecommendationsAndFollowUpCare;
        this.FunctionalStatus = FetchPatientObgDischargeSummaryDataaList.FunctionalStatus;
        this.AdvanceDirectives = FetchPatientObgDischargeSummaryDataaList.AdvanceDirectives;
        this.DischargeStatus = FetchPatientObgDischargeSummaryDataaList.DischargeStatus;
        this.PatientEducation = FetchPatientObgDischargeSummaryDataaList.PatientEducation;
        this.DischargeInstructions = FetchPatientObgDischargeSummaryDataaList.DischargeInstructions;
        this.FollowUpAppointments = FetchPatientObgDischargeSummaryDataaList.FollowUpAppointments;
        this.PatientandFamilyAcknowledgment = FetchPatientObgDischargeSummaryDataaList.PatientAndFamilyAcknowledgment;
        this.base64StringSig2=FetchPatientObgDischargeSummaryDataaList.DocsignBase64;
        this.showSignature = false; // to load the common component
            setTimeout(() => {
              this.showSignature = true;
            }, 0);
      }

      
    });
  }
  DischargeSummaryPrint() {   
      
      this.config.FetchPatientObgDischargeSummaryPrint(this.AdmissionID, this.hospId).subscribe((response) => {
        if (response.Code == 200) {
          this.trustedUrl = response.FTPPATH;
          $("#showLabReportsModal").modal('show');
        }
      },
        (err) => {
  
        })
    
  }

  saveDischargeSummary(){
   
    if(this.MandatoryCheck()) {
      $("#errorMessageModal").modal('show');
      return;
    }
    
    let payload = {
      "ObgGynDischargeSummaryID": this.ObgGynDischargeSummaryID,
      "PatientID": this.PatientID,
      "AdmissionId": this.AdmissionID,
      "DoctorId": this.doctorID,
      "BedID": this.selectedView.BedID,
      "Diagnosis": this.divDiagnosis.nativeElement.innerHTML,
      "HistoryOfPresentIllness": this.divHistory.nativeElement.innerHTML,
      "ReasonForAdmission": this.divResAdmission.nativeElement.innerHTML,
      "TreatmentAndProcedures": this.divTreatment.nativeElement.innerHTML,
      "AllergiesAndAdverseReactions": this.AllergyDataHTML,
      "HospitalCourse": this.divHospital.nativeElement.innerHTML,
      "Complications": this.divComplications.nativeElement.innerHTML,
      "Consultations": this.divConsultations.nativeElement.innerHTML,
      "RecommendationsAndFollowUpCare": this.divRecommendations.nativeElement.innerHTML,
      "FunctionalStatus": this.divFunctional.nativeElement.innerHTML,
      "AdvanceDirectives": this.divAdvance.nativeElement.innerHTML,
      "DischargeStatus": this.divDischargeStatus.nativeElement.innerHTML,
      "PatientEducation": this.divPatientEducation.nativeElement.innerHTML,
      "DischargeInstructions": this.divDischargeInstructions.nativeElement.innerHTML,
      "FollowUpAppointments": this.divAppointments.nativeElement.innerHTML,
      "PatientAndFamilyAcknowledgment": this.divFamilyAcknowledgment.nativeElement.innerHTML,
      "DocsignBase64": this.doctorSignature,
      "UserId": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID,
      "HospitalId": this.hospId
    };

    this.config.SavePatientObGDischargeSummary(payload).subscribe((data) => {
      $("#saveMsg").modal("show");
      this.FetchPatientObGDisSummaryTempData();
    })
  }

  SaveData() { 
    this.savechanges.emit();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  Update() {
    this.config.triggerDynamicUpdate(true);
  }

  MandatoryCheck() : boolean {
    const divContent = this.contentDiv.nativeElement;
    const spanElements = divContent.querySelectorAll('span');

    this.spanErrorList = [];

    spanElements.forEach((span: Element) => {
      const classListArray = Array.from(span.classList);
      let hasMandatoryClass = false;
    
      for (const className of classListArray) {
        if (className.includes('Mandatory')) {
          hasMandatoryClass = true;
          break;
        }
      }
    
      if (hasMandatoryClass && !span.innerHTML.trim()) {
        this.spanErrorList.push(span.className.split('_')[3]);
      }
    });

    if(this.spanErrorList.length > 0) {
      return true;
    }
    else {
      return false;
    }
  }
  fetchDoctorSignature() {
    this.config.FetchEmployeeSignaturesBase64(this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, 3392, this.hospId)
      .subscribe((response: any) => {
        this.base64StringSig2 = response.FetchEmployeeSignaturesBase64DList[0].Base64Signature;
        this.doctorSignature =response.FetchEmployeeSignaturesBase64DList[0].Base64Signature;
        this.showSignature = false; // to load the common component
            setTimeout(() => {
              this.showSignature = true;
            }, 0);

      },
        (err) => {
        })
  }
  base64DoctorSignature(event: any) {
   // this.generalConsentForm.patchValue({ PatientOrRepresentativeSignature: event });
   this.doctorSignature = event;
  }
  clearR3Signature() {
    if (this.signComponent3) {
      this.signComponent3.clearSignature();     
      //this.generalConsentForm.patchValue({ Signature2: '' });
    }
  }

}
