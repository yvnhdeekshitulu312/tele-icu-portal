import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { BaseComponent } from "../base.component";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { UtilityService } from "../utility.service";
import { PatientAlertsService } from "../patient-alerts/patient-alerts.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import * as Highcharts from 'highcharts';
import { ApexAxisChartSeries, ApexChart, ApexFill, ApexLegend, ApexMarkers, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis } from "ng-apexcharts";

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
    @Input()
    fromTeleICUBed: boolean = false;
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
    vitalChartOptions: any = null;
    chartSeries: any = [];

    viewDiagnosisMore: boolean = false;
    allDiagnosisList: any = [];

    viewAllergiesMore: boolean = false;
    allAllergiesList: any = [];

    viewMedicationsMore: boolean = false;
    allMedicationsList: any = [];

    viewProceduresMore: boolean = false;
    allProceduresList: any = [];

    isAreaSplineActive: boolean = false;
    isSplineActive: boolean = true;
    isLineActive: boolean = false;
    isColumnActive: boolean = false;
    activeButton: string = 'spline';
    tablePatientsForm!: FormGroup;
    allVitalsList: any;
    groupedVitalsList: any;

    charAreaSpline!: Highcharts.Chart
    @ViewChild('chartLineAreaSpline', { static: true }) chartLineAreaSpline!: ElementRef;
    @ViewChild('chartLineSpline', { static: true }) chartLineSpline!: ElementRef;
    @ViewChild('chartLine', { static: true }) chartLine!: ElementRef;
    @ViewChild('chartColumn', { static: true }) chartColumn!: ElementRef;

    resultsType: string = 'R';
    showResultsinPopUp: boolean = false;
    IPVisitsCount: any = 0;
    OPVisitsCount: any = 0;
    ERVisitsCount: any = 0;
    DayCareVisitsCount: any = 0;
    allVisitsCount: any = 0;

    patientTypes: any = ['1', '2', '3', '4'];
    facilityId: any;
    selectedVisit: any;

    constructor(private router: Router, private us: UtilityService, private patientService: PatientAlertsService, private formBuilder: FormBuilder, private datePipe: DatePipe) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.patientSummaryForm = this.formBuilder.group({
            fromDate: new Date(),
            toDate: new Date()
        });
        this.facilityId = this.facility.FacilityID == undefined ? this.facility == undefined ? this.doctorDetails[0]?.FacilityId : this.facility : this.facility.FacilityID;
        if (this.fromTeleICUBed) {
            this.selectedView = JSON.parse(sessionStorage.getItem("icubeddetails") || '{}');
            this.hospitalID = this.selectedView.HospitalID;
            this.fetchPatientUHIDSSN(this.selectedView.SSN);
        }
        this.initializetablePatientsForm();
    }

    initializetablePatientsForm() {
        this.tablePatientsForm = this.formBuilder.group({
            FromDate: [''],
            ToDate: [''],
        });
        var toDate = new Date();
        var fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() - 6);
        this.tablePatientsForm.patchValue({
            FromDate: fromDate,
            ToDate: toDate
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
            this.selectedVisit = null;
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
                    this.patientVisits = this.filteredPatientVisits = response.PatientVisitsDataList.filter((x: any) => this.patientTypes.includes(x.PatientType));
                    this.allVisitsCount = this.patientVisits.length;
                    this.IPVisitsCount = this.patientVisits.filter((x: any) => x.PatientType == '2').length;
                    this.OPVisitsCount = this.patientVisits.filter((x: any) => x.PatientType == '1').length;
                    this.ERVisitsCount = this.patientVisits.filter((x: any) => x.PatientType == '3').length;
                    this.DayCareVisitsCount = this.patientVisits.filter((x: any) => x.PatientType == '4').length;
                    var admid = response.PatientVisitsDataList[0].AdmissionID;
                    this.showContent = true;
                    setTimeout(() => {
                        this.visitChange(admid);
                    }, 1000);
                }
            },
                (err) => {
                })
    }

    onSelectVisit(item: any) {
        if (!this.selectedVisit || this.selectedVisit.AdmissionID !== item.AdmissionID) {
            this.selectedVisit = item;
            this.visitChange(item.AdmissionID);
        }
    }

    visitChange(admissionId: any) {
        this.initializetablePatientsForm();
        this.admissionID = admissionId;
        this.patientdata = this.patientVisits.find((visit: any) => visit.AdmissionID == admissionId);
        this.fetchPatientVistitInfo();
        this.fetchMotherDetails(this.patientdata.PatientID);
        this.fetchAllergies();
        this.fetchyearWisePatientVisits();
        this.fetchDiagnosis();
        this.fetchVitals(true);
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
                        sessionStorage.setItem("PatientDetails", JSON.stringify(this.selectedView));
                        sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
                        this.ctasScore = this.selectedView.CTASSCore;
                    }
                    this.noPatientSelected = true;
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
            case '4':
                return 'Day Care';
            default:
                return '';
        }
    }

    getVisits() {
        if (this.visitType === 0) {
            this.filteredPatientVisits = this.patientVisits;
        } else {
            this.filteredPatientVisits = this.patientVisits.filter((item: any) => item.PatientType == this.visitType);
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
                    this.allAllergiesList = response.FetchPatientAllertsAndAlleriesDataList;
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

    loadYearwiseChartold() {
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

    loadYearwiseChart() {

        // 1️⃣ Sort years ASC (Doctor-friendly timeline)
        const years = [...new Set(
            this.yearWisePatientVisits.map((d: any) => d.YearID)
        )]
            .sort((a: any, b: any) => a - b)
            .map(String);

        const erMap: any = {};
        const opMap: any = {};
        const ipMap: any = {};

        // 2️⃣ Initialize all values to 0
        years.forEach(y => {
            erMap[y] = 0;
            opMap[y] = 0;
            ipMap[y] = 0;
        });

        // 3️⃣ Fill values
        this.yearWisePatientVisits.forEach((item: any) => {
            const year = String(item.YearID);
            const count = Number(item.TotalPatients);

            if (item.PatientType === 'ER') erMap[year] = count;
            if (item.PatientType === 'OP') opMap[year] = count;
            if (item.PatientType === 'IP') ipMap[year] = count;
        });

        // 4️⃣ Series (no nulls → cleaner bars)
        this.chartSeries = [
            { name: 'ER', data: years.map(y => erMap[y]) },
            { name: 'OP', data: years.map(y => opMap[y]) },
            { name: 'IP', data: years.map(y => ipMap[y]) }
        ];

        // 5️⃣ Premium, readable chart options
        this.chartOptions = {
            chart: {
                type: 'bar',
                height: 300,
                toolbar: { show: false },
                fontFamily: 'Inter, Segoe UI, sans-serif'
            },

            plotOptions: {
                bar: {
                    columnWidth: '55%',
                    borderRadius: 0,
                    dataLabels: { position: 'top' }
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 1,
                colors: ['transparent']
            },
            xaxis: {
                categories: years,
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: {
                    style: {
                        fontSize: '12px',
                        colors: '#334155'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '12px',
                        colors: '#475569'
                    }
                }
            },
            grid: {
                borderColor: '#e5e7eb',
                strokeDashArray: 4
            },
            legend: {
                position: 'bottom',
                markers: {
                    radius: 12
                },
                labels: {
                    colors: '#334155'
                }
            },
            tooltip: {
                shared: true,
                intersect: false,
                theme: 'light'
            },
            title: {
                text: 'Year-wise Patient Visits',
                align: 'center',
                style: {
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#0f172a'
                }
            },
            colors: [
                '#e06262',
                '#397ee7',
                '#3ac77c'
            ]
        };
    }

    fetchDiagnosis() {
        let url = '';
        if (this.selectedVisit) {
            url = this.us.getApiUrl(PatSummary.FetchPatientSummaryDiagPFN, {
                UHID: this.patientdata.RegCode,
                Admissionid: this.patientdata.AdmissionID,
                SearchID: 0,
                IsnewVisit: this.patientdata.IsNewVisit,
                WorkStationID: this.facilityId,
                HospitalID: this.patientdata.HospitalID
            });
        } else {
            url = this.us.getApiUrl(PatSummary.FetchPatientSummaryDiagPFNUHID, {
                UHID: this.patientdata.RegCode,
                WorkStationID: this.facilityId,
                HospitalId: this.patientdata.HospitalID
            });
        }
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.allDiagnosisList = response.PatientDiseasesDataList;
                    this.diagnosisList = response.PatientDiseasesDataList.slice(0, 10);
                }
            },
                (err) => {

                })
    }

    fetchVitals(initialLoad: boolean = true) {
        if (!this.tablePatientsForm.value['FromDate'] || !this.tablePatientsForm.value['ToDate']) {
            return;
        }
        let url;
        if (this.selectedVisit) {
            url = this.us.getApiUrl(PatSummary.FetchPatientVitalsByPatientId_PFUHIDNN, {
                UHID: this.patientdata.RegCode,
                IPID: this.patientdata.AdmissionID,
                FromDate: this.datePipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString(),
                ToDate: this.datePipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString(),
                HospitalID: this.patientdata.HospitalID
            });
        } else {
            url = this.us.getApiUrl(PatSummary.FetchPatientVitalsByUHIDNPP, {
                UHID: this.patientdata.RegCode,
                FromDate: this.datePipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString(),
                ToDate: this.datePipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString(),
                HospitalId: this.patientdata.HospitalID
            });
        }
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    if (initialLoad) {
                        this.vitalsList = response.PatientVitalsDataList.slice(0, 5);
                        this.createChartLine(response.PatientVitalsDataList);
                    } else {
                        this.allVitalsList = response.PatientVitalsDataList;
                        const distinctThings = response.PatientVitalsDataList.filter(
                            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.CreateDateNew === thing.CreateDateNew) === i);
                        this.groupedVitalsList = distinctThings;
                        this.spline();
                    }
                }
            },
                (err) => {

                });
    }

    fetchRadiology() {
        let url;
        if (this.selectedVisit) {
            url = this.us.getApiUrl(PatSummary.FetchRadOrderResultsPF, {
                fromDate: '0',
                ToDate: '0',
                UHID: this.patientdata.RegCode,
                PatientID: this.patientdata.PatientID,
                AdmissionID: this.patientdata.AdmissionID,
                SearchID: 0,
                HospitalID: this.patientdata.HospitalID
            });
        } else {
            url = this.us.getApiUrl(PatSummary.FetchRadOrderResultsPFNUHID, {
                UHID: this.patientdata.RegCode,
                SearchID: 0,
                HospitalId: this.patientdata.HospitalID
            });
        }
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
        let url;
        if (this.selectedVisit) {
            url = this.us.getApiUrl(PatSummary.FetchLabOrderResultsPF, {
                fromDate: '0',
                ToDate: '0',
                UHID: this.patientdata.RegCode,
                PatientID: this.patientdata.PatientID,
                AdmissionID: this.patientdata.AdmissionID,
                SearchID: 0,
                HospitalID: this.patientdata.HospitalID
            });
        } else {
            url = this.us.getApiUrl(PatSummary.FetchLabOrderResultsPFNUHID, {
                UHID: this.patientdata.RegCode,
                SearchID: 0,
                HospitalId: this.patientdata.HospitalID
            });
        }
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
        let url;
        if (this.selectedVisit) {
            url = this.us.getApiUrl(PatSummary.FetchCardOrderResultsPF, {
                fromDate: '0',
                ToDate: '0',
                UHID: this.patientdata.RegCode,
                PatientID: this.patientdata.PatientID,
                AdmissionID: this.patientdata.AdmissionID,
                SearchID: 0,
                HospitalID: this.patientdata.HospitalID
            });
        } else {
            url = this.us.getApiUrl(PatSummary.FetchCardOrderResultsPFNUHID, {
                UHID: this.patientdata.RegCode,
                SearchID: 0,
                HospitalId: this.patientdata.HospitalID
            });
        }
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
            IPID: this.selectedVisit ? this.patientdata.AdmissionID : 0,
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
                    this.allMedicationsList = response.PatientOrderedOrPrescribedDrugsList;
                }
            },
                (err) => {

                });
    }

    fetchProcedures() {
        const url = this.us.getApiUrl(PatSummary.FetchPatientAdmissionInvestigationsAndProceduresPFN, {
            UHID: this.patientdata.RegCode,
            Admissionid: this.selectedVisit ? this.patientdata.AdmissionID : 0,
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
                    this.allProceduresList = procs;
                }
            },
                (err) => {

                });
    }

    openDiagnosis() {
        $('#viewMoreDiagnosisModal').modal('show');
        setTimeout(() => {
            this.viewDiagnosisMore = true;
        });
    }

    openAllergies() {
        $('#viewMoreAllergiesModal').modal('show');
        setTimeout(() => {
            this.viewAllergiesMore = true;
        });
    }

    openMedications() {
        $('#viewMoreMedicationsModal').modal('show');
        setTimeout(() => {
            this.viewMedicationsMore = true;
        });
    }

    openProcedures() {
        $('#viewMoreProceduresModal').modal('show');
        setTimeout(() => {
            this.viewProceduresMore = true;
        });
    }

    openVitals() {
        $('#viewMorevitalsModal').modal('show');
        this.initializetablePatientsForm();
        this.fetchVitals(false);
    }

    openResults(type: any) {
        this.showResultsinPopUp = true;
        this.resultsType = type;
        $('#viewResultsModal').modal('show');
    }

    filterFunction(vitals: any, visitid: any) {
        return vitals.filter((buttom: any) => buttom.CreateDateNew == visitid);
    }

    areaSpline(): void {
        this.isAreaSplineActive = true;
        this.isSplineActive = false;
        this.isLineActive = false;
        this.isColumnActive = false;
        this.activeButton = 'areaSpline';
        let vitaldata: any = {};
        let type = 1;
        const BPSystolicData: any[] = [];
        const BPDiastolicData: any[] = [];
        const O2FlowRateData: any[] = [];
        const PulseData: any[] = [];
        const RespirationData: any[] = [];
        const SPO2Data: any[] = [];
        const TemparatureData: any[] = [];
        this.allVitalsList.forEach((element: any, index: any) => {

            //if (type == 1) {
            //element.VisitDate = this.patientdata.PatientType == '2' ? element.CreateDateNew : element.VisitDate;
            element.VisitDate = element.CreateDateNew;
            //}

            if (element.BPSystolic != 0) {
                BPSystolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPSystolic)])
            }
            if (element.BPDiastolic != 0) {
                BPDiastolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPDiastolic)])
            }
            if (element.O2FlowRate != 0) {
                O2FlowRateData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.O2FlowRate)])
            }
            if (element.Pulse != 0) {
                PulseData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Pulse)])
            }
            if (element.Respiration != 0) {
                RespirationData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Respiration)])
            }
            if (element.SPO2 != 0) {
                SPO2Data.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.SPO2)])
            }
            TemparatureData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Temparature)])
        });

        vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
        { name: 'BP-Diastolic', data: BPDiastolicData },
        { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
        { name: 'Pulse', data: PulseData, visible: false },
        { name: 'Respiration', data: RespirationData, visible: false },
        { name: 'SPO2', data: SPO2Data, visible: false },
        { name: 'Temperature', data: TemparatureData, visible: false }
        ];
        this.charAreaSpline = Highcharts.chart(this.chartLineAreaSpline.nativeElement, {
            chart: {
                type: 'areaspline',
                zoomType: 'x'
            },
            title: {
                text: 'Vital Graph',
            },
            credits: {
                enabled: false,
            },
            legend: {
                enabled: true,
            },
            yAxis: {
                min: 0,
                title: {
                    text: null,
                }
            },
            xAxis: {
                type: 'category',
                min: 0,
                max: 9
            },

            tooltip: {
                headerFormat: `<div>Date: {point.key}</div>`,
                pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
                shared: true,
                valueDecimals: 1,
                useHTML: true,
                crosshairs: [{
                    width: 1,
                    color: 'Gray'
                }, {
                    width: 1,
                    color: 'gray'
                }]
            },
            series: vitaldata,
            scrollbar: {
                enabled: true,
                barBackgroundColor: 'gray',
                barBorderRadius: 7,
                barBorderWidth: 0,
                buttonBackgroundColor: 'gray',
                buttonBorderWidth: 0,
                buttonArrowColor: 'yellow',
                buttonBorderRadius: 7,
                rifleColor: 'yellow',
                trackBackgroundColor: 'white',
                trackBorderWidth: 1,
                trackBorderColor: 'silver',
                trackBorderRadius: 7
            }
        } as any);
    }
    spline() {
        this.isAreaSplineActive = false;
        this.isSplineActive = true;
        this.isLineActive = false;
        this.isColumnActive = false;
        this.activeButton = 'spline';
        let vitaldata: any = {};
        let type = 1;
        const BPSystolicData: any[] = [];
        const BPDiastolicData: any[] = [];
        const O2FlowRateData: any[] = [];
        const PulseData: any[] = [];
        const RespirationData: any[] = [];
        const SPO2Data: any[] = [];
        const TemparatureData: any[] = [];


        this.allVitalsList.forEach((element: any, index: any) => {

            //if (type == 1) {
            // element.VisitDate = this.patientdata.PatientType == '2' ? element.CreateDateNew : element.VisitDate;
            element.VisitDate = element.CreateDateNew;
            //}

            if (element.BPSystolic != 0) {
                BPSystolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPSystolic)])
            }
            if (element.BPDiastolic != 0) {
                BPDiastolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPDiastolic)])
            }
            if (element.O2FlowRate != 0) {
                O2FlowRateData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.O2FlowRate)])
            }
            if (element.Pulse != 0) {
                PulseData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Pulse)])
            }
            if (element.Respiration != 0) {
                RespirationData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Respiration)])
            }
            if (element.SPO2 != 0) {
                SPO2Data.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.SPO2)])
            }
            TemparatureData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Temparature)])
        });

        vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
        { name: 'BP-Diastolic', data: BPDiastolicData },
        { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
        { name: 'Pulse', data: PulseData, visible: false },
        { name: 'Respiration', data: RespirationData, visible: false },
        { name: 'SPO2', data: SPO2Data, visible: false },
        { name: 'Temperature', data: TemparatureData, visible: false }
        ];
        this.charAreaSpline = Highcharts.chart(this.chartLineSpline.nativeElement, {
            chart: {
                type: 'spline',
                zoomType: 'x'
            },
            title: {
                text: 'Vital Graph',
            },
            credits: {
                enabled: false,
            },
            legend: {
                enabled: true,
            },
            yAxis: {
                min: 0,
                title: {
                    text: null,
                }
            },
            xAxis: {
                type: 'category',
                min: 0,
                max: 9
            },

            tooltip: {
                headerFormat: `<div>Date: {point.key}</div>`,
                pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
                shared: true,
                valueDecimals: 1,
                useHTML: true,
                crosshairs: [{
                    width: 1,
                    color: 'Gray'
                }, {
                    width: 1,
                    color: 'gray'
                }]
            },
            series: vitaldata,
            scrollbar: {
                enabled: true,
                barBackgroundColor: 'gray',
                barBorderRadius: 7,
                barBorderWidth: 0,
                buttonBackgroundColor: 'gray',
                buttonBorderWidth: 0,
                buttonArrowColor: 'yellow',
                buttonBorderRadius: 7,
                rifleColor: 'yellow',
                trackBackgroundColor: 'white',
                trackBorderWidth: 1,
                trackBorderColor: 'silver',
                trackBorderRadius: 7
            }
        } as any);
    }
    line() {
        this.isAreaSplineActive = false;
        this.isSplineActive = false;
        this.isLineActive = true;
        this.isColumnActive = false;
        this.activeButton = 'line';
        let vitaldata: any = {};
        let type = 1;
        const BPSystolicData: any[] = [];
        const BPDiastolicData: any[] = [];
        const O2FlowRateData: any[] = [];
        const PulseData: any[] = [];
        const RespirationData: any[] = [];
        const SPO2Data: any[] = [];
        const TemparatureData: any[] = [];

        this.allVitalsList.forEach((element: any, index: any) => {
            //if (type == 1) {
            //element.VisitDate = this.patientdata.PatientType == '2' ? element.CreateDateNew : element.VisitDate;
            element.VisitDate = element.CreateDateNew;
            //}

            if (element.BPSystolic != 0) {
                BPSystolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPSystolic)])
            }
            if (element.BPDiastolic != 0) {
                BPDiastolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPDiastolic)])
            }
            if (element.O2FlowRate != 0) {
                O2FlowRateData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.O2FlowRate)])
            }
            if (element.Pulse != 0) {
                PulseData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Pulse)])
            }
            if (element.Respiration != 0) {
                RespirationData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Respiration)])
            }
            if (element.SPO2 != 0) {
                SPO2Data.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.SPO2)])
            }
            TemparatureData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Temparature)])
        });

        vitaldata = [
            { name: 'BP-Systolic', data: BPSystolicData },
            { name: 'BP-Diastolic', data: BPDiastolicData },
            { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
            { name: 'Pulse', data: PulseData, visible: false },
            { name: 'Respiration', data: RespirationData, visible: false },
            { name: 'SPO2', data: SPO2Data, visible: false },
            { name: 'Temperature', data: TemparatureData, visible: false }
        ];

        this.charAreaSpline = Highcharts.chart(this.chartLine.nativeElement, {
            chart: {
                type: 'line',
                zoomType: 'x'
            },
            title: {
                text: 'Vital Graph',
            },
            credits: {
                enabled: false,
            },
            legend: {
                enabled: true,
            },
            yAxis: {
                min: 0,
                title: {
                    text: null,
                }
            },
            xAxis: {
                type: 'category',
                min: 0,
                max: 9
            },

            tooltip: {
                headerFormat: `<div>Date: {point.key}</div>`,
                pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
                shared: true,
                valueDecimals: 1,
                useHTML: true,
                crosshairs: [{
                    width: 1,
                    color: 'Gray'
                }, {
                    width: 1,
                    color: 'gray'
                }]
            },
            series: vitaldata,
            scrollbar: {
                enabled: true,
                barBackgroundColor: 'gray',
                barBorderRadius: 7,
                barBorderWidth: 0,
                buttonBackgroundColor: 'gray',
                buttonBorderWidth: 0,
                buttonArrowColor: 'yellow',
                buttonBorderRadius: 7,
                rifleColor: 'yellow',
                trackBackgroundColor: 'white',
                trackBorderWidth: 1,
                trackBorderColor: 'silver',
                trackBorderRadius: 7
            }
        } as any);
    }
    column() {
        this.isAreaSplineActive = false;
        this.isSplineActive = false;
        this.isLineActive = false;
        this.isColumnActive = true;
        this.activeButton = 'column';
        let vitaldata: any = {};
        let type = 1;
        const BPSystolicData: any[] = [];
        const BPDiastolicData: any[] = [];
        const O2FlowRateData: any[] = [];
        const PulseData: any[] = [];
        const RespirationData: any[] = [];
        const SPO2Data: any[] = [];
        const TemparatureData: any[] = [];

        this.allVitalsList.forEach((element: any, index: any) => {
            //if (type == 1) {
            //element.VisitDate = this.patientdata.PatientType == '2' ? element.CreateDateNew : element.VisitDate;
            element.VisitDate = element.CreateDateNew;
            //}

            if (element.BPSystolic != 0) {
                BPSystolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPSystolic)])
            }
            if (element.BPDiastolic != 0) {
                BPDiastolicData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.BPDiastolic)])
            }
            if (element.O2FlowRate != 0) {
                O2FlowRateData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.O2FlowRate)])
            }
            if (element.Pulse != 0) {
                PulseData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Pulse)])
            }
            if (element.Respiration != 0) {
                RespirationData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Respiration)])
            }
            if (element.SPO2 != 0) {
                SPO2Data.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.SPO2)])
            }
            TemparatureData.push([element.CreateDate + '-' + element.HospitalName, parseFloat(element.Temparature)])
        });

        vitaldata = [
            { name: 'BP-Systolic', data: BPSystolicData },
            { name: 'BP-Diastolic', data: BPDiastolicData },
            { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
            { name: 'Pulse', data: PulseData, visible: false },
            { name: 'Respiration', data: RespirationData, visible: false },
            { name: 'SPO2', data: SPO2Data, visible: false },
            { name: 'Temperature', data: TemparatureData, visible: false }
        ];

        this.charAreaSpline = Highcharts.chart(this.chartColumn.nativeElement, {
            chart: {
                type: 'column',
                zoomType: 'x'
            },
            title: {
                text: 'Vital Graph',
            },
            credits: {
                enabled: false,
            },
            legend: {
                enabled: true,
            },
            yAxis: {
                min: 0,
                title: {
                    text: null,
                }
            },
            xAxis: {
                type: 'category',
                min: 0,
                max: 9
            },

            tooltip: {
                headerFormat: `<div>Date: {point.key}</div>`,
                pointFormat: `<div style="color: {series.color}">{series.name}: {point.y}</div>`,
                shared: true,
                valueDecimals: 1,
                useHTML: true,
                crosshairs: [{
                    width: 1,
                    color: 'Gray'
                }, {
                    width: 1,
                    color: 'gray'
                }]
            },
            series: vitaldata,
            scrollbar: {
                enabled: true,
                barBackgroundColor: 'gray',
                barBorderRadius: 7,
                barBorderWidth: 0,
                buttonBackgroundColor: 'gray',
                buttonBorderWidth: 0,
                buttonArrowColor: 'yellow',
                buttonBorderRadius: 7,
                rifleColor: 'yellow',
                trackBackgroundColor: 'white',
                trackBorderWidth: 1,
                trackBorderColor: 'silver',
                trackBorderRadius: 7
            }
        } as any);
    }

    private createChartLine(data: any): void {
        const xCategories: string[] = [];

        const BPSystolicData: any[] = [];
        const BPDiastolicData: any[] = [];
        const O2FlowRateData: any[] = [];
        const PulseData: any[] = [];
        const RespirationData: any[] = [];
        const SPO2Data: any[] = [];
        const TemparatureData: any[] = [];

        data.forEach((element: any) => {
            if (element.BPSystolic != 0) {
                BPSystolicData.push(+element.BPSystolic);
            }
            if (element.BPDiastolic != 0) {
                BPDiastolicData.push(+element.BPDiastolic);
            }
            if (element.O2FlowRate != 0) {
                O2FlowRateData.push(+element.O2FlowRate);
            }
            if (element.Pulse != 0) {
                PulseData.push(+element.Pulse);
            }
            if (element.Respiration != 0) {
                RespirationData.push(+element.Respiration);
            }
            if (element.SPO2 != 0) {
                SPO2Data.push(+element.SPO2);
            }

            TemparatureData.push(+element.Temparature);
        });

        data.forEach((element: any) => {
            xCategories.push(
                element.VitalSignDate
            );
        });

        this.vitalChartOptions = {
            series: [
                { name: 'BP-Systolic', data: BPSystolicData },
                { name: 'BP-Diastolic', data: BPDiastolicData },
                { name: 'O2 Flow Rate', data: O2FlowRateData },
                { name: 'Pulse', data: PulseData },
                { name: 'Respiration', data: RespirationData },
                { name: 'SPO2', data: SPO2Data },
                { name: 'Temperature', data: TemparatureData }
            ] as ApexAxisChartSeries,

            chart: {
                type: 'area',
                height: 300,
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false
                },
                events: {
                    mounted: (chartContext: any) => {
                        chartContext.toggleSeries('O2 Flow Rate');
                        chartContext.toggleSeries('Pulse');
                        chartContext.toggleSeries('Respiration');
                        chartContext.toggleSeries('SPO2');
                        chartContext.toggleSeries('Temperature');
                    }
                }
            } as ApexChart,

            stroke: {
                curve: 'smooth',
                width: 2
            } as ApexStroke,

            fill: {
                type: 'solid',
                opacity: 0.45
            } as ApexFill,

            markers: {
                size: 5,
                strokeWidth: 0,
                hover: {
                    size: 7
                }
            } as ApexMarkers,

            xaxis: {
                categories: xCategories,
                tickPlacement: 'between',
                labels: {
                    show: false
                },
            } as ApexXAxis,

            yaxis: {
                min: 0,
            } as ApexYAxis,

            tooltip: {
                shared: true,
                intersect: false,
                x: {
                    format: 'dd-MMM-yyyy HH:mm'
                }
            } as ApexTooltip,

            legend: {
                show: true
            } as ApexLegend,

            dataLabels: {
                enabled: false
            } as ApexLegend,

            colors: [
                '#60a5fa',
                '#374151',
                '#f97316',
                '#22c55e',
                '#7B7FF7',
                '#FF5C8A',
                '#eab308'
            ],
            title: {
                text: 'Vitals Trend',
                align: 'center',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1e293b'
                }
            },
        };
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
    FetchPatientSummaryDiagPFN: 'FetchPatientSummaryDiagPFN?UHID=${UHID}&Admissionid=${Admissionid}&SearchID=0&IsnewVisit=${IsnewVisit}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientVitalsByUHIDNPP: 'FetchPatientVitalsByUHIDNPP?UHID=${UHID}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalId=${HospitalId}',
    FetchPatientVitalsByPatientId_PFUHIDNN: 'FetchPatientVitalsByPatientId_PFUHIDNN?UHID=${UHID}&IPID=${IPID}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchRadOrderResultsPFNUHID: 'FetchRadOrderResultsPFNUHID?UHID=${UHID}&SearchID=${SearchID}&HospitalId=${HospitalId}',
    FetchRadOrderResultsPF: 'FetchRadOrderResultsPFN?fromDate=${fromDate}&ToDate=${ToDate}&UHID=${UHID}&PatientID=${PatientID}&AdmissionID=${AdmissionID}&SearchID=${SearchID}&HospitalID=${HospitalID}',
    FetchLabOrderResultsPFNUHID: 'FetchLabOrderResultsPFNUHID?UHID=${UHID}&SearchID=${SearchID}&HospitalId=${HospitalId}',
    FetchLabOrderResultsPF: 'FetchLabOrderResultsPFN?fromDate=${fromDate}&ToDate=${ToDate}&UHID=${UHID}&PatientID=${PatientID}&AdmissionID=${AdmissionID}&SearchID=${SearchID}&HospitalID=${HospitalID}',
    FetchCardOrderResultsPFNUHID: 'FetchCardOrderResultsPFNUHID?UHID=${UHID}&SearchID=${SearchID}&HospitalId=${HospitalId}',
    FetchCardOrderResultsPF: 'FetchCardOrderResultsPFN?fromDate=${fromDate}&ToDate=${ToDate}&UHID=${UHID}&PatientID=${PatientID}&AdmissionID=${AdmissionID}&SearchID=${SearchID}&HospitalID=${HospitalID}',
    FetchPatientOrderedOrPrescribedDrugs_PFN: 'FetchPatientOrderedOrPrescribedDrugs_PFN?UHID=${UHID}&PatientType=${PatientType}&IPID=${IPID}&PatientID=${PatientID}&SearchID=${SearchID}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchPatientAdmissionInvestigationsAndProceduresPFN: 'FetchPatientAdmissionInvestigationsAndProceduresPFN?UHID=${UHID}&Admissionid=${Admissionid}&IsnewVisit=${IsnewVisit}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
}