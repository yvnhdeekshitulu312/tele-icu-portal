import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/shared/utility.service';
import { ConfigService } from 'src/app/services/config.service';

declare var $: any;

@Component({
  selector: 'app-bedsboard-features-config',
  templateUrl: './bedsboard-features-config.component.html',
  styleUrls: ['./bedsboard-features-config.component.scss']
})
export class BedsboardFeaturesConfigComponent implements OnInit {
  langData: any;
  hospitalID: any;
  configType = 1;
  medicalType = 0;
  bedsBoardFeaturesList: any = [];
  savedbedsBoardFeaturesList: any = [];
  errorMessages: any[] = [];
  doctorDetails: any;
  SpecializationList: any;
  SpecializationList1: any;
  specializationAssessments: any = [];
  selectedSpecialisation: any;
  savedSpecialisationAssessmentsList: any = [];
  selectedSpecName = "";

  selectAll: boolean = false;

  constructor(private us: UtilityService) {
    this.langData = JSON.parse(sessionStorage.getItem("langData") || '{}');
    this.hospitalID = sessionStorage.getItem("hospitalId");
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
  }

  ngOnInit(): void {
    this.fetchBedsBoardConfigValues();
  }

  selectMedicalType(type: number) {
    this.clear();
    this.medicalType = type;
    this.FetchMedicalTypeBedsBoardConfigurations();
  }

  selectConfigType(type: number) {
    this.selectAll = false;
    this.configType = type;
    if (type == 2) {
      this.savedbedsBoardFeaturesList = [];
      this.fetchSpecialisations();
    }
    else
      this.FetchMedicalTypeBedsBoardConfigurations();
  }

  fetchBedsBoardConfigValues() {
    this.us.get(`FetchBedsBoardConfigValues?WorkStationID=3441&HospitalID=${this.hospitalID}`).subscribe((response: any) => {
      if (response.Code === 200) {
        this.bedsBoardFeaturesList = response.FetchBedsBoardConfigValuesDataList;
        this.bedsBoardFeaturesList.forEach((element: any, index: any) => {
          element.selected = false;
        });
        //this.FetchMedicalTypeBedsBoardConfigurations();
      }
    }, () => {

    });
  }

  selectFeature(item: any) {
    item.selected = !item.selected;
  }

  saveConfig() {
    if(this.configType === 1) {
      this.saveMedTypeConfig();
    }
    else if(this.configType === 2) {
      this.saveSpecConfig();
    }
    
  }

  saveMedTypeConfig() {
    this.errorMessages = [];
    const selectedBbFeatures = this.bedsBoardFeaturesList.filter((x: any) => x.selected === true);
    if (selectedBbFeatures.length === 0) {
      this.errorMessages.push("Please select features to save");
    }
    if (this.errorMessages.length > 0) {
      $("#errorMessage").modal('show');
      return;
    }
    // var medTypexml: any[] = [];
    // selectedBbFeatures.forEach((element: any, index: any) => {
    //   medTypexml.push({
    //     "BCONID": element.BedsConfigValueID
    //   })
    // });
    const medTypexml = selectedBbFeatures.map((element: any) => {
      return {
        "BCONID": element.BedsConfigValueID
      }
    });
    var payload = {
      "MedicalTypeID": this.medicalType,
      "MedicalTypeXML": medTypexml,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.doctorDetails[0].FacilityId,
      "HospitalID": this.hospitalID
    }
    this.us.post('SaveMedicalTypeBedsBoardConfigurations', payload).subscribe((response: any) => {
      if (response.Code === 200) {
        $('#successMessage').modal('show');
        this.clear();
        this.FetchMedicalTypeBedsBoardConfigurations();
      }
    }, () => {

    });
  }

  FetchMedicalTypeBedsBoardConfigurations() {
    this.us.get(`FetchMedicalTypeBedsBoardConfigurations?MedicalType=${this.medicalType}&WorkStationID=3441&HospitalID=${this.hospitalID}`).subscribe((response: any) => {
      if (response.Code === 200) {
        this.savedbedsBoardFeaturesList = response.FetchMedicalTypeBedsBoardConfigurationsDataList;
        this.savedbedsBoardFeaturesList.forEach((element: any, index: any) => {
          var findFeature = this.bedsBoardFeaturesList.find((x: any) => x.BedsConfigValueID.toString() === element.BedsConfigValueID.toString());
          findFeature.selected = true;
        });
      }
    }, () => {

    });
  }

  fetchSpecialisations() {
    this.us.get(`FetchConsulSpecialisationT?HospitalID=${this.hospitalID}`).subscribe((response: any) => {
      if (response.Code === 200) {
        this.SpecializationList = this.SpecializationList1 = response.FetchConsulSpecialisationDataList;
        this.FetchClinicalTemplatesA();
      }
    }, () => {

    });
  }

  searchSpecItem(event: any) {
    const item = event.target.value;
    this.SpecializationList = this.SpecializationList1;
    let arr = this.SpecializationList1.filter((spec: any) => spec.name.toLowerCase().indexOf(item.toLowerCase()) === 0);
    this.SpecializationList = arr.length ? arr : [{ name: 'No Item found' }];
  }

  onSpecItemSelected(event: any) { 
    this.selectAll = false;
    const item = this.SpecializationList.find((data: any) =>  data.name === event.option.value);
    this.selectedSpecName = item.name;
    this.selectedSpecialisation = item;
    this.FetchMapClinicalTemplateSpecializations();
  }

  FetchClinicalTemplatesA() {
    this.us.get(`FetchClinicalTemplatesA?UserID=${this.doctorDetails[0].UserId}&WorkStationID=3441&HospitalID=${this.hospitalID}`).subscribe((response: any) => {
      if (response.Code === 200) {
        this.specializationAssessments = response.FetchClinicalTemplatesNList;
        this.specializationAssessments.forEach((element: any, index: any) => {
          element.selected = false;
        });
      }
    }, () => {

    });
  }

  selectAssessment(asmnt: any) {
    asmnt.selected = !asmnt.selected;
  }

  saveSpecConfig() {
    this.errorMessages = [];
    const selectedspecFeatures = this.specializationAssessments.filter((x: any) => x.selected === true);
    if (selectedspecFeatures.length === 0) {
      this.errorMessages.push("Please select assessments to save");
    }
    if(!this.selectedSpecialisation) {
      this.errorMessages.push("Please select specialisation to save");
    }
    if (this.errorMessages.length > 0) {
      $("#errorMessage").modal('show');
      return;
    }
    const MapCTSpecializationXML = selectedspecFeatures.map((element: any) => {
      return {
        "SPID" : this.selectedSpecialisation.id,
        "CTID": element.ClinicalTemplateID
      }
    });
    // var medTypexml: any[] = [];
    // selectedBbFeatures.forEach((element: any, index: any) => {
    //   medTypexml.push({
    //     "BCONID": element.BedsConfigValueID
    //   })
    // });
    const payload = {
      MapCTSpecializationXML,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.doctorDetails[0].FacilityId,
      "HospitalID": this.hospitalID
    }
    this.us.post('SaveClinicalTemplateSpecializations', payload).subscribe((response: any) => {
      if (response.Code === 200) {
        $('#successMessage').modal('show');
        this.clear();
        this.FetchMapClinicalTemplateSpecializations();
      }
    }, () => {

    });
  }

  FetchMapClinicalTemplateSpecializations() {
    this.us.get(`FetchMapClinicalTemplateSpecializations?SpecialiseID=${this.selectedSpecialisation.id}&WorkStationID=3441&HospitalID=${this.hospitalID}`).subscribe((response: any) => {
      if (response.Code === 200) {
        this.savedSpecialisationAssessmentsList = response.FetchMapClinicalTempSpecDataList;
        this.specializationAssessments.forEach((element: any) => {
          element.selected = false;
        });
        this.savedSpecialisationAssessmentsList.forEach((element: any, index: any) => {
          var findSpecAsmnts = this.specializationAssessments.find((x: any) => x.ClinicalTemplateID.toString() === element.ClinicalTemplateID.toString());
          if(findSpecAsmnts) {
            findSpecAsmnts.selected = true;
          }
        });        
      }
    }, () => {

    });
  }

  clear() {
    //this.configType = 1;
    
    if(this.configType === 1) {
      this.medicalType = 0;
      this.fetchBedsBoardConfigValues();
    }
    else if(this.configType === 2) {
      this.fetchSpecialisations();
    }
    this.errorMessages = [];
    this.selectedSpecialisation = "";
    $("#Specialization").val('');
    this.selectAll = false;
  }

  selectAllItems() {
    this.selectAll = !this.selectAll;
    if (this.configType === 1) {
      this.bedsBoardFeaturesList.forEach((item: any) => item.selected = this.selectAll);
    } else {
      this.specializationAssessments.forEach((item: any) => item.selected = this.selectAll);
    }
  }
}


export const config = {
  FetchBedsBoardConfigValues: 'FetchBedsBoardConfigValues?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  SaveMedicalTypeBedsBoardConfigurations: 'SaveMedicalTypeBedsBoardConfigurations',

};