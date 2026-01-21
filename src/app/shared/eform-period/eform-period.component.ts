import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base.component';
import { UtilityService } from '../utility.service';
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GenericModalBuilder } from '../generic-modal-builder.service';
import { TemplatesLandingComponent } from 'src/app/templates/templates-landing/templates-landing.component';
import { MedicalAssessmentSurgicalComponent } from 'src/app/portal/medical-assessment-surgical/medical-assessment-surgical.component';
import { MedicalAssessmentPediaComponent } from 'src/app/portal/medical-assessment-pedia/medical-assessment-pedia.component';
import { MedicalAssessmentObstericComponent } from 'src/app/portal/medical-assessment-obsteric/medical-assessment-obsteric.component';
import { MedicalAssessmentComponent } from 'src/app/portal/medical-assessment/medical-assessment.component';

declare var $: any;

const MY_FORMATS = {
    parse: {
        dateInput: 'dd-MMM-yyyy',
    },
    display: {
        dateInput: 'DD-MMM-yyyy',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'dd-MMM-yyyy',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-eform-period',
    templateUrl: './eform-period.component.html',
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
export class EformPeriodComponent extends BaseComponent implements OnInit {
    location: any;
    facility: any;
    facilityId: any;
    datesForm: any;
    FetchClinicalTemplatesNList: any = [];
    filteredFetchClinicalTemplatesNList: any = [];
    errorMessages: any = [];
    FetchClinicalTemplatesDPeriodDataList: any;
    filteredData: any = [];

    constructor(private us: UtilityService, private formBuilder: FormBuilder, private datepipe: DatePipe, private modalService: GenericModalBuilder) {
        super();
        this.datesForm = this.formBuilder.group({
            fromdate: new Date(),
            todate: new Date(),
            templateId: '',
            location: '0'
        });
    }
    ngOnInit(): void {
        this.location = sessionStorage.getItem("locationName");
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
        this.fetchClinicalTemplates();
    }

    fetchClinicalTemplates() {
        const url = this.us.getApiUrl(EformPeriodURLS.FetchClinicalTemplatesAP, {
            UserID: this.doctorDetails[0]?.UserId,
            WorkStationID: this.facilityId,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.FetchClinicalTemplatesNList = this.filteredFetchClinicalTemplatesNList = response.FetchClinicalTemplatesNList
            }
        });
    }

    fetchData() {
        const fromdate = this.datesForm.get('fromdate').value;
        const todate = this.datesForm.get('todate').value;
        if (fromdate && todate) {
            this.errorMessages = []
            if (!this.datesForm.get('templateId').value) {
                this.errorMessages.push('Please Select Template');
            }
            if (this.errorMessages.length > 0) {
                $('#errorMessagesModal').modal('show');
                return;
            }
            this.FetchClinicalTemplatesDPeriodDataList = this.filteredData = [];
            const url = this.us.getApiUrl(EformPeriodURLS.FetchClinicalTemplatesDPeriod, {
                FromDate: this.datepipe.transform(fromdate, "dd-MMM-yyyy")?.toString(),
                ToDate: this.datepipe.transform(todate, "dd-MMM-yyyy")?.toString(),
                ClinicalTemplateID: this.datesForm.get('templateId').value,
                WorkStationID: this.facilityId,
                HospitalID: this.hospitalID
            });
            this.us.get(url).subscribe((response: any) => {
                if (response.Code === 200) {
                    this.FetchClinicalTemplatesDPeriodDataList = response.FetchClinicalTemplatesDPeriodDataList;
                    this.changeFilterLocation(this.datesForm.get('location').value);
                }
            });
        }
    }

    searchTemplate(event: any) {
        const searchString = event.target.value;
        this.filteredFetchClinicalTemplatesNList = this.FetchClinicalTemplatesNList.filter((item: any) => item.ClinicalTemplateName.toLowerCase().indexOf(searchString.toLowerCase()) !== -1);
    }

    onSelectTemplate(event: any) {
        this.filteredFetchClinicalTemplatesNList = this.FetchClinicalTemplatesNList;
        const selectedTemplate = this.FetchClinicalTemplatesNList.find((data: any) => data.ClinicalTemplateName === event.option.value);
        this.datesForm.get('templateId')?.setValue(selectedTemplate.ClinicalTemplateID);
        this.fetchData();
    }

    onViewClick(item: any) {
        const url = this.us.getApiUrl(EformPeriodURLS.FetchPatientVistitInfoN, {
            UHID: item.RegCode,
            IsnewVisit: item.IsnewVisit,
            Admissionid: item.Admissionid,
            HospitalID: this.hospitalID
        });
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200) {
                this.selectedView = response.FetchPatientVistitInfoDataList[0];
                sessionStorage.setItem('selectedView', JSON.stringify(this.selectedView));
                this.viewEformTemplate(item);
            }
        })
    }

    clearForm() {
        $('#templateText').val('');
        this.datesForm.patchValue({
            fromdate: new Date(),
            todate: new Date(),
            templateId: '',
            location: '0'
        });
        this.FetchClinicalTemplatesDPeriodDataList = [];
        this.filteredData = [];
    }

    viewEformTemplate(templ: any) {
        const options: NgbModalOptions = {
            size: 'xl',
            windowClass: 'viewEformTemplate_modal'
        };
        if (templ.ClinicalTemplateID === '2') {
            const modalRef = this.modalService.openModal(MedicalAssessmentComponent, {
                data: templ,
                readonly: true,
                admissionID: this.admissionID,
                selectedView: this.selectedView
            }, options);
            return;
        }
        else if (templ.ClinicalTemplateID === '6') {
            const modalRef = this.modalService.openModal(MedicalAssessmentObstericComponent, {
                data: templ,
                readonly: true,
                admissionID: this.admissionID,
                selectedView: this.selectedView
            }, options);
            return;
        }
        else if (templ.ClinicalTemplateID === '7') {
            const modalRef = this.modalService.openModal(MedicalAssessmentPediaComponent, {
                data: templ,
                readonly: true,
                admissionID: this.admissionID,
                selectedView: this.selectedView
            }, options);
            return;
        }
        else if (templ.ClinicalTemplateID === '8') {
            const modalRef = this.modalService.openModal(MedicalAssessmentSurgicalComponent, {
                data: templ,
                readonly: true,
                admissionID: this.admissionID,
                selectedView: this.selectedView
            }, options);
            return;
        } else {
            const modalRef = this.modalService.openModal(TemplatesLandingComponent, {
                data: templ,
                readonly: true,
                fromshared: true,
                isEdit: false,
                admissionID: templ.Admissionid,
                selectedView: this.selectedView
            }, options);
        }
    }

    changeFilterLocation(value: any) {
        this.datesForm.patchValue({
            location: value
        });
        if (value === '0') {
            this.filteredData = this.FetchClinicalTemplatesDPeriodDataList;
        } else {
            this.filteredData = this.FetchClinicalTemplatesDPeriodDataList.filter((element: any) => element.HospitalID === value);
        }
    }
}

const EformPeriodURLS = {
    FetchClinicalTemplatesAP: 'FetchClinicalTemplatesAP?UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchClinicalTemplatesDPeriod: 'FetchClinicalTemplatesDPeriod?FromDate=${FromDate}&ToDate=${ToDate}&ClinicalTemplateID=${ClinicalTemplateID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchPatientVistitInfoN: 'FetchPatientVistitInfoN?UHID=${UHID}&IsnewVisit=${IsnewVisit}&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
}