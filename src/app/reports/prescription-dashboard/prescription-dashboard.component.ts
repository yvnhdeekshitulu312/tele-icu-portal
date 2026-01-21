import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import moment from "moment";
import { ApexChart, ApexDataLabels, ApexFill, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTitleSubtitle, ApexTooltip } from "ng-apexcharts";
import { Width } from "ngx-owl-carousel-o/lib/services/carousel.service";
import { UtilityService } from "src/app/shared/utility.service";
declare var bootstrap: any;
declare var $: any;
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
    selector: 'app-prescription-dashboard',
    templateUrl: './prescription-dashboard.component.html',
    styleUrls: ['./prescription-dashboard.component.scss'],
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

export class PrescriptionDashboardComponent implements OnInit {
    datesForm!: FormGroup;
    hospitalID: any;
    locations = [
        { label: 'Nuzha', value: 3, selected: false },
        { label: 'Suwaidi', value: 2, selected: false }
    ];
    doctorDetails: any;
    errorMsg: any = '';
    facilityId: any;
    prescriptionStatistics: any;
    patientsChartData: any;
    patientsData: any;
    prescriptionData: any;
    prescriptionChartData: any;
    pharmacySalesData: any;
    pharmacySalesChartData: any;

    topMedicationsCount: number = 10;
    topMedicationsChartData: any;
    topMedicationsData: any;
    topMedicationsDataMedication: any;
    prescribedDepartmentsData: any;
    prescribedDepartmentsChartData: any;
    prescribedDoctorsData: any;
    prescribedDoctorsChartData: any;
    prescribedDoctorWiseData: any;
    prescribedDoctorWiseChartData: any;
    prescribedDoctorLocationData: any;
    prescribedDoctorLocationChartData: any;
    prescribedDoctorPatientTypeData: any;
    prescribedDoctorPatientTypeChartData: any;

    topPrescribedDepartmentsData: any;
    topPrescribedDepartmentsChartData: any;
    topPrescribedDoctorsData: any;
    topPrescribedDoctorsChartData: any;
    topPrescribedDoctorWiseData: any;
    topPrescribedDoctorWiseChartData: any;
    topPrescribedDoctorPatientTypeData: any;
    topPrescribedDoctorPatientTypeChartData: any;
    selectedTopMedItemId: any;
    listOfServiceItems: any = [];

    categoryType: any = 0;
    patientType: any = -1;
    CompanyType: any = -1;


    categoryTypes: any = [
        { id: 0, label: 'Prescription' },
        { id: 1, label: 'Laboratory' },
        { id: 2, label: 'Radiology' },
        { id: 3, label: 'Procedures' },
    ];

    patientTypes: any = [
        { id: -1, label: 'All' },
        { id: 1, label: 'OP' },
        { id: 2, label: 'IP' },
        { id: 3, label: 'ER' }
    ];

    companyTypes: any = [
        { id: -1, label: 'All' },
        { id: 1, label: 'Cash' },
        { id: 2, label: 'Insured' },
        { id: 3, label: 'MOH' },
        { id: 4, label: 'Others' }
    ];
    prescribedAgeGroupData: any;
    prescribedAgeGroupChartData: any
    prescribedPatientsNationalityData: any;
    prescribedPatientsNationalityChartData: any;

    showLoader1: boolean = false;
    showLoader2: boolean = false;

    constructor(private fb: FormBuilder, private us: UtilityService) {
        this.hospitalID = sessionStorage.getItem("hospitalId");
        const facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = facility.FacilityID == undefined ? facility : facility.FacilityID
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        const vm = new Date();
        vm.setMonth(vm.getMonth() - 8);

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

        this.topMedicationsCount = 10
        //this.fetchTopMedicationsDataItems();
        this.fetchPrescriptionMonitoringStatistics();
        this.fetchTopMedicationsData();
        this.fetchTopPrescribedDepartmentsData();
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

    fetchPrescriptionMonitoringStatistics() {
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = PrescriptionDashboard.FetchPrescriptionMonitoringStatistic1HISBI;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            PatientType: this.patientType,
            CompanyType: this.CompanyType
        }
        if (this.categoryType != 0) {
            apiUrl = PrescriptionDashboard.FetchLABRADPROCPrescriptionMonitoringStatistic1HISBI;
            payload = { ...payload, DashBoardType: this.categoryType }
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.prescriptionStatistics = response.FetchPrescriptionMonitoringStatistic1HISBI1DataList[0];
                this.patientsData = response.FetchPrescriptionMonitoringStatistic1HISBI2DataList;
                this.prescriptionData = response.FetchPrescriptionMonitoringStatistic1HISBI3DataList;
                this.pharmacySalesData = response.FetchPrescriptionMonitoringStatistic1HISBI4DataList;
                this.loadPatientsChart();
                this.loadPrescriptionsChart();
                this.loadPharmacySalesChart();
            } else {
                this.prescriptionStatistics = null;
                this.patientsData = null;
                this.patientsChartData = null;
                this.prescriptionData = null;
                this.prescriptionChartData = null;
                this.pharmacySalesChartData = null;
                this.pharmacySalesData = null;
            }
        });
    }

    private createDonutChart(
        data: any[],
        labelKey: string,
        valueKey: string,
        title: string,
        height: any = '200px',
        isCurrency: boolean = false,
        showTotal: boolean = false
    ): DonutChartOptions {
        const labels = data.map(item => item[labelKey]);
        const values = data.map(item => Number(item[valueKey]));
        const colors = labels.map(label => this.donutColorPalette[label] || '#9E9E9E');
        return {
            series: values,
            chart: {
                type: 'donut',
                width: '100%',
                height,
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
                    formatter: (val: number) => {
                        if (isCurrency) {
                            val = Number(val)
                        }
                        return val.toLocaleString()
                    }
                }
            },

            dataLabels: {
                enabled: true,
                enabledOnSeries: undefined,
                formatter: (_, opts) => {
                    let value = opts.w.config.series[opts.seriesIndex];
                    if (isCurrency) {
                        value = Number(value).toLocaleString()
                    }
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
                        labels: {
                            show: showTotal,
                            value: {
                                fontSize: '12px',
                                fontWeight: 'bold',
                                offsetY: -5
                            },
                            total: {
                                show: true,
                                showAlways: true,
                                label: 'Total',
                                fontSize: '12px',
                                formatter: (w: any) => {
                                    let val = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                                    if (isCurrency) {
                                        val = Number(val).toLocaleString();
                                    }
                                    return val.toLocaleString('en-IN');
                                },

                            }
                        },
                    },
                    dataLabels: {
                        offset: 20,
                    },
                }
            }
        };
    }

    donutColorPalette: any = {
        'ER': '#610C9F',
        'IP': '#ffc300',
        'OP': '#DA0C81',
        'CASH': '#610C9F',
        'INSURED': '#ffc300',
        'MOH': '#DA0C81',
    };

    loadPatientsChart() {
        this.patientsChartData = this.createDonutChart(
            this.patientsData,
            'PatientType',
            'Total',
            ''
        );
    }

    loadPrescriptionsChart() {
        this.prescriptionChartData = this.createDonutChart(
            this.prescriptionData,
            'PatientType',
            'TotalPrescriptionItems',
            ''
        );
    }

    loadPharmacySalesChart() {
        this.pharmacySalesChartData = this.createDonutChart(
            this.pharmacySalesData,
            'CompanyType',
            'TotalSale',
            '',
            '200px',
            true
        );
    }

    fetchTopMedicationsData() {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = PrescriptionDashboard.FetchPrescriptionMonitoringTopPrescribedMedicationHISBI;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            ItemID: 0,
            DepartmentID: 0,
            TopCount: this.topMedicationsCount,
            PatientType: this.patientType,
            CompanyType: this.CompanyType
        };

        if (this.categoryType != 0) {
            apiUrl = PrescriptionDashboard.FetchLABRADPROCPrescriptionMonitoringTopPrescribedMedicationHISBI;
            payload = { ...payload, DashBoardType: this.categoryType }
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200 && response.FetchPrescriptionMonitoringTopPrescribedMedicationHISBI1DataList.length > 0) {
                this.topMedicationsData = response.FetchPrescriptionMonitoringTopPrescribedMedicationHISBI1DataList;
                this.loadTopMedicationsChart();
                this.fetchPrescribedDepartments(this.topMedicationsData[0]);
            } else {
                this.topMedicationsData = null;
                this.topMedicationsChartData = null;
                this.prescribedDepartmentsData = null;
                this.prescribedDepartmentsChartData = null;
                this.prescribedDoctorsData = null;
                this.prescribedDoctorsChartData = null;
                this.prescribedDoctorWiseData = null;
                this.prescribedDoctorWiseChartData = null;
                this.prescribedDoctorLocationData = null
                this.prescribedDoctorLocationChartData = null;
                this.prescribedDoctorPatientTypeData = null;
                this.prescribedDoctorPatientTypeChartData = null;
            }
        });
    }
    fetchTopMedicationsDataSelected(ItemID: number) {
        $('#wardSearch').val('');
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = PrescriptionDashboard.FetchPrescriptionMonitoringTopPrescribedMedicationHISBI;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            ItemID: ItemID,
            DepartmentID: 0,
            TopCount: this.topMedicationsCount,
            PatientType: this.patientType,
            CompanyType: this.CompanyType
        };

        if (this.categoryType != 0) {
            apiUrl = PrescriptionDashboard.FetchLABRADPROCPrescriptionMonitoringTopPrescribedMedicationHISBI;
            payload = { ...payload, DashBoardType: this.categoryType }
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200 && response.FetchPrescriptionMonitoringTopPrescribedMedicationHISBI1DataList.length > 0) {
                this.topMedicationsData = response.FetchPrescriptionMonitoringTopPrescribedMedicationHISBI1DataList;
                this.loadTopMedicationsChart();
                this.fetchPrescribedDepartments(this.topMedicationsData[0]);
            } else {
                this.topMedicationsData = null;
                this.topMedicationsChartData = null;
                this.prescribedDepartmentsData = null;
                this.prescribedDepartmentsChartData = null;
                this.prescribedDoctorsData = null;
                this.prescribedDoctorsChartData = null;
                this.prescribedDoctorWiseData = null;
                this.prescribedDoctorWiseChartData = null;
                this.prescribedDoctorLocationData = null
                this.prescribedDoctorLocationChartData = null;
                this.prescribedDoctorPatientTypeData = null;
                this.prescribedDoctorPatientTypeChartData = null;
            }
        });
    }

    fetchTopMedicationsDataItems() {
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = PrescriptionDashboard.FetchPrescriptionMonitoringTopPrescribedMedicationHISBI;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            ItemID: 0,
            DepartmentID: 0,
            TopCount: 300,
            PatientType: this.patientType,
            CompanyType: this.CompanyType
        };

        if (this.categoryType != 0) {
            apiUrl = PrescriptionDashboard.FetchLABRADPROCPrescriptionMonitoringTopPrescribedMedicationHISBI;
            payload = { ...payload, DashBoardType: this.categoryType }
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200 && response.FetchPrescriptionMonitoringTopPrescribedMedicationHISBI1DataList.length > 0) {
                this.topMedicationsDataMedication = response.FetchPrescriptionMonitoringTopPrescribedMedicationHISBI1DataList;
            } else {
                this.topMedicationsDataMedication = null;
            }
        });
    }

    loadTopMedicationsChart() {
        this.topMedicationsChartData = {};
        this.topMedicationsChartData.series = [
            {
                name: this.categoryType == 0 ? 'Medication Count' : this.categoryType == 1 ? 'Laboratory Count' : this.categoryType == 2 ? 'Radiology Count' : this.categoryType == 3 ? 'Procedure Count' : '',
                data: this.topMedicationsData.map((item: any) => +item.TotalPrescriptionItems)
            }
        ];

        this.topMedicationsChartData.chart = {
            height: 400,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
            events: {
                dataPointSelection: (event: any, chartContext: any, config: any) => {
                    const index = config.dataPointIndex;
                    const selectedItem = this.topMedicationsData[index];
                    if (selectedItem) {
                        this.fetchPrescribedDepartments(selectedItem);
                    }
                }
            }
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
                colors: ['#ffffff'],
                fontSize: '8px',
                //fontWeight: 'bold'
            },
            offsetX: 20,
            formatter: (val: number) => val.toLocaleString('en-IN')
        };

        this.topMedicationsChartData.colors = ['#3a0ca3'];

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

    fetchPrescribedDepartments(item: any) {
        this.showLoader1 = true;
        this.selectedTopMedItemId = item.ItemID;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = PrescriptionDashboard.FetchPrescriptionMonitoringTopPrescribedMedicationDeptHISBI;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            ItemID: item.ItemID,
            DepartmentID: 0,
            TopCount: this.topMedicationsCount,
            PatientType: this.patientType,
            CompanyType: this.CompanyType
        };
        if (this.categoryType != 0) {
            apiUrl = PrescriptionDashboard.FetchLABRADPROCPrescriptionMonitoringTopPrescribedMedicationDeptHISBI;
            payload = { ...payload, DashBoardType: this.categoryType }
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200 && response.FetchPrescriptionMonitoringTopPrescribedMedicationDeptHISB1DataList.length > 0) {
                this.prescribedDepartmentsData = response.FetchPrescriptionMonitoringTopPrescribedMedicationDeptHISB1DataList;
                this.loadPrescribedDepartmentsChart();
                this.prescribedAgeGroupData = response.FetchPrescriptionMonitoringTopPrescribedMedicationDeptHISB12DataList;
                this.loadPrescibedAgeGroupChart();
                this.prescribedPatientsNationalityData = response.FetchPrescriptionMonitoringTopPrescribedMedicationDeptHISB11DataList;
                this.loadPrescribedPatientsNationalityChart();
                this.fetchPrescribedDoctors(this.prescribedDepartmentsData[0]);
            } else {
                this.prescribedDepartmentsData = null;
                this.prescribedDepartmentsChartData = null;
                this.prescribedDoctorsData = null;
                this.prescribedDoctorsChartData = null;
                this.prescribedDoctorWiseData = null;
                this.prescribedDoctorWiseChartData = null;
                this.prescribedDoctorLocationData = null
                this.prescribedDoctorLocationChartData = null;
                this.prescribedDoctorPatientTypeData = null;
                this.prescribedDoctorPatientTypeChartData = null;
                this.prescribedAgeGroupData = null;
                this.prescribedAgeGroupChartData = null;
                this.prescribedPatientsNationalityData = null;
                this.prescribedPatientsNationalityChartData = null;
            }
        });
    }

    loadPrescribedDepartmentsChart() {
        this.prescribedDepartmentsChartData = {};
        this.prescribedDepartmentsChartData.series = [
            {
                name: this.categoryType == 0 ? 'Medication Count' : this.categoryType == 1 ? 'Laboratory Count' : this.categoryType == 2 ? 'Radiology Count' : this.categoryType == 3 ? 'Procedure Count' : '',
                data: this.prescribedDepartmentsData.map((item: any) => +item.TotalPrescriptionItems)
            }
        ];

        this.prescribedDepartmentsChartData.chart = {
            height: 400,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
            events: {
                dataPointSelection: (event: any, chartContext: any, config: any) => {
                    const index = config.dataPointIndex;
                    const selectedItem = this.prescribedDepartmentsData[index];
                    if (selectedItem) {
                        this.fetchPrescribedDoctors(selectedItem);
                    }
                }
            }
        };

        this.prescribedDepartmentsChartData.plotOptions = {
            bar: {
                distributed: false,
                dataLabels: {
                    position: 'bottom'
                },
                horizontal: true,
            }
        };

        this.prescribedDepartmentsChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#ffffff'],
                fontSize: '8px',
                //fontWeight: 'bold'
            },
            offsetX: 20,
            formatter: (val: number) => val.toLocaleString('en-IN')
        };

        this.prescribedDepartmentsChartData.colors = ['#059212'];

        this.prescribedDepartmentsChartData.xaxis = {
            categories: this.prescribedDepartmentsData.map((item: any) => item.Department),
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                }
            }
        };

        this.prescribedDepartmentsChartData.title = {
            text: '',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.prescribedDepartmentsChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => val.toLocaleString('en-IN')
            }
        };
    }

    loadPrescibedAgeGroupChart() {
        this.prescribedAgeGroupChartData = {};
        this.prescribedAgeGroupChartData.series = [
            {
                name: this.categoryType == 0 ? 'Medication Count' : this.categoryType == 1 ? 'Laboratory Count' : this.categoryType == 2 ? 'Radiology Count' : this.categoryType == 3 ? 'Procedure Count' : '',
                data: [
                    this.prescribedAgeGroupData[0].Zeroto1Year,
                    this.prescribedAgeGroupData[0].Oneto18eYear,
                    this.prescribedAgeGroupData[0].Eighteento23Year,
                    this.prescribedAgeGroupData[0].TwentyThreeto35Year,
                    this.prescribedAgeGroupData[0].ThirtyFiveto65Year,
                    this.prescribedAgeGroupData[0].GreatersixtyFiveYear
                ]
            }
        ];

        this.prescribedAgeGroupChartData.chart = {
            height: 300,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
            events: {
                dataPointSelection: (event: any, chartContext: any, config: any) => {
                    const index = config.dataPointIndex;
                    const selectedItem = this.prescribedDoctorsData[index];
                    if (selectedItem) {
                        this.fetchDoctorMedication(selectedItem);
                    }
                }
            }
        };

        this.prescribedAgeGroupChartData.plotOptions = {
            bar: {
                distributed: false,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.prescribedAgeGroupChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#471069'],
                fontSize: '8px',
            },
            offsetY: -25,
            background: { enabled: true, borderRadius: 5, },
            formatter: (val: number) => val.toLocaleString('en-IN')
        };

        this.prescribedAgeGroupChartData.colors = ['#392d69'];

        this.prescribedAgeGroupChartData.fill = {
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

        this.prescribedAgeGroupChartData.xaxis = {
            categories: [
                '0-1 Year',
                '1-18 Year',
                '18-23 Year',
                '23-35 Year',
                '35-65 Year',
                '> 65 Year'
            ],
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                },
                trim: true,
                maxHeight: 100
            }
        };

        this.prescribedAgeGroupChartData.title = {
            text: '',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.prescribedAgeGroupChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => val.toLocaleString('en-IN')
            }
        };
    }

    loadPrescribedPatientsNationalityChart() {
        this.prescribedPatientsNationalityChartData = {};

        this.prescribedPatientsNationalityChartData.series = [{
            name: this.categoryType == 0 ? 'Medication Count' : this.categoryType == 1 ? 'Laboratory Count' : this.categoryType == 2 ? 'Radiology Count' : this.categoryType == 3 ? 'Procedure Count' : '',
            data: this.prescribedPatientsNationalityData.map((e: any) => +e.TotalPrescriptionItems)
        }];

        this.prescribedPatientsNationalityChartData.chart = {
            type: 'area',
            height: 300,
            toolbar: { show: true },
            zoom: { enabled: false },
        };


        this.prescribedPatientsNationalityChartData.stroke = {
            curve: 'smooth',
            width: 3,
            colors: ['#6eee87']
        };

        this.prescribedPatientsNationalityChartData.fill = {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.1,
                gradientToColors: ['#5fc52e'],
                opacityFrom: 0.9,
                opacityTo: 0.5,
                stops: [0, 100]
            }
        };

        this.prescribedPatientsNationalityChartData.markers = {
            size: 5,
            strokeWidth: 2,
            strokeColors: '#6eee87',
            colors: ['#5fc52e'],
            hover: {
                size: 7
            }
        };

        this.prescribedPatientsNationalityChartData.dataLabels = {
            enabled: false,
            style: {
                fontSize: '8px',
                colors: ['#5fc52e']
            },
            offsetY: -5,
            formatter: (val: number) => `${val.toLocaleString('en-IN')}`
        };

        this.prescribedPatientsNationalityChartData.xaxis = {
            categories: this.prescribedPatientsNationalityData.map((e: any) => e.Nationality),
            labels: {
                rotate: -45,
                rotateAlways: true,
                hideOverlappingLabels: false,
                style: {
                    fontSize: '12px'
                },
                trim: true,
                maxHeight: 100
            }

        };

        this.prescribedPatientsNationalityChartData.colors = ['#5fc52e'];

        this.prescribedPatientsNationalityChartData.title = {
            text: ``,
            align: 'left',
            style: {
                fontSize: '18px',
                fontWeight: 'bold'
            }
        };

        this.prescribedPatientsNationalityChartData.legend = {
            position: 'bottom'
        };
    }

    fetchPrescribedDoctors(item: any) {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = PrescriptionDashboard.FetchPrescriptionMonitoringTopPrescribedMedicationDoctHISBI;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            ItemID: item.ItemID,
            DepartmentID: item.DepartmentID,
            TopCount: this.topMedicationsCount,
            PatientType: this.patientType,
            CompanyType: this.CompanyType
        };

        if (this.categoryType != 0) {
            apiUrl = PrescriptionDashboard.FetchLABRADPROCPrescriptionMonitoringTopPrescribedMedicationDoctHISBI;
            payload = { ...payload, DashBoardType: this.categoryType }
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200 && response.FetchPrescriptionMonitoringTopPrescribedMedicationDoctHISBI1DataList.length > 0) {
                this.prescribedDoctorsData = response.FetchPrescriptionMonitoringTopPrescribedMedicationDoctHISBI1DataList;
                this.loadPrescribedDoctorsChart();
                this.fetchDoctorMedication(this.prescribedDoctorsData[0]);
            } else {
                this.prescribedDoctorsData = null;
                this.prescribedDoctorsChartData = null;
                this.prescribedDoctorWiseData = null;
                this.prescribedDoctorWiseChartData = null;
                this.prescribedDoctorLocationData = null
                this.prescribedDoctorLocationChartData = null;
                this.prescribedDoctorPatientTypeData = null;
                this.prescribedDoctorPatientTypeChartData = null;
            }
        });
    }

    loadPrescribedDoctorsChart() {
        this.prescribedDoctorsChartData = {};
        this.prescribedDoctorsChartData.series = [
            {
                name: this.categoryType == 0 ? 'Medication Count' : this.categoryType == 1 ? 'Laboratory Count' : this.categoryType == 2 ? 'Radiology Count' : this.categoryType == 3 ? 'Procedure Count' : '',
                data: this.prescribedDoctorsData.map((item: any) => +item.TotalPrescriptionItems)
            }
        ];

        this.prescribedDoctorsChartData.chart = {
            height: 300,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
            events: {
                dataPointSelection: (event: any, chartContext: any, config: any) => {
                    const index = config.dataPointIndex;
                    const selectedItem = this.prescribedDoctorsData[index];
                    if (selectedItem) {
                        this.fetchDoctorMedication(selectedItem);
                    }
                }
            }
        };

        this.prescribedDoctorsChartData.plotOptions = {
            bar: {
                distributed: false,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.prescribedDoctorsChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#471069'],
                fontSize: '8px',
            },
            offsetY: -25,
            background: { enabled: true, borderRadius: 5, },
            formatter: (val: number) => val.toLocaleString('en-IN')
        };

        this.prescribedDoctorsChartData.colors = ['#471069'];

        this.prescribedDoctorsChartData.fill = {
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


        this.prescribedDoctorsChartData.xaxis = {
            categories: this.prescribedDoctorsData.map((item: any) => item.DoctorName),
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                },
                trim: true,
                maxHeight: 100
            }
        };




        this.prescribedDoctorsChartData.title = {
            text: '',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.prescribedDoctorsChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => val.toLocaleString('en-IN')
            }
        };
    }

    fetchDoctorMedication(item: any) {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = PrescriptionDashboard.FetchPrescriptionMonitoringPrescribedDoctorWiseMedicationHISBI;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            ItemID: item.ItemID,
            DepartmentID: item.DepartmentID,
            DoctorID: item.DoctorID,
            PatientType: this.patientType,
            CompanyType: this.CompanyType
        };

        if (this.categoryType != 0) {
            apiUrl = PrescriptionDashboard.FetchLABRADPrescriptionMonitoringPrescribedDoctorWiseMedicationHISBI;
            payload = { ...payload, DashBoardType: this.categoryType, TopCount: this.topMedicationsCount }
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200) {
                this.prescribedDoctorLocationData = response.FetchPrescriptionMonitoringPrescribedDoctorWiseMedicationHISBI1DataList;
                this.prescribedDoctorWiseData = response.FetchPrescriptionMonitoringPrescribedDoctorWiseMedicationHISBI2DataList;
                this.prescribedDoctorPatientTypeData = response.FetchPrescriptionMonitoringPrescribedDoctorWiseMedicationHISBI3DataList;
                this.loadPrescribedDoctorLocationChart();
                this.loadPrescribedDoctorPatientTypeChart();
                this.loadPrescribedDoctorWiseChart();
            } else {
                this.prescribedDoctorWiseData = null;
                this.prescribedDoctorWiseChartData = null;
                this.prescribedDoctorLocationData = null
                this.prescribedDoctorLocationChartData = null;
                this.prescribedDoctorPatientTypeData = null;
                this.prescribedDoctorPatientTypeChartData = null;
            }
        });
    }

    loadPrescribedDoctorLocationChart() {
        this.prescribedDoctorLocationChartData = this.createDonutChart(
            this.prescribedDoctorLocationData,
            'PatientType',
            'TotalPrescriptionItems',
            '',
            '250px',
            false,
            true
        );
    }

    loadPrescribedDoctorPatientTypeChart() {
        this.prescribedDoctorPatientTypeChartData = this.createDonutChart(
            this.prescribedDoctorPatientTypeData,
            'CompanyType',
            'TotalPrescriptionItems',
            '',
            '250px',
            false,
            true
        );
    }

    loadPrescribedDoctorWiseChart() {
        this.prescribedDoctorWiseChartData = {};
        this.prescribedDoctorWiseChartData.series = [
            {
                name: this.categoryType == 0 ? 'Medication Count' : this.categoryType == 1 ? 'Laboratory Count' : this.categoryType == 2 ? 'Radiology Count' : this.categoryType == 3 ? 'Procedure Count' : '',
                data: this.prescribedDoctorWiseData.map((item: any) => +item.TotalPrescriptionItems)
            }
        ];

        this.prescribedDoctorWiseChartData.chart = {
            height: 250,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false }
        };

        this.prescribedDoctorWiseChartData.plotOptions = {
            bar: {
                columnWidth: '40%',
                borderRadius: 2,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.prescribedDoctorWiseChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#610C9F', '#DA0C81'],
                fontSize: '8px',
            },
            offsetY: -25,
            background: { enabled: true, borderRadius: 5, },
            formatter: (val: number) => val.toLocaleString('en-IN')
        };

        this.prescribedDoctorWiseChartData.colors = ['#e91fa8'];

        this.prescribedDoctorWiseChartData.fill = {
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


        this.prescribedDoctorWiseChartData.xaxis = {
            categories: this.prescribedDoctorWiseData.map((item: any) => item.MonthName),
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                },
                trim: true,
                maxHeight: 100
            }
        };

        this.prescribedDoctorWiseChartData.title = {
            text: '',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.prescribedDoctorWiseChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => val.toLocaleString('en-IN')
            }
        };
    }

    fetchTopPrescribedDepartmentsData() {
        this.showLoader2 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = PrescriptionDashboard.FetchPrescriptionMonitoringTopPrescribedMedicationOverALLHISBI;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            DepartmentID: 0,
            DoctorID: 0,
            PatientType: this.patientType,
            CompanyType: this.CompanyType
        }
        if (this.categoryType != 0) {
            apiUrl = PrescriptionDashboard.FetchLABRADPrescriptionMonitoringTopPrescribedMedicationOverALLHISBI;
            payload = { ...payload, DashBoardType: this.categoryType }
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader2 = false;
            if (response.Code === 200 && response.FetchPrescriptionMonitoringTopPrescribedMedicationOverALLHISBI1DataList.length > 0) {
                this.topPrescribedDepartmentsData = response.FetchPrescriptionMonitoringTopPrescribedMedicationOverALLHISBI1DataList;
                this.loadTopPrescribedDepartmentsChart();
                this.fetchTopPrescribedDoctors(this.topPrescribedDepartmentsData[0]);
            } else {
                this.topPrescribedDepartmentsData = null;
                this.topPrescribedDepartmentsChartData = null;
                this.topPrescribedDoctorsData = null;
                this.topPrescribedDoctorsChartData = null;
                this.topPrescribedDoctorWiseData = null;
                this.topPrescribedDoctorWiseChartData = null;
                this.topPrescribedDoctorPatientTypeData = null;
                this.topPrescribedDoctorPatientTypeChartData = null;
            }
        });
    }

    loadTopPrescribedDepartmentsChart() {
        this.topPrescribedDepartmentsChartData = {};
        this.topPrescribedDepartmentsChartData.series = [
            {
                name: this.categoryType == 0 ? 'Medication Count' : this.categoryType == 1 ? 'Laboratory Count' : this.categoryType == 2 ? 'Radiology Count' : this.categoryType == 3 ? 'Procedure Count' : '',
                data: this.topPrescribedDepartmentsData.map((item: any) => +item.TotalPrescriptionItems)
            }
        ];

        this.topPrescribedDepartmentsChartData.chart = {
            height: 500,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
            events: {
                dataPointSelection: (event: any, chartContext: any, config: any) => {
                    const index = config.dataPointIndex;
                    const selectedItem = this.topPrescribedDepartmentsData[index];
                    if (selectedItem) {
                        this.fetchTopPrescribedDoctors(selectedItem);
                    }
                }
            }
        };

        this.topPrescribedDepartmentsChartData.plotOptions = {
            bar: {
                distributed: false,
                dataLabels: {
                    position: 'bottom'
                },
                horizontal: true,
            }
        };

        this.topPrescribedDepartmentsChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#ffffff'],
                fontSize: '8px',
                //fontWeight: 'bold'
            },
            offsetX: 20,
            formatter: (val: number) => val.toLocaleString('en-IN')
        };

        this.topPrescribedDepartmentsChartData.colors = ['#006d77'];

        this.topPrescribedDepartmentsChartData.xaxis = {
            categories: this.topPrescribedDepartmentsData.map((item: any) => item.Department),
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                }
            }
        };

        this.topPrescribedDepartmentsChartData.title = {
            text: '',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.topPrescribedDepartmentsChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => val.toLocaleString('en-IN')
            }
        };
    }

    fetchTopPrescribedDoctors(item: any) {
        this.showLoader2 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = PrescriptionDashboard.FetchPrescriptionMonitoringTopPrescribedMedicationOverDeptDocALLHISBI;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            DepartmentID: item.DepartmentID,
            DoctorID: 0,
            PatientType: this.patientType,
            CompanyType: this.CompanyType
        };

        if (this.categoryType != 0) {
            apiUrl = PrescriptionDashboard.FetchLABRADPrescriptionMonitoringTopPrescribedMedicationOverDeptDocALLHISBI;
            payload = { ...payload, DashBoardType: this.categoryType }
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader2 = false;
            if (response.Code === 200 && response.FetchPrescriptionMonitoringTopPrescribedMedicationOverDeptDocALLHISBI1DataList.length > 0) {
                this.topPrescribedDoctorsData = response.FetchPrescriptionMonitoringTopPrescribedMedicationOverDeptDocALLHISBI1DataList;
                this.loadTopPrescribedDoctorsChart();
                this.fetchTopDoctorMedication(this.topPrescribedDoctorsData[0]);
            } else {
                this.topPrescribedDoctorsData = null;
                this.topPrescribedDoctorsChartData = null;
                this.topPrescribedDoctorWiseData = null;
                this.topPrescribedDoctorWiseChartData = null;
                this.topPrescribedDoctorPatientTypeData = null;
                this.topPrescribedDoctorPatientTypeChartData = null;
            }
        });
    }

    loadTopPrescribedDoctorsChart() {
        const department = this.topPrescribedDoctorsData[0]?.Department;
        this.topPrescribedDoctorsChartData = {};
        this.topPrescribedDoctorsChartData.series = [
            {
                name: this.categoryType == 0 ? 'Medication Count' : this.categoryType == 1 ? 'Laboratory Count' : this.categoryType == 2 ? 'Radiology Count' : this.categoryType == 3 ? 'Procedure Count' : '',
                data: this.topPrescribedDoctorsData.map((item: any) => +item.TotalPrescriptionItems)
            }
        ];

        this.topPrescribedDoctorsChartData.chart = {
            height: 500,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
            events: {
                dataPointSelection: (event: any, chartContext: any, config: any) => {
                    const index = config.dataPointIndex;
                    const selectedItem = this.topPrescribedDoctorsData[index];
                    if (selectedItem) {
                        this.fetchTopDoctorMedication(selectedItem);
                    }
                }
            }
        };

        this.topPrescribedDoctorsChartData.plotOptions = {
            bar: {
                distributed: false,
                dataLabels: {
                    position: 'bottom'
                },
                horizontal: true,
            }
        };

        this.topPrescribedDoctorsChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#ffffff'],
                fontSize: '8px',
            },
            offsetX: 20,
            formatter: (val: number) => val.toLocaleString('en-IN')
        };

        this.topPrescribedDoctorsChartData.colors = ['#d90429'];

        this.topPrescribedDoctorsChartData.xaxis = {
            categories: this.topPrescribedDoctorsData.map((item: any) => item.DoctorName),
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                },
                trim: true,
                maxHeight: 100
            }
        };

        this.topPrescribedDoctorsChartData.title = {
            text: '',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.topPrescribedDoctorsChartData.tooltip = {
            shared: true,
            intersect: false,
            x: {
                formatter: (seriesName: any, opts: any) => {
                    return `${seriesName} - ${department}`;
                }
            },
            y: {
                formatter: (val: number) => {
                    return val.toLocaleString('en-IN')
                }
            }
        };
    }

    fetchTopDoctorMedication(item: any) {
        this.showLoader2 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = PrescriptionDashboard.FetchPrescriptionMonitoringTopPrescribedDoctorWiseMedicationOverALLHISBI;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            DepartmentID: item.DepartmentID,
            DoctorID: item.DoctorID,
            PatientType: this.patientType,
            CompanyType: this.CompanyType
        };

        if (this.categoryType != 0) {
            apiUrl = PrescriptionDashboard.FetchLABRADPrescriptionMonitoringTopPrescribedDoctorWiseMedicationOverALLHISBI;
            payload = { ...payload, DashBoardType: this.categoryType }
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader2 = false;
            if (response.Code === 200) {
                this.topPrescribedDoctorWiseData = response.FetchPrescriptionMonitoringTopPrescribedDoctorWiseMedicationOverALLHISBI2DataList;
                this.loadTopPrescribedDoctorWiseChart();
                this.topPrescribedDoctorPatientTypeData = response.FetchPrescriptionMonitoringTopPrescribedDoctorWiseMedicationOverALLHISBI1DataList;
                this.loadTopPrescribedDoctorPatientTypeChart();
            } else {
                this.topPrescribedDoctorWiseData = null;
                this.topPrescribedDoctorWiseChartData = null;
                this.topPrescribedDoctorPatientTypeData = null;
                this.topPrescribedDoctorPatientTypeChartData = null;
            }
        });
    }

    loadTopPrescribedDoctorWiseChart() {
        this.topPrescribedDoctorWiseChartData = {};
        this.topPrescribedDoctorWiseChartData.series = [
            {
                name: this.categoryType == 0 ? 'Medication Count' : this.categoryType == 1 ? 'Laboratory Count' : this.categoryType == 2 ? 'Radiology Count' : this.categoryType == 3 ? 'Procedure Count' : '',
                data: this.topPrescribedDoctorWiseData.map((item: any) => +item.TotalPrescriptionItems)
            }
        ];

        this.topPrescribedDoctorWiseChartData.chart = {
            height: 250,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false }
        };

        this.topPrescribedDoctorWiseChartData.plotOptions = {
            bar: {
                columnWidth: '40%',
                borderRadius: 2,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.topPrescribedDoctorWiseChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#5257e5', '#DA0C81'],
                fontSize: '8px',
            },
            offsetY: -25,
            background: { enabled: true, borderRadius: 5, },
            formatter: (val: number) => val.toLocaleString('en-IN')
        };

        this.topPrescribedDoctorWiseChartData.colors = ['#5257e5'];

        this.topPrescribedDoctorWiseChartData.fill = {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.4,
                gradientToColors: ['#6fe3e1'],
                inverseColors: false,
                opacityFrom: 0.9,
                opacityTo: 0.9,
                stops: [0, 100]
            }
        };


        this.topPrescribedDoctorWiseChartData.xaxis = {
            categories: this.topPrescribedDoctorWiseData.map((item: any) => item.MonthName),
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                },
                trim: true,
                maxHeight: 100
            }
        };

        this.topPrescribedDoctorWiseChartData.title = {
            text: '',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.topPrescribedDoctorWiseChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => val.toLocaleString('en-IN')
            }
        };
    }

    loadTopPrescribedDoctorPatientTypeChart() {
        this.topPrescribedDoctorPatientTypeChartData = this.createDonutChart(
            this.topPrescribedDoctorPatientTypeData,
            'CompanyType',
            'TotalSale',
            '',
            '250px',
            true,
            true
        );
    }

    onTopMedicationItemSelect(event: any) {
        this.fetchTopMedicationsDataSelected(event.target.value);
    }



    searchServiceItem(event: any) {
        let categoryTypeN = this.categoryType;
        var filter = event.target.value;
        let apiUrl = PrescriptionDashboard.FetchPrescriptionMonitoringTopPrescribedMedicationHISBI;
        if (this.categoryType == 0)
            categoryTypeN = 4;

        if (filter.length >= 3) {
            let payload: any = {
                "Filter": filter,
                "DashBoardType": categoryTypeN,
                "WorkStationID": 3348,
                "HospitalID": this.hospitalID
            };


            apiUrl = PrescriptionDashboard.FetchKPIServiceitems;


            const url = this.us.getApiUrl(apiUrl, payload);

            this.us.getReport(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.listOfServiceItems = response.FetchKPIServiceitemsDataList;
                    }
                },
                    (err) => {

                    })
        }

        else {
            this.listOfServiceItems = [];
        }
    }

    onItemSelected(Item: any) {
        this.fetchTopMedicationsDataSelected(Item.ItemID);
    }
}

const PrescriptionDashboard = {
    FetchPrescriptionMonitoringStatistic1HISBI: 'FetchPrescriptionMonitoringStatistic1HISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchPrescriptionMonitoringTopPrescribedMedicationHISBI: 'FetchPrescriptionMonitoringTopPrescribedMedicationHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&TopCount=${TopCount}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchPrescriptionMonitoringTopPrescribedMedicationDeptHISBI: 'FetchPrescriptionMonitoringTopPrescribedMedicationDeptHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&TopCount=${TopCount}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchPrescriptionMonitoringTopPrescribedMedicationDoctHISBI: 'FetchPrescriptionMonitoringTopPrescribedMedicationDoctHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&TopCount=${TopCount}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchPrescriptionMonitoringPrescribedDoctorWiseMedicationHISBI: 'FetchPrescriptionMonitoringPrescribedDoctorWiseMedicationHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchPrescriptionMonitoringTopPrescribedMedicationOverALLHISBI: 'FetchPrescriptionMonitoringTopPrescribedMedicationOverALLHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchPrescriptionMonitoringTopPrescribedMedicationOverDeptDocALLHISBI: 'FetchPrescriptionMonitoringTopPrescribedMedicationOverDeptDocALLHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchPrescriptionMonitoringTopPrescribedDoctorWiseMedicationOverALLHISBI: 'FetchPrescriptionMonitoringTopPrescribedDoctorWiseMedicationOverALLHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchLABRADPROCPrescriptionMonitoringStatistic1HISBI: 'FetchLABRADPROCPrescriptionMonitoringStatistic1HISBI?FromDate=${FromDate}&ToDate=${ToDate}&DashBoardType=${DashBoardType}&PatientType=${PatientType}&CompanyType=${CompanyType}&HospitalID=${HospitalID}',
    FetchLABRADPROCPrescriptionMonitoringTopPrescribedMedicationHISBI: 'FetchLABRADPROCPrescriptionMonitoringTopPrescribedMedicationHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&TopCount=${TopCount}&DashBoardType=${DashBoardType}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchLABRADPROCPrescriptionMonitoringTopPrescribedMedicationDeptHISBI: 'FetchLABRADPROCPrescriptionMonitoringTopPrescribedMedicationDeptHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&TopCount=${TopCount}&DashBoardType=${DashBoardType}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchLABRADPROCPrescriptionMonitoringTopPrescribedMedicationDoctHISBI: 'FetchLABRADPROCPrescriptionMonitoringTopPrescribedMedicationDoctHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&TopCount=${TopCount}&DashBoardType=${DashBoardType}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchLABRADPrescriptionMonitoringPrescribedDoctorWiseMedicationHISBI: 'FetchLABRADPrescriptionMonitoringPrescribedDoctorWiseMedicationHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&DashBoardType=${DashBoardType}&PatientType=${PatientType}&CompanyType=${CompanyType}&TopCount=${TopCount}',
    FetchLABRADPrescriptionMonitoringTopPrescribedMedicationOverALLHISBI: 'FetchLABRADPrescriptionMonitoringTopPrescribedMedicationOverALLHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&DashBoardType=${DashBoardType}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchLABRADPrescriptionMonitoringTopPrescribedMedicationOverDeptDocALLHISBI: 'FetchLABRADPrescriptionMonitoringTopPrescribedMedicationOverDeptDocALLHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&DashBoardType=${DashBoardType}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchLABRADPrescriptionMonitoringTopPrescribedDoctorWiseMedicationOverALLHISBI: 'FetchLABRADPrescriptionMonitoringTopPrescribedDoctorWiseMedicationOverALLHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&DashBoardType=${DashBoardType}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchKPIServiceitems: 'FetchKPIServiceitems?Filter=${Filter}&DashBoardType=${DashBoardType}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};