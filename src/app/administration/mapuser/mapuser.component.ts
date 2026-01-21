import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { Router } from '@angular/router';
declare var $: any;

@Component({
    selector: 'app-map-user',
    templateUrl: './mapuser.component.html',
    styleUrls: []
})
export class MapUserComponent extends BaseComponent implements OnInit {
    @ViewChild('scrollContainer')
    private scrollContainer!: ElementRef;

    locationList: any = [];
    usersList: any = [];
    selectedHospitalID: any = 0;
    selectedUser: any;
    userRolesList: any = [];
    rolesList: any = [];
    selectedRoles: any = [];
    roleSearchText: string = '';
    facilitySearchText: string = '';
    selectedFacilities: any = [];
    facilitiesList: any = [];
    newUserRolesList: any = [];
    errorMsg: string = '';
    selectedCopyUsers: any = [];
    copyusersList: any = [];
    filteredHospitalID: any = 0;
    copyuserRolesList: any = [];
    chkselectAllRoles: boolean = false;

    constructor(private us: UtilityService, private config: ConfigService, private router: Router) {
        super()
    }

    ngOnInit(): void {
        this.FetchHospitalLocations();
    }

    FetchHospitalLocations() {
        this.config.fetchFetchHospitalLocations().subscribe((response) => {
            if (response.Status === "Success") {
                this.locationList = response.HospitalLocationsDataList;
            } else {
            }
        },
            (err) => {

            });
    }

    fetchUsers(event: any) {
        if (event.target.value.length > 2) {
            const params = {
                WorkStationID: 3747,
                Name: event.target.value,
                HospitalID: this.hospitalID
            };
            const url = this.us.getApiUrl(mapUserDetails.FetchSSUSERSData, params);
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.usersList = response.FetchSSUSERSDataKList;
                    if (this.usersList.length === 0) {
                        this.errorMsg = 'No User Found';
                        $('#errorMsg').modal('show');
                    }
                }
            },
                (err) => {

                });
        }
    }

    onUserSelected(item: any) {
        this.selectedUser = item;
        this.usersList = [];
        this.FetchHospitalUserRoles();
    }

    FetchHospitalUserRoles() {
        this.newUserRolesList = [];
        this.userRolesList = [];
        this.selectedRoles = [];
        this.selectedFacilities = [];
        this.rolesList = [];
        this.facilitiesList = [];
        this.roleSearchText = '';
        this.facilitySearchText = '';
        this.selectedHospitalID = 0;
        this.filteredHospitalID = 0;
        const params = {
            WorkStationID: 3747,
            //UserID: this.selectedUser.ID,
            HospitalID: this.hospitalID,
            SID: this.selectedUser.ID
        };
        const url = this.us.getApiUrl(mapUserDetails.FetchHospitalUserRoles, params);
        this.us.get(url, {'X-Session-ID': String(this.selectedUser.ID)}).subscribe((response: any) => {
            if (response.Code === 200) {
                this.userRolesList = response.FetchHospitalUserRolesDataList;
                this.userRolesList.forEach((element: any) => {
                    element.selected = false;
                });
                this.filterData();
            }
        },

            (err) => {

            });
    }

    fetchRoles(event: any) {
        if (event.target.value.length > 2) {
            const params = {
                RoleName: event.target.value,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: 3747,
                HospitalID: this.selectedHospitalID
            };
            const url = this.us.getApiUrl(mapUserDetails.FetchSavedRole, params);
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.rolesList = response.FetchSavedRoleDataList;
                        if (this.rolesList.length === 0) {
                            this.errorMsg = 'No Role Found';
                            $('#errorMsg').modal('show');
                        }
                    }
                });
        } else {
            this.rolesList = [];
        }
    }

    roleOptionClicked(event: Event, item: any) {
        event.stopPropagation();
        this.toggleRoleSelection(item);
    }

    toggleRoleSelection(item: any) {
        item.selected = !item.selected;
        if (item.selected) {
            const i = this.selectedRoles.findIndex((value: any) => value.RoleID === item.RoleID);
            if (i === -1) {
                this.selectedRoles.push(item);
            }
        } else {
            const i = this.selectedRoles.findIndex((value: any) => value.RoleID === item.RoleID);
            this.selectedRoles.splice(i, 1);
        }
        this.updateUserRolesList();
    }

    fetchFacilities(event: any) {
        if (!this.selectedHospitalID) {
            this.errorMsg = 'Please select Hospital';
            this.facilitySearchText = '';
            $('#errorMsg').modal('show');
            return;
        }
        if (event.target.value.length > 2) {
            const params = {
                FacilityName: event.target.value,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: 3747,
                HospitalID: this.selectedHospitalID
            };
            const url = this.us.getApiUrl(mapUserDetails.FetchUserFacilitys, params);
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.facilitiesList = response.FetchUserFacilitysKList;
                        if (this.facilitiesList.length === 0) {
                            this.errorMsg = 'No Facility Found';
                            $('#errorMsg').modal('show');
                        }
                    }
                });
        } else {
            this.facilitiesList = [];
        }
    }

    facilityOptionClicked(event: Event, item: any) {
        event.stopPropagation();
        this.toggleFacilitySelection(item);
    }

    toggleFacilitySelection(item: any) {
        item.selected = !item.selected;
        if (item.selected) {
            const i = this.selectedFacilities.findIndex((value: any) => value.FacilityID === item.FacilityID);
            if (i === -1) {
                this.selectedFacilities.push(item);
            }
        } else {
            const i = this.selectedFacilities.findIndex((value: any) => value.FacilityID === item.FacilityID);
            this.selectedFacilities.splice(i, 1);
        }
        this.updateUserRolesList();
    }

    updateUserRolesList() {
        this.newUserRolesList = [];
        if (this.selectedFacilities.length > 0 && this.selectedRoles.length > 0) {
            this.selectedFacilities.forEach((facility: any) => {
                this.selectedRoles.forEach((role: any) => {
                    this.newUserRolesList.push({
                        FacilityID: facility.FacilityID,
                        FacilityName: facility.FacilityName,
                        Hospital: this.locationList.find((location: any) => location.HospitalID.toString() === this.selectedHospitalID.toString()).Name,
                        HospitalID: this.selectedHospitalID,
                        RoleID: role.RoleID,
                        RoleName: role.RoleName,
                        SID: this.selectedUser.ID,
                        UserName: this.selectedUser.Name,
                        DFR: 'False'
                    });
                });
            });
            this.filterData();
            setTimeout(() => {
                this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            });
        }
    }

    clearForm() {
        this.selectedHospitalID = 0;
        this.selectedUser = null;
        this.roleSearchText = '';
        this.facilitySearchText = '';
        this.rolesList = [];
        this.facilitiesList = [];
        this.newUserRolesList = [];
        this.userRolesList = [];
        this.selectedRoles = [];
        this.selectedFacilities = [];
        this.selectedCopyUsers = [];
        this.copyusersList = [];
        this.filteredHospitalID = 0;
        this.copyuserRolesList = [];
        this.chkselectAllRoles = false;
        $('#userName').val('');
    }

    saveData() {
        if (!this.selectedUser) {
            this.errorMsg = 'Please Select User';
            $('#errorMsg').modal('show');
            return;
        }
        const newUserRoles = this.newUserRolesList.map((item: any) => {
            return {
                "SID": item.SID,
                "FID": item.FacilityID,
                "RID": item.RoleID,
                "HID": item.HospitalID,
                "BLK": 0,
                "DFR": item.DFR
            }
        });
        const oldUserRoles = this.userRolesList.map((item: any) => {
            return {
                "SID": item.SID,
                "FID": item.FacilityID,
                "RID": item.RoleID,
                "HID": item.HospitalID,
                "BLK": 0,
                "DFR": item.DFR
            }
        });
        const HospUserRoleXML = [...oldUserRoles, ...newUserRoles];

        const payload = {
            "SID": this.selectedUser.ID,
            "USERID": this.doctorDetails[0].UserId,
            "WORKSTATIONID": 3747,
            "HospitalID": "3",
            HospUserRoleXML
        };
        this.us.post(mapUserDetails.SaveUserRoleModuleFeatureFunctions, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                this.FetchHospitalUserRoles();
            }
        },
            (err) => {

            });
    }

    deleteUserRole(index: any, type: any) {
        if (type === 'new') {
            this.newUserRolesList.splice(index, 1);
        } else {
            this.userRolesList.splice(index, 1);
        }
    }

    changeDFRStatus(selectedItem: any) {
        this.newUserRolesList.forEach((item: any) => {
            if (selectedItem.FacilityID === item.FacilityID && selectedItem.RoleID === item.RoleID) {
                item.DFR = item.DFR === 'False' ? 'True' : 'False';
            } else {
                item.DFR = 'False';
            }
        });
        this.userRolesList.forEach((item: any) => {
            if (selectedItem.FacilityID === item.FacilityID && selectedItem.RoleID === item.RoleID) {
                item.DFR = item.DFR === 'False' ? 'True' : 'False';
            } else {
                item.DFR = 'False';
            }
        });
    }
    navigatetoRoleCreation() {
        this.router.navigate(['/administration/role']);
    }

    filterData() {
        this.userRolesList.filter((item: any) => {
            item.show = false;
            if (this.filteredHospitalID.toString() === '0') {
                item.show = true;
            } else if (this.filteredHospitalID.toString() === item.HospitalID.toString()) {
                item.show = true;
            }
        });

        this.newUserRolesList.filter((item: any) => {
            item.show = false;
            if (this.filteredHospitalID.toString() === '0') {
                item.show = true;
            } else if (this.filteredHospitalID.toString() === item.HospitalID.toString()) {
                item.show = true;
            }
        });
    }

    openCopyRolesToUsersModal() {
        if (this.userRolesList.filter((x: any) => x.selected).length > 0) {
            $("#copyRoleModal").modal('show');
        }
        else {
            this.errorMsg = 'Please select atleast one Role.';
            $('#errorMsg').modal('show');
        }
    }

    copyRolesToSelectedUsers() {

        $("#copyRoleModal").modal('show');
    }

    closeCopyRolesModal() {
        $("#copyRoleModal").modal('hide');
    }

    selectAllRoles() {
        this.chkselectAllRoles = !this.chkselectAllRoles;
        if (this.chkselectAllRoles) {
            this.userRolesList.forEach((element: any) => {
                element.selected = true;
            });
        }
        else {
            this.userRolesList.forEach((element: any) => {
                element.selected = false;
            });
        }
    }
    selectRole(item: any) {
        item.selected = !item.selected;
    }

    fetchCopyUsers(event: any) {
        if (event.target.value.length > 2) {
            const params = {
                WorkStationID: 3747,
                Name: event.target.value,
                HospitalID: this.hospitalID
            };
            const url = this.us.getApiUrl(mapUserDetails.FetchSSUSERSData, params);
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.copyusersList = response.FetchSSUSERSDataKList;
                    if (this.usersList.length === 0) {
                        this.errorMsg = 'No User Found';
                        $('#errorMsg').modal('show');
                    }
                }
            },
                (err) => {

                });
        }
    }

    onCopyUserSelected(item: any) {
        this.selectedCopyUsers.push(item);
        this.usersList = [];
        this.FetchHospitalCopyUserRoles(item);
    }

    removeItem(index: number): void {
        this.selectedCopyUsers.splice(index, 1);
    }

    FetchHospitalCopyUserRoles(item: any) {

        const params = {
            WorkStationID: 3747,
            UserID: item.ID,
            HospitalID: this.hospitalID,
            SID: item.ID
        };
        const url = this.us.getApiUrl(mapUserDetails.FetchHospitalUserRoles, params);
        this.us.get(url, {'X-Session-ID': String(item.ID)}).subscribe((response: any) => {
            if (response.Code === 200) {
                if (this.copyuserRolesList.length > 0) {
                    response.FetchHospitalUserRolesDataList.forEach((element: any) => {
                        this.copyuserRolesList.push(element);
                    });
                }
                else {
                    this.copyuserRolesList = response.FetchHospitalUserRolesDataList;
                }
            }
        },
            (err) => {

            });
    }

    clearCopyUsers() {
        this.selectedCopyUsers = [];
        this.copyusersList = [];
        this.filteredHospitalID = 0;
        this.copyuserRolesList = [];
        this.chkselectAllRoles = false;
        $('#userName1').val('');
    }

    saveCopyUserData() {
        if (this.selectedCopyUsers.length === 0) {
            this.errorMsg = 'Please Select User';
            $('#errorMsg').modal('show');
            return;
        }
        const newUserRoles: any[] = [];
        this.selectedCopyUsers.forEach((element: any) => {
            this.userRolesList.filter((x: any) => x.selected).forEach((item: any) => {
                newUserRoles.push({
                    "SID": element.ID,
                    "FID": item.FacilityID,
                    "RID": item.RoleID,
                    "HID": item.HospitalID,
                    "BLK": 0,
                    "DFR": item.DFR
                });
            });
        });
        const oldUserRoles = this.copyuserRolesList.map((item: any) => {
            return {
                "SID": item.SID,
                "FID": item.FacilityID,
                "RID": item.RoleID,
                "HID": item.HospitalID,
                "BLK": 0,
                "DFR": item.DFR
            }
        });
        const HospUserRoleXML = [...oldUserRoles, ...newUserRoles];

        const payload = {
            //"SID": this.selectedUser.ID,
            "USERID": this.selectedUser.ID,
            "WORKSTATIONID": 3747,
            "HospitalID": "3",
            HospUserRoleXML
        };
        this.us.post(mapUserDetails.SaveUserRoleModuleFeatureFunctionsH, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#copyRoleModal').modal('hide');
                $('#savemsg').modal('show');
                this.clearForm();
            }
        },
            (err) => {

            });
    }
}

export const mapUserDetails = {
    FetchSSUSERSData: "FetchSSUSERSData?Name=${Name}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
  // FetchHospitalUserRoles: "FetchHospitalUserRoles?SID=${SID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
   FetchHospitalUserRoles: "FetchHospitalUserRoles?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchSavedRole: "FetchSavedRole?RoleName=${RoleName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchUserFacilitys: "FetchUserFacilitys?FacilityName=${FacilityName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    SaveUserRoleModuleFeatureFunctions: "SaveUserRoleModuleFeatureFunctions",
    SaveUserRoleModuleFeatureFunctionsH: "SaveUserRoleModuleFeatureFunctionsH"
};
