import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-ssrs-report-config',
    templateUrl: './ssrs-report-config.component.html'
})
export class SsrsReportConfigComponent extends BaseComponent implements OnInit {
    reportTitlesList: any = [];
    facility: any;
    facilityId: any;
    selectedReport: any;
    modulesList: any = [];
    errorMessages: any = [];

    configForm!: FormGroup;

    constructor(private us: UtilityService, private formbuilder: FormBuilder) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
        this.initializeForm();
        this.fetchMasters();
    }

    initializeForm() {
        this.configForm = this.formbuilder.group({
            reportTitleName: '',
            reportPath: '',
            FeatureID:''
        });
    }

    onClearClick() {
        this.initializeForm();
        this.selectedReport = null;
        this.modulesList.forEach((item: any) => {
            item.selected = false;
        })
    }

    onSaveClick() {
        this.errorMessages = [];
        if (!this.configForm.get('reportTitleName')?.value && !this.selectedReport) {
            this.errorMessages.push('Please Enter Report Title');
        }

        if (!this.configForm.get('reportPath')?.value) {
            this.errorMessages.push('Please Enter Report Path');
        }

        const selectedModuels = this.modulesList.filter((item: any) => item.selected).map((item: any) => item.id);

        if (selectedModuels.length === 0) {
            this.errorMessages.push('Please Select Modules');
        }

        if (this.errorMessages.length > 0) {
            $('#errorMsg').modal('show');
            return;
        }

        const payload = {
            "ReportName": this.configForm.get('reportTitleName')?.value,
            "ReportPath": this.configForm.get('reportPath')?.value,
            "ModuleIds": selectedModuels.toString(),
            "ReportID": this.selectedReport?.ReportID ?? "0",
            "ReportType": "2",
            "FeatureID": this.configForm.get('FeatureID')?.value==''? "0":this.configForm.get('FeatureID')?.value,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospitalID
        };

        this.us.post(SSRSReportConfig.InsertReportsMaster, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                this.onClearClick();
            }
        });
    }

    fetchMasters() {
        const url = this.us.getApiUrl(SSRSReportConfig.FetchAdminMasters, {
            Type: 40
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.modulesList = response.SmartDataList;
            }
        });
    }

    searchReportTitle(event: any) {
        this.reportTitlesList = [];
        this.selectedReport = null;
        const filter = event.target.value;
        if (filter.length > 2) {
            var payload: any = {
                Filter: filter,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            }
            const url = this.us.getApiUrl(SSRSReportConfig.FetchAllReports, payload)
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.reportTitlesList = response.FetchAllReportsDataList;
                }
            });
        }
    }

    onReportTitleSelection(item: any) {
        this.reportTitlesList = [];
        this.selectedReport = item;
        var payload: any = {
            ReportID: item.ReportID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        }
        const url = this.us.getApiUrl(SSRSReportConfig.FetchReports, payload)
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.configForm.patchValue({
                    reportTitleName: response.FetchReportsDataList[0].ReportTitle,
                    reportPath: response.FetchReportsDataList[0].ReportName,
                    FeatureID:response.FetchReportsDataList[0].FeatureID
                });
                const selectedModuleIds = response.FetchReportsDataList.map((item: any) => Number(item.ModuleID));
                this.modulesList.forEach((element: any) => {
                    if (selectedModuleIds.indexOf(element.id) !== -1) {
                        element.selected = true;
                    } else {
                        element.selected = false;
                    }
                });
            }
        });
    }
}

export const SSRSReportConfig = {
    FetchAdminMasters: 'FetchAdminMasters?Type=${Type}&Filter=blocked=0',
    FetchAllReports: 'FetchAllReports?Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchReports: 'FetchReports?ReportID=${ReportID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    InsertReportsMaster: 'InsertReportsMaster'
};