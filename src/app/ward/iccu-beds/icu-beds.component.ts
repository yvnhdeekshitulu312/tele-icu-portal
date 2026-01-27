import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { UtilityService } from "src/app/shared/utility.service";
import { ConfigService } from 'src/app/services/config.service';
import { Subscription, timer } from "rxjs";
import { Router } from "@angular/router";
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
    selector: 'app-icu-beds',
    templateUrl: './icu-beds.component.html',
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
export class ICUBedsComponent implements OnInit {
    doctorDetails: any;
    wardID: any = '0';
    langData: any;
    FetchBedsFromWardDataList: any = [];
    FilteredBedsFromWardDataList: any = [];
    FetchMETCALLWardDataList: any = [];
    totalCount: any = 0;
    criticalCount: any = 0;
    normalCount: any = 0;
    maleCount: any = 0;
    femaleCount: any = 0;
    FetchBedStatusList: any;
    hospitalType: any = '0';

    refreshTime: any = new Date();
    private refreshSub!: Subscription;

    searchText: any = '';
    activeKey: string = 'all';
    segments: any[] = [];
    interval: any;
    currentdate: any;
    currentdateN: any;
    currentTimeN: Date = new Date();

    showResultsinPopUp: boolean = false;
    showPatientSummaryinPopUp: boolean = false;
    resultsType: string = '';
    facilities: any = [];

    constructor(private us: UtilityService, private configService: ConfigService, private router: Router) {
        this.langData = this.configService.getLangData();
    }

    ngOnInit() {
        this.currentdate = moment(new Date()).format('DD-MMM-YYYY, H:mm');
        this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
        this.startClock();
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        if (sessionStorage.getItem('icubedfacility')) {
            this.wardID = sessionStorage.getItem('icubedfacility');
        }
        this.fetchFacilities();
        this.fetchBedStatus();
        this.fetchICUBeds();
        this.setActive('all');
    }

    startClock(): void {
        this.interval = setInterval(() => {
            this.currentTimeN = new Date();
        }, 1000);
    }

    stopClock(): void {
        clearInterval(this.interval);
    }

    setActive(key: string): void {
        this.activeKey = key;
        this.filterBeds();
    }

    ngOnDestroy() {
        if (this.refreshSub) {
            this.refreshSub.unsubscribe();
        }
    }

    filteByHospital(type: any) {
        this.hospitalType = type;
        this.fetchICUBeds();
    }

    startAutoRefresh() {
        if (this.refreshSub) {
            this.refreshSub.unsubscribe();
        }

        this.refreshSub = timer(5 * 60 * 1000)
            .subscribe(() => {
                this.fetchICUBeds();
            });
    }

    fetchBedStatus() {
        const url = this.us.getApiUrl(ICUBeds.FetchBedStatus, {
            HospitalID: this.hospitalType
        });

        this.us.get(url).subscribe((response: any) => {
            this.FetchBedStatusList = response.FetchBedStatusDataList;
        });
    }


    fetchBedStatusByValue(filteredvalue: any = "") {
        const url = this.us.getApiUrl(ICUBeds.FetchBedsFromWardNPTeleICCU, {
            WardID: this.wardID,
            ConsultantID: 0,
            Status: filteredvalue,
            UserId: this.doctorDetails[0].UserId,
            HospitalID: this.hospitalType,
            AdmissionID: 0
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.refreshTime = new Date();
                this.startAutoRefresh();
                const FetchBedsFromWardLabRadDataList = response.FetchBedsFromWardLabRadDataList;
                this.FetchBedsFromWardDataList = response.FetchBedsFromWardDataList.map((element: any) => {
                    const isFound = FetchBedsFromWardLabRadDataList.filter((a: any) => a.AdmissionID === element.AdmissionID);
                    const labResults: any[] = isFound.filter((a: any) => a.IsResult == '4');
                    const radResults: any[] = isFound.filter((a: any) => a.IsResult == '7');
                    return {
                        ...element,
                        isCritical: isFound.length >= 1,
                        labResults,
                        radResults
                    };
                }).sort((a: any, b: any) => {
                    const getPriority = (item: any) => {
                        if (item.ISPin == 1) return 3;
                        if (item.isCritical) return 2;
                        return 1;
                    };
                    return getPriority(b) - getPriority(a);
                });
                this.totalCount = this.FetchBedsFromWardDataList.length;
                this.criticalCount = this.FetchBedsFromWardDataList.filter((e: any) => e.isCritical).length;
                this.normalCount = this.FetchBedsFromWardDataList.filter((e: any) => !e.isCritical).length;
                this.maleCount = this.FetchBedsFromWardDataList.filter((x: any) => x.GenderID === '1').length;
                this.femaleCount = this.FetchBedsFromWardDataList.filter((x: any) => x.GenderID === '2').length;
                this.segments = [
                    { key: 'all', label: 'All', count: this.totalCount },
                    { key: 'critical', label: 'Critical', count: this.criticalCount },
                    { key: 'normal', label: 'Normal', count: this.normalCount }
                ];
                this.FetchMETCALLWardDataList = response.FetchMETCALLWardDataList;
                this.filterBeds();

            }
        });
    }

    fetchICUBeds() {
        this.FetchBedsFromWardDataList = [];
        const url = this.us.getApiUrl(ICUBeds.FetchBedsFromWardNPTeleICCU, {
            WardID: this.wardID,
            ConsultantID: 0,
            Status: 3,
            UserId: this.doctorDetails[0].UserId,
            HospitalID: this.hospitalType,
            AdmissionID: 0
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.refreshTime = new Date();
                this.startAutoRefresh();
                const FetchBedsFromWardLabRadDataList = response.FetchBedsFromWardLabRadDataList;
                this.FetchBedsFromWardDataList = response.FetchBedsFromWardDataList.map((element: any) => {
                    const isFound = FetchBedsFromWardLabRadDataList.filter((a: any) => a.AdmissionID === element.AdmissionID);
                    const labResults: any[] = isFound.filter((a: any) => a.IsResult == '4');
                    const radResults: any[] = isFound.filter((a: any) => a.IsResult == '7');
                    return {
                        ...element,
                        isCritical: isFound.length >= 1,
                        labResults,
                        radResults
                    };
                }).sort((a: any, b: any) => {
                    const getPriority = (item: any) => {
                        if (item.ISPin == 1) return 3;
                        if (item.isCritical) return 2;
                        return 1;
                    };

                    return getPriority(b) - getPriority(a);
                });
                this.totalCount = this.FetchBedsFromWardDataList.length;
                this.criticalCount = this.FetchBedsFromWardDataList.filter((e: any) => e.isCritical).length;
                this.normalCount = this.FetchBedsFromWardDataList.filter((e: any) => !e.isCritical).length;
                this.maleCount = this.FetchBedsFromWardDataList.filter((x: any) => x.GenderID === '1').length;
                this.femaleCount = this.FetchBedsFromWardDataList.filter((x: any) => x.GenderID === '2').length;
                this.segments = [
                    { key: 'all', label: 'All', count: this.totalCount },
                    { key: 'critical', label: 'Critical', count: this.criticalCount },
                    { key: 'normal', label: 'Normal', count: this.normalCount }
                ];
                this.FetchMETCALLWardDataList = response.FetchMETCALLWardDataList;
                this.filterBeds();
            }
        });
    }

    filterBeds(type?: any) {
        if (type) {
            this.activeKey = type;
        }

        let data = [...this.FetchBedsFromWardDataList];

        if (this.activeKey === 'critical') {
            data = data.filter((e: any) => e.isCritical);
        } else if (this.activeKey === 'normal') {
            data = data.filter((e: any) => !e.isCritical);
        }

        const search = this.searchText?.trim().toLowerCase();

        if (search && search.length > 2) {
            const search = this.searchText.toLowerCase();

            data = data.filter((x: any) =>
                x?.SSN?.toString().includes(search) ||
                x?.PatientName?.toLowerCase().includes(search)
            );
        }
        this.FilteredBedsFromWardDataList = data;
    }

    findPrecautions(item: any, type: string) {
        if (item.PrecautionIDs == undefined) {
            return false;
        }
        if (item.PrecautionIDs !== null && item.PrecautionIDs !== '' && item.PrecautionIDs !== 'undefined') {
            if (item.PrecautionIDs.split(',').length > 0) {
                const prec = item.PrecautionIDs.split(',');
                return prec.includes(type);
            }
            else {
                return item.PrecautionIDs.split('-')[0] === type;

            }
        }
        else
            return false;
    }

    navigateToDetails(item: any) {
        sessionStorage.setItem('icubeddetails', JSON.stringify(item));
        sessionStorage.setItem('icubeds', JSON.stringify(this.FetchBedsFromWardDataList));
        this.router.navigate(['/ward/icu-bed-details'])
    }

    onLogout() {
        this.configService.onLogout();
    }

    openResults(event: any, item: any, type: string) {
        event.stopPropagation();
        sessionStorage.setItem('icubeddetails', JSON.stringify(item));
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

    openPatientFolder(event: any, item: any) {
        event.stopPropagation();
        sessionStorage.setItem('icubeddetails', JSON.stringify(item));
        sessionStorage.setItem("PatientID", item.PatientID);
        sessionStorage.setItem("SummaryfromCasesheet", 'true');
        this.showPatientSummaryinPopUp = true;
        $("#pateintFolderPopup").modal("show");
    }

    closePatientSummaryPopup() {
        $("#pateintFolderPopup").modal("hide");
        setTimeout(() => {
            this.showPatientSummaryinPopUp = false;
        }, 1000);
    }

    fetchFacilities() {
        const url = this.us.getApiUrl(ICUBeds.FetchUserFacilityTeleICCU, {
            UserId: this.doctorDetails[0].UserId,
            HospitalID: 0
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.facilities = response.FetchUserFacilityDataList;
            }
        });
    }

    onFacilityChange() {
        sessionStorage.setItem('icubedfacility', this.wardID);
        this.fetchICUBeds();
    }

    onPinClick(event: any, item: any) {
        event.stopPropagation();
        this.us.post(ICUBeds.UpdatePatientWardBedPIN, {
            "AdmissionID": item.AdmissionID,
            "ISPin": item.ISPin == 0 ? 1 : 0
        }).subscribe((response: any) => {
            if (response.Code === 200) {
                item.ISPin = item.ISPin == 1 ? 0 : 1;
                this.FilteredBedsFromWardDataList = this.FilteredBedsFromWardDataList.sort((a: any, b: any) => {
                    const getPriority = (item: any) => {
                        if (item.ISPin == 1) return 3;
                        if (item.isCritical) return 2;
                        return 1;
                    };
                    return getPriority(b) - getPriority(a);
                });
            }
        });
    }
}

const ICUBeds = {
    'FetchBedsFromWardNPTeleICCU': 'FetchBedsFromWardNPTeleICCU?WardID=${WardID}&AdmissionID=${AdmissionID}&ConsultantID=${ConsultantID}&Status=${Status}&UserId=${UserId}&HospitalID=${HospitalID}',
    'FetchBedStatus': 'FetchBedStatus?HospitalID=${HospitalID}',
    'FetchUserFacilityTeleICCU': 'FetchUserFacilityTeleICCU?UserId=${UserId}&HospitalID=${HospitalID}',
    'UpdatePatientWardBedPIN': 'UpdatePatientWardBedPIN'
}