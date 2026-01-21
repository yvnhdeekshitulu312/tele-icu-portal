import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EmergencyConfigService } from '../services/config.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscriber, Subscription, interval } from 'rxjs';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { patientadmission } from 'src/app/admission/patientadmission/patientadmission.component';

declare var $: any;
@Component({
  selector: 'app-worklist',
  templateUrl: './worklist.component.html',
  styleUrls: ['./worklist.component.scss']
})
export class WorklistComponent extends BaseComponent implements OnInit, OnDestroy {
  FromDate: any;
  ToDate: any;
  groupedByDate: { [key: string]: any };
  groupedByDateTransfer: { [key: string]: any };
  patientType = 1;
  WaitingRoom: any;
  PediaWaitingRoom: string = "0";
  AdultWaitingRoom: any;
  patientInfoList: any = [];
  pinfo: any;
  patinfo: any;
  DisplayName: any;
  IsDoctor: any; IsNurse: any;
  FetchEMRConsultationOrdersDataaList: any = [];
  FetchEMRConsultationOrdersDataaListL: any = [];
  PatientsListToFilter: any = [];
  errorMessages: any;
  userForm: any;
  errorMessage: any;
  selectedItem: any;
  IsTriage = 0;
  emrBedsDataList: any;
  filteredemrBedsDataList: any = [];
  emrPatientDetails: any;
  SelectedBedInfo: any;
  ValidationMSG: any;
  IsHome = true;
  IsSwitch = true;
  selectall = false;
  selectallT = false;
  selectallTC = false;
  private subscription!: Subscription;
  IsBedsBoard = false;
  emrTransferAnotherDocData: any;
  emrTransferAnotherDocDataForFiltering: any;
  selectedPatient: any;
  showDocValidation: boolean = false;
  assignBed: string = "Assign Bed";
  assign: string = "Assign";
  trasnferRequests: any;
  showTransferRequests: boolean = false;
  transferRequestsCount = 0;
  CriticalPatients = 0;
  UnAssignedPatients = 0;
  transferRejectRemarksForPatientName: string = "";
  selectedPatientToReject: any;
  showRejectRemarksValidation: boolean = false;
  SpecialisationID: any;
  Facility: any;
  facility: any;
  HospDeptID: any;
  TransferDoctor: string = "";
  savedMsg: string = "Transfer saved successfully";
  showAgeContradictoryMsg = false;
  FetchUserFacilityDataList: any;
  FetchBedsFromWardDataList: any;
  isAdultPrint = true;
  trustedUrl: any;
  FetchBedsFromWardDataListGM: any;
  FetchBedsFromWardDataListGF: any;
  IsRODoctor: any;
  uploadPopupdata: any;
  myPhoto!: any;
  selectedFile: any;
  fileError: string = "";
  FetchPatienEMRDocumentsDataList: any;
  SelectedSSN: string = "0";
  constructor(private config: EmergencyConfigService, public datepipe: DatePipe, private bedconfig: BedConfig, private us: UtilityService,
    private router: Router, private appconfig: ConfigService, private fb: FormBuilder) {
    super()
    this.groupedByDate = [];
    this.groupedByDateTransfer = [];
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.Facility = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    if (this.doctorDetails[0].IsDoctor) {
      this.setpatientType(2);
    }
    else {
      this.setpatientType(1);
    }
    this.clearuser();
  }

  ngOnInit(): void {

    this.IsRODoctor = sessionStorage.getItem("IsRODoctor");
    this.SpecialisationID = this.Facility[0].EmpSpecialisationId;
    this.HospDeptID = this.Facility[0].Hospdeptid;

    this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
    const emergencyValue = sessionStorage.getItem("IsEmergencyTile");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = (emergencyValue === 'true');
    } else {
      this.IsHome = false;
    }

    const emergency = sessionStorage.getItem("IsEmergency");
    if (emergency !== null && emergency !== undefined) {
      if (emergency === 'true') {
        this.IsSwitch = false;
      }
    }

    this.IsNurse = sessionStorage.getItem("IsNurse");
    if (this.IsDoctor == 'true') {
      this.IsTriage = 0;
      this.DisplayName = 'Emergency WorkList';
    }
    if (this.IsNurse == 'true') {
      this.IsTriage = 1;
      this.IsBedsBoard = true;
      //this.DisplayName = 'Respiratory  WorkList';
      this.DisplayName = 'Triage 2';
      //this.FetchEMRBeds();
    }
    this.fetchUserFacility();
    this.subscription = interval(60000).subscribe(() => {
      this.refreshPatients();
    });
    this.FetchTransferRequests();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  fetchUserFacility() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalID)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserWardFacilityDataaList;
      },
        (err) => {
        })

  }
  onSelectWard() {
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
    this.fetchBedsFromWard();
  }
  fetchBedsFromWard() {
    this.bedconfig.fetchBedsFromWard(this.wardID, 0, 3, this.doctorDetails[0].EmpId, this.hospitalID)
      .subscribe((response: any) => {
        this.FetchBedsFromWardDataList = response.FetchBedsFromWardDataList;
        if (this.FetchBedsFromWardDataList) {
          this.FetchBedsFromWardDataList = this.FetchBedsFromWardDataList.sort((a: any, b: any) => a.Bed.localeCompare(b.Bed));
        }
        this.PatientsListToFilter = JSON.parse(JSON.stringify(this.FetchBedsFromWardDataList));
      },
        (err) => {
        })
  }

  FetchTransferRequests() {
    this.config.FetchPatientEMRPendingPrimaryDoctorRequests(this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trasnferRequests = response.FetchPatientEMRPendingPrimaryDoctorRequestsDataList;
          this.transferRequestsCount = response.FetchPatientEMRPendingPrimaryDoctorRequestsDataList.length;
          this.groupedByDateTransfer = this.trasnferRequests.reduce((acc: any, curr: any) => {
            const date = curr.orderDate.split(' ')[0];
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(curr);
            return acc;
          }, {});

          const sortedDates = Object.keys(this.groupedByDateTransfer).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

          const sortedGroupedByDate: { [key: string]: any[] } = {};
          sortedDates.forEach(date => {
            sortedGroupedByDate[date] = this.groupedByDateTransfer[date];
          });

          this.groupedByDateTransfer = sortedGroupedByDate;
        }

      },
        (err) => {
        })

  }

  FetchEMRBeds(Type: any) {
    this.config.FetchEMRBeds('3393', '0', this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.emrBedsDataList = response.FetchEMRBedsDataList;
          if (Type == 1) {
            this.emrBedsDataList = this.emrBedsDataList.filter((x: any) => x.BedStatus == '1')
          }
          this.emrBedsDataList.forEach((element: any, index: any) => {
            if (element.BedStatus == "1")
              element.bedClass = "room_card h-100 warning";
            else if (element.BedStatus == "3")
              element.bedClass = "room_card h-100 primary";
            else if (element.BedStatus == "4" || element.BedStatus == "8" || element.BedStatus == "6")
              element.bedClass = "room_card h-100 warning";
          });
          const distinctThings = response.FetchEMRBedsDataList.filter(
            (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.RoomID === thing.RoomID) === i);
          console.dir(distinctThings);

          this.filteredemrBedsDataList = distinctThings
          this.filteredemrBedsDataList = this.filteredemrBedsDataList.sort((a: any, b: any) => a.BedStatus - b.BedStatus);
          $("#emergencyward").modal('show');
        }

      },
        (err) => {
        })
  }
  onSSNEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.SelectedSSN=$('#NationalId').val() != "" && $('#NationalId').val() != undefined ? $('#NationalId').val() : "",
     this.FetchEMRConsultationOrders();
    }
  }

  FetchEMRConsultationOrders() {

    this.config.FetchEMRConsultationOrdersSSN(this.datepipe.transform(this.FromDate, "dd-MMM-yyyy")?.toString(),
      this.datepipe.transform(this.ToDate, "dd-MMM-yyyy")?.toString(),this.SelectedSSN, this.doctorDetails[0].EmpId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID, this.IsTriage)
      .subscribe((response: any) => {
        this.FetchEMRConsultationOrdersDataaList = response.FetchEMRConsultationOrdersDataaList;
        this.FetchEMRConsultationOrdersDataaListL = response.FetchEMRConsultationOrdersDataaList;

        if (this.patientType == 2) {
          if (this.IsDoctor == 'true') {
            this.CriticalPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) <= 2)).length);
            this.UnAssignedPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) > 2)).length);
            this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID == this.doctorDetails[0].EmpId);
            this.FetchBedsFromWardDataListGM = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '1').length;
            this.FetchBedsFromWardDataListGF = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '2').length;
            this.PediaWaitingRoom = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => (Number(x.CALAGE) <= 14 && x.CalAgeUoMID == '1') || x.CalAgeUoMID != '1').length;
            // this.FetchBedsFromWardDataListGF = Number(this.FetchBedsFromWardDataListGF) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGF) : 0;
            // this.FetchBedsFromWardDataListGM = Number(this.FetchBedsFromWardDataListGM) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGM) : 0;
          }
          else {
            if (this.IsNurse == 'true') {
              this.CriticalPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => x.ConsultantID == '1162' && Number(x.CTASSCore) <= 2).length);
              this.UnAssignedPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) > 2)).length);
              this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID != '1162');
              this.FetchBedsFromWardDataListGM = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '1').length;
              this.FetchBedsFromWardDataListGF = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '2').length;
              this.PediaWaitingRoom = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => (Number(x.CALAGE) <= 14 && x.CalAgeUoMID == '1') || x.CalAgeUoMID != '1').length;
              // this.FetchBedsFromWardDataListGF = Number(this.FetchBedsFromWardDataListGF) != 0 ? Number(this.PediaWaitingRoom) -Number(this.FetchBedsFromWardDataListGF) : 0;
              // this.FetchBedsFromWardDataListGM = Number(this.FetchBedsFromWardDataListGM) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGM) : 0;
            }
            else {
              this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList;
              this.FetchBedsFromWardDataListGM = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '1').length;
              this.FetchBedsFromWardDataListGF = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '2').length;
              this.PediaWaitingRoom = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => (Number(x.CALAGE) <= 14 && x.CalAgeUoMID == '1') || x.CalAgeUoMID != '1').length;
              // this.FetchBedsFromWardDataListGF = Number(this.FetchBedsFromWardDataListGF) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGF)  : 0;
              // this.FetchBedsFromWardDataListGM = Number(this.FetchBedsFromWardDataListGM) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGM)  : 0;
            }
          }
        }
        else if (this.patientType == 3) {
          this.selectallTC = !this.selectallTC;
          if (this.IsNurse == 'true' && this.selectallTC) {
            this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) <= 2));
            this.CriticalPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => Number(x.CTASSCore) <= 2).length);
            this.UnAssignedPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) > 2)).length);
            this.FetchBedsFromWardDataListGM = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '1').length;
            this.FetchBedsFromWardDataListGF = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '2').length;
            this.PediaWaitingRoom = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => (Number(x.CALAGE) <= 14 && x.CalAgeUoMID == '1') || x.CalAgeUoMID != '1').length;
            this.FetchBedsFromWardDataListGF = Number(this.FetchBedsFromWardDataListGF) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGF) : 0;
            this.FetchBedsFromWardDataListGM = Number(this.FetchBedsFromWardDataListGM) != 0 ?  Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGM) : 0;


          } else if (this.IsNurse == 'true') {
            this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) <= 2));
            this.CriticalPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => Number(x.CTASSCore) <= 2).length);
            this.UnAssignedPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) > 2)).length);
            this.FetchBedsFromWardDataListGM = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '1').length;
            this.FetchBedsFromWardDataListGF = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '2').length;
            this.PediaWaitingRoom = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => (Number(x.CALAGE) <= 14 && x.CalAgeUoMID == '1') || x.CalAgeUoMID != '1').length;
            this.FetchBedsFromWardDataListGF = Number(this.FetchBedsFromWardDataListGF) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGF)  : 0;
            this.FetchBedsFromWardDataListGM = Number(this.FetchBedsFromWardDataListGM) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGM)  : 0;

          }
          if (this.FetchEMRConsultationOrdersDataaList) {
            this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID != this.doctorDetails[0].EmpId && (Number(x.CTASSCore) <= 2));
            this.CriticalPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) <= 2)).length);
            this.UnAssignedPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) > 2)).length);
            this.FetchBedsFromWardDataListGM = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '1').length;
            this.FetchBedsFromWardDataListGF = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '2').length;
            this.PediaWaitingRoom = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => (Number(x.CALAGE) <= 14 && x.CalAgeUoMID == '1') || x.CalAgeUoMID != '1').length;
            this.FetchBedsFromWardDataListGF = Number(this.FetchBedsFromWardDataListGF) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGF) : 0;
            this.FetchBedsFromWardDataListGM = Number(this.FetchBedsFromWardDataListGM) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGM) : 0;

          }
          /// for unassigned 
          if (this.IsNurse == 'true' && !this.selectallTC) {
            this.setpatientType(1);
          }
          this.WaitingRoom = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID != this.doctorDetails[0].EmpId).length;

        }
        else {
          if (this.IsNurse == 'true') {
            this.CriticalPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) <= 2)).length);
            this.UnAssignedPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) > 2)).length);
            this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) > 2));
            this.FetchBedsFromWardDataListGM = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '1').length;
            this.FetchBedsFromWardDataListGF = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '2').length;
            this.PediaWaitingRoom = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => (Number(x.CALAGE) <= 14 && x.CalAgeUoMID == '1') || x.CalAgeUoMID != '1').length;
            this.FetchBedsFromWardDataListGF = Number(this.FetchBedsFromWardDataListGF) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGF)  : 0;
            this.FetchBedsFromWardDataListGM = Number(this.FetchBedsFromWardDataListGM) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGM)  : 0;
          }
          if (this.FetchEMRConsultationOrdersDataaList) {
            this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID != this.doctorDetails[0].EmpId && (Number(x.CTASSCore) > 2));
            this.CriticalPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) <= 2)).length);
            this.UnAssignedPatients = Number(this.FetchEMRConsultationOrdersDataaListL.filter((x: any) => x.ConsultantID == '1162' && (Number(x.CTASSCore) > 2)).length);
            this.FetchBedsFromWardDataListGM = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '1').length;
            this.FetchBedsFromWardDataListGF = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.GenderID === '2').length;
            this.PediaWaitingRoom = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => (Number(x.CALAGE) <= 14 && x.CalAgeUoMID == '1') || x.CalAgeUoMID != '1').length;
            this.FetchBedsFromWardDataListGF = Number(this.FetchBedsFromWardDataListGF) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGF) : 0;
            this.FetchBedsFromWardDataListGM = Number(this.FetchBedsFromWardDataListGM) != 0 ? Number(this.PediaWaitingRoom) - Number(this.FetchBedsFromWardDataListGM) : 0;
          }
          this.WaitingRoom = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID != this.doctorDetails[0].EmpId).length;
        }
        this.PatientsListToFilter = this.FetchEMRConsultationOrdersDataaList;

        this.groupedByDate = this.FetchEMRConsultationOrdersDataaList.reduce((acc: any, curr: any) => {
          const date = curr.orderDate.split(' ')[0];
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(curr);
          return acc;
        }, {});

        const sortedDates = Object.keys(this.groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        const sortedGroupedByDate: { [key: string]: any[] } = {};
        sortedDates.forEach(date => {
          if(this.patientType == 2) {
            sortedGroupedByDate[date] = this.groupedByDate[date].sort((a: any, b: any) => {
              const aIsEmpty = a.DispositionID === '';
              const bIsEmpty = b.DispositionID === '';
              return Number(!aIsEmpty) - Number(!bIsEmpty);
            });
          } else {
            sortedGroupedByDate[date] = this.groupedByDate[date];
          }
        });

        this.groupedByDate = sortedGroupedByDate;
      },
        (err) => {
        })
  }

  getKeys(object: object): string[] {
    return Object.keys(object);
  }

  setpatientType(type: any) {
    this.selectallT = false;
    this.patientType = type;
    const emergencyWorklistDate = sessionStorage.getItem('emergencyWorklistDate');
    if (emergencyWorklistDate) {
      this.handleTimeFrameSelection(emergencyWorklistDate);
    } else {
      const tomorrow = new Date(this.today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.FromDate = this.today;
      this.ToDate = tomorrow;
      this.FetchEMRConsultationOrders();
    }
    this.showTransferRequests = false;

  }

  handleTimeFrameSelection(timeFrame: string) {
    sessionStorage.setItem('emergencyWorklistDate', timeFrame);
    this.selectallTC = !this.selectallTC;
    const tomorrow = new Date();
    const fromdate = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    switch (timeFrame) {
      case 'Today':
        this.FromDate = fromdate;
        this.ToDate = tomorrow;
        break;
      case 'Yesterday':
      this.FromDate = fromdate.setDate(this.today.getDate() - 1);
      this.ToDate = tomorrow;
      break;
      case 'This week':
        this.FromDate = fromdate.setDate(this.today.getDate() - 7);
        this.ToDate = tomorrow;
        break;
      case 'This Month':
        this.FromDate = fromdate.setDate(this.today.getDate() - 30);
        this.ToDate = tomorrow;
        break;
      case 'Three Months':
        this.FromDate = fromdate.setDate(this.today.getDate() - 90);
        this.ToDate = tomorrow;
        break;
      case 'Six Months':
        this.FromDate = fromdate.setDate(this.today.getDate() - 180);
        this.ToDate = tomorrow;
        break;
      case 'This Year':
        this.FromDate = fromdate.setDate(this.today.getDate() - 365);
        this.ToDate = tomorrow;
        break;
      default:
        this.FromDate = fromdate.setDate(this.today.getDate() - 5000);
        this.ToDate = tomorrow;
        break;
    }

    this.FetchEMRConsultationOrders();
  }

  navigateToTriageVitalsOld(item: any) {
    if (item.CTASSCore != "") {
      if (this.IsNurse == 'true') {
        sessionStorage.setItem("EmrPatientDetails", JSON.stringify(item))
        this.router.navigate(['/emergency/triagevitals']);
      }
      else if (item.ConsultantID == this.doctorDetails[0].EmpId) {
        this.getPatientDetails(item);
      }
    }
    else {
      this.errorMessages = "Emergency Visual Triage is Pending";
      $("#validationMessage").modal('show');
    }
  }
  navigateToTriageVitals(item: any) {
    //if (item.CTASSCore != "") {
    if (this.IsNurse == 'true') {
      sessionStorage.setItem("EmrPatientDetails", JSON.stringify(item))
      this.router.navigate(['/emergency/triagevitals']);
    }
    else if (item.ConsultantID == this.doctorDetails[0].EmpId) {
      this.getPatientDetails(item);
    }
    // }
    // else {
    //   this.errorMessages = "Emergency Visual Triage is Pending";
    //   $("#validationMessage").modal('show');
    // }
  }

  getPatientDetails(item: any) {
    let payload = {
      "RegCode": item.Regcode
    }
    this.appconfig.getPatientDetails(payload).subscribe((response) => {
      if (response.Status === "Success") {
        sessionStorage.setItem("PatientDetails", JSON.stringify(item));
        sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
        sessionStorage.setItem("selectedView", JSON.stringify(item));
        sessionStorage.setItem("selectedCard", JSON.stringify(item));
        this.router.navigate(['/home/doctorcasesheet']);
      }
    },
      (err) => {

      })
  }

  saveDocAcceptance() {
    const item = this.selectedItem;
    var payload = {
      "BillID": item.BillID,
      "AdmissionID": item.AdmissionID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
      "OPConsultationID": "0",
      "HospitalID": this.hospitalID,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
    }
    this.config.UpdateEMRBillDoctorDetails(payload).subscribe(response => {
      if (response.Code == 200) {
        this.ValidationMSG = 'Accepted Successfully';
        $("#saveConsultanceMsg").modal('show');
      }
    })
  }
  showPatientInfo(pinfo: any) {

    this.pinfo = pinfo;
    $("#quick_info").modal('show');
  }
  clearPatientInfo() {
    this.pinfo = "";
    this.patinfo = "";
  }

  startTimers(date: any): any {
    if (date.AdmissionReqDate != null) {
      const startDate = new Date(date.AdmissionReqDate);
      const now = new Date();
      const differenceMs: number = now.getTime() - startDate.getTime();
      const seconds: number = Math.floor((differenceMs / 1000) % 60);
      const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
      const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
      const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
      const totalHours = hours + (days * 24);
      const formattedHours = totalHours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");
      return `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
    }
    //if(date.VTCreateDate && (this.datepipe.transform(date.orderDate, "dd-MMM-yyyy")?.toString() === this.datepipe.transform(Date(), "dd-MMM-yyyy")?.toString())) {
    else if (date.VTCreateDate) {
      const startDate = new Date(date.VTCreateDate);
      const now = new Date();
      const differenceMs: number = now.getTime() - startDate.getTime();
      const seconds: number = Math.floor((differenceMs / 1000) % 60);
      const minutes: number = Math.floor((differenceMs / (1000 * 60)) % 60);
      const hours: number = Math.floor((differenceMs / (1000 * 60 * 60)) % 24);
      const days: number = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
      const totalHours = hours + (days * 24);
      const formattedHours = totalHours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");
      return `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
    }
  }

  filterChangeData(event: any) {
    if (event.length === 0) {
      this.FetchEMRConsultationOrdersDataaList = this.PatientsListToFilter;
    }
    else if (event.length > 2) {
      let filteredresponse = this.PatientsListToFilter.filter((x: any) => (x?.SSN.includes(event) || x?.PatientName.toLowerCase().includes(event.toLowerCase())));
      this.FetchEMRConsultationOrdersDataaList = filteredresponse;
    }

    this.groupedByDate = this.FetchEMRConsultationOrdersDataaList.reduce((acc: any, curr: any) => {
      const date = curr.orderDate.split(' ')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(curr);
      return acc;
    }, {});
  }

  filterDoctors(event: any) {
    if (event.target.value.length < 2) {
      this.emrTransferAnotherDocDataForFiltering = this.emrTransferAnotherDocData;

    }
    const filterValue = event.target.value;
    if (event.target.value.length > 2) {
      const filteredDocData = this.emrTransferAnotherDocData.filter((x: any) => (x?.FullNameEmpNo.toLowerCase().includes(filterValue.toLowerCase())));
      this.emrTransferAnotherDocDataForFiltering = filteredDocData;

    }
  }

  showEndorseBedmodal(event: any, item: any) {
    event.stopPropagation();
    this.selectedPatient = item;
    this.FetchEMRTransferAnotherDoc();
    this.TransferDoctor = "Endsore";
    $("#transferdoctor").modal('show');
  }
  showTransferBedmodal(event: any, item: any) {
    event.stopPropagation();
    this.selectedPatient = item;
    this.FetchEMRTransferAnotherDocSpec();
    this.TransferDoctor = "Transfer";
    $("#transferdoctor").modal('show');
  }

  showvalidatemodalOld(item: any) {
    if (item.BedName == '' && Number(item.CTASSCore) > 2) {
      this.ValidationMSG = 'Bed is not Assigned';
      $("#saveConsultanceMsgE").modal('show');
      return;
    }
    this.clearuser();
    this.selectedItem = item;
    $("#usercredentials").modal('show');
  }
  showvalidatemodal(item: any) {
    if (item.BedName == '') {
      this.ValidationMSG = 'Bed is not Assigned';
      $("#saveConsultanceMsgE").modal('show');
      return;
    }
    this.clearuser();
    this.selectedItem = item;
    $("#usercredentials").modal('show');
  }

  validateuser() {
    this.con.validateDoctorLogin(this.userForm.get('UserName').value, this.userForm.get('Password').value, this.hospitalID).subscribe((response) => {
      this.errorMessage = '';
      if (response.length === 0) {
        this.errorMessage = "Invalid UserName / Password"
      } else if (response[0].CredentialsMessage) {
        this.errorMessage = response[0].CredentialsMessage;
      }
      else {
        $("#usercredentials").modal('hide');
        this.saveDocAcceptance();
      }
    },
      (err) => {

      })
  }

  clearuser() {
    this.userForm = this.fb.group({
      UserName: this.doctorDetails[0].UserName,
      Password: ['', Validators.required]
    });

    this.errorMessage = '';
  }
  openBedAllocationPopup(item: any) {
    this.selectall = false;
    this.emrPatientDetails = item;
    if (this.IsNurse == 'true' && this.emrPatientDetails.Disposition == '')
      this.FetchEMRBeds(1);

    if (this.IsNurse == 'true' && this.emrPatientDetails.Disposition == '') {
      if (this.emrPatientDetails.BedID == "") {
        this.emrBedsDataList.forEach((element: any, index: any) => {
          if (element.BedStatus == "1")
            element.bedClass = "room_card h-100 warning";
          if (element.BedStatus == "3")
            element.bedClass = "room_card h-100 primary";
          else if (element.BedStatus == "4" || element.BedStatus == "8" || element.BedStatus == "6")
            element.bedClass = "room_card h-100 warning";
        });
        $("#emergencyward").modal('show');
      }
    }
    if (item.BedID != '') {
      this.assignBed = "Transfer Bed";
      this.assign = "Trasnfer";
    }
    else {
      this.assignBed = "Assign Bed";
      this.assign = "Assign";
    }
  }
  filterFunction(roomlist: any, roomid: any) {
    return roomlist.filter((buttom: any) => buttom.RoomID == roomid);
  }
  ShowAllBeds(type: any, item: any) {
    this.selectall = !this.selectall;
    var status = this.selectall == false ? 1 : 2;
    this.FetchEMRBeds(status);
  }


  selectemrBed(bed: any) {
    if (bed.BedStatus == '3') {
      this.SelectedBedInfo = '';
      bed.bedClass = "room_card h-100 primary";
    } else if (bed.BedStatus == '4' || bed.BedStatus == '8' || bed.BedStatus == "6") {
      this.SelectedBedInfo = '';
      bed.bedClass = "room_card h-100 warning";
    }
    else {
      this.SelectedBedInfo = bed;
      this.emrBedsDataList.forEach((element: any, index: any) => {
        if (element.BedID == bed.BedID) {
          if (element.BedStatus == "1")
            element.bedClass = "room_card h-100 warning active";
          else if (element.BedStatus == "3")
            element.bedClass = "room_card h-100 primary active";
          else if (element.BedStatus == "4" || element.BedStatus == "8" || bed.BedStatus == "6")
            element.bedClass = "room_card h-100 warning active";
        }
        else {
          if (element.BedStatus == "1")
            element.bedClass = "room_card h-100 warning";
          else if (element.BedStatus == "3")
            element.bedClass = "room_card h-100 primary";
          else if (element.BedStatus == "4" || element.BedStatus == "8" || bed.BedStatus == "6")
            element.bedClass = "room_card h-100 warning";
        }
      });
    }

  }
  saveBedAssign() {
    var payload = {
      "AdmissionID": this.emrPatientDetails.AdmissionID,
      "PatientID": this.emrPatientDetails.PatientID,
      "BedID": this.SelectedBedInfo.BedID,
      "BillBedTypID": this.SelectedBedInfo.BedTypeID,
      "ReqBedTypID": this.SelectedBedInfo.BedTypeID,
      "AllocBedTypID": this.SelectedBedInfo.BedTypeID,
      "HospitalID": this.hospitalID,
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
    }
    this.config.SaveEMRBedAllocations(payload).subscribe(response => {
      if (response.Code == 200) {
        this.FetchEMRConsultationOrders();
        //this.bedNo = this.SelectedBedInfo.Bed;
        this.ValidationMSG = 'Bed Assigned Successfully';
        $("#emergencyward").modal('hide');
        $("#saveConsultanceMsg").modal('show');
      }
    })
  }

  refreshPatients() {
    this.FetchEMRConsultationOrders();
  }

  FetchEMRTransferAnotherDoc() {
    this.config.FetchEMRTransferAnotherDoc(this.SpecialisationID, this.doctorDetails[0].UserId, '3403', this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.emrTransferAnotherDocData = this.emrTransferAnotherDocDataForFiltering = response.FetchEMRTransferAnotherDocDataList;
          this.emrTransferAnotherDocData.forEach((element: any, index: any) => {
            element.isSelected = false;
          });
        }

      },
        (err) => {
        })
  }
  FetchEMRTransferAnotherDocSpec() {
    this.config.FetchEMRTransferAnotherDocSpec(this.SpecialisationID, this.HospDeptID, this.doctorDetails[0].UserId, '3403', this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.emrTransferAnotherDocData = this.emrTransferAnotherDocDataForFiltering = response.FetchEMRTransferAnotherDocDataList;
          this.emrTransferAnotherDocData = this.emrTransferAnotherDocData.sort((a: any, b: any) => a.SpecialiseID - b.SpecialiseID);
          this.emrTransferAnotherDocData.forEach((element: any, index: any) => {
            element.isSelected = false;
          });
        }

      },
        (err) => {
        })
  }
  emrDocSelected(doc: any) {
    if (Number(this.selectedPatient.Age.trim().split(' ')[0]) >= 14 && this.selectedPatient.AGeUOMID == '1' && ((doc.Specialisation.includes("PAEDIATRICS") || doc.Specialisation.includes("PEDIATRICS")))) {
      this.showAgeContradictoryMsg = true;
      return;
    }
    this.showAgeContradictoryMsg = false;
    this.showDocValidation = false;
    this.emrTransferAnotherDocData.forEach((element: any, index: any) => {
      if (element.EmpID == doc.EmpID) {
        element.isSelected = true;
      }
      else {
        element.isSelected = false;
      }
    });
  }

  closeTransferDocPopup() {
    this.showAgeContradictoryMsg = false;
  }
  // saveTransferDoctor() {
  //   const docdet = this.emrTransferAnotherDocData.find((x: any) => x.isSelected);
  //   if (!docdet) {
  //     this.showDocValidation = true;
  //     return;
  //   }
  //   this.config.SavePatientEMRPrimaryDoctors(this.doctorDetails[0].EmpId,this.selectedPatient.PatientID, this.selectedPatient.AdmissionID, docdet.EmpID, docdet.SpecialiseID, this.doctorDetails[0].UserId, '3403', this.hospitalID)
  //     .subscribe((response: any) => {
  //       if (response.Code == 200) {
  //         $("#transferdoctor").modal('hide');
  //         $("#transferMsg").modal('show');
  //       }

  //     },
  //       (err) => {
  //       })
  // }
  saveTransferDoctor() {
    const docdet = this.emrTransferAnotherDocData.find((x: any) => x.isSelected);
    if (!docdet) {
      this.showDocValidation = true;
      return;
    }
    this.config.SavePatientEMRPrimaryDoctorRequests(this.selectedPatient.PatientID, this.selectedPatient.AdmissionID, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, docdet.EmpID, docdet.SpecialiseID, this.selectedPatient.BillID, this.doctorDetails[0].UserId, '3403', this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          $("#transferdoctor").modal('hide');
          if (this.TransferDoctor == "Transfer")
            this.savedMsg = "Transfer request raised."
          else
            this.savedMsg = "Endorse request raised."
          $("#transferMsg").modal('show');
        }

      },
        (err) => {
        })
  }
  clearDocSelected() {
    const selectedDoc = this.emrTransferAnotherDocData.find((x: any) => x.isSelected);
    if (selectedDoc) {
      selectedDoc.isSelected = false;
    }
    this.emrTransferAnotherDocDataForFiltering = this.emrTransferAnotherDocData;
    $("#EmpNoSearch").val('');
    this.showAgeContradictoryMsg = false;
  }

  acceptTransferRequest(req: any) {

    this.config.SavePatientEMRPrimaryDoctors(req.EMRPrimaryDoctorRequestID, req.PatientId, req.Admissionid, req.ToDoctorID, req.ToSpecialiseID, this.doctorDetails[0].UserId, '3403', this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.showTransferRequests = false;
          this.ValidationMSG = "Accepted Successfully";
          this.refreshPatients();
          $("#saveConsultanceMsg").modal('show');
        }

      },
        (err) => {
        })
  }
  showTransferRequestsdiv() {
    this.selectallT = !this.selectallT;
    var status = this.selectallT == false ? 1 : 2;
    this.FetchTransferRequests();
    this.showTransferRequests = true;
  }
  hideTransferRequests() {
    this.showTransferRequests = false;
  }
  closeAssignTransferPopUp() {
    $("#transferMsg").modal('hide');
    this.refreshPatients();
    this.FetchTransferRequests();
  }

  clearRejectRemarks() {
    $("#rejectRemarks").val('');
    this.showRejectRemarksValidation = false;
  }
  closeRejectRemarks() {
    $("#rejectRemarks").val('');
    this.selectedPatientToReject = '';
    this.showRejectRemarksValidation = false;
  }

  showRejectionmodal(event: any, item: any) {
    event.stopPropagation();
    this.transferRejectRemarksForPatientName = item.SSN;
    this.selectedPatientToReject = item;
    $("#emrPatientTransferRejectRemark").modal('show');
  }
  RejectPatientEMRPrimaryDoctorRequests() {
    var remarks = $("#rejectRemarks").val();
    if (remarks != '') {
      this.showRejectRemarksValidation = false;
      this.config.RejectPatientEMRPrimaryDoctorRequests(this.selectedPatientToReject.AdmissionID, this.selectedPatientToReject.EMRPrimaryDoctorRequestID, remarks, this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, '3403', this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.selectedPatientToReject = '';
            $("#emrPatientTransferRejectRemark").modal('hide');
            this.ValidationMSG = "Rejected Successfully";
            this.refreshPatients();
            $("#saveConsultanceMsg").modal('show');
          }

        },
          (err) => {
          })
    }
    this.showRejectRemarksValidation = true;
  }
  navigateToResults(item: any) {
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("FromBedBoard", "false");
    this.router.navigate(['/home/otherresults']);
  }

  fetchPatientWalkthroughInfo(pinfo: any) {
    pinfo.FullAge = pinfo.Age;
    pinfo.FromDoctor = pinfo.Consultant;
    this.patinfo = pinfo;
    $("#walkthrough_info").modal('show');
  }
  FetchPatientAdultBandPrint(item: any) {
    this.isAdultPrint = true;
    var adultbppayload = {
      "PatientID": item.PatientID,
      "IPID": item.AdmissionID,
      "UserName": this.doctorDetails[0]?.UserName,
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "Hospitalid": this.hospitalID,
      "JustificationID": 0,
      "PatientName": item.PatientName,
      "Gender": item.Gender,
      "DOB": item.DOB,
      "Nationality": item.Nationality,
      "SSN": item.SSN,
      "ConsultantName": item.Consultant,
      "BandPrintSuperVisior": 1
    }
    this.us.post(patientadmission.FetchPatientAdultBandPrintEMR, adultbppayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModal();
        }

      },
      (err) => {
        console.log(err);
      }
    );
  }
  showModal(): void {
    $("#reviewAndPayment").modal('show');
  }

  navigateToEmrNursingChecklist(item: any) {
    item.isNursingChecklist = true;
    sessionStorage.setItem("fromEmergencyWorklist", "true");
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("InPatientDetails", JSON.stringify(item));
    this.router.navigate(['/ward/emr-nursing-checklist']);
  }

  openUploadPopup(item: any) {
    this.uploadPopupdata = item;
    this.myPhoto = null;
    this.FetchPatienEMRDocuments();
    $('#uploadFileModal').modal('show');
  }

  onSelectFile(event: any) {
    this.selectedFile = null;
    if (event.target.files && event.target.files[0]) {
      var type = event.target.files[0].name.split(".").pop();
      if (event.target.files[0].size > 5242880) {
        this.fileError = 'File size limit should not exceed 5MB';
        alert(this.fileError);
      }
      else if (type.toLowerCase() !== 'jpeg' && type.toLowerCase() !== 'jpg' && type.toLowerCase() !== 'bmp' && type.toLowerCase() !== 'pdf'
        && type.toLowerCase() !== 'gif' && type.toLowerCase() !== 'png' && type.toLowerCase() !== 'tiff' && type.toLowerCase() !== 'tif') {
        this.fileError = 'File type should be  jpeg, jpg, bmp, gif, png, tiff';
        alert(this.fileError);
      }
      else {
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        this.selectedFile = event.target.files[0];
        this.convertToBase64(file, event.target.id);
      }
    }
  }
  cleanBase64String(base64Str: string): string {
    const match = base64Str.match(/^data:.+;base64,(.*)/);
    if (match) {
      return match[1];
    }
    return base64Str;
  }
  convertToBase64(file: File, inputType: any) {
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber);
    })
    observable.subscribe((d) => {
      this.myPhoto = d;
    })
  }
  readFile(file: File, subscriber: Subscriber<any>) {
    const filereader = new FileReader();
    filereader.readAsDataURL(file);
    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete();
    }
    filereader.onerror = () => {
      subscriber.error();
      subscriber.complete();
    }
  }

  uploadFile() {
    const payload = {
      "PatientID": this.uploadPopupdata.PatientID,
      "EMRDocumentID": 0,
      "AdmissionID": this.uploadPopupdata.AdmissionID,
      "DocumentName": this.selectedFile.name,
      "DocumentImages": this.cleanBase64String(this.myPhoto),
      "USERID": this.doctorDetails[0]?.UserId,
      "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalID
    }

    this.us.post("SavePatienEMRDocuments", payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedFile = null;
          this.myPhoto = null;
          this.FetchPatienEMRDocuments();
        }
      },
        (_) => {

        })
  }

  FetchPatienEMRDocuments() {
    this.FetchPatienEMRDocumentsDataList = [];
    const apiUrl = 'FetchPatienEMRDocuments?AdmissionID=${AdmissionID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}';
    const url = this.us.getApiUrl(apiUrl, {
      AdmissionID: this.uploadPopupdata.AdmissionID,
      UserID: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Code == 200) {
        this.FetchPatienEMRDocumentsDataList = response.FetchPatienEMRDocumentsDataList;
      }
    },
      (_) => {

      })
  }

  downloadFile(base64: any, filename: any) {
    const link = document.createElement('a');
    link.href = `data:application/octet-stream;base64,${base64}`;
    link.download = filename;
    link.click();
  }

  clearSSN() {
    $("#NationalId").val('');
    this.SelectedSSN = "0";
    this.FetchEMRConsultationOrders();
  }
}
