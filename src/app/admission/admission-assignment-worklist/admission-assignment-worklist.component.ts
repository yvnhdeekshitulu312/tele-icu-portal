import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import moment from 'moment';
declare var $: any;

@Component({
    selector: 'app-admission-assignment-worklist',
    templateUrl: './admission-assignment-worklist.component.html',
})
export class AdmissionAssignmentWorklistComponent extends BaseComponent implements OnInit {
    url = '';
    FetchAdmissionTokenGenerationDataList: any = [];
    PharmacyTokenDataTotalList: any = [];
    currentdate = new Date();
    facility: any;
    trustedUrl: any;
    selectedStatusID: any;
    counterId: any;
    counterNo: any;
    selectedCounter = '0';
    showTokenScan: boolean = false;
    IsDisabled = true;
    IsCounterDisable = false;
      errorMessage: any;
   TokenMessage: any;
    constructor(private us: UtilityService, public formBuilder: FormBuilder, private router: Router, private datePipe: DatePipe) {
        super()
    }

    ngOnInit(): void {
        this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
        this.fetchAdmissionTokenGeneration();

        const savedCounter = sessionStorage.getItem('counter');
        if (savedCounter) {
            this.selectedCounter = savedCounter;

            const dropdown = document.getElementById('counter') as HTMLSelectElement;
            if (dropdown) {
                const event = new Event('change', { bubbles: true });
                dropdown.value = savedCounter;
                dropdown.dispatchEvent(event);
            }
    }
        
    }

    navigateToFacility() {
        this.router.navigate(['/ward']);
    }

    fetchAdmissionTokenGeneration(StatusID: any = '1') {
        this.selectedStatusID = StatusID;
        const url = this.us.getApiUrl(AdmissionAssignmentWorklist.FetchAdmissionTokenGeneration, {
            StatusID,
            UserID: this.doctorDetails[0].UserId,
            WorkStationID: this.facility.FacilityID,
            HospitalID: this.hospitalID
        });
        this.us.get(url)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.FetchAdmissionTokenGenerationDataList = response.FetchAdmissionTokenGenerationDataList.sort((a: any, b: any) => a.TokennumberNew.localeCompare(b.TokennumberNew));;
                    this.PharmacyTokenDataTotalList = response.PharmacyTokenDataTotalList;
                }
            },
                (_) => {

                });
    }


   

    Refresh() {
        this.fetchAdmissionTokenGeneration();
    }

    // PrintToken(token: any) {
    //     var payload = {
    //         "TrayNumber": token.Tokennumber,
    //         "PatientID": token.PatientId,
    //         "AdmissionID": token.IPID,
    //         "PrescriptionID": token.PrescriptionId,
    //         "UserName": this.doctorDetails[0].UserName,
    //         "HospitalID": this.hospitalID,
    //         "UserID": this.doctorDetails[0].UserId,
    //         "WorkStationID": this.facility.FacilityID,
    //     }

    //     this.us.post(AdmissionAssignmentWorklist.PrescriptionTokenGenerationPrint, payload).subscribe((response) => {
    //         if (response.Status === "Success") {
    //             token.isclicked = false;
    //             this.trustedUrl = response.PatientVitalEndoscopyDataaList[0].FTPPath;
    //             $('#iframeContainer').modal('show');
    //         }
    //     },
    //         (err) => {

    //         })
    // }

    navigateToAdmission(token: any) {
        token.PatientID = token.PatientId;
        token.AdmissionID = token.Admissionid;
        token.IPAdmissionID = token.Admissionid;
        token.DoctorName = token.Doctor;
        sessionStorage.setItem("selectedPatientForAdmission", JSON.stringify(token));
        sessionStorage.setItem("fromAdmissionWorklist", JSON.stringify(token));
        this.router.navigate(['/admission/patientadmission']);
    }

    
    onCounterChange(event: any) {
        this.selectedCounter = event.target.value;
        if (event.target.value !== "0") {
            this.showTokenScan = true;
            this.counterId = event.target.value;
            this.counterNo = event.target.options[event.target.options.selectedIndex].text;
            this.IsCounterDisable = true;
            this.IsDisabled = false;
            sessionStorage.setItem("counter", event.target.value);
        }
        else {
            this.showTokenScan = false;
            this.IsDisabled = true;
        }
    }
     onBodyClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isInsideSelect = target.closest('#counter') !== null;

    if (!isInsideSelect && this.selectedCounter === '0') {
      $("#counterValidation").modal('show');
    }
  }

     assignToken(token: any) {
        if (this.counterId === '0'|| this.counterId === undefined) {
          this.errorMessage = "Please select counter.";
          $("#errorMsg").modal("show");
          return;
        }
        this.fetchAdmissionTokenGeneration();
        var PrescriptionItems: any = [{
            "PTGID": token.AdmissionTokenGenerationId,
            "STS": "2",
            "AU": this.doctorDetails[0].UserId,
            "AD": moment(new Date()).format('DD-MMM-YYYY'),
            "TN": token.TrayNumber,
            "ECODE": this.doctorDetails[0].EmpNo
        }];

        var payload = {
            "PatientID": token.PatientId,
            "AdmissionID": token.Admissionid == "" ? 0 : token.Admissionid,
            "PrescriptionID": 0,
            "UserName": this.doctorDetails[0].UserName,
            "HospitalID": this.hospitalID,
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facility.FacilityID,
            "PrescriptionItems": PrescriptionItems
        }

        this.us.post(AdmissionAssignmentWorklist.UpdatePrescriptionTokenGeneration, payload).subscribe((response) => {
            if (response.Status === "Success") {

                $("#savemsg").modal('show');
                token.isclicked = false;                
                this.fetchAdmissionTokenGeneration();
                this.onTokenEnterPress(token);
            }
        },
            (_) => {

            });
    }


     UpdateTokenClose(token: any) {
        if (this.counterId === '0'|| this.counterId === undefined) {
          this.errorMessage = "Please select counter.";
          $("#errorMsg").modal("show");
          return;
        }
        

        var payload = {
            "AdmissionTokenGenerationId": token.AdmissionTokenGenerationId,
            "IsTokenclose": true,
            "TokencloseBy": this.doctorDetails[0].EmpId,   
            "UserID": this.doctorDetails[0].UserId,
            "WorkStationID": this.facility.FacilityID,
            "HospitalID": this.hospitalID,
        }

        this.us.post(AdmissionAssignmentWorklist.UpdateAdmissionTokenGenerationClose, payload).subscribe((response) => {
            if (response.Status === "Success") {
                this.TokenMessage = "Successfully Token Closed : "+ token.TrayNumber;
                $("#Tokenmsg").modal('show');            
                this.fetchAdmissionTokenGeneration();
                
            }
        },
            (_) => {

            });
    }

     

    
      onTokenEnterPress(token: any) {
        if (this.counterId === '0'|| this.counterId === undefined) {
          this.errorMessage = "Please select counter.";
          $("#errorMsg").modal("show");
          return;
        }

       
        const payload = {
          TokenNumber: token.Tokennumber,
          CounterNoValue: this.counterId,
          CounterNo: this.counterNo,
          UserID: this.doctorDetails[0]?.UserId,
          WorkStationID: this.facilitySessionId,
          HospitalID: this.hospitalID,
        };
         this.url = this.us.getApiUrl(AdmissionAssignmentWorklist.FetchPrescriptionsPerTray, payload);
          this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          const tokenDetails = response.FetchPrescriptionsPerTrayDataList;
            this.TokenMessage = "Successfully Called to TokenNo : "+ token.TrayNumber;
            $("#Tokenmsg").modal('show');
         
        }
      },
        (err) => {

        })

        // this.us.getApiUrl(AdmissionAssignmentWorklist.FetchPrescriptionsPerTray, payload).subscribe((response) => {
        //     if (response.Status === "Success") {
               
        //         this.trustedUrl = response.PatientVitalEndoscopyDataaList[0].FTPPath;
        //         $('#iframeContainer').modal('show');
        //     }
        // });
    }
        
        
      
}

const AdmissionAssignmentWorklist = {
    FetchAdmissionTokenGeneration: 'FetchAdmissionTokenGeneration?StatusID=${StatusID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
    UpdatePrescriptionTokenGeneration: "UpdateAdmissionTokenGeneration",
    PrescriptionTokenGenerationPrint: "PrescriptionTokenGenerationPrint",
    FetchPrescriptionsPerTray: 'FetchAdmissionPerTray?TokenNumber=${TokenNumber}&CounterNoValue=${CounterNoValue}&CounterNo=${CounterNo}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
     UpdateAdmissionTokenGenerationClose: "UpdateAdmissionTokenGenerationClose",
}
