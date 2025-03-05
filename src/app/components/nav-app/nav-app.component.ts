import { SearchService } from './../../services/search.service';
import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { filter } from 'rxjs/operators';
import { placeDetails } from 'src/app/interfaces/place-details';

@Component({
  selector: 'app-nav-app',
  templateUrl: './nav-app.component.html',
  styleUrls: ['./nav-app.component.scss']
})
export class NavAppComponent {
  isCollapsed = true;
  isScrolled = false;
  isHomePage = false;
  isSearchActive = false;

  logo: string = "/assets/logo/logo.png";
  searchIcon: string = "/assets/icons/Search.png";
  profilePic: string = "/assets/icons/profile-pic.svg";
  places: any = [];

  userData: any = {};
  query: string = '';  
  searchResults: placeDetails[] = []; 
  errorMessage: string = ''; 

  constructor(
    private _ProfileService: ProfileService,
    private _AuthService: AuthService,
    private _Router: Router,
    private _searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this._Router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      console.log('Navigation Event:', event);

      // Checking both `event.urlAfterRedirects` and `event.url`
      const currentUrl = event.urlAfterRedirects || event.url;
      console.log('Current URL:', currentUrl);
  
      this.isHomePage = currentUrl === '/home' || currentUrl === '/';
      console.log('isHomePage:', this.isHomePage);
      this.onWindowScroll();
    });

    // Fetch user data
    this._ProfileService.getCurrentUserData().subscribe({
      next: (data) => {
        this.userData = data;
        this.profilePic = this.userData.profileImageURL
          ? this.userData.profileImageURL 
          : "/assets/icons/profile-pic.svg";
      },
      error: (err) => console.error('Error fetching user data:', err)
    });

    this.onWindowScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const navbar = document.querySelector('.navbar') as HTMLElement;
    if (window.scrollY > 50) {
      this.isScrolled = true;
      if (navbar) {
        navbar.classList.add('scrolled');
      }
    } else {
      this.isScrolled = false;
      if (navbar) {
        navbar.classList.remove('scrolled');
      }
    }
  }

  logout(): void {
    this._AuthService.logout();
  }

  uploadProfileImg(event: any): void {
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

  closeCollapse(): void {
    this.isCollapsed = true;
  }

  navigateToPlaceDetails(placeId: number): void {
    if (!placeId || typeof placeId !== 'number') {
      console.error('Invalid placeId:', placeId);
      return;
    }
    this._Router.navigate(['/app-places', placeId]); // Changed to '/app-places'
    this.clearSearch();
  }

  // search
  onSearchInput() {
    // Your existing search logic
    this._searchService.search(this.query).subscribe({
      next: (results) => {
        console.log('Raw API response:', results); // 👈 Add this
        this.searchResults = results;
      },
      error: (err) => {
        console.error('Search error:', err);
      }
    });
  }
  activateSearch(): void {
    this.isSearchActive = true;
  }
  deactivateSearch(): void {
    setTimeout(() => {
      this.isSearchActive = false;
    }, 200); // Small delay to allow clicking results
  }
  onResultClick(result: placeDetails): void {
    if (!result?.placeId) {
      console.error('Invalid place ID:', result);
      return;
    }
    this._Router.navigate(['/places', result.placeId.toString()]);

    // Clear search state
    this.searchResults = [];
    this.query = '';
  }
  private clearSearch(): void {
    this.searchResults = [];
    this.query = '';
  }
  

}
