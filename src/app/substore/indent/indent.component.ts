import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;

@Component({
    selector: 'app-indent',
    templateUrl: './indent.component.html',
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
export class IndentComponent extends BaseComponent implements OnInit {
    fetchIndenttypeDataList: any = [];
    indentToList: any = [];
    locationList: any = [];
    indentForm: any;
    viewIndentForm: any;
    itemsList: any = [];
    multiItemsList: any = [];
    totalItemsCount: any = 0;
    searchString: any = '';
    currentPage: any = 1;
    selectedMultiItemsList: any = [];
    errorMessages: any = [];
    selectedItems: any = [];
    selectedFilteredItems: any = [];
    IndentID: any = 0;
    FetchIndentOrdersDataList: any = [];
    facility: any;
    FetchUserFacilityDataList: any;
    refreshHeader: boolean = true;
    showSelectedMultipleItems: boolean = false;
    showIndentRemarks = false;
    constructor(private bedconfig: BedConfig, private us: UtilityService, private formBuilder: FormBuilder, private config: ConfigService, private router: Router, private modalSvc: NgbModal) {
        super();
        this.viewIndentForm = this.formBuilder.group({
            fromDate: new Date(),
            toDate: new Date()
        });
    }

    initializeForm() {
        this.indentForm = this.formBuilder.group({
            indentType: 0,
            indentNo: [{ value: '', disabled: true }],
            indentToName: '',
            indentTo: '',
            indentDate: [{ value: new Date(), disabled: true }],
            indentLocation: this.hospitalID,
            indentRefNo: '',
            deliveryDate: new Date(),
            priority: '3',
            deliveryTime: this.getCurrentTime(),
            ROI: '2',
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

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.initializeForm();
        //this.FetchHospitalLocations();
        this.FetchHospitalAllLocations();
        this.FetchIndenttype();
        this.FetchIndentOrders();
        this.fetchUserFacility();
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
    FetchHospitalAllLocations() {
        const url = this.us.getApiUrl(indent.FetchAllHospitalsIndent, {
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.locationList = response.FetchAllHospitalsIndentDataList;
            }
        },
            (err) => {
            });
    }

    FetchIndenttype() {
        const url = this.us.getApiUrl(indent.FetchIndenttype, {
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.fetchIndenttypeDataList = response.FetchIndenttypeDataList;
                this.indentForm.patchValue({
                    indentType: this.fetchIndenttypeDataList[1]?.ID
                });
            }
        },
            (err) => {
            });
    }

    searchIndentTo(event: any) {
        if (this.indentForm.get('indentLocation').value.toString() === '0') {
            this.indentForm.patchValue({
                indentToName: ''
            });
            this.errorMessages = [];
            this.errorMessages.push('Please select Location');
            $('#errorMessagesModal').modal('show');
            return;
        }
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(indent.FetchIndentTo, {
                Filter: searchval,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facility.FacilityID,
                HospitalID: this.indentForm.get('indentLocation').value
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.indentToList = response.FetchIndentToDataList;
                    }
                },
                    () => {
                    })
        }
    }

    selectIndentTo(event: any) {
        //TO CHECK IF INDENTS RAISED BEFORE ARE ACKNOWLEDGED or NOT
        const item = this.indentToList.find((x: any) => x.FacilityName === event.option.value);

        const url = this.us.getApiUrl(indent.FetchIndentordersIssuesForReceipts, {
            IndentFrom: this.wardID,
            IndentTo: item.FacilityID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.indentForm.get('indentLocation').value
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200 && response.FetchIndentordersIssuesForReceiptsDataList.length > 0) {
                    this.errorMessages = [];
                    this.errorMessages.push('Acknowledgement pending for the below Indent Issue(s).');
                    response.FetchIndentordersIssuesForReceiptsDataList.forEach((element: any) => {
                        this.errorMessages.push(element.IssueNo + ' | ' + moment(element.Issuedate).format('DD-MMM-YYYY'));
                    });
                    this.indentForm.patchValue({
                        indentToName: '',
                        indentTo: ''
                    });
                    this.indentToList = [];
                    $('#errorMessagesModal').modal('show');
                    return;
                }
                else {
                    this.indentForm.patchValue({
                        indentToName: item.FacilityName,
                        indentTo: item.FacilityID
                    });
                    this.indentToList = [];
                }
            },
                () => {
                });
    }

    setPriority(value: any) {
        this.indentForm.patchValue({
            priority: value
        });
    }
    setROI(value: any) {
        this.itemsList = [];
        if (this.indentForm.get("indentTo")?.value === '') {
            this.errorMessages = [];
            this.errorMessages.push('Please select Indent To');
            $('#errorMessagesModal').modal('show');
            return;
        }
        this.indentForm.patchValue({
            ROI: value
        });
        if (value != '2') {
            this.selectItemROI(value);
        }
        else {
            this.selectedItems = this.selectedFilteredItems = [];
        }
    }

    searchItems(event: any) {
        if (!this.indentForm.get('indentTo').value) {
            $('#drugNameText').val('');
            this.errorMessages = [];
            this.errorMessages.push('Please select Indent To');
            $('#errorMessagesModal').modal('show');
            return;
        }
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(indent.FetchIndentItemSmartSearch, {
                Filter: searchval,
                FromWokstationID: this.indentForm.get('indentTo').value,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facility.FacilityID,
                HospitalID: this.indentForm.get('indentLocation').value
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

    selectItem(item: any) {
        this.itemsList = [];
        this.errorMessages = [];
        const alreadyExists = this.selectedItems.some((selected: any) => selected.ItemID === item.ItemID);
        if (alreadyExists) {
            this.errorMessages.push(item.DisplayName + ' Already selected');
            $('#errorMessagesModal').modal('show');
            return;
        }

        const url = this.us.getApiUrl(indent.FetchIndentItem, {
            ItemID: item.ItemID,
            FromWokstationID: this.indentForm.get('indentTo').value,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.indentForm.get('indentLocation').value
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200 && response.FetchIndentItemDataList.length > 0) {
                    $('#drugNameText').val('');
                    const item = response.FetchIndentItemDataList[0];
                    item.quantity = '';
                    item.remarks = '';
                    item.unitsList = response.FetchIndentItemUnitsDataList;
                    item.unit = item.unitsList[0].UoMID;
                    this.onUnitChange(item);
                    this.selectedItems.push(item);
                    this.selectedFilteredItems = this.selectedItems;
                }
            },
                () => {
                });
    }
     onUnitChange(item: any) {
        const selectedUnit = item.unitsList.find((a: any) => a.UoMID === item.unit);
        if (selectedUnit) {
            item.QOH = selectedUnit.QOH;
            item.ToQOH = selectedUnit.ToQOH;
            item.Qty = '';
        }
    }

    selectItemROI(TypeROL: any) {
        this.itemsList = [];
        const url = this.us.getApiUrl(indent.FetchIndentItemROL, {
            TypeROL: TypeROL,
            ItemID: 0,
            FromWokstationID: this.indentForm.get('indentTo').value,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.indentForm.get('indentLocation').value
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200 && response.FetchIndentItemDataList.length > 0) {
                    $('#drugNameText').val('');
                    // const item = response.FetchIndentItemDataList[0];
                    // item.quantity = '';
                    // item.remarks = '';
                    // item.unitsList = response.FetchIndentItemUnitsDataList;
                    // item.unit = item.unitsList[item.unitsList.length - 1].UoMID;
                    // this.selectedItems.push(item);
                    response.FetchIndentItemDataList.forEach((element: any, index: any) => {
                        const item = element;
                        item.quantity = element.ReqQty;
                        item.remarks = '';
                        const itemuomList = response.FetchIndentItemUnitsDataList.filter((x: any) => x.ItemID === element.ItemID);
                        item.unitsList = itemuomList;
                        item.unit = item.unitsList[0].UoMID;
                        this.selectedItems.push(item);
                    });
                    this.selectedFilteredItems = this.selectedItems;
                }
            },
                () => {
                });
    }

    searchMultiItems(event: any, min: number = 1, max: number = 10, currentPage: number = 1) {
        const searchval = event.target.value;
        if (searchval.length > 2) {
            this.searchString = searchval;
            const url = this.us.getApiUrl(indent.FetchIndentItemSmartSearchPage, {
                Filter: searchval,
                FromWokstationID: this.indentForm.get('indentTo').value,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facility.FacilityID,
                HospitalID: this.indentForm.get('indentLocation').value,
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
    loadSelectedMultiItems() {
        this.itemsList = [];
        this.selectedMultiItemsList.forEach((item: any) => {
            const itemExist = this.selectedItems.filter((x: any) => x.ItemID == item.ItemID);
            if (itemExist.length > 0) {
                this.errorMessages = [];
                this.errorMessages.push(item.DisplayName + ' Already selected');
                $('#errorMessagesModal').modal('show');
                return;
            }
            const url = this.us.getApiUrl(indent.FetchIndentItem, {
                ItemID: item.ItemID,
                FromWokstationID: this.indentForm.get('indentTo').value,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facility.FacilityID,
                HospitalID: this.indentForm.get('indentLocation').value
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200 && response.FetchIndentItemDataList.length > 0) {
                        $('#drugNameText').val('');
                        const item = response.FetchIndentItemDataList[0];
                        item.quantity = '';
                        item.remarks = '';
                        item.unitsList = response.FetchIndentItemUnitsDataList;
                        item.unit = item.unitsList[0].UoMID;
                        this.selectedItems.push(item);
                        this.selectedFilteredItems = this.selectedItems;
                        $('#multipleItemsModal').modal('hide');
                    }
                },
                    () => {
                    });
        });
    }


    onSaveClick() {
        this.errorMessages = [];
        if (this.indentForm.get('indentType').value.toString() === '0') {
            this.errorMessages.push('Please select Indent Type');
        }

        if (this.indentForm.get('indentLocation').value.toString() === '0') {
            this.errorMessages.push('Please select Location');
        }

        if (this.indentForm.get('indentRefNo').value.toString() === '') {
            this.errorMessages.push('Please enter Ref No');
        }

        if (!this.indentForm.get('indentTo').value) {
            this.errorMessages.push('Please select Indent To');
        }

        if (this.selectedItems.length === 0) {
            this.errorMessages.push('Please add Items');
        }

        if (this.selectedItems.length > 0) {
            const isItemsInvalid = this.selectedItems.find((item: any) => item.quantity.trim() === '');
            if (isItemsInvalid) {
                this.errorMessages.push('Please Enter Required Quantity');
            }
        }

        if (this.errorMessages.length > 0) {
            $('#errorMessagesModal').modal('show');
            return;
        }

        const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
            if (data.success) {
                this.saveData();
            }
            modalRef.close();
        });
    }
    saveData() {
        const items = this.selectedItems.map((item: any, index: any) => {
            return {
                "SNO": index + 1,
                "IID": item.ItemID,
                "QTY": item.quantity,
                "PID": item.PID,
                "UID": item.unit,
                "REM": item.remarks,
                "AOQ": item.quantity,
                "AOUOM": item.unit
            }
        });

        const payload = {
            "IndentID": this.IndentID,
            "FromDeptID": this.facility.FacilityID,
            "ToDeptID": this.indentForm.get('indentTo').value,
            "IndentType": this.indentForm.get('indentType').value,
            "ReferenceNo": this.indentForm.get('indentRefNo').value,
            "IndentDate": moment(this.indentForm.get('indentDate').value).format('DD-MMM-YYYY HH:mm'),
            "DeliveryBy": moment(this.indentForm.get('deliveryDate').value).format('DD-MMM-YYYY') + ' ' + this.indentForm.get('deliveryTime').value,
            "Items": items,
            "UserID": this.doctorDetails[0]?.UserId,
            "WorkStationID": this.facility.FacilityID,
            "priority": this.indentForm.get('priority').value,
            "DraftIndentID": "0",
            "HospitalID": this.indentForm.get('indentLocation').value,
        };

        this.us.post(indent.SaveIndentOrder, payload).subscribe((response) => {
            if (response.Code === 200) {
                this.clearForm();
                this.FetchIndentOrders();
                $("#successMsgModal").modal('show');
            }
        },
            (err) => {
                console.log(err)
            });
    }

    FetchIndentOrders() {
        this.FetchIndentOrdersDataList = [];
        const url = this.us.getApiUrl(indent.FetchIndentOrders, {
            FromDate: moment(this.viewIndentForm.get('fromDate').value).format('DD-MMM-YYYY'),
            ToDate: moment(this.viewIndentForm.get('toDate').value).format('DD-MMM-YYYY'),
            FromDeptID: this.facility.FacilityID,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchIndentOrdersDataList = response.FetchIndentOrdersDataList;
            }
        },
            (err) => {
            });
    }

    clearForm() {
        this.IndentID = 0;
        this.showIndentRemarks = false;
        $("#txtdelteRemarks").val('');
        this.selectedItems = this.selectedFilteredItems = [];
        this.indentForm.enable();
        this.initializeForm();
        $('#drugNameText').val('');
        $("#itemSearchText").val('');
    }

    viewOrders() {
        $('#indentViewModal').modal('show');
    }

    onIndentOrderSelect(order: any) {
        $('#indentViewModal').modal('hide');
        this.clearForm();
        const url = this.us.getApiUrl(indent.FetchIndentOrdersDetails, {
            IndentID: order.IndentID,
            status: order.Status,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.indentForm.disable();
                this.IndentID = order.IndentID;
                const FetchIndentItemWiseDetailsDataList = response.FetchIndentItemWiseDetailsDataList[0];
                this.indentForm.patchValue({
                    indentType: FetchIndentItemWiseDetailsDataList.IndentType,
                    indentNo: FetchIndentItemWiseDetailsDataList.IndentSlNo,
                    indentToName: FetchIndentItemWiseDetailsDataList.ToDepartment,
                    indentTo: FetchIndentItemWiseDetailsDataList.ToDeptID,
                    indentDate: moment(FetchIndentItemWiseDetailsDataList.IndentDate),
                    indentLocation: FetchIndentItemWiseDetailsDataList.ToHospitalID,
                    indentRefNo: FetchIndentItemWiseDetailsDataList.ReferenceNo,
                    deliveryDate: moment(FetchIndentItemWiseDetailsDataList.DeliveryBy.split(' ')[0]),
                    priority: order.priority,
                    deliveryTime: FetchIndentItemWiseDetailsDataList.DeliveryBy.split(' ')[1]
                });

                response.FetchIndentItemDetailsDataList.forEach((item: any) => {
                    if (item.ItemID) {
                        item.quantity = item.ReqQty;
                        item.remarks = item.Remarks;
                        item.unit = item.UnitID;
                        item.unitsList = response.FetchIndentItemDetailsUnitsDataList.filter((unit: any) => unit.ItemID.toString() === item.ItemID.toString());
                        this.selectedItems.push(item);
                    }
                });
                this.selectedFilteredItems = this.selectedItems;
            }

        }, (err) => {
        })
    }
    navigatetoBedBoard() {
        this.router.navigate(['/ward']);
    }
    deleteItem(item: any) {
        const index = this.selectedItems.findIndex((element: any) => element.ItemCode === item.ItemCode);
        if (index !== -1) {
            this.selectedItems.splice(index, 1);
        }
        this.selectedFilteredItems = this.selectedItems;
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
            this.FetchIndentOrders();
            this.clearForm();
            this.refreshHeader = false;
            setTimeout(() => {
                this.refreshHeader = true;
            }, 0);
        }
    }

    openmultipleItemsModal() {
        if (this.indentForm.get("indentTo")?.value === '') {
            this.errorMessages = [];
            this.errorMessages.push('Please select Indent To');
            $('#errorMessagesModal').modal('show');
            return;
        }
        this.selectedMultiItemsList = [];
        this.multiItemsList = [];
        this.totalItemsCount = 0;
        this.searchString = '';
        this.currentPage = 0;
        $('#drugNameTextMulti').val('');
        $('#multipleItemsModal').modal('show');
    }

    showSelectedMultipleItemsClick() {
        this.showSelectedMultipleItems = !this.showSelectedMultipleItems;
    }
    deleteItemFromPresc() {

        $("#deletePresItemConfirmationmodal").modal('show');
    }
    deleteItemFromPrescription(type: string) {
        if (type == "Yes") {
            if ($("#txtdelteRemarks").val() == '') {
                this.showIndentRemarks = true;
                $("#deletePresItemConfirmationmodal").modal('show');
                return;
            }
            else if ($("#txtdelteRemarks").val() != '') {
                var DeleteRemarks = $("#txtdelteRemarks").val();
                const url = this.us.getApiUrl(indent.DeleteIndentOrder, {
                    IndentID: this.IndentID,
                    Remarks: DeleteRemarks,
                    UserID: this.doctorDetails[0]?.UserId,
                    WorkStationID: this.facility.FacilityID,
                    HospitalID: this.hospitalID
                });
                this.us.get(url).subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.clearForm();
                        this.FetchIndentOrders();
                        $("#DeleteMsgModal").modal('show');
                    }
                },
                    (err) => {
                    });
            }
        }
    }

    handlePageChange(event: any) {
        this.searchMultiItems({
            target: {
                value: this.searchString
            }
        }, event.min, event.max, event.currentPage);
    }


    onSearchTextChange(event: any) {
        const searchText = event.target.value;
        this.selectedFilteredItems = this.selectedItems.filter((element: any) => element.DisplayName.toLowerCase().indexOf(searchText.toLowerCase()) > -1)
    }
}

export const indent = {
    FetchIndenttype: 'FetchIndenttype?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentTo: 'FetchIndentTo?Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentItemSmartSearch: 'FetchIndentItemSmartSearch?Filter=${Filter}&FromWokstationID=${FromWokstationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentItemSmartSearchPage: 'FetchIndentItemSmartSearchPage?min=${min}&max=${max}&Filter=${Filter}&FromWokstationID=${FromWokstationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentItem: 'FetchIndentItem?ItemID=${ItemID}&FromWokstationID=${FromWokstationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveIndentOrder: 'SaveIndentOrder',
    FetchIndentOrders: 'FetchIndentOrders?FromDate=${FromDate}&ToDate=${ToDate}&FromDeptID=${FromDeptID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentOrdersDetails: 'FetchIndentOrdersDetails?IndentID=${IndentID}&status=${status}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchAllHospitalsIndent: 'FetchAllHospitalsIndent?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    DeleteIndentOrder: 'DeleteIndentOrder?IndentID=${IndentID}&Remarks=${Remarks}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentItemROL: 'FetchIndentItemROL?TypeROL=${TypeROL}&ItemID=${ItemID}&FromWokstationID=${FromWokstationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentordersIssuesForReceipts: 'FetchIndentordersIssuesForReceipts?IndentFrom=${IndentFrom}&IndentTo=${IndentTo}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}