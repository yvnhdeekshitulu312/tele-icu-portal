import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import moment from 'moment';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { ConfigService } from 'src/app/services/config.service';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from '../utility.service';
import { Router } from '@angular/router';
import { PatientfolderService } from '../patientfolder/patientfolder.service';
import { patientfolder } from '../patientfolder/patientfolder.component';
import { ValidateEmployeeComponent } from '../validate-employee/validate-employee.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;

@Component({
    selector: 'app-inpatient-discharge-summary',
    templateUrl: './inpatient-discharge-summary.component.html'
})
export class InPatientDischargeSummaryComponent implements OnInit, AfterViewInit {
    @ViewChild('Sign3Ref', { static: false }) signComponent3: SignatureComponent | undefined;
    @ViewChild('contentDiv') contentDiv!: ElementRef;
    @ViewChild('divDiagnosis') divDiagnosis!: ElementRef;
    @ViewChild('divHistory') divHistory!: ElementRef;
    @ViewChild('divComplaints') divComplaints!: ElementRef;
    @ViewChild('divExaminations') divExaminations!: ElementRef;
    @ViewChild('divInvestigation') divInvestigation!: ElementRef;
    @ViewChild('divTreatment') divTreatment!: ElementRef;
    @ViewChild('divDischargeStatus') divDischargeStatus!: ElementRef;
    @ViewChild('divMedication') divMedication!: ElementRef;
    @ViewChild('divRecommendation') divRecommendation!: ElementRef;
    @Output() savechanges = new EventEmitter<any>();
    @Input() data: any;
    fromBedsBoard = false;

    inputDynamicType = '';
    inputDynamicValue: any;
    SummaryID = 0;
    isVerified: boolean = false;
    VerifiedBy: any = '';
    VerifiedByName: any = '';
    VerifiedDate: any = '';
    errorMessage: any = '';
    Diagnosis: any;
    History: any;
    ChiefComplaints: any;
    Examinations: any;
    Investigation: any;
    HospitalCourseAndTreatment: any;
    StatusOnDischarge: any;
    DischargeMedication: any;
    Recommendation: any;

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
    spanErrorList: any = [];
    showSignature: boolean = true;
    doctorSignature: any;
    base64StringSig2 = '';
    patientVisits: any = [];
    SelectedViewClass: string;
    VisitID: any;
    patientSelected: boolean = true;
    isFromSuitPage = false;
    showPatientdata = false;
    ChiefComplaintCaseSheet: any;
    PhysicalExaminationCaseSheet: any;
    DischargeSummary: string = "Discharge Summary";
    IsHeadNurse: any;
    IsHome = true;
    FetchPatientDischargeSummaryDataList: any;
    FetchPatientDischargeSummaryDataList1: any;
    readonly = false;
    investigationData: any;
    investigationsList: any;
    virtualDischarges: any = [];
    virtualDischargeId = 0;
    patientMedications: any = [];
    showPreValidation: boolean = false;
    selectedFetchPatientAdmissionMedications: any = [];
    isClear: any = true;
    patientMedications1: any = [];
    btnSave = "Save";

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

    constructor(private config: ConfigService, private renderer: Renderer2, private medicalAssessmentService: MedicalAssessmentService, private utilityService: UtilityService, private router: Router, private patientfolderService: PatientfolderService, private modalSvc: NgbModal) {
        this.langData = this.config.getLangData();
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.hospId = sessionStorage.getItem("hospitalId");
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
        this.PatientID = this.selectedView.PatientID;
        this.isFromSuitPage = sessionStorage.getItem("fromSuitPage") === "true" ? true : false;
        if (sessionStorage.getItem("PatientID")) {
            this.fromBedsBoard = true;
        }
        this.AdmissionID = this.selectedView.AdmissionID;
        if (this.selectedView.PatientType == "2") {
            this.AdmissionID = this.selectedView.IPID;
        }
        // this.doctorID = this.doctorDetails[0].EmpId;
        // this.DoctorName = this.doctorDetails[0].EmployeeName;
        // this.DoctorSpecialisation = this.doctorDetails[0].EmpSpecialisation;
        // this.DocEmpNo = this.doctorDetails[0].EmpNo;

        if (this.selectedView.PatientType == "2") {
            if (this.selectedView?.Bed.includes('ISO')) {
                this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
            }
            else {
                this.SelectedViewClass = "m-0 fw-bold alert_animate token";
            }
        } else {
            this.SelectedViewClass = "m-0 fw-bold alert_animate token";
        }
    }

    ngOnInit(): void {
        if (this.data) {
            this.readonly = this.data.readonly;
            this.AdmissionID = this.data.admissionID;
        }
        this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
        if (this.isFromSuitPage) {
            this.fromBedsBoard = true;
            this.patientSelected = false;
        }
        else {
            this.FetchPatientDisSummaryData();
            this.fetchPatientVisits();
        }
    }

    ngAfterViewInit(): void {
    }

    fetchPatientVisits() {
        const url = this.patientfolderService.getData(patientfolder.FetchPatientVisitsPFMRD, { Patientid: this.PatientID, WorkStationID: this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, HospitalID: this.hospId });
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.patientSelected = true;
                    this.patientVisits = response.PatientVisitsDataList.filter((x: any) => x.PatientType != '1');
                    const visit = response.PatientVisitsDataList.find((item: any) => item.AdmissionID === this.AdmissionID);
                    if (visit) {
                        this.VisitID = this.AdmissionID;
                    } else {
                        this.AdmissionID = response.PatientVisitsDataList[0].AdmissionID;
                        this.VisitID = this.AdmissionID;
                        this.FetchPatientDisSummaryData();
                    }
                    this.fetchPatientVistitInfo(this.AdmissionID, this.PatientID);
                }
            },
                (err) => {
                })
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

    FetchPatientDisSummaryData() {
        this.SummaryID = 0;
        this.isVerified = false;
        this.FetchPatientDischargeSummaryDataList = null;
        this.investigationData = '';
        this.config.FetchPatientDischargeSummary(this.AdmissionID, this.hospId, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID).subscribe(response => {
            if (response.Code === 200 && response.FetchPatientDischargeSummaryDataList.length === 0) {
                this.config.FetchPatientObGDisSummaryTempData(this.AdmissionID, this.hospId).subscribe(response => {
                    if (response.Code == 200) {
                        const FetchPatientObgDischargeSummaryDataaList = response.FetchPatientObGDisSummaryTempDataDataaList[0];
                        this.Diagnosis = FetchPatientObgDischargeSummaryDataaList.Diagnosis;
                        this.History = FetchPatientObgDischargeSummaryDataaList.HistoryofPresentIllness;
                        this.Examinations = ''; //FetchPatientObgDischargeSummaryDataaList.OnExamination;
                        this.Investigation = '';
                        this.HospitalCourseAndTreatment = ''; //FetchPatientObgDischargeSummaryDataaList.HospitalCourse + "<br><br>" + FetchPatientObgDischargeSummaryDataaList.TreatmentandProcedures;
                        this.StatusOnDischarge = FetchPatientObgDischargeSummaryDataaList.DischargeStatus;
                        //this.DischargeMedication = FetchPatientObgDischargeSummaryDataaList.DischargeMedication;
                        this.selectedFetchPatientAdmissionMedications = JSON.parse(FetchPatientObgDischargeSummaryDataaList.DischargeMedication);
                        this.Recommendation = FetchPatientObgDischargeSummaryDataaList.RecommendationsFollowUpCare;
                        this.base64StringSig2 = FetchPatientObgDischargeSummaryDataaList.doctorSignature;
                        this.showSignature = false;
                        //this.Investigation = FetchPatientObgDischargeSummaryDataaList.LabTests;

                        //this.doctorID = FetchPatientObgDischargeSummaryDataaList.DoctorID;
                        // this.DoctorName = FetchPatientObgDischargeSummaryDataaList.DoctorName;
                        // this.DoctorSpecialisation = FetchPatientObgDischargeSummaryDataaList.Specialisation;
                        // this.DocEmpNo = FetchPatientObgDischargeSummaryDataaList.DoctorName.split(' -')[0];

                        setTimeout(() => {
                            this.showSignature = true;
                        }, 0);
                        this.patientSelected = true;
                    }
                });

                const commonUrl = this.medicalAssessmentService.getData(otPatientDetails.FetchTemplateDefaultData, { AdmissionID: this.AdmissionID, PatientId: this.PatientID, UserID: this.doctorDetails[0].UserId, WorkStationID: this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, HospitalID: this.hospId });
                this.utilityService.get(commonUrl).subscribe(response => {
                    this.ChiefComplaints = response?.FetcTemplateDefaultDataListM[0]?.ChiefComplaint ?? '';
                    this.ChiefComplaintCaseSheet = response?.FetcTemplateDefaultDataListM[0]?.ChiefComplaintCaseSheet ?? '';
                    this.PhysicalExaminationCaseSheet = response?.FetcTemplateDefaultDataListM[0]?.PhysicalExaminationCaseSheet ?? '';
                    this.investigationData = response?.FetcTemplateDefaultDataListM[0]?.Investigations ?? ''
                });

            }
            else if (response.Code == 200 && response.FetchPatientDischargeSummaryDataList.filter((x: any) => x.IsCNHI == 'False').length > 0) {
                if(this.virtualDischarges.length === 0) {
                    this.btnSave = "Modify";
                }
                
                const commonUrl = this.medicalAssessmentService.getData(otPatientDetails.FetchTemplateDefaultData, { AdmissionID: this.AdmissionID, PatientId: this.PatientID, UserID: this.doctorDetails[0].UserId, WorkStationID: this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, HospitalID: this.hospId });
                this.utilityService.get(commonUrl).subscribe(response => {
                    this.investigationData = response?.FetcTemplateDefaultDataListM[0]?.Investigations ?? ''
                });
                this.FetchPatientDischargeSummaryDataList1 = response.FetchPatientDischargeSummaryDataList.filter((x: any) => x.IsCNHI == 'False');
                const oldDisSummData = response.FetchPatientDischargeSummaryDataList.filter((x: any) => x.IsCNHI == 'False');
                let disSummData = oldDisSummData[0];
                if(this.virtualDischargeId != 0) {
                    disSummData = response.FetchPatientDischargeSummaryDataList.find((x: any) => x.VirtualDischargeID == this.virtualDischargeId);
                }
                const FetchPatientDischargeSummaryDataList = disSummData;
                this.FetchPatientDischargeSummaryDataList = disSummData;
                this.SummaryID = FetchPatientDischargeSummaryDataList.SummaryID;
                this.Diagnosis = FetchPatientDischargeSummaryDataList.Diagnosis;
                this.History = FetchPatientDischargeSummaryDataList.History;
                this.ChiefComplaintCaseSheet = FetchPatientDischargeSummaryDataList.ChiefComplaints;
                this.PhysicalExaminationCaseSheet = FetchPatientDischargeSummaryDataList.Examinations;
                this.Investigation = FetchPatientDischargeSummaryDataList.Investigation;
                this.HospitalCourseAndTreatment = FetchPatientDischargeSummaryDataList.HospitalCourseAndTreatment;
                this.StatusOnDischarge = FetchPatientDischargeSummaryDataList.StatusOnDischarge;
                //this.DischargeMedication = FetchPatientDischargeSummaryDataList.DischargeMedication;
                this.selectedFetchPatientAdmissionMedications = JSON.parse(FetchPatientDischargeSummaryDataList.DischargeMedication);
                this.Recommendation = FetchPatientDischargeSummaryDataList.Recommendation;
                this.base64StringSig2 = FetchPatientDischargeSummaryDataList.doctorSignature;
                this.doctorSignature = FetchPatientDischargeSummaryDataList.doctorSignature;
                this.showSignature = false;
                this.VerifiedBy = FetchPatientDischargeSummaryDataList.VerifiedBy;
                this.VerifiedByName = FetchPatientDischargeSummaryDataList.VerifiedByName;
                this.VerifiedDate = FetchPatientDischargeSummaryDataList.VerifiedDate;

                this.doctorID = FetchPatientDischargeSummaryDataList.DoctorID;
                this.DoctorName = FetchPatientDischargeSummaryDataList.DoctorName;
                this.DoctorSpecialisation = FetchPatientDischargeSummaryDataList.Specialisation;
                this.DocEmpNo = FetchPatientDischargeSummaryDataList.DoctorName.split(' -')[0];


                if (FetchPatientDischargeSummaryDataList.VerifiedBy !== '0' && FetchPatientDischargeSummaryDataList.VerifiedBy !== '') {
                    if (FetchPatientDischargeSummaryDataList.STATUS === '1') {
                        this.isVerified = true;
                    }
                };
                setTimeout(() => {
                    this.showSignature = true;
                }, 0);
                this.patientSelected = true;
            }
        });
    }
    DischargeSummaryPrint() {
        // TODO
    }

    clearDischargeSummary() {
        $("#txtSsn").val('');
        this.patientSelected = false;
        this.patientVisits = [];
        this.virtualDischarges = [];
        this.virtualDischargeId = 0;
        this.selectedFetchPatientAdmissionMedications = [];
    }

    navigatetoBedBoard1() {
        sessionStorage.setItem("FromEMR", "false");
        sessionStorage.removeItem("PatientID");
        sessionStorage.removeItem("fromSuitPage");
        this.router.navigate(['/ward']);
    }
    navigatetoBedBoard() {
        if (this.IsHeadNurse == 'true' && !this.IsHome)
          this.router.navigate(['/emergency/beds']);
        else
          this.router.navigate(['/ward']);
        sessionStorage.setItem("FromEMR", "false");
      }

    saveDischargeSummary() {
        if (this.MandatoryCheck()) {
            $("#errorMessageModal").modal('show');
            return;
        }

        let payload = {
            "SummaryID": this.SummaryID,
            "PatientID": this.PatientID,
            "AdmissionID": this.AdmissionID,
            "DoctorID":this.selectedView.ConsultantID,// this.doctorID==undefined?this.doctorDetails[0].EmpId:this.doctorID,
            "SpecialiseID": this.selectedView.SpecialiseID,//this.doctorDetails[0].EmpSpecialisationId,
            "Diagnosis": this.divDiagnosis.nativeElement.innerHTML,
            "History": this.divHistory.nativeElement.innerHTML,
            "ChiefComplaints": this.divComplaints.nativeElement.innerHTML,
            "Examinations": this.divExaminations.nativeElement.innerHTML,
            "Investigation": this.divInvestigation.nativeElement.innerHTML,
            "HospitalCourseAndTreatment": this.divTreatment.nativeElement.innerHTML,
            "StatusOnDischarge": this.divDischargeStatus.nativeElement.innerHTML,
            "DischargeMedication": JSON.stringify(this.selectedFetchPatientAdmissionMedications),//this.divMedication.nativeElement.innerHTML,
            "Recommendation": this.divRecommendation.nativeElement.innerHTML,
            "PreparedDate": moment(new Date()).format('DD-MMM-YYYY HH:mm'),
            "PreparedBy": this.doctorDetails[0].UserId,
            "HospitalID": this.hospId,
            "status": "0",
            "USERID": this.doctorDetails[0].UserId,
            "WORKSTATIONID": this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID,
            "Signature": this.doctorSignature,
            "VerifiedBy" : this.selectedView.ConsultantID,
            "VirtualDischargeID" : this.virtualDischargeId
        };

        this.config.SavePatientDischargeSummary(payload).subscribe((response) => {
            if (response.Code === 200) {
                $("#saveMsg").modal("show");
                this.FetchPatientDisSummaryData();
            }
        });
    }

    SaveData() {
        this.savechanges.emit();
    }

    ngOnDestroy() {
        sessionStorage.removeItem("PatientID");
    }

    Update() {
        this.config.triggerDynamicUpdate(true);
    }

    MandatoryCheck(): boolean {
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

        if (this.spanErrorList.length > 0) {
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
                this.doctorSignature = response.FetchEmployeeSignaturesBase64DList[0].Base64Signature;
                this.showSignature = false; // to load the common component
                setTimeout(() => {
                    this.showSignature = true;
                }, 0);

            },
                (err) => {
                })
    }

    base64DoctorSignature(event: any) {
        this.doctorSignature = event;
    }

    clearR3Signature() {
        if (this.signComponent3) {
            this.signComponent3.clearSignature();
        }
    }

    onVisitsChange(event: any) {
        const patientData = this.patientVisits.find((visit: any) => visit.AdmissionID == event.target.value);
        this.AdmissionID = event.target.value;
        this.FetchPatientDisSummaryData();
        this.fetchPatientVistitInfo(this.AdmissionID, patientData.PatientID);
    }

    fetchPatientVistitInfo(admissionid: any, patientid: any) {
        const url = this.patientfolderService.getData(patientfolder.FetchPatientVistitInfo, { Patientid: patientid, Admissionid: admissionid, HospitalID: this.hospId });
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.selectedView = response.FetchPatientVistitInfoDataList[0];

                    this.doctorID = this.selectedView.ConsultantID;
                    this.DoctorName = this.selectedView.PrimaryDoctor;
                    //this.DoctorSpecialisation = this.doctorDetails[0].EmpSpecialisation;
                     this.DocEmpNo = this.selectedView.EmpNo;

                     this.virtualDischarges = response.FetchPatientVistitVirtualDischargeInfoDataList.filter((x: any) => x.STATUS != '1');

                }
                if (this.selectedView.PatientType == "2") {
                    if (this.selectedView?.Bed.includes('ISO'))
                        this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
                    else
                        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
                } else {
                    this.SelectedViewClass = "m-0 fw-bold alert_animate token";
                }
            },
                (err) => {

                })
    }

    onEnterPress(event: any) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            this.fetchPatientDetailsBySsn(event);
        }
    }

    fetchPatientDetailsBySsn(event: any) {
        this.AdmissionID = '';
        var inputval = event.target.value;
        var ssn = "0"; var mobileno = "0"; var patientid = "0";
        this.virtualDischargeId = 0;
        if (inputval.charAt(0) === "0") {
            ssn = "0";
            mobileno = inputval;
            patientid = "0";
        }
        else {
            ssn = inputval;
            mobileno = "0";
            patientid = "0";
        }
        this.fetchPatientDetails(ssn, mobileno, patientid)
    }

    fetchPatientDetails(ssn: string, mobileno: string, patientId: string) {
        const url = this.patientfolderService.getData(patientfolder.fetchPatientDataBySsn, {
            SSN: ssn,
            MobileNO: mobileno,
            PatientId: patientId,
            UserId: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID,
            HospitalID: this.hospId
        });
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    if (ssn === '0') {
                        this.PatientID = response.FetchPatientDependCLists[0].PatientID;
                        this.selectedView = response.FetchPatientDependCLists[0];
                    }
                    else if (mobileno === '0') {
                        this.PatientID = response.FetchPatientDataCCList[0].PatientID;
                        this.selectedView = response.FetchPatientDataCCList[0];
                    }
                    this.utilityService.setAlertPatientId(this.PatientID);
                    this.fetchPatientVisits();
                }
            },
                (err) => {

                })
    }

    isSaveDisable() {
        if (this.AdmissionID === this.patientVisits[0]?.AdmissionID) {
            if (this.FetchPatientDischargeSummaryDataList && this.FetchPatientDischargeSummaryDataList.PreparedBy.toString() !== this.doctorDetails[0].UserId.toString()) {
                return true;
            }
            return false;
        }
        return true;
    }
    
    PrintDischargeSummary() {
        if(this.virtualDischarges.length > 0 && this.virtualDischargeId == 0) {            
            this.errorMessage = "Please select Virtual discharge to print";
            $('#errorMsg').modal('show');      
            return;      
        }
        this.FetchPatientCaseRecord();
        this.showCareRecordModal();
    }
    FetchPatientCaseRecord() {
        this.config.FetchPatientDischargeSummaryPrint(this.AdmissionID, this.virtualDischargeId, this.hospId, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.trustedUrl = response?.FTPPATH;
                }
            },
                (err) => {
                })
    }
    showCareRecordModal() {
        $("#caseRecordModal").modal('show');
    }

    showCaseRecord() {
        this.DischargeSummary = "Case Record";
        this.FetchPatientCaseRecordPPP(this.AdmissionID, this.selectedView.PatientID);
        this.showCareRecordModalPP();
    }

    FetchPatientCaseRecordPPP(admid: any, patintieid: any) {
        this.config.FetchPatientCaseRecord(admid, patintieid, 0, 3000, this.doctorDetails[0]?.UserId, 3403, this.hospId)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.trustedUrl = response?.FTPPATH;
                }
            },
                (err) => {

                })
    }

    showCareRecordModalPP() {
        $("#caseRecordModal").modal('show');
    }

    verifyIssuedBy() {
        // if (this.FetchPatientDischargeSummaryDataList.PreparedBy.toString() === this.doctorDetails[0].UserId.toString()) {
        //     this.errorMessage = "Issued User & Verify User should not be same ";
        //     $("#errorMsg").modal('show');
        //     return;
        // }

        const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
            if (data.success) {
                this.updateVerifiedByUser();
            }
            modalRef.close();
        });
    }

    updateVerifiedByUser() {
        this.isVerified = !this.isVerified;
        var payload = {
            "SummaryID": this.SummaryID,
            "AdmissionID": this.AdmissionID,
            "VerifiedBy": this.isVerified ? this.doctorDetails[0].UserId : '0',//this.isVerified ? this.doctorDetails[0].EmpId : '0',
            "UnverifiedBy": this.isVerified ? "0" : this.doctorDetails[0].UserId,//this.isVerified ? "0" : this.doctorDetails[0].EmpId,
            "VerifiedSignature": "",
            "Status": this.isVerified ? 1 : 0,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID,
            "Hospitalid": this.hospId
        };
        this.config.VerifyDischargeSummary(payload)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.FetchPatientDisSummaryData();
                    $("#saveMsg").modal('show');
                } else {
                    this.isVerified = !this.isVerified;
                }
            },
            () => {

            });
    }

    addInvestigationsList() {
        this.investigationsList = [];
        if (this.investigationData) {
            this.investigationsList = this.investigationData.split(',').map((item: any) => {
                return {
                    selected: false,
                    name: item
                };
            });
            $('#investigations_modal').modal('show');
        } else {
            this.errorMessage = "No Investigations Found."
            $('#errorMsg').modal('show');
        }
    }

    onSelectInvestigations() {
        const findItems = this.investigationsList.filter((item: any) => item.selected);
        if (findItems.length > 0) {
            const data = findItems.map((a: any) => a.name).join('<br>*');;
            if (this.divInvestigation.nativeElement.innerHTML.trim() === "") {
                this.divInvestigation.nativeElement.innerHTML += `${data}`;
            } else {
                this.divInvestigation.nativeElement.innerHTML += `<br>${data}`;
            }
            $('#investigations_modal').modal('hide');
        } else {
            this.errorMessage = "Please Select Investigations."
            $('#errorMsg').modal('show');
        }
    }
    NewDischargeSummaryReport() {       
        this.FetchPatientDisSummaryDataNew();
        this.fetchPatientVisits();
    }

    FetchPatientDisSummaryDataNew() {
        this.SummaryID = 0;
        this.isVerified = false;
        this.FetchPatientDischargeSummaryDataList = null;
        this.investigationData = '';
        this.config.FetchPatientDischargeSummary(this.AdmissionID, this.hospId, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID).subscribe(response => {
           
                this.config.FetchPatientObGDisSummaryTempData(this.AdmissionID, this.hospId).subscribe(response => {
                    if (response.Code == 200) {
                        const FetchPatientObgDischargeSummaryDataaList = response.FetchPatientObGDisSummaryTempDataDataaList[0];
                        this.Diagnosis = FetchPatientObgDischargeSummaryDataaList.Diagnosis;
                        this.History = FetchPatientObgDischargeSummaryDataaList.HistoryofPresentIllness;
                        this.Examinations = ''; 
                        this.Investigation = '';
                        this.HospitalCourseAndTreatment = ''; 
                        this.StatusOnDischarge = FetchPatientObgDischargeSummaryDataaList.DischargeStatus;
                        //this.DischargeMedication = FetchPatientObgDischargeSummaryDataaList.DischargeMedication;
                        this.Recommendation = FetchPatientObgDischargeSummaryDataaList.RecommendationsFollowUpCare;
                        this.base64StringSig2 = FetchPatientObgDischargeSummaryDataaList.doctorSignature;
                        this.showSignature = false;
                        setTimeout(() => {
                            this.showSignature = true;
                        }, 0);
                        this.patientSelected = true;
                    }
                });

                const commonUrl = this.medicalAssessmentService.getData(otPatientDetails.FetchTemplateDefaultData, { AdmissionID: this.AdmissionID, PatientId: this.PatientID, UserID: this.doctorDetails[0].UserId, WorkStationID: this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, HospitalID: this.hospId });
                this.utilityService.get(commonUrl).subscribe(response => {
                    this.ChiefComplaints = response?.FetcTemplateDefaultDataListM[0]?.ChiefComplaint ?? '';
                    this.ChiefComplaintCaseSheet = response?.FetcTemplateDefaultDataListM[0]?.ChiefComplaintCaseSheet ?? '';
                    this.PhysicalExaminationCaseSheet = response?.FetcTemplateDefaultDataListM[0]?.PhysicalExaminationCaseSheet ?? '';
                    this.investigationData = response?.FetcTemplateDefaultDataListM[0]?.Investigations ?? ''
                });

            
           
        });
    }

    onVirtualDischargeDateSelected(event: any) {
        const virDisId = event.target.value;
        const disSumm = this.FetchPatientDischargeSummaryDataList1.filter((x: any) => x.VirtualDischargeID === virDisId)
        if (disSumm.length > 0) {
            this.btnSave = "Modify";
            const commonUrl = this.medicalAssessmentService.getData(otPatientDetails.FetchTemplateDefaultData, { AdmissionID: this.AdmissionID, PatientId: this.PatientID, UserID: this.doctorDetails[0].UserId, WorkStationID: this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, HospitalID: this.hospId });
            this.utilityService.get(commonUrl).subscribe(response => {
                this.investigationData = response?.FetcTemplateDefaultDataListM[0]?.Investigations ?? ''
            });

            const FetchPatientDischargeSummaryDataList = disSumm[0];
            this.FetchPatientDischargeSummaryDataList = disSumm[0];
            this.SummaryID = FetchPatientDischargeSummaryDataList.SummaryID;
            this.Diagnosis = FetchPatientDischargeSummaryDataList.Diagnosis;
            this.History = FetchPatientDischargeSummaryDataList.History;
            this.ChiefComplaintCaseSheet = FetchPatientDischargeSummaryDataList.ChiefComplaints;
            this.PhysicalExaminationCaseSheet = FetchPatientDischargeSummaryDataList.Examinations;
            this.Investigation = FetchPatientDischargeSummaryDataList.Investigation;
            this.HospitalCourseAndTreatment = FetchPatientDischargeSummaryDataList.HospitalCourseAndTreatment;
            this.StatusOnDischarge = FetchPatientDischargeSummaryDataList.StatusOnDischarge;
            //this.DischargeMedication = FetchPatientDischargeSummaryDataList.DischargeMedication;
            this.selectedFetchPatientAdmissionMedications = JSON.parse(FetchPatientDischargeSummaryDataList.DischargeMedication);
            this.Recommendation = FetchPatientDischargeSummaryDataList.Recommendation;
            this.base64StringSig2 = FetchPatientDischargeSummaryDataList.doctorSignature;
            this.doctorSignature = FetchPatientDischargeSummaryDataList.doctorSignature;
            this.showSignature = false;
            this.VerifiedBy = FetchPatientDischargeSummaryDataList.VerifiedBy;
            this.VerifiedByName = FetchPatientDischargeSummaryDataList.VerifiedByName;
            this.VerifiedDate = FetchPatientDischargeSummaryDataList.VerifiedDate;

            this.doctorID = FetchPatientDischargeSummaryDataList.DoctorID;
            this.DoctorName = FetchPatientDischargeSummaryDataList.DoctorName;
            this.DoctorSpecialisation = FetchPatientDischargeSummaryDataList.Specialisation;
            this.DocEmpNo = FetchPatientDischargeSummaryDataList.DoctorName.split(' -')[0];


            if (FetchPatientDischargeSummaryDataList.VerifiedBy !== '0' && FetchPatientDischargeSummaryDataList.VerifiedBy !== '') {
                if (FetchPatientDischargeSummaryDataList.STATUS === '1') {
                    this.isVerified = true;
                }
            };
            setTimeout(() => {
                this.showSignature = true;
            }, 0);
            this.patientSelected = true;
        }
        else {
            this.btnSave = "Save";
            this.FetchPatientDisSummaryDataNew();
        }
    }

    openAdmissionMedications() {
        // var fromdate = new Date(); fromdate.setDate(fromdate.getDate() - 45);        
        // var todate = moment(new Date()).format('DD-MMM-YYYY');
        // this.config.getPreviousMedication(this.PatientID, moment(fromdate).format('DD-MMM-YYYY'), todate, 0, 0).subscribe((response) => {
        //     if (response.Status === "Success") {
        //       $("#admissionmedications").modal('show');
        //       this.patientMedications = this.patientMedications1 = response.PreviousMedicationDataList;
        //     }
        //   },
        //     (err) => {
      
        //     })

            const commonUrl = this.medicalAssessmentService.getData(otPatientDetails.FetchPatientPrescribedMedicationHistory, 
                { patientId: this.PatientID, admissionId: this.AdmissionID, UserID: this.doctorDetails[0].UserId, 
                    WorkStationID: this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, HospitalID: this.hospId });
            this.utilityService.get(commonUrl).subscribe(response => {
                this.patientMedications = this.patientMedications1 = response.PatientPrescribedMedicationHistoryDataList;
                $("#admissionmedications").modal('show');
            });
      }

      selectedMedications(item: any): void {
        item.active = !item.active; 
      }

      selectMedications() {
        var selected = this.patientMedications.filter((item: any) => item.active);
        this.errorMessage = "";
        this.showPreValidation = false;
    
        if(selected.length === 0) {
          this.errorMessage = "Please select atleast one Medication";
          this.showPreValidation = true;
          return;
        }
        if(this.selectedFetchPatientAdmissionMedications.length > 0) {
            selected.forEach((element: any) => {
                this.selectedFetchPatientAdmissionMedications.push(element) 
            });
        }
        else {
            this.selectedFetchPatientAdmissionMedications = selected;
        }
        $("#admissionmedications").modal('hide');
      }

      clearMedications() {
        this.patientMedications.forEach((item: any) => {
            item.active = false;
        });
    
        this.selectedFetchPatientAdmissionMedications = [];
        this.isClear = false;
        this.errorMessage = "";
        this.showPreValidation = false;
        setTimeout(() => {
          this.isClear = true;
        }, 0);
      }
      clearSelectedAdmissionMedications() {
        this.selectedFetchPatientAdmissionMedications=[];
      }

      filterAdmissionMedications(event: any) {
        if(event.target.value === '') {
            this.patientMedications = this.patientMedications1;
          }
          else {
            this.patientMedications = this.patientMedications1.filter((x: any) => x.GenericItemName.toLowerCase().includes(event.target.value.toLowerCase().trim()));
          }
      }
}
