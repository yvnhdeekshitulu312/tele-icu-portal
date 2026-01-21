import { Component, OnInit } from '@angular/core';
import { IndividualProcessingService } from './individualprocessing.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { individualProcessing } from './urls';
import { Router } from '@angular/router';
import { ConfigService as PresConfig } from 'src/app/services/config.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientfolderComponent } from 'src/app/shared/patientfolder/patientfolder.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { PatientfoldermlComponent } from 'src/app/shared/patientfolderml/patientfolderml.component';
import { ConfigService } from '../services/config.service';

declare var $: any;


@Component({
  selector: 'app-individual-processing',
  templateUrl: './individual-processing.component.html',
  styleUrls: ['./individual-processing.component.scss'],
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
export class IndividualProcessingComponent extends BaseComponent implements OnInit {
  datesForm: any;
  url: any;
  FetchIndividualProcessingDataList: any = [];
  FetchIndividualProcessingDataList1: any = [];
  toDate = new FormControl(new Date());
  totalCount: any = 1;
  currentPage: any = 1;
  listOfWards: any = [];
  listOfBeds: any = [];
  pinfo: any;
  trustedUrl: any;
  errorMessages: any = [];
  showNoRecFound: boolean = true;
  groupedData!: any;
  showDischargeMedication: boolean = false;
  selectedWardIndProcDet: any;
  selectedStatus: string = 'New Request'; 

  constructor(private router: Router, private us: UtilityService, public datepipe: DatePipe, private service: IndividualProcessingService, public formBuilder: FormBuilder, private presconfig: PresConfig, private modalService: GenericModalBuilder, private config: ConfigService) {
    super();
    this.service.param = {
      ...this.service.param,
      UserID: this.doctorDetails[0]?.UserId ?? this.service.param.UserID,
      HospitalID: this.hospitalID ?? this.service.param.HospitalID,
      WorkStationID: this.facilitySessionId ?? this.service.param.WorkStationID
    };

    this.datesForm = this.formBuilder.group({
      fromdate: this.toDate.value,
      todate: this.toDate.value,
      SSN: [''],
      StatFilter: [false]
    });
  }

  ngOnInit(): void {
    this.selectedWardIndProcDet = JSON.parse(sessionStorage.getItem("selectedWardIndProcDet") || '{}');
    if (this.selectedWardIndProcDet) {
      this.service.param.WardID = this.selectedWardIndProcDet.ID == undefined ? 0 : this.selectedWardIndProcDet.ID;
      $("#wardSearch").val(this.selectedWardIndProcDet.Name);
    }
    this.FetchIndividualProcessing(false);
  }
  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.FetchIndividualProcessing(false);
    }
  }
  onEnterChange() {
    this.FetchIndividualProcessing();
  }
  clearViewScreen() {
    this.FetchIndividualProcessingDataList = [];
    this.FetchIndividualProcessingDataList1 = [];
    this.service.param.WardID = 0;
    this.service.param.BedID = 0;
    this.listOfWards = [];
    this.listOfBeds = [];
    this.showDischargeMedication = false;
    $("#wardSearch").val('');
    $("#BedSearch").val('');
    $("#ssn").val('');
    var d = new Date();
    this.datesForm = this.formBuilder.group({
      fromdate: this.toDate.value,
      todate: this.toDate.value,
      SSN: [''],
      StatFilter: [false]
    });
    this.groupedData = [];
    this.FetchIndividualProcessing(true);
  }

  FetchIndividualProcessing(showWardMsg: boolean = true) {
    const fromDate = this.datesForm.get('fromdate').value;
    const todate = this.datesForm.get('todate').value;
    if (fromDate !== null && fromDate !== undefined) {
      this.service.param.FromDate = this.datepipe.transform(fromDate, "dd-MMM-yyyy")?.toString() ?? '';
    }

    if (todate !== null && todate !== undefined) {
      this.service.param.ToDate = this.datepipe.transform(todate, "dd-MMM-yyyy")?.toString() ?? '';
    }

    this.service.param = {
      ...this.service.param,
      SSN: this.datesForm.get('SSN').value ? this.datesForm.get('SSN').value : 0,
      STAT: this.datesForm.get('StatFilter').value ? 1 : 0,
    };

    // if((this.service.param.WardID === undefined || this.service.param.WardID === 0) && showWardMsg) {
    //   this.errorMessages = [];
    //   this.errorMessages.push("Please select Ward");
    //   $("#errorMessageModal").modal("show");
    //   return;
    // }

    this.url = this.service.getData(individualProcessing.fetchData);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {

          this.FetchIndividualProcessingDataList = this.FetchIndividualProcessingDataList1 = response.FetchIndividualProcessingDataList;
          this.totalCount = response.FetchIndividualProcessingCountList[0]?.TotalCount || 0;
          this.FetchIndividualProcessingDataList.forEach((element: any, index: any) => {
            element.ItemSelected = false;
            element.itemSelectClass = "custom_check d-flex align-items-center";
            if (element.Status == 1)
              element.Class = "doctor_worklist doc_card shadow-0 rounded worklist_patientcard prescribed";
            else if (element.Status == 2)
              element.Class = "doctor_worklist doc_card shadow-0 rounded worklist_patientcard partial";
            else if (element.Status == 3)
              element.Class = "doctor_worklist doc_card shadow-0 rounded worklist_patientcard issued";
          });
          if (this.FetchIndividualProcessingDataList.length > 0) {
            this.showNoRecFound = false;
          } else
            this.showNoRecFound = true;


          this.groupedData = this.groupByDate(this.FetchIndividualProcessingDataList)
        }
      },
        (err) => {

        })
  }

  handlePageChange(newPage: any) {
    this.service.param = {
      ...this.service.param,
      Min: newPage.min > 0 ? newPage.min + 1 : newPage.min,
      Max: newPage.max
    };

    this.FetchIndividualProcessing();
  }

  searchWard(event: any) {
    var filter = event.target.value;
    if (filter.length >= 3) {
      this.service.param.Name = filter;
      this.url = this.service.getData(individualProcessing.wardSearch);

      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfWards = response.FetchSSWardsDataList;
          }
        },
          (err) => {

          })
    }

    else {
      this.listOfWards = [];
    }
  }

  onItemSelected(ward: any) {
    this.service.param.WardID = ward.ID;
    sessionStorage.setItem('selectedWardIndProc', JSON.stringify(ward));
    this.listOfWards = [];
    this.FetchIndividualProcessing();
  }

  searchBed(event: any) {
    var filter = event.target.value;
    if (filter.length >= 3) {
      this.service.param.Name = filter;
      this.url = this.service.getData(individualProcessing.BedSearch);
      this.us.get(this.url)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.listOfBeds = response.FetchAllBedsDataList;
          }
        },
          (err) => {

          })
    }

    else {
      this.listOfBeds = [];
    }
  }
  onItemBedSelected(Bed: any) {
    this.service.param.BedID = Bed.BedID;
    this.listOfBeds = [];
    this.FetchIndividualProcessing();
  }

  toggleFilter() {
    this.datesForm.get('StatFilter').setValue(!this.datesForm.get('StatFilter').value);
    this.FetchIndividualProcessing();
  }

  navigateToDetails(data: any) {
    sessionStorage.setItem("individualprocess", JSON.stringify(data));
    this.router.navigate(['/pharmacy/individual-details'])
  }

  showPatientInfo(pinfo: any) {
    pinfo.AdmissionID = pinfo.IPID;
    pinfo.HospitalID = this.hospitalID;
    this.pinfo = pinfo;
    $("#quick_info").modal('show');

  }
  clearPatientInfo() {
    this.pinfo = "";
  }

  showViewBulkProcessingPrint() {
    if (this.individualProcess.Status != '1') {
      this.presconfig.FetchItemStickerPrint(this.individualProcess.PatientID, this.individualProcess.PrescriptionID, this.individualProcess.WardID, this.doctorDetails[0].UserId, this.doctorDetails[0].UserName, this.facilitySessionId, this.hospitalID)
        .subscribe((response: any) => {
          if (response.Code == 200) {
            this.trustedUrl = response?.FTPPATH
            this.showModal()
          }
        },
          (err) => {
          })
    } else {
      this.errorMessages = [];
      this.errorMessages.push("Selected Order is not Issued");
      $("#errorMessageModal").modal("show");
    }

  }
  showModal(): void {
    $("#reviewAndPayment").modal('show');
  }
  viewselectItemForPatient(item: any) {
    var item = this.FetchIndividualProcessingDataList.find((x: any) => x.PrescriptionID === item.PrescriptionID);
    this.individualProcess = item;
    this.FetchIndividualProcessingDataList.forEach((element: any, index: any) => {
      element.ItemSelected = false;
      element.itemSelectClass = "custom_check d-flex align-items-center w-100";
    });
    if (!item.ItemSelected) {
      item.ItemSelected = true;
      item.itemSelectClass = "custom_check d-flex align-items-center w-100 active";
    }
    else {
      item.ItemSelected = false;
      item.itemSelectClass = "custom_check d-flex align-items-center w-100";
    }
  }

  private groupByDate(data: any[]): { date: string; items: any[] }[] {
    return data.reduce((acc, response) => {
      const dateOnly = this.getDateOnly(response.OrderDate);
      const existingGroup = acc.find((group: any) => group.date === dateOnly);

      if (existingGroup) {
        existingGroup.items.push(response);
      } else {
        acc.push({ date: dateOnly, items: [response] });
      }

      return acc;
    }, []);
  }

  private getDateOnly(datetime: string): string {
    const dateObject = new Date(datetime);
    const year = dateObject.getFullYear();
    const month = ('0' + (dateObject.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObject.getDate()).slice(-2);
    return `${month}/${day}/${year}`;
  }

  filterStatus(status: string) {
    this.selectedStatus = status;
      this.FetchIndividualProcessingDataList = this.FetchIndividualProcessingDataList1.filter((x: any) => {
        if (status === 'New Request') return x.Status === 1;
        if (status === 'Partially Issued') return x.Status === 2;
        return false;
      });
      this.totalCount = this.FetchIndividualProcessingDataList[0]?.TotalCount || 0;
      this.FetchIndividualProcessingDataList.forEach((element: any, index: any) => {
        element.ItemSelected = false;
        element.itemSelectClass = "custom_check d-flex align-items-center";
        if (element.Status == 1)
          element.Class = "doctor_worklist doc_card shadow-0 rounded worklist_patientcard prescribed";
        else if (element.Status == 2)
          element.Class = "doctor_worklist doc_card shadow-0 rounded worklist_patientcard partial";
        else if (element.Status == 3)
          element.Class = "doctor_worklist doc_card shadow-0 rounded worklist_patientcard issued";
      });
      if (this.FetchIndividualProcessingDataList.length > 0) {
        this.showNoRecFound = false;
      } else
        this.showNoRecFound = true;


      this.groupedData = this.groupByDate(this.FetchIndividualProcessingDataList)
  }

  filterDischargeMed() {
    this.showDischargeMedication = !this.showDischargeMedication;
    if (this.showDischargeMedication) {
      this.FetchIndividualProcessingDataList = this.FetchIndividualProcessingDataList1.filter((x: any) => x.isDisPrescription === true);
      this.totalCount = this.FetchIndividualProcessingDataList.length || 0;
      this.FetchIndividualProcessingDataList.forEach((element: any, index: any) => {
        element.ItemSelected = false;
        element.itemSelectClass = "custom_check d-flex align-items-center";
        if (element.Status == 1)
          element.Class = "doctor_worklist doc_card shadow-0 rounded worklist_patientcard prescribed";
        else if (element.Status == 2)
          element.Class = "doctor_worklist doc_card shadow-0 rounded worklist_patientcard partial";
        else if (element.Status == 3)
          element.Class = "doctor_worklist doc_card shadow-0 rounded worklist_patientcard issued";
      });
      if (this.FetchIndividualProcessingDataList.length > 0) {
        this.showNoRecFound = false;
      } else
        this.showNoRecFound = true;

      this.groupedData = this.groupByDate(this.FetchIndividualProcessingDataList);
    }
    else {
      this.FetchIndividualProcessing();
    }
  }

  openPatientSummary() {
    const options: NgbModalOptions = {
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(PatientfoldermlComponent, { readonly: true }, options);
  }

  PatientPrintCard(item: any) {
    this.config.FetchRegistrationAdmissionCard(item.UHID, item.IPID, this.doctorDetails[0]?.UserId, this.ward.FacilityID, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH;
          $("#caseRecordModal").modal('show');
        }
      },
        (err) => {

        })
  }
}

export interface ProcessingData {
  date: string;
  items: any[];
}
