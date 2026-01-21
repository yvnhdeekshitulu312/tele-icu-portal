import { Directive, ElementRef, forwardRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
    selector: '[contenteditableModel]',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ContenteditableModelDirective),
            multi: true,
        },
    ],
})
export class ContenteditableModelDirective implements ControlValueAccessor {
    private onChange = (value: any) => { };
    private onTouched = () => { };

    constructor(private el: ElementRef<HTMLElement>) { }

    @HostListener('input')
    onInput() {
        this.onChange(this.el.nativeElement.innerText);
    }

    @HostListener('blur')
    onBlur() {
        this.onTouched();
    }

    writeValue(value: any): void {
        this.el.nativeElement.innerText = value || '';
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
