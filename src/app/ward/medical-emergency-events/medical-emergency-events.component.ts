import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-medical-emergency-events',
  templateUrl: './medical-emergency-events.component.html',
  styleUrls: ['./medical-emergency-events.component.scss']
})
export class MedicalEmergencyEventsComponent implements OnInit {
  IsHeadNurse: any;
  IsHome = true;
  showPrescription: string = 'No';

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  showPrescriptionSection(presVal: any) {
    this.showPrescription = this.showPrescription === 'No' ? 'Yes' : 'No';
  }
}
