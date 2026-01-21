import { Component, OnInit, ViewChild } from '@angular/core';
import { CommunicationsNotesComponent } from '../communications-notes/communications-notes.component';
import { Router } from '@angular/router';
import { UtilityService } from 'src/app/shared/utility.service';
import { BaseComponent } from 'src/app/shared/base.component';
declare var $: any;
@Component({
  selector: 'app-communications-landing',
  templateUrl: './communications-landing.component.html',
  styleUrls: []
})

export class CommunicationsLandingComponent extends BaseComponent implements OnInit {
  templatesList: any = [];
  filteredTemplates: any[] = [];
  searchText: string = '';
  templateId: number = 1;
  IsHeadNurse: any;
  IsHome = true;
  patinfo: any;
  communicationsNotesList: any = [];
  actionsTakenList: any = [{
    id: 1, name: 'Notified Head of the Department'
  },
  {
    id: 2, name: 'Initiated OVR',

  }, {
    id: 3, name: 'Notified Nursing Supervisor'
  }]

  @ViewChild('cnotes', { static: false }) cnotes: CommunicationsNotesComponent | undefined;

  patientDetails: any;
  constructor(private router: Router, private us: UtilityService) {
    super();
    this.templatesList.push({ 'id': 1, 'name': 'Communication Notes', templatename: 'cnotes' });
    this.filteredTemplates = this.templatesList;

    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
  }

  ngOnInit(): void {
    this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
  }

  filterTemplates(event: any) {
    this.filteredTemplates = this.templatesList.filter((template: any) =>
      template.name.toLowerCase().includes(event.target.value.toLowerCase().trim())
    );
  }

  open(id: any) {
    this.templateId = id;
  }



  save() {
    switch (this.templateId) {
      case 1:
        this.cnotes?.save();
        break;
      default:
        break;
    }
  }
  clear() {
    switch (this.templateId) {
      case 1:
        this.cnotes?.clear();
        break;
      default:
        break;
    }
  }
  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }
  openQuickActions() {
    this.patinfo = this.patientDetails;
    $("#quickaction_info").modal('show');
  }
  clearPatientInfo() {
    this.patinfo = "";
  }
  closeModal() {
    $("#quickaction_info").modal('hide');
  }

  fetchCommunicationNotes() {
    this.us.get(`FetchDoctorCommunicationNotes?IPID=${this.selectedView.AdmissionID}&WorkStationID=${this.wardID}&HospitalID=${this.hospitalID}`).subscribe((response: any) => {
      if (response.Code === 200) {
        this.communicationsNotesList = response.FetchDoctorCommunicationNotesDataList;
        $("#viewCommModal").modal('show');
      }
    }, () => {

    });
  }
  getActionTakenItems(value: string) {
    const ids = value.split(',');
    let names: any = [];
    ids.forEach((id: any) => {
      const item = this.actionsTakenList.find((x: any) => x.id.toString() === id.toString());
      if (item) {
        names.push(item.name);
      }
    });
    return names.toString();
  }
}
