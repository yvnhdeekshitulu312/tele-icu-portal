import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
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
    selector: 'app-therapeutic-phlebotomy-form',
    templateUrl: './therapeutic-phlebotomy-form.component.html',
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
export class TherapeuticPhlebotomyFormComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
    @ViewChild('divtpfc') divtpfc!: ElementRef;
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
    @ViewChild('Signature1') Signature1!: SignatureComponent;
    @ViewChild('Signature2') Signature2!: SignatureComponent;
    @ViewChild('Signature3') Signature3!: SignatureComponent;

    @Output()
    onSaveForm: EventEmitter<any> = new EventEmitter();

    constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService) {
        super(renderer, el, cdr);
        this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        this.HospitalID = sessionStorage.getItem("hospitalId");
    }

    ngOnInit(): void {
        this.getreoperative("139");
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.showdefault(this.divtpfc.nativeElement);
        }, 3000);
        this.bindTextboxValue('DoctorDate', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('BloodBankPhysicianDate', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('BloodBankDate', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('PatientSignatureDate', moment().format('DD-MMM-YYYY'));
        this.addListeners(this.datepickers);
    }

    viewWorklist() {
        $("#savedModal").modal('show');
    }

    selectedTemplate(tem: any) {
        this.showContent = false;
        setTimeout(() => {
            this.showContent = true;
        }, 0);
        this.signatureForm.reset();
        this.signatureList = [];
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
                        this.showElementsData(this.divtpfc.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
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

    save(prescriptionId: any) {
        const tags = this.findHtmlTagIds(this.divtpfc);

        if (tags) {
            const mergedArray = tags.concat(this.timerData);
            var payload = {
                "PatientTemplatedetailID": this.PatientTemplatedetailID,
                "PatientID": this.selectedView.PatientID,
                "AdmissionID": this.selectedView.AdmissionID,
                "DoctorID": this.doctorDetails[0].EmpId,
                "SpecialiseID": this.selectedView.SpecialiseID,
                "ClinicalTemplateID": 139,
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
                "Signature10": this.signatureForm.get('Signature10').value,
                "AssessmentOrderId": prescriptionId
            }

            this.us.post("SavePatienClinicalTemplateDetails", payload)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.onSaveForm.emit();
                    }
                },
                    (err) => {

                    });
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
}
