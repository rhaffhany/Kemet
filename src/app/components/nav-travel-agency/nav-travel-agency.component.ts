import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-nav-travel-agency',
  templateUrl: './nav-travel-agency.component.html',
  styleUrls: ['./nav-travel-agency.component.scss']
})
export class NavTravelAgencyComponent implements OnInit {
  isCollapsed = true;
  isScrolled = false;
  showSearchBar = true;
  isSearchActive = false;
  isHomePage = false;

  logo: string = "/assets/logo/kemet.png";
  searchIcon: string = "/assets/icons/Search.png";
  profilePic: string = "/assets/icons/profile-pic.svg";

  userData: any = {};
  query = '';
  searchResults: any[] = [];
  errorMessage = '';

  constructor(
    private _ProfileService: ProfileService,
    private _AuthService: AuthService,
    private _Router: Router,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.checkCurrentRoute();
    this.setupRouteListener();
    this.loadUserData();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 0;
  }

  private checkCurrentRoute(): void {
    const currentUrl = this._Router.url.split('?')[0];
    this.isHomePage = currentUrl === '/home' || currentUrl === '/';
    this.showSearchBar = !this.isHomePage;
  }

  private setupRouteListener(): void {
    this._Router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects.split('?')[0];
      this.isHomePage = url === '/home' || url === '/';
      this.showSearchBar = !this.isHomePage;
      this.isScrolled = false;
      this.searchResults = [];
    });
  }
  submitSearch(): void {
    if (this.query.trim()) {
      this._Router.navigate(['/search-results'], { queryParams: { q: this.query } });
    }
  }
  
  loadUserData(): void {
    this._ProfileService.getCurrentUserData().subscribe({
      next: (data) => {
        this.userData = data;
        if (data.profileImageURL) {
          this.profilePic = data.profileImageURL;
        }
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      }
    });
  }

  onSearchInput(): void {
    if (this.query.trim()) {
      this.searchService.search(this.query).subscribe({
        next: (results) => {
          this.searchResults = results;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = error;
          console.error('Search error:', error);
          this.searchResults = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      this.searchResults = [];
    }
  }

  activateSearch(): void {
    this.isSearchActive = true;
  }

  deactivateSearch(): void {
    setTimeout(() => {
      this.isSearchActive = false;
      this.searchResults = [];
    }, 200);
  }

  goToDetails(result: any): void {
    if (result.category === 'Place') {
      this._Router.navigate(['/places', result.id]);
    } else if (result.category === 'Activity') {
      this._Router.navigate(['/activities', result.id]);
    }
    this.searchResults = [];
    this.query = '';
  }

  closeCollapse(): void {
    this.isCollapsed = true;
  }

  toggleProfileMenu(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this._AuthService.logout();
    this._Router.navigate(['/login']);
  }
}
