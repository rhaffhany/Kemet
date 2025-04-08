import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { SearchService } from '../../services/search.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-nav-app',
  templateUrl: './nav-app.component.html',
  styleUrls: ['./nav-app.component.scss']
})
export class NavAppComponent implements OnInit {
  isCollapsed = true;
  isScrolled = false;
  showSearchBar = true;
  isSearchActive = false;
  isHomePage = false;
  isThingsToDoPage = false;  // Move this here only once

  logo = "/assets/logo/kemet.png";
  searchIcon = "/assets/icons/Search.png";
  profilePic = "/assets/icons/profile-pic.svg";

  userData: any = {};
  query = '';
  searchResults: any[] = [];
  errorMessage = '';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkCurrentRoute();
    this.setupRouteListener();
    this.loadUserData();
  }

  private checkCurrentRoute(): void {
    const currentUrl = this.router.url.split('?')[0];
    this.isHomePage = currentUrl === '/home' || currentUrl === '/';
    this.isThingsToDoPage = currentUrl.includes('thingstodo');  // Adjust based on your actual URL structure for Things to Do
    this.showSearchBar = !(this.isHomePage || this.isThingsToDoPage);  // Hide search bar on Home and Things to Do
  }

  private setupRouteListener(): void {
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects.split('?')[0];
      this.isHomePage = url === '/home' || url === '/';
      this.isThingsToDoPage = url.includes('thingstodo');  // Adjust based on your actual URL structure for Things to Do
      this.showSearchBar = !(this.isHomePage || this.isThingsToDoPage);  // Hide search bar on Home and Things to Do
      this.isScrolled = false;
      this.searchResults = [];
    });
  }

  private loadUserData(): void {
    this.profileService.getCurrentUserData().subscribe({
      next: (data) => {
        this.userData = data;
        this.profilePic = this.userData.profileImageURL || this.profilePic;
      },
      error: (err) => console.error('Error fetching user data:', err)
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  activateSearch(): void {
    this.isSearchActive = true;
  }

  deactivateSearch(): void {
    setTimeout(() => this.isSearchActive = false, 200);
  }

  onSearchInput(): void {
    if (this.query.trim()) {
      this.searchService.search(this.query).subscribe({
        next: (results) => {
          this.searchResults = results;
          this.errorMessage = results.length ? '' : 'No results found';
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Search error:", error);
          this.errorMessage = 'Error performing search';
          this.searchResults = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      this.searchResults = [];
      this.errorMessage = '';
    }
  }

  goToDetails(result: any): void {
    if (result.type === 'place') {
      this.router.navigate(['/app-places', result.id]);
    } else if (result.type === 'activity') {
      this.router.navigate(['/app-activities', result.id]);
    }
    this.searchResults = [];
  }

  uploadProfileImg(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('ProfileImage', file);

    this.profileService.uploadProfileImg(formData).subscribe({
      next: (response) => {
        this.profilePic = `https://localhost:7051/${response.filePath}`;
      },
      error: (err) => console.error('Upload Error:', err)
    });
  }

  closeCollapse(): void {
    this.isCollapsed = true;
  }

  toggleProfileMenu(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }
}
