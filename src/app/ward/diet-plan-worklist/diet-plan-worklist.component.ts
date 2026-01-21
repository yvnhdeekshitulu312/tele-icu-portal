import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/shared/base.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormBuilder, FormControl } from '@angular/forms';
import { DietPlanWorklistService } from '../services/diet-plan-worklist.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { DietCounsellingComponent } from '../diet-counselling/diet-counselling.component';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ConfigService } from 'src/app/services/config.service';

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
    selector: 'app-diet-paln-worklist',
    templateUrl: './diet-plan-worklist.component.html',
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
export class DietPlanWorklistComponent extends BaseComponent implements OnInit, OnDestroy {
    dietPlanForm: any;
    toDate = new FormControl(new Date());
    listOfWards: any[] = [];
    selectedWard: any;
    listOfBeds: any[] = [];
    listOfBeds1: any[] = [];
    dietPlanList: any[] = [];
    selectedBed: any;
    subscription: any;
    SpecializationList: any = [];
    SpecializationList1: any = [];
    objPatientVitalsList: any;
    selectedPatientAllergies: any;
    selectedPatientInfo: any;
    patientDiseasesDataLists: any;
    isDirectOpen = false;
    patientDetails: any;
    trustedUrl: any;
    errorMessages : string = "";

    constructor(private router: Router, public formBuilder: FormBuilder, private service: DietPlanWorklistService, private us: UtilityService, public datepipe: DatePipe, private modalService: GenericModalBuilder, private appconfig: ConfigService) {
        super();
        this.dietPlanForm = this.formBuilder.group({
            fromdate: this.toDate.value,
            todate: this.toDate.value,
            SSN: [''],
            ward: [''],
            Status: ['']
        });
    }

    ngOnInit(): void {
        this.subscription = this.us.closeModalEvent.subscribe(() => {
            this.onSearch();
        });

        if (this.router.url.includes('ward/diet-plan')) {
            this.isDirectOpen = true;
        }
        this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
        if (!this.isDirectOpen) {
            this.dietPlanForm.patchValue({
                SSN: this.patientDetails.SSN
            })
        }
        this.searchWard();
    }
   

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    navigatetoBedBoard() {
        this.router.navigate(['/ward']);
    }

    searchWard() {
        const filter = '%%%';
        if (filter.length >= 3) {
            const params = {
                Name: filter,
                HospitalID: this.hospitalID
            };
            const url = this.service.getData(DietPlanWorklist.wardSearch, params);
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.listOfWards = response.FetchSSWardsDataList;
                        this.SpecializationList = this.SpecializationList1= response.FetchSSWardsDataList;
                        const ward = this.listOfWards.find((item: any) => item.ID === this.wardID);
                        if(ward) {
                            this.selectedWard = ward;
                            this.dietPlanForm.patchValue({
                                ward: ward.Name
                            });
                           
                            //this.searchBed();
                        }
                        this.onSearch();
                        
                    }
                },
                    () => {

                    })
        }
        else {
            this.listOfWards = [];
        }
    }
    searchSpecItem(event: any) {
        const item = event.target.value;
        this.SpecializationList = this.SpecializationList1;
        let arr = this.SpecializationList1.filter((spec: any) => spec.Name.toLowerCase().indexOf(item.toLowerCase()) === 0);
        this.SpecializationList = arr.length ? arr : [{ name: 'No Item found' }];
        this.listOfWards=this.SpecializationList;
      }

    onItemSelected(event: any) {
        const item = this.SpecializationList.find((data: any) =>  data.Name === event.option.value);
        this.selectedWard = item;       
       this.onSearch();
       this.searchBed(item.ID);
    }
    onEnterPress(event: any) {
        if (event instanceof KeyboardEvent && event.key === 'Enter') {
          this.onSearch();
        }
      }
      onEnterChange() {   
        this.onSearch();    
    }

    searchBed(WardID:any) {
        const filter = '%%%';//event.target.value;
        if (filter.length >= 3) {
            const params = {
                Name: filter,
                HospitalID: this.hospitalID,
                WorkStationID: this.wardID,
                WardID: WardID
            };
            const url = this.service.getData(DietPlanWorklist.BedSearch, params);
            this.us.get(url)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        this.listOfBeds =this.listOfBeds1= response.FetchAllBedsDataList;
                    }
                },
                    () => {

                    })
        }
        else {
            this.listOfBeds = this.listOfBeds1=[];
        }
    }
    searchBedItem(event: any) {
        const item = event.target.value;
        this.listOfBeds = this.listOfBeds1;
        let arr = this.listOfBeds1.filter((spec: any) => spec.BedName.toLowerCase().indexOf(item.toLowerCase()) === 0);
        this.listOfBeds = arr.length ? arr : [{ name: 'No Item found' }];
       
      }

    onItemBedSelected1(bed: any) {
        this.selectedBed = bed;
        this.listOfBeds = [];
        this.onSearch();   
    }
    onItemBedSelected(event: any) {        
        const item = this.listOfBeds.find((data: any) =>  data.BedName === event.option.value);
        this.selectedBed = item;       
       this.onSearch();
    }

    onSearch() {
        const toDate = this.dietPlanForm.get('todate').value;
        const params = {
            Datetime: this.datepipe.transform(toDate, "dd-MMM-yyyy")?.toString(),
            WardID: this.selectedWard ? this.selectedWard.ID : 0, 
            SSN: this.dietPlanForm.get('SSN').value ? this.dietPlanForm.get('SSN').value : 0,
            BedID: this.selectedBed ? this.selectedBed.BedID : 0,
            WorkStationID: this.wardID,
            HospitalID: this.hospitalID
        };
        const url = this.service.getData(DietPlanWorklist.FetchWardWiseLatestDietPlanL, params);
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.dietPlanList = response.FetchWardWiseLatestDietPlanWorklistDataList;
                }
            },
                () => {

                })
    }
    onStatusSearch(StatusID:any) {
        const toDate = this.dietPlanForm.get('todate').value;
        const params = {
            Datetime: this.datepipe.transform(toDate, "dd-MMM-yyyy")?.toString(),
            WardID: this.selectedWard ? this.selectedWard.ID : 0, 
            SSN: this.dietPlanForm.get('SSN').value ? this.dietPlanForm.get('SSN').value : 0,
            BedID: this.selectedBed ? this.selectedBed.BedID : 0,
            WorkStationID: this.wardID,
            HospitalID: this.hospitalID
        };
        const url = this.service.getData(DietPlanWorklist.FetchWardWiseLatestDietPlanL, params);
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    if(response.FetchWardWiseLatestDietPlanWorklistDataList.length>0){
                        if(StatusID!='0')
                        this.dietPlanList = response.FetchWardWiseLatestDietPlanWorklistDataList.filter((val: any) => val.Status == StatusID);
                    else
                    this.dietPlanList = response.FetchWardWiseLatestDietPlanWorklistDataList;
                    }
                   
                }
            },
                () => {

                })
    }
    StatusChange(event: any) {
        this.onStatusSearch(event.target.value);
    }

    disableOk() {
        let disable = false;
        if (!this.selectedWard) {
            disable = true
        }
        return disable;
    }

    onClear() {
        this.dietPlanForm = this.formBuilder.group({
            fromdate: this.toDate.value,
            todate: this.toDate.value,
            SSN: [''],
            ward: ['']
        });
        this.selectedBed = '';
        this.selectedWard = '';
        $('#wardSearch').val('');
        $('#bedSearch').val('');
        this.dietPlanList = [];
        this.listOfBeds = [];
        this.onSearch();
    }

    openDietPlan(item: any) {
        this.fetchPatientFileInfo(item);

        
    }

    fetchPatientFileInfo(item: any) {
        this.appconfig.FetchPatientAdmissionClinicalDetails(item.PatientID, item.IPID, this.hospitalID).subscribe((response: any) => {
    
          if (response.FetchPatientVitalssDataLists.length > 0) {
            this.objPatientVitalsList = response.FetchPatientVitalssDataLists;
            this.selectedView.BP = this.objPatientVitalsList != undefined ? this.objPatientVitalsList[4]?.Value :'' + '/' + this.objPatientVitalsList != undefined ? this.objPatientVitalsList[5]?.Value : '';
            this.selectedView.Temp = this.objPatientVitalsList != undefined ? this.objPatientVitalsList[0]?.Value : '';
            
          }
    
          if (response.FetchPatientAllergiesDataLists.length > 0) {
            this.selectedPatientAllergies = response.FetchPatientAllergiesDataLists;
          }
    
          if (response.FetchPatientInfoDataLists.length > 0) {
            this.selectedPatientInfo = response.FetchPatientInfoDataLists[0];
            this.selectedView.IsAllergy = this.selectedPatientInfo?.IsAllergy;
            this.selectedView.Height = this.selectedPatientInfo?.Height + 'Cms';
            this.selectedView.Weight = this.selectedPatientInfo?.Weight + 'Cms';
          }
          if (response.FetchPatientDiseasesDataLists.length > 0) {
            response.FetchPatientDiseasesDataLists.forEach((element: any, index: any) => {
              if (this.patientDiseasesDataLists != undefined)
                this.patientDiseasesDataLists += element.DiseaseName + " , ";
              else
                this.patientDiseasesDataLists = element.DiseaseName + " , ";
            });
          }
          const options: NgbModalOptions = {
            size: 'xl',
            modalDialogClass: 'diet-counseling-modal'
        };
        item.readonly = false;
        item.showClose = true;
        item.isFromWorkList = true;
        const data = {
            ...item,
            PatientID: item.PatientID,
            AdmissionID: item.IPID,
            IPID: item.IPID,
            BedID: item.BedId,
            ConsultantID: item.ConsultantID,
            DoctorName: item.Consultant,
            Bed: item.BedName,
            Ward: item.ward,
            BP : this.objPatientVitalsList != undefined ? this.objPatientVitalsList[4]?.Value + '/' + this.objPatientVitalsList[5]?.Value : '',
            Temperature : this.objPatientVitalsList != undefined ? this.objPatientVitalsList[0]?.Value : '',
            IsAllergy : this.selectedPatientInfo?.IsAllergy,
            Height : this.selectedPatientInfo?.Height + 'Cms',
            Weight : this.selectedPatientInfo?.Weight + 'Cms',            
            GenderID: item.Gender === 'Male' ? 1 : 2
 
        };
        sessionStorage.setItem("InPatientDetails", JSON.stringify(data));
        this.modalService.openModal(DietCounsellingComponent, item, options);
        })
      }
    getStatus(item: any) {
        if (item.Status === '1') {
            return 'Planned Diet';
        } else if (item.Status === '2') {
            return 'UnPlanned Diet';
        } else {
            return '-';
        }
    }   

      PatientPrintCard() {
        if(this.selectedWard === '' || this.selectedWard === undefined) {
            this.errorMessages = "Please select ward";
            $("#errorMsg").modal('show');
            return;
        }
        const toDate = this.dietPlanForm.get('todate').value;
        const params = {
            Datetime: this.datepipe.transform(toDate, "dd-MMM-yyyy")?.toString(),
            WardID: this.selectedWard ? this.selectedWard.ID : 0, 
            SSN: this.dietPlanForm.get('SSN').value ? this.dietPlanForm.get('SSN').value : 0,
            BedID: this.selectedBed ? this.selectedBed.BedID : 0,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.wardID,
            HospitalID: this.hospitalID
        };
        const url = this.service.getData(DietPlanWorklist.FetchWardWiseLatestDietPlanPrintL, params);
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.trustedUrl = response?.FTPPATH;
                    this.showModal()
                }
            },
                () => {

                })
    }

      showModal(): void {
        $("#caseRecordModal").modal('show');
      }

      dietStickPrint() {
        if(this.selectedWard === '' || this.selectedWard === undefined) {
            this.errorMessages = "Please select ward";
            $("#errorMsg").modal('show');
            return;
        }
        const toDate = this.dietPlanForm.get('todate').value;
        const params = {
            Datetime: this.datepipe.transform(toDate, "dd-MMM-yyyy")?.toString(),
            WardID: this.selectedWard ? this.selectedWard.ID : 0, 
            SSN: this.dietPlanForm.get('SSN').value ? this.dietPlanForm.get('SSN').value : 0,
            BedID: this.selectedBed ? this.selectedBed.BedID : 0,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.wardID,
            HospitalID: this.hospitalID
        };
        const url = this.service.getData(DietPlanWorklist.FetchWardWiseLatestDietPlanLStickPrint, params);
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.trustedUrl = response?.FTPPATH;
                    this.showModal()
                }
            },
            () => {

            })
      }
}

export const DietPlanWorklist = {
    FetchWardWiseLatestDietPlanL: 'FetchWardWiseLatestDietPlanL?Datetime=${Datetime}&WardID=${WardID}&SSN=${SSN}&BedID=${BedID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    wardSearch: 'FetchSSWards?Name=${Name}&HospitalID=${HospitalID}',
    BedSearch: 'FetchAllBedsNN?Name=${Name}&WardID=${WardID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchWardWiseLatestDietPlanPrintL: 'FetchWardWiseLatestDietPlanPrintL?Datetime=${Datetime}&WardID=${WardID}&SSN=${SSN}&BedID=${BedID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    FetchWardWiseLatestDietPlanLStickPrint: 'FetchWardWiseLatestDietPlanLStickPrint?Datetime=${Datetime}&WardID=${WardID}&SSN=${SSN}&BedID=${BedID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',

}

