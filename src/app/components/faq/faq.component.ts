import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  
  showChat: boolean = false;

  toggleChatBot() {
      this.showChat = !this.showChat;
  }

}
