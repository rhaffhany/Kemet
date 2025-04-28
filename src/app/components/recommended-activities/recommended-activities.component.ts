import { HomeService } from 'src/app/services/home.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CarouselComponent } from 'ngx-owl-carousel-o';
import { WishlistService } from 'src/app/services/wishlist.service';
import { AuthService } from 'src/app/services/auth.service';

interface Activity {
  activityId: number;  // Ensuring consistent property name
  name: string;
  imageURLs?: {
    $values: string[];
  };
  averageRating: number;
  duration?: string;
}

@Component({
  selector: 'app-recommended-activities',
  templateUrl: './recommended-activities.component.html',
  styleUrls: ['./recommended-activities.component.scss']
})
export class RecommendedActivitiesComponent implements OnInit {
  @ViewChild('owlCarousel') owlCarousel: CarouselComponent | undefined;
  activities: Activity[] = [];
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
    this._HomeService.fetchTopRatedActivities().subscribe(
      data => {
        if (data && Array.isArray(data.$values)) {
          this.activities = data.$values.map((activity: Activity) => ({
            ...activity,
            activityId: activity.activityId
          }));
          this.carouselReady = true;
        } else {
          console.error('Expected $values array, but received:', data);
        }
      },
      error => {
        console.error('Error fetching activities:', error);
      }
    );

    if (this.authService.isLoggedIn()) {
      this.loadWishlistItems();
    }
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

        let activities = [];
        if (response && response.activities && response.activities.$values) {
          activities = response.activities.$values;
        }
        
        activities.forEach((activity: any) => {
          if (activity && activity.activityId) {
            this.wishlistItems.add(activity.activityId);
            console.log('Added activityId to wishlist:', activity.activityId);
          }
        });
      },
      error => {
        console.error('Error loading wishlist:', error);
      }
    );
  }

  isInWishlist(activityId: number): boolean {
    return this.wishlistItems.has(activityId);
  }

  toggleWishlist(activityId: number, event: Event) {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      window.location.href = '/login';
      return;
    }

    const isInWishlist = this.wishlistItems.has(activityId);
    
    if (isInWishlist) {
      this.wishlistService.removeFromWishlist(activityId, 'activity').subscribe({
        next: () => {
          this.wishlistItems.delete(activityId);
          console.log('Removed activity from wishlist:', activityId);
        },
        error: (error) => {
          console.error('Error removing activity from wishlist:', error);
        }
      });
    } else {
      this.wishlistService.addActivityToWishlist(activityId).subscribe({
        next: () => {
          this.wishlistItems.add(activityId);
          console.log('Added activity to wishlist:', activityId);
        },
        error: (error) => {
          console.error('Error adding activity to wishlist:', error);
        }
      });
    }
  }

  customOptions: OwlOptions = {
    loop: true,
    margin: -70,
    nav: false,
    dots: false,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: false,
    responsive: {
      0: {
        items: 1.2
      },
      768: {
        items: 3
      },
      1024: {
        items: 4
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
