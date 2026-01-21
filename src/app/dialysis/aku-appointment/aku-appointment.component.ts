import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { AkuAppointmentService } from './aku-appointment.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Router } from '@angular/router';
import { time } from 'highcharts';
import { config } from 'src/environments/environment';

declare var $: any;

@Component({
  selector: 'app-aku-appointment',
  templateUrl: './aku-appointment.component.html',
  styleUrls: ['./aku-appointment.component.scss'],
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
export class AkuAppointmentComponent extends BaseComponent implements OnInit, AfterViewInit {
  @ViewChild('timeSlotsContainer', { static: true }) timeSlotsContainer!: ElementRef;
  @ViewChild('viewtimeSlotsContainer', { static: true }) viewtimeSlotsContainer!: ElementRef;
  carouselOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    margin: 10,
    navSpeed: 700,
    autoWidth: true,
    navText: ['', ''],
    nav: true
  }
  @ViewChild('picker') picker!: MatDatepicker<Date>;
  url = '';
  listOfSpecialisation: any = [];
  locationList: any = [];
  form: any;
  doctorList: any = [];
  roomsList: any = [];
  roomsListWithoutFilter: any = [];
  groupedRoomsList: any = [];
  filterDoctor: any = [];
  facilityId: any;
  selectAll = false;
  selectedDoctor: any;
  selectedRoom: any;
  listOfDates: any = [];
  listOfAppointments: any = [];
  listOfDatesFiltered: any = [];
  listOfTimeSlots: any = [];
  listOfClinicTimings: any = [];
  selectedDate: any = {};
  selectedTime: any = {};
  tablePatientsForm!: FormGroup;
  cancelForm!: FormGroup;
  morningTimeSlots: any = [];
  afternoonTimeSlots: any = [];
  eveningTimeSlots: any = [];
  waitingTimeSlots: any = [];
  multiplePatients: any
  patientDetails: any;
  showPatientValidation = false;
  selectedPatientId: string = "";
  selectedPatientSSN: string = "";
  AppointmentCount: string = "";
  currentDate: any;
  currentDateForStyle: any;
  errorMessages: any[] = [];
  latestDoctorVisits: any = []
  showDoctorSlots = false;
  showVisitInfoTab = false;
  listofUpcomingAppointments: any = [];
  selectedAppToReschedule: any;
  selectedAppToCancel: any;
  isReschedule = false;
  appSaveMsg: string = "OT Room Booked successfully";
  clinicTimings: string = "";
  noVisitMsg: string = "No Visits";
  listOfItems: any;
  doctorSearch = false;
  txtViewMore = "View More";
  Genders: any;
  showActionTakenMandatoryMsg = false;
  showReasonMandatoryMsg = false;
  showRemarksMandatoryMsg = false;
  actionTakenList: any = [];
  cancelResonsList: any = [];
  numsYears: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  BookingInfoTab = '3';
  BookingInfoTabs = true;
  waitingDaySlot: string = "";
  waitingListAppointments: any = [];
  orRoomBookedSlotsView: any = [];
  orRoomBookedSlots: any = [];
  orRoomBookedSlotsDateWise: any = [];
  orNextAvailableSlotsDateWise: any = [];
  waitinglistdate = new Date();
  WaitingListCount: string = "";
  WaitingListCountToBook: string = "";
  isSlotAvailable = false;
  item: any;
  timesForm: any;
  rescheduletimesForm: any;
  viewavailabletimesForm: any;
  viewScheduleDate: any;
  viewSelectedRoom: string = '0';
  timeSlots: string[] = [];
  fromTime: any;
  toTime: any;
  selectedSlots: any;
  selectedOrSchedule: any;
  collapseRoomsList = false;
  showBookAppValidationMsg = false;
  showRescheduleAppValidationMsg = false;
  isScheduled = false;
  scheduleDatesForm!: FormGroup;
  cancelConfirmMsg: string = "Are you sure you want to cancel Appointment ?";
  nextAvailableSlot: string = "";
  nextAvailableSlotForRoom: string = "";
  showRoomMessage = false;
  navigatedFromCasesheet = 'false';
  @Input() fromCasesheet: any;
  roomCleaningTimeSlots: any = [];
  currentTime: Date = new Date();
  estTime : number = 60 ;
  heightOfDiv = 0;
  ssnNumber = 0;
  patientVisits: any = [];
  patientAkuProcedures : any = [];
  selectedAdmissionID : any;
  fromAkuWorklist : string = "false";
  facility: any;

  constructor(private service: AkuAppointmentService, private router: Router,
    private us: UtilityService, private formbuilder: FormBuilder, public datepipe: DatePipe, private elRef: ElementRef) { 
      super()
    this.form = this.formbuilder.group({
      VisitID: ['0'],
      HospitalID: [],
      HospitalName: [''],
      SpecialiseID: [''],
      Specialisation: [''],
      DoctorID: [''],
      DoctorName: ['']
    });

    this.timesForm = this.formbuilder.group({
      FromTime: [],
      ToTime: []
    });

    this.rescheduletimesForm = this.formbuilder.group({
      RoomID: ['0'],
      FromDate: new Date(),
      FromTime: [],
      ToTime: []
    });
    this.viewavailabletimesForm = this.formbuilder.group({
      RoomID: ['0'],
      ViewScheduleDate: new Date()
    });
    this.scheduleDatesForm = this.formbuilder.group({
      ScheduleDate: new Date()
    });
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '');
    this.generateTimeSlots();
    if (sessionStorage.getItem("otpatient") != 'undefined')
      this.item = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
    if (this.item) {
      {
        this.form.patchValue({
          SpecialiseID: 50,
          Specialisation: this.item.Specialisation          
        });


        this.doctorList.push(
          {
            "EmpID": this.item.SurgeonID,
            "EmpCodeName": this.item.SurgeonName,
            "DoctorName2L": " حسام أحمد رماح",
            "SpecialiseId": this.item.SurgeonSpecialiseID,
            "SpecialityName": this.item.SurgeonSpecialisation,
            "SpecialityName2L": "",
            "HospitalId": this.hospitalID,
            "Designation": this.item.SurgeonDesignation,
            "fullDate": this.item.DATETIME,
            "FROMTIME": "17:50",
            "ToTime": "18:00",
            "MinutesdDifference": "18",
            "MinutesDifferencestring": "Next Availability in : 18 Mins.",
            "HoursDifference": "0",
            "HourDifferencestring": "Next Availability in : 0 Hrs.",
            "THoursDifference": "0",
            "THourDifferencestring": "Next Availability in :0 Hrs : 18 Mins.",
            "GenderID": 1,
            "Gender": "Male",
            "NationalityID": 9,
            "Nationality": this.item.SurgeonNationality,
            "Nationality2l": "",
            "NationalityCode": this.item.SurgeonNationalityCode,
            "Rating": 0.00,
            "Language": "English,",
            "Language2L": "English,",
            "License": "03RM18499",
            "SpecialNote": "Medical doctors examine, diagnose and treat patients. They can specialize in a number of medical areas, such as pediatrics, anesthesiology or cardiology, or they can work as general practice physicians. Becoming a medical doctor requires a doctoral degree in medicine and participating in clinical training",
            "Qualification": "Master",
            "Languages": "English"
          }
        )
      }
    }

    this.facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '3395');
    this.service.param = {
      ...this.service.param,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
      WorkStationID: this.facility.FacilityID
    };

    this.cancelForm = this.formbuilder.group({
      ActionTypeID: ['0'],
      CancelReasonID: ['0'],
      Remarks: ['']
    });
    this.tablePatientsForm = this.formbuilder.group({
      FromDate: [''],
      ToDate: [''],
    });

    var wm = new Date();
    var d = new Date();
    wm.setMonth(wm.getMonth() - 1);
    this.tablePatientsForm.patchValue({
      FromDate: d,
      ToDate: d
    })
    }

  ngOnInit(): void {    
    this.navigatedFromCasesheet = sessionStorage.getItem("fromCasesheet") || 'false';
    this.fetchHospitalLocations();
    this.currentDateForStyle = new Date();
    this.currentDate = moment(new Date()).format('DD-MMM-YYYY');
    this.selectedDate.fullDate = this.currentDate;
    //this.LoadYakeenNationalities();
    var empid = this.doctorList[0].EmpID;
    this.doctorList.forEach((i: any) => {
      if (i.EmpID === empid) {
        i.selected = true;
        this.loadSelectedDoctorAvailability(i);
      }
      else
        i.selected = false;
    });
    this.fromAkuWorklist = sessionStorage.getItem("fromAkuWorklist") || 'false';
    if(this.fromAkuWorklist === 'true') {
      $("#txtSsn").val(this.item.SSN);
      this.fetchPatientDetails(this.item.SSN, '0', '0');
    }
  }


  ngAfterViewInit() {
    // this.scrollToCurrentTime();
  }

  initializePicker(): void {
    if (this.picker) {
      this.picker.dateClass = (date: Date) => {
        var dates = this.isDateInRange(date);
        if (dates.length > 0) {
          return {
            'selected-range': true,
          };
        }
        return {
          'selected-range': false,
        };
      };
    }
  }

  private isDateInRange(date: Date): any {
    return this.listOfAppointments.filter((d: any) => d.fullDate === this.datepipe.transform(date, "dd-MMM-yyyy")?.toString());
  }

  scrollToCurrentTime() {
    const currentTimeElement = this.timeSlotsContainer.nativeElement.querySelector(`[data-time="${this.getCurrentTime()}"]`);

    if (currentTimeElement) {
      currentTimeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  fetchHospitalLocations() {
    this.url = this.service.getData(akuappointments.fetchHospitalLocations, {});
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
  

  fetchPatientAKUPrescriptionprocedures(admid:string) {
    this.url = this.service.getData(akuappointments.FetchPatientAKUPrescriptionprocedures, 
      {
        AdmissionID: admid,
        UserID : this.doctorDetails[0].UserId,
        WorkStationID: this.facility.FacilityID,
        HospitalID : this.hospitalID
      });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientAKUPrescriptionproceduresDataList.length > 0) {
          this.patientAkuProcedures = response.FetchPatientAKUPrescriptionproceduresDataList[0];
          //this.FetchSurgeryScheduleAgainstOTRoom(this.patientAkuProcedures);
          this.loadSelectedRoomSchedule(this.patientAkuProcedures);

        }
        else {
          this.errorMessages = [];
          this.errorMessages.push("Patient is not having Dialysis service for this visit");
          this.form.patchValue({
            VisitID : '0'
          })
          $("#saveDoctorAppointmentValidation").modal('show');
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
      this.url = this.service.getData(akuappointments.fetchGSpecialisation, { Type: 2, DisplayName: event.target.value });
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
    this.listOfSpecialisation = [];
    this.form.patchValue({
      SpecialiseID: item.SpecialiseID,
      Specialisation: item.Specialisation
    });
    this.fetchSpecializationDoctor(item);
  }

  fetchSpecializationDoctor(item: any) {
    this.url = this.service.getData(akuappointments.fetchSpecializationDoctorTimings, { SpecializationID: item.SpecialiseID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.doctorList = response.GetAllDoctorsList;

          if (this.doctorSearch) {
            var doc = this.doctorList.find((x: any) => x.EmpID == this.form.get('DoctorID')?.value);
            const docindex = this.doctorList.indexOf(doc);
            if (docindex != 0) {
              this.doctorList.splice(docindex, 1);
              this.doctorList.splice(0, 0, doc);
            }
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
      this.url = this.service.getData(akuappointments.FetchReferalDoctors, { Tbl: 11, Name: filter });
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

  loadSelectedDoctorAvailability(item: any) {
    // const fromdate = moment(new Date()).format('DD-MMM-YYYY');
    // const todate = moment(fromdate, 'DD-MMM-YYYY').add(6, 'months').format('DD-MMM-YYYY');
    // this.url = this.service.getData(akuappointments.fetchDoctorsWiseNextAvailableBWdates, { FromDate: fromdate, ToDate: todate, DoctorID: item.EmpID, HospitalID: this.hospitalID });
    // this.us.get(this.url)
    //   .subscribe((response: any) => {
    //     if (response.Code == 200 && response.DatesList.length > 0) {
    //       this.fetchOrRooms();
    //       this.listOfAppointments = response.DatesList;
    //     }
    //   },
    //     (err) => {
    //     })


    this.doctorList.forEach((element: any, index: any) => {
      if (element.EmpID === item.EmpID) {
        element.selected = true;
        this.selectedDoctor = item;
      }
      else {
        element.selected = false;
      }
    });

    // var currentDate = moment(new Date()).format('DD-MMM-YYYY');
    // var appointmentpayoad = {
    //   "SpecialiseId": this.form.get('SpecialiseID')?.value,
    //   "HospitalId": this.hospitalID,
    //   "DoctorId": item.EmpID,
    //   "ScheduleDate": this.selectedDate.fullDate
    // }

    // this.us.post(akuappointments.getAvailableDates, appointmentpayoad)
    //   .subscribe((response: any) => {
    //     if (response.Code == 200 && response.DatesList.length > 0) {
    //       this.listOfDates = response.DatesList;
    //       this.listOfDatesFiltered = this.listOfDates;
    //       setTimeout(() => {
    //         this.initializePicker();
    //       }, 100);
    //       this.selectedDate.fullDate = this.listOfDates[0].fullDate;
    //       var selecteddate = this.listOfDates.find((x: any) => x.fullDate === this.selectedDate.fullDate);
    //       this.isSlotAvailable = selecteddate.IsAvaialbleSlot;
    //       this.WaitingListCount = selecteddate.WaitingAppointmentCount;
    //       if (this.selectedDate.fullDate) {
    //         this.getTimeslots(item);
    //         //this.getClinicTimings(item);
    //       }
    //     }
    //     else {
    //       this.errorMessages = [];
    //       this.listOfDates = [];
    //       this.errorMessages.push("Dr. " + item.EmpCodeName + " has no available slot configuration");
    //       $("#saveDoctorAppointmentValidation").modal('show');
    //     }
    //   },
    //     (err) => {

    //     })
  }

  fetchOrRooms() {
    this.url = this.service.getData(akuappointments.FetchOTROOMSurgeon,
      {
        WardID: this.facility.FacilityID, ConsultantID: 0, Status: 0, 
        DepartmentID: this.item.DepartmentID,UserId: this.doctorDetails[0].UserId, WorkStationID: 3395, Hospitalid: this.hospitalID
      });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchBedsFromWardDataList.length > 0) {
          this.roomsList = response.FetchBedsFromWardDataList;
          this.roomsListWithoutFilter = this.roomsList;
          this.roomsList.forEach((element: any, index: any) => {
            element.selected = false;
          });
          
          const distinctThings = this.roomsList.filter(
            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.WardID === thing.WardID) === i);
          console.dir(distinctThings);
          this.groupedRoomsList = distinctThings
        }
        else {
          this.errorMessages = [];
          this.errorMessages.push("No slots for the selected dates");
          $("#saveDoctorAppointmentValidation").modal('show');
        }
      },
        (err) => {
        })

  }
  filterFunction(room: any, WardID: any) {
    return room.filter((buttom: any) => buttom.WardID == WardID);
  }

  loadSelectedRoomSchedule(room: any) {
    this.roomsList.forEach((element: any, index: any) => {
      if (element.BedID === room.BedID) {
        element.selected = true;
        this.selectedRoom = element;
        this.fetchRoomSchedule(element, false);
      }
      else
        element.selected = false;
    });
  }

  fetchSelectedDateSchedule(event: any) {
    this.selectedDate.fullDate = this.datepipe.transform(event.target.value, "dd-MMM-yyyy")?.toString();
    this.fetchRoomSchedule(this.selectedRoom, true);
  }
  fetchRoomSchedule(room: any, furtureDate: boolean) {
    //this.generateTimeSlots();
    this.scheduleDatesForm.patchValue({
      ScheduleDate: new Date(this.selectedDate.fullDate)
    });
    this.listOfDates = [];
    this.listOfDatesFiltered = [];
    var selecteddoc = this.doctorList.find((x: any) => x.selected == true);
    var payload = {
      "RoomID": room.BedID,
      "DoctorID": selecteddoc.EmpID,
      "ScheduleDate": this.selectedDate.fullDate,
      "HospitalId": this.hospitalID
    }
    this.us.post(akuappointments.GetOTAvailableRoomDates, payload)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          this.listOfDates = response.DatesList;
          this.listOfDatesFiltered = this.listOfDates;
          this.selectedDate.fullDate = this.listOfDates[0].fullDate;
          if (this.selectedDate.fullDate) {
            //this.fetchTimeSlotsForSelectedDate(this.listOfDates[0]);
            // if (!furtureDate)
            //   this.selectedDate.fullDate = this.item?.DATETIME.split(' ')[0];
            this.fetchTimeSlotsForSelectedDate(this.selectedDate);
            //this.getClinicTimings(item);
          }
        }
      },
        (err) => {

        })
  }

  generateTimeSlots() {
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        this.timeSlots.push(timeSlot);
      }
    }
  }

  doctorAvailabilityDateChange() {
    var fromdate = this.tablePatientsForm.get("FromDate")?.value;
    fromdate = moment(fromdate).format('DD-MMM-YYYY');
    var todate = this.tablePatientsForm.get("ToDate")?.value;
    if (todate != null) {
      todate = moment(todate).format('DD-MMM-YYYY');
      this.selectedDate.fullDate = fromdate;
      var item = this.doctorList.find((x: any) => x.EmpID === this.selectedDoctor.EmpID);
      this.loadSelectedDoctorAvailabilityBetweenDates(fromdate, todate, this.selectedDoctor.EmpID, item);
    }
  }

  loadSelectedDoctorAvailabilityBetweenDates(fromdate: any, todate: any, doctorid: any, item: any) {

    this.url = this.service.getData(akuappointments.fetchDoctorsWiseNextAvailableBWdates, { FromDate: fromdate, ToDate: todate, DoctorID: doctorid, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.DatesList.length > 0) {
          this.listOfDates = response.DatesList;
          this.listOfDatesFiltered = this.listOfDates.slice(0, 10);
          this.selectedDate.fullDate = this.listOfDates[0].fullDate;
          if (this.selectedDate.fullDate) {
            this.getTimeslots(item);
            //this.getClinicTimings(item);
          }
        }
        else {
          this.errorMessages = [];
          this.errorMessages.push("No slots for the selected dates");
          $("#saveDoctorAppointmentValidation").modal('show');
        }
      },
        (err) => {
        })


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

  fetchTimeSlotsForSelectedDate(date: any) {
    var selecteddoc = this.doctorList.find((x: any) => x.selected == true);
    this.selectedDate = date;
    this.scheduleDatesForm.patchValue({
      ScheduleDate: new Date(date.fullDate)
    })
    var timeslotpayload = {
      "RoomID": this.selectedRoom.ServiceItemId,
      "DoctorID": selecteddoc.EmpID,
      "ScheduleDate": date.fullDate,
      "HospitalId": this.hospitalID
    }
    this.us.post(akuappointments.GetOTAvailableRoomDatesSlots, timeslotpayload)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          this.listOfTimeSlots = response.AppointmentList;
          //this.WaitingListCount = this.listOfTimeSlots[0]?.WaitingAppointmentCount;
          this.WaitingListCountToBook = this.listOfTimeSlots[0]?.TotalWaitingSlots;
          this.morningTimeSlots = [];
          this.afternoonTimeSlots = [];
          this.eveningTimeSlots = [];
          this.listOfTimeSlots.forEach((value: any, index: any) => {
            this.prepareSlots(value);
          });

          this.morningTimeSlots.map((slot: any) => {
            slot.modTime = moment(slot.FROMTIME, ["HH:mm"]).format("hh:mm A");
          })
          this.afternoonTimeSlots.map((slot: any) => {
            slot.modTime = moment(slot.FROMTIME, ["HH:mm"]).format("hh:mm A");
          })
          this.eveningTimeSlots.map((slot: any) => {
            slot.modTime = moment(slot.FROMTIME, ["HH:mm"]).format("hh:mm A");
          })
          
          setTimeout(() => {
            this.scrollToCurrentTime(), 1000
          });
          this.fetchNextAvailabilityForRooms(this.selectedDate.fullDate);
        }
      },
        (err) => {

        })
    this.FetchSurgeryScheduleAgainstOTRoom(this.selectedRoom);
  }

  addSelectedDate(date: any) {
    this.selectedDate = date;
    var selecteddate = this.listOfDates.find((x: any) => x.fullDate === date.fullDate);
    this.isSlotAvailable = selecteddate.IsAvaialbleSlot;
    this.WaitingListCount = selecteddate.WaitingAppointmentCount;
    this.selectedTime = {};
    this.getTimeslots(date);
  }
  addSelectedTime(time: any) {
    //time.selected = true;
    this.selectedTime = time;
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
  getTimeslots(date: any) {
    var currentDate = moment(new Date()).format('DD-MMM-YYYY');
    var timeslotpayload = {
      "SpecialityId": this.form.get('SpecialiseID')?.value,
      "HospitalId": this.hospitalID,
      "DoctorId": this.selectedDoctor.EmpID,
      "ScheduleDate": this.selectedDate.fullDate
    }
    this.us.post(akuappointments.getTimeSlots, timeslotpayload)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          this.getClinicTimings();
          this.listOfTimeSlots = response.AppointmentList;
          //this.WaitingListCount = this.listOfTimeSlots[0]?.WaitingAppointmentCount;
          this.WaitingListCountToBook = this.listOfTimeSlots[0]?.TotalWaitingSlots;
          this.morningTimeSlots = [];
          this.afternoonTimeSlots = [];
          this.eveningTimeSlots = [];
          this.listOfTimeSlots.forEach((value: any, index: any) => {
            this.prepareSlots(value);
          });

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

  resetSSN() {
    this.ssnNumber = 0;
  }

  ssnchange(event: any) {
    this.ssnNumber = event.target.value;
  }

  getClinicTimings() {
    var currentDate = moment(new Date()).format('DD-MMM-YYYY');
    var timeslotpayload = {
      "SpecialityId": this.form.get('SpecialiseID')?.value,
      "HospitalId": this.hospitalID,
      "DoctorId": this.selectedDoctor.EmpID,
      "ScheduleDate": this.selectedDate.fullDate
    }
    this.us.post(akuappointments.getClinicTimings, timeslotpayload)
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

  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.fetchPatientDetailsBySsn(event);
    }
  }

  fetchPatientDetailsBySsn(event: any) {
    var inputval = event.target.value;
    var ssn = "0"; var mobileno = "0"; var patientid = "0";
    if (inputval.charAt(0) === "0") {
      ssn = "0";
      mobileno = inputval;
      patientid = "0";
    }
    else {
      ssn = inputval;
      mobileno = "0";
      patientid = "0";
      
    }
    this.ssnNumber = inputval;
    this.fetchPatientDetails(ssn, mobileno, patientid)
  }

  fetchSelectedPatientDetails(patientid: string) {
    this.fetchPatientDetails("0", "0", patientid);
    $("#divMultiplePatients").modal('hide');
  }

  fetchPatientDetails(ssn: string, mobileno: string, patientId: string) {
    this.service.fetchPatientDataC = {
      ...this.service.fetchPatientDataC,
      SSN: ssn,
      PatientID: patientId,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facility.FacilityID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    }
    this.url = this.service.fetchPatientDataBySsn(akuappointments.fetchPatientDataBySsn);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.showDoctorSlots = true;
          if (response.FetchPatientDependCLists.length > 1) {
            this.multiplePatients = response.FetchPatientDependCLists;
            this.patientDetails = response.FetchPatientDependCLists[0];
            this.selectedPatientId = this.patientDetails.PatientID;
            this.selectedPatientSSN = this.patientDetails.SSN;
            this.AppointmentCount = this.patientDetails.AppointmentCount;
            this.selectPatient(response.FetchPatientDependCLists[0]);
            this.FetchPatientOPDVisits();
            //$("#divMultiplePatients").modal('show');
          }
          else {
            this.patientDetails = response.FetchPatientDataCCList[0];
            this.selectedPatientId = this.patientDetails.PatientID;
            this.selectedPatientSSN = this.patientDetails.SSN;
            this.AppointmentCount = this.patientDetails.AppointmentCount;
            this.FetchPatientOPDVisits();
          }
          //this.showNoRecFound = false;
          this.fetchPatientVisits();
          this.fetchOrRooms();          
        }
      },
        (err) => {

        })
  }
  fetchPatientVisits() {
    this.url = this.service.getData(akuappointments.FetchPatientVisits, { Patientid: this.selectedPatientId, WorkStationID: this.facility.FacilityID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientVisits = response.PatientVisitsDataList;
          var admid = response.PatientVisitsDataList[0].AdmissionID;
          this.form.patchValue({
            VisitID : admid
          })
          if(this.fromAkuWorklist === 'true') {
            const visitid = response.PatientVisitsDataList.find((x:any) => x.AdmissionID === this.item.AdmissionID);
            if(visitid) {
              this.form.patchValue({
                VisitID: visitid.AdmissionID
              });
              this.selectedAdmissionID = this.item.AdmissionID;
            }
          }
          else {
            this.selectedAdmissionID = admid;
          }
          this.fetchPatientAKUPrescriptionprocedures(this.selectedAdmissionID);          
        }
      },
        (err) => {
        })
  }

  onVisitsChange(event: any) {
    var admid = event.target.value;
    this.selectedAdmissionID = admid;
    this.fetchPatientAKUPrescriptionprocedures(admid);
  }

  selectPatient(pat: any) {
    this.selectedPatientId = pat.PatientID;
    this.multiplePatients.forEach((element: any, index: any) => {
      this.showPatientValidation = false;
      if (element.PatientID === pat.PatientID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.fetchPatientDetails("0", "0", pat.PatientID);
  }

  clearDoctorAppointment() {
    this.AppointmentCount = "";
    this.BookingInfoTab = "3"; this.waitingDaySlot = "";
    this.showDoctorSlots = false; this.doctorSearch = false;
    //this.selectedPatientId = ""; $("#txtSsn").val('');
    //this.selectedDoctor = []; this.latestDoctorVisits = [];
    this.multiplePatients = []; this.patientDetails = []; //this.doctorList = []; 
    this.listOfDates = [];
    this.morningTimeSlots = []; this.afternoonTimeSlots = []; this.eveningTimeSlots = []; this.listOfItems = [];
    this.groupedRoomsList = [];
    //this.showVisitInfoTab = false; this.isReschedule = false;
    //this.listofUpcomingAppointments = []; this.selectedAppToReschedule = []; this.selectedAppToCancel = [];
    this.form = this.formbuilder.group({
      HospitalID: [],
      HospitalName: [''],
      SpecialiseID: [''],
      Specialisation: [''],
      DoctorID: [''],
      DoctorName: ['']
    });
    this.tablePatientsForm = this.formbuilder.group({
      FromDate: [''],
      ToDate: [''],
    });

    var wm = new Date();
    var d = new Date();
    wm.setMonth(wm.getMonth() - 1);
    this.tablePatientsForm.patchValue({
      FromDate: d,
      ToDate: d
    })
    this.roomsList.forEach((element: any, index: any) => {
      element.selected = false;
    });
    this.orRoomBookedSlots = [];
    this.fetchHospitalLocations();
  }

  saveAppointment() {
    this.errorMessages = [];
    // if (this.form.get('SpecialiseID')?.value === '') {
    //   this.errorMessages.push("Specialisation");
    // }
    // if (this.patientDetails === undefined) {
    //   this.errorMessages.push("Patient details");
    // }
    // if (this.selectedDoctor === undefined) {
    //   this.errorMessages.push("Doctor");
    // }
    // if (JSON.stringify(this.selectedTime) === '{}') {
    //   this.errorMessages.push("Available Slots");
    // }
    var selectedSlots = this.listOfTimeSlots.filter((x: any) => x.selected);
    if (selectedSlots.length > 0) {
      // var fromSlotId = selectedSlots[0].FROMSLOTID;
      // var toSlotId = selectedSlots[selectedSlots.length -1].TOSLOTID;
      var fromSlotId = selectedSlots[0].FROMTIME;
      var toSlotId = selectedSlots[selectedSlots.length - 2].TOTIME;
    }
    else {
      this.errorMessages.push("Time Slots");
    }

    if (this.errorMessages.length === 0) {
      let payload = {
        "SurgeryRequestID": this.item.SurgeryRequestid,
        "PatientID": this.item.PatientID,
        "SSN": this.item.SSN,
        "HOSPITALID": this.hospitalID,
        "PatientName": this.item.NAME,
        "Age": this.item.AGE,
        "AgeUOMId": this.item.AgeUoMID,
        "Mobile": this.item.MobileNo,
        "Genderid": this.item.GENDERID,
        "ServiceItemID": this.item.SurgeonID,
        "SCHEDULEDATE": this.selectedDate.fullDate,
        "RoomDomainID": this.selectedRoom.DomainId,
        "DocDomainID": this.item.DomainID,
        "RoomID": this.selectedRoom.ServiceItemId,
        "DOCTORID": this.item.ServiceItemID,
        "SpecialiseID": this.item.SurgeonSpecialiseID,
        "Status": "3", //Only for booked, if confirmed then send 4
        "FROMSLOTID": fromSlotId,
        "TOSLOTID": toSlotId,
        "Remarks": "OR Appointment",
        "StatusString": "3",
        "UserID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        "WorkStationID": this.facility.FacilityID,//this.facilitySessionId ?? this.service.param.WorkStationID,   
      }
      //this.service.bookAppointment(payload).subscribe((response) => {
      this.us.post(akuappointments.BookORAppointment, payload).subscribe((response) => {
        if (response.Status === "Success") {
          // this.patientDetails = [];
          $("#appointmentSaveMsg").modal('show');
        }
        else {
          if (response.Status == 'Fail') {
            this.errorMessages = [];
            this.errorMessages.push(response.Message);
            this.errorMessages.push(response.Message2L);
            // this.patientDetails = [];
            $("#saveDoctorAppointmentValidation").modal('show');
          }
        }
      },
        (err) => {

        })
    }
    else {
      $("#doctorAppointmentValidation").modal('show');
    }
  }


  FetchPatientOPDVisits() {
    let payload = {
      "SSN": this.selectedPatientSSN,
      "HospitalId": this.hospitalID
    }
    // this.service.GetPatientOPDVisits(payload).subscribe((res: any) => {
    //   this.latestDoctorVisits = res.PatientVisits;
    // })
    this.us.post(akuappointments.FetchPatientOPDVisits, payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.latestDoctorVisits = response.PatientVisits;
        }
      },
        (err) => {

        })
  }

  showVisitOrUpcomingInfo(type: string) {
    if (type == "visit") {
      this.showVisitInfoTab = true;
    }
    else {
      this.showVisitInfoTab = false;
      this.fetchUpcomingAppointments();
    }
  }
  showBookWaitInfo(type: string) {
    if (type == "Booking") {
      this.BookingInfoTabs = true;
      this.BookingInfoTab = "3";
    }
    else {
      if (this.selectedDoctor === undefined) {
        this.errorMessages.push("Doctor");
        $("#saveDoctorAppointmentValidation").modal('show');
      }
      else {
        this.BookingInfoTabs = false;
        this.BookingInfoTab = "6";
        this.FetchPatientScheduleWaitingList();
        $("#divWaitingList").modal('show');
      }
    }
  }


  fetchUpcomingAppointments() {

    var upcomingPayload = {
      "PatientId": this.patientDetails.PatientID
    }

    this.us.post(akuappointments.AppointmentListNL, upcomingPayload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.listofUpcomingAppointments = response.AppointmentList;
        }
      },
        (err) => {

        })
  }

  loadVisitInfo(visit: any) {

    this.latestDoctorVisits.forEach((element: any, index: any) => {
      if (element.DoctorID === visit.DoctorID) {
        visit.selected = true;
      }
      else {
        visit.selected = false;
      }
    });
    this.form.setValue({
      SpecialiseID: visit.SpecialiseID,
      Specialisation: visit.Specialisation,
      HospitalID: visit.HospitalID,
      HospitalName: this.locationList.find((x: any) => x.HospitalID === visit.HospitalID).Name,
      DoctorID: visit.DoctorID,
      DoctorName: visit.DoctorName
    });
    this.url = this.service.getData(akuappointments.fetchSpecializationDoctorTimings, { SpecializationID: visit.SpecialiseID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.GetAllDoctorsList.length > 0) {
          this.doctorList = response.GetAllDoctorsList;

          this.doctorList.forEach((i: any) => {
            i.Specialization = visit.SpecialityName;
            if (i.EmpID === visit.DoctorID) {
              i.selected = true;
              this.loadSelectedDoctorAvailability(i);
            }
            else
              i.selected = false;
          });

          this.filterDoctor = this.doctorList;
        }
        else {
          this.selectedDoctor = [];
          this.doctorList = [];
          this.listOfDates = [];
          this.errorMessages = [];
          this.errorMessages.push("Dr. " + visit.DoctorName + " has no available slot configuration");
          $("#saveDoctorAppointmentValidation").modal('show');
        }
      },
        (err) => {
        })
  }

  cancelAppointmentConfirmation(app: any) {
    //this.selectedAppToCancel = app;
    this.selectedOrSchedule = app;
    this.cancelConfirmMsg = "Are you sure you want to cancel Appointment ?";
    $("#cancelConfirmationMsg").modal('show');
  }

  showCancelReasons() {
    this.loadCancelReasons();
    this.loadActionTaken();
    $("#cancelReasons").modal('show');
  }

  loadAppointmentForReschedule(app: any) {
    this.selectedAppToReschedule = app;
    this.isReschedule = true;
    this.form.setValue({
      SpecialiseID: app.SPECIALITYID,
      Specialisation: app.SPECIALITY,
      HospitalID: app.HOSPITALID,
      HospitalName: this.locationList.find((x: any) => x.HospitalID === app.HOSPITALID).Name,
      DoctorID: app.DOCTORID,
      DoctorName: app.DOCTORNAME
    });
    this.url = this.service.getData(akuappointments.fetchSpecializationDoctorTimings, { SpecializationID: app.SPECIALITYID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.showDoctorSlots = true;
          this.doctorList = response.GetAllDoctorsList;

          this.doctorList.forEach((i: any) => {
            i.Specialization = app.SPECIALITY;
            if (i.EmpID === app.DOCTORID) {
              i.selected = true;
              this.loadSelectedDoctorAvailability(i);
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

  rescheduleAppointment(app: any) {
    var reschedulePayload = {
      "PatientID": this.selectedPatientId,
      "HOSPITALID": this.hospitalID,
      "PATIENTNAME": app.PATIENTNAME,
      "AGE": app.AGE,
      "AGEUOMID": app.AGEUOMID,
      "MOBILE": this.patientDetails.MobileNo,
      "GENDERID": this.patientDetails.GenderID,
      "DOCTORID": app.DOCTORID,
      "SpecialiseID": app.SPECIALITYID,
      "SCHEDULEDATE": this.selectedDate.fullDate,
      "FROMSLOTID": this.selectedTime.FROMSLOTID,
      "TOSLOTID": this.selectedTime.TOSLOTID,
      "Remarks": "AKU Doctor Appointment",
      "SCHEDULESTRING": "",
      "PREVIOUSSCHEDULEID": app.SCHEDULEID,
      "IsVitual": 0,
      "TeleURL": null
    }

    this.us.post(akuappointments.RescheduleAppointment, reschedulePayload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.appSaveMsg = "Appointment rescheduled successfully";
          $("#appointmentSaveMsg").modal('show');
        }
      },
        (err) => {

        })
  }

  cancelAppointment(app: any) {
    if (this.cancelForm.get("ActionTypeID")?.value != '0' && this.cancelForm.get("CancelReasonID")?.value != '0' && this.cancelForm.get("Remarks")?.value != '') {
      var cancelPayload = {
        "ScheduleID": app.SCHEDULEID,
        "PatientID": this.selectedPatientId,
        "HOSPITALID": this.hospitalID,
        "ActionTypeID": this.cancelForm.get("ActionTypeID")?.value,
        "CancelReasonID": this.cancelForm.get("CancelReasonID")?.value,
        "CancelRemarks": this.cancelForm.get("Remarks")?.value
      }

      this.us.post(akuappointments.CancelAppointment, cancelPayload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#cancelReasons").modal('hide');
            this.appSaveMsg = "Appointment cancelled successfully";
            $("#appointmentSaveMsg").modal('show');
            this.fetchUpcomingAppointments();
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
  fetchappointmentwithdates(filter: any) {
    if (filter === "M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() + 1);
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    else if (filter === "3M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() + 3);
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    else if (filter === "6M") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() + 6);
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    else if (filter === "1Y") {
      var wm = new Date();
      wm.setMonth(wm.getMonth() + 12);
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    else if (filter === "W") {
      var d = new Date();
      d.setDate(d.getDate() + 7); // Subtract 7 days for the past week.
      var wm = d;
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    else if (filter === "T") {
      var d = new Date();
      d.setDate(d.getDate()); // Subtract 7 days for the past week.
      var wm = d;
      var pd = new Date();
      this.tablePatientsForm.patchValue({
        FromDate: wm,
        ToDate: pd,
      });
    }
    var fromdate = this.tablePatientsForm.get("FromDate")?.value;
    fromdate = moment(fromdate).format('DD-MMM-YYYY');
    var todate = this.tablePatientsForm.get("ToDate")?.value;
    todate = moment(todate).format('DD-MMM-YYYY');
    var item = this.doctorList.find((x: any) => x.EmpID === this.selectedDoctor.EmpID);
    this.loadSelectedDoctorAvailabilityBetweenDates(fromdate, todate, this.selectedDoctor.EmpID, item);

  }


  patientEligibilityCheck() {
    var saveObj = {
      provider: this.patientDetails.ProviderLicense,
      purpose: 'validation',
      patient: {
        mrn: this.patientDetails.RegCode,
        idExternal: this.patientDetails.PatientID,
        Person: {
          SSN: this.patientDetails.SSN,
          Prefix: this.patientDetails.Title,
          FirstName: this.patientDetails.FirstName,
          MiddleName: this.patientDetails.MiddleName,
          LastName: '',
          FamilyName: this.patientDetails.Familyname,
          Suffix: '', //this.patientRegForm.value["Suffix"],
          DateOfBirth: this.patientDetails.DOB,
          Gender: this.patientDetails.GenderID.toString(),
          MaritalStatus: this.patientDetails.MaritalStatusID.toString(), //"U"
          MobileNumber: this.patientDetails.MobileNo,
        },
      },
      insurances: [
        {
          Coverage: {
            MembershipNo: this.patientDetails.ccInsuranceNo,//defaultCompany.ccInsuranceNo,
            PolicyNo: this.patientDetails.ccInsuranceNo,//defaultCompany.ccInsuranceNo,
            Relationship: 'self',
            PolicyHolder: this.patientDetails.companyName,//defaultCompany.companyName,
            PayerLicense: '',
            Payer: this.patientDetails.payerName,//defaultCompany.payerName,
            AdminLicense: null,
            Admin: null,
            IdExternal: this.patientDetails.multiINSID,//defaultCompany.multiINSID,
            Network: 'A', //this.insuranceData.GradeName,
            Type: 'EHCPOL',
          },
          Sequence: 1,
        },
      ],
    };
    var jsonString = JSON.stringify(saveObj);
    this.us.post(akuappointments.PatientCheckEligibility, jsonString)
      .subscribe((response: any) => {
        console.log(response)
      },
        (err) => {

        })
  }

  loadCancelReasons() {
    this.url = this.service.getData(akuappointments.FetchCancelReasons, { HospitalID: this.hospitalID });
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
    this.url = this.service.getData(akuappointments.FetchActionTaken, { HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.actionTakenList = response.GetMasterDataList;
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
  saveWaitingListAppointmentPopup() {
    this.errorMessages = [];
    if (this.patientDetails?.SSN === undefined || this.patientDetails?.length > 0) {
      this.errorMessages.push("Please select SSN");
    }
    if (this.listOfTimeSlots.length > 0) {
      this.errorMessages.push("Cannot book waiting list appointment as there are ( " + this.listOfTimeSlots.length + " )  slots available for doctor.");
    }
    if (this.WaitingListCount != "" && this.WaitingListCountToBook != "" && Number(this.WaitingListCount) >= Number(this.WaitingListCountToBook)) {
      this.errorMessages.push("Cannot book waiting list appointment more than the configured count in Resource availability.");
    }
    if (this.errorMessages.length == 0) {
      this.waitingTimeSlots = [];
      this.waitingTimeSlots.push({ Day: "Morning", Time: "08:30 - 13:00", selected: false });
      this.waitingTimeSlots.push({ Day: "Afternoon", Time: "13:00 - 17:00", selected: false });
      this.waitingTimeSlots.push({ Day: "Evening", Time: "17:00 - 22:00", selected: false });
      // this.listOfClinicTimings.forEach((value: any, index: any) => {
      //   this.prepareWaitingSlots(value);
      // });

      $("#WatingSaveappointment").modal('show');
    }
    else {
      $("#saveDoctorAppointmentValidation").modal('show');
    }
  }
  selectWaitingSlot(item: any) {
    this.waitingTimeSlots.forEach((element: any, index: any) => {
      if (element.Day == item.Day)
        element.selected = true;
      else
        element.selected = false;
    });
    if (item.Day == "Morning")
      this.waitingDaySlot = "M";
    else if (item.Day == "Afternoon")
      this.waitingDaySlot = "A";
    else if (item.Day == "Evening")
      this.waitingDaySlot = "E";
  }
  prepareWaitingSlots(value: any) {
    var date = new Date(new Date().setHours(value.FromDateTime.split(':')[0], value.ToDateTime.split(':')[1], 0, 0));
    var morningFromDate = new Date(new Date().setHours(0, 0, 0, 0));
    var morningEndDate = new Date(new Date().setHours(13, 0, 0, 0));
    var afternoonFromDate = new Date(new Date().setHours(13, 0, 0, 0));
    var afternoonEndDate = new Date(new Date().setHours(18, 0, 0, 0));
    var eveningFromDate = new Date(new Date().setHours(18, 0, 0, 0));
    var eveningEndDate = new Date(new Date().setHours(23, 59, 0, 0));
    if (date >= morningFromDate && date < morningEndDate) {
      this.waitingTimeSlots.push("Morning");
    }
    if (date >= afternoonFromDate && date < afternoonEndDate) {
      this.waitingTimeSlots.push("Afternoon");
    }
    if (date >= eveningFromDate && date < eveningEndDate) {
      this.waitingTimeSlots.push("Evening");
    }
  }

  saveWaitingListAppointment() {

    // if (JSON.stringify(this.selectedTime) === '{}') {
    //   this.errorMessages.push("Available Slots");
    // }

    let payload = {
      "PatientID": this.patientDetails.PatientID,
      "HospitalId": this.hospitalID,
      "PatientName": this.patientDetails.PatientName,
      "Age": this.patientDetails.Age,
      "AgeUOMId": this.patientDetails.AgeUoMID,
      "Mobile": this.patientDetails.MobileNo,
      "Genderid": this.patientDetails.GenderID,
      "DoctorId": this.selectedDoctor.EmpID,
      "SpecialiseID": this.form.get('SpecialiseID')?.value,
      "ScheduleDate": this.selectedDate.fullDate,
      "FromSlotId": "00",
      "ToSlotId": "00",
      "Remarks": "Doctor Waiting List Appiontment",
      "IsVitual": 0,
      "TeleURL": null,
      "StatusString": "6",
      "WaitingDaySlot": this.waitingDaySlot // M A E
    }
    this.us.post(akuappointments.BookWaitingListAppointment, payload).subscribe((response) => {
      if (response.Status === "Success") {
        $("#txtSsn").val('');
        this.patientDetails = [];
        $("#appointmentSaveMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {
          this.errorMessages = [];
          this.errorMessages.push(response.Message);
          this.errorMessages.push(response.Message2L);
          this.patientDetails = [];
          $("#saveDoctorAppointmentValidation").modal('show');
        }
      }
    },
      (err) => {

      })
  }

  getDocAppointmentsOnDateChange(event: any) {
    var date = event.target.value;
    this.waitinglistdate = date;
    this.FetchPatientScheduleWaitingList();
  }
  FetchPatientScheduleWaitingList() {

    this.url = this.service.getData(akuappointments.FetchPatientScheduleWaitingList, {
      DoctorID: this.selectedDoctor.EmpID,
      Date: moment(this.waitinglistdate).format('DD-MMM-YYYY'),
      WorkStationID: this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.waitingListAppointments = response.FetchPatientScheduleWaitingListDataList;
        }
      },
        (err) => {
        })
  }

  closeWaitingList() {
    this.waitinglistdate = new Date();
    this.waitingListAppointments = [];
    this.BookingInfoTabs = true;
    this.BookingInfoTab = "3";
  }

  clearReasons() {
    this.cancelForm.patchValue({
      ActionTypeID: ['0'],
      CancelReasonID: ['0'],
      Remarks: ['']
    })
    this.showReasonMandatoryMsg = false;
    this.showActionTakenMandatoryMsg = false;
    this.showRemarksMandatoryMsg = false;
  }

  assignAvailability() {
    const fromTime = this.timesForm.value['FromTime'];
    const toTime = this.timesForm.value['ToTime'];

    if (fromTime && toTime) {
      const appointments = this.listOfTimeSlots;

      for (const appointment of appointments) {
        const appointmentFromTime = appointment.FROMTIME;
        const appointmentToTime = appointment.TOTIME;

        if (this.isTimeInRange(appointmentFromTime, fromTime, toTime)) {
          appointment.selected = true;
        } else {
          appointment.selected = false;
        }
      }

      this.morningTimeSlots = [];
      this.afternoonTimeSlots = [];
      this.eveningTimeSlots = [];
      this.listOfTimeSlots.forEach((value: any, index: any) => {
        this.prepareSlots(value);
      });
    }
  }

  isTimeInRange(time: string, rangeStart: string, rangeEnd: string): boolean {
    const timeAsDate = new Date(`2000-01-01T${time}`);
    const rangeStartAsDate = new Date(`2000-01-01T${rangeStart}`);
    const rangeEndAsDate = new Date(`2000-01-01T${rangeEnd}`);

    return timeAsDate >= rangeStartAsDate && timeAsDate <= rangeEndAsDate;
  }

  FetchSurgeryScheduleAgainstOTRoom(room: any) {
    this.url = this.service.getData(akuappointments.FetchAKUScheduleDetails, {
      BedID: room.BedID,
      ScheduleDate: this.selectedDate.fullDate,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: 3392,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.orRoomBookedSlots = this.orRoomBookedSlotsView = response.FetchSurgeryScheduleAgainstOTBedDList;
          if(this.navigatedFromCasesheet === 'true')
            this.orRoomBookedSlotsView = this.orRoomBookedSlots.filter((x:any) => x.SurgeonID === this.item.SurgeonID);
          if (this.orRoomBookedSlots.length > 0) {
            let minStartTime = '23:59';
            this.orRoomBookedSlots.forEach((i: any) => {
              i.calculated = false;
              if (i.StartTime < minStartTime) {
                minStartTime = i.StartTime;
              }
            });

            if (minStartTime === '23:59') {
              const now = new Date();
              const hours = now.getHours().toString().padStart(2, '0');
              const minutes = now.getMinutes().toString().padStart(2, '0');
              minStartTime = `${hours}:${minutes}`;
            }


            if (minStartTime != undefined) {
              const currentTimeElement = this.timeSlotsContainer.nativeElement.querySelector(`[data-time="${minStartTime}"]`);
              if (currentTimeElement) {
                currentTimeElement.scrollIntoView({ behavior: 'smooth' });
              }
            }

          }
          else {
            this.scrollToCurrentTime();
          }

          this.getCleaningTimings();

        }
      },
        (err) => {
        })
  }
  getTimeDiff(fromtime: any, totime: any) {
    fromtime = new Date(`2000-01-01T${fromtime}`);
    totime = new Date(`2000-01-01T${totime}`);
    const differenceMs: number = totime.getTime() - fromtime.getTime();
    const seconds: number = Math.floor((differenceMs / 1000) % 60);
    const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
    const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
    return hours;
  }
  FetchSurgeryScheduleAgainstOTRoomDateWise(event: any) {
    this.selectedDate.fullDate = this.datepipe.transform(event.target.value, "dd-MMM-yyyy")?.toString();
    this.url = this.service.getData(akuappointments.FetchSurgeryScheduleAgainstOTRoom, {
      RoomID: this.selectedRoom.ServiceItemId,
      ScheduleDate: this.selectedDate.fullDate,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facility.FacilityID,//this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.orRoomBookedSlotsDateWise = response.FetchSurgeryScheduleAgainstOTBedDList;
        }
      },
        (err) => {
        })
  }
  fetchViewAvailabilitySurgerySchedulesDateWise() {
    this.selectedDate.fullDate = this.datepipe.transform(this.viewavailabletimesForm.value['ViewScheduleDate'], "dd-MMM-yyyy")?.toString();
    var date = this.datepipe.transform(this.viewavailabletimesForm.value['ViewScheduleDate'], "dd-MMM-yyyy")?.toString();
    this.viewScheduleDate = date;
    var roomid = this.viewavailabletimesForm.value['RoomID']
    this.url = this.service.getData(akuappointments.FetchSurgeryScheduleAgainstOTRoom, {
      RoomID: roomid,
      ScheduleDate: date,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facility.FacilityID,//this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.orNextAvailableSlotsDateWise = response.FetchSurgeryScheduleAgainstOTBedDList;
          this.fetchNextAvailability(this.viewavailabletimesForm.value['ViewScheduleDate']);
        }
      },
        (err) => {
        })
  }
  getCurrentOrScheduledTime() {
    let find = this.orRoomBookedSlots.find((x: any) => x.PatientID === this.item.PatientID);
    if (find) {
      const now = new Date(`2000-01-01T${find.StartTime}`);
      const hours = now.getHours().toString().padStart(2, '0');
      return `${hours}:00`;
    }
    else if(new Date(this.item.DATETIME) === new Date()) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      return `${hours}:00`;
    }
    else {
      
      return '00:00';
    }
  }
  getCurrentTime() {
    const now = new Date();
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes();
    minutes = Math.floor(minutes / 5) * 5;
    if (minutes === 60) {
      minutes = 0;
      hours = (parseInt(hours) + 1).toString().padStart(2, '0');
    }
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }

  openBookAppointmentModal(slot: any) {
    if (this.orRoomBookedSlots.filter((x: any) => x.PatientID === this.item.PatientID).length > 0) {
      this.errorMessages = [];
      this.errorMessages.push("Appointment already booked for this patient.");
      $("#saveDoctorAppointmentValidation").modal('show');
      return;
    }
    if (this.item.STATUSID == '1' || this.isScheduled) {
      this.errorMessages = [];
      this.errorMessages.push("Appointment already booked for this patient in another OR.");
      $("#saveDoctorAppointmentValidation").modal('show');
      return;
    }
    this.selectedSlots = this.listOfTimeSlots.find((x: any) => x.FROMTIME === slot);

    var currentDateObj = new Date(this.selectedDate.fullDate + ' ' + this.selectedSlots.FROMTIME);
    var numberOfMlSeconds = currentDateObj.getTime();
    var addMlSeconds = this.estTime * 60 * 1000;
    var newDateObj = new Date(numberOfMlSeconds + addMlSeconds);

    this.fromTime = this.selectedSlots.FROMTIME;
    this.toTime = moment(newDateObj).format('H:mm');;
    this.timesForm.patchValue({
      FromTime: this.fromTime,
      ToTime: moment(newDateObj).format('H:mm')
    })
    $("#addservice").modal('show');
  }

  getDetails(slot: any) {
    var timeslot = new Date(`2000-01-01T${slot}`);

    return this.orRoomBookedSlots.filter((x: any) => {
      let startTime = new Date(`2000-01-01T${x.StartTime}`);
      return timeslot.getTime() === startTime.getTime();
    });
  }

  getBetweenDatesDetails(slot: any) {
    var timeslot = new Date(`2000-01-01T${slot}`);

    return this.orRoomBookedSlots.filter((x: any) => {
      let startTime = new Date(`2000-01-01T${x.StartTime}`);
      let endTime = new Date(`2000-01-01T${x.EndTime}`);
      return timeslot.getTime() >= startTime.getTime() && timeslot.getTime() < endTime.getTime();
    });
  }

  parseTimeString(timeStr: any) {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date;
  }

  getHeight(slot: HTMLElement, sch: any) {
    if (sch.calculated) {
      return slot?.offsetHeight + 'px';
    }
    else {
      const startTime = this.parseTimeString(sch.StartTime);
      const endTime = this.parseTimeString(sch.EndTime);

      const timeDifference = endTime.getTime() - startTime.getTime();

      const hoursDifference = (timeDifference / (1000 * 60 * 60)) * 12;
      const element = this.elRef.nativeElement.querySelector('.hieghttocalculate');
      const heightOffset = element?.offsetHeight;

      sch.calculated = true;
      return 'calc(' + (heightOffset * hoursDifference) + 'px - 18px)';
      // return 'calc(' + (heightOffset * hoursDifference) + 'px - 15px)';
    }
  }

  getCleaningRoomHeight(slot: any) {
    let data = this.roomCleaningTimeSlots.find((s: any) => s.endtime === slot);
    if(this.heightOfDiv) {
      const cleaningProgressHeight = this.heightOfDiv * 5;
      return 'calc(' + cleaningProgressHeight + 'px - 5px)'
    }
    else {
      const element = this.elRef.nativeElement.querySelector('.hieghttocalculateRoom');
      const heightOffset = element?.offsetHeight;
      this.heightOfDiv = element?.offsetHeight;
      const cleaningProgressHeight = heightOffset * 5;
      return 'calc(' + cleaningProgressHeight + 'px - 5px)'
    }
  }

  getNextAvailableDetails(slot: any) {
    var timeslot = new Date(`2000-01-01T${slot}`);
    // return this.orNextAvailableSlotsDateWise.filter((x: any) =>
    //   timeslot >= new Date(`2000-01-01T${x.StartTime}`) && timeslot < new Date(`2000-01-01T${x.EndTime}`));
    return this.orNextAvailableSlotsDateWise.filter((x: any) => {
      let startTime = new Date(`2000-01-01T${x.StartTime}`);
      return timeslot.getTime() === startTime.getTime();
    });
  }

  openReschedulePopup(sch: any) {
    this.selectedOrSchedule = sch;
    $("#modifyservice").modal('show');
  }

  confirmOrSchedule(sch: any) {
    this.selectedOrSchedule = sch;
    $("#ConfirmationMsg").modal('show');
  }

  saveORAppointment(type: string) {
    this.errorMessages = [];
    this.showRoomMessage = false;
    if (this.isFromTimeValid()) {
      this.showRoomMessage = true;
      return;
    }

    if (type == 'book') {
      var fromtime = this.timesForm.value['FromTime'];
      var totime = this.timesForm.value['ToTime'];

      var bookedfromslots = this.orRoomBookedSlots.filter((x: any) => new Date(`2000-01-01T${fromtime}`) > new Date(`2000-01-01T${x.StartTime}`) && new Date(`2000-01-01T${fromtime}`) < new Date(`2000-01-01T${x.EndTime}`));
      var bookedtoslots = this.orRoomBookedSlots.filter((x: any) => new Date(`2000-01-01T${totime}`) > new Date(`2000-01-01T${x.StartTime}`) && new Date(`2000-01-01T${totime}`) < new Date(`2000-01-01T${x.EndTime}`));

      if (bookedfromslots.length > 0 || bookedtoslots.length > 0) {
        this.showBookAppValidationMsg = true;
        return;
      }
      else {
        this.showBookAppValidationMsg = false;
      }
    }

    let payload = {
      "ScheduleID": "0",
      "SurgeryRequestID": 0,
      "PatientID": this.patientDetails.PatientID,
      //"AdmissionID" : this.selectedAdmissionID,
      "PrescriptionID" : this.patientAkuProcedures.PrescriptionID,//PrescriptionID
      "ProcedureID" : this.patientAkuProcedures.ProcedureID,//ProcedureID
      "SSN": this.patientDetails.SSN,
      "HOSPITALID": this.hospitalID,
      "PatientName": this.patientDetails.PatientName,
      "Age": this.patientDetails.Age,
      "AgeUOMId": this.patientDetails.AgeUoMID,
      "Mobile": this.patientDetails.MobileNo,
      "Genderid": this.patientDetails.GenderID,
      "ServiceItemID": this.patientAkuProcedures.ServiceDocID, //service doc id
      "SCHEDULEDATE": this.selectedDate.fullDate,
      "RoomDomainID": this.patientAkuProcedures.DomainID,
      "DocDomainID": 10,
      "RoomID": this.selectedRoom.BedID,
      "DOCTORID":  this.patientAkuProcedures.ServiceDocID, //service doc id,
      "SpecialiseID": this.patientAkuProcedures.SpecialiseID, //service spec id,
      "Status": "3", //Only for booked, if confirmed then send 4
      "FROMSLOTID": this.timesForm.value['FromTime'],
      "TOSLOTID": this.timesForm.value['ToTime'],
      "Remarks": "AKU Appointment",
      "StatusString": "3",
      "UserID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      "WorkStationID": this.facility.FacilityID,//this.facilitySessionId ?? this.service.param.WorkStationID,  
      "TestOrderItemID": this.item.TestOrderItemID
    }
    //this.service.bookAppointment(payload).subscribe((response) => {
    this.us.post(akuappointments.BookAKUAppointment, payload).subscribe((response) => {
      if (response.Status === "Success") {
        this.isScheduled = true;
        sessionStorage.setItem("isScheduled", 'true');
        //this.selectedDate.fullDate = this.currentDate;
        // this.patientDetails = [];
        if (type == 'confirm') {
          this.selectedOrSchedule = [];
          $("#modifyservice").modal('hide');
          this.appSaveMsg = "Appointment confirmed successfully";
          $("#appointmentSaveMsg").modal('show');
        }
        else {
          this.SaveDoctorNotifications(this.selectedDate.fullDate, this.timesForm.value['FromTime'], this.timesForm.value['ToTime'], 'booked');
          this.appSaveMsg = "Appointment booked successfully";
          $("#addservice").modal('hide');
          $("#appointmentSaveMsg").modal('show');
        }
        //this.FetchSurgeryScheduleAgainstOTRoom(this.selectedRoom);
      }
      else {
        if (response.Status == 'Fail') {
          this.isScheduled = false;
          this.errorMessages = [];
          this.errorMessages.push(response.Message);
          this.errorMessages.push(response.Message2L);
          // this.patientDetails = [];
          $("#saveDoctorAppointmentValidation").modal('show');
        }
      }
    },
      (err) => {

      })
  }

  confirmORAppointment(type: string) {
    this.errorMessages = [];
    //var selectedSlots = this.listOfTimeSlots.filter((x:any) => x.selected);

    if (type == 'book') {
      var fromtime = this.timesForm.value['FromTime'];
      var totime = this.timesForm.value['ToTime'];

      var bookedfromslots = this.orRoomBookedSlots.filter((x: any) => new Date(`2000-01-01T${fromtime}`) > new Date(`2000-01-01T${x.StartTime}`) && new Date(`2000-01-01T${fromtime}`) < new Date(`2000-01-01T${x.EndTime}`));
      var bookedtoslots = this.orRoomBookedSlots.filter((x: any) => new Date(`2000-01-01T${totime}`) > new Date(`2000-01-01T${x.StartTime}`) && new Date(`2000-01-01T${totime}`) < new Date(`2000-01-01T${x.EndTime}`));

      if (bookedfromslots.length > 0 || bookedtoslots.length > 0) {
        this.showBookAppValidationMsg = true;
        return;
      }
      else {
        this.showBookAppValidationMsg = false;
      }
    }

    let payload = {
      "ScheduleID": type == 'confirm' ? this.selectedOrSchedule.ScheduleID : "0",
      "SurgeryRequestID": 0,
      "PatientID": this.selectedOrSchedule.PatientID,
      "PrescriptionID" : this.selectedOrSchedule.PrescriptionID,
      "ProcedureID" : this.selectedOrSchedule.ProcedureID,//ProcedureID
      "SSN": this.selectedOrSchedule.SSN,
      "HOSPITALID": this.hospitalID,
      "PatientName": this.selectedOrSchedule.PatientName,
      "Age": this.selectedOrSchedule.Age,
      "AgeUOMId": this.selectedOrSchedule.AgeUOMID,
      "Mobile": this.selectedOrSchedule.MobileNo,
      "Genderid": this.selectedOrSchedule.Genderid,
      "ServiceItemID": this.selectedOrSchedule.ServiceItemID,
      "SCHEDULEDATE": this.selectedDate.fullDate,
      "RoomDomainID": this.selectedOrSchedule.RoomDomainID,
      "DocDomainID": 10,
      "RoomID": this.selectedRoom.BedID,
      "DOCTORID": this.selectedOrSchedule.DOCTORID,
      "SpecialiseID": this.selectedOrSchedule.SpecialiseID,
      "Status": type == 'confirm' ? "4" : "3", //Only for booked, if confirmed then send 4
      "FROMSLOTID": type == 'confirm' ? this.selectedOrSchedule.StartTime : this.timesForm.value['FromTime'],
      "TOSLOTID": type == 'confirm' ? this.selectedOrSchedule.EndTime : this.timesForm.value['ToTime'],
      "Remarks": "OR Appointment Confirmation",
      "StatusString": type == 'confirm' ? "4" : "3",
      "UserID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      "WorkStationID": this.facility.FacilityID,//this.facilitySessionId ?? this.service.param.WorkStationID,   
      "TestOrderItemID": this.item.TestOrderItemID
    }
    //this.service.bookAppointment(payload).subscribe((response) => {
    this.us.post(akuappointments.BookAKUAppointment, payload).subscribe((response) => {
      if (response.Status === "Success") {
        this.isScheduled = true;
        // this.patientDetails = [];
        if (type == 'confirm') {
          this.selectedOrSchedule = [];
          //this.selectedDate.fullDate = this.currentDate;
          $("#modifyservice").modal('hide');
          this.appSaveMsg = "Appointment confirmed successfully";
          $("#appointmentSaveMsg").modal('show');
        }
        else {
          $("#addservice").modal('hide');
          $("#appointmentSaveMsg").modal('show');
        }
        //this.FetchSurgeryScheduleAgainstOTRoom(this.selectedRoom);
      }
      else {
        if (response.Status == 'Fail') {
          this.isScheduled = false;
          this.errorMessages = [];
          this.errorMessages.push(response.Message);
          this.errorMessages.push(response.Message2L);
          // this.patientDetails = [];
          $("#saveDoctorAppointmentValidation").modal('show');
        }
      }
    },
      (err) => {

      })
  }

  rescheduleORAppointment(type: string) {
    this.errorMessages = [];
    var fromtime = this.rescheduletimesForm.value['FromTime'];
    var totime = this.rescheduletimesForm.value['ToTime'];

    var bookedfromslots = this.orRoomBookedSlotsDateWise.filter((x: any) => new Date(`2000-01-01T${fromtime}`) > new Date(`2000-01-01T${x.StartTime}`) && new Date(`2000-01-01T${fromtime}`) < new Date(`2000-01-01T${x.EndTime}`));
    var bookedtoslots = this.orRoomBookedSlotsDateWise.filter((x: any) => new Date(`2000-01-01T${totime}`) > new Date(`2000-01-01T${x.StartTime}`) && new Date(`2000-01-01T${totime}`) < new Date(`2000-01-01T${x.EndTime}`));

    if (bookedfromslots.length > 0 || bookedtoslots.length > 0) {
      this.showRescheduleAppValidationMsg = true;
      return;
    }
    else {
      this.showRescheduleAppValidationMsg = false;
    }

    var roomdomainid = this.roomsList.find((x: any) => x.ServiceItemId === this.rescheduletimesForm.value['RoomID']);

    let payload = {
      "ScheduleID": 0,
      "SurgeryRequestID": this.selectedOrSchedule.SurgeryRequestID,
      "PatientID": this.selectedOrSchedule.PatientID,
      "SSN": this.selectedOrSchedule.PatientSSN,
      "HOSPITALID": this.hospitalID,
      "PatientName": this.selectedOrSchedule.PatientName,
      "Age": this.selectedOrSchedule.Age,
      "AgeUOMId": this.selectedOrSchedule.AgeUOMID,
      "Mobile": this.selectedOrSchedule.MobileNo,
      "Genderid": this.selectedOrSchedule.GenderId,
      "ServiceItemID": this.selectedOrSchedule.SurgeonID,
      "SCHEDULEDATE": this.datepipe.transform(this.rescheduletimesForm.value['FromDate'], "dd-MMM-yyyy")?.toString(),
      "RoomDomainID": roomdomainid.DomainId,
      "DocDomainID": this.selectedOrSchedule.SurgeonDomainID,
      "RoomID": this.rescheduletimesForm.value['RoomID'],
      "DOCTORID": this.selectedOrSchedule.SurgeonServiceitemID,
      "SpecialiseID": this.item.SurgeonSpecialiseID,
      "Status": "3", //Only for booked, if confirmed then send 4
      "FROMSLOTID": this.rescheduletimesForm.value['FromTime'],
      "TOSLOTID": this.rescheduletimesForm.value['ToTime'],
      "Remarks": "OR Appointment Reschedule",
      "StatusString": "3",
      "UserID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      "WorkStationID": this.facility.FacilityID,//this.facilitySessionId ?? this.service.param.WorkStationID,   
      "PreviousScheduleID": this.selectedOrSchedule.ScheduleID,
      "Rescheduledtype": "1",
      "PreviousScheduleDate": this.selectedOrSchedule.FromDate
    }
    this.us.post(akuappointments.BookORAppointment, payload).subscribe((response) => {
      if (response.Status === "Success") {
        this.isScheduled = true;
        this.selectedOrSchedule = [];
        //this.selectedDate.fullDate = this.currentDate;
        $("#modifyservice").modal('hide');
        this.FetchSurgeryScheduleAgainstOTRoom(this.selectedRoom);
        this.SaveDoctorNotifications(this.datepipe.transform(this.rescheduletimesForm.value['FromDate'], "dd-MMM-yyyy")?.toString(), this.rescheduletimesForm.value['FromTime'], this.rescheduletimesForm.value['ToTime'], 'rescheduled');
        this.appSaveMsg = "Appointment rescheduled successfully";
        $("#appointmentSaveMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {
          this.isScheduled = false;
          this.errorMessages = [];
          this.errorMessages.push(response.Message);
          this.errorMessages.push(response.Message2L);
          $("#modifyservice").modal('hide');
          $("#saveDoctorAppointmentValidation").modal('show');
        }
      }
    },
      (err) => {

      })
  }

  SaveDoctorNotifications(date: any, fromtime: any, totime: any, type: string) {
    var notMsg = "";
    if (type == 'cancel') {
      notMsg = "Dear " + this.item.SurgeonName + ".Surgery Appointment for " + this.item.NAME + " on  " + date + " " + fromtime + "-" + totime + " has been cancelled";
    }
    else if (type == 'rescheduled') {
      notMsg = "Dear " + this.item.SurgeonName + ".Surgery Appointment for " + this.item.NAME + " has been rescheduled for  " + date + " " + fromtime + "-" + totime;
    }
    else {
      "Dear " + this.item.SurgeonName + ".Surgery Appointment for " + this.item.NAME + " has been booked on  " + date + " " + fromtime + "-" + totime;
    }
    let payload = {
      "DoctorNotificationID": 0,
      "PatientID": this.item.PatientID,
      "AdmissionID": this.item.AdmissionID,
      "DoctorID": this.item.SurgeonID,
      "SpecialiseID": this.item.SurgeonSpecialiseID,
      "DoctorMobileNo": 0,
      "RequestType": "Ot Schedule Doctor Notification",
      "NotificatonContent": notMsg,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID,//this.facilitySessionId ?? this.service.param.WorkStationID,   
      "HospitalID": this.hospitalID
    }
    this.us.post(akuappointments.SaveDoctorNotifications, payload).subscribe((response) => {
      if (response.Status === "Success") {

      }
    },
      (err) => {

      })
  }

  confirmOrCancelOtSchedule(sch: any) {
    this.selectedOrSchedule = sch;
    this.rescheduletimesForm.patchValue({
      RoomID: this.selectedOrSchedule.OTRoomID,
      FromDate: new Date(),
      FromTime: this.getCurrentTime(),
      ToTime: this.getCurrentTime()
    });
    this.orRoomBookedSlotsDateWise = this.orRoomBookedSlots;
    $("#modifyservice").modal('show');
  }

  confirmSchedule(sch: any) {
    this.selectedOrSchedule = sch;
    this.saveORAppointment('confirm');
  }
  cancelOrAppointment(sch: any) {
    if (this.cancelForm.get("ActionTypeID")?.value != '0' && this.cancelForm.get("CancelReasonID")?.value != '0' && this.cancelForm.get("Remarks")?.value != '') {
      var cancelPayload = {
        "ScheduleID": sch.ScheduleID,
        "ScheduleDate": this.selectedDate.fullDate,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID,
        "HospitalID": this.hospitalID,
        "CancelRemarks": this.cancelForm.get("Remarks")?.value,
        "ActionTypeID": this.cancelForm.get("ActionTypeID")?.value,
        "CancelReasonID": this.cancelForm.get("CancelReasonID")?.value
      }

      this.us.post(akuappointments.CancelORAppointment, cancelPayload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.isScheduled = false;
            $("#cancelReasons").modal('hide');
            $("#modifyservice").modal('hide');
            this.SaveDoctorNotifications(this.selectedDate.fullDate, this.selectedOrSchedule.StartTime, this.selectedOrSchedule.EndTime, 'cancel');
            this.appSaveMsg = "Appointment cancelled successfully";
            $("#appointmentSaveMsg").modal('show');
            //this.FetchSurgeryScheduleAgainstOTRoom(this.selectedRoom);
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
  navigateBackToAdmissionRequests() {
    //this.router.navigate(['/ot']);
    this.router.navigate(['/ot/ot-dashboard'])
  }

  expandCollapse() {
    this.collapseRoomsList = !this.collapseRoomsList;
  }

  viewavailableSlots() {
    this.nextAvailableSlot = "";
    this.viewSelectedRoom = "0";
    this.orNextAvailableSlotsDateWise = [];
    this.viewavailabletimesForm.patchValue({
      RoomID: '0',
      ViewScheduleDate: new Date()
    });
    var date = new Date();
    if (this.selectedRoom != undefined) {
      this.fetchNextAvailability(date);
    }
    
    $("#viewavailableSlots").modal('show');
  }
  getStyleApplyRule(slot: any) {
    if (this.currentDate !== this.viewScheduleDate)
      return false;
    else if (this.currentDate === this.viewScheduleDate && this.getCurrentTime() > slot && this.getNextAvailableDetails(slot).length === 0) {
      return true;
    }
    else return false;

  }

  fetchNextAvailability(date: any) {
    var selecteddoc = this.doctorList.find((x: any) => x.selected == true);
    this.viewScheduleDate = this.datepipe.transform(date, "dd-MMM-yyyy")?.toString();
    this.viewSelectedRoom = this.viewavailabletimesForm.value['RoomID'];
    if (this.viewSelectedRoom != '0') {
      var timeslotpayload = {
        "RoomID": this.viewSelectedRoom,
        "DoctorID": selecteddoc.EmpID,
        "ScheduleDate": this.datepipe.transform(date, "dd-MMM-yyyy")?.toString(),
        "HospitalId": this.hospitalID
      }
      this.us.post(akuappointments.GetOTAvailableRoomDatesSlots, timeslotpayload)
        .subscribe((response: any) => {
          if (response.Status === "Success") {
            this.listOfTimeSlots = response.AppointmentList;
            var nextavaslot = this.listOfTimeSlots.filter((x: any) => x.ISAVAILABLE === 1);
            this.nextAvailableSlot = nextavaslot[0].FROMTIME + ' - ' + nextavaslot[0].TOTIME;
            //   setTimeout(()=>{
            //   if (this.viewSelectedRoom != '0') {
            //     const currentTimeElement = this.viewtimeSlotsContainer.nativeElement.querySelector(`[data-time="${nextavaslot[0].FROMTIME}"]`);
            //     if (currentTimeElement) {
            //       currentTimeElement.scrollIntoView({ behavior: 'smooth' });
            //     }
            //   }
            // } , 200);
          }
        },
          (err) => {

          })
    }
  }
  fetchNextAvailabilityForRooms(date:any) {
    var selecteddoc = this.doctorList.find((x: any) => x.selected == true);
    
      var timeslotpayload = {
        "RoomID": this.selectedRoom.ServiceItemId,
        "DoctorID": selecteddoc.EmpID,
        "ScheduleDate": this.datepipe.transform(date, "dd-MMM-yyyy")?.toString(),
        "HospitalId": this.hospitalID
      }
      this.us.post(akuappointments.GetOTAvailableRoomDatesSlots, timeslotpayload)
        .subscribe((response: any) => {
          if (response.Status === "Success") {
            this.listOfTimeSlots = response.AppointmentList;
            var nextavaslot = this.listOfTimeSlots.filter((x: any) => x.ISAVAILABLE === 1);
            this.nextAvailableSlotForRoom = nextavaslot[0].FROMTIME + ' - ' + nextavaslot[0].TOTIME;
          }
        },
          (err) => {

          })
    
  }

  isFromTimeValid(): boolean {
    const fromTimeValue = this.timesForm.get('FromTime').value;

    let isValid = false;
    this.orRoomBookedSlots.forEach((item: any) => {
      const thirtyMinutesAfterEnd = this.calculateThirtyMinutesAfterEnd(item.EndTime, 29);
      const fromTimeMinutes = this.convertToMinutes(fromTimeValue);
      const existingStartMinutes = this.convertToMinutes(item.StartTime);
      const existingEndMinutes = this.convertToMinutes(item.EndTime);

      isValid = (existingEndMinutes < fromTimeMinutes && fromTimeMinutes <= thirtyMinutesAfterEnd) ||
        (fromTimeMinutes >= existingStartMinutes && fromTimeMinutes <= existingEndMinutes);
    });

    return isValid;

  }

  getCleaningTimings(): void {
    this.roomCleaningTimeSlots = [];
    this.orRoomBookedSlots.forEach((item: any) => {
      let endTime = item.EndTime; 
      this.roomCleaningTimeSlots.push({endtime: endTime, height: 0});
    });
  }

  getNextTimeSlot(time: string, interval: number): string {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const nextTotalMinutes = totalMinutes + interval;
    const nextHours = Math.floor(nextTotalMinutes / 60);
    const nextMinutes = nextTotalMinutes % 60;
    return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
  }

  cleaningStatus(slot: any): boolean {
    return this.roomCleaningTimeSlots.some((s: any) => s.endtime === slot);
  }

  checkslot(time: any): boolean {
    return this.orRoomBookedSlots.some((slot: any) => slot.StartTime === time);
  }


  calculateThirtyMinutesAfterEnd(endTime: string, sum: number): number {
    const endMinutes = this.convertToMinutes(endTime);
    return endMinutes + sum;
  }

  convertToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  }

  convertToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(remainingMinutes).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
  }
  closeNextAvailabilitySlot() {
    this.nextAvailableSlot = "";
    this.viewSelectedRoom = "0";
    this.orNextAvailableSlotsDateWise = [];
    $("#viewavailableSlots").modal('hide');
  }

  isPastSlot(slot: string): boolean {
    if(this.selectedDate.fullDate === this.currentDate) {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      const currentHour = this.currentTime.getHours();
      const currentMinute = this.currentTime.getMinutes();

      return slotHour < currentHour || (slotHour === currentHour && slotMinute < currentMinute);
    }
    else {
      return false;
    }
  }
  navigateBackToAkuWorklist() {
    sessionStorage.removeItem("otpatient");
    this.router.navigate(['/dialysis/aku-worklist']);  
  }
}


export const akuappointments = {
  fetchGSpecialisation: 'FetchGSpecialisation?Type=${Type}&DisplayName=${DisplayName}',
  fetchHospitalLocations: 'FetchHospitalLocations?type=0&filter=blocked=0&UserId=0&WorkstationId=0',
  fetchSpecializationDoctor: 'FetchSpecializationDoctor?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchSpecializationDoctorTimings: 'FetchSpecializationDoctorTimings?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  saveResourceAvailbility: 'SaveResourceAvailbility',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  AppointmentListNL: 'AppointmentListNL',
  getAvailableDates: 'GetAvailableDatesC',
  fetchDoctorsWiseNextAvailableBWdates: 'FetchDoctorsWiseNextAvailableBWdates?FromDate=${FromDate}&ToDate=${ToDate}&DoctorID=${DoctorID}&HospitalID=${HospitalID}',
  getTimeSlots: 'GettingDateSlots',
  getClinicTimings: 'GettingDateSlotsN',
  FetchPatientOPDVisits: 'FetchPatientOPDVisits',
  CancelAppointment: 'CancelAppointment',
  RescheduleAppointment: 'RescheduleAppointment',
  FetchReferalDoctors: 'FetchReferalDoctors?Tbl=${Tbl}&Name=${Name}',
  PatientCheckEligibility: `${config.nphiesapiurl}`,
  FetchCancelReasons: 'FetchCancelReasons?HospitalID=${HospitalID}',
  FetchActionTaken: 'FetchActionTaken?HospitalID=${HospitalID}',
  FetchPatientScheduleWaitingList: 'FetchPatientScheduleWaitingList?DoctorID=${DoctorID}&Date=${Date}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  BookAppointment: 'BookAppointment',
  BookWaitingListAppointment: 'BookWaitingListAppointment',
  FetchOTROOMSurgeon: 'FetchBedsFromWard?WardID=${WardID}&ConsultantID=${ConsultantID}&Status=${Status}&UserId=${UserId}&HospitalID=${HospitalID}',
  GetOTAvailableRoomDates: 'GetOTAvailableRoomDates',
  GetOTAvailableRoomDatesSlots: 'GetOTAvailableRoomDatesSlots',
  BookORAppointment: 'BookORAppointment',
  BookAKUAppointment:'BookAKUAppointment',
  FetchSurgeryScheduleAgainstOTRoom: 'FetchSurgeryScheduleAgainstOTRoom?RoomID=${RoomID}&ScheduleDate=${ScheduleDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  CancelORAppointment: 'CancelORAppointment',
  SaveDoctorNotifications: 'SaveDoctorNotifications',
  FetchPatientAKUPrescriptionprocedures: 'FetchPatientAKUPrescriptionprocedures?AdmissionID=${AdmissionID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientVisits: 'FetchPatientVisits?Patientid=${Patientid}&HospitalID=${HospitalID}',
  FetchAKUScheduleDetails: 'FetchAKUScheduleDetails?BedID=${BedID}&ScheduleDate=${ScheduleDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
};  