import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { otPatientDetails } from 'src/app/ot/ot-patient-casesheet/urls';
import { MedicalAssessmentService } from 'src/app/portal/medical-assessment/medical-assessment.service';
import { DynamicHtmlComponent } from 'src/app/shared/dynamic-html/dynamic-html.component';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { ConfigService } from 'src/app/services/config.service';
import moment from 'moment';
import { preoperativechekclist } from 'src/app/shared/pre-op-checklist/pre-op-checklist.component';

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
    selector: 'app-or-nurses-checklist',
    templateUrl: './or-nurses.component.html',
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
export class OrNursesComponent extends DynamicHtmlComponent implements OnInit, AfterViewInit {
    @ViewChild('divorn') divorn!: ElementRef;
    @ViewChild('Date1', {static: false}) Date1!: ElementRef;
    @ViewChild('Date2', {static: false}) Date2!: ElementRef;
    @ViewChild('Date3', {static: false}) Date3!: ElementRef;
    @Input() data: any;
    url = "";
    selectedView: any;
    doctorDetails: any;
    PatientTemplatedetailID = 0;
    FetchPatienClinicalTemplateDetailsNList: any = [];
    showContent = true;
    item: any;
    navigatedFromCasesheet = 'false';
    surgeons: any = [];
    nurses: any = [];
    errorMessage: string = "";
    templatedId = '113';
    otpatinfo: any;

    @ViewChild('Signature1') Signature1!: SignatureComponent;
    @ViewChild('Signature2') Signature2!: SignatureComponent;
    @ViewChild('Signature3') Signature3!: SignatureComponent;
    @ViewChild('Signature4') Signature4!: SignatureComponent;
    @ViewChild('Signature5') Signature5!: SignatureComponent;
    FetchSurgeryDataDetailLevelDataList: any;
    estTimes: any;
    counting1Data: any = [];
    counting2Data: any = [];
    overalScore = 0;
    currentDatetime: any = moment(new Date()).format('DD-MMM-YYYY HH:mm');
    readonly: any = false;
    listofEmployees: any = [];
    tem: any;
    sameUser: boolean = true;

    constructor(renderer: Renderer2, el: ElementRef, cdr: ChangeDetectorRef, private service: MedicalAssessmentService, private us: UtilityService, private router: Router, private config: ConfigService) {
        super(renderer, el, cdr);
        this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        if (sessionStorage.getItem("otpatient") != 'undefined') {
            this.item = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
        }
    }

    ngOnInit(): void {
        const facility = JSON.parse(sessionStorage.getItem("facility") || '{}'); 
        this.facility = facility.FacilityID === undefined ? facility : facility.FacilityID       
        this.fetchSurgeryEstTime();
        if (this.data) {
            this.readonly = this.data.readonly;
            this.selectedView = this.data.selectedView;
             if(this.data.fromEHR==true)
            {
                sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
            }
            this.fetchotdetails();
        } else {
            this.fetchSurgeryData();
            this.fetchCountingData();
        }
    }

    fetchotdetails() {
        const fromdate = moment(this.selectedView.AdmitDate).format('DD-MMM-YYYY');
        const todate = moment(new Date()).format('DD-MMM-YYYY');
        var SSNN = this.selectedView.SSN;
        this.url = this.service.getData(preoperativechekclist.fetch, { FromDate: fromdate, ToDate: todate, SSN: SSNN, FacilityId: 3395, Hospitalid: this.hospitalID });
        this.us.get(this.url)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              if (this.data.data.SurgeryRequestID) {
                this.item = response.SurgeryRequestsDataList.find((item: any) => item.SurgeryRequestid.toString() === this.data.data.SurgeryRequestID.toString());
                this.fetchSurgeryData();
                
              }
              this.fetchCountingData();
            }
          },
            (err) => {
            });
      }

    ngAfterViewInit() {
        if (this.Date1) {
            this.Date1.nativeElement.id = 'textbox_Date1';
        }
        if (this.Date2) {
            this.Date2.nativeElement.id = 'textbox_Date2';
        }
        if (this.Date3) {
            this.Date3.nativeElement.id = 'textbox_Date3';
        }
        setTimeout(() => {
            this.showdefault(this.divorn.nativeElement);
        }, 2000);
        
        this.bindTextboxValue('textbox_Date1', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('textbox_Date2', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('textbox_Date3', moment().format('DD-MMM-YYYY'));

        this.bindTextboxValue('input_date1', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('input_date2', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('input_date3', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('input_date4', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('input_date5', moment().format('DD-MMM-YYYY'));

        this.bindTextboxValue('input_dateC1', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('input_dateC2', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('input_dateC3', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('input_dateC4', moment().format('DD-MMM-YYYY'));

        this.bindTextboxValue('input_dateS1', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('input_dateS2', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('input_dateS3', moment().format('DD-MMM-YYYY'));
        this.bindTextboxValue('input_dateS4', moment().format('DD-MMM-YYYY'));

        this.bindTextboxValue('textbox_generic_time1', this.setCurrentTime());
        this.bindTextboxValue('textbox_generic_time2', this.setCurrentTime());
        this.bindTextboxValue('textbox_generic_time3', this.setCurrentTime());

        this.bindTextboxValue('input_time1', this.setCurrentTime());
        this.bindTextboxValue('input_time2', this.setCurrentTime());
        this.bindTextboxValue('input_time3', this.setCurrentTime());
        this.bindTextboxValue('input_time4', this.setCurrentTime());
        this.bindTextboxValue('input_time5', this.setCurrentTime());
    }

    clearbase64Signature(signature: SignatureComponent): void {
        signature.clearSignature();
    }

    selectedTemplate(tem: any) {
        this.PatientTemplatedetailID = tem.PatientTemplatedetailID;
        // this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: 0, AdmissionID: this.item.AdmissionID, PatientTemplatedetailID: this.PatientTemplatedetailID, TBL: 2 });
        this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOTSaf, { ClinicalTemplateID: 0, AdmissionID: this.item.AdmissionID, PatientTemplatedetailID: tem.PatientTemplatedetailID, AssesmentOrderID: this.item.SurgeryRequestid, TBL: 2 });

        this.us.get(this.url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    if (response.FetchPatienClinicalTemplateDetailsNNList.length > 0) {
                        tem = response.FetchPatienClinicalTemplateDetailsNNList[0];
                        let sameUser = true;
                        this.tem = tem;
                        if (tem.CreatedBy != this.doctorDetails[0]?.UserName) {
                            sameUser = false;
                            this.sameUser = false;
                        }
                        this.showElementsData(this.divorn.nativeElement, JSON.parse(tem.ClinicalTemplateValues), sameUser, tem);
                        $("#savedModal").modal('hide');
                    }
                }
            },
                () => {
                })
    }

    getreoperative(templateid: any) {
        this.url = this.service.getData(otPatientDetails.FetchPatienClinicalTemplateDetailsOT, { ClinicalTemplateID: templateid, AdmissionID: this.item.AdmissionID, PatientTemplatedetailID: 0, TBL: 1 });
        this.us.get(this.url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    if (response.FetchPatienClinicalTemplateDetailsNList.length > 0) {
                        this.FetchPatienClinicalTemplateDetailsNList = response.FetchPatienClinicalTemplateDetailsNList;
                        // this.selectedTemplate(this.FetchPatienClinicalTemplateDetailsNList[0]);
                        const chkLst = this.FetchPatienClinicalTemplateDetailsNList.find((x: any) => x.AssessmentOrderId == this.item.SurgeryRequestid);
                        this.selectedTemplate(chkLst);
                    }
                }
            },
                () => {
                })
    }

    save() {
        const tags = this.findHtmlTagIds(this.divorn);
        if (tags) {
            const mergedArray  = tags.concat(this.timerData);
            var payload = {
                "PatientTemplatedetailID": this.PatientTemplatedetailID,
                "PatientID": this.item.PatientID,
                "AdmissionID": this.item.AdmissionID,
                "DoctorID": this.doctorDetails[0].EmpId,
                "SpecialiseID": this.item.SurgeonSpecialiseID,
                "ClinicalTemplateID": this.templatedId,
                // "ClinicalTemplateValues": JSON.stringify(tags),
                "ClinicalTemplateValues": JSON.stringify(mergedArray),
                "USERID": this.doctorDetails[0]?.UserId,
                "WORKSTATIONID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
                "HospitalID": this.hospitalID,
                "Signature1": this.signatureForm.get('Signature1').value,
                "Signature2": this.signatureForm.get('Signature2').value,
                "Signature3": this.signatureForm.get('Signature3').value,
                "Signature4": this.signatureForm.get('Signature4').value,
                "Signature5": this.signatureForm.get('Signature5').value,
                "AssessmentOrderId" : this.item.SurgeryRequestid
            }

            this.us.post("SavePatienClinicalTemplateDetails", payload)
                .subscribe((response: any) => {
                    if (response.Code == 200) {
                        $("#saveMsg").modal('show');
                        this.getreoperative(this.templatedId);
                    }
                },
                    () => {

                    })
        }
    }

    clear() {
        this.showContent = false;
        this.PatientTemplatedetailID = 0;
        this.signatureForm.reset();
        this.signatureList = [];
        setTimeout(() => {
            this.showContent = true;
        }, 0);
    }

    navigateBackToOtDashboard() {
        $('#selectPatientYesNoModal').modal('show');
    }

    onAccept() {
        const otpatient = JSON.parse(sessionStorage.getItem("otpatient") || '{}');
        const SSN = otpatient.SSN;
        $('#selectPatientYesNoModal').modal('hide');
        sessionStorage.setItem('navigateToDashboard', SSN)
        this.router.navigate(['/ot/ot-dashboard']);
    }

    onDecline() {
        $('#selectPatientYesNoModal').modal('hide');
        this.router.navigate(['/ot/ot-dashboard']);
    }

    searchSurgeon(event: any) {
        var searchval = event.target.value;
        if (searchval.length > 2) {
            this.url = this.service.getData(sugsftchklst.FetchSSDomainAgainstServiceItems, {
                DomainID: 82,
                Name: searchval,
                HospitalID: this.hospitalID
            });
            this.us.get(this.url)
                .subscribe((response: any) => {
                    if (response.Code == 200 && response.DomainServiceItemsDataList.length > 0) {
                        this.surgeons = response.DomainServiceItemsDataList;
                    }
                },
                    () => {
                    })
        }
    }

    searchNurse(event: any) {
        var searchval = event.target.value;
        if (searchval.length > 2) {
            this.url = this.service.getData(sugsftchklst.FetchSSDomainAgainstServiceItems, {
                DomainID: 85,
                Name: searchval,
                HospitalID: this.hospitalID
            });
            this.us.get(this.url)
                .subscribe((response: any) => {
                    if (response.Code == 200 && response.DomainServiceItemsDataList.length > 0) {
                        this.nurses = response.DomainServiceItemsDataList;
                    }
                },
                    () => {
                    })
        }
    }

    clearSmartSearchData() {
        this.surgeons = [];
        this.nurses = [];
        this.listofEmployees = [];
    }

    fetchSurgeryData() {
        this.config.fetchSurgeryData(this.item.SurgeryRequestid, this.hospitalID).subscribe((response) => {
            this.FetchSurgeryDataDetailLevelDataList = response.FetchSurgeryDataDetailLevelDataList;
            this.FetchSurgeryDataDetailLevelDataList.forEach((item: any) => {
                this.getDepartments(item);
                this.fetchSurgeryDoctors(item);
            });
        });
    }

    getDepartments(item: any) {
        this.config.fetchSurgeryDoctorDept(item.Surgeonid, this.hospitalID).subscribe((response) => {
            item.departments = response.FetchSurgeryDoctorDeptDataaList;
        });
    }

    fetchSurgeryDoctors(item: any) {
        this.config.fetchSurgeryDoctors(item.Surgeonid, this.hospitalID).subscribe((response) => {
            item.doctorsList = response.FetchSurgeryDoctorsDataList;
        });
    }

    fetchSurgeryEstTime() {
        this.config.fetchSurgeryEstTime(this.hospitalID).subscribe((response) => {
            this.estTimes = response.SurgeryDemographicsDataaList;
        });
    }

    fetchCountingData() {
        this.config.FetchSurgeryCountingSheetInstruments(this.hospitalID, this.facility).subscribe((response) => {
            if (response.Code === 200) {
                this.counting1Data = response.FetchSurgeryCountingSheetInstrumentsDataList.filter((item: any) => item.Type === '1');
                this.counting2Data = response.FetchSurgeryCountingSheetInstrumentsDataList.filter((item: any) => item.Type === '2');
                this.getreoperative(this.templatedId);
            }
        });
    }

    getDifferenceOfCounting2(item: any, index: any) {
        const ids = [`textbox_FirstCount_${index}`, `textbox_SecondCount_${index}`, `textbox_FinalCount_${index}`];
        const values = ids.map((id: any) => (document.getElementById(id) as any)?.value).filter((value: any) => value !== '');
        return Number(item.Quantity) - (values.length > 0 ? Math.min(...values) : Number(item.Quantity));
    }

    getDifferenceOfCounting1(item: any, index: any) {
        const ids = [`textbox_FirstCountingAddTotal_${index}`, `textbox_SecondCountingAddTotal_${index}`, `textbox_FinalCountingAddTotal_${index}`];
        const values = ids.map((id: any) => (document.getElementById(id) as any)?.value).filter((value: any) => value !== '');
        //const FirstCount=(document.getElementById(`textbox_InitialCount_${index}`) as any)?.value;
        const FirstCount = (document.getElementById(`textbox_FirstCountingAddTotal_${index}`) as any)?.value;
        const FinalCounting_add = (document.getElementById(`textbox_FinalCountingAdd_${index}`) as any)?.value;
        // if(FirstCount !== '') {
        //     return Number(Number(FirstCount)) - (values.length > 0 ? Math.min(...values) : Number(item.Quantity));
        // }
        // else {
        //     return 0;
        // }
        var secondCounting = (document.getElementById(`textbox_SecondCountingAddTotal_${index}`) as any)?.value;
        secondCounting = Number(secondCounting) + Number(FinalCounting_add);
        const finalCounting = (document.getElementById(`textbox_FinalCountingAddTotal_${index}`) as any)?.value;
        const diff = secondCounting - finalCounting;
        if (diff < 0) {
            return 0;
        }
        else {
            return diff;
        }
    }
    getOverallDifferenceOfCounting1(item: any, index: any) {
        const ids = [`textbox_FirstCountingAddTotal_${index}`, `textbox_SecondCountingAddTotal_${index}`, `textbox_FinalCountingAddTotal_${index}`];
        const values = ids.map((id: any) => (document.getElementById(id) as any)?.value).filter((value: any) => value !== '');
        const FirstCountF = (document.getElementById(`textbox_InitialCount_${index}`) as any)?.value;
        const FirstCount = (document.getElementById(`textbox_FirstCountingAddTotal_${index}`) as any)?.value;
        //return Number(Number(FirstCount==''?0:FirstCount)) - (Number(Number(item.Quantity)+Number(FirstCountF)) - (values.length > 0 ? Math.min(...values) : Number(item.Quantity)));
        if (FirstCount !== '') {
            return Number(Number(FirstCount == '' ? 0 : FirstCount)) - (Number(Number(FirstCount == '' ? 0 : FirstCount)) - (values.length > 0 ? Math.min(...values) : Number(item.Quantity)));
        }
        else {
            return 0;
        }
    }

    addFirstCount(index: any) {
        const ids = [`textbox_FirstCountingField_${index}`, `textbox_FirstCountingFloor_${index}`, `textbox_FirstCountingAdd_${index}`];
        let value: any = '';
        ids.forEach(id => {
            if ((document.getElementById(id) as any)?.value) {
                if (value === '') {
                    value = 0
                }
                value += Number((document.getElementById(id) as any)?.value);
            }
        })
        return value;
    }

    addSecoundCount(index: any) {
        const ids = [`textbox_SecondCountingField_${index}`, `textbox_SecondCountingFloor_${index}`, `textbox_SecondCountingAdd_${index}`];
        let value: any = '';
        ids.forEach(id => {
            if ((document.getElementById(id) as any)?.value) {
                if (value === '') {
                    value = 0
                }
                value += Number((document.getElementById(id) as any)?.value);
            }
        })
        return value;
    }

    addFinalCount(index: any) {
        const ids = [`textbox_FinalCountingField_${index}`, `textbox_FinalCountingFloor_${index}`, `textbox_FinalCountingAdd_${index}`];
        let value: any = '';
        ids.forEach(id => {
            if ((document.getElementById(id) as any)?.value) {
                if (value === '') {
                    value = 0
                }
                value += Number((document.getElementById(id) as any)?.value);
            }
        });
        this.overalScore = value;
        return value;
    }

    openOtQuickActions() {
        this.otpatinfo = this.item;
        $("#ot_quickaction_info").modal('show');
      }
    
      closeOtModal() {
        this.otpatinfo = "";
        $("#ot_quickaction_info").modal('hide');
      }

      searchEmployee(event: any) {
        if (event.target.value.length > 2) {
          this.url = this.service.getData(sugsftchklst.FetchSSEmployees, { name: event.target.value, UserId: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
          this.us.get(this.url)
            .subscribe((response: any) => {
              if (response.Code == 200) {
                this.listofEmployees = response.FetchSSEmployeesDataList;
              }
            },
              (err) => {
              })
        }
      }
}

export const sugsftchklst = {
    FetchSSDomainAgainstServiceItems: 'FetchSSDomainAgainstServiceItems?Name=${Name}&DomainID=${DomainID}&HospitalID=${HospitalID}',
    FetchSSEmployees: "FetchSSEmployees?name=${name}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}",
}

