import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
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
    selector: 'app-communications-notes',
    templateUrl: './communications-notes.component.html',
    styleUrls: [],
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
export class CommunicationsNotesComponent extends BaseComponent implements OnInit {
    communicationMode: string = 'call';
    communicationType: string = '';
    communicationResponse: string = '';
    contactNumber!: any;
    communicationNotes: string = '';
    contactDate = new Date();
    contactTime = this.setCurrentTime();

    specializationList: any = [];
    specializationValue: any = '';
    doctorValue: any = '';
    specializationList1: any = [];
    listOfSpecItems: any = [];
    listOfSpecItems1: any = [];
    communicationsNotesList: any = [];
    errorMessages: any[] = [];

    actionsTakenList: any = [{
        id: 1, name: 'Notified Head of the Department'
    },
    {
        id: 2, name: 'Initiated OVR',

    }, {
        id: 3, name: 'Notified Nursing Supervisor'
    }]
    actionsTaken: any = [];

    constructor(private config: ConfigService, private us: UtilityService) {
        super();
    }

    ngOnInit(): void {
        //this.fetchCommunicationNotes();
        this.fetchReferalAdminMasters();
    }

    save() {
        this.errorMessages = [];
        if (!this.communicationMode || !this.communicationType || !this.communicationResponse || !this.specializationValue || !this.doctorValue || this.contactNumber === '' ||  this.actionsTaken.length === 0) {

            if (!this.communicationMode) {
                this.errorMessages.push("Communication Mode (Call /SMS)");
            }
            if (!this.communicationType) {
                this.errorMessages.push("Communication Type (Landline/Cell Phone)");
            }
            if (this.contactNumber=='') {
                this.errorMessages.push("Number Used");
            }
           
            if (!this.specializationValue) {
                this.errorMessages.push("Specialization");
            }
            if (!this.doctorValue) {
                this.errorMessages.push("Doctor");
            }
            if (!this.communicationResponse) {
                this.errorMessages.push("Out Come");
            }
            if (this.actionsTaken.length === 0) {
                this.errorMessages.push("Action Taken");
            }           
            // if (!this.communicationNotes) {
            //     this.errorMessages.push("Notes");
            // }           
            // $('#errorMessage').modal('show');
            // return;
        }
        if(this.communicationType === 'cellPhone' && this.contactNumber.length < 10) {
            this.errorMessages.push("Cell Phone should be 10 numbers");
        }
        if (this.errorMessages.length > 0) {
            $("#errorMessage").modal('show');
            return;
          }

        const payLoad = {
            "CommunicationType": this.communicationMode === 'call' ? 1 : 2,
            "IPID": this.selectedView.AdmissionID,
            "SpecialiseID": this.specializationValue.id,
            "DoctorID": this.doctorValue.Empid,
            "IsLandline": this.communicationType === 'hospitalLandline',
            "ISMobileNo": this.communicationType === 'cellPhone',
            "PhoneNo": this.contactNumber,
            "CommunicationDate": `${moment(this.contactDate).format('DD-MMM-YYYY')} ${this.contactTime}`,
            "NoResponse": this.communicationResponse === 'noResponse',
            "OutOfReach": this.communicationResponse === 'outOfReach',
            "ActionTaken": this.actionsTaken.map((item: any) => item.id).toString(),
            "Notes": this.communicationNotes,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.wardID,
            "HospitalID": this.hospitalID
        };

        this.us.post('SaveDoctorCommunicationNotes', payLoad).subscribe((response: any) => {
            if (response.Code === 200) {
                $('#successMessage').modal('show');
                this.clear();
                this.fetchCommunicationNotes();
            }
        }, () => {

        });
    }

    clear() {
        this.contactNumber = '';
        this.communicationMode = '';
        this.communicationNotes = '';
        this.communicationResponse = '';
        this.communicationType = '';
        this.doctorValue = '';
        this.specializationValue = '';
        this.listOfSpecItems = this.listOfSpecItems1 = [];
        this.contactDate = new Date();
        this.contactTime = this.setCurrentTime();
        this.actionsTaken = [];

        $("#Doctor").val('');
        $("#Specialization").val('');
    }

    fetchCommunicationNotes() {
        this.us.get(`FetchDoctorCommunicationNotes?IPID=${this.selectedView.AdmissionID}&WorkStationID=${this.wardID}&HospitalID=${this.hospitalID}`).subscribe((response: any) => {
            if (response.Code === 200) {
                this.communicationsNotesList = response.FetchDoctorCommunicationNotesDataList;
            }
        }, () => {

        });
    }

    onCommunicationModeChange(mode: string) {
        this.communicationMode = mode;
    }

    onCommunicationTypeChange(type: string) {
        this.communicationType = type;
    }

    onCommunicationResponseChange(response: string) {
        this.communicationResponse = response;
    }

    onSpecItemSelected(event: any) {
        const item = this.specializationList.find((data: any) => data.name === event.option.value);
        this.specializationValue = item;
        this.doctorValue = '';
        $("#Doctor").val('');
        this.fetchSpecializationDoctorSearch();
    }

    searchSpecItem(event: any) {
        const item = event.target.value;
        this.specializationList = this.specializationList1;
        let arr = this.specializationList1.filter((spec: any) => spec.name.toLowerCase().indexOf(item.toLowerCase()) === 0);
        this.specializationList = arr.length ? arr : [{ name: 'No Item found' }];
    }

    fetchSpecializationDoctorSearch() {
        this.config.fetchSpecialisationDoctors('%%%', this.specializationValue.id, this.doctorDetails[0].EmpId, this.hospitalID).subscribe((response: any) => {
            if (response.Code == 200) {
                this.listOfSpecItems = this.listOfSpecItems1 = response.FetchDoctorDataList;
            }
        }, error => {
            console.error('Get Data API error:', error);
        });
    }

    fetchReferalAdminMasters() {
        this.config.fetchConsulSpecialisation(this.hospitalID).subscribe((response) => {
            this.specializationList = this.specializationList1 = response.FetchConsulSpecialisationDataList;
        });
    }

    onDocItemSelected(item: any) {
        this.doctorValue = item;
    }

    searchDocItem(event: any) {
        const item = event.target.value;
        this.listOfSpecItems = this.listOfSpecItems1;
        let arr = this.listOfSpecItems1.filter((doc: any) => doc.Fullname.toLowerCase().indexOf(item.toLowerCase()) === 0);
        if (arr.length === 0) {
            arr = this.listOfSpecItems1.filter((proc: any) => proc.EmpNo.toLowerCase().indexOf(item.toLowerCase()) === 0);
        }
        this.listOfSpecItems = arr.length ? arr : [{ name: 'No Item found' }];
    }

    setCurrentTime(): string {
        const now = new Date();
        const hours = this.padZero(now.getHours());
        const minutes = this.padZero(now.getMinutes());
        return `${hours}:${minutes}`;
    }

    padZero(value: number): string {
        return value < 10 ? '0' + value : value.toString();
    }

    compareFn(role1: any, role2: any) {
        return role1 && role2 ? role1.id === role2.id : role1 === role2;
    }

    getActionTakenItems(value: string) {
        const ids = value.split(',');
        let names: any = [];
        ids.forEach((id: any) => {
            const item = this.actionsTakenList.find((x: any) => x.id.toString() === id.toString());
            if (item) {
                names.push(item.name);
            }
        });
        return names.toString();
    }
}
