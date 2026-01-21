import { DatePipe } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { medicationDetails } from './urls';
import { MedicationErrorService } from './medication-error.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-medication-error',
  templateUrl: './medication-error.component.html',
  styleUrls: ['./medication-error.component.scss'],
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
export class MedicationErrorComponent extends BaseComponent implements OnInit {
  IsHome = true;
  url = '';
  PatientID: any;
  fromBedsBoard = false;
  noPatientSelected: any;
  currentdateN: any;
  currentTimeN: Date = new Date();
  location: any;
  facility: any;
  SelectedViewClass: any;
  isdetailShow = false;
  @Input() InputHome: any = true;
  patientdata: any;
  patientVisits: any = [];
  episodeId: any;
  PatientType: any;
  medicationForm: any;
  DrugList: any = [];
  selectedDrugs: any = [];
  FetchMedicationErrorMDataList: any = [];
  FetchMedicationErrorOccDataList: any = [];
  FetchMedicationErrorDiscDataList: any = [];
  FetchMedicationErrorActionDataList: any = [];
  FetchMedicationErrorStageInvolvedDataList: any = [];
  FetchMedicationErrorRouteofAdminDataList: any = [];
  IsPerputed = 2;
  IsUsed = 2;
  datesForm: any
  meViewList: any;
  FetchDrugErrorViewWorkListDataList: any;
  FetchMedicationErrorDataList: any;
  FetchMedicationErrorMedDataList: any;
  ReportID = 0;
  selectedViewMedErr: any;
  showViewValidationMsg = false;;

  constructor(@Inject(MedicationErrorService) private service: MedicationErrorService, private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private datePipe: DatePipe) {
    super();
    this.initializeForm();

    this.datesForm = this.formBuilder.group({
      fromdate: [new Date()],
      todate: [new Date()]
    });

    this.PatientID = sessionStorage.getItem("PatientID");
    if (this.PatientID !== undefined && this.PatientID !== '' && this.PatientID !== null)
      this.fromBedsBoard = true;
    //this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
  }

  initializeForm() {
    const currentDateTime = new Date();
    const currentTime = currentDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    this.medicationForm = this.formBuilder.group({
      VisitID: ['0'],
      SSN: '',
      ItemID: 0,
      Eventoccured1: currentDateTime,
      Eventoccured2: currentTime,
      TypeofError: ['0'],
      OccuredLocation: ['0'],
      ActionTake: ['0'],
      SearchedBy: ['0'],
      StagesEnvolved: ['0'],
      MadeBy: ['0'],
      eventdiscovered: currentDateTime,
      AdminRoute: '0',
      Intervention: '',
      Description: '',
      SearchDetail: '',
      MedicationDetails: '',
      Cause: '',
      Action2: '',
      Recommendation: ''
    });
  }

  ngOnInit(): void {
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.location = sessionStorage.getItem("locationName");
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '3395');
    this.IsHome = this.InputHome;

    if (this.selectedView.PatientType == "2") {
      if (this.selectedView?.Bed.includes('ISO'))
        this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
      else
        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }
    this.PatientID = this.selectedView.PatientID;
    this.fetchPatientVisits();
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
    this.url = this.service.getData(medicationDetails.fetchPatientDataBySsn, {
      SSN: ssn,
      PatientID: patientId,
      MobileNO: mobileno,
      PatientId: patientId,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.service.param.WorkStationID,
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
    this.url = this.service.getData(medicationDetails.FetchPatientVisits, { Patientid: this.PatientID, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          setTimeout(() => {
            this.FetchMedicationErrorM();
            this.FetchMedicationErrorRouteofAdmin();
            this.patientVisits = response.PatientVisitsDataList;
            this.admissionID = response.PatientVisitsDataList[0].AdmissionID;
            this.medicationForm.get('VisitID')?.setValue(this.admissionID);
            this.url = this.service.getData(medicationDetails.FetchPatientVistitInfo, { Patientid: this.PatientID, Admissionid: response.PatientVisitsDataList[0].AdmissionID, HospitalID: this.hospitalID });
            this.us.get(this.url)
              .subscribe((response: any) => {
                if (response.Code == 200) {
                  this.selectedView = response.FetchPatientVistitInfoDataList[0];
                  this.wardID = this.selectedView.WardID;
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

  onVisitsChange(event: any) {
    this.admissionID = event.target.value;
    this.visitChange(event.target.value);
  }

  visitChange(admissionId: any) {
    this.admissionID = admissionId;
    this.patientdata = this.patientVisits.find((visit: any) => visit.AdmissionID == admissionId);
    this.episodeId = this.patientdata.EpisodeID;
    this.PatientType = this.patientdata.PatientType;

    this.fetchPatientVistitInfo(admissionId, this.patientdata.PatientID);
  }

  fetchPatientVistitInfo(admissionid: any, patientid: any) {
    this.url = this.service.getData(medicationDetails.FetchPatientVistitInfo, { Patientid: patientid, Admissionid: admissionid, HospitalID: this.hospitalID });
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
  }

  clear() {
    this.noPatientSelected = false;
    this.selectedDrugs = [];
    this.initializeForm();
  }

  save() {
    var payload = {
      "ReportID": this.ReportID,
      "PatientType": this.selectedView.PatientType,
      "PatientID": this.PatientID,
      "AdmissionID": this.admissionID,
      "ItemID": this.medicationForm.get('ItemID').value,
      "ModificationDatetime": this.selectedView.AdmitDate,
      "Eventoccured": moment(this.medicationForm.get('Eventoccured1').value).format('DD-MMM-YYYY') + ' ' + this.medicationForm.get('Eventoccured2').value,
      "TypeofError": this.medicationForm.get('TypeofError').value,
      "IsUsed": this.IsUsed,
      "Description": this.medicationForm.get('Description').value,
      "Intervention": this.medicationForm.get('Intervention').value,
      "OccuredLocation": this.medicationForm.get('OccuredLocation').value,
      "IsPerputed": this.IsPerputed,
      "SearchedBy": this.medicationForm.get('SearchedBy').value,
      "SearchDetail": this.medicationForm.get('SearchDetail').value,
      "ActionTake": this.medicationForm.get('ActionTake').value,
      "StagesEnvolved": this.medicationForm.get('StagesEnvolved').value,
      "Outcome": "0",
      "MedicationDetails": this.medicationForm.get('MedicationDetails').value,
      "Cause": this.medicationForm.get('Cause').value,
      "MadeBy": this.medicationForm.get('MadeBy').value,
      "Action2": this.medicationForm.get('Action2').value,
      "eventdiscovered": moment(this.medicationForm.get('eventdiscovered').value).format('DD-MMM-YYYY'),
      "Recommendation": this.medicationForm.get('Recommendation').value,
      "AdminRoute": this.medicationForm.get('AdminRoute').value,
      "UserID": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.wardID,
      "HospitalID": this.hospitalID
    }

    this.us.post(medicationDetails.SaveDrugErrorModification, payload).subscribe((response) => {
      if (response.Code == 200) {
        $("#savemsg").modal('show');
      } else {

      }
    },
      (err) => {
        console.log(err)
      })
  }

  view() {
    $("#viewMedication").modal('show');
    this.FetchDrugErrorViewWorkList();
  }

  FetchDrugErrorViewWorkList() {
    if (this.datesForm.get('fromdate').value && this.datesForm.get('todate').value) {
      this.url = this.service.getData(medicationDetails.FetchDrugErrorViewWorkList, { SSN: this.selectedView.SSN, FromDate: moment(this.datesForm.get('fromdate').value).format('DD-MMM-YYYY'), ToDate: moment(this.datesForm.get('todate').value).format('DD-MMM-YYYY'), WardID: this.wardID, WorkStationID: this.wardID, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.FetchDrugErrorViewWorkListDataList = response.FetchDrugErrorViewWorkListDataList;
          }
        },
          (err) => {
          })
    }
  }

  selectedME(med: any) {
    if(this.FetchDrugErrorViewWorkListDataList.filter((x:any) => x.selected).length === 0) {
      this.showViewValidationMsg = true;
      return;
    }
    else {
      this.showViewValidationMsg = false;
    }
    this.url = this.service.getData(medicationDetails.FetchMedicationError, { ReportID: med.ReportID, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.selectedDrugs = [];
          this.FetchMedicationErrorDataList = response.FetchMedicationErrorDataList;
          this.FetchMedicationErrorMedDataList = response.FetchMedicationErrorMedDataList;
          this.FetchMedicationErrorMedDataList.forEach((element: any, index: any) => {
            element.DateOrdered = element.MonitorDate;
            this.selectedDrugs.push(element);
          });

          $("#viewMedication").modal('hide');
          this.FetchMedicationErrorDataList.forEach((element: any, index: any) => {
            this.medicationForm.patchValue({
              ItemID: element.ItemID,
              Eventoccured1: new Date(element.EventOccuredAt.split(' ')[0]),
              Eventoccured2: element.EventOccuredAt.split(' ')[1],
              TypeofError: element.TypeOfError,
              OccuredLocation: element.EOccuredLocation,
              ActionTake: element.ActionTaken,
              SearchedBy: element.SearchedBy,
              StagesEnvolved: element.StagesEnvolved,
              MadeBy: element.MadeBy,
              eventdiscovered: new Date(element.EventDiscoveredAt),
              AdminRoute: element.AdmRouteID,
              Intervention: element.Intervention,
              Description: element.EDescription,
              SearchDetail: element.SearchDetail,
              MedicationDetails: element.MedicationDetails,
              Cause: element.Cause,
              Action2: element.Action2,
              Recommendation: element.Recommendation
            });

            if (element.IsUsedByPatient === "True") {
              this.IsUsed = 1;
            }
            else {
              this.IsUsed = 2;
            }

            if (element.IsPerputed === "True") {
              this.IsPerputed = 1;
            }
            else {
              this.IsPerputed = 2;
            }

            this.ReportID = element.ReportID;
          });

          //  this.FetchMedicationErrorMedDataList.forEach((element:any, index:any) => {
          //   this.selectedDrugs.patchValue({
          //     ItemName: element.ItemName,         
          //     Duration: element.Duration,
          //     Dose: element.Dose,
          //     Frequency: element.Frequency,
          //     AdmRoute: element.AdmRoute,
          //     DoctorName: element.DoctorName,
          //     DateOrdered: element.MonitorDate           
          //   });
          // });

        }
      },
        (err) => {
        })
  }

  searchDrug(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(medicationDetails.FetchPrescribedItemsError,
        {
          Filter: event.target.value, HospitalID: this.hospitalID,
          PatientType: this.selectedView.PatientType, IPID: this.admissionID, UserID: this.doctorDetails[0].UserId, WorkStationID: this.wardID
        }
      );
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.DrugList = response.FetchPrescribedItemsErrorDataList;
          }
        },
          (err) => {
          })
    }
  }

  onDrugSelected(item: any) {
    this.DrugList = [];
    this.selectedDrugs.push(item);
    this.medicationForm.patchValue({
      ItemID: item.ItemID
    });
  }

  FetchMedicationErrorM() {
    this.url = this.service.getData(medicationDetails.FetchMedicationErrorM, { UserID: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchMedicationErrorMDataList = response.FetchMedicationErrorMDataList;
          this.FetchMedicationErrorOccDataList = response.FetchMedicationErrorOccDataList;
          this.FetchMedicationErrorDiscDataList = response.FetchMedicationErrorDiscDataList;
          this.FetchMedicationErrorActionDataList = response.FetchMedicationErrorActionDataList;
          this.FetchMedicationErrorStageInvolvedDataList = response.FetchMedicationErrorStageInvolvedDataList;
        }
      },
        (err) => {

        })
  }

  FetchMedicationErrorRouteofAdmin() {
    this.url = this.service.getData(medicationDetails.FetchMedicationErrorRouteofAdmin, { UserID: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchMedicationErrorRouteofAdminDataList = response.FetchMedicationErrorRouteofAdminDataList;
        }
      },
        (err) => {

        })
  }
  navigatetoBedBoard() {
    this.router.navigate(['/ward']);
  }

  selectMedErr(drug: any) {
    this.FetchDrugErrorViewWorkListDataList.forEach((element: any, index: any) => {
      if (element.ReportID === drug.ReportID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.selectedViewMedErr = drug;
    this.showViewValidationMsg = false;
  }

  clearViewMedErr() {
    this.FetchDrugErrorViewWorkListDataList.forEach((element: any, index: any) => {
      element.selected = false;
    });
    this.datesForm.patchValue({
      fromdate: new Date(),
      todate: new Date()
    });
    this.FetchDrugErrorViewWorkList();
  }

}
