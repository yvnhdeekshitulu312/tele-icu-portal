import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-radiology-schedule-reports',
    templateUrl: './radiology-schedule-reports.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE],
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
        DatePipe,
    ],
})
export class RadiologyScheduleReportsComponent extends BaseComponent implements OnInit {
    data: any
    reportsForm!: FormGroup;
    facility: any;
    facilityId: any;
    resourceNameList: any = [];
    errorMessages: any = [];
    reportsDataList: any = [];
    readonly: boolean = false;
    trustedUrl: any;
    showRemarksValidation: boolean = false;
    selectedRecord: any;
    sortedGroupedByScheduleDate: any = [];
    Cancel: string = '00'; Booked: string = '00'; onlineCall: string = '00'; Visited: string = '00'; All: string = '00';

    constructor(private fb: FormBuilder, private us: UtilityService, private datepipe: DatePipe) {
        super();
    }

    ngOnInit(): void {
        if (this.data) {
            this.readonly = this.data.readonly;
        }
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
        this.initializeForm();
    }

    initializeForm() {
        this.reportsForm = this.fb.group({
            FromDate: new Date(),
            ToDate: new Date(),
            resourceNameText: '',
            resourceName: '',
            status: 0,
            SSN: ''
        })
    }

    onSearchResourceName(event: any) {
        this.resourceNameList = [];
        this.reportsForm.patchValue({
            resourceName: ''
        });
        if (event.target.value.length >= 3) {
            const url = this.us.getApiUrl(RadiologyScheduleReports.FetchRadiologyEquipments, {
                Filter: event.target.value,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url).subscribe((response: any) => {
                if (response.Code == 200) {
                    this.resourceNameList = response.FetchPhysiotheraphyUsersDataList;
                }
            },
                () => {

                })
        }
    }

    onResourceNameSelection(item: any) {
        this.resourceNameList = [];
        this.reportsForm.patchValue({
            resourceName: item
        });
    }

    onClearClick() {
        this.sortedGroupedByScheduleDate = null;
        this.reportsDataList = [];
        this.initializeForm();
    }
    onSSNEnterPress(event: Event) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            event.preventDefault();
            this.fetchReports();
        }
    }

    fetchReports() {
        this.errorMessages = [];
        if (!this.reportsForm.value['FromDate'] || !this.reportsForm.value['ToDate']) {
            this.errorMessages.push('Please Select Date Range');
        }
        if (this.errorMessages.length > 0) {
            $('#errorMsgModal').modal('show');
            return;
        }
        this.reportsDataList = [];
        const FromDate = this.datepipe.transform(this.reportsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
        const ToDate = this.datepipe.transform(this.reportsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
        const url = this.us.getApiUrl(RadiologyScheduleReports.FetchResourceCalenderRadiology, {
            Resource: this.reportsForm.get('resourceName')?.value == '' ? 0 : this.reportsForm.get('resourceName')?.value.ProcedureID,
            SSN: this.reportsForm.get('SSN')?.value ? this.reportsForm.get('SSN')?.value : 0,
            FromDate,
            ToDate,
            Status: this.reportsForm.get('status')?.value,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((reponse: any) => {
            if (reponse.Code === 200) {
                if (reponse.FetchResourceCalenderPhyDataList.length > 0) {
                    this.reportsDataList = reponse.FetchResourceCalenderPhyDataList;

                    this.Cancel = reponse.FetchPatientAppointmentsWorkList1DataList[0].Cancel;
                    this.Booked = reponse.FetchPatientAppointmentsWorkList1DataList[0].Booked;
                    this.onlineCall = reponse.FetchPatientAppointmentsWorkList1DataList[0].onlineCall;

                    this.Visited = reponse.FetchPatientAppointmentsWorkList1DataList[0].Visited;
                    this.All = reponse.FetchPatientAppointmentsWorkList1DataList[0].All;

                    //Grouping by Schedule Date
                    const groupedByScheduleDate = this.reportsDataList.reduce((acc: any, current: any) => {
                        const scheduleDate = current.FromDate;
                        if (!acc[scheduleDate]) {
                            acc[scheduleDate] = [];
                        }
                        acc[scheduleDate].push(current);

                        return acc;
                    }, {});


                    this.sortedGroupedByScheduleDate = Object.entries(groupedByScheduleDate)
                        .sort((a, b) => new Date(a[0]).getDate() - new Date(b[0]).getDate())
                        .map(([scheduleDate, items]) => ({ scheduleDate, items }));
                } else {
                     this.sortedGroupedByScheduleDate = null;
                    this.reportsDataList = [];
                    this.Cancel = '00';
                    this.Booked = '00';
                    this.Visited = '00';
                    this.All = '00';
                }

            }
        });
    }
    filterAppointmentStatus(status: string) {
        let filteredAppointments: any[] = [];

        // Filter appointments based on status
        // switch (status) {
        //   case 'C':
        //     filteredAppointments = this.allPatientAppointments1.filter(x => x.AppointmentStatus === 'Cancelled');
        //     break;
        //   case 'V':
        //     filteredAppointments = this.allPatientAppointments1.filter(x => x.AppointmentStatus === 'Visited');
        //     break;
        //   case 'B':
        //     filteredAppointments = this.allPatientAppointments1.filter(x => x.AppointmentStatus === 'Booked' && x.IsVitual === false);
        //     break;
        //     case 'G':
        //     filteredAppointments = this.allPatientAppointments1.filter(x => x.AppointmentStatus === 'Booked' && x.IsVitual === true);
        //     break;
        //   default:
        //     filteredAppointments = this.allPatientAppointments1;
        //     break;
        // }

        // Update the data source for pagination
        // this.allPatientAppointments = filteredAppointments;

        // // Reset pagination and load first page
        // this.resetAppointmentsPagination();
        // this.loadNextAppointmentsPage();
    }

    fetchReportsPrint() {
        this.errorMessages = [];
        if (!this.reportsForm.value['FromDate'] || !this.reportsForm.value['ToDate']) {
            this.errorMessages.push('Please Select Date Range');
        }
        if (this.errorMessages.length > 0) {
            $('#errorMsgModal').modal('show');
            return;
        }
        const FromDate = this.datepipe.transform(this.reportsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
        const ToDate = this.datepipe.transform(this.reportsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
        const url = this.us.getApiUrl(RadiologyScheduleReports.FetchResourceCalenderPhyPrintRadio, {
            Resource: this.reportsForm.get('resourceName')?.value == '' ? 0 : this.reportsForm.get('resourceName')?.value.ProcedureID,
            SSN: this.reportsForm.get('SSN')?.value ? this.reportsForm.get('SSN')?.value : 0,
            FromDate,
            ToDate,
            Status: this.reportsForm.get('status')?.value,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((reponse: any) => {
            if (reponse.Code === 200) {
                this.trustedUrl = reponse?.FTPPATH;
                $("#caseRecordModal").modal('show');
            }
        });
    }
    onItemActionsChange(event: any, item: any) {
        const selectedValue = event.target.value;
        this.clearRemarks();
        this.showRemarksValidation = false;
        if (selectedValue !== -1) {
            this.selectedRecord = { ...item, reasonValue: selectedValue };
            $('#action_remarks').modal('show');
        }
    }
    clearRemarks() {
        $("#remarks_text").val('');
    }
    updateAppointment() {
        this.showRemarksValidation = false;
        if ($("#remarks_text").val() === '') {
            this.showRemarksValidation = true;
            return;
        }
        $('#action_remarks').modal('hide');
        const payload = {
            "ScheduleID": this.selectedRecord.ScheduleID,
            "VirtualConfirmStatus": this.selectedRecord.reasonValue,
            "VirtualRemarks": $("#remarks_text").val(),
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.doctorDetails[0]?.FacilityId,
            "HospitalID": this.hospitalID
        };
        this.us.post(RadiologyScheduleReports.UpdatePatientAppointmentConfirmStatus, payload).subscribe((response) => {
            if (response.Code == 200) {
                $('#saveMsg').modal('show');
                this.fetchReports();
            }
        },
            (err) => {
                console.log(err)
            })
    }

}

export const RadiologyScheduleReports = {
    FetchRadiologyEquipments: 'FetchRadiologyEquipments?Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchResourceCalenderRadiology: 'FetchResourceCalenderRadiology?Resource=${Resource}&SSN=${SSN}&FromDate=${FromDate}&ToDate=${ToDate}&Status=${Status}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchResourceCalenderPhyPrintRadio: 'FetchResourceCalenderPhyPrintRadio?Resource=${Resource}&SSN=${SSN}&FromDate=${FromDate}&ToDate=${ToDate}&Status=${Status}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    UpdatePatientAppointmentConfirmStatus: 'UpdatePatientAppointmentConfirmStatus'
};