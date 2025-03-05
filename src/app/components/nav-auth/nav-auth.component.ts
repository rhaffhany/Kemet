import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from './../../services/modal.service';
import { Component } from '@angular/core';
import { HostListener } from '@angular/core';
@Component({
  selector: 'app-nav-auth',
  templateUrl: './nav-auth.component.html',
  styleUrls: ['./nav-auth.component.scss']
})
export class NavAuthComponent {
  logo: string = '/assets/logo/kemet.png';
  loginLogoAlt: string = 'Logo';
  constructor(
    public ModalService: ModalService,
    public AuthService: AuthService
  ){}


  openLoginModal(event: Event) {
    event.preventDefault();
    console.log('Sign In button clicked'); // Debugging log
    this.ModalService.openLogin();
  }
  isLoggedIn$ = this.AuthService.isLoggedIn$;

  logout() {
    this.AuthService.logout();
  }
  isScrolled = false;

    @HostListener('window:scroll', [])
    onWindowScroll() {
      this.isScrolled = window.scrollY > 50; 
    }
  
}
