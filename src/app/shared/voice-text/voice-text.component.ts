import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-voice-text',
    templateUrl: './voice-text.component.html',
    styleUrls: []
})
export class VoiceTextComponent {
    recognition: any;
    isStarted: boolean = false;
    microPhoneActive: boolean = false;

    @Output()
    textChange = new EventEmitter<string>();

    constructor() {

    }

    ngOnInit() {
        this.initSpeechRecognition();
    }

    initSpeechRecognition() {
        const { webkitSpeechRecognition }: any = window;
        this.recognition = new webkitSpeechRecognition();

        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
            const results = event.results;
            const lastResult = results[results.length - 1];
            this.textChange.emit(lastResult[0].transcript);
        };

        this.recognition.onaudiostart = () => {
            this.microPhoneActive = true;
        }

        this.recognition.onaudioend = () => {
            this.microPhoneActive = false;
            this.isStarted = false;
        }
    }

    startListening() {
        this.isStarted = true;
        this.recognition.start();
    }

    stopListening() {
        this.recognition.stop();
    }
}
