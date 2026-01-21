import { Component, OnInit } from '@angular/core';
import { ResourceblockingService } from './resourceblocking.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';

declare var $: any;

@Component({
  selector: 'app-resourceblocking',
  templateUrl: './resourceblocking.component.html',
  styleUrls: ['./resourceblocking.component.scss'],
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
export class ResourceblockingComponent extends BaseComponent implements OnInit {
  url = '';
  listOfSpecialisation: any = [];
  locationList: any = [];
  form: any;
  doctorList: any = [];
  filterDoctor: any = [];
  facilityId: any;
  selectAll = false;
  selectedDoctor: any;
  listOfItems: any;
  currentDate: any;
  selectedDate: any = {};
  selectedTime: any = {};
  doctorSearch = false;
  showDoctorSlots = false;
  listOfDates: any;
  listOfTimeSlots: any = [];
  morningTimeSlots: any = [];
  afternoonTimeSlots: any = [];
  eveningTimeSlots: any = [];
  morningTimeSlots1: any = [];
  afternoonTimeSlots1: any = [];
  eveningTimeSlots1: any = [];
  patientDetails: any;
  selectedPatientId: string = "";
  selectedPatientSSN: string = "";
  selectedScheduleID: string = "";
  selectedAppToCancel: any;
  appSaveMsg: string = "Appointment saved successfully";
  selectedAppToReschedule: any;
  isReschedule = false;
  listOfClinicTimings: any = [];
  clinicTimings: string = "";
  listOfDatesFiltered: any = [];
  txtViewMore: string = "View More";
  SelectedDateA: string = "";
  SelectedDay: string = "";
  listOfResourceTimeSlots: any = [];
  showActionTakenMandatoryMsg = false;
  showReasonMandatoryMsg = false;
  showRemarksMandatoryMsg = false;
  actionTakenList: any = [];
  cancelResonsList: any = [];
  cancelForm!: FormGroup;

  constructor(private service: ResourceblockingService,
    private us: UtilityService, private formbuilder: FormBuilder, public datepipe: DatePipe) {
    super()
    this.facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
    this.service.param = {
      ...this.service.param,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID
    };
    this.form = this.formbuilder.group({
      HospitalID: [],
      HospitalName: [''],
      SpecialiseID: [''],
      Specialisation: [''],
      DoctorID: [''],
      DoctorName: [''],
      AppointmentsDate: ['']
    });
    this.cancelForm = this.formbuilder.group({
      ActionTypeID: ['0'],
      CancelReasonID: ['0'],
      Remarks: ['']
    });
  }

  ngOnInit(): void {
    this.fetchHospitalLocations();
    this.currentDate = moment(new Date()).format('DD-MMM-YYYY');
    this.form.patchValue({
      AppointmentsDate: new Date()
    });
    this.selectedDate.fullDate = this.currentDate;
    var d = new Date(this.currentDate);
    //var dayName = d.toString().split(' ')[0];
    const day = d.toString().split(' ')[0]; //second index after 0


    this.SelectedDay = moment().day(day).format("dddd");
    this.SelectedDateA = this.currentDate;;
  }

  fetchHospitalLocations() {
    this.url = this.service.getData(resourceblocking.fetchHospitalLocations, {});
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.locationList = response.HospitalLocationsDataList;

          var res = response.HospitalLocationsDataList.filter((h: any) => h.HospitalID == this.hospitalID);
          this.selectedHospital(res[0]);
        }
      },
        (err) => {
        })
  }

  selectedHospital(item: any) {
    this.form.patchValue({
      HospitalID: item.HospitalID,
      HospitalName: item.Name,
    });
  }

  fetchSpecialisationSearch(event: any) {
    if (event.target.value.length >= 3) {
      this.url = this.service.getData(resourceblocking.fetchGSpecialisation, { Type: 2, DisplayName: event.target.value });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfSpecialisation = response.FetchGSpecialisationDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfSpecialisation = [];
    }
  }

  selectSpecialisationItem(item: any) {
    this.doctorList = [];
    this.listOfSpecialisation = [];
    this.listOfTimeSlots = [];
    this.selectedDoctor = [];
    this.SelectedDateA = "";
    this.SelectedDay = "";
    this.form.patchValue({
      SpecialiseID: item.SpecialiseID,
      Specialisation: item.Specialisation
    });
    this.fetchSpecializationDoctor(item);
  }

  fetchSpecializationDoctor(item: any) {
    this.url = this.service.getData(resourceblocking.fetchSpecializationDoctorTimings, { SpecializationID: item.SpecialiseID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.doctorList = response.GetAllDoctorsList;

          if (this.doctorSearch) {
            var doc = this.doctorList.find((x: any) => x.EmpID == this.form.get('DoctorID')?.value);
            item.SpecialityName = doc.SpecialityName;
            this.form.patchValue({
              SpecialiseID: doc.SpecialiseId,
              Specialisation: doc.SpecialityName
            });
            this.doctorList.forEach((i: any) => {
              i.Specialization = doc.SpecialityName;
              if (i.EmpID === doc.EmpID) {
                i.selected = true;
                this.loadSelectedDoctorAvailability(i);
              }
              else
                i.selected = false;
            });
          }
          else {
            this.doctorList.forEach((i: any) => {
              i.Specialization = item.SpecialityName;
              i.selected = false;
            });
          }
          this.filterDoctor = this.doctorList;
          this.showDoctorSlots = true;

        }
      },
        (err) => {
        })
  }

  fetchDoctorSearch(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.url = this.service.getData(resourceblocking.FetchReferalDoctors, { Tbl: 11, Name: filter });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfItems = response.ReferalDoctorDataList;
          }
        },
          (err) => {
          })

    }
    else {
      this.listOfItems = [];
    }
  }

  selectDocor(item: any) {
    this.doctorSearch = true;
    this.form.patchValue({
      DoctorID: item.DoctorID,
      DoctorName: item.DoctorName
    });
    item.SpecialiseID = item.DoctorSpecialisationID;
    this.fetchSpecializationDoctor(item);
  }

  fetchDoctors(event: any) {
    if (!event.target.value) {
      this.doctorList = this.filterDoctor;
    }
    else {
      var res = this.filterDoctor.filter((e: any) => e.EmpCodeName.toUpperCase().includes(event.target.value.toUpperCase()));
      this.doctorList = res;
    }
  }

  onDoctorEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.fetchDoctors(event);
    }
  }

  selectAllDoctor() {
    this.selectAll = !this.selectAll;
    this.doctorList.forEach((i: any) => {
      i.selected = this.selectAll;
    });
  }

  getDocAppointmentsOnDateChange() {
    this.selectedDate.fullDate = moment(this.form.get('AppointmentsDate')?.value).format('DD-MMM-YYYY');
    var item = this.doctorList.find((x: any) => x.EmpID === this.selectedDoctor.EmpID);
    this.loadSelectedDoctorAvailability(item);
  }

  loadSelectedDoctorAvailability(item: any) {
    this.isReschedule = false;
    this.doctorList.forEach((element: any, index: any) => {
      if (element.EmpID === item.EmpID) {
        element.selected = true;
        this.selectedDoctor = item;
      }
      else {
        element.selected = false;
      }
    });
    var payload = {
      "SpecialityId": this.form.get('SpecialiseID')?.value,
      "HospitalId": this.hospitalID,
      "DoctorId": item.EmpID,
      "ScheduleDate": this.selectedDate.fullDate
    }

    this.us.post(resourceblocking.GettingDateBookedSlots, payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          //this.listOfDates = response.AppointmentList;
          //this.getClinicTimings();
          this.listOfTimeSlots = response.AppointmentList;
          this.listOfResourceTimeSlots = response.ResAppointmentList;
          this.morningTimeSlots = [];
          this.afternoonTimeSlots = [];
          this.eveningTimeSlots = [];
          this.listOfTimeSlots.forEach((value: any, index: any) => {
            this.prepareSlots(value);
          });
          if (response.AppointmentList.length > 0) {
            this.SelectedDateA = response.AppointmentList[0].SCHEDULEDATE;
            this.SelectedDay = response.AppointmentList[0].SCHEDULEDAY;
          } else {
            this.SelectedDateA = this.selectedDate.fullDate;
            //this.SelectedDay = this.selectedDate.fullDate;//response.AppointmentList[0].SCHEDULEDATE;
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const currentDayOfWeek = daysOfWeek[this.selectedDate.fullDate.getDay()];
            this.SelectedDay = currentDayOfWeek;
          }


          this.morningTimeSlots.map((slot: any) => {
            slot.modTime = moment(slot.FROMTIME, ["HH:mm"]).format("hh:mm A");
          })
          this.afternoonTimeSlots.map((slot: any) => {
            slot.modTime = moment(slot.FROMTIME, ["HH:mm"]).format("hh:mm A");
          })
          this.eveningTimeSlots.map((slot: any) => {
            slot.modTime = moment(slot.FROMTIME, ["HH:mm"]).format("hh:mm A");
          })
        }
      },
        (err) => {

        })

  }
  addSelectedTime1(time: any) {
    //time.selected = true;
    this.selectedTime = time;
    this.morningTimeSlots1.forEach((element: any, index: any) => {
      if (element.FROMSLOTID === time.FROMSLOTID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.afternoonTimeSlots1.forEach((element: any, index: any) => {
      if (element.FROMSLOTID === time.FROMSLOTID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.eveningTimeSlots1.forEach((element: any, index: any) => {
      if (element.FROMSLOTID === time.FROMSLOTID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
  }
  addSelectedTime(time: any) {
    //time.selected = true;
    this.selectedTime = time;
    this.selectedScheduleID = time.ScheduleID;
    this.morningTimeSlots.forEach((element: any, index: any) => {
      if (element.FROMSLOTID === time.FROMSLOTID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.afternoonTimeSlots.forEach((element: any, index: any) => {
      if (element.FROMSLOTID === time.FROMSLOTID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.eveningTimeSlots.forEach((element: any, index: any) => {
      if (element.FROMSLOTID === time.FROMSLOTID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.loadPatientDetails(time.PatientID);
  }

  loadPatientDetails(patientId: any) {
    this.service.fetchPatientDataC = {
      ...this.service.fetchPatientDataC,
      SSN: "0",
      PatientID: patientId,
      MobileNO: "0",
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    }
    this.url = this.service.fetchPatientDataBySsn(resourceblocking.fetchPatientDataBySsn);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientDetails = response.FetchPatientDataCCList[0];
          this.selectedPatientId = this.patientDetails.PatientID;
          this.selectedPatientSSN = this.patientDetails.SSN;
        }
      },
        (err) => {

        })
  }

  prepareSlots(value: any) {
    var date = new Date(new Date().setHours(value.FROMTIME.split(':')[0], value.FROMTIME.split(':')[1], 0, 0));
    var morningFromDate = new Date(new Date().setHours(0, 0, 0, 0));
    var morningEndDate = new Date(new Date().setHours(13, 0, 0, 0));
    var afternoonFromDate = new Date(new Date().setHours(13, 0, 0, 0));
    var afternoonEndDate = new Date(new Date().setHours(18, 0, 0, 0));
    var eveningFromDate = new Date(new Date().setHours(18, 0, 0, 0));
    var eveningEndDate = new Date(new Date().setHours(23, 59, 0, 0));
    if (date >= morningFromDate && date < morningEndDate) {
      this.morningTimeSlots.push(value);
    }
    if (date >= afternoonFromDate && date < afternoonEndDate) {
      this.afternoonTimeSlots.push(value);
    }
    if (date >= eveningFromDate && date < eveningEndDate) {
      this.eveningTimeSlots.push(value);
    }
  }
  prepareSlots1(value: any) {
    var date = new Date(new Date().setHours(value.FROMTIME.split(':')[0], value.FROMTIME.split(':')[1], 0, 0));
    var morningFromDate = new Date(new Date().setHours(0, 0, 0, 0));
    var morningEndDate = new Date(new Date().setHours(13, 0, 0, 0));
    var afternoonFromDate = new Date(new Date().setHours(13, 0, 0, 0));
    var afternoonEndDate = new Date(new Date().setHours(18, 0, 0, 0));
    var eveningFromDate = new Date(new Date().setHours(18, 0, 0, 0));
    var eveningEndDate = new Date(new Date().setHours(23, 59, 0, 0));
    if (date >= morningFromDate && date < morningEndDate) {
      this.morningTimeSlots1.push(value);
    }
    if (date >= afternoonFromDate && date < afternoonEndDate) {
      this.afternoonTimeSlots1.push(value);
    }
    if (date >= eveningFromDate && date < eveningEndDate) {
      this.eveningTimeSlots1.push(value);
    }
  }

  cancelAppointmentConfirmation(app: any) {
    this.selectedAppToCancel = app;
    $("#cancelConfirmationMsg").modal('show');
  }

  showCancelReasons() {
    this.loadCancelReasons();
    this.loadActionTaken();
    $("#cancelReasons").modal('show');
  }

  loadCancelReasons() {
    this.url = this.service.getData(resourceblocking.FetchCancelReasons, { HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.cancelResonsList = response.GetMasterDataList;
        }
      },
        (err) => {
        })
  }

  loadActionTaken() {
    this.url = this.service.getData(resourceblocking.FetchActionTaken, { HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.actionTakenList = response.GetMasterDataList;
        }
      },
        (err) => {
        })
  }

  cancelAppointment(app: any) {
    if (this.cancelForm.get("ActionTypeID")?.value != '0' && this.cancelForm.get("CancelReasonID")?.value != '0' && this.cancelForm.get("Remarks")?.value != '') {
      var cancelPayload = {
        "ScheduleID": this.selectedScheduleID,
        "PatientID": this.selectedPatientId,
        "HOSPITALID": this.hospitalID,
        "ActionTypeID": this.cancelForm.get("ActionTypeID")?.value,
        "CancelReasonID": this.cancelForm.get("CancelReasonID")?.value,
        "CancelRemarks": this.cancelForm.get("Remarks")?.value
      }

      this.us.post(resourceblocking.CancelAppointment, cancelPayload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#cancelReasons").modal('hide');
            this.appSaveMsg = "Appointment cancelled successfully";
            $("#appointmentSaveMsg").modal('show');
          }
        },
          (err) => {

          })
    }
    else {
      if (this.cancelForm.get("ActionTypeID")?.value == '0')
        this.showActionTakenMandatoryMsg = true;
      if (this.cancelForm.get("CancelReasonID")?.value == '0')
        this.showReasonMandatoryMsg = true;
      if (this.cancelForm.get("Remarks")?.value == '')
        this.showRemarksMandatoryMsg = true;
    }
  }

  clearResourceBlocking() {
    this.showDoctorSlots = false; this.doctorSearch = false;
    this.selectedPatientId = ""; $("#txtSsn").val('');
    this.selectedDoctor = []; this.patientDetails = []; this.doctorList = []; this.listOfDates = []; this.listOfResourceTimeSlots = [];
    this.morningTimeSlots = []; this.afternoonTimeSlots = []; this.eveningTimeSlots = []; this.listOfItems = [];
    this.selectedAppToCancel = [];
    this.form = this.formbuilder.group({
      HospitalID: [],
      HospitalName: [''],
      SpecialiseID: [''],
      Specialisation: [''],
      DoctorID: [''],
      DoctorName: [''],
      AppointmentsDate: ['']
    });
    this.form.patchValue({
      AppointmentsDate: new Date()
    });
    this.selectedDate.fullDate = this.currentDate;
    this.SelectedDateA = "";
    this.SelectedDay = "";
    this.fetchHospitalLocations();
  }

  loadDoctorAvaliabilityForReschedule(app: any) {
    this.selectedAppToReschedule = app;
    this.isReschedule = true;
    this.form.setValue({
      SpecialiseID: app.SPECIALITYID,
      Specialisation: app.SPECIALITY,
      HospitalID: app.HOSPITALID,
      HospitalName: this.locationList.find((x: any) => x.HospitalID === app.HOSPITALID).Name,
      DoctorID: app.DOCTORID,
      DoctorName: this.selectedDoctor.EmpCodeName,
      AppointmentsDate: new Date(app.SCHEDULEDATE)
    });
    this.url = this.service.getData(resourceblocking.fetchSpecializationDoctorTimings, { SpecializationID: app.SPECIALITYID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.showDoctorSlots = true;
          this.doctorList = response.GetAllDoctorsList;

          this.doctorList.forEach((i: any) => {
            i.Specialization = app.SPECIALITY;
            if (i.EmpID === app.DOCTORID) {
              i.selected = true;
              this.loadSelectedDoctorAvailabilityForReschedule(i);
            }
            else
              i.selected = false;
          });

          this.filterDoctor = this.doctorList;
        }
      },
        (err) => {
        })
  }
  loadSelectedDoctorAvailabilityForReschedule(item: any) {
    this.doctorList.forEach((element: any, index: any) => {
      if (element.EmpID === item.EmpID) {
        element.selected = true;
        this.selectedDoctor = item;
      }
      else {
        element.selected = false;
      }
    });

    var currentDate = moment(new Date()).format('DD-MMM-YYYY');
    var appointmentpayoad = {
      "SpecialiseId": this.form.get('SpecialiseID')?.value,
      "HospitalId": this.hospitalID,
      "DoctorId": item.EmpID,
      "ScheduleDate": this.selectedDate.fullDate
    }

    this.us.post(resourceblocking.getAvailableDates, appointmentpayoad)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfDates = response.DatesList;
          this.listOfDatesFiltered = this.listOfDates;
          this.selectedDate.fullDate = this.listOfDates[0].fullDate;
          if (this.selectedDate.fullDate) {
            this.getTimeslots(item);
            //this.getClinicTimings(item);
          }
        }
      },
        (err) => {

        })
  }
  getTimeslots(date: any) {
    var currentDate = moment(new Date()).format('DD-MMM-YYYY');
    var timeslotpayload = {
      "SpecialityId": this.form.get('SpecialiseID')?.value,
      "HospitalId": this.hospitalID,
      "DoctorId": this.selectedDoctor.EmpID,
      "ScheduleDate": this.selectedDate.fullDate
    }
    this.us.post(resourceblocking.getTimeSlots, timeslotpayload)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          this.getClinicTimings();
          this.listOfTimeSlots = response.AppointmentList;
          this.morningTimeSlots1 = [];
          this.afternoonTimeSlots1 = [];
          this.eveningTimeSlots1 = [];
          this.listOfTimeSlots.forEach((value: any, index: any) => {
            this.prepareSlots1(value);
          });

          this.morningTimeSlots1.map((slot: any) => {
            slot.modTime = moment(slot.FROMTIME, ["HH:mm"]).format("hh:mm A");
          })
          this.afternoonTimeSlots1.map((slot: any) => {
            slot.modTime = moment(slot.FROMTIME, ["HH:mm"]).format("hh:mm A");
          })
          this.eveningTimeSlots1.map((slot: any) => {
            slot.modTime = moment(slot.FROMTIME, ["HH:mm"]).format("hh:mm A");
          })
        }
      },
        (err) => {

        })
  }
  getClinicTimings() {
    var currentDate = moment(new Date()).format('DD-MMM-YYYY');
    var timeslotpayload = {
      "SpecialityId": this.form.get('SpecialiseID')?.value,
      "HospitalId": this.hospitalID,
      "DoctorId": this.selectedDoctor.EmpID,
      "ScheduleDate": this.selectedDate.fullDate
    }
    this.us.post(resourceblocking.getClinicTimings, timeslotpayload)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          this.listOfClinicTimings = response.AppointmentListN;
          if (this.listOfClinicTimings.length > 1) {
            this.clinicTimings = "";
            this.listOfClinicTimings.forEach((element: any, index: any) => {
              if (this.clinicTimings != '')
                this.clinicTimings += " | " + element.FromDateTime + "-" + element.ToDateTime;
              else
                this.clinicTimings = element.FromDateTime + "-" + element.ToDateTime;
            });
          }
          else {
            this.clinicTimings = this.listOfClinicTimings[0].FromDateTime + "-" + this.listOfClinicTimings[0].ToDateTime;
          }
        }
      },
        (err) => {

        })
  }
  addSelectedDate(date: any) {
    this.selectedDate = date;
    this.selectedTime = {};
    this.getTimeslots(date);
  }
  viewMoreDates() {
    if (this.txtViewMore === "View More") {
      this.txtViewMore = "View Less";
      this.listOfDatesFiltered = this.listOfDates;
    }
    else {
      this.txtViewMore = "View More";
      this.listOfDatesFiltered = this.listOfDates.slice(0, 10);
    }

  }

  rescheduleAppointment(app: any) {
    var reschedulePayload = {
      "PatientID": this.selectedPatientId,
      "HOSPITALID": this.hospitalID,
      "PATIENTNAME": this.patientDetails.PatientName,
      "AGE": this.patientDetails.Age,
      "AGEUOMID": this.patientDetails.AgeUoMID,
      "MOBILE": this.patientDetails.MobileNo,
      "GENDERID": this.patientDetails.GenderID,
      "DOCTORID": app.DOCTORID,
      "SpecialiseID": app.SPECIALITYID,
      "SCHEDULEDATE": this.selectedDate.fullDate,
      "FROMSLOTID": this.selectedTime.FROMSLOTID,
      "TOSLOTID": this.selectedTime.TOSLOTID,
      "Remarks": "Resource Blocking Appointment",
      "SCHEDULESTRING": "",
      "PREVIOUSSCHEDULEID": app.ScheduleID,
      "IsVitual": 0,
      "TeleURL": null
    }

    this.us.post(resourceblocking.RescheduleAppointment, reschedulePayload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.appSaveMsg = "Appointment rescheduled successfully";
          $("#appointmentSaveMsg").modal('show');
        }
      },
        (err) => {

        })
  }

  onRemarksChange() {
    this.showRemarksMandatoryMsg = false;
  }
  onActionTypeChange() {
    this.showActionTakenMandatoryMsg = false;
  }
  onCancelReasonChange() {
    this.showReasonMandatoryMsg = false;
  }
}

export const resourceblocking = {
  fetchGSpecialisation: 'FetchGSpecialisation?Type=${Type}&DisplayName=${DisplayName}',
  fetchHospitalLocations: 'FetchHospitalLocations?type=0&filter=blocked=0&UserId=0&WorkstationId=0',
  fetchSpecializationDoctor: 'FetchSpecializationDoctor?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchSpecializationDoctorTimings: 'FetchSpecializationDoctorTimings?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  saveResourceAvailbility: 'SaveResourceAvailbility',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  AppointmentListNL: 'AppointmentListNL',
  CancelAppointment: 'CancelAppointment',
  RescheduleAppointment: 'RescheduleAppointment',
  FetchReferalDoctors: 'FetchReferalDoctors?Tbl=${Tbl}&Name=${Name}',
  GettingDateBookedSlots: 'GettingDateBookedSlots',
  getClinicTimings: 'GettingDateSlotsN',
  getTimeSlots: 'GettingDateSlots',
  getAvailableDates: 'GetAvailableDates',
  FetchCancelReasons: 'FetchCancelReasons?HospitalID=${HospitalID}',
  FetchActionTaken: 'FetchActionTaken?HospitalID=${HospitalID}'
};  