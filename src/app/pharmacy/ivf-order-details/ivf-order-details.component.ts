import { Component, OnInit } from '@angular/core';
import { IvfOrderService } from '../ivf-order/ivf-order.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { ConfigService as PresConfig } from 'src/app/services/config.service';
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
  selector: 'app-ivf-order-details',
  templateUrl: './ivf-order-details.component.html',
  styleUrls: ['./ivf-order-details.component.scss'],
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
export class IvfOrderDetailsComponent extends BaseComponent implements OnInit {
  url: any;
  FetchIndividualProcessingDetailsDataList: any;
  FetchIndividualProcessingDetailsTList: any;
  FetchIndividualProcessingIssueDetailsDataList: any;
  FetchIVFluidRequestDetailsHDataList: any;
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
  ivfluidProcess:any;
  doctorID:any;
  prescriptionID: any;
  SalesID: any;
  baseSolutions: any = [];
  InfussionPeriod: any;
  InfussionPeriodUom: any = "min";
  condition: any;
  showResultsinPopUp = false;
  classCentral: string = "fs-7 btn";
  classPeripheral: string = "fs-7 btn selected";
  administeredType = '2';
    saveMsg = "Saved Succesfully"
  constructor(private router: Router, private service: IvfOrderService, private us: UtilityService, private appconfig: ConfigService,
    private presconfig: PresConfig, private modalService: NgbModal) {
    super();
    this.ivfluidProcess = JSON.parse(sessionStorage.getItem("ivfprocess") || '{}');
   }

   ngOnInit(): void {
    this.service.param = {
      ...this.service.param,
      PatientID: this.ivfluidProcess.PatientID,
      AdmissionID: this.ivfluidProcess.AdmissionID,
      IVFluidRequestID: this.ivfluidProcess.IVFluidRequestID,
      WardID: this.ivfluidProcess.WardID,
      PrescriptionID: this.ivfluidProcess.PrescriptionID,
      IsDisPrescription: this.ivfluidProcess.isDisPrescription === "True" ? 1 : 0,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID,
      NoofPrints:1

    };

    if (this.ivfluidProcess.BedName.includes('ISO'))
      this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
    else
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";

    this.fetchPatientFileInfo();
    this.FetchIVFluidProcessingDetails();
    this.FetchHoldMaster();
    this.fetchBaseSolutions();
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
  FetchIVFluidProcessingDetails() {
    this.url = this.service.getData(ivforderdetails.fetchData);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if(response.Message != '') {
            this.errorMessage = response.Message;
            $("#errorMsg").modal('show');
          }
          
          this.FetchIVFluidRequestDetailsHDataList = response.FetchIVFluidRequestDetailsHDataList;
          this.FetchIVFluidRequestDetailsHDataList.forEach((element: any, index: any) => {
            element.intialQty = element.Qty;
            element.IsBaseSolutionChanged = false;
            //displaying FinalQty as IssueQty if IssQty is not null
            if(element.IssedQty !== '0') {
              element.Qty = element.IssedQty;
            }
          });
          this.doctorID = response.FetchIVFluidRequestOrderHDataList[0].ConsultantID;
          this.prescriptionID = response.FetchIVFluidRequestOrderHDataList[0].PrescriptionID;
          if(response.FetchIVFluidRequestOrderHDataList[0].InfussionPeriod != '') {
            this.InfussionPeriod = response.FetchIVFluidRequestOrderHDataList[0].InfussionPeriod?.split(' ')[0];
            this.InfussionPeriodUom = response.FetchIVFluidRequestOrderHDataList[0].InfussionPeriod?.split(' ')[1] === undefined ? 'min' : response.FetchIVFluidRequestOrderHDataList[0].InfussionPeriod?.split(' ')[1];
          }
          
          this.condition = response.FetchIVFluidRequestOrderHDataList[0].condition;
          this.SalesID = response.FetchIVFluidRequestDetailsHDataList[0].SalesID;
          this.administeredType = response.FetchIVFluidRequestOrderHDataList[0].Infusion;
          if(this.administeredType=='1'){
            this.classCentral = "fs-7 btn selected";
            this.classPeripheral = "fs-7 btn";
          }        
            else if(this.administeredType=='2'){
              this.classCentral = "fs-7 btn ";
              this.classPeripheral = "fs-7 btn selected";
            }
        }
      },
        (err) => {

        })
  }

  fetchBaseSolutions() {
    this.url = this.service.getData(ivforderdetails.fetchBaseSolutions);
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.baseSolutions = response.FetchBaseSolutionDataList;
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
    sessionStorage.removeItem("ivfprocess");
    //this.router.navigate(['/pharmacy/ivf-order'])
    $('#selectPatientYesNoModal').modal('show');
  }
  
  onAccept() {
    $('#selectPatientYesNoModal').modal('hide');
    sessionStorage.setItem('ivfOrderDetailsWard', JSON.stringify(this.ivfluidProcess));
    this.router.navigate(['/pharmacy/ivf-order']);
  }

  onDecline() {
    $('#selectPatientYesNoModal').modal('hide');
    this.router.navigate(['/pharmacy/ivf-order']);
  }

  validateReqQty(item: any, event: any) {
    // if (item.Qty > item.intialQty) {
    //   item.Qty = item.intialQty;
    //   this.errorMessage = "Required quantity should not be greater than Prescribed Qty";
    //   $("#errorMsg").modal('show');
    //   return;
    // } else {
    // }
  }

  SaveMedicationIssue() {

    const modalRef = this.modalService.open(ValidateEmployeeComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        var result = this.FetchIVFluidRequestDetailsHDataList.filter((a: any) => a.Qty > 0);

        var payload =
        {
          "IVFluidOXMLD": result,
          "SalesID": 0,
          "SalesNo": "",
          "PatientType": 2,
          "PatientID": this.ivfluidProcess.PatientID,
          "IPID": this.ivfluidProcess.AdmissionID,
          "BedID": this.ivfluidProcess.BedID,
          "DoctorID": this.doctorID,
          "CompanyID": "0",
          "PrescriptionID": this.prescriptionID,
          "USERID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
          "WORKSTATIONID": this.facilitySessionId ?? this.service.param.WorkStationID,
          "HospitalID": this.hospitalID,
          "Ivfluidrequestid": this.ivfluidProcess.IVFluidRequestID,
          "condition": this.condition,
          "InfussionPeriod": this.InfussionPeriod + ' ' + this.InfussionPeriodUom,
          "Infusion":this.administeredType
          
        }
        this.us.post(ivforderdetails.save, payload)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              //this.FetchIVFluidProcessingDetails();         
              this.showViewBulkProcessingPrint();
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
      this.service.param.ItemID = item.ItemID;
      this.url = this.service.getData(ivforderdetails.substitute);

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
    var result = this.FetchIVFluidRequestDetailsHDataList.filter((a: any) => a.ItemID === this.service.param.ItemID);

    if (result.length > 0) {
      result[0].OldItemId = this.service.param.ItemID;
      result[0].ISSUB = 1;
      result[0].DisplayName = item.ItemName;
      result[0].ItemName = item.ItemName;
      result[0].ModItemName = item.ItemName;
      result[0].DisplayName = item.ItemName;
      result[0].ItemID = item.ItemID;
      result[0].QOH = item.QoH;
      result[0].Dose = item.Dose;
      result[0].QUOM = item.QUoM;
      result[0].UID = item.QUOMID;
      result[0].PID = item.QOHPackID;
      result[0].UoMID = item.QUOMID;
      result[0].PackID = item.QOHPackID;
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
    this.remarksForSelectedHoldItemName = index.Item;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedHoldItemId = index.ItemId;
    this.remarksForSelectedHoldPrescId = index.PrescriptionID;
    this.holdReasonValidation = false;
    this.selectedHoldReason = index.PrescriptionItemsHoldReasonID;
    if (index.HoldStatus == null || index.HoldStatus == 0)
      this.holdBtnName = 'Hold';
    else
      this.holdBtnName = 'Release';
    $("#holdRem").val(index.ReasonForHolding);
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
      this.us.post(ivforderdetails.holdpresitem, holdPayload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.FetchIVFluidProcessingDetails();
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
    // this.presconfig.FetchItemStickerPrint(this.ivfluidProcess.PatientID, this.ivfluidProcess.PrescriptionID, this.ivfluidProcess.WardID, this.doctorDetails[0].UserId, this.doctorDetails[0].UserName, this.facilitySessionId, this.hospitalID)
    //   .subscribe((response: any) => {
    //     if (response.Code == 200) {
    //       this.trustedUrl = response?.FTPPATH
    //       this.showModal()
    //     }
    //   },
    //     (err) => {
    //     })

    var changedItem = "0";
    this.FetchIVFluidRequestDetailsHDataList.forEach((element: any) => {
      if(element.ItemID != element.OldItemId && element.OldItemId != undefined) {
        if(changedItem == '0') {
          changedItem = element.OldItemId + '-' + element.ItemID;
        }
        else {
          changedItem += '$' + element.OldItemId + '-' + element.ItemID;
        }        
      }
    });
    this.service.param = {
      ...this.service.param,
      ChangedItemIDS : changedItem

    };
    this.url = this.service.getData(ivforderdetails.FetchIVFluidStickerPrintN);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModal()
        }
      },
        (err) => {

        })
  }
  showViewBulkProcessingPresPrint() {
    this.presconfig.FetchItemStickerPresPrint(this.ivfluidProcess.AdmissionID, this.ivfluidProcess.PatientID, this.ivfluidProcess.PrescriptionID, this.ivfluidProcess.WardID, this.doctorDetails[0].UserId, this.doctorDetails[0].UserName, this.facilitySessionId, this.hospitalID)
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
    this.presconfig.FetchIndPreviousPresc(this.ivfluidProcess.IVFluidRequestID, this.ivfluidProcess.AdmissionID, this.doctorDetails[0].UserId, this.facilitySessionId, this.hospitalID)
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
    this.presconfig.FetchIndMedicationHistory(this.ivfluidProcess.PatientID, this.ivfluidProcess.IPID, this.doctorDetails[0].UserId, this.facilitySessionId, this.hospitalID)
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
    this.presconfig.FetchIndDiscontinueMed(this.ivfluidProcess.PrescriptionID, this.ivfluidProcess.IPID, this.doctorDetails[0].UserId, this.facilitySessionId, this.hospitalID)
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
  itemViewMore(item:any) {
    if(item.itemViewMore) {
      item.itemViewMore = false;
    }
    else {
      item.itemViewMore = true;
  }
  }

  clearIvfDetails() {
    this.FetchIVFluidRequestDetailsHDataList.forEach((element: any, index: any) => {
      element.Qty = element.intialQty;
    });
  }

  toggleItemDropdown(item:any) {
    if(item.ItemID === "112267" || item.IsBaseSolution) {
      item.displayDropdown = true;
    }
  }

  disableControls(item: any) {
    item.displayDropdown = false;
  }

  onBaseSolutionChange(event: any, item1: any, index: any) {
    const item = this.baseSolutions.find((x:any) => x.ItemID === event.target.value);
    let find = this.FetchIVFluidRequestDetailsHDataList.find((x: any) => x?.ItemID === item1.ItemID); 
    const index1 = this.FetchIVFluidRequestDetailsHDataList.indexOf(find, 0);
    if (index1 > -1) {
      find.IVFluidRequestID = null,
      find.ItemID = item.ItemID,
      find.ItemName = item.DisplayName,
      find.ModItemName =  item.DisplayName,
      find.PID =  item.PackId,
      find.UID =  item.UoMID,
      find.UNIT =  item.UOM,
      find.Value =  '1.00',
      find.Qty =  '1',
      find.BatchNo =  '',
      find.ExpiryDate =  null,
      find.QOH =  item.QOH,
      find.Tax =  item.SalesTax,
      find.UPrice =  item.MRP,
      find.QUOM =  item.UOM,
      find.PackID =  item.PackId,
      find.UoMID =  item.UoMID,
      find.IsNarcotic =  '0',
      find.DoseQty =  item.DoseQty,
      find.DoseUOMID =  item.DoseUOMID,
      find.Strength =  item.StrengthUOM,
      find.StrengthUoMID =  item.StrengthUoMID,
      find.IsAntibiotic =  '0',
      find.IsIVfluid =  '1',
      find.IsIVFluidAdditive =  '1',
      find.IsGeneric =  'False',
      find.SalesID =  '',
      find.IsGenericItem =  null,
      find.Amount =  item.MRP,
      find.Details =  '',
      find.Durationonly =  '',
      find.DurationID =  '',
      find.DurationUOM =  '',
      find.StartFrom =  null,
      find.FrequencyID =  '',
      find.Frequ =  '',
      find.IsBaseSolution = true,
      find.IsBaseSolutionChanged = true

      this.FetchIVFluidRequestDetailsHDataList[index] = find;
      this.disableControls(find);
    }    
  }

  openPatientSummary(item: any) {   
    sessionStorage.setItem("PatientDetails", JSON.stringify(item));   
    item.Bed=item.BedName;
    sessionStorage.setItem("selectedView", JSON.stringify(item));
    sessionStorage.setItem("selectedPatientAdmissionId", item.AdmissionID);
    sessionStorage.setItem("PatientID", item.PatientID);
    sessionStorage.setItem("fromIVDashboard", "true");
    this.router.navigate(['/shared/patientfolder']);
  }

  navigateToResults() {
    this.ivfluidProcess.RegCode = this.ivfluidProcess.UHID;
    this.ivfluidProcess.Bed = this.ivfluidProcess.BedName;
    sessionStorage.setItem("FromCaseSheet", "false");
    sessionStorage.setItem("FromIVF", "true");
    sessionStorage.setItem("selectedView", JSON.stringify(this.ivfluidProcess));
    sessionStorage.setItem("PatientDetails", JSON.stringify(this.ivfluidProcess));
    this.showResultsinPopUp = true;
    $("#viewResults").modal("show");
  }

  onUpdateClick(item: any) {
    const payload = {
      "PrescriptionID": this.prescriptionID,
      "ItemID": item.ItemID,
      "HospitalID": this.hospitalID,
      "UserId": this.doctorDetails[0].UserId,
      "WorkStationID": this.facilitySessionId,
      "DoctorRemarks": item.Remarks
    };
    this.us.post('UpdatePrescriptionItemDoctorRemarks', payload).subscribe((response: any) => {
      if (response.Code === 200) {
        $('#saveMsg').modal('show');
        this.FetchIVFluidProcessingDetails();
      }
    });
  }
  
  selectType(type: any) {
    this.administeredType = type; 
      if(type=='1'){
        this.classCentral = "fs-7 btn selected";
        this.classPeripheral = "fs-7 btn";
      }        
        else if(type=='2'){
          this.classCentral = "fs-7 btn ";
          this.classPeripheral = "fs-7 btn selected";
        }
         

}

}

export const ivforderdetails = {
  fetchData: 'FetchIVFluidRequestDetH?IVFluidRequestID=${IVFluidRequestID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  save: 'SaveIVFluidIssue',
  substitute: 'FetchSubstituteItemsIP?ItemID=${ItemID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  holdpresitem: 'holdPrescriptionItems',
  FetchIVFluidStickerPrint: 'FetchIVFluidStickerPrint?IVFluidRequestID=${IVFluidRequestID}&NoofPrints=${NoofPrints}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  //FetchBaseSolution?UserID=4394&WorkStationID=2196&HospitalID=2
  fetchBaseSolutions: 'FetchBaseSolution?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  //FetchIVFluidStickerPrintN?IVFluidRequestID=27389&ChangedItemIDS=89948-89742;112266-110589&NoofPrints=1&UserID=4394&WorkStationID=2196&HospitalID=2
  FetchIVFluidStickerPrintN: 'FetchIVFluidStickerPrintN?IVFluidRequestID=${IVFluidRequestID}&ChangedItemIDS=${ChangedItemIDS}&NoofPrints=${NoofPrints}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};