import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: 'app-clara-trigger',
    templateUrl: './clara-trigger.component.html',
})
export class ClaraTriggerComponent {
    @Output() onClick = new EventEmitter<void>();
    @Input() isDisabled: boolean = false;

    constructor() { }

    onButtonClick(): void {
        this.onClick.emit();
    }
}