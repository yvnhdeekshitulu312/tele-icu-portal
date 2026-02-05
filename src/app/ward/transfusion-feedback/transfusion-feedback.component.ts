import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment, { utc } from 'moment';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { ConfigService } from 'src/app/ward/services/config.service';
import { ConfigService as appConfig } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { TransfusionReactionReportComponent } from 'src/app/templates/transfusion-reaction-report/transfusion-reaction-report.component';

declare var $: any;

@Component({
    selector: 'app-transfusion-feedback',
    templateUrl: './transfusion-feedback.component.html',
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
export class TransfusionFeedbackComponent extends BaseComponent implements OnInit {
    @ViewChild('preTransfusion') preTransfusion!: ElementRef;
    @ViewChild('postTransfusion') postTransfusion!: ElementRef;
    @ViewChild('remarks') remarks!: ElementRef;

    @ViewChild('reactionForm', { static: false })
    reactionForm: TransfusionReactionReportComponent | undefined;

    @Input() 
    data: any;

    facility: any;
    facilityId: any;
    FetchTransfBloodgroupDataList: any;
    FetchTransfAntibiotDataList: any;
    patientData: any;
    bloodBagsList: any;
    bloodOrderID: any;
    feedbackData: any = {};
    doctorsList: any = [];
    errorMessages: any = [];
    FetchTransfusionfeedBackFFDataList: any = [];
    FeedbackId: any = 0;
    BloodissueId: any = 0;
    IsVitalDisplay: boolean = false;
    showParamValidationMessage = false;
    parameterErrorMessage = '';
    tableVitals: any;
    recordRemarks: Map<number, string> = new Map<number, string>();
    showVitalsValidation: boolean = false;
    tableVitalsListFiltered: any;
    tableVitalsList: any;
    IsFromBedsBoard: boolean = false;
    showReactionReport: boolean = false;
    reactionFormSaved: boolean = false;
    readonly: boolean = false;

    constructor(private us: UtilityService, private config: ConfigService, private appConfig: appConfig, private modalSvc: NgbModal, public router: Router) {
        super();
    }

    ngOnInit(): void {
        this.IsFromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
        this.FetchTransfusionMasters();
        if (this.IsFromBedsBoard) {
            const selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
            $('#ssn').val(selectedView.SSN);
            this.fetchPatientData();
        }
        if (this.data) {
            this.readonly = this.data.readonly;
            $('#ssn').val(this.data.SSN);
            this.fetchPatientData(true);
        }
    }

    getBloodGroup(groupId: any) {
        return this.FetchTransfBloodgroupDataList.find((element: any) => element.Id === groupId)?.Names;
    }

    FetchTransfusionMasters() {
        const url = this.us.getApiUrl(TransfusionFeedback.FetchTransfusionMasters, {
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchTransfBloodgroupDataList = response.FetchTransfBloodgroupDataList;
                this.FetchTransfAntibiotDataList = response.FetchTransfAntibiotDataList;
            }
        }, (_) => {

        });
    }

    onSSNEnterPress(event: any) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
            this.clearFeedackData();
            this.fetchPatientData();
        }
    }

    fetchPatientData(fromEHR?: boolean ) {
        this.patientData = null;
        const url = this.us.getApiUrl(TransfusionFeedback.FetchCurrentInPatientsBlood, {
            SSN: $('#ssn').val() ? $('#ssn').val() : 0,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200 && response.FetchCurrentInPatientsBloodDataList.length > 0) {
                this.patientData = response.FetchCurrentInPatientsBloodDataList[0];
                this.us.setAlertPatientId(this.patientData.PatientID);
                this.prepareFeedbackData();
                if (fromEHR) {
                    this.onSelectRecord({
                        FeedbackId: this.data.feedbackId
                    });
                }
            }
        }, (_) => {

        });
    }

    searchBloodBags(event: any) {
        const filter = event.target.value;
        if (filter.length > 2) {
            const payload: any = {
                PatientID: this.patientData.PatientID,
                PatientType: this.patientData.PatientType,
                BagNumber: filter.replace('=', ''),
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            }
            const url = this.us.getApiUrl(TransfusionFeedback.FetchcrossmatchDetails, payload)
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.bloodBagsList = response.FetchcrossmatchDetailsDataList;
                    this.BloodissueId = response.FetchcrossmatchDetailsDataList[0].BloodissueId;
                    this.bloodOrderID = response.FetchcrossmatchDetailsDataList[0].BloodorderID;
                }
            });
        }
    }

    onBloodBagSelection(item: any) {
        this.feedbackData.selectedBag = item;
        this.BloodissueId = item.BloodissueId;
        this.bloodBagsList = [];
        //this.bloodOrderID='';
    }

    prepareFeedbackData() {
        this.feedbackData = {
            selectedBag: null,
            BagIssuedate: new Date(),
            BagIssuetime: this.setCurrentTime(),
            Quantity: '',
            preBloodgroup: 0,
            Postbloodgroup: 0,
            Commencedate: new Date(),
            Commencetime: this.setCurrentTime(),
            PreTransfusion: '',
            Remarks: '',
            PostTransfusion: '',
            ReactionReported: new Date(),
            ReactionReportedtime: this.setCurrentTime(),
            Concludeddate: new Date(),
            Concludedtime: this.setCurrentTime(),
            nurse: null,
            doctor: null,
            isReactionObserved: false,
            BloodOrderPatientTemplatedetailID: ''
        }
    }

    onClearClick() {
        this.BloodissueId = 0;
        this.bloodBagsList = [];
        this.patientData = null;
        $('#ssn').val('');
        this.clearFeedackData();
    }

    clearFeedackData() {
        this.FeedbackId = 0;
        this.BloodissueId = 0;
        this.bloodOrderID = '';
        $('#textbox_bloodbag').val('');
        $('#textbox_witnessnurse').val('');
        $('#textbox_witnessdoctor').val('');
        if (this.preTransfusion) {
            this.preTransfusion.nativeElement.innerHTML = '';
        }
        if (this.postTransfusion) {
            this.postTransfusion.nativeElement.innerHTML = '';
        }
        if (this.remarks) {
            this.remarks.nativeElement.innerHTML = '';
        }
        this.prepareFeedbackData();
        this.FetchTransfAntibiotDataList.forEach((element: any) => {
            element.isSelected = false;
        });
        this.reactionFormSaved = false;
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

    onNurseSelection(item: any) {
        this.doctorsList = [];
        const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
            backdrop: 'static'
        });
        modalRef.componentInstance.data = {
            UserName: item.EmpNo
        };
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
            if (data.success) {
                this.feedbackData.nurse = item;
            } else {
                this.feedbackData.nurse = null;
                $('#textbox_witnessnurse').val('');
            }
            modalRef.close();
        });
    }

    onDoctorSelection(item: any) {
        this.doctorsList = [];
        const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
            backdrop: 'static'
        });
        modalRef.componentInstance.data = {
            UserName: item.EmpNo
        };
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
            if (data.success) {
                this.feedbackData.doctor = item;
            } else {
                this.feedbackData.doctor = null;
                $('#textbox_witnessdoctor').val('');
            }
            modalRef.close();
        });
    }

    onSaveClick() {
        this.errorMessages = [];
        if (!this.patientData) {
            this.errorMessages.push('Please Select Patient');
        }
        if (!this.feedbackData.selectedBag) {
            this.errorMessages.push('Please Select Bag');
        }
        if (!this.feedbackData.Quantity) {
            this.errorMessages.push('Please Enter Quantity');
        }
        if (!this.feedbackData.preBloodgroup) {
            this.errorMessages.push('Please Select Pre Blood Group');
        }
        const crossMatchTypeSelected = this.FetchTransfAntibiotDataList.filter((element: any) => element.isSelected);
        if (crossMatchTypeSelected.length === 0) {
            this.errorMessages.push('Please Select Crossmatch Type');
        }

        if (this.errorMessages.length > 0) {
            $('#errorMsg').modal('show');
            return;
        }

        if (this.feedbackData.isReactionObserved && !this.reactionFormSaved) {
            this.openReactionReport();
            return;
        }

        const payload = {
            "FeedbackId": this.FeedbackId,
            "IPID": this.patientData.IPID,
            "bedID": this.patientData.Bedid,
            "PatientID": this.patientData.PatientID,
            "PatientTpe": this.patientData.PatientType,
            "DoctorID": this.patientData.ConsultantID,
            "PatBloodgroup": this.patientData.BloodGroupId,
            "BagID": this.feedbackData.selectedBag.BloodBagid,
            "BagNumber": this.feedbackData.selectedBag.BagNumber,
            "BagIssuedate": moment(new Date(this.feedbackData.BagIssuedate)).format('DD-MMM-YYYY') + ' ' + this.feedbackData.BagIssuetime,
            "Commencedate": moment(new Date(this.feedbackData.Commencedate)).format('DD-MMM-YYYY') + ' ' + this.feedbackData.Commencetime,
            "Concludeddate": moment(new Date(this.feedbackData.ReactionReported)).format('DD-MMM-YYYY') + ' ' + this.feedbackData.ReactionReportedtime,
            "ReactionReported": moment(new Date(this.feedbackData.Concludeddate)).format('DD-MMM-YYYY') + ' ' + this.feedbackData.Concludedtime,
            "Quantity": this.feedbackData.Quantity,
            "preBloodgroup": this.feedbackData.preBloodgroup,
            "Postbloodgroup": this.feedbackData.Postbloodgroup,
            "PreTransfusion": this.preTransfusion.nativeElement.innerHTML,
            "Posttransfusion": this.postTransfusion.nativeElement.innerHTML,
            "Remarks": this.remarks.nativeElement.innerHTML,
            "IsBagScanned": "0",
            "IsPatientScanned": "0",
            "WitnessNurse1Id": this.feedbackData.nurse ? this.feedbackData.nurse.ID : "",
            "WitnessDoctor1Id": this.feedbackData.doctor ? this.feedbackData.doctor.ID : "",
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facilityId,
            "Hospitalid": this.hospitalID,
            "BloodissueId": this.BloodissueId,
            "IsReactionObserved": this.feedbackData.isReactionObserved == true ? 1 : 0,
            "CrossmatchtypedetailsXML": crossMatchTypeSelected.map((item: any) => {
                return {
                    BID: this.feedbackData.selectedBag.BloodBagid,
                    CMD: item.Id,
                    CMT: '1'
                }
            })
        }
        this.us.post(TransfusionFeedback.SaveTransfusionfeedBack, payload).subscribe((response: any) => {
            if (response.Code == 200) {
                $('#savemsg').modal('show');
                this.clearFeedackData();
            }
        },
            () => {

            })
    }
    toggleRejectedSamples() {
        this.feedbackData.isReactionObserved = !this.feedbackData.isReactionObserved;
    }

    onViewClick() {
        this.FetchTransfusionfeedBackFFDataList = [];
        const url = this.us.getApiUrl(TransfusionFeedback.FetchTransfusionfeedBackFF, {
            PatientID: this.patientData.PatientID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID,
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code == 200 && response.FetchTransfusionfeedBackFFDataList.length > 0) {
                this.FetchTransfusionfeedBackFFDataList = response.FetchTransfusionfeedBackFFDataList;
                $('#viewModal').modal('show');
            } else {
                this.errorMessages = ['No Records Found'];
                $('#errorMsg').modal('show');
            }
        },
            () => {

            });
    }

    onSelectRecord(item: any) {
        const url = this.us.getApiUrl(TransfusionFeedback.FetchTransfusionfeedBack, {
            FeedbackId: item.FeedbackId,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID,
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code == 200) {
                $('#viewModal').modal('hide');
                const data = response.FetchTransfusionfeedBackData1List[0];
                this.FeedbackId = data.FeedbackId;
                $('#textbox_bloodbag').val(data.BagNumber);
                $('#textbox_witnessnurse').val(data.WitnessNurse1IDName);
                $('#textbox_witnessdoctor').val(data.WitnessDoctor1IDName);
                this.bloodOrderID = data.BloodorderID;
                this.BloodissueId = data.BloodIssueID;
                this.feedbackData = {
                    selectedBag: {
                        BagNumber: data.BagNumber,
                        BloodBagid: data.BagID
                    },
                    BagIssuedate: new Date(data.BagIssuedate.split(' ')[0]),
                    BagIssuetime: data.BagIssuedate.split(' ')[1],
                    Quantity: data.Quantity,
                    preBloodgroup: data.preBloodgroup,
                    Postbloodgroup: data.Postbloodgroup,
                    Commencedate: new Date(data.Commencedate.split(' ')[0]),
                    Commencetime: data.Commencedate.split(' ')[1],
                    PreTransfusion: data.Posttransfusion,
                    Remarks: data.Remarks,
                    PostTransfusion: data.Posttransfusion,
                    ReactionReported: new Date(data.ReactionReported.split(' ')[0]),
                    ReactionReportedtime: data.ReactionReported.split(' ')[1],
                    Concludeddate: new Date(data.Concludeddate.split(' ')[0]),
                    Concludedtime: data.Concludeddate.split(' ')[1],
                    nurse: {
                        ID: data.WitnessNurse1ID
                    },
                    doctor: {
                        ID: data.WitnessDoctor1ID
                    },
                    isReactionObserved: data.IsReactionObserved == 'True' ? true : false,
                    BloodOrderPatientTemplatedetailID: data.BloodOrderPatientTemplatedetailID
                }

                this.reactionFormSaved = this.feedbackData.isReactionObserved;

                response.FetchTransfusionfeedBackData2List.forEach((element1: any) => {
                    if (element1.CrossmatchType == 'True') {
                        this.FetchTransfAntibiotDataList.forEach((element: any) => {
                            if (element.Id == element1.CrossmatchTypeID) {
                                element.isSelected = true;
                            }
                        });
                    }
                });

            }
        },
            () => {

            });
    }

    openVitals() {
        this.errorMessages = [];
        if (this.BloodissueId == 0) {
            this.errorMessages.push('Please Select Bag Number');
        }
        if (this.errorMessages.length > 0) {
            $('#errorMsg').modal('show');
            return;
        }
        this.showVitalsValidation = false;
        this.showParamValidationMessage = false;
        this.patientData.GenderID = this.patientData.Gender === 'Male' ? '1' : '2';
        this.patientData.AgeValue = this.patientData.Age;
        sessionStorage.setItem("InPatientDetails", JSON.stringify(this.patientData));
        this.GetVitalsData();
        $("#vitalsModal").modal('show');
        this.clearVital();
    }

    clearVital() {
        this.IsVitalDisplay = false;
        setTimeout(() => {
            this.IsVitalDisplay = true;
        }, 0);
    }

    receivedData(data: { vitalData: any, remarksData: any }) {
        this.tableVitals = data.vitalData;
        this.recordRemarks = data.remarksData;
    }

    saveVitals() {
        let bpsys = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP -Systolic");
        let bpdia = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP-Diastolic");
        let temp = this.tableVitals.filter((x: any) => x?.PARAMETER === "Temperature");
        let remarksEntered = true;
        if (bpsys[0].PARAMVALUE === null || bpsys[0].PARAMVALUE === "" || bpdia[0].PARAMVALUE === null || bpdia[0].PARAMVALUE === "" || temp[0].PARAMVALUE === null || temp[0].PARAMVALUE === "") {
            this.showVitalsValidation = true;
        } else {
            const VsDetails: any = [];
            let outOfRangeParameters: string[] = [];
            this.tableVitals.forEach((element: any, index: any) => {
                let RST: any;
                let ISPANIC: any;
                if ((element.PARAMVALUE >= element.ALLOWUOMMINRANGE && element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE && element.PARAMVALUE <= element.ALLOWUOMMAXRANGE))
                    RST = 2;
                else
                    RST = 1;

                if ((!element.PARAMVALUE) && ((element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE)))
                    ISPANIC = 1;
                else
                    ISPANIC = 0;
                const remark = this.recordRemarks.get(index);
                if (element.PARAMVALUE !== null && element.VitalHigh || element.VitalLow) {
                    outOfRangeParameters.push(element.PARAMETER);
                    if (remark === undefined || remark.trim() === "") {
                        this.parameterErrorMessage = `Please enter Remarks for ${element.PARAMETER}`;
                        remarksEntered = false;
                    }
                }
                VsDetails.push({
                    "VSPID": element.PARAMETERID,
                    "VSNAME": element.PARAMETER,
                    "VSGID": element.GROUPID,
                    "VSGDID": element.GroupDETAILID,
                    "PV": element.PARAMVALUE,
                    "CMD": remark,
                    "RST": RST,
                    "ISPANIC": ISPANIC
                });
            });
            if (outOfRangeParameters.length > 0 && !remarksEntered) {
                this.showParamValidationMessage = true;
                this.showVitalsValidation = false;
                return;
            }
            let payload = {
                "MonitorId": "0",
                "PatientID": this.patientData.PatientID,
                "Admissionid": this.patientData.IPID,
                "DoctorID": this.patientData.ConsultantID,
                "HospitalId": this.hospitalID,
                "SpecialiseID": this.patientData.SpecialiseID,
                "PatientType": this.patientData.PatientType,
                "ScheduleID": 0,
                "VSDetails": VsDetails,
                "UserId": this.doctorDetails[0].UserId,
                "BloodOrderID": this.bloodOrderID
            };

            this.appConfig.SaveClinicalVitalsBB(payload).subscribe(response => {
                if (response.Code == 200) {
                    $("#saveVitalsMsg").modal('show');
                    $("#vitalsModal").modal('hide');
                    this.showVitalsValidation = false;
                    outOfRangeParameters.forEach(parameter => {
                        const index = this.tableVitals.findIndex((element: any) => element.PARAMETER === parameter);
                        this.recordRemarks.delete(index);
                    });
                    this.GetVitalsData();
                }

            });
            this.showParamValidationMessage = false;
        }
    }

    GetVitalsData() {
        var vm = new Date();
        vm.setMonth(vm.getMonth() - 1);
        var FromDate = moment(vm).format('DD-MMM-yyyy');
        var ToDate = moment(new Date()).format('DD-MMM-yyyy');
        this.appConfig.FetchIPPatientVitalsRRBB(this.patientData.IPID, this.bloodOrderID, FromDate, ToDate, this.hospitalID)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.tableVitalsList = response.FetchIPPatientVitalsRRDataList;
                    const distinctThings = response.FetchIPPatientVitalsRRDataList.filter(
                        (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.VitalSignDateOnly === thing.VitalSignDateOnly) === i);
                    this.tableVitalsListFiltered = distinctThings;
                }
            },
                (_) => {

                })
    }

    filterFunction(vitals: any, visitid: any) {
        if (this.patientData.PatientType == '2' || this.patientData.PatientType == '4')
            return vitals.filter((buttom: any) => buttom.VitalSignDateOnly == visitid);
        else
            return vitals.filter((buttom: any) => buttom.VisitID == visitid);
    }

    navigatetoBedBoard() {
        this.router.navigate(['/ward']);
    }

    openReactionReport() {
        if (!this.patientData.AdmissionID) {
            this.patientData.AdmissionID = this.patientData.IPID;
        }
        sessionStorage.setItem('selectedView', JSON.stringify(this.patientData));
        this.showReactionReport = true;
        $('#reactionReportModal').modal('show');
        setTimeout(() => {
            if (this.feedbackData.BloodOrderPatientTemplatedetailID) {
                this.reactionForm?.selectedTemplate({
                    PatientTemplatedetailID: this.feedbackData.BloodOrderPatientTemplatedetailID
                });
            }
        });
    }

    onReactionFormClearClick() {
        this.reactionForm?.clear();
    }

    onReactionFormSaveClick() {
        this.reactionForm?.save(this.bloodOrderID);
    }

    onReactionFormSaved() {
        this.reactionFormSaved = true;
        $('#reactionReportModal').modal('hide');
        this.showReactionReport = false;
    }

    closeReactionForm() {
        $('#reactionReportModal').modal('hide');
        this.showReactionReport = false;
    }
}

export const TransfusionFeedback = {
    FetchTransfusionMasters: 'FetchTransfusionMasters?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchCurrentInPatientsBlood: 'FetchCurrentInPatientsBlood?SSN=${SSN}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchcrossmatchDetails: 'FetchcrossmatchDetails?PatientID=${PatientID}&PatientType=${PatientType}&BagNumber=${BagNumber}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveTransfusionfeedBack: 'SaveTransfusionfeedBack',
    FetchTransfusionfeedBackFF: 'FetchTransfusionfeedBackFF?PatientID=${PatientID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchTransfusionfeedBack: 'FetchTransfusionfeedBack?FeedbackId=${FeedbackId}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}