import { Directive, ElementRef, Renderer2, HostListener, Input, OnInit } from '@angular/core';
import { AuditlogService } from 'src/app/services/auditlog.service';

@Directive({
  selector: '[appAuditLog]'
})
export class AuditLogDirective implements OnInit {
  private previousValue: any;
  @Input('appAuditLog') controlName!: string;

  constructor(private el: ElementRef, private renderer: Renderer2, private auditLogService: AuditlogService) {}

  ngOnInit() {
    const element = this.el.nativeElement;
    this.previousValue = element.value;
  }

  @HostListener('change', ['$event'])
  onChange(event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    let currentValue: string;
    let controlIdentifier: string = this.controlName || target.getAttribute('name') || target.id || target.className || 'unknown';
    
    if (target.tagName.toUpperCase() === 'SELECT') {
      const selectElement = target as HTMLSelectElement;
      currentValue = selectElement.selectedOptions[0].textContent || ''; 
    } else {
      currentValue = target.value;
    }
    
    if (this.previousValue !== currentValue) {
      this.auditLogService.logChange(controlIdentifier, this.previousValue, currentValue);
      this.previousValue = currentValue; 
    }
  }
}
