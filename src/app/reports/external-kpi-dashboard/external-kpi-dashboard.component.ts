import { group } from "@angular/animations";
import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { offset } from "highcharts";
import moment from "moment";
import { UtilityService } from "src/app/shared/utility.service";
import { ChartExportService } from "../chartexport.service";
import { backgroundImage } from "html2canvas/dist/types/css/property-descriptors/background-image";
import { position } from "html2canvas/dist/types/css/property-descriptors/position";
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
    selector: 'app-external-kpi-dashboard',
    templateUrl: './external-kpi-dashboard.component.html',
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

export class ExternalDashboardComponent implements OnInit {
    datesForm!: FormGroup;
    hospitalID: any;
    locations = [
        { label: 'Nuzha', value: 3, selected: false },
        { label: 'Suwaidi', value: 2, selected: false }
    ];
    doctorDetails: any;
    errorMsg: any = '';
    facilityId: any;
    externalStatistics: any;
    waitingTimeStatistics: any;
    waitingTimeMonthlyData: any = [];
    waitingTimeMonthlyChartData: any;
    initialAssessmentsData: any;
    initialAssessmentsChartData: any;
    newbornVitalsData: any;
    newbornVitalsChartData: any;
    newbornScreeningData: any;
    newbornScreeningChartData: any;
    surgicalReadmissionData: any;
    surgicalReadmissionChartData: any;
    hapuData: any;
    hapuChartData: any;
    mortalityData: any = {};
    acuteMIChartData: any;
    strokeChartData: any;
    communityPneumoniaChartData: any;
    maternalDeathChartData: any;
    infantDeathChartData: any;
    premaritalScreeningData: any = [];
    bedTurnoverData: any = [];
    wardWiseStayData: any = [];
    preMaritalLOSData: any;
    preMaritalLOSChartData: any;
    preMaritalLOSData2: any;
    preMaritalLOSChartData2: any;
    preMaritalLOSData3: any;
    preMaritalLOSChartData3: any;
    clabsiData: any;
    clabsiChartData: any;

    constructor(private fb: FormBuilder, private us: UtilityService, private exportService: ChartExportService) {
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

        this.fetchExternalStatistics();
        this.fetchInitialAssessments();
        this.fetchNewbornVitalsData();
        this.fetchSurgicalInfectionsData();
        this.fetchAllMortalityData();
        this.fetchPreMaritalLOSData();
    }

    fetchPreMaritalLOSData() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(ExternalDashboard.FetchExternalMOHPreMaritalLOSHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.preMaritalLOSData = response.FetchExternalMOHPreMaritalLOSHISBI1DataList;
                this.preMaritalLOSData2 = response.FetchExternalMOHPreMaritalLOSHISBI2DataList;
                this.preMaritalLOSData3 = response.FetchExternalMOHPreMaritalLOSHISBI3DataList;

                this.preparePreMaritalLOSChartData();
                this.preparePreMaritalLOSChartData2();
                //this.preparePreMaritalLOSChartData3();
                this.prepareClinicVisitsChartData();
            } else {
            }
        });
    }

    preparePreMaritalLOSChartData() {
        if (this.preMaritalLOSData?.length > 0) {
            const categories = this.preMaritalLOSData.map((x: any) => x.MonthName);
            const series1 = this.preMaritalLOSData.map((x: any) => +x.TotalPatients || 0);
            const series2 = this.preMaritalLOSData.map((x: any) => +x.PreMaritalScreening || 0);
            //const series3 = this.preMaritalLOSData.map((x: any) => parseFloat(x.ScreeeningRate) * 100 || 0);
            const series3 = this.preMaritalLOSData.map((x: any) => +x.ScreeeningRate || 0);
            this.preMaritalLOSChartData = {};

            this.preMaritalLOSChartData.series = [
                {
                    name: 'Total Patients',
                    type: 'column',
                    data: series1
                },
                {
                    name: 'Pre-Marital Screening',
                    type: 'column',
                    data: series2
                },
                {
                    name: 'Screening Rate (%)',
                    type: 'line',
                    data: series3
                }
            ];

            this.preMaritalLOSChartData.chart = {
                height: 300,
                width: '100%',
                type: 'line',
                stacked: false,
                toolbar: { show: true },
                zoom: { enabled: false }
            };

            this.preMaritalLOSChartData.stroke = {
                width: [0, 0, 3],
                curve: 'smooth',
                colors: ['#005B41', '#E95793', '#dc3912']
            };

            this.preMaritalLOSChartData.colors = ['#005B41', '#E95793', '#dc3912'];

            this.preMaritalLOSChartData.dataLabels = {
                enabled: true,
                 enabledOnSeries: [0,1],
                style: {
                    fontSize: '8px',
                    //fontWeight: 'bold'
                },
                offsetY: -8,
                background: { enabled: true ,borderRadius: 5,},
                dropShadow: { enabled: false },
                formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 2) {
                          if (val > 0)
                        return `${val.toFixed(2)}%`;
                    else 
                        return;
                    } else {
                         if (val > 0) {
                         return val.toFixed(0);
                        }
                        return ;
                        //return val.toFixed(0);
                    }
                }
            };

            this.preMaritalLOSChartData.plotOptions = {
                bar: {
                    columnWidth: '40%',
                    borderRadius: 2,
                    dataLabels: {
                        position: 'top'
                    }
                }
            };

            this.preMaritalLOSChartData.xaxis = {
                categories,
                labels: {
                    rotate: -45,
                    style: {
                        fontSize: '12px',
                        fontWeight: 500
                    }
                }
            };

            this.preMaritalLOSChartData.markers = {
                size: [0, 0, 5],
                strokeWidth: 2,
                strokeColors: ['#005B41', '#E95793', '#dc3912'],
                colors: ['#005B41', '#E95793', '#dc3912'],
                hover: { size: 7 }
            };

            this.preMaritalLOSChartData.yaxis = [
                {
                    seriesName: ['Total Patients', 'Pre-Marital Screening'],
                    title: {
                        text: 'Patients'
                    },
                    labels: {
                        formatter: (val: number) => val.toFixed(0),
                        style: { fontSize: '12px' },
                        offsetX: -5
                    },
                    axisTicks: { show: true },
                    axisBorder: { show: true }
                },
                {
                    seriesName: ['Screening Rate (%)'],
                    opposite: true,
                    //title: { text: 'Screening Rate (%)' },
                    labels: {
                        formatter: (val: number) => `${val.toFixed(0)}%`,
                        style: { fontSize: '12px' }
                    },
                    min: 0,
                    max: 100,
                    axisTicks: { show: true },
                    axisBorder: { show: true }
                }
            ];

            this.preMaritalLOSChartData.tooltip = {
                shared: true,
                intersect: false,
                x: { show: true },
                y: [
                    {
                        formatter: (val: number) => `${val.toFixed(0)}`
                    },
                    {
                        formatter: (val: number) => `${val.toFixed(0)}`
                    },
                    {
                        formatter: (val: number) => `${val.toFixed(2)}%`
                    }
                ]
            };

            this.preMaritalLOSChartData.legend = {
                position: 'bottom',
                horizontalAlign: 'center',
                grouped: false
            };

            this.preMaritalLOSChartData.title = {
                text: 'SCREENING RATE FOR PRE-MARITAL SCREENING',
                align: 'center',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1e293b'
                }
            };
        } else {
            this.preMaritalLOSChartData = null;
        }
    }

    preparePreMaritalLOSChartData2() {
        if (this.preMaritalLOSData2?.length > 0) {
            const categories = this.preMaritalLOSData2.map((x: any) => x.MonthName);
            const admissionDays = this.preMaritalLOSData2.map((x: any) => +x.AdmissionDays || 0);
            const dischargePatients = this.preMaritalLOSData2.map((x: any) => +x.TotalDischargePatients || 0);
            const avgLOS = this.preMaritalLOSData2.map((x: any) => +x.AverageLenthofStay || 0);
            const bedTurnover = this.preMaritalLOSData2.map((x: any) => +x.BedTurnoverRate || 0);

            this.preMaritalLOSChartData2 = {
                series: [
                    {
                        name: 'Admission Days',
                        type: 'column',
                        data: admissionDays
                    },
                    {
                        name: 'Discharge Patients',
                        type: 'column',
                        data: dischargePatients
                    },
                    {
                        name: 'Avg. Length of Stay (Days)',
                        type: 'line',
                        data: avgLOS
                    },
                    {
                        name: 'Bed Turnover Rate',
                        type: 'line',
                        data: bedTurnover
                    }
                ],
                chart: {
                    height: 350,
                    type: 'line',
                    stacked: false,
                    toolbar: { show: true },
                    zoom: { enabled: false }
                },
                colors: ['#7149C6', '#FFED00', '#2CD3E1', '#d62728'],
                stroke: {
                    width: [0, 0, 3, 3],
                    curve: 'smooth'
                },
                dataLabels: {
                    enabled: true,
                    enabledOnSeries: [0,1,2],
                    
                    formatter: (val: number, opts: any) => {
                        const seriesIndex = opts.seriesIndex;
                        if (seriesIndex > 1) {
                            //return val.toFixed(2);
                             if (val > 0) {
                            return val.toFixed(2);
                            }
                            return ;
                        } else {
                            if (val > 0) {
                            return val.toFixed(0);
                            }
                            return ;
                            //return val.toFixed(0);
                        }
                    },
                    style: {
                        fontSize: '7px',
                        colors: ['#000000'],
                        //fontWeight: 'bold'
                    },
                    offsetY: 3,
                     background: { enabled: false ,borderRadius: 5,},
                     dropShadow: { enabled: false },

                },
                plotOptions: {
                    bar: {
                        columnWidth: '30%',
                        borderRadius: 2,
                        dataLabels: {
                            position: 'top',
                            orientation: 'vertical'
                        },
                         distributed: false,
                    }
                },
                xaxis: {
                    categories,
                    labels: {
                        rotate: -45,
                        style: {
                            fontSize: '12px',
                            fontWeight: 500
                        }
                    }
                },
                markers: {
                    size: [0, 0, 5, 5],
                    strokeWidth: 2
                },
                yaxis: [
                    {
                        seriesName: ['Admission Days', 'Discharge Patients','Avg. Length of Stay (Days)'],
                        //title: { text: 'Patients / Days' },
                        labels: {
                            formatter: (val: number) => val.toFixed(0),
                            style: { fontSize: '12px' }
                        },
                        axisTicks: { show: true },
                        axisBorder: { show: true }
                    },
                    {
                        seriesName: ['Bed Turnover Rate'],
                        opposite: true,
                        //title: { text: 'Rate / Days' },
                        labels: {
                            formatter: (val: number) => val.toFixed(0),
                            style: { fontSize: '12px' }
                        },
                        min:0,
                        max:100,
                        axisTicks: { show: true },
                        axisBorder: { show: true }
                    }
                ],
                tooltip: {
                    shared: true,
                    intersect: false,
                    y: [
                        { formatter: (val: number) => val.toFixed(0) },
                        { formatter: (val: number) => val.toFixed(0) },
                        { formatter: (val: number) => val.toFixed(2) },
                        { formatter: (val: number) => val.toFixed(2) }
                    ]
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    grouped: false
                },
                title: {
                    text: 'AVERAGE LENGTH OF STAY & BED TURNOVER RATE',
                    align: 'center',
                    style: {
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1e293b'
                    }
                }
            };
        } else {
            this.preMaritalLOSChartData2 = null;
        }
    }

    prepareClinicVisitsChartData() {
        this.preMaritalLOSData3 = {
            series: [
                {
                    data: this.preMaritalLOSData3.map((item: any) => ({
                        x: item.DischargedWard,
                        y: Number(item.AverageLenthofStay)
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
                formatter: (text: any, opts: any) => {
                    const item = opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex];
                    return `${text} (${item.y})`;
                },
            }
        };
    }

    preparePreMaritalLOSChartData3() {
        if (this.preMaritalLOSData3?.length > 0) {
            const categories = this.preMaritalLOSData3.map((x: any) => x.DischargedWard);
            const totalDischarges = this.preMaritalLOSData3.map((x: any) => +x.TotalDischarges || 0);
            const admissionDays = this.preMaritalLOSData3.map((x: any) => +x.AdmissionDays || 0);
            const avgLOS = this.preMaritalLOSData3.map((x: any) => +x.AverageLenthofStay || 0);

            this.preMaritalLOSChartData3 = {
                series: [
                    {
                        name: 'Total Discharges',
                        type: 'column',
                        data: totalDischarges
                    },
                    {
                        name: 'Admission Days',
                        type: 'column',
                        data: admissionDays
                    },
                    {
                        name: 'Avg. Length of Stay (Days)',
                        type: 'line',
                        data: avgLOS
                    }
                ],
                chart: {
                    height: 300,
                    type: 'line',
                    stacked: false,
                    toolbar: { show: true },
                    zoom: { enabled: false }
                },
                colors: ['#1f77b4', '#ff7f0e', '#2ca02c'],
                stroke: {
                    width: [0, 0, 3],
                    curve: 'smooth'
                },
                dataLabels: {
                    enabled: true,
                    formatter: (val: number, opts: any) => {
                        return opts.seriesIndex === 2 ? val.toFixed(2) : val.toFixed(0);
                    },
                    style: {
                        fontSize: '8px',
                        //fontWeight: 'bold'
                    },
                    offsetY: -5,
                    background: { enabled: false }
                },
                plotOptions: {
                    bar: {
                        columnWidth: '40%',
                        borderRadius: 2,
                        dataLabels: { position: 'top' }
                    }
                },
                xaxis: {
                    categories,
                    labels: {
                        rotate: -45,
                        style: {
                            fontSize: '11px',
                            fontWeight: 500
                        }
                    }
                },
                markers: {
                    size: [0, 0, 5],
                    strokeWidth: 2
                },
                yaxis: [
                    {
                        title: { text: 'Discharges / Days' },
                        labels: {
                            formatter: (val: number) => val.toFixed(0),
                            style: { fontSize: '12px' }
                        }
                    },
                    {
                        opposite: true,
                        title: { text: 'Avg. Length of Stay' },
                        labels: {
                            formatter: (val: number) => val.toFixed(2),
                            style: { fontSize: '12px' }
                        }
                    }
                ],
                tooltip: {
                    shared: true,
                    intersect: false,
                    y: [
                        { formatter: (val: number) => val.toFixed(0) },
                        { formatter: (val: number) => val.toFixed(0) },
                        { formatter: (val: number) => val.toFixed(2) }
                    ]
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    grouped: false
                },
                title: {
                    text: 'AVERAGE LENGTH OF STAY - WARD WISE',
                    align: 'center',
                    style: {
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1e293b'
                    }
                }
            };
        } else {
            this.preMaritalLOSChartData3 = null;
        }
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

    fetchExternalStatistics() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(ExternalDashboard.FetchExternalMOHStatisticsERWaitingHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.externalStatistics = response.FetchExternalMOHStatisticsERWaitingHISBI1DataList[0];
                this.waitingTimeStatistics = response.FetchExternalMOHStatisticsERWaitingHISBI2DataList[0];
                this.waitingTimeMonthlyData = response.FetchExternalMOHStatisticsERWaitingHISBI3DataList;
                this.prepareWaitingTimeMonthlyChartData();
            } else {
                this.externalStatistics = null;
                this.waitingTimeStatistics = null;
                this.waitingTimeMonthlyData = [];
                this.waitingTimeMonthlyChartData = null;
            }
        });
    }

    fetchInitialAssessments() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(ExternalDashboard.FetchExternalMOHInitialAssessmentHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.initialAssessmentsData = response.FetchExternalMOHInitialAssessmentHISBI1DataList;
                this.prepareInitialAssessmentChartData();
            } else {
                this.initialAssessmentsData = null;
                this.initialAssessmentsChartData = null;
            }
        });
    }

    fetchNewbornVitalsData() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(ExternalDashboard.FetchExternalMOHVTENEWBORNHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.newbornVitalsData = response.FetchExternalMOHVTENEWBORNHISBI1DataList;
                this.newbornScreeningData = response.FetchExternalMOHVTENEWBORNHISBI2DataList;

                this.prepareNewbornVitalsChartData();
                this.prepareNewbornScreeningChartData();
            } else {
            }
        });
    }

    fetchSurgicalInfectionsData() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(ExternalDashboard.FetchExternalMOHSurgeryHAPUCLABSIHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.surgicalReadmissionData = response.FetchExternalMOHSurgeryHAPUCLABSIHISBI1DataList;
                this.prepareSurgicalReadmissionChartData();

                this.hapuData = response.FetchExternalMOHSurgeryHAPUCLABSIHISBI2DataList;
                this.prepareHAPUChartData();

                this.clabsiData = response.FetchExternalMOHSurgeryHAPUCLABSIHISBI3DataList;
                this.prepareCLABSIChartData()

            } else {
            }
        });
    }

    fetchAllMortalityData() {
        const { fromdate, todate } = this.getFormattedDates();
        const url = this.us.getApiUrl(ExternalDashboard.FetchExternalMOHAllMortalityHISBI, {
            FromDate: fromdate,
            ToDate: todate,
            HospitalID: this.getLocationsValue()
        });

        this.us.getReport(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.processMortalityData(response.FetchExternalMOHAllMortalityHISBI1DataList);
            } else {
                this.resetMortalityData();
            }
        });
    }

    processMortalityData(data: any[]) {
        const groupedData = data.reduce((acc: any, item: any) => {
            const typeId = item.MartalityTypeID;
            if (!acc[typeId]) {
                acc[typeId] = {
                    type: item.MartalityType,
                    data: []
                };
            }
            acc[typeId].data.push(item);
            return acc;
        }, {});

        this.mortalityData = groupedData;

        this.prepareAcuteMIChartData();
        this.prepareStrokeChartData();
        this.prepareCommunityPneumoniaChartData();
        this.prepareMaternalDeathChartData();
        this.prepareInfantDeathChartData();
    }

    prepareInfantDeathChartData() {
        const data = this.mortalityData['5']?.data || [];

        if (data.length > 0) {
            const categories = data.map((x: any) => x.MonthName);
            const liveBirths = data.map((x: any) => +x.TotalMortality || 0);
            const deaths = data.map((x: any) => +x.TotalMortalityDeaths || 0);
            const mortalityRate = data.map((x: any) => parseFloat(x.MortalityDeathsRate) || 0);

            this.infantDeathChartData = {
                series: [
                    {
                        name: 'Live Births',
                        type: 'column',
                        data: liveBirths
                    },
                    {
                        name: 'Infant Deaths',
                        type: 'column',
                        data: deaths
                    },
                    {
                        name: 'Mortality Rate (%)',
                        type: 'line',
                        data: mortalityRate
                    }
                ],
                chart: {
                    height: 300,
                    width: '100%',
                    type: 'line',
                    stacked: false,
                    toolbar: { show: true },
                    zoom: { enabled: false }
                },
                stroke: {
                    width: [0, 0, 3],
                    curve: 'smooth',
                    colors: ['#3338A0', '#A239EA', '#d62728']
                },
                colors: ['#3338A0', '#A239EA', '#d62728'],
                dataLabels: {
                    enabled: true,
                    enabledOnSeries: [0, 1],

                    style: {
                        fontSize: '8px',
                        //fontWeight: 'bold'
                    },
                    offsetY: -8,
                   background: { enabled: true ,borderRadius: 5,},

                    dropShadow: { enabled: false },
                    // formatter: (val: number, opts: any) => {
                    //     const seriesIndex = opts.seriesIndex;
                    //     return seriesIndex === 2 ? `${val.toFixed(2)}%` : val.toFixed(0);
                    // }
                    formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 2) {
                        if (val > 0)
                        return `${val.toFixed(2)}%`;
                    else
                        return;
                    } else {
                        if (val > 0) {
                         return val.toFixed(0);
                        }
                        return ;
                        //return val.toFixed(0);
                    }
                }
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
                xaxis: {
                    categories,
                    labels: {
                        rotate: -45,
                        style: {
                            fontSize: '12px',
                            fontWeight: 500
                        }
                    }
                },
                markers: {
                    size: [0, 0, 5],
                    strokeWidth: 2,
                    strokeColors: ['#bcbd22', '#ff7f0e', '#d62728'],
                    colors: ['#bcbd22', '#ff7f0e', '#d62728'],
                    hover: { size: 7 }
                },
                yaxis: [
                    {
                        seriesName: ['Live Births', 'Infant Deaths'],
                        title: { text: '' },
                        labels: {
                            formatter: (val: number) => val.toFixed(0),
                            style: { fontSize: '12px' },
                            offsetX: -5
                        },
                        axisTicks: { show: true },
                        axisBorder: { show: true }
                    },
                    {
                        seriesName: ['Mortality Rate (%)'],
                        opposite: true,
                        title: { text: '' },
                        labels: {
                            formatter: (val: number) => `${val.toFixed(0)}%`,
                            style: { fontSize: '12px' }
                        },
                        min: 0,
                        max: 100,
                        axisTicks: { show: true },
                        axisBorder: { show: true }
                    }
                ],
                tooltip: {
                    shared: true,
                    intersect: false,
                    x: { show: true },
                    y: [
                        {
                            formatter: (val: number) => `${val.toFixed(0)}`
                        },
                        {
                            formatter: (val: number) => `${val.toFixed(0)}`
                        },
                        {
                            formatter: (val: number) => `${val.toFixed(2)}%`
                        }
                    ]
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    grouped: false
                },
                title: {
                    text: 'MORTALITY RATE - INFANT DEATH',
                    align: 'center',
                    style: {
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1e293b'
                    }
                }
            };
        } else {
            this.infantDeathChartData = null;
        }
    }

    resetMortalityData() {
        this.mortalityData = {};
        this.acuteMIChartData = null;
        this.strokeChartData = null;
        this.communityPneumoniaChartData = null;
        this.maternalDeathChartData = null;
        this.infantDeathChartData = null;
    }

    prepareAcuteMIChartData() {
        const data = this.mortalityData['1']?.data || [];

        if (data.length > 0) {
            const categories = data.map((x: any) => x.MonthName);
            const totalCases = data.map((x: any) => +x.TotalMortality || 0);
            const deaths = data.map((x: any) => +x.TotalMortalityDeaths || 0);
            const mortalityRate = data.map((x: any) => parseFloat(x.MortalityDeathsRate) || 0);

            this.acuteMIChartData = {};

            this.acuteMIChartData.series = [
                {
                    name: 'Acute MI Cases',
                    type: 'column',
                    data: totalCases
                },
                {
                    name: 'Deaths',
                    type: 'column',
                    data: deaths
                },
                {
                    name: 'Mortality Rate',
                    type: 'line',
                    data: mortalityRate
                }
            ];

            this.acuteMIChartData.chart = {
                height: 300,
                width: '100%',
                type: 'line',
                stacked: false,
                toolbar: { show: true },
                zoom: { enabled: false }
            };

            this.acuteMIChartData.stroke = {
                width: [0, 0, 3],
                curve: 'smooth',
                colors: ['#310A5D', '#927FBF', '#d62728']
            };

            this.acuteMIChartData.colors = ['#310A5D', '#927FBF', '#d62728'];

            this.acuteMIChartData.dataLabels = {
                enabled: true,
                enabledOnSeries: [0, 1],
                style: {
                    fontSize: '8px',
                    //fontWeight: 'bold'
                },
                offsetY: -8,
                 background: { enabled: true ,borderRadius: 5,},
                dropShadow: { enabled: false },
                // formatter: (val: number, opts: any) => {
                //     const seriesIndex = opts.seriesIndex;
                //     return seriesIndex === 2 ? `${val.toFixed(2)}%` : val.toFixed(0);
                // }
                formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 2) {
                        if (val > 0)
                        return `${val.toFixed(2)}%`;
                    else 
                        return;
                    } else {
                        if (val > 0) {
                         return val.toFixed(0);
                        }
                        return ;
                        //return val.toFixed(0);
                    }
                }
            };

            this.acuteMIChartData.plotOptions = {
                bar: {
                    columnWidth: '40%',
                    borderRadius: 2,
                    dataLabels: {
                        position: 'top'
                    }
                }
            };

            this.acuteMIChartData.xaxis = {
                categories,
                labels: {
                    rotate: -45,
                    style: {
                        fontSize: '12px',
                        fontWeight: 500
                    }
                }
            };

            this.acuteMIChartData.markers = {
                size: [0, 0, 5],
                strokeWidth: 2,
                strokeColors: ['#1f77b4', '#ff7f0e', '#d62728'],
                colors: ['#1f77b4', '#ff7f0e', '#d62728'],
                hover: { size: 7 }
            };

            this.acuteMIChartData.yaxis = [
                {
                    seriesName: ['Acute MI Cases', 'Deaths'],
                    title: {
                        text: ''
                    },
                    labels: {
                        formatter: (val: number) => val.toFixed(0),
                        style: { fontSize: '12px' },
                        offsetX: -5
                    },
                    //  min: 0,
                    // max: 10,
                    axisTicks: { show: true },
                    axisBorder: { show: true }
                },
                {
                    seriesName: ['Mortality Rate'],
                    opposite: true,
                    title: { text: '' },
                    labels: {
                        formatter: (val: number) => `${val.toFixed(1)}%`,
                        style: { fontSize: '12px' }
                    },
                    min: 0,
                    max: 100,
                    axisTicks: { show: true },
                    axisBorder: { show: true }
                }
            ];

            this.acuteMIChartData.tooltip = {
                shared: true,
                intersect: false,
                x: { show: true },
                y: [
                    {
                        formatter: (val: number) => `${val.toFixed(0)}`
                    },
                    {
                        formatter: (val: number) => `${val.toFixed(0)}`
                    },
                    {
                        formatter: (val: number) => `${val.toFixed(2)}%`
                    }
                ]
            };

            this.acuteMIChartData.legend = {
                position: 'bottom',
                horizontalAlign: 'center',
                grouped: false
            };

            this.acuteMIChartData.title = {
                text: 'MORTALITY RATE - ACUTE MYOCARDIAL INFARCTION',
                align: 'center',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1e293b'
                }
            };
        } else {
            this.acuteMIChartData = null;
        }
    }

    prepareStrokeChartData() {
        const data = this.mortalityData['4']?.data || [];

        if (data.length > 0) {
            const categories = data.map((x: any) => x.MonthName);
            const totalCases = data.map((x: any) => +x.TotalMortality || 0);
            const deaths = data.map((x: any) => +x.TotalMortalityDeaths || 0);
            const mortalityRate = data.map((x: any) => parseFloat(x.MortalityDeathsRate) || 0);

            this.strokeChartData = {};

            this.strokeChartData.series = [
                {
                    name: 'Stroke Cases',
                    type: 'column',
                    data: totalCases
                },
                {
                    name: 'Deaths',
                    type: 'column',
                    data: deaths
                },
                {
                    name: 'Mortality Rate',
                    type: 'line',
                    data: mortalityRate
                }
            ];

            this.strokeChartData.chart = {
                height: 300,
                width: '100%',
                type: 'line',
                stacked: false,
                toolbar: { show: true },
                zoom: { enabled: false }
            };

            this.strokeChartData.stroke = {
                width: [0, 0, 3],
                curve: 'smooth',
                colors: ['#6528F7', '#A076F9', '#d62728']
            };

            this.strokeChartData.colors = ['#6528F7', '#A076F9', '#d62728'];

            this.strokeChartData.dataLabels = {
                enabled: true,
                enabledOnSeries: [0, 1],
                style: {
                    fontSize: '8px',
                    //fontWeight: 'bold'
                },
                offsetY: -8,
               background: { enabled: true ,borderRadius: 5,},
                dropShadow: { enabled: false },
                // formatter: (val: number, opts: any) => {
                //     const seriesIndex = opts.seriesIndex;
                //     return seriesIndex === 2 ? `${val.toFixed(2)}%` : val.toFixed(0);
                // }
                formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 2) {
                        if (val > 0)
                        return `${val.toFixed(2)}%`;
                    else
                        return;
                    } else {
                        if (val > 0) {
                         return val.toFixed(0);
                        }
                        return ;
                        //return val.toFixed(0);
                    }
                }
            };

            this.strokeChartData.plotOptions = {
                bar: {
                    columnWidth: '40%',
                    borderRadius: 2,
                    dataLabels: {
                        position: 'top'
                    }
                }
            };

            this.strokeChartData.xaxis = {
                categories,
                labels: {
                    rotate: -45,
                    style: {
                        fontSize: '12px',
                        fontWeight: 500
                    }
                }
            };

            this.strokeChartData.markers = {
                size: [0, 0, 5],
                strokeWidth: 2,
                strokeColors: ['#2ca02c', '#ff7f0e', '#d62728'],
                colors: ['#2ca02c', '#ff7f0e', '#d62728'],
                hover: { size: 7 }
            };

            this.strokeChartData.yaxis = [
                {
                    seriesName: ['Stroke Cases', 'Deaths'],
                    title: { text: '' },
                    labels: {
                        formatter: (val: number) => val.toFixed(0),
                        style: { fontSize: '12px' },
                        offsetX: -5
                    },
                    axisTicks: { show: true },
                    axisBorder: { show: true }
                },
                {
                    seriesName: ['Mortality Rate'],
                    opposite: true,
                    title: { text: '' },
                    labels: {
                        formatter: (val: number) => `${val.toFixed(0)}%`,
                        style: { fontSize: '12px' }
                    },
                    min: 0,
                    max: 100,
                    axisTicks: { show: true },
                    axisBorder: { show: true }
                }
            ];

            this.strokeChartData.tooltip = {
                shared: true,
                intersect: false,
                x: { show: true },
                y: [
                    {
                        formatter: (val: number) => `${val.toFixed(0)}`
                    },
                    {
                        formatter: (val: number) => `${val.toFixed(0)}`
                    },
                    {
                        formatter: (val: number) => `${val.toFixed(2)}%`
                    }
                ]
            };

            this.strokeChartData.legend = {
                position: 'bottom',
                horizontalAlign: 'center',
                grouped: false
            };

            this.strokeChartData.title = {
                text: 'MORTALITY RATE - STROKE',
                align: 'center',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1e293b'
                }
            };
        } else {
            this.strokeChartData = null;
        }
    }

    prepareCommunityPneumoniaChartData() {
        const data = this.mortalityData['2']?.data || [];

        if (data.length > 0) {
            const categories = data.map((x: any) => x.MonthName);
            const totalCases = data.map((x: any) => +x.TotalMortality || 0);
            const deaths = data.map((x: any) => +x.TotalMortalityDeaths || 0);
            const mortalityRate = data.map((x: any) => parseFloat(x.MortalityDeathsRate) || 0);

            this.communityPneumoniaChartData = {
                series: [
                    {
                        name: 'Pneumonia Cases',
                        type: 'column',
                        data: totalCases
                    },
                    {
                        name: 'Deaths',
                        type: 'column',
                        data: deaths
                    },
                    {
                        name: 'Mortality Rate',
                        type: 'line',
                        data: mortalityRate
                    }
                ],
                chart: {
                    height: 300,
                    width: '100%',
                    type: 'line',
                    stacked: false,
                    toolbar: { show: true },
                    zoom: { enabled: false }
                },
                stroke: {
                    width: [0, 0, 3],
                    curve: 'smooth',
                    colors: ['#4B352A', '#CA7842', '#d62728']
                },
                colors: ['#4B352A', '#CA7842', '#d62728'],
                dataLabels: {
                    enabled: true,
                    enabledOnSeries: [0, 1],
                    style: {
                        fontSize: '8px',
                        //fontWeight: 'bold'
                    },
                    offsetY: -8,
                   background: { enabled: true ,borderRadius: 5,},

                    dropShadow: { enabled: false },
                    // formatter: (val: number, opts: any) => {
                    //     const seriesIndex = opts.seriesIndex;
                    //     return seriesIndex === 2 ? `${val.toFixed(2)}%` : val.toFixed(0);
                    // }
                    formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 2) {
                        if (val > 0)
                        return `${val.toFixed(2)}%`;
                    else
                        return;
                    } else {
                        if (val > 0) {
                         return val.toFixed(0);
                        }
                        return ;
                        //return val.toFixed(0);
                    }
                }
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
                xaxis: {
                    categories,
                    labels: {
                        rotate: -45,
                        style: {
                            fontSize: '12px',
                            fontWeight: 500
                        }
                    }
                },
                markers: {
                    size: [0, 0, 5],
                    strokeWidth: 2,
                    strokeColors: ['#9467bd', '#ff7f0e', '#d62728'],
                    colors: ['#9467bd', '#ff7f0e', '#d62728'],
                    hover: { size: 7 }
                },
                yaxis: [
                    {
                        seriesName: ['Pneumonia Cases', 'Deaths'],
                        title: { text: '' },
                        labels: {
                            formatter: (val: number) => val.toFixed(0),
                            style: { fontSize: '12px' },
                            offsetX: -5
                        },
                        axisTicks: { show: true },
                        axisBorder: { show: true }
                    },
                    {
                        seriesName: ['Mortality Rate'],
                        opposite: true,
                        title: { text: '' },
                        labels: {
                            formatter: (val: number) => `${val.toFixed(0)}%`,
                            style: { fontSize: '12px' }
                        },
                        min: 0,
                        max: 100,
                        axisTicks: { show: true },
                        axisBorder: { show: true }
                    }
                ],
                tooltip: {
                    shared: true,
                    intersect: false,
                    x: { show: true },
                    y: [
                        {
                            formatter: (val: number) => `${val.toFixed(0)}`
                        },
                        {
                            formatter: (val: number) => `${val.toFixed(0)}`
                        },
                        {
                            formatter: (val: number) => `${val.toFixed(2)}%`
                        }
                    ]
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    grouped: false
                },
                title: {
                    text: 'MORTALITY RATE - COMMUNITY ACQUIRED PNEUMONIA',
                    align: 'center',
                    style: {
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1e293b'
                    }
                }
            };
        } else {
            this.communityPneumoniaChartData = null;
        }
    }

    getMortalityDataForGrid(mortalityTypeId: string) {
        return this.mortalityData[mortalityTypeId]?.data || [];
    }

    prepareWaitingTimeMonthlyChartData() {
        if (this.waitingTimeMonthlyData?.length > 0) {
            const categories = this.waitingTimeMonthlyData.map((x: any) => x.MonthName);
            const series1 = this.waitingTimeMonthlyData.map((x: any) => x.WaitingTimeLessthan30MinPer || 0);
            const series2 = this.waitingTimeMonthlyData.map((x: any) => x.WaitingTime30to60MinPer || 0);
            const series3 = this.waitingTimeMonthlyData.map((x: any) => x.WaitingTime60to120MinPer || 0);
            this.waitingTimeMonthlyChartData = {};
            this.waitingTimeMonthlyChartData.series = [
                {
                    name: 'Less than 30 Min',
                    data: series1
                },
                {
                    name: '30 to 60 Min',
                    data: series2
                },
                {
                    name: '60 to 120 Min',
                    data: series3
                }
            ];

            this.waitingTimeMonthlyChartData.chart = {
                height: 400,
                type: 'line',
                stacked: false,
                toolbar: { show: true },
                zoom: { enabled: false },
            };

            this.waitingTimeMonthlyChartData.dataLabels = {
                enabled: true,
                hideOverlappingLabels :true,
                //enabledOnSeries: [0, 2],
                style: {
                    fontSize: '8px',
                    //fontWeight: 'bold',
                    //colors: ['#FF0800', '#020344', '#00A86B']
                },
                offsetY: -6,
                offsetX: 5,
                background: {
                    enabled: true,                    
                    borderRadius: 5,                    
                },
                position:'top',
                dropShadow: {
                    enabled: false
                },
                //formatter: (val: number) => `${val.toFixed(1)}%`,
                formatter: function (val:any, opts:any) {
                // Example: Add a line break for long labels or based on conditions
                    if (val > 2) {
                       return `${val.toFixed(1)}%`;
                    }
                    return ;
                }
            };

            this.waitingTimeMonthlyChartData.stroke = {
                width: 2,
                curve: 'smooth',
                colors: ['#FF0800', '#020344', '#00A86B'],
            };

            this.waitingTimeMonthlyChartData.colors = ['#FF0800', '#020344', '#00A86B'];

            this.waitingTimeMonthlyChartData.xaxis = {
                categories,
                labels: {
                    rotate: -45,
                    style: {
                        fontSize: '12px',
                        fontWeight: 500
                    }
                }
            };

             this.waitingTimeMonthlyChartData.plotOptions = {
                bar: {
                    columnWidth: '40%',
                    borderRadius: 1,
                    dataLabels: {
                    position: 'top'
                    }
                }
            };

         

            this.waitingTimeMonthlyChartData.markers = {
                size: 4,
                strokeWidth: 2,
                // strokeColors: ['#FF0800', '#020344', '#00A86B'],
                // colors: ['#FF0800', '#020344', '#00A86B'],
                hover: {
                    size: 7
                }
            };

            this.waitingTimeMonthlyChartData.yaxis = {
                labels: {
                    formatter: (val: number) => `${val.toFixed(0)}%`,
                    offsetX: -12
                },
                min: 0,
                max: 100,
        //          min: 0, // Set the minimum value for the Y-axis
        // max: 100, // Set the maximum value for the Y-axis
        // tickAmount: 30,// Number of tick intervals to show
                axisTicks: { show: false },
                axisBorder: { show: false }
            };

            this.waitingTimeMonthlyChartData.tooltip = {
                shared: true,
                intersect: false,
                x: {
                    show: true,
                    format: 'dd MMM',
                    formatter: undefined,
                },
                y: [
                    {
                        formatter: (val: number) => `${val.toFixed(1)}%`
                    },
                    {
                        formatter: (val: number) => `${val.toFixed(1)}%`
                    }
                ]
            };

            this.waitingTimeMonthlyChartData.legend = {
                position: 'bottom',
                horizontalAlign: 'center',
                floating: false,
                offsetY: 10,
            };

            this.waitingTimeMonthlyChartData.title = {
                text: 'Emergency Waiting Time',
                align: 'center',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1e293b'
                }
            };
        } else {
            this.waitingTimeMonthlyChartData = null;
        }
    }

    prepareInitialAssessmentChartData() {
        if (this.initialAssessmentsData?.length > 0) {
            const categories = this.initialAssessmentsData.map((x: any) => x.MonthName);
            const series1 = this.initialAssessmentsData.map((x: any) => x.TotalIPAdmission || 0);
            const series2 = this.initialAssessmentsData.map((x: any) => x.TotalInitialAssessment || 0);
            const series3 = this.initialAssessmentsData.map((x: any) => x.ComplianceRate || 0);

            this.initialAssessmentsChartData = {};

            this.initialAssessmentsChartData.series = [
                {
                    name: 'Admission',
                    type: 'column',
                    data: series1
                },
                {
                    name: 'Initial Assessment',
                    type: 'column',
                    data: series2
                },
                {
                    name: 'Compliance Rate',
                    type: 'line',
                    data: series3
                }
            ];

            this.initialAssessmentsChartData.chart = {
                height: 300,
                width: '100%',
                type: 'line',
                stacked: false,
                toolbar: { show: true },
                zoom: { enabled: false }
            };

            this.initialAssessmentsChartData.stroke = {
                width: [0, 0, 3],
                curve: 'smooth',
                colors: ['#503C3C', '#9290C3', '#FF0800']
            };

            this.initialAssessmentsChartData.colors = ['#503C3C', '#9290C3', '#FF0800'];

            this.initialAssessmentsChartData.dataLabels = {
                enabled: true,
                hideOverlappingLabels :true,
                enabledOnSeries: [0,1, 2],
                style: {
                    fontSize: '8px',
                    //fontWeight: 'bold'
                },
                
                offsetY: -8,
                background: { enabled: true ,borderRadius: 5,},
                dropShadow: { enabled: false },
                formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 0 || seriesIndex === 1) {
                        return val.toFixed(0);
                    } else {
                        if(val<=100)
                        return `${val.toFixed(1)}%`;
                    else
                        return;
                    }
                }
            };

            this.initialAssessmentsChartData.plotOptions = {
                bar: {
                    columnWidth: '40%',
                    borderRadius: 2,
                    dataLabels: {
                        position: 'top'
                    }
                }
            };

            this.initialAssessmentsChartData.xaxis = {
                categories,
                labels: {
                    rotate: -45,
                    style: {
                        fontSize: '12px',
                        fontWeight: 500
                    }
                }
            };

            this.initialAssessmentsChartData.markers = {
                size: [0, 0, 5],
                strokeWidth: 2,
                strokeColors: ['#503C3C', '#9290C3', '#FF0800'],
                colors: ['#503C3C', '#9290C3', '#FF0800'],
                hover: { size: 7 }
            };

            this.initialAssessmentsChartData.yaxis = [
                {
                    seriesName: ['Admission', 'Initial Assessment'],
                    title: {
                        text: ''
                    },
                    labels: {
                        formatter: (val: number) => val.toFixed(0),
                        style: { fontSize: '12px' },
                        offsetX: -5
                    },
                    
                    axisTicks: { show: true },
                    axisBorder: { show: true }
                },
                {
                    seriesName: ['Compliance Rate'],
                    opposite: true,
                    title: { text: '' },
                     min:0,
                    max:100,
                    labels: {
                        formatter: (val: number) => `${val.toFixed(1)}%`,
                        style: { fontSize: '12px' }
                    },
                    
                    axisTicks: { show: true },
                    axisBorder: { show: true }
                }

            ];

            this.initialAssessmentsChartData.tooltip = {
                shared: true,
                intersect: false,
                x: { show: true },
                y: [
                    {
                        formatter: (val: number) => `${val.toFixed(0)}`
                    },
                    {
                        formatter: (val: number) => `${val.toFixed(0)}`
                    },
                    {
                        formatter: (val: number) => `${val.toFixed(1)}%`
                    }
                ]
            };

            this.initialAssessmentsChartData.legend = {
                position: 'bottom',
                horizontalAlign: 'center',
                grouped: false
            };

            this.initialAssessmentsChartData.title = {
                text: 'COMPREHENSIVE INITIAL ASSESSMENT COMPLIANCE RATE',
                align: 'center',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1e293b'
                }
            };
        } else {
            this.initialAssessmentsChartData = null;
        }
    }

    prepareNewbornVitalsChartData() {
        if (this.newbornVitalsData?.length > 0) {
            const categories = this.newbornVitalsData.map((x: any) => x.MonthName);
            const series1 = this.newbornVitalsData.map((x: any) => +x.DischargePatients || 0);
            const series2 = this.newbornVitalsData.map((x: any) => +x.ReAdmissionWithIn90DaysOfVTE || 0);
            //const series3 = this.newbornVitalsData.map((x: any) => parseFloat(x.VTEIncidenceRate) * 100 || 0);
            const series3 = this.newbornVitalsData.map((x: any) => +x.VTEIncidenceRate || 0);
            this.newbornVitalsChartData = {};

            this.newbornVitalsChartData.series = [
                {
                    name: 'Discharge Patients',
                    type: 'column',
                    data: series1
                },
                {
                    name: 'Re-Admissions within 90 Days',
                    type: 'column',
                    data: series2
                },
                {
                    name: 'VTE Incidence Rate (%)',
                    type: 'line',
                    data: series3
                }
            ];

            this.newbornVitalsChartData.chart = {
                height: 300,
                width: '100%',
                type: 'line',
                stacked: false,
                toolbar: { show: true },
                zoom: { enabled: false }
            };

            this.newbornVitalsChartData.stroke = {
                width: [0, 0, 3],
                curve: 'smooth',
                colors: ['#092635', '#9EC8B9', '#DC2525']
            };

            this.newbornVitalsChartData.colors = ['#092635', '#9EC8B9', '#DC2525'];

            this.newbornVitalsChartData.dataLabels = {
                enabled: true,
                 enabledOnSeries: [0, 1],
                style: {
                    fontSize: '8px',
                    //fontWeight: 'bold'
                },
                offsetY: -8,
              background: { enabled: true ,borderRadius: 5,},
                dropShadow: { enabled: false },
                formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 2) {
                          if (val > 0) 
                            return `${val.toFixed(2)}%`;
                        else
                                return;
                            
                    } else {
                        if (val > 0) {
                         return val.toFixed(0);
                        }
                        return ;
                        //return val.toFixed(0);
                    }
                }
            };

            this.newbornVitalsChartData.plotOptions = {
                bar: {
                    columnWidth: '40%',
                    borderRadius: 2,
                    dataLabels: {
                        position: 'top'
                    }
                }
            };

            this.newbornVitalsChartData.xaxis = {
                categories,
                labels: {
                    rotate: -45,
                    style: {
                        fontSize: '12px',
                        fontWeight: 500
                    }
                }
            };

            this.newbornVitalsChartData.markers = {
                size: [0, 0, 5],
                strokeWidth: 2,
                strokeColors: ['#092635', '#9EC8B9', '#DC2525'],
                colors: ['#092635', '#9EC8B9', '#DC2525'],
                hover: { size: 7 }
            };

            this.newbornVitalsChartData.yaxis = [
                {
                    // title: {
                    //     text: 'Patients'
                    // },
                    seriesName: ['Discharge Patients', 'Re-Admissions within 90 Days'],
                    labels: {
                        formatter: (val: number) => val.toFixed(0),
                        style: { fontSize: '12px' },
                        offsetX: -5
                    },
                    axisTicks: { show: true },
                    axisBorder: { show: true }
                },
                {
                    seriesName: ['VTE Incidence Rate (%)'],
                    opposite: true,
                   // title: { text: 'VTE Incidence Rate (%)' },
                    labels: {
                        formatter: (val: number) => `${val.toFixed(0)}%`,
                        style: { fontSize: '12px' }
                    },
                    min: 0,
                    max: 100,
                    axisTicks: { show: true },
                    axisBorder: { show: true }
                }
            ];

            this.newbornVitalsChartData.tooltip = {
                shared: true,
                intersect: false,
                x: { show: true },
                y: [
                    {
                        formatter: (val: number) => `${val.toFixed(0)}`
                    },
                    {
                        formatter: (val: number) => `${val.toFixed(0)}`
                    },
                    {
                        formatter: (val: number) => `${val.toFixed(2)}%`
                    }
                ]
            };

            this.newbornVitalsChartData.legend = {
                position: 'bottom',
                horizontalAlign: 'center',
                grouped: false
            };

            this.newbornVitalsChartData.title = {
                text: 'INCIDENCE OF HOSPITAL ASSOCIATED VTE PER 1000 DISCHARGES  ',
                align: 'center',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1e293b'
                }
            };
        } else {
            this.newbornVitalsChartData = null;
        }
    }

    prepareNewbornScreeningChartData() {
        if (this.newbornScreeningData?.length > 0) {
            const categories = this.newbornScreeningData.map((x: any) => x.MonthName);
            const series1 = this.newbornScreeningData.map((x: any) => +x.Newboarn || 0);
            const series2 = this.newbornScreeningData.map((x: any) => +x.NewboarnScreening || 0);
            //const series3 = this.newbornScreeningData.map((x: any) => parseFloat(x.ScreeeningRate) * 100 || 0);
            const series3 = this.newbornScreeningData.map((x: any) => +x.ScreeeningRate || 0);

            this.newbornScreeningChartData = {};

            this.newbornScreeningChartData.series = [
                {
                    name: 'Total Newborns',
                    type: 'column',
                    data: series1
                },
                {
                    name: 'Screened',
                    type: 'column',
                    data: series2
                },
                {
                    name: 'Screening Rate (%)',
                    type: 'line',
                    data: series3
                }
            ];

            this.newbornScreeningChartData.chart = {
                height: 300,
                width: '100%',
                type: 'line',
                stacked: false,
                toolbar: { show: true },
                zoom: { enabled: false }
            };

            this.newbornScreeningChartData.stroke = {
                width: [0, 0, 3],
                curve: 'smooth',
                colors: ['#3b82f6', '#10b981', '#ef4444']
            };

            this.newbornScreeningChartData.colors = ['#3b82f6', '#10b981', '#ef4444'];

            this.newbornScreeningChartData.dataLabels = {
                enabled: true,
                enabledOnSeries: [0,1],
                style: {
                    fontSize: '8px',
                    //fontWeight: 'bold'
                },
                offsetY: -8,
                background: { enabled: true ,borderRadius: 5,},
                dropShadow: { enabled: false },
                formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 0 || seriesIndex === 1) {
                         if (val > 0) {
                         return val.toFixed(0);
                        }
                        return ;
                        //return val.toFixed(0);
                    } else {
                          if (val > 0)
                             return `${val.toFixed(2)}%`;
                            else
                                return ;
                    }                   
                }
            };

            this.newbornScreeningChartData.plotOptions = {
                bar: {
                    columnWidth: '40%',
                    borderRadius: 2,
                    dataLabels: {
                        position: 'top'
                    }
                }
            };

            this.newbornScreeningChartData.xaxis = {
                categories,
                labels: {
                    rotate: -45,
                    style: {
                        fontSize: '12px',
                        fontWeight: 500
                    }
                }
            };

            this.newbornScreeningChartData.markers = {
                size: [0, 0, 5],
                strokeWidth: 2,
                strokeColors: ['#3b82f6', '#10b981', '#ef4444'],
                colors: ['#3b82f6', '#10b981', '#ef4444'],
                hover: { size: 7 }
            };

            this.newbornScreeningChartData.yaxis = [
                {
                    seriesName: ['Total Newborns', 'Screened'],
                    title: {
                        text: 'Count'
                    },
                    labels: {
                        formatter: (val: number) => val.toFixed(0),
                        style: { fontSize: '12px' },
                        offsetX: -5
                    },
                    axisTicks: { show: true },
                    axisBorder: { show: true }
                },
                {
                    seriesName: ['Screening Rate (%)'],
                    opposite: true,
                    //title: { text: 'Screening Rate (%)' },
                    labels: {
                        formatter: (val: number) => `${val.toFixed(0)}%`,
                        style: { fontSize: '12px' }
                    },
                    min: 0,
                    max: 100,
                    axisTicks: { show: true },
                    axisBorder: { show: true }
                }
            ];

            this.newbornScreeningChartData.tooltip = {
                shared: true,
                intersect: false,
                x: { show: true },
                y: [
                    {
                        formatter: (val: number) => `${val.toFixed(0)}`
                    },
                    {
                        formatter: (val: number) => `${val.toFixed(0)}`
                    },
                    {
                        formatter: (val: number) => `${val.toFixed(2)}%`
                    }
                ]
            };

            this.newbornScreeningChartData.legend = {
                position: 'bottom',
                horizontalAlign: 'center',
                grouped: false
            };

            this.newbornScreeningChartData.title = {
                text: 'SCREENING RATE FOR NEWBORN SCREENING',
                align: 'center',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1e293b'
                }
            };
        } else {
            this.newbornScreeningChartData = null;
        }
    }

    prepareSurgicalReadmissionChartData() {
        if (this.surgicalReadmissionData?.length > 0) {
            const categories = this.surgicalReadmissionData.map((x: any) => x.MonthName);
            const totalSurgeries = this.surgicalReadmissionData.map((x: any) => +x.TotalSurgeries || 0);
            const totalReadmissions = this.surgicalReadmissionData.map((x: any) => +x.TotalReAdmissionWithIn30Days || 0);
            //const readmissionRate = this.surgicalReadmissionData.map((x: any) => parseFloat(x.ReadmissionRate) * 100 || 0);
            const readmissionRate = this.surgicalReadmissionData.map((x: any) => +x.ReadmissionRate || 0);
            this.surgicalReadmissionChartData = {
                series: [
                    {
                        name: 'Total Surgeries',
                        type: 'column',
                        data: totalSurgeries
                    },
                    {
                        name: 'Readmissions (within 30 days)',
                        type: 'column',
                        data: totalReadmissions
                    },
                    {
                        name: 'Readmission Rate (%)',
                        type: 'line',
                        data: readmissionRate
                    }
                ],
                chart: {
                    height: 300,
                    width: '100%',
                    type: 'line',
                    stacked: false,
                    toolbar: { show: true },
                    zoom: { enabled: false }
                },
                stroke: {
                    width: [0, 0, 3],
                    curve: 'smooth',
                    colors: ['#7900FF', '#79edc3ff', '#dc2626']
                },
                colors: ['#7900FF', '#79edc3ff', '#dc2626'],
                dataLabels: {
                    enabled: true,
                    enabledOnSeries: [0, 1],
                    style: { fontSize: '8px', },
                    offsetY: -8,
                     background: { enabled: true ,borderRadius: 5,},
                    dropShadow: { enabled: false },
                    formatter: (val: number, opts: any) => {
                        const seriesIndex = opts.seriesIndex;
                        if (seriesIndex === 2) {
                             if (val > 0)
                            return `${val.toFixed(2)}%`;
                        else 
                            return;
                        } else {
                            if (val > 0)
                            return val.toFixed(0);
                        else 
                            return;
                        }
                    }
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
                xaxis: {
                    categories,
                    labels: {
                        rotate: -45,
                        style: {
                            fontSize: '12px',
                            fontWeight: 500
                        }
                    }
                },
                markers: {
                    size: [0, 0, 5],
                    strokeWidth: 2,
                    strokeColors: ['#7900FF', '#79edc3ff', '#dc2626'],
                    colors: ['#7900FF', '#79edc3ff', '#dc2626'],
                    hover: { size: 7 }
                },
                yaxis: [
                    {
                        seriesName: ['Total Surgeries', 'Readmissions (within 30 days)'],
                        title: { text: 'Count' },
                        labels: {
                            formatter: (val: number) => val.toFixed(0),
                            style: { fontSize: '12px' },
                            offsetX: -5
                        },
                        axisTicks: { show: true },
                        axisBorder: { show: true }
                    },
                    {
                        seriesName: ['Readmission Rate (%)'],
                        opposite: true,
                       // title: { text: 'Readmission Rate (%)' },
                        labels: {
                            formatter: (val: number) => `${val.toFixed(1)}%`,
                            style: { fontSize: '12px' }
                        },
                        min: 0,
                        max: 100,
                        axisTicks: { show: true },
                        axisBorder: { show: true }
                    }
                ],
                tooltip: {
                    shared: true,
                    intersect: false,
                    x: { show: true },
                    y: [
                        { formatter: (val: number) => `${val.toFixed(0)}` },
                        { formatter: (val: number) => `${val.toFixed(0)}` },
                        { formatter: (val: number) => `${val.toFixed(2)}%` }
                    ]
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    grouped: false
                },
                title: {
                    text: 'READMISSION RATE FOLLOWING ELECTIVE SURGERY',
                    align: 'center',
                    style: {
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1e293b'
                    }
                }
            };
        } else {
            this.surgicalReadmissionChartData = null;
        }
    }

    prepareHAPUChartData() {
        if (this.hapuData?.length > 0) {
            const categories = this.hapuData.map((x: any) => x.MonthName);
            const totalAdmissions = this.hapuData.map((x: any) => +x.TotalAdmissions || 0);
            const hapuCases = this.hapuData.map((x: any) => +x.HAPUgEStageII || 0);
            //const hapuRate = this.hapuData.map((x: any) => parseFloat(x.HAPURate) * 100 || 0);
           const hapuRate = this.hapuData.map((x: any) => +x.HAPURate || 0);
            this.hapuChartData = {
                series: [
                    {
                        name: 'Total Admissions',
                        type: 'column',
                        data: totalAdmissions
                    },
                    {
                        name: 'HAPU Cases (≥ Stage II)',
                        type: 'column',
                        data: hapuCases
                    },
                    {
                        name: 'HAPU Rate (%)',
                        type: 'line',
                        data: hapuRate
                    }
                ],
                chart: {
                    height: 300,
                    width: '100%',
                    type: 'line',
                    stacked: false,
                    toolbar: { show: true },
                    zoom: { enabled: false }
                },
                stroke: {
                    width: [0, 0, 3],
                    curve: 'smooth',
                    colors: ['#2F2519', '#FF95C5', '#dc2626']
                },
                colors: ['#2F2519', '#FF95C5', '#dc2626'],
                dataLabels: {
                    enabled: true,
                    enabledOnSeries: [0, 1],
                    style: { fontSize: '8px',  },
                    offsetY: -8,
                     background: { enabled: true ,borderRadius: 5,},
                    dropShadow: { enabled: false },
                    // formatter: (val: number, opts: any) => {
                    //     const seriesIndex = opts.seriesIndex;
                    //     return seriesIndex === 2 ? `${val.toFixed(2)}%` : val.toFixed(0);
                    // }
                    formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 2) {
                        return `${val.toFixed(2)}%`;
                    } else {
                        if (val > 0) {
                         return val.toFixed(0);
                        }
                        return ;
                        //return val.toFixed(0);
                    }
                }
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
                xaxis: {
                    categories,
                    labels: {
                        rotate: -45,
                        style: {
                            fontSize: '12px',
                            fontWeight: 500
                        }
                    }
                },
                markers: {
                    size: [0, 0, 5],
                    strokeWidth: 2,
                    strokeColors: ['#0284c7', '#FF95C5', '#dc2626'],
                    colors: ['#0284c7', '#FF95C5', '#dc2626'],
                    hover: { size: 7 }
                },
                yaxis: [
                    {
                        seriesName: ['Total Admissions', 'HAPU Cases (≥ Stage II)'],
                        title: { text: 'Count' },
                        labels: {
                            formatter: (val: number) => val.toFixed(0),
                            style: { fontSize: '12px' },
                            offsetX: -5
                        },
                        axisTicks: { show: true },
                        axisBorder: { show: true }
                    },
                    {
                        seriesName: ['HAPU Rate (%)'],
                        opposite: true,
                        //title: { text: 'HAPU Rate (%)' },
                        labels: {
                            formatter: (val: number) => `${val.toFixed(0)}%`,
                            style: { fontSize: '12px' }
                        },
                        min: 0,
                        max: 100,
                        axisTicks: { show: true },
                        axisBorder: { show: true }
                    }
                ],
                tooltip: {
                    shared: true,
                    intersect: false,
                    x: { show: true },
                    y: [
                        { formatter: (val: number) => `${val.toFixed(0)}` },
                        { formatter: (val: number) => `${val.toFixed(0)}` },
                        { formatter: (val: number) => `${val.toFixed(2)}%` }
                    ]
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    grouped: false
                },
                title: {
                    text: 'HOSPITAL ACQUIRED PRESSURE ULCERS RATE (HAPU)',
                    align: 'center',
                    style: {
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1e293b'
                    }
                }
            };
        } else {
            this.hapuChartData = null;
        }
    }

    prepareMaternalDeathChartData() {
        const data = this.mortalityData['6']?.data || [];

        if (data.length > 0) {
            const categories = data.map((x: any) => x.MonthName);
            const totalDeliveries = data.map((x: any) => +x.TotalMortality || 0);
            const deaths = data.map((x: any) => +x.TotalMortalityDeaths || 0);
            const mortalityRate = data.map((x: any) => parseFloat(x.MortalityDeathsRate) || 0);

            this.maternalDeathChartData = {
                series: [
                    {
                        name: 'Total Deliveries',
                        type: 'column',
                        data: totalDeliveries
                    },
                    {
                        name: 'Maternal Deaths',
                        type: 'column',
                        data: deaths
                    },
                    {
                        name: 'Mortality Rate (%)',
                        type: 'line',
                        data: mortalityRate
                    }
                ],
                chart: {
                    height: 300,
                    width: '100%',
                    type: 'line',
                    stacked: false,
                    toolbar: { show: true },
                    zoom: { enabled: false }
                },
                stroke: {
                    width: [0, 0, 3],
                    curve: 'smooth',
                    colors: ['#5D8736', '#A9C46C', '#d62728']
                },
                colors: ['#5D8736', '#A9C46C', '#d62728'],
                dataLabels: {
                    enabled: true,
                    enabledOnSeries: [0, 2],
                    style: {
                        fontSize: '8px',
                        //fontWeight: 'bold'
                    },
                    offsetY: -8,
                     background: { enabled: true ,borderRadius: 5,},
                    dropShadow: { enabled: false },
                    // formatter: (val: number, opts: any) => {
                    //     const seriesIndex = opts.seriesIndex;
                    //     return seriesIndex === 2 ? `${val.toFixed(2)}%` : val.toFixed(0);
                    // }
                    formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 2) {
                         if (val > 0)
                        return `${val.toFixed(2)}%`;
                    else 
                        return;
                    } else {
                        if (val > 0) {
                         return val.toFixed(0);
                        }
                        return ;
                        //return val.toFixed(0);
                    }
                }
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
                xaxis: {
                    categories,
                    labels: {
                        rotate: -45,
                        style: {
                            fontSize: '12px',
                            fontWeight: 500
                        }
                    }
                },
                markers: {
                    size: [0, 0, 5],
                    strokeWidth: 2,
                    strokeColors: ['#5D8736', '#A9C46C', '#d62728'],
                    colors: ['#5D8736', '#A9C46C', '#d62728'],
                    hover: { size: 7 }
                },
                yaxis: [
                    {
                        seriesName: ['Total Deliveries', 'Maternal Deaths'],
                        title: { text: '' },
                        labels: {
                            formatter: (val: number) => val.toFixed(0),
                            style: { fontSize: '12px' },
                            offsetX: -5
                        },
                        axisTicks: { show: true },
                        axisBorder: { show: true }
                    },
                    {
                        seriesName: ['Mortality Rate (%)'],
                        opposite: true,
                        title: { text: '' },
                        labels: {
                            formatter: (val: number) => `${val.toFixed(0)}%`,
                            style: { fontSize: '12px' }
                        },
                        min: 0,
                        max: 100,
                        axisTicks: { show: true },
                        axisBorder: { show: true }
                    }
                ],
                tooltip: {
                    shared: true,
                    intersect: false,
                    x: { show: true },
                    y: [
                        {
                            formatter: (val: number) => `${val.toFixed(0)}`
                        },
                        {
                            formatter: (val: number) => `${val.toFixed(0)}`
                        },
                        {
                            formatter: (val: number) => `${val.toFixed(2)}%`
                        }
                    ]
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    grouped: false
                },
                title: {
                    text: 'MORTALITY RATE - MATERNAL DEATH',
                    align: 'center',
                    style: {
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1e293b'
                    }
                }
            };
        } else {
            this.maternalDeathChartData = null;
        }
    }

    prepareCLABSIChartData() {
        if (this.clabsiData?.length > 0) {
            const categories = this.clabsiData.map((x: any) => x.MonthName);
            const totalCentralLineDays = this.clabsiData.map((x: any) => +x.TotalCentrallinedays || 0);
            const clabsiInCriticalCare = this.clabsiData.map((x: any) => +x.CLABSIInCriticalCare || 0);
            //const clabsiRate = this.clabsiData.map((x: any) => parseFloat(x.CLABSIRate) * 100 || 0);
            const clabsiRate = this.clabsiData.map((x: any) => +x.CLABSIRate || 0);
            this.clabsiChartData = {
                series: [
                    {
                        name: 'Total Central Line Days',
                        type: 'column',
                        data: totalCentralLineDays
                    },
                    {
                        name: 'CLABSI in Critical Care',
                        type: 'column',
                        data: clabsiInCriticalCare
                    },
                    {
                        name: 'CLABSI Rate (%)',
                        type: 'line',
                        data: clabsiRate
                    }
                ],
                chart: {
                    height: 300,
                    type: 'line',
                    stacked: false,
                    toolbar: { show: true },
                    zoom: { enabled: false }
                },
                colors: ['#D62AD0', '#3EDBF0', '#d62728'],
                stroke: {
                    width: [0, 0, 3],
                    curve: 'smooth'
                },
                dataLabels: {
                    enabled: true,
                    enabledOnSeries: [0, 1],
                    // formatter: (val: number, opts: any) => opts.seriesIndex === 2 ? `${val.toFixed(2)}%` : val.toFixed(0),
                    style: {
                        fontSize: '8px',
                        //fontWeight: 'bold'
                    },
                    offsetY: -8,
                    background: { enabled: true ,borderRadius: 5,},
                    formatter: (val: number, opts: any) => {
                    const seriesIndex = opts.seriesIndex;
                    if (seriesIndex === 2) {
                        if (val > 0) 
                        return `${val.toFixed(2)}%`;
                    else 
                        return;
                    } else {
                        if (val > 0) {
                         return val.toFixed(0);
                        }
                        return ;
                        //return val.toFixed(0);
                    }
                }
                },
                plotOptions: {
                    bar: {
                        columnWidth: '40%',
                        borderRadius: 2,
                        dataLabels: { position: 'top' }
                    }
                },
                xaxis: {
                    categories,
                    labels: {
                        rotate: -45,
                        style: { fontSize: '12px', fontWeight: 500 }
                    }
                },
                markers: {
                    size: [0, 0, 5],
                    strokeWidth: 2
                },
                yaxis: [
                    {
                        seriesName: ['Total Central Line Days', 'CLABSI in Critical Care'],
                        //title: { text: 'Days / Cases' },
                        labels: {
                            formatter: (val: number) => val.toFixed(0),
                            style: { fontSize: '12px' }
                        }
                    },
                    {
                        seriesName: ['CLABSI Rate (%)'],
                        opposite: true,
                        //title: { text: 'CLABSI Rate (%)' },
                        labels: {
                            formatter: (val: number) => `${val.toFixed(0)}%`,
                            style: { fontSize: '12px' }
                        },
                        min: 0,
                        max: 100
                    }
                ],
                tooltip: {
                    shared: true,
                    intersect: false,
                    y: [
                        { formatter: (val: number) => val.toFixed(0) },
                        { formatter: (val: number) => val.toFixed(0) },
                        { formatter: (val: number) => `${val.toFixed(2)}%` }
                    ]
                },
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center'
                },
                title: {
                    text: 'CLABSI RATE AND CENTRAL LINE DAYS',
                    align: 'center',
                    style: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }
                }
            };
        } else {
            this.clabsiChartData = null;
        }
    }

    exportGridData(format: string, data: any[], filename: string): void {
        const arrayData = Array.isArray(data) ? data : [data];

        if (!arrayData || arrayData.length === 0) {
            console.warn(`No data available for export: ${filename}`);
            return;
        }

        const exportData = arrayData.map(item => {
            const cleaned: any = {};
            for (const key in item) {
                cleaned[key] = item[key] ?? '';
            }
            return cleaned;
        });

        const finalFilename = `${filename}_${new Date().toISOString()}`;
        this.handleExport(exportData, finalFilename, format);
    }

    private handleExport(data: any[], filename: string, format: string): void {
        switch (format.toLowerCase()) {
            case 'csv':
                this.exportService.exportToCSV(data, filename);
                break;
            default:
                console.error('Unsupported export format');
        }
    }

}

const ExternalDashboard = {
    FetchExternalMOHStatisticsERWaitingHISBI: 'FetchExternalMOHStatisticsERWaitingHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchExternalMOHInitialAssessmentHISBI: 'FetchExternalMOHInitialAssessmentHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchExternalMOHVTENEWBORNHISBI: 'FetchExternalMOHVTENEWBORNHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchExternalMOHSurgeryHAPUCLABSIHISBI: 'FetchExternalMOHSurgeryHAPUCLABSIHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchExternalMOHAllMortalityHISBI: 'FetchExternalMOHAllMortalityHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchExternalMOHPreMaritalLOSHISBI: 'FetchExternalMOHPreMaritalLOSHISBI?FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}' // <-- New entry
};

