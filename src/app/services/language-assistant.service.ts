import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

@Injectable({
  providedIn: 'root'
})

export class LanguageAssistantService {

  // private DeployURL = 'https://kemet-server.runasp.net';
  private translationUrl = 'https://kemet-server.runasp.net/translateText';
  private ttsUrl = 'https://kemet-server.runasp.net/textToSpeech';


  constructor(private _HttpClient: HttpClient) {}

  translate(text: string, sourceLang: string, targetLang: string) {
    return this._HttpClient.post<{ translation: string }>(`${this.translationUrl}`, { text, sourceLang, targetLang });
  }  

  getSpeech(text: string, languageCode: string) {
    return this._HttpClient.post(`${this.ttsUrl}`, { text, languageCode }, { responseType: 'blob' });
  }

  speechToText(audioBase64: string, lang: string): Observable<any> {
    return this._HttpClient.post<any>('https://kemet-server.runasp.net/speechToText', {
      audio: audioBase64,
      lang: lang
    });
  }

  // translate(text: string, source: string, target: string): Observable<any> {
  //   return this._HttpClient.post<any>(this.translationUrl, { text, source, target });
  // }

  // getSpeech(text: string, lang: string): Observable<Blob> {
  //   return this._HttpClient.post(this.ttsUrl, { text, lang }, { responseType: 'blob' });
  // }

}
