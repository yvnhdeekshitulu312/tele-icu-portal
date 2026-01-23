import { DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { Router } from "@angular/router";
import { Subscription, timer } from "rxjs";
import { UtilityService } from "src/app/shared/utility.service";
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from '../services/config.service';

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
    selector: 'app-icu-bed-details',
    templateUrl: './icu-bed-details.component.html',
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
export class ICUBedDetailsComponent implements OnInit, OnDestroy {
    doctorDetails: any;
    wardID: any = '2090';
    langData: any;

    selectedICUBed: any = [];
    ICUBeds: any = []
    filteredICUBeds: any = [];
    refreshTime: any = new Date();
    private refreshSub!: Subscription;
    FetchDoctorReferralOrdersDataList: any = [];
    patientCaseRecVisits: any = [];
    trustedUrl: any;
    IsBiometric = true;

    constructor(private router: Router, private us: UtilityService, private configService: ConfigService, private config: BedConfig) {

    }

    ngOnInit(): void {
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        this.langData = this.configService.getLangData();
        this.filteredICUBeds = this.ICUBeds = JSON.parse(sessionStorage.getItem("icubeds") || '{}');
        if (sessionStorage.getItem("icubeddetails")) {
            this.selectedICUBed = JSON.parse(sessionStorage.getItem("icubeddetails") || '{}');
            this.fetchICUBed();
        } else {
            this.navigateToICUBeds();
        }
    }

    ngOnDestroy() {
        if (this.refreshSub) {
            this.refreshSub.unsubscribe();
        }
        sessionStorage.removeItem('icubeds');
        sessionStorage.removeItem('icubeddetails');
    }

    onSelectBed(item: any) {
        this.selectedICUBed = item;
        this.fetchICUBed();
    }

    startAutoRefresh() {
        if (this.refreshSub) {
            this.refreshSub.unsubscribe();
        }

        this.refreshSub = timer(5 * 60 * 1000)
            .subscribe(() => {
                this.fetchICUBed();
            });
    }

    fetchICUBed() {
        const url = this.us.getApiUrl(ICUBedDetails.FetchBedsFromWardNPTeleICCU, {
            WardID: this.wardID,
            ConsultantID: 0,
            Status: 3,
            UserId: this.doctorDetails[0].UserId,
            HospitalID: 0,
            AdmissionID: this.selectedICUBed.AdmissionID
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.refreshTime = new Date();
                this.startAutoRefresh();
                const FetchBedsFromWardLabRadDataList = response.FetchBedsFromWardLabRadDataList;
                this.selectedICUBed = response.FetchBedsFromWardDataList.map((element: any) => {
                    const isFound = FetchBedsFromWardLabRadDataList.filter((a: any) => a.AdmissionID === element.AdmissionID);
                    const labResults: any[] = isFound.filter((a: any) => a.IsResult == '4');
                    const radResults: any[] = isFound.filter((a: any) => a.IsResult == '7');
                    return {
                        ...element,
                        isCritical: isFound.length >= 1,
                        labResults,
                        radResults
                    };
                })[0];
                sessionStorage.setItem("icubeddetails", JSON.stringify(this.selectedICUBed));
                this.fetchDoctorReferals();
            }
        });
    }

    navigateToICUBeds() {
        this.router.navigate(['/ward/icu-beds']);
    }

    onLogout() {
        this.configService.onLogout();
    }

    getTimeAgo(dateStr: string): string {
        const parsedDate = new Date(dateStr.replace(/-/g, ' '));
        const now = new Date();

        const diffMinutes = Math.floor((now.getTime() - parsedDate.getTime()) / 60000);

        if (diffMinutes < 1) return 'JUST NOW';
        if (diffMinutes < 60) return `${diffMinutes} MIN AGO`;

        return `${Math.floor(diffMinutes / 60)} HRS AGO`;
    }

    fetchDoctorReferals() {
        this.FetchDoctorReferralOrdersDataList = [];
        this.config.FetchDoctorReferralOrders(this.selectedICUBed.AdmissionID, this.selectedICUBed.WardID, this.selectedICUBed.HospitalID).subscribe((response: any) => {
            if (response.Code == 200) {
                this.FetchDoctorReferralOrdersDataList = response.FetchDoctorReferralOrdersDataList;
                this.FetchDoctorReferralOrdersDataList.forEach((element: any, index: any) => {
                    element.isVerified = element?.IsVisited === 'True' ? true : false;
                    element.VerifiedBy = element.VisitUpdatedByName;
                    element.VerifiedDate = element.VisitedDate;
                    element.Comments = element.Comments;
                });
            }
        }, (error) => {
            console.error('Get Data API error:', error);
        });
    }

    openReferrals() {
        if (this.FetchDoctorReferralOrdersDataList.length > 0) {
            $('#viewReferal').modal('show');
        }
    }

    openCaseRecord() {
        this.FetchPatientCaseRecord(this.selectedICUBed.AdmissionID, this.selectedICUBed.PatientID);
        this.showCareRecordModal();
        this.fetchPatientVisits();
    }

    FetchPatientCaseRecord(admissionId: any, patientId: any) {
        this.configService.FetchPatientCaseRecord(admissionId, patientId, 0, this.doctorDetails[0].UserName, this.doctorDetails[0]?.UserId, this.selectedICUBed.WardID, this.selectedICUBed.HospitalID)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.trustedUrl = response?.FTPPATH;
                }
            },
                (err) => {

                })
    }

    showCareRecordModal() {
        $("#caseRecordModal").modal('show');
    }

    fetchPatientVisits() {
        this.configService.fetchPatientVisits(this.selectedICUBed.PatientID, this.selectedICUBed.HospitalID)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.patientCaseRecVisits = response.PatientVisitsDataList;
                }
            },
                (err) => {

                })
    }

    onVisitsChange(event: any) {
        const admissionID = event.target.value;
        const patientdata = this.patientCaseRecVisits.find((visit: any) => visit.AdmissionID == admissionID);
        this.FetchPatientCaseRecord(patientdata.AdmissionID, patientdata.PatientID);
    }
}

const ICUBedDetails = {
    'FetchBedsFromWardNPTeleICCU': 'FetchBedsFromWardNPTeleICCU?WardID=${WardID}&AdmissionID=${AdmissionID}&ConsultantID=${ConsultantID}&Status=${Status}&UserId=${UserId}&HospitalID=${HospitalID}'
}