import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { ConfigService } from 'src/app/services/config.service';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ConfigService as BedConfig } from '../../ward/services/config.service';
import * as Highcharts from 'highcharts';
import moment from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';

declare var $: any;
@Component({
    selector: 'app-recovery-room-record',
    templateUrl: './recovery-room-record.component.html',
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
export class RecoveryRoomRecordComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
    @ViewChild('divrecrr') divrecrr!: ElementRef;
    @ViewChild('Signature1') Signature1!: SignatureComponent;
    @ViewChild('Signature2') Signature2!: SignatureComponent;
    @ViewChild('Signature3') Signature3!: SignatureComponent;
    @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;
    url = "";
    FetchEndoDrugsDataList: any;
    selectedView: any;
    doctorDetails: any;
    PatientTemplatedetailID = 0;
    FetchPatienClinicalTemplateDetailsNList: any = [];
    IsView = false;
    showContent = true;
    HospitalID: any;
    IsVitalDisplay: boolean = false;
    showParamValidationMessage = false;
    parameterErrorMessage = '';
    tableVitals: any;
    recordRemarks: Map<number, string> = new Map<number, string>();
    showVitalsValidation: boolean = false;
    VsDetails: any;
    FetchRecoveryRoomVitalsDataList: any = [];
    duringactiveButton: any = 'spline';
    IsPrint: boolean = false;
    IsViewActual = false;
    employeeList: any = [];

    constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private config: ConfigService, private bedConfig: BedConfig) {
        super(renderer, el, cdr);
        this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        this.HospitalID = sessionStorage.getItem("hospitalId");
    }

    ngOnInit(): void {
        this.getreoperative("118");
        this.FetchRecoveryRoomVitals();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.showdefault(this.divrecrr.nativeElement);
        }, 3000);
        this.bindTextboxValue('textbox_Time1', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('textbox_Time2', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('textbox_Time3', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('textbox_Date1', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('textbox_Date2', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('textbox_Date3', moment().format('DD-MMM-YYYY'));
        const now = new Date();
        this.timerData.push({ id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes() });
        this.timerData.push({ id: 'textbox_generic_time2', value: now.getHours() + ':' + now.getMinutes() });
        this.timerData.push({ id: 'textbox_generic_time3', value: now.getHours() + ':' + now.getMinutes() });
        this.addListeners(this.datepickers);
    }

    viewWorklist() {
        $("#savedModal").modal('show');
    }

    selectedTemplate(tem: any) {
        this.showContent = false;
    setTimeout(()=>{
      this.showContent = true;
    }, 0);
        this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
        this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: 0, AdmissionID: this.selectedView.AdmissionID, PatientTemplatedetailID: this.PatientTemplatedetailID, TBL: 2 });

        this.us.get(this.url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
                        tem = response.FetchPatienClinicalTemplateDetailsNNList[0];
                        let sameUser = true;
                        if (tem.CreatedBy != this.doctorDetails[0]?.UserName) {
                            sameUser = false;
                        }
                        this.dataChangesMap = {};
                        this.showElementsData(this.divrecrr.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
                        $("#savedModal").modal('hide');
                    }
                }
            },
                (err) => {
                })
    }

    getreoperative(templateid: any) {
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
        const tags = this.findHtmlTagIds(this.divrecrr);

        if (tags) {
            const mergedArray  = tags.concat(this.timerData);
            var payload = {
                "PatientTemplatedetailID": this.PatientTemplatedetailID,
                "PatientID": this.selectedView.PatientID,
                "AdmissionID": this.selectedView.AdmissionID,
                "DoctorID": this.doctorDetails[0].EmpId,
                "SpecialiseID": this.selectedView.SpecialiseID,
                "ClinicalTemplateID": 118,
                "ClinicalTemplateValues": JSON.stringify(mergedArray),
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
                        this.getreoperative("118");
                    }
                },
                    (err) => {

                    })
        }
    }

    clear() {
        this.dataChangesMap = {};
        this.showContent = false;
        this.PatientTemplatedetailID = 0;
        this.signatureForm.reset();
        this.signatureList = [];
        setTimeout(() => {
            this.showContent = true;
        }, 0);
    }

    clearbase64Signature(signature: SignatureComponent): void {
        signature.clearSignature();
    }

    addVitals() {
        $("#vitalsModal").modal('show');
        this.clearVital();
    }

    clearVital() {
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
        if (bpsys[0].PARAMVALUE === null || bpsys[0].PARAMVALUE === "" || bpdia[0].PARAMVALUE === null || bpdia[0].PARAMVALUE === "" || temp[0].PARAMVALUE === null || temp[0].PARAMVALUE === "") {
            this.showVitalsValidation = true;
        } else {
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
                "ClinicalTemplateID": 118,
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
            ClinicalTemplateID: 118,
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

    templatePrint(name: any, header?: any) {
        if (header) {
            if ($('#divscroll').hasClass('template_scroll')) {
                $('#divscroll').removeClass("template_scroll");
            }

            this.IsPrint = true;
            this.IsView = false;

            setTimeout(() => {
                const originalParent = this.divrecrr.nativeElement.parentNode;
                const nextSibling = this.divrecrr.nativeElement.nextSibling;

                const space = document.createElement('div');
                space.style.height = '60px';
                header.appendChild(space);

                header.appendChild(this.divrecrr.nativeElement);

                this.print(header, name);

                setTimeout(() => {
                    if (nextSibling) {
                        originalParent.insertBefore(this.divrecrr.nativeElement, nextSibling);
                    } else {
                        originalParent.appendChild(this.divrecrr.nativeElement);
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

    onEmployeeSelected(item: any) {
        this.employeeList = [];
    }

    searchItem(event: any) {
        if (event.target.value.length >= 3) {
          this.bedConfig.fetchEndoDrugs(event.target.value, this.hospitalID).subscribe(
            (results) => {
              this.FetchEndoDrugsDataList = results.FetchEndoDrugsDataList;
            },
            (error) => {
              console.error('Error fetching data:', error);
            }
          );
        }
    
      }

      onItemSelected() {
        this.FetchEndoDrugsDataList = [];
      }
}
