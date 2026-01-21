import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/shared/base.component';
import { DietchartWorklistService } from '../dietchart-worklist/dietchart-worklist.service';
import { UtilityService } from 'src/app/shared/utility.service';
import * as moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { dietchartworklist } from '../dietchart-worklist/dietchart-worklist.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

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
  selector: 'app-diet-counselling',
  templateUrl: './diet-counselling.component.html',
  styleUrls: ['./diet-counselling.component.scss'],
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
export class DietCounsellingComponent extends BaseComponent implements OnInit {
  @Input() data: any;
  readonly = false;
  showClose = false;
  @Output() closeModal = new EventEmitter<any>();
  diagStr: any;
  patientAdmissionDetails: any;
  patientDiagnosisList: any;
  cuisines: any;
  dietTypes: any;
  patientBmi: any;
  dietCounsellingForm!: FormGroup;
  dietCategories: any;
  mealTimes: any;
  DietRequistionDetails: any;
  patientAdmissionWardDetails: any;
  viewMode = false;
  FetchDietRequisitionDataList: any;
  selectedDietReqPlan: any;
  IsFromBedsBoard: any;
  dietTypesFiltered: any;
  errorMessages: any[] = [];
  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @Output() dataChanged = new EventEmitter<boolean>();

  constructor(private datePipe: DatePipe, private fb: FormBuilder, private us: UtilityService, private router: Router, private service: DietchartWorklistService) {
    super();
    // var inpatientdetails = JSON.parse(sessionStorage.getItem("DietInpatient") || '{}');
    // this.patientAdmissionDetails = inpatientdetails.FetchAdmissionInPatientDataList[0];
    // this.patientAdmissionWardDetails = inpatientdetails.FetchAdmissionWardNBedsList[0];
    // this.patientDiagnosisList = inpatientdetails.FetchAdmissionDiagnosisList;
    // this.diagStr = this.patientDiagnosisList?.map((item: any) => item.Code + "-" + item.DiseaseName).join(', ');

    //this.DietRequistionDetails = JSON.parse(sessionStorage.getItem("DietRequistionDetails") || '{}');
    // if(this.DietRequistionDetails != undefined)
    //   this.viewMode = true;

    this.dietCounsellingForm = this.fb.group({
      Height: [''],
      Weight: [''],
      KCalories: [''],
      Protiens: [''],
      Fats: [''],
      Salt: [''],
      BEE: [''],
      Carbohydrates: [''],
      BMI: [''],
      DietCategory: ['0'],
      DieticianRemarks: [''],
      DieticianNote: [''],
      StartDate: new Date(),
      MealTime: [''],
      MealTimeRem: [''],
      Cuisine: ['0'],
      CuisineRemarks: [''],
      IsGuestFood: ['0'],
      IsIsolation: ['0']
    });
  }

  ngOnInit(): void {
    this.IsFromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;
    if (this.data && this.data.isFromWorkList) {
      this.DietRequistionDetails = this.data;
    }
    this.fetchCuisine();
    this.fetchDietTypes();
    this.fetchDietCategory();
    this.fetchPatientHeightWeightBmi();
    this.fetchDiagnosis();
    //this.fetchAdmissionInPatient();
    this.fetchDietRequisitionADV();
    //this.fetchDietEncounter();
    if (this.data) {
      this.readonly = this.data.readonly;
      this.showClose = this.data.showClose;
      if (this.data.isFromWorkList) {
        this.fetchDietEncounter();
      }
      if (this.divreadonly?.nativeElement) {
        this.us.disabledElement(this.divreadonly?.nativeElement);
      }
    }
  }

  fetchCuisine() {
    const url = this.service.getData(dietchartcounselling.FetchAdminMasters, {
      Type: 85,
      Filter: 'Blocked=0',
      USERID: this.doctorDetails[0].UserId,
      WORKSTATIONID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.AdminMastersInstructionsDataList.length > 0) {
          this.cuisines = response.AdminMastersInstructionsDataList;
        }
      },
        (err) => {
        })
  }

  fetchDietTypes() {
    const url = this.service.getData(dietchartcounselling.FetchAdminMasters, {
      Type: 112,
      Filter: 'Blocked=0',
      USERID: this.doctorDetails[0].UserId,
      WORKSTATIONID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.AdminMastersInstructionsDataList.length > 0) {
          this.dietTypes = response.AdminMastersInstructionsDataList;
          this.dietTypes.forEach((element: any, index: any) => {
            element.selected = false;
          });
        }
      },
        (err) => {
        })
  }

  fetchPatientHeightWeightBmi() {
    const url = this.service.getData(dietchartcounselling.FetchPatientHeightWeight, { PatientID: this.DietRequistionDetails.PatientID });
    this.us.post(url, {})
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.patientBmi = response.SmartDataList[0];
          this.dietCounsellingForm.patchValue({
            BMI: response.SmartDataList[0]?.BMI.split('-')[0],
            Weight: response.SmartDataList[0]?.Weight,
            Height: response.SmartDataList[0]?.Height,
            BEE: response.SmartDataList[0]?.BEE
          });
        }
      },
        (err) => {
        })
  }

  fetchDiagnosis() {
    this.con.fetchAdviceDiagnosis(this.DietRequistionDetails.IPID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          this.diagStr = response.PatientDiagnosisDataList?.map((item: any) => item.Code + "-" + item.DiseaseName).join(', ');
        }
      },
        (err) => {

        })
  }

  fetchDietCategory() {
    const url = this.service.getData(dietchartcounselling.FetchDietCategorysADV, {
      Type: "0",
      Filter: "blocked=0",
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchDietCategorysDataList.length > 0) {
          this.dietCategories = response.FetchDietCategorysDataList;
        }
      },
        (err) => {
        })
  }
  fetchMealTimes() {
    const url = this.service.getData(dietchartcounselling.FetchDietCategorysADV, {
      Type: "0",
      Filter: "blocked=0",
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.AdminMastersInstructionsDataList.length > 0) {
          this.mealTimes = response.FetchDietCategorysDataList;
        }
      },
        (err) => {
        })
  }

  selectDietType(type: any) {
    type.selected = !type.selected;
  }

  viewDietPlan() {
    this.FetchDietRequisitionDataList.forEach((element: any, index: any) => {
      element.selected = false;
    });
    $("#divViewDietPlan").modal('show');
  }

  fetchDietRequisitionADV() {
    const url = this.service.getData(dietchartcounselling.FetchDietRequisitionADV, {
      Type: "0",
      Filter: "IPID=" + this.DietRequistionDetails.IPID,
      UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchDietRequisitionDataList.length > 0) {
          this.FetchDietRequisitionDataList = response.FetchDietRequisitionDataList;
          this.DietRequistionDetails = this.FetchDietRequisitionDataList[0];
          this.viewMode = true;
          // this.FetchDietRequisitionDataList.forEach((element:any, index:any) => {
          //   element.selected = false;
          // });
          this.fetchDietEncounter();
        }
      },
        (err) => {
        })
  }

  selectDietReqPlan(plan: any) {
    this.selectedDietReqPlan = plan;
    this.FetchDietRequisitionDataList.forEach((element: any, index: any) => {
      if (element.MonitorID === plan.MonitorID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
  }

  loadSelectedDietPlanView(dplan: any) {
    this.viewMode = true;
    this.DietRequistionDetails = dplan;
    this.fetchDietEncounter();
    $("#divViewDietPlan").modal('hide');

  }

  fetchDietEncounter() {
    const url = this.service.getData(dietchartcounselling.FetchDietEncounter, {
      MonitorID: (this.DietRequistionDetails.MonitorID == "" || this.DietRequistionDetails.MonitorID == undefined) ? "0" : this.DietRequistionDetails.MonitorID,
      IPID: this.DietRequistionDetails.IPID,
      Type: "1019",
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.wardID,
      HospitalID: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchDietEncounterData1List.length > 0) {
            this.dietCounsellingForm.patchValue({
              //Height: response.FetchDietEncounterData1List[0].Height,
              //Weight: response.FetchDietEncounterData1List[0].Weight,
              KCalories: response.FetchDietEncounterData1List[0].KiloCalories,
              Protiens: response.FetchDietEncounterData1List[0].Protiens,
              Fats: response.FetchDietEncounterData1List[0].Fats,
              Salt: response.FetchDietEncounterData1List[0].Salt,
              //BEE: '',
              Carbohydrates: response.FetchDietEncounterData1List[0].Carbohydrates,
              DietCategory: response.FetchDietEncounterData3List[0].DietCategoryID,
              DieticianRemarks: response.FetchDietEncounterData3List[0].Remarks,
              DieticianNote: response.FetchDietEncounterData3List[0].DietitionNote,
              StartDate: new Date(response.FetchDietEncounterData3List[0].ReqiStartdate),
              Cuisine: response.FetchDietEncounterData4List[0].CuisineID,
              CuisineRemarks: response.FetchDietEncounterData4List[0].Remarks,
              IsGuestFood: response.FetchDietEncounterData3List[0].IsGuestfood === 'False' ? '0' : '1',
              IsIsolation: response.FetchDietEncounterData3List[0].IsIsolation === 'False' ? '0' : '1',

              BMI: response.FetchDietEncounterData1List[0].BMIM,
              Weight: response.FetchDietEncounterData1List[0].Weight,
              Height: response.FetchDietEncounterData1List[0].Height,
              BEE: response.FetchDietEncounterData1List[0].BEE

            });
          }

          response.FetchDietEncounterData6List.forEach((element: any, index: any) => {
            var find = this.dietTypes.find((x: any) => x.id === element.DietTypeId);
            find.selected = true;
          });

          if (this.data?.isFromWorkList) {
            this.viewMode = false;
            this.dietTypesFiltered = this.dietTypes;
          } else {
            this.dietTypesFiltered = this.dietTypes.filter((x: any) => x.selected);
            this.dietTypesFiltered.forEach((element: any, index: any) => {
              element.selected = true;
            });
          }
        }
      },
        (err) => {
        })
  }

  isGuestFood(val: any) {
    if (val === '0') {
      this.dietCounsellingForm.patchValue({
        IsGuestFood: '1'
      });
    }
    else {
      this.dietCounsellingForm.patchValue({
        IsGuestFood: '0'
      });
    }
  }

  isIsolation(val: any) {
    if (val === '0') {
      this.dietCounsellingForm.patchValue({
        IsIsolation: '1'
      });
    }
    else {
      this.dietCounsellingForm.patchValue({
        IsIsolation: '0'
      });
    }
  }

  saveDietCounselling() {

    var DietRequisitionText: any[] = [];
    DietRequisitionText.push({
      DIETMONITORID: "0",
      FID: "0",
      MTID: "1",
      DCID: "0",
      FGID: "0",
      QTY: "0",
      FRQ: "",
      RM: this.dietCounsellingForm.get('MealTimeRem')?.value,
      CUID: "0",
      MT: "0",
      UOM: "0"
    });

    var DietTypeText: any[] = [];
    var dietTypes = this.dietTypes.filter((x: any) => x.selected);
    if (dietTypes.length === 0) {
      this.errorMessages = [];
      this.errorMessages.push("Please select atleast one Diet Type");
      $("#dietValidations").modal('show');
      return
    }
    dietTypes.forEach((element: any, index: any) => {
      DietTypeText.push({
        DTID: element.id
      })
    });

    let payload = {
      "DietMonitorID": this.viewMode ? this.DietRequistionDetails.MonitorID : "0",
      "PatientID": this.DietRequistionDetails.PatientID,
      "IPID": this.DietRequistionDetails.IPID,
      "DietrequisitionID": 0,
      "KiloCalories": this.dietCounsellingForm.get('KCalories')?.value === "" ? 0 : Number(this.dietCounsellingForm.get('KCalories')?.value),
      "Protiens": this.dietCounsellingForm.get('Protiens')?.value === "" ? '0' : Number(this.dietCounsellingForm.get('Protiens')?.value),
      "Fats": this.dietCounsellingForm.get('Fats')?.value === "" ? '0' : Number(this.dietCounsellingForm.get('Fats')?.value),
      "Salt": this.dietCounsellingForm.get('Salt')?.value === "" ? '0' : Number(this.dietCounsellingForm.get('Salt')?.value),
      "Weight": this.dietCounsellingForm.get('Weight')?.value === "" ? '0' : this.dietCounsellingForm.get('Weight')?.value,
      "height": this.dietCounsellingForm.get('Height')?.value === "" ? '0' : this.dietCounsellingForm.get('Height')?.value,
      "BediD": this.selectedView.BedID,
      "DietCategoryID": this.dietCounsellingForm.get('DietCategory')?.value === '' ? '0' : this.dietCounsellingForm.get('DietCategory')?.value,
      "DietTypeID": "73", //DietTypeID need to be changed
      "CuisineID": this.dietCounsellingForm.get('Cuisine')?.value === '' ? '0' : this.dietCounsellingForm.get('Cuisine')?.value,
      "DietitionNote": this.dietCounsellingForm.get('DieticianNote')?.value,
      "Remarks": this.dietCounsellingForm.get('DieticianRemarks')?.value,
      "Type": "0",
      "Status": "0",
      "DietRequisitionText": DietRequisitionText,
      "ReqiStartdate": moment(this.dietCounsellingForm.get('StartDate')?.value).format('DD-MMM-YYYY'),
      "ReqiEnddate": moment(this.dietCounsellingForm.get('StartDate')?.value).format('DD-MMM-YYYY'),
      "DoctorID": this.selectedView.ConsultantID,
      "UserId": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.wardID,
      "IsGuestfood": this.dietCounsellingForm.get('IsGuestFood')?.value,
      "Isisolation": this.dietCounsellingForm.get('IsIsolation')?.value === '' ? '0' : '1',
      "DietTypeText": DietTypeText,
      "Carbohydrates": this.dietCounsellingForm.get('Carbohydrates')?.value === "" ? 0 : Number(this.dietCounsellingForm.get('Carbohydrates')?.value),
      "DietCategoryText": "",
    }
    this.us.post(dietchartcounselling.SaveDietEncounter, payload).subscribe((response) => {
      if (response.Code == 200) {
        $("#dietPlanSaveMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {

        }
      }
    },
      (err) => {

      })
  }

  navigateBackToWorklist() {
    sessionStorage.removeItem("DietInpatient");
    sessionStorage.removeItem("DietRequistionDetails");
    this.closeModal.emit();
    //this.router.navigate(['/ward/dietchart-worklist']);
  }
  navigatetoBedBoard() {
    this.router.navigate(['/ward']);
  }
  addNewDietPlan() {
    this.viewMode = false;
    this.dietTypesFiltered = this.dietTypes;
    // this.dietCounsellingForm.patchValue({     
    //   KCalories: "",
    //   Protiens: "",
    //   Fats: "",
    //   Salt: "",     
    //   Carbohydrates: "",
    //   DietCategory: "",
    //   DieticianRemarks: "",
    //   DieticianNote: "",
    //   StartDate: new Date(),
    //   Cuisine: "",
    //   CuisineRemarks: "",
    //   IsGuestFood: "",
    //   IsIsolation: ""
    // });
    this.dietTypes.forEach((element: any, index: any) => {
      element.selected = false;
    });
  }
  fetchAdmissionInPatient() {

    const url = this.service.getData(dietchartworklist.FetchAdmissionInPatient, {
      PatientID: this.DietRequistionDetails.PatientID,
      IPID: this.DietRequistionDetails.IPID,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      WorkStationID: this.wardID,
      Hospitalid: this.hospitalID
    });
    this.us.get(url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.diagStr = response.FetchAdmissionDiagnosisList?.map((item: any) => item.Code + "-" + item.DiseaseName).join(', ');
        }
      },
        (err) => {
        })
  }
}


export const dietchartcounselling = {
  FetchAdminMasters: 'FetchAdminMasters?Type=${Type}&Filter=${Filter}&USERID=${USERID}&WORKSTATIONID=${WORKSTATIONID}&HospitalID=${HospitalID}',
  FetchPatientHeightWeight: 'FetchPatientHeightWeight?PatientID=${PatientID}',
  FetchDietCategorysADV: 'FetchDietCategorysADV?Type=${Type}&Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchMealTimesAdv: 'FetchMealTimesAdv?Type=${Type}&Filter=${Filter}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchDietEncounter: 'FetchDietEncounter?MonitorID=${MonitorID}&IPID=${IPID}&Type=${Type}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SaveDietEncounter: 'SaveDietEncounter',
  FetchDietRequisitionADV: 'FetchDietRequisitionADV?Type=${Type}&Filter=${Filter}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
}
