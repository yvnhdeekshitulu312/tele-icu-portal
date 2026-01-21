import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { ProcedureappointmentService } from '../procedureappointment/procedureappointment.service'
import { UtilityService } from 'src/app/shared/utility.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { BoundElementProperty } from '@angular/compiler';
import { Router } from '@angular/router';
import { config } from 'src/environments/environment';

declare var $: any;

@Component({
  selector: 'app-investigationappointment',
  templateUrl: './investigationappointment.component.html',
  styleUrls: ['./investigationappointment.component.scss'],
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
export class InvestigationappointmentComponent extends BaseComponent implements OnInit {
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
    listOfProcedures: any = [];
    locationList: any = [];
    form: any;
    doctorList: any = [];
    filterDoctor: any = [];
    facilityId: any;
    selectAll = false;
    selectedDoctor: any;
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
    errorMessages: any[] = [];
    latestDoctorVisits: any = []
    showDoctorSlots = false;
    showVisitInfoTab = false;
    listofUpcomingAppointments: any = [];
    selectedAppToReschedule: any;
    selectedAppToCancel: any;
    isReschedule = false;
    appSaveMsg: string = "Appointment saved successfully";
    clinicTimings: string = "";
    noVisitMsg: string = "No Visits";
    listOfItems: any;
    doctorSearch = false;
    txtViewMore = "View More";
    displayYakeenSearchModal: string = 'none';
    hijriDateYakeen: any = '';
    dateYakeen: any = '';
    gccNinIdYakeen: any = '';
    gccNationalityCodeYakeen: any = '';
    saudiIdYakeen: any = '';
    iqamaIdYakeen: any = '';
    passportNoYakeen: any = '';
    nationalityYakeen: any = '';
    borderNumberYakeen: any = '';
    birthDateYakeen: any = '';
    yakeenSearchDisplay = 1;
    showOrHideLeftNav = 1;
    yakeenDetailsVerified = false;
    YakeenNationalities: any;
    yakeenNewBornBabyGender = '';
    yakeenNewBornBaby = false;
    Nationalities: any;
    saudiYakeenMonthNumber = '';
    saudiYakeenYearNumber = '';
    iqamaYakeenMonthNumber = '';
    iqamaYakeenYearNumber = '';
    borderYakeenMonthNumber = '';
    borderYakeenYearNumber = '';
    isGetCalledForYakeenData = 'No';
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
    waitinglistdate = new Date();
    WaitingListCount: string = "";
    WaitingListCountToBook: string = "";
    isSlotAvailable = false;
    timesForm: any;
    fromPhysiotherapy: boolean = false;
    fromRadiology: boolean = false;
    fromEndoscopy: boolean = false;
    multipleSlots: boolean = false;
    isActive: boolean = false;
    trustedUrl: any;
    showSaveBtn: boolean = true;
    FetchPatientPendingPhysiotherphyPrescriptionsDataList: any = [];
    PrescriptionList: any = [];
    PrescriptionID: number = 0;
    filteredData: any;

    constructor(private service: ProcedureappointmentService,
      private us: UtilityService, private formbuilder: FormBuilder, public datepipe: DatePipe, private router: Router) {
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
        ProcedureID: [''],
        ProcedureName: ['']
      });
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
  
      this.timesForm = this.formbuilder.group({
        FromTime: [],
        ToTime: []
      });
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

    lastvisited_toggleClass() {
      this.isActive = !this.isActive;
    }
  
    private isDateInRange(date: Date): any {
      return this.listOfAppointments.filter((d: any) => d.fullDate === this.datepipe.transform(date, "dd-MMM-yyyy")?.toString());
    }
  
    ngOnInit(): void {
      if (this.ward.FacilityName === 'RADIOLOGY') {
        sessionStorage.setItem("fromRadiology", 'true');
      }
      this.fromRadiology = sessionStorage.getItem("fromRadiology") === "true" ? true : false;
      if(this.fromRadiology) {
        this.selectedView = JSON.parse(sessionStorage.getItem("RadiologyPatientData") || '{}');
        $("#txtSsn").val(this.selectedView.SSN);
        this.fetchPatientDetails(this.selectedView.SSN, "0", "0");
      }
      this.fetchHospitalLocations();
      this.currentDate = moment(new Date()).format('DD-MMM-YYYY');
      this.selectedDate.fullDate = this.currentDate;
      
      // this.fetchSpecializationDoctor();
      this.fetchMedicalEquipments()
    }
  
    fetchHospitalLocations() {
      this.url = this.service.getData(doctorappointments.fetchHospitalLocations, {});
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
        this.url = this.service.getData(doctorappointments.fetchGSpecialisation, { Type: 2, DisplayName: event.target.value });
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
      
    }
  
    fetchProcedureSearch(event: any) {
      if (event.target.value.length >= 3) {
       this.url = this.service.getData(doctorappointments.fetchGRrocedures, { Filter:event.target.value });      
        this.us.get(this.url)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.listOfProcedures = response.FetchSSPhysiotheraphyDataList;
            }
          },
            (err) => {
            })
      }
      else {
        this.listOfProcedures = [];
      }
    }
    selectProcedureItem(item: any) {
      this.listOfProcedures = [];
      this.form.patchValue({
        ProcedureID: item.ProcedureID,
        ProcedureName: item.ProcedureName
      });
      this.FetchPatientPendingPhysiotherphyPrescriptions(this.selectedPatientId);  
    }
  
    fetchMedicalEquipments() {
      const url = this.service.getData(doctorappointments.FetchResourceTypeNameScheduleH, { 
            DomainID: 12,
            UserID : this.doctorDetails[0].UserId,
            WorkStationID : this.facilitySessionId ?? this.service.param.WorkStationID,
            HospitalID: this.hospitalID
           });
          this.us.get(url)
            .subscribe((response: any) => {
              if (response.Code == 200) {
                this.doctorList = this.filteredData = response.FetchResourceTypeNameRadScheduleDataList.filter((x: any) => x?.EquipmentGroup === "RADIOLOGY");;
                this.showDoctorSlots = true;
              }
            },
              (err) => {
              })
    }

    onSearchTextChange(event: any) {
      this.filteredData = this.doctorList.filter((item: any) =>
        item.ServiceItemName.toLowerCase().includes(event.target.value.toLowerCase().trim())
      );
    }
  
  
    fetchSpecializationDoctor() {
      const SpecializationID = this.fromEndoscopy ? this.selectedView.SpecialiseID : 101;
      this.url = this.service.getData(doctorappointments.fetchSpecializationDoctorTimings, { SpecializationID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.doctorList = response.GetAllDoctorsList;
  
            if (this.doctorSearch) {
              var doc = this.doctorList.find((x: any) => x.EmpID == this.form.get('DoctorID')?.value);
              const docindex = this.doctorList.indexOf(doc);
              if(docindex != 0) {
                this.doctorList.splice(docindex, 1);
                this.doctorList.splice(0, 0, doc);
              }         
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
                i.Specialization = this.fromPhysiotherapy ? 'PHYSIOTHERAPY' : 'ENDOSCOPY';
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
        this.url = this.service.getData(doctorappointments.FetchReferalDoctors, { Tbl: 11, Name: filter });
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
      this.fetchSpecializationDoctor();
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
      const fromdate = moment(new Date()).format('DD-MMM-YYYY');
      const todate = moment(fromdate, 'DD-MMM-YYYY').add(6, 'months').format('DD-MMM-YYYY');
      this.url = this.service.getData(doctorappointments.FetchEquipmentsWiseNextAvailableBWdates, { FromDate: fromdate, ToDate: todate, serviceItemId: item.ServiceItemID, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.DatesList.length > 0) {
            this.listOfAppointments = response.DatesList;
          }
        },
          (err) => {
          })
  
  
      this.doctorList.forEach((element: any, index: any) => {
        if (element.ServiceItemID === item.ServiceItemID) {
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
        "DoctorId": item.ServiceItemID,
        "ScheduleDate": this.selectedDate.fullDate
      }
  
      this.us.post(doctorappointments.GetEquipmentAvailableDatesC, appointmentpayoad)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.DatesList.length > 0) {
            this.listOfDates = response.DatesList;
            this.listOfDatesFiltered = this.listOfDates;
            setTimeout(() => {
              this.initializePicker();
            }, 100);
            this.selectedDate.fullDate = this.listOfDates[0].fullDate;
            var selecteddate = this.listOfDates.find((x:any) => x.fullDate === this.selectedDate.fullDate);    
            this.isSlotAvailable = selecteddate.IsAvaialbleSlot;
            this.WaitingListCount = selecteddate.WaitingAppointmentCount;
            if (this.selectedDate.fullDate) {            
              this.getTimeslots(item);
              //this.getClinicTimings(item);
            }
          }
          else {
            this.errorMessages = [];
            this.listOfDates = [];
            this.errorMessages.push(item.ServiceItemName + " has no available slot configuration");
            $("#saveDoctorAppointmentValidation").modal('show');
          }
        },
          (err) => {
  
          })
    }
  
    doctorAvailabilityDateChange() {
      var fromdate = this.tablePatientsForm.get("FromDate")?.value;
      fromdate = moment(fromdate).format('DD-MMM-YYYY');
      var todate = this.tablePatientsForm.get("ToDate")?.value;
      if (todate != null) {
        todate = moment(todate).format('DD-MMM-YYYY');
        this.selectedDate.fullDate = fromdate;
        var item = this.doctorList.find((x: any) => x.EmpID === this.selectedDoctor.ServiceItemID);
        this.loadSelectedDoctorAvailabilityBetweenDates(fromdate, todate, this.selectedDoctor.ServiceItemID, item);
      }
    }
  
    loadSelectedDoctorAvailabilityBetweenDates(fromdate: any, todate: any, doctorid: any, item: any) {
  
      this.url = this.service.getData(doctorappointments.fetchDoctorsWiseNextAvailableBWdates, { FromDate: fromdate, ToDate: todate, DoctorID: doctorid, HospitalID: this.hospitalID });
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
  
    addSelectedDate(date: any) {
      this.selectedDate = date;
      var selecteddate = this.listOfDates.find((x:any) => x.fullDate === date.fullDate);    
      this.isSlotAvailable = selecteddate.IsAvaialbleSlot;
      this.WaitingListCount = selecteddate.WaitingAppointmentCount;
      this.selectedTime = {};
      this.getTimeslots(date);
    }
    clearSelections() {
      this.multipleSlots = false;
      this.selectedTime = {};
      this.morningTimeSlots.forEach((element: any) => {
        element.selected = false;
        element.disabled = false;
      });
      this.afternoonTimeSlots.forEach((element: any) => {
        element.selected = false;
        element.disabled = false;
      });
      this.eveningTimeSlots.forEach((element: any) => {
        element.selected = false;
        element.disabled = false;
      });
    }

    onMultipleSlotsClick() {
      this.selectedTime = {};
      this.multipleSlots = !this.multipleSlots;
      this.morningTimeSlots.forEach((element: any) => {
        element.selected = false;
        element.disabled = false;
      });
      this.afternoonTimeSlots.forEach((element: any) => {
        element.selected = false;
        element.disabled = false;
      });
      this.eveningTimeSlots.forEach((element: any) => {
        element.selected = false;
        element.disabled = false;
      });
    }

    addSelectedTime(time: any, type: any) {
      //time.selected = true;
      if (time.ISAVAILABLE == 2) {
        return;
      }
      if(time.ISAVAILABLE==3) {
        $("#txtSsn").val(time.SSN);
        this.showSaveBtn =  false;
        this.fetchPatientDetails(time.SSN, "0", "0");      
      }
      else {
        this.selectedTime = time;
        if (!this.multipleSlots) {
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
        } else {
          if (type === 'morning') {
            const selectedMorningSlots = this.morningTimeSlots.filter((element: any) => element.selected);
            this.morningTimeSlots.forEach((element: any, index: any) => {
              if (element.FROMSLOTID === time.FROMSLOTID) {
                if (selectedMorningSlots.length === 0) {
                  element.selected = true;
                } else {
                  if (this.morningTimeSlots[index - 1]?.selected || this.morningTimeSlots[index + 1]?.selected) {
                    element.selected = true;
                  } else if (this.afternoonTimeSlots[0]?.selected) {
                    element.selected = true;
                  }
                }
              }
            });
          }
          if (type === 'afternoon') {
            const selectedAfternoonSlots = this.afternoonTimeSlots.filter((element: any) => element.selected);
            this.afternoonTimeSlots.forEach((element: any, index: any) => {
              if (element.FROMSLOTID === time.FROMSLOTID) {
                if (selectedAfternoonSlots.length === 0) {
                  element.selected = true;
                } else {
                  if (this.afternoonTimeSlots[index - 1]?.selected || this.afternoonTimeSlots[index + 1]?.selected) {
                    element.selected = true;
                  }
                  else if (this.eveningTimeSlots[0]?.selected) {
                    element.selected = true;
                  }
                }
              }
            });
          }
          if (type === 'evening') {
            const selectedEveningSlots = this.eveningTimeSlots.filter((element: any) => element.selected);
            this.eveningTimeSlots.forEach((element: any, index: any) => {
              if (element.FROMSLOTID === time.FROMSLOTID) {
                if (selectedEveningSlots.length === 0) {
                  element.selected = true;
                } else {
                  if (this.eveningTimeSlots[index - 1]?.selected || this.eveningTimeSlots[index + 1]?.selected) {
                    element.selected = true;
                  }
                }
              }
            });
          }
        }
      }      
    }
  
    prepareSlots(value: any) {
      var date = new Date(new Date().setHours(value.FROMTIME.split(':')[0], value.FROMTIME.split(':')[1], 0, 0));
      var morningFromDate = new Date(new Date().setHours(0, 0, 0, 0));
      var morningEndDate = new Date(new Date().setHours(12, 0, 0, 0));
      var afternoonFromDate = new Date(new Date().setHours(12, 0, 0, 0));
      var afternoonEndDate = new Date(new Date().setHours(17, 0, 0, 0));
      var eveningFromDate = new Date(new Date().setHours(17, 0, 0, 0));
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
      const SpecializationID = this.fromEndoscopy ? this.selectedView.SpecialiseID : 101;
      var timeslotpayload = {
        "SpecialityId": 0,
        "HospitalId": this.hospitalID,
        "DoctorId": this.selectedDoctor.ServiceItemID,
        "ScheduleDate": this.selectedDate.fullDate       
      }
      this.us.post(doctorappointments.getTimeSlotsEquipment, timeslotpayload)
        .subscribe((response: any) => {
          if (response.Status === "Success" && response.AppointmentList.length > 0) {
            //this.getClinicTimings();
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
          else {
            this.morningTimeSlots = []; this.afternoonTimeSlots = []; this.eveningTimeSlots = []; this.listOfItems = [];
          }
        },
          (err) => {
  
          })
    }
  
    getClinicTimings() {
      var currentDate = moment(new Date()).format('DD-MMM-YYYY');
      const SpecializationID = this.fromEndoscopy ? this.selectedView.SpecialiseID : 101;
      var timeslotpayload = {
        "SpecialityId": SpecializationID,//this.form.get('SpecialiseID')?.value,
        "HospitalId": this.hospitalID,
        "DoctorId": this.selectedDoctor.ServiceItemID,
        "ScheduleDate": this.selectedDate.fullDate
      }
      this.us.post(doctorappointments.getClinicTimings, timeslotpayload)
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
        WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
        HospitalID: this.hospitalID ?? this.service.param.HospitalID,
      }
      this.url = this.service.fetchPatientDataBySsn(doctorappointments.fetchPatientDataBySsn);
  
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
              this.showVisitOrUpcomingInfo('upcoming');
              this.FetchPatientPendingPhysiotherphyPrescriptions(this.selectedPatientId);
              //this.FetchPatientOPDVisits();
              //$("#divMultiplePatients").modal('show');
            }
            else {
              this.patientDetails = response.FetchPatientDataCCList[0];
              this.selectedPatientId = this.patientDetails.PatientID;
              this.selectedPatientSSN = this.patientDetails.SSN;
              this.AppointmentCount = this.patientDetails.AppointmentCount;
              this.showVisitOrUpcomingInfo('upcoming');
              this.FetchPatientPendingPhysiotherphyPrescriptions(this.selectedPatientId);
              //this.FetchPatientOPDVisits();
            }
            //this.showNoRecFound = false;          
          }
        },
          (err) => {
  
          })
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
      this.selectedView="";
      this.BookingInfoTab = "3"; this.waitingDaySlot = "";
      this.showDoctorSlots = false; this.doctorSearch = false;
      this.selectedPatientId = ""; $("#txtSsn").val('');
      this.selectedDoctor = []; this.latestDoctorVisits = [];
      this.multiplePatients = []; this.patientDetails = []; this.doctorList = []; this.listOfDates = [];
      this.morningTimeSlots = []; this.afternoonTimeSlots = []; this.eveningTimeSlots = []; this.listOfItems = [];
      this.showVisitInfoTab = false; this.isReschedule = false;
      this.listofUpcomingAppointments = []; this.selectedAppToReschedule = []; this.selectedAppToCancel = [];
      this.form = this.formbuilder.group({
        HospitalID: [],
        HospitalName: [''],
        SpecialiseID: [''],
        Specialisation: [''],
        DoctorID: [''],
        DoctorName: [''],
        ProcedureID: [''],
        ProcedureName: ['']
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
      this.fetchMedicalEquipments();
      this.fetchHospitalLocations();
    }
  
    saveORAppointment(type: string) {
       this.errorMessages = [];
      if(this.selectedView.TestID==undefined){
        if(this.form.get('ProcedureID')?.value==""){
          this.errorMessages.push('Please select Procedure');
        }
      }
     

    if (this.errorMessages.length > 0) {
      $("#saveDoctorAppointmentValidation").modal('show');
      return;
    }
    
      let FROMTIME;
      let TOTIME;

      let FromSlotId;
      let ToSlotId;
      if (this.multipleSlots) {
        const selectedMorningSlots = this.morningTimeSlots.filter((element: any) => element.selected);
        if (selectedMorningSlots.length > 0) {
          FROMTIME = selectedMorningSlots[0].FROMTIME;
          TOTIME = selectedMorningSlots[selectedMorningSlots.length - 1].TOTIME;
          FromSlotId = selectedMorningSlots[0].FROMSLOTID;
          ToSlotId = selectedMorningSlots[selectedMorningSlots.length - 1].TOSLOTID;
        }
        const selectedAfternoonSlots = this.afternoonTimeSlots.filter((element: any) => element.selected);
        if (selectedAfternoonSlots.length > 0) {
          FROMTIME = FROMTIME || selectedAfternoonSlots[0].FROMTIME;
          TOTIME = selectedAfternoonSlots[selectedAfternoonSlots.length - 1].TOTIME;
          
          FromSlotId = FromSlotId || selectedAfternoonSlots[0].FROMSLOTID;
          ToSlotId = selectedAfternoonSlots[selectedAfternoonSlots.length - 1].TOSLOTID;
        }
        const selectedEveningSlots = this.eveningTimeSlots.filter((element: any) => element.selected);
        if (selectedEveningSlots.length > 0) {
          FROMTIME = FROMTIME || selectedEveningSlots[0].FROMTIME;
          TOTIME = selectedEveningSlots[selectedEveningSlots.length - 1].TOTIME;

          FromSlotId = FromSlotId || selectedEveningSlots[0].FROMSLOTID;
          ToSlotId = selectedEveningSlots[selectedEveningSlots.length - 1].TOSLOTID;
        }
      } else {
        FROMTIME = this.selectedTime.FROMTIME;
        TOTIME = this.selectedTime.TOTIME;

        FromSlotId = this.selectedTime.FROMSLOTID;
        ToSlotId = this.selectedTime.TOSLOTID;
      }
      let payload = {
        "ScheduleID": "0",
        "SurgeryRequestID": 0,
        "PatientID": this.patientDetails.PatientID,  
        "ProcedureID" : this.selectedView.TestID==undefined?this.form.get('ProcedureID')?.value:this.selectedView.TestID,
        "SSN": this.patientDetails.SSN,
        "HOSPITALID": this.hospitalID,
        "PatientName": this.patientDetails.PatientName,
        "Age": this.patientDetails.Age,
        "AgeUOMId": this.patientDetails.AgeUoMID,
        "Mobile": this.patientDetails.MobileNo,
        "Genderid": this.patientDetails.GenderID,
        "ServiceDoctorID": this.selectedDoctor.ServiceItemID,
        "SCHEDULEDATE": this.selectedDate.fullDate,
        "RoomDomainID": this.selectedDoctor.DomainID,
        "DocDomainID": 12,//54,
        "RoomID": this.selectedView.TestID==undefined?this.form.get('ProcedureID')?.value:this.selectedView.TestID,
        "DOCTORID":  this.selectedDoctor.ServiceItemID, //service doc id,
        "SpecialiseID": this.selectedView.SpecialiseID, //service spec id,
        "Status": "3", //Only for booked, if confirmed then send 4
        "FROMSLOTID": FROMTIME,//this.timesForm.value['FromTime'],
        "TOSLOTID": TOTIME, //this.timesForm.value['ToTime'],
        "Remarks": "RADIOLOGY Appointment",
        "StatusString": "3",
        "UserID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        "WorkStationID": this.facilityId,//this.facilitySessionId ?? this.service.param.WorkStationID,   
         "PrescriptionID": this.selectedView.PrescriptionID==undefined?0:this.selectedView.PrescriptionID,
        "TestOrderItemID": this.selectedView.TestOrderItemID==undefined?0:this.selectedView.TestOrderItemID
      }
      //this.service.bookAppointment(payload).subscribe((response) => {
      this.us.post(doctorappointments.BookPHYAppointment, payload).subscribe((response) => {
        if (response.Status === "Success") {
          // this.isScheduled = true;
          sessionStorage.setItem("isScheduled", 'true');
          //this.selectedDate.fullDate = this.currentDate;
          // this.patientDetails = [];
          if (type == 'confirm') {
            // this.selectedOrSchedule = [];
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
            // this.isScheduled = false;
            this.errorMessages = [];
            this.errorMessages.push(response.Message);
            //this.errorMessages.push(response.Message2L);
            // this.patientDetails = [];
            $("#saveDoctorAppointmentValidation").modal('show');
          }
        }
      },
        (err) => {
  
        })
    }

    rescheduleORAppointment(selectedAppToReschedule: any) {
      
    //   if(this.selectedView.TestID==undefined){
    //     if(this.form.get('ProcedureID')?.value==""){
    //       this.errorMessages.push('Please select Procedure');
    //     }
    //   }
     

    // if (this.errorMessages.length > 0) {
    //   $("#saveDoctorAppointmentValidation").modal('show');
    //   return;
    // }
    
      let FROMTIME;
      let TOTIME;

      let FromSlotId;
      let ToSlotId;
      if (this.multipleSlots) {
        const selectedMorningSlots = this.morningTimeSlots.filter((element: any) => element.selected);
        if (selectedMorningSlots.length > 0) {
          FROMTIME = selectedMorningSlots[0].FROMTIME;
          TOTIME = selectedMorningSlots[selectedMorningSlots.length - 1].TOTIME;
          FromSlotId = selectedMorningSlots[0].FROMSLOTID;
          ToSlotId = selectedMorningSlots[selectedMorningSlots.length - 1].TOSLOTID;
        }
        const selectedAfternoonSlots = this.afternoonTimeSlots.filter((element: any) => element.selected);
        if (selectedAfternoonSlots.length > 0) {
          FROMTIME = FROMTIME || selectedAfternoonSlots[0].FROMTIME;
          TOTIME = selectedAfternoonSlots[selectedAfternoonSlots.length - 1].TOTIME;
          
          FromSlotId = FromSlotId || selectedAfternoonSlots[0].FROMSLOTID;
          ToSlotId = selectedAfternoonSlots[selectedAfternoonSlots.length - 1].TOSLOTID;
        }
        const selectedEveningSlots = this.eveningTimeSlots.filter((element: any) => element.selected);
        if (selectedEveningSlots.length > 0) {
          FROMTIME = FROMTIME || selectedEveningSlots[0].FROMTIME;
          TOTIME = selectedEveningSlots[selectedEveningSlots.length - 1].TOTIME;

          FromSlotId = FromSlotId || selectedEveningSlots[0].FROMSLOTID;
          ToSlotId = selectedEveningSlots[selectedEveningSlots.length - 1].TOSLOTID;
        }
      } else {
        FROMTIME = this.selectedTime.FROMTIME;
        TOTIME = this.selectedTime.TOTIME;

        FromSlotId = this.selectedTime.FROMSLOTID;
        ToSlotId = this.selectedTime.TOSLOTID;
      }
      let payload = {
        "ScheduleID": this.selectedAppToReschedule.SCHEDULEID,
        "SurgeryRequestID": 0,
        "PatientID": this.patientDetails.PatientID,  
        "ProcedureID" : this.selectedAppToReschedule.TestID,
        "SSN": this.patientDetails.SSN,
        "HOSPITALID": this.hospitalID,
        "PatientName": this.patientDetails.PatientName,
        "Age": this.patientDetails.Age,
        "AgeUOMId": this.patientDetails.AgeUoMID,
        "Mobile": this.patientDetails.MobileNo,
        "Genderid": this.patientDetails.GenderID,
        "ServiceDoctorID": this.selectedDoctor.ServiceItemID,
        "SCHEDULEDATE": this.selectedDate.fullDate,
        "RoomDomainID": this.selectedDoctor.DomainID,
        "DocDomainID": 12,//54,
        "RoomID": this.selectedAppToReschedule.TestID,
        "DOCTORID":  this.selectedDoctor.ServiceItemID, //service doc id,
        "SpecialiseID": this.selectedAppToReschedule.SPECIALITYID, //service spec id,
        "Status": "3", //Only for booked, if confirmed then send 4
        "FROMSLOTID": FROMTIME,//this.timesForm.value['FromTime'],
        "TOSLOTID": TOTIME, //this.timesForm.value['ToTime'],
        "Remarks": "RADIOLOGY Appointment",
        "StatusString": "3",
        "UserID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        "WorkStationID": this.facilityId,//this.facilitySessionId ?? this.service.param.WorkStationID,   
        "PrescriptionID": this.selectedView.PrescriptionID==undefined?0:this.selectedView.PrescriptionID,
        "TestOrderItemID": this.selectedView.TestOrderItemID==undefined?0:this.selectedView.TestOrderItemID,
        "PreviousScheduleID" : this.selectedAppToReschedule.SCHEDULEID,
        "PreviousScheduleDate" : this.selectedAppToReschedule.SCHEDULEDATE
      }
      //this.service.bookAppointment(payload).subscribe((response) => {
      this.us.post(doctorappointments.BookPHYAppointment, payload).subscribe((response) => {
        if (response.Status === "Success") {
          // this.isScheduled = true;
          this.isReschedule = false;
          this.selectedAppToReschedule = [];
          sessionStorage.setItem("isScheduled", 'true');
          //this.selectedDate.fullDate = this.currentDate;
          // this.patientDetails = [];
          this.SaveDoctorNotifications(this.selectedDate.fullDate, this.timesForm.value['FromTime'], this.timesForm.value['ToTime'], 'booked');
            this.appSaveMsg = "Appointment booked successfully";
            $("#addservice").modal('hide');
            $("#appointmentSaveMsg").modal('show');
          //this.FetchSurgeryScheduleAgainstOTRoom(this.selectedRoom);
        }
        else {
          if (response.Status == 'Fail') {
            // this.isScheduled = false;
            this.errorMessages = [];
            this.errorMessages.push(response.Message);
            //this.errorMessages.push(response.Message2L);
            // this.patientDetails = [];
            $("#saveDoctorAppointmentValidation").modal('show');
          }
        }
      },
        (err) => {
  
        })
    }
  
    saveAppointment() {
      this.errorMessages = [];
      if (this.form.get('SpecialiseID')?.value === '') {
        this.errorMessages.push("Specialisation");
      }
      if (this.patientDetails === undefined) {
        this.errorMessages.push("Patient details");
      }
      if (this.selectedDoctor === undefined) {
        this.errorMessages.push("Doctor");
      }
      if (JSON.stringify(this.selectedTime) === '{}') {
        this.errorMessages.push("Available Slots");
      }
      if (this.form.get('ProcedureID')?.value === '') {
        this.errorMessages.push("Procedure");
      }
      if (this.errorMessages.length === 0) {
        let payload = {
          "PatientID": this.patientDetails.PatientID,
          "HospitalId": this.hospitalID,
          "PatientName": this.patientDetails.PatientName,
          "Age": this.patientDetails.Age,
          "AgeUOMId": this.patientDetails.AgeUoMID,
          "Mobile": this.patientDetails.MobileNo,
          "Genderid": this.patientDetails.GenderID,
          "DoctorId": this.selectedDoctor.ServiceItemID,
          "SpecialiseID": this.form.get('SpecialiseID')?.value,
          "ScheduleDate": this.selectedTime.SCHEDULEDATE,
          "FromSlotId": this.selectedTime.FROMSLOTID,
          "ToSlotId": this.selectedTime.TOSLOTID,
          "Remarks": "Doctor Appiontment",
          "IsVitual": 0,
          "TeleURL": null,
          "StatusString": "3"
        }
        //this.service.bookAppointment(payload).subscribe((response) => {
          this.us.post(doctorappointments.BookAppointment, payload).subscribe((response) => {
          if (response.Status === "Success") {
            $("#txtSsn").val('');
            this.AppointmentCount = "";    
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
      this.us.post(doctorappointments.FetchPatientOPDVisits, payload)
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
        "PatientId": this.patientDetails.PatientID,
        "Type" : "PHYSIOTHERAPY"
      }
  
      this.us.post(doctorappointments.EquipmentAppointmentList, upcomingPayload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listofUpcomingAppointments = response.AppointmentList;
          }
        },
          (err) => {
  
          })
    }
     FetchPatientPendingPhysiotherphyPrescriptions(PatientID:any) {
    
        this.url = this.service.getData(doctorappointments.FetchPatientPendingPhysiotherphyPrescriptions, {
          PatientID: PatientID,
          ProcedureID: 0,
          UserID: this.doctorDetails[0]?.UserId,
          WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
          HospitalID: this.hospitalID
        });
        this.us.get(this.url)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.FetchPatientPendingPhysiotherphyPrescriptionsDataList = response.FetchPatientPendingPhysiotherphyPrescriptionsDataList;
              if(response.FetchPatientPendingPhysiotherphyPrescriptionsDataList.length>0){
                this.PrescriptionList=response.FetchPatientPendingPhysiotherphyPrescriptionsDataList.filter((x: any) => x.ProcedureID === this.form.get('ProcedureID')?.value);
                if(this.PrescriptionList.length>0)
                this.PrescriptionID=this.selectedView.PrescriptionID=this.PrescriptionList[0].PrescriptionID;
              else 
                 this.PrescriptionID=this.selectedView.PrescriptionID=0;
              }
               else 
                 this.PrescriptionID=this.selectedView.PrescriptionID=0;
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
      this.url = this.service.getData(doctorappointments.fetchSpecializationDoctorTimings, { SpecializationID: visit.SpecialiseID });
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
      this.selectedAppToCancel = app;
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
      // this.form.setValue({
      //   SpecialiseID: app.SPECIALITYID,
      //   Specialisation: app.SPECIALITY,
      //   HospitalID: app.HOSPITALID,
      //   HospitalName: this.locationList.find((x: any) => x.HospitalID === app.HOSPITALID).Name,
      //   DoctorID: app.DOCTORID,
      //   DoctorName: app.DOCTORNAME,
      //   ProcedureID: app.TestID,
      //   ProcedureName: app.TestName
      // });
      // this.url = this.service.getData(doctorappointments.fetchSpecializationDoctorTimings, { SpecializationID: app.SPECIALITYID });
      // this.us.get(this.url)
      //   .subscribe((response: any) => {
      //     if (response.Code == 200) {
      //       this.showDoctorSlots = true;
      //       this.doctorList = response.GetAllDoctorsList;
  
      //       this.doctorList.forEach((i: any) => {
      //         i.Specialization = app.SPECIALITY;
      //         if (i.EmpID === app.DOCTORID) {
      //           i.selected = true;
      //           //this.loadSelectedDoctorAvailability(i);
      //         }
      //         else
      //           i.selected = false;
      //       });
  
      //       this.filterDoctor = this.doctorList;
      //     }
      //   },
      //     (err) => {
      //     })
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
        "Remarks": "Investigation Appointment Portal",
        "SCHEDULESTRING": "",
        "PREVIOUSSCHEDULEID": app.SCHEDULEID,
        "IsVitual": 0,
        "TeleURL": null
      }
  
      this.us.post(doctorappointments.RescheduleAppointment, reschedulePayload)
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
          "CancelRemarks": this.cancelForm.get("Remarks")?.value,
          "UserID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
          "WorkStationID": this.facilityId
        }
  
        this.us.post(doctorappointments.CancelAppointmentPhys, cancelPayload)
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
      var item = this.doctorList.find((x: any) => x.EmpID === this.selectedDoctor.ServiceItemID);
      this.loadSelectedDoctorAvailabilityBetweenDates(fromdate, todate, this.selectedDoctor.ServiceItemID, item);
  
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
      this.us.post(doctorappointments.PatientCheckEligibility, jsonString)
        .subscribe((response: any) => {
          console.log(response)
        },
          (err) => {
  
          })
    }
  
    viewYakeenSearchModal() {
      this.displayYakeenSearchModal = 'block';
    }
    closeYakeenSearchModal() {
      this.displayYakeenSearchModal = 'none';
    }
  
    showYakeenSearch(inputValue: number) {
      this.yakeenNewBornBabyGender = '';
      this.yakeenNewBornBaby = false;
      this.yakeenSearchDisplay = inputValue;
    }
  
    LoadYakeenNationalities() {
      let inputData = {
        workStationId: 1,
        hospitalId: this.hospitalID,
      };
      this.service
        .loadYakeenNationalities(inputData)
        .subscribe((response: any) => {
          console.log(response);
          if (response.status == 'Success') {
            const nationalities = response.data;
            // Merge arrays based on id
            const mergedArray = nationalities.map((obj1: any) => {
              const obj2 = this.Nationalities.find(
                (obj2: any) => obj2.id === obj1.id
              );
              return { ...obj2, ...obj1 };
            });
            console.log('mergedArray', mergedArray);
            this.Nationalities = this.YakeenNationalities = mergedArray;
          } else {
          }
        });
    }
    getPatientDataBYYakeenService(inputVal: number) {
      var inputValue1 = '';
      var inputValue2 = '';
      var type = '';
      this.isGetCalledForYakeenData = 'Yes';
  
      if (inputVal == 1) {
        type = 'SAUDI';
        inputValue1 = this.saudiIdYakeen;
        //inputValue2=this.hijriDateYakeen;
  
        let monthNumber = '';
        if (this.saudiYakeenMonthNumber.toString().trim().length == 1) {
          monthNumber = '0' + this.saudiYakeenMonthNumber.toString();
        } else {
          monthNumber = this.saudiYakeenMonthNumber;
        }
        inputValue2 = this.saudiYakeenYearNumber + '-' + monthNumber;
  
        if (
          this.saudiYakeenMonthNumber.toString().trim().length == 0 ||
          this.saudiYakeenYearNumber.toString().trim().length == 0 ||
          this.saudiIdYakeen.toString().length == 0
        ) {
          return;
        }
      } else if (inputVal == 2) {
        type = 'IQAMA';
        inputValue1 = this.iqamaIdYakeen;
        //inputValue2=this.dateYakeen;
        let monthNumber = '';
        if (this.iqamaYakeenMonthNumber.toString().trim().length == 1) {
          monthNumber = '0' + this.iqamaYakeenMonthNumber.toString();
        } else {
          monthNumber = this.iqamaYakeenMonthNumber;
        }
        inputValue2 = this.iqamaYakeenYearNumber + '-' + monthNumber;
  
        if (
          this.iqamaYakeenMonthNumber.toString().trim().length == 0 ||
          this.iqamaYakeenYearNumber.toString().trim().length == 0 ||
          this.iqamaIdYakeen.toString().length == 0
        ) {
          return;
        }
      } else if (inputVal == 3) {
        type = 'GCC';
        inputValue1 = this.gccNinIdYakeen;
        inputValue2 = this.gccNationalityCodeYakeen;
        if (
          this.gccNinIdYakeen.toString().length <= 0 ||
          this.gccNationalityCodeYakeen.toString().length <= 0
        ) {
          return;
        }
      } else if (inputVal == 4) {
        type = 'PASSPORT';
        inputValue1 = this.passportNoYakeen;
        inputValue2 = this.nationalityYakeen;
  
        if (
          this.passportNoYakeen.toString().length <= 0 ||
          this.nationalityYakeen.toString().length <= 0
        ) {
          return;
        }
      } else if (inputVal == 5) {
        type = 'BORDER';
        inputValue1 = this.borderNumberYakeen;
        //inputValue2=this.birthDateYakeen;
        let monthNumber = '';
        if (this.borderYakeenMonthNumber.toString().trim().length == 1) {
          monthNumber = '0' + this.borderYakeenMonthNumber.toString();
        } else {
          monthNumber = this.borderYakeenMonthNumber;
        }
        inputValue2 = this.borderYakeenYearNumber + '-' + monthNumber;
  
        if (
          this.borderYakeenMonthNumber.toString().trim().length == 0 ||
          this.borderYakeenYearNumber.toString().trim().length == 0 ||
          this.borderNumberYakeen.toString().length == 0
        ) {
          return;
        }
      } else if (inputVal == 6) {
        if (this.yakeenNewBornBabyGender.toString().length <= 0) {
          return;
        }
        type = 'UNKNOWN';
        
  
        this.closeYakeenSearchModal();
        return;
      }
  
      if (inputVal == 4) {
       
      } else {
        
      }
      const hospitalId = this.hospitalID;
      console.log('inputValue1', inputValue1);
      console.log('inputValue2', inputValue2);
      console.log('type', type);
      this.service
        .getPatientDataByYakeenService(inputValue1, inputValue2, type, hospitalId)
        .subscribe((response: any) => {
          console.log('response', response);
          // return;
          if (response.status == 'Success') {
  
            $("txtSsn").val(inputValue1);
            this.fetchPatientDetailsFromHIS(inputValue1, "0", "0", response);
            
          } else {
           
          }
        });
    }
  
    loadPatientDetailsFromYakeen(nationalId: string) {
      const searchParam = {
        PatientSearch: nationalId,
        hospitalId: this.hospitalID,
      };
      this.service
        .fetchPatientRoot(searchParam)
        .subscribe((response) => {
          console.log(response);
          if (response.status == 'Success') {
            if (response.data[0].regcode !== '') {
              const searchParam = {
                patientID: response.data[2].patientID,
                regcode: response.data[2].regcode,
              };
              //this.getPatientData(searchParam);
            }
          } else {
          }
        });
    }
  
    fetchPatientDetailsFromHIS(ssn: string, patientId: string, mobileno: string, response: any) {
      this.service.fetchPatientDataC = {
        ...this.service.fetchPatientDataC,
        SSN: ssn,
        PatientID: patientId,
        MobileNO: mobileno,
        PatientId: patientId,
        UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
        HospitalID: this.hospitalID ?? this.service.param.HospitalID,
      }
      this.url = this.service.fetchPatientDataBySsn(doctorappointments.fetchPatientDataBySsn);
  
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
          }
          else {
            this.patientDetails = [];
            this.patientDetails.SSN = ssn;
            this.patientDetails.PatientName = response.data.familyName + " " + response.data.firstName;
          }
          this.closeYakeenSearchModal()
        },
          (err) => {
  
          })
    }
  
    loadCancelReasons() {
      this.url = this.service.getData(doctorappointments.FetchCancelReasons, { HospitalID: this.hospitalID });
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
      this.url = this.service.getData(doctorappointments.FetchActionTaken, { HospitalID: this.hospitalID });
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
  
    bookappointment() {
      const anySelected = this.listOfTimeSlots.some((slot: any) => slot.selected === true);
      return !anySelected;
    }
  
    saveWaitingListAppointmentPopup() {
      this.errorMessages = [];
      if (this.patientDetails?.SSN === undefined || this.patientDetails?.length > 0) {
        this.errorMessages.push("Please select SSN");
      }
      if (this.listOfTimeSlots.length > 0) {
        this.errorMessages.push("Cannot book waiting list appointment as there are ( " + this.listOfTimeSlots.length +  " )  slots available for doctor.");
      }
      if(this.WaitingListCount != "" && this.WaitingListCountToBook != "" && Number(this.WaitingListCount) >= Number(this.WaitingListCountToBook))
      {
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
      var morningEndDate = new Date(new Date().setHours(12, 0, 0, 0));
      var afternoonFromDate = new Date(new Date().setHours(12, 0, 0, 0));
      var afternoonEndDate = new Date(new Date().setHours(17, 0, 0, 0));
      var eveningFromDate = new Date(new Date().setHours(17, 0, 0, 0));
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
        "DoctorId": this.selectedDoctor.ServiceItemID,
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
      this.us.post(doctorappointments.BookWaitingListAppointment, payload).subscribe((response) => {
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
  
      this.url = this.service.getData(doctorappointments.FetchPatientScheduleWaitingList, {
        DoctorID: this.selectedDoctor.ServiceItemID,
        Date: moment(this.waitinglistdate).format('DD-MMM-YYYY'),
        WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
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
  
    SaveDoctorNotifications(date: any, fromtime: any, totime: any, type: string) {
      var notMsg = "";
      if (type == 'cancel') {
        notMsg = "Dear " + this.selectedDoctor.EmpCodeName + ".Procedure Appointment for " + this.form.get('ProcedureName')?.value + " on  " + date + " " + fromtime + "-" + totime + " has been cancelled";
      }
      else if (type == 'rescheduled') {
        notMsg = "Dear " + this.selectedDoctor.EmpCodeName + ".Surgery Appointment for " + this.form.get('ProcedureName')?.value + " has been rescheduled for  " + date + " " + fromtime + "-" + totime;
      }
      else {
        "Dear " + this.selectedDoctor.EmpCodeName + ".Surgery Appointment for " + this.form.get('ProcedureName')?.value + " has been booked on  " + date + " " + fromtime + "-" + totime;
      }
      let payload = {
        "DoctorNotificationID": 0,
        "PatientID": this.patientDetails.PatientID,
        "AdmissionID": this.patientDetails.AdmissionID,
        "DoctorID": this.selectedDoctor.ServiceItemID,
        "SpecialiseID": this.selectedDoctor.SpecialiseId,
        "DoctorMobileNo": 0,
        "RequestType": "Procedure Schedule Doctor Notification",
        "NotificatonContent": notMsg,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": 3395,//this.facilitySessionId ?? this.service.param.WorkStationID,   
        "HospitalID": this.hospitalID
      }
      this.us.post(doctorappointments.SaveDoctorNotifications, payload).subscribe((response) => {
        if (response.Status === "Success") {
  
        }
      },
        (err) => {
  
        })
    }
  
    navigateBackWorklist() {
        $('#selectPatientYesNoModal').modal('show');
        sessionStorage.removeItem("fromRadiology");
        sessionStorage.removeItem("RadiologyPatientData");       
    }

    onAccept() {
      const SSN = this.selectedView.SSN;
      $('#selectPatientYesNoModal').modal('hide');
      sessionStorage.setItem('navigateToRadiologyWorklist', SSN)
      this.router.navigate(['/suit/radiologyworklist']);
    }
  
    onDecline() {
      $('#selectPatientYesNoModal').modal('hide');
      this.router.navigate(['/suit/radiologyworklist']);
    }
   

      printRadiologySchedule(wrk:any) {
        const url = this.service.getData(doctorappointments.FetchRadiologyAPpPrint, { 
             ScheduleID: wrk.SCHEDULEID,
              UserID : this.doctorDetails[0].UserId,
              WorkStationID : this.facilitySessionId ?? this.service.param.WorkStationID,
              HospitalID: this.hospitalID
             });
            this.us.get(url)
              .subscribe((response: any) => {
                if (response.Code == 200) {
                  this.trustedUrl = response?.FTPPATH
                 $("#reviewAndPayment").modal('show');
                }
              },
                (err) => {
                })
      }
  }
  
  export const doctorappointments = {
    fetchGProcedures: 'FetchSSPhysiotheraphy?Filter=${Filter}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    fetchGRrocedures: 'FetchSSRadiologyInv?Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    fetchGSpecialisation: 'FetchGSpecialisation?Type=${Type}&DisplayName=${DisplayName}',
    fetchHospitalLocations: 'FetchHospitalLocations?type=0&filter=blocked=0&UserId=0&WorkstationId=0',
    fetchSpecializationDoctor: 'FetchSpecializationDoctor?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    fetchSpecializationDoctorTimings: 'FetchSpecializationDoctorTimings?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    saveResourceAvailbility: 'SaveResourceAvailbility',
    fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    AppointmentListNL: 'AppointmentListNL', 
    EquipmentAppointmentList: 'EquipmentAppointmentList',
    getAvailableDates: 'GetAvailableDatesC',
    GetEquipmentAvailableDatesC: 'GetEquipmentAvailableDatesC', 
    fetchDoctorsWiseNextAvailableBWdates: 'FetchDoctorsWiseNextAvailableBWdates?FromDate=${FromDate}&ToDate=${ToDate}&DoctorID=${DoctorID}&HospitalID=${HospitalID}',
    FetchEquipmentsWiseNextAvailableBWdates: 'FetchEquipmentsWiseNextAvailableBWdates?FromDate=${FromDate}&ToDate=${ToDate}&serviceItemId=${serviceItemId}&HospitalID=${HospitalID}',
   getTimeSlots: 'GettingDateSlots',
   getTimeSlotsEquipment: 'GettingDateSlotsEquioments',
    getClinicTimings: 'GettingDateSlotsN',
    FetchPatientOPDVisits: 'FetchPatientOPDVisits',
    CancelAppointment: 'CancelAppointment',
    CancelAppointmentPhys: 'CancelAppointmentPhys',
    RescheduleAppointment: 'RescheduleAppointment',
    FetchReferalDoctors: 'FetchReferalDoctors?Tbl=${Tbl}&Name=${Name}',
    PatientCheckEligibility: `${config.nphiesapiurl}`,
    FetchCancelReasons: 'FetchCancelReasons?HospitalID=${HospitalID}',
    FetchActionTaken: 'FetchActionTaken?HospitalID=${HospitalID}',
    FetchPatientScheduleWaitingList: 'FetchPatientScheduleWaitingList?DoctorID=${DoctorID}&Date=${Date}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    BookAppointment:'BookAppointment',
    BookWaitingListAppointment:'BookWaitingListAppointment',
    BookPHYAppointment:'BookPHYAppointment',
    SaveDoctorNotifications: 'SaveDoctorNotifications',
    FetchResourceTypeNameScheduleH:'FetchResourceTypeNameScheduleH?DomainID=${DomainID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchRadiologyAPpPrint:'FetchRadiologyAPpPrint?ScheduleID=${ScheduleID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientPendingPhysiotherphyPrescriptions: 'FetchPatientPendingPhysiotherphyPrescriptions?PatientID=${PatientID}&ProcedureID=${ProcedureID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  };