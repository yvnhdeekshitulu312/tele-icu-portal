import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
  selector: 'app-future-appointments-worklist',
  templateUrl: './future-appointments-worklist.component.html',
  styleUrls: ['./future-appointments-worklist.component.scss'],
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
export class FutureAppointmentsWorklistComponent extends BaseComponent implements OnInit {
  @Input()
  fromScheduler: boolean = false;
  @Input()
  patientSSN: any;
  cancelall = false;
  datesForm: any;
  toDate = new FormControl(new Date());
  PatientAppointmentsWorkList: any = [];
  PatientAppointmentsWorkListC: any = [];
  Cancel: string = '00'; Booked: string = '00';onlineCall: string = '00'; Visited: string = '00'; All: string = '00';


  PatientAppointmentsWorkList1: any = [];
  listOfSpecialisation: any = [];
  listOfSpecialisation1: any = [];
  listOfItems: any;
  listOfItems1: any;
  selectedRecord: any;
  showRemarksValidation: boolean = false;
  sortedGroupedByAdmitDate: any = [];
  showSpecValidation: boolean = false;
  locationList: any = [];
  lang: any;
  direction: string = '';
  selectedAppToCancel: any;
  actionTakenList: any = [];
  cancelResonsList: any = [];
  cancelForm!: FormGroup;
  showActionTakenMandatoryMsg = false;
  showReasonMandatoryMsg = false;
  showRemarksMandatoryMsg = false;
  appSaveMsg: string = "Appointment saved successfully";
  selectedStatusID: any = 0;

  ConfirmedbyCall: Number = 0;
  NotAnswered: Number = 0;
  NotReachable: Number = 0;
  ConfirmedbySMS: Number = 0;
  WrongNumber: Number = 0;
  Busy: Number = 0;
  AllStatus: Number = 0;

  allPatientAppointments: any[] = [];
  allPatientAppointments1: any[] = [];
  sortedGroupedByAdmitDatePaged: any[] = [];
  currentPageItems = 0;
  pageSizeItems = 20;
  hasMoreData = true;
  isLoadingMore = false;
  isInitialLoading = false;


  constructor(private us: UtilityService, public datepipe: DatePipe, public formBuilder: FormBuilder, private router: Router) {
    super();
    this.lang = sessionStorage.getItem("lang");
    if (this.lang == 'ar') {
      this.direction = 'rtl';
    }
    const wm = new Date();
    const todate = new Date();
    todate.setDate(todate.getDate() + 1);
    this.datesForm = this.formBuilder.group({
      HospitalID: [],
      HospitalName: [''],
      HospitalName2l: [''],
      fromdate: wm,
      todate: todate,
      SSN: [''],
      SpecialiseID: [''],
      Specialisation: [''],
      DoctorID: [''],
      DoctorName: ['']
    });

    this.cancelForm = this.formBuilder.group({
      ActionTypeID: ['0'],
      CancelReasonID: ['0'],
      Remarks: ['']
    });
  }

  ngOnInit(): void {
    this.fetchHospitalLocations();
    //this.FetchPatientAppointmentsWorkList();
  }

  fetchHospitalLocations() {
    const url = this.us.getApiUrl(futureAppointments.fetchHospitalLocations, {});
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.locationList = response.HospitalLocationsDataList;

          var res = response.HospitalLocationsDataList.find((h: any) => h.HospitalID == this.hospitalID);
          this.selectedHospital(res);
        }
      },
        (err) => {
        })
  }

  selectedHospital(item: any) {
    this.datesForm.patchValue({
      HospitalID: item.HospitalID,
      HospitalName: item.Name,
      HospitalName2l: item.Name2l
    });
    this.fetchSpecialisations();
    this.fetchInitialDoctors();
    if (this.fromScheduler) {
      var wm = new Date();
      var d = new Date();
      wm.setMonth(wm.getMonth() - 3);
      this.datesForm.patchValue({
        SSN: this.patientSSN,
        fromdate: wm,
        todate: d
      });
      this.FetchPatientAppointmentsWorkList();
    }
  }

  fetchSpecialisations() {
    const url = this.us.getApiUrl(futureAppointments.fetchGSpecialisationN, { HospitalID: this.datesForm.get('HospitalID').value });
    this.us.get(url)
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
    let arr = this.listOfSpecialisation1.filter((spec: any) => spec.Specialisation.toLowerCase().indexOf(item.toLowerCase()) > -1);
    this.listOfSpecialisation = arr.length ? arr : [];
  }

  selectSpecialisationItem(event: any) {
    const item = this.listOfSpecialisation.find((x: any) => x.Specialisation === event.option.value);
    this.datesForm.patchValue({
      SpecialiseID: item.SpecialiseID,
      Specialisation: item.Specialisation
    });
    this.showSpecValidation = false;
    this.fetchSpecializationDoctor(item);
    this.FetchPatientAppointmentsWorkList();
  }

  fetchSpecializationDoctor(item: any) {
    const url = this.us.getApiUrl(futureAppointments.fetchSpecializationDoctorTimings, {
      SpecializationID: item.SpecialiseID,
      UserID: this.doctorDetails[0]?.UserId,
      WorkStationID: this.doctorDetails[0]?.FacilityId ?? 0,
      HospitalID: this.datesForm.get('HospitalID')?.value,
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfItems = response.GetAllDoctorsList;
        }
      },
        (err) => {
        })
  }

  fetchInitialDoctors() {
    // const url = this.us.getApiUrl(futureAppointments.FetchReferalDoctors, { Tbl: 11, Name: '%%%' });
    // this.us.get(url)
    //   .subscribe((response: any) => {
    //     if (response.Code == 200) {
    //       this.listOfItems = this.listOfItems1 = response.ReferalDoctorDataList;
    //     }
    //   },
    //     (err) => {
    //     })
    const url = this.us.getApiUrl(futureAppointments.fetchSpecializationDoctorTimings, {
      SpecializationID: 0,
      UserID: this.doctorDetails[0]?.UserId,
      WorkStationID: this.doctorDetails[0]?.FacilityId ?? 0,
      HospitalID: this.datesForm.get('HospitalID')?.value,
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfItems = this.listOfItems1 = response.GetAllDoctorsList;
        }
      },
        (err) => {
        })
  }

  searchDoctor(event: any) {
    const item = event.target.value;
    this.listOfItems = this.listOfItems1;
    let arr = this.listOfItems1.filter((spec: any) => spec.EmpCodeName.toLowerCase().indexOf(item.toLowerCase()) > -1);
    this.listOfItems = arr.length ? arr : [];

    if (arr.length === 0) {
      this.fetchDoctorSearch(event);
    }
  }

  fetchDoctorSearch(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      const url = this.us.getApiUrl(futureAppointments.FetchReferalDoctors, { Tbl: 11, Name: filter });
      this.us.get(url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfItems = response.ReferalDoctorDataList;
          }
        },
          (err) => {
          });
    }
    else {
      this.listOfItems = [];
    }
  }

  selectDocor(event: any) {
    const item = this.listOfItems.find((x: any) => x.EmpCodeName === event.option.value);
    this.datesForm.patchValue({
      DoctorID: item.EmpID,
      DoctorName: item.EmpCodeName,
      SpecialiseID: item.SpecialiseId,
      Specialisation: item.SpecialityName
    });
    this.FetchPatientAppointmentsWorkList();
  }

  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.FetchPatientAppointmentsWorkList();
    }
  }

  FetchPatientAppointmentsWorkList() {
    this.PatientAppointmentsWorkList = []
    this.PatientAppointmentsWorkListC = []
    this.isInitialLoading = true;

    const fromDate = this.datesForm.get('fromdate').value;
    const todate = this.datesForm.get('todate').value;
    let formattedFromDate;
    let formattedToDate;

    if (fromDate !== null && fromDate !== undefined) {
      formattedFromDate = this.datepipe.transform(fromDate, "dd-MMM-yyyy")?.toString() ?? '';
    }

    if (todate !== null && todate !== undefined) {
      formattedToDate = this.datepipe.transform(todate, "dd-MMM-yyyy")?.toString() ?? '';
    }

    if (!fromDate || !todate) {
      this.isInitialLoading = false;
      return;
    }

    const specId = this.datesForm.get('SpecialiseID').value;
    if (!specId && !this.fromScheduler) {
      this.showSpecValidation = true;
      this.isInitialLoading = false;
      return;
    }

    const params = {
      FromDate: formattedFromDate,
      ToDate: formattedToDate,
      SSN: this.datesForm.get('SSN').value ? this.datesForm.get('SSN').value : 0,
      SpecialiseID: this.datesForm.get('SpecialiseID').value ? this.datesForm.get('SpecialiseID').value : 0,
      DoctorID: this.datesForm.get('DoctorID').value ? this.datesForm.get('DoctorID').value : 0,
      WorkStationID: this.doctorDetails[0]?.FacilityId ?? 0,
      HospitalID: this.datesForm.get('HospitalID').value
    };

    const url = this.us.getApiUrl(futureAppointments.FetchPatientAppointmentsWorkList, params);

    this.us.get(url)
      .subscribe((response: any) => {
        this.isInitialLoading = false;
        if (response.Code == 200) {
          response.FetchPatientAppointmentsWorkListDataList.forEach((a: any) => {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            const itemDate = new Date(a.AppointmentDateTime);
            a.isBeforeCurrentDay = itemDate < currentDate ? true : false;
          });

          this.PatientAppointmentsWorkList = this.PatientAppointmentsWorkList1 = response.FetchPatientAppointmentsWorkListDataList;
          this.PatientAppointmentsWorkListC = response.FetchPatientAppointmentsWorkList1DataList[0];

          if (response.FetchPatientAppointmentsWorkList1DataList.length > 0) {
            this.Cancel = response.FetchPatientAppointmentsWorkList1DataList[0].Cancel;
            this.Booked = response.FetchPatientAppointmentsWorkList1DataList[0].Booked;
             this.onlineCall = response.FetchPatientAppointmentsWorkList1DataList[0].onlineCall;
            
            this.Visited = response.FetchPatientAppointmentsWorkList1DataList[0].Visited;
            this.All = response.FetchPatientAppointmentsWorkList1DataList[0].All;

            this.AllStatus = response.FetchPatientAppointmentsWorkListDataList.filter((x: any) => x.VirtualConfirmStatus == '').length;
            this.ConfirmedbyCall = response.FetchPatientAppointmentsWorkListDataList.filter((x: any) => x.VirtualConfirmStatus == '1').length;
            this.NotAnswered = response.FetchPatientAppointmentsWorkListDataList.filter((x: any) => x.VirtualConfirmStatus == '2').length;
            this.NotReachable = response.FetchPatientAppointmentsWorkListDataList.filter((x: any) => x.VirtualConfirmStatus == '3').length;
            this.ConfirmedbySMS = response.FetchPatientAppointmentsWorkListDataList.filter((x: any) => x.VirtualConfirmStatus == '6').length;
            this.WrongNumber = response.FetchPatientAppointmentsWorkListDataList.filter((x: any) => x.VirtualConfirmStatus == '7').length;
            this.Busy = response.FetchPatientAppointmentsWorkListDataList.filter((x: any) => x.VirtualConfirmStatus == '8').length;
          } else {
            this.Cancel = '00';
            this.Booked = '00';
            this.Visited = '00';
            this.All = '00';
          }

          // Store all appointments sorted by date
          this.allPatientAppointments = this.allPatientAppointments1 =this.PatientAppointmentsWorkList.sort((a: any, b: any) =>
            new Date(a.AppointmentDateTime).getTime() - new Date(b.AppointmentDateTime).getTime()
          );

          this.filterAppointmentStatus('B');
        }
      },
        (err) => {
          this.isInitialLoading = false;
        })
  }

  filterAppointmentStatus(status: string) {
    let filteredAppointments: any[] = [];

    // Filter appointments based on status
    switch (status) {
      case 'C':
        filteredAppointments = this.allPatientAppointments1.filter(x => x.AppointmentStatus === 'Cancelled');
        break;
      case 'V':
        filteredAppointments = this.allPatientAppointments1.filter(x => x.AppointmentStatus === 'Visited');
        break;
      case 'B':
        filteredAppointments = this.allPatientAppointments1.filter(x => x.AppointmentStatus === 'Booked' && x.IsVitual === false);
        break;
        case 'G':
        filteredAppointments = this.allPatientAppointments1.filter(x => x.AppointmentStatus === 'Booked' && x.IsVitual === true);
        break;
      default:
        filteredAppointments = this.allPatientAppointments1;
        break;
    }

    // Update the data source for pagination
    this.allPatientAppointments = filteredAppointments;

    // Reset pagination and load first page
    this.resetAppointmentsPagination();
    this.loadNextAppointmentsPage();
  }

  loadNextAppointmentsPage() {
    if (!this.hasMoreData || this.isLoadingMore) return;

    this.isLoadingMore = true;

    // Simulate loading delay (remove in production)
    setTimeout(() => {
      const startIndex = this.currentPageItems * this.pageSizeItems;
      const endIndex = startIndex + this.pageSizeItems;

      if (startIndex >= this.allPatientAppointments.length) {
        this.hasMoreData = false;
        this.isLoadingMore = false;
        return;
      }

      // Get next page of items
      const nextPageItems = this.allPatientAppointments.slice(startIndex, endIndex);

      // Group the new items by date and merge with existing groups
      this.addItemsToGroupedData(nextPageItems);

      this.currentPageItems++;
      this.hasMoreData = endIndex < this.allPatientAppointments.length;
      this.isLoadingMore = false;
    }, 300); // Remove setTimeout in production
  }

  addItemsToGroupedData(newItems: any[]) {
    // Group new items by date
    const newGroupedByDate = newItems.reduce((acc: any, current: any) => {
      const admitDate = current.AppointmentDateTime.split(' ')[0];
      if (!acc[admitDate]) {
        acc[admitDate] = [];
      }
      acc[admitDate].push(current);
      return acc;
    }, {});

    // Merge with existing grouped data
    Object.keys(newGroupedByDate).forEach(date => {
      const existingGroup = this.sortedGroupedByAdmitDatePaged.find(group => group.admitDate === date);

      if (existingGroup) {
        // Add items to existing date group
        existingGroup.items.push(...newGroupedByDate[date]);
      } else {
        // Create new date group
        this.sortedGroupedByAdmitDatePaged.push({
          admitDate: date,
          items: newGroupedByDate[date]
        });
      }
    });

    // Sort groups by date
    this.sortedGroupedByAdmitDatePaged.sort((a, b) =>
      new Date(a.admitDate).getTime() - new Date(b.admitDate).getTime()
    );
  }

  resetAppointmentsPagination() {
    this.currentPageItems = 0;
    this.hasMoreData = true;
    this.isLoadingMore = false;
    this.sortedGroupedByAdmitDatePaged = [];
  }

  // Scroll event handler
  onScrollAppointments(event: any) {
    const element = event.target;
    const threshold = 100; // Load more when 100px from bottom

    if (element.scrollHeight - element.scrollTop <= element.clientHeight + threshold) {
      this.loadNextAppointmentsPage();
    }
  }

  clearViewScreen() {
    this.PatientAppointmentsWorkList = [];
    this.PatientAppointmentsWorkListC = [];
    this.sortedGroupedByAdmitDate = [];
    this.Cancel = '00';
    this.Booked = '00';
    this.Visited = '00';
    this.All = '00';
    this.showSpecValidation = false;
    const wm = new Date();
    this.datesForm = this.formBuilder.group({
      HospitalID: [],
      HospitalName: [''],
      HospitalName2l: [''],
      fromdate: wm,
      todate: wm,
      SSN: [''],
      SpecialiseID: [''],
      Specialisation: [''],
      DoctorID: [''],
      DoctorName: ['']
    });
    var res = this.locationList.find((h: any) => h.HospitalID == this.hospitalID);
    this.selectedHospital(res);
    //this.FetchPatientAppointmentsWorkList();
  }

  onItemActionsChange(event: any, item: any) {
    const selectedValue = event.target.value;
    this.clearRemarks();
    this.showRemarksValidation = false;
    if (selectedValue !== -1) {
      this.selectedRecord = { ...item, reasonValue: selectedValue };
      $('#action_remarks').modal('show');
    }
  }

  updateAppointment() {
    this.showRemarksValidation = false;
    if ($("#remarks_text").val() === '') {
      this.showRemarksValidation = true;
      return;
    }
    $('#action_remarks').modal('hide');
    const payload = {
      "ScheduleID": this.selectedRecord.ScheduleID,
      "VirtualConfirmStatus": this.selectedRecord.reasonValue,
      "VirtualRemarks": $("#remarks_text").val(),
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.doctorDetails[0]?.FacilityId,
      "HospitalID": this.datesForm.get('HospitalID').value
    };
    this.us.post(futureAppointments.UpdatePatientAppointmentConfirmStatus, payload).subscribe((response) => {
      if (response.Code == 200) {
        $('#saveMsg').modal('show');
        this.FetchPatientAppointmentsWorkList();
      }
    },
      (err) => {
        console.log(err)
      })
  }

  clearRemarks() {
    $("#remarks_text").val('');
  }

  cancelAppointmentConfirmation(app: any) {
    this.cancelall = false;
    this.selectedAppToCancel = app;
    $("#cancelConfirmationMsg").modal('show');
  }

  showCancelReasons() {
    this.loadCancelReasons();
    this.loadActionTaken();
    if (this.cancelall) {
      $("#cancelAllReasons").modal('show');
    }
    else {
      $("#cancelReasons").modal('show');
    }
  }

  loadCancelReasons() {
    const url = this.us.getApiUrl(futureAppointments.FetchCancelReasons, { HospitalID: this.datesForm.get('HospitalID')?.value });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.cancelResonsList = response.GetMasterDataList;
        }
      },
        (err) => {
        })
  }

  loadActionTaken() {
    const url = this.us.getApiUrl(futureAppointments.FetchActionTaken, { HospitalID: this.datesForm.get('HospitalID')?.value });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.actionTakenList = response.GetMasterDataList;
        }
      },
        (err) => {
        })
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

  onRemarksChange() {
    this.showRemarksMandatoryMsg = false;
  }
  onActionTypeChange() {
    this.showActionTakenMandatoryMsg = false;
  }
  onCancelReasonChange() {
    this.showReasonMandatoryMsg = false;
  }

  cancelAppointment(app: any) {
    if (this.cancelForm.get("ActionTypeID")?.value != '0' && this.cancelForm.get("CancelReasonID")?.value != '0' && this.cancelForm.get("Remarks")?.value != '') {
      var cancelPayload = {
        "ScheduleID": app.ScheduleID,
        "PatientID": app.PatientID,
        "HOSPITALID": this.datesForm.get('HospitalID')?.value,
        "ActionTypeID": this.cancelForm.get("ActionTypeID")?.value,
        "CancelReasonID": this.cancelForm.get("CancelReasonID")?.value,
        "CancelRemarks": this.cancelForm.get("Remarks")?.value,
        "UserID": this.doctorDetails[0]?.UserId,
        "WorkStationID": this.doctorDetails[0]?.FacilityId ?? 0,
      }

      this.us.post(futureAppointments.CancelAppointment, cancelPayload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#cancelReasons").modal('hide');
            this.appSaveMsg = "Appointment cancelled successfully";
            $("#appointmentSaveMsg").modal('show');
            this.FetchPatientAppointmentsWorkList();
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

  rescheduleAppointment(app: any) {
    sessionStorage.setItem("dischargefollowups", JSON.stringify(app));
    sessionStorage.setItem("fromFutureAppointments", "true");
    this.router.navigate(['/frontoffice/doctorappointment'])
  }

  cancelAllAppointmentsModal() {
    this.cancelall = true;
    $("#cancelConfirmationMsg").modal('show');
  }

  cancelAllAppointment() {
    if (this.cancelForm.get("ActionTypeID")?.value != '0' && this.cancelForm.get("CancelReasonID")?.value != '0' && this.cancelForm.get("Remarks")?.value != '') {
      const cancelScheduleXML = {
        "CancelScheduleXML": this.sortedGroupedByAdmitDate.flatMap((group: any) =>
          group.items.filter((a: any) => !a.isBeforeCurrentDay).map((item: any) => ({
            "SHID": Number(item.ScheduleID)
          }))
        )
      };
      var cancelPayload = {
        "CancelRemarks": this.cancelForm.get("Remarks")?.value,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.doctorDetails[0]?.FacilityId,
        "HospitalID": this.datesForm.get('HospitalID')?.value,
        "ActionTypeID": this.cancelForm.get("ActionTypeID")?.value,
        "CancelReasonID": this.cancelForm.get("CancelReasonID")?.value,
        ...cancelScheduleXML
      }

      this.us.post(futureAppointments.BulkCancelAppointment, cancelPayload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#cancelAllReasons").modal('hide');
            this.appSaveMsg = "Appointments cancelled successfully";
            $("#appointmentSaveMsg").modal('show');
            this.FetchPatientAppointmentsWorkList();
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

  filterByStatus(Status: any) {
    this.selectedStatusID = Status;
    let data = [...this.PatientAppointmentsWorkList];
    if (this.selectedStatusID.toString() !== '0') {
      data = data.filter((element: any) => element.Status.toString() === this.selectedStatusID.toString());
    }
    const groupedByAdmitDate = data.reduce((acc: any, current: any) => {
      const admitDate = current.AppointmentDateTime.split(' ')[0];
      if (!acc[admitDate]) {
        acc[admitDate] = [];
      }
      acc[admitDate].push(current);

      return acc;
    }, {});


    this.sortedGroupedByAdmitDate = Object.entries(groupedByAdmitDate)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([admitDate, items]) => ({ admitDate, items }));
  }
}

export const futureAppointments = {
  //FetchPatientAppointmentsWorkList: 'FetchPatientAppointmentsWorkList?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&SpecialiseID=${SpecialiseID}&DoctorID=${DoctorID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientAppointmentsWorkList: 'FetchPatientAppointmentsWorkListFF?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&SpecialiseID=${SpecialiseID}&DoctorID=${DoctorID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchGSpecialisationN: 'DepartmentListNN?HospitalID=${HospitalID}',
  FetchReferalDoctors: 'FetchReferalDoctors?Tbl=${Tbl}&Name=${Name}',
  UpdatePatientAppointmentConfirmStatus: 'UpdatePatientAppointmentConfirmStatus',
  fetchHospitalLocations: 'FetchHospitalLocations?type=0&filter=blocked=0&UserId=0&WorkstationId=0',
  fetchSpecializationDoctorTimings: 'FetchSpecializationDoctorTimingsFuture?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchCancelReasons: 'FetchCancelReasons?HospitalID=${HospitalID}',
  FetchActionTaken: 'FetchActionTaken?HospitalID=${HospitalID}',
  CancelAppointment: 'CancelAppointment',
  BulkCancelAppointment: 'BulkCancelAppointment'
};