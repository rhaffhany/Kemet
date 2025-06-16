import { HomeService } from './../../services/home.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CarouselComponent } from 'ngx-owl-carousel-o';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-ancient-spotlight',
  templateUrl: './ancient-spotlight.component.html',
  styleUrls: ['./ancient-spotlight.component.scss']
})
export class AncientSpotlightComponent implements OnInit {
  @ViewChild('owlCarousel') owlCarousel: CarouselComponent | undefined;
  places: any[] = [];
  leftArrowSrc: string = '../../../assets/icons/arrow-left-circle.svg';
  rightArrowSrc: string = '../../../assets/icons/arrow-right-circle.svg';
  carouselReady: boolean = false;
  DeployUrl = 'https://kemet-server.runasp.net';
  wishlistItems: Set<number> = new Set();
  starRating: number = 0;

  constructor(
    private _HomeService: HomeService,
    private authService: AuthService,
    private http: HttpClient,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.loadPlaces();
    if (this.authService.isLoggedIn()) {
      this.loadWishlistItems();
    }
  }

  loadPlaces() {
    this._HomeService.fetchPlaces().subscribe(
      data => {
        if (data && Array.isArray(data.$values)) {
          this.places = data.$values;
          this.carouselReady = true;
          
          // Fetch category for each place
          this.places.forEach(place => {
            this._HomeService.fetchPlaceCategory(place.placeID).subscribe(
              categoryData => {
                if (categoryData && categoryData.categoryName) {
                  place.categoryName = categoryData.categoryName;
                }
              },
              error => {
                console.error(`Error fetching category for place ${place.placeID}:`, error);
              }
            );
          });
        } else {
          console.error('Expected $values array, but received:', data);
        }
      },
      error => {
        console.error('Error fetching places:', error);
      }
    );
  }

  loadWishlistItems() {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.wishlistService.getWishlist().subscribe(
      (response: any) => {
        this.wishlistItems.clear();

        // Handle different response formats
        let wishlistItems = [];
        if (response && response.places && response.places.$values) {
          wishlistItems = response.places.$values;
        } else if (Array.isArray(response)) {
          wishlistItems = response;
        } else if (response && response.$values) {
          wishlistItems = response.$values;
        }
        
        wishlistItems.forEach((item: any) => {
          if (item && item.placeID) {
            this.wishlistItems.add(item.placeID);
          }
        });
      },
      error => {
        console.error('Error loading wishlist:', error);
      }
    );
  }

  toggleWishlist(placeId: number, event: Event) {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      return;
    }

    const isInWishlist = this.wishlistItems.has(placeId);
    
    if (isInWishlist) {
      // Remove from wishlist using placeId and 'place' type
      this.wishlistService.removeFromWishlist(placeId, 'place').subscribe({
        next: () => {
          this.wishlistItems.delete(placeId);
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
        }
      });
    } else {
      // Add to wishlist
      this.wishlistService.addPlaceToWishlist(placeId).subscribe({
        next: () => {
          this.wishlistItems.add(placeId);
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
        }
      });
    }
  }

  isInWishlist(placeId: number): boolean {
    return this.wishlistItems.has(placeId);
  }

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    center: false,
    items: 5,
    autoWidth: true,
    nav: false,
    margin: 0,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    slideBy: 5,
    responsive: {
      0: {
        items: 2,
        slideBy: 2,
        margin: 0
      },
      480: {
        items: 2,
        slideBy: 2,
        margin: 0
      },
      768: {
        items: 3,
        slideBy: 2,
        margin: 0
      },
      992: {
        items: 4,
        slideBy: 3,
        margin: 0
      },
      1200: {
        items: 5,
        slideBy: 5,
        margin: 0
      }
    }
  };
  getStarRating(averageRating: number): number {
    return Math.floor(Math.round(averageRating * 2) / 2);
  }
  onPrev() {
    if (this.owlCarousel) {
      this.owlCarousel.prev();
    }
  }

  onNext() {
    if (this.owlCarousel) {
      this.owlCarousel.next();
    }
  }
}
