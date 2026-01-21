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
    selector: 'app-departmental-returns',
    templateUrl: './departmental-returns.component.html',
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
export class DepartmentalReturnsComponent extends BaseComponent implements OnInit {
    issuesList: any = [];
    departmentalReturnsForm: any;
    viewDeptReturnsForm: any;
    itemsList: any = [];
    errorMessages: any = [];
    selectedItems: any = [];
    IssueID: any = 0;
    facility: any;
    facilityId: any;
    FetchDeptReturnsDataList: any = [];

    constructor(private us: UtilityService, private formBuilder: FormBuilder, private config: ConfigService) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
        var fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 1);
        this.viewDeptReturnsForm = this.formBuilder.group({
            fromDate,
            toDate: new Date()
        });
        this.initializeForm();
        this.FetchDeptReturns();
    }

    initializeForm() {
        this.departmentalReturnsForm = this.formBuilder.group({
            issueNo: '',
            issueDetails: '',
            location: [{ value: '', disabled: true }],
            dateTime: [{ value: '', disabled: true }],
            transferTo: [{ value: '', disabled: true }],
            refNo: [{ value: '', disabled: true }]
        });
    }

    searchIssueNo(event: any) {
        this.departmentalReturnsForm.patchValue({
            transferTo: ''
        });
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(departmentalReturns.FetchDeptReturnOrdersIssueDetail, {
                FromDeptID: this.facilityId,
                IssueNo: searchval,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.issuesList = response.FetchDeptReturnOrdersIssueDetailDataList;
                    }
                },
                    () => {
                    })
        }
    }

    selectIssueNo(event: any) {
        const item = this.issuesList.find((x: any) => x.IssueNo === event.option.value);
        this.departmentalReturnsForm.patchValue({
            issueNo: item.IssueNo,
            issueDetails: item,
            location: item.ToHospital,
            dateTime: item.IssueDate,
            transferTo: item.ToDepartment,
            refNo: item.ReferenceNo
        });
        this.issuesList = [];
        this.selectedItems = [];
    }
    searchItems(event: any) {
        this.errorMessages = [];
        if (!this.departmentalReturnsForm.get('issueDetails').value) {
            this.errorMessages.push('Please Select Issue');
            $('#itemText').val('');
        }
        if (this.errorMessages.length > 0) {
            $('#errorMessagesModal').modal('show');
            return;
        }
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(departmentalReturns.FetchDeptReturnOrdersItemSearch, {
                IssueID: this.departmentalReturnsForm.get('issueDetails').value.IssueID,
                ItemName: searchval,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.itemsList = response.FetchDeptReturnOrdersItemSearchDataList;
                    }
                },
                    () => {
                    });
        }
    }

    selectItem(item: any) {
        this.itemsList = [];
        const itemFound = this.selectedItems.find((element: any) => element.ItemID === item.ItemID);
        if (!itemFound) {
            this.selectedItems.push(item);
        }
        setTimeout(() => {
            $('#itemText').val('');
        });
    }

    onSaveClick() {
        this.errorMessages = [];

        if (!this.departmentalReturnsForm.get('issueDetails').value) {
            this.errorMessages.push('Please select Issue');
        }

        if (this.selectedItems.length === 0) {
            this.errorMessages.push('Please add Items');
        }

        if (this.selectedItems.length > 0) {
            const isItemsInvalid = this.selectedItems.filter((item: any) => !item.DeptRtnQty);
            if (isItemsInvalid.length > 0) {
                this.errorMessages.push('Please Enter Quantity for Items');
            }

            const isQuantityMore = this.selectedItems.filter((item: any) => item.DeptRtnQty && (Number(item.DeptRtnQty) > Number(item.Quantity)));

            if (isQuantityMore.length > 0) {
                this.errorMessages.push('Return quantity cannot be greater than Issue quantity');
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
                "QTY": item.DeptRtnQty,
                "PID": item.PackId,
                "UID": item.UoMID,
                "UMRP": item.MRP
            }
        });

        const payload = {
            "IssueID": this.IssueID,
            "OldIssueID": this.departmentalReturnsForm.get('issueDetails').value.IssueID,
            "IndentIssueSLNO": "",
            "FromDeptID": this.departmentalReturnsForm.get('issueDetails').value.ToDeptID, //--------ToDeptID
            "ToDeptID": this.departmentalReturnsForm.get('issueDetails').value.FromDeptID,
            "IndentID": "0",
            "Status": "1",
            "IssueType": "DR",
            "ReferenceNo": this.departmentalReturnsForm.get('refNo').value,
            "Items": items,
            "UserID": this.doctorDetails[0]?.UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospitalID,
        }

        this.us.post(departmentalReturns.SaveDepartmentSaleReturn, payload).subscribe((response) => {
            if (response.Code === 200) {
                this.clearForm();
                this.FetchDeptReturns();
                $("#successMsgModal").modal('show');
            } else {
                this.errorMessages = [response.Message];
                $('#errorMessagesModal').modal('show');
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
        $('#itemText').val('');
    }

    viewDeptReturns() {
        $('#deptReturnsViewModal').modal('show');
    }

    onDateChange() {
        if (this.viewDeptReturnsForm.value['fromDate'] && this.viewDeptReturnsForm.value['toDate']) {
            this.FetchDeptReturns();
        }
    }

    onDeptReturnItemSelect(order: any) {
        $('#deptReturnsViewModal').modal('hide');
        this.clearForm();
        const url = this.us.getApiUrl(departmentalReturns.FetchDepartmentSalesDetails, {
            IssueID: order.IssueID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                const returnDetails = response.FetchDepartmentSalesData1DetailsList[0];
                this.IssueID = order.IssueID;
                this.departmentalReturnsForm.patchValue({
                    location: returnDetails.ToHospital,
                    transferTo: returnDetails.ToDepartment,
                    refNo: returnDetails.ReferenceNo,
                    dateTime: moment(order.IssueDate).format('DD-MMM-YYYY'),
                    issueNo: returnDetails.ORDERSLNO,
                    issueDetails: returnDetails
                });

                response.FetchDepartmentSalesReturnDetailsDataList.forEach((item: any) => {
                    item.DeptRtnQty = item.RetQty;
                    item.Quantity = item.IssQty;
                    item.QOH = item.QOH;
                    item.UOM = item.QUOM;
                    this.selectedItems.push(item);
                });
            }

        }, (err) => {
        })
    }

    deleteItem(index: any) {
        this.selectedItems.splice(index, 1);
    }

    FetchDeptReturns() {
        this.FetchDeptReturnsDataList = [];
        const url = this.us.getApiUrl(departmentalReturns.FetchDeptReturnOrdersIssueView, {
            FromDate: moment(this.viewDeptReturnsForm.get('fromDate').value).format('DD-MMM-YYYY'),
            ToDate: moment(this.viewDeptReturnsForm.get('toDate').value).format('DD-MMM-YYYY'),
            ToDeptID: this.facilityId,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchDeptReturnsDataList = response.FetchDeptReturnOrdersIssueViewDataList;
            }
        },
            (err) => {
            });
    }

    getAmountValue(item: any) {
        if (this.IssueID) {
            return item.Amount;
        }
        else if (item.DeptRtnQty) {
            return (Number(item.MRP) * item.DeptRtnQty).toFixed(2);
        }
        return '';
    }

    getTotalValue() {
        let totalValue = 0;
        if (this.selectedItems.length > 0) {
            if (this.IssueID) {
                totalValue = this.selectedItems.reduce((sum: number, item: any) => sum + Number(item.Amount), 0)
            } else {
                this.selectedItems.forEach((item: any) => {
                    if (item.DeptRtnQty) {
                        totalValue += Number((Number(item.MRP) * item.DeptRtnQty).toFixed(2));
                    }
                })
            }
        }
        return totalValue;
    }

    onQuantityChange(event: any, item: any) {
        if (event.target.value > Number(item.Quantity)) {
            this.errorMessages = ['Return quantity cannot be greater than Issue quantity']
            $('#errorMessagesModal').modal('show');
        }
    }
}

export const departmentalReturns = {
    FetchDeptReturnOrdersItemSearch: 'FetchDeptReturnOrdersItemSearch?IssueID=${IssueID}&ItemName=${ItemName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchDeptReturnOrdersIssueDetail: 'FetchDeptReturnOrdersIssueDetail?FromDeptID=${FromDeptID}&IssueNo=${IssueNo}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveDepartmentSaleReturn: 'SaveDepartmentSaleReturn',
    FetchDeptReturnOrdersIssueView: 'FetchDeptReturnOrdersIssueView?FromDate=${FromDate}&ToDate=${ToDate}&ToDeptID=${ToDeptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchDepartmentSalesDetails: 'FetchDepartmentSalesReturnDetails?IssueID=${IssueID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}