import { Component, Inject, Input, OnInit } from '@angular/core';
import { BaseComponent, MY_FORMATS } from '../base.component';
import { PrimaryDoctorService } from './primarydoctor.service';
import { UtilityService } from '../utility.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { primaryDoctorDetails } from './urls';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ConfigService } from 'src/app/services/config.service';
declare var $: any;

@Component({
  selector: 'app-primary-doctor-change',
  templateUrl: './primary-doctor-change.component.html',
  styleUrls: ['./primary-doctor-change.component.scss'],
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
export class PrimaryDoctorChangeComponent extends BaseComponent implements OnInit {
  url = '';
  PatientID: any;
  fromBedsBoard = false;
  noPatientSelected: any;
  IsHome: any;
  @Input() InputHome: any = true;
  currentdateN: any;
  currentTimeN: Date = new Date();
  location: any;
  facility: any;
  SelectedViewClass: any;
  isdetailShow = false;
  docList: any = [];
  employeeSpecilisations: any = [];
  doctorForm: any;
  FetchPatientPrimaryDoctorsADataList: any = [];
  SpecializationList: any;
  SpecializationList1: any;
  hospId: any;
  listOfSpecItems: any;
  listOfSpecItems1: any;
  errorMsg = "";
  IsFromBedsBoard: boolean = false;

  constructor(@Inject(PrimaryDoctorService) private service: PrimaryDoctorService, private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private datePipe: DatePipe,
  private config: ConfigService) {
    super();
    this.PatientID = sessionStorage.getItem("PatientID");
    if (this.PatientID !== undefined && this.PatientID !== '' && this.PatientID !== null)
      this.fromBedsBoard = true;
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorForm =  this.formBuilder.group({
      DOCID: '',
      DOCName: '',
      SpecialiseID: 0,
      SpecialiseName: '',
      DoctorDate: new Date(),
      SSN: '',
      DOCFullName: ''
    });
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

  ngOnInit(): void {
    this.IsFromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.location = sessionStorage.getItem("locationName");
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.IsHome = this.InputHome;
    this.hospId = sessionStorage.getItem("hospitalId");
    this.fetchReferalAdminMasters();
    if (this.selectedView.PatientType == "2") {
      if (this.selectedView?.Bed.includes('ISO'))
        this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
      else
        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }
    if(this.IsFromBedsBoard) {
      const selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
      this.doctorForm.patchValue({
        "SSN" : selectedView.SSN
      });
      this.fetchPatientDetails(selectedView.SSN, "0", "0")
  }
  }
  fetchReferalAdminMasters() {
    this.config.fetchConsulSpecialisation(this.hospId).subscribe((response) => {
      this.SpecializationList = this.SpecializationList1 = response.FetchConsulSpecialisationDataList;
    });
  }
  searchSpecItem(event: any) {
    const item = event.target.value;
    this.SpecializationList = this.SpecializationList1;
    let arr = this.SpecializationList1.filter((spec: any) => spec.name.toLowerCase().indexOf(item.toLowerCase()) === 0);
    this.SpecializationList = arr.length ? arr : [{ name: 'No Item found' }];
  }
  onSpecItemSelected(item: any) {
    this.doctorForm.patchValue({
      SpecialiseID: item.id,
      SpecialiseName: item.name   
      
    });
    this.fetchSpecializationDoctorSearch();
  }
  fetchSpecializationDoctorSearch() {
    this.config.fetchSpecialisationDoctors('%%%', this.doctorForm.get("SpecialiseID").value, this.doctorDetails[0].EmpId, this.hospId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.listOfSpecItems = this.listOfSpecItems1 = response.FetchDoctorDataList;
        setTimeout(() => {
          const selectedItem = this.listOfSpecItems.find((value: any) => Number(value.Empid) === Number(this.doctorForm.get("DOCID").value));
          if (selectedItem) {
            this.doctorForm.patchValue({
              DOCName: selectedItem.EmpNo + ' - ' + selectedItem.Fullname,
              DOCID: selectedItem.Empid
            });
          }
        }, 500);

      }
    }, error => {
      console.error('Get Data API error:', error);
    });

  }
  searchDocItem(event: any) {
    const item = event.target.value;
    this.listOfSpecItems = this.listOfSpecItems1;
    let arr = this.listOfSpecItems1.filter((doc: any) => doc.Fullname.toLowerCase().indexOf(item.toLowerCase()) === 0);
    if (arr.length === 0) {
      arr = this.listOfSpecItems1.filter((proc: any) => proc.EmpNo.toLowerCase().indexOf(item.toLowerCase()) === 0);
    }
    this.listOfSpecItems = arr.length ? arr : [{ name: 'No Item found' }];
  }
  
  onDocItemSelected(item: any) {
    this.doctorForm.patchValue({    
      DOCID: item.Empid    ,
      DOCName: item.EmpNo,
      DOCFullName: item.EmpNo + '-' + item.Fullname,
    });
  }

  onEnterPress(event: any) {
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
    this.url = this.service.getData(primaryDoctorDetails.fetchPatientDataBySsn, {
      SSN: ssn,
      PatientID: patientId,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (ssn === '0') {
            this.PatientID = response.FetchPatientDependCLists[0].PatientID;
            this.selectedView = response.FetchPatientDependCLists[0];
          }
          else if (mobileno === '0') {
            this.PatientID = response.FetchPatientDataCCList[0].PatientID;
            this.selectedView = response.FetchPatientDataCCList[0];
          }

          this.noPatientSelected = true;
          this.fetchPatientVisits();

        }
      },
        (err) => {

        })
  }

  fetchPatientVisits() {
    this.url = this.service.getData(primaryDoctorDetails.FetchPatientVisits, { Patientid: this.PatientID, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          setTimeout(() => {
            this.admissionID = response.PatientVisitsDataList.filter((x: any) => x.PatientType == '2' || x.PatientType == '4')[0].AdmissionID;
            //this.admissionID = response.PatientVisitsDataList[0].AdmissionID;
            this.FetchPatientPrimaryDoctorsA();
            this.url = this.service.getData(primaryDoctorDetails.FetchPatientVistitInfo, { Patientid: this.PatientID, Admissionid: response.PatientVisitsDataList[0].AdmissionID, HospitalID: this.hospitalID });
            this.us.get(this.url)
              .subscribe((response: any) => {
                if (response.Code == 200) {
                  this.selectedView = response.FetchPatientVistitInfoDataList[0];
                }
                if (this.selectedView.PatientType == "2") {
                  if (this.selectedView?.Bed.includes('ISO'))
                    this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
                  else
                    this.SelectedViewClass = "m-0 fw-bold alert_animate token";
                } else {
                  this.SelectedViewClass = "m-0 fw-bold alert_animate token";
                }
              },
                (err) => {
        
                })
          }, 0);
        }
      },
        (err) => {
        })
  }

  FetchEmployeeSpecializationsForPA(docId: any) {
    this.url = this.service.getData(primaryDoctorDetails.FetchEmployeeSpecializationsForPA, { Filter: docId, UserId: this.doctorDetails[0]?.UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        this.employeeSpecilisations = response.EmployeeSpecialisationsDataList;
      },
        (err) => {
        })
  }

  onDoctorItemSelected(item: any) {
    this.docList = [];
    this.FetchEmployeeSpecializationsForPA(item.Empid);
    this.doctorForm.patchValue({
      DOCID: item.Empid,
      DOCName: item.EmpNo,
      DOCFullName: item.Fullname
    });
  }

  searchDoctor(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(primaryDoctorDetails.FetchPrimaryHospitalEmployees, { Filter: event.target.value, WorkStationID: 3395, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
           this.docList = response.FetchRODNursesDataList;
          }
        },
          (err) => {
          })
    }
  }

  clear() {
    this.noPatientSelected = false;
    this.doctorForm.patchValue({
      SSN: ''
    });
  }

  
  FetchPatientPrimaryDoctorsA() {
    this.url = this.service.getData(primaryDoctorDetails.FetchPatientPrimaryDoctorsA, { AdmissionID:  this.admissionID, UserId: this.doctorDetails[0]?.UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        this.FetchPatientPrimaryDoctorsADataList =response.FetchPatientPrimaryDoctorsADataList;
        this.FetchPatientPrimaryDoctorsADataList.forEach((element: any, index:any) => {
          element.enableDelete = false;
        });
      },
        (err) => {
        })
  }

  AddPrimaryDoc() {

    const specname = this.doctorForm.get("SpecialiseName").value;
    const docname = this.doctorForm.get("DOCFullName").value;
    if(specname === '' || docname === '') {
      this.errorMsg = "Please select Specialisation & Doctor";
      $("#errorMsg").modal('show');
      return;
    }

    if(this.FetchPatientPrimaryDoctorsADataList.length > 0) {
      const lastRecord = this.FetchPatientPrimaryDoctorsADataList[this.FetchPatientPrimaryDoctorsADataList.length - 1];

      if(lastRecord.DoctorID === this.doctorForm.get("DOCID").value) {
        this.errorMsg = "Doctor should be different as current doctor";
        $("#errorMsg").modal('show');
        return;
      }
      else {
       var day = new Date();
       day.setDate(day.getDate() - 1);
        lastRecord.ToDate =  moment(day).format('DD-MMM-YYYY');
      }
    }

    this.FetchPatientPrimaryDoctorsADataList.push({
      "PatientPrimaryID": 0,
      "DoctorID": this.doctorForm.get("DOCID").value,
      "DoctorName": this.doctorForm.get("DOCFullName").value,
      "DoctorName2l": this.doctorForm.get("DOCFullName").value,
      "SpecialiseID": this.doctorForm.get("SpecialiseID").value,
      "Specialisation": this.doctorForm.get("SpecialiseName").value,
      "Specialisation2l": this.doctorForm.get("SpecialiseName").value,
      "FromDate": moment(this.doctorForm.get("DoctorDate").value).format('DD-MMM-YYYY'),
      "ToDate": null,
      "Sequence": this.FetchPatientPrimaryDoctorsADataList.length+1,
      "ServiceItemID": 0,
      "enableDelete" : true
    });

    this.doctorForm.reset({
      DOCID: '',
      DOCName: '',
      SpecialiseID: 0,
      SpecialiseName: '',
      DoctorDate: new Date(),
      SSN: '',
      DOCFullName: ''
    });
    this.listOfSpecItems = [];
  }

  SpecialisationChange(event: any) {
    var spec = event.target.options[event.target.options.selectedIndex].text;
    this.doctorForm.patchValue({
      SpecialiseName: spec
    });
  }

  save() {
    var PrimaryXML: any = [];
    this.FetchPatientPrimaryDoctorsADataList.forEach((element: any, index: any) => {
      PrimaryXML.push({
        "DOCID": element.DoctorID,
        "SPECIALISEID": element.SpecialiseID,
        "FROMDATE": element.FromDate,
        "TODATE": element.ToDate,
        "SEQUENCE": element.Sequence
      })
    });

    let payload = {
      "IPID": this.admissionID,
      "PrimaryXML": PrimaryXML,
      "UserId": this.doctorDetails[0]?.UserId,
      "WorkStationID": 3395,
      "HospitalId": this.hospitalID,
      "RequestID": "0"

    }
    this.us.post(primaryDoctorDetails.SavePatientPrimaryDoctors, payload).subscribe((response) => {
      if (response.Code == 200) {
        this.FetchPatientPrimaryDoctorsA();
        $("#savemsg").modal('show');
      } else {

      }
    },
      (err) => {
        console.log(err)
      })
  }

  deleteItem(index: any) {
    this.FetchPatientPrimaryDoctorsADataList.splice(index, 1);
  }
  navigatetoBedBoard() {
    sessionStorage.removeItem('FromBedBoard');
    this.router.navigate(['/ward']);
}
}

