import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  constructor(private http: HttpClient) { }

  translateToArabic(englishText: string): Observable<any> {
    return this.http.post(`${config.chatgptapiurl}`, { englishText });
  }

  generateAIReport(data: any): Observable<any> {
    return this.http.post(`${config.miniAgent}`, data);
  }

}
