import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';

declare var $: any;

@Component({
    selector: 'app-indent-return-ack',
    templateUrl: './indent-return-ack.component.html',
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
export class IndentReturnAckComponent extends BaseComponent implements OnInit {
    indentIssueForm: any;
    facility: any;
    FetchIndentReturnViewDataList: any[] = [];
    FetchUserFacilityDataList: any = [];
    refreshHeader: boolean = true;
    facilityId: any;
    currentPage: any = 1;
    totalItemsCount: any = 0;

    constructor(private us: UtilityService, private formBuilder: FormBuilder, private router: Router, private bedconfig: BedConfig) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.initializeForm();
        this.searchIndentReturnAck();
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
            this.searchIndentReturnAck();
            setTimeout(() => {
                this.refreshHeader = true;
            }, 0);
        }
    }

    clearIndentIssueForm() {
        this.initializeForm();
        this.FetchIndentReturnViewDataList = [];
        this.currentPage = 1;
        this.totalItemsCount = 0;
    }

    handlePageChange(event: any) {
        this.searchIndentReturnAck(event.min, event.max, event.currentPage);
      }

    searchIndentReturnAck(min: number = 1, max: number = 10, currentPage: number = 1) {
        if (!this.indentIssueForm.get('fromDate').value || !this.indentIssueForm.get('toDate').value) {
            return;
        }
        const url = this.us.getApiUrl(IndentReturnAck.FetchIndentReturnViewAck, {
            FromDate: moment(this.indentIssueForm.get('fromDate').value).format('DD-MMM-YYYY'),
            ToDate: moment(this.indentIssueForm.get('toDate').value).format('DD-MMM-YYYY'),
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID,
            UserID: this.doctorDetails[0].UserId,
            min,
            max
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.currentPage = currentPage;
                    this.totalItemsCount = Number(response.FetchIndentItemSmartSearchDataCountList[0]?.Count);
                    this.FetchIndentReturnViewDataList = response.FetchIndentReturnViewDataList;
                    
                    this.FetchIndentReturnViewDataList.forEach((element: any) => {
                        if (element.Status == '1') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 newOrder";
                            element.IssueStatusName="New Return";
                        }
                        else if (element.Status == '2') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 partialIssued";
                             element.IssueStatusName="Acknowledge";
                        }
                        else if (element.Status == '3') {
                            element.class = "row gx-2 p-2 mx-0 alter_div rounded-0 fullyIssued";
                             element.IssueStatusName="Cancel Return";
                        }                        
                    });
                }
            },
                () => {
                });
    }

    navigateToIndentDetails(item: any) {
        sessionStorage.setItem('indentReturnAckItem', JSON.stringify(item));
        this.router.navigate(['/substore/indent-return-ack-details']);
    }
}

export const IndentReturnAck = {
    FetchIndentReturnViewAck: 'FetchIndentReturnViewAck?min=${min}&max=${max}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}