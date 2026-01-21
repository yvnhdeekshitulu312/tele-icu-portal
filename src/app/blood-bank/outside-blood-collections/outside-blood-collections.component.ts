import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-outside-blood-collections',
    templateUrl: './outside-blood-collections.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE],
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
        DatePipe
    ],
})
export class OutsideBloodCollectionsComponent extends BaseComponent implements OnInit {
    errorMessages: any = [];
    facility: any;
    facilityId: any;
    viewForm: any;

    CollectionRefNo: any;
    hospitalName: any;
    selectedHospital: any;
    currentDate: any;
    itemsList: any = [];
    bloodDetailsItem: any;

    hospitalList: any;
    componentTypeList: any;
    bloodGroupList: any;
    bagTypeList: any;
    OutsideBloodCollectionID: any = '0';
    viewList: any = [];

    constructor(private us: UtilityService, private formBuilder: FormBuilder, private config: ConfigService) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
        var d = new Date();
        d.setDate(d.getDate()+1);
        this.viewForm = this.formBuilder.group({
            fromDate: new Date(),
            toDate: d
        });
        this.FetchMedicationDemographicsOBC();
        this.FetchSurgeryBloodComponents();
        this.initializeForm();
    }

    initializeForm() {
        this.bloodDetailsItem = {
            BBN: '',
            BGID: '',
            QTY: '',
            BTID: '',
            CID: '',
            EDT: new Date(),
            CDATE: new Date(),
            CTIME: this.getCurrentTime(),
            PCODE: '',
            PHTYPE: ''
        };
    }

    searchHospital(event: any) {
        const searchval = event.target.value;
        if (searchval.length > 2) {
            const url = this.us.getApiUrl(OutsideBloodCollections.FetchHospitalCompaniesOBC, {
                Filter: searchval,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code === 200) {
                        this.hospitalList = response.FetchHospitalCompaniesOBCDataList;
                    }
                },
                    () => {
                    })
        }
    }

    onSelectHospital(event: any) {
        const item = this.hospitalList.find((x: any) => x.CompanyName === event.option.value);
        this.selectedHospital = item;
        this.hospitalList = [];
    }

    FetchMedicationDemographicsOBC() {
        const url = this.us.getApiUrl(OutsideBloodCollections.FetchMedicationDemographicsOBC, {
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.bagTypeList = response.MedicationDemographicsFrequencyDataList;
                    this.bloodGroupList = response.MedicationDemographicsDurationDataList
                }
            },
                () => {
                })
    }

    FetchSurgeryBloodComponents() {
        const url = this.us.getApiUrl(OutsideBloodCollections.FetchSurgeryBloodComponents, {
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.componentTypeList = response.FetchSurgeryBloodComponentsFDataList;
                }
            },
                () => {
                })
    }

    getCurrentTime(): string {
        const now = new Date();
        const hours = this.padZero(now.getHours());
        const minutes = this.padZero(now.getMinutes());
        return `${hours}:${minutes}`;
    }

    padZero(value: number): string {
        return value < 10 ? '0' + value : value.toString();
    }

    onAddClick() {
        this.errorMessages = [];
        if (!this.bloodDetailsItem.BBN) {
            this.errorMessages.push('Please Enter Bag Number');
        }

        if (!this.bloodDetailsItem.BTID) {
            this.errorMessages.push('Please Select Bag Type');
        }

        if (!this.bloodDetailsItem.CID) {
            this.errorMessages.push('Please Select Component Type');
        }

        if (!this.bloodDetailsItem.BGID) {
            this.errorMessages.push('Please Select Blood Group');
        }

        if (!this.bloodDetailsItem.QTY) {
            this.errorMessages.push('Please Enter Quantity');
        }

        if (!this.bloodDetailsItem.PCODE) {
            this.errorMessages.push('Please Enter PCODE');
        }

        if (!this.bloodDetailsItem.PHTYPE) {
            this.errorMessages.push('Please Enter PHTYPE');
        }

        if (this.errorMessages.length > 0) {
            $('#errorMessagesModal').modal('show');
            return;
        }

        this.itemsList.push({
            ...this.bloodDetailsItem,
            bagType: this.bagTypeList.find((element: any) => element.Id === this.bloodDetailsItem.BTID)?.Names,
            componentType: this.componentTypeList.find((element: any) => element.ComponentId.toString() === this.bloodDetailsItem.CID)?.Component,
            bloodGroupType: this.bloodGroupList.find((element: any) => element.Id === this.bloodDetailsItem.BGID)?.Names,
            expiryDate: moment(this.bloodDetailsItem.EDT).format('DD-MMM-YYYY'),
            collectionDate: moment(this.bloodDetailsItem.CDATE).format('DD-MMM-YYYY') + ' ' + this.bloodDetailsItem.CTIME
        });

        this.initializeForm();
    }

    onDeleteClick(index: any) {
        this.itemsList.splice(index, 1);
    }

    onClearClick() {
        this.OutsideBloodCollectionID = '0';
        this.itemsList = [];
        this.CollectionRefNo = '';
        this.selectedHospital = null;
        this.hospitalName = '';
        this.currentDate = moment(new Date()).format('DD-MMM-YYYY H:mm');
        this.initializeForm();
    }

    onSaveClick() {
        this.errorMessages = [];
        if (!this.selectedHospital) {
            this.errorMessages.push('Please Select Hospital');
        }

        if (!this.CollectionRefNo) {
            this.errorMessages.push('Please Enter Collection Ref No.');
        }

        if (this.itemsList.length === 0) {
            this.errorMessages.push('Please Add Items');
        }

        if (this.errorMessages.length > 0) {
            $('#errorMessagesModal').modal('show');
            return;
        }

        const payload = {
            "OutsideBloodCollectionID": this.OutsideBloodCollectionID,
            "RefInstID": this.selectedHospital.CompanyID,
            "PatientID": "0",
            "PatientBloodGroupID": "0",
            "CollectionRefNo": this.CollectionRefNo,
            "Exchange": "",
            "BloodDetailsXML": this.itemsList.map((element: any) => {
                return {
                    "BBN": element.BBN,
                    "BGID": element.BGID,
                    "QTY": element.QTY,
                    "BTID": element.BTID,
                    "CID": element.CID,
                    "EDT": element.expiryDate,
                    "CDATE": element.collectionDate,
                    "PCODE": element.PCODE,
                    "PHTYPE": element.PHTYPE
                }
            }),
            "UserID": this.doctorDetails[0]?.UserId,
            "WorkStationID": this.facilityId,
            "HospitalID": this.hospitalID
        };
        this.us.post(OutsideBloodCollections.SaveOutsideBloodCollection, payload).subscribe((response) => {
            if (response.Code === 200) {
                this.onClearClick();
                $("#successMsgModal").modal('show');
            }
        },
            (err) => {
                console.log(err)
            });
    }

    onViewClick() {
        this.viewList = [];
        const url = this.us.getApiUrl(OutsideBloodCollections.FetchOutsideBloodCollectionView, {
            FromDate: moment(this.viewForm.get('fromDate').value).format('DD-MMM-YYYY'),
            ToDate: moment(this.viewForm.get('toDate').value).format('DD-MMM-YYYY'),
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.viewList = response.FetchOutsideBloodCollectionViewDataList;
                    $('#viewModal').modal('show');
                }
            },
                () => {
                })
    }

    onViewItemSelect(item: any) {
        this.onClearClick();
        const url = this.us.getApiUrl(OutsideBloodCollections.FetchOutsideBloodCollectionViewSelected, {
            OutsideBloodCollectionID: item.OutsideBloodCollectionID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.OutsideBloodCollectionID = item.OutsideBloodCollectionID;
                    $('#viewModal').modal('hide');
                    this.CollectionRefNo = response.FetchOutsideBloodCollectionViewSelectedDataList[0].CollectionRefNo;
                    this.hospitalName = response.FetchOutsideBloodCollectionViewSelectedDataList[0].HospitalName;
                    this.itemsList = response.FetchOutsideBloodCollectionViewSelectedData1List.map((element: any) => {
                        return {
                            BBN: element.BloodBagNo,
                            bagType: element.Bagtype,
                            componentType: element.Component,
                            bloodGroupType: element.BloodGroup,
                            QTY: element.Quantity,
                            expiryDate: element.Expirydate,
                            collectionDate: element.CollectedDate,
                            PCODE: element.ProductCode,
                            PHTYPE: element.PhenoType
                        }
                    });
                }
            },
                () => {
                })
    }
}

export const OutsideBloodCollections = {
    FetchHospitalCompaniesOBC: 'FetchHospitalCompaniesOBC?Filter=${Filter}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchMedicationDemographicsOBC: 'FetchMedicationDemographicsOBC?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchSurgeryBloodComponents: 'FetchSurgeryBloodComponents?HospitalID=${HospitalID}',
    SaveOutsideBloodCollection: 'SaveOutsideBloodCollection',
    FetchOutsideBloodCollectionView: 'FetchOutsideBloodCollectionView?FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchOutsideBloodCollectionViewSelected: 'FetchOutsideBloodCollectionViewSelected?OutsideBloodCollectionID=${OutsideBloodCollectionID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}