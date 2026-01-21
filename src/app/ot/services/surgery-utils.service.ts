import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SurgeryUtilsService {
  item: any;
  doctorDetails: any;

  constructor() {
     this.item = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
     this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
   }

  isSaveDisabled(): boolean {
    if (!this.item.ScheduleDate || !this.item.ScheduleToTime) return false;

    try {
      const dateTimeStr = `${this.item.ScheduleDate} ${this.item.ScheduleToTime}`;
      const scheduleDateTime = new Date(dateTimeStr);

      if (isNaN(scheduleDateTime.getTime())) return false;

      const restrictionTime = new Date(scheduleDateTime.getTime() + this.doctorDetails[0].SurgeryNoteRestriction * 60 * 60 * 1000);
      const now = new Date();

      return now > restrictionTime;
    } catch (err) {
      console.error('Error in date parsing:', err);
      return false;
    }
  }
}
