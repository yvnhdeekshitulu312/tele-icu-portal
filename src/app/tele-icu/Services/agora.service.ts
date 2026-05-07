import { Injectable } from '@angular/core';
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AgoraService {

  client: IAgoraRTCClient;
  localAudioTrack: any;
  localVideoTrack: any;

  appId = '8ba10b49e0264094a4d2c968abdc1e35';

  constructor(private http: HttpClient) {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  }

  getToken(channelName: string, uid: number) {
    return this.http.get<any>(
      `https://localhost:7217/api/agora/token?channelName=${channelName}&uid=${uid}`
    );
  }

  async join(channelName: string, uid: number) {
  // const res: any = await firstValueFrom(this.getToken(channelName, uid));
  // const token = res.token;

  // // await this.client.join(this.appId, channelName, token, uid);
  // await this.client.join(this.appId, channelName, null, uid);

  const res: any = await firstValueFrom(this.getToken(channelName, uid));
  const token = res.token;

  await this.client.join(this.appId, channelName, token, uid);

  this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

  setTimeout(() => {
    this.localVideoTrack.play('local-player');
  }, 300);

  await this.client.publish([this.localAudioTrack, this.localVideoTrack]);

  this.client.on('user-published', async (user: any, mediaType: any) => {
    await this.client.subscribe(user, mediaType);

    if (mediaType === 'video') {
      const remoteDiv = document.createElement('div');
      remoteDiv.id = user.uid.toString();
      remoteDiv.style.width = '300px';
      remoteDiv.style.height = '200px';

      document.getElementById('remote-container')?.appendChild(remoteDiv);

      user.videoTrack.play(remoteDiv);
    }

    if (mediaType === 'audio') {
      user.audioTrack.play();
    }
  });
}

  async leave() {
    this.localAudioTrack?.close();
    this.localVideoTrack?.close();
    await this.client.leave();
  }
}