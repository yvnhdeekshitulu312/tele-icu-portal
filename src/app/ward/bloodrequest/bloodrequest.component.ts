import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService as BedConfig } from '../services/config.service';
import { ConfigService } from 'src/app/services/config.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
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
  selector: 'app-bloodrequest',
  templateUrl: './bloodrequest.component.html',
  styleUrls: ['./bloodrequest.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe,
  ],
})


export class BloodrequestComponent implements OnInit {
  isdetailShow = false;
  langData: any;
  facility: any;
  IsFromBedsBoard: any;
  doctorDetails: any;
  hospId: any;
  selectedView: any;
  patientDetails: any;
  SelectedViewClass: any;
  admissionID: any;
  currentdate: any;
  bloodRequestForm: any;
  bloodGroupsMaster: any;
  indicationTransfusionMaster: any;
  latestBloodRequestData: any;
  earlierDetectsData: any;
  bloodComponentsData: any;
  selectedBloodComponents: any = [];
  selectedEarlierDetects: any = [];
  routine: string = "btn selected";
  stat: string = "btn";
  emergency: string = "btn";
  surgery: string = "btn selected";
  therapeutic: string = "btn";
  transfusionHistoryYes: string = "btn ";
  transfusionHistoryNo: string = "btn selected";
  transfusionHistoryReactionYes: string = "btn ";
  transfusionHistoryReactionNo: string = "btn selected";
  witnessNurseData: any;
  witnessDoctorData: any;
  isBloodRequestFormSubmitted: boolean = false;
  sampleCollected: string = "custom_check d-flex align-items-center gap-2";
  viewBloodRequestsForm!: FormGroup;
  viewBloodRequestsData: any;
  selectedBloodOrderData: any;
  patientDiagnosis: any;
  validationMsg: any;
  isSampleCollected = false;
  @Input() fromCaseSheet = false;
  endofEpisode: boolean = false;
  IsAdult: boolean = false;
  admitDate: any;
  readonly: any = false;
  errorMessages: any = [];
  @Input() data: any;
  enableDelete: boolean = false;

  @ViewChild('Sign1Ref', { static: false }) signComponent1: SignatureComponent | undefined;
  @ViewChild('Sign2Ref', { static: false }) signComponent2: SignatureComponent | undefined;
  @ViewChild('Sign3Ref', { static: false }) signComponent3: SignatureComponent | undefined;

  base64StringSig1 = '';
  base64StringSig2 = '';
  base64StringSig3 = '';
  showSignature: boolean = true;

  constructor(private datePipe: DatePipe, private fb: FormBuilder, private portalconfig: ConfigService, private config: BedConfig, private router: Router, private con: ConfigService, public datepipe: DatePipe, private changeDetectorRef: ChangeDetectorRef, private modalSvc: NgbModal, private us: UtilityService) {
    this.langData = this.con.getLangData();
  }
  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.IsFromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospId = sessionStorage.getItem("hospitalId");
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');

    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');

    if (this.selectedView.PatientID === undefined || this.selectedView.PatientType === '3') {
      this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
      this.selectedView.IPID = this.selectedView.AdmissionID;
    }
    if (sessionStorage.getItem("ISEpisodeclose") === "true") {
      this.endofEpisode = true;
    } else {
      this.endofEpisode = false;
    }
    this.admissionID = this.selectedView.IPID;
    if (this.selectedView.PatientType === '1')
      this.IsAdult = Number(this.patientDetails.Age) >= 14 && Number(this.patientDetails.AgeUoMID) === 1 ? true : false;
    else if (this.selectedView.PatientType === '3')
      this.IsAdult = Number(this.patientDetails.AgeF) >= 14 && Number(this.patientDetails.AGeUOMID) === 1 ? true : false;
    else
      this.IsAdult = Number(this.selectedView.AgeValue) >= 14 && Number(this.selectedView.AgeUOMID) === 1 ? true : false;
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY H:mm');
    this.admitDate = new Date(this.selectedView?.AdmitDate?.split(' ')[0]);
    this.initiateBloodRequestForm();
    this.fetchBloodGroups();
    this.fetchIndicationTransfusion();
    this.fetchPatientDiagnosis();
    this.fetchLatestBloodResult();
    this.initializeviewBloodRequestsForm();
    this.searchBloodComponents();
    if (this.selectedView.PatientType == "2") {
      if (this.selectedView.Bed.includes('ISO'))
        this.SelectedViewClass = "bed-number col-11 iso-color-bg-primary-100 my-1 py-1";
      else
        this.SelectedViewClass = "bed-number col-11 my-1 py-1";
    } else {
      this.SelectedViewClass = "bed-number col-11 my-1 py-1";
    }

    this.bloodRequestForm.patchValue({
      currentdate: this.currentdate
    });

    if (this.data) {
      this.readonly = this.data.readonly;
      this.fetchBloodRequestData(this.data.data);
    } else {
    }

  }
  initializeviewBloodRequestsForm() {
    this.viewBloodRequestsForm = this.fb.group({
      fromdate: [''],
      todate: ['']
    });
  }
  initiateBloodRequestForm() {
    this.bloodRequestForm = this.fb.group({
      currentdate: [''],
      bloodCompName: [''],
      earlierDetectsName: [''],
      Diagnosis: [''],
      BloodorderID: [''],
      BloodGroupID: ['', Validators.required],
      Transfusiontype: ['0'],
      RequestType: ['1'],
      ClinicalDiagNosis: [''],
      HB: [''],
      Platelets: [''],
      wbc: [''],
      RBC: [''],
      pt: [''],
      aptt: [''],
      pttk: [''],
      pcv: [''],
      others: [''],
      //BLdetail: this.fb.array([]),
      BLdetail: this.fb.group({
        CID: [''],
        QTY: [''],
        RDT: [''],
      }),
      BLEdetect: [''],
      TransferID: [''],
      Status: [''],
      WardRemarks: [''],
      IsSampleCollected: ['0'],
      SampleCollectedDateTime: [''],
      TransfusionDateTime: [''],
      ReactionDate: [''],
      ReactionRemarks: [''],
      TransfusionID: ['', Validators.required],
      OrderPackID: [''],
      HCT: [''],
      MCV: [''],
      MCH: [''],
      INR: [''],
      WardPhoneNumber: [''],
      WitnessNurse1ID: ['', this.selectedView.PatientType == '1' ? null : Validators.required],
      WitnessNurse1Name: [''],
      WitnessNurse2ID: ['', this.selectedView.PatientType == '1' ? null : Validators.required],
      WitnessNurse2Name: [''],
      WitnessDoctor1ID: ['', this.selectedView.PatientType == '1' ? null : Validators.required],
      WitnessDoctor1Name: ['', this.selectedView.PatientType == '1' ? null : Validators.required],
      Signature1: '',
      Signature2: '',
      Signature3: '',
      WitnessNurse1Date: moment(),
      WitnessNurse2Date: moment(),
      WitnessDoctorDate: moment(),
      WitnessNurse1Time: this.setCurrentTime(),
      WitnessNurse2Time: this.setCurrentTime(),
      WitnessDoctorTime: this.setCurrentTime()
    });
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

  changeRequestType(type: string) {
    if (type == "routine") {
      this.routine = "btn selected";
      this.stat = "btn";
      this.emergency = "btn";
      this.bloodRequestForm.get('RequestType')?.setValue('1');
    }
    else if (type == "stat") {
      this.routine = "btn";
      this.stat = "btn selected";
      this.emergency = "btn";
      this.bloodRequestForm.get('RequestType')?.setValue('2');
    } else {
      this.routine = "btn";
      this.stat = "btn";
      this.emergency = "btn selected";
      this.bloodRequestForm.get('RequestType')?.setValue('3');
    }
  }
  changeTransfusionType(type: string) {
    if (type == "surgery") {
      this.surgery = "btn selected";
      this.therapeutic = "btn";
      this.bloodRequestForm.get('Transfusiontype')?.setValue('0');
    }
    else {
      this.surgery = "btn";
      this.therapeutic = "btn selected";
      this.bloodRequestForm.get('Transfusiontype')?.setValue('1');
    }
  }
  changeTransfusionHistory(type: string) {
    if (type == "Yes") {
      this.transfusionHistoryYes = "btn selected";
      this.transfusionHistoryNo = "btn";
      // this.bloodRequestForm.patchValue({
      //   TransfusionDateTime: new Date()
      // })
    }
    else {
      this.transfusionHistoryYes = "btn";
      this.transfusionHistoryNo = "btn selected";
      this.bloodRequestForm.patchValue({
        TransfusionDateTime: ''
      })
    }
  }
  changeTransfusionHistoryReaction(type: string) {
    if (type == "Yes") {
      this.transfusionHistoryReactionYes = "btn selected";
      this.transfusionHistoryReactionNo = "btn";
      // this.bloodRequestForm.patchValue({
      //   ReactionDate: new Date()
      // })
    }
    else {
      this.transfusionHistoryReactionYes = "btn";
      this.transfusionHistoryReactionNo = "btn selected";
      this.bloodRequestForm.patchValue({
        ReactionDate: ''
      })
    }
  }
  fetchBloodGroups() {
    this.config.fetchBloodGroups(this.hospId).subscribe((response) => {
      // IsLab -> 0 -> Radiology
      if (response.Status === "Success") {
        this.bloodGroupsMaster = response.SurgeryDemographicsDataaList;

      }
    },
      (err) => {

      })
  }
  navigatetoBedBoard() {
    this.router.navigate(['/ward']);
  }
  fetchIndicationTransfusion() {
    this.config.fetchIndicationTransfusion(this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.indicationTransfusionMaster = response.SmartDataList;

      }
    },
      (err) => {

      })
  }
  fetchPatientDiagnosis() {
    this.portalconfig.fetchAdviceDiagnosis(this.admissionID, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          var diag = "";
          response.PatientDiagnosisDataList.forEach((element: any, index: any) => {
            if (diag != "")
              diag = diag + "\n" + response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
            else
              diag = response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
          });
          this.bloodRequestForm.get('Diagnosis')?.setValue(diag);
        }
      },
        (err) => {

        })
  }
  fetchLatestBloodResult() {
    this.config.fetchLatestBloodResult(this.selectedView.PatientID, this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.latestBloodRequestData = response.FetchLatestBloodResultDataaList;
        this.bloodRequestForm.get('HB')?.setValue(response.FetchLatestBloodResultDataaList.find((x: any) => x.BloodRequestParameters == "PCV")?.Value);
        this.bloodRequestForm.get('aptt')?.setValue(response.FetchLatestBloodResultDataaList.find((x: any) => x.BloodRequestParameters == "aPTT")?.Value);
        this.bloodRequestForm.get('Platelets')?.setValue(response.FetchLatestBloodResultDataaList.find((x: any) => x.BloodRequestParameters == "Platelets")?.Value);
        this.bloodRequestForm.get('pt')?.setValue(response.FetchLatestBloodResultDataaList.find((x: any) => x.BloodRequestParameters == "PT")?.Value);
        this.bloodRequestForm.get('RBC')?.setValue(response.FetchLatestBloodResultDataaList.find((x: any) => x.BloodRequestParameters == "R.B.C")?.Value);
        this.bloodRequestForm.get('wbc')?.setValue(response.FetchLatestBloodResultDataaList.find((x: any) => x.BloodRequestParameters == "W.B.C")?.Value);
      }
    },
      (err) => {

      })
  }
  searchEarlierDetects(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.config.fetchEarlierDefects(filter, this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.earlierDetectsData = response.GetMasterDataList;
          }
        },
          (err) => {

          })
    }
    else {
      this.earlierDetectsData = [];
    }
  }
  onEarlierDetectsSelected(item: any) {
    this.bloodRequestForm.get('earlierDetectsName')?.setValue('');
    this.selectedEarlierDetects.push({
      Component: item.name,
      EDD: item.id
    })
  }

  searchBloodComponents(event: any = null) {
    //if (event.target.value.length >= 3) {
    var filter = '%%%'; //event.target.value;
    this.config.fetchBloodComponents(filter, this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.bloodComponentsData = response.FetchBloodComponentsDataaList;
        }
      },
        (err) => {

        })
    // }
    // else {
    //   this.bloodComponentsData = [];
    // }
  }
  onBloodComponentsSelected(event: any, item: any) {
    if (event.isUserInput && event.source.selected) {
      this.bloodRequestForm.get('bloodCompName')?.setValue('');
      this.selectedBloodComponents.push({
        Component: item.Component,
        CID: item.ComponentID,
        Qty: "",
        Volume: "",
        RDT: this.datepipe.transform(new Date(), "yyyy-MM-dd"),
        RMK: ""
        // DEPARTMENTID: item.DepartmentId === '' ? 0 : item.DepartmentId,
        // SPEID: item.SPEID === '' ? 0 : item.SpecialisationId
      })
    }
  }
  searchWitnessNurse(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.config.fetchWitnessNurse(filter, this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.witnessNurseData = response.FetchRODNursesDataList;
          }
        },
          (err) => {

          })
    }
    else {
      this.witnessNurseData = [];
    }
  }
  onWitnessNurseSelected(item: any, nurse: string) {
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.initialData = { UserName: item.EmpNo };
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        if (nurse == "nurse1") {
          this.bloodRequestForm.get('WitnessNurse1ID')?.setValue(item.Empid);
          this.bloodRequestForm.get('WitnessNurse1Name')?.setValue(item.EmpNo + '-' + item.Fullname);
        }
        else {
          this.bloodRequestForm.get('WitnessNurse2ID')?.setValue(item.Empid);
          this.bloodRequestForm.get('WitnessNurse2Name')?.setValue(item.EmpNo + '-' + item.Fullname);
        }
      }
      else {
        if (nurse == "nurse1") {
          this.bloodRequestForm.get('WitnessNurse1ID')?.setValue('');
          this.bloodRequestForm.get('WitnessNurse1Name')?.setValue('');
        }
        else {
          this.bloodRequestForm.get('WitnessNurse2ID')?.setValue('');
          this.bloodRequestForm.get('WitnessNurse2Name')?.setValue('');
        }
      }
      modalRef.close();
    });
  }
  searchWitnessDoctor(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.config.fetchWitnessDoctor(filter, this.hospId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.witnessDoctorData = response.FetchRODNursesDataList;
          }
        },
          (err) => {

          })
    }
  }
  onWitnessDoctorSelected(item: any) {
    const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
    modalRef.componentInstance.initialData = { UserName: item.EmpNo };
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.bloodRequestForm.get('WitnessDoctor1ID')?.setValue(item.Empid);
        this.bloodRequestForm.get('WitnessDoctor1Name')?.setValue(item.EmpNo + '-' + item.Fullname);
      }
      else {
        this.bloodRequestForm.get('WitnessDoctor1ID')?.setValue('');
        this.bloodRequestForm.get('WitnessDoctor1Name')?.setValue('');
      }
      modalRef.close();
    });
  }

  formSelectedBloodComponentsArray() {
  }

  onBlurBcQty(index: any, event: any, item: any) {
    this.selectedBloodComponents[index].Qty = event.target.value;
  }
  onBlurBcVolume(index: any, event: any, item: any) {
    this.selectedBloodComponents[index].Volume = event.target.value;
  }
  onBlurBcRMRK(index: any, event: any, item: any) {
    this.selectedBloodComponents[index].RMK = event.target.value;
  }
  onReqDateChange(index: any, event: any, item: any) {
    this.selectedBloodComponents[index].RDT = this.datepipe.transform(event.target.value, "dd-MMM-yyyy")?.toString();
  }
  saveBloodRequest() {
    this.errorMessages = [];
    this.isBloodRequestFormSubmitted = true;
    let selectedBc;
    if (this.IsAdult) {
      selectedBc = this.selectedBloodComponents.filter((x: any) => !x.Qty);
    } else {
      selectedBc = this.selectedBloodComponents.filter((x: any) => !x.Qty || x.Volume == "");
    }
    if (this.transfusionHistoryYes.trim() === 'btn selected' && !this.bloodRequestForm.get('TransfusionDateTime').value) {
      $("#noBloodComponentsSelected").modal('show');
      this.validationMsg = 'Please select Transfusion Date';
      return;
    }

    if (this.transfusionHistoryReactionYes.trim() === 'btn selected' && !this.bloodRequestForm.get('ReactionDate').value) {
      $("#noBloodComponentsSelected").modal('show');
      this.validationMsg = 'Please select Reaction Date';
      return;
    }
    if (this.bloodRequestForm.valid && this.selectedBloodComponents.length > 0 && selectedBc.length == 0) {
      const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
      modalRef.componentInstance.dataChanged.subscribe((data: any) => {
        if (data.success) {
          this.saveData();
        }
        modalRef.close();
      });
    }
    else {
      if(!this.bloodRequestForm.get('BloodGroupID').value) {
      this.errorMessages.push("Please enter Blood Group");
    } 
    if(!this.bloodRequestForm.get('TransfusionID').value) {
      this.errorMessages.push("Please enter Transfusion Indication");
    } 
      
    if(!this.bloodRequestForm.get('WitnessNurse1ID').value) {
      this.errorMessages.push("Please enter Witness Nurse 1");
    } 
    if(this.bloodRequestForm.get('Signature1')?.value=='') {
      this.errorMessages.push("Please enter Witness Nurse 1 Signature");
    }
     if(!this.bloodRequestForm.get('WitnessNurse2Name').value) {
      this.errorMessages.push("Please enter Witness Nurse 2");
    } 
    if(this.bloodRequestForm.get('Signature2')?.value=='') {
      this.errorMessages.push("Please enter Witness Nurse 2 Signature");
    }
     if(!this.bloodRequestForm.get('WitnessDoctor1Name').value) {
      this.errorMessages.push("Please enter Witness Doctor");
    } 
    if(this.bloodRequestForm.get('Signature3')?.value=='') {
      this.errorMessages.push("Please enter Witness Doctor Signature");
    }

      if (this.selectedBloodComponents.length == 0) {
        // this.validationMsg = "Please select atleast one Blood Component";
        // $("#noBloodComponentsSelected").modal('show');
         this.errorMessages.push("Please select atleast one Blood Component");
      }
      else if (this.selectedBloodComponents.length > 0 && selectedBc.length > 0) {
        // this.validationMsg = "Please enter Units/Volume for Blood Components selected";
        // $("#noBloodComponentsSelected").modal('show');
         this.errorMessages.push("Please select atleast one Blood Component");
      }

     if (this.errorMessages.length > 0) {
      $("#noBloodComponentsSelected").modal('show');
      return;
    }
    }
  }

  saveData() {
    var bldetails: any = [];
    var eardet: any = [];
    this.selectedBloodComponents.forEach((element: any) => {
      let bloodcomp = {
        "Component": element.Component,
        "CID": element.CID,
        "QTY": element.Qty,
        "VM": element.Volume,
        "RDT": moment(element.RDT).format("DD-MMM-YYYY"),
        "CNAME": element.Component,
        "RMK": element.RMK
      }
      bldetails.push(bloodcomp);
    });

    this.selectedEarlierDetects.forEach((element: any) => {
      let bloodcomp = {
        "Component": element.Component,
        "EDD": element.EDD
      }
      eardet.push(bloodcomp);
    });

    let status = -1;
    if (this.selectedView.PatientType == '3') {
      if (this.selectedView.CTASSCore == 1 || this.selectedView.CTASSCore == 2 || this.selectedView.CTASSCore == 3) {
        status = 0;
      }
    }

    let brPayload =
    {
      "BloodorderID": this.bloodRequestForm.get('BloodorderID')?.value == "" ? "0" : this.bloodRequestForm.get('BloodorderID')?.value,
      "IPID": this.admissionID,
      "OrderBedID": this.selectedView.BedID,
      "DoctorID": this.doctorDetails[0].EmpId,
      "BloodGroupID": this.bloodRequestForm.get('BloodGroupID')?.value,
      "Transfusiontype": this.bloodRequestForm.get('Transfusiontype')?.value,
      "RequestType": this.bloodRequestForm.get('RequestType')?.value,
      "ClinicalDiagNosis": this.bloodRequestForm.get('Diagnosis')?.value,
      "HB": this.bloodRequestForm.get('HB')?.value == "" ? 0 : this.bloodRequestForm.get('HB')?.value,
      "Platelets": this.bloodRequestForm.get('Platelets')?.value == "" ? 0 : this.bloodRequestForm.get('Platelets')?.value,
      "wbc": this.bloodRequestForm.get('wbc')?.value == "" ? 0 : this.bloodRequestForm.get('wbc')?.value,
      "RBC": this.bloodRequestForm.get('RBC')?.value == "" ? 0 : this.bloodRequestForm.get('RBC')?.value,
      "pt": this.bloodRequestForm.get('pt')?.value == "" ? 0 : this.bloodRequestForm.get('pt')?.value,
      "aptt": this.bloodRequestForm.get('aptt')?.value == "" ? 0 : this.bloodRequestForm.get('aptt')?.value,
      "pttk": this.bloodRequestForm.get('pttk')?.value == "" ? 0 : this.bloodRequestForm.get('pttk')?.value,
      "pcv": this.bloodRequestForm.get('pcv')?.value == "" ? 0 : this.bloodRequestForm.get('pcv')?.value,
      "others": this.bloodRequestForm.get('others')?.value == "" ? 0 : this.bloodRequestForm.get('others')?.value,
      "BLdetail": bldetails,
      "BLEdetect": eardet,
      "UserID": this.doctorDetails[0].EmpId,
      "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      "Hospitalid": this.hospId,
      "Indications": "",
      "TransferID": this.bloodRequestForm.get('TransferID')?.value == "" ? "0" : this.bloodRequestForm.get('TransferID')?.value,
      "Status": this.selectedView.PatientType === '2' ? 0 : status,
      "PatientType": this.selectedView.PatientType,
      "PatientId": this.selectedView.PatientID,
      "WardRemarks": "",
      "IsSampleCollected": 1,
      "SampleCollectedDateTime": this.datepipe.transform(this.bloodRequestForm.get('SampleCollectedDateTime')?.value, "dd-MMM-yyyy")?.toString(),
      "TransfusionDateTime": this.datepipe.transform(this.bloodRequestForm.get('TransfusionDateTime')?.value, "dd-MMM-yyyy")?.toString(),
      "ReactionDate": this.datepipe.transform(this.bloodRequestForm.get('ReactionDate')?.value, "dd-MMM-yyyy")?.toString(),
      "ReactionRemarks": this.bloodRequestForm.get('ReactionRemarks')?.value,
      "TransfusionID": this.bloodRequestForm.get('TransfusionID')?.value,
      "OrderPackID": this.bloodRequestForm.get('OrderPackID')?.value == "" ? 0 : this.bloodRequestForm.get('OrderPackID')?.value,
      "HCT": this.bloodRequestForm.get('HCT')?.value == "" ? 0 : this.bloodRequestForm.get('HCT')?.value,
      "MCV": this.bloodRequestForm.get('MCV')?.value == "" ? 0 : this.bloodRequestForm.get('MCV')?.value,
      "MCH": this.bloodRequestForm.get('MCH')?.value == "" ? 0 : this.bloodRequestForm.get('MCH')?.value,
      "INR": this.bloodRequestForm.get('INR')?.value == "" ? 0 : this.bloodRequestForm.get('INR')?.value,
      "WardPhoneNumber": this.bloodRequestForm.get('WardPhoneNumber')?.value === '' ? 0 : this.bloodRequestForm.get('WardPhoneNumber')?.value,
      "WitnessNurse1ID": this.bloodRequestForm.get('WitnessNurse1ID')?.value === '' ? 0 : this.bloodRequestForm.get('WitnessNurse1ID')?.value,
      "WitnessNurse2ID": this.bloodRequestForm.get('WitnessNurse2ID')?.value === '' ? 0 : this.bloodRequestForm.get('WitnessNurse2ID')?.value,
      "WitnessDoctor1ID": this.bloodRequestForm.get('WitnessDoctor1ID')?.value === '' ? 0 : this.bloodRequestForm.get('WitnessDoctor1ID')?.value,
      "BillType": this.selectedView.BillType === 'Insured' ? 'CR' : 'CS',
      "CompanyID": this.selectedView.CompanyID === '' ? 0 : this.selectedView.CompanyID,
      "GradeID": this.selectedView.GradeID,
      "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
      "LetterID": this.selectedView.LetterID,
      "InsuranceCompanyID": this.selectedView.InsuranceCompanyID,
      "EntryId": 0,
      "IsFollowup": this.selectedView.OrderTypeID === '50' ? 1 : 0,
      "MonitorID": this.selectedView.MonitorID == '' ? 0 : this.selectedView.MonitorID,
      "BillID": this.selectedView.BillID,
      WitnessNurse1Signature: this.bloodRequestForm.get('Signature1')?.value,
      WitnessNurse1DateTime: `${this.bloodRequestForm.get('WitnessNurse1Date').value.format('DD-MMM-YYYY')} ${this.bloodRequestForm.get('WitnessNurse1Time').value}`,
      WitnessNurse2Signature: this.bloodRequestForm.get('Signature2')?.value,
      WitnessNurse2DateTime: `${this.bloodRequestForm.get('WitnessNurse2Date').value.format('DD-MMM-YYYY')} ${this.bloodRequestForm.get('WitnessNurse2Time').value}`,
      WitnessDoctorSignature: this.bloodRequestForm.get('Signature3')?.value,
      WitnessDoctorDateTime: `${this.bloodRequestForm.get('WitnessDoctorDate').value.format('DD-MMM-YYYY')} ${this.bloodRequestForm.get('WitnessDoctorTime').value}`,
    }
    this.config.savePatientBloodorderData(brPayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#bloodRequestSaveMsg").modal('show');
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }
  changeSampleCollected() {
    if (this.sampleCollected == "custom_check d-flex align-items-center gap-2") {
      this.sampleCollected = "custom_check d-flex align-items-center gap-2 active";
      this.bloodRequestForm.get('IsSampleCollected')?.setValue(1);
    }
    else {
      this.sampleCollected = "custom_check d-flex align-items-center gap-2";
      this.bloodRequestForm.get('IsSampleCollected')?.setValue(0);
    }
  }
  FetchViewBloodRequests() {
    var FromDate = this.datepipe.transform(this.viewBloodRequestsForm.value['fromdate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.viewBloodRequestsForm.value['todate'], "dd-MMM-yyyy")?.toString();
    this.config.fetchBloodRequest(this.selectedView.PatientID, FromDate, ToDate, this.hospId).subscribe((response) => {
      if (response.Status === "Success") {
        this.viewBloodRequestsData = response.FetchBloodRequestDDataaList;

      }
    },
      (err) => {

      })
  }
  openViewBloodRequestsPopup() {
    var wm = new Date();
    wm.setDate(wm.getDate() - 30);
    this.viewBloodRequestsForm?.patchValue({
      fromdate: wm,
      todate: new Date()
    })
    $("#viewBloodRequests").modal('show');
    this.FetchViewBloodRequests();
  }
  fetchBloodRequestData(view: any) {
    var FromDate = this.datepipe.transform(this.viewBloodRequestsForm.value['fromdate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.viewBloodRequestsForm.value['todate'], "dd-MMM-yyyy")?.toString();
    this.config.fetchBloodRequestSelected(view.BloodOrderID, this.hospId).subscribe((response) => {
      if (response.Status === "Success" && response.FetchBloodRequestSelectedDDataaList.length > 0) {
        $("#viewBloodRequests").modal('hide');
        this.admissionID = response.FetchBloodRequestSelectedDDataaList[0]?.IPID;
        this.selectedBloodOrderData = response.FetchBloodRequestSelectedDDataaList;
        if(this.selectedBloodOrderData.length > 0 && view.Status == '0') {
          this.enableDelete = true;
        }
        else {
          this.enableDelete = false;
        }
        this.fetchPatientDiagnosis();
        if (response.FetchBloodRequestSelectedDDataaList[0]?.RequestType == "1") {
          this.routine = "btn selected";
          this.stat = "btn";
          this.emergency = "btn";
        } else if (response.FetchBloodRequestSelectedDDataaList[0]?.RequestType == "2") {
          this.routine = "btn";
          this.stat = "btn selected";
          this.emergency = "btn";
        } else {
          this.routine = "btn";
          this.stat = "btn";
          this.emergency = "btn selected";
        }
        if (response.FetchBloodRequestSelectedDDataaList[0]?.Transfusiontype == "False") { this.surgery = "btn selected"; this.therapeutic = "btn"; }
        else { this.surgery = "btn"; this.therapeutic = "btn selected"; }
        if (response.FetchBloodRequestSelectedDDataaList[0]?.IsSampleCollected == "YES") { this.sampleCollected = "custom_check d-flex align-items-center gap-2 active"; }
        else { this.sampleCollected = "custom_check d-flex align-items-center gap-2"; }
        this.bloodRequestForm.get('RequestType')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.RequestType);
        this.bloodRequestForm.get('BloodorderID')?.setValue(view.BloodOrderID);
        this.bloodRequestForm.get('BloodGroupID')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.BloodGroupID);
        this.bloodRequestForm.get('TransfusionID')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.TransfusionIndicationID);
        this.bloodRequestForm.get('Diagnosis')?.setValue("");
        this.bloodRequestForm.get('HB')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.HB);
        this.bloodRequestForm.get('aptt')?.setValue("");
        this.bloodRequestForm.get('Platelets')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.Platelets);
        this.bloodRequestForm.get('pt')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.pt);
        this.bloodRequestForm.get('wbc')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.wbc);
        this.bloodRequestForm.get('others')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.others);
        this.bloodRequestForm.get('RBC')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.BloodGroupID);
        this.bloodRequestForm.get('pcv')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.pcv);
        this.bloodRequestForm.get('HCT')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.HCT);
        this.bloodRequestForm.get('MCV')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.MCV);
        this.bloodRequestForm.get('MCH')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.MCH);
        this.bloodRequestForm.get('INR')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.INR);
        this.bloodRequestForm.get('SampleCollectedDateTime')?.setValue(this.datepipe.transform(response.FetchBloodRequestSelectedDDataaList[0]?.SampleCollectedDateTime, "yyyy-MM-dd"));
        this.bloodRequestForm.get('TransfusionDateTime')?.setValue(this.datepipe.transform(response.FetchBloodRequestSelectedDDataaList[0]?.TransfusionDateTime, "yyyy-MM-dd"));
        this.bloodRequestForm.get('ReactionDate')?.setValue(this.datepipe.transform(response.FetchBloodRequestSelectedDDataaList[0]?.ReactionDate, "yyyy-MM-dd"));
        this.bloodRequestForm.get('WitnessDoctor1ID')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessDoctor1ID);
        this.bloodRequestForm.get('WitnessDoctor1Name')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessDoctor1);
        this.bloodRequestForm.get('WitnessNurse1ID')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessNurse1ID);
        this.bloodRequestForm.get('WitnessNurse1Name')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessNurse1);
        this.bloodRequestForm.get('WitnessNurse2ID')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessNurse2ID);
        this.bloodRequestForm.get('WitnessNurse2Name')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessNurse2);
        this.bloodRequestForm.get('currentdate')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.RequestDatetime);

        this.bloodRequestForm.get('Signature1')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessNurse1Signature);
        this.bloodRequestForm.get('Signature2')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessNurse2Signature);
        this.bloodRequestForm.get('Signature3')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessDoctorSignature);

        this.base64StringSig1 = response.FetchBloodRequestSelectedDDataaList[0]?.WitnessNurse1Signature;
        this.base64StringSig2 = response.FetchBloodRequestSelectedDDataaList[0]?.WitnessNurse2Signature;
        this.base64StringSig3 = response.FetchBloodRequestSelectedDDataaList[0]?.WitnessDoctorSignature;

        this.bloodRequestForm.get('WitnessNurse1Date')?.setValue(moment(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessNurse1DateTime.split(' ')[0]));
        this.bloodRequestForm.get('WitnessNurse1Time')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessNurse1DateTime.split(' ')[1]);

        this.bloodRequestForm.get('WitnessNurse2Date')?.setValue(moment(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessNurse2DateTime.split(' ')[0]));
        this.bloodRequestForm.get('WitnessNurse2Time')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessNurse2DateTime.split(' ')[1]);

        this.bloodRequestForm.get('WitnessDoctorDate')?.setValue(moment(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessDoctorDateTime.split(' ')[0]));
        this.bloodRequestForm.get('WitnessDoctorTime')?.setValue(response.FetchBloodRequestSelectedDDataaList[0]?.WitnessDoctorDateTime.split(' ')[1]);

        this.selectedBloodComponents = [];
        response.FetchBloodRequestComponentDataDataaList.forEach((element: any, index: any) => {
          this.selectedBloodComponents.push({
            "Component": element.Component,
            "CID": element.ComponentID,
            "Qty": element.Quantity,
            "Volume": element.Volume,
            "RMK": element.Remarks,
            "RDT": this.datepipe.transform(element.RequiredDate, "yyyy-MM-dd")
          })
        });

        response.FetchBloodRequestDefectsDataaList.forEach((element: any, index: any) => {
          this.selectedEarlierDetects.push({
            "Component": element.EarlierDetect,
            "EDD": element.EarlierDetectID
          })
        });

      }
    },
      (err) => {

      })
  }
  clearBloodRequestForm() {
    this.base64StringSig1 = '';
    this.base64StringSig2 = '';
    this.base64StringSig3 = '';
    this.showSignature = false; 
    setTimeout(() => {
      this.showSignature = true;
    }, 0);
    this.bloodRequestForm.reset({
      currentdate: [''],
      bloodCompName: [''],
      earlierDetectsName: [''],
      Diagnosis: [''],
      BloodorderID: [''],
      BloodGroupID: [''],
      Transfusiontype: ['0'],
      RequestType: ['1'],
      ClinicalDiagNosis: [''],
      HB: [''],
      Platelets: [''],
      wbc: [''],
      RBC: [''],
      pt: [''],
      aptt: [''],
      pttk: [''],
      pcv: [''],
      others: [''],
      BLdetail: this.fb.group({
        CID: [''],
        QTY: [''],
        RDT: [''],
      }),
      BLEdetect: [''],
      TransferID: [''],
      Status: [''],
      WardRemarks: [''],
      IsSampleCollected: ['0'],
      SampleCollectedDateTime: [''],
      TransfusionDateTime: [''],
      ReactionDate: [''],
      ReactionRemarks: [''],
      TransfusionID: [''],
      OrderPackID: [''],
      HCT: [''],
      MCV: [''],
      MCH: [''],
      INR: [''],
      WardPhoneNumber: [''],
      WitnessNurse1ID: [''],
      WitnessNurse2ID: [''],
      WitnessDoctor1ID: [''],
      Signature1: '',
      Signature2: '',
      Signature3: '',
      WitnessNurse1Date: moment(),
      WitnessNurse2Date: moment(),
      WitnessDoctorDate: moment(),
      WitnessNurse1Time: this.setCurrentTime(),
      WitnessNurse2Time: this.setCurrentTime(),
      WitnessDoctorTime: this.setCurrentTime()
    });
    this.routine = 'btn selected';
    this.stat = 'btn';
    this.emergency = 'btn';
    this.fetchPatientDiagnosis();
    this.fetchLatestBloodResult();
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY H:mm');
    this.bloodRequestForm.patchValue({
      currentdate: this.currentdate
    });
    this.selectedBloodComponents = [];
    this.selectedEarlierDetects = [];
    this.selectedBloodOrderData = [];
    this.enableDelete = false;    
  }
  isdetailHide() {
    this.isdetailShow = false;
    if (this.isdetailShow === false) {
      $('.patient_card').removeClass('maximum')
    }
  }
  isdetailShows() {
    this.isdetailShow = true;
    if (this.isdetailShow = true) {
      $('.patient_card').addClass('maximum')
    }
    // else{
    //   $('.patient_card').removeClass('maximum')
    // }
  }

  selectSampleCollected() {
    this.isSampleCollected = !this.isSampleCollected;
    this.bloodRequestForm.patchValue({
      SampleCollectedDateTime: new Date()
    })
    if (!this.isSampleCollected) {
      this.bloodRequestForm.patchValue({
        SampleCollectedDateTime: ''
      })
    }
  }

  deleteItem(index: number): void {
    this.selectedBloodComponents.splice(index, 1);
  }

  base64Signature1(event: any) {
    this.bloodRequestForm.patchValue({ Signature1: event });
  }

  clearW1Signature() {
    if (this.signComponent1) {
      this.signComponent1.clearSignature();
      this.bloodRequestForm.patchValue({ Signature1: '' });
    }
  }

  base64Signature2(event: any) {
    this.bloodRequestForm.patchValue({ Signature2: event });
  }

  clearW2Signature() {
    if (this.signComponent2) {
      this.signComponent2.clearSignature();
      this.bloodRequestForm.patchValue({ Signature2: '' });
    }
  }

  base64Signature3(event: any) {
    this.bloodRequestForm.patchValue({ Signature3: event });
  }

  clearDoctorSignature() {
    if (this.signComponent3) {
      this.signComponent3.clearSignature();
      this.bloodRequestForm.patchValue({ Signature3: '' });
    }
  }

  deleteBloodOrderConfirmation() {
    $('#deleteConfirmation').modal('show');
  }

  deleteBloodOrder() {
    var payload = {
      BloodorderID: this.bloodRequestForm.get('BloodorderID')?.value,
      UserID: this.doctorDetails[0].EmpId,
      WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospId
    }
    this.us.post(bloodRequest.DeleteBloodOrder, payload).subscribe((response: any) => {
      if (response.Code === 200) {
        this.clearBloodRequestForm();
          $('#bloodRequestDeleteMsg').modal('show');
          $('#ipCrossmatch_modal').modal('hide');
      }
  });

  }
}

export const bloodRequest = {
  DeleteBloodOrder: 'DeleteBloodOrder',
}