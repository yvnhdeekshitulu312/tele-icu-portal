import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";

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
export class ICUBedDetailsComponent implements OnInit {
    doctorDetails: any;
    hospitalId: any;
    location: any;
    wardID: any;
    ward: any;
    langData: any;

    constructor() {

    }

    ngOnInit(): void {

    }
}