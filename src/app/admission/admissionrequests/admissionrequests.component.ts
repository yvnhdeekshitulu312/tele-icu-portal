import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { AdmissionrequestService } from './admissionrequest.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientfolderComponent } from 'src/app/shared/patientfolder/patientfolder.component';
import { PatientfoldermlComponent } from 'src/app/shared/patientfolderml/patientfolderml.component';

declare var $: any;
export const MY_FORMATS = {
  parse: {
    dateInput: 'dd-MMM-yyyy HH:mm:ss',
  },
  display: {
    dateInput: 'DD-MMM-yyyy',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'dd-MMM-yyyy',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'app-admissionrequests',
  templateUrl: './admissionrequests.component.html',
  styleUrls: ['./admissionrequests.component.scss'],
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
export class AdmissionrequestsComponent extends BaseComponent implements OnInit {
  datesForm: any;
  url: any;
  toDate = new FormControl(new Date());
  totalCount: any = 1;
  currentPage: any = 1;
  showNoRecFound: boolean = true;
  FetchAdmissionRequestsDataList: any = [];
  selectedPatientID: string = "0";
  multiplePatients: any;
  showPatientNotSelectedValidation = false;
  sortedGroupedByAdmitDate: any;
  showPatientSummaryinPopUp = false;
  fromCoordinatorWorklist: boolean = false;

  constructor(private router: Router, private us: UtilityService, private service: AdmissionrequestService, public formBuilder: FormBuilder, public datepipe: DatePipe, private modalService: NgbModal) {
    super();
    this.service.param = {
      ...this.service.param,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID
    };

    var wm = new Date();
    var d = new Date();
    wm.setDate(wm.getDate() - 1);


    this.datesForm = this.formBuilder.group({
      fromdate: wm,
      todate: this.toDate.value,
      SSN: ['']
    });

    this.fromCoordinatorWorklist = sessionStorage.getItem("fromCoordinatorWorklist") === "true" ? true : false;
    if(this.fromCoordinatorWorklist) {
      const patDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
      let SSN = patDetails?.SSN;
      this.selectedPatientID = patDetails?.PatientID;
      $("#txtSsn").val(SSN);
      let fromdate = new Date();
      fromdate.setMonth(fromdate.getMonth() - 1);
      let todate = new Date();
      todate.setMonth(todate.getMonth() + 1);
      this.datesForm.patchValue({
        SSN,
        fromdate,
        todate
      });
    }

   }

  ngOnInit(): void {
    this.FetchAdmisionRequests();
  }

  searchAdmissionRequests() {
    if($("#txtSsn").val() != '') {
      var ssn = $("#txtSsn").val();
      this.fetchPatientDetails(ssn, "0", "0")
    }
    else {
      this.FetchAdmisionRequests();
    }
  }
  FetchAdmisionRequests() {
    
    const fromDate = this.datesForm.get('fromdate').value;
    const todate = this.datesForm.get('todate').value;
    if (fromDate !== null && fromDate !== undefined) {
      this.service.param.FromDate = this.datepipe.transform(fromDate, "dd-MMM-yyyy")?.toString() ?? '';
    }

    if (todate !== null && todate !== undefined) {
      this.service.param.ToDate = this.datepipe.transform(todate, "dd-MMM-yyyy")?.toString() ?? '';
    }

    if(this.selectedPatientID != "0") {
      this.service.param.PatientID = this.selectedPatientID;
    }

    this.url = this.service.getData(admissionrequests.FetchPatientAdviceforAdmissions);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {          
          this.FetchAdmissionRequestsDataList = response.AdmissionRequestsDataList;
          if (this.FetchAdmissionRequestsDataList.length > 0) {
            this.showNoRecFound = false;
            const groupedByAdmitDate = this.FetchAdmissionRequestsDataList.reduce((acc: any, current: any) => {
              const admitDate = current.AdmitDate;
              if (!acc[admitDate]) {
                acc[admitDate] = [];
              }
              acc[admitDate].push(current);
            
              return acc;
            }, {});


            this.sortedGroupedByAdmitDate = Object.entries(groupedByAdmitDate)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([admitDate, items]) => ({ admitDate, items }));

            this.sortedGroupedByAdmitDate.forEach((element: any) => {
              element.items = element.items.sort((a:any, b:any) => a.IPAdmissionID - b.IPAdmissionID);
            });

          }
          else {
            this.showNoRecFound = true;
          }
        }
      },
        (err) => {

        })
  }

  viewselectItemForPatient(item: any) {
    
  }

  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.FetchAdmisionRequests();
    }
  }
  onEnterChange() {   
      this.FetchAdmisionRequests();    
  }

  navigateToPatientAdmissions(item:any) {
    sessionStorage.setItem("selectedPatientForAdmission", JSON.stringify(item));  
    sessionStorage.removeItem("fromAdmissionWorklist");
    sessionStorage.setItem("fromAkuWorklist", "false");     
    this.router.navigate(['/admission/patientadmission']);
  }

  clearAdmissionRequests() {
    this.datesForm.patchValue({
      fromdate: new Date(),
      todate: new Date()
    });
    $("#txtSsn").val('');
    this.FetchAdmisionRequests();
  }

  onSSNEnterPress(event: any) {
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

  fetchPatientDetails(ssn: string, mobileno: string, patientId: string) {
    this.url = this.service.fetchData(admissionrequests.fetchPatientDataBySsn, {
      SSN: ssn,
      PatientID: patientId,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId,
      WorkStationID: this.facilitySessionId,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatientDataCCList.length > 1) {
            this.multiplePatients = response.FetchPatientDataCCList;
            $("#divMultiplePatients").modal('show');
          }
          else {
            this.selectedPatientID = response.FetchPatientDataCCList[0].PatientID;
            this.FetchAdmisionRequests();
          }
          //this.showNoRecFound = false;          
        }
      },
        (err) => {

        })
  }

  fetchSelectedPatientPrescription() {
    $("#divMultiplePatients").modal('hide');
  }

  selectPatient(pat: any) {
    this.selectedPatientID = pat.PatientID;
    this.multiplePatients.forEach((element: any, index: any) => {
      if (element.PatientID === pat.PatientID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
  }

  openPatientSummary(item: any) {   
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));   
    item.Bed=item.BedName;
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
    sessionStorage.setItem("PatientID", item.PatientID);
    sessionStorage.setItem("fromAdmissionRequest", "true");
    this.router.navigate(['/shared/patientfolder']);
  }
  openPatientSummary1(item: any, event: any) {
    event.stopPropagation();
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));   
    item.Bed=item.BedName;
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
    sessionStorage.setItem("PatientID", item.PatientID);
    sessionStorage.setItem("SummaryfromCasesheet", "true");

    const options: NgbModalOptions = {
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.open(PatientfoldermlComponent, options);
    modalRef.componentInstance.readonly = true;
  }
  closePatientSummaryPopup() {
    $("#pateintFolderPopup").modal("hide");
    setTimeout(() => {
      this.showPatientSummaryinPopUp = false;
    }, 1000);
  }

  navigateBackToCoordinatorWorklist() {
      sessionStorage.removeItem('fromCoordinatorWorklist');
      sessionStorage.removeItem('PatientDetails');
      this.router.navigate(['/shared/coordinatorWorklist']);
  }
}

export const admissionrequests = {
  FetchPatientAdviceforAdmissions: 'FetchPatientAdviceforAdmissions?FromDate=${FromDate}&Todate=${ToDate}&PatientID=${PatientID}&HospitalID=${HospitalID}',
  fetchPatientDataBySsn: 'FetchPatientDataC?SSN=${SSN}&MobileNO=${MobileNO}&PatientId=${PatientId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};
