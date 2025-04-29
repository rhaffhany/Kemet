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
    // Check if the clicked element is outside the chat or assistant components
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    
    // If click is inside the toggle buttons, we don't want to close
    const isToggleButton = (event.target as HTMLElement).classList.contains('comment') || 
                           (event.target as HTMLElement).classList.contains('mic-icon');
    
    // Check if click is inside assistant dialog (chat-bot)
    const isInsideAssistantDialog = (event.target as HTMLElement).closest('.chat-bot');
    
    if (!clickedInside && !isToggleButton && !isInsideAssistantDialog && (this.showChat || this.showAssistant)) {
      // Close everything if clicking outside
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
    const recognition = new (window as any).SpeechRecognition || 
                        (window as any).webkitSpeechRecognition();
    recognition.lang = this.sourceLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.userInput = transcript;
      this.sendMessage();
      this.isRecording = false;
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isRecording = false;
    };

    recognition.onend = () => {
      this.isRecording = false;
    };

    recognition.start();
  }

  toggleVoiceInput(event: Event) {
    event.stopPropagation(); // Prevent the click from bubbling up
    
    this.isRecording = !this.isRecording;
  
    if (this.isRecording) {
      this.startVoiceInput();
    }
  }

  toggleChatBot(event?: Event) {
    if (event) event.stopPropagation(); // Prevent the click from bubbling up
    
    this.showChat = !this.showChat;
    this.showAssistant = false; // Close assistant if open
    this.showBlur = this.showChat; // Show blur if chat is open
  }
  
  toggleAssistant(event?: Event) {
    if (event) event.stopPropagation(); // Prevent the click from bubbling up
    
    this.showAssistant = !this.showAssistant;
    this.showChat = false; // Close chat if open
    this.showBlur = this.showAssistant; // Show blur if assistant is open
  }
}