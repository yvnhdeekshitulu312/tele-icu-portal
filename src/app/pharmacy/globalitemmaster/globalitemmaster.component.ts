import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { GlobalItemMasterService } from './globalitemmaster.service';
import { BaseComponent } from 'src/app/shared/base.component';
import { globalDetails } from './urls';
import { UtilityService } from 'src/app/shared/utility.service';
import { Type } from './enum';
import { Observable } from 'rxjs';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
declare var $: any;
@Component({
  selector: 'app-globalitemmaster',
  templateUrl: './globalitemmaster.component.html',
  styleUrls: ['./globalitemmaster.component.scss']
})
export class GlobalitemmasterComponent extends BaseComponent implements OnInit {
  url: any;
  data$!: Observable<any[]>;
  ItemGroup: any;
  PharmacologyCategory: any;
  Strength: any;
  Units: any;
  selectedClinicalTab: string = 'Medical';
  scheduled: string = 'Non-Scheduled';
  productionType: string = 'Generic';
  ChildUOMS: any = [];
  rows: any[] = [];
  listOfCategory: any = [];
  listOfBrandName: any = [];
  listOfScientific: any = [];
  tableForm: any;
  ItemID = "0";
  itemForm: any;
  form: FormGroup;
  divLabels: any = [];
  form1: FormGroup;
  divLabels1: any = [];
  facilityId: any;
  listOfItems: any = [];
  FetchGlobalItemInfoList: any = [];
  FetchGlobalItemPackageInfoList: any = [];
  FetchItemPackageInfoList: any = [];
  labels: any = [];
  listOfDoctors: any = [];
  doctorList: any = [];
  listOfSpecialisation: any = [];
  specialisationList: any = [];
  listOfFrequency: any = [];
  frequencyList: any = [];
  listOfRoutes: any = [];
  routesList: any = [];
  mapList: any = [];
  listOfMappings: any = [];
  mappingList: any = [];
  listOfIndications: any = [];
  indicationMappingList: any = [];
  listOfGeneric: any = [];
  genericList: any = [];
  errorMessages: any = [];
  IsEdit = false;
  BaseSolutionData: any;
  StorageTypeData: any;
  IVExpiryDate: any;
  holdingStoreList: any = [];
  listOfStores: any = [];
  errorMsg: string = '';

  filterTypeList = [
    { label: 'Starts With', id: 1 },
    { label: 'Contains', id: 2 },
    { label: 'Ends With', id: 3 },
    { label: 'Equals', id: 4 }
  ];

  fetchedItemsList: any = [];
  itemCodeSearchText: any;
  itemNameSearchText: any;
  itemCodeFilterType: any = 1;
  itemNameFilterType: any = 1;
  totalItemsCount: any = 0;
  currentPage: number = 0;

  constructor(private globalService: GlobalItemMasterService, private us: UtilityService, private formbuilder: FormBuilder) {
    super()
    this.facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
    this.globalService.param = {
      ...this.globalService.param,
      UserID: this.doctorDetails[0]?.UserId ?? this.globalService.param.UserID,
      HospitalID: this.hospitalID ?? this.globalService.param.HospitalID,
      WorkStationID: this.facilitySessionId ?? this.globalService.param.WorkStationID
    };

    this.intializeItemForm();

    this.tableForm = this.formbuilder.group({
      Units: ['0'],
      Contains: [''],
      Mapping: this.formbuilder.array([
        this.createItemFormGroupMapping()
      ]),
      MappingValue: '0'
    });

    this.form = this.formbuilder.group({
      divs: this.formbuilder.array([])
    });

    this.divLabels = [
      'Non Expiry Item',
      'Non Batched Item',
      'Is Consignment Item',
      'Laundry',
      'Sterilization Item',
      'One Time Issue',
      'Can be Asset Item',
      'Narcotic',
      'Can be Prescribed',
      'Prepared',
      'Antibiotic',
      'Controlled Drug',
      'High Alert',
      'IVFluid',
      // 'IVFluid Base Solution',
      'High Value Drug',
      'LASA',
      'Cytotoxic',
      'Refrigerated',
      'IVFluid Additive',
      'AntiCoagulant(Warfarin)',
      'Is Insulin',
      'Conc. Electrolytes',
      'Is Inotrope IV Infusion',
      'Is Narcotic IV Infusion',
      'Is Concentration Iv Infusion',
      'Cash Only',
      'Max one Qty Per Visit',
      'OTC',
      'Prescription Required',
    ];

    this.divLabels.forEach(() => {
      const control = this.formbuilder.control(false);
      (this.form.get('divs') as FormArray).push(control);
    });

    this.form1 = this.formbuilder.group({
      divs: this.formbuilder.array([])
    });

    this.divLabels1 = [
      'Always', 'Better', 'Control', 'Vital', 'Essential', 'Control', 'Fast', 'Slow', 'Non Moving'
    ];

    this.divLabels1.forEach(() => {
      const control = this.formbuilder.control(false);
      (this.form1.get('divs') as FormArray).push(control);
    });

    this.labels = [
      "CanHaveExpiry",
      "CanHaveBatch",
      "IsConsignment",
      "IsLaundry",
      "IsCSSD",
      "IsOnetime",
      "CanBeAsset",
      "IsNarcotic",
      "CanBePrescribed",
      "Prepared",
      "IsAntibiotic",
      "IsControledDrug",
      "IsHighRisk",
      "IsIVFluid",
      "IsHighValueDrug",
      "IsLASA",
      "IsCytotoxic",
      "IsRefrigerated",
      "IsIVFluidAdditive",
      "IsAnticoagulant",
      "IsInsulin",
      "IsElectrolyte",
      "IsInotropeIVInfusion",
      "IsNarcoticIVInfusion",
      "IsConcentrationIvInfusion",
      'IsCashonly',
      'IsMaxOneQtyPerVisit',
      'IsOTC',
      'IsPrescriptionRequired',
    ];
  }

  createItemFormGroupUnits() {
    return this.formbuilder.group({
      Units: this.formbuilder.array([])
    });
  }

  createItemFormGroupMapping() {
    return this.formbuilder.group({
      Mapping: this.formbuilder.array([])
    });
  }

  intializeItemForm() {

    this.itemForm = this.formbuilder.group({
      DisplayName: [''],
      ItemCode: [''],
      BrandName: [''],
      BrandID: ['0'],
      Manufacturer: [''],
      IsConsignment: [''],
      StrengthUoMID: ['0'],
      CanHaveBatch: [''],
      CanHaveExpiry: [''],
      MedicalType: this.selectedClinicalTab,
      CategoryID: [''],
      CategoryName: [''],
      Strength: [''],
      IsReuseable: [false],
      IsPatientSpecific: [false],
      CanBeAsset: [''],
      IsNarcotic: [''],
      DoseFormId: [''],
      PackName: [''],
      PackName2L: [''],
      DisplayName2L: [''],
      CatalogNumber: [''],
      ItemNotes: [''],
      PatientInstructions: [''],
      IsOnetime: [''],
      ProductionType: [''],
      PharmacalogyID: ['0'],
      prepared: [''],
      IssueUOMID: ['0'],
      IssueUOMValue: [''],
      ItemNotes2L: [''],
      PatientInstructions2L: [''],
      Size: [''],
      Weight: [''],
      Color: [''],
      IsCSSD: [''],
      IsLaundry: [''],
      BLOCKED: false,
      IsAntibiotic: [''],
      IsControledDrug: [''],
      BlockedRemarks: [''],
      OPDefaultUomID: ['0'],
      IPDefaultUomID: ['0'],
      CashReturnsNotAllowed: [''],
      isDailyCheck: [''],
      FrequencyUomID: [''],
      IsHighRisk: [''],
      IncludeMarkup: [false],
      ItemShortName: [''],
      IsGlobal: [''],
      QtyUomID: [''],
      Quantity: [''],
      isIVFluid: [''],
      MSDStockNumber: [''],
      IsHighValueDrug: [''],
      MaxAllowedDays: [''],
      IsGenericItem: [''],
      GenericItemId: [''],
      Scientific: [''],
      GTIN: [''],
      ImagePath: [''],
      IsLASA: [''],
      IsCytotoxic: [''],
      IsRefrigerated: [''],
      IsIVFluidAdditive: [''],
      IsAnticoagulant: [''],
      IsInsulin: [''],
      IsElectrolyte: [''],
      IsInotropeIVInfusion: [''],
      IsNarcoticIVInfusion: [''],
      IsConcentrationIvInfusion: [''],
      GroupType: ['0'],
      BaseSolutionID: ['0'],
      StorageTypeID: ['0'],
      IVExpiryID: ['0'],
      MaximumLevel: [''],
      MinLevel: [''],
      ReorderQty: [''],
      ReorderLevel: [''],
      MRPMargin: [''],
      SalesTax: [''],
      IsApplyResidents: [false],
      ItemRemarks: [''],
      SFDADrug: [false],
      ItemSerialNo: [''],
      PrescribedQty: ['']
    });
  }

  get divControls() {
    return (this.form.get('divs') as FormArray).controls;
  }

  get divControls1() {
    return (this.form1.get('divs') as FormArray).controls;
  }

  ngOnInit(): void {
    const apiList = [
      this.globalService.getData(globalDetails.fetchGlobalMaster, { Type: Type.ItemGroup }),
      this.globalService.getData(globalDetails.fetchGlobalMaster, { Type: Type.PharmacologyCategory }),
      this.globalService.getData(globalDetails.fetchGlobalMaster, { Type: Type.Strength }),
      this.globalService.getData(globalDetails.fetchUnits, {}),
      this.globalService.getData(globalDetails.FetchIVfluidBaseSolution, {}),
      this.globalService.getData(globalDetails.FetchStoreType, {})
    ];
    this.getDataFromMultipleAPIs(apiList);
    this.fetchStores();

    this.tableForm = this.formbuilder.group({
      items: this.formbuilder.array([])
    });
  }

  get items(): FormArray {
    return this.tableForm.get('items') as FormArray;
  }

  getDataFromMultipleAPIs(apiList: string[]): void {
    this.data$ = this.us.getMultipleData(apiList);
    this.data$.subscribe(
      data => {
        this.ItemGroup = data[0].GlobalItemMastersDataList;
        this.PharmacologyCategory = data[1].GlobalItemMastersDataList;
        this.Strength = data[2].GlobalItemMastersDataList;
        this.Units = data[3].FetchUnitsDataList;
        this.BaseSolutionData = data[4].FetchIVfluidBaseSolutionDataList;
        this.StorageTypeData = data[5].FetchStoreTypeDataList;
        this.IVExpiryDate = data[5].FetchExpiryDataList;
        this.addRow();
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }

  selectTab(tab: string) {

    this.itemForm.patchValue({
      DisplayName: ''
    });
    this.listOfItems = [];
    this.selectedClinicalTab = tab;
    this.itemForm.patchValue({
      MedicalType: tab
    });
  }

  selectScheduled(scheduleType: string) {
    this.scheduled = scheduleType;
  }

  selectProductionType(type: string) {
    this.productionType = type;
  }

  FetchChildUOMS(parentUoMId: any, item: any) {
    var parentUoMIdval = parentUoMId.target.value;
    this.GetChildUOMS(parentUoMIdval, item);
  }
  GetChildUOMS(parentUoMIdval: any, item: any) {
    this.url = this.globalService.getData(globalDetails.fetchChildUOMS, { ParentUoMId: parentUoMIdval });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.ChildUOMS = response.FetchUnitsDataList;
          item.get('Mapping').value = this.ChildUOMS;
        }
      },
        (err) => {
        })
  }
  addRow() {
    const itemFormGroup: any = this.formbuilder.group({
      Units: '0',
      Contains: '',
      Mapping: this.formbuilder.array([]),
      MappingValue: '0'
    })

    const previousItemIndex = this.items.length - 1;

    var previousMappingValue: any = 0
    if (previousItemIndex >= 0) {
      const previousItem = this.items.at(previousItemIndex);
      previousMappingValue = previousItem.get('MappingValue')?.value;
      const unitsControl = itemFormGroup.get('Units') as FormArray;
      unitsControl.patchValue(previousMappingValue);
    }

    this.items.push(itemFormGroup);
    const lastIndex = this.items.length - 1;
    this.GetChildUOMS(previousMappingValue, this.items.at(lastIndex))
  }

  searchCategory(event: any) {
    var filter = event.target.value;
    if (filter.length >= 3) {
      this.url = this.globalService.getData(globalDetails.fetchItemcategory, { Filter: filter });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfCategory = response.FetchItemcategoryDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfCategory = [];
    }
  }

  searchBrandName(event: any) {
    var filter = event.target.value;
    if (filter.length >= 3) {
      this.url = this.globalService.getData(globalDetails.fetchItemBrandName, { DisplayName: filter });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfBrandName = response.FetchGItemBrandDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfBrandName = [];
    }
  }
  onViewItemBrandSelected(Brand: any) {
    this.listOfBrandName = [];
    this.itemForm.patchValue({
      BrandID: Brand.BrandID
    });
  }


  onViewItemSelected(cat: any) {
    this.listOfCategory = [];
    this.itemForm.patchValue({
      CategoryID: cat.CategoryID
    });
  }

  searchScientific(event: any) {
    var filter = event.target.value;
    if (filter.length >= 3) {
      this.url = this.globalService.getData(globalDetails.fetchItemScientificName, { Filter: filter });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfScientific = response.FetchItemScientificNameDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfScientific = [];
    }
  }

  onViewItemScientificSelected(cat: any) {
    this.listOfScientific = [];
    this.itemForm.patchValue({
      GenericItemId: cat.ItemID
    });
  }

  toggleBlocked() {
    this.itemForm.get('BLOCKED').setValue(!this.itemForm.get('BLOCKED').value);
  }

  togglePatientSpecific() {
    this.itemForm.get('IsPatientSpecific').setValue(!this.itemForm.get('IsPatientSpecific').value);
  }
  toggleApplyResidents() {
    this.itemForm.get('IsApplyResidents').setValue(!this.itemForm.get('IsApplyResidents').value);
  }

  toggleReuseable() {
    this.itemForm.get('IsReuseable').setValue(!this.itemForm.get('IsReuseable').value);
  }

  toggleActive(index: number) {
    const divs = this.form.get('divs') as FormArray;
    divs.at(index).setValue(!divs.at(index).value);
  }

  toggleActive1(index: number) {
    const divs = this.form1.get('divs') as FormArray;
    divs.at(index).setValue(!divs.at(index).value);
  }

  toggleMarkup() {
    this.itemForm.get('IncludeMarkup').setValue(!this.itemForm.get('IncludeMarkup').value);
  }

  toggleSDFADrug() {
    this.itemForm.get('SFDADrug').setValue(!this.itemForm.get('SFDADrug').value);
  }

  save() {
    const requiredFields: any = {
      'DisplayName': 'Item Name',
      'ItemCode': 'Item Code',
      'GTIN': 'GTNO',
      'CategoryID': 'Category',
      'StrengthUoMID': ' Strength',
      'Strength': 'Strength value',
      'IssueUOMID': 'Issue UOM',
      'Quantity': 'Quantity',
      'PackName': 'Pack Name'
    };
    let hasErrors = false;
    this.errorMessages = [];

    for (const field in requiredFields) {
      const value = this.itemForm.get(field)?.value;
      if (!value || value.trim() === '') {
        hasErrors = true;
        this.errorMessages.push(`${requiredFields[field]}`);
      }
    }

    if (hasErrors) {
      $("#errorMessageModal").modal('show');
      return;
    }

    const divs = this.form.value.divs;

    var medicaltype = 0;

    if (this.itemForm.get('MedicalType').value === 'Medical')
      medicaltype = 0;
    else if (this.itemForm.get('MedicalType').value === 'Non-Medical' && !divs[8])
      medicaltype = 1;
    else if (this.itemForm.get('MedicalType').value === 'Non-Medical' && divs[8])
      medicaltype = 2;

    var IsNarocotic = 0;

    if (this.scheduled === 'Non-Scheduled' && !divs[7])
      IsNarocotic = 0;
    else if (this.scheduled === 'Scheduled' && !divs[7])
      IsNarocotic = 1;
    else if (this.scheduled === 'Non-Scheduled' && divs[7])
      IsNarocotic = 0;
    else if (this.scheduled === 'Scheduled' && divs[7])
      IsNarocotic = 1;

    var ProductionType = 0;

    if (this.productionType === 'Generic')
      ProductionType = 1;

    var IsAntibiotic = 0;

    if (this.scheduled === 'Non-Scheduled' && !divs[10])
      IsAntibiotic = 0;
    else if (this.scheduled === 'Scheduled' && !divs[10])
      IsAntibiotic = 1;
    else if (this.scheduled === 'Non-Scheduled' && divs[10])
      IsAntibiotic = 0;
    else if (this.scheduled === 'Scheduled' && divs[10])
      IsAntibiotic = 1;

    var IsControledDrug = 0;

    if (this.scheduled === 'Non-Scheduled' && !divs[11])
      IsControledDrug = 0;
    else if (this.scheduled === 'Scheduled' && !divs[11])
      IsControledDrug = 1;
    else if (this.scheduled === 'Non-Scheduled' && divs[11])
      IsControledDrug = 2;
    else if (this.scheduled === 'Scheduled' && divs[11])
      IsControledDrug = 3;

    var PackUoMXMLDetails: any = [];
    var ItemXMLDetails: any = [];
    var HospitalsXMLDetails: any = [];
    let intfactor = 1;
    let decDIF = 1;
    let introwcount = this.tableForm.value.items.length;
    let intLFCrowcount = this.tableForm.value.items.length;
    let intCnt = 1;
    let intLFCrow;
    var index = 0;

    for (const dv1 of this.tableForm.value.items) {
      for (let i = introwcount - 1; i >= 0; i--) {
        intLFCrow = intLFCrowcount - (i + 1);
        intfactor *= parseInt(this.tableForm.value.items[intLFCrow].Contains ? this.tableForm.value.items[intLFCrow].Contains : 1, 10);
      }

      if (introwcount === this.tableForm.value.items.length) {
        decDIF = 1;
      } else {
        const count = this.tableForm.value.items.length - (introwcount + 1);
        decDIF *= 1 / parseInt(this.tableForm.value.items[count].Contains, 10);
      }

      index = index + 1;

      PackUoMXMLDetails.push({
        "SEQ": index,
        "FRMUOM": dv1.Units,
        "OPER": "/",
        "FACT": dv1.Contains ? dv1.Contains : 1,
        "TOUOM": dv1.MappingValue === "0" ? "" : dv1.MappingValue,
        "LFC": intfactor,
        "DIF": decDIF
      })

      ItemXMLDetails.push({
        "MAQTY": this.itemForm.get('MaximumLevel').value == "" ? 0 : this.itemForm.get('MaximumLevel').value,
        "MIQTY": this.itemForm.get('MinLevel').value == "" ? 0 : this.itemForm.get('MinLevel').value,
        "ROQ": this.itemForm.get('ReorderQty').value == "" ? 0 : this.itemForm.get('ReorderQty').value,
        "ROL": this.itemForm.get('ReorderLevel').value == "" ? 0 : this.itemForm.get('ReorderLevel').value,
        "MRPM": this.itemForm.get('MRPMargin').value == "" ? 0 : this.itemForm.get('MRPMargin').value,
        "STX": this.itemForm.get('SalesTax').value == "" ? 0 : this.itemForm.get('SalesTax').value,
        "ART": this.itemForm.get('IsApplyResidents').value ? 1 : 0,
        "RMK": this.itemForm.get('ItemRemarks').value,
        "QUID": this.itemForm.get('IssueUOMID').value,
        "QTY": 1,
        "STS": 0,
        "HRID": 0
      })
      HospitalsXMLDetails.push({
        "HID": 3
      })




      intCnt++;
      intfactor = 1;
      introwcount--;
    }

    var payload = {
      "ItemID": this.ItemID,
      "DisplayName": this.itemForm.get('DisplayName').value,
      "ItemCode": this.itemForm.get('ItemCode').value,
      "BrandID": this.itemForm.get('BrandID').value == "" ? 0 : this.itemForm.get('BrandID').value,
      "IsConsignment": divs[2] ? 1 : 0,
      "StrengthUoMID": this.itemForm.get('StrengthUoMID').value,
      "CanHaveBatch": divs[1] ? 1 : 0,
      "CanHaveExpiry": divs[0] ? 1 : 0,
      "MedicalType": medicaltype,
      "CategoryID": this.itemForm.get('CategoryID').value,
      "Strength": this.itemForm.get('Strength').value,
      "IsReuseable": this.itemForm.get('IsReuseable').value ? 1 : 0,
      "IsPatientSpecific": this.itemForm.get('IsPatientSpecific').value ? 1 : 0,
      "CanBeAsset": divs[6] ? 1 : 0,
      "IsNarcotic": IsNarocotic,
      "DoseFormId": 0,
      "PackName": this.itemForm.get('PackName').value,
      "PackName2L": this.itemForm.get('PackName2L').value,
      "DisplayName2L": "",
      "CatalogNumber": this.itemForm.get('CatalogNumber').value,
      "ItemNotes": this.itemForm.get('ItemNotes').value,
      "PatientInstructions": this.itemForm.get('PatientInstructions').value,
      "IsOnetime": divs[5] ? 1 : 0,
      "ProductionType": ProductionType,
      "PharmacalogyID": this.itemForm.get('PharmacalogyID').value == "" ? 0 : this.itemForm.get('PharmacalogyID').value,
      "prepared": divs[9] ? 1 : 0,
      "IssueUOMID": this.itemForm.get('IssueUOMID').value,
      "IssueUOMValue": 0,
      "ItemNotes2L": "",
      "PatientInstructions2L": "",
      "Size": this.itemForm.get('Size').value,
      "Weight": "",
      "Color": this.itemForm.get('Color').value,
      "IsCSSD": divs[4] ? 1 : 0,
      "IsLaundry": divs[3] ? 1 : 0,
      "USERID": this.doctorDetails[0].UserId,
      "FacilityID": this.facilityId,
      "HospitalID": this.hospitalID,
      "BLOCKED": this.itemForm.get('BLOCKED').value ? 1 : 0,
      "IsAntibiotic": divs[10] ? 1 : 0,//IsAntibiotic,
      "IsControledDrug": IsControledDrug,
      "BlockedRemarks": "",
      "OPDefaultUomID": this.itemForm.get('OPDefaultUomID').value,
      "IPDefaultUomID": this.itemForm.get('IPDefaultUomID').value,
      "CashReturnsNotAllowed": 0,
      "isDailyCheck": 0,
      "FrequencyUomID": 0,
      "IsHighRisk": divs[12] ? 1 : 0,
      "IncludeMarkup": this.itemForm.get('IncludeMarkup').value ? 1 : 0,
      "ItemShortName": "",
      "IsGlobal": 1,
      "QtyUomID": this.itemForm.get('IssueUOMID').value,
      "Quantity": this.itemForm.get('Quantity').value,
      "isIVFluid": divs[13],
      "MSDStockNumber": this.itemForm.get('MSDStockNumber').value,
      "IsHighValueDrug": divs[14] ? 1 : 0,
      "MaxAllowedDays": this.itemForm.get('MaxAllowedDays').value,
      "IsGenericItem": 0,
      "GenericItemId": this.itemForm.get('GenericItemId').value == "" ? 0 : this.itemForm.get('GenericItemId').value,
      "GTIN": this.itemForm.get('GTIN').value,
      "ImagePath": "",
      "IsLASA": divs[15] ? 1 : 0,
      "IsCytotoxic": divs[16] ? 1 : 0,
      "IsRefrigerated": divs[17] ? 1 : 0,
      "IsIVFluidAdditive": divs[18] ? 1 : 0,
      "IsAnticoagulant": divs[19] ? 1 : 0,
      "IsInsulin": divs[20] ? 1 : 0,
      "IsElectrolyte": divs[21] ? 1 : 0,
      "IsInotropeIVInfusion": divs[22] ? 1 : 0,
      "IsNarcoticIVInfusion": divs[23] ? 1 : 0,
      "IsConcentrationIvInfusion": divs[24] ? 1 : 0,
      "GroupType": this.itemForm.get('GroupType').value == "" ? 0 : this.itemForm.get('GroupType').value,
      "BasesolutionID": this.itemForm.get('BaseSolutionID').value == "" ? 0 : this.itemForm.get('BaseSolutionID').value,
      "IVFluidStorageConditionID": this.itemForm.get('StorageTypeID').value == "" ? 0 : this.itemForm.get('StorageTypeID').value,
      "IVFluidExpiryID": this.itemForm.get('IVExpiryID').value == "" ? 0 : this.itemForm.get('IVExpiryID').value,
      "IsOTC": divs[27] ? 1 : 0,
      "IsCashonly": divs[25] ? 1 : 0,
      "PackUoMXMLDetails": PackUoMXMLDetails,
      "ItemXMLDetails": ItemXMLDetails,
      "SpecializationDetailsXMLDetails": [],
      "DomainsXMLDetails": [],
      "HospitalsXMLDetails": HospitalsXMLDetails,
      "DoctorsXMLDetails": [],
      "IsSFDAApproved": this.itemForm.get('SFDADrug').value ? 1 : 0,
      "ItemSerialNo": this.itemForm.get('ItemSerialNo').value,
      "PrescribedQty": this.itemForm.get('PrescribedQty').value,
      "IsMaxOneQtyPerVisit": divs[26] ? 1 : 0,
      "IsPrescriptionRequired": divs[28] ? 1 : 0,
    }

    if (this.ItemID == '0') {
      //To check if ItemCode Already exists or not
      const url = this.globalService.getData(globalDetails.FetchItemandCodeExists, {
        ItemName: payload.DisplayName,
        ItemCode: payload.ItemCode,
        UserID: this.doctorDetails[0]?.UserId,
        HospitalID: this.hospitalID
      });
      this.us.get(url)
        .subscribe((res: any) => {
          if (res.Code == 200) {
            this.us.post(globalDetails.save, payload)
              .subscribe((response: any) => {
                if (response.Code == 200) {
                  $("#saveMsg").modal('show');
                  this.onViewItemDisplaySelected(response.PatientVitalEndoscopyDataaList[0])
                }
              },
                (err) => {

                })
          }
          else {
            this.errorMessages.push(res.Message);
            $("#errorMessageModal").modal('show');
            return;
          }
        },
          (err) => {
          })
    }
    else {
      this.us.post(globalDetails.save, payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            $("#saveMsg").modal('show');
            this.onViewItemDisplaySelected(response.PatientVitalEndoscopyDataaList[0])
          }
        },
          (err) => {

          })
    }
  }

  searchDisplay(event: any) {
    this.listOfItems = [];
    var filter = event.target.value;

    var medicaltype = 0;
    const divs = this.form.value.divs;
    if (this.itemForm.get('MedicalType').value === 'Medical')
      medicaltype = 0;
    else if (this.itemForm.get('MedicalType').value === 'Non-Medical' && !divs[8])
      medicaltype = 1;
    else if (this.itemForm.get('MedicalType').value === 'Non-Medical' && divs[8])
      medicaltype = 2;



    if (filter.length >= 3) {
      //this.url = this.globalService.getData(globalDetails.fetchSSItems, { Name: filter });
      this.url = this.globalService.getData(globalDetails.fetchSSItems, { Name: filter, Type: medicaltype, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfItems = response.FetchSSWardsDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfItems = [];
    }
  }

  onViewItemDisplaySelected(data: any) {
    var ItemID = data.ID != undefined ? data.ID : data[0].PreProcedureAssessment;
    this.url = this.globalService.getData(globalDetails.fetchGlobalItem, { ItemID: ItemID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.listOfItems = [];
          this.FetchGlobalItemInfoList = response.FetchGlobalItemInfoList;

          if (this.FetchGlobalItemInfoList.length > 0) {
            this.FetchGlobalItemPackageInfoList = response.FetchGlobalItemPackageInfoList;
            this.FetchItemPackageInfoList = response.FetchItemPackageInfoList;
            this.ItemID = this.FetchGlobalItemInfoList[0].ItemID;
            this.IsEdit = true;
            this.items.clear();
            this.FetchGlobalItemPackageInfoList.forEach((item: any) => {
              if (item.ChildUoMID != "") {
                const itemFormGroup = this.formbuilder.group({
                  Units: item.UoMID,
                  Contains: item.ContainsText,
                  Mapping: this.formbuilder.array([]),
                  MappingValue: item.ChildUoMID
                })

                this.items.push(itemFormGroup);
                const lastIndex = this.items.length - 1;
                this.GetChildUOMS(item.UoMID, this.items.at(lastIndex))

              }
            });

            this.selectedClinicalTab = this.FetchGlobalItemInfoList[0].MedicalType === 0 ? 'Medical' : this.FetchGlobalItemInfoList[0].MedicalType === 1 ? 'Non-Medical' : 'Pharmacy'

            const trueIndices = this.findIndicesForTrueLabels(this.FetchGlobalItemInfoList[0], this.labels);

            this.divControls.forEach((control: any, index) => {
              control.value = trueIndices.includes(index);
            });

            this.itemForm.patchValue({
              DisplayName: this.FetchGlobalItemInfoList[0].DisplayName,
              ItemCode: this.FetchGlobalItemInfoList[0].ItemCode,
              BrandName: this.FetchGlobalItemInfoList[0].BrandName,
              BrandID: this.FetchGlobalItemInfoList[0].BrandID,
              Manufacturer: this.FetchGlobalItemInfoList[0].BrandName,
              StrengthUoMID: this.FetchGlobalItemInfoList[0].StrengthUoMID,
              MedicalType: this.selectedClinicalTab,
              CategoryName: this.FetchGlobalItemInfoList[0].CategoryName,
              CategoryID: this.FetchGlobalItemInfoList[0].CategoryID,
              Strength: this.FetchGlobalItemInfoList[0].Strength,
              IsReuseable: this.FetchGlobalItemInfoList[0].IsReuseable === "0" ? false : true,
              IsPatientSpecific: this.FetchGlobalItemInfoList[0].IsPatientSpecific,
              DoseFormId: [''],
              PackName: this.FetchGlobalItemPackageInfoList[0].PackName,
              PackName2L: this.FetchGlobalItemPackageInfoList[0].PackName,
              DisplayName2L: [''],
              CatalogNumber: this.FetchGlobalItemInfoList[0].CatalogNumber,
              ItemNotes: this.FetchGlobalItemInfoList[0].ItemNotes,
              PatientInstructions: this.FetchGlobalItemInfoList[0].PatientInstructions,
              ProductionType: [''],
              PharmacalogyID: this.FetchGlobalItemInfoList[0].PharmaCalogyID,
              IssueUOMID: this.FetchGlobalItemInfoList[0].IssueUOMID,
              IssueUOMValue: this.FetchGlobalItemInfoList[0].IssueUOMValue,
              ItemNotes2L: [''],
              PatientInstructions2L: [''],
              Size: this.FetchGlobalItemInfoList[0].Size,
              Weight: this.FetchGlobalItemInfoList[0].Weight,
              Color: this.FetchGlobalItemInfoList[0].Color,
              BLOCKED: this.FetchGlobalItemInfoList[0].BLOCKED === "0" ? false : true,
              BlockedRemarks: [''],
              OPDefaultUomID: this.FetchGlobalItemInfoList[0].OPDefaultUomID,
              IPDefaultUomID: this.FetchGlobalItemInfoList[0].IPDefaultUomID,
              CashReturnsNotAllowed: [''],
              isDailyCheck: [''],
              FrequencyUomID: [''],
              IncludeMarkup: this.FetchItemPackageInfoList[0].IncludeMarkup,
              ItemShortName: [''],
              IsGlobal: [''],
              QtyUomID: [''],
              Quantity: this.FetchGlobalItemInfoList[0].Quantity,
              MSDStockNumber: this.FetchGlobalItemInfoList[0].MSDStockNumber,
              MaxAllowedDays: this.FetchGlobalItemInfoList[0].MaxAllowedDays,
              IsGenericItem: [''],
              GenericItemId: this.FetchGlobalItemInfoList[0].GenericItemID,
              Scientific: this.FetchGlobalItemInfoList[0].GenericItem,
              GTIN: this.FetchGlobalItemInfoList[0].GTIN,
              ImagePath: [''],
              GroupType: this.FetchGlobalItemInfoList[0].ItemGroupTypeId,
              BaseSolutionID: this.FetchGlobalItemInfoList[0].BasesolutionID,
              StorageTypeID: this.FetchGlobalItemInfoList[0].IVFluidStorageConditionID,
              IVExpiryID: this.FetchGlobalItemInfoList[0].IVFluidExpiryID,
              SFDADrug: this.FetchGlobalItemInfoList[0].IsSFDAApproved,
              ItemSerialNo: this.FetchGlobalItemInfoList[0].ItemSerialNo,
              PrescribedQty: this.FetchGlobalItemInfoList[0].PrescribedQty
            });
          }
        }
      },
        (err) => {
        })
  }

  findIndicesForTrueLabels(responseObj: any, labelArray: string[]): number[] {
    const trueIndices: number[] = [];
    for (const key in responseObj) {
      if (responseObj.hasOwnProperty(key)) {
        const value = responseObj[key];
        if (value === true || value === "True" || value === "1") {
          const index = labelArray.indexOf(key);
          if (index !== -1) {
            trueIndices.push(index);
          }
        }
      }
    }
    return trueIndices;
  }

  clearGlobalItemMaster() {
    this.listOfItems = [];
    this.FetchGlobalItemInfoList = [];
    this.FetchGlobalItemPackageInfoList = [];
    this.FetchItemPackageInfoList = [];
    this.ItemID = "0";
    this.IsEdit = false;

    const divControls = (this.form.get('divs') as FormArray).controls;
    divControls.forEach(control => {
      control.setValue(false);
    });

    const divControls1 = (this.form1.get('divs') as FormArray).controls;
    divControls1.forEach(control => {
      control.setValue(false);
    });

    this.selectedClinicalTab = 'Medical';
    this.scheduled = 'Non-Scheduled';
    this.productionType = 'Generic';
    this.items.clear();
    this.intializeItemForm();
    if (this.items.length === 0) {
      this.addRow();
    }
  }

  fetchDoctorSearch(event: any) {
    if (event.target.value.length >= 3) {
      this.url = this.globalService.getData(globalDetails.fetchGSpecialisationDOc, { Type: 2, DisplayName: event.target.value });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfDoctors = response.FetchGSpecialisationDOcDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfDoctors = [];
    }
  }

  selectItem(item: any) {
    this.listOfDoctors = [];
    this.doctorList.push(item);
  }

  deleteDoctor(doctor: any) {
    const index = this.doctorList.indexOf(doctor);
    if (index !== -1) {
      this.doctorList.splice(index, 1);
    }
  }

  fetchSpecialisationSearch(event: any) {
    if (event.target.value.length >= 3) {
      this.url = this.globalService.getData(globalDetails.fetchGSpecialisation, { Type: 2, DisplayName: event.target.value });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfSpecialisation = response.FetchGSpecialisationDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfSpecialisation = [];
    }
  }

  selectSpecialisationItem(item: any) {
    this.listOfSpecialisation = [];
    this.specialisationList.push(item);
  }

  deleteSpecialisation(specialisation: any) {
    const index = this.specialisationList.indexOf(specialisation);
    if (index !== -1) {
      this.specialisationList.splice(index, 1);
    }
  }

  fetchRouteSearch(event: any) {
    if (event.target.value.length >= 3) {
      this.url = this.globalService.getData(globalDetails.fetchAdmRoutes, { Type: 77, DisplayName: event.target.value });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfRoutes = response.GetMasterDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfRoutes = [];
    }
  }

  selectRouteItem(item: any) {
    this.listOfRoutes = [];
    item.BLK = 0;
    this.routesList.push(item);
  }

  deleteRoute(route: any) {
    const index = this.routesList.indexOf(route);
    if (index !== -1) {
      this.routesList[index].BLK = 1;

      const updatedRoutesList = [...this.routesList];
      updatedRoutesList[index].BLK = 1;
      this.routesList = updatedRoutesList;
    }
  }

  fetchFrequencySearch(event: any) {
    if (event.target.value.length >= 3) {
      this.url = this.globalService.getData(globalDetails.fetchAdmRoutes, { Type: 65, DisplayName: event.target.value });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfFrequency = response.GetMasterDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfFrequency = [];
    }
  }

  selectFrequencyItem(item: any) {
    this.listOfFrequency = [];
    this.frequencyList.push(item);
  }

  deleteFrequency(frequency: any) {
    const index = this.frequencyList.indexOf(frequency);
    if (index !== -1) {
      this.frequencyList.splice(index, 1);
      const updatedList = [...this.frequencyList];
      updatedList[index].BLK = 1;
      this.frequencyList = updatedList;
    }
  }

  fetchHospitalLocations() {
    this.url = this.globalService.getData(globalDetails.fetchHospitalLocations, {});
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.mapList = response.HospitalLocationsDataList;
        }
      },
        (err) => {
        })
  }

  deleteMap(map: any) {
    const index = this.mapList.indexOf(map);
    if (index !== -1) {
      this.mapList.splice(index, 1);
    }
  }

  fetchMappingSearch(event: any) {
    if (event.target.value.length >= 3) {
      this.url = this.globalService.getData(globalDetails.fetchGDomain, { DisplayName: event.target.value });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfMappings = response.FetchGDomainDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfMappings = [];
    }
  }

  selectMappingItem(item: any) {
    this.listOfMappings = [];
    this.mappingList.push(item);
  }

  deleteMapping(mapping: any) {
    const index = this.mappingList.indexOf(mapping);
    if (index !== -1) {
      this.mappingList.splice(index, 1);
    }
  }

  fetchIndicationsSearch(event: any) {
    if (event.target.value.length >= 3) {
      this.url = this.globalService.getData(globalDetails.fetchAdmRoutes, { Type: 850, DisplayName: event.target.value });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfIndications = response.GetMasterDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfIndications = [];
    }
  }

  selectIndicationItem(item: any) {
    this.listOfIndications = [];
    this.indicationMappingList.push(item);
  }

  deleteIndication(indication: any) {
    const index = this.indicationMappingList.indexOf(indication);
    if (index !== -1) {
      this.indicationMappingList.splice(index, 1);
    }
  }

  fetchGenericSearch(event: any) {
    if (event.target.value.length >= 3) {
      this.url = this.globalService.getData(globalDetails.fetchAdmRoutes, { Type: 23, DisplayName: event.target.value });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfGeneric = response.GetMasterDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfGeneric = [];
    }
  }

  selectGenericItem(item: any, index: any) {
    item.GenericName = item.name;
    item.GenericID = item.id;

    const updatedGenericList = [...this.genericList];
    updatedGenericList[index] = item;
    this.genericList = updatedGenericList;

    this.listOfGeneric = [];
  }

  addGenericList(add: any = false) {
    if (this.genericList.length === 0 || add) {
      this.genericList.push({});
    }
  }

  deleteGeneric(gen: any) {
    const index = this.genericList.indexOf(gen);
    if (index !== -1) {
      this.genericList.splice(index, 1);
    }
  }

  openModal(modalName: any) {
    this.errorMessages = [];
    if (this.ItemID === "0") {
      this.errorMessages.push("Item Name is required");
      $("#errorMessageModal").modal('show');
    }
    else {
      $("#" + modalName).modal('show');
      switch (modalName) {
        case 'mappingModal':
          this.fetchGSavedItemFrequency();
          break;
        case 'speciaModal':
          this.fetchGSavedItemSpecialisation();
          break;
        case 'routeModal':
          this.fetchGSavedAdmRoute();
          break;
        case 'mapDoctorModal':
          this.fetchGSavedItemDoctorMapping();
          break;
        case 'containModal':
          this.fetchGSavedItemDomainMapping();
          break;
        case 'MapLocation':
          this.fetchGSavedItemHospitalMapping();
          break;
        case 'compositeModal':
          this.fetchGSavedItemCompositionMapping()
          break;
        case 'HoldingStore':
          this.FetchGSavedHoldingStoreMapping()
          break;
        default:
          break;
      }
    }
  }

  saveRoute(modal: any) {
    var AdminRouteXML: any = [];

    this.routesList.filter((x: any) => x.BLK == 0).forEach((item: any) => {
      AdminRouteXML.push({
        "RID": item.id,
        "BLK": item.BLK ?? 0
      });
    });

    var payload = {
      "ItemID": this.ItemID,
      "AdminRouteXML": AdminRouteXML,
      "USERID": this.doctorDetails[0]?.UserId,
      "WORKSTATIONID": this.facilitySessionId ?? this.globalService.param.WorkStationID,
      "HospitalID": this.hospitalID
    }

    this.saveModal(globalDetails.saveGAdminRoute, payload, modal);
  }

  saveHoldingStore(modal: any) {
    // const ItemHoldStoreXML = this.holdingStoreList.map((item: any) => {
    //   return {
    //     "DPT": item.FacilityID,
    //     "BLK": 0
    //   }
    // });

    const ItemHoldStoreXML = this.listOfStores.filter((item: any) => item.isSelected)
      .map((item: any) => {
        return {
          "DPT": item.FacilityID,
          "BLK": 0
        }
      });

    var payload = {
      "ItemID": this.ItemID,
      ItemHoldStoreXML,
      "USERID": this.doctorDetails[0]?.UserId,
      "WORKSTATIONID": this.facilitySessionId ?? this.globalService.param.WorkStationID,
      "HospitalID": this.hospitalID
    }

    this.saveModal(globalDetails.SaveGItemHoldStores, payload, modal);
  }

  saveModal(url: any, payload: any, modal: any) {
    this.us.post(url, payload)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          $("#saveMsg").modal('show');
          $("#" + modal).modal('hide');
        }
      },
        (err) => {

        })
  }

  fetchGSavedAdmRoute() {
    this.url = this.globalService.getData(globalDetails.fetchGSavedAdmRoute, { ItemID: this.ItemID });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.routesList = [];
          response.FetchGSavedAdmRouteDataList.forEach((item: any) => {
            this.routesList.push({
              "id": item.RouteID,
              "name": item.RouteName,
              "BLK": 0
            });
          });
        }
      },
        (err) => {
        })
  }

  saveFrequency(modal: any) {
    var ItemFrequencyXML: any = [];

    this.frequencyList.forEach((item: any) => {
      ItemFrequencyXML.push({
        "FID": item.id,
        "BLK": item.BLK ?? 0
      });
    });

    var payload = {
      "ItemID": this.ItemID,
      "ItemFrequencyXML": ItemFrequencyXML,
      "USERID": this.doctorDetails[0]?.UserId,
      "WORKSTATIONID": this.facilitySessionId ?? this.globalService.param.WorkStationID,
      "HospitalID": this.hospitalID
    }

    this.saveModal(globalDetails.saveGItemFrequency, payload, modal);
  }

  fetchGSavedItemFrequency() {
    this.url = this.globalService.getData(globalDetails.fetchGSavedItemFrequency, { ItemID: this.ItemID });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.frequencyList = [];
          response.FetchGSavedItemFrequencyDataList.forEach((item: any) => {
            this.frequencyList.push({
              "id": item.FrequencyID,
              "name": item.FrequencyName,
              "BLK": 0
            });
          });
        }
      },
        (err) => {
        })
  }

  saveSpecialisation(modal: any) {
    var ItemSpecialisationXML: any = [];

    this.specialisationList.forEach((item: any) => {
      ItemSpecialisationXML.push({
        "SPID": item.SpecialiseID,
      });
    });

    var payload = {
      "ItemID": this.ItemID,
      "ItemSpecialisationXML": ItemSpecialisationXML,
      "USERID": this.doctorDetails[0]?.UserId,
      "WORKSTATIONID": this.facilitySessionId ?? this.globalService.param.WorkStationID,
      "HospitalID": this.hospitalID
    }

    this.saveModal(globalDetails.saveGItemSpecialisation, payload, modal);
  }

  fetchGSavedItemSpecialisation() {
    this.url = this.globalService.getData(globalDetails.fetchGSavedItemSpecialisation, { ItemID: this.ItemID });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.specialisationList = [];
          response.FetchGSavedItemSpecialisationDataList.forEach((item: any) => {
            this.specialisationList.push({
              "SpecialiseID": item.SpecialiseID,
              "Specialisation": item.Specialisation
            });
          });
        }
      },
        (err) => {
        })
  }

  savedoctor(modal: any) {
    var ItemDoctorXML: any = [];

    this.doctorList.forEach((item: any) => {
      ItemDoctorXML.push({
        "DID": item.EmpID,
      });
    });

    var payload = {
      "ItemID": this.ItemID,
      "ItemDoctorXML": ItemDoctorXML,
      "USERID": this.doctorDetails[0]?.UserId,
      "WORKSTATIONID": this.facilitySessionId ?? this.globalService.param.WorkStationID,
      "HospitalID": this.hospitalID
    }

    this.saveModal(globalDetails.saveGItemDoctor, payload, modal);
  }

  fetchGSavedItemDoctorMapping() {
    this.url = this.globalService.getData(globalDetails.fetchGSavedItemDoctorMapping, { ItemID: this.ItemID });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.doctorList = [];
          response.FetchGSavedItemDoctorMappingDataList.forEach((item: any) => {
            this.doctorList.push({
              "EmpID": item.DoctorID,
              "FullName": item.DoctorName
            });
          });
        }
      },
        (err) => {
        })
  }

  saveMapping(modal: any) {
    var ItemDomainXML: any = [];

    this.mappingList.forEach((item: any) => {
      ItemDomainXML.push({
        "DID": item.DomainID,
      });
    });

    var payload = {
      "ItemID": this.ItemID,
      "ItemDomainXML": ItemDomainXML,
      "USERID": this.doctorDetails[0]?.UserId,
      "WORKSTATIONID": this.facilitySessionId ?? this.globalService.param.WorkStationID,
      "HospitalID": this.hospitalID
    }

    this.saveModal(globalDetails.saveGItemDomain, payload, modal);
  }

  fetchGSavedItemDomainMapping() {
    this.url = this.globalService.getData(globalDetails.fetchGSavedItemDomainMapping, { ItemID: this.ItemID });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.mappingList = [];
          response.FetchGSavedItemDomainMappingDataList.forEach((item: any) => {
            this.mappingList.push({
              "DomainID": item.DomainID,
              "DomainName": item.DomainName
            });
          });
        }
      },
        (err) => {
        })
  }

  saveHospital(modal: any) {
    var ItemHospitalXML: any = [];

    this.mapList.forEach((item: any) => {
      ItemHospitalXML.push({
        "HID": item.HospitalID,
      });
    });

    var payload = {
      "ItemID": this.ItemID,
      "ItemHospitalXML": ItemHospitalXML,
      "USERID": this.doctorDetails[0]?.UserId,
      "WORKSTATIONID": this.facilitySessionId ?? this.globalService.param.WorkStationID,
      "HospitalID": this.hospitalID
    }

    this.saveModal(globalDetails.saveGItemHospital, payload, modal);
  }

  fetchGSavedItemHospitalMapping() {
    this.url = this.globalService.getData(globalDetails.fetchGSavedItemHospitalMapping, { ItemID: this.ItemID });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.mapList = [];
          if (response.FetchGSavedItemHospitalMappingDataList.length === 0) {
            this.fetchHospitalLocations();
          }
          response.FetchGSavedItemHospitalMappingDataList.forEach((item: any) => {
            this.mapList.push({
              "HospitalID": item.HospitalID,
              "Name": item.HospitalName
            });
          });
        }
      },
        (err) => {
        })
  }

  isAllStoresSelected(): boolean {
    return this.listOfStores.every((item: any) => item.isSelected);
  }

  onStoreSelectAllClick() {
    const isAllItemsSelected = this.listOfStores.every((item: any) => item.isSelected);
     this.listOfStores.forEach((item: any) => item.isSelected = !isAllItemsSelected);
  }

  FetchGSavedHoldingStoreMapping() {
    this.listOfStores.forEach((item: any) => item.isSelected = false);
    this.url = this.globalService.getData(globalDetails.FetchGSavedHoldingStore, { ItemID: this.ItemID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.holdingStoreList = [];
          this.holdingStoreList = response.FetchGSavedHoldingStoreDataList.map((element: any) => {
            return {
              "Name": element.WorkPlaceName,
              "FacilityID": element.FacilityID
            }
          });

          this.listOfStores.forEach((store: any) => {
            const isMapped = response.FetchGSavedHoldingStoreDataList.find((element: any) => store.FacilityID == element.FacilityID);
            if (isMapped) {
              store.isSelected = true;
            }
          });
        }
      },
        (_) => {
        });
  }

  fetchStores() {
    this.fetchStoreSearch({
      target: {
        value: '%%%'
      }
    });
  }

  fetchStoreSearch(event: any) {
    if (event.target.value.length >= 3) {
      this.url = this.globalService.getData(globalDetails.FetchHoldingStoreFacility, { Type: 0, DisplayName: event.target.value });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfStores = response.FetchHoldingStoreFacilityDataList;
          }
        },
          (err) => {
          })
    }
    else {
      this.listOfStores = [];
    }
  }

  selectStoreItem(item: any) {
    this.listOfStores = [];
    const isAlreadyAvailable = this.holdingStoreList.find((element: any) => element.FacilityID === item.FacilityID);
    if (!isAlreadyAvailable) {
      this.holdingStoreList.push({
        "Name": item.FacilityName,
        "FacilityID": item.FacilityID
      });
    } else {
      this.errorMsg = 'Item Already Exists';
      $('#errorMsg').modal('show');
    }
  }

  deleteHoldingStoreItem(item: any) {
    const index = this.holdingStoreList.indexOf(item);
    if (index !== -1) {
      this.holdingStoreList.splice(index, 1);
    }
  }

  saveComposition(modal: any) {
    var ItemCompositionXML: any = [];

    this.genericList.forEach((item: any) => {
      ItemCompositionXML.push({
        "GEN": item.id,
        "QTY": item.Qty,
        "UOM": item.UoMID
      });
    });

    var payload = {
      "ItemID": this.ItemID,
      "ItemCompositionXML": ItemCompositionXML,
      "USERID": this.doctorDetails[0]?.UserId,
      "WORKSTATIONID": this.facilitySessionId ?? this.globalService.param.WorkStationID,
      "HospitalID": this.hospitalID
    }

    this.saveModal(globalDetails.saveGItemComposition, payload, modal);
  }

  fetchGSavedItemCompositionMapping() {
    this.url = this.globalService.getData(globalDetails.fetchGSavedItemCompositionMapping, { ItemID: this.ItemID });

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.genericList = [];
          response.FetchGSavedItemCompositionMappingDataList.forEach((item: any) => {
            this.genericList.push({
              "id": item.GenericID,
              "GenericName": item.GenericName,
              "Qty": item.Quantity,
              "UoMID": item.UoMID
            });
          });

          this.addGenericList();
        }
      },
        (err) => {
        })
  }

  openItemSearchModal() {
    this.clearSearch();
    $('#itemSearchModal').modal('show');
  }

  fetchItems(min: number = 1, max: number = 10, currentPage: number = 1) {
    if (this.itemCodeSearchText || this.itemNameSearchText) {
      let medicaltype = 1;

      if (this.itemForm.get('MedicalType').value === 'Medical')
        medicaltype = 1;
      else if (this.itemForm.get('MedicalType').value === 'Non-Medical')
        medicaltype = 2;
      else if (this.itemForm.get('MedicalType').value === 'Non-Medical')
        medicaltype = 3;
      this.url = this.us.getApiUrl(globalDetails.FetchItemCommonSearch, {
        min,
        max,
        ItemCode: this.itemCodeSearchText ? 1 : 0,
        DisplayName: this.itemNameSearchText ? 1 : 0,
        MedicalType: medicaltype,
        Type: this.itemCodeSearchText ? this.itemCodeFilterType : this.itemNameFilterType,
        Filter: this.itemCodeSearchText ? this.itemCodeSearchText : this.itemNameSearchText,
        UserID: this.doctorDetails[0].UserId,
        WorkStationID: this.facilitySessionId ?? this.globalService.param.WorkStationID,
        HospitalID: this.hospitalID
      });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.fetchedItemsList = response.FetchItemScientificNameDataList;
            this.currentPage = currentPage;
            this.totalItemsCount = Number(response.FetchItemScientificNameDataCountDataList[0]?.Count);
          }
        },
          (_) => {
          });
    } else {
      this.fetchedItemsList = [];
      this.currentPage = 0;
      this.totalItemsCount = 0;
      this.errorMsg = 'Please enter search text';
      $('#errorMsg').modal('show');
    }
  }

  handlePageChange(event: any) {
    this.fetchItems(event.min, event.max, event.currentPage);
  }

  clearSearch() {
    this.fetchedItemsList = [];
    this.currentPage = 0;
    this.totalItemsCount = 0
    this.itemCodeFilterType = 1;
    this.itemNameFilterType = 1;
    this.itemCodeSearchText = '';
    this.itemNameSearchText = '';
  }

  onItemSelection(item: any) {
    this.fetchedItemsList.forEach((element: any) => {
      if (element.ItemID === item.ItemID) {
        element.selected = !element.selected;
      } else {
        element.selected = false;
      }
    });
  }

  onSelectBtnClick() {
    const selectedItem = this.fetchedItemsList.find((item: any) => item.selected);
    if (selectedItem) {
      $('#itemSearchModal').modal('hide');
      selectedItem.ID = selectedItem.ItemID;
      this.onViewItemDisplaySelected(selectedItem);
    }
  }
}