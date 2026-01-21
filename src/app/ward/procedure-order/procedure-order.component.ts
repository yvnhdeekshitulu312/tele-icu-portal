import { DatePipe } from '@angular/common';
import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { ProcedureOrderService } from './procedureorder.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ProcedureOrderDetails } from './urls';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
declare var $: any;
@Component({
  selector: 'app-procedure-order',
  templateUrl: './procedure-order.component.html',
  styleUrls: ['./procedure-order.component.scss'],
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
export class ProcedureOrderComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() data: any;
  IsHome = true;
  procedureForm: any;
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
  procList: any = [];
  listOfBeds:any=[];
  FetchPPriorityDataList: any;
  FetchClinicalProceduresViewDataList: any = [];
  procedureViewList: any = [];
  datesForm: any;
  selectedProcedures: any = [];
  errorMessages: any[] = [];
  selectedProcOrderFromView: any= [];
  FetchClinicalProceduresViewDataSelecList: any;
  showViewValidationMsg = false;
  //data: any;
  readonly: boolean = false;
  isFrom = "";
  wardIDN: any;
  
  constructor(@Inject(ProcedureOrderService) private service: ProcedureOrderService, private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private datePipe: DatePipe, private bedconfig: BedConfig) {
    super();
    this.datesForm = this.formBuilder.group({
      fromdate: [new Date()],
      todate: [new Date()]
    });
    this.PatientID = sessionStorage.getItem("PatientID");
    this.isFrom = sessionStorage.getItem("isFrom") || "";
    if (this.PatientID !== undefined && this.PatientID !== '' && this.PatientID !== null)
      this.fromBedsBoard = true;
    //this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    const currentDateTime = new Date();
    const currentTime = currentDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    this.procedureForm =  this.formBuilder.group({
      TSTORDID: '',
      TSTORRDITMID: '',
      TSTID: '',
      Name: '',
      ProcName: '',
      PriorityID: 0,
      Priority : '',
      Date: new Date(),
      SSN: '',
      Time: currentTime,
      Qty: '',
      Remarks: ''
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

  ngOnDestroy(): void {
    sessionStorage.removeItem("isFrom");
  }

  ngOnInit(): void {
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.location = sessionStorage.getItem("locationName");
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.IsHome = this.InputHome;
    this.wardID = this.wardIDN=this.ward.FacilityID;
    if (this.data) {      
       if(this.data.isFrom === 'physiotherapyreferral') {
        this.isFrom = this.data.isFrom;
        this.fetchPatientDetails(this.data.data.SSN, '0', '0');
       }
       else {
        this.readonly = this.data.readonly;
       }
    }
    if (this.selectedView.PatientType == "2") {
      if (this.selectedView?.Bed.includes('ISO'))
        this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
      else
        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }
    this.fetchPriority();
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
    this.url = this.service.getData(ProcedureOrderDetails.fetchPatientDataBySsn, {
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
            if(this.data && this.data.isFrom === 'physiotherapyreferral') {
              sessionStorage.setItem("selectedView",  JSON.stringify(this.data.data));
            }
          }

          this.noPatientSelected = true;
          this.fetchPatientVisits();

        }
      },
        (err) => {

        })
  }

  fetchPatientVisits() {
    this.url = this.service.getData(ProcedureOrderDetails.FetchPatientVisits, { Patientid: this.PatientID, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          setTimeout(() => {
            this.admissionID = response.PatientVisitsDataList[0].AdmissionID;
            // this.fetchPriority();
            this.url = this.service.getData(ProcedureOrderDetails.FetchPatientVistitInfo, { Patientid: this.PatientID, Admissionid: response.PatientVisitsDataList[0].AdmissionID, HospitalID: this.hospitalID });
            this.us.get(this.url)
              .subscribe((response: any) => {
                if (response.Code == 200) {
                  this.selectedView = response.FetchPatientVistitInfoDataList[0];
                  this.wardID =this.wardIDN= this.selectedView.WardID;
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

  onSelected(item: any) {
    this.procList = [];
    this.procedureForm.patchValue({
      TSTID: item.ProcedureID,
      Name: item.ProcedureCode+'-'+item.ProcedureName,
      ProcName: item.ProcedureCode+'-'+item.ProcedureName,
      Qty:1
    });
  }

  searchProcedure(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(ProcedureOrderDetails.FetchClinicalProcedures, { Filter: event.target.value, WorkStationID: this.wardID, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
           this.procList = response.FetchClinicalProceduresDataList;
          }
        },
          (err) => {
          })
    }
  }

  clear() {
    this.selectedProcOrderFromView=[];
    this.noPatientSelected = false;
    this.selectedProcedures = [];
    this.procedureForm.patchValue({
      SSN: ''
    });
    this.procedureViewList = [];
    $("#BedSearch").val('');
  }

  fetchPriority() {
    this.url = this.service.getData(ProcedureOrderDetails.FetchPPriority, { UserID: this.doctorDetails[0]?.UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPPriorityDataList = response.FetchPPriorityDataList;
        }
      },
        (err) => {
        })
  }

  add() {    

    if(this.procedureForm.get("TSTID").value!=""&&this.procedureForm.get("Qty").value!=""){
      this.selectedProcedures.push({
        TSTID: this.procedureForm.get("TSTID").value,
        Name: this.procedureForm.get("Name").value,
        PriorityID: this.procedureForm.get("PriorityID").value,
        Priority : this.procedureForm.get("Priority").value,
        Date: moment(this.procedureForm.get("Date").value).format('DD-MMM-YYYY'),
        SSN: '',
        Time: this.procedureForm.get("Time").value,
        Qty: this.procedureForm.get("Qty").value,
        Remarks: this.procedureForm.get("Remarks").value
      });
    }else {
      this.errorMessages = [];
      this.errorMessages.push("Please Select Procedure");
      this.errorMessages.push("Please enter Quantity");
      $("#ipissuesSaveValidation").modal('show');
    }
    

    const currentDateTime = new Date();
    const currentTime = currentDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    this.procedureForm =  this.formBuilder.group({
      TSTORDID: '',
      TSTORRDITMID: '',
      TSTID: '',
      Name: '',
      PriorityID: 0,
      Priority : '',
      Date: new Date(),
      SSN: '',
      Time: currentTime,
      Qty: '',
      Remarks: '',
      ProcName: ''
    });
  }

  FetchClinicalProceduresView() {
    if(this.isFrom=='physiotherapy')
      this.wardID=0;
    else{
      this.wardID=this.wardIDN;
    }
      
    if(this.datesForm.get('fromdate').value && this.datesForm.get('todate').value) {
      this.url = this.service.getData(ProcedureOrderDetails.FetchClinicalProceduresView, { SSN : this.selectedView.SSN, FromDate :  moment(this.datesForm.get('fromdate').value).format('DD-MMM-YYYY'), ToDate : moment(this.datesForm.get('todate').value).format('DD-MMM-YYYY'), WardID: this.wardID , WorkStationID: this.wardID, HospitalID: this.hospitalID});
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.FetchClinicalProceduresViewDataList = response.FetchClinicalProceduresViewDataList;
            this.procedureViewList = [];
            this.FetchClinicalProceduresViewDataList.forEach((element:any, index:any) => {
              const scheduleDateTime = new Date(element.ScheduleDate);
  
              const currentTime = scheduleDateTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
             
              this.procedureViewList.push({
                TSTORDID: element.TestOrderID,
                TSTORRDITMID: element.TestOrderItemID,
                TSTID: element.TestID,
                Name: element.TestCode+'-'+element.TestName,
                PriorityID: 0,
                Priority : element.OrderType,
                Date: moment(scheduleDateTime).format('DD-MMM-YYYY'),
                SSN: '',
                Time: currentTime,
                Qty: '',
                Remarks: '',
                selected: false
              });
            });
          }
        },
          (err) => {
          })
    }
  }

  PriorityChange(event: any) {
    var pri = event.target.options[event.target.options.selectedIndex].text;
    this.procedureForm.patchValue({
      Priority: pri
    });
  }

  delete(TSTID: any) {
    this.selectedProcedures = this.selectedProcedures.filter((element: any) => {
      return element.TSTID !== TSTID;
    });
  }

  save() {
    var TestDetails: any = [];
    this.selectedProcedures.forEach((element: any, index: any) => {
      TestDetails.push({
        "PRID": element.PriorityID==undefined?0:element.PriorityID,
        "TSTID": element.TSTID,
        "SEQ": index + 1,
        "SDT": element.Date + ' ' + element.Time,
        "REM": element.Remarks,
        "TOIQ": element.Qty
      })
    });

    let payload = {
      "TestOrderID":this.selectedProcOrderFromView.TSTORDID==undefined?0:this.selectedProcOrderFromView.TSTORDID,
      "IPID": this.selectedView.AdmissionID,
      "OrderTypeID": "13",
      "WardID": this.wardID==0?this.wardIDN:this.wardID,
      "PatientID": this.selectedView.PatientID,
      "PatientType": this.selectedView.PatientType,
      "Remarks": TestDetails?.map((item: any) => item.REM).join('| '),
      "UserId": this.doctorDetails[0]?.UserId,
      "WorkStationID": this.wardID==0?this.wardIDN:this.wardID,
      "HospitalId": this.hospitalID,
      "TestDetails": TestDetails
    }

    this.us.post(ProcedureOrderDetails.SaveWardProcedureOrderN, payload).subscribe((response) => {
      if (response.Code == 200) {
        $("#savemsg").modal('show');
      } else {

      }
    },
      (err) => {
        console.log(err)
      })
  }

  viewProcedures() {
    $("#viewProcedures").modal('show');
    this.procedureViewList = [];
    this.FetchClinicalProceduresView();
  }
  navigatetoBedBoard() {
    this.router.navigate(['/ward']);
  }

  selectedProcedure(proc: any) {
    this.selectedProcedures = [];
    // var procF = this.procedureViewList.filter((x: any) => x.TestOrderID == proc.TestOrderID);
    // procF.forEach((element:any, index:any) => {
    //   this.selectedProcedures.push({
    //     TSTID: element.TSTID,
    //     Name: element.Name,
    //     PriorityID: element.PriorityID,
    //     Priority : element.Priority,
    //     Date: moment(element.Date).format('DD-MMM-YYYY'),
    //     SSN: '',
    //     Time: element.Time,
    //     Qty: element.Qty,
    //     Remarks: element.Remarks,
    //   });
    // });
   
    //this.selectedProcedures.push(procF);
    //this.selectedProcedures.push(proc);
    if(this.procedureViewList.filter((x:any) => x.selected).length === 0) {
      this.showViewValidationMsg = true;
      return;
    }
    else {
      this.showViewValidationMsg = false;
    }
    this.fetchClinicalProceduresViewSelected(proc);
    $("#viewProcedures").modal('hide');
  }

  fetchClinicalProceduresViewSelected(proc:any) {
    this.url = this.service.getData(ProcedureOrderDetails.FetchClinicalProceduresViewSelected, { 
      TestOrderID: this.selectedProcOrderFromView.TSTORDID, UserID: this.doctorDetails[0]?.UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
     
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchClinicalProceduresViewDataSelecList = response.FetchClinicalProceduresViewDataSelecList;
          this.FetchClinicalProceduresViewDataSelecList.forEach((element:any, index:any) => {
            this.selectedProcedures.push({
              TSTORDID: element.TestOrderID,
                TSTORRDITMID: element.TestOrderItemID,
                TSTID: element.TestID,
                Name: element.ProcedureCode+'-'+element.Procedure,
                //PriorityID: proc.PriorityID,
                //Priority : proc.Priority,
                Date: element.Tobedoneon,
                SSN: '',
                Time: element.ToBeDoneOnTime,
                Qty: element.Qty,
                Remarks: element.REM
            })
          });
          
        }
      },
        (err) => {
        })
  }

  selectProcOrder(sur: any) {
    this.procedureViewList.forEach((element: any, index: any) => {
      if (element.TSTORRDITMID === sur.TSTORRDITMID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.selectedProcOrderFromView = sur;
    this.showViewValidationMsg = false;
  }
  
  clearView() {
    this.showViewValidationMsg = false;
    this.procedureViewList.forEach((element: any, index: any) => {      
        element.selected = false;      
    });
    this.datesForm.patchValue({
      fromdate: new Date(),
      todate: new Date()
    });
    this.procedureViewList = [];
    this.FetchClinicalProceduresView();
  }

  close() {
    const cathLabfacility = JSON.parse(sessionStorage.getItem("cathLabfacility") || '{}');    
    sessionStorage.removeItem('fromCathLab');
    sessionStorage.removeItem('InPatientDetails');
    sessionStorage.removeItem('BedList');
    sessionStorage.removeItem('selectedView');
    this.bedconfig.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalID)
      .subscribe((response: any) => {
        if(Object.keys(cathLabfacility).length > 0) {
          var facilityName = response.FetchUserFacilityDataList.find((x: any) => x.FacilityID === cathLabfacility.FacilityID);
          sessionStorage.setItem("facility", JSON.stringify(facilityName));       
          sessionStorage.setItem("FacilityID", JSON.stringify(cathLabfacility.FacilityID));
          sessionStorage.removeItem('cathLabfacility');
        }
        this.us.closeModal();
      },
        (err) => {
        })    
    
  }


    searchBed(event: any) {
      if (event.target.value.length >= 3) {
        this.url = this.service.getData(ProcedureOrderDetails.FetchAllBeds, { Name: event.target.value, WorkStationID: this.wardID, HospitalID: this.hospitalID });
        this.us.get(this.url)
          .subscribe((response: any) => {
            if (response.Code == 200) {
             this.listOfBeds = response.FetchAllBedsDataList;
            }
          },
            (err) => {
            })
      } else {
        this.listOfBeds = [];
      }
    }
    onItemBedSelected(Bed: any) {
      //this.service.param.BedID = Bed.BedID;
      this.listOfBeds = [];
      this.FetchPatientInfonBed(Bed.BedName);
    }

    FetchPatientInfonBed(BedID: string) {
      this.url = this.service.getData(ProcedureOrderDetails.FetchPatientInfonBed, {
        BedNo: BedID,       
        UserId: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
        WorkStationID: this.service.param.WorkStationID,
        HospitalID: this.hospitalID ?? this.service.param.HospitalID,
      });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {           
              this.PatientID = response.FetchPatientDataCCList[0].PatientID;
              this.selectedView = response.FetchPatientDataCCList[0];
              this.noPatientSelected = true;
              this.fetchPatientVisits();  
          }
        },
          (err) => {
  
          })
    }

  navigatetophysio() {
    this.router.navigate(['/suit/physiotherapyworklist']);
  }
}
