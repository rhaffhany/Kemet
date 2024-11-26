import { Component } from '@angular/core';

@Component({
  selector: 'app-nav-auth',
  templateUrl: './nav-auth.component.html',
  styleUrls: ['./nav-auth.component.scss']
})
export class NavAuthComponent {

  showModal = false; 

  // Open login modal
  openLoginModal(event: Event) {
    event.preventDefault(); 
    this.showModal = true; 
    console.log('Modal opened'); 
  }

  // Close login modal
  closeModal() {
    this.showModal = false; 
    console.log('Modal closed'); 
  }
  
}
