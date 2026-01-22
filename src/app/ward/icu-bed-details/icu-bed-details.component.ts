import { DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { Router } from "@angular/router";
import { Subscription, timer } from "rxjs";
import { UtilityService } from "src/app/shared/utility.service";

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
export class ICUBedDetailsComponent implements OnInit, OnDestroy{
    doctorDetails: any;
    location: any;
    wardID: any;
    ward: any;
    langData: any;

    selectedICUBed: any = [];
    ICUBeds: any = []
    filteredICUBeds: any = [];
    refreshTime: any = new Date();
    private refreshSub!: Subscription;

    constructor(private router: Router, private us: UtilityService) {

    }

    ngOnInit(): void {
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        this.location = sessionStorage.getItem("locationName");
        this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.wardID = this.ward.FacilityID;
        this.filteredICUBeds = this.ICUBeds = JSON.parse(sessionStorage.getItem("icubeds") || '{}');
        if (sessionStorage.getItem("icubeddetails")) {
            this.selectedICUBed = JSON.parse(sessionStorage.getItem("icubeddetails") || '{}');
            this.fetchICUBed();
        } else {
            this.navigateToICUBeds();
        }
    }

    ngOnDestroy() {
        if (this.refreshSub) {
            this.refreshSub.unsubscribe();
        }
    }

    onSelectBed(item: any) {
        this.selectedICUBed = item;
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
            }
        });
    }

    navigateToICUBeds() {
        this.router.navigate(['/ward/icu-beds']);
    }
}

const ICUBedDetails = {
    'FetchBedsFromWardNPTeleICCU': 'FetchBedsFromWardNPTeleICCU?WardID=${WardID}&AdmissionID=${AdmissionID}&ConsultantID=${ConsultantID}&Status=${Status}&UserId=${UserId}&HospitalID=${HospitalID}'
}