import { Injectable } from '@angular/core';
import { UtilityService } from './utility.service';
import { BehaviorSubject, filter } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  functionEnum: any = {
    "2": "Save",
    "3": "Modify",
    "4": "Delete",
    "5": "View",
    "6": "Print",
    "7": "Acknowledge",
    "8": "UnAcknowledge",
    "9": "Results Verified",
    "10": "Draft Save",
    "11": "Approve",
    "12": "Reject",
    "13": "Amend",
    "14": "Cancel",
    "15": "Closed",
    "16": "CreateLOA",
    "17": "Results Unverified",
    "18": "Discount",
    "19": "BulkApproval",
    "21": "BulkPreview",
    "24": "Sample Collect",
    "25": "Cancel Collect",
    "27": "Patient Arrived",
    "28": "Cancel Patient Arrived",
    "36": "Delay/Advance",
    "38": "Verify",
    "39": "UnVerify",
    "40": "EnableResultEntry",
    "41": "OtherLocationSave",
    "42": "OtherLocationModify",
    "43": "OtherLocationDelete",
    "44": "OtherLocationView",
    "45": "Not To Post",
    "46": "ServiceWisePrint",
    "47": "Admin",
    "48": "ViewOP",
    "49": "ViewIP",
    "503": "Global Order Entry",
    "508": "Freeze",
    "509": "UnFreeze",
    "510": "VIP",
    "511": "View Previous Scan Docs",
    "514": "Cash Discount",
    "515": "Credit Discount",
    "516": "SameDayCancellation",
    "517": "EnableSelectingDoctors",
    "518": "With Out PO",
    "519": "Result Reviewed",
    "520": "LOA",
    "522": "Appointment",
    "523": "Admission Intimation Print",
    "524": "Discharge Intimation Print",
    "525": "Sample Receiving",
    "526": "Sample UnReceiving",
    "527": "Sample Transfer",
    "528": "Sample UnTransfer",
    "529": "Over Booking",
    "530": "Discontinue Medication",
    "531": "Translation",
    "532": "ModifyPOValidity",
    "533": "NurseEntry",
    "534": "PrescriberOrder",
    "535": "PharmacyCalculations",
    "536": "ClinicalPharmacistVerification",
    "537": "Terminate",
    "538": "Reschedule",
    "539": "Confirm",
    "540": "ChangeDoctor",
    "541": "RevertTermination",
    "542": "SuperUser",
    "543": "PORTERRECEVING",
    "544": "Waiting List",
    "545": "Transfusion Entry",
    "546": "Primary Doctor Change",
    "547": "FingerPrint Override",
    "548": "AI Generation",
     
  };

  private userPermissions = new BehaviorSubject<{ [key: string]: number }>({});
  public userPermissions$ = this.userPermissions.asObservable();

  constructor(private us: UtilityService, private router: Router) { 
    this.getPermissions(); 

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.getPermissions();
    });
  }

  hasPermission(functionName: string): boolean {
    const permissions = this.userPermissions.getValue();
    return permissions.hasOwnProperty(functionName);
  }

  getPermissions() {
    const featureID = sessionStorage.getItem('FeatureID') || '0';
    const hospitalID = sessionStorage.getItem('hospitalId') || '2';
    const doctorDetails = JSON.parse(sessionStorage.getItem('doctorDetails') || '[]');
    let FacilityID = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
    const workStationID = FacilityID || 2157;
    const userID = doctorDetails.length > 0 ? doctorDetails[0]?.UserId : '4394';

    const url = `FetchHospitalUserRoleDetailsRole?FeatureID=${featureID}&UserID=${userID}&WorkStationID=${workStationID}&HospitalID=${hospitalID}`;

    this.us.get(url).subscribe({
      next: (response: any) => {
        if (response.Code === 200) {
          const permissions: { [key: string]: number } = {};
          response.FetchHospitalUserRoleDetailsDataList.forEach((role: any) => {
            const functionName = this.functionEnum[role.FunctionID];
            if (functionName) {
              permissions[functionName] = Number(role.FunctionID);
            }
          });
          this.userPermissions.next(permissions);
        }
      },
      error: (error) => {
        console.error('Error fetching permissions:', error);
      },
    });
  }

}
