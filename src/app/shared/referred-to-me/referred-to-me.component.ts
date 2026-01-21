import { Component, Input, OnInit } from '@angular/core';
import { UtilityService } from '../utility.service';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfigService } from 'src/app/services/config.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from '../generic-modal-builder.service';
import { ProgressNoteComponent } from 'src/app/ward/progress-note/progress-note.component';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { PatientfoldermlComponent } from '../patientfolderml/patientfolderml.component';

declare var $: any;

const MY_FORMATS = {
    parse: {
        dateInput: 'dd-MMM-yyyy',
    },
    display: {
        dateInput: 'DD-MMM-yyyy',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'dd-MMM-yyyy',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-referred-to-me',
    templateUrl: './referred-to-me.component.html',
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
export class ReferredToMeComponent implements OnInit {
    tablePatientsForm!: FormGroup;
    hospitalId: any;
    langData: any;
    loggedinUserDetails: any;
    facilityId: any;
    referralsToMeData: any;
    referralsToMeData1: any;
    wtpinfo: any;
    assignedToMe: boolean = true;
    isFromSuitDashboard: boolean = false;


    constructor(private configService: ConfigService, private us: UtilityService, private fb: FormBuilder, private datepipe: DatePipe, private modalService: GenericModalBuilder, private config: BedConfig) {
        this.langData = this.configService.getLangData();
        this.loggedinUserDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        this.hospitalId = sessionStorage.getItem("hospitalId");
        const facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = facility.FacilityID == undefined ? facility : facility.FacilityID;
        this.isFromSuitDashboard = sessionStorage.getItem('isFromSuitDashboard') === "true" ? true : false;
    }

    ngOnInit(): void {
        this.initializetablePatientsForm();
        this.FetchData();
    }

    initializetablePatientsForm() {
        var d = new Date();
        if(this.isFromSuitDashboard) {
            d.setDate(d.getDate() - 1); 
        }        
        this.tablePatientsForm = this.fb.group({
            FromDate: d,
            ToDate: new Date(),
            SSN : ''
        });
    }

    fetchPanicwithdates(filter: any) {
        if (filter === "M") {
            var wm = new Date();
            wm.setMonth(wm.getMonth() - 1);
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "3M") {

            var wm = new Date();
            wm.setMonth(wm.getMonth() - 3);
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "6M") {
            var wm = new Date();
            wm.setMonth(wm.getMonth() - 6);
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "1Y") {

            var wm = new Date();
            wm.setMonth(wm.getMonth() - 12);
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "W") {

            var d = new Date();
            d.setDate(d.getDate() - 7); // Subtract 7 days for the past week.
            var wm = d;
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "T") {

            var d = new Date();
            d.setDate(d.getDate()); // Subtract 7 days for the past week.
            var wm = d;
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "Y") {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            this.tablePatientsForm.patchValue({
                FromDate: d,
                ToDate: d,
            });
        }
        this.FetchData();
    }

    onDateChange() {
        this.FetchData();
    }

    onSSNEnterPress(event: any) {
        const ssn = event.target.value;
        this.tablePatientsForm.patchValue({
            SSN : ssn
        });
        this.FetchData();
    }

    FetchData() {
        if (!this.tablePatientsForm.value['FromDate'] || !this.tablePatientsForm.value['ToDate']) {
            return;
        }
        const FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
        const ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
        
        const url = this.us.getApiUrl(ReferredToMe.FetchReferalSocialWorkerDoctorOrders, {
            SpecialiseID: 317,
            DoctorID: 0,
            FromDate: FromDate,
            ToDate: ToDate,
            SSN: this.tablePatientsForm.get("SSN")?.value === '' ? '0' : this.tablePatientsForm.get("SSN")?.value,
            HospitalID: this.hospitalId,
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {                
                this.referralsToMeData = this.referralsToMeData1 = response.FetchReferredtoMeListOutputAALists;
                if(this.assignedToMe) {
                    this.referralsToMeData = this.referralsToMeData1 = 
                    response.FetchReferredtoMeListOutputAALists?.filter((x: any) => x.DoctorID == this.loggedinUserDetails[0].EmpId || x.DoctorID == '');
                }
                this.referralsToMeData?.forEach((element: any, index: any) => {
                    element.showAcceptReject = "col-12 p-2 d-flex align-items-end d-none";
                    element.imgSource = "assets/images/icons/arrow-down.svg";
                    var ReferalStatus = response.FetchReferredtoMeListOutputAALists[index].Status;
                    if (ReferalStatus == 0) {
                        element.Class = "legend_line ReferalNewRequest";
                    }
                    else if (ReferalStatus == 3) {
                        element.Class = "legend_line ReferalRejected";
                    }
                    else {
                        element.Class = "legend_line ReferalAccepted";
                    }
                })
            } else {
                this.referralsToMeData = [];
            }
        });
    }

    showAcceptReject(reftome: any) {
        if (reftome.showAcceptReject == "col-12 p-2 d-flex align-items-end d-none")
            reftome.showAcceptReject = "col-12 p-2 d-flex align-items-end";
        else {
            reftome.showAcceptReject = "col-12 p-2 d-flex align-items-end d-none";
        }
        if (reftome.imgSource == "assets/images/icons/arrow-down.svg")
            reftome.imgSource = "assets/images/icons/icon-arrow-up.svg";
        else {
            reftome.imgSource = "assets/images/icons/arrow-down.svg";
        }
    }

    redirecttoProgressNotes(item: any) {
        if (item.Status === '2') {
            item.Bed = item.BedName;
            sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
            const options: NgbModalOptions = {
                size: 'xl',
                windowClass: 'vte_view_modal',
            };
            const modalRef = this.modalService.openModal(ProgressNoteComponent, {
                isPopup: true
            }, options);
        }
    }

    acceptswReferral(reftome: any, rem: any) {
        const payload = {
            "ReferralOrderID": Number(reftome.ReferralOrderID),
            "DoctorID": Number(this.loggedinUserDetails[0].EmpId),
            "UserID": Number(this.loggedinUserDetails[0].UserId),
            "WorkStationID": Number(this.facilityId),
            "HospitalID": Number(this.hospitalId),
        };
        this.us.post(ReferredToMe.UpdateSocialWorkerDoctor, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#acceptReferralMsg').modal('show');
                this.acceptReferral(reftome, rem);
            }
        },
            (err) => {

            });
    }

    acceptReferral(reftome: any, rem: any) {
        var status=reftome.Status==''?0:reftome.Status;
        this.config.updateReferredtoMe(reftome.ReferralOrderID, rem.value == '' ? "0" : rem.value, this.loggedinUserDetails[0].EmpId, status, 2, this.loggedinUserDetails[0].UserId, 3468, this.hospitalId)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    //$("#acceptReferralMsg").modal('show');
                }
            },
                (_) => {
                });
    }

    rejectReferral(reftome: any, rem: any) {
        if (rem.value != "") {
            this.config.updateReferredtoMe(reftome.ReferralOrderID, rem.value, this.loggedinUserDetails[0].EmpId, 0, 3, this.loggedinUserDetails[0].UserId, 3468, this.hospitalId)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        $("#rejectReferralMsg").modal('show');
                    }
                },
                    (_) => {
                    })
        }
        else {
            $("#validateRemarksForAcceptReject").modal('show');
        }
    }

    fetchPatientWalkthroughInfoForReferrals(patinfo: any) {
        patinfo.AdmissionID = patinfo.IPID;
        patinfo.HospitalID = this.hospitalId;
        patinfo.PatientID = patinfo.PatientID;
        patinfo.FromDoctor = patinfo.ReferralDoctorName;
        this.wtpinfo = patinfo;
        $("#walkthrough_info").modal('show');
    }

    clearPatientInfo() {
        this.wtpinfo = "";
    }

    clearData() {
        this.initializetablePatientsForm();
        $("#NationalId").val('');
        this.referralsToMeData = [];
        this.wtpinfo = "";
        this.FetchData();
    }

    getStatusCount(type: number) {
        if (type === 4) {
            return this.referralsToMeData1?.length;
        }
        return this.referralsToMeData1?.filter((x: any) => x.Status === type.toString()).length;
    }

    navigatetoPatientSummary(pat: any, event: any) {
        event.stopPropagation();
        sessionStorage.setItem("PatientDetails", JSON.stringify(pat));
        sessionStorage.setItem("selectedView", JSON.stringify(pat));
        sessionStorage.setItem("selectedPatientAdmissionId", pat.AdmissionID);
        sessionStorage.setItem("PatientID", pat.PatientID);
        sessionStorage.setItem("SummaryfromCasesheet", "true");
        sessionStorage.setItem("FromPhysioTherapyWorklist", "true");
    
        const options: NgbModalOptions = {
          windowClass: 'vte_view_modal'
        };
        const modalRef = this.modalService.openModal(PatientfoldermlComponent, {
          data: pat,
          readonly: true,
          selectedView: pat
        }, options);
    }
    filterStatus(status: number) {
        if (status == 2) {
            this.referralsToMeData = this.referralsToMeData1?.filter((x: any) => x.Status === '2');
        }
        else if (status == 0) {
            this.referralsToMeData = this.referralsToMeData1?.filter((x: any) => x.Status === '0');
        }
        else if (status == 1) {
            this.referralsToMeData = this.referralsToMeData1?.filter((x: any) => x.Status === '1');
        }
        else if (status == 3) {
            this.referralsToMeData = this.referralsToMeData1?.filter((x: any) => x.Status === '3');
        }
        else if (status == 4) {
            this.referralsToMeData = this.referralsToMeData1;
        }
    }
}

const ReferredToMe = {
    FetchReferredtoMe: 'FetchReferredtoMe?DoctorID=${DoctorID}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchReferalSocialWorkerDoctorOrders: 'FetchReferalSocialWorkerDoctorOrders?SpecialiseID=${SpecialiseID}&DoctorID=${DoctorID}&FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&HospitalID=${HospitalID}',
    UpdateSocialWorkerDoctor: 'UpdateSocialWorkerDoctorA'

};