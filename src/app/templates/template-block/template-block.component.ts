import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BaseComponent } from 'src/app/shared/base.component';
import { ReloadtemplateService } from 'src/app/shared/reloadtemplate.service';
import { UtilityService } from 'src/app/shared/utility.service';

declare var $: any;

@Component({
    selector: 'app-template-block',
    templateUrl: './template-block.component.html'
})
export class TemplateBlockComponent extends BaseComponent implements OnInit {
    @Input()
    patientTemplatedetailID: any;

    @Input()
    viewTemplatesList: any;

    remarkForm: any;
    facility: any;

    constructor(private formBuilder: FormBuilder, private us: UtilityService, private reloadService: ReloadtemplateService) {
        super();
    }

    ngOnInit(): void {
        this.remarkForm = this.formBuilder.group({
            remarks: ['', [Validators.required, noConsecutiveDotsValidator()]]
        });
        this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    }

    onBlockClick() {
        $('#remarksModal').modal('show');
    }

    saveRemarks() {
        this.us.post(TemplateBlock.DeletePatienClinicalTemplateDetails, {
            AdmissionID: this.selectedView.AdmissionID,
            PatientTemplatedetailID: this.patientTemplatedetailID,
            Remarks: this.remarkForm.get('remarks').value,
            UserID: this.userID,
            WorkStationID: this.facility.FacilityID,
            HospitalId: this.selectedView.hospitalID
        }).subscribe((response: any) => {
            if (response.Code === 200) {
                this.remarkForm.reset();
                $('#remarksModal').modal('hide');
                $('#blockSaveMsg').modal('show');
            }
        })
    }

    getBlockedText() {
        if (this.patientTemplatedetailID && this.viewTemplatesList && this.viewTemplatesList.length > 0) {
            const selectedTemplate = this.viewTemplatesList.find((element: any) => element.PatientTemplatedetailID === this.patientTemplatedetailID);
            if (selectedTemplate && selectedTemplate.Blocked === '1') {
                return `Blocked by ${selectedTemplate.CancelledByName} on ${selectedTemplate.BlockedDate}`;
            }
        }
        return '';
    }

    onOkClick() {
        $('#blockSaveMsg').modal('hide');
        this.reloadService.triggerReload();
    }

    isEditEnabled() {
        if (this.patientTemplatedetailID && this.viewTemplatesList && this.viewTemplatesList.length > 0) {
            const selectedTemplate = this.viewTemplatesList.find((element: any) => element.PatientTemplatedetailID === this.patientTemplatedetailID);
            if (!selectedTemplate.edit) {
                return false;
            }
        }
        return true;
    }
}

function noConsecutiveDotsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (value && value.trim().indexOf('....') === 0) {
            return { consecutiveDots: true };
        }
        return null;
    };
}

const TemplateBlock = {
    DeletePatienClinicalTemplateDetails: 'DeletePatienClinicalTemplateDetails'
}
