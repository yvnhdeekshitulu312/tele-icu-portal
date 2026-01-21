import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ConfigService } from 'src/app/services/config.service';

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
  selector: 'app-others-results-banner',
  templateUrl: './others-results-banner.component.html',
  styleUrls: ['./others-results-banner.component.scss'],
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


export class OthersResultsBannerComponent implements OnInit {
  tablePatientsForm!: FormGroup;
  visitsForm: any;
  selectedView: any;
  HospitalID: any;
  PatientID: any;
  patientDetails: any;
  PatientVisitsList: any;
  langData: any;
  selectedVisit: any;
  selectedFromDate: any;
  selectedToDate: any;
  allResults: string = "btn selected";
  panicResults: string = "btn";
  abnormalResults: string = "btn";
  SummaryfromCasesheet = 'false';
  @Input() admissionId: string = "";
  @Output() dataEvent = new EventEmitter<{ visit: any, fromdate: any, todate: any, type: string }>();
  @Input() IsLab = true;

  constructor(private fb: FormBuilder, public datepipe: DatePipe, private config: ConfigService) {
    this.visitsForm = this.fb.group({      
      visitId: [0]
    });

    this.langData = this.config.getLangData();
   }

  ngOnInit(): void {
    this.SummaryfromCasesheet = sessionStorage.getItem("SummaryfromCasesheet") || 'false';
    const view = sessionStorage.getItem("selectedView");
    const card = sessionStorage.getItem("selectedCard");
    const ivf = sessionStorage.getItem("ivfprocess")

    this.selectedView = view && view !== '{}' ? JSON.parse(view) : card && card !== '{}' ? JSON.parse(card): ivf && ivf !== '{}' ? JSON.parse(ivf) : {};

    this.patientDetails = JSON.parse(sessionStorage.getItem("PatientDetails") || '{}');
    this.HospitalID = sessionStorage.getItem("hospitalId");
    this.PatientID = this.selectedView.PatientID;
    this.initializetablePatientsForm();
    this.fetchPatientVisits();
  }

  initializetablePatientsForm() {
    var wm = new Date();
    var d = new Date();
    wm.setMonth(wm.getMonth() - 8);
      
    this.tablePatientsForm = this.fb.group({
      FromDate: wm,
      ToDate: d,
    });
  }

  fetchPatientVisits() {
    this.config.fetchPatientVisits(this.PatientID, this.HospitalID)
    .subscribe((response: any) => {
      if (response.Code == 200) {
       this.PatientVisitsList = response.PatientVisitsDataList;
       this.visitsForm.get('visitId')?.setValue(this.admissionId === '' ? response.PatientVisitsDataList[0].AdmissionID : this.admissionId);
       this.emitData();
      } 
    },
      (err) => {

      })
  }

  visitchange() {
    this.emitData();
  }

  fetchResults() {
   this.emitData();
  }

  emitData() {
    var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    
    if(FromDate && ToDate && this.visitsForm.get('visitId').value) {
      this.dataEvent.emit({ visit: this.visitsForm.get('visitId').value, fromdate: FromDate, todate: ToDate, type: '' });
    }
    
  }

  filterTestResults(type: string) {
    var FromDate = this.datepipe.transform(this.tablePatientsForm.value['FromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tablePatientsForm.value['ToDate'], "dd-MMM-yyyy")?.toString();
    if (type == "all") {
      this.allResults = "btn selected"; this.panicResults = this.abnormalResults = "btn";
    }
    else if (type == "panic") {
      this.allResults = this.abnormalResults = "btn"; this.panicResults = "btn selected";
    }
    else if (type == "abnormal") {
      this.allResults = this.panicResults = "btn"; this.abnormalResults = "btn selected"
    }
    this.dataEvent.emit({ visit: this.visitsForm.get('visitId').value, fromdate: FromDate, todate: ToDate, type: type });
  }

}
