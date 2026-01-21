import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import moment from "moment";
import { ApexChart, ApexDataLabels, ApexFill, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTitleSubtitle, ApexTooltip } from "ng-apexcharts";
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
    selector: 'app-sales-dashboard',
    templateUrl: './sales-dashboard.component.html',
    styleUrls: ['./sales-dashboard.component.scss'],
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

export class SalesDashboardComponent implements OnInit {
    dashboardData: any;
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
    rejectionDoctorWiseData: any;
    prescribedDoctorWiseChartData: any;
    rejectionDoctorWiseChartData: any;

    patientType: any = -1;
    companyType: any = -1;
    itemType: any = -1;
    patientTypeLabel: any = 'All';
    DepartmentLabel: any;
DoctorLabel: any;
     prescriptionDataD: any;
    prescriptionStatisticsD: any;
    MonthNameLabel:any;

        categoryType: any = 0;
    listOfServiceItems: any = [];

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
        { id: 3, label: 'ED' },
        { id: 4, label: 'DC' }
    ];

    companyTypes: any = [
        { id: -1, label: 'All' },
        { id: 1, label: 'Cash' },
        { id: 2, label: 'Insured' },
        { id: 3, label: 'MOH' },
        { id: 4, label: 'Others' }
    ];

    itemTypes: any = [
        { id: -1, label: 'All' },
        { id: 1, label: 'Medication' },
        { id: 2, label: 'Machine' },
        { id: 3, label: 'Vaccine' },
    ];

    prescribedAgeGroupData: any;
    prescribedAgeGroupChartData: any
    prescribedPatientsNationalityData: any;
    prescribedPatientsNationalityChartData: any;

    showLoader1: boolean = false;

    prescribedDoctorWiseDetails: any;
    rejectionDoctorWiseDetails: any;

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
         $('#wardSearch').val('');
        const { fromdate, todate } = this.getFormattedDates();
        if (fromdate && todate && new Date(fromdate) > new Date(todate)) {
            this.showErrorModal("From Date should not be greater than To Date.");
            return;
        }
        this.clearData();
        this.patientTypeLabel = this.patientTypes.find((pt: any) => pt.id == this.patientType)?.label || 'All';
         this.fetchPrescriptionMonitoringStatisticsOnLoad();
        this.fetchPrescribedDepartments()
    }

    private getFormattedDates(): { fromdate: string; todate: string } {
        const fromdate = moment(this.datesForm.get("fromdate")?.value).format('DD-MMM-YYYY');
        const todate = moment(this.datesForm.get("todate")?.value).format('DD-MMM-YYYY');
        return { fromdate, todate };
    }

    clearFilters() {
         $('#wardSearch').val('');
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
        this.patientType = -1;
        this.companyType = -1;
        this.itemType = -1;
        this.fetchData();
    }

    clearData() {
         $('#wardSearch').val('');
        this.prescriptionStatistics = null;
        this.patientsData = null;
        this.patientsChartData = null;
        this.prescriptionData = null;
        this.prescriptionChartData = null;
        this.pharmacySalesChartData = null;
        this.pharmacySalesData = null;

        this.prescribedDepartmentsData = null;
        this.prescribedDepartmentsChartData = null;

        this.topMedicationsData = null;
        this.topMedicationsChartData = null;

        this.prescribedDoctorsData = null;
        this.prescribedDoctorsChartData = null;

        this.prescribedAgeGroupData = null;
        this.prescribedAgeGroupChartData = null;

        this.prescribedPatientsNationalityData = null;
        this.prescribedPatientsNationalityChartData = null;

        this.prescribedDoctorWiseData = null;
        this.prescribedDoctorWiseChartData = null;

        this.rejectionDoctorWiseData = null;
        this.rejectionDoctorWiseChartData = null;

        this.prescribedDoctorWiseDetails = null;
        this.rejectionDoctorWiseDetails = null;
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

    onDepartmentChartItemClick(item: any) {
         $('#wardSearch').val('');
        this.prescribedDoctorsData = null;
        this.prescribedDoctorsChartData = null;

        this.prescribedAgeGroupData = null;
        this.prescribedAgeGroupChartData = null;

        this.prescribedPatientsNationalityData = null;
        this.prescribedPatientsNationalityChartData = null;

        this.prescribedDoctorWiseData = null;
        this.prescribedDoctorWiseChartData = null;

        this.rejectionDoctorWiseData = null;
        this.rejectionDoctorWiseChartData = null;

        this.prescribedDoctorWiseDetails = null;
        this.rejectionDoctorWiseDetails = null;

        this.fetchPrescriptionMonitoringStatistics(item);
        this.fetchTopMedicationsData(item);
    }

    onMedicationChartItemClick(item: any) {
 $('#wardSearch').val('');
         this.fetchPrescribedDepartmentsR(item);       
        this.fetchPrescribedDoctors(item);
         this.fetchPrescriptionMonitoringStatistics(item);
    }

    onDoctorChartItemClick(item: any) {
         $('#wardSearch').val('');
        this.fetchTopMedicationsDataR(item);
        this.fetchPrescribedDepartmentsR(item);
        this.fetchDoctorMedication(item);
        this.fetchNationalityData(item);
        this.fetchAgeGroupData(item);
         this.fetchPrescriptionMonitoringStatistics(item);
    }

    fetchPrescriptionMonitoringStatistics(item: any) {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = SalesDashboard.FetchPrescriptionItemIssuesMonitoringStatistic1HISBI;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            PatientType: this.patientType,
            CompanyType: this.companyType,
            ItemType: this.itemType,
            ItemID: item?.ItemID ?? 0,
            DepartmentID: item?.DepartmentID ?? 0,
            DoctorID: item?.DoctorID ?? 0,
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200) {
                this.prescriptionStatistics = response.FetchPrescriptionItemIssuesMonitoringStatistic1HISBI1HISBIDataList[0];
                // this.patientsData = response.FetchPrescriptionMonitoringStatistic1HISBI2DataList;
                this.prescriptionData = response.FetchPrescriptionItemIssuesMonitoringStatistic1HISBI2DataList[0];
                 if(response.FetchPrescriptionItemIssuesMonitoringStatistic1HISBI3DataList.length>0)
                this.DepartmentLabel=response.FetchPrescriptionItemIssuesMonitoringStatistic1HISBI3DataList[0].DepartmentName;
                //this.pharmacySalesData = response.FetchPrescriptionMonitoringStatistic1HISBI4DataList;
                // this.loadPatientsChart();
                // this.loadPrescriptionsChart();
                // this.loadPharmacySalesChart();
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
    fetchPrescriptionMonitoringStatisticsOnLoad() {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = SalesDashboard.FetchPrescriptionItemIssuesMonitoringStatistic1HISBI;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            PatientType: this.patientType,
            CompanyType: this.companyType,
            ItemType: this.itemType,
            ItemID:  0,
            DepartmentID: 0,
            DoctorID:  0,
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200) {
                this.prescriptionStatisticsD = response.FetchPrescriptionItemIssuesMonitoringStatistic1HISBI1HISBIDataList[0];               
                this.prescriptionDataD = response.FetchPrescriptionItemIssuesMonitoringStatistic1HISBI2DataList[0];
               
            } else {                
                this.prescriptionDataD = null;
                this.prescriptionStatisticsD = null;
                
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

    fetchPrescribedDepartments(item?: any) {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = SalesDashboard.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDDEPARTMENTS;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            PatientType: this.patientType,
            CompanyType: this.companyType,
            ItemType: this.itemType,
            ItemID: item?.ItemID ?? 0,
            DepartmentID: item?.DepartmentID ?? 0,
            DoctorID: item?.DoctorID ?? 0,
            TopCount: this.topMedicationsCount,
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200 && response.FetchPrescriptionItemIssuesMonitoringTopPrescribedDepartmentHISBI1DataList.length > 0) {
                this.prescribedDepartmentsData = response.FetchPrescriptionItemIssuesMonitoringTopPrescribedDepartmentHISBI1DataList;
                this.loadPrescribedDepartmentsChart();
                this.fetchPrescriptionMonitoringStatistics(this.prescribedDepartmentsData[0]);
                this.fetchTopMedicationsData(this.prescribedDepartmentsData[0]);
            } else {
                this.prescriptionStatistics = null;
                this.patientsData = null;
                this.patientsChartData = null;
                this.prescriptionData = null;
                this.prescriptionChartData = null;
                this.pharmacySalesChartData = null;
                this.pharmacySalesData = null;

                this.topMedicationsData = null;
                this.topMedicationsChartData = null;

                this.prescribedDepartmentsData = null;
                this.prescribedDepartmentsChartData = null;

                this.prescribedDoctorsData = null;
                this.prescribedDoctorsChartData = null;

                this.prescribedAgeGroupData = null;
                this.prescribedAgeGroupChartData = null;

                this.prescribedPatientsNationalityData = null;
                this.prescribedPatientsNationalityChartData = null;

                this.prescribedDoctorWiseData = null;
                this.prescribedDoctorWiseChartData = null;

                this.rejectionDoctorWiseData = null;
                this.rejectionDoctorWiseChartData = null;
            }
        });
    }

     fetchPrescribedDepartmentsR(item?: any) {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = SalesDashboard.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDDEPARTMENTS;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            PatientType: this.patientType,
            CompanyType: this.companyType,
            ItemType: this.itemType,
            ItemID: item?.ItemID ?? 0,
            DepartmentID: 0,//item?.DepartmentID ?? 0,
            DoctorID: item?.DoctorID ?? 0,
            TopCount: this.topMedicationsCount,
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200 && response.FetchPrescriptionItemIssuesMonitoringTopPrescribedDepartmentHISBI1DataList.length > 0) {
                this.prescribedDepartmentsData = response.FetchPrescriptionItemIssuesMonitoringTopPrescribedDepartmentHISBI1DataList;
                this.loadPrescribedDepartmentsChart();
                //this.fetchPrescriptionMonitoringStatistics(this.prescribedDepartmentsData[0]);
                //this.fetchTopMedicationsData(this.prescribedDepartmentsData[0]);
            } else {
                this.prescriptionStatistics = null;
                this.patientsData = null;
                this.patientsChartData = null;
                this.prescriptionData = null;
                this.prescriptionChartData = null;
                this.pharmacySalesChartData = null;
                this.pharmacySalesData = null;

                this.topMedicationsData = null;
                this.topMedicationsChartData = null;

                this.prescribedDepartmentsData = null;
                this.prescribedDepartmentsChartData = null;

                this.prescribedDoctorsData = null;
                this.prescribedDoctorsChartData = null;

                this.prescribedAgeGroupData = null;
                this.prescribedAgeGroupChartData = null;

                this.prescribedPatientsNationalityData = null;
                this.prescribedPatientsNationalityChartData = null;

                this.prescribedDoctorWiseData = null;
                this.prescribedDoctorWiseChartData = null;

                this.rejectionDoctorWiseData = null;
                this.rejectionDoctorWiseChartData = null;
            }
        });
    }
      fetchPrescribedDepartmentsRS(item?: any) {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = SalesDashboard.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDDEPARTMENTS;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            PatientType: this.patientType,
            CompanyType: this.companyType,
            ItemType: this.itemType,
            ItemID: item?.ItemID ?? 0,
            DepartmentID: 0,//item?.DepartmentID ?? 0,
            DoctorID: item?.DoctorID ?? 0,
            TopCount: this.topMedicationsCount,
        }
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200 && response.FetchPrescriptionItemIssuesMonitoringTopPrescribedDepartmentHISBI1DataList.length > 0) {
                this.prescribedDepartmentsData = response.FetchPrescriptionItemIssuesMonitoringTopPrescribedDepartmentHISBI1DataList;
                this.loadPrescribedDepartmentsChart();
                this.fetchPrescriptionMonitoringStatistics(this.prescribedDepartmentsData[0]);
                item.DepartmentID=this.prescribedDepartmentsData[0].DepartmentID;
                this.fetchTopMedicationsData(item);
                this.fetchPrescribedDoctors(item);
                //this.fetchTopMedicationsData(this.prescribedDepartmentsData[0]);
            } else {
                this.prescriptionStatistics = null;
                this.patientsData = null;
                this.patientsChartData = null;
                this.prescriptionData = null;
                this.prescriptionChartData = null;
                this.pharmacySalesChartData = null;
                this.pharmacySalesData = null;

                this.topMedicationsData = null;
                this.topMedicationsChartData = null;

                this.prescribedDepartmentsData = null;
                this.prescribedDepartmentsChartData = null;

                this.prescribedDoctorsData = null;
                this.prescribedDoctorsChartData = null;

                this.prescribedAgeGroupData = null;
                this.prescribedAgeGroupChartData = null;

                this.prescribedPatientsNationalityData = null;
                this.prescribedPatientsNationalityChartData = null;

                this.prescribedDoctorWiseData = null;
                this.prescribedDoctorWiseChartData = null;

                this.rejectionDoctorWiseData = null;
                this.rejectionDoctorWiseChartData = null;
            }
        });
    }

    loadPrescribedDepartmentsChart() {
        this.prescribedDepartmentsChartData = {};
        this.prescribedDepartmentsChartData.series = [
            {
                name: 'Sales Count',
                data: this.prescribedDepartmentsData.map((item: any) => +item.TotalIssuedItems)
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
                        this.onDepartmentChartItemClick(selectedItem);
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
                fontSize: '8px'
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
            custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
                const item = this.prescribedDepartmentsData[dataPointIndex];
                return `
                    <div class="apexcharts-tooltip-title" style="font-size: 12px;">${item.Department}</div>
                    <div class="apexcharts-tooltip-series-group apexcharts-active" style="display: flex; align-items: center;">
                        <div class="apexcharts-tooltip-text">
                            <div style="font-size: 12px;">Quantity: <span style="font-weight:600;">${Number(item.TotalIssuedItems).toLocaleString('en-IN')}</span></div>
                            <div style="font-size: 12px;">Amount: <span style="font-weight:600;">
                            ${Number(item.TotalSaleAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            </div>
                        </div>
                    </div>
                    `;
            }
        };
    }

    fetchTopMedicationsData(item: any) {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = SalesDashboard.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDMEDICATIONS;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            PatientType: this.patientType,
            CompanyType: this.companyType,
            ItemType: this.itemType,
            ItemID: item?.ItemID ?? 0,
            DepartmentID: item?.DepartmentID ?? 0,
            DoctorID: item?.DoctorID ?? 0,
            TopCount: this.topMedicationsCount,
        };

        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200 && response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBI1DataList.length > 0) {
                this.topMedicationsData = response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBI1DataList;
                   if(response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIDDDataList.length>0)
                 this.DepartmentLabel=response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIDDDataList[0].DepartmentName;
                 
                this.loadTopMedicationsChart();
            } else {
                this.topMedicationsData = null;
                this.topMedicationsChartData = null;
                this.DepartmentLabel='';
                this.prescribedDoctorsData = null;
                this.prescribedDoctorsChartData = null;

                this.prescribedAgeGroupData = null;
                this.prescribedAgeGroupChartData = null;

                this.prescribedPatientsNationalityData = null;
                this.prescribedPatientsNationalityChartData = null;

                this.prescribedDoctorWiseData = null;
                this.prescribedDoctorWiseChartData = null;

                this.rejectionDoctorWiseData = null;
                this.rejectionDoctorWiseChartData = null;
            }
        });
    }
    fetchTopMedicationsDataR(item: any) {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = SalesDashboard.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDMEDICATIONS;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            PatientType: this.patientType,
            CompanyType: this.companyType,
            ItemType: this.itemType,
            ItemID: 0,//item?.ItemID ?? 0,
            DepartmentID: 0,//item?.DepartmentID ?? 0,
            DoctorID: item?.DoctorID ?? 0,
            TopCount: this.topMedicationsCount,
        };

        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200 && response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBI1DataList.length > 0) {
                this.topMedicationsData = response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBI1DataList;
                if(response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIDDDataList.length>0)
                 this.DepartmentLabel=response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIDDDataList[0].DepartmentName;
                 
                this.loadTopMedicationsChart();
            } else {
                this.topMedicationsData = null;
                this.topMedicationsChartData = null;
                this.DepartmentLabel='';
                this.prescribedDoctorsData = null;
                this.prescribedDoctorsChartData = null;

                this.prescribedAgeGroupData = null;
                this.prescribedAgeGroupChartData = null;

                this.prescribedPatientsNationalityData = null;
                this.prescribedPatientsNationalityChartData = null;

                this.prescribedDoctorWiseData = null;
                this.prescribedDoctorWiseChartData = null;

                this.rejectionDoctorWiseData = null;
                this.rejectionDoctorWiseChartData = null;
            }
        });
    }

    loadTopMedicationsChart() {
        this.topMedicationsChartData = {};
        this.topMedicationsChartData.series = [
            {
                name: 'Sales Count',
                data: this.topMedicationsData.map((item: any) => +item.TotalIssuedItems)
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
                        this.onMedicationChartItemClick(selectedItem);
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
            custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
                const item = this.topMedicationsData[dataPointIndex];
                return `
                    <div class="apexcharts-tooltip-title" style="font-size: 12px;">${item.ItemName}</div>
                    <div class="apexcharts-tooltip-series-group apexcharts-active" style="display: flex; align-items: center;">
                        <div class="apexcharts-tooltip-text">
                            <div style="font-size: 12px;">Quantity: <span style="font-weight:600;">${Number(item.TotalIssuedItems).toLocaleString('en-IN')}</span></div>
                            <div style="font-size: 12px;">Amount: <span style="font-weight:600;">
                            ${Number(item.TotalSaleAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            </div>
                        </div>
                    </div>
                    `;
            }
        };
    }

    fetchPrescribedDoctors(item: any) {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = SalesDashboard.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDDoctors;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            PatientType: this.patientType,
            CompanyType: this.companyType,
            ItemType: this.itemType,
            ItemID: item?.ItemID ?? 0,
            DepartmentID: item?.DepartmentID ?? 0,
            DoctorID: item?.DoctorID ?? 0,
            TopCount: this.topMedicationsCount,
        };
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200 && response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDDoctors1DataList.length > 0) {
                this.prescribedDoctorsData = response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDDoctors1DataList;
                 if(response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIDDDataList.length>0)
                 this.DepartmentLabel=response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIDDDataList[0].DepartmentName;
                 if(response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIEEDataList.length>0)
                 this.DoctorLabel=response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIEEDataList[0].EmpName;
                this.loadPrescribedDoctorsChart();
                this.fetchDoctorMedication(this.prescribedDoctorsData[0]);
                this.fetchNationalityData(this.prescribedDoctorsData[0]);
                this.fetchAgeGroupData(this.prescribedDoctorsData[0]);
            } else {
                this.prescribedDoctorsData = null;
                this.prescribedDoctorsChartData = null;

                this.prescribedAgeGroupData = null;
                this.prescribedAgeGroupChartData = null;

                this.prescribedPatientsNationalityData = null;
                this.prescribedPatientsNationalityChartData = null;

                this.prescribedDoctorWiseData = null;
                this.prescribedDoctorWiseChartData = null;

                this.rejectionDoctorWiseData = null;
                this.rejectionDoctorWiseChartData = null;

            }
        });
    }

    loadPrescribedDoctorsChart() {
        this.prescribedDoctorsChartData = {};
        this.prescribedDoctorsChartData.series = [
            {
                name: 'Sales Count',
                data: this.prescribedDoctorsData.map((item: any) => +item.TotalIssuedItems)
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
                        this.onDoctorChartItemClick(selectedItem)
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

    fetchNationalityData(item: any) {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = SalesDashboard.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDNationality;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            PatientType: this.patientType,
            CompanyType: this.companyType,
            ItemType: this.itemType,
            ItemID: item?.ItemID ?? 0,
            DepartmentID: item?.DepartmentID ?? 0,
            DoctorID: item?.DoctorID ?? 0,
            TopCount: this.topMedicationsCount,
        };
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200 && response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBINationality1HISBI1DataList.length > 0) {
                this.prescribedPatientsNationalityData = response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBINationality1HISBI1DataList;
                 if(response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIDDDataList.length>0)
                 this.DepartmentLabel=response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIDDDataList[0].DepartmentName;
                    if(response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIEEDataList.length>0)
                 this.DoctorLabel=response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIEEDataList[0].EmpName;
                this.loadPrescribedPatientsNationalityChart();
            } else {
                this.prescribedPatientsNationalityData = null;
                this.prescribedPatientsNationalityChartData = null;
            }
        });
    }

    fetchAgeGroupData(item: any) {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = SalesDashboard.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDAgeGroup;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            PatientType: this.patientType,
            CompanyType: this.companyType,
            ItemType: this.itemType,
            ItemID: item?.ItemID ?? 0,
            DepartmentID: item?.DepartmentID ?? 0,
            DoctorID: item?.DoctorID ?? 0,
            TopCount: this.topMedicationsCount,
        };
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200 && response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDAgeGroup1DataList.length > 0) {
                this.prescribedAgeGroupData = response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDAgeGroup1DataList;
                 if(response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIDDDataList.length>0)
                 this.DepartmentLabel=response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIDDDataList[0].DepartmentName;
                    if(response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIEEDataList.length>0) 
                 this.DoctorLabel=response.FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBIEEDataList[0].EmpName;
                this.loadPrescribedAgeGroupChart();
            } else {
                this.prescribedAgeGroupData = null;
                this.prescribedAgeGroupChartData = null;
            }
        });
    }

    loadPrescribedAgeGroupChart() {
        this.prescribedAgeGroupChartData = {};
        this.prescribedAgeGroupChartData.series = [
            {
                name: 'Sales Count',
                data: [
                    this.prescribedAgeGroupData[0].Zeroto1Year,
                    this.prescribedAgeGroupData[0].Oneto18eYear,
                    this.prescribedAgeGroupData[0].Eighteento23Year>0?this.prescribedAgeGroupData[0].Eighteento23Year:'0',
                    this.prescribedAgeGroupData[0].TwentyThreeto35Year>0?this.prescribedAgeGroupData[0].TwentyThreeto35Year:'0',
                    this.prescribedAgeGroupData[0].ThirtyFiveto65Year>0?this.prescribedAgeGroupData[0].ThirtyFiveto65Year:'0',
                    this.prescribedAgeGroupData[0].GreatersixtyFiveYear>0?this.prescribedAgeGroupData[0].GreatersixtyFiveYear:'0',
                ]
            }
        ];

        this.prescribedAgeGroupChartData.chart = {
            height: 300,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false }
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
            name: 'Sales Count',
            data: this.prescribedPatientsNationalityData.map((e: any) => +e.TotalIssuedItems)
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

    fetchDoctorMedication(item: any) {
        this.showLoader1 = true;
        const { fromdate, todate } = this.getFormattedDates();
        let apiUrl = SalesDashboard.FetchPrescriptionItemIssuesMonitoringMonthWiseMedicationAndRejectionHISBI;
        let payload: any = {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue(),
            ItemID: item?.ItemID ?? 0,
            DepartmentID: item?.DepartmentID ?? 0,
            DoctorID: item?.DoctorID ?? 0,
            PatientType: this.patientType,
            CompanyType: this.companyType,
            ItemType: this.itemType,
        };
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200) {
                if (response.FetchPrescriptionItemIssuesMonitoringMonthWiseMedicationAndRejectionHISBI1DataList.length > 0) {
                    this.prescribedDoctorWiseData = response.FetchPrescriptionItemIssuesMonitoringMonthWiseMedicationAndRejectionHISBI1DataList;
                    this.loadPrescribedDoctorWiseChart();
                    this.fetchPrescribedDoctorWiseDetails(this.prescribedDoctorWiseData[0]);
                } else {
                    this.prescribedDoctorWiseData = null;
                    this.prescribedDoctorWiseChartData = null;
                    this.prescribedDoctorWiseDetails = null;
                }

                if (response.FetchPrescriptionItemIssuesMonitoringMonthWiseMedicationAndRejectionHISBI2DataList.length > 0) {
                    this.rejectionDoctorWiseData = response.FetchPrescriptionItemIssuesMonitoringMonthWiseMedicationAndRejectionHISBI2DataList;
                    this.loadRejectionDoctorWiseChart();
                    this.fetchRejectionDoctorWiseDetails(this.rejectionDoctorWiseData[0]);
                } else {
                    this.rejectionDoctorWiseData = null;
                    this.rejectionDoctorWiseChartData = null;
                    this.rejectionDoctorWiseDetails = null;
                }
            }
        });
    }

    loadPrescribedDoctorWiseChart() {
        this.prescribedDoctorWiseChartData = {};
        this.prescribedDoctorWiseChartData.series = [
            {
                name: 'Sales Count',
                data: this.prescribedDoctorWiseData.map((item: any) => +item.TotalIssuedItems)
            }
        ];

        this.prescribedDoctorWiseChartData.chart = {
            height: 250,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
            events: {
                dataPointSelection: (event: any, chartContext: any, config: any) => {
                    const index = config.dataPointIndex;
                    const selectedItem = this.prescribedDoctorWiseData[index];
                    if (selectedItem) {
                        this.fetchPrescribedDoctorWiseDetails(selectedItem);
                    }
                }
            }
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

    loadRejectionDoctorWiseChart() {
        this.rejectionDoctorWiseChartData = {};
        this.rejectionDoctorWiseChartData.series = [
            {
                name: 'Sales Count',
                data: this.rejectionDoctorWiseData.map((item: any) => +item.TotalRejectionItems)
            }
        ];

        this.rejectionDoctorWiseChartData.chart = {
            height: 250,
            type: 'bar',
            toolbar: { show: true },
            zoom: { enabled: false },
            events: {
                dataPointSelection: (event: any, chartContext: any, config: any) => {
                    const index = config.dataPointIndex;
                    const selectedItem = this.rejectionDoctorWiseData[index];
                    if (selectedItem) {
                        this.fetchRejectionDoctorWiseDetails(selectedItem);
                    }
                }
            }
        };

        this.rejectionDoctorWiseChartData.plotOptions = {
            bar: {
                columnWidth: '40%',
                borderRadius: 2,
                dataLabels: {
                    position: 'top'
                }
            }
        };

        this.rejectionDoctorWiseChartData.dataLabels = {
            enabled: true,
            style: {
                colors: ['#610C9F', '#DA0C81'],
                fontSize: '8px',
            },
            offsetY: -25,
            background: { enabled: true, borderRadius: 5, },
            formatter: (val: number) => val.toLocaleString('en-IN')
        };

        this.rejectionDoctorWiseChartData.colors = ['#e91fa8'];

        this.rejectionDoctorWiseChartData.fill = {
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


        this.rejectionDoctorWiseChartData.xaxis = {
            categories: this.rejectionDoctorWiseData.map((item: any) => item.MonthName),
            labels: {
                rotate: -45,
                style: {
                    fontSize: '12px'
                },
                trim: true,
                maxHeight: 100
            }
        };

        this.rejectionDoctorWiseChartData.title = {
            text: '',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1e293b'
            }
        };

        this.rejectionDoctorWiseChartData.tooltip = {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number) => val.toLocaleString('en-IN')
            }
        };
    }

    fetchPrescribedDoctorWiseDetails(item: any) {
        this.showLoader1 = true;
        let apiUrl = SalesDashboard.FetchPrescriptionItemIssuesMonitoringMedicationAndPRESCRIPTIONDetailsHISBI;
        let payload: any = {
            YearID: item?.YearID ?? 0,
            MonthID: item?.MonthID ?? 0,
            HospitalID: this.getLocationsValue(),
            ItemID: item?.ItemID ?? 0,
            DepartmentID: item?.DepartmentID ?? 0,
            DoctorID: item?.DoctorID ?? 0,
            PatientType: this.patientType,
            CompanyType: this.companyType,
            ItemType: this.itemType,
        };
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200) {
                this.prescribedDoctorWiseDetails = response.FetchPrescriptionItemIssuesMonitoringMedicationAndPRESCRIPTIONDetailsHISBI1DataList;
 if(response.FetchPrescriptionItemIssuesMonitoringMedicationAndPRESCRIPTIONDetailsHISBI1DataList.length>0)
                 this.MonthNameLabel=response.FetchPrescriptionItemIssuesMonitoringMedicationAndPRESCRIPTIONDetailsHISBI1DataList[0].MonthName;
                
            }
        });
    }

    fetchRejectionDoctorWiseDetails(item: any) {
        this.showLoader1 = true;
        let apiUrl = SalesDashboard.FetchPrescriptionItemIssuesMonitoringMedicationAndRejectionDetailsHISBI;
        let payload: any = {
            YearID: item?.YearID ?? 0,
            MonthID: item?.MonthID ?? 0,
            HospitalID: this.getLocationsValue(),
            ItemID: item?.ItemID ?? 0,
            DepartmentID: item?.DepartmentID ?? 0,
            DoctorID: item?.DoctorID ?? 0,
            PatientType: this.patientType,
            CompanyType: this.companyType,
            ItemType: this.itemType,
        };
        const url = this.us.getApiUrl(apiUrl, payload);

        this.us.getReport(url).subscribe((response: any) => {
            this.showLoader1 = false;
            if (response.Code === 200) {
                this.rejectionDoctorWiseDetails = response.FetchPrescriptionItemIssuesMonitoringMedicationAndRejectionDetailsHISBI1DataList;
            }
        });
    }

    exportPrescriptionDetailsToCSV() {
        const headers = ['SSN', 'Patient Name', 'Item Code', 'Item Name', 'Prescribed Qty', 'Duration', 'Amount', 'Payer'];
        const rows = this.prescribedDoctorWiseDetails.map((item: any) => [
            item.SSN,
            item.PatientName,
            item.IssuedItemCode,
            item.IssuedItemName,
            item.IssuedQty,
            item.Duration,
            Number(item.TotalSaleAmount).toFixed(2),
            item.CompanyName
        ]);

        const csvContent =
            [headers, ...rows]
                .map(e => e.join(','))
                .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `PrescriptionDetails_${new Date().toISOString()}` + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportRejectionDetailsToCSV() {
        const headers = ['Item Code', 'Item Name', 'Prescribed Qty', 'Duration', 'Amount', 'Payer'];
        const rows = this.rejectionDoctorWiseDetails.map((item: any) => [
            item.IssuedItemCode,
            item.IssuedItemName,
            item.RejectionQty,
            item.Duration,
            Number(item.TotalRejectionAmount).toFixed(2),
            item.CompanyName
        ]);

        const csvContent =
            [headers, ...rows]
                .map(e => e.join(','))
                .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `RejectionDetails_${new Date().toISOString()}` + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Sorting state for prescription details table
    prescriptionSort: { field: string; direction: 'asc' | 'desc' } = { field: '', direction: 'asc' };
    // Sorting state for rejection details table
    rejectionSort: { field: string; direction: 'asc' | 'desc' } = { field: '', direction: 'asc' };

    private compareValues(a: any, b: any, isNumeric: boolean) {
        if (a == null) a = isNumeric ? 0 : '';
        if (b == null) b = isNumeric ? 0 : '';

        if (isNumeric) {
            const na = Number(a);
            const nb = Number(b);
            if (isNaN(na) && isNaN(nb)) return 0;
            if (isNaN(na)) return -1;
            if (isNaN(nb)) return 1;
            return na - nb;
        }

        const sa = String(a).toLowerCase();
        const sb = String(b).toLowerCase();
        if (sa < sb) return -1;
        if (sa > sb) return 1;
        return 0;
    }

    sortPrescription(field: string) {
        if (!this.prescribedDoctorWiseDetails) return;
        if (this.prescriptionSort.field === field) {
            this.prescriptionSort.direction = this.prescriptionSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.prescriptionSort.field = field;
            this.prescriptionSort.direction = 'asc';
        }

        const numericFields = ['IssuedQty', 'TotalSaleAmount'];
        const isNumeric = numericFields.includes(field);

        this.prescribedDoctorWiseDetails = [...this.prescribedDoctorWiseDetails].sort((x: any, y: any) => {
            const res = this.compareValues(x[field], y[field], isNumeric);
            return this.prescriptionSort.direction === 'asc' ? res : -res;
        });
    }

    getPrescriptionSortIcon(field: string) {
        if (this.prescriptionSort.field !== field) return '';
        return this.prescriptionSort.direction === 'asc' ? '↑' : '↓';
    }

    sortRejection(field: string) {
        if (!this.rejectionDoctorWiseDetails) return;
        if (this.rejectionSort.field === field) {
            this.rejectionSort.direction = this.rejectionSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.rejectionSort.field = field;
            this.rejectionSort.direction = 'asc';
        }

        const numericFields = ['RejectionQty', 'TotalRejectionAmount'];
        const isNumeric = numericFields.includes(field);

        this.rejectionDoctorWiseDetails = [...this.rejectionDoctorWiseDetails].sort((x: any, y: any) => {
            const res = this.compareValues(x[field], y[field], isNumeric);
            return this.rejectionSort.direction === 'asc' ? res : -res;
        });
    }

    getRejectionSortIcon(field: string) {
        if (this.rejectionSort.field !== field) return '';
        return this.rejectionSort.direction === 'asc' ? '↑' : '↓';
    }
     searchServiceItem(event: any) {
        let categoryTypeN = this.categoryType;
        var filter = event.target.value;
        let apiUrl = SalesDashboard.FetchPrescriptionMonitoringTopPrescribedMedicationHISBI;
        if (this.categoryType == 0)
            categoryTypeN = 4;

        if (filter.length >= 3) {
            let payload: any = {
                "Filter": filter,
                "DashBoardType": categoryTypeN,
                "WorkStationID": 3348,
                "HospitalID": this.hospitalID
            };


            apiUrl = SalesDashboard.FetchKPIServiceitems;


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

    onItemSelected(item: any) {
        this.fetchPrescribedDepartmentsRS(item);
          //this.fetchTopMedicationsData(item);
        //this.fetchPrescribedDoctors(item);
    }

    prepareDashboardData(): any {
        const { fromdate, todate } = this.getFormattedDates();

        return {
            dateRange: { from: fromdate, to: todate },
            locations: this.locations?.filter((x: any) => x.selected).map((x: any) => x.label).join(', ') || 'All',
            metrics: {
                filters: {
                    patientType: this.patientTypeLabel || 'All',
                    companyType: this.companyTypes.find((ct: any) => ct.id == this.companyType)?.label || 'All',
                    itemType: this.itemTypes.find((it: any) => it.id == this.itemType)?.label || 'All'
                },
                statistics: {
                    overall: {
                        totalPrescriptions: this.prescriptionStatisticsD?.TotalPrescriptions || 0,
                        totalIssuedItems: this.prescriptionStatisticsD?.TotalIssuedItems || 0,
                        totalSaleAmount: this.prescriptionStatisticsD?.TotalSaleAmount || 0,
                        totalPatients: this.prescriptionStatisticsD?.TotalPatients || 0
                    },
                    filtered: {
                        totalPrescriptions: this.prescriptionStatistics?.TotalPrescriptions || 0,
                        totalIssuedItems: this.prescriptionStatistics?.TotalIssuedItems || 0,
                        totalSaleAmount: this.prescriptionStatistics?.TotalSaleAmount || 0,
                        totalPatients: this.prescriptionStatistics?.TotalPatients || 0
                    }
                },
                currentSelection: {
                    department: this.DepartmentLabel || null,
                    doctor: this.DoctorLabel || null,
                    month: this.MonthNameLabel || null
                },
                topDepartments: this.prescribedDepartmentsData?.slice(0, 10) || [],
                topMedications: this.topMedicationsData?.slice(0, this.topMedicationsCount) || [],
                topDoctors: this.prescribedDoctorsData?.slice(0, 10) || [],
                demographics: {
                    ageGroups: this.prescribedAgeGroupData?.[0] || null,
                    nationalities: this.prescribedPatientsNationalityData?.slice(0, 10) || []
                },
                monthlyTrends: {
                    prescriptions: this.prescribedDoctorWiseData || [],
                    rejections: this.rejectionDoctorWiseData || []
                },
                detailedRecords: {
                    prescriptionDetails: this.prescribedDoctorWiseDetails?.slice(0, 100) || [],
                    rejectionDetails: this.rejectionDoctorWiseDetails?.slice(0, 100) || []
                }
            }
        };
    }

    showClaraModal: boolean = false;

    showAI() {
        this.dashboardData = this.prepareDashboardData();
        this.showClaraModal = true;
    }

    getDateRange() {
        const { fromdate, todate } = this.getFormattedDates();

        return {
            dateRange: { from: fromdate, to: todate }
        }
    }
}

const SalesDashboard = {
     FetchPrescriptionMonitoringTopPrescribedMedicationHISBI: 'FetchPrescriptionMonitoringTopPrescribedMedicationHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&TopCount=${TopCount}&PatientType=${PatientType}&CompanyType=${CompanyType}',
    FetchPrescriptionItemIssuesMonitoringStatistic1HISBI: 'FetchPrescriptionItemIssuesMonitoringStatistic1HISBI?FromDate=${FromDate}&ToDate=${ToDate}&PatientType=${PatientType}&CompanyType=${CompanyType}&ItemType=${ItemType}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&HospitalID=${HospitalID}',
    FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDDEPARTMENTS: 'FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDDEPARTMENTS?FromDate=${FromDate}&ToDate=${ToDate}&PatientType=${PatientType}&CompanyType=${CompanyType}&ItemType=${ItemType}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&TopCount=${TopCount}&HospitalID=${HospitalID}',
    FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDMEDICATIONS: 'FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDMEDICATIONS?FromDate=${FromDate}&ToDate=${ToDate}&PatientType=${PatientType}&CompanyType=${CompanyType}&ItemType=${ItemType}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&TopCount=${TopCount}&HospitalID=${HospitalID}',
    FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDDoctors: 'FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDDoctors?FromDate=${FromDate}&ToDate=${ToDate}&PatientType=${PatientType}&CompanyType=${CompanyType}&ItemType=${ItemType}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&TopCount=${TopCount}&HospitalID=${HospitalID}',
    FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDNationality: 'FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDNationality?FromDate=${FromDate}&ToDate=${ToDate}&PatientType=${PatientType}&CompanyType=${CompanyType}&ItemType=${ItemType}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&TopCount=${TopCount}&HospitalID=${HospitalID}',
    FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDAgeGroup: 'FetchPrescriptionItemIssuesMonitoringTopPrescribedMedicationHISBITOPPRESCRIBEDAgeGroup?FromDate=${FromDate}&ToDate=${ToDate}&PatientType=${PatientType}&CompanyType=${CompanyType}&ItemType=${ItemType}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&TopCount=${TopCount}&HospitalID=${HospitalID}',
    FetchPrescriptionItemIssuesMonitoringMonthWiseMedicationAndRejectionHISBI: 'FetchPrescriptionItemIssuesMonitoringMonthWiseMedicationAndRejectionHISBI?FromDate=${FromDate}&ToDate=${ToDate}&PatientType=${PatientType}&CompanyType=${CompanyType}&ItemType=${ItemType}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&HospitalID=${HospitalID}',
    FetchPrescriptionItemIssuesMonitoringMedicationAndRejectionDetailsHISBI: 'FetchPrescriptionItemIssuesMonitoringMedicationAndRejectionDetailsHISBI?YearID=${YearID}&MonthID=${MonthID}&PatientType=${PatientType}&CompanyType=${CompanyType}&ItemType=${ItemType}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&HospitalID=${HospitalID}',
    FetchPrescriptionItemIssuesMonitoringMedicationAndPRESCRIPTIONDetailsHISBI: 'FetchPrescriptionItemIssuesMonitoringMedicationAndPRESCRIPTIONDetailsHISBI?YearID=${YearID}&MonthID=${MonthID}&PatientType=${PatientType}&CompanyType=${CompanyType}&ItemType=${ItemType}&ItemID=${ItemID}&DepartmentID=${DepartmentID}&DoctorID=${DoctorID}&HospitalID=${HospitalID}',
    FetchKPIServiceitems: 'FetchKPIServiceitems?Filter=${Filter}&DashBoardType=${DashBoardType}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};