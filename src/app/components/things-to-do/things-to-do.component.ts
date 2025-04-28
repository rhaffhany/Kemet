import { Component, OnInit, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CarouselComponent } from 'ngx-owl-carousel-o';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService } from '../../services/auth.service';
import { HomeService } from 'src/app/services/home.service';
import { WishlistService } from '../../services/wishlist.service';
import { catchError, finalize, retry, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

interface CardItem {
  id: number;
  name: string;
  imageURLs: {
    $id?: string;
    $values: string[];
  };
  averageRating: number;
  ratingsCount?: number;
  duration?: string;
  type: 'activity' | 'place';
  categoryName?: string;
}

interface CarouselSection {
  id: string;
  title: string;
  description: string;
  items: CardItem[];
  carouselReady: boolean;
  apiEndpoint: string;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  itemType: 'activity' | 'place';
}

@Component({
  selector: 'app-things-to-do',
  templateUrl: './things-to-do.component.html',
  styleUrls: ['./things-to-do.component.scss']
})
export class ThingsToDoComponent implements OnInit, AfterViewInit {
  @ViewChildren('owlCarousel') owlCarousels!: QueryList<CarouselComponent>;

  leftArrowSrc: string = 'assets/icons/arrow-left-circle.svg';
  rightArrowSrc: string = 'assets/icons/arrow-right-circle.svg';
  searchIcon: string = 'assets/icons/Search.png';
  decoreImagePath: string = 'assets/img/Decore.png';
  decoreBlueImagePath: string = 'assets/img/Decore2.png';
  wishlistItems: Set<number> = new Set();
    starRating: number = 0;
  
  DeployUrl = 'https://kemet-server.runasp.net';

  carouselSections: CarouselSection[] = [];
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    margin: 10,
    autoWidth: false,
    items: 5,
    responsive: {
      0: { items: 1 },
      400: { items: 2 },
      740: { items: 3 },
      940: { items: 4 },
      1200: { items: 5 }
    },
    nav: false
  };

  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    console.log('ThingsToDoComponent initialized');
    console.log('Using API base URL:', this.DeployUrl);
    this.initializeCarouselSections();
    this.loadWishlistItems();
    this.fetchCarouselData();
  }
  
  initializeCarouselSections(): void {
    this.carouselSections = [
      {
        id: 'topAttractions',
        title: 'Top Attractions Near You',
        description: 'Discover the most popular attractions in your vicinity',
        items: [],
        carouselReady: false,
        isLoading: true,
        hasError: false,
        apiEndpoint: `${this.DeployUrl}/api/Places/TopAttractionsNearMe`,
        itemType: 'place'
      },
      {
        id: 'nearbyActivities',
        title: 'Activities Near You',
        description: 'Explore exciting activities happening around you',
        items: [],
        carouselReady: false,
        isLoading: true,
        hasError: false,
        apiEndpoint: `${this.DeployUrl}/api/Activities/NearbyActivities`,
        itemType: 'activity'
      },
      {
        id: 'hiddenGemsPlaces',
        title: 'Hidden Gems - Places',
        description: 'Uncover lesser-known but fascinating places',
        items: [],
        carouselReady: false,
        isLoading: true,
        hasError: false,
        apiEndpoint: `${this.DeployUrl}/api/Places/PlacesHiddenGems`,
        itemType: 'place'
      },
      {
        id: 'hiddenGemsActivities',
        title: 'Hidden Gems - Activities',
        description: 'Discover unique and authentic local experiences',
        items: [],
        carouselReady: false,
        isLoading: true,
        hasError: false,
        apiEndpoint: `${this.DeployUrl}/api/Activities/ActivitiesHiddenGems`,
        itemType: 'activity'
      },
      {
        id: 'placesInCairo',
        title: 'Places in Cairo',
        description: 'Explore the wonders of Cairo',
        items: [],
        carouselReady: false,
        isLoading: true,
        hasError: false,
        apiEndpoint: `${this.DeployUrl}/api/Places/PlacesInCairo`,
        itemType: 'place'
      },
      {
        id: 'activitiesInCairo',
        title: 'Activities in Cairo',
        description: 'Experience the best activities Cairo has to offer',
        items: [],
        carouselReady: false,
        isLoading: true,
        hasError: false,
        apiEndpoint: `${this.DeployUrl}/api/Activities/ActivitiesInCairo`,
        itemType: 'activity'
      }
    ];
    
    // Log all API endpoints for debugging
    this.carouselSections.forEach(section => {
      console.log(`Section ${section.id} will use endpoint: ${section.apiEndpoint}`);
    });
  }
  
  ngAfterViewInit(): void {
    this.owlCarousels.changes.subscribe(() => {
      console.log('Carousels updated:', this.owlCarousels.length);
      this.refreshAllCarousels();
    });
  }

  fetchCarouselData(): void {
    this.carouselSections.forEach((section, index) => {
      section.isLoading = true;
      section.hasError = false;
      section.errorMessage = undefined;
      
      console.log(`Fetching data for section ${section.id} from ${section.apiEndpoint}`);
      
      this.homeService.getActivities(section.apiEndpoint)
        .pipe(
          retry(2),
          tap(response => {
            console.log(`Raw API response for ${section.id}:`, response);
          }),
          catchError((error: HttpErrorResponse) => {
            console.error(`Error fetching data for section ${section.id}:`, error);
            section.hasError = true;
            section.errorMessage = error.status === 0 
              ? 'Network error. Please check your connection.'
              : `Error ${error.status}: ${error.message}`;
            return of(null);
          }),
          finalize(() => {
            section.isLoading = false;
          })
        )
        .subscribe({
          next: (response: any) => {
            if (!response) return;

            try {
              if (response && response.$values && Array.isArray(response.$values)) {
                // Map initial data
                section.items = response.$values.map((item: any) => ({
                  id: section.itemType === 'place' ? item.placeID : item.activityId,
                  name: item.name || 'Unnamed Item',
                  imageURLs: {
                    $values: item.imageURLs?.$values || ['assets/img/default-activity.jpg']
                  },
                  averageRating: item.averageRating !== undefined ? item.averageRating : null,  
                  ratingsCount: item.ratingsCount || 0,
                  duration: item.duration,
                  type: section.itemType,
                  categoryName: item.categoryName || ''
                }));

                // If this is a places section, fetch categories for each place
                if (section.itemType === 'place') {
                  section.items.forEach((item, itemIndex) => {
                    this.homeService.fetchPlaceCategory(item.id)
                      .pipe(
                        catchError(error => {
                          console.error(`Error fetching category for place ${item.id}:`, error);
                          return of(null);
                        })
                      )
                      .subscribe(categoryData => {
                        if (categoryData?.categoryName) {
                          section.items[itemIndex].categoryName = categoryData.categoryName;
                        }
                      });
                  });
                }
                
                section.carouselReady = true;
                this.refreshCarousel(index);
              } else {
                throw new Error('Invalid response format');
              }
            } catch (error) {
              console.error(`Error processing data for ${section.id}:`, error);
              section.hasError = true;
              section.errorMessage = 'Error processing data from server';
              section.carouselReady = false;
            }
          }
        });
    });
  }

  // Helper method to safely process imageURLs
  processImageURLs(imageURLs: any): { $values: string[] } {
    const defaultImage = { $values: ['assets/img/default-activity.jpg'] };
    
    if (!imageURLs) return defaultImage;
    
    if (Array.isArray(imageURLs)) {
      return { $values: imageURLs.length > 0 ? imageURLs : defaultImage.$values };
    }
    
    if (imageURLs.$values && Array.isArray(imageURLs.$values)) {
      return { $values: imageURLs.$values.length > 0 ? imageURLs.$values : defaultImage.$values };
    }
    
    return defaultImage;
  }

  refreshAllCarousels(): void {
    if (!this.owlCarousels) return;
    
    this.owlCarousels.forEach((carousel, index) => {
      setTimeout(() => {
        try {
          (carousel as any).reInit();
        } catch (e) {
          console.error(`Error reinitializing carousel ${index}:`, e);
        }
      }, 100);
    });
  }
  
  refreshCarousel(index: number): void {
    setTimeout(() => {
      if (this.owlCarousels && this.owlCarousels.length > index) {
        try {
          (this.owlCarousels.toArray()[index] as any).reInit();
        } catch (e) {
          console.error(`Error reinitializing carousel ${index}:`, e);
        }
      }
    }, 200);
  }

  loadWishlistItems(): void {
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in, skipping wishlist load');
      return;
    }

    console.log('Loading wishlist items');
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist: any[]) => {
        this.wishlistItems = new Set(
          wishlist.map(item =>
            item.type === 'place' ? item.placeID : item.activityID
          )
        );
        console.log(`Loaded ${this.wishlistItems.size} wishlist items`);
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
      }
    });
  }

  isInWishlist(id: number, type: 'activity' | 'place'): boolean {
    return this.wishlistItems.has(id);
  }

  toggleWishlist(id: number, type: 'activity' | 'place', event: Event): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in, cannot toggle wishlist');
      // Optionally show login prompt
      return;
    }

    const isInWishlist = this.isInWishlist(id, type);
    console.log(`Toggling wishlist for ${type} ${id}. Currently in wishlist: ${isInWishlist}`);

    if (isInWishlist) {
      this.wishlistService.removeFromWishlist(id, type).subscribe({
        next: () => {
          this.wishlistItems.delete(id);
          console.log(`Removed ${type} from wishlist:`, id);
        },
        error: (error) => {
          console.error(`Error removing ${type} from wishlist:`, error);
        }
      });
    } else {
      if (type === 'activity') {
        this.wishlistService.addActivityToWishlist(id).subscribe({
          next: () => {
            this.wishlistItems.add(id);
            console.log('Added activity to wishlist:', id);
          },
          error: (error) => {
            console.error('Error adding activity to wishlist:', error);
          }
        });
      } else {
        this.wishlistService.addPlaceToWishlist(id).subscribe({
          next: () => {
            this.wishlistItems.add(id);
            console.log('Added place to wishlist:', id);
          },
          error: (error) => {
            console.error('Error adding place to wishlist:', error);
          }
        });
      }
    }
  }

  onPrev(sectionIndex: number): void {
    if (this.owlCarousels && this.owlCarousels.length > sectionIndex) {
      try {
        this.owlCarousels.toArray()[sectionIndex].prev();
      } catch (e) {
        console.error(`Error navigating previous on carousel ${sectionIndex}:`, e);
      }
    }
  }

  onNext(sectionIndex: number): void {
    if (this.owlCarousels && this.owlCarousels.length > sectionIndex) {
      try {
        this.owlCarousels.toArray()[sectionIndex].next();
      } catch (e) {
        console.error(`Error navigating next on carousel ${sectionIndex}:`, e);
      }
    }
  }

  getStarRating(averageRating: number): number {
    // Round to nearest half (0.5) then floor to get whole number of filled stars
    return Math.floor(Math.round(averageRating * 2) / 2);
  }


  // Retry loading a specific section with better error handling
  retryLoading(sectionIndex: number): void {
    const section = this.carouselSections[sectionIndex];
    if (!section) return;
    
    console.log(`Manually retrying to load section ${section.id}`);
    section.isLoading = true;
    section.hasError = false;
    section.errorMessage = undefined;
    
    this.homeService.getActivities(section.apiEndpoint)
      .pipe(
        tap(response => {
          console.log(`Retry: Raw API response for ${section.id}:`, response);
        }),
        catchError(error => {
          console.error(`Retry failed for section ${section.id}:`, error);
          section.hasError = true;
          section.errorMessage = 'Retry failed. Please try again later.';
          return of(null);
        }),
        finalize(() => {
          section.isLoading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (!response) return; // Skip processing if null (error case)

          try {
            // Extract and normalize the data array from the response
            let itemsArray: any[] = [];
            
            // Handle different response structures
            if (response && typeof response === 'object') {
              if (response.$values && Array.isArray(response.$values)) {
                itemsArray = response.$values;
              } else if (response.$id && response.$values && Array.isArray(response.$values)) {
                itemsArray = response.$values;
              } else if (Array.isArray(response)) {
                itemsArray = response;
              }
            }
            
            // Process items based on section type
            section.items = itemsArray.map((item: any) => {
              if (section.itemType === 'place') {
                return {
                  id: item.placeID || 0,
                  name: item.name || 'Unnamed Place',
                  imageURLs: this.processImageURLs(item.imageURLs),
                  averageRating: item.averageRating || 0,
                  type: 'place'
                };
              } else {
                return {
                  id: item.activityId || 0,
                  name: item.name || 'Unnamed Activity',
                  duration: item.duration || 'Duration not specified',
                  imageURLs: this.processImageURLs(item.imageURLs),
                  averageRating: item.averageRating || 0,
                  type: 'activity'
                };
              }
            });

            section.carouselReady = true;
            this.refreshCarousel(sectionIndex);
            console.log(`Retry for section ${section.id} successful with ${section.items.length} items`);
          } catch (error) {
            console.error(`Error processing retry data for ${section.id}:`, error);
            section.hasError = true;
            section.errorMessage = 'Error processing data';
            section.carouselReady = false;
          }
        }
      });
  }

  getRouterLink(item: CardItem): any[] {
    return item.type === 'activity' 
      ? ['/activities', item.id] 
      : ['/places', item.id];
  }
}