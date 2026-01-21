import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DrugDetails } from './models/prescription.model';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { UtilityService } from 'src/app/shared/utility.service';
import { combineLatest, ObservableInput } from 'rxjs';

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
  selector: 'app-admissionreconciliation',
  templateUrl: './admissionreconciliation.component.html',
  styleUrls: ['./admissionreconciliation.component.scss'],
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
export class AdmissionreconciliationComponent implements OnInit {
  @Input() data: any;
  readonly = false;
  @Output() savechanges = new EventEmitter<any>();
  groupedDataMedic: { [key: string]: FavouriteMedication[] } = {};
  groupedDataMedicArray: { groupkey: string, values: FavouriteMedication[] }[] = [];
  groupedMedicationFilter: { groupkey: string, values: FavouriteMedication[] }[] = [];
  FavouriteMedic: FavouriteMedication[] = [];
  langData: any;
  patientDetails: any;
  selectedCard: any;
  items: any = [];
  itemMedications: any = [];
  drugDetails: DrugDetails[] = [];
  drugDetailsPres: DrugDetails[] = [];
  holdMasterList: any = [];
  selectedMedications: any = [];
  doctorDetails: any;
  facility: any;
  hospitalId: any;
  holdReasonValidation: boolean = false;
  holdReasonValidation_prev: boolean = false;
  AdmRoutesList: any;
  AdmRoutesListMaster: any;
  durationList: any;
  frequenciesList: any;
  medicationReasonsList: any;
  drugFrequenciesList: any;
  medicationInstructions: any;
  admReconStatus: any;
  listOfItems: any;
  itemSelected: string = "false";
  isPRN: boolean = false;
  selectedPatientAdmissionId: any;
  selectedItemsList: any = [];
  medicationsForm!: FormGroup;
  previousMedicationList: any = [];
  filteredpreviousMedicationList: any = [];
  viewPreviousMedicationForm!: FormGroup;
  isEditmode: boolean = false;
  savedDrugPrescriptions: any = [];
  savedMonitorId: number = 0;
  savedDrugPrescriptionId: number = 0;
  isMedicationFormSubmitted: boolean = false;
  actionableAlert: any;
  actionableAlertmsg: any;
  disableQty: boolean = true;
  tempSelectedMedicationList: any = [];
  remarksForSelectedDiscontinuedItemId: any;
  remarksForSelectedDiscontinuedPrescId: any;
  remarksForSelectedDiscontinuedItemName: any;
  remarksForSelectedHoldItemId: any;
  remarksForSelectedHoldPrescId: any;
  remarksForSelectedHoldItemName: any;
  selectedHoldReason: string = "0";
  selectedHoldReason_prev: string = "0";
  remarksForSelectedHoldItemId_prev: any;
  remarksForSelectedHoldPrescId_prev: any;
  remarksForSelectedHoldItemName_prev: any;
  favMed: any = [];
  searchMediTerm: any;
  showMore: boolean = false; toggleValue: string = 'Normal';
  showFavMedSelectedValidation: boolean = false;
  prescriptionValidationMsg: any;
  prescriptionValidationMsgEnddate: any;
  tempprescriptionSelected: any;
  IsprescriptionSelectedValid: boolean = false;
  remarksMap: Map<number, string> = new Map<number, string>();
  recordRemarks: Map<number, string> = new Map<number, string>();
  remarksSelectedIndex: number = -1;
  substituteItems: any = [];
  visitDiagnosis: any = [];
  remarksForSelectedMedName: any;
  lastSavedAdmReconDate: any;
  PatientId: any;
  patientNoPrevMed: boolean = false;
  selectedView: any;
  prescriptionSaveData: any = {};
  selectall = false;
  IsHome = true;
  age: any;
  selectedMedDrugFreqScheduleTime: any;
  @Input() fromCaseSheet = false;
  errorMsg = "";
  saveMsg = "";
  fromIndProcessing: boolean = false;
  endofEpisode: boolean = false;

  currentDate = new Date();
  admissionPlus12Hours!: Date;

  constructor(private fb: FormBuilder, private config: ConfigService, private router: Router, public datepipe: DatePipe, private modalSvc: NgbModal, private us: UtilityService) {
    this.langData = this.config.getLangData();
    this.patientDetails = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.selectedCard = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    const emergencyValue = sessionStorage.getItem("FromEMR");
    if (emergencyValue !== null && emergencyValue !== undefined) {
      this.IsHome = !(emergencyValue === 'true');
    } else {
      this.IsHome = true;
    }
  }
  navigatetoBedBoard() {
    if (!this.IsHome)
      this.router.navigate(['/emergency/beds']);
    else
      this.router.navigate(['/ward']);
    sessionStorage.setItem("FromEMR", "false");
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
      medStatus: [''],
      PrescriptionItemStatus: [''],
      PrescriptionItemStatusName: [''],
      LastDoseGiven: [''],
      LastDoseGivenTime: ['']
    });
  }

  ngOnInit(): void {
    if (this.data) {
      if (this.data !== '' && this.data?.data === 'fromIndProcessing') {
        this.fromIndProcessing = true;
      }
      this.readonly = this.data?.readonly;
    }
    this.hospitalId = sessionStorage.getItem('hospitalId');
    if (sessionStorage.getItem("ISEpisodeclose") === "true") {
      this.endofEpisode = true;
    } else {
      this.endofEpisode = false;
    }

    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    if (this.selectedView.PatientID === undefined || this.selectedView.PatientType === '3') {
      this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
      this.selectedView.IPID = this.selectedView.AdmissionID;
      this.patientDetails = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    }


    this.PatientId = this.selectedView.PatientID;
    this.selectedPatientAdmissionId = this.selectedView.IPID;
    if (this.readonly) {
      this.selectedPatientAdmissionId = this.selectedView.AdmissionID;
      this.age = this.selectedView.Age.trim().split(' ')[0];
    }
    else if (this.selectedView.PatientType == '1')
      this.age = this.selectedView.Age.trim().split(' ')[0];
    else
      this.age = this.patientDetails.PatientType == '2' ? this.patientDetails.AgeValue : this.patientDetails.PatientType == '3' ? this.patientDetails.Age.trim().split(' ')[0] : this.patientDetails.Age

    //this.selectedPatientAdmissionId = sessionStorage.getItem("selectedPatientAdmissionId")
    if (this.patientDetails.PatientType == '2') {
      this.PatientId = this.patientDetails.PatientID;
    }
    this.FetchMedicationDemographics();
    this.FetchDrugFrequencies();
    this.FetchMedicationInstructions();
    this.fetchAdmReconStatus();
    this.initializeMedicationsForm();
    this.FetchHoldMaster();
    this.FetchSavedAdmissionReconciliation();
    this.LoadPatientVisitsADM();
    this.initiatePreviousMedicationForm();
    var d = new Date();
    d.setMonth(d.getMonth() - 12);
    var endd = new Date();
    endd.setMonth(endd.getMonth() + 3)
    this.viewPreviousMedicationForm.patchValue({
      fromdate: d,
      todate: endd
    })
    if(this.selectedView.PatientType == '3') {
      this.admissionPlus12Hours = new Date(new Date(this.selectedView.orderDate).getTime() + 12 * 60 * 60 * 1000);
    }
    else {
      this.admissionPlus12Hours = new Date(new Date(this.selectedView.AdmitDate).getTime() + 12 * 60 * 60 * 1000);
    }
    
  }
  FetchHoldMaster() {
    this.config.fetchMedicationHold(this.doctorDetails[0].EmpId, this.hospitalId).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.holdMasterList = response.FetchMedicationHoldDataList;
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }
  clearFavMedications() {
    this.selectedMedications = [];
    this.FavouriteMedic = [];
    this.groupedDataMedicArray = []; this.groupedDataMedic = {};
    this.itemMedications.forEach((element: any, index: any) => {
      this.FavouriteMedic.push({ GenericID: element.GenericID, ItemID: element.ItemID, DoseID: element.DoseID, LexicomItemID: element.LexicomItemID, group: element.GenericName, name: element.DrugName, Dose: element.Dose, AdmRoute: element.AdmRoute, StrengthDosage: element.StrengthDosage, NoStockColor: "0", StockColor: element.StockColor });
    });

    this.FavouriteMedic.forEach((data) => {
      if (!this.groupedDataMedic[data.group]) {
        this.groupedDataMedic[data.group] = [];
      }
      this.groupedDataMedic[data.group].push(data);
    });

    this.groupedDataMedicArray = Object.keys(this.groupedDataMedic).map((groupkey) => ({
      groupkey,
      values: this.groupedDataMedic[groupkey],
    }));

  }
  selectedFavMedication(selectedFav: any) {
    if (!this.selectedMedications.includes(selectedFav.ItemID)) {
      this.selectedMedications.push(selectedFav);
    } else {
      this.selectedMedications.splice(this.selectedMedications.indexOf(selectedFav.ItemID), 1);
    }
  }
  prescribeFavMedication() {
    if (this.selectedMedications.length > 0) {
      this.selectedMedications.forEach((element: any, index: any) => {
        this.config.fetchItemForPrescriptions(this.patientDetails.PatientType == '2' ? '2' : '1', this.selectedMedications[index].ItemID, "1", this.doctorDetails[0].EmpId, "0", this.hospitalId, this.doctorDetails[0].EmpId)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.selectedItemsList.push({
                SlNo: this.selectedItemsList.length + 1,
                Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
                ClassSelected: false,
                ItemId: this.selectedMedications[index].ItemID,
                ItemName: response.ItemDataList[0].DisplayName,
                StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
                Strength: response.ItemDataList[0].Strength + " " + response.ItemDataList[0].StrengthUoM,
                StrengthUoM: response.ItemDataList[0].StrengthUoM,
                Dosage: this.selectedMedications[index].Dose + " " + response.ItemDataList[0].QTYUOM, //response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
                DosageId: response.ItemDataList[0].QtyUomID,
                AdmRouteId: this.selectedMedications[index].AdmRouteID,
                Route: this.selectedMedications[index].AdmRoute,
                StrengthDosage: this.selectedMedications[index].StrengthDosage,
                NoStockColor: this.selectedMedications[index].NoStockColor,
                StockColor: this.selectedMedications[index].StockColor,
                FrequencyId: "",//this.selectedMedications[index].FrequencyID,
                Frequency: "",//this.selectedMedications[index].Frequency,
                ScheduleStartDate: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                StartFrom: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                DurationId: "",//this.selectedMedications[index].DurationID,
                Duration: "",//this.selectedMedications[index].Duration + " " + this.selectedMedications[index].DurationUOM,
                DurationValue: "",//this.selectedMedications[index].Duration,
                PresInstr: "",//item.PresInstr,
                Quantity: "",//this.selectedMedications[index].Quantity,
                QuantityUOMId: response.DefaultUOMDataaList[0].IssueUOMID,//this.selectedMedications[index].QtyUOMID,
                QuantityUOM: response.DefaultUOMDataaList[0].IssueUOM,//this.selectedMedications[index].QtyUOMID,
                PresType: "",//item.PresType,
                PRNType: this.selectedMedications[index].PRNMedicationReason,//item.PRNType,
                GenericId: this.selectedMedications[index].GenericID,
                DefaultUOMID: response.ItemDataList[0].OPDefaultUomID,
                medInstructionId: "",//item.medInstructionId,
                PRNReason: "",//item.PRNReason,
                IssueUoM: response.DefaultUOMDataaList[0].IssueUOM,
                IssueUOMID: response.DefaultUOMDataaList[0].IssueUOMID,
                IssueUOMValue: response.ItemDataList[0].Quantity,
                IssueTypeUOM: response.ItemPackageDataList[0].FromUoMID,
                PrescriptionID: '',
                selected: false,
                viewMore: false
              });
            }
          })
      });
      this.showFavMedSelectedValidation = false;
      $("#modalMedicationFavorite").modal('hide');
    }
    else {
      this.showFavMedSelectedValidation = true;
    }
  }
  getFetchFavouriteitemsDoctorWise(doctorID: any) {
    this.items = [];
    this.itemMedications = [];
    this.selectedMedications = [];
    this.FavouriteMedic = [];

    this.config.getFetchFavouriteitemsDoctorWise(this.patientDetails.PatientType == '2' ? '2' : '1', doctorID, this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId).subscribe((response) => {
      if (response.Status === "Success") {

        this.items = response.DoctorFavInvestigationList;
        this.itemMedications = response.DoctorFavMedicationList;

        this.groupedDataMedic = {};
        this.groupedDataMedicArray = [];


        this.itemMedications.forEach((element: any, index: any) => {
          this.FavouriteMedic.push({ GenericID: element.GenericID, ItemID: element.ItemID, DoseID: element.DoseID, LexicomItemID: element.LexicomItemID, group: element.GenericName, name: element.DrugName, Dose: element.Dose, AdmRoute: element.AdmRoute, StrengthDosage: element.StrengthDosage, NoStockColor: element.NoStockColor, StockColor: element.StockColor });
        });

        this.FavouriteMedic.forEach((data) => {
          if (!this.groupedDataMedic[data.group]) {
            this.groupedDataMedic[data.group] = [];
          }
          this.groupedDataMedic[data.group].push(data);
        });

        this.convertToArray();

      }
    },
      (err) => {
        console.log(err)
      })
  }
  private convertToArray(): void {

    this.groupedDataMedicArray = Object.keys(this.groupedDataMedic).map((groupkey) => ({
      groupkey,
      values: this.groupedDataMedic[groupkey],
    }));
    this.groupedMedicationFilter = this.groupedDataMedicArray;
  }
  FetchMedicationDemographics() {
    this.config.fetchMedicationDemographics("2,65,77,826", this.doctorDetails[0].EmpId, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.AdmRoutesListMaster = response.MedicationDemographicsAdministrationDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          this.AdmRoutesList = response.MedicationDemographicsAdministrationDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          this.durationList = response.MedicationDemographicsDurationDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          this.frequenciesList = response.MedicationDemographicsFrequencyDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          this.medicationReasonsList = response.MedicationDemographicsMedicationReasonDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
        }
      },
        (err) => {

        })

  }
  FetchDrugFrequencies() {
    this.config.fetchDrugFrequencies(this.doctorDetails[0].EmpId, "0", this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.drugFrequenciesList = response.DrugFrequenciesDataList;
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
  fetchAdmReconStatus() {
    this.config.fetchAdmissionRecoStatus(this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.admReconStatus = response.FetchAdverseDrugDataList;
        }
      },
        (err) => {

        })
  }
  searchItem(event: any) {
    if (event.target.value.length >= 3) {
      var filter = event.target.value;
      this.config.fetchItemDetails(1, 500, 3, filter, this.doctorDetails[0].EmpId, "0", this.hospitalId, this.doctorDetails[0].EmpId)
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
  onRouteChange(event: any) {
    this.medicationsForm.get('AdmRoute')?.setValue(event.target.options[event.target.options.selectedIndex].text);
  }
  onFrequencyChange(event: any) {
    this.medicationsForm.get('Frequency')?.setValue(event.target.options[event.target.options.selectedIndex].text);
    this.CalculateQuantity();
  }
  onDurationChange(event: any) {
    this.medicationsForm.get('Duration')?.setValue(event.target.options[event.target.options.selectedIndex].text);
    this.CalculateQuantity();
  }
  onPresInstrChange(event: any) {
    this.medicationsForm.get('PresInstr')?.setValue(event.target.options[event.target.options.selectedIndex].text);
  }
  onMedStatusChange(event: any) {
    this.medicationsForm.get('medStatusName')?.setValue(event.target.options[event.target.options.selectedIndex].text);
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
    this.config.fetchItemForPrescriptions(this.patientDetails.PatientType == '2' ? '2' : '1', this.tempSelectedMedicationList.ItemID, "1", this.doctorDetails[0].EmpId, "0", this.hospitalId, this.doctorDetails[0].EmpId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.itemSelected = "true";
          this.AdmRoutesList = response.ItemRouteDataList;
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
            DefaultUOMID: response.ItemDataList[0].OPDefaultUomID,
            IssueTypeUOM: response.ItemPackageDataList[0].FromUoMID,
            QuantityUOMId: response.ItemPackageDataList[0].FromUoMID,
            QuantityUOM: response.ItemPackageDataList[0].FromUoM,
            GenericId: response.ItemGenericsDataList[0].GenericID,


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
    this.config.FetchServiceActionableAlerts(this.selectedPatientAdmissionId, this.age, itemId).subscribe((response) => {
      if (response.Status === "Success" && response.ActionItemDataList.length > 0) {
        this.listOfItems = [];
        // if (response.ActionItemDataList[0].PopupMessage == true) {
        //   this.actionableAlert = response.ActionItemDataList[0].Justifications;
        //   $("#medicationActionableAlerts").modal('show');
        //   this.tempSelectedMedicationList = item;
        // }
        // else if (response.ActionItemDataList[0].PopupMessage == false && response.ActionItemDataList[0].strMessage != "" && response.ActionItemDataList[0].strMessage != null) {
        //   this.actionableAlertmsg = response.ActionItemDataList[0].strMessage;
        //   $("#showActionableAlertsMsg").modal('show');
        // }
        // else 
        //{
        this.config.fetchItemForPrescriptions(this.patientDetails.PatientType == '2' ? '2' : '1', itemId, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.config.FetchPrescriptionValidations(this.selectedPatientAdmissionId, itemId, response.ItemGenericsDataList[0].GenericID, response.ItemDataList[0].DisplayName, this.PatientId, this.selectedView.Age.trim().split(' ')[0], this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalId, this.patientDetails.PatientType)
                .subscribe((valresponse: any) => {
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
                      DefaultUOMID: response.ItemDataList[0].OPDefaultUomID,
                      IssueTypeUOM: response.ItemPackageDataList[0].FromUoMID,
                      QuantityUOMId: response.DefaultUOMDataaList[0].IssueUOMID,
                      QuantityUOM: response.DefaultUOMDataaList[0].IssueUOM,
                      GenericId: response.ItemGenericsDataList[0].GenericID,
                      DurationId: "3",
                      Duration: "Days",
                      AdmRouteId: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteID : "",
                      AdmRoute: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteName : "",
                      IsFav: response.ItemDataList[0].IsFav
                    })
                    $('#StrengthUoM').html(response.ItemDataList[0].StrengthUoM);
                    $('#IssueUoM').html(response.DefaultUOMDataaList[0].IssueUOM);
                    $('#QuantityUOM').html(response.DefaultUOMDataaList[0].IssueUOM);
                    $('#Dosage').html(response.ItemDataList[0].QTYUOM);
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
        //}
      }
      else {

        this.config.fetchItemForPrescriptions(this.patientDetails.PatientType == '2' ? '2' : '1', itemId, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.config.FetchPrescriptionValidations(this.selectedPatientAdmissionId, itemId, response.ItemGenericsDataList[0].GenericID, response.ItemDataList[0].DisplayName, this.PatientId, this.age, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalId, this.selectedView.PatientType)
                .subscribe((valresponse: any) => {
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
                      DefaultUOMID: response.ItemDataList[0].OPDefaultUomID,
                      IssueTypeUOM: response.ItemPackageDataList[0].FromUoMID,
                      QuantityUOMId: response.DefaultUOMDataaList[0].IssueUOMID,
                      QuantityUOM: response.DefaultUOMDataaList[0].IssueUOM,
                      GenericId: response.ItemGenericsDataList[0].GenericID,
                      DurationId: "3",
                      Duration: "Days",
                      AdmRouteId: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteID : "",
                      AdmRoute: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteName : "",
                      IsFav: response.ItemDataList[0].IsFav
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
  AddPrescriptionItemsToTable() {
    this.isMedicationFormSubmitted = true;
    if (this.medicationsForm.valid) {
      let find;
      if (this.selectedItemsList.length > 0) {
        find = this.selectedItemsList.filter((x: any) => x?.ItemId === this.medicationsForm.get('ItemId')?.value || x.GenericId == this.medicationsForm.get('GenericId')?.value);
      }
      if (find != undefined && find.length > 0) {
        $("#itemAlreadySelected").modal('show');
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
            ScheduleStartDate: this.datepipe.transform(this.medicationsForm.value['ScheduleStartDate'], "dd-MMM-yyyy")?.toString(),
            StartFrom: this.medicationsForm.get('StartFrom')?.value,
            DurationId: this.medicationsForm.get('DurationId')?.value,
            Duration: this.medicationsForm.get('DurationValue')?.value + " " + this.medicationsForm.get('Duration')?.value,
            PresInstr: this.medicationsForm.get('PresInstr')?.value,
            Quantity: this.medicationsForm.get('Quantity')?.value,
            QuantityUOMId: this.medicationsForm.get('QuantityUOMId')?.value,
            PresType: this.medicationsForm.get('PresType')?.value,
            PRNType: this.medicationsForm.get('PRNType')?.value,
            GenericId: this.medicationsForm.get('GenericId')?.value,
            DefaultUOMID: this.medicationsForm.get('DefaultUOMID')?.value,
            medInstructionId: this.medicationsForm.get('medInstructionId')?.value,
            PRNReason: this.medicationsForm.get('PRNReason')?.value,
            Remarks: this.medicationsForm.get('Remarks')?.value[0] == undefined ? "" : this.medicationsForm.get('Remarks')?.value[0],
            IssueUoM: this.medicationsForm.get('IssueUoM')?.value,
            ScheduleEndDate: this.medicationsForm.get('ScheduleEndDate')?.value,
            ScheduleTime: this.medicationsForm.get('ScheduleTime')?.value,
            medStatus: this.medicationsForm.get('medStatus')?.value,
            PrescriptionItemStatus: this.medicationsForm.get('PrescriptionItemStatus')?.value === '' ? '4' : this.medicationsForm.get('PrescriptionItemStatus')?.value,
            PrescriptionItemStatusName: this.medicationsForm.get('PrescriptionItemStatusName')?.value === '' ? 'New' : this.medicationsForm.get('PrescriptionItemStatusName')?.value,
            LastDoseGiven: this.medicationsForm.get('LastDoseGiven')?.value,
            LastDoseGivenTime: this.medicationsForm.get('LastDoseGivenTime')?.value,
            PrescriptionID: '',
            selected: false,
            viewMore: false
          });
          this.isMedicationFormSubmitted = false;
        }
      }
      this.ClearMedicationForm();
    }

  }
  EditPrescriptionItemsToTable() {
    let find = this.selectedItemsList.find((x: any) => x?.ItemId === this.medicationsForm.get('ItemId')?.value);
    if (find) {
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
        find.ScheduleStartDate = this.datepipe.transform(this.medicationsForm.value['ScheduleStartDate'], "dd-MMM-yyyy")?.toString();
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
          find.medStatus = this.medicationsForm.get('medStatus')?.value,
          find.PrescriptionItemStatus = this.medicationsForm.get('PrescriptionItemStatus')?.value,
          find.PrescriptionItemStatusName = this.medicationsForm.get('PrescriptionItemStatusName')?.value,
          find.LastDoseGiven = this.datepipe.transform(this.medicationsForm.get('LastDoseGiven')?.value, "dd-MMM-yyyy")?.toString(),
          find.LastDoseGivenTime = this.medicationsForm.get('LastDoseGivenTime')?.value,
          find.selected = false,
          find.viewMore = false
        this.selectedItemsList[index] = find;
        //this.selectedItemsList.splice(index, 1);
      }
      this.isEditmode = false;
    }
    $('#StrengthUoM').html('');
    $('#IssueUoM').html('');

    this.ClearMedicationForm();
  }
  remove(index: any) {
    this.selectedItemsList.splice(index, 1);
    alert("deleted")
  }

  CalculateQuantity() {
    var UserId = 0;
    var WorkStationID = 0;
    var FreqVal = this.medicationsForm.get('FrequencyId')?.value;
    var CurrentIndx = 0;
    var DosageUnit = this.medicationsForm.get('IssueUOMValue')?.value;
    var DurationUnit = this.medicationsForm.get('DurationValue')?.value;
    var DurationVal = this.medicationsForm.get('DurationId')?.value;
    var Type = 0;
    var IssueTypeUOM = this.medicationsForm.get('IssueTypeUOM')?.value;
    var ItemId = this.medicationsForm.get('ItemId')?.value;
    var DefaultUOMID = this.medicationsForm.get('DefaultUOMID')?.value;
    var PrescStartDate = this.datepipe.transform(this.medicationsForm.value['ScheduleStartDate'], "dd-MMM-yyyy")?.toString();
    //Patient Type need to be changed when implementing Inpatient Prescriptions
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, FreqVal, 1, DosageUnit, DurationUnit, DurationVal, 1, 0, ItemId, DefaultUOMID, PrescStartDate, 1, 0, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.medicationsForm.patchValue({
            Quantity: response.FetchItemQtyDataCDataaList[0].totQty,//response.Quantity.split('^')[1],
            ScheduleEndDate: response.FetchItemQtyDataCDataaList[0].EDT,
            ScheduleTime: response.FetchItemQtyDataCDataaList[0].ScheduleTime,
            //StartFrom: response.Quantity.split('^')[0],

          })
          $('#QuantityUOM').html(this.medicationsForm.get('QuantityUOM')?.value);
        }
      },
        (err) => {

        })
  }

  saveAmdRecToPrescription(event: any) {
    if (this.selectedItemsList.filter((x: any) => x.selected).length === 0) {
      this.errorMsg = "Please select any medication to save as Prescription";
      $("#validatePrescriptionMsg").modal('show');
      return;
    }
    this.drugDetailsPres = [];
    this.selectedItemsList.filter((x: any) => x.selected).forEach((element: any) => {
      this.drugDetailsPres.push({
        SEQ: this.drugDetailsPres.length + 1,
        ITM: element.ItemId,
        DOS: element.Dosage.split(" ")[0],
        DOID: element.DosageId,
        FID: element.FrequencyId,
        DUR: element.Duration.split(" ")[0],
        DUID: element.DurationId,
        SFRM: this.datepipe.transform(element.ScheduleStartDate, "dd-MMM-yyyy hh:mm a")?.toString(),
        REM: element.Remarks,
        ARI: element.AdmRouteId,
        STM: element.ScheduleTime,
        FQTY: element.Quantity,
        EDT: element.ScheduleEndDate,
        CF: false,
        CD: "",
        // IUMVAL: 
        //QTYUOMID: element.QuantityUOMId,
        QTYUOMID: element.StrengthUoMID,
        //QTY: Number(element.Quantity),
        QTY: Number(element.Strength.split(' ')[0]),
        REQQTY: Number(element.Quantity),
        REQUID: element.IssueUOMID,
        STA: 0,
        // UCAFAPR: false,
        GID: element.GenericId,
        TQT: Number(element.Quantity),
        TID: element.DefaultUOMID,
        ISPSD: false,
        // TPOID:
        PATINS: element.PresInstr == "" ? "select" : element.PresInstr,
        PISTATUS: element.PrescriptionItemStatus,
        PIID: element.medInstructionId == '' ? 0 : element.medInstructionId,
        // PISTATUS:
        // ARID:
        ISDRUGFLOW: false,
        ISPRN: element.IsPRN,
        PRNREASON: element.PRNReason,
        LGDA: element.PrescriptionItemStatus == '5' ? this.datepipe.transform(element.LastDoseGiven, "dd-MMM-yyyy")?.toString() + " " + element.LastDoseGivenTime : "",
        REM2L: "",
        JUST: "",
        PITEMID: element.PrescriptionItemid,
        ITEMNAME: element.ItemName,
        // FCONFIG:
        ISANTIC: false,
        ANTICSTATUS: -1,
        OPACKID: 0,
        DISID: element.DISID,
        RAISEPRESCSTATUS: 1
      })
    });
    let postData = {
      "DrugPrescriptionID": 0,
      "MonitorID": 0,
      "Prescriptiondate": this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
      "PatientID": this.patientDetails.PatientID,
      "DoctorID": this.patientDetails.PatientType == '2' ? this.patientDetails.ConsultantID : this.doctorDetails[0].EmpId,
      "IPID": parseInt(this.selectedPatientAdmissionId),
      "BedID": this.patientDetails.PatientType == '2' ? this.patientDetails.BedID : 0,
      "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
      "Patienttype": this.patientDetails.PatientType == '2' ? 2 : 1,
      "MonitorIndex": 1,
      "BillID": 0,
      "BillItemSeq": 0,
      "PackageID": 0,
      "Ddetails": JSON.stringify(this.drugDetailsPres),
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": 0,
      "OneTimeIssue": 1,
      "STATUS": 1,
      "ScheduleID": 0,
      "IsDisPrescription": 0,
      "RaiseDrugOrder": 1,
      "ActionType": 0,
      "PrescriptionType": "D",
      "Dremarks": "",
      "CSTemplateID": 0,
      "ComponentID": 0,
      "OrdertypeId": "37",
      "PrscritionStats": 0,
      "PainScoreID": 0,
      "IsPatientDrugAlleric": 0,
      "HasPreviousMedication": false,
      "IsAdminReconciliation": 1,
      "Hospitalid": this.hospitalId,
    };
    this.config.saveAdmissionReconPrescriptions(postData).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.selectedItemsList = [];
          this.FetchSavedAdmissionReconciliation();
          this.saveMsg = "Prescription saved successfully";
          $("#savePrescriptionMsg").modal('show');

        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }

  saveAllPrescription(event: any) {
    this.prescriptionSaveData = {};
    if (this.selectedItemsList.length > 0 && !this.patientNoPrevMed) {
      var validate = this.ValidateDrugDetails();
      if (validate.toString().split("^")[0] != "false") {
        const modalRef = this.modalSvc.open(ValidateEmployeeComponent);
        modalRef.componentInstance.dataChanged.subscribe((data: any) => {
          if (data.success) {
            this.savePrescription();
          }
          modalRef.close();
        });
      }
      else {
        if (validate.toString().split("^")[1] == "AdmReconStatusNotValid")
          $("#validateAdmReconStatusMsg").modal('show');
        else {
          this.errorMsg = "Please edit Medication details and then save";
          validate.toString().split("^")[1] == "NoProcQty" ? $("#validateProceduresMsg").modal('show') : $("#validatePrescriptionMsg").modal('show');
        }
      }
    }
    else {
      this.savePrescription();
      //$("#noPrescriptionSelected").modal('show');
    }

  }

  savePrescription() {
    this.FormDrugDetails();
    let postData = {
      "DrugPrescriptionID": 0,
      "MonitorID": 0,
      "Prescriptiondate": this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
      "PatientID": this.patientDetails.PatientID,
      "DoctorID": this.patientDetails.PatientType == '2' ? this.patientDetails.ConsultantID : this.doctorDetails[0].EmpId,
      "IPID": parseInt(this.selectedPatientAdmissionId),
      "BedID": this.patientDetails.PatientType == '2' ? this.patientDetails.BedID : 0,
      "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId,
      "Patienttype": this.patientDetails.PatientType == '2' ? 2 : 1,
      "MonitorIndex": 1,
      "BillID": 0,
      "BillItemSeq": 0,
      "PackageID": 0,
      "Ddetails": this.patientNoPrevMed ? JSON.stringify([]) : JSON.stringify(this.drugDetails),
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": 0,
      "OneTimeIssue": 1,
      "STATUS": 1,
      "ScheduleID": 0,
      "IsDisPrescription": 0,
      "RaiseDrugOrder": 0,
      "ActionType": 0,
      "PrescriptionType": "D",
      "Dremarks": "",
      "CSTemplateID": 0,
      "ComponentID": 0,
      "OrdertypeId": "37",
      "PrscritionStats": 2,
      "PainScoreID": 0,
      "IsPatientDrugAlleric": 0,
      "HasPreviousMedication": this.patientNoPrevMed,
      "IsAdminReconciliation": 0,
      "Hospitalid": this.hospitalId,
    };
    this.config.saveAdmissionReconPrescriptions(postData).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.selectedItemsList = [];
          this.FetchSavedAdmissionReconciliation();
          this.saveMsg = "Admission Reconciliation saved successfully";
          $("#savePrescriptionMsg").modal('show');
          sessionStorage.setItem("IsAdmissionRec", "1");
        } else {
          sessionStorage.setItem("IsAdmissionRec", "0");
        }
      },
      (err) => {
        console.log(err)
      });
  }

  SaveData() {
    this.savechanges.emit('Prescription');
  }
  clearPrescriptionScreen() {
    this.ClearMedicationForm();
    this.drugDetails = [];
    this.selectedItemsList = [];
    this.SaveData();
  }
  ValidateDrugDetails() {
    var validateDrugDet = this.selectedItemsList.filter((s: any) => s.Duration == "" || s.AdmRouteId == "" || s.DurationId == "" || s.DurationValue == ""
      || s.FrequencyId == "" || s.Route == "");

    var validateAmdReconStatus = this.selectedItemsList.filter((s: any) => s.PrescriptionItemStatus == "" || s.PrescriptionItemStatus == undefined);
    if (validateDrugDet.length > 0) {
      return "false" + "^" + "NotValidDrug";
    }
    else if (validateAmdReconStatus.length > 0) {
      return "false" + "^" + "AdmReconStatusNotValid";
    }
    return true;
  }
  FormDrugDetails() {
    this.drugDetails = [];
    this.selectedItemsList.forEach((element: any) => {
      this.drugDetails.push({
        SEQ: this.drugDetails.length + 1,
        ITM: element.ItemId,
        DOS: element.Dosage.split(" ")[0],
        DOID: element.DosageId,
        FID: element.FrequencyId,
        DUR: element.Duration.split(" ")[0],
        DUID: element.DurationId,
        SFRM: this.datepipe.transform(element.ScheduleStartDate, "dd-MMM-yyyy hh:mm a")?.toString(),
        REM: element.Remarks,
        ARI: element.AdmRouteId,
        STM: element.ScheduleTime,
        FQTY: element.Quantity,
        EDT: element.ScheduleEndDate,
        CF: false,
        CD: "",
        // IUMVAL: 
        //QTYUOMID: element.QuantityUOMId,
        QTYUOMID: element.StrengthUoMID,
        //QTY: Number(element.Quantity),
        QTY: Number(element.Strength.split(' ')[0]),
        STA: 0,
        // UCAFAPR: false,
        GID: element.GenericId,
        TQT: Number(element.Quantity),
        TID: element.DefaultUOMID,
        ISPSD: false,
        // TPOID:
        PATINS: element.PresInstr == "" ? "select" : element.PresInstr,
        PISTATUS: element.PrescriptionItemStatus,
        PIID: element.medInstructionId == '' ? 0 : element.medInstructionId,
        // PISTATUS:
        ARID: element.AdmRouteId,
        ISDRUGFLOW: false,
        ISPRN: element.IsPRN,
        PRNREASON: element.PRNReason,
        LGDA: element.PrescriptionItemStatus == '5' ? this.datepipe.transform(element.LastDoseGiven, "dd-MMM-yyyy")?.toString() + " " + element.LastDoseGivenTime : "",
        REM2L: "",
        JUST: "",
        PITEMID: 0,
        ITEMNAME: element.ItemName,
        // FCONFIG:
        ISANTIC: false,
        ANTICSTATUS: -1,
        OPACKID: 0,
        DISID: element.DISID,
      })
    });
  }

  ClearMedicationForm() {
    this.medicationsForm.reset({
      ItemId: [''],
      ItemName: [''],
      AdmRouteId: [''],
      AdmRoute: [''],
      FrequencyId: [''],
      Frequency: [''],
      ScheduleStartDate: new Date(),
      StartFrom: [''],
      DosageId: [''],
      Strength: [''],
      StrengthUoMID: [''],
      StrengthUoM: [''],
      IssueUOMValue: [''],
      IssueUoM: [''],
      IssueUOMID: [''],
      IssueTypeUOM: [''],
      DefaultUOMID: [''],
      DurationValue: [''],
      DurationId: [''],
      Duration: [''],
      medInstructionId: [''],
      PresInstr: [''],
      Quantity: [''],
      PresTypeId: [''],
      PresType: [''],
      PRNType: [''],
      QuantityUOM: [''],
      QuantityUOMId: [''],
      GenericId: [''],
      IsPRN: [''],
      PRNREASON: [''],
      Remarks: [''],
      medStatus: [''],
      PrescriptionItemStatus: [''],
      medStatusName: ['']
    });
    $('#QuantityUOM').html('');
    $('#Dosage').html('');
  }
  medicationRemarksPopup(med: any, invRem: any) {
    this.remarksForSelectedMedName = med;
  }
  saveMedicationRemarks(invRem: any) {
    this.medicationsForm.patchValue({
      Remarks: invRem
    })
  }
  showFavorites() {
    $("#modalFavorite").modal('show');
  }

  showProcedureFavorites() {
    $("#modalProcedureFavorite").modal('show');
  }

  showFavoritesMedication() {
    if (this.itemMedications.length === 0) {
      this.getFetchFavouriteitemsDoctorWise(this.doctorDetails[0].EmpId)
      $("#modalMedicationFavorite").modal('show');
    } else {
      $("#modalMedicationFavorite").modal('show');
    }
  }
  filterMedicationData(searchMediTerm: string): void {

    if (!searchMediTerm) {
      this.groupedDataMedicArray = this.groupedMedicationFilter; // No filter, return the original data
    }

    this.groupedDataMedicArray = this.groupedMedicationFilter.map(group => ({
      groupkey: group.groupkey,
      values: group.values.filter(item => item.name.toLowerCase().includes(searchMediTerm.toLowerCase())),
      items: group.values.filter(item => item.name.toLowerCase().includes(searchMediTerm.toLowerCase()))
    })).filter(group => group.items.length > 0);
  }



  renameKey(obj: any, oldKey: any, newKey: any) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
  }

  filterFunction(presc: any, prescdate: any) {
    return presc.filter((buttom: any) => buttom.PrescriptionID == prescdate);
  }

  DeletePrescriptionItem(index: any, medi: any) {
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
      DurationValue: med.Duration.split(' ')[0],
      DurationId: med.DurationId,
      Duration: med.Duration.split(' ')[1],
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
      medStatus: med.PrescriptionItemStatus,
      PrescriptionItemStatus: med.PrescriptionItemStatus,
      PrescriptionItemStatusName: med.PrescriptionItemStatusName,
      LastDoseGiven: med.LastDoseGiven == undefined ? '' : new Date(med.LastDoseGiven),// new Date(med.LastDoseGiven),      
      LastDoseGivenTime: med.LastDoseGiven == undefined ? '' : new Date(med.LastDoseGivenTime),//this.convertTo24HourFormat(med.LastDoseGivenTime),
    })

    $('#StrengthUoM').html(med.StrengthUoM);
    $('#IssueUoM').html(med.Dosage.split(' ')[1]);
    $('#QuantityUOM').html(med.IssueUoM);
    $('#Dosage').html(med.Dosage.split(' ')[1]);
  }
  MapDiagnosisMedication() {
    $("#mapDiagnosisMedicationdiv").modal('show');
    this.config.FetchVisitDiagnosis(this.selectedPatientAdmissionId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.visitDiagnosis = response.GetVisitDiagnosisList;
        }
      })
  }
  ClearPrescriptionItems() {
    //this.medicationsForm.reset();
    this.ClearMedicationForm();
    this.itemSelected = "false";
    this.AdmRoutesList = this.AdmRoutesListMaster;
  }
  selectedHoldReasonEvent(event: any) {
    this.selectedHoldReason = event.target.value;
  }
  selectedHoldItem(index: any) {
    this.remarksForSelectedHoldItemName = index.ItemName;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedHoldItemId = index.ItemId;
    this.remarksForSelectedHoldPrescId = index.PrescriptionID;
    this.holdReasonValidation = false;
    this.selectedHoldReason = index.PrescriptionItemsHoldReasonID;
    $("#holdRem").val(index.ReasonForHolding);
  }
  holdPrescriptionItem(med: any, rem: any) {
    if (this.selectedHoldReason != "0" && rem.value != "") {
      $("#hold_remarks").modal('hide');
      var currentDate = this.datepipe.transform(new Date(), "dd-MM-yyyy HH:MM")?.toString();
      var holdMedXml = [
        {
          "PID": this.remarksForSelectedHoldPrescId,
          "IID": this.remarksForSelectedHoldItemId,
          "ISEQ": 1,
          "REASON": " | " + this.doctorDetails[0].UserName + "  " + currentDate + " : " + rem.value,
          "HOLDSTATUS": "1",
          "HRID": this.selectedHoldReason,
          "BLK": "0"
        }
      ]

      let holdPayload = {
        "DoctorID": this.doctorDetails[0].EmpId,
        "HoldPresItemsXML": holdMedXml
      }
      this.config.holdPrescriptionItems(holdPayload).subscribe(
        (response) => {
          if (response.Code == 200) {

            $("#holdMedSaveMsg").modal('show');
          } else {

          }
        },
        (err) => {
          console.log(err)
        });
    }
    else {
      this.holdReasonValidation = true;
      $("#holdRemarksLabel").modal('show');
    }
  }
  clearHoldReason(rem: any) {
    rem.value = "";
    this.selectedHoldReason = "0";
  }
  selectedDiscontinuedItem(index: any) {
    this.remarksForSelectedDiscontinuedItemName = index.ItemName;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedDiscontinuedItemId = index.ItemId;
    this.remarksForSelectedDiscontinuedPrescId = index.PrescriptionID;
    $("#discontinueRem").val('');
  }
  discontinuePrescriptionItem(med: any, rem: any, type: string) {
    var discontinueMedXml = [
      {
        "PID": this.remarksForSelectedDiscontinuedPrescId,
        "IID": this.remarksForSelectedDiscontinuedItemId,
        "MID": this.savedMonitorId,
        "DCR": rem.value
      }
    ]

    let advReactionPayload = {
      "DoctorID": this.doctorDetails[0].EmpId,
      "BlockPresItemsXML": discontinueMedXml
    }
    this.config.blockPrescriptionItems(advReactionPayload).subscribe(
      (response) => {
        if (response.Code == 200) {
          if (type == 'prevmed') {
            $("#discontinuePrevMedSaveMsg").modal('show');
          }
          else {
            $("#discontinueMedSaveMsg").modal('show');
          }
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }
  maximizeSelectedDrugItems(med: any) {
    const index = this.selectedItemsList.findIndex((x: any) => x?.ItemId === med.ItemId);
    if (index > -1) {
      this.selectedItemsList[index].ClassSelected = !this.selectedItemsList[index].ClassSelected;
      if (this.selectedItemsList[index].ClassSelected) {
        this.selectedItemsList[index].Class = "row card_item_div mx-0 gx-2 w-100 align-items-start maxim";
        this.selectedItemsList[index].viewMore = true;
      } else {
        this.selectedItemsList[index].Class = "row card_item_div mx-0 gx-2 w-100 align-items-start";
        this.selectedItemsList[index].viewMore = false;
      }
    }

  }
  saveFavouriteMedications() {
    this.isMedicationFormSubmitted = true;
    if (this.medicationsForm.get('IsFav')?.value == 1)
      this.medicationsForm.patchValue({
        IsFav: 3
      })
    else {
      this.medicationsForm.patchValue({
        IsFav: 1
      })
    }
    if (this.medicationsForm.valid) {
      this.favMed.push({
        "SEQ": 1,
        "ITM": this.medicationsForm.get('ItemId')?.value,
        "DOS": this.medicationsForm.get('Dosage')?.value,
        "DOID": this.medicationsForm.get('DosageId')?.value,
        "FID": this.medicationsForm.get('FrequencyId')?.value,
        "DUR": this.medicationsForm.get('DurationValue')?.value,
        "ARI": this.medicationsForm.get('AdmRouteId')?.value,
        "DUID": this.medicationsForm.get('DurationId')?.value,
        "SFRM": new Date(),
        "REM": this.medicationsForm.get('Remarks')?.value,
        "JUST": "",
        "REM2L": "",
        "STM": new Date(),
        "FQTY": this.medicationsForm.get('IssueUOMID')?.value,
        "QTY": this.medicationsForm.get('Quantity')?.value,
        "QTYUOMID": this.medicationsForm.get('DosageId')?.value,
        "PIID": 0,
      })

      let payload = {
        "EmpID": this.doctorDetails[0].EmpId,
        "SpecilizationID": this.doctorDetails[0].EmpSpecialisationId,
        "ActionType": this.medicationsForm.get('IsFav')?.value,
        "PDetails": [],
        "IDetails": [],
        "DDetails": this.favMed,
        "DADetails": []
      }
      this.config.saveFavouriteProcedure(payload).subscribe(
        (response) => {
          if (response.Code == 200) {
            this.isMedicationFormSubmitted = false;
          }
        },
        (err) => {
          console.log(err)
        });
      this.favMed = [];
    }
  }
  fetchSubstituteItems(itemid: any) {
    this.config.FetchSubstituteItems(itemid, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.substituteItems = response.FetchSubstituteItemsDataaList;
          $("#modalSubstituteItems").modal('show');

        }
      })
  }
  ClearPrescriptionsSelected() {
    this.ClearMedicationForm();
    this.patientNoPrevMed = false;
    if (this.patientDetails.PatientType != '2')
      this.FetchSavedAdmissionReconciliation();
  }
  selectSubstituteItem(sub: any) {
    this.onItemSelected(sub);
    $("#modalSubstituteItems").modal('hide');
  }
  LoadPatientVisitsADM() {
    var FacilityID = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;

    this.config.LoadPatientVisitsADM(this.PatientId, this.selectedPatientAdmissionId, this.selectedView.PatientType, this.selectedCard.WardID == undefined ? FacilityID : this.selectedCard.WardID, this.hospitalId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.LoadPatientVisitsADMDataList.length > 0) {
            if (response.LoadPatientVisitsADMDataList?.AdmReconciliationStatus != '' && response.LoadPatientVisitsADMDataList?.AdmReconciliationStatus != null &&
              Number(response.LoadPatientVisitsADMDataList?.AdmReconciliationStatus) === 2 &&
              response.LoadPatientVisitsADMDataList?.AdmReconPrescriptionID === '') {//Patient has no previous medication
              this.patientNoPrevMed = true;
              if (response.LoadPatientVisitsADMDataList?.AdmReconciliationDate != null && response.LoadPatientVisitsADMDataList?.AdmReconciliationDate != '')
                this.lastSavedAdmReconDate = "Saved on :" + response.LoadPatientVisitsADMDataList?.AdmReconciliationDate
            }
          }
        }
      });
  }
  FetchSavedAdmissionReconciliation() {
    this.config.fetchSavedAdmissionReconciliation('2', this.selectedPatientAdmissionId, this.PatientId, false, 0, this.hospitalId, false)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.objPatientPrescriptionOrderDataList.length > 0) {
            this.lastSavedAdmReconDate = response.objPatientPrescriptionOrderDataList[0].StatusMsg
          }
          response.objPatientPrescriptionDataList.forEach((element: any, index: any) => {
            this.selectedItemsList.push({
              SlNo: this.selectedItemsList.length + 1,
              Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
              ClassSelected: false,
              ItemId: element.PrescribedItemID,
              ItemName: element.DRUGNAME,
              StrengthUoMID: element.QtyUomID,
              Strength: element.Qty + " " + element.QtyUom,
              StrengthUoM: element.QtyUom,
              Dosage: element.DOS + " " + element.DOSE, //response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
              DosageId: element.DOID,
              AdmRouteId: element.ARI,
              Route: element.AdmRoute,
              FrequencyId: element.FID,
              Frequency: element.Frequency,
              ScheduleStartDate: this.datepipe.transform(element.SFRM, "dd-MMM-yyyy")?.toString(),
              StartFrom: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
              DurationId: element.DUID,
              Duration: element.DUR,
              DurationValue: element.DUR.split(' '),
              PresInstr: element.PatientInstructions,//item.PresInstr,
              Quantity: parseFloat(element.FQTY),
              QuantityUOMId: element.QtyUomID,
              PresType: "",//item.PresType,
              PRNType: element.PRNREASON,//item.PRNType,
              GenericId: element.PrescribedGenericItemID,
              DefaultUOMID: element.QtyUomID,
              medInstructionId: "",//item.medInstructionId,
              PRNReason: "",//item.PRNReason,
              IssueUoM: element.FQTYUOM,
              IssueUOMID: element.IssuedQtyUOMName,
              IssueUOMValue: element.Qty,
              IssueTypeUOM: element.QtyUomID,
              Remarks: element.REM,
              IsFav: element.IsFav,
              DiseaseID: element.DiseaseID,
              ScheduleEndDate: element.EDT,
              ScheduleTime: element.STM,
              PrescriptionItemStatusNew: element.PrescriptionItemStatusNew,
              PrescriptionID: element.PrescriptionID,
              HoldStatus: element.HoldStatus,
              ReasonForHolding: element.ReasonForHolding,
              PrescriptionItemsHoldReasonID: element.PrescriptionItemsHoldReasonID,
              PrescriptionItemsHoldReason: element.ReasonForHolding,
              HoldDate: element.HoldDate,
              PrescriptionItemStatus: element.PrescriptionItemStatus,
              PrescriptionItemStatusName: (element.PrescriptionItemStatusName === '' || element.PrescriptionItemStatusName === null) ? 'Select' : element.PrescriptionItemStatusName,
              LastDoseGiven: this.datepipe.transform(element.LastGivenDose?.split(' ')[0], "dd-MMM-yyyy")?.toString(),
              LastDoseGivenTime: element.LastGivenDose?.split(' ')[1],
              PrescriptionItemid: element.PrescriptionItemid,
              selected: false,
              viewMore: false
            });
          });

        }
      })
  }
  convertTo24HourFormat(time12: string): string {
    const date = new Date(`2000-01-01 ${time12}`);
    return this.datepipe.transform(date, 'HH:mm') || '';
  }
  onPatientNoPrevMed() {
    this.patientNoPrevMed = !this.patientNoPrevMed;
  }

  onAdmReconStatusChange(event: any, med: any) {
    let findmed = this.selectedItemsList.find((x: any) => x?.ItemId === med.ItemId);
    if (findmed) {
      const index = this.selectedItemsList.indexOf(findmed, 0);
      if (index > -1) {
        findmed.medStatus = event.ID;
        findmed.PrescriptionItemStatus = event.ID;
        findmed.PrescriptionItemStatusName = event.Name;
      }
    }
  }
  onApplyToAllChange() {
    this.selectall = !this.selectall;
    if (this.selectall) {
      let mainStatus = this.selectedItemsList[0].PrescriptionItemStatus;
      let mainStatusName = this.selectedItemsList[0].PrescriptionItemStatusName;
      this.selectedItemsList.forEach((item: any) => {
        if (item.PrescriptionItemStatusName != 'Hold') {
          item.PrescriptionItemStatus = mainStatus;
          item.PrescriptionItemStatusName = mainStatusName;
        }
      })
    }
  }

  setRouteIdValue(route: any) {
    this.medicationsForm.patchValue({
      AdmRouteId: route.RouteID,
      AdmRoute: route.RouteName
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

  setAdmReconStatusName(instr: any) {
    this.medicationsForm.patchValue({
      medStatus: instr.ID,
      PrescriptionItemStatus: instr.ID,
      PrescriptionItemStatusName: instr.Name
    });
  }

  getAdmReconStatusName(durid: string) {
    if (durid.length != undefined && durid.length > 0) {
      if (durid[0] === '') {
        return 'Status';
      }
    }
    else if (durid === "" || durid === null || durid === '0') {
      return 'Status';
    }
    const dur = this.admReconStatus?.find((x: any) => x.ID == durid);
    return dur.Name;
  }

  selectmedication(med: any) {
    med.selected = !med.selected
  }

  issuedPrescriptionItems: any[] = [];
  PatientVisitsList: any = [];
  previousMedicationListDetails: any = []
  previousMedicationListDetailsFilterData: any = [];
  issuedItemsAgainstPresc: any = [];
  showPrevMedFiltersData: boolean = true;
  showHomeMedInPrevMed: string = "no";
  currentFilter: any;
  errorMessages: any = [];
  duplicateItemsList: any = [];
  mismatchedMedications: any = [];
  medicineHistory: any = [];
  selectedHistoryItem: any;
  showMedicineHistorydiv = false;
  selectedPrevMedItem: any;
  selectAllPrevMedFilter: boolean = false;
  holdBtnName_prev: string = 'Hold';

  initiatePreviousMedicationForm() {
    this.viewPreviousMedicationForm = this.fb.group({
      fromdate: [''],
      todate: [''],
      PrescriptionID: ['0']
    });
  }

  PreviousMedicationClick(value: boolean = false) {
    var startdate = moment(this.viewPreviousMedicationForm.get('fromdate')?.value).format('DD-MMM-YYYY');
    var enddate = moment(this.viewPreviousMedicationForm.get('todate')?.value).format('DD-MMM-YYYY');

    this.config.getPreviousMedicationPFN(this.patientDetails.RegCode, startdate, enddate, 0, 0).subscribe((response) => {
      if (response.Status === "Success") {
        $("#previousMedication").modal('show');
        this.previousMedicationList = response.PreviousMedicationDataList;
        this.issuedPrescriptionItems = response.PreviousMedicationIssuedDataList;
        this.PatientVisitsList = this.previousMedicationList.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.PrescriptionNO === thing.PrescriptionNO) === i);
        const distinctThings = response.PreviousMedicationDataList.filter(
          (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.PrescriptionNO === thing.PrescriptionNO) === i);
        this.filteredpreviousMedicationList = distinctThings;
        this.filteredpreviousMedicationList = this.filteredpreviousMedicationList.sort((a: any, b: any) => new Date(b.PrescriptionCreateDate).getTime() - new Date(a.PrescriptionCreateDate).getTime());
        this.PatientVisitsList = this.PatientVisitsList.sort((a: any, b: any) => b.PrescriptionID - a.PrescriptionID);
        this.previousMedicationListDetails = this.previousMedicationList.filter((x: any) => x.PrescriptionID === this.filteredpreviousMedicationList[0].PrescriptionID);
        this.issuedItemsAgainstPresc = this.issuedPrescriptionItems.filter((x: any) => x.PrescriptionID == this.filteredpreviousMedicationList[0].PrescriptionID);
        this.previousMedicationListDetails[0].selected = true;
        this.previousMedicationListDetails[0].selectall = false;
        this.showPrevMedFiltersData = value;
        if (value === true) {
          this.showPreviousMedications(this.currentFilter);
        }
        this.showHomeMedInPrevMed = 'no';
      }
    },
      (err) => {

      })
  }

  showPreviousMedications(filter: string) {
    this.currentFilter = filter;
    this.showPrevMedFiltersData = true;
    if (filter === "W") {
      var week = new Date();
      week.setDate(week.getDate() - 7);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(week.toString()));
    } else if (filter === "T") {
      var today = new Date();
      today.setDate(today.getDate());
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(today.toString()));
    }
    else if (filter === "M") {
      var onem = new Date();
      onem.setMonth(onem.getMonth() - 1);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(onem.toString()));
    } else if (filter === "3M") {
      var threem = new Date();
      threem.setMonth(threem.getMonth() - 3);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(threem.toString()));
    } else if (filter === "6M") {
      var sixm = new Date();
      sixm.setMonth(sixm.getMonth() - 6);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(sixm.toString()));
    } else if (filter === "1Y") {
      var twelvem = new Date();
      twelvem.setMonth(twelvem.getMonth() - 12);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(twelvem.toString()));
    }
  }

  filterPreviousMedications(event: any) {
    var prescid = event.target.value;
    if (prescid === "0") {
      this.filteredpreviousMedicationList = this.previousMedicationList;
      const distinctThings = this.filteredpreviousMedicationList.filter(
        (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.PrescriptionNO === thing.PrescriptionNO) === i);
      this.filteredpreviousMedicationList = distinctThings;
      this.previousMedicationListDetails = this.previousMedicationList.filter((x: any) => x.PrescriptionID === this.filteredpreviousMedicationList[0].PrescriptionID);
      this.issuedItemsAgainstPresc = this.issuedPrescriptionItems.filter((x: any) => x.PrescriptionID == this.filteredpreviousMedicationList[0].PrescriptionID);
      this.previousMedicationListDetails[0].selected = true;
      this.previousMedicationListDetails[0].selectall = false;
    }
    else {
      const distinctThings = this.previousMedicationList.filter(
        (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.PrescriptionID === prescid) === i);
      this.filteredpreviousMedicationList = distinctThings;
      this.previousMedicationListDetails = this.previousMedicationList.filter((x: any) => x.PrescriptionID === prescid);
      this.issuedItemsAgainstPresc = this.issuedPrescriptionItems.filter((x: any) => x.PrescriptionID == prescid);
      this.previousMedicationListDetails[0].selected = true;
      this.previousMedicationListDetails[0].selectall = false;
    }
  }

  toggleIsHomeMedInPrevMedClick(option: string) {
    this.showHomeMedInPrevMed = option === 'no' ? 'yes' : 'no';
    this.showPrevMedFiltersData = false;
    if (this.showHomeMedInPrevMed === 'yes') {
      this.previousMedicationListDetailsFilterData = [];
      this.showPrevMedFiltersData = true;
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x: any) => x.isDischargeMedication.toString().toLowerCase() === 'true');
    }
    else {
      this.showHomeMedInPrevMed = 'no';
      this.showPrevMedFiltersData = false;
    }
  }

  discontinueMedFromPrevMedConfirmation() {
    if (!this.showPrevMedFiltersData) {
      let discMed = this.previousMedicationListDetails.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
      if (discMed.length === 0) {
        this.errorMessages = "Please select atleast one medication to discontinue";
        $("#errorMsg").modal('show');
        return;
      }
      let discInactMed = this.previousMedicationListDetails.filter((x: any) => x?.StatusID === 0);
      if (discInactMed.length > 0) {
        this.errorMessages = "Cannot discontinue Inactive medication";
        $("#errorMsg").modal('show');
        return;
      }
    }
    $("#discontinue_multiple_prevmedremarks").modal('show');
  }

  checkIfDiscontinueMedSelected() {
    const discontinueMed = this.previousMedicationListDetailsFilterData.filter((x: any) => x.Blocked == '1' && x.isChecked);
    if (discontinueMed.length > 0) {
      return false;
    }
    return true;
  }

  PrescribePreviousMedicationBtnClick() {
    let find = this.previousMedicationListDetails.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
    if (this.showPrevMedFiltersData) {
      find = this.previousMedicationListDetailsFilterData.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
    }
    if (find.length > 0) {
      const url = this.us.getApiUrl(AdmissionReconciliation.FetchItemSpecialisationValidation, {
        ItemIDs: find.map((e: any) => e.ItemID).toString(),
        WorkStationID: this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
        HospitalID: this.hospitalId
      });
      this.us.get(url).subscribe((response: any) => {
        if (response.Code === 200) {
          if (response.FetchItemSpecialisationValidationDataList.length === 0) {
            this.PrescribePreviousMedication();
          } else {
            this.mismatchedMedications = [];
            find.forEach((selected: any) => {
              const itemResponses = response.FetchItemSpecialisationValidationDataList.filter((a: any) => a.ItemID === selected.ItemID);

              if (itemResponses.length > 0) {
                const hasMatchingSpecialization = itemResponses.some(
                  (resp: any) => resp.SpecialiseID === this.doctorDetails[0].EmpSpecialisationId
                );

                if (!hasMatchingSpecialization) {
                  selected.specializations = itemResponses.map((b: any) => b.Specialisation).toString();
                  this.mismatchedMedications.push(selected);
                }
              }
            });
            if (this.mismatchedMedications.length > 0) {
              find.forEach((selected: any) => {
                // If the medication exists in mismatchedMedications, mark it as unchecked
                if (this.mismatchedMedications.some((mis: any) => mis.ItemID === selected.ItemID)) {
                  selected.isChecked = false;
                }
              });
              $('#medicationValidationModal').modal('show');
            }
            this.PrescribePreviousMedication();
          }
        }
      });
    } else {
      this.PrescribePreviousMedication();
    }
  }

  PrescribePreviousMedication() {
    let find = this.previousMedicationListDetails.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
    if (this.showPrevMedFiltersData) {
      find = this.previousMedicationListDetailsFilterData.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
    }
    let subscribes: ObservableInput<any>[] = [];

    find.forEach((med: any, index: any) => {
      med.selected = false;
      med.isChecked = false;
      subscribes.push(
        this.config.displayScheduleAndQuantity(
          this.doctorDetails[0].UserId,
          this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID,
          med.FrequencyID,
          1,
          med.Dose,
          med.Duration,
          med.DurationID,
          1,
          0,
          med.ItemID,
          (this.patientDetails.PatientType == '2' || this.patientDetails.PatientType == '4') ? med.IPDefaultUomID : med.OPDefaultUomID,
          moment(med.EndDatetime).format('DD-MMM-YYYY'),
          this.patientDetails.PatientType == "3" ? "1" : this.patientDetails.PatientType, 0, this.hospitalId));
    });
    combineLatest(subscribes).subscribe(responses => {
      responses.forEach((response, index) => {
        if (response.Code === 200) {
          find[index].Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
          find[index].ScheduleEndDate = find[index].Blocked == '1' ? moment(new Date).format('DD-MMM-YYYY HH:mm') : response.FetchItemQtyDataCDataaList[0].EDT;
        }
      })
      if (find.length > 0) {
        let duplicateItemsList = "";
        find.forEach((element: any, index: any) => {
          find[index].isChecked = true;
          let findDuplicateItem;
          if (this.selectedItemsList.length > 0) {
            findDuplicateItem = this.selectedItemsList.filter((x: any) => x?.ItemId === find[index].ItemID || x.GenericId == find[index].GenericID);
          }
          if (findDuplicateItem != undefined && findDuplicateItem.length > 0) {
            duplicateItemsList = duplicateItemsList != "" ? duplicateItemsList + "," + findDuplicateItem[0].ItemName : findDuplicateItem[0].ItemName;
          }
          else {
            this.config.fetchItemForPrescriptions(this.patientDetails.PatientType, find[index].ItemID, "1", this.doctorDetails[0].EmpId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, this.hospitalId, this.doctorDetails[0].EmpId)
              .subscribe((response: any) => {
                if (response.Code == 200) {
                  const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
                  this.selectedItemsList.push({
                    SlNo: this.selectedItemsList.length + 1,
                    Class: "row card_item_div mx-0 gx-2 w-100 align-items-center",
                    ClassSelected: false,
                    ItemId: find[index].ItemID,
                    ItemName: find[index].GenericItemName,
                    StrengthUoMID: response.ItemDataList[0].StrengthUoMID,
                    Strength: response.ItemDataList[0].Strength + " " + response.ItemDataList[0].StrengthUoM,
                    StrengthUoM: response.ItemDataList[0].StrengthUoM,
                    Dosage: find[index].Dose + " " + find[index].DoseUoM, //response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
                    DosageId: response.ItemDataList[0].QtyUomID,
                    AdmRouteId: find[index].AdmRouteID,
                    Route: find[index].AdmRoute,
                    FrequencyId: find[index].FrequencyID,
                    Frequency: find[index].Frequency,
                    ScheduleStartDate: find[index].Blocked == '1' ? moment(new Date).format('DD-MMM-YYYY') :
                      new Date(find[index].EndDatetime) > new Date() ?
                        this.datepipe.transform(new Date(find[index].EndDatetime).setDate(new Date(find[index].EndDatetime).getDate() + 1), "dd-MMM-yyyy")?.toString()
                        : moment(new Date()).format('DD-MMM-YYYY'),
                    StartFrom: find[index].Blocked == '1' ? moment(new Date()).format('DD-MMM-YYYY') :
                      new Date(find[index].EndDatetime) > new Date() ?
                        this.datepipe.transform(new Date(find[index].EndDatetime).setDate(new Date(find[index].EndDatetime).getDate() + 1), "dd-MMM-yyyy")?.toString()
                        : moment(new Date()).format('DD-MMM-YYYY'),
                    DurationId: find[index].DurationID,
                    Duration: find[index].Duration + " " + find[index].DurationUOM,
                    DurationValue: find[index].Duration,
                    PresInstr: "",//item.PresInstr,
                    Quantity: find[index].Quantity,
                    QuantityUOMId: find[index].QtyUOMID,
                    PresType: "",//item.PresType,
                    PRNType: find[index].PRNMedicationReason,//item.PRNType,
                    GenericId: find[index].GenericID,
                    DefaultUOMID: (this.patientDetails.PatientType == '2' || this.patientDetails.PatientType == '4') ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
                    medInstructionId: "",//item.medInstructionId,
                    PRNReason: "",//item.PRNReason,
                    IssueUoM: response.DefaultUOMDataaList[0].IssueUOM,
                    IssueUOMID: response.DefaultUOMDataaList[0].IssueUOMID,
                    IssueUOMValue: response.ItemDataList[0].Quantity,
                    IssueTypeUOM: itempacking[0].FromUoMID,
                    lexicomAlertIcon: '',
                    QOH: (this.patientDetails.PatientType == "2" || this.patientDetails.PatientType == "4") ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
                    IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
                    BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '1' ? '0' : response.ItemDataList[0].Basesolution,
                    IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '1' ? '0' : response.ItemDataList[0].IVFluidExpiry,
                    Price: response.ItemPriceDataList[0].MRP,
                    ScheduleEndDate: find[index].Blocked == '1' ? this.datepipe.transform(new Date().setDate(new Date(new Date()).getDate() + 1), "dd-MMM-yyyy")?.toString() : find[index].ScheduleEndDate,
                    viewMore: false,
                    IsAntibiotic: response.ItemDataList[0].IsAntibiotic,
                    IsAntibioticForm: response.ItemDataList[0].IsAntibioticForm,
                    PrescribedQty: response.ItemDataList[0].PrescribedQty,
                    Remarks: find[index].Remarks,
                    medStatus: this.admReconStatus[0].ID,
                    PrescriptionItemStatus: this.admReconStatus[0].ID,
                    PrescriptionItemStatusName: this.admReconStatus[0].Name,
                  });
                }
              })
          }
        });
        if (duplicateItemsList != undefined && duplicateItemsList != "") {
          this.duplicateItemsList = duplicateItemsList;
          $("#itemAlreadySelected").modal('show');
        }
        $("#previousMedication").modal('hide');
      }
      else {
        $("#noSelectedMedToPrescribe").modal('show');
      }
    });
  }

  discontinueMultipleMedFromPrevMed() {
    let discMed = this.previousMedicationListDetails.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
    if (this.showPrevMedFiltersData) {
      discMed = this.previousMedicationListDetailsFilterData.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');
    }
    var discMedXml: any[] = [];
    discMed.forEach((element: any) => {
      discMedXml.push({
        "PID": element.PrescriptionID,
        "IID": element.ItemID,
        "MID": element.MonitorID,
        "DCR": $("#discontinue_multiple_Rem").val()
      })
    });
    var payload = {
      "DetailsXML": discMedXml,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? 0 : this.facility.FacilityID,
      "HospitalID": this.hospitalId
    }
    this.config.saveBlockPrescriptionItems(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#discontinue_multiple_Rem").val('');
          $("#discontinueMedSaveMsg").modal('show');
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }

  showMedicineHistory(item: any) {
    this.selectedHistoryItem = item;
    this.config.FetchPatientPrescibedDrugHistory(item.ItemID, this.PatientId, this.facility.FacilityID, this.hospitalId, this.patientDetails.SSN)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientPrescibedDrugHistoryDataList.length > 0) {
          this.medicineHistory = [];
          this.medicineHistory = response.FetchPatientPrescibedDrugHistoryDataList.sort((a: any, b: any) => new Date(b.PrescriptionDate).getTime() - new Date(a.PrescriptionDate).getTime());;
          this.showMedicineHistorydiv = true;
        }
      },
        (err) => {

        })
  }

  filterIssuedItems(view: any) {
    return this.issuedItemsAgainstPresc.filter((x: any) => x.PrescriptionItemID === view.ItemID);
  }

  showViewMorePrevMed(prevmed: any) {
    prevmed.viewMorePrevMed = !prevmed.viewMorePrevMed;
  }

  onNewPreviousMedicationSelected(isChecked: any, index: any, item: any) {
    if (isChecked) {
      if (item.Frequency === 'STAT') {
        $("#cannotPrescribeStatMedMsg").modal('show');
        return;
      }
      if (item.StatusID != 1) {

      }
      else {
        this.selectedPrevMedItem = item;
        $("#activeMedicationYesNo").modal('show');
      }
      let find = this.previousMedicationListDetails.filter((x: any) => x?.ItemID === item.ItemID && x?.PrescriptionID === item.PrescriptionID);
      if (find.length > 0) {
        find.forEach((element: any, index: any) => {
          find[index].isChecked = true;
        });
      }
      else {
        let find = this.previousMedicationListDetailsFilterData.filter((x: any) => x?.ItemID === item.ItemID && x?.PrescriptionID === item.PrescriptionID);
        if (find.length > 0) {
          find.forEach((element: any, index: any) => {
            find[index].isChecked = true;
          });
        }
      }
    }
    else {
      item.isChecked = false;
    }
  }

  selectedDiscontinuedPrevMedItem(index: any) {
    $("#discontinue_prevmedremarks").modal('show');
    this.remarksForSelectedDiscontinuedItemName = index.GenericItemName;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedDiscontinuedItemId = index.ItemID;
    this.remarksForSelectedDiscontinuedPrescId = index.PrescriptionID;
    $("#discontinueRem").val('');
  }

  onNewPreviousMedicationSelectedAll() {
    this.selectAllPrevMedFilter = !this.selectAllPrevMedFilter;
    const activeMed = this.previousMedicationListDetailsFilterData.filter((x: any) => x.StatusID == 1);
    if (this.selectAllPrevMedFilter) {
      activeMed.filter((x: any) => x.StatusID == 1).forEach((item: any) => {
        item.isChecked = true;
      });
    }
    else {
      activeMed.forEach((element: any, index: any) => {
        element.isChecked = false;
      });
    }
  }

  getActiveMedication(): number {
    let count = 0;
    if (this.previousMedicationListDetails?.length > 0) {
      count = this.previousMedicationListDetails.filter((element: any) => element.StatusID.toString() === '1').length;
    }
    return count;
  }

  getActiveHomeMedication(): number {
    let count = 0;
    if (this.previousMedicationListDetailsFilterData?.length > 0) {
      count = this.previousMedicationListDetailsFilterData.filter((element: any) => element.StatusID.toString() === '1').length;
    }
    return count;
  }

  continuePrescribingPrevMed(type: string) {
    if (type === 'yes') {
      let find = this.previousMedicationList.filter((x: any) => x?.ItemID === this.selectedPrevMedItem?.ItemID && x?.PrescriptionID === this.selectedPrevMedItem?.PrescriptionID);
      if (find) {
        find.forEach((element: any, index: any) => {
          find[index].isChecked = true;
        });
      }
    }
    else {
      let find = this.previousMedicationList.filter((x: any) => x?.ItemID === this.selectedPrevMedItem?.ItemID && x?.PrescriptionID === this.selectedPrevMedItem?.PrescriptionID);
      if (find) {
        find.forEach((element: any, index: any) => {
          find[index].isChecked = false;
        });
      }
    }
  }

  prevMedSelected(isChecked: any, index: any, item: any) {
    this.config.FetchPrescriptionValidations(this.selectedPatientAdmissionId, item.ItemID, item.GenericID, item.GenericItemName.replace(/[^\w\s]/gi, ''),
      this.PatientId, this.patientDetails.AgeValue, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalId, this.patientDetails.PatientType)
      .subscribe((valresponse: any) => {
        if (valresponse.FetchPrescValidationsDataaList.length === 0) {
          this.onNewPreviousMedicationSelected(isChecked, index, item);
        }
        else {
          if (valresponse.FetchPrescValidationsDataaList[0].Buttons == "YESNO") {
            this.onNewPreviousMedicationSelected(isChecked, index, item);
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

  selectedHoldItem_prev(index: any) {
    $("#hold_remarks_prev").modal('show');
    this.remarksForSelectedHoldItemName_prev = index.GenericItemName;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedHoldItemId_prev = index.ItemID;
    this.remarksForSelectedHoldPrescId_prev = index.PrescriptionID;
    this.holdReasonValidation_prev = false;
    this.selectedHoldReason_prev = (index.HoldingReasonID != undefined && index.HoldingReasonID != null && index.HoldingReasonID != '') ? index.HoldingReasonID : index.PrescriptionItemsHoldReasonID;
    this.selectedHoldReason = this.selectedHoldReason_prev;
    if (index.HoldStatus == null || index.HoldStatus == 0)
      this.holdBtnName_prev = 'Hold';
    else
      this.holdBtnName_prev = 'Release';
    $("#holdRem_prev").val((index.HoldingReason != undefined && index.HoldingReason != null && index.HoldingReason != '') ? index.ReasonForHolding : index.ReasonForHolding);
  }

  selectedHoldReasonEvent_prev(event: any) {
    this.selectedHoldReason_prev = event.target.value;
  }

  holdPrescriptionItem_prev(med: any, rem: any, btName_prev: string) {
    if (this.selectedHoldReason_prev != "0" && rem.value != "") {
      $("#hold_remarks").modal('hide');
      var currentDate = this.datepipe.transform(new Date(), "dd-MM-yyyy HH:MM")?.toString();
      var holdMedXml = [
        {
          "PID": this.remarksForSelectedHoldPrescId_prev,
          "IID": this.remarksForSelectedHoldItemId_prev,
          "ISEQ": 1,
          "REASON": " | " + this.doctorDetails[0].UserName + "  " + currentDate + " : " + rem.value,
          "HOLDSTATUS": btName_prev == 'Hold' ? "1" : "0",
          "HRID": this.selectedHoldReason,
          "BLK": "0"
        }
      ]

      let holdPayload = {
        "DoctorID": this.doctorDetails[0].EmpId,
        "HoldPresItemsXML": holdMedXml
      }
      this.config.holdPrescriptionItems(holdPayload).subscribe(
        (response) => {
          if (response.Code == 200) {

            $("#holdMedSaveMsg_prev").modal('show');
          } else {

          }
        },
        (err) => {
          console.log(err)
        });
    }
    else {
      this.holdReasonValidation = true;
      $("#holdRemarksLabel").modal('show');
    }
  }

  selectallPresc(presc: any) {
    presc.selectall = !presc.selectall;
    this.previousMedicationListDetails.forEach((element: any, index: any) => {
      if (presc.selectall) {
        if (element.StatusID != 1) {

        }
        else {
          this.selectedPrevMedItem = element;
          $("#activeMedicationYesNo").modal('show');
        }
        let find = this.previousMedicationListDetails.filter((x: any) => x?.ItemID === element.ItemID && x?.PrescriptionID === element.PrescriptionID);
        if (find && find[0].Frequency !== 'STAT') {
          find.forEach((element: any, index: any) => {
            find[index].isChecked = true;
          });
        }
      }
      else {
        let find = this.previousMedicationListDetails.filter((x: any) => x?.ItemID === element?.ItemID && x?.PrescriptionID === element?.PrescriptionID);
        if (find) {
          find.forEach((element: any, index: any) => {
            find[index].isChecked = false;
          });
        }
      }
    });
  }

  showPrevMedDetails(pres: any) {
    this.showMedicineHistorydiv = false;
    this.selectedHistoryItem = []; this.previousMedicationListDetails = [];
    this.filteredpreviousMedicationList.forEach((element: any, index: any) => {
      if (element.PrescriptionID === pres.PrescriptionID)
        element.selected = true;
      else
        element.selected = false;
    });
    if (pres.selected) {
      this.previousMedicationListDetails = this.previousMedicationList.filter((buttom: any) => buttom.PrescriptionID == pres.PrescriptionID);
      this.previousMedicationListDetails = this.previousMedicationListDetails.map((prevmedlst: any) => ({
        ...prevmedlst,
        viewMorePrevMed: false,
      }));
    }
    else
      this.previousMedicationListDetails = [];

    this.issuedItemsAgainstPresc = this.issuedPrescriptionItems.filter((x: any) => x.PrescriptionID == pres.PrescriptionID)
  }

  toggleShowMore(view: any) {
    view.expanded = !view.expanded;
  }

  toggleAccordion(prescriptiondate: any) {
    prescriptiondate.isExpanded = !prescriptiondate.isExpanded;
  }

  onPreviousMedicationSelected(event: any, index: any, item: any) {
    if (event.target.checked) {
      if (item.StatusID != 1) {

      }
      else {
        this.selectedPrevMedItem = item;
        $("#activeMedicationYesNo").modal('show');
      }
      let find = this.previousMedicationList.filter((x: any) => x?.ItemID === item.ItemID && x?.PrescriptionID === item.PrescriptionID);
      if (find) {
        find.forEach((element: any, index: any) => {
          find[index].isChecked = true;
        });
      }
    }
    else {
      let find = this.previousMedicationList.filter((x: any) => x?.ItemID === this.selectedPrevMedItem?.ItemID && x?.PrescriptionID === this.selectedPrevMedItem?.PrescriptionID);
      if (find) {
        find.forEach((element: any, index: any) => {
          find[index].isChecked = false;
        });
      }
    }
  }
}
interface FavouriteMedication {
  GenericID: string,
  ItemID: string,
  DoseID: string;
  LexicomItemID: string;
  group: string;
  name: string;
  Dose: number;
  AdmRoute: string;
  StrengthDosage: string;
  NoStockColor: string;
  StockColor: string;
}

const AdmissionReconciliation = {
  FetchItemSpecialisationValidation: 'FetchItemSpecialisationValidation?ItemIDs=${ItemIDs}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
}


