import { Component, OnInit, ViewChildren, QueryList, AfterViewInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CarouselComponent, OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService } from '../../services/auth.service';
import { HomeService } from 'src/app/services/home.service';
import { WishlistService } from '../../services/wishlist.service';
import { catchError, finalize, retry, tap } from 'rxjs/operators';
import { of, Subscription, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Loader } from '@googlemaps/js-api-loader';
import { UpdateLocationService } from 'src/app/services/update-location.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  dynamicOptions?: OwlOptions;
}

@Component({
  selector: 'app-things-to-do',
  templateUrl: './things-to-do.component.html',
  styleUrls: ['./things-to-do.component.scss']
})
export class ThingsToDoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('owlCarousel') owlCarousels!: QueryList<CarouselComponent>;
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  // Performance tracking
  private isInitialized = false;
  private subscriptions = new Subscription();
  private pendingRefreshes = new Set<number>();
  private carouselOptionsCache = new Map<number, OwlOptions>();
  private refreshSubject = new Subject<number>();
  private resizeSubject = new Subject<void>();
  private _resizeObserver?: ResizeObserver;
  
  // Base carousel options
  private baseCarouselOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    autoplay: false,
    margin: 10,
    autoWidth: false,
    nav: false,
    responsive: {
      0: { items: 2, margin: 4 },
      480: { items: 2, margin: 8 },
      768: { items: 3, margin: 10 },
      992: { items: 4, margin: 10 },
      1200: { items: 5, margin: 10 }
    }
  };

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
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    autoplay: false,
    autoplayTimeout: 3000,
    margin: 10,
    autoWidth: false,
    nav: false,
    responsive: {
      0: { 
        items: 2,
        margin: 4
      },
      480: { 
        items: 2,
        margin: 8
      },
      768: { 
        items: 3,
        margin: 10
      },
      992: { 
        items: 4,
        margin: 10
      },
      1200: { 
        items: 5,
        margin: 10
      }
    }
  };

  map: any;
  marker: any;
  locationData: any;
  
  // Modal properties
  isLocationModalOpen: boolean = false;
  selectedLocationText: string = '';
  
  // Add property for resize timeout with proper typing for requestAnimationFrame
  private _resizeTimeout: ReturnType<typeof requestAnimationFrame> | undefined;
  
  // Optimize event listeners
  private resizeListener?: () => void;
  private visibilityListener?: () => void;
  private orientationListener?: () => void;
  
  // Track component visibility
  private isVisible = true;
  private intersectionObserver?: IntersectionObserver;
  private mutationObserver?: MutationObserver;
  private deferredOperations: (() => void)[] = [];

  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private wishlistService: WishlistService,
    private _UpdateLocationService: UpdateLocationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.setupPerformanceOptimizations();
    this.setupVisibilityTracking();
  }

  private setupPerformanceOptimizations(): void {
    // Debounced refresh to prevent multiple rapid refreshes
    this.subscriptions.add(
      this.refreshSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe((index: number) => {
        this.performCarouselRefresh(index);
      })
    );

    // Debounced resize handler
    this.subscriptions.add(
      this.resizeSubject.pipe(
        debounceTime(250)
      ).subscribe(() => {
        this.handleResize();
      })
    );
  }

  private setupVisibilityTracking(): void {
    // Use IntersectionObserver to track component visibility
    this.ngZone.runOutsideAngular(() => {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          this.isVisible = entries[0].isIntersecting;
          if (this.isVisible && this.deferredOperations.length > 0) {
            this.processDeferredOperations();
          }
        },
        { threshold: 0.1 }
      );

      // Watch for DOM changes that might affect carousels
      this.mutationObserver = new MutationObserver(() => {
        if (this.isVisible) {
          this.deferOperation(() => this.refreshAllCarousels());
        }
      });
    });
  }

  private deferOperation(operation: () => void): void {
    if (this.isVisible) {
      operation();
    } else {
      this.deferredOperations.push(operation);
    }
  }

  private processDeferredOperations(): void {
    const operations = [...this.deferredOperations];
    this.deferredOperations = [];
    operations.forEach(op => op());
  }

  ngOnInit(): void {
    // Initialize location modal after view is ready
    this.cdr.detectChanges();
    this.openLocationModal();
    
    // Handle geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.ngZone.run(() => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.locationData = {
            latitude: lat,
            longitude: lng,
            address: `https://maps.google.com/?q=${lat},${lng}`,
            locationLink: `https://maps.google.com/?q=${lat},${lng}`
          };

          this._UpdateLocationService.updateLocation(this.locationData).subscribe();
          this.updateSelectedLocationText();
          this.loadMap(lat, lng);
        });
      });
    }
    
    this.initializeCarouselSections();
    
    // Load data based on auth state
    if (this.authService.isLoggedIn()) {
      this.loadWishlistItems().then(() => {
        this.fetchCarouselData();
      }).catch(() => {
        this.fetchCarouselData();
      });
    } else {
      this.fetchCarouselData();
    }
  }

  ngAfterViewInit(): void {
    this.isInitialized = true;
    
    // Start observing component visibility
    if (this.intersectionObserver) {
      const carouselElement = document.querySelector('.owl-carousel');
      if (carouselElement) {
        this.intersectionObserver.observe(carouselElement);
      }
    }

    // Watch for carousel DOM changes
    if (this.mutationObserver) {
      const carouselElement = document.querySelector('.owl-carousel');
      if (carouselElement) {
        this.mutationObserver.observe(carouselElement, {
          childList: true,
          subtree: true,
          attributes: true
        });
      }
    }

    // Use debounced carousel changes with visibility check
    this.subscriptions.add(
      this.owlCarousels.changes.pipe(
        debounceTime(300)
      ).subscribe(() => {
        this.deferOperation(() => {
          this.ngZone.runOutsideAngular(() => {
            this.refreshAllCarousels();
            // Setup passive event handlers for new carousels
            this.setupCarouselEventHandlers();
          });
        });
      })
    );
    
    this.addOptimizedEventListeners();
    
    // Initial setup of carousel event handlers
    this.setupCarouselEventHandlers();
  }
  
  private addOptimizedEventListeners(): void {
    // Use passive listeners and debouncing
    const options = { passive: true };
    
    this.ngZone.runOutsideAngular(() => {
      // Optimized scroll handling
      const scrollHandler = () => {
        if (this.isVisible) {
          requestAnimationFrame(() => {
            this.resizeSubject.next();
          });
        }
      };
      window.addEventListener('scroll', scrollHandler, options);
      
      // Optimized resize handling
      const resizeHandler = () => {
        requestAnimationFrame(() => {
          this.resizeSubject.next();
        });
      };
      window.addEventListener('resize', resizeHandler, options);
      
      // Optimized visibility handling
      const visibilityHandler = () => {
        if (!document.hidden && this.isInitialized) {
          requestAnimationFrame(() => {
            this.resizeSubject.next();
          });
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler, options);
      
      // Optimized touch handling
      const touchHandler = () => {
        if (this.isVisible) {
          requestAnimationFrame(() => {
            this.resizeSubject.next();
          });
        }
      };
      window.addEventListener('touchstart', touchHandler, options);
      window.addEventListener('touchmove', touchHandler, options);
      window.addEventListener('touchend', touchHandler, options);
      
      // Optimized orientation handling
      if ('orientation' in screen) {
        screen.orientation.addEventListener('change', () => {
          requestAnimationFrame(() => {
            this.resizeSubject.next();
          });
        });
      } else {
        window.addEventListener('orientationchange', () => {
          requestAnimationFrame(() => {
            this.resizeSubject.next();
          });
        }, options);
      }

      // Store cleanup functions
      this.subscriptions.add(new Subscription(() => {
        window.removeEventListener('scroll', scrollHandler);
        window.removeEventListener('resize', resizeHandler);
        document.removeEventListener('visibilitychange', visibilityHandler);
        window.removeEventListener('touchstart', touchHandler);
        window.removeEventListener('touchmove', touchHandler);
        window.removeEventListener('touchend', touchHandler);
        if (!('orientation' in screen)) {
          window.removeEventListener('orientationchange', resizeHandler);
        }
      }));
    });
  }

  // Add passive scroll handling to carousel
  private setupCarouselEventHandlers(): void {
    if (!this.owlCarousels) return;

    this.ngZone.runOutsideAngular(() => {
      this.owlCarousels.forEach(carousel => {
        const element = carousel['el']?.nativeElement;
        if (element) {
          const options = { passive: true };
          
          // Add passive scroll and touch handlers
          element.addEventListener('mousewheel', () => {}, options);
          element.addEventListener('touchmove', () => {}, options);
          element.addEventListener('wheel', () => {}, options);
          element.addEventListener('touchstart', () => {}, options);
          element.addEventListener('touchend', () => {}, options);
          
          // Store cleanup functions
          this.subscriptions.add(new Subscription(() => {
            element.removeEventListener('mousewheel', () => {});
            element.removeEventListener('touchmove', () => {});
            element.removeEventListener('wheel', () => {});
            element.removeEventListener('touchstart', () => {});
            element.removeEventListener('touchend', () => {});
          }));
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.pendingRefreshes.clear();
    this.deferredOperations = [];

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    if (this.visibilityListener) {
      document.removeEventListener('visibilitychange', this.visibilityListener);
    }
    
    // Clean up ResizeObserver if it exists
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  // Optimize carousel refresh
  private refreshAllCarousels(): void {
    if (!this.owlCarousels) return;
    
    this.ngZone.runOutsideAngular(() => {
      this.owlCarousels.forEach((carousel, index) => {
        if (!carousel) return;
        this.refreshCarousel(index);
      });
    });
  }

  // Optimize single carousel refresh
  private refreshCarousel(index: number): void {
    const section = this.carouselSections[index];
    if (!section?.items?.length || !this.owlCarousels) return;

    const carousel = this.owlCarousels.get(index);
    if (!carousel) return;

    try {
      Object.assign(carousel, { options: this.getCarouselOptions(section.items.length) });
    } catch (error) {
      console.warn(`Failed to refresh carousel ${index}:`, error);
    }
  }

  // Optimized map loading with error handling
  loadMap(lat: number, lng: number): void {
    const loader = new Loader({
      apiKey: 'AIzaSyDBe3IxUNFQiad1XECr9U-zK7z1j4hCsmw',
      libraries: ['places'],
      version: 'weekly'
    });

    loader.load().then(() => {
      const mapOptions: google.maps.MapOptions = {
        center: { lat, lng },
        zoom: 15,
        gestureHandling: 'cooperative',
        fullscreenControl: true,
        mapTypeControl: false,
        streetViewControl: true,
        zoomControl: false,
        clickableIcons: false
      };

      this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
      this.marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        draggable: true
      });

      // Create the search box input element
      const searchBoxDiv = document.createElement('div');
      searchBoxDiv.style.cssText = 'margin-top: 10px;';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Search for a location';
      input.style.cssText = 'width: 300px; padding: 10px 15px; border: 1px solid #ccc; border-radius: 30px;';
      
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

      this.marker.addListener('dragend', () => {
        const newPos = this.marker.getPosition();
        if (newPos) {
          const newLat = newPos.lat();
          const newLng = newPos.lng();
          
          this.locationData = {
            latitude: newLat,
            longitude: newLng,
            address: `https://maps.google.com/?q=${newLat},${newLng}`,
            locationLink: `https://maps.google.com/?q=${newLat},${newLng}`
          };

          this._UpdateLocationService.updateLocation(this.locationData).subscribe();
        }
      });
    }).catch(error => {
      console.error('Error loading Google Maps:', error);
      this.mapContainer.nativeElement.innerHTML = `
        <div class="map-error">
          <p>Map is currently unavailable. Please try again later.</p>
        </div>
      `;
    });
  }

  // Optimize location modal
  openLocationModal(): void {
    this.isLocationModalOpen = true;
    this.cdr.detectChanges();
    
    if (this.locationData) {
      this.loadMap(this.locationData.latitude, this.locationData.longitude);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.loadMap(lat, lng);
      });
    }
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

  // Optimize carousel options generation
  getCarouselOptions(itemCount: number): OwlOptions {
    const cacheKey = itemCount;
    if (this.carouselOptionsCache.has(cacheKey)) {
      return this.carouselOptionsCache.get(cacheKey)!;
    }

    const options: OwlOptions = {
      ...this.baseCarouselOptions,
      loop: itemCount > 5,
      autoplay: false,
      lazyLoad: true,
      autoplayHoverPause: false,
      rewind: false,
      nav: false,
      responsive: {
        0: { items: Math.min(2, itemCount) },
        480: { items: Math.min(2, itemCount) },
        768: { items: Math.min(3, itemCount) },
        992: { items: Math.min(4, itemCount) },
        1200: { items: Math.min(5, itemCount) }
      }
    };

    this.carouselOptionsCache.set(cacheKey, options);
    return options;
  }

  private updateCarouselOptionsForSection(sectionIndex: number, itemCount: number): void {
    const section = this.carouselSections[sectionIndex];
    if (!section) return;

    section.dynamicOptions = this.getCarouselOptions(itemCount);
  }

  fetchCarouselData(): void {
    this.carouselSections.forEach((section, index) => {
      section.isLoading = true;
      section.hasError = false;
      section.errorMessage = '';

      this.homeService.getActivities(section.apiEndpoint)
        .pipe(
          retry(3),
          catchError((error: HttpErrorResponse) => {
            section.hasError = true;
            section.errorMessage = error.message || 'An error occurred while fetching data';
            return of({ $values: [] });
          }),
          finalize(() => {
            section.isLoading = false;
          })
        )
        .subscribe((response: any) => {
          try {
            const data = response.$values || response;
            if (Array.isArray(data)) {
              section.items = data.map(item => ({
                id: section.itemType === 'place' ? item.placeID : (item.activityId || item.activityID),
                name: item.name || 'Unnamed Item',
                imageURLs: this.processImageURLs(item.imageURLs),
                averageRating: item.averageRating || 0,
                duration: item.duration,
                type: section.itemType,
                categoryName: item.categoryName || ''
              }));
              
              // Update carousel options based on item count
              this.updateCarouselOptionsForSection(index, section.items.length);
              section.carouselReady = true;
              
              setTimeout(() => {
                this.refreshCarousel(index);
              }, 200);
            } else {
              throw new Error('Invalid response format');
            }
          } catch (error) {
            section.hasError = true;
            section.errorMessage = 'Error processing data';
            section.carouselReady = false;
          }
        });
    });
  }

  processImageURLs(imageURLs: any): { $values: string[] } {
    // Ensure we always return a valid object with $values array
    if (!imageURLs) {
      return { $values: [] };
    }

    // If imageURLs is already in the correct format, return it
    if (imageURLs.$values) {
      return imageURLs;
    }

    // If imageURLs is an array, wrap it in the correct format
    if (Array.isArray(imageURLs)) {
      return { $values: imageURLs };
    }

    // Default case: return empty array
    return { $values: [] };
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

  // Navigation methods
  onPrev(sectionIndex: number): void {
    const carouselArray = this.owlCarousels.toArray();
    if (carouselArray[sectionIndex]) {
      carouselArray[sectionIndex].prev();
    }
  }

  onNext(sectionIndex: number): void {
    const carouselArray = this.owlCarousels.toArray();
    if (carouselArray[sectionIndex]) {
      carouselArray[sectionIndex].next();
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

  // Add this method to dynamically update carousel options based on available items
  private updateCarouselOptions(sectionIndex: number): void {
    const section = this.carouselSections[sectionIndex];
    if (!section || !section.items) return;

    const itemCount = section.items.length;
    if (itemCount === 0) return;

    const newOptions = this.getCarouselOptions(itemCount);

    const carousel = this.owlCarousels?.get(sectionIndex);
    if (carousel) {
      Object.assign(carousel, { options: newOptions });
      setTimeout(() => {
        this.refreshCarousel(sectionIndex);
      }, 200);
    }
  }

  private handleResize(): void {
    if (!this.isInitialized) return;
    
    this.ngZone.runOutsideAngular(() => {
      // Batch refresh operations
      const refreshPromises = this.carouselSections.map((_, index) => {
        return new Promise<void>(resolve => {
          if (!this.pendingRefreshes.has(index)) {
            this.pendingRefreshes.add(index);
            this.refreshSubject.next(index);
          }
          resolve();
        });
      });

      Promise.all(refreshPromises).then(() => {
        this.ngZone.run(() => {
          this.cdr.detectChanges();
        });
      });
    });
  }

  private performCarouselRefresh(index: number): void {
    if (!this.isVisible) {
      this.deferOperation(() => this.performCarouselRefresh(index));
      return;
    }

    this.pendingRefreshes.delete(index);
    
    this.ngZone.runOutsideAngular(() => {
      const carousel = this.owlCarousels?.get(index);
      if (carousel && this.carouselSections[index]?.carouselReady) {
        try {
          // Use RAF for smoother visual updates
          requestAnimationFrame(() => {
            this.ngZone.run(() => {
              if (carousel.hasOwnProperty('refresh')) {
                (carousel as any).refresh();
              } else {
                window.dispatchEvent(new Event('resize'));
              }
            });
          });
        } catch (error) {
          console.warn(`Carousel refresh failed for index ${index}:`, error);
        }
      }
    });
  }
}