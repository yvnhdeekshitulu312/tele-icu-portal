import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-bed-transfere-request',
  templateUrl: './bed-transfere-request.component.html',
  styleUrls: ['./bed-transfere-request.component.scss']
})
export class BedTransfereRequestComponent extends BaseComponent implements OnInit {

  transferRequestForm!: FormGroup;
  dischargeRequestForm!: FormGroup;
  wardsList: any = [];
  bedTypesList: any = [];
  requestTypeList: any = [];
  wardPriorityList: any = [];
  saveSuccessMsg: string = "";
  currentdate: any;
  isTranReqSubmitted = false;
  isDisReqSubmitted = false;
  datesForm: any;
  disdatesForm: any;
  prevDate: any;
  viewTransReqs: any = [];
  viewDischargeReqs: any = [];
  SelectedwardID: any;
  IsHeadNurse: any;
  IsHome = true;
  requestType = "Transfer Request";
  dischargeStatus: any;
  dischargeReasons: any;
  enableDelete = false;
  FetchIPOrdersForOrderStatusData1List: any;
  FetchIPOrdersForOrderStatusData2List: any;
  readonly = false;
  @Input() data: any;
  dischargeIntimationRiased = false;
  bedsList: any = [];
  bedsListCount: any;
  error = '';
  constructor(private config: ConfigService, public formBuilder: FormBuilder, private modalService: NgbModal, private router: Router) {
    super();

    this.transferRequestForm = this.formBuilder.group({
      TransferRequestID: 0,
      WardID: ['0', Validators.required],
      BedID: ['0'],
      BedTypeID: ['0', Validators.required],
      RequestType: ['1', Validators.required],
      PriorityID: ['4', Validators.required],
      Remarks: ['']
    });
    var d = new Date();
    d.setDate(d.getDate() - 1);
    this.prevDate = d;
    this.datesForm = this.formBuilder.group({
      fromdate: d,
      todate: new Date()
    });

    this.disdatesForm = this.formBuilder.group({
      fromdate: d,
      todate: new Date()
    });

    this.dischargeRequestForm = this.formBuilder.group({
      TransferRequestID: 0,
      RequestType: ['1'],
      DischargeStatusID: ['0', Validators.required],
      DischargeReasonID: ['0', Validators.required],
      DischargeDate: [new Date(), Validators.required],
      DischargeTime: [moment(new Date()).format('H:mm'), Validators.required],
      Remarks: ['']
    });

  }

  ngOnInit(): void {
    this.fetchWardRequestType();
    this.fetchWardPriority();
    this.fetchTransferWards();
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY | H:mm');
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    if (this.data) {
      this.readonly = this.data.readonly;      
    }
    this.dischargeIntimationRiased = this.selectedView.IsFitForDischarge;
  }

  fetchTransferWards() {
    this.config.FetchTransferWards(this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.wardsList = response.FetchWardsBedtypesBedsDataList;
        }
      },
        (err) => {

        })
  }

  onWardChange(event: any) {
    var wardid = event.target.value;
    this.wardID = event.target.value;
    this.SelectedwardID = event.target.value;
    this.config.FetchTransferWardBedType(wardid, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.bedTypesList = response.FetchTransferWardBedTypeDataList;
        }
      },
        (err) => {

        })

        this.config.FetchWardsBedTransferAssign(this.wardID, this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe((response) => {
          if (response.Code == 200) {
            if(response.FetchWardsBedTransferAssignDataList.length>0){
              this.bedsList = response.FetchWardsBedTransferAssignDataList;    
              this.bedsListCount="Total Beds Available :"+response.FetchWardsBedTransferAssignDataList.length;  
            }else {
              this.bedsListCount="No Beds Available for Selected Ward :"+event.target.options[event.target.options.selectedIndex].text;  
            }
                 
          }
        },
          (err) => {
    
          })   
  }

  fetchWardRequestType() {
    this.config.FetchWardRequestType(this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.requestTypeList = response.FetchAdverseDrugDataList;
        }
      },
        (err) => {

        })
  }
  fetchWardPriority() {
    this.config.FetchWardPriority(this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.wardPriorityList = response.SurgeryDemographicsDataaList;
        }
      },
        (err) => {

        })
  }

  saveBedTransferRequest() {
    if (this.requestType === 'Discharge Request') {
      this.checkForPendingOrders();
    }
    else {
      this.isTranReqSubmitted = true;
      if (this.transferRequestForm.get('BedTypeID')?.value != '0' && this.transferRequestForm.get('RequestType')?.value != '0'
        && this.transferRequestForm.get('PriorityID')?.value != '0' && this.transferRequestForm.get('WardID')?.value != '0') {
        const modalRef = this.modalService.open(ValidateEmployeeComponent);
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
          if (data.success) {
            this.config.FetchEmployeeSignaturesBase64(this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, 3392, this.hospitalID)
              .subscribe((response: any) => {
                setTimeout(() => {
                  this.saveTransferRequest();
                }, 0);
              },
                (err) => {
                })
          }
          modalRef.close();
        });
      }
    }
  }

  clearBedTransferRequest() {
    this.SelectedwardID = "";
    this.transferRequestForm.patchValue({
      TransferRequestID: 0,
      WardID: ['0'],
      BedID: ['0'],
      BedTypeID: ['0'],
      RequestType: ['0'],
      PriorityID: ['0'],
      Remarks: ['']
    });
    this.enableDelete = false;
  }

  deleteRequestConfirmation() {
    if(this.requestType === 'Discharge Request') {
      $("#deleteDisReqYesNo").modal('show');
    }
    else {
      $("#deleteTranReqYesNo").modal('show');
    }
  }

  deleteRequest() {
    var trnreqid = "0";
    if(this.requestType === 'Discharge Request')
      trnreqid = this.dischargeRequestForm.get('TransferRequestID')?.value;
    else 
      trnreqid = this.transferRequestForm.get('TransferRequestID')?.value;
    this.config.CancelbedTransferRequests(trnreqid, this.doctorDetails[0].UserId, this.ward.FacilityID, this.hospitalID).subscribe(response => {
      if (response.Code == 200) {
        this.isTranReqSubmitted = false;
        if(this.requestType === 'Discharge Request')
          this.saveSuccessMsg = "Discharge Request Deleted Successfully.";
        else
          this.saveSuccessMsg = "Bed Transfer Request Deleted Successfully.";
        this.clearBedTransferRequest();
        $("#saveTransferRequestMsg").modal('show');
      }
    })
    

  }

  saveTransferRequest() {
    var payld = {
      "TransReqID": this.transferRequestForm.get('TransferRequestID')?.value,
      "AdmissionID": this.admissionID,
      "BedID": this.selectedView.BedID,
      "BedTypeID": this.transferRequestForm.get('BedTypeID')?.value,
      "HospDeptId": this.SelectedwardID,//this.ward.Hospdeptid,
      "RequestType": this.transferRequestForm.get('RequestType')?.value,
      "PriorityID": this.transferRequestForm.get('PriorityID')?.value,
      "Remarks": this.transferRequestForm.get('Remarks')?.value,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID,
      "Hospitalid": this.hospitalID,
      "DischargeStatusID": "0",
      "DischargeReasonID": "0",
      "ReqForDate": ""
    }

    this.config.SaveBedTransferRequests(payld).subscribe(response => {
      
      if (response.Code == 200) {
        this.isTranReqSubmitted = false;
        this.saveSuccessMsg = "Bed Transfer Request Saved Successfully.";
        this.clearBedTransferRequest();
        $("#saveTransferRequestMsg").modal('show');
      }
      else if (response.Code === 604) {
        this.error = response.Message;
        $("#errorMessagesModal").modal('show');
      }
    })
  }
  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  openviewNotemodal() {
    if(this.requestType === 'Discharge Request') {
      this.fetchBedDischargeRequests();
      $("#viewDischargeRequests").modal('show');
    }
    else  {
      this.fetchBedTransferRequests();
      $("#viewNotemodal").modal('show');
    }
  }

  fetchBedTransferRequests() {
    var fromdate = this.datesForm.get("fromdate")?.value;
    fromdate = moment(fromdate).format('DD-MMM-YYYY');
    var todate = this.datesForm.get("todate")?.value;
    todate = moment(todate).format('DD-MMM-YYYY');
    this.config.FetchBedTransferRequests(this.admissionID, '1', fromdate, todate, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.viewTransReqs = response.FetchBedTransferRequestDataaList;
        }
      },
        (err) => {

        })
  }

  fetchBedDischargeRequests() {
    var fromdate = this.disdatesForm.get("fromdate")?.value;
    fromdate = moment(fromdate).format('DD-MMM-YYYY');
    var todate = this.disdatesForm.get("todate")?.value;
    todate = moment(todate).format('DD-MMM-YYYY');
    this.config.FetchBedDischargeRequests(this.admissionID, '2', fromdate, todate, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.viewDischargeReqs = response.FetchBedDischargeRequestsDataList;
        }
      },
        (err) => {

        })
  }
  


  viewBedTransReq(item: any) {
    this.transferRequestForm.patchValue({
      TransferRequestID: item.RequestID,
      WardID: item.WardID,
      BedID: this.selectedView.BedID,
      BedTypeID: item.ReqBedTypeId,
      RequestType: item.RequestType,
      PriorityID: item.PriorityID,
      Remarks: item.Remarks
    });
    this.enableDelete = true;
    $("#viewNotemodal").modal('hide');
  }

  viewBedDischargeReq(item: any) {
    this.dischargeRequestForm.patchValue({
      TransferRequestID: item.RequestID,
      DischargeStatusID: item.DischargeStatusID,
      DischargeReasonID: item.DischargeReasonId,
      DischargeDate: new Date(item.RequestedDate),
      DischargeTime: item.RequestedDate.split(' ')[1],
      //RequestType: item.RequestType,
      Remarks: item.Remarks
    });
    this.enableDelete = true;
    $("#viewDischargeRequests").modal('hide');
  }

  navigate(type: string) {
    if (type == 'discharge') {
      this.requestType = 'Discharge Request';
      this.fetchAdminMasters('139');
      this.fetchAdminMasters('74');
    }
    else if(type === 'transfer') {
      this.requestType = 'Transfer Request';
    }
  }

  fetchAdminMasters(type: string) {
    this.config.fetchAdminMasters(type).subscribe((response) => {
      if (response.Code === 200) {
        if (type === '139')
          this.dischargeStatus = response.SmartDataList;
        else
          this.dischargeReasons = response.SmartDataList;
      }
    });
  }

  checkForPendingOrders() {
    this.config.FetchIPOrdersForOrderStatus(this.admissionID, this.doctorDetails[0].UserId, this.ward.FacilityID, this.hospitalID).subscribe((response) => {
      if (response.Code === 200) {
        this.FetchIPOrdersForOrderStatusData1List = response.FetchIPOrdersForOrderStatusData1List;
        this.FetchIPOrdersForOrderStatusData2List = response.FetchIPOrdersForOrderStatusData2List;
        if(response.FetchIPOrdersForOrderStatusData1List.length > 0 || response.FetchIPOrdersForOrderStatusData2List.length > 0) {
          $("#pendingOrdersYesNo").modal('show');
        }
      }
    });
  }

  viewPendingOrders() {
    this.config.FetchIPOrdersForOrderStatus(this.admissionID, this.doctorDetails[0].UserId, this.ward.FacilityID, this.hospitalID).subscribe((response) => {
      if (response.Code === 200) {
        this.FetchIPOrdersForOrderStatusData1List = response.FetchIPOrdersForOrderStatusData1List;
        this.FetchIPOrdersForOrderStatusData2List = response.FetchIPOrdersForOrderStatusData2List;
        if(response.FetchIPOrdersForOrderStatusData1List.length > 0 || response.FetchIPOrdersForOrderStatusData2List.length > 0) {
          $("#viewPendingOrders").modal('show');
        }
        else {
          $("#nopendingOrders").modal('show');
        }
      }
    });    
  }

  saveBedDischargeRequest() {
    this.isDisReqSubmitted = true;
    if (this.transferRequestForm.get('DischargeStatusID')?.value != '0' && this.transferRequestForm.get('DischargeReasonID')?.value != '0') {
      const modalRef = this.modalService.open(ValidateEmployeeComponent);
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.config.FetchEmployeeSignaturesBase64(this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, 3392, this.hospitalID)
            .subscribe((response: any) => {
              setTimeout(() => {
                this.saveDischargeRequest();
              }, 0);
            },
              (err) => {
              })
        }
        modalRef.close();
      });
    }
  }

  saveDischargeRequest() {
    var payld = {
      "TransReqID": this.dischargeRequestForm.get('TransferRequestID')?.value,
      "AdmissionID": this.admissionID,
      "BedID": this.selectedView.BedID,
      "BedTypeID": "0",
      "HospDeptId": this.ward.Hospdeptid,
      "RequestType": "7",
      "PriorityID": "0",
      "Remarks": this.dischargeRequestForm.get('Remarks')?.value,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID,
      "Hospitalid": this.hospitalID,
      "DischargeStatusID": this.dischargeRequestForm.get('DischargeStatusID')?.value,
      "DischargeReasonID": this.dischargeRequestForm.get('DischargeReasonID')?.value,
      "ReqForDate": moment(this.dischargeRequestForm.get('DischargeDate')?.value).format('DD-MMM-YYYY') + ' ' + this.dischargeRequestForm.get('DischargeTime')?.value
    }

    this.config.SaveBedTransferRequests(payld).subscribe(response => {
      if (response.Code == 200) {
        this.isDisReqSubmitted = false;
        this.saveSuccessMsg = "Discharge Request Saved Successfully.";
        this.clearBedDischargeRequest();
        $("#saveTransferRequestMsg").modal('show');
      }
    })
  }

  clearBedDischargeRequest() {
    this.SelectedwardID = "";
    this.transferRequestForm.patchValue({
      TransferRequestID: 0,
      RequestType: ['1'],
      DischargeStatusID: ['0'],
      DischargeReasonID: ['0', Validators.required],
      DischargeDate: [new Date(), Validators.required],
      DischargeTime: [moment(new Date()).format('H:mm'), Validators.required],
      Remarks: ['']
    });
  }

}
