import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { config } from 'src/environments/environment';

export interface IncomingCallPayload {
  channelName:       string;
  callerName:        string;
  patientSsn:        string;
  nurseConnectionId: string;
}

@Injectable({ providedIn: 'root' })
export class SignalRService implements OnDestroy {

  private hub = new signalR.HubConnectionBuilder()
    .withUrl(`${config.videoUrl}`+ '/hubs/call')
    .withAutomaticReconnect()
    .build();

  // Streams consumed by nurse and doctor components
  incomingCall$ = new Subject<IncomingCallPayload>();
  callDeclined$ = new Subject<void>();
  doctorJoined$ = new Subject<{ doctorName: string }>();

  get connectionId(): string { return this.hub.connectionId ?? ''; }

  // ── connect(userId) ────────────────────────────────────────────────────
  // Call this once from ngOnInit on BOTH nurse and doctor components.
  // userId must be the same integer your hospital API uses for this user
  // (the same value you pass as doctorId in the CallStartRequest).
  async connect(userId: number): Promise<void> {
    if (this.hub.state === signalR.HubConnectionState.Connected) {
      // Already connected — just re-register in case userId changed
      await this.hub.invoke('RegisterUser', userId);
      return;
    }

    // Register handlers BEFORE starting so no events are missed
    this.registerHandlers();

    await this.hub.start();

    // Register this user's connectionId in the backend ConnectionStore
    await this.hub.invoke('RegisterUser', userId);

    // Re-register after every automatic reconnect (connectionId changes)
    this.hub.onreconnected(async () => {
      await this.hub.invoke('RegisterUser', userId);
    });
  }

  // ── Hub invocations ────────────────────────────────────────────────────

  /** Doctor tells nurse "I joined the call" */
  notifyDoctorJoined(nurseConnectionId: string, doctorName: string): Promise<void> {
    return this.hub.invoke('NotifyDoctorJoined', nurseConnectionId, doctorName);
  }

  /** Doctor declines the call */
  declineCall(nurseConnectionId: string): Promise<void> {
    return this.hub.invoke('DeclineCall', nurseConnectionId);
  }

  // leaveChannel is Agora-only cleanup; no hub method needed
  leaveChannel(_channelName: string): Promise<void> {
    return Promise.resolve();
  }

  async ngOnDestroy(): Promise<void> {
    await this.hub.stop();
  }

  // ── Private ────────────────────────────────────────────────────────────
  private registerHandlers(): void {
    this.hub.off('IncomingCall');
    this.hub.off('CallDeclined');
    this.hub.off('DoctorJoined');

    this.hub.on('IncomingCall', (data: IncomingCallPayload) =>
      this.incomingCall$.next(data));

    this.hub.on('CallDeclined', () =>
      this.callDeclined$.next());

    this.hub.on('DoctorJoined', (data: { doctorName: string }) =>
      this.doctorJoined$.next(data));
  }
}