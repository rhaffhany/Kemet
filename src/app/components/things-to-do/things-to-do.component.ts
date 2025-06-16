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

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  locationLink: string;
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
  customOptions: OwlOptions = this.baseCarouselOptions;

  map: google.maps.Map | null = null;
  marker: google.maps.Marker | null = null;
  locationData: LocationData | null = null;
  
  // Modal properties
  isLocationModalOpen: boolean = false;
  selectedLocationText: string = '';
  
  // Add property for resize timeout with proper typing for requestAnimationFrame
  private _resizeTimeout?: ReturnType<typeof requestAnimationFrame>;
  
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
    
    // Initialize carousels and load data
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
      // Optimized scroll handling with passive listener
      const scrollHandler = () => {
        if (this.isVisible) {
          requestAnimationFrame(() => {
            this.resizeSubject.next();
          });
        }
      };
      window.addEventListener('scroll', scrollHandler, options);
      
      // Optimized resize handling with passive listener
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
      
      // Optimized touch handling with passive listeners
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
          
          // Add passive event handlers
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

  private refreshAllCarousels(): void {
    if (!this.owlCarousels) return;
    
    this.ngZone.runOutsideAngular(() => {
      this.owlCarousels.forEach((carousel, index) => {
        if (!carousel) return;
        this.refreshCarousel(index);
      });
    });
  }

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

  private loadMap(lat: number, lng: number): void {
    this.ngZone.runOutsideAngular(() => {
      const loader = new Loader({
        apiKey: 'AIzaSyClrom8fWRRL317MDuWMRdg-cJKg2dr78E',
        libraries: ['places'],
        version: 'weekly'
      });

      loader.load().then(() => {
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
          console.error('Google Maps JavaScript API is not loaded');
          return;
        }

        try {
          const mapOptions: google.maps.MapOptions = {
            center: { lat, lng },
            zoom: 15,
            gestureHandling: 'cooperative',
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControl: true,
            clickableIcons: false,
            maxZoom: 18,
            minZoom: 8
          };

          this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

          this.marker = new google.maps.Marker({
            position: { lat, lng },
            map: this.map,
            draggable: true,
            optimized: true,
            animation: null
          });

          let dragTimeout: number | null = null;
          
          this.marker.addListener('dragend', () => {
            if (dragTimeout) {
              window.clearTimeout(dragTimeout);
            }
            
            dragTimeout = window.setTimeout(() => {
              const newPos = this.marker?.getPosition();
              if (newPos) {
                const newLat = newPos.lat();
                const newLng = newPos.lng();

                this.ngZone.run(() => {
                  this.locationData = {
                    latitude: newLat,
                    longitude: newLng,
                    address: `https://maps.google.com/?q=${newLat},${newLng}`,
                    locationLink: `https://maps.google.com/?q=${newLat},${newLng}`
                  };

                  this._UpdateLocationService.updateLocation(this.locationData)
                    .pipe(
                      catchError(error => {
                        console.error('Error updating location:', error);
                        return of(null);
                      })
                    )
                    .subscribe();
                });
              }
            }, 300);
          });

        } catch (error) {
          console.error('Error initializing map:', error);
          this.handleMapError(error);
        }
      }).catch(error => {
        console.error('Error loading Google Maps:', error);
        this.handleMapError(error);
      });
    });
  }

  private handleMapError(error: any): void {
    this.ngZone.run(() => {
      if (error.message?.includes('billing')) {
        console.error('Google Maps billing error. Please enable billing in the Google Cloud Console.');
      }
      this.disableMapFunctionality();
    });
  }

  private disableMapFunctionality(): void {
    if (this.map) {
      (this.map as any).setMap(null);
      this.map = null;
    }
    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }

    if (this.mapContainer?.nativeElement) {
      this.mapContainer.nativeElement.innerHTML = `
        <div class="map-error">
          <p>Map is currently unavailable. Please try again later.</p>
        </div>
      `;
    }
  }

  // Optimize location modal
  openLocationModal(): void {
    this.isLocationModalOpen = true;
    this.cdr.detectChanges();
    
    // Request location only when user opens the modal
    if (this.locationData) {
      this.loadMap(this.locationData.latitude, this.locationData.longitude);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.loadMap(lat, lng);
        
        this.locationData = {
          latitude: lat,
          longitude: lng,
          address: `https://maps.google.com/?q=${lat},${lng}`,
          locationLink: `https://maps.google.com/?q=${lat},${lng}`
        };

        this._UpdateLocationService.updateLocation(this.locationData).subscribe();
        this.updateSelectedLocationText();
      }, (error) => {
        // Handle geolocation error
        console.warn('Geolocation error:', error);
        // Use default coordinates (e.g., Cairo)
        const defaultLat = 30.0444;
        const defaultLng = 31.2357;
        this.loadMap(defaultLat, defaultLng);
      }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    }
    
    setTimeout(() => {
      this.addSearchBox();
    }, 100);
  }

  private addSearchBox(): void {
    if (!this.map) return;

    const searchBoxDiv = document.createElement('div');
    searchBoxDiv.style.cssText = 'margin-top: 10px;';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search for a location';
    input.style.cssText = 'width: 300px; padding: 10px 15px ; border: 1px solid #ccc; border-radius: 30px;';
    
    searchBoxDiv.appendChild(input);
    
    (this.map as any).controls[google.maps.ControlPosition.TOP_CENTER].push(searchBoxDiv);

    const searchBox = new google.maps.places.SearchBox(input);
    
    this.map.addListener('bounds_changed', () => {
      const bounds = this.map?.getBounds();
      searchBox.setBounds(bounds || null);
    });

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (!place.geometry || !place.geometry.location) {
          return;
        }
        
        const location = place.geometry.location;
        if (this.map) {
          this.map.setCenter(location);
        }
        if (this.marker) {
          this.marker.setPosition(location);
        }

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

  private updateLocationData(lat: number, lng: number): void {
    this.locationData = {
      latitude: lat,
      longitude: lng,
      locationLink: `https://maps.google.com/?q=${lat},${lng}`,
      address: `https://maps.google.com/?q=${lat},${lng}`
    };
  }

  confirmLocationUpdate(): void {
    if (!this.locationData) return;

    this._UpdateLocationService.updateLocation(this.locationData).subscribe({
      next: () => {
        console.log("location now:", this.locationData?.address);
        this.updateSelectedLocationText();
        this.closeLocationModal();
        alert('Location updated successfully!');
      },
      error: () => alert('Failed to update location.')
    });
  }

  closeLocationModal(): void {
    this.isLocationModalOpen = false;
  }

  private updateSelectedLocationText(): void {
    if (this.locationData) {
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
        apiEndpoint: `${this.DeployUrl}/api/Activities/NearbyActivities`,
        isLoading: true,
        hasError: false,
        itemType: 'activity'
      },
      {
        id: 'topAttractions',
        title: 'Top Attractions Near You',
        description: 'Discover the most popular attractions in your vicinity',
        items: [],
        carouselReady: false,
        apiEndpoint: `${this.DeployUrl}/api/Places/TopAttractionsNearMe`,
        isLoading: true,
        hasError: false,
        itemType: 'place'
      },
      {
        id: 'hiddenGemsPlaces',
        title: 'Hidden Gems - Places',
        description: 'Uncover lesser-known but fascinating places',
        items: [],
        carouselReady: false,
        apiEndpoint: `${this.DeployUrl}/api/Places/PlacesHiddenGems`,
        isLoading: true,
        hasError: false,
        itemType: 'place'
      },
      {
        id: 'hiddenGemsActivities',
        title: 'Hidden Gems - Activities',
        description: 'Discover unique and authentic local experiences',
        items: [],
        carouselReady: false,
        apiEndpoint: `${this.DeployUrl}/api/Activities/ActivitiesHiddenGems`,
        isLoading: true,
        hasError: false,
        itemType: 'activity'
      },
      {
        id: 'placesInCairo',
        title: 'Places in Cairo',
        description: 'Explore the wonders of Cairo',
        items: [],
        carouselReady: false,
        apiEndpoint: `${this.DeployUrl}/api/Places/PlacesInCairo`,
        isLoading: true,
        hasError: false,
        itemType: 'place'
      },
      {
        id: 'activitiesInCairo',
        title: 'Activities in Cairo',
        description: 'Experience the best activities Cairo has to offer',
        items: [],
        carouselReady: false,
        apiEndpoint: `${this.DeployUrl}/api/Activities/ActivitiesInCairo`,
        isLoading: true,
        hasError: false,
        itemType: 'activity'
      }
    ];
  }

  // Optimize carousel options generation
  private getCarouselOptions(itemCount: number): OwlOptions {
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

  private fetchCarouselData(): void {
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
        .subscribe({
          next: (response: any) => {
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
          }
        });
    });
  }

  private processImageURLs(imageURLs: any): { $values: string[] } {
    if (!imageURLs) {
      return { $values: [] };
    }

    if (imageURLs.$values) {
      return imageURLs;
    }

    if (Array.isArray(imageURLs)) {
      return { $values: imageURLs };
    }

    return { $values: [] };
  }

  private loadWishlistItems(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.authService.isLoggedIn()) {
        resolve();
        return;
      }
    
      this.wishlistService.getWishlist().subscribe({
        next: (response: any) => {
          this.wishlistPlaces.clear();
          this.wishlistActivities.clear();
    
          let wishlistItems: WishlistItem[] = [];
          
          if (response && response.places && response.places.$values) {
            const placesArray = response.places.$values || [];
            const activitiesArray = response.activities && response.activities.$values ? response.activities.$values : [];
            
            placesArray.forEach((item: any) => {
              wishlistItems.push({ type: 'place', placeID: item.placeID });
            });
            
            activitiesArray.forEach((item: any) => {
              wishlistItems.push({ 
                type: 'activity', 
                activityID: item.activityID || item.activityId
              });
            });
          } else if (Array.isArray(response)) {
            wishlistItems = response;
          } else if (response && response.$values) {
            wishlistItems = response.$values;
          } else if (response && response.wishlistItems && response.wishlistItems.$values) {
            wishlistItems = response.wishlistItems.$values;
          }
          
          wishlistItems.forEach((item: any) => {
            const type = item.type || (item.placeID ? 'place' : 'activity');
            const placeId = item.placeID || item.placeId;
            const activityId = item.activityID || item.activityId;
            
            if (type === 'place' && placeId) {
              this.wishlistPlaces.add(Number(placeId));
            } else if (type === 'activity' && activityId) {
              this.wishlistActivities.add(Number(activityId));
            }
          });
    
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
    const numericId = Number(id);
    return type === 'place' ? 
      this.wishlistPlaces.has(numericId) : 
      this.wishlistActivities.has(numericId);
  }
  
  toggleWishlist(id: number, type: 'activity' | 'place', event: Event): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      return;
    }
  
    const numericId = Number(id);
    const isInWishlist = this.isInWishlist(numericId, type);
  
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
  
    if (isInWishlist) {
      this.wishlistService.removeFromWishlist(numericId, type).subscribe({
        next: () => {},
        error: (error) => {
          console.error(`Error removing ${type} from wishlist:`, error);
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
        next: () => {},
        error: (error) => {
          console.error(`Error adding ${type} to wishlist:`, error);
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
    if (!averageRating) return [0, 0, 0, 0, 0];
    
    const roundedRating = Math.round(averageRating * 2) / 2;
    const stars = [0, 0, 0, 0, 0];
    
    for (let i = 0; i < 5; i++) {
      if (roundedRating >= i + 1) {
        stars[i] = 2;
      } else if (roundedRating >= i + 0.5) {
        stars[i] = 1;
      }
    }
    
    return stars;
  }

  retryLoading(sectionIndex: number): void {
    const section = this.carouselSections[sectionIndex];
    if (!section) return;
    
    section.isLoading = true;
    section.hasError = false;
    section.errorMessage = undefined;
    
    this.homeService.getActivities(section.apiEndpoint)
      .pipe(
        tap(response => {}),
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
          if (!response) return;

          try {
            let itemsArray: any[] = [];
            
            if (response && typeof response === 'object') {
              if (response.$values && Array.isArray(response.$values)) {
                itemsArray = response.$values;
              } else if (response.$id && response.$values && Array.isArray(response.$values)) {
                itemsArray = response.$values;
              } else if (Array.isArray(response)) {
                itemsArray = response;
              }
            }
            
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
          } catch (error) {
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

  private handleResize(): void {
    if (!this.isInitialized) return;
    
    this.ngZone.runOutsideAngular(() => {
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