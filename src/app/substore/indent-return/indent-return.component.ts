import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-indent-return',
    templateUrl: './indent-return.component.html',
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
export class IndentReturnComponent extends BaseComponent implements OnInit {
    indentReturnToList: any = [];
    locationList: any = [];
    indentForm: any;
    viewIndentForm: any;
    itemsList: any = [];
    errorMessages: any = [];
    selectedItems: any = [];
    IssueID: any = 0;
    facility: any;
    facilityId: any;
    FetchIndentReturnsDataList: any = [];

    constructor(private us: UtilityService, private formBuilder: FormBuilder, private config: ConfigService) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
        this.viewIndentForm = this.formBuilder.group({
            fromDate: new Date(),
            toDate: new Date()
        });
        this.initializeForm();
        this.FetchHospitalLocations();
        //this.FetchFacilitiesReturns();
        this.FetchIndentReturns();
    }

    initializeForm() {
        this.indentForm = this.formBuilder.group({
            indentLocation: this.hospitalID,
            indentRefNo: '',
            indentDate: [{ value: moment().format('DD-MMM-YYYY HH:mm'), disabled: true }],
            indentReturnToName: '',
            indentReturnTo: '',
            indentRetunNo: [{ value: '', disabled: true }],
            barCodeNo: [{ value: '', disabled: true }],
        });
    }

    getCurrentTime(): string {
        const now = new Date();
        const hours = this.padZero(now.getHours());
        const minutes = this.padZero(now.getMinutes());
        return `${hours}:${minutes}`;
    }

    padZero(value: number): string {
        return value < 10 ? '0' + value : value.toString();
    }

    FetchHospitalLocations() {
        this.config.fetchFetchHospitalLocations().subscribe((response) => {
            if (response.Code === 200) {
                this.locationList = response.HospitalLocationsDataList;
            }
        },
            (err) => {

            });
    }

    FetchFacilitiesReturns() {
        const url = this.us.getApiUrl(indentReturn.FetchFacilitiesReturns, {
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.indentForm.get('indentLocation').value
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200 && response.FetchFacilitiesReturnsDataList.length > 0) {
                    if (response.FetchFacilitiesReturnsDataList[0].Enabled) {
                        this.indentForm.get('indentLocation').enable();
                    } else {
                        this.indentForm.get('indentLocation').disable();
                    }
                } else {
                    this.indentForm.get('indentLocation').disable();
                }
            },
                () => {
                })
    }

    searchIndentReturnTo(event: any) {
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(indentReturn.FetchIndentTo, {
                Filter: searchval,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.indentForm.get("indentLocation")?.value// this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.indentReturnToList = response.FetchIndentToDataList;
                    }
                },
                    () => {
                    })
        }
    }

    selectIndentRetrunTo(event: any) {
        const item = this.indentReturnToList.find((x: any) => x.FacilityName === event.option.value);
        this.indentForm.patchValue({
            indentReturnToName: item.FacilityName,
            indentReturnTo: item.FacilityID
        });
        this.indentReturnToList = [];
    }

    searchItems(event: any) {
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(indentReturn.FetchItemsOfDepartmentReturn, {
                Filter: searchval,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.itemsList = response.FetchItemsOfDepartmentReturnDataList;
                    }
                },
                    () => {
                    });
        }
    }

    selectItem(element: any) {
        this.itemsList = [];
        const url = this.us.getApiUrl(indentReturn.FetchIndentItem, {
            ItemID: element.ItemID,
            FromWokstationID: this.facilityId,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID,
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200 && response.FetchIndentItemDataList.length > 0) {
                    $('#drugNameText').val('');
                    const item = response.FetchIndentItemDataList[0];
                    item.BatchNo = element.BatchNO;
                    item.ExpiryDate = element.ExpiryDate;
                    item.BatchID = element.BatchID;
                    item.rate = 0;
                    item.Quantity = '';
                    item.Remarks = '';
                    item.unitsList = response.FetchIndentItemUnitsDataList;
                    item.UoMID = item.unitsList[item.unitsList.length - 1].UoMID;
                    this.selectedItems.push(item);
                }
            },
                () => {
                });
    }

    onSaveClick() {
        this.errorMessages = [];
        if (this.indentForm.get('indentRefNo').value.toString() === '') {
            this.errorMessages.push('Please enter Ref No');
        }

        if (!this.indentForm.get('indentReturnTo').value) {
            this.errorMessages.push('Please select Indent Return To');
        }

        if (this.selectedItems.length === 0) {
            this.errorMessages.push('Please add Items');
        }

        if (this.selectedItems.length > 0) {
            const isItemsInvalid = this.selectedItems.filter((item: any) => !item.Quantity);
            if (isItemsInvalid.length > 0) {
                this.errorMessages.push('Please Enter Quantity for Items');
            }
        }

        if (this.selectedItems.length > 0) {
            const isItemsInvalid = this.selectedItems.filter((item: any) => !item.Remarks);
            if (isItemsInvalid.length > 0) {
                this.errorMessages.push('Please Enter Remarks for Items');
            }
        }

        if (this.errorMessages.length > 0) {
            $('#errorMessagesModal').modal('show');
            return;
        }

        const items = this.selectedItems.map((item: any, index: any) => {
            return {
                "SLNO": index + 1,
                "IID": item.ItemID,
                "BID": item.BatchID,
                "QTY": item.Quantity,
                "PID": item.PID,
                "UID": item.UoMID,
                "RMK": item.Remarks,
                "RATE": item.rate
            }
        });

        const payload = {
            "IssueID": this.IssueID,
            "IndentIssueSLNO": "",
            "FromDeptID": this.facilityId,
            "ToDeptID": this.indentForm.get('indentReturnTo').value,
            "IndentID": "0",
            "Status": "1",
            "IssueType": "IR",
            "ReferenceNo": this.indentForm.get('indentRefNo').value,
            "Items": items,
            "UserID": this.doctorDetails[0]?.UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospitalID,
        }

        this.us.post(indentReturn.SaveIndentOrderReturn, payload).subscribe((response) => {
            if (response.Code === 200) {
                this.clearForm();
                this.FetchIndentReturns();
                $("#successMsgModal").modal('show');
            }
        },
            (err) => {
                console.log(err)
            });
    }

    clearForm() {
        this.IssueID = 0;
        this.selectedItems = [];
        this.initializeForm();
        $('#drugNameText').val('');
        //this.FetchFacilitiesReturns();
    }

    viewReturns() {
        $('#indentReturnsViewModal').modal('show');
    }

    onIndentReturnSelect(order: any) {
        $('#indentReturnsViewModal').modal('hide');
        this.clearForm();
        const url = this.us.getApiUrl(indentReturn.FetchIndentReturnViewSelected, {
            IssueID: order.IssueID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.IssueID = order.IssueID;
                this.indentForm.patchValue({
                    indentReturnToName: order.IndentTo,
                    indentReturnTo: order.ToStationID,
                    indentDate: moment(order.Issuedate).format('DD-MMM-YYYY'),
                    indentRefNo: order.ReferenceNo,
                });

                response.FetchIndentReturnViewSelectedDataList.forEach((item: any) => {
                    item.DisplayName = item.ItemName;
                    item.PID = item.PackId;
                    item.rate = 0;
                    item.unitsList = response.FetchIndentItemDetailsUnitsDataList.filter((unit: any) => unit.ItemID.toString() === item.ItemID.toString());
                    this.selectedItems.push(item);
                });
            }

        }, (err) => {
        })
    }

    deleteItem(index: any) {
        this.selectedItems.splice(index, 1);
    }

    FetchIndentReturns() {
        this.FetchIndentReturnsDataList = [];
        const url = this.us.getApiUrl(indentReturn.FetchIndentReturnView, {
            FromDate: moment(this.viewIndentForm.get('fromDate').value).format('DD-MMM-YYYY'),
            ToDate: moment(this.viewIndentForm.get('toDate').value).format('DD-MMM-YYYY'),
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchIndentReturnsDataList = response.FetchIndentReturnViewDataList;
            }
        },
            (err) => {
            });
    }
}

export const indentReturn = {
    FetchFacilitiesReturns: 'FetchFacilitiesReturns?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentTo: 'FetchIndentTo?Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchItemsOfDepartmentReturn: 'FetchItemsOfDepartmentReturn?Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentItem: 'FetchIndentItem?ItemID=${ItemID}&FromWokstationID=${FromWokstationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveIndentOrderReturn: 'SaveIndentOrderReturn',
    FetchIndentReturnView: 'FetchIndentReturnView?FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentReturnViewSelected: 'FetchIndentReturnViewSelected?IssueID=${IssueID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
}