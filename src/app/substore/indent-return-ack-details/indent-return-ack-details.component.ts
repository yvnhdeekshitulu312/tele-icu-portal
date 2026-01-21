import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-indent-return-ack-details',
    templateUrl: './indent-return-ack-details.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE],
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
        DatePipe
    ],
})
export class IndentReturnAckDetailsComponent extends BaseComponent implements OnInit {
    facility: any;
    indentReturnAckItem: any;
    indentReturnAckDetails: any;
    saveDisabled: boolean = false;;
    trustedUrl: any;
    currentDate = moment(new Date()).format('DD-MMM-YYYY');

    constructor(private router: Router, private us: UtilityService) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.indentReturnAckItem = JSON.parse(sessionStorage.getItem("indentReturnAckItem") || '{}');
        if (this.indentReturnAckItem.ReceiptBy) {
            this.saveDisabled = true;
        }
        if (this.indentReturnAckItem.IssueID) {
            this.getIndentReturnAckDetails();
        } else {
            this.router.navigate(['/substore/indent-return-ack'])
        }
    }

    getIndentReturnAckDetails() {
        const url = this.us.getApiUrl(indentRecieptDetails.FetchIndentReturnViewSelectedAck, {
            IssueID: this.indentReturnAckItem.IssueID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.indentReturnAckDetails = response.FetchIndentReturnViewSelectedDataList;
                }
            },
                () => {
                });
    }

    onBackClick() {
        this.router.navigate(['/substore/indent-return-ack'])
    }

    ngOnDestroy() {
        sessionStorage.removeItem('indentReturnAckItem');
    }

    onSaveClick() {
        const payload = {
            IssueID: this.indentReturnAckItem.IssueID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        };

        this.us.post(indentRecieptDetails.SaveIndentReceiptsAck, payload)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    $('#successMsgModal').modal('show');
                    this.saveDisabled = true;
                    this.getIndentReturnAckDetails();
                }
            },
                () => {
                });
    }
}

export const indentRecieptDetails = {
    FetchIndentReturnViewSelectedAck: 'FetchIndentReturnViewSelectedAck?IssueID=${IssueID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveIndentReceiptsAck: 'SaveIndentReceiptsAck'
}