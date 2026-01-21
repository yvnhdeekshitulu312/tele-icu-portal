import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';

declare var $: any;

@Component({
    selector: 'app-indent-issue-details',
    templateUrl: './indent-issue-details.component.html',
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
export class IndentIssueDetailsComponent extends BaseComponent implements OnInit {
    facility: any;
    indentIssue: any;
    issuingOrderData: any;
    currentDate: any = moment().format('DD-MMM-YYYY HH:mm');
    FetchIndentOrdersForIssuingDataDataList: any;
    errorMsg: any;
    FetchDeptItemStockRDSDataList: any;
    rdsModalLabel: any;
    issuingOrderDataDisable: any;
    SaveDisable: any = 0;
    IssueID: any = 0;
    FetchlastIndentIssueItemsDataList: any;
    trustedUrl: any;
    constructor(private router: Router, private us: UtilityService, private modalSvc: NgbModal) {
        super();
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.indentIssue = JSON.parse(sessionStorage.getItem("indentIssueItem") || '{}');

        if (this.indentIssue.Status == '3')
            this.SaveDisable = 1;
        else
            this.SaveDisable = 0;

        if (this.indentIssue.IndentID) {
            this.getIndentIssueDetails();
        } else {
            this.router.navigate(['/substore/indent-issue'])
        }
    }

    getIndentIssueDetails() {
        const url = this.us.getApiUrl(indentIssueDetails.FetchIndentOrdersIssueDetails, {
            FromDate: this.indentIssue.fromDate,
            ToDate: this.indentIssue.toDate,
            ToDeptID: this.facility.FacilityID,
            IndentID: this.indentIssue.IndentID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.issuingOrderData = response.FetchIndentOrdersForIssuingOrderDataList[0];
                    if (response.FetchIndentOrdersForIssuingOrderDataList.length > 0)
                        this.IssueID = this.issuingOrderData.IssueID;
                    this.issuingOrderDataDisable = response.FetchIndentOrdersForIssuingDataDataList.filter((x: any) => x.SaveDisable === 0);
                    //    if(this.issuingOrderDataDisable.length==0)
                    //        this.SaveDisable=1;
                    //     else
                    //     this.SaveDisable=0;
                    this.FetchIndentOrdersForIssuingDataDataList = response.FetchIndentOrdersForIssuingDataDataList;
                    this.FetchIndentOrdersForIssuingDataDataList.forEach((item: any) => {
                        if (item.ItemId) {
                            item.unitsList = response.FetchIndentOrdersForIssuingUnitsDataList.filter((unit: any) => unit.ItemID.toString() === item.ItemId.toString());
                        }
                    });
                }
            },
                () => {
                });
    }


    FetchlastIndentIssueItems(item: any) {
        this.rdsModalLabel = item.Item;
        const url = this.us.getApiUrl(indentIssueDetails.FetchlastIndentIssueItems, {
            ItemID: item.ItemId,
            FromWokstationID: this.facility.FacilityID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.indentIssue.FromDeptID,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.FetchlastIndentIssueItemsDataList = response.FetchlastIndentIssueItemsDataList;
                    $('#previousDiagnosis').modal('show');
                }
            },
                () => {
                });
    }


    onBackClick() {
        this.router.navigate(['/substore/indent-issue'])
    }

    ngOnDestroy() {
        sessionStorage.removeItem('indentIssueItem');
    }

    onSaveClick() {
        let items = cloneDeep(this.FetchIndentOrdersForIssuingDataDataList)
        items.forEach((element: any) => {
            delete element.unitsList;
        });
        const differItems = items.filter((element: any) => {
            return element.DueQty > (element.OrQty);
        });
        // if (differItems.length > 0) {
        //     this.errorMsg = "Entered Quantity should not greater than Ordered Quantity."
        //     $('#errorMsg').modal('show');
        //     return;
        // }
        const payload = {
            "IssueID": this.IssueID == '' ? 0 : this.IssueID,
            "IndentIssueSLNO": "",
            "FromDeptID": this.indentIssue.FromDeptID,
            "ToDeptID": this.indentIssue.ToDeptID,
            "IndentID": this.indentIssue.IndentID,
            "Status": this.indentIssue.Status,
            "IssueType": "1",
            "ReferenceNo": this.indentIssue.ReferenceNo,
            "Items": items,
            "UserID": this.doctorDetails[0]?.UserId,
            "WorkStationID": this.facility.FacilityID,
            "HospitalID": this.hospitalID
        };

        const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
            backdrop: 'static'
        });
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
            if (data.success) {
                this.us.post(indentIssueDetails.SaveIndentIssue, payload)
                    .subscribe((response: any) => {
                        if (response.Code === 200) {
                            $('#successMsgModal').modal('show');
                            this.SaveDisable = 1;
                            this.getIndentIssueDetails();
                        }
                    },
                        () => {
                        });
            }
            modalRef.close();
        });
    }

    onUnitChange(item: any) {
        item.OrQty = item.MainQty;

        const selectedUnit = item.unitsList.find((a: any) => a.UoMID === item.UID);

        const selectedUnitG = item.unitsList.find((a: any) => a.UoMID != item.UID);
        if (selectedUnit) {
            item.QOH = selectedUnit.QOH;
            // if(item.UID==item.OrdUID)     
            //   item.OrQty = item.MainQty*selectedUnit.intOrdQtyFactor;   
            // else 
            item.OrQty = item.OrQty * selectedUnitG.intOrdQtyFactor;

            item.DueQty = Number(item.OrQty) - Number(item.IssQty * selectedUnitG.intOrdQtyFactor);

            item.Qty = '';
        }
    }

    onQuantityChange(item: any) {
        if ((Number(item.DueQty) + Number(item.IssQty)) > Number(item.OrQty)) {
            item.DueQty = 0;
            item.DueQty = item.DueQtyC;
            this.errorMsg = "Entered Quantity should not greater than Ordered Quantity for " + item.Item + "";
            $('#errorMsg').modal('show');
            return;
        }
    }

    openRDS(item: any) {
        const url = this.us.getApiUrl(indentIssueDetails.FetchDeptItemStockRDS, {
            ItemID: item.ItemId,
            FromDeptID: this.issuingOrderData.FromDeptID,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200 && response.FetchDeptItemStockRDSDataList.length > 0) {
                    this.rdsModalLabel = item.Item;
                    this.FetchDeptItemStockRDSDataList = response.FetchDeptItemStockRDSDataList;
                    $('#rdsModal').modal('show');
                }
            },
                () => {
                });
    }
    PatientPrintCard() {
        const url = this.us.getApiUrl(indentIssueDetails.FetchIndentOrdersDetailsPrint, {
            IndentID: this.indentIssue.IndentID,
            UserName: this.doctorDetails[0]?.UserName + '-' + this.doctorDetails[0]?.EmployeeName,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.trustedUrl = response?.FTPPATH;
                    this.showModal()
                }
            },
                () => {
                });
    }

    PatientPrintCardOrder() {
        const url = this.us.getApiUrl(indentIssueDetails.FetchIndentOrdersPrint, {
            IndentID: this.indentIssue.IndentID,
            UserName: this.doctorDetails[0]?.UserName + '-' + this.doctorDetails[0]?.EmployeeName,
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });

        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code === 200) {
                    this.trustedUrl = response?.FTPPATH;
                    this.showModal()
                }
            },
                () => {
                });
    }
    showModal(): void {
        $("#caseRecordModal").modal('show');
    }
}

export const indentIssueDetails = {
    FetchIndentOrdersIssueDetails: 'FetchIndentOrdersIssueDetails?FromDate=${FromDate}&ToDate=${ToDate}&ToDeptID=${ToDeptID}&IndentID=${IndentID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    SaveIndentIssue: 'SaveIndentIssue',
    FetchDeptItemStockRDS: 'FetchDeptItemStockRDS?ItemID=${ItemID}&FromDeptID=${FromDeptID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchlastIndentIssueItems: 'FetchlastIndentIssueItems?ItemID=${ItemID}&FromWokstationID=${FromWokstationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentOrdersDetailsPrint: 'FetchIndentOrdersDetailsPrint?IndentID=${IndentID}&UserName=${UserName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchIndentOrdersPrint: 'FetchIndentOrdersPrint?IndentID=${IndentID}&UserName=${UserName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',


}