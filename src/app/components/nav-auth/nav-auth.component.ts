import { Component } from '@angular/core';

@Component({
  selector: 'app-nav-auth',
  templateUrl: './nav-auth.component.html',
  styleUrls: ['./nav-auth.component.scss']
})
export class NavAuthComponent {
  loginLogoSrc: string = '/assets/logo/logo.png'; 
  loginLogoAlt: string = 'Logo';  
  
  showModal = false; 

  // Open login modal
  openLoginModal(event: Event) {
    event.preventDefault();
    this.showModal = true; 
    console.log('Modal opened'); 
  }

  closeModal() {
    this.showModal = false; 
    console.log('Modal closed'); }
}
