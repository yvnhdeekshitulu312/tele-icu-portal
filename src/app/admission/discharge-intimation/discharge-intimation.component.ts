import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ConfigService } from 'src/app/services/config.service';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { pendingOrderListComponent } from './view-pending-order/view-pending-order.component';
import { InPatientDischargeSummaryComponent } from 'src/app/shared/inpatient-discharge-summary/inpatient-discharge-summary.component';
import { GenericModalBuilder } from 'src/app/shared/generic-modal-builder.service';
import { CommonService } from 'src/app/shared/common.service';
import { MedicalReportComponent } from 'src/app/shared/medical-report/medical-report.component';

@Component({
  selector: 'app-discharge-intimation',
  templateUrl: './discharge-intimation.component.html',
  styleUrls: ['./discharge-intimation.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class DischargeIntimationComponent extends BaseComponent implements OnInit {
  lang: string = '';
  hospitalId$: any = '';
  workStationId$: any = '';
  dischargeForm!: FormGroup;
  private subscription!: Subscription;
  selectedPayerId = 0;
  dischargeIntimationList: any = [];
  mappedCompanyList: any = [];
  skelLoader: boolean = false;
  loader = false;
  virtualDischarge: boolean = false;
  facilityId: any;
  constructor(private fb: FormBuilder,
    public datepipe: DatePipe, private config: ConfigService, private modalService: NgbModal, private modalServiceGlobal: GenericModalBuilder, private common: CommonService,) {
    super()
    this.facilityId = JSON.parse(sessionStorage.getItem("FacilityID") || '{}');
  }

  ngOnInit(): void {
    this.initializeForms();
  }

  initializeForms() {
    this.dischargeForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
    });
    this.searchDischargeIntimationList();
  }

  searchDischargeIntimationList() {
    const searchPar = {
      tbl: '2',
      fromDate: this.datepipe.transform(
        this.dischargeForm.get('fromDate')?.value,
        'dd-MMM-yyyy'
      ),
      toDate: this.datepipe.transform(
        this.dischargeForm.get('toDate')?.value,
        'dd-MMM-yyyy'
      ),
      userId: this.doctorDetails[0]?.UserId,
      hospitalId: this.hospitalID,
      workStationId: 3395, //this.facilityId ??
    };
    if (searchPar.toDate == null) {
      return;
    }
    this.config.fetchbedtransferrequests(searchPar).subscribe({
      next: (response: any) => {
        if (response.status == 'Success') {
          this.dischargeIntimationList = response.data || [];
          if (response.data.length > 0 && this.virtualDischarge) {
            this.dischargeIntimationList = response.data.filter((x: any) => x.isVirtualDischarge === 1);
          }
          else {
            this.dischargeIntimationList = response.data.filter((x: any) => x.isVirtualDischarge === 0);
          }
          console.log(
            'this.dischargeIntimationList',
            this.dischargeIntimationList
          );
        }
      },
      complete: () => console.log('Completes with Success!'),
      error: (err) => {
        this.skelLoader = false;
      },
    });
  }

  clearList() {
    this.dischargeIntimationList = [];
    this.dischargeForm.reset();
    sessionStorage.removeItem('ALPatientDischargeIntimation');
  }

  pendingOrderView(ipID: any) {
    if (ipID) {
      const searchParam = {
        ipid: ipID,
        tariffId: 0,
        serviceId: 0,
        type: 0,
        userId: this.doctorDetails[0]?.UserId,
        hospitalId: this.hospitalID,
        workStationId: 3395, //this.facilityId ?? 
      };
      this.config
        .viewPendingOrderDischargeIntimation(searchParam)
        .subscribe({
          next: (response: any) => {
            this.loader = false;
            if (response.status == 'Success') {
              if (response.data && response.data.ipPendingServicesData.length) {
                const modalRef = this.modalService.open(
                  pendingOrderListComponent,
                  {
                    ariaLabelledBy: 'modal-basic-title',
                    centered: true,
                    backdrop: 'static',
                    keyboard: false,
                    size: 'xl',
                    windowClass: 'pendingOrders_modal',
                  }
                );
                // Need to replace
                modalRef.componentInstance.pendingOrderData =
                  response.data.ipPendingServicesData;
                modalRef.result.then((result: any) => {
                  if (result) {
                    if (result) {
                    }
                  } else {
                  }
                });
              }
            }
          },
          complete: () => console.log('Completes with Success!'),
          error: (err) => {
            this.loader = false;
          },
        });
    }
  }

  ipRedirection(data: any) {
    if (data?.ssn) {
      // const jsonData = {
      //   patientSsn: data?.ssn,
      //   from: 'dischargeIntimation',
      // };
      // sessionStorage.setItem(
      //   'ALPatientDischargeIntimation',
      //   JSON.stringify(jsonData)
      // );
      // this.router.navigate(['/ip/ip-billing']);
    }
  }

  openDischargeSummary(dissum: any) {
    this.common.fetchPatientVistitInfo(dissum.ipid, dissum.patientID).subscribe({
      next: (response) => {
        if (response?.Code === 200 && response.FetchPatientVistitInfoDataList.length > 0) {
          const options: NgbModalOptions = {
            size: 'xl',
            windowClass: 'vte_view_modal',
          };
          const modalRef = this.modalServiceGlobal.openModal(InPatientDischargeSummaryComponent, {
            data: dissum,
            readonly: true,
            fromshared: true,
            isEdit: false,
            admissionID: dissum.ipid,
          }, options);
        }
      },
      error: (err) => {
        console.error("Error fetching patient details", err);
      }
    });

  }

  openMedicalReport(dissum: any) {
    dissum.MedicalReportID = dissum.MedicalReportID ?? 1;
    this.common.fetchPatientVistitInfo(dissum.ipid, dissum.patientID).subscribe({
      next: (response) => {
        if (response?.Code === 200 && response.FetchPatientVistitInfoDataList.length > 0) {
          const options: NgbModalOptions = {
            size: 'xl',
            windowClass: 'vte_view_modal',
          };
          const modalRef = this.modalServiceGlobal.openModal(MedicalReportComponent, {
            data: dissum,
            readonly: true,
            fromshared: true,
            isEdit: false,
            admissionID: dissum.ipid,
            fromdischarge: true
          }, options);
        }
      },
      error: (err) => {
        console.error("Error fetching patient details", err);
      }
    });

  }
}