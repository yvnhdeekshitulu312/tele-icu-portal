import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UtilityService } from 'src/app/shared/utility.service';
import { MasterApiUrls } from '../urls';

declare var $: any;

@Component({
    selector: 'app-specialization',
    templateUrl: './specialization.component.html'
})
export class SpecializationComponent implements OnInit {
    public departmentsList: any = [];
    public specializationList: any = [];
    public doctorDetails: any = [];
    public facilityId: any;
    public hospitalID: any;
    public selectedDepartment: any;
    public selectedSpecilization: any;
    public specializationData: any = {
        AllDoctors: 'False',
        SameDayFollowUp: 'False'
    };
    public errorMsg: string = '';

    @ViewChild('divReportText') 
    divReportText!: ElementRef;

    constructor(private utilityService: UtilityService) { }

    ngOnInit(): void {
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        const facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = facility.FacilityID == undefined ? facility : facility.FacilityID;
        this.hospitalID = sessionStorage.getItem("hospitalId");
        this.fetchDepartments();
    }

    fetchDepartments() {
        const payload = {
            Filter: '%%%',
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        }
        const url = this.utilityService.getApiUrl(MasterApiUrls.FetchDepartmentsOfHospital, payload);
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.departmentsList = response.FetchDepartmentsOfHospitalDataList;
                }
            },
                (err) => {
                });
    }

    searchSpecializations(event: any) {
        if (event.target.value.length > 2) {
            const payload = {
                Filter: event.target.value,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            }
            const url = this.utilityService.getApiUrl(MasterApiUrls.FetchSSSpecializations, payload);
            this.utilityService.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.specializationList = response.FetchSSSpecializationsDataList;
                    }
                },
                    (err) => {
                    });
        } else {
            this.specializationList = [];
        }
    }

    onDepartmentSelected(item: any) {
        this.selectedDepartment = item;
    }

    onSpecializationSelected(item: any) {
        this.specializationList = [];
        this.selectedSpecilization = item;
        this.fetchSpecializationInformation();
    }

    fetchSpecializationInformation() {
        const payload = {
            SpecialiseID: this.selectedSpecilization.ID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        }
        const url = this.utilityService.getApiUrl(MasterApiUrls.FetchSpecializations, payload);
        this.utilityService.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.specializationData = response.FetchSpecializationsDataList[0];
                    this.selectedDepartment = this.departmentsList.find((item: any) => item.DepartmentID === this.specializationData.DepartmentID);
                }
            },
                (err) => {
                });
    }

    onSameDoctorCheckBoxSelection() {
        this.specializationData.AllDoctors = 'False';
    }

    onAllDoctorCheckBoxSelection() {
        this.specializationData.AllDoctors = 'True';
    }

    onFollowupCheckBoxSelection() {
        if (this.specializationData.SameDayFollowUp === 'True') {
            this.specializationData.SameDayFollowUp = 'False';
        } else {
            this.specializationData.SameDayFollowUp = 'True';
        }
    }

    save() {
        if (!this.selectedDepartment?.DepartmentID) {
            this.errorMsg = 'Please Select Department.';
            $('#errorMsg').modal('show');
            return;
        }

        if (!this.specializationData.Specialisation) {
            this.errorMsg = 'Please Select or Enter Specialization.';
            $('#errorMsg').modal('show');
            return;
        }

        if (!this.specializationData.Code) {
            this.errorMsg = 'Please Enter Code.';
            $('#errorMsg').modal('show');
            return;
        }
        const payload = {
            "SpecialiseID": this.specializationData.SpecialiseID ?? 0,
            "Specialisation": this.specializationData.Specialisation,
            "Speciality": this.specializationData.Specialisation,
            "Specialisation2L": "",
            "DepartmentID": this.specializationData.DepartmentID ?? this.selectedDepartment.DepartmentID,
            "Code": this.specializationData.Code,
            "FollowUpDays": this.specializationData.FollowUpDays,
            "FollowUpLimit": this.specializationData.FollowUpLimit,
            "AllDoctors": this.specializationData.AllDoctors === 'True' ? true : false,
            "DischargeFollowUpDays": this.specializationData.DischargeFollowUpDays,
            "DischargeFollowUpLimit": this.specializationData.DischargeFollowUpLimit,
            "SameDayFollowUp": this.specializationData.SameDayFollowUp === 'True' ? true : false,
            "NextTokanNoGapTime": this.specializationData.NextTokanNoGapTime,
            "SpecializationReportText": this.divReportText.nativeElement.innerHTML,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospitalID
        };
        this.utilityService.post(MasterApiUrls.SaveDeptSpecialities, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                this.clear();
            } else {
                this.errorMsg = response.Message;
                $('#errorMsg').modal('show');
            }            
        },
            (err) => {

            });
    }

    clear() {
        this.specializationData = {
            AllDoctors: 'False',
            SameDayFollowUp: 'False'
        };
        this.selectedDepartment = null;
        this.selectedSpecilization = null;
    }
}