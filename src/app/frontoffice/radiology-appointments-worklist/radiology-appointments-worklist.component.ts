import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

@Component({
    selector: 'app-radiology-appointments-worklist',
    templateUrl: './radiology-appointments-worklist.component.html',
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
export class RadiologyAppointmentsWorklistComponent extends BaseComponent implements OnInit {
    cancelall = false;
    datesForm: any;
    toDate = new FormControl(new Date());
    PatientAppointmentsWorkList: any = [];
    PatientAppointmentsWorkList1: any = [];
    sortedGroupedByAdmitDate: any = [];
    locationList: any = [];
    lang: any;
    direction: string = '';

    constructor(private us: UtilityService, public datepipe: DatePipe, public formBuilder: FormBuilder) {
        super();
        this.lang = sessionStorage.getItem("lang");
        if (this.lang == 'ar') {
            this.direction = 'rtl';
        }
        const wm = new Date();
        this.datesForm = this.formBuilder.group({
            HospitalID: [],
            HospitalName: [''],
            HospitalName2l: [''],
            fromdate: wm,
            todate: wm,
            SSN: ['']
        });
    }

    ngOnInit(): void {
        this.fetchHospitalLocations();
    }

    fetchHospitalLocations() {
        const url = this.us.getApiUrl(futureAppointments.fetchHospitalLocations, {});
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.locationList = response.HospitalLocationsDataList;
                    var res = response.HospitalLocationsDataList.find((h: any) => h.HospitalID == this.hospitalID);
                    this.selectedHospital(res);
                }
            },
                (err) => {
                })
    }

    selectedHospital(item: any) {
        this.datesForm.patchValue({
            HospitalID: item.HospitalID,
            HospitalName: item.Name,
            HospitalName2l: item.Name2l
        });
        this.FetchPatientAppointmentsWorkList();
    }

    onEnterPress(event: any) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            this.FetchPatientAppointmentsWorkList();
        }
    }

    FetchPatientAppointmentsWorkList() {
        this.PatientAppointmentsWorkList = []
        const fromDate = this.datesForm.get('fromdate').value;
        const todate = this.datesForm.get('todate').value;
        let formattedFromDate;
        let formattedToDate;

        if (fromDate !== null && fromDate !== undefined) {
            formattedFromDate = this.datepipe.transform(fromDate, "dd-MMM-yyyy")?.toString() ?? '';
        }

        if (todate !== null && todate !== undefined) {
            formattedToDate = this.datepipe.transform(todate, "dd-MMM-yyyy")?.toString() ?? '';
        }

        if (!fromDate || !todate) {
            return;
        }

        const params = {
            FromDate: formattedFromDate,
            ToDate: formattedToDate,
            SSN: this.datesForm.get('SSN').value ? this.datesForm.get('SSN').value : 0,
            UserId: this.doctorDetails[0].UserId,
            WorkStationID: this.doctorDetails[0]?.FacilityId ?? 0,
            HospitalID: this.datesForm.get('HospitalID').value
        };

        const url = this.us.getApiUrl(futureAppointments.FetchPatientRadiologyAppointmentsWorkListR, params);

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.PatientAppointmentsWorkList = this.PatientAppointmentsWorkList1 = response.FetchPatientRadiologyAppointmentsWorkListDataList;
                    const groupedByAdmitDate = this.PatientAppointmentsWorkList.reduce((acc: any, current: any) => {
                        const admitDate = current.AppointmentDateTime.split(' ')[0];
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
            },
                (err) => {

                })
    }

    filterAppointmentStatus(type: string) {
        if (this.PatientAppointmentsWorkList) {
            if (type == '2') {
                this.PatientAppointmentsWorkList = this.PatientAppointmentsWorkList1;
            } else if (type == '1') {
                this.PatientAppointmentsWorkList = this.PatientAppointmentsWorkList1.filter((x: any) => x.AppointmentStatus === 'Booked');
            } else {
                this.PatientAppointmentsWorkList = this.PatientAppointmentsWorkList1.filter((x: any) => x.AppointmentStatus === 'Cancelled');
            }
            const groupedByAdmitDate = this.PatientAppointmentsWorkList.reduce((acc: any, current: any) => {
                const admitDate = current.AppointmentDateTime.split(' ')[0];
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

    }

    clearViewScreen() {
        this.PatientAppointmentsWorkList = [];
        this.sortedGroupedByAdmitDate = [];
        const wm = new Date();
        this.datesForm = this.formBuilder.group({
            HospitalID: [],
            HospitalName: [''],
            HospitalName2l: [''],
            fromdate: wm,
            todate: wm,
            SSN: ['']
        });
        var res = this.locationList.find((h: any) => h.HospitalID == this.hospitalID);
        this.selectedHospital(res);
    }
}

export const futureAppointments = {
    FetchPatientRadiologyAppointmentsWorkListR: 'FetchPatientRadiologyAppointmentsWorkListR?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    fetchHospitalLocations: 'FetchHospitalLocations?type=0&filter=blocked=0&UserId=0&WorkstationId=0',
};