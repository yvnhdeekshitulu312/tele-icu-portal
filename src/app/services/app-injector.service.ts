import { Injectable, Injector } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppInjector {

  private static injector: Injector;
  constructor() { }

  static getInjector(): Injector {
    return AppInjector.injector
  }

  static setInjector(injector: Injector) {
    AppInjector.injector = injector;
  }
}

