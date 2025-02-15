import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ModalService } from './services/modal.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const isPublicPlace = route.url.some(segment => segment.path === 'places'); 
    const isPrivatePlace = route.url.some(segment => segment.path === 'app-places'); 

    if (!isLoggedIn) {
      if (!isPublicPlace) {
        this.modalService.openLogin(); 
        return false; 
      }
      return true; // Allow non-logged-in users to visit /places
    }

  
    if (isPublicPlace) {
      const placeID = route.params['placeID'];
      this.router.navigate([`/app-places/${placeID}`]); 
      return false;
    }

    return true; 
  }
}
