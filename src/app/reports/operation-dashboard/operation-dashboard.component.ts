import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import moment from "moment";
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
    selector: 'app-operation-dashboard',
    templateUrl: './operation-dashboard.component.html',
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

export class OperationDashboardComponent implements OnInit {
    datesForm!: FormGroup;
    hospitalID: any;
    locations = [
        { label: 'Nuzha', value: 3, selected: false },
        { label: 'Suwaidi', value: 2, selected: false }
    ];
    doctorDetails: any;
    facilityId: any;
    operationalStatistics: any;
    opdVisitsData: any = [];
    opdVisitsChartData: any;
    clinicVisitsData: any = [];
    clinicVisitsChartData: any;
    bedTurnOverData: any = [];
    bedTurnOverChartData: any;
    wardwiseData: any = [];
    wardwiseChartData: any;
    payerStayData: any = [];
    payerStayChartData: any;
    surgeryData: any = [];
    surgeryChartData: any;

    OPDVisitSortState: any = 'none';
    ClinicVisitSortState: any = 'none';
    WardWiseSortState: any = 'none';
    PayerStaySortState: any = 'none';
    errorMsg: string = '';

    constructor(private fb: FormBuilder, private us: UtilityService) {
        this.hospitalID = sessionStorage.getItem("hospitalId");
        const facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = facility.FacilityID == undefined ? facility : facility.FacilityID
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        const vm = new Date();
        vm.setMonth(vm.getMonth() - 2);

        this.datesForm = this.fb.group({
            fromdate: vm,
            todate: new Date()
        });
        const loc = this.locations.find((x: any) => x.value == this.hospitalID);
        if (loc) {
            loc.selected = true;
        }
    }

    ngOnInit(): void {
        this.fetchData();
    }

    showErrorModal(error: string) {
        this.errorMsg = error;
        let modal = new bootstrap.Modal(document.getElementById('errorMsg'));
        modal.show();
    }

    fetchData() {
        const { fromdate, todate } = this.getFormattedDates();
        if (fromdate && todate && new Date(fromdate) > new Date(todate)) {
            this.showErrorModal("From Date should not be greater than To Date.");
            return;
        }
        this.OPDVisitSortState = 'none';
        this.ClinicVisitSortState = 'none';
        this.WardWiseSortState = 'none';
        this.PayerStaySortState = 'none';
        this.getOperationalStatistics();
        this.getOperationalOPDDetails();
        this.getOperationalALOSDetails();
    }

    private getFormattedDates(): { fromdate: string; todate: string } {
        const fromdate = moment(this.datesForm.get("fromdate")?.value).format('DD-MMM-YYYY');
        const todate = moment(this.datesForm.get("todate")?.value).format('DD-MMM-YYYY');
        return { fromdate, todate };
    }

    private getLocationsValue(): string {
        return this.locations?.filter((x: any) => x.selected).map((item: any) => item.value).join(',');
    }

    locationOptionClicked(event: Event, item: any) {
        event.stopPropagation();
        this.toggleLocationSelection(item);
    }

    toggleLocationSelection(item: any) {
        item.selected = !item.selected;
    }

    getOperationalStatistics() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(OperationDashboard.FetchOperationalStatisticsHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.operationalStatistics = response.FetchOperationalStatisticsHISBIDataList[0];
            } else {
                this.operationalStatistics = null;
            }
        });
    }

    getOperationalOPDDetails() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(OperationDashboard.FetchOperationalOPDDetailsHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.opdVisitsData = response.FetchOperationalOPDDetailsHISBI1Data1List;
                if (this.opdVisitsData.length > 0) {
                    this.prepareOPDVisitsChartData();
                } else {
                    this.opdVisitsChartData = null;
                }
                this.clinicVisitsData = response.FetchOperationalOPDDetailsHISBI2Data2List.sort((a: any, b: any) => Number(b.Total) - Number(a.Total));
                if (this.clinicVisitsData.length > 0) {
                    this.prepareClinicVisitsChartData();
                } else {
                    this.clinicVisitsChartData = null;
                }
            }
        });
    }

    getOperationalALOSDetails() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(OperationDashboard.FetchOperationalALOSDetailsHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.bedTurnOverData = response.FetchOperationalALOSDetailsHISB1Data1List;
                if (this.bedTurnOverData.length > 0) {
                    this.prepareBedTurnOverChartData();
                } else {
                    this.bedTurnOverChartData = null;
                }
                this.wardwiseData = response.FetchOperationalALOSDetailsHISB2Data2List.sort((a: any, b: any) => Number(b.AverageLenthofStay) - Number(a.AverageLenthofStay));
                if (this.wardwiseData.length > 0) {
                    this.prepareWardwiseChartData();
                } else {
                    this.wardwiseChartData = null;
                }
                this.payerStayData = response.FetchOperationalALOSDetailsHISB3Data3List.sort((a: any, b: any) => Number(b.AdmissionDays) - Number(a.AdmissionDays));
                if (this.payerStayData.length > 0) {
                    this.preparePayerStayChartData();
                } else {
                    this.payerStayChartData = null;
                }
                this.surgeryData = response.FetchOperationalALOSDetailsHISB4Data4List.sort((a: any, b: any) => Number(b.TotalSurgeries) - Number(a.TotalSurgeries));
                if (this.surgeryData.length > 0) {
                    this.prepareSurgeryChartData();
                } else {
                    this.surgeryChartData = null;
                }
            }
        });
    }

    prepareOPDVisitsChartData() {
        const months = this.opdVisitsData.map((d: any) => d.MonthName);
        const counts = this.opdVisitsData.map((d: any) => Number(d.Total));

        this.opdVisitsChartData = {};
        this.opdVisitsChartData.series = [
            {
                name: 'OPD Visits',
                type: 'column',
                data: counts
            }
        ];

        this.opdVisitsChartData.chart = {
            height: 400,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.opdVisitsChartData.plotOptions = {
            bar: {
                columnWidth: '45%',
                borderRadius: 4,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.opdVisitsChartData.dataLabels = {
            enabled: true,
            offsetY: -20,
            style: {
                fontSize: '8px',
                //fontWeight: 'bold',
                colors: ['#392d69']
            },
            background: { enabled: true ,borderRadius: 5,},
                dropShadow: { enabled: false },
        };

        this.opdVisitsChartData.colors = ['#392d69'];

        this.opdVisitsChartData.xaxis = {
            categories: months,
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px',
                    fontWeight: 500
                }
            }
        };

        this.opdVisitsChartData.yaxis = {
            title: {
                text: 'OPD Visits',
                style: {
                    fontWeight: 600,
                    fontSize: '12px'
                }
            },
            labels: {
                formatter: (val: number) => val.toFixed(0)
            }
        };

        this.opdVisitsChartData.title = {
            text: 'MONTHLY OPD VISITS',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.opdVisitsChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => `${val} `
            }
        };

        this.opdVisitsChartData.legend = {
            position: 'top',
            horizontalAlign: 'right',
        };

        this.opdVisitsChartData.fill = {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.4,
                gradientToColors: ['#b57bee'],
                inverseColors: false,
                opacityFrom: 0.9,
                opacityTo: 0.9,
                stops: [0, 100]
            }
        };
    }

    prepareClinicVisitsChartData() {
        this.clinicVisitsChartData = {
            series: [
                {
                    data: this.clinicVisitsData.map((item: any) => ({
                        x: item.Department,
                        y: Number(item.Total)
                    }))
                }
            ],
            chart: {
                type: 'treemap',
                height: 330,
                animations: {
                    enabled: false
                }
            },
            plotOptions: {
                treemap: {
                    distributed: true,
                    enableShades: false,
                    shadeIntensity: 0.5,
                    useFillColorAsStroke: true,
                    colorScale: {
                        ranges: []
                    }
                }
            },
            dataLabels: {
                enabled: true,
                style: {
                fontSize: '8px',                
               },
                formatter: (text: any, opts: any) => {
                    const item = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex];
                    return `${text} (${item.y})`;
                },
            }
        };
    }

    prepareBedTurnOverChartData() {
        const months = this.bedTurnOverData.map((d: any) => d.MonthName);
        const bedTurnovers = this.bedTurnOverData.map((d: any) => Number(d.BedTurnOver));
        const stays = this.bedTurnOverData.map((d: any) => Number(d.AverageLenthofStay));
        this.bedTurnOverChartData = {};
        this.bedTurnOverChartData.series = [
            {
                name: 'Turnover Rate',
                type: 'column',
                data: bedTurnovers
            },
            {
                name: 'Average Length of Stay',
                type: 'line',
                data: stays
            }
        ];

        this.bedTurnOverChartData.chart = {
            height: 400,
            type: 'line',
            stacked: false,
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.bedTurnOverChartData.plotOptions = {
            bar: {
                columnWidth: '55%',
                borderRadius: 4,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.bedTurnOverChartData.dataLabels = {
            enabled: true,
            style: {
                fontSize: '8px',
                //fontWeight: 'bold',
                colors: ['#020344', '#FF0800']
            },
            offsetY: -8,
           background: { enabled: true ,borderRadius: 5,},
                dropShadow: { enabled: false },
            formatter: (val: number, opts: any) => {
                const index = opts.seriesIndex;
                if (index === 1) {
                    if (val > 0)
                    return `\n${val}`;
                else
                    return;
                }else 
                {
                     if (val > 0) 
                return `${val}`;
            else
                return;

                }
                //return val.toString();
            },
            
        };

        this.bedTurnOverChartData.stroke = {
            width: [0, 3],
            colors: ['#FF0800']
        };

        this.bedTurnOverChartData.colors = ['#020344'];

        this.bedTurnOverChartData.xaxis = {
            categories: months,
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px',
                    fontWeight: 500
                }
            }
        };

        this.bedTurnOverChartData.markers = {
            size: 5,
            strokeWidth: 2,
            strokeColors: '#FF0800',
            colors: ['#FF0800'],
            hover: {
                size: 7
            }
        };

        this.bedTurnOverChartData.yaxis = {
            labels: {
                formatter: (val: number) => val.toFixed(0)
            },
            axisTicks: { show: false },
            axisBorder: { show: false }
        };

        this.bedTurnOverChartData.tooltip = {
            shared: true,
            intersect: false,
            x: {
                show: true,
                format: 'dd MMM',
                formatter: undefined,
            },
            y: [
                {

                    formatter: (val: number) => `${val.toLocaleString()} `
                },
                {
                    formatter: (val: number) => `${val.toLocaleString()} `
                }
            ]
        };

        this.bedTurnOverChartData.colors = ['#020344', '#FF0800'];

        this.bedTurnOverChartData.legend = {
            position: 'top',
            horizontalAlign: 'right',
            floating: true,
            offsetY: 10,
        };

        this.bedTurnOverChartData.title = {
            text: 'Average Length of Stay and Bed Turnover',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.bedTurnOverChartData.fill = {
            type: ['gradient', 'solid'],
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.4,
                gradientToColors: ['#28b8d5'],
                inverseColors: false,
                opacityFrom: 0.9,
                opacityTo: 0.9,
                stops: [0, 100]
            }
        };
    }

    prepareWardwiseChartData() {
        this.wardwiseChartData = {
            series: [
                {
                    data: this.wardwiseData.map((item: any) => ({
                        x: item.DischargedWard,
                        y: Number(item.AverageLenthofStay)
                    }))
                }
            ],
            chart: {
                type: 'treemap',
                height: 350,
                animations: {
                    enabled: true
                }
            },
            plotOptions: {
                treemap: {
                    distributed: true,
                    enableShades: false,
                    shadeIntensity: 0.5,
                    useFillColorAsStroke: true,
                    colorScale: {
                        ranges: []
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: (text: any, opts: any) => {
                    const item = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex];
                    return `${text} (${item.y})`;
                },
            }
        };
    }

    preparePayerStayChartData() {
        const series = [Number(this.payerStayData[0].AdmissionDays), Number(this.payerStayData[1].AdmissionDays), Number(this.payerStayData[2].AdmissionDays)];
        const labels = [this.payerStayData[0].CompanyType, this.payerStayData[1].CompanyType, this.payerStayData[2].CompanyType];
        //const colors = ['#EC4040', '#1EC35C', '#856C8B'];
        const colors = ['#9CAB84', '#89986D', '#C5D89D'];
        this.payerStayChartData = {
            series,
            chart: {
                type: 'donut',
                width: '100%',
                height: '220px',
            },
            labels: labels,
            colors,
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.4,
                    gradientToColors: colors,
                    inverseColors: true,
                    opacityFrom: 0.9,
                    opacityTo: 1,
                    stops: [0, 90, 100]
                }
            },
           stroke: {
        show: true,
        width: 8,
        colors: ['#fff'],
        lineCap: 'round',
        curve: 'straight',
      },
            legend: {
                show: true,
                position: 'bottom',
                
                // fontSize: "10px"
            },
            title: {
                text: 'Stays By Payers',
                align: 'center',
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#00000'
                }
            },
            tooltip: {
                y: {
                    formatter: (val: number) => val.toLocaleString('en-IN')
                }
            },
            dataLabels: {
                enabled: true,
                enabledOnSeries: undefined,
                formatter: (_: any, opts: any) => {
                    const value = opts.w.config.series[opts.seriesIndex];
                    const label = opts.w.config.labels[opts.seriesIndex];
                    return `${Number(value)}`;
                },
                textAnchor: 'middle',
                distributed: false,
                offsetX: 0,
                offsetY: 0,
                style: {
          fontSize: '10px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          colors: ['#F5F5F7'],
        },
        background: {
          enabled: true,          
          foreColor: '#000000',
          padding: 15,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: '#C7C8CC',
          opacity: 0.6,
          
          dropShadow: {
            enabled: true,
            top: 19,
            left: 10,
            blur: 9,
            color: undefined,
            opacity: 0.5
          }
        },
        dropShadow: {
          enabled: false,
          top: 1,
          left: 1,
          blur: 1,
          color: '#000',
          opacity: 0.1
        }
            },
            responsive: [
                {
                    breakpoint: 1600,
                    options: {
                        chart: { width: 350, height: 210 },
                        legend: { position: 'bottom', fontSize: "10px" }
                    }
                },
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 250
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            ],
            plotOptions: {
                pie: {
                    donut: {
                        size: '50%',
                        labels: { show: false }
                    },
                    dataLabels: {
                        offset: 20
                    }
                }
            }
        };
    }

    prepareSurgeryChartData() {
        const departments = this.surgeryData.map((d: any) => d.Department);
        const bookings = this.surgeryData.map((d: any) => Number(d.TotalSurgeries));
        const cancelledBookings = this.surgeryData.map((d: any) => Number(d.TotalCancelSurgeries));
        this.surgeryChartData = {};
        this.surgeryChartData.series = [
            {
                name: 'Surgery Bookings',
                type: 'column',
                data: bookings
            },
            {
                name: 'Cancellation',
                type: 'line',
                data: cancelledBookings
            }
        ];

        this.surgeryChartData.chart = {
            height: 400,
            type: 'line',
            stacked: false,
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.surgeryChartData.plotOptions = {
            bar: {
                columnWidth: '55%',
                borderRadius: 4,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.surgeryChartData.dataLabels = {
            enabled: true,
            style: {
                fontSize: '8px',
               //fontWeight: 'bold',
                colors: ['#020344', '#FF0800']
            },
            enabledOnSeries: [0],
            offsetY: -8,
            background: { enabled: true ,borderRadius: 5,},
                dropShadow: { enabled: false },

            formatter: (val: number, opts: any) => {
                const index = opts.seriesIndex;
                if (index === 1) {
                    return `\n${val}`;
                }
                return val.toString();
            }
        };

        this.surgeryChartData.stroke = {
            width: [0, 3],
            colors: ['#FF0800']
        };

        this.surgeryChartData.colors = ['#020344'];

        this.surgeryChartData.xaxis = {
            categories: departments,
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px',
                    fontWeight: 500
                }
            }
        };

        this.surgeryChartData.markers = {
            size: 5,
            strokeWidth: 2,
            strokeColors: '#FF0800',
            colors: ['#FF0800'],
            hover: {
                size: 7
            }
        };

        this.surgeryChartData.yaxis = {
            labels: {
                formatter: (val: number) => val.toFixed(0)
            },
            axisTicks: { show: false },
            axisBorder: { show: false }
        };

        this.surgeryChartData.tooltip = {
            shared: true,
            intersect: false,
            x: {
                show: true,
                format: 'dd MMM',
                formatter: undefined,
            },
            y: [
                {

                    formatter: (val: number) => `${val.toLocaleString()} `
                },
                {
                    formatter: (val: number) => `${val.toLocaleString()} `
                }
            ]
        };

        this.surgeryChartData.colors = ['#020344', '#FF0800'];

        this.surgeryChartData.legend = {
            position: 'top',
            horizontalAlign: 'right',
            floating: true,
            offsetY: 10,
        };

        this.surgeryChartData.title = {
            text: 'Surgery Booking VS Cancellations',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.surgeryChartData.fill = {
            type: ['gradient', 'solid'],
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.4,
                gradientToColors: ['#28b8d5'],
                inverseColors: false,
                opacityFrom: 0.9,
                opacityTo: 0.9,
                stops: [0, 100]
            }
        };
    }

    getCancellationRatio(item: any) {
        return (item.TotalCancelSurgeries / item.TotalSurgeries) * 100;
    }

    clearFilters() {
        const vm = new Date();
        vm.setMonth(vm.getMonth() - 8);

        this.datesForm.patchValue({
            fromdate: vm,
            todate: new Date()
        });
        this.locations.forEach((loc: any) => loc.selected = false);
        const loc = this.locations.find((x: any) => x.value == this.hospitalID);
        if (loc) {
            loc.selected = true;
        }
        this.fetchData();
    }

    exportOPDVisitsToCSV() {
        const headers = ['Month', 'OPD Patients'];
        const rows: string[][] = [];

        this.opdVisitsData.forEach((item: any) => {
            rows.push([item.MonthName, item.Total]);
        });

        rows.push(['Total', this.getTotalOPDVisitsCount() as any]);

        const csvContent = [headers, ...rows]
            .map(e => e.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `OPDVisits${new Date().toISOString()}` + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportClinicVisitsToCSV() {
        const headers = ['Clinic', 'Total Patients'];
        const rows: string[][] = [];

        this.clinicVisitsData.forEach((item: any) => {
            rows.push([item.Department, item.Total]);
        });

        rows.push(['Total', this.getTotalClinicVisitsCount() as any]);

        const csvContent = [headers, ...rows]
            .map(e => e.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ClinicVisits${new Date().toISOString()}` + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportWardwiseDataToCSV() {
        const headers = ['Ward', 'Ave. Length Of Stay'];
        const rows: string[][] = [];

        this.wardwiseData.forEach((item: any) => {
            rows.push([item.DischargedWard, item.AverageLenthofStay]);
        });

        rows.push(['Total', this.getTotalWardWiseCount() as any]);

        const csvContent = [headers, ...rows]
            .map(e => e.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `WardWiseData${new Date().toISOString()}` + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportPayerStayDataToCSV() {
        const headers = ['Ward', 'Days'];
        const rows: string[][] = [];

        this.payerStayData.forEach((item: any) => {
            rows.push([item.CompanyType, item.AdmissionDays]);
        });

        rows.push(['Total', this.getTotalPayerStayCount() as any]);

        const csvContent = [headers, ...rows]
            .map(e => e.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `PayerStayData${new Date().toISOString()}` + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportBedTurnOverDataToCSV() {
        const headers = ['Month', 'Admission days', 'Discharges', 'Average Length of Stay', 'Turnover Rate'];
        const rows: string[][] = [];

        this.bedTurnOverData.forEach((item: any) => {
            rows.push([item.MonthName, item.AdmissionDays, item.TotalDischarges, item.AverageLenthofStay, item.BedTurnOver]);
        });

        rows.push(['Total', this.getBedTurnOverCount('AdmissionDays') as any, this.getBedTurnOverCount('TotalDischarges') as any, this.getBedTurnOverCount('AverageLenthofStay') as any, this.getBedTurnOverCount('BedTurnOver') as any]);

        const csvContent = [headers, ...rows]
            .map(e => e.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `BedTurnOver${new Date().toISOString()}` + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportSurgeryDataToCSV() {
        const headers = ['Department', 'Surgery Booking', 'Cancellation', 'Rate'];
        const rows: string[][] = [];

        this.surgeryData.forEach((item: any) => {
            rows.push([item.Department, item.TotalSurgeries, item.TotalCancelSurgeries, `${this.getCancellationRatio(item).toFixed(2)}%`]);
        });

        rows.push(['Total', this.getSurgeryCount('TotalSurgeries') as any, this.getSurgeryCount('TotalCancelSurgeries') as any, `${this.getTotalSurgeryRatio().toFixed(2)}%`]);

        const csvContent = [headers, ...rows]
            .map(e => e.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `SurgeryData${new Date().toISOString()}` + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    getTotalOPDVisitsCount() {
        return this.opdVisitsData.reduce((acc: number, d: any) => acc + (+d.Total || 0), 0);
    }

    getTotalClinicVisitsCount() {
        return this.clinicVisitsData.reduce((acc: number, d: any) => acc + (+d.Total || 0), 0);
    }

    getTotalWardWiseCount() {
        return this.wardwiseData.reduce((acc: number, d: any) => acc + (+d.AverageLenthofStay || 0), 0);
    }

    getTotalPayerStayCount() {
        return this.payerStayData.reduce((acc: number, d: any) => acc + (+d.AdmissionDays || 0), 0);
    }

    getBedTurnOverCount(key: any) {
        return this.bedTurnOverData.reduce((acc: number, d: any) => acc + (+d[key] || 0), 0);
    }

    getSurgeryCount(key: any) {
        return this.surgeryData.reduce((acc: number, d: any) => acc + (+d[key] || 0), 0);
    }

    getTotalSurgeryRatio() {
        const TotalSurgeries = this.surgeryData.reduce((acc: number, d: any) => acc + (+d.TotalSurgeries || 0), 0);
        const TotalCancelSurgeries = this.surgeryData.reduce((acc: number, d: any) => acc + (+d.TotalCancelSurgeries || 0), 0);
        return (TotalCancelSurgeries / TotalSurgeries) * 100;
    }

    sortOPDVisits() {
        if (this.OPDVisitSortState === 'none' || this.OPDVisitSortState === 'desc') {
            this.opdVisitsData.sort((a: any, b: any) => Number(a.Total) - Number(b.Total));
            this.OPDVisitSortState = 'asc';
        } else {
            this.opdVisitsData.sort((a: any, b: any) => Number(b.Total) - Number(a.Total));
            this.OPDVisitSortState = 'desc';
        }
    }

    sortClinicVisits() {
        if (this.ClinicVisitSortState === 'none' || this.ClinicVisitSortState === 'desc') {
            this.clinicVisitsData.sort((a: any, b: any) => Number(a.Total) - Number(b.Total));
            this.ClinicVisitSortState = 'asc';
        } else {
            this.clinicVisitsData.sort((a: any, b: any) => Number(b.Total) - Number(a.Total));
            this.ClinicVisitSortState = 'desc';
        }
    }

    sortWardWiseData() {
        if (this.WardWiseSortState === 'none' || this.WardWiseSortState === 'desc') {
            this.wardwiseData.sort((a: any, b: any) => Number(a.AverageLenthofStay) - Number(b.AverageLenthofStay));
            this.WardWiseSortState = 'asc';
        } else {
            this.wardwiseData.sort((a: any, b: any) => Number(b.AverageLenthofStay) - Number(a.AverageLenthofStay));
            this.WardWiseSortState = 'desc';
        }
    }

    sortPayerStayData() {
        if (this.PayerStaySortState === 'none' || this.PayerStaySortState === 'desc') {
            this.payerStayData.sort((a: any, b: any) => Number(a.AdmissionDays) - Number(b.AdmissionDays));
            this.PayerStaySortState = 'asc';
        } else {
            this.payerStayData.sort((a: any, b: any) => Number(b.AdmissionDays) - Number(a.AdmissionDays));
            this.PayerStaySortState = 'desc';
        }
    }

    getOPDVisitsSortIcon() {
        switch (this.OPDVisitSortState) {
            case 'asc': return '↑';
            case 'desc': return '↓';
            default: return '↕';
        }
    }

    getClinicVisitsSortIcon() {
        switch (this.ClinicVisitSortState) {
            case 'asc': return '↑';
            case 'desc': return '↓';
            default: return '↕';
        }
    }

    getWardwiseSortIcon() {
        switch (this.WardWiseSortState) {
            case 'asc': return '↑';
            case 'desc': return '↓';
            default: return '↕';
        }
    }

    getPayerStaySortIcon() {
        switch (this.PayerStaySortState) {
            case 'asc': return '↑';
            case 'desc': return '↓';
            default: return '↕';
        }
    }
}

const OperationDashboard = {
    FetchOperationalStatisticsHISBI: 'FetchOperationalStatisticsHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchOperationalOPDDetailsHISBI: 'FetchOperationalOPDDetailsHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchOperationalALOSDetailsHISBI: 'FetchOperationalALOSDetailsHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}'
}