import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { MY_FORMATS } from '../consent-hro/consent-hro.component';

declare var $: any;

@Component({
  selector: 'app-viewapprovalrequest',
  templateUrl: './viewapprovalrequest.component.html',
  styleUrls: ['./viewapprovalrequest.component.scss'],
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
export class ViewapprovalrequestComponent extends BaseComponent implements OnInit {
  @Input() data: any;

  aprrovalRequests: any = [];
  aprrovalRequestDetails: any = [];
  nphiesrequest: any = [];
  commRequestPayloads: any = [];
  commRequestReasons: any = [];

  commResponsePayloads: any = [];
  commResponseReasons: any = [];

  errorMessage = "";
  saveMsg = "";
  showCommResponse: boolean = false;
  newApprovalList: any;
  nphiesRejectedReason: any;
  adjCategoryList: any = [];
  facility: any;
  selectedApprovalEntryForDocresponse: any;
  showClose: boolean = false;
  facilityId: any;

  isDoctorApprovals: boolean = false;
  approvalForm!: FormGroup;

  constructor(private config: ConfigService, private fb: FormBuilder, public datepipe: DatePipe) {
    super();
  }

  ngOnInit(): void {
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
    this.approvalForm = this.fb.group({
      FromDate: new Date(),
      ToDate: new Date(),
      SSN: ''
    });
    if (this.data) {
      this.showClose = this.data.showClose;
      this.isDoctorApprovals = this.data.isDoctorApprovals;
    }
    if (!this.isDoctorApprovals) {
      this.fetchApprovalRequests();
    }
  }

  onDateChange() {
    this.fetchApprovalRequestsForDoctor();
  }

  fetchApprovalRequests() {
    var visitid = this.selectedView.AdmissionID;
    this.config.FetchApprovalRequestAdv(visitid, this.doctorDetails[0].UserId, '3591', this.hospitalID)
      .subscribe((response: any) => {
        this.aprrovalRequests = response.ApprovalRequestsDataList.sort((a: any, b: any) => Number(b.EntryID) - Number(a.EntryID));
        this.aprrovalRequestDetails = response.ApprovalRequestDetailsDataList;
        this.aprrovalRequests.forEach((element: any) => {
          this.showCommunicationRequestReasons(element.EntryID);
        });
        this.aprrovalRequestDetails.forEach((element: any) => {
          if (element.ClaimStatusID == '0') {
            element.class = "status red";
          }
          else if (element.ClaimStatusID == '') {
            element.class = "status green";
          }
          else if (element.ClaimStatusID == '') {
            element.class = "status green";
          }
          else if (element.ClaimStatusID == '') {
            element.class = "status green";
          }
        });
      },
        (err) => {
        })
  }

  clearForm() {
    this.approvalForm = this.fb.group({
      FromDate: new Date(),
      ToDate: new Date(),
      SSN: ''
    });
    this.aprrovalRequests = [];
    this.adjCategoryList = [];
  }

  onSSNEnterPress() {
    this.fetchApprovalRequestsForDoctor();
  }

  fetchApprovalRequestsForDoctor() {
    if (!this.approvalForm.value['FromDate'] || !this.approvalForm.value['ToDate']) {
      return;
    }
    const FromDate = this.datepipe.transform(this.approvalForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    const ToDate = this.datepipe.transform(this.approvalForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    this.config.FetchApprovalRequestDoc(this.doctorDetails[0].EmpId, FromDate, ToDate, this.approvalForm.value['SSN'] ? this.approvalForm.value['SSN'] : 0, this.doctorDetails[0].UserId, this.facilityId, this.hospitalID)
      .subscribe((response: any) => {
        this.aprrovalRequests = response.ApprovalRequestsDataList.sort((a: any, b: any) => Number(b.EntryID) - Number(a.EntryID));
        this.aprrovalRequestDetails = response.ApprovalRequestDetailsDataList;
        this.aprrovalRequests.forEach((element: any) => {
          this.showCommunicationRequestReasons(element.EntryID);
        });
        this.aprrovalRequestDetails.forEach((element: any) => {
          if (element.ClaimStatusID == '0') {
            element.class = "status red";
          }
          else if (element.ClaimStatusID == '') {
            element.class = "status green";
          }
          else if (element.ClaimStatusID == '') {
            element.class = "status green";
          }
          else if (element.ClaimStatusID == '') {
            element.class = "status green";
          }
        });
      },
        (err) => {
        })
  }

  showCommunicationRequest() {
    var payload = {
      "id": null,
      "role": 1,
      "patientType": 1,
      "fromDate": "2024-08-01T01:00:00",
      "toDate": "2024-08-30T23:59:59",
      "SSN": this.selectedCard.SSN,
      "DoctorCode": this.doctorDetails[0].EmpNo
    }
    this.config.getCommunicationRequests(payload)
      .subscribe((response: any) => {
        if (response.info !== '0 records retreived' && response.content[0]?.commRequest != null) {
          this.nphiesrequest = response.content;
          this.commRequestPayloads = response.content[0]?.commRequest.payloads;
          this.commRequestReasons = response.content[0]?.commRequest.reasons;
          if (response.content[0]?.commResponse != null) {
            this.commResponsePayloads = response.content[0]?.commResponse.payloads;
            this.commResponseReasons = response.content[0]?.commResponse.reasons;
          }

          $("#commReqModal").modal('show');
        }
        else {
          this.errorMessage = "No communication requests from Nphies";
          $("#errorMsg").modal('show');
        }

      },
        (err) => {
        })

  }

  showDoctorJustificationPopup(appr: any) {
    this.selectedApprovalEntryForDocresponse = appr;
    $("#justificationModal").modal('show');
  }

  saveDoctorResponse() {
    let savejustpayload = {
      "EntryId": this.selectedApprovalEntryForDocresponse.EntryID,
      "AdmissionId": this.selectedView.AdmissionID,
      "PatientId": this.selectedView.PatientID,
      "DoctorResponse": $("#justification").val(),
      "UserId": this.doctorDetails[0].UserId,
      "WorkstationId": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalId": this.hospitalID
    }
    this.config.saveDoctorResponse(savejustpayload)
      .subscribe((response: any) => {
        if (response.data == "Success") {
          this.saveMsg = "Response Send Successfully";
          $("#saveMsg").modal('show');
          $("#justificationModal").modal('hide');
        }
      },
        (err) => {

        })

  }


  showCommunicationRequestReasons(entryId: any) {
    var payload = {
      "id": entryId
    }
    this.config.getCommunicationRequests(payload)
      .subscribe((res: any) => {
        if (res.status == 1 && res.content.length > 0) {
          this.newApprovalList = res.content;
          const items = this.newApprovalList[0]?.request.items;
          const itemadjList = this.newApprovalList[0]?.itemAdjudications;
          items.forEach((item: any) => {
            let filteredItemAdj = itemadjList.filter((itemAdj: any) => itemAdj.item.code == item.code);
            if (filteredItemAdj.length > 0) {
              let RejectedItemAdj = itemadjList.filter((itemAdj: any) => itemAdj.item.code == item.code && (itemAdj.item.adjOutcome == 'Rejected' || itemAdj.item.adjOutcome == 'Partially Approved'));
              if (RejectedItemAdj.length > 0) {
                let objReason = RejectedItemAdj.find((res: any) => res.reason != null);
                //this.nphiesRejectedReason = objReason != null ? objReason.reason : null;
                if (objReason.reason != null || objReason.reason != '') {
                  this.adjCategoryList.push({
                    code: item.code, name: item.name, status: item.adjOutcome, itemReason: objReason.reason
                  })
                }
              }
            }
          })
        }
        else {


        }
      },
        (err) => {
        })
  }

  filterApprovalItems(appr: any) {
    return this.aprrovalRequestDetails.filter((x: any) => x.EntryID === appr.EntryID);
  }

}
