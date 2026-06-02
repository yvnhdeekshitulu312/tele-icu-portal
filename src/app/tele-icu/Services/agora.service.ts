// agora.service.ts
import { Injectable } from '@angular/core';
import AgoraRTC, {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack
} from 'agora-rtc-sdk-ng';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { config } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AgoraService {

  // Each call to createClient() gives an independent client.
  // We keep one per role so nurse and doctor never share a client.
  private _nurseClient:  IAgoraRTCClient | null = null;
  private _doctorClient: IAgoraRTCClient | null = null;

  private localAudioTrack: ILocalAudioTrack | null = null;
  private localVideoTrack: ILocalVideoTrack | null = null;

  /** uid → display label for remote tiles */
  remoteUsers: Map<number, string> = new Map();

  private readonly appId  = '8ba10b49e0264094a4d2c968abdc1e35';
  private readonly BASE   = `${config.videoUrl}`;

  // The client that is currently in a call (set by join, cleared by leave)
  private activeClient: IAgoraRTCClient | null = null;

  constructor(private http: HttpClient) {}

  // ── Token ──────────────────────────────────────────────────────────────────
  private getToken(channelName: string, uid: number) {
    return this.http.get<{ token: string }>(
      `${this.BASE}/api/agora/token?channelName=${channelName}&uid=${uid}`
    );
  }

  // ── Join ───────────────────────────────────────────────────────────────────
  /**
   * @param role  'nurse' | 'doctor'  — each role gets its own RTC client so
   *              the same Angular app can have both sides open without sharing
   *              a client that is already in connecting/connected state.
   */
  async join(
    channelName:          string,
    uid:                  number,
    localPlayerElementId: string,
    remoteContainerId:    string,
    getRemoteLabel:       (uid: number) => string = (u) => `User ${u}`,
    role:                 'nurse' | 'doctor' = 'nurse'
  ): Promise<void> {

    // Pick / create the right client for this role
    let client: IAgoraRTCClient;
    if (role === 'nurse') {
      if (!this._nurseClient) {
        this._nurseClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      }
      client = this._nurseClient;
    } else {
      if (!this._doctorClient) {
        this._doctorClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      }
      client = this._doctorClient;
    }

    // Guard: if this client is already connected, leave first
    if (
      client.connectionState === 'CONNECTED' ||
      client.connectionState === 'CONNECTING'
    ) {
      await this._leaveClient(client);
    }

    this.activeClient = client;

    // Fetch token and join
    const { token } = await firstValueFrom(this.getToken(channelName, uid));
    await client.join(this.appId, channelName, token, uid);

    // Local tracks
    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    setTimeout(() => {
      this.localVideoTrack?.play(localPlayerElementId);
    }, 300);

    await client.publish([this.localAudioTrack, this.localVideoTrack]);

    // Remote users already in channel
    for (const user of client.remoteUsers) {
      await this._subscribeAndRender(client, user, 'video', remoteContainerId, getRemoteLabel);
      await this._subscribeAndRender(client, user, 'audio', remoteContainerId, getRemoteLabel);
    }

    // New remote user joins
    client.on('user-published', async (user, mediaType) => {
      await this._subscribeAndRender(client, user, mediaType, remoteContainerId, getRemoteLabel);
    });

    // Remote user leaves — remove their tile
    client.on('user-unpublished', (user) => {
      const el = document.getElementById(`remote-${user.uid}`);
      el?.remove();
      this.remoteUsers.delete(user.uid as number);
    });
  }

  // ── Leave (called from component) ─────────────────────────────────────────
  async leave(): Promise<void> {
    if (this.activeClient) {
      await this._leaveClient(this.activeClient);
      this.activeClient = null;
    }
  }

  // ── Mute helpers ───────────────────────────────────────────────────────────
  async toggleMic(): Promise<boolean> {
    if (!this.localAudioTrack) return false;
    const enabled = !this.localAudioTrack.enabled;
    await this.localAudioTrack.setEnabled(enabled);
    return enabled;
  }

  async toggleCamera(): Promise<boolean> {
    if (!this.localVideoTrack) return false;
    const enabled = !this.localVideoTrack.enabled;
    await this.localVideoTrack.setEnabled(enabled);
    return enabled;
  }

  // ── Private helpers ────────────────────────────────────────────────────────
  private async _leaveClient(client: IAgoraRTCClient): Promise<void> {
    this.localAudioTrack?.close();
    this.localVideoTrack?.close();
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.remoteUsers.clear();

    // Clean up remote tiles owned by this client
    const containers = ['remote-container', 'remote-container-doctor'];
    containers.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    });

    // Also remove dynamic per-patient containers
    document.querySelectorAll('[id^="remote-container-"]').forEach(el => {
      (el as HTMLElement).innerHTML = '';
    });

    try {
      await client.leave();
    } catch {
      // Already disconnected — ignore
    }
  }

  private async _subscribeAndRender(
    client:            IAgoraRTCClient,
    user:              any,
    mediaType:         'video' | 'audio' | 'datachannel',
    remoteContainerId: string,
    getLabel:          (uid: number) => string
  ): Promise<void> {
    await client.subscribe(user, mediaType);

    if (mediaType === 'video') {
      const uid   = user.uid as number;
      const label = getLabel(uid);
      this.remoteUsers.set(uid, label);

      let wrapper = document.getElementById(`remote-${uid}`);
      if (!wrapper) {
        wrapper             = document.createElement('div');
        wrapper.id          = `remote-${uid}`;
        wrapper.className   = 'video-tile';
        wrapper.innerHTML   = `<p class="tile-label">${label}</p>
                               <div id="remote-video-${uid}" class="video-box"></div>`;
        document.getElementById(remoteContainerId)?.appendChild(wrapper);
      }

      user.videoTrack?.play(`remote-video-${uid}`);
    }

    if (mediaType === 'audio') {
      user.audioTrack?.play();
    }
  }
}