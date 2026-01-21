import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { MY_FORMATS } from 'src/app/shared/base.component';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
import moment from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';

declare var $: any;
@Component({
    selector: 'app-before-transferring-patient-record',
    templateUrl: './before-transferring-patient.component.html',
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
export class BeforeTransferringPatientComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
    @ViewChild('divbtprcu') divbtprcu!: ElementRef;
    @ViewChild('Signature1') Signature1!: SignatureComponent;
    @ViewChild('Signature2') Signature2!: SignatureComponent;
    @ViewChild('Signature3') Signature3!: SignatureComponent;
    url = "";
    selectedView: any;
    doctorDetails: any;
    PatientTemplatedetailID = 0;
    FetchPatienClinicalTemplateDetailsNList: any = [];
    IsView = false;
    showContent = true;
    HospitalID: any;
    IsPrint: boolean = false;
    IsViewActual = false;
    employeeList: any = [];
    @ViewChildren(MatDatepicker) datepickers!: QueryList<MatDatepicker<any>>;

    constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService) {
        super(renderer, el, cdr);
        this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        this.HospitalID = sessionStorage.getItem("hospitalId");
    }

    ngOnInit(): void {
        this.getreoperative("120");
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.showdefault(this.divbtprcu.nativeElement);
        }, 3000);
        this.bindTextboxValue('textbox_date1', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('textbox_date2', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('textbox_date3', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('textbox_date4', moment().format('DD-MMM-YYYY'));
        const now = new Date();
        this.timerData.push({ id: 'textbox_generic_time1', value: now.getHours() + ':' + now.getMinutes() });
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
                        this.showElementsData(this.divbtprcu.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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
        const tags = this.findHtmlTagIds(this.divbtprcu);

        if (tags) {
            const mergedArray = tags.concat(this.timerData);
            var payload = {
                "PatientTemplatedetailID": this.PatientTemplatedetailID,
                "PatientID": this.selectedView.PatientID,
                "AdmissionID": this.selectedView.AdmissionID,
                "DoctorID": this.selectedView.ConsultantID ?? this.doctorDetails[0].EmpId,
                "SpecialiseID": this.selectedView.SpecialiseID,
                "ClinicalTemplateID": 120,
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
                        this.getreoperative("120");
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

    templatePrint(name: any, header?: any) {
        if (header) {
            if ($('#divscroll').hasClass('template_scroll')) {
                $('#divscroll').removeClass("template_scroll");
            }

            this.IsPrint = true;
            this.IsView = false;

            setTimeout(() => {
                const originalParent = this.divbtprcu.nativeElement.parentNode;
                const nextSibling = this.divbtprcu.nativeElement.nextSibling;

                const space = document.createElement('div');
                space.style.height = '60px';
                header.appendChild(space);

                header.appendChild(this.divbtprcu.nativeElement);

                this.print(header, name);

                setTimeout(() => {
                    if (nextSibling) {
                        originalParent.insertBefore(this.divbtprcu.nativeElement, nextSibling);
                    } else {
                        originalParent.appendChild(this.divbtprcu.nativeElement);
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

    getTotal1Value() {
        let total = 0;
        const fields = [{
            id: 'uponAdmission1',
            value: 2
        },
        {
            id: 'uponAdmissionA',
            value: 1
        },
        {
            id: 'uponAdmissionB',
            value: 0
        },
        {
            id: 'uponAdmissionC',
            value: 2
        },
        {
            id: 'uponAdmissionD',
            value: 1
        },
        {
            id: 'uponAdmissionE',
            value: 0
        },
        {
            id: 'uponAdmissionF',
            value: 2
        },
        {
            id: 'uponAdmissionG',
            value: 1
        },
        {
            id: 'uponAdmissionH',
            value: 0
        },
        {
            id: 'uponAdmissionI',
            value: 2
        },
        {
            id: 'uponAdmissionJ',
            value: 1
        },
        {
            id: 'uponAdmissionK',
            value: 0
        },
        {
            id: 'uponAdmissionL',
            value: 2
        },
        {
            id: 'uponAdmissionM',
            value: 1
        },
        {
            id: 'uponAdmissionN',
            value: 0
        }];
        fields.forEach((item: any) => {
            if (document.querySelector("#" + item.id)?.classList.contains('active')) {
                total += item.value;
            }
        })
        return total;
    }

    getTotal2Value() {
        let total = 0;
        const fields = [{
            id: 'Hour1',
            value: 2
        },
        {
            id: 'HourA_1',
            value: 1
        },
        {
            id: 'HourB_1',
            value: 0
        },
        {
            id: 'HourC_1',
            value: 2
        },
        {
            id: 'HourD_1',
            value: 1
        },
        {
            id: 'HourE_1',
            value: 0
        },
        {
            id: 'HourF_1',
            value: 2
        },
        {
            id: 'HourG_1',
            value: 1
        },
        {
            id: 'HourH_1',
            value: 0
        },
        {
            id: 'HourI_1',
            value: 2
        },
        {
            id: 'HourJ_1',
            value: 1
        },
        {
            id: 'HourK_1',
            value: 0
        },
        {
            id: 'HourL_1',
            value: 2
        },
        {
            id: 'HourM_1',
            value: 1
        },
        {
            id: 'HourN_1',
            value: 0
        }];
        fields.forEach((item: any) => {
            if (document.querySelector("#" + item.id)?.classList.contains('active')) {
                total += item.value;
            }
        })
        return total;
    }

    getTotal3Value() {
        let total = 0;
        const fields = [{
            id: 'Hour2',
            value: 2
        },
        {
            id: 'HourA_2',
            value: 1
        },
        {
            id: 'HourB_2',
            value: 0
        },
        {
            id: 'HourC_2',
            value: 2
        },
        {
            id: 'HourD_2',
            value: 1
        },
        {
            id: 'HourE_2',
            value: 0
        },
        {
            id: 'HourF_2',
            value: 2
        },
        {
            id: 'HourG_2',
            value: 1
        },
        {
            id: 'HourH_2',
            value: 0
        },
        {
            id: 'HourI_2',
            value: 2
        },
        {
            id: 'HourJ_2',
            value: 1
        },
        {
            id: 'HourK_2',
            value: 0
        },
        {
            id: 'HourL_2',
            value: 2
        },
        {
            id: 'HourM_2',
            value: 1
        },
        {
            id: 'HourN_2',
            value: 0
        }];
        fields.forEach((item: any) => {
            if (document.querySelector("#" + item.id)?.classList.contains('active')) {
                total += item.value;
            }
        })
        return total;
    }

    getTotal4Value() {
        let total = 0;
        const fields = [{
            id: 'Hour3',
            value: 2
        },
        {
            id: 'HourA_3',
            value: 1
        },
        {
            id: 'HourB_3',
            value: 0
        },
        {
            id: 'HourC_3',
            value: 2
        },
        {
            id: 'HourD_3',
            value: 1
        },
        {
            id: 'HourE_3',
            value: 0
        },
        {
            id: 'HourF_3',
            value: 2
        },
        {
            id: 'HourG_3',
            value: 1
        },
        {
            id: 'HourH_3',
            value: 0
        },
        {
            id: 'HourI_3',
            value: 2
        },
        {
            id: 'HourJ_3',
            value: 1
        },
        {
            id: 'HourK_3',
            value: 0
        },
        {
            id: 'HourL_3',
            value: 2
        },
        {
            id: 'HourM_3',
            value: 1
        },
        {
            id: 'HourN_3',
            value: 0
        }];
        fields.forEach((item: any) => {
            if (document.querySelector("#" + item.id)?.classList.contains('active')) {
                total += item.value;
            }
        })
        return total;
    }
}
