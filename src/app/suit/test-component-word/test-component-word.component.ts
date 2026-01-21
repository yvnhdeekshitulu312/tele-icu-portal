import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { PatientfoldermlComponent } from 'src/app/shared/patientfolderml/patientfolderml.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

declare var $: any;

@Component({
    selector: 'app-test-component-word',
    templateUrl: './test-component-word.component.html',
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
export class TestComponentWordComponent extends BaseComponent implements OnInit {
    componentForm: any;

    fetchedItemsList: any = [];
    itemNameSearchText: any;
    totalItemsCount: any = 0;
    currentPage: number = 0;
    errorMsg: string = '';
    componentsList: any;
    showNoRecFound: boolean = true;
    testComponentWordDataList: any = [];
    sortedGroupedByOrderDate: any = [];
    ValidationMsgg: any = "No Orders for the Day";
    constructor(private us: UtilityService, private fb: FormBuilder, private datepipe: DatePipe, private router: Router,private ms: GenericModalBuilder) {
        super();
    }

    ngOnInit(): void {
        this.componentForm = this.fb.group({
            FromDate: new Date(),
            ToDate: new Date(),
            TestName: [''],
            SelectedTest: undefined,
            ComponentID: [''],
            SearchText: ['']
        });
    }

    openItemSearchModal() {
        this.clearSearch();
        $('#itemSearchModal').modal('show');
    }

    clearSearch() {
        this.fetchedItemsList = [];
        this.currentPage = 0;
        this.totalItemsCount = 0
        this.itemNameSearchText = '';
    }

    searchItems(event: any) {
        if (event.target.value.length > 2) {
            this.itemNameSearchText = event.target.value;
            this.fetchItems(1, 20, 1);
        }
    }

    onTestItemSelected(item: any) {
        this.fetchedItemsList = [];
        this.componentForm.patchValue({
            TestName: item.Name,
            SelectedTest: item
        });
        this.FetchTestComponents();
    }

    fetchItems(min: number = 1, max: number = 10, currentPage: number = 1) {
        if (this.itemNameSearchText) {
            const url = this.us.getApiUrl(TestComponentWord.FetchHistoPathologyTestSearch, {
                min,
                max,
                Name: this.itemNameSearchText,
                UserID: this.doctorDetails[0].UserId,
                WorkStationID: this.facilitySessionId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.fetchedItemsList = response.FetchHospitalTestReferenceDataList;
                        this.currentPage = currentPage;
                        this.totalItemsCount = Number(response.FetchHistoPathologyTestSearchCountList[0]?.Count);
                    }
                },
                    (_) => {
                    });
        } else {
            this.fetchedItemsList = [];
            this.currentPage = 0;
            this.totalItemsCount = 0;
            this.errorMsg = 'Please enter search text';
            $('#errorMsg').modal('show');
        }
    }

    handlePageChange(event: any) {
        this.fetchItems(event.min, event.max, event.currentPage);
    }

    onItemSelection(item: any) {
        this.fetchedItemsList.forEach((element: any) => {
            if (element.TestId === item.TestId) {
                element.selected = !element.selected;
            } else {
                element.selected = false;
            }
        });
    }

    onSelectBtnClick() {
        const selectedItem = this.fetchedItemsList.find((item: any) => item.selected);
        if (selectedItem) {
            this.componentForm.patchValue({
                TestName: selectedItem.Name,
                SelectedTest: selectedItem
            });
            this.FetchTestComponents();
            $('#itemSearchModal').modal('hide');
        }
    }

    FetchTestComponents() {
        this.componentsList = [];
        this.componentForm.patchValue({
            ComponentID: ''
        });
        const testID = this.componentForm.value.SelectedTest?.TestId;
        const url = this.us.getApiUrl(TestComponentWord.FetchTestComponentsHistoWord, {
            TestID: testID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilitySessionId,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.componentsList = response.FetchTestComponentsHistoWordDataList;
                }
            },
                (_) => {
                });
    }

    fetchTestComponentWordData() {
        if (!this.componentForm.value.SelectedTest) {
            this.errorMsg = 'Please select a Test';
            $('#errorMsg').modal('show');
            return;
        }
        // if (!this.componentForm.value.ComponentID) {
        //     this.errorMsg = 'Please select a Component';
        //     $('#errorMsg').modal('show');
        //     return;
        // }

        if (!this.componentForm.value.SearchText) {
            this.errorMsg = 'Please enter search KeyWord';
            $('#errorMsg').modal('show');
            return;
        }
        var FromDate = this.datepipe.transform(this.componentForm.value.FromDate, "dd-MMM-yyyy")?.toString();
        var ToDate = this.datepipe.transform(this.componentForm.value.ToDate, "dd-MMM-yyyy")?.toString();

        const url = this.us.getApiUrl(TestComponentWord.FetchTestComponentWordSearch, {
            TestID: this.componentForm.value.SelectedTest?.TestId==undefined?0:this.componentForm.value.SelectedTest?.TestId,
            ComponentID: this.componentForm.value.ComponentID==''?0:this.componentForm.value.SelectedTest?.TestId,
            SearchText: this.componentForm.value.SearchText,
            FromDate,
            ToDate,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilitySessionId,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.testComponentWordDataList = response.FetchTestComponentWordSearchDataList;

                    if (this.testComponentWordDataList.length > 0) {
                        this.showNoRecFound = false;
                    }
                    else {
                        this.showNoRecFound = true;
                    }
                    this.testComponentWordDataList.forEach((element: any, index: any) => {
          element.Class = "worklist_card gx-2 p-2 rounded-2 mx-0 row";
          element.Selected = false;

          if (element.OrderStatus === "1")
            element.AClass = "NewRequest";
          if (element.OrderStatus === "3")
            element.AClass = "SampleCollected";
          if (element.OrderStatus === "4")
            element.AClass = "SampleAck";
          if (element.OrderStatus === "7")
            element.AClass = "ResultEntered";
          if (element.OrderStatus === "8")
            element.AClass = "ResultVerified";
          if (element.OrderStatus === "13")
            element.AClass = "SampleRejected";
          if (element.OrderStatus === "12")
            element.AClass = "PartialSampleCollected";
          if (element.OrderStatus === "-1")
            element.AClass = "TestRecollect";

        });

                    const groupedByOrderDate = this.testComponentWordDataList.reduce((acc: any, current: any) => {
                        const orderDate = current.OrderDate.split(' ')[0]; // Extract date part only
                        if (!acc[orderDate]) {
                            acc[orderDate] = [];
                        }
                        acc[orderDate].push(current);

                        return acc;
                    }, {});


                    this.sortedGroupedByOrderDate = Object.entries(groupedByOrderDate)
                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                        .map(([orderDate, items]) => ({ orderDate, items }));
                }
            },
                (_) => {
                });
    }

    clearTestComponentWordForm() {
        this.componentForm.patchValue({
            FromDate: new Date(),
            ToDate: new Date(),
            TestName: '',
            SelectedTest: undefined,
            ComponentID: '',
            SearchText: ''
        });
        this.componentsList = [];
        this.testComponentWordDataList = [];
        this.sortedGroupedByOrderDate = [];
    }
    openPatientSummary(item: any, event: any) {
        event.stopPropagation();
        sessionStorage.setItem("PatientDetails", JSON.stringify(item));
        sessionStorage.setItem("selectedView", JSON.stringify(item));
        sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
        sessionStorage.setItem("PatientID", item.PatientID);
        sessionStorage.setItem("SummaryfromCasesheet", "true");
    
        const options: NgbModalOptions = {
          windowClass: 'vte_view_modal'
        };
       
        const modalRef = this.ms.openModal(PatientfoldermlComponent, {
          data: item,
          readonly: true,
          selectedView: item
        }, options);
      }

    navigateToResultEntry(wrk: any) {
        const url = this.us.getApiUrl(TestComponentWord.FetchlabRequisitionHisto, {
            TestOrderID: wrk.TestOrderID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facilitySessionId,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    wrk.GenderId = wrk.GenderID;
                    wrk.mobileno = wrk.MobileNo;
                    wrk.IPID = wrk.AdmissionID;
                    wrk.PatientType = wrk.PatientTypeID;
                    wrk.OrderSlNo = wrk.ORDERSLNO;
                    wrk.SampleNumber = response.FetchlabRequisitionHistoDataList[0]?.SampleNumber;
                    wrk.SampleCollectedAt = response.FetchlabRequisitionHistoDataList[0]?.SampleCollectedAt;
                    wrk.Test = response.FetchlabRequisitionHistoDataList[0]?.Test;
                    sessionStorage.setItem("fromLabResultRelease", "false");
                    sessionStorage.setItem("fromTestComponentWord", "true");
                    sessionStorage.setItem("selectedPatientData", JSON.stringify(wrk));
                    sessionStorage.setItem("selectedPatientLabData", JSON.stringify(wrk));
                    this.router.navigate(['/suit/lab-resultentry']);
                }
            });
    }
}

const TestComponentWord = {
    FetchTestComponentsHistoWord: 'FetchTestComponentsHistoWord?TestID=${TestID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchHistoPathologyTestSearch: 'FetchHistoPathologyTestSearch?min=${min}&max=${max}&Name=${Name}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchTestComponentWordSearch: 'FetchTestComponentWordSearch?TestID=${TestID}&ComponentID=${ComponentID}&SearchText=${SearchText}&FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchlabRequisitionHisto: "FetchlabRequisitionHisto?TestOrderID=${TestOrderID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}"
}