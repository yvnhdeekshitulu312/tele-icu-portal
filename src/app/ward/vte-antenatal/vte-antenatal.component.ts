import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { VteObgAssessmentService } from '../vte-obg-assessment/vte-obg-assessment.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { VteAntenatalDetails } from './urls';
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
  selector: 'app-vte-antenatal',
  templateUrl: './vte-antenatal.component.html',
  styleUrls: ['./vte-antenatal.component.scss'],
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
export class VteAntenatalComponent extends BaseComponent implements OnInit {
  @Input() data: any;
  @Input() viewMode: any = false;
  readonly = false;
  IsHeadNurse: any;
  IsHome: any;
  url: any;

  FetchAssessmentRiskFactorRiskNormalAntenatal11List: any = [];
  FetchAssessmentRiskFactorRiskNormalAntenatal12List: any = [];
  FetchAssessmentRiskFactorRiskNormalAntenatal13List: any = [];

  FetchAssessmentRiskFactorRiskNormalAntenatal2List: any = [];
  FetchAssessmentRiskFactorRiskNormalAntenatal3List: any = [];
  FetchAssessmentRiskFactorRiskNormalAntenatal4List: any = [];
  FetchAssessmentRiskFactorRiskNormalAntenatal5List: any = [];
  FetchAssessmentRiskFactorRiskNormalAntenatal6List: any = [];


  FetchVTEWeightEnoxaparinTinzaparin1List: any = [];
  FetchVTEWeightEnoxaparinTinzaparin2List: any = [];
  FetchVTEWeightEnoxaparinTinzaparin3List: any = [];
  vteAntenatalAssessmentForm: any;
  PatientVTEAntenatalID = 0;
  FetchPatientFinalAntenatalVTEFromPatDataList: any = [];
  lowriskColor = "";
  selectedVteAssessment: any;
  isVerified = false;
  showVerify = false;
  vteSavedUser = "";
  errorMsg = "";
  saveMsg = "";
  verifiedUserNameDate = "";
  vteOrderId = "";
  endofEpisode: any;
  IsNurse: any;
  nursingInterventions: any = [];
  @ViewChild('divreadonly') divreadonly!: ElementRef;
  @Output() dataChanged = new EventEmitter<boolean>();
  @Input() fromCaseSheet = false;
  @ViewChild('DoctorSignature') DoctorSignature!: SignatureComponent;
  @ViewChild('NurseSignature') NurseSignature!: SignatureComponent; 
  DoctorSignature1 = '';
  NurseSignature1 = '';

  VerifiedBy: any = '';
  VerifiedByName: any = '';
  VerifiedDate: any = '';
  isNewVerified: boolean = false;
  employeeList: any = [];
  showSignature: boolean = false;

  isHighRisk: boolean = false;
  isIntermediateRisk: boolean = false;
  isFourmoreRisk: boolean = false;
  isLowRisk: boolean = false;

  constructor(private datePipe: DatePipe, private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private service: VteObgAssessmentService, private modalService: NgbModal) {
    super();

    this.initializeForm();

    this.IsHeadNurse = sessionStorage.getItem("IsHeadNurse");
    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
  }

  initializeForm() {
    this.vteAntenatalAssessmentForm = this.formBuilder.group({
      IsNurseNotifiedPhysician: false,
      IsProvidingVTEMechanicalProphylaxisDevices: false,
      IsNurseProvidedPatientFamilyEducation: false,
      IsPatientReceiveEducationAdministration: false,
      IsNurseAppliesPreventionMeasures: false,
      IsAssistEarlyMobilization: false,
      IsTeachingFootLegExercises: false,
      IsCompressionElasticStockings: false,
      NurseUserName: '',
      DoctorUserName: this.doctorDetails[0].EmpNo + "-" + this.doctorDetails[0].EmployeeName,
      DoctorDate: this.datePipe.transform(new Date(), "dd-MMM-yyyy HH:mm")?.toString(),
      NurseDate: new Date(),
      NurseID: 0,
      DoctorID: this.doctorDetails[0].EmpId,
      DoctorSignature: [''],
      NurseSignature: [''],
      patientBmi: 0,
      Weight: 0,
    });
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

    
    this.FetchVTESectionAntenatal();
    this.FetchVTEWeightEnoxaparinTinzaparin();
    this.FetchPatientFinalVTEForm();
    this.fetchPatientHeightWeight();

    if (this.data != undefined) {
      this.admissionID = this.data.data.Admissionid;
      this.readonly = this.data.readonly;
      this.selectedVteAssessment = this.data.data;
      this.selectedAssessment(this.data.data);
    }
    
  }

  toggleProperty(propertyName: string) {
    const currentValue = this.vteAntenatalAssessmentForm.get(propertyName).value;
    this.vteAntenatalAssessmentForm.patchValue({
      [propertyName]: !currentValue
    });
  }

  toggleSelectProperty(propertyName: string, value: boolean) {
    this.vteAntenatalAssessmentForm.patchValue({
      [propertyName]: value
    });
  }

  viewAssessments() {
    $("#savedModal").modal('show');
  }

  navigatetoBedBoard() {
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  FetchVTESectionAntenatal() {
    this.url = this.service.getData(VteAntenatalDetails.FetchVTESectionAntenatal, { UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchAssessmentRiskFactorRiskNormalAntenatal11List = response.FetchAssessmentRiskFactorRiskNormalAntenatal11List;
          this.FetchAssessmentRiskFactorRiskNormalAntenatal12List = response.FetchAssessmentRiskFactorRiskNormalAntenatal12List;
          this.FetchAssessmentRiskFactorRiskNormalAntenatal13List = response.FetchAssessmentRiskFactorRiskNormalAntenatal13List;

          this.FetchAssessmentRiskFactorRiskNormalAntenatal2List = response.FetchAssessmentRiskFactorRiskNormalAntenatal2List;
          this.FetchAssessmentRiskFactorRiskNormalAntenatal3List = response.FetchAssessmentRiskFactorRiskNormalAntenatal3List;
          this.FetchAssessmentRiskFactorRiskNormalAntenatal4List = response.FetchAssessmentRiskFactorRiskNormalAntenatal4List;
          this.FetchAssessmentRiskFactorRiskNormalAntenatal5List = response.FetchAssessmentRiskFactorRiskNormalAntenatal5List;
          this.FetchAssessmentRiskFactorRiskNormalAntenatal6List = response.FetchAssessmentRiskFactorRiskNormalAntenatal6List;

          if (Number(this.selectedView.AgeF) > 35) {
            //this.FetchAssessmentRiskFactorRiskNormalAntenatal13List[0].selected = true;
            const age = this.FetchAssessmentRiskFactorRiskNormalAntenatal13List.find((x: any) => x.SectionID == 36);
            if(age) {
              age.selected = true;
            }
          }
          this.showSignature = false; // to load the common component
          setTimeout(() => {
            this.showSignature = true;
          }, 0);
        }
      },
        (err) => {
        })
  }

  FetchVTEWeightEnoxaparinTinzaparin() {
    this.url = this.service.getData(VteAntenatalDetails.FetchVTEWeightEnoxaparinTinzaparin, { UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
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

  FetchPatientFinalVTEForm() {
    this.url = this.service.getData(VteAntenatalDetails.FetchPatientAntenatalVTEForm, { PatientVTEAntenatalID: 0, AdmissionID: this.admissionID, UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatientFinalAntenatalVTEFromPatDataList = response.FetchPatientFinalAntenatalVTEFromPatDataList;
          this.FetchPatientFinalAntenatalVTEFromPatDataList.forEach((element: any, index: any) => {
            element.selected = false;
          });
          this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
          if (this.selectedView.PatientID == undefined) {
            this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
          }
          // this.vteOrderId = this.selectedView.VTEOrderID;
          // if (this.vteOrderId != "" && this.vteOrderId != undefined) {
          //   const vteObgOrder = this.FetchPatientFinalAntenatalVTEFromPatDataList.find((x: any) => x.PatientVTEAntenatalID === this.vteOrderId);
          //   if (vteObgOrder != undefined)
          //     this.selectedAssessment(vteObgOrder);
          // }
        }
      },
        (err) => {
        })
  }

  onNurseItemSelected(item: any) {
    this.employeeList = [];

    const modalRef = this.modalService.open(ValidateEmployeeComponent);
    modalRef.componentInstance.initialData = { UserName: item.EmpNo };
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.vteAntenatalAssessmentForm.patchValue({
          NurseUserName: item.Name,
          NurseID: item.ID
        });
      }
      modalRef.close();
    });
  }

  onDoctorItemSelected(item: any) {
    this.employeeList = [];

    const modalRef = this.modalService.open(ValidateEmployeeComponent);
    modalRef.componentInstance.initialData = { UserName: item.EmpNo };
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.vteAntenatalAssessmentForm.patchValue({
          DoctorUserName: item.Name,
          DoctorID: item.ID
        });
      }
      modalRef.close();
    });
  }

  searchEmployee(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(VteAntenatalDetails.FetchSSEmployees, { name: event.target.value, UserId: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
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

  selectNursingIntervention(value: number) {
    const index = this.nursingInterventions.indexOf(value);
    if (index > -1) {
      this.nursingInterventions.splice(index, 1);
    }
    else {
      this.nursingInterventions.push(value);
    }
  }

  getNursingInterventionVal(item: any) {
    const findVal = this.nursingInterventions?.find((x: any) => x == item);
    if (findVal) {
      return true;
    }
    return false;
  }

  saveAssessment() {
    const modalRef = this.modalService.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.save();
      }
      modalRef.close();
    });
  }

  save(fromVerify: boolean = false) {
    let VTEAntenatalSection: any = [];
    let VTEAntenatalWeightXML: any = [];
    let VTEAntenatalEnoxaparinXML: any = [];
    let VTEAntenatalTinzaparinXML: any = [];

    const allItems = [
      ...this.FetchAssessmentRiskFactorRiskNormalAntenatal11List,
      ...this.FetchAssessmentRiskFactorRiskNormalAntenatal12List,
      ...this.FetchAssessmentRiskFactorRiskNormalAntenatal13List,
      ...this.FetchAssessmentRiskFactorRiskNormalAntenatal2List,
      ...this.FetchAssessmentRiskFactorRiskNormalAntenatal3List,
      ...this.FetchAssessmentRiskFactorRiskNormalAntenatal4List,
      ...this.FetchAssessmentRiskFactorRiskNormalAntenatal5List,
      ...this.FetchAssessmentRiskFactorRiskNormalAntenatal6List
    ];

    allItems.forEach((item: any) => {
      if (item.selected) {
        VTEAntenatalSection.push({
          "SECID": item.SectionID,
          "SUBSECID": "0"
        })
      }
    });

    this.FetchVTEWeightEnoxaparinTinzaparin1List.forEach((item: any) => {
      if (item.selected) {
        VTEAntenatalWeightXML.push({
          "WID": item.WeightID
        })
      }
    });

    this.FetchVTEWeightEnoxaparinTinzaparin2List.forEach((item: any) => {
      if (item.selected) {
        VTEAntenatalEnoxaparinXML.push({
          "ENID": item.EnoxaparinID
        })
      }
    });

    this.FetchVTEWeightEnoxaparinTinzaparin3List.forEach((item: any) => {
      if (item.selected) {
        VTEAntenatalTinzaparinXML.push({
          "TNID": item.TinzaparinID
        })
      }
    });


    var payload = {
      "PatientVTEAntenatalID": this.PatientVTEAntenatalID,
      "PatientID": this.selectedView.PatientID,
      "AdmissionID": this.admissionID,
      "IsAssessment": 0,
      "IsReAssessment": 0,
      "Weight": 0,
      'BMI': 0,
      "NurseID": this.vteAntenatalAssessmentForm.get('NurseID').value,
      "DoctorID": this.vteAntenatalAssessmentForm.get('DoctorID').value,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "HospitalId": this.hospitalID,
      VTEAntenatalSection,
      VTEAntenatalWeightXML,
      VTEAntenatalEnoxaparinXML,
      VTEAntenatalTinzaparinXML,
      "PreparedBy": this.doctorDetails[0].EmpId,
      "IsVerified": this.PatientVTEAntenatalID ? true : false,
      "VerifiedBy": this.PatientVTEAntenatalID ? this.doctorDetails[0].UserId : 0,
      "SpecialiseID": this.selectedView.SpecialiseID,
      "DoctorSignature" : this.vteAntenatalAssessmentForm.get('DoctorSignature')?.value,
      "NurseSignature" : this.vteAntenatalAssessmentForm.get('NurseSignature')?.value,
      "NursingInterventions" : this.nursingInterventions.map((item: any) => item).join(',')
    }

    this.us.post(VteAntenatalDetails.SavePatientVTEAntenatalForm, payload).subscribe((response) => {
      if (response.Status === "Success") {
        if (!fromVerify) {
          this.saveMsg = "VTE Assessment Saved Successfully";
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



  clear() {
    this.PatientVTEAntenatalID = 0;
    this.initializeForm();
    this.FetchVTESectionAntenatal();
    this.FetchVTEWeightEnoxaparinTinzaparin();
    this.FetchPatientFinalVTEForm();
    this.isVerified = false;
    this.showVerify = false;
    this.verifiedUserNameDate = "";
    this.DoctorSignature1 = "";
    this.NurseSignature1 = "";
  }

  selectAssessment(asmnt: any) {
    this.FetchPatientFinalAntenatalVTEFromPatDataList.forEach((element: any, index: any) => {
      if (element.PatientVTEAntenatalID === asmnt.PatientVTEAntenatalID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.selectedVteAssessment = asmnt;
  }

  selectedAssessment(assessment: any) {
    this.url = this.service.getData(VteAntenatalDetails.FetchPatientAntenatalVTEForm, { PatientVTEAntenatalID: assessment.PatientVTEAntenatalID, AdmissionID: this.admissionID, UserId: this.doctorDetails[0].UserId, WorkStationID: this.wardID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          $("#savedModal").modal('hide');
          if (response.FetchPatientFinalAntenatalVTEFromPatDataList.length > 0) {
            this.vteSavedUser = response.FetchPatientFinalAntenatalVTEFromPatDataList[0]?.USERID;
            this.showVerify = true;
            const verifiedUser = response.FetchPatientFinalAntenatalVTEFromPatDataList.find((x: any) => x.PatientVTEAntenatalID === assessment.PatientVTEAntenatalID);
            if (verifiedUser.VerifiedByName != '') {
              this.verifiedUserNameDate = '( Verified By: ' + verifiedUser.VerifiedByName + ' on (' + verifiedUser.VerifiedDate + ') )';
              this.VerifiedByName = verifiedUser.VerifiedByName;
              this.VerifiedDate = verifiedUser.VerifiedDate;
              this.isVerified = true;
              this.isNewVerified = true;
            }
          }
          this.PatientVTEAntenatalID = response.FetchPatientFinalAntenatalVTEFromPatDataList[0].PatientVTEAntenatalID;
          this.vteAntenatalAssessmentForm.patchValue({
            NurseUserName: response.FetchPatientFinalAntenatalVTEFromPatDataList[0].NSEmpNo + "-" + response.FetchPatientFinalAntenatalVTEFromPatDataList[0].NurseName,
            DoctorUserName: response.FetchPatientFinalAntenatalVTEFromPatDataList[0].DEmpNo + "-" + response.FetchPatientFinalAntenatalVTEFromPatDataList[0].DoctorName,
            DoctorDate: this.datePipe.transform(response.FetchPatientFinalAntenatalVTEFromPatDataList[0].DoctorDate, "dd-MMM-yyyy HH:mm")?.toString(),
            NurseDate: new Date(response.FetchPatientFinalAntenatalVTEFromPatDataList[0].NurseDate),
            NurseID: response.FetchPatientFinalAntenatalVTEFromPatDataList[0].NurseID,
            DoctorID: response.FetchPatientFinalAntenatalVTEFromPatDataList[0].DoctorID,
            DoctorSignature: response.FetchPatientFinalAntenatalVTEFromPatDataList[0].DoctorSignature,
            NurseSignature: response.FetchPatientFinalAntenatalVTEFromPatDataList[0].NurseSignature
          });

          this.DoctorSignature1 = response.FetchPatientFinalAntenatalVTEFromPatDataList[0].DoctorSignature;
          this.NurseSignature1 = response.FetchPatientFinalAntenatalVTEFromPatDataList[0].NurseSignature;
          this.showSignature = false;
          setTimeout(() => {
            this.showSignature = true;
          }, 0);

          response.FetchPatientAntenatalVTEFromPatDataList.forEach((patientObg: any) => {
            const sectionID = patientObg.SectionID;
            this.markSectionSelected(sectionID, this.FetchAssessmentRiskFactorRiskNormalAntenatal11List);
            this.markSectionSelected(sectionID, this.FetchAssessmentRiskFactorRiskNormalAntenatal12List);
            this.markSectionSelected(sectionID, this.FetchAssessmentRiskFactorRiskNormalAntenatal13List);
            this.markSectionSelected(sectionID, this.FetchAssessmentRiskFactorRiskNormalAntenatal2List);
            this.markSectionSelected(sectionID, this.FetchAssessmentRiskFactorRiskNormalAntenatal3List);
            this.markSectionSelected(sectionID, this.FetchAssessmentRiskFactorRiskNormalAntenatal4List);
            this.markSectionSelected(sectionID, this.FetchAssessmentRiskFactorRiskNormalAntenatal5List);
            this.markSectionSelected(sectionID, this.FetchAssessmentRiskFactorRiskNormalAntenatal6List);
          });

          response.FetchPatientAntenatalVTEWTFromPatDataList.forEach((patientObg: any) => {
            const section = this.FetchVTEWeightEnoxaparinTinzaparin1List.find((s: any) => s.WeightID === patientObg.WeightID);
            if (section) {
              section.selected = true;
            }
          });

          response.FetchPatientAntenatalVTEEnoFromPatDataList.forEach((patientObg: any) => {
            const section = this.FetchVTEWeightEnoxaparinTinzaparin2List.find((s: any) => s.EnoxaparinID === patientObg.EnoxaparinID);
            if (section) {
              section.selected = true;
            }
          });

          response.FetchPatientAntenatalVTETinzFromPatDataList.forEach((patientObg: any) => {
            const section = this.FetchVTEWeightEnoxaparinTinzaparin3List.find((s: any) => s.TinzaparinID === patientObg.TinzaparinID);
            if (section) {
              section.selected = true;
            }
          });    
          response.FetchPatientFinalAntenatalVTEFromPatDataList[0]?.NursingInterventions.split(',').forEach((element: any) => {
            this.nursingInterventions.push(element);
          });      
        }
      },
        (err) => {
        })
  }

  fetch() {
    this.clear();
    $("#saveMsg").modal('hide');
    this.FetchPatientFinalVTEForm();
  }

  markSectionSelected(sectionID: string, sectionList: any[]) {
    const section = sectionList.find(section => section.SectionID === sectionID);
    if (section) {
      section.selected = true;
    }
  }

  verifyVTEObg() {
    this.isVerified = !this.isVerified;
    if (this.vteSavedUser === this.doctorDetails[0].UserId) {
      this.errorMsg = "Saved user and acknowledge user cannot be same";
      this.isVerified = !this.isVerified;
      $("#showCCValidationMsg").modal('show');
      return;
    }
    var paylod = {
      "RiskAssessmentOrderID": this.PatientVTEAntenatalID,
      "IsVerified": true,
      "VerifiedBy": this.doctorDetails[0].UserId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.wardID,
      "HospitalID": this.hospitalID
    }
    this.us.post(VteAntenatalDetails.UpdateRiskAssessmentOBGVerifications, paylod).subscribe((response) => {
      if (response.Status === "Success") {
        this.saveMsg = "VTE Risk Assessment Acknowledged Successfully";
        $("#saveMsg").modal('show');
      }
    },
      (err) => {

      })
  }

  base64DoctorSignature(event: any) {
    this.vteAntenatalAssessmentForm.patchValue({ DoctorSignature: event });
  }

  base64NurseSignature(event: any) {
    this.vteAntenatalAssessmentForm.patchValue({ NurseSignature: event });
  }

  clearDoctorSignature() {
    if (this.DoctorSignature) {
      this.DoctorSignature.clearSignature();     
      this.vteAntenatalAssessmentForm.patchValue({ DoctorSignature: '' });
    }
  }
  clearNurseSignature() {
    if (this.NurseSignature) {
      this.NurseSignature.clearSignature();     
      this.vteAntenatalAssessmentForm.patchValue({ NurseSignature: '' });
    }
  }

  fetchPatientHeightWeight() {
      this.url = this.service.getData(VteAntenatalDetails.FetchPatientHeightWeight, { PatientID: this.selectedView.PatientID });
      this.us.post(this.url, {})
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.vteAntenatalAssessmentForm.patchValue({
              patientBmi: response.SmartDataList[0].BMI.split('-')[0],
              Weight: response.SmartDataList[0].Weight
            });
            if(this.FetchAssessmentRiskFactorRiskNormalAntenatal13List.length > 0) {
              const ptBmi = response.SmartDataList[0].BMI.split('-')[0];
              if(Number(ptBmi) >= 30) {
                const obese3list= this.FetchAssessmentRiskFactorRiskNormalAntenatal13List.find((x: any) => x.SectionID == 35);
                obese3list.selected = true;
              }
              else if(Number(ptBmi) >= 40) {
                const obese2list= this.FetchAssessmentRiskFactorRiskNormalAntenatal13List.find((x: any) => x.SectionID == 30);
                obese2list.selected = true;
              }
            }
          }
        },
          (err) => {
          })
    }

  fetchRiskLevel(type: any) {
    if(type === 1) {
      if(this.FetchAssessmentRiskFactorRiskNormalAntenatal11List.filter((x: any) => x.selected).length > 0) {
        return true;
      }
      else {
        return false;
      }
    }
    else if(type === 2) {
      if(this.FetchAssessmentRiskFactorRiskNormalAntenatal12List.filter((x: any) => x.selected).length > 0) {
        return true;
      }
      else {
        return false ;
      }
    }
    else if(type === 3) {
      if(this.FetchAssessmentRiskFactorRiskNormalAntenatal13List.filter((x: any) => x.SectionID == '44' && x.selected).length > 0) {
        return true;
      }      
      else {
        return false;
      }      
    }
    else if(type === 4) {
      if(this.FetchAssessmentRiskFactorRiskNormalAntenatal13List.filter((x: any) => x.selected).length > 0 
        && this.FetchAssessmentRiskFactorRiskNormalAntenatal13List.filter((x: any) => x.selected).length < 3) {
        return true;
      }
      else {
        return false;
      } 
    }
    return false;
  }

  selectw1List(item1: any) {
    this.FetchVTEWeightEnoxaparinTinzaparin1List.forEach((ele1: any, index: any) => {
      if (ele1.WeightID === item1.WeightID) {
        ele1.selected = true;
      }
      else {
        ele1.selected = false;
      }
    });
  }
  selectw2List(item2: any) {
    this.FetchVTEWeightEnoxaparinTinzaparin2List.forEach((ele2: any, index: any) => {
      if (ele2.EnoxaparinID === item2.EnoxaparinID) {
        ele2.selected = true;
      }
      else {
        ele2.selected = false;
      }
    });
  }
  selectw3List(item3: any) {
    this.FetchVTEWeightEnoxaparinTinzaparin3List.forEach((ele3: any, index: any) => {
      if (ele3.TinzaparinID === item3.TinzaparinID) {
        ele3.selected = true;
      }
      else {
        ele3.selected = false;
      }
    });
  }
}
