import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  isLoading = new Subject<boolean>();
  public defaultLangCode = new BehaviorSubject("");
  public count: number = 0;

  constructor() {
    if ("lang" in sessionStorage) {
      let langCode = sessionStorage.getItem('lang');
      this.setDefaultLangCode(langCode);
    } else {
      this.setDefaultLangCode("en");
    }
  }
  setDefaultLangCode(code: any) {
    this.defaultLangCode.next(code);
  }
  getDefaultLangCode() {
    return this.defaultLangCode.asObservable();
  }
  show() {
    this.count++;
    this.isLoading.next(true);
  }

  hide() {
    // if (this.count > 0) {
    //   this.count--;
    // }
    // if (this.count === 0) {
      this.isLoading.next(false);
    //}
  }
}
