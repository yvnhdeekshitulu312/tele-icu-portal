import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { ConfigService as BedConfig } from '../../ward/services/config.service';
import { count } from 'rxjs';

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
    selector: 'app-op-drug-administration',
    templateUrl: './op-drug-administration.component.html',
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
export class OpDrugAdministrationComponent extends BaseComponent implements OnInit {
    sortedGroupedByScheduleDate: any;
    showNoRecFound: boolean = true;
    ssn: any = '';
    facility: any;
    FetchPatientPrescriptionInjectionSchedulesDataList: any;
    selectedRecord: any;
    showAdministerPopup: boolean = false;
    currentDate: any = moment().format('DD-MMM-YYYY');
    witnessNurseData: any;
    selectedNurse: any;
    administeredType = '0';
    Count = '0';
    errorMsg: string = "";
    errorMessages: any = [];
    vaccinationsList: any = [];
    patientvaccinationsList: any = [];
    reasonsList: any = [];
    BloodselectedView: any= [];
    doseOrderList: any = [
        { "DoseOrderID": 1, "DoseOrderName": "1" },
        { "DoseOrderID": 2, "DoseOrderName": "2" },
        { "DoseOrderID": 3, "DoseOrderName": "3" },
        { "DoseOrderID": 4, "DoseOrderName": "4" },
        { "DoseOrderID": 5, "DoseOrderName": "5" },
        { "DoseOrderID": 6, "DoseOrderName": "6" }
    ];
    constructor(private us: UtilityService, private bed_config: BedConfig) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.fetchVaccinationsAndReasons();
    }

    selectType(type: any) {
        this.administeredType = type;
        this.filterData();

    }

    searchDrugAdministration() {
        this.showNoRecFound = true;
        this.sortedGroupedByScheduleDate = [];
         this.BloodselectedView= [];
        this.FetchPatientPrescriptionInjectionSchedulesDataList = [];
        if (this.ssn != '') {
            const url = this.us.getApiUrl(OpDrugAdministration.FetchPatientPrescriptionInjectionSchedules, {
                SSN: this.ssn,
                PrescriptionID: '0',
                WorkStationID: this.facility.FacilityID,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.FetchPatientPrescriptionInjectionSchedulesDataList = response.FetchPatientPrescriptionInjectionSchedulesDataList;
                        this.filterData();
                    }
                },
                    () => {
                    });
        }
    }

    filterData() {
        this.showNoRecFound = true;
        let data; let dataAAA;
        dataAAA = this.FetchPatientPrescriptionInjectionSchedulesDataList.filter((item: any) => item.IsScheduleCompleted === 'True');
        this.Count = dataAAA.length;
        if (this.administeredType === '0') {
            data = this.FetchPatientPrescriptionInjectionSchedulesDataList.filter((item: any) => item.IsScheduleCompleted === 'False');
        } else {
            data = this.FetchPatientPrescriptionInjectionSchedulesDataList.filter((item: any) => item.IsScheduleCompleted === 'True');
        }
        if (data.length > 0) {
            this.showNoRecFound = false;
            const groupedByScheduleDate = data.reduce((acc: any, current: any) => {
                const scheduleDate = current.ScheduleDate.split(' ')[0];
                if (!acc[scheduleDate]) {
                    acc[scheduleDate] = [];
                }
                acc[scheduleDate].push(current);
                return acc;
            }, {});

            if (this.administeredType === '1') {
                this.sortedGroupedByScheduleDate = Object.entries(groupedByScheduleDate)
                    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                    .map(([scheduleDate, items]) => ({ scheduleDate, items }));
            } else {
                this.sortedGroupedByScheduleDate = Object.entries(groupedByScheduleDate)
                    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                    .map(([scheduleDate, items]) => ({ scheduleDate, items }));
            }
        }
    }

    clearForm() {
        this.administeredType = '0';
        this.ssn = '';
        this.sortedGroupedByScheduleDate = [];
        this.FetchPatientPrescriptionInjectionSchedulesDataList = [];
        this.showNoRecFound = true;
        this.Count = '0';
        this.BloodselectedView= [];
    }

    onSSNEnterPress(event: any) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            this.searchDrugAdministration();
        }
    }

    openAdministerPopup(item: any) {
        this.showAdministerPopup = true;
        item.VaccinationDoseCount = 1;
        item.VaccinationType = 1;
        item.VaccinationID = 0
        item.VaccinationReasonID = 0;
        item.VaccinationReasonOther = '';
        this.selectedRecord = item;
        if (item.IsHighRisk == 'True') {
            this.selectedNurse = null;
        } else {
            this.selectedNurse = item;
        }
        $('#administered_modal').modal('show');
    }

    searchWitnessNurse(event: any) {
        if (event.target.value.length >= 3) {
            var filter = event.target.value;
            this.bed_config.fetchWitnessNurse(filter, this.hospitalID)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.witnessNurseData = response.FetchRODNursesDataList;
                    }
                },
                    (err) => {

                    })
        } else {
            this.witnessNurseData = [];
        }
    }

    onWitnessNurseSelected(item: any) {
        if (this.doctorDetails[0].EmpId == item.Empid) {
            this.witnessNurseData = [];
            this.errorMsg = "Logged in user and witness nurse cannot be same";
            $('#modalValidationMessage').modal('show');
            setTimeout(() => {
                $("#txtwitnessNurse").val('');
            }, 0);
            return;
        }
        this.selectedNurse = item;
        this.witnessNurseData = [];
    }

    saveAdminister() {
        this.errorMessages = [];
        if (this.doctorDetails[0].EnableNVR === 'YES' && this.selectedRecord.IsVaccine == 'True') {
            if (this.selectedRecord.VaccinationID == 0) {
                this.errorMessages.push("Please select Vaccine");
            }
            if (this.selectedRecord.VaccinationDoseCount == 0) {
                this.errorMessages.push("Please select Dose Order");
            }
            if (this.selectedRecord.VaccinationReasonID == 0) {
                this.errorMessages.push("Please select Reason for Vaccination");
            }
            if (this.selectedRecord.VaccinationReasonID == 34 && !this.selectedRecord.VaccinationReasonOther) {
                this.errorMessages.push("Please enter Other Reasons for Vaccination");
            }
        }
        if (this.errorMessages.length > 0) {
            $('#errorMessagesModal').modal('show');
            return;
        }
        const payload = {
            "InjectionScheduleID": this.selectedRecord.InjectionScheduleID,
            "WitnessUserID": this.selectedNurse.Empid == undefined ? 0 : this.selectedNurse.Empid,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facility.FacilityID,
            "Hospitalid": this.hospitalID,
            "VaccinationID": this.selectedRecord.VaccinationID,
            "VaccinationDoseCount": this.selectedRecord.VaccinationDoseCount,
            "VaccinationReasonID": this.selectedRecord.VaccinationReasonID,
            "VaccinationReasonOther": this.selectedRecord.VaccinationReasonID == 34 ? this.selectedRecord.VaccinationReasonOther : '',
            "VaccinationType": this.selectedRecord.VaccinationType
        };
        this.us.post(OpDrugAdministration.UpdatePatientPrescriptionInjectionSchedulesStatus, payload).subscribe((response) => {
            if (response.Code === 200) {
                $('#administered_modal').modal('hide');
                $('#saveMsg').modal('show');
                this.showAdministerPopup = false;
                this.searchDrugAdministration()
            }
        },
            (err) => {
                console.log(err)
            });
    }

    fetchVaccinationsAndReasons() {
        const url = this.us.getApiUrl(OpDrugAdministration.FetchSehaVaccinationsAndReasons, {
            HospitalID: this.hospitalID,
            WorkStationID: this.facility.FacilityID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.vaccinationsList = response.FetchSehaVaccinationsAndReasonsData1List;
                    this.reasonsList = response.FetchSehaVaccinationsAndReasonsData2List;
                }
            },
                (err) => {
                    console.log(err);
                });
    }
    SaveRetrySeha(item: any) {
        const payload = {
            "InjectionScheduleID": item.InjectionScheduleID,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facility.FacilityID,
            "Hospitalid": this.hospitalID
        };
        this.us.post(OpDrugAdministration.UpdatePatientPrescriptionInjectionSchedulesStatusSeha, payload).subscribe((response) => {
            if (response.Code === 200) {
                $('#administered_modal').modal('hide');
                $('#saveMsg').modal('show');
                this.showAdministerPopup = false;
                this.searchDrugAdministration()
            } else {
                this.errorMsg = response.SehaerrorMessage;
                $('#modalValidationMessage').modal('show');
            }
        },
            (err) => {
                console.log(err)
            });
    }
    FetchPatientVaccinationDetailSeha(item: any) {
        this.BloodselectedView=item;
        $('#SehaVaccResultsModal').modal('show');
        const url = this.us.getApiUrl(OpDrugAdministration.FetchPatientVaccinationDetailSeha, {
            InjectionScheduleID: item.InjectionScheduleID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID,
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.patientvaccinationsList = response.FetchPatientVaccinationDetailSehaVaccList;

                }
            },
                (err) => {
                    console.log(err);
                });
    }
}

export const OpDrugAdministration = {
    FetchPatientPrescriptionInjectionSchedules: 'FetchPatientPrescriptionInjectionSchedules?SSN=${SSN}&PrescriptionID=${PrescriptionID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    UpdatePatientPrescriptionInjectionSchedulesStatus: 'UpdatePatientPrescriptionInjectionSchedulesStatus',
    UpdatePatientPrescriptionInjectionSchedulesStatusSeha: 'UpdatePatientPrescriptionInjectionSchedulesStatusSeha',
    FetchPatientVaccinationDetailSeha: 'FetchPatientVaccinationDetailSeha?InjectionScheduleID=${InjectionScheduleID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchSehaVaccinationsAndReasons: 'FetchSehaVaccinationsAndReasons?HospitalID=${HospitalID}&WorkStationID=${WorkStationID}'
};
