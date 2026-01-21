import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
  selector: 'app-find-patient',
  templateUrl: './find-patient.component.html',
  styleUrls: ['./find-patient.component.scss']
})
export class FindPatientComponent implements OnInit {
  facilityId: any;
  hospitalId: any;
  patientList: any = [];
  errorMsg: any;

  constructor(private us: UtilityService) {
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
   }

  ngOnInit(): void {

  }


  findPatient() {
    const ssn = $("#txtSsn").val();
    const mobile = $("#txtMobileNo").val();
    const RoomNo = $("#txtRoomNo").val();
    if($("#txtSsn").val() === '' && $("#txtMobileNo").val() === '' && $("#txtRoomNo").val() === '') {
      this.errorMsg = "Enter National ID or Mobile No or RoomNo";
      $("#errorMsg").modal('show');
      return;
    }
    const url = this.us.getApiUrl(findPatient.FetchPatientInformationDesk, { 
      SSN: ssn === '' ? '0' : ssn,
      MobileNo:  mobile === '' ? '0' : mobile,
      RoomNo:  RoomNo === '' ? '0' : RoomNo,
      WorkstationID: this.facilityId,
      HospitalID: this.hospitalId
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientInformationDeskDataList.length > 0) {
          this.patientList = response.FetchPatientInformationDeskDataList;
        }
        else {
          this.errorMsg = "No Patient Found.";
          $("#errorMsg").modal('show');
          return;
        }
      },
        (err) => {
        })
  }

  clearScreen() {
    this.patientList = [];
    $("#txtSsn").val('');
    $("#txtMobileNo").val('');
  }

}

export const findPatient = {
  //https://localhost:44350//API/FetchPatientInformationDesk?SSN=1019449451&MobileNo=0&WorkstationID=2082&HospitalID=2
  FetchPatientInformationDesk: 'FetchPatientInformationDesk?SSN=${SSN}&MobileNo=${MobileNo}&RoomNo=${RoomNo}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
}