import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { SurgeryrecordService } from './surgeryrecord.service';
import { Router } from '@angular/router';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { preoperativechekclist } from 'src/app/shared/pre-op-checklist/pre-op-checklist.component';
import { SurgeryUtilsService } from '../services/surgery-utils.service';

declare var $: any;


@Component({
  selector: 'app-surgeryrecord',
  templateUrl: './surgeryrecord.component.html',
  styleUrls: ['./surgeryrecord.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe,
  ],
})
export class SurgeryrecordComponent extends BaseComponent implements OnInit {
  @Input() data: any;
  item: any;
  url: any;
  surgeryRequestDetails: any = [];
  surgeryRequests: any = [];
  suregeryRecordForm!: FormGroup;
  resourceDetails: any = [];
  listOfItems: any = [];
  listOfItemsCir: any = [];
  listOfDiagosis: any = [];
  postOpDiagosis: any = [];
  listOfAnesthetists: any = [];
  listOfTechnicians: any = [];
  patientDiagnosis: any = [];
  positioningData: any = [];
  positioningDevicesData: any = [];
  surgeryActivities: any = [];
  currentdate: any;
  anesthesiaTypes: any;
  rommsList: any;
  patientAdmissionMastertempData: any;
  patientAdmissionMasterData: any;
  roomsList: any;
  errorMessages: any[] = [];
  searchQuery: string = '';
  filteredData: any[] = [];
  showPositioningRemarks = false;
  showPositioningDevicesRemarks = false;
  facility: any;
  otpatinfo: any;
  readonly: any = false;
  isSaveDisabled: boolean = false;
  
  constructor(private service: SurgeryrecordService, 
    private router: Router, 
    private us: UtilityService, 
    private formbuilder: FormBuilder, 
    public datepipe: DatePipe,
    private surgeryUtils: SurgeryUtilsService) {
    super();

    this.item = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');

    this.suregeryRecordForm = this.formbuilder.group({
      AnesthesiaType: ['0'],
      OT: ['0'],
      SurgeryDate: this.item.DATETIME,
      Priority: ['1'],
      Case: [''],
      SkinPreparation: ['0'],
      SolutionUsed: [''],
      UrinaryCatheter: ['0'],
      Type: [''],
      Size: [''],
      PositioningDuringSurgery: [''],
      PositioningDevices: [''],
      NgTube: ['0'],
      NgTubeSize: [''],
      Diathermy: ['0'],
      Pad: ['0'],
      Site: ['1'],
      TotAnaesthesiaTime: ['0'],
      TotSurgeryTime: ['0']

    });

  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY H:mm');

    this.fetchAnesthesiaTypes();
    this.fetchPositioning();
    this.fetchPositioningDevices();


    if (this.data) {
      this.readonly = this.data.readonly;
      this.selectedView = this.data.selectedView;
      if(this.data.fromEHR==true)
      {
         sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
      }
      this.fetchotdetails();
    } else {
      this.fetchDiagnosis();
      this.fetchOTRooms();
      setTimeout(() => {
        this.fetchSurgeryRecord();
      }, 2000);
     
    }
    if (this.item.surgeryorderid === "") {
      this.fetchSurgeryRequest();
      this.fetchResourcesDetails();
      this.fetchSurgeryActivities();
    }  

    this.isSaveDisabled = this.surgeryUtils.isSaveDisabled();
  }

  fetchotdetails() {
    //const selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    const fromdate = moment(this.selectedView.AdmitDate).format('DD-MMM-YYYY');
    const todate = moment(new Date()).format('DD-MMM-YYYY');
    var SSNN = this.selectedView.SSN;
    this.url = this.service.getData(preoperativechekclist.fetch, { FromDate: fromdate, ToDate: todate, SSN: SSNN, FacilityId: 3395, Hospitalid: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (this.data.data.SurgeryRequestID) {
            this.item = response.SurgeryRequestsDataList.find((item: any) => item.SurgeryRequestid.toString() === this.data.data.SurgeryRequestID.toString());
            this.fetchDiagnosis();
            this.fetchOTRooms();
            this.fetchSurgeryRecord();
          }
        }
      },
        (err) => {
        });
  }

  fetchSurgeryRequest() {

    this.url = this.service.getData(surgeryrecord.FetchSurgeryData, { SurgeryRequestID: this.item.SurgeryRequestid, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchSurgeryDataDetailLevelDataList.length > 0) {
          this.surgeryRequestDetails = response.FetchSurgeryDataOrderLevelDataList;
          this.surgeryRequests = response.FetchSurgeryDataDetailLevelDataList;
          this.surgeryRequests.forEach((element: any, index: any) => {
            element.PriorityID = "1";
          });
        }
      },
        (err) => {
        })
  }

  fetchSurgeryRecord() {
    
    if (this.item.surgeryorderid !== "") {
      this.url = this.service.getData(surgeryrecord.FetchSurgeryorders, { OrderID: this.item.surgeryorderid, UserID: this.doctorDetails[0].UserId, WorkstationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.FetchSurgeryorders1DataList.length > 0) {
            //this.surgeryRequests = response.FetchSurgeryorders1DataList
            response.FetchSurgeryorders1DataList.forEach((element: any, index: any) => {
              this.surgeryRequests.push({
                "Code": element.ProcedureId,
                "SurgeryID": element.ProcedureId,
                "SurgeryName": element.ProcedureName,
                "PriorityID": element.PriorityID,
                "Seq": element.Sequence,
                "FromTime": moment(element.FromDateTime).format('HH:mm'),
                "ToTime": moment(element.ToDateTime).format('HH:mm'),
                "IsPrimary": element.IsPrimary === 'True' ? true : false
              });
            });
            response.FetchSurgeryorders2DataList.forEach((element: any, index: any) => {
              this.resourceDetails.push({
                "Resource": element.ServiceItemName,
                "ResourceID": element.ServiceItemID,
                "ResourceType": element.DomainName,
                "ResourceTypeID": element.DomainID,
                "Seq": element.sequence,
                "FromTime": moment(element.FromDateTime).format('HH:mm'),
                "ToTime": moment(element.ToDateTime).format('HH:mm')
              });
            });
            this.suregeryRecordForm.patchValue({
              AnesthesiaType: response.FetchSurgeryorders1DataList[0].AnaesthesiaID,
              OT: response.FetchSurgeryorders1DataList[0].OTID,
              SurgeryDate: moment(response.FetchSurgeryorders1DataList[0].OrderDate).format('DD-MMM-YYYY'),
              Priority: response.FetchSurgeryorders1DataList[0].PriorityID,
              //Case: [''],
              SkinPreparation: response.FetchSurgeryorders1DataList[0].IsSkinPrepared === 'True' ? '1' : '0',
              SolutionUsed: response.FetchSurgeryorders1DataList[0].SolutionsUsed,
              Case: response.FetchSurgeryorders1DataList[0].SurgeryCase,
              UrinaryCatheter: response.FetchSurgeryorders1DataList[0].IsUrinaryCatheter === 'True' ? '1' : '0',
              Type: response.FetchSurgeryorders1DataList[0].UrinaryCatheterType,
              Size: response.FetchSurgeryorders1DataList[0].UrinaryCatheterSize,
              //PositioningDuringSurgery: [''],
              //PositioningDevices: [''],
              NgTube: response.FetchSurgeryorders1DataList[0].IsNGTube === 'True' ? '1' : '0',
              NgTubeSize: response.FetchSurgeryorders1DataList[0].NGTubeSize,
              Diathermy: response.FetchSurgeryorders1DataList[0].IsDiathermy === 'True' ? '1' : '0',
              Pad: response.FetchSurgeryorders1DataList[0].isPadUsed === 'True' ? '1' : '0',
              Site: response.FetchSurgeryorders1DataList[0].Side,
              TotAnaesthesiaTime: response.FetchSurgeryorders1DataList[0].TotAnaesthesiaTime,
              TotSurgeryTime: response.FetchSurgeryorders1DataList[0].TotSurgeryTime
            });
            //this.surgeryActivities = response.SurgeryOrderActivitiesDataList;
            response.SurgeryOrderActivitiesDataList.forEach((element: any, index: any) => {
              this.surgeryActivities.push({
                "SurgeryActivityName": element.SurgeryActivityName,
                "SurgeryActivityID": element.SurgeryActivityID,
                "ActivityDate": element.ActualDateTime != "" ? new Date(element.ActualDateTime) : "",
                "ActivityTime": element.ActualDateTime != "" ? moment(element.ActualDateTime).format('HH:mm') : "",
                "ActivityRemarks": element.ReasonforDelay
              });
            });
            response.SurgeryOrderPositioningDataList.forEach((element: any, index: any) => {
              let find = this.positioningData.find((x: any) => x.id === element.PositioningDuringSurgeryID);
              if (find) {
                find.selected = true;
              }
            });
            response.SurgeryOrderPoistioningDevicesDataList.forEach((element: any, index: any) => {
              let find = this.positioningDevicesData.find((x: any) => x.id === element.PositioningDeviceID);
              if (find) {
                find.selected = true;
              }
            });
          }
        },
          (err) => {
          })
    }
  }

  fetchResourcesDetails() {
    this.resourceDetails.push({
      "Resource": this.item.SurgeonNo + '-' + this.item.SurgeonName,
      "ResourceID": this.item.ServiceItemID,
      "ResourceType": "Surgeon",
      "ResourceTypeID": 82,
      "Seq": this.resourceDetails.length + 1,
      "FromTime": this.item.ScheduleFromTime,
      "ToTime": this.item.ScheduleToTime
    });
    // this.resourceDetails.push({
    //   "Resource": this.item.AnaesthesianName,
    //   "ResourceID": this.item.AnaesthesianID,
    //   "ResourceType": "Anaesthesist",
    //   "ResourceTypeID": 83,
    //   "Seq": "",
    //   "FromTime": "",
    //   "ToTime": ""
    // });

  }

  onResourcesChange(res: any, type: string, event: any) {
    const val = event.target.value;
    res[type] = val;
  }

  onSurgeryChange(sur: any, type: string, event: any) {
    const val = event.target.value;
    sur[type] = val;
  }
  onSurgeryPrimaryChange(sur: any) {
    sur.IsPrimary = !sur.IsPrimary
  }

  searchScrubNurse(event: any) {
    var searchval = event.target.value;
    if (searchval.length > 2) {
      this.url = this.service.getData(surgeryrecord.FetchWitnessNurseDomain, {
        DomainID: 85,
        Filter: searchval,
        HospitalID: this.hospitalID
      });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.FetchRODNursesDataList.length > 0) {
            this.listOfItems = response.FetchRODNursesDataList;
          }
        },
          (err) => {
          })
    }
  }
  searchCirculNurse(event: any) {
    var searchval = event.target.value;
    if (searchval.length > 2) {
      this.url = this.service.getData(surgeryrecord.FetchWitnessNurseDomain, {
        DomainID: '94',
        Filter: searchval,
        HospitalID: this.hospitalID
      });
      // this.url = this.service.getData(surgeryrecord.FetchSSEmployees, 
      //   { name: event.target.value, UserId: this.doctorDetails[0].UserId, WorkStationID: this.doctorDetails[0]?.FacilityId, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.FetchRODNursesDataList.length > 0) {
            this.listOfItemsCir = response.FetchRODNursesDataList;
          }
          // if (response.Code == 200 && response.FetchSSEmployeesDataList.length > 0) {
          //   this.listOfItemsCir = response.FetchSSEmployeesDataList;
          // }
        },
          (err) => {
          })
    }
  }

  searchAnasthetist(event: any) {
    var searchval = event.target.value;
    if (searchval.length > 2) {
      this.url = this.service.getData(surgeryrecord.FetchWitnessNurseDomain, {
        DomainID: 83,
        Filter: searchval,
        HospitalID: this.hospitalID
      });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.FetchRODNursesDataList.length > 0) {
            this.listOfAnesthetists = response.FetchRODNursesDataList;
          }
        },
          (err) => {
          })
    }
  }
  searchTechnicians(event: any) {
    var searchval = event.target.value;
    if (searchval.length > 2) {
      this.url = this.service.getData(surgeryrecord.FetchWitnessNurseDomain, {
        DomainID: 70,
        Filter: searchval,
        HospitalID: this.hospitalID
      });
      // this.url = this.service.getData(surgeryrecord.FetchSSEmployees, 
      //   { name: event.target.value, UserId: this.doctorDetails[0].UserId, WorkStationID: this.doctorDetails[0]?.FacilityId, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.FetchRODNursesDataList.length > 0) {
            this.listOfTechnicians = response.FetchRODNursesDataList;
          }
          // if (response.Code == 200 && response.FetchSSEmployeesDataList.length > 0) {
          //   this.listOfTechnicians = response.FetchSSEmployeesDataList;
          // }
        },
          (err) => {
          })
    }
  }
  searchAsstSurgeon(event: any) {
    var searchval = event.target.value;
    if (searchval.length > 2) {
      this.url = this.service.getData(surgeryrecord.FetchWitnessNurseDomain, {
        DomainID: 82,
        Filter: searchval,
        HospitalID: this.hospitalID
      });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.FetchRODNursesDataList.length > 0) {
            this.listOfAnesthetists = response.FetchRODNursesDataList;
          }
        },
          (err) => {
          })
    }
  }
  onAnesthetistSelected(item: any) {
    this.resourceDetails.push({
      "Resource": item.ServiceitemName,
      "ResourceID": item.ServiceItemID,
      "ResourceType": "Anesthesiologist",
      "ResourceTypeID": 83,
      "Seq": this.resourceDetails.length + 1,
      "FromTime": "",
      "ToTime": ""
    });
    this.listOfAnesthetists = [];
    $("#anesthetist").val('');
  }

  onScreubNurseSelected(item: any) {
    this.resourceDetails.push({
      "Resource": item.ServiceitemName,
      "ResourceID": item.ServiceItemID,
      "ResourceType": "ScrubNurse",
      "ResourceTypeID": 85,
      "Seq": this.resourceDetails.length + 1,
      "FromTime": "",
      "ToTime": ""
    });
    this.listOfItems = [];
    $("#scrubNurse").val('');
  }
  onAsstNurseSelected(item: any) {
    this.resourceDetails.push({
      "Resource": item.ServiceitemName,
      "ResourceID": item.ServiceItemID,
      "ResourceType": "Asst. Nurse",
      "ResourceTypeID": 85,
      "Seq": this.resourceDetails.length + 1,
      "FromTime": "",
      "ToTime": ""
    });
    this.listOfItems = [];
    $("#asstNurse").val('');
  }

  onAsstSurgeonSelected(item: any) {
    this.resourceDetails.push({
      "Resource": item.ServiceitemName,
      "ResourceID": item.ServiceItemID,
      "ResourceType": "Asst. Surgeon",
      "ResourceTypeID": 82,
      "Seq": this.resourceDetails.length + 1,
      "FromTime": "",
      "ToTime": ""
    });
    this.listOfItems = [];
    $("#asstSurgeon").val('');
  }
  onTechnicianSelected(item: any) {
    this.resourceDetails.push({
      "Resource": item.ServiceitemName,
      "ResourceID": item.ServiceItemID,
      "ResourceType": "Technician",
      "ResourceTypeID": 70,
      "Seq": this.resourceDetails.length + 1,
      "FromTime": "",
      "ToTime": ""
    });
    this.listOfAnesthetists = [];
    $("#techinician").val('');
  }
  onCirculatingNurseSelected(item: any) {
    this.resourceDetails.push({
      "Resource": item.ServiceitemName,
      "ResourceID": item.ServiceItemID,
      "ResourceType": "Circulating Nurse",
      "ResourceTypeID": 94,
      "Seq": this.resourceDetails.length + 1,
      "FromTime": "",
      "ToTime": ""
    });
    this.listOfItemsCir = [];
    $("#anesthetist").val('');
  }

  deleteResource(index: any) {
    this.resourceDetails.splice(index, 1);
  }

  fetchDiagnosis() {

    this.url = this.service.getData(surgeryrecord.FetchAdviceDiagnosis, {
      Admissionid: this.item.AdmissionID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          this.patientDiagnosis = response.PatientDiagnosisDataList;
          this.patientDiagnosis.forEach((element: any, index: any) => {
            element.selected = false;
          });
        }
      },
        (err) => {
        })
  }

  fetchPositioning() {
    this.url = this.service.getData(surgeryrecord.FetchAdminMasters, {
      Type: 250,
      Filter: 'Blocked=0',
      USERID: this.doctorDetails[0].UserId,
      WORKSTATIONID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.AdminMastersInstructionsDataList.length > 0) {
          this.positioningData = response.AdminMastersInstructionsDataList;
          this.positioningData.forEach((element: any, index: any) => {
            element.selected = false;
          });
        }
      },
        (err) => {
        })
  }

  fetchPositioningDevices() {
    this.url = this.service.getData(surgeryrecord.FetchAdminMasters, {
      Type: 249,
      Filter: 'Blocked=0',
      USERID: this.doctorDetails[0].UserId,
      WORKSTATIONID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.AdminMastersInstructionsDataList.length > 0) {
          this.positioningDevicesData = response.AdminMastersInstructionsDataList;
          this.positioningDevicesData.forEach((element: any, index: any) => {
            element.selected = false;
          });
        }
      },
        (err) => {
        })
  }

  toggleSelectionForm(formCtrlName: string, val: string) {
    if (val != undefined)
      this.suregeryRecordForm.controls[formCtrlName].setValue(val);
  }

  fetchSurgeryActivities() {
    this.url = this.service.getData(surgeryrecord.FetchSurgeryActivities, {
      USERID: this.doctorDetails[0].UserId,
      WORKSTATIONID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchSurgeryActivitiesDataList.length > 0) {
          this.surgeryActivities = response.FetchSurgeryActivitiesDataList;
          this.surgeryActivities.forEach((element: any, index: any) => {
            if (element.SurgeryActivityID == '1') {
              element.ActivityDate = new Date(this.item.AdmitDate.split(' ')[0]);
              element.ActivityTime = moment(this.item.AdmitDate).format('HH:mm');
            }
            else if (element.SurgeryActivityID == '4' || element.SurgeryActivityID == '6' || element.SurgeryActivityID == '7' || element.SurgeryActivityID == '8' || element.SurgeryActivityID == '12') {
              element.ActivityDate = new Date();
              element.ActivityTime = moment(new Date()).format('HH:mm');
            }
            else
              element.ActivityDate = '';
            element.ActivityRemarks = '';
          });
        }
      },
        (err) => {
        })
  }

  onActivityChange(act: any, type: string, event: any) {
    const val = event.target.value;
    act[type] = val;
    if (act.SurgeryActivityID === '5' || act.SurgeryActivityID == '9') {
      if (act.ActivityDate != '' && act.ActivityTime != '') {
        const act5 = this.surgeryActivities.find((x: any) => x.SurgeryActivityID === '5');
        const act9 = this.surgeryActivities.find((x: any) => x.SurgeryActivityID === '9');

        const startDate = moment(act5.ActivityDate).format('DD-MMM-YYYY') + ' ' + act5.ActivityTime;
        const endDate = moment(act9.ActivityDate).format('DD-MMM-YYYY') + ' ' + act9.ActivityTime;

        this.suregeryRecordForm.patchValue({
          TotAnaesthesiaTime: isNaN(moment(endDate).diff(moment(startDate), 'minutes')) ? 0 : moment(endDate).diff(moment(startDate), 'minutes')
        })
      }
    }
    else if (act.SurgeryActivityID === '6' || act.SurgeryActivityID === '8') {
      if (act.ActivityDate != '' && act.ActivityTime != '') {
        const act5 = this.surgeryActivities.find((x: any) => x.SurgeryActivityID === '6');
        const act9 = this.surgeryActivities.find((x: any) => x.SurgeryActivityID === '8');

        const startDate = moment(act5.ActivityDate).format('DD-MMM-YYYY') + ' ' + act5.ActivityTime;
        const endDate = moment(act9.ActivityDate).format('DD-MMM-YYYY') + ' ' + act9.ActivityTime;

        this.suregeryRecordForm.patchValue({
          TotSurgeryTime: isNaN(moment(endDate).diff(moment(startDate), 'minutes')) ? 0 : moment(endDate).diff(moment(startDate), 'minutes')
        })
      }
    }
  }
  convertToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  }

  fetchOTRooms() {
    // this.url = this.service.getData(surgeryrecord.FetchWorkstationsAdv, {
    //   Type: 1,
    //   Filter: 'Blocked=0',
    //   USERID: this.doctorDetails[0].UserId,
    //   WORKSTATIONID: 3395,
    //   HospitalID: this.hospitalID
    // });
    this.url = this.service.getData(surgeryrecord.FetchOTROOMSurgeon,
      {
        DepartmentID: this.item.DepartmentID, UserID: this.doctorDetails[0].UserId, WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, Hospitalid: this.hospitalID
      });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchOTROOMList.length > 0) {
          this.roomsList = response.FetchOTROOMList;
        }
        const roomid = this.roomsList.find((x: any) => x.ServiceItemId === this.item.OTRoomID)

        this.suregeryRecordForm.patchValue({
          SurgeryDate: this.item.DATETIME,
          OT: roomid.FacilityID
        })
      },
        (err) => {
        })
  }
  fetchAnesthesiaTypes() {
    let inputData = {
      Type: '69',
      UserID: 0,
      LanguageID: 0,
    };
    this.us.post(surgeryrecord.GetPatientRegMasterData, inputData).subscribe(
      (response) => {
        if (response.Status == 'Success' && response.Code == 200) {
          this.patientAdmissionMasterData = response.MasterDataList;
          this.patientAdmissionMastertempData = this.patientAdmissionMasterData.reduce(
            (obj: any, v: any, i: any) => {
              obj[v.TableName] = obj[v.TableName] || [];
              obj[v.TableName].push(v);
              return obj;
            },
            {}
          );
          this.anesthesiaTypes = this.patientAdmissionMastertempData.AnesthesiaType[0].DemoGraphicsData;
        } else {
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  saveSurgeryRecord() {
    this.errorMessages = [];
    const resVal = this.resourceDetails.filter((x: any) => x.Seq === '' || x.FromTime === '' || x.ToTime === '');
    const surVal = this.surgeryRequests.filter((x: any) => x.Seq === '' || x.Seq === undefined || x.EstTime === '' || x.EstTime === undefined);
    if (surVal.length > 0) {
      this.errorMessages.push("Please enter Sequence and Est. Time for Surgeries");
    }
    if (resVal.length > 0) {
      this.errorMessages.push("Please enter Sequence, From Time & To Time for Resources");
    }
    if (this.suregeryRecordForm.get('AnesthesiaType')?.value === '0') {
      this.errorMessages.push("Please select AnesthesiaType");
    }
    if (this.suregeryRecordForm.get('OT')?.value === '0') {
      this.errorMessages.push("Please select OT");
    }
    if (this.errorMessages.length > 0) {
      $("#surgeryRecordSaveValidationMsg").modal('show');
      return;
    }

    var resources: any[] = [];
    this.resourceDetails.forEach((element: any, index: any) => {
      resources.push({
        "RET": element.ResourceTypeID,
        "IID": element.ResourceID,
        "RSEQ": element.Seq,
        "PID": this.item.ProcedureID,
        "FDT": moment(new Date()).format('DD-MMM-YYYY') + ' ' + element.FromTime,
        "TDT": moment(new Date()).format('DD-MMM-YYYY') + ' ' + element.ToTime
      })
    });
    var surgeries: any[] = [];
    this.surgeryRequests.forEach((element: any, index: any) => {
      surgeries.push({
        "PID": element.SurgeryID,
        "SID": this.item.ScheduleID,
        "SEQ": element.Seq,
        "ISP": element.IsPrimary,
        "PRI": element.Priority,
        "OTYPE": 37
      })
    });
    var activities: any[] = [];
    this.surgeryActivities.forEach((element: any, index: any) => {
      activities.push({
        "PID": this.item.ProcedureID,
        "SAID": element.SurgeryActivityID,
        "ADT": element.ActivityDate != '' ? moment(element.ActivityDate).format('DD-MMM-YYYY') + ' ' + element.ActivityTime : '',
        "RFD": element.ActivityRemarks
      })
    });
    var surgeryPositions: any[] = [];
    this.positioningData.forEach((element: any, index: any) => {
      if (element.selected) {
        if (element.name === 'Others') {
          surgeryPositions.push({
            "PID": element.id,
            "RMK": $("#others_positioning_remarks").val()
          })
        }
        else {
          surgeryPositions.push({
            "PID": element.id,
            "RMK": ''
          });
        }
      }
    });
    var positionDevices: any[] = [];
    this.positioningDevicesData.forEach((element: any, index: any) => {
      if (element.selected) {
        if(element.name === 'Others') {
          positionDevices.push({
            "PID": element.id,
            "RMK" : $("#others_positioning_devices_remarks").val()
          })
        }
        else {
        positionDevices.push({
          "PID": element.id,
          "RMK" : ''
        })
      }
      }
    });
    var postopDiag: any[] = [];
    this.postOpDiagosis.forEach((element: any, index: any) => {
      postopDiag.push({
        "DID": element.DiagnosisID
      })
    });
    var payload = {
      "OrderID": this.item.surgeryorderid === "" ? "0" : this.item.surgeryorderid,
      "PatientID": this.item.PatientID,
      "IPID": this.item.AdmissionID,
      "OrderDate": this.currentdate,
      "OStartTime": this.currentdate,
      "OEndTime": this.currentdate,
      "IncStartTime": this.currentdate,
      "IncEndTime": this.currentdate,
      "RRStartTime": this.currentdate,
      "RREndTime": this.currentdate,
      "AnaesthesiaID": this.suregeryRecordForm.get('AnesthesiaType')?.value,
      "OrderTypeID": '0',
      "OTID": this.suregeryRecordForm.get('OT')?.value,
      "Type": this.suregeryRecordForm.get('Type')?.value,
      "PatientType": this.item.patienttype,
      //"Connectionid": '',
      "Resources": resources,
      "Surgeries": surgeries,
      "Equipments": '',
      "Diseases": '',//postopDiag,
      "TransferID": '0',
      "USERID": this.doctorDetails[0].UserId,
      "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "SurgeryRequestID": this.item.SurgeryRequestid,
      "SurgeryActivities": activities,
      "SurgeryPatientPos": surgeryPositions,
      "SurgeryPosDevices": positionDevices,
      "IsSkinPrepared": this.suregeryRecordForm.get('SkinPreparation')?.value,
      "IsUrinaryCatheter": this.suregeryRecordForm.get('UrinaryCatheter')?.value,
      "UrinaryCatheterType": this.suregeryRecordForm.get('Type')?.value,
      "UrinaryCatheterSize": this.suregeryRecordForm.get('Size')?.value,
      "IsNGTube": this.suregeryRecordForm.get('NgTube')?.value,
      "NGTubeSize": this.suregeryRecordForm.get('NgTubeSize')?.value,
      "IsDiathermy": this.suregeryRecordForm.get('Diathermy')?.value,
      "isPadUsed": this.suregeryRecordForm.get('Pad')?.value,
      "Side": this.suregeryRecordForm.get('Side')?.value,
      "TotAnaesthesiaTime": this.suregeryRecordForm.get('TotAnaesthesiaTime')?.value,
      "TotSurgeryTime": this.suregeryRecordForm.get('TotSurgeryTime')?.value,
      "SolutionsUsed": this.suregeryRecordForm.get('SolutionUsed')?.value,
      "IsEmergency": '0',
      "SurgeryCase": this.suregeryRecordForm.get('Case')?.value,
    }
    this.us.post(surgeryrecord.Savesurgeryorders, payload).subscribe((response) => {
      if (response.Status === "Success") {
        $("#surgeryRecSavedMsg").modal('show');
      }
    },
      (err) => {

      })
  }


  navigateBackToOtDashboard() {
    $('#selectPatientYesNoModal').modal('show');
  }

  onAccept() {
    const otpatient = JSON.parse(sessionStorage.getItem("otpatient") || '{}');
    const SSN = otpatient.SSN;
    $('#selectPatientYesNoModal').modal('hide');
    sessionStorage.setItem('navigateToDashboard', SSN)
    this.router.navigate(['/ot/ot-dashboard']);
  }

  onDecline() {
    $('#selectPatientYesNoModal').modal('hide');
    this.router.navigate(['/ot/ot-dashboard']);
  }

  fetchDiagnosisSearch(event: any) {
    var filter = event.target.value;
    if (filter.length >= 3) {

      this.url = this.service.getData(surgeryrecord.FetchDiagnosisSmartSearch,
        {
          Filter: filter, DoctorID: this.doctorDetails[0].UserId
        });
      var payload = {};
      this.us.post(this.url, payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfDiagosis = response.FetchDiagnosisSmartDataList;
            //this.filterData();
          }
        },
          (err) => {
          })
    } else {
      this.listOfDiagosis = [];
    }
  }

  filterData() {
    if (this.searchQuery) {
      this.filteredData = this.listOfDiagosis.filter((item: any) => item.Name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    } else {
      this.filteredData = this.listOfDiagosis;
    }
  }

  selectItem(item: any) {
    this.searchQuery = item.Name;
    this.listOfDiagosis = [];
    const itemExists = this.postOpDiagosis.find((x: any) => x.itemid === item.itemid);
    if (!itemExists) {
      this.postOpDiagosis.push({
        "DiagnosisID": item.itemid.toString().trim(),
        "DiagnosisName": item.Name.toString().trim(),
        "DiagnosisCode": item.itemCode.toString().trim()
      });
    }
    else {
      this.errorMessages = [];
      this.errorMessages.push("Duplicate diagnosis is not allowed");
      $("#surgeryRecordSaveValidationMsg").modal('show');
    }
  }
  selectpatdiag(diag: any) {
    diag.selected = !diag.selected;
  }

  movePreDiagToPostDiag() {
    const prediag = this.patientDiagnosis.filter((x: any) => x.selected);
    prediag.forEach((element: any, index: any) => {
      this.postOpDiagosis.push({
        "DiagnosisID": element.DiseaseID,
        "DiagnosisName": element.DiseaseName,
        "DiagnosisCode": element.Code
      })
    });
  }
  deleteSelectedPostOpDiag(index: any) {
    this.postOpDiagosis.splice(index, 1);
  }

  selectPositioningData(pos: any) {
    pos.selected = !pos.selected;
    if (pos.name === 'Others' && pos.selected) {
      this.showPositioningRemarks = true;
    }
    else {
      this.showPositioningRemarks = false;
    }
  }
  selectPositioningDeveicesData(dev: any) {
    dev.selected = !dev.selected;
    if (dev.name === 'Others' && dev.selected) {
      this.showPositioningDevicesRemarks = true;
    }
    else {
      this.showPositioningDevicesRemarks = false;
    }
  }

  openOtQuickActions() {
    this.otpatinfo = this.item;
    $("#ot_quickaction_info").modal('show');
  }

  closeOtModal() {
    this.otpatinfo = "";
    $("#ot_quickaction_info").modal('hide');
  }

  templatePrint() {
    const headerImage = 'assets/images/header.jpeg';
    const footerImage = 'assets/images/footer.jpeg';
  
    // Remove any existing headers and footers
    const existingHeader = document.getElementById('dynamic-header');
    const existingFooter = document.getElementById('dynamic-footer');
    
    if (existingHeader) {
      existingHeader.remove();
    }
    if (existingFooter) {
      existingFooter.remove();
    }
  
    // Set a timeout to wait for the elements to be added before triggering print
    setTimeout(() => {
       document.title = 'SurgeryRecord_'+ new Date().toISOString();
      window.print();  // Trigger print dialog

    }, 500);
  }
}

export const surgeryrecord = {
  FetchSurgeryData: 'FetchSurgeryData?SurgeryRequestID=${SurgeryRequestID}&HospitalID=${HospitalID}',
  //FetchSSDomainAgainstServiceItems: 'FetchSSDomainAgainstServiceItems?Name=${Name}&DomainID=${DomainID}&HospitalID=${HospitalID}',
  FetchAdviceDiagnosis: 'FetchAdviceDiagnosis?TBL=1&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  FetchAdminMasters: 'FetchAdminMasters?Type=${Type}&Filter=${Filter}&USERID=${USERID}&WORKSTATIONID=${WORKSTATIONID}&HospitalID=${HospitalID}',
  FetchSurgeryActivities: 'FetchSurgeryActivities?USERID=${USERID}&WORKSTATIONID=${WORKSTATIONID}&HospitalID=${HospitalID}',
  FetchWorkstationsAdv: 'FetchWorkstationsAdv?Type=${Type}&Filter=${Filter}&USERID=${USERID}&WORKSTATIONID=${WORKSTATIONID}&HospitalID=${HospitalID}',
  GetPatientRegMasterData: 'GetPatientRegMasterData',
  Savesurgeryorders: 'Savesurgeryorders',
  FetchSurgeryorders: 'FetchSurgeryorders?OrderID=${OrderID}&UserID=${UserID}&WorkstationID=${WorkstationID}&HospitalID=${HospitalID}',
  FetchOTROOMSurgeon: 'FetchOTROOMSurgeon?DepartmentID=${DepartmentID}&UserID=${UserID}&WorkStationID=${WorkStationID}&Hospitalid=${Hospitalid}',
  FetchDiagnosisSmartSearch: 'FetchDiagnosisSmartSearch?Filter=${Filter}&DoctorID=${DoctorID}',
  FetchWitnessNurse: 'FetchWitnessNurse?Filter=${Filter}&HospitalID=${HospitalID}',
  FetchWitnessNurseDomain: 'FetchWitnessNurseDomain?Filter=${Filter}&DomainID=${DomainID}&HospitalID=${HospitalID}',
  FetchSSEmployees: "FetchSSEmployees?name=${name}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
};  