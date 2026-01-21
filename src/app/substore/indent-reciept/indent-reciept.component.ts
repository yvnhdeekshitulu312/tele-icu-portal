import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';

declare var $: any;

@Component({
    selector: 'app-indent-reciept',
    templateUrl: './indent-reciept.component.html',
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
export class IndentRecieptComponent extends BaseComponent implements OnInit {
    indentIssueForm: any;
    facility: any;
    FetchIndentIssuesForReceiptsDataList: any[] = [];
    FetchUserFacilityDataList: any = [];
    refreshHeader: boolean = true;
    facilityId: any;
    filteredData: any = [];

    constructor(private us: UtilityService, private formBuilder: FormBuilder, private router: Router, private bedconfig: BedConfig) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.initializeForm();
        this.searchIndentReciepts();
        this.fetchUserFacility();
    }

    initializeForm() {
        this.indentIssueForm = this.formBuilder.group({
            fromDate: new Date(),
            toDate: new Date()
        });
    }
    fetchUserFacility() {
        this.bedconfig.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalID)
            .subscribe((response: any) => {
                this.FetchUserFacilityDataList = response.FetchUserFacilityDataList;
            },
                (err) => {
                })
    }

    selectFacility() {
        if (this.FetchUserFacilityDataList) {
            const selectedItem = this.FetchUserFacilityDataList.find((value: any) => value.FacilityID === this.wardID);
            sessionStorage.setItem("facility", JSON.stringify(selectedItem));
            this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
            this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
            this.wardID = this.ward.FacilityID;
            this.facilityId = this.wardID;
            this.refreshHeader = false;
            this.clearIndentIssueForm();
            this.searchIndentReciepts();
            setTimeout(() => {
                this.refreshHeader = true;
            }, 0);
        }
    }

    clearIndentIssueForm() {
        this.initializeForm();
        this.FetchIndentIssuesForReceiptsDataList = [];
        this.filteredData = [];
    }

    searchIndentReciepts() {
        if (!this.indentIssueForm.get('fromDate').value || !this.indentIssueForm.get('toDate').value) {
            return;
        }
        const url = this.us.getApiUrl(IndentIssueReceipt.FetchIndentIssuesForReceipts, {
            FromDate: moment(this.indentIssueForm.get('fromDate').value).format('DD-MMM-YYYY'),
            ToDate: moment(this.indentIssueForm.get('toDate').value).format('DD-MMM-YYYY'),
            ToDeptID: this.facility.FacilityID,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID,
            UserID: this.doctorDetails[0].UserId
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.FetchIndentIssuesForReceiptsDataList = response.FetchIndentIssuesForReceiptsDataList;
                    this.FetchIndentIssuesForReceiptsDataList.forEach((element: any) => {
                        if (element.IssueStatus == '1') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 newOrder";
                        }
                        else if (element.IssueStatus == '2') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 partialIssued";
                        }
                        else if (element.IssueStatus == '3') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 fullyIssued";
                        }
                        else if (element.IssueStatus == '5') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 acknowledged";
                        }
                        else if (element.IssueStatus == '6') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 closeIndent";
                        }
                        else if (element.IssueStatus == '7') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 firstApprove";
                        }
                        else if (element.IssueStatus == '9') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 secApprove ";
                        }
                    });
                    this.filteredData = cloneDeep(this.FetchIndentIssuesForReceiptsDataList);
                }
            },
                () => {
                });
    }

    navigateToIndentDetails(item: any) {
        item.fromDate = moment(this.indentIssueForm.get('fromDate').value).format('DD-MMM-YYYY');
        item.toDate = moment(this.indentIssueForm.get('toDate').value).format('DD-MMM-YYYY');
        sessionStorage.setItem('indentRecieptItem', JSON.stringify(item));
        this.router.navigate(['/substore/indent-reciept-details']);
    }

    getCount(status: any) {
        return this.FetchIndentIssuesForReceiptsDataList.filter((element: any) => element.IssueStatus === status).length;
    }

    filterData(status: any) {
        this.filteredData = this.FetchIndentIssuesForReceiptsDataList.filter((element: any) => element.IssueStatus === status);
    }
}

export const IndentIssueReceipt = {
    FetchIndentIssuesForReceipts: 'FetchIndentIssuesForReceipts?FromDate=${FromDate}&ToDate=${ToDate}&ToDeptID=${ToDeptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}