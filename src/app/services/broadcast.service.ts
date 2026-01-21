import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {
  private channel: BroadcastChannel;
  private readonly channelName = 'app_channel';

  constructor() {
    this.channel = new BroadcastChannel(this.channelName);
  }

  sendMessage(message: string): void {
    this.channel.postMessage(message);
  }

  listenForMessages(callback: (message: string) => void): void {
    this.channel.onmessage = (event) => {
      callback(event.data);
    };
  }

  closeChannel(): void {
    this.channel.close();
  }
}
