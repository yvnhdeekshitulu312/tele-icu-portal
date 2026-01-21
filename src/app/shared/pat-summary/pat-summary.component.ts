import { Component, OnDestroy, OnInit } from "@angular/core";
import { BaseComponent } from "../base.component";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { UtilityService } from "../utility.service";
import { PatientAlertsService } from "../patient-alerts/patient-alerts.service";
import { FormBuilder, FormGroup } from "@angular/forms";

declare var $: any;

export const MY_FORMATS = {
    parse: {
        dateInput: 'dd-MMM-yyyy',
    },
    display: {
        dateInput: 'DD-MMM-yyyy',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'dd-MMM-yyyy',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-pat-summary',
    templateUrl: './pat-summary.component.html',
    // styleUrls: ['./pat-summary.component.scss'],
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
export class PatSummaryComponent extends BaseComponent implements OnInit, OnDestroy {
    activeTab: string = 'patientsummary';
    facility: any;
    SelectedViewClass: any;
    isdetailShow = false;
    EffectiveDate: any;
    Blocktype: any;
    Blockreason: any;
    motherDetails: any;
    Discription: any;

    motherSsn: string = "";
    childSsn: string = "";

    PatientID: any;

    noPatientSelected: boolean = false;
    isSSNEnter: boolean = false;

    selectedReasonValue: any = 0;
    patientsCollection: any = [];

    patientVisits: any = [];
    filteredPatientVisits: any = [];

    fromOtDashboard: boolean = false;
    showContent: boolean = false;
    patientdata: any;
    episodeId: any;
    PatientType: any;

    ctasScore: any;

    visitType: number = 0;
    allergiesList: any = [];
    yearWisePatientVisits: any;

    patientSummaryForm!: FormGroup;
    diagnosisList: any = [];
    radiologyList: any = [];
    laboratoryList: any = [];
    cardiologyList: any = [];
    medicationsList: any = [];

    reportType: any = 'laboratory';
    vitalsList: any = [];
    medicationsCount: any = 0;
    allergiesCount: any = 0;
    laboratoryCount: any = 0;
    radiologyCount: any = 0;
    cardiologyCount: any = 0;
    proceduresList: any = [];
    proceduresCount: any = 0;
    chartOptions: any = null;
    chartSeries: any = [];

    constructor(private router: Router, private us: UtilityService, private patientService: PatientAlertsService, private formBuilder: FormBuilder, private datePipe: DatePipe) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        // if (this.selectedView.SSN) {
        //     this.fetchPatientUHIDSSN(this.selectedView.SSN);
        // }
        if (this.selectedView.PatientType == "2") {
            if (this.selectedView.Bed != undefined) {
                if (this.selectedView?.Bed.includes('ISO'))
                    this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
                else
                    this.SelectedViewClass = "m-0 fw-bold alert_animate token";
            } else
                this.SelectedViewClass = "m-0 fw-bold alert_animate token";

        } else {
            this.SelectedViewClass = "m-0 fw-bold alert_animate token";
        }
        this.patientSummaryForm = this.formBuilder.group({
            fromDate: new Date(),
            toDate: new Date()
        });
    }

    ngOnDestroy(): void {

    }

    onTabChange(tab: string) {
        if (tab !== this.activeTab) {
            this.activeTab = tab;
        }
    }

    onDateChange() {

    }

    navigatetoBedBoard() {
        this.router.navigate(['/ward']);
    }

    onEnterPress(event: any) {
        event.preventDefault();
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            this.isSSNEnter = true;
            this.fetchPatientUHIDSSN((event.target as any).value);
        }
    }

    getCTASScoreClass() {
        if (this.selectedView?.CTASScore == '1') {
            return 'Resuscitation';
        }
        else if (this.selectedView?.CTASScore == '2') {
            return 'Emergent';
        }
        else if (this.selectedView?.CTASScore == '3') {
            return 'Urgent';
        }
        else if (this.selectedView?.CTASScore == '4') {
            return 'LessUrgent';
        }
        else if (this.selectedView?.CTASScore == '5') {
            return 'NonUrgent';
        }
        return '';
    }

    openMotherSsnDetails(motherDet: any) {
        $("#txtSsn").val(motherDet.MotherSSN);
        this.childSsn = motherDet.ChildSSN;
        this.fetchPatientDetails(motherDet.MotherSSN, "0", "0");
    }

    openChildSsnDetails(ssn: string) {
        this.motherDetails = [];
        this.fetchPatientDetails(ssn, "0", "0");
    }

    fetchPatientUHIDSSN(SSN: any) {
        this.noPatientSelected = false;
        this.patientsCollection = [];
        const url = this.us.getApiUrl(PatSummary.FetchPatientUHIDSSN, {
            SSN,
            HospitalID: this.hospitalID ?? 0,
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.patientsCollection = response.FetchPatientUHIDSSNDataList;
                    this.fetchPatientDetails(this.patientsCollection[0].SSN, '0', '0');
                }
            });
    }

    fetchPatientVisits() {
        const url = this.us.getApiUrl(PatSummary.FetchPatientVisitsPFN, {
            UHID: this.patientsCollection.map((element: any) => element.Regcode).join(),
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.patientVisits = response.PatientVisitsDataList.map((visit: any) => {
                        return {
                            ...visit,
                            visitInfo: `${visit.VisitDate} - ${visit.DoctorName} - ${visit.SpecialisationName} - ${visit.PatientTypeName} - ${visit.HospitalName}`
                        }
                    });
                    this.filteredPatientVisits = [...this.patientVisits];
                    var admid = response.PatientVisitsDataList[0].AdmissionID;
                    // if (this.fromOtDashboard)
                    //     admid = this.selectedView.AdmissionID;
                    // else
                    //     admid = this.selectedView.AdmissionID == undefined ? this.selectedView.IPAdmissionID : this.selectedView.AdmissionID;
                    // if (this.fromBedsBoard) {
                    //     this.patientFolderForm.get('VisitID')?.setValue(admid);
                    //     this.noPatientSelected = true;
                    // }
                    // else {
                    //     admid = response.PatientVisitsDataList[0].AdmissionID;
                    //     this.patientFolderForm.get('VisitID')?.setValue(admid);
                    // }
                    //this.episodeId = response.PatientVisitsDataList[0].EpisodeID;
                    // if (this.isSSNEnter || (this.doctorDetails[0].IsDoctor === false && this.doctorDetails[0].IsRODoctor === false)) {
                    //     this.selectedReasonValue = 0
                    //     $('#patientFolderReasonModal').modal('show');
                    // } else {
                    this.showContent = true;
                    //}
                    setTimeout(() => {
                        // if (this.labresult || this.radresult || this.radworklist || this.phyWorklist) {
                        //     admid = this.patientDetails.IPID;
                        // }
                        this.visitChange(admid);
                    }, 1000);
                }
            },
                (err) => {
                })
    }

    visitChange(admissionId: any) {
        this.admissionID = admissionId;
        this.patientdata = this.patientVisits.find((visit: any) => visit.AdmissionID == admissionId);
        this.episodeId = this.patientdata?.EpisodeID;
        this.PatientType = this.patientdata?.PatientType;
        this.fetchPatientVistitInfo();
        this.fetchMotherDetails(this.patientdata.PatientID);

        this.fetchAllergies();
        this.fetchyearWisePatientVisits();
        this.fetchDiagnosis();
        this.fetchVitals();
        this.fetchRadiology();
        this.fetchCardiology();
        this.fecthLaboratory();
        this.fetchMedications();
        this.fetchProcedures();
    }

    fetchPatientDetails(ssn: string, mobileno: string, patientId: string) {
        const url = this.us.getApiUrl(PatSummary.fetchPatientDataBySsn, {
            SSN: ssn,
            MobileNO: mobileno,
            PatientId: patientId,
            UserId: this.doctorDetails[0]?.UserId ?? 0,
            WorkStationID: this.doctorDetails[0]?.FacilityId,
            HospitalID: this.hospitalID ?? 0,
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    if (ssn === '0') {
                        this.PatientID = response.FetchPatientDependCLists[0].PatientID;
                        this.selectedView = response.FetchPatientDependCLists[0];
                    }
                    else if (mobileno === '0') {
                        this.PatientID = response.FetchPatientDataCCList[0].PatientID;
                        this.selectedView = response.FetchPatientDataCCList[0];
                        this.Blocktype = response.FetchPatientDataCCList[0].Blocktype;
                        this.Blockreason = response.FetchPatientDataCCList[0].Blockreason;
                        this.Discription = response.FetchPatientDataCCList[0].Discription;
                        this.EffectiveDate = response.FetchPatientDataCCList[0].EffectiveDate;
                    }
                    this.patientService.setPatientId(this.PatientID);
                    this.us.setAlertPatientId(this.PatientID);
                    this.fetchPatientVisits();
                    if (this.isSSNEnter || (this.doctorDetails[0].IsDoctor === false && this.doctorDetails[0].IsRODoctor === false)) {
                        this.selectedReasonValue = 0;
                    } else {
                        this.noPatientSelected = true;
                    }
                }
            },
                (err) => {

                })
    }

    fetchPatientVistitInfo() {
        const url = this.us.getApiUrl(PatSummary.FetchPatientVistitInfoN, {
            UHID: this.patientdata.RegCode,
            IsnewVisit: this.patientdata.IsNewVisit,
            Admissionid: this.patientdata.AdmissionID,
            HospitalID: this.patientdata.HospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    if (response.FetchPatientVistitInfoDataList.length > 0) {
                        this.selectedView = response.FetchPatientVistitInfoDataList[0];
                        this.ctasScore = this.selectedView.CTASSCore;
                    }
                    this.noPatientSelected = true;
                    //const ccSectionItem = this.filteredLinks.find((x: any) => x.scrollName === 'chiefcomplaints');
                    //this.linkClick(ccSectionItem);
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

    fetchMotherDetails(patientid: string) {
        const url = this.us.getApiUrl(PatSummary.FetchAdmittedMotherDetails, {
            ChildPatientID: patientid,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facility.FacilityID == undefined ? this.facility == undefined ? this.doctorDetails[0]?.FacilityId : this.facility : this.facility.FacilityID,
            HospitalID: this.hospitalID ?? 0,
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.motherDetails = response.FetchAdmittedChildDetailsListD[0];
                }
            },
                (err) => {

                })
    }

    getFullPatientType(value: string) {
        switch (value) {
            case '1':
                return 'Outpatient';
            case '2':
                return 'Inpatient';
            case '3':
                return 'Emergency';
            default:
                return '';
        }
    }

    getVisits() {
        if (this.visitType === 0) {
            return this.patientVisits;
        } else {
            return this.patientVisits.filter((item: any) => item.PatientType == this.visitType);
        }
    }

    fetchAllergies() {
        const url = this.us.getApiUrl(PatSummary.FetchPatientAllertsAndAlleries, {
            UHID: this.patientdata.RegCode,
            WorkStationID: this.facility.FacilityID == undefined ? this.facility == undefined ? this.doctorDetails[0]?.FacilityId : this.facility : this.facility.FacilityID,
            HospitalId: this.patientdata.HospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.allergiesCount = response.FetchPatientAllertsAndAlleriesDataList.length;
                    this.allergiesList = response.FetchPatientAllertsAndAlleriesDataList.slice(0, 5);
                }
            },
                (err) => {

                });
    }

    fetchyearWisePatientVisits() {
        const url = this.us.getApiUrl(PatSummary.FetchyearWisePatientVisits, {
            UHID: this.patientdata.RegCode,
            WorkStationID: this.facility.FacilityID == undefined ? this.facility == undefined ? this.doctorDetails[0]?.FacilityId : this.facility : this.facility.FacilityID,
            HospitalId: this.patientdata.HospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.yearWisePatientVisits = response.FetchyearWisePatientVisitsDataList;
                    if (this.yearWisePatientVisits.length > 0) {
                        this.loadYearwiseChart();
                    } else {
                        this.chartOptions = null;
                    }
                }
            },
                (err) => {

                })
    }

    loadYearwiseChart() {
        const years = [...new Set(this.yearWisePatientVisits.map((d: any) => d.YearID))].sort((a: any, b: any) => b - a)
            .map(String);;

        const erMap: any = {};
        const opMap: any = {};
        const ipMap: any = {};

        // default zero
        years.forEach((y: any) => {
            erMap[y] = 0;
            opMap[y] = 0;
            ipMap[y] = 0;
        });

        // fill values
        this.yearWisePatientVisits.forEach((item: any) => {
            const count = Number(item.TotalPatients);

            if (item.PatientType === 'ER') erMap[item.YearID] = count;
            if (item.PatientType === 'OP') opMap[item.YearID] = count;
            if (item.PatientType === 'IP') ipMap[item.YearID] = count;
        });

        this.chartSeries = [
            {
                name: 'ER',
                data: years.map((y: any) => erMap[y] === 0 ? null : erMap[y])
            },
            {
                name: 'OP',
                data: years.map((y: any) => opMap[y] === 0 ? null : opMap[y])
            },
            {
                name: 'IP',
                data: years.map((y: any) => ipMap[y] === 0 ? null : ipMap[y])
            }
        ];

        this.chartOptions = {
            chart: {
                type: 'bar',
                height: 150,
                toolbar: { show: false },
                zoom: { enabled: false },
            },
            plotOptions: {
                bar: {
                    columnWidth: '40%',
                    borderRadius: 2,
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 1
            },
            xaxis: {
                categories: years,
                title: {
                    text: ''
                }
            },
            yaxis: {
                title: {
                    text: ''
                }
            },
            legend: {
                position: 'bottom'
            },
            tooltip: {
                shared: true,
                intersect: false,
            },
            title: {
                text: 'Year wise Patient Visits',
                align: 'center',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1e293b'
                }
            },
            colors: ['#aeefaf', '#DEB4DA', '#B39FD6']
        };
    }

    fetchDiagnosis() {
        const url = this.us.getApiUrl(PatSummary.FetchPatientSummaryDiagPFNUHID, {
            UHID: this.patientdata.RegCode,
            WorkStationID: this.facility.FacilityID == undefined ? this.facility == undefined ? this.doctorDetails[0]?.FacilityId : this.facility : this.facility.FacilityID,
            HospitalId: this.patientdata.HospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.diagnosisList = response.PatientDiseasesDataList.slice(0, 10);
                }
            },
                (err) => {

                })
    }

    fetchVitals() {
        let toDateFilter = new Date();
        let fromDateFilter = new Date(toDateFilter);
        fromDateFilter.setMonth(toDateFilter.getMonth() - 6);
        const url = this.us.getApiUrl(PatSummary.FetchPatientVitalsByUHIDNPP, {
            UHID: this.patientdata.RegCode,
            FromDate: this.datePipe.transform(fromDateFilter, "dd-MMM-yyyy")?.toString(),
            ToDate: this.datePipe.transform(toDateFilter, "dd-MMM-yyyy")?.toString(),
            HospitalId: this.patientdata.HospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.vitalsList = response.PatientVitalsDataList.slice(0, 5);
                }
            },
                (err) => {

                })
    }

    fetchRadiology() {
        const url = this.us.getApiUrl(PatSummary.FetchRadOrderResultsPFNUHID, {
            UHID: this.patientdata.RegCode,
            SearchID: 0,
            HospitalId: this.patientdata.HospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.radiologyCount = response.FetchRadOrderResultsDataaList.length;
                    this.radiologyList = response.FetchRadOrderResultsDataaList.slice(0, 5);
                }
            },
                (err) => {

                })
    }

    fecthLaboratory() {
        const url = this.us.getApiUrl(PatSummary.FetchLabOrderResultsPFNUHID, {
            UHID: this.patientdata.RegCode,
            SearchID: 0,
            HospitalId: this.patientdata.HospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.laboratoryCount = response.FetchLabOrderResultsDataaList.length;
                    this.laboratoryList = response.FetchLabOrderResultsDataaList.slice(0, 10);
                }
            },
                (err) => {

                })
    }

    fetchCardiology() {
        const url = this.us.getApiUrl(PatSummary.FetchCardOrderResultsPFNUHID, {
            UHID: this.patientdata.RegCode,
            SearchID: 0,
            HospitalId: this.patientdata.HospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.cardiologyCount = response.FetchRadOrderResultsDataaList.length;
                    this.cardiologyList = response.FetchRadOrderResultsDataaList.slice(0, 10);
                }
            },
                (err) => {

                })
    }

    fetchMedications() {
        const url = this.us.getApiUrl(PatSummary.FetchPatientOrderedOrPrescribedDrugs_PFN, {
            UHID: this.patientdata.RegCode,
            PatientType: this.patientdata.PatientType,
            IPID: this.patientdata.AdmissionID,
            PatientID: this.patientdata.PatientID,
            SearchID: 0,
            FromDate: 0,
            ToDate: 0,
            HospitalID: this.patientdata.HospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.medicationsCount = response.PatientOrderedOrPrescribedDrugsList.length;
                    this.medicationsList = response.PatientOrderedOrPrescribedDrugsList.slice(0, 10);
                }
            },
                (err) => {

                });
    }

    fetchProcedures() {
        const url = this.us.getApiUrl(PatSummary.FetchPatientAdmissionInvestigationsAndProceduresPFN, {
            UHID: this.patientdata.RegCode,
            Admissionid: 0,
            IsnewVisit: this.patientdata.IsNewVisit,
            WorkStationID: this.wardID,
            HospitalID: this.patientdata.HospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    const procs = response.InvestigationsProceduresDataPFList.filter((x: any) => x.ServiceId === '5');
                    this.proceduresCount = procs.length;
                    this.proceduresList = procs.slice(0, 10);
                }
            },
                (err) => {

                })
    }
}

const PatSummary = {
    fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientVisitsPFN: 'FetchPatientVisitsPFN?UHID=${UHID}&HospitalID=${HospitalID}',
    FetchPatientUHIDSSN: 'FetchPatientUHIDSSN?SSN=${SSN}&HospitalID=${HospitalID}',
    FetchPatientVistitInfoN: 'FetchPatientVistitInfoN?UHID=${UHID}&IsnewVisit=${IsnewVisit}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
    FetchAdmittedMotherDetails: 'FetchAdmittedMotherDetails?ChildPatientID=${ChildPatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientAllertsAndAlleries: 'FetchPatientAllertsAndAlleries?UHID=${UHID}&WorkStationID=${WorkStationID}&HospitalId=${HospitalId}',
    FetchyearWisePatientVisits: 'FetchyearWisePatientVisits?UHID=${UHID}&WorkStationID=${WorkStationID}&HospitalId=${HospitalId}',
    FetchPatientSummaryDiagPFNUHID: 'FetchPatientSummaryDiagPFNUHID?UHID=${UHID}&WorkStationID=${WorkStationID}&HospitalId=${HospitalId}',
    FetchPatientVitalsByUHIDNPP: 'FetchPatientVitalsByUHIDNPP?UHID=${UHID}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalId=${HospitalId}',
    FetchRadOrderResultsPFNUHID: 'FetchRadOrderResultsPFNUHID?UHID=${UHID}&SearchID=${SearchID}&HospitalId=${HospitalId}',
    FetchLabOrderResultsPFNUHID: 'FetchLabOrderResultsPFNUHID?UHID=${UHID}&SearchID=${SearchID}&HospitalId=${HospitalId}',
    FetchCardOrderResultsPFNUHID: 'FetchCardOrderResultsPFNUHID?UHID=${UHID}&SearchID=${SearchID}&HospitalId=${HospitalId}',
    FetchPatientOrderedOrPrescribedDrugs_PFN: 'FetchPatientOrderedOrPrescribedDrugs_PFN?UHID=${UHID}&PatientType=${PatientType}&IPID=${IPID}&PatientID=${PatientID}&SearchID=${SearchID}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchPatientAdmissionInvestigationsAndProceduresPFN: 'FetchPatientAdmissionInvestigationsAndProceduresPFN?UHID=${UHID}&Admissionid=${Admissionid}&IsnewVisit=${IsnewVisit}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
}