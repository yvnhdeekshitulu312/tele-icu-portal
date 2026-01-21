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
    selector: 'app-store-consumption',
    templateUrl: './store-consumption.component.html',
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
export class StoreConsumptionComponent extends BaseComponent implements OnInit {
    storeConsumptionForm: any;
    viewStoreConsumptionForm: any;
    itemsList: any = [];
    errorMessages: any = [];
    selectedItems: any = [];
    ConsumptionID: any = 0;
    facility: any;
    facilityId: any;
    consumptionDataList: any = [];
    FetchUserFacilityDataList: any = [];
    refreshHeader: boolean = true;

    constructor(private us: UtilityService, private formBuilder: FormBuilder, private config: ConfigService, private bedconfig: BedConfig) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 1);
        this.viewStoreConsumptionForm = this.formBuilder.group({
            fromDate,
            toDate: new Date()
        });
        this.initializeForm();
        this.FetchStoresConsumption();
        this.fetchUserFacility();
    }

    initializeForm() {
        this.storeConsumptionForm = this.formBuilder.group({
            dateTime: [{ value: moment().format('DD-MMM-YYYY HH:mm'), disabled: true }],
            refNo: '',
            consumeNo: '',
            operator: [{ value: '', disabled: true }],
            surgeryOrder: [{ value: '', disabled: true }],
            surgery: [{ value: '', disabled: true }],
            barcodeNo: [{ value: '', disabled: true }]
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
            this.FetchStoresConsumption();
            setTimeout(() => {
                this.refreshHeader = true;
            }, 0);
        }
    }

    searchItems(event: any) {
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(storeConsumption.FetchIndentItemSmartSearch, {
                Filter: searchval,
                FromWokstationID: this.facilityId,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.itemsList = response.FetchIndentItemConsumSmartSearchDataList;
                    }
                },
                    () => {
                    });
        }
    }

    selectItem(element: any) {
        this.itemsList = [];
        const url = this.us.getApiUrl(storeConsumption.FetchIndentDepartmentConsumptionItemSelected, {
            ItemID: element.ItemID,
            ItemName: element.DisplayName,
            BatchID: element.BatchID,
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
                    this.onUnitChange(item);
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

    onUnitChange(item: any) {
        const selectedUnit = item.unitsList.find((a: any) => a.UoMID === item.UID);
        if (selectedUnit) {
            item.ExpiryDate = selectedUnit.ExpiryDate;
            item.Batchno = selectedUnit.BatchNo;
            item.QOH = selectedUnit.QOH;
            item.BID = selectedUnit.BID;
            item.PID = selectedUnit.PID;
            item.QOHUnit = selectedUnit.FullUoM;
            item.IssQty = '';
        }
    }

    onQuantityChange(event: any, item: any) {
        if (event.target.value > Number(item.QOH)) {
            this.errorMessages = ['Quantity cannot be greater than available quantity']
            $('#errorMessagesModal').modal('show');
        }
    }

    onSaveClick() {
        this.errorMessages = [];

        if (this.storeConsumptionForm.get('refNo').value.toString() === '') {
            this.errorMessages.push('Please Enter Ref No');
        }

        if (this.selectedItems.length === 0) {
            this.errorMessages.push('Please add Items');
        }

        if (this.selectedItems.length > 0) {
            const isItemsInvalid = this.selectedItems.filter((item: any) => !item.IssQty);
            if (isItemsInvalid.length > 0) {
                this.errorMessages.push('Please Enter Quantity for Items');
            }

            const isQuantityMore = this.selectedItems.filter((item: any) => item.IssQty && (Number(item.IssQty) > Number(item.QOH)));

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
                "SEQ": index + 1,
                "ITM": item.ItemId,
                "BID": item.BID,
                "QTY": item.IssQty,
                "PID": item.PID,
                "UID": item.UID
            }
        });

        const payload = {
            "ConsumptionID": this.ConsumptionID,
            "ReferenceNo": this.storeConsumptionForm.get('refNo').value,
            "Items": items,
            "UserID": this.doctorDetails[0]?.UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospitalID,
        }

        this.us.post(storeConsumption.SaveDepartmentStoreConsumption, payload).subscribe((response) => {
            if (response.Code === 200) {
                this.clearForm();
                this.FetchStoresConsumption();
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
        this.ConsumptionID = 0;
        this.selectedItems = [];
        this.initializeForm();
        $('#itemText').val('');
    }

    viewStoreConsumption() {
        $('#storeConsumptionViewModal').modal('show');
    }

    onDateChange() {
        if (this.viewStoreConsumptionForm.value['fromDate'] && this.viewStoreConsumptionForm.value['toDate']) {
            this.FetchStoresConsumption();
        }
    }

    onConsumptionItemSelect(order: any) {
        $('#storeConsumptionViewModal').modal('hide');
        this.clearForm();
        const url = this.us.getApiUrl(storeConsumption.FetchDepartmentConsumptionDetails, {
            IssueID: order.IssueID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                const details = response.FetchDepartmentConsumData1DetailsList[0];
                this.ConsumptionID = details.IsuueID;
                this.storeConsumptionForm.patchValue({
                    dateTime: details.IssueDate,
                    refNo: details.ReferenceNo
                });

                response.FetchDepartmentConsumpDetailsDataList.forEach((item: any) => {
                    item.unitsList = response.FetchIndentItemUnitConsumMDataList.filter((unit: any) => unit.ItemID.toString() === item.ItemID.toString());
                    item.ItemName = item.DisplayName;
                    item.Batchno = item.BatchNo;
                    item.UID = item.UoMID;
                    item.IssQty = item.Quantity;
                    const selectedUnit = item.unitsList.find((unit: any) => unit.UoMID === item.UoMID);
                    item.QOH = selectedUnit.QOH;
                    item.QOHUnit = selectedUnit.FullUoM;
                    this.selectedItems.push(item);
                });
            }

        }, (err) => {
        })
    }

    deleteItem(index: any) {
        this.selectedItems.splice(index, 1);
    }

    FetchStoresConsumption() {
        this.consumptionDataList = [];
        const url = this.us.getApiUrl(storeConsumption.FetchDeptConsumptionOrdersIssueDetails, {
            FromDate: moment(this.viewStoreConsumptionForm.get('fromDate').value).format('DD-MMM-YYYY'),
            ToDate: moment(this.viewStoreConsumptionForm.get('toDate').value).format('DD-MMM-YYYY'),
            FromDeptID: this.facilityId,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.consumptionDataList = response.FetchDeptConsumptionOrdersIssueDetailsDataList;
            }
        },
            (err) => {
            });
    }
}

export const storeConsumption = {
    FetchIndentDepartmentItemSmartSearch: 'FetchIndentDepartmentItemSmartSearch?Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentDepartmentConsumptionItemSelected: 'FetchIndentDepartmentConsumptionItemSelected?ItemID=${ItemID}&ItemName=${ItemName}&BatchID=${BatchID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveDepartmentStoreConsumption: 'SaveDepartmentStoreConsumption',
    FetchDeptConsumptionOrdersIssueDetails: 'FetchDeptConsumptionOrdersIssueDetails?FromDate=${FromDate}&ToDate=${ToDate}&FromDeptID=${FromDeptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchDepartmentConsumptionDetails: 'FetchDepartmentConsumptionDetails?IssueID=${IssueID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentItemSmartSearch: 'FetchIndentItemConsumSmartSearch?Filter=${Filter}&FromWokstationID=${FromWokstationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
}