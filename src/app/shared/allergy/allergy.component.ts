import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DrugAllergy, FoodAllergy, OtherAllergy } from 'src/app/portal/patient-casesheet/prescription-interface';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from '../base.component';
declare var $: any;

@Component({
  selector: 'app-allergy',
  templateUrl: './allergy.component.html',
  styleUrls: ['./allergy.component.scss']
})
export class AllergyComponent extends BaseComponent implements OnInit {

  constructor(private fb: FormBuilder, private config: ConfigService) {
    super()
    this.allergyForm = this.fb.group({
      DrugId: ['', Validators.required],
      GenericId: ['', Validators.required],
      DrugName: ['', Validators.required],
      Severity: [0, Validators.required],
      Description: [''],
    });
  }
  rowIndex: any;
  algType: any;
  isEdit: any = false;

  drugList: DrugAllergy[] = [];
  foodList: FoodAllergy[] = [];
  otherallergyList: OtherAllergy[] = [];
  severityForFoodAllergy: any;
  allergyList: any;
  topFoodAllergyList: any;
  allergyForm!: FormGroup;
  drugAllergy!: DrugAllergy;
  recordsAddedAndRemoved: any;
  isAllergySubmitted: any;
  allergiesList: any;
  drugallergiesList: any;
  foodallergiesList: any;
  allergyType: any = 'Drug';
  isAllergy: any = false;
  errorMessage: any;
  isClearAllergyPopup = false;
  AllergyData: any;
  searchQuery: string = '';
  allergyQuery: string = '';
  @Output() dataChanged = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.fetchPatientAllergies();
  }

  close() {
    this.dataChanged.emit(false);
  }

  SaveAllergy() {
    if (this.foodList.length === 0 && this.drugList.length === 0 && this.otherallergyList.length === 0) {
      if (!this.recordsAddedAndRemoved) {
        this.isAllergySubmitted = true;
        return;
      }
    }
    else {
      if (this.foodList.length > 0) {
        let findFoodAllg = this.foodList.filter((f: any) => f.ALLERGIETYPES == '');
        if (findFoodAllg.length > 0) {
          this.severityForFoodAllergy = "Please enter severity for " + findFoodAllg[0].REMARKS;
          return;
        }
        else {
          this.severityForFoodAllergy = "";
        }
      }
    }
    let payload = {
      "PatientID": this.selectedView.PatientID,
      "IPID": this.admissionID,
      "FoodAllergies": this.foodList,
      "DrugAllergies": this.drugList,
      "OtherAllergies": this.otherallergyList,
      "ContrastAllergies": []
    };

    this.config.SaveAllergies(payload).subscribe(response => {
      this.fetchPatientAllergies();
      $("#saveAllergyMsg").modal('show');

      this.isAllergySubmitted = false;
      this.recordsAddedAndRemoved = false;
    });
  }

  deleteFoodAllergy(index: any) {
    this.foodList.splice(index, 1);
    this.recordsAddedAndRemoved = true;
  }
  deleteDrugAllergy(index: any) {
    this.drugList.splice(index, 1);
    this.recordsAddedAndRemoved = true;
  }
  deleteOtherAllergy(index: any) {
    this.otherallergyList.splice(index, 1);
    this.recordsAddedAndRemoved = true;
  }

  addDrug() {
    this.isAllergySubmitted = true;

    let find = this.drugList.filter((x: any) => x?.GENERICID == this.allergyForm.get('GenericId')?.value);
    if (find.length > 0) {
      this.errorMessage = "Duplicate Drug is not allowed";
      $("#errorMsg").modal('show');
      return;
    }

    let find1 = this.foodList.filter((x: any) => x?.REMARKS == this.allergyForm.get('DrugName')?.value);
    if (find1.length > 0) {
      this.errorMessage = "Duplicate Food is not allowed";
      $("#errorMsg").modal('show');
      return;
    }
    if (!this.allergyForm.valid || this.allergyForm.get('Severity')?.value === 0) {
      return;
    }
    // drugList
    if (this.allergyType == 'Drug') {
      let d = new DrugAllergy(this.allergyForm.get('DrugName')?.value, this.allergyForm.get('GenericId')?.value, this.today
        , "0", this.allergyForm.get('Description')?.value, this.allergyForm.get('Severity')?.value, this.allergyForm.get('DrugName')?.value);
      this.drugList.push(d);
    }
    else if (this.allergyType == 'Food') {
      let d = new FoodAllergy(this.allergyForm.get('DrugName')?.value, this.allergyForm.get('DrugId')?.value, this.today
        , "0", this.allergyForm.get('Description')?.value, this.allergyForm.get('Severity')?.value, "0");
      this.foodList.push(d);
    }

    this.isAllergySubmitted = false;

    this.resetAllergy();
  }

  resetAllergy() {
    this.allergyForm.reset({
      DrugId: '',
      GenericId: '',
      DrugName: '',
      Severity: 0,
      Description: '',
    });
  }

  ClearAllergy() {
    this.isClearAllergyPopup = true;
    this.allergyType = '';
    $("#btnFood").removeClass("btn-main-fill");
    $("#btnDrug").removeClass("btn-main-fill");
    this.fetchPatientAllergies();
    this.resetAllergy();
  }

  fetchPatientAllergies() {
    this.allergiesList = [];
    this.foodallergiesList = [];
    this.drugallergiesList = [];
    this.drugList = [];
    this.foodList = [];

    this.config.fetchPatientAllergies(this.selectedView.PatientID, this.selectedView.RegCode, this.hospitalID).subscribe((response) => {
      if (response.Status === "Success") {

        this.allergiesList = response.PatientAllergiesDataList;
        this.foodallergiesList = response.PatientFoodAllergiesDataList;
        this.drugallergiesList = response.PatientDrugAllergiesDataList;
        this.AllergyData = response.ToolTipAllergyData;
        this.drugallergiesList.forEach((element: any, index: any) => {
          let d = new DrugAllergy(element.Remark, element.GenericID, element.FromDate
            , "0", element.Description, element.AllergieTypes, element.GenericName);
          this.drugList.push(d);
        });

        this.foodallergiesList.forEach((element: any, index: any) => {
          let d = new FoodAllergy(element.Remark, element.FoodID, element.FromDate
            , "0", element.Description, element.AllergieTypes, "0");
          this.foodList.push(d);
        });

        this.fetchTopAllergySearch();
      }
    },
      (err) => {

      })
  }

  fetchTopAllergySearch() {
    this.config.fetchFoodSmartSearch('%%').subscribe((response: any) => {
      if (response.Code == 200) {
        this.topFoodAllergyList = response.GetFoodAllergiesList.sort((a: any, b: any) => a.Seq - b.Seq);
        this.topFoodAllergyList = this.topFoodAllergyList.slice(0, 5);
      }
    }, error => {
      console.error('Get Data API error:', error);
    });
  }

  allergyTypeSelection(type: any) {
    this.allergyType = type;
    this.allergyList = [];
    this.resetAllergy();
    if (type == 'Drug') {
      $("#btnDrug").addClass("btn-main-fill");
      $("#btnFood").addClass("btn-main-outline");
      $("#btnContrast").addClass("btn-main-outline");
      $("#btnOthers").addClass("btn-main-outline");

      $("#btnDrug").removeClass("btn-main-outline");
      $("#btnFood").removeClass("btn-main-fill");
      $("#btnContrast").removeClass("btn-main-fill");
      $("#btnOthers").removeClass("btn-main-fill");
    } else if (type == 'Food') {
      $("#btnDrug").addClass("btn-main-outline");
      $("#btnFood").addClass("btn-main-fill");
      $("#btnContrast").addClass("btn-main-outline");
      $("#btnOthers").addClass("btn-main-outline");

      $("#btnDrug").removeClass("btn-main-fill");
      $("#btnFood").removeClass("btn-main-outline");
      $("#btnContrast").removeClass("btn-main-fill");
      $("#btnOthers").removeClass("btn-main-fill");
    } else if (type == 'Contrast') {
      $("#btnDrug").addClass("btn-main-outline");
      $("#btnFood").addClass("btn-main-outline");
      $("#btnContrast").addClass("btn-main-fill");
      $("#btnOthers").addClass("btn-main-outline");

      $("#btnDrug").removeClass("btn-main-fill");
      $("#btnFood").removeClass("btn-main-fill");
      $("#btnContrast").removeClass("btn-main-outline");
      $("#btnOthers").removeClass("btn-main-fill");
    } else if (type == 'Others') {
      $("#btnDrug").addClass("btn-main-outline");
      $("#btnFood").addClass("btn-main-outline");
      $("#btnContrast").addClass("btn-main-outline");
      $("#btnOthers").addClass("btn-main-fill");

      $("#btnDrug").removeClass("btn-main-fill");
      $("#btnFood").removeClass("btn-main-fill");
      $("#btnContrast").removeClass("btn-main-fill");
      $("#btnOthers").removeClass("btn-main-outline");
    }
  }

  fetchAllergySearch(event: any) {
    if (event.target.value.length === 0) {
      this.allergyList = [];
    }

    if (event.target.value.length >= 3) {
      var filter = event.target.value;

      if (this.allergyType == 'Drug') {
        this.config.fetchDrugSmartSearch(filter).subscribe((response: any) => {
          if (response.Code == 200) {
            this.allergyList = response.GetDrugAllergiesList;
            //this.filterData();
          }
        }, error => {
          console.error('Get Data API error:', error);
        });
      }
      else if (this.allergyType == 'Food') {
        this.config.fetchFoodSmartSearch(filter).subscribe((response: any) => {
          if (response.Code == 200) {
            this.allergyList = response.GetFoodAllergiesList;
            //this.filterData();
          }
        }, error => {
          console.error('Get Data API error:', error);
        });
      }

    }
  }

  editAllergy(item: any, row: any, type: any) {
    this.rowIndex = row;
    this.algType = type;
    this.isEdit = true;
    this.severityForFoodAllergy = "";
    if (type === "F") {
      this.allergyForm.patchValue({
        DrugId: item.FOODID,
        DrugName: item.REMARKS,
        Severity: item.ALLERGIETYPES,
        Description: item.DSC,
      });
    }
    if (type === "D") {
      this.allergyForm.patchValue({
        GenericId: item.GENERICID,
        DrugName: item.DrugName,
        Severity: item.ALLERGIETYPES,
        Description: item.DSC,
      });
    }
  }

  updateAllergy() {

    if (this.algType === "D") {
      let find = this.drugList.filter((x: any, index: number) => {
        return index !== this.rowIndex && x?.GENERICID === this.allergyForm.get('GenericId')?.value;
      });
      if (find.length > 0) {
        this.errorMessage = "Duplicate Drug is not allowed";
        $("#errorMsg").modal('show');
        return;
      }
      this.drugList[this.rowIndex].DrugName = this.allergyForm.get('DrugName')?.value;
      this.drugList[this.rowIndex].GENERICID = this.allergyForm.get('GenericId')?.value;
      this.drugList[this.rowIndex].DSC = this.allergyForm.get('Description')?.value;
      this.drugList[this.rowIndex].ALLERGIETYPES = this.allergyForm.get('Severity')?.value;
    }
    else {

      if (this.allergyForm.get('Severity')?.value == "") {
        this.isAllergySubmitted = true;
        return;
      }
      else {
        this.isAllergySubmitted = false;
      }
      let find1 = this.foodList.filter((x: any, index: number) => {
        return index !== this.rowIndex && x?.REMARKS === this.allergyForm.get('DrugName')?.value;
      });

      if (find1.length > 0) {
        this.errorMessage = "Duplicate Food is not allowed";
        $("#errorMsg").modal('show');
        return;
      }
      this.foodList[this.rowIndex].REMARKS = this.allergyForm.get('DrugName')?.value;
      this.foodList[this.rowIndex].FOODID = this.allergyForm.get('DrugId')?.value;
      this.foodList[this.rowIndex].DSC = this.allergyForm.get('Description')?.value;
      this.foodList[this.rowIndex].ALLERGIETYPES = this.allergyForm.get('Severity')?.value;
    }
    this.resetAllergy();
    this.isEdit = false;
  }

  trimSpaces(name: string): string {
    return name.trim().replace(/\s/g, '');
  }

  addFavAllergy(selectedAllergy: any) {

    this.topFoodAllergyList.forEach((element: any, index: any) => {
      $("#btntop_" + this.trimSpaces(element.name)).removeClass("btn-main-fill btn-main-outline");
      $("#btntop_" + this.trimSpaces(element.name)).addClass("btn-main-outline");
    });

    $("#btntop_" + this.trimSpaces(selectedAllergy.name)).addClass("btn-main-fill");

    let find = this.foodList.filter((x: any) => x?.REMARKS.trim() == selectedAllergy.name.trim());
    if (find.length > 0) {
      this.errorMessage = "Duplicate Food is not allowed";
      $("#errorMsg").modal('show');
      return;
    }
    // let d = new FoodAllergy(selectedAllergy.name, selectedAllergy.id, this.todayDate
    //     , "0", '', '', "0");    
    //   this.foodList.push(d);

    this.allergyForm.patchValue({
      DrugName: selectedAllergy.name,
      DrugId: selectedAllergy.id,
      GenericId: selectedAllergy.id
    });
  }

  selectAllergyItem(item: any) {
    this.allergyQuery = item.name;

    this.allergyForm.patchValue({
      DrugName: item.name,
      DrugId: item.id,
      GenericId: item.id
    });

    this.allergyList = [];
  }

}
