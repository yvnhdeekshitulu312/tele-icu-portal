import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { ConfigService } from 'src/app/services/config.service';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ValidateEmployeeComponent } from '../validate-employee/validate-employee.component';
import { AntibioticComponent } from 'src/app/portal/antibiotic/antibiotic.component';

declare var $: any;

@Component({
  selector: 'app-medi-inv-proc',
  templateUrl: './medi-inv-proc.component.html',
  styleUrls: ['./medi-inv-proc.component.scss']
})
export class MediInvProcComponent implements OnInit {
  @Output() savechanges = new EventEmitter<any>();
  langData: any;
  doctorDetails: any;
  selectedView: any;
  toggleValue: string = 'Normal';
  investigationsList: IInvestigations[] = [];
  proceduresList: IInvestigations[] = [];
  savedDrugPrescriptions: any = [];
  savedInvPrescriptions: any = [];
  savedProcPrescriptions: any = [];
  selectedItemsList: any = [];
  isEditmode: boolean = false;
  medicationsForm!: FormGroup;
  medicationSchedulesForm!: FormGroup;
  showProcListdiv: boolean = false;
  showInvListdiv: boolean = false;
  isProceduresAll: boolean = false;
  isInvesigationsAll: boolean = false;
  isMedicationFormSubmitted: boolean = false;
  drugDetails: DrugDetails[] = [];
  ivfDetails: IvfDetails[] = [];
  investigationDetails: InvestigationDetails[] = [];
  procedureDetails: ProcedureDetails[] = [];
  searchProceduresData: Array<InvestigationProcedures> = [];
  searchData: Array<InvestigationProcedures> = [];
  private searchInput$ = new Subject<string>();
  private searchInputInvProc$ = new Subject<string>();
  private searchInputProc$ = new Subject<string>();
  private investigationresults$ = new Subject();
  private procedureresults$ = new Subject();
  investigationData: any;
  proceduresData: any;
  changedMedicationsList: any = [];
  changedProceduresList: any = [];
  changedInvestigationsList: any = [];
  IsCTScan: any = false;
  IsMRI: any = false;
  SpecialiseID: any = undefined;
  IsMRIClick: any = 0;
  prescriptionSaveData: any = {};
  errorMessages: any;
  savedDrugPrescriptionId: number = 0;
  savedInvPrescriptionId: number = 0;
  savedProcPrescriptionId: number = 0;
  antibioticTemplateValue = '';
  savedMonitorId: number = 0;
  facility: any;
  hospitalId: any;
  ctasScore: string = "0";
  orderPackId = "0";
  entryId = 0;
  loaDataList: any = [];
  loaServicesDataList: any = [];
  loaDiagnosis: string = "";
  loaCc: any;
  radForm: any;
  timeout = 1000;
  IsPreg: any = false;
  IsPed: any = false;
  tariffId: number = 0;
  selectedService: any;
  investigationsForm: FormGroup;
  proceduresForm: FormGroup;
  actionableAlert: any;
  actionableAlertmsg: any;
  tempSelectedInvProcList: any = [];
  selectedInvProc: any;
  visitDiagnosis: any = [];
  isInvSub: boolean = false;
  isProSub: boolean = false;
  remarksForSelectedInvName: any;
  remarksForSelectedInvId: any;
  remarksSelectedIndex: number = -1;
  remarksForSelectedDiscontinuedItemId: any;
  remarksForSelectedDiscontinuedPrescId: any;
  remarksForSelectedDiscontinuedItemName: any;
  remarksForSelectedHoldItemId: any;
  remarksForSelectedHoldPrescId: any;
  remarksForSelectedHoldItemName: any;
  remarksForSelectedProcName: any;
  remarksForSelectedProcId: any;
  remarksForSelectedMedName: any;
  selectedProcRemarks: any;
  GenericBrand: any = "0";
  GenericBrandtoggleValue: string = 'Brand';
  ipPrescriptionList: any = [];
  allPrescriptionList: any = [];
  allPrescriptionListDetails: any = []
  ipPrescriptionCount: any;
  itemSelected: string = "false";
  AdmRoutesList: any;
  AdmRoutesListMaster: any;
  AdmRoutesListGridRow: any;
  durationList: any;
  frequenciesList: any;
  medicationReasonsList: any;
  drugFrequenciesList: any;
  medicationInstructions: any;
  listOfItems: any;
  isPRN: boolean = false;
  selectedMedDrugFreqScheduleTime: any;
  tempSelectedMedicationList: any = [];
  prescriptionValidationMsg: any;
  prescriptionValidationMsgEnddate: any;
  tempprescriptionSelected: any;
  substituteItems: any = [];
  showSubstituteSelectValidationMsg = false;
  prevChiefCompl: any;
  prevPhyExam: any;
  duplicateItemsList: any;

  patientRadiologyRequestId: any = 0;
  patientRadiologyRequestIdForMapping: any = 0;
  radiologyRequestDataList: any = [];
  InvPrescriptionIDForMapping: any = 0;
  selectedOption: string = "No";
  
  selectOption(option: string): void {
    this.selectedOption = option;
  }

  selectedPaediatricOption: string = "No";

  selectPaediatricOption(option: string): void {
    this.selectedPaediatricOption = option;
  }

  selectedSpecialOption: string = "No";

  selectSpecialOption(option: string): void {
    this.selectedSpecialOption = option;
  }

  selectedSedationOption: string = "No";

  selectSedationOption(option: string): void {
    this.selectedSedationOption = option;
  }

  selectedContrastOption: string = "No";

  selectContrastOption(option: string): void {
    this.selectedContrastOption = option;
  }

  selectedPreviousOption: string = "No";

  selectPreviousOption(option: string): void {
    this.selectedPreviousOption = option;
  }

  private saveClickSubject = new Subject<void>();

  form = new FormGroup({
    items: new FormArray([])
  });
  
  constructor(private config: ConfigService, private modalSvc: NgbModal, private fb: FormBuilder) {
    this.langData = this.config.getLangData();
    this.hospitalId = sessionStorage.getItem('hospitalId');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');

    this.investigationsForm = this.fb.group({
      InvestigationId: ['', Validators.required],
      InvestigationName: ['', Validators.required],
      Remarks: ['', Validators.required]
    });

    this.proceduresForm = this.fb.group({
      ProcedureId: ['', Validators.required],
      ProcedureName: ['', Validators.required],
      Quantity: [''],
      Remarks: ['', Validators.required]
    });

    this.medicationSchedulesForm = this.fb.group({
      ItemId: [''],
      ScheduleTime: [''],
      Dose: ['']
    });    

    if ((this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') ? this.selectedView.AgeValue : this.selectedView.Age >= 16 && this.selectedView.Gender === "Female") {
      this.IsPreg = true;
    }

    if ((this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') ? this.selectedView.AgeValue : this.selectedView.Age < 12) {
      this.IsPed = true;
    }

    this.saveClickSubject.pipe(debounceTime(1000)).subscribe(() => this.savePrescription());
    
   }

   get medicationScheduleitems(): FormArray {
    return this.medicationSchedulesForm.get('items') as FormArray;
  }

  get control() {
    return this.form.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.tariffId = this.selectedView.Tariffid ? this.selectedView.Tariffid : this.selectedView.TariffId ? this.selectedView.TariffId : '0';
    this.getPatientDiagnosis();
    this.prevChiefCompl = sessionStorage.getItem('prevChiefCompl');
    this.prevPhyExam = sessionStorage.getItem('prevPhyExam');
    this.FetchMedicationDemographics();
    this.FetchDrugFrequencies();
    this.FetchMedicationInstructions();
    this.initializeMedicationsForm();
    this.initiateRadForm();

    this.initializeSearchListener();
    this.initializeSearchInvProcListener();
    this.initializeSearchProcListener();

    this.medicationSchedulesForm = this.fb.group({
      items: this.fb.array([])
    });
  }

  getPatientDiagnosis() {
    this.config.FetchVisitDiagnosis(this.selectedView.AdmissionID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.visitDiagnosis = response.GetVisitDiagnosisList;
        }
      })
  }

  initializeSearchInvProcListener() {
    this.searchInputInvProc$
      .pipe(
        debounceTime(this.timeout)
      )
      .subscribe(filter => {
        if (filter.length > 2) {
          this.getInvestigationProcedureDetails(filter, '3');
        }
        else {
          this.investigationData = []; this.proceduresData = [];
        }
      });
  }
  initializeSearchProcListener() {
    this.searchInputProc$
      .pipe(
        debounceTime(this.timeout)
      )
      .subscribe(filter => {
        if (filter.length > 2) {
          this.getProcedureDetails(filter, '5');
        }
        else {
          this.investigationData = []; this.proceduresData = [];
        }
      });
  }

  initializeMedicationsForm(): void {
    this.medicationsForm = this.fb.group({
      ItemId: ['', Validators.required],
      ItemName: ['', Validators.required],
      AdmRouteId: ['', Validators.required],
      AdmRoute: ['', Validators.required],
      FrequencyId: ['', Validators.required],
      Frequency: ['', Validators.required],
      ScheduleStartDate: ['', Validators.required],
      StartFrom: [''],
      Dosage: [''],
      DosageId: ['', Validators.required],
      Strength: ['', Validators.required],
      StrengthUoMID: ['', Validators.required],
      StrengthUoM: ['', Validators.required],
      IssueUOMValue: ['', Validators.required],
      IssueUoM: ['', Validators.required],
      IssueUOMID: ['', Validators.required],
      IssueTypeUOM: ['', Validators.required],
      DefaultUOMID: ['', Validators.required],
      DurationValue: ['', Validators.required],
      DurationId: ['', Validators.required],
      Duration: ['', Validators.required],
      medInstructionId: [''],
      PresInstr: [''],
      Quantity: ['', Validators.required],
      PresTypeId: [''],
      PresType: [''],
      PRNType: [''],
      QuantityUOM: ['', Validators.required],
      QuantityUOMId: ['', Validators.required],
      GenericId: ['', Validators.required],
      IsPRN: [''],
      PRNREASON: [''],
      Remarks: [''],
      IsFav: [''],
      ScheduleTime: [''],
      ScheduleEndDate: [''],
      CustomizedDosage: [''],
      QOH: [''],
      IVFluidStorageCondition: [''],
      BaseSolutionID: [''],
      IVFluidExpiry: [''],
      Price: [''],
      DiagnosisId: ['', Validators.required],
      DiagnosisName: [''],
      DiagnosisCode: [''],
      IsAntibiotic: [''],
      IsAntibioticForm:['']
    });
  }

  initiateRadForm() {
    this.radForm = this.fb.group({
      LMPDate: [''],
      IsNormalKidneyFunction: [false],
      IsChronicRenalImpairment: [false],
      IsAcuteKidneyInjury: [false],
      IsHaemodialysis: [false],
      SerumCreatinineLevel: [''],
      ActiveIssues: [''],
      Diagnosis: [''],
      QAndA: ['']
    });
  }

  onInvestigationMouseDown(event: any) {
    if (event.target.value.length === 0) {
      this.searchInputInvProc$.next('%%%');
    }
  }

  onProceduresMouseDown(event: any) {
    if (event.target.value.length === 0) {
      this.searchInputProc$.next('%%%');
    }
  }

  investigationDatasource(event: any) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      const inputValue = event.target.value;
      this.searchInputInvProc$.next(inputValue);
    }
  }

  procedureDatasource(event: any) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      const inputValue = event.target.value;
      this.searchInputProc$.next(inputValue);
    }
  }

  getInvestigationProcedureDetails(Name: any, Param1: any) {
    this.config.getInvestigationProcedureDetailsNH(Name.trim(), 3, this.tariffId, this.selectedView.PatientType, this.hospitalId, this.doctorDetails[0].EmpId).subscribe((response) => {
      if (response.Status === "Success") {
        if (Param1 === "3") {
          this.searchData = [];
          this.investigationData = response.InvestigationsAndProceduresList;
          response.InvestigationsAndProceduresList.forEach((element: any, index: any) => {
            let d = new InvestigationProcedures(element.Name);
            this.searchData.push(d);
          });
          if (this.searchData) {
            this.investigationresults$.next(this.searchData);
          }
        }
        else if (Param1 === 5) {
          this.proceduresData = response.InvestigationsAndProceduresList;
          response.InvestigationsAndProceduresList.forEach((element: any, index: any) => {
            let d = new InvestigationProcedures(element.Name);
            this.searchProceduresData.push(d);
          });
          if (this.searchProceduresData) {
            this.procedureresults$.next(this.searchProceduresData);
          }

        }
      }
    },
      (err) => {

      })
  }

  getProcedureDetails(Name: any, Param1: any) {
    this.config.getInvestigationProcedureDetailsNH(Name.trim(), 5, this.tariffId, this.selectedView.PatientType, this.hospitalId, this.doctorDetails[0].EmpId).subscribe((response) => {
      if (response.Status === "Success") {
        if (Param1 === "5") {
          this.searchProceduresData = [];
          this.proceduresData = response.InvestigationsAndProceduresList;
          response.InvestigationsAndProceduresList.forEach((element: any, index: any) => {
            let d = new InvestigationProcedures(element.Name);
            this.searchProceduresData.push(d);
          });
          if (this.searchProceduresData) {
            this.procedureresults$.next(this.searchProceduresData);
          }
        }
      }
    },
      (err) => {

      })
  }  

  onItemSelect(selected: any): void {
    if (selected) {
      if (this.selectedView.PatientType == "3") {
        this.config.CheckValidPrescribedItems(this.selectedView.PatientID, this.selectedView.AdmissionID, 3, selected.ServiceItemID, this.facility.FacilityID == undefined ? 0 : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
          if (response.Code === 200 && response.CheckValidPrescribedItemsDataList.length > 0) {
            this.errorMessages = response.CheckValidPrescribedItemsDataList[0].ItemName + " already prescribed by " + response.CheckValidPrescribedItemsDataList[0].DoctorName + " on " + response.CheckValidPrescribedItemsDataList[0].CreateDate + ". Do you wish to continue ?";
            this.selectedService = selected;
            $("#activeInvYesNo").modal('show');
          }
          else {
            this.continuePrescribingInvService(selected);
          }
        },
          (err) => {
          })
      }
      else {
        this.continuePrescribingInvService(selected);
      }
    }
  }

  onProcedureItemSelect(selected: any): void {
    if (selected) {
      if (this.selectedView.PatientType == "3") {
        this.config.CheckValidPrescribedItems(this.selectedView.PatientID, this.selectedView.AdmissionID, 3, selected.ServiceItemID, this.facility.FacilityID == undefined ? 0 : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
          if (response.Code === 200 && response.CheckValidPrescribedItemsDataList.length > 0) {
            this.errorMessages = "Service " + response.CheckValidPrescribedItemsDataList[0].ItemName + " already prescribed. Do you wish to continue ?";
            this.selectedService = selected;
            $("#activeProcYesNo").modal('show');
          }
          else {
            this.continuePrescribingProcService(selected);
          }
        },
          (err) => {
          })
      }
      else {
        this.continuePrescribingProcService(selected);
      }
    }
  }

  continuePrescribingInvService(selected: any) {
    var data = this.investigationData.filter((i: any) => i.Name == selected.Name);
    if (data) {
      this.changedInvestigationsList.push(data[0]);
      this.addInvestigationsRow(data[0]);
    }
    this.investigationData = [];
    this.investigationsForm.setValue({
      InvestigationId: '',
      InvestigationName: '',
      Remarks: ['']
    });
  }

  continuePrescribingProcService(selected: any) {
    var data = this.proceduresData.filter((i: any) => i.Name == selected.Name);
    if (data) {
      this.addProceduresRow(data[0]);
    }
    this.proceduresData = [];
    this.proceduresForm.setValue({
      ProcedureId: [''],
      ProcedureName: '',
      Quantity: [''],
      Remarks: ['']
    });
  }

  clearSelectedService() {
    this.selectedService = [];
    $("procSmartSearch").val('');
    $("#invprocSmartSearch").val('');
  }

  addInvestigationsRow(data?: any) {
    this.config.FetchServiceActionableAlerts(this.selectedView.AdmissionID, this.selectedView.AgeValue, data.ServiceItemID).subscribe((response) => {
      if (response.Status === "Success") {
        if (response.ActionItemDataList.length > 0) {
          if (response.ActionItemDataList[0].PopupMessage == true) {
            this.actionableAlert = response.ActionItemDataList[0].Justifications;
            $("#showActionableAlerts").modal('show');
            this.tempSelectedInvProcList = data;
          }
          else if (response.ActionItemDataList[0].PopupMessage == false && response.ActionItemDataList[0].strMessage != "" && response.ActionItemDataList[0].strMessage != null) {
            this.actionableAlertmsg = response.ActionItemDataList[0].strMessage;
            $("#showActionableAlertsMsg").modal('show');
          }
          else {
            if (data.ServiceID == "3") {
              let findInv;
              if (this.investigationsList.length > 0) {
                findInv = this.investigationsList.filter((x: any) => x?.ServiceItemId === data.ServiceItemID);
              }
              if (findInv != undefined && findInv.length > 0) {
                this.selectedInvProc = findInv[0].Name;
                $("#invProcAlreadySelected").modal('show');
              }
              else {
                this.showInvListdiv = true;
                let DISID = '';
                if (this.investigationsList.length > 0 && this.isInvesigationsAll) {
                  DISID = this.investigationsList[0].DISID;
                }
                this.investigationsList.push({
                  ID: this.investigationsList.length + 1, SOrN: this.selectedView.PatientType === "3" ? "S" : 'N', Name: data.Name, Specialisation: data.Specialisation, Quantity: 1,
                  ServiceItemId: data.ServiceItemID, SpecialisationId: data.SpecialiseID, ServiceTypeId: data.ServiceTypeID, SpecimenId: data.SpecimenID,
                  Remarks: data.Remarks == undefined ? "" : data.Remarks, IsFav: data.IsFav, Status: 0, disableDelete: false, TATRemarks: data.TATRemarks,
                  ResultStatus: data.ResultStatus, ItemPrice : this.selectedView.BillType === 'Insured' ? data.CompanyPrice : data.BasePrice,
                  DEPARTMENTID : data.DepartmentID,
                  DISID
                })
              }
            }
            else if (data.ServiceID == "5") {
              let findProc;
              if (this.proceduresList.length > 0) {
                findProc = this.proceduresList.filter((x: any) => x?.ServiceItemId === data.ServiceItemID);
              }
              if (findProc != undefined && findProc.length > 0) {
                this.selectedInvProc = findProc[0].Name;
                $("#invProcAlreadySelected").modal('show');
              }
              else {
                this.showProcListdiv = true;
                this.proceduresList.push({
                  ID: this.proceduresList.length + 1, SOrN: this.selectedView.PatientType === "3" ? "S" : 'N', Name: data.Name, Specialisation: data.Specialisation, Quantity: 1,
                  ServiceItemId: data.ServiceItemID, SpecialisationId: data.SpecialiseID, ServiceTypeId: data.ServiceTypeID, Remarks: data.Remarks == undefined ? "" : data.Remarks,
                  IsFav: data.IsFav, Status: 0, TATRemarks: '', ResultStatus: '', ItemPrice : this.selectedView.BillType === 'Insured' ? data.CompanyPrice : data.BasePrice,
                  DEPARTMENTID : data.DepartmentID
                })
              }
            }
          }
        }
        $("#invprocSmartSearch").val('');
      }
    },
      (err) => {
      })
  }

  addProceduresRow(data?: any) {
    if (data) {
      let DISID = '';
      if (this.proceduresList.length > 0 && this.isProceduresAll) {
        DISID = this.proceduresList[0].DISID;
      }
      this.proceduresList.push({
        ID: this.proceduresList.length + 1, SOrN: 'N', Name: data.Name, Specialisation: data.Specialisation, Quantity: 1,
        ServiceItemId: data.ServiceItemID, SpecialisationId: data.SpecialiseID, ServiceTypeId: data.ServiceTypeID, IsFav: data.IsFav, TATRemarks: '',
        ResultStatus: '', 
        ItemPrice : this.selectedView.BillType === 'Insured' ? data.CompanyPrice : data.BasePrice,
        DISID
      })
      this.showProcListdiv = true;
    }
    setTimeout(() => {
      $("#procSmartSearch").val('');
    }, 0);
  }

  changeInvestigationDiagnosis() {
    if (this.investigationsList.length > 0) {
      this.isInvesigationsAll = !this.isInvesigationsAll;
      const firstItem = this.investigationsList[0];
      this.investigationsList.forEach((item: any) => {
        item.DISID = this.isInvesigationsAll ? firstItem.DISID : '';
      })
    }
  }

  changeProcedureDiagnosis() {
    if (this.proceduresList.length > 0) {
      this.isProceduresAll = !this.isProceduresAll;
      const firstItem = this.proceduresList[0];
      this.proceduresList.forEach((item: any) => {
        item.DISID = this.isProceduresAll ? firstItem.DISID : '';
      })
    }
  }

  allowInvProcSelected() {
    $("#showActionableAlerts").modal('hide');
    if (this.tempSelectedInvProcList.ServiceID == "3") {
      this.showInvListdiv = true;
      this.investigationsList.push({
        ID: this.investigationsList.length + 1, SOrN: 'N', Name: this.tempSelectedInvProcList.Name, Specialisation: this.tempSelectedInvProcList.Specialisation, Quantity: 1,
        ServiceItemId: this.tempSelectedInvProcList.ServiceItemID, SpecialisationId: this.tempSelectedInvProcList.SpecialiseID, ServiceTypeId: this.tempSelectedInvProcList.ServiceTypeID, SpecimenId: this.tempSelectedInvProcList.SpecimenID,
        Remarks: this.tempSelectedInvProcList.Remarks, IsFav: this.tempSelectedInvProcList.IsFav, Status: 0, disableDelete: false, TATRemarks: this.tempSelectedInvProcList.TATRemarks, ResultStatus: this.tempSelectedInvProcList.ResultStatus,
        ItemPrice : this.selectedView.BillType === 'Insured' ? this.tempSelectedInvProcList.CompanyPrice : this.tempSelectedInvProcList.BasePrice,
        DEPARTMENTID : this.tempSelectedInvProcList.DepartmentID
      })
    }
    else if (this.tempSelectedInvProcList.ServiceID == "5") {
      this.showProcListdiv = true;
      this.proceduresList.push({
        ID: this.proceduresList.length + 1, SOrN: 'N', Name: this.tempSelectedInvProcList.Name, Specialisation: this.tempSelectedInvProcList.Specialisation, Quantity: 1,
        ServiceItemId: this.tempSelectedInvProcList.ServiceItemID, SpecialisationId: this.tempSelectedInvProcList.SpecialiseID, ServiceTypeId: this.tempSelectedInvProcList.ServiceTypeID,
        Remarks: this.tempSelectedInvProcList.Remarks, IsFav: this.tempSelectedInvProcList.IsFav, Status: 0, disableDelete: false, TATRemarks: '', ResultStatus: '',
        ItemPrice : this.selectedView.BillType === 'Insured' ? this.tempSelectedInvProcList.CompanyPrice : this.tempSelectedInvProcList.BasePrice,
        DEPARTMENTID : this.tempSelectedInvProcList.DepartmentID
      })
    }
    this.tempSelectedInvProcList = [];
  }

  openInvRemarksPopup(index: any) {
    this.isInvSub = true;
    this.remarksForSelectedInvName = index.Name;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedInvId = index.ServiceItemId;
    const remarks = index.Remarks;//this.recordRemarks.get(index) || '';
    this.investigationsForm.get('Remarks')?.setValue(remarks);
    $("#investigation_remark").modal('show');
    // this.investigationsForm.reset();
    this.isInvSub = false;
  }

  openProvRemarksPopup(index: any) {
    this.remarksForSelectedProcName = index.Name;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedProcId = index.ServiceItemId;
    const remarks = index.Remarks;//this.recordRemarks.get(index) || '';
    this.proceduresForm.get('Remarks')?.setValue(remarks);
  }

  investigationRemarks(inv: any, invId: any) {
    this.isInvSub = true;
    const remark = this.investigationsForm.get('Remarks')?.value || '';
    // this.remarksMap.set(this.remarksSelectedIndex, remark);
    // this.recordRemarks.set(this.remarksSelectedIndex, remark);
    let findInv = this.investigationsList.find((x: any) => x?.ServiceItemId === invId);
    if (findInv) {
      const index = this.investigationsList.indexOf(findInv, 0);
      if (index > -1) {
        findInv.ID = findInv.ID
        findInv.SOrN = findInv.SOrN;
        findInv.Name = findInv.Name;
        findInv.Specialisation = findInv.Specialisation;
        findInv.Quantity = findInv.Quantity,
          findInv.ServiceItemId = findInv.ServiceItemId;
        findInv.SpecialisationId = findInv.SpecialisationId;
        findInv.ServiceTypeId = findInv.ServiceTypeId;
        findInv.SpecimenId = findInv.SpecimenId;
        findInv.Remarks = remark;
        this.investigationsList[index] = findInv;
      }
    }
    if (remark == '')
      $("#investigation_remark").modal('show');
    else
      $("#investigation_remark").modal('hide');
  }

  procedureRemarks(proc: any, procid: any) {
    this.isProSub = true;
    const remark = this.proceduresForm.get('Remarks')?.value || '';
    // this.remarksMap.set(this.remarksSelectedIndex, remark);
    // this.recordRemarks.set(this.remarksSelectedIndex, remark);
    let findProc = this.proceduresList.find((x: any) => x?.ServiceItemId === procid);
    if (findProc) {
      const index = this.proceduresList.indexOf(findProc, 0);
      if (index > -1) {
        findProc.ID = findProc.ID
        findProc.SOrN = findProc.SOrN;
        findProc.Name = findProc.Name;
        findProc.Specialisation = findProc.Specialisation;
        findProc.Quantity = findProc.Quantity,
          findProc.ServiceItemId = findProc.ServiceItemId;
        findProc.SpecialisationId = findProc.SpecialisationId;
        findProc.ServiceTypeId = findProc.ServiceTypeId;
        findProc.Remarks = remark;
        this.proceduresList[index] = findProc;
      }
    }
  }

  deleteInvestigation(index: any) {
    const inv = this.savedInvPrescriptions.find((x: any) => x.PID === this.investigationsList[index].ServiceItemId);
    if (inv && Number(inv.DoctorID) !== this.doctorDetails[0].EmpId) {
      this.errorMessages = "Cannot delete as the Order has been raised by another doctor";
      $("#errorMsg").modal('show');
      return;
    }
    if (this.selectedView.PatientType === '2'||this.selectedView.PatientType === '4') {
      if (Number(this.investigationsList[index].ResultStatus) > 1) {
        this.errorMessages = "Cannot delete as the Order has been already processed";
        $("#errorMsg").modal('show');
        return;
      }
    }
    else if (this.selectedView.PatientType === '1') {
      if (Number(this.investigationsList[index].ResultStatus) >= 1) {
        this.errorMessages = "Cannot delete as the Order has been already processed";
        $("#errorMsg").modal('show');
        return;
      }
    }
    this.investigationsList.splice(index, 1);
    if (this.investigationsList.length === 0) {
      this.showInvListdiv = false;
      this.isInvesigationsAll = false;
    }
  }

  deleteProcedure(index: any) {
    const inv = this.savedProcPrescriptions.find((x: any) => x.PID === this.proceduresList[index].ServiceItemId);
    if (inv && Number(inv.DoctorID) !== this.doctorDetails[0].EmpId) {
      this.errorMessages = "Cannot delete as the Order has been raised by another doctor";
      $("#errorMsg").modal('show');
      return;
    }
    if (this.selectedView.PatientType === '2'||this.selectedView.PatientType === '4') {
      if (Number(this.proceduresList[index].ResultStatus) > 1) {
        this.errorMessages = "Cannot delete as the Order has been already processed";
        $("#errorMsg").modal('show');
        return;
      }
    }
    else if (this.selectedView.PatientType === '1') {
      if (Number(this.proceduresList[index].ResultStatus) >= 1) {
        this.errorMessages = "Cannot delete as the Order has been already processed";
        $("#errorMsg").modal('show');
        return;
      }
    }
    this.proceduresList.splice(index, 1);
    if (this.proceduresList.length === 0) {
      this.showProcListdiv = false;
      this.isProceduresAll = false;
    }
  }

  ProcedureQuantity(index: any, event: any) {
    this.proceduresList[index].Quantity = event.target.value;
  }

  getDiagnosisMappingName(diagId: string) {
    if (diagId?.length != undefined && diagId?.length > 0) {
      if (diagId[0] === '') {
        return 'Diagnosis';
      }
    }
    else if (diagId === "" || diagId === null || diagId === '0' || diagId === undefined) {
      return 'Diagnosis';
    }
    const diag = this.visitDiagnosis?.find((x: any) => x.DiseaseID == diagId);
    return diag?.DiseaseName;
  }

  toggleStatNormal(type: string) {
    if (type === 'normal') {
      this.toggleValue = 'Normal';
      this.investigationsList.forEach(element => {
        element.SOrN = 'N';
      });
      this.proceduresList.forEach(element => {
        element.SOrN = 'N';
      });
    }
    else {
      this.toggleValue = 'Stat';
      this.investigationsList.forEach(element => {
        element.SOrN = 'S';
      });
      this.proceduresList.forEach(element => {
        element.SOrN = 'S';
      });
    }
  }

  onSavePrescriptionClick() {
    this.saveClickSubject.next();
  }

  savePrescription() {
    this.saveAllPrescription();
  }

  saveAllPrescription() {
    this.prescriptionSaveData = {};
    this.IsMRIClick = 0;
    if (this.selectedItemsList.length > 0 || this.investigationsList.length > 0 || this.proceduresList.length > 0) {
      //Validation Diagnosis Mapping
      const diagMapping = this.selectedItemsList.filter((x: any) => x.DiagnosisId === '' || x.DiagnosisId === undefined);
      if (diagMapping.length > 0) {
        $("#mapDiagnosisMedicationdiv").modal('show');
        return;
      }
      const Antibiotics = this.getAntibioticsCount();
      if (Antibiotics > 0 && this.antibioticTemplateValue === '') {
        $('#antibioticsMsg').modal('show');
        return;
      }
      if (this.investigationsList.length > 0) {
        const investigationDiagnosisNotEntered = this.investigationsList.filter((item: any) => !item.DISID);
        if (investigationDiagnosisNotEntered.length > 0) {
          this.errorMessages = "Please select diagnosis for investigations.";
          $("#errorMsg").modal('show');
          return;
        }
      }

      if (this.proceduresList.length > 0) {
        const procedureDiagnosisNotEntered = this.proceduresList.filter((item: any) => !item.DISID);
        if (procedureDiagnosisNotEntered.length > 0) {
          this.errorMessages = "Please select diagnosis for procedures.";
          $("#errorMsg").modal('show');
          return;
        }
      }
      
      var validate = this.ValidateDrugDetails();
      if (validate.toString().split("^")[0] != "false") {
        this.FormDrugDetails();
        let postData = {
          "DrugPrescriptionID": this.savedDrugPrescriptionId != 0 ? this.savedDrugPrescriptionId : 0,
          "TestPrescriptionID": this.savedInvPrescriptionId != 0 ? this.savedInvPrescriptionId : 0,
          "ProcPrescriptionID": this.savedProcPrescriptionId != 0 ? this.savedProcPrescriptionId : 0, 
          "MonitorID": this.savedMonitorId != 0 ? this.savedMonitorId : (this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') ? this.savedMonitorId : 0,
          "Prescriptiondate": moment(new Date()).format('DD-MMM-YYYY')?.toString(),
          "PatientID": this.selectedView.PatientID,
          "DoctorID": (this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') ? this.selectedView.ConsultantID : this.doctorDetails[0].EmpId,
          "IPID": parseInt(this.selectedView.AdmissionID),
          "BedID": (this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') ? this.selectedView.BedID : 0,
          "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
          "Patienttype": this.selectedView.PatientType,
          "MonitorIndex": 1,
          "BillID": this.selectedView.BillID,
          "LetterID": this.selectedView.LetterID,
          "BillType": this.selectedView.BillType == 'Insured' ? 'CR' : 'CS',
          "CompanyID": this.selectedView.CompanyID,
          "GradeID": this.selectedView.GradeID,
          "BillItemSeq": 0,
          "PackageID": 0,
          "Ddetails": JSON.stringify(this.drugDetails),
          "Pdetails": JSON.stringify(this.procedureDetails),
          "Idetails": JSON.stringify(this.investigationDetails),
          "UserID": this.doctorDetails[0].UserId,
          "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, //this.patientType == '2' ? this.facility.FacilityID : 0,
          "OneTimeIssue": 1,
          "STATUS": (this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') ? 2 : 1,
          "ScheduleID": 0,
          "IsDisPrescription": 0,
          "RaiseDrugOrder": (this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') ? 1 : 0,//0,
          "ActionType": 0,
          "PrescriptionType": "D",
          "Dremarks": "",
          "CSTemplateID": 0,
          "ComponentID": 0,
          "DrugOrdertypeId": "36",
          "POrdertypeId": "37",
          "IOrdertypeId": "13",
          "PrscritionStats": 0,
          "PainScoreID": 0,
          "IsPatientDrugAlleric": 0,
          "HasPreviousMedication": 0,
          "IsAdminReconciliation": 0,
          "IsDrugPresciptionNotModified": 0,
          "Iwadtaskdetails": JSON.stringify(this.drugDetails),
          "AntiMicrobialOrderSheet": this.antibioticTemplateValue,
          "InvestigationSchedules": "",
          "Hospitalid": this.hospitalId,
          "LexcomIntractions": "",
          "IsContrastAllergic": 0,
          "IVFDetails": JSON.stringify(this.ivfDetails),
          "PBMJustification": "",
          "CTASScore": this.ctasScore,
          "OrderPackID": this.orderPackId,
          "EntryId": this.entryId,
          "IsFollowup": this.selectedView.OrderTypeID === '50' ? 1 : 0,
          "InsuranceCompanyID" : this.selectedView.InsuranceCompanyID
        };

        if (this.SpecialiseID === undefined || this.savedInvPrescriptionId > 0) {
          // const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
          //   backdrop: 'static'
          // });
          //modalRef.componentInstance.dataChanged.subscribe((data: string) => {
            //if (data) {
              this.config.saveAllPrescription(postData).subscribe(
                (response) => {
                  if (response.Code == 200) {
                    if (response.appReqList && response.appReqList.items.length > 0 && this.selectedView.PatientType === '1' && 
                        (response.appReqList.items.filter((x:any) => x.isCovered === 'Not Covered' || x.isCovered === 'Need Approval').length > 0) &&
                      (this.selectedView.BillType == 'Insured' || this.selectedView.BillType =='CR')) {
                      this.loaServicesDataList = response.appReqList.items;
                      this.loaDiagnosis = response.appReqList.diagnosis?.map((item: any) => item.name).join(', ');
                      this.loaCc = response.appReqList.cc?.map((item: any) => item.name).join(', ');
                      $("#approvalRequest").modal('show');
                    }
                    else {
                      $("#selectedMessage").modal('hide');
                      this.selectedItemsList = []; this.investigationsList = []; this.proceduresList = [];
                      $("#savePrescriptionMsg").modal('show');
                      setTimeout(() => {
                        $("#savePrescriptionMsg").modal('hide');
                        this.clearPrescriptionScreen();
                      }, 1000)
                    }
                  } else {

                  }
                },
                (err) => {
                  console.log(err)
                });
            //}
            //modalRef.close();
          //});

        }
        else {
          this.prescriptionSaveData = postData;
          if (this.savedInvPrescriptionId > 0) {
            this.config.fetchPatientRadiologyRequestForms(this.savedInvPrescriptionId, this.hospitalId)
              .subscribe((response: any) => {
                if (response.Code == 200) {
                  if (response.FetchPatientRadiologyRequestFDataList.length > 0) {
                    this.fetchDiagnosisForMRIForm();
                    $("#refill_modal").modal('show');
                    var radData = response.FetchPatientRadiologyRequestFDataList[0];
                    var checkList = response.FetchPatientRadiologySafetyChecklistFDataList;

                    this.selectedOption = radData.IsPregnant === 0 ? "No" : radData.IsPregnant === 1 ? "Yes" : radData.IsPregnant === 2 ? "Unsure" : "Check";
                    this.selectedPaediatricOption = radData.IsPaediatricSpecialNeed ? "Yes" : "No";
                    this.selectedSpecialOption = radData.SpecialNeed ? "Yes" : "No";
                    this.selectedSedationOption = radData.IsSedationRequired ? "Yes" : "No";
                    this.selectedContrastOption = radData.IsContrastRequired ? "Yes" : "No";
                    this.selectedPreviousOption = radData.IsPreviousRadiologyStudy ? "Yes" : "No";
                    this.patientRadiologyRequestId = radData.PatientRadiologyRequestId;

                    this.radForm.patchValue({
                      LMPDate: new Date(radData.LMPDate),
                      IsNormalKidneyFunction: radData.IsNormalKidneyFunction,
                      IsChronicRenalImpairment: radData.IsChronicRenalImpairment,
                      IsAcuteKidneyInjury: radData.IsAcuteKidneyInjury,
                      IsHaemodialysis: radData.IsHaemoDialysis,
                      SerumCreatinineLevel: radData.LastSerumCreatinineLevel,
                      ActiveIssues: radData.BriefClinicalHistory,
                      QAndA: radData.ClinicalQuestion
                    });

                    this.radiologyRequestDataList = [];
                    checkList.forEach((element: any, index: any) => {
                      let chk = {
                        "SafetyChecklistId": element.SafetyChecklistId,
                        "SpecialiseID": element.SpecialiseID,
                        "Specialisation": element.Specialisation,
                        "SafetyChecklistName": element.SafetyChecklistName,
                        "SafetyChecklistName2L": element.SafetyChecklistName2L,
                        "selectedValue": element.IsSafety
                      }
                      this.radiologyRequestDataList.push(chk);
                    });

                  }
                }
              });
          }
          else {
            this.LoadCheckList();
          }

        }

      }
      else if (validate.toString().split("^")[1] == "openOrderPackModifiedPopup") {
        $("#selectedMessage").modal('show');
        //this.openOrderPackNotUsingJustification();
      }
      else {
        validate.toString().split("^")[1] == "NoProcQty" ? $("#validateProceduresMsg").modal('show') : $("#validatePrescriptionMsg").modal('show');
      }
    }
    else {
      if (this.savedDrugPrescriptionId != 0 || this.savedInvPrescriptionId != 0 || this.savedProcPrescriptionId != 0) {
        let postData = {
          "DrugPrescriptionID": this.savedDrugPrescriptionId != 0 ? this.savedDrugPrescriptionId : 0,//this.patientType == '1' ? this.savedDrugPrescriptionId : 0,
          "TestPrescriptionID": this.savedInvPrescriptionId != 0 ? this.savedInvPrescriptionId : 0,
          "ProcPrescriptionID": this.savedProcPrescriptionId != 0 ? this.savedProcPrescriptionId : 0, //this.patientType == '1' ? this.savedProcPrescriptionId : 0,
          "MonitorID": this.savedMonitorId != 0 ? this.savedMonitorId : (this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') ? this.savedMonitorId : 0,
          "Prescriptiondate": moment(new Date()).format('DD-MMM-YYYY')?.toString(),
          "PatientID": this.selectedView.PatientID,
          "DoctorID": (this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') ? this.selectedView.ConsultantID : this.doctorDetails[0].EmpId,
          "IPID": parseInt(this.selectedView.AdmissionID),
          "BedID": (this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') ? this.selectedView.BedID : 0,//0,
          "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
          "Patienttype": this.selectedView.PatientType,
          "MonitorIndex": 1,
          "BillID": this.selectedView.BillID,
          "LetterID": this.selectedView.LetterID,
          "BillType": this.selectedView.BillType == 'Insured' ? 'CR' : 'CS',
          "CompanyID": this.selectedView.CompanyID,
          "GradeID": this.selectedView.GradeID,
          "BillItemSeq": 0,
          "PackageID": 0,
          "Ddetails": JSON.stringify(this.drugDetails),
          "Pdetails": JSON.stringify(this.procedureDetails),
          "Idetails": JSON.stringify(this.investigationDetails),
          "UserID": this.doctorDetails[0].UserId,
          "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, //this.patientType == '2' ? this.facility.FacilityID : 0,
          "OneTimeIssue": 1,
          "STATUS": 1,
          "ScheduleID": 0,
          "IsDisPrescription": 0,
          "RaiseDrugOrder": (this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') ? 1 : 0,//0,
          "ActionType": 0,
          "PrescriptionType": "D",
          "Dremarks": "",
          "CSTemplateID": 0,
          "ComponentID": 0,
          "DrugOrdertypeId": "36",
          "POrdertypeId": "37",
          "IOrdertypeId": "13",
          "PrscritionStats": 0,
          "PainScoreID": 0,
          "IsPatientDrugAlleric": 0,
          "HasPreviousMedication": 0,
          "IsAdminReconciliation": 0,
          "IsDrugPresciptionNotModified": 0,
          "Iwadtaskdetails": JSON.stringify(this.drugDetails),
          "AntiMicrobialOrderSheet": this.antibioticTemplateValue,
          "InvestigationSchedules": "",
          "Hospitalid": this.hospitalId,
          "LexcomIntractions": "",
          "IsContrastAllergic": 0,
          "IVFDetails": JSON.stringify(this.ivfDetails),
          "PBMJustification": "",
          "CTASScore": this.ctasScore,
          "OrderPackID": this.orderPackId,
          "EntryId": this.entryId,
          "IsFollowup": this.selectedView.OrderTypeID === '50' ? 1 : 0,
          "InsuranceCompanyID" : this.selectedView.InsuranceCompanyID
        };

        // const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
        //   backdrop: 'static'
        // });
        //modalRef.componentInstance.dataChanged.subscribe((data: string) => {
          //if (data) {
            this.config.saveAllPrescription(postData).subscribe(
              (response) => {
                if (response.Code == 200) {
                  if (response.appReqList && response.appReqList.items.length > 0 && this.selectedView.PatientType === '1' && 
                    (response.appReqList.items.filter((x:any) => x.isCovered === 'Not Covered' || x.isCovered === 'Need Approval').length > 0) &&
                    (this.selectedView.BillType == 'Insured' || this.selectedView.BillType =='CR')) {
                    //this.loaDataList = response.LOADataList;
                    //this.loaServicesDataList = response.LOAServicesDataList;
                    this.loaDataList = response.appReqList;//response.LOADataList;
                    this.loaServicesDataList = response.appReqList.items;
                    this.loaDiagnosis = response.appReqList.diagnosis?.map((item: any) => item.name).join(', ');
                    this.loaCc = response.appReqList.cc?.map((item: any) => item.name).join(', ');
                    $("#approvalRequest").modal('show');
                  }
                  else {
                    $("#selectedMessage").modal('hide');
                    this.selectedItemsList = []; this.investigationsList = []; this.proceduresList = [];                    
                    $("#savePrescriptionMsg").modal('show');
                    setTimeout(() => {
                      $("#savePrescriptionMsg").modal('hide');
                      this.clearPrescriptionScreen();
                    }, 1000)
                  }
                } else {

                }
              },
              (err) => {
                console.log(err)
              });
          //}
          //modalRef.close();
        //});
      }
      else {
        $("#noPrescriptionSelected").modal('show');
      }
    }

  }

  ValidateDrugDetails() {
    var validateDrugDet = this.selectedItemsList.filter((s: any) => s.Duration == "" || s.AdmRouteId == "" || s.DurationId == "" || s.DurationValue == ""
      || s.FrequencyId == "" || s.Route == "");
    var validateProcDet = this.proceduresList.filter((p: any) => p.Quantity == 0 || p.Quantity == undefined);    
    if (validateDrugDet.length > 0) {
      return "false" + "^" + "NotValidDrug";
    }
    else if (validateProcDet.length > 0) {
      return "false" + "^" + "NoProcQty";
    }
    else
      return true;
  }

  FormDrugDetails() {
    this.IsCTScan = false;
    this.IsMRI = false;
    this.SpecialiseID = undefined;

    this.drugDetails = []; this.investigationDetails = []; this.procedureDetails = []; this.ivfDetails = [];
    this.selectedItemsList.forEach((element: any) => {
      this.drugDetails.push({
        SEQ: this.drugDetails.length + 1,
        ITM: element.ItemId,
        ITNAME: element.ItemName,
        DOS: element.Dosage.split(" ")[0],
        DOID: element.DosageId,
        FID: element.FrequencyId,
        DUR: element.Duration.split(" ")[0],
        DUID: element.DurationId,
        SFRM: moment(element.ScheduleStartDate).format('DD-MMM-YYYY hh:mm a')?.toString(),
        REM: element.Remarks,
        ARI: element.AdmRouteId,
        STM: element.ScheduleTime == undefined ? '' : element.ScheduleTime,
        FQTY: element.Quantity,
        EDT: element.ScheduleEndDate,
        CF: false,
        CD: element.CustomizedDosage == undefined ? '' : element.CustomizedDosage,
        // IUMVAL:
        QTYUOMID: element.QuantityUOMId,
        //QTYUOMID: element.StrengthUoMID,
        QTY: Number(element.Quantity),
        //QTY: Number(element.Strength.split(' ')[0]),
        STA: 0,
        // UCAFAPR: false,
        GID: element.GenericId,
        TQT: Number(element.Quantity),
        TID: element.DefaultUOMID,
        ISPSD: false,
        // TPOID:
        PATINS: element.PresInstr == "" ? "select" : element.PresInstr,
        PIID: element.medInstructionId == '' ? 0 : element.medInstructionId,
        REQQTY: Number(element.Quantity),
        REQUID: element.DefaultUOMID,
        // PISTATUS:
        // ARID:
        ISDRUGFLOW: false,
        ISPRN: element.IsPRN,
        PRNREASON: element.PRNReason,
        // LGDA:
        REM2L: "",
        JUST: "",
        // FCONFIG:
        ISANTIC: false,
        ANTICSTATUS: -1,
        OPACKID: 0,
        DISID: element.DISID,
        DefaultUOMID: element.DefaultUOMID,
        PrescriptionItemStatusNew: element.PrescriptionItemStatusNew == undefined ? "0" : element.PrescriptionItemStatusNew,

      })
      if (element.IVFluidStorageCondition === '1') {
        this.ivfDetails.push({
          SEQ: this.ivfDetails.length + 1,
          ItemID: element.ItemId,
          QTY: element.Quantity,
          DET: "",
          ItemName: element.ItemName,
          BaseSolutionID: element.BaseSolutionID,
          UOMID: element.DefaultUOMID,
          AdditiveCategoryID: 1,
          ExpiryTime: element.IVFluidExpiry + " hrs"
        });
      }
    });
    this.proceduresList.forEach((element: any) => {
      this.procedureDetails.push({
        // SEQ: this.investigationDetails.length +1,
        PID: element.ServiceItemId,
        PROCEDURE: element.Name,
        SID: 5,
        QTY: Number(element.Quantity),
        ISQ: this.proceduresList.length + 1,
        REM: element.Remarks,
        STID: element.ServiceTypeId,
        OTYID: element.SOrN == "N" ? 37 : 101,
        PRID: 0,
        RTID: 1,
        SLOC: 2,
        SDT: moment(new Date()).format('DD-MMM-YYYY'),
        TOID: 0,
        ORDERTYPE: "Routine",
        COMPONENTID: 0,
        COMPONENTNAME: "",
        APPROVALDATE: moment(new Date()).format('DD-MMM-YYYY HH:mm:ss tt')?.toString(),
        ISPSD: false,
        FAV: false,
        ISMANDATORY: false,
        TEMPLATE: "",
        SCREENDESIGNID: "",
        HOLDINGREASONID: 0,
        ISCONTRASTALLERGIC: false,
        STATUS: element.Status,
        DISID: element.DISID,
        DEPARTMENTID: element.DEPARTMENTID === undefined ? 0 : element.DEPARTMENTID
      })
    });
    this.investigationsList.forEach((element: any) => {

      if (element.SpecialisationId === "214") {
        this.IsCTScan = true;
        this.SpecialiseID = element.SpecialisationId;
      }

      if (element.SpecialisationId === "217") {
        this.IsMRI = true;
        this.SpecialiseID = element.SpecialisationId;
      }

      if (this.IsMRI & this.IsCTScan) {
        this.SpecialiseID = 0;
      }

      this.investigationDetails.push({
        PID: element.ServiceItemId,
        PROCEDURE: element.Name,
        SID: 3,
        QTY: 1,
        ISQ: this.investigationsList.length + 1,
        SPID: element.SpecimenId,
        REM: element.Remarks,
        STID: element.ServiceTypeId,
        OTYID: element.SOrN == "N" ? 13 : 15,
        SPEID: element.SpecialisationId,
        ISPSD: false,
        ISMANDATORY: false,
        TEMPLATE: "",
        SCREENDESIGNID: 0,
        HOLDINGREASONID: 0,
        ISSCHEDULE: false,
        ISNONSTAT: false,
        ISSTATTEST: false,
        STATUS: element.Status,
        DISID: element.DISID,
        DEPARTMENTID: element.DEPARTMENTID === undefined ? 0 : element.DEPARTMENTID
      })
    });
  }

  fetchDiagnosisForMRIForm() {
    this.config.fetchAdviceDiagnosis(this.selectedView.AdmissionID, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          var diag = "";
          response.PatientDiagnosisDataList.forEach((element: any, index: any) => {
            if (diag != "")
              diag = diag + "\n" + response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
            else
              diag = response.PatientDiagnosisDataList[index].Code + '-' + response.PatientDiagnosisDataList[index].DiseaseName;
          });
          this.radForm.get('Diagnosis')?.setValue(diag);
        }
      },
        (err) => {

        })
  }

  getAntibioticsCount() {
    return this.selectedItemsList.filter((item: any) => item.IsAntibioticForm.toString().toLowerCase() === 'true').length;
  }

  LoadCheckList() {
    this.fetchDiagnosisForMRIForm();
    $("#refill_modal").modal('show');
    this.config.fetchRadiologyRequestSafetyChecklists(this.SpecialiseID, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.radiologyRequestDataList = response.FetchRadiologyRequestDataList;
          this.radiologyRequestDataList.forEach((element: any, index: any) => {
            element.selectedValue = false;
          });
        }
      })
  }

  toggleGenericBrand(type: string) {
    if (type === 'Generic') {
      this.GenericBrandtoggleValue = 'Generic';
      this.GenericBrand = "1";
    }
    else {
      this.GenericBrandtoggleValue = 'Brand';
      this.GenericBrand = "0";
    }
  }

  MapDiagnosisMedication(pbm: string) {
    if (pbm === 'false') {
      $("#mapDiagnosisMedicationdiv").modal('show');
    }
  }

  openAntibioticTemplate() {
    if (this.getAntibioticsCount() > 0) {
      $('#antibioticsMsg').modal('hide');
      const antibioticModal = this.modalSvc.open(AntibioticComponent, {
        backdrop: 'static',
        size: 'xl',
        windowClass: 'vte_view_modal'
      });
      antibioticModal.componentInstance.data = this.antibioticTemplateValue;
      antibioticModal.componentInstance.dataChanged.subscribe((data: string) => {
        this.antibioticTemplateValue = data;
        antibioticModal.close();
      });
    }
  }

  FetchMedicationDemographics() {
    this.config.fetchMedicationDemographics("2,65,77,826", this.doctorDetails[0].EmpId, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.AdmRoutesListMaster = response.MedicationDemographicsAdministrationDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          this.AdmRoutesList = response.MedicationDemographicsAdministrationDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          // this.durationList = response.MedicationDemographicsDurationDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          // this.durationList.splice(3, 1);
          this.durationList = [];
          this.durationList.push({ "Type": "2", "Id": "3", "Names": "Days", "Names2L": "يوم" });
          this.durationList.push({ "Type": "2", "Id": "7", "Names": "Week(s)", "Names2L": "يوم" });
          this.durationList.push({ "Type": "2", "Id": "2", "Names": "Months", "Names2L": "يوم" });
          this.durationList.splice(2, 1); this.durationList.splice(3, 1);
          this.frequenciesList = response.MedicationDemographicsFrequencyDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          this.medicationReasonsList = response.MedicationDemographicsMedicationReasonDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
        }
      },
        (err) => {

        })

  }
  
  FetchDrugFrequencies() {
    this.config.fetchDrugFrequenciesNew(this.selectedView.PatientType, this.doctorDetails[0].EmpId, "0", this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.drugFrequenciesList = response.DrugFrequenciesDataList;//.sort((a: any, b: any) => a.Frequency.localeCompare(b.Frequency));
        }
      },
        (err) => {

        })
  }

  FetchMedicationInstructions() {
    this.config.fetchMedicationInstructions(this.doctorDetails[0].EmpId, "blocked=0", "0", this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.medicationInstructions = response.AdminMastersInstructionsDataList.sort((a: any, b: any) => a.name.localeCompare(b.name));
        }
      },
        (err) => {

        })
  }

  initializeSearchListener() {
    this.searchInput$
      .pipe(
        debounceTime(0)
      )
      .subscribe(filter => {
        if (filter.length >= 3) {
          this.config.fetchItemDetailsGB(filter, "0", this.hospitalId, this.doctorDetails[0].EmpId, this.GenericBrand)
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
      });
  }

  searchItem(event: any) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      const inputValue = event.target.value;
      this.searchInput$.next(inputValue);
    }
  }

  onRouteChange(event: any) {
    this.medicationsForm.get('AdmRoute')?.setValue(event.target.options[event.target.options.selectedIndex].text);
  }

  onFrequencyChange(event: any) {
    this.medicationsForm.get('Frequency')?.setValue(event.target.options[event.target.options.selectedIndex].text);
    this.selectedMedDrugFreqScheduleTime = this.drugFrequenciesList.find((x: any) => x.FrequencyID == event.target.value);
    this.CalculateQuantity();
  }

  onDurationChange(event: any) {
    this.medicationsForm.get('Duration')?.setValue(event.target.options[event.target.options.selectedIndex].text);
    this.CalculateQuantity();
  }

  onPresInstrChange(event: any) {
    this.medicationsForm.get('PresInstr')?.setValue(event.target.options[event.target.options.selectedIndex].text);
  }

  onPresTypeChange(event: any) {
    this.medicationsForm.get('PresType')?.setValue(event.target.options[event.target.options.selectedIndex].text);
    if (event.target.value == 1) {
      this.isPRN = true;
      this.medicationsForm.patchValue({
        IsPRN: true,

      })
    }
    else {
      this.isPRN = false;
      this.medicationsForm.patchValue({
        IsPRN: false,

      })
    }
  }
  onPRNTypeChange(event: any) {
    this.medicationsForm.get('PRNType')?.setValue(event.target.options[event.target.options.selectedIndex].text);
    this.medicationsForm.get('PRNReason')?.setValue(event.target.options[event.target.options.selectedIndex].text);
  }

  allowMedicationSelected() {
    $("#medicationActionableAlerts").modal('hide');
    this.config.fetchItemForPrescriptions(this.selectedView.PatientType, this.tempSelectedMedicationList.ItemID, "1", this.doctorDetails[0].EmpId,this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.itemSelected = "true";
          this.AdmRoutesList = response.ItemRouteDataList;
          const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
          this.medicationsForm.patchValue({
            ItemId: this.tempSelectedMedicationList.ItemID,
            ItemName: response.ItemDataList[0].DisplayName,
            DosageId: response.ItemDataList[0].QtyUomID,
            Strength: response.ItemDataList[0].Strength,
            StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
            StrengthUoM: response.ItemDataList[0].StrengthUoM,
            IssueUOMValue: response.ItemDataList[0].Quantity,
            IssueUoM: response.ItemDataList[0].QTYUOM,
            IssueUOMID: response.ItemDataList[0].IssueUOMID,
            ScheduleStartDate: new Date(),
            DefaultUOMID: (this.selectedView.PatientType === '2'||this.selectedView.PatientType === '4') ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
            IssueTypeUOM: itempacking[0].FromUoMID,
            QuantityUOMId: itempacking[0].FromUoMID,
            QuantityUOM: itempacking[0].FromUoM,
            GenericId: response.ItemGenericsDataList[0].GenericID,
            QOH: (this.selectedView.PatientType === '2'||this.selectedView.PatientType === '4') ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
            IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
            BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '' ? response.ItemDataList[0].Basesolution : '',
            IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '' ? response.ItemDataList[0].IVFluidExpiry : '',
            Remarks: '',
            Price: response.ItemPriceDataList[0].MRP
          })
          $('#StrengthUoM').html(response.ItemDataList[0].StrengthUoM);
          $('#IssueUoM').html(response.ItemDataList[0].QTYUOM);
          this.listOfItems = [];
        }
      },
        (err) => {
        })
  }

  onItemSelected(item: any) {
    var itemId = item.ItemID;
    this.config.FetchServiceActionableAlerts(this.selectedView.AdmissionID, this.selectedView.AgeValue, itemId).subscribe((response) => {
      if (response.Status === "Success" && response.ActionItemDataList.length > 0) {
        this.listOfItems = [];
        if (response.ActionItemDataList[0].PopupMessage == true) {
          this.actionableAlert = response.ActionItemDataList[0].Justifications;
          $("#medicationActionableAlerts").modal('show');
          this.tempSelectedMedicationList = item;
        }
        else if (response.ActionItemDataList[0].PopupMessage == false && response.ActionItemDataList[0].strMessage != "" && response.ActionItemDataList[0].strMessage != null) {
          this.actionableAlertmsg = response.ActionItemDataList[0].strMessage;
          $("#showActionableAlertsMsg").modal('show');
        }
        else {
          this.config.fetchItemForPrescriptions(this.selectedView.PatientType, itemId, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
            .subscribe((response: any) => {
              if (response.Code == 200) {
                this.config.FetchPrescriptionValidations(this.selectedView.AdmissionID, itemId, response.ItemGenericsDataList.length > 0 ? response.ItemGenericsDataList[0].GenericID : 0, response.ItemDataList[0].DisplayName.replace(/[^\w\s]/gi, ''), this.selectedView.PatientID, this.selectedView.AgeValue, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalId, this.selectedView.PatientType)
                  .subscribe((valresponse: any) => {
                    const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
                    if (valresponse.FetchPrescValidationsDataaList.length === 0) {
                      this.itemSelected = "true";
                      this.AdmRoutesList = response.ItemRouteDataList;
                      this.medicationsForm.patchValue({
                        ItemId: itemId,
                        ItemName: response.ItemDataList[0].DisplayName,
                        DosageId: response.ItemDataList[0].QtyUomID,
                        Dosage: response.ItemDataList[0].QTYUOM,
                        Strength: response.ItemDataList[0].Strength,
                        StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
                        StrengthUoM: response.ItemDataList[0].StrengthUoM,
                        IssueUOMValue: response.ItemDataList[0].Quantity,
                        IssueUoM: response.DefaultUOMDataaList[0].IssueUOM,
                        IssueUOMID: response.DefaultUOMDataaList[0].IssueUOMID,
                        ScheduleStartDate: new Date(),
                        DefaultUOMID: (this.selectedView.PatientType === '2'||this.selectedView.PatientType === '4') ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
                        IssueTypeUOM: itempacking[0].FromUoMID,
                        QuantityUOMId: response.DefaultUOMDataaList[0].IssueUOMID,
                        QuantityUOM: response.DefaultUOMDataaList[0].IssueUOM,
                        GenericId: response.ItemGenericsDataList.length > 0 ? response.ItemGenericsDataList[0].GenericID : 0,//response.ItemGenericsDataList[0].GenericID,
                        DurationValue: "1",
                        DurationId: "3",
                        Duration: "Days",
                        AdmRouteId: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteID : "",
                        AdmRoute: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteName : "",
                        IsFav: response.ItemDataList[0].IsFav,
                        QOH: (this.selectedView.PatientType === '2'||this.selectedView.PatientType === '4') ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
                        FrequencyId: this.selectedView.PatientType == "3" ? 41 : '',
                        Frequency: "STAT",
                        IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
                        BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '' ? response.ItemDataList[0].Basesolution : '',
                        IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '' ? response.ItemDataList[0].IVFluidExpiry : '',
                        Remarks: '',
                        Price: response.ItemPriceDataList.length > 0 ? response.ItemPriceDataList[0].MRP : 0,//response.ItemPriceDataList[0].MRP
                        IsAntibiotic: response.ItemDataList[0].IsAntibiotic,
                        IsAntibioticForm:response.ItemDataList[0].IsAntibioticForm
                      })
                      $('#StrengthUoM').html(response.ItemDataList[0].StrengthUoM);
                      $('#IssueUoM').html(response.DefaultUOMDataaList[0].IssueUOM);
                      $('#QuantityUOM').html(response.DefaultUOMDataaList[0].IssueUOM);
                      $('#Dosage').html(response.ItemDataList[0].QTYUOM);
                      this.CalculateQuantity();
                      if (Number(this.medicationsForm.get('QOH')?.value) === 0) {
                        this.prescriptionValidationMsg = this.medicationsForm.get('ItemName')?.value + " does not have enough quantity in Pharmacy. Please select a substitute.";
                        $("#NoQohMsgModal").modal('show');
                      }
                      this.listOfItems = [];
                    }
                    else {
                      if (valresponse.FetchPrescValidationsDataaList[0].Buttons == "YESNO") {
                        this.tempprescriptionSelected = response;
                        this.prescriptionValidationMsg = valresponse.FetchPrescValidationsDataaList[0].strMessage;
                        this.prescriptionValidationMsgEnddate = valresponse.FetchPrescValidationsDataaList[0].EndDate;
                        $("#prescriptionValidationMsgModalYesNo").modal('show');
                      }
                      else {
                        this.prescriptionValidationMsg = valresponse.FetchPrescValidationsDataaList[0].strMessage;
                        $("#prescriptionValidationMsgModal").modal('show');
                      }
                    }
                  },
                    (err) => {
                    })
              }
            },
              (err) => {
              })
        }
      }
      else {

        this.config.fetchItemForPrescriptions(this.selectedView.PatientType, itemId, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.config.FetchPrescriptionValidations(this.selectedView.AdmissionID, itemId, response.ItemGenericsDataList[0].GenericID, response.ItemDataList[0].DisplayName, this.selectedView.PatientID, this.selectedView.AgeValue, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalId, this.selectedView.PatientType)
                .subscribe((valresponse: any) => {
                  if (valresponse.FetchPrescValidationsDataaList.length === 0) {
                    this.itemSelected = "true";
                    this.AdmRoutesList = response.ItemRouteDataList;
                    const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
                    this.medicationsForm.patchValue({
                      ItemId: itemId,
                      ItemName: response.ItemDataList[0].DisplayName,
                      DosageId: response.ItemDataList[0].QtyUomID,
                      Dosage: response.ItemDataList[0].QTYUOM,
                      Strength: response.ItemDataList[0].Strength,
                      StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
                      StrengthUoM: response.ItemDataList[0].StrengthUoM,
                      IssueUOMValue: response.ItemDataList[0].Quantity,
                      IssueUoM: response.DefaultUOMDataaList[0].IssueUOM,
                      IssueUOMID: response.DefaultUOMDataaList[0].IssueUOMID,
                      ScheduleStartDate: new Date(),
                      DefaultUOMID: (this.selectedView.PatientType === '2'||this.selectedView.PatientType === '4') ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
                      IssueTypeUOM: itempacking[0].FromUoMID,
                      QuantityUOMId: response.DefaultUOMDataaList[0].IssueUOMID,
                      QuantityUOM: response.DefaultUOMDataaList[0].IssueUOM,
                      GenericId: response.ItemGenericsDataList[0].GenericID,
                      DurationId: "3",
                      Duration: "Days",
                      AdmRouteId: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteID : "",
                      AdmRoute: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteName : "",
                      IsFav: response.ItemDataList[0].IsFav,
                      QOH: (this.selectedView.PatientType === '2'||this.selectedView.PatientType === '4') ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
                      IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
                      BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '' ? response.ItemDataList[0].Basesolution : '',
                      IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '' ? response.ItemDataList[0].IVFluidExpiry : '',
                      Remarks: '',
                      Price: response.ItemPriceDataList[0].MRP,
                      IsAntibiotic: response.ItemDataList[0].IsAntibiotic,
                      IsAntibioticForm:response.ItemDataList[0].IsAntibioticForm
                    })
                    $('#StrengthUoM').html(response.ItemDataList[0].StrengthUoM);
                    $('#IssueUoM').html(response.DefaultUOMDataaList[0].IssueUOM);
                    $('#QuantityUOM').html(response.DefaultUOMDataaList[0].IssueUOM);
                    $('#Dosage').html(response.ItemDataList[0].QTYUOM);
                    this.listOfItems = [];
                  }
                  else {

                    $("#prescriptionValidationMsgModal").modal('show');
                    this.prescriptionValidationMsg = valresponse.FetchPrescValidationsDataaList[0].strMessage;
                    this.ClearPrescriptionItems();
                  }
                },
                  (err) => {
                  })
            }
          },
            (err) => {
            })
      }
    },
      (err) => {

      })

  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.medicationsForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  AddPrescriptionItemsToTable() {
    this.isMedicationFormSubmitted = true;
    var findInvalidControls = this.findInvalidControls();
    if (this.medicationsForm.valid) {
      let find; let findPrescQty;
      if (this.selectedItemsList.length > 0) {
        find = this.selectedItemsList.filter((x: any) => x?.ItemId === this.medicationsForm.get('ItemId')?.value || x.GenericId == this.medicationsForm.get('GenericId')?.value);
        findPrescQty = this.selectedItemsList.filter((x: any) => x?.ItemId === "162156" && x.GenericId == this.medicationsForm.get('Quantity')?.value);
      }
      if (find != undefined && find.length > 0) {
        $("#itemAlreadySelected").modal('show');
        return;
      }
      if (this.medicationsForm.get('ItemId')?.value == "162156" && Number(this.medicationsForm.get('Quantity')?.value) > 1) {
        $("#cannotPrescribeGreaterQty").modal('show');
      }
      else {
        $('#StrengthUoM').html('');
        $('#IssueUoM').html('');
        if (this.medicationsForm.get('ItemId')?.value != '') {
          this.selectedItemsList.push({
            SlNo: this.selectedItemsList.length + 1,
            Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
            ClassSelected: false,
            ItemId: this.medicationsForm.get('ItemId')?.value,
            ItemName: this.medicationsForm.get('ItemName')?.value,
            Strength: this.medicationsForm.get('Strength')?.value + " " + this.medicationsForm.get('StrengthUoM')?.value,
            StrengthUoMID: this.medicationsForm.get('StrengthUoMID')?.value,
            Dosage: this.medicationsForm.get('IssueUOMValue')?.value + " " + this.medicationsForm.get('Dosage')?.value,
            DosageId: this.medicationsForm.get('DosageId')?.value,
            AdmRouteId: this.medicationsForm.get('AdmRouteId')?.value,
            Route: this.medicationsForm.get('AdmRoute')?.value,
            FrequencyId: this.medicationsForm.get('FrequencyId')?.value,
            Frequency: this.medicationsForm.get('Frequency')?.value,
            ScheduleStartDate: moment(this.medicationsForm.value['ScheduleStartDate']).format('DD-MMM-YYYY')?.toString(),
            StartFrom: this.medicationsForm.get('StartFrom')?.value,
            DurationId: this.medicationsForm.get('DurationId')?.value,
            Duration: this.medicationsForm.get('DurationValue')?.value + " " + this.medicationsForm.get('Duration')?.value,
            DurationValue: this.medicationsForm.get('DurationValue')?.value,
            PresInstr: this.medicationsForm.get('PresInstr')?.value,
            Quantity: this.medicationsForm.get('Quantity')?.value,
            QuantityUOMId: this.medicationsForm.get('QuantityUOMId')?.value,
            PresType: this.medicationsForm.get('PresType')?.value,
            PRNType: this.medicationsForm.get('PRNType')?.value,
            GenericId: this.medicationsForm.get('GenericId')?.value,
            DefaultUOMID: this.medicationsForm.get('DefaultUOMID')?.value,
            medInstructionId: this.medicationsForm.get('medInstructionId')?.value,
            PRNReason: this.medicationsForm.get('PRNReason')?.value,
            Remarks: this.medicationsForm.get('Remarks')?.value,
            IssueUoM: this.medicationsForm.get('IssueUoM')?.value,
            ScheduleEndDate: this.medicationsForm.get('ScheduleEndDate')?.value,
            ScheduleTime: this.medicationsForm.get('ScheduleTime')?.value,
            PrescriptionID: '',
            lexicomAlertIcon: '',
            CustomizedDosage: this.medicationsForm.get('CustomizedDosage')?.value,
            QOH: this.medicationsForm.get('QOH')?.value,
            IssueUOMValue: this.medicationsForm.get('IssueUOMValue')?.value,
            IVFluidStorageCondition: this.medicationsForm.get('IVFluidStorageCondition')?.value,
            BaseSolutionID: this.medicationsForm.get('BaseSolutionID')?.value,
            IVFluidExpiry: this.medicationsForm.get('IVFluidExpiry')?.value,
            Price: this.medicationsForm.get('Price')?.value,
            DiagnosisId: this.medicationsForm.get('DiagnosisId')?.value,
            DISID: this.medicationsForm.get('DiagnosisId')?.value,
            DiagnosisName: this.medicationsForm.get('DiagnosisName')?.value,
            DiagnosisCode: this.medicationsForm.get('DiagnosisCode')?.value,
            viewMore: this.medicationsForm.get('Remarks')?.value === '' ? false : true,
            IsAntibiotic: this.medicationsForm.get('IsAntibiotic')?.value,
            IsAntibioticForm:this.medicationsForm.get('IsAntibioticForm')?.value,
          });
          this.isMedicationFormSubmitted = false;
          if (this.medicationsForm.get('Remarks')?.value != '' && this.medicationsForm.get('Remarks')?.value != undefined) {
            const med = this.selectedItemsList.find((x: any) => x.ItemId === this.medicationsForm.get('ItemId')?.value)
            this.maximizeSelectedDrugItems(med);
          }
        }
      }
      this.ClearMedicationForm();
    }
  }

  EditPrescriptionItemsToTable() {
    let find = this.selectedItemsList.find((x: any) => x?.ItemId === this.medicationsForm.get('ItemId')?.value);
    if (find) {
      if (find.ItemId == "162156" && Number(find.Quantity) > 1) {
        $("#cannotPrescribeGreaterQty").modal('show');
      }
      const index = this.selectedItemsList.indexOf(find, 0);
      if (index > -1) {
        find.ItemId = this.medicationsForm.get('ItemId')?.value;
        find.ItemName = this.medicationsForm.get('ItemName')?.value;
        find.Strength = this.medicationsForm.get('Strength')?.value + " " + this.medicationsForm.get('StrengthUoM')?.value;
        find.StrengthUoMID = this.medicationsForm.get('StrengthUoMID')?.value,
        find.Dosage = this.medicationsForm.get('Dosage')?.value;
        find.DosageId = this.medicationsForm.get('DosageId')?.value;
        find.AdmRouteId = this.medicationsForm.get('AdmRouteId')?.value;
        find.Route = this.medicationsForm.get('AdmRoute')?.value;
        find.FrequencyId = this.medicationsForm.get('FrequencyId')?.value;
        find.Frequency = this.medicationsForm.get('Frequency')?.value;
        find.ScheduleStartDate = moment(this.medicationsForm.value['ScheduleStartDate']).format('DD-MMM-YYYY')?.toString();
        find.StartFrom = this.medicationsForm.get('StartFrom')?.value;
        find.DurationId = this.medicationsForm.get('DurationId')?.value;
        find.Duration = this.medicationsForm.get('DurationValue')?.value + " " + this.medicationsForm.get('Duration')?.value;
        find.PresInstr = this.medicationsForm.get('PresInstr')?.value;
        find.Quantity = this.medicationsForm.get('Quantity')?.value;
        find.QuantityUOMId = this.medicationsForm.get('QuantityUOMId')?.value;
        find.PresType = this.medicationsForm.get('PresType')?.value;
        find.PRNType = this.medicationsForm.get('PRNType')?.value;
        find.GenericId = this.medicationsForm.get('GenericId')?.value;
        find.DefaultUOMID = this.medicationsForm.get('DefaultUOMID')?.value;
        find.medInstructionId = this.medicationsForm.get('medInstructionId')?.value;
        find.PRNReason = this.medicationsForm.get('PRNReason')?.value;
        find.DurationValue = this.medicationsForm.get('Quantity')?.value;
        find.IssueUOM = this.medicationsForm.get('IssueUOM')?.value;
        find.Remarks = this.medicationsForm.get('Remarks')?.value;
        find.ScheduleEndDate = this.medicationsForm.get('ScheduleEndDate')?.value,
        find.ScheduleTime = this.medicationsForm.get('ScheduleTime')?.value,
        find.CustomizedDosage = this.medicationsForm.get('CustomizedDosage')?.value,
        find.QOH = this.medicationsForm.get('QOH')?.value,
        find.IssueUOMValue = this.medicationsForm.get('IssueUOMValue')?.value,
        find.Price = this.medicationsForm.get('Price')?.value,
        find.DiagnosisId = this.medicationsForm.get('DiagnosisId')?.value,
        find.DISID = this.medicationsForm.get('DiagnosisId')?.value,
        find.DiagnosisName = this.medicationsForm.get('DiagnosisName')?.value,
        find.DiagnosisCode = this.medicationsForm.get('DiagnosisCode')?.value,
        find.viewMore = this.medicationsForm.get('Remarks')?.value === '' ? false : true

        this.selectedItemsList[index] = find;
        if (this.medicationsForm.get('Remarks')?.value != '' && this.medicationsForm.get('Remarks')?.value != undefined) {
          const med = this.selectedItemsList.find((x: any) => x.ItemId === this.medicationsForm.get('ItemId')?.value)
          this.maximizeSelectedDrugItems(med);
        }
      }
      this.isEditmode = false;
    }
    $('#StrengthUoM').html('');
    $('#IssueUoM').html('');

    this.ClearMedicationForm();
  }

  DeletePrescriptionItem(index: any, medi: any) {

    const med = this.savedDrugPrescriptions.find((x: any) => x.ItemId === medi.ItemID);
    if (med && Number(med.DoctorID) !== this.doctorDetails[0].EmpId) {
      this.errorMessages = "Cannot delete as the Order has been raised by another doctor";
      $("#errorMsg").modal('show');
      return;
    }

    this.selectedItemsList.splice(index, 1);
  }

  EditPrescriptionItem(med: any) {
    this.isEditmode = true;
    this.medicationsForm.patchValue({
      ItemId: med.ItemId,
      ItemName: med.ItemName,
      Dosage: med.Dosage,
      DosageId: med.DosageId,
      Strength: med.Strength.split(' ')[0],
      StrengthUoM: med.Strength.split(' ')[1],
      StrengthUoMID: med.StrengthUoMID,
      IssueUOMValue: med.Dosage.split(' ')[0],
      IssueUoM: med.Dosage.split(' ')[1],
      IssueUOMID: med.IssueUOMID,
      ScheduleStartDate: new Date(),
      StartFrom: new Date(),
      DefaultUOMID: med.DefaultUOMID,
      IssueTypeUOM: med.IssueTypeUOM,
      QuantityUOMId: med.QuantityUOMId,
      QuantityUOM: med.IssueUoM,
      GenericId: med.GenericId,
      DurationValue: med.Duration?.split(' ')[0],
      DurationId: med.DurationId == "" ? '3' : med.DurationId,
      Duration: med.Duration ? med.Duration?.split(' ')[1] : "Days",
      Quantity: med.Quantity,
      FrequencyId: med.FrequencyId,
      AdmRouteId: med.AdmRouteId,
      AdmRoute: med.Route,
      Frequency: med.Frequency,
      PresInstr: med.PresInstr,
      PresType: med.PresType,
      PRNType: med.PRNType,
      PRNReason: med.PRNReason,
      medInstructionId: med.medInstructionId,
      Remarks: med.Remarks,
      CustomizedDosage: med.CustomizedDosage,
      QOH: med.QOH,
      IVFluidStorageCondition: med.IVFluidStorageCondition,
      BaseSolutionID: med.BaseSolutionID,
      IVFluidExpiry: med.IVFluidExpiry,
      DiagnosisId: med.DiagnosisId,
      DISID: med.DISID,
      DiagnosisName: med.DiagnosisName,
      DiagnosisCode: med.DiagnosisCode,
      IsAntibiotic: med.IsAntibiotic,
      IsAntibioticForm:med.IsAntibioticForm
    })
    this.selectedMedDrugFreqScheduleTime = this.drugFrequenciesList.find((x: any) => x.FrequencyID == med.FrequencyId);

    $('#StrengthUoM').html(med.Strength.split(' ')[1]);
    $('#IssueUoM').html(med.Dosage.split(' ')[1]);
    $('#QuantityUOM').html(med.IssueUoM);
    $('#Dosage').html(med.Dosage.split(' ')[1]);
  }

  remove(index: any) {
    this.selectedItemsList.splice(index, 1);
    alert("deleted")
  }

  CalculateQuantity() {
    var UserId = 0;
    var WorkStationID = 0;
    var FreqVal = this.medicationsForm.get('FrequencyId')?.value == "" ? 0 : this.medicationsForm.get('FrequencyId')?.value;
    var CurrentIndx = 0;
    var DosageUnit = this.medicationsForm.get('IssueUOMValue')?.value;
    var DurationUnit = this.medicationsForm.get('DurationValue')?.value;
    var DurationVal = this.medicationsForm.get('DurationId')?.value;
    var Type = 0;
    var IssueTypeUOM = this.medicationsForm.get('IssueTypeUOM')?.value;
    var ItemId = this.medicationsForm.get('ItemId')?.value;
    var DefaultUOMID = this.medicationsForm.get('DefaultUOMID')?.value;
    var PrescStartDate = moment(this.medicationsForm.value['ScheduleStartDate']).format('DD-MMM-yyyy')?.toString();
    var PatientType = this.selectedView.PatientType;
    //Patient Type need to be changed when implementing Inpatient Prescriptions
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, FreqVal, 1, DosageUnit, DurationUnit, DurationVal, 1, 0, ItemId, DefaultUOMID, PrescStartDate, this.selectedView.PatientType == "3" ? "1" : this.selectedView.PatientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.medicationsForm.patchValue({
            Quantity: response.FetchItemQtyDataCDataaList[0].totQty,
            ScheduleEndDate: response.FetchItemQtyDataCDataaList[0].EDT,
            ScheduleTime: response.FetchItemQtyDataCDataaList[0].ScheduleTime,

          })
          $('#QuantityUOM').html(this.medicationsForm.get('QuantityUOM')?.value);
        }
      },
        (err) => {

        })
  }

  CalculateQuantityForPrevFavMeds(FrequencyId: any, IssueUOMValue: any, DurationValue: any, DurationId: any, ItemId: any, DefaultUOMID: any, PrescStartDate: any, patientType: any) {

    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, FrequencyId, 1, IssueUOMValue, DurationValue, DurationId, 1, 0, ItemId, DefaultUOMID, PrescStartDate, patientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          return response.FetchItemQtyDataCDataaList[0].EDT;
        }
        else
          return '';
      },
        (err) => {

        })
  }

  maximizeSelectedDrugItems(med: any) {
    med.vireMore = true;
  }

  medicationRemarksPopup(med: any, invRem: any) {
    this.remarksForSelectedMedName = med;
    $("#medRem").val('');
  }

  saveMedicationRemarks(invRem: any) {
    this.medicationsForm.patchValue({
      Remarks: invRem
    })
  }

  setRouteIdValue(route: any) {
    this.medicationsForm.patchValue({
      AdmRouteId: route.RouteID==undefined?route.Id:route.RouteID,
      AdmRoute: route.RouteName==undefined?route.Names:route.RouteName,
    });
  }

  getRouteName(routeid: string) {
    if (routeid.length != undefined && routeid.length > 0) {
      if (routeid[0] === '') {
        return 'Route';
      }
    }
    else if (routeid === "" || routeid === null || routeid === '0') {
      return 'Route';
    }
    const rout = this.itemSelected == 'false' ? this.AdmRoutesList?.find((x: any) => x.Id == routeid) : this.AdmRoutesList?.find((x: any) => x.RouteID == routeid);
    return this.itemSelected == 'false' ? rout.Names : rout.RouteName;
  }

  setFrequencyValue(freq: any) {
    this.medicationsForm.patchValue({
      FrequencyId: freq.FrequencyID
    });
    this.medicationsForm.get('Frequency')?.setValue(freq.Frequency);
    this.selectedMedDrugFreqScheduleTime = this.drugFrequenciesList.find((x: any) => x.FrequencyID == freq.FrequencyID);
    this.CalculateQuantity();
  }

  getFrequencyName(freqid: string) {
    if (freqid.length != undefined && freqid.length > 0) {
      if (freqid[0] === '') {
        return 'Frequency';
      }
    }
    else if (freqid === "" || freqid === null || freqid === '0') {
      return 'Frequency';
    }
    const freq = this.drugFrequenciesList?.find((x: any) => x.FrequencyID == freqid);
    return freq.Frequency;
  }

  setDurationValue(dur: any) {
    this.medicationsForm.patchValue({
      DurationId: dur.Id
    });
    this.medicationsForm.get('Duration')?.setValue(dur.Names);
    this.CalculateQuantity();
  }

  getDurationName(durid: string) {
    if (durid.length != undefined && durid.length > 0) {
      if (durid[0] === '') {
        return 'Duration';
      }
    }
    else if (durid === "" || durid === null || durid === '0') {
      return 'Duration';
    }
    const dur = this.durationList?.find((x: any) => x.Id == durid);
    return dur.Names;
  }

  setPatientInstructionsValue(instr: any) {
    this.medicationsForm.patchValue({
      medInstructionId: instr.id,
      PresInstr: instr.name
    });
  }

  getPatientInstructionName(instrid: string) {
    if (instrid.length != undefined && instrid.length > 0) {
      if (instrid[0] === '') {
        return 'Instruction';
      }
    }
    else if (instrid === "" || instrid === null || instrid === '0') {
      return 'Instruction';
    }
    const dur = this.medicationInstructions?.find((x: any) => x.id == instrid);
    return dur.name;
  }

  setDiagnosisMappingValue(diag: any) {
    this.medicationsForm.patchValue({
      DiagnosisId: diag.DiseaseID,
      DiagnosisName: diag.DiseaseName,
      DiagnosisCode: diag.Code
    });
  }

  showItemViewMore(item: any) {
    item.viewMore = !item.viewMore;
  }

  toggleDropdown(med: any) {
    med.displayDropdown = true;
  }

  toggledisplayStartDateDropdown(med: any) {
    med.displayStartDateDropdown = true;
  }

  toggleDuraion(med: any) {
    med.displayDuration = true;
  }

  toggleRouteDropdown(med: any) {
    this.config.fetchItemForPrescriptions(this.selectedView.PatientType, med.ItemId, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.AdmRoutesListGridRow = response.ItemRouteDataList;
          med.displayRouteDropdown = true;
        }
      },
        (err) => {
        })
  }

  onDurationTextRowChange(event: any, med: any) {
    med.DurationValue = event.target.value;
    const Name = this.durationList.find((x: any) => x.Id == med.DurationId).Names;
    med.Duration = event.target.value + ' ' + Name;
    var PrescStartDate = moment(med.ScheduleStartDate).format('DD-MMM-YYYY')?.toString();
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, med.FrequencyId, 1, med.IssueUOMValue, med.DurationValue, med.DurationId, 1, 0, med.ItemId, med.DefaultUOMID, PrescStartDate, this.selectedView.PatientType == "3" ? "1" : this.selectedView.PatientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          med.displayDuration = false;
          med.Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
          med.ScheduleEndDate = response.FetchItemQtyDataCDataaList[0].EDT;
          med.ScheduleTime = response.FetchItemQtyDataCDataaList[0].ScheduleTime;
        }
      },
        (err) => {

        })
  }

  onDurationSelectRowChange(event: any, med: any) {
    med.DurationId = event.target.value;
    const Name = this.durationList.find((x: any) => x.Id == med.DurationId).Names;
    med.Duration = med.DurationValue + ' ' + Name;
    var PrescStartDate = moment(med.ScheduleStartDate).format('DD-MMM-YYYY')?.toString();
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, med.FrequencyId, 1, med.IssueUOMValue, med.DurationValue, med.DurationId, 1, 0, med.ItemId, med.DefaultUOMID, PrescStartDate, this.selectedView.PatientType == "3" ? "1" : this.selectedView.PatientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          med.displayDuration = false;
          med.Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
          med.ScheduleEndDate = response.FetchItemQtyDataCDataaList[0].EDT;
          med.ScheduleTime = response.FetchItemQtyDataCDataaList[0].ScheduleTime;
        }
      },
        (err) => {

        })
  }

  onRouteRowChange(event: any, med: any) {
    med.AdmRouteId = event.target.value;
    med.Route = event.target.options[event.target.options.selectedIndex].text;
    med.displayRouteDropdown = false;
  }

  onFrequencyRowChange(event: any, med: any) {
    med.FrequencyId = event.target.value;
    med.Frequency = event.target.options[event.target.options.selectedIndex].text;
    var PrescStartDate = moment(med.ScheduleStartDate).format('DD-MMM-YYYY')?.toString();
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, med.FrequencyId, 1, med.IssueUOMValue, med.DurationValue, med.DurationId, 1, 0, med.ItemId, med.DefaultUOMID, PrescStartDate, this.selectedView.PatientType == "3" ? "1" : this.selectedView.PatientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          med.Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
          med.ScheduleEndDate = response.FetchItemQtyDataCDataaList[0].EDT;
          med.ScheduleTime = response.FetchItemQtyDataCDataaList[0].ScheduleTime;
        }
      },
        (err) => {

        })
    med.displayDropdown = false;
  }

  onDateRowChange(event: any, med: any) {
    med.ScheduleStartDate = moment(new Date(event.target.value)).format('DD-MMM-YYYY')?.toString();
    var PrescStartDate = moment(new Date(med.ScheduleStartDate)).format('DD-MMM-YYYY')?.toString();
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, med.FrequencyId, 1, med.IssueUOMValue, med.DurationValue, med.DurationId, 1, 0, med.ItemId, med.DefaultUOMID, PrescStartDate, this.selectedView.PatientType == "3" ? "1" : this.selectedView.PatientType, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          med.displayStartDateDropdown = false;
          med.Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
          med.ScheduleEndDate = response.FetchItemQtyDataCDataaList[0].EDT;
          med.ScheduleTime = response.FetchItemQtyDataCDataaList[0].ScheduleTime;
        }
      },
        (err) => {

        })
  }

  disableControls(med: any) {
    med.displayRouteDropdown = false;
    med.displayDropdown = false;
    med.displayStartDateDropdown = false;
    med.displayDuration = false;
  }

  openTaperingPopup() {
    if (this.isEditmode) {
      this.medicationScheduleitems.clear();
      var drugSchedule = this.medicationsForm.get('CustomizedDosage')?.value;
      if (drugSchedule != null && drugSchedule != "") {
        if (drugSchedule.ObjTaperData === undefined)
          drugSchedule = JSON.parse(drugSchedule);
        for (let i = 0; i < drugSchedule.ObjTaperData[0].CustomizedQty.split('-').length; i++) {
          const itemFormGroup = this.fb.group({
            Dose: drugSchedule.ObjTaperData[0].CustomizedQty.split('-')[i],
            ScheduleTime: drugSchedule.ObjTaperData[0].CustomizedSchedule.split('-')[i]
          })
          this.medicationScheduleitems.push(itemFormGroup);
          $("#divTapering").addClass('d-flex');
          $("#divTapering").removeClass('d-none');
        }
      }
      else {
        this.createTapering();
      }
    }
    else {
      this.createTapering();
    }
  }

  closeTapering() {
    $("#divTapering").addClass('d-none');
    $("#divTapering").removeClass('d-flex');
  }

  createTapering() {
    this.medicationScheduleitems.clear();
    if (this.selectedMedDrugFreqScheduleTime != undefined && this.selectedMedDrugFreqScheduleTime != "") {
      var drugSchedule = this.selectedMedDrugFreqScheduleTime.ScheduleTime;
      for (let i = 0; i < drugSchedule.split('-').length; i++) {
        //schedule.push({"Schedule" : drugSchedule.split('-')[i]});
        const itemFormGroup = this.fb.group({
          Dose: '',
          ScheduleTime: drugSchedule.split('-')[i] + ":00"
        })
        this.medicationScheduleitems.push(itemFormGroup);
      }
      //this.medicationSchedules = schedule;
      $("#divTapering").addClass('d-flex');
      $("#divTapering").removeClass('d-none');
    }
    else {
      this.errorMessages = "Please select Frequency";
      $("#errorMsg").modal('show');
    }
  }

  saveTapering() {
    var schedDoses = this.medicationSchedulesForm;
    var dose: string[] = []; var time: string[] = []; var totalDose = 0;
    this.medicationSchedulesForm.value.items.forEach((element: any) => {
      dose.push(element.Dose);
      time.push(element.ScheduleTime);
      totalDose = Number(totalDose) + Number(element.Dose);
    });
    this.CalculateQuantity();
    var doses =
    {
      "NoOfDays": 0,
      "IsSliding": false,
      "SDays": 0,
      "ObjTaperData": [
        {
          "DrugID": this.medicationsForm.get('ItemId')?.value,
          "DrugName": this.medicationsForm.get('ItemName')?.value,
          "Day": null,
          "Checked": false,
          "Strength": this.medicationsForm.get('Strength')?.value,
          "StrengthUOM": this.medicationsForm.get('StrengthUOM')?.value,
          "Dose": null,
          "DoseUOM": null,
          "Frequency": this.medicationsForm.get('Frequency')?.value,
          "FrequencyID": this.medicationsForm.get('FrequencyId')?.value,
          "CustomizedSchedule": time.join("-"),
          "CustomizedQty": dose.join("-"),
          "CustomizedDays": this.medicationsForm.get('DurationValue')?.value,
          "StartFrom": this.medicationsForm.get('ScheduleStartDate')?.value,
          "TotalQty": 0,
          "CustomizedRemarks": null,
          "TotalCustQty": totalDose,
          "ListSatrtDate": [],
          "FrequencyQty": 0,
          "SCIT": 0
        }
      ],
      "IsDosEdit": true,
      "InterVal": 0
    }

    this.medicationsForm.patchValue({
      CustomizedDosage: JSON.stringify(doses)
    })
    $("#divTapering").removeClass('d-none');
  }

  clearTapering() {
    this.medicationScheduleitems.clear();
    var drugSchedule = this.selectedMedDrugFreqScheduleTime.ScheduleTime;
    var schedule: any[] = [];
    for (let i = 0; i < drugSchedule.split('-').length; i++) {
      const itemFormGroup = this.fb.group({
        Dose: drugSchedule.split('-')[i],
        ScheduleTime: ''
      })
      this.medicationScheduleitems.push(itemFormGroup);
    }
  }

  fetchSubstituteItems(itemid: any) {
    if (itemid !== '') {
      this.config.FetchSubstituteItems(itemid, this.hospitalId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.substituteItems = response.FetchSubstituteItemsDataaList;
            $("#modalSubstituteItems").modal('show');
          }
        })
    }
    else {
      this.errorMessages = [];
      this.errorMessages.push("Please select any Drug to show substitutes");
      $("#errorMsg").modal('show');
    }
  }

  loadSubstituteItem() {
    const selectedSubsItem = this.substituteItems.find((x: any) => x.selected);
    this.onItemSelected(selectedSubsItem);
    $("#modalSubstituteItems").modal('hide');
  }

  selectSubstituteItem(sub: any) {
    this.substituteItems.forEach((element: any, index: any) => {
      if (element.ItemID === sub.ItemID && element.GenericId === sub.GenericId) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.showSubstituteSelectValidationMsg = false;
  }

  onToggleClick(index: number, value: boolean): void {
    this.radiologyRequestDataList[index].selectedValue = value;
  }

  viewAllPrescriptions() {
    this.config.fetchListOfPrescription(this.selectedView.AdmissionID, this.hospitalId).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.ipPrescriptionList = response.FetchListOfPrescriptionDataList;
          this.allPrescriptionListDetails = response.FetchListOfPrescriptionCompleteDataList;
          const distinctPresciptions = response.FetchListOfPrescriptionCompleteDataList.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.MonitorID === thing.MonitorID) === i);
          this.allPrescriptionList = distinctPresciptions;
          this.ipPrescriptionList.forEach((element: any, index: any) => {
            element.Class = "icon-w cursor-pointer";
          })
          this.ipPrescriptionCount = this.ipPrescriptionList.length;
          $("#divViewAllPrescriptions").modal('show');
        } else {

        }
      },
      (err) => {
        console.log(err)
      });    
  }

  filterViewAllPresc(presc: any) {
    return this.allPrescriptionListDetails.filter((x: any) => x.MonitorID === presc.MonitorID);
  }

  saveRad() {

    var radList: any = [];
    this.radiologyRequestDataList.forEach((element: any, index: any) => {
      let rad = {
        "SPID": this.SpecialiseID,
        "SCHKID": element.SafetyChecklistId,
        "ISSTY": element.selectedValue ? 1 : 0
      }
      radList.push(rad);
    });

    let payload = {
      "PatientRadiologyRequestId": this.patientRadiologyRequestId,
      "Patientid": this.selectedView.PatientID,
      "AdmissionId": this.selectedView.AdmissionID,
      "PrescriptionID": this.savedInvPrescriptionId,
      "IsPregnant": this.selectedOption === "No" ? 0 : this.selectedOption === "Yes" ? 1 : this.selectedOption === "Unsure" ? 2 : 3,
      "LMPDate": moment(this.radForm.get('LMPDate')?.value).format('DD-MMM-YYYY')?.toString(),
      "IsPaediatricSpecialNeed": this.selectedPaediatricOption === "Yes" ? 1 : 0,
      "SpecialNeed": this.selectedSpecialOption === "Yes" ? 1 : 0,
      "IsSedationRequired": this.selectedSedationOption === "Yes" ? 1 : 0,
      "IsContrastRequired": this.selectedContrastOption === "Yes" ? 1 : 0,
      "IsNormalKidneyFunction": this.radForm.get('IsNormalKidneyFunction')?.value ? 1 : 0,
      "IsChronicRenalImpairment": this.radForm.get('IsChronicRenalImpairment')?.value ? 1 : 0,
      "IsAcuteKidneyInjury": this.radForm.get('IsAcuteKidneyInjury')?.value ? 1 : 0,
      "IsHaemoDialysis": this.radForm.get('IsHaemodialysis')?.value ? 1 : 0,
      "LastSerumCreatinineLevel": this.radForm.get('SerumCreatinineLevel')?.value,
      "IsPreviousRadiologyStudy": this.selectedPreviousOption === "Yes" ? 1 : 0,
      "BriefClinicalHistory": this.radForm.get('ActiveIssues')?.value,
      "ClinicalQuestion": this.radForm.get('QAndA')?.value,
      "SafetyCheckList": radList,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, //this.patientType == '2' ? this.facility.FacilityID : 0
    }
    $("#refill_modal").modal('hide');
    // const modalRef = this.modalSvc.open(ValidateEmployeeComponent, {
    //   backdrop: 'static'
    // });
    //modalRef.componentInstance.dataChanged.subscribe((data: string) => {
      //if (data) {
        this.config.savePatientRadiologyRequestForms(payload).subscribe(
          (response) => {
            if (response.Code == 200) {
              if (this.IsMRIClick == 0) {
                this.patientRadiologyRequestIdForMapping = response.PatientRadiologyRequestId;
                this.config.saveAllPrescription(this.prescriptionSaveData).subscribe(
                  (response) => {
                    if (response.Code == 200) {
                      this.InvPrescriptionIDForMapping = response.InvPrescriptionID;

                      this.config.updatePatientRadiologyRequestForms(this.patientRadiologyRequestIdForMapping, this.InvPrescriptionIDForMapping, this.hospitalId)
                        .subscribe((response: any) => {
                          if (response.Code == 200) {
                          }
                        })
                        if (response.appReqList && response.appReqList.items.length > 0 && this.selectedView.PatientType === '1' && 
                          (response.appReqList.items.filter((x:any) => x.isCovered === 'Not Covered' || x.isCovered === 'Need Approval').length > 0) &&
                          (this.selectedView.BillType == 'Insured' || this.selectedView.BillType =='CR')) 
                          {
                          //this.loaDataList = response.LOADataList;
                          //this.loaServicesDataList = response.LOAServicesDataList;
                          this.loaDataList = response.appReqList;//response.LOADataList;
                          this.loaServicesDataList = response.appReqList.items;
                          this.loaDiagnosis = response.appReqList.diagnosis?.map((item: any) => item.name).join(', ');
                          this.loaCc = response.appReqList.cc?.map((item: any) => item.name).join(', ');
                          $("#approvalRequest").modal('show');
                        }
                        else {
                          this.selectedItemsList = []; this.investigationsList = []; this.proceduresList = [];
                          $("#refill_modal").modal('hide');
                          $("#savePrescriptionMsg").modal('show');
                          setTimeout(() => {
                            $("#savePrescriptionMsg").modal('hide');
                            this.clearPrescriptionScreen();
                          }, 1000)
                        }
                    }
                  },
                  (err) => {
                    console.log(err)
                  });
              }
              else {
                $("#refill_modal").modal('hide');
                $("#saveMsg").modal('show');
              }

            }
          },
          (err) => {
            console.log(err)
          });
      //}
      //modalRef.close();
    //});


  }

  SaveData() {
    this.savechanges.emit('Prescription');
  }

  decline() {
    this.ClearPrescriptionItems();
    $("#prescriptionValidationMsgModalYesNo").modal('hide');
  }

  accept() {
    this.itemSelected = "true";
    this.AdmRoutesList = this.tempprescriptionSelected.ItemRouteDataList;
    this.medicationsForm.patchValue({
      ItemId: this.tempprescriptionSelected.ItemDataList[0].ItemID,
      ItemName: this.tempprescriptionSelected.ItemDataList[0].DisplayName,
      DosageId: this.tempprescriptionSelected.ItemDataList[0].QtyUomID,
      Dosage: this.tempprescriptionSelected.ItemDataList[0].QTYUOM,
      Strength: this.tempprescriptionSelected.ItemDataList[0].Strength,
      StrengthUoMID: this.tempprescriptionSelected.ItemDataList[0].StrengthUoMID,
      StrengthUoM: this.tempprescriptionSelected.ItemDataList[0].StrengthUoM,
      IssueUOMValue: this.tempprescriptionSelected.ItemDataList[0].Quantity,
      IssueUoM: this.tempprescriptionSelected.ItemDataList[0].QTYUOM,
      IssueUOMID: this.tempprescriptionSelected.ItemDataList[0].IssueUOMID,
      ScheduleStartDate: this.prescriptionValidationMsgEnddate,
      DefaultUOMID: this.tempprescriptionSelected.ItemDataList[0].OPDefaultUomID,
      IssueTypeUOM: this.tempprescriptionSelected.ItemPackageDataList[0].FromUoMID,
      QuantityUOMId: this.tempprescriptionSelected.ItemPackageDataList[0].FromUoMID,
      QuantityUOM: this.tempprescriptionSelected.ItemPackageDataList[0].FromUoM,
      GenericId: this.tempprescriptionSelected.ItemGenericsDataList[0].GenericID,
      DurationId: "3",
      Duration: "Days",
      DurationValue: "1",
      AdmRouteId: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteID : "",
      AdmRoute: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteName : "",
      IsFav: this.tempprescriptionSelected.ItemDataList[0].IsFav,
      QOH: (this.selectedView.PatientType == "2"||this.selectedView.PatientType == "4") ? this.tempprescriptionSelected.ItemDefaultUOMDataList[0].IPQOH : this.tempprescriptionSelected.ItemDefaultUOMDataList[0].OPQOH,
      IVFluidStorageCondition: this.tempprescriptionSelected.ItemDataList[0].IVFluidStorageCondition,
      Remarks: '',
      IsAntibiotic: this.tempprescriptionSelected.ItemDataList[0].IsAntibiotic,
      IsAntibioticForm: this.tempprescriptionSelected.ItemDataList[0].IsAntibioticForm
    })
    $('#StrengthUoM').html(this.tempprescriptionSelected.ItemDataList[0].StrengthUoM);
    $('#IssueUoM').html(this.tempprescriptionSelected.ItemDataList[0].QTYUOM);
    this.listOfItems = []; this.tempprescriptionSelected = []; this.prescriptionValidationMsgEnddate = "";
  }

  onDiagnosisSelected(event: any, med: any) {
    let find = this.selectedItemsList.find((x: any) => x?.ItemId === med.ItemId.toString());
    if (find) {
      const index = this.selectedItemsList.indexOf(find, 0);
      if (index > -1) {
        find.DISID = event.target.value;
        find.DiagnosisId = event.target.value;
        find.DiagnosisName = event.target.options[event.target.options.selectedIndex].text;
        this.selectedItemsList[index] = find;
      }
      this.isEditmode = false;
    }
  }

  saveDiagnosisMapping() {
    $("#mapDiagnosisMedicationdiv").modal('hide');
  }

  clearPrescriptionScreen() {
    this.ClearMedicationForm();
    this.drugDetails = []; this.investigationDetails = []; this.procedureDetails = [];
    this.selectedItemsList = []; this.investigationsList = []; this.proceduresList = [];
    this.changedInvestigationsList = []; this.changedMedicationsList = []; this.changedProceduresList = [];
    this.SaveData();
  }

  ClearPrescriptionsSelected() {
    this.proceduresList = [];
    this.showProcListdiv = false;
    this.isProceduresAll = false;
    this.investigationsList = [];
    this.showInvListdiv = false;
    this.isInvesigationsAll = false;
    this.selectedItemsList = [];
    //this.medicationsForm.reset();
    this.ClearMedicationForm();
    $("#invprocSmartSearch").val('');
  }

  ClearMedicationForm() {
    this.medicationsForm.patchValue({
      ItemId: '',
      ItemName: '',
      AdmRouteId: '',
      AdmRoute: '',
      FrequencyId: '',
      Frequency: '',
      ScheduleStartDate: new Date(),
      StartFrom: '',
      DosageId: '',
      Strength: '',
      StrengthUoMID: '',
      StrengthUoM: '',
      IssueUOMValue: '',
      IssueUoM: '',
      IssueUOMID: '',
      IssueTypeUOM: '',
      DefaultUOMID: '',
      DurationValue: '',
      DurationId: '',
      Duration: '',
      medInstructionId: '',
      medInstructionName: '',
      PresInstr: '',
      Quantity: '',
      PresTypeId: '',
      PresType: '',
      PRNType: '',
      QuantityUOM: '',
      QuantityUOMId: '',
      GenericId: '',
      IsPRN: '',
      PRNREASON: '',
      Remarks: '',
      DiagnosisId: '',
      DISID: '',
      DiagnosisName: '',
      DiagnosisCode: '',
      IsAntibiotic: '',
      IsAntibioticForm:''
    });
    $('#QuantityUOM').html('');
    $('#Dosage').html('');
    this.isMedicationFormSubmitted = false;
  }

  ClearPrescriptionItems() {
    this.ClearMedicationForm();
    this.itemSelected = "false";
    this.AdmRoutesList = this.AdmRoutesListMaster;
  }

  clearRad() {
    this.radForm.patchValue({
      LMPDate: '',
      IsNormalKidneyFunction: false,
      IsChronicRenalImpairment: false,
      IsAcuteKidneyInjury: false,
      IsHaemodialysis: false,
      SerumCreatinineLevel: '',
      ActiveIssues: '',
      QAndA: ''
    });

    if (this.selectedView.IsPregnancy) {
      this.selectOption("Yes");
    }
    else {
      this.selectOption("No");
    }

    this.selectContrastOption("No");
    this.selectPaediatricOption("No");
    this.selectSpecialOption("No");
    this.selectSedationOption("No");
    this.selectPreviousOption("No");

    this.radiologyRequestDataList.forEach((element: any, index: any) => {
      element.selectedValue = false;
    });
  }

  CloseRad() {
    if (this.IsMRIClick == 1) {
      $("#refill_modal").modal('hide');
    }
    else {
      this.errorMessages = "Please fill the form to save the Prescription";
      $("#errorMsg").modal('show');
    }
  }

  closeRadiologyForm() {
    $("#refill_modal").modal('hide');
  }
}


export interface IInvestigations {
  ID: number;
  Name: string;
  SOrN: string;
  Specialisation: string;
  Quantity?: number;
  ServiceItemId?: number;
  SpecialisationId?: number;
  ServiceTypeId?: number;
  SpecimenId?: number;
  Remarks?: string;
  IsFav?: number;
  Status?: number;
  disableDelete?: boolean;
  TATRemarks: string;
  ResultStatus: string;
  ItemPrice: number;
  DISID?: any;
  DEPARTMENTID?: number
}

export class InvestigationProcedures {
  name: string;
  constructor(name:string) {
    this.name = name;
  }
}

export class DrugDetails {
  SEQ?: number;
  ITM?: number;
  ITNAME?: string;
  DOS?: string;
  DOID?: number;
  FID?: number;
  DUR?: string;
  DUID?: number;
  SFRM?: string;
  REM?: string;
  ARI?: number;
  STM?: string;
  FQTY?: string;
  EDT?: string;
  CF?: boolean;
  CD?: string;
  IUMVAL?: number;
  QTYUOMID?: number;
  QTY?: number;
  STA?: number;
  UCAFAPR?: boolean;
  GID?: number;
  TQT?: number;
  TID?: number;
  ISPSD?: boolean;
  TPOID?: number;
  PATINS?: string;
  PIID?: number;
  REQQTY?:number;
  REQUID?:number;
  PISTATUS?: number;
  ARID?: number;
  ISDRUGFLOW?: boolean;
  ISPRN?: number;
  PRNREASON?: number;
  LGDA?: string;
  REM2L?: string;
  JUST?: string;
  FCONFIG?: string;
  ISANTIC?: boolean;
  ANTICSTATUS?: number;
  OPACKID?: number;
  DISID?: number;
  MRP?: string;
  DefaultUOMID?: string;
  PrescriptionItemStatusNew?: string="0";
}

export class ProcedureDetails {
  PID? : number;
  PROCEDURE? : string;
  SID? : number;
  QTY? : number;
  ISQ? : number;
  REM? : string;
  STID? : number;
  OTYID? : number;
  PRID? : number;
  RTID? : number;
  SLOC? : number;
  SDT? : string;
  TOID? : number;
  ORDERTYPE? : string;
  COMPONENTID? : number;
  COMPONENTNAME? : string;
  APPROVALDATE? : string;
  ISPSD? : boolean;
  FAV? : boolean;
  ISMANDATORY? : boolean;
  TEMPLATE? : string;
  SCREENDESIGNID? : string;
  HOLDINGREASONID? : number;
  ISCONTRASTALLERGIC? : boolean;
  STATUS? : number;
  DISID?: any;
  DEPARTMENTID?: number;
}

export class InvestigationDetails {
  PID? : number;
  PROCEDURE?: string;
  SID? : number;
  QTY? : number;
  ISQ? : number;
  SPID? : number;
  REM? : string;
  STID? : number;
  OTYID? : number;
  SPEID? : number;
  ISPSD? : boolean;
  ISMANDATORY? : boolean;
  TEMPLATE? : string;
  SCREENDESIGNID? : number;
  HOLDINGREASONID? : number;
  ISSCHEDULE? : boolean;
  ISNONSTAT? : boolean;
  ISSTATTEST? : boolean;
  STATUS? : number;
  DISID?: any;
  DEPARTMENTID?: number;
}
export class TeethInfoDetails {
  TID? : number;
  PID? : number;
  RMK? : string;
}

export class IvfDetails {
  SEQ?: number;
  ItemID?: number;
  QTY?: string;
  DET?: string;
  ItemName?: string;
  BaseSolutionID?:string;
  UOMID?: string;
  AdditiveCategoryID?: number;
  ExpiryTime?: string;
}