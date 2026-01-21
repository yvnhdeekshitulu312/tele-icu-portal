import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { BaseComponent } from 'src/app/shared/base.component';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { ConfigService as BedConfig } from '../services/config.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';
import { ObservableInput, Subject, combineLatest, debounceTime } from 'rxjs';
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
  selector: 'app-home-medication',
  templateUrl: './home-medication.component.html',
  styleUrls: ['./home-medication.component.scss'],
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
export class HomeMedicationComponent extends BaseComponent implements OnInit {
  @Input() homeMedicationEnable = true;
  @Input() ClinicVisitAfterDays: string = "";
  @Input() BedTransferRequestID: string = "";
  @Input() dischargeIntimationRiased = false;
  @ViewChild('medicationFormContainer', { static: false }) medicationFormContainer!: ElementRef;
  viewPreviousMedicationForm!: FormGroup;
  sickLeaveDateForm!: FormGroup;
  dischargeRequestForm!: FormGroup;
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
  dischargeStatus: any;
  dischargeReasons: any;
  isDisReqSubmitted = false;
  currentdate: any;
  homeNAMedicationEnable = true;
  issuedItemsAgainstPresc: any = [];
  issuedPrescriptionItems: any = [];
  dischargeRemarksValidation = false;
  dischargeCancelRemarks = "";
  locationList: any = [];
  SpecializationList: any = [];
  listOfSpecItems: any = [];
  listOfSpecItems1: any = [];
  SpecializationList1: any = [];
  locationValue: any = '';
  specializationValue: any = '';
  referralList: any = [];
  errorMessagesD: any[] = [];
  selectedDischargeDetails: any;
  lexicomData: any;
  lexicomTooltipMsg: string = "";
  lexicomAlertsList: any = [];
  lexicomInlineAlertsList: any = [];
  lexicomInlineAlertsListPassed: any = [];
  lexicomAlertsWithTextList: any = [];
  lexicomSummaryAlertsList: any = [];
  lexicomSummaryAlertsListPassed: any = [];
  lexicomDrugName: string = "";
  remarksForSelectedInvName: any;
  remarksForSelectedInvId: any;
  remarksForSelectedDiscontinuedItemId: any;
  remarksForSelectedDiscontinuedPrescId: any;
  remarksForSelectedDiscontinuedItemName: any;
  remarksSelectedIndex: number = -1;
  remarksForSelectedHoldItemId: any;
  remarksForSelectedHoldPrescId: any;
  remarksForSelectedHoldItemName: any;
  savedMonitorId: number = 0;
  holdReasonValidation: boolean = false;
  holdReasonValidation_prev: boolean = false;
  selectedHoldReason: string = "0";
  selectedHoldReason_prev: string = "0";
  holdBtnName: string = 'Hold';
  holdBtnName_prev: string = 'Hold';
  holdMasterList: any = [];
  enableSickLeave: boolean = true;


  isOpenAppointment = false;
  visitDiagnosis: any = [];
  showPrevMedFiltersData: boolean = true;
  previousMedicationListDetailsFilterData: any = [];
  sickLeaveId = 0;

  constructor(private fb: FormBuilder, private config: ConfigService, public datepipe: DatePipe, private bedconfig: BedConfig, private modalService: NgbModal) {
    super();
    this.viewPreviousMedicationForm = this.fb.group({
      fromdate: new Date(this.selectedView.AdmitDate),
      todate: new Date(),
      PrescriptionID: ['0']
    });
    this.sickLeaveDateForm = this.fb.group({
      sickfromdate: [new Date(this.selectedView.AdmitDate)],
      sicktodate: [new Date()],
      sickLeaveDays: ['']
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
      Price: [''],
      DiagnosisId: '',
      DISID: '',
      DiagnosisName: [''],
      DiagnosisCode: [''],
    });
    this.medicationSchedulesForm = this.fb.group({
      ItemId: [''],
      ScheduleTime: [''],
      Dose: ['']
    });

    this.dischargeRequestForm = this.fb.group({
      TransferRequestID: 0,
      RequestType: ['1'],
      DischargeStatusID: ['0', Validators.required],
      DischargeReasonID: ['0', Validators.required],
      DischargeDate: [new Date(), Validators.required],
      DischargeTime: [moment(new Date()).format('H:mm'), Validators.required],
      Remarks: ['']
    });

  }

  get medicationScheduleitems(): FormArray {
    return this.medicationSchedulesForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    // this.referralList.push({
    //   doctorName: this.selectedView.DoctorName,
    //   doctorId: this.selectedView.ConsultantID,
    //   specializationName: this.selectedView.Specialisation,
    //   specializationId: this.selectedView.SpecialiseID,
    //   hospitalName: sessionStorage.getItem('locationName'),
    //   appointmentDate: moment(new Date().setDate(new Date().getDate() + Number($("#ClinicVisitAfterDays").val() ?? '1'))).format('DD-MMM-YYYY'),
    //   ClinicalAfter:$("#ClinicVisitAfterDays").val(),
    //    showDelete : true
    // });
    this.fetchHospitalLocations();
    this.fetchReferalAdminMasters();
    this.fetchPreviousMedication();
    this.medicationsForm.patchValue({
      ScheduleStartDate: new Date()
    });
    this.FetchMedicationDemographics();
    this.FetchDrugFrequencies();
    this.FetchMedicationInstructions();
    this.initializeSearchListener();
    this.fetchAdminMasters('139');
    this.fetchAdminMasters('74');
    this.medicationSchedulesForm = this.fb.group({
      items: this.fb.array([])
    });
    $("#ClinicVisitAfterDays").val(this.ClinicVisitAfterDays);
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY | H:mm');
    this.toggleHomeMedication('0');
    if (this.dischargeIntimationRiased) { 
      this.FetchPatienAdmissionAgainstDischargeAfterFollowUp();
      this.GetSavedPatientSickLeave(this.selectedView?.AdmissionID);
    }
    else {
      this.calculateSickDays();
    }
    this.getPatientDiagnosis();
  }
  fetchAdminMasters(type: string) {
    this.config.fetchAdminMasters(type).subscribe((response) => {
      if (response.Code === 200) {
        if (type === '139')
          this.dischargeStatus = response.SmartDataList;
        else
          this.dischargeReasons = response.SmartDataList;
      }
    });
  }

  fetchPreviousMedication() {
    var startdate = moment(this.viewPreviousMedicationForm.get('fromdate')?.value).format('DD-MMM-YYYY');
    var enddate = moment(this.viewPreviousMedicationForm.get('todate')?.value).format('DD-MMM-YYYY');

    this.config.getPreviousMedication(this.selectedView.PatientID, startdate, enddate, 0, 0).subscribe((response) => {
      if (response.Status === "Success") {
        this.previousMedicationList = response.PreviousMedicationDataList;
        //this.previousMedicationList = this.previousMedicationList.filter((data: any) => Date.parse(data.StartFrom) > Date.parse(startdate.toString()) && Date.parse(data.EndDatetime) < Date.parse(enddate));
        this.PatientVisitsList = this.previousMedicationList.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.PrescriptionNO === thing.PrescriptionNO) === i);
        const distinctThings = response.PreviousMedicationDataList.filter((thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.PrescriptionNO === thing.PrescriptionNO) === i);
        console.dir(distinctThings);
        this.filteredpreviousMedicationList = distinctThings;
        this.filteredpreviousMedicationList = this.filteredpreviousMedicationList.sort((a: any, b: any) => b.PrescriptionID - a.PrescriptionID);
        this.PatientVisitsList = this.PatientVisitsList.sort((a: any, b: any) => b.PrescriptionID - a.PrescriptionID);
        this.previousMedicationListDetails = this.previousMedicationList.filter((x: any) => x.PrescriptionID === this.filteredpreviousMedicationList[0].PrescriptionID);
        this.issuedItemsAgainstPresc = this.issuedPrescriptionItems.filter((x: any) => x.PrescriptionID == this.filteredpreviousMedicationList[0].PrescriptionID);
        if(this.previousMedicationListDetails.length > 0) {
          this.previousMedicationListDetails[0].selected = true;
          this.previousMedicationListDetails[0].selectall = false;
        }

        this.previousMedicationListDetails.forEach((element: any, index: any) => {
          element.selected = true;
          this.homeMedication = element.isDischargeMedication === 'True' ? true : false;
          this.homeMedicationVal = element.isDischargeMedication === 'True' ? "0" : "1";
          this.toggleHomeMedication(this.homeMedicationVal);
        });
        this.showPrevMedFiltersData = false;
      }
    },
      (err) => {
      })
  }

  showPreviousMedications(filter: string) {
    this.showPrevMedFiltersData = true;
    if (filter === "W") {
      var week = new Date();
      week.setDate(week.getDate() - 7);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x:any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(week.toString()));
    } else if (filter === "T") {
      var today = new Date();
      today.setDate(today.getDate());
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x:any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(today.toString()));
    }
    else if (filter === "M") {
      var onem = new Date();
      onem.setMonth(onem.getMonth() - 1);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x:any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(onem.toString()));
    } else if (filter === "3M") {
      var threem = new Date();
      threem.setMonth(threem.getMonth() - 3);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x:any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(threem.toString()));
    } else if (filter === "6M") {
      var sixm = new Date();
      sixm.setMonth(sixm.getMonth() - 6);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x:any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(sixm.toString()));
    } else if (filter === "1Y") {
      var twelvem = new Date();
      twelvem.setMonth(twelvem.getMonth() - 12);
      this.previousMedicationListDetailsFilterData = this.previousMedicationList.filter((x:any) => Date.parse(x.PrescriptionCreateDate) >= Date.parse(twelvem.toString()));
    }
  }

  filterPreviousMedications(event: any) {
    var prescid = event.target.value;
    if (prescid === "0")
      this.filteredpreviousMedicationList = this.previousMedicationList.sort((a: any, b: any) => b.PrescriptionID - a.PrescriptionID);
    else
      this.filteredpreviousMedicationList = this.previousMedicationList.filter((x: any) => x.PrescriptionID === prescid);
  }

  filterIssuedItems(view: any) {
    return this.issuedItemsAgainstPresc.filter((x: any) => x.PrescriptionItemID === view.ItemID);
  }

  PrescribePreviousMedication() {
    let find = this.previousMedicationListDetails.filter((x: any) => x?.isChecked === true && x.Frequency != 'STAT');

    //To check if selected Items are already prescribed as  Discharge medications 
    if(find.length > 0) {
      const idDisMedications = find.filter((x: any) => x.isDischargeMedication == 'True');
      if(idDisMedications.length > 0) {
        this.errorMessages = "Selected medications are already prescribed as Discharge Medications." + idDisMedications.map((item: any) => item.GenericItemName).join(',');
        $("#errorMsg").modal('show');
        return;
      }
    }

    let subscribes: ObservableInput<any>[] = [];

    find.forEach((med: any, index: any) => {
      med.selected = false;
      med.isChecked = false;
      subscribes.push(this.config.displayScheduleAndQuantity(this.doctorDetails[0].UserId, this.ward.FacilityID, med.FrequencyID, 1, med.Dose, med.Duration, med.DurationID, 1, 0, med.ItemID,
        (this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') ? med.IPDefaultUomID : med.OPDefaultUomID, moment(new Date()).format('DD-MMM-YYYY'), this.selectedView.PatientType == "3" ? "1" : this.selectedView.PatientType, 0, this.hospitalID));

    });
    combineLatest(subscribes).subscribe(responses => {
      responses.forEach((response, index) => {
        if (response.Code === 200) {
          find[index].Quantity = response.FetchItemQtyDataCDataaList[0].totQty;
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
            this.config.fetchItemForPrescriptions(this.selectedView.PatientType, find[index].ItemID, "1", this.doctorDetails[0].EmpId, this.ward.FacilityID, this.hospitalID, this.doctorDetails[0].EmpId)
              .subscribe((response: any) => {
                if (response.Code == 200) {
                  const itempacking = response.ItemPackageDataList.filter((x: any) => x.Sequence !== "");
                  this.selectedItemsList.push({
                    SlNo: this.selectedItemsList.length + 1,
                    Class: "row card_item_div mx-0 g-3 w-100 align-items-start",
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
                    ScheduleStartDate: new Date(find[index].EndDatetime) > new Date() ?
                      this.datepipe.transform(new Date(find[index].EndDatetime).setDate(new Date(find[index].EndDatetime).getDate() + 1), "dd-MMM-yyyy")?.toString()
                      : moment(new Date()).format('DD-MMM-YYYY'),
                    StartFrom: new Date(find[index].EndDatetime) > new Date() ?
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
                    DefaultUOMID: (this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') ? response.ItemDataList[0].IPDefaultUomID : response.ItemDataList[0].OPDefaultUomID,
                    medInstructionId: "",//item.medInstructionId,
                    PRNReason: "",//item.PRNReason,
                    IssueUoM: response.DefaultUOMDataaList[0].IssueUOM,
                    IssueUOMID: response.DefaultUOMDataaList[0].IssueUOMID,
                    IssueUOMValue: response.ItemDataList[0].Quantity,
                    IssueTypeUOM: itempacking[0].FromUoMID,
                    lexicomAlertIcon: '',
                    QOH: (this.selectedView.PatientType == "2"||this.selectedView.PatientType == "4") ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
                    IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
                    BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '1' ? '0' : response.ItemDataList[0].Basesolution,
                    IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '1' ? '0' : response.ItemDataList[0].IVFluidExpiry,
                    Price: response.ItemPriceDataList.length > 0 ? response.ItemPriceDataList[0].MRP : 0,
                    viewMore: false,
                  });
                }
                if (this.medicationFormContainer?.nativeElement) {
                  this.medicationFormContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              })
          }
        });
        if (duplicateItemsList != undefined && duplicateItemsList != "") {
          this.duplicateItemsList = duplicateItemsList;
          // $("#itemAlreadySelected").modal('show');
        }
        // $("#previousMedication").modal('hide');
      }
      else {
        // $("#noSelectedMedToPrescribe").modal('show');
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
    //pres.selected = !pres.selected;
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

  showMedicineHistory(item: any) {
    this.selectedHistoryItem = item;
    this.config.FetchPatientPrescibedDrugHistory(item.ItemID, this.selectedView.PatientID, this.ward.FacilityID, this.hospitalID, this.selectedView.SSN)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientPrescibedDrugHistoryDataList.length > 0) {
          this.medicineHistory = [];
          this.medicineHistory = response.FetchPatientPrescibedDrugHistoryDataList;
          this.showMedicineHistorydiv = true;
        }
      },
        (err) => {

        })
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
        // $("#activeMedicationYesNo").modal('show');
      }
      let find = this.previousMedicationListDetails.filter((x: any) => x?.ItemID === item.ItemID && x?.PrescriptionID === item.PrescriptionID);
      if (find) {
        find.forEach((element: any, index: any) => {
          find[index].isChecked = true;
        });
      }
    }
    else {
      let find = this.previousMedicationListDetails.filter((x: any) => x?.ItemID === item?.ItemID && x?.PrescriptionID === item?.PrescriptionID);
      if (find) {
        find.forEach((element: any, index: any) => {
          find[index].isChecked = false;
        });
      }
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

          //this.config.fetchItemDetails(1, 500, 3, filter, this.doctorDetails[0].EmpId, "0", this.hospitalId, this.doctorDetails[0].EmpId)
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
    this.config.fetchItemForPrescriptions(this.selectedView.PatientType, itemId, "1", this.doctorDetails[0].EmpId, this.ward.FacilityID, this.hospitalID, this.doctorDetails[0].EmpId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
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
                  QOH: (this.selectedView.PatientType == "2"||this.selectedView.PatientType == "4") ? response.ItemDefaultUOMDataList[0].IPQOH : response.ItemDefaultUOMDataList[0].OPQOH,
                  IVFluidStorageCondition: response.ItemDataList[0].IVFluidStorageCondition !== '1' ? '0' : response.ItemDataList[0].IVFluidStorageCondition,
                  BaseSolutionID: response.ItemDataList[0].BaseSolutionID !== '' ? response.ItemDataList[0].Basesolution : '',
                  IVFluidExpiry: response.ItemDataList[0].IVFluidExpiry !== '' ? response.ItemDataList[0].IVFluidExpiry : '',
                  Remarks: '',
                  Price: response.ItemPriceDataList.length > 0 ? response.ItemPriceDataList[0].MRP : 0
                })
                $('#StrengthUoM').html(response.ItemDataList[0].StrengthUoM);
                $('#IssueUoM').html(response.DefaultUOMDataaList[0].IssueUOM);
                $('#QuantityUOM').html(response.DefaultUOMDataaList[0].IssueUOM);
                $('#Dosage').html(response.ItemDataList[0].QTYUOM);
                this.listOfItems = [];
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

    //To check if selected Item already prescribed as  Discharge medications 
    const idDisMedications = this.previousMedicationList.filter((x: any) => x.IPID == this.selectedView.AdmissionID && x.ItemID == this.medicationsForm.get('ItemId')?.value && x.isDischargeMedication == 'True');
    if(idDisMedications.length > 0) {
      this.errorMessages = "Selected medication already prescribed as Discharge Medication. " + idDisMedications.map((item: any) => item.GenericItemName).join(',');
      $("#errorMsg").modal('show');
        return;
    }

    this.isMedicationFormSubmitted = true;
    var findInvalidControls = this.findInvalidControls();
    if(!this.medicationsForm.get('DiagnosisId')?.value) {
      return;
    }
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
            DiagnosisId: this.medicationsForm.get('DiagnosisId')?.value,
            DISID: this.medicationsForm.get('DiagnosisId')?.value,
            DiagnosisName: this.medicationsForm.get('DiagnosisName')?.value,
            DiagnosisCode: this.medicationsForm.get('DiagnosisCode')?.value,
            viewMore: false,
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
          find.Price = this.medicationsForm.get('Price')?.value,
          find.viewMore = this.medicationsForm.get('Remarks')?.value === '' ? false : true

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
      IVFluidExpiry: med.IVFluidExpiry,
      DiagnosisId: med.DiagnosisId,
      DISID: med.DISID,
      DiagnosisName: med.DiagnosisName,
      DiagnosisCode: med.DiagnosisCode,
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
    this.config.fetchItemForPrescriptions(this.selectedView.PatientType, med.ItemId, "1", this.doctorDetails[0].EmpId, this.ward.FacilityID, this.hospitalID, this.doctorDetails[0].EmpId)
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

  showLexicomAlerts(med: any) {
    this.lexicomInlineAlertsList = []; this.lexicomInlineAlertsListPassed = [];
    this.lexicomDrugName = med.ItemName;
    var lexicomInlineAlertsList = this.lexicomAlertsList.filter((f: any) => f.groupkey === med.ItemId);
    lexicomInlineAlertsList = Object.keys(lexicomInlineAlertsList).map((key) => [key, lexicomInlineAlertsList[key]])[0];
    var lca = Object.keys(lexicomInlineAlertsList[1].values).map((key) => [key, lexicomInlineAlertsList[1].values[key]]);
    lca?.forEach((icon: any, index: any) => {
      if (lca[index][1].Alerts.length > 0) {
        lca[index][1].Alerts.forEach((alert: any, ind: any) => {
          if (lca[index][0] != "Multiple") {
            this.lexicomInlineAlertsList.push({
              "Category": lca[index][0],
              "Text": this.lexicomAlertsWithTextList[alert].values.Text,
              "ApiName": this.lexicomAlertsWithTextList[alert].values.APIName,
              "Base64": this.lexicomAlertsWithTextList[alert].values.Icon.Base64,
              "Monograph": this.lexicomAlertsWithTextList[alert].values.Monograph,
            })
          }
        })
      }
      else {
        if (lca[index][0] != "Multiple") {
          this.lexicomInlineAlertsListPassed.push({
            "Category": lca[index][0],
            "Text": "",
            "ApiName": "",
            "Base64": lca[index][1].Base64
          })
        }
      }
    })

    $("#lexicomTooltip").modal('show');
  }
  showItemViewMore(item: any) {
    item.viewMore = !item.viewMore;
  }

  disableControls(med: any) {
    med.displayRouteDropdown = false;
    med.displayDropdown = false;
    med.displayStartDateDropdown = false;
    med.displayDuration = false;
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
  selectedHoldItem(index: any) {
    this.remarksForSelectedHoldItemName = index.ItemName;
    this.remarksSelectedIndex = index;
    this.remarksForSelectedHoldItemId = index.ItemId;
    this.remarksForSelectedHoldPrescId = index.PrescriptionID;
    this.holdReasonValidation = false;
    this.selectedHoldReason = index.PrescriptionItemsHoldReasonID;
    if (index.HoldStatus == null || index.HoldStatus == 0)
      this.holdBtnName = 'Hold';
    else
      this.holdBtnName = 'Release';
    $("#holdRem").val(index.ReasonForHolding);
  }
  clearHoldReason(rem: any) {
    rem.value = "";
    this.selectedHoldReason = "0";
  }
  holdPrescriptionItem(med: any, rem: any, btName: string) {
    if (this.selectedHoldReason != "0" && rem.value != "") {
      $("#hold_remarks").modal('hide');
      var currentDate = this.datepipe.transform(new Date(), "dd-MM-yyyy HH:MM")?.toString();
      var holdMedXml = [
        {
          "PID": this.remarksForSelectedHoldPrescId,
          "IID": this.remarksForSelectedHoldItemId,
          "ISEQ": 1,
          "REASON": " | " + this.doctorDetails[0].UserName + "  " + currentDate + " : " + rem.value,
          "HOLDSTATUS": btName == 'Hold' ? "1" : "0",
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
  selectedHoldReasonEvent(event: any) {
    this.selectedHoldReason = event.target.value;
  }
  selectedHoldReasonEvent_prev(event: any) {
    this.selectedHoldReason_prev = event.target.value;
  }

  medicationRemarksPopup(med: any, invRem: any) {
    this.remarksForSelectedMedName = med;
    $("#medication_remark").modal('show');
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
      Remarks: [''],
      DiagnosisId: '',
      DISID: '',
      DiagnosisName: [''],
      DiagnosisCode: ['']
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
    this.errorMessages = [];
    if (this.dischargeIntimationRiased) {
      this.errorMessages.push("Discharge Request already raised");
      $("#errorMsg").modal('show');
      return;
    }
    if (this.dischargeRequestForm.get('DischargeStatusID')?.value === '0') {
      this.errorMessages.push("Please select Discharge Status");
      $("#errorMsg").modal('show');
      return;
    }
    if (this.dischargeRequestForm.get('DischargeReasonID')?.value === '0') {
      this.errorMessages.push("Please select Discharge Reason");
      $("#errorMsg").modal('show');
      return;
    }
    if (this.referralList.length === 0 && !this.clinicalVisitAfter) {
      this.errorMessages.push("Please select Doctors");
      $("#errorMsg").modal('show');
      return;
    }
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
          "Pdetails": "",
          "Idetails": "",
          "UserID": this.doctorDetails[0].UserId,
          "WorkStationID": this.ward.FacilityID, //this.patientType == '2' ? this.facility.FacilityID : 0,
          "OneTimeIssue": 1,
          "STATUS": 1,
          "ScheduleID": 0,
          "IsDisPrescription": this.homeMedicationEnable ? 1 : 0,
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
          "AntiMicrobialOrderSheet": "",
          "InvestigationSchedules": "",
          "Hospitalid": this.hospitalID,
          "LexcomIntractions": "",
          "IsContrastAllergic": 0,
          "IVFDetails": "",
          "PBMJustification": "",
          "CTASScore": "0",
          "OrderPackID": "0",
          "AnaesthesiaTypes": this.homeMedicationEnable ? 0 : 1
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
      $("#noPrescriptionSelected").modal('show');
    }
  }

  UpdatePatientFitForDischarge() {
    this.errorMessages = [];
    if (this.dischargeIntimationRiased) {
      this.errorMessages.push("Dischage Request already raised");
      $("#errorMsg").modal('show');
      return;
    }
    if (this.dischargeRequestForm.get('DischargeStatusID')?.value === '0') {
      this.errorMessages.push("Please select Discharge Status");
      $("#errorMsg").modal('show');
      return;
    }
    if (this.dischargeRequestForm.get('DischargeReasonID')?.value === '0') {
      this.errorMessages.push("Please select Discharge Reason");
      $("#errorMsg").modal('show');
      return;
    }
    if (this.referralList.length === 0 && !this.clinicalVisitAfter) {
      this.errorMessages.push("Please select Doctors");
      $("#errorMsg").modal('show');
      return;
    }
    const pyld = {
      "AdmissionID": this.selectedView.AdmissionID,
      "IsFitForDischarge": true,
      "ClinicVisitAfterDays": $("#ClinicVisitAfterDays").val() ?? 0,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID,
      "Hospitalid": this.hospitalID
    };
    this.config.UpdatePatientFitForDischarge(pyld).subscribe(
      (response) => {
        if (response.Code == 200) {
          this.SaveDischargeAfterFollowUp();
        }
      },
      (err) => {
        console.log(err)
      });

  }

  SaveDischargeAfterFollowUp() {
    var pyld = {
      "DischargeAfterFollowUpID": 0,
      "PatientID": this.selectedView.PatientID,
      "Admissionid": this.selectedView.AdmissionID,
      //"ClinicVisitAfterDays": $("#ClinicVisitAfterDays").val() ?? 0,
      "IsHomeMedication": this.homeMedication,
      "Hospitalid": this.hospitalID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID,
      "BedID": this.selectedView.BedID,
      "BedTypeID": "0",
      "HospDeptId": this.ward.Hospdeptid,
      "RequestType": "7",
      "PriorityID": "0",
      "Remarks": this.dischargeRequestForm.get('Remarks')?.value,
      "ReqForDate": moment(this.dischargeRequestForm.get('DischargeDate')?.value).format('DD-MMM-YYYY') + ' ' + this.dischargeRequestForm.get('DischargeTime')?.value,
      "DischargeStatusID": this.dischargeRequestForm.get('DischargeStatusID')?.value,
      "DischargeReasonID": this.dischargeRequestForm.get('DischargeReasonID')?.value,
      "DoctorXML": !this.clinicalVisitAfter ? this.referralList.map((item: any) => {
        return {
          "DOCID": item.doctorId,
          "SPID": item.specializationId,
          "CVAD":item.ClinicalAfter,
          "SCHID":item.ScheduleID
        }
      }) : []
    }
    this.config.SaveDischargeAfterFollowUp(pyld).subscribe(
      (response) => {
        if (response.Code == 200) {
          if(this.enableSickLeave) {
            this.saveSickLeave()
          }
          $("#savePrescriptionMsg").modal('show');
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
    this.referralList=[];
    this.clinicalVisitAfter = !this.clinicalVisitAfter;
    $("#ClinicVisitAfterDays").val('0');
  }

  toggleHomeMedication(type: string) {
    this.homeMedication = type === '1' ? true : false;
    this.homeNAMedicationEnable = type === '1' ? true : false;
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

  deleteRequestConfirmation() {
    $("#deleteDisReqYesNo").modal('show');
    setTimeout(() => {
      $("#justificationremarks").focus();
    }, 500);
    
  }

  clearDischargeCancelRemarks() {
    this.dischargeCancelRemarks = "";
  }
  deleteRequest() {
    if (this.dischargeCancelRemarks === '') {
      this.dischargeRemarksValidation = true;
      return;
    }
    else {
      this.dischargeRemarksValidation = false;
    }
    var trnreqid = this.BedTransferRequestID;

    this.config.CancelbedTransferRequests(trnreqid, this.doctorDetails[0].UserId, this.ward.FacilityID, this.hospitalID).subscribe(response => {
      if (response.Code == 200) {
        this.DeleteDischargeAfterFollowUp();
        this.cancelSickLeave();
      }
    });
  }

  DeleteDischargeAfterFollowUp() {
    var payload = {
      "AdmissionID": this.selectedView.AdmissionID,
      "DiscontinuingRemarks": this.dischargeCancelRemarks,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID,
      "HospitalID": this.hospitalID
    }
    this.config.DeleteDischargeAfterFollowUp(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          $("#deleteDisReqYesNo").modal('hide');
          $("#savePrescriptionMsg").modal('show');
        } else {
        }
      },
      (err) => {
        console.log(err)
      });
  }

  fetchHospitalLocations() {
    this.config.fetchFetchHospitalLocations().subscribe((response) => {
      if (response.Status === "Success") {
        this.locationList = response.HospitalLocationsDataList;
        const res = response.HospitalLocationsDataList.filter((h: any) => h.HospitalID == this.hospitalID);
        this.locationValue = res[0].HospitalID;
      } else {
      }
    },
      () => {

      })
  }

  fetchReferalAdminMasters() {
    this.config.fetchConsulSpecialisationNew(
      'distinct SpecialiseID id,Specialisation name,Specialisation2l name2L,SpecializationCode code,blocked,Blocked BitBlocked,HospitalID HospitalID,IsPediatric',
      'IsConsPri=1 and Blocked=0 and HospitalID=' + this.hospitalID, 
       0, this.hospitalID).subscribe((response) => {
      this.SpecializationList = this.SpecializationList1 = response.FetchConsulSpecialisationDataList;
    });
  }

  locationChange(data: any) {
    const selectedItem = this.locationList.find((value: any) => value.HospitalID === Number(data.target.value));
    this.locationValue = selectedItem.HospitalID;
    this.specializationValue = '';
    $("#Doctor").val('');
    $("#Specialization").val('');
  }

  fetchSpecializationDoctorSearch() {
    this.config.FetchSpecialisationDoctorsNP('%%%', this.specializationValue.id, this.doctorDetails[0].EmpId, this.hospitalID).subscribe((response: any) => {
      if (response.Code == 200) {
        this.listOfSpecItems = this.listOfSpecItems1 = response.FetchDoctorDataList;
      }
    }, error => {
      console.error('Get Data API error:', error);
    });
  }

  searchSpecItem(event: any) {
    const item = event.target.value;
    this.SpecializationList = this.SpecializationList1;
    let arr = this.SpecializationList1.filter((spec: any) => spec.name.toLowerCase().indexOf(item.toLowerCase()) === 0);
    this.SpecializationList = arr.length ? arr : [{ name: 'No Item found' }];
  }

  searchDocItem(event: any) {
    const item = event.target.value;
    this.listOfSpecItems = this.listOfSpecItems1;
    let arr = this.listOfSpecItems1.filter((doc: any) => doc.Fullname.toLowerCase().indexOf(item.toLowerCase()) === 0);
    if (arr.length === 0) {
      arr = this.listOfSpecItems1.filter((proc: any) => proc.EmpNo.toLowerCase().indexOf(item.toLowerCase()) === 0);
    }
    this.listOfSpecItems = arr.length ? arr : [{ name: 'No Item found' }];
  }

  onSpecItemSelected(event: any) {
    const item = this.SpecializationList.find((data: any) =>  data.name === event.option.value);
    var IsAdult = true;
    if (this.selectedView.PatientType == '2'||this.selectedView.PatientType == '4') {
      IsAdult = (Number(this.selectedView.AgeValue)&& Number(this.selectedView.AgeUOMID==3))>= 14 ? true : false;
    }
    else if (this.selectedView.PatientType == '3') {
      IsAdult = Number(this.selectedView.Age.trim().split(' ')[0]) >= 14 ? true : false;
    }
    else {
      if (this.selectedView.Age.toString().trim().split(' ').length > 1) {
        const age = this.selectedView.Age?.trim().split(' ')[0];
        IsAdult = Number(age) >= 14 ? true : false;
      }
      else {
        IsAdult = Number(this.selectedView.Age) >= 14 ? true : false;
      }
    }
    if(IsAdult && item.IsPediatric === '1') {
      this.listOfSpecItems = [];
      this.errorMessages = [];
      this.errorMessages.push("Cannot select Pediatric specialisations for adults.");
      $("#errorMsg").modal('show');
      return;      
    }
    else {
      this.errorMessages = [];
      $("#errorMsg").modal('hide');
    }
    this.specializationValue = item;
    $("#Doctor").val('');
    this.fetchSpecializationDoctorSearch();
  }

  onDocItemSelected(item: any) {
      if($("#ClinicVisitAfterDays").val()=="0"){
        this.errorMessages = [];
        this.errorMessages.push("Select Clinical Visit Days from 1-14");
        $("#errorMsg").modal('show');
        return;
      }

    const isDoctorAvailable = this.referralList.find((data: any) => data.doctorId.toString() === item.Empid.toString());
    if (!isDoctorAvailable) {
      const selectedItem = this.locationList.find((value: any) => value.HospitalID === Number(this.locationValue));
      this.referralList.push({
        doctorName: item.Fullname,
        doctorId: item.Empid,
        specializationName: this.specializationValue.name,
        specializationId: this.specializationValue.id.toString(),
        SpecialiseID:this.specializationValue.id.toString(),
        hospitalName: selectedItem.Name,
        ClinicalAfter:$("#ClinicVisitAfterDays").val(),
        appointmentDate: moment(new Date().setDate(new Date().getDate() + Number($("#ClinicVisitAfterDays").val() ?? '1'))).format('DD-MMM-YYYY'),
        showDelete : true,
        DoctorID: item.Empid, 
        FollowUpDate: moment(new Date().setDate(new Date().getDate() + Number($("#ClinicVisitAfterDays").val() ?? '1'))).format('DD-MMM-YYYY'),
        SSN:this.selectedView.SSN
      });
      this.specializationValue = '';
    } else {
      this.errorMessages = [];
      this.errorMessages.push("Referral Doctor Already Added");
      $("#errorMsg").modal('show');
    }
    setTimeout(() => {
      this.listOfSpecItems = this.listOfSpecItems1 = [];
      $("#Doctor").val('');
      $("#Specialization").val('');
    });
  }

  deleteItem(item: any) {
    this.referralList = this.referralList.filter((data: any) => data.doctorId.toString() !== item.doctorId.toString());
  }
  
  FetchPatienAdmissionAgainstDischargeAfterFollowUp() {
    this.bedconfig.FetchPatienAdmissionAgainstDischargeAfterFollowUp(this.selectedView.AdmissionID, this.wardID, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {
        const reflist = response.FetchPatienAdmissionAgainstDischargeAfterFollowUpDataList;
        if(response.FetchPatienAdmissionAgainstDischargeAfterFollowUpDataList[0].ClinicVisitAfterDays!='0'){
          reflist.forEach((element: any, index: any) => {
            this.referralList.push({
              doctorName: element.DoctorName,
              doctorId: element.DoctorID,
              specializationName: element.Specialisation,
              specializationId: element.SpecialiseID,
              hospitalName: element.HospitalID === '3' ? 'NUZHA' : element.HospitalID === '2' ? 'SUWAIDI' : 'OLAYA',
              appointmentDate: element.FollowUpDate,
              ClinicalAfter: element.ClinicVisitAfterDays,
              showDelete : false,
              FollowUpDate: element.FollowUpDate,
              SpecialiseID:element.SpecialiseID,
              SSN:this.selectedView.SSN
            });
          });
        }else {
          this.clinicalVisitAfter = true;
        }
       
        
      } else {
      }
    },
      () => {

      })
  }

  openAppointment(item: any) {
    this.isOpenAppointment = false;
    setTimeout(() => {
      this.isOpenAppointment = true;
    }, 200);
    sessionStorage.setItem("dischargefollowups", JSON.stringify(item));
    this.selectedDischargeDetails = item;
    $("#modalMedication").modal('show');
  }

  close() {
    this.selectedDischargeDetails = [];
    sessionStorage.removeItem("dischargefollowups");
  }

  saveddata(data: any) {
    const index = this.referralList.findIndex((referral: any) =>
      referral.doctorId === data.doctorId &&
      referral.specializationId === data.specializationId
    );
    
    if (index !== -1) {
        this.referralList[index] = {
            ...this.referralList[index],
            ...data
        };
    }
  }

  getPatientDiagnosis() {
    this.config.FetchVisitDiagnosis(this.selectedView.AdmissionID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.visitDiagnosis = response.GetVisitDiagnosisList;
        }
      })
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

  setDiagnosisMappingValue(diag: any) {
    this.medicationsForm.patchValue({
      DiagnosisId: diag.DiseaseID,
      DiagnosisName: diag.DiseaseName,
      DiagnosisCode: diag.Code
    });
  }

  calcSickLeaveDates(event: any) {
    const noofdays = Number(event.target.value);
    var admitDate = new Date(this.selectedView.AdmitDate);
    admitDate.setDate(admitDate.getDate() + noofdays);

    this.sickLeaveDateForm.patchValue({
      sickfromdate: new Date(this.selectedView.AdmitDate),
      sicktodate: admitDate
    });
  }

  calculateSickDays() {
      let fromdate = moment(this.sickLeaveDateForm.get('sickfromdate')?.value);
      let todate = moment(this.sickLeaveDateForm.get('sicktodate')?.value);
      const diffInDays = Math.ceil(Math.abs(<any>fromdate - <any>todate) / (1000 * 60 * 60 * 24));
      this.sickLeaveDateForm.patchValue({
        sickLeaveDays : diffInDays
      })
  
    }

  saveSickLeave() {
    let payload = {
      "SickLeaveID": 0,
      "PatientID": this.selectedView.PatientID,
      "AdmissionID": this.selectedView.AdmissionID,
      "FromDate": this.datepipe.transform(this.sickLeaveDateForm.value['sickfromdate'], "dd-MMM-yyyy")?.toString(),
      "Todate": this.datepipe.transform(this.sickLeaveDateForm.value['sicktodate'], "dd-MMM-yyyy")?.toString(),
      "DoctorID": this.selectedView.ConsultantID,
      "SpecialiseID": this.doctorDetails[0].EmpSpecialisationId ?? 0,
      "Diagnosis": "",
      "Diagnosis2l": "",
      "Treatment": "",
      "Treatment2l": "",
      "Advice": "",
      "Advice2l": "",
      "BadgeNumber": "",
      "BadgeNumber2l": "",
      "PlaceOfWork": "",
      "PlaceOfWork2L": "",
      "Approvalbydirector": "",
      "Approvalbydirector2l": "",
      "Occupation": "",
      "Occupation2L": "",
      "ApplicationDate": "",
      "ReferenceNumber": "",
      "Employer": "",
      "Employer2l": "",
      "PrintType": "1",
      "HospitalID": this.hospitalID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.ward.FacilityID


    }
    this.config.saveSickLeave(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          //$("#sickLeaveSaveMsg").modal('show');
          //this.GetSavedPatientSickLeave(this.sickleaveForm.get('AdmissionID')?.value);
        } else {

        }
      },
      (err) => {
        console.log(err)
      });
  }

  getminDate() {
    return new Date(this.selectedView?.AdmitDate);
  }
  GetSavedPatientSickLeave(AdmissionID: any) {
    this.config.fetchPatientSickLeave(AdmissionID)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientSickLeaveDataList.length > 0) {
          var fd = new Date(moment(response.PatientSickLeaveDataList[0].FromDate).format('MM-DD-YYYY'));
          var td = new Date(moment(response.PatientSickLeaveDataList[0].Todate).format('MM-DD-YYYY'));
          this.sickLeaveDateForm.patchValue({
            sickfromdate: fd,
            sicktodate: td
          })
          let fromdate = moment(this.sickLeaveDateForm.get('sickfromdate')?.value).add(-1);
          let todate = moment(this.sickLeaveDateForm.get('sicktodate')?.value);
          const diffInDays = Math.ceil(Math.abs(<any>fromdate - <any>todate) / (1000 * 60 * 60 * 24));
          this.sickLeaveDateForm.patchValue({
            sickLeaveDays : diffInDays - 1
          });
          this.sickLeaveId = response.PatientSickLeaveDataList[0].SickLeaveID;
        }
      },
      (err) => {

      })  
  }
  cancelSickLeave() {
    if (this.sickLeaveId != 0) {
      this.config.cancelSickLeave(Number(this.sickLeaveId), this.doctorDetails[0].EmpId)
        .subscribe((response: any) => {
          if (response.Code == 200) {
           
          }
        },
          (err) => {

          })
    }
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