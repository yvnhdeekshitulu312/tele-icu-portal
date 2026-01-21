import { Component, OnInit } from '@angular/core';
import { SuitConfigService } from '../services/suitconfig.service';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/shared/base.component';
import { ConfigService as BedConfig } from '../../ward/services/config.service';

declare var $: any;
@Component({
  selector: 'app-updated-beds',
  templateUrl: './updated-beds.component.html',
  styleUrls: ['./updated-beds.component.scss']
})
export class UpdatedBedsComponent extends BaseComponent implements OnInit {
  type = 1;
  FetchVaccantBedsFromWardDataList: any = [];
  FetchNewBedStatusDataList: any = [];
  groupedByRoom!: { [key: string]: any };
  errorMessages: any = [];
  wardId: string = "";
  IsHome = true;
  FromEMR: any;
  FromBedBoard: any;
  FetchUserFacilityDataList: any;
  hospitalId: any;

  constructor(private config: SuitConfigService, private router: Router, private bedConfig: BedConfig) {
    super();
    this.FromEMR = sessionStorage.getItem("FromEMR");
    this.FromBedBoard = sessionStorage.getItem("FromBedBoard");
    if (this.FromEMR !== null && this.FromEMR !== undefined) {
      this.IsHome = !(this.FromEMR === 'true');
    } else {
      this.IsHome = true;
    }
  }
  

  ngOnInit(): void {
    this.fetchUserFacility();
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
    this.hospitalId = sessionStorage.getItem("hospitalId");
    if (this.wardID === undefined) {
      this.wardID = this.doctorDetails[0].FacilityId;
    }
    this.FetchVaccantBedsFromWard();
  }

  onWardChange() {
    this.FetchVaccantBedsFromWard();
  }

  fetchUserFacility() {
    const hospId: any = sessionStorage.getItem("hospitalId");
    this.bedConfig.fetchUserFacility(this.doctorDetails[0].UserId, hospId)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserFacilityDataList;
      },
        (err) => {
        })

  }

  FetchVaccantBedsFromWard() {
    this.config.FetchVaccantBedsFromWard(this.wardID, this.type, this.doctorDetails[0].UserId, this.wardID, this.hospitalID).subscribe((response) => {
      if (response.Code == 200) {
        this.FetchVaccantBedsFromWardDataList = [];
        this.FetchNewBedStatusDataList = [];
        this.groupedByRoom = {};
        this.FetchVaccantBedsFromWardDataList = response.FetchVaccantBedsFromWardDataList;
        this.FetchNewBedStatusDataList = response.FetchNewBedStatusDataList;

        this.FetchVaccantBedsFromWardDataList.forEach((bed: any) => {
          const matchingStatuses = this.FetchNewBedStatusDataList.filter((status: any) => status.BedID === bed.BedID);
          bed.BedStatusArray = matchingStatuses.map((status: any) => ({
            BedStatusID: status.BedStatusID,
            BedStatus: status.BedStatus
          }));
        });

        this.groupedByRoom = this.FetchVaccantBedsFromWardDataList.reduce((acc: any, curr: any) => {
          const room = curr.Room;
          if (!acc[room]) {
            acc[room] = [];
          }
          acc[room].push(curr);
          if (acc[room][0].BedStatusArray.length === 1)
            acc[room][0].selectedStatus = acc[room][0].BedStatusArray[0].BedStatusID;
          return acc;
        }, {});
      }
    },
      (err) => {

      })
  }

  getKeys(object: object): string[] {
    return object ? Object.keys(object) : [];
  }

  setType(type: any) {
    this.type = type;
    this.FetchVaccantBedsFromWard();
  }

  setSelectedRoom(item: any) {
    item.selected = !item.selected;
  }

  changeStatus(event: any, item: any) {
    item.selectedStatus = event.target.value;
  }

  clear() {
    this.FetchVaccantBedsFromWard();
  }

  save() {
    let BedStatus = [];
    let bedIds = [];
    this.errorMessages = [];
    
    for (const [room, beds] of Object.entries(this.groupedByRoom)) {
      for (const bed of beds) {
        if (bed.selected && !bed.selectedStatus) {
          this.errorMessages.push(bed.Room);
        } else if (bed.selected && bed.selectedStatus) {
          const data = {
            BID: bed.BedID,
            STS: bed.selectedStatus
          };
          BedStatus.push(data);
          bedIds.push(bed.BedID); 
        }
      }
    }

    const bedIdsCommaSeparated = bedIds.join(',');
    // console.log(bedIdsCommaSeparated);
    this.FetchInpatientCounter(bedIdsCommaSeparated);
    // return;

    if (this.errorMessages.length > 0) {
      $("#validationMessage").modal('show');
    }

    if (BedStatus.length > 0) {
      var payload = {
        "HospitalID": this.hospitalID,
        "USERID": this.doctorDetails[0].UserId,
        "WORKSTATIONID": this.doctorDetails[0].FacilityId,
        "BedStatus": BedStatus
      }

      this.config.SavePushBedStatus(payload).subscribe(
        (response) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.FetchVaccantBedsFromWard();
            this.FetchInpatientCounter(bedIdsCommaSeparated);
          }
        },
        (err) => {
          console.log(err)
        });
    }
  }
  FetchInpatientCounter(BedID: any) {    
    this.config.FetchInpatientCounter(BedID, this.doctorDetails[0].FacilityId, this.hospitalID).subscribe((response: any) => {
      if (response.Code === 200) {        
      }
    });
  }
  navigatetoBedBoard() {
    if (!this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }
}
