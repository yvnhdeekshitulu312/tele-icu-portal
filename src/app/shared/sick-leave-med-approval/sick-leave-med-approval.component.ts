import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';

declare var $: any;
export const MY_FORMATS = {
    parse: {
        dateInput: 'dd-MMM-yyyy HH:mm:ss',
    },
    display: {
        dateInput: 'DD-MMM-yyyy',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'dd-MMM-yyyy',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};


@Component({
    selector: 'app-sick-leave-med-approval',
    templateUrl: './sick-leave-med-approval.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE],
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
        DatePipe,
    ]
})
export class SickLeaveMedApprovalComponent extends BaseComponent implements OnInit {
    datesForm: any;
    approvalForm: any;
    selectedItem: any;
    url: any;
    showNoRecFound: boolean = true;
    FetchExtendAndApprovedPatientSickLeaveDataList: any = [];
    sortedGroupedByAdmitDate: any;
    facility: any;
    trustedUrl: any;
    listOfSpecialisation: any = [];
    listOfSpecialisation1: any = [];
    listOfItems: any;
    listOfItems1: any = [];

    constructor(private us: UtilityService,
        public formBuilder: FormBuilder, public datepipe: DatePipe) {
        super();
        this.initializeForm();
        this.approvalForm = this.formBuilder.group({
            remarks: ['', Validators.required]
        });
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    }

    ngOnInit(): void {
        this.FetchSickLeaveApprovals();
        this.fetchSpecialisations();
        this.fetchSpecializationDoctor();
    }

    initializeForm() {
        this.datesForm = this.formBuilder.group({
            fromdate: new Date(),
            todate: new Date(),
            SSN: '',
            Specialisation: '',
            SpecialiseID: '',
            DoctorID: '',
            DoctorName: ''
        });
    }

    onSSNClearClick() {
        this.datesForm.patchValue({
            SSN: ''
        });
        this.FetchSickLeaveApprovals();
    }

    FetchSickLeaveApprovals() {
        const fromDate = this.datesForm.get('fromdate').value;
        const todate = this.datesForm.get('todate').value;
        if (!fromDate || !todate) {
            return;
        }
        const { SSN, DoctorID } = this.datesForm.value;
        const url = this.us.getApiUrl(SickLeaveApproval.FetchExtendAndApprovedPatientSickLeave, {
            SSN: SSN ? SSN : 0,
            FromDate: this.datepipe.transform(fromDate, "dd-MMM-yyyy"),
            ToDate: this.datepipe.transform(todate, "dd-MMM-yyyy"),
            DoctorID: DoctorID ? DoctorID : 0,
            WorkStationID: this.facility.FacilityID ?? 0,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.FetchExtendAndApprovedPatientSickLeaveDataList = response.FetchExtendAndApprovedPatientSickLeaveDataList.filter((element: any) => element.OPDManagerApprovedUserID);
                    if (this.FetchExtendAndApprovedPatientSickLeaveDataList.length > 0) {
                        this.showNoRecFound = false;
                        const groupedByAdmitDate = this.FetchExtendAndApprovedPatientSickLeaveDataList.reduce((acc: any, current: any) => {
                            const admitDate = current.CreateDate.split(' ')[0];
                            if (!acc[admitDate]) {
                                acc[admitDate] = [];
                            }
                            acc[admitDate].push(current);

                            return acc;
                        }, {});

                        this.sortedGroupedByAdmitDate = Object.entries(groupedByAdmitDate)
                            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                            .map(([admitDate, items]) => ({ admitDate, items }));
                    }
                    else {
                        this.showNoRecFound = true;
                    }
                }
            },
                (err) => {

                })
    }

    clearSickLeaveApprovals() {
        this.initializeForm();
        this.fetchSpecialisations();
        this.fetchSpecializationDoctor();
        this.FetchSickLeaveApprovals();
    }

    onSSNEnterPress(event: any) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            this.FetchSickLeaveApprovals();
        }
    }

    onApproveClick(item: any) {
        this.selectedItem = item;
        this.approvalForm.reset();
        $('#sickLeaveApprovalModal').modal('show');
    }

    saveApproval() {
        this.us.post(SickLeaveApproval.UpdateExtendAndApprovedPatientSickLeaveMED, {
            "SickLeaveID": this.selectedItem.SickLeaveID,
            "MedicalSecApprovedUserID": this.doctorDetails[0]?.UserId,
            "MedicalSecApprovedDate": this.datepipe.transform(new Date(), "dd-MMM-yyyy"),
            "MedicalSecApprovedORRejectedRemarks": this.approvalForm.get('remarks')?.value,
            "UserID": this.doctorDetails[0]?.UserId,
            "WorkStationID": this.facility.FacilityID ?? 0,
            "HospitalID": this.hospitalID
        }).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#sickLeaveApprovalModal').modal('hide');
                $('#approvalSaveMsg').modal('show');
                this.FetchSickLeaveApprovals();
            }
        });
    }

    PrintSickLeave(item: any) {

        this.selectedItem = item;
        this.approvalForm.reset();
        const url = this.us.getApiUrl(SickLeaveApproval.FetchPatientSickLeavePrint, {
            SickLeaveID: this.selectedItem.SickLeaveID,
            ReportType: "1",
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.trustedUrl = response?.FTPPATH;
                    $("#reviewAndPayment").modal('show');
                }
            },
                (err) => {

                })
    }

    fetchSpecialisations() {
        const url = this.us.getApiUrl(SickLeaveApproval.fetchGSpecialisationN, { HospitalID: this.hospitalID });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.listOfSpecialisation = this.listOfSpecialisation1 = response.DeptDataList;
                }
            },
                (err) => {
                });
    }

    searchSpecItem(event: any) {
        const item = event.target.value;
        this.listOfSpecialisation = this.listOfSpecialisation1;
        let arr = this.listOfSpecialisation1.filter((spec: any) => spec.Specialisation.toLowerCase().indexOf(item.toLowerCase()) > -1);
        this.listOfSpecialisation = arr.length ? arr : [];
    }

    selectSpecialisationItem(event: any) {
        const item = this.listOfSpecialisation.find((x: any) => x.Specialisation === event.option.value);
        this.datesForm.patchValue({
            SpecialiseID: item.SpecialiseID,
            Specialisation: item.Specialisation
        });
        this.fetchSpecializationDoctor(item);
    }

    fetchSpecializationDoctor(item?: any) {
        const url = this.us.getApiUrl(SickLeaveApproval.fetchSpecializationDoctorTimings, {
            SpecializationID: item ? item.SpecialiseID : 0,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID ?? 0,
            HospitalID: this.hospitalID,
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.listOfItems = this.listOfItems1 = response.GetAllDoctorsList;
                }
            },
                (err) => {
                });
    }

    searchDoctor(event: any) {
        const item = event.target.value;
        let arr = this.listOfItems1.filter((spec: any) => spec.EmpCodeName.toLowerCase().indexOf(item.toLowerCase()) > -1);
        this.listOfItems = arr.length ? arr : [];

        if (arr.length === 0) {
            this.fetchDoctorSearch(event);
        }
    }

    fetchDoctorSearch(event: any) {
        if (event.target.value.length >= 3) {
            var filter = event.target.value;
            const url = this.us.getApiUrl(SickLeaveApproval.FetchReferalDoctors, { Tbl: 11, Name: filter });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.listOfItems = response.ReferalDoctorDataList;
                    }
                },
                    (err) => {
                    });
        }
        else {
            this.listOfItems = [];
        }
    }

    selectDocor(event: any) {
        const item = this.listOfItems.find((x: any) => x.EmpCodeName === event.option.value);
        this.datesForm.patchValue({
            DoctorID: item.EmpID,
            DoctorName: item.EmpCodeName,
            SpecialiseID: item.SpecialiseId,
            Specialisation: item.SpecialityName
        });
        this.FetchSickLeaveApprovals();
    }
}

const SickLeaveApproval = {
    FetchExtendAndApprovedPatientSickLeave: 'FetchExtendAndApprovedPatientSickLeave?SSN=${SSN}&FromDate=${FromDate}&ToDate=${ToDate}&DoctorID=${DoctorID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    UpdateExtendAndApprovedPatientSickLeaveMED: 'UpdateExtendAndApprovedPatientSickLeaveMED',
    FetchPatientSickLeavePrint: 'FetchPatientSickLeavePrintOPD?SickLeaveID=${SickLeaveID}&ReportType=${ReportType}&HospitalID=${HospitalID}',
    fetchGSpecialisationN: 'DepartmentListNN?HospitalID=${HospitalID}',
    fetchSpecializationDoctorTimings: 'FetchSpecializationDoctorTimingsFuture?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchReferalDoctors: 'FetchReferalDoctors?Tbl=${Tbl}&Name=${Name}'
};
