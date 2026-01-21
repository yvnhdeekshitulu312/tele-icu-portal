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
    selector: 'app-chi-dischargesummary',
    templateUrl: './chi-dischargesummary.component.html',
    styleUrls: ['./chi-dischargesummary.component.scss']
})
export class ChiDischargesummaryComponent implements OnInit {

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
    @ViewChild('divSystemicReview') divSystemicReview!: ElementRef;
    @ViewChild('divIsolationStatus') divIsolationStatus!: ElementRef;
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
    StatusOnDischarge: any = "Patient unfit for discharge";
    DischargeMedication: any;
    Recommendation: any = "Patient needs to continue hospital stay";

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
    PrimaryDoctorDesignation: any;
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
    defaultDiagnosisData: any = [];
    defdissummVisitDataList: any = [];
    defdissummDiagnosisDataList: any = [];
    defdissummPrescribedServicesDataList: any = [];
    defdissummHighPriceMedicationDataList: any = [];
    defdissummLabResultsDataList: any = [];
    defdissummRadResultsDataList: any = [];
    defdissummAntibioticMedicationDataList: any = [];
    defdissummDischargeMedicationDataList: any = [];
    defdissummAntifungalMedicationDataList: any = [];
    defdissummHumanAlbuminDataList: any = [];
    defdissummGeneralApperanceSystemReviewDataList: any = [];
    defdissummBloodOrderDataList: any = [];
    defdissummTestOrdersDataList: any = [];
    defdissummHistoryofPresentIllness: any;
    parsedData: any;
    defdissummGeneralApperance: any;
    defdissummSystemReview: any;
    defdissummIsolationStatus: string = 'The patient was kept in isolation as a preventive measure to avoid possible transmission of infection';
    defdissummClinicalExaminationuponAdmission: string = '';
    defdisssummVitalsSigns: any = [];
    defdissummAnthropometrics: any = [];
    defdissummCRRTDataList: any = [];
    defdissummAmbulanceDataList: any = [];
    defdissummProcedures: any = [];
    defdissummSurgeryRequestsDataList: any = [];
    defdissummSurgeryNotesDataList: any = [];
    ditinctdissummSurgeryRequests: any = [];
    defdissummPrecautions: any = [];


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
            //this.FetchPatientDisSummaryData();
            this.fetchPatientVisits();
        }
    }

    ngAfterViewInit(): void {
    }

    fetchPatientVisits() {
        const url = this.patientfolderService.getData(patientfolder.FetchPatientVisitsPFMRD, { Patientid: this.PatientID, WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, HospitalID: this.hospId });
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.patientSelected = true;
                    this.patientVisits = response.PatientVisitsDataList.filter((x: any) => x.PatientType != '1');
                    const visit = response.PatientVisitsDataList.find((item: any) => item.AdmissionID === this.AdmissionID);
                    if (visit) {
                        this.VisitID = this.AdmissionID;
                    }
                    else {
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
        this.config.FetchPatientDischargeSummary(this.AdmissionID, this.hospId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID).subscribe(response => {
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

                const commonUrl = this.medicalAssessmentService.getData(otPatientDetails.FetchTemplateDefaultData, { AdmissionID: this.AdmissionID, PatientId: this.PatientID, UserID: this.doctorDetails[0].UserId, WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, HospitalID: this.hospId });
                this.utilityService.get(commonUrl).subscribe(response => {
                    this.ChiefComplaints = response?.FetcTemplateDefaultDataListM[0]?.ChiefComplaint ?? '';
                    this.ChiefComplaintCaseSheet = response?.FetcTemplateDefaultDataListM[0]?.ChiefComplaintCaseSheet ?? '';
                    this.PhysicalExaminationCaseSheet = response?.FetcTemplateDefaultDataListM[0]?.PhysicalExaminationCaseSheet ?? '';
                    this.investigationData = response?.FetcTemplateDefaultDataListM[0]?.Investigations ?? ''
                });

            }
            else if (response.Code == 200 && response.FetchPatientDischargeSummaryDataList.length > 0) {
                if (this.virtualDischarges.length === 0) {
                    this.btnSave = "Modify";
                }

                const commonUrl = this.medicalAssessmentService.getData(otPatientDetails.FetchTemplateDefaultData, { AdmissionID: this.AdmissionID, PatientId: this.PatientID, UserID: this.doctorDetails[0].UserId, WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, HospitalID: this.hospId });
                this.utilityService.get(commonUrl).subscribe(response => {
                    this.investigationData = response?.FetcTemplateDefaultDataListM[0]?.Investigations ?? ''
                });
                this.FetchPatientDischargeSummaryDataList1 = response.FetchPatientDischargeSummaryDataList;
                let disSummData = response.FetchPatientDischargeSummaryDataList[0];
                if (this.virtualDischargeId != 0) {
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
        this.clearCHIDischargeSummary();
    }

    clearCHIDischargeSummary() {
        this.defdissummVisitDataList = [];
        this.defdissummDiagnosisDataList = [];
        this.defdissummPrescribedServicesDataList = [];
        this.defdissummHighPriceMedicationDataList = [];
        this.defdissummLabResultsDataList = [];
        this.defdissummRadResultsDataList = [];
        this.defdissummAntibioticMedicationDataList = [];
        this.defdissummDischargeMedicationDataList = [];
        this.defdissummAntifungalMedicationDataList = [];
        this.defdissummHumanAlbuminDataList = [];
        this.defdissummGeneralApperanceSystemReviewDataList = [];
        this.defdissummBloodOrderDataList = [];
        this.defdissummTestOrdersDataList = [];
        this.defdissummHistoryofPresentIllness
        this.defdissummGeneralApperance = '';
        this.defdissummSystemReview = '';
        this.defdissummIsolationStatus = 'The patient was kept in isolation as a preventive measure to avoid possible transmission of infection';
        this.defdissummClinicalExaminationuponAdmission = "";
        this.defdisssummVitalsSigns = [];
        this.defdissummAnthropometrics = [];
        this.defdissummCRRTDataList = [];
        this.defdissummAmbulanceDataList = [];
        this.defdissummProcedures = [];
        this.defdissummSurgeryRequestsDataList = [];
        this.defdissummSurgeryNotesDataList = [];
        this.ditinctdissummSurgeryRequests = [];
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
            "DoctorID": this.selectedView.ConsultantID,// this.doctorID==undefined?this.doctorDetails[0].EmpId:this.doctorID,
            "SpecialiseID": this.selectedView.SpecialiseID,//this.doctorDetails[0].EmpSpecialisationId,
            "Diagnosis": this.divDiagnosis.nativeElement.innerHTML,
            "History": this.divHistory.nativeElement.innerHTML,
            "ChiefComplaints": this.divComplaints.nativeElement.innerHTML,
            "Examinations": this.divExaminations.nativeElement.innerHTML,
            "Vitals": this.PhysicalExaminationCaseSheet,
            "Anthropometrics": this.ChiefComplaintCaseSheet,
            "SystemicReview": this.defdissummSystemReview,
            "Investigation": this.divInvestigation.nativeElement.innerHTML,
            "Radiology": JSON.stringify(this.defdissummRadResultsDataList),
            "HospitalCourseAndTreatment": this.divTreatment.nativeElement.innerHTML,
            "HighPriceMedication": JSON.stringify(this.defdissummHighPriceMedicationDataList),
            "BloodOrders": JSON.stringify(this.defdissummBloodOrderDataList),
            "Dialysis": JSON.stringify(this.defdissummPrescribedServicesDataList.filter((x: any) => x.ServiceType == 'Dialysis')),
            "IsolationStatus": this.defdissummIsolationStatus,
            "StatusOnDischarge": this.divDischargeStatus.nativeElement.innerHTML,
            "DischargeMedication": JSON.stringify(this.selectedFetchPatientAdmissionMedications),//this.divMedication.nativeElement.innerHTML,
            "Recommendation": this.divRecommendation.nativeElement.innerHTML,
            "PreparedDate": moment(new Date()).format('DD-MMM-YYYY HH:mm'),
            "PreparedBy": this.doctorDetails[0].UserId,
            "HospitalID": this.hospId,
            "status": "0",
            "USERID": this.doctorDetails[0].UserId,
            "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
            "Signature": this.doctorSignature,
            "VerifiedBy": this.selectedView.ConsultantID,
            "VirtualDischargeID": this.virtualDischargeId,
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
        this.fetchPatientVistitInfo(this.AdmissionID, patientData.PatientID);
    }

    fetchPatientVistitInfo(admissionid: any, patientid: any) {
        const url = this.patientfolderService.getData(patientfolder.FetchPatientVistitInfo, { Patientid: patientid, Admissionid: admissionid, HospitalID: this.hospId });
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.selectedView = response.FetchPatientVistitInfoDataList[0];

                    this.doctorID = this.selectedView.ConsultantID;
                    // this.DoctorName = this.selectedView.PrimaryDoctor;
                    // this.DoctorSpecialisation = this.selectedView.DoctorSpecialisation;//this.doctorDetails[0].EmpSpecialisation;
                    // this.DocEmpNo = this.selectedView.EmpNo;

                    this.DoctorName = this.selectedView.PrimaryDoctor;
                    this.DoctorSpecialisation = this.selectedView.DoctorSpecialisation;
                    this.DocEmpNo = this.selectedView.EmpNo;


                    this.PrimaryDoctorDesignation = this.selectedView.PrimaryDoctorDesignation;
                    this.virtualDischarges = response.FetchPatientVistitVirtualDischargeInfoDataList;

                }
                if (this.selectedView.PatientType == "2") {
                    if (this.selectedView?.Bed.includes('ISO'))
                        this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
                    else
                        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
                } else {
                    this.SelectedViewClass = "m-0 fw-bold alert_animate token";
                }

                if (this.virtualDischarges.length === 0) {
                    const dischargeDate =
                        (this.selectedView.DischargeDate === null || this.selectedView.DischargeDate === '') ? moment(new Date()).format('D-MMM-YYYY')
                            : this.selectedView.DischargeDate;
                    //this.FetchDefaultDischargeSummaryCHI(this.AdmissionID, this.selectedView.AdmitDate, dischargeDate);
                    this.FetchPatientDischargeSummaryCNHI(this.selectedView.AdmissionID, 0, this.selectedView.AdmitDate, dischargeDate);
                }
                else {
                    const virdisid = this.virtualDischarges[this.virtualDischarges.length - 1];
                    this.virtualDischargeId = virdisid.VirtualDischargeID;
                    let todate = virdisid.ToDate;
                    if (todate == null || todate == '') {
                        todate = moment(new Date()).format('DD-MMM-YYYY');
                    }
                    this.FetchPatientDischargeSummaryCNHI(this.selectedView.AdmissionID, this.virtualDischargeId, virdisid.FromDate, todate);
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
            WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
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
        if (this.virtualDischarges.length > 0 && this.virtualDischargeId == 0) {
            this.errorMessage = "Please select Virtual discharge to print";
            $('#errorMsg').modal('show');
            return;
        }
        this.FetchPatientCaseRecord();
        this.showCareRecordModal();
    }
    FetchPatientCaseRecord() {
        this.config.FetchPatientDischargeSummaryPrint(this.AdmissionID, this.virtualDischargeId, this.hospId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID)
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
            "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
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
            const data = findItems.map((a: any) => a.name).join('<br>*');
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
        this.config.FetchPatientDischargeSummary(this.AdmissionID, this.hospId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID).subscribe(response => {

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

            const commonUrl = this.medicalAssessmentService.getData(otPatientDetails.FetchTemplateDefaultData, { AdmissionID: this.AdmissionID, PatientId: this.PatientID, UserID: this.doctorDetails[0].UserId, WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, HospitalID: this.hospId });
            this.utilityService.get(commonUrl).subscribe(response => {
                this.ChiefComplaints = response?.FetcTemplateDefaultDataListM[0]?.ChiefComplaint ?? '';
                this.ChiefComplaintCaseSheet = response?.FetcTemplateDefaultDataListM[0]?.ChiefComplaintCaseSheet ?? '';
                this.PhysicalExaminationCaseSheet = response?.FetcTemplateDefaultDataListM[0]?.PhysicalExaminationCaseSheet ?? '';
                this.investigationData = response?.FetcTemplateDefaultDataListM[0]?.Investigations ?? ''
            });



        });
    }

    onVirtualDischargeDateSelected(event: any) {
        this.clearCHIDischargeSummary();
        const virDisId = event.target.value;
        const disSumm = this.virtualDischarges.filter((x: any) => x.VirtualDischargeID === virDisId)
        if (disSumm.length > 0) {
            let todate = disSumm[0].ToDate;
            if (todate == null || todate == '') {
                todate = moment(new Date()).format('DD-MMM-YYYY');
            }
            this.FetchPatientDischargeSummaryCNHI(disSumm[0].AdmissionID, virDisId, disSumm[0].FromDate, todate);
            //this.FetchDefaultDischargeSummaryCHI(disSumm[0].AdmissionID, disSumm[0].FromDate, disSumm[0].ToDate);
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
            {
                patientId: this.PatientID, admissionId: this.AdmissionID, UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, HospitalID: this.hospId
            });
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

        if (selected.length === 0) {
            this.errorMessage = "Please select atleast one Medication";
            this.showPreValidation = true;
            return;
        }
        if (this.selectedFetchPatientAdmissionMedications.length > 0) {
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
        this.selectedFetchPatientAdmissionMedications = [];
    }

    filterAdmissionMedications(event: any) {
        if (event.target.value === '') {
            this.patientMedications = this.patientMedications1;
        }
        else {
            this.patientMedications = this.patientMedications1.filter((x: any) => x.GenericItemName.toLowerCase().includes(event.target.value.toLowerCase().trim()));
        }
    }


    FetchDefaultDischargeSummaryCHI(admissionId: any, fromDate: any, toDate: any) {
        const commonUrl = this.medicalAssessmentService.getData(CHIDischargeSummary.FetchDefaultDischargeSummaryCHI, {
            admissionId: admissionId,
            fromDate: moment(fromDate).format('DD-MMM-YYYY'),
            toDate: moment(toDate).format('DD-MMM-YYYY'),
            userId: this.doctorDetails[0].UserId,
            WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
            HospitalID: this.hospId
        });
        this.utilityService.get(commonUrl).subscribe(response => {
            this.defdissummVisitDataList = response?.VisitDataList[0];
            this.defdissummHistoryofPresentIllness =
                "The patient, a " + this.defdissummVisitDataList.FullAge + "-old male, was admitted on " + moment(fromDate).format('DD-MMM-YYYY') + " with complaints of " + "<br>" + this.defdissummVisitDataList.ChiefComplaint;
            this.defdisssummVitalsSigns.push({
                Temparature: this.defdissummVisitDataList.Temparature,
                Pulse: this.defdissummVisitDataList.Pulse,
                BPSystolic: this.defdissummVisitDataList.BPSystolic,
                BPDiastolic: this.defdissummVisitDataList.BPDiastolic,
                Respiration: this.defdissummVisitDataList.Respiration,
                SPO2: this.defdissummVisitDataList.SPO2,
                O2FlowRate: this.defdissummVisitDataList.O2FlowRate,
                CreateDate: this.defdissummVisitDataList.VitalCreateDate
            });
            this.defdisssummVitalsSigns.push({
                Temparature: this.defdissummVisitDataList.ADMTemparature,
                Pulse: this.defdissummVisitDataList.ADMPulse,
                BPSystolic: this.defdissummVisitDataList.ADMBPSystolic,
                BPDiastolic: this.defdissummVisitDataList.ADMBPDiastolic,
                Respiration: this.defdissummVisitDataList.ADMRespiration,
                SPO2: this.defdissummVisitDataList.ADMSPO2,
                O2FlowRate: this.defdissummVisitDataList.ADMO2FlowRate,
                CreateDate: this.defdissummVisitDataList.ADMVitalCreateDate,
            });
            this.defdissummAnthropometrics.push({
                Height: this.defdissummVisitDataList.Height,
                Weight: this.defdissummVisitDataList.Weight,
                BMI: this.defdissummVisitDataList.BMI,
            });
            this.defdissummDiagnosisDataList = response?.DischargeSummaryDiagnosisDataList.sort((a: any, b: any) => a.DiagonosisTypeID - b.DiagonosisTypeID);
            this.defdissummPrescribedServicesDataList = response?.PrescribedServicesDataList.sort((a: any, b: any) => new Date(a.CreateDate).getDate() - new Date(b.CreateDate).getDate());

            const excludeProcedures = response?.TestOrdersDataList.map((item: any) => item.TestID);
            const PrescribedServicesDataList = response?.PrescribedServicesDataList.filter((i: any) => i.ServiceID == 5 && !excludeProcedures.includes(i.ProcedureID));

            //Grouping multiple Procedures Notes
            const groupProceduresNotes = this.groupProceduresNotes(response.ProceredureNoteDataList || []);

            this.defdissummProcedures = groupProceduresNotes;
            PrescribedServicesDataList.forEach((procedure: any) => {
                const procedureNotes = groupProceduresNotes.find((noteGroup: any) => noteGroup.AssessmentOrderId === procedure.ProcedureID);
                if (!procedureNotes) {
                    this.defdissummProcedures.push({
                        Admissionid: procedure.Admissionid,
                        AssessmentOrderId: "",
                        ClinicalTemplateID: "",
                        Createdate: procedure.CreateDate,
                        IndicationProcedure_textarea: "",
                        PatientID : this.PatientID,
                        PatientTemplatedetailID: "",
                        ProcedureDescription_textarea: "",
                        ProcedureName_textarea: procedure.ProcedureName,
                        TBL: "14",
                        Type: "Procedure Note",
                    });
                }
            });

            this.defdissummHighPriceMedicationDataList = response?.HighPriceMedicationDataList.sort((a: any, b: any) => new Date(a.CreateDate).getDate() - new Date(b.CreateDate).getDate());
            //this.defdissummLabResultsDataList = response?.LabRadResultsDataList.filter((x: any) => x.Isresult === 4 && x.SType !== 'HUMANALBUMIN').sort((a: any, b: any) => new Date(b.CreateDate).getDate() - new Date(a.CreateDate).getDate());
            // this.defdissummLabResultsDataList = response?.LabResultsDataList.sort((a: any, b: any) => new Date(b.CreateDate).getDate() - new Date(a.CreateDate).getDate());
            const filteredLabResults = response?.LabResultsDataList.filter((x: any) => x.Specialisation != 'MICROBIOLOGY');
            const filteredLabResultsWithResults = filteredLabResults.filter((x: any) => x.TestResult != '');
            const microbilogyResults = response?.LabResultsDataList.filter((x: any) => x.Specialisation === 'MICROBIOLOGY' && x.ParameterName == 'Result');
            const finalResults = [...filteredLabResultsWithResults, ...microbilogyResults];
            this.defdissummLabResultsDataList = finalResults.sort((a: any, b: any) => new Date(a.OrderDate).getDate() - new Date(b.OrderDate).getDate());
            
            this.defdissummRadResultsDataList = response?.LabRadResultsDataList.filter((x: any) => x.Isresult === 7).sort((a: any, b: any) => new Date(a.OrderDate).getDate() - new Date(b.OrderDate).getDate());
            const isVentilated = Number(this.defdissummVisitDataList.VentilatorCount);
            if (isVentilated > 0) {
                this.HospitalCourseAndTreatment = 'Patient is Ventilated.';
            }
            const isolatedStatus = Number(this.defdissummVisitDataList.IsolationDays);
            if (isVentilated > 0) {
                this.defdissummIsolationStatus = 'Patient is Isolated for .' + isolatedStatus + ' days.';
            }
            //this.HospitalCourseAndTreatment = '<p style="font-size: 20px;"><b>Laboratory Investigations :</b></p>' + this.getDistinctInvestigationNames(this.defdissummLabResultsDataList);
            //this.HospitalCourseAndTreatment += '<br /><br /><p style="font-size: 20px;"><b>Radiology Investigations :</b></p>' + this.getDistinctInvestigationNames(this.defdissummRadResultsDataList);
            this.defdissummHumanAlbuminDataList = response?.LabRadResultsDataList.filter((x: any) => x.SType === 'HUMANALBUMIN').sort((a: any, b: any) => new Date(a.CreateDate).getDate() - new Date(b.CreateDate).getDate());


            this.defdissummAntibioticMedicationDataList = response?.HighPriceMedicationDataList.filter((x: any) => x.MedicationType === 'AntibioticMedication').sort((a: any, b: any) => new Date(a.CreateDate).getDate() - new Date(b.CreateDate).getDate());
            this.defdissummDischargeMedicationDataList = response?.AntibioticMedicationDataList.filter((x: any) => x.Type === 'DischargeMedication').sort((a: any, b: any) => new Date(a.CreateDate).getDate() - new Date(b.CreateDate).getDate());
            this.defdissummAntifungalMedicationDataList = response?.HighPriceMedicationDataList.filter((x: any) => x.MedicationType === 'AntifungalMedication').sort((a: any, b: any) => new Date(a.CreateDate).getDate() - new Date(b.CreateDate).getDate());

            this.defdissummGeneralApperanceSystemReviewDataList = response?.GeneralApperanceSystemReviewDataList;
            // this.defdissummGeneralApperance = response?.GeneralApperanceSystemReviewData1List[0]?.ID || '';
            // if(this.defdissummGeneralApperance?.includes('$')) {
            //     this.defdissummClinicalExaminationuponAdmission = this.defdissummGeneralApperance?.split('$')[0] + ' : ' + this.defdissummGeneralApperance?.split('$')[1];
            // }

            this.defdissummClinicalExaminationuponAdmission = this.defdissummVisitDataList?.PhysicalExamination;

            this.defdissummSystemReview = this.defdissummGeneralApperanceSystemReviewDataList.map((entry: any) => {
                const [path, value] = entry.ID.split('#');
                const parts = path.split('$');
                return {
                    category: parts[0],
                    subcategory: parts[1],
                    symptom: parts[2] || null,
                    value: value
                };
            });
            this.defdissummBloodOrderDataList = response?.BloodOrderDataList.sort((a: any, b: any) => new Date(a.RequestDatetime).getDate() - new Date(b.RequestDatetime).getDate());
            this.defdissummTestOrdersDataList = response?.TestOrdersDataList.filter((x: any) => x.Type == 'HEMODIALYSIS').sort((a: any, b: any) => new Date(a.CreateDate).getDate() - new Date(b.CreateDate).getDate());
            this.defdissummCRRTDataList = response?.TestOrdersDataList.filter((x: any) => x.Type == 'CRRT').sort((a: any, b: any) => new Date(a.CreateDate).getDate() - new Date(b.CreateDate).getDate());
            this.defdissummAmbulanceDataList = response?.TestOrdersDataList.filter((x: any) => x.Type == 'AMBULANCE').sort((a: any, b: any) => new Date(a.CreateDate).getDate() - new Date(b.CreateDate).getDate());

            this.defdissummSurgeryRequestsDataList = response?.SurgeryRequestDataList;
            const distinctThings = this.defdissummSurgeryRequestsDataList.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.SurgeryRequestID === thing.SurgeryRequestID) === i);
            this.ditinctdissummSurgeryRequests = distinctThings;
            this.defdissummSurgeryNotesDataList = response?.SurgeriesDataList;
            this.defdissummSurgeryNotesDataList.forEach((element: any) => {
                element.Justification = element.SurgeryRequestRemarks;
            });
            this.defdissummPrecautions = response?.PrecautionsDataList;
        });
    }
    parseSensitivityData(value: string) {
        const data = this.unescapeHtmlEntities(value);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');
        const antibiotics = xmlDoc.getElementsByTagName('Antibiotics');
        const sensitivityData = [];
        for (let i = 0; i < antibiotics.length; i++) {
            sensitivityData.push({
                OrganismID: antibiotics[i].getElementsByTagName('OrganismID')[0]?.textContent,
                Organism: antibiotics[i].getElementsByTagName('Organism')[0]?.textContent,
                SourceID: antibiotics[i].getElementsByTagName('SourceID')[0]?.textContent,
                Source: antibiotics[i].getElementsByTagName('Source')[0]?.textContent,
                AntibioticID: antibiotics[i].getElementsByTagName('AntibioticID')[0]?.textContent,
                Antibiotic: antibiotics[i].getElementsByTagName('Antibiotic')[0]?.textContent,
                ZoneDiaMM: antibiotics[i].getElementsByTagName('ZoneDiaMM')[0]?.textContent,
                Abbreviation: antibiotics[i].getElementsByTagName('Abbreviation')[0]?.textContent,
                SusceptibilityID: antibiotics[i].getElementsByTagName('SusceptibilityID')[0]?.textContent,
                Susceptibility: antibiotics[i].getElementsByTagName('Susceptibility')[0]?.textContent,
                Code: antibiotics[i].getElementsByTagName('Code')[0]?.textContent,
                Value: antibiotics[i].getElementsByTagName('Value')[0]?.textContent,
                Suppress:
                    (
                        antibiotics[i].getElementsByTagName('Suppress')[0]?.textContent == 'true' ||
                            antibiotics[i].getElementsByTagName('Suppress')[0]?.textContent ? 'Yes' : 'No'
                    ),
            })
        }
        return sensitivityData;
    }
    unescapeHtmlEntities(text: string) {
        return text.replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    }

    saveCNHIDischargeSummary() {

        let payload = {
            "SummaryID": this.SummaryID,
            "PatientID": this.PatientID,
            "AdmissionID": this.AdmissionID,
            "DoctorID": this.selectedView.ConsultantID,
            "SpecialiseID": this.selectedView.SpecialiseID,

            "Diagnosis": JSON.stringify(this.defdissummDiagnosisDataList),//Diagnosis
            "ChiefComplaints": this.divHistory.nativeElement.innerHTML,//History of Present Illness
            "Examinations": this.divComplaints.nativeElement.innerHTML,//Clinical Examination upon Admission
            "DischargeVitals": JSON.stringify(this.defdisssummVitalsSigns),//Vitals Signs
            "Anthropometrics": JSON.stringify(this.defdissummAnthropometrics),//Anthropometrics
            "SystemicReview": this.divSystemicReview.nativeElement.innerHTML,//Systemic Review
            "HospitalCourseAndTreatment": this.divTreatment.nativeElement.innerHTML,//Hospital Course - divTreatment
            "HumanAlbumin": JSON.stringify(this.defdissummHumanAlbuminDataList),//Hospital Course - Human Albumin
            "Antibiotics": JSON.stringify(this.defdissummAntibioticMedicationDataList),//Hospital Course - Antibiotics
            "Antifungals": JSON.stringify(this.defdissummAntifungalMedicationDataList),//Hospital Course - Antifungal
            "CRRT": JSON.stringify(this.defdissummCRRTDataList),//Hospital Course - CRRT
            "AmbulanceServices": JSON.stringify(this.defdissummAmbulanceDataList),//Hospital Course - Ambulance
            "HighPriceMedication": JSON.stringify(this.defdissummHighPriceMedicationDataList),//Hospital Course - High Price Medication
            "BloodOrders": JSON.stringify(this.defdissummBloodOrderDataList),//Hospital Course - Blood Transfusions
            "Dialysis": JSON.stringify(this.defdissummTestOrdersDataList),//Hospital Course - HEMODIALYSIS
            "Investigation": JSON.stringify(this.defdissummLabResultsDataList),//Lab
            "Radiology": JSON.stringify(this.defdissummRadResultsDataList),//Radiology
            "IsolationStatus": this.divIsolationStatus.nativeElement.innerHTML,//Isolation Status
            "StatusOnDischarge": this.divDischargeStatus.nativeElement.innerHTML,//Status on Discharge
            "DischargeMedication": JSON.stringify(this.defdissummDischargeMedicationDataList),//Discharge medication
            "Recommendation": this.divRecommendation.nativeElement.innerHTML,//Recommendations
            "Surgeries": JSON.stringify(this.defdissummSurgeryNotesDataList),//Surgery
            "Procedures": JSON.stringify(this.defdissummProcedures),//Procedures

            "PreparedDate": moment(new Date()).format('DD-MMM-YYYY HH:mm'),
            "PreparedBy": this.doctorDetails[0].UserId,
            "HospitalID": this.hospId,
            "status": "0",
            "USERID": this.doctorDetails[0].UserId,
            "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
            "Signature": this.doctorSignature,
            "VerifiedBy": this.selectedView.ConsultantID,
            "VirtualDischargeID": this.virtualDischargeId,
            "Precautions": JSON.stringify(this.defdissummPrecautions)
        };

        this.utilityService.post(CHIDischargeSummary.SavePatientDischargeSummaryCNHI, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                if (this.virtualDischarges.length === 0) {
                    const dischargeDate =
                        (this.selectedView.DischargeDate === null || this.selectedView.DischargeDate === '') ? moment(new Date()).format('D-MMM-YYYY')
                            : this.selectedView.DischargeDate;
                    //this.FetchDefaultDischargeSummaryCHI(this.AdmissionID, this.selectedView.AdmitDate, dischargeDate);
                    this.FetchPatientDischargeSummaryCNHI(this.selectedView.AdmissionID, 0, this.selectedView.AdmitDate, dischargeDate);
                }
                else {
                    const disSumm = this.virtualDischarges.filter((x: any) => x.VirtualDischargeID === this.virtualDischargeId);
                    let todate = disSumm[0]?.ToDate;
                    if(disSumm.length > 0) {
                        todate = disSumm[0].ToDate;
                        if (todate == null || todate == '') {
                            todate = moment(new Date()).format('DD-MMM-YYYY');
                        }
                    }
                    this.FetchPatientDischargeSummaryCNHI(this.AdmissionID, this.virtualDischargeId, disSumm[0].FromDate, todate);
                }

                $("#saveMsg").modal("show");
            }
        },
            (err) => {

            });
    }

    FetchPatientDischargeSummaryCNHI(admissionId: any, virtualDischargeId: any, fromDate: any, toDate: any) {
        const commonUrl = this.medicalAssessmentService.getData(CHIDischargeSummary.FetchPatientDischargeSummaryCNHI, {
            AdmissionID: admissionId,
            WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
            HospitalID: this.hospId
        });

        this.utilityService.get(commonUrl).subscribe(response => {
            let virtualdisSumm: any = [];
            if (virtualDischargeId === 0) {
                virtualdisSumm = response?.FetchPatientDischargeSummaryCNHIDataList.filter((x: any) => x.AdmissionID === admissionId).sort((a: any, b: any) => new Date(b.CREATEDATE).getTime() - new Date(a.CREATEDATE).getTime());
            }
            else {
                virtualdisSumm = response?.FetchPatientDischargeSummaryCNHIDataList.filter((x: any) => x.VirtualDischargeID === virtualDischargeId);
            }

            if (virtualdisSumm.length > 0 && virtualdisSumm[0]?.IsCNHI == 'True') {
                const savedVirDisSummaryData = virtualdisSumm[0];
                this.SummaryID = savedVirDisSummaryData.SummaryID || 0;
                if (this.SummaryID > 0) {
                    this.virtualDischargeId = virtualDischargeId;
                }

                this.FetchDefaultDiagnosisAndMerge(admissionId, fromDate, toDate, savedVirDisSummaryData);
            }
            else {
                this.FetchDefaultDischargeSummaryCHI(admissionId, fromDate, toDate);
            }
        });
    }

    FetchDefaultDiagnosisAndMerge(admissionId: any, fromDate: any, toDate: any, savedData: any) {
        const commonUrl = this.medicalAssessmentService.getData(CHIDischargeSummary.FetchDefaultDischargeSummaryCHI, {
            admissionId: admissionId,
            fromDate: moment(fromDate).format('DD-MMM-YYYY'),
            toDate: moment(toDate).format('DD-MMM-YYYY'),
            userId: this.doctorDetails[0].UserId,
            WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
            HospitalID: this.hospId
        });

        this.utilityService.get(commonUrl).subscribe(defaultResponse => {

            //Diagnosis - Merge default and saved data
            const defaultDiagnosisList = defaultResponse?.DischargeSummaryDiagnosisDataList || [];
            const savedDiagnosisList = JSON.parse(savedData.Diagnosis || '[]');
            const savedDiagnosisIds = new Set(savedDiagnosisList.map((item: any) => item.DiseaseID));
            const newDiagnosisItems = defaultDiagnosisList.filter((item: any) => !savedDiagnosisIds.has(item.DiseaseID));
            this.defdissummDiagnosisDataList = [...savedDiagnosisList, ...newDiagnosisItems].sort((a: any, b: any) => a.DiagonosisTypeID - b.DiagonosisTypeID);

            this.defdissummHistoryofPresentIllness = savedData.ChiefComplaints;
            this.defdissummClinicalExaminationuponAdmission = savedData.Examinations;
            this.defdisssummVitalsSigns = JSON.parse(savedData.DischargeVitals || '[]');
            this.defdissummAnthropometrics = JSON.parse(savedData.Anthropometrics || '[]');

            //High Price Medication - Merge default and saved data
            const defaultHighPriceMedList = defaultResponse?.HighPriceMedicationDataList || [];
            const savedHighPriceMedList = JSON.parse(savedData.HighPriceMedication || '[]');
            const savedHighPriceMedIds = new Set(savedHighPriceMedList.map((item: any) => item.ItemID));
            const newHighPriceMedItems = defaultHighPriceMedList.filter((item: any) => !savedHighPriceMedIds.has(item.ItemID));
            this.defdissummHighPriceMedicationDataList = [...savedHighPriceMedList, ...newHighPriceMedItems].sort((a: any, b: any) => a.ItemID - b.ItemID);
            //this.defdissummHighPriceMedicationDataList = JSON.parse(savedData.HighPriceMedication || '[]');


            this.defdissummSystemReview = savedData.SystemicReview;
            this.HospitalCourseAndTreatment = savedData.HospitalCourseAndTreatment;

            //Blood Orders - Merge default and saved data
            const defaultBloodOrderList = defaultResponse?.BloodOrderDataList || [];
            const savedBloodOrderList = JSON.parse(savedData.BloodOrders || '[]');
            const savedBloodOrderIds = new Set(savedBloodOrderList.map((item: any) => item.BloodorderID));
            const newBloodOrderItems = defaultBloodOrderList.filter((item: any) => !savedBloodOrderIds.has(item.BloodorderID));
            this.defdissummBloodOrderDataList = [...savedBloodOrderList, ...newBloodOrderItems].sort((a: any, b: any) => new Date(a.RequestDatetime).getTime() - new Date(b.RequestDatetime).getTime());
            //this.defdissummBloodOrderDataList = JSON.parse(savedData.BloodOrders || '[]');

            //Dialysis Orders - Merge default and saved data
            const defaultDialysisOrderList = defaultResponse?.TestOrdersDataList.filter((x: any) => x.Type == 'HEMODIALYSIS') || [];
            const savedDialysisOrderList = JSON.parse(savedData.Dialysis || '[]');
            const savedDialysisOrderIds = new Set(savedDialysisOrderList.map((item: any) => item.TestOrderID));
            const newDialysisOrderItems = defaultDialysisOrderList.filter((item: any) => !savedDialysisOrderIds.has(item.TestOrderID));
            this.defdissummTestOrdersDataList = [...savedDialysisOrderList, ...newDialysisOrderItems].sort((a: any, b: any) => new Date(a.CreateDate).getTime() - new Date(b.CreateDate).getTime());
            //this.defdissummTestOrdersDataList = JSON.parse(savedData.Dialysis || '[]');

            //Lab Results - Merge default and saved data
            //const defaultLabResultsList = defaultResponse?.LabResultsDataList.filter((x: any) => x.SType !== 'HUMANALBUMIN') || [];
            
            const filteredLabResults = defaultResponse?.LabResultsDataList.filter((x: any) => x.Specialisation != 'MICROBIOLOGY');
            const filteredLabResultsWithResults = filteredLabResults.filter((x: any) => x.TestResult != '');
            const microbilogyResults = defaultResponse?.LabResultsDataList.filter((x: any) => x.Specialisation === 'MICROBIOLOGY' && x.ParameterName == 'Result');
            const finalResults = [...filteredLabResultsWithResults, ...microbilogyResults];

            const savedLabResultsList = JSON.parse(savedData.Investigation || '[]');
            const filteredsavedLabResultsList = savedLabResultsList.filter((x: any) => x.TestResult != '');
            const savedLabResultsIds = new Set(filteredsavedLabResultsList.map((item: any) => item.TestID));
            const newLabResultsItems = finalResults.filter((item: any) => !savedLabResultsIds.has(item.TestID));
            this.defdissummLabResultsDataList = [...filteredsavedLabResultsList, ...newLabResultsItems].sort((a: any, b: any) => new Date(a.OrderDate).getTime() - new Date(b.OrderDate).getTime());
            //this.defdissummLabResultsDataList = JSON.parse(savedData.Investigation || '[]');

            //CRRT - Merge default and saved data
            const defaultCRRTList = defaultResponse?.TestOrdersDataList.filter((x: any) => x.Type == 'CRRT') || [];
            const savedCRRTList = JSON.parse(savedData.CRRT || '[]');
            const savedCRRTIds = new Set(savedCRRTList.map((item: any) => item.TestID));
            const newCRRTItems = defaultCRRTList.filter((item: any) => !savedCRRTIds.has(item.TestID));
            this.defdissummCRRTDataList = [...savedCRRTList, ...newCRRTItems].sort((a: any, b: any) => new Date(a.CreateDate).getTime() - new Date(b.CreateDate).getTime());
            //this.defdissummCRRTDataList = JSON.parse(savedData.CRRT || '[]');

            //Ambulance Services - Merge default and saved data
            const defaultAmbulanceList = defaultResponse?.TestOrdersDataList.filter((x: any) => x.Type == 'AMBULANCE') || [];
            const savedAmbulanceList = JSON.parse(savedData.AmbulanceServices || '[]');
            const savedAmbulanceIds = new Set(savedAmbulanceList.map((item: any) => item.TestID));
            const newAmbulanceItems = defaultAmbulanceList.filter((item: any) => !savedAmbulanceIds.has(item.TestID));
            this.defdissummAmbulanceDataList = [...savedAmbulanceList, ...newAmbulanceItems].sort((a: any, b: any) => new Date(a.CreateDate).getTime() - new Date(b.CreateDate).getTime());
            //this.defdissummAmbulanceDataList = JSON.parse(savedData.AmbulanceServices || '[]');

            //Human Albumin - Merge default and saved data
            const defaultHumanAlbuminList = defaultResponse?.LabRadResultsDataList.filter((x: any) => x.SType === 'HUMANALBUMIN') || [];
            const savedHumanAlbuminList = JSON.parse(savedData.HumanAlbumin || '[]');
            const savedHumanAlbuminIds = new Set(savedHumanAlbuminList.map((item: any) => item.TestID));
            const newHumanAlbuminItems = defaultHumanAlbuminList.filter((item: any) => !savedHumanAlbuminIds.has(item.TestID));
            this.defdissummHumanAlbuminDataList = [...savedHumanAlbuminList, ...newHumanAlbuminItems].sort((a: any, b: any) => new Date(a.CreateDate).getTime() - new Date(b.CreateDate).getTime());
            //this.defdissummHumanAlbuminDataList = JSON.parse(savedData.HumanAlbumin || '[]');

            //Radiology Results - Merge default and saved data
            const defaultRadResultsList = defaultResponse?.LabRadResultsDataList.filter((x: any) => x.Isresult === 7) || [];
            const savedRadResultsList = JSON.parse(savedData.Radiology || '[]');
            const savedRadResultsIds = new Set(savedRadResultsList.map((item: any) => item.TestID));
            const newRadResultsItems = defaultRadResultsList.filter((item: any) => !savedRadResultsIds.has(item.TestID));
            this.defdissummRadResultsDataList = [...savedRadResultsList, ...newRadResultsItems].sort((a: any, b: any) => new Date(a.OrderDate).getTime() - new Date(b.OrderDate).getTime());
            // this.defdissummRadResultsDataList = JSON.parse(savedData.Radiology || '[]');


            this.defdissummIsolationStatus = savedData.IsolationStatus;
            this.StatusOnDischarge = savedData.StatusOnDischarge;

            //Antibiotic Medication - Merge default and saved data
            const defaultAntibioticMedList = defaultResponse?.HighPriceMedicationDataList.filter((x: any) => x.MedicationType === 'AntibioticMedication') || [];
            const savedAntibioticMedList = JSON.parse(savedData.Antibiotics || '[]');
            const savedAntibioticMedIds = new Set(savedAntibioticMedList.map((item: any) => item.ItemID));
            const newAntibioticMedItems = defaultAntibioticMedList.filter((item: any) => !savedAntibioticMedIds.has(item.ItemID));
            this.defdissummAntibioticMedicationDataList = [...savedAntibioticMedList, ...newAntibioticMedItems].sort((a: any, b: any) => new Date(a.CreateDate).getTime() - new Date(b.CreateDate).getTime());
            //this.defdissummAntibioticMedicationDataList = JSON.parse(savedData.Antibiotics || '[]');

            //Discharge Medication - Merge default and saved data
            const defaultDischargeMedList = defaultResponse?.AntibioticMedicationDataList.filter((x: any) => x.Type === 'DischargeMedication') || [];
            const savedDischargeMedList = JSON.parse(savedData.DischargeMedication || '[]');
            const savedDischargeMedIds = new Set(savedDischargeMedList.map((item: any) => item.ItemID));
            const newDischargeMedItems = defaultDischargeMedList.filter((item: any) => !savedDischargeMedIds.has(item.ItemID));
            this.defdissummDischargeMedicationDataList = [...savedDischargeMedList, ...newDischargeMedItems].sort((a: any, b: any) => new Date(a.CreateDate).getTime() - new Date(b.CreateDate).getTime());
            // this.defdissummDischargeMedicationDataList = JSON.parse(savedData.DischargeMedication || '[]');

            //Antifungal Medication - Merge default and saved data
            const defaultAntifungalMedList = defaultResponse?.HighPriceMedicationDataList.filter((x: any) => x.MedicationType === 'AntifungalMedication') || [];
            const savedAntifungalMedList = JSON.parse(savedData.Antifungals || '[]');
            const savedAntifungalMedIds = new Set(savedAntifungalMedList.map((item: any) => item.ItemID));
            const newAntifungalMedItems = defaultAntifungalMedList.filter((item: any) => !savedAntifungalMedIds.has(item.ItemID));
            this.defdissummAntifungalMedicationDataList = [...savedAntifungalMedList, ...newAntifungalMedItems].sort((a: any, b: any) => new Date(a.CreateDate).getTime() - new Date(b.CreateDate).getTime());
            //this.defdissummAntifungalMedicationDataList = JSON.parse(savedData.Antifungals || '[]');

            //Procedures - Merge default and saved data
            // const defaultProceduresList = defaultResponse?.PrescribedServicesDataList.filter((i: any) => i.ServiceID == 5) || [];
            // const savedProceduresList = JSON.parse(savedData.Procedures || '[]');
            // const savedProceduresIds = new Set(savedProceduresList.map((item: any) => item.ProcedureID));
            // const newProceduresItems = defaultProceduresList.filter((item: any) => !savedProceduresIds.has(item.ProcedureID));
            // //this.defdissummProcedures = [...savedProceduresList, ...newProceduresItems].sort((a: any, b: any) => new Date(b.CreateDate).getTime() - new Date(a.CreateDate).getTime());
            // this.defdissummProcedures = JSON.parse(savedData.Procedures || '[]');

            //Prescribed Procedures
            //const defaultProceduresList = defaultResponse?.PrescribedServicesDataList.filter((i: any) => i.ServiceID == 5) || [];

            //Procedure Notes - Merge default and saved data
            //this.defdissummProcedures = defaultResponse.ProceredureNoteDataList || [];
            //this.defdissummProcedures = this.groupProceduresNotes(this.defdissummProcedures);
            const excludeProcedures = defaultResponse?.TestOrdersDataList.map((item: any) => item.TestID);
            const PrescribedServicesDataList = defaultResponse?.PrescribedServicesDataList.filter((i: any) => i.ServiceID == 5 && !excludeProcedures.includes(i.ProcedureID));

            //Grouping multiple Procedures Notes
            const groupProceduresNotes = this.groupProceduresNotes(defaultResponse.ProceredureNoteDataList || []);

            this.defdissummProcedures = groupProceduresNotes;
            PrescribedServicesDataList.forEach((procedure: any) => {
                const procedureNotes = groupProceduresNotes.find((noteGroup: any) => noteGroup.AssessmentOrderId === procedure.ProcedureID);
                if (!procedureNotes) {
                    this.defdissummProcedures.push({
                        Admissionid: procedure.Admissionid,
                        AssessmentOrderId: "",
                        ClinicalTemplateID: "",
                        Createdate: procedure.CreateDate,
                        IndicationProcedure_textarea: "",
                        PatientID : this.PatientID,
                        PatientTemplatedetailID: "",
                        ProcedureDescription_textarea: "",
                        ProcedureName_textarea: procedure.ProcedureName,
                        TBL: "14",
                        Type: "Procedure Note",
                    });
                }
            });
            const savedProcedureNotesList = JSON.parse(savedData.Procedures || '[]');
            const savedProcedureNotesIds = new Set(savedProcedureNotesList.map((item: any) => item.ProcedureID));
            const newProcedureNotesItems = this.defdissummProcedures.filter((item: any) => !savedProcedureNotesIds.has(item.ProcedureID));
            this.defdissummProcedures = [...savedProcedureNotesList, ...newProcedureNotesItems].sort((a: any, b: any) => new Date(a.CreateDate).getTime() - new Date(b.CreateDate).getTime());


            //Surgeries Notes - Merge default and saved data
            const defaultSurgeriesList = defaultResponse?.SurgeriesDataList || [];
            defaultSurgeriesList.forEach((element: any) => {
                element.Justification = element.SurgeryRequestRemarks;
            });
            const savedSurgeriesList = JSON.parse(savedData.Surgeries || '[]');
            savedSurgeriesList.forEach((element: any) => {
                element.Justification = element.SurgeryRequestRemarks;
            });
            const savedSurgeriesIds = new Set(savedSurgeriesList.map((item: any) => item.SurgeryNoteID));
            const newSurgeriesItems = defaultSurgeriesList.filter((item: any) => !savedSurgeriesIds.has(item.SurgeryNoteID));
            this.defdissummSurgeryNotesDataList = [...savedSurgeriesList, ...newSurgeriesItems].sort((a: any, b: any) => new Date(a.CreateDate).getTime() - new Date(b.CreateDate).getTime());
            // this.defdissummSurgeryNotesDataList = JSON.parse(savedData.Surgeries || '[]');

            this.Recommendation = savedData.Recommendation;

            this.base64StringSig2 = savedData.doctorSignature;
            this.doctorSignature = savedData.doctorSignature;
            this.showSignature = false;
            this.VerifiedBy = savedData.VerifiedBy;
            this.VerifiedByName = savedData.VerifiedByName;
            this.VerifiedDate = savedData.VerifiedDate;

            this.doctorID = savedData.DoctorID;
            this.DoctorName = savedData.DoctorName;
            this.DoctorSpecialisation = savedData.Specialisation;

            this.defdissummSurgeryRequestsDataList = defaultResponse?.SurgeryRequestDataList || [];
            const distinctThings = this.defdissummSurgeryRequestsDataList.filter((thing: any, i: any, arr: any) =>
                arr.findIndex((t: any) => t.SurgeryRequestID === thing.SurgeryRequestID) === i);
            this.ditinctdissummSurgeryRequests = distinctThings;

            const defaultPrecautionsList = defaultResponse?.PrecautionsDataList;
            const savedPrecautionsList = JSON.parse(savedData.Precautions || '[]');
            const savedPrecautionsIds = new Set(savedPrecautionsList.map((item: any) => item.PrecautionID));
            const newPrecautions = defaultPrecautionsList.filter((item: any) => !savedPrecautionsIds.has(item.PrecautionID));
            this.defdissummPrecautions = [...savedPrecautionsList, ...newPrecautions].sort((a: any, b: any) => new Date(a.Createdate).getTime() - new Date(b.Createdate).getTime());
            this.defdissummPrecautions = defaultResponse?.PrecautionsDataList;

            setTimeout(() => {
                this.showSignature = true;
            }, 0);
            this.patientSelected = true;
        });
    }

    deleteRadResult(i: any) {
        this.defdissummRadResultsDataList.splice(i, 1);
    }
    deleteLabResult(i: any) {
        this.defdissummLabResultsDataList.splice(i, 1);
    }
    deleteHumanAlbuminResult(i: any) {
        this.defdissummHumanAlbuminDataList.splice(i, 1);
    }
    deleteHighPriceMedication(i: any) {
        this.defdissummHighPriceMedicationDataList.splice(i, 1);
    }
    deleteAntibioticMedication(i: any) {
        this.defdissummAntibioticMedicationDataList.splice(i, 1);
    }
    deletAntifungalMedication(i: any) {
        this.defdissummAntifungalMedicationDataList.splice(i, 1);
    }
    deletDischargeMedication(i: any) {
        this.defdissummDischargeMedicationDataList.splice(i, 1);
    }
    deleteProcedures(i: any) {
        this.defdissummProcedures.splice(i, 1);
    }

    groupTestsOrders(testOrders: any) {
        return testOrders.filter(
            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.TestOrderID === thing.TestOrderID) === i);
    }

    getTestComponents(test: any) {
        return this.defdissummLabResultsDataList.filter((x: any) =>
            x.TestOrderID === test.TestOrderID && x.TestOrderItemID === test.TestOrderItemID && x.TestID === test.TestID);
    }

    getDistinctInvestigationNames(tests: any): string {
        // const names = tests.map((inv: any) => inv.TestCode + '-' + inv.TestName);
        // const uniqueNames = [...new Set(names)];
        let groupedTests = tests.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => (t.TestID === thing.TestID && new Date(t.OrderDate).getDate() === new Date(t.OrderDate).getDate())) === i);
        groupedTests = groupedTests.sort((a: any, b: any) => new Date(b.OrderDate).getDate() - new Date(a.OrderDate).getDate());
        const uniqueNames = groupedTests.map((inv: any) => '<strong>' + moment(inv.OrderDate).format('DD-MMM-YYYY') + '</strong>  : ' + inv.TestCode + '-' + inv.TestName);
        const prefix = ' ';
        const suffix = ' was Ordered and Done.';

        return uniqueNames
            .map((name: any) => `<br>${prefix}${name}${suffix}<br>`)
            .join('');
    }

    groupProceduresNotes(data: any[]): any[] {
        const grouped = data.reduce((acc, { PatientTemplatedetailID, ID, Value, AssessmentOrderId, ...rest }) => {
            if (!acc[PatientTemplatedetailID]) {
                acc[PatientTemplatedetailID] = { PatientTemplatedetailID, AssessmentOrderId, ...rest };
            }
            acc[PatientTemplatedetailID][ID] = Value;
            return acc;
        }, {} as Record<number, any>);

        return Object.values(grouped);
    }

    PrintCNHIDischargeSummary() {
        const commonUrl = this.medicalAssessmentService.getData(CHIDischargeSummary.FetchPatientDischargeSummaryPrintCNHI, {
            AdmissionID: this.AdmissionID, VirtualDischargeID: this.virtualDischargeId,
            WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, HospitalID: this.hospId
        });
        this.utilityService.get(commonUrl).subscribe(response => {
            this.trustedUrl = response?.FTPPATH;
            $("#caseRecordModal").modal('show');
        });
    }

    getSurgeryNames(item: any) {
        return this.defdissummSurgeryRequestsDataList.filter((x: any) => x.SurgeryRequestID === item.SurgeryRequestID).map((a: any) => a.SurgeryName).join(' , ');
    }

    getSurgeryOperationPerformed(item: any) {
        return this.defdissummSurgeryRequestsDataList.find((x: any) => x.SurgeryRequestID === item.SurgeryRequestID).OperationPerformed;
    }

    getSurgeryProcedure(item: any) {
        return this.defdissummSurgeryRequestsDataList.find((x: any) => x.SurgeryRequestID === item.SurgeryRequestID).Procedure;
    }

    deleteAllDischargeMeds() {
        this.defdissummDischargeMedicationDataList = [];
    }

}

export const CHIDischargeSummary = {
    FetchDefaultDischargeSummaryCHI: 'FetchDefaultDischargeSummaryCHI?admissionId=${admissionId}&fromDate=${fromDate}&toDate=${toDate}&userId=${userId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SavePatientDischargeSummaryCNHI: 'SavePatientDischargeSummaryCNHI',
    FetchPatientDischargeSummaryCNHI: 'FetchPatientDischargeSummaryCNHI?AdmissionID=${AdmissionID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientDischargeSummaryPrintCNHI: 'FetchPatientDischargeSummaryPrintCNHI?AdmissionID=${AdmissionID}&VirtualDischargeID=${VirtualDischargeID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}; 