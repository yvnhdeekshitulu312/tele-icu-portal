import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-test-components',
    templateUrl: './test-components.component.html',
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
export class TestComponentsComponent extends BaseComponent implements OnInit {
    facility: any;
    facilityId: any;
    errorMessages: any = [];
    testsCollection: any = [];
    testComponentsCollection: any = [];
    componentsCollection: any = [];
    selectedTest: any;

    constructor(private us: UtilityService) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
    }

    searchTestName(event: any) {
        let filter = event.target.value;
        this.testsCollection = [];
        if (filter.length > 2) {
            const payload: any = {
                Name: filter,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            };
            const url = this.us.getApiUrl(TestComponents.FetchHospitalTestReference, payload)
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.testsCollection = response.FetchHospitalTestReferenceDataList;
                }
            });
        } else {
            this.testsCollection = [];
        }
    }

    onTestNameSelection(item: any) {
        this.selectedTest = item;
        this.testComponentsCollection = [];
        this.testsCollection = [];
        const payload: any = {
            TestID: item.TestId,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        };
        const url = this.us.getApiUrl(TestComponents.FetchTestComponentSSP, payload)
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                response.FetchTestComponentSSPDataList.forEach((element: any) => {
                    this.testComponentsCollection.push(element);
                });
            }
        });

        setTimeout(() => {
            $('#textbox_test_name').val('');
        }, 500);
    }

    searchComponentName(event: any) {
        let filter = event.target.value;
        this.componentsCollection = [];
        if (filter.length > 2) {
            const payload: any = {
                Name: filter,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            };
            const url = this.us.getApiUrl(TestComponents.FetchHospitalTestComponentsSP, payload)
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.componentsCollection = response.FetchHospitalTestComponentsDataList;
                }
            });
        } else {
            this.componentsCollection = [];
        }
    }

    onComponentNameSelection(item: any) {
        this.componentsCollection = [];
        const payload: any = {
            CompID: item.ComponentID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        };
        const url = this.us.getApiUrl(TestComponents.FetchHospitalTestComponentsSelected, payload)
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                response.FetchHospitalTestComponentsSelectedDataList.forEach((element: any) => {
                    this.testComponentsCollection.push(element);
                });
            }
        });

        setTimeout(() => {
            $('#textbox_component_name').val('');
        }, 500);
    }

    deleteTestComponent(index: any) {
        this.testComponentsCollection.splice(index, 1);
    }

    moveUp(index: number): void {
        if (index > 0) {
            [this.testComponentsCollection[index], this.testComponentsCollection[index - 1]] = [this.testComponentsCollection[index - 1], this.testComponentsCollection[index]];
        }
    }

    moveDown(index: number): void {
        if (index < this.testComponentsCollection.length - 1) {
            [this.testComponentsCollection[index], this.testComponentsCollection[index + 1]] = [this.testComponentsCollection[index + 1], this.testComponentsCollection[index]];
        }
    }

    clearForm() {
        $('#textbox_component_name').val('');
        $('#textbox_test_name').val('');
        this.testsCollection = [];
        this.componentsCollection = [];
        this.testComponentsCollection = [];
        this.selectedTest = null;
    }

    saveTestComponents() {
        this.errorMessages = [];
        if (!this.selectedTest) {
            this.errorMessages.push('Please Select Test');
        }
        if (this.errorMessages.length > 0) {
            $('#errorMsg').modal('show');
            return;
        }
        const FetchTestComponentSSPDataList = this.testComponentsCollection.map((element: any, index: any) => {
            return {
                CMPID: element.CMPID || element.ComponentID,
                CONTROLTYPE: element.ControlType,
                PARAMETERID: element.CMPID || element.ComponentID,
                PARAMETERNAME: element.ParameterName || element.Name,
                PARAMETERTYPE: element.ParameterType || element.ResultType,
                UNITID: "",
                UNITNAME: "",
                SEQ: index + 1,
                CHECKVALUE: 1,
                ISR: 0
            }
        });
        const payload = {
            TestId: this.selectedTest.TestId,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID,
            FetchTestComponentXML : FetchTestComponentSSPDataList
        };
        this.us.post(TestComponents.SaveTestComponents, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                this.clearForm();
            }
        });
    }
}

export const TestComponents = {
    FetchHospitalTestReference: 'FetchHospitalTestReference?Name=${Name}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchTestComponentSSP: 'FetchTestComponentSSP?TestID=${TestID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchHospitalTestComponentsSP: 'FetchHospitalTestComponentsSP?Name=${Name}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchHospitalTestComponentsSelected: 'FetchHospitalTestComponentsSelected?CompID=${CompID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveTestComponents: 'SaveTestComponents'
};
