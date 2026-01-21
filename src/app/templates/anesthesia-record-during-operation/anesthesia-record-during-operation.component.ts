import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import moment from 'moment';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { ConfigService } from 'src/app/services/config.service';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
import * as Highcharts from 'highcharts';
import { ConfigService as BedConfig } from '../../ward/services/config.service';

declare var $: any;
@Component({
  selector: 'app-anesthesia-record-during-operation',
  templateUrl: './anesthesia-record-during-operation.component.html',
  styleUrls: ['./anesthesia-record-during-operation.component.scss'],
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
export class AnesthesiaRecordDuringOperationComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
  @ViewChild('divardo') divardo!: ElementRef;
  @ViewChild('Signature1') Signature1!: SignatureComponent;
  @ViewChild('Signature2') Signature2!: SignatureComponent;
  @ViewChild('Signature3') Signature3!: SignatureComponent;
  @ViewChild('Signature4') Signature4!: SignatureComponent;
  @ViewChild('Signature5') Signature5!: SignatureComponent;
  @ViewChild('Signature6') Signature6!: SignatureComponent;
  @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
  url = "";
  selectedView: any;
  doctorDetails: any;
  PatientTemplatedetailID = 0;
  FetchPatienClinicalTemplateDetailsNList: any = [];
  IsPrint = false;
  IsView = false;
  IsViewActual = false;
  showContent = true;
  HospitalID: any;

  employeeList: any = [];
  IsVitalDisplay: boolean = false;
  showParamValidationMessage = false;
  parameterErrorMessage = '';
  tableVitals: any;
  recordRemarks: Map<number, string> = new Map<number, string>();
  showVitalsValidation: boolean = false;
  VsDetails: any;
  FetchRecoveryRoomVitalsDataList: any = [];
  duringactiveButton: any = 'spline';

  ClinicalTemplateID = "89";
  intervalId: any;
  rows: { agents: string[]; total: string }[] = [];
  initialCellsCount = 4;

  endTidalValues: string[] = Array(10).fill('');
  temperatureValues: string[] = Array(10).fill('');
  bloodLossValues: string[] = new Array(8).fill('');

  addColumn() {
    this.endTidalValues.push('');
    this.temperatureValues.push('');
  }

  addBloodLossCell() {
    this.bloodLossValues.push('');
  }

  trackByRow(index: number, row: any): any {
    return index;
  }

  trackByAgent(index: number, agent: string): any {
    return index;
  }

  constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private config: ConfigService, private bedConfig: BedConfig) {
    super(renderer, el, cdr);
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
  }

  ngOnInit(): void {
    this.addRow();
    this.getreoperative(this.ClinicalTemplateID);
    this.FetchRecoveryRoomVitals();
  }

  addRow() {
    const cellCount = this.rows[0]?.agents.length || this.initialCellsCount;
    this.rows.push({ agents: Array(cellCount).fill(''), total: '' });
  }


  addCell() {
    this.rows.forEach(row => row.agents.push(''));
  }


  trackByIndex(index: number, item: any): any {
    return index;
  }

  bloodProductValues: string[] = new Array(8).fill('');
  crystolliodValues: string[] = new Array(8).fill('');
  urineValues: string[] = new Array(8).fill('');

  addBloodProductCell() {
    this.bloodProductValues.push('');
  }

  addCrystolliodCell() {
    this.crystolliodValues.push('');
  }

  addUrine() {
    this.urineValues.push('');
  }

  ngAfterViewInit() {
    this.intervalId = setInterval(() => {
      if (this.defaultDataReady) {
        this.showdefault(this.divardo.nativeElement);

        this.getDiagnosis();

        this.bindTextboxValue("textbox_Weight", this.selectedView.Weight);
        this.bindTextboxValue("textbox_Height", this.selectedView.Height);
        clearInterval(this.intervalId);
      }
    }, 2000);
    // setTimeout(() => {
    //   this.showdefault(this.divardo.nativeElement);

    //   this.getDiagnosis();

    //   this.bindTextboxValue("textbox_Weight", this.selectedView.Weight);
    //   this.bindTextboxValue("textbox_Height", this.selectedView.Height);
    // }, 1000);
    this.addListeners(this.datepickers);
    this.bindTextboxValue('textbox_date1', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date2', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date3', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date4', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date5', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date6', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date7', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date8', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date9', moment().format('DD-MMM-YYYY'));
    this.bindTextboxValue('textbox_date10', moment().format('DD-MMM-YYYY'));
    //this.bindTextboxValue('textbox_date11', moment().format('DD-MMM-YYYY'));
    const now = new Date();
    this.timerData.push({ id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes() });
    this.timerData.push({ id: 'textbox_generic_time4', value: now.getHours() + ':' + now.getMinutes() });
    //this.timerData.push({ id: 'textbox_generic_time5', value: now.getHours() + ':' + now.getMinutes() });
  }

  viewWorklist() {
    $("#savedModal").modal('show');
  }

  selectedTemplate(tem: any) {
    this.showContent = false;
    setTimeout(() => {
      this.showContent = true;
    }, 0);
    this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: 0, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: this.PatientTemplatedetailID, TBL: 2 });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
            tem = response.FetchPatienClinicalTemplateDetailsNNList[0];
            this.rows = [];
            this.endTidalValues = [];
            this.temperatureValues = [];
            this.bloodProductValues = [];
            this.crystolliodValues = [];
            this.urineValues = [];
            this.bloodLossValues = [];
            // const rowscount = JSON.parse(tem.ClinicalTemplateValues)?.filter((item: any) => item.id.includes('text_DrugAgents1'));

            // for (let i = 0; i < rowscount.length; i++) {
            //   this.rows.push({
            //     count: null
            //   });
            // }

            const templateValues = JSON.parse(tem.ClinicalTemplateValues || '[]');

            const rowCount = templateValues.filter((item: any) => item.id.includes('text_DrugAgents1')).length;
            const cellCount = templateValues.filter((item: any) => item.id.startsWith('text_DrugAgents')).length / rowCount;

            this.rows = [];
            for (let i = 0; i < rowCount; i++) {
              const agents = [];
              for (let j = 0; j < cellCount; j++) {
                const item = templateValues.find((v: any) => v.id === `text_DrugAgents${j + 1}_${i}`);
                agents.push(item?.value || '');
              }
              const totalItem = templateValues.find((v: any) => v.id === `text_DrugAgentsTotal_${i}`);
              this.rows.push({ agents, total: totalItem?.value || '' });
            }

            templateValues.forEach((item: any) => {
              if (item.id.startsWith('text_BloodProduct')) {
                this.bloodProductValues.push(item.value || '');
              } else if (item.id.startsWith('text_EndTidal')) {
                this.endTidalValues.push(item.value || '');
              } else if (item.id.startsWith('text_Temperature')) {
                this.temperatureValues.push(item.value || '');
              } else if (item.id.startsWith('text_BloodLoss')) {
                this.bloodLossValues.push(item.value || '');
              } else if (item.id.startsWith('text_Crystolloid2')) {
                this.crystolliodValues.push(item.value || '');
              } else if (item.id.startsWith('text_Urine')) {
                this.urineValues.push(item.value || '');
              }
            });


            let sameUser = true;
            if (tem.CreatedBy != this.doctorDetails[0]?.UserName) {
              sameUser = false;
            }
            this.dataChangesMap = {};
            this.showElementsData(this.divardo.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
            $("#savedModal").modal('hide');
          }
        }
      },
        (err) => {
        })
  }

  getreoperative(templateid: any) {
    //this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID });
    this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: 0, TBL: 1 });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
            this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
            this.IsView = true;
            this.IsViewActual = true;
          }
        }
      },
        (err) => {
        })
  }

  save() {
    const tags = this.findHtmlTagIds(this.divardo);

    if (tags) {
      var payload = {
        "PatientTemplatedetailID": this.PatientTemplatedetailID,
        "PatientID": this.selectedView.PatientID,
        "AdmissionID": this.selectedView.AdmissionID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "ClinicalTemplateID": this.ClinicalTemplateID,
        "ClinicalTemplateValues": JSON.stringify(tags),
        "USERID": this.doctorDetails[0]?.UserId,
        "WORKSTATIONID": 3395,
        "HospitalID": this.hospitalID,
        "Signature1": this.signatureForm.get('Signature1').value,
        "Signature2": this.signatureForm.get('Signature2').value,
        "Signature3": this.signatureForm.get('Signature3').value,
        "Signature4": this.signatureForm.get('Signature4').value,
        "Signature5": this.signatureForm.get('Signature5').value,
        "Signature6": this.signatureForm.get('Signature6').value,
        "Signature7": this.signatureForm.get('Signature7').value,
        "Signature8": this.signatureForm.get('Signature8').value,
        "Signature9": this.signatureForm.get('Signature9').value,
        "Signature10": this.signatureForm.get('Signature10').value
      }

      this.us.post("SavePatienClinicalTemplateDetails", payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.getreoperative(this.ClinicalTemplateID);
          }
        },
          (err) => {

          })
    }
  }

  clear() {
    this.rows = [];
    this.addRow();

    this.endTidalValues = Array(10).fill('');
    this.temperatureValues = Array(10).fill('');
    this.bloodProductValues = Array(8).fill('');
    this.bloodLossValues = new Array(8).fill('');
    this.crystolliodValues = Array(8).fill('');
    this.urineValues = Array(8).fill('');

    this.dataChangesMap = {};
    this.showContent = false;
    this.PatientTemplatedetailID = 0;
    this.signatureForm.reset();
    this.signatureList = [];
    setTimeout(() => {
      this.showContent = true;
    }, 0);
  }


  getDiagnosis() {
    this.config.fetchAdviceDiagnosis(this.selectedView.AdmissionID, this.HospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          var diag = "";
          response.PatientDiagnosisDataList.forEach((element: any, index: any) => {
            if (diag != "")
              diag = diag + "\n" + response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
            else
              diag = response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
          });

          this.bindTextboxValue("textarea_diagnosis", diag);
        }
      },
        (err) => {

        })
  }

  clearbase64Signature(signature: SignatureComponent): void {
    signature.clearSignature();
  }

  templatePrint(name: any, header?: any) {
    if (header) {
      if ($('#divscroll').hasClass('template_scroll')) {
        $('#divscroll').removeClass("template_scroll");
      }

      this.IsPrint = true;
      this.IsView = false;

      setTimeout(() => {
        const originalParent = this.divardo.nativeElement.parentNode;
        const nextSibling = this.divardo.nativeElement.nextSibling;

        const space = document.createElement('div');
        space.style.height = '60px';
        header.appendChild(space);

        header.appendChild(this.divardo.nativeElement);

        this.print(header, name);

        setTimeout(() => {
          if (nextSibling) {
            originalParent.insertBefore(this.divardo.nativeElement, nextSibling);
          } else {
            originalParent.appendChild(this.divardo.nativeElement);
          }

          header.removeChild(space);

          $('#divscroll').addClass("template_scroll");
          this.IsPrint = false;
          this.IsView = this.IsViewActual;
        }, 500);
      }, 500);

      return;
    }
  }

  searchEmployee(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(otPatientDetails.FetchSSEmployees, { name: event.target.value, UserId: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.employeeList = response.FetchSSEmployeesDataList;
          }
        },
          (err) => {
          })
    }
  }

  onEmployeeSelected(item: any, id?: any) {
    this.employeeList = [];

    if (id) {
      this.bindTextboxValue(id, item.ID);
    }
  }

  addVitals() {
    $("#vitalsModal").modal('show');
    this.clearVital();
  }

  clearVital() {
    this.showParamValidationMessage = false;
    this.showVitalsValidation = false;
    this.IsVitalDisplay = false;
    setTimeout(() => {
      this.IsVitalDisplay = true;
    }, 0);
  }

  receivedData(data: { vitalData: any, remarksData: any }) {
    this.tableVitals = data.vitalData;
    this.recordRemarks = data.remarksData;
  }

  saveVitals() {
    let bpsys = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP -Systolic");
    let bpdia = this.tableVitals.filter((x: any) => x?.PARAMETER === "BP-Diastolic");
    let temp = this.tableVitals.filter((x: any) => x?.PARAMETER === "Temperature");
    let remarksEntered = true;
    if (bpsys[0].PARAMVALUE === null || bpsys[0].PARAMVALUE === "" || bpdia[0].PARAMVALUE === null || bpdia[0].PARAMVALUE === "") {
      this.showVitalsValidation = true;
    } else {
      this.showVitalsValidation = false;
      this.VsDetails = [];
      let outOfRangeParameters: string[] = [];
      this.tableVitals.forEach((element: any, index: any) => {
        let RST: any;
        let ISPANIC: any;
        if ((element.PARAMVALUE >= element.ALLOWUOMMINRANGE && element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE && element.PARAMVALUE <= element.ALLOWUOMMAXRANGE))
          RST = 2;
        else
          RST = 1;

        if ((!element.PARAMVALUE) && ((element.PARAMVALUE < element.NORMALMINRANGE) || (element.PARAMVALUE > element.NORMALMAXRANGE)))
          ISPANIC = 1;
        else
          ISPANIC = 0;
        const remark = this.recordRemarks.get(index);
        if (element.PARAMVALUE !== null && element.VitalHigh || element.VitalLow) {
          outOfRangeParameters.push(element.PARAMETER);
          if (remark === undefined || remark.trim() === "") {
            this.parameterErrorMessage = `Please enter Remarks for ${element.PARAMETER}`;
            remarksEntered = false;
          }
        }
        this.VsDetails.push({
          "VSPID": element.PARAMETERID,
          "VSNAME": element.PARAMETER,
          "VSGID": element.GROUPID,
          "VSGDID": element.GroupDETAILID,
          "PV": element.PARAMVALUE,
          "CMD": remark,
          "RST": RST,
          "ISPANIC": ISPANIC
        });
      });
      if (outOfRangeParameters.length > 0 && !remarksEntered) {
        this.showParamValidationMessage = true;
        this.showVitalsValidation = false;
        return;
      }
      let payload = {
        "VitalGroupID": "3",
        "MonitorId": "0",
        "PatientID": this.selectedView.PatientID,
        "Admissionid": this.selectedView.IPID,
        "DoctorID": this.doctorDetails[0].EmpId,
        "Hospitalid": this.hospitalID,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "PatientType": this.selectedView.PatientType,
        "ScheduleID": "0",
        "FacilityID": this.facility.FacilityID,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID,
        "BedID": this.selectedView.BedID,
        "ClinicalTemplateID": this.ClinicalTemplateID,
        "VSDetails": this.VsDetails
      };

      this.bedConfig.SaveClinicalIPVitalsRecoveryRoom(payload).subscribe(response => {
        if (response.Code == 200) {
          $("#saveVitalsMsg").modal('show');
          $("#vitalsModal").modal('hide');
          outOfRangeParameters.forEach(parameter => {
            const index = this.tableVitals.findIndex((element: any) => element.PARAMETER === parameter);
            this.recordRemarks.delete(index);
          });
          this.FetchRecoveryRoomVitals();
        }
      });
      this.showParamValidationMessage = false;
    }
  }

  FetchRecoveryRoomVitals() {
    const url = this.us.getApiUrl('FetchRecoveryRoomVitals?IPID=${IPID}&ClinicalTemplateID=${ClinicalTemplateID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}', {
      IPID: this.selectedView.IPID,
      ClinicalTemplateID: this.ClinicalTemplateID,
      WorkStationID: this.facility.FacilityID,
      HospitalID: this.hospitalID
    });

    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.FetchRecoveryRoomVitalsDataList = response.FetchRecoveryRoomVitalsDataList;
        if (this.FetchRecoveryRoomVitalsDataList.length > 0) {
          this.getChart(this.duringactiveButton);
        }
      }
    })
  }

  getChart(type: any) {
    this.duringactiveButton = type;
    this.dynamicChartData(type);
  }

  dynamicChartData(type: any) {
    let vitaldata: any = {};

    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];


    this.FetchRecoveryRoomVitalsDataList.forEach((element: any, index: any) => {

      if (element.BPSystolic != 0) {
        BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      }
      if (element.BPDiastolic != 0) {
        BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      }
      if (element.O2FlowRate != 0) {
        O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      }
      if (element.Pulse != 0) {
        PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      }
      if (element.Respiration != 0) {
        RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      }
      if (element.SPO2 != 0) {
        SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      }
      if (element.Temperature != 0) {
        TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
      }
    });

    vitaldata = [{ name: 'BP-Systolic', data: BPSystolicData },
    { name: 'BP-Diastolic', data: BPDiastolicData },
    { name: 'O2 Flow Rate', data: O2FlowRateData, visible: false },
    { name: 'Pulse', data: PulseData, visible: false },
    { name: 'Respiration', data: RespirationData, visible: false },
    { name: 'SPO2', data: SPO2Data, visible: false },
    { name: 'Temparature', data: TemparatureData, visible: false }
    ];


    const chart = Highcharts.chart('chart-line', {
      chart: {
        type: type,
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
      },
      series: vitaldata,
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
}
