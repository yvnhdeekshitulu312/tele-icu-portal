import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appFocusNext]'
})
export class FocusNextDirective {

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab' || event.key === 'ArrowDown') {
      event.preventDefault();

      const focusableElements = this.getFocusableElements();
      const currentElementIndex = focusableElements.indexOf(this.el.nativeElement);

      let nextElementIndex = currentElementIndex + 1;
      if (nextElementIndex >= focusableElements.length) {
        nextElementIndex = 0;
      }

      const nextElement = focusableElements[nextElementIndex] as HTMLElement;
      nextElement.focus();
    }else if(event.key === 'ArrowUp'){
      event.preventDefault();

      const focusableElements = this.getFocusableElements();
      const currentElementIndex = focusableElements.indexOf(this.el.nativeElement);

      let nextElementIndex = currentElementIndex - 1;
      if (nextElementIndex >= focusableElements.length) {
        nextElementIndex = 0;
      }

      const nextElement = focusableElements[nextElementIndex] as HTMLElement;
      nextElement.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    // const focusableSelectors = 'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select';
    // return Array.from(this.el.nativeElement.parentElement.querySelectorAll(focusableSelectors));
    return Array.from(document.querySelectorAll('[appFocusNext]'));
  }
}