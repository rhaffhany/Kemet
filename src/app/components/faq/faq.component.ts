import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  showMic: Boolean = false;
  toggleMic(){
    this.showMic = !this.showMic;
  }

}
