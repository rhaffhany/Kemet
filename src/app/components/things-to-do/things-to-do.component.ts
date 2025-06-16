import { Component, OnInit, ViewChildren, QueryList, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CarouselComponent } from 'ngx-owl-carousel-o';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService } from '../../services/auth.service';
import { HomeService } from 'src/app/services/home.service';
import { WishlistService } from '../../services/wishlist.service';
import { catchError, finalize, retry, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Loader } from '@googlemaps/js-api-loader';
import { UpdateLocationService } from 'src/app/services/update-location.service';

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
export class ThingsToDoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('owlCarousel') owlCarousels!: QueryList<CarouselComponent>;

  leftArrowSrc: string = 'assets/icons/arrow-left-circle.svg';
  rightArrowSrc: string = 'assets/icons/arrow-right-circle.svg';
  searchIcon: string = 'assets/icons/Search.png';
  decoreImagePath: string = 'assets/img/Decore.png';
  decoreBlueImagePath: string = 'assets/img/Decore2.png';
  
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
      0: { 
        items: 2, 
        margin: 4,
        stagePadding: 0,
        autoWidth: false
      },
      480: { 
        items: 2, 
        margin: 4,
        stagePadding: 0,
        autoWidth: false
      },
      768: { items: 3, margin: 10 },
      992: { items: 4, margin: 10 },
      1200: { items: 5, margin: 10 }
    },
    nav: false
  };

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  map: any;
  marker: any;
  locationData: any;
  
  // Modal properties
  isLocationModalOpen: boolean = false;
  selectedLocationText: string = '';
  
  private resizeListener?: () => void;
  private visibilityListener?: () => void;
  private orientationListener?: () => void;
  // showLocationPopup: boolean = false;
  
  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private wishlistService: WishlistService,
    private _UpdateLocationService:UpdateLocationService
  ) {}

  ngOnInit(): void {
    // Auto-open location modal when component loads
    setTimeout(() => {
      this.openLocationModal();
    }, 500);
    
    //For Updating Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.locationData = {
          latitude: lat,
          longitude: lng,
          address: `https://maps.google.com/?q=${lat},${lng}`,
          locationLink: `https://maps.google.com/?q=${lat},${lng}`
        };

        this._UpdateLocationService.updateLocation(this.locationData).subscribe();
        
        // Initialize the selected location text
        this.updateSelectedLocationText();

        this.loadMap(lat, lng);
      });
    }
    
    this.initializeCarouselSections();
    // Load wishlist first, then fetch carousels
    if (this.authService.isLoggedIn()) {
      this.loadWishlistItems().then(() => {
        this.fetchCarouselData();
      }).catch(error => {
        // console.error('Error loading wishlist:', error);
        this.fetchCarouselData();
      });
    } else {
      this.fetchCarouselData();
    }
  }

  ngAfterViewInit(): void {
    this.owlCarousels.changes.subscribe(() => {
      this.refreshAllCarousels();
    });
    
    // Add event listeners to handle mobile menu interactions
    this.addMobileMenuEventListeners();
    
    // Force refresh after view init to ensure mobile carousels appear
    setTimeout(() => {
      this.refreshAllCarousels();
    }, 1000);
  }
  
  private addMobileMenuEventListeners(): void {
    // Listen for window resize events (triggered when mobile menu opens/closes)
    this.resizeListener = () => {
      setTimeout(() => {
        this.refreshAllCarousels();
      }, 300);
    };
    window.addEventListener('resize', this.resizeListener);
    
    // Listen for visibility change events
    this.visibilityListener = () => {
      if (!document.hidden) {
        setTimeout(() => {
          this.refreshAllCarousels();
        }, 200);
      }
    };
    document.addEventListener('visibilitychange', this.visibilityListener);
    
    // Listen for orientation change on mobile devices
    this.orientationListener = () => {
      setTimeout(() => {
        this.refreshAllCarousels();
      }, 500);
    };
    window.addEventListener('orientationchange', this.orientationListener);
  }
  
  ngOnDestroy(): void {
    // Clean up event listeners
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    if (this.visibilityListener) {
      document.removeEventListener('visibilitychange', this.visibilityListener);
    }
    if (this.orientationListener) {
      window.removeEventListener('orientationchange', this.orientationListener);
    }
  }

  // Update Location
  loadMap(lat: number, lng: number): void {
    const loader = new Loader({
      apiKey: 'AIzaSyDBe3IxUNFQiad1XECr9U-zK7z1j4hCsmw',
      libraries: ['places']
    });

    loader.load().then(() => {
      const mapOptions = {
        center: { lat, lng },
        zoom: 15
      };

      this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

      this.marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        draggable: true
      });

      this.marker.addListener('dragend', () => {
        const newPos = this.marker.getPosition();
        const newLat = newPos.lat();
        const newLng = newPos.lng();

        this.locationData = {
          latitude: newLat,
          longitude: newLng,
          address: `https://maps.google.com/?q=${newLat},${newLng}`,
          locationLink: `https://maps.google.com/?q=${newLat},${newLng}`
        };

        this._UpdateLocationService.updateLocation(this.locationData).subscribe();
      });

      this.addSearchBox();
      
    });
  }

  addSearchBox(): void {
    // Create the search box input element
    const searchBoxDiv = document.createElement('div');
    searchBoxDiv.style.cssText = 'margin-top: 10px;';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search for a location';
    input.style.cssText = 'width: 300px; padding: 10px 15px ; border: 1px solid #ccc; border-radius: 30px;';
    
    searchBoxDiv.appendChild(input);
    
    // Add the search box to the map
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchBoxDiv);

    const searchBox = new google.maps.places.SearchBox(input);
    
    // Bias the SearchBox results towards current map's viewport
    this.map.addListener('bounds_changed', () => {
      searchBox.setBounds(this.map.getBounds()!);
    });

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (!place.geometry || !place.geometry.location) {
          return;
        }
        
        const location = place.geometry.location;
        this.map.setCenter(location);
        this.marker.setPosition(location);

        this.locationData = {
          latitude: location.lat(),
          longitude: location.lng(),
          address: `https://maps.google.com/?q=${location.lat()},${location.lng()}`,
          locationLink: `https://maps.google.com/?q=${location.lat()},${location.lng()}`
        };

        this._UpdateLocationService.updateLocation(this.locationData).subscribe();
      }
    });
  }

  openLocationModal(): void {
    this.isLocationModalOpen = true;
    // Initialize map when modal opens
    setTimeout(() => {
      if (this.locationData) {
        this.loadMap(this.locationData.latitude, this.locationData.longitude);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.loadMap(lat, lng);
        });
      }
    }, 100);
  }

  updateLocationData(lat: number, lng: number): void {
    this.locationData = {
      latitude: lat,
      longitude: lng,
      locationLink: `https://maps.google.com/?q=${lat},${lng}`,
      address: `https://maps.google.com/?q=${lat},${lng}`
    };
  }

  confirmLocationUpdate(): void {
    this._UpdateLocationService.updateLocation(this.locationData).subscribe({
      next: (res) =>{
        console.log("location now:" , this.locationData.address);
        // Update the selected location text and close modal
        this.updateSelectedLocationText();
        this.closeLocationModal();
        alert('Location updated successfully!')
      },
      error: () => alert('Failed to update location.')
    });
  }

  // Modal methods
  closeLocationModal(): void {
    this.isLocationModalOpen = false;
  }

  private updateSelectedLocationText(): void {
    if (this.locationData) {
      // You can customize this to show a more user-friendly location name
      // For now, showing coordinates
      this.selectedLocationText = `${this.locationData.latitude.toFixed(4)}, ${this.locationData.longitude.toFixed(4)}`;
    }
  }
  //


  // toggleLocationPopup(event?: Event) {
  //   if (event) event.stopPropagation();
  //   this.showLocationPopup = !this.showLocationPopup;
  // }

  // closeLocationPopup() {
  //   this.showLocationPopup = false;
  // }

  initializeCarouselSections(): void {
    this.carouselSections = [
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
    // this.carouselSections.forEach(section => {
    //   console.log(`Section ${section.id} will use endpoint: ${section.apiEndpoint}`);
    // });
  }

  fetchCarouselData(): void {
    this.carouselSections.forEach((section, index) => {
      section.isLoading = true;
      section.hasError = false;
      section.errorMessage = undefined;
      
      // console.log(`Fetching data for section ${section.id} from ${section.apiEndpoint}`);
      
      this.homeService.getActivities(section.apiEndpoint)
        .pipe(
          retry(2),
          tap(response => {
            // console.log(`Raw API response for ${section.id}:`, response);
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

  loadWishlistItems(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.authService.isLoggedIn()) {
        // console.log('User not logged in, skipping wishlist load');
        resolve();
        return;
      }
    
      this.wishlistService.getWishlist().subscribe({
        next: (response: any) => {
          // console.log('Raw Wishlist Response:', response);
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
          
          // console.log('Processed wishlist items:', wishlistItems);
          
          // Process each wishlist item and add to the appropriate Set
          wishlistItems.forEach((item: any) => {
            // console.log('Processing wishlist item:', item);
            
            // Handle different property naming formats
            const type = item.type || (item.placeID ? 'place' : 'activity');
            const placeId = item.placeID || item.placeId;
            // Normalize both activityID and activityId casing
            const activityId = item.activityID || item.activityId;
            
            if (type === 'place' && placeId) {
              this.wishlistPlaces.add(Number(placeId));
              // console.log('Added placeID to wishlist:', placeId);
            } else if (type === 'activity' && activityId) {
              this.wishlistActivities.add(Number(activityId));
              // console.log('Added activityID to wishlist:', activityId);
            }
          });
    
          // console.log('Final Wishlist Places:', Array.from(this.wishlistPlaces));
          // console.log('Final Wishlist Activities:', Array.from(this.wishlistActivities));
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
      // console.log('User not logged in, cannot toggle wishlist');
      // You could add a redirect to login page or show a modal here
      return;
    }
  
    // Ensure id is a number
    const numericId = Number(id);
    const isInWishlist = this.isInWishlist(numericId, type);
    // console.log(`Toggling wishlist for ${type} ${numericId}. Currently in wishlist: ${isInWishlist}`);
  
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
          // console.log(`Removed ${type} from wishlist:`, numericId);
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
          // console.log(`Added ${type} to wishlist:`, numericId);
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

  getStarRating(averageRating: number): number[] {
    if (!averageRating) return [0, 0, 0, 0, 0]; // Default to all empty stars if no rating
    
    // Round to nearest half star
    const roundedRating = Math.round(averageRating * 2) / 2;
    
    // Create array representing star values (0 = empty, 1 = half, 2 = full)
    const stars = [0, 0, 0, 0, 0];
    
    for (let i = 0; i < 5; i++) {
      if (roundedRating >= i + 1) {
        stars[i] = 2; // Full star
      } else if (roundedRating >= i + 0.5) {
        stars[i] = 1; // Half star
      }
    }
    
    return stars;
  }
  // Retry loading a specific section with better error handling
  retryLoading(sectionIndex: number): void {
    const section = this.carouselSections[sectionIndex];
    if (!section) return;
    
    // console.log(`Manually retrying to load section ${section.id}`);
    section.isLoading = true;
    section.hasError = false;
    section.errorMessage = undefined;
    
    this.homeService.getActivities(section.apiEndpoint)
      .pipe(
        tap(response => {
          // console.log(`Retry: Raw API response for ${section.id}:`, response);
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
            // console.log(`Retry for section ${section.id} successful with ${section.items.length} items`);
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