import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuditlogService {
  private logs: Array<string> = [];

  logChange(controlName: string, previousValue: any, currentValue: any) {
    this.logs.push(`Audit Log: ${controlName} changed from '${previousValue}' to '${currentValue}'`)
  }

  setLogsEmpty() {
    this.logs = [];
  }

  getLogs(): Array<string> {
    return this.logs;
  }

  
}
