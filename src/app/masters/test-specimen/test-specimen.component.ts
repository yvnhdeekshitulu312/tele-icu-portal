import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { forkJoin } from "rxjs";
import { BaseComponent } from "src/app/shared/base.component";
import { UtilityService } from "src/app/shared/utility.service";

declare var $: any;

@Component({
    selector: 'app-test-specimen',
    templateUrl: './test-specimen.component.html'
})
export class TestSpecimenComponent extends BaseComponent implements OnInit {
    testsCollection: any = [];
    facility: any;
    specimenList: any = [];

    testSpecimenForm: any;
    addForm: any;
    testSpecimenCollection: any = [];
    unitsCollection: any = [];
    errorMessages: any = [];

    constructor(private us: UtilityService, private fb: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.fetchUnits();
        this.initializaForm();
        this.initializeAddForm();
    }

    initializaForm() {
        this.testSpecimenForm = this.fb.group({
            Code: '',
            TestName: '',
            TestId: '',
        });
    }

    initializeAddForm() {
        this.addForm = this.fb.group({
            units: '0',
            qty: '',
            specimen: '',
            specimenId: ''
        });
    }

    onAddClick() {
        this.errorMessages = [];

        if (!this.addForm.get('specimenId').value) {
            this.errorMessages.push('Please Select Specimen');
        }

        if (this.errorMessages.length > 0) {
            $('#errorMessageModal').modal('show');
            return;
        }
        this.testSpecimenCollection.push({
            Specimen: this.addForm.get('specimen').value,
            QNTY: this.addForm.get('qty').value,
            Units: this.unitsCollection.find((e: any) => e.UoMID.toString() === this.addForm.get('units').value.toString())?.UOM,
            Expiry: '',
            Containername: '',
            DeviceName: '',
            SpecimenID: this.addForm.get('specimenId').value,
            SPID: this.addForm.get('specimenId').value,
            TestSpecimenID: '', // TODO
            TSTSPID: '' // TODO
        });
        this.initializeAddForm();
    }

    fetchUnits() {
        const url = this.us.getApiUrl(TestSpecimen.FetchModuleUoMs, {
            Modelid: 18,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.unitsCollection = response.FetchModuleUoMsList;
                }
            },
                () => {
                });
    }

    searchTests(event: any) {
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(TestSpecimen.FetchHospitalTestAdv, {
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
        this.testSpecimenForm.patchValue({
            Code: selectedTest.CODE,
            TestName: selectedTest.Name,
            TestId: selectedTest.TestId
        });
        const url = this.us.getApiUrl(TestSpecimen.FetchTestSpecimens, {
            TestID: selectedTest.TestId,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe(response => {
            if (response.Code === 200) {
                this.testSpecimenCollection = response.FetchTestSpecimensDataList;
            }
        });
    }

    searchSpecimen(event: any) {
        if (event.target.value.length > 2) {
            const url = this.us.getApiUrl(TestSpecimen.FetchAdminMasters, {
                Type: 33,
                Filter: `name like '${event.target.value}%'`,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: 3395,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.specimenList = response.AdminMastersInstructionsDataList;
                    }
                },
                    (err) => {
                    })
        } else {
            this.specimenList = [];
        }
    }

    onSpecimenSelected(item: any) {
        this.specimenList = [];
        setTimeout(() => {
            this.addForm.patchValue({
                specimen: item.name,
                specimenId: item.id
            });
        }, 0);
    }

    onClearClick() {
        this.initializeAddForm();
        this.initializaForm();
        this.testSpecimenCollection = [];
    }

    onSaveClick() {
        this.errorMessages = [];

        if (!this.testSpecimenForm.get('TestId').value) {
            this.errorMessages.push('Please Select Test');
        }

        if (this.errorMessages.length > 0) {
            $('#errorMessageModal').modal('show');
            return;
        }

        const SpecimenXml = this.testSpecimenCollection.map((element: any, index: number) => {
            return {
                TSTSPID: element.TSTSPID,
                TESTSPECIMENID: element.TestSpecimenID,
                SPID: element.SPID,
                SPECIMENID: element.SpecimenID,
                SPECIMEN: element.Specimen,
                QNTY: element.QNTY ?? 0,
                SLNO: index + 1,
            }
        });
        const payload = {
            TestId: this.testSpecimenForm.get('TestId').value,
            USERID: this.doctorDetails[0]?.UserId,
            WORKSTATIONID: this.facility.FacilityID,
            HospitalID: this.hospitalID,
            SpecimenXml
        };

        console.log(payload);
        this.us.post(TestSpecimen.SaveTestSpecimens, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                this.onClearClick();
            }
        });
    }

    removeItem(index: number) {
        this.testSpecimenCollection.splice(index, 1);
    }
}

const TestSpecimen = {
    FetchHospitalTestAdv: 'FetchHospitalTestAdv?DisplayName=${DisplayName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchTestSpecimens: 'FetchTestSpecimens?TestID=${TestID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    //FetchAdminMasterss: 'FetchAdminMasterss?DisplayName=${DisplayName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchAdminMasters: 'FetchAdminMasters?Type=${Type}&Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveTestSpecimens: 'SaveTestSpecimens',
    FetchModuleUoMs: 'FetchModuleUoMs?Modelid=${Modelid}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}