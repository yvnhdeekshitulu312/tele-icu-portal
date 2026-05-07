// tele-icu.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subscription } from 'rxjs';
import { SignalRService } from './Services/signal-r.service';
import { AgoraService } from './Services/agora.service';

@Component({
  selector: 'app-tele-icu',
  templateUrl: './tele-icu.component.html',
  styleUrls: ['./tele-icu.component.scss']
})
export class TeleIcuComponent implements OnInit, OnDestroy {

  // ── Identities ────────────────────────────────────────────────────────────
  nurseId   = 'nurse-001';
  nurseName = 'Nurse Priya';
  doctorId  = 'doctor-001';

  // ── Call state ────────────────────────────────────────────────────────────
  isInCall     = false;
  isConnecting = false;
  callDeclined = false;
  channelName  = '';
  localUid     = 0;

  // ── Subscriptions ─────────────────────────────────────────────────────────
  private subs = new Subscription();

  constructor(
    public  agora:   AgoraService,
    private signalR: SignalRService,
    private http:    HttpClient
  ) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  async ngOnInit() {
    await this.signalR.connect();

    // Register nurse's SignalR connectionId with the backend
    await firstValueFrom(
      this.http.post('https://localhost:7217/api/users/register-connection', {
        userId:       this.nurseId,
        connectionId: this.signalR.connectionId
      })
    );

    // Doctor declined → tear down
    this.subs.add(
      this.signalR.callDeclined$.subscribe(() => this.onCallDeclined())
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.agora.leave();
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async callDoctor() {
    if (this.isConnecting || this.isInCall) return;

    this.isConnecting = true;
    this.callDeclined = false;

    try {
      // Backend creates channel and notifies doctor via SignalR.
      // We send nurseConnectionId so the doctor can fire DeclineCall back to US.
      const res = await firstValueFrom(
        this.http.post<{ channelName: string }>(
          'https://localhost:7217/api/call/start',
          {
            doctorUserId:     this.doctorId,
            nurseName:        this.nurseName,
            nurseConnectionId: this.signalR.connectionId   // ← decline-fix payload
          }
        )
      );

      this.channelName = res.channelName;
      this.localUid    = Math.floor(Math.random() * 100_000);

      await this.agora.join(this.channelName, this.localUid);
      this.isInCall = true;
    } catch (err) {
      console.error('Failed to start call:', err);
    } finally {
      this.isConnecting = false;
    }
  }

  async endCall() {
    await this.agora.leave();
    this.isInCall    = false;
    this.channelName = '';
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  private onCallDeclined() {
    this.agora.leave();
    this.isInCall     = false;
    this.isConnecting = false;
    this.callDeclined = true;       // drives UI banner
    this.channelName  = '';
  }
}