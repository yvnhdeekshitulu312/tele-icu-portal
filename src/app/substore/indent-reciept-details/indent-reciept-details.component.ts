import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-indent-reciept-details',
    templateUrl: './indent-reciept-details.component.html',
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
export class IndentRecieptDetailsComponent extends BaseComponent implements OnInit {
    facility: any;
    indentReciept: any;
    indentRecieptData: any;
    indentRecieptDetails: any;
    saveDisabled: boolean = false;;
    trustedUrl: any;
    constructor(private router: Router, private us: UtilityService) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.indentReciept = JSON.parse(sessionStorage.getItem("indentRecieptItem") || '{}');
        if (this.indentReciept.ReceiptBy) {
            this.saveDisabled = true;
        }
        if (this.indentReciept.IssueID) {
            this.getIndentRecieptDetails();
        } else {
            this.router.navigate(['/substore/indent-reciept'])
        }
    }

    getIndentRecieptDetails() {
        const url = this.us.getApiUrl(indentRecieptDetails.FetchIndentIssuesForReceiptsDetails, {
            FromDate: this.indentReciept.fromDate,
            ToDate: this.indentReciept.toDate,
            ToDeptID: this.facility.FacilityID,
            IssueID: this.indentReciept.IssueID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.indentRecieptData = response.FetchIndentIssuesForReceiptsData1DetailsList[0];
                    this.indentRecieptDetails = response.FetchIndentIssuesForReceiptsDetailsDataList;
                }
            },
                () => {
                });
    }

    onBackClick() {
        this.router.navigate(['/substore/indent-reciept'])
    }

    ngOnDestroy() {
        sessionStorage.removeItem('indentRecieptItem');
    }

    onSaveClick() {
        const payload = {
            IssueID: this.indentReciept.IssueID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        };

        this.us.post(indentRecieptDetails.SaveIndentReceipts, payload)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    $('#successMsgModal').modal('show');
                    this.saveDisabled = true;
                    this.getIndentRecieptDetails();
                }
            },
                () => {
                });
    }

    PatientPrintCard() {
        const url = this.us.getApiUrl(indentRecieptDetails.FetchIndentReturnViewSelectedPrint, {
            IssueID: this.indentReciept.IssueID,
            IndentDate: this.indentReciept.IndentDate,
            IssuedDate: this.indentReciept.IssueDate,
            ReceiptDate: this.indentReciept.Date,
            UserName: this.doctorDetails[0]?.UserId,           
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.trustedUrl = response?.FTPPATH;
                    this.showModal()
                }
            },
                () => {
                });
    }
  
      showModal(): void {
        $("#caseRecordModal").modal('show');
      }
}

export const indentRecieptDetails = {
    FetchIndentIssuesForReceiptsDetails: 'FetchIndentIssuesForReceiptsDetails?FromDate=${FromDate}&ToDate=${ToDate}&ToDeptID=${ToDeptID}&IssueID=${IssueID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentReturnViewSelectedPrint: 'FetchIndentReturnViewSelectedPrint?IssueID=${IssueID}&IndentDate=${IndentDate}&IssuedDate=${IssuedDate}&ReceiptDate=${ReceiptDate}&UserName=${UserName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveIndentReceipts: 'SaveIndentReceipts'
}