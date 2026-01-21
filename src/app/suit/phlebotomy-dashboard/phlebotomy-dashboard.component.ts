import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SuitConfigService } from '../services/suitconfig.service';
import { Router } from '@angular/router';
declare var $: any;
import * as _ from 'lodash'; 
import { ConfigService } from 'src/app/services/config.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { SpecimenRejectionComponent } from 'src/app/templates/specimen-rejection/specimen-rejection.component';
import { CommonService } from 'src/app/shared/common.service';
import { FormBuilder, Validators } from '@angular/forms';
import { UtilityService } from 'src/app/shared/utility.service';
@Component({
  selector: 'app-phlebotomy-dashboard',
  templateUrl: './phlebotomy-dashboard.component.html',
  styleUrls: ['./phlebotomy-dashboard.component.scss']
})
export class PhlebotomyDashboardComponent implements OnInit {
  @ViewChild('roomSelect', { static: true }) roomSelect!: ElementRef;
  doctorDetails: any;
  hospitalId: any;
  FetchLabPhlebtomyCountOutputLists: any;
  FetchLabPhlebtomyTCountOutputLists: any;
  FetchLabPhlebtomyDisplayOutputLists: any[] = [];
  isClassPresent = false;
  isClassPrevious = false;
  selecteddata: any;
  tdcss = 'tobeacklegend';
  samplecollected = false;
  porter = false;
  samplerecieved = false;
  sampleacknowledge = false;
  samplerecollect = false;
  barcodeprint = false;
  saveenable= false;
  IsLastWeek: string = '0';
  strStatus: any;
  strPatientIds: string = '0,1,2,3,4,5,6';
  intOrderType: any;
  css: any;
  trustedUrl: any;
  groupedArray: any;
  groupedData: any;
  SSNNumber: any;
  BarCode: any;
  BarCodeRoomText: any;
  BarCodeRoomValue: any;
  langData: any;
  savevisible = true;
  activeTab = 0;
  groupedDataArray: any = [];
  facility: any;
  ValidationMsg:any;
  showRemarksValidation: boolean = false;
  confirmationMessage: any;
  selectedItem: any;
  enableBCPrint: boolean = false;

  remarksForm: any;
  discollectionItem: any;
  selectedBox: any;

  constructor(private common: CommonService, private config: SuitConfigService, private router: Router, private configService: ConfigService,private modalService: GenericModalBuilder, private fb: FormBuilder, private us: UtilityService) {
    this.langData = this.configService.getLangData();
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
   }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');

    this.FetchLabPhlebtomyCount();
    this.remarksForm = this.fb.group({
      remarks: ['', Validators.required]
    });
  }

  FetchLabPhlebtomyCount() {
    let payload = {
      "SpecimenIDs": "",
      "intUserId": this.doctorDetails[0].UserId,
      "intWorkstationId":this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "strSmplNo": "",
      "strSSN": "",
      "IsLastweek": "2",
      "strTbl": "1",
      "strStatus": "",
      "fromDate": "",
      "toDate": "",
      "strPatientIds": "",
      "strMobileNo": "",
      "intOrderType": "0",
      "intWardId": "0",
      "isTransfer": 0,
      "isReceived": 0,
      "strPatientSerNumber": "",
      "BagNumber": "",
      "DonorNo": ""
    }
    this.config.FetchLabPhlebtomyCountH(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.FetchLabPhlebtomyCountOutputLists = response.FetchLabPhlebtomyCountOutputLists[0];
        this.FetchLabPhlebtomyTCountOutputLists=response.FetchLabPhlebtomyTCountOutputLists[0];
      }
    },
      (err) => {

      })
  }

  dataclick(IsLastWeek: any, strStatus: any, strPatientIds: any, intOrderType: any, css: any, activeTab: any, selectedBox: any) {
    this.IsLastWeek = IsLastWeek;
    this.strStatus = strStatus;
    this.strPatientIds = strPatientIds;
    this.intOrderType = intOrderType;
    this.tdcss = css;
    this.activeTab = activeTab;
    this.selectedBox = selectedBox;
    this.FetchLabPhlebtomyDataDisplay(IsLastWeek, strStatus, strPatientIds, intOrderType);
  }

  FetchLabPhlebtomyDataDisplay(IsLastWeek: any, strStatus: any, strPatientIds: any, intOrderType: any) {
    let payload = {
      "SpecimenIDs": "",
      "intUserId": this.doctorDetails[0].UserId,
      "intWorkstationId": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "strSmplNo": "",
      "strSSN": "",
      "IsLastweek": IsLastWeek,
      "strTbl": "1,2",
      "strStatus": strStatus,
      "fromDate": "",
      "toDate": "",
      "strPatientIds": strPatientIds,
      "strMobileNo": "",
      "intOrderType": intOrderType,
      "intWardId": "0",
      "isTransfer": 0,
      "isReceived": 0,
      "strPatientSerNumber": "",
      "BagNumber": "",
      "DonorNo": ""
    }
  
    this.config.FetchLabPhlebtomyDataDisplayPHB(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.FetchLabPhlebtomyDisplayOutputLists = response.FetchLabPhlebtomyDisplayOutputLists;

        const hasTrueGroupClick = this.FetchLabPhlebtomyDisplayOutputLists.some((element: any) => !element.SampleNumber);

        if(!hasTrueGroupClick) {
          this.savevisible = false;
        }
        else {
          this.savevisible = true;
        }

        this.FetchLabPhlebtomyDisplayOutputLists.forEach((element: any, index: any) => {

          if(element.IsSpecimenRejForm=='1')
            element.IsSpecimenRejForm = "text-center custom_tooltip custom_tooltip_left cursor-pointer srForm_icon active";
          else
              element.IsSpecimenRejForm = "text-center custom_tooltip custom_tooltip_left cursor-pointer srForm_icon";

          if(element.SampleNumber) {
            element.groupclick = true;
          }
          else {
            element.groupclick = false;
          }
        });

        this.convertintoarray();
      }
    },
      (err) => {

      })
  }


  toggleclick() {
    this.isClassPresent = !this.isClassPresent;
  }

  togglePreviousclick() {
    this.isClassPrevious = !this.isClassPrevious;
  }

  selectedpatient(data: any) {
    this.samplecollected = false;
    this.porter = false;
    this.samplerecieved = false;
    this.sampleacknowledge = false;
    this.samplerecollect = false;
    this.barcodeprint = false;

    if(data.SampleCollectedAt) {
      this.samplecollected = true;
    }

    if(data.PorterReceivedBy) {
      this.porter = true;
    }

    if(data.SampleReceivedBy) {
      this.samplerecieved = true;
    }

    // if(data.SampleCollectedBy) {
    //   this.sampleacknowledge = true;
    // }

    // if(data.SampleCollectedBy) {
    //   this.samplerecollect = true;
    // }

    // if(data.SampleCollectedBy) {
    //   this.barcodeprint = true;
    // }
    
    this.selecteddata = data;
    this.groupedData = this.groupedArray.filter((item: any) => item.SSN === data.SSN && item.ReqDate === data.ReqDate && item.Specialisation === data.Specialisation);
  }

  samplecollectionchange() {
    if(!this.samplecollected) {
      this.samplecollected = !this.samplecollected;
      this.saveenable = true;
    }
  }

  barcodeprintchange(data: any) {
    if(!this.barcodeprint) {
      this.barcodeprint = !this.barcodeprint;
      this.saveenable = true;
      this.config.FetchBarCodePrint(data.SampleNumber, this.strPatientIds, this.IsLastWeek, 0, 
        this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
        if (response.Code == 200) {
          this.trustedUrl = response.FTPPATH;
          $("#showLabReportsModal").modal('show');
        }
      },
        (err) => {
  
        })
    }
  }

  samplerecollectchange() {
    if(!this.samplerecollect) {
      this.samplerecollect = !this.samplerecollect;
      this.saveenable = true;
    }
  }

  sampleacknowledgechange() {
    if(!this.sampleacknowledge) {
      this.sampleacknowledge = !this.sampleacknowledge;
      this.saveenable = true;
    }
  }

  samplerecievedchange() {
    if(!this.samplerecieved) {
      this.samplerecieved = !this.samplerecieved;
      this.saveenable = true;
    }
  }

  porterchange() {
    if(!this.porter) {
      this.porter = !this.porter;
      this.saveenable = true;
    }
  }

  ChangeTestOrderStatus(data: any) {
    var ItemXMLDetails: any[] = [];
    const hasTrueGroupClick = this.groupedData[0].items.some((element: any) => element.groupclick === true);
    this.groupedData[0].items.forEach((element: any, index: any) => {
      if (hasTrueGroupClick) {
        if (element.groupclick === true) {
          var item = {
            "ORD": element.TestOrderID,
            "ORDITM": element.TestOrderItemID,
            "STS": element.CurrentStatus,
            "SEQ": element.Sequence,
            "ROUTID": element.Routid,
            "RMK": "",
            "SampleCollect": this.samplecollected,
            "SampleAcknowledge": this.sampleacknowledge,
            "SampleRecollect": this.samplerecollect,
            "Status": element.CurrentStatus
         }
         ItemXMLDetails.push(item);
        }
      }
      else {
        var item = {
          "ORD": element.TestOrderID,
          "ORDITM": element.TestOrderItemID,
          "STS": element.CurrentStatus,
          "SEQ": element.Sequence,
          "ROUTID": element.Routid,
          "RMK": "",
          "SampleCollect": this.samplecollected,
          "SampleAcknowledge": this.sampleacknowledge,
          "SampleRecollect": this.samplerecollect,
          "Status": element.CurrentStatus
       }
       ItemXMLDetails.push(item);
      }
    });

    let payload = {
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "Hospitalid": this.hospitalId,
      "ItemXMLDetails": ItemXMLDetails
    }
    this.config.ChangeTestOrderStatus(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
        } 
      },
      (err) => {
        console.log(err)
      }); 
  }

  UpdatePorterReceiveDetails(data: any) {
    var ItemXMLDetails: any[] = [];

    const hasTrueGroupClick = this.groupedData[0].items.some((element: any) => element.groupclick === true);

    this.groupedData[0].items.forEach((element: any, index: any) => {
      if (hasTrueGroupClick) {
        if (element.groupclick === true) {
          var item = {
            "TIID": element.TestOrderItemID
          };
          ItemXMLDetails.push(item);
        }
      } else {
        var item = {
          "TIID": element.TestOrderItemID
        };
        ItemXMLDetails.push(item);
      }
    });


    let payload = {
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "Hospitalid": this.hospitalId,
      "ItemXMLDetails": ItemXMLDetails
    }
    this.config.UpdatePorterReceiveDetails(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
        } 
      },
      (err) => {
        console.log(err)
      }); 
  }

  UpdateSampleReceiveDetails(data: any) {
    var ItemXMLDetails: any[] = [];

    const hasTrueGroupClick = this.groupedData[0].items.some((element: any) => element.groupclick === true);

    this.groupedData[0].items.forEach((element: any, index: any) => {
      if (hasTrueGroupClick) {
        if (element.groupclick === true) {
          var item = {
            "TIID": element.TestOrderItemID,
          }
          ItemXMLDetails.push(item);
        }
      } 
      else {
        var item = {
          "TIID": element.TestOrderItemID,
        }
        ItemXMLDetails.push(item);
      }
    });

    let payload = {
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "Hospitalid": this.hospitalId,
      "ItemXMLDetails": ItemXMLDetails
    }
    this.config.UpdateSampleReceiveDetails(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
        } 
      },
      (err) => {
        console.log(err)
      }); 
  }

  SaveInfo(data: any) {
    this.ChangeTestOrderStatus(data);

    if(this.porter) {
      this.UpdatePorterReceiveDetails(data);
    }
    
    if(this.samplerecieved) {
      this.UpdateSampleReceiveDetails(data);
    }
    
    this.saveenable = false;
    
    setTimeout(() =>{
      $("#quick_info").modal('hide');
      $("#savemsg").modal('show');
    }, 2000);

    this.FetchLabPhlebtomyCount();
    this.dataclick(this.IsLastWeek, this.strStatus, this.strPatientIds, this.intOrderType, this.tdcss, this.activeTab, this.selectedBox);
  }


  groupData() {
    const groupedData = _.groupBy(this.FetchLabPhlebtomyDisplayOutputLists, (item: any) => [item.SSN, item.ReqDate, item.Specialisation].join('$'));

    this.groupedArray = Object.keys(groupedData).map((key) => ({
      SSN: key.split('$')[0],
      ReqDate: key.split('$')[1],
      Specialisation: key.split('$')[2],
      items: groupedData[key],
      Tests: groupedData[key].filter((item) => item.groupclick).length > 0 ?
      groupedData[key].filter((item) => item.groupclick).map((item) => item.Test).join(', ') : groupedData[key].map((item) => item.Test).join(', ')
    }));
  }
  onchangeSSN() {
    if(!this.SSNNumber) {
      this.FetchLabPhlebtomyDisplayOutputLists = [];
      return;
    }
    let payload = {
      "SpecimenIDs": "",
      "intUserId": this.doctorDetails[0].UserId,
      "intWorkstationId": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "strSmplNo": "",
      "strSSN": this.SSNNumber,
      "IsLastweek": "2",
      "strTbl": "1,2",
      "strStatus": "",
      "fromDate": "",
      "toDate": "",
      "strPatientIds": "",
      "strMobileNo": "",
      "intOrderType": "0",
      "intWardId": "0",
      "isTransfer": 0,
      "isReceived": 0,
      "strPatientSerNumber": "",
      "BagNumber": "",
      "DonorNo": ""
    }
    this.config.FetchLabPhlebtomyDataDisplayPHB(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.FetchLabPhlebtomyDisplayOutputLists = response.FetchLabPhlebtomyDisplayOutputLists;

        if(this.FetchLabPhlebtomyDisplayOutputLists.length === 0) {
          $("#errorMsg").modal("show");
        }
 
        this.FetchLabPhlebtomyDisplayOutputLists.forEach((element: any, index: any) => {
          if(element.IsSpecimenRejForm=='1')
            element.IsSpecimenRejForm = "text-center custom_tooltip custom_tooltip_left cursor-pointer srForm_icon active";
          else
              element.IsSpecimenRejForm = "text-center custom_tooltip custom_tooltip_left cursor-pointer srForm_icon";
          if(element.SampleNumber) {
            element.groupclick = true;
          }
          else {
            element.groupclick = false;
          }
        });
      }
    },
      (err) => {

      })
  }

  onSSNEnterPress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.onchangeSSN();
    }
  }

  groupelement(data: any) {
    data.groupclick = !data.groupclick;
  }

  openRemarksModal() {
    this.clearRemarks();
    $("#remarksModal").modal('show');
  }

  clearRemarks() {
    $("#remarks_text").val('');
    this.showRemarksValidation = false;
  }

  SaveSample() {
    if ($("#remarks_text").val() === '') {
      this.showRemarksValidation = true;
      return;
    }
    else {
      this.showRemarksValidation = false;
    }

    var ItemXMLDetails: any[] = [];

    const hasTrueGroupClick = this.FetchLabPhlebtomyDisplayOutputLists.some((element: any) => element.groupclick === true);
    if(hasTrueGroupClick) {
      const ssnList = this.FetchLabPhlebtomyDisplayOutputLists.filter((item) => item.groupclick).map(item => item.SSN);
      const distinctSSNCount = new Set(ssnList).size;
      if(distinctSSNCount === 1) {
        this.FetchLabPhlebtomyDisplayOutputLists.filter((item) => item.groupclick).forEach((element: any, index: any) => {
            if (element.groupclick === true && !element.SampleNumber) {
              var item = {
                "ORD": element.TestOrderID,
                "ORDITM": element.TestOrderItemID,
                "STS": element.CurrentStatus,
                "SEQ": element.Sequence,
                "ROUTID": element.Routid,
                "RMK": $("#remarks_text").val(),
                "SampleCollect": true,
                "SampleAcknowledge": false,
                "SampleRecollect": false,
                "Status": element.CurrentStatus
             }
             ItemXMLDetails.push(item);
            }
        });

        let payload = {
          "UserID": this.doctorDetails[0].UserId,
          "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
          "Hospitalid": this.hospitalId,
          "ItemXMLDetails": ItemXMLDetails
        }
        this.config.ChangeTestOrderStatus(payload).subscribe(
          (response) => {
            if (response.Code == 200) {
              $("#remarksModal").modal('hide');
              $("#savemsg").modal('show');
              this.FetchLabPhlebtomyCount();
              this.dataclick(this.IsLastWeek, this.strStatus, this.strPatientIds, this.intOrderType, this.tdcss, this.activeTab, this.selectedBox);
            } 
          },
          (err) => {
            console.log(err)
          }); 
      }
    }
  }

  ScannedBarcode() {
    // this.BarCode=this.BarCode.toString().split(',').find((x:any) =>x.includes('LAB'));
    // if(!this.BarCode || !this.BarCodeRoomText) {
    //   this.ValidationMsg = "Please select counter.";
    //   $("#ValidMsg").modal("show");    
    //   //this.FetchLabPhlebtomyDisplayOutputLists = [];
    //   return;
    // }
    if(!this.BarCode|| !this.BarCodeRoomText){
      this.ValidationMsg="Select Counter";
      $("#ValidMsg").modal("show");
      this.FetchLabPhlebtomyDisplayOutputLists = [];
      return;
    }
    
    let payload = {
      "SpecimenIDs": "",
      "intUserId": this.doctorDetails[0].UserId,
      "intWorkstationId": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalId,
      "strSmplNo": "",
      "strSSN": "",
      "IsLastweek": "2",
      "strTbl": "2",
      "strStatus": "",
      "fromDate": "",
      "toDate": "",
      "strPatientIds": "",
      "strMobileNo": "",
      "intOrderType": "0",
      "intWardId": "0",
      "isTransfer": 0,
      "isReceived": 0,
      "strPatientSerNumber": "",
      "BagNumber": "",
      "DonorNo": "",
      "BarCode": this.BarCode,
      "TokenCounterValue": this.BarCodeRoomValue,
      "TokenCounterRoom": this.BarCodeRoomText
    }
  
    this.config.FetchLabPhlebtomyDataBarCodeDisplay(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.FetchLabPhlebtomyDisplayOutputLists = response.FetchLabPhlebtomyDisplayOutputLists;

        if(this.FetchLabPhlebtomyDisplayOutputLists.length === 0) {
          $("#errorMsg").modal("show");
        }

        this.FetchLabPhlebtomyDisplayOutputLists.forEach((element: any, index: any) => {
          if(element.IsSpecimenRejForm=='1')
            element.IsSpecimenRejForm = "text-center custom_tooltip custom_tooltip_left cursor-pointer srForm_icon active";
          else
              element.IsSpecimenRejForm = "text-center custom_tooltip custom_tooltip_left cursor-pointer srForm_icon";
          if(element.SampleNumber) {
            element.groupclick = true;
          }
          else {
            element.groupclick = false;
          }
        });
      }
    },
      (err) => {

      })
  }
  ScannedBarcodeItemlevel(item: any) {
    if(!this.BarCodeRoomValue){
      this.ValidationMsg="Select Counter";
      $("#ValidMsg").modal("show");
      return;
    }
    this.selectedItem = item;
    this.confirmationMessage = `Are you sure you want to call token ${item.TokenNo}?`;
    $('#confirmationPopup').modal('show');
  }

  onConfirmation() {
    this.FetchLabPhlebtomyDisplayOutputLists=[];
    let payload = {
      "SpecimenIDs": "",
      "intUserId": this.doctorDetails[0].UserId,
      "intWorkstationId": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalID": this.hospitalId,
      "strSmplNo": "",
      "strSSN": this.selectedItem.SSN,
      "IsLastweek": "2",
      "strTbl": "2",
      "strStatus": "",
      "fromDate": "",
      "toDate": "",
      "strPatientIds": "",
      "strMobileNo": "",
      "intOrderType": "0",
      "intWardId": "0",
      "isTransfer": 0,
      "isReceived": 0,
      "strPatientSerNumber": "",
      "BagNumber": "",
      "DonorNo": "",
      "BarCode": this.selectedItem.TokenNo,
      "TokenCounterValue": this.BarCodeRoomValue,
      "TokenCounterRoom": this.BarCodeRoomText
    };
 
    this.config.FetchLabPhlebtomyDataBarCodeDisplay(payload).subscribe((response) => {
      if (response.Code == 200) {
        this.FetchLabPhlebtomyDisplayOutputLists = response.FetchLabPhlebtomyDisplayOutputLists;

        if(this.FetchLabPhlebtomyDisplayOutputLists.length === 0) {
          $("#errorMsg").modal("show");
        }

        this.FetchLabPhlebtomyDisplayOutputLists.forEach((element: any, index: any) => {
          if(element.IsSpecimenRejForm=='1')
            element.IsSpecimenRejForm = "text-center custom_tooltip custom_tooltip_left cursor-pointer srForm_icon active";
          else
              element.IsSpecimenRejForm = "text-center custom_tooltip custom_tooltip_left cursor-pointer srForm_icon";
          if(element.SampleNumber) {
            element.groupclick = true;
          }
          else {
            element.groupclick = false;
          }
        });
      }
    },
      (err) => {

      })
  }

  onBarCodePress(event: Event) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      this.ScannedBarcode();
    }
  }

  roomchange(event: any) {
    this.BarCodeRoomText = this.getSelectedText(event.target.value);
    this.BarCodeRoomValue = event.target.value;
    //this.ScannedBarcode();
    //this.ScannedBarcodeItemlevel();
  }

  getSelectedText(selectedValue: string): string {
    const valueToTextMap : any = {
      '172161717': '01',
      '172161718': '02',
      '172161719': '03',
      '172161720': '04',
      '172161721': '05',
      '172161722': '06',
      '172161723': '07',
      '172161724': '08',
      '172161725': '09',
      '172161726': '10',
    };
    return valueToTextMap[selectedValue] || '';
  }

  selectallsamples() {
    this.FetchLabPhlebtomyDisplayOutputLists.forEach((element: any, index: any) => {
      element.groupclick = true;
    });
  }

  refresh() {
    this.FetchLabPhlebtomyCount();
  }

  clear() {
    if (this.roomSelect && this.roomSelect.nativeElement) {
      this.roomSelect.nativeElement.selectedIndex = 0; 
    }

    this.SSNNumber = '';
    this.BarCode = '';
    this.FetchLabPhlebtomyDisplayOutputLists = [];
    this.activeTab = 0;
    this.enableBCPrint=false;
    this.selectedBox = '';
  }

  convertintoarray() {
    const groupedData: any = {};

    this.FetchLabPhlebtomyDisplayOutputLists.forEach(item => {
        const patientID = item.PatientID;
        const doctorID = item.DoctorID;
        const sampleNumber = item.SampleNumber; 

        const groupKey = `${patientID}_${doctorID}`;

        if (!groupedData[groupKey]) {
            groupedData[groupKey] = {
                PatientID: patientID,
                DoctorID: doctorID,
                PatientName: item.PatientName,
                Doctor: item.Doctor,
                SSN: item.SSN,
                Age: item.Age,
                Gender: item.Gender,
                MobileNo: item.MobileNo,
                Height: '',
                Weigth: '',
                ReqNo: '',
                Samples: {}
            };
        }

        if (!groupedData[groupKey].Samples[sampleNumber]) {
            groupedData[groupKey].Samples[sampleNumber] = {
                SampleNumber: sampleNumber,
                Specialisation: item.Specialisation,
                Specimen: item.Specimen,
                ContainerName: item.ContainerName,
                SampleRemarks: item.SampleRemarks,
                Tests: [],
            };
        }

        const testItem: any = {
            Test: item.Test,
            TestDate: item.RequisitionDate,
        };

        for (const prop in item) {
            if (item.hasOwnProperty(prop) && prop !== 'PatientID' && prop !== 'DoctorID' && prop !== 'SampleNumber') {
                testItem[prop] = item[prop];
            }
        }

        groupedData[groupKey].Samples[sampleNumber].Tests.push(testItem);
    });

    Object.values(groupedData).forEach((group : any) => {
        group.Samples = Object.values(group.Samples);
    });

    this.groupedDataArray = Object.values(groupedData);
  }

  openSpecimenRejection(p: any) {

    //this.common.fetchPatientDetails(p.SSN, '0', '0').subscribe({
      this.common.fetchPatientVistitInfo(p.IPID, p.PatientID).subscribe({
      next: (response) => {
        if (response?.Code === 200) {
          const options: NgbModalOptions = {
            size: 'lg',
            windowClass: 'vte_view_modal'
          };
          const modalRef = this.modalService.openModal(SpecimenRejectionComponent, {
            selectedPatientData: p
          }, options);
        }
      },
      error: (err) => {
        console.error("Error fetching patient details", err);
      }
    });
  }
    viewselectItemForPatient(item: any) { 
    this.enableBCPrint = true;
    item.ItemSelected = !item.ItemSelected;   
  }
  printBarcodes() {
    var sampleNos = "";
    this.FetchLabPhlebtomyDisplayOutputLists.forEach((element: any, index: any) => {
      if (element.ItemSelected) {
        if (sampleNos != "")
          sampleNos = sampleNos + "," + element.SampleNumber;
        else
          sampleNos = element.SampleNumber;
      }
    });
    var patientType = "1,2,3,4";
    // if (this.selectedPatientType == "2") {
    //   patientType = "2";
    // }
    // else if (this.selectedPatientType == "3") {
    //   patientType = "3";
    // }
    // else {
    //   patientType = "1,2,3,4";
    // }
    if (sampleNos != "") {
      this.config.FetchBarCodePrintAll(sampleNos, patientType, 1, 0, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
        if (response.Code == 200) {
          if (response.FTPPATH != "") {
            //window.open(response.FTPPATH);
            this.trustedUrl = response.FTPPATH;
            $("#showLabReportsModal").modal('show');
          }
        }
      },
        (err) => {

        })
    }
    else {
      $("#validateSampleNumberMsg").modal('show');
    }
  }

  saveDisollectionRemarks() {
    this.us.post('ChangeSampleDisCollectionStatus', {
      "ItemXMLDetails": [
        {
          "ORD": this.discollectionItem.TestOrderID,
          "ORDITM": this.discollectionItem.TestOrderItemID,
          "STS": this.discollectionItem.CurrentStatus,
          "SEQ": this.discollectionItem.Sequence,
          "ROUTID": this.discollectionItem.Routid,
          "RMK": this.remarksForm.get('remarks')?.value,
          "GEN": 2,
          "SampleCollect": false,
          "SampleAcknowledge": false,
          "SampleRecollect": false,
          "Status": this.discollectionItem.CurrentStatus
        }
      ],
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "HospitalId": this.hospitalId
    }).subscribe((reponse: any) => {
      if (reponse.Code === 200) {
        $('#discollectionRemarksModal').modal('hide');
        $("#savemsg").modal('show');
        this.FetchLabPhlebtomyCount();
        this.FetchLabPhlebtomyDisplayOutputLists = [];
        this.dataclick(this.IsLastWeek, this.strStatus, this.strPatientIds, this.intOrderType, this.tdcss, this.activeTab, this.selectedBox);
      }
    });
  }

  onCheckboxChange(item: any) {
    if (item.isSelected) {
      this.discollectionItem = item;
      this.remarksForm.reset();
      $('#discollectionRemarksModal').modal('show');
    }
  }
}
