import { LanguageAssistantService } from './../../services/language-assistant.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {

  constructor(private _LanguageAssistantService:LanguageAssistantService) {}

  kemetLogo: string = '../../../assets/logo/kemet.png';
  kLogo: string = '../../../assets/logo/K.PNG';

  showChat: boolean = false;

  userInput: string = '';
  isRecording = false;
  sourceLang: string = 'en';
  targetLang: string = 'ar';
  messages: { text: string, type: 'user' | 'bot' }[] = [];

  sendMessage() {
    const userMsg = this.userInput.trim();
    if (!userMsg) return;

    this.messages.push({ text: userMsg, type: 'user' });

    this._LanguageAssistantService.translate(userMsg, this.sourceLang, this.targetLang)
      .subscribe(res => {
        const translatedText = res.translation;
        console.log("translatedText:",translatedText);
        
        this.messages.push({ text: translatedText, type: 'bot' });

        this._LanguageAssistantService.getSpeech(translatedText, this.targetLang)
          .subscribe(audioBlob => {
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
          });
      });

    this.userInput = '';
  }

  startVoiceInput() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = this.sourceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.userInput = transcript;
      this.sendMessage();
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
  }

  toggleVoiceInput() {
    this.isRecording = !this.isRecording;
  
    if (this.isRecording) {
      this.startVoiceInput();
    } else {
      return;
    }
  }

  toggleChatBot() {
      this.showChat = !this.showChat;
  }
  
  showAssistant = false;

  toggleAssistant() {
    this.showAssistant = !this.showAssistant;
  }


}
