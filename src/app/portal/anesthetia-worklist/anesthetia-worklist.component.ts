import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';

declare var $: any;

@Component({
  selector: 'app-anesthetia-worklist',
  templateUrl: './anesthetia-worklist.component.html',
  styleUrls: ['./anesthetia-worklist.component.scss']
})
export class AnesthetiaWorklistComponent extends BaseComponent implements OnInit {
  UnAssignedPatients = 0;
  patientType = 1;
  FromDate: any;
  ToDate: any;
  anesthesiaConsultationOrdersDataaList: any = [];
  groupedByDate: { [key: string]: any };
  IsDoctor: any;
  FetchUserFacilityDataList: any;
  facility: any;
  patinfo: any;
  pinfo: any;
  saveMsg: any;
  FetchBedsFromWardDataList: any;
  PatientsListToFilter: any = [];
  currentTimeN: Date = new Date();
  currentdateN: any;
  intervalN: any;
  location: any;
  referralAcceptRejectRemarks: string = "";
  selectedRefPatient: any;
  isRemarksSubmitted: boolean = false;
  errorMessage: any;
  unAssignedCount: number = 0;
  assignedCount: number = 0;

  constructor(private config: ConfigService, private bedconfig: BedConfig, private router: Router, private modalSvc: NgbModal) {
    super();
    this.groupedByDate = [];
    this.setpatientType(1);
  }

  startClock(): void {
    this.intervalN = setInterval(() => {
      this.currentTimeN = new Date();
    }, 1000);
  }

  ngOnInit(): void {
    this.startClock();
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.location = sessionStorage.getItem("locationName");
    this.IsDoctor = sessionStorage.getItem("IsDoctorLogin");
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.fetchUserFacility();
    //this.FetchAnesthesiaConsultationOrders();
  }

  fetchUserFacility() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalID)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserWardFacilityDataaList;
      },
        (err) => {
        })

  }

  setpatientType(type: any) {
    this.patientType = type;
    const tomorrow = new Date(this.today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.FromDate = this.today;
    this.ToDate = tomorrow;
    this.FetchAnesthesiaConsultationOrders(this.patientType);
  }

  handleTimeFrameSelection(timeFrame: string) {
    const tomorrow = new Date();
    const fromdate = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    switch (timeFrame) {
      case 'T':
        this.FromDate = fromdate;
        this.ToDate = tomorrow;
        break;
      case 'W':
        this.FromDate = fromdate.setDate(this.today.getDate() - 7);
        this.ToDate = tomorrow;
        break;
      case 'M':
        this.FromDate = fromdate.setDate(this.today.getDate() - 30);
        this.ToDate = tomorrow;
        break;
      case '3M':
        this.FromDate = fromdate.setDate(this.today.getDate() - 90);
        this.ToDate = tomorrow;
        break;
      case '6M':
        this.FromDate = fromdate.setDate(this.today.getDate() - 180);
        this.ToDate = tomorrow;
        break;
      case '1Y':
        this.FromDate = fromdate.setDate(this.today.getDate() - 365);
        this.ToDate = tomorrow;
        break;
      default:
        this.FromDate = fromdate.setDate(this.today.getDate() - 5000);
        this.ToDate = tomorrow;
        break;
    }
    this.FetchAnesthesiaConsultationOrders(this.patientType);
    //this.FetchEMRConsultationOrders();
  }

  getKeys(object: object): string[] {
    return Object.keys(object);
  }

  fetchPatientWalkthroughInfo(pinfo: any) {
    pinfo.FullAge = pinfo.Age;
    pinfo.FromDoctor = pinfo.Consultant;
    this.patinfo = pinfo;
    $("#walkthrough_info").modal('show');
  }

  clearPatientInfo() {
    this.pinfo = "";
    this.patinfo = "";
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

  FetchAnesthesiaConsultationOrders(patientType: any) {
    this.config.FetchAnesthesiaPatientDetailsN(moment(this.FromDate).format('DD-MMM-YYYY'), moment(this.ToDate).format('DD-MMM-YYYY'), this.doctorDetails[0].EmpId,
      this.doctorDetails[0].EmpSpecialisationId, this.doctorDetails[0].UserId, this.hospitalID)
      .subscribe((response: any) => {
        this.anesthesiaConsultationOrdersDataaList = response;
        this.unAssignedCount = this.anesthesiaConsultationOrdersDataaList.filter((x:any) => x.AnesthesiaDoctorID === '').length;
        this.assignedCount = this.anesthesiaConsultationOrdersDataaList.filter((x:any) => x.AnesthesiaDoctorID !== '').length;
        if(this.patientType === 2) {
          this.anesthesiaConsultationOrdersDataaList = this.anesthesiaConsultationOrdersDataaList.filter((x:any) => x.AnesthesiaDoctorID !== '');
        }
        else if(this.patientType === 1) {
          this.anesthesiaConsultationOrdersDataaList = this.anesthesiaConsultationOrdersDataaList.filter((x:any) => x.AnesthesiaDoctorID === '');
        }
        this.PatientsListToFilter = this.anesthesiaConsultationOrdersDataaList;

        this.groupedByDate = this.anesthesiaConsultationOrdersDataaList.reduce((acc: any, curr: any) => {
          const date = curr.Orderdate.split(' ')[0];
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

  filterChangeData(event: any) {
    if (event.length === 0) {
      this.anesthesiaConsultationOrdersDataaList = this.PatientsListToFilter;
    }
    else if (event.length > 2) {
      let filteredresponse = this.PatientsListToFilter.filter((x: any) => (x?.SSN.includes(event) || x?.PatientName.toLowerCase().includes(event.toLowerCase())));
      this.anesthesiaConsultationOrdersDataaList = filteredresponse;
    }

    this.groupedByDate = this.anesthesiaConsultationOrdersDataaList.reduce((acc: any, curr: any) => {
      const date = curr.orderDate.split(' ')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(curr);
      return acc;
    }, {});
  }

  navigateToCasesheet(item: any) {
    if(item.AnesthesiaDoctor !== '') {
      sessionStorage.setItem("PatientDetails", JSON.stringify(item));
      sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
      sessionStorage.setItem("selectedView", JSON.stringify(item));
      sessionStorage.setItem("selectedCard", JSON.stringify(item));
      sessionStorage.setItem("fromAnesthesiaWorklist", "true");
      this.router.navigate(['/home/doctorcasesheet']);
    }
  }

  preventDot(event: any): void {
    if (event.key === '.') {
      event.preventDefault();
    }
  }

  clearRefRemarks() {
    this.referralAcceptRejectRemarks = "";
  }

  openAcceptAnesthsiaRefRemarks(item:any) {
    this.selectedRefPatient = item;
    $("#acceptRejectRemarks").modal('show');
  }

  acceptAnesthsiaRefPatient(pat: any) {
    // if(this.referralAcceptRejectRemarks === '') {
    //   this.isRemarksSubmitted = true;
    //   return;
    // }
    // else {
    //   this.isRemarksSubmitted = false;
    // }
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.config.UpdateAnesthesiaReferredtoMe(pat.ReferralOrderID, pat.AdmissionID, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId,
          this.referralAcceptRejectRemarks==''?'Accepted':this.referralAcceptRejectRemarks, 0, 2, this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
          this.hospitalID).subscribe(response => {
            if (response.Code == 200) {
              this.saveMsg = "Accepted Successfully";
              $("#acceptRejectRemarks").modal('hide');
              $("#saveConsultanceMsg").modal('show');
            }
          })
      }
      modalRef.close();
    });
    

  }

  getSSNSearch(key: any) {

  }

  GoBackToHome() {
    this.router.navigate(['/login/doctor-home'])
  }

  onLogout() {
    this.config.onLogout();
  }
  

}
