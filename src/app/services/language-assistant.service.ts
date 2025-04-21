import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

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

  private translationUrl = 'https://kemet-server.runasp.net/api/translation/translate';
  private speechToTextUrl = 'https://kemet-server.runasp.net/api/translation/recognize';
  private textToSpeechUrl = `https://kemet-server.runasp.net/api/translation/Synthesize`;


  constructor(private _HttpClient: HttpClient) {}

  translate(text: string, sourceLang: string, targetLang: string) {
    return this._HttpClient.post(
      this.translationUrl,
      { text, sourceLang, targetLang },
      { responseType: 'text' }
    ).pipe(
      map(res => ({ translation: res }))
    );
  }

  getSpeech(text: string, languageCode: string) {
    return this._HttpClient.post(this.textToSpeechUrl, {
      text,
      languageCode
    }, { responseType: 'blob' });
  }

  speechToText(audioBase64: string, languageCode: string): Observable<any> {
    return this._HttpClient.post<any>(this.speechToTextUrl, {
      audioBase64,
      languageCode
    });
  }

}
