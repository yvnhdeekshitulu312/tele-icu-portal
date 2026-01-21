import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RatesService {
  private devApiUrl = `${config.reportsapi}`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Basic ' + btoa('AlhhSUNZHippo:*#$@PAlhh^2106'),
    }),
  };

  constructor(private http: HttpClient) { }

  fetchReAdmissionMortalitySurgeryCancel(
    type: number, // 1 = Readmission, 2 = Mortality, 3 = Surgery Cancel
    fromDate: string,
    toDate: string,
    departmentIds: string,
    hospitalIds: string,
    noOfDays: number,
    departmentId: number = 0
  ) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchReAdmissionMortalitiesSurgeryCancel?FromDate=${fromDate}&ToDate=${toDate}&Type=${type}&DepartmentID=${departmentIds}&HospitalID=${hospitalIds}&NoofDays=${noOfDays}&DoctorDeptID=${departmentId}`,
      this.httpOptions
    );
  }


  fetchDepartments(workStationId: number, hospitalId: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchDepartmentsHISBI?WorkStationID=${workStationId}&HospitalID=${hospitalId}`,
      this.httpOptions
    );
  }
}
