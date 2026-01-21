import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { cloneDeep } from "lodash";
import { BaseComponent } from "src/app/shared/base.component";
import { UtilityService } from "src/app/shared/utility.service";
import { Router } from '@angular/router';
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
    selector: 'app-hospital-events',
    templateUrl: './hospital-events.component.html',
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
export class HospitalEventsComponent extends BaseComponent implements OnInit {
    activeTab = 'Pressure_Ulcer'

    midlineData: any;
    rightSideData: any;
    leftSideData: any;
    gradeData: any;

    fallTypeData: any;
    injuriesData: any;

    vteTypeData: any;
    confirmedByData: any;

    pressureUlcerCollection: any = [];
    defaultUlcerData: any;

    fallCollection: any = [];
    defaultFallData: any;

    vteCollection: any = [];
    defaultVteData: any;

    errorMsg: any = '';
    patinfo: any;

    adrCollection: any = [];
    defaultADRData: any;
    adrTypeData: any;

    bloodProductCollection: any = [];
    bloodReactionTypeData: any;
    defaultBloodData: any;

    haiCollection: any = [];
    defaultHAIData: any;
    haiTypeData: any;

    foodPoisoningCollection: any = [];
    defaultFoodPoisoningData: any;

    isPressureUlcerEmpty: boolean = true;
    isFallEmpty: boolean = true;
    isVteEmpty: boolean = true;
    isAdrEmpty: boolean = true;
    isBloodEmpty: boolean = true;
    isHaiEmpty: boolean = true;
    isFoodPoisoningEmpty: boolean = true;

    constructor(private us: UtilityService, private datepipe: DatePipe, private router: Router, private config: BedConfig,) {
        super();
    }

    ngOnInit(): void {
        this.getMastersData();
    }

    getMastersData() {
        const url = this.us.getApiUrl(HospitalEvents.FetchHospitalAcquiredEventMaster, {
            WorkStationID: this.wardID,
            HospitalID: this.hospitalID
        });

        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.midlineData = response.FetchHospitalAcquiredEventMasterUlcer1List;
                this.rightSideData = response.FetchHospitalAcquiredEventMasterUlcer2List;
                this.leftSideData = response.FetchHospitalAcquiredEventMasterUlcer3List;
                this.gradeData = response.FetchHospitalAcquiredEventMasterUlcer4List;

                this.fallTypeData = response.FetchHospitalAcquiredEventMasterFalls1List;
                this.injuriesData = response.FetchHospitalAcquiredEventMasterFalls2List;

                this.vteTypeData = response.FetchHospitalAcquiredEventMasterVTE1List;
                this.confirmedByData = response.FetchHospitalAcquiredEventMasterVTE2List;

                this.adrTypeData = response.FetchHospitalAcquiredEventMasterADR1List;

                this.bloodReactionTypeData = response.FetchHospitalAcquiredEventMasterBlood1List;

                this.haiTypeData = response.FetchHospitalAcquiredEventMasterHAI1List;

                this.prepareDefaultData();
                this.fetchData();
            }
        });
    }

    prepareDefaultData() {
        this.defaultUlcerData = {
            HAEPUID: "",
            DOE: new Date(),
            MID: [],
            URIGHT: [],
            ULEFT: [],
            GRADE: [],
            CLAREA: `${this.selectedView.Ward}/${this.selectedView.Room}`,
            RMK: "",
            editable: true,
            midlineData: cloneDeep(this.midlineData),
            rightSideData: cloneDeep(this.rightSideData),
            leftSideData: cloneDeep(this.leftSideData),
            gradeData: cloneDeep(this.gradeData)
        };

        this.defaultFallData = {
            HAEFALLID: '',
            DOE: new Date(),
            FTYPE: [],
            FTYPE_OTHER_ID: '',
            FTYPE_OTHER_TEXT: '',
            INJSUST: this.injuriesData[0]?.HospitalAcquiredEventID || '',
            INJSPEC: '',
            CLAREA: `${this.selectedView.Ward}/${this.selectedView.Room}`,
            RMK: '',
            editable: true,
            fallTypeData: cloneDeep(this.fallTypeData)
        };

        this.defaultVteData = {
            HAEVTEID: '',
            DOE: new Date(),
            VTETYPE: [],
            CONFIRMEDBY: [],
            CONFIRMEDBY_OTHER_TEXT: '',
            CONFIRMEDBY_OTHER_ID: '',
            CLAREA: `${this.selectedView.Ward}/${this.selectedView.Room}`,
            RMK: '',
            editable: true,
            vteTypeData: cloneDeep(this.vteTypeData),
            confirmedByData: cloneDeep(this.confirmedByData)
        };

        this.defaultADRData = {
            HAEADRID: '',
            DOE: new Date(),
            SITEOFADR: [],
            SITEOFADR_OTHER_TEXT: '',
            SITEOFADR_OTHER_ID: '',
            SUSPECTEDDRUGS: [],
            CLAREA: `${this.selectedView.Ward}/${this.selectedView.Room}`,
            RMK: '',
            editable: true,
            adrTypeData: cloneDeep(this.adrTypeData)
        };

        this.defaultBloodData = {
            HAEBloodID: '',
            DOE: new Date(),
            TYPEOFREACTION: [],
            TYPEOFREACTION_OTHER_ID: '',
            TYPEOFREACTION_OTHER_TEXT: '',
            UNITNUMBER: '',
            CLAREA: `${this.selectedView.Ward}/${this.selectedView.Room}`,
            RMK: '',
            editable: true,
            bloodReactionTypeData: cloneDeep(this.bloodReactionTypeData)
        };

        this.defaultHAIData = {
            HAEHAIID: '',
            DOE: new Date(),
            TYPEOFHAI: [],
            TYPEOFHAI_OTHER_ID: '',
            TYPEOFHAI_OTHER_TEXT: '',
            CLAREA: `${this.selectedView.Ward}/${this.selectedView.Room}`,
            RMK: "",
            editable: true,
            haiTypeData: cloneDeep(this.haiTypeData)
        };

        this.defaultFoodPoisoningData = {
            HAEFOODPOISONINGID: '',
            DOE: new Date(),
            TYPE: '',
            CLAREA: `${this.selectedView.Ward}/${this.selectedView.Room}`,
            RMK: '',
            editable: true,
        }
    }

    fetchData() {
        this.pressureUlcerCollection = [];
        this.fallCollection = [];
        this.vteCollection = [];
        this.adrCollection = [];
        this.bloodProductCollection = [];
        this.haiCollection = [];
        this.foodPoisoningCollection = [];
        const url = this.us.getApiUrl(HospitalEvents.FetchPatientHospitalAcquiredEvents, {
            AdmissionID: this.selectedView.AdmissionID,
            WorkStationID: this.wardID,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.isPressureUlcerEmpty = response.FetchHospitalAcquiredEventUlcerMList.length > 0 ? false : true;
                this.isFallEmpty = response.FetchHospitalAcquiredEventFallsMList.length > 0 ? false : true;
                this.isVteEmpty = response.FetchHospitalAcquiredEventVTEMList.length > 0 ? false : true;
                this.isAdrEmpty = response.FetchHospitalAcquiredEventADRMList.length > 0 ? false : true;
                this.isBloodEmpty = response.FetchHospitalAcquiredEventBloodMList.length > 0 ? false : true;
                this.isHaiEmpty = response.FetchHospitalAcquiredEventHAIMList.length > 0 ? false : true;
                this.isFoodPoisoningEmpty = response.FetchHospitalAcquiredEventFoodPoisoningMList.length > 0 ? false : true;

                this.preparePressureUlcerData(response.FetchHospitalAcquiredEventUlcerMList);
                this.prepareFallsData(response.FetchHospitalAcquiredEventFallsMList);
                this.prepareVteData(response.FetchHospitalAcquiredEventVTEMList);
                this.prepareADRData(response.FetchHospitalAcquiredEventADRMList);
                this.prepareBloodData(response.FetchHospitalAcquiredEventBloodMList);
                this.prepareHAIData(response.FetchHospitalAcquiredEventHAIMList);
                this.prepareFoodPoisoningData(response.FetchHospitalAcquiredEventFoodPoisoningMList);
            }
        });
    }

    preparePressureUlcerData(data: any) {
        this.pressureUlcerCollection = [];
        if (data.length > 0) {
            data.forEach((element: any) => {
                // Mid Line
                const midlineSplitArray = element.UlcerLocationMidLine.split(',');
                const midlineData = cloneDeep(this.midlineData);
                let midlineSelectedItems: any = [];
                midlineData.forEach((option: any) => {
                    if (midlineSplitArray.includes(option.HospitalAcquiredEventID)) {
                        option.selected = true;
                        midlineSelectedItems.push(option);
                    }
                });

                // Ulcer Right
                const urightSplitArray = element.UlcerLocationRightSide.split(',');
                const rightSideData = cloneDeep(this.rightSideData);
                let urightSelectedItems: any = [];
                rightSideData.forEach((option: any) => {
                    if (urightSplitArray.includes(option.HospitalAcquiredEventID)) {
                        option.selected = true;
                        urightSelectedItems.push(option);
                    }
                });

                // Ulcer Left
                const uleftSplitArray = element.UlcerLocationLeftSide.split(',');
                const leftSideData = cloneDeep(this.leftSideData);
                let uleftSelectedItems: any = [];
                leftSideData.forEach((option: any) => {
                    if (uleftSplitArray.includes(option.HospitalAcquiredEventID)) {
                        option.selected = true;
                        uleftSelectedItems.push(option);
                    }
                });

                // Grade
                const gradeSplitArray = element.Grade.split(',');
                const gradeData = cloneDeep(this.gradeData);
                let gradeSelectedItems: any = [];
                gradeData.forEach((option: any) => {
                    if (gradeSplitArray.includes(option.HospitalAcquiredEventID)) {
                        option.selected = true;
                        gradeSelectedItems.push(option);
                    }
                });

                this.pressureUlcerCollection.push({
                    HAEPUID: element.HAEPressureUlcerID,
                    DOE: new Date(element.DateOfEvent),
                    MID: midlineSelectedItems,
                    URIGHT: urightSelectedItems,
                    ULEFT: uleftSelectedItems,
                    GRADE: gradeSelectedItems,
                    CLAREA: element.Clinicalarea,
                    RMK: element.Remarks,
                    Moddate: element.Moddate,
                    UID: element.UserID,
                    SavedEmpNo: element.SavedEmpNo,
                    SavedEmpFullName: element.SavedEmpFullName,
                    SavedEmpDesignation: element.SavedEmpDesignation,
                    midlineData,
                    rightSideData,
                    leftSideData,
                    gradeData,
                    editable: false
                });
            });
        }
    }

    prepareFallsData(data: any) {
        this.fallCollection = [];
        if (data.length > 0) {
            data.forEach((element: any) => {
                const fallData = this.prepareWithOtherData(element.FallType);

                // Fall Type
                const fallTypeData = cloneDeep(this.fallTypeData);
                let fallTypeSelectedItems: any = [];
                fallTypeData.forEach((option: any) => {
                    if (fallData.values.includes(option.HospitalAcquiredEventID)) {
                        option.selected = true;
                        fallTypeSelectedItems.push(option);
                    }
                });

                this.fallCollection.push({
                    HAEFALLID: element.HAEFallsID,
                    DOE: new Date(element.DateOfEvent),
                    FTYPE: fallTypeSelectedItems,
                    FTYPE_OTHER_ID: fallData.otherId,
                    FTYPE_OTHER_TEXT: fallData.otherText,
                    INJSUST: element.InjuriesSustained,
                    INJSPEC: element.InjurySpecification,
                    CLAREA: element.ClinicalArea,
                    RMK: element.Remarks,
                    Moddate: element.Moddate,
                     UID: element.UserID,
                    SavedEmpNo: element.SavedEmpNo,
                    SavedEmpFullName: element.SavedEmpFullName,
                    SavedEmpDesignation: element.SavedEmpDesignation,
                    fallTypeData,
                    editable: false
                });
            });
        }
    }

    prepareVteData(data: any) {
        this.vteCollection = [];
        if (data.length > 0) {
            data.forEach((element: any) => {
                // VTE Type
                const VTETypeSplitArray = element.VTEType.split(',');
                const vteTypeData = cloneDeep(this.vteTypeData);
                let VTETypeSelectedItems: any = [];
                vteTypeData.forEach((option: any) => {
                    if (VTETypeSplitArray.includes(option.HospitalAcquiredEventID)) {
                        option.selected = true;
                        VTETypeSelectedItems.push(option);
                    }
                });
                //Confirmed BY
                const confirmedData = this.prepareWithOtherData(element.ConfirmedBy);
                const confirmedByData = cloneDeep(this.confirmedByData);
                let confirmedBySelectedItems: any = [];
                confirmedByData.forEach((option: any) => {
                    if (confirmedData.values.includes(option.HospitalAcquiredEventID)) {
                        option.selected = true;
                        confirmedBySelectedItems.push(option);
                    }
                });
                this.vteCollection.push({
                    HAEVTEID: element.HAEVTEID,
                    DOE: new Date(element.DateOfEvent),
                    VTETYPE: VTETypeSelectedItems,
                    CONFIRMEDBY: confirmedBySelectedItems,
                    CONFIRMEDBY_OTHER_ID: confirmedData.otherId,
                    CONFIRMEDBY_OTHER_TEXT: confirmedData.otherText,
                    CLAREA: element.ClinicalArea,
                    RMK: element.Remarks,
                    Moddate: element.Moddate,
                     UID: element.UserID,
                    SavedEmpNo: element.SavedEmpNo,
                    SavedEmpFullName: element.SavedEmpFullName,
                    SavedEmpDesignation: element.SavedEmpDesignation,
                    vteTypeData,
                    confirmedByData,
                    editable: false
                });
            });
        }
    }

    prepareADRData(data: any) {
        this.adrCollection = [];
        if (data.length > 0) {
            data.forEach((element: any) => {
                const adrData = this.prepareWithOtherData(element.SiteOfADR);
                const adrTypeData = cloneDeep(this.adrTypeData);
                let adrTypeSelectedItems: any = [];
                adrTypeData.forEach((option: any) => {
                    if (adrData.values.includes(option.HospitalAcquiredEventID)) {
                        option.selected = true;
                        adrTypeSelectedItems.push(option);
                    }
                });
                this.adrCollection.push({
                    HAEADRID: element.HAEADRID,
                    DOE: new Date(element.DateOfEvent),
                    SITEOFADR: adrTypeSelectedItems,
                    SITEOFADR_OTHER_ID: adrData.otherId,
                    SITEOFADR_OTHER_TEXT: adrData.otherText,
                    SUSPECTEDDRUGS: element.SuspectedDrugs,
                    CLAREA: element.ClinicalArea,
                    RMK: element.Remarks,
                    Moddate: element.Moddate,
                     UID: element.UserID,
                    SavedEmpNo: element.SavedEmpNo,
                    SavedEmpFullName: element.SavedEmpFullName,
                    SavedEmpDesignation: element.SavedEmpDesignation,
                    adrTypeData,
                    editable: false
                });
            });
        }
    }

    prepareBloodData(data: any) {
        this.bloodProductCollection = [];
        if (data.length > 0) {
            data.forEach((element: any) => {
                const bloodData = this.prepareWithOtherData(element.TypeOfReaction);
                const bloodReactionTypeData = cloneDeep(this.bloodReactionTypeData);
                let bloodReactionTypeSelectedItems: any = [];
                bloodReactionTypeData.forEach((option: any) => {
                    if (bloodData.values.includes(option.HospitalAcquiredEventID)) {
                        option.selected = true;
                        bloodReactionTypeSelectedItems.push(option);
                    }
                });
                this.bloodProductCollection.push({
                    HAEBloodID: element.HAEBloodID,
                    DOE: new Date(element.DateOfEvent),
                    TYPEOFREACTION: bloodReactionTypeSelectedItems,
                    TYPEOFREACTION_OTHER_ID: bloodData.otherId,
                    TYPEOFREACTION_OTHER_TEXT: bloodData.otherText,
                    UNITNUMBER: element.UnitNumber,
                    CLAREA: element.ClinicalArea,
                    RMK: element.Remarks,
                    Moddate: element.Moddate,
                     UID: element.UserID,
                    SavedEmpNo: element.SavedEmpNo,
                    SavedEmpFullName: element.SavedEmpFullName,
                    SavedEmpDesignation: element.SavedEmpDesignation,
                    bloodReactionTypeData,
                    editable: false
                });
            });
        }
    }


    prepareHAIData(data: any) {
        this.haiCollection = [];
        if (data.length > 0) {
            data.forEach((element: any) => {
                const haiData = this.prepareWithOtherData(element.TypeOfHAI);
                const haiTypeData = cloneDeep(this.haiTypeData);
                let haiTypeSelectedItems: any = [];
                haiTypeData.forEach((option: any) => {
                    if (haiData.values.includes(option.HospitalAcquiredEventID)) {
                        option.selected = true;
                        haiTypeSelectedItems.push(option);
                    }
                });
                this.haiCollection.push({
                    HAEHAIID: element.HAEHAIID,
                    DOE: new Date(element.DateOfEvent),
                    TYPEOFHAI: haiTypeSelectedItems,
                    TYPEOFHAI_OTHER_ID: haiData.otherId,
                    TYPEOFHAI_OTHER_TEXT: haiData.otherText,
                    CLAREA: element.ClinicalArea,
                    RMK: element.Remarks,
                    Moddate: element.Moddate,
                     UID: element.UserID,
                    SavedEmpNo: element.SavedEmpNo,
                    SavedEmpFullName: element.SavedEmpFullName,
                    SavedEmpDesignation: element.SavedEmpDesignation,
                    haiTypeData,
                    editable: false
                });
            });
        }
    }

    prepareFoodPoisoningData(data: any) {
        this.foodPoisoningCollection = [];
        if (data.length > 0) {
            data.forEach((element: any) => {
                this.foodPoisoningCollection.push({
                    HAEFOODPOISONINGID: element.HAEFoodPoisoningID,
                    DOE: new Date(element.DateOfEvent),
                    TYPE: element.Type,
                    CLAREA: element.ClinicalArea,
                    RMK: element.Remarks,
                      Moddate: element.Moddate,
                     UID: element.UserID,
                    SavedEmpNo: element.SavedEmpNo,
                    SavedEmpFullName: element.SavedEmpFullName,
                    SavedEmpDesignation: element.SavedEmpDesignation,
                    editable: false
                });
            });
        }
    }

    prepareWithOtherData(data: any) {
        const parts = data.split(",") || [];
        const values: any = [];
        let otherId: string = '';
        let otherText: string = '';

        parts.forEach((p: string) => {
            const part = p.trim();
            if (part.includes("-")) {
                const [id, ...rest] = part.split("-");
                values.push(id);
                otherId = id;
                otherText = rest.join("-");;
            } else if (part) {
                values.push(part);
            }
        });

        return {
            values,
            otherId,
            otherText
        }
    }

    isAnyValuePresent(keys: any, obj: any) {
        return keys.some((key: any) => obj[key] && obj[key].length > 0);
    }

    addPressureUlcerRow() {
        if (this.pressureUlcerCollection.length > 0) {
            const lastItem = this.pressureUlcerCollection[this.pressureUlcerCollection.length - 1];
            if (!this.isAnyValuePresent(['MID', 'URIGHT', 'ULEFT', 'GRADE'], lastItem)) {
                this.errorMsg = 'Please fill details before adding a new row.';
                $('#errorMsg').modal('show');
                return;
            }
        }
        this.pressureUlcerCollection.push(cloneDeep(this.defaultUlcerData));
    }

    addFallRow() {
        if (this.fallCollection.length > 0) {
            const lastItem = this.fallCollection[this.fallCollection.length - 1];
            if (!this.isAnyValuePresent(['FTYPE', 'INJSPEC'], lastItem)) {
                this.errorMsg = 'Please fill details before adding a new row.';
                $('#errorMsg').modal('show');
                return;
            }
        }
        this.fallCollection.push(cloneDeep(this.defaultFallData));
    }

    addVteRow() {
        if (this.vteCollection.length > 0) {
            const lastItem = this.vteCollection[this.vteCollection.length - 1];
            if (!this.isAnyValuePresent(['VTETYPE', 'CONFIRMEDBY'], lastItem)) {
                this.errorMsg = 'Please fill details before adding a new row.';
                $('#errorMsg').modal('show');
                return;
            }
        }
        this.vteCollection.push(cloneDeep(this.defaultVteData));
    }

    addAdrRow() {
        if (this.adrCollection.length > 0) {
            const lastItem = this.adrCollection[this.adrCollection.length - 1];
            if (!this.isAnyValuePresent(['SITEOFADR', 'SUSPECTEDDRUGS'], lastItem)) {
                this.errorMsg = 'Please fill details before adding a new row.';
                $('#errorMsg').modal('show');
                return;
            }
        }
        this.adrCollection.push(cloneDeep(this.defaultADRData));
    }

    addBloodProductRow() {
        if (this.bloodProductCollection.length > 0) {
            const lastItem = this.bloodProductCollection[this.bloodProductCollection.length - 1];
            if (!this.isAnyValuePresent(['TYPEOFREACTION', 'UNITNUMBER'], lastItem)) {
                this.errorMsg = 'Please fill details before adding a new row.';
                $('#errorMsg').modal('show');
                return;
            }
        }
        this.bloodProductCollection.push(cloneDeep(this.defaultBloodData));
    }

    addHaiRow() {
        if (this.haiCollection.length > 0) {
            const lastItem = this.haiCollection[this.haiCollection.length - 1];
            if (!this.isAnyValuePresent(['TYPEOFHAI'], lastItem)) {
                this.errorMsg = 'Please fill details before adding a new row.';
                $('#errorMsg').modal('show');
                return;
            }
        }
        this.haiCollection.push(cloneDeep(this.defaultHAIData));
    }

    addFoodPoisoningRow() {
        if (this.foodPoisoningCollection.length > 0) {
            const lastItem = this.foodPoisoningCollection[this.foodPoisoningCollection.length - 1];
            if (!this.isAnyValuePresent(['TYPE'], lastItem)) {
                this.errorMsg = 'Please fill details before adding a new row.';
                $('#errorMsg').modal('show');
                return;
            }
        }
        this.foodPoisoningCollection.push(cloneDeep(this.defaultFoodPoisoningData));
    }

    clearForm() {
        if (this.activeTab === 'Pressure_Ulcer') {
            this.pressureUlcerCollection = [];
        } else if (this.activeTab === 'Falls') {
            this.fallCollection = [];
        } else if (this.activeTab === 'VTE') {
            this.vteCollection = [];
        } else if (this.activeTab === 'ADR') {
            this.adrCollection = [];
        } else if (this.activeTab === 'Blood_Product') {
            this.bloodProductCollection = [];
        } else if (this.activeTab === 'HAI') {
            this.haiCollection = [];
        } else if (this.activeTab === 'FoodPoisoning') {
            this.foodPoisoningCollection = [];
        }
        this.fetchData();
    }

    saveData() {
        if (this.activeTab === 'Pressure_Ulcer') {
            this.savePressureUlcerData();
        } else if (this.activeTab === 'Falls') {
            this.saveFallsData();
        } else if (this.activeTab === 'VTE') {
            this.saveVTEData();
        } else if (this.activeTab === 'ADR') {
            this.saveADRData();
        } else if (this.activeTab === 'Blood_Product') {
            this.saveBloodData();
        } else if (this.activeTab === 'HAI') {
            this.saveHAIData();
        } else if (this.activeTab === 'FoodPoisoning') {
            this.saveFoodPoisoningData();
        }
    }

    savePressureUlcerData() {
        if (this.pressureUlcerCollection.length === 0) {
            this.errorMsg = 'Please add at least one Pressure Ulcer record before saving.';
            $('#errorMsg').modal('show');
            return;
        }
        if (this.pressureUlcerCollection.length > 0) {
            const isValid = this.pressureUlcerCollection.every((item: any) => this.isAnyValuePresent(['MID', 'URIGHT', 'ULEFT', 'GRADE'], item));
            if (!isValid) {
                this.errorMsg = 'Please fill details before saving.';
                $('#errorMsg').modal('show');
                return;
            }
        }
        const PressureUlcerXML = this.pressureUlcerCollection.map((element: any) => {
            if (element.HAEPUID != '') {
                return {
                    "HAEPUID": element.HAEPUID,
                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "MID": element.MID.map((item: any) => item.HospitalAcquiredEventID).toString(),
                    "URIGHT": element.URIGHT.map((item: any) => item.HospitalAcquiredEventID).toString(),
                    "ULEFT": element.ULEFT.map((item: any) => item.HospitalAcquiredEventID).toString(),
                    "GRADE": element.GRADE.map((item: any) => item.HospitalAcquiredEventID).toString(),
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": element.USERID
                };
            } else {
                return {

                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "MID": element.MID.map((item: any) => item.HospitalAcquiredEventID).toString(),
                    "URIGHT": element.URIGHT.map((item: any) => item.HospitalAcquiredEventID).toString(),
                    "ULEFT": element.ULEFT.map((item: any) => item.HospitalAcquiredEventID).toString(),
                    "GRADE": element.GRADE.map((item: any) => item.HospitalAcquiredEventID).toString(),
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": this.doctorDetails[0].UserId
                };
            }

        });
        const payload = {
            "PatientID": this.selectedView.PatientID,
            "Admissionid": this.selectedView.AdmissionID,
            PressureUlcerXML,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.wardID,
            "HospitalID": this.hospitalID
        };
        this.us.post(HospitalEvents.SavePatientHospitalAcquiredEventPressureUlcer, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                this.fetchData();
                $('#saveMsg').modal('show');
            } else {
                this.errorMsg = 'Error in Saving Pressure Ulcer';
                $('#errorMsg').modal('show');
            }
        });
    }

    saveFallsData() {
        if (this.fallCollection.length === 0) {
            this.errorMsg = 'Please add at least one Falls record before saving.';
            $('#errorMsg').modal('show');
            return;
        }

        if (this.fallCollection.length > 0) {
            const isValid = this.fallCollection.every((item: any) => this.isAnyValuePresent(['FTYPE', 'INJSPEC'], item));
            if (!isValid) {
                this.errorMsg = 'Please fill details before saving.';
                $('#errorMsg').modal('show');
                return;
            }
        }

        const invalidItem = this.fallCollection.find(
            (it: any) => it.FTYPE_OTHER_ID && !it.FTYPE_OTHER_TEXT
        );

        if (invalidItem) {
            this.errorMsg = "Please enter details for 'Other' before saving.";
            $('#errorMsg').modal('show');
            return;
        }

        const FallsXML = this.fallCollection.map((element: any) => {
            if (element.HAEFALLID != '') {
                return {
                    "HAEFALLID": element.HAEFALLID,
                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "FTYPE": [
                        ...element.FTYPE.map((f: any) => f.HospitalAcquiredEventID).filter((x: any) => x !== element.FTYPE_OTHER_ID),
                        ...(element.FTYPE_OTHER_ID
                            ? [`${element.FTYPE_OTHER_ID}-${element.FTYPE_OTHER_TEXT}`]
                            : [])
                    ].toString(),
                    "INJSUST": element.INJSUST,
                    "INJSPEC": element.INJSPEC,
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": element.USERID
                };
            } else {
                return {
                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "FTYPE": [
                        ...element.FTYPE.map((f: any) => f.HospitalAcquiredEventID).filter((x: any) => x !== element.FTYPE_OTHER_ID),
                        ...(element.FTYPE_OTHER_ID
                            ? [`${element.FTYPE_OTHER_ID}-${element.FTYPE_OTHER_TEXT}`]
                            : [])
                    ].toString(),
                    "INJSUST": element.INJSUST,
                    "INJSPEC": element.INJSPEC,
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": this.doctorDetails[0].UserId
                };
            }

        });
        const payload = {
            "PatientID": this.selectedView.PatientID,
            "Admissionid": this.selectedView.AdmissionID,
            FallsXML,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.wardID,
            "HospitalID": this.hospitalID
        };
        this.us.post(HospitalEvents.SavePatientHospitalAcquiredEventFalls, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                this.fetchData();
                $('#saveMsg').modal('show');
            } else {
                this.errorMsg = 'Error in Saving Falls Data';
                $('#errorMsg').modal('show');
            }
        });
    }

    saveVTEData() {
        if (this.vteCollection.length === 0) {
            this.errorMsg = 'Please add at least one VTE record before saving.';
            $('#errorMsg').modal('show');
            return;
        }

        if (this.vteCollection.length > 0) {
            const isValid = this.vteCollection.every((item: any) => this.isAnyValuePresent(['VTETYPE', 'CONFIRMEDBY'], item));
            if (!isValid) {
                this.errorMsg = 'Please fill details before saving.';
                $('#errorMsg').modal('show');
                return;
            }
        }

        const invalidItem = this.vteCollection.find(
            (it: any) => it.CONFIRMEDBY_OTHER_ID && !it.CONFIRMEDBY_OTHER_TEXT
        );

        if (invalidItem) {
            this.errorMsg = "Please enter details for 'Other' before saving.";
            $('#errorMsg').modal('show');
            return;
        }
        const VteXML = this.vteCollection.map((element: any) => {
            if (element.HAEVTEID) {
                return {
                    HAEVTEID: element.HAEVTEID,
                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "VTETYPE": element.VTETYPE.map((item: any) => item.HospitalAcquiredEventID).toString(),
                    "CONFIRMEDBY": [
                        ...element.CONFIRMEDBY.map((f: any) => f.HospitalAcquiredEventID).filter((x: any) => x !== element.CONFIRMEDBY_OTHER_ID),
                        ...(element.CONFIRMEDBY_OTHER_ID
                            ? [`${element.CONFIRMEDBY_OTHER_ID}-${element.CONFIRMEDBY_OTHER_TEXT}`]
                            : [])
                    ].toString(),
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": element.USERID
                };
            } else {
                return {
                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "VTETYPE": element.VTETYPE.map((item: any) => item.HospitalAcquiredEventID).toString(),
                    "CONFIRMEDBY": [
                        ...element.CONFIRMEDBY.map((f: any) => f.HospitalAcquiredEventID).filter((x: any) => x !== element.CONFIRMEDBY_OTHER_ID),
                        ...(element.CONFIRMEDBY_OTHER_ID
                            ? [`${element.CONFIRMEDBY_OTHER_ID}-${element.CONFIRMEDBY_OTHER_TEXT}`]
                            : [])
                    ].toString(),
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": this.doctorDetails[0].UserId
                }
            }
        });
        const payload = {
            "PatientID": this.selectedView.PatientID,
            "Admissionid": this.selectedView.AdmissionID,
            VteXML,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.wardID,
            "HospitalID": this.hospitalID
        };
        this.us.post(HospitalEvents.SavePatientHospitalAcquiredEventVTE, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                this.fetchData();
                $('#saveMsg').modal('show');
            } else {
                this.errorMsg = 'Error in Saving VTE Data';
                $('#errorMsg').modal('show');
            }
        });
    }

    saveADRData() {
        if (this.adrCollection.length === 0) {
            this.errorMsg = 'Please add at least one ADR record before saving.';
            $('#errorMsg').modal('show');
            return;
        }

        if (this.adrCollection.length > 0) {
            const isValid = this.adrCollection.every((item: any) => this.isAnyValuePresent(['SITEOFADR', 'SUSPECTEDDRUGS'], item));
            if (!isValid) {
                this.errorMsg = 'Please fill details before saving.';
                $('#errorMsg').modal('show');
                return;
            }
        }

        const invalidItem = this.adrCollection.find(
            (it: any) => it.SITEOFADR_OTHER_ID && !it.SITEOFADR_OTHER_TEXT
        );
        if (invalidItem) {
            this.errorMsg = "Please enter details for 'Other' before saving.";
            $('#errorMsg').modal('show');
            return;
        }
        const ADRXML = this.adrCollection.map((element: any) => {
            if (element.HAEADRID) {
                return {
                    "HAEADRID": element.HAEADRID,
                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "SITEOFADR": [
                        ...element.SITEOFADR.map((f: any) => f.HospitalAcquiredEventID).filter((x: any) => x !== element.SITEOFADR_OTHER_ID),
                        ...(element.SITEOFADR_OTHER_ID
                            ? [`${element.SITEOFADR_OTHER_ID}-${element.SITEOFADR_OTHER_TEXT}`]
                            : [])
                    ].toString(),
                    "SUSPECTEDDRUGS": element.SUSPECTEDDRUGS,
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": element.USERID
                }
            } else {
                return {
                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "SITEOFADR": [
                        ...element.SITEOFADR.map((f: any) => f.HospitalAcquiredEventID).filter((x: any) => x !== element.CONFIRMEDBY_OTHER_ID),
                        ...(element.SITEOFADR_OTHER_ID
                            ? [`${element.SITEOFADR_OTHER_ID}-${element.SITEOFADR_OTHER_TEXT}`]
                            : [])
                    ].toString(),
                    "SUSPECTEDDRUGS": element.SUSPECTEDDRUGS,
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": this.doctorDetails[0].UserId
                }
            }
        });

        const payload = {
            "PatientID": this.selectedView.PatientID,
            "Admissionid": this.selectedView.AdmissionID,
            ADRXML,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.wardID,
            "HospitalID": this.hospitalID
        };
        this.us.post(HospitalEvents.SavePatientHospitalAcquiredEventADR, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                this.fetchData();
                $('#saveMsg').modal('show');
            } else {
                this.errorMsg = 'Error in Saving Pressure Ulcer';
                $('#errorMsg').modal('show');
            }
        });
    }

    saveBloodData() {
        if (this.bloodProductCollection.length === 0) {
            this.errorMsg = 'Please add at least one Blood Product record before saving.';
            $('#errorMsg').modal('show');
            return;
        }

        if (this.bloodProductCollection.length > 0) {
            const isValid = this.bloodProductCollection.every((item: any) => this.isAnyValuePresent(['TYPEOFREACTION', 'UNITNUMBER'], item));
            if (!isValid) {
                this.errorMsg = 'Please fill details before saving.';
                $('#errorMsg').modal('show');
                return;
            }
        }

        const invalidItem = this.bloodProductCollection.find(
            (it: any) => it.TYPEOFREACTION_OTHER_ID && !it.TYPEOFREACTION_OTHER_TEXT
        );
        if (invalidItem) {
            this.errorMsg = "Please enter details for 'Other' before saving.";
            $('#errorMsg').modal('show');
            return;
        }

        const BloodXML = this.bloodProductCollection.map((element: any) => {
            if (element.HAEBloodID) {
                return {
                    "HAEBloodID": element.HAEBloodID,
                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "TYPEOFREACTION": [
                        ...element.TYPEOFREACTION.map((f: any) => f.HospitalAcquiredEventID).filter((x: any) => x !== element.TYPEOFREACTION_OTHER_ID),
                        ...(element.TYPEOFREACTION_OTHER_ID
                            ? [`${element.TYPEOFREACTION_OTHER_ID}-${element.TYPEOFREACTION_OTHER_TEXT}`]
                            : [])
                    ].toString(),
                    "UNITNUMBER": element.UNITNUMBER,
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": element.USERID
                }
            } else {
                return {
                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "TYPEOFREACTION": [
                        ...element.TYPEOFREACTION.map((f: any) => f.HospitalAcquiredEventID).filter((x: any) => x !== element.TYPEOFREACTION_OTHER_ID),
                        ...(element.TYPEOFREACTION_OTHER_ID
                            ? [`${element.TYPEOFREACTION_OTHER_ID}-${element.TYPEOFREACTION_OTHER_TEXT}`]
                            : [])
                    ].toString(),
                    "UNITNUMBER": element.UNITNUMBER,
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": this.doctorDetails[0].UserId
                }
            }
        });

        const payload = {
            "PatientID": this.selectedView.PatientID,
            "Admissionid": this.selectedView.AdmissionID,
            "BloodXML": BloodXML
        };
        this.us.post(HospitalEvents.SavePatientHospitalAcquiredEventBlood, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                this.fetchData();
                $('#saveMsg').modal('show');
            } else {
                this.errorMsg = 'Error in Saving Blood Data';
                $('#errorMsg').modal('show');
            }
        });
    }

    saveHAIData() {
        if (this.haiCollection.length === 0) {
            this.errorMsg = 'Please add at least one HAI record before saving.';
            $('#errorMsg').modal('show');
            return;
        }

        if (this.haiCollection.length > 0) {
            const isValid = this.haiCollection.every((item: any) => this.isAnyValuePresent(['TYPEOFHAI'], item));
            if (!isValid) {
                this.errorMsg = 'Please fill details before saving.';
                $('#errorMsg').modal('show');
                return;
            }
        }

        const invalidItem = this.haiCollection.find(
            (it: any) => it.TYPEOFHAI_OTHER_ID && !it.TYPEOFHAI_OTHER_TEXT
        );
        if (invalidItem) {
            this.errorMsg = "Please enter details for 'Other' before saving.";
            $('#errorMsg').modal('show');
            return;
        }

        const HAIXML = this.haiCollection.map((element: any) => {
            if (element.HAEHAIID) {
                return {
                    "HAEHAIID": element.HAEHAIID,
                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "TYPEOFHAI": [
                        ...element.TYPEOFHAI.map((f: any) => f.HospitalAcquiredEventID).filter((x: any) => x !== element.TYPEOFHAI_OTHER_ID),
                        ...(element.TYPEOFHAI_OTHER_ID
                            ? [`${element.TYPEOFHAI_OTHER_ID}-${element.TYPEOFHAI_OTHER_TEXT}`]
                            : [])
                    ].toString(),
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": element.USERID
                }
            } else {
                return {
                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "TYPEOFHAI": [
                        ...element.TYPEOFHAI.map((f: any) => f.HospitalAcquiredEventID).filter((x: any) => x !== element.TYPEOFHAI_OTHER_ID),
                        ...(element.TYPEOFHAI_OTHER_ID
                            ? [`${element.TYPEOFHAI_OTHER_ID}-${element.TYPEOFHAI_OTHER_TEXT}`]
                            : [])
                    ].toString(),
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": this.doctorDetails[0].UserId
                }
            }
        });
        const payload = {
            "PatientID": this.selectedView.PatientID,
            "Admissionid": this.selectedView.AdmissionID,
            HAIXML,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.wardID,
            "HospitalID": this.hospitalID
        };
        this.us.post(HospitalEvents.SavePatientHospitalAcquiredEventHAI, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                this.fetchData();
                $('#saveMsg').modal('show');
            } else {
                this.errorMsg = 'Error in Saving HAI Data';
                $('#errorMsg').modal('show');
            }
        });
    }

    saveFoodPoisoningData() {
        if (this.foodPoisoningCollection.length === 0) {
            this.errorMsg = 'Please add at least one Food Poisoning record before saving.';
            $('#errorMsg').modal('show');
            return;
        }

        if (this.foodPoisoningCollection.length > 0) {
            const isValid = this.foodPoisoningCollection.every((item: any) => this.isAnyValuePresent(['TYPE'], item));
            if (!isValid) {
                this.errorMsg = 'Please fill details before saving.';
                $('#errorMsg').modal('show');
                return;
            }
        }

        const FoodPoisoningXML = this.foodPoisoningCollection.map((element: any) => {
            if (element.HAEFOODPOISONINGID) {
                return {
                    "HAEFOODPOISONINGID": element.HAEFOODPOISONINGID,
                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "TYPE": element.TYPE,
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": element.USERID
                }
            } else {
                return {
                    "DOE": this.datepipe.transform(element.DOE, "dd-MMM-yyyy")?.toString(),
                    "TYPE": element.TYPE,
                    "CLAREA": element.CLAREA,
                    "RMK": element.RMK,
                    "UID": this.doctorDetails[0].UserId
                }
            }
        });
        const payload = {
            "PatientID": this.selectedView.PatientID,
            "Admissionid": this.selectedView.AdmissionID,
            FoodPoisoningXML,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.wardID,
            "HospitalID": this.hospitalID
        };
        this.us.post(HospitalEvents.SavePatientHospitalAcquiredEventFoodPoisoning, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                this.fetchData();
                $('#saveMsg').modal('show');
            } else {
                this.errorMsg = 'Error in Saving Food Poisoning Data';
                $('#errorMsg').modal('show');
            }
        });
    }

    navigatetoBedBoard() {
        this.router.navigate(['/ward']);
    }

    openQuickActions() {
        this.patinfo = this.selectedView;
        $("#quickaction_info").modal('show');
    }

    midlineOptionClicked(event: any, option: any, item: any) {
        event.stopPropagation();
        this.midlineOptionSelection(option, item);
    }

    midlineOptionSelection(option: any, item: any) {
        option.selected = !option.selected;
        if (option.selected) {
            const i = item.MID.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            if (i === -1) {
                item.MID.push(option);
            }
        } else {
            const i = item.MID.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            item.MID.splice(i, 1);
        }
    }

    removeMidlineOption(option: any, item: any) {
        option.selected = false;
        const i = item.MID.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
        item.MID.splice(i, 1);
    }

    urightOptionClicked(event: any, option: any, item: any) {
        event.stopPropagation();
        this.urightOptionSelection(option, item);
    }

    urightOptionSelection(option: any, item: any) {
        option.selected = !option.selected;
        if (option.selected) {
            const i = item.URIGHT.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            if (i === -1) {
                item.URIGHT.push(option);
            }
        } else {
            const i = item.URIGHT.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            item.URIGHT.splice(i, 1);
        }
    }

    removeURightOption(option: any, item: any) {
        option.selected = false;
        const i = item.URIGHT.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
        item.URIGHT.splice(i, 1);
    }

    uleftOptionClicked(event: any, option: any, item: any) {
        event.stopPropagation();
        this.uleftOptionSelection(option, item);
    }

    uleftOptionSelection(option: any, item: any) {
        option.selected = !option.selected;
        if (option.selected) {
            const i = item.ULEFT.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            if (i === -1) {
                item.ULEFT.push(option);
            }
        } else {
            const i = item.ULEFT.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            item.ULEFT.splice(i, 1);
        }
    }

    removeULeftOption(option: any, item: any) {
        option.selected = false;
        const i = item.ULEFT.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
        item.ULEFT.splice(i, 1);
    }

    gradeOptionClicked(event: any, option: any, item: any) {
        event.stopPropagation();
        this.gradeOptionSelection(option, item);
    }

    gradeOptionSelection(option: any, item: any) {
        option.selected = !option.selected;
        if (option.selected) {
            const i = item.GRADE.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            if (i === -1) {
                item.GRADE.push(option);
            }
        } else {
            const i = item.GRADE.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            item.GRADE.splice(i, 1);
        }
    }

    removeGradeOption(option: any, item: any) {
        option.selected = false;
        const i = item.GRADE.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
        item.GRADE.splice(i, 1);
    }


    fallTypeOptionClicked(event: any, option: any, item: any) {
        event.stopPropagation();
        this.fallTypeOptionSelection(option, item);
    }

    fallTypeOptionSelection(option: any, item: any) {
        option.selected = !option.selected;
        if (option.selected) {
            const i = item.FTYPE.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            if (i === -1) {
                item.FTYPE.push(option);
            }
            if (option.ItemName === 'Other') {
                item.FTYPE_OTHER_ID = option.HospitalAcquiredEventID;
                item.FTYPE_OTHER_TEXT = '';
            }
        } else {
            const i = item.FTYPE.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            item.FTYPE.splice(i, 1);
            if (option.ItemName === 'Other') {
                item.FTYPE_OTHER_ID = '';
                item.FTYPE_OTHER_TEXT = '';
            }
        }
    }

    removeFallTypeOption(option: any, item: any) {
        option.selected = false;
        const i = item.FTYPE.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
        item.FTYPE.splice(i, 1);

        if (option.ItemName === 'Other') {
            item.FTYPE_OTHER_ID = '';
            item.FTYPE_OTHER_TEXT = '';
        }
    }

    isFTYPEOtherSelected(option: any, item: any): boolean {
        if (!item?.FTYPE) return false;
        return option.ItemName === 'Other' &&
            item.FTYPE.some((f: any) => f.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
    }

    VTETypeOptionClicked(event: any, option: any, item: any) {
        event.stopPropagation();
        this.VTETypeOptionSelection(option, item);
    }

    VTETypeOptionSelection(option: any, item: any) {
        option.selected = !option.selected;
        if (option.selected) {
            const i = item.VTETYPE.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            if (i === -1) {
                item.VTETYPE.push(option);
            }
        } else {
            const i = item.GRADE.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            item.VTETYPE.splice(i, 1);
        }
    }

    removeVTETypeOption(option: any, item: any) {
        option.selected = false;
        const i = item.VTETYPE.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
        item.VTETYPE.splice(i, 1);
    }

    confirmedByOptionClicked(event: any, option: any, item: any) {
        event.stopPropagation();
        this.confirmedByOptionSelection(option, item);
    }

    confirmedByOptionSelection(option: any, item: any) {
        option.selected = !option.selected;
        if (option.selected) {
            const i = item.CONFIRMEDBY.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            if (i === -1) {
                item.CONFIRMEDBY.push(option);
            }
            if (option.ItemName === 'Other') {
                item.CONFIRMEDBY_OTHER_ID = option.HospitalAcquiredEventID;
                item.CONFIRMEDBY_OTHER_TEXT = '';
            }
        } else {
            const i = item.CONFIRMEDBY.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            item.CONFIRMEDBY.splice(i, 1);
            if (option.ItemName === 'Other') {
                item.CONFIRMEDBY_OTHER_ID = '';
                item.CONFIRMEDBY_OTHER_TEXT = '';
            }
        }
    }

    removeConfirmedOption(option: any, item: any) {
        option.selected = false;
        const i = item.CONFIRMEDBY.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
        item.CONFIRMEDBY.splice(i, 1);

        if (option.ItemName === 'Other') {
            item.CONFIRMEDBY_OTHER_ID = '';
            item.CONFIRMEDBY_OTHER_TEXT = '';
        }
    }

    isCONFIRMEDBYOtherSelected(option: any, item: any): boolean {
        if (!item?.CONFIRMEDBY) return false;
        return option.ItemName === 'Other' &&
            item.CONFIRMEDBY.some((f: any) => f.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
    }

    adrTypeOptionClicked(event: any, option: any, item: any) {
        event.stopPropagation();
        this.adrTypeOptionSelection(option, item);
    }

    adrTypeOptionSelection(option: any, item: any) {
        option.selected = !option.selected;
        if (option.selected) {
            const i = item.SITEOFADR.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            if (i === -1) {
                item.SITEOFADR.push(option);
            }
            if (option.ItemName === 'Other') {
                item.SITEOFADR_OTHER_ID = option.HospitalAcquiredEventID;
                item.SITEOFADR_OTHER_TEXT = '';
            }
        } else {
            const i = item.SITEOFADR.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            item.SITEOFADR.splice(i, 1);
            if (option.ItemName === 'Other') {
                item.SITEOFADR_OTHER_ID = '';
                item.SITEOFADR_OTHER_TEXT = '';
            }
        }
    }

    removeAdrTypeOption(option: any, item: any) {
        option.selected = false;
        const i = item.SITEOFADR.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
        item.SITEOFADR.splice(i, 1);
        if (option.ItemName === 'Other') {
            item.SITEOFADR_OTHER_ID = '';
            item.SITEOFADR_OTHER_TEXT = '';
        }
    }

    isAdrTypeOtherSelected(option: any, item: any): boolean {
        if (!item?.SITEOFADR) return false;
        return option.ItemName === 'Other' &&
            item.SITEOFADR.some((f: any) => f.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
    }

    bloodReactionTypeOptionClicked(event: any, option: any, item: any) {
        event.stopPropagation();
        this.bloodReactionTypeOptionSelection(option, item);
    }

    bloodReactionTypeOptionSelection(option: any, item: any) {
        option.selected = !option.selected;
        if (option.selected) {
            const i = item.TYPEOFREACTION.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            if (i === -1) {
                item.TYPEOFREACTION.push(option);
            }
            if (option.ItemName === 'Other') {
                item.TYPEOFREACTION_OTHER_ID = option.HospitalAcquiredEventID;
                item.TYPEOFREACTION_OTHER_TEXT = '';
            }
        } else {
            const i = item.TYPEOFREACTION.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            item.TYPEOFREACTION.splice(i, 1);
            if (option.ItemName === 'Other') {
                item.TYPEOFREACTION_OTHER_ID = '';
                item.TYPEOFREACTION_OTHER_TEXT = '';
            }
        }
    }
    removeBloodReactionTypeOption(option: any, item: any) {
        option.selected = false;
        const i = item.TYPEOFREACTION.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
        item.TYPEOFREACTION.splice(i, 1);
        if (option.ItemName === 'Other') {
            item.TYPEOFREACTION_OTHER_ID = '';
            item.TYPEOFREACTION_OTHER_TEXT = '';
        }
    }
    isBloodReactionTypeOtherSelected(option: any, item: any): boolean {
        if (!item?.TYPEOFREACTION) return false;
        return option.ItemName === 'Other' &&
            item.TYPEOFREACTION.some((f: any) => f.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
    }

    haiTypeOptionClicked(event: any, option: any, item: any) {
        event.stopPropagation();
        this.haiTypeOptionSelection(option, item);
    }

    haiTypeOptionSelection(option: any, item: any) {
        option.selected = !option.selected;
        if (option.selected) {
            const i = item.TYPEOFHAI.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            if (i === -1) {
                item.TYPEOFHAI.push(option);
            }
            if (option.ItemName === 'Other') {
                item.TYPEOFHAI_OTHER_ID = option.HospitalAcquiredEventID;
                item.TYPEOFHAI_OTHER_TEXT = '';
            }
        } else {
            const i = item.TYPEOFHAI.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
            item.TYPEOFHAI.splice(i, 1);
            if (option.ItemName === 'Other') {
                item.TYPEOFHAI_OTHER_ID = '';
                item.TYPEOFHAI_OTHER_TEXT = '';
            }
        }
    }

    removeHaiTypeOption(option: any, item: any) {
        option.selected = false;
        const i = item.TYPEOFHAI.findIndex((value: any) => value.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
        item.TYPEOFHAI.splice(i, 1);
        if (option.ItemName === 'Other') {
            item.TYPEOFHAI_OTHER_ID = '';
            item.TYPEOFHAI_OTHER_TEXT = '';
        }
    }

    isHaiTypeOtherSelected(option: any, item: any): boolean {
        if (!item?.TYPEOFHAI) return false;
        return option.ItemName === 'Other' &&
            item.TYPEOFHAI.some((f: any) => f.HospitalAcquiredEventID === option.HospitalAcquiredEventID);
    }

    removeItem(item: any) {
        let payload = {
            "HAEPressureUlcerID": "0",
            "HAEFallsID": "0",
            "HAEVTEID": "0",
            "HAEADRID": "0",
            "HAEBloodID": "0",
            "HAEHAIID": "0",
            "HAEFoodPoisoningID": "0",
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.wardID,
            "HospitalID": this.hospitalID
        };
        let isAnyIdPresent = false;
        switch (this.activeTab) {
            case 'Pressure_Ulcer':
                {
                    const index = this.pressureUlcerCollection.indexOf(item);
                    if (index > -1) {
                        this.pressureUlcerCollection.splice(index, 1);
                        if (item.HAEPUID) {
                            payload.HAEPressureUlcerID = item.HAEPUID;
                            isAnyIdPresent = true;
                        }
                    }
                }
                break;
            case 'Falls':
                {
                    const index = this.fallCollection.indexOf(item);
                    if (index > -1) {
                        this.fallCollection.splice(index, 1);
                        if (item.HAEFALLID) {
                            payload.HAEFallsID = item.HAEFALLID;
                            isAnyIdPresent = true;
                        }
                    }
                }
                break;
            case 'VTE':
                {
                    const index = this.vteCollection.indexOf(item);
                    if (index > -1) {
                        this.vteCollection.splice(index, 1);
                        if (item.HAEVTEID) {
                            payload.HAEVTEID = item.HAEVTEID;
                            isAnyIdPresent = true;
                        }
                    }
                }
                break;
            case 'ADR':
                {
                    const index = this.adrCollection.indexOf(item);
                    if (index > -1) {
                        this.adrCollection.splice(index, 1);
                        if (item.HAEADRID) {
                            payload.HAEADRID = item.HAEADRID;
                            isAnyIdPresent = true;
                        }
                    }
                }
                break;
            case 'Blood_Product':
                {
                    const index = this.bloodProductCollection.indexOf(item);
                    if (index > -1) {
                        this.bloodProductCollection.splice(index, 1);
                        if (item.HAEBloodID) {
                            payload.HAEBloodID = item.HAEBloodID;
                            isAnyIdPresent = true;
                        }
                    }
                }
                break;
            case 'HAI':
                {
                    const index = this.haiCollection.indexOf(item);
                    if (index > -1) {
                        this.haiCollection.splice(index, 1);
                        if (item.HAEHAIID) {
                            payload.HAEHAIID = item.HAEHAIID;
                            isAnyIdPresent = true;
                        }
                    }
                }
                break;
            case 'FoodPoisoning':
                {
                    const index = this.foodPoisoningCollection.indexOf(item);
                    if (index > -1) {
                        this.foodPoisoningCollection.splice(index, 1);
                        if (item.HAEFOODPOISONINGID) {
                            payload.HAEFoodPoisoningID = item.HAEFOODPOISONINGID;
                            isAnyIdPresent = true;
                        }
                    }
                }
                break;
            default:
                break;
        }

        if (isAnyIdPresent) {
            this.us.post(HospitalEvents.DeletePatientHospitalAcquiredEvents, payload).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.fetchData();
                    $('#deleteMsg').modal('show');
                } else {
                    this.errorMsg = 'Error in Deleting Data';
                    $('#errorMsg').modal('show');
                }
            });
        }
    }
}

const HospitalEvents = {
    FetchHospitalAcquiredEventMaster: 'FetchHospitalAcquiredEventMaster?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientHospitalAcquiredEvents: 'FetchPatientHospitalAcquiredEvents?AdmissionID=${AdmissionID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SavePatientHospitalAcquiredEventPressureUlcer: 'SavePatientHospitalAcquiredEventPressureUlcer',
    SavePatientHospitalAcquiredEventFalls: 'SavePatientHospitalAcquiredEventFalls',
    SavePatientHospitalAcquiredEventVTE: 'SavePatientHospitalAcquiredEventVTE',
    SavePatientHospitalAcquiredEventADR: 'SavePatientHospitalAcquiredEventADR',
    SavePatientHospitalAcquiredEventBlood: 'SavePatientHospitalAcquiredEventBlood',
    SavePatientHospitalAcquiredEventHAI: 'SavePatientHospitalAcquiredEventHAI',
    SavePatientHospitalAcquiredEventFoodPoisoning: 'SavePatientHospitalAcquiredEventFoodPoisoning',
    DeletePatientHospitalAcquiredEvents: 'DeletePatientHospitalAcquiredEvents'
}