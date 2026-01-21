import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';

declare var $: any;

@Component({
  selector: 'app-blood-bag-history',
  templateUrl: './blood-bag-history.component.html',
  styleUrls: ['./blood-bag-history.component.scss']
})
export class BloodBagHistoryComponent implements OnInit {
  langData: any;
  trustedUrl: any;
  facilityId: any;
    hospId: any;
    doctorDetails: any;
    errorMsg: any;

  constructor(private config: ConfigService) {
    this.langData = this.config.getLangData();
    const facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.facilityId = facility.FacilityID == undefined ? facility : facility.FacilityID
    this.hospId = sessionStorage.getItem("hospitalId");
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');

   }

  ngOnInit(): void {
  }

  clearScreen() { 
    $("#txtBagno").val('');   
  }

  PrintBagNo() {
    if($("#txtBagno").val() === '') {
      this.errorMsg = "Enter BagNo";
      $("#errorMsg").modal('show');
      return;
    }
    this.FetchPatientCaseRecord();
    this.showCareRecordModal();
}
FetchPatientCaseRecord() {
 
  const BagNo=$("#txtBagno").val();  
  
    this.config.FetchBloodBagHistory(BagNo, this.doctorDetails[0]?.UserId, this.hospId, this.facilityId)
        .subscribe((response: any) => {
            if (response.Code == 200) {
                this.trustedUrl = response?.FTPPATH;
            }
        },
            (err) => {
            })
}
showCareRecordModal() {
    $("#caseRecordModal").modal('show');
}

}
