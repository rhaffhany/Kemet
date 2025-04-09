import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  logo:string = "/assets/logo/kemet.png";
  facebookLogo:string = "/assets/icons/Facebook.svg";
  twitterLogo:string = "/assets/icons/twitter.png";
  instagramLogo:string = "/assets/icons/Instagram.svg";
  tiktokLogo:string = "/assets/icons/tiktok.png";

  user:string = '@';

  emailLogo:string = "/assets/icons/Email.svg";
  phoneLogo:string = "/assets/icons/Phone.svg";
  locationLogo:string = "/assets/icons/Mark.svg";

  email:string = "contact@company.com";

  constructor(private router: Router) {}

  navigateToPlan(): void {
    this.router.navigate(['/plan']);
  }
}
