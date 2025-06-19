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
  isThingsToDoPage = false;
  isSearchResultPage = false;
  isPackagePage = false;
  isAgencyPage = false;
  isPaymentPage = false;
  mobileMenuOpen = false;

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
    this.isHomePage = currentUrl === '/home' || currentUrl === '/' || currentUrl.includes('search-result');
    this.isThingsToDoPage = currentUrl.includes('thingstodo');
    this.isSearchResultPage = currentUrl.includes('search-result');
    this.isPackagePage = currentUrl.includes('Package-details');
    this.isAgencyPage = currentUrl.includes('travelAgency-profile');
    this.isPaymentPage = currentUrl.includes('payment');
    this.showSearchBar = !(this.isHomePage || this.isThingsToDoPage);
  }

  private setupRouteListener(): void {
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects.split('?')[0];
      this.isHomePage = url === '/home' || url === '/' || url.includes('search-result');
      this.isThingsToDoPage = url.includes('thingstodo');
      this.isSearchResultPage = url.includes('search-result');
      this.isPackagePage = url.includes('Package-details');
      this.isAgencyPage = url.includes('travelAgency-profile');
      this.isPaymentPage = url.includes('payment');
      this.showSearchBar = !(this.isHomePage || this.isThingsToDoPage);
      this.isScrolled = false;
      this.searchResults = [];
    });
  }

  private loadUserData(): void {
    this.profileService.getCurrentUserData().subscribe({
      next: (data) => {
        this.userData = data || {};
        this.profilePic = this.userData.profileImageURL || this.profilePic;
        this.cdr.detectChanges(); // Force change detection
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
        // Initialize empty userData on error
        this.userData = {};
        this.cdr.detectChanges();
      }
    });
  }
  submitSearch(): void {
    if (this.query.trim()) {
      this.router.navigate(['/search-results'], { queryParams: { q: this.query } });
    }
  }
  
  @HostListener('window:scroll', [])
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

  // Mobile menu methods
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  openMobileMenu(): void {
    this.mobileMenuOpen = true;
  }

  // Navigate to profile page
  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeMobileMenu();
  }

  // Get display name for user
  get userDisplayName(): string {
    if (this.userData?.username) {
      return this.userData.username;
    }
    if (this.userData?.name) {
      return this.userData.name;
    }
    if (this.userData?.firstName) {
      return this.userData.firstName;
    }
    if (this.userData?.email) {
      return this.userData.email.split('@')[0]; // Use email username as fallback
    }
    return 'User';
  }
}
