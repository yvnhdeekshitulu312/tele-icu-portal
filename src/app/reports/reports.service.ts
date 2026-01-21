import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private devApiUrl = `${config.reportsapi}`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Basic ' + btoa('AlhhSUNZHippo:*#$@PAlhh^2106'),
    }),
  };

  constructor(private http: HttpClient) {}

  FetchPatientSurgeryOrdersGroupBySurgeryCountKPI(fromDate: string, toDate: string, hospitalId: string, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientSurgeryOrdersGroupBySurgeryCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}`,
      this.httpOptions
    );
  }

  FetchPatientSurgeryOrdersSurgeryAgainstDoctorCountKPI(fromDate: string, toDate: string, hospitalId: string, procedureId: any, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientSurgeryOrdersSurgeryAgainstDoctorCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&ProcedureID=${procedureId}`,
      this.httpOptions
    );
  }

  PatientSurgeryOrdersDoctorAgainstMonthWiseCountKPI(fromDate: string, toDate: string, hospitalId: string, procedureId: any, surgeonId: any, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/PatientSurgeryOrdersDoctorAgainstMonthWiseCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&ProcedureID=${procedureId}&SurgeonID=${surgeonId}`,
      this.httpOptions
    );
  }

  FetchPatientLaboratoryOrdersGroupByCountKPI(fromDate: string, toDate: string, hospitalId: string, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientLaboratoryOrdersGroupByCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}`,
      this.httpOptions
    );
  }

  FetchPatientLabAgainstDeptCountKPI(fromDate: string, toDate: string, hospitalId: string, procedureId: any, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientLabAgainstDeptCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&ProcedureID=${procedureId}`,
      this.httpOptions
    );
  }

  FetchPatientLabAgainstDeptDoctorCountKPI(fromDate: string, toDate: string, hospitalId: string, procedureId: any, deptId: number, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientLabAgainstDeptDoctorCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&ProcedureID=${procedureId}&DeptID=${deptId}`,
      this.httpOptions
    );
  }

  FetchPatientLabAgainstDeptDoctorMonthCountKPI(fromDate: string, toDate: string, hospitalId: string, procedureId: any, deptId: number, doctorId: number, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientLabAgainstDeptDoctorMonthCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&ProcedureID=${procedureId}&DeptID=${deptId}&DoctorID=${doctorId}`,
      this.httpOptions
    );
  }

  FetchPatientRadiologyOrdersGroupByCountKPI(fromDate: string, toDate: string, hospitalId: string, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientRadiologyOrdersGroupByCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}`,
      this.httpOptions
    );
  }

  FetchPatientRadAgainstDeptCountKPI(fromDate: string, toDate: string, hospitalId: string, procedureId: any, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientRadAgainstDeptCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&ProcedureID=${procedureId}`,
      this.httpOptions
    );
  }

  FetchPatientRadAgainstDeptDoctorCountKPI(fromDate: string, toDate: string, hospitalId: string, procedureId: any, deptId: number, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientRadAgainstDeptDoctorCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&ProcedureID=${procedureId}&DeptID=${deptId}`,
      this.httpOptions
    );
  }

  FetchPatientRadAgainstDeptDoctorMonthCountKPI(fromDate: string, toDate: string, hospitalId: string, procedureId: any, deptId: number, doctorId: number, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientRadAgainstDeptDoctorMonthCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&ProcedureID=${procedureId}&DeptID=${deptId}&DoctorID=${doctorId}`,
      this.httpOptions
    );
  }

  FetchPatientProceduresOrdersGroupByCountKPI(fromDate: string, toDate: string, hospitalId: string, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientProceduresOrdersGroupByCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}`,
      this.httpOptions
    );
  }

  FetchPatientProceduresAgainstDeptCountKPI(fromDate: string, toDate: string, hospitalId: string, procedureId: any, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientProceduresAgainstDeptCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&ProcedureID=${procedureId}`,
      this.httpOptions
    );
  }

  FetchPatientProceduresAgainstDeptDoctorCountKPI(fromDate: string, toDate: string, hospitalId: string, procedureId: any, deptId: number, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientProceduresAgainstDeptDoctorCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&ProcedureID=${procedureId}&DeptID=${deptId}`,
      this.httpOptions
    );
  }

  FetchPatientProceduresAgainstDeptDoctorMonthCountKPI(fromDate: string, toDate: string, hospitalId: string, procedureId: any, deptId: number, doctorId: number, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientProceduresAgainstDeptDoctorMonthCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&ProcedureID=${procedureId}&DeptID=${deptId}&DoctorID=${doctorId}`,
      this.httpOptions
    );
  }

  FetchPatientDiagnosisOrdersGroupByCountKPI(fromDate: string, toDate: string, hospitalId: string, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientDiagnosisOrdersGroupByCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}`,
      this.httpOptions
    );
  }

  FetchPatientDiagnosisAgainstDeptCountKPI(fromDate: string, toDate: string, hospitalId: string, diseaseId: number, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientDiagnosisAgainstDeptCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&DiseaseID=${diseaseId}`,
      this.httpOptions
    );
  }

  FetchPatientDiagnosisAgainstDeptDoctorCountKPI(fromDate: string, toDate: string, hospitalId: string, diseaseId: number, deptId: number, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientDiagnosisAgainstDeptDoctorCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&DiseaseID=${diseaseId}&DeptID=${deptId}`,
      this.httpOptions
    );
  }

  FetchPatientDiagnosisAgainstDeptDoctorMonthCountKPI(fromDate: string, toDate: string, hospitalId: string, diseaseId: number, deptId: number, doctorId: number, totalRecords: number) {
    return this.http.get<any>(
      `${this.devApiUrl}/FetchPatientDiagnosisAgainstDeptDoctorMonthCountKPI?FromDate=${fromDate}&ToDate=${toDate}&HospitalID=${hospitalId}&TotalRecords=${totalRecords}&DiseaseID=${diseaseId}&DeptID=${deptId}&DoctorID=${doctorId}`,
      this.httpOptions
    );
  }
}
