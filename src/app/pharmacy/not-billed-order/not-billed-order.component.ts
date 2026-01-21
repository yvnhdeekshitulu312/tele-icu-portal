import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import { BaseComponent } from 'src/app/shared/base.component';
import { NotBilledOrderService } from './not-billed-order.service';

declare var jQuery: any;

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
  selector: 'app-not-billed-order',
  templateUrl: './not-billed-order.component.html',
  styleUrls: ['./not-billed-order.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class NotBilledOrderComponent extends BaseComponent implements OnInit {
  // @ViewChild(DatatableComponent) table!: DatatableComponent;
  // @ViewChild(DatatableComponent) table!: DatatableComponent;

  @ViewChild('serviceTable') serviceTable!: DatatableComponent;
  @ViewChild('pharmacyTable') pharmacyTable!: DatatableComponent;
  @ViewChild('navTabs') navTabs!: ElementRef;
  lang: string = '';
  hospitalId$: any = '';
  workStationId$: any = '';
  referralForm!: FormGroup;
  private subscription!: Subscription;
  NotBilledOrderListInitial: any = [];
  NotBilledOrderList: any = [];
  NotBilledOrderListData: any = [];
  mappedCompanyList: any = [];
  specializationList: any = [];
  skelLoader1: boolean = false;
  skelLoader2: boolean = false;
  loader = false;
  statusType = -1;
  selectedServiceList: any = [];
  aprrovalRequests: any = [];
  aprrovalRequestDetails: any = [];
  selectedPtForApproval: any;

  NotBilledPharmacyOrderList: any = [];
  NotBilledPharmacyOrderListData: any = [];

  NotBilledPharmacyOrderListCounts: any = {
    fullyIssued: 0,
    newOrder: 0,
    partiallyIssued: 0,
  };

  activeTab: string = 'PharmacyOrders';
  status: string = 'New Order';

  constructor(
    private fb: FormBuilder,
    public datepipe: DatePipe,
    private notBilledOrderService: NotBilledOrderService,
    private modalService: NgbModal,
    private router: Router
  ) {
    super();
    this.hospitalId$ = this.hospitalID;
    this.workStationId$ = JSON.parse(
      sessionStorage.getItem('facility') || '{}'
    );
  }
  ngOnInit(): void {
    this.lang = sessionStorage.getItem('language')!;
    this.initializeForms();
  }

  ngAfterViewInit() {
    window.dispatchEvent(new Event('resize'));
    // this.navTabs.nativeElement.addEventListener(
    //   'shown.bs.tab',
    //   (event: any) => {
    //     const target = event.target.getAttribute('data-bs-target');
    //     if (target === '#ServiceOrders' && this.serviceTable) {
    //       this.serviceTable.recalculate();
    //     } else if (target === '#PharmacyOrders' && this.pharmacyTable) {
    //       this.pharmacyTable.recalculate();
    //     }
    //   }
    // );
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  initializeForms() {
    this.referralForm = this.fb.group({
      fromDate: [new Date(), Validators.required],
      toDate: [new Date(), Validators.required],
      ssn: [''],
    });
    this.searchBillOrders();
  }

  searchBillOrders() {
    //this.getNotBilledOrders();
    this.notBilledPharmacyOrders();
  }

  getNotBilledOrders() {
    const searchPar = {
      fromDate: this.datepipe.transform(
        this.referralForm.get('fromDate')?.value,
        'dd-MMM-yyyy'
      ),
      toDate: this.datepipe.transform(
        this.referralForm.get('toDate')?.value,
        'dd-MMM-yyyy'
      ),
      ssn:
        this.referralForm.get('ssn')?.value === ''
          ? 0
          : this.referralForm.get('ssn')?.value,
      hospitalId: this.hospitalId$,
    };
    this.skelLoader1 = true;
    this.notBilledOrderService.fetchNotBilledOrders(searchPar).subscribe({
      next: (response: any) => {
        this.skelLoader1 = false;
        if (response.status == 'Success') {
          this.NotBilledOrderListInitial = response.data.length
            ? response.data.filter((x: any) => x.hospitalID == this.hospitalId$)
            : [];
          this.NotBilledOrderList = this.NotBilledOrderListInitial;
        }
      },
      complete: () => console.log('Completes with Success!'),
      error: (err) => {
        this.skelLoader1 = false;
      },
    });
  }

  notBilledPharmacyOrders() {
    const searchPar = {
      fromDate: this.datepipe.transform(
        this.referralForm.get('fromDate')?.value,
        'dd-MMM-yyyy'
      ),
      toDate: this.datepipe.transform(
        this.referralForm.get('toDate')?.value,
        'dd-MMM-yyyy'
      ),
      ssn:
        this.referralForm.get('ssn')?.value === ''
          ? 0
          : this.referralForm.get('ssn')?.value,
      hospitalId: this.hospitalId$,
    };
    this.skelLoader2 = true;
    this.notBilledOrderService.fetchPharmacyNotBilledOrders(searchPar).subscribe({
      next: (response: any) => {
        this.skelLoader2 = false;
        if (response.status == 'Success') {
          const pharmacyData = response.data.length
            ? response.data.filter((x: any) => x.hospitalID == this.hospitalId$)
            : [];
          if (pharmacyData.length > 0) {
            this.precomputePatientStatus(pharmacyData);
          }
        }
      },
      complete: () => console.log('Completes with Success!'),
      error: (err) => {
        this.skelLoader2 = false;
      },
    });
  }

  patientStatusMap: Record<number, string> = {};
  precomputePatientStatus(data: any[]) {
    const map: Record<
      number,
      { fully: number; newOrder: number; partial: number }
    > = {};

    for (const item of data) {
      const { admissionid, prescribedQtyLowest, issuedQtyLowest } = item;
      if (!map[admissionid]) {
        map[admissionid] = { fully: 0, newOrder: 0, partial: 0 };
      }

      if (issuedQtyLowest === prescribedQtyLowest) {
        map[admissionid].fully++;
      } else if (issuedQtyLowest === 0) {
        map[admissionid].newOrder++;
      } else if (issuedQtyLowest > 0 && issuedQtyLowest < prescribedQtyLowest) {
        map[admissionid].partial++;
      }
    }

    const statusMap: Record<number, string> = {};
    for (const [id, { fully, newOrder, partial }] of Object.entries(map)) {
      const total = fully + newOrder + partial;
      let status = '';
      if (fully === total) status = 'Fully Issued';
      else if (newOrder === total) status = 'New Order';
      else if (partial === total) status = 'Partially Issued';
      else status = 'Partially Issued';

      statusMap[+id] = status;
    }

    for (const item of data) {
      item.status = statusMap[item.admissionid] || 'Unknown';

      if (item.isDisPrescription === 1) {
        item.orderStatus = 'Discharge Medication';
      } else if (item.isDisPrescription === 0 && item.orderType === 'STAT') {
        item.orderStatus = 'STAT';
      } else {
        item.orderStatus = 'Normal';
      }
    }

    this.patientStatusMap = statusMap;
    this.NotBilledPharmacyOrderList = data;
    this.NotBilledPharmacyOrderListData = data;
    if (this.NotBilledPharmacyOrderList.length > 0) {
      this.calculateOrderCounts();
    }
  }

  getPatientStatusLabel(admissionid: number): string {
    return this.patientStatusMap[admissionid] || 'Unknown';
  }

  calculateOrderCounts() {
    console.log('Calculating order counts...', this.NotBilledPharmacyOrderList);
    const counts = Object.values(this.patientStatusMap).reduce(
      (acc, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    this.NotBilledPharmacyOrderListCounts.fullyIssued =
      counts['Fully Issued'] || 0;
    this.NotBilledPharmacyOrderListCounts.newOrder = counts['New Order'] || 0;
    this.NotBilledPharmacyOrderListCounts.partiallyIssued =
      counts['Partially Issued'] || 0;
  }

  filterPharmacyOrderByStatus(status: string) {
    this.NotBilledPharmacyOrderList =
      this.NotBilledPharmacyOrderListData.filter(
        (item: any) => item.status === status
      );
  }

  filterPharmacyByOrderType(status: string) {
    this.NotBilledPharmacyOrderList =
      this.NotBilledPharmacyOrderListData.filter(
        (item: any) => item.orderStatus === status
      );
  }

  calculateBillAmount(grp: any) {
    return grp.reduce((sum: any, item: any) => sum + (item.unitRate || 0), 0);
  }

  toggleExpandGroup(group: string) {
    this.serviceTable.groupHeader.toggleExpandGroup(group);
  }

  toggleExpandGroup2(group: string) {
    this.pharmacyTable.groupHeader.toggleExpandGroup(group);
  }

  private lastPatientIdRendered: any = null;

  isFirstRowInGroup(row: any): boolean {
    const isNewGroup = row.admissionid !== this.lastPatientIdRendered;
    if (isNewGroup) {
      this.lastPatientIdRendered = row.admissionid;
    }
    return isNewGroup;
  }

  opNavigation(item: any) {
    sessionStorage.setItem('fromNotBilledOrders', 'true');
    sessionStorage.setItem('patientID', item.patientId);
    sessionStorage.setItem('ssn', item.ssn);
    this.router.navigate(['/pharmacy/cashissue']);
  }

  clearList() {
    this.NotBilledPharmacyOrderList = [];
    this.NotBilledPharmacyOrderListData = [];
    this.NotBilledOrderList = [];
    this.referralForm.reset();
  }

  viewApprovals(item: any) {
    this.selectedPtForApproval = item;
    var visitid =
      this.selectedPtForApproval?.admissionID ??
      this.selectedPtForApproval?.admissionid;
    this.notBilledOrderService
      .FetchApprovalRequestAdv(
        visitid,
        this.doctorDetails[0].UserId,
        this.facilitySessionId,
        this.hospitalId$
      )
      .subscribe(
        (response: any) => {
          jQuery('#viewApprovalsModal').modal('show');
          if (response.ApprovalRequestsDataList.length > 0) {
            this.aprrovalRequests = response.ApprovalRequestsDataList;
            this.aprrovalRequestDetails =
              response.ApprovalRequestDetailsDataList;
            this.aprrovalRequestDetails.forEach((element: any) => {
              if (element.ClaimStatusID == '0') {
                element.class = 'status red';
              } else if (element.ClaimStatusID == '') {
                element.class = 'status green';
              } else if (element.ClaimStatusID == '') {
                element.class = 'status green';
              } else if (element.ClaimStatusID == '') {
                element.class = 'status green';
              }
            });
          }
        },
        (err) => {}
      );
  }

  getStripedColor(rowIndex: string | number): string {
    const index =
      typeof rowIndex === 'string' && rowIndex.includes('-')
        ? parseInt(rowIndex.split('-')[1], 10)
        : Number(rowIndex);

    return index % 2 === 0 ? '#f5f5f5' : '#ffffff';
  }
}
