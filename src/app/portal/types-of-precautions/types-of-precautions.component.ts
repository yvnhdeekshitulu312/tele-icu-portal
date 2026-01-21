import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
declare var $: any;
@Component({
  selector: 'app-types-of-precautions',
  templateUrl: './types-of-precautions.component.html',
  styleUrls: ['./types-of-precautions.component.scss']
})
export class TypesOfPrecautionsComponent implements OnInit {

  selectedPrecautionId: any
  typeOfPrecautions: any;
  selectedView: any;
  AdmissionID: any;
  PatientID: any;
  doctorID: any;
  selectedPrecautions: any = [];
  doctorDetails: any;
  precautionsSelected: boolean = false;
  endofEpisode: boolean = false;
  savedPrecautionIds: any;
  PatientPrecautionID: any;
  IsNurse: any;
  @Output() savechanges = new EventEmitter<any>();
  langData: any;
  PdfType = '';
  errorMsg: string = "";
  precautionRemarks: string = "";
  constructor(private config: ConfigService,) {
    this.langData = this.config.getLangData();

  }

  ngOnInit(): void {
    this.IsNurse = sessionStorage.getItem("IsNurse");
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    if (sessionStorage.getItem("ISEpisodeclose") === "true") {
      if (this.selectedView.IsFitForDischarge !== undefined && this.selectedView.IsFitForDischarge) {
        this.endofEpisode = true; 
      } else
        this.endofEpisode = false;
    } else {
      this.endofEpisode = false;
    }
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');

    this.PatientID = this.selectedView.PatientID;
    this.AdmissionID = this.selectedView.AdmissionID;
    this.doctorID = this.doctorDetails[0].EmpId;
    this.fetchTypePrecautions();
    this.fetchPatientPrecaution();
  }
  clearPrecautionId() {
    this.selectedPrecautionId = null;
    this.PdfType = "";
    this.fetchTypePrecautions();
    this.fetchPatientPrecaution();
  }
  SaveData() {
    //this.savechanges.emit('typeofprecautions');
  }
  typeOfPrecautionsClick(type: any) {
    const selectedTypeIndex = this.typeOfPrecautions.findIndex((element: any) => element.PrecautionID === type.PrecautionID);
    this.precautionsSelected = this.typeOfPrecautions.some((element: any) => element.Class.includes("active"));

    const contactSelected = this.typeOfPrecautions.find((x: any) => x.PrecautionName === 'Contact' && x.Class.includes("active"));
    const airborneSelected = this.typeOfPrecautions.find((x: any) => x.PrecautionName === 'Airborne' && x.Class.includes("active"));
    const dropletSelected = this.typeOfPrecautions.find((x: any) => x.PrecautionName === 'Droplet' && x.Class.includes("active"));
    // if (type.PrecautionID === '1' && dropletSelected && airborneSelected) {
    //   this.errorMsg = "Cannot select Droplet when Airborne is selected";
    //   $("#showTypeOfPrecautionsValidationMsg").modal('show');
    //   return;
    // }
    // else if (type.PrecautionID === '2' && contactSelected && airborneSelected) {
    //   this.errorMsg = "Cannot select Droplet when Airborne is selected";
    //   $("#showTypeOfPrecautionsValidationMsg").modal('show');
    //   return;
    // }
    // else if (type.PrecautionID === '2' && airborneSelected && dropletSelected) {
    //   this.errorMsg = "Cannot select both Droplet when Airborne";
    //   $("#showTypeOfPrecautionsValidationMsg").modal('show');
    //   return;
    // }
    // else if (type.PrecautionID === '3' && dropletSelected && contactSelected) {
    //   this.errorMsg = "Cannot select both Droplet when Airborne";
    //   $("#showTypeOfPrecautionsValidationMsg").modal('show');
    //   return;
    // }
    // else if (type.PrecautionID === '3' && contactSelected && dropletSelected) {
    //   this.errorMsg = "Cannot select Airborne when Droplet is selected";
    //   $("#showTypeOfPrecautionsValidationMsg").modal('show');
    //   return;
    // }

    if (selectedTypeIndex !== -1) {
      if (this.typeOfPrecautions[selectedTypeIndex].Class.includes("active")) {
        this.typeOfPrecautions[selectedTypeIndex].Class = this.typeOfPrecautions[selectedTypeIndex].Class.replace(" active", "");
        this.selectedPrecautionId = null;
      } else {
        this.typeOfPrecautions[selectedTypeIndex].Class += " active";
        this.selectedPrecautionId = type.PrecautionID;
      }

    }

    if (type.PrecautionName === 'Contact')
      this.PdfType = 'Contact';
    else if (type.PrecautionName === 'Droplet')
      this.PdfType = 'Droplet';
    else if (type.PrecautionName === 'Airborne')
      this.PdfType = 'Airborne';

    // this.showPSValidation = false;
  }

  fetchTypePrecautions() {
    this.config.fetchTypeofPrecautions().subscribe(response => {
      this.typeOfPrecautions = response.TypeofPrecautionsDataList;

      this.typeOfPrecautions.forEach((element: any, index: any) => {
        if (this.savedPrecautionIds != undefined) {
          if (element.PrecautionID == 1) {
            element.Class = this.savedPrecautionIds.find((x: any) => x.PrecautionID == element.PrecautionID) != undefined ? "pain_reaction justify-content-center position-relative text-center py-2 cursor-pointer text-center active" : "pain_reaction justify-content-center position-relative text-center py-2 cursor-pointer text-center";
          }
          else if (element.PrecautionID == 2) {
            element.Class = this.savedPrecautionIds.find((x: any) => x.PrecautionID == element.PrecautionID) != undefined ? "pain_reaction justify-content-center position-relative text-center py-2 cursor-pointer text-center active" : "pain_reaction justify-content-center position-relative text-center py-2 cursor-pointer text-center";
          }
          else if (element.PrecautionID == 3) {
            element.Class = this.savedPrecautionIds.find((x: any) => x.PrecautionID == element.PrecautionID) != undefined ? "pain_reaction justify-content-center position-relative text-center py-2 cursor-pointer text-center active" : "pain_reaction justify-content-center position-relative text-center py-2 cursor-pointer text-center";
          }
          else if (element.PrecautionID == 4) {
            element.Class = this.savedPrecautionIds.find((x: any) => x.PrecautionID == element.PrecautionID) != undefined ? "pain_reaction justify-content-center position-relative text-center py-2 cursor-pointer text-center active" : "pain_reaction justify-content-center position-relative text-center py-2 cursor-pointer text-center";
          }
          else if (element.PrecautionID == 5) {
            element.Class = this.savedPrecautionIds.find((x: any) => x.PrecautionID == element.PrecautionID) != undefined ? "pain_reaction justify-content-center position-relative text-center py-2 cursor-pointer text-center active" : "pain_reaction justify-content-center position-relative text-center py-2 cursor-pointer text-center";
          }
          else if (element.PrecautionID == 6) {
            element.Class = this.savedPrecautionIds.find((x: any) => x.PrecautionID == element.PrecautionID) != undefined ? "pain_reaction justify-content-center position-relative text-center py-2 cursor-pointer text-center active" : "pain_reaction justify-content-center position-relative text-center py-2 cursor-pointer text-center";
          }
        }
        else {
          element.Class = "pain_reaction position-relative text-center py-2 justify-content-center cursor-pointer text-center";
        }
      });
    })

  }
  fetchPatientPrecaution() {
    this.config.fetchPatientPrecautions(this.AdmissionID).subscribe((data: any) => {
      if (data.PatientPrecautionsDataList.length > 0) {
        this.savedPrecautionIds = data.PatientPrecautionsDataList;
        this.PatientPrecautionID = data.PatientPrecautionsDataList[0].PatientPrecautionID;
        this.typeOfPrecautions.forEach((element: any, index: any) => {
          if (this.savedPrecautionIds != undefined) {
            if (element.PrecautionID == 1) {
              element.Class = this.savedPrecautionIds.find((x: any) => x.PrecautionID == element.PrecautionID) != undefined ? "pain_reaction position-relative text-center py-2 cursor-pointer text-center active" : "pain_reaction position-relative text-center py-2 cursor-pointer text-center";
            }
            else if (element.PrecautionID == 2) {
              element.Class = this.savedPrecautionIds.find((x: any) => x.PrecautionID == element.PrecautionID) != undefined ? "pain_reaction position-relative text-center py-2 cursor-pointer text-center active" : "pain_reaction position-relative text-center py-2 cursor-pointer text-center";
            }
            else if (element.PrecautionID == 3) {
              element.Class = this.savedPrecautionIds.find((x: any) => x.PrecautionID == element.PrecautionID) != undefined ? "pain_reaction position-relative text-center py-2 cursor-pointer text-center active" : "pain_reaction position-relative text-center py-2 cursor-pointer text-center";
            }
            else if (element.PrecautionID == 4) {
              element.Class = this.savedPrecautionIds.find((x: any) => x.PrecautionID == element.PrecautionID) != undefined ? "pain_reaction position-relative text-center py-2 cursor-pointer text-center active" : "pain_reaction position-relative text-center py-2 cursor-pointer text-center";
            }
            else if (element.PrecautionID == 5) {
              element.Class = this.savedPrecautionIds.find((x: any) => x.PrecautionID == element.PrecautionID) != undefined ? "pain_reaction position-relative text-center py-2 cursor-pointer text-center active" : "pain_reaction position-relative text-center py-2 cursor-pointer text-center";
            }
            else if (element.PrecautionID == 6) {
              element.Class = this.savedPrecautionIds.find((x: any) => x.PrecautionID == element.PrecautionID) != undefined ? "pain_reaction position-relative text-center py-2 cursor-pointer text-center active" : "pain_reaction position-relative text-center py-2 cursor-pointer text-center";
            }
          }
          else {
            element.Class = "pain_reaction position-relative text-center py-2 cursor-pointer text-center";
          }
        });
      }
      //this.fetchTypePrecautions();
    }, error => {
      console.error('Get Data API error:', error);
    })
  }

  openJustificationModal() {
    $("#precautionJustificationModal").modal('show');
  }

  savePatientPrecaution() {
    this.selectedPrecautions = this.typeOfPrecautions
      .filter((element: any) => element.Class.includes("active"))
      .map((element: any) => ({
        PRECID: element.PrecautionID
      }));
    if (this.selectedPrecautions.length == 0 && this.PatientPrecautionID == undefined) {
      this.errorMsg = "Please select atleast one Type Of Precautions";
      $("#showTypeOfPrecautionsValidationMsg").modal('show');
      return;
    }

    //if (this.selectedPrecautions.length > 0) {
    let payload = {
      "PatientPrecautionID": this.PatientPrecautionID == "" ? 0 : this.PatientPrecautionID,
      "PatientID": this.selectedView.PatientID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "Admissionid": this.selectedView.AdmissionID,
      "PatientPrecautionList": this.selectedPrecautions,
      "UserID": this.doctorDetails[0].UserId,
      "Remarks": this.precautionRemarks
    }
    this.config.savePatientPrecautions(payload).subscribe((response) => {
      if (response.Code == 200) {
        $("#precautionJustificationModal").modal('hide');
        $("#saveTypeOfPrecautionsMsg").modal('show');
        this.fetchPatientPrecaution();
      }
    }, error => {
      console.error('Save API error:', error);
    });
    // } else {
    //   $("#showTypeOfPrecautionsValidationMsg").modal('show');
    // }
  }


}
