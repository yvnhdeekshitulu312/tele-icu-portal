import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from '../generic-modal-builder.service';
import { CartData, CartItem, CartService } from './cart.service';
import { BiometricService } from 'src/app/services/biometric.service';
declare var $: any;
declare var bootstrap: any;
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
    selector: 'app-pending-reports-worklist',
    templateUrl: './pending-reports-worklist.component.html',
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
export class PendingReportsWorklistComponent extends BaseComponent implements OnInit {
    selectedTab = 'sickleave';
    FetchSickLeaveWorklistDataList: any[] = [];
    FetchDischargeSummaryWorklistDataList: any[] = [];
    FetchMedicalReportWorklistDataList: any[] = [];

    cartData: CartData | null = null;
    cartCount = 0;

    pendingCartItem: { item: CartItem, patientInfo: any } | null = null;
    confirmModal: any;

    sickLeaveForm: any;
    dischargeForm: any;
    medicalForm: any;
    facility: any;
    verifiedPatients: { [key: string]: boolean } = {};

    trustedUrl: any;
    smsmodalTitle: any;
    selectedItem: any;
    reportTitle: string = '';
    errorMsg: string = '';

    constructor(private us: UtilityService,
        public formBuilder: FormBuilder, public datepipe: DatePipe, private modalService: GenericModalBuilder,
        private ngbModal: NgbModal, private cartService: CartService, private biometricService: BiometricService) {
        super();
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    }

    ngOnInit(): void {
        this.initializeSickLeaveForm();
        //this.initializeDischargeForm();
        //this.initializeMedicalForm();
        this.fetchData();

        this.cartService.cart$.subscribe(cart => {
            this.cartData = cart;
            this.cartCount = this.cartService.getCartCount();
        });

        // Initialize confirmation modal
        this.initializeModals();
    }

    initializeModals() {
        const confirmModalEl = document.getElementById('confirmPatientChangeModal');
        if (confirmModalEl) {
            this.confirmModal = new bootstrap.Modal(confirmModalEl);
        }
    }

    addToCartSickLeave(item: any) {
        this.addItemToCart('sickleave', 'Sick Leave', item);
    }

    addToCartDischarge(item: any) {
        this.addItemToCart('discharge', 'Discharge Summary', item);
    }

    addToCartMedical(item: any) {
        this.addItemToCart('medical', 'Medical Report', item);
    }

    isItemSelected(item: any, key: any) {
        const items = this.cartService.getCurrentCart()?.items || [];
        return items.find((e: any) => e.data[key] === item[key]) ? true : false;
    }

    private addItemToCart(type: 'sickleave' | 'discharge' | 'medical', typeName: string, itemData: any) {
        const cartItem: CartItem = {
            type: type,
            typeName: typeName,
            data: itemData,
            addedAt: new Date()
        };

        const patientInfo = {
            SSN: itemData.SSN,
            PatientName: itemData.PatientName,
            Gender: itemData.Gender,
            GenderID: itemData.GenderID,
            FullAge: itemData.FullAge,
            DOB: itemData.DOB,
            Nationality: itemData.Nationality,
            MobileNo: itemData.MobileNo,
            PatientID: itemData.PatientID,
            AdmissionID: itemData.AdmissionID
        };

        const success = this.cartService.addToCart(cartItem, patientInfo);

        if (!success) {
            // Different patient detected - show confirmation
            this.pendingCartItem = { item: cartItem, patientInfo: patientInfo };
            this.confirmModal?.show();
        }
        // else {
        //     this.openCartModal();
        // }
    }

    confirmPatientChange() {
        if (this.pendingCartItem) {
            this.cartService.replaceCart(this.pendingCartItem.item, this.pendingCartItem.patientInfo);
            this.pendingCartItem = null;
            this.confirmModal?.hide();
            //this.openCartModal();
        }
    }

    cancelPatientChange() {
        this.pendingCartItem = null;
        this.confirmModal?.hide();
    }

    removeCartItem(type: string) {
        this.cartService.removeItem(type);
    }

    clearCart() {
        this.cartService.clearCart();
    }

    openCartModal() {
        const cartModalEl = document.getElementById('cart-modal');
        if (cartModalEl) {
            const cartModal = new bootstrap.Modal(cartModalEl);
            cartModal.show();
        }
    }

    initializeSickLeaveForm() {
        this.sickLeaveForm = this.formBuilder.group({
            fromdate: new Date(),
            todate: new Date(),
            SSN: ''
        });
    }

    initializeDischargeForm() {
        this.dischargeForm = this.formBuilder.group({
            fromdate: new Date(),
            todate: new Date(),
            SSN: ''
        });
    }

    initializeMedicalForm() {
        this.medicalForm = this.formBuilder.group({
            fromdate: new Date(),
            todate: new Date(),
            SSN: ''
        });
    }

    onSelectTab(tabName: string) {
        this.selectedTab = tabName;
        this.fetchData();
    }

    fetchSickLeaveWorklistData() {
        const fromDate = this.sickLeaveForm.get('fromdate').value;
        const todate = this.sickLeaveForm.get('todate').value;
        if (!fromDate || !todate) {
            return;
        }
        const { SSN } = this.sickLeaveForm.value;
        const url = this.us.getApiUrl(PendingReportsWorklist.FetchPatienMRDSSLWorkList, {
            SSN: SSN ? SSN : 0,
            FromDate: this.datepipe.transform(fromDate, "dd-MMM-yyyy"),
            ToDate: this.datepipe.transform(todate, "dd-MMM-yyyy"),
            type: 3,
            WorkStationID: this.facility.FacilityID ?? 0,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.FetchSickLeaveWorklistDataList = response.FetchSickLeaveWorklistDataList
                }
            },
                (err) => {

                })
    }

    fetchDischargeWorklistData() {
        const fromDate = this.sickLeaveForm.get('fromdate').value;
        const todate = this.sickLeaveForm.get('todate').value;
        if (!fromDate || !todate) {
            return;
        }
        const { SSN } = this.sickLeaveForm.value;
        const url = this.us.getApiUrl(PendingReportsWorklist.FetchPatienMRDSSLWorkList, {
            SSN: SSN ? SSN : 0,
            FromDate: this.datepipe.transform(fromDate, "dd-MMM-yyyy"),
            ToDate: this.datepipe.transform(todate, "dd-MMM-yyyy"),
            type: 2,
            WorkStationID: this.facility.FacilityID ?? 0,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.FetchDischargeSummaryWorklistDataList = response.FetchDischargeSummaryWorklistDataList
                }
            },
                (err) => {

                })
    }

    fetchMedicalWorklistData() {
        const fromDate = this.sickLeaveForm.get('fromdate').value;
        const todate = this.sickLeaveForm.get('todate').value;
        if (!fromDate || !todate) {
            return;
        }
        const { SSN } = this.sickLeaveForm.value;
        const url = this.us.getApiUrl(PendingReportsWorklist.FetchPatienMRDSSLWorkList, {
            SSN: SSN ? SSN : 0,
            FromDate: this.datepipe.transform(fromDate, "dd-MMM-yyyy"),
            ToDate: this.datepipe.transform(todate, "dd-MMM-yyyy"),
            type: 1,
            WorkStationID: this.facility.FacilityID ?? 0,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.FetchMedicalReportWorklistDataList = response.FetchMedicalReportWorklistDataList
                }
            },
                (err) => {

                })
    }

    onSSNEnterPress(event: any) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            this.fetchData();
        }
    }

    fetchData() {
        if (this.selectedTab === 'sickleave') {
            this.fetchSickLeaveWorklistData();
        } else if (this.selectedTab === 'discharge') {
            this.fetchDischargeWorklistData();
        } else if (this.selectedTab === 'medical') {
            this.fetchMedicalWorklistData();
        }
    }

    onClearClick() {
        this.initializeSickLeaveForm();
        if (this.selectedTab === 'sickleave') {
            this.fetchSickLeaveWorklistData();
        } else if (this.selectedTab === 'discharge') {
            this.fetchDischargeWorklistData();
        } else if (this.selectedTab === 'medical') {
            this.fetchMedicalWorklistData();
        }
        this.FetchSickLeaveWorklistDataList=[];
        this.FetchDischargeSummaryWorklistDataList=[];
        this.FetchMedicalReportWorklistDataList=[];
        this.cartData = null;
        this.cartCount = 0;
        this.cartService.clearCart()
    }

    openSickLeave(sickleave: any) {
        const url = this.us.getApiUrl(PendingReportsWorklist.FetchPatientSickLeavePDF, {
            AdmissionID: sickleave.AdmissionID,
            SickLeaveID: sickleave.SickLeaveID,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code == 200) {
                this.trustedUrl = response?.FTPPATH;
                this.showIframeModal();
            }
        });
    }

    showIframeModal() {
        if (this.selectedTab === 'sickleave') {
            this.reportTitle = 'Sick Leave Report';
        } else if (this.selectedTab === 'discharge') {
            this.reportTitle = 'Discharge Summary Report';
        } else if (this.selectedTab === 'medical') {
            this.reportTitle = 'Medical Report';
        }
        $("#iframeModal").modal('show');
    }


    openMedicalCertificate(medcert: any) {
        const url = this.us.getApiUrl(PendingReportsWorklist.FetchPatientMedicalReportPrintMR, {
            AdmissionID: medcert.AdmissionID,
            UserName: this.doctorDetails[0]?.UserId,
            MedicalReportID: medcert.MedicalReportID,
            HospitalID: this.hospitalID,
            WorkStationID: this.facility.FacilityID ?? 0,
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code == 200) {
                this.trustedUrl = response?.FTPPATH;
                this.showIframeModal();
            }
        });
    }

    openDischargeSummary(summary: any) {
        const url = this.us.getApiUrl(PendingReportsWorklist.FetchPatientDischargeSummaryPrint, {
            AdmissionID: summary.AdmissionID,
            VirtualDischargeID: summary.VirtualDischargeID,
            HospitalID: this.hospitalID,
            WorkStationID: this.facility.FacilityID ?? 0,
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code == 200) {
                this.trustedUrl = response?.FTPPATH;
                this.showIframeModal();
            }
        });
    }

    openSMSModal(item: any) {
        this.selectedItem = item;
        if (this.selectedTab === 'sickleave') {
            this.smsmodalTitle = 'Sick Leave Send SMS';
        } else if (this.selectedTab === 'discharge') {
            this.smsmodalTitle = 'Discharge Summary Send SMS';
        } else if (this.selectedTab === 'medical') {
            this.smsmodalTitle = 'Medical Report Send SMS';
        }
        $('#smsText').val(item.MobileNo);
        $("#sendSMSModal").modal('show');
    }

    sendSMS() {
        const mobNo = $('#smsText').val();
        if (mobNo.trim() == '' || mobNo.toString().length < 10) {
            this.errorMsg = "Please enter correct Mobile Number";
            return;
        }
        let TypeID = '1';
        let DocumentID = '0';
        let TypeName = '';
        if (this.selectedTab == 'sickleave') {
            TypeID = '1';
            DocumentID = this.selectedItem.SickLeaveID;
            TypeName = 'SickLeave';
        }
        else if (this.selectedTab == 'discharge') {
            TypeID = '2';
            DocumentID = this.selectedItem.MedicalReportID;
            TypeName = 'DischargeSummary';
        }
        else if (this.selectedTab == 'medical') {
            TypeID = '3';
            DocumentID = this.selectedItem.MedicalReportID;
            TypeName = 'MedicalReport';
        }
        const payload = {
            DocumentID,
            AdmissionID: this.selectedItem.AdmissionID,
            TypeID,
            TypeName,
            SMSSenderEmpID: this.doctorDetails[0].EmpId,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID ?? 0,
            HospitalID: this.hospitalID
        };
        this.us.post(PendingReportsWorklist.SaveSMSSenderInformation, payload).subscribe((response: any) => {
            if (response.Code == 200) {
                $("#smsSentMsg").modal('show');
            }
        });
        $("#sendSMSModal").modal('hide');
    }

    openBiometricModal(patient: any) {
        $('#cart-modal').modal('hide');
        this.biometricService.verifyPatient(patient, 'Patient Document Worklist')
            .subscribe({
                next: (verified) => {
                    $('#cart-modal').modal('show');
                    if (verified) {
                        //Call the print flow
                        this.printCartItems(patient);
                    }
                },
                error: (error) => {
                    console.error('Biometric verification error:', error);
                }
            });
    }

    // openBiometricModal(item: any) {

    //     const modalRef = this.ngbModal.open(FingerprintComponent, {
    //         windowClass: 'fingerprintModal'
    //     });

    //     modalRef.componentInstance.patient = item;
    //     modalRef.componentInstance.showClose = false;

    //     modalRef.result.then(
    //         (result: any) => {
    //             if (result === true) {
    //                 this.verifiedPatients[item.SSN || item.id] = true;
    //             }
    //         },
    //         () => { }
    //     );

    // }

    printCartItems(patient: any) {
        //https://localhost:44350/API/PendingReportsPrint?patientId=467036&dischargeSummaryId=12211&medicalReportId=0&sickLeaveId=61147&
        // userId=3038&userName=System&WorkStationID=1&HospitalID=3
        const disSumm = patient.items.filter((x: any) => x.type === 'discharge');
        const sickLeave = patient.items.filter((x: any) => x.type === 'sickleave');
        const medReport = patient.items.filter((x: any) => x.type === 'medical');

        let disSummParam = '0'; let sickLeaveParam = '0'; let medReportParam = '0'; let patientId = '0';
        if (disSumm.length > 0) {
            disSummParam = disSumm[0]?.data.AdmissionID + '-' + disSumm[0]?.data.MedicalReportID + '-' + disSumm[0]?.data.VirtualDischargeID;
            patientId = disSumm[0]?.data.PatientID;
        }
        if (sickLeave.length > 0) {
            sickLeaveParam = sickLeave[0]?.data.AdmissionID + '-' + sickLeave[0]?.data.SickLeaveID;
            patientId = sickLeave[0]?.data.PatientID;
        }
        if (medReport.length > 0) {
            medReportParam = medReport[0]?.data.AdmissionID + '-' + medReport[0]?.data.MedicalReportID;
            patientId = medReport[0]?.data.PatientID;
        }

        const url = this.us.getApiUrl(PendingReportsWorklist.PendingReportsPrint, {
            patientId: patientId,
            dischargeSummaryId: disSummParam,
            medicalReportId: medReportParam,
            sickLeaveId: sickLeaveParam,
            userId: this.doctorDetails[0]?.UserId,
            userName: this.doctorDetails[0]?.UserName,
            WorkStationID: this.facility.FacilityID ?? 0,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.trustedUrl = response?.Message;
                    $("#printPdfModal").modal('show');
                }
            },
                (err) => {

                })
    }

    ngOnDestroy() {
        this.cartService.clearCart();
    }
}

const PendingReportsWorklist = {
    FetchPatienMRDSSLWorkList: 'FetchPatienMRDSSLWorkList?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&type=${type}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientSickLeavePDF: 'FetchPatientSickLeavePDF?AdmissionID=${AdmissionID}&SickLeaveID=${SickLeaveID}&HospitalID=${HospitalID}',
    FetchPatientMedicalReportPrintMR: 'FetchPatientMedicalReportPrintMR?MedicalReportID=${MedicalReportID}&AdmissionID=${AdmissionID}&UserName=${UserName}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientDischargeSummaryPrint: 'FetchPatientDischargeSummaryPrint?AdmissionID=${AdmissionID}&VirtualDischargeID=${VirtualDischargeID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientDocumentSMS: 'FetchPatientDocumentSMS?Type=${Type}&MobileNo=${MobileNo}&AdmissionID=${AdmissionID}&DocumentID=${DocumentID}&ReportType=${ReportType}&UserName=${UserName}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveSMSSenderInformation: 'SaveSMSSenderInformation',
    PendingReportsPrint: 'PendingReportsPrint?patientId=${patientId}&dischargeSummaryId=${dischargeSummaryId}&medicalReportId=${medicalReportId}&sickLeaveId=${sickLeaveId}&userId=${userId}&userName=${userName}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
};
