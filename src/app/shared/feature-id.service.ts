import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FeatureIdService {
  private featureIdMap: { [key: string]: string } = {
  };

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setFeatureID(event.urlAfterRedirects);
      }
    });
  }

  private setFeatureID(url: string): void {
    const pathArray = url.split('/').filter(x => x);
    const path = pathArray.length > 1 ? pathArray[1] : pathArray[0] || '';

    if (path) {
      const featureID = this.featureIdMap[path] || null;

      if (featureID) {
        sessionStorage.setItem("FeatureID", featureID);
      }
    } else {
      console.warn("URL does not contain a valid path:", url);
    }
  }
}
