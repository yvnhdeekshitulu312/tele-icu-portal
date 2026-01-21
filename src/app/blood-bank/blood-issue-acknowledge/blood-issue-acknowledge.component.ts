import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ConfigService as BedConfig } from '../../ward/services/config.service';
import { cloneDeep } from 'lodash';
import moment from 'moment';

declare var $: any;

@Component({
    selector: 'app-blood-issue-acknowledge',
    templateUrl: './blood-issue-acknowledge.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE],
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
        DatePipe
    ]
})
export class BloodIssueAcknowledgeComponent extends BaseComponent implements OnInit {
    tablePatientsForm!: FormGroup;
    facility: any;
    facilityId: any;
    selectedWardId: any;
    BloodIssuesDetails: any = [];
    sortedGroupedByDate: any;
    FetchUserFacilityDataList: any;
    errorMessages: any = [];

    constructor(private fb: FormBuilder, private datepipe: DatePipe, private us: UtilityService, private bedConfig: BedConfig) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
        this.selectedWardId = this.facilityId;
        this.initializetablePatientsForm();
        this.FetchBloodIssuesDetailsNurse();
        this.fetchUserFacility();
    }

    fetchUserFacility() {
        const hospId: any = sessionStorage.getItem("hospitalId");
        this.bedConfig.fetchUserFacility(this.doctorDetails[0].UserId, hospId)
            .subscribe((response: any) => {
                this.FetchUserFacilityDataList = response.FetchUserFacilityDataList;
            },
                (err) => {
                })

    }

    initializetablePatientsForm() {
        this.tablePatientsForm = this.fb.group({
            FromDate: [''],
            ToDate: [''],
        });
        const wm = new Date();
        this.tablePatientsForm.patchValue({
            FromDate: wm,
            ToDate: wm
        });
    }

    fetchPanicwithdates(filter: any) {
        if (filter === "M") {
            var wm = new Date();
            wm.setMonth(wm.getMonth() - 1);
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "3M") {

            var wm = new Date();
            wm.setMonth(wm.getMonth() - 3);
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "6M") {
            var wm = new Date();
            wm.setMonth(wm.getMonth() - 6);
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "1Y") {
            var wm = new Date();
            wm.setMonth(wm.getMonth() - 12);
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "W") {
            var d = new Date();
            d.setDate(d.getDate() - 7);
            var wm = d;
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "T") {
            var d = new Date();
            d.setDate(d.getDate());
            var wm = d;
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        }
        this.FetchBloodIssuesDetailsNurse();
    }

    onDateChange() {
        this.FetchBloodIssuesDetailsNurse();
    }

    onWardChange() {
        this.FetchBloodIssuesDetailsNurse();
    }

    FetchBloodIssuesDetailsNurse() {
        if (this.tablePatientsForm.value['FromDate'] && this.tablePatientsForm.value['ToDate']) {
            this.BloodIssuesDetails = [];
            // const selectedToDate = cloneDeep(this.tablePatientsForm.value['ToDate']);
            // const modifiedToDate = selectedToDate.setDate(selectedToDate.getDate() + 1);
            const FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
            const ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();//this.datepipe.transform(modifiedToDate, "dd-MMM-yyyy")?.toString();
            const payload = {
                WardID: this.selectedWardId,
                FromDate,
                ToDate,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            };
            const url = this.us.getApiUrl(BloodIssueAcknowledge.FetchBloodIssuesDetailsNurse, payload)
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.BloodIssuesDetails = response.FetchBloodIssuesDetailsNurseDataList;
                    this.prepareGroupedData();
                }
            });
        }
    }

    prepareGroupedData() {
        const groupedByDate = this.BloodIssuesDetails.reduce((acc: any, current: any) => {
            const IssueDate = current.IssueDate.split(' ')[0];
            if (!acc[IssueDate]) {
                acc[IssueDate] = [];
            }
            acc[IssueDate].push(current);
            return acc;
        }, {});

        this.sortedGroupedByDate = Object.entries(groupedByDate)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([IssueDate, items]) => ({ IssueDate, items }));
    }

    onAcknowledgeClick() {
        this.errorMessages = [];
        const selectedItems = this.sortedGroupedByDate
            .map((group: any) => group.items.filter((item: any) => item.selected))
            .flat();
        if (selectedItems.length === 0) {
            this.errorMessages.push('Please Select Orders');
            $('#errorMsg').modal('show');
            return;
        }
        const BLOODTextXMLL: any = selectedItems.map((element: any) => {
            return {
                "BII": element.BloodissueItemID,
                "ACKBY": this.doctorDetails[0].UserId,
                "ACKDATE": moment(new Date()).format('DD-MMM-YYYY HH:mm')
            }
        });
        const payload = {
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospitalID,
            BLOODTextXMLL
        };
        this.us.post(BloodIssueAcknowledge.UpdateBloodissueDetails, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                this.FetchBloodIssuesDetailsNurse();
            }
        })
    }
}

export const BloodIssueAcknowledge = {
    FetchBloodIssuesDetailsNurse: 'FetchBloodIssuesDetailsNurse?WardID=${WardID}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    UpdateBloodissueDetails: 'UpdateBloodissueDetails'
}