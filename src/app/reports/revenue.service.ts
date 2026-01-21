import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RevenueService {
  private devApiUrl = `${config.reportsapi}`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Basic ' + btoa('AlhhSUNZHippo:*#$@PAlhh^2106'),
    }),
  };

  constructor(private http: HttpClient) {}

  FetchARDoctorRevenueMasterData(fromDate: string, toDate: string, hospitalId: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchARDoctorRevenueMasterData?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}`,
      this.httpOptions
    );
  }

  // FetchARMonthlyDoctorRevenueGroupBy(fromDate: string, toDate: string, hospitalId: string, serviceID: string, departmentID: string, payerID: string, doctorId: string, bedTypes: string) {
  //   return this.http.get<any>(
  //     `${this.devApiUrl}/FetchARMonthlyDoctorRevenueGroupBy?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&ServiceID=${serviceID}&DepartmentID=${departmentID}&PayerID=${payerID}&DoctorID=${doctorId}&BedTypes=${bedTypes}`,
  //     this.httpOptions
  //   );
  // }

  FetchARMonthlyDoctorRevenueGroupBy(payload: any) {
    return this.http.post<any>(`${this.devApiUrl}` + `/FetchARMonthlyDoctorRevenueGroupBy`, payload, this.httpOptions);
  }

  FetchARDoctorPayoutReportNew(fromDate: string, toDate: string, doctorID: number, hospitalId: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchARDoctorPayoutReportNew?FromDate=${fromDate}&ToDate=${toDate}&DoctorID=${doctorID}&HospitalID=${hospitalId}`,
      this.httpOptions
    );
  }
}
