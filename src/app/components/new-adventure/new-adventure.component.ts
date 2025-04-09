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
      console.log('User not logged in, skipping wishlist load');
      return;
    }

    this.wishlistService.getWishlist().subscribe(
      (response: any) => {
        console.log('Raw Wishlist Response:', response);
        this.wishlistItems.clear();

        // Handle different response formats
        let wishlistItems = [];
        if (response && response.activities && response.activities.$values) {
          wishlistItems = response.activities.$values;
        } else if (Array.isArray(response)) {
          wishlistItems = response;
        } else if (response && response.$values) {
          wishlistItems = response.$values;
        }
        
        console.log('Processed wishlist items:', wishlistItems);
        
        wishlistItems.forEach((item: any) => {
          console.log('Processing wishlist item:', item);
          if (item && item.activityId) {
            this.wishlistItems.add(item.activityId);
            console.log('Added activityId to wishlist:', item.activityId);
          }
        });

        console.log('Final Wishlist Items:', Array.from(this.wishlistItems));
      },
      error => {
        console.error('Error loading wishlist:', error);
      }
    );
  }

  toggleWishlist(activityId: number | undefined, event: Event) {
    if (!activityId) return;
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      return;
    }

    const isInWishlist = this.wishlistItems.has(activityId);
    
    if (isInWishlist) {
      // Remove from wishlist
      this.wishlistService.removeFromWishlist(activityId).subscribe({
        next: () => {
          this.wishlistItems.delete(activityId);
          console.log('Removed from wishlist:', activityId);
        },
        error: (error) => {
          console.error('Error removing from wishlist:', error);
        }
      });
    } else {
      // Add to wishlist
      const headers = this.getHeaders();
      this.http.post(`${this.DeployUrl}/api/Wishlist/AddActivityToWishlist?ActivityID=${activityId}`, {}, { headers })
        .subscribe({
          next: (response) => {
            console.log('Add to wishlist response:', response);
            this.wishlistItems.add(activityId);
            console.log('Added to wishlist:', activityId);
          },
          error: (error) => {
            console.error('Error adding to wishlist:', error);
            if (error.status === 400) {
              console.error('Bad request - check if activityId is correct:', activityId);
            }
          }
        });
    }
  }

  isInWishlist(activityId: number | undefined): boolean {
    if (!activityId) return false;
    return this.wishlistItems.has(activityId);
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('Authentication token is missing.');
      throw new Error('User is not authenticated.');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  customOptions: OwlOptions = {
    loop: true,
    margin: 10,
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