import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { UtilityService } from "src/app/shared/utility.service";
import { ConfigService } from 'src/app/services/config.service';
import { Subscription, timer } from "rxjs";
import { Router } from "@angular/router";

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
    wardID: any = '2090';
    langData: any;
    FetchBedsFromWardDataList: any = [];
    FilteredBedsFromWardDataList: any = [];
    FetchMETCALLWardDataList: any = [];
    totalCount: any = 0;
    criticalCount: any = 0;
    normalCount: any = 0;
    maleCount: any = 0;
    femaleCount: any = 0;

    type: any = 'all';
    hospitalType: any = '0';

    refreshTime: any = new Date();
    private refreshSub!: Subscription;

    searchText: any = '';

    constructor(private us: UtilityService, private configService: ConfigService, private router: Router) {
        this.langData = this.configService.getLangData();
    }

    ngOnInit() {
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        this.fetchICUBeds();
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

    fetchICUBeds() {
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
                });
                this.totalCount = this.FetchBedsFromWardDataList.length;
                this.criticalCount = this.FetchBedsFromWardDataList.filter((e: any) => e.isCritical).length;
                this.normalCount = this.FetchBedsFromWardDataList.filter((e: any) => !e.isCritical).length;
                this.maleCount = this.FetchBedsFromWardDataList.filter((x: any) => x.GenderID === '1').length;
                this.femaleCount = this.FetchBedsFromWardDataList.filter((x: any) => x.GenderID === '2').length;
                this.FetchMETCALLWardDataList = response.FetchMETCALLWardDataList;
                this.filterBeds();
            }
        });
    }

    filterBeds(type?: any) {
        if (type) {
            this.type = type;
        }

        let data = [...this.FetchBedsFromWardDataList];

        if (this.type === 'critical') {
            data = data.filter((e: any) => e.isCritical);
        } else if (this.type === 'normal') {
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
        sessionStorage.setItem('icubeddetails', JSON.stringify(item))
        sessionStorage.setItem('icubeds', JSON.stringify(this.FetchBedsFromWardDataList));
        this.router.navigate(['/ward/icu-bed-details'])
    }

    onLogout() {
        this.configService.onLogout();
    }
}

const ICUBeds = {
    'FetchBedsFromWardNPTeleICCU': 'FetchBedsFromWardNPTeleICCU?WardID=${WardID}&AdmissionID=${AdmissionID}&ConsultantID=${ConsultantID}&Status=${Status}&UserId=${UserId}&HospitalID=${HospitalID}'
}