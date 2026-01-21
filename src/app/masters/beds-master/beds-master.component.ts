import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UtilityService } from 'src/app/shared/utility.service';
import { MasterApiUrls } from '../urls';

declare var $: any;

@Component({
    selector: 'app-beds-master',
    templateUrl: './beds-master.component.html',
    styleUrls: ['./beds-master.component.scss']
})
export class BedsMasterComponent implements OnInit {
    public wardsList: any = [];
    public roomsList: any = [];
    public bedTypesList: any = [];
    public bedsList: any = [];
    public doctorDetails: any = [];
    public facilityId: any;
    public hospitalID: any;
    public selectedWard: any;
    public selectedRoom: any;
    public selectedBedType: any;
    public selectedBed: any;
    public bedData: any = {
        IsAllowMultiAdmissions: false,
        Blocked: false,
        PatientType: 2,
        Status: 1
    };
    public errorMsg: string = '';

    @ViewChild('remarks') remarks!: ElementRef;
    @ViewChild('amenities') amenities!: ElementRef;

    constructor(private utilityService: UtilityService) { }

    ngOnInit(): void {
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        const facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = facility.FacilityID == undefined ? facility : facility.FacilityID;
        this.hospitalID = sessionStorage.getItem("hospitalId");
        this.fetchWards();
        this.fetchRooms();
        this.fetchBedTypes();
    }

    fetchWards() {
        const payload = {
            Filter: `HospitalID=${this.hospitalID}`,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        };
        const url = this.utilityService.getApiUrl(MasterApiUrls.FetchWardsEPP, payload);
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.wardsList = response.FetchWardsEPPDataList;
                }
            },
                (err) => {
                    console.error('Error fetching wards:', err);
                });
    }

    fetchRooms() {
        const payload = {
            Type: 0,
            Filter: 0,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        };
        const url = this.utilityService.getApiUrl(MasterApiUrls.FetchMasterRooms, payload);
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.roomsList = response.FetchRoomsDataList;
                }
            },
                (err) => {
                    console.error('Error fetching rooms:', err);
                });
    }

    fetchBedTypes() {
        const payload = {
            Type: 0,
            Filter: `HospitalID=${this.hospitalID}`,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        };
        const url = this.utilityService.getApiUrl(MasterApiUrls.FetchMasterBedTypes, payload);
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.bedTypesList = response.FetchBedTypesDataList;
                }
            },
                (err) => {
                    console.error('Error fetching bed types:', err);
                });
    }

    searchBeds(event: any) {
        const filterText = event.target.value?.trim() || '';

        if (filterText.length > 2) {
            const payload = {
                Type: 0,
                Filter: 'BedName  LIKE %' + filterText + '%',
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            };

            const url = this.utilityService.getApiUrl(MasterApiUrls.FetchMasterBeds, payload);

            this.utilityService.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        const allBeds = response.FetchMasterBedsDataList || [];

                        // filter by BedName
                        this.bedsList = allBeds.filter((bed: any) => {
                            return bed.BedName &&
                                bed.BedName.toLowerCase().includes(filterText.toLowerCase());
                        });
                    } else {
                        this.bedsList = [];
                    }
                },
                    (err) => {
                        console.error('Error fetching beds:', err);
                        this.bedsList = [];
                    });
        } else {
            this.bedsList = [];
        }
    }

    onWardSelected(event: Event) {
        const target = event.target as HTMLSelectElement;
        const wardId = parseInt(target.value);
        if (wardId) {
            this.selectedWard = this.wardsList.find((ward: any) => ward.WardID == wardId);
            this.bedData.WardID = wardId;
        }
    }

    onRoomSelected(event: Event) {
        const target = event.target as HTMLSelectElement;
        const roomId = parseInt(target.value);
        if (roomId) {
            this.selectedRoom = this.roomsList.find((room: any) => room.RoomID == roomId);
            this.bedData.RoomID = roomId;
        }
    }

    onBedTypeSelected(event: Event) {
        const target = event.target as HTMLSelectElement;
        const bedTypeId = parseInt(target.value);
        if (bedTypeId) {
            this.selectedBedType = this.bedTypesList.find((bedType: any) => bedType.BedTypeID == bedTypeId);
            this.bedData.BedTypeID = bedTypeId;
        }
    }

    onBedSelected(bed: any) {
        this.selectedBed = bed;
        this.fetchBedInformation(bed.BedID);
        this.bedsList = [];
    }

    fetchBedInformation(bedId: number) {
        const payload = {
            Type: 0,
            Filter: bedId.toString(),
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        };
        const url = this.utilityService.getApiUrl(MasterApiUrls.FetchMasterBeds, payload);
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200 && response.FetchMasterBedsDataList.length > 0) {
                    const bedInfo = response.FetchMasterBedsDataList[0];
                    this.bedData = {
                        BedID: bedInfo.BedID,
                        BedName: bedInfo.BedName,
                        CODE: bedInfo.CODE,
                        Extension: bedInfo.Extension,
                        WardID: bedInfo.WardID,
                        Location: bedInfo.Location,
                        ModelNo: bedInfo.ModelNo || '',
                        RoomID: bedInfo.RoomID,
                        SerialNo: bedInfo.SerialNo,
                        Direction: bedInfo.Direction,
                        Status: bedInfo.Status,
                        Manufacturer: bedInfo.Manufacturer,
                        PatientType: bedInfo.PatientType,
                        BedTypeID: bedInfo.BedTypeID,
                        Remark: bedInfo.Remark,
                        IsAllowMultiAdmissions: bedInfo.IsAllowMultiAdmissions === 1,
                        Blocked: bedInfo.BLOCKED === '1' || bedInfo.BITBLOCKED === 1,
                        Amenities: bedInfo.Amenities || ''
                    };

                    this.selectedWard = this.wardsList.find((ward: any) => ward.WardID == bedInfo.WardID);
                    this.selectedBedType = this.bedTypesList.find((bedType: any) => bedType.BedTypeID == bedInfo.BedTypeID);

                    if (this.remarks) {
                        this.remarks.nativeElement.innerHTML = bedInfo.Remark || '';
                    }
                    if (this.amenities) {
                        this.amenities.nativeElement.innerHTML = bedInfo.Amenities || '';
                    }
                }
            },
                (err) => {
                    console.error('Error fetching bed information:', err);
                });
    }

    onAllowMultipleAdmissionsToggle() {
        this.bedData.IsAllowMultiAdmissions = !this.bedData.IsAllowMultiAdmissions;
    }

    onBlockedToggle() {
        this.bedData.Blocked = !this.bedData.Blocked;
    }

    onPatientTypeChange(patientType: number) {
        this.bedData.PatientType = patientType;
    }

    save() {
        if (!this.bedData.BedName) {
            this.errorMsg = 'Please Enter Bed Name.';
            $('#errorMsg').modal('show');
            return;
        }

        if (!this.bedData.CODE) {
            this.errorMsg = 'Please Enter Code.';
            $('#errorMsg').modal('show');
            return;
        }

        if (!this.bedData.WardID) {
            this.errorMsg = 'Please Select Ward.';
            $('#errorMsg').modal('show');
            return;
        }

        if (!this.bedData.RoomID) {
            this.errorMsg = 'Please Select Room.';
            $('#errorMsg').modal('show');
            return;
        }

        if (!this.bedData.BedTypeID) {
            this.errorMsg = 'Please Select Bed Type.';
            $('#errorMsg').modal('show');
            return;
        }

        const payload = {
            BedID: this.bedData.BedID || 0,
            BedName: this.bedData.BedName,
            BedName2l: ' ',
            RoomID: this.bedData.RoomID,
            BedTypeID: this.bedData.BedTypeID,
            Extension: this.bedData.Extension || ' ',
            ModelNo: this.bedData.ModelNo || ' ',
            SerialNo: this.bedData.SerialNo || ' ',
            Manufacturer: this.bedData.Manufacturer || ' ',
            Direction: this.bedData.Direction || ' ',
            Location: this.bedData.Location || ' ',
            Remark: this.remarks ? this.remarks.nativeElement.innerHTML : ' ',
            SpecialiseID: null,
            Status: this.bedData.Status || 1,
            CODE: this.bedData.CODE,
            Amenities: this.amenities ? this.amenities.nativeElement.innerHTML : null,
            UserId: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            IsAllowMultiAdmissions: this.bedData.IsAllowMultiAdmissions ? 1 : 0
        };

        this.utilityService.post(MasterApiUrls.SaveBeds, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                this.clear();
            } else {
                this.errorMsg = response.Message;
                $('#errorMsg').modal('show');
            }
        },
            (err) => {
                console.error('Error saving bed:', err);
                this.errorMsg = 'An error occurred while saving the bed.';
                $('#errorMsg').modal('show');
            });
    }

    clear() {
        this.bedData = {
            IsAllowMultiAdmissions: false,
            Blocked: false,
            PatientType: 2,
            Status: 1
        };
        this.selectedWard = null;
        this.selectedRoom = null;
        this.selectedBedType = null;
        this.selectedBed = null;

        if (this.remarks) {
            this.remarks.nativeElement.innerHTML = '';
        }
        if (this.amenities) {
            this.amenities.nativeElement.innerHTML = '';
        }
    }
}