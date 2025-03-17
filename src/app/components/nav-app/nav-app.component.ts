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

  logo: string = "/assets/logo/kemet.png";
  searchIcon: string = "/assets/icons/Search.png";
  profilePic: string = "/assets/icons/profile-pic.svg";
  places: any = [];

  userData: any = {};
  query = '';
  searchResults: any[] = [];
  errorMessage = '';

  constructor(
    private _ProfileService: ProfileService,
    private _AuthService: AuthService,
    private _Router: Router,
    private router: Router,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Listen to navigation events
    this._Router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isHomePage = event.urlAfterRedirects === '/home' || event.urlAfterRedirects === '/';
        this.isScrolled = false; 
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

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50; // Change background after 50px scroll
  }

  activateSearch(): void {
    this.isSearchActive = true;
  }

  deactivateSearch(): void {
    setTimeout(() => {
      this.isSearchActive = false;
    }, 200); // Small delay to allow clicking results
  }

  
  goToDetails(result: any) {
    console.log('Navigating to:', result);

    // Navigate based on result type
    if (result.type === 'place') {
      this.router.navigate(['/app-places', result.id]); 
    } else if (result.type === 'activity') {
      this.router.navigate(['/app-activities', result.id]); 
    }
  }

  onSearchInput(): void {
    if (this.query.trim()) {
      this.searchService.search(this.query).subscribe({
        next: (results) => {
          this.searchResults = results;
          this.errorMessage = results.length === 0 ? 'No results found' : '';
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Search error:", error);
          this.errorMessage = error;
          this.searchResults = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      this.searchResults = [];
      this.errorMessage = '';
      this.cdr.detectChanges();
    }
  }}