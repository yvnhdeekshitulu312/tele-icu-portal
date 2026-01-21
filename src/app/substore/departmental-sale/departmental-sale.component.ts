import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';

declare var $: any;

@Component({
    selector: 'app-departmental-sale',
    templateUrl: './departmental-sale.component.html',
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
export class DepartmentalSaleComponent extends BaseComponent implements OnInit {
    transferToList: any = [];
    locationList: any = [];
    departmentalSaleForm: any;
    viewDeptSaleForm: any;
    itemsList: any = [];
    errorMessages: any = [];
    selectedItems: any = [];
    IssueID: any = 0;
    facility: any;
    facilityId: any;
    FetchDeptSalesDataList: any = [];
    FetchUserFacilityDataList: any = [];
    refreshHeader: boolean = true;

    constructor(private us: UtilityService, private formBuilder: FormBuilder, private config: ConfigService, private bedconfig: BedConfig) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
        var fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 1);
        this.viewDeptSaleForm = this.formBuilder.group({
            fromDate,
            toDate: new Date()
        });
        this.initializeForm();
        this.FetchHospitalLocations();
        this.FetchDeptSales();
        this.fetchUserFacility();
    }

    initializeForm() {
        this.departmentalSaleForm = this.formBuilder.group({
            location: [{ value: this.hospitalID, disabled: true }],
            dateTime: [{ value: moment().format('DD-MMM-YYYY HH:mm'), disabled: true }],
            transferToName: '',
            transferTo: '',
            issueNo: [{ value: '', disabled: true }],
            requestor: ''
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
            this.clearForm();
            this.FetchDeptSales();
            setTimeout(() => {
                this.refreshHeader = true;
            }, 0);
        }
    }

    searchTransferTo(event: any) {
        this.departmentalSaleForm.patchValue({
            transferTo: ''
        });
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(departmentalSale.FetchIndentTransferTo, {
                Filter: searchval,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.transferToList = response.FetchIndentToDataList;
                    }
                },
                    () => {
                    })
        }
    }

    selectTransferTo(event: any) {
        const item = this.transferToList.find((x: any) => x.FacilityName === event.option.value);
        this.departmentalSaleForm.patchValue({
            transferToName: item.FacilityName,
            transferTo: item.FacilityID
        });
        this.transferToList = [];
    }
    searchItems(event: any) {
        this.errorMessages = [];
        if (!this.departmentalSaleForm.get('transferTo').value) {
            this.errorMessages.push('Please select Transfer To');
            $('#itemText').val('');
        }
        if (this.errorMessages.length > 0) {
            $('#errorMessagesModal').modal('show');
            return;
        }
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(departmentalSale.FetchIndentItemSmartSearch, {
                Filter: searchval,
                FromWokstationID: this.facilityId,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.itemsList = response.FetchIndentItemSmartSearchDataList;
                    }
                },
                    () => {
                    });
        }
    }

    searchItemsold(event: any) {
        this.errorMessages = [];
        if (!this.departmentalSaleForm.get('transferTo').value) {
            this.errorMessages.push('Please select Transfer To');
            $('#itemText').val('');
        }
        if (this.errorMessages.length > 0) {
            $('#errorMessagesModal').modal('show');
            return;
        }
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(departmentalSale.FetchIndentDepartmentItemSmartSearch, {
                Filter: searchval,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.itemsList = response.FetchIndentDepartmentItemSmartSearchDataList;
                    }
                },
                    () => {
                    });
        }
    }

    selectItem(element: any) {
        this.itemsList = [];
        const url = this.us.getApiUrl(departmentalSale.FetchIndentDepartmentItemSelected, {
            ItemID: element.ItemID,
            ItemName: element.DisplayName,
            TransfertoName: this.departmentalSaleForm.get('transferToName').value,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID,
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200 && response.FetchIndentDepartmentItemSelectedDataList.length > 0) {
                    $('#itemText').val('');
                    const item = response.FetchIndentDepartmentItemSelectedDataList[0];
                    item.unitsList = response.FetchIndentItemUnitsMDataList;
                    this.selectedItems.push(item);
                } else {
                    $('#itemText').val('');
                    this.errorMessages = [response.Message];
                    $('#errorMessagesModal').modal('show');
                }
            },
                () => {
                });
    }

    onSaveClick() {
        this.errorMessages = [];

        if (this.departmentalSaleForm.get('requestor').value.toString() === '') {
            this.errorMessages.push('Please Enter Requestor');
        }

        if (!this.departmentalSaleForm.get('transferTo').value) {
            this.errorMessages.push('Please select Transfer To');
        }

        if (this.selectedItems.length === 0) {
            this.errorMessages.push('Please add Items');
        }

        if (this.selectedItems.length > 0) {
            const isItemsInvalid = this.selectedItems.filter((item: any) => !item.IssQty);
            if (isItemsInvalid.length > 0) {
                this.errorMessages.push('Please Enter Issue Quantity for Items');
            }

            const isQuantityMore = this.selectedItems.filter((item: any) => item.IssQty && (Number(item.IssQty) > Number(item.Qty)));

            if (isQuantityMore.length > 0) {
                this.errorMessages.push('Issuing quantity cannot be greater than available quantity');
            }
        }

        if (this.errorMessages.length > 0) {
            $('#errorMessagesModal').modal('show');
            return;
        }

        const items = this.selectedItems.map((item: any, index: any) => {
            return {
                "SLNO": index + 1,
                "IID": item.ItemId,
                "BID": item.batchid,
                "QTY": item.IssQty,
                "PID": item.PackId,
                "UID": item.UID,
                "UMRP": item.MRP
            }
        });

        const payload = {
            "IssueID": this.IssueID,
            "IndentIssueSLNO": "",
            "TransfertoDeptID": this.departmentalSaleForm.get('transferTo').value,
            "IndentID": "0",
            "Status": "4",
            "IssueType": "DA",
            "ReferenceNo": this.departmentalSaleForm.get('requestor').value,
            "Items": items,
            "UserID": this.doctorDetails[0]?.UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospitalID,
        }

        this.us.post(departmentalSale.SaveDepartmentSale, payload).subscribe((response) => {
            if (response.Code === 200) {
                this.clearForm();
                this.FetchDeptSales();
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

    viewDeptSales() {
        $('#deptSalesViewModal').modal('show');
    }

    onDateChange() {
        if (this.viewDeptSaleForm.value['fromDate'] && this.viewDeptSaleForm.value['toDate']) {
            this.FetchDeptSales();
        }
    }

    onDeptSaleItemSelect(order: any) {
        $('#deptSalesViewModal').modal('hide');
        this.clearForm();
        const url = this.us.getApiUrl(departmentalSale.FetchDepartmentSalesDetails, {
            IssueID: order.IssueID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                const saleDetails = response.FetchDepartmentSalesData1DetailsList[0];
                this.IssueID = order.IssueID;
                this.departmentalSaleForm.patchValue({
                    transferToName: saleDetails.ToDepartment,
                    transferTo: saleDetails.ToDeptID,
                    requestor: saleDetails.ReferenceNo,
                    dateTime: moment(order.IssueDate).format('DD-MMM-YYYY'),
                    issueNo: saleDetails.ORDERSLNO
                });

                response.FetchDepartmentSalesDetailsDataList.forEach((item: any) => {
                    item.ItemId = item.ItemID;
                    item.batchid = item.BatchID;
                    item.PackId = item.PackID;
                    item.unitsList = response.FetchIndentItemUnitsalesMDataList.filter((unit: any) => unit.ItemID.toString() === item.ItemID.toString());
                    this.selectedItems.push(item);
                });
            }

        }, (err) => {
        })
    }

    deleteItem(index: any) {
        this.selectedItems.splice(index, 1);
    }

    FetchDeptSales() {
        this.FetchDeptSalesDataList = [];
        const url = this.us.getApiUrl(departmentalSale.FetchDeptSalesOrdersIssueDetails, {
            FromDate: moment(this.viewDeptSaleForm.get('fromDate').value).format('DD-MMM-YYYY'),
            ToDate: moment(this.viewDeptSaleForm.get('toDate').value).format('DD-MMM-YYYY'),
            FromDeptID: this.facilityId,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchDeptSalesDataList = response.FetchDeptSalesOrdersIssueDetailsDataList;
            }
        },
            (err) => {
            });
    }

    getUOMValue(item: any) {
        if (item.UID) {
            return item.unitsList.find((e: any) => e.UoMID === item.UID)?.FullUoM
        }
        return '';
    }

    getMRPValue(item: any) {
        if (this.IssueID) {
            return item.MRP;
        } else if (item.UID) {
            return Number(item.unitsList.find((e: any) => e.UoMID === item.UID)?.UnitMRP).toFixed(2);
        }
    }

    getAmountValue(item: any) {
        if (this.IssueID) {
            return item.Amount;
        } else if (item.UID && item.IssQty) {
            const mrpValue = item.unitsList.find((e: any) => e.UoMID === item.UID)?.UnitMRP;
            return (Number(mrpValue) * item.IssQty).toFixed(2);
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
                    if (item.UID && item.IssQty) {
                        const mrpValue = item.unitsList.find((e: any) => e.UoMID === item.UID)?.UnitMRP;
                        totalValue += Number((Number(mrpValue) * item.IssQty).toFixed(2));
                    }
                })
            }
        }
        return totalValue;
    }

    onQuantityChange(event: any, item: any) {
        if (event.target.value > Number(item.Qty)) {
            this.errorMessages = ['Issuing quantity cannot be greater than available quantity']
            $('#errorMessagesModal').modal('show');
        }
    }
}

export const departmentalSale = {
    FetchIndentTransferTo: 'FetchIndentTransferTo?Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentDepartmentItemSmartSearch: 'FetchIndentDepartmentItemSmartSearch?Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentDepartmentItemSelected: 'FetchIndentDepartmentItemSelected?ItemID=${ItemID}&ItemName=${ItemName}&TransfertoName=${TransfertoName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveDepartmentSale: 'SaveDepartmentSale',
    FetchDeptSalesOrdersIssueDetails: 'FetchDeptSalesOrdersIssueDetails?FromDate=${FromDate}&ToDate=${ToDate}&FromDeptID=${FromDeptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchDepartmentSalesDetails: 'FetchDepartmentSalesDetails?IssueID=${IssueID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentItemSmartSearch: 'FetchIndentItemSmartSearch?Filter=${Filter}&FromWokstationID=${FromWokstationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
}