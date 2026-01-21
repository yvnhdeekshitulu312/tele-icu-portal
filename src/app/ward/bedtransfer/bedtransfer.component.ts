import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

declare var $: any;

@Component({
  selector: 'app-bedtransfer',
  templateUrl: './bedtransfer.component.html',
  styleUrls: ['./bedtransfer.component.scss'],
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
export class BedtransferComponent extends BaseComponent implements OnInit {
  type = 1;
  FetchVaccantBedsFromWardDataList: any = [];
  FetchNewBedStatusDataList: any = [];
  groupedByRoom!: { [key: string]: any };
  errorMessages: any = [];
  wardId: string = "";
  IsHome = true;
  tablePatientsForm!: FormGroup;
  billableBedTypesList: any = [];
  bedsList: any = [];
  saveMsg: string = '';
  readonly = false;
  FromDate: any;

  @Input() data: any;
  
  constructor(private router: Router, private config: ConfigService, private formbuilder: FormBuilder,public datepipe: DatePipe) {
    super();
    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true; 
    }
    
   }

  ngOnInit(): void {
    var wm = new Date();
    wm.setDate(wm.getDate() - 60);
    this.tablePatientsForm = this.formbuilder.group({
      FromDate: wm,
      ToDate: new Date(),
    });

    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
    if(this.wardID === undefined) {
      this.wardID = this.doctorDetails[0].FacilityId;
    }
    
    this.fetchBillableBedTypes();
    this.fetchBeds();
    if (this.data) {
      this.readonly = this.data.readonly;      
    }
  }

  fetchBillableBedTypes() {
    this.config.FetchWardsBedTypes(this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe((response) => {
      if (response.Code == 200) {
        this.billableBedTypesList = response.FetchEligibleBedTypesDataList;
      }
    },
      (err) => {

      })
  }

  fetchBeds() {
    this.config.FetchWardsBedTransferAssign(this.wardID, this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe((response) => {
      if (response.Code == 200) {
        this.bedsList = response.FetchWardsBedTransferAssignDataList;
        this.fetchWardBedTransferRequests();
      }
    },
      (err) => {

      })
  }

  fetchWardBedTransferRequests() {
    var fromdate = this.tablePatientsForm.get("FromDate")?.value;
    fromdate = moment(fromdate).format('DD-MMM-YYYY');
    var todate = this.tablePatientsForm.get("ToDate")?.value;
    if (todate != null) {
      todate = moment(todate).format('DD-MMM-YYYY');
      this.config.FetchBedTransferWardRequests(this.wardID, fromdate, todate, this.hospitalID).subscribe((response) => {
        if (response.Code == 200) {
          this.FetchVaccantBedsFromWardDataList = [];
          this.FetchNewBedStatusDataList = [];
          this.groupedByRoom = {};
          this.FetchVaccantBedsFromWardDataList = response.FetchBedTransferWardRequestsDataList.filter((x:any) => x.STATUS != '3');
          //this.FetchNewBedStatusDataList = response.FetchNewBedStatusDataList;
  
          // this.FetchVaccantBedsFromWardDataList.forEach((bed: any) => {
          //   const matchingStatuses = this.FetchNewBedStatusDataList.filter((status: any) => status.BedID === bed.BedID);
          //   bed.BedStatusArray = matchingStatuses.map((status: any) => ({
          //     BedStatusID: status.BedStatusID,
          //     BedStatus: status.BedStatus
          //   }));
          // });
  
          this.groupedByRoom = this.FetchVaccantBedsFromWardDataList.reduce((acc: any, curr: any) => {
            const room = curr.Room;
            if (!acc[room]) {
              acc[room] = [];
            }
            acc[room].push(curr);
            return acc;
          }, {});
        }
      },
        (err) => {
  
        })
    }
  }

  getKeys(object: object): string[] {
    return object ? Object.keys(object) : [];
  }

  setType(type: any) {
    this.type = type;
    this.fetchWardBedTransferRequests();
  }

  setSelectedRoom(item: any) {
    item.selected = !item.selected;
  }

  changeBedType(event: any, item: any) {
    item.selectedBedType = event.target.value; 
  }

  changeBed(event: any, item: any) {
    item.selectedBed = event.target.value; 
  }

  clear() {
    this.fetchWardBedTransferRequests();
  }


  Acknowledge(item:any) {
    var payld = {
      "TransReqID": item.RequestID,
      "AdmissionID": item.IPID,
      "BedID": item.OrdBedId,
      "BedTypeID": item.ReqBedTypeId,
      "HospDeptId": item.WardId,
      "RequestType": item.RequestType,
      "PriorityID": item.PriorityID,
      "Remarks": "Transfer Acknowledgement",
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID,
      "Hospitalid": this.hospitalID
    }

    this.config.SaveBedTransferWardAcceptance(payld).subscribe(response => {
      if (response.Code == 200) {
        this.saveMsg = "Bed Transfer Request Acknowledged Successfully.";
        this.fetchWardBedTransferRequests();
        $("#saveMsg").modal('show');
      }
    })
  }

  Assign(item:any) {
    if(item.selectedBedType != undefined && item.selectedBedType != '0' && item.selectedBed != undefined && item.selectedBed != '0') {
    var payld = {
      "BedID": item.selectedBed,
      "BillBedTypID": item.selectedBedType,
      "ReqBedTypID": item.ReqBedTypeId,
      "AllocBedTypID": item.selectedBedType,
      "AdmissionID": item.IPID,
      "Transfer": "1", 
      "PrevBedID": item.OrdBedId, 
      "RequestID": item.RequestID,
      "Remarks": "Transfer Accepted & Bed Assigned",
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID,
      "Hospitalid": this.hospitalID,
      "DiffbedAllocationReasonID": item.TransferReasonID === "" ? '0' : item.TransferReasonID
    }

    this.config.SaveBedTransferBedAcceptance(payld).subscribe(response => {
      if (response.Code == 200) {
        this.saveMsg = "Bed Assigned Successfully.";
        this.fetchWardBedTransferRequests();
        $("#saveMsg").modal('show');
      }
    })
  }
  else {
    this.errorMessages = [];
    this.errorMessages.push("Please selece BedType & Bed to assign");
    $("#validationMessage").modal('show');
  }
  }

  navigatetoBedBoard() {
    if(!this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  selectBed(item: any) {
    this.FetchVaccantBedsFromWardDataList.forEach((element: any, index:any) => {
      if(element.RequestID === item.RequestID) {
        element.selected = !element.selected;
      }
      else {
        element.selected = false;
      }
    });
    
  }

}
