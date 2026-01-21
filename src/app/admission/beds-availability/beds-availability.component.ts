import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { LabBulkverificationService } from 'src/app/suit/lab-bulkverification/lab-bulkverification.service';
@Component({
  selector: 'app-beds-availability',
  templateUrl: './beds-availability.component.html',
  styleUrls: ['./beds-availability.component.scss']
})
export class BedsAvailabilityComponent extends BaseComponent implements OnInit {
  wardData: any = [];
  metCallData: any = [];
  queryparams: any;
  wardid = "0";
  wardName = "";
  intervalN: any;
  currentTimeN: Date = new Date();
  listOfWards: any = [];
  FetchBedStatusList: any;
  selectedStatus: any = '<ALL>';
  constructor(private config: ConfigService, private us: UtilityService, private service: LabBulkverificationService) {
    super()
  }

  fetchBedStatus() {
    this.config.fetchBedStatus(this.hospitalID)
      .subscribe((response: any) => {
        this.FetchBedStatusList = response.FetchBedStatusDataList;
      },
        (err) => {
        })
  }

  ngOnInit(): void {
    this.fetchBedStatus();
    this.searchWard();
  }

  fetchBedStatusByValue(filteredvalue: any = "<ALL>") {
    this.selectedStatus = filteredvalue;
  }

  getFilteredWardData() {
  if (this.selectedStatus === '<ALL>') {
    return this.wardData;
  }

  const filteredData = this.wardData.filter(
    (view: any) => view.BedStatusName === this.selectedStatus
  );

  return filteredData
}
  

  searchWard() {
    const parms = {
      "Name": '%%%',
      "HospitalID": this.hospitalID
    }
    const url = this.us.getApiUrl(bulkverification.wardSearch, parms);
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfWards = response.FetchSSWardsDataList;
        }
      },
        (err) => {

        })
  }

   onItemSelected() {
      this.fetchWardData();
    }


  fetchWardData() {
    this.config.FetchBedsFromWardEposter(this.wardid).subscribe((response: any) => {
      if (response.Code == 200) {
        this.wardData = response.FetchBedsFromWardEposterDataList;
        this.metCallData = response.FetchBedsFromWardEposterMetCallDataList;
        this.wardName = this.wardData[0]?.Ward;
      }
    },
      (err) => {
        console.log(err)
      });
  }


}


export const bulkverification = {
  wardSearch: 'FetchSSWards?Name=${Name}&HospitalID=${HospitalID}',
};