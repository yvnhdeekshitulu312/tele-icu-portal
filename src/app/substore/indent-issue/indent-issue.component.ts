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
    selector: 'app-indent-issue',
    templateUrl: './indent-issue.component.html',
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
export class IndentIssueComponent extends BaseComponent implements OnInit {
    indentIssueForm: any;
    facility: any;
    FetchIndentOrdersForIssuingDataList: any[] = [];
    FetchUserFacilityDataList: any;
    refreshHeader: boolean = true;
    filteredData: any = [];

    selectedStatus: any = 0;
    selectedIndentFromId: any = 0;
    selectedIndentFromList: any = [];

    constructor(private bedconfig: BedConfig, private us: UtilityService, private formBuilder: FormBuilder, private router: Router) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.initializeForm();
        this.fetchUserFacility();
        this.searchIndentIssues();
    }

    initializeForm() {
        this.indentIssueForm = this.formBuilder.group({
            fromDate: new Date(),
            toDate: new Date()
        });
    }

    clearIndentIssueForm() {
        this.initializeForm();
        this.FetchIndentOrdersForIssuingDataList = [];
        this.filteredData = [];
        this.searchIndentIssues();
    }

    searchIndentIssues() {
        if (!this.indentIssueForm.get('fromDate').value || !this.indentIssueForm.get('toDate').value) {
            return;
        }
        this.selectedIndentFromId = 0;
        this.selectedStatus = 0;
        const url = this.us.getApiUrl(indentIssue.FetchIndentOrdersForIssuing, {
            FromDate: moment(this.indentIssueForm.get('fromDate').value).format('DD-MMM-YYYY'),
            ToDate: moment(this.indentIssueForm.get('toDate').value).format('DD-MMM-YYYY'),
            ToDeptID: this.facility.FacilityID,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.FetchIndentOrdersForIssuingDataList = response.FetchIndentOrdersForIssuingDataList;
                    this.FetchIndentOrdersForIssuingDataList.forEach((element: any) => {
                        if (element.Status == '1') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 newOrder";
                        }
                        else if (element.Status == '2') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 partialIssued";
                        }
                        else if (element.Status == '3') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 fullyIssued";
                        }
                        else if (element.IssueStatus == '5') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 acknowledged";
                        }
                        else if (element.Status == '6') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 closeIndent";
                        }
                        else if (element.Status == '7') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 firstApprove";
                        }
                        else if (element.Status == '9') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 secApprove ";
                        }
                    });
                    // Filter out duplicate FromDeptID
                    const uniqueDeptMap = new Map();
                    this.FetchIndentOrdersForIssuingDataList.forEach((item: any) => {
                        if (!uniqueDeptMap.has(item.FromDeptID)) {
                            uniqueDeptMap.set(item.FromDeptID, {
                                label: item.IndentFrom,
                                id: item.FromDeptID
                            });
                        }
                    });
                    this.selectedIndentFromList = Array.from(uniqueDeptMap.values());
                    this.filteredData = cloneDeep(this.FetchIndentOrdersForIssuingDataList)
                }
            },
                () => {
                });
    }

    navigateToIndentDetails(item: any) {
        item.fromDate = moment(this.indentIssueForm.get('fromDate').value).format('DD-MMM-YYYY');
        item.toDate = moment(this.indentIssueForm.get('toDate').value).format('DD-MMM-YYYY');
        sessionStorage.setItem('indentIssueItem', JSON.stringify(item));
        this.router.navigate(['/substore/indent-issue-details']);
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
            this.refreshHeader = false;
            this.searchIndentIssues();
            setTimeout(() => {
                this.refreshHeader = true;
            }, 0);
        }
    }

    filterData(status: any) {
        this.selectedStatus = status;
        const noStatusFilter = status === 0 || status === "0";
        const noIndentFilter = this.selectedIndentFromId === 0 || this.selectedIndentFromId === "0";
        this.filteredData =  this.FetchIndentOrdersForIssuingDataList.filter(item =>
            (noStatusFilter || item.Status === status) &&
            (noIndentFilter || item.FromDeptID === this.selectedIndentFromId)
        );

    }

    getCount(status: any) {
        const noStatusFilter = status === 0 || status === "0";
        const noIndentFilter = this.selectedIndentFromId === 0 || this.selectedIndentFromId === "0";
        return this.FetchIndentOrdersForIssuingDataList.filter(item =>
            (noStatusFilter || item.Status === status) &&
            (noIndentFilter || item.FromDeptID === this.selectedIndentFromId)
        ).length;
    }

    onIndentFromChange() {
        this.filterData(0);
    }
}

export const indentIssue = {
    FetchIndentOrdersForIssuing: 'FetchIndentOrdersForIssuing?FromDate=${FromDate}&ToDate=${ToDate}&ToDeptID=${ToDeptID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}