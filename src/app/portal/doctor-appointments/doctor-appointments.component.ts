import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfigService } from 'src/app/services/config.service';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as Highcharts from 'highcharts';
import { Router } from '@angular/router';
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
  selector: 'app-doctor-appointments',
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe,
  ],
})
export class DoctorAppointmentsComponent implements OnInit {
  tableAppointmentsForm!: FormGroup;
  appointmentList: any;
  allergiesList: any;
  foodallergiesList: any;
  drugallergiesList: any;
  doctorDetails: any;
  hospitalId: any;
  selectedAppointment: any;
  summaryDetails: any = {};
  apiResponse: any;
  tableVitalsForm!: FormGroup;
  tablePatientVitalsForm!: FormGroup;
  tableVitalsList: any;
  tablePatientVitalsList: any;
  displayAllergiesTootltip: string = "none";
  btnDoctor: string = "btn selected";
  btnPatient: string = "btn";
  selectedPatientId: string = "";
  initializetableVitalsForm() {
    this.tableVitalsForm = this.fb.group({
      vitalFromDate: [''],
      vitalToDate: [''],
    });
  }
  initializetablePatientVitalsForm() {
    this.tablePatientVitalsForm = this.fb.group({
      vitalPFromDate: [''],
      vitalPToDate: [''],
    });
  }
  constructor(private fb: FormBuilder, private config: ConfigService, public datepipe: DatePipe, private router: Router) { }

  ngOnInit(): void {
    this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.hospitalId = sessionStorage.getItem("hospitalId");
    this.initializetableAppointmentsForm();
    var wm = new Date();
    var d = new Date();
    //wm.setMonth(wm.getMonth() + 1);
    this.tableAppointmentsForm.patchValue({
      wmFromDate: d,
      wmToDate: d
    })

    this.fetchDoctorAppointments();
    this.initializetableVitalsForm();
    var vm = new Date();
    vm.setMonth(vm.getMonth() - 1);
    this.tableVitalsForm.patchValue({
      vitalFromDate: vm,
      vitalToDate: d
    })
    this.initializetablePatientVitalsForm();
    var pvm = new Date();
    pvm.setMonth(pvm.getMonth() - 1);
    this.tablePatientVitalsForm.patchValue({
      vitalPFromDate: pvm,
      vitalPToDate: d
    })    
  }

  initializetableAppointmentsForm() {
    this.tableAppointmentsForm = this.fb.group({
      wmFromDate: [''],
      wmToDate: [''],
    });
  }

  fetchDoctorAppointments() {
    var FromDate = this.datepipe.transform(this.tableAppointmentsForm.value['wmFromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tableAppointmentsForm.value['wmToDate'], "dd-MMM-yyyy")?.toString();
    this.config.fetchDoctorAppointments(this.doctorDetails[0].EmpId
      , this.hospitalId, FromDate, ToDate).subscribe((response) => {
      if (response.Status === "Success") {
        this.appointmentList = response.PatientAppointmentsDataList;
      } else {
      }
    },
      (err) => {

      })
  }
  fetchPatientAllergies(patient: any) {
    //$("#viewAllergies").div('show');
    this.displayAllergiesTootltip = "block";
    this.config.fetchPatientAllergies(patient.PatientID, patient.RegCode, this.hospitalId).subscribe((response) => {
      if (response.Status === "Success") {
        this.allergiesList = response.PatientAllergiesDataList;
        this.foodallergiesList = response.PatientFoodAllergiesDataList;
        this.drugallergiesList = response.PatientDrugAllergiesDataList;
      } else {
      }
    },
      (err) => {

      })
  }
 
  startConsultation(al: any) {
    //var url = "https://meet.jit.si/clinic_" + al.ScheduleID;
    window.open(al.TeleURL, "_blank");
  }

  tConvert(time: any) {
    // Check correct time format and split into components
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  
    if (time.length > 1) { // If time format correct
      time = time.slice (1);  // Remove full string match value
      time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join (''); // return adjusted time or original string
  }
  confirmCancelAppointment(appointment: any) {
    this.selectedAppointment = appointment;
    $("#confirm").modal('show');
  }
  confirmCancelApp(status: string) {
    if (status == "Yes") {
      this.cancelAppointment(this.selectedAppointment);
    } else if (status == "No") {
      $("#confirm").modal('hide');
    }
  }
  cancelAppointment(appointment: any) {
    let payload = {
      "ScheduleID": appointment.ScheduleID,
      "RegCode": appointment.RegCode,
      "HospitalId": this.hospitalId,
      "CancelRemarks": "Cancelling Appointment for Patient"
    }
    this.config.CancelAppointment(payload).subscribe((response: any) => {
      if (response.Status === "Success" || response.Status === "True") {
        this.summaryDetails = response;
        this.apiResponse = response;
        this.appointmentList.splice(appointment, 1);
        $("#confirm").modal('hide');
        this.showSaveMessageModal();
      } else if (response.Status === "Fail" || response.Status === "False") {
        this.apiResponse = response;
        $("#confirm").modal('hide');
        this.showSaveMessageModal();
      }
    },
      (err) => {

      })
  }
  showSaveMessageModal() {
    $("#saveMessage").modal('show');
  }
  changeVitalsData(type : any) {
    if(type == "doctor") {
      this.btnDoctor = "btn cursor-pointer selected";
      this.btnPatient = "btn cursor-pointer";
      $('#divDoctorVitals').removeClass('d-none');
      $('#divPatientVitals').addClass('d-none');
      this.createChartLine();
    }
    else {
      this.btnPatient = "btn cursor-pointer selected";
      this.btnDoctor = "btn cursor-pointer";
      $('#divDoctorVitals').addClass('d-none');
      $('#divPatientVitals').removeClass('d-none');
      this.createPatientChartLine();
    }
  }
  closeAllergiesTooltip() {
    //this.displayAllergiesTootltip = "none";
    //$("#viewAllergies").modal('hide');
    $('#divAllergyTooltip').removeClass('hoverAllergy');
  }
  FetchVitalParams(appointment:any) {
    $("#viewVitals").modal('show');    
    
    var FromDate = this.datepipe.transform(this.tableVitalsForm.value['vitalFromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tableVitalsForm.value['vitalToDate'], "dd-MMM-yyyy")?.toString();
    this.config.fetchVitalParamsValues(appointment.PatientID, FromDate, ToDate, this.hospitalId).subscribe((response) => {
      if (response.Status === "Success") {
        this.selectedPatientId = appointment.PatientID;
        this.tableVitalsList = response.PatientVitalsDocDataList;
        this.tablePatientVitalsList = response.PatientVitalsDataList;
        this.changeVitalsData("doctor");
      } else {
      }
    },
      (err) => {
      })
   }
   SearchVitalParams(type:any) {
    if(type == "doctor") {
    var FromDate = this.datepipe.transform(this.tableVitalsForm.value['vitalFromDate'], "dd-MMM-yyyy")?.toString();
    var ToDate = this.datepipe.transform(this.tableVitalsForm.value['vitalToDate'], "dd-MMM-yyyy")?.toString();
    this.config.fetchVitalParamsValues(this.selectedPatientId, FromDate, ToDate, this.hospitalId).subscribe((response) => {
      if (response.Status === "Success") {
        this.tableVitalsList = response.PatientVitalsDocDataList;
        this.createChartLine();
      } else {
      }
    },
      (err) => {
      })
    }
    else {
        var FromDate = this.datepipe.transform(this.tablePatientVitalsForm.value['vitalPFromDate'], "dd-MMM-yyyy")?.toString();
        var ToDate = this.datepipe.transform(this.tablePatientVitalsForm.value['vitalPToDate'], "dd-MMM-yyyy")?.toString();
        this.config.fetchVitalParamsValues(this.selectedPatientId, FromDate, ToDate, this.hospitalId).subscribe((response) => {
          if (response.Status === "Success") {
            this.tablePatientVitalsList = response.PatientVitalsDataList;
            this.createPatientChartLine();
          } else {
          }
        },
          (err) => {
          })
        }    
   }
   private createChartLine(): void {
    let vitaldata: any = {};
    

    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];


    this.tableVitalsList.forEach((element: any, index: any) => {
      BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
    });

    vitaldata = [{name : 'BP-Systolic', data : BPSystolicData},
                 {name : 'BP-Diastolic', data: BPDiastolicData},
                 {name: 'O2 Flow Rate', data: O2FlowRateData, visible: false},
                 {name: 'Pulse', data: PulseData, visible: false},
                 {name: 'Respiration', data: RespirationData, visible: false},
                 {name: 'SPO2', data: SPO2Data, visible: false},
                 {name: 'Temparature', data: TemparatureData, visible: false}
                ]; 

    const chart = Highcharts.chart('chart-line', {
      chart: {
        type: 'areaspline',
        zoomType: 'x'
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category'
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
      },
      series: vitaldata,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
    }
    } as any);
  }
  private createPatientChartLine(): void {
    let vitaldata: any = {};
    

    const BPSystolicData: any[] = [];
    const BPDiastolicData: any[] = [];
    const O2FlowRateData: any[] = [];
    const PulseData: any[] = [];
    const RespirationData: any[] = [];
    const SPO2Data: any[] = [];
    const TemparatureData: any[] = [];


    this.tablePatientVitalsList.forEach((element: any, index: any) => {
      BPSystolicData.push([element.VisitDate, parseFloat(element.BPSystolic)])
      BPDiastolicData.push([element.VisitDate, parseFloat(element.BPDiastolic)])
      O2FlowRateData.push([element.VisitDate, parseFloat(element.O2FlowRate)])
      PulseData.push([element.VisitDate, parseFloat(element.Pulse)])
      RespirationData.push([element.VisitDate, parseFloat(element.Respiration)])
      SPO2Data.push([element.VisitDate, parseFloat(element.SPO2)])
      TemparatureData.push([element.VisitDate, parseFloat(element.Temparature)])
    });

    vitaldata = [{name : 'BP-Systolic', data : BPSystolicData},
                 {name : 'BP-Diastolic', data: BPDiastolicData},
                 {name: 'O2 Flow Rate', data: O2FlowRateData, visible: false},
                 {name: 'Pulse', data: PulseData, visible: false},
                 {name: 'Respiration', data: RespirationData, visible: false},
                 {name: 'SPO2', data: SPO2Data, visible: false},
                 {name: 'Temparature', data: TemparatureData, visible: false}
                ]; 

    const chart = Highcharts.chart('pchart-line', {
      chart: {
        type: 'areaspline',
        zoomType: 'x'
      },
      title: {
        text: null,
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: true,
      },
      yAxis: {
        title: {
          text: null,
        }
      },
      xAxis: {
        type: 'category'
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
      },
      series: vitaldata,
      scrollbar: {
        enabled: true,
        barBackgroundColor: 'gray',
        barBorderRadius: 7,
        barBorderWidth: 0,
        buttonBackgroundColor: 'gray',
        buttonBorderWidth: 0,
        buttonArrowColor: 'yellow',
        buttonBorderRadius: 7,
        rifleColor: 'yellow',
        trackBackgroundColor: 'white',
        trackBorderWidth: 1,
        trackBorderColor: 'silver',
        trackBorderRadius: 7
    }
    } as any);
  }

  fetchPatientSummary(pl: any) {
    sessionStorage.setItem("selectedRegCode", JSON.stringify(pl.RegCode));
    this.getPatientDetails(pl.RegCode);
  }

  getPatientDetails(RegCode: any) {
    let payload = {
      "RegCode": RegCode
    }
    this.config.getPatientDetails(payload).subscribe((response) => {
      if (response.Status === "Success") {
        sessionStorage.setItem("PatientDetails", JSON.stringify(response));
        this.router.navigate(['/home/summary']);
      }
    },
      (err) => {

      })
  }
}
