import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ConfigService } from "src/app/services/config.service";
import { PatientfolderService } from "../patientfolder/patientfolder.service";
import { patientfolder } from "../patientfolder/patientfolder.component";
import { UtilityService } from "../utility.service";
import { SignatureComponent } from "../signature/signature.component";
import * as moment from 'moment';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ValidateEmployeeComponent } from "../validate-employee/validate-employee.component";

declare var $: any;

@Component({
    selector: 'app-medical-report',
    templateUrl: './medical-report.component.html'
})
export class MedicalReportComponent {
    @ViewChild('SignRef', { static: false }) signComponent: SignatureComponent | undefined;

    @ViewChild('divMedicalCondition') divMedicalCondition!: ElementRef;
    @ViewChild('divClinicalHistory') divClinicalHistory!: ElementRef;
    @ViewChild('divDiagnosticTests') divDiagnosticTests!: ElementRef;
    @ViewChild('divProposedTreatment') divProposedTreatment!: ElementRef;
    @ViewChild('divPlannedProcedure') divPlannedProcedure!: ElementRef;
    @ViewChild('divMedicalNecessity') divMedicalNecessity!: ElementRef;
    @ViewChild('divExceptedOutcome') divExceptedOutcome!: ElementRef;
    @ViewChild('divSummaryInsuranceApproval') divSummaryInsuranceApproval!: ElementRef;
    @ViewChild('divAddendum') divAddendum!: ElementRef;


    doctorSignature: any;
    base64String = '';
    showSignature: boolean = true;

    isDirectOpen = false;
    langData: any;
    facilityId: any;
    hospId: any;
    doctorDetails: any;
    selectedView: any;
    PatientID: any;
    AdmissionID: any;
    doctorID: any;
    DoctorName: any;
    DoctorSpecialisation: any;
    DocEmpNo: any;
    SelectedViewClass: string;
    patientSelected: boolean = false;
    patientVisits: any = [];
    VisitID: any;
    IsHome = true;
    trustedUrl: any;
    errorMessage: any = '';
    FetchPatientAdmissionMedicalReportsDataList: any;
    FetchPatientAdmissionMedicalReportsAddDataList: any;
    MedicalReportID = 0;
    MedicalReportAdendamID = 0;
    MedicalCondition: any;
    MedicalConditionPrimary: any;
    MedicalConditionSecondary: any;
    ClinicalHistory: any;
    DiagnosticTests: any;
    ProposedTreatment: any;
    PlannedProcedure: any;
    MedicalNecessity: any;
    ExceptedOutcome: any;
    SummaryInsuranceApproval: any;
    Addendum: any;
    DiagnosticLabTests: any = [];
    showPreValidation: boolean = false;
    FilteredDiagnosticLabTests: any = [];
    endofEpisode: boolean = false;
    noOfdaysForExtension = "0";
    FetchApprovalInfoDataList: any;
    FetchPatientAdmissionLabTestResultsDataList: any;
    selectedFetchPatientAdmissionLabTestResultsDataList: any = [];
    showHTMLContent: boolean = false;
    virtualDischarges: any = [];
    virtualDischargeId = 0;
    @Input() data: any;
    readonly = false;
    VerifiedBy: any = '';
    VerifiedByName: any = '';
    VerifiedDate: any = '';
    isVerified: boolean = false;

    constructor(private config: ConfigService,
        private router: Router,
        private patientfolderService: PatientfolderService,
        private utilityService: UtilityService, private bedconfig: BedConfig, private modalSvc: NgbModal) {
        this.langData = this.config.getLangData();
        const facility = JSON.parse(sessionStorage.getItem("facility") || '3395');
        this.facilityId = facility.FacilityID == undefined ? facility : facility.FacilityID
        if (!this.facilityId || this.facilityId == "") {
            this.facilityId = 3395;
        }
        this.hospId = sessionStorage.getItem("hospitalId");
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
        this.PatientID = this.selectedView.PatientID;
        this.AdmissionID = this.selectedView.AdmissionID;
        if (this.selectedView.PatientType == "2") {
            this.AdmissionID = this.selectedView.IPID;
        }
        this.doctorID = this.selectedView.ConsultantID;//this.doctorDetails[0].EmpId;
        this.DoctorName = this.selectedView.Consultant;// this.doctorDetails[0].EmployeeName;
        this.DoctorSpecialisation = this.selectedView.SpecialiseID;//this.doctorDetails[0].EmpSpecialisation;
        //this.DocEmpNo = this.doctorDetails[0].EmpNo;

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
            this.AdmissionID = this.data.admissionID ?? this.AdmissionID;
            this.doctorID = this.data.data.PrimaryDoctorID;
            this.FetchPatientAdmissionMedicalReportsN(this.data.data.MedicalReportID);
            if (this.data.fromdischarge) {
                this.FetchPatientAdmissionMedicalReports();
            }

        }
        if (this.router.url.includes('shared/medicalReport')) {
            this.isDirectOpen = true;
        }
        if (!this.isDirectOpen && !this.readonly) {
            this.FetchPatientAdmissionMedicalReports();

            this.fetchPatientVisits();
        }
        if (sessionStorage.getItem("ISEpisodeclose") === "true") {
            this.endofEpisode = true;
        } else {
            this.endofEpisode = false;
        }

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
            WorkStationID: this.facilityId,
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

    fetchPatientVisits() {
        const url = this.patientfolderService.getData(patientfolder.FetchPatientVisitsPFMRD, { Patientid: this.PatientID, WorkStationID: this.facilityId, HospitalID: this.hospId });
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.patientSelected = true;
                    this.patientVisits = response.PatientVisitsDataList;
                    const visit = response.PatientVisitsDataList.find((item: any) => item.AdmissionID === this.AdmissionID);
                    if (visit) {
                        this.VisitID = this.AdmissionID;
                        if (this.isDirectOpen) {
                            this.doctorID = visit.DoctorID;//this.doctorDetails[0].EmpId;
                            this.DoctorName = visit.DoctorName;// this.doctorDetails[0].EmployeeName;
                            this.DoctorSpecialisation = visit.SpecialiseID;//this.doctorDetails[0].EmpSpecialisation;
                            this.doctorDetails[0].EmpSpecialisationId = visit.SpecialiseID;
                        }
                        this.FetchPatientAdmissionMedicalReports();
                    } else {
                        this.AdmissionID = response.PatientVisitsDataList[0].AdmissionID;
                        if (this.isDirectOpen) {
                            this.doctorID = response.PatientVisitsDataList[0].DoctorID;//this.doctorDetails[0].EmpId;
                            this.DoctorName = response.PatientVisitsDataList[0].DoctorName;// this.doctorDetails[0].EmployeeName;
                            this.DoctorSpecialisation = response.PatientVisitsDataList[0].SpecialiseID;//this.doctorDetails[0].EmpSpecialisation;
                        }
                        this.VisitID = this.AdmissionID;
                        this.FetchPatientAdmissionMedicalReports();

                    }
                    this.fetchPatientVistitInfo(this.AdmissionID, this.PatientID);
                }
            },
                (err) => {
                })
    }

    fetchPatientVistitInfo(admissionid: any, patientid: any) {
        const url = this.patientfolderService.getData(patientfolder.FetchPatientVistitInfo, { Patientid: patientid, Admissionid: admissionid, HospitalID: this.hospId });
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.selectedView = response.FetchPatientVistitInfoDataList[0];
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
            },
                (err) => {

                })
    }

    get pronouns() {
        return this.selectedView.Gender.toLowerCase() === 'female'
            ? { title: 'Ms.', subject: 'she', subjectCap: 'She', object: 'her', objectCap: 'Her' }
            : { title: 'Mr.', subject: 'he', subjectCap: 'He', object: 'his', objectCap: 'His' };
    }


    FetchPatientAdmissionAddednumMedicalReports() {
        this.MedicalReportAdendamID = 0;
        this.Addendum = '';
        this.FetchPatientAdmissionMedicalReportsAddDataList = null;

        this.config.FetchMedicalReportAdendams(this.MedicalReportID, this.AdmissionID, this.facilityId, this.hospId).subscribe(response => {
            if (response.Code == 200 && response.FetchMedicalReportAdendamsDataList.length > 0) {
                this.FetchPatientAdmissionMedicalReportsAddDataList = response.FetchMedicalReportAdendamsDataList;
                // this.MedicalReportAdendamID = this.FetchPatientAdmissionMedicalReportsAddDataList.MedicalReportAdendamID;                 
                // this.Addendum = this.FetchPatientAdmissionMedicalReportsDataList.AdendamDescription;                    
            }
        });
    }

    viewMoreChiefComplaints() {
        this.FetchPatientAdmissionAddednumMedicalReports();
        $("#viewMoreChiefComplaints").modal('show');
    }

    FetchPatientAdmissionMedicalReports() {
        this.MedicalReportID = 0;
        this.ClinicalHistory = '';
        this.DiagnosticTests = '';
        this.ProposedTreatment = '';
        this.PlannedProcedure = '';
        this.MedicalNecessity = '';
        this.ExceptedOutcome = '';
        this.SummaryInsuranceApproval = '';
        this.Addendum = '';
        this.base64String = '';
        this.doctorSignature = '';
        this.FetchPatientAdmissionMedicalReportsDataList = null;
        this.MedicalConditionPrimary = '';
        this.MedicalConditionSecondary = '';
        this.showHTMLContent = false;
        this.config.FetchTemplateDefaultData(this.AdmissionID, this.PatientID, this.doctorDetails[0].UserId, this.facilityId, this.hospId).subscribe((response: any) => {
            if (response.Code === 200) {
                const FetchPatientObgDischargeSummaryDataaList = response.FetcTemplateDefaultDataListM[0];
                if (FetchPatientObgDischargeSummaryDataaList.PrimaryDiagnosis) {
                    this.MedicalConditionPrimary = "Primary Diagnosis:" + FetchPatientObgDischargeSummaryDataaList.PrimaryDiagnosis;
                }
                if (FetchPatientObgDischargeSummaryDataaList.SecondaryDiagnosis) {
                    this.MedicalConditionSecondary = "Secondary Diagnosis:" + FetchPatientObgDischargeSummaryDataaList.SecondaryDiagnosis;
                }
                this.MedicalCondition = [this.MedicalConditionPrimary, this.MedicalConditionSecondary].filter(item => item).join('<br/>');
                this.DiagnosticLabTests = response.FetchPatientLabRadDataList;

                const groupedData = response.FetchPatientSurgiesDataList.reduce((acc: any, item: any) => {
                    const key = item.SurgeryCode;
                    if (!acc[key]) {
                        acc[key] = {
                            ...item

                        };
                    }
                    return acc;
                }, {});

                // this.PlannedProcedure =  Object.values(groupedData)
                // .map((item: any) => {                  
                //     return `Code: ${item.SurgeryCode} - ${item.SurgeryName}`;
                // })                
                // .join('<br/>');
                this.ClinicalHistory = `${this.pronouns.title} ${this.selectedView.PatientName}, a ${this.selectedView.FullAge} old ${this.selectedView.Gender.toLowerCase()}, 
                    has been under my care for the past ${this.selectedView.LengthOfStay} due to progressive {}
                    ${this.pronouns.subjectCap} was initially treated {} 
                    ${this.pronouns.objectCap} condition has {}, 
                    and ${this.pronouns.subject} now experiences {}.`

                this.SummaryInsuranceApproval = "";
                this.Addendum = "";
            }
            this.config.FetchPatientAdmissionMedicalReports(this.AdmissionID, this.hospId, this.facilityId).subscribe(response => {
                if (response.Code == 200 && response.FetchPatientAdmissionMedicalReportsDataList.length > 0) {
                    this.FetchPatientAdmissionMedicalReportsDataList = response.FetchPatientAdmissionMedicalReportsDataList[0];
                    this.MedicalCondition = this.FetchPatientAdmissionMedicalReportsDataList.MedicalCondition;
                    this.MedicalReportID = this.FetchPatientAdmissionMedicalReportsDataList.MedicalReportID;
                    this.ClinicalHistory = this.FetchPatientAdmissionMedicalReportsDataList.ClinicalHistory;
                    this.ProposedTreatment = this.FetchPatientAdmissionMedicalReportsDataList.ProposedTreatment;
                    this.PlannedProcedure = this.FetchPatientAdmissionMedicalReportsDataList.PlannedProcedure;
                    this.ExceptedOutcome = this.FetchPatientAdmissionMedicalReportsDataList.ExceptedOutcome;
                    this.SummaryInsuranceApproval = this.FetchPatientAdmissionMedicalReportsDataList.SummaryInsuranceApproval;
                    this.MedicalNecessity = this.FetchPatientAdmissionMedicalReportsDataList.MedicalNecessity;
                    this.base64String = this.FetchPatientAdmissionMedicalReportsDataList.DoctorSignature;
                    this.doctorSignature = this.FetchPatientAdmissionMedicalReportsDataList.DoctorSignature;

                    this.DoctorName = this.FetchPatientAdmissionMedicalReportsDataList.DoctorName;
                    //this.doctorDetails[0].UserId=this.FetchPatientAdmissionMedicalReportsDataList.UserID;
                    this.FetchPatientAdmissionAddednumMedicalReports();

                    const RelevantLabResults = this.FetchPatientAdmissionMedicalReportsDataList.DiagnosticTests.toString().replaceAll("&nbsp;", "");
                    if (RelevantLabResults.includes('<div>') || RelevantLabResults.includes('<span>') || RelevantLabResults.includes('<br>')) {
                        this.showHTMLContent = true;
                        this.selectedFetchPatientAdmissionLabTestResultsDataList = [];
                        this.DiagnosticTests = RelevantLabResults;
                    } else {
                        this.showHTMLContent = false;
                        this.selectedFetchPatientAdmissionLabTestResultsDataList = JSON.parse(RelevantLabResults);
                    }
                }
                this.showSignature = false;
                setTimeout(() => {
                    this.showSignature = true;
                }, 0);
                this.patientSelected = true;
            });
        });
    }

    FetchPatientAdmissionMedicalReportsN(medrepid: any) {
        this.MedicalReportID = 0;
        this.ClinicalHistory = '';
        this.DiagnosticTests = '';
        this.ProposedTreatment = '';
        this.PlannedProcedure = '';
        this.MedicalNecessity = '';
        this.ExceptedOutcome = '';
        this.SummaryInsuranceApproval = '';
        this.Addendum = '';
        this.base64String = '';
        this.doctorSignature = '';
        this.FetchPatientAdmissionMedicalReportsDataList = null;
        this.MedicalConditionPrimary = '';
        this.MedicalConditionSecondary = '';
        this.showHTMLContent = false;
        this.config.FetchTemplateDefaultData(this.AdmissionID, this.PatientID, this.doctorDetails[0].UserId, this.facilityId, this.hospId).subscribe((response: any) => {
            if (response.Code === 200) {
                const FetchPatientObgDischargeSummaryDataaList = response.FetcTemplateDefaultDataListM[0];
                if (FetchPatientObgDischargeSummaryDataaList.PrimaryDiagnosis) {
                    this.MedicalConditionPrimary = "Primary Diagnosis:" + FetchPatientObgDischargeSummaryDataaList.PrimaryDiagnosis;
                }
                if (FetchPatientObgDischargeSummaryDataaList.SecondaryDiagnosis) {
                    this.MedicalConditionSecondary = "Secondary Diagnosis:" + FetchPatientObgDischargeSummaryDataaList.SecondaryDiagnosis;
                }
                this.MedicalCondition = [this.MedicalConditionPrimary, this.MedicalConditionSecondary].filter(item => item).join('<br/>');
                this.DiagnosticLabTests = response.FetchPatientLabRadDataList;

                const groupedData = response.FetchPatientSurgiesDataList.reduce((acc: any, item: any) => {
                    const key = item.SurgeryCode;
                    if (!acc[key]) {
                        acc[key] = {
                            ...item

                        };
                    }
                    return acc;
                }, {});

                // this.PlannedProcedure =  Object.values(groupedData)
                // .map((item: any) => {                  
                //     return `Code: ${item.SurgeryCode} - ${item.SurgeryName}`;
                // })                
                // .join('<br/>');
                this.ClinicalHistory = `${this.pronouns.title} ${this.selectedView.PatientName}, a ${this.selectedView.FullAge} old ${this.selectedView.Gender.toLowerCase()}, 
                    has been under my care for the past ${this.selectedView.LengthOfStay} due to progressive {}
                    ${this.pronouns.subjectCap} was initially treated {} 
                    ${this.pronouns.objectCap} condition has {}, 
                    and ${this.pronouns.subject} now experiences {}.`

                this.SummaryInsuranceApproval = "";
                this.Addendum = "";
            }
            this.config.FetchPatientAdmissionMedicalReportsN(this.AdmissionID, medrepid, this.hospId, this.facilityId).subscribe(response => {
                if (response.Code == 200 && response.FetchPatientAdmissionMedicalReportsDataList.length > 0) {
                    this.FetchPatientAdmissionMedicalReportsDataList = response.FetchPatientAdmissionMedicalReportsDataList[0];
                    this.MedicalCondition = this.FetchPatientAdmissionMedicalReportsDataList.MedicalCondition;
                    this.MedicalReportID = this.FetchPatientAdmissionMedicalReportsDataList.MedicalReportID;
                    this.ClinicalHistory = this.FetchPatientAdmissionMedicalReportsDataList.ClinicalHistory;
                    this.ProposedTreatment = this.FetchPatientAdmissionMedicalReportsDataList.ProposedTreatment;
                    this.PlannedProcedure = this.FetchPatientAdmissionMedicalReportsDataList.PlannedProcedure;
                    this.ExceptedOutcome = this.FetchPatientAdmissionMedicalReportsDataList.ExceptedOutcome;
                    this.SummaryInsuranceApproval = this.FetchPatientAdmissionMedicalReportsDataList.SummaryInsuranceApproval;
                    this.MedicalNecessity = this.FetchPatientAdmissionMedicalReportsDataList.MedicalNecessity;
                    this.base64String = this.FetchPatientAdmissionMedicalReportsDataList.DoctorSignature;
                    this.doctorSignature = this.FetchPatientAdmissionMedicalReportsDataList.DoctorSignature;

                    this.DoctorName = this.FetchPatientAdmissionMedicalReportsDataList.DoctorName;
                    //this.doctorDetails[0].UserId=this.FetchPatientAdmissionMedicalReportsDataList.UserID;
                    this.FetchPatientAdmissionAddednumMedicalReports();

                    const RelevantLabResults = this.FetchPatientAdmissionMedicalReportsDataList.DiagnosticTests.toString().replaceAll("&nbsp;", "");
                    if (RelevantLabResults.includes('<div>') || RelevantLabResults.includes('<span>') || RelevantLabResults.includes('<br>')) {
                        this.showHTMLContent = true;
                        this.selectedFetchPatientAdmissionLabTestResultsDataList = [];
                        this.DiagnosticTests = RelevantLabResults;
                    } else {
                        this.showHTMLContent = false;
                        this.selectedFetchPatientAdmissionLabTestResultsDataList = JSON.parse(RelevantLabResults);
                    }
                }
                this.showSignature = false;
                setTimeout(() => {
                    this.showSignature = true;
                }, 0);
                this.patientSelected = true;
                this.VerifiedBy = this.FetchPatientAdmissionMedicalReportsDataList.VerifiedBy;
                this.VerifiedByName = this.FetchPatientAdmissionMedicalReportsDataList.VerifiedByName;
                this.VerifiedDate = this.FetchPatientAdmissionMedicalReportsDataList.VerifiedDate;
                if (this.FetchPatientAdmissionMedicalReportsDataList.VerifiedBy !== '0' && this.FetchPatientAdmissionMedicalReportsDataList.VerifiedBy !== '') {
                    if (this.FetchPatientAdmissionMedicalReportsDataList.Status === '1') {
                        this.isVerified = true;
                    }
                };
            });
        });
    }

    FetchPatientAdmissionMedicalReportsNew() {
        this.MedicalReportID = 0;
        this.ClinicalHistory = '';
        this.DiagnosticTests = '';
        this.ProposedTreatment = '';
        this.PlannedProcedure = '';
        this.MedicalNecessity = '';
        this.ExceptedOutcome = '';
        this.SummaryInsuranceApproval = '';
        this.Addendum = '';
        this.base64String = '';
        this.doctorSignature = '';
        this.FetchPatientAdmissionMedicalReportsDataList = null;
        this.MedicalConditionPrimary = '';
        this.MedicalConditionSecondary = '';
        this.showHTMLContent = false;
        this.config.FetchTemplateDefaultData(this.AdmissionID, this.PatientID, this.doctorDetails[0].UserId, this.facilityId, this.hospId).subscribe((response: any) => {
            if (response.Code === 200) {
                const FetchPatientObgDischargeSummaryDataaList = response.FetcTemplateDefaultDataListM[0];
                if (FetchPatientObgDischargeSummaryDataaList.PrimaryDiagnosis) {
                    this.MedicalConditionPrimary = "Primary Diagnosis:" + FetchPatientObgDischargeSummaryDataaList.PrimaryDiagnosis;
                }
                if (FetchPatientObgDischargeSummaryDataaList.SecondaryDiagnosis) {
                    this.MedicalConditionSecondary = "Secondary Diagnosis:" + FetchPatientObgDischargeSummaryDataaList.SecondaryDiagnosis;
                }
                this.MedicalCondition = [this.MedicalConditionPrimary, this.MedicalConditionSecondary].filter(item => item).join('<br/>');
                this.DiagnosticLabTests = response.FetchPatientLabRadDataList;

                const groupedData = response.FetchPatientSurgiesDataList.reduce((acc: any, item: any) => {
                    const key = item.SurgeryCode;
                    if (!acc[key]) {
                        acc[key] = {
                            ...item

                        };
                    }
                    return acc;
                }, {});

                // this.PlannedProcedure =  Object.values(groupedData)
                // .map((item: any) => {                  
                //     return `Code: ${item.SurgeryCode} - ${item.SurgeryName}`;
                // })                
                // .join('<br/>');
                this.ClinicalHistory = `${this.pronouns.title} ${this.selectedView.PatientName}, a ${this.selectedView.FullAge} old ${this.selectedView.Gender.toLowerCase()}, 
                    has been under my care for the past ${this.selectedView.LengthOfStay} due to progressive {}
                    ${this.pronouns.subjectCap} was initially treated {} 
                    ${this.pronouns.objectCap} condition has {}, 
                    and ${this.pronouns.subject} now experiences {}.`

                this.SummaryInsuranceApproval = "";
                this.Addendum = "";
            }
        });
    }

    onVisitsChange(event: any) {
        const patientData = this.patientVisits.find((visit: any) => visit.AdmissionID == event.target.value);
        this.AdmissionID = event.target.value;
        this.FetchPatientAdmissionMedicalReports();
        this.fetchPatientVisits();
        //this.fetchPatientVistitInfo(this.AdmissionID, patientData.PatientID);
    }
    PrintMedicalReportSummary() {
        this.FetchPatientCaseRecord();
        this.showCareRecordModal();
    }
    FetchPatientCaseRecord() {
        this.config.FetchPatientMedicalReportPrint(this.AdmissionID, this.virtualDischargeId, this.doctorDetails[0]?.UserId, this.hospId, this.facilityId)
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
        this.FetchPatientCaseRecordPPP(this.AdmissionID, this.selectedView.PatientID);
        this.showCareRecordModalPP();
    }

    showCareRecordModalPP() {
        $("#caseRecordModal").modal('show');
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

    base64DoctorSignature(event: any) {
        this.doctorSignature = event;
    }

    clearSignature() {
        if (this.signComponent) {
            this.signComponent.clearSignature();
            this.doctorSignature = '';
        }
    }

    clearMedicalReport() {
        this.ClinicalHistory = '';
        this.DiagnosticTests = '';
        this.ProposedTreatment = '';
        this.PlannedProcedure = '';
        this.MedicalNecessity = '';
        this.ExceptedOutcome = '';
        this.SummaryInsuranceApproval = '';
        this.Addendum = '';
        this.base64String = '';
        this.clearSignature();
        this.showHTMLContent = false;
        if (this.isDirectOpen) {
            $("#txtSsn").val('');
            this.patientSelected = false;
            this.patientVisits = [];
        }
        this.virtualDischarges = [];
        this.virtualDischargeId = 0;
    }


    NewMedicalReport() {
        this.ClinicalHistory = '';
        this.DiagnosticTests = '';
        this.ProposedTreatment = '';
        this.PlannedProcedure = '';
        this.MedicalNecessity = '';
        this.ExceptedOutcome = '';
        this.SummaryInsuranceApproval = '';
        this.Addendum = '';
        this.base64String = '';
        this.clearSignature();
        this.showHTMLContent = false;
        if (this.isDirectOpen) {
            $("#txtSsn").val('');
            this.patientSelected = false;
            this.patientVisits = [];
        }
        this.FetchPatientAdmissionMedicalReportsNew();
    }

    saveMedicalReport() {
        const payload = {
            "MedicalReportID": this.MedicalReportID,
            "PatientID": this.PatientID,
            "AdmissionID": this.AdmissionID,
            "DoctorID": this.doctorID,
            "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
            "ClinicalHistory": this.divClinicalHistory.nativeElement.innerHTML,
            "DiagnosticTests": this.showHTMLContent ? this.divDiagnosticTests.nativeElement.innerHTML : JSON.stringify(this.selectedFetchPatientAdmissionLabTestResultsDataList),
            "ProposedTreatment": this.divProposedTreatment.nativeElement.innerHTML,
            "PlannedProcedure": this.divPlannedProcedure.nativeElement.innerHTML,
            "MedicalNecessity": this.divMedicalNecessity.nativeElement.innerHTML,
            "ExceptedOutcome": this.divExceptedOutcome.nativeElement.innerHTML,
            "SummaryInsuranceApproval": this.divSummaryInsuranceApproval.nativeElement.innerHTML,
            "DoctorSignature": this.doctorSignature,
            "Attachment": "",
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospId,
            "MedicalCondition": this.divMedicalCondition.nativeElement.innerHTML,
            "VirtualDischargeID": this.virtualDischargeId,
            "PreparedDate": moment(new Date()).format('DD-MMM-YYYY HH:mm'),
            "PreparedBy": this.doctorDetails[0].UserId,
            "VerifiedBy": this.selectedView.ConsultantID,
        }

        this.config.SavePatientAdmissionMedicalReports(payload).subscribe((response) => {
            if (response.Code === 200) {
                this.MedicalReportID = response.PatientVitalEndoscopyDataaList[0].PreProcedureAssessment;
                $("#saveMsg").modal("show");
            }
        });
    }

    SaveMedicalReportAdendams() {
        const payload = {
            "MedicalReportAdendamID": this.MedicalReportAdendamID,
            "MedicalReportID": this.MedicalReportID,
            "AdmissionID": this.AdmissionID,
            "AdendamDescription": this.divAddendum.nativeElement.innerHTML,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospId
        }

        this.config.SaveMedicalReportAdendams(payload).subscribe((response) => {
            if (response.Code === 200) {
                this.MedicalReportID = response.PatientVitalEndoscopyDataaList[0].PreProcedureAssessment;
                $("#saveMsg").modal("show");
            }
        });
    }

    openDiagnosticsModal() {
        this.FilteredDiagnosticLabTests = this.DiagnosticLabTests.filter((item: any) => {
            return this.divDiagnosticTests.nativeElement.innerHTML.indexOf(item.ProcedureCode) === -1;
        })
        this.FilteredDiagnosticLabTests.forEach((item: any) => {
            item.active = false;
        });
        $("#labResults").modal('show');
    }

    selectedLabTestResult(item: any): void {
        item.active = !item.active;
    }
    selectLab1(): void {
        const selected = this.FilteredDiagnosticLabTests.filter((item: any) => item.active);
        this.errorMessage = "";
        this.showPreValidation = false;

        if (selected.length === 0) {
            this.errorMessage = "Please select atleast one Lab Result";
            this.showPreValidation = true;
            return;
        }
        let addSeparator = false;
        if (this.divDiagnosticTests.nativeElement.innerHTML) {
            addSeparator = true;
        }
        this.DiagnosticTests = this.divDiagnosticTests.nativeElement.innerHTML + (addSeparator ? '<br/>' : '') + selected.map((item: any) => "Code :" + item.ProcedureCode + "-" + item.TestName + " (dated :" + item.OrderDate + ")").join('<br/>');
        $("#labResults").modal('hide');
    }

    selectLab(): void {
        var selected = this.FetchPatientAdmissionLabTestResultsDataList.filter((item: any) => item.active);
        this.errorMessage = "";
        this.showPreValidation = false;

        if (selected.length === 0) {
            this.errorMessage = "Please select atleast one Lab Result";
            this.showPreValidation = true;
            return;
        }
        this.showHTMLContent = false;
        this.selectedFetchPatientAdmissionLabTestResultsDataList = selected;
        $("#labResults").modal('hide');
    }

    openRelLabClear() {
        this.selectedFetchPatientAdmissionLabTestResultsDataList = [];
    }

    clearLab(): void {
        this.FilteredDiagnosticLabTests.forEach((item: any) => {
            item.active = false;
        });
        this.errorMessage = "";
        this.showPreValidation = false;
        this.selectedFetchPatientAdmissionLabTestResultsDataList = [];
    }

    raiseExtensionApproval() {
        if (this.noOfdaysForExtension === '0') {
            this.errorMessage = "Please select No. of days for extension";
            $("#errorMsg").modal('show');
            return;
        }
        var FromDate = moment(this.selectedView.AdmitDate).format('DD-MMM-YYYY');
        var ToDate = moment(new Date()).format('DD-MMM-YYYY');
        this.bedconfig.FetchLOAApprovalRequestDetails(this.selectedView.PatientID, FromDate, ToDate, this.selectedView.WardID, this.hospId).subscribe((response: any) => {
            if (response.Code == 200) {
                this.FetchApprovalInfoDataList = response.FetchLOAApprovalRequestDetailsListM[0];
                var payload = {
                    "entryID": this.FetchApprovalInfoDataList.EntryID,
                    "serviceItemID": this.FetchApprovalInfoDataList.ItemID,
                    "extentedQty": this.noOfdaysForExtension,
                    "userId": this.doctorDetails[0].UserId,
                    "workstationId": this.facilityId,
                    "hospitalId": this.hospId
                }
                this.bedconfig.raiseStayExtensionRequest(payload).subscribe((response) => {
                    if (response.status === '0') {
                        $("#saveMsg").modal("show");
                    }
                });
            }
        }, error => {
            console.error('Get Data API error:', error);
        });
    }

    openRelLab() {
        const url = this.patientfolderService.getData(medreport.FetchPatientAdmissionLabTestResults,
            { AdmissionID: this.AdmissionID, WorkStationID: this.facilityId, HospitalID: this.hospId });
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.FetchPatientAdmissionLabTestResultsDataList = response.FetchPatientAdmissionLabTestResultsDataList;
                    $("#labResults").modal('show');
                }
            },
                (err) => {

                })
    }

    verifyIssuedBy() {
        //   if (this.FetchPatientAdmissionMedicalReportsDataList.PreparedBy.toString() === this.doctorDetails[0].UserId.toString()) {
        //       this.errorMessage = "Issued User & Verify User should not be same ";
        //       $("#errorMsg").modal('show');
        //       return;
        //   }

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
            "MedicalReportID": this.MedicalReportID,
            "AdmissionID": this.AdmissionID,
            "VerifiedBy": this.isVerified ? this.doctorDetails[0].UserId : '0',//this.isVerified ? this.doctorDetails[0].EmpId : '0',
            "UnverifiedBy": this.isVerified ? "0" : this.doctorDetails[0].UserId,//this.isVerified ? "0" : this.doctorDetails[0].EmpId,
            "VerifiedSignature": "",
            "Status": this.isVerified ? 1 : 0,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facilityId,
            "Hospitalid": this.hospId
        };
        this.config.VerifyMedicalReport(payload)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.FetchPatientAdmissionMedicalReportsN(this.MedicalReportID);
                    $("#saveMsg").modal('show');
                } else {
                    this.isVerified = !this.isVerified;
                }
            },
                () => {

                });
    }
}

export const medreport = {
    FetchPatientAdmissionLabTestResults: 'FetchPatientAdmissionLabTestResults?AdmissionID=${AdmissionID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
}