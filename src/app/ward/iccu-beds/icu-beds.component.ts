import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { UtilityService } from "src/app/shared/utility.service";
import { ConfigService } from 'src/app/services/config.service';

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
    hospitalId: any;
    location: any;
    wardID: any;
    ward: any;
    langData: any;
    FetchBedsFromWardDataList: any = [];
    FetchMETCALLWardDataList: any = [];

    constructor(private us: UtilityService, private portalConfig: ConfigService) {
        this.langData = this.portalConfig.getLangData();
    }

    ngOnInit() {
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        this.hospitalId = sessionStorage.getItem("hospitalId");
        this.location = sessionStorage.getItem("locationName");
        this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.wardID = this.ward.FacilityID;
        this.fetchICUBeds();
    }

    fetchICUBeds() {
        const url = this.us.getApiUrl(ICUBeds.FetchBedsFromWardNPTeleICCU, {
            WardID: this.wardID,
            ConsultantID: 0,
            Status: 3,
            UserId: this.doctorDetails[0].UserId,
            HospitalID: this.hospitalId
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchBedsFromWardDataList = response.FetchBedsFromWardDataList;
                this.FetchMETCALLWardDataList = response.FetchMETCALLWardDataList;
            }
        });
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
}

const ICUBeds = {
    'FetchBedsFromWardNPTeleICCU': 'FetchBedsFromWardNPTeleICCU?WardID=${WardID}&ConsultantID=${ConsultantID}&Status=${Status}&UserId=${UserId}&HospitalID=${HospitalID}'
}