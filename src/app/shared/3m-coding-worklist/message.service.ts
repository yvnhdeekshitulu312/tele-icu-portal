import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messageSubject = new Subject<any>();
  message$ = this.messageSubject.asObservable();

  constructor() {
    if (window['postMessage']) {
      //if (window['addEventListener']) {
        window.addEventListener('message', this.onMessage.bind(this), false);
      // } else {
      //   window.attachEvent('onmessage', this.onMessage.bind(this));
      // }
    }
  }

  private onMessage(event: MessageEvent): void {
    const crsurl = 'https://crs.alhammadi.med.sa';
    if (event.origin === crsurl) {
      try {
        const msgobj = JSON.parse(event.data);
        this.messageSubject.next(msgobj);
      } catch (err) {
        console.error('Error parsing message data:', err);
      }
    } else {
      console.log('Message received from an unknown domain');
    }
  }

  sendMessage(message: any): void {
    const crsurl = 'https://crs.alhammadi.med.sa';
    const iframe = document.getElementById('wciframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.contentWindow?.postMessage(JSON.stringify(message), crsurl);
    }
  }
}
