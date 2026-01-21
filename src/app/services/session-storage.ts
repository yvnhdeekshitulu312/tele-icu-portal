import { Injectable } from "@angular/core";
import * as CryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'any'
})

export class SessionStorage {
 
  constructor() {
  }

  get(key: string): any {
    var value: any = sessionStorage.getItem(key);
   
    if(!value) {
      return null
    }

    var decryptedBytes = CryptoJS.AES.decrypt(value, 'hippo007');
    let decryptedValue = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if(decryptedValue[0] === '{' || decryptedValue[1] === '{') {
      return JSON.parse(decryptedValue);
    }

    return decryptedValue;
  }

  set(key: string, value: any): boolean {

    if(!key || !value) {
      return false;
    }

    if(typeof value === 'object') {
      value = JSON.stringify(value);
    }

    const encryptedData = CryptoJS.AES.encrypt(value, 'hippo007').toString();
    sessionStorage.setItem(key, encryptedData);
    return true;
  }

  remove(key: string) {
    sessionStorage.removeItem(key);
  }

  clearStorage(): void {
    sessionStorage.clear();
    localStorage.clear();
  }

  
}
