import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { UtilityService } from 'src/app/shared/utility.service';
import moment from 'moment';

declare var $: any;

@Component({
    selector: 'app-care-plan',
    templateUrl: './care-plan.component.html',
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
export class CarePlanComponent extends BaseComponent implements OnInit {
    @Input() 
    data: any;
    readonly: boolean = false;

    IsHome = true;
    IsHeadNurse: any;

    carePlanSearchText: string = '';
    carePlans: any;
    selectedCarePlan: any;
    FetchElsevierNursingDiagnosisCareMasterDetailsData1List: any;
    FetchElsevierNursingDiagnosisCareMasterDetailsData9List: any;
    FetchElsevierNursingDiagnosisCareMasterDetailsData10List: any;
    currentdate = moment(new Date()).format('DD-MMM-YYYY');
    carePlanResponse: any;
    interventionDetails: any;
    goalDetails: any;
    errorMsg: any;
    successMsg: any;
    savedCarePlanResponse: any;
    FetchElsevierCarePlanProgressDataList: any;
    FetchPatientCarePlanDataList: any = [];
    infoDetails: any = [];
    infoDetailsHeader: any;
    showEvaluationSummaryContent: boolean = false;
    evaluationPopupData: any = {};
    evaluationSummaryData: any;
    FetchPatientCarePlanOutcomeofProbelmsViewDataList: any;
    FetchElsevierCarePlanICD10AMDataList: any = [];
    mainData: any;

    constructor(private router: Router, private us: UtilityService) {
        super();
    }

    ngOnInit(): void {
        this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
        const emergencyValue = sessionStorage.getItem("FromEMR");
        if (emergencyValue !== null && emergencyValue !== undefined) {
            this.IsHome = !(emergencyValue === 'true');
        } else {
            this.IsHome = true;
        }
        if (this.data) {
            this.readonly = this.data.readonly;
            this.selectedView = this.data.data;
        }
        this.FetchPatientCarePlan();
        this.FetchElsevierCarePlanProgress();
        this.FetchElsevierCarePlanICD10AM();
        this.FetchElsevierPatientCarePlan(); // To Get Status
    }

    FetchElsevierPatientCarePlan() {
        const url = this.us.getApiUrl(carePlan.FetchElsevierPatientCarePlan, {
            TreatmentPlanID: 0,
            AdmissionID: this.selectedView.IPID || this.selectedView.AdmissionID,
            WorkStationID: this.ward.FacilityID,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.mainData = response;
                }
            });
    }

    FetchElsevierCarePlanICD10AM() {
        const url = this.us.getApiUrl(carePlan.FetchElsevierCarePlanICD10AM, {
            IPID: this.selectedView.IPID || this.selectedView.AdmissionID,
            WardID: this.wardID,
            WorkStationID: this.wardID,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchElsevierCarePlanICD10AMDataList = response.FetchElsevierCarePlanICD10AMDataList;
            }
        });
    }
    FetchPatientCarePlan() {
        const url = this.us.getApiUrl(carePlan.FetchPatientCarePlan, {
            AdmissionID: this.selectedView.IPID || this.selectedView.AdmissionID,
            TreatmentPlanID: '0',
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.wardID,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchPatientCarePlanDataList = response.FetchPatientCarePlanDataList;
                if (this.selectedCarePlan) {
                    const itemFound = this.FetchPatientCarePlanDataList.find((item: any) => {
                        return this.selectedCarePlan.CareGroupID === item.CareGroupID;
                    });
                    this.selectedCarePlan = itemFound;
                }
            }
        });
    }

    FetchElsevierCarePlanProgress() {
        const url = this.us.getApiUrl(carePlan.FetchElsevierCarePlanProgress, {
            WorkStationID: this.wardID,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchElsevierCarePlanProgressDataList = response.FetchElsevierCarePlanProgressDataList;
            }
        });
    }

    SavePatientCarePlanElsevierEvalutionSummary() {
        if (!this.evaluationPopupData.ProgressID) {
            return;
        }
        const payload = {
            "PatEvalutionSummaryID": this.evaluationPopupData.PatEvalutionSummaryID ? this.evaluationPopupData.PatEvalutionSummaryID : "0",
            "AdmissionID": this.selectedView.IPID || this.selectedView.AdmissionID,
            "ProgressID": this.evaluationPopupData.ProgressID,
            "Summary": this.evaluationPopupData.Summary,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.wardID,
            "HospitalID": this.hospitalID
        };

        this.us.post(carePlan.SavePatientCarePlanElsevierEvalutionSummary, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                this.successMsg = 'Evaluation Summary Saved Successfully.'
                $('#evaluation_summaryModal').modal('hide');
                this.showEvaluationSummaryContent = false;
                $("#savemsg").modal('show');
            }
        });
    }

    openEvaluationModal() {
        const url = this.us.getApiUrl(carePlan.FetchPatientCarePlanOutcomeofProbelms, {
            TreatmentPlanID: this.selectedCarePlan.CareGroupID,
            AdmissionID: this.selectedView.IPID || this.selectedView.AdmissionID,
            WorkStationID: this.wardID,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.evaluationSummaryData = response;
                this.evaluationPopupData = {};
                if (this.evaluationSummaryData.FetchPatientCarePlanSummaryDataList.length > 0) {
                    const { ProgressID, Summary, PatEvalutionSummaryID } = this.evaluationSummaryData.FetchPatientCarePlanSummaryDataList[0];
                    this.evaluationPopupData = {
                        ProgressID,
                        Summary,
                        PatEvalutionSummaryID
                    }
                }
                this.showEvaluationSummaryContent = true;
                $('#evaluation_summaryModal').modal('show');
            }
        });
    }

    navigatetoBedBoard() {
        if (this.IsHeadNurse == 'true' && !this.IsHome)
            this.router.navigate(['/emergency/beds']);
        else
            this.router.navigate(['/ward']);
        sessionStorage.setItem("FromEMR", "false");
    }

    clearScreen() {
        this.selectedCarePlan = null;
        this.carePlanSearchText = '';
        this.interventionDetails = null;
        this.goalDetails = null;
        this.carePlanResponse = null;
        this.savedCarePlanResponse = null;
        this.FetchElsevierNursingDiagnosisCareMasterDetailsData10List = null;
        this.FetchElsevierNursingDiagnosisCareMasterDetailsData1List = null;
        this.FetchElsevierNursingDiagnosisCareMasterDetailsData9List = null;
    }

    searchCarePlan(event: any) {
        if (event.target.value.length > 2) {
            const url = this.us.getApiUrl(carePlan.SSMappedcarePlanElsevierMasters, {
                Filter: event.target.value,
                WorkStationID: this.ward.FacilityID,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.carePlans = response.SSMappedcarePlanElsevierMastersDataList;
                    }
                },
                    (err) => {
                    })
        }
    }

    onCarePlanSelectedFromSearch(item: any) {
        if (this.FetchPatientCarePlanDataList.length === 1) {
            if (this.selectedCarePlan && !this.selectedCarePlan.PatientCareGroupID) {
                this.carePlanSearchText = '';
                this.errorMsg = 'Please save current Care Plan details before adding new one';
                $('#errorMsg').modal('show');
                return;
            }
        }
        const alreadyExists = this.FetchPatientCarePlanDataList.find((a: any) => {
            return a.CareGroupID === item.CarePlanID;
        });
        if (!alreadyExists) {
            this.FetchPatientCarePlanDataList.push({
                AssignDate: moment(new Date()).format('DD-MMM-YYYY'),
                CareGroupID: item.CarePlanID,
                CareGroupName: item.CarePlanName,
                PatientCareGroupID: 0
            });
            this.onCarePlanSelected(this.FetchPatientCarePlanDataList[this.FetchPatientCarePlanDataList.length - 1]);
        } else {
            this.onCarePlanSelected(alreadyExists);
        }
    }

    onDclick(item: any) {
        this.onCarePlanSelected(item);
    }

    onCarePlanSelected(item: any) {
        this.selectedCarePlan = item;
        this.carePlans = [];
        this.interventionDetails = null;
        this.goalDetails = null;
        this.FetchElsevierNursingDiagnosisCareMasterDetailsData1List = null;
        this.FetchElsevierNursingDiagnosisCareMasterDetailsData9List = null;
        this.FetchElsevierNursingDiagnosisCareMasterDetailsData10List = null;
        this.carePlanResponse = null;
        this.savedCarePlanResponse = null;
        this.getCarePlanDetails();
    }

    getSavedCarePlanDetails() {
        const url = this.us.getApiUrl(carePlan.FetchElsevierPatientCarePlan, {
            TreatmentPlanID: this.selectedCarePlan.CareGroupID,
            AdmissionID: this.selectedView.IPID || this.selectedView.AdmissionID,
            WorkStationID: this.ward.FacilityID,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200 && response.FetchElsevierPatientCarePlanData1List.length > 0) {
                    this.savedCarePlanResponse = response;
                    this.onPotentailProblemIClick(this.FetchElsevierNursingDiagnosisCareMasterDetailsData1List[0]);
                }
            });
    }

    getCarePlanDetails() {
        const url = this.us.getApiUrl(carePlan.FetchElsevierNursingDiagnosisCareMasterDetails, {
            TreatmentPlanID: this.selectedCarePlan.CareGroupID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.ward.FacilityID,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.carePlanResponse = response;
                    this.FetchElsevierNursingDiagnosisCareMasterDetailsData1List = response.FetchElsevierNursingDiagnosisCareMasterDetailsData1List;
                    this.FetchElsevierNursingDiagnosisCareMasterDetailsData9List = response.FetchElsevierNursingDiagnosisCareMasterDetailsData9List;
                    this.FetchElsevierNursingDiagnosisCareMasterDetailsData10List = response.FetchElsevierNursingDiagnosisCareMasterDetailsData10List.filter((item: any) => {
                        return item.PatientEducationID === this.FetchElsevierNursingDiagnosisCareMasterDetailsData9List[0].PatientEducationID;
                    });
                    this.FetchElsevierNursingDiagnosisCareMasterDetailsData10List.forEach((item: any) => {
                        const filteredItems = response.FetchElsevierNursingDiagnosisCareMasterDetailsData11List.filter((a: any) => a.PatientEduObsID == item.PatientEduObsID);
                        if (filteredItems && filteredItems[0]) {
                            const dropdownItems = response.FetchElsevierNursingDiagnosisCareMasterDetailsData12List.filter((b: any) => b.PatientEduObsListID == filteredItems[0].PatientEduObsListID);
                            filteredItems[0].dropdownItems = dropdownItems;
                        }
                        if (filteredItems && filteredItems[1]) {
                            const dropdownItems = response.FetchElsevierNursingDiagnosisCareMasterDetailsData12List.filter((b: any) => b.PatientEduObsListID == filteredItems[1].PatientEduObsListID);
                            filteredItems[1].dropdownItems = dropdownItems;
                        }
                        item.firstColumn = filteredItems && filteredItems[0];
                        item.secondColumn = filteredItems && filteredItems[1];
                    });
                    
                    this.getSavedCarePlanDetails();
                }
            },
                (err) => {
                })
    }

    onPotentialProblemCPGClick(item: any) {
        window.open(item.EVIDENCEURL, '_blank')
    }

    onPotentailProblemIClick(selectedItem: any) {
        this.interventionDetails = null;
        this.goalDetails = null;
        const { NursingDiagnosisID } = selectedItem;
        let interventionDetails = this.carePlanResponse.FetchElsevierNursingDiagnosisCareMasterDetailsData5List.filter((a: any) => {
            return a.NursingDiagnosisID == NursingDiagnosisID;
        });
        interventionDetails.forEach((b: any) => {
            const subChilds = this.carePlanResponse.FetchElsevierNursingDiagnosisCareMasterDetailsData6List.filter((c: any) => {
                return (c.NursingInterventionID === b.NursingInterventionID) && (c.NursingDiagnosisID === b.NursingDiagnosisID)
            });
            subChilds.forEach((d: any) => {
                const dropdownItems = this.carePlanResponse.FetchElsevierNursingDiagnosisCareMasterDetailsData8List.filter((e: any) => {
                    return e.NursingInterventionDetailID === d.NursingInterventionDetailID;
                });
                d.dropdownItems = dropdownItems;
            })
            b.children = subChilds;
        });
        if (this.savedCarePlanResponse?.FetchElsevierPatientCarePlanData4List.length > 0) {
            interventionDetails.forEach((x: any) => {
                x.children.forEach((y: any) => {
                    const dataFound = this.savedCarePlanResponse?.FetchElsevierPatientCarePlanData4List.filter((z: any) => z.ParentInterventionID === y.NursingInterventionID);
                    if (dataFound.length > 0) {
                        let selectedItems: any = [];
                        dataFound.forEach((i: any) => {
                            const item = y.dropdownItems.find((j: any) => j.NursingInterventionListItemID === i.NursingInterventionListItemID);
                            if (item) {
                                selectedItems.push(item);
                            }
                        });
                        y.selectedItems = selectedItems;
                    }
                });
            });
        }
        this.interventionDetails = interventionDetails;

        const ExpectedOutcome = this.carePlanResponse.FetchElsevierNursingDiagnosisCareMasterDetailsData2List.find((a: any) => a.NursingDiagnosisID === selectedItem.NursingDiagnosisID)?.GoalsName;
        let ActualOutcome = this.carePlanResponse.FetchElsevierNursingDiagnosisCareMasterDetailsData3List.find((a: any) => a.NursingDiagnosisID === selectedItem.NursingDiagnosisID)?.GoalsObservations;
        const OutcomeStatus = this.carePlanResponse.FetchElsevierNursingDiagnosisCareMasterDetailsData4List.filter((a: any) => a.NursingDiagnosisID === selectedItem.NursingDiagnosisID);
        let selectedGoal: any = null;
        if (this.savedCarePlanResponse?.FetchElsevierPatientCarePlanData6List.length > 0) {
            OutcomeStatus.forEach((a: any) => {
                const goalItem = this.savedCarePlanResponse?.FetchElsevierPatientCarePlanData6List.find((b: any) => b.GoalListItemID === a.GoalListItemID);
                if (goalItem) {
                    selectedGoal = a.GoalListItemID;
                }
            });
        }
        if (this.savedCarePlanResponse?.FetchElsevierPatientCarePlanData5List.length > 0) {
            const item = this.savedCarePlanResponse?.FetchElsevierPatientCarePlanData5List.find((b: any) => b.NursingDiagnosisID === NursingDiagnosisID);
            if (item) {
                ActualOutcome = item.ExpectedOutput;
            }
        }
        setTimeout(() => {
            this.goalDetails = {
                ExpectedOutcome,
                ActualOutcome,
                OutcomeStatus,
                selectedGoal
            }
        });
        if (this.savedCarePlanResponse?.FetchElsevierPatientCarePlanData7List.length > 0) {
            this.FetchElsevierNursingDiagnosisCareMasterDetailsData10List.forEach((x: any) => {
                if (x.firstColumn) {
                    x.firstColumn.selectedItem = null;
                    const itemFound = this.savedCarePlanResponse?.FetchElsevierPatientCarePlanData7List.find((y: any) => {
                        return y.PatientEduObsListID === x.firstColumn.PatientEduObsListID;
                    });
                    if (itemFound) {
                        const subItemFound = this.savedCarePlanResponse?.FetchElsevierPatientCarePlanData8List.find((y: any) => {
                            return y.PatEducationTransID === itemFound.PatEducationTransID;
                        });
                        if (subItemFound) {
                            x.firstColumn.selectedItem = subItemFound.PatientEduObsListItemID;
                        }
                    }
                }
                if (x.secondColumn) {
                    x.secondColumn.selectedItem = null;
                    const itemFound = this.savedCarePlanResponse?.FetchElsevierPatientCarePlanData7List.find((y: any) => {
                        return y.PatientEduObsListID === x.secondColumn.PatientEduObsListID;
                    });
                    if (itemFound) {
                        const subItemFound = this.savedCarePlanResponse?.FetchElsevierPatientCarePlanData8List.find((y: any) => {
                            return y.PatEducationTransID === itemFound.PatEducationTransID;
                        });
                        if (subItemFound) {
                            x.secondColumn.selectedItem = subItemFound.PatientEduObsListItemID;
                        }
                    }
                }
            });
        }
    }

    getPatientCareGroupPlanID() {
        if (this.savedCarePlanResponse?.FetchElsevierPatientCarePlanData4List.length > 0 && this.interventionDetails) {
            const item = this.savedCarePlanResponse.FetchElsevierPatientCarePlanData4List.find((a: any) => {
                return (a.NursingDiagnosisID === this.interventionDetails[0].NursingDiagnosisID) && (a.PatientCareGroupID === this.selectedCarePlan.PatientCareGroupID);
            });
            if (item) {
                return item.PatientCareGroupPlanID;
            }
        }
        return 0;
    }

    compareFn(a: any, b: any) {
        return a && b ? a.NursingInterventionListItemID === b.NursingInterventionListItemID : a === b;
    }

    saveInterventionsClick() {
        if (!this.interventionDetails) {
            this.errorMsg = "Please select Potential Problem";
            $("#errorMsg").modal('show');
            return;
        }
        const NursingDiagnosisXML = [{
            "NDID": this.interventionDetails[0].NursingDiagnosisID,
            "EOC": "",
            "BLK": "0",
            "PDSEQ": "0"
        }];
        let NursingInterventionsXML: any = [];
        this.interventionDetails.forEach((item: any) => {
            item.children.forEach((subItem: any) => {
                if (subItem.selectedItems && subItem.selectedItems.length > 0) {
                    subItem.selectedItems.forEach((value: any) => {
                        NursingInterventionsXML.push({
                            "NDID": this.interventionDetails[0].NursingDiagnosisID,
                            "PCGPID": "",
                            "INTERVENID": value.NursingInterventionDetailID,
                            "INTERVENITEMID": value.NursingInterventionListItemID
                        });
                    });
                }
            });
        });
        if (NursingInterventionsXML.length === 0) {
            this.errorMsg = "Please select Intervention Details";
            $("#errorMsg").modal('show');
            return;
        }
        const PatientCareGroupPlanID = this.getPatientCareGroupPlanID();
        const params = {
            PatientCareGroupID: this.selectedCarePlan.PatientCareGroupID,
            PatientCareGroupPlanID,
            "TreatmentPlanID": this.interventionDetails[0].TreatmentPlanID,
            "AdmissionID": this.selectedView.IPID || this.selectedView.AdmissionID,
            "HospitalID": this.hospitalID,
            "BLK": "0",
            "CType": "1",
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.wardID,
            NursingDiagnosisXML,
            NursingInterventionsXML,
            "GoalsXML": [],
            "EducationXML": []
        };
        this.us.post(carePlan.SaveElsevierPatientCarePlan, params).subscribe((response: any) => {
            if (response.Code === 200) {
                this.getSavedCarePlanDetails();
                this.FetchPatientCarePlan();
                this.successMsg = "Interventions Saved Successfully."
                $("#savemsg").modal('show');
            }
        });
    }

    saveGoalsClick() {
        const NursingDiagnosisXML = [{
            "NDID": this.interventionDetails[0].NursingDiagnosisID,
            "EOC": "",
            "BLK": "0",
            "PDSEQ": "0"
        }];
        let GoalsXML: any = [];
        if (this.goalDetails.selectedGoal) {
            const selectedGoal = this.goalDetails.OutcomeStatus.find((item: any) => item.GoalListItemID === this.goalDetails.selectedGoal);
            if (selectedGoal) {
                GoalsXML.push({
                    "NDID": this.interventionDetails[0].NursingDiagnosisID,
                    "GOALID": selectedGoal.GoalId,
                    "EXPOUT": this.goalDetails.ActualOutcome,
                    "GOALITEMID": selectedGoal.GoalListItemID
                });
            }
        }

        if (GoalsXML.length === 0) {
            this.errorMsg = "Please select Goal";
            $("#errorMsg").modal('show');
            return;
        }
        const PatientCareGroupPlanID = this.getPatientCareGroupPlanID();
        const params = {
            PatientCareGroupID: this.selectedCarePlan.PatientCareGroupID,
            PatientCareGroupPlanID,
            "TreatmentPlanID": this.interventionDetails[0].TreatmentPlanID,
            "AdmissionID": this.selectedView.IPID || this.selectedView.AdmissionID,
            "HospitalID": this.hospitalID,
            "BLK": "0",
            "CType": "2",
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.wardID,
            NursingDiagnosisXML,
            "NursingInterventionsXML": [],
            GoalsXML,
            "EducationXML": []
        };
        this.us.post(carePlan.SaveElsevierPatientCarePlan, params).subscribe((response: any) => {
            if (response.Code === 200) {
                this.getSavedCarePlanDetails();
                this.FetchElsevierPatientCarePlan(); // TO UPDATE STATUS
                this.successMsg = "Goals Saved Successfully."
                $("#savemsg").modal('show');
            }
        });
    }

    savePatientEducation() {
        const NursingDiagnosisXML = [{
            "NDID": this.interventionDetails[0].NursingDiagnosisID,
            "EOC": "",
            "BLK": "0",
            "PDSEQ": "0"
        }];
        let EducationXML: any = [];
        this.FetchElsevierNursingDiagnosisCareMasterDetailsData10List.forEach((item: any) => {
            if (item.firstColumn.selectedItem) {
                const selectedItem = item.firstColumn.dropdownItems.find((a: any) => a.PatientEduObsListItemID === item.firstColumn.selectedItem);
                if (selectedItem) {
                    EducationXML.push({
                        "EDID": selectedItem.PatientEducationID,
                        "EDOBSID": selectedItem.PatientEduObsID,
                        "EDUOBSLISTID": selectedItem.PatientEduObsListID,
                        "EDUOBSLISTITEMID": selectedItem.PatientEduObsListItemID
                    });
                }
            }
            if (item.secondColumn.selectedItem) {
                const selectedItem = item.secondColumn.dropdownItems.find((a: any) => a.PatientEduObsListItemID === item.secondColumn.selectedItem);
                if (selectedItem) {
                    EducationXML.push({
                        "EDID": selectedItem.PatientEducationID,
                        "EDOBSID": selectedItem.PatientEduObsID,
                        "EDUOBSLISTID": selectedItem.PatientEduObsListID,
                        "EDUOBSLISTITEMID": selectedItem.PatientEduObsListItemID
                    });
                }
            }
        });

        if (EducationXML.length === 0) {
            this.errorMsg = "Please select Patient Education Details";
            $("#errorMsg").modal('show');
            return;
        }
        const PatientCareGroupPlanID = this.getPatientCareGroupPlanID();
        const params = {
            PatientCareGroupID: this.selectedCarePlan.PatientCareGroupID,
            PatientCareGroupPlanID,
            "TreatmentPlanID": this.interventionDetails[0].TreatmentPlanID,
            "AdmissionID": this.selectedView.IPID || this.selectedView.AdmissionID,
            "HospitalID": this.hospitalID,
            "BLK": "0",
            "CType": "3",
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.wardID,
            NursingDiagnosisXML,
            "NursingInterventionsXML": [],
            "GoalsXML": [],
            EducationXML
        };
        this.us.post(carePlan.SaveElsevierPatientCarePlan, params).subscribe((response: any) => {
            if (response.Code === 200) {
                this.getSavedCarePlanDetails();
                this.successMsg = "Patient Education Saved Successfully."
                $("#savemsg").modal('show');
            }
        });
    }

    onPatientEducationInfoClick(item: any) {
        if (item.secondColumn.selectedItem) {
            const selectedItem = item.secondColumn.dropdownItems.find((a: any) => a.PatientEduObsListItemID === item.secondColumn.selectedItem);
            this.infoDetails = this.carePlanResponse.FetchElsevierNursingDiagnosisCareMasterDetailsData13List.filter((a: any) => {
                return selectedItem.PatientEduObsListItemID === a.PatientEduObsListItemID;
            }).map((a: any) => a.Guidance);
            this.infoDetailsHeader = item.secondColumn.HeaderName;
            $("#infopopup").modal('show');
        }
    }

    onInterventionInfoClick(item: any) {
        this.infoDetails = this.carePlanResponse.FetchElsevierNursingDiagnosisCareMasterDetailsData7List.filter((a: any) => {
            return item.NursingInterventionID === a.NursingInterventionID;
        }).map((a: any) => a.Gudiances);
        this.infoDetailsHeader = item.NursingIntervention;
        $("#infopopup").modal('show');
    }

    onViewInterventionsClick() {
        const url = this.us.getApiUrl(carePlan.FetchPatientCarePlanOutcomeofProbelmsView, {
            TreatmentPlanID: this.selectedCarePlan.CareGroupID,
            AdmissionID: this.selectedView.IPID || this.selectedView.AdmissionID,
            WorkStationID: this.wardID,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200 && response.FetchPatientCarePlanOutcomeofProbelmsViewDataList.length > 0) {
                this.FetchPatientCarePlanOutcomeofProbelmsViewDataList = response.FetchPatientCarePlanOutcomeofProbelmsViewDataList;
                $('#view_interventions_modal').modal('show');
            }
        });
    }

    getCareplanStatus(item: any) {
        if (this.mainData?.FetchElsevierPatientCarePlanData5List?.length > 0) {
            const find = this.mainData?.FetchElsevierPatientCarePlanData5List.find((a: any) => a.TreatmentPlanID === item.CareGroupID);
            if (find) {
                return true;
            }
        }
        return false;
    }
}

export const carePlan = {
    SSMappedcarePlanElsevierMasters: 'SSMappedcarePlanElsevierMasters?Filter=${Filter}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchElsevierNursingDiagnosisCareMasterDetails: 'FetchElsevierNursingDiagnosisCareMasterDetails?TreatmentPlanID=${TreatmentPlanID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveElsevierPatientCarePlan: 'SaveElsevierPatientCarePlan',
    FetchElsevierPatientCarePlan: 'FetchElsevierPatientCarePlan?TreatmentPlanID=${TreatmentPlanID}&AdmissionID=${AdmissionID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientCarePlan: 'FetchPatientCarePlan?AdmissionID=${AdmissionID}&TreatmentPlanID=${TreatmentPlanID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchElsevierCarePlanProgress: 'FetchElsevierCarePlanProgress?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SavePatientCarePlanElsevierEvalutionSummary: 'SavePatientCarePlanElsevierEvalutionSummary',
    FetchPatientCarePlanOutcomeofProbelms: 'FetchPatientCarePlanOutcomeofProbelms?TreatmentPlanID=${TreatmentPlanID}&AdmissionID=${AdmissionID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchElsevierCarePlanICD10AM: 'FetchElsevierCarePlanICD10AM?IPID=${IPID}&WardID=${WardID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientCarePlanOutcomeofProbelmsView: 'FetchPatientCarePlanOutcomeofProbelmsView?TreatmentPlanID=${TreatmentPlanID}&AdmissionID=${AdmissionID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
}