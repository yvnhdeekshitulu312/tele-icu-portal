import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
declare var $: any;

@Component({
    selector: 'app-radiology-appointment',
    templateUrl: './radiology-appointment.component.html',
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
export class RadiologyAppointmentComponent extends BaseComponent implements OnInit {
    datesForm: any;
    FetchPatientRadiologyAppointmentsWorkList: any = [];
    toDate = new FormControl(new Date());
    errorMessages: any = [];
    showNoRecFound: boolean = true;
    constructor(private router: Router, private us: UtilityService, public datepipe: DatePipe, public formBuilder: FormBuilder) {
        super();
        const wm = new Date();
        wm.setDate(wm.getDate() - 2);

        this.datesForm = this.formBuilder.group({
            fromdate: wm,
            todate: this.toDate.value,
            SSN: ['']
        });
    }

    ngOnInit(): void {
        this.FetchPatientRadiologyAppointments();
    }
    onEnterPress(event: any) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            this.FetchPatientRadiologyAppointments();
        }
    }
    onEnterChange() {
        this.FetchPatientRadiologyAppointments();
    }
    clearViewScreen() {
        this.FetchPatientRadiologyAppointmentsWorkList = [];
        $("#ssn").val('');
        const wm = new Date();
        wm.setDate(wm.getDate() - 2);

        this.datesForm = this.formBuilder.group({
            fromdate: wm,
            todate: this.toDate.value,
            SSN: ['']
        });
        this.FetchPatientRadiologyAppointments();
    }

    FetchPatientRadiologyAppointments() {
        const fromDate = this.datesForm.get('fromdate').value;
        const todate = this.datesForm.get('todate').value;

        if (!fromDate || !todate) {
            return;
        }

        const url = this.us.getApiUrl(RadiologyAppointment.FetchPatientRadiologyAppointmentsWorkList, {
            FromDate: this.datepipe.transform(fromDate, "dd-MMM-yyyy")?.toString(),
            ToDate: this.datepipe.transform(todate, "dd-MMM-yyyy")?.toString(),
            SSN: this.datesForm.get('SSN').value ? this.datesForm.get('SSN').value : 0,
            ServiceID: 3,
            WorkStationID: this.doctorDetails[0]?.FacilityId,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.FetchPatientRadiologyAppointmentsWorkList = response.FetchPatientAppointmentsWorkListDataList;
                    this.FetchPatientRadiologyAppointmentsWorkList.forEach((element: any) => {
                        if (element.ScheduleID != "")
                            element.Class = "doctor_worklist mb-2 rounded-2 worklist_patientcard Scheduled";
                        else
                            element.Class = "doctor_worklist mb-2 rounded-2 worklist_patientcard prescribed";
                    });

                    if (this.FetchPatientRadiologyAppointmentsWorkList.length > 0) {
                        this.showNoRecFound = false;
                    } else {
                        this.showNoRecFound = true;
                    }
                } else {
                    this.showNoRecFound = true;
                }
            },
                (_) => {

                });
    }

    navigateToWorklist(item: any) {
        sessionStorage.setItem('RadiologyAppointment', JSON.stringify(item));
        this.router.navigate(['/suit/radiologyworklist'])
    }
}

export const RadiologyAppointment = {
    FetchPatientRadiologyAppointmentsWorkList: "FetchPatientRadiologyAppointmentsWorkList?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&ServiceID=${ServiceID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}"
};
