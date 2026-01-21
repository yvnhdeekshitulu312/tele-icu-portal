import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { ClaraResponse, SpeechService } from '../speech.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ConfigService } from 'src/app/services/config.service';
import { marked } from 'marked';
declare var $: any;

@Component({
    selector: 'app-clara-modal',
    templateUrl: './clara-modal.component.html',
    styleUrls: []
})
export class ClaraModalComponent implements OnInit, OnDestroy {
    @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
    @ViewChild('streamTarget', { static: false }) streamTarget!: ElementRef;
    intervalId: any;
    @Input() patientId: string = '';
    @Input() admissionId: string = ''
    @Input() hospitalID: string = '';
    @Input() ssn: string = '';
    @Input() mode: 'voice' | 'report' = 'voice';
    @Input() dashboardType: any = null;
    @Input() dateRange: any = null;
    @Output() closeModal = new EventEmitter<void>();

    claraInput: string = '';
    currentResponse: ClaraResponse | null = null;
    audioUrl: string | null = null;
    safeAudioUrl: SafeUrl | null = null;
    isPlaying = false;
    currentTime: any;
    duration = 0;
    recordingState = {
        isRecording: false,
        isProcessing: false,
        error: ''
    };
    isMuted = false;
    volume = 1;
    stateSubscription?: Subscription;
    selectedOption: string = '';
    visits: any = [];
    selectedVisit: any;
    aiType = "fast";

    constructor(private speechService: SpeechService, private sanitizer: DomSanitizer, private config: ConfigService) { }

    ngOnInit(): void {
        $(".clara-popup-modal").modal('show');
        this.speechService.resetState();
        this.stateSubscription = this.speechService.state$.subscribe(state => {
            this.recordingState = {
                isRecording: state.isRecording,
                isProcessing: state.isProcessing,
                error: state.error
            };
        });

        if (this.mode === 'voice') {
            this.fetchPatientVisits();
        }
    }

    fetchPatientVisits() {
        this.config.fetchPatientVisits(this.patientId, this.hospitalID)
            .subscribe((response: any) => {
                if (response.Code == 200) {
                    this.visits = response.PatientVisitsDataList;
                }
            }, (err) => { })
    }

    previousHistory() {
        this.currentResponse = null;
        this.cleanupAudio();
        this.selectedOption = 'PreviousHistory';
    }

    onVisitSelect(visit: any) {
        this.admissionId = visit.AdmissionID;
        this.selectedVisit = visit;
    }

    ngOnDestroy(): void {
        this.stateSubscription?.unsubscribe();
    }

    selectClaraOption(option: string): void {
        this.selectedOption = this.claraInput = option;
    }

    closeAIModal(): void {
        $(".clara-popup-modal").modal('hide');
        this.speechService.resetState();
        this.claraInput = '';
        this.selectedOption = '';
        this.currentResponse = null;
        this.cleanupAudio();
        this.closeModal.emit();
    }

    private cleanupAudio(): void {
        if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
            this.audioUrl = null;
            this.safeAudioUrl = null;
        }
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
    }

    onTimeUpdate(event: Event): void {
        const audio = event.target as HTMLAudioElement;
        this.currentTime = audio.currentTime;
    }

    onLoadedMetadata(event: Event): void {
        const audio = event.target as HTMLAudioElement;
        this.duration = audio.duration;
    }

    onAudioEnded(): void {
        this.isPlaying = false;
        this.currentTime = 0;
    }

    togglePlayPause(): void {
        if (this.isPlaying) {
            this.pauseAudio();
        } else {
            this.playAudio();
        }
    }

    playAudio(): void {
        const audio = this.audioPlayer?.nativeElement;
        if (audio) {
            audio.play().catch(err => console.error('Error playing audio:', err));
            this.isPlaying = true;
        }
    }

    pauseAudio(): void {
        const audio = this.audioPlayer?.nativeElement;
        if (audio) {
            audio.pause();
            this.isPlaying = false;
        }
    }

    stopAudio(): void {
        const audio = this.audioPlayer?.nativeElement;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            this.isPlaying = false;
            this.currentTime = 0;
        }
    }

    seekAudio(event: Event): void {
        const target = event.target as HTMLInputElement;
        const time = parseFloat(target.value);
        const audio = this.audioPlayer?.nativeElement;
        if (audio) {
            audio.currentTime = time;
            this.currentTime = time;
        }
    }

    formatTime(seconds: number): string {
        if (isNaN(seconds) || seconds === 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    toggleMute(): void {
        const audio = this.audioPlayer?.nativeElement;
        if (audio) {
            audio.muted = !audio.muted;
            this.isMuted = audio.muted;
        }
    }

    changeVolume(event: Event): void {
        const target = event.target as HTMLInputElement;
        const volume = parseFloat(target.value) / 100;
        const audio = this.audioPlayer?.nativeElement;
        if (audio) {
            audio.volume = volume;
            this.volume = volume;
            if (volume > 0 && this.isMuted) {
                this.isMuted = false;
                audio.muted = false;
            }
        }
    }

    onInputKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendClaraMessage();
        }
    }

    async sendClaraMessage(): Promise<void> {
        if (!this.claraInput.trim()) {
            alert('Please enter a message');
            return;
        }
        this.currentResponse = null;
        this.cleanupAudio();

        try {
            this.recordingState.isProcessing = true;

            const response = await this.speechService.sendTextMessage(
                this.claraInput,
                this.patientId,
                this.admissionId,
                this.hospitalID,
                this.ssn,
                this.aiType,
                this.mode,
                this.dashboardType,
                this.dateRange
            );

            this.handleClaraResponse(response);
            this.claraInput = '';

        } catch (error) {
            console.error('Send message error:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            this.recordingState.isProcessing = false;
        }
    }

    async toggleRecordingAdvanced(): Promise<void> {
        if (this.recordingState.isRecording) {
            this.recordingState.isProcessing = true;
            this.currentResponse = null;
            this.cleanupAudio();
            try {
                const response = await this.speechService.recordAndTranscribeAdvanced(
                    this.patientId, this.admissionId, this.hospitalID, this.ssn, this.aiType, this.mode, this.dashboardType, this.dateRange
                );

                this.handleClaraResponse(response);

            } catch (error) {
                console.error('Recording error:', error);
                alert('Recording failed. Please try again.');
            } finally {
                this.recordingState.isRecording = false;
                this.recordingState.isProcessing = false;
            }

        } else {
            try {
                await this.speechService.startRecording();
                this.recordingState.isRecording = true;
            } catch (error) {
                console.error('Failed to start recording:', error);
                alert('Could not access microphone. Please check permissions.');
                this.recordingState.isRecording = false;
            }
        }
    }

    handleClaraResponse(response: ClaraResponse): void {
        this.selectedOption = '';
        this.currentResponse = response;

        this.cleanupAudio();

        setTimeout(async () => {
            if (response.text) {
                const normalized = response.text.replace(/\\n/g, '\n').replace(/\*\*(.*?)\*\*/g, '$1');
                const html = await marked.parse(normalized);
                this.displaySectionBySection(this.injectBrSafely(html));
            }
        }, 50);

        if (response.hasAudio && response.audioBase64 && response.audioMimeType) {
            this.convertBase64ToAudioAndPlay(response.audioBase64, response.audioMimeType);
        }
    }

    private convertBase64ToAudioAndPlay(base64: string, mimeType: string): void {
        try {
            const binaryString = atob(base64);
            const bytes = new Uint8Array(binaryString.length);

            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([bytes], { type: mimeType });

            this.audioUrl = URL.createObjectURL(blob);
            this.safeAudioUrl = this.sanitizer.bypassSecurityTrustUrl(this.audioUrl);

            setTimeout(() => this.playAudio(), 100);
        } catch (error) {
            console.error('Error converting base64 to audio:', error);
        }
    }

    setModel(type: string) {
        this.aiType = type;
    }

    private injectBrSafely(html: string): string {
        const template = document.createElement('template');
        template.innerHTML = html;

        const walker = document.createTreeWalker(
            template.content,
            NodeFilter.SHOW_TEXT
        );

        let node: Text | null;
        while ((node = walker.nextNode() as Text | null)) {
            if (node.textContent?.includes('\n')) {
                const parts = node.textContent.split('\n');
                const frag = document.createDocumentFragment();

                parts.forEach((part, i) => {
                    frag.appendChild(document.createTextNode(part));
                    if (i < parts.length - 1) {
                        frag.appendChild(document.createElement('br'));
                    }
                });

                node.parentNode?.replaceChild(frag, node);
            }
        }

        return template.innerHTML;
    }

    private displaySectionBySection(html: string) {
        const host = this.streamTarget?.nativeElement;
        if (!host) return;

        const template = document.createElement('template');
        template.innerHTML = html;

        const queue: HTMLElement[] = [];

        // Default assumption: content is not in Arabic
    let isArabic = false;

     // Check if the HTML content has a lang="ar" attribute
    const htmlElement = template.content.querySelector('html');
    const bodyElement = template.content.querySelector('body');

    // Look for `lang="ar"` on the <html> tag or <body> tag in the injected HTML
    if (htmlElement && htmlElement.lang && htmlElement.lang.startsWith('ar')) {
        isArabic = true;
    } else if (bodyElement && bodyElement.lang && bodyElement.lang.startsWith('ar')) {
        isArabic = true;
    }
    // If no lang attribute is found, check if the content contains Arabic characters
    if (!isArabic) {
        const textContent = template.content.textContent || '';
        // Regular expression to match Arabic characters
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
        isArabic = arabicRegex.test(textContent);
    }

    // If the content is in Arabic, apply RTL-specific styles
    if (isArabic) {
        host.classList.add('rtl'); // Apply 'rtl' class for Arabic content
    }

  


        template.content.childNodes.forEach(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;

            const el = node as HTMLElement;

            if (/H[1-3]/.test(el.tagName)) {
                const clone = el.cloneNode(true) as HTMLElement;
                clone.classList.add('stream-item');
                host.appendChild(clone);
                queue.push(clone);
                return;
            }

            if (el.tagName === 'TABLE') {
                const table = el.cloneNode(false) as HTMLTableElement;
                const tbody = document.createElement('tbody');
                table.appendChild(tbody);
                host.appendChild(table);

                el.querySelectorAll('tr').forEach(tr => {
                    const row = tr.cloneNode(true) as HTMLTableRowElement;
                    row.classList.add('stream-item');
                    row.style.display = 'none';
                    tbody.appendChild(row);
                    queue.push(row);
                });
                return;
            }

            const clone = el.cloneNode(true) as HTMLElement;
            clone.classList.add('stream-item');
            clone.style.display = 'none';
            host.appendChild(clone);
            queue.push(clone);
        });

        this.playQueue(queue);
    }

    private playQueue(queue: HTMLElement[]) {
        let index = 0;

        const next = () => {
            if (index >= queue.length) return;

            const el = queue[index];
            el.style.display = '';
            requestAnimationFrame(() => el.classList.add('visible'));

            el.scrollIntoView({ behavior: 'smooth', block: 'end' });

            let delay = 250;

            if (/H[1-3]/.test(el.tagName)) delay = 600;
            if (el.tagName === 'TR') delay = 200;

            index++;
            this.intervalId = setTimeout(next, delay);
        };

        next();
    }

    clearClaraChat() {
        this.selectedOption = '';
        this.claraInput = '';
        this.currentResponse = null;
        this.cleanupAudio();
    }

    printSpan() {
        const printWindow = window.open();
        printWindow!.document.write(`
            <html>
                <head>
                    <title>Export</title>
                    <style>
                        .logo-wrapper {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        .logo-wrapper img {
                            height: 60px;
                            display: inline-block;
                        }
                    </style>
                </head>
                <body>
                    <div class="logo-wrapper">
                        <img id="logo" src="../assets/images/AHH-Logo.png">
                    </div>
                    ${this.streamTarget.nativeElement.innerHTML}
                </body>
            </html>
        `);

        printWindow!.document.close();
        const img = printWindow!.document.getElementById('logo') as HTMLImageElement;
        img.onload = () => {
            printWindow!.focus();
            printWindow!.print();
            printWindow!.close();
        };
    }
}