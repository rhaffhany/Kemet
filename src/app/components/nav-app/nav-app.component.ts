import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-nav-app',
  templateUrl: './nav-app.component.html',
  styleUrls: ['./nav-app.component.scss']
})
export class NavAppComponent {
  isCollapsed = true;
  isScrolled = false;
  isHomePage = false;

  logo: string = "/assets/logo/logo.png";
  searchIcon: string = "/assets/icons/Search.png";
  profilePic: string = "/assets/icons/profile-pic.svg";

  userData: any = {};

  constructor(
    private _ProfileService: ProfileService,
    private _AuthService: AuthService,
    private _Router: Router
  ) {
    // Listen for route changes and check if we are on the home page
    this._Router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isHomePage = event.urlAfterRedirects === '/home' || event.urlAfterRedirects === '/';
        this.isScrolled = false; // Reset scroll state when navigating to home
      });
  }

  ngOnInit(): void {
    this._ProfileService.getCurrentUserData().subscribe({
      next: (data) => {
        this.userData = data;

        // Assign profile image if available, otherwise keep default
        this.profilePic = this.userData.profileImageURL 
          ? this.userData.profileImageURL 
          : "/assets/icons/profile-pic.svg";
      },
      error: (err) => console.error('Error fetching user data:', err)
    });
  }

  logout() {
    this._AuthService.logout();
  }

  uploadProfileImg(event: any) {
    const file = event.target.files[0];
    if (!file) {
      console.error('No file selected!');
      return;
    }

    const formData: FormData = new FormData();
    formData.append('ProfileImage', file);

    this._ProfileService.uploadProfileImg(formData).subscribe({
      next: (response) => {
        this.profilePic = `https://localhost:7051/${response.filePath}`;
      },
      error: (err) => {
        console.error('Upload Error:', err);
      }
    });
  }

  closeCollapse() {
    this.isCollapsed = true;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50; // Change background after 50px scroll
  }
}
