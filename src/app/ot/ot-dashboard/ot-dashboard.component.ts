import { DatePipe } from '@angular/common';
import { Component, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UtilityService } from 'src/app/shared/utility.service';
import { OtDashboardService } from './ot-dashboard.service';
import { otDetails } from './urls';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { map } from 'rxjs';
import { Router } from '@angular/router';
import * as moment from 'moment';
import * as dayjs from 'dayjs';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SurgicalSafetyChecklistComponent } from '../surgical-safety-checklist/surgical-safety-checklist.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { PreAnestheticEvalutionRecordComponent } from 'src/app/templates/pre-anesthetic-evalution-record/pre-anesthetic-evalution-record.component';
import { AnesthesiaConsciousComponent } from 'src/app/templates/anesthesia-conscious/anesthesia-conscious.component';
import { OperationTheatreMinorSurgeryComponent } from 'src/app/templates/operation-theatre-minor-surgery/operation-theatre-minor-surgery.component';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { HostListener } from '@angular/core';

declare var $: any;
@Component({
  selector: 'app-ot-dashboard',
  templateUrl: './ot-dashboard.component.html',
  styleUrls: ['./ot-dashboard.component.scss'],
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
export class OtDashboardComponent extends BaseComponent implements OnInit {
  imageUrl = 'assets/images/Human-body-male.png';
  selected: any;
  alwaysShowCalendars = true;
  ranges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    'Last 6 Months': [moment().subtract(6, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  }
  invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];

  isInvalidDate = (m: moment.Moment) =>  {
    return this.invalidDates.some(d => d.isSame(m, 'day') )
  }

  datesForm: any;
  url = '';
  SurgeryRequestsDataList: any = [];
  surgeryRequestsforFilter: any = [];
  groupedResponses: { datetime: string; items: any[] }[] = [];
  showNoRecFound: boolean = true;
  assignAnesthetistForm: any;
  anesthetistList: any;
  selectedSurReqToAssignAnesthetist: any = [];
  selectedSurReqToOpIpMerge: any = [];
  showAnesthetistValidation = false;
  surgeryScheduleSsrsList : any = [];
  surgeryScheduleSsrsForm: any;
  SurgeryRequestsAnnotationDataList: any = [];
  annotationDataList: any = [];
  showResultsinPopUp: boolean = false;
  ValidationMsg: any="No OR Appointments for the Day";
  filterByDate: string = "orderdate";
  errorMsg = "";
  selectedOtPatient: any;
  number = Number;
  cancelRemarksValidation: boolean = false;
  nationalID: any;
  fromCoordinatorWorklist: boolean = false;
  constructor(private service: OtDashboardService, private elementRef: ElementRef, private us: UtilityService, private formbuilder: FormBuilder,private changeDetectorRef: ChangeDetectorRef, 
    public datepipe: DatePipe, public router: Router, private modalService: GenericModalBuilder, private config: BedConfig) {
    super();
    this.assignAnesthetistForm = this.formbuilder.group({
      AnesthetistID: ['']
    });
    
    this.surgeryScheduleSsrsForm = this.formbuilder.group({
      fromdate: [''],
      todate: ['']
    });
    var d = new Date();
    var vm = new Date();
    vm.setDate(vm.getDate() - 2);
    this.surgeryScheduleSsrsForm.patchValue({
      fromdate: vm,
      todate: d
    });
  }

  ngOnInit(): void {
    var wm = new Date();
    var d = new Date();
    wm.setDate(wm.getDate() - 1);


    this.datesForm = this.formbuilder.group({
      FromDate: wm,
      ToDate: new Date(),
      SSN: [''],
    });

    if (sessionStorage.getItem('navigateToDashboard')) {
      const SSN = sessionStorage.getItem('navigateToDashboard');
      let FromDate = new Date();
      FromDate.setMonth(FromDate.getMonth() - 1);
      this.datesForm.patchValue({
        SSN,
        FromDate
      });
      sessionStorage.removeItem('navigateToDashboard');
    }

    this.fromCoordinatorWorklist = sessionStorage.getItem("fromCoordinatorWorklist") === "true" ? true : false;
    if(this.fromCoordinatorWorklist) {
      const patDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
      let SSN = patDetails?.SSN;
      let FromDate = new Date();
      FromDate.setMonth(FromDate.getMonth() - 1);
      let ToDate = new Date();
      ToDate.setMonth(ToDate.getMonth() + 1);
      this.datesForm.patchValue({
        SSN,
        FromDate,
        ToDate
      });
    }

    if (sessionStorage.getItem('fromCoordinatorWorklist')) {
      
    }

    this.fetchotdetails();


    // AUTO OREIENT TOOLTIP
    const tooltipContainer = this.elementRef.nativeElement.querySelector('.tooltip-container');
    if (tooltipContainer) {
      tooltipContainer.addEventListener('mouseenter', () => this.showTooltip());
      tooltipContainer.addEventListener('mouseleave', () => this.hideTooltip());
    }

    this.alwaysShowCalendars = true;
  }

  choosedDate(event:any) {
    var dateval = event.target.value;
    console.log(event)
  }

  showTooltip(): void {
    const tooltip = this.elementRef.nativeElement.querySelector('.tooltip-text');
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    
    if (window.innerHeight - rect.bottom < tooltip.offsetHeight + 20) {
      tooltip.classList.remove('bottom');
      tooltip.classList.add('top');
    } else {
      tooltip.classList.remove('top');
      tooltip.classList.add('bottom');
    }
    
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';
  }

  hideTooltip(): void {
    const tooltip = this.elementRef.nativeElement.querySelector('.tooltip-text');
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
  }
  // AUTO OREIENT TOOLTIP END

 

  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.fetchotdetails();
    }
  }
  onchangeScanDrug() {
    this.onEnterChange();
  }
  onEnterChange() {
    this.fetchotdetails();
  }
  onNationalIDEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.onEnterChange();
      this.changeDetectorRef.detectChanges();
    }
  }

  fetchotdetails() {
    const fromdate = this.datepipe.transform(this.datesForm.value['FromDate'], 'dd-MMM-yyyy')?.toString();
    const todate = this.datepipe.transform(this.datesForm.value['ToDate'], 'dd-MMM-yyyy')?.toString();


    var SSNN = this.datesForm.get('SSN').value ? this.datesForm.get('SSN').value : 0;
    this.url = this.service.getData(otDetails.fetch, { FromDate: fromdate, ToDate: todate, SSN: SSNN });
    this.us.get(this.url)
      .pipe(
        map((response: any) => {
          if (response.Code === 200) {
            this.surgeryRequestsforFilter = response.SurgeryRequestsDataList;
            this.SurgeryRequestsAnnotationDataList = response.SurgeryRequestsAnnotationDataList;
            const grouped = this.groupByDate(response.SurgeryRequestsDataList);
            return grouped;
          }
          return [];
        })
      )
      .subscribe((groupedResponses: { date: string; items: any[] }[]) => {
        this.SurgeryRequestsDataList = groupedResponses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.SurgeryRequestsDataList = this.SurgeryRequestsDataList.sort((a:any, b:any) => Number(b.SurgeryRequestid) - Number(a.SurgeryRequestid))
        if (this.SurgeryRequestsDataList.length > 0) {
          this.showNoRecFound = false;
        }
        else {
          this.showNoRecFound = true;
        }
      },
        (err) => {
        });
  }

  filterSurgeryRequests(type: string,TypeName:string) {
    this.SurgeryRequestsDataList = [];
    $("#ssn").val('');
    // this.datesForm = this.formbuilder.group({
    //   FromDate: new Date(),
    //   ToDate: new Date(),
    //   SSN: [''],
    // });
    this.selectedSurReqToAssignAnesthetist = [];
    //this.fetchotdetails();
    
    this.SurgeryRequestsDataList = this.surgeryRequestsforFilter.filter((x: any) => x.STATUSID === type);
    this.SurgeryRequestsDataList = this.groupByDate(this.SurgeryRequestsDataList);

    if (this.SurgeryRequestsDataList.length > 0) {
      this.showNoRecFound = false;
    }
    else {
      this.ValidationMsg='No '+TypeName+' Appointments for the Day';
      this.showNoRecFound = true;
    }

  }

  private groupByDate(data: any[]): { date: string; items: any[] }[] {
    return data.reduce((acc, response) => {
      const dateOnly = this.getDateOnly(this.filterByDate === 'orderdate' ? response.CREATEDATE : response.ScheduleDate);
      console.log('Processing date:', dateOnly);
      const existingGroup = acc.find((group: any) => group.date === dateOnly);

      if (existingGroup) {
        existingGroup.items.push(response);
      } else {
        acc.push({ date: dateOnly, items: [response] });
      }

      return acc;
    }, []);
  }

  private getDateOnly(datetime: string): string {
    const dateObject = new Date(datetime);
    const year = dateObject.getFullYear();
    const month = ('0' + (dateObject.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObject.getDate()).slice(-2);
    return `${month}/${day}/${year}`;
  }

  navigateToDoctorAppointment(item: any) {
    sessionStorage.setItem("otpatient", JSON.stringify(item));
    $("#quickaction_info").modal('hide');
    this.router.navigate(['/ot/ot-doctorappointments']);
  }
  navigateToPreoperativeChecklist(item: any) {
    $("#quickaction_info").modal('hide');
    if(Number(item.STATUSID) < 4) {
      $("#validationMsg").modal('show');
      return;
    }
    sessionStorage.setItem("otpatient", JSON.stringify(item));
    this.router.navigate(['/shared/pre-op-checklist']);
  }

  navigateToSurgeryNotes(item: any) {
    $("#quickaction_info").modal('hide');
    if(Number(item.STATUSID) < 4) {
      $("#validationMsg").modal('show');
      return;
    }
    sessionStorage.setItem("otpatient", JSON.stringify(item));
    this.router.navigate(['/ot/ot-surgerynotes']);
  }

  navigateToSurgeryRecord(item: any) {
    $("#quickaction_info").modal('hide');
    if(Number(item.STATUSID) < 4) {
      $("#validationMsg").modal('show');
      return;
    }
    sessionStorage.setItem("otpatient", JSON.stringify(item));
    this.router.navigate(['/ot/surgeryrecord']);
  }

  navigateToSurgicalSafetyChecklist(item: any) {
    $("#quickaction_info").modal('hide');
    if(Number(item.STATUSID) < 4) {
      $("#validationMsg").modal('show');
      return;
    }
    sessionStorage.setItem("otpatient", JSON.stringify(item));
    this.router.navigate(['/ot/surgical-safety-checklist']);
  }

  navigateToPatientEforms(item: any) {
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("PatientID", JSON.stringify(item.PatientID));
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("fromOrDashboard", "true");
    sessionStorage.setItem("ssnEForms", item.SSN);
    //sessionStorage.removeItem("otpatient");
 
    $("#quickaction_info").modal('hide');
    this.router.navigate(['/shared/patienteforms'], { state: { ssn: item.SSN } });
  }

  clearViewScreen() {
    this.SurgeryRequestsDataList = [];
    $("#ssn").val('');
    var wm = new Date();
    var d = new Date();
    wm.setDate(wm.getDate() - 1);
    this.datesForm = this.formbuilder.group({
      FromDate: wm,
      ToDate: new Date(),
      SSN: [''],
    });
    this.selectedSurReqToAssignAnesthetist = [];
    this.fetchotdetails();
  }

  openAssignAnesthetist(item: any) {
    this.selectedSurReqToAssignAnesthetist = item;
    this.url = this.service.getData(otDetails.FetchOTANAESTHESIA, { UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.anesthetistList = response.FetchOTANAESTHESIADataList;
        }
      },
        (err) => {
        });
    $("#assignAnesthetist").modal('show');
  }

  openOpIpMerge(item: any) {
    this.selectedSurReqToOpIpMerge = item;
    $("#opipMerge").modal('show');
  }
  mergeOpToIP() {    
    var payload = {
      "SurgeryRequestID": this.selectedSurReqToOpIpMerge.SurgeryRequestid,
      "AdmissionID": this.selectedSurReqToOpIpMerge.IPAdmissionID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": 3395,//this.facilitySessionId ?? this.service.param.WorkStationID, 
      "HospitalID": this.hospitalID
    }
    this.us.post(otDetails.ConversionOPtoIPforsurgeryRecord, payload)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          $("#opipMerge").modal('hide');
          $("#opipMergeSaveMsg").modal('show');
        }
      },
        (err) => {

        })
  }
  selectAnesthetist(ana:any) {
    this.anesthetistList.forEach((element:any, index:any) => {
      if(element.EmpID === ana.EmpID) {
        element.selected = true;
        this.showAnesthetistValidation = false;
      }
      else 
        element.selected = false;
    });
  }

  assignAnesthetist() {
    var find = this.anesthetistList.find((x:any) => x.selected);
    if(find) {
    var payload = {
      "SurgeryRequestID": this.selectedSurReqToAssignAnesthetist.SurgeryRequestid,
      "ANESTHESIOLOGISTID": find.ServiceDocID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": 3395,//this.facilitySessionId ?? this.service.param.WorkStationID, 
      "HospitalID": this.hospitalID
    }
    this.us.post(otDetails.UpdateAssignAnesthesian, payload)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          $("#assignAnesthetist").modal('hide');
          $("#asnesthetistAssignedMsg").modal('show');
        }
      },
        (err) => {

        })
      }
      else {
       this.showAnesthetistValidation = true; 
      }
  }

  clearAssignAnesthetist() {
    this.anesthetistList.forEach((element:any, index:any) => {
        element.selected = false;
    });
  }

  clearSurgerySSRS() {
    var d = new Date();
    var vm = new Date();
    vm.setMonth(vm.getMonth() - 1);
    this.surgeryScheduleSsrsForm.patchValue({
      fromdate: vm,
      todate: d
    });
    this.fetchSurgerySchedulesSSRS();
  }

  fetchSurgerySchedulesSSRS() {
    const fromdate = this.datepipe.transform(this.surgeryScheduleSsrsForm.value['fromdate'], 'dd-MMM-yyyy')?.toString();
    const todate = this.datepipe.transform(this.surgeryScheduleSsrsForm.value['todate'], 'dd-MMM-yyyy')?.toString();
    this.url = this.service.getData(otDetails.FetchSurgerySchedulesSSRS, {
      FromDate: fromdate,
      ToDate: todate,
      OTRoomID: 0,
      DoctorID: 0,
      USERID: this.doctorDetails[0].UserId,
      WORKSTATIONID: 3392,//this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.surgeryScheduleSsrsList = response.FetchSurgerySchedulesSSRSDataList;
          $("#SurgerySchedulesSSRS").modal('show');
        }
      },
        (err) => {
        })
  }

  navigateToORCharges(item: any) {
    sessionStorage.setItem("otpatient", JSON.stringify(item));
    $("#quickaction_info").modal('hide');
    this.router.navigate(['/ot/or-charges']);
  }

  navigateToORNurses(item: any) {
    sessionStorage.setItem("otpatient", JSON.stringify(item));
    $("#quickaction_info").modal('hide');
    this.router.navigate(['/ot/or-nurses']);
  }

  getImage(item: any) {
    $("#modalHumanBody").modal('show');
    this.imageUrl = 'assets/images/Human-body-male.png';
    this.annotationDataList = this.SurgeryRequestsAnnotationDataList.filter((x:any) => x.SurgeryRequestID === item.SurgeryRequestid);
    if (item.GenderID === "2")
      this.imageUrl = 'assets/images/Human-body-female.png';
  }

  navigateToPreAnesthetic(item: any) {
    
    sessionStorage.setItem("otpatient", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    $("#quickaction_info").modal('hide');
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass : 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(PreAnestheticEvalutionRecordComponent, {
      data: item,
      readonly: true
    }, options);
  }
  navigateToAnestheticConscious(item: any) {
    sessionStorage.setItem("otpatient", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    $("#quickaction_info").modal('hide');
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass : 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(AnesthesiaConsciousComponent, {
      data: item,
      readonly: true
    }, options);
  }

  navigateToOtMinorSurgeryForm(item: any) {
    sessionStorage.setItem("otpatient", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    $("#quickaction_info").modal('hide');
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass : 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(OperationTheatreMinorSurgeryComponent, {
      data: item,
      readonly: true
    }, options);
  }

  navigateToDoctorCasesheet(item: any) {
    $("#quickaction_info").modal('hide');
    if(item.WardID === '') {
      this.errorMsg = "Patient not yet admitted";
      $("#errorMsg").modal('show');
      return;
    }    
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalID)
      .subscribe((response: any) => {
        const FetchUserFacilityDataList = response.FetchUserFacilityDataList;        
        const selectedItem = FetchUserFacilityDataList.find((value: any) => value.FacilityID === item.WardID.toString());
        sessionStorage.setItem("facility", JSON.stringify(selectedItem));
        this.getWardPatientData(item);        
      },
        (err) => {
        })

  }

  getWardPatientData(item: any) {
    this.config.fetchBedsFromWard(item.WardID, 0, 3, this.doctorDetails[0].EmpId, this.hospitalID, false)
      .subscribe((response: any) => {
        const wardPatientData = response.FetchBedsFromWardDataList.find((x:any) => x.PatientID === item.PatientID);
        if(wardPatientData) {
          sessionStorage.setItem("InPatientDetails", JSON.stringify(wardPatientData));
          sessionStorage.setItem("PatientDetails", JSON.stringify(wardPatientData));
          sessionStorage.setItem("selectedView", JSON.stringify(wardPatientData));
          sessionStorage.setItem("selectedCard", JSON.stringify(wardPatientData));
          sessionStorage.setItem("selectedPatientAdmissionId", wardPatientData.IPID);
          sessionStorage.setItem("fromOtDashboard", "true");
          this.router.navigate(['/home/doctorcasesheet']);
        }
        else {
          this.errorMsg = "Patient not in the ward";
          $("#errorMsg").modal('show');
        }
      },
      (err) => {
      })
  }

  openResultsPopup(item: any) {   
    $("#quickaction_info").modal('hide'); 
    item.RegCode = item.UHIDNO;
    item.PatientType = item.patienttype;
    sessionStorage.setItem("FromCaseSheet", "false");
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    this.showResultsinPopUp = true;
    $("#viewResults").modal("show");
}

filterOtDetails(type: string) {
  this.filterByDate = type;
  this.fetchotdetails();
}

openORtooltip(item:any){
  this.selectedOtPatient = item
}

openPatientSummary(item: any) {
  $("#quickaction_info").modal('hide'); 
  sessionStorage.setItem("PatientDetails", JSON.stringify(item));
  sessionStorage.setItem("selectedView", JSON.stringify(item));
  sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
  sessionStorage.setItem("PatientID", item.PatientID);
  sessionStorage.setItem("fromOtDashboard", "true");
  this.router.navigate(['/shared/patientfolder']);
}

cancelSurgeryRequest(item: any) {
  this.selectedOtPatient = item;
  $("#cancelSurgeryRequestConfirmationPopup").modal("show");
}

showRemarksForSurgeryCancel() {
  $("#cancel_remarks").modal('show');
}

clearRemarks() {
  $("#cancel_remarks_text").val('');
}

saveCancelSurgeryRequest() {

  if($("#cancel_remarks_text").val() === '') {
    this.cancelRemarksValidation = true;
    return;
  }
  else {
    this.cancelRemarksValidation = false;
  }

  var payload = {
    "SurgeryRequestID": this.selectedOtPatient.SurgeryRequestid,
    "CancelledStatus": "1",
    "CancelRemarks": $("#cancel_remarks_text").val(),
    "CancelledAckRemarks": "",    
    "UserID": this.doctorDetails[0].UserId,
    "WorkStationID": this.doctorDetails[0].FacilityId,  
    "HospitalID": this.hospitalID
}
this.us.post(otDetails.UpdateSurgeryRequestCancellations, payload)
      .subscribe((response: any) => {
        if (response.Status === "Success") {
          $("#cancel_remarks").modal('hide');
          $("#cancelSurgeryReqSaveMsg").modal('show');
        }
      },
        (err) => {

        })

}

  navigateBackToCoordinatorWorklist() {
    sessionStorage.removeItem('fromCoordinatorWorklist');
    sessionStorage.removeItem('PatientDetails');
    this.router.navigate(['/shared/coordinatorWorklist']);
  }

}
