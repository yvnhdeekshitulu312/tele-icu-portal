import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare var $: any;

@Component({
    selector: 'app-bulk-results-verification',
    templateUrl: './bulk-results-verification.component.html',
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
export class BulkResultsVerificationComponent extends BaseComponent implements OnInit {
    dateForm: any;
    patientType = "1";
    facility: any;
    ssn: any = '';
    barcode: any = '';
    FetchTestOrderSpecimenComponentsDataList: any;
    FetchTestOrderSpecimenComponentsDataList1: any;
    showNoRecFound: boolean = true;
    isSelectAll: boolean = false;
    errorMsg: string = "";
    dataFilter: number = 0;

    constructor(private fb: FormBuilder, private us: UtilityService, private sanitizer: DomSanitizer) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.initializeForm();
        this.FetchBulkResultsData();
    }

    initializeForm() {
        this.dateForm = this.fb.group({
            FromDate: new Date(),
            ToDate: new Date()
        });
    }

    onDateChange() {
        this.FetchBulkResultsData();
    }

    selectPatientType(type: any) {
        this.patientType = type;
        this.FetchBulkResultsData();
    }

    clearSearchCriteria() {
        this.ssn = '';
        this.barcode = '';
        this.FetchBulkResultsData();
    }

    FetchBulkResultsData() {
        this.showNoRecFound = true;
        this.isSelectAll = false;
        this.FetchTestOrderSpecimenComponentsDataList = [];
        this.FetchTestOrderSpecimenComponentsDataList1 = [];
        if (!this.dateForm.get('FromDate')?.value || !this.dateForm.get('ToDate')?.value) {
            return;
        }
        const payload = {
            WardID: '0',
            PanicStatus: 'All',
            PatientType: this.patientType,
            SSN: this.ssn ? this.ssn : '0',
            SampleNumber: this.barcode ? this.barcode : '0',
            TestName: '0',
            FromDate: moment(this.dateForm.get('FromDate').value).format('DD-MMM-YYYY'),
            ToDate: moment(this.dateForm.get('ToDate').value).format('DD-MMM-YYYY'),
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
            HospitalID: this.hospitalID
        };

        const url = this.us.getApiUrl(BulkResultsVerification.FetchTestOrderSpecimenComponents, payload);

        this.us.get(url).subscribe((response: any) => {
            if (response.Code == 200) {
                this.FetchTestOrderSpecimenComponentsDataList = this.FetchTestOrderSpecimenComponentsDataList1 = response.FetchTestOrderSpecimenComponentsDataList;
                this.FetchTestOrderSpecimenComponentsDataList.forEach((element: any) => {
                    element.rowColor = this.getRowColor(element);
                    if (element.TestResult.indexOf("*abnormal") !== -1) {
                        element.TestResult = this.sanitizeHTML(element.TestResult.replace(/\*abnormal/g, "<span style='color:red'>*</span>"));
                    }
                });
                if (this.FetchTestOrderSpecimenComponentsDataList.length > 0) {
                    this.showNoRecFound = false;
                }
                else {
                    this.showNoRecFound = true;
                }
            }
        }, (err: any) => {

        });
    }

    sanitizeHTML(dirtyHTML: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(dirtyHTML);
      }

    fetchDataWithDates(filter: any) {
        if (filter === "M") {
            const wm = new Date();
            wm.setMonth(wm.getMonth() - 1);
            const pd = new Date();
            this.dateForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "3M") {
            const wm = new Date();
            wm.setMonth(wm.getMonth() - 3);
            const pd = new Date();
            this.dateForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "6M") {
            const wm = new Date();
            wm.setMonth(wm.getMonth() - 6);
            const pd = new Date();
            this.dateForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "1Y") {
            const wm = new Date();
            wm.setMonth(wm.getMonth() - 12);
            const pd = new Date();
            this.dateForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "W") {
            const d = new Date();
            d.setDate(d.getDate() - 7); // Subtract 7 days for the past week.
            const wm = d;
            const pd = new Date();
            this.dateForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "T") {
            const d = new Date();
            d.setDate(d.getDate()); // Subtract 7 days for the past week.
            const wm = d;
            const pd = new Date();
            this.dateForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "Y") {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            this.dateForm.patchValue({
              FromDate: d,
              ToDate: d,
            });
        }
        this.FetchBulkResultsData();
    }

    onBarcodeEnterPress(event: any) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            event.preventDefault();
            this.FetchBulkResultsData();
        }
    }

    onSSNEnterPress(event: Event) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            event.preventDefault();
            this.FetchBulkResultsData();
        }
    }

    onSelectAll() {
        this.isSelectAll = !this.isSelectAll;
        this.FetchTestOrderSpecimenComponentsDataList.forEach((element: any) => {
            if (element.CanbeVerified.toString() === '1') {
                element.selected = this.isSelectAll;
            }
        });
    }

    onCDRClick() {
        const selectedTests = this.FetchTestOrderSpecimenComponentsDataList.filter((x: any) => x.selected);
        if (selectedTests.length === 0) {
            this.errorMsg = "Please select atleast one test to release.";
            $('#errorMsg').modal('show');
            return;
        }
        const nonVerifyItems = selectedTests.filter((element: any) => element.CanbeVerified.toString() === '0');
        if (nonVerifyItems.length > 0) {
            this.errorMsg = "Some of the Tests result is entered from equipment and cannot be verified till reporting doctor is tagged.";
            $('#errorMsg').modal('show');
            return;
        }
        const TestVerifyXMLLMS = selectedTests.map((element: any) => {
            return {
                "ORD": element.TestOrderID,
                "ORDITM": element.TestOrderItemId,
                "STS": "8",
                "ISP": "1",
                "SEQ": element.ResultSequence
            }
        });
        var payload = {
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
            "HospitalID": this.hospitalID,
            TestVerifyXMLLMS
        }
        this.us.post(BulkResultsVerification.UpdateTestPreliminaryverifiedStatus, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchBulkResultsData();
                $('#savemsg').modal('show');
            }
        },
            (err) => {

            });
    }

    getRowColor(item: any) {
        if (item.TestResult.indexOf("*P") !== -1) {
            return 'red';
        }
        else if (item.TestResult.indexOf("*L") !== -1 || item.TestResult.indexOf("*H") !== -1) {
            return 'pink'
        }
        return '';
    }

    filterResults(type: number) {
        this.dataFilter = type;
        if(type === 0) {
            this.FetchTestOrderSpecimenComponentsDataList = this.FetchTestOrderSpecimenComponentsDataList1;
        }
        if(type === 1) {
            this.FetchTestOrderSpecimenComponentsDataList = this.FetchTestOrderSpecimenComponentsDataList1.filter((x: any) => x.IsPanic == 'False' && x.IsAbnormal == 'False');
        }
        else if(type === 2) {
            this.FetchTestOrderSpecimenComponentsDataList = this.FetchTestOrderSpecimenComponentsDataList1.filter((x: any) => x.IsPanic == 'True');
        }
        else if(type === 3) {
            this.FetchTestOrderSpecimenComponentsDataList = this.FetchTestOrderSpecimenComponentsDataList1.filter((x: any) => x.IsAbnormal == 'True');
        }
      }

      fetchStatusCount(type: number) {
        if(type === 0) {
            return this.FetchTestOrderSpecimenComponentsDataList.length;
        }
        if(type === 1) {
            return this.FetchTestOrderSpecimenComponentsDataList1.filter((x: any) => x.IsPanic == 'False' && x.IsAbnormal == 'False').length;
        }
        else if(type === 2) {
            return this.FetchTestOrderSpecimenComponentsDataList1.filter((x: any) => x.IsPanic == 'True').length;
        }
        else if(type === 3) {
            return this.FetchTestOrderSpecimenComponentsDataList1.filter((x: any) => x.IsAbnormal == 'True').length;
        } 
      }
}

export const BulkResultsVerification = {
    FetchTestOrderSpecimenComponents: 'FetchTestOrderSpecimenComponents?WardID=${WardID}&PanicStatus=${PanicStatus}&PatientType=${PatientType}&SSN=${SSN}&SampleNumber=${SampleNumber}&TestName=${TestName}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    UpdateTestPreliminaryverifiedStatus: 'UpdateTestPreliminaryverifiedStatus'
};