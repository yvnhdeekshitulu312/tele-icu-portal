import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { MedicalCertificateService } from './medical-certificate.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TemplateLiteral } from '@angular/compiler';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  selector: 'app-medical-certificate',
  templateUrl: './medical-certificate.component.html',
  styleUrls: ['./medical-certificate.component.scss'],
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
export class MedicalCertificateComponent extends BaseComponent implements OnInit {
  facility: any;
  patientVisits: any;
  isdetailShow = false;
  IsFromBedsBoard: any;
  FromCaseSheet: any;
  SelectedViewClass: any;
  medCertTemplates: any;
  reportStatus: any;
  medicalCertificateForm!: FormGroup;
  viewMedCertForm!: FormGroup;
  htmlContent: any;
  errorMessages: any[] = [];
  viewMedCertificatesList: any;
  selectedViewMedCert: any;
  showViewValidationMsg = false

  constructor(private us: UtilityService, public formBuilder: FormBuilder, private service: MedicalCertificateService, private router: Router, private datePipe: DatePipe, private modalSvc: NgbModal) {
    super();

    this.medicalCertificateForm = this.formBuilder.group({
      MedicalCertificationID: ['0'],
      VisitID: ['0'],
      ReportStatus: ['0'],
      MedicalCertTemplate: ['0'],
      htmlContent: ['']
    });

    this.viewMedCertForm = this.formBuilder.group({
      fromdate: [''],
      todate: ['']
    });

    var d = new Date();
    d.setDate(d.getDate() + 1);
    var vm = new Date();
    vm.setMonth(vm.getMonth() - 1);
    this.viewMedCertForm.patchValue({
      fromdate: vm,
      todate: d
    });

  }

  ngOnInit(): void {
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.IsFromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;
    this.FromCaseSheet = sessionStorage.getItem("navigateFromCasesheet") === "true" ? true : false;
    if (this.selectedView.PatientType == "2") {
      if (this.selectedView?.Bed.includes('ISO'))
        this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
      else
        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }
    this.fetchPatientVisits();
    this.fetchReportStatus();
    this.fetchMedicalCertificateTemplates();
  }

  isdetailShows() {
    this.isdetailShow = true;
    if (this.isdetailShow = true) {
      $('.patient_card').addClass('maximum')
    }
  }
  isdetailHide() {
    this.isdetailShow = false;
    if (this.isdetailShow === false) {
      $('.patient_card').removeClass('maximum')
    }
  }

  fetchPatientVisits() {
    const url = this.service.getData(medicalcertificate.FetchPatientVisits, { Patientid: this.selectedView.PatientID, WorkStationID: this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, HospitalID: this.hospitalID });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientVisits = response.PatientVisitsDataList;
          setTimeout(() => {
            this.medicalCertificateForm.patchValue({
              VisitID: this.selectedView.AdmissionID
            })
          }, 1000)
        }
      },
        (err) => {
        })
  }
  onVisitsChange(event: any) {
    this.visitChange(event.target.value);
  }
  visitChange(admissionId: any) {
    this.fetchPatientVistitInfo(admissionId, this.selectedView.PatientID);
  }
  fetchPatientVistitInfo(admissionid: any, patientid: any) {
    const url = this.service.getData(medicalcertificate.FetchPatientVistitInfo, { Patientid: patientid, Admissionid: admissionid, HospitalID: this.hospitalID });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {

        }
      },
        (err) => {

        })
  }
  navigatetoBedBoard() {
    this.router.navigate(['/ward']);
  }

  fetchReportStatus() {
    const url = this.service.getData(medicalcertificate.FetchReportStatus, { UserID: this.doctorDetails[0].UserId, WorkStationID: this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, HospitalID: this.hospitalID });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.reportStatus = response.FetchReportStatusDataList;
        }
      },
        (err) => {

        })
  }
  fetchMedicalCertificateTemplates() {
    const url = this.service.getData(medicalcertificate.FetchMedicalCertificationTemplate, { MedicalCertificationTemplateID: 0, AdmissionID: this.selectedView.AdmissionID, UserID: this.doctorDetails[0].UserId, WorkStationID: this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, HospitalID: this.hospitalID });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.medCertTemplates = response.FetchMedicalCertificationTemplateDataList;
        }
      },
        (err) => {

        })
  }

  onTemplateChange(event: any) {
    var template = this.medCertTemplates.find((x: any) => x.MedicalCertificationTemplateID === event.target.value);
    this.htmlContent = template.TemplateContent;
    // this.medicalCertificateForm.patchValue({
    //   htmlContent: template.TemplateContent
    // });
    this.htmlContent = template.TemplateContent;
  }

  SaveMedicalCertificate() {
    this.errorMessages = [];
    if (this.medicalCertificateForm.get('ReportStatus')?.value === '0') {
      this.errorMessages.push("Please Report Status");
    }
    if (this.medicalCertificateForm.get('MedicalCertTemplate')?.value === '') {
      this.errorMessages.push("Please select Template");
    }
    if (this.errorMessages.length > 0) {
      $("#patientAlertsValidationMsg").modal('show');
      return;
    }

    var payload = {
      "MedicalCertificationID": this.medicalCertificateForm.get('MedicalCertificationID')?.value,
      "AdmissionID": this.selectedView.AdmissionID,
      "MCTemplateID": this.medicalCertificateForm.get('MedicalCertTemplate')?.value,
      "Description": this.htmlContent, //this.medicalCertificateForm.get('htmlContent')?.value,
      "HospitalID": this.hospitalID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID,
      "ReportStatusID": this.medicalCertificateForm.get('ReportStatus')?.value,
      "DoctorID": this.doctorDetails[0].EmpId,
      "Remarks": "Medical Certificate Save"
    }

    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.us.post(medicalcertificate.SaveMedicalCertifications, payload).subscribe((response) => {
          if (response.Status === "Success") {
            $("#medCertSaveMsg").modal('show');
          }
          else {
            if (response.Status == 'Fail') {
              this.errorMessages = [];
              this.errorMessages.push(response.Message);
              this.errorMessages.push(response.Message2L);
              $("#medCertValidationMsg").modal('show');
            }
          }
        },
          (err) => {

          })
      }
      modalRef.close();
    });
  }

  viewMedCert() {
    this.viewMedCertificates();
    $("#divViewMedCert").modal('show');
  }

  viewMedCertificates() {
    var Fromdate = this.datePipe.transform(this.viewMedCertForm.value['fromdate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datePipe.transform(this.viewMedCertForm.value['todate'], "dd-MMM-yyyy")?.toString();
    const url = this.service.getData(medicalcertificate.FetchMedicalCertificateRequestV, {
      SSN: this.selectedView.SSN,
      FromDate: Fromdate,
      ToDate: ToDate,
      WorkStationID: this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.viewMedCertificatesList = response.FetchMedicalCertificateRequestViewDataList;
        }
      },
        (err) => {
        })
  }

  selectMedCert(medcert: any) {
    this.viewMedCertificatesList.forEach((element: any, index: any) => {
      if (element.MedicalCertificationID === medcert.MedicalCertificationID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.selectedViewMedCert = medcert;
    this.showViewValidationMsg = false;
  }

  loadSelectedMedCert(item: any) {
    if (this.viewMedCertificatesList.filter((x: any) => x.selected).length === 0) {
      this.showViewValidationMsg = true;
      return;
    }
    else {
      this.showViewValidationMsg = false;
    }
    const url = this.service.getData(medicalcertificate.FetchMedicalCertificationDescriptions, {
      MedicalCertificationTemplateID: item.MedicalCertificationID,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.doctorDetails[0]?.FacilityId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.medicalCertificateForm.patchValue({
            MedicalCertificationID: response.FetchMedicalCertificationDescriptionsDataList[0].MedicalCertificationID,
            VisitID: this.selectedView.AdmissionID,
            ReportStatus: response.FetchMedicalCertificationDescriptionsDataList[0].TaskStatus,
            MedicalCertTemplate: response.FetchMedicalCertificationDescriptionsDataList[0].MedicalCertificationTemplateID,
            //htmlContent: response.FetchMedicalCertificationDescriptionsDataList[0].TemplateContent
          });
          this.htmlContent = response.FetchMedicalCertificationDescriptionsDataList[0].TemplateContent;
          $("#divViewMedCert").modal('hide');
        }
      },
        (err) => {
        })
  }


  clearViewMedCert() {
    this.showViewValidationMsg = false;
    this.viewMedCertificatesList.forEach((element: any, index: any) => {
      element.selected = false;
    });
    var d = new Date();
    d.setDate(d.getDate() + 1);
    var vm = new Date();
    vm.setMonth(vm.getMonth() - 1);
    this.viewMedCertForm.patchValue({
      fromdate: vm,
      todate: d
    });
    this.viewMedCertificates()
  }


}


export const medicalcertificate = {
  FetchPatientVisits: 'FetchPatientVisits?Patientid=${Patientid}&HospitalID=${HospitalID}',
  FetchPatientVistitInfo: 'FetchPatientVistitInfo?Patientid=${Patientid}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchReportStatus: 'FetchReportStatus?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchMedicalCertificationTemplate: 'FetchMedicalCertificationTemplate?MedicalCertificationTemplateID=${MedicalCertificationTemplateID}&AdmissionID=${AdmissionID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SaveMedicalCertifications: 'SaveMedicalCertifications',
  FetchMedicalCertificateRequestV: 'FetchMedicalCertificateRequestV?SSN=${SSN}&FromDate=${FromDate}&ToDate=${ToDate}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchMedicalCertificationDescriptions: 'FetchMedicalCertificationDescriptions?MedicalCertificationTemplateID=${MedicalCertificationTemplateID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
};


