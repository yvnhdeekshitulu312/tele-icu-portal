import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent } from 'src/app/shared/base.component';

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
  selector: 'app-instructions-to-nurse',
  templateUrl: './instructions-to-nurse.component.html',
  styleUrls: ['./instructions-to-nurse.component.scss'],
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
export class InstructionsToNurseComponent extends BaseComponent implements OnInit {
  @Input() data: any;
  addNursingInstructionsFormSubmitted: boolean = false;
  instructionsToNurse: any;
  selectedInstructionsList: any = [];
  instructionToNurseForm!: FormGroup;
  PatientID: any;
  AdmissionID: any;
  PatientType:any;
  // selectedView: any;
  // doctorDetails: any;
  drugFrequenciesList: any;
  IsNurse: any;
  hospId: any;
  facility: any;
  Savemsg: string = '';
  // langData: any;
  lang: any;
  endofEpisode: boolean = false;
  errorMessage: string = '';
  // minDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');

  constructor(private fb: FormBuilder, private config: ConfigService, private router: Router, public datepipe: DatePipe) {
    super();
    this.langData = this.config.getLangData();
    this.lang = sessionStorage.getItem("lang");
    this.instructionToNurseForm = this.fb.group({
      NurseInstructions: ['', Validators.required],
      NurseInstructionId: ['', Validators.required],
      FrequencyId: ['0', Validators.required],
      Frequency: ['', Validators.required],
      FrequencyTime: [''],
      StartDate: new Date(),
      NoofDays: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    //this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    //this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
    this.selectedCard = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
    this.selectedView = this.selectedCard;
    this.hospId = sessionStorage.getItem("hospitalId");
    this.PatientID = this.selectedView.PatientID;
    this.AdmissionID = this.selectedView.AdmissionID == undefined ? this.selectedView.IPID : this.selectedView.AdmissionID;
    if (this.selectedView.PatientType == "2") {
      this.AdmissionID = this.selectedView.IPID;
      this.PatientType=this.selectedView.PatientType;
      this.PatientID=this.selectedView.PatientID;
    }
    if (sessionStorage.getItem("ISEpisodeclose") === "true") {
      this.endofEpisode = true;
    } else {
      this.endofEpisode = false;
    }
    if (this.selectedCard.PatientType == "3") {
      this.AdmissionID = this.selectedCard.AdmissionID;
      this.PatientType=this.selectedCard.PatientType;
      this.PatientID=this.selectedCard.PatientID;
    }
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    // this.instructionToNurseForm.patchValue({
    //   StartDate: new Date()
    // });
    this.FetchDrugFrequencies();
    this.FetchPatientNursingInstructions();
    if (this.data) {
      this.data = this.data.data;
    }
  }

  FetchDrugFrequencies() {
    this.config.fetchDrugFrequencies(this.doctorDetails[0].EmpId, "0", this.hospId)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.drugFrequenciesList = response.DrugFrequenciesDataList;//.sort((a: any, b: any) => a.Frequency.localeCompare(b.Frequency));
        }
      },
        (err) => {

        })
  }

  searchInstructions(event: any) {
    var filter = event.target.value;
    if (filter.length > 2) {
      this.config.FetchInstructionsToNurse(filter, this.doctorDetails[0].UserId, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, this.hospId).subscribe((response: any) => {
        if (response.Code == 200) {
          this.instructionsToNurse = response.FetchInstructionsToNurseOutputLists;
        }
      }, error => {
        console.error('Get Data API error:', error);
      });
    }

  }
  onFrequencyChange(event: any) {
    this.instructionToNurseForm.get('Frequency')?.setValue(event.target.options[event.target.options.selectedIndex].text);
    this.instructionToNurseForm.get('FrequencyTime')?.setValue(this.drugFrequenciesList.find((x: any) => x.FrequencyID == event.target.value));
  }
  onInstructionSelected(item: any) {
    this.instructionToNurseForm.patchValue({
      NurseInstructions: item.Name,
      NurseInstructionId: item.DoctorInstructionId
    })
  }

  addInstructionsToNurse() {
    const newInstructions = this.selectedInstructionsList.filter((element: any) => element.isNewInstruction);
    if(newInstructions.length > 0) {
      this.errorMessage = 'Please save before adding new instruction.';
      $('#errorMsg1').modal('show');
      return;
    }
    this.addNursingInstructionsFormSubmitted = true;
    
      var freqTimearr = this.instructionToNurseForm.get('FrequencyId')?.value === '0' ? this.drugFrequenciesList.find((x: any) => x.FrequencyID == '1') : this.instructionToNurseForm.get('FrequencyTime')?.value;
      var noofdays = this.instructionToNurseForm.get('NoofDays')?.value;
      if(noofdays.length==0){
        this.instructionToNurseForm.patchValue({
          NoofDays:'1'
        })
        noofdays = this.instructionToNurseForm.get('NoofDays')?.value;
      }   
    
      var inst = this.instructionToNurseForm.get('NurseInstructions')?.value;
      if (inst != '') {
        this.addNursingInstructionsFormSubmitted = false;
      // let instCount = freqTimearr.ScheduleTime.split('-').length * Number(noofdays);
      const ScheduleTime = moment(new Date()).format('HH:mm');
      if(freqTimearr.ScheduleTime=='')
         freqTimearr.ScheduleTime=ScheduleTime.split(':')[0];
     
     
        let instCount = freqTimearr.ScheduleTime.split('-');
        for (let noOfDay = 1; noOfDay <= noofdays; noOfDay++) {
          var schdate = moment(this.instructionToNurseForm.get('StartDate')?.value, "DD-MM-YYYY").add(Number(noOfDay) - 1, 'days');
          for (let i = 0; i < instCount.length; i++) {
            var FRQDT = moment(schdate).format('DD-MMM-yyyy');
            var FRQDTT = instCount[i] + ":00";
            this.selectedInstructionsList.unshift({
              InstructionId: this.instructionToNurseForm.get('NurseInstructionId')?.value,
              Instruction: this.instructionToNurseForm.get('NurseInstructions')?.value,
              // StartDate: moment(this.instructionToNurseForm.get('StartDate')?.value).format('DD-MMM-yyyy'),
              StartDate: FRQDT,
              FrequencyId: this.instructionToNurseForm.get('FrequencyId')?.value === '0' ? '1' : this.instructionToNurseForm.get('FrequencyId')?.value,
              Frequency: this.instructionToNurseForm.get('FrequencyId')?.value === '0' ? 'Once Daily' : this.instructionToNurseForm.get('Frequency')?.value,
              FrequencyTime: i >= freqTimearr.ScheduleTime.split('-').length ? freqTimearr.ScheduleTime.split('-')[i - freqTimearr.ScheduleTime.split('-').length] : freqTimearr.ScheduleTime.split('-')[i],
              NoofDays: this.instructionToNurseForm.get('NoofDays')?.value ? this.instructionToNurseForm.get('NoofDays')?.value : 1,
              StartDateTime: FRQDTT,
              DoctorName: this.doctorDetails[0].EmployeeName,
              isNewInstruction: true,
              isAcknowledge: false
            })
          }
        }
    }
    //this.instructionToNurseForm.reset();
    this.instructionToNurseForm.patchValue({
      NurseInstructions: '',
      NurseInstructionId: '',
      FrequencyId: '0',
      Frequency: '',
      FrequencyTime: '',
      StartDate: new Date(),
      NoofDays: ''
    });
    this.instructionsToNurse = [];
  }

  clearInstructionsToNurse() {
    //this.instructionToNurseForm.reset();
    this.instructionToNurseForm.patchValue({
      NurseInstructions: [''],
      NurseInstructionId: [''],
      FrequencyId: ['0'],
      Frequency: [''],
      FrequencyTime: [''],
      StartDate: new Date(),
      NoofDays: ''
    });
    this.addNursingInstructionsFormSubmitted = false;
    this.FetchPatientNursingInstructions();
  }


  saveAcknowledgeInstruction(index: any, inst: any) {
    var NurseInstDetails: any[] = [];
    NurseInstDetails.push({
      "FQID": inst.FrequencyId,
      "NOD": inst.NoofDays,
      "STDT": inst.StartDate,
      "FRQDT": inst.StartDate + ' ' + (inst.FrequencyTime == 24 ? "23:59" : inst.FrequencyTime + ":00"),
      "FRQDTT": inst.FrequencyTime == 24 ? "23:59" : inst.FrequencyTime + ":00",
      "STS": "1",
      "INDID": "376162 ",
      "ACKBY": this.doctorDetails[0].UserId,
      "ACKDT": moment(new Date()).format('DD-MMM-yyyy HH:mm:ss')

    })
    var ackPayload = {
      "InstructionID": 0,
      // "MonitorID": 0,
      "Instruction": inst.Instruction,
      "Instructiondate": inst.StartDate,
      "DoctorID": inst.DoctorId,
      "AdmissionID": this.AdmissionID,
      "STATUS": "0",
      "remarks": "",
      "IsFav": false,
      "Orderpackid": "0",
      "Hospitalid": this.hospId,
      "UserID": this.doctorDetails[0].UserId,
      "WorkStationID": this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID,
      "NurseInstDetails": NurseInstDetails
    }
    this.config.SaveNursingInstructionsAck(ackPayload).subscribe(response => {
      if (response.Code == 200) {
        $("#instructionAckSaveMsg").modal('show');
      }
    })


  }

  saveInstructionsToNurse() {
    var NurseInstDetails: any[] = [];
    const distinctInstructionIds = this.selectedInstructionsList.filter(
      (thing: any, i: any, arr: any) => arr.findIndex((t: any) => t.InstructionId === thing.InstructionId && t.isNewInstruction === true) === i);
    for (let i = 0; i < distinctInstructionIds.length; i++) {
      var instrs = this.selectedInstructionsList.filter((x: any) => x.InstructionId === distinctInstructionIds[i].InstructionId);
      NurseInstDetails = [];
      instrs.forEach((element: any) => {
        if (element.isNewInstruction) {
          NurseInstDetails.push({
            "FQID": element.FrequencyId,
            "NOD": element.NoofDays,
            "STDT": element.StartDate,
            "FRQDT": element.StartDate + ' ' + (element.FrequencyTime == 24 ? "23:59" : element.FrequencyTime + ":00"),
            "FRQDTT": element.FrequencyTime == 24 ? "23:59" : element.FrequencyTime + ":00",
          })
        }
      });

      var instructionsPayload =
      {
        "InstructionID": 0,
        // "MonitorID": 0,
        "Instruction": instrs[0].Instruction,
        "Instructiondate": instrs[0].StartDate,
        "DoctorID": this.doctorDetails[0].EmpId,
        "AdmissionID": this.AdmissionID,
        "STATUS": "0",
        "remarks": "",
        "IsFav": false,
        "Orderpackid": "0",
        "Hospitalid": this.hospId,
        "UserID": this.doctorDetails[0].UserId,
        "WorkStationID": this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID,
        "NurseInstDetails": NurseInstDetails,
        "PatientType": this.PatientType,
        "PatientID":this.PatientID
      }
      this.config.SavePatientNursingInstructions(instructionsPayload).subscribe(response => {
        if (response.Code == 200) {
          this.FetchPatientNursingInstructions();
          this.Savemsg = 'Instructions Saved Sucessfully ';
          $("#saveMsg").modal('show');
        }
      })
    }

  }

  FetchPatientNursingInstructions() {
    this.config.FetchPatientNursingInstructions(this.PatientID, this.AdmissionID, this.doctorDetails[0].UserId, this.facility.FacilityID==undefined?this.facility:this.facility.FacilityID, this.hospId).subscribe((response: any) => {
      if (response.Code == 200) {
        this.selectedInstructionsList = [];
        response.FetchPatientNursingInstructionsOutputLists.forEach((element: any, index: any) => {
          this.selectedInstructionsList.push({
            InstructionId: element.InstructionID,
            Instruction: element.Instruction,
            StartDate: element.ActualDate,
            StartDateTime: element.ActualTime,
            FrequencyId: element.FrequencyID,
            Frequency: element.Frequency,
            NoofDays: element.Noofdays,
            DoctorName: element.DoctorName,
            PerformedByName: element.PerformedByName,
            AcknowledgeBy: element.AcknowledgeBy,
            AcknowledgeByUser: element.AcknowledgeByUser,
            AcknowledgeDatetime: element.AcknowledgeDatetime,
            ActualDate: element.ActualDate,
            ActualTime: element.ActualTime,
            DoctorId: element.DoctorId,
            InstructionDetailsStatus: element.InstructionDetailsStatus,
            UserEmployeeName: element.UserEmployeeName,
            UserName: element.UserName,
            isNewInstruction: false,
            CREATEDATE: element.CREATEDATE,
          })
        });

      }
    }, error => {
      console.error('Get Data API error:', error);
    });
  }

  DeleteInstructionItem(index: any, item: any) {
    this.selectedInstructionsList.splice(index, 1);
  }

}
