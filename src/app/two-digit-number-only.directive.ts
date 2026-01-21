import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appTwoDigitNumberOnly]'
})
export class TwoDigitNumberOnlyDirective {
  @Input() appTwoDigitNumberOnly: any = 2;
  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow: backspace, delete, tab, escape, and enter
    if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Tab' ||
      event.key === 'Escape' ||
      event.key === 'Enter' ||
      (event.key >= '0' && event.key <= '9')
    ) {
      // Allow the key event
      return; 
    }
    // Prevent any other key
    event.preventDefault();
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = this.el.nativeElement.value;
    // Remove any non-digit characters
    const sanitizedInput = input.replace(/[^0-9]/g, '');

    // Limit to a maximum of 2 digits
    if (sanitizedInput.length > this.appTwoDigitNumberOnly) {
      this.el.nativeElement.value = sanitizedInput.slice(0, this.appTwoDigitNumberOnly);
    } else {
      this.el.nativeElement.value = sanitizedInput;
    }
  }
}
