import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ErDashboardService {
  private devApiUrl = `${config.reportsapi}`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Basic ' + btoa('AlhhSUNZHippo:*#$@PAlhh^2106'),
    }),
  };

  constructor(private http: HttpClient) { }

  fetchERSpecialisation(workStationId: number, hospitalId: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchERSpecialisationHISBI?WorkStationID=${workStationId}&HospitalID=${hospitalId}`,
      this.httpOptions
    );
  }

  fetchERVisitDetails(fromDate: string, toDate: string, hospitalId: string, specialiseIds: string) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchERVisitDetailsHISBI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&SpecialiseID=${specialiseIds}`,
      this.httpOptions
    );
  }

}

