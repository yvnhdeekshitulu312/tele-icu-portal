import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { forkJoin } from "rxjs";
import { BaseComponent } from "src/app/shared/base.component";
import { UtilityService } from "src/app/shared/utility.service";

declare var $: any;

@Component({
    selector: 'app-test-definition',
    templateUrl: './test-definition.component.html'
})
export class TestDefinitionComponent extends BaseComponent implements OnInit {
    testsCollection: any = [];
    facility: any;
    SpecialisationList: any = [];

    testDefinitionForm: any;
    addForm: any;
    testAgesCollection: any = [];
    testHospitalsCollection: any = [];

    genderCollection: any = [
        { id: '1', value: 'Male' },
        { id: '2', value: 'Female' },
        { id: '3', value: 'Others' },
        { id: '4', value: 'Unknown' },
        { id: '5', value: 'Ambigous' }
    ];

    ageCollection: any = [
        { id: '1', value: 'Years' },
        { id: '2', value: 'Months' },
        { id: '3', value: 'Days' },
        { id: '4', value: 'Hours' },
        { id: '5', value: 'Minutes' },
    ];

    constructor(private us: UtilityService, private fb: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.initializaForm();
        this.initializaAddForm();
    }

    initializaForm() {
        this.testDefinitionForm = this.fb.group({
            Code: '',
            TestName: '',
            TestId: '',
            Synonym: '',
            Abbreviation: '',
            Specialisation: '',
            SpecialiseID: '',
            TimeUnit: '0',
            TotTestTime: '',
            MaxCount: '',
            MaxUoMID: '0',
            Maxperiod: '',
            IsStatTest: false,
            NeedClinicalHstry: false,
            IsNONSTAT: false,
            IsMultiObservation: false,
            HasZoneDiameter: false,
            IsPreventive: false,
            IsExternal: false,
            IsBedside: false,
            Isresult: '4'
        });
    }

    initializaAddForm() {
        this.addForm = this.fb.group({
            gender: ['0', [Validators.required, Validators.min(1)]],
            ageFrom: ['', [Validators.required, Validators.min(0)]],
            ageFromUoMID: ['0', [Validators.required, Validators.min(1)]],
            ageTo: ['', [Validators.required, Validators.min(0)]],
            ageToUoMID: ['0', [Validators.required, Validators.min(1)]]
        });
    }

    onAddClick() {
        this.testAgesCollection.push({
            "Gender": this.addForm.get('gender').value,
            "GenderName": this.genderCollection.find((e: any) => e.id === this.addForm.get('gender').value)?.value,
            "Frmage": this.addForm.get('ageFrom').value,
            "FRMUOM": this.addForm.get('ageFromUoMID').value,
            "FromAgeUoM": this.ageCollection.find((e: any) => e.id === this.addForm.get('ageFromUoMID').value)?.value,
            "TOAGE": this.addForm.get('ageTo').value,
            "TOUOM": this.addForm.get('ageToUoMID').value,
            "ToAgeUoM": this.ageCollection.find((e: any) => e.id === this.addForm.get('ageToUoMID').value)?.value,
        });
        this.initializaAddForm();
    }

    searchTests(event: any) {
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(TestDefinition.FetchHospitalTestAdv, {
                DisplayName: searchval,
                UserID: this.doctorDetails[0]?.UserId,
                WorkStationID: this.facility.FacilityID,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.testsCollection = response.FetchHospitalTestAdvList1;
                    }
                },
                    () => {
                    });
        } else {
            this.testsCollection = [];
        }
    }

    onSelectTest(event: any) {
        const selectedTest = this.testsCollection.find((x: any) => x.Name === event.option.value);
        this.testsCollection = [];
        const testURL = this.us.getApiUrl(TestDefinition.FetchTest, {
            TestID: selectedTest.TestId,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });
        this.us.get(testURL).subscribe(response => {
            if (response.Code === 200) {
                this.testAgesCollection = response.FetchTestData3List;
                this.testHospitalsCollection = response.FetchTestData2List;
                this.testDefinitionForm.patchValue({
                    Code: response.FetchTestData1List[0].Code,
                    TestName: response.FetchTestData1List[0].TestName,
                    TestId: response.FetchTestData1List[0].TestId,
                    Synonym: response.FetchTestData1List[0].Synonym,
                    Abbreviation: response.FetchTestData1List[0].Abbreviation,
                    Specialisation: response.FetchTestData1List[0].Specialisation,
                    SpecialiseID: response.FetchTestData1List[0].SpecialiseID,
                    TimeUnit: response.FetchTestData1List[0].TimeUnit ? response.FetchTestData1List[0].TimeUnit : '0',
                    TotTestTime: response.FetchTestData1List[0].TotTestTime,
                    MaxCount: response.FetchTestData1List[0].MaxCount,
                    MaxUoMID: response.FetchTestData1List[0].MaxUoMID ? response.FetchTestData1List[0].MaxUoMID : '0',
                    Maxperiod: response.FetchTestData1List[0].Maxperiod,
                    IsStatTest: response.FetchTestData1List[0].IsStatTest.toString() === 'TRUE' ? true : false,
                    NeedClinicalHstry: response.FetchTestData1List[0].NeedClinicalHstry.toString() === 'TRUE' ? true : false,
                    IsNONSTAT: response.FetchTestData1List[0].IsNONSTAT.toString() === 'TRUE' ? true : false,
                    IsMultiObservation: response.FetchTestData1List[0].IsMultiObservation.toString() === 'TRUE' ? true : false,
                    HasZoneDiameter: response.FetchTestData1List[0].HasZoneDiameter.toString() === 'TRUE' ? true : false,
                    IsPreventive: response.FetchTestData1List[0].IsPreventive.toString() === 'TRUE' ? true : false,
                    IsExternal: response.FetchTestData1List[0].IsExternal.toString() === 'TRUE' ? true : false,
                    IsBedside: response.FetchTestData1List[0].IsBedside.toString() === 'TRUE' ? true : false,
                    Isresult: response.FetchTestData1List[0].Isresult
                });
            }
        });
    }

    searchSpecialisation(event: any) {
        if (event.target.value.length > 2) {
            const url = this.us.getApiUrl(TestDefinition.FetchSpecialisationProcedures, {
                DisplayName: event.target.value,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: 3395,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.SpecialisationList = response.FetchSpecialisationProceduresDataList;
                    }
                },
                    (err) => {
                    })
        } else {
            this.SpecialisationList = [];
        }
    }

    onSpecialisationSelected(item: any) {
        this.SpecialisationList = [];
        this.testDefinitionForm.patchValue({
            Specialisation: item.Name,
            SpecialiseID: item.ID
        });
    }

    changeCheckboxSelection(type: any) {
        const value = this.testDefinitionForm.get(type).value;
        this.testDefinitionForm.get(type).setValue(!value);
    }

    onResultTypeSelection() {
        const value = this.testDefinitionForm.get('Isresult').value;
        if (value === '4') {
            this.testDefinitionForm.get('Isresult').setValue('7');
        } else {
            this.testDefinitionForm.get('Isresult').setValue('4');
        }
    }

    onClearClick() {
        this.initializaAddForm();
        this.initializaForm();
        this.testAgesCollection = [];
        this.testHospitalsCollection = [];
    }

    onSaveClick() {
        const TestHospitalXml = this.testHospitalsCollection.map((element: any) => {
            return {
                LOCATION: element.Hospital,
                AVAILABLEON: element.Avail,
                HOSP: element.HOSP,
                AVAIL: element.Avail,
                ISDAY: element.IsDay,
                CRITERIA: '',
                BLOCKED: '',
                RATIME: '',
                RAUOMID: '',
                COTIME: '',
                IXT: '',
                PFTY: '',
            }
        });

        const TestAgeXml = this.testAgesCollection.map((element: any, index: any) => {
            return {
                SLNO: index + 1,
                ID: element.ID,
                GENDER: element.Gender,
                GENDERNAME: element.GenderName,
                FRMAGE: element.Frmage,
                FRMUOM: element.FRMUOM,
                FROMAGEUOM: element.FromAgeUoM,
                TOAGE: element.TOAGE,
                TOUOM: element.TOUOM,
                TOAGEUOM: element.ToAgeUoM,
            }
        });

        const { TestId, TestName, Synonym, Abbreviation, IsStatTest, NeedClinicalHstry,
            TotTestTime, TimeUnit, IsExternal, MaxCount, Maxperiod, MaxUoM, IsMultiObservation, Code,
            HasZoneDiameter, Isresult, IsPreventive, IsNONSTAT
        } = this.testDefinitionForm.value;
        const payload = {
            TestId: TestId ?? 0,
            Name: TestName,
            Synonym,
            Abbreviation,
            QRFNO: '',
            IsStatTest,
            NeedClinicalHstry,
            TottestTime: TotTestTime,
            Timeunit: TimeUnit,
            IsExternal,
            MaxCount,
            Maxperiod,
            MaxUoM,
            PatientType: '',
            InstPatient: '',
            InstPhleboto: '',
            EduMaterial: '',
            Remark: '',
            Availablity: '',
            IsMultiObservation,
            SelectMethod: '',
            CODE: Code,
            HasZoneDiameter,
            TestHospitalXml,
            TestAgeXml,
            PrintNotes: '',
            Synonym2l: '',
            Abbreviation2l: '',
            Name2l: '',
            Remark2l: '',
            InstPatient2L: '',
            InstPhleboto2L: '',
            EduMaterial2L: '',
            USERID: this.doctorDetails[0]?.UserId,
            WORKSTATIONID: this.facility.FacilityID,
            Error: '',
            FeatureId: '',
            FunctionId: '',
            CallContext: '',
            IsBedside: '',
            isresult: Isresult,
            IsWebreport: '',
            IsProfChargesApplicable: '',
            Providers: '',
            IsPreventive,
            IsHighValued: '',
            IsNONSTAT,
            HospitalID: this.hospitalID,
        };

        console.log(payload);
        // this.us.post(TestDefinition.InsertTest, payload).subscribe((response: any) => {
        //     if (response.Code === 200) {
        //         $('#savemsg').modal('show');
        //         this.onClearClick();
        //     }
        // });
    }
}

const TestDefinition = {
    FetchHospitalTestAdv: 'FetchHospitalTestAdv?DisplayName=${DisplayName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchTest: 'FetchTest?TestID=${TestID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchTestResources: 'FetchTestResources?TestID=${TestID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchSpecialisationProcedures: 'FetchSpecialisationProcedures?DisplayName=${DisplayName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    InsertTest: 'InsertTest'
}