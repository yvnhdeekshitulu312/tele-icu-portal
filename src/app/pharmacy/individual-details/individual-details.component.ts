import { Component, OnInit } from '@angular/core';
import { IndividualProcessingService } from '../individual-processing/individualprocessing.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { individualDetails } from './urls';
import { UtilityService } from 'src/app/shared/utility.service';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { ConfigService as PresConfig } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import * as Highcharts from 'highcharts';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { AdmissionreconciliationComponent } from 'src/app/ward/admissionreconciliation/admissionreconciliation.component';
import { ConfigService as PhaConfig } from '../services/config.service';

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
  selector: 'app-individual-details',
  templateUrl: './individual-details.component.html',
  styleUrls: ['./individual-details.component.scss'],
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
export class IndividualDetailsComponent extends BaseComponent implements OnInit {
  url: any;
  FetchIndividualProcessingDetailsDataList: any;
  FetchIndividualProcessingDetailsTList: any;
  FetchIndividualProcessingIssueDetailsDataList: any;
  errorMessage: any;
  FetchSubstituteItemsDList: any;
  SelectedViewClass: any;
  selectedPatientMedications: any;
  objPatientVitalsList: any;
  selectedPatientAllergies: any;
  selectedPatientInfo: any;
  patientDiseasesDataLists: any;
  remarksForSelectedHoldItemName: any;
  selectedHoldReason: string = "0";
  selectedHoldReason_prev: string = "0";
  remarksForSelectedHoldItemId_prev: any;
  remarksForSelectedHoldPrescId_prev: any;
  remarksForSelectedHoldItemName_prev: any;
  holdReasonValidation: boolean = false;
  holdReasonValidation_prev: boolean = false;
  holdMasterList: any = [];
  remarksSelectedIndex: number = -1;
  remarksForSelectedHoldItemId: any;
  remarksForSelectedHoldPrescId: any;
  trustedUrl: any;
  holdBtnName: string = 'Hold';
  pinfo: any;
  IndPreviousPrescDataList: any = [];
  IndMedicationHistoryDataList: any = [];
  IndPreviousPrescDisDataList: any = [];
  MedicationType = '1';
  IssueValidation = '';
  smartDataList: any;
  patientHigh: any;
  showResultsinPopUp = false;
  isVerified = false;
  saveMsg = "Saved Succesfully"
  VerifiedBy: any;
  VerifiedDate: any;
  selectedItemsList: any = [];
  lastSavedAdmReconDate: any;
  admReconStatus: any;
  selectedWardIndProc: any;

  drugDataArray: any[] = [];
  drugs: any[] = [];
  calendarFilteredMedications: any = [];
  hoursArray: string[] = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  currentDate: Date = new Date();
  firstDayOfWeek!: Date;
  lastDayOfWeek!: Date;
  currentWeekDates: any;
  showChart: boolean = false;

  constructor(private router: Router, private service: IndividualProcessingService, private us: UtilityService, private appconfig: ConfigService,
    private presconfig: PresConfig, private modalSvc: NgbModal, private mdlsvc: GenericModalBuilder, private datepipe: DatePipe, private bedConfig: BedConfig, private config: PhaConfig) {
    super()
  }

  ngOnInit(): void {
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.selectedWardIndProc = JSON.parse(sessionStorage.getItem("selectedWardIndProc") || '{}');
    this.service.param = {
      ...this.service.param,
      PatientID: this.individualProcess.PatientID,
      AdmissionID: this.individualProcess.IPID,
      WardID: this.individualProcess.WardID,
      PrescriptionID: this.individualProcess.PrescriptionID,
      IsDisPrescription: this.individualProcess.isDisPrescription === "True" ? 1 : 0,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,

    };

    if (this.individualProcess.BedName.includes('ISO'))
      this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
    else
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";

    this.fetchPatientFileInfo();
    this.FetchIndividualProcessingDetails();
    this.FetchHoldMaster();
  }
  isdetailShow = false;
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
  FetchIndividualProcessingDetails(dataSaved : boolean = false) {
    this.url = this.service.getData(individualDetails.fetchData);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.Message != '') {
            this.errorMessage = response.Message;
            $("#errorMsg").modal('show');
          }
          this.FetchIndividualProcessingDetailsTList = response.FetchIndividualProcessingDetailsTList;
          this.FetchIndividualProcessingDetailsDataList = response.FetchIndividualProcessingDetailsDataList;
          this.FetchIndividualProcessingIssueDetailsDataList = response.FetchIndividualProcessingSubDetailsList;

          if (this.FetchIndividualProcessingIssueDetailsDataList.length > 0) {
            this.isVerified = this.FetchIndividualProcessingIssueDetailsDataList[0]?.IsVerified === 'True' ? true : false;
            this.VerifiedBy = this.FetchIndividualProcessingIssueDetailsDataList[0]?.VerifiedByName;
            this.VerifiedDate = this.FetchIndividualProcessingIssueDetailsDataList[0]?.VerifiedDate;
          }

          this.FetchIndividualProcessingDetailsDataList.forEach((element: any, index: any) => {
            element.initialReqQty = element.reqQty;
            element.EditReqQty = element.FinalQty == 0 ? element.reqQty : (element.FinalQty < 0 ? element.reqQty : element.FinalQty);
            var issuedItemS = this.FetchIndividualProcessingIssueDetailsDataList.find((x: any) => x.OrderItemID === element.ItemId);
            var issuedItem = this.FetchIndividualProcessingIssueDetailsDataList.find((x: any) => x.ItemID === element.ItemId);
            if (issuedItem != undefined) {
              element.IssuedItem = issuedItem.IssuedDrugname;
              element.IssuedBatchNo = issuedItem.BatchID;
              element.IssuedUOM = issuedItem.UOM;
              element.issuedDate = issuedItem.SalesDate;
              element.IsSubT = 0;
            }else  if (issuedItemS != undefined) {
              element.IssuedItem = issuedItemS.IssuedDrugname;
              element.IssuedBatchNo = issuedItemS.BatchID;
              element.IssuedUOM = issuedItemS.UOM;
              element.issuedDate = issuedItemS.SalesDate;
              element.IsSubT = 1;
            }
            else {
              element.IssuedItem = "";
              element.IssuedBatchNo = "";
              element.IssuedUOM = "";
              element.issuedDate = "";
              element.IsSubT = 0;
            }
            element.itemViewMore = false;
            //displaying FinalQty as IssueQty if IssQty is not null
            if (element.IssQty !== '') {
              element.FinalQty = element.IssQty;
            }
          });
          if(dataSaved) {
            this.showViewBulkProcessingPrint();
          }
        }
      },
        (err) => {

        })
  }

  navigateToProcessing() {
    this.service.param = {
      ...this.service.param,
      WardID: 0,
    };
    // this.router.navigate(['/pharmacy/IndividualProcessing'])
    $('#selectPatientYesNoModal').modal('show');
  }

  onAccept() {
    $('#selectPatientYesNoModal').modal('hide');
    sessionStorage.setItem('selectedWardIndProcDet', JSON.stringify(this.selectedWardIndProc));
    this.router.navigate(['/pharmacy/IndividualProcessing']);
  }

  onDecline() {
    $('#selectPatientYesNoModal').modal('hide');
    sessionStorage.removeItem('selectedWardIndProcDet');
    this.router.navigate(['/pharmacy/IndividualProcessing']);
  }

  validateReqQty(item: any, event: any) {
    // if (item.reqQty > item.initialReqQty) {
    //   item.reqQty = item.initialReqQty;
    //   this.errorMessage = "Required quantity should not be greater than Prescribed Qty";
    //   $("#errorMsg").modal('show');
    //   return;
    // } else {
    //   item.EditReqQty = event.target.value;
    // }
    item.EditReqQty = event.target.value;
  }

  SaveMedicationIssue() {
    this.IssueValidation = '';
    this.FetchIndividualProcessingDetailsDataList.forEach((element: any, index: any) => {
      element.reqQty = element.EditReqQty;
    });

    var result = this.FetchIndividualProcessingDetailsDataList.filter((a: any) => a.reqQty > 0 && (a.HoldStatus == null||a.HoldStatus ==0));
    if (result.length === 1) {
      result.forEach((element: any, index: any) => {
        if (element.IssQty == element.reqQty) {
          this.IssueValidation = '1';

        }
      });
      if (this.IssueValidation == '1') {
        this.errorMessage = "Medication already Issued";
        $("#errorMsg").modal('show');
        return;
      }

    }

    result.forEach((element: any, index: any) => {
      element.reqQty = element.EditReqQty;
    });

    if (result.length === 0) {
      this.errorMessage = "Enter required quantity";
      $("#errorMsg").modal('show');
      return;
    }

    var payload = {
      "PatientID": this.individualProcess.PatientID,
      "IPID": this.individualProcess.IPID,
      "BedID": '',
      "TransferID": this.FetchIndividualProcessingDetailsTList[0].TransferID,
      "DoctorID": this.individualProcess.DoctorID,//this.doctorDetails[0].EmpId,
      "DrugOrderID": this.FetchIndividualProcessingDetailsTList[0].DrugOrderID,
      "PrescriptionID": this.individualProcess.PrescriptionID,
      "isDisPrescription": this.individualProcess.isDisPrescription,
      "SystemCheck": true,
      "GenericAccept": 1,
      "Hospitalid": this.hospitalID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facilitySessionId,
      "ItemXMLDetails": result
    };
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.us.post(individualDetails.saveN, payload)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.FetchIndividualProcessingDetails(true);
              //this.showViewBulkProcessingPrint();
              this.saveMsg = "Saved Successfully"
              $("#saveMsg").modal('show');              
            }
            if (response.Code == 604) {
              this.saveMsg = response.Message
              $("#saveMsg").modal('show');
            }

          },
            (err) => {

            })
      }
      modalRef.close();
    }); 
    
  }

  getSub(item: any) {
    if (item.FinalQty !== 0) {
      this.service.param.ItemID = item.ItemId;
      this.url = this.service.getData(individualDetails.substitute);

      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.FetchSubstituteItemsDList = response.FetchSubstituteItemsDList;
            if (this.FetchSubstituteItemsDList.length > 0) {
              $("#substitute_Modal").modal('show');
            }
            else {
              this.errorMessage = "No substitutes for this drug";
              $("#errorMsg").modal('show');
            }
          }
        },
          (err) => {

          })
    }
    else {
      this.errorMessage = "Full quantity issued for this drug";
      $("#errorMsg").modal('show');
    }
  }

  substitute(item: any) {
    var result = this.FetchIndividualProcessingDetailsDataList.filter((a: any) => a.ItemId === this.service.param.ItemID);

    if (result.length > 0) {
      result[0].OldItemId = this.service.param.ItemID;
      result[0].ISSUB = 1;
      result[0].Item = item.ItemName;
      result[0].ItemId = item.ItemID;
      result[0].Qoh = item.QoH;
      result[0].Dose = item.Dose;
      result[0].QUoM = item.QUoM;
      result[0].UID = item.QUOMID;
      result[0].PID = item.QOHPackID;
      //result[0].SItemId = item.ItemID;
      result[0].SPID = item.QOHPackID;
      result[0].SUID = item.QUOMID;


    }

    $("#substitute_Modal").modal('hide');
  }

  fetchPatientFileInfo() {
    this.appconfig.FetchPatientAdmissionClinicalDetails(this.service.param.PatientID, this.service.param.AdmissionID, this.hospitalID).subscribe((response: any) => {

      if (response.FetchPatientMedicationDataLists.length > 0) {
        this.selectedPatientMedications = response.FetchPatientMedicationDataLists;
      }

      if (response.FetchPatientVitalssDataLists.length > 0) {
        this.objPatientVitalsList = response.FetchPatientVitalssDataLists;
      }

      if (response.FetchPatientAllergiesDataLists.length > 0) {
        this.selectedPatientAllergies = response.FetchPatientAllergiesDataLists;
      }

      if (response.FetchPatientInfoDataLists.length > 0) {
        this.selectedPatientInfo = response.FetchPatientInfoDataLists[0];
      }
      if (response.FetchPatientDiseasesDataLists.length > 0) {
        response.FetchPatientDiseasesDataLists.forEach((element: any, index: any) => {
          if (this.patientDiseasesDataLists != undefined)
            this.patientDiseasesDataLists += element.DiseaseName + " , ";
          else
            this.patientDiseasesDataLists = element.DiseaseName + " , ";
        });
      }
    })
  }

  selectedHoldItem(index: any) {
    if (index.FinalQty !== 0) {
      this.remarksForSelectedHoldItemName = index.Item;
      this.remarksSelectedIndex = index;
      this.remarksForSelectedHoldItemId = index.ItemId;
      this.remarksForSelectedHoldPrescId = index.PrescriptionID;
      this.holdReasonValidation = false;
      this.selectedHoldReason = index.PrescriptionItemsHoldReasonID ?? index.PrescriptionItemsHoldReasonID;
      if (index.HoldStatus == null || index.HoldStatus == 0)
        this.holdBtnName = 'Hold';
      else
        this.holdBtnName = 'Release';
      $("#holdRem").val(index.ReasonForHolding);
    }
  }
  selectedHoldReasonEvent(event: any) {
    this.selectedHoldReason = event.target.value;
  }
  holdPrescriptionItem(med: any, rem: any, btName: string) {
    if (this.selectedHoldReason != "0" && rem.value != "") {
      $("#hold_remarks").modal('hide');
      var currentDate = moment(new Date()).format('DD-MMM-YYYY')?.toString();
      var holdMedXml = [
        {
          "PID": this.remarksForSelectedHoldPrescId,
          "IID": this.remarksForSelectedHoldItemId,
          "ISEQ": 1,
          "REASON": " | " + this.doctorDetails[0].UserName + "  " + currentDate + " : " + rem.value,
          "HOLDSTATUS": btName == 'Hold' ? "1" : "0",
          "HRID": this.selectedHoldReason,
          "BLK": "0"
        }
      ]

      let holdPayload = {
        "DoctorID": this.doctorDetails[0].EmpId,
        "HoldPresItemsXML": holdMedXml
      }
      this.us.post(individualDetails.holdpresitem, holdPayload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.FetchIndividualProcessingDetails();
            //$("#saveMsg").modal('show');
          }
        },
          (err) => {

          })
    }
    else {
      this.holdReasonValidation = true;
      $("#holdRemarksLabel").modal('show');
    }
  }
  clearHoldReason(rem: any) {
    rem.value = "";
    this.selectedHoldReason = "0";
  }
  FetchHoldMaster() {
    this.presconfig.fetchMedicationHold(this.doctorDetails[0].EmpId, this.hospitalID).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.holdMasterList = response.FetchMedicationHoldDataList;
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }
  showViewBulkProcessingPrint() {
    var VerifyOption = this.doctorDetails[0].IndividualVerify;

    if (VerifyOption == 'NO') {
      // if (this.FetchIndividualProcessingIssueDetailsDataList.length == 0) {
      //   this.errorMessage = "Issue the prescription before printing sticker";
      //   $("#errorMsg").modal('show');
      //   return;
      // }
    }

    if (this.FetchIndividualProcessingIssueDetailsDataList.length > 0 && this.FetchIndividualProcessingIssueDetailsDataList[0]?.IsVerified === 'True' || VerifyOption == 'NO') {
      this.presconfig.FetchItemStickerPrint(this.individualProcess.PatientID, this.individualProcess.PrescriptionID, this.individualProcess.WardID, this.doctorDetails[0].UserId, this.doctorDetails[0].UserName, this.facilitySessionId, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.trustedUrl = response?.FTPPATH
            this.showModal()
          }
        },
          (err) => {
          })
    }
    else {
      this.errorMessage = "Verify the Issued prescription before printing sticker";
      $("#errorMsg").modal('show');
    }
  }
  showViewBulkProcessingPresPrint() {
    this.presconfig.FetchItemStickerPresPrint(this.individualProcess.IPID, this.individualProcess.PatientID, this.individualProcess.PrescriptionID, this.individualProcess.WardID, this.doctorDetails[0].UserId, this.doctorDetails[0].UserName, this.facilitySessionId, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModal()
        }
      },
        (err) => {
        })
  }
  showModal(): void {
    $("#reviewAndPayment").modal('show');
  }
  showPatientInfo(pinfo: any) {
    pinfo.AdmissionID = pinfo.Adminssionid;
    pinfo.HospitalID = this.hospitalID;
    pinfo.PatientID = pinfo.PatientId;
    this.pinfo = pinfo;
    $("#quick_info").modal('show');

  }
  clearPatientInfo() {
    this.pinfo = "";
  }

  showMedicationHistory() {
    this.presconfig.FetchIndPreviousPresc(this.individualProcess.PrescriptionID, this.individualProcess.IPID, this.doctorDetails[0].UserId, this.facilitySessionId, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.IndPreviousPrescDataList = response.FetchIndPreviousPrescDataList;
          this.showMedicationModal()
        }
      },
        (err) => {
        })
  }
  FetchIndMedicationHistory() {
    this.presconfig.FetchIndMedicationHistory(this.individualProcess.PatientID, this.individualProcess.IPID, this.doctorDetails[0].UserId, this.facilitySessionId, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.IndMedicationHistoryDataList = response.FetchIndMedicationHistoryDataList;

          /// this.showMedicationModal()
        }
      },
        (err) => {
        })
  }
  FetchIndDiscontinueMed() {
    this.presconfig.FetchIndDiscontinueMed(this.individualProcess.PrescriptionID, this.individualProcess.IPID, this.doctorDetails[0].UserId, this.facilitySessionId, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.IndPreviousPrescDisDataList = response.FetchIndPreviousPrescDataList;
          this.showMedicationModal()
        }
      },
        (err) => {
        })
  }
  showMedicationModal(): void {
    $("#acc_receivable").modal('show');
  }
  MedicationClick(TypeID: any) {
    this.MedicationType = TypeID;
    if (TypeID == '1')
      this.showMedicationHistory();
    if (TypeID == '2')
      this.FetchIndMedicationHistory();
    if (TypeID == '3')
      this.FetchIndDiscontinueMed();
  }
  itemViewMore(item: any) {
    if (item.itemViewMore) {
      item.itemViewMore = false;
    }
    else {
      item.itemViewMore = true;
    }
  }

  getHight() {
    this.presconfig.getPatientHight(this.individualProcess.PatientID).subscribe(res => {
      this.patientHigh = res;
      this.smartDataList = this.patientHigh.SmartDataList;
      $("#bmiChart").modal('show');
      this.createHWChartLine();
    })
  }

  private createHWChartLine(): void {
    let data: any = {};

    const heightData: any[] = [];
    const weigthData: any[] = [];
    const BMIData: any[] = [];

    this.smartDataList.forEach((element: any, index: any) => {
      heightData.push([element.Createdate, parseFloat(element.Height)])
      weigthData.push([element.Createdate, parseFloat(element.Weight)])
      BMIData.push([element.Createdate, parseFloat(element.BMI)])
    });

    data = [{ name: 'Height', data: heightData }, { name: 'Weight', data: weigthData }];

    const chart = Highcharts.chart('chart-hw-line', {
      chart: {
        type: 'spline',
        zoomType: 'x'
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        min: 0,
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category',
        min: 0,
        max: 9
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
        valueDecimals: 1,
        crosshairs: [{
          width: 1,
          color: 'Gray'
        }, {
          width: 1,
          color: 'gray'
        }]
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0.5
        }
      },
      series: data,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
      }
    } as any);

  }

  navigateToResults() {
    this.individualProcess.RegCode = this.individualProcess.UHID;
    this.individualProcess.Bed = this.individualProcess.BedName;
    sessionStorage.setItem("FromCaseSheet", "false");
    sessionStorage.setItem("selectedView", JSON.stringify(this.individualProcess));
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.individualProcess));
    this.showResultsinPopUp = true;
    $("#viewResults").modal("show");
  }

  verifyIssuedBy() {
    if (this.FetchIndividualProcessingIssueDetailsDataList.length > 0) {
      if (this.FetchIndividualProcessingIssueDetailsDataList[0].IssuedUserID == this.doctorDetails[0].UserId) {
        this.errorMessage = "Issued User & Verify User should not be same ";
        this.errorMessage = "Issued & Verify User should not be same ";
        $("#errorMsg").modal('show');
        return;
      }
    }

    if (this.FetchIndividualProcessingIssueDetailsDataList.length > 0) {
      const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.updateVerifiedByUser();
        }
        modalRef.close();
      });
    }
    else {
      this.errorMessage = "Prescription is not issued";
      $("#errorMsg").modal('show');
    }
  }

  updateVerifiedByUser() {

    this.isVerified = !this.isVerified;
    var payload = {
      "SalesID": this.FetchIndividualProcessingIssueDetailsDataList[0]?.SalesID,
      "IsVerified": true,
      "VerifiedBy": this.doctorDetails[0].UserId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facilitySessionId,
      "HospitalID": this.hospitalID,
    };
    this.us.post(individualDetails.UpdateItemIssuesVerifications, payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchIndividualProcessingDetails();
          this.saveMsg = "Verified Successfully";
          $("#saveMsg").modal('show');
        }
      },
        (err) => {

        })

  }

  navigateToAdmReconciliation() {
    // this.individualProcess.Bed = this.individualProcess.BedName;
    // sessionStorage.setItem("InPatientDetails", JSON.stringify(this.individualProcess));
    // sessionStorage.setItem("fromIndividualProcessing", "true");
    // const options: NgbModalOptions = {
    //   size: 'xl',
    //   windowClass : 'vte_view_modal'
    // };
    // const modalRef = this.mdlsvc.openModal(AdmissionreconciliationComponent, {
    //   data: this.individualProcess,
    //   readonly: true
    // }, options);
    this.fetchAdmReconStatus();
  }

  fetchAdmReconStatus() {
    this.appconfig.fetchAdmissionRecoStatus(this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.admReconStatus = response.FetchAdverseDrugDataList;
          this.FetchSavedAdmissionReconciliation();
        }
      },
        (err) => {

        })
  }
  FetchSavedAdmissionReconciliation() {
    this.selectedItemsList = [];
    this.appconfig.fetchSavedAdmissionReconciliation('2', this.individualProcess.IPID, this.individualProcess.PatientID, false, 0, this.hospitalID, false)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          $("#admissionReconciliationMed").modal('show');
          if (response.objPatientPrescriptionOrderDataList.length > 0) {
            this.lastSavedAdmReconDate = response.objPatientPrescriptionOrderDataList[0].StatusMsg
          }
          response.objPatientPrescriptionDataList.forEach((element: any, index: any) => {
            this.selectedItemsList.push({
              SlNo: this.selectedItemsList.length + 1,
              Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
              ClassSelected: false,
              ItemId: element.PrescribedItemID,
              ItemName: element.DRUGNAME,
              StrengthUoMID: element.QtyUomID,
              Strength: element.Qty + " " + element.QtyUom,
              StrengthUoM: element.QtyUom,
              Dosage: element.DOS + " " + element.DOSE, //response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
              DosageId: element.DOID,
              AdmRouteId: element.ARI,
              Route: element.AdmRoute,
              FrequencyId: element.FID,
              Frequency: element.Frequency,
              ScheduleStartDate: moment(element.SFRM).format("DD-MMM-YYYY")?.toString(),
              StartFrom: moment(new Date()).format("DD-MMM-YYYY")?.toString(),
              DurationId: element.DUID,
              Duration: element.DUR,
              DurationValue: element.DUR.split(' '),
              PresInstr: element.PatientInstructions,//item.PresInstr,
              Quantity: parseFloat(element.FQTY),
              QuantityUOMId: element.QtyUomID,
              PresType: "",//item.PresType,
              PRNType: element.PRNREASON,//item.PRNType,
              GenericId: element.PrescribedGenericItemID,
              DefaultUOMID: element.QtyUomID,
              medInstructionId: "",//item.medInstructionId,
              PRNReason: "",//item.PRNReason,
              IssueUoM: element.FQTYUOM,
              IssueUOMID: element.IssuedQtyUOMName,
              IssueUOMValue: element.Qty,
              IssueTypeUOM: element.QtyUomID,
              Remarks: element.REM,
              IsFav: element.IsFav,
              DiseaseID: element.DiseaseID,
              ScheduleEndDate: element.EDT,
              ScheduleTime: element.STM,
              PrescriptionItemStatusNew: element.PrescriptionItemStatusNew,
              PrescriptionID: element.PrescriptionID,
              HoldStatus: element.HoldStatus,
              ReasonForHolding: element.ReasonForHolding,
              PrescriptionItemsHoldReasonID: element.PrescriptionItemsHoldReasonID,
              PrescriptionItemsHoldReason: element.ReasonForHolding,
              HoldDate: element.HoldDate,
              PrescriptionItemStatus: element.PrescriptionItemStatus,
              PrescriptionItemStatusName: (element.PrescriptionItemStatusName === '' || element.PrescriptionItemStatusName === null) ? 'Select' : element.PrescriptionItemStatusName,
              LastDoseGiven: moment(element.LastGivenDose?.split(' ')[0]).format("DD-MMM-YYYY")?.toString(),
              LastDoseGivenTime: element.LastGivenDose?.split(' ')[1],
              PrescriptionItemid: element.PrescriptionItemid,
              selected: false,
              viewMore: element.REM ? true : false,
              ReconciliatedBy: element.ReconciliatedBy,
            });
          });

        }
      })
  }

  maximizeSelectedDrugItems(med: any) {
    const index = this.selectedItemsList.findIndex((x: any) => x?.ItemId === med.ItemId);
    if (index > -1) {
      this.selectedItemsList[index].ClassSelected = !this.selectedItemsList[index].ClassSelected;
      if (this.selectedItemsList[index].ClassSelected) {
        this.selectedItemsList[index].Class = "row card_item_div mx-0 gx-2 w-100 align-items-start maxim";
        this.selectedItemsList[index].viewMore = true;
      } else {
        this.selectedItemsList[index].Class = "row card_item_div mx-0 gx-2 w-100 align-items-start";
        this.selectedItemsList[index].viewMore = false;
      }
    }

  }

  openAdmissionReconciliation() {
    this.individualProcess.AdmissionID = this.individualProcess.IPID;
    this.individualProcess.Bed = this.individualProcess.BedName;
    sessionStorage.setItem("InPatientDetails", JSON.stringify(this.individualProcess));
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'openAdmissionReconciliation_modal'
    };
    const modalRef = this.mdlsvc.openModal(AdmissionreconciliationComponent, {
      data: 'fromIndProcessing',
      readonly: true
    }, options);
  }

  openPatientSummary(item: any) {
    item.RegCode = item.UHID;
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));
    item.Bed = item.BedName;
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
    sessionStorage.setItem("PatientID", item.PatientID);
    sessionStorage.setItem("fromIDDashboard", "true");
    this.router.navigate(['/shared/patientfolder']);
  }

  onUpdateClick(item: any) {
    const payload = {
      "PrescriptionID": item.PrescriptionID,
      "ItemID": item.ItemId,
      "HospitalID": this.hospitalID,
      "UserId": this.doctorDetails[0].UserId,
      "WorkStationID": this.facilitySessionId,
      "DoctorRemarks": item.Remarks
    };
    this.us.post('UpdatePrescriptionItemDoctorRemarks', payload).subscribe((response: any) => {
      if (response.Code === 200) {
        $('#saveMsg').modal('show');
        this.FetchIndividualProcessingDetails();
      }
    });
  }

  checkMedicationStartDate(item: any) {
    const currentDate = new Date();
    const medStartDate = new Date(item.StartDate);
    if (medStartDate > currentDate) {
      return true;
    }
    return false;
  }

  fetchMedicineForChartlength(date: any, drugName: any) {
    const result = this.drugDataArray?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date) && data.Drugname === drugName);
    return result.length;
  }

  FetchDrugAdministrationDrugs(FromDate: any, ToDate: any) {
    this.appconfig.FetchDrugAdministrationDrugs(FromDate, ToDate, this.individualProcess.IPID, this.hospitalID).subscribe((response: any) => {
      if (response.Code == 200) {
        this.drugDataArray = [];
        this.calendarFilteredMedications = response.FetchDrugAdministrationDrugsDataList;
        const groupedData = response.FetchDrugAdministrationDrugsDataList.reduce((acc: any, currentValue: any) => {
          const key = currentValue.Drugname + currentValue.FrequencyDate;
          (acc[key] = acc[key] || []).push(currentValue);
          return acc;
        }, {});

        for (const key in groupedData) {
          if (groupedData.hasOwnProperty(key)) {
            const group = groupedData[key];
            const firstItem = group[0];
            var Dose = firstItem.Dose + " " + firstItem.DoseUOMName + " " + firstItem.Frequency + " " + firstItem.AdmRoute + " " + firstItem.duration + " " + firstItem.durationUOM;
            var StartDate = "Start Date - " + firstItem.StartFrom;
            const drugData: any = {
              Drugname: firstItem.Drugname + ';' + Dose + ';' + StartDate + ';' + firstItem.DoseUOMName + ';' + firstItem.Frequency + ';' + firstItem.AdmRoute + ';' + firstItem.duration + ';' + firstItem.durationUOM,
              FrequencyDate: firstItem.FrequencyDate,
              FrequencyDateTime: group.map((item: any) => {
                let minDate = new Date(item.FrequencyDate);
                minDate.setDate(minDate.getDate() - 1);
                return {
                  time: item.FrequencyDateTime,
                  isEdit: false,
                  wardTaskIntervalID: item.WardTaskIntervalID,
                  remarks: '',
                  drugName: firstItem.Drugname,
                  statusName: item.STATUSName,
                  date: new Date(item.FrequencyDate),
                  minDate,
                  savedRemarks: item.WardTaskRemarks,
                  savedUserName: item.FreqTimeModifiedUserName,
                  savedDate: item.FreqTimeModifiedDate
                }
              }),
              DoseUOMName: firstItem.DoseUOMName,
              Frequency: firstItem.Frequency,
              AdmRoute: firstItem.AdmRoute,
              duration: firstItem.duration,
              durationUOM: firstItem.durationUOM,
            };
            this.drugDataArray.push(drugData);
          }
        }

        const uniqueDrugNames = new Set(this.drugDataArray.map(item => item.Drugname));
        this.drugs = Array.from(uniqueDrugNames);
      }
    },
      (err) => { })
  }

  onHourChange(event: any, item: any, date: any) {
    const freqArr = this.drugDataArray?.find((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date.date) && data.Drugname.split(';')[0] === item.drugName).FrequencyDateTime;
    if (freqArr.filter((x: any) => x.time === `${event.target.value}:00`).length > 0) {
      this.errorMessage = "Frequency time " + `${event.target.value}:00` + " already exists for : " + item.drugName;
      $('#errorMsg').modal('show');
    }
    else {
      item.time = `${event.target.value}:00`;
      item.isModified = true;
    }
  }

  onDateChange(event: any, item: any) {
    const modifieDate: any = this.datepipe.transform(event.target.value, "dd-MMM-yyyy")?.toString();
    const freqArr = this.drugDataArray?.find((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(modifieDate) && data.Drugname.split(';')[0] === item.drugName).FrequencyDateTime;
    if (freqArr.filter((x: any) => x.time === item.time).length > 0) {
      this.errorMessage = "Frequency date time " + `${modifieDate} ${item.time}` + " already exists for : " + item.drugName;
      $('#errorMsg').modal('show');
    }
    else {
      item.isModified = true;
    }
  }

  processTimeForCompletedStatus(inputTime: any, inputDate: any, drug: any, Type: number) {
    var ReturnContent: string = "";
    const parts = inputDate.split('-');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(parts[1]);
    const inputDateTime = new Date(parts[2], monthIndex, parts[0], inputTime.time.split(':')[0], inputTime.time.split(':')[1]);

    inputDateTime.setHours(inputDateTime.getHours() - 2);

    const filteredData = this.calendarFilteredMedications.filter((item: any) => item.Drugname === drug && item.FrequencyDate === inputDate && item.FrequencyDateTime === inputTime.time);

    if (filteredData[0]?.STATUSName === 'Completed') {
      if (Type == 1)
        ReturnContent = filteredData[0]?.AdminDose;
      if (Type == 2)
        ReturnContent = filteredData[0]?.AdministeredDoseUOM;
      if (Type == 3)
        ReturnContent = filteredData[0]?.AdministrationDate;
      if (Type == 4)
        ReturnContent = filteredData[0]?.AdministeredBy;
      if (Type == 5)
        ReturnContent = filteredData[0]?.VerifiedUser;
      if (Type == 6)
        ReturnContent = filteredData[0]?.Remarks;
      if (Type == 7)
        ReturnContent = filteredData[0]?.DrugAdmReasonSectionName;
      if (Type == 8)
        ReturnContent = filteredData[0]?.NotAdministeredReason;
      if (Type == 9)
        ReturnContent = filteredData[0]?.AdministerTimeDeviationReason;
      if (Type == 10)
        ReturnContent = filteredData[0]?.ManualEntryReason;
      return ReturnContent;
    }
    else {
      return "";
    }
  }

  getHourValue(item: any) {
    return item.time.split(':')[0];
  }


  fetchMedicineForChart(date: any, drugName: any) {
    const result = this.drugDataArray?.filter((data: any) => Date.parse(moment(data.FrequencyDate).format('DD-MMM-YYYY')) === Date.parse(date) && data.Drugname === drugName);
    if (result.length > 0) {
      result[0].FrequencyDateTime.forEach((element: any) => {
        const value = this.processTime(element, date, drugName.split(';')[0]);
        let pillName = 'Ppill';
        if (value === 'C') {
          pillName = 'Cpill';
        } else if (value === 'H') {
          pillName = 'Holdpill';
        } else if (value === 'U') {
          pillName = 'UHpill';
        } else if (value === 'M') {
          pillName = 'Mpill';
        } else if (value === 'F') {
          pillName = 'Fpill';
        }
        element.timeValue = value;
        element.pillName = pillName;
      });
      return result[0].FrequencyDateTime;
    }
    return null;
  }

  processTime(inputTime: any, inputDate: any, drug: any) {
    let currentDate = new Date();

    const parts = inputDate.split('-');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(parts[1]);
    const inputDateTime = new Date(parts[2], monthIndex, parts[0], inputTime.time.split(':')[0], inputTime.time.split(':')[1]);

    inputDateTime.setHours(inputDateTime.getHours() - 2);

    const filteredData = this.calendarFilteredMedications.filter((item: any) => item.Drugname === drug && item.FrequencyDate === inputDate && item.FrequencyDateTime === inputTime.time);

    if (filteredData[0]?.STATUSName === 'Completed') {
      return "C";
    }
    if (filteredData[0]?.STATUSName === 'On Hold') {
      return "H";
    }
    if (filteredData[0]?.STATUSName === 'UnHold') {
      return "U";
    }

    if (new Date(inputDate) > currentDate) {
      return "F";
    }

    if (inputDateTime < currentDate) {
      return "M";
    } else if (inputDateTime > currentDate) {
      return "P";
    }

    return "N";
  }

  calculateWeekRange() {
    let currentDate = new Date(this.currentDate);
    this.firstDayOfWeek = new Date(currentDate.setDate(currentDate.getDate() - 1));

    this.lastDayOfWeek = new Date(this.firstDayOfWeek);
    this.lastDayOfWeek.setDate(this.firstDayOfWeek.getDate() + 6);

    this.currentWeekDates = this.generateDateRange(this.firstDayOfWeek, this.lastDayOfWeek);
    this.FetchDrugAdministrationDrugs(moment(this.firstDayOfWeek).format("DD-MMM-YYYY"), moment(this.lastDayOfWeek).format("DD-MMM-YYYY"));
  }

  goToPreviousWeek() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.calculateWeekRange();
  }

  goToNextWeek() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.calculateWeekRange();
  }
  generateDateRange(start: Date, end: Date): any {
    const datesArray = [];
    const currentDate = this.getDateWithoutTime(new Date(start));
    const todayDate = this.getDateWithoutTime(new Date());

    while (currentDate <= end) {
      let value = 1;
      if (currentDate < todayDate) {
        value = 1;
      }
      else if (currentDate.toISOString().split('T')[0] === todayDate.toISOString().split('T')[0]) {
        value = 2;
      }
      else if (currentDate > todayDate) {
        value = 3;
      }
      datesArray.push({ date: this.datepipe.transform(currentDate, "dd-MMM-yyyy"), value: value, CompletedCount: 0, AllCount: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return datesArray;
  }

  getDateWithoutTime(inputDate: Date): Date {
    const year = inputDate.getFullYear();
    const month = inputDate.getMonth();
    const day = inputDate.getDate();
    return new Date(year, month, day);
  }

  showNewChartDetails() {
    this.drugs = [];
    this.drugDataArray = [];
    this.currentDate = new Date();
    this.calculateWeekRange();
    $("#modalNewCalender").modal('show');
    this.showChart = true;
  }

  PatientPrintCard() {
    this.config.FetchRegistrationAdmissionCard(this.individualProcess.UHID, this.individualProcess.IPID, this.doctorDetails[0]?.UserId, this.ward.FacilityID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH;
          $("#caseRecordModal").modal('show');
        }
      },
        (err) => {

        })
  }

  printAdmissionReconciliation() {
    this.appconfig.fetchSavedAdmissionReconciliationPrint('2', this.individualProcess.IPID, this.individualProcess.PatientID, false, 0, this.hospitalID, false, this.doctorDetails[0].UserName)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH;
          $("#admissionReconciliationMed").modal('hide');
          $("#reviewAndPayment").modal('show');
        }
      })
  }
}