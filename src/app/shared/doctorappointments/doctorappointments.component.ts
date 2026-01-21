import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, Renderer2 } from '@angular/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { DoctorappointmentService } from './doctorappointments.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { MatCalendarCellCssClasses, MatDatepicker } from '@angular/material/datepicker';
import { YakeenServiceData } from 'src/app/frontoffice/doctorappointment/models/yakeenservicedata.model';
import { YakeenNationalities } from 'src/app/frontoffice/doctorappointment/models/yakeenNationalities.model';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ActivatedRoute, Router } from '@angular/router';
import { config } from 'src/environments/environment';
import { ConfigService } from 'src/app/ward/services/config.service';

declare var $: any;

@Component({
  selector: 'app-doctorappointments',
  templateUrl: './doctorappointments.component.html',
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
export class DoctorappointmentsComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() readonly: any = false;
  @Input() selectedDischargeDetails: any;
  @Output() savedappointment = new EventEmitter<any>();

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
  listOfSpecialisation1: any = [];
  locationList: any = [];
  FeatureRoleList: any = [];
  FeatureRoleListEnable = false;
  form: any;
  doctorList: any = [];
  doctorList1: any = [];
  filterDoctor: any = [];
  facilityId: any;
  selectAll = false;
  selectedDoctor: any;
  listOfDates: any = [];
  listOfAppointments: any = [];
  listOfPastAppointments: any = [];
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
  showVisitInfoTab = true;
  listofUpcomingAppointments: any = [];
  selectedAppToReschedule: any;
  selectedAppToCancel: any;
  isReschedule = false;
  appSaveMsg: string = "Appointment saved successfully";
  clinicTimings: string = "";
  noVisitMsg: string = "No Visits";
  listOfItems: any = [];
  listOfItems1: any = [];
  doctorSearch = false;
  txtViewMore = "View More";
  displayYakeenSearchModal: string = 'none';
  yakeenData: YakeenServiceData = new YakeenServiceData();
  yakeenNationalities: YakeenNationalities = new YakeenNationalities();
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
  IsDischargeFollowups = false;
  dischargefollowups: any;
  @ViewChild('txtSsn') txtSsn!: ElementRef;
  isMobileSearch: boolean = false;
  FetchPatientdetailsLastVisitedDataList: any;
  isActive: boolean = false;
  lang: any;
  direction: string = '';
  months: string[] = MONTHLIST;
  patientRegForm!: FormGroup;
  isFormSubmitted: boolean = false;
  companyListData: any = [];
  nationalIDExpiryDate: string = '';
  changeLog: any = [];
  saudimobileNoYakeen: any = '';
  iqamamobileNoYakeen: any = '';
  gccmobileNoYakeen: any = '';
  passportmobileNoYakeen: any = '';
  bordermobileNoYakeen: any = '';
  unknownmobileNoYakeen: any = '';
  errorMsg: string = "";
  patientData: any;
  selectedYakeenData: any = {};
  initialValue?: any;
  isFetchPatientdata: boolean = false;
  fromFutureAppointments: boolean = false;
  holidaysList: HolidayOutput[] = [];
  hoveredDate: Date | null = null;
  currentMonth: any;
  currentYear: any;
  monthMap: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  lastHoveredDate: string | null = null;
  multipleSlots: boolean = false;
  showAppointmentsModal: boolean = false;
  showSaveBtn: boolean = true;

  viewMoreForm: any;
  viewMoreList: any = [];
  visitsList: any;
  filteredDoctorsList: any = [];
  filteredDoctor: any;
  viewMoreFullList: any;
  cssClasses = ["selected-range", "selected-range-red", "selected-range-2", "selected-range-3", "selected-range-4", "selected-range-5"];

  constructor(private service: DoctorappointmentService, private wardConfig: ConfigService,
    private us: UtilityService, private formbuilder: FormBuilder, public datepipe: DatePipe, private router: Router, private route: ActivatedRoute, private renderer: Renderer2) {
    super();
    console.log("Shared:DoctorAppoints-Start");
    this.lang = sessionStorage.getItem("lang");
    if (this.lang == 'ar') {
      this.direction = 'rtl';
    }
    this.facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
    this.service.param = {
      ...this.service.param,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
      WorkStationID: Object.keys(this.facilitySessionId).length > 0 ? this.facilitySessionId : this.service.param.WorkStationID
    };
    this.form = this.formbuilder.group({
      HospitalID: [],
      HospitalName: [''],
      HospitalName2l: [''],
      SpecialiseID: [''],
      Specialisation: [''],
      Specialisation2l: [''],
      DoctorID: [''],
      DoctorName: [''],
      DoctorName2l: ['']
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
    var pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 6);
    this.viewMoreForm = this.formbuilder.group({
      fromDate: pastDate,
      toDate: new Date()
    });

    var wm = new Date();
    var d = new Date();
    wm.setMonth(wm.getMonth() - 1);
    this.tablePatientsForm.patchValue({
      FromDate: d,
      ToDate: d
    });
    this.patientRegForm = this.formbuilder.group({
      TitleID: [''],
      Title: [],
      NationalityID: [''],
      Nationality: [],
      GenderID: [''],
      Gender: [],
      MaritalStatusID: ['1'],
      MaritalStatus: [''],
      ReligionID: [''],
      Religion: [''],
      AgeUOMID: [''],
      Familyname: [''],
      MiddleName: [''],
      FirstName: [''],
      DOB: [''],
      GrandFatherName: [''],
      Familyname2L: [''],
      MiddleName2L: [''],
      FirstName2L: [''],
      GrandFatherName2L: [''],
      Age: [''],
      GaurdianGenderId: ['0'],
      GaurdianGender: [''],
      SSN: [''],
      PassportNo: [''],
      Isvip: [false],
      IsEmployee: [false],
      Email: [''],
      MobileNo: [''],
      ContactName: [''],
      ContRelationID: ['0'],
      ContRelation: [],
      ContPhoneNo: [''],
      Address01: [''],
      CityID: ['6'],
      City: [''],
      state: [''],
      country: [''],
      CountryName: [''],
      CityAreaID: ['0'],
      Area: [''],
      socialTypeSelection: ['nationalID'],
      nationalIDFile: [''],
      PatientEmpId: [''],
      hijriDOB: [''],
      discoveryCompany: ['0'],
      eligibilityPurpose: ['2'],
      patientTypeInfo: [{ value: '0', disabled: true }],
      employeeName: [''],
      OccupationID: ['0'],
      Occupation: [],
    });
  }  

  initializePicker(): void {
      if (this.picker) {
        this.picker.dateClass = (date: Date): string | MatCalendarCellCssClasses => {
          if (this.isDateInRange(date).length > 0) {
            return this.isDateInRange(date)[0].cssClass; 
          }
          if (this.isDateInRangeAvail(date).length > 0) {
            return 'selected-range'; 
          }
          return '';
        };
    
        this.picker.openedStream.subscribe(() => {
          setTimeout(() => this.attachHoverEvents(), 0);
        });
      }
    }
    
  attachHoverEvents(): void {
    const calendarCells = document.querySelectorAll('.mat-calendar-body-cell');
    calendarCells.forEach(cell => {
      this.renderer.listen(cell, 'mouseenter', () => this.onDateHover(cell));
      this.renderer.listen(cell, 'mouseleave', () => this.onDateLeave());
    });

    const previousButton = document.querySelector('.mat-calendar-previous-button');
    const nextButton = document.querySelector('.mat-calendar-next-button');

    if (previousButton) {
      this.renderer.listen(previousButton, 'click', () => this.onPreviousClick());
    }
    if (nextButton) {
      this.renderer.listen(nextButton, 'click', () => this.onNextClick());
    }
  }

  onPreviousClick(): void {
    setTimeout(() => this.attachHoverEvents(), 0);
  }

  onNextClick(): void {
    setTimeout(() => this.attachHoverEvents(), 0);
  }
  onDateHover(cell: Element): void {
    const htmlCell = cell as HTMLElement;
    const fullDate = `${htmlCell.innerText?.padStart(2, '0')}-${this.currentMonth}-${this.currentYear}`;

    if (this.lastHoveredDate === fullDate) {
      return;
    }

    this.lastHoveredDate = fullDate;

    const holidayDescription = this.getHolidayName(fullDate);
    const calendarControls = document.querySelector('.mat-calendar-controls') as HTMLElement;

    if (calendarControls) {
      const cssContent = holidayDescription !== 'No holiday' ? `"${holidayDescription}"` : '';
      calendarControls.style.setProperty('--holiday-description', cssContent);

      if (cssContent) {
        calendarControls.style.setProperty('--holiday-description-display', 'block');
      } else {
        calendarControls.style.setProperty('--holiday-description-display', 'none');
      }
    }
  }

  onDateLeave(): void {
    this.hoveredDate = null;
    const calendarControls = document.querySelector('.mat-calendar-controls') as HTMLElement;
    if (calendarControls) {
      calendarControls.style.setProperty('--holiday-description-display', 'none');
    }
  }
  getHolidayName(date: string): string {
    const holiday = this.holidaysList.find(
      (holiday) =>
        holiday.fullDate === date
    );
    return holiday ? holiday.description : 'No holiday';
  }


  lastvisited_toggleClass() {
    this.isActive = !this.isActive;
  }

  private isDateInRange(date: Date): any {
    const parsedDate = new Date(date);
    this.currentMonth = this.monthMap[parsedDate.getMonth()];;
    this.currentYear = parsedDate.getFullYear();
    this.listOfAppointments.filter((d: any) => d.fullDate === this.datepipe.transform(date, "dd-MMM-yyyy")?.toString());
    return this.holidaysList.filter((d: any) =>
      d.fullDate === this.datepipe.transform(date, "dd-MMM-yyyy")?.toString()
    );


  }
  private isDateInRangeAvail(date: Date): any {
    const parsedDate = new Date(date);
    this.currentMonth = this.monthMap[parsedDate.getMonth()];;
    this.currentYear = parsedDate.getFullYear();
    //this.listOfAppointments.filter((d: any) => d.fullDate === this.datepipe.transform(date, "dd-MMM-yyyy")?.toString());
    return this.listOfAppointments.filter((d: any) =>
      d.fullDate === this.datepipe.transform(date, "dd-MMM-yyyy")?.toString()
    );


  }

  ngOnInit(): void {
    console.log("Shared:NgOninit-Start");
    this.fromFutureAppointments = sessionStorage.getItem("fromFutureAppointments") === "true" ? true : false;
    this.form.patchValue({
      HospitalID: sessionStorage.getItem("hospitalId"),
      HospitalName: sessionStorage.getItem("locationName"),
    });
    this.FetchCountryWiseHolidays();
    if (this.readonly) {
      this.form.patchValue({
        SpecialiseID: this.selectedDischargeDetails.specializationId,
        Specialisation: this.selectedDischargeDetails.specializationName
      });

      this.fetchSpecializationDoctor({
        "SpecialiseID": this.selectedDischargeDetails.specializationId,
        "Specialisation": this.selectedDischargeDetails.specializationName
      });

      $("#txtSsn").val(this.selectedView.SSN);

      setTimeout(() => {
        const inputElement = document.getElementById('txtSsn');
        if (inputElement) {
          const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true,
            cancelable: true
          });
          inputElement.dispatchEvent(event);
        }
      }, 200);
    }

    this.fetchHospitalLocations();
    this.fetchSpecialisations();
    //this.fetchInitialDoctors();
    this.currentDate = moment(new Date()).format('DD-MMM-YYYY');
    this.selectedDate.fullDate = this.currentDate;
    this.LoadYakeenNationalities();
    this.FetchHospitalUserRoleDetails();
    this.route.queryParams.subscribe((params: any) => {
      if (params['MobileNo']) {
        $('#txtMobileNo').val(0 + params['MobileNo']);
        this.getPatientByMobileNo(0 + params['MobileNo']);
      }
    });
    console.log("Shared:NgOninit-End")
  }

  FetchHospitalUserRoleDetails() {
    this.url = this.service.getData(doctorappointments.FetchHospitalUserRoleDetails, {
      FeatureID: 562,
      UserID: this.doctorDetails[0]?.UserId,
      WorkStationID: Object.keys(this.facilitySessionId).length > 0 ? this.facilitySessionId : this.service.param.WorkStationID,
      HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FeatureRoleList = response.FetchHospitalUserRoleDetailsDataList;
          const existingId = this.FeatureRoleList.find((Functionlist: any) => Functionlist.FunctionID === '544');
          if (existingId) {
            this.FeatureRoleListEnable = true;
          }
        }
      },
        (err) => {
        })
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
      HospitalName2l: item.Name2l
    });
  }

  fetchInitialDoctors() {
    // this.url = this.service.getData(doctorappointments.FetchReferalDoctors, { Tbl: 11, Name: '%%%' });
    //   this.us.get(this.url)
    //     .subscribe((response: any) => {
    //       if (response.Code == 200) {
    //         this.listOfItems = this.listOfItems1 = response.ReferalDoctorDataList;
    //       }
    //     },
    //       (err) => {
    //       })

    this.url = this.service.getData(doctorappointments.fetchSpecializationDoctorTimings, {
      SpecializationID: 0,
      UserID: this.doctorDetails[0]?.UserId,
      WorkStationID: Object.keys(this.facilitySessionId).length > 0 ? this.facilitySessionId : this.service.param.WorkStationID,
      HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.doctorList = this.doctorList1 = response.GetAllDoctorsList;
          this.listOfItems = this.listOfItems1 = this.doctorList;

        }
      },
        (err) => {
        })
  }

  searchDoctor(event: any) {
    const item = event.target.value;
    this.listOfItems = this.listOfItems1;
    let arr = this.listOfItems1.filter((spec: any) => spec.EmpCodeName.toLowerCase().indexOf(item.toLowerCase()) === 0);
    this.listOfItems = arr.length ? arr : [];

    if (arr.length === 0) {
      this.fetchDoctorSearch(event);
    }
  }

  fetchSpecialisationsOld() {
    this.url = this.service.getData(doctorappointments.fetchGSpecialisation, { Type: 2, DisplayName: '%%%' });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfSpecialisation = this.listOfSpecialisation1 = response.FetchGSpecialisationDataList;
        }
      },
        (err) => {
        })
  }
  fetchSpecialisations() {
    this.url = this.service.getData(doctorappointments.fetchGSpecialisationN, { HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID, });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfSpecialisation = this.listOfSpecialisation1 = response.DeptDataList;
        }
      },
        (err) => {
        })
  }

  searchSpecItem(event: any) {
    const item = event.target.value;
    this.listOfSpecialisation = this.listOfSpecialisation1;
    let arr;
    if (this.lang === 'ar') {
      arr = this.listOfSpecialisation1.filter((spec: any) => spec.Specialisation2l.toLowerCase().indexOf(item.toLowerCase()) === 0);
    }
    else {
      arr = this.listOfSpecialisation1.filter((spec: any) => spec.Specialisation.toLowerCase().indexOf(item.toLowerCase()) === 0);
    }

    this.listOfSpecialisation = arr.length ? arr : [];
  }

  selectSpecialisationItem(event: any) {
    let item;
    if (this.lang === 'ar') {
      item = this.listOfSpecialisation.find((x: any) => x.Specialisation2l === event.option.value);
    }
    else {
      item = this.listOfSpecialisation.find((x: any) => x.Specialisation === event.option.value);
    }
    //this.listOfSpecialisation = [];
    this.form.patchValue({
      SpecialiseID: item.SpecialiseID,
      Specialisation: item.Specialisation,
      Specialisation2l: item.Specialisation2l
    });
    this.fetchSpecializationDoctor(item);
  }

  fetchSpecializationDoctor(item: any) {
    this.url = this.service.getData(doctorappointments.fetchSpecializationDoctorTimings, {
      SpecializationID: item.SpecialiseID,
      UserID: this.doctorDetails[0]?.UserId,
      WorkStationID: Object.keys(this.facilitySessionId).length > 0 ? this.facilitySessionId : this.service.param.WorkStationID,
      HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.doctorList = this.doctorList1 = response.GetAllDoctorsList;
          this.listOfItems = this.listOfItems1 = this.doctorList;
          if (this.IsDischargeFollowups) {
            var item = this.doctorList.filter((a: any) => a.EmpID == this.dischargefollowups.DoctorID);
            if (item.length > 0) {
              this.selectedDate.fullDate = moment(new Date(this.dischargefollowups.FollowUpDate)).format('DD-MMM-YYYY')
              this.loadSelectedDoctorAvailability(item[0]);
            }
          }
          else if (this.fromFutureAppointments) {
            var item = this.doctorList.find((a: any) => a.EmpID == this.dischargefollowups.DoctorID);
            if (item) {
              this.selectedDate.fullDate = moment(new Date(this.dischargefollowups.AppointmentDateTime.split(' ')[0])).format('DD-MMM-YYYY');
              item.HOSPITALID = item.HospitalId;
              item.SPECIALITYID = item.SpecialiseId;
              item.SPECIALITY = item.SpecialityName;
              item.DOCTORID = item.EmpID;
              item.DOCTORNAME = item.EmpCodeName;
              this.loadAppointmentForReschedule(item);
            }
          }
          if (this.doctorList.length > 0) {
            if (this.doctorSearch && this.form.get('DoctorID')?.value) {
              var doc = this.doctorList.find((x: any) => x.EmpID == this.form.get('DoctorID')?.value);
              const docindex = this.doctorList.indexOf(doc);
              if (docindex != 0) {
                this.doctorList.splice(docindex, 1);
                this.doctorList.splice(0, 0, doc);
              }
              if (item != undefined)
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
                // i.Specialization = item.SpecialityName;
                i.selected = false;
              });
            }
            this.filterDoctor = this.doctorList;
            this.showDoctorSlots = true;
            this.isMobileSearch = false;
          }
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

  selectDocor(event: any) {
    const item = this.listOfItems.find((x: any) => x.EmpCodeName === event.option.value);
    this.doctorSearch = true;
    this.form.patchValue({
      DoctorID: item.EmpID,
      DoctorName: item.EmpCodeName,
      SpecialiseID: item.SpecialiseId
    });
    item.SpecialiseID = item.SpecialiseId;
    this.fetchSpecializationDoctor(item);
  }

  fetchDoctors(event: any) {
    if (!event.target.value) {
      this.doctorList = this.doctorList1 = this.filterDoctor;
    }
    else {
      var res = this.filterDoctor.filter((e: any) => e.EmpCodeName.toUpperCase().includes(event.target.value.toUpperCase()));
      this.doctorList = this.doctorList1 = res;
    }
  }

  onDoctorEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.fetchDoctors(event);
    }
  }

  filterDoctors(event: any) {
    this.doctorList = this.doctorList1.filter((template: any) => template.EmpCodeName.toLowerCase().includes(event.target.value.toLowerCase().trim())
    );
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
    this.url = this.service.getData(doctorappointments.fetchDoctorsWiseNextAvailableBWdates, { FromDate: fromdate, ToDate: todate, DoctorID: item.EmpID, HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.DatesList.length > 0) {
          this.listOfAppointments = response.DatesList;
        }
      },
        (err) => {
        })


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
      "HospitalId": this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,
      "DoctorId": item.EmpID,
      "ScheduleDate": this.selectedDate.fullDate
    }

    this.us.post(doctorappointments.getAvailableDates, appointmentpayoad)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.DatesList.length > 0) {
          this.listOfDates = response.DatesList;
          this.listOfDatesFiltered = this.listOfDates;
          setTimeout(() => {
            this.initializePicker();
          }, 100);
          if (this.IsDischargeFollowups) {
            this.selectedDate.fullDate = moment(new Date(this.dischargefollowups.FollowUpDate)).format('DD-MMM-YYYY');

            this.doctorList.forEach((doctor: any) => {
              doctor.selected = doctor.EmpID === this.dischargefollowups.DoctorID;
            });
          } else {
            this.selectedDate.fullDate = this.listOfDates[0].fullDate;
          }
          var selecteddate = this.listOfDates.find((x: any) => x.fullDate === this.selectedDate.fullDate);
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
          this.errorMessages.push("Dr. " + item.EmpCodeName + " has no available slot configuration");
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
      var item = this.doctorList.find((x: any) => x.EmpID === this.selectedDoctor.EmpID);
      this.loadSelectedDoctorAvailabilityBetweenDates(fromdate, todate, this.selectedDoctor.EmpID, item);
    }
  }

  loadSelectedDoctorAvailabilityBetweenDates(fromdate: any, todate: any, doctorid: any, item: any) {

    this.url = this.service.getData(doctorappointments.fetchDoctorsWiseNextAvailableBWdates, { FromDate: fromdate, ToDate: todate, DoctorID: doctorid, HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID });
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
    var selecteddate = this.listOfDates.find((x: any) => x.fullDate === date.fullDate);
    this.isSlotAvailable = selecteddate.IsAvaialbleSlot;
    this.WaitingListCount = selecteddate.WaitingAppointmentCount;
    this.selectedTime = {};
    this.getTimeslots(date);
  }
  addSelectedTime(time: any, type: any) {
    if (time.ISAVAILABLE == 2) {
      return;
    }
    if(time.ISAVAILABLE==3) {
      $("#txtSsn").val(time.SSN);
      this.showSaveBtn =  false;
      this.fetchPatientDetails(time.SSN, "0", "0", true);
      this.lastvisited_toggleClass();
    }
    else {
      this.showSaveBtn =  true;
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
    var timeslotpayload = {
      "SpecialityId": this.form.get('SpecialiseID')?.value,
      "HospitalId": this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,
      "DoctorId": this.selectedDoctor.EmpID,
      "ScheduleDate": this.selectedDate.fullDate
    }
    this.us.post(doctorappointments.getTimeSlots, timeslotpayload)
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

  getClinicTimings() {
    var currentDate = moment(new Date()).format('DD-MMM-YYYY');
    var timeslotpayload = {
      "SpecialityId": this.form.get('SpecialiseID')?.value,
      "HospitalId": this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,
      "DoctorId": this.selectedDoctor.EmpID,
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

  onMobileNoEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.getPatientByMobileNo((event.target as any)?.value);
    }
  }

  getPatientByMobileNo(MobileNo: any) {
    this.patientDetails = [];
    // this.latestDoctorVisits = [];
    // this.doctorList = [];
    // this.selectedDoctor = [];
    // this.listOfDates = [];
    this.listofUpcomingAppointments = [];
    this.url = this.service.getData(doctorappointments.FetchPatientdetailsAgainstMobileNo, {
      MobileNo,
      WorkStationID: Object.keys(this.facilitySessionId).length > 0 ? this.facilitySessionId : this.service.param.WorkStationID,
      HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.showDoctorSlots = true;
          this.isMobileSearch = true;
          this.patientDetails = response.FetchPatientdetailsAgainstMobileNoDataList;
          this.FetchPatientdetailsLastVisitedDataList = response.FetchPatientdetailsLastVisitedDataList;
          if (response.FetchPatientdetailsAgainstMobileNoDataList.length === 0) {
            $("#NoPatientMsg").modal('show');
          }
        }
      },
        (err) => {
        });
  }

  onMobileSearchPatientSelection(patient: any) {
    const PatientID = patient.PatientID;
    this.latestDoctorVisits = [];
    this.listofUpcomingAppointments = [];
    this.isActive = true;
    if (this.FetchPatientdetailsLastVisitedDataList.length == 0) {
      this.fetchPatientDetails(patient.SSN === '' ? "0" : patient.SSN, "0", PatientID);
    }
    else {
      this.FetchPatientdetailsLastVisitedDataList.forEach((item: any) => {
        if (item.PatientID === PatientID) {
          this.fetchPatientDetails(patient.SSN, "0", PatientID);
          const now = new Date();
          const specificDate = new Date(item.BillDate || item.ScheduleDate);
          if (now > specificDate) {
            this.latestDoctorVisits.push({ ...item });
          } else if (now < specificDate) {
            this.listofUpcomingAppointments.push({ ...item });
          }
        }
        else {
          this.fetchPatientDetails(patient.SSN === '' ? "0" : patient.SSN, "0", PatientID);
        }
      });
    }

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

  fetchPatientDetails(ssn: string, mobileno: string, patientId: string, fromSlot : boolean = false) {
    this.service.fetchPatientDataC = {
      ...this.service.fetchPatientDataC,
      SSN: ssn || this.patientDetails.SSN,
      PatientID: patientId,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.service.param.WorkStationID,
      HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,
    }
    this.url = this.service.fetchPatientDataBySsn(doctorappointments.fetchPatientDataBySsn);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.showDoctorSlots = true;
          this.isMobileSearch = false;
          if (response.FetchPatientDependCLists.length > 1) {
            this.multiplePatients = response.FetchPatientDependCLists;
            this.patientDetails = response.FetchPatientDependCLists[0];
            this.selectedPatientId = this.patientDetails.PatientID;
            this.selectedPatientSSN = this.patientDetails.SSN;
            this.AppointmentCount = this.patientDetails.AppointmentCount;
            this.selectPatient(response.FetchPatientDependCLists[0]);
            if(fromSlot) {
              this.showVisitOrUpcomingInfo('upcoming');
            }
            else {
              this.FetchPatientOPDVisits();
            }
            //$("#divMultiplePatients").modal('show');
          }
          else {
            if (response.FetchPatientDataCCList.length > 0) {
              this.patientDetails = response.FetchPatientDataCCList[0];
              this.selectedPatientId = this.patientDetails.PatientID;
              this.selectedPatientSSN = this.patientDetails.SSN;
              this.AppointmentCount = this.patientDetails.AppointmentCount;
              if(fromSlot) {
                this.showVisitOrUpcomingInfo('upcoming');
              }
              else {
                this.FetchPatientOPDVisits();
              }
            }
            else {
              $("#NoPatientMsg").modal('show');
            }
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
    this.BookingInfoTab = "3"; this.waitingDaySlot = "";
    this.showDoctorSlots = false;
    this.doctorSearch = false;
    this.isMobileSearch = false;
    this.selectedPatientId = "";
    $("#txtSsn").val('');
    $("#txtMobileNo").val('');
    this.selectedDoctor = []; this.latestDoctorVisits = [];
    this.multiplePatients = []; this.patientDetails = []; this.doctorList = []; this.listOfDates = [];
    this.morningTimeSlots = []; this.afternoonTimeSlots = []; this.eveningTimeSlots = []; this.listOfItems = [];
    this.showVisitInfoTab = true; this.isReschedule = false;
    this.listofUpcomingAppointments = []; this.selectedAppToReschedule = []; this.selectedAppToCancel = [];
    this.form = this.formbuilder.group({
      HospitalID: [],
      HospitalName: [''],
      HospitalName2l: [''],
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
    this.fetchHospitalLocations();
    //this.fetchInitialDoctors();
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
    let FromSlotId;
    let ToSlotId;
    if (this.multipleSlots) {
      const selectedMorningSlots = this.morningTimeSlots.filter((element: any) => element.selected);
      if (selectedMorningSlots.length > 0) {
        FromSlotId = selectedMorningSlots[0].FROMSLOTID;
        ToSlotId = selectedMorningSlots[selectedMorningSlots.length - 1].TOSLOTID;
      }
      const selectedAfternoonSlots = this.afternoonTimeSlots.filter((element: any) => element.selected);
      if (selectedAfternoonSlots.length > 0) {
        FromSlotId = FromSlotId || selectedAfternoonSlots[0].FROMSLOTID;
        ToSlotId = selectedAfternoonSlots[selectedAfternoonSlots.length - 1].TOSLOTID;
      }
      const selectedEveningSlots = this.eveningTimeSlots.filter((element: any) => element.selected);
      if (selectedEveningSlots.length > 0) {
        FromSlotId = FromSlotId || selectedEveningSlots[0].FROMSLOTID;
        ToSlotId = selectedEveningSlots[selectedEveningSlots.length - 1].TOSLOTID;
      }
    } else {
      FromSlotId = this.selectedTime.FROMSLOTID;
      ToSlotId = this.selectedTime.TOSLOTID;
    }
    if (this.errorMessages.length === 0) {
      let payload = {
        "PatientID": this.patientDetails.PatientID,
        "HospitalId": this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,//this.hospitalID,
        "PatientName": this.patientDetails.PatientName,
        "Age": this.patientDetails.Age,
        "AgeUOMId": this.patientDetails.AgeUoMID,
        "Mobile": this.patientDetails.MobileNo,
        "Genderid": this.patientDetails.GenderID,
        "DoctorId": this.selectedDoctor.EmpID,
        "SpecialiseID": this.form.get('SpecialiseID')?.value,
        "ScheduleDate": this.selectedTime.SCHEDULEDATE,
        FromSlotId,
        ToSlotId,
        "Remarks": "Doctor Appiontment",
        "IsVitual": 0,
        "TeleURL": null,
        "StatusString": "3",
        "DischargeAfterFollowUpID": this.IsDischargeFollowups ? this.dischargefollowups.DischargeAfterFollowUpID : "0",
        "UserID": this.doctorDetails[0]?.UserId
      }
      //this.service.bookAppointment(payload).subscribe((response) => {
      this.us.post(doctorappointments.BookAppointment, payload).subscribe((response) => {
        if (response.Status === "Success") {
          $("#txtSsn").val('');
          this.AppointmentCount = "";
          this.patientDetails = [];
          $("#appointmentSaveMsg").modal('show');
          if (this.readonly) {
            this.selectedDischargeDetails.ScheduleID = response.ScheduleID;
            this.selectedDischargeDetails.ScheduleNo = response.ScheduleNo;
            this.savedappointment.emit(this.selectedDischargeDetails);
          }
        }
        else {
          if (response.Status == 'Fail') {
            this.errorMessages = [];
            this.errorMessages.push(response.Message);
            //this.errorMessages.push(response.Message2L);
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
      "HospitalId": this.form.get('HospitalID')?.value ?? this.service.param.HospitalID
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
      this.fetchPastAppointments();
    }
    else {
      this.showVisitInfoTab = false;
      if (!this.isMobileSearch) {
        this.fetchUpcomingAppointments();
      }
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

    this.us.post(doctorappointments.AppointmentListNL, upcomingPayload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.listofUpcomingAppointments = response.AppointmentList;
        }
      },
        (err) => {

        })
  }

  fetchPastAppointments() {
    const todate = moment(new Date()).format('DD-MMM-YYYY');
    const fromdate = moment(todate, 'DD-MMM-YYYY').subtract(3, 'months').format('DD-MMM-YYYY');
    var PatientId= this.patientDetails.PatientID;
    var WorkStationID= Object.keys(this.facilitySessionId).length > 0 ? this.facilitySessionId : this.service.param.WorkStationID;
    this.url = this.service.getData(doctorappointments.FetchPatientVisitsWithAppointments, { FromDate: fromdate, ToDate: todate, PatientID: PatientId,WorkStationID: WorkStationID, HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientVisitsWithAppointmentsDataList.length > 0) {
          this.latestDoctorVisits = response.FetchPatientVisitsWithAppointmentsDataList;
        }
      },
        (err) => {
        })
  }


  loadVisitInfo(visit: any) {
    this.latestDoctorVisits.forEach((element: any, index: any) => {
      if (element.ScheduleID === visit.ScheduleID) {
        visit.selected = true;
      }
      else {
        visit.selected = false;
      }
    });
    this.form.patchValue({
      SpecialiseID: visit.SpecialiseId || visit.SpecialiseID,
      Specialisation: visit.Specialisation,
      HospitalID: visit.HospitalID,
      HospitalName: this.locationList.find((x: any) => x.HospitalID.toString() === visit.HospitalID.toString()).Name,
      DoctorID: visit.DoctorID,
      DoctorName: visit.DoctorName
    });
    this.url = this.service.getData(doctorappointments.fetchSpecializationDoctorTimings, { SpecializationID: visit.SpecialiseID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.GetAllDoctorsList.length > 0) {

          this.isMobileSearch = false;
          this.fetchPatientDetails(visit.SSN, "0", "0");

          this.doctorList = response.GetAllDoctorsList;

          this.doctorList.forEach((i: any) => {
            i.Specialization = visit.SpecialityName;
            if (i.EmpID == visit.DoctorID) {
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
          this.doctorList1 = [];
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
    this.form.patchValue({
      SpecialiseID: app.SPECIALITYID,
      Specialisation: app.SPECIALITY,
      HospitalID: app.HOSPITALID,
      HospitalName: this.locationList.find((x: any) => x.HospitalID === app.HOSPITALID).Name,
      DoctorID: app.DOCTORID,
      DoctorName: app.DOCTORNAME
    });
    this.url = this.service.getData(doctorappointments.fetchSpecializationDoctorTimings, { SpecializationID: app.SPECIALITYID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.showDoctorSlots = true;
          this.isMobileSearch = false;
          this.doctorList = this.doctorList1 = response.GetAllDoctorsList;

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
      "HOSPITALID": this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,
      "PATIENTNAME": app.PATIENTNAME,
      "AGE": app.AGE,
      "AGEUOMID": app.AGEUOMID,
      "MOBILE": this.patientDetails.MobileNo,
      "GENDERID": this.patientDetails.GenderID,
      // "DOCTORID": app.DOCTORID,
      // "SpecialiseID": app.SPECIALITYID,
      "DOCTORID": this.selectedDoctor.EmpID,
      "SpecialiseID": this.form.get('SpecialiseID')?.value,
      "SCHEDULEDATE": this.selectedDate.fullDate,
      "FROMSLOTID": this.selectedTime.FROMSLOTID,
      "TOSLOTID": this.selectedTime.TOSLOTID,
      "Remarks": "Doctor Appointment Reschedule",
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
    if (this.cancelForm.get("ActionTypeID")?.value != '0' && this.cancelForm.get("CancelReasonID")?.value != '0') {
      var cancelPayload = {
        "ScheduleID": app.SCHEDULEID,
        "PatientID": this.selectedPatientId,
        "HOSPITALID": this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,
        "ActionTypeID": this.cancelForm.get("ActionTypeID")?.value,
        "CancelReasonID": this.cancelForm.get("CancelReasonID")?.value,
        "CancelRemarks": this.cancelForm.get("Remarks")?.value
      }

      this.us.post(doctorappointments.CancelAppointment, cancelPayload)
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
      // if (this.cancelForm.get("Remarks")?.value == '')
      //   this.showRemarksMandatoryMsg = true;
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
    this.us.post(doctorappointments.PatientCheckEligibility, jsonString)
      .subscribe((response: any) => {
        console.log(response)
      },
        (err) => {

        })
  }

  viewYakeenSearchModal() {
    $("#NoPatientMsg").modal('hide');
    this.displayYakeenSearchModal = 'block';
    //$('#yakeenServiceModel').modal('show');
  }
  clearYakeenSearchInputs() {
    // Saudi
    this.saudiIdYakeen = '';
    this.saudiYakeenMonthNumber = '';
    this.saudiYakeenYearNumber = '';
    // IQAMA
    this.iqamaIdYakeen = '';
    this.iqamaYakeenMonthNumber = '';
    this.iqamaYakeenYearNumber = '';
    // GCC
    this.gccNinIdYakeen = '';
    this.gccNationalityCodeYakeen = '';
    // PASSPORT
    this.passportNoYakeen = '';
    this.nationalityYakeen = '';
    // BORDER
    this.borderNumberYakeen = '';
    this.borderYakeenMonthNumber = '';
    this.borderYakeenYearNumber = '';

    this.yakeenNewBornBabyGender = '';
    this.yakeenNewBornBaby = false;
  }
  closeYakeenSearchModal() {
    this.clearYakeenSearchInputs();
    this.displayYakeenSearchModal = 'none';
    // $('#yakeenServiceModel').modal('hide');
  }

  showYakeenSearch(inputValue: number) {
    this.yakeenNewBornBabyGender = '';
    this.yakeenNewBornBaby = false;
    this.yakeenSearchDisplay = inputValue;
  }

  LoadYakeenNationalities() {
    let inputData = {
      workStationId: 1,
      hospitalId: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,
    };
    this.service
      .loadYakeenNationalities(inputData)
      .subscribe((response: any) => {
        console.log(response);
        if (response.status == 'Success') {
          const nationalities = response.data;
          // Merge arrays based on id
          const mergedArray = nationalities.map((obj1: any) => {
            const obj2 = nationalities.find(
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
    var mobileNo = '';
    this.isGetCalledForYakeenData = 'Yes';

    if (inputVal == 1) {
      type = IYakeenType.SAUDI;
      inputValue1 = this.saudiIdYakeen;
      mobileNo = this.saudimobileNoYakeen;
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
      type = IYakeenType.IQAMA;
      inputValue1 = this.iqamaIdYakeen;
      mobileNo = this.iqamamobileNoYakeen;
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
      type = IYakeenType.GCC;
      inputValue1 = this.gccNinIdYakeen;
      mobileNo = this.gccmobileNoYakeen;
      inputValue2 = this.gccNationalityCodeYakeen;
      if (
        this.gccNinIdYakeen.toString().length <= 0 ||
        this.gccNationalityCodeYakeen.toString().length <= 0
      ) {
        return;
      }
    } else if (inputVal == 4) {
      type = IYakeenType.PASSPORT;
      inputValue1 = this.passportNoYakeen;
      mobileNo = this.passportmobileNoYakeen;
      inputValue2 = this.nationalityYakeen;

      if (
        this.passportNoYakeen.toString().length <= 0 ||
        this.nationalityYakeen.toString().length <= 0
      ) {
        return;
      }
    } else if (inputVal == 5) {
      type = IYakeenType.BORDER;
      inputValue1 = this.borderNumberYakeen;
      mobileNo = this.bordermobileNoYakeen;
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
      type = IYakeenType.UNKNOWN;
      mobileNo = this.unknownmobileNoYakeen;
      this.patientRegForm.patchValue({
        FirstName: 'Unknown',
        Familyname: 'Unknown',
        GrandFatherName: 'Unknown',
        MiddleName: 'Unknown',
        Familyname2L: 'مجهول',
        MiddleName2L: 'مجهول',
        FirstName2L: 'مجهول',
        GrandFatherName2L: 'مجهول',
      });

      this.patientRegForm.patchValue({
        SSN: '0000000000',
      });
      this.patientRegForm.patchValue({
        DOB: '2023-09-01',
      });
      this.bindDataByDOB(new Date('2023-09-01'));
      if (this.yakeenNewBornBabyGender == '1') {
        this.patientRegForm.get('GenderID')?.setValue(1);
        this.patientRegForm.get('Gender')?.setValue('Male');
      } else if (this.yakeenNewBornBabyGender == '2') {
        this.patientRegForm.get('GenderID')?.setValue(2);
        this.patientRegForm.get('Gender')?.setValue('Female');
      } else if (this.yakeenNewBornBabyGender == '3') {
        this.patientRegForm.get('GenderID')?.setValue(4);
        this.patientRegForm.get('Gender')?.setValue('Unknown');
      }

      this.closeYakeenSearchModal();
      return;
    }

    if (inputVal == 488) {
      this.patientRegForm.patchValue({
        socialTypeSelection: 'passport',
      });
      this.patientRegForm.patchValue({
        PassportNo: inputValue1,
      });

      if (this.yakeenNewBornBaby == false)
        this.patientRegForm.get('PassportNo')?.disable();
      else this.patientRegForm.get('PassportNo')?.enable();
    } else {
      this.patientRegForm.patchValue({
        socialTypeSelection: 'nationalID',
      });
      this.patientRegForm.patchValue({
        SSN: inputValue1,
      });

      if (this.yakeenNewBornBaby == false) {
        this.patientRegForm.get('SSN')?.disable();
      } else {
        this.patientRegForm.get('SSN')?.enable();
      }

      if (inputValue1[0] == '1') {
        this.patientRegForm.patchValue({
          NationalityID: 25,
        });
        this.patientRegForm.get('Nationality')?.setValue('SAUDI');
        this.patientRegForm.get('NationalityID')?.disable();
      } else {
        this.patientRegForm.patchValue({
          NationalityID: '',
        });
        this.patientRegForm.get('Nationality')?.setValue('');
        //this.patientRegForm.get('NationalityID')?.enable();
      }
    }
    this.loadPatientDetailsFromYakeen(inputValue1, inputValue2, type, inputVal, mobileNo);
  }

  loadPatientDetailsFromYakeen(inputValue1: string, inputValue2: any, type: any, inputVal: any, mobileNo: any) {

    const searchParam = {
      PatientSearch: inputValue1,
      hospitalId: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID
    };
    this.service.fetchPatientRoot(searchParam).subscribe(
      (response) => {
        if (response.status == 'Success') {
          if (response.data.length > 0 && response.data[0].regcode !== '') {
            $('#yakeenServiceModel').modal('hide');
            $('#validationMsg').modal('show');
            this.fetchPatientDetails(inputValue1, '0', '0');

          } else {
            this.fetchYakeenDetails(inputValue1, inputValue2, type, inputVal, mobileNo);
          }
        } else {
          this.fetchYakeenDetails(inputValue1, inputValue2, type, inputVal, mobileNo);
        }
      },
      (error) => {

      }
    );
  }

  fetchYakeenDetails(
    inputValue1: any,
    inputValue2: any,
    type: any,
    patientTypeInfo: any,
    mobileNo: any
  ) {
    if (!this.patientData?.firstName?.trim().toLowerCase().includes('unknown')) {
      //this.ClearScreen();
    }
    //this.isyakeenSearch = true;
    this.service
      .getPatientDataByYakeenService(
        inputValue1,
        inputValue2,
        type,
        this.form.get('HospitalID')?.value ?? this.service.param.HospitalID
      )
      .subscribe({
        next: (response: any) => {
          if (response.status == 'Success') {
            this.isGetCalledForYakeenData = 'No';
            this.yakeenDetailsVerified = true;
            this.yakeenData = response.data;

            this.closeYakeenSearchModal();

            // If New born baby enable all the disabled fields
            if (this.yakeenNewBornBaby == true) {
              //this.makeAllYakeenControlEnable();
            }

            // Check expiry date if null/empty/expired adding 3 months from current date
            this.nationalIDExpiryDate = this.yakeenData.idExpirationDate || '';
            // if (
            //   this.yakeenData?.idExpirationDate == null ||
            //   this.yakeenData?.idExpirationDate == '' ||
            //   this.yakeenData?.idExpirationDate == '01-Jan-0001' ||
            //   new Date(this.nationalIDExpiryDate) < new Date()
            // ) {
            //   const currentDate = new Date();
            //   this.nationalIDExpiryDate =
            //     this.datepipe.transform(
            //       currentDate.setMonth(currentDate.getMonth() + 3),
            //       'dd-MMM-yyyy'
            //     ) || '';
            // }

            // Name Mapping
            const middleNameYakeen =
              this.yakeenDetailsVerified &&
                this.yakeenData.fatherName &&
                this.yakeenData.fatherName != '-'
                ? this.yakeenData.fatherName
                : '';
            const middleNameYakeen2l =
              this.yakeenDetailsVerified &&
                this.yakeenData.fatherNameT &&
                this.yakeenData.fatherNameT != '-'
                ? this.yakeenData.fatherNameT
                : '';
            const firstNameYakeen =
              this.yakeenDetailsVerified &&
                this.yakeenData.firstName &&
                this.yakeenData.firstName != '-'
                ? this.yakeenData.firstName
                : '';
            const firstNameYakeen2l =
              this.yakeenDetailsVerified &&
                this.yakeenData.firstNameT &&
                this.yakeenData.firstNameT != '-'
                ? this.yakeenData.firstNameT
                : '';
            const grandFatherNameYakeen =
              this.yakeenDetailsVerified &&
                this.yakeenData.grandFatherName &&
                this.yakeenData.grandFatherName != '-'
                ? this.yakeenData.grandFatherName
                : '';
            const grandFatherNameYakeen2l =
              this.yakeenDetailsVerified &&
                this.yakeenData.grandFatherNameT &&
                this.yakeenData.grandFatherNameT != '-'
                ? this.yakeenData.grandFatherNameT
                : '';

            const familyNameYakeen =
              this.yakeenDetailsVerified &&
                this.yakeenData.familyName &&
                this.yakeenData.familyName != '-'
                ? this.yakeenData.familyName
                : '';
            const familyNameYakeen2l =
              this.yakeenDetailsVerified &&
                this.yakeenData.familyNameT &&
                this.yakeenData.familyNameT != '-'
                ? this.yakeenData.familyNameT
                : '';

            // Address mapping
            let fullAddress = '';
            if (this.yakeenData?.addresses?.length) {
              const patientAddress = this.yakeenData?.addresses[0];
              const addressParts = [
                patientAddress.buildingNumber,
                patientAddress.unitNumber,
                patientAddress.street,
                patientAddress.city,
                patientAddress.district,
                patientAddress.postCode,
              ];
              fullAddress = addressParts
                .filter(
                  (part) => part !== undefined && part !== null && part !== ''
                )
                .join(', ');

              fullAddress = `\u202B${fullAddress}\u202C`;
            }
            // Hijri Date from Yakeen
            let hijridateFromYakeen = '';
            if (this.yakeenData.birthDateH) {
              const [year, month, day] =
                this.yakeenData.birthDateH?.split('-') || [];
              hijridateFromYakeen = this.yakeenData.birthDateH
                ? `${day}-${month}-${year}`
                : '';
            } else {
              // hijridateFromYakeen = this.utilityService.hijriDateConvert(
              //   this.yakeenData.birthDateG
              // );
            }
            // return;
            // Enable or Disable the input Field based on the yakeen data
            if (this.yakeenNewBornBaby == false) {
              const dataControlMap: {
                [key in keyof YakeenServiceData]: AbstractControl | null;
              } = {
                familyName: this.patientRegForm.get('Familyname'),
                familyNameT: this.patientRegForm.get('Familyname2L'),
                firstName: this.patientRegForm.get('FirstName'),
                firstNameT: this.patientRegForm.get('FirstName2L'),
                grandFatherName: this.patientRegForm.get('GrandFatherName'),
                grandFatherNameT: this.patientRegForm.get('GrandFatherName2L'),
                fatherName: this.patientRegForm.get('MiddleName'),
                fatherNameT: this.patientRegForm.get('MiddleName2L'),
                idExpirationDate: this.patientRegForm.get(''),
                birthDateG: null, // Not a form control
                sexDescAr: null, // Not a form control
              };

              Object.entries(dataControlMap).forEach(([key, control]) => {
                const data = this.yakeenData?.[key as keyof YakeenServiceData];
                if (typeof data === 'string' || data === undefined) {
                  this.updateFormControl(data, control);
                }
              });
            }

            // Disable/Enable Age, UOM, DOB
            const shouldDisableControls =
              this.yakeenData?.birthDateG != null &&
              this.yakeenData?.birthDateG !== '' &&
              this.yakeenNewBornBaby === false;

            const toggleFormControls = (enable: boolean) => {
              const action = enable ? 'enable' : 'disable';
              this.patientRegForm.get('DOB')?.[action]();
              this.patientRegForm.get('Age')?.[action]();
              this.patientRegForm.get('AgeUOMID')?.[action]();
              this.patientRegForm.get('hijriDOB')?.[action]();
            };
            toggleFormControls(!shouldDisableControls);

            // Uppdate Gender
            let Gender;
            let GenderID;
            if (this.yakeenData?.sexDescAr == 'ذكر') {
              this.patientRegForm.get('GenderID')?.setValue(1);
              this.patientRegForm.get('Gender')?.setValue('Male');
              Gender = 'Male';
              GenderID = 1;
              if (this.yakeenNewBornBaby == false)
                this.patientRegForm.get('GenderID')?.disable();
              else this.patientRegForm.get('GenderID')?.enable();
            } else if (this.yakeenData.sexDescAr == 'أنثى') {
              this.patientRegForm.get('GenderID')?.setValue(2);
              this.patientRegForm.get('Gender')?.setValue('Female');
              Gender = 'Female';
              GenderID = 2;
              if (this.yakeenNewBornBaby == false)
                this.patientRegForm.get('GenderID')?.disable();
              else this.patientRegForm.get('GenderID')?.enable();
            } else {
              // Gender = 'Unknown';
              // GenderID = 4;
              this.patientRegForm.get('GenderID')?.enable();
            }

            if (this.yakeenNewBornBaby == true) {
              if (this.yakeenNewBornBabyGender == '1') {
                this.patientRegForm.get('GenderID')?.setValue(1);
                this.patientRegForm.get('Gender')?.setValue('Male');
              } else if (this.yakeenNewBornBabyGender == '2') {
                this.patientRegForm.get('GenderID')?.setValue(2);
                this.patientRegForm.get('Gender')?.setValue('Female');
              } else if (this.yakeenNewBornBabyGender == '3') {
                this.patientRegForm.get('GenderID')?.setValue(4);
                this.patientRegForm.get('Gender')?.setValue('Unknown');
              }
            }
            let filterNationality;
            if (
              this.yakeenData.nationalityCode != null &&
              this.yakeenData.nationalityCode != ''
            ) {
              if (this.Nationalities?.length) {
                filterNationality = this.Nationalities.find(
                  (x: any) => x.yakeenId == this.yakeenData.nationalityCode
                );

                if (filterNationality) {
                  this.patientRegForm.patchValue({
                    NationalityID: filterNationality.id,
                  });
                  this.patientRegForm
                    .get('Nationality')
                    ?.setValue(filterNationality.name);
                  //   this.lang == 'ar'
                  //     ? filterNationality.name2l
                  //     : filterNationality.name
                  // );

                  if (this.yakeenNewBornBaby == false)
                    this.patientRegForm.get('NationalityID')?.disable();
                }
              }
            }

            let AgeandUOMID;
            if (this.yakeenData.birthDateG) {
              AgeandUOMID = this.getAgeandUOMID(
                this.yakeenData.birthDateG
              );
            }

            this.patientRegForm.patchValue({
              Familyname: familyNameYakeen,
              Familyname2L: familyNameYakeen2l,
              MiddleName: middleNameYakeen,
              MiddleName2L: middleNameYakeen2l,
              FirstName: !this.yakeenNewBornBaby
                ? firstNameYakeen
                : 'Baby Of ' + this.yakeenData.firstNameT,
              FirstName2L: firstNameYakeen2l,
              GrandFatherName: grandFatherNameYakeen,
              GrandFatherName2L: grandFatherNameYakeen2l,
              DOB: moment(this.yakeenData.birthDateG).format('yyyy-MM-DD'),
              patientTypeInfo: patientTypeInfo,
              hijriDOB: hijridateFromYakeen,
              Age: AgeandUOMID?.Age || 0,
              AgeUOMID: AgeandUOMID?.AgeUOMID || 0,
              SSN: inputValue1 ? inputValue1 : '',
              MobileNo: mobileNo
            });

            this.selectedYakeenData = {
              Familyname: familyNameYakeen,
              Familyname2L: familyNameYakeen2l,
              MiddleName: middleNameYakeen,
              MiddleName2L: middleNameYakeen2l,
              FirstName: !this.yakeenNewBornBaby
                ? firstNameYakeen
                : 'Baby Of ' + this.yakeenData.firstNameT,
              FirstName2L: firstNameYakeen2l,
              GrandFatherName: grandFatherNameYakeen,
              GrandFatherName2L: grandFatherNameYakeen2l,
              DOB: moment(this.yakeenData.birthDateG).format('yyyy-MM-DD'),
              NationalityID: filterNationality.id,
              Nationality: filterNationality?.name,
              // this.lang == 'ar'
              //   ? filterNationality?.name2l
              //   : filterNationality?.name,
              hijriDOB: hijridateFromYakeen,
              Gender: Gender ? Gender : '',
              GenderID: GenderID ? GenderID : '',
              Age: AgeandUOMID?.Age || 0,
              AgeUOMID: AgeandUOMID?.AgeUOMID || 0,
              Address01: fullAddress,
            };

            if (this.patientRegForm.get('GenderID')?.value === 1) {
              this.patientRegForm.patchValue({
                TitleID: 1
              });
            }
            else if (this.patientRegForm.get('GenderID')?.value === 2) {
              this.patientRegForm.patchValue({
                TitleID: 2
              });
            }
            this.onSubmit('save');

          } else if (response.status == 'Fail') {
            if (inputValue1 !== '') {
              this.closeYakeenSearchModal();
              $("#registerPatientModal").modal('show');
              //this.loadPatientDetailsFromYakeen(inputValue1);
            }
          }
        },
        complete: () => console.log('Completes with Success!'),
        error: (err) => {
          this.closeYakeenSearchModal();
        },
      });
  }


  onSubmit(type: string) {
    // if (!this.workStationId$ || this.workStationId$ <= 0) {
    //   this.msgService.alert('Please select the facility', 'info');
    //   return;
    // }


    // if (this.patientRegForm.get('patientTypeInfo')?.value == 0) {
    //   this.msgService.alert('Please select patient Type Id!', 'info');
    //   return;
    // }

    // if (this.patientRegForm.get('IsEmployee')?.value == true) {
    //   if (
    //     this.patientRegForm.get('PatientEmpId')?.value.toString().trim() ==
    //       '' ||
    //     this.patientRegForm.get('PatientEmpId')?.value.toString().trim() == '0'
    //   ) {
    //     this.msgService.alert(
    //       'Please update the Employee Details for the patient to proceed!',
    //       'info'
    //     );
    //     return;
    //   }
    // }

    if (type === 'register') {
      this.isFormSubmitted = true;

    }

    const titleID = this.patientRegForm.get('TitleID')?.value;
    const genderID = this.patientRegForm.get('GenderID')?.value;
    // if (
    //   (titleID != 1 && titleID != 17 && titleID != 18 && genderID == 1) ||
    //   (titleID == 1 && genderID == 2)
    // ) {
    //   this.msgService.alert(
    //     'Gender is mismatching with Title. Please select valid Title for the Patient!',
    //     'info'
    //   );
    //   return;
    // }

    //this.isFormSubmitted = true;
    if (
      this.patientRegForm.valid) {
      // if (this.patientRegForm.valid && !this.isMobileNumberSame) {
      // if (this.myPhoto && this.profilePhotoUploaded) {
      //   var filext = this.myPhoto.split('/')[1].split(';')[0];
      //   var guid = Guid.create();
      //   this.myPhotoGuid =
      //     this.patientRegForm.get('SSN')?.value + '_' + guid + '.' + filext;
      // } else {
      //   this.myPhotoGuid = this.patientData ? this.patientData.photoPath : '';
      // }
      // if (this.nationalIdPhoto && this.natioanalIdUploaded) {
      //   var filext = this.nationalIdPhoto.split('/')[1].split(';')[0];
      //   var guid = Guid.create();
      //   this.myNationalIdPhotoGuid =
      //     'Iqama_' +
      //     this.patientRegForm.get('SSN')?.value +
      //     '_' +
      //     guid +
      //     '.' +
      //     filext;
      // } else {
      //   this.myNationalIdPhotoGuid = this.patientData
      //     ? this.patientData.strPath
      //     : '';
      // }

      const patientTypeID = this.checkPatientTypeId(
        Number(this.patientRegForm.get('patientTypeInfo')?.value)
      );

      // View Modification
      if (type === 'update') {
        if (this.patientRegForm.get('IsEmployee')?.value == false) {
          this.patientRegForm.patchValue({
            PatientEmpId: '',
            employeeName: '',
          });
        }
        this.changeLog = [];
        const excludedKeys = [
          'TitleID',
          'NationalityID',
          'MaritalStatusID',
          'ReligionID',
          'ContRelationID',
          'CityID',
          'country',
          'CityAreaID',
          'eligibilityPurpose',
          'discoveryCompany',
          'PatientEmpId',
          'patientTypeInfo',
          'GaurdianGenderId',
          'GenderID',
          'OccupationID',
        ];
        Object.entries(this.patientRegForm.value).forEach(
          ([key, updatedValue]) => {
            if (
              !excludedKeys.includes(key) &&
              this.initialValue[key] !== updatedValue
            ) {
              let initialValue = this.initialValue[key];
              //this.roleText

              if (key == 'employeeName') {
                updatedValue =
                  this.patientRegForm.get('IsEmployee')?.value == true
                    ? this.patientRegForm.get('employeeName')?.value.toString()
                    : '';
              }

              if (key == 'Area') {
                updatedValue =
                  this.patientRegForm.get('CityAreaID')?.value != '0'
                    ? this.patientRegForm.get('Area')?.value.toString()
                    : '';

                initialValue = this.patientData?.cityArea;
              }

              if (key == 'City') {
                initialValue = this.patientData.cityName;
              }

              //  if((key === 'Isvip' || key == 'IsEmployee') && countVariableLog ==0)
              //  {
              //countVariableLog =1;
              if (
                key === 'Isvip' &&
                this.patientRegForm.get('Isvip')?.value == true &&
                this.patientData.isvip == false
              ) {
                updatedValue = 'VIP';
                //initialValue = (this.patientData.patientEmpId == null || this.patientData.patientEmpId.trim() == '' || this.patientData.patientEmpId.trim() == '0') ? ''  : 'Employee';
                initialValue = '';
              }
              if (
                key === 'Isvip' &&
                this.patientRegForm.get('Isvip')?.value == false &&
                this.patientData.isvip == true
              ) {
                // updatedValue = this.patientRegForm.get('IsEmployee')?.value == true ?'Employee':'';
                updatedValue = '';
                initialValue = 'VIP';
              }
              if (
                key == 'IsEmployee' &&
                this.patientRegForm.get('IsEmployee')?.value == true &&
                (this.patientData.patientEmpId == null ||
                  this.patientData.patientEmpId.trim() == '' ||
                  this.patientData.patientEmpId.trim() == '0')
              ) {
                updatedValue = 'Employee';
                // initialValue = this.patientData.isvip == true ? 'VIP' : '';
                initialValue = '';
              }
              if (
                key == 'IsEmployee' &&
                this.patientRegForm.get('IsEmployee')?.value == false &&
                this.patientData.patientEmpId != null &&
                this.patientData.patientEmpId.trim() != '' &&
                this.patientData.patientEmpId.trim() != '0'
              ) {
                updatedValue = '';
                //initialValue = this.patientData.isvip == true ? 'VIP' : '';
                initialValue = 'Employee';
              }

              this.changeLog.push({
                appln: 'Patient Registration',
                dbc: key,
                upv: String(updatedValue),
                prv: String(initialValue),
                uid: 1,
                wid: 1,
                hName: this.form.get('HospitalID')?.value === '2' ? 'SUWAIDI' : 'NUZHA',
              });
            }
          }
        );
      }

      let postData = {
        patientID: 0,
        regCode: '',
        titleID: this.patientRegForm.get('TitleID')?.value,
        firstName: this.patientRegForm.get('FirstName')?.value,
        firstName2L: this.patientRegForm.get('FirstName2L')?.value,
        middleName: this.patientRegForm.get('MiddleName')?.value,
        middleName2L: this.patientRegForm.get('MiddleName2L')?.value,
        grandFatherName: this.patientRegForm.get('GrandFatherName')?.value,
        grandFatherName2L: this.patientRegForm.get('GrandFatherName2L')?.value,
        familyname: this.patientRegForm.get('Familyname')?.value,
        familyname2l: this.patientRegForm.get('Familyname2L')?.value,
        lastName: '',
        lastName2L: '',
        maidenName: '',
        maidenName2L: '',
        spouseName: '',
        spouseName2L: '',
        gaurdianName: '',
        guardianName2L: '',
        aliasName: '',
        aliasName2L: '',
        securityTag: 0,
        dob: moment(this.patientRegForm.get('DOB')?.value).format('DD-MMM-YYYY'),
        age: parseInt(this.patientRegForm.get('Age')?.value) || 0,
        ageUOMID: this.patientRegForm.get('AgeUOMID')?.value || 0,
        isAgeByDOB: true,
        address01: "...",
        address02: '',
        address03: '',
        cityID: 6,
        isForeigner: true,
        nationalityId: this.patientRegForm.get('NationalityID')?.value ?? '',
        passportNo: this.patientRegForm.get('PassportNo')?.value ?? '',
        passIssueDate: moment('2023-11-01T14:41:05.088Z').format('DD-MMM-YYYY'),
        passExpiryDate: moment('2023-11-01T14:41:05.088Z').format('DD-MMM-YYYY'),
        passIssuePlace: '',
        occupationID: 16,
        religionID: 2,
        qualificationID: 0,
        maritalStatusID: 2,
        refTypeID: 0,
        refInstID: 0,
        refDoctorID: 0,
        refOther: '',
        hasPrintedCard: true,
        cardIssuedDate: moment('2025-11-01T14:41:05.088Z').format('DD-MMM-YYYY'),
        remarkFree: '',
        remarks: '',
        zipCode: '',
        mobileNo: this.patientRegForm.get('MobileNo')?.value,
        eMail: this.patientRegForm.get('EMail')?.value,
        bloodID: 0,
        hospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,
        genderID: this.patientRegForm.get('GenderID')?.value,
        isGaurdianSpouse: 0,
        gaurdianGenderId: 1,
        gaurdianGenderName: 'Male',
        contactName: "AAA",
        contRelationId: 27,
        contAddress: '',
        contPhoneNo: '0570946827',
        contFaxNo: '',
        contEmail: '',
        ssn: this.patientRegForm.get('SSN')?.value,
        code: '',
        identifyMark01: '',
        identifyMark02: '',
        companyID: 0,
        patientType: IPatientType.OP,
        userid: 1,
        workstationid: 1,
        foodAllergies: '',
        otherAllergies: '',
        drugAllergies: '',
        prePatient: 0,
        pAddress01: '',
        pAddress02: '',
        pAddress03: '',
        pCityID: 6,
        pZipCode: '',
        dietTypeID: 0,
        pPhoneNo: '',
        visaIssueDate: '',
        visaExpiryDate: '',
        visaIssuedAt: '',
        visaIssuedBy: '',
        workPermitID: '',
        wpIssuedDate: '',
        wpExpiryDate: '',
        wpIssuedAT: '',
        cityAreaID: this.patientRegForm.get('CityAreaID')?.value | 0,
        monthlyIncome: 0,
        pCityAreaID: 0,
        policyNo: '',
        policyValidFrom: '',
        policyValidTo: '',
        contractNo: '',
        mrNo: '',
        referalBasisNo: '',
        relationCode: '',
        patientEmpId:
          this.patientRegForm.get('IsEmployee')?.value == true
            ? this.patientRegForm.get('PatientEmpId')?.value.toString()
            : '',
        gradeID: 0,
        address012L: '',
        address022L: '',
        address032L: '',
        contactName2L: '',
        contAddress2L: '',
        identifyMark012L: '',
        identifyMark022L: '',
        pAddress012L: '',
        pAddress022L: '',
        pAddress032L: '',
        visaIssuedAt2L: '',
        visaIssuedBy2L: '',
        wpIssuedAT2L: '',
        employeeRelationID: 0,
        intDoctorID: 0,
        photoPath: '',
        insuranceCardExpiry: '',
        scheduleID: 0,
        placeOfBirth: '',
        isvip: this.patientRegForm.value.Isvip ? true : false,
        scanDocumentPath: '',
        isServicePatient: false,
        specialiseID: 0,
        doNotDisturb: true,
        identityProofID: 0,
        identityProofNo: '',
        formIssued: '',
        parentPatientid: 0,
        isNewBorn: true,
        //strPath: "",
        isYakeenVerified: true,
        lastYakeenVerified: '',
        regPatienttype: 0,
        EMail: this.patientRegForm.get('Email')?.value || '',
        PhoneNo: this.patientRegForm.get('PhoneNo')?.value || '',
        Blocked: false,
        status: 0,
        patientIdType: patientTypeID || 0,
        insurances: this.companyListData,
        NationalIDExpiryDate: this.nationalIDExpiryDate,
        auditHistory: this.changeLog,
        isPriority: false,
        isHighRisk: false,
        isWheelChairPatient: false,
      };

      this.service
        .savePatientData(postData, this.isFetchPatientdata)
        .subscribe(
          (response) => {
            if (response.status == 'Success') {
              $('#yakeenServiceModel').modal('hide');
              $('#registerPatientModal').modal('hide');
              this.fetchPatientDetails(this.patientRegForm.get('SSN')?.value, '0', '0');

            } else if (response.status == 'Fail') {
            } else {
            }
          },
          (err) => {
          }
        );
    } else {
    }
  }

  fetchPatientDetailsFromHIS(ssn: string, patientId: string, mobileno: string, response: any) {
    this.service.fetchPatientDataC = {
      ...this.service.fetchPatientDataC,
      SSN: ssn,
      PatientID: patientId,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: Object.keys(this.facilitySessionId).length > 0 ? this.facilitySessionId : this.service.param.WorkStationID,
      HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,
    }
    this.url = this.service.fetchPatientDataBySsn(doctorappointments.fetchPatientDataBySsn);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientDependCLists.length > 0) {
          this.showDoctorSlots = true;
          this.isMobileSearch = false;
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

  bindDataByDOB(inputData: Date) {
    var today = new Date();
    if (inputData.getTime() <= today.getTime()) {
      let dob = inputData.toDateString();
      this.updateAgeandAgeUomID(dob);
    } else {
      //this.openErrorPopup();
      this.errorMsg = 'Date of birth cannot be future dates';
      $('#errorMsg').modal('show');
    }
  }
  updateAgeandAgeUomID(dob: any) {
    this.patientRegForm.patchValue({
      hijriDOB: "",//this.utilityService.hijriDateConvert(dob),
      Age: this.getAgeandUOMID(dob).Age,
      AgeUOMID: this.getAgeandUOMID(dob).AgeUOMID,
    });
  }

  hijriDateConvert(date: any) {
    const selectedDate = moment(date);
    let selectedYear = selectedDate.year();
    let selectedMonth = selectedDate.month() + 1; // months are 0-indexed
    let selectedDay = selectedDate.date();
    const hijriObj: any = "";//HijriConverter.toHijri(selectedYear, selectedMonth, selectedDay);
    return (
      `${!Number.isNaN(hijriObj.hd) ? hijriObj.hd : selectedDay}-${hijriObj.hm
      }-${hijriObj.hy}` || ''
    );
  }

  convertNumberToWords(amount: number): string {
    return "";//this.toWords.convert(amount);
  }

  updateFormControl(data: string | undefined, control: AbstractControl | null) {
    const trimmedData = data?.trim();
    trimmedData && trimmedData !== '-' ? control?.disable() : control?.enable();
  }

  getAgeandUOMID(dob: any) {
    const pastDateObj = new Date(dob);
    const currentDate = new Date();
    let yearsDiff = currentDate.getFullYear() - pastDateObj.getFullYear();
    let monthsDiff = currentDate.getMonth() - pastDateObj.getMonth();
    let daysDiff = currentDate.getDate() - pastDateObj.getDate();
    if (daysDiff < 0) {
      monthsDiff--; // Decrement the months difference
      const lastMonthDays = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
      ).getDate();
      daysDiff += lastMonthDays; // Add the number of days in the last month
    }
    let years = yearsDiff;
    let months = monthsDiff;
    if (months < 0) {
      years--;
      months += 12;
    }
    let ageUOMIdValue;
    let ageValue;
    if (years === 0 && months === 0) {
      ageUOMIdValue = 3;
      ageValue = daysDiff;
    } else if (years === 0 && months >= 1) {
      ageUOMIdValue = 2;
      ageValue = months;
    } else {
      ageUOMIdValue = 1;
      ageValue = years;
    }
    return {
      Age: ageValue,
      AgeUOMID: ageUOMIdValue,
    };
  }

  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  checkPatientTypeId(yakeenSelectedId: any) {
    let PatientTypeId: number = 0;
    switch (yakeenSelectedId) {
      case 1:
        PatientTypeId = IPatientIDType.NationalId;
        break;
      case 2:
        PatientTypeId = IPatientIDType.IqamaNumber;
        break;
      case 3:
        PatientTypeId = IPatientIDType.NationalId;
        break;
      case 4:
        PatientTypeId = IPatientIDType.PassportNumber;
        break;
      case 5:
        PatientTypeId = IPatientIDType.BorderNumber;
        break;
      default:
        PatientTypeId = 0;
        break;
    }
    return PatientTypeId;
  }

  loadCancelReasons() {
    this.url = this.service.getData(doctorappointments.FetchCancelReasons, { HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID });
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
    this.url = this.service.getData(doctorappointments.FetchActionTaken, { HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID });
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
    if (this.listOfTimeSlots.filter((e: any) => e.ISAVAILABLE == 1).length > 0) {
      this.errorMessages.push("Cannot book waiting list appointment as there are ( " + this.listOfTimeSlots.filter((e: any) => e.ISAVAILABLE == 1).length + " )  slots available for doctor.");
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
      "HospitalId": this.form.get('HospitalID')?.value ?? this.service.param.HospitalID,
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
      DoctorID: this.selectedDoctor.EmpID,
      Date: moment(this.waitinglistdate).format('DD-MMM-YYYY'),
      WorkStationID: Object.keys(this.facilitySessionId).length > 0 ? this.facilitySessionId : this.service.param.WorkStationID,
      HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID
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

  ngAfterViewInit(): void {
    if (sessionStorage.getItem("dischargefollowups")) {
      this.dischargefollowups = JSON.parse(sessionStorage.getItem("dischargefollowups") ?? '{}');
      if (!this.fromFutureAppointments) {
        this.IsDischargeFollowups = true;
      }
      this.fetchPatientDetails(this.dischargefollowups.SSN, "0", "0");
      $("#txtSsn").val(this.dischargefollowups.SSN);
      this.form.patchValue({
        Specialisation: this.dischargefollowups.Specialisation,
        HospitalID: this.dischargefollowups.HospitalID,
        SpecialiseID: this.dischargefollowups.SpecialiseID
      });

      this.fetchSpecializationDoctor({
        "SpecialiseID": this.dischargefollowups.SpecialiseID,
        "Specialisation": this.dischargefollowups.Specialisation ?? this.dischargefollowups.DoctorSpecialty
      });
    }
  }

  ngOnDestroy(): void {
    //sessionStorage.removeItem("dischargefollowups");
  }

  navigateBackToDischargeFollowups() {
    if (this.fromFutureAppointments) {
      sessionStorage.removeItem("fromFutureAppointments");
      this.router.navigate(['/frontoffice/futureappointmentworklist']);
    }
    else {
      this.router.navigate(['/ot/discharge-followups']);
      sessionStorage.removeItem("dischargefollowups");
    }
  }
  FetchCountryWiseHolidays() {
    this.url = this.service.getData(doctorappointments.FetchCountryWiseHolidays, { HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.holidaysList = this.processHolidays(response.FetchCountryWiseHolidaysDataList);

          const festivalClassMap = new Map<string, string>();

          let classIndex = 0;
          this.holidaysList = this.holidaysList.map((holiday) => {
            if (!festivalClassMap.has(holiday.description)) {
              festivalClassMap.set(holiday.description, this.cssClasses[classIndex % this.cssClasses.length]);
              classIndex++; 
            }
            
            return {
              ...holiday,
              cssClass: festivalClassMap.get(holiday.description)
            };
          });
        }
      },
        (err) => {
        })
  }
  public processHolidays(holidays: HolidayInput[]): HolidayOutput[] {
    return holidays.flatMap(holiday =>
      this.getDatesBetween(holiday.FromDate, holiday.ToDate, holiday.Description)
    );
  }
  private getDatesBetween(fromDate: string, toDate: string, description: string): HolidayOutput[] {
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const dateList: HolidayOutput[] = [];
    while (startDate <= endDate) {
      const day = startDate.getDate().toString().padStart(2, '0');
      const month = this.monthMap[startDate.getMonth()];
      const year = startDate.getFullYear();
      const fullDate = `${day}-${month}-${year}`;

      dateList.push({ fullDate: fullDate, description: description });
      startDate.setDate(startDate.getDate() + 1);
    }

    return dateList;
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

  openAppointmentsWorklist() {
    if (this.selectedPatientSSN) {
      this.showAppointmentsModal = true;
      $('#appointments_modal').modal('show');
    }
  }

  viewMoreLastVisits() {
    $('#viewMoreModal').modal('show');
    this.filteredDoctor = null;
    $('#textbox_doctor').val('');
    const fromdate = moment(this.viewMoreForm.get('fromDate').value).format('DD-MMM-YYYY');
    const todate = moment(this.viewMoreForm.get('toDate').value).format('DD-MMM-YYYY');
    var PatientId= this.patientDetails.PatientID;
    var WorkStationID= Object.keys(this.facilitySessionId).length > 0 ? this.facilitySessionId : this.service.param.WorkStationID;
    this.url = this.service.getData(doctorappointments.FetchPatientVisitsWithAppointments, { FromDate: fromdate, ToDate: todate, PatientID: PatientId,WorkStationID: WorkStationID, HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientVisitsWithAppointmentsDataList.length > 0) {
          this.viewMoreList = this.viewMoreFullList = response.FetchPatientVisitsWithAppointmentsDataList;
        }
      },
        (err) => {
        });
  }

  onViewMoreItemSelect(item: any) {
    $('#viewMoreModal').modal('hide');
    this.loadVisitInfo(item);
  }

  getCurrentDayVisits() {
    $('#visitsModal').modal('show');
    const fromdate = moment(new Date()).format('DD-MMM-YYYY');
    const todate = moment(new Date()).format('DD-MMM-YYYY');
    var PatientId= this.patientDetails.PatientID;
    var WorkStationID= Object.keys(this.facilitySessionId).length > 0 ? this.facilitySessionId : this.service.param.WorkStationID;
    this.url = this.service.getData(doctorappointments.FetchPatientVisitsWithAppointments, { FromDate: fromdate, ToDate: todate, PatientID: PatientId,WorkStationID: WorkStationID, HospitalID: this.form.get('HospitalID')?.value ?? this.service.param.HospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientVisitsWithAppointmentsDataList.length > 0) {
          this.visitsList = response.FetchPatientVisitsWithAppointmentsDataList;
        }
      },
        (err) => {
        });
  }

  onSearchDoctorsAll(event: any) {
    this.filteredDoctorsList = [];
    if (event.target.value.length >= 3) {
        this.wardConfig.FetchSSEmployees("FetchSSEmployees", event.target.value.trim(), this.doctorDetails[0].UserId, 3403, this.hospitalID)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.filteredDoctorsList = response.FetchSSEmployeesDataList;
                }
            },
                () => {

                })
    }
  }

  onDoctorSelection(item: any) {
    this.filteredDoctor = item;
    this.filteredDoctorsList = [];
    this.viewMoreList = this.viewMoreFullList.filter((element: any) => element.DoctorID === item.ID);
  }
}

export const doctorappointments = {
  fetchGSpecialisation: 'FetchGSpecialisation?Type=${Type}&DisplayName=${DisplayName}',
  fetchGSpecialisationN: 'DepartmentListNN?HospitalID=${HospitalID}',
  fetchHospitalLocations: 'FetchHospitalLocations?type=0&filter=blocked=0&UserId=0&WorkstationId=0',
  FetchHospitalUserRoleDetails: 'FetchHospitalUserRoleDetailsRole?FeatureID=${FeatureID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchSpecializationDoctor: 'FetchSpecializationDoctor?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchSpecializationDoctorTimings: 'FetchSpecializationDoctorTimings?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  saveResourceAvailbility: 'SaveResourceAvailbility',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  AppointmentListNL: 'AppointmentListNL',
  getAvailableDates: 'GetAvailableDatesC',
  fetchDoctorsWiseNextAvailableBWdates: 'FetchDoctorsWiseNextAvailableBWdates?FromDate=${FromDate}&ToDate=${ToDate}&DoctorID=${DoctorID}&HospitalID=${HospitalID}',
  FetchPatientVisitsWithAppointments: 'FetchPatientVisitsWithAppointments?FromDate=${FromDate}&ToDate=${ToDate}&PatientID=${PatientID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
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
  FetchPatientdetailsAgainstMobileNo: 'FetchPatientdetailsAgainstMobileNo?MobileNo=${MobileNo}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchCountryWiseHolidays: 'FetchCountryWiseHolidays?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
};

export enum IYakeenType {
  SAUDI = 'SAUDI',
  IQAMA = 'IQAMA',
  GCC = 'GCC',
  PASSPORT = 'PASSPORT',
  BORDER = 'BORDER',
  UNKNOWN = 'UNKNOWN',
}
export const MONTHLIST = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export const enum IPatientIDType {
  None = 0,
  Displaced = 1,
  NationalId = 2,
  CitizenId = 3,
  HealthId = 4,
  PassportNumber = 5,
  VisaNumber = 6,
  BorderNumber = 7,
  IqamaNumber = 8,
}
export enum IPatientType {
  OP = 1,
  IP = 2,
  TRIAGE = '3',
  BOTH = 0,
}
interface HolidayInput {
  Country: string;
  Description: string;
  FromDate: string;
  ToDate: string;
}

interface HolidayOutput {
  fullDate: string;
  description: string;
  cssClass?: string
}