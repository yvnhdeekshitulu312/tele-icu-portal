import { Component, Input, OnInit, Type } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { IntakeoutputService } from './intakeoutput.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { IntakeoutputDetails } from './urls';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
declare var $: any;

@Component({
  selector: 'app-intakeoutput',
  templateUrl: './intakeoutput.component.html',
  styleUrls: ['./intakeoutput.component.scss'],
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
export class IntakeoutputComponent extends BaseComponent implements OnInit {
  @Input() IsSwitchWard: any = false;
  IsHome = true;
  IsSwitch = false;
  IsHeadNurse: any;
  url = '';
  type = 1;
  listOfData: any = [];
  listOfDataOutput: any = [];
  intakeoutputform: any;
  listOfUOM: any = [];
  gridData: any[] = [];
  viewData: any[] = [];
  viewAllIntakeOutput: any;
  selectedPrescriptionToLoad: any;
  showSubstituteValidation = false;
  tablePatientsForm!: FormGroup;
  tableSummaryForm!: FormGroup;
  addBtnName: string = "Add";
  addBtnNameOP: string = "Add";
  summaryData: any = [];
  totalIntakeQty: string = "";
  totalOutputQty: string = "";
  balanceQty: string = "";
  InOutDate: string = "";
  isSubmitted = false;
  listofUoms: any = [];
  patinfo: any;
  errorMessages: any[] = [];
  remarksList: any[] = ['Pigtail', 'ICDT', 'Hemovac', 'JP Drain', 'NGT', 'Pegtube', 'Others'];
  constructor(private router: Router, private service: IntakeoutputService, private us: UtilityService, private fb: FormBuilder) {
    super();
    this.initialize();
    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
    this.tablePatientsForm = this.fb.group({
      FromDate: [''],
      ToDate: [''],
    });
    var wm = new Date(this.selectedView.AdmitDate);
    var d = new Date();
    this.tablePatientsForm.patchValue({
      FromDate: wm,
      ToDate: d
    })
    this.tableSummaryForm = this.fb.group({
      SummaryFromDate: [''],
      SummaryToDate: [''],
    });
    var wm = new Date();
    var d = new Date();
    wm.setMonth(wm.getMonth() - 1);
    this.tableSummaryForm.patchValue({
      SummaryFromDate: d,
      SummaryToDate: d
    })
  }

  ngOnInit(): void {
    this.IsSwitch = this.IsSwitchWard;
    this.wardID = this.ward.FacilityID;
    this.admissionID = this.selectedView.IPID;
    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    // this.fetchSaved();
  }

  initialize() {
    const currentDateTime = new Date();
    const currentTime = currentDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    this.intakeoutputform = this.fb.group({
      IntakeOutputIDAuto: [''],
      IntakeOutputID: [''],
      IntakeOutputName: [''],
      Qty: [''],
      UOMID: [''],
      UOM: [''],
      Date: [currentDateTime],
      Time: [currentTime],
      Remarks: [''],
      Type: [''],
      IntakeOutputIDOP: [''],
      IntakeOutputNameOP: [''],
      QtyOP: [''],
      UOMIDOP: [''],
      UOMOP: [''],
      DateOP: [currentDateTime],
      TimeOP: [currentTime],
      RemarksOP: [''],
      RemarksOPOthers: ['']
      //TypeOP: [''],
    });
  }

  toggleType(type: any) {
    if (this.type != type) {
      this.initialize();
    }
    this.type = type;
  }

  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  fetchIntakeOutPutUOM(type: any, filter: any) {
    this.url = this.service.getData(IntakeoutputDetails.FetchIntakeOutPutUOM, { Type: type, SFilter: filter });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (type === 1) {
            this.listOfUOM = response.GetMasterDataList;
          }
          else {
            if (response.GetMasterDataList[0].name && !this.intakeoutputform.get('UOM').value) {
              this.intakeoutputform.get('UOMID').setValue(response.GetMasterDataList[0].id);
              this.intakeoutputform.get('UOM').setValue(response.GetMasterDataList[0].name);
            }
          }
        }
      },
        (err) => {
        })
  }

  fetchIntake(filter: any) {
    this.url = this.service.getData(IntakeoutputDetails.FetchInTakeOutPut, { Filter: filter, Param: this.type });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfData = response.FetchInTakeOutPutTDataList;

          this.fetchIntakeOutPutUOM(0, 0);
        }
      },
        (err) => {
        })
  }

  fetchOutPut(filter: any) {
    this.url = this.service.getData(IntakeoutputDetails.FetchInTakeOutPut, { Filter: filter, Param: this.type });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfDataOutput = response.FetchInTakeOutPutTDataList;

          this.fetchIntakeOutPutUOM(0, 0);
        }
      },
        (err) => {
        })
  }

  searchName(event: any, type: any) {
    this.type = type;
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.fetchIntake(filter);
    }
  }
  searchNameOutput(event: any, type: any) {
    this.type = type;
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.fetchOutPut(filter);
    }
  }

  onSelected(item: any) {
    this.intakeoutputform.get('IntakeOutputID').setValue(item.InOutID);
    this.intakeoutputform.get('IntakeOutputName').setValue(item.Name);
    this.intakeoutputform.get('Qty').setValue(1);
    this.intakeoutputform.get('UOMID').setValue(item.UOMID);
    this.intakeoutputform.get('UOM').setValue(item.UOM);
    this.intakeoutputform.get('Type').setValue(1);

    this.intakeoutputform.get('IntakeOutputIDOP').setValue('');
    this.intakeoutputform.get('IntakeOutputNameOP').setValue('');
    this.intakeoutputform.get('QtyOP').setValue('');
    this.intakeoutputform.get('UOMIDOP').setValue('');
    this.intakeoutputform.get('UOMOP').setValue('');
    //this.intakeoutputform.get('TypeOP').setValue(0);


    this.listOfData = [];
    // this.add();
  }
  onSelectedOutake(item: any) {

    this.intakeoutputform.get('IntakeOutputID').setValue('');
    this.intakeoutputform.get('IntakeOutputName').setValue('');
    this.intakeoutputform.get('Qty').setValue('');
    this.intakeoutputform.get('UOMID').setValue('');
    this.intakeoutputform.get('UOM').setValue('');
    //this.intakeoutputform.get('Type').setValue(0);

    this.intakeoutputform.get('IntakeOutputIDOP').setValue(item.InOutID);
    this.intakeoutputform.get('IntakeOutputNameOP').setValue(item.Name);
    this.intakeoutputform.get('QtyOP').setValue(1);
    this.intakeoutputform.get('UOMIDOP').setValue(item.UOMID);
    this.intakeoutputform.get('UOMOP').setValue(item.UOM);
    this.intakeoutputform.get('Type').setValue(-2);
    this.listOfData = [];
    // this.add();
  }

  searchUOM(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.fetchIntakeOutPutUOM(1, filter);
    }
  }

  onUOMSelected(item: any) {
    this.intakeoutputform.get('UOMID').setValue(item.id);
    this.intakeoutputform.get('UOM').setValue(item.name);
    this.listOfUOM = [];
  }
  onUOMSelectedOP(item: any) {
    this.intakeoutputform.get('UOMIDOP').setValue(item.id);
    this.intakeoutputform.get('UOMOP').setValue(item.name);
    this.listOfUOM = [];
  }

  add(Type: any): void {
    this.isSubmitted = true;
    this.errorMessages = [];
    if (Type === 1) {
      if (this.intakeoutputform?.get('IntakeOutputID').value == '' || this.intakeoutputform?.get('Qty').value == '' || this.intakeoutputform?.get('UOMID').value == '') {

        if (this.intakeoutputform?.get('IntakeOutputID').value === '') {
          this.errorMessages.push("Intake Name");
        }
        if (this.intakeoutputform?.get('Qty').value === '') {
          this.errorMessages.push("Qty");
        }
        if (this.intakeoutputform?.get('UOMID').value === '') {
          this.errorMessages.push("UOM");
        }
        // return;
      }
      if (this.errorMessages.length > 0) {
        $("#errorMessage").modal('show');
        return;
      }
    }
    else if (Type === -2) {
      if (this.intakeoutputform?.get('IntakeOutputNameOP').value == '' || this.intakeoutputform?.get('QtyOP').value == '' || this.intakeoutputform?.get('UOMIDOP').value == '') {

        if (this.intakeoutputform?.get('IntakeOutputNameOP').value === '') {
          this.errorMessages.push("Output Name");
        }
        if (this.intakeoutputform?.get('QtyOP').value === '') {
          this.errorMessages.push("Qty");
        }
        if (this.intakeoutputform?.get('UOMIDOP').value === '') {
          this.errorMessages.push("UOM");
        }

        // return;
      }
      if (this.errorMessages.length > 0) {
        $("#errorMessage").modal('show');
        return;
      }
    }

    if (this.intakeoutputform.valid) {
      if ((this.addBtnName == "Add" && Type == '1') || (this.addBtnNameOP == "Add" && Type == '-2')) {
        const formData = this.intakeoutputform.value;
        this.gridData.push(formData);
        this.initialize();
        this.isSubmitted = false;
      }
      else {
        this.isSubmitted = false;
        let find = this.gridData.find((x: any) => x.IntakeOutputID === this.intakeoutputform?.get('IntakeOutputID').value);
        find.IntakeOutputIDAuto = this.intakeoutputform?.get('IntakeOutputIDAuto').value,
          find.IntakeOutputID = this.intakeoutputform?.get('IntakeOutputID').value,
          find.IntakeOutputName = this.intakeoutputform?.get('IntakeOutputName').value,
          find.Qty = this.intakeoutputform?.get('Qty').value,
          find.UOMID = this.intakeoutputform?.get('UOMID').value,
          find.UOM = this.intakeoutputform?.get('UOM').value,
          find.Date = this.intakeoutputform?.get('Date').value,
          find.Time = this.intakeoutputform?.get('Time').value,
          find.Remarks = this.intakeoutputform?.get('Remarks').value,

          find.IntakeOutputIDOP = this.intakeoutputform?.get('IntakeOutputIDOP').value,
          find.IntakeOutputNameOP = this.intakeoutputform?.get('IntakeOutputNameOP').value,
          find.QtyOP = this.intakeoutputform?.get('QtyOP').value,
          find.UOMIDOP = this.intakeoutputform?.get('UOMIDOP').value,
          find.UOMOP = this.intakeoutputform?.get('UOMOP').value,
          find.DateOP = this.intakeoutputform?.get('DateOP').value,
          find.TimeOP = this.intakeoutputform?.get('TimeOP').value,
          find.RemarksOP = this.intakeoutputform?.get('RemarksOP').value,
          find.RemarksOPOthers = this.intakeoutputform?.get('RemarksOPOthers').value,
          this.initialize();
        this.addBtnName = "Add"; this.addBtnNameOP = "Add";
      }
    }
  }

  deleteIntakeOutput(item: any, index: any) {
    this.gridData.splice(index, 1);
  }

  save() {
    this.errorMessages = [];
    if (this.gridData.length == 0) {
      this.errorMessages.push("Select atleast one Intake/Output");
      if (this.errorMessages.length > 0) {
        $("#errorMessage").modal('show');
        return;
      }
    }

    var Details: any = [];
    this.gridData.forEach((element: any) => {
      Details.push({
        "IOPID": element.IntakeOutputIDAuto,
        "IID": element.Type == 1 ? element.IntakeOutputID : element.IntakeOutputIDOP,  //element.IntakeOutputID,
        "IDT": element.Type == 1 ? moment(element.Date).format("DD-MMM-YYYY") + ' ' + element.Time : moment(element.DateOP).format("DD-MMM-YYYY") + ' ' + element.TimeOP,
        "QTY": element.Type == 1 ? element.Qty : element.QtyOP,
        "UID": element.Type == 1 ? element.UOMID : element.UOMIDOP,
        "RMK": element.Type == 1 ? `${element.Remarks}` : `${element.RemarksOP}${element.RemarksOPOthers ? ':' + element.RemarksOPOthers : ''}`
      });
    });

    var payload = {
      "AdmissionID": this.selectedView.IPID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "Details": Details,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "Hospitalid": this.hospitalID
    }

    this.us.post(IntakeoutputDetails.SavePatientInTakeOutput, payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          $("#saveMsg").modal('show');
        }
      },
        (err) => {

        })
  }

  clear() {
    this.initialize();
    this.fetchSaved();
  }

  fetchSaved() {
    this.url = this.service.getData(IntakeoutputDetails.FetchPatientIntakOutputSave, { IPID: this.selectedView.IPID });
    this.gridData = [];
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.viewAllIntakeOutput = response.FetchPatientIntakOutputSaveListD;
          response.FetchPatientIntakOutputSaveListD.forEach((element: any) => {
            this.gridData.push({
              IntakeOutputIDAuto: element.IntakeOutputID,
              IntakeOutputID: element.InOutID,
              IntakeOutputName: element.IntakeOutput,
              Qty: element.Quantity,
              UOMID: element.UoMID,
              UOM: element.UOM,
              Date: new Date(element.InOutDate.split(' ')[0]),
              Time: element.InOutDate.split(' ')[1],
              Remarks: element.Remarks
            });
          });
        }
      },
        (err) => {
        })
  }

  selectViewRxPrescription(pres: any) {
    if (pres.selected) {
      pres.selected = false;
    }
    else {
      pres.selected = true;
    }
    //this.selectedPrescriptionToLoad = pres;
    // this.gridData.forEach((element: any, index: any) => {
    //   if (element.IntakeOutputID === pres.IntakeOutputID) {
    //     element.selected = true;
    //   }
    //   else {
    //     element.selected = false;
    //   }
    // });
  }
  loadSelectedViewRxPrescriptionDetails() {
    this.viewData.forEach(element => {
      if (element.selected) {
        const Remarks = element.Remarks.split(':');
        this.gridData.push({
          IntakeOutputIDAuto: element.IntakeOutputIDAuto,
          IntakeOutputID: element.IntakeOutputID,
          IntakeOutputName: element.IntakeOutputName,
          Qty: element.Qty,
          UOMID: element.UoMID == undefined ? element.UOMID : element.UoMID,
          UOM: element.UOM,
          Date: element.Date,//new Date(element.InOutDate.split(' ')[0]),
          Time: element.Time,
          Remarks: element.Remarks,
          selected: false,
          Type: element.Type,
          IntakeOutputIDOP: element.IntakeOutputID,
          IntakeOutputNameOP: element.IntakeOutputName,
          QtyOP: element.Qty,
          UOMIDOP: element.UoMID == undefined ? element.UOMID : element.UoMID,
          UOMOP: element.UOM,
          DateOP: element.Date,
          TimeOP: element.Time,
          RemarksOP: Remarks[0].split(','),
          RemarksOPOthers: Remarks[1],
          UserName: element.UserName,
        });
      }
    });


    //this.loadSelectedPrescriptionDetails(pres);
    $("#divViewRx").modal('hide');
  }

  editIntakeOutput(item: any) {
    if (item.Type == '1') {
      this.intakeoutputform.patchValue({
        IntakeOutputIDAuto: item.IntakeOutputIDAuto,
        IntakeOutputID: item.IntakeOutputID,
        IntakeOutputName: item.IntakeOutputName,
        Qty: item.Qty,
        UOMID: item.UOMID,
        UOM: item.UOM,
        Date: new Date(item.Date),
        Time: item.Time,
        Remarks: item.Remarks,
        IntakeOutputIDOP: item.IntakeOutputIDOP,
        IntakeOutputNameOP: item.IntakeOutputNameOP,
        QtyOP: item.QtyOP,
        UOMIDOP: item.UOMIDOP,
        UOMOP: item.UOMOP,
        DateOP: new Date(item.DateOP),
        TimeOP: item.TimeOP,
        RemarksOP: item.RemarksOP,
        RemarksOPOthers: item.RemarksOPOthers,
        Type: 1,
      });
      this.addBtnName = "Update";
    } else if (item.Type == '-2') {
      this.intakeoutputform.patchValue({
        IntakeOutputIDAuto: item.IntakeOutputIDAuto,
        IntakeOutputIDOP: item.IntakeOutputIDOP,
        IntakeOutputNameOP: item.IntakeOutputNameOP,
        QtyOP: item.QtyOP,
        UOMIDOP: item.UOMIDOP,
        UOMOP: item.UOMOP,
        DateOP: new Date(item.DateOP),
        TimeOP: item.TimeOP,
        RemarksOP: item.RemarksOP,
        RemarksOPOthers: item.RemarksOPOthers,
        IntakeOutputID: item.IntakeOutputID,
        IntakeOutputName: item.IntakeOutputName,
        Qty: item.Qty,
        UOMID: item.UOMID,
        UOM: item.UOM,
        Date: new Date(item.Date),
        Time: item.Time,
        Remarks: item.Remarks,
        Type: -2,
      });
      this.addBtnNameOP = "Update";
    }

  }

  onViewIntakeClick() {
    this.viewData = [];
    var fromdate = this.tablePatientsForm.get("FromDate")?.value;
    fromdate = moment(fromdate).format('DD-MMM-YYYY');
    var todate = this.tablePatientsForm.get("ToDate")?.value;
    if (todate != null) {
      todate = moment(todate).format('DD-MMM-YYYY');
      this.url = this.service.getData(IntakeoutputDetails.FetchPatientIntakOutputSave, { IPID: this.selectedView.IPID, FromDate: fromdate, ToDate: todate });
      this.gridData = [];
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.viewAllIntakeOutput = response.FetchPatientIntakOutputSaveListD;
            response.FetchPatientIntakOutputSaveListD.forEach((element: any) => {
              this.viewData.push({
                IntakeOutputIDAuto: element.IntakeOutputID,
                IntakeOutputID: element.InOutID,
                IntakeOutputName: element.IntakeOutput,
                Qty: element.Quantity,
                UOMID: element.UoMID,
                UOM: element.UOM,
                Date: element.InOutDate.split(' ')[0],//new Date(element.InOutDate.split(' ')[0]),
                Time: element.InOutDate.split(' ')[1],
                Remarks: element.Remarks,
                UserName: element.UserName,
                Type: element.Isintake == "True" ? '1' : '-2'
              });
            });
          }
        },
          (err) => {
          })

    }
    $("#divViewRx").modal('show');
  }

  fetchSummaryData() {
    var fromdate = this.tableSummaryForm.get("SummaryFromDate")?.value;
    fromdate = moment(fromdate).format('DD-MMM-YYYY');
    var todate = this.tableSummaryForm.get("SummaryToDate")?.value;
    if (todate != null) {
      todate = moment(todate).format('DD-MMM-YYYY');
      this.url = this.service.getData(IntakeoutputDetails.FetchPatientIntakOutputSave, { IPID: this.selectedView.IPID, FromDate: fromdate, ToDate: todate });
      this.gridData = [];
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.summaryData = [];
            // const uniqueUoms = response.FetchPatientIntakOutputSaveListD.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.UoMID === thing.UoMID) === i);
            // this.listofUoms = uniqueUoms;
            // uniqueUoms.forEach((ele: any, ind: any) => {
            //   var intakedata = response.FetchPatientIntakOutputSaveListD.filter((x: any) => x.UoMID === ele.UoMID && x.Isintake == 'True');
            //   var outputdata = response.FetchPatientIntakOutputSaveListD.filter((x: any) => x.UoMID === ele.UoMID && x.Isintake == 'False');

            //   const totalintakeqty = intakedata.map((item: any) => Number.parseInt(item.Quantity)).reduce((acc: any, curr: any) => acc + curr, 0);
            //   this.totalIntakeQty = totalintakeqty.toString() + ele.UOM;

            //   const totaloutputqty = Number(outputdata.map((item: any) => Number.parseInt(item.Quantity)).reduce((acc: any, curr: any) => acc + curr, 0));
            //   this.totalOutputQty = totaloutputqty.toString() + ele.UOM;

            //   const balQty = Number(totalintakeqty) - Number(totaloutputqty);
            //   this.balanceQty = balQty.toString() + ele.UOM;

            //   response.FetchPatientIntakOutputSaveListD.forEach((element: any, index: any) => {
            //     if (intakedata[index] != undefined || outputdata[index] != undefined) {
            //       this.summaryData.push({
            //         Uom: intakedata[index] != undefined ? intakedata[index].UOM : "",
            //         Intake: intakedata[index] != undefined ? intakedata[index].IntakeOutput : "",
            //         IntakeQty: intakedata[index] != undefined ? intakedata[index].Quantity + intakedata[index].UOM : "",
            //         Output: outputdata[index] != undefined ? outputdata[index].IntakeOutput : "",
            //         OutputQty: outputdata[index] != undefined ? outputdata[index].Quantity + intakedata[index]?.UOM : "",
            //         BalanceQty: Number.parseInt(intakedata[index]?.Quantity)-Number.parseInt(outputdata[index]?.Quantity),
            //         InOutDate: intakedata[index] != undefined ? intakedata[index].InOutDate : "",
            //       })
            //     }
            //   });
            // });

            this.buildSummary(
              response.FetchPatientIntakOutputSaveListD.filter((x: any) => x.Isintake == 'True'),
              response.FetchPatientIntakOutputSaveListD.filter((x: any) => x.Isintake == 'False')
            );

          }
        },
          (err) => {
          })
    }
  }

  buildSummary(intakedata: any[], outputdata: any[]) {

  const uomMap: any = {};

  const init = (uom: string) => ({
    uom,
    intakeMap: {},
    outputMap: {},
    intakeList: [],
    outputList: [],
    totalIntake: 0,
    totalOutput: 0,
    balance: 0
  });

  /* ---------- INTAKE ---------- */
  intakedata.forEach(i => {
    if (!i?.UOM) return;

    uomMap[i.UOM] ??= init(i.UOM);

    const name = i.IntakeOutput || 'Others';
    const qty = this.parseQty(i.Quantity);

    uomMap[i.UOM].intakeMap[name] =
      (uomMap[i.UOM].intakeMap[name] || 0) + qty;

    uomMap[i.UOM].totalIntake += qty;
  });

  /* ---------- OUTPUT ---------- */
  outputdata.forEach(o => {
    if (!o?.UOM) return;

    uomMap[o.UOM] ??= init(o.UOM);

    const name = o.IntakeOutput || 'Others';
    const qty = this.parseQty(o.Quantity);

    uomMap[o.UOM].outputMap[name] =
      (uomMap[o.UOM].outputMap[name] || 0) + qty;

    uomMap[o.UOM].totalOutput += qty;
  });

  /* ---------- FINALIZE ---------- */
  Object.values(uomMap).forEach((g: any) => {

    g.intakeList = Object.keys(g.intakeMap).map(name => ({
      name,
      qty: g.intakeMap[name]
    }));

    g.outputList = Object.keys(g.outputMap).map(name => ({
      name,
      qty: g.outputMap[name]
    }));

    g.balance = g.totalIntake - g.totalOutput;

    delete g.intakeMap;
    delete g.outputMap;
  });

  this.summaryData = Object.values(uomMap);
}

  buildSummaryWithoutGrp(intakedata: any[], outputdata: any[]) {

    const uomMap: any = {};

    /* ---------- INTAKE ---------- */
    intakedata.forEach(intake => {
      if (!intake?.UOM) return;

      const key = this.normalizeUOM(intake.UOM);

      if (!uomMap[key]) {
        uomMap[key] = {
          displayUOM: intake.UOM,
          intakeMap: {},
          intakeList: [],
          outputName: '',
          outputQty: 0,
          totalIntake: 0,
          totalOutput: 0,
          balance: 0
        };
      }

      const name = intake.IntakeOutput || 'Others';
      const qty = this.parseQty(intake.Quantity);

      uomMap[key].intakeMap[name] =
        (uomMap[key].intakeMap[name] || 0) + qty;

      uomMap[key].totalIntake += qty;
    });

    /* ---------- OUTPUT ---------- */
    outputdata.forEach(output => {
      if (!output?.UOM) return;

      const key = this.normalizeUOM(output.UOM);

      if (!uomMap[key]) {
        uomMap[key] = {
          displayUOM: output.UOM,
          intakeMap: {},
          intakeList: [],
          outputName: '',
          outputQty: 0,
          totalIntake: 0,
          totalOutput: 0,
          balance: 0
        };
      }

      uomMap[key].outputName = output.IntakeOutput || 'Output';
      const qty = this.parseQty(output.Quantity);

      uomMap[key].outputQty += qty;
      uomMap[key].totalOutput += qty;
    });

    /* ---------- FINALIZE ---------- */
    Object.values(uomMap).forEach((g: any) => {
      g.intakeList = Object.keys(g.intakeMap).map(name => ({
        name,
        qty: g.intakeMap[name]
      }));

      g.balance = g.totalIntake - g.totalOutput;
      delete g.intakeMap;
    });

    this.summaryData = Object.values(uomMap);
  }

  normalizeUOM(uom: string): string {
    return uom?.toString().trim().toLowerCase().replace(/\s+/g, '');
  }

  parseQty(value: any): number {
    if (value === null || value === undefined) return 0;

    // remove anything that is not number or dot
    const cleaned = value.toString().replace(/[^0-9.]/g, '');

    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  openQuickActions() {
    this.patinfo = this.selectedView;
    $("#quickaction_info").modal('show');
  }
  clearPatientInfo() {
    this.patinfo = "";
  }
  closeModal() {
    $("#quickaction_info").modal('hide');
  }

}
