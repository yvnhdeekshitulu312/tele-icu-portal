import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { BloodrequestComponent } from 'src/app/ward/bloodrequest/bloodrequest.component';
import { ConfigService } from 'src/app/ward/services/config.service';

declare var $: any;

@Component({
    selector: 'app-ip-issues-worklist',
    templateUrl: './ip-issues-worklist.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE],
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
        DatePipe
    ]
})
export class IPIssuesWorklistComponent extends BaseComponent implements OnInit {
    @ViewChild('Remarks') Remarks!: ElementRef;
    @ViewChild('SpecialProcessing') SpecialProcessing!: ElementRef;
    @ViewChild('DrugAllergies') DrugAllergies!: ElementRef;
    @ViewChild('FoodAllergies') FoodAllergies!: ElementRef;
    @ViewChild('ClinicalDiagnosis') ClinicalDiagnosis!: ElementRef;
    @ViewChild('OtherAllergies') OtherAllergies!: ElementRef;
    showPatientSummaryinPopUp = false;
    errorMessages: any = [];
    tablePatientsForm!: FormGroup;
    facility: any;
    facilityId: any;
    bloodRequestOrders: any = [];
    bloodRequestOrders1: any = [];
    sortedGroupedByDate: any;
    selectedPatient: any;
    bloodGroups: any = [];
    bloodOrders: any = [];
    bloodBagsList: any = [];
    doctorsList: any = [];
    crossMatchPopupData: any;
    FetchBloodIssueDetailsDataList: any = [];
    panaceaResults: any = [];
    selectedItem: any;
    trustedUrl: any;
    selectedPatientType = "1";
    constructor(private fb: FormBuilder, private datepipe: DatePipe, private us: UtilityService, private config: ConfigService, private modalSvc: NgbModal, private modalService: GenericModalBuilder) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
        this.initializetablePatientsForm();
        this.FetchBloodRequests();
    }
     FetchBloodRequestOrdersDisplay(type: any) {
        this.selectedPatientType = type;
        this.FetchBloodRequests();
    }

    initializetablePatientsForm() {
        this.tablePatientsForm = this.fb.group({
            FromDate: [''],
            ToDate: [''],
        });
        const wm = new Date();
        this.tablePatientsForm.patchValue({
            FromDate: wm,
            ToDate: wm
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
            d.setDate(d.getDate() - 7);
            var wm = d;
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        } else if (filter === "T") {
            var d = new Date();
            d.setDate(d.getDate());
            var wm = d;
            var pd = new Date();
            this.tablePatientsForm.patchValue({
                FromDate: wm,
                ToDate: pd,
            });
        }
        this.FetchBloodRequests();
    }

    onDateChange() {
        this.FetchBloodRequests();
    }

    FetchBloodRequests() {
        if (this.tablePatientsForm.value['FromDate'] && this.tablePatientsForm.value['ToDate']) {
            this.bloodRequestOrders = [];this.bloodRequestOrders1 = [];
            const FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
            const ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
            const payload = {
                FromDate,
                ToDate,
                SSN: $('#NationalId').val() ? $('#NationalId').val() : '0',
                PatientType:this.selectedPatientType,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            };
            const url = this.us.getApiUrl(IPIssuesWorklist.FetchBloodRequestPP, payload)
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.bloodRequestOrders = [];  this.bloodRequestOrders1 = [];

                     if (this.selectedPatientType === '1') {
                        this.bloodRequestOrders =  this.bloodRequestOrders1 =  response.FetchBloodRequestOPEDDataList;
                    } else if (this.selectedPatientType === '2') {
                        this.bloodRequestOrders = this.bloodRequestOrders1 = response.FetchBloodRequestPPDataList;
                    }else if (this.selectedPatientType === '3') {
                        this.bloodRequestOrders =  this.bloodRequestOrders1 =  response.FetchBloodRequestOPEDDataList;
                    }
                    //this.bloodRequestOrders =this.bloodRequestOrders1 =  response.FetchBloodRequestPPDataList;

                    this.prepareGroupedData();
                }
            });
        }
    }
    clearSearchCriteria() {
        this.initializetablePatientsForm();
        $('#NationalId').val('');
        this.FetchBloodRequests();
    }
    onSSNEnterPress(event: Event) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            event.preventDefault();
            this.FetchBloodRequests();
        }
    }

    prepareGroupedData() {
        const groupedByDate = this.bloodRequestOrders.reduce((acc: any, current: any) => {
            const RequestDatetime = current.RequestDatetime.split(' ')[0];
            if (!acc[RequestDatetime]) {
                acc[RequestDatetime] = [];
            }
            acc[RequestDatetime].push(current);

            return acc;
        }, {});

        this.sortedGroupedByDate = Object.entries(groupedByDate)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([RequestDatetime, items]) => ({ RequestDatetime, items }));
    }

    setCurrentTime(): string {
        const now = new Date();
        const hours = this.padZero(now.getHours());
        const minutes = this.padZero(now.getMinutes());
        return `${hours}:${minutes}`;
    }

    padZero(value: number): string {
        return value < 10 ? '0' + value : value.toString();
    }

    initializeCrossmatchPopupData() {
        this.crossMatchPopupData = {
            PatBloodgroup: this.selectedPatient.BloodGroupID,
            TransfusionIndications: this.selectedPatient.Indicationtransfusion,
            Diagnosis: this.selectedPatient.ClinicalDiagNosis,
            IsInspectionDone: '1',
            ReviewOfSerologyResults: '1',
            IsCompatabilityOrNot: '1',
            IssuedDate: new Date(),
            IssuedTime: this.setCurrentTime(),
            Technician: null,
            Nurse: null,
            selectedBloodBags: [],
            Remarks: '',
            SpecialProcessing: '',
            DrugAllergies: '',
            FoodAllergies: '',
            ClinicalDiagnosis: '',
            OtherAllergies: '',
            TransfusionType: '0',
            IssuedBy: null,
            RecievedBy: null,
            OrderStatus: '0'
        };
        this.bloodGroups = [];
        this.bloodOrders = [];
    }

    openCrossMatchModal(item: any) {
        if(item.BILLID == '' && item.PatientType == '1') {
            this.errorMessages.push('Order is not billed. Please proceed after Billing.');
            if (this.errorMessages.length > 0) {
                $('#errorMsg').modal('show');
                return;
            }
        }
        this.crossMatchPopupData = null;
        setTimeout(() => {
            this.selectedPatient = item;
            this.initializeCrossmatchPopupData();
            this.fetchBloodGroupMaster(item);
            $('#ipCrossmatch_modal').modal('show');
        }, 0);
    }

    fetchBloodGroupMaster(item: any) {
        var payload = {
            PatientID: item.PatientID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        }
        const url = this.us.getApiUrl(IPIssuesWorklist.FetchBloodRequestMasters, payload)
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.bloodGroups = response.FetchBloodGroupMastersDataList;
                this.FetchBloodOrders(item);
            }
        });
    }

    FetchBloodOrders(item: any) {
        var payload = {
            BloodorderID: item.BloodorderID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        }
        const url = this.us.getApiUrl(IPIssuesWorklist.FetchOPBloodorder, payload)
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.bloodOrders = response.FetchOPBloodorderData2List;
                if (this.selectedPatient.BloodissueId) {
                    this.FetchBloodIssue();
                }
            }
        });
    }

    FetchBloodIssue() {
        const payload = {
            BloodIssueID: this.selectedPatient.BloodissueId,
            PatientType: this.selectedPatient.PatientType,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        }
        const url = this.us.getApiUrl(IPIssuesWorklist.FetchBloodIssue, payload)
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                response.FetchBloodIssue2List.forEach((element: any) => {
                    element.BloodGroupName = element.BloodGroup;
                    element.ComponentName = element.COMPONENT;
                    element.CurrentQuantity = element.BloodBagCurrentQuantity;
                    element.ExpiryDate = element.Expirydate;
                    element.BloodBagid = element.BagID;
                    element.BloodGroupID = element.BloodgroupID;
                });
                this.crossMatchPopupData = {
                    PatBloodgroup: response.FetchBloodIssue1List[0].PatBloodGroup,
                    TransfusionIndications: this.selectedPatient.Indicationtransfusion,
                    Diagnosis: this.selectedPatient.ClinicalDiagNosis,
                    Remarks: response.FetchBloodIssue1List[0].Remarks,
                    SpecialProcessing: response.FetchBloodIssue1List[0].SpecialProcessing,
                    IsInspectionDone: response.FetchBloodIssue1List[0].IsInspectionDone === 'True' ? '1' : '2',
                    ReviewOfSerologyResults: response.FetchBloodIssue1List[0].ReviewOfSerologyResults,
                    IsCompatabilityOrNot: response.FetchBloodIssue1List[0].IsCompatabilityOrNot === 'True' ? '1' : '2',
                    // IssuedDate: new Date(response.FetchBloodIssue1List[0].RevisionDateTime.split(' ')[0]),
                    // IssuedTime: response.FetchBloodIssue1List[0].RevisionDateTime.split(' ')[1],
                    IssuedDate: new Date(response.FetchBloodIssue1List[0].IssueDate.split(' ')[0]),
                    IssuedTime: response.FetchBloodIssue1List[0].IssueDate.split(' ')[1],
                    OrderStatus: response.FetchBloodIssue1List[0].OrderStatus,
                    Technician: {
                        ID: response.FetchBloodIssue1List[0].TechnicianId
                    },
                    Nurse: {
                        ID: response.FetchBloodIssue1List[0].Nurse
                    },
                    TransfusionType: response.FetchBloodIssue1List[0].TransfusionType,
                    IssuedBy: {
                        ID: response.FetchBloodIssue1List[0].IssueBy
                    },
                    RecievedBy: {
                        ID: response.FetchBloodIssue1List[0].CollectedBy
                    },
                    selectedBloodBags: response.FetchBloodIssue2List
                };
                $('#textbox_technician').val(response.FetchBloodIssue1List[0].TechnicianName);
                $('#textbox_nurse').val(response.FetchBloodIssue1List[0].NurseName);
                $('#textbox_issuedby').val(response.FetchBloodIssue1List[0].IssueByName);
                $('#textbox_recievedby').val(response.FetchBloodIssue1List[0].CollectedByName);
            }
        });
    }

    searchBloodBags(event: any) {
        const filter = event.target.value;
        if (filter.length > 2) {
            const components = this.bloodOrders.map((item: any) => item.ComponentID).join(',');
            const payload: any = {
                ComponentID: components,
                BagNumber: filter,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID,
                PatientID: this.selectedPatient.PatientID,
                BloodGroupID:this.crossMatchPopupData.PatBloodgroup
            };
            const url = this.us.getApiUrl(IPIssuesWorklist.FetchBloodBagsForIPIssues, payload)
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.bloodBagsList = response.FetchBloodBagsForIPIssuesDataList;
                }
            });
        }
    }

    onSearchDoctorsAll(event: any) {
        this.doctorsList = [];
        if (event.target.value.length >= 3) {
            this.config.FetchSSEmployees("FetchSSEmployees", event.target.value.trim(), this.doctorDetails[0].UserId, 3403, this.hospitalID)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.doctorsList = response.FetchSSEmployeesDataList;
                    }
                },
                    () => {

                    })
        }
    }

    onSaveClick() {
        this.errorMessages = [];
        if (!this.crossMatchPopupData.PatBloodgroup) {
            this.errorMessages.push('Please Select Blood Group');
        }

        if (this.crossMatchPopupData.selectedBloodBags.length === 0) {
            this.errorMessages.push('Please Add Blood Bags');
        }

        if (this.crossMatchPopupData.selectedBloodBags.length > 0) {
            const noData = this.crossMatchPopupData.selectedBloodBags.filter((element: any) => {
                return !element.Quantity;
            });
            if (noData.length > 0) {
                this.errorMessages.push('Please Enter Corrrect Issued Volume');
            }
        }


        if (!this.crossMatchPopupData.Technician) {
            this.errorMessages.push('Please Select Technician');
        }

        if (!this.crossMatchPopupData.Nurse) {
            this.errorMessages.push('Please Select Nurse');
        }

        if (!this.crossMatchPopupData.RecievedBy) {
            this.errorMessages.push('Please Select Recieved By');
        }

        if (!this.crossMatchPopupData.IssuedBy) {
            this.errorMessages.push('Please Select Issued By');
        }

        if (this.errorMessages.length > 0) {
            $('#errorMsg').modal('show');
            return;
        }
        const BloodTexXMLL: any = this.crossMatchPopupData.selectedBloodBags.map((element: any) => {
            return {
                "BID": element.BloodBagid,
                "CID": element.ComponentID,
                "CTYP": element.ComponentType,
                "CMID": element.CrossmactID,
                "BGRP": element.BloodGroupID,
                "QTY": element.Quantity,
                "BNO": element.BagNumber,
                "EDT": element.ExpiryDate
            }
        });
        const payload = {
            "BloodBloodissueId": this.selectedPatient.BloodissueId ? this.selectedPatient.BloodissueId : '0',
            "PatientID": this.selectedPatient.PatientID,
            "PatientType": this.selectedPatient.PatientType,
            "IPID": this.selectedPatient.IPID,
            "BedID": this.selectedPatient.OrderBedID,
            "DoctorID": this.selectedPatient.DoctorID,
            "IssueBy": this.crossMatchPopupData.IssuedBy.ID,
            "TransfusionType": this.crossMatchPopupData.TransfusionType,
            "ToHospDeptID": this.facilityId,
            "PatBloodgroup": this.crossMatchPopupData.PatBloodgroup,
            "CollectedBy": this.crossMatchPopupData.RecievedBy.ID,
            "OrderStatus": this.crossMatchPopupData.OrderStatus,
            "BloodorderID": this.selectedPatient.BloodorderID,
            "BillID": this.selectedPatient.BILLID ? this.selectedPatient.BILLID : 0,
            "TransferID": "0",
            "IsInspectionDone": this.crossMatchPopupData.IsInspectionDone,
            "ReviewOfSerologyResults": this.crossMatchPopupData.ReviewOfSerologyResults,
            "IsCompatabilityOrNot": this.crossMatchPopupData.IsCompatabilityOrNot,
            "TechnicianId": this.crossMatchPopupData.Technician.ID,
            "Nurse": this.crossMatchPopupData.Nurse.ID,
            "RevisionDateTime": moment(new Date(this.crossMatchPopupData.IssuedDate)).format('DD-MMM-YYYY') + ' ' + this.crossMatchPopupData.IssuedTime,
            "SpecialProcessing": this.SpecialProcessing.nativeElement.innerHTML,
            "Remarks": this.Remarks.nativeElement.innerHTML,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospitalID,
            BloodTexXMLL
        };
        this.us.post(IPIssuesWorklist.SaveBloodissues, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                $('#ipCrossmatch_modal').modal('hide');
                this.FetchBloodRequests();
            }
        });
    }

    onBloodBagSelection(item: any) {
        this.bloodBagsList = [];
        const itemFound = this.crossMatchPopupData.selectedBloodBags.find((x: any) => x.BagNumber === item.BagNumber);
        if (!itemFound) {
            this.crossMatchPopupData.selectedBloodBags.push(item);
        }
        setTimeout(() => {
            $('#textbox_bloodbag').val('');
        }, 500);
    }

    onIssuedBySelection(item: any) {
        $('#ipCrossmatch_modal').modal('hide');
        this.doctorsList = [];
        const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
            backdrop: 'static'
        });
        modalRef.componentInstance.data = {
            UserName: item.EmpNo
        };
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
            if (data.success) {
                this.crossMatchPopupData.IssuedBy = item;
            } else {
                this.crossMatchPopupData.IssuedBy = null;
                $('#textbox_issuedby').val('');
            }
            modalRef.close();
            $('#ipCrossmatch_modal').modal('show');
        });
    }

    onRecievedBySelection(item: any) {
        $('#ipCrossmatch_modal').modal('hide');
        this.doctorsList = [];
        const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
            backdrop: 'static'
        });
        modalRef.componentInstance.data = {
            UserName: item.EmpNo
        };
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
            if (data.success) {
                this.crossMatchPopupData.RecievedBy = item;
            } else {
                this.crossMatchPopupData.RecievedBy = null;
                $('#textbox_recievedby').val('');
            }
            modalRef.close();
            $('#ipCrossmatch_modal').modal('show');
        });
    }

    onTechnicianSelection(item: any) {
        $('#ipCrossmatch_modal').modal('hide');
        this.doctorsList = [];
        const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
            backdrop: 'static'
        });
        modalRef.componentInstance.data = {
            UserName: item.EmpNo
        };
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
            if (data.success) {
                this.crossMatchPopupData.Technician = item;
            } else {
                this.crossMatchPopupData.Technician = null;
                $('#textbox_technician').val('');
            }
            modalRef.close();
            $('#ipCrossmatch_modal').modal('show');
        });
    }

    onNurseSelection(item: any) {
        $('#ipCrossmatch_modal').modal('hide');
        this.doctorsList = [];
        const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
            backdrop: 'static'
        });
        modalRef.componentInstance.data = {
            UserName: item.EmpNo
        };
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
            if (data.success) {
                this.crossMatchPopupData.Nurse = item;
            } else {
                this.crossMatchPopupData.Nurse = null;
                $('#textbox_nurse').val('');
            }
            modalRef.close();
            $('#ipCrossmatch_modal').modal('show');
        });
    }

    openPatientFolder(wrk: any) {
        this.showPatientSummaryinPopUp = true;
        sessionStorage.setItem("PatientID", wrk.PatientID);
        sessionStorage.setItem("SummaryfromCasesheet", 'true');
        $("#pateintFolderPopup").modal("show");
    }

    closePatientSummaryPopup() {
        $("#pateintFolderPopup").modal("hide");
        sessionStorage.removeItem("SummaryfromCasesheet");
        setTimeout(() => {
            this.showPatientSummaryinPopUp = false;
        }, 1000);
    }

    openBloodDeatilsModal(item: any) {
        this.FetchBloodIssueDetailsDataList = [];
        this.selectedPatient = item;
        // const payload = {
        //     PatientID: this.selectedPatient.PatientID,
        //     UserID: this.doctorDetails[0].UserId,
        //     WorkStationID: this.facilityId,
        //     HospitalID: this.hospitalID
        // };
       // const url = this.us.getApiUrl(IPIssuesWorklist.FetchBloodIssueDetails, payload);
        const payload = {
            UHID: this.selectedPatient.RegCode,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        };
       const url = this.us.getApiUrl(IPIssuesWorklist.FetchBloodIssueDetailsHosp, payload);
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchBloodIssueDetailsDataList = response.FetchBloodIssueDetailsDataList;
            }
        });
        $('#patientBloodDetails_modal').modal('show');
    }

    onRefreshClick() {
        this.openPanaceaResults(this.selectedItem);
    }

    openPanaceaResults(item: any) {
        $('#panaceaResultsModal').modal('show');
        this.panaceaResults = [];
        this.selectedItem = item;
        const url = this.us.getApiUrl(IPIssuesWorklist.FetchBloodPanaceaResults, {
            BloodOrderID: item.BloodorderID,
            PanaceaOrderID: item.PanaceaBloodOrder,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.panaceaResults = response.FetchBloodPanaceaResultsDataList;
            }
        });
    }

    onAcknowledgeClick(item: any) {
        const payload = {
            "USERID": this.doctorDetails[0].UserId,
            "WORKSTATIONID": this.facilityId,
            "HospitalID": this.hospitalID,
            "BloodOrderID": this.selectedItem.BloodorderID,
            "PanaceaID": this.selectedItem.PanaceaBloodOrder,
            "PanaceaResultID": item._id,
            "AcknowledgeStatus": item.AcknowledgeStatus,
            "FetchBloodPanaceaResultsDataXML": this.panaceaResults
        };
        this.us.post(IPIssuesWorklist.SavePBAEventsAcknowledgeService, payload)
            .subscribe((response: any) => {
                if (response.Code) {
                    $('#savemsg').modal('show');
                    this.openPanaceaResults(this.selectedItem);
                }
            });
    }
    filterCrossMatchOrders(status: any) {
        if(status == '0') {
            this.bloodRequestOrders = this.bloodRequestOrders1.filter((x: any) => x.STATUS == '0' || x.STATUS == '-1');
        }
        else {
            this.bloodRequestOrders = this.bloodRequestOrders1.filter((x: any) => x.STATUS == status);
        }
        
        const groupedByDate = this.bloodRequestOrders.reduce((acc: any, current: any) => {
            const RequestDatetime = current.RequestDatetime.split(' ')[0];
            if (!acc[RequestDatetime]) {
                acc[RequestDatetime] = [];
            }
            acc[RequestDatetime].push(current);

            return acc;
        }, {});

        this.sortedGroupedByDate = Object.entries(groupedByDate)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([RequestDatetime, items]) => ({ RequestDatetime, items }));
    }
    
    getCrossMatchOrderCount(status: any) {
        if(status == '0') {
            return this.bloodRequestOrders1.filter((x: any) => x.STATUS == '0' || x.STATUS == '-1').length;
        }
        else {
            return this.bloodRequestOrders1.filter((x: any) => x.STATUS == status).length;
        }
    }
    GetBloodBagHsitoryPrint() {
           
            const payload = {
                UHID: this.selectedPatient.RegCode,
                PatientID: this.selectedPatient.PatientID,
                IPID: this.selectedPatient.IPID,
                UserName: this.selectedPatient.RegCode,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            };
            const url = this.us.getApiUrl(IPIssuesWorklist.FetchBloodIssueDetailsHospPrint, payload);
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.trustedUrl = response?.FTPPATH
                    $("#reviewAndPayment").modal('show');
                }
            });       
        }  

        openBloodRequest(item: any) {
                item.BloodOrderID = item.BloodorderID;
                item.Bed = item.BedName;
                item.Ward = item.WardName;
                item.GenderID = item.GenderId;
                sessionStorage.setItem("selectedView", JSON.stringify(item));
                const options: NgbModalOptions = {
                    size: 'xl',
                    windowClass: 'openSurgeryRecordModal'
                };
                const modalRef = this.modalService.openModal(BloodrequestComponent, {
                    data: item,
                    readonly: true,
                    selectedView: this.selectedView
                }, options);            
            }
}

export const IPIssuesWorklist = {
    FetchBloodRequestPP: 'FetchBloodRequestPP?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&PatientType=${PatientType}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchBloodRequestMasters: 'FetchBloodRequestMasters?PatientID=${PatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    //FetchBloodBagsForIPIssues: 'FetchBloodBagsForIPIssues?ComponentID=${ComponentID}&PatientID=${PatientID}&BagNumber=${BagNumber}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchOPBloodorder: 'FetchOPBloodorder?BloodorderID=${BloodorderID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveBloodissues: 'SaveBloodissues',
    FetchBloodIssue: 'FetchBloodIssue?BloodIssueID=${BloodIssueID}&PatientType=${PatientType}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchBloodIssueDetails: 'FetchBloodIssueDetails?PatientID=${PatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchBloodPanaceaResults: 'FetchBloodPanaceaResults?BloodOrderID=${BloodOrderID}&PanaceaOrderID=${PanaceaOrderID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SavePBAEventsAcknowledgeService: 'SavePBAEventsAcknowledgeService',
     FetchBloodIssueDetailsHospPrint: 'FetchBloodIssueDetailsHospPrint?UHID=${UHID}&PatientID=${PatientID}&IPID=${IPID}&UserName=${UserName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
        FetchBloodIssueDetailsHosp: 'FetchBloodIssueDetailsHosp?UHID=${UHID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
         FetchBloodBagsForIPIssues: 'FetchBloodBagsForIPIssues?BloodGroupID=${BloodGroupID}&PatientID=${PatientID}&ComponentID=${ComponentID}&BagNumber=${BagNumber}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',


}