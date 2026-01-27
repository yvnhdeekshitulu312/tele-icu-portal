import { DatePipe } from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { Router } from "@angular/router";
import { Subscription, timer } from "rxjs";
import { UtilityService } from "src/app/shared/utility.service";
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from '../services/config.service';
import * as Highcharts from 'highcharts';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import moment from "moment";
import { ValidateEmployeeComponent } from "src/app/shared/validate-employee/validate-employee.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

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
    selector: 'app-icu-bed-details',
    templateUrl: './icu-bed-details.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE],
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
        DatePipe,
    ],
})
export class ICUBedDetailsComponent implements OnInit, OnDestroy {
    doctorDetails: any;
    wardID: any = '2090';
    langData: any;

    selectedICUBed: any = [];
    ICUBeds: any = []
    filteredICUBeds: any = [];
    refreshTime: any = new Date();
    private refreshSub!: Subscription;
    FetchDoctorReferralOrdersDataList: any = [];
    patientCaseRecVisits: any = [];
    trustedUrl: any;
    IsBiometric = true;

    isAreaSplineActive: boolean = false;
    isSplineActive: boolean = true;
    isLineActive: boolean = false;
    isColumnActive: boolean = false;
    activeButton: string = 'spline';
    tableVitalsList: any = [];
    tableVitalsListFiltered: any;
    tablePatientsForm!: FormGroup;

    charAreaSpline!: Highcharts.Chart
    @ViewChild('chartLineAreaSpline', { static: true }) chartLineAreaSpline!: ElementRef;
    @ViewChild('chartLineSpline', { static: true }) chartLineSpline!: ElementRef;
    @ViewChild('chartLine', { static: true }) chartLine!: ElementRef;
    @ViewChild('chartColumn', { static: true }) chartColumn!: ElementRef;

    currentDate: Date = new Date();
    firstDayOfWeek!: Date;
    lastDayOfWeek!: Date;
    currentWeekdate: any;
    currentWeekDates: any;
    calendarMedications: any = [];
    calendarFilteredMedications: any = [];
    drugDataArray: any[] = [];
    drugs: any[] = [];

    showProgressNotes: boolean = false;
    IsDoctor: any;
    IsRODoctor: any;

    searchText: any = '';
    activeMedications: any = [];
    activeMedicationsCount: any = [];
    viewProgressNotesData: any[] = [];
    viewProgressNotesData1: any = []
    viewProgressNotesData2: any = [];

    showResultsinPopUp: boolean = false;
    showPatientSummaryinPopUp: boolean = false;

    referralForm: any;
    locationList: any = [];
    SpecializationList: any = [];
    SpecializationList1: any = [];
    editIndex: any;
    listOfSpecItems: any;
    listOfSpecItems1: any;
    isEdit: boolean = false;
    referralList: any = [];
    referralRemarks: boolean = false;
    errorMessages: any = [];
    referralSpecialization: boolean = false;
    referralReason: boolean = false;
    referralPriority: boolean = false;
    Cosession: boolean = false;
    priorityList: any = [];
    reasonsList: any;
    referralType: number = 0;
    remarkForm: any;
    PatientDiagnosisDataList: any = [];
    FollowUpType: any = 0;
    FollowUpOn: any = moment(new Date()).format('DD-MMM-YYYY');
    patientAdviceData: any;
    resultsType: string = '';

    constructor(private router: Router, private us: UtilityService, private configService: ConfigService, private config: BedConfig, private datepipe: DatePipe, private formbuilder: FormBuilder, private modalSvc: NgbModal) {

    }

    ngOnInit(): void {
        this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
        this.IsRODoctor = sessionStorage.getItem("IsRODoctor");
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        this.langData = this.configService.getLangData();
        this.filteredICUBeds = this.ICUBeds = JSON.parse(sessionStorage.getItem("icubeds") || '{}');
        if (sessionStorage.getItem("icubeddetails")) {
            this.selectedICUBed = JSON.parse(sessionStorage.getItem("icubeddetails") || '{}');
            this.fetchICUBed();
        } else {
            this.navigateToICUBeds();
        }
        this.showActiveMedication();
        this.initializetablePatientsForm();
        this.initializeReferralForm();
        this.remarkForm = this.formbuilder.group({
            remarks: ['', [Validators.required]]
        });
    }

    ngOnDestroy() {
        if (this.refreshSub) {
            this.refreshSub.unsubscribe();
        }
        sessionStorage.removeItem('icubeds');
        sessionStorage.removeItem('icubeddetails');
    }

    onSelectBed(item: any) {
        this.selectedICUBed = item;
        this.showProgressNotes = false;
        this.fetchICUBed();
        this.showActiveMedication();
    }

    onRefreshClick() {
        this.showProgressNotes = false;
        this.fetchICUBed();
    }

    startAutoRefresh() {
        if (this.refreshSub) {
            this.refreshSub.unsubscribe();
        }

        this.refreshSub = timer(5 * 60 * 1000)
            .subscribe(() => {
                this.fetchICUBed();
            });
    }

    fetchICUBed() {
        const url = this.us.getApiUrl(ICUBedDetails.FetchBedsFromWardNPTeleICCU, {
            WardID: this.wardID,
            ConsultantID: 0,
            Status: 3,
            UserId: this.doctorDetails[0].UserId,
            HospitalID: 0,
            AdmissionID: this.selectedICUBed.AdmissionID
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.refreshTime = new Date();
                this.startAutoRefresh();
                const FetchBedsFromWardLabRadDataList = response.FetchBedsFromWardLabRadDataList;
                this.selectedICUBed = response.FetchBedsFromWardDataList.map((element: any) => {
                    const isFound = FetchBedsFromWardLabRadDataList.filter((a: any) => a.AdmissionID === element.AdmissionID);
                    const labResults: any[] = isFound.filter((a: any) => a.IsResult == '4');
                    const radResults: any[] = isFound.filter((a: any) => a.IsResult == '7');
                    return {
                        ...element,
                        isCritical: isFound.length >= 1,
                        labResults,
                        radResults
                    };
                })[0];

                this.viewProgressNotesData = response.FetchMainProgressNoteHHNewDataList;
                this.viewProgressNotesData1 = response.FetchMainProgressNoteHHNewData1List;
                this.viewProgressNotesData2 = response.FetchMainProgressNoteHHNewData2List;

                sessionStorage.setItem("icubeddetails", JSON.stringify(this.selectedICUBed));
            }
        });
    }

    navigateToICUBeds() {
        this.router.navigate(['/ward/icu-beds']);
    }

    filterNotes1(notes: any) {
        return this.viewProgressNotesData1.filter((x: any) => x.NoteID === notes[0].NoteID);
    }
    filterNotes2(notes: any) {
        return this.viewProgressNotesData2.filter((x: any) => x.NoteID === notes[0].NoteID);
    }

    onLogout() {
        this.configService.onLogout();
    }

    getTimeAgo(dateStr: string): string {
        const parsedDate = new Date(dateStr.replace(/-/g, ' '));
        const now = new Date();

        const diffMinutes = Math.floor((now.getTime() - parsedDate.getTime()) / 60000);

        if (diffMinutes < 1) return 'JUST NOW';
        if (diffMinutes < 60) return `${diffMinutes} MIN AGO`;

        return `${Math.floor(diffMinutes / 60)} HRS AGO`;
    }
    isNewResult(resultDate: string | Date, hours: number = 24): boolean {
        if (!resultDate) return false;

        const now = new Date().getTime();
        const resultTime = new Date(resultDate).getTime();

        const diffInHours = (now - resultTime) / (1000 * 60 * 60);
        return diffInHours <= hours;
    }

    fetchDoctorReferals() {
        this.FetchDoctorReferralOrdersDataList = [];
        this.config.FetchDoctorReferralOrders(this.selectedICUBed.AdmissionID, this.selectedICUBed.WardID, this.selectedICUBed.HospitalID).subscribe((response: any) => {
            if (response.Code == 200) {
                this.FetchDoctorReferralOrdersDataList = response.FetchDoctorReferralOrdersDataList;
                this.FetchDoctorReferralOrdersDataList.forEach((element: any, index: any) => {
                    element.isVerified = element?.IsVisited === 'True' ? true : false;
                    element.VerifiedBy = element.VisitUpdatedByName;
                    element.VerifiedDate = element.VisitedDate;
                    element.Comments = element.Comments;
                });
            }
        }, (error) => {
            console.error('Get Data API error:', error);
        });
    }

    openReferrals() {
        this.isEdit = false;
        this.Cosession = false;
        this.referralRemarks = false;
        this.referralSpecialization = false;
        this.referralReason = false;
        this.referralPriority = false;
        this.referralType = 0;

        this.initializeReferralForm();
        this.fetchHospitalLocations();
        this.fetchReferalAdminMasters();
        this.fetchReferralData();
        this.fetchPriority();
        this.fetchReasons();
        this.fetchDiagnosis();
        $('#viewReferal').modal('show');
    }

    openCaseRecord() {
        this.FetchPatientCaseRecord(this.selectedICUBed.AdmissionID, this.selectedICUBed.PatientID);
        this.showCareRecordModal();
        this.fetchPatientVisits();
    }

    FetchPatientCaseRecord(admissionId: any, patientId: any) {
        this.configService.FetchPatientCaseRecord(admissionId, patientId, 0, this.doctorDetails[0].UserName, this.doctorDetails[0]?.UserId, this.selectedICUBed.WardID, this.selectedICUBed.HospitalID)
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

    fetchPatientVisits() {
        this.configService.fetchPatientVisits(this.selectedICUBed.PatientID, this.selectedICUBed.HospitalID)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.patientCaseRecVisits = response.PatientVisitsDataList;
                }
            },
                (err) => {

                })
    }

    onVisitsChange(event: any) {
        const admissionID = event.target.value;
        const patientdata = this.patientCaseRecVisits.find((visit: any) => visit.AdmissionID == admissionID);
        this.FetchPatientCaseRecord(patientdata.AdmissionID, patientdata.PatientID);
    }

    initializetablePatientsForm() {
        this.tablePatientsForm = this.formbuilder.group({
            FromDate: [''],
            ToDate: [''],
        });
        var toDate = new Date();
        var fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 5);
        this.tablePatientsForm.patchValue({
            FromDate: fromDate,
            ToDate: toDate
        })
    }

    openVitals() {
        $('#vitalsModal').modal('show');
        this.GetVitalsData();
    }

    GetVitalsData() {
        var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
        var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
        this.configService.FetchIPPatientVitalsRR(this.selectedICUBed.IPID, FromDate, ToDate, this.selectedICUBed.HospitalID)
            .subscribe((response: any) => {
                if (response.Code == 200 && response.FetchIPPatientVitalsRRDataList.length > 0) {
                    this.tableVitalsList = response.FetchIPPatientVitalsRRDataList;
                    const distinctThings = response.FetchIPPatientVitalsRRDataList.filter(
                        (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.CreateDateNew === thing.CreateDateNew) === i);
                    this.tableVitalsListFiltered = distinctThings;
                    this.spline();
                }
            },
                (err) => {

                })
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
        this.tableVitalsList.forEach((element: any, index: any) => {

            if (type == 1) {
                element.VisitDate = element.CreateDateNew;
            }

            if (element.BPSystolic != 0) {
                BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
            }
            if (element.BPDiastolic != 0) {
                BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
            }
            if (element.O2FlowRate != 0) {
                O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
            }
            if (element.Pulse != 0) {
                PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
            }
            if (element.Respiration != 0) {
                RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
            }
            if (element.SPO2 != 0) {
                SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
            }
            TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
        });

        vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
        { name: 'BP-Diastolic', data: BPDiastolicData },
        { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
        { name: 'Pulse', data: PulseData, visible: false },
        { name: 'Respiration', data: RespirationData, visible: false },
        { name: 'SPO2', data: SPO2Data, visible: false },
        { name: 'Temparature', data: TemparatureData, visible: false }
        ];
        this.charAreaSpline = Highcharts.chart(this.chartLineAreaSpline.nativeElement, {
            chart: {
                type: 'areaspline',
                zoomType: 'x'
            },
            title: {
                text: null,
            },
            credits: {
                enabled: false,
            },
            legend: {
                enabled: true,
            },
            yAxis: {
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
                pointFormat: `<div>{series.name}: {point.y}</div>`,
                shared: true,
                useHTML: true,
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


        this.tableVitalsList.forEach((element: any, index: any) => {

            if (type == 1) {
                element.VisitDate = element.CreateDateTimeNew;
            }

            if (element.BPSystolic != 0) {
                BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
            }
            if (element.BPDiastolic != 0) {
                BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
            }
            if (element.O2FlowRate != 0) {
                O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
            }
            if (element.Pulse != 0) {
                PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
            }
            if (element.Respiration != 0) {
                RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
            }
            if (element.SPO2 != 0) {
                SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
            }
            TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
        });

        vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
        { name: 'BP-Diastolic', data: BPDiastolicData },
        { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
        { name: 'Pulse', data: PulseData, visible: false },
        { name: 'Respiration', data: RespirationData, visible: false },
        { name: 'SPO2', data: SPO2Data, visible: false },
        { name: 'Temparature', data: TemparatureData, visible: false }
        ];
        this.charAreaSpline = Highcharts.chart(this.chartLineSpline.nativeElement, {
            chart: {
                type: 'spline',
                zoomType: 'x'
            },
            title: {
                text: null,
            },
            credits: {
                enabled: false,
            },
            legend: {
                enabled: true,
            },
            yAxis: {
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
                pointFormat: `<div>{series.name}: {point.y}</div>`,
                shared: true,
                useHTML: true,
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

        this.tableVitalsList.forEach((element: any, index: any) => {
            if (type == 1) {
                element.VisitDate = element.CreateDateNew;
            }

            if (element.BPSystolic != 0) {
                BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
            }
            if (element.BPDiastolic != 0) {
                BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
            }
            if (element.O2FlowRate != 0) {
                O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
            }
            if (element.Pulse != 0) {
                PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
            }
            if (element.Respiration != 0) {
                RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
            }
            if (element.SPO2 != 0) {
                SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
            }
            TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
        });

        vitaldata = [
            { name: 'BP-Systolic', data: BPSystolicData },
            { name: 'BP-Diastolic', data: BPDiastolicData },
            { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
            { name: 'Pulse', data: PulseData, visible: false },
            { name: 'Respiration', data: RespirationData, visible: false },
            { name: 'SPO2', data: SPO2Data, visible: false },
            { name: 'Temparature', data: TemparatureData, visible: false }
        ];

        this.charAreaSpline = Highcharts.chart(this.chartLine.nativeElement, {
            chart: {
                type: 'line',
                zoomType: 'x'
            },
            title: {
                text: '',
            },
            credits: {
                enabled: false,
            },
            legend: {
                enabled: true,
            },
            yAxis: {
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
                pointFormat: `<div>{series.name}: {point.y}</div>`,
                shared: true,
                useHTML: true,
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

        this.tableVitalsList.forEach((element: any, index: any) => {
            if (type == 1) {
                element.VisitDate = element.CreateDateNew;
            }

            if (element.BPSystolic != 0) {
                BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
            }
            if (element.BPDiastolic != 0) {
                BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
            }
            if (element.O2FlowRate != 0) {
                O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
            }
            if (element.Pulse != 0) {
                PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
            }
            if (element.Respiration != 0) {
                RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
            }
            if (element.SPO2 != 0) {
                SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
            }
            TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
        });

        vitaldata = [
            { name: 'BP-Systolic', data: BPSystolicData },
            { name: 'BP-Diastolic', data: BPDiastolicData },
            { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
            { name: 'Pulse', data: PulseData, visible: false },
            { name: 'Respiration', data: RespirationData, visible: false },
            { name: 'SPO2', data: SPO2Data, visible: false },
            { name: 'Temparature', data: TemparatureData, visible: false }
        ];

        this.charAreaSpline = Highcharts.chart(this.chartColumn.nativeElement, {
            chart: {
                type: 'column',
                zoomType: 'x'
            },
            title: {
                text: null,
            },
            credits: {
                enabled: false,
            },
            legend: {
                enabled: true,
            },
            yAxis: {
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
                pointFormat: `<div>{series.name}: {point.y}</div>`,
                shared: true,
                useHTML: true,
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

    filterFunction(vitals: any, visitid: any) {
        return vitals.filter((buttom: any) => buttom.CreateDateNew == visitid);
    }


    openDrugChart() {
        $("#drugChartModal").modal('show');
        this.calculateWeekRange();
    }

    goToPreviousWeek() {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        this.calculateWeekRange();
    }

    goToNextWeek() {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        this.calculateWeekRange();
    }

    calculateWeekRange() {
        let currentDate = new Date(this.currentDate);
        this.firstDayOfWeek = new Date(currentDate.setDate(currentDate.getDate() - 1));
        this.lastDayOfWeek = new Date(this.firstDayOfWeek);
        this.lastDayOfWeek.setDate(this.firstDayOfWeek.getDate() + 6);

        this.currentWeekDates = this.generateDateRange(this.firstDayOfWeek, this.lastDayOfWeek);
        this.currentWeekdate = this.firstDayOfWeek;
        this.FetchDrugAdministrationDrugs(moment(this.firstDayOfWeek).format("DD-MMM-YYYY"), moment(this.lastDayOfWeek).format("DD-MMM-YYYY"));
    }

    generateDateRange(start: Date, end: Date): any {
        const datesArray = [];
        const currentDate = this.getDateWithoutTime(new Date(start));
        const todayDate = this.getDateWithoutTime(new Date());

        while (currentDate <= end) {
            let value = 1;
            if (currentDate < todayDate) {
                value = 1;
            }
            else if (currentDate.toISOString().split('T')[0] === todayDate.toISOString().split('T')[0]) {
                value = 2;
            }
            else if (currentDate > todayDate) {
                value = 3;
            }
            datesArray.push({ date: this.datepipe.transform(currentDate, "dd-MMM-yyyy"), value: value, CompletedCount: 0, AllCount: 0 });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return datesArray;
    }

    getDateWithoutTime(inputDate: Date): Date {
        const year = inputDate.getFullYear();
        const month = inputDate.getMonth();
        const day = inputDate.getDate();
        return new Date(year, month, day);
    }

    FetchDrugAdministrationDrugs(FromDate: any, ToDate: any) {
        this.configService.FetchDrugAdministrationDrugs(FromDate, ToDate, this.selectedICUBed.IPID, this.selectedICUBed.HospitalID).subscribe((response: any) => {
            if (response.Code == 200) {
                this.calendarMedications = response.FetchDrugAdministrationDrugsDataList;
                this.calendarFilteredMedications = response.FetchDrugAdministrationDrugsDataList;
                this.drugDataArray = [];
                const groupedData = response.FetchDrugAdministrationDrugsDataList.reduce((acc: any, currentValue: any) => {
                    const key = currentValue.Drugname + currentValue.FrequencyDate;
                    (acc[key] = acc[key] || []).push(currentValue);
                    return acc;
                }, {});

                for (const key in groupedData) {
                    if (groupedData.hasOwnProperty(key)) {
                        const group = groupedData[key];
                        const firstItem = group[0];
                        var Dose = firstItem.Dose + " " + firstItem.DoseUOMName + " " + firstItem.Frequency + " " + firstItem.AdmRoute + " " + firstItem.duration + " " + firstItem.durationUOM;
                        var StartDate = "Start Date - " + firstItem.StartFrom;
                        const drugData: any = {
                            Drugname: firstItem.Drugname + ';' + Dose + ';' + StartDate + ';' + firstItem.DoseUOMName + ';' + firstItem.Frequency + ';' + firstItem.AdmRoute + ';' + firstItem.duration + ';' + firstItem.durationUOM,
                            FrequencyDate: firstItem.FrequencyDate,
                            FrequencyDateTime: group.map((item: any) => {
                                let minDate = new Date(item.FrequencyDate);
                                minDate.setDate(minDate.getDate() - 1);
                                return {
                                    time: item.FrequencyDateTime,
                                    isEdit: false,
                                    wardTaskIntervalID: item.WardTaskIntervalID,
                                    remarks: '',
                                    drugName: firstItem.Drugname,
                                    statusName: item.STATUSName,
                                    date: new Date(item.FrequencyDate),
                                    minDate,
                                    savedRemarks: item.WardTaskRemarks,
                                    savedUserName: item.FreqTimeModifiedUserName,
                                    savedDate: item.FreqTimeModifiedDate
                                }
                            }),
                            DoseUOMName: firstItem.DoseUOMName,
                            Frequency: firstItem.Frequency,
                            AdmRoute: firstItem.AdmRoute,
                            duration: firstItem.duration,
                            durationUOM: firstItem.durationUOM,
                        };
                        this.drugDataArray.push(drugData);
                    }
                }

                const uniqueDrugNames = new Set(this.drugDataArray.map(item => item.Drugname));
                this.drugs = Array.from(uniqueDrugNames);
            }
        },
            (err) => { })
    }

    fetchMedicineForChart(date: any, drugName: any) {
        const result = this.drugDataArray?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date) && data.Drugname === drugName);
        if (result.length > 0) {
            result[0].FrequencyDateTime.forEach((element: any) => {
                const value = this.processTime(element, date, drugName.split(';')[0]);
                let pillName = 'Ppill';
                if (value === 'C') {
                    pillName = 'Cpill';
                } else if (value === 'H') {
                    pillName = 'Holdpill';
                } else if (value === 'U') {
                    pillName = 'UHpill';
                } else if (value === 'M') {
                    pillName = 'Mpill';
                } else if (value === 'F') {
                    pillName = 'Fpill';
                }
                element.timeValue = value;
                element.pillName = pillName;
            });
            return result[0].FrequencyDateTime;
        }
        return null;
    }

    processTime(inputTime: any, inputDate: any, drug: any) {
        let currentDate = new Date();

        const parts = inputDate.split('-');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = monthNames.indexOf(parts[1]);
        const inputDateTime = new Date(parts[2], monthIndex, parts[0], inputTime.time.split(':')[0], inputTime.time.split(':')[1]);

        inputDateTime.setHours(inputDateTime.getHours() - 2);

        const filteredData = this.calendarFilteredMedications.filter((item: any) => item.Drugname === drug && item.FrequencyDate === inputDate && item.FrequencyDateTime === inputTime.time);

        if (filteredData[0]?.STATUSName === 'Completed') {
            return "C";
        }
        if (filteredData[0]?.STATUSName === 'On Hold') {
            return "H";
        }
        if (filteredData[0]?.STATUSName === 'UnHold') {
            return "U";
        }


        if (new Date(inputDate) > currentDate) {
            return "F";
        }

        if (inputDateTime < currentDate) {
            return "M";
        } else if (inputDateTime > currentDate) {
            return "P";
        }
        return "N";
    }

    processTimeForCompletedStatus(inputTime: any, inputDate: any, drug: any, Type: number) {
        var ReturnContent: string = "";
        const parts = inputDate.split('-');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = monthNames.indexOf(parts[1]);
        const inputDateTime = new Date(parts[2], monthIndex, parts[0], inputTime.time.split(':')[0], inputTime.time.split(':')[1]);

        inputDateTime.setHours(inputDateTime.getHours() - 2);

        const filteredData = this.calendarFilteredMedications.filter((item: any) => item.Drugname === drug && item.FrequencyDate === inputDate && item.FrequencyDateTime === inputTime.time);

        if (filteredData[0]?.STATUSName === 'Completed') {
            if (Type == 1)
                ReturnContent = filteredData[0]?.AdminDose;
            if (Type == 2)
                ReturnContent = filteredData[0]?.AdministeredDoseUOM;
            if (Type == 3)
                ReturnContent = filteredData[0]?.AdministrationDate;
            if (Type == 4)
                ReturnContent = filteredData[0]?.AdministeredBy;
            if (Type == 5)
                ReturnContent = filteredData[0]?.VerifiedUser;
            if (Type == 6)
                ReturnContent = filteredData[0]?.Remarks;
            if (Type == 7)
                ReturnContent = filteredData[0]?.DrugAdmReasonSectionName;
            if (Type == 8)
                ReturnContent = filteredData[0]?.NotAdministeredReason;
            if (Type == 9)
                ReturnContent = filteredData[0]?.AdministerTimeDeviationReason;
            if (Type == 10)
                ReturnContent = filteredData[0]?.ManualEntryReason;
            return ReturnContent;
        }
        else {
            return "";
        }
    }

    fetchMedicineForChartlength(date: any, drugName: any) {
        const result = this.drugDataArray?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date) && data.Drugname === drugName);
        return result.length;
    }

    openProgressNotes() {
        this.showProgressNotes = true;
    }

    onCloseProgressNotes() {
        this.showProgressNotes = false;
    }

    filterBeds() {
        let data = [...this.ICUBeds];
        const search = this.searchText?.trim().toLowerCase();

        if (search && search.length > 2) {
            const search = this.searchText.toLowerCase();

            data = data.filter((x: any) =>
                x?.SSN?.toString().includes(search) ||
                x?.PatientName?.toLowerCase().includes(search)
            );
        }
        this.filteredICUBeds = data;
    }

    showActiveMedication() {
        const params = {
            PatientID: this.selectedICUBed.PatientID,
            AdmissionID: this.selectedICUBed.AdmissionID,
            WardID: this.selectedICUBed.WardID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.selectedICUBed.WardID,
            HospitalID: 3
        };
        const url = this.us.getApiUrl(ICUBedDetails.FetchPatientActiveMedication, params);
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.activeMedications = response.FetchPatientActiveMedicationDataList;
                this.activeMedicationsCount = response.FetchPatientActiveMedicationCountDataList[0]?.PrescriptionCount || 0;
            }
        },
            (err) => {
            });
    }

    openResults(event: any, type: string) {
        event.stopPropagation();
        this.resultsType = type;
        this.showResultsinPopUp = true;
        $("#viewResults").modal("show");
    }

    closeViewResultsPopup() {
        $("#viewResults").modal("hide");
        setTimeout(() => {
            this.showResultsinPopUp = false;
        }, 1000);
    }

    openPatientFolder() {
        this.showPatientSummaryinPopUp = true;
        sessionStorage.setItem("PatientID", this.selectedICUBed.PatientID);
        sessionStorage.setItem("SummaryfromCasesheet", 'true');
        $("#pateintFolderPopup").modal("show");
    }

    closePatientSummaryPopup() {
        $("#pateintFolderPopup").modal("hide");
        setTimeout(() => {
            this.showPatientSummaryinPopUp = false;
        }, 1000);
    }

    initializeReferralForm() {
        this.referralForm = this.formbuilder.group({
            Type: [1, Validators.required],
            Location: [0, Validators.required],
            LocationName: ['', Validators.required],
            DoctorID: ['', Validators.required],
            DoctorName: ['', Validators.required],
            Remarks: ['', Validators.required],
            Specialization: [0, Validators.required],
            SpecializationName: ['', Validators.required],
            Reason: [0, Validators.required],
            ReasonName: ['', Validators.required],
            Priority: [0, Validators.required],
            PriorityName: ['', Validators.required],
            Duration: ['', Validators.required],
            Cosession: [false, Validators.required],
            REFERRALORDERID: [0],
            BKD: [0],
            SpecialisationDoctorName: ['0', Validators.required],
            SpecialisationDoctorID: ['', Validators.required],
            StartDate: [''],
            EndDate: [''],
            adviceToPatient: [''],
            Status: [0],
            StatusName: ['']
        });
    }

    fetchHospitalLocations() {
        this.configService.fetchFetchHospitalLocations().subscribe((response) => {
            if (response.Status === "Success") {
                this.locationList = response.HospitalLocationsDataList;
                var res = response.HospitalLocationsDataList.filter((h: any) => h.HospitalID == this.selectedICUBed.HospitalID);
                this.referralForm.get('Location')?.setValue(res[0].HospitalID);
                this.referralForm.get('LocationName')?.setValue(res[0].Name);
            }
        },
            (err) => {

            })
    }

    fetchReferalAdminMasters() {
        this.configService.fetchConsulSpecialisationNew(
            'distinct SpecialiseID id,Specialisation name,Specialisation2l name2L,SpecializationCode code,blocked,Blocked BitBlocked,HospitalID HospitalID,IsPediatric',
            'IsConsPri=1 and IsReferral=1 and Blocked=0 and HospitalID=' + this.selectedICUBed.HospitalID,
            0, 0).subscribe((response) => {
                this.SpecializationList = this.SpecializationList1 = response.FetchConsulSpecialisationDataList;
            });
    }


    locationChange(data: any) {
        const selectedItem = this.locationList.find((value: any) => value.HospitalID === Number(data.target.value));
        this.referralForm.patchValue({
            Location: selectedItem.HospitalID,
            LocationName: selectedItem.Name
        });
    }

    searchSpecItem(event: any) {
        const item = event.target.value;
        this.SpecializationList = this.SpecializationList1;
        let arr = this.SpecializationList1.filter((spec: any) => spec.name.toLowerCase().indexOf(item.toLowerCase()) === 0);
        this.SpecializationList = arr.length ? arr : [{ name: 'No Item found' }];
    }

    deleteItem(item: any) {
        item.BKD = 1;
    }

    editRow(row: any, editIndex: any) {
        this.editIndex = editIndex;
        this.referralForm.patchValue({
            Type: row.Type,
            Location: row.Location,
            LocationName: row.LocationName,
            DoctorID: row.DoctorID,
            DoctorName: row.DoctorName,
            Remarks: row.Remarks,
            Specialization: row.Specialization,
            SpecializationName: row.SpecializationName,
            Reason: row.Reason,
            ReasonName: row.ReasonName,
            Priority: row.Priority,
            PriorityName: row.PriorityName,
            Duration: row.Duration,
            Cosession: row.Cosession,
            SpecialisationDoctorID: row.SpecialisationDoctorID,
            SpecialisationDoctorName: row.SpecialisationDoctorName
        });

        this.fetchSpecializationDoctorSearch();

        this.doctorType(row.Type);
        this.isEdit = true;
    }

    doctorType(type: any) {
        if (type == 1) {
            $("#btnInternal").addClass("selected");
            $("#btnExternal").removeClass("selected");
        }
        else {
            $("#btnInternal").removeClass("selected");
            $("#btnExternal").addClass("selected");
        }

        this.referralForm.patchValue({
            Type: type
        });
        this.listOfSpecItems = [];
    }

    fetchSpecializationDoctorSearch() {
        this.configService.fetchSpecialisationDoctors('%%%', this.referralForm.get("Specialization").value, this.doctorDetails[0].EmpId, this.selectedICUBed.HospitalID).subscribe((response: any) => {
            if (response.Code == 200) {
                this.listOfSpecItems = this.listOfSpecItems1 = response.FetchDoctorDataList;
                setTimeout(() => {
                    const selectedItem = this.listOfSpecItems.find((value: any) => Number(value.Empid) === Number(this.referralForm.get("SpecialisationDoctorID").value));
                    if (selectedItem) {
                        this.referralForm.patchValue({
                            SpecialisationDoctorName: selectedItem.EmpNo + ' - ' + selectedItem.Fullname,
                            SpecialisationDoctorID: selectedItem.Empid
                        });
                    }
                }, 500);

            }
        }, error => {
            console.error('Get Data API error:', error);
        });
    }

    onSpecItemSelected(event: any) {
        const item = this.SpecializationList.find((data: any) => data.name === event.option.value);
        var IsAdult = true;
        if (this.selectedICUBed.PatientType == '2' || this.selectedICUBed.PatientType === '4') {
            IsAdult = Number(this.selectedICUBed.AgeValue) >= 14 ? true : false;
        }
        else if (this.selectedICUBed.PatientType == '3') {
            IsAdult = Number(this.selectedICUBed.Age.trim().split(' ')[0]) >= 14 ? true : false;
        }
        else {
            if (this.selectedICUBed.Age.toString().trim().split(' ').length > 1) {
                const age = this.selectedICUBed.Age?.trim().split(' ')[0];
                IsAdult = Number(age) >= 14 ? true : false;
            }
            else {
                IsAdult = Number(this.selectedICUBed.Age) >= 14 ? true : false;
            }
        }
        this.referralForm.patchValue({
            Specialization: item.id,
            SpecializationName: item.name
        });
        this.fetchSpecializationDoctorSearch();
    }


    searchDocItem(event: any) {
        const item = event.target.value;
        if (this.referralForm.get("Specialization")?.value !== 0) {
            this.listOfSpecItems = this.listOfSpecItems1;
            let arr = this.listOfSpecItems1.filter((doc: any) => doc.Fullname.toLowerCase().indexOf(item.toLowerCase()) === 0);
            if (arr.length === 0) {
                arr = this.listOfSpecItems1.filter((proc: any) => proc.EmpNo.toLowerCase().indexOf(item.toLowerCase()) === 0);
            }
            this.listOfSpecItems = arr.length ? arr : [{ name: 'No Item found' }];
        }
        else {
            if (item.length > 2) {
                this.fetchDoctors(item);
            }
        }
    }

    fetchDoctors(item: any) {
        this.configService.fetchSpecialisationDoctors(item, 0, this.doctorDetails[0].EmpId, this.selectedICUBed.HospitalID).subscribe((response: any) => {
            if (response.Code == 200) {
                this.listOfSpecItems = this.listOfSpecItems1 = response.FetchDoctorDataList;
            }
        }, error => {
            console.error('Get Data API error:', error);
        });
    }

    fetchReferralData() {
        this.referralList = [];
        this.configService.fetchAdviceData(this.selectedICUBed.AdmissionID, this.selectedICUBed.HospitalID).subscribe((response) => {
            if (response.PatientAdviceDatasList.length > 0) {
                this.patientAdviceData = response.PatientAdviceDatasList[0];
            }
            if (response.PatientAdviceReferalDataList.length > 0) {
                response.PatientAdviceReferalDataList.forEach((element: any, index: any) => {
                    const selectedItem = this.locationList.find((value: any) => value.HospitalID === Number(element.LocationID));
                    let refer = {
                        "Type": element.IsInternalReferral === true ? 1 : 0,
                        "Location": selectedItem.HospitalID,
                        "LocationName": selectedItem.Name,
                        "SpecialisationDoctorID": element.DoctorID,
                        "SpecialisationDoctorName": element.DoctorName,
                        "Remarks": element.Remarks,
                        "Specialization": element.SpecialiseID,
                        "SpecializationName": element.Specialisation,
                        "Reason": element.ReasonID,
                        "ReasonName": element.ReasonName,
                        "Priority": element.Priority,
                        "PriorityName": element.PriorityName,
                        "Duration": element.duration,
                        "Cosession": element.CoSession,
                        "REFERRALORDERID": element.ReferralOrderID,
                        "BKD": 0,
                        "StartDate": element.StartDate,
                        "EndDate": element.EndDate,
                        "Status": element.Status,
                        "StatusName": element.StatusName,
                        "AcceptRejectRemarks": element.AcceptRejectRemarks,
                        "IsVisited": element.IsVisited,
                        "IsVisitedUpdatedBy": element.IsVisitedUpdatedBy,
                        "VisitUpdatedByName": element.VisitUpdatedByName
                    };

                    this.referralList.push(refer);
                });
            }
        },
            (err) => {

            })

    }

    addReferral() {
        this.errorMessages = [];
        if (!this.referralForm.get("Location").value || this.referralForm.get("Location").value === "0") {
            this.errorMessages.push("Select Refer to Location")
        }

        if (!this.referralForm.get("SpecialisationDoctorName").value) {
            this.errorMessages.push("Add the Specialization Doctor Details")
        }

        if (!this.referralForm.get("Remarks").value) {
            this.referralRemarks = true;
            this.errorMessages.push("Enter Referral Remarks")
        }

        if (!this.referralForm.get("Specialization").value || this.referralForm.get("Specialization").value === "0") {
            this.referralSpecialization = true;
            this.errorMessages.push("Select Specialization")
        }

        if (!this.referralForm.get("Reason").value || this.referralForm.get("Reason").value === "0") {
            this.referralReason = true;
            this.errorMessages.push("Select Reason")
        }

        if (!this.referralForm.get("Priority").value || this.referralForm.get("Priority").value === "0") {
            this.referralPriority = true;
            this.errorMessages.push("Select Priority")
        }

        if (this.referralForm.get("Duration").value === "0" && this.selectedICUBed.PatientType !== '1') {
            this.referralRemarks = true;
            this.errorMessages.push("Duration cant be zero")
        }
        const refDocExists = this.referralList.filter((x: any) => x.SpecialisationDoctorID === this.referralForm.get("SpecialisationDoctorID").value);
        if (refDocExists.length > 0 && (this.selectedICUBed.PatientType === '2' || this.selectedICUBed.PatientType === '4')) {
            refDocExists.forEach((element: any, index: any) => {
                const today = new Date();
                const enddate = new Date(element.EndDate);
                if (today < enddate) {
                    this.errorMessages.push("Referral Doctor Already Added");
                }
            });
        }
        if (this.errorMessages.length > 0) {
            $("#errorAdviceMsg").modal('show');
            return;
        }
        this.referralForm.patchValue({
            "Status": '0',
            "StatusName": "New Request"
        });

        var res = this.locationList.filter((h: any) => h.HospitalID == this.selectedICUBed.HospitalID);
        if (this.selectedICUBed.PatientType === '2' || this.selectedICUBed.PatientType === '4') {
            var enddate = new Date(new Date().setDate(new Date().getDate() + Number(this.referralForm.get("Duration").value)));
            this.referralForm.patchValue({
                "StartDate": moment(new Date()).format('DD-MMM-YYYY'),
                "EndDate": moment(enddate).format('DD-MMM-YYYY')

            });
        }

        this.referralList.push(this.referralForm.value);
        this.initializeReferralForm();

        if (this.locationList.length == 1) {
            this.referralForm.get('Location')?.setValue(this.locationList[0].HospitalID);
            this.referralForm.get('LocationName')?.setValue(this.locationList[0].Name);
        }

        this.doctorType(1);
        this.saveReferral();
    }

    updateReferral() {
        this.errorMessages = [];
        if (!this.referralForm.get("Location").value || this.referralForm.get("Location").value === "0") {
            this.errorMessages.push("Select Refer to Location")
        }

        if (!this.referralForm.get("SpecialisationDoctorName").value) {
            this.errorMessages.push("Add the Specialization Doctor Details")
        }

        if (!this.referralForm.get("Remarks").value) {
            this.errorMessages.push("Enter Referral Remarks")
        }

        if (!this.referralForm.get("Specialization").value || this.referralForm.get("Specialization").value === "0") {
            this.errorMessages.push("Select Specialization")
        }

        if (!this.referralForm.get("Reason").value || this.referralForm.get("Reason").value === "0") {
            this.errorMessages.push("Select Reason")
        }

        if (!this.referralForm.get("Priority").value || this.referralForm.get("Priority").value === "0") {
            this.errorMessages.push("Select Priority")
        }

        if (this.errorMessages.length > 0) {
            $("#errorAdviceMsg").modal('show');
            return;
        }

        this.isEdit = false;
        var enddate = new Date(new Date().setDate(new Date().getDate() + Number(this.referralForm.get("Duration").value)));
        this.referralForm.patchValue({
            "StartDate": moment(new Date()).format('DD-MMM-YYYY'),
            "EndDate": moment(enddate).format('DD-MMM-YYYY')
        });

        this.referralList[this.editIndex].Type = this.referralForm.get("Type").value;
        this.referralList[this.editIndex].Location = this.referralForm.get("Location").value;
        this.referralList[this.editIndex].LocationName = this.referralForm.get("LocationName").value;
        this.referralList[this.editIndex].DoctorID = this.referralForm.get("DoctorID").value;
        this.referralList[this.editIndex].DoctorName = this.referralForm.get("DoctorName").value;
        this.referralList[this.editIndex].Remarks = this.referralForm.get("Remarks").value;
        this.referralList[this.editIndex].Specialization = this.referralForm.get("Specialization").value;
        this.referralList[this.editIndex].SpecializationName = this.referralForm.get("SpecializationName").value;
        this.referralList[this.editIndex].Reason = this.referralForm.get("Reason").value;
        this.referralList[this.editIndex].ReasonName = this.referralForm.get("ReasonName").value;
        this.referralList[this.editIndex].Priority = this.referralForm.get("Priority").value;
        this.referralList[this.editIndex].PriorityName = this.referralForm.get("PriorityName").value;
        this.referralList[this.editIndex].Duration = this.referralForm.get("Duration").value;
        this.referralList[this.editIndex].Cosession = this.referralForm.get("Cosession").value;
        this.referralList[this.editIndex].SpecialisationDoctorName = this.referralForm.get("SpecialisationDoctorName").value;
        this.referralList[this.editIndex].SpecialisationDoctorID = this.referralForm.get("SpecialisationDoctorID").value;
        this.referralList[this.editIndex].StartDate = this.referralForm.get("StartDate").value;
        this.referralList[this.editIndex].EndDate = this.referralForm.get("EndDate").value;

        this.initializeReferralForm();

        if (this.locationList.length == 1) {
            this.referralForm.get('Location')?.setValue(this.locationList[0].HospitalID);
            this.referralForm.get('LocationName')?.setValue(this.locationList[0].Name);
        }

        this.doctorType(1);
    }

    cosessionClick() {
        this.Cosession = !this.Cosession;
        this.referralForm.patchValue({
            Cosession: this.Cosession
        })
    }

    fetchPriority() {
        this.configService.fetchPriority().subscribe((response) => {
            this.priorityList = response.SmartDataList;
        });
    }

    priorityChange(data: any) {
        const selectedItem = this.priorityList.find((value: any) => value.id === Number(data.target.value));
        this.referralForm.patchValue({
            Priority: selectedItem.id,
            PriorityName: selectedItem.name
        });
    }

    fetchReasons() {
        this.configService.fetchAdminMasters(76).subscribe((response) => {
            this.reasonsList = response.SmartDataList;
        });
    }

    reasonChange(data: any) {
        const selectedItem = this.reasonsList.find((value: any) => value.id === Number(data.target.value));
        this.referralForm.patchValue({
            Reason: selectedItem.id,
            ReasonName: selectedItem.name
        });
    }

    onDocItemSelected(event: any) {
        const empno = event?.option.value.split('-')[0];
        const item = this.listOfSpecItems.find((x: any) => x.EmpNo.trim() === empno.trim());
        this.referralForm.patchValue({
            SpecialisationDoctorName: item.EmpNo + '-' + item.Fullname,
            SpecialisationDoctorID: item.Empid
        });
        if (this.referralForm.get("Specialization")?.value === 0) {
            $("#Specialization").val(item.specialisation);
            this.referralForm.patchValue({
                Specialization: item.specialiseid,
                SpecializationName: item.specialisation
            });
        }
    }

    saveReferralConfirmation(type: number) {
        this.referralType = type;
        $("#swPhyDietConfirmationPopup").modal("show");
    }

    openRemarks() {
        this.remarkForm.patchValue({
            remarks: ''
        });
        $("#swPhyDietConfirmationPopup").modal("hide");
        $("#referRemarks").modal("show");
    }

    closeRemarks() {
        this.referralType = 0;
        $("#referRemarks").modal("hide");
    }

    cancelReferral() {
        this.referralType = 0;
        $("#swPhyDietConfirmationPopup").modal("hide");
    }

    fetchDiagnosis() {
        this.configService.fetchAdviceDiagnosis(this.selectedICUBed.AdmissionID, this.selectedICUBed.HospitalID).subscribe((response) => {
            this.PatientDiagnosisDataList = response.PatientDiagnosisDataList;
            this.PatientDiagnosisDataList.forEach((element: any, index: any) => {
                element.selected = true;
            });
        },
            (err) => {

            })
    }

    saveReferral() {
        var diagnosis: any[] = [];
        $("#referRemarks").modal("hide");
        let remarks = this.remarkForm.get('remarks').value ? this.remarkForm.get('remarks').value : '';
        this.PatientDiagnosisDataList.forEach((element: any) => {
            if (element.selected) {
                diagnosis.push({
                    "DID": element.DID,
                    "DISEASENAME": element.DiseaseName,
                    "CODE": element.Code,
                    "DTY": element.DiagnosisType,
                    "UID": this.doctorDetails[0].EmpId,
                    "ISEXISTING": "1",
                    "PPID": "0",
                    "STATUS": element.STATUS,
                    "DTID": element.DTID,
                    "DIAGNOSISTYPEID": element.DIAGNOSISTYPEID,
                    "ISPSD": "0",
                    "REMARKS": "",
                    "MNID": element.MonitorID,
                    "IAD": "1"
                })
            }
        });
        const refDetailsList = []
        this.referralList.forEach((element: any, index: any) => {
            refDetailsList.push({
                "RTID": element.Reason,
                "SPID": element.Specialization,
                "PRTY": element.Priority,
                "DID": element.SpecialisationDoctorID,
                "RMKS": element.Remarks,
                "BKD": element.BKD,
                "RRMKS": "0",
                "RID": element.Reason,
                "DRN": 1,//element.Duration,
                "IIRF": element.Type,
                "COSS": element.Cosession === true ? 1 : 0,
                "RHOSPID": element.Location,
                "REFERRALORDERID": element.REFERRALORDERID
            })
        });
        if (this.referralType === 1 || this.referralType === 2) {
            refDetailsList.push({
                "RTID": 1,
                "SPID": this.referralType === 1 ? 317 : this.referralType === 2 ? 101 : this.referralType === 2 ? 264 : 0,
                "PRTY": 1,
                "DID": "",
                "RMKS": remarks,
                "BKD": 0,
                "RRMKS": remarks,
                "RID": 1,
                "DRN": "1",
                "IIRF": 1,
                "COSS": 1,
                "RHOSPID": this.selectedICUBed.hospitalId,
                "REFERRALORDERID": 0
            });
        }
        let payload = {
            "intMonitorID": this.patientAdviceData?.MonitorID ?? 0,
            "PatientID": this.selectedICUBed.PatientID,
            "DoctorID": this.doctorDetails[0].EmpId,
            "IPID": this.selectedICUBed.AdmissionID,
            "SpecialiseID": this.selectedICUBed.SpecialiseID,
            "PatientType": this.selectedICUBed.PatientType,
            "BillID": this.selectedICUBed.BillID,
            "FollowUpType": this.FollowUpType,
            "Advicee": this.patientAdviceData?.Advice ?? '',
            "FollowAfter": this.patientAdviceData?.FollowAfter ?? 0,
            "FollowUpOn": this.FollowUpOn,
            "DiagDetailsList": diagnosis,
            "ReasonforAdm": this.patientAdviceData?.ReasonForAdm ?? '',
            "RefDetailsList": refDetailsList,
            "LengthOfStay": this.patientAdviceData?.LengthOfStay ? this.patientAdviceData.LengthOfStay : 0,
            "DietTypeID": this.patientAdviceData?.DietTypeID ? this.patientAdviceData.DietTypeID : 0,
            "FollowUpRemarks": '',
            "PrimaryDoctorID": this.doctorDetails[0].EmpId,
            "AdmissionTypeID": this.patientAdviceData?.AdmissionTypeID ?? 0,
            "FollowUpCount": '0',
            "Followupdays": '0',
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.selectedICUBed.WardID,
            "HospitalID": sessionStorage.getItem('hospitalId'),
            "BillType": this.selectedICUBed.BillType == 'Insured' ? 'CR' : 'CS',
            "CompanyID": this.selectedICUBed.CompanyID == "" ? 0 : this.selectedICUBed.CompanyID,
            "GradeID": this.selectedICUBed.GradeID,
            "WardID": 0,
            "PrimaryDoctorSpecialiseID": 0
        }

        const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
            backdrop: 'static'
        });
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
            if (data.success) {
                this.configService.saveAdviceReferral(payload).subscribe((response: any) => {
                    if (response.Status === "Success" || response.Status === "True") {
                        this.fetchReferralData();
                        this.referralType = 0;
                    }
                },
                    () => {

                    })
            }
            if (!data.success) {
                this.referralType = 0;
            }
            modalRef.close();
        });
    }
}

const ICUBedDetails = {
    'FetchBedsFromWardNPTeleICCU': 'FetchBedsFromWardNPTeleICCU?WardID=${WardID}&AdmissionID=${AdmissionID}&ConsultantID=${ConsultantID}&Status=${Status}&UserId=${UserId}&HospitalID=${HospitalID}',
    'FetchPatientActiveMedication': 'FetchPatientActiveMedication?PatientID=${PatientID}&AdmissionID=${AdmissionID}&WardID=${WardID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
}