import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
declare var $: any;

@Component({
    selector: 'app-item-mapping',
    templateUrl: './item-mapping.component.html'
})
export class ItemMappingComponent extends BaseComponent implements OnInit {
    facilityId: any;
    locationsList: any = [];
    departmentsList: any = [];
    categoriesList: any = [];

    selectedCategory: any = 0;
    selectedDepartment: any = 0;
    selectedLocation: any = 0;

    selectedFromDepartment: any = 0;
    selectedToDepartment: any = 0;

    isIndividualMapping: boolean = true;
    isMappingItems: boolean = true;

    filterTypeList = [
        { label: 'Starts With', id: 1 },
        { label: 'Contains', id: 2 },
        { label: 'Ends With', id: 3 },
        { label: 'Equals', id: 4 }
    ];

    itemCodeSearchText: any;
    itemNameSearchText: any;
    categorySearchText: any;
    itemCodeFilterType: any = 1;
    itemNameFilterType: any = 1;
    categoryFilterType: any = 1;

    totalItemsCount: any = 0;
    currentPage: number = 0;
    multiItemsList: any = [];
    showSelectedMultipleItems: boolean = false;
    selectedMultiItemsList: any = [];
    errorMsg: string = '';

    mappedItemsList: any = [];
    successMsg: string = '';
    viewMappedItems: any = [];

    constructor(private us: UtilityService) {
        super();
        this.facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
    }

    ngOnInit(): void {
        this.getHospitals();
        this.getCategories();
    }

    getHospitals() {
        let params = { UserID: this.doctorDetails[0]?.UserId, WorkStationID: this.facilityId, HospitalID: this.hospitalID };
        const url = this.us.getApiUrl(ItemMapping.FetchAllHospitalsItemMapping, params);
        this.us.get(url).subscribe((res: any) => {
            if (res?.Code === 200) {
                this.locationsList = res.FetchAllHospitalsIndentDataList;
            }
        }, (_) => {

        });
    }

    getCategories() {
        let params = { UserID: this.doctorDetails[0]?.UserId, WorkStationID: this.facilityId, HospitalID: this.hospitalID };
        const url = this.us.getApiUrl(ItemMapping.FetchItemCategoriesItemMapping, params);
        this.us.get(url).subscribe((res: any) => {
            if (res?.Code === 200) {
                this.categoriesList = res.FetchItemCategoriesItemMappingDataList;
            }
        }, (_) => {

        });
    }

    onLocationChange() {
        this.mappedItemsList = [];
        this.viewMappedItems = [];
        if (this.selectedLocation == 0) {
            this.departmentsList = [];
            this.selectedDepartment = 0;
        } else {
            this.getDepartments(this.selectedLocation);
        }
    }

    onDepartmentChange() {
        this.mappedItemsList = [];
        this.viewMappedItems = [];
    }

    onFromDepartmentChange() {
        this.viewMappedItems = [];
    }

    onCategoryChange() {
        this.viewMappedItems = [];
    }

    onMappingItemsChange(isMapping: boolean) {
        this.isMappingItems = isMapping;
        this.mappedItemsList = [];
        this.viewMappedItems = [];
    }

    onIndividualMappingChange(isIndividual: boolean) {
        this.isIndividualMapping = isIndividual;
        this.mappedItemsList = [];
        this.viewMappedItems = [];
        this.isMappingItems = true;
        this.selectedFromDepartment = 0;
        this.selectedToDepartment = 0;
        this.selectedDepartment = 0;
    }

    getDepartments(hospitalID: any) {
        let params = { UserID: this.doctorDetails[0]?.UserId, WorkStationID: this.facilityId, HospitalID: hospitalID };
        const url = this.us.getApiUrl(ItemMapping.FetchItemDepartmentItemMapping, params);
        this.us.get(url).subscribe((res: any) => {
            if (res?.Code === 200) {
                this.departmentsList = res.FetchItemDepartmentItemMappingDataList;
            }
        }, (_) => {

        });
    }

    openItemSearchModal() {
        if (this.selectedDepartment == 0) {
            this.errorMsg = 'Please select department';
            $('#errorMsg').modal('show');
            return;
        }
        this.clearSearch();
        $('#itemSearchModal').modal('show');
    }

    clearSearch() {
        this.showSelectedMultipleItems = false;
        this.multiItemsList = [];
        this.selectedMultiItemsList = [];
        this.currentPage = 0;
        this.totalItemsCount = 0
        this.itemCodeSearchText = '';
        this.itemNameSearchText = '';
        this.categorySearchText = '';
        this.itemCodeFilterType = 1;
        this.itemNameFilterType = 1;
        this.categoryFilterType = 1;
    }

    fetchItems(min: any = 1, max: any = 10, currentPage: any = 1) {
        if (this.itemCodeSearchText || this.itemNameSearchText || this.categorySearchText) {
            const params = {
                min: min,
                max: max,
                ItemCode: this.itemCodeSearchText ? 1 : 0,
                DisplayName: this.itemNameSearchText ? 1 : 0,
                Catergory: this.categorySearchText ? 1 : 0,
                Type: this.itemCodeSearchText ? 1 : this.itemNameSearchText ? 1 : this.categorySearchText ? 1 : 0,
                MappingType: this.isMappingItems ? 1 : 2,
                Filter: this.itemCodeSearchText ? this.itemCodeSearchText : this.itemNameSearchText ? this.itemNameSearchText : this.categorySearchText ? this.categorySearchText : '',
                FacHospDeptID: this.selectedDepartment,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.selectedLocation
            };

            let url = "";
            if (this.isMappingItems) {
                url = this.us.getApiUrl(ItemMapping.FetchItemsNotOFDepartmentItemMapping, params);
            } else {
                url = this.us.getApiUrl(ItemMapping.FetchItemsunMappingDepartmentItemMapping, params);
            }

            this.us.get(url).subscribe((res: any) => {
                if (res?.Code === 200) {
                    this.multiItemsList = res.FetchItemsNotOFDepartmentItemMappingDataCList;
                    this.currentPage = currentPage;
                    this.totalItemsCount = Number(res.FetchItemsNotOFDepartmentItemMappingCountList[0]?.Count);
                }
            }, (_) => {

            });
        } else {
            this.multiItemsList = [];
            this.currentPage = 0;
            this.totalItemsCount = 0;
            this.errorMsg = 'Please enter search text';
            $('#errorMsg').modal('show');
        }
    }

    showSelectedMultipleItemsClick() {
        this.showSelectedMultipleItems = !this.showSelectedMultipleItems;
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
        this.fetchItems(event.min, event.max, event.currentPage);
    }

    loadSelectedMultiItems() {
        if (this.selectedMultiItemsList.length > 0) {
            this.selectedMultiItemsList.forEach((item: any) => {
                if (!this.mappedItemsList.some((mappedItem: any) => mappedItem.ItemID === item.ItemID)) {
                    this.mappedItemsList.push(item);
                }
            });
            $('#itemSearchModal').modal('hide');
        } else {
            this.errorMsg = 'Please select at least one item';
            $('#errorMsg').modal('show');
        }
    }

    deleteMappedItem(index: any) {
        this.mappedItemsList.splice(index, 1);
    }

    onSaveClick() {
        if (this.isIndividualMapping && this.mappedItemsList.length === 0) {
            this.errorMsg = 'Please select at least one item to map';
            $('#errorMsg').modal('show');
            return;
        }

        if (!this.isIndividualMapping && this.viewMappedItems.length == 0) {
            this.errorMsg = 'No Items to map';
            $('#errorMsg').modal('show');
            return;
        }

        if (!this.isIndividualMapping && this.selectedToDepartment == 0) {
            this.errorMsg = 'Please select to Department';
            $('#errorMsg').modal('show');
            return;
        }

        let Items = [];
        let HospDeptID = '';

        if (this.isIndividualMapping) {
            HospDeptID = this.selectedDepartment;
            Items = this.mappedItemsList.map((item: any) => {
                return {
                    DPT: this.selectedDepartment,
                    ITM: item.ItemID,
                    BLK: this.isMappingItems ? 0 : 1
                };
            });
        } else {
            HospDeptID = this.selectedToDepartment;
            Items = this.viewMappedItems.map((item: any) => {
                return {
                    DPT: this.selectedToDepartment,
                    ITM: item.ItemID,
                    BLK: 0
                };
            });
        }

        const params = {
            HospDeptID,
            Items,
            "UserID": this.doctorDetails[0]?.UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.selectedLocation
        };

        this.us.post(ItemMapping.SaveDepartmentItemsMapping, params).subscribe((res: any) => {
            if (res?.Code === 200) {
                this.mappedItemsList = [];
                this.viewMappedItems = [];
                this.successMsg = 'Items mapped successfully';
                $('#successMsg').modal('show');
            } else {
                this.errorMsg = 'Failed to map items';
                $('#errorMsg').modal('show');
            }
        });
    }

    viewMappedItemsClick() {
        if (this.selectedDepartment == 0) {
            this.errorMsg = 'Please select department';
            $('#errorMsg').modal('show');
            return;
        }
        const params = {
            "MappingType": this.isMappingItems ? 1 : 2,
            "HospDeptID": this.selectedDepartment,
            "CategoryID": this.selectedCategory,
            "UserID": this.doctorDetails[0]?.UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.selectedLocation
        };
        let url;
        if (this.isMappingItems)
            url = this.us.getApiUrl(ItemMapping.FetchItemsNotOFDepartmentItemMappingItems, params);
        else
            url = this.us.getApiUrl(ItemMapping.FetchItemsMMOFDepartmentItemMappingItems, params);

        this.us.get(url).subscribe((res: any) => {
            if (res?.Code === 200) {
                this.viewMappedItems = res.FetchItemsNotOFDepartmentItemMappingFDataCList;
            }
        });
    }

    viewAllMappedItemsClick() {
        if (this.selectedFromDepartment == 0) {
            this.errorMsg = 'Please select From department';
            $('#errorMsg').modal('show');
            return;
        }
         if (this.selectedToDepartment == 0) {
            this.errorMsg = 'Please select To department';
            $('#errorMsg').modal('show');
            return;
        }
        const params = {
            // "MappingType": 1,
            // "HospDeptID": this.selectedFromDepartment,
            // "UserID": this.doctorDetails[0]?.UserId,
            // "WorkStationID": this.facilityId,
            // "HospitalID": this.selectedLocation
            "MappingType": this.isMappingItems ? 1 : 2,
            "HospDeptID": this.selectedFromDepartment,
            "CategoryID": this.selectedCategory,
            "UserID": this.doctorDetails[0]?.UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.selectedLocation
        };
        const url = this.us.getApiUrl(ItemMapping.FetchItemsMMOFDepartmentItemMappingItems, params);

        this.us.get(url).subscribe((res: any) => {
            if (res?.Code === 200) {
                this.viewMappedItems = res.FetchItemsNotOFDepartmentItemMappingFDataCList;
            }
        });
    }

    onClearClick() {
        this.viewMappedItems = [];
        this.mappedItemsList = [];
        this.departmentsList = [];
        this.selectedCategory = 0;
        this.selectedLocation = 0;
        this.selectedDepartment = 0;
        this.selectedFromDepartment = 0;
        this.selectedToDepartment = 0;
        this.isIndividualMapping = true;
        this.isMappingItems = true;
    }
}

const ItemMapping = {
    FetchAllHospitalsItemMapping: 'FetchAllHospitalsItemMapping?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchItemCategoriesItemMapping: 'FetchItemCategoriesItemMapping?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchItemDepartmentItemMapping: 'FetchItemDepartmentItemMapping?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchItemsNotOFDepartmentItemMapping: 'FetchItemsNotOFDepartmentItemMapping?min=${min}&max=${max}&ItemCode=${ItemCode}&DisplayName=${DisplayName}&Catergory=${Catergory}&Type=${Type}&MappingType=${MappingType}&Filter=${Filter}&FacHospDeptID=${FacHospDeptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveDepartmentItemsMapping: 'SaveDepartmentItemsMapping',
    FetchItemsNotOFDepartmentItemMappingItems: 'FetchItemsNotOFDepartmentItemMappingItems?MappingType=${MappingType}&HospDeptID=${HospDeptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchItemsunMappingDepartmentItemMapping: 'FetchItemsunMappingDepartmentItemMapping?min=${min}&max=${max}&ItemCode=${ItemCode}&DisplayName=${DisplayName}&Catergory=${Catergory}&Type=${Type}&MappingType=${MappingType}&Filter=${Filter}&FacHospDeptID=${FacHospDeptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchItemsMMOFDepartmentItemMappingItems: 'FetchItemsMMOFDepartmentItemMappingItems?MappingType=${MappingType}&CategoryID=${CategoryID}&HospDeptID=${HospDeptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
};