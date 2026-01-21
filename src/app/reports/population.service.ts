import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PopulationService {
  private devApiUrl = `${config.reportsapi}`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Basic ' + btoa('AlhhSUNZHippo:*#$@PAlhh^2106'),
    }),
  };

  constructor(private http: HttpClient) { }


  fetchPopulationHealthStatistics(fromDate: string, toDate: string, hospitalId: string) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPopulationhealthStatistics?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}`,
      this.httpOptions
    );
  }

  fetchPopulationHealthAsthmaCOPD(fromDate: string, toDate: string, hospitalId: string) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPopulationhealthOsthmaCOPD?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}`,
      this.httpOptions
    );
  }

  fetchPopulationHealthDiabetes(fromDate: string, toDate: string, hospitalId: string) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPopulationhealthDiabetesMellitus1CHISBI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}`,
      this.httpOptions
    );
  }

  fetchPopulationHealthHypertension(fromDate: string, toDate: string, hospitalId: string) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPopulationhealthHypertension1DHISBI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}`,
      this.httpOptions
    );
  }

  fetchPopulationHealthCAD(fromDate: string, toDate: string, hospitalId: string) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPopulationhealthCAD1EHISBI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}`,
      this.httpOptions
    );
  }
}
