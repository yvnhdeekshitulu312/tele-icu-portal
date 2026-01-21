import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-item-sub-store',
    templateUrl: './item-sub-store.component.html',
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
export class ItemSubStoreComponent extends BaseComponent implements OnInit {
    facility: any;
    facilityId: any;
    viewForm: any;
    itemsList: any = [];
    selectedItem: any = {};
    issueTypeList: any;
    DefaultUnitID: any;
    packingList: any = [];
    isItemSelected: boolean = false;
    rackItems: any = [];
    selectedRacks: any = [];
    errorMessages: any = [];
    stockDetails: any = [];
    stockItemDetails: any = [];
    stockItemSelectAll: boolean = false;

    filterTypeList = [
        { label: 'Starts With', id: 1 },
        { label: 'Contains', id: 2 },
        { label: 'Ends With', id: 3 },
        { label: 'Equals', id: 4 }
    ];

    fetchedItemsList: any = [];
    itemCodeSearchText: any;
    itemNameSearchText: any;
    itemCodeFilterType: any = 1;
    itemNameFilterType: any = 1;
    totalItemsCount: any = 0;
    currentPage: number = 0;
    errorMsg: string = '';

    constructor(private us: UtilityService, private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
        this.initializeForm();
    }

    initializeForm() {
        this.viewForm = this.formBuilder.group({
            itemName: ''
        });
    }

    clearForm() {
        this.viewForm.patchValue({
            itemName: ''
        });
        this.isItemSelected = false;
        this.selectedItem = {};
        this.issueTypeList = [];
        this.packingList = [];
        this.selectedRacks = [];
        $('#rack_text').val('');
        this.stockDetails = [];
        this.stockItemDetails = [];
        this.stockItemSelectAll = false;
    }

    searchItems(event: any) {
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(ItemSubStore.FetchItemssubstoreOfDeptIS, {
                Filter: searchval,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.itemsList = response.FetchItemssubstoreOfDeptISDataList;
                    }
                },
                    () => {
                    })
        } else {
            this.itemsList = [];
        }
    }

    onSelectItem(event: any, selectedItem?: any) {
        let item: any;
        if (selectedItem) {
            item = selectedItem;
        } else {
            item = this.itemsList.find((x: any) => x.DisplayName === event.option.value);
        }
        this.itemsList = [];
        const url = this.us.getApiUrl(ItemSubStore.FetchSubStoreItemIS, {
            ItemID: item.ItemId,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.isItemSelected = true;
                    this.selectedItem = response.FetchSubStoreItemISDataList[0];
                    this.DefaultUnitID = response.FetchSubStoreItemISDataList[0].DefaultUnitID;
                    this.issueTypeList = response.FetchSubStoreItemIssueTypeISDataList;
                    this.packingList = response.FetchSubStoreItemPackingISDataList.sort((a: any, b: any) => a.Sequence - b.Sequence);
                    this.selectedRacks = response.FetchSubStoreItemRackISDataList;
                    setTimeout(() => {
                        $('#rack_text').val(this.selectedRacks[0]?.Rack);
                    }, 0)
                    this.getStockDetails();
                }
            },
                () => {
                });
    }

    searchRacks(event: any) {
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(ItemSubStore.FetchRacksItemSubstore, {
                Filter: searchval,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.rackItems = response.FetchRacksItemSubstoreDataList;
                    }
                },
                    () => {
                    })
        } else {
            this.rackItems = [];
        }
    }

    onSelectRack(event: any) {
        const item = this.rackItems.find((x: any) => x.Rack === event.option.value);
        this.rackItems = [];
        const url = this.us.getApiUrl(ItemSubStore.FetchRacksItemSubstoreSelected, {
            RackID: item.RackID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    $('#rack_text').val('');
                    this.selectedRacks = response.FetchRacksItemSubstoreSelectedDataList;
                }
            },
                () => {
                });
    }

    onShelfSelection(item: any) {
        this.selectedRacks.forEach((element: any) => {
            if (element.Shelf === item.Shelf) {
                element.Rackchecked = !element.Rackchecked;
            } else {
                element.Rackchecked = false;
            }
        });
    }

    onSaveClick() {
        this.errorMessages = [];
        if (!this.selectedItem.ItemID) {
            this.errorMessages.push('Please Select Item');
            $('#errorMessagesModal').modal('show');
            return;
        }

        if (this.selectedRacks.filter((e: any) => e.Rackchecked).length === 0) {
            this.errorMessages.push('Please Select Rack and Shelf');
        }

        if (!this.selectedItem.MaximumLevel) {
            this.errorMessages.push('Please Enter Maximum Level');
        }

        if (!this.selectedItem.ReorderLevel) {
            this.errorMessages.push('Please Enter Reorder Level');
        }

        if (!this.selectedItem.MinimumLevel) {
            this.errorMessages.push('Please Enter Minimum Level');
        }

        if (!this.selectedItem.ReorderQty) {
            this.errorMessages.push('Please Enter Reorder Quantity');
        }

        if (this.errorMessages.length > 0) {
            $('#errorMessagesModal').modal('show');
            return;
        }

        const payload = {
            "ItemID": this.selectedItem.ItemID,
            "ROL": parseInt(this.selectedItem.ReorderLevel),
            "MaxQuantity": this.selectedItem.MaximumLevel,
            "MinQuantity": this.selectedItem.MinimumLevel,
            "ROQ": this.selectedItem.ReorderQty,
            "IssueUOMID": this.selectedItem.DefaultUnitID,
            "DefaultUnitID": this.selectedItem.DefaultUnitID,//this.DefaultUnitID,
            "UserID": this.doctorDetails[0]?.UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospitalID,
            "ItemsRacksXMLL": this.selectedRacks.filter((e: any) => e.Rackchecked).map((element: any) => {
                return {
                    "SID": element.ShelfID
                }
            })
        };

        this.us.post(ItemSubStore.SaveItemSubstore, payload)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    $('#successMsgModal').modal('show');
                    this.clearForm();
                }
            },
                () => {
                });
    }

    getStockDetails() {
        this.stockDetails = [];
        this.stockItemDetails = [];
        this.stockItemSelectAll = false;
        const url = this.us.getApiUrl(ItemSubStore.FetchItemsOfDepartmentStockIS, {
            ItemID: this.selectedItem.ItemID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    response.FetchItemsOfDepartmentStockISDataList.forEach((a: any) => {
                        a.QOH = parseInt(a.QOH);
                    });
                    this.stockDetails = response.FetchItemsOfDepartmentStockISDataList.filter((a: any) => a.QOH > 0);
                }
            },
                () => {
                });
    }

    onStockSlection(item: any) {
        this.stockDetails.forEach((element: any) => {
            if (element.Department === item.Department) {
                element.selected = !element.selected;
                if (element.selected) {
                    this.getStockItemDetails(item);
                }
            } else {
                element.selected = false;
            }
        });
    }

    getStockItemDetails(item: any) {
        this.stockItemSelectAll = false;
        this.stockItemDetails = [];
        const url = this.us.getApiUrl(ItemSubStore.FetchItemsOfDepartmentStockDetailsIS, {
            SelectedDeptID: item.HospDeptID,
            ItemID: this.selectedItem.ItemID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.stockItemDetails = response.FetchItemsOfDepartmentStockDetailsISDataList;
                }
            },
                () => {
                });
    }

    selectAllClick() {
        this.stockItemSelectAll = !this.stockItemSelectAll;
        this.stockItemDetails.forEach((element: any) => {
            element.selected = this.stockItemSelectAll;
        });
    }

    onClearStockDetails() {
        this.stockItemSelectAll = false;
        this.stockItemDetails = [];
        this.stockDetails.forEach((element: any) => {
            element.selected = false;
        });
    }

    openItemSearchModal() {
        this.clearSearch();
        $('#itemSearchModal').modal('show');
    }

    fetchItems(min: number = 1, max: number = 10, currentPage: number = 1) {
        if (this.itemCodeSearchText || this.itemNameSearchText) {
            const url = this.us.getApiUrl(ItemSubStore.FetchItemSubstoreCommonSearch, {
                min,
                max,
                ItemCode: this.itemCodeSearchText ? 1 : 0,
                DisplayName: this.itemNameSearchText ? 1 : 0,
                Type: this.itemCodeSearchText ? this.itemCodeFilterType : this.itemNameFilterType,
                Filter: this.itemCodeSearchText ? this.itemCodeSearchText : this.itemNameSearchText,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.fetchedItemsList = response.FetchItemSubstoreCommonSearchDataCList;
                        this.currentPage = currentPage;
                        this.totalItemsCount = Number(response.FetchItemScientificNameDataCountDataList[0]?.Count);
                    }
                },
                    (_) => {
                    });
        } else {
            this.fetchedItemsList = [];
            this.currentPage = 0;
            this.totalItemsCount = 0;
            this.errorMsg = 'Please enter search text';
            $('#errorMsg').modal('show');
        }
    }

    handlePageChange(event: any) {
        this.fetchItems(event.min, event.max, event.currentPage);
    }

    clearSearch() {
        this.fetchedItemsList = [];
        this.currentPage = 0;
        this.totalItemsCount = 0
        this.itemCodeFilterType = 1;
        this.itemNameFilterType = 1;
        this.itemCodeSearchText = '';
        this.itemNameSearchText = '';
    }

    onItemSelection(item: any) {
        this.fetchedItemsList.forEach((element: any) => {
            if (element.ItemId === item.ItemId) {
                element.selected = !element.selected;
            } else {
                element.selected = false;
            }
        });
    }

    onSelectBtnClick() {
        const selectedItem = this.fetchedItemsList.find((item: any) => item.selected);
        if (selectedItem) {
            $('#itemSearchModal').modal('hide');
            this.onSelectItem(null, selectedItem);
            this.viewForm.patchValue({
                itemName: selectedItem.DisplayName
            });
        }
    }

    getItemSubstoreStockDetails() {
        this.stockDetails = [];
        this.stockItemDetails = [];
        this.stockItemSelectAll = false;
        const url = this.us.getApiUrl(ItemSubStore.FetchItemSubStore, {
            ItemID: this.selectedItem.ItemID,
            SelectedDeptID: 0,
            tbl: 1,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        }); 
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.stockDetails = response.FetchItemSubStoreDataList;
                    $('#stockDetailsModal1').modal('show');
                }
            },
                (_) => {
                });
    }
    onItemSubstoreStockSlection(item: any) {
        this.stockDetails.forEach((element: any) => {
            if (element.Hospdeptid === item.Hospdeptid) {
                element.selected = !element.selected;
                if (element.selected) {
                    this.getItemSubstoreStockItemDetails(item);
                }
            } else {
                element.selected = false;
            }
        });
    }
    getItemSubstoreStockItemDetails(item: any) {
        this.stockItemDetails = [];
        this.stockItemSelectAll = false;
        const url = this.us.getApiUrl(ItemSubStore.FetchItemSubStore, {
            ItemID: this.selectedItem.ItemID,
            SelectedDeptID: item.Hospdeptid,
            tbl: 2,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        }); 
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.stockItemDetails = response.FetchItemSubStoreDeptDataList;
                }
            },
                (_) => {
                });
    }
}

export const ItemSubStore = {
    FetchItemssubstoreOfDeptIS: 'FetchItemssubstoreOfDeptIS?Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchSubStoreItemIS: 'FetchSubStoreItemIS?ItemID=${ItemID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchRacksItemSubstore: 'FetchRacksItemSubstore?Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchRacksItemSubstoreSelected: 'FetchRacksItemSubstoreSelected?RackID=${RackID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveItemSubstore: 'SaveItemSubstore',
    FetchItemsOfDepartmentStockIS: 'FetchItemsOfDepartmentStockIS?ItemID=${ItemID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchItemsOfDepartmentStockDetailsIS: 'FetchItemsOfDepartmentStockDetailsIS?ItemID=${ItemID}&SelectedDeptID=${SelectedDeptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchItemSubstoreCommonSearch: 'FetchItemSubstoreCommonSearch?min=${min}&max=${max}&ItemCode=${ItemCode}&DisplayName=${DisplayName}&Type=${Type}&Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchItemSubStore: 'FetchItemSubStore?ItemID=${ItemID}&SelectedDeptID=${SelectedDeptID}&tbl=${tbl}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};