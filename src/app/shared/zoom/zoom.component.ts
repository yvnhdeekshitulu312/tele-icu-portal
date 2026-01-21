import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, HostListener, NgZone, ViewChild } from '@angular/core';
import uitoolkit, { CustomizationOptions } from '@zoom/videosdk-ui-toolkit';

declare var $: any;

@Component({
    selector: 'app-zoom',
    templateUrl: './zoom.component.html',
    styleUrls: []
})
export class ZoomComponent {
    @ViewChild('sessionContainer', { static: false }) sessionContainerRef!: ElementRef;
    @ViewChild('popupRef') popupRef!: ElementRef;
    selectedView: any;
    sessionContainer: any;
    inSession: boolean = false;
    isMinimized: boolean = false;

    private isDragging = false;
    private startX = 0;
    private startY = 0;
    private initialLeft = 0;
    private initialTop = 0;

    zoomConfig: CustomizationOptions = {
        videoSDKJWT: '',
        sessionName: '', //RegCode-VisitId-ScheduleId-HospitalId
        userName: '',
        sessionPasscode: '123',
        featuresOptions: {
            virtualBackground: {
                enable: true,
                virtualBackgrounds: [
                    {
                        url: 'https://images.unsplash.com/photo-1715490187538-30a365fa05bd?q=80&w=1945&auto=format&fit=crop',
                    },
                ],
            },
            viewMode: {
                enable: false,
                viewModes: ['speaker'] as any,
                defaultViewMode: 'speaker' as any
            }
        },
    }
    doctorDetails: any;
    hospId: any;

    constructor(private httpClient: HttpClient, private ngZone: NgZone) {

    }

    ngOnInit(): void {
        this.selectedView = JSON.parse(sessionStorage.getItem("selectedView") || '{}');
        this.doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}');
        this.hospId = sessionStorage.getItem("hospitalId");
    }

    getVideoSDKJWT() {
        this.inSession = true;
        this.isMinimized = false;
        this.zoomConfig.sessionName = `${this.selectedView.RegCode}-${this.selectedView.AdmissionID}-${this.selectedView.ScheduleID}-${this.hospId}`;
        this.zoomConfig.userName = this.doctorDetails[0].LoginUsername;
        setTimeout(() => {
            const headers = new HttpHeaders({
                'x-api-key': '348SDDFCW23DFBR^4DVSF5SFSDDW$2*$@CEXWWXWE',
            });

            this.httpClient
                .post(
                    'https://his.alhammadi.med.sa:54380/Zoom/api/Zoom/generate-token',
                    {
                        sessionName: this.zoomConfig.sessionName,
                        role: 1,
                        videoWebRtcMode: 1,
                    },
                    {
                        headers: headers,
                    }
                )
                .subscribe((data: any) => {
                    if (data.signature) {
                        this.zoomConfig.videoSDKJWT = data.signature;
                        this.joinSession();
                    } else {
                        console.log(data);
                    }
                }, (error) => {
                    console.error('Error fetching JWT:', error);
                });
        });
    }

    joinSession() {
        this.sessionContainer = this.sessionContainerRef.nativeElement;
        this.ngZone.runOutsideAngular(() => {
            uitoolkit.joinSession(this.sessionContainer, this.zoomConfig);
            uitoolkit.onSessionClosed(this.sessionClosed);
            uitoolkit.onSessionDestroyed(this.sessionDestroyed);
        });
    }

    sessionClosed = () => {
        this.inSession = false;
    };

    sessionDestroyed = () => {
        uitoolkit.destroy();
    };

    ngOnDestroy() {
        try {
            uitoolkit.destroy();
        } catch (error) {
            console.warn('UIToolkit destroy skipped:', error);
        }
    }

    toggleMinMax() {
        this.isMinimized = !this.isMinimized;
        if (!this.isMinimized) {
            const popup = this.popupRef.nativeElement;
            popup.style.left = '50%';
            popup.style.top = '50%';
            popup.style.bottom = 'unset';
            popup.style.right = 'unset';
        } else {
            const popup = this.popupRef.nativeElement;
            popup.style.bottom = '20px';
            popup.style.right = '20px';
            popup.style.left = 'unset';
            popup.style.top = 'unset';
        }
    }

    closeSession() {
        try {
            uitoolkit.closeSession();
        } catch (error) {
            this.inSession = false;
            console.warn('Error closing session:', error);
        }
    }

    onDragStart(event: MouseEvent) {
        if (!this.isMinimized) return; // draggable only when minimized
        this.isDragging = true;

        const popup = this.popupRef.nativeElement;
        const rect = popup.getBoundingClientRect();

        this.startX = event.clientX;
        this.startY = event.clientY;
        this.initialLeft = rect.left;
        this.initialTop = rect.top;

        popup.style.position = 'fixed';
        popup.style.cursor = 'grabbing';
        event.preventDefault();
    }

    @HostListener('document:mousemove', ['$event'])
    onDragMove(event: MouseEvent) {
        if (!this.isDragging) return;

        const dx = event.clientX - this.startX;
        const dy = event.clientY - this.startY;
        const popup = this.popupRef.nativeElement;

        popup.style.left = `${this.initialLeft + dx}px`;
        popup.style.top = `${this.initialTop + dy}px`;
        popup.style.bottom = 'unset';
        popup.style.right = 'unset';
    }

    @HostListener('document:mouseup')
    onDragEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;

        const popup = this.popupRef.nativeElement;
        popup.style.cursor = '';
    }
}