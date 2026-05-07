// signalr.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignalRService implements OnDestroy {

  private hub = new signalR.HubConnectionBuilder()
    .withUrl('https://localhost:7217/hubs/call')
    .withAutomaticReconnect()
    .build();

  // ── Streams ────────────────────────────────────────────────────────────────
  incomingCall$ = new Subject<{
    channelName:       string;
    callerName:        string;
    nurseConnectionId: string;   // ← added for decline fix
  }>();
  callDeclined$ = new Subject<void>();

  // ── Connection ID ──────────────────────────────────────────────────────────
  get connectionId(): string {
    return this.hub.connectionId ?? '';
  }

  // ── Connect ────────────────────────────────────────────────────────────────
  async connect(): Promise<void> {
    if (this.hub.state === signalR.HubConnectionState.Connected) return;

    await this.hub.start();
    this.registerHandlers();
  }

  // ── Hub methods ────────────────────────────────────────────────────────────

  notifyDoctor(
    doctorConnectionId: string,
    channelName:        string,
    callerName:         string
  ): Promise<void> {
    return this.hub.invoke('NotifyDoctor', doctorConnectionId, channelName, callerName);
  }

  declineCall(nurseConnectionId: string): Promise<void> {
    return this.hub.invoke('DeclineCall', nurseConnectionId);
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────
  async ngOnDestroy(): Promise<void> {
    await this.hub.stop();
  }

  // ── Private ────────────────────────────────────────────────────────────────
  private registerHandlers(): void {
    // Guard: don't double-register on reconnect
    this.hub.off('IncomingCall');
    this.hub.off('CallDeclined');

    this.hub.on('IncomingCall', (data: {
      channelName:       string;
      callerName:        string;
      nurseConnectionId: string;
    }) => {
      this.incomingCall$.next(data);
    });

    this.hub.on('CallDeclined', () => {
      this.callDeclined$.next();
    });

    // Re-register handlers after an automatic reconnect
    this.hub.onreconnected(() => {
      this.hub.off('IncomingCall');
      this.hub.off('CallDeclined');
      this.registerHandlers();
    });
  }
}