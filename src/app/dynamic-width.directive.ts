import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
declare var $: any;
@Directive({
  selector: '[appDynamicWidth]'
})
export class DynamicWidthDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('input', ['$event.target.value']) onInput(value: string) {
    this.adjustWidth(value);
  }

  @HostListener('mouseenter', ['$event.target'])
  onMouseEnter(target: HTMLInputElement) {
    const value = target.value;
    $(target).tooltip({
      title: value,
      trigger: 'manual',
      placement: 'bottom',
    });
    $(target).tooltip('show');
  }
  @HostListener('mouseleave', ['$event.target'])
  onMouseLeave(target: HTMLInputElement) {
    $(target).tooltip('dispose');
  }
  private adjustWidth(value: string) {
    const input = this.el.nativeElement;
    const textWidth = this.getTextWidth(value, window.getComputedStyle(input).font);
    input.style.width = textWidth + 'px';
    this.renderer.setAttribute(input, 'title', value);
    $(input).tooltip('dispose');
    $(input).tooltip({
      title: value,
      trigger: 'hover', 
      placement: 'bottom'
    });
  }

  private getTextWidth(text: string, font: string): number {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context!.font = font;
    const metrics = context!.measureText(text);
    return metrics.width > 100 ? metrics.width + 20 : 120; 
  }

}
