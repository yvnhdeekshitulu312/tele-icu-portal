import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-doctor-requests',
  templateUrl: './doctor-requests.component.html',
  styleUrls: ['./doctor-requests.component.scss']
})
export class DoctorRequestsComponent implements OnInit {
  tabType = "admrecon";
  readonly = false;
  childClickName: any;
  vteType = "medical";
  endofEpisode: any;
  IsNurse: any;
  selectedView: any;
  patientDetails: any;
  selectedCard: any;
  PatientType: any;
  isPregnancy: boolean = false;
  isVTESurgicalNew: boolean = false;
  constructor(private config: ConfigService) { 
    this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.selectedCard = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');

  }

  ngOnInit(): void {

    //To open new VTE Surgical form based on Key
    const doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.isVTESurgicalNew = doctorDetails[0]?.VTESURNEW === 'YES' ? true : false;

    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    if (this.selectedView.PatientID === undefined || this.selectedView.PatientType === '3') {
      this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
      this.selectedView.IPID = this.selectedView.AdmissionID;
      this.patientDetails=JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    }
      

    this.PatientType = this.selectedView.PatientType;

    const navcomp = sessionStorage.getItem("navigation");
    this.IsNurse = sessionStorage.getItem("IsNurse");

    if(navcomp === 'AdmissionReconciliation') 
    {
      this.tabType = "admrecon";
      sessionStorage.removeItem("navigation");
    }
    else if(navcomp === 'VTEForms') {
      this.tabType = "vte";
      sessionStorage.removeItem("navigation");
    }
    else if(navcomp === 'VTE Medical') {
      this.tabType = "vte";
      this.vteType = "medical";
      sessionStorage.removeItem("navigation");
    }
    else if(navcomp === 'VTE Surgical') {
      this.tabType = "vte";
      this.vteType = "surgical";
      sessionStorage.removeItem("navigation");
    }
    else if(navcomp === 'VTE ObGyne') {
      this.tabType = "vte";
      this.vteType = "Obg";
      sessionStorage.removeItem("navigation");
    }
    else if(navcomp === 'VTE Antenatal') {
      this.tabType = "vte";
      this.vteType = "antenatal";
      sessionStorage.removeItem("navigation");
    }
    if (this.IsNurse === 'true') {
      this.endofEpisode = true;
    }else {
      if (sessionStorage.getItem("ISEpisodeclose") === "true") {
        this.endofEpisode = true;
      } else {
        this.endofEpisode = false;
      }

    }
    this.fetchPregenencyHistory();
  }

 

  toggleVte(type: any) {
    this.vteType = type;
  }

  tablClick(type: string) {
    this.tabType = type;
    if(type === 'patienteforms') {
      sessionStorage.setItem("selectedView", JSON.stringify(this.patientDetails));
      sessionStorage.setItem("PatientID", JSON.stringify(this.patientDetails.PatientID));
      sessionStorage.setItem("PatientDetails", JSON.stringify(this.patientDetails));
      sessionStorage.setItem("fromOrDashboard", "true");
      sessionStorage.setItem("ssnEForms", this.patientDetails.SSN);
    }
  }

  fetchPregenencyHistory() {
    this.config.fetchPregenencyHistoryADV(this.selectedView?.PatientID, this.selectedView?.AdmissionID).subscribe((response: any) => {
      if (response.Code == "200") {
        if (response.PregnancyHisDataList.length > 0) {
          this.isPregnancy = true;
        }
      }
    });
  }

  enableVteAntenatal() {
   // if(this.selectedView?.PatientType != '2' && this.selectedView?.SpecialiseID == '78' && this.isPregnancy) {
    if(this.selectedView?.GenderID == '2') {
      return true;
    }
    return false;
  }

}
