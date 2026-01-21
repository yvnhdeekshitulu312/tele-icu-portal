import { Component, Injectable, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { BaseComponent } from 'src/app/shared/base.component';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import { Subject, Subscription, debounceTime } from 'rxjs';
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
  selector: 'app-quick-medication',
  templateUrl: './quick-medication.component.html',
  styleUrls: ['./quick-medication.component.scss'],
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
export class QuickMedicationComponent extends BaseComponent implements OnInit {
  @Input() homeMedicationEnable = true;
  @Input() ClinicVisitAfterDays: string = "";
  viewPreviousMedicationForm!: FormGroup;
  previousMedicationList: any = [];
  previousMedicationListDetails: any = [];
  filteredpreviousMedicationList: any = [];
  PatientVisitsList: any = [];
  selectedItemsList: any = [];
  duplicateItemsList: any;
  showMedicineHistorydiv = false;
  selectedHistoryItem: any;
  medicineHistory: any = [];
  selectedPrevMedItem: any;
  medicationsForm!: FormGroup;
  private searchInput$ = new Subject<string>();
  selectedMedDrugFreqScheduleTime: any;
  isPRN = false;
  drugFrequenciesList: any;
  medicationInstructions: any;
  AdmRoutesList: any;
  AdmRoutesListMaster: any;
  AdmRoutesListGridRow: any;
  durationList: any;
  frequenciesList: any;
  medicationReasonsList: any;
  listOfItems: any;
  GenericBrand: any = "0";
  GenericBrandtoggleValue: string = 'Brand';
  isMedicationFormSubmitted: boolean = false;
  isEditmode: boolean = false;
  remarksForSelectedMedName: any;
  itemSelected: string = "false";
  medicationSchedulesForm!: FormGroup;
  errorMessages: any;
  prescriptionValidationMsg: any;
  prescriptionValidationMsgEnddate: any;
  prescriptionSaveData: any = {};
  drugDetails: DrugDetails[] = [];
  clinicalVisitAfter = false;
  homeMedication = false;
  homeMedicationVal: any = "0";
  tempprescriptionSelected: any;
  substituteItems: any = [];
  showSubstituteSelectValidationMsg = false;
  savedDrugPrescriptions: any = [];
  anesthesiaType = "0";
  private subscription!: Subscription;
  private fetchmedsubscription!: Subscription;

  constructor(private fb: FormBuilder, private config: ConfigService, public datepipe: DatePipe) {
    super();
    this.viewPreviousMedicationForm = this.fb.group({
      fromdate: new Date(this.selectedView.AdmitDate),
      todate: new Date(),
      PrescriptionID: ['0']
    });
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
      Price: ['']
    });
    this.medicationSchedulesForm = this.fb.group({
      ItemId: [''],
      ScheduleTime: [''],
      Dose: ['']
    });

  }

  get medicationScheduleitems(): FormArray {
    return this.medicationSchedulesForm.get('items') as FormArray;
  }

  ngOnInit(): void {    
    this.medicationsForm.patchValue({
      ScheduleStartDate: new Date()
    });
    this.FetchMedicationDemographics();
    this.FetchDrugFrequencies();
    this.FetchMedicationInstructions();
    this.initializeSearchListener();
    this.medicationSchedulesForm = this.fb.group({
      items: this.fb.array([])
    });
    $("#ClinicVisitAfterDays").val(this.ClinicVisitAfterDays);
    this.subscription = this.config.triggerSavePrescription$.subscribe(atype => {
      if(atype != '0') {
        this.anesthesiaType = atype;
        this.saveAllPrescription();
      }
    });
    this.fetchmedsubscription = this.config.triggerSavePrescription$.subscribe(anesthesiaid => {
      if(anesthesiaid != '0') {
        this.fetchAnesthesiaMedications(anesthesiaid);
      }
    });    
  }

  FetchMedicationDemographics() {
    this.config.fetchMedicationDemographics("2,65,77,826", this.doctorDetails[0].EmpId, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.AdmRoutesListMaster = response.MedicationDemographicsAdministrationDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          this.AdmRoutesList = response.MedicationDemographicsAdministrationDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          this.durationList = response.MedicationDemographicsDurationDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          this.durationList.splice(2, 1); this.durationList.splice(3, 1);
          this.durationList.splice(3, 1);
          this.frequenciesList = response.MedicationDemographicsFrequencyDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
          this.medicationReasonsList = response.MedicationDemographicsMedicationReasonDataList.sort((a: any, b: any) => a.Names.localeCompare(b.Names));
        }
      },
        (err) => {

        })

  }

  FetchDrugFrequencies() {
    this.config.fetchDrugFrequencies(this.doctorDetails[0].EmpId, "0", this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.drugFrequenciesList = response.DrugFrequenciesDataList;//.sort((a: any, b: any) => a.Frequency.localeCompare(b.Frequency));
        }
      },
        (err) => {

        })
  }
  FetchMedicationInstructions() {
    this.config.fetchMedicationInstructions(this.doctorDetails[0].EmpId, "blocked=0", "0", this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.medicationInstructions = response.AdminMastersInstructionsDataList.sort((a: any, b: any) => a.name.localeCompare(b.name));
        }
      },
        (err) => {

        })
  }

  searchItem(event: any) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      const inputValue = event.target.value;
      this.searchInput$.next(inputValue);
    }
  }
  initializeSearchListener() {
    this.searchInput$
      .pipe(
        debounceTime(0)
      )
      .subscribe(filter => {
        if (filter.length >= 3) {
          this.config.fetchItemDetailsGB(filter, "0", this.hospitalID, this.doctorDetails[0].EmpId, this.GenericBrand)
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
  onItemSelected(item: any) {
    var itemId = item.ItemID;
    this.config.fetchItemForPrescriptions(this.selectedView.PatientType, itemId, "1", this.doctorDetails[0].EmpId, "0", this.hospitalID, this.doctorDetails[0].EmpId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.config.FetchPrescriptionValidations(this.selectedView.AdmissionID, itemId, response.ItemGenericsDataList[0].GenericID, response.ItemDataList[0].DisplayName, this.selectedView.PatientID, this.selectedView.AgeValue, this.doctorDetails[0].EmpId, this.doctorDetails[0].EmpSpecialisationId, this.hospitalID, this.selectedView.PatientType)
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
                  DefaultUOMID: this.selectedView.PatientType === '2' ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
                  IssueTypeUOM: itempacking[0].FromUoMID,
                  QuantityUOMId: response.DefaultUOMDataaList[0].IssueUOMID,
                  QuantityUOM: response.DefaultUOMDataaList[0].IssueUOM,
                  GenericId: response.ItemGenericsDataList[0].GenericID,
                  DurationId: "3",
                  Duration: "Days",
                  AdmRouteId: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteID : "",
                  AdmRoute: this.AdmRoutesList.length == 1 ? this.AdmRoutesList[0].RouteName : "",
                  IsFav: response.ItemDataList[0].IsFav,
                  QOH: this.selectedView.PatientType == "2" ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
                  IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
                  BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '' ? response.ItemDataList[0].Basesolution : '',
                  IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '' ? response.ItemDataList[0].IVFluidExpiry : '',
                  Remarks: '',
                  Price: response.ItemPriceDataList[0].MRP
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
    var PrescStartDate = this.datepipe.transform(this.medicationsForm.value['ScheduleStartDate'], "dd-MMM-yyyy")?.toString();
    var PatientType = this.selectedView.PatientType;
    //Patient Type need to be changed when implementing Inpatient Prescriptions
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.ward.FacilityID, FreqVal, 1, DosageUnit, DurationUnit, DurationVal, 1, 0, ItemId, DefaultUOMID, PrescStartDate, this.selectedView.PatientType == "3" ? "1" : this.selectedView.PatientType, 0, this.hospitalID)
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
            Class: "row card_item_div mx-0 g-3 w-100 align-items-start",
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
          find.CustomizedDosage = this.medicationsForm.get('CustomizedDosage')?.value,
          find.QOH = this.medicationsForm.get('QOH')?.value,
          find.IssueUOMValue = this.medicationsForm.get('IssueUOMValue')?.value,
          find.Price = this.medicationsForm.get('Price')?.value

        this.selectedItemsList[index] = find;
        //this.selectedItemsList.splice(index, 1);
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

  maximizeSelectedDrugItems(med: any) {
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
    var text = document.getElementById("viewMore_toggle_a");
    if (text?.innerHTML === "View More") {
      $('#viewMore_toggle_a').html('View Less')
    }
    else {
      $('#viewMore_toggle_a').html('View More')
    }
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
      IVFluidExpiry: med.IVFluidExpiry
    })
    this.selectedMedDrugFreqScheduleTime = this.drugFrequenciesList.find((x: any) => x.FrequencyID == med.FrequencyId);

    $('#StrengthUoM').html(med.StrengthUoM);
    $('#IssueUoM').html(med.Dosage.split(' ')[1]);
    $('#QuantityUOM').html(med.IssueUoM);
    $('#Dosage').html(med.Dosage.split(' ')[1]);
  }

  onFrequencyRowChange(event: any, med: any) {
    med.FrequencyId = event.target.value;
    med.Frequency = event.target.options[event.target.options.selectedIndex].text;
    var PrescStartDate = this.datepipe.transform(med.ScheduleStartDate, "dd-MMM-yyyy")?.toString();
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.ward.FacilityID, med.FrequencyId, 1, med.IssueUOMValue, med.DurationValue, med.DurationId, 1, 0, med.ItemId, med.DefaultUOMID, PrescStartDate, this.selectedView.PatientType == "3" ? "1" : this.selectedView.PatientType, 0, this.hospitalID)
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

  onRouteRowChange(event: any, med: any) {
    med.AdmRouteId = event.target.value;
    med.Route = event.target.options[event.target.options.selectedIndex].text;
    med.displayRouteDropdown = false;
  }

  onDateRowChange(event: any, med: any) {
    med.ScheduleStartDate = this.datepipe.transform(new Date(event.target.value), "dd-MMM-yyyy")?.toString();
    var PrescStartDate = this.datepipe.transform(med.ScheduleStartDate, "dd-MMM-yyyy")?.toString();
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.ward.FacilityID, med.FrequencyId, 1, med.IssueUOMValue, med.DurationValue, med.DurationId, 1, 0, med.ItemId, med.DefaultUOMID, PrescStartDate, this.selectedView.PatientType == "3" ? "1" : this.selectedView.PatientType, 0, this.hospitalID)
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

  onDurationTextRowChange(event: any, med: any) {
    med.DurationValue = event.target.value;
    const Name = this.durationList.find((x: any) => x.Id == med.DurationId).Names;
    med.Duration = event.target.value + ' ' + Name;
    var PrescStartDate = this.datepipe.transform(med.ScheduleStartDate, "dd-MMM-yyyy")?.toString();
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.ward.FacilityID, med.FrequencyId, 1, med.IssueUOMValue, med.DurationValue, med.DurationId, 1, 0, med.ItemId, med.DefaultUOMID, PrescStartDate, this.selectedView.PatientType == "3" ? "1" : this.selectedView.PatientType, 0, this.hospitalID)
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
    var PrescStartDate = this.datepipe.transform(med.ScheduleStartDate, "dd-MMM-yyyy")?.toString();
    this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.ward.FacilityID, med.FrequencyId, 1, med.IssueUOMValue, med.DurationValue, med.DurationId, 1, 0, med.ItemId, med.DefaultUOMID, PrescStartDate, this.selectedView.PatientType == "3" ? "1" : this.selectedView.PatientType, 0, this.hospitalID)
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
  toggleDuraion(med: any) {
    med.displayDuration = true;
  }
  toggledisplayStartDateDropdown(med: any) {
    med.displayStartDateDropdown = true;
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
    //$("#divTapering").modal('hide');
    $("#divTapering").removeClass('d-none');
  }
  clearTapering() {
    this.medicationScheduleitems.clear();
    var drugSchedule = this.selectedMedDrugFreqScheduleTime.ScheduleTime;
    var schedule: any[] = [];
    for (let i = 0; i < drugSchedule.split('-').length; i++) {
      //schedule.push({"Schedule" : drugSchedule.split('-')[i]});
      const itemFormGroup = this.fb.group({
        Dose: drugSchedule.split('-')[i],
        ScheduleTime: ''
      })
      this.medicationScheduleitems.push(itemFormGroup);
    }
  }

  toggleDropdown(med: any) {
    med.displayDropdown = true;
  }
  toggleRouteDropdown(med: any) {
    this.config.fetchItemForPrescriptions(this.selectedView.PatientType, med.ItemId, "1", this.doctorDetails[0].EmpId, "0", this.hospitalID, this.doctorDetails[0].EmpId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.AdmRoutesListGridRow = response.ItemRouteDataList;
          med.displayRouteDropdown = true;
        }
      },
        (err) => {
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

  medicationRemarksPopup(med: any, invRem: any) {
    this.remarksForSelectedMedName = med;
    $("#medRem").val('');
  }

  saveMedicationRemarks(invRem: any) {
    this.medicationsForm.patchValue({
      Remarks: invRem
    })
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
      Remarks: ['']
    });
    $('#QuantityUOM').html('');
    $('#Dosage').html('');
    this.isMedicationFormSubmitted = false;
  }

  ClearPrescriptionItems() {
    //this.medicationsForm.reset();
    this.ClearMedicationForm();
    this.itemSelected = "false";
    this.AdmRoutesList = this.AdmRoutesListMaster;
  }

  DeletePrescriptionItem(index: any, medi: any) {
    this.selectedItemsList.splice(index, 1);
    //this.LexicomAlert();
  }

  saveAllPrescription() {
    this.prescriptionSaveData = {};
    if (this.selectedItemsList.length > 0) {
      var validate = this.ValidateDrugDetails();
      if (validate.toString().split("^")[0] != "false") {
        this.FormDrugDetails();
        let postData = {
          "DrugPrescriptionID": 0,
          "TestPrescriptionID": 0,
          "ProcPrescriptionID": 0,
          "MonitorID": 0,
          "Prescriptiondate": this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
          "PatientID": this.selectedView.PatientID,
          "DoctorID": this.doctorDetails[0].EmpId,
          "IPID": parseInt(this.selectedView.AdmissionID),
          "BedID": this.selectedView.PatientType == '2' ? this.selectedView.BedID : 0,//0,
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
          "Pdetails": "",
          "Idetails": "",
          "UserID": this.doctorDetails[0].UserId,
          "WorkStationID": this.ward.FacilityID, //this.patientType == '2' ? this.facility.FacilityID : 0,
          "OneTimeIssue": 1,
          "STATUS": 1,
          "ScheduleID": 0,
          "IsDisPrescription": this.homeMedicationEnable ? 1 : 0,
          "RaiseDrugOrder": this.selectedView.PatientType == '2' ? 1 : 0,//0,
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
          "AntiMicrobialOrderSheet": "",
          "InvestigationSchedules": "",
          "Hospitalid": this.hospitalID,
          "LexcomIntractions": "",
          "IsContrastAllergic": 0,
          "IVFDetails": "",
          "PBMJustification": "",
          "CTASScore": "0",
          "OrderPackID": "0",
          "AnaesthesiaTypes": this.anesthesiaType
        };

        this.config.saveAllPrescription(postData).subscribe(
          (response) => {
            if (response.Code == 200) {
              this.UpdatePatientFitForDischarge();
              this.selectedItemsList = [];
              $("#savePrescriptionMsg").modal('show');
            } else {
            }
          },
          (err) => {
            console.log(err)
          });
      }
      else {
        validate.toString().split("^")[1] == "NoProcQty" ? $("#validateProceduresMsg").modal('show') : $("#validatePrescriptionMsg").modal('show');
      }
    }
    else {
      //$("#noPrescriptionSelected").modal('show');
    }
  }

  UpdatePatientFitForDischarge() {
    var pyld = {
      "AdmissionID": this.selectedView.AdmissionID,
      "IsFitForDischarge": true,
      "ClinicVisitAfterDays": $("#ClinicVisitAfterDays").val(),
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID,
      "Hospitalid": this.hospitalID
    }
    this.config.UpdatePatientFitForDischarge(pyld).subscribe(
      (response) => {
        if (response.Code == 200) {
        } 
      },
      (err) => {
        console.log(err)
      });

  }

  ValidateDrugDetails() {
    var validateDrugDet = this.selectedItemsList.filter((s: any) => s.Duration == "" || s.AdmRouteId == "" || s.DurationId == "" || s.DurationValue == ""
      || s.FrequencyId == "" || s.Route == "");

    if (validateDrugDet.length > 0) {
      return "false" + "^" + "NotValidDrug";
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
        ITNAME: element.ItemName,
        DOS: element.Dosage.split(" ")[0],
        DOID: element.DosageId,
        FID: element.FrequencyId,
        DUR: element.Duration.split(" ")[0],
        DUID: element.DurationId,
        SFRM: this.datepipe.transform(element.ScheduleStartDate, "dd-MMM-yyyy hh:mm a")?.toString(),
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

      });
    });
  }

  clinicalVisitAfterClick() {
    this.clinicalVisitAfter = !this.clinicalVisitAfter;
  }

  toggleHomeMedication(type: string) {
    this.homeMedication = type === '1' ? true : false;
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
      QOH: this.selectedView.PatientType == "2" ? this.tempprescriptionSelected.ItemDefaultUOMDataList[0].IPQOH : this.tempprescriptionSelected.ItemDefaultUOMDataList[0].OPQOH,
      IVFluidStorageCondition: this.tempprescriptionSelected.ItemDataList[0].IVFluidStorageCondition,
      Remarks: ''
    })
    $('#StrengthUoM').html(this.tempprescriptionSelected.ItemDataList[0].StrengthUoM);
    $('#IssueUoM').html(this.tempprescriptionSelected.ItemDataList[0].QTYUOM);
    this.listOfItems = []; this.tempprescriptionSelected = []; this.prescriptionValidationMsgEnddate = "";
  }

  fetchSubstituteItems(itemid: any) {
    this.config.FetchSubstituteItems(itemid, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.substituteItems = response.FetchSubstituteItemsDataaList;
          $("#modalSubstituteItems").modal('show');

        }
      })
  }
  loadSubstituteItem() {
    const selectedSubsItem = this.substituteItems.find((x: any) => x.selected);
    this.onItemSelected(selectedSubsItem);
    $("#modalSubstituteItems").modal('hide');
  }

  selectSubstituteItem(sub: any) {
    this.substituteItems.forEach((element: any, index: any) => {
      if (element.ItemID === sub.ItemID) {
        element.selected = true;
      }
      else {
        element.selected = false;
      }
    });
    this.showSubstituteSelectValidationMsg = false;
  }

    fetchAnesthesiaMedications(tempid: any) {
      this.config.FetchPrescriptionInfoAnesthesia(this.selectedView.PatientType, this.selectedView.EpisodeID, this.selectedView.AdmissionID, this.selectedView.PatientID, 
        this.hospitalID, this.doctorDetails[0].EmpId, false, tempid)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.savedDrugPrescriptions = response.objPatientPrescriptionDataList;
            this.savedDrugPrescriptions.forEach((element: any, index: any) => {
              this.selectedItemsList.push({
                SlNo: this.selectedItemsList.length + 1,
                Class: "row card_item_div mx-0 g-3 w-100 align-items-start",
                ClassSelected: false,
                ItemId: element.PrescribedItemID,
                ItemName: element.DRUGNAME,
                StrengthUoMID: element.QtyUomID,
                Strength: element.ActItemStrength + " " + element.QtyUom,
                StrengthUoM: element.QtyUom,
                Dosage: element.DOS + " " + element.DOSE, //response.ItemDataList[0].Quantity + " " + response.ItemDataList[0].QTYUOM,
                DosageId: element.DOID,
                AdmRouteId: element.ARI,
                Route: element.AdmRoute,
                FrequencyId: element.FID,
                Frequency: element.Frequency,
                ScheduleStartDate: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                StartFrom: this.datepipe.transform(new Date(), "dd-MMM-yyyy")?.toString(),
                DurationId: element.DUID,
                Duration: element.DUR,
                DurationValue: element.DUR.split(' '),
                PresInstr: element.PatientInstructions == 'select' ? "" : element.PatientInstructions,//item.PresInstr,
                Quantity: element.FQTY,
                QuantityUOMId: element.QtyUomID,
                PresType: "",//item.PresType,
                PRNType: element.PRNREASON,//item.PRNType,
                GenericId: element.PrescribedGenericItemID,
                //DefaultUOMID: element.QtyUomID,
                DefaultUOMID: element.IssuedQtyUOMName,
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
                lexicomAlertIcon: '',
                CustomizedDosage: element.CD != '' ? this.setTapringDosage(element.CD) : '',
                QOH: ''
              });
              const med = this.selectedItemsList.find((x: any) => x.ItemId === element.PrescribedItemID)
              if (med.Remarks != '') {
                this.maximizeSelectedDrugItems(med);
              }
            }); 
          }
        },
          (err) => {
          })
  }
  private setTapringDosage(cd: any) {
    var cd = JSON.parse(cd);
    var doses =
    {
      "NoOfDays": cd.NoOfDays,
      "IsSliding": cd.IsSliding,
      "SDays": cd.SDays,
      "ObjTaperData": [
        {
          "DrugID": parseInt(cd.ObjTaperData[0].DrugID),
          "DrugName": cd.ObjTaperData[0].DrugName,
          "Day": cd.ObjTaperData[0].Day,
          "Checked": cd.ObjTaperData[0].Checked,
          "Strength": cd.ObjTaperData[0].Strength,
          "StrengthUOM": cd.ObjTaperData[0].StrengthUOM,
          "Dose": cd.ObjTaperData[0].Dose,
          "DoseUOM": cd.ObjTaperData[0].DoseUOM,
          "Frequency": cd.ObjTaperData[0].Frequency,
          "FrequencyID": parseInt(cd.ObjTaperData[0].FrequencyID),
          "CustomizedSchedule": cd.ObjTaperData[0].CustomizedSchedule,
          "CustomizedQty": cd.ObjTaperData[0].CustomizedQty,
          "CustomizedDays": cd.ObjTaperData[0].CustomizedDays,
          "StartFrom": cd.ObjTaperData[0].StartFrom,
          "TotalQty": cd.ObjTaperData[0].TotalQty,
          "CustomizedRemarks": cd.ObjTaperData[0].CustomizedRemarks,
          "TotalCustQty": cd.ObjTaperData[0].TotalCustQty,
          "ListSatrtDate": [],
          "FrequencyQty": cd.ObjTaperData[0].FrequencyQty,
          "SCIT": cd.ObjTaperData[0].SCIT
        }
      ],
      "IsDosEdit": cd.IsDosEdit,
      "InterVal": cd.InterVal
    }
    return JSON.stringify(doses);
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
  REQQTY?: number;
  REQUID?: number;
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
  PrescriptionItemStatusNew?: string = "0";
}
