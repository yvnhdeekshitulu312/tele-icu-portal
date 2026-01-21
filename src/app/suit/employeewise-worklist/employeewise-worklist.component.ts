import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { MY_FORMATS } from '../physiotherapy-resultentry/physiotherapy-resultentry.component';
import { DatePipe } from '@angular/common';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientfolderComponent } from 'src/app/shared/patientfolder/patientfolder.component';
import { LabResultentryComponent } from '../lab-resultentry/lab-resultentry.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { PatientfoldermlComponent } from 'src/app/shared/patientfolderml/patientfolderml.component';

declare var $: any;

@Component({
    selector: 'app-employeewise-worklist',
    templateUrl: './employeewise-worklist.component.html',
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
export class EmployeewiseWorklistComponent extends BaseComponent implements OnInit {
    worklistForm: any;
    facility: any;
    facilityId: any;
    fetchTestRequisitionsList: any = [];
    fetchTestRequisitionsFullList: any = [];
    testandSpecialisation: any;
    testHistory: any;
    errorMessages: any = [];
    addOnTests: any;
    remarks: any;
    selectedItem: any;
    doctorSpecialities: any = [];
    wardsList: any = [];
    specimensList: any = [];
    isSelectAll: boolean = false;
    listOfTest: any = [];
    classEd: string = "fs-7 btn";
    classIp: string = "fs-7 btn";
    classOp: string = "fs-7 btn";
    classOpIOP: string = "fs-7 btn selected";
    selectedPatientType = "1";
    ResultsEntered: number = 0;
    ResultsVerified: number = 0;
    showDischargeMedication: boolean = false;
    OrderTypeID: number = 0;
    IsFitForDischarge: boolean = false;
    closeSubscription: any;

    constructor(private fb: FormBuilder, private us: UtilityService, private modalService: GenericModalBuilder) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
        this.initializeForm();
        this.FetchTestRequisitions();
        this.fetchDoctorSpecialities();
        this.fetchWards();
        this.fetchSpecimens();
        this.closeSubscription = this.us.closeModalEvent.subscribe(() => {
        this.FetchTestRequisitions();
    });

    }

    initializeForm() {
        this.worklistForm = this.fb.group({
            FromDate: new Date(),
            ToDate: new Date(),
            DocSpecialityId: '',
            WardId: [],
            Specimen: [],
            TestId: 0,
            TestName: '',
            SSN: '',
            SampleNumber: '',
            BloodUnitNumber: ''
        });
    }

    fetchDoctorSpecialities() {
        const url = this.us.getApiUrl(EmployeewiseWorklist.FetchEmployeeSpecializationsEPP, {
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.doctorSpecialities = response.FetchEmployeeSpecializationsEPPDataList;
            }
        });
    }

    fetchWards() {
        const url = this.us.getApiUrl(EmployeewiseWorklist.FetchWardsEPP, {
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.wardsList = response.FetchWardsEPPDataList;
            }
        });
    }

    fetchSpecimens() {
        const url = this.us.getApiUrl(EmployeewiseWorklist.FetchSpecimenEPP, {
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.specimensList = response.FetchSpecimenEPPDataList;
            }
        });
    }

    onDateChange() {
        this.FetchTestRequisitions();
    }
    FetchTestRequisitionsN(patientType: string) {

        if (patientType == "3")
            this.selectedPatientType = "3";
        else if (patientType == "2")
            this.selectedPatientType = "2";
        else if (patientType == "1")
            this.selectedPatientType = "1";
        else
            this.selectedPatientType = "0";
        this.FetchTestRequisitions();
    }
    onSSNEnterPress(event: Event) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
          event.preventDefault();
          this.onchangeSSN();
        }
      }
      onchangeSSN() {
       this.FetchTestRequisitions();    
      }

    FetchTestRequisitions() {
        this.isSelectAll = false;
        if (!this.worklistForm.value['FromDate'] || !this.worklistForm.value['ToDate']) {
            return;
        }
        if (this.selectedPatientType == "3") {
            this.classEd = "fs-7 btn selected";
            this.classIp = "fs-7 btn";
            this.classOp = "fs-7 btn";
            this.classOpIOP = "fs-7 btn";
        }
        else if (this.selectedPatientType == "2") {
            this.classEd = "fs-7 btn";
            this.classIp = "fs-7 btn selected";
            this.classOp = "fs-7 btn";
            this.classOpIOP = "fs-7 btn";
        }
        else if (this.selectedPatientType == "1") {
            this.classEd = "fs-7 btn";
            this.classIp = "fs-7 btn";
            this.classOp = "fs-7 btn selected";
            this.classOpIOP = "fs-7 btn";
        }
        else if (this.selectedPatientType == "0") {
            this.classEd = "fs-7 btn";
            this.classIp = "fs-7 btn";
            this.classOp = "fs-7 btn ";
            this.classOpIOP = "fs-7 btn selected";
        }
        const url = this.us.getApiUrl(EmployeewiseWorklist.FetchTestRequisitionsBetweenDates, {
            FromDate: moment(this.worklistForm.get('FromDate').value).format('DD-MMM-YYYY'),
            ToDate: moment(this.worklistForm.get('ToDate').value).format('DD-MMM-YYYY'),
            DocSpecialityId: this.worklistForm.get('DocSpecialityId').value ? this.worklistForm.get('DocSpecialityId').value : 0,
            wardId: this.worklistForm.get('WardId').value?.length > 0 ? this.worklistForm.get('WardId').value.map((element: any) => element.WardID).toString() : 0,
            Specimen: this.worklistForm.get('Specimen').value?.length > 0 ? this.worklistForm.get('Specimen').value.map((element: any) => element.ID).toString() : 0,
            TestId: this.worklistForm.get('TestId').value ? this.worklistForm.get('TestId').value : 0,
            SSN: this.worklistForm.get('SSN').value ? this.worklistForm.get('SSN').value : 0,
            SampleNumber: this.worklistForm.get('SampleNumber').value ? this.worklistForm.get('SampleNumber').value : 0,
            BloodUnitNumber: this.worklistForm.get('BloodUnitNumber').value ? this.worklistForm.get('BloodUnitNumber').value : 0,
            PatientType: this.selectedPatientType,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                response.FetchTestRequisitionsBetweenDatesDataLists.forEach((element: any, index: any) => {
                    element.Class = "worklist_card gx-2 p-2 rounded-2 mx-0 row";
                    element.Selected = false;
                    if (element.Status === "1")
                        element.AClass = "newRequest";
                    if (element.Status === "3")
                        element.AClass = "sampleCollect";
                    if (element.Status === "4")
                        element.AClass = "sampleacknowledged";
                    if (element.Status === "7")
                        element.AClass = "resultsEntered";
                    if (element.Status === "8")
                        element.AClass = "resultsverified";
                    if (element.Status === "13")
                        element.AClass = "SampleRejected";
                    if (element.Status === "-1")
                        element.AClass = "reCollect";
                });

                this.fetchTestRequisitionsList = this.fetchTestRequisitionsFullList = response.FetchTestRequisitionsBetweenDatesDataLists;
                if (this.OrderTypeID == 15)
                    this.fetchTestRequisitionsList = this.fetchTestRequisitionsFullList.filter((x: any) => x.OrderTypeID === this.OrderTypeID);
                if (this.IsFitForDischarge)
                    this.fetchTestRequisitionsList = this.fetchTestRequisitionsList.filter((element: any) => element.AssignedToEmpID.toString() === this.doctorDetails[0].EmpId.toString());

                this.ResultsEntered = response.FetchTestRequisitionsBetweenDatesData1Lists[0].ResultsEntered;
                this.ResultsVerified = response.FetchTestRequisitionsBetweenDatesData1Lists[0].ResultsVerified;
            }
        });
    }
    toggleFilter() {
        if (!this.showDischargeMedication) {
            this.showDischargeMedication = true;
            this.OrderTypeID = 15;
        } else {
            this.showDischargeMedication = false;
            this.OrderTypeID = 0;
        }
        this.FetchTestRequisitions();
    }

    onClearClick() {
        this.IsFitForDischarge = false;
        this.classEd = "fs-7 btn";
        this.classIp = "fs-7 btn";
        this.classOp = "fs-7 btn";
        this.classOpIOP = "fs-7 btn selected";
        this.selectedPatientType = "1";
        this.ResultsEntered = 0;
        this.ResultsVerified = 0;
        this.showDischargeMedication = false;
        this.OrderTypeID = 0;
        this.showDischargeMedication = false;
        this.initializeForm();
        this.FetchTestRequisitions();
    }

    onSelectAllClick() {
        this.isSelectAll = !this.isSelectAll;
        this.fetchTestRequisitionsList.forEach((element: any) => element.selected = this.isSelectAll);
    }

    showAssignedToMe() {
        if (!this.IsFitForDischarge)
            this.IsFitForDischarge = true;
        else
            this.IsFitForDischarge = false;
        this.isSelectAll = false;
        this.fetchTestRequisitionsFullList.forEach((element: any) => element.selected = false);
        if (this.IsFitForDischarge) {
            this.fetchTestRequisitionsList = this.fetchTestRequisitionsFullList.filter((element: any) => element.AssignedToEmpID.toString() === this.doctorDetails[0].EmpId.toString());
        } else {
            this.fetchTestRequisitionsList = this.fetchTestRequisitionsFullList;
        }
        
    }

    onAssignToMeClick() {
        this.errorMessages = [];
        const selectedItems = this.fetchTestRequisitionsList.filter((element: any) => element.selected);
        if (selectedItems.length === 0) {
            this.errorMessages.push('Please Select Tests');
        }
        if (this.errorMessages.length > 0) {
            $('#errorMsg').modal('show');
            return;
        }
        const payload = {
            AssignedToEmpId: this.doctorDetails[0].EmpId,
            TestOrderItems: selectedItems.map((e: any) => e.TestOrderItemID).toString(),
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        };
        this.us.post(EmployeewiseWorklist.SaveAssignTestOrderItems, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                this.FetchTestRequisitions();
            }
        });
    }

    onHistoryClick(item: any) {
        this.testHistory = null;
        this.testandSpecialisation = item.Specialisation + '-' + item.TestName;
        const url = this.us.getApiUrl(EmployeewiseWorklist.FetchTestResultDetailsEP, {
            TestOrderID: item.TestOrderid,
            TestOrderItemID: item.TestOrderItemID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200 && response.FetchTestResultDetailsEPDataList.length > 0) {
                $('#viewhistoryModal').modal('show');
                this.testHistory = response.FetchTestResultDetailsEPDataList[0];
            }
        });
    }

    addOnTestClick(item: any) {
        this.selectedItem = item;
        this.addOnTests = [];
        this.remarks = '';
        const payload = {
            SpecialiseID: item.SpecialiseID,
            SpecimenID: item.SpecimenID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        };
        const url = this.us.getApiUrl(EmployeewiseWorklist.FetchServiceItemsEPP, payload);
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.addOnTests = response.FetchServiceItemsEPPDataList;
                $('#addOnTestModal').modal('show');
            }
        });
    }

    saveAddOnTests() {
        this.errorMessages = [];
        const selectedItems = this.addOnTests.filter((element: any) => element.selected);
        if (selectedItems.length === 0) {
            this.errorMessages.push('Please Select Tests');
        }
        if (!this.remarks) {
            this.errorMessages.push('Please Enter Remarks');
        }
        if (this.errorMessages.length > 0) {
            $('#errorMsg').modal('show');
            return;
        }
        const payload = {
            "TestorderId": this.selectedItem.TestOrderid,
            "RefOrderItemID": this.selectedItem.TestOrderItemID,
            "IPID": this.selectedItem.IPID,
            "TestXML": selectedItems.map((element: any) => {
                return {
                    TSTID: element.ProcedureID,
                    REM: this.remarks,
                    TPID: ''
                }
            }),
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        };
        this.us.post(EmployeewiseWorklist.SaveNewOrderItemEP, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#addOnTestModal').modal('hide');
                $('#savemsg').modal('show');
                this.FetchTestRequisitions();
            }
        });
    }

    openPatientSummary() {
        const options: NgbModalOptions = {
            windowClass: 'vte_view_modal'
        };
        const modalRef = this.modalService.openModal(PatientfoldermlComponent, { readonly: true }, options);
    }

    onResultEntryClick(item: any) {
        item.SampleCollectedAt = item.OrderDate;
        item.GenderId = item.Gender === 'Male' ? '1' : '2';
        item.FullAge = item.Age;
        item.OrderSlNo = item.ORDERSLNO;
        item.Test = item.TestName;
        item.DocName = item.DoctorName;
        
        item.PatientType = item.PatientType == 'OP' ? '1' : item.PatientType == 'IP' ? '2' : item.PatientType == 'ED' ? '3' : '4'
        sessionStorage.setItem('selectedPatientData', JSON.stringify(item));
        sessionStorage.setItem('selectedPatientLabData', JSON.stringify(item));
        const options: NgbModalOptions = {
            size: 'xl',
            windowClass: 'labBulkVerification_modal',
        };
        const modalRef = this.modalService.openModal(LabResultentryComponent, {
            readonly: true,
            data: item
        }, options);
    }
    searchTest(event: any) {
        var filter = event.target.value;
        if (filter.length >= 3) {
            const url = this.us.getApiUrl(EmployeewiseWorklist.FetchTestEPP, {
                DisplayName: filter,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });

            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.listOfTest = response.FetchTestEPPDataList;
                }
            });
        } else {
            this.worklistForm.patchValue({
                TestId: 0
            });
            this.listOfTest = [];
        }
    }
    onItemSelected(ward: any) {
        this.worklistForm.patchValue({
            TestId: ward.ServiceItemID
        })
        this.listOfTest = [];
        this.FetchTestRequisitions();
    }

    clearTestNameInput() {
        this.worklistForm.patchValue({
            TestName: '',
            TestId: 0
        });
        this.FetchTestRequisitions();
    }

    getTasksCount(TaskStatus: any) {
        if (!this.fetchTestRequisitionsFullList) {
          return 0;
        }
        let data = [...this.fetchTestRequisitionsFullList];
        if (this.OrderTypeID == 15)
            data = data.filter((x: any) => x.OrderTypeID === this.OrderTypeID);
        return data.filter((e: any) => e.Status == TaskStatus).length;
    }

    filterSurgeryRequests(type: string, TypeName:string) {
        let data = [...this.fetchTestRequisitionsFullList];
        if (this.OrderTypeID == 15)
            data = data.filter((x: any) => x.OrderTypeID === this.OrderTypeID);
        if (this.IsFitForDischarge)
            data = data.filter((element: any) => element.AssignedToEmpID.toString() === this.doctorDetails[0].EmpId.toString());
        this.fetchTestRequisitionsList = data.filter((x: any) => x.Status === type);
    }
}

export const EmployeewiseWorklist = {
    FetchTestRequisitionsBetweenDates: 'FetchTestRequisitionsBetweenDates?FromDate=${FromDate}&ToDate=${ToDate}&DocSpecialityId=${DocSpecialityId}&wardId=${wardId}&Specimen=${Specimen}&TestId=${TestId}&SSN=${SSN}&SampleNumber=${SampleNumber}&BloodUnitNumber=${BloodUnitNumber}&PatientType=${PatientType}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchTestResultDetailsEP: 'FetchTestResultDetailsEP?TestOrderID=${TestOrderID}&TestOrderItemID=${TestOrderItemID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveAssignTestOrderItems: 'SaveAssignTestOrderItems',
    FetchServiceItemsEPP: 'FetchServiceItemsEPP?SpecialiseID=${SpecialiseID}&SpecimenID=${SpecimenID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveNewOrderItemEP: 'SaveNewOrderItemEP',
    FetchEmployeeSpecializationsEPP: 'FetchEmployeeSpecializationsEPP?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchWardsEPP: 'FetchWardsEPP?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchSpecimenEPP: 'FetchSpecimenEPP?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchTestEPP: 'FetchTestEPP?DisplayName=${DisplayName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}