import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import moment from "moment";
import { UtilityService } from "src/app/shared/utility.service";
import { DonutChartOptions } from "../revenue/revenue.component";
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
    selector: 'app-radiology-dashboard',
    templateUrl: './radiology-dashboard.component.html',
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

export class RadiologyDashboardComponent implements OnInit {
    datesForm!: FormGroup;
    hospitalID: any;
    locations = [
        { label: 'Nuzha', value: 3, selected: false },
        { label: 'Suwaidi', value: 2, selected: false }
    ];
    doctorDetails: any;

    allInvestigationsCount: any;

    visitTypeChart!: DonutChartOptions;
    paymentTypeChart!: DonutChartOptions;
    visitTypeData: any;
    paymentTypeData: any;
    modalityStatistics: any;
    modalityChartData: any;
    criticalResults: any;
    criticalResultsChartData: any;
    utilizationData: any;
    utilizationChartData: any;
    utilizationStatiticsChartData: any;

    facilityId: any;
    waitingTimeDropdownData: any;
    selectedWaitingTimeOption: any;
    withInTwoHourChartData: any;
    withInOneHourChartData: any;
    withIn48HourChartData: any;
    withIn24HourChartData: any;
    utilizationSpecialisations: any = [];
    selectedSpecialisation: any;
    selectedSpecialisation1: any;
    groupedDoctors: any = [];
    doctorsSortState: 'none' | 'asc' | 'desc' = 'none';
    groupedTechnicians: any = [];
    techniciansSortState: 'none' | 'asc' | 'desc' = 'none';
    errorMsg: string = '';

    constructor(private fb: FormBuilder, private us: UtilityService) {
        this.hospitalID = sessionStorage.getItem("hospitalId");
        const facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = facility.FacilityID == undefined ? facility : facility.FacilityID
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        const vm = new Date();
        vm.setMonth(vm.getMonth() - 1);

        this.datesForm = this.fb.group({
            fromdate: vm,
            todate: new Date()
        });
        const loc = this.locations.find((x: any) => x.value == this.hospitalID);
        if (loc) {
            loc.selected = true;
        }
        this.getWaitingTimeDropdownData();
    }

    ngOnInit(): void {

    }

    locationOptionClicked(event: Event, item: any) {
        event.stopPropagation();
        this.toggleLocationSelection(item);
    }

    toggleLocationSelection(item: any) {
        item.selected = !item.selected;
    }

    getWaitingTimeDropdownData() {
        const url = this.us.getApiUrl(RadiologyDashboard.FetchMasterRadiologyWaitingHISBI, {
            WorkStationID: this.facilityId,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.waitingTimeDropdownData = response.FetchMasterRadiologyWaitingHISBIDataList;
                this.selectedWaitingTimeOption = this.waitingTimeDropdownData[0].ID;
                this.fetchData();
            }
        });
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
        this.doctorsSortState = 'none';
        this.techniciansSortState = 'none';
        this.utilizationSpecialisations = [];
        this.loadRadiologyOrders();
        this.loadRadiologyPerformDoctors();
        this.loadRadiologyPerformTechnicians();
        this.loadWaitingTimeData();
    }

    private getFormattedDates(): { fromdate: string; todate: string } {
        const fromdate = moment(this.datesForm.get("fromdate")?.value).format('DD-MMM-YYYY');
        const todate = moment(this.datesForm.get("todate")?.value).format('DD-MMM-YYYY');
        return { fromdate, todate };
    }

    private getLocationsValue(): string {
        return this.locations?.filter((x: any) => x.selected).map((item: any) => item.value).join(',');
    }

    loadRadiologyOrders() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(RadiologyDashboard.FetchRadiologyOrdersHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.allInvestigationsCount = response.FetchRadiologyOrdersHISBI1Data1List[0].AllInvestigations;
                this.visitTypeData = response.FetchRadiologyOrdersHISBI2Data2List;
                this.paymentTypeData = response.FetchRadiologyOrdersHISBI3Data3List;
                this.modalityStatistics = response.FetchRadiologyOrdersHISBI4Data4List;
                this.criticalResults = response.FetchRadiologyOrdersHISBI5Data5List;
                this.utilizationData = response.FetchRadiologyOrdersHISBI6Data6List;
                if (this.visitTypeData?.length > 0) {
                    this.initializeVisitTypeChart();
                } else {
                    this.visitTypeChart = null as any;
                }
                if (this.paymentTypeData?.length > 0) {
                    this.initializePaymentTypeChart();
                } else {
                    this.paymentTypeChart = null as any;
                }
                if (this.modalityStatistics.length > 0) {
                    this.loadModalityStatistics();
                } else {
                    this.modalityChartData = null;
                }
                if (this.criticalResults.length > 0) {
                    this.loadCriticalResults();
                } else {
                    this.criticalResultsChartData = null;
                }

                if (this.utilizationData.length > 0) {
                    this.loadUtilizationData();
                    this.loadUtilizationStatisticsData();
                } else {
                    this.utilizationChartData = null;
                    this.utilizationStatiticsChartData = null;
                }
            }
        });
    }

    loadRadiologyPerformDoctors() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(RadiologyDashboard.FetchRadiologyPerformDoctorHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });
        this.us.getReport(url).subscribe((response: any) => {
            this.groupedDoctors = this.groupDoctorStatistics(response);
        });
    }

    groupDoctorStatistics(records: any): any {
        const allDepartments = Array.from(
            new Set(
                records.flatMap((record: any) =>
                    Object.keys(record).filter(
                        key => key !== "Type" && key !== "TestPerformDoctor"
                    )
                )
            )
        );

        const grouped: any[] = allDepartments.map(dep => ({
            departmentName: dep,
            doctors: []
        }));

        records.forEach((record: any) => {
            grouped.forEach(group => {
                const value = record[group.departmentName];
                if (typeof value === "number" && value > 0) {
                    group.doctors.push({
                        doctorName: record.TestPerformDoctor.trim(),
                        count: value
                    });
                }
            });
        });

        return grouped;
    }

    getTotalDoctorsCount(): number {
        let total = 0;
        for (const dept of this.groupedDoctors) {
            for (const doc of dept.doctors) {
                total += Number(doc.count) || 0;
            }
        }
        return total;
    }

    getDepartmentTotalDoctorsCount(department: any): number {
        return department.doctors.reduce((acc: number, d: any) => acc + (d.count || 0), 0);
    }

    sortDepartmentDoctorsByCount() {
        if (this.doctorsSortState === 'none' || this.doctorsSortState === 'desc') {
            this.groupedDoctors.sort((a: any, b: any) => {
                const aTotal = this.getDepartmentTotalDoctorsCount(a);
                const bTotal = this.getDepartmentTotalDoctorsCount(b);
                return aTotal - bTotal;
            });
            this.doctorsSortState = 'asc';
        } else {
            this.groupedDoctors.sort((a: any, b: any) => {
                const aTotal = this.getDepartmentTotalDoctorsCount(a);
                const bTotal = this.getDepartmentTotalDoctorsCount(b);
                return bTotal - aTotal;
            });
            this.doctorsSortState = 'desc';
        }
    }

    getDepartmentDoctorsSortIcon(): string {
        switch (this.doctorsSortState) {
            case 'asc': return '↑';
            case 'desc': return '↓';
            default: return '↕';
        }
    }

    loadRadiologyPerformTechnicians() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(RadiologyDashboard.FetchRadiologyPerformTECHNICIANSHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });
        this.us.getReport(url).subscribe((response: any) => {
            this.groupedTechnicians = this.groupTechnicianStatistics(response);
        });
    }

    groupTechnicianStatistics(records: any): any {
        const allDepartments = Array.from(
            new Set(
                records.flatMap((record: any) =>
                    Object.keys(record).filter(
                        key => key !== "Type" && key !== "TestPerformTechnician"
                    )
                )
            )
        );

        const grouped: any[] = allDepartments.map(dep => ({
            departmentName: dep,
            doctors: []
        }));

        records.forEach((record: any) => {
            grouped.forEach(group => {
                const value = record[group.departmentName];
                if (typeof value === "number" && value > 0) {
                    group.doctors.push({
                        doctorName: record.TestPerformTechnician.trim(),
                        count: value
                    });
                }
            });
        });

        return grouped;
    }

    getTotalTechniciansCount(): number {
        let total = 0;
        for (const dept of this.groupedTechnicians) {
            for (const doc of dept.doctors) {
                total += Number(doc.count) || 0;
            }
        }
        return total;
    }

    getDepartmentTotalTechniciansCount(department: any): number {
        return department.doctors.reduce((acc: number, d: any) => acc + (d.count || 0), 0);
    }

    sortDepartmentTechniciansByCount() {
        if (this.techniciansSortState === 'none' || this.techniciansSortState === 'desc') {
            this.groupedTechnicians.sort((a: any, b: any) => {
                const aTotal = this.getDepartmentTotalTechniciansCount(a);
                const bTotal = this.getDepartmentTotalTechniciansCount(b);
                return aTotal - bTotal;
            });
            this.techniciansSortState = 'asc';
        } else {
            this.groupedTechnicians.sort((a: any, b: any) => {
                const aTotal = this.getDepartmentTotalTechniciansCount(a);
                const bTotal = this.getDepartmentTotalTechniciansCount(b);
                return bTotal - aTotal;
            });
            this.techniciansSortState = 'desc';
        }
    }

    getDepartmentTechniciansSortIcon(): string {
        switch (this.techniciansSortState) {
            case 'asc': return '↑';
            case 'desc': return '↓';
            default: return '↕';
        }
    }

    loadWaitingTimeData() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(RadiologyDashboard.FetchRadiologyWaitingTimeHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            Type: this.selectedWaitingTimeOption
        });
        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.prepareWaitingTimeCharts(response.FetchRadiologyWaitingTimeHISBIDataList);
            }
        });
    }

    initializeVisitTypeChart() {
        const series = [Number(this.visitTypeData[0].TestCount), Number(this.visitTypeData[1].TestCount), Number(this.visitTypeData[2].TestCount)];
        const labels = [this.visitTypeData[0].Patienttype, this.visitTypeData[1].Patienttype, this.visitTypeData[2].Patienttype]
        this.visitTypeChart = this.prepareDonutChart(series, labels, ['#FFC107', '#EC4040', '#5AA469'], 'Orders by Patient Type');
    }

    initializePaymentTypeChart() {
        const series = [Number(this.paymentTypeData[0].TestCount), Number(this.paymentTypeData[1].TestCount), Number(this.paymentTypeData[2].TestCount)];
        const labels = [this.paymentTypeData[0].CompanyType, this.paymentTypeData[1].CompanyType, this.paymentTypeData[2].CompanyType];
        this.paymentTypeChart = this.prepareDonutChart(series, labels, ['#EC4040', '#554994', '#856C8B'], 'Orders by Bill Type');
    }

    prepareWaitingTimeCharts(data: any) {
        const specialisations = data.map((d: any) => d.Specialisation);

        const withInTwoHourSeries = [
            {
                name: 'Percentage',
                data: data.map((d: any) => d.WithIn2HourPer)
            }
        ];

        const withInOneHourSeries = [
            {
                name: 'Percentage',
                data: data.map((d: any) => d.WithIn1HourPer)
            }
        ];

        const withIn48HourSeries = [
            {
                name: 'Percentage',
                data: data.map((d: any) => d.WithIn48HourPer)
            }
        ];

        const withIn24HourSeries = [
            {
                name: 'Percentage',
                data: data.map((d: any) => d.WithIn24HourPer)
            }
        ];

        if (withInTwoHourSeries[0].data.length > 0) {
            this.withInTwoHourChartData = this.prepareBarChart(withInTwoHourSeries, specialisations, ['#471069'], this.withInTwoHourChartData, 'WITHIN 2 HOURS');
        } else {
            this.withInTwoHourChartData = null;
        }

        if (withInOneHourSeries[0].data.length > 0) {
            this.withInOneHourChartData = this.prepareBarChart(withInOneHourSeries, specialisations, ['#471069'], this.withInOneHourChartData, 'WITHIN 1 HOUR');
        } else {
            this.withInOneHourChartData = null;
        }

        if (withIn48HourSeries[0].data.length > 0) {
            this.withIn48HourChartData = this.prepareBarChart(withIn48HourSeries, specialisations, ['#e91fa8'], this.withIn48HourChartData, 'WITHIN 48 HOURS');
        } else {
            this.withIn48HourChartData = null;
        }

        if (withIn24HourSeries[0].data.length > 0) {
            this.withIn24HourChartData = this.prepareBarChart(withIn24HourSeries, specialisations, ['#e91fa8'], this.withIn24HourChartData, 'WITHIN 24 HOURS');
        } else {
            this.withIn24HourChartData = null;
        }
    }

    prepareBarChart(series: any, categories: any, colors: any, chartData: any, title: any) {
        chartData = {};

        chartData.series = series;

        chartData.chart = {
            type: 'bar',
            height: 350,
            stacked: false,
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        chartData.plotOptions = {
            bar: {
                columnWidth: '95%',
                borderRadius: 1,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        chartData.dataLabels = {
            enabled: true,
            style: {
                fontSize: '8px',
                //fontWeight: 'bold',
                colors: title == 'WITHIN 2 HOURS' ? ['#471069'] : title == 'WITHIN 1 HOUR' ? ['#471069'] : ['#e91fa8'],
                //colors: ['#000']
            },
            offsetY: -20,

            formatter: (val: number) => `${val.toFixed(2)}%`,
        };

        chartData.xaxis = {
            categories,
            labels: {
                style: {
                    fontSize: '8px',
                   // fontWeight: '500'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        };

        chartData.yaxis = {
            title: {
                text: 'Percentage (%)',
                style: {
                    fontWeight: '600',
                    fontSize: '12px'
                }
            },
            labels: {
                formatter: (val: any) => `${val.toFixed(2)}%`
            }
        };

        chartData.colors = colors;

        chartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: any) => `${val.toFixed(2)}%`
            }
        };

        chartData.title = {
            text: title,
            align: 'left',
            style: {
                fontSize: '18px',
                fontWeight: 'bold'
            }
        };
        chartData.fill = {
            type: ['gradient', 'solid'],
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.4,
                gradientToColors: title == 'WITHIN 2 HOURS' ? ['#30c5d2'] : title == 'WITHIN 1 HOUR' ? ['#30c5d2'] : ['#b9dfee'],
                inverseColors: false,
                opacityFrom: 0.9,
                opacityTo: 0.9,
                stops: [0, 100]
            }
        };

        chartData.legend = {
            position: 'bottom',
            horizontalAlign: 'right',
        };

        return chartData;
    }

    prepareDonutChart(series: any, labels: any, colors: any, title: string): DonutChartOptions {
        return {
            series,
            chart: {
                type: 'donut',
                width: '100%',
                height: '120px',
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
                // position: 'bottom',
                // fontSize: "10px",
            },
            title: {
                text: title,
                align: 'center',
                style: {
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#383A88'
                },
                margin: 30
            },
            tooltip: {
                y: {
                    formatter: (val: number) => val.toLocaleString('en-IN')
                }
            },
            dataLabels: {
                enabled: true,
                enabledOnSeries: undefined,
                formatter: (_, opts) => {
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
                        chart: { width: 150, height: 210 },
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

    loadModalityStatistics(): void {
        const grouped: any = {};

        this.modalityStatistics.forEach((item: any) => {
            const spec = item.Specialisation;
            if (!grouped[spec]) {
                grouped[spec] = { IP: 0, OP: 0 };
            }
            grouped[spec][item.Patienttype] = parseInt(item.TestCount, 10);
        });

        const categories = Object.keys(grouped);
        const ipCounts = categories.map(spec => grouped[spec].IP);
        const opCounts = categories.map(spec => grouped[spec].OP);
        const EDCounts = categories.map(spec => grouped[spec].ED);


        this.modalityChartData = {};

        this.modalityChartData.series = [
            {
                name: 'IP',
                data: ipCounts
            },
            {
                name: 'OP',
                data: opCounts
            },
             {
                name: 'ED',
                data: EDCounts
            }
        ];

        this.modalityChartData.chart = {
            type: 'bar',
            height: 520,
            stacked: false,
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.modalityChartData.plotOptions = {
            bar: {
                columnWidth: '95%',
                borderRadius: 1,
                dataLabels: {
                    position: 'top'
                }
            }
        };
        this.modalityChartData.stroke = {
            curve: ["transparent"],
            width: 2
        },

            this.modalityChartData.dataLabels = {
                enabled: true,
                style: {
                    fontSize: '8px',
                    //fontWeight: 'bold',
                    colors: ['#392d69', '#c81d77','#f74c06'],
                },
                offsetY: -20,
                // formatter: function (val: number) {
                //     return val.toString();
                // },
                formatter: (val: number, opts: any) => {            
                if (val > 0) 
                return `${val}`;
            else
                return;
            
        },
                background: { enabled: true ,borderRadius: 5,},
                dropShadow: { enabled: false },

            };

        this.modalityChartData.xaxis = {
            categories: categories,
            labels: {
                style: {
                    fontSize: '8px',
                    //fontWeight: '500'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        };

        this.modalityChartData.yaxis = {
            title: {
                text: 'Count',
                style: {
                    fontWeight: '600',
                    fontSize: '12px'
                },
                offsetX: -10,
                rotate: -90,
            },

            labels: {
                formatter: function (val: number) {
                    return val.toFixed(0);
                }
            }

        };

        this.modalityChartData.colors = ['#392d69', '#c81d77','#f74c06'];

        this.modalityChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: function (val: number) {
                    return val ?? 0;
                }
            }
        };

        this.modalityChartData.title = {
            text: 'Statistics by Modality',
            align: 'left',
            style: {
                fontSize: '18px',
                fontWeight: 'bold'
            }
        };
        this.modalityChartData.fill = {
            type: ['gradient', 'gradient', 'gradient'],
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.4,
                gradientToColors: ['#b57bee', '#b9dfee','#f9bc2c'],
                inverseColors: false,
                opacityFrom: 0.9,
                opacityTo: 0.9,
                stops: [0, 80, 100],
            }
        };

        this.modalityChartData.legend = {
            position: 'bottom',
            horizontalAlign: 'right',
        };
    }

    loadCriticalResults(): void {
        const specialisations = this.criticalResults.map((d: any) => d.Specialisation);
        const panicData = this.criticalResults.map((d: any) => Number(d.TestCount) || 0);
        const within20Data = this.criticalResults.map((d: any) => Number(d.Within20Min) || 0);

        this.criticalResultsChartData = {};

        this.criticalResultsChartData.series = [
            {
                name: 'Panic',
                data: panicData
            },
            {
                name: 'Notify ≤ 20 min',
                data: within20Data
            }
        ];

        this.criticalResultsChartData.chart = {
            type: 'bar',
            height: 300,
            stacked: false,
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.criticalResultsChartData.plotOptions = {
            bar: {
                horizontal: true,
                barHeight: '25%',
                borderRadius: 2
            }
        };

        this.criticalResultsChartData.dataLabels = {
            enabled: true,
            position: 'center',
            style: {
                fontSize: '12px',
                fontWeight: 'bold',
                colors: ['#f4e6f1']
            },
            formatter: function (val: number) {
                return val.toString();
            }
        };

        this.criticalResultsChartData.xaxis = {
            categories: specialisations,
            labels: {
                style: {
                    fontSize: '12px',
                    fontWeight: '500'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        };

        this.criticalResultsChartData.yaxis = {};

        this.criticalResultsChartData.colors = ['#FF1E1E', '#332FD0'];

        this.criticalResultsChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: function (val: number) {
                    return val ?? 0;
                }
            }
        };

        this.criticalResultsChartData.title = {
            text: 'Critical Results',
            align: 'left',
            style: {
                fontSize: '18px',
                fontWeight: 'bold'
            }
        };

        this.criticalResultsChartData.legend = {
            position: 'bottom',
            horizontalAlign: 'right',
        };
    }

    onSpecialisationChange() {
        this.loadUtilizationData(this.selectedSpecialisation);
    }

    onSpecialisation1Change() {
        this.loadUtilizationStatisticsData(this.selectedSpecialisation1);
    }

    loadUtilizationData(specialisation?: any): void {
        const months = [...new Set(this.utilizationData.map((d: any) => d.MonthName))];
        const specialisations = [...new Set(this.utilizationData.map((d: any) => d.Specialisation))];

        this.utilizationSpecialisations = specialisations;
        if (!specialisation) {
            this.selectedSpecialisation = specialisations[0];
        }

        const series = [{
            name: this.selectedSpecialisation,
            data: months.map(month => {
                const record = this.utilizationData.find(
                    (d: any) => d.MonthName === month && d.Specialisation === this.selectedSpecialisation
                );
                return record ? Number(record.Per) : 0;
            })
        }];

        this.utilizationChartData = {};

        this.utilizationChartData.series = series;

        this.utilizationChartData.chart = {
            type: 'area',
            height: 350,
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.utilizationChartData.stroke = {
            curve: 'smooth',
            width: 3,
            colors: ['#005B41']
        };

        this.utilizationChartData.fill = {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.3,
                gradientToColors: ['#005B41'],
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 100]
            }
        };

        this.utilizationChartData.markers = {
            size: 5,
            strokeWidth: 2,
            strokeColors: '#005B41',
            colors: ['#005B41'],
            hover: {
                size: 7
            }
        };

        this.utilizationChartData.dataLabels = {
            enabled: true,
            style: {
                fontSize: '8px',
                colors: ['#005B41']
            },
            offsetY: -5,
            formatter: (val: number) => `${val.toFixed(2)}%`
        };

        this.utilizationChartData.xaxis = {
            categories: months,
            labels: {
                offsetX: 0
            }
        };

        this.utilizationChartData.yaxis = {
            title: {
                text: 'Percentage (%)',
                style: {
                    fontWeight: '600',
                    fontSize: '12px'
                }
            },
            labels: {
                formatter: (val: any) => `${val.toFixed(2)}%`
            }
        };

        this.utilizationChartData.colors = ['#005B41'];

        this.utilizationChartData.title = {
            text: `Utilization Rate - ${this.selectedSpecialisation}`,
            align: 'left',
            style: {
                fontSize: '18px',
                fontWeight: 'bold'
            }
        };

        this.utilizationChartData.legend = {
            position: 'top'
        };
    }

    loadUtilizationStatisticsData(specialisation?: any): void {
        const months = [...new Set(this.utilizationData.map((d: any) => d.MonthName))];
        const specialisations = [...new Set(this.utilizationData.map((d: any) => d.Specialisation))];

        this.utilizationSpecialisations = specialisations;
        if (!specialisation) {
            this.selectedSpecialisation1 = specialisations[0];
        }

        const series = [{
            name: this.selectedSpecialisation1,
            data: months.map(month => {
                const record = this.utilizationData.find(
                    (d: any) => d.MonthName === month && d.Specialisation === this.selectedSpecialisation1
                );
                return record ? Number(record.TestCount) : 0;
            })
        }];

        this.utilizationStatiticsChartData = {};

        this.utilizationStatiticsChartData.series = series;

        this.utilizationStatiticsChartData.chart = {
            type: 'area',
            height: 350,
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.utilizationStatiticsChartData.stroke = {
            curve: 'smooth',
            width: 3,
            colors: ['#DC2525']
        };

        this.utilizationStatiticsChartData.fill = {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.3,
                gradientToColors: ['#DC2525'],
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 100]
            }
        };

        this.utilizationStatiticsChartData.markers = {
            size: 5,
            strokeWidth: 2,
            strokeColors: '#DC2525',
            colors: ['#DC2525'],
            hover: {
                size: 7
            }
        };

        this.utilizationStatiticsChartData.dataLabels = {
            enabled: true,
            style: {
                fontSize: '8px',
                colors: ['#DC2525']
            },
            offsetY: -5,
            formatter: function (val: number) {
                return val.toString();
            }
        };

        this.utilizationStatiticsChartData.xaxis = {
            categories: months,
            labels: {
                offsetX: 0
            }
        };

        this.utilizationStatiticsChartData.yaxis = {
            title: {
                text: 'Count',
                style: {
                    fontWeight: '600',
                    fontSize: '12px'
                }
            },
        };

        this.utilizationStatiticsChartData.colors = ['#DC2525'];

        this.utilizationStatiticsChartData.title = {
            text: `Radiology Monthly Statistics - ${this.selectedSpecialisation1}`,
            align: 'left',
            style: {
                fontSize: '18px',
                fontWeight: 'bold'
            }
        };

        this.utilizationStatiticsChartData.legend = {
            position: 'top'
        };
    }

    clearFilters() {
        const vm = new Date();
        vm.setMonth(vm.getMonth() - 1);

        this.datesForm.patchValue({
            fromdate: vm,
            todate: new Date()
        });
        this.locations.forEach((loc: any) => loc.selected = false);
        const loc = this.locations.find((x: any) => x.value == this.hospitalID);
        if (loc) {
            loc.selected = true;
        }
        this.selectedWaitingTimeOption = this.waitingTimeDropdownData[0].ID;
        this.utilizationSpecialisations = [];
        this.fetchData();
    }

    onWaitingTimeOptionChange() {
        this.loadWaitingTimeData();
    }

    exportRadiologyDoctorsToCSV() {
        const headers = ['Department / Doctor', 'Count'];
        const rows: string[][] = [];

        this.groupedDoctors.forEach((dept: any) => {
            const deptNet = this.getDepartmentTotalDoctorsCount(dept);
            rows.push([dept.departmentName, deptNet]);

            dept.doctors.forEach((doc: any) => {
                const doctorName = `   - ${doc.doctorName}`;
                const docNet = doc.count;
                rows.push([doctorName, docNet]);
            });
        });

        rows.push(['Total', this.getTotalDoctorsCount() as any]);

        const csvContent = [headers, ...rows]
            .map(e => e.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `RadiologyDoctors_${new Date().toISOString()}` + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportRadiologyTechniciansToCSV() {
        const headers = ['Department / Doctor', 'Count'];
        const rows: string[][] = [];

        this.groupedTechnicians.forEach((dept: any) => {
            const deptNet = this.getDepartmentTotalTechniciansCount(dept);
            rows.push([dept.departmentName, deptNet]);

            dept.doctors.forEach((doc: any) => {
                const doctorName = `   - ${doc.doctorName}`;
                const docNet = doc.count;
                rows.push([doctorName, docNet]);
            });
        });

        rows.push(['Total', this.getTotalTechniciansCount() as any]);

        const csvContent = [headers, ...rows]
            .map(e => e.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `RadiologyTechnicians_${new Date().toISOString()}` + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

const RadiologyDashboard = {
    FetchRadiologyOrdersHISBI: 'FetchRadiologyOrdersHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchRadiologyPerformDoctorHISBI: 'FetchRadiologyPerformDoctorHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchRadiologyPerformTECHNICIANSHISBI: 'FetchRadiologyPerformTECHNICIANSHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchMasterRadiologyWaitingHISBI: 'FetchMasterRadiologyWaitingHISBI?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchRadiologyWaitingTimeHISBI: 'FetchRadiologyWaitingTimeHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&Type=${Type}'
};