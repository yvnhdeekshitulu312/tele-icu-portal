import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import * as moment from 'moment';
import { BaseComponent, MY_FORMATS } from 'src/app/shared/base.component';
import { UtilityService } from 'src/app/shared/utility.service';
import * as XLSX from 'xlsx';
import { config } from 'src/environments/environment';

@Component({
  selector: 'app-mms-stock-management',
  templateUrl: './mms-stock-management.component.html',
  styleUrls: ['./mms-stock-management.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    DatePipe
  ]
})
export class MMSStockManagementComponent extends BaseComponent implements OnInit {
  facility: any;
  facilityId: any;
  arCompStatementData: any = [];

  constructor(
    public datepipe: DatePipe,
    private utilityService: UtilityService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.facility = JSON.parse(sessionStorage.getItem("facility") || '{}');
    this.facilityId = this.facility.FacilityID == undefined ? this.facility : this.facility.FacilityID
    this.fetchmmsstockmanagementnew();
  }

  fetchmmsstockmanagement() {
    this.arCompStatementData = [];
    const searchPar = {
      type: 0,
      filter: `Quantity>0 and HospDeptID=${this.facilityId} order by itemname`,
      userId: this.doctorDetails[0].UserId,
      workstationId: this.facilityId,
      order: 0,
      hospitalId: this.hospitalID
    };

    const url = this.utilityService.getApiUrl(StockManagement.FetchMMSStockManagement, searchPar);
    this.utilityService.getfullurl(url).subscribe((response: any) => {
      if (response.status === "Success") {
        this.arCompStatementData = response?.data.length ? response.data : [];
      }
    });
  }

  fetchmmsstockmanagementnew() {
    this.arCompStatementData = [];
    const searchPar = {
      HospDeptId: this.facilityId,
      UserId: this.doctorDetails[0].UserId,
      WorkStationID: this.facilityId,
      HospitalID: this.hospitalID
    };

    const url = this.utilityService.getApiUrl(StockManagement.FetchMMSStockManagement, searchPar);
    this.utilityService.get(url).subscribe((response: any) => {
      if (response.Code === 200) {
        this.arCompStatementData = response?.FetchMMSStockManagementDataList;
      }
    });
  }

  ngOnDestroy(): void {
  }

  printarCompanyStmnt(type: string) {
    const exportData = this.arCompStatementData.map(
      (item: any, index: number) => {
        return {
          'Sl.No': index + 1,
          'Item Code': item.ItemCode,
          'Item Name': item.ItemName,
          'Catalog Number': item.CatalogNumber,
          'Packing Name': item.Packing || '',
          'QOH Highest': item.HighestUnitQty || '',
          'QOH Lowest': item.LowestUnitQty || '',
          'MRP Highest': item.MRP_HighestUnit || '',
          'MRP Lowest': item.MRP_LowestUnit || '',
          'RPU Highest': item.UEPR_HighestUnit || '',
          'RPU Lowest': item.UEPR_LowestUnit || '',
          'Expiry Date': item.ExpiryDate || '',
          'Rack': item.Rack || '',
          'Shelf': item.Shelf || '',
        };
      }
    );

    // // Create worksheet and add titles
    // const worksheet = XLSX.utils.json_to_sheet(exportData, {});
    const columnCount = Object.keys(exportData[0]).length;
    const locationName = 'AL-HAMMADI HOSPITAL ' + '(' + sessionStorage.getItem('locationName') + ')' + '-' + this.facility.FacilityName ;
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'MMS Stock Management');

    XLSX.writeFile(
      workbook,
      `MMS_Stock_Management_${moment().format('YYYY-MM-DD')}.xlsx`
    );
  }
}

export const StockManagement = {
  fetchdepartmentstock: `${config.rcmapiurl}` + 'IPBilling/fetchdepartmentstock?type=${type}&filter=${filter}&userId=${userId}&workstationId=${workstationId}&order=${order}&hospitalId=${hospitalId}',
  FetchMMSStockManagement: 'FetchMMSStockManagement?HospDeptId=${HospDeptId}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}'
};
