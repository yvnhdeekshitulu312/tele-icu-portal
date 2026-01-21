import { Component, OnInit } from '@angular/core';
import { UtilityService } from '../utility.service';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientfoldermlComponent } from '../patientfolderml/patientfolderml.component';
import { GenericModalBuilder } from '../generic-modal-builder.service';

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
    selector: 'app-coordinator-worklist',
    templateUrl: './coordinator-worklist.component.html',
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
export class CoordinatorWorklistComponent implements OnInit {
    tablePatientsForm!: FormGroup;
    hospitalId: any;
    langData: any;
    loggedinUserDetails: any;
    facilityId: any;
    worklistData: any = [];
    worklistData1: any = [];
    specialisationList: any;
    selectedSpecialisation = "-1";
    sortedGroupedByDate: any;
    doctorsList: any = [];
    selectedDoctor: any;
    aprrovalRequestDetails: any = [];
    aprrovalRequests: any = [];
    selectedPatient: any;
    labradOrders: any = [];
    pharmacyOrders: any = [];
    followupDetails: any = [];
    referralDetails: any = [];
    showVip: boolean = false;

    totalItemsCount: any = 0;
    currentPage: number = 0;
    statusCountData: any = [];
    surgeryCountsData: any;
    pharmacyCountsData: any;
    radCountsData: any;
    labCountsData: any;

    constructor(private us: UtilityService, private fb: FormBuilder, private datepipe: DatePipe, private configService: ConfigService, private router: Router, private ms: GenericModalBuilder) {
        this.langData = this.configService.getLangData();
        this.loggedinUserDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        this.hospitalId = sessionStorage.getItem("hospitalId");
        const facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = facility.FacilityID == undefined ? facility : facility.FacilityID;
    }

    ngOnInit(): void {
        this.initializetablePatientsForm();
        this.fetchReferalAdminMasters();
        this.FetchWorklistData();
        this.FetchCoordinatorOrderStatusCount();
    }

    initializetablePatientsForm() {
        this.tablePatientsForm = this.fb.group({
            FromDate: [''],
            ToDate: [''],
        });
        this.tablePatientsForm.patchValue({
            FromDate: new Date(),
            ToDate: new Date()
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
        this.FetchWorklistData();
        this.FetchCoordinatorOrderStatusCount();
    }

    onDateChange() {
        this.FetchWorklistData();
        this.FetchCoordinatorOrderStatusCount();
    }

    SpecialisationChange() {
        this.FetchWorklistData();
    }

    onSSNEnterPress(event: Event) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            event.preventDefault();
            this.FetchWorklistData();
        }
    }

    FetchWorklistData(min = 1, max = 10, currentPage = 1) {
        if (!this.tablePatientsForm.value['FromDate'] || !this.tablePatientsForm.value['ToDate']) {
            return;
        }
        const FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
        const ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
        const url = this.us.getApiUrl(CoordinatorWorklist.FetchcoordinatorPatientVistitsWorkList, {
            FromDate,
            ToDate,
            DoctorId: this.selectedDoctor ? this.selectedDoctor.ID : '0',
            SpecialisationId: Number(this.selectedSpecialisation) >= 0 ? this.selectedSpecialisation : '0',
            ssn: $('#NationalId').val() || "0",
            UserID: this.loggedinUserDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalId,
            min,
            max,
            filter: 0
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.worklistData = this.worklistData1 = response.FetchcoordinatorPatientVistitsWorkListDataList;
                this.currentPage = currentPage;
                this.totalItemsCount = Number(response.FetchcoordinatorPatientVistitsWorkListDataCountList[0]?.Count);

                if (this.showVip) {
                    this.worklistData = this.worklistData1.filter((x: any) => x.IsVIP === '1');
                }
                else {
                    this.worklistData = this.worklistData1;
                }

                // const groupedByOrderDate = this.worklistData.reduce((acc: any, current: any) => {
                //     const AdmitDate = current.AdmitDate.split(' ')[0];
                //     if (!acc[AdmitDate]) {
                //         acc[AdmitDate] = [];
                //     }
                //     acc[AdmitDate].push(current);
                //     return acc;
                // }, {});

                // this.sortedGroupedByDate = Object.entries(groupedByOrderDate)
                //     .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                //     .map(([AdmitDate, items]) => ({ AdmitDate, items }));
            } else {
                this.totalItemsCount = 0;
                this.worklistData = this.worklistData1 = [];
                this.currentPage = 0;
            }
        });
    }

    getOrdersCount(item: any) {
        return Number(item.LabCount) + Number(item.RadCount) + Number(item.UnBilledLabCount) + Number(item.UnBilledRadCount);
    }

    onClearClick() {
        $('#NationalId').val('');
        $('#doctorSearchText').val('');
        this.selectedDoctor = null;
        this.selectedPatient = null;
        this.selectedSpecialisation = '-1';
        this.initializetablePatientsForm();
        this.totalItemsCount = 0;
        this.currentPage = 0;
        this.worklistData = this.worklistData1 = [];
        this.FetchWorklistData();
        this.FetchCoordinatorOrderStatusCount();
    }

    fetchReferalAdminMasters() {
        this.configService.fetchAdminMasters(11).subscribe((response) => {
            this.specialisationList = response.SmartDataList;
        });
    }

    searchEmployee(event: any) {
        if (event.target.value.length > 2) {
            const url = this.us.getApiUrl(CoordinatorWorklist.FetchSSEmployees,
                { name: event.target.value, UserId: this.loggedinUserDetails[0].UserId, WorkStationID: this.facilityId, HospitalID: this.hospitalId });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.doctorsList = response.FetchSSEmployeesDataList;
                    }
                },
                    (err) => {
                    })
        }
    }

    onDoctorSelected(item: any) {
        this.doctorsList = [];
        this.selectedDoctor = item;
    }

    //Future Appointments - Navigating to doctor appointment
    rescheduleAppointment(app: any) {
        sessionStorage.setItem("dischargefollowups", JSON.stringify(app));
        sessionStorage.setItem("fromCoordinatorWorklist", "true");
        this.router.navigate(['/frontoffice/doctorappointment'])
    }

    //Approvals - showing visit's approvals in pop up
    viewApprovals(item: any) {
        this.selectedPatient = item;
        this.configService.FetchApprovalRequestAdv(item.AdmissionID, this.loggedinUserDetails[0].UserId, '3591', this.hospitalId)
            .subscribe((response: any) => {
                $('#viewApprovalsModal').modal('show');
                if (response.ApprovalRequestsDataList.length > 0) {
                    this.aprrovalRequests = response.ApprovalRequestsDataList;
                    this.aprrovalRequestDetails = response.ApprovalRequestDetailsDataList;
                    this.aprrovalRequestDetails.forEach((element: any) => {
                        if (element.ClaimStatusID == '0') {
                            element.class = "status red";
                        }
                        else if (element.ClaimStatusID == '') {
                            element.class = "status green";
                        }
                        else if (element.ClaimStatusID == '') {
                            element.class = "status green";
                        }
                        else if (element.ClaimStatusID == '') {
                            element.class = "status green";
                        }
                    });
                }

            },
                (err) => {
                })
    }

    //Surgeries - Navigating to OR-Dashboard
    navigateToOrDashboard(item: any) {
        sessionStorage.setItem("PatientDetails", JSON.stringify(item));
        sessionStorage.setItem("fromCoordinatorWorklist", "true");
        this.router.navigate(['/ot/ot-dashboard']);
    }

    //Admission Requests - Navigating to admission request
    navigateToAdmissionReq(item: any) {
        sessionStorage.setItem("PatientDetails", JSON.stringify(item));
        sessionStorage.setItem("fromCoordinatorWorklist", "true");
        this.router.navigate(['/admission/admissionrequests']);
    }

    openPatientSummary(item: any, event: any) {
        event.stopPropagation();
        sessionStorage.setItem("PatientDetails", JSON.stringify(item));
        sessionStorage.setItem("selectedView", JSON.stringify(item));
        sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
        sessionStorage.setItem("PatientID", item.PatientID);
        sessionStorage.setItem("SummaryfromCasesheet", "true");
        // sessionStorage.setItem("FromPhysioTherapyWorklist", "true");

        const options: NgbModalOptions = {
            windowClass: 'vte_view_modal'
        };

        const modalRef = this.ms.openModal(PatientfoldermlComponent, {
            data: item,
            readonly: true,
            selectedView: item
        }, options);
    }

    FetchLabRadOrders(item: any) {
        this.selectedPatient = item;
        const url = this.us.getApiUrl(CoordinatorWorklist.FetchPatientVisitLabRadOrderDetails, {
            admissionId: item.AdmissionID,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalId
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.labradOrders = response.FetchPatientVisitLabRadOrderDetailsDataList;
                $('#viewOrdersModal').modal('show');
            }
        });
        this.fetchPharmacyOrders(item);
    }

    fetchPharmacyOrders(item: any) {
        const url = this.us.getApiUrl(CoordinatorWorklist.FetchPatientVisitPharmacyOrderDetails, {            
            admissionId: item.AdmissionID,
            WorkStationID: '1',
            HospitalID: this.hospitalId
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.pharmacyOrders = response.FetchPatientVisitPharmacyOrderDetailsDataList;
                this.pharmacyOrders.forEach((element: any) => {
                    element.ItemStatus = Number(element.PrescribedQtyLowest) >= Number(element.IssuedQtyLowest) ? 'Issued' : 
                    Number(element.PrescribedQtyLowest) > Number(element.IssuedQtyLowest) && Number(element.IssuedQtyLowest) != 0 ? 'Partially Issued' :
                    Number(element.IssuedQtyLowest) == 0 ? 'Not Issued' : '';
                });
            }
        });
    }

    filterLabRadPhOrders(type: number) {
        if (type === 3) {
            return this.labradOrders.filter((x: any) => x.Type === 'LAB');
        }
        else if (type === 5) {
            return this.labradOrders.filter((x: any) => x.Type === 'RAD');
        }
    }

    FetchFollowupAndReferralOrders(item: any) {
        this.FetchFollowupOrders(item);
        this.FetchReferralOrders(item);
        $('#viewFollowupModal').modal('show');
    }

    FetchFollowupOrders(item: any) {
        this.selectedPatient = item;
        const url = this.us.getApiUrl(CoordinatorWorklist.FetchFollowUpDetails, {
            admissionId: item.AdmissionID,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalId
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.followupDetails = response.FetchFollowUpDetailsDataList;
                
            }
        });
    }
    FetchReferralOrders(item: any) {
        this.selectedPatient = item;
        const url = this.us.getApiUrl(CoordinatorWorklist.FetchCoordinatorReferalOrders, {
            admissionId: item.AdmissionID,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalId
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.referralDetails = response.FetchCoordinatorReferalOrdersDataList;
                
            }
        });
    }

    closePopup() {
        this.selectedPatient = null;
        this.pharmacyOrders = [];
    }

    filterVipPatients() {
        this.showVip = !this.showVip;
        if (this.showVip) {
            this.worklistData = this.worklistData1.filter((x: any) => x.IsVIP === '1');
        }
        else {
            this.worklistData = this.worklistData1;
        }
        // const groupedByOrderDate = this.worklistData.reduce((acc: any, current: any) => {
        //     const AdmitDate = current.AdmitDate.split(' ')[0];
        //     if (!acc[AdmitDate]) {
        //         acc[AdmitDate] = [];
        //     }
        //     acc[AdmitDate].push(current);
        //     return acc;
        // }, {});

        // this.sortedGroupedByDate = Object.entries(groupedByOrderDate)
        //     .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        //     .map(([AdmitDate, items]) => ({ AdmitDate, items }));
    }

    handlePageChange(event: any) {
        this.FetchWorklistData(event.min, event.max, event.currentPage);
    }

    openScheduling(type: number) {
        if( type === 1) {
            this.router.navigate(['./frontoffice/investigationappointment']);
        }
        else if(type === 2 || type === 3) {
            this.router.navigate(['./frontoffice/procedureappointment']);
        }
        else if(type === 4) {
            this.router.navigate(['./frontoffice/neurologyappointment']);
        }
    }

    FetchCoordinatorOrderStatusCount() {
        const FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
        const ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
        const url = this.us.getApiUrl(CoordinatorWorklist.FetchCoordinatorOrderStatusCount, {
            FromDate,
            ToDate,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalId
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.labCountsData = response.FetchCoordinatorLabStatusCountDataList;
                this.radCountsData = response.FetchCoordinatorRadCardioProcStatusCountDataList;
                this.pharmacyCountsData = response.FetchCoordinatorMedicationStatusCountDataList;
                this.surgeryCountsData = response.FetchCoordinatorSurgeryStatusCountDataList;

                
            } else {
                
            }
        });
    }

    getTotalCount(type: any) {
        if(type === 1) {
            const labCount = this.labCountsData.map((item: any) => Number.parseInt(item.LabCnt)).reduce((acc: any, curr: any) => acc + curr, 0);
            return labCount;
        }
        else if(type === 2) {
            const radCount = this.radCountsData.map((item: any) => Number.parseInt(item.RAD_COUNT)).reduce((acc: any, curr: any) => acc + curr, 0);
            return radCount;
        }
        else if(type === 3) {
            const cardioCount = this.radCountsData.map((item: any) => Number.parseInt(item.CORD_COUNT)).reduce((acc: any, curr: any) => acc + curr, 0);
            return cardioCount;
        }
        else if(type === 4) {
            const pharmacyCount = this.pharmacyCountsData.map((item: any) => Number.parseInt(item.Cnt)).reduce((acc: any, curr: any) => acc + curr, 0);
            return pharmacyCount;
        }
        else if(type === 5) {
            const procCount = this.radCountsData.map((item: any) => Number.parseInt(item.PROC_COUNT)).reduce((acc: any, curr: any) => acc + curr, 0);
            return procCount;
        }
        else if(type === 6) {
            const surgeryCount = this.surgeryCountsData.map((item: any) => Number.parseInt(item.Cnt)).reduce((acc: any, curr: any) => acc + curr, 0);
            return surgeryCount;
        }
    }

}

const CoordinatorWorklist = {
    FetchcoordinatorPatientVistitsWorkList: 'FetchcoordinatorPatientVistitsWorkList?FromDate=${FromDate}&ToDate=${ToDate}&min=${min}&max=${max}&filter=${filter}&DoctorId=${DoctorId}&SpecialisationId=${SpecialisationId}&ssn=${ssn}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchSSEmployees: "FetchSSEmployees?name=${name}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchPatientVisitLabRadOrderDetails: "FetchPatientVisitLabRadOrderDetails?admissionId=${admissionId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchFollowUpDetails: "FetchFollowUpDetails?admissionId=${admissionId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchCoordinatorReferalOrders: "FetchCoordinatorReferalOrders?admissionId=${admissionId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    FetchPatientOrderedOrPrescribedDrugs_PFN: 'FetchPatientOrderedOrPrescribedDrugs_PFN?UHID=${UHID}&PatientType=${PatientType}&IPID=${IPID}&PatientID=${PatientID}&SearchID=${SearchID}&FromDate=${FromDate}&ToDate=${ToDate}&HospitalID=${HospitalID}',
    FetchPatientVisitPharmacyOrderDetails: 'FetchPatientVisitPharmacyOrderDetails?admissionId=${admissionId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchCoordinatorOrderStatusCount:'FetchCoordinatorOrderStatusCount?FromDate=${FromDate}&ToDate=${ToDate}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}