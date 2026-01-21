import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Subject, debounceTime } from 'rxjs';
import { ConfigService } from 'src/app/services/config.service';
declare var $: any;

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.scss']
})
export class DiagnosisComponent implements OnInit {
  diagnosis!: FormGroup;
  langData: any;
  selectedData: any[] = [];
  diagDetails: any = [];
  favDetailsList: any[] = [];
  selectedDiagnosis: any = [];
  selectedDiagnosisFromChild: any = [];
  isSeletedRowData = true;
  doctorDetails: any;
  selectedView: any;
  selectedCard: any;
  doctorID: any;
  OPConsultationID: any;
  PatientID: any;
  AdmissionID: any;
  hospId: any;
  selectedPatientAdmissionId: any;
  searchQuery: string = '';
  listOfItems: any;
  remarksSelectedIndex: any;
  remarkForm: any;
  filteredData: any[] = [];
  isSubmitted: any = false;
  showChildComponent = false;
  isSelctedRow = true;
  todayDate: any;
  prevPaitentData: any
  feth: any;
  episodeId: any;
  VisitID: any;
  MonitorID: any;
  selectedPrevDiagnosis: any = [];
  isClear: any = true;
  errorMessage: any;
  favDiag: any = [];
  showPreValidation: any = false;
  showFavValidation: any = false;
  endofEpisode: boolean = false;
  initialvalues: any;
  pendingChanges = false;
  afterFetch = false;
  typeSelected: boolean = true;
  SavedChiefComplaints: any;
  @Output() pending = new EventEmitter<any>();
  @Output() savechanges = new EventEmitter<any>();
  ReferralDiagnosis: any;
  showReferralDiagMsg = false;

  get items(): FormArray {
    return this.diagnosis.get('items') as FormArray;
  }
  private searchInput$ = new Subject<string>();
  timeout = 1000;

  initializeItem() {
    this.diagnosis = this.fb.group({
      ItemCode: [null, Validators.required],
      ItemName: [null, Validators.required],
      ItemID: [null, Validators.required],
      DiagnosisType: [null, Validators.required],
      Type: [null, Validators.required],
      IsExisting: [null, Validators.required],
      MNID: [null, Validators.required],
      Remarks: [null],
      BLK: [null],
      IsFav: ['']
    });

    this.items.push(this.diagnosis);
    this.initialvalues = this.diagnosis.value;
  }

  addItem(element: any) {
    const itemExists = this.items.controls.some((it) => it.value.ItemCode === element.DCode);
    if (!itemExists) {
      const itemFormGroup = this.fb.group({
        ItemCode: element.DCode,
        ItemName: element.DiseaseName,
        ItemID: element.DID,
        DiagnosisType: element.DTY,
        Type: element.DTID,
        IsExisting: element.IsExisting,
        MNID: element.MNID,
        Remarks: element.Remarks,
        IsFav: element.IsFav,
        BLK: 0,
        DOCID: element.DOCID,
        SPID: element.SPID,
        UID: element.UID,
        IsPostDiag: element.IsPostDiag
      })
      this.items.push(itemFormGroup);
    }
    else {
      this.errorMessage = "Duplicate diagnosis is not allowed";
      $("#errorDiagnosisMessage").modal('show');
    }



  }

  constructor(private fb: FormBuilder, private config: ConfigService, private router: Router, public datepipe: DatePipe, private changeDetectorRef: ChangeDetectorRef) {
    this.remarkForm = this.fb.group({
      Remarks: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.langData = this.config.getLangData();
    if (sessionStorage.getItem("ISEpisodeclose") === "true") {
      this.endofEpisode = true;
    } else {
      this.endofEpisode = false;
    }
    this.hospId = sessionStorage.getItem("hospitalId");
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.doctorID = this.doctorDetails[0].EmpId;
    this.selectedPatientAdmissionId = sessionStorage.getItem("selectedPatientAdmissionId");

    this.todayDate = moment(new Date()).format('MM-DD-YYYY');
    /**
     * @ this 68 line i'm geeting local storage data which i select 
     */
    this.selectedCard = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.OPConsultationID = this.selectedView.OPConsultationID;
    this.PatientID = this.selectedView.PatientID;
    this.AdmissionID = this.selectedView.AdmissionID;
    this.doctorID = this.doctorDetails[0].EmpId;
    this.MonitorID = this.selectedView.MonitorID;
    this.selectedPatientAdmissionId = sessionStorage.getItem("selectedPatientAdmissionId");
    this.episodeId = this.selectedView.EpisodeID;
    this.VisitID = this.selectedView.AdmissionID;

    this.diagnosis = this.fb.group({
      items: this.fb.array([]) // FormArray for storing the dropdown items
    });
    //this.FetchPatientChiefComplaintAndExaminations();
    this.saveDiagnosisAfter();
    this.fetchFavDoctor();
    this.getPaitentrowData();

    this.diagnosis.valueChanges.subscribe(() => {
      if (this.afterFetch) {
        this.detectChanges();
      }
    });

    this.initializeSearchListener();
    this.ReferralDiagnosis = JSON.parse(sessionStorage.getItem("ReferralDiagnosis") || '{}');
    if (this.ReferralDiagnosis?.length > 0) {
      this.showReferralDiagMsg = true;
      this.ReferralDiagnosis.forEach((item: any, index: any) => {
        const itemFormGroup = this.fb.group({
          ItemCode: item.Code,
          ItemName: item.DiseaseName,
          ItemID: item.DiseaseID,
          DiagnosisType: item.DiagnosisType,
          Type: item.DiagonosisTypeID,
          IsExisting: 0,
          MNID: 0,
          Remarks: "",
          IsFav: item.IsFav,
          BLK: 0,
          DOCID: this.doctorDetails[0].EmpId,
          SPID: this.selectedView.SpecialiseID,
          UID: this.doctorDetails[0].UserId,
          IsPostDiag: 0,
        });
        this.items.push(itemFormGroup);
      });
    }
  }

  detectChanges() {
    const currentFormValue = this.diagnosis.value;
    const changesDetected = !this.isEqual(currentFormValue, this.initialvalues);

    if (changesDetected) {
      this.pendingChanges = true;
      this.pending.emit(true);
    }
  }

  isEqual(objA: any, objB: any): boolean {
    return JSON.stringify(objA) === JSON.stringify(objB);
  }

  getPaitentrowData() {
    this.config.getPrivewsPainent(this.episodeId || 0, this.VisitID || 0, this.MonitorID || 0, this.doctorDetails[0].EmpId).subscribe(res => {
      this.prevPaitentData = res
      this.feth = (this.prevPaitentData.FetchPrevVisitDiagnosisDataList || '{}')
    })
  }

  postData() {
    this.selectedData = this.favDetailsList.filter(row => row.selected);
    let duplicateDia = 0;
    if (this.selectedData.length == 0) {
      this.showFavValidation = true;
      return;
    }

    this.selectedData.forEach((element: any, index: any) => {
      const itemExists = this.items.controls.some((it) => it.value.ItemCode === element.DiseaseCode);
      if (!itemExists) {
        const itemFormGroup = this.fb.group({
          ItemCode: element.DiseaseCode,
          ItemName: element.DiseaseName,
          ItemID: element.DiseaseID,
          DiagnosisType: 1,
          Type: 2,
          IsExisting: 0,
          MNID: 0,
          Remarks: "",
          IsFav: element.IsFav,
          BLK: 0,
          DOCID: this.doctorDetails[0].EmpId,
          SPID: this.selectedView.SpecialiseID,
          UID: this.doctorDetails[0].UserId,
          IsPostDiag: 0,
        })

        this.items.push(itemFormGroup);
      }
      else {
        duplicateDia = 1;
      }
    });

    if (duplicateDia > 0) {
      this.errorMessage = "Duplicate diagnosis is not allowed";
      $("#errorDiagnosisMessage").modal('show');
    }
    $("#otpMsg").modal('hide');
  }

  saveDiagnosisData() {
    this.selectedDiagnosis = [];
    if (this.diagnosis.value.items.length != 0) {
      let primaryCount = 0;
      this.diagnosis.value.items.forEach((element: any) => {
        if (element.Type == 1 && element.BLK == 0) {
          primaryCount = primaryCount + 1;
          if (element.Type == "" || element.Type == undefined)
            this.typeSelected = false;
        }

        this.selectedDiagnosis.push({
          DID: element.ItemID,
          //DISEASENAME: element.ItemName,
          //CODE: element.ItemCode,
          DTY: element.DiagnosisType,
          UID: element.UID,
          DOCID: element.DOCID,
          SPID: element.SPID,
          ISEXISTING: element.IsExisting,
          PPID: "0",
          //STATUS: element.DiagnosisType == 1 ? "Provisional" : "Final",
          DTID: element.Type,
          //DIAGNOSISTYPEID: element.Type == 1 ? "Primary" : "Secondary",
          ISPSD: 0,
          REMARKS: element.Remarks,
          MNID: element.MNID,
          IAD: 0,
          BLK: element.BLK,
          IsPostDiag: element.IsPostDiag,
        })
      });

      if (primaryCount == 0) {
        this.errorMessage = "Please select atleast one primary Diagnosis";
        $("#errorDiagnosisMessage").modal('show');
        return;
      }
      else if (primaryCount > 1) {
        this.errorMessage = "Only one primary Diagnosis should be selected";
        $("#errorDiagnosisMessage").modal('show');
        return;
      }

      let payload = {
        "OPConsultationID": this.selectedView.PatientType == '2' || this.selectedView.PatientType == '3' ? this.selectedView.ConsultantID : this.selectedView.OPConsultationID,
        "intMonitorID": this.selectedDiagnosis[0].MNID == null ? "0" : this.selectedDiagnosis[0].MNID, //this.selectedView.MonitorID,       
        "PatientID": this.selectedView.PatientID,
        "DoctorID": (this.selectedView.PatientType == '2' || this.selectedView.PatientType == '3') ? this.selectedView.ConsultantID : this.selectedView.DoctorID,
        "IPID": this.selectedPatientAdmissionId,
        "SpecialiseID": this.selectedView.SpecialiseID,
        "PatientType": this.selectedView.PatientType,
        "BillID": (this.selectedView.PatientType == '2' || this.selectedView.PatientType == '3') ? 0 : this.selectedView.BillID,
        "USERID": this.doctorDetails[0].UserId,
        "DiagDetailsList": this.selectedDiagnosis,
        "Hospitalid": this.hospId
      }

      this.config.saveDiagnosis(payload).subscribe((response) => {
        $("#saveDiagnosisMsg1").modal('show');
        sessionStorage.removeItem("ReferralDiagnosis");
        this.showReferralDiagMsg = false;
        setTimeout(() => {
          $("#saveDiagnosisMsg1").modal('hide');
          this.SaveData();
        }, 1000)
        this.items.clear();
        //this.saveDiagnosisAfter();
      }, error => {
        console.error('Save API error:', error);
      });
    }
    else {
      $("#showDiagnosisValidationMsg").modal('show');
    }
  }

  SaveData() {
    this.pendingChanges = false;
    this.pending.emit(false);
    this.savechanges.emit('Diagnosis');
  }
  saveDiagnosisAfter() {
    this.config.saveDiagnosisAftersave(this.selectedPatientAdmissionId).subscribe((data: any) => {
      // this.favNewDetailListData = data.FetchDiagnosisList;
      if (data.Code === 200 && data.FetchDiagnosisList.length > 0) {
        this.selectedData = [];

        data.FetchDiagnosisList.forEach((element: any, index: any) => {
          this.addItem(element);
        });

        this.initialvalues = this.diagnosis.value;
        this.afterFetch = true;
      }
      else {
        if (this.selectedView.PatientType === '2') {
          this.config.FetchAdviceOPDiagnosis(this.selectedPatientAdmissionId, this.hospId).subscribe((data: any) => {
            if (data.Code === 200 && data.PatientDiagnosisDataList.length > 0) {
              data.PatientDiagnosisDataList.forEach((item: any, index: any) => {
                const itemFormGroup = this.fb.group({
                  ItemCode: item.Code,
                  ItemName: item.DiseaseName,
                  ItemID: item.DiseaseID,
                  //DiagnosisType: item.DIAGNOSISTYPEID,
                  DiagnosisType: item.DTY,
                  Type: item.DTID,
                  IsExisting: 0,
                  MNID: 0,
                  Remarks: "",
                  IsFav: 0,
                  BLK: 0,
                  DOCID: this.doctorDetails[0].EmpId,
                  SPID: this.selectedView.SpecialiseID,
                  UID: this.doctorDetails[0].UserId,
                  IsPostDiag: 0,
                });
                this.items.push(itemFormGroup);
              });
            }
          });
        }
      }

    }, error => {
      console.error('Get Data API error:', error);
    });

  }

  get addDynamicRow() {
    return this.diagnosis.get('diagnosisList') as FormArray;
  }

  selectItem(item: any) {
    this.searchQuery = item.Name;
    this.listOfItems = [];
    const itemExists = this.items.controls.some((it) => it.value.ItemID === item.itemid);
    if (!itemExists) {
      const itemFormGroup = this.fb.group({
        ItemCode: item.itemCode,
        ItemName: item.Name,
        ItemID: item.itemid,
        DiagnosisType: 1,
        Type: 2,
        IsExisting: 0,
        MNID: 0,
        Remarks: "",
        IsFav: item.IsFav,
        BLK: 0,
        DOCID: this.doctorDetails[0].EmpId,
        SPID: this.selectedView.SpecialiseID,
        UID: this.doctorDetails[0].UserId,
        IsPostDiag: 0,
      })
      this.items.push(itemFormGroup);
    }
    else {
      this.errorMessage = "Duplicate diagnosis is not allowed";
      $("#errorDiagnosisMessage").modal('show');
    }
    // this.selectedData.push(item);
    // let find = this.selectedData.filter((x: any) => x?.itemid === item.itemid);
    // find[0].DiagnosisRemarks = 1;
    // find[0].DiagnosisType = 1;
  }
  selectedDiagnosisType(event: any, selectDiagnosis: any) {
    let find = this.selectedData.filter((x: any) => x?.itemid === selectDiagnosis.itemid);
    find[0].DiagnosisType = event.target.value;
  }
  selectedDiagnosisPriSec(event: any, selectDiagnosis: any) {
    let find = this.selectedData.filter((x: any) => x?.itemid === selectDiagnosis.itemid);
    find[0].DiagnosisRemarks = event.target.value;
  }
  initializeSearchListener() {
    this.searchInput$
      .pipe(
        debounceTime(this.timeout)
      )
      .subscribe(filter => {
        if (filter.length >= 3) {
          this.config.fetchDiagnosisSmartSearch(filter, this.doctorDetails[0].EmpId).subscribe((response: any) => {
            if (response.Code == 200) {
              this.listOfItems = response.FetchDiagnosisSmartDataList;
              this.filterData();
            }
          }, error => {
            console.error('Get Data API error:', error);
          });
        } else {
          this.listOfItems = [];
        }
      });
  }


  fetchDiagnosisSearch(event: any) {
    const inputValue = event.target.value;
    this.searchInput$.next(inputValue);
  }

  filterData() {
    if (this.searchQuery) {
      this.filteredData = this.listOfItems.filter((item: any) => item.Name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    } else {
      this.filteredData = this.listOfItems;
    }
  }

  openRemarks(info: any) {
    this.isSubmitted = true;
    this.remarksSelectedIndex = info;
    this.remarkForm.get('Remarks').setValue(this.items.at(info).get('Remarks')?.value || "");
    this.remarkForm.reset();
    this.isSubmitted = false;
    $('#diagnosisComments1').modal('show');
  }

  deleteItem(item: any) {
    item.get('BLK').setValue(1);
  }

  SaveRemarks() {
    this.isSubmitted = true;
    if (this.remarkForm.valid) {
      this.items.at(this.remarksSelectedIndex).get('Remarks')?.setValue(this.remarkForm.get('Remarks').value); $('#diagnosisComments1').modal('hide');
    }
  }

  onIDCSelect(value: any) {
    this.selectedDiagnosisFromChild = value;
    let duplicateDia = 0;
    this.selectedDiagnosisFromChild.forEach((element: any, index: any) => {
      const itemExists = this.items.controls.some((it) => it.value.ItemCode === element.itemCode);

      if (!itemExists) {
        const itemFormGroup = this.fb.group({
          ItemCode: element.itemCode,
          ItemName: element.ItemName,
          ItemID: element.itemid,
          DiagnosisType: 1,
          Type: 2,
          IsExisting: 0,
          MNID: 0,
          Remarks: "",
          IsFav: element.IsFav,
          BLK: 0,
          DOCID: this.doctorDetails[0].EmpId,
          SPID: this.selectedView.SpecialiseID,
          UID: this.doctorDetails[0].UserId,
          IsPostDiag: 0,
        })

        this.items.push(itemFormGroup);
      }
      else {
        duplicateDia = 1;
      }

    });

    if (duplicateDia > 0) {
      this.errorMessage = "Duplicate diagnosis is not allowed";
      $("#errorDiagnosisMessage").modal('show');
    }
    $("#modalIDCSearch1").modal('hide');
  }

  openIDCSearch() {
    $("#modalIDCSearch1").modal('show');
    if (this.showChildComponent) {
      this.showChildComponent = false;
    }
    this.changeDetectorRef.detectChanges();
    this.showChildComponent = true;
  }

  fetchFavDoctor() {
    this.config.fetchFavDoctorDiagnosis(this.doctorID).subscribe((response) => {
      this.favDetailsList = response.DoctorFavDiagnosisDataList;
    },
      (err) => {

      })
  }
  closeToastr() {
    // $("#otpMsg").modal('hide');
    this.clearFreqUsed();
    //this.selectedData.forEach(row => row.selected = false);

  }

  openModal() {
    $('#otpMsg').modal('show');
    this.clearFreqUsed();
  }

  openPrevModal() {
    $('#previousDiagnosis1').modal('show');
  }

  clearFreqUsed() {
    this.favDetailsList.forEach((element: any, index: any) => {
      element.selected = false;
    });
  }

  selectedRow(item: any) {
    const selectedItem = this.favDetailsList.find((value) => value.DiseaseID === item);
    if (selectedItem) {
      selectedItem.selected = !selectedItem.selected;
    }
    this.isSelctedRow = false;

    if (this.favDetailsList.length > 0) {
      this.showFavValidation = false;
    }
  }

  selectedPreviousDiagnosis(item: any) {
    item.active = !item.active;
    if (!this.selectedPrevDiagnosis.includes(item.DiseaseID)) {
      this.selectedPrevDiagnosis.push(item.DiseaseID);
    } else {
      const existingIndex = this.selectedPrevDiagnosis.indexOf(item.DiseaseID);
      this.selectedPrevDiagnosis = this.selectedPrevDiagnosis.slice(0, existingIndex);
    }

    if (this.selectedPrevDiagnosis.length > 0) {
      this.showPreValidation = false;
    }

  }

  clearPreviousDiagnosis() {
    this.selectedPrevDiagnosis = [];
    this.isClear = false;
    setTimeout(() => {
      this.isClear = true;
    }, 0);

  }

  selectPreviousDiagnosis() {
    if (this.selectedPrevDiagnosis.length == 0) {
      this.showPreValidation = true;
      return;
    }

    let fetchRow: any = [];
    let duplicateDia = 0;
    this.selectedPrevDiagnosis.forEach((element: any, index: any) => {
      fetchRow = this.feth.filter((row: any) => row.DiseaseID == element);
      const itemExists = this.items.controls.some((it) => it.value.ItemCode === fetchRow[0].Codes);

      if (!itemExists) {
        const itemFormGroup = this.fb.group({
          ItemCode: fetchRow[0].Codes,
          ItemName: fetchRow[0].DiseaseName,
          ItemID: fetchRow[0].DiseaseID,
          DiagnosisType: fetchRow[0].DiagnosisType,
          Type: 2,
          IsExisting: 0,
          MNID: 0,
          Remarks: "",
          IsFav: fetchRow[0].IsFav,
          BLK: 0,
          DOCID: this.doctorDetails[0].EmpId,
          SPID: this.selectedView.SpecialiseID,
          UID: this.doctorDetails[0].UserId,
          IsPostDiag: 0,
        })

        this.items.push(itemFormGroup);
      }
      else {
        duplicateDia = 1;
      }
    });

    if (duplicateDia > 0) {
      this.errorMessage = "Duplicate diagnosis is not allowed";
      $("#errorDiagnosisMessage").modal('show');
    }
    this.clearPreviousDiagnosis();
    $("#previousDiagnosis1").modal('hide');
  }

  clearDiagnosis() {
    this.pendingChanges = false;
    this.pending.emit(false);
    this.afterFetch = false;
    this.items.clear();
    this.saveDiagnosisAfter();
  }
  saveFavouriteDiagnosis(diag: any) {
    this.favDiag.push({
      "ISQ": 0, "DID": diag.controls.ItemID.value, "DIC": diag.controls.ItemCode.value, "DNAME": diag.controls.ItemName.value
    })
    let payload = {
      "EmpID": this.doctorDetails[0].EmpId,
      "SpecilizationID": this.doctorDetails[0].EmpSpecialisationId,
      "ActionType": "1",
      "PDetails": [],
      "IDetails": [],
      "DDetails": [],
      "DADetails": this.favDiag
    }
    this.config.saveFavouriteProcedure(payload).subscribe(
      (response) => {
        if (response.Code == 200) {
          diag.controls.IsFav.value = diag.controls.IsFav.value === 1 ? 0 : 1
        }
      },
      (err) => {
        console.log(err)
      });
    this.favDiag = [];
  }

  FetchPatientChiefComplaintAndExaminations() {

    this.config.FetchPatientChiefComplaintAndExaminations(this.selectedPatientAdmissionId, this.doctorDetails[0].UserId, '3403', this.hospId)
      .subscribe((response: any) => {
        if (response.FetchPatientChiefComplaintAndExaminationsDataaList.length > 0) {
          this.SavedChiefComplaints = response.FetchPatientChiefComplaintAndExaminationsDataaList;
        }
        else {
          $("#errorChiefComplaintsMsg1").modal('show');
        }
      },
        (err) => {
        })
  }
  RedirectToAssessments() {
    this.savechanges.emit('Clinical Conditions');
  }

  selectDiagnosisType(val: number, index: any) {
    this.items.at(index).get('DiagnosisType')?.setValue(val);
  }

  selectType(val: number, index: any) {
    this.items.at(index).get('Type')?.setValue(val);
  }

  selectPrePostType(val: number, index: any) {
    this.items.at(index).get('IsPostDiag')?.setValue(val);
  }
}
