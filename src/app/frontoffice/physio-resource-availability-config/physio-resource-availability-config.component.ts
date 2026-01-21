import { Component, OnInit } from '@angular/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { PhysioResourceAvailabilityConfigService } from './physio-resource-availability-config.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
declare var $: any;

@Component({
  selector: 'app-physio-resource-availability-config',
  templateUrl: './physio-resource-availability-config.component.html',
  styleUrls: ['./physio-resource-availability-config.component.scss'],
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
export class PhysioResourceAvailabilityConfigComponent extends BaseComponent implements OnInit {
  url = '';
  listOfSpecialisation: any = [];
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
  dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  timeOptions = [60, 45, 30, 25, 20, 15, 10, 5];
  selectedTime = 10;
  selectedFollowupTime = 10;
  ConfigID = "0";
  AppointmentCount = 0;
  StatusID = '';
  FetchResourceAvailableConfigurationDataList: any = [];
  FetchResourceAvailableConfigurationSavedDataL: any = [];
  modify = false;
  searchQuery = '';
  errorMessages: any = [];
  modifyDoctorID = 0;
  SelectedConfigForEdit: any;
  ValidationMsg = "";
  listOfItems: any;
  doctorSearch = false;
  services: any;
  resourceTypes: any;
  resourceNames: any;

  constructor(private service: PhysioResourceAvailabilityConfigService,
    private us: UtilityService, private formbuilder: FormBuilder, public datepipe: DatePipe) {
    super()
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
      HospitalID: this.hospitalID,
      HospitalName: [''],
      Service: ['0'],
      ResourceType: ['0'],
      ResourceTypeName: ['0'],
      ResourceName: ['0'],
      SpecialiseID: [''],
      Specialisation: [''],
      StatusID: [],
      StatusName: [''],
      SearchQuery: [''],
      DoctorID: [''],
      DoctorName: ['']
    });
  }

  toggleAllDays() {
    this.allDaysSelected = !this.allDaysSelected;
    this.activeDays = this.allDaysSelected ? [true, true, true, true, true, false, true] : [false, false, false, false, false, false, false];
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
    this.fetchServices();
    this.fetchResourceTypes();
    //this.fetchDomainResources();
    this.fetchAppointmentStatus();
    //this.fetchPhysiotherapySpecialisationSearch('PHYSIOTHERAPY')
  }

  selectTime(time: number) {
    this.selectedTime = time;
  }

  selectFollowupTime(time: number) {
    this.selectedFollowupTime = time;
  }

  newConsultaion() {
    if (this.form.get("StatusID").value == '-1') {
      this.ValidationMsg = "Select Status";
      $("#ValidationMsg").modal('show');
      return;
    }
    this.IsConsultation = true;
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
    });
    this.clearresource();
  }
  selectedStatus(item: any) {
    this.form.patchValue({
      StatusID: item.ID,
      StatusName: item.Name,
    });

    this.fetchResourceAvailableConfiguration();
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

  fetchServices() {
    const url = this.service.getData(physioresourceDetails.fetchServices, { 
      UserID : this.doctorDetails[0].UserId,
      WorkStationID : this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.form.get('HospitalID')?.value
     });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.services = response.FetchPhysioServicesDataList;
          }
        },
          (err) => {
          })
  }
  fetchResourceTypes() {
    const url = this.service.getData(physioresourceDetails.fetchResourceTypes, { 
      UserID : this.doctorDetails[0].UserId,
      WorkStationID : this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.form.get('HospitalID')?.value
     });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.resourceTypes = response.FetchResourceTypeScheduleDataList;
          }
        },
          (err) => {
          })
  }

  fetchDomainResources() {
    const url = this.service.getData(physioresourceDetails.FetchResourceTypeNameScheduleH, { 
      DomainID: this.form.get('ResourceType').value,
      UserID : this.doctorDetails[0].UserId,
      WorkStationID : this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.form.get('HospitalID')?.value
     });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            if(this.form.get('ResourceType').value === '12'||this.form.get('ResourceType').value === '98') {
              this.resourceNames = response.FetchResourceTypeNameRadScheduleDataList;
              this.doctorList = response.FetchResourceTypeNameRadScheduleDataList;
            }
            else {
              this.resourceNames = response.FetchResourceTypeNameScheduleDataList;
              this.doctorList = response.FetchResourceTypeNameScheduleDataList;
            }
            
          }
        },
          (err) => {
          })
  }

  onResourceTypeChanged(event:any) {
    this.form.patchValue({
      //"ResourceName" : event.target.value,
      "ResourceTypeName" : event.target.options[event.target.options.selectedIndex].text
    })
    this.fetchDomainResources();
  }  
  onServiceChanged(event:any) {
    this.form.patchValue({    
      ResourceType: ['0'],
      ResourceTypeName: ['0'],
      ResourceName: ['0']
    })    

    this.doctorList = [];
    this.filterDoctor = [];
    this.IsConsultation = false;
    this.FetchResourceAvailableConfigurationDataList = [];
    this.FetchResourceAvailableConfigurationSavedDataL = [];
    this.SelectedConfigForEdit = [];
    this.resourceNames = [];    
    this.clear();
  }

  fetchSpecialisationSearch(event: any) {
    if (event.target.value.length >= 3) {
      this.url = this.service.getData(physioresourceDetails.fetchGSpecialisation, { Type: 2, DisplayName: event.target.value });
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

  fetchPhysiotherapySpecialisationSearch(spec: string) {

    this.url = this.service.getData(physioresourceDetails.fetchGSpecialisation, { Type: 2, DisplayName: spec });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfSpecialisation = response.FetchGSpecialisationDataList[0];
          this.selectSpecialisationItem(response.FetchGSpecialisationDataList[0])
        }
      },
        (err) => {
        })

  }

  selectSpecialisationItem(item: any) {
    this.FetchResourceAvailableConfigurationDataList = [];
    this.FetchResourceAvailableConfigurationSavedDataL = [];
    this.listOfSpecialisation = [];
    this.form.patchValue({
      SpecialiseID: item.SpecialiseID,
      Specialisation: item.Specialisation
    });
    this.fetchSpecializationDoctor(item);
  }

  fetchHospitalLocations() {
    this.url = this.service.getData(physioresourceDetails.fetchHospitalLocations, {});
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
    this.url = this.service.getData(physioresourceDetails.FetchAppointmentStatus, {});
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.StatusList = response.FetchAppointmentStatusDataList;
          this.selectedStatus(response.FetchAppointmentStatusDataList[0]);
        }
      },
        (err) => {
        })
  }

  fetchResourceAvailableConfiguration() {
    this.FetchResourceAvailableConfigurationDataList = [];
    this.FetchResourceAvailableConfigurationSavedDataL = [];
    var doc = this.doctorList?.filter((d: any) => d.selected).map((d: any) => d.ServiceItemID).join(',');
    var DocID = this.doctorList?.filter((d: any) => d.selected).map((d: any) => d.DoctorID).join(',');
    if (doc.length > 0) {
      //this.url = this.service.getData(physioresourceDetails.fetchResourceAvailableConfiguration,
      this.url = this.service.getData(physioresourceDetails.fetchResourceAvailableConfigurationPhys,
        {
          // DoctorID: doc, SpecialisationID: this.form.get('SpecialiseID').value,
          // Specialisation: this.form.get('Specialisation').value, 
          // Status: this.form.get('StatusID').value
          DoctorID: doc,
          SpecialisationID: this.form.get('ResourceType').value,
          Specialisation: this.form.get('ResourceTypeName').value, 
          DomainID: this.form.get('ResourceType').value, 
          Status: this.form.get('StatusID').value
        });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.FetchResourceAvailableConfigurationDataList = response.FetchResourceAvailableConfigurationDataList;
            $("#waitingListCount").val(5);
            this.FetchResourceAvailableConfigurationSavedDataL = response.FetchResourceAvailableConfigurationSavedDataL;

            this.FetchResourceAvailableConfigurationSavedDataL.forEach((element: any, index: any) => {
              if (element.StatusID == 0)
                element.Class = "inAvailable_bg d-flex align-items-center gap-3 p-2 activity_row";
              else if (element.StatusID == 15)
                element.Class = "inor_bg d-flex align-items-center gap-3 p-2 activity_row";
              else if (element.StatusID == 16)
                element.Class = "inVacation_bg d-flex align-items-center gap-3 p-2 activity_row";
              else if (element.StatusID == 13)
                element.Class = "changeduty_bg d-flex align-items-center gap-3 p-2 activity_row";
              else if (element.StatusID == 14)
                element.Class = "oniprounds_bg d-flex align-items-center gap-3 p-2 activity_row";
            });

            this.FetchResourceAvailableConfigurationSavedDataL.forEach((item: any) => {
              const dynamicValue: string = item.WeekDayval;
              const indicesToSet: number[] = dynamicValue.split(',').map(Number);

              const activeDays: boolean[] = [false, false, false, false, false, false, false];

              indicesToSet.forEach(index => {
                if (index >= 0 && index <= activeDays.length) {
                  activeDays[index - 1] = true;
                }
              });

              item.activeDays = activeDays;
            });
          }
        },
          (err) => {
          })
    }
  }

  fetchSpecializationDoctor(item: any) {
    this.url = this.service.getData(physioresourceDetails.fetchSpecializationDoctor, { SpecializationID: item.SpecialiseID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (item.Specialisation === undefined)
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

    var doc = this.doctorList?.filter((d: any) => d.selected).map((d: any) => d.ServiceItemID).join(',');
    var DocID = this.doctorList?.filter((d: any) => d.selected).map((d: any) => d.DoctorID).join(',');
    var SpecID = this.doctorList?.filter((d: any) => d.selected).map((d: any) => d.SpecialiseID).join(',');


    var ConfigurationXML: any = [];

    this.timesForm.value.dateTimes.forEach((element: any, index: any) => {
      ConfigurationXML.push({
        "SEQ": index + 1,
        "WD": (this.form.get("StatusID").value != '16'||this.form.get('ResourceType').value=='54')? this.getSelectedIndices() : "1,2,3,4,5,7",
        "FDT": (this.form.get("StatusID").value != '16'||this.form.get('ResourceType').value=='54') ? element.FromTime : '09:00 AM',
        "TDT": (this.form.get("StatusID").value != '16'||this.form.get('ResourceType').value=='54') ? element.ToTime : '09:00 AM',
        "STA": this.form.get("StatusID").value ?? "0"
      })
    });


    var payload = {
      "ConfigID": this.ConfigID,
      "DOCTORID": DocID != '' ? DocID : doc,
      "SpecialiseID":SpecID != '' ? SpecID : this.form.get('ResourceType').value,
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
      "TotalWaitingSlots": $("#waitingListCount").val() == "" ? "0" : $("#waitingListCount").val(),
      "ServiceItemID": doc,
      "ServiceID": this.form.get('Service').value,
      "DomainID": this.form.get('ResourceType').value,
    }

    this.us.post(physioresourceDetails.SaveResourceAvailbilityPhy, payload)
      .subscribe((response: any) => {
        if (response.Code == 604) {
          this.ValidationMsg = response.Message;
          $("#ValidationMsg").modal('show');
          return;
        }
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
        // "SEQ": index + 1,
        // "WD": this.getSelectedIndices(),
        // "FDT": element.FromTime,
        // "TDT": element.ToTime,
        // "STA": this.StatusID//this.form.get("StatusID").value ?? "0"
        "SEQ": index + 1,
        "WD": this.form.get("StatusID").value != '16' ? this.getSelectedIndices() : "1,2,3,4,5,7",
        "FDT": this.form.get("StatusID").value != '16' ? element.FromTime : '09:00 AM',
        "TDT": this.form.get("StatusID").value != '16' ? element.ToTime : '09:00 AM',
        "STA": this.form.get("StatusID").value ?? "0"

      })
    });


    var payload = {
      "ConfigID": this.ConfigID,
      "DOCTORID": this.modifyDoctorID,
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
      "TotalWaitingSlots": $("#waitingListCount").val() == "" ? "0" : $("#waitingListCount").val(),
      "ServiceItemID": this.modifyDoctorID,
      "ServiceID": this.form.get('Service').value,
      "DomainID": this.form.get('ResourceType').value,
    }

    this.us.post(physioresourceDetails.modifyResourceAvailbility, payload)
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
        acc.push(index + 1);
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
  }

  doctorSelected() {
    var doc = this.doctorList?.filter((d: any) => d.selected).map((d: any) => d.ServiceItemID).join(',');

    if (this.modify) {
      return false;
    }

    if (doc.length > 0) {
      return true;
    }

    return false;
  }

  selectDoctor(item: any) {
    item.selected = !item.selected;
    this.modify = false;
    this.IsConsultation = false;
    this.filterDoctor = this.doctorList;
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

    const activeDays: boolean[] = [false, false, false, false, false, false, false];

    indicesToSet.forEach(index => {
      if (index >= 0 && index <= activeDays.length) {
        activeDays[index - 1] = true;
      }
    });

    this.activeDays = activeDays;
    this.selectedTime = config.Slot1Duration;
    this.selectedFollowupTime = config.Slot2Duration;
  }


  delete(config: any) {
    if (this.AppointmentCount > 0 && this.StatusID == '0') {
      this.ValidationMsg = "Appointments are Available for Selected Date Slots";
      $("#ValidationMsg").modal('show');
      return;
    }

    var doc = this.doctorList?.filter((d: any) => d.selected).map((d: any) => d.EmpID).join(',');

    var payload = {
      "ConfigID": config.ConfigId,
      "DOCTORID": config.DoctorID,
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.service.param.WorkStationID,
      "Hospitalid": this.form.get('HospitalID')?.value,
    }

    this.us.post(physioresourceDetails.deleteResourceAvailbility, payload)
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
    return this.FetchResourceAvailableConfigurationSavedDataL.filter((c: any) => c.DoctorID == config.DoctorID);
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
      SearchQuery: [''],
      Service: ['0'],
      ResourceType: ['0'],
      ResourceTypeName: ['0'],
      ResourceName: ['0'],
    });
    this.doctorList = [];
    this.filterDoctor = [];
    this.IsConsultation = false;
    this.FetchResourceAvailableConfigurationDataList = [];
    this.FetchResourceAvailableConfigurationSavedDataL = [];
    this.SelectedConfigForEdit = [];
    this.resourceNames = [];
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

      if (toTimeControl.value && selectedFromTime >= selectedToTime) {
        this.errorMessages.push('To time should be greater than From time');
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
      this.url = this.service.getData(physioresourceDetails.FetchReferalDoctors, { Tbl: 11, Name: filter });
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
    var cnt = $("#waitingListCount").val();
    if (Number(cnt) == 0 || Number(cnt) >= 10) {
      this.errorMessages = [];
      this.errorMessages.push('Waiting List Count should be between 1 and 10');
    }

    if (this.errorMessages.length > 0) {
      $("#waitingListCount").val('');
      $('#errorMsg').modal('show');
    }
  }

}

export const physioresourceDetails = {
  fetchGSpecialisation: 'FetchGSpecialisation?Type=${Type}&DisplayName=${DisplayName}',
  fetchServices: 'FetchPhysioServices?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchResourceTypes:'FetchResourceTypeSchedule?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchResourceTypeNameSchedule:'FetchResourceTypeNameSchedule?DomainID=${DomainID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchResourceTypeNameScheduleH:'FetchResourceTypeNameScheduleH?DomainID=${DomainID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchHospitalLocations: 'FetchHospitalLocations?type=0&filter=blocked=0&UserId=0&WorkstationId=0',
  fetchSpecializationDoctor: 'FetchSpecializationDoctor?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  saveResourceAvailbility: 'SaveResourceAvailbility',
  FetchAppointmentStatus: 'FetchAppointmentStatus?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchResourceAvailableConfiguration: 'FetchResourceAvailableConfiguration?DoctorID=${DoctorID}&SpecialisationID=${SpecialisationID}&Specialisation=${Specialisation}&Status=${Status}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  modifyResourceAvailbility: 'ModifyResourceAvailbilityRad',
  deleteResourceAvailbility: 'DeleteResourceAvailbility',
  FetchReferalDoctors: 'FetchReferalDoctors?Tbl=${Tbl}&Name=${Name}',
  SaveResourceAvailbilityPhy: 'SaveResourceAvailbilityPhy',
  fetchResourceAvailableConfigurationPhys: 'FetchResourceAvailableConfigurationPhys?DoctorID=${DoctorID}&SpecialisationID=${SpecialisationID}&Specialisation=${Specialisation}&DomainID=${DomainID}&Status=${Status}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};