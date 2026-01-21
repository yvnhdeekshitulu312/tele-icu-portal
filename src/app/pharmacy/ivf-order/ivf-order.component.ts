import { Component, OnInit } from '@angular/core';
import { IvfOrderService } from './ivf-order.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Router } from '@angular/router';
import { ConfigService as PresConfig } from 'src/app/services/config.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PatientfolderComponent } from 'src/app/shared/patientfolder/patientfolder.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { PatientfoldermlComponent } from 'src/app/shared/patientfolderml/patientfolderml.component';

declare var $: any;

@Component({
  selector: 'app-ivf-order',
  templateUrl: './ivf-order.component.html',
  styleUrls: ['./ivf-order.component.scss'],
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
export class IvfOrderComponent extends BaseComponent implements OnInit {
  datesForm: any;
  url: any;
  FetchIvFluidProcessingDataList: any = [];
  FetchIvFluidProcessingDataList1: any = [];
  toDate = new FormControl(new Date());
  totalCount: any = 1;
  currentPage: any = 1;
  listOfWards: any = [];
  pinfo: any;
  trustedUrl: any;
  errorMessages: any = [];
  showNoRecFound: boolean = true;
  groupedData!: any;
  showDischargeMedication: boolean = false;
  selectedStatus: string = 'New Request'; 
  listOfBeds: any = [];
  BedID: number = 0;

  constructor(private router: Router, private us: UtilityService, public datepipe: DatePipe, private service: IvfOrderService, public formBuilder: FormBuilder,private presconfig: PresConfig, private modalService: GenericModalBuilder) {
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
    this.wardID=0;
    
    if(sessionStorage.getItem("ivfOrderDetailsWard")) {
      const selectedWard = JSON.parse(sessionStorage.getItem("ivfOrderDetailsWard") || '{}');
      if (selectedWard.WardID) {
        this.wardID = selectedWard.WardID;
        $("#wardSearch").val(selectedWard.Ward);
        sessionStorage.removeItem("ivfOrderDetailsWard")
      }
    }
    this.FetchIVFProcessing();
  }
  onEnterPress(event: any) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.FetchIVFProcessing();
    }
  }
  onEnterChange() {   
      this.FetchIVFProcessing();    
  }
  clearViewScreen() {
    this.wardID=0;
    this.FetchIvFluidProcessingDataList = [];  
    this.FetchIvFluidProcessingDataList1=[]; 
    this.service.param.WardID = 0;
    this.showDischargeMedication = false;
    this.listOfWards = [];   
    $("#wardSearch").val('');
    $("#ssn").val('');
    var d = new Date();
    this.datesForm = this.formBuilder.group({
      fromdate: this.toDate.value,
      todate: this.toDate.value,
      SSN: [''],
      StatFilter: [false]
    });
    this.FetchIVFProcessing();   
  }

  FetchIVFProcessing() {
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
      WardID:this.wardID,
      BedID: this.BedID
    };

    this.url = this.service.getData(ivforder.fetchData);

    this.us.get(this.url)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          
          this.FetchIvFluidProcessingDataList =this.FetchIvFluidProcessingDataList1= response.FetchIVFluidRequestHDataList;
          this.totalCount = response.FetchIVFluidRequestHDataList[0]?.TotalCount || 0;
          this.FetchIvFluidProcessingDataList.forEach((element: any, index: any) => {
            element.ItemSelected = false;      
            element.itemSelectClass = "custom_check d-flex align-items-center";      
            // if (element.SalesID != '')
            //   element.Class = "doctor_worklist rounded worklist_patientcard issued";
            // else 
            //   element.Class = "doctor_worklist rounded worklist_patientcard prescribed";
            // else if (element.Status == 3)
              //element.Class = "doctor_worklist rounded worklist_patientcard prescribed";

            if (element.PrescriptionOrderStatus == 1)
              element.Class = "doc_card doctor_worklist shadow-0 rounded worklist_patientcard prescribed";
            else if (element.PrescriptionOrderStatus == 2)
              element.Class = "doc_card doctor_worklist shadow-0 rounded worklist_patientcard partial";
            else if (element.PrescriptionOrderStatus == 3)
              element.Class = "doc_card doctor_worklist shadow-0 rounded worklist_patientcard issued";


          });
          if (this.FetchIvFluidProcessingDataList.length > 0) {
            this.showNoRecFound = false;
          }else 
          this.showNoRecFound = true;

          this.groupedData = this.groupByDate(this.FetchIvFluidProcessingDataList)

          this.filterDischargeMed(this.selectedStatus);

        }
      },
        (err) => {

        })
  }
  private groupByDate(data: any[]): { date: string; items: any[] }[] {
    return data.reduce((acc, response) => {
      const dateOnly = this.getDateOnly(response.RequestDate);
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

  handlePageChange(newPage: any) {
    this.service.param = {
      ...this.service.param,
      Min: newPage.min > 0 ? newPage.min + 1 : newPage.min,
      Max: newPage.max
    };

    this.FetchIVFProcessing();
  }

  searchWard(event: any) {
    var filter = event.target.value;
    if (filter.length >= 3) {
      this.service.param.Name = filter;
      this.url = this.service.getData(ivforder.wardSearch);

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
    this.listOfWards = [];
    this.wardID= ward.ID;
    this.FetchIVFProcessing();
  }

  toggleFilter() {
    this.datesForm.get('StatFilter').setValue(!this.datesForm.get('StatFilter').value);
    //this.FetchIVFProcessing();   
    this.filterDischargeMed(this.selectedStatus);
  }

  navigateToDetails(data: any) {
    sessionStorage.setItem("ivfprocess", JSON.stringify(data));
    this.router.navigate(['/pharmacy/ivf-order-details'])
  }

  showPatientInfo(pinfo: any) {    
    pinfo.AdmissionID = pinfo.AdmissionID;
    pinfo.HospitalID = this.hospitalID;
    this.pinfo = pinfo;
    $("#quick_info").modal('show');
    
  }
  clearPatientInfo() {
    this.pinfo = "";
  }

  showViewBulkProcessingPrint() {        
    if(this.individualProcess.Status!='1'){
      this.presconfig.FetchItemStickerPrint(this.individualProcess.PatientID, this.individualProcess.PrescriptionID, this.individualProcess.WardID, this.doctorDetails[0].UserId, this.doctorDetails[0].UserName,this.facilitySessionId, this.hospitalID)
      .subscribe((response: any) => {
        if (response.Code == 200) {
          this.trustedUrl = response?.FTPPATH
          this.showModal()
        }
      },
        (err) => {
        })
    }else {
      this.errorMessages = [];
      this.errorMessages.push("Selected Order is not Issued");
      $("#errorMessageModal").modal("show");
    }
   
}
showModal(): void {
  $("#reviewAndPayment").modal('show');
}
viewselectItemForPatient(item: any) {
  var item = this.FetchIvFluidProcessingDataList.find((x: any) => x.PrescriptionID === item.PrescriptionID);
  this.individualProcess=item;
  this.FetchIvFluidProcessingDataList.forEach((element: any, index: any) => {
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

filterDischargeMed(status: string) {
  this.selectedStatus = status;

  this.FetchIvFluidProcessingDataList = this.FetchIvFluidProcessingDataList1.filter((x: any) => {
    if (status === 'New Request') return x.PrescriptionOrderStatus === '1';
    if (status === 'Partially Issued') return x.PrescriptionOrderStatus === '2';
    return false;
  });

  if(this.datesForm.get('StatFilter').value) {
    this.FetchIvFluidProcessingDataList = this.FetchIvFluidProcessingDataList.filter((x:any) => x.OrderTypeID === '47');
  }
  this.totalCount = this.FetchIvFluidProcessingDataList.length || 0;
  this.showNoRecFound = this.totalCount === 0;

  this.FetchIvFluidProcessingDataList.forEach((element: any) => {
    element.ItemSelected = false;      
    element.itemSelectClass = "custom_check d-flex align-items-center";  
    element.Class = this.getClassForStatus(element.PrescriptionOrderStatus);
  });

  this.groupedData = this.groupByDate(this.FetchIvFluidProcessingDataList);
}

getClassForStatus(status: string): string {
  switch (status) {
    case '1': return "doc_card doctor_worklist shadow-0 rounded worklist_patientcard prescribed";
    case '2': return "doc_card doctor_worklist shadow-0 rounded worklist_patientcard partial";
    case '3': return "doc_card doctor_worklist shadow-0 rounded worklist_patientcard issued";
    default: return "";
  }
}

searchBed(event: any) {
    var filter = event.target.value;
    if (filter.length >= 3) {
      this.service.param.Name = filter;
      this.url = this.service.getData(ivforder.BedSearch);
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
    this.BedID = Bed.BedID;
    this.listOfBeds = [];
    this.FetchIVFProcessing();
  }

  openPatientSummary() {
    const options: NgbModalOptions = {
      windowClass: 'vte_view_modal'
    };
    const modalRef = this.modalService.openModal(PatientfoldermlComponent, { readonly: true }, options);
  }

}

export const ivforder = {
  fetchData: 'FetchIVFluidRequestH?FromDate=${FromDate}&ToDate=${ToDate}&SSN=${SSN}&WardID=${WardID}&BedID=${BedID}&UserID=${UserID}&WorkStationID=0&HospitalID=${HospitalID}',
  wardSearch: 'FetchSSWards?Name=${Name}&HospitalID=${HospitalID}',
  BedSearch: 'FetchAllBeds?Name=${Name}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
};