import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LaboratoryService {
  private devApiUrl = `${config.reportsapi}`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Basic ' + btoa('AlhhSUNZHippo:*#$@PAlhh^2106'),
    }),
  };

  constructor(private http: HttpClient) { }

  fetchLabTestOrders(fromDate: string, toDate: string, hospitalId: string) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchLABTestOrdersHISBI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}`,
      this.httpOptions
    );
  }

  fetchLabTestOrdersWaiting(fromDate: string, toDate: string, hospitalId: string) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchLABTestOrdersWaitingHISBI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}`,
      this.httpOptions
    );
  }
}
