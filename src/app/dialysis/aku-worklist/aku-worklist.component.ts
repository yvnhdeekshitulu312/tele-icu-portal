import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DialysisConfigService } from '../services/config.service';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { SuitConfigService } from 'src/app/suit/services/suitconfig.service';
import { AkuAppointmentService } from '../aku-appointment/aku-appointment.service';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
  selector: 'app-aku-worklist',
  templateUrl: './aku-worklist.component.html',
  styleUrls: ['./aku-worklist.component.scss'],
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
export class AkuWorklistComponent extends BaseComponent implements OnInit, OnDestroy {
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
  private subscription!: Subscription;
  IsBedsBoard = false;
  emrTransferAnotherDocData: any;
  emrTransferAnotherDocDataForFiltering: any;
  selectedPatient: any;
  showDocValidation: boolean = false;
  assignBed: string = "Assign Bed";
  assign: string = "Assign";
  trasnferRequests: any;
  trasnferRequests1: any;
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
  datesForm: any;
  toDate = new FormControl(new Date());
  PatientArrivedMSG : string = "";
  PatientCancelArrivedMsg: string = "";
  selectedPatientData: any;
  roomsList: any = [];
  roomsListWithoutFilter: any = [];
  groupedRoomsList: any = [];
  number = Number;
  facility: any;
  showVisualTriage: boolean = false;
  showVitalsPopup: boolean = false;
  consciousnessData: any;
  behaviourData: any;
  filterByDate: string = "orderdate";

  constructor(private config: DialysisConfigService, public datepipe: DatePipe,
    private router: Router, private appconfig: ConfigService, private fb: FormBuilder, private suitconfig: SuitConfigService, private service: AkuAppointmentService, private us: UtilityService) {
      super();
    this.groupedByDate = [];
    this.groupedByDateTransfer = [];
    this.setpatientType(1);
    this.clearuser();

    this.datesForm = this.fb.group({
      fromdate: this.FromDate,
      todate: this.ToDate,
      SSN: [''],
      MobileNo: ['']
    });
    this.remarkForm = this.fb.group({
      CMD: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.Facility = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.FacilityID = this.Facility[0].EmpSpecialisationId;
    this.HospDeptID = this.Facility[0].Hospdeptid;
    
    this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
    

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

    // this.subscription = interval(60000).subscribe(() => {
    //   this.refreshPatients();
    // });
    this.FetchTransferRequests();
    this.getConciousnessAndBehavior();
    this.GetVitalScores();
  }

  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
  }

  FetchTransferRequests() { 
    var ssn = this.datesForm.get('SSN').value;
    var fromdate = this.datepipe.transform(this.datesForm.get('fromdate').value, "dd-MMM-yyyy")?.toString();
    var todate= this.datepipe.transform(this.datesForm.get('todate').value, "dd-MMM-yyyy")?.toString();
    const mobileno = this.datesForm.get('MobileNo').value;
    this.config.FetchOPDialsisOrderWorkList(fromdate, todate, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID, ssn === '' ? '0' : ssn)
      .subscribe((response: any) => {
        if (response.Code == 200) {

          response.FetchOPDialsisOrderWorkListDataList.forEach((element: any) => {
            if ((element.IPAdmissionID==''&&element.Status!='3'&&element?.IPDischargeDate==null)||(element.IPAdmissionID=='' &&element.Status=='3'&&element?.IPDischargeDate==null))
              element.Class = "doctor_worklist mt-2 NewRequest worklist_patientcard rounded";
            else if (element?.IPAdmissionID!='' &&element?.IPDischargeDate==null)
              element.Class = "doctor_worklist mt-2 Admitted worklist_patientcard rounded";
            else if (element?.IPDischargeDate!=null)
              element.Class = "doctor_worklist mt-2 DYC worklist_patientcard rounded";            
          });

          this.trasnferRequests = this.trasnferRequests1 = response.FetchOPDialsisOrderWorkListDataList;
          this.transferRequestsCount = response.FetchOPDialsisOrderWorkListDataList.length;
          if(this.filterByDate === 'scheduledate') {
            this.trasnferRequests = this.trasnferRequests1.filter((x:any) => x.ScheduleDate !== '' && x.ScheduleDate !== null);
          }
          else if(this.filterByDate === 'notscheduled') {
            this.trasnferRequests = this.trasnferRequests1.filter((x:any) => x.ScheduleDate === '' || x.ScheduleDate === null);
          } else if (this.filterByDate === 'admitdate') {
            this.trasnferRequests = this.trasnferRequests1.filter((x:any) => x.DYCAdmitDate);
          }
          this.showTransferRequests = true;
          this.groupedByDateTransfer = this.trasnferRequests.reduce((acc: any, curr: any) => {
            let date = this.filterByDate === 'orderdate' ? curr.WeightCreateDate.split(' ')[0] : curr.ScheduleDate;
            if (this.filterByDate === 'admitdate') {
              date = curr.DYCAdmitDate;
            }
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
   
    this.config.FetchEMRConsultationOrders(this.datepipe.transform(this.FromDate, "dd-MMM-yyyy")?.toString(),
      this.datepipe.transform(this.ToDate, "dd-MMM-yyyy")?.toString(), this.doctorDetails[0].EmpId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID, this.IsTriage)
      .subscribe((response: any) => {
        this.FetchEMRConsultationOrdersDataaList = response.FetchEMRConsultationOrdersDataaList;
        if (this.patientType == 2) {
          if (this.IsDoctor == 'true')
            this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID == this.doctorDetails[0].EmpId)
          else {
            if (this.IsNurse == 'true') {
              this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID != '1162');
            }
            else {
              this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList;
            }
          }
        } else {
          if (this.IsNurse == 'true') {
            //Need to be changed later with correct filter condition.
            this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID == '1162')
          }
          if (this.FetchEMRConsultationOrdersDataaList) {
            //this. FetchEMRConsultationOrdersDataaList = this. FetchEMRConsultationOrdersDataaList.sort((a: any, b: any) => a.ConsultantID.localeCompare(b.ConsultantID));
            this.FetchEMRConsultationOrdersDataaList = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID != this.doctorDetails[0].EmpId)
          }
          this.WaitingRoom = this.FetchEMRConsultationOrdersDataaList.filter((x: any) => x.ConsultantID != this.doctorDetails[0].EmpId).length;
          // this.AdultWaitingRoom = response.FetchEMRConsultationOrdersDataacList[0]?.AdultCount;
          // this.PediaWaitingRoom = response.FetchEMRConsultationOrdersDataacList[0]?.PediaCount;
        }
        this.AdultWaitingRoom = response.FetchEMRConsultationOrdersDataacList[0]?.AdultCount;
        this.PediaWaitingRoom = response.FetchEMRConsultationOrdersDataacList[0]?.PediaCount;
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
    //this.FetchEMRConsultationOrders();
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
        this.datesForm.patchValue({
          fromdate : fromdate,
          todate : tomorrow
        });
        break;
      case 'This week':
        this.FromDate = fromdate.setDate(this.today.getDate() - 7);
        this.ToDate = tomorrow;
        this.datesForm.patchValue({
          fromdate : fromdate,
          todate : tomorrow
        });
        break;
      case 'This Month':
        this.FromDate = fromdate.setDate(this.today.getDate() - 30);
        this.ToDate = tomorrow;
        this.datesForm.patchValue({
          fromdate : fromdate,
          todate : tomorrow
        });
        break;
      case 'Three Months':
        this.FromDate = fromdate.setDate(this.today.getDate() - 90);
        this.ToDate = tomorrow;
        this.datesForm.patchValue({
          fromdate : fromdate,
          todate : tomorrow
        });
        break;
      case 'Six Months':
        this.FromDate = fromdate.setDate(this.today.getDate() - 180);
        this.ToDate = tomorrow;
        this.datesForm.patchValue({
          fromdate : fromdate,
          todate : tomorrow
        });
        break;
      case 'This Year':
        this.FromDate = fromdate.setDate(this.today.getDate() - 365);
        this.ToDate = tomorrow;
        this.datesForm.patchValue({
          fromdate : fromdate,
          todate : tomorrow
        });
        break;
      default:
        this.FromDate = fromdate.setDate(this.today.getDate() - 5000);
        this.ToDate = tomorrow;
        this.datesForm.patchValue({
          fromdate : fromdate,
          todate : tomorrow
        });
        break;
    }

    this.FetchTransferRequests();
  }

  navigateToTriageVitals(item: any) {  
    if(item.VTOrderID==''){
      this.errorMessage = 'Visual Triage not Completed';
      $('#errorMsg').modal('show');
      return;
    }  
    if (this.IsNurse == 'true') {
      sessionStorage.setItem("EmrPatientDetails", JSON.stringify(item));
      this.router.navigate(['/dialysis/aku-vitals']);
    }
    else {
      this.getPatientDetails(item);
    }    
  }
  navigateToAkuAppointment(item: any) {    
      sessionStorage.setItem("otpatient", JSON.stringify(item));
      sessionStorage.setItem("fromAkuWorklist", JSON.stringify(true));
      this.router.navigate(['/dialysis/aku-appointment']);  
  }
  navigateToAdmission(item: any) {    
    sessionStorage.setItem("otpatient", JSON.stringify(item));
    sessionStorage.setItem("fromAkuWorklist", JSON.stringify(true));
    this.router.navigate(['/admission/patientadmission']);
  }
  navigateToDayCareAdmission(item: any) {
    //Checking if previous patient's visit is discharged or not and stopping
    if(!item.IPDischargeDate) {
      const testOrderIdRows = this.trasnferRequests1.filter((x:any) => x.TestOrderID === item.TestOrderID);
      const admittedNotDischarged = testOrderIdRows.filter((x:any) => x.IPAdmissionID != '' && !x.IPDischargeDate && x.IPAdmissionID !== item.IPAdmissionID);
      if(admittedNotDischarged.length > 0) {
        this.errorMessage = 'Previous visit did not get discharged.';
        $('#errorMsg').modal('show');
        return;
      }
    }

    if(item.VTOrderID==''){
      this.errorMessage = 'Visual Triage not Completed';
      $('#errorMsg').modal('show');
      return;
    }
    sessionStorage.setItem("otpatient", JSON.stringify(item));
    sessionStorage.setItem("fromAkuWorklist", JSON.stringify(true));
    this.router.navigate(['/dialysis/daycareadmission']);
  }
  getPatientDetails(item: any) {
    // let payload = {
    //   "RegCode": item.Regcode
    // }
    // this.appconfig.getPatientDetails(payload).subscribe((response) => {
    //   if (response.Status === "Success") {
    //     sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    //     sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
    //     sessionStorage.setItem("selectedView", JSON.stringify(item));
    //     sessionStorage.setItem("selectedCard", JSON.stringify(item));
    //     sessionStorage.setItem("fromAkuWorklist", JSON.stringify(true));
    //     this.router.navigate(['/home/doctorcasesheet']);
    //   }
    // },
    //   (err) => {

    //   })
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
      "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
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
    this.filterByDate = 'orderdate';
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
      "WORKSTATIONID":  this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
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
    this.config.FetchEMRTransferAnotherDoc(this.FacilityID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
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
    this.config.FetchEMRTransferAnotherDocSpec(this.FacilityID,this.HospDeptID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
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
    this.config.SavePatientEMRPrimaryDoctorRequests(this.selectedPatient.PatientID, this.selectedPatient.AdmissionID, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, docdet.EmpID, docdet.SpecialiseID, this.selectedPatient.BillID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
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

    this.config.SavePatientEMRPrimaryDoctors(req.EMRPrimaryDoctorRequestID, req.PatientId, req.Admissionid, req.ToDoctorID, req.ToSpecialiseID, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
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
      this.config.RejectPatientEMRPrimaryDoctorRequests(this.selectedPatientToReject.AdmissionID, this.selectedPatientToReject.EMRPrimaryDoctorRequestID, remarks,this.doctorDetails[0].EmpId, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalID)
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

  fetchPatientWalkthroughInfo(pinfo:any) {
    pinfo.FullAge = pinfo.Age;
    pinfo.FromDoctor = pinfo.Consultant;
    this.patinfo = pinfo;
    $("#walkthrough_info").modal('show');
  }

  onSSNEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.FetchTransferRequests();
    }
  }

  onSSNClear() {
    this.datesForm.patchValue({
      SSN: ''
    });
    this.FetchTransferRequests();
  }

  clearTransferRequests() {
    this.datesForm.patchValue({
      fromdate : new Date(),
      todate : this.ToDate,
      SSN: '',
      MobileNo: ''
    });
    this.FetchTransferRequests();
  }

  openPatientArrivedPopUp(item: any) {
    //Checking if previous patient's visit is discharged or not and stopping
    if(!item.IPDischargeDate) {
      const testOrderIdRows = this.trasnferRequests1.filter((x:any) => x.TestOrderID === item.TestOrderID);
      const admittedNotDischarged = testOrderIdRows.filter((x:any) => x.IPAdmissionID != '' && !x.IPDischargeDate && x.IPAdmissionID !== item.IPAdmissionID);
      if(admittedNotDischarged.length > 0) {
        this.errorMessage = 'Previous visit did not get discharged.';
        $('#errorMsg').modal('show');
        return;
      }
    }

    // if(item.VTOrderID=='' && !item.IPDischargeDate) {
    //   this.errorMessage = 'Visual Triage not Completed';
    //   $('#errorMsg').modal('show');
    //   return;
    // }
    this.selectedPatientData = item;
    // if (item.Status !== null && item.Status !== '' && Number(item.Status) >= 2) {
    // }
    // else 
    if (item.IPAdmissionID === '' && item.Status !== null && item.Status !== '' && Number(item.Status) < 3 && !item.IPDischargeDate) {
      this.PatientArrivedMSG = 'Do you want to change status as Patient Arrived?';
      $("#patientArrivedConfirmationPopup").modal('show');
    } else {
      if(!item.IPDischargeDate && item.IPAdmissionID === '') {
        this.PatientArrivedMSG = 'Do you want to Cancel Patient Arrived status?';
        $("#patientArrivedConfirmationPopup").modal('show');
      }
    }
  }
  ReloadPatientArrivedStatus(){
    this.FetchTransferRequests();
  }

  ChangeRadiologyPatientArrivedStatus() {
    this.selectedPatientData.PatientArrivedClass = "collected custom_tooltip custom_tooltip_left text-center active";
    let payload = {
      "ProcOrderID": this.selectedPatientData.TestOrderID,
      "ProcOrderItemID": this.selectedPatientData.TestOrderItemID,
      "ProcedureID": this.selectedPatientData.TestID,
      "Sequence": this.selectedPatientData.Sequence,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID":  this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "Status": this.selectedPatientData.Status < 3 ? "3" : "2",
      "Remarks": "",
      "HospitalID": this.hospitalID
    }
    this.suitconfig.changePatientArrivedStatus(payload).subscribe((response) => {
      if (response.Code == 200) {
        //if (this.selectedPatientData.SampleStatus < 3)
          this.PatientCancelArrivedMsg = 'Patient Arrived Successfully';
        //if (this.selectedPatientData.SampleStatus >= 3)
          //this.PatientCancelArrivedMsg = 'Cancel Patient Arrived Successfully';
        $("#PatientArrivedMsg").modal('show');
      }
    },
      (err) => {

      })
  }

  openAkuBed() {
    const url = this.service.getData(akuwrklist.FetchOTROOMSurgeon,
      {
        DepartmentID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,UserId: this.doctorDetails[0].UserId, WorkStationID:  this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, HospitalID: this.hospitalID
      });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchBedsFromWardDataList.length > 0) {
          this.roomsList = response.FetchBedsFromWardDataList;
          this.roomsListWithoutFilter = this.roomsList;
          this.roomsList.forEach((element: any, index: any) => {
            element.selected = false;
          });
          
          // const distinctThings = this.roomsList.filter(
          //   (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.WardID === thing.WardID) === i);
          // console.dir(distinctThings);
          // this.groupedRoomsList = distinctThings
        }
        else {
          this.errorMessages = [];
          this.errorMessages.push("No slots for the selected dates");
          $("#saveDoctorAppointmentValidation").modal('show');
        }
        $("#akuBedsList").modal('show');
      },
        (err) => {
        })
  }

  filterTransferRequests(type?: any) {
    let transferRequests = [...this.trasnferRequests];
    if (type === 'admitted') {
      transferRequests = transferRequests.filter((item: any) => item.IPAdmissionID);
    } else if(type === 'new'){
      transferRequests = transferRequests.filter((item: any) => !item.IPAdmissionID);
    }
    this.groupedByDateTransfer = transferRequests.reduce((acc: any, curr: any) => {
      const date = curr.WeightCreateDate.split(' ')[0];
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

  openVisualTriage(item: any) {

   if(item.Status=='2' && !item.IPDischargeDate) {
      this.errorMessage = 'Patient not Arrived';
      $('#errorMsg').modal('show');
      return;
    }

    this.showVisualTriage = true;
    sessionStorage.setItem("otpatient", JSON.stringify(item));
    $('#visual_triage').modal('show');
  } 

  showVitalsValidation: boolean = false;
  hypertension: any;
  tableVitals: any = [];
  totalScore: any = 0;
  tableVitalHypertensionParameters: any;
  remarksSelectedIndex: number = -1;
  selectedParameter: any;
  remarkForm: any;
  remarksMap: Map<number, string> = new Map<number, string>();
  recordRemarks: Map<number, string> = new Map<number, string>();
  isSubmitted: any = false;
  remarksNotEntered: any = [];
  parameterErrorMessage: string = "";
  showRemarksMessage: boolean = false;
  showParamValidationMessage: boolean = false;
  vitalsValidation: boolean = false;
  IsAdult: boolean = false;
  consciousnessSelectionValue: any = '';
  behaviourSelectionValue: any = '';
  paramter: any;
  tableVitalsScores: any = [];

  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;

  get items(): FormArray {
    return this.remarkForm.get('items') as FormArray;
  }

  openVitalsPopup(item: any) {
    if(item.VTOrderID==''){
      this.errorMessage = 'Visual  Triage not Completed';
      $('#errorMsg').modal('show');
      return;
    }
    this.remarksMap.clear();
    this.recordRemarks.clear();
    this.showParamValidationMessage = false;
    this.showVitalsValidation = false;
    this.tableVitals = [];
    this.remarksSelectedIndex = -1;
    this.selectedPatient = item;
    this.IsAdult = Number(this.selectedPatient.AgeValue) > 14 ? true : false;
    this.showVitalsPopup = true;
    this.parameterErrorMessage = "";
    this.showRemarksMessage = false;
    $("#vitalsModal").modal('show');
    this.hypertension = "";
    this.consciousnessSelectionValue = '';
    this.behaviourSelectionValue = '';
    if (this.IsAdult) {
      this.GetVitalsParams();
    }
    this.FetchVitalHypertensionParameters();
  }

  GetVitalScores() {
    this.appconfig.fetchVitalScores(this.doctorDetails[0].UserId, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitalsScores = response.FetchVitalScoresDataList;
      } else {
      }
    },
      (err) => {

      })
  }

  getConciousnessAndBehavior() {
    this.appconfig.getConciousnessAndBehavior(sessionStorage.getItem('hospitalId'), this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID).subscribe((response) => {
      if (response.Code === 200) {
        this.consciousnessData = response.FetchConsciousnessDataList;
        this.behaviourData = response.FetchBehaviorTypesDataList;
      }
    })
  }

  onConsciousnessSelection(item: any) {
    this.tableVitals = [];
    this.consciousnessSelectionValue = item;
    this.behaviourSelectionValue = '';
    if (this.consciousnessSelectionValue && this.behaviourSelectionValue) {
      this.GetVitalsParams();
    }
  }

  onBehaviourSelection(item: any) {
    this.tableVitals = [];
    this.behaviourSelectionValue = item;
    if (this.consciousnessSelectionValue && this.behaviourSelectionValue) {
      this.GetVitalsParams();
    }
  }

  GetVitalsParams() {
    var age = this.selectedPatient.Age;
    if (this.selectedPatient.PatientType == '2' || this.selectedPatient.PatientType == '4')
      age = this.selectedPatient.AgeValue;
    else if (this.selectedPatient.PatientType == '3')
      age = age.toString().trim().split(' ')[0];
    else if (age.toString().trim().split(' ').length > 1) {
      age = age.toString().trim().split(' ')[0];
    }

    const FacilityID = this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID
    if (this.selectedPatient.PatientType === '3') {
      this.selectedPatient.AgeUoMID = this.selectedPatient.AGeUOMID;
    }
    else if (this.selectedPatient.PatientType === '2' || this.selectedPatient.PatientType === '4') {
      this.selectedPatient.AgeUoMID = this.selectedPatient.AgeUOMID;
    }
    const { GenderID, SpecialiseID } = this.selectedPatient;

    const AgeUoMID = this.selectedPatient.AgeUoMID;

    let consciousnessTypeID = 0;
    let behaviorTypeID = 0
    if (!this.IsAdult) {
      consciousnessTypeID = this.consciousnessSelectionValue?.ConsciousnessTypeID;
      behaviorTypeID = this.behaviourSelectionValue?.BehaviorTypeID ?? 0;
    }
    
    this.appconfig.getVitalsParamsSpec(this.hospitalID, SpecialiseID, FacilityID, GenderID, age, AgeUoMID, consciousnessTypeID === undefined ? 0 : consciousnessTypeID, behaviorTypeID).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitals = response.GetVitalsParamsDataSPList;
        if (this.tableVitals.length) {
          setTimeout(() => {
            if (this.inputFields && this.inputFields.first) {
              this.inputFields.first.nativeElement.focus();
            }
          }, 1000);
        } else {
          this.errorMessage = 'No Vital Parameters Found';
          $('#errorMsg').modal('show');
        }
      } else {
      }
    },
      () => {

      });
  }

  FetchVitalHypertensionParameters() {
    this.appconfig.fetchVitalHypertensionParameters(this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitalHypertensionParameters = response.FetchHypertensionParametersOutputLists;
      } else {
      }
    },
      (err) => {

      })
  }
  closeVitals() {
    this.FetchTransferRequests();
  }
  clearVitals() {
    this.tableVitals.forEach((item: any) => {
      item.PARAMVALUE = '';
      item.VitalLow = '';
      item.VitalHigh = '';
      item.Score = '';
      this.totalScore = 0;
    });
    this.hypertension = "";
  }

  openRemarks(index: any) {
    this.selectedParameter = this.tableVitals[index]
    this.remarksSelectedIndex = index;
    const itemsArray = this.remarkForm.get('items') as FormArray | null;
    if (itemsArray) {
      const selectedCMDValue = itemsArray.at(index)?.get('CMD')?.value || '';
      this.remarkForm.get('CMD')?.setValue(selectedCMDValue);
      this.isSubmitted = false;
    }
    const remarks = this.recordRemarks.get(index) || '';
    this.remarkForm.get('CMD')?.setValue(remarks);
    $("#vitalsComments").modal('show');

  }

  saveRemarks() {
    this.isSubmitted = true;
    if (this.remarkForm && this.remarkForm.valid) {
      const remark = this.remarkForm.get('CMD')?.value || '';
      this.remarksMap.set(this.remarksSelectedIndex, remark);
      this.recordRemarks.set(this.remarksSelectedIndex, remark);
      this.remarkForm.reset();
      this.isSubmitted = false;
      $('#vitalsComments').modal('hide');
    }
  }

  saveVitals(remarksSelectedIndex?: number) {
    let find = this.tableVitals.filter((x: any) => x?.PARAMVALUE === null);
    let bpsys = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP -Systolic");
    let bpdia = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP-Diastolic");
    let temp = this.tableVitals.filter((x: any) => x?.PARAMETER === "Temperature");
    let remarksEntered = true;
    this.remarksNotEntered = [];
    if (bpsys[0].PARAMVALUE === null || bpsys[0].PARAMVALUE === "" || bpdia[0].PARAMVALUE === null || bpdia[0].PARAMVALUE === "" || temp[0].PARAMVALUE === null || temp[0].PARAMVALUE === "") {
      this.showVitalsValidation = true;
    } else {
      let VsDetails: any = [];
      let outOfRangeParameters: string[] = [];
      this.tableVitals.forEach((element: any, index: any) => {

        let RST: any;
        let ISPANIC: any;
        if ((element.PARAMVALUE >= element.ALLOWUOMMINRANGE && element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE && element.PARAMVALUE <= element.ALLOWUOMMAXRANGE))
          RST = 2;
        else
          RST = 1;

        if ((!element.PARAMVALUE) && ((element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE)))
          ISPANIC = 1;
        else
          ISPANIC = 0;
        const remark = this.recordRemarks.get(index);
        if (element.PARAMVALUE !== null && element.VitalHigh || element.VitalLow) {
          outOfRangeParameters.push(element.PARAMETER);
          if (remark === undefined || remark.trim() === "") {
            this.remarksNotEntered.push({
              index,
              element
            });
            this.parameterErrorMessage = `Please enter Remarks for ${element.PARAMETER}`;
            remarksEntered = false;
          }
        }
        VsDetails.push({
          "VSPID": element.PARAMETERID,
          "VSNAME": element.PARAMETER,
          "VSGID": element.GROUPID,
          "VSGDID": element.GroupDETAILID,
          "PV": element.PARAMVALUE,
          "CMD": remark,
          "RST": RST,
          "ISPANIC": ISPANIC
        });
      });
      if (outOfRangeParameters.length > 0 && !remarksEntered) {
        this.showRemarksMessage = false;
        $("#remarks").modal('show');
        this.showParamValidationMessage = true;
        this.showVitalsValidation = false;
        return;
      }
      let payload = {
        "MonitorId": "0",
        "PatientID": this.selectedPatient.PatientID,
        "Admissionid": this.selectedPatient.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "HospitalId": this.hospitalID,
       // "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
       "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId == undefined ? this.selectedPatient.SpecialiseID : this.doctorDetails[0].EmpSpecialisationId,
        "PatientType": this.selectedView.PatientType,
        "ScheduleID": (this.selectedView.ScheduleID == "" || this.selectedView.ScheduleID == undefined) ? "0" : this.selectedView.ScheduleID,
        "VSDetails": VsDetails,
        "UserId": this.doctorDetails[0].UserId,
        "TestOrderItemID": this.selectedPatient.TestOrderItemID,
      };

      this.appconfig.SaveClinicalVitalsDYC(payload).subscribe(response => {
        if (response.Code == 200) {
          $("#saveVitalsMsg").modal('show');
          $("#vitalsModal").modal('hide');
          this.vitalsValidation = false;
          outOfRangeParameters.forEach(parameter => {
            const index = this.tableVitals.findIndex((element: any) => element.PARAMETER === parameter);
            this.recordRemarks.delete(index);
          });
          this.FetchTransferRequests();
        }
      })
      this.showParamValidationMessage = false;
    }
  }

  preventDot(event: any): void {
    if (event.key === '.') {
      event.preventDefault();
    }
  }

  checkInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (target.value.includes('.')) {
      target.value = target.value.replace(/\./g, '');
    }
  }

  checkMaxRangeValue(event: any, current_parameter: any, current_value: any, min_value: any, max_value: any, index: any) {
    current_value = parseFloat(current_value);
    min_value = parseFloat(min_value);
    max_value = parseFloat(max_value)
    this.paramter = current_parameter;
    this.tableVitals.forEach((element: any, index: any) => {
      if (element.PARAMETER == "BP -Systolic") {
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = false;
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalHigh = true;
          this.tableVitals[index].VitalLow = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else {

        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0) {
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
          element.Color = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].Color;
        }
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (element.PARAMETER == "BP-Diastolic") {
        this.tableVitals[index].VitalLow = false;
        this.tableVitals[index].VitalHigh = false;
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalHigh = true;
          this.tableVitals[index].VitalLow = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else {
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (current_parameter == "Temparature" || current_parameter == "Temperature") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else {
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        } var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }

      else if (current_parameter == "Pulse") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else {
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }

      else if (current_parameter == "SPO2") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else {
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (current_parameter == "Respiration") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else {
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      else if (current_parameter == "O2 Flow Rate") {
        if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) > parseFloat(element.NORMALMAXRANGE)) {
          if (parseFloat(element.PARAMVALUE) > parseFloat(element.ALLOWUOMMAXRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be greater than max allowed range. Max allowed range is: " + element.ALLOWUOMMAXRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = true;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else if (element.PARAMVALUE != null && element.PARAMVALUE != "" && parseFloat(element.PARAMVALUE) < parseFloat(element.NORMALMINRANGE)) {
          if (parseFloat(element.PARAMVALUE) < parseFloat(element.ALLOWUOMMINRANGE)) {
            element.PARAMVALUE = '';
            this.errorMessage = element.PARAMETER + " cannot be less than min allowed range. Min allowed range is: " + element.ALLOWUOMMINRANGE;
            $('#errorMsg').modal('show');
            return;
          }
          this.tableVitals[index].VitalLow = true;
          this.tableVitals[index].VitalHigh = false;
          this.showVitalsValidation = false;
          const remark = this.recordRemarks.get(index);
          if (remark === undefined || remark.trim() === "") {
            //this.openRemarks(index);
          }
        }
        else {
          this.tableVitals[index].VitalLow = false;
          this.tableVitals[index].VitalHigh = false;
        }
        var score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE));
        if (score.length > 0)
          element.Score = this.tableVitalsScores.filter((x: any) => x.VITALSIGNPARAMETERID == element.PARAMETERID && parseFloat(x.FromRange) <= parseFloat(element.PARAMVALUE) && parseFloat(x.ToRange) >= parseFloat(element.PARAMVALUE))[0].ScoreID;
        else element.Score = "";
        if (Number(element.Score) >= 8) {
          element.Score = "METCALL";
        }
      }
      this.totalScore = this.tableVitals.map((item: any) => (item.PARAMVALUE != null && item.Score != "" && item.Score != "METCALL") ? Number.parseInt(item.Score) : 0).reduce((acc: any, curr: any) => acc + curr, 0);
      if ((this.tableVitals[0].PARAMVALUE != null && this.tableVitals[0].PARAMVALUE != "")) {
        this.getVitalsHypertensionParameter(parseFloat(this.tableVitals[0].PARAMVALUE));
      }
    });
  }

  getVitalsHypertensionParameter(bpSys: any) {
    this.tableVitalHypertensionParameters.forEach((element: any, index: any) => {
      if (element.ParameterID == "1") {
        if (
          bpSys > parseFloat(element.SYS.split('>')[1])
          //|| bpDia > parseFloat(element.DIA.split('>')[1])
        ) {
          this.hypertension = element;
        }
      }
      else if (element.ParameterID == "5") {
        if (
          bpSys < parseFloat(element.SYS.split('<')[1])
          //||  bpDia < parseFloat(element.DIA.split('<')[1])
        ) {
          this.hypertension = element;
        }
      }
      else {
        if (
          (bpSys >= parseFloat(element.SYS.split('-')[0]) && bpSys <= parseFloat(element.SYS.split('-')[1]))
          //|| (bpDia >= parseFloat(element.DIA.split('-')[0]) && bpDia <= parseFloat(element.DIA.split('-')[1]))
        ) {
          this.hypertension = element;
        }
      }
    });
  }

  onRemarksSave() {
    let isRemarksEntered = true;
    this.remarksNotEntered.forEach((item: any) => {
      if (!this.recordRemarks.get(item.index)) {
        isRemarksEntered = false;
      }
    });
    if (isRemarksEntered) {
      this.showRemarksMessage = false;
      $("#remarks").modal('hide');
      this.saveVitals();
    } else {
      this.showRemarksMessage = true;
    }
  }

  onRemarksChange(value: any, index: any) {
    if (value.key === '.') {
      value.preventDefault();
      return;
    }
    this.recordRemarks.set(index, value);
  }
  
  filterAkuData(type: string) {
    this.filterByDate = type;
    this.FetchTransferRequests();
  }

  closeVisualTriage() {
    this.showVisualTriage =  false;
    this.FetchTransferRequests();
  }

  checkCardValidity(validityDate: any) {
    const currentDate = new Date();
    const sevenDaysBefore = new Date(validityDate);
    sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);

    if (currentDate >= sevenDaysBefore) {
      return true;
    } else {
      return false;
    }
  }
}

const akuwrklist = {
  FetchOTROOMSurgeon: 'FetchBedsFromWard?WardID=${this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID}&ConsultantID=0&Status=0&UserId=${UserId}&HospitalID=${HospitalID}',
}