import { SearchService } from 'src/app/services/search.service';
import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-promote-events',
  templateUrl: './promote-events.component.html',
  styleUrls: ['./promote-events.component.scss']
})
export class PromoteEventsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;
  currentImageIndex: number = 0;
  intervalId: any;
  images: string[] = [
    'assets/img/grand museum2.jpg',
    'assets/img/grand museum3.jpg'
  ];
  fallbackImage: string = 'assets/img/grand museum2.jpg';
  imageLoadStates: boolean[] = [false, false];
  imageErrorStates: boolean[] = [false, false];

  ngAfterViewInit(): void {
    // Start immediately - first image should be visible
    this.currentImageIndex = 0;
    this.startContinuousCycling();
  }

  preloadImages(): Promise<void[]> {
    const imagePromises = this.images.map((imageSrc, index) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.imageLoadStates[index] = true;
          this.imageErrorStates[index] = false;
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to preload image: ${imageSrc}`);
          this.imageErrorStates[index] = true;
          this.imageLoadStates[index] = false;
          // Keep original image path, fallback will be handled in template
          resolve();
        };
        img.src = imageSrc;
      });
    });

    return Promise.all(imagePromises);
  }

  startContinuousCycling(): void {
    // Clear any existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Start continuous cycling between images
    this.intervalId = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }, 4000); // Change every 4 seconds
  }

  getCurrentImage(): string {
    return this.images[this.currentImageIndex] || this.fallbackImage;
  }

  getNextImage(): string {
    const nextIndex = (this.currentImageIndex + 1) % this.images.length;
    return this.images[nextIndex] || this.fallbackImage;
  }

  isCurrentImageLoaded(): boolean {
    return this.imageLoadStates[this.currentImageIndex] || false;
  }

  hasCurrentImageError(): boolean {
    return this.imageErrorStates[this.currentImageIndex] || false;
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Enhanced image error handling
  onImageError(event: any): void {
    console.warn('Image failed to load:', event.target.src);
    event.target.src = this.fallbackImage;
  }

  // Enhanced image load handling
  onImageLoad(event: any): void {
    // Image loaded successfully
  }

  searchIcon = "assets/icons/Search.png";
  query = '';
  searchResults: any[] = [];
  errorMessage = '';
  notFoundImg: string = "assets/img/not found.jpg";

  constructor(
    private SearchService: SearchService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}
  
  submitSearch(): void {
    if (this.query.trim()) {
      this.router.navigate(['/search-results'], { queryParams: { q: this.query } });
    }
  }
  
  goToDetails(result: any) {
    if (result.type === 'place') {
      this.router.navigate(['/app-places', result.id]);
    } else if (result.type === 'activity') {
      this.router.navigate(['/app-activities', result.id]);
    }
  }

  onSearchInput(): void {
    if (this.query.trim()) {
      this.SearchService.search(this.query).subscribe({
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
  }

  // Enhanced search result image error handling
  onSearchResultImageError(event: any): void {
    console.warn('Search result image failed to load:', event.target.src);
    event.target.src = this.notFoundImg;
  }

  focusSearchInput(): void {
    this.searchInput.nativeElement.focus();
    if (this.query.trim()) {
      this.submitSearch();
    }
  }
}

