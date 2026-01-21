import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';

declare var $: any;

@Component({
    selector: 'app-adjustments',
    templateUrl: './adjustments.component.html',
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
export class AdjustmentsComponent extends BaseComponent implements OnInit {
    adjustmentsForm: any;
    viewAdjustmentsForm: any;
    itemsList: any = [];
    errorMessages: any = [];
    selectedItems: any = [];
    ConsumptionID: any = 0;
    facility: any;
    facilityId: any;
    adjustmentsDataList: any = [];
    FetchUserFacilityDataList: any = [];
    refreshHeader: boolean = true;
    employeeList: any;
    allUnitsList: any;
    selectedMultiItemsList: any = [];
    multiItemsList: any = [];
    totalItemsCount: any = 0;
    searchString: any = '';
    currentPage: any = 0;
    showSelectedMultipleItems: boolean = false;

    constructor(private us: UtilityService, private formBuilder: FormBuilder, private config: ConfigService, private bedconfig: BedConfig, private modalSvc: NgbModal) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 1);
        this.viewAdjustmentsForm = this.formBuilder.group({
            fromDate,
            toDate: new Date()
        });
        this.initializeForm();
        this.FetchAdjustments();
        this.fetchUserFacility();
    }

    initializeForm() {
        this.adjustmentsForm = this.formBuilder.group({
            dateTime: [{ value: moment().format('DD-MMM-YYYY HH:mm'), disabled: true }],
            refNo: '',
            authorizedByText: '',
            authorizedBy: '',
            adjustmentNo: [{ value: '', disabled: true }],
            type: '1'
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
            this.FetchAdjustments();
            setTimeout(() => {
                this.refreshHeader = true;
            }, 0);
        }
    }

    searchEmployee(event: any) {
        if (event.target.value.length > 2) {
            const url = this.us.getApiUrl(adjustments.FetchSSEmployees, { name: event.target.value, UserId: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.employeeList = response.FetchSSEmployeesDataList;
                    }
                },
                    (err) => {
                    });
        }
    }

    onEmployeeSelected(item: any) {
        this.employeeList = [];
        const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
            backdrop: 'static'
        });
        modalRef.componentInstance.data = {
            UserName: item.EmpNo
        };
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
            if (data.success) {
                this.adjustmentsForm.patchValue({
                    authorizedByText: item.Name,
                    authorizedBy: item
                });
            } else {
                this.adjustmentsForm.patchValue({
                    authorizedByText: '',
                    authorizedBy: ''
                });
            }
            modalRef.close();
        });
    }

    onTypeSlection(value: any) {
        if (this.adjustmentsForm.get('type').value !== value) {
            this.selectedItems = [];
            this.adjustmentsForm.patchValue({
                type: value
            });
        }
    }

    searchItemsOld(event: any) {
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(adjustments.FetchIndentDepartmentAdjustmentsSelected, {
                DisplayName: searchval,
                Type: this.adjustmentsForm.get('type').value,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.itemsList = response.FetchIndentDepartmentAdjustmentsSelectedDataList.filter((item: any) => item.ItemId);
                        this.allUnitsList = response.FetchIndentItemUnitsDMDataList;
                    }
                },
                    () => {
                    });
        }
    }

    searchItems(event: any) {
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(adjustments.FetchIndentItemSmartSearchAdjustment, {
                Filter: searchval,
                Type: this.adjustmentsForm.get('type').value,
                FromWokstationID: this.facilityId,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.itemsList = response.FetchIndentItemSmartSearchDataList.filter((item: any) => item.ItemID);
                    }
                },
                    () => {
                    });
        }
    }

    selectItemOld(element: any) {
        setTimeout(() => {
            $('#itemText').val('');
        }, 0);
        const unitsList = this.allUnitsList.filter((unit: any) => unit.ItemID === element.ItemId);
        element.unitsList = unitsList;
        this.onUnitChange(element);
        this.selectedItems.push(element);
        this.itemsList = [];
        this.allUnitsList = [];
    }

    selectItem(element: any) {
        this.itemsList = [];
        const url = this.us.getApiUrl(adjustments.FetchIndentDepartmentAdjustmentsSelected, {
            DisplayName: element.ItemID,
            Type: this.adjustmentsForm.get('type').value,
            BatchID: element.BatchID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200 && response.FetchIndentDepartmentAdjustmentsSelectedDataList.length > 0) {
                    $('#itemText').val('');
                    const item = response.FetchIndentDepartmentAdjustmentsSelectedDataList[0];
                    const isItemExist = this.selectedItems.filter((x: any) => x.ItemId == item.ItemId && x.Batchid == item.Batchid);
                    if (isItemExist.length > 0) {
                        this.errorMessages = [];
                        this.errorMessages.push('Item Already selected');
                        $('#errorMessagesModal').modal('show');
                        return;
                    }
                    item.unitsList = response.FetchIndentItemUnitsDMDataList;
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
        const selectedUnit = item.unitsList.find((a: any) => a.UoMID == item.UID);
        if (selectedUnit) {
            item.QOH = selectedUnit.QOH;
            item.Qty = '';
        }
    }

    onQuantityChange(event: any, item: any) {
        if (this.adjustmentsForm.get('type').value == '1') {
            if (event.target.value > Number(item.QOH)) {
                this.errorMessages = ['Quantity cannot be greater than available quantity']
                $('#errorMessagesModal').modal('show');
                item.Qty = '';
            }
        }

    }

    onSaveClick() {
        this.errorMessages = [];

        if (this.adjustmentsForm.get('refNo').value.toString() === '') {
            this.errorMessages.push('Please Enter Ref No');
        }

        if (this.selectedItems.length === 0) {
            this.errorMessages.push('Please add Items');
        }
        if (this.adjustmentsForm.get('type').value == '1') {
            if (this.selectedItems.length > 0) {
                const isItemsInvalid = this.selectedItems.filter((item: any) => !item.Qty);
                if (isItemsInvalid.length > 0) {
                    this.errorMessages.push('Please Enter Quantity for Items');
                }

                const isQuantityMore = this.selectedItems.filter((item: any) => item.Qty && (Number(item.Qty) > Number(item.QOH)));

                if (isQuantityMore.length > 0) {
                    this.errorMessages.push('Issuing quantity cannot be greater than available quantity');
                }
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
                "BID": item.Batchid,
                "QTY": item.Qty,
                "PID": item.PackId,
                "UID": item.UID,
                "RMK": item.Remarks
            }
        });

        const payload = {
            "ConsumptionID": this.ConsumptionID,
            "ReferenceNo": this.adjustmentsForm.get('refNo').value,
            "Type": this.adjustmentsForm.get('type').value,
            "AuthorisedBy": this.adjustmentsForm.get('authorizedBy').value ? this.adjustmentsForm.get('authorizedBy').value.ID : '0',
            "Items": items,
            "UserID": this.doctorDetails[0]?.UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospitalID,
        }

        this.us.post(adjustments.SaveItemsAdjustment, payload).subscribe((response) => {
            if (response.Code === 200) {
                this.clearForm();
                this.FetchAdjustments();
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

    viewAdjustments() {
        $('#adjustmentsViewModal').modal('show');
    }

    onDateChange() {
        if (this.viewAdjustmentsForm.value['fromDate'] && this.viewAdjustmentsForm.value['toDate']) {
            this.FetchAdjustments();
        }
    }

    onConsumptionItemSelect(order: any) {
        $('#adjustmentsViewModal').modal('hide');
        this.clearForm();
        const url = this.us.getApiUrl(adjustments.FetchDepartmentConsumptionDetails, {
            IssueID: order.IssueID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                const details = response.FetchDepartmentConsumData1DetailsList[0];
                this.ConsumptionID = details.IsuueID;
                this.adjustmentsForm.patchValue({
                    dateTime: details.IssueDate,
                    refNo: details.ReferenceNo,
                    authorizedByText: details.AuthorisedBy,
                    adjustmentNo: details.ORDERSLNO,
                    type: details.IssueType == 'AR' ? '2' : '1'
                });

                response.FetchDepartmentConsumpDetailsDataList.forEach((item: any) => {
                    item.unitsList = response.FetchIndentItemUnitConsumMDataList.filter((unit: any) => unit.ItemID.toString() === item.ItemID.toString());
                    item.ItemName = item.DisplayName;
                    item.UID = item.UoMID;
                    item.Qty = item.Quantity;
                    const selectedUnit = item.unitsList.find((unit: any) => unit.UoMID === item.UoMID);
                    item.QOH = selectedUnit.QOH;
                    item.Remarks = item.REMARKS;
                    this.selectedItems.push(item);
                });
            }

        }, (err) => {
        })
    }

    deleteItem(index: any) {
        this.selectedItems.splice(index, 1);
    }

    FetchAdjustments() {
        this.adjustmentsDataList = [];
        const url = this.us.getApiUrl(adjustments.FetchItemAdjustDetails, {
            FromDate: moment(this.viewAdjustmentsForm.get('fromDate').value).format('DD-MMM-YYYY'),
            ToDate: moment(this.viewAdjustmentsForm.get('toDate').value).format('DD-MMM-YYYY'),
            FromDeptID: this.facilityId,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.adjustmentsDataList = response.FetchDeptConsumptionOrdersIssueDetailsDataList;
            }
        },
            (err) => {
            });
    }

    openmultipleItemsModal() {
        this.selectedMultiItemsList = [];
        this.multiItemsList = [];
        this.totalItemsCount = 0;
        this.searchString = '';
        this.currentPage = 0;
        this.showSelectedMultipleItems = false;
        $('#multiSearchText').val('');
        $('#multipleItemsModal').modal('show');
    }

    loadSelectedMultiItems() {
        $('#multipleItemsModal').modal('hide');
        this.selectedMultiItemsList.forEach((item: any) => {
            const itemExist = this.selectedItems.filter((x: any) => x.ItemId == item.ItemID && x.Batchid === item.BatchID);
            if (itemExist.length > 0) {
                this.errorMessages = [];
                this.errorMessages.push(item.DisplayName + ' Already selected');
                $('#errorMessagesModal').modal('show');
                return;
            }
            const url = this.us.getApiUrl(adjustments.FetchIndentDepartmentAdjustmentsSelected, {
                DisplayName: item.ItemID,
                Type: this.adjustmentsForm.get('type').value,
                BatchID: item.BatchID,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200 && response.FetchIndentDepartmentAdjustmentsSelectedDataList.length > 0) {
                        const item = response.FetchIndentDepartmentAdjustmentsSelectedDataList[0];
                        item.unitsList = response.FetchIndentItemUnitsDMDataList;
                        this.onUnitChange(item);
                        this.selectedItems.push(item);                        
                    }
                },
                    () => {
                    });
        });
    }

    searchMultiItems(event: any, min: number = 1, max: number = 10, currentPage: number = 1) {
        const searchval = event.target.value;
        if (searchval.length > 2) {
            this.searchString = searchval;
            const url = this.us.getApiUrl(adjustments.FetchIndentItemSmartSearchAdjustmentPage, {
                Filter: searchval,
                FromWokstationID: this.facilityId,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID,
                Type: this.adjustmentsForm.get('type').value,
                min,
                max
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.currentPage = currentPage;
                        this.totalItemsCount = Number(response.FetchIndentItemSmartSearchDataCountList[0]?.Count);
                        this.multiItemsList = response.FetchIndentItemSmartSearchDataList;
                        if (this.selectedMultiItemsList.length > 0) {
                            this.multiItemsList.forEach((element: any) => {
                                const elementFound = this.selectedMultiItemsList.find((x: any) => x.ItemID === element.ItemID);
                                if (elementFound) {
                                    element.selected = true;
                                }
                            });
                        }
                    }
                },
                    () => {
                    });
        } else {
            this.totalItemsCount = 0;
            this.multiItemsList = [];
            this.currentPage = 0;
        }
    }

    selectMultiItem(item: any) {
        item.selected = !item.selected;
        if (item.selected) {
            this.selectedMultiItemsList.push(item);
        }
        else {
            this.selectedMultiItemsList.splice(this.selectedMultiItemsList.indexOf(item), 1);
        }
    }

    handlePageChange(event: any) {
        this.searchMultiItems({
            target: {
                value: this.searchString
            }
        }, event.min, event.max, event.currentPage);
    }

    showSelectedMultipleItemsClick() {
        this.showSelectedMultipleItems = !this.showSelectedMultipleItems;
    }
}

export const adjustments = {
    FetchIndentDepartmentAdjustmentsSelected: 'FetchIndentDepartmentAdjustmentsSelected?DisplayName=${DisplayName}&Type=${Type}&BatchID=${BatchID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveItemsAdjustment: 'SaveItemsAdjustment',
    FetchItemAdjustDetails: 'FetchItemAdjustDetails?FromDate=${FromDate}&ToDate=${ToDate}&FromDeptID=${FromDeptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchDepartmentConsumptionDetails: 'FetchDepartmentConsumptionDetails?IssueID=${IssueID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchSSEmployees: "FetchSSEmployees?name=${name}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    //FetchIndentItemSmartSearch: 'FetchIndentItemSmartSearch?Filter=${Filter}&FromWokstationID=${FromWokstationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentItemSmartSearchAdjustment: 'FetchIndentItemSmartSearchAdjustment?Filter=${Filter}&Type=${Type}&FromWokstationID=${FromWokstationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentItemSmartSearchAdjustmentPage: 'FetchIndentItemSmartSearchAdjustmentPage?min=${min}&max=${max}&Filter=${Filter}&Type=${Type}&FromWokstationID=${FromWokstationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}