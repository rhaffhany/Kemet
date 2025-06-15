import { HomeService } from 'src/app/services/home.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CarouselComponent } from 'ngx-owl-carousel-o';
import { WishlistService } from 'src/app/services/wishlist.service';
import { AuthService } from 'src/app/services/auth.service';

interface Places {
  placeID: number;
  name: string;
  imageURLs?: {
    $values: string[];
  };
  duration: string;
  categoryName: string;
  averageRating?: number;  // Ensure averageRating is part of the interface
  ratingsCount?: number;    // You can also add ratingsCount if needed
}
@Component({
  selector: 'app-recommended-places',
  templateUrl: './recommended-places.component.html',
  styleUrls: ['./recommended-places.component.scss']
})
export class RecommendedComponent implements OnInit {
  @ViewChild('owlCarousel') owlCarousel: CarouselComponent | undefined;
  places: Places[] = [];
  leftArrowSrc: string = '../../../assets/icons/arrow-left-circle.svg';
  rightArrowSrc: string = '../../../assets/icons/arrow-right-circle.svg';
  carouselReady: boolean = false;
  wishlistItems: Set<number> = new Set();
  starRating: number = 0;

  constructor(
    private _HomeService: HomeService,
    private authService: AuthService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this._HomeService.fetchTopRatedPlaces().subscribe(
      data => {
        if (data && Array.isArray(data.$values)) {
          this.places = data.$values;
          this.carouselReady = true;
          
          // Fetch category for each place
          this.places.forEach((place: Places) => {
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

          // Load wishlist items if user is logged in
          if (this.authService.isLoggedIn()) {
            this.loadWishlistItems();
          }
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
      console.log('User not logged in, skipping wishlist load');
      return;
    }

    this.wishlistService.getWishlist().subscribe(
      (response: any) => {
        console.log('Raw Wishlist Response:', response);
        this.wishlistItems.clear();

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

  isInWishlist(placeId: number): boolean {
    return this.wishlistItems.has(placeId);
  }

  toggleWishlist(placeId: number, event: Event) {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      window.location.href = '/login';
      return;
    }

    const isInWishlist = this.wishlistItems.has(placeId);
    
    if (isInWishlist) {
      this.wishlistService.removeFromWishlist(placeId, 'place').subscribe({
        next: () => {
          this.wishlistItems.delete(placeId);
          console.log('Removed from wishlist:', placeId);
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
        }
      });
    } else {
      this.wishlistService.addPlaceToWishlist(placeId).subscribe({
        next: () => {
          this.wishlistItems.add(placeId);
          console.log('Added to wishlist:', placeId);
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
        }
      });
    }
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
  getStarRating(averageRating: number | undefined): number {
    if (averageRating === undefined || averageRating === null) {
      return 0;
    }
    return Math.floor(averageRating);
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
