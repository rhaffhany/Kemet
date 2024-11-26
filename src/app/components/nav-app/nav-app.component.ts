import { Component } from '@angular/core';

@Component({
  selector: 'app-nav-app',
  templateUrl: './nav-app.component.html',
  styleUrls: ['./nav-app.component.scss']
})
export class NavAppComponent {

  logo:string = "/assets/logo/logo.png";
  searchIcon:string = "/assets/icons/Search.png"
  profilePic:string = "/assets/icons/profilePic.png"
  // profileImg: string = 'assets/img/default-profile.png';

  
}
