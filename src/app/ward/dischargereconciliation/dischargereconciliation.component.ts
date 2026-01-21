import { Component, OnInit, ElementRef, EventEmitter, QueryList, Output, ViewChildren, ViewChild, Input } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DrugDetails } from './models/prescription.model';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { ValidateEmployeeComponent } from 'src/app/shared/validate-employee/validate-employee.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  selector: 'app-dischargereconciliation',
  templateUrl: './dischargereconciliation.component.html',
  styleUrls: ['./dischargereconciliation.component.scss'],
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
export class DischargereconciliationComponent implements OnInit {
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
  prescriptionSaveData: any = {};
  selectedView: any;
  selectall = false;
  IsHome = true;
  selectedMedDrugFreqScheduleTime: any;
  @Input() fromCaseSheet = false;
  errorMsg = "";
  saveMsg = "";
  endofEpisode: boolean = false;
  facility: any;
  
  constructor(private fb: FormBuilder, private config: ConfigService, private router: Router, public datepipe: DatePipe, private modalSvc: NgbModal) {
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
    this.hospitalId = sessionStorage.getItem('hospitalId');
    this.PatientId = this.patientDetails.PatientId;
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    //this.selectedPatientAdmissionId = sessionStorage.getItem("selectedPatientAdmissionId")
    this.selectedView = JSON.parse(sessionStorage.getItem("InPatientDetails") || '{}');
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.selectedPatientAdmissionId = this.selectedView.IPID;
    if (this.patientDetails.PatientType == '2') {
      this.PatientId = this.patientDetails.PatientID;
    }
    if (sessionStorage.getItem("ISEpisodeclose") === "true") {
      this.endofEpisode = true;
    } else {
      this.endofEpisode = false;
    }
    this.FetchMedicationDemographics();
    this.FetchDrugFrequencies();
    this.FetchMedicationInstructions();
    this.fetchAdmReconStatus();
    this.initializeMedicationsForm();
    this.FetchHoldMaster();
    this.FetchSavedDischargeReconciliation();
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
                Class: "row card_item_div mx-0 g-3 w-100 align-items-center",
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
                PrescriptionID: ''
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
    this.config.FetchServiceActionableAlerts(this.selectedPatientAdmissionId, this.patientDetails.PatientType == '2' ? this.patientDetails.AgeValue : this.patientDetails.Age, itemId).subscribe((response) => {
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
          this.config.fetchItemForPrescriptions(this.patientDetails.PatientType == '2' ? '2' : '1', itemId, "1", this.doctorDetails[0].EmpId, "0", this.hospitalId, this.doctorDetails[0].EmpId)
            .subscribe((response: any) => {
              if (response.Code == 200) {
                this.config.FetchPrescriptionValidations(this.selectedPatientAdmissionId, itemId, response.ItemGenericsDataList[0].GenericID, response.ItemDataList[0].DisplayName, this.PatientId, this.patientDetails.PatientType == '2' ? this.patientDetails.AgeValue : this.patientDetails.Age, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalId, this.patientDetails.PatientType)
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
        }
      }
      else {

        this.config.fetchItemForPrescriptions(this.patientDetails.PatientType == '2' ? '2' : '1', itemId, "1", this.doctorDetails[0].EmpId, "0", this.hospitalId, this.doctorDetails[0].EmpId)
          .subscribe((response: any) => {
            if (response.Code == 200) {
              this.config.FetchPrescriptionValidations(this.selectedPatientAdmissionId, itemId, response.ItemGenericsDataList[0].GenericID, response.ItemDataList[0].DisplayName, this.PatientId, this.patientDetails.PatientType == '2' ? this.patientDetails.AgeValue : this.patientDetails.Age, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalId, this.selectedCard.PatientType)
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
            Class: "row card_item_div mx-0 g-3 w-100 align-items-center",
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
            PrescriptionItemStatus: this.medicationsForm.get('PrescriptionItemStatus')?.value,
            PrescriptionItemStatusName: this.medicationsForm.get('PrescriptionItemStatusName')?.value,
            LastDoseGiven: this.medicationsForm.get('LastDoseGiven')?.value,
            LastDoseGivenTime: this.medicationsForm.get('LastDoseGivenTime')?.value,
            PrescriptionID: ''
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
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.facility.FacilityID === undefined ? this.facility : this.facility.FacilityID, FreqVal, 1, DosageUnit, DurationUnit, DurationVal, 1, 0, ItemId, DefaultUOMID, PrescStartDate, 1, 0, this.hospitalId)
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

  saveDisRecToPrescription(event: any) {
    if(this.selectedItemsList.filter((x:any) => x.selected).length === 0) {
      this.prescriptionValidationMsg = "Please select any medication to save as Prescription";
      $("#prescriptionValidationMsgModal").modal('show');
      return;
    }
    this.drugDetailsPres = [];
    this.selectedItemsList.filter((x:any) => x.selected).forEach((element: any) => {
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
        //PISTATUS: "",
        // ARID:
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
        DISID: element.DISID
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
      "PrscritionStats": 3,
      "PainScoreID": 0,
      "IsPatientDrugAlleric": 0,
      "HasPreviousMedication": false,
      "IsAdminReconciliation": 0,
      "Hospitalid": this.hospitalId,
    };
    this.config.saveAdmissionReconPrescriptions(postData).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.selectedItemsList = [];
          if (this.patientDetails.PatientType != '2')
            this.FetchSavedDischargeReconciliation();
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
    if (this.selectedItemsList.length > 0) {
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
        validate.toString().split("^")[1] == "NoProcQty" ? $("#validateProceduresMsg").modal('show') : $("#validatePrescriptionMsg").modal('show');
      }
    }
    else {
      $("#noPrescriptionSelected").modal('show');
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
      "Ddetails": JSON.stringify(this.drugDetails),
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
      "PrscritionStats": 3,
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
          if (this.patientDetails.PatientType != '2')
            this.FetchSavedDischargeReconciliation();
          this.saveMsg = "Discharge Reconciliation saved successfully";
          $("#savePrescriptionMsg").modal('show');

        } else {

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
    this.drugDetailsPres = [];
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
    else
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
        //PISTATUS: "",
        // ARID:
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
        DISID: element.DISID
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
      PrescriptionItemStatusName: '',
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
  // FetchPrescriptionInfo() {
  //   var admId = this.selectedCard.AdmissionID;
  //   if (this.selectedCard.PatientType == '2')
  //     admId = this.selectedCard.IPID;
  //   this.config.FetchPrescriptionInfo(this.patientDetails.PatientType == '2' ? '2' : '1', this.selectedCard.EpisodeID, admId, this.selectedCard.PatientID, this.hospitalId, this.doctorDetails[0].EmpId)
  //     .subscribe((response: any) => {
  //       if (response.Code == 200) {
  //         this.savedDrugPrescriptions = response.objPatientPrescriptionDataList;
  //         this.savedMonitorId = response.objPatientPrescriptionList[0]?.MonitorID;
  //         this.savedDrugPrescriptionId = response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Medication').length > 0 ? response.objPatientPrescriptionList.filter((x: any) => x.PrescType == 'Medication')[0].PrescID : 0;

  //         if (this.savedDrugPrescriptions.length > 0) {
  //           this.savedDrugPrescriptions.forEach((element: any, index: any) => {
  //             this.selectedItemsList.push({
  //               SlNo: this.selectedItemsList.length + 1,
  //               Class: "row card_item_div mx-0 g-3 w-100 align-items-center",
  //               ClassSelected: false,
  //               ItemId: element.PrescribedItemID,
  //               ItemName: element.DRUGNAME,
  //               StrengthUoMID: element.QtyUomID,
  //               Strength: element.ActItemStrength + " " + element.QtyUom,
  //               StrengthUoM: element.QtyUom,
  //               Dosage: element.DOS + " " + element.DOSE, //response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
  //               DosageId: element.DOID,
  //               AdmRouteId: element.ARI,
  //               Route: element.AdmRoute,
  //               FrequencyId: element.FID,
  //               Frequency: element.Frequency,
  //               ScheduleStartDate: this.datepipe.transform(element.SFRM, "dd-MMM-yyyy")?.toString(),
  //               StartFrom: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
  //               DurationId: element.DUID,
  //               Duration: element.DUR,
  //               DurationValue: element.DUR.split(' '),
  //               PresInstr: "",//item.PresInstr,
  //               Quantity: element.FQTY,
  //               QuantityUOMId: element.QtyUomID,
  //               PresType: "",//item.PresType,
  //               PRNType: element.PRNREASON,//item.PRNType,
  //               GenericId: element.PrescribedGenericItemID,
  //               DefaultUOMID: element.QtyUomID,
  //               medInstructionId: "",//item.medInstructionId,
  //               PRNReason: "",//item.PRNReason,
  //               IssueUoM: element.FQTYUOM,
  //               IssueUOMID: element.IssuedQtyUOMName,
  //               IssueUOMValue: element.Qty,
  //               IssueTypeUOM: element.QtyUomID,
  //               Remarks: element.REM,
  //               IsFav: element.IsFav,
  //               DiseaseID: element.DiseaseID,
  //               ScheduleEndDate: element.EDT,
  //               ScheduleTime: element.STM,
  //               PrescriptionItemStatusNew: element.PrescriptionItemStatusNew,
  //               PrescriptionID: element.PrescriptionID,
  //               HoldStatus: element.HoldStatus,
  //               ReasonForHolding: element.ReasonForHolding,
  //               PrescriptionItemsHoldReasonID: element.PrescriptionItemsHoldReasonID,
  //               PrescriptionItemsHoldReason: element.ReasonForHolding,
  //               HoldDate: element.HoldDate
  //             });
  //           });
  //         }
  //       }
  //     })
  // }
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
  discontinuePrescriptionItem(med: any, rem: any) {
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
          $("#discontinueMedSaveMsg").modal('show');
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }
  maximizeSelectedDrugItems1(med: any) {
    let find = this.selectedItemsList.find((x: any) => x?.ItemId === med.ItemId);
    if (find) {
      const index = this.selectedItemsList.indexOf(find, 0);
      if (index > -1) {
        if (find.ClassSelected) {
          find.ClassSelected = false;
          find.Class = "row card_item_div mx-0 g-3 w-100 align-items-start";
        }
        else {
          find.Class = "row card_item_div mx-0 g-3 w-100 align-items-start maxim";
          find.ClassSelected = true;
        }
      }
    }
  }
  maximizeSelectedDrugItems(med: any) {
    const index = this.selectedItemsList.findIndex((x: any) => x?.ItemId === med.ItemId);
    if (index > -1) {
      this.selectedItemsList[index].ClassSelected = !this.selectedItemsList[index].ClassSelected;
      if (this.selectedItemsList[index].ClassSelected) {
        this.selectedItemsList[index].Class = "row card_item_div mx-0 g-3 w-100 align-items-start maxim";
        this.selectedItemsList[index].viewMore = true;
      } else {
        this.selectedItemsList[index].Class = "row card_item_div mx-0 g-3 w-100 align-items-start";
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
      this.FetchSavedDischargeReconciliation();
  }
  selectSubstituteItem(sub: any) {
    this.onItemSelected(sub);
    $("#modalSubstituteItems").modal('hide');
  }
  FetchSavedDischargeReconciliation() {
    this.config.fetchSavedDischargeReconciliation('2', this.selectedPatientAdmissionId, this.PatientId, false, 3, this.hospitalId, false)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (response.objPatientPrescriptionOrderDataList.length > 0) {
            this.lastSavedAdmReconDate = response.objPatientPrescriptionOrderDataList[0].StatusMsg
          }
          response.objPatientPrescriptionDataList.forEach((element: any, index: any) => {
            this.selectedItemsList.push({
              SlNo: this.selectedItemsList.length + 1,
              Class: "row card_item_div mx-0 g-3 w-100 align-items-center",
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
  onPatientNoPrevMed(event: any) {
    this.patientNoPrevMed = event.target.checked;
  }
  onDisReconStatusChange(event: any, med: any) {
    let findmed = this.selectedItemsList.find((x: any) => x?.ItemId === med.ItemId);
    if (findmed) {
      const index = this.selectedItemsList.indexOf(findmed, 0);
      if (index > -1) {
        findmed.medStatus = event.target.value;
        findmed.PrescriptionItemStatus = event.target.value;
        findmed.PrescriptionItemStatusName = event.target.options[event.target.options.selectedIndex].text;
      }
    }
  }
  onApplyToAllChange() {
    this.selectall = !this.selectall;
    if (this.selectall) {
      {
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
