import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-alter-mrp',
    templateUrl: './alter-mrp.component.html',
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
export class AlterMRPComponent extends BaseComponent implements OnInit {
    facilityId: any;
    currentDate = moment(new Date()).format('DD-MMM-YYYY H:mm');
    operatorValue: any;
    searchResults: any;
    searchText: any = '';
    errorMessages: any = [];
    selectedItems: any = [];

    constructor(private us: UtilityService) {
        super();
    }

    ngOnInit(): void {
        const facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = facility.FacilityID == undefined ? facility : facility.FacilityID;
        this.operatorValue = this.doctorDetails[0].EmpNo;
    }

    openSearchModal() {
        this.searchText = '';
        this.searchResults = [];
        $('#searchModal').modal('show');
    }

    onSearchClick() {
        if (this.searchText.length > 2) {
            this.searchResults = [];
            const url = this.us.getApiUrl(AlterMRP.SSItemsOfDepartment, {
                DisplayName: this.searchText,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.searchResults = response.SSItemsOfDepartmentDataList;
                }
            });
        }
    }

    onSelectClick() {
        this.errorMessages = [];
        const items = this.searchResults.filter((element: any) => element.isSelected);
        if (items.length === 0) {
            this.errorMessages.push('Please Select Item');
        }

        if (this.errorMessages.length > 0) {
            $('#errorMsg').modal('show');
            return;
        }
        items.forEach((item: any) => {
            this.selectedItems.push({...item, Expirydate: moment(item.Expirydate)});
        });
        
        $('#searchModal').modal('hide');
    }

    onSearchItemClick(item: any) {
        item.isSelected = !item.isSelected;
    }

    onClearClick() {
        this.selectedItems = [];
    }

    deleteItem(index: any) {
        this.selectedItems.splice(index, 1);
    }

    onSaveClick() {
        this.errorMessages = [];
        if (this.selectedItems.length === 0) {
            this.errorMessages.push('Please Add Items');
        } else {
            const errorItems = this.selectedItems.filter((element: any) => !element.newMRP);
            if (errorItems.length > 0) {
                this.errorMessages.push('Please Enter New MRP');
            }
        }
        if (this.errorMessages.length > 0) {
            $('#errorMsg').modal('show');
            return;
        }

        const payload = {
            "ItemXML": this.selectedItems.map((element: any) => {
                return {
                    "IID": element.ItemID,
                    "BID": element.BatchID,
                    "NMRP": element.newMRP,
                    "UID": element.UoMID,
                    "PID": element.PackID,
                    "EXPDATE": moment(new Date(element.Expirydate)).format('DD-MMM-YYYY')
                }
            }),
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospitalID
        };

        this.us.post(AlterMRP.UpdatePurchaseReceiptItemsMRP, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                this.selectedItems = [];
                $('#savemsg').modal('show');
            }
        });
    }
}

export const AlterMRP = {
    SSItemsOfDepartment: 'SSItemsOfDepartment?DisplayName=${DisplayName}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    UpdatePurchaseReceiptItemsMRP: 'UpdatePurchaseReceiptItemsMRP'
}