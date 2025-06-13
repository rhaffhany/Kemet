import { LanguageAssistantService } from './../../services/language-assistant.service';
import { Component, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {

  constructor(
    private _LanguageAssistantService: LanguageAssistantService,
    private elementRef: ElementRef
  ) {}

  kemetLogo: string = '../../../assets/logo/kemet.png';
  kLogo: string = '../../../assets/logo/K.PNG';

  showChat: boolean = false;
  showAssistant: boolean = false;
  showBlur: boolean = false;

  userInput: string = '';
  isRecording = false;
  sourceLang: string = 'en';
  targetLang: string = 'ar';
  messages: { text: string, type: 'user' | 'bot' }[] = [];

  // Click outside detection
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    
    const isToggleButton = (event.target as HTMLElement).classList.contains('comment') || 
                           (event.target as HTMLElement).classList.contains('mic-icon');
    
    const isInsideAssistantDialog = (event.target as HTMLElement).closest('.chat-bot');
    
    if (!clickedInside && !isToggleButton && !isInsideAssistantDialog && (this.showChat || this.showAssistant)) {
      this.closeAll();
    }
  }

  closeAll() {
    this.showChat = false;
    this.showAssistant = false;
    this.showBlur = false;
  }

  sendMessage() {
    const userMsg = this.userInput.trim();
    if (!userMsg) return;

    this.messages.push({ text: userMsg, type: 'user' });

    this._LanguageAssistantService.translate(userMsg, this.sourceLang, this.targetLang)
      .subscribe(res => {
        const translatedText = res.translation;
        console.log("translatedText:", translatedText);
        
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

  toggleVoiceInput(event: Event) {
    event.stopPropagation(); 
    
    this.isRecording = !this.isRecording;
  
    if (this.isRecording) {
      this.startVoiceInput();
    }
  }

  toggleChatBot(event?: Event) {
    if (event) event.stopPropagation(); 
    
    this.showChat = !this.showChat;
    this.showAssistant = false; 
    this.showBlur = this.showChat; 
  }
  
  toggleAssistant(event?: Event) {
    if (event) event.stopPropagation();
    
    this.showAssistant = !this.showAssistant;
    this.showChat = false; 
    this.showBlur = this.showAssistant; 
  }
  
}