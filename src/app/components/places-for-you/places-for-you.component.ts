import { Component, OnInit, ViewChild } from '@angular/core';
import { CarouselComponent, OwlOptions } from 'ngx-owl-carousel-o';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';

interface Place {
  placeID: number;
  name: string;
  imageURLs: {
    $id: string;
    $values: string[];
  };
  averageRating: number;
  categoryName: string;
}

interface WishlistItem {
  itemId: number;
  type: string;
}

@Component({
  selector: 'app-places-for-you',
  templateUrl: './places-for-you.component.html',
  styleUrls: ['./places-for-you.component.scss']
})
export class PlacesForYouComponent implements OnInit {
  @ViewChild('owlCarousel') owlCarousel: CarouselComponent | undefined;
  places: Place[] = [];
  carouselReady = false;
  wishlistItems = new Set<number>();
  leftArrowSrc = '../../../assets/icons/arrow-left-circle.svg';
  rightArrowSrc = '../../../assets/icons/arrow-right-circle.svg';

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
    margin: 20,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    slideBy: 5,
    responsive: {
      0: {
        items: 2,
        slideBy: 2,
        margin: 10
      },
      480: {
        items: 2,
        slideBy: 2,
        margin: 15
      },
      768: {
        items: 3,
        slideBy: 2,
        margin: 15
      },
      992: {
        items: 4,
        slideBy: 3,
        margin: 20
      },
      1200: {
        items: 5,
        slideBy: 5,
        margin: 20
      }
    }
  };

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    console.log('PlacesForYou component initialized');
    this.loadPlacesForYou();
    this.loadWishlist();
  }

  loadPlacesForYou(): void {
    if (this.authService.isLoggedIn()) {
      console.log('User is logged in, fetching places...');
      const token = this.authService.getToken();
      console.log('Token available:', !!token);

      this.http.get<any>('https://kemet-server.runasp.net/api/places/PlacesForYou', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).subscribe({
        next: (response) => {
          console.log('Places API response:', response);
          if (response && response.$values) {
            this.places = response.$values;
            console.log('Places loaded:', this.places.length);
            this.carouselReady = true;
          } else {
            console.error('Invalid response format:', response);
          }
        },
        error: (error: Error) => {
          console.error('Error loading places:', error);
          this.carouselReady = true; // Set to true even on error to show empty state
        }
      });
    } else {
      console.log('User is not logged in');
      this.carouselReady = true; // Set to true when not logged in to show empty state
    }
  }

  loadWishlist(): void {
    if (this.authService.isLoggedIn()) {
      console.log('Loading wishlist...');
      this.wishlistService.getWishlist().subscribe({
        next: (wishlist: WishlistItem[]) => {
          this.wishlistItems = new Set(wishlist.map(item => item.itemId));
          console.log('Wishlist loaded:', this.wishlistItems.size, 'items');
        },
        error: (error: Error) => {
          console.error('Error loading wishlist:', error);
        }
      });
    }
  }

  isInWishlist(placeId: number): boolean {
    return this.wishlistItems.has(placeId);
  }

  toggleWishlist(placeId: number, event: Event): void {
    event.stopPropagation();

    if (this.isInWishlist(placeId)) {
      this.wishlistService.removeFromWishlist(placeId, 'place').subscribe({
        next: () => {
          this.wishlistItems.delete(placeId);
          console.log('Removed from wishlist:', placeId);
        },
        error: (error: Error) => {
          console.error('Error removing from wishlist:', error);
        }
      });
    } else {
      this.wishlistService.addPlaceToWishlist(placeId).subscribe({
        next: () => {
          this.wishlistItems.add(placeId);
          console.log('Added to wishlist:', placeId);
        },
        error: (error: Error) => {
          console.error('Error adding to wishlist:', error);
        }
      });
    }
  }

  getStarRating(rating: number): number {
    return Math.round(rating);
  }

  onPrev(): void {
    this.owlCarousel?.prev();
  }

  onNext(): void {
    this.owlCarousel?.next();
  }
} 