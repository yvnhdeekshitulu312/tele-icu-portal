import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { OtSurgerynotesService } from './ot-surgerynotes.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { SignatureComponent } from 'src/app/shared/signature/signature.component';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { preoperativechekclist } from 'src/app/shared/pre-op-checklist/pre-op-checklist.component';
import { LoaderService } from 'src/app/services/loader.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { SurgeryUtilsService } from '../services/surgery-utils.service';

declare var $: any;

@Component({
  selector: 'app-ot-surgerynotes',
  templateUrl: './ot-surgerynotes.component.html',
  styleUrls: ['./ot-surgerynotes.component.scss']
})
export class OtSurgerynotesComponent extends BaseComponent implements OnInit {
  @Input() data: any;
  @ViewChild('divots') divots!: ElementRef;
  item: any;
  url = '';

  surgeryNotesForm!: FormGroup;
  currentdate: any;
  currentTime: any;
  currentTimeN: Date = new Date();
  currentdateN: any;
  @ViewChild('Sign1Ref', { static: false }) signComponent1: SignatureComponent | undefined;
  showSignature = false;
  base64StringSig1 = '';
  savedSurgeryNotes: any = [];
  appSaveMsg: string = "";
  errorMessages: any[] = [];
  patientDiagnosis: any = [];
  AdminMastersInstructionsDataList: any = [];
  listOfDiagosis: any = [];
  postOpDiagosis: any = [];
  searchQuery: string = '';
  filteredData: any[] = [];
  listOfItems: any = [];
  listOfAnesthetists: any = [];
  IncisionMaster: any;
  facility: any;
  otpatinfo: any;
  readonly: any = false;
  location: any;
  isSaveDisabled: boolean = false;
  trustedUrl: any;

  constructor(private service: OtSurgerynotesService, 
    public formBuilder: FormBuilder, 
    public router: Router, private us: UtilityService, 
    private printerService: LoaderService,
    private surgeryUtils: SurgeryUtilsService) {
    super();
    this.item = JSON.parse(sessionStorage.getItem("otpatient") ?? '{}');
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.location = sessionStorage.getItem("locationName");
    this.service.param = {
      ...this.service.param,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
    };

    this.surgeryNotesForm = this.formBuilder.group({
      SurgeryNoteID: ['0'],
      PatientID: [''],
      Admissionid: [''],
      SurgeryRequestID: [''],
      Surgeon: this.item.SurgeonNo + '-' + this.item.SurgeonName,
      Anesthesia: this.item.AnaesthesianName,
      CirculatingNurse: [''],
      Assistant: [''],
      PreOpDiagnosis: [''],
      PostOpDiagnosis: [''],
      TimeProcedureStarted: this.item.ScheduleFromTime,
      ScrubNurse: [''],
      Ended: this.item.ScheduleToTime,
      CorrectPatient: ['2'],
      CorrectOperation: ['2'],
      CorrectSiteDone: ['2'],
      AntibioticAs: ['2'],
      Prophylaxis: ['2'],
      Treatment: ['2'],
      OperationPerformed: [''],
      Grade: ['2'],
      Type: ['1'],
      IncisionPorts: [''],
      Findings: [''],
      Procedure: this.item.SurgeryName,
      Closure: [''],
      Drains: [''],
      ExpectedBloodLoss: [''],
      BloodTransfusion: ['2'],
      Complications: [''],
      Bleeding: ['2'],
      InjuryDuringSurgery: ['2'],
      Death: ['2'],
      ExtendedSurgery: ['2'],
      ChangeSurgery: ['2'],
      None: ['2'],
      XRayClosure: ['2'],
      AnyprosthesisUsedWithSerialNo: [''],
      SwabsinstrumentsCountComplete: [''],
      ConfirmationOfProcedure: ['2'],
      AnyConcern: ['2'],
      SpecimenSmall: ['2'],
      SpecimenMedium: ['2'],
      SpecimenLarge: ['2'],
      SpecimenQuantity: ['2'],
      SpecimenNone: ['2'],
      Specimen: [''],
      StableCondition: [''],
      PostOperativeinstructions: [''],
      DoctorName: this.item.SurgeonNo + '-' + this.item.SurgeonName,
      DoctorNo: [''],
      Date: moment(new Date()).format('DD-MMM-YYYY'),
      DoctorSignature: [''],
      HospitalID: [''],
      USERID: [''],
      WorkStationId: [''],
      Blocked: [''],
      Status: [''],
      Enddate: [''],
      Createdate: [''],
      Moddate: [''],
      Dvtprophylaxis: [''],
      SwabsInstruments: ['2'],
      SurgicalWoundClarification: [''],
      ExposureTime: [''],
      PatientconditionPostOper: [''],
      IncisionID: [''],
      IncisionRemarks: ['']
    });

  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.currentdate = moment(new Date()).format('DD-MMM-YYYY H:mm');
    this.currentdateN = moment(new Date()).format('DD-MMM-YYYY');
    this.currentTime = moment(new Date()).format('H:mm');
    this.surgeryNotesForm.patchValue({
      OperationPerformed : this.item?.SurgeryName
    })
    this.FetchIncisions();    
    setTimeout(() => {
      this.showSignature = true;
    }, 0);

    if (this.data) {
      this.readonly = this.data.readonly;
      this.selectedView = this.data.selectedView;
       if(this.data.fromEHR==true)
      {
         sessionStorage.setItem("selectedView", JSON.stringify(this.selectedView));
      }
      this.fetchotdetails();
    } else {
      this.fetchDiagnosis();
      this.FetchWoundClarification();
    }

    this.isSaveDisabled = this.surgeryUtils.isSaveDisabled();
  }

  fetchotdetails() {
    //const selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    const fromdate = moment(this.selectedView.AdmitDate).format('DD-MMM-YYYY');
    const todate = moment(new Date()).format('DD-MMM-YYYY');
    var SSNN = this.selectedView.SSN;
    this.url = this.service.getData(preoperativechekclist.fetch, { FromDate: fromdate, ToDate: todate, SSN: SSNN, FacilityId: 3395, Hospitalid: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          if (this.data.data.SurgeryRequestID) {
            this.item = response.SurgeryRequestsDataList.find((item: any) => item.SurgeryRequestid.toString() === this.data.data.SurgeryRequestID.toString());
            this.fetchDiagnosis();
            this.FetchWoundClarification();
          }
        }
      },
        (err) => {
        });
  }

  FetchIncisions() {

    this.url = this.service.getData(surgerynotes.FetchIncisions, {
      WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchIncisionsDataList.length > 0) {
          this.IncisionMaster = response.FetchIncisionsDataList;
        }
      },
        (err) => {
        })
  }

  fetchDiagnosis() {

    this.url = this.service.getData(surgerynotes.FetchAdviceDiagnosis, {
      Admissionid: this.item.AdmissionID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.PatientDiagnosisDataList.length > 0) {
          this.patientDiagnosis = response.PatientDiagnosisDataList;
        }
      },
        (err) => {
        })
  }
  FetchWoundClarification() {


    this.url = this.service.getData(surgerynotes.FetchWoundClarification, {
      USERID: this.doctorDetails[0].UserId,
      WORKSTATIONID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      HospitalID: this.hospitalID
    });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.AdminMastersInstructionsDataList.length > 0) {
          this.AdminMastersInstructionsDataList = response.AdminMastersInstructionsDataList;
          this.fetchSurgeryNotes();
        }
      },
        (err) => {
        })

  }

  toggleSelectionForm(formCtrlName: string, val: string) {
    if (val != undefined)
      this.surgeryNotesForm.controls[formCtrlName].setValue(val);
  }

  toggleSelectionValChange(formCtrlName: string) {
    if (this.surgeryNotesForm.get(formCtrlName)?.value == '2')
      this.surgeryNotesForm.controls[formCtrlName].setValue('1');
    else
      this.surgeryNotesForm.controls[formCtrlName].setValue('2');
  }

  fetchSurgeryNotes() {
    this.url = this.service.getData(surgerynotes.FetchPatientSurgeryNote, { SurgeryRequestID: this.item.SurgeryRequestid, WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID, HospitalID: this.hospitalID });
    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200 && response.FetchPatientSurgeryNoteDataList.length > 0) {
          this.savedSurgeryNotes = response.FetchPatientSurgeryNoteDataList[0];
          const wounds = response.FetchPatientSurgeryNoteDataList[0].SurgicalWoundClarification;
          if (wounds != "") {
            if (wounds?.split(',').length > 1) {
              wounds?.split(',').forEach((element: any, index: any) => {
                const wnd = this.AdminMastersInstructionsDataList.find((x: any) => x.id === element.trim());
                wnd.selected = true;
              });
            }
            else {
              const wnd = this.AdminMastersInstructionsDataList.find((x: any) => x.id === wounds);
                wnd.selected = true;
            }
          }
          this.base64StringSig1 = this.savedSurgeryNotes.DoctorSignature;
          this.showSignature = false;
          setTimeout(() => {
            this.showSignature = true;
          }, 0);
          response.FetchPatientSurgeryNotePostDiagnoisDataList.forEach((element:any, index:any) => {
            this.postOpDiagosis.push({
              "DiagnosisID": element.DiseaseID,
              "DiagnosisName": element.PostOpDiseaseName,
              "DiagnosisCode": element.PostOpDiseaseCode
            })
          });
          for (let key in this.savedSurgeryNotes) {
            this.toggleSelectionForm(key, this.savedSurgeryNotes[key]);
          }
        }
      },
        (err) => {
        })
  }

  clearPatientSignature(ref: any) {
    if (ref === 'Sign1Ref') {
      if (this.signComponent1) {
        this.signComponent1.clearSignature();
        this.surgeryNotesForm.patchValue({ DoctorSignature: '' });
      }
    }
  }

  navigateBackToAdmissionRequests() {
    $('#selectPatientYesNoModal').modal('show'); 
  }

  onAccept() {
    const otpatient = JSON.parse(sessionStorage.getItem("otpatient") || '{}');
    const SSN = otpatient.SSN;
    $('#selectPatientYesNoModal').modal('hide');
    sessionStorage.setItem('navigateToDashboard', SSN)
    this.router.navigate(['/ot/ot-dashboard']);
  }

  onDecline() {
    $('#selectPatientYesNoModal').modal('hide');
    this.router.navigate(['/ot/ot-dashboard']);
  }

  base64NurseSignature1(event: any) {
    this.surgeryNotesForm.patchValue({ DoctorSignature: event });
  }

  saveSurgeryNotes() {
    var postopDiag = "";
    if (this.postOpDiagosis?.length > 0) {
      postopDiag = this.postOpDiagosis?.map((item: any) => item.DiagnosisID).join(', ');
    }
    var preopDiag = "";
    if (this.patientDiagnosis?.length > 0) {
      preopDiag = this.patientDiagnosis?.map((item: any) => item.DiseaseID).join(', ');
    }

    var surWounds = "";
    const woundsSelected = this.AdminMastersInstructionsDataList.filter((x: any) => x.selected);
    if (woundsSelected.length > 0)
      surWounds = woundsSelected?.map((item: any) => item.id).join(', ');

    var payload = {
      "SurgeryNoteID": this.surgeryNotesForm.get('SurgeryNoteID')?.value,
      "PatientID": this.item.PatientID,
      "AdmissionId": this.item.AdmissionID,
      "SurgeryRequestID": this.item.SurgeryRequestid,
      "Surgeon": this.surgeryNotesForm.get('Surgeon')?.value,
      "Anesthesia": this.surgeryNotesForm.get('Anesthesia')?.value,
      "CirculatingNurse": this.surgeryNotesForm.get('CirculatingNurse')?.value,
      "Assistant": this.surgeryNotesForm.get('Assistant')?.value,
      "PreOpDiagnosis": preopDiag,
      "PostOpDiagnosis": postopDiag,
      "TimeProcedureStarted": this.surgeryNotesForm.get('TimeProcedureStarted')?.value,
      "ScrubNurse": this.surgeryNotesForm.get('ScrubNurse')?.value,
      "Ended": this.surgeryNotesForm.get('Ended')?.value,
      //"CorrectPatient": this.surgeryNotesForm.get('CorrectPatient')?.value,
      "CorrectPatient": this.surgeryNotesForm.get('CorrectPatient')?.value,
      "CorrectOperation": this.surgeryNotesForm.get('CorrectOperation')?.value,
      "CorrectSiteDone": this.surgeryNotesForm.get('CorrectSiteDone')?.value,
      "AntibioticAs": this.surgeryNotesForm.get('AntibioticAs')?.value,
      "Prophylaxis": this.surgeryNotesForm.get('Prophylaxis')?.value,
      "Treatment": this.surgeryNotesForm.get('Treatment')?.value,
      "OperationPerformed": this.surgeryNotesForm.get('OperationPerformed')?.value,
      "Grade": this.surgeryNotesForm.get('Grade')?.value,
      "Type": this.surgeryNotesForm.get('Type')?.value,
      "IncisionPorts": this.surgeryNotesForm.get('IncisionPorts')?.value,
      "Findings": this.surgeryNotesForm.get('Findings')?.value,
      "Procedure": this.surgeryNotesForm.get('Procedure')?.value,
      "Closure": this.surgeryNotesForm.get('Closure')?.value,
      "Drains": this.surgeryNotesForm.get('Drains')?.value,
      "ExpectedBloodLoss": this.surgeryNotesForm.get('ExpectedBloodLoss')?.value,
      "BloodTransfusion": this.surgeryNotesForm.get('BloodTransfusion')?.value,
      "Complications": this.surgeryNotesForm.get('Complications')?.value,
      "Bleeding": this.surgeryNotesForm.get('Bleeding')?.value,
      "InjuryDuringSurgery": this.surgeryNotesForm.get('InjuryDuringSurgery')?.value,
      "Death": this.surgeryNotesForm.get('Death')?.value,
      "ExtendedSurgery": this.surgeryNotesForm.get('ExtendedSurgery')?.value,
      "ChangeSurgery": this.surgeryNotesForm.get('ChangeSurgery')?.value,
      "None": this.surgeryNotesForm.get('None')?.value,
      "XRayClosure": this.surgeryNotesForm.get('XRayClosure')?.value,
      "AnyprosthesisUsedWithSerialNo": this.surgeryNotesForm.get('AnyprosthesisUsedWithSerialNo')?.value,
      //"SwabsinstrumentsCountComplete": this.surgeryNotesForm.get('SwabsinstrumentsCountComplete')?.value,
      "SwabsInstruments": this.surgeryNotesForm.get('SwabsInstruments')?.value,
      "SwabsinstrumentsCountComplete": this.surgeryNotesForm.get('SwabsinstrumentsCountComplete')?.value,
      "ConfirmationOfProcedure": this.surgeryNotesForm.get('ConfirmationOfProcedure')?.value,
      "AnyConcern": this.surgeryNotesForm.get('AnyConcern')?.value,
      "SpecimenSmall": this.surgeryNotesForm.get('SpecimenSmall')?.value,
      "SpecimenMedium": this.surgeryNotesForm.get('SpecimenMedium')?.value,
      "SpecimenLarge": this.surgeryNotesForm.get('SpecimenLarge')?.value,
      "SpecimenQuantity": this.surgeryNotesForm.get('SpecimenQuantity')?.value,
      //"SpecimenNone" : this.surgeryNotesForm.get('SpecimenNone')?.value,
      "StableCondition": this.surgeryNotesForm.get('StableCondition')?.value,
      "PostOperativeinstructions": this.surgeryNotesForm.get('PostOperativeinstructions')?.value,
      "DoctorName": this.surgeryNotesForm.get('DoctorName')?.value,
      "DoctorNo": this.surgeryNotesForm.get('DoctorNo')?.value,
      "Date": this.surgeryNotesForm.get('Date')?.value,
      "DoctorSignature": this.surgeryNotesForm.get('DoctorSignature')?.value,
      "HospitalID": this.hospitalID,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
      "Dvtprophylaxis": this.surgeryNotesForm.get('Dvtprophylaxis')?.value,
      "SurgicalWoundClarification": surWounds,
      "ExposureTime": this.surgeryNotesForm.get('ExposureTime')?.value,     
      "IncisionID": this.surgeryNotesForm.get('IncisionID')?.value==''?'0':this.surgeryNotesForm.get('IncisionID')?.value,
      "IncisionRemarks": this.surgeryNotesForm.get('IncisionRemarks')?.value==''?'':this.surgeryNotesForm.get('IncisionRemarks')?.value,
      "Specimen": this.surgeryNotesForm.get('Specimen')?.value,
      "PatientconditionPostOper": this.surgeryNotesForm.get('PatientconditionPostOper')?.value,
    }

    this.us.post(surgerynotes.SavePatientSurgeryNote, payload).subscribe((response) => {
      if (response.Status === "Success") {
        this.appSaveMsg = "Surgery Notes Saved Successfully."
        $("#surgeryNotesSaveMsg").modal('show');
      }
      else {
        if (response.Status == 'Fail') {
          this.errorMessages = [];
          this.errorMessages.push(response.Message);
          this.errorMessages.push(response.Message2L);
          // this.patientDetails = [];
          $("#surgeryNotesValidation").modal('show');
        }
      }
    },
      (err) => {

      })
  }

  fetchDiagnosisSearch(event: any) {
    var filter = event.target.value;
    if (filter.length >= 3) {

      this.url = this.service.getData(surgerynotes.FetchDiagnosisSmartSearch,
        {
          Filter: filter, DoctorID: this.doctorDetails[0].UserId
        });
      var payload = {};
      this.us.post(this.url, payload)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfDiagosis = response.FetchDiagnosisSmartDataList;
            //this.filterData();
          }
        },
          (err) => {
          })
    } else {
      this.listOfDiagosis = [];
    }
  }

  filterData() {
    if (this.searchQuery) {
      this.filteredData = this.listOfDiagosis.filter((item: any) => item.Name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    } else {
      this.filteredData = this.listOfDiagosis;
    }
  }

  selectItem(item: any) {
    this.searchQuery = item.Name;
    this.listOfDiagosis = [];
    const itemExists = this.postOpDiagosis.find((x: any) => x.itemid === item.itemid);
    if (!itemExists) {
      this.postOpDiagosis.push({
        "DiagnosisID": item.itemid.toString().trim(),
        "DiagnosisName": item.Name.toString().trim(),
        "DiagnosisCode": item.itemCode.toString().trim()
      });
    }
    else {
      this.errorMessages = [];
      this.errorMessages.push("Duplicate diagnosis is not allowed");
      $("#surgeryRecordSaveValidationMsg").modal('show');
    }
  }
  selectpatdiag(diag: any) {
    diag.selected = !diag.selected;
  }

  movePreDiagToPostDiag() {
    const prediag = this.patientDiagnosis.filter((x: any) => x.selected);

    prediag.forEach((element: any, index: any) => {
      this.postOpDiagosis.push({
        "DiagnosisID": element.DiseaseID,
        "DiagnosisName": element.DiseaseName,
        "DiagnosisCode": element.Code
      })
    });
    this.patientDiagnosis.forEach((element: any, index: any) => {
      element.selected = false;
    });
  }
  deleteSelectedPostOpDiag(index: any) {
    this.postOpDiagosis.splice(index, 1);
  }
  searchScrubNurse(event: any) {
    var searchval = event.target.value;
    if (searchval.length > 2) {
      this.url = this.service.getData(surgerynotes.FetchWitnessNurse, {
        //DomainID: 85,
        Filter: searchval,
        HospitalID: this.hospitalID
      });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.FetchRODNursesDataList.length > 0) {
            this.listOfItems = response.FetchRODNursesDataList;
          }
        },
          (err) => {
          })
    }
  }

  onScreubNurseSelected(item: any) {
    const scrbnurse = item.ServiceitemName;
    this.surgeryNotesForm.patchValue({ ScrubNurse: scrbnurse });
    this.listOfItems = [];
  }

  searchAnasthetist(event: any) {
    var searchval = event.target.value;
    if (searchval.length > 2) {
      this.url = this.service.getData(surgerynotes.FetchWitnessNurse, {
       // DomainID: 83,
        Filter: searchval,
        HospitalID: this.hospitalID
      });
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200 && response.FetchRODNursesDataList.length > 0) {
            this.listOfAnesthetists = response.FetchRODNursesDataList;
          }
        },
          (err) => {
          })
    }
  }

  onAnesthetistSelected(item: any) {
    const scrbnurse = item.ServiceitemName;
    this.surgeryNotesForm.patchValue({ Anesthesia: scrbnurse });
    this.listOfAnesthetists = [];
  }
  onAsstAnesthetistSelected(item: any) {
    const scrbnurse = item.ServiceitemName;
    this.surgeryNotesForm.patchValue({ Assistant: scrbnurse });
    this.listOfItems = [];
    this.listOfAnesthetists=[];
  }

  onCirculatingNurseSelected(item: any) {
    const scrbnurse = item.ServiceitemName;
    this.surgeryNotesForm.patchValue({ CirculatingNurse: scrbnurse });
    this.listOfItems = [];
  }

  openOtQuickActions() {
    this.otpatinfo = this.item;
    $("#ot_quickaction_info").modal('show');
  }

  closeOtModal() {
    this.otpatinfo = "";
    $("#ot_quickaction_info").modal('hide');
  }

  templatePrint() {
    const headerImage = 'assets/images/header.jpeg';
    const footerImage = 'assets/images/footer.jpeg';
  
    // Remove any existing headers and footers
    const existingHeader = document.getElementById('dynamic-header');
    const existingFooter = document.getElementById('dynamic-footer');
    
    if (existingHeader) {
      existingHeader.remove();
    }
    if (existingFooter) {
      existingFooter.remove();
    }
  
    // Set a timeout to wait for the elements to be added before triggering print
    setTimeout(() => {
       document.title = 'SurgeryNote_'+ new Date().toISOString();
      window.print();  // Trigger print dialog

    }, 500);
  }

  printSurgeryNotes() {
    const url = this.service.getData(surgerynotes.FetchPatientSurgeryNotePrint, {
        SurgeryRequestID: this.item.SurgeryRequestid,
        WorkStationID: this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID,
        HospitalID: this.hospitalID
      });
      this.us.get(url)
        .subscribe((response: any) => {
          this.trustedUrl = response?.Message
            $("#divsurgeryNotesPrint").modal('show');

        },
          (err) => {
          })
    
  }
}

export const surgerynotes = {
  FetchPatientSurgeryNote: 'FetchPatientSurgeryNote?SurgeryRequestID=${SurgeryRequestID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchAdviceDiagnosis: 'FetchAdviceDiagnosis?TBL=1&Admissionid=${Admissionid}&HospitalID=${HospitalID}',
  SavePatientSurgeryNote: 'InsertPatientSurgeryNote',
  FetchWoundClarification: 'FetchWoundClarification?USERID=${USERID}&WORKSTATIONID=${WORKSTATIONID}&HospitalID=${HospitalID}',
  FetchDiagnosisSmartSearch: 'FetchDiagnosisSmartSearch?Filter=${Filter}&DoctorID=${DoctorID}',
  //FetchSSDomainAgainstServiceItems: 'FetchSSDomainAgainstServiceItems?Name=${Name}&DomainID=${DomainID}&HospitalID=${HospitalID}',
  FetchWitnessNurse: 'FetchWitnessNurse?Filter=${Filter}&HospitalID=${HospitalID}',
  FetchIncisions: 'FetchIncisions?WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  FetchPatientSurgeryNotePrint: 'FetchPatientSurgeryNotePrint?SurgeryRequestID=${SurgeryRequestID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
};  