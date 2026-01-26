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
import { FormBuilder, FormGroup } from "@angular/forms";
import moment from "moment";

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

    constructor(private router: Router, private us: UtilityService, private configService: ConfigService, private config: BedConfig, private datepipe: DatePipe, private formbuilder: FormBuilder) {

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
        this.fetchDoctorReferals();
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

    openResults(event: any) {
        event.stopPropagation();
        this.showResultsinPopUp = true;
        $("#viewResults").modal("show");
    }

    closeViewResultsPopup() {
        $("#viewResults").modal("hide");
        setTimeout(() => {
            this.showResultsinPopUp = false;
        }, 1000);
    }
}

const ICUBedDetails = {
    'FetchBedsFromWardNPTeleICCU': 'FetchBedsFromWardNPTeleICCU?WardID=${WardID}&AdmissionID=${AdmissionID}&ConsultantID=${ConsultantID}&Status=${Status}&UserId=${UserId}&HospitalID=${HospitalID}',
    'FetchPatientActiveMedication': 'FetchPatientActiveMedication?PatientID=${PatientID}&AdmissionID=${AdmissionID}&WardID=${WardID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
}