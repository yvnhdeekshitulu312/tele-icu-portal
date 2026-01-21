import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { PreOpChecklistService } from './pre-op-checklist.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfigService } from 'src/app/services/config.service';
import * as moment from 'moment';
import { DOCUMENT } from '@angular/common';
import { LoaderService } from 'src/app/services/loader.service';
import { ConfigService as BedConfig } from 'src/app/ward/services/config.service';
import { UtilityService } from '../utility.service';
import { SignatureComponent } from '../signature/signature.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ValidateEmployeeComponent } from '../validate-employee/validate-employee.component';
import { BedtransferComponent } from 'src/app/ward/bedtransfer/bedtransfer.component';
import { GenericModalBuilder } from '../generic-modal-builder.service';
import { BiometricService } from 'src/app/services/biometric.service';

declare var $: any;

@Component({
  selector: 'app-pre-op-checklist',
  templateUrl: './pre-op-checklist.component.html',
  styleUrls: ['./pre-op-checklist.component.scss']
})
export class PreOpChecklistComponent implements OnInit {
  doctorDetails: any;
  selectedView: any;
  hospitalId: any;
  location: any;
  currentdate: any;
  ward: any;
  wardID: any;
  langData: any;
  IsSwitch = false;
  currentdateN: any;
  currentTime: any;
  currentTimeN: Date = new Date();
  interval: any;
  hospitalModules: any[] = [];
  hospitalFeatures: any[] = [];
  hospitalFilterModules: any[] = [];
  hospitalFilterFeatures: any[] = [];
  favouritesList: any[] = [];
  suitType = '4';
  item: any;
  preopchklistForm!: FormGroup;
  selectedToggleIdValues: any = [];
  @Input() IsSwitchWard: any = false;
  @Output() selectedWard = new EventEmitter<any>();
  @Output() filteredDataChange = new EventEmitter<any[]>();
  FetchUserFacilityDataList: any;
  errorMessages: any[] = [];
  appSaveMsg: string = "";
  url: any;
  savedPreOpChkList: any = [];
  surgeryRequests: any = [];
  @ViewChild('Sign1Ref', { static: false }) signComponent1: SignatureComponent | undefined;
  @ViewChild('Sign2Ref', { static: false }) signComponent2: SignatureComponent | undefined;
  @ViewChild('Sign3Ref', { static: false }) signComponent3: SignatureComponent | undefined;
  @ViewChild('Sign4Ref', { static: false }) signComponent4: SignatureComponent | undefined;
  showSignature = false;
  base64StringSig1 = '';
  base64StringSig2 = '';
  base64StringSig3 = '';
  base64StringSig4 = '';
  isWardNurse = false;
  isORHeadNurse = false;
  isdetailShow = true;
  @Input() showSurgeryReqs: boolean = true;
  @Input() showHeader: boolean = true;
  @Input() patientFolderSurgeryId: any;
  SelectedViewClass: any;
  listOfItems: any;
  selectedMaintainanceMeds: any = [];
  IsFromBedsBoard: any;
  IsHome = true;
  IsHeadNurse: any;
  patientDetails: any;
  patinfo: any;
  otpatinfo: any;
  nursesData: any = [];
  bloodGroupsMaster: any;

  constructor(private portalConfig: ConfigService, private us: UtilityService,
    public formBuilder: FormBuilder, private config: BedConfig,
    private service: PreOpChecklistService, public router: Router,
    @Inject(DOCUMENT) private document: Document, private loader: LoaderService,
    private modalService: NgbModal, private mdlsvc: GenericModalBuilder, private biometricService: BiometricService) {

    this.langData = this.portalConfig.getLangData();
    this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.service.param = {
      ...this.service.param,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
    };


    this.preopchklistForm = this.formBuilder.group({
      PreOperativeCheckListID: ['0'],
      PatientID: [''],
      AdmissionId: [''],
      SurgeryRequestID: [''],
      PreMedicationsProcedure: [''],
      PerformingSurgeon: [''],
      PerformingSurgeonCode: [''],
      Approval: ['2'],
      Cash: ['2'],
      Anesthesia: ['2'],
      IdentificationBand: ['2'],
      OperationConsentFormSigned: ['2'],
      AnesthesiaConsciousFormConsentSigned: ['2'],
      AreaShaved: ['2'],
      SiteMarked: ['2'],
      BP: [''],
      PR: [''],
      RR: [''],
      SPO2: [''],
      Temp: [''],
      Height: [''],
      Weight: [''],
      IVCannula: ['2'],
      IVCannulaSite: ['0'],
      Gauge: [''],
      Site: ['0'],
      SkinIntergrityRemarks: [''],
      NotesandXRAYPresent: ['2'],
      NotesandXRAYPresentOthers: [''],
      BLOODREQUESTED: ['2'],
      COAGULATIONPROFILE: ['2'],
      HgB: [''],
      FBS: [''],
      RBS: [''],
      BLOODGROUP: [''],
      DentalPeculiarities: ['2'],
      DentalPeculiaritiesRemarks: [''],
      ContactLens: ['2'],
      ContactLensRemarks: [''],
      MakeUpandNailVarnish: ['2'],
      AllJewelryexceptweddingRingRemoved: ['2'],
      AllJewelryRemovedRemarks: [''],
      UrineRecentlyPassed: ['2'],
      LastMeal: [''],
      NPOTime: [''],
      MedicationsTakenByPatient: ['2'],
      Time: [''],
      MaintenanceMedications: [''],
      ICCUBedArranged: ['2'],
      IVInfusions: ['2'],
      Contraptions: ['2'],
      ThromboProphylaxis: ['2'],
      PreMedicationGiven: ['2'],
      AntibioticProphylaxis: ['2'],
      ANST: [''],
      DUETIME: [''],
      ORIdentificationband: ['2'],
      ORIdentificationbandRemarks: [''],
      OROperationConsentFormSigned: ['2'],
      OROperationConsentFormSignedRemarks: [''],
      ORAnesthesiaConsciousFormConsentSigned: ['2'],
      ORAnesthesiaConsciousFormConsentSignedRemarks: [''],
      ORAreaShaved: ['2'],
      ORAreaShavedRemarks: [''],
      ORSiteMarked: ['2'],
      ORSiteMarkedRemarks: [''],
      ORVitals: ['2'],
      ORVitalsRemarks: [''],
      ORIVCannula: ['2'],
      ORIVCannulaRemarks: [''],
      ORSkInIntergrity: ['2'],
      ORSkInIntergrityRemarks: [''],
      ORNotesAndXRAYPresent: ['2'],
      ORNotesAndXRAYPresentRemarks: [''],
      ORPreOperativeLaboratoryInvestigations: ['2'],
      ORPreOperativeLaboratoryinvestigationsRemarks: [''],
      ORDentalPeculiarities: ['2'],
      ORDentalPeculiaritiesRemarks: [''],
      ORContactLens: ['2'],
      ORContactLensRemarks: [''],
      ORMakeUpandnailvarnish: ['2'],
      ORMakeUpandnailvarnishRemarks: [''],
      ORAlljewelryexceptweddingRingRemoved: ['2'],
      ORAlljewelryexceptweddingRingRemovedRemarks: [''],
      ORUrineRecentlyPassed: ['2'],
      ORUrineRecentlyPassedRemarks: [''],
      ORSpecialInstructionsfromDoctorCarriedout: ['2'],
      ORSpecialInstructionsfromDoctorCarriedoutRemarks: [''],
      ORMedicationstakenbypatient: ['2'],
      ORMedicationstakenbypatientRemarks: [''],
      ORICCUBedArranged: ['2'],
      ORICCUBedArrangedRemarks: [''],
      ORIVInfusions: ['2'],
      ORIVInfusionsRemarks: [''],
      ORContraptions: ['2'],
      ORContraptionsRemarks: [''],
      ORThromboProphylaxis: ['2'],
      ORThromboProphylaxisRemarks: [''],
      ORPreMedicationGiven: ['2'],
      ORPreMedicationGivenRemarks: [''],
      ORAntibioticProphylaxis: ['2'],
      ORAntibioticProphylaxisRemarks: [''],
      MedicationNurse: [''],
      MedicationNurseDate: moment(new Date()).format('DD-MMM-YYYY H:mm'),
      MedicationNurseSignature: [''],
      CheckedByNurse: [''],
      CheckedByNurseDate: moment(new Date()).format('DD-MMM-YYYY H:mm'),
      CheckedByNurseSignature: [''],
      BroughtByNurse: this.doctorDetails[0].UserName + "-" + this.doctorDetails[0].EmployeeName,
      BroughtByNurseDate: moment(new Date()).format('DD-MMM-YYYY H:mm'),
      BroughtByNurseSignature: [''],
      ReceivedbyNurse: !this.IsFromBedsBoard ? this.doctorDetails[0].UserName + "-" + this.doctorDetails[0].EmployeeName : '',
      ReceivedbyNurseDate: !this.IsFromBedsBoard ? moment(new Date()).format('DD-MMM-YYYY H:mm') : '',
      ReceivedbyNurseSignature: [''],
      HospitalID: [''],
      USERID: [''],
      WorkStationId: [''],
      Createdate: [''],
      Moddate: [''],
      Blocked: [''],
      Enddate: [''],
      Status: ['']
    });

  }

  startClock(): void {
    this.interval = setInterval(() => {
      this.currentTimeN = new Date();
    }, 1000);
  }

  stopClock(): void {
    clearInterval(this.interval);
  }

  ngOnInit(): void {
    this.IsSwitch = this.IsSwitchWard;
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.location = sessionStorage.getItem("locationName");
    this.IsFromBedsBoard = sessionStorage.getItem("FromBedBoard") === "true" ? true : false;
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY H:mm');
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.currentTime = moment(new Date()).format('H:mm');
    this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.wardID = this.ward.FacilityID;
    this.isWardNurse = this.doctorDetails[0].IsNurse || this.doctorDetails[0].IsDoctor || this.doctorDetails[0].IsWardNurse || this.doctorDetails[0].IsERHeadNurse;
    if (this.doctorDetails[0].IsHeadNurse)
      this.isWardNurse = true;
    this.isORHeadNurse = this.doctorDetails[0].IsORHeadNurse;
    this.startClock();
    this.fetchUserFacility();
    if (!this.isORHeadNurse)
      this.fetchotdetails();
    if (this.selectedView.PatientType == "2") {
      if (this.selectedView.Bed.includes('ISO'))
        this.SelectedViewClass = "m-0 fw-bold alert_animate token iso-color-bg-primary-100";
      else
        this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    } else {
      this.SelectedViewClass = "m-0 fw-bold alert_animate token";
    }
    this.loader.getDefaultLangCode().subscribe((res) => {
      this.loadStyle(res);
    });

    if (this.isORHeadNurse) {
      this.showSurgeryReqs = false;
      this.item = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
      if (this.selectedView.BP != undefined) {
        this.preopchklistForm.patchValue({
          BP: this.selectedView.BP,
          PR: this.selectedView.Pulse,
          RR: this.selectedView.Respiratory,
          SPO2: this.selectedView.SPO2,
          Temp: this.selectedView.Temperature,
          Height: this.selectedView.Height,
          Weight: this.selectedView.Weight,
          CheckedByNurse: this.doctorDetails[0].UserName + "-" + this.doctorDetails[0].EmployeeName
        })
      }
      this.fetchPreOpCheckList();
      setTimeout(() => {
        this.showSignature = true;
      }, 0);
    }
    else {
      this.preopchklistForm.patchValue({
        Cash: this.selectedView.BillType === 'Insured' ? '2' : '1'
      })
    }
    this.fetchBloodGroups();
  }

  fetchotdetails() {
    const fromdate = moment(this.selectedView.AdmitDate).format('DD-MMM-YYYY');
    const todate = moment(new Date()).format('DD-MMM-YYYY');
    var SSNN = this.selectedView.SSN;
    this.url = this.service.getData(preoperativechekclist.fetch, { FromDate: fromdate, ToDate: todate, SSN: SSNN, FacilityId: 3395, Hospitalid: this.hospitalId });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.surgeryRequests = response.SurgeryRequestsDataList;
          if (this.patientFolderSurgeryId) {
            this.item = this.surgeryRequests.find((item: any) => item.SurgeryRequestid.toString() === this.patientFolderSurgeryId.toString());
            if (this.selectedView.BP != undefined) {
              this.preopchklistForm.patchValue({
                BP: this.selectedView.BP,
                PR: this.selectedView.Pulse,
                RR: this.selectedView.Respiratory,
                SPO2: this.selectedView.SPO2,
                Temp: this.selectedView.Temperature,
                Height: this.selectedView.Height,
                Weight: this.selectedView.Weight,
                CheckedByNurse: this.doctorDetails[0].UserName + "-" + this.doctorDetails[0].EmployeeName
              })
            }
            this.fetchPreOpCheckList();
          }
        }
      },
        (err) => {
        });
  }

  openPreopCheckList(item: any) {
    this.showSurgeryReqs = false;
    this.item = item;
    if (this.selectedView.BP != undefined) {
      this.preopchklistForm.patchValue({
        BP: this.selectedView.BP,
        PR: this.selectedView.Pulse,
        RR: this.selectedView.Respiratory,
        SPO2: this.selectedView.SPO2,
        Temp: this.selectedView.Temperature,
        Height: this.selectedView.Height,
        Weight: this.selectedView.Weight,
      })
    }
    this.fetchPreOpCheckList();
    setTimeout(() => {
      this.showSignature = true;
    }, 0);
  }

  clearPreOp() {
    this.url = this.service.getData(preoperativechekclist.FetchPatientPreOperativeCheckLists, { SurgeryRequestID: this.item.SurgeryRequestid, WorkStationID: 3395, HospitalID: this.hospitalId });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientPreOperativeCheckListsDataList.length > 0) {
          this.savedPreOpChkList = response.FetchPatientPreOperativeCheckListsDataList[0];
          for (let key in this.savedPreOpChkList) {
            this.toggleSelectionForm(key, this.savedPreOpChkList[key]);
          }
          this.base64StringSig1 = this.savedPreOpChkList.MedicationNurseSignature;
          this.base64StringSig2 = this.savedPreOpChkList.CheckedByNurseSignature;
          this.base64StringSig3 = this.savedPreOpChkList.BroughtByNurseSignature;
          this.base64StringSig4 = this.savedPreOpChkList.ReceivedbyNurseSignature;
          this.showSignature = false;
          setTimeout(() => {
            this.showSignature = true;
          }, 0);
        }
        else {
          if (this.selectedView.BP != undefined) {
            this.preopchklistForm.patchValue({
              BP: this.selectedView.BP,
              PR: this.selectedView.Pulse,
              RR: this.selectedView.Respiratory,
              SPO2: this.selectedView.SPO2,
              Temp: this.selectedView.Temperature,
              Height: this.selectedView.Height,
              Weight: this.selectedView.Weight,
            })
          }
          this.preopchklistForm.patchValue({
            PreOperativeCheckListID: "0",
            PatientID: "",
            AdmissionId: "",
            SurgeryRequestID: "",
            PreMedicationsProcedure: "",
            PerformingSurgeon: "",
            PerformingSurgeonCode: "",
            Approval: "2",
            Cash: "2",
            Anesthesia: "2",
            IdentificationBand: "2",
            OperationConsentFormSigned: "2",
            AnesthesiaConsciousFormConsentSigned: "2",
            AreaShaved: "2",
            SiteMarked: "2",
            IVCannula: "2",
            IVCannulaSite: "0",
            Gauge: "",
            Site: "0",
            SkinIntergrityRemarks: "",
            NotesandXRAYPresent: "2",
            NotesandXRAYPresentOthers: "",
            BLOODREQUESTED: "2",
            COAGULATIONPROFILE: "2",
            HgB: "",
            FBS: "",
            RBS: "",
            BLOODGROUP: "",
            DentalPeculiarities: "2",
            DentalPeculiaritiesRemarks: "",
            ContactLens: "2",
            ContactLensRemarks: "",
            MakeUpandNailVarnish: "2",
            AllJewelryexceptweddingRingRemoved: "2",
            UrineRecentlyPassed: "2",
            LastMeal: "",
            NPOTime: "",
            MedicationsTakenByPatient: "2",
            Time: "",
            MaintenanceMedications: "",
            ICCUBedArranged: "2",
            IVInfusions: "2",
            Contraptions: "2",
            ThromboProphylaxis: "2",
            PreMedicationGiven: "2",
            AntibioticProphylaxis: "2",
            ANST: "",
            DUETIME: "",
            ORIdentificationband: "2",
            ORIdentificationbandRemarks: "",
            OROperationConsentFormSigned: "2",
            OROperationConsentFormSignedRemarks: "",
            ORAnesthesiaConsciousFormConsentSigned: "2",
            ORAnesthesiaConsciousFormConsentSignedRemarks: "",
            ORAreaShaved: "2",
            ORAreaShavedRemarks: "",
            ORSiteMarked: "2",
            ORSiteMarkedRemarks: "",
            ORVitals: "2",
            ORVitalsRemarks: "",
            ORIVCannula: "2",
            ORIVCannulaRemarks: "",
            ORSkInIntergrity: "2",
            ORSkInIntergrityRemarks: "",
            ORNotesAndXRAYPresent: "2",
            ORNotesAndXRAYPresentRemarks: "",
            ORPreOperativeLaboratoryInvestigations: "2",
            ORPreOperativeLaboratoryinvestigationsRemarks: "",
            ORDentalPeculiarities: "2",
            ORDentalPeculiaritiesRemarks: "",
            ORContactLens: "2",
            ORContactLensRemarks: "",
            ORMakeUpandnailvarnish: "2",
            ORMakeUpandnailvarnishRemarks: "",
            ORAlljewelryexceptweddingRingRemoved: "2",
            ORAlljewelryexceptweddingRingRemovedRemarks: "",
            ORUrineRecentlyPassed: "2",
            ORUrineRecentlyPassedRemarks: "",
            ORSpecialInstructionsfromDoctorCarriedout: "2",
            ORSpecialInstructionsfromDoctorCarriedoutRemarks: "",
            ORMedicationstakenbypatient: "2",
            ORMedicationstakenbypatientRemarks: "",
            ORICCUBedArranged: "2",
            ORICCUBedArrangedRemarks: "",
            ORIVInfusions: "2",
            ORIVInfusionsRemarks: "",
            ORContraptions: "2",
            ORContraptionsRemarks: "",
            ORThromboProphylaxis: "2",
            ORThromboProphylaxisRemarks: "",
            ORPreMedicationGiven: "2",
            ORPreMedicationGivenRemarks: "",
            ORAntibioticProphylaxis: "2",
            ORAntibioticProphylaxisRemarks: "",
            MedicationNurse: this.doctorDetails[0].UserName + "-" + this.doctorDetails[0].EmployeeName,
            MedicationNurseDate: moment(new Date()).format('DD-MMM-YYYY H:mm'),
            MedicationNurseSignature: "",
            CheckedByNurse: "",
            CheckedByNurseDate: moment(new Date()).format('DD-MMM-YYYY H:mm'),
            CheckedByNurseSignature: "",
            BroughtByNurse: this.doctorDetails[0].UserName + "-" + this.doctorDetails[0].EmployeeName,
            BroughtByNurseDate: moment(new Date()).format('DD-MMM-YYYY H:mm'),
            BroughtByNurseSignature: "",
            ReceivedbyNurse: "",
            ReceivedbyNurseDate: moment(new Date()).format('DD-MMM-YYYY H:mm'),
            ReceivedbyNurseSignature: "",
            HospitalID: "",
            USERID: "",
            WorkStationId: "",
            Createdate: "",
            Moddate: "",
            Blocked: "",
            Enddate: "",
            Status: ""
          });
        }
      },
        (err) => {
        })
  }

  openBiometricModal() {
    const fingerPrintForAdmission = this.doctorDetails[0]?.FINGERPRINTENABLE;
    const FINGERPRINTENABLEPREOP = this.doctorDetails[0]?.FINGERPRINTENABLEPREOP;


    this.item.PatientName = this.item.NAME;
    this.item.Gender = this.item.GENDER;
    sessionStorage.setItem('FeatureID', '203447');
    sessionStorage.setItem('FacilityID', '3395');
    if (!this.IsFromBedsBoard && fingerPrintForAdmission.toLowerCase() === 'yes'&& FINGERPRINTENABLEPREOP.toLowerCase() === 'yes') {
      this.biometricService.verifyPatient(this.item, 'Pre Operative Checklist')
        .subscribe({
          next: (verified) => {
            sessionStorage.removeItem('FeatureID');
            sessionStorage.removeItem('FacilityID');
            if (verified) {
              this.savePreOpChecklist()
            }
          },
          error: (error) => {
            sessionStorage.removeItem('FeatureID');
            sessionStorage.removeItem('FacilityID');
            console.error('Biometric verification error:', error);
          }
        });
    }
    else {
      this.savePreOpChecklist();
    }
  }

  savePreOpChecklist() {

    var mainMed = "";
    if (this.selectedMaintainanceMeds.length > 0) {
      mainMed = this.selectedMaintainanceMeds?.map((item: any) => item.ItemCode + "-" + item.ItemName + "-" + item.ItemID).join(',');
    }

    var payload = {
      "PreOperativeCheckListID": this.preopchklistForm.get('PreOperativeCheckListID')?.value,
      "PatientID": this.item.PatientID,
      "AdmissionId": this.item.AdmissionID,
      "SurgeryRequestID": this.item.SurgeryRequestid,
      "PreMedicationsProcedure": this.preopchklistForm.get('PreMedicationsProcedure')?.value,
      "PerformingSurgeon": this.preopchklistForm.get('PerformingSurgeon')?.value,
      "PerformingSurgeonCode": this.preopchklistForm.get('PerformingSurgeonCode')?.value,
      "Approval": this.preopchklistForm.get('Approval')?.value,
      "Cash": this.preopchklistForm.get('Cash')?.value,
      "Anesthesia": this.preopchklistForm.get('Anesthesia')?.value,
      "IdentificationBand": this.preopchklistForm.get('IdentificationBand')?.value,
      "OperationConsentFormSigned": this.preopchklistForm.get('OperationConsentFormSigned')?.value,
      "AnesthesiaConsciousFormConsentSigned": this.preopchklistForm.get('AnesthesiaConsciousFormConsentSigned')?.value,
      "AreaShaved": this.preopchklistForm.get('AreaShaved')?.value,
      "SiteMarked": this.preopchklistForm.get('SiteMarked')?.value,
      "BP": this.preopchklistForm.get('BP')?.value,
      "PR": this.preopchklistForm.get('PR')?.value,
      "RR": this.preopchklistForm.get('RR')?.value,
      "SPO2": this.preopchklistForm.get('SPO2')?.value,
      "Temp": this.preopchklistForm.get('Temp')?.value,
      "Weight": this.preopchklistForm.get('Weight')?.value,
      "IVCannula": this.preopchklistForm.get('IVCannula')?.value,
      "IVCannulaSite": this.preopchklistForm.get('IVCannulaSite')?.value,
      "Gauge": this.preopchklistForm.get('Gauge')?.value,
      "Site": this.preopchklistForm.get('Site')?.value,
      "SkinIntergrityRemarks": this.preopchklistForm.get('SkinIntergrityRemarks')?.value,
      "NotesandXRAYPresent": this.preopchklistForm.get('NotesandXRAYPresent')?.value,
      "NotesandXRAYPresentOthers": this.preopchklistForm.get('NotesandXRAYPresentOthers')?.value,
      "BLOODREQUESTED": this.preopchklistForm.get('BLOODREQUESTED')?.value,
      "COAGULATIONPROFILE": this.preopchklistForm.get('COAGULATIONPROFILE')?.value,
      "HgB": this.preopchklistForm.get('HgB')?.value,
      "FBS": this.preopchklistForm.get('FBS')?.value,
      "RBS": this.preopchklistForm.get('RBS')?.value,
      "BLOODGROUP": this.preopchklistForm.get('BLOODGROUP')?.value,
      "DentalPeculiarities": this.preopchklistForm.get('DentalPeculiarities')?.value,
      "DentalPeculiaritiesRemarks": this.preopchklistForm.get('DentalPeculiaritiesRemarks')?.value,
      "ContactLens": this.preopchklistForm.get('ContactLens')?.value,
      "ContactLensRemarks": this.preopchklistForm.get('ContactLensRemarks')?.value,
      "MakeUpandNailVarnish": this.preopchklistForm.get('MakeUpandNailVarnish')?.value,
      "AllJewelryexceptweddingRingRemoved": this.preopchklistForm.get('AllJewelryexceptweddingRingRemoved')?.value,
      "AllJewelryRemovedRemarks": this.preopchklistForm.get('AllJewelryRemovedRemarks')?.value,
      "UrineRecentlyPassed": this.preopchklistForm.get('UrineRecentlyPassed')?.value,
      "LastMeal": this.preopchklistForm.get('LastMeal')?.value,
      "NPOTime": this.preopchklistForm.get('NPOTime')?.value,
      "MedicationsTakenByPatient": this.preopchklistForm.get('MedicationsTakenByPatient')?.value,
      "Time": this.preopchklistForm.get('Time')?.value,
      "MaintenanceMedications": mainMed,
      "ICCUBedArranged": this.preopchklistForm.get('ICCUBedArranged')?.value,
      "IVInfusions": this.preopchklistForm.get('IVInfusions')?.value,
      "Contraptions": this.preopchklistForm.get('Contraptions')?.value,
      "ThromboProphylaxis": this.preopchklistForm.get('ThromboProphylaxis')?.value,
      "PreMedicationGiven": this.preopchklistForm.get('PreMedicationGiven')?.value,
      "AntibioticProphylaxis": this.preopchklistForm.get('AntibioticProphylaxis')?.value,
      "ANST": this.preopchklistForm.get('ANST')?.value,
      "DUETIME": this.preopchklistForm.get('DUETIME')?.value,
      "ORIdentificationband": this.preopchklistForm.get('ORIdentificationband')?.value,
      "ORIdentificationbandRemarks": this.preopchklistForm.get('ORIdentificationbandRemarks')?.value,
      "OROperationConsentFormSigned": this.preopchklistForm.get('OROperationConsentFormSigned')?.value,
      "OROperationConsentFormSignedRemarks": this.preopchklistForm.get('OROperationConsentFormSignedRemarks')?.value,
      "ORAnesthesiaConsciousFormConsentSigned": this.preopchklistForm.get('ORAnesthesiaConsciousFormConsentSigned')?.value,
      "ORAnesthesiaConsciousFormConsentSignedRemarks": this.preopchklistForm.get('ORAnesthesiaConsciousFormConsentSignedRemarks')?.value,
      "ORAreaShaved": this.preopchklistForm.get('ORAreaShaved')?.value,
      "ORAreaShavedRemarks": this.preopchklistForm.get('ORAreaShavedRemarks')?.value,
      "ORSiteMarked": this.preopchklistForm.get('ORSiteMarked')?.value,
      "ORSiteMarkedRemarks": this.preopchklistForm.get('ORSiteMarkedRemarks')?.value,
      "ORVitals": this.preopchklistForm.get('ORVitals')?.value,
      "ORVitalsRemarks": this.preopchklistForm.get('ORVitalsRemarks')?.value,
      "ORIVCannula": this.preopchklistForm.get('ORIVCannula')?.value,
      "ORIVCannulaRemarks": this.preopchklistForm.get('ORIVCannulaRemarks')?.value,
      "ORSkInIntergrity": this.preopchklistForm.get('ORSkInIntergrity')?.value,
      "ORSkInIntergrityRemarks": this.preopchklistForm.get('ORSkInIntergrityRemarks')?.value,
      "ORNotesAndXRAYPresent": this.preopchklistForm.get('ORNotesAndXRAYPresent')?.value,
      "ORNotesAndXRAYPresentRemarks": this.preopchklistForm.get('ORNotesAndXRAYPresentRemarks')?.value,
      "ORPreOperativeLaboratoryInvestigations": this.preopchklistForm.get('ORPreOperativeLaboratoryInvestigations')?.value,
      "ORPreOperativeLaboratoryinvestigationsRemarks": this.preopchklistForm.get('ORPreOperativeLaboratoryinvestigationsRemarks')?.value,
      "ORDentalPeculiarities": this.preopchklistForm.get('ORDentalPeculiarities')?.value,
      "ORDentalPeculiaritiesRemarks": this.preopchklistForm.get('ORDentalPeculiaritiesRemarks')?.value,
      "ORContactLens": this.preopchklistForm.get('ORContactLens')?.value,
      "ORContactLensRemarks": this.preopchklistForm.get('ORContactLensRemarks')?.value,
      "ORMakeUpandnailvarnish": this.preopchklistForm.get('ORMakeUpandnailvarnish')?.value,
      "ORMakeUpandnailvarnishRemarks": this.preopchklistForm.get('ORMakeUpandnailvarnishRemarks')?.value,
      "ORAlljewelryexceptweddingRingRemoved": this.preopchklistForm.get('ORAlljewelryexceptweddingRingRemoved')?.value,
      "ORAlljewelryexceptweddingRingRemovedRemarks": this.preopchklistForm.get('ORAlljewelryexceptweddingRingRemovedRemarks')?.value,
      "ORUrineRecentlyPassed": this.preopchklistForm.get('ORUrineRecentlyPassed')?.value,
      "ORUrineRecentlyPassedRemarks": this.preopchklistForm.get('ORUrineRecentlyPassedRemarks')?.value,
      "ORSpecialInstructionsfromDoctorCarriedout": this.preopchklistForm.get('ORSpecialInstructionsfromDoctorCarriedout')?.value,
      "ORSpecialInstructionsfromDoctorCarriedoutRemarks": this.preopchklistForm.get('ORSpecialInstructionsfromDoctorCarriedoutRemarks')?.value,
      "ORMedicationstakenbypatient": this.preopchklistForm.get('ORMedicationstakenbypatient')?.value,
      "ORMedicationstakenbypatientRemarks": this.preopchklistForm.get('ORMedicationstakenbypatientRemarks')?.value,
      "ORICCUBedArranged": this.preopchklistForm.get('ORICCUBedArranged')?.value,
      "ORICCUBedArrangedRemarks": this.preopchklistForm.get('ORICCUBedArrangedRemarks')?.value,
      "ORIVInfusions": this.preopchklistForm.get('ORIVInfusions')?.value,
      "ORIVInfusionsRemarks": this.preopchklistForm.get('ORIVInfusionsRemarks')?.value,
      "ORContraptions": this.preopchklistForm.get('ORContraptions')?.value,
      "ORContraptionsRemarks": this.preopchklistForm.get('ORContraptionsRemarks')?.value,
      "ORThromboProphylaxis": this.preopchklistForm.get('ORThromboProphylaxis')?.value,
      "ORThromboProphylaxisRemarks": this.preopchklistForm.get('ORThromboProphylaxisRemarks')?.value,
      "ORPreMedicationGiven": this.preopchklistForm.get('ORPreMedicationGiven')?.value,
      "ORPreMedicationGivenRemarks": this.preopchklistForm.get('ORPreMedicationGivenRemarks')?.value,
      "ORAntibioticProphylaxis": this.preopchklistForm.get('ORAntibioticProphylaxis')?.value,
      "ORAntibioticProphylaxisRemarks": this.preopchklistForm.get('ORAntibioticProphylaxisRemarks')?.value,
      "MedicationNurse": this.preopchklistForm.get('MedicationNurse')?.value,
      "MedicationNurseDate": this.preopchklistForm.get('MedicationNurseDate')?.value,
      "MedicationNurseSignature": this.preopchklistForm.get('MedicationNurseSignature')?.value,
      "CheckedByNurse": this.preopchklistForm.get('CheckedByNurse')?.value,
      "CheckedByNurseDate": this.preopchklistForm.get('CheckedByNurseDate')?.value,
      "CheckedByNurseSignature": this.preopchklistForm.get('CheckedByNurseSignature')?.value,
      "BroughtByNurse": this.preopchklistForm.get('BroughtByNurse')?.value,
      "BroughtByNurseDate": this.preopchklistForm.get('BroughtByNurseDate')?.value,
      "BroughtByNurseSignature": this.preopchklistForm.get('BroughtByNurseSignature')?.value,
      "ReceivedbyNurse": this.preopchklistForm.get('ReceivedbyNurse')?.value,
      "ReceivedbyNurseDate": this.preopchklistForm.get('ReceivedbyNurseDate')?.value,
      "ReceivedbyNurseSignature": this.preopchklistForm.get('ReceivedbyNurseSignature')?.value,
      "HospitalID": this.hospitalId,
      "UserID": this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      "WorkStationID": 3395
    }

    this.us.post(preoperativechekclist.SavePatientPreOperativeCheckLists, payload).subscribe((response) => {
      if (response.Status === "Success") {
        this.appSaveMsg = "Pre-Operative Checklist Saved Successfully."
        $("#preopchklstSaveMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {
          this.errorMessages = [];
          this.errorMessages.push(response.Message);
          this.errorMessages.push(response.Message2L);
          // this.patientDetails = [];
          $("#saveDoctorAppointmentValidation").modal('show');
        }
      }
    },
      (err) => {

      })
  }

  fetchPreOpCheckList() {
    this.url = this.service.getData(preoperativechekclist.FetchPatientPreOperativeCheckLists, { SurgeryRequestID: this.item.SurgeryRequestid, WorkStationID: 3395, HospitalID: this.hospitalId });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientPreOperativeCheckListsDataList.length > 0) {
          this.savedPreOpChkList = response.FetchPatientPreOperativeCheckListsDataList[0];
          for (let key in this.savedPreOpChkList) {
            this.toggleSelectionForm(key, this.savedPreOpChkList[key]);
          }
          if (response.FetchPatientPreOperativeCheckListsDataList[0].MaintenanceMedications != "") {
            const mainmed = response.FetchPatientPreOperativeCheckListsDataList[0].MaintenanceMedications;
            this.selectedMaintainanceMeds = [];
            mainmed.split(',').forEach((element: any, index: any) => {
              this.selectedMaintainanceMeds.push({
                "ItemCode": element.split('-')[0],
                "ItemName": element.split('-')[1],
                "ItemID": element.split('-')[3]
              });
            });
          }
          this.base64StringSig1 = this.savedPreOpChkList.MedicationNurseSignature;
          this.base64StringSig2 = this.savedPreOpChkList.CheckedByNurseSignature;
          this.base64StringSig3 = this.savedPreOpChkList.BroughtByNurseSignature;
          this.base64StringSig4 = this.savedPreOpChkList.ReceivedbyNurseSignature;
          this.showSignature = false;
          setTimeout(() => {
            this.showSignature = true;
          }, 0);
        }
      },
        (err) => {
        })
  }

  base64NurseSignature1(event: any) {
    this.preopchklistForm.patchValue({ MedicationNurseSignature: event });
  }
  base64NurseSignature2(event: any) {
    this.preopchklistForm.patchValue({ CheckedByNurseSignature: event });
  }
  base64NurseSignature3(event: any) {
    this.preopchklistForm.patchValue({ BroughtByNurseSignature: event });
  }
  base64NurseSignature4(event: any) {
    this.preopchklistForm.patchValue({ ReceivedbyNurseSignature: event });
  }

  toggleSelection1(event: any) {
    var val = event.target.value;
    const button = event.target as HTMLElement;
    const parentDiv = button.parentElement;
    const buttons = parentDiv?.querySelectorAll('.btn');
    buttons?.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    var find = this.selectedToggleIdValues.find((x: any) => x.chkLstId === parentDiv?.id);
    if (find) {
      find.value = val;
    }
    else {
      this.selectedToggleIdValues.push({
        chkLstId: parentDiv?.id, value: val
      })
    }
    console.log(this.selectedToggleIdValues)
  }

  toggleSelectionForm(formCtrlName: string, val: string) {
    if (val != undefined)
      this.preopchklistForm.controls[formCtrlName].setValue(val);
  }

  toggleSelectionValChange(formCtrlName: string) {
    if (this.preopchklistForm.get(formCtrlName)?.value == '2')
      this.preopchklistForm.controls[formCtrlName].setValue('1');
    else
      this.preopchklistForm.controls[formCtrlName].setValue('2');
  }

  onLogout() {
    this.portalConfig.onLogout();
  }

  fetchUserFacility() {
    this.config.fetchUserFacility(this.doctorDetails[0].UserId, this.hospitalId)
      .subscribe((response: any) => {
        this.FetchUserFacilityDataList = response.FetchUserFacilityDataList;
      },
        (err) => {
        })

  }
  getSSNSearch(key: any) {
    this.filteredDataChange.emit(key.target.value);
  }
  selectFacility() {
    if (this.FetchUserFacilityDataList) {
      const selectedItem = this.FetchUserFacilityDataList.find((value: any) => value.FacilityID === this.wardID);
      sessionStorage.setItem("facility", JSON.stringify(selectedItem));
      this.ward = JSON.parse(sessionStorage.getItem("facility") || '{}');
      $("#facilityMenu").modal('hide');
      this.selectedWard.emit();
    }
  }
  openFacilityMenu() {
    $("#facilityMenu").modal('show');
  }
  GoBackToHome() {
    sessionStorage.setItem("FacilityID", JSON.stringify(''));
    sessionStorage.setItem("facility", JSON.stringify(''));
    this.router.navigate(['/suit'])
  }
  navigatetoBedBoard() {
    //this.router.navigate(['/ward']);
    if (this.IsHeadNurse == 'true' && !this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
  }

  loadStyle(code: string) {
    let enStyle = './assets/styles/suit-style-EN.css';
    let arStyle = './assets/styles/suit-style-AR.css';
    let loadStyle = ""
    if (code === 'en') {
      loadStyle = enStyle;
    } else if (code === 'ar') {
      loadStyle = arStyle;
    }
    const head = this.document.getElementsByTagName('head')[0];
    let linkElement = document.getElementById("client-theme");

    if (linkElement === null) {
      const style = this.document.createElement('link');
      style.id = 'client-theme';
      style.rel = 'stylesheet';
      style.href = `${loadStyle}`;
      head.appendChild(style);
    } else {
      linkElement.setAttribute('href', `${loadStyle}`)
    }

  }

  suittype(featureTypeID: any) {
    this.suitType = featureTypeID;
    this.hospitalFeatures = this.hospitalFilterFeatures.filter(feature => feature.FeatureTypeID === featureTypeID);
    this.hospitalModules = this.hospitalFilterModules.filter((module) => {
      const features = this.getFeaturesByModuleId(module.ModuleID);
      return features.length > 0;
    });
    this.hospitalModules.forEach((element: any, index: any) => {
      if ((index + 1) % 3 == 0 || (index + 2) % 3 == 0) {
        element.Class = "block left";
      }
      else {
        element.Class = "block";
      }
      var featuresCount = this.hospitalFeatures.filter(feature => feature.ModuleID === element.ModuleID);
      if (featuresCount.length <= 10) {
        element.Class = element.Class + " lessten";
      }
    });
  }

  getFeaturesByModuleId(moduleId: string) {
    return this.hospitalFeatures.filter(feature => feature.ModuleID === moduleId);
  }

  redirecttourl(url: any) {
    if (url == "suit/WorkList?PTYP=1") {
      this.router.navigate(['/suit/labworklist']);
    }
    else if (url == "suit/ReferralWorklist") {
      this.router.navigate(['/suit/radiologyworklist']);
    }
    else this.router.navigate(['/' + url]);
  }

  onFacilitySelectChange(event: any) {
    sessionStorage.setItem("FacilityID", JSON.stringify(event.target.value));
  }

  navigateBackToAdmissionRequests() {
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

  isdetailShows() {
    this.isdetailShow = true;
    if (this.isdetailShow = true) {
      $('.patient_card').addClass('maximum')
    }
    // else{
    //   $('.patient_card').removeClass('maximum')
    // }
  }
  isdetailHide() {
    this.isdetailShow = false;
    if (this.isdetailShow === false) {
      $('.patient_card').removeClass('maximum')
    }
  }

  searchItem(event: any) {
    const filter = event.target.value;
    if (filter.length >= 3) {

      this.url = this.service.getData(preoperativechekclist.fetchItemDetails, { Type: 3, Filter: filter, UserId: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalId, DoctorID: this.doctorDetails[0].UserId });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfItems = response.ItemDetailsDataList;
          }
        },
          (err) => {
          })
    }

    else {
      this.listOfItems = [];
    }
  }
  onItemSelected(item: any) {
    if (this.selectedMaintainanceMeds.filter((x: any) => x.ItemID === item.ItemID).length === 0)
      this.selectedMaintainanceMeds.push({
        "ItemCode": item.ItemCode,
        "ItemName": item.DisplayName,
        "ItemID": item.ItemID
      });
  }

  clearPatientSignature(ref: any) {
    if (ref === 'Sign1Ref') {
      if (this.signComponent1) {
        this.signComponent1.clearSignature();
        this.preopchklistForm.patchValue({ MedicationNurseSignature: '' });
      }
    }
    else if (ref === 'Sign2Ref') {
      if (this.signComponent2) {
        this.signComponent2.clearSignature();
        this.preopchklistForm.patchValue({ CheckedByNurseSignature: '' });
      }
    }
    else if (ref === 'Sign3Ref') {
      if (this.signComponent3) {
        this.signComponent3.clearSignature();
        this.preopchklistForm.patchValue({ BroughtByNurseSignature: '' });
      }
    }
    else if (ref === 'Sign4Ref') {
      if (this.signComponent4) {
        this.signComponent4.clearSignature();
        this.preopchklistForm.patchValue({ ReceivedbyNurseSignature: '' });
      }
    }
  }

  fetchDoctorSignature(sig: string) {
    const modalRef = this.modalService.open(ValidateEmployeeComponent);
    modalRef.componentInstance.dataChanged.subscribe((data: any) => {
      if (data.success) {
        this.url = this.service.getData(preoperativechekclist.FetchEmployeeSignaturesBase64, { EmpID: this.doctorDetails[0].EmpId, UserID: this.doctorDetails[0].UserId, WorkStationID: 3392, HospitalID: this.hospitalId });
        this.us.get(this.url)
          .subscribe((response: any) => {
            if (sig === 'Sign1Ref')
              this.signComponent1 = response.FetchEmployeeSignaturesBase64DList[0].Base64Signature;
            else if (sig === 'Sign2Ref')
              this.signComponent2 = response.FetchEmployeeSignaturesBase64DList[0].Base64Signature;
            else if (sig === 'Sign3Ref')
              this.signComponent3 = response.FetchEmployeeSignaturesBase64DList[0].Base64Signature;
            else if (sig === 'Sign4Ref')
              this.signComponent4 = response.FetchEmployeeSignaturesBase64DList[0].Base64Signature;

            this.showSignature = false; // to load the common component
            setTimeout(() => {
              this.showSignature = true;
            }, 0);
          },
            (err) => {
            })
      }
      modalRef.close();
    });

  }

  getHeight() {
    const medleng = this.selectedMaintainanceMeds.length;

    var divht = (medleng * 3) + 5
    return divht + 'rem';
  }

  openBedTransfer() {
    const options: NgbModalOptions = {
      size: 'xl',
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.mdlsvc.openModal(BedtransferComponent, {
      data: "bedtransfer",
      readonly: true
    }, options);
  }
  openQuickActions() {
    this.patinfo = this.patientDetails;
    $("#quickaction_info").modal('show');
  }
  closeModal() {
    $("#quickaction_info").modal('hide');
  }
  clearPatientInfo() {
    this.patinfo = "";
  }

  searchNurse(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.us.get("FetchWitnessNurse?Filter=" + filter + "&HospitalID=" + this.hospitalId + "")
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.nursesData = response.FetchRODNursesDataList;
          }
        },
          (err) => {

          })
    }
  }
  onNurseSelection(item: any, id: string) {
    this.nursesData = [];
    this.preopchklistForm.patchValue({
      MedicationNurse: item.EmpNoFullname
    });
  }
  fetchBloodGroups() {
    this.config.fetchBloodGroups(this.hospitalId).subscribe((response) => {
      if (response.Status === "Success") {
        this.bloodGroupsMaster = response.SurgeryDemographicsDataaList;
      }
    },
      (err) => {

      })
  }

  openOtQuickActions() {
    this.otpatinfo = this.item;
    $("#ot_quickaction_info").modal('show');
  }

  closeOtModal() {
    this.otpatinfo = "";
    $("#ot_quickaction_info").modal('hide');
  }
}


export const preoperativechekclist = {
  FetchPatientPreOperativeCheckLists: 'FetchPatientPreOperativeCheckLists?SurgeryRequestID=${SurgeryRequestID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SavePatientPreOperativeCheckLists: 'InsertPatientPreOperativeCheckLists',
  fetch: 'FetchSurgerRecordsForDashboard?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&tbl=0&FacilityId=${FacilityId}&Hospitalid=${Hospitalid}',
  fetchItemDetails: 'FetchItemDetails?min=1&max=500&Type=${Type}&Filter=${Filter}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}&DoctorID=${DoctorID}',
  FetchEmployeeSignaturesBase64: 'FetchEmployeeSignaturesBase64?EmpID=${EmpID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
};  