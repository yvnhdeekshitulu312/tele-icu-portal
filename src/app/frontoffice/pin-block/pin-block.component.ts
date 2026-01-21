import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import {
  debounceTime,
  map,
  Observable,
  of,
  startWith,
  Subscription,
  switchMap,
} from 'rxjs';
import { BaseComponent } from 'src/app/shared/base.component';
import { PatientPinBlockService } from './pin-block.service';
declare var $: any;

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-pin-block',
  templateUrl: './pin-block.component.html',
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PinBlockPatientComponent extends BaseComponent implements OnInit  {
  lang: string = '';
  patientBlockForm!: FormGroup;
  private subscription!: Subscription;
  referralWorklistList: any = [];
  referralWorklistListData: any = [];
  mappedCompanyList: any = [];
  blockMessageList: any = [];
  skelLoader: boolean = false;
  loader = false;

  ssEmployee = new FormControl();
  ssEmployeeFilter: Observable<any[]> = new Observable<any[]>();
  searchEmpty = '';
  selectedAuthorizedId = 0;

  multiplePatientsList: any;
  displayMultiplePatients: string = 'none';
  patientData: any;

  patientPinBlockDetails: any = [];

  blockType: string = 'blockComplete';
  releaseType: string = 'permanent';

  enableBlock: boolean = false;
  errorMsg: any;
  successMsg: any;

  constructor(
    private fb: FormBuilder,
    public datepipe: DatePipe,
    private patientRegService: PatientPinBlockService,
    private modalService: NgbModal,
    private router: Router // private msgService: MessageService, // private abstractService: AbstractService
  ) {
    super();
  }
  ngOnInit(): void {
    this.lang = sessionStorage.getItem('language')!;
    this.initializeForms();
    this.fetchBlockMsg();
  }

  initializeForms() {
    this.patientBlockForm = this.fb.group({
      uhidorssn: ['', Validators.required],
      name: [''],
      effectiveDate: [new Date(), Validators.required],
      blockMessage: ['', Validators.required],
      blockDetails: ['', Validators.required],
      outStandingAmount: ['', Validators.required],
      authorizedBy: ['', Validators.required],
      blockType: [''],
      releaseType: [''],
      releaseReason: [''],
    });
  }

  fetchBlockMsg() {
    this.loader = true;
    this.patientRegService.fetchPatientBlockMessage().subscribe({
      next: (response: any) => {
        this.loader = false;
        if (response.status == 'Success') {
          this.blockMessageList = response?.data || [];
        }
      },
      complete: () => console.log('Completes with Success!'),
      error: () => {
        this.loader = false;
      },
    });
  }

  onSearchPatient(event: any) {
    if (event.key === 'Enter') {
      if (event.target.value.length > 5) {
        this.loader = true;
        const searchParam = {
          PatientSearch: event.target.value,
          hospitalId: this.hospitalID,
        };
        this.patientRegService
          .fetchPatientRoot(searchParam)
          .subscribe((response: any) => {
            if (response.status == 'Success') {
              this.loader = false;
              if (response.data.length > 1) {
                this.displayMultiplePatients = 'block';
                this.multiplePatientsList = response.data || [];
              } else if (response.data.length == 1) {
                const searchParam = {
                  patientID: response.data[0].patientID,
                  regcode: response.data[0].regcode,
                };
                this.getPatientData(searchParam);
              } else {
                this.errorMsg = 'No Records Found';
                $('#errorMsg').modal('show');
              }
            } else {
              this.errorMsg = 'No Records Found';
              $('#errorMsg').modal('show');
              this.loader = false;
            }
          });
      }
    }
  }

  getPatientData(reqToGetPatientData: any) {
    this.loader = true;
    if (reqToGetPatientData && reqToGetPatientData?.patientID != '') {
      const searchParam = {
        patientId: reqToGetPatientData.patientID,
        regCode: reqToGetPatientData.regcode,
        hospitalId: this.hospitalID,
        workStationId: this.facilitySessionId,
      };
      this.patientRegService.fetchPatientData(searchParam).subscribe({
        next: (response: any) => {
          if (
            response.status == 'Success' &&
            response.data.patientID != 0 &&
            response.data.patientID != null
          ) {
            this.loader = false;
            this.patientData = response.data;
            this.fetchPinBlockPatientDetails();
          } else {
            this.loader = false;
          }
        },
        complete: () => console.log('Completes with Success!'),
        error: () => {
          this.loader = false;
        },
      });
    } else {
      this.loader = false;
    }
  }

  fetchPinBlockPatientDetails() {
    const searchParam = {
      patientId: this.patientData.patientID,
      hospitalId: this.hospitalID,
      workstationId: this.facilitySessionId,
      userId: this.userID,
    };

    this.loader = true;
    this.patientRegService.fetchPatientPinBlock(searchParam).subscribe({
      next: (response: any) => {
        this.loader = false;
        if (response.status == 'Success') {
          this.patientPinBlockDetails = response.data || [];
          this.patchPatientBlockForm();
        }
      },
      complete: () => console.log('Completes with Success!'),
      error: () => {
        this.loader = false;
      },
    });
  }

  patchPatientBlockForm() {
    this.patientBlockForm.patchValue({
      uhidorssn: this.patientData.ssn || '',
      name:
        this.patientData.firstName +
          ' ' +
          this.patientData.middleName +
          ' ' +
          this.patientData.lastName || '',
    });
    this.enableBlock = false;
    if (this.patientPinBlockDetails.length > 0) {
      this.enableBlock = true;

      this.patientBlockForm.patchValue({
        effectiveDate: moment(
          this.patientPinBlockDetails[0].effectiveDate
        ).format('yyyy-MM-DD'),
        blockMessage: this.patientPinBlockDetails[0].messageID,
        blockDetails: this.patientPinBlockDetails[0].discription,
        outStandingAmount: this.patientPinBlockDetails[0].blockAmount,
        authorizedBy: this.patientPinBlockDetails[0].authorisedByName,
      });
      [
        'name',
        'effectiveDate',
        'blockMessage',
        'blockDetails',
        'outStandingAmount',
        'authorizedBy',
      ].forEach((field) => {
        this.patientBlockForm.get(field)!.disable();
      });
      this.blockType = this.patientPinBlockDetails[0].blockType;

      this.releaseType = this.patientPinBlockDetails[0].relesseType;
    }
  }

  onPatientSelect(patient: any) {
    this.displayMultiplePatients = 'none';
    this.patientBlockForm.patchValue({
      uhidorssn: patient.ssn || '',
    });
    this.getPatientData(patient);
  }

  searchSsEmployee(event: any) {
    const searchPar = {
      name: event.target.value,
      UserId: this.userID,
      HospitalID: this.hospitalID,
      WorkstationId: this.facilitySessionId,
    };

    this.ssEmployeeFilter = this.ssEmployee.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap((value) => this.patientRegService.fetchSSEmployees(searchPar)),
      map((response: any) => response.FetchSSEmployeesDataList) // Adjust this based on your API response structure
    );
  }

  blockOrRelease(type: string) {
    let payload: any = {};
    if (type === 'block') {
      payload = {
        pinblockID: 0,
        patientID: this.patientData.patientID,
        messageID: this.patientBlockForm.get('blockMessage')?.value || 0,
        effectivedate: this.datepipe.transform(
          this.patientBlockForm.get('effectiveDate')?.value,
          'dd-MMM-yyyy'
        ),
        blockAmount: this.patientBlockForm.get('outStandingAmount')?.value || 0,
        authorisedBy: this.selectedAuthorizedId || 0,
        blocktype: this.blockType,
        blockreason: this.patientBlockForm.get('blockDetails')?.value || '',
        previousPinblockID: 0,
        userId: this.userID,
        workstationId: this.facilitySessionId,
        hospitalId: this.hospitalID,
      };
    } else if (type === 'release') {
      payload = {
        pinblockID: this.patientPinBlockDetails[0].pinblockID,
        releaseType: this.releaseType,
        releaseReason: this.patientBlockForm.get('releaseReason')?.value || '',
        tempStartDate: '',
        tempEndDate: '',
        userId: this.userID,
        workstationId: this.facilitySessionId,
        hospitalId: this.hospitalID,
      };
    }

    this.loader = true;
    this.patientRegService.patientBlockOrRelease(payload, type).subscribe({
      next: (response: any) => {
        this.loader = false;
        if (response.status == 'Success') {
          this.successMsg = 'Updated Successfully';
          $('#successMsg').modal('show');
          this.enableBlock = false;
          this.fetchPinBlockPatientDetails();
        } else {
          this.errorMsg = 'Something went wrong, please try again later.';
          $('#errorMsg').modal('show');
        }
      },
      complete: () => console.log('Completes with Success!'),
      error: () => {
        this.loader = false;
        this.errorMsg = 'Something went wrong, please try again later.';
        $('#errorMsg').modal('show');
      },
    });
  }

  blockTypeChange(type: string) {
    this.blockType = type;
  }

  releaseTypeChange(type: string) {
    this.releaseType = type;
  }

  selectAuthorized(data: any) {
    this.ssEmployeeFilter = of([]);
    this.selectedAuthorizedId = data?.ID;
    this.patientBlockForm
      .get('authorizedBy')
      ?.setValue(data?.ServiceItemName || '');
  }

  clearList() {
    this.enableBlock = false;
    this.selectedAuthorizedId = 0;
    this.patientBlockForm.reset();
    this.blockType = 'blockComplete';
    this.releaseType = 'permanent';
  }

  closePatientSelectPopup() {
    this.displayMultiplePatients = 'none';
  }
}
