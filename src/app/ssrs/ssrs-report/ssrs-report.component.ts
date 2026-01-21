import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import * as moment from 'moment';
import * as XLSX from 'xlsx';

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
  selector: 'app-ssrs-report',
  templateUrl: './ssrs-report.component.html',
  styleUrls: ['./ssrs-report.component.scss'],
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
export class SsrsReportComponent extends BaseComponent implements OnInit {
  facility: any;
  facilityId: any;
  trustedUrl: any = '';
  searchText: any = '';
  filteredReports: any = [];
  moduleId: any;
  reports: any;
  selectedReport: any = '';
  showSections: boolean = true;
  misReports : string = "1283,109";
  scrollUsers: any = [];
  scrollUserId: string = "0";
  ipOutstandingReportForm!: FormGroup;
  dialyCollectionReportForm!: FormGroup;
  billType: string = "0";
  collectionDate: string = "";
  dailyCollectionData: any = [];
  ipOutstandingData: any = [];
  depositcheckingReportData: any = [];

  constructor(private us: UtilityService, private route: ActivatedRoute, public formBuilder: FormBuilder) {
    super();

    this.ipOutstandingReportForm = this.formBuilder.group({
      fromdate: new Date(),
      todate: new Date()
    });
    this.dialyCollectionReportForm = this.formBuilder.group({
      fromdate: new Date(),
      todate: new Date()
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.moduleId = params.get('moduleId');
    });
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID;
    this.fetchReports();
    this.collectionDate = moment(new Date()).format('DD-MMM-YYYY')
  }

  fetchReports() {
    const url = this.us.getApiUrl(Reports.FetchReportsByUser, {
      ModuleID: this.moduleId,
      UserID: this.doctorDetails[0].UserId,
      WorkStationID: this.facilityId,
      HospitalID: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.reports = this.filteredReports = response.FetchReportsByUserDataList;
      }
    });
  }

  filterReports(event: any) {
    this.filteredReports = this.reports.filter((template: any) =>
      template.ReportTitle.toLowerCase().includes(event.target.value.toLowerCase())
    );
  }

  selectReport(report: any) {
    this.selectedReport = report;
    // if(report.ReportID === '1283') {
    //   this.getScrollUsers();
    // }
  }

  changeView() {
    this.showSections = !this.showSections;
    if (!this.showSections) {
      $('.pat_lefnav').parent().addClass("d-none");
      $('.pat_rightcontent').addClass("pat_rightcontent_expanded");
    }
    else {
      $('.pat_lefnav').parent().removeClass("d-none");
      $('.pat_rightcontent').removeClass("pat_rightcontent_expanded");
    }
  }

  showMISReport(report: any) {
    return this.misReports.split(',').includes(report.ReportID);
  }

  getScrollUsers() {
    const url = this.us.getApiUrl(Reports.FetchScrollUsersAdv, {
      userId: this.doctorDetails[0].UserId,
      workstationId: this.facilityId,
      hospitalId: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      //if (response.Code === 200) {
        this.scrollUsers = response.ScrollUsersDataList;
      //}
    });
  }

  showIPOutstandingReportData() {
    var fromdt = moment(this.ipOutstandingReportForm.get("fromdate")?.value).format('DD-MMM-YYYY');
    var todt = moment(this.ipOutstandingReportForm.get("todate")?.value).format('DD-MMM-YYYY');
    const url = this.us.getApiUrl(Reports.FetchPatientBillsMIS, {
      fromDate: fromdt,
      toDate: todt,
      filter: "0",
      userId: this.doctorDetails[0].UserId,
      workstationId: this.facilityId,
      hospitalId: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      //if (response.Code === 200) {
        this.ipOutstandingData = response.FetchPatientBillsMISDataList;
      //}
    });
  }

exportIPOutstandingReport() {
  const exportData = this.ipOutstandingData.map(
        (item: any, index: number) => {
          return {
            'Sl.No': index + 1,
            'SSN': item.UHID,
            'Patient Name': item.PatientName,
            'Bill No': item.BillNo,
            'Bill Date': item.BillDate || '',
            'Bill Amount': item.PatientBillAmount || '',
            'Received Amount': item.ReceivedAmount || '',
            Discount: item.Discount || '',
            'Availed Deposits' : item.AvailedDeposita || '',
            Balance: item.PatientBalance || '',
          };
        }
      );
  
      // // Create worksheet and add titles
      // const worksheet = XLSX.utils.json_to_sheet(exportData, {});
      const columnCount = Object.keys(exportData[0]).length;
      const locationName = 'IP Outstanding Balance Report - AL-HAMMADI HOSPITAL ' + '(' + sessionStorage.getItem('locationName') + ')';
      // Create worksheet and add titles
      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
        [locationName],
        Object.keys(exportData[0]), // Headers
      ]);
  
      // Merge cells for titles
      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } }, // Title 1
      ];
  
      // Add data starting from row 5
      XLSX.utils.sheet_add_json(worksheet, exportData, {
        skipHeader: true,
        origin: 'A3',
      });
  
      // Column spacing
      const columnWidths = Object.keys(exportData[0]).map((key) => ({
        wch:
          Math.max(
            key.length, // Header length
            ...exportData.map((item: any) => String(item[key] || '').length) // Max content length
          ) + 2, // Add padding for better spacing
      }));
  
      worksheet['!cols'] = columnWidths;
  
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'IP Outstanding Balance Report');
  
      XLSX.writeFile(
        workbook,
        `IP_Outstanding_Balance_Report${moment().format('YYYY-MM-DD')}.xlsx`
      );
    }
  

  showDailyCollectionReportData() {
    var fromdt = moment(this.dialyCollectionReportForm.get("fromdate")?.value).format('DD-MMM-YYYY');
    var todt = moment(this.dialyCollectionReportForm.get("todate")?.value).format('DD-MMM-YYYY');
    const url = this.us.getApiUrl(Reports.AllUsersDailyCollectionReport, {
      fromDate: fromdt,
      toDate: todt,
      hospitalId: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      //if (response.Code === 200) {
        this.dailyCollectionData = response.DailyCollectionReportDataList;
      //}
    });
  }

  exportDailyCollectionReport() {
    const exportData = this.dailyCollectionData.map(
          (item: any, index: number) => {
            return {
              'Sl.No': index + 1,
              'SSN': item.SSN,
              'Patient Name': item.PatientName,
              'FullAge': item.FullAge,
              'Gender': item.Gender,
              'Bill No': item.BillNO || '',
              'Bill Date': item.BillDate || '',
              'CashierName': item.CashierName || '',
              'Bill Amount': item.BillAmount || '',
              'Receipt Amount': item.ReceiptAmount || '',
              'Total Refund': item.TotalRefund || '',
              'Availed Deposits' : item.AvailedDeposits || '',
            };
          }
        );
    
        // // Create worksheet and add titles
        // const worksheet = XLSX.utils.json_to_sheet(exportData, {});
        const columnCount = Object.keys(exportData[0]).length;
        const locationName = 'Daily Collection Report - AL-HAMMADI HOSPITAL ' + '(' + sessionStorage.getItem('locationName') + ')';
        // Create worksheet and add titles
        const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
          [locationName],
          Object.keys(exportData[0]), // Headers
        ]);
    
        // Merge cells for titles
        worksheet['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } }, // Title 1
        ];
    
        // Add data starting from row 5
        XLSX.utils.sheet_add_json(worksheet, exportData, {
          skipHeader: true,
          origin: 'A3',
        });
    
        // Column spacing
        const columnWidths = Object.keys(exportData[0]).map((key) => ({
          wch:
            Math.max(
              key.length, // Header length
              ...exportData.map((item: any) => String(item[key] || '').length) // Max content length
            ) + 2, // Add padding for better spacing
        }));
    
        worksheet['!cols'] = columnWidths;
    
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Collection Report');
    
        XLSX.writeFile(
          workbook,
          `Daily_Collection_Report${moment().format('YYYY-MM-DD')}.xlsx`
        );
  }

  showDepositCheckingReportData() {
    var billType = "0";
    const url = this.us.getApiUrl(Reports.FetchCurrentInPatientDepositCheckingMIS, {
      billType: billType,
      userId : this.doctorDetails[0].UserId,
      workstationId : this.facilityId,
      hospitalId: this.hospitalID
    });
    this.us.get(url).subscribe((response: any) => {
      //if (response.Code === 200) {
        this.depositcheckingReportData = response.CurrentInPatientDepositCheckingMISDataList;
      //}
    });
  }

  exportDepositCheckingReport() {
    const exportData = this.dailyCollectionData.map(
          (item: any, index: number) => {
            return {
              'Sl.No': index + 1,
              'SSN': item.SSN,
              'Patient Name': item.PatientName,
              'Bed': item.BedNAme,
              'Admit Date': item.AdmitDate,
              'Nationality': item.Nationality || '',
              'Mobile': item.Mobile || '',
              'Consultant': item.Consultant || '',
              'Code': item.CompanyName || 'CASH',
              'Bill Amount': item.BillAmount || '',
              'Pat.Deposit': item.Pdeposit || '',
              'Pat.Balance': item.Balance || '',
            };
          }
        );
    
        // // Create worksheet and add titles
        // const worksheet = XLSX.utils.json_to_sheet(exportData, {});
        const columnCount = Object.keys(exportData[0]).length;
        const locationName = 'Deposit Checking Report - AL-HAMMADI HOSPITAL ' + '(' + sessionStorage.getItem('locationName') + ')';
        // Create worksheet and add titles
        const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
          [locationName],
          Object.keys(exportData[0]), // Headers
        ]);
    
        // Merge cells for titles
        worksheet['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } }, // Title 1
        ];
    
        // Add data starting from row 5
        XLSX.utils.sheet_add_json(worksheet, exportData, {
          skipHeader: true,
          origin: 'A3',
        });
    
        // Column spacing
        const columnWidths = Object.keys(exportData[0]).map((key) => ({
          wch:
            Math.max(
              key.length, // Header length
              ...exportData.map((item: any) => String(item[key] || '').length) // Max content length
            ) + 2, // Add padding for better spacing
        }));
    
        worksheet['!cols'] = columnWidths;
    
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Deposit Checking Report');
    
        XLSX.writeFile(
          workbook,
          `Deposit_Checking_Report${moment().format('YYYY-MM-DD')}.xlsx`
        );
  }
}

export const Reports = {
  'FetchReportsByUser': 'FetchReportsByUser?ModuleID=${ModuleID}&UserID=${UserID}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}',
  'FetchScrollUsersAdv': 'FetchScrollUsersAdv?type=1&userId=${userId}&workstationId=${workstationId}&hospitalId=${hospitalId}',
  'AllUsersDailyCollectionReport': 'AllUsersDailyCollectionReport?fromDate=${fromDate}&toDate=${toDate}&hospitalId=${hospitalId}',
  'FetchPatientBillsMIS': 'FetchPatientBillsMIS?fromDate=${fromDate}&toDate=${toDate}&filter=${filter}&userId=${userId}&workstationId=${workstationId}&hospitalId=${hospitalId}',
  'FetchCurrentInPatientDepositCheckingMIS': 'FetchCurrentInPatientDepositCheckingMIS?billType=${billType}&userId=${userId}&workstationId=${workstationId}&hospitalId=${hospitalId}'
}