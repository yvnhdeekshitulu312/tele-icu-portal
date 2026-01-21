import { AfterViewInit, OnDestroy } from '@angular/core';
import { AuditlogService } from 'src/app/services/auditlog.service';

export class AuditbaseComponent implements AfterViewInit, OnDestroy {
  private previousValues: { [key: string]: any } = {};
  
  constructor(private auditLogService: AuditlogService) {}

  ngAfterViewInit() {
    document.body.addEventListener('change', this.onGlobalChange.bind(this));
  }

  ngOnDestroy() {
    document.body.removeEventListener('change', this.onGlobalChange.bind(this));
  }

  private onGlobalChange(event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) {
      const controlName = target.getAttribute('name') || target.id || target.className || 'unknown';
      const currentValue = target.value;
      const previousValue = this.previousValues[controlName] || '';

      if (previousValue !== currentValue) {
        //this.auditLogService.logChange(previousValue, currentValue);
        this.previousValues[controlName] = currentValue;
      }
    }
  }
}
