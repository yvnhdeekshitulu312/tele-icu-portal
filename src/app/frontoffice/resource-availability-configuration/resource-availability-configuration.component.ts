import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { ResourceAvailabilityConfigurationService } from './resource-availability-configuration.service';
import { resourceDetails } from './urls';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import { MatDatepicker } from '@angular/material/datepicker';
declare var $: any;
@Component({
  selector: 'app-resource-availability-configuration',
  templateUrl: './resource-availability-configuration.component.html',
  styleUrls: ['./resource-availability-configuration.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe,
  ]
})
export class ResourceAvailabilityConfigurationComponent extends BaseComponent implements OnInit {
  selectedDate: Date | null = null;
  url = '';
  listOfSpecialisation: any = [];
  listOfSpecialisation1: any = [];
  locationList: any = [];
  StatusList: any = [];
  form: any;
  doctorList: any = [];
  filterDoctor: any = [];
  facilityId: any;
  selectAll = false;
  datesForm: any;
  timesForm: any;
  IsConsultation = false;
  allDaysSelected = false;
  activeDays = [false, false, false, false, false, false, false];
  dayNames = ['S', 'S', 'M', 'T', 'W', 'T', 'F'];
  dayNamesToolTip = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  timeOptions = [30,25, 20, 15, 10, 5];
  selectedTime = 10;
  selectedFollowupTime = 10;
  ConfigID = "0";
  AppointmentCount = 0;
  TotalWaitingSlots = 0;
  StatusID = '';
  FetchResourceAvailableConfigurationDataList: any = [];
  FetchResourceAvailableConfigurationSavedDataL: any = [];
  modify = false;
  searchQuery = '';
  errorMessages: any = [];
  modifyDoctorID = 0;
  SelectedConfigForEdit: any;
  ValidationMsg : any;
  listOfItems: any;
  listOfItems1: any;
  doctorSearch = false;
  @ViewChild('picker') picker!: MatDatepicker<Date>;
  holidaysList: HolidayOutput[] = [];
  hoveredDate: Date | null = null;
  currentMonth: any;
  currentYear: any;
  monthMap: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  lastHoveredDate: string | null = null;
  lang: any;
  direction: string = '';

  constructor(private service: ResourceAvailabilityConfigurationService,
    private us: UtilityService, private formbuilder: FormBuilder, public datepipe: DatePipe, private renderer: Renderer2, private el: ElementRef) {
    super();
    this.lang = sessionStorage.getItem("lang");
    if (this.lang == 'ar') {
      this.direction = 'rtl';
    }
    this.datesForm = this.formbuilder.group({
      FromDate: new Date(),
      ToDate: new Date(),
    });

    this.timesForm = this.formbuilder.group({
      FromTime: [],
      ToTime: [],
      WaitingListCount: []
    });
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
      HospitalName2l: [''],
      SpecialiseID: [''],
      Specialisation: [''],
      Specialisation2l: [''],
      StatusID: [],
      StatusName: [''],
      SearchQuery: [''],
      DoctorID: [''],
      DoctorName: [''],
      ChangeRequestID: [],
    
    });
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

  public processHolidays(holidays: HolidayInput[]): HolidayOutput[] {
    return holidays.flatMap(holiday =>
      this.getDatesBetween(holiday.FromDate, holiday.ToDate, holiday.Description)
    );
  }

  toggleAllDays() {
    this.allDaysSelected = !this.allDaysSelected;
    this.activeDays = this.allDaysSelected ? [true, true, true, true, true, true, true] : [false, false, false, false, false, false, false];
  }

  toggleDay(index: number) {
    this.activeDays[index] = !this.activeDays[index];
    this.allDaysSelected = this.activeDays.every(day => day);
  }

  ngOnInit(): void {
    this.timesForm = this.formbuilder.group({
      dateTimes: this.formbuilder.array([]),
    });

    this.addRow();
    this.fetchHospitalLocations();
    this.fetchAppointmentStatus();
    this.fetchSpecialisations();
    this.fetchInitialDoctors();
    this.FetchCountryWiseHolidays();
  }

  selectTime(time: number) {
    this.selectedTime = time;
  }

  selectFollowupTime(time: number) {
    this.selectedFollowupTime = time;
  }

  newConsultaion() {
    if (this.form.get("StatusID").value == '-1') {
      this.ValidationMsg = this.langData?.common?.SelectStatus;
      $("#ValidationMsg").modal('show');
      return;
    }
    this.IsConsultation = true;

    setTimeout(() => {
      this.initializePicker();
    }, 100);
  }

  cancelConsultation() {
    this.IsConsultation = false;
    this.modify = false;
    this.dateTimes.clear();
    this.datesForm = this.formbuilder.group({
      FromDate: new Date(),
      ToDate: new Date(),
    });
    this.addRow();
  }

  selectedHospital(item: any) {
    this.form.patchValue({
      HospitalID: item.HospitalID,
      HospitalName: item.Name,
      HospitalName2l: item.Name2l
    });
  }
  selectedStatus(item: any) {
    this.form.patchValue({
      StatusID: item.ID,
      StatusName: item.Name,
    });

    this.fetchResourceAvailableConfiguration();
  }

  getStatusVal() {

  }
    Requestchange(event: any) {
    this.form.patchValue({
      ChangeRequestID: event.target.value,      
    });   
  }

  get dateTimes() {
    return this.timesForm.get('dateTimes') as FormArray;
  }

  createDateTimeGroup() {
    const currentDateTime = new Date();
    const newtime = new Date(currentDateTime.getTime() + 60000);
    const currentTime = newtime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return this.formbuilder.group({
      FromTime: '',
      ToTime: ''
    });
  }

  fetchInitialDoctors() {
    this.url = this.service.getData(resourceDetails.FetchReferalDoctors, { Tbl: 11, Name: '%%%' });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfItems = this.listOfItems1 = response.ReferalDoctorDataList;
          }
        },
          (err) => {
          })
  }

  searchDoctor(event: any) {
    const item = event.target.value;
    this.listOfItems = this.listOfItems1;
    let arr = this.listOfItems1.filter((spec: any) => spec.DoctorName.toLowerCase().indexOf(item.toLowerCase()) === 0);
    this.listOfItems = arr.length ? arr : [];

    if (arr.length === 0) {
      this.fetchDoctorSearch(event);
    }
  }

  fetchSpecialisationsold() {
    this.url = this.service.getData(resourceDetails.fetchGSpecialisation, { Type: 2, DisplayName: '%%%' });
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
    this.url = this.service.getData(resourceDetails.fetchGSpecialisationN, { HospitalID: this.hospitalID,});
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

  selectSpecialisationItem(item: any) {
    this.FetchResourceAvailableConfigurationDataList = [];
    this.FetchResourceAvailableConfigurationSavedDataL = [];
    this.selectAll = false;
    //this.listOfSpecialisation = [];
    this.form.patchValue({
      SpecialiseID: item.SpecialiseID,
      Specialisation: item.Specialisation,
      Specialisation2l: item.Specialisation2l
    });
    this.fetchSpecializationDoctor(item);
    this.searchSpecItem({
      target: {
        value: ''
      }
    });
  }

  fetchHospitalLocations() {
    this.url = this.service.getData(resourceDetails.fetchHospitalLocations, {});
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
  fetchAppointmentStatus() {
    this.url = this.service.getData(resourceDetails.FetchAppointmentStatus, {
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      HospitalID: this.hospitalID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.StatusList = response.FetchAppointmentStatusDataList;
          this.StatusList.forEach((element: any) => {
            if (element.Name === '<ALL>') {
              element.Name = 'All';
            } 
            element.Name = this.langData.ResourceAvailabilityConfiguration[element.Name.split(' ').join('')];
          });
          this.selectedStatus(this.StatusList[0]);
        }
      },
        (err) => {
        })
  }

  fetchResourceAvailableConfiguration() {
    this.FetchResourceAvailableConfigurationDataList = [];
    this.FetchResourceAvailableConfigurationSavedDataL = [];
    var doc = this.doctorList?.filter((d: any) => d.selected).map((d: any) => d.EmpID).join(',');
    if (doc.length > 0) {
      this.url = this.service.getData(resourceDetails.fetchResourceAvailableConfigurationN,
        {
          DoctorID: doc, SpecialisationID: this.form.get('SpecialiseID').value
          , Specialisation: this.form.get('Specialisation').value, Status: this.form.get('StatusID').value,
          UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
          HospitalID: this.form.get('HospitalID')?.value,
          WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID
        });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.FetchResourceAvailableConfigurationDataList = response.FetchResourceAvailableConfigurationDataList;
            $("#waitingListCount").val(this.FetchResourceAvailableConfigurationDataList[0]?.TotalWaitingSlots);
            this.FetchResourceAvailableConfigurationSavedDataL = response.FetchResourceAvailableConfigurationSavedDataL;

            this.FetchResourceAvailableConfigurationSavedDataL.forEach((element: any, index: any) => {
              if (element.StatusID == 0)
                element.Class = "inAvailable_bg d-flex align-items-center gap-1 p-2 activity_row";
              else if (element.StatusID == 15)
                element.Class = "inor_bg d-flex align-items-center gap-1 p-2 activity_row";
              else if (element.StatusID == 16)
                element.Class = "inVacation_bg d-flex align-items-center gap-1 p-2 activity_row";
              else if(element.StatusID == 13)
                element.Class = "changeduty_bg d-flex align-items-center gap-1 p-2 activity_row"; 
              else if(element.StatusID == 14)
                element.Class = "oniprounds_bg d-flex align-items-center gap-1 p-2 activity_row";   
               else if (element.StatusID == 18)
                element.Class = "inPersonal_bg d-flex align-items-center gap-1 p-2 activity_row";
               else if (element.StatusID == 19)
                element.Class = "VirtualAppointment_bg d-flex align-items-center gap-1 p-2 activity_row";

            });

            this.FetchResourceAvailableConfigurationSavedDataL.forEach((item: any) => {
              const dynamicValue: string = item.WeekDayval;
              const indicesToSet: number[] = dynamicValue.split(',').map(Number);

              const activeDays: any[] = [ 
                {id: '7', value: false}, 
                {id: '1', value: false},
                {id: '2', value: false},
                {id: '3', value: false},
                {id: '4', value: false},
                {id: '5', value: false},
                {id: '6', value: false}
              ];

              indicesToSet.forEach(index => {
                const findElement = activeDays.find((a: any) => a.id === index.toString());
                if (findElement) {
                  findElement.value = true;
                }
              });

              item.activeDays = activeDays.map((a: any) => a.value);
            });
          }
        },
          (err) => {
          })
    }
  }

  fetchSpecializationDoctor(item: any) {
    this.url = this.service.getData(resourceDetails.fetchSpecializationDoctor, { SpecializationID: item.SpecialiseID,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      HospitalID: this.form.get('HospitalID')?.value,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID
     });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if(item.Specialisation === undefined)
          this.form.get('Specialisation').setValue(item.DoctorSpecialisation);  
        else
          this.form.get('Specialisation').setValue(item.Specialisation);
          this.doctorList = response.FetchSpecializationDoctorDataList;
          
          var docid = this.form.get('DoctorID')?.value;

          this.doctorList.forEach((i: any) => {
            if (i.EmpID === docid) {
              i.selected = true;
              i.Specialization = item.DoctorSpecialisation;
              this.fetchResourceAvailableConfiguration();
            }
            else {
              i.Specialization = item.Specialisation;
              i.selected = false;
            }
          });

          this.filterDoctor = this.doctorList;
        }
      },
        (err) => {
        })
  }

  selectAllDoctor() {
    this.selectAll = !this.selectAll;
    this.doctorList.forEach((i: any) => {
      i.selected = this.selectAll;
    });
    this.fetchResourceAvailableConfiguration();
  }

  onDoctorEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.fetchDoctors(event);
    }
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

  addRow() {
    this.errorMessages = [];
    const dateTimesArray = this.dateTimes.controls;
    if (dateTimesArray.length > 0) {
      const fromTimeControl = (dateTimesArray[dateTimesArray.length - 1] as FormGroup).get('FromTime');
      const toTimeControl = (dateTimesArray[dateTimesArray.length - 1] as FormGroup).get('ToTime');
      
      if (!fromTimeControl?.value) {
        this.errorMessages.push('From time is mandatory');
      }

      if (!toTimeControl?.value) {
        this.errorMessages.push('To time is mandatory');
      }

      if (this.errorMessages.length > 0) {
        $('#errorMsg').modal('show');
        return;
      }
    }

    this.dateTimes.push(this.createDateTimeGroup());
  }
  DeleteRow(index: any) {
    this.dateTimes.controls.splice(index, 1);
    this.timesForm.value.dateTimes.splice(index, 1);
  }

  multiDoctorSpecialisations: any = [];
  save() {

    this.errorMessages = [];
    const dateTimesArray = this.dateTimes.controls;

    const fromTimeControl = (dateTimesArray[dateTimesArray.length - 1] as FormGroup).get('FromTime');
    const toTimeControl = (dateTimesArray[dateTimesArray.length - 1] as FormGroup).get('ToTime');

    if (!fromTimeControl?.value && this.form.get("StatusID").value != '16') {
      this.errorMessages.push('From time is mandatory');
    }

    if (!toTimeControl?.value && this.form.get("StatusID").value != '16') {
      this.errorMessages.push('To time is mandatory');
    }

    if (this.errorMessages.length > 0) {
      $('#errorMsg').modal('show');
      return;
    }

    var selectedDoctors = this.doctorList?.filter((d: any) => d.selected);
    if (selectedDoctors.length === 1) {
      const doc = selectedDoctors[0]?.EmpID;
      const url = this.us.getApiUrl(resourceDetails.FetchDoctorSpecializationNN, {
        DoctorID: doc,
        UserID: this.doctorDetails[0]?.UserId,
        WorkstationID: this.service.param.WorkStationID,
        HospitalID: this.form.get('HospitalID')?.value
      });

      this.us.get(url).subscribe((response: any) => {
        if (response.Code === 200) {
          if (response.FetchDoctorSpecializationNNDataList.length === 1) {
            this.continueToSave();
          } else {
            this.multiDoctorSpecialisations = response.FetchDoctorSpecializationNNDataList.filter((element: any) => 
              element.SpecialiseID !== this.form.get('SpecialiseID').value 
            );
            $('#multiSpecializationSaveModal').modal('show');
          }
        }
      });
    } else {
      this.continueToSave();
    }
  }

  continueToSave(MultiSpec: any = '0') {
    var ConfigurationXML: any = [];
    var doc = this.doctorList?.filter((d: any) => d.selected).map((d: any) => d.EmpID).join(',');
    this.timesForm.value.dateTimes.forEach((element: any, index: any) => {
      ConfigurationXML.push({
        "SEQ": index + 1,
        //"WD": this.form.get("StatusID").value != '16' ? this.getSelectedIndices() : "1,2,3,4,5,7",
        // "FDT": this.form.get("StatusID").value != '16' ? element.FromTime : '09:00 AM',
        // "TDT": this.form.get("StatusID").value != '16' ? element.ToTime : '09:00 AM',
        "WD": this.form.get("StatusID").value != '16' ? this.getSelectedIndices() : this.getSelectedIndices(),
        "FDT": this.form.get("StatusID").value != '16' ? element.FromTime : element.FromTime ,
        "TDT": this.form.get("StatusID").value != '16' ? element.ToTime : element.ToTime ,
        "STA": this.form.get("StatusID").value ?? "0",
        "CDRB": this.form.get("ChangeRequestID").value ?? "0",
      })
    });


    var payload = {
      "ConfigID": this.ConfigID,
      "DOCTORID": doc,
      "SpecialiseID": this.form.get('SpecialiseID').value,
      "FROMDATE": this.datepipe.transform(this.datesForm.value['FromDate'], "dd-MMM-yyyy")?.toString(),
      "TODATE": this.datepipe.transform(this.datesForm.value['ToDate'], "dd-MMM-yyyy")?.toString(),
      "Consultation": this.selectedTime,
      "Followup": this.selectedFollowupTime,
      "WeekDay": 1,
      "facilityid": this.facilityId,
      "USERID": this.doctorDetails[0]?.UserId,
      "WORKSTATIONID": this.service.param.WorkStationID,
      "HospitalID": this.form.get('HospitalID')?.value,
      "status": this.form.get("StatusID").value ?? "0",
      "ConfigurationXML": ConfigurationXML,
      "TotalWaitingSlots": $("#waitingListCount").val()==""?"0":$("#waitingListCount").val(),
      MultiSpec
    }

    this.us.post(resourceDetails.SaveResourceAvailbilityPFNSPEC, payload)
      .subscribe((response: any) => {
        if (response.Code == 604) {
          this.ValidationMsg = response.Message;
          $("#ValidationMsg").modal('show');
          return;
        }
        if (response.Code == 200) {
          if(response.ValidateMessage!=""){
             this.ValidationMsg = response.ValidateMessage +"<br/>"+response.Message;
              $("#saveMsgValidation").modal('show');
          }             
          else{
             this.ValidationMsg = "";
            $("#saveMsg").modal('show');
          }
             
          this.modify = false;
          this.IsConsultation = false;
          this.clearresource();
          this.fetchResourceAvailableConfiguration();
        }
      },
        (err) => {

        })
  }

  modifyresource() {

    if (this.AppointmentCount > 0 && this.StatusID == '0') {      
      this.ValidationMsg = "Appointments are Available for Selected Date Slots";
      $("#ValidationMsg").modal('show');
      return;
    }
    var doc = this.doctorList?.filter((d: any) => d.selected).map((d: any) => d.EmpID).join(',');
    var ConfigurationXML: any = [];

    this.timesForm.value.dateTimes.forEach((element: any, index: any) => {
      ConfigurationXML.push({
        "SEQ": index + 1,
        "WD": this.getSelectedIndices(),
        "FDT": element.FromTime,
        "TDT": element.ToTime,
        "STA": this.StatusID//this.form.get("StatusID").value ?? "0"
      })
    });


    var payload = {
      "ConfigID": this.ConfigID,
      "DOCTORID": this.modifyDoctorID,
      "SpecialiseID": this.form.get('SpecialiseID').value,
      "FROMDATE": this.datepipe.transform(this.datesForm.value['FromDate'], "dd-MMM-yyyy")?.toString(),
      "TODATE": this.datepipe.transform(this.datesForm.value['ToDate'], "dd-MMM-yyyy")?.toString(),
      "Consultation": this.selectedTime,
      "Followup": this.selectedFollowupTime,
      "WeekDay": 1,
      "facilityid": this.facilityId,
      "USERID": this.doctorDetails[0]?.UserId,
      "WORKSTATIONID": this.service.param.WorkStationID,
      "HospitalID": this.form.get('HospitalID')?.value,
      "status": this.StatusID,//this.form.get("StatusID").value ?? "0",
      "OldStatus": this.StatusID,//this.form.get("StatusID").value ?? "0",
      "OldConfigID": this.ConfigID,
      "ConfigurationXML": ConfigurationXML,
      "OldItemsXML": [],
      "TotalWaitingSlots": $("#waitingListCount").val()==""?"0":$("#waitingListCount").val()
    }

    this.us.post(resourceDetails.modifyResourceAvailbilityPFN, payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          $("#saveMsg").modal('show');
          this.modify = false;
          this.IsConsultation = false;
          this.fetchResourceAvailableConfiguration();
        }
      },
        (err) => {

        })
  }

  modifyTotalWaitingListCount() {

   

    var payload = {
      "ConfigID": this.ConfigID,     
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.service.param.WorkStationID,
      "Hospitalid": this.form.get('HospitalID')?.value,     
      "TotalWaitingSlots": $("#waitingListCount").val()==""?"0":$("#waitingListCount").val()
    }

    this.us.post(resourceDetails.UpdateTotalWaitingSlots, payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          $("#saveMsg").modal('show');
          this.modify = false;
          this.IsConsultation = false;
          this.fetchResourceAvailableConfiguration();
        }
      },
        (err) => {

        })
  }

  getSelectedIndices(): string {
    const indices: number[] = this.activeDays.reduce<number[]>((acc, isActive, index) => {
      if (isActive) {
        switch (index) {
          case 0:
            acc.push(7);
            break;
          case 1:
            acc.push(1);
            break;
          case 2:
            acc.push(2);
            break;
          case 3:
            acc.push(3);
            break;
          case 4:
            acc.push(4);
            break;
          case 5:
            acc.push(5);
            break;
          case 6:
            acc.push(6);
            break;
          default:            
            break;
        }
        //acc.push(index + 1);
      }
      return acc;
    }, []);

    return indices.join(',');
  }

  clear() {
    this.AppointmentCount = 0;
    this.allDaysSelected = false;
    this.activeDays = [false, false, false, false, false, false, false];
    this.selectedTime = 10;
    this.selectedFollowupTime = 10;
    this.dateTimes.clear();
    this.datesForm = this.formbuilder.group({
      FromDate: new Date(),
      ToDate: new Date(),
    });
    this.addRow();
    this.form.patchValue({
      StatusID: '-1',
      StatusName: 'All',
    });
  }

  doctorSelected() {
    var doc = this.doctorList?.filter((d: any) => d.selected).map((d: any) => d.EmpID).join(',');

    if (this.modify) {
      return false;
    }

    if (doc.length > 0) {
      return true;
    }

    return false;
  }

  selectDoctor(item: any) {
    $("#txtDoctor").val('');
    item.selected = !item.selected;
    this.modify = false;
    this.IsConsultation = false;
    this.fetchResourceAvailableConfiguration();
  }

  configSelect(config: any) {
    this.modify = true;
    this.IsConsultation = true;
    this.SelectedConfigForEdit = config;
    this.ConfigID = config.ConfigId;
    this.StatusID = config.StatusID;
    this.modifyDoctorID = config.DoctorID;
    this.AppointmentCount = config.AppointmentCount;
    this.TotalWaitingSlots = config.TotalWaitingSlots;
    $("#waitingListCount").val(config.TotalWaitingSlots);
    this.datesForm.patchValue({
      FromDate: new Date(config.FromDate),
      ToDate: new Date(config.ToDate)
    });

    this.dateTimes.clear();
    const fromDate = new Date(`2000-01-01 ${config.FromTime}`);
    const toDate = new Date(`2000-01-01 ${config.ToTime}`);

    const formattedFromTime = fromDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const formattedToTime = toDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    this.dateTimes.push(this.formbuilder.group({
      FromTime: formattedFromTime,
      ToTime: formattedToTime
    }));

    const filteredData = this.FetchResourceAvailableConfigurationSavedDataL.filter((item: any) => item.ConfigId === config.ConfigId && item.SlNo !== config.SlNo);

    if (filteredData.length > 0) {
      filteredData.forEach((item: any) => {
        const fromDate = new Date(`2000-01-01 ${item.FromTime}`);
        const toDate = new Date(`2000-01-01 ${item.ToTime}`);

        const formattedFromTime = fromDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        const formattedToTime = toDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });

        this.dateTimes.push(this.formbuilder.group({
          FromTime: formattedFromTime,
          ToTime: formattedToTime
        }));
      });
    }

    const dynamicValue: string = config.WeekDayval;
    const indicesToSet: number[] = dynamicValue.split(',').map(Number);

    // const activeDays: boolean[] = [false, false, false, false, false, false, false];

    // indicesToSet.forEach(index => {
    //   if (index >= 0 && index <= activeDays.length) {
    //     activeDays[index - 1] = true;
    //   }
    // });


    const activeDays: any[] = [ 
      {id: '7', value: false}, 
      {id: '1', value: false},
      {id: '2', value: false},
      {id: '3', value: false},
      {id: '4', value: false},
      {id: '5', value: false},
      {id: '6', value: false}
    ];

    indicesToSet.forEach(index => {
      const findElement = activeDays.find((a: any) => a.id === index.toString());
      if (findElement) {
        findElement.value = true;
      }
    });

    this.activeDays = activeDays.map((a: any) => a.value);

    //this.activeDays = activeDays;
    this.selectedTime = config.Slot1Duration;
    this.selectedFollowupTime = config.Slot2Duration;
  }

  deleteConfig: any;

  delete(config: any) {
    //if (this.AppointmentCount > 0 && this.StatusID == '0') {
    if (this.AppointmentCount > 0) {
      this.ValidationMsg = "Appointments are Available for Selected Date Slots";
      $("#ValidationMsg").modal('show');
      return;
    }
    this.deleteConfig = config;
    const url = this.us.getApiUrl(resourceDetails.FetchDoctorSpecializationNN, {
      DoctorID: config.DoctorID,
      UserID: this.doctorDetails[0]?.UserId,
      WorkstationID: this.service.param.WorkStationID,
      HospitalID: this.form.get('HospitalID')?.value
    });

    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        if (response.FetchDoctorSpecializationNNDataList.length === 1) {
          this.continueToDelete();
        } else {
          this.continueToDelete();
        }
        // else {
        //   this.multiDoctorSpecialisations = response.FetchDoctorSpecializationNNDataList.filter((element: any) =>
        //     element.SpecialiseID !== this.form.get('SpecialiseID').value
        //   );
        //   $('#multiSpecializationDeleteModal').modal('show');
        // }
      }
    });
  }

  continueToDelete(MultiSpec: any = '0') {
    var payload = {
      "ConfigID": this.deleteConfig.ConfigId,
      "DOCTORID": this.deleteConfig.DoctorID,
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.service.param.WorkStationID,
      "Hospitalid": this.form.get('HospitalID')?.value,
      MultiSpec
    }

    this.us.post(resourceDetails.deleteResourceAvailbility, payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          $("#saveMsg").modal('show');
          this.modify = false;
          this.IsConsultation = false;
          this.fetchResourceAvailableConfiguration();
        }
      },
        (err) => {

        })
  }

  fetchSavedConfig(config: any) {
    return this.FetchResourceAvailableConfigurationSavedDataL
      .filter((c: any) => c.DoctorID == config.DoctorID)
      .sort((a: any, b: any) => new Date(a.FromDate).getTime() - new Date(b.FromDate).getTime());
  }

  initializePicker(): void {
    if (this.picker) {
      this.picker.dateClass = (date: Date) => {
        var dates = this.isDateInRange(date);
        if (dates.length > 0) {
          return {
            'selected-range-red': true,
          };
        }
        return {
          'selected-range-red': false,
        };
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
    if(calendarControls) {
      calendarControls.style.setProperty('--holiday-description-display', 'none');
    }
  }

  private isDateInRange(date: Date): any {
    const parsedDate = new Date(date);
    this.currentMonth = this.monthMap[parsedDate.getMonth()];  ;
    this.currentYear = parsedDate.getFullYear();
  
    return this.holidaysList.filter((d: any) => 
      d.fullDate === this.datepipe.transform(date, "dd-MMM-yyyy")?.toString()
    );
  }
  

  filterConfigs(con: any) {
    return this.FetchResourceAvailableConfigurationSavedDataL.filter((c: any) => c.ConfigId == con.ConfigId);
  }

  clearresource() {
    this.form.patchValue({
      SpecialiseID: [''],
      Specialisation: [''],
      DoctorID: [''],
      DoctorName: [''],
      SearchQuery: ['']
    });
    this.doctorList = [];
    this.filterDoctor = [];
    this.IsConsultation = false;
    this.FetchResourceAvailableConfigurationDataList = [];
    this.FetchResourceAvailableConfigurationSavedDataL = [];
    this.SelectedConfigForEdit = [];
    this.clear();
  }

  validateTime(index: number) {
    this.errorMessages = [];
    const dateTimesArray = this.dateTimes.controls;

    const fromTimeControl = (dateTimesArray[index] as FormGroup).get('FromTime');
    const toTimeControl = (dateTimesArray[index] as FormGroup).get('ToTime');

    if (fromTimeControl && toTimeControl) {
      const currentDateTime = new Date();
      const selectedFromTime = new Date(this.datepipe.transform(this.datesForm.value['FromDate'], "dd-MMM-yyyy")?.toString() + ' ' + fromTimeControl.value);
      const selectedToTime = new Date(this.datepipe.transform(this.datesForm.value['FromDate'], "dd-MMM-yyyy")?.toString() + ' ' + toTimeControl.value);

      if (fromTimeControl.value && selectedFromTime < currentDateTime) {
        this.errorMessages.push('From time Should be greater than today time');
      }

      if (toTimeControl.value && selectedToTime < currentDateTime) {
        this.errorMessages.push('To time Should be greater than today time');
      }

      if(!this.modify || (this.modify && this.StatusID !== '15')) {
        if (toTimeControl.value && selectedFromTime >= selectedToTime) {
          this.errorMessages.push('To time should be greater than From time');
        }
      }

      if (this.isTimeBetweenExistingPairs(index, selectedFromTime, selectedToTime)) {
        this.errorMessages.push('Selected time is already between existing time pairs');
      }

      if (this.errorMessages.length > 0) {

        fromTimeControl.setValue('');
        toTimeControl.setValue('');

        $('#errorMsg').modal('show');
      }
    }
  }
  

  isTimeBetweenExistingPairs(index: number, selectedFromTime: Date, selectedToTime: Date): boolean {
    const dateTimesArray = this.dateTimes.controls;

    if (dateTimesArray) {
      for (let i = 0; i < dateTimesArray.length; i++) {
        if (i !== index) {
          const existingFromTime = (dateTimesArray[i] as FormGroup).get('FromTime');
          const existingToTime = (dateTimesArray[i] as FormGroup).get('ToTime');

          const existingFromDateTime = new Date(this.datepipe.transform(this.datesForm.value['FromDate'], "dd-MMM-yyyy")?.toString() + ' ' + existingFromTime?.value);
          const existingToDateTime = new Date(this.datepipe.transform(this.datesForm.value['FromDate'], "dd-MMM-yyyy")?.toString() + ' ' + existingToTime?.value);

          if (selectedFromTime >= existingFromDateTime && selectedFromTime <= existingToDateTime) {
            return true;
          }

          if (selectedToTime >= existingFromDateTime && selectedToTime <= existingToDateTime) {
            return true;
          }
        }
      }
    }


    return false;
  }

  fetchDoctorSearch(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.url = this.service.getData(resourceDetails.FetchReferalDoctors, { Tbl: 11, Name: filter });
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
      DoctorName: item.DoctorName,
      SpecialiseID: item.DoctorSpecialisationID,
      Specialisation: item.DoctorSpecialisation
    });
    item.SpecialiseID = item.DoctorSpecialisationID;
    this.fetchSpecializationDoctor(item);
  }

  onWaitingListCountChange() {
    this.errorMessages = [];
    var cnt = $("#waitingListCount").val();
    if(Number(cnt) == 0 || Number(cnt) >= 10) {
      this.errorMessages = [];
      this.errorMessages.push('Waiting List Count should be between 1 and 10');
    }
    
    if (this.errorMessages.length > 0) {
      $("#waitingListCount").val('');
      $('#errorMsg').modal('show');
    }
  }

  getHolidayName(date: string): string {
    const holiday = this.holidaysList.find(
      (holiday) =>
        holiday.fullDate === date
    );
    return holiday ? holiday.description : 'No holiday';
  }

  FetchCountryWiseHolidays() {
    this.url = this.service.getData(resourceDetails.FetchCountryWiseHolidays, { HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
           this.holidaysList = this.processHolidays(response.FetchCountryWiseHolidaysDataList);
          }
        },
          (err) => {
          })
  }

  deleteMeetingsBtnClick() {
    $('#deleteMeetingsModal').modal('show');
  }

  deleteMeetings() {
    $('#deleteMeetingsModal').modal('hide');
    var payload = {
      "ConfigID": this.FetchResourceAvailableConfigurationSavedDataL.filter((element: any) => element.StatusID === '14').map((element: any) => element.ConfigId).join(),
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.service.param.WorkStationID,
      "Hospitalid": this.form.get('HospitalID')?.value
    }
    this.us.post(resourceDetails.DeleteResourceAvailbilityAll, payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          $("#saveMsg").modal('show');
          this.fetchResourceAvailableConfiguration();
        }
      },
        (err) => {

        })
  }

  showDeleteMeetingsBtn() {
    return this.FetchResourceAvailableConfigurationSavedDataL.find((element: any) => element.StatusID === '14') ? true : false
  }
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
}