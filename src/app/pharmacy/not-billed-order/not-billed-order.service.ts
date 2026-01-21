import { UtilityService } from 'src/app/shared/utility.service';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NotBilledOrderService {
  facilityId = JSON.parse(sessionStorage.getItem('FacilityID') || '{}');

  constructor(private service: UtilityService, private http: HttpClient) {}

  param = {
    FromDate: '',
    ToDate: '',
    Min: 1,
    Max: environment.paginationsize,
    WardID: 0,
    SSN: '0',
    STAT: 0,
    UserID: 0,
    WorkStationID: 0,
    HospitalID: 0,
    Name: '',
    PrescriptionID: 0,
    IsDisPrescription: 0,
    RadSystemIssue: 1,
    ItemID: 0,
    PatientID: 0,
    AdmissionID: 0,
    IVFluidRequestID: 0,
    NoofPrints: 1,
    BedID: 0,
    ChangedItemIDS: '0',
  };

  getData(baseUrl: any): any {
    return this.service.getApiUrl(baseUrl, { ...this.param });
  }

  fetchNotBilledOrders(data: any) {
    return this.http.get<any>(
      this.service.rcmapiUrl +
        `OPBilling/notbilledorders?fromDate=${data.fromDate}&toDate=${data.toDate}&ssn=${data.ssn}&hospitalId=${data.hospitalId}`
    );
  }

  fetchPharmacyNotBilledOrders(data: any) {
    return this.http.get<any>(
      this.service.rcmapiUrl +
        `OPBilling/notbilledpharmacyorders?fromDate=${data.fromDate}&toDate=${data.toDate}&ssn=${data.ssn}&hospitalId=${data.hospitalId}`
    );
  }

  FetchApprovalRequestAdv(
    VisitID: any,
    UserId: any,
    WorkStationID: any,
    HospitalID: any
  ) {
    return this.http.get<any>(
      this.service.devApiUrl +
        `FetchApprovalRequestAdv?VisitID=${VisitID}&UserId=${UserId}&WorkStationID=${WorkStationID}&HospitalID=${HospitalID}`
    );
  }
}
