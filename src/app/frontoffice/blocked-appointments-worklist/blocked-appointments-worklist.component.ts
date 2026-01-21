import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
  selector: 'app-blocked-appointments-worklist',
  templateUrl: './blocked-appointments-worklist.component.html',
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
export class BlockedAppointmentsWorklistComponent extends BaseComponent implements OnInit {
  cancelall = false;
  datesForm: any;
  PatientAppointmentsWorkList: any = [];
  PatientAppointmentsWorkList1: any = [];
  listOfSpecialisation: any = [];
  listOfSpecialisation1: any = [];
  listOfItems: any;
  listOfItems1: any;
  sortedGroupedByAdmitDate: any = [];
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
  StatusList: any;
  selectedFilterType: any;

  constructor(private us: UtilityService, public datepipe: DatePipe, public formBuilder: FormBuilder, private router: Router) {
    super();
    this.lang = sessionStorage.getItem("lang");
    if (this.lang == 'ar') {
      this.direction = 'rtl';
    }
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

    this.cancelForm = this.formBuilder.group({
      ActionTypeID: ['0'],
      CancelReasonID: ['0'],
      Remarks: ['']
    });
  }

  ngOnInit(): void {
    this.fetchHospitalLocations();
    this.fetchAppointmentStatus();
  }

  fetchHospitalLocations() {
    const url = this.us.getApiUrl(futureAppointments.fetchHospitalLocations, {});
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.locationList = response.HospitalLocationsDataList;
          const res = response.HospitalLocationsDataList.find((h: any) => h.HospitalID == this.hospitalID);
          this.selectedHospital(res);
        }
      },
        (err) => {
        })
  }

  fetchAppointmentStatus() {
    const url = this.us.getApiUrl(futureAppointments.FetchAppointmentStatus, {
      UserID: this.doctorDetails[0]?.UserId,
      HospitalID: this.hospitalID,
      WorkStationID: this.facilitySessionId
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.StatusList = response.FetchAppointmentStatusDataList.filter((element: any) => (element.ID !== '0'&&element.ID !== '19'));
          this.StatusList.forEach((element: any) => {
            if (element.Name === '<ALL>') {
              element.Name = 'All';
            }
          });
          this.FetchPatientAppointmentsWorkList();
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
    this.datesForm.patchValue({
      SpecialiseID: ''
    });
    const item = event.target.value;
    this.listOfSpecialisation = this.listOfSpecialisation1;
    let arr = this.listOfSpecialisation1.filter((spec: any) => spec.Specialisation.toLowerCase().indexOf(item.toLowerCase()) > -1);
    this.listOfSpecialisation = arr.length ? arr : [];
    this.filterData(this.selectedFilterType);
  }

  selectSpecialisationItem(event: any) {
    const item = this.listOfSpecialisation.find((x: any) => x.Specialisation === event.option.value);
    this.datesForm.patchValue({
      SpecialiseID: item.SpecialiseID,
      Specialisation: item.Specialisation
    });
    this.filterData(this.selectedFilterType);
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

  filterSSN(event: any) {
    const ssn = event.target.value;
    let data: any = [];
    data = this.PatientAppointmentsWorkList1.filter((element: any) => element.SSN.includes(ssn));
    this.PatientAppointmentsWorkList = data;
    const groupedByAdmitDate = this.PatientAppointmentsWorkList.reduce((acc: any, current: any) => {
      const admitDate = current.AppointmentDateTime.split(' ')[0];
      if (!acc[admitDate]) {
        acc[admitDate] = [];
      }
      acc[admitDate].push(current);
      return acc;
    }, {});

    this.sortedGroupedByAdmitDate = Object.entries(groupedByAdmitDate)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([admitDate, items]) => ({ admitDate, items }));
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
     // this.FetchPatientAppointmentsWorkList();   
     var SSN=this.datesForm.get('SSN').value ? this.datesForm.get('SSN').value : 0;
        const item = this.listOfSpecialisation.find((x: any) => x.SSN === SSN);
        this.datesForm.patchValue({
          SpecialiseID: item.SpecialiseID,
          Specialisation: item.Specialisation
        });
        this.filterData(this.selectedFilterType);
      

    }
  }

  clearCounts() {
    this.StatusList?.forEach((element: any) => {
      element.Count = '00';
    });
  }

  FetchPatientAppointmentsWorkList() {
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
      return;
    }

    this.clearCounts();
    this.PatientAppointmentsWorkList = this.PatientAppointmentsWorkList1 = [];
    this.sortedGroupedByAdmitDate = [];
    this.selectedFilterType = null;
    this.datesForm.patchValue({
      SpecialiseID: '',
      Specialisation: '',
    });

    const params = {
      FromDate: formattedFromDate,
      ToDate: formattedToDate,
      UserID: this.doctorDetails[0]?.UserId,
      HospitalID: this.hospitalID,
      WorkStationID: this.facilitySessionId
    };

    const url = this.us.getApiUrl(futureAppointments.FetchPatientAppointmentsCancelWorkList, params);

    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          response.FetchPatientAppointmentsCancelWorkListDataList.forEach((a: any) => {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            const itemDate = new Date(a.AppointmentDateTime);
            a.isBeforeCurrentDay = itemDate < currentDate ? true : false;
          });
         
          response.FetchPatientAppointmentsCancelWorkListDataList.forEach((element: any) => {
            if (element.Status == 13)
              element.Class = "doc_card doctor_worklist mt-2 rounded-2 worklist_patientcard ChangeDuty";
            else if (element.Status == 14)
              element.Class = "doc_card doctor_worklist mt-2 rounded-2 worklist_patientcard Meeting";
            else if (element.Status == 15)
              element.Class = "doc_card doctor_worklist mt-2 rounded-2 worklist_patientcard INOR";
            else if (element.Status == 16)
              element.Class = "doc_card doctor_worklist mt-2 rounded-2 worklist_patientcard ONVAC";
              else if (element.Status == 18)
              element.Class = "doc_card doctor_worklist mt-2 rounded-2 worklist_patientcard ONPER";
          });
          
          this.PatientAppointmentsWorkList = this.PatientAppointmentsWorkList1 = response.FetchPatientAppointmentsCancelWorkListDataList;


          this.StatusList.forEach((element: any) => {
            if (element.ID !== '-1') {
              element.Count = response.FetchPatientAppointmentsCancelWorkListDataList.filter((item: any) => item.Status === element.ID).length;
            } else {
              element.Count = response.FetchPatientAppointmentsCancelWorkListDataList.length;
            }

           


          });

         
          this.filterData(this.StatusList[0]);
        }
      },
        (err) => {

        })
  }

  filterData(item: any) {
    this.selectedFilterType = item;
    let data = [];
    if (item.ID === '-1') {
      data = this.PatientAppointmentsWorkList1;
    } else {
      data = this.PatientAppointmentsWorkList1.filter((element: any) => element.Status === item.ID);
    }
    const selectedSpecialiseID = this.datesForm.get('SpecialiseID').value;
    if (selectedSpecialiseID) {
      data = data.filter((element: any) => element.SpecialiseID === selectedSpecialiseID.toString());
    }
    this.PatientAppointmentsWorkList = data;
    const groupedByAdmitDate = this.PatientAppointmentsWorkList.reduce((acc: any, current: any) => {
      const admitDate = current.AppointmentDateTime.split(' ')[0];
      if (!acc[admitDate]) {
        acc[admitDate] = [];
      }
      acc[admitDate].push(current);
      return acc;
    }, {});

    this.sortedGroupedByAdmitDate = Object.entries(groupedByAdmitDate)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([admitDate, items]) => ({ admitDate, items }));
  }

  clearViewScreen() {
    this.clearCounts();
    this.PatientAppointmentsWorkList = [];
    this.sortedGroupedByAdmitDate = [];
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
    this.FetchPatientAppointmentsWorkList();
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
        "CancelRemarks": this.cancelForm.get("Remarks")?.value
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
    sessionStorage.setItem("fromBlockedAppointments", "true");
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
}

export const futureAppointments = {
  FetchPatientAppointmentsCancelWorkList: 'FetchPatientAppointmentsCancelWorkList?FromDate=${FromDate}&ToDate=${ToDate}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  fetchGSpecialisationN: 'DepartmentListNN?HospitalID=${HospitalID}',
  FetchReferalDoctors: 'FetchReferalDoctors?Tbl=${Tbl}&Name=${Name}',
  fetchHospitalLocations: 'FetchHospitalLocations?type=0&filter=blocked=0&UserId=0&WorkstationId=0',
  fetchSpecializationDoctorTimings: 'FetchSpecializationDoctorTimings?SpecializationID=${SpecializationID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchCancelReasons: 'FetchCancelReasons?HospitalID=${HospitalID}',
  FetchActionTaken: 'FetchActionTaken?HospitalID=${HospitalID}',
  CancelAppointment: 'CancelAppointment',
  BulkCancelAppointment: 'BulkCancelAppointment',
  FetchAppointmentStatus: 'FetchAppointmentStatus?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};