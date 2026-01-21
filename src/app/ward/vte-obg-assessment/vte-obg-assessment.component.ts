import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { VteObgAssessmentService } from './vte-obg-assessment.service';
import { VteObgDetails } from './urls';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
declare var $: any;
export const MY_FORMATS = {
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
  selector: 'app-vte-obg-assessment',
  templateUrl: './vte-obg-assessment.component.html',
  styleUrls: ['./vte-obg-assessment.component.scss'],
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
export class VteObgAssessmentComponent extends BaseComponent implements OnInit {
  @Input() data: any;
  @Input() viewMode: any = false;
  readonly = false;
  IsHeadNurse: any;
  IsHome: any;
  url: any;
  FetchAssessmentRiskFactorValuesDataOBG1List: any = [];
  FetchAssessmentRiskFactorValuesDataOBG2List: any = [];
  FetchAssessmentRiskFactorValuesDataOBG3List: any = [];
  FetchAssessmentRiskFactorValuesDataFinalList: any = [];
  FetchVTEWeightEnoxaparinTinzaparin1List: any = [];
  FetchVTEWeightEnoxaparinTinzaparin2List: any = [];
  FetchVTEWeightEnoxaparinTinzaparin3List: any = [];
  nurseList: any = [];
  docList: any = [];
  filteredFinalList: any[] = [];
  groupedFinalList: { [sectionName: string]: any[] } = {};
  vteObgAssessmentForm: any;
  PatientObgVTEID = 0;
  FetchPatientFinalObgVTEFromPatDataList: any = [];
  lowriskColor = "";
  selectedObgVteAssessment: any;
  isVerified = false;
  showVerify = false;
  vteSavedUser = "";
  errorMsg = "";
  saveMsg = "";
  verifiedUserNameDate = "";
  vteOrderId = "";
  endofEpisode: any;
  IsNurse: any;
  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @Output() dataChanged = new EventEmitter<boolean>();
  @Input() fromCaseSheet = false;

  VerifiedBy: any = '';
  VerifiedByName: any = '';
  VerifiedDate: any = '';
  isNewVerified: boolean = false;

  base64StringSurgeonSig = '';
  @ViewChild('SignSurgeon', { static: false }) signComponent: SignatureComponent | undefined;
  showSignature = true;

  constructor(private datePipe: DatePipe, private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private service: VteObgAssessmentService, private modalService: NgbModal) {
    super();

    this.vteObgAssessmentForm = this.formBuilder.group({
      IsAssessment: true,
      IsPatienttransferFromOneUnitToAnother: false,
      IsChangeInPatientCondition: false,
      patientBmi: 0,
      Weight: 0,
      IsPatientSignificant: false,
      IsUseSequentialCompression: false,
      IsUnfractionatedHeparin: false,
      IsveryHighRiskOfThrombosis: false,
      IsIncreasedRiskOfHemorrhage: false,
      IsWomenWithRenalfailure: false,
      IsRequiredIntervalBetweenProphylactic: false,
      NurseUserName: [],
      DoctorUserName: this.doctorDetails[0].EmpNo + "-" + this.doctorDetails[0].EmployeeName,
      DoctorDate: this.datePipe.transform(new Date(), "dd-MMM-yyyy HH:mm")?.toString(),
      preparedByName: this.doctorDetails[0].EmpNo + "-" + this.doctorDetails[0].EmployeeName,
      preparedByDesignation: this.doctorDetails[0].EmpDesignation,
      preparedByDate: this.datePipe.transform(new Date(), "dd-MMM-yyyy HH:mm")?.toString(),
      preparedBy: this.doctorDetails[0].EmpId,
      preparedBySignature: '',
      NurseDate: new Date(),
      NurseID: 0,
      DoctorID: 0,
    });


    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
  }

  base64SurgeonSignature(event: any) {
    this.vteObgAssessmentForm.patchValue({ preparedBySignature: event });
  }

  clearSurgeonSignature() {
    if (this.signComponent) {
      this.signComponent.clearSignature();
      this.vteObgAssessmentForm.patchValue({ preparedBySignature: '' });
    }
  }

  toggleProperty(propertyName: string) {
    const currentValue = this.vteObgAssessmentForm.get(propertyName).value;
    this.vteObgAssessmentForm.patchValue({
      [propertyName]: !currentValue
    });
  }

  toggleSelectProperty(propertyName: string, value: boolean) {
    this.vteObgAssessmentForm.patchValue({
      [propertyName]: value
    });
  }

  viewAssessments() {
    $("#savedModal").modal('show');
  }

  ngOnInit(): void {
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    if (this.selectedView.PatientID == undefined) {
      this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');

    }

    this.IsNurse = sessionStorage.getItem("IsNurse");
    if (this.IsNurse === 'true') {
      this.endofEpisode = true;
    } else {
      if (sessionStorage.getItem("ISEpisodeclose") == 'false')
        this.endofEpisode = false;
      else
        this.endofEpisode = true;

    }


    this.fetchAssessmentRiskFactorRiskNormalObG();
    this.FetchVTEWeightEnoxaparinTinzaparin();
    this.fetchPatientHeightWeight();
    this.FetchPatientFinalObgVTEFrom();
    if (this.data != undefined) {
      this.admissionID = this.data.data.Admissionid;
      this.readonly = this.data.readonly;
      this.selectedObgVteAssessment = this.data.data;
      this.selectedAssessment(this.data.data);
      // this.us.disabledElement(this.divreadonly.nativeElement);
    }
  }

  fetchPatientHeightWeight() {
    this.url = this.service.getData(VteObgDetails.FetchPatientHeightWeight, { PatientID: this.selectedView.PatientID });
    this.us.post(this.url, {})
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.vteObgAssessmentForm.patchValue({
            patientBmi: response.SmartDataList[0].BMI.split('-')[0],
            Weight: response.SmartDataList[0].Weight
          });
        }
      },
        (err) => {
        })
  }

  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  fetchAssessmentRiskFactorRiskNormalObG() {
    this.url = this.service.getData(VteObgDetails.FetchAssessmentRiskFactorRiskNormalObG, { UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchAssessmentRiskFactorValuesDataOBG1List = response.FetchAssessmentRiskFactorValuesDataOBG1List;
          this.FetchAssessmentRiskFactorValuesDataOBG2List = response.FetchAssessmentRiskFactorValuesDataOBG2List;
          this.FetchAssessmentRiskFactorValuesDataOBG3List = response.FetchAssessmentRiskFactorValuesDataOBG3List;
          if (Number(this.selectedView.AgeValue) > 35) {
            this.toggleObg(this.FetchAssessmentRiskFactorValuesDataOBG3List[0]);
          }
          this.FetchAssessmentRiskFactorValuesDataFinalList = response.FetchAssessmentRiskFactorValuesDataFinalList;
        }
      },
        (err) => {
        })
  }

  FetchVTEWeightEnoxaparinTinzaparin() {
    this.url = this.service.getData(VteObgDetails.FetchVTEWeightEnoxaparinTinzaparin, { UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchVTEWeightEnoxaparinTinzaparin1List = response.FetchVTEWeightEnoxaparinTinzaparin1List;
          this.FetchVTEWeightEnoxaparinTinzaparin2List = response.FetchVTEWeightEnoxaparinTinzaparin2List;
          this.FetchVTEWeightEnoxaparinTinzaparin3List = response.FetchVTEWeightEnoxaparinTinzaparin3List;
        }
      },
        (err) => {
        })
  }

  FetchPatientFinalObgVTEFrom() {
    this.url = this.service.getData(VteObgDetails.FetchPatientFinalObgVTEFrom, { PatientObgVTEID: 0, AdmissionID: this.admissionID, UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatientFinalObgVTEFromPatDataList = response.FetchPatientFinalObgVTEFromPatDataList;
          this.FetchPatientFinalObgVTEFromPatDataList.forEach((element: any, index: any) => {
            element.selected = false;
          });
          this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
          if (this.selectedView.PatientID == undefined) {
            this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');

          }
          this.vteOrderId = this.selectedView.VTEOrderID;
          if (this.vteOrderId != "" && this.vteOrderId != undefined) {
            const vteObgOrder = this.FetchPatientFinalObgVTEFromPatDataList.find((x: any) => x.PatientObgVTEID === this.vteOrderId);
            if (vteObgOrder != undefined)
              this.selectedAssessment(vteObgOrder);
          }
        }
      },
        (err) => {
        })
  }

  toggleObg(item: any) {
    item.selected = !item.selected;
    if (this.FetchAssessmentRiskFactorValuesDataOBG3List.filter((x: any) => x.selected).length > 0)
      this.lowriskColor = "aliceblue";
    else
      this.lowriskColor = "";

    this.groupedFinalList = {};
    this.filteredFinalList = [];

    this.FetchAssessmentRiskFactorValuesDataOBG1List.forEach((item: any) => {
      if (item.selected) {
        const filteredItems = this.FetchAssessmentRiskFactorValuesDataFinalList.filter((finalItem: any) => finalItem.SectionID === item.SectionID);
        const sectionName = item.SectionName.trim();

        if (!this.groupedFinalList[sectionName]) {
          this.groupedFinalList[sectionName] = [];
        }

        this.groupedFinalList[sectionName].push(...filteredItems);
      }
    });
  }

  toggleObg1(item: any) {
    item.selected = !item.selected;
  }

  getKeys(object: object): string[] {
    return Object.keys(object);
  }

  searchNurse(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(VteObgDetails.FetchPatientVTENurse, { Filter: event.target.value, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.nurseList = response.FetchRODNursesDataList;
          }
        },
          (err) => {
          })
    }
  }

  onNurseItemSelected(item: any) {
    this.nurseList = [];

    const modalRef = this.modalService.open(ValidateEmployeeComponent);
    modalRef.componentInstance.initialData = { UserName: item.EmpNo };
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.vteObgAssessmentForm.patchValue({
          NurseUserName: item.EmpNo,
          NurseID: item.Empid
        });
      }
      modalRef.close();
    });
  }

  searchDoctor(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(VteObgDetails.FetchPatientVTEDoctor, { Filter: event.target.value, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.docList = response.FetchRODNursesDataList;
          }
        },
          (err) => {
          })
    }
  }

  onDoctorItemSelected(item: any) {
    this.docList = [];

    const modalRef = this.modalService.open(ValidateEmployeeComponent);
    modalRef.componentInstance.initialData = { UserName: item.EmpNo };
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.vteObgAssessmentForm.patchValue({
          DoctorUserName: item.EmpNo,
          DoctorID: item.Empid
        });
      }
      modalRef.close();
    });
  }

  saveAssessment() {
    const preparedBySign = this.vteObgAssessmentForm.get('preparedBySignature')?.value;
    if(preparedBySign === '') {
      this.errorMsg = "Please enter Prepared By Signature";
      $("#showCCValidationMsg").modal('show');
      return;
    }
    const modalRef = this.modalService.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.save();
      }
      modalRef.close();
    });
  }

  save(fromVerify: boolean = false) {

    var VTESectionDetails: any = [];
    var VTEWeightDetails: any = [];
    var VTEEnoxaparinDetails: any = [];
    var VTETinzaparinDetails: any = [];

    this.FetchAssessmentRiskFactorValuesDataOBG1List.forEach((item: any) => {
      if (item.selected) {
        VTESectionDetails.push({
          "SECID": item.SectionID,
          "SUBSECID": "0"
        })
      }
    });

    this.FetchAssessmentRiskFactorValuesDataOBG2List.forEach((item: any) => {
      if (item.selected) {
        VTESectionDetails.push({
          "SECID": item.SectionID,
          "SUBSECID": "0"
        })
      }
    });

    this.FetchAssessmentRiskFactorValuesDataOBG3List.forEach((item: any) => {
      if (item.selected) {
        VTESectionDetails.push({
          "SECID": item.SectionID,
          "SUBSECID": "0"
        })
      }
    });

    this.FetchAssessmentRiskFactorValuesDataFinalList.forEach((item: any) => {
      if (item.selected) {
        VTESectionDetails.push({
          "SECID": item.SectionID,
          "SUBSECID": item.SubSectionID
        })
      }
    });

    this.FetchVTEWeightEnoxaparinTinzaparin1List.forEach((item: any) => {
      if (item.selected) {
        VTEWeightDetails.push({
          "WID": item.WeightID
        })
      }
    });

    this.FetchVTEWeightEnoxaparinTinzaparin2List.forEach((item: any) => {
      if (item.selected) {
        VTEEnoxaparinDetails.push({
          "ENID": item.EnoxaparinID
        })
      }
    });

    this.FetchVTEWeightEnoxaparinTinzaparin3List.forEach((item: any) => {
      if (item.selected) {
        VTETinzaparinDetails.push({
          "TNID": item.TinzaparinID
        })
      }
    });


    var payload = {
      "PatientObgVTEID": this.PatientObgVTEID,
      "PatientID": this.selectedView.PatientID,
      "AdmissionID": this.admissionID,
      "IsAssessment": this.vteObgAssessmentForm.get('IsAssessment').value ? 1 : 0,
      "IsReAssessment": this.vteObgAssessmentForm.get('IsAssessment').value ? 0 : 1,
      "IsPatienttransferFromOneUnitToAnother": this.vteObgAssessmentForm.get('IsPatienttransferFromOneUnitToAnother').value ? 1 : 0,
      "IsChangeInPatientCondition": this.vteObgAssessmentForm.get('IsChangeInPatientCondition').value ? 1 : 0,
      "Weight": this.vteObgAssessmentForm.get('Weight').value,
      "BMI": this.vteObgAssessmentForm.get('patientBmi').value,
      "IsPatientSignificant": this.vteObgAssessmentForm.get('IsPatientSignificant').value ? 1 : 0,
      "IsUseSequentialCompression": this.vteObgAssessmentForm.get('IsUseSequentialCompression').value ? 1 : 0,
      "IsUnfractionatedHeparin": this.vteObgAssessmentForm.get('IsUnfractionatedHeparin').value ? 1 : 0,
      "IsveryHighRiskOfThrombosis": this.vteObgAssessmentForm.get('IsveryHighRiskOfThrombosis').value ? 1 : 0,
      "IsIncreasedRiskOfHemorrhage": this.vteObgAssessmentForm.get('IsIncreasedRiskOfHemorrhage').value ? 1 : 0,
      "IsWomenWithRenalfailure": this.vteObgAssessmentForm.get('IsWomenWithRenalfailure').value ? 1 : 0,
      "IsRequiredIntervalBetweenProphylactic": this.vteObgAssessmentForm.get('IsRequiredIntervalBetweenProphylactic').value ? 1 : 0,
      "NurseID": this.vteObgAssessmentForm.get('NurseID').value,
      //"DoctorID": this.doctorDetails[0].EmpId,
      "DoctorID": this.selectedView.ConsultantID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "HospitalId": this.hospitalID,
      "VTESectionDetails": VTESectionDetails,
      "VTEWeightDetails": VTEWeightDetails,
      "VTEEnoxaparinDetails": VTEEnoxaparinDetails,
      "VTETinzaparinDetails": VTETinzaparinDetails,
      "PreparedBy": this.vteObgAssessmentForm.get('preparedBy').value,
      "PreparedBySignature": this.vteObgAssessmentForm.get('preparedBySignature').value,
      "IsVerified": this.PatientObgVTEID ? true : false,
      "VerifiedBy": this.PatientObgVTEID ? this.doctorDetails[0].UserId : 0,
      "SpecialiseID": this.selectedView.SpecialiseID,
    }

    this.us.post(VteObgDetails.SavePatientFinalObgVTEFrom, payload).subscribe((response) => {
      if (response.Status === "Success") {
        if (!fromVerify) {
          this.saveMsg = "VTE Risk Assessment Saved Successfully";
          $("#saveMsg").modal('show');
        } else {
          this.isNewVerified = true;
          $("#verifyMsg").modal('show');
        }
      }
      else {
        if (response.Status == 'Fail') {

        }
      }
    },
      (err) => {

      })
  }



  clear(isnewForm: boolean = false) {
    this.PatientObgVTEID = 0;
    this.vteObgAssessmentForm.reset({
      IsAssessment: true,
      IsPatienttransferFromOneUnitToAnother: false,
      IsChangeInPatientCondition: false,
      patientBmi: 0,
      Weight: 0,
      IsPatientSignificant: false,
      IsUseSequentialCompression: false,
      IsUnfractionatedHeparin: false,
      IsveryHighRiskOfThrombosis: false,
      IsIncreasedRiskOfHemorrhage: false,
      IsWomenWithRenalfailure: false,
      IsRequiredIntervalBetweenProphylactic: false,
      NurseUserName: [],
      DoctorUserName: this.doctorDetails[0].EmpNo + "-" + this.doctorDetails[0].EmployeeName,
      DoctorDate: this.datePipe.transform(new Date(), "dd-MMM-yyyy HH:mm")?.toString(),
      NurseDate: new Date(),
      NurseID: 0,
      DoctorID: 0,
      preparedByName: this.doctorDetails[0].EmpNo + "-" + this.doctorDetails[0].EmployeeName,
      preparedByDesignation: this.doctorDetails[0].EmpDesignation,
      preparedByDate: this.datePipe.transform(new Date(), "dd-MMM-yyyy HH:mm")?.toString(),
      preparedBy: this.doctorDetails[0].EmpId,
      preparedBySignature: '',
    });
    this.base64StringSurgeonSig = '';
    this.showSignature = false;
    setTimeout(() => {
      this.showSignature = true;
    }, 0);
    this.groupedFinalList = {};
    this.fetchAssessmentRiskFactorRiskNormalObG();
    this.FetchVTEWeightEnoxaparinTinzaparin();
    this.fetchPatientHeightWeight();
    if(!isnewForm) {
      this.FetchPatientFinalObgVTEFrom();
    }
    
    this.isVerified = false;
    this.showVerify = false;
    this.verifiedUserNameDate = "";
  }

  selectAssessment(asmnt: any) {
    this.FetchPatientFinalObgVTEFromPatDataList.forEach((element: any, index: any) => {
      if (element.PatientObgVTEID === asmnt.PatientObgVTEID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.selectedObgVteAssessment = asmnt;
  }

  selectedAssessment(assessment: any) {
    this.url = this.service.getData(VteObgDetails.FetchPatientFinalObgVTEFrom, { PatientObgVTEID: assessment.PatientObgVTEID, AdmissionID: this.admissionID, UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          $("#savedModal").modal('hide');
          if (response.FetchPatientFinalObgVTEFromPatDataList.length > 0) {
            this.vteSavedUser = response.FetchPatientFinalObgVTEFromPatDataList[0]?.USERID;
            this.showVerify = true;
            const verifiedUser = response.FetchPatientFinalObgVTEFromPatDataList.find((x: any) => x.PatientObgVTEID === assessment.PatientObgVTEID);
            if (verifiedUser.VerifiedByName != '') {
              this.verifiedUserNameDate = '( Verified By: ' + verifiedUser.VerifiedByName + ' on (' + verifiedUser.VerifiedDate + ') )';
              this.VerifiedByName = verifiedUser.VerifiedByName;
              this.VerifiedDate = verifiedUser.VerifiedDate;
              this.isVerified = true;
              this.isNewVerified = true;
            }
          }
          this.PatientObgVTEID = response.FetchPatientFinalObgVTEFromPatDataList[0].PatientObgVTEID;
          this.vteObgAssessmentForm.patchValue({
            IsAssessment: response.FetchPatientFinalObgVTEFromPatDataList[0].IsAssessment === "True" ? true : false,
            IsPatienttransferFromOneUnitToAnother: response.FetchPatientFinalObgVTEFromPatDataList[0].IsAssessment === "True" ? false : true,
            IsChangeInPatientCondition: response.FetchPatientFinalObgVTEFromPatDataList[0].IsChangeInPatientCondition === "True" ? true : false,
            patientBmi: response.FetchPatientFinalObgVTEFromPatDataList[0].BMI,
            Weight: response.FetchPatientFinalObgVTEFromPatDataList[0].Weight,
            IsPatientSignificant: response.FetchPatientFinalObgVTEFromPatDataList[0].IsPatientSignificant === "True" ? true : false,
            IsUseSequentialCompression: response.FetchPatientFinalObgVTEFromPatDataList[0].IsUseSequentialCompression === "True" ? true : false,
            IsUnfractionatedHeparin: response.FetchPatientFinalObgVTEFromPatDataList[0].IsUnfractionatedHeparin === "True" ? true : false,
            IsveryHighRiskOfThrombosis: response.FetchPatientFinalObgVTEFromPatDataList[0].IsveryHighRiskOfThrombosis === "True" ? true : false,
            IsIncreasedRiskOfHemorrhage: response.FetchPatientFinalObgVTEFromPatDataList[0].IsIncreasedRiskOfHemorrhage === "True" ? true : false,
            IsWomenWithRenalfailure: response.FetchPatientFinalObgVTEFromPatDataList[0].IsWomenWithRenalfailure === "True" ? true : false,
            IsRequiredIntervalBetweenProphylactic: response.FetchPatientFinalObgVTEFromPatDataList[0].IsRequiredIntervalBetweenProphylactic === "True" ? true : false,
            NurseUserName: response.FetchPatientFinalObgVTEFromPatDataList[0].NSEmpNo + "-" + response.FetchPatientFinalObgVTEFromPatDataList[0].NurseName,
            DoctorUserName: response.FetchPatientFinalObgVTEFromPatDataList[0].DEmpNo + "-" + response.FetchPatientFinalObgVTEFromPatDataList[0].DoctorName,
            preparedByName: response.FetchPatientFinalObgVTEFromPatDataList[0].PreparedByName,
            preparedByDesignation: response.FetchPatientFinalObgVTEFromPatDataList[0].Designation,
            preparedByDate: response.FetchPatientFinalObgVTEFromPatDataList[0].PreparedDate,
            preparedBy: response.FetchPatientFinalObgVTEFromPatDataList[0].PreparedBy,
            preparedBySignature: response.FetchPatientFinalObgVTEFromPatDataList[0].PreparedBySignature,
            DoctorDate: this.datePipe.transform(response.FetchPatientFinalObgVTEFromPatDataList[0].DoctorDate, "dd-MMM-yyyy HH:mm")?.toString(),//new Date(response.FetchPatientFinalObgVTEFromPatDataList[0].DoctorDate),
            NurseDate: new Date(response.FetchPatientFinalObgVTEFromPatDataList[0].NurseDate),
            NurseID: response.FetchPatientFinalObgVTEFromPatDataList[0].NurseID,
            DoctorID: response.FetchPatientFinalObgVTEFromPatDataList[0].DoctorID
          });

          this.base64StringSurgeonSig = response.FetchPatientFinalObgVTEFromPatDataList[0].PreparedBySignature;

          this.showSignature = false;
          setTimeout(() => {
            this.showSignature = true;
          }, 0);

          response.FetchPatientObgVTEFromPatDataList.forEach((patientObg: any) => {
            const sectionID = patientObg.SectionID;
            this.markSectionSelected(sectionID, this.FetchAssessmentRiskFactorValuesDataOBG1List);
            this.markSectionSelected(sectionID, this.FetchAssessmentRiskFactorValuesDataOBG2List);
            this.markSectionSelected(sectionID, this.FetchAssessmentRiskFactorValuesDataOBG3List);
            this.markSubSectionSelected(patientObg.SubSectionID, this.FetchAssessmentRiskFactorValuesDataFinalList);
          });

          response.FetchPatientObgVTEWTFromPatDataList.forEach((patientObg: any) => {
            const section = this.FetchVTEWeightEnoxaparinTinzaparin1List.find((s: any) => s.WeightID === patientObg.WeightID);
            if (section) {
              section.selected = true;
            }
          });

          response.FetchPatientObgVTEEnoFromPatDataList.forEach((patientObg: any) => {
            const section = this.FetchVTEWeightEnoxaparinTinzaparin2List.find((s: any) => s.EnoxaparinID === patientObg.EnoxaparinID);
            if (section) {
              section.selected = true;
            }
          });

          response.FetchPatientObgVTETinzFromPatDataList.forEach((patientObg: any) => {
            const section = this.FetchVTEWeightEnoxaparinTinzaparin3List.find((s: any) => s.TinzaparinID === patientObg.TinzaparinID);
            if (section) {
              section.selected = true;
            }
          });
        }
      },
        (err) => {
        })
  }

  fetch() {
    this.clear();
    $("#saveMsg").modal('hide');
    this.FetchPatientFinalObgVTEFrom();
  }

  markSectionSelected(sectionID: string, sectionList: any[]) {
    const section = sectionList.find(section => section.SectionID === sectionID);
    if (section) {
      section.selected = true;
      this.toggleObg(sectionList)
    }
  }

  markSubSectionSelected(sectionID: string, sectionList: any[]) {
    const section = sectionList.find(section => section.SubSectionID === sectionID);
    if (section) {
      section.selected = true;
    }
  }

  verifyVTEObg() {
    if (this.readonly) {
      return;
    }
    this.isVerified = !this.isVerified;
    if (this.vteSavedUser === this.doctorDetails[0].UserId) {
      this.errorMsg = "Saved user and acknowledge user cannot be same";
      this.isVerified = !this.isVerified;
      $("#showCCValidationMsg").modal('show');
      return;
    }
    var paylod = {
      "RiskAssessmentOrderID": this.PatientObgVTEID,
      "IsVerified": true,
      "VerifiedBy": this.doctorDetails[0].UserId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "HospitalID": this.hospitalID
    }
    this.us.post(VteObgDetails.UpdateRiskAssessmentOBGVerifications, paylod).subscribe((response) => {
      if (response.Status === "Success") {
        this.saveMsg = "VTE Risk Assessment Acknowledged Successfully";
        $("#saveMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {

        }
      }
    },
      (err) => {

      })
  }
  getCTASScoreClass() {
    if (this.selectedView?.CTASScore == '1') {
      return 'Resuscitation';
    }
    else if (this.selectedView?.CTASScore == '2') {
      return 'Emergent';
    }
    else if (this.selectedView?.CTASScore == '3') {
      return 'Urgent';
    }
    else if (this.selectedView?.CTASScore == '4') {
      return 'LessUrgent';
    }
    else if (this.selectedView?.CTASScore == '5') {
      return 'NonUrgent';
    }
    return '';
  }
}
