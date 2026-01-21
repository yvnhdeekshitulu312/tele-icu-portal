import { Component, Inject, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';
import { RoleService } from './role.service';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { roleDetails } from './urls';
declare var $: any;
@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent extends BaseComponent implements OnInit {
  url = '';
  showContent = true;
  roleForm: any;
  FetchPatientFolderReasonsDataList: any = [];
  FetchModuleFeatureDataList: any = [];
  FetchModuleFeatureFUnctionsDataList: any = [];
  roleList: any = [];
  blockedToggle: boolean = false;
  FetchSelectedRoleDataKList: any = [];
  error = '';
  selectAllActive = false;

  constructor(@Inject(RoleService) private service: RoleService, private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private datePipe: DatePipe) { 
    super()
  }

  ngOnInit(): void {
    this.FetchModuleRoles();
    this.initializeRole();
  }

  initializeRole() {
    this.roleForm = this.formBuilder.group({
      RoleID: [0, Validators.required],
      RoleName: ['', Validators.required],
      ModuleId: ['', Validators.required],
      ModuleName: ['', Validators.required],
      Features: ['', Validators.required],
      Description: ['', Validators.required],
      IsBlocked: ['0', Validators.required],
      SearchText: ['']
    });
  }

  FetchModuleRoles() {
    this.url = this.service.getData(roleDetails.FetchModuleRoles, { UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchPatientFolderReasonsDataList = response.FetchPatientFolderReasonsDataList;
        }
      },
        (err) => {

        })
  }

  moduleChange(event: any) {
    this.url = this.service.getData(roleDetails.FetchModuleFeatureFunctions, { ModuleID: event.target.value, WorkStationID: 3395, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.FetchModuleFeatureDataList = response.FetchModuleFeatureDataList;
          this.FetchModuleFeatureFUnctionsDataList = response.FetchModuleFeatureFUnctionsDataList;

          if(this.FetchSelectedRoleDataKList.length > 0) {
            this.FetchModuleFeatureFUnctionsDataList.forEach((featureFunction: any) => {
              const matchingRoleData = this.FetchSelectedRoleDataKList.find(
                (roleData: any) => roleData.FeatureID === featureFunction.FeatureID && roleData.FunctionID === featureFunction.FunctionID
              );
            
              if (matchingRoleData) {
                featureFunction.selected = true;
                var result = this.FetchModuleFeatureDataList.filter((func: any) => func.FeatureID === featureFunction.FeatureID);
                if(result.length > 0) {
                  result[0].selected = true;
                }
              }
            });
          }

          this.FetchSelectedRoleDataKList = [];
        }
      },
        (err) => {

        })
  }

  getFeatureFunctions(featureID: string) {
    return this.FetchModuleFeatureFUnctionsDataList.filter((func: any) => func.FeatureID === featureID);
  }

  searchRole(event: any) {
    if (event.target.value.length > 2) {
      this.url = this.service.getData(roleDetails.FetchSavedRole, { RoleName: event.target.value, UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.roleList = response.FetchSavedRoleDataList;
          }
        },
          (err) => {
          })
    }
  }

  onRoleSelected(item: any) {
    this.blockedToggle=item.Blocked==1?true:false;
    this.roleList = [];
    this.roleForm.patchValue({
      RoleName: item.RoleName,
      RoleID: item.RoleID,
      Description:item.Description
    });

    this.url = this.service.getData(roleDetails.FetchSelectedRoleData, { RoleID: item.RoleID, UserID: this.doctorDetails[0].UserId, WorkStationID: 3395, HospitalID: this.hospitalID });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.FetchSelectedRoleDataKList = response.FetchSelectedRoleDataKList;

            if(this.FetchSelectedRoleDataKList.length > 0) {
              this.roleForm.patchValue({
                ModuleName: this.FetchSelectedRoleDataKList[0].ModuleName,
                ModuleId: this.FetchSelectedRoleDataKList[0].ModuleID,
                RoleName: item.RoleName
              });

              this.moduleChange({ target: { value: this.FetchSelectedRoleDataKList[0].ModuleID } });
            }
          }
        },
          (err) => {
          })
  }

  toggleBlocked() {
    this.blockedToggle = !this.blockedToggle;
  }

  SaveEmployeeHospitals() {
    this.error = '';

    if(this.blockedToggle && !this.roleForm.get("Description")?.value) {
      this.error = "Please add description for blocking";
      $("#errorMessagesModal").modal('show');
      return;
    }

    var FeatureDetailsXML: any[] = [];
    this.FetchModuleFeatureFUnctionsDataList.forEach((element:any, index:any) => {
      if(element.selected) {
        FeatureDetailsXML.push({
          "MDID": this.roleForm.get("ModuleId").value,
          "FTID": element.FeatureID,
          "FNID": element.FunctionID
        });
      }
    });

    var payload = {
      "RoleID": this.roleForm.get("RoleID")?.value,
      "RoleName": this.roleForm.get("RoleName")?.value,
      "RoleDescription": this.roleForm.get("Description")?.value,
      "USERID": this.doctorDetails[0].UserId,
      "WorkStationID": 3395,
      "HospitalID": this.hospitalID,
      "FeatureDetailsXML": FeatureDetailsXML,
      "RoleBlocked": this.blockedToggle ? 1 : 0,
    }

    this.us.post(roleDetails.SaveRoleModuleFeatureFunctions, payload).subscribe((response) => {
      if (response.Status === "Success") {
        $("#savemsg").modal('show');
      } 
      else if (response.Code === 604) {
        this.error = response.Message;
        $("#errorMessagesModal").modal('show');

      }
    },
      (err) => {

      })
  }

  clear() {
    this.showContent = false;
    this.initializeRole();
    this.FetchPatientFolderReasonsDataList = [];
    this.FetchModuleFeatureDataList = [];
    this.FetchModuleFeatureFUnctionsDataList = [];
    this.roleList = [];
    this.blockedToggle = false;
    this.selectAllActive = false; 
    setTimeout(() => {
      this.showContent = true;
      this.FetchModuleRoles();
    }, 100);
  }


  toggleSelectAll() {
    this.selectAllActive = !this.selectAllActive; 

    this.FetchModuleFeatureDataList.forEach((feature: any) => {
      feature.selected = this.selectAllActive;
      const featureFunctions = this.getFeatureFunctions(feature.FeatureID);
      featureFunctions.forEach((button: any) => {
        button.selected = this.selectAllActive;
      });
    });
  }

  filteredFeatures() {
    if (!this.roleForm.get("SearchText").value) {
      return this.FetchModuleFeatureDataList;
    }
    const searchLower = this.roleForm.get("SearchText").value.toLowerCase();
    return this.FetchModuleFeatureDataList.filter((feature: any) =>
      feature.FeatureName.toLowerCase().includes(searchLower)
    );
  }
  navigatetoRoleMapping() {   
      this.router.navigate(['/administration/mapuser']); 
  }

  setFunctionStatus(button: any, feature: any) {
    button.selected = !button.selected;
    var result = this.FetchModuleFeatureFUnctionsDataList.filter((func: any) => func.FeatureID === feature.FeatureID && func.selected === true);
    if(result.length > 0) {
      feature.selected = true;
    }
    else {
      feature.selected = false;
    }
  }

  toggleAllButtons(feature: any) {
    feature.selected = !feature.selected;
  
    const buttons = this.getFeatureFunctions(feature.FeatureID);
    buttons.forEach((button: any) => {
      button.selected = feature.selected;
    });
  }
}
