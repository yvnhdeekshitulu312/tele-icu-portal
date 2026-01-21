import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import moment from "moment";
import { ApexChart, ApexDataLabels, ApexFill, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTitleSubtitle, ApexTooltip } from "ng-apexcharts";
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

export type DonutChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    colors: string[];
    fill: ApexFill;
    stroke: ApexStroke;
    legend: ApexLegend;
    tooltip: ApexTooltip;
    dataLabels: ApexDataLabels;
    title: ApexTitleSubtitle;
    responsive: ApexResponsive[];
    plotOptions?: ApexPlotOptions;
};

@Component({
    selector: 'app-pharmacy-dashboard',
    templateUrl: './pharmacy-dashboard.component.html',
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

export class PharmacyDashboardComponent implements OnInit {
    datesForm!: FormGroup;
    hospitalID: any;
    locations = [
        { label: 'Nuzha', value: 3, selected: false },
        { label: 'Suwaidi', value: 2, selected: false }
    ];
    doctorDetails: any;
    errorMsg: any = '';
    facilityId: any;
    pharmacyStatistics: any;
    patientsChartData: any;
    patientsData: any;
    prescriptionData: any;
    prescriptionChartData: any;
    dispensedData: any;
    dispensedChartData: any;
    pharmacySalesData: any;
    pharmacySalesChartData: any;
    pharmacyStatisticsChartData: any;
    approvedData: any;
    approvedChartData: any;
    salesDataPerDoctor: any;

    selectedDoctor: any;
    selectedDoctorSalesChartData: any;
    admissionReconData: any;
    admissionReconChartData: any;
    patientTypes: any;
    departments: any;

    selectedPatientType: any;
    selectedDepartment: any = 0;
    topMedicationsCount: number = 10;
    topMedicationsChartData: any;
    topMedicationsData: any;
    detectionRateData: any;
    detectionRateChartData: any;
    pharmacySalesPerDepartmentData: any;
    pharmacySalesPerDepartmentChartData: any;

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

    fetchData() {
        const { fromdate, todate } = this.getFormattedDates();
        if (fromdate && todate && new Date(fromdate) > new Date(todate)) {
            this.showErrorModal("From Date should not be greater than To Date.");
            return;
        }

        this.fetchPharmacyPatientType();
        this.fetchPharmacyRevenue();
        this.fetchPharmacyAdmissionRecon();
        this.fetchPatientTypeDepartments();
    }

    private getFormattedDates(): { fromdate: string; todate: string } {
        const fromdate = moment(this.datesForm.get("fromdate")?.value).format('DD-MMM-YYYY');
        const todate = moment(this.datesForm.get("todate")?.value).format('DD-MMM-YYYY');
        return { fromdate, todate };
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
        this.fetchData();
    }

    locationOptionClicked(event: Event, item: any) {
        event.stopPropagation();
        this.toggleLocationSelection(item);
    }

    toggleLocationSelection(item: any) {
        item.selected = !item.selected;
    }

    private getLocationsValue(): string {
        return this.locations?.filter((x: any) => x.selected).map((item: any) => item.value).join(',');
    }

    showErrorModal(error: string) {
        this.errorMsg = error;
        let modal = new bootstrap.Modal(document.getElementById('errorMsg'));
        modal.show();
    }

    fetchPharmacyPatientType() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(PharmacyDashboard.FetchPharmacyPatientTypeHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.pharmacyStatistics = response.FetchPharmacyPatientTypeHISBI1DataList[0];
                this.patientsData = response.FetchPharmacyPatientTypeHISBI2DataList;
                this.prescriptionData = response.FetchPharmacyPatientTypeHISBI3DataList;
                this.dispensedData = response.FetchPharmacyPatientTypeHISBI4DataList;
                this.approvedData = response.FetchPharmacyPatientTypeHISBI5DataList[0];
                this.loadPatientsChart();
                this.loadPrescriptionsChart();
                this.loadDispensedChart();
                this.loadPharmacyStatisticsChart();
                this.loadApprovedChart();
            } else {
                this.pharmacyStatistics = null;
                this.patientsData = null;
                this.patientsChartData = null;
                this.prescriptionData = null;
                this.prescriptionChartData = null;
                this.dispensedData = null;
                this.dispensedChartData = null;
                this.pharmacyStatisticsChartData = null;
                this.approvedData = null;
                this.approvedChartData = null
            }
        });
    }

    private createDonutChart(
        data: any[],
        labelKey: string,
        valueKey: string,
        title: string,
        colorPalette: string[]
    ): DonutChartOptions {
        const labels = data.map(item => item[labelKey]);
        const values = data.map(item => Number(item[valueKey]));

        return {
            series: values,
            chart: {
                type: 'donut',
                width: '100%',
                height: '200px',
            },
            labels: labels,
            colors: colorPalette,

            fill: {

                type: 'gradient',
                gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.4,
                    gradientToColors: colorPalette,
                    inverseColors: true,
                    opacityFrom: 0.9,
                    opacityTo: 1,
                    stops: [0, 90, 100],

                }
            },
            stroke: {
                show: true,
                width: 3,
                colors: ['#fff'],
                lineCap: 'butt',
                curve: 'straight',
                dashArray: 0,
            },

            legend: {
                show: true,
                position: 'bottom',
                fontSize: '10px'
            },
            title: {
                text: title,
                align: 'center',
                style: {
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#383A88'
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
                formatter: (_, opts) => {
                    const value = opts.w.config.series[opts.seriesIndex];
                    const label = opts.w.config.labels[opts.seriesIndex];
                    //return `${label}: ${Number(value)}`;
                    return `${Number(value)}`;
                },
                textAnchor: 'end',
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
                        chart: { width: '100%' },
                        legend: { position: 'bottom', fontSize: "10px" }
                    }
                },
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: '100%',
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
                        labels: { show: false },
                    },
                    dataLabels: {
                        offset: 20,

                    },
                }
            }
        };
    }

    loadPatientsChart() {
        this.patientsChartData = this.createDonutChart(
            this.patientsData,
            'PatientType',
            'Total',
            '',
            ['#9CAB84', '#89986D', '#C5D89D']
           // ['#610C9F', '#FFD700', '#DA0C81']
        );
    }

    loadPrescriptionsChart() {
        this.prescriptionChartData = this.createDonutChart(
            this.prescriptionData,
            'PatientType',
            'TotalPrescriptionItems',
            '',
            ['#9CAB84', '#89986D', '#C5D89D']
           // ['#610C9F', '#FFD700', '#DA0C81']
        );
    }

    loadDispensedChart() {
        this.dispensedChartData = this.createDonutChart(
            this.dispensedData,
            'PatientType',
            'TotalDISPENSEDItems',
            '',
            ['#9CAB84', '#89986D', '#C5D89D']
            //['#610C9F', '#FFD700', '#DA0C81']
        );
    }

    loadPharmacyStatisticsChart() {
        this.pharmacyStatisticsChartData = {};
        this.pharmacyStatisticsChartData.series = [
            {
                name: 'Total',
                data: [+this.pharmacyStatistics.TotalVisits, +this.pharmacyStatistics.TotalPrescriptionItems, +this.pharmacyStatistics.TotalDISPENSEDItems,]
            }
        ];

        this.pharmacyStatisticsChartData.chart = {
            height: 170,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.pharmacyStatisticsChartData.plotOptions = {
            bar: {
                distributed: false,
                dataLabels: {
                    position: 'bottom',
                    offsetX: 2,

                },
                horizontal: true,
            }
        };

        this.pharmacyStatisticsChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#fff'],
                fontSize: '8px',
                //fontWeight: 'bold'
            },
            offsetX: 30,
            formatter: (val: number) => val.toLocaleString('en-IN')
        };

        this.pharmacyStatisticsChartData.colors = ['#241E92'];

        this.pharmacyStatisticsChartData.xaxis = {
            categories: ['Patients', 'Prescriptions', 'Dispensed'],
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                }
            }
        };

        this.pharmacyStatisticsChartData.title = {
            text: 'Pharmacy Statistics',
            align: 'start',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.pharmacyStatisticsChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => val.toLocaleString('en-IN')
            }
        };
    }

    loadApprovedChart() {
        this.approvedChartData = {};
        this.approvedChartData.series = [
            {
                name: 'Total',
                data: [+this.approvedData.TotalPrescriptionItems, +this.approvedData.TotalApprovedItems]
            }
        ];

        this.approvedChartData.chart = {
            height: 140,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.approvedChartData.plotOptions = {
            bar: {
                distributed: false,
                dataLabels: {
                    position: 'bottom',
                    offsetX: 2,

                },
                horizontal: true,
            }
        };

        this.approvedChartData.dataLabels = {
            enabled: true,

            style: {
                colors: ['#fff'],
                fontSize: '8px',
                //fontWeight: 'bold'
            },
            offsetX: 20,
            formatter: (val: number) => val.toLocaleString('en-IN')
        };

        this.approvedChartData.colors = ['#39B5E0'];

        this.approvedChartData.xaxis = {
            categories: ['Prescribed', 'Approved'],
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                }
            }
        };

        this.approvedChartData.title = {
            text: 'Prescribed Vs Approved',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.approvedChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => val.toLocaleString('en-IN')
            }
        };
    }

    fetchPharmacyRevenue() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(PharmacyDashboard.FetchPharmacyRevenueHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.preparePharmacySalesData(response.FetchPharmacyRevenueHISBI2DataList);
                this.salesDataPerDoctor = response.FetchPharmacyRevenueHISBI1DataList.filter((item: any) => item.DoctorName) || [];
                this.selectedDoctor = this.salesDataPerDoctor.length ? this.salesDataPerDoctor[0].DoctorName : '';
                this.loadSelectedDoctorSalesChart();
            } else {
                this.pharmacySalesData = null;
                this.selectedDoctor = null;
                this.selectedDoctorSalesChartData = null;
                this.pharmacySalesPerDepartmentData = null;
                this.pharmacySalesPerDepartmentChartData = null;
            }
        });
    }

    preparePharmacySalesData(data: any) {
        this.pharmacySalesData = {
            cash: data.filter((item: any) => item.CompanyType === 'Cash').reduce((acc: number, item: any) => acc + Number(item.Q1) + Number(item.Q2) + Number(item.Q3) + Number(item.Q4), 0),
            company: data.filter((item: any) => item.CompanyType === 'Company').reduce((acc: number, item: any) => acc + Number(item.Q1) + Number(item.Q2) + Number(item.Q3) + Number(item.Q4), 0),
            total: data.reduce((acc: number, item: any) => acc + Number(item.Q1) + Number(item.Q2) + Number(item.Q3) + Number(item.Q4), 0)
        };
        this.loadPharmacySalesChart();

        this.pharmacySalesPerDepartmentData = this.groupedByDepartment(data);
        this.loadSalesPerDepartmentChart();
    }

    groupedByDepartment(data: any): any[] {
        const grouped: { [key: string]: any } = {};

        data.forEach((item: any) => {
            const dept = item.Department;

            if (!grouped[dept]) {
                grouped[dept] = {
                    Department: dept,
                    Q1: 0,
                    Q2: 0,
                    Q3: 0,
                    Q4: 0
                };
            }

            grouped[dept].Q1 += parseFloat(item.Q1);
            grouped[dept].Q2 += parseFloat(item.Q2);
            grouped[dept].Q3 += parseFloat(item.Q3);
            grouped[dept].Q4 += parseFloat(item.Q4);
        });

        return Object.values(grouped);
    }

    loadPharmacySalesChart() {
        //const colorPalette = ['#FFD700', '#DA0C81'];
        const colorPalette = ['#9CAB84', '#89986D', '#C5D89D'];

        this.pharmacySalesChartData = {
            series: [this.pharmacySalesData.cash, this.pharmacySalesData.company],
            chart: {
                type: 'donut',
                width: '100%',
                height: '200px',
            },
            labels: ['Cash', 'Company'],
            colors: colorPalette,
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'light',
                    type: 'vertical',
                    shadeIntensity: 0.4,
                    gradientToColors: colorPalette,
                    inverseColors: true,
                    opacityFrom: 0.9,
                    opacityTo: 1,
                    stops: [0, 90, 100],
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
                fontSize: "10px"
            },
            title: {
                text: '',
                align: 'center',
                style: {
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#383A88'
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
                    return value.toLocaleString('en-IN');
                },
                textAnchor: 'end',
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
                        chart: { width: '100%', height: 210 },
                        legend: { position: 'bottom', fontSize: "10px" }
                    }
                },
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: '100%',
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
                        labels: { show: false },
                    },
                    dataLabels: {
                        offset: 20,
                    },
                }
            }
        };
    }

    loadSelectedDoctorSalesChart() {
        const selectedData = this.salesDataPerDoctor.find((item: any) => item.DoctorName === this.selectedDoctor);
        this.selectedDoctorSalesChartData = {};

        this.selectedDoctorSalesChartData.series = [
            {
                name: 'Sales',
                data: [+selectedData.Q1, +selectedData.Q2, +selectedData.Q3, +selectedData.Q4]
            }

        ];

        this.selectedDoctorSalesChartData.chart = {
            type: 'bar',
            height: 300,
            stacked: false,
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.selectedDoctorSalesChartData.plotOptions = {
            bar: {
                columnWidth: '55%',
                borderRadius: 2,
                dataLabels: {
                    position: 'top'
                },
                distributed: true,
            }
        };
        this.selectedDoctorSalesChartData.stroke = {
            curve: ["transparent"],
            width: 2
        };

        this.selectedDoctorSalesChartData.dataLabels = {
            enabled: true,
            style: {
                fontSize: '8px',
                colors: ['#23049D', '#F21170', '#FA9905', '#FF5200'],
              


            },
            offsetY: -20,
            background: { enabled: true, borderRadius: 5, },
            formatter: (val: number) => {
                if (val > 0)
                    return val.toString();
                else
                    return;

            }
            // formatter: function (val: number) {
            //     return val.toString();
            // }
        };

        this.selectedDoctorSalesChartData.xaxis = {
            categories: ['Q1', 'Q2', 'Q3', 'Q4'],
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

        this.selectedDoctorSalesChartData.yaxis = {
            title: {
                text: 'Sales',
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

        this.selectedDoctorSalesChartData.colors = ['#23049D', '#F21170', '#FA9905', '#FF5200'];

        this.selectedDoctorSalesChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: function (val: number) {
                    return val ?? 0;
                }
            },
        };

        this.selectedDoctorSalesChartData.title = {
            text: '',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };
    }

    loadSalesPerDepartmentChart() {
        this.pharmacySalesPerDepartmentChartData = {};

        this.pharmacySalesPerDepartmentChartData.series = [
            {
                name: "Q1",
                data: this.pharmacySalesPerDepartmentData.map((t: any) => t.Q1)
            },
            {
                name: "Q2",
                data: this.pharmacySalesPerDepartmentData.map((t: any) => t.Q2)
            },
            {
                name: "Q3",
                data: this.pharmacySalesPerDepartmentData.map((t: any) => t.Q3)
            },
            {
                name: "Q4",
                data: this.pharmacySalesPerDepartmentData.map((t: any) => t.Q4)
            }
        ]

        this.pharmacySalesPerDepartmentChartData.chart = {
            type: 'bar',
            height: 450,
            stacked: false,
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.pharmacySalesPerDepartmentChartData.plotOptions = {
            bar: {
                columnWidth: '95%',
                borderRadius: 2,
                dataLabels: {
                    position: 'top',
                    orientation: 'vertical'
                },
                distributed: false,
            }
        };
        this.pharmacySalesPerDepartmentChartData.stroke = {
            curve: ["transparent"],
            width: 2
        };

        this.pharmacySalesPerDepartmentChartData.dataLabels = {
            enabled: true,
            style: {
                fontSize: '7px',
                colors: ['#000000'],
            },
            offsetY: 0,
            dropShadow: { enabled: false },
            //formatter: (val: number) => val.toFixed(2)
            formatter: (val: number, opts: any) => {
                if (val > 0)
                    return val.toFixed(2);
                else
                    return;
            }
        };

        this.pharmacySalesPerDepartmentChartData.xaxis = {
            categories: this.pharmacySalesPerDepartmentData.map((t: any) => t.Department),
            labels: {
                style: {
                    fontSize: '8px',
                    
                    //fontWeight: '500'
                }
            },
            min: 0,
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        };

        this.pharmacySalesPerDepartmentChartData.yaxis = {

            title: {
                text: ''
            },
            labels: {
                formatter: (val: number) => val.toFixed(0),
                style: { fontSize: '12px' },
                //offsetX: -5
            },

            axisTicks: { show: true },
            axisBorder: { show: true }
        };

        this.pharmacySalesPerDepartmentChartData.colors = ['#610C9F', '#940B92', '#DA0C81', '#008170'];

        this.pharmacySalesPerDepartmentChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => val.toFixed(2)
            },
        };

        this.pharmacySalesPerDepartmentChartData.title = {
            text: 'Quarterly Pharmacy Sales Per Department',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };
    }

    fetchPharmacyAdmissionRecon() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(PharmacyDashboard.FetchPharmacyAdmissionReconHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.admissionReconData = response.FetchPharmacyAdmissionReconHISBI1DataList;
                this.detectionRateData = response.FetchPharmacyAdmissionReconHISBI2DataList;
                this.loadAdmissionReconChart();
                this.loadDetectionRateChart();
            } else {
                this.admissionReconData = null;
                this.admissionReconChartData = null;
                this.detectionRateData = null;
                this.detectionRateChartData = null;
            }
        });
    }

    loadAdmissionReconChart() {
        const months = this.admissionReconData.map((d: any) => d.MonthName);
        const counts = this.admissionReconData.map((d: any) => Number(d.TotalAdmissionRecon));

        this.admissionReconChartData = {};
        this.admissionReconChartData.series = [
            {
                name: 'Admission Reconciliation',
                type: 'column',
                data: counts
            }
        ];

        this.admissionReconChartData.chart = {
            height: 300,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.admissionReconChartData.plotOptions = {
            bar: {
                columnWidth: '45%',
                borderRadius: 2,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.admissionReconChartData.dataLabels = {
            enabled: true,
            offsetY: -24,
            style: {
                fontSize: '8px',
                //fontWeight: 'bold',
                colors: ['#471069']
            },
            background: { enabled: true, borderRadius: 5, },
        };

        this.admissionReconChartData.colors = ['#471069'];

        this.admissionReconChartData.xaxis = {
            categories: months,
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px',
                    fontWeight: 500
                }
            }
        };

        this.admissionReconChartData.yaxis = {
            // title: {
            //     text: 'Admission Reconciliation',
            //     style: {
            //         fontWeight: 600,
            //         fontSize: '12px'
            //     }
            // },
            labels: {
                formatter: (val: number) => val.toFixed(0)
            }
        };

        this.admissionReconChartData.title = {
            text: 'Admission Medication Reconciliation Rate',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#000'
            }
        };

        this.admissionReconChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => `${val} `
            }
        };

        this.admissionReconChartData.legend = {
            position: 'top',
            horizontalAlign: 'right',
        };

        this.admissionReconChartData.fill = {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.4,
                gradientToColors: ['#30c5d2'],
                inverseColors: false,
                opacityFrom: 0.9,
                opacityTo: 0.9,
                stops: [0, 100]
            }
        };
    }

    loadDetectionRateChart() {
        const months = this.detectionRateData.map((d: any) => d.MonthName);
        const counts = this.detectionRateData.map((d: any) => Number(d.AdmissionAdverseEventRate));

        this.detectionRateChartData = {};
        this.detectionRateChartData.series = [
            {
                name: 'Adverse Event Rate',
                type: 'column',
                data: counts
            }
        ];

        this.detectionRateChartData.chart = {
            height: 250,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.detectionRateChartData.plotOptions = {
            bar: {
                columnWidth: '45%',
                borderRadius: 2,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.detectionRateChartData.dataLabels = {
            enabled: true,
            offsetY: -24,
            style: {
                fontSize: '8px',
                //fontWeight: 'bold',
                colors: ['#392d69']
            },
            background: { enabled: true, borderRadius: 5, },
            formatter: (val: number) => `${val.toFixed(2)}%`
        };

        this.detectionRateChartData.colors = ['#392d69'];

        this.detectionRateChartData.xaxis = {
            categories: months,
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px',
                    fontWeight: 500
                }
            }
        };

        this.detectionRateChartData.yaxis = {
            // title: {
            //     text: 'Adverse Event Rate',
            //     style: {
            //         fontWeight: 600,
            //         fontSize: '12px'
            //     }
            // },
            labels: {
                formatter: (val: number) => `${val.toFixed(2)}%`
            }
        };

        this.detectionRateChartData.title = {
            text: 'Adverse Drug Reaction - Detection Rate VS Reporting Rate',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.detectionRateChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => `${val.toFixed(2)}%`
            }
        };

        this.detectionRateChartData.legend = {
            position: 'top',
            horizontalAlign: 'right',
        };

        this.detectionRateChartData.fill = {
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

    fetchPatientTypeDepartments() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(PharmacyDashboard.FetchPharmacyMasterPatientTypeDepartmentHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.patientTypes = response.FetchPharmacyMasterPatientTypeDepartmentHISBI1DataList;
                this.departments = response.FetchPharmacyMasterPatientTypeDepartmentHISBI2DataList;
                this.selectedDepartment = 0;
                this.selectedPatientType = 0;
                this.topMedicationsCount = 10;
                this.getTopMedicationsData();
            } else {
                this.patientTypes = null;
                this.departments = null;
                this.topMedicationsData = null;
                this.topMedicationsChartData = null;
            }
        });
    }

    getTopMedicationsData() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(PharmacyDashboard.FetchPharmacyTopPrescribedMedicationHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            PatientType: this.selectedPatientType == 0 ? this.patientTypes.map((x: any) => x.PatientTypeID).join() : this.selectedPatientType,
            DepartmentID: this.selectedDepartment,
            TopCount: this.topMedicationsCount
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.topMedicationsData = response.FetchPharmacyTopPrescribedMedicationHISBI1DataList;
                this.loadTopMedicationsChart();
            } else {
                this.topMedicationsData = null;
                this.topMedicationsChartData = null;
            }
        });
    }

    loadTopMedicationsChart() {
        this.topMedicationsChartData = {};
        this.topMedicationsChartData.series = [
            {
                name: 'Medications Count',
                data: this.topMedicationsData.map((item: any) => +item.TotalPrescriptionItems)
            }
        ];

        this.topMedicationsChartData.chart = {
            height: 300,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
        };

        this.topMedicationsChartData.plotOptions = {
            bar: {
                distributed: false,
                dataLabels: {
                    position: 'bottom'
                },
                horizontal: true,
            }
        };

        this.topMedicationsChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#fff'],
                fontSize: '8px',
                //fontWeight: 'bold'
            },
            offsetX: 20,
            formatter: (val: number) => val.toLocaleString('en-IN')
        };

        this.topMedicationsChartData.colors = ['#EA047E'];

        this.topMedicationsChartData.xaxis = {
            categories: this.topMedicationsData.map((item: any) => item.ItemName),
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                }
            }
        };

        this.topMedicationsChartData.title = {
            text: '',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.topMedicationsChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => val.toLocaleString('en-IN')
            }
        };
    }
}

const PharmacyDashboard = {
    FetchPharmacyPatientTypeHISBI: 'FetchPharmacyPatientTypeHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchPharmacyRevenueHISBI: 'FetchPharmacyRevenueHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchPharmacyAdmissionReconHISBI: 'FetchPharmacyAdmissionReconHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchPharmacyMasterPatientTypeDepartmentHISBI: 'FetchPharmacyMasterPatientTypeDepartmentHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchPharmacyTopPrescribedMedicationHISBI: 'FetchPharmacyTopPrescribedMedicationHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&PatientType=${PatientType}&DepartmentID=${DepartmentID}&TopCount=${TopCount}'
};