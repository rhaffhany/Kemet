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
    // const isPrivatePlace = route.url.some(segment => segment.path === 'app-places'); 

    const isPublicActivity = route.url.some(segment => segment.path === 'activities'); 
    // const isPrivateActivity = route.url.some(segment => segment.path === 'app-activity'); 

    if (!isLoggedIn) {
      if (!isPublicPlace || !isPublicActivity) {
        this.modalService.openLogin(); 
        return false; 
      }
      return true; // Allow non-logged-in users to visit /places
    }

  
    if(isLoggedIn){
      if (isPublicPlace) {
        const placeID = route.params['placeID'];
        this.router.navigate([`/app-places/${placeID}`]); 
        return false;
      }else if(isPublicActivity){
        const activityID = route.params['activityID'];
        this.router.navigate([`/app-activities/${activityID}`]); 
        return false;
      }
      return true; 
    }

    return false;
   

 
    
  }

}
