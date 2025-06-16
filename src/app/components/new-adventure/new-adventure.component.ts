import { HomeService } from 'src/app/services/home.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CarouselComponent } from 'ngx-owl-carousel-o';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WishlistService } from '../../services/wishlist.service';

interface Activity {
  activityId: number;
  name: string;
  imageURLs?: {
    $values: string[];
  };
  duration: string;
}

@Component({
  selector: 'app-new-adventure',
  templateUrl: './new-adventure.component.html',
  styleUrls: ['./new-adventure.component.scss']
})
export class NewAdventureComponent implements OnInit {
  @ViewChild('owlCarousel') owlCarousel: CarouselComponent | undefined;
  activities: Activity[] = [];
  leftArrowSrc: string = '../../../assets/icons/arrow-left-circle.svg';
  rightArrowSrc: string = '../../../assets/icons/arrow-right-circle.svg';
  carouselReady: boolean = false;
  starRating: number = 0;
  DeployUrl = 'https://kemet-server.runasp.net';
  wishlistItems: Set<number> = new Set();

  constructor(
    private _HomeService: HomeService,
    private authService: AuthService,
    private http: HttpClient,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.loadActivities();
    if (this.authService.isLoggedIn()) {
      this.loadWishlistItems();
    }
  }


  loadActivities() {
    this._HomeService.fetchActivities().subscribe(
      data => {
        if (data && Array.isArray(data.$values)) {
          this.activities = data.$values;
          this.carouselReady = true;
        } else {
          console.error('Expected $values array, but received:', data);
        }
      },
      error => {
        console.error('Error fetching data:', error);
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
        let activities = [];
        if (response && response.activities && response.activities.$values) {
          activities = response.activities.$values;
        }
        
        activities.forEach((activity: any) => {
          if (activity && activity.activityId) {
            this.wishlistItems.add(activity.activityId);
          }
        });
      },
      error => {
        console.error('Error loading wishlist:', error);
      }
    );
  }

  toggleWishlist(activityId: number, event: Event) {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      return;
    }

    const isInWishlist = this.wishlistItems.has(activityId);
    
    if (isInWishlist) {
      this.wishlistService.removeFromWishlist(activityId, 'activity').subscribe({
        next: () => {
          this.wishlistItems.delete(activityId);
        },
        error: (error) => {
          console.error('Error removing activity from wishlist:', error);
        }
      });
    } else {
      this.wishlistService.addActivityToWishlist(activityId).subscribe({
        next: () => {
          this.wishlistItems.add(activityId);
        },
        error: (error) => {
          console.error('Error adding activity to wishlist:', error);
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
    // Round to nearest half (0.5) then floor to get whole number of filled stars
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
