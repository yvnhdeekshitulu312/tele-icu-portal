import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
declare var $: any;

@Component({
    selector: 'app-security-options',
    templateUrl: './security-options.component.html'
})
export class SecurityOptionsComponent extends BaseComponent implements OnInit {
    public isNew: boolean = true;
    public securityOptionsForm: any;
    public errorMsg: string = '';
    constructor(private us: UtilityService, private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit(): void {
        this.initializeForm();
        this.fetchHisconfiguration();
    }

    initializeForm() {
        this.securityOptionsForm = this.formBuilder.group({
            Max_Pwd_Len: '',
            Min_Pwd_Len: '',
            Default_Pwd: '',
            Conf_Default_Pwd: '',
            Allow_Pwd_Chars: '',
            Pwd_Life_Time: '',
            User_Lock_Attempts: '',
            Pwd_Alert_Exp_days: '',
            Pwd_NoofPreviousPWSValidation: '',
            Pwd_IsDigitsMD: false,
            Pwd_IsUppercaseMD: false,
            Pwd_IsSpeCharMD: false,
        });
    }

    fetchHisconfiguration() {
        const params = {
            UserName: this.doctorDetails[0].UserName,
            UserID: 0,
            WorkStationID: 0,
            HospitalID: this.hospitalID
        };
        const url = this.us.getApiUrl(SecurityOptions.FetchHisconfiguration, params);
        this.us.get(url).subscribe((response: any) => {
            if (response.Code === 200 && response.FetchHisconfigurationDataList.length > 0) {
                const data = response.FetchHisconfigurationDataList[0];
                this.isNew = false;
                this.securityOptionsForm.patchValue({
                    Max_Pwd_Len: data.Max_Pwd_Len,
                    Min_Pwd_Len: data.Min_Pwd_Len,
                    Default_Pwd: data.Default_Pwd ? data.Default_Pwd : '',
                    Conf_Default_Pwd: data.Default_Pwd ? data.Default_Pwd : '',
                    Allow_Pwd_Chars: data.Allow_Pwd_Chars,
                    Pwd_Life_Time: data.Pwd_Life_Time,
                    User_Lock_Attempts: data.User_Lock_Attempts,
                    Pwd_Alert_Exp_days: data.Pwd_Alert_Exp_days,
                    Pwd_NoofPreviousPWSValidation: data.Pwd_NoofPreviousPWSValidation,
                    Pwd_IsDigitsMD: data.Pwd_IsDigitsMD,
                    Pwd_IsUppercaseMD: data.Pwd_IsUppercaseMD,
                    Pwd_IsSpeCharMD: data.Pwd_IsSpeCharMD,
                })
            }
        },
            (err) => {

            });
    }

    onCheckboxSelection(key: any) {
        const value = !this.securityOptionsForm.get(key).value;
        this.securityOptionsForm.patchValue({
            [key]: value
        })
    }

    clearForm() {
        this.initializeForm();
    }

    saveForm() {
        if (this.securityOptionsForm.get('Default_Pwd').value.trim() !== this.securityOptionsForm.get('Conf_Default_Pwd').value.trim()) {
            this.errorMsg = 'Default Password and Confirm Default Password should be same';
            $('#errorMsg').modal('show');
            return;
        }
        const payload = {
            "Max_Pwd_Len": this.securityOptionsForm.get('Max_Pwd_Len').value,
            "Min_Pwd_Len": this.securityOptionsForm.get('Min_Pwd_Len').value,
            "Default_Pwd": this.securityOptionsForm.get('Default_Pwd').value,
            "Allow_Pwd_Chars": this.securityOptionsForm.get('Allow_Pwd_Chars').value,
            "Pwd_Life_Time": this.securityOptionsForm.get('Pwd_Life_Time').value,
            "User_Lock_Attempts": this.securityOptionsForm.get('User_Lock_Attempts').value,
            "Pwd_Alert_Exp_days": this.securityOptionsForm.get('Pwd_Alert_Exp_days').value,
            "Pwd_NoofPreviousPWSValidation": this.securityOptionsForm.get('Pwd_NoofPreviousPWSValidation').value,
            "Pwd_IsDigitsMD": this.securityOptionsForm.get('Pwd_IsDigitsMD').value,
            "Pwd_IsUppercaseMD": this.securityOptionsForm.get('Pwd_IsUppercaseMD').value,
            "Pwd_IsSpeCharMD": this.securityOptionsForm.get('Pwd_IsSpeCharMD').value,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": "0",
            "HospitalID": this.hospitalID
        };
        this.us.post(SecurityOptions.SaveHisconfiguration, payload).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#savemsg').modal('show');
                this.isNew = false;
            }
        },
            (err) => {

            });
    }
}

export const SecurityOptions = {
    FetchHisconfiguration: "FetchHisconfiguration?UserName=${UserName}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
    SaveHisconfiguration: "SaveHisconfiguration"
};