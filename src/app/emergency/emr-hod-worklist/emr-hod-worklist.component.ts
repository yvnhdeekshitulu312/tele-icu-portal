import { Component, OnDestroy, OnInit } from '@angular/core';
import { EmergencyConfigService } from '../services/config.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import moment from 'moment';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientfoldermlComponent } from 'src/app/shared/patientfolderml/patientfolderml.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

declare var $: any;

const MY_FORMATS = {
    parse: {
        dateInput: 'dd-MMM-yyyy',
    },
    display: {
        dateInput: 'DD-MMM-yyyy',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'dd-MMM-yyyy',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
  selector: 'app-emr-hod-worklist',
  templateUrl: './emr-hod-worklist.component.html',
  styleUrls: ['./emr-hod-worklist.component.scss'],
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
export class EmrHodWorklistComponent extends BaseComponent implements OnInit {
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
  patinfo:any;
  DisplayName: any;
  IsDoctor: any; IsNurse: any;
  FetchEMRConsultationOrdersDataaList: any = [];
  FetchEMRConsultationOrdersDataaList1: any = [];
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
    selectallAA: any;
  selectallT = false;
  private subscription!: Subscription;
  IsBedsBoard = false;
  emrTransferAnotherDocData: any;
  emrTransferAnotherDocDataForFiltering: any;
  selectedPatient: any;
  showDocValidation: boolean = false;
  assignBed: string = "Assign Bed";
  assign: string = "Assign";
  trasnferRequests: any;
  trasnferRequests1: any = [];
  showTransferRequests: boolean = false;
  transferRequestsCount= 0;
  transferRejectRemarksForPatientName: string = "";
  selectedPatientToReject: any;
  showRejectRemarksValidation: boolean = false;
  FacilityID: any;
  Facility: any;
  HospDeptID: any;
  TransferDoctor:string="";
  savedMsg: string = "Transfer saved successfully";
  showAgeContradictoryMsg = false;
   BedAssignedCount: string = "0";
   BedNotAssignedCount: string = "0";
 TotalCount: string = "0";
  NotSeenByDoctorCount: any;
  SelectedSSN: string = "0";
  facility: any;
  modalService: any;
  aprrovalRequests: any[] = [];
  aprrovalRequestDetails: any[] = [];
  tablePatientsForm!: FormGroup;
  selectedPatientToViewApproval: any;

  constructor(private config: EmergencyConfigService, public datepipe: DatePipe,
    private router: Router, private appconfig: ConfigService, private fb: FormBuilder, private ms: GenericModalBuilder) {
      super()
    this.groupedByDate = [];
    this.groupedByDateTransfer = [];
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.setpatientType(1);
    this.clearuser();
    this.tablePatientsForm = this.fb.group({
            FromDate: [''],
            ToDate: [''],
        });
        this.tablePatientsForm.patchValue({
            FromDate: new Date(),
            ToDate: new Date()
        });
     }

  ngOnInit(): void {
    this.Facility = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.FacilityID = this.Facility[0].EmpSpecialisationId;
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
      this.DisplayName = 'Emergency HOD WorkList';
    }
    if (this.IsNurse == 'true') {
      this.IsTriage = 1;
      this.IsBedsBoard = true;
      //this.DisplayName = 'Respiratory  WorkList';
      this.DisplayName = 'HOD Triage 2';
      //this.FetchEMRBeds();
    }

    // this.subscription = interval(60000).subscribe(() => {
    //   this.refreshPatients();
    // });
    this.FetchTransferRequests();
  }

  onDateChange() {
    if (!this.tablePatientsForm.value['FromDate'] || !this.tablePatientsForm.value['ToDate']) {
        return;
    }
    this.FromDate = this.tablePatientsForm.value['FromDate'];
    this.ToDate = this.tablePatientsForm.value['ToDate'];
    this.FetchEMRConsultationOrders();
  }

  FetchTransferRequests() {
    this.config.FetchPatientEMRPendingPrimaryDoctorRequests(this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, '3403', this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trasnferRequests = this.trasnferRequests1 = response.FetchPatientEMRPendingPrimaryDoctorRequestsDataList;
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
    this.config.FetchEMRBeds('3393', '0', this.doctorDetails[0].UserId, '3403', this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.emrBedsDataList = response.FetchEMRBedsDataList;
          if (Type == 1) {
            this.emrBedsDataList = this.emrBedsDataList.filter((x: any) => x.BedStatus == '1')
          }
          this.emrBedsDataList.forEach((element: any, index: any) => {
            if (element.BedStatus == "1")
              element.bedClass = "room_card warning";
            else if (element.BedStatus == "3")
              element.bedClass = "room_card primary";
            else if (element.BedStatus == "4" || element.BedStatus == "8" || element.BedStatus == "6")
              element.bedClass = "room_card warning";
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

  FetchEMRConsultationOrders() {
   
    this.config.FetchEMRConsultationOrdersSSN(this.datepipe.transform(this.FromDate, "dd-MMM-yyyy")?.toString(),
      // this.datepipe.transform(this.ToDate, "dd-MMM-yyyy")?.toString(), 0, "3403", this.hospitalID, this.IsTriage)
      // .subscribe((response: any) => {
      this.datepipe.transform(this.ToDate, "dd-MMM-yyyy")?.toString(),this.SelectedSSN, 0, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID, this.IsTriage)
      .subscribe((response: any) => {
        this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList1 = response.FetchEMRConsultationOrdersDataaList;
        
        this.AdultWaitingRoom = response.FetchEMRConsultationOrdersDataacList[0]?.AdultCount;
        this.PediaWaitingRoom = response.FetchEMRConsultationOrdersDataacList[0]?.PediaCount;
        this.PatientsListToFilter = this.FetchEMRConsultationOrdersDataaList;
        

            this.BedAssignedCount = response.FetchEMRConsultationOrdersCountExtraDataList[0]?.BedAssignedCount;
        this.BedNotAssignedCount = response.FetchEMRConsultationOrdersCountExtraDataList[0]?.BedNotAssignedCount;
        this.NotSeenByDoctorCount = response.FetchEMRConsultationOrdersCountExtraDataList[0]?.NotSeenByDoctorCount;
 this.TotalCount = response.FetchEMRConsultationOrdersCountExtraDataList[0]?.TotalCount;

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
          sortedGroupedByDate[date] = this.groupedByDate[date];
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
    const tomorrow = new Date(this.today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.FromDate = this.today;
    this.ToDate = tomorrow;
    this.FetchEMRConsultationOrders();
    this.showTransferRequests = false;
    
  }

  handleTimeFrameSelection(timeFrame: string) {
    const tomorrow = new Date();
    const fromdate = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    switch (timeFrame) {
      case 'Today':
        this.FromDate = fromdate;
        this.ToDate = tomorrow;
        break;
      case 'Yesterday':
        this.FromDate = fromdate.setDate(this.today.getDate() - 1);;
        this.ToDate = fromdate;
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
    this.tablePatientsForm.patchValue({
      FromDate: new Date(this.FromDate),
      ToDate: new Date(this.ToDate)
    });
    this.FetchEMRConsultationOrders();
  }

  navigateToTriageVitals(item: any) {
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
      "WORKSTATIONID": "3403"
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
    if(date.AdmissionReqDate!=null){
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
    this.TransferDoctor="Endsore";
    $("#transferdoctor").modal('show');
  }
  showTransferBedmodal(event: any, item: any) {
    event.stopPropagation();
    this.selectedPatient = item;
    this.FetchEMRTransferAnotherDocSpec();
    this.TransferDoctor="Transfer";
    $("#transferdoctor").modal('show');
  }

  showvalidatemodal(item: any) {
    if (item.BedName == '' && Number(item.CTASSCore) > 2) {
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
    this.selectall=false;
    this.emrPatientDetails = item;
    if (this.IsNurse == 'true' && this.emrPatientDetails.Disposition == '')
      this.FetchEMRBeds(1);

    if (this.IsNurse == 'true' && this.emrPatientDetails.Disposition == '') {
      if (this.emrPatientDetails.BedID == "") {
        this.emrBedsDataList.forEach((element: any, index: any) => {
          if (element.BedStatus == "1")
            element.bedClass = "room_card warning";
          if (element.BedStatus == "3")
            element.bedClass = "room_card primary";
          else if (element.BedStatus == "4" || element.BedStatus == "8" || element.BedStatus == "6")
            element.bedClass = "room_card warning";
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
      bed.bedClass = "room_card primary";
    } else if (bed.BedStatus == '4' || bed.BedStatus == '8' || bed.BedStatus == "6") {
      this.SelectedBedInfo = '';
      bed.bedClass = "room_card warning";
    }
    else {
      this.SelectedBedInfo = bed;
      this.emrBedsDataList.forEach((element: any, index: any) => {
        if (element.BedID == bed.BedID) {
          if (element.BedStatus == "1")
            element.bedClass = "room_card warning active";
          else if (element.BedStatus == "3")
            element.bedClass = "room_card primary active";
          else if (element.BedStatus == "4" || element.BedStatus == "8" || bed.BedStatus == "6")
            element.bedClass = "room_card warning active";
        }
        else {
          if (element.BedStatus == "1")
            element.bedClass = "room_card warning";
          else if (element.BedStatus == "3")
            element.bedClass = "room_card primary";
          else if (element.BedStatus == "4" || element.BedStatus == "8" || bed.BedStatus == "6")
            element.bedClass = "room_card warning";
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
      "WORKSTATIONID": "3403"
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
    this.config.FetchEMRTransferAnotherDoc(this.FacilityID, this.doctorDetails[0].UserId, '3403', this.hospitalID)
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
    this.config.FetchEMRTransferAnotherDocSpec(this.FacilityID,this.HospDeptID, this.doctorDetails[0].UserId, '3403', this.hospitalID)
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
    if(Number(this.selectedPatient.Age.trim().split(' ')[0]) >= 14 && this.selectedPatient.AGeUOMID == '1' && doc.Specialisation.includes("PAEDIATRICS")) {
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
          if(this.TransferDoctor == "Transfer")
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

  showRejectionmodal(event:any, item: any) {
    event.stopPropagation();
    this.transferRejectRemarksForPatientName = item.SSN;
    this.selectedPatientToReject = item;
    $("#emrPatientTransferRejectRemark").modal('show');
  }
  RejectPatientEMRPrimaryDoctorRequests() {
    var remarks = $("#rejectRemarks").val();
    if(remarks != '') {
      this.showRejectRemarksValidation = false;
      this.config.RejectPatientEMRPrimaryDoctorRequests(this.selectedPatientToReject.AdmissionID, this.selectedPatientToReject.EMRPrimaryDoctorRequestID, remarks,this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, '3403', this.hospitalID)
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
  navigateToResults(item:any) {
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("FromBedBoard", "false");
    this.router.navigate(['/home/otherresults']);
  }
   openPatientSummary(item: any, event: any) {
    event.stopPropagation();
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
    sessionStorage.setItem("PatientID", item.PatientID);
    sessionStorage.setItem("SummaryfromCasesheet", "true");
    // sessionStorage.setItem("FromPhysioTherapyWorklist", "true");

    const options: NgbModalOptions = {
      windowClass: 'vte_view_modal'
    };
    
    const modalRef = this.ms.openModal(PatientfoldermlComponent, {
      data: item,
      readonly: true,
      selectedView: item
    }, options);
  }

  fetchPatientWalkthroughInfo(pinfo:any) {
    pinfo.FullAge = pinfo.Age;
    pinfo.FromDoctor = pinfo.Consultant;
    this.patinfo = pinfo;
    $("#walkthrough_info").modal('show');
  }

  Disposition: any = [];
  selectedDisposition: any = 0;
  selectedRow: any;
  admissionRequestRaised = false;
  showFollowupForm = false;
  followupFormNA = false;
  followupForm: any = this.fb.group({
      FollowupAfter: ['', Validators.required],
      FollowupDate: ['', Validators.required],
      Remarks: ['', Validators.required],
      NoofFollowUp: ['0'],
      NoofDays: [''],
      adviceToPatient: ['']
    });
  showendofEpisodeRemarks = false;
  followUpSubmitted = false;

  onEndofEpisodeClick(item: any) {
    this.selectedRow = item;
    this.clearEndOfEpisode();
    this.appconfig.FetchEmergencyDischargeDispositions(this.doctorDetails[0].EmpId, this.hospitalID)
        .subscribe((response: any) => {
          this.Disposition = response.FetchEmergencyDischargeDispositionsDataList.filter((element: any) => element.DispositionID === '1' || element.DispositionID === '6');
          this.fetchAdmissionRequestAlreadyRaised();
        },
          (_) => {
          })
      $('#endofEpisodeJustification').modal('show');
  }

  fetchAdmissionRequestAlreadyRaised() {
    this.appconfig.FetchPatientAdmissionRequestAndSurgeryRequest(this.selectedRow.AdmissionID, this.doctorDetails[0].UserId, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code === 200 && response.FetchPatientAdmissionRequestAndSurgeryRequestDataList.length > 0) {
          this.admissionRequestRaised = true;
        }
      },
        (_) => {
        })
  }

  onchangeEndofEpisodeDisposition(event: any) {
    const val = event.target.value;
    if (val === '1') {
      this.showFollowupForm = true;
      this.followupFormNA = true;
    }
    else {
      this.showFollowupForm = false;
      this.followupFormNA = false;
    }
    $("endofEpisodeRemarks").val('');
  }

  addFollowupDays() {
    let afterDays = this.followupForm.get('FollowupAfter').value;
    const admissionDate = new Date();
    const endDate = new Date(admissionDate.getTime() + (afterDays * 24 * 60 * 60 * 1000));
    this.followupForm.get('FollowupDate').setValue(endDate);
  }

  clearEndOfEpisode() {
    this.followupForm.patchValue({
      FollowupAfter: '',
      FollowupDate: '',
      Remarks: '',
      NoofFollowUp: '0',
      NoofDays: '',
      adviceToPatient: ''
    });
    this.selectedDisposition = 0;
    this.admissionRequestRaised = false;
    this.showFollowupForm = false;
    this.followupFormNA = false;
    this.showendofEpisodeRemarks = false;
    this.followUpSubmitted = false;
    setTimeout(() => {
      $("endofEpisodeRemarks").val('');
    });
  }

  saveEndofEpisodeRemarks() {
    this.showendofEpisodeRemarks = false;

    if ($("#DispositionsID").val() == '1' && !this.followupFormNA && this.followupForm.get("FollowupAfter")?.value === '') {
      this.followUpSubmitted = true;
      return;
    }
    const TriageLOS = this.startTimers(this.selectedRow);
    var endofepisoderemarks = $("#endofEpisodeRemarks").val();
    if (this.showFollowupForm && !this.followupFormNA) {
      endofepisoderemarks = this.followupForm.get("Remarks")?.value;
    }
    if (!endofepisoderemarks) {
      this.showendofEpisodeRemarks = true;
      return;
    }
    this.appconfig.UpdateEMRPatientEpisodeclose(
      this.selectedRow.PatientID,
      this.selectedRow.AdmissionID,
      true,
      this.doctorDetails[0].EmpId,
      this.selectedRow.SpecialiseID,
      this.selectedRow.BillID,
      endofepisoderemarks,
      $("#DispositionsID").val(),
      0,
      TriageLOS,
      this.hospitalID,
      '0',
      '0',
      '0',
      this.selectedRow.PatientType,
      '0',
      '0',
      this.selectedRow.BillType == 'Insured' ? 'CR' : 'CS',
      (this.selectedRow.CompanyID === '' || this.selectedRow.CompanyID === undefined) ? 0 : this.selectedRow.CompanyID,
      (this.selectedRow.GradeID === '' || this.selectedRow.GradeID === undefined) ? 0 : this.selectedRow.GradeID,
      (this.selectedRow.Tariffid === '' || this.selectedRow.Tariffid === undefined) ? 0 : this.selectedRow.Tariffid,
      this.selectedRow.MonitorID === '' ? 0 : this.selectedRow.MonitorID,
      this.doctorDetails[0].UserId,
      "3403"
    ).subscribe(response => {
      if (response.Code == 200) {
        $("#endofEpisodeSaveMsg").modal('show');
        $('#endofEpisodeJustification').modal('hide');
        this.FetchEMRConsultationOrders();
        if ($("#DispositionsID").val() == '1' && !this.followupFormNA) {
          this.saveFollowUpFromEndofEpisode();
        }
      }
    })
  }

  saveFollowUpFromEndofEpisode() {
    let diagSelected: any = [];
    const refdata: any = [];
    let DoctorSelected: any = [];

    if (this.selectedRow.OrderTypeID === '49') {
      DoctorSelected.push({
        "DOCID": this.doctorDetails[0].EmpId,
        "SPID": this.selectedRow.SpecialiseID,
        "CVAD": this.followupForm.get('FollowupAfter').value,
        "SCHID": 0
      });
    }

    let payload = {
      "intMonitorID": this.selectedRow.MonitorID === '' ? 0 : this.selectedRow.MonitorID,
      "PatientID": this.selectedRow.PatientID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "IPID": this.selectedRow.AdmissionID,
      "SpecialiseID": this.selectedRow.SpecialiseID,
      "PatientType": this.selectedRow.PatientType,
      "BillID": this.selectedRow.BillID,
      "FollowUpType": "1",
      "Advicee": this.followupForm.get('adviceToPatient').value,
      "FollowAfter": this.followupForm.get('FollowupAfter').value,
      "FollowUpOn": moment(this.followupForm.get('FollowupDate').value).format('DD-MMM-YYYY'),
      "DiagDetailsList": diagSelected,
      "ReasonforAdm": "",
      "RefDetailsList": refdata,
      "LengthOfStay": 0,
      "DietTypeID": 0,
      "FollowUpRemarks": this.followupForm.get('Remarks').value,
      "PrimaryDoctorID": this.doctorDetails[0].EmpId,
      "AdmissionTypeID": 0,
      "FollowUpCount": this.followupForm.get('NoofFollowUp')?.value,
      "Followupdays": this.followupForm.get("NoofDays").value == "" ? "0" : this.followupForm.get("NoofDays").value,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": "3403",
      "HospitalID": sessionStorage.getItem('hospitalId'),
      "BillType": this.selectedRow.BillType == 'Insured' ? 'CR' : 'CS',
      "CompanyID": this.selectedRow.CompanyID == "" ? 0 : this.selectedRow.CompanyID,
      "GradeID": this.selectedRow.GradeID,
      "WardID": 0,
      "PrimaryDoctorSpecialiseID": 0,
      "DoctorXML": this.selectedRow.OrderTypeID === '49' ? DoctorSelected : []
    };

    this.appconfig.saveAdvice(payload).subscribe((response: any) => {
      if (response.Status === "Success" || response.Status === "True") {
      
      }
    },
      () => {

      })
  }

  filterNotSeenPatients(type: number) {
     this.selectallAA = '';
    if (type == 0) {
      this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList1;
       this.selectallAA = 0;
    }
    else if (type == 1) {
      this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList1.filter((x: any) => x.BedID != '' && x.DispositionID == '');
      this.selectallAA = 1;
    }
    else if (type == 2) {
      this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList1.filter((x: any) => x.BedID == '' && x.DispositionID == '');
      this.selectallAA = 2;
    }
    else if (type == 3) {
      this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList1.filter((x: any) => x.BedID != '' && x.DispositionID == '' && x.ConsultantID == '1162');
      this.selectallAA = 3;
    }
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
          sortedGroupedByDate[date] = this.groupedByDate[date];
        });

        this.groupedByDate = sortedGroupedByDate;
  }
   onSSNEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.SelectedSSN=$('#NationalId').val() != "" && $('#NationalId').val() != undefined ? $('#NationalId').val() : "",
     this.FetchEMRConsultationOrders();
    }
  }
   clearSSN() {
    $("#NationalId").val('');
    this.SelectedSSN = "0";
    this.FetchEMRConsultationOrders();
  }

  viewApprovals(item: any) {
    this.selectedPatientToViewApproval = item;
      var visitid = item.AdmissionID;
      this.appconfig.FetchApprovalRequestAdv(visitid, this.doctorDetails[0].UserId, '3591', this.hospitalID)
        .subscribe((response: any) => {
          $('#viewApprovalsModal').modal('show');
          if (response.ApprovalRequestsDataList.length > 0) {
            this.aprrovalRequests = response.ApprovalRequestsDataList;
            this.aprrovalRequestDetails = response.ApprovalRequestDetailsDataList;
            this.aprrovalRequestDetails.forEach((element: any) => {
              if (element.ClaimStatusID == '0') {
                element.class = "status red";
              }
              else if (element.ClaimStatusID == '') {
                element.class = "status green";
              }
              else if (element.ClaimStatusID == '') {
                element.class = "status green";
              }
              else if (element.ClaimStatusID == '') {
                element.class = "status green";
              }
            });
          }
  
        },
          (err) => {
          })
    }
}
