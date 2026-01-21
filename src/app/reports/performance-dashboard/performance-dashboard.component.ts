import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { UtilityService } from "src/app/shared/utility.service";
declare var bootstrap: any;

const MY_FORMATS = {
    parse: {
        dateInput: 'DD-MMM-YYYY HH:mm:ss',
    },
    display: {
        dateInput: 'DD-MMM-YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'DD-MMM-YYYY',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-performance-dashboard',
    templateUrl: './performance-dashboard.component.html',
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

export class PerformanceDashboardComponent implements OnInit {
    hospitalID: any;
    doctorDetails: any;
    errorMsg: any = '';
    facilityId: any;
    quarters = [
        { id: 'Q1', label: 'Q1', start: '01-Jan', end: '31-Mar' },
        { id: 'Q2', label: 'Q2', start: '01-Apr', end: '30-Jun' },
        { id: 'Q3', label: 'Q3', start: '01-Jul', end: '30-Sep' },
        { id: 'Q4', label: 'Q4', start: '01-Oct', end: '31-Dec' }
    ];
    Months = [
        { id: '1', label: 'Jan', start: '01-Jan', end: '31-Jan' },
        { id: '2', label: 'Feb', start: '01-Feb', end: '28-Feb' },
        { id: '3', label: 'Mar', start: '01-Mar', end: '31-Mar' },
        { id: '4', label: 'Apr', start: '01-Apr', end: '30-Apr' },
        { id: '5', label: 'May', start: '01-May', end: '31-May' },
        { id: '6', label: 'Jun', start: '01-Jun', end: '30-Jun' },
        { id: '7', label: 'Jul', start: '01-Jul', end: '31-Jul' },
        { id: '8', label: 'Aug', start: '01-Aug', end: '31-Aug' },
        { id: '9', label: 'Sep', start: '01-Sep', end: '30-Sep' },
        { id: '10', label: 'Oct', start: '01-Oct', end: '31-Oct' },
        { id: '11', label: 'Nov', start: '01-Nov', end: '30-Nov' },
        { id: '12', label: 'Dec', start: '01-Dec', end: '31-Dec' }

    ];

    years: any;

    selectedQuarter: any;
    selectedId: any;
    performanceDashBoardStatistics: any = {};
    revenueData: any;
    rejectionsData: any;
    revenueDataDetailedOP: any;
    revenueDataDetailedIP: any;
    revenueChartData: any;
    revenueChartIPData: any;
    revenueChartOPData: any;
    rejectionsChartData: any;
    standOPData: any;
    standIPData: any;
    standOPChartData: any;
    standIPChartData: any;
    standRevenueData: any;
    standRejectionsData: any;
    standRevenueChartData: any;
    standRejectionsChartData: any;
    currentYear: number = 0;

    constructor(private us: UtilityService) {
        this.hospitalID = sessionStorage.getItem("hospitalId");
        const facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = facility.FacilityID == undefined ? facility : facility.FacilityID
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    }

    ngOnInit(): void {
        const currentYear = new Date().getFullYear();
        this.years = [currentYear];
        this.currentYear = currentYear;
        const currentMonth = new Date().getMonth() + 1;
        this.selectedId = currentMonth;
        let selectedQuarter;
        if (currentMonth <= 3) {
            selectedQuarter = this.quarters[0];
        } else if (currentMonth <= 6) {
            selectedQuarter = this.quarters[1];
        } else if (currentMonth <= 9) {
            selectedQuarter = this.quarters[2]
        } else {
            selectedQuarter = this.quarters[3];
        }
        this.selectedQuarter = selectedQuarter;
        this.fetchData();
    }

    onChangeYear() {
        this.fetchData();
    }
    onChangeMonth(event: any) {
        const value = (event.target as HTMLSelectElement).value;
        this.selectedQuarter = this.Months.find(m => m.id === this.selectedId);
        //this.selectedQuarter = quarter;
        this.fetchData();
    }

    onSelectQuarter(quarter: any) {
        if (this.selectedQuarter.id === quarter.id) {
            return;
        }
        this.selectedQuarter = quarter;
        this.fetchData();
    }

    fetchData() {
        const fromdate = `${this.selectedQuarter.start}-${this.currentYear}`;
        const todate = `${this.selectedQuarter.end}-${this.currentYear}`;
        this.fetchPerformanceStatistics(fromdate, todate);
        this.fetchPerformanceRevenueRejections(fromdate, todate);
        this.fetchPerformanceStandOPIP(fromdate, todate);
        this.fetchPerformanceStandRevenueRejections(fromdate, todate);
    }

    fetchPerformanceStatistics(fromdate: any, todate: any) {
        const url = this.us.getApiUrl(PerformanceDashboard.FetchMyPerformanceDashBoardStatistics, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.hospitalID,
            DoctorID: this.doctorDetails[0]?.EmpId,
            DepartmentID: this.doctorDetails[0]?.DepartmentID
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code == 200 && response.FetchMyPerformanceDashBoardStatistics1DataList.length > 0) {
                this.performanceDashBoardStatistics = response.FetchMyPerformanceDashBoardStatistics1DataList[0];
            } else {
                this.performanceDashBoardStatistics = {};
            }
        });
    }

    fetchPerformanceRevenueRejections(fromdate: any, todate: any) {
        const url = this.us.getApiUrl(PerformanceDashboard.FetchMyPerformanceDashBoardRevenueRejections, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.hospitalID,
            DoctorID: this.doctorDetails[0]?.EmpId,
            DepartmentID: this.doctorDetails[0]?.DepartmentID
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code == 200) {
                this.revenueData = response.FetchMyPerformanceDashBoardRevenueRejections1DataList[0];
                this.rejectionsData = response.FetchMyPerformanceDashBoardRevenueRejections2DataList;
                this.revenueDataDetailedOP = response.FetchMyPerformanceDashBoardRevenueRejections3DataList.filter((x: any) => x.PatientType == 'OP');
                this.revenueDataDetailedIP = response.FetchMyPerformanceDashBoardRevenueRejections3DataList.filter((x: any) => x.PatientType == 'IP');
                this.loadRevenueChart();
                this.loadRevenueChartIP();
                this.loadRevenueChartOP();
                this.loadRejectionsChart();
            } else {
                this.revenueData = null;
                this.revenueDataDetailedOP = null;
                this.revenueDataDetailedIP = null;
                this.rejectionsData = null;
                this.revenueChartData = null;
                this.revenueChartIPData = null;
                this.revenueChartOPData = null;
                this.rejectionsChartData = null;
            }
        });
    }


    loadRevenueChart() {
        this.revenueChartData = {};
        this.revenueChartData.series = [
            {
                name: 'Revenue',
                data: [+this.revenueData.OPRevenuePer, +this.revenueData.IPRevenuePer]
            }
        ];

        this.revenueChartData.chart = {
            height: 170,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.revenueChartData.plotOptions = {
            bar: {
                columnWidth: '40px',
                distributed: false,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.revenueChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#000000'],
                fontSize: '8px',
            },
            formatter: (val: number) => `${val}%`,
            offsetY: -15,
        };

        this.revenueChartData.colors = ['#708871'];

        this.revenueChartData.xaxis = {
            categories: ['OP', 'IP'],
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                }
            }
        };

        this.revenueChartData.title = {
            text: 'Revenue',
            align: 'start',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.revenueChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => `${val}%`
            }
        };

        this.revenueChartData.yaxis = {
            min: 0,
            max: 100,
            labels: {
                formatter: (value: any) => {
                    return Math.round(value);
                }
            }
        };
    }
    loadRevenueChartIP() {
        this.revenueChartIPData = {};
        this.revenueChartIPData.series = [
            {
                name: 'IP Revenue',
                data: this.revenueDataDetailedIP.map((item: any) => +item.TotalRejectionsPer)
            }
        ];

        this.revenueChartIPData.chart = {
            height: 170,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.revenueChartIPData.plotOptions = {
            bar: {
                columnWidth: '40px',
                distributed: false,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.revenueChartIPData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#000000'],
                fontSize: '8px',
            },
            formatter: (val: number) => `${val}%`,
            offsetY: -15,
        };

        this.revenueChartIPData.colors = ['#B4B4B8'];

        this.revenueChartIPData.xaxis = {
            categories: this.revenueDataDetailedIP.map((item: any) => item.ServiceName),
            labels: {
                rotate: 0,
                trim: true,
                style: {
                    fontSize: '12px'
                }
            }
        };

        this.revenueChartIPData.title = {
            text: 'IP Revenue',
            align: 'start',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.revenueChartIPData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => `${val}%`
            }
        };

        this.revenueChartIPData.yaxis = {
            min: 0,
            max: 100,
            labels: {
                formatter: (value: any) => {
                    return Math.round(value);
                }
            }
        };
    }
    loadRevenueChartOP() {
        this.revenueChartOPData = {};
        this.revenueChartOPData.series = [
            {
                name: 'OP Revenue',
                data: this.revenueDataDetailedOP.map((item: any) => +item.TotalRejectionsPer)
            }
        ];

        this.revenueChartOPData.chart = {
            height: 170,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.revenueChartOPData.plotOptions = {
            bar: {
                columnWidth: '40px',
                distributed: false,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.revenueChartOPData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#000000'],
                fontSize: '8px',
            },
            formatter: (val: number) => `${val}%`,
            offsetY: -15,
        };

        this.revenueChartOPData.colors = ['#ECEE81'];

        this.revenueChartOPData.xaxis = {
            categories: this.revenueDataDetailedOP.map((item: any) => item.ServiceName),
            labels: {
                rotate: 0,
                trim: true,
                style: {
                    fontSize: '12px'
                }
            }
        };

        this.revenueChartOPData.title = {
            text: 'OP Revenue',
            align: 'start',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.revenueChartOPData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => `${val}%`
            }
        };

        this.revenueChartOPData.yaxis = {
            min: 0,
            max: 100,
            labels: {
                formatter: (value: any) => {
                    return Math.round(value);
                }
            }
        };
    }

    loadRejectionsChart() {
        this.rejectionsChartData = {};
        this.rejectionsChartData.series = [
            {
                name: 'Rejections',
                data: this.rejectionsData.map((item: any) => +item.TotalRejectionsPer)
            }
        ];

        this.rejectionsChartData.chart = {
            height: 170,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.rejectionsChartData.plotOptions = {
            bar: {
                columnWidth: '40px',
                distributed: false,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.rejectionsChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#000000'],
                fontSize: '8px',
            },
            formatter: (val: number) => `${val}%`,
            offsetY: -15
        };

        this.rejectionsChartData.colors = ['#D37676'];

        this.rejectionsChartData.xaxis = {
            categories: this.rejectionsData.map((item: any) => item.ServiceName),
            labels: {
                rotate: 0,
                trim: true,
                style: {
                    fontSize: '12px'
                }
            }
        };

        this.rejectionsChartData.title = {
            text: 'Rejections',
            align: 'start',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.rejectionsChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => `${val}%`
            }
        };

        this.rejectionsChartData.yaxis = {
            min: 0,
            max: 100,
            labels: {
                formatter: (value: any) => {
                    return Math.round(value);
                }
            }
        };
    }

    fetchPerformanceStandOPIP(fromdate: any, todate: any) {
        const url = this.us.getApiUrl(PerformanceDashboard.FetchMyPerformanceDashBoardWhereDoIStandOPIP, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.hospitalID,
            DoctorID: this.doctorDetails[0]?.EmpId,
            DepartmentID: this.doctorDetails[0]?.DepartmentID
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code == 200) {
                this.standOPData = response.FetchMyPerformanceDashBoardWhereDoIStandOPIP1DataList;
                this.standIPData = response.FetchMyPerformanceDashBoardWhereDoIStandOPIP2DataList;
                this.loadStandIPData();
                this.loadStandOPData();
            } else {
                this.standIPData = null;
                this.standOPData = null;
                this.standIPChartData = null;
                this.standOPChartData = null;
            }
        });
    }

    loadStandOPData() {
        this.standOPChartData = {};
        this.standOPChartData.series = [
            {
                name: 'OP',
                data: this.standOPData.map((item: any) => +item.TotalOutPatients_Per)
            }
        ];

        this.standOPChartData.chart = {
            height: 250,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.standOPChartData.plotOptions = {
            bar: {

                distributed: false,
                dataLabels: {
                    position: 'top'
                }
            }
        };


        this.standOPChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#000000'],
                fontSize: '8px',
            },
            offsetY: -20,
            background: { enabled: false, borderRadius: 5, },
            formatter: (val: number) => `${val}%`,



        };

        this.standOPChartData.xaxis = {
            categories: this.standOPData.map((item: any) => {
                return item.DoctorID == this.doctorDetails[0].EmpId ? 'You are Here' : ''
            }),
            labels: {
                rotate: 0,
                trim: false,
                style: {
                    fontSize: '12px',
                    fontWeight: 600
                },


            }
        };

        this.standOPChartData.title = {
            text: 'Outpatient Comparison',
            align: 'start',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.standOPChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => `${val}%`
            }
        };

        this.standOPChartData.colors = [
            ({ dataPointIndex }: { dataPointIndex: number }) =>
                this.standOPData[dataPointIndex]?.DoctorID == this.doctorDetails[0].EmpId
                    ? '#F94C10'
                    : '#A7AAE1'
        ];

        this.standOPChartData.yaxis = {
            min: 0,
            max: 100,
            labels: {
                formatter: (value: any) => {
                    return Math.round(value);
                }
            }
        };
    }

    loadStandIPData() {
        this.standIPChartData = {};
        this.standIPChartData.series = [
            {
                name: 'IP',
                data: this.standIPData.map((item: any) => +item.TotalAdmissions_Per)
            }
        ];

        this.standIPChartData.chart = {
            height: 250,
            type: 'bar',
            stacked: false,
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.standIPChartData.plotOptions = {
            bar: {
                distributed: false,
                dataLabels: {
                    position: 'top',
                    orientation: 'vertical'
                }
            }
        };

        this.standIPChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#000000'],
                fontSize: '8px',
            },
            formatter: (val: number) => `${val}%`,
            offsetY: 10,
            dropShadow: { enabled: false },
        };

        this.standIPChartData.xaxis = {
            categories: this.standIPData.map((item: any) => {
                return item.DoctorID == this.doctorDetails[0].EmpId ? 'You are Here' : ''
            }),
            labels: {
                rotate: 0,
                trim: false,
                style: {
                    fontSize: '12px',
                    fontWeight: 600
                },
            }
        };
        this.standIPChartData.yaxis = {
            min: 0,
            max: 100,
            labels: {
                formatter: (value: any) => {
                    return Math.round(value);
                }
            }
        };

        this.standIPChartData.title = {
            text: 'Inpatient Comparison',
            align: 'start',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.standIPChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => `${val}%`
            }
        };

        this.standIPChartData.colors = [
            ({ dataPointIndex }: { dataPointIndex: number }) =>
                this.standIPData[dataPointIndex]?.DoctorID == this.doctorDetails[0].EmpId
                    ? '#F94C10'
                    : '#A7AAE1'
        ];
    }

    fetchPerformanceStandRevenueRejections(fromdate: any, todate: any) {
        const url = this.us.getApiUrl(PerformanceDashboard.FetchMyPerformanceDashBoardWhereDoIStandRevenueRejections, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.hospitalID,
            DoctorID: this.doctorDetails[0]?.EmpId,
            DepartmentID: this.doctorDetails[0]?.DepartmentID
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code == 200) {
                this.standRevenueData = response.FetchMyPerformanceDashBoardWhereDoIStandRevenueRejections1DataList;
                this.standRejectionsData = response.FetchMyPerformanceDashBoardWhereDoIStandRevenueRejection2DataList;
                this.loadStandRevenueData();
                this.loadStandRejectionsData();
            } else {
                this.standRevenueData = null;
                this.standRejectionsData = null;
                this.standRejectionsChartData = null;
                this.standRevenueChartData = null;
            }
        });
    }

    loadStandRevenueData() {
        this.standRevenueChartData = {};
        this.standRevenueChartData.series = [
            {
                name: 'Revenue',
                data: this.standRevenueData.map((item: any) => +item.Total_Per)
            }
        ];

        this.standRevenueChartData.chart = {
            height: 250,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.standRevenueChartData.plotOptions = {
            bar: {
                distributed: false,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.standRevenueChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#000000'],
                fontSize: '8px',
            },
            formatter: (val: number) => `${val}%`,
            offsetY: -15
        };

        this.standRevenueChartData.xaxis = {
            categories: this.standRevenueData.map((item: any) => {
                return item.DoctorID == this.doctorDetails[0].EmpId ? 'You are Here' : ''
            }),
            labels: {
                rotate: 0,
                trim: false,
                style: {
                    fontSize: '12px',
                    fontWeight: 600
                },
            }
        };

        this.standRevenueChartData.title = {
            text: 'Revenue Comparison',
            align: 'start',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.standRevenueChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => `${val}%`
            }
        };

        this.standRevenueChartData.colors = [
            ({ dataPointIndex }: { dataPointIndex: number }) =>
                this.standRevenueData[dataPointIndex]?.DoctorID == this.doctorDetails[0].EmpId
                    ? '#F94C10'
                    : '#C5D89D'
        ];

        this.standRevenueChartData.yaxis = {
            min: 0,
            max: 100,
            labels: {
                formatter: (value: any) => {
                    return Math.round(value);
                }
            }
        };
    }

    loadStandRejectionsData() {
        this.standRejectionsChartData = {};
        this.standRejectionsChartData.series = [
            {
                name: 'Rejections',
                data: this.standRejectionsData.map((item: any) => +item.TotalRejectionsPer)
            }
        ];

        this.standRejectionsChartData.chart = {
            height: 250,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.standRejectionsChartData.plotOptions = {
            bar: {
                distributed: false,
                dataLabels: {
                    position: 'top',
                    orientation: 'vertical'
                }
            }
        };

        this.standRejectionsChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#000000'],
                fontSize: '8px',
            },
            formatter: (val: number) => `${val}%`,
            offsetY: 10
        };

        this.standRejectionsChartData.xaxis = {
            categories: this.standRejectionsData.map((item: any) => {
                return item.DoctorID == this.doctorDetails[0].EmpId ? 'You are Here' : ''
            }),
            labels: {
                rotate: 0,
                trim: false,
                style: {
                    fontSize: '12px',
                    fontWeight: 600
                },
            }
        };

        this.standRejectionsChartData.title = {
            text: 'Rejection Comparison',
            align: 'start',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.standRejectionsChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => `${val}%`
            }
        };

        this.standRejectionsChartData.colors = [
            ({ dataPointIndex }: { dataPointIndex: number }) =>
                this.standRejectionsData[dataPointIndex]?.DoctorID == this.doctorDetails[0].EmpId
                    ? '#F94C10'
                    : '#C5D89D'
        ];

        this.standRejectionsChartData.yaxis = {
            min: 0,
            max: 100,
            labels: {
                formatter: (value: any) => {
                    return Math.round(value);
                }
            }
        };
    }

    clearFilters() {
        this.selectedQuarter = this.quarters[0];
        this.fetchData();
    }

    locationOptionClicked(event: Event, item: any) {
        event.stopPropagation();
        this.toggleLocationSelection(item);
    }

    toggleLocationSelection(item: any) {
        item.selected = !item.selected;
    }

    showErrorModal(error: string) {
        this.errorMsg = error;
        let modal = new bootstrap.Modal(document.getElementById('errorMsg'));
        modal.show();
    }
}

const PerformanceDashboard = {
    FetchMyPerformanceDashBoardStatistics: 'FetchMyPerformanceDashBoardStatistics?FromDate=${FromDate}&ToDate=${ToDate}&DoctorID=${DoctorID}&DepartmentID=${DepartmentID}&HospitalID=${HospitalID}',
    FetchMyPerformanceDashBoardRevenueRejections: 'FetchMyPerformanceDashBoardRevenueRejections?FromDate=${FromDate}&ToDate=${ToDate}&DoctorID=${DoctorID}&DepartmentID=${DepartmentID}&HospitalID=${HospitalID}',
    FetchMyPerformanceDashBoardWhereDoIStandOPIP: 'FetchMyPerformanceDashBoardWhereDoIStandOPIP?FromDate=${FromDate}&ToDate=${ToDate}&DoctorID=${DoctorID}&DepartmentID=${DepartmentID}&HospitalID=${HospitalID}',
    FetchMyPerformanceDashBoardWhereDoIStandRevenueRejections: 'FetchMyPerformanceDashBoardWhereDoIStandRevenueRejections?FromDate=${FromDate}&ToDate=${ToDate}&DoctorID=${DoctorID}&DepartmentID=${DepartmentID}&HospitalID=${HospitalID}'
};