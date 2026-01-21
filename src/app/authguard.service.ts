import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService {
  constructor() { }
  getAuthStatus() {
    if (sessionStorage.getItem("isLoggedIn")) {
      return JSON.parse(sessionStorage.getItem("isLoggedIn") || '');
    }
    return false;
  }
}
