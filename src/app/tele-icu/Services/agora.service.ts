import { Injectable } from '@angular/core';
import AgoraRTC, {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack
} from 'agora-rtc-sdk-ng';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { config, environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AgoraService {

  private _nurseClient:  IAgoraRTCClient | null = null;
  private _doctorClient: IAgoraRTCClient | null = null;

  private localAudioTrack: ILocalAudioTrack | null = null;
  public  localVideoTrack: ILocalVideoTrack | null = null;

  remoteUsers: Map<number, string> = new Map();

  private readonly appId = environment.agoraLicense;
  private readonly BASE  = `${config.videoUrl}`;

  private activeClient: IAgoraRTCClient | null = null;

  constructor(private http: HttpClient) {}

  private getToken(channelName: string, uid: number) {
    return this.http.get<{ token: string }>(
      `${this.BASE}/api/agora/token?channelName=${channelName}&uid=${uid}`
    );
  }

  // ── Join ──────────────────────────────────────────────────────────────────
  async join(
    channelName:          string,
    uid:                  number,
    localPlayerElementId: string,
    remoteContainerId:    string,
    getRemoteLabel:       (uid: number) => string = (u) => `User ${u}`,
    role:                 'nurse' | 'doctor' = 'nurse'
  ): Promise<void> {

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

    if (client.connectionState === 'CONNECTED' || client.connectionState === 'CONNECTING') {
      await this._leaveClient(client);
    }

    this.activeClient = client;

    const { token } = await firstValueFrom(this.getToken(channelName, uid));
    await client.join(this.appId, channelName, token, uid);

    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    this._playWhenReady(localPlayerElementId);

    await client.publish([this.localAudioTrack, this.localVideoTrack]);

    // Remote users already in channel when we join
    for (const user of client.remoteUsers) {
      if (user.hasVideo) {
        await this._subscribeAndRender(client, user, 'video', remoteContainerId, getRemoteLabel);
      }
      if (user.hasAudio) {
        await this._subscribeAndRender(client, user, 'audio', remoteContainerId, getRemoteLabel);
      }
    }

    // New remote user publishes a track
    client.on('user-published', async (user, mediaType) => {
      await this._subscribeAndRender(client, user, mediaType, remoteContainerId, getRemoteLabel);
    });

    // Remote user stops a track
    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        const el = document.getElementById(`remote-${user.uid}`);
        el?.remove();
        this.remoteUsers.delete(user.uid as number);
      }
    });

    // Remote user fully leaves
    client.on('user-left', (user) => {
      const el = document.getElementById(`remote-${user.uid}`);
      el?.remove();
      this.remoteUsers.delete(user.uid as number);
    });
  }

  // ✅ Polls every 100ms (up to 3s) until the element exists, then plays
  private _playWhenReady(elementId: string, attempts = 0): void {
    const el = document.getElementById(elementId);
    if (el) {
      this.localVideoTrack?.play(elementId);
      return;
    }
    if (attempts < 30) {
      setTimeout(() => this._playWhenReady(elementId, attempts + 1), 100);
    } else {
      console.warn(`[Agora] Local player element never appeared: #${elementId}`);
    }
  }

  // ── Leave ─────────────────────────────────────────────────────────────────
  async leave(): Promise<void> {
    if (this.activeClient) {
      await this._leaveClient(this.activeClient);
      this.activeClient = null;
    }
  }

  // ── Mic / Camera ──────────────────────────────────────────────────────────
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

  // ── Private ───────────────────────────────────────────────────────────────
  private async _leaveClient(client: IAgoraRTCClient): Promise<void> {
    // ✅ stop() before close() — releases camera light properly
    this.localAudioTrack?.stop();
    this.localAudioTrack?.close();
    this.localVideoTrack?.stop();
    this.localVideoTrack?.close();
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.remoteUsers.clear();

    // ✅ Remove ALL dynamically created remote tiles
    document.querySelectorAll('[id^="remote-"]').forEach(el => el.remove());

    try { await client.leave(); } catch { /* already gone */ }
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

      const container = document.getElementById(remoteContainerId);
      if (!container) {
        console.warn(`[Agora] Remote container not found: #${remoteContainerId}`);
        return;
      }

      let wrapper = document.getElementById(`remote-${uid}`);
      if (!wrapper) {
        wrapper           = document.createElement('div');
        wrapper.id        = `remote-${uid}`;
        wrapper.className = 'video-tile';
        wrapper.style.cssText = 'width:100%;height:100%;position:relative;';
        wrapper.innerHTML = `
          <p class="tile-label">${label}</p>
          <div id="remote-video-${uid}" style="width:100%;height:100%;"></div>
        `;
        container.appendChild(wrapper);
      }

      // ✅ Small delay so the appended child is painted before play()
      setTimeout(() => user.videoTrack?.play(`remote-video-${uid}`), 100);
    }

    if (mediaType === 'audio') {
      user.audioTrack?.play();
    }
  }
}