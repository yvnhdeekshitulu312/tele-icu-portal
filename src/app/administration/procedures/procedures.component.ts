import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { proceduresDetails } from './urls';
import { EmployeeService } from '../employee/employee.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
declare var $: any;
@Component({
  selector: 'app-procedures',
  templateUrl: './procedures.component.html',
  styleUrls: ['./procedures.component.scss']
})
export class ProceduresComponent extends BaseComponent implements OnInit {
  url = '';
  FetchProcedureMastersCriteriaDataList: any = [];
  FetchProcedureMastersPatientTypeDataList: any = [];
  FetchProcedureMastersApproxTimeDataList: any = [];
  FetchProcedureMastersResultAvailabilityDataList: any = [];
  SpecialisationList: any = [];
  ServiceList: any = [];
  FetchEmployeeLocationDataList: any = [];
  procedureForm!: FormGroup;
  ProcedureID = 0;
  NameList: any = [];
  hospitalForm!: FormGroup;
  performedType: any = 'Performed Locally';
  allDaysSelected = false;
  activeDays = [false, false, false, false, false, false, false];
  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu ', 'Fri', 'Sat'];
  ProcHospitalDetails: any = [];
  PatientType = 0;
  FetchProcedureData1List: any = [];

  constructor(private service: EmployeeService, private us: UtilityService, public formBuilder: FormBuilder, private datePipe: DatePipe) { 
    super();

    this.initializeProcedure();

    this.initializeHospital();
  }

  initializeProcedure() {
    this.procedureForm = this.formBuilder.group({
      Name: ['', Validators.required],
      CODE: ['', Validators.required],
      ServiceID: ['', Validators.required],
      ServiceName: ['', Validators.required],
      SpecialiseID: ['', Validators.required],
      Specialisation: ['', Validators.required],
      CostPrice: ['', Validators.required],
      TimeUnit: ['', Validators.required],
      ApproximateTime: ['0', Validators.required],
      BLOCKED: [false, Validators.required],
      Remark: ['', Validators.required],
      IsBedSideProc: [false, Validators.required],
      IsProfChargesApplicable: [false, Validators.required],
      IsConsentRequired: [false, Validators.required],
      IsContrastAllergic: [false, Validators.required],
    });
  }

  initializeHospital() {
    this.hospitalForm = this.formBuilder.group({
      LOCATIONID: ['0', Validators.required],
      LOCATION: ['', Validators.required],
      AVAILABLEON: ['', Validators.required],
      HOSP: ['', Validators.required],
      ISDAY: ['', Validators.required],
      CRITERIA: ['0', Validators.required],
      CRITERIAValue: ['0', Validators.required],
      RATIME: ['', Validators.required],
      RAUOM: ['', Validators.required],
      RAUOMID: ['0', Validators.required],
      COTIME: ['', Validators.required],
      COETIME: ['', Validators.required],
      IXT: ['', Validators.required],
      PFTY: ['', Validators.required],
      PERFORMEDTYPE: ['', Validators.required],
      PERFORMEDLocationID: ['0', Validators.required],
      PERFORMEDLocation: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.FetchProcedureMasters();
    this.FetchEmployeeLocation();
  }

  selectedPERFORMEDTYPE(type: any) {
    this.performedType = type;
  }

  toggleAllDays() {
    this.allDaysSelected = !this.allDaysSelected;
    this.activeDays = this.allDaysSelected ? [true, true, true, true, true, false, true] : [false, false, false, false, false, false, false];
  }

  getActiveDayNames(): string[] {
    const activeDayIndexes = this.activeDays.reduce((acc: any, isActive: any, index: any) => {
      if (isActive) {
        acc.push(index);
      }
      return acc;
    }, []);

    return activeDayIndexes.map((index: any) => this.dayNames[index]);
  }

  toggleDay(index: number) {
    this.activeDays[index] = !this.activeDays[index];
    this.allDaysSelected = this.activeDays.every(day => day);
  }

  FetchProcedureMasters() {
    this.url = this.service.getData(proceduresDetails.FetchProcedureMasters, { UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchProcedureMastersCriteriaDataList = response.FetchProcedureMastersCriteriaDataList;
          this.FetchProcedureMastersPatientTypeDataList = response.FetchProcedureMastersPatientTypeDataList;
          this.FetchProcedureMastersApproxTimeDataList = response.FetchProcedureMastersApproxTimeDataList;
          this.FetchProcedureMastersResultAvailabilityDataList = response.FetchProcedureMastersResultAvailabilityDataList;
        }
      },
        (err) => {

        })
  }

  selectedPatientType(data: any) {
    this.PatientType = data.ID;
    this.FetchProcedureMastersPatientTypeDataList.forEach((mas: any) => {
      mas.Selected = (mas === data);
    });
  }

  searchSpecialisation(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(proceduresDetails.FetchSpecialisationProcedures, { DisplayName: event.target.value, UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.SpecialisationList = response.FetchSpecialisationProceduresDataList;
          }
        },
          (err) => {
          })
    }
  }

  onSpecialisationSelected(item: any) {
    this.procedureForm.patchValue({
      Specialisation: item.Name,
      SpecialiseID: item.ID
    });
  }

  searchService(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(proceduresDetails.FetchServiceProcedures, { DisplayName: event.target.value, UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.ServiceList = response.FetchServiceProceduresDataList;
          }
        },
          (err) => {
          })
    }
  }

  onServiceSelected(item: any) {
    this.procedureForm.patchValue({
      ServiceName: item.ServiceName,
      ServiceID: item.Serviceid
    });
  }

  FetchEmployeeLocation() {
    this.url = this.service.getData(proceduresDetails.FetchEmployeeLocation, { UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchEmployeeLocationDataList = response.FetchEmployeeLocationDataList;
        }
      },
        (err) => {

        })
  }

  add() {
    this.ProcHospitalDetails.push({
      Location: this.hospitalForm.get('LOCATION')?.value,
      LocationID: this.hospitalForm.get('LOCATIONID')?.value,
      WillPerformed: this.getActiveDayNames().join(', '),
      ResultAvailabilityTime: this.hospitalForm.get('RATIME')?.value,
      UOM: this.hospitalForm.get('RAUOM')?.value,
      RAUOMID: this.hospitalForm.get('RAUOMID')?.value,
      COTIME: this.hospitalForm.get('COTIME')?.value,
      COETIME: this.hospitalForm.get('COETIME')?.value,
      PERFORMEDLocation: this.hospitalForm.get('PERFORMEDLocation')?.value,
      PERFORMEDLocationID: this.hospitalForm.get('PERFORMEDLocationID')?.value,
      PerformedType: this.performedType,
      CRITERIA: this.hospitalForm.get('CRITERIA')?.value
    });

    this.initializeHospital();
  }

  deleteRow(index: number): void {
    this.ProcHospitalDetails.splice(index, 1);
  }

  locationChange(event: any) {
    this.hospitalForm.patchValue({
      LOCATION: event.target.options[event.target.options.selectedIndex].text,
      LOCATIONID: event.target.options[event.target.options.selectedIndex].value
    });
  }

  locationPerformedChange(event: any) {
    this.hospitalForm.patchValue({
      PERFORMEDLocation: event.target.options[event.target.options.selectedIndex].text,
      PERFORMEDLocationID: event.target.options[event.target.options.selectedIndex].value
    });
  }

  uomChange(event: any) {
    this.hospitalForm.patchValue({
      RAUOM: event.target.options[event.target.options.selectedIndex].text,
      RAUOMID: event.target.options[event.target.options.selectedIndex].value
    });
  }

  criteriaChange(event: any) {
    this.hospitalForm.patchValue({
      CRITERIA: event.target.options[event.target.options.selectedIndex].text,
      CRITERIAValue: event.target.options[event.target.options.selectedIndex].value
    });
  }

  save() {
    var ProcHospitalXMLDetails: any = [];

    this.ProcHospitalDetails.forEach((element: any) => {
      ProcHospitalXMLDetails.push({
        "LOCATION": element.Location,
        "AVAILABLEON": element.WillPerformed,
        "HOSP": element.LocationID,
        "AVAIL": element.WillPerformed,
        "ISDAY": 1,
        "CRITERIA": element.CRITERIA,
        "BLOCKED": this.procedureForm.get('BLOCKED')?.value ? "1" : "0",
        "RATIME": element.ResultAvailabilityTime,
        "RAUOMID": element.RAUOMID,
        "COTIME": element.COTIME,
        "COETIME": element.COETIME,
        "IXT": 1,
        "PFTY": 3,
        "PERFORMEDTYPE": element.PerformedType
      });
    });

    var payload = {
      "ProcedureID": this.ProcedureID,
      "Name": this.procedureForm.get('Name')?.value,
      "Name2L": this.procedureForm.get('Name')?.value,
      "ServiceID": this.procedureForm.get('ServiceID')?.value,
      "SpecialiseID": this.procedureForm.get('SpecialiseID')?.value,
      "PatientType": this.PatientType,
      "CostPrice": this.procedureForm.get('CostPrice')?.value,
      "TimeUnit": this.procedureForm.get('TimeUnit')?.value,
      "ApproximateTime": this.procedureForm.get('ApproximateTime')?.value,
      "BLOCKED": this.procedureForm.get('BLOCKED')?.value ? "1" : "0",
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": 3395,
      "HospitalID": this.hospitalID,
      "CODE": this.procedureForm.get('CODE')?.value,
      "Remark": this.procedureForm.get('Remark')?.value,
      "IsBedSideProc": this.procedureForm.get('IsBedSideProc')?.value ? "1" : "0",
      "IsProfChargesApplicable":this.procedureForm.get('IsProfChargesApplicable')?.value ? "1" : "0",
      "IsConsentRequired":this.procedureForm.get('IsConsentRequired')?.value ? "1" : "0",
      "IsContrastAllergic": this.procedureForm.get('IsContrastAllergic')?.value,
      ProcHospitalXMLDetails: ProcHospitalXMLDetails
    }

    this.us.post(proceduresDetails.SaveProcedure, payload).subscribe((response) => {
      if (response.Status == "True") {
        $("#savemsg").modal('show');
        this.clear();
      } else {

      }
    },
      (err) => {
        console.log(err)
      })

  }

  clear() {
    this.initializeProcedure();
    this.ProcHospitalDetails = [];
    this.initializeHospital();
    this.performedType = 'Performed Locally';
    this.activeDays = [false, false, false, false, false, false, false];
    this.allDaysSelected = false;
    this.PatientType = 0;
    this.ProcedureID = 0;

    this.FetchProcedureMastersPatientTypeDataList.forEach((mas: any) => {
      mas.Selected = false;
    });
  }

  searchProcedure(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(proceduresDetails.SSProcedureItems, { Search: event.target.value, UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.NameList = response.SSProcedureItemsDataList;
          }
        },
          (err) => {
          })
    }
  }

  onNameSelected(item: any) {
    this.NameList = [];
    this.procedureForm.patchValue({
      Name: item.ServiceItemName
    });

    this.FetchProcedure(item.ID);
  }

  FetchProcedure(ProcedureID: any) {
    this.url = this.service.getData(proceduresDetails.FetchProcedureR, { ProcedureID: ProcedureID, UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchProcedureData1List = response.FetchProcedureData1List[0];

          if(this.FetchProcedureData1List) {
            this.ProcedureID = this.FetchProcedureData1List.ProcedureID;
            this.PatientType = this.FetchProcedureData1List.PatientType;

            this.FetchProcedureMastersPatientTypeDataList.forEach((mas: any) => {
              if(mas.ID == this.PatientType) {
                mas.Selected = true;
              }
            });

            this.procedureForm.patchValue({
              Name: this.FetchProcedureData1List.Name,
              ServiceID: this.FetchProcedureData1List.ServiceID,
              ServiceName: this.FetchProcedureData1List.ServiceName,
              SpecialiseID: this.FetchProcedureData1List.SpecialiseID,
              Specialisation: this.FetchProcedureData1List.Specialisation,
              CostPrice: this.FetchProcedureData1List.CostPrice,
              TimeUnit: this.FetchProcedureData1List.TimeUnitID,
              ApproximateTime: parseInt(this.FetchProcedureData1List.ApproximateTime),
              BLOCKED: this.FetchProcedureData1List.BLOCKED == "1" ? true : false,
              Remark: this.FetchProcedureData1List.Remark,
              IsBedSideProc: this.FetchProcedureData1List.IsBedside == "1" ? true : false,
              IsProfChargesApplicable: this.FetchProcedureData1List.IsProfChargesApplicable == "True" ? true : false,
              IsConsentRequired: this.FetchProcedureData1List.IsConsentRequired == "1" ? true : false,
              IsContrastAllergic: this.FetchProcedureData1List.IsContrastAllergic == "True" ? true : false,
            });

            response.FetchProcedureData3List.forEach((element: any, index: any) => {
              this.ProcHospitalDetails.push({
                Location: element.hospital,
                LocationID: element.HospitalID,
                WillPerformed: element.Available,
                ResultAvailabilityTime: element.ResultAvailabilityTime,
                UOM: element.ResultAvailabilityUOMID,
                RAUOMID: element.ResultAvailabilityUOMID,
                COTIME: this.datePipe.transform(element.CutOffStartTime, 'HH:mm'),
                COETIME: this.datePipe.transform(element.CutOffEndTime, 'HH:mm'),
                PERFORMEDLocation: element.PerformHospitalName,
                PERFORMEDLocationID: element.PerformHospitalID,
                PerformedType: element.PerformedType
              });
            });
          }
        }
      },
        (err) => {

        })
  }
}
