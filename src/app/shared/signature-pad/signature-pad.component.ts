import { Component, EventEmitter, Output } from '@angular/core';
declare var $: any;

declare function captureSignature(name: any, reason: any, imageContainer: any): any;

@Component({
    selector: 'app-signature-pad',
    templateUrl: './signature-pad.component.html'
})
export class SignaturePadComponent {
    @Output() dataChanged = new EventEmitter<{ base64String: any }>();
    @Output() onClose = new EventEmitter<any>();
    base64Interval: any;

    constructor() {
    }

    ngOnInit(): void {
        this.initiateCapture('nameInput', 'signatureDiv');
        this.base64Interval = setInterval(() => {
            if ($("#taBase64").val() != '') {
                const base64String = $("#taBase64").val();
                this.dataChanged.emit({
                    base64String
                });
                clearInterval(this.base64Interval);
            }
        }, 1000);
    }

    ngOnDestroy() {
        if (this.base64Interval) {
            clearInterval(this.base64Interval);
        }
    }

    initiateCapture(name: any, imgSign: any) {
        var who = 'Signature';
        var why = 'Signature';
        var Control = imgSign;
        captureSignature(who, why, Control);
        return false;
    }

    importSignature() {
        if ($("#taBase64").val() != '') {
            const base64String = $("#taBase64").val();
            this.dataChanged.emit({
                base64String
            })
        }
    }

    closeSignaturePad() {
        this.onClose.emit();
    }
}
