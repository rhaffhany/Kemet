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

interface WishlistItem {
  type: string;
  placeID?: number;
  activityID?: number;
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
  
  // Store wishlist items as two separate maps for places and activities
  wishlistPlaces: Set<number> = new Set();
  wishlistActivities: Set<number> = new Set();
  
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
    autoplay: true,
    autoplayTimeout: 3000,
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
    
    // Load wishlist first, then fetch carousels
    if (this.authService.isLoggedIn()) {
      this.loadWishlistItems().then(() => {
        this.fetchCarouselData();
      }).catch(error => {
        console.error('Error loading wishlist:', error);
        this.fetchCarouselData();
      });
    } else {
      this.fetchCarouselData();
    }
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
                section.items = response.$values.map((item: any) => {
                  // Normalize the ID field to ensure consistency
                  const itemId = section.itemType === 'place' 
                    ? item.placeID 
                    : (item.activityId || item.activityID); // Handle both casing variants
                  
                  return {
                    id: itemId,
                    name: item.name || 'Unnamed Item',
                    imageURLs: {
                      $values: item.imageURLs?.$values || ['assets/img/default-activity.jpg']
                    },
                    averageRating: item.averageRating !== undefined ? item.averageRating : null,  
                    ratingsCount: item.ratingsCount || 0,
                    duration: item.duration,
                    type: section.itemType,
                    categoryName: item.categoryName || ''
                  };
                });

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

  // Convert to Promise-based function to ensure wishlist loads before carousel data
  loadWishlistItems(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.authService.isLoggedIn()) {
        console.log('User not logged in, skipping wishlist load');
        resolve();
        return;
      }
    
      this.wishlistService.getWishlist().subscribe({
        next: (response: any) => {
          console.log('Raw Wishlist Response:', response);
          this.wishlistPlaces.clear();
          this.wishlistActivities.clear();
    
          // Process different response formats
          let wishlistItems: WishlistItem[] = [];
          
          // Handling various response structures we might receive
          if (response && response.places && response.places.$values) {
            // If there's a places object with $values array
            const placesArray = response.places.$values || [];
            const activitiesArray = response.activities && response.activities.$values ? response.activities.$values : [];
            
            placesArray.forEach((item: any) => {
              wishlistItems.push({ type: 'place', placeID: item.placeID });
            });
            
            activitiesArray.forEach((item: any) => {
              // Use a consistent property name for activity IDs
              wishlistItems.push({ 
                type: 'activity', 
                activityID: item.activityID || item.activityId
              });
            });
          } else if (Array.isArray(response)) {
            // If response is a direct array of wishlist items
            wishlistItems = response;
          } else if (response && response.$values) {
            // If response has a $values array (common ASP.NET format)
            wishlistItems = response.$values;
          } else if (response && response.wishlistItems && response.wishlistItems.$values) {
            // If response has a wishlistItems object with $values array
            wishlistItems = response.wishlistItems.$values;
          }
          
          console.log('Processed wishlist items:', wishlistItems);
          
          // Process each wishlist item and add to the appropriate Set
          wishlistItems.forEach((item: any) => {
            console.log('Processing wishlist item:', item);
            
            // Handle different property naming formats
            const type = item.type || (item.placeID ? 'place' : 'activity');
            const placeId = item.placeID || item.placeId;
            // Normalize both activityID and activityId casing
            const activityId = item.activityID || item.activityId;
            
            if (type === 'place' && placeId) {
              this.wishlistPlaces.add(Number(placeId));
              console.log('Added placeID to wishlist:', placeId);
            } else if (type === 'activity' && activityId) {
              this.wishlistActivities.add(Number(activityId));
              console.log('Added activityID to wishlist:', activityId);
            }
          });
    
          console.log('Final Wishlist Places:', Array.from(this.wishlistPlaces));
          console.log('Final Wishlist Activities:', Array.from(this.wishlistActivities));
          resolve();
        },
        error: (error) => {
          console.error('Error loading wishlist:', error);
          reject(error);
        }
      });
    });
  }

  isInWishlist(id: number, type: 'activity' | 'place'): boolean {
    // Ensure id is a number
    const numericId = Number(id);
    
    // Check the appropriate Set based on the item type
    if (type === 'place') {
      return this.wishlistPlaces.has(numericId);
    } else {
      return this.wishlistActivities.has(numericId);
    }
  }
  
  toggleWishlist(id: number, type: 'activity' | 'place', event: Event): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in, cannot toggle wishlist');
      // You could add a redirect to login page or show a modal here
      return;
    }
  
    // Ensure id is a number
    const numericId = Number(id);
    const isInWishlist = this.isInWishlist(numericId, type);
    console.log(`Toggling wishlist for ${type} ${numericId}. Currently in wishlist: ${isInWishlist}`);
  
    // Optimistically update UI first for better user experience
    if (isInWishlist) {
      if (type === 'place') {
        this.wishlistPlaces.delete(numericId);
      } else {
        this.wishlistActivities.delete(numericId);
      }
    } else {
      if (type === 'place') {
        this.wishlistPlaces.add(numericId);
      } else {
        this.wishlistActivities.add(numericId);
      }
    }
  
    // Then perform actual API call
    if (isInWishlist) {
      this.wishlistService.removeFromWishlist(numericId, type).subscribe({
        next: () => {
          console.log(`Removed ${type} from wishlist:`, numericId);
        },
        error: (error) => {
          console.error(`Error removing ${type} from wishlist:`, error);
          // Revert optimistic update on error
          if (type === 'place') {
            this.wishlistPlaces.add(numericId);
          } else {
            this.wishlistActivities.add(numericId);
          }
        }
      });
    } else {
      const addMethod = type === 'activity' 
        ? this.wishlistService.addActivityToWishlist.bind(this.wishlistService) 
        : this.wishlistService.addPlaceToWishlist.bind(this.wishlistService);
      
      addMethod(numericId).subscribe({
        next: () => {
          console.log(`Added ${type} to wishlist:`, numericId);
        },
        error: (error) => {
          console.error(`Error adding ${type} to wishlist:`, error);
          // Revert optimistic update on error
          if (type === 'place') {
            this.wishlistPlaces.delete(numericId);
          } else {
            this.wishlistActivities.delete(numericId);
          }
        }
      });
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
                // Normalize activity ID
                const activityId = item.activityId || item.activityID || 0;
                return {
                  id: activityId,
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