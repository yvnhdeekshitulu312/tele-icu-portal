import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor() { }
  private canEditSubject = new BehaviorSubject<boolean>(true);
  canEdit$ = this.canEditSubject.asObservable();
  private subject = new BehaviorSubject("");

  sendMessage(message: any) {
    this.subject.next(message);
  }

  getMessage() {
    return this.subject.asObservable();
  }

  setCanEditStatus(status: boolean) {
    this.canEditSubject.next(status);
  }
}
