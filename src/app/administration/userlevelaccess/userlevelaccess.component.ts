import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { Router } from '@angular/router';
declare var $: any;

@Component({
    selector: 'app-user-level-access',
    templateUrl: './userlevelaccess.component.html',
    styleUrls: []
})
export class UserLevelAccessComponent extends BaseComponent implements OnInit {

    userSearchText: any = '';
    selectedUser: any;
    usersList: any = [];
    moduleId: any = '';
    modulesList: any = [];
    featureSearchText: any;
    selectedFeatures: any = [];
    featuresList: any;

    errorMsg: any = '';
    userLevelAccessList: any = [];
    newUserLevelAccessList: any = [];
     ModuleName: any;

    constructor(private us: UtilityService) {
        super();
    }

    ngOnInit(): void {
        this.FetchModules();
    }

    fetchUsers(event: any) {
        if (event.target.value.length > 2) {
            const params = {
                WorkStationID: 3747,
                Name: event.target.value,
                HospitalID: this.hospitalID
            };
            const url = this.us.getApiUrl(UserLevelAccess.FetchSSUSERSData, params);
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.usersList = response.FetchSSUSERSDataKList;
                }
            },
                (_) => {

                });
        }
    }

    onUserSelected(item: any) {
        this.onClearClick();
        this.selectedUser = item;
        this.usersList = [];
        this.userSearchText = item.EmpNoFullName;
        const url = this.us.getApiUrl(UserLevelAccess.FetchKPIUserlevelAccess, {
            //UserID: this.selectedUser.ID,
            WorkStationID: this.ward.FacilityID == undefined ? this.ward : this.ward.FacilityID,
            HospitalID: this.hospitalID
        });
        //this.us.get(url).subscribe((response: any) => {
          this.us.get(url, {'X-Session-ID': String(this.selectedUser.ID)}).subscribe((response: any) => {
            if (response.Code === 200) {
                this.userLevelAccessList = response.FetchKPIUserlevelAccessDataList;
            }
        });
    }

    FetchModules() {
        const url = this.us.getApiUrl(UserLevelAccess.FetchModuleRoles, { UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.modulesList = response.FetchPatientFolderReasonsDataList;
                }
            },
                (_) => {

                })
    }

    onClearClick() {
        this.modulesList.forEach((el: any) => el.selected = false);
        this.userSearchText = '';
        this.selectedUser = null;
        this.featureSearchText = '';
        this.moduleId = '';
        this.selectedFeatures = [];
        this.newUserLevelAccessList = [];
        this.userLevelAccessList = [];
        this.featuresList = [];
    }

    moduleChange(event: any) {
        this.userLevelAccessList = [...this.userLevelAccessList, ...this.newUserLevelAccessList];
        this.featuresList = [];
        this.selectedFeatures = [];
        this.newUserLevelAccessList = [];
        this.ModuleName=event.target.options[event.target.options.selectedIndex].text
        const url = this.us.getApiUrl(UserLevelAccess.FetchModuleFeatureFunctions, { ModuleID: event.target.value, WorkStationID: 3395, HospitalID: this.hospitalID });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.featuresList = response.FetchModuleFeatureDataList;
                }
            },
                (_) => {

                })
    }

    featureOptionClicked(event: Event, item: any) {
        event.stopPropagation();
        this.toggleFeatureSelection(item);
    }

    toggleFeatureSelection(item: any) {
        item.selected = !item.selected;
        if (item.selected) {
            const i = this.selectedFeatures.findIndex((value: any) => value.FeatureID === item.FeatureID);
            if (i === -1) {
                this.selectedFeatures.push(item);
            }
        } else {
            const i = this.selectedFeatures.findIndex((value: any) => value.FeatureID === item.FeatureID);
            this.selectedFeatures.splice(i, 1);
        }
        this.updateList();
    }

    updateList() {
        this.newUserLevelAccessList = [];
        if (this.moduleId && this.selectedFeatures.length > 0) {
            this.selectedFeatures.forEach((element: any) => {
                this.newUserLevelAccessList.push({
                    FeatureID: element.FeatureID,
                    FeatureName: element.FeatureName,
                    ModuleName:this.ModuleName

                });
            });
        }
    }

    deleteItem(index: any, type: any) {
        if (type === 'new') {
            this.newUserLevelAccessList.splice(index, 1);
        } else {
            this.userLevelAccessList.splice(index, 1);
        }
    }

    onSaveClick() {
        const allItems = [...this.userLevelAccessList, ...this.newUserLevelAccessList];
        if (!allItems.length) {
            this.errorMsg = "Please Add Features."
            $('#errorMsg').modal('show');
            return;
        }
        this.us.post(UserLevelAccess.SaveKPIUserlevelAccess, {
            "SID": this.selectedUser.ID,
            "FeatureIDsXML": allItems.map((element: any) => {
                return {
                    "FID": element.FeatureID
                }
            }),
            "Blocked": "0",
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.ward.FacilityID == undefined ? this.ward : this.ward.FacilityID,
            "HospitalID": this.hospitalID
        }).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                this.onClearClick();
            }
        });
    }
}

const UserLevelAccess = {
    FetchSSUSERSData: "FetchSSUSERSData?Name=${Name}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchModuleRoles: "FetchModuleRoles?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchModuleFeatureFunctions: 'FetchModuleFeatureFunctions?ModuleID=${ModuleID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    //FetchKPIUserlevelAccess: 'FetchKPIUserlevelAccess?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchKPIUserlevelAccess: 'FetchKPIUserlevelAccess?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveKPIUserlevelAccess: 'SaveKPIUserlevelAccess'
}