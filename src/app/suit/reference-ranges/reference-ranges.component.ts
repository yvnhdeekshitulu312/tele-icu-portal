import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-reference-ranges',
    templateUrl: './reference-ranges.component.html'
})
export class ReferenceRangesComponent extends BaseComponent implements OnInit {
    @ViewChild('rangeDescription') rangeDescription!: ElementRef;

    facility: any;
    facilityId: any;
    testsCollection: any = [];
    selectedTest: any;
    GendersMastersList: any;
    AgeMastersList: any;
    ComponentsreferenceDataList: any;
    ComponentsreferenceRangeDataList: any;
    EquipmentMastersList: any;
    MethodMastersList: any;
    ReagentMastersList: any;

    formData: any;
    errorMessages: any = [];

    constructor(private us: UtilityService) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
        this.FetchLabReferenceMasters();
        this.initializeFormData();
    }

    initializeFormData() {
        this.formData = {
            ID: '',
            CmpID: 0,
            FAge: '',
            FAUoM: 1,
            TAUoM: 1,
            TAge: '',
            Minlt: '',
            Maxlt: '',
            PMin: '',
            PMax: '',
            KWD: '',
            ISKWD: false,
            HUOM: false,
            DeltaCheck: '',
            IsValue: false,
            Samples: '',
            Within: '',
            Gender: 0,
            MinTv: '',
            MaxTv: '',
            Unit: '',
        };
        if (this.rangeDescription) {
            this.rangeDescription.nativeElement.innerHTML = '';
        }
    }

    getUnitValue(item: any) {
        return this.AgeMastersList.find((element: any) => element.Id.toString() === item.FAUoM.toString())?.Names;
    }

    FetchLabReferenceMasters() {
        const url = this.us.getApiUrl(ReferenceRanges.FetchLabReferenceMasters, {
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.GendersMastersList = response.FetchLabReferenceGendersMastersList;
                this.AgeMastersList = response.FetchLabReferenceAgeMastersList;
            }
        });
    }

    onTestNameSearch(event: any) {
        this.testsCollection = [];
        if (event.target.value.length >= 3) {
            const url = this.us.getApiUrl(ReferenceRanges.FetchHospitalTestReference, {
                Name: event.target.value.trim(),
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.testsCollection = response.FetchHospitalTestReferenceDataList;
                    }
                },
                    () => {

                    })
        }
    }

    onTestNameSelection(item: any) {
        this.initializeFormData();
        this.testsCollection = [];
        this.selectedTest = item;
        this.FetchTestComponentsreference();
        this.FetchLabMethodReagentEquipment();
        this.FetchTestComponentsreferenceRange();
    }

    FetchLabMethodReagentEquipment() {
        const url = this.us.getApiUrl(ReferenceRanges.FetchLabMethodReagentEquipment, {
            TestID: this.selectedTest.TestId,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.EquipmentMastersList = response.FetchLabReferenceEquipmentMastersList;
                this.MethodMastersList = response.FetchLabReferenceMethodMastersList;
                this.ReagentMastersList = response.FetchLabReferenceReagentMastersList;
            }
        });
    }

    FetchTestComponentsreference() {
        const url = this.us.getApiUrl(ReferenceRanges.FetchTestComponentsreference, {
            TestID: this.selectedTest.TestId,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.ComponentsreferenceDataList = response.FetchTestComponentsreferenceDataList;
            }
        });
    }

    FetchTestComponentsreferenceRange() {
        const url = this.us.getApiUrl(ReferenceRanges.FetchTestComponentsreferenceRange, {
            TestID: this.selectedTest.TestId,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.ComponentsreferenceRangeDataList = response.FetchTestComponentsreferenceRangeDataList;
            }
        });
    }

    onAddClick() {
        this.errorMessages = [];
        if (!this.formData.CmpID) {
            this.errorMessages.push('Please Select Component');
        }
        if (!this.formData.FAge) {
            this.errorMessages.push('Please Enter From Age');
        }
        if (!this.formData.TAge) {
            this.errorMessages.push('Please Enter To Age');
        }

        // if (!this.formData.Minlt) {
        //     this.errorMessages.push('Please Enter From Min Range');
        // }
        // if (!this.formData.Maxlt) {
        //     this.errorMessages.push('Please Enter From Max Range');
        // }
        // if (!this.formData.PMin) {
        //     this.errorMessages.push('Please Enter From Panic Min Value');
        // }
        // if (!this.formData.PMax) {
        //     this.errorMessages.push('Please Enter From Panic Max Value');
        // }

        if (this.errorMessages.length > 0) {
            $('#errorMsg').modal('show');
            return;
        }

        this.formData.ComponentName = this.ComponentsreferenceDataList.find((item: any) => item.ParameterID === this.formData.CmpID)?.ParameterName;
        // this.formData.KWD = this.rangeDescription.nativeElement.innerHTML;
        if (this.formData.CmpID) {
            const index = this.ComponentsreferenceRangeDataList.findIndex((element: any) => element.CmpID === this.formData.CmpID && element.SNo === this.formData.SNo);
            if (index !== -1) {
                this.ComponentsreferenceRangeDataList[index] = this.formData;
            }
            else {
                this.formData.SNo = this.ComponentsreferenceRangeDataList.length + 1;
                this.ComponentsreferenceRangeDataList.push({ ...this.formData });
            }
        } else {
            this.formData.SNo = this.ComponentsreferenceRangeDataList.length + 1;
            this.ComponentsreferenceRangeDataList.push({ ...this.formData });
        }
        this.initializeFormData();
    }

    onClear() {
        this.initializeFormData();
        this.ComponentsreferenceDataList = [];
        this.ComponentsreferenceRangeDataList = [];
        this.EquipmentMastersList = [];
        this.ReagentMastersList = [];
        this.MethodMastersList = [];
        this.selectedTest = null;
        $('#textbox_testname').val('');
    }

    onSaveClick() {
        if (this.ComponentsreferenceRangeDataList?.length > 0) {
            const payload = {
                "TestId": this.selectedTest.TestId,
                "TestRangesXMLL": this.ComponentsreferenceRangeDataList.map((element: any) => {
                    return {
                        "CMPID": element.CmpID,
                        "FAGE": element.FAge,
                        "FAUOM": element.FAUoM,
                        "TAGE": element.TAge,
                        "TAUOM": element.TAUoM,
                        "MINLT": element.Minlt,
                        "MAXLT": element.Maxlt,
                        "PMIN": element.PMin,
                        "PMAX": element.PMax,
                        "KWD": element.KWD,
                        "ISKWD": element.ISKWD === false ? '0' : '1',
                        "HUOM": element.HUOM === false ? "0" : '1',
                        "TAGEF": element.TAge,
                        "TAUOMF": element.TAUoM
                    }
                }),
                "USERID": this.doctorDetails[0].UserId,
                "WORKSTATIONID": this.facilityId,
                "HospitalID": this.hospitalID
            };
            this.us.post(ReferenceRanges.SaveComponentRanges, payload).subscribe((response: any) => {
                if (response.Code === 200) {
                    $('#savemsg').modal('show');
                    this.FetchTestComponentsreferenceRange();
                }
            });
        } else {
            this.errorMessages = [];
            this.errorMessages.push('Please add Items');
            $('#errorMsg').modal('show');
        }
    }

    onDeleteClick(index: any) {
        this.ComponentsreferenceRangeDataList.splice(index, 1);
    }

    onEditClick(item: any) {
        this.formData = { 
            ...item,
            Minlt: item.Minlt === '' ? '' : Number(item.Minlt).toFixed(2),
            Maxlt: item.Maxlt === '' ? '' : Number(item.Maxlt).toFixed(2),
            PMin: item.PMin === '' ? '' : Number(item.PMin).toFixed(2),
            PMax: item.PMax === '' ? '' : Number(item.PMax).toFixed(2)
        };
    }
}

const ReferenceRanges = {
    FetchLabReferenceMasters: 'FetchLabReferenceMasters?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchHospitalTestReference: 'FetchHospitalTestReference?Name=${Name}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchLabMethodReagentEquipment: 'FetchLabMethodReagentEquipment?TestID=${TestID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchTestComponentsreference: 'FetchTestComponentsreference?TestID=${TestID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchTestComponentsreferenceRange: 'FetchTestComponentsreferenceRange?TestID=${TestID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveComponentRanges: 'SaveComponentRanges'
};