import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { ConfigService } from 'src/app/ward/services/config.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { BloodrequestComponent } from 'src/app/ward/bloodrequest/bloodrequest.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';

declare var $: any;

@Component({
    selector: 'app-cross-match',
    templateUrl: './cross-match.component.html',
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
export class CrossMatchComponent extends BaseComponent implements OnInit {
    @ViewChild('TransfusionIndications') TransfusionIndications!: ElementRef;
    @ViewChild('Remarks') Remarks!: ElementRef;
    @ViewChild('SpecialProcessing') SpecialProcessing!: ElementRef;
    showPatientSummaryinPopUp = false;
    tablePatientsForm!: FormGroup;
    selectedPatientType = "1";
    facility: any;
    facilityId: any;
    bloodRequestOrders: any = [];
    bloodRequestOrders1: any = [];
    sortedGroupedByDate: any;
    selectedPatient: any;
    bloodGroups: any = [];
    antiBodyDataList: any = [];
    bloodOrders: any = [];
    bloodBagsList: any = [];
    doctorsList: any = [];
    errorMessages: any = [];
    crossMatchTypeData: any;
    compatibilityData: any;
    showAllergydiv: boolean = false;
    crossMatchPopupData: any;
    compatibilityModalData: any;
    FetchBloodIssueDetailsDataList: any;
    trustedUrl: any;

    BloodGroup: any;
    Antibiodies: any;
    XMatch: any;


    constructor(private fb: FormBuilder, private datepipe: DatePipe, private us: UtilityService, private config: ConfigService, private modalSvc: NgbModal, private modalService: GenericModalBuilder) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
        this.initializetablePatientsForm();
        this.FetchBloodRequestOrders();
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
        this.FetchBloodRequestOrders();
    }

    onDateChange() {
        this.FetchBloodRequestOrders();
    }

    FetchBloodRequestOrdersDisplay(type: any) {
        this.selectedPatientType = type;
        this.FetchBloodRequestOrders();
    }

    FetchBloodRequestOrders() {
        if (this.tablePatientsForm.value['FromDate'] && this.tablePatientsForm.value['ToDate']) {
            this.bloodRequestOrders = []; this.bloodRequestOrders1 = [];
            const FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
            const ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
            const apiURL = this.selectedPatientType === '2' ? CrossMatch.FetchBloodRequestOrderIP  : CrossMatch.FetchBloodRequestOrderOP;
            const payload = {
                SSN: $('#NationalId').val() ? $('#NationalId').val() : '0',
                PatientType:this.selectedPatientType,
                FromDate,
                ToDate,
                ISSTAT: '0',
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            };
            const url = this.us.getApiUrl(apiURL, payload)
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.bloodRequestOrders = [];  this.bloodRequestOrders1 = [];
                    if (this.selectedPatientType === '1') {
                        this.bloodRequestOrders =  this.bloodRequestOrders1 =  response.FetchBloodRequestOrderOPDataList;
                    } else if (this.selectedPatientType === '2') {
                        this.bloodRequestOrders = this.bloodRequestOrders1 = response.FetchBloodRequestOrderIPDataList;
                    }
                    else if (this.selectedPatientType === '3') {
                        this.bloodRequestOrders = this.bloodRequestOrders1 = response.FetchBloodRequestOrderOPDataList;
                    }
                    this.prepareGroupedData();
                }
            });
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

    onSSNEnterPress(event: Event) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            event.preventDefault();
            this.FetchBloodRequestOrders();
        }
    }

    clearSearchCriteria() {
        this.initializetablePatientsForm();
        $('#NationalId').val('');
        this.FetchBloodRequestOrders();
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
    openAllergyPopup() {
        this.showAllergydiv = true;
      }

    initializeCrossmatchPopupData() {
        this.crossMatchPopupData = {
            PatBloodgroup: this.selectedPatient.BloodGroupID,
            TransfusionIndications: this.selectedPatient.Indicationtransfusion,
            Diagnosis: this.selectedPatient.ClinicalDiagNosis,
            Remarks: '',
            SpecialProcessing: '',
            IsInspectionDone: '1',
            ReviewOfSerologyResults: '1',
            IsCompatabilityOrNot: '1',
            StartDate: new Date(),
            StartTime: this.setCurrentTime(),
            EndDate: new Date(),
            EndTime: this.setCurrentTime(),
            CrossMatchedBy: null,
            Technician: null,
            selectedBloodBags: [],
            TransfusiontypeName: this.selectedPatient.TransfusiontypeName,
            RequestTypeName: this.selectedPatient.RequestTypeName,
        };
        this.crossMatchTypeData = [];
        this.compatibilityData = [];
        this.bloodGroups = [];
        this.antiBodyDataList = [];
        this.bloodOrders = [];
        this.compatibilityModalData = null;
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

    // openBloodDeatilsModal(item: any) {
    //     this.FetchBloodIssueDetailsDataList = [];
    //     this.selectedPatient = item;
    //     const payload = {
    //         PatientID: this.selectedPatient.PatientID,
    //         UserID: this.doctorDetails[0].UserId,
    //         WorkStationID: this.facilityId,
    //         HospitalID: this.hospitalID
    //     };
    //     const url = this.us.getApiUrl(CrossMatch.FetchBloodIssueDetails, payload);
    //     this.us.get(url).subscribe((response: any) => {
    //         if (response.Code === 200) {
    //             this.FetchBloodIssueDetailsDataList = response.FetchBloodIssueDetailsDataList;
    //         }
    //     });
    //     $('#patientBloodDetails_modal').modal('show');
    // }
    openBloodDeatilsModal(item: any) {
        this.FetchBloodIssueDetailsDataList = [];
        this.selectedPatient = item;
        const payload = {
            UHID: this.selectedPatient.RegCode,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        };
        const url = this.us.getApiUrl(CrossMatch.FetchBloodIssueDetailsHosp, payload);
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchBloodIssueDetailsDataList = response.FetchBloodIssueDetailsDataList.sort((a: any, b: any) => new Date(a.Issuedate).getTime() - new Date(b.Issuedate).getTime());
            }
        });
        $('#patientBloodDetails_modal').modal('show');
    }
    
    fetchPanaceaResults(item: any) {
  
       const url = this.us.getApiUrl(CrossMatch.FetchBloodPanaceaResults, {
                   BloodOrderID: item.BloodorderID,
                   PanaceaOrderID: item.PanaceaBloodOrder == '' ?  0 : item.PanaceaBloodOrder,
                   WorkStationID: this.facilityId,
                   HospitalID: this.hospitalID
               });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                if(response.FetchBloodPanaceaResultsFinalDataList.length>0){
                    this.BloodGroup = response.FetchBloodPanaceaResultsFinalDataList[0].BloodGroup;
                    this.crossMatchPopupData.PatBloodgroup=response.FetchBloodPanaceaResultsFinalDataList[0].BloodGroupID;                        
                    this.crossMatchPopupData.IsCompatabilityOrNot= response.FetchBloodPanaceaResultsFinalDataList[0].XMatchID;
                    
                    this.Antibiodies = response.FetchBloodPanaceaResultsFinalDataList[0].Antibiodies;
                    this.antiBodyDataList[0].selectedValue=response.FetchBloodPanaceaResultsFinalDataList[0].AntibiodiesID;
                    this.XMatch = response.FetchBloodPanaceaResultsFinalDataList[0].XMatch;
                }else{
                    this.BloodGroup = "";
                    this.Antibiodies = "";
                    this.XMatch = "";
                }
                
               
            }
        });
    }

    fetchBloodGroupMaster(item: any) {
        var payload = {
            PatientID: item.PatientID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        }
        const url = this.us.getApiUrl(CrossMatch.FetchBloodRequestMasters, payload)
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.crossMatchTypeData = response.FetchBloodGroupMastersData2List;
                this.compatibilityData = response.FetchBloodGroupMastersData1List;
                this.bloodGroups = response.FetchBloodGroupMastersDataList;
                this.antiBodyDataList = response.FetchBindAntibodyDataList;
                this.antiBodyDataList.forEach((element: any) => {
                    element.selectedValue = 0
                });
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
        const url = this.us.getApiUrl(CrossMatch.FetchOPBloodorder, payload)
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.bloodOrders = response.FetchOPBloodorderData2List;
                if (this.selectedPatient.CrossmactID) {
                    if (this.selectedPatient.PatientType === '1') {
                        this.FetchOPCrossMatchDetails();
                    } else {
                        this.FetchIPCrossMatchDetails();
                    }
                }else {
                     this.fetchPanaceaResults(this.selectedPatient);
                }
            }
        });
    }

    searchBloodBags(event: any,Flength:number) {
        let filter = event.target.value;
        this.bloodBagsList=[];
        if (filter.length > Flength) {
            const components = this.bloodOrders.map((item: any) => item.ComponentID).join(',');
            var payload: any = {
                ComponentID: components,
                BagNumber: filter.toString().replace('=',''),
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            }
            if (this.selectedPatient.PatientType === '2') {
                payload.BloodGroupID = this.selectedPatient.BloodGroupID;
                payload.PatientID = this.selectedPatient.PatientID;
            }
            const url = this.us.getApiUrl(this.selectedPatient.PatientType === '2' ? CrossMatch.FetchIPbloodBags  : CrossMatch.FetchbloodBags, payload)
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.bloodBagsList = response.FetchbloodBagsDataList;
                    if(response.FetchbloodBagsDataList.length==1){
                        this.onBloodBagSelection(this.bloodBagsList[0]);
                    }
                }
            });
        }
    }

    searchscanBloodBags(event: any,Flength:number) {
        let filter = event.target.value;
        this.bloodBagsList=[];
        if (filter.length > Flength) {
            const components = this.bloodOrders.map((item: any) => item.ComponentID).join(',');
            var payload: any = {
                ComponentID: components,
                BagNumber: filter.toString().replace('=',''),
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            }
            if (this.selectedPatient.PatientType === '2' || this.selectedPatient.PatientType === '3') {
                payload.BloodGroupID = this.selectedPatient.BloodGroupID;
                payload.PatientID = this.selectedPatient.PatientID;
            }
            const url = this.us.getApiUrl(this.selectedPatient.PatientType === '2' ? CrossMatch.FetchIPbloodBags : CrossMatch.FetchbloodBags, payload)
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.bloodBagsList = response.FetchbloodBagsDataList;
                    if(response.FetchbloodBagsDataList.length>=1){
                        this.onBloodBagSelection(this.bloodBagsList[0]);
                    }
                }
            });
        }
    }
    deleteComponent(item: any, index: any) {       
        this.crossMatchPopupData.selectedBloodBags.splice(index, 1);
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

    onCrossMatchedSelection(item: any) {
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
                this.crossMatchPopupData.CrossMatchedBy = item;
            } else {
                this.crossMatchPopupData.CrossMatchedBy = null;
                $('#textbox_crossmatchedby').val('');
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

    onBloodBagSelection(item: any) {
        this.bloodBagsList = [];
        const itemFound = this.crossMatchPopupData.selectedBloodBags.find((x: any) => x.BagNumber === item.BagNumber);
        if (!itemFound) {
            this.crossMatchPopupData.selectedBloodBags.push(item);
        }
        setTimeout(() => {
            $('#textbox_bloodbag').val('');
            $('#textbox_bloodbagscan').val('');
            this.bloodBagsList=[];
        }, 500);
    }

    openCompatabilityModal(item: any) {
        this.compatibilityModalData = item;
        $('#compatibility_modal').modal('show');
    }

    onCompatibilityOkClick() {
        this.errorMessages = [];
        if (!this.compatibilityModalData.CrossMatchTypeID) {
            this.errorMessages.push('Please select Cross Match Type');
        }

        if (!this.compatibilityModalData.CompatibilityID) {
            this.errorMessages.push('Please select Compatibility');
        }

        if (this.errorMessages.length > 0) {
            $('#errorMsg').modal('show');
            return;
        }
        this.compatibilityModalData = null;
        $('#compatibility_modal').modal('hide');
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
                return !element.CrossMatchTypeID || !element.CompatibilityID;
            });
            if (noData.length > 0) {
                this.errorMessages.push('Please Select Cross Match Type and Compatibility');
            }
        }
        if (this.antiBodyDataList.length > 0) {
            const noData = this.antiBodyDataList.filter((element: any) => {
                return !element.selectedValue;
            });
            if (noData.length > 0) {
                this.errorMessages.push('Please Select Antibody Results');
            }
        }
        if (!this.crossMatchPopupData.Technician) {
            this.errorMessages.push('Please Select Technician');
        }

        if (!this.crossMatchPopupData.CrossMatchedBy) {
            this.errorMessages.push('Please Select Crossmatched By');
        }

        if (this.errorMessages.length > 0) {
            $('#errorMsg').modal('show');
            return;
        }

        const CMDetailXML = this.crossMatchPopupData.selectedBloodBags.map((element: any) => {
            return {
                "BBD": element.BloodBagid,
                "BGD": element.Bloodgroupid,
                "BGS": "0",
                "CID": element.ComponentID,
                "CMS": element.ChkCrossmatched
            }
        });

        const CMTPDetailXML = this.crossMatchPopupData.selectedBloodBags.map((element: any) => {
            return {
                "BBD": element.BloodBagid,
                "CMD": element.CrossMatchTypeID
            }
        });

        const CMMPDetailXML = this.crossMatchPopupData.selectedBloodBags.map((element: any) => {
            return {
                "BBD": element.BloodBagid,
                "CPD": element.CompatibilityID
            }
        });

        const payload = {
            "CrossmatchID": this.selectedPatient.CrossmactID ? this.selectedPatient.CrossmactID : 0,
            "PatientID": this.selectedPatient.PatientID,
            "PatientType": this.selectedPatient.PatientType,
            "IPID": this.selectedPatient.IPID,
            "DoctorID": this.selectedPatient.DoctorID,
            "CrossmatchBy": this.crossMatchPopupData.CrossMatchedBy.ID,
            "PatBloodgroup": this.crossMatchPopupData.PatBloodgroup,
            "Remarks": this.Remarks.nativeElement.innerHTML,
            "TransfusionIndications": this.TransfusionIndications.nativeElement.innerHTML,
            "BloodorderID": this.selectedPatient.BloodorderID,
            "Verify": "0",
            "VerifyBy": "0",
            "BillID": this.selectedPatient.BILLID ? this.selectedPatient.BILLID : 0,
            CMDetailXML,
            CMTPDetailXML,
            CMMPDetailXML,
            "TransferID": this.selectedPatient.PatientType === '1' ? '0' : '1',
            "OrderBedID": this.selectedPatient.PatientType === '1' ? '0' : this.selectedPatient.OrderBedID,
            "ReasonForCrossSMatch": "",
            "AntibodyScreeningID": this.antiBodyDataList[0].selectedValue,
            "AutoAntibodiesID": this.antiBodyDataList[1].selectedValue,
            "IsInspectionDone": this.crossMatchPopupData.IsInspectionDone,
            "ReviewOfSerologyResults": this.crossMatchPopupData.ReviewOfSerologyResults,
            "IsCompatabilityOrNot": this.crossMatchPopupData.IsCompatabilityOrNot,
            "SpecialProcessing": this.SpecialProcessing.nativeElement.innerHTML,
            "TechnicianId": this.crossMatchPopupData.Technician.ID,
            "StartDateTime": moment(new Date(this.crossMatchPopupData.StartDate)).format('DD-MMM-YYYY') + ' ' + this.crossMatchPopupData.StartTime,
            "EndDateTime": moment(new Date(this.crossMatchPopupData.EndDate)).format('DD-MMM-YYYY') + ' ' + this.crossMatchPopupData.EndTime,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospitalID
        };
        this.us.post(CrossMatch.SaveCrossMatch, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                $('#ipCrossmatch_modal').modal('hide');
                this.FetchBloodRequestOrders();
            }
        });
    }

    FetchOPCrossMatchDetails() {
        const payload = {
            CrossmactID: this.selectedPatient.CrossmactID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        };
        const url = this.us.getApiUrl(CrossMatch.FetchOPCrossMatch, payload)
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                response.FetchOPCrossMatch2List.forEach((element: any) => {
                    element.Bloodgroupid = element.BloodGroupID;
                    element.ChkCrossmatched = element.CrossMatchStatus === 'True' ? true : false;
                    const crossMatchType = response.FetchOPCrossMatch3List.find((a: any) => a.BloodBagid === element.BloodBagid);
                    element.CrossMatchTypeID = crossMatchType.CrossmatchTypeID;
                    const compatibilityType = response.FetchOPCrossMatch4List.find((a: any) => a.BloodBagid === element.BloodBagid);
                    element.CompatibilityID = compatibilityType.CompatibilityID;
                });
                // this.crossMatchPopupData = {
                //     PatBloodgroup: response.FetchOPCrossMatch1List[0].PatBloodgroup,
                //     TransfusionIndications: response.FetchOPCrossMatch1List[0].TransfusionIndications,
                //     Diagnosis: this.selectedPatient.ClinicalDiagNosis,
                //     Remarks: response.FetchOPCrossMatch1List[0].Remarks,
                //     SpecialProcessing: response.FetchOPCrossMatch1List[0].SpecialProcessing,
                //     IsInspectionDone: response.FetchOPCrossMatch1List[0].IsInspectionDone === 'True' ? '1' : '2',
                //     ReviewOfSerologyResults: response.FetchOPCrossMatch1List[0].ReviewOfSerologyResults,
                //     IsCompatabilityOrNot: response.FetchOPCrossMatch1List[0].IsCompatabilityOrNot === 'True' ? '1' : '2',
                //     StartDate: new Date(response.FetchOPCrossMatch1List[0].StartDateTime.split(' ')[0]),
                //     StartTime: response.FetchOPCrossMatch1List[0].StartDateTime.split(' ')[1],
                //     EndDate: new Date(response.FetchOPCrossMatch1List[0].EndDateTime.split(' ')[0]),
                //     EndTime: response.FetchOPCrossMatch1List[0].EndDateTime.split(' ')[1],
                //     CrossMatchedBy: {
                //         ID: response.FetchOPCrossMatch1List[0].CrossMatchedBy
                //     },
                //     Technician: {
                //         ID: response.FetchOPCrossMatch1List[0].TechnicianId
                //     },
                //     selectedBloodBags: response.FetchOPCrossMatch2List
                // };

                this.crossMatchPopupData.PatBloodgroup= response.FetchOPCrossMatch1List[0].PatBloodgroup;
                this.crossMatchPopupData.TransfusionIndications= response.FetchOPCrossMatch1List[0].TransfusionIndications;
                this.crossMatchPopupData.Diagnosis= this.selectedPatient.ClinicalDiagNosis;
                this.crossMatchPopupData.Remarks= response.FetchOPCrossMatch1List[0].Remarks;
                this.crossMatchPopupData.SpecialProcessing= response.FetchOPCrossMatch1List[0].SpecialProcessing;
                this.crossMatchPopupData.IsInspectionDone= response.FetchOPCrossMatch1List[0].IsInspectionDone === 'True' ? '1' : '2';
                this.crossMatchPopupData.ReviewOfSerologyResults= response.FetchOPCrossMatch1List[0].ReviewOfSerologyResults;
                this.crossMatchPopupData.IsCompatabilityOrNot= response.FetchOPCrossMatch1List[0].IsCompatabilityOrNot === 'True' ? '1' : '2';
                this.crossMatchPopupData.StartDate= new Date(response.FetchOPCrossMatch1List[0].StartDateTime.split(' ')[0]);
                this.crossMatchPopupData.StartTime= response.FetchOPCrossMatch1List[0].StartDateTime.split(' ')[1];
                //this.crossMatchPopupData.EndDate= response.FetchOPCrossMatch1List[0].EndDateTime.split(' ')[1];

                 this.crossMatchPopupData.EndDate= new Date(response.FetchOPCrossMatch1List[0].EndDateTime.split(' ')[0]);
                 this.crossMatchPopupData.EndTime= response.FetchOPCrossMatch1List[0].EndDateTime.split(' ')[1];


                this.crossMatchPopupData.CrossMatchedBy={ID:response.FetchOPCrossMatch1List[0].CrossMatchedBy}; 
                this.crossMatchPopupData.Technician={ID:response.FetchOPCrossMatch1List[0].TechnicianId};
                this.crossMatchPopupData.selectedBloodBags= response.FetchOPCrossMatch2List;

                this.fetchPanaceaResults(this.selectedPatient);
                $('#textbox_technician').val(response.FetchOPCrossMatch1List[0].TechnicianName);
                $('#textbox_crossmatchedby').val(response.FetchOPCrossMatch1List[0].CrossmatchByName);
                this.antiBodyDataList[0].selectedValue = response.FetchOPCrossMatch1List[0].AntibodyScreeningID;
                this.antiBodyDataList[1].selectedValue = response.FetchOPCrossMatch1List[0].AutoAntibodiesID;
            }
        });
    }

    FetchIPCrossMatchDetails() {
        const payload = {
            CrossmactID: this.selectedPatient.CrossmactID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        }
        const url = this.us.getApiUrl(CrossMatch.FetchIPCrossMatch, payload)
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                response.FetchIPCrossMatch2List.forEach((element: any) => {
                    element.Bloodgroupid = element.BloodGroupID;
                    element.ChkCrossmatched = element.CrossmatchStatus === 'True' ? true : false;
                    const crossMatchType = response.FetchIPCrossMatch3List.find((a: any) => a.BloodBagid === element.BloodBagid);
                    element.CrossMatchTypeID = crossMatchType.CrossmatchTypeID;
                    const compatibilityType = response.FetchIPCrossMatch4List.find((a: any) => a.BloodBagid === element.BloodBagid);
                    element.CompatibilityID = compatibilityType.CompatibilityID;
                });
                // this.crossMatchPopupData = {
                //     PatBloodgroup: response.FetchIPCrossMatch1List[0].PatBloodgroup,
                //     TransfusionIndications: response.FetchIPCrossMatch1List[0].TransfusionIndications,
                //     Diagnosis: this.selectedPatient.ClinicalDiagNosis,
                //     Remarks: response.FetchIPCrossMatch1List[0].Remarks,
                //     SpecialProcessing: response.FetchIPCrossMatch1List[0].SpecialProcessing,
                //     IsInspectionDone: response.FetchIPCrossMatch1List[0].IsInspectionDone === 'True' ? '1' : '2',
                //     ReviewOfSerologyResults: response.FetchIPCrossMatch1List[0].ReviewOfSerologyResults,
                //     IsCompatabilityOrNot: response.FetchIPCrossMatch1List[0].IsCompatabilityOrNot === 'True' ? '1' : '2',
                //     StartDate: new Date(response.FetchIPCrossMatch1List[0].StartDateTime.split(' ')[0]),
                //     StartTime: response.FetchIPCrossMatch1List[0].StartDateTime.split(' ')[1],
                //     EndDate: new Date(response.FetchIPCrossMatch1List[0].EndDateTime.split(' ')[0]),
                //     EndTime: response.FetchIPCrossMatch1List[0].EndDateTime.split(' ')[1],
                //     CrossMatchedBy: {
                //         ID: response.FetchIPCrossMatch1List[0].CrossMatchedBy
                //     },
                //     Technician: {
                //         ID: response.FetchIPCrossMatch1List[0].TechnicianId
                //     },
                //     selectedBloodBags: response.FetchIPCrossMatch2List
                // };
                this.crossMatchPopupData.PatBloodgroup= response.FetchIPCrossMatch1List[0].PatBloodgroup;
                this.crossMatchPopupData.TransfusionIndications= response.FetchIPCrossMatch1List[0].TransfusionIndications;
                this.crossMatchPopupData.Diagnosis= this.selectedPatient.ClinicalDiagNosis;
                this.crossMatchPopupData.Remarks= response.FetchIPCrossMatch1List[0].Remarks;
                this.crossMatchPopupData.SpecialProcessing= response.FetchIPCrossMatch1List[0].SpecialProcessing;
                this.crossMatchPopupData.IsInspectionDone= response.FetchIPCrossMatch1List[0].IsInspectionDone === 'True' ? '1' : '2';
                this.crossMatchPopupData.ReviewOfSerologyResults= response.FetchIPCrossMatch1List[0].ReviewOfSerologyResults;
                this.crossMatchPopupData.IsCompatabilityOrNot= response.FetchIPCrossMatch1List[0].IsCompatabilityOrNot === 'True' ? '1' : '2';
                this.crossMatchPopupData.StartDate= new Date(response.FetchIPCrossMatch1List[0].StartDateTime.split(' ')[0]);
                this.crossMatchPopupData.StartTime= response.FetchIPCrossMatch1List[0].StartDateTime.split(' ')[1];
                //this.crossMatchPopupData.EndDate= response.FetchIPCrossMatch1List[0].EndDateTime.split(' ')[1];

                 this.crossMatchPopupData.EndDate= new Date(response.FetchIPCrossMatch1List[0].EndDateTime.split(' ')[0]);
                this.crossMatchPopupData.EndTime= response.FetchIPCrossMatch1List[0].EndDateTime.split(' ')[1];



                this.crossMatchPopupData.CrossMatchedBy={ID:response.FetchIPCrossMatch1List[0].CrossMatchedBy}; 
                this.crossMatchPopupData.Technician={ID:response.FetchIPCrossMatch1List[0].TechnicianId};
                this.crossMatchPopupData.selectedBloodBags= response.FetchIPCrossMatch2List;
   

                 this.fetchPanaceaResults(this.selectedPatient);
                $('#textbox_technician').val(response.FetchIPCrossMatch1List[0].TechnicianName);
                $('#textbox_crossmatchedby').val(response.FetchIPCrossMatch1List[0].CrossmatchByName);
                this.antiBodyDataList[0].selectedValue = response.FetchIPCrossMatch1List[0].AntibodyScreeningID;
                this.antiBodyDataList[1].selectedValue = response.FetchIPCrossMatch1List[0].AutoAntibodiesID;
            }
        });
    }

    onCrossMatchTypeIDCheckClick(option: any) {
        if (this.compatibilityModalData.CrossMatchTypeID === option.ID) {
            this.compatibilityModalData.CrossMatchTypeID = null;
        } else {
            this.compatibilityModalData.CrossMatchTypeID = option.ID
        }
    }

    onCompatibilityIDCheckClick(option: any) {
        if (this.compatibilityModalData.CompatibilityID === option.ID) {
            this.compatibilityModalData.CompatibilityID = null;
        } else {
            this.compatibilityModalData.CompatibilityID = option.ID
        }
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

    getCrossMatchOrderCount(status: any) {
        if(status == '0') {
            return this.bloodRequestOrders1.filter((x: any) => x.STATUS == '0' || x.STATUS == '-1').length;
        }
        else {
            return this.bloodRequestOrders1.filter((x: any) => x.STATUS == status).length;
        }
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
    GetBloodBagHsitoryPrint() {
        //this.FetchBloodIssueDetailsDataList = [];
        //this.selectedPatient = item;
        const payload = {
            UHID: this.selectedPatient.RegCode,
            PatientID: this.selectedPatient.PatientID,
            IPID: this.selectedPatient.IPID,
            UserName: this.selectedPatient.RegCode,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        };
        const url = this.us.getApiUrl(CrossMatch.FetchBloodIssueDetailsHospPrint, payload);
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

export const CrossMatch = {
    FetchBloodRequestOrderIP: 'FetchBloodRequestOrderIP?SSN=${SSN}&FromDate=${FromDate}&ToDate=${ToDate}&ISSTAT=${ISSTAT}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchBloodRequestOrderOP: 'FetchBloodRequestOrderOP?SSN=${SSN}&PatientType=${PatientType}&FromDate=${FromDate}&ToDate=${ToDate}&ISSTAT=${ISSTAT}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchBloodRequestMasters: 'FetchBloodRequestMasters?PatientID=${PatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchOPBloodorder: 'FetchOPBloodorder?BloodorderID=${BloodorderID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchbloodBags: 'FetchbloodBags?ComponentID=${ComponentID}&BagNumber=${BagNumber}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIPbloodBags: 'FetchIPbloodBagsMulti?BloodGroupID=${BloodGroupID}&ComponentID=${ComponentID}&PatientID=${PatientID}&BagNumber=${BagNumber}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveCrossMatch: 'SaveCrossMatch',
    FetchOPCrossMatch: 'FetchOPCrossMatch?CrossmactID=${CrossmactID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIPCrossMatch: 'FetchIPCrossMatch?CrossmactID=${CrossmactID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchBloodIssueDetails: 'FetchBloodIssueDetails?PatientID=${PatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchBloodIssueDetailsHosp: 'FetchBloodIssueDetailsHosp?UHID=${UHID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchBloodIssueDetailsHospPrint: 'FetchBloodIssueDetailsHospPrint?UHID=${UHID}&PatientID=${PatientID}&IPID=${IPID}&UserName=${UserName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchBloodPanaceaResults: 'FetchBloodPanaceaResults?BloodOrderID=${BloodOrderID}&PanaceaOrderID=${PanaceaOrderID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};