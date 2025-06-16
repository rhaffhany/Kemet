// top-selling.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CarouselComponent, OwlOptions } from 'ngx-owl-carousel-o';
import { Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-top-selling',
  templateUrl: './top-selling.component.html',
  styleUrls: ['./top-selling.component.scss']
})
export class TopSellingComponent implements OnInit {
  @ViewChild('owlCarousel') owlCarousel: CarouselComponent | undefined;
  packages: any[] = [];
  leftArrowSrc: string = '../../../assets/icons/arrow-left-circle.svg';
  rightArrowSrc: string = '../../../assets/icons/arrow-right-circle.svg';
  carouselReady: boolean = false;
  wishlistItems: Set<number> = new Set();
  starRating: number = 0;

  constructor(
    private router: Router,
    private HomeService: HomeService,
    private authService: AuthService,
    private wishlistService: WishlistService
  ) { }

  ngOnInit(): void {
    this.loadPackages();
    if (this.authService.isLoggedIn()) {
      this.loadWishlistItems();
    }
  }

  loadPackages(): void {
    this.HomeService.fetchTravelAgencyPlan().subscribe((data: any) => {
      this.packages = data.$values;
      this.carouselReady = true;
    });
  }

  navigateToPackage(planId: number) {
    this.router.navigate(['/Package-details', planId]);
  }
  getStarRating(averageRating: number): number {
    return Math.floor(Math.round(averageRating * 2) / 2);
  }
  toggleWishlist(planId: number, event: Event) {
    event.stopPropagation(); // Prevent navigation when clicking wishlist icon
    if (!this.authService.isLoggedIn()) {
      window.location.href = '/login';
      return;
    }

    const isInWishlist = this.wishlistItems.has(planId);
    
    if (isInWishlist) {
      this.wishlistService.removeFromWishlist(planId, 'plan').subscribe({
        next: () => {
          this.wishlistItems.delete(planId);
          console.log('Successfully removed from wishlist');
        },
        error: (error: Error) => {
          console.error('Error removing from wishlist:', error);
          // Add the item back if removal failed
          this.wishlistItems.add(planId);
        }
      });
    } else {
      this.wishlistService.addPlanToWishlist(planId).subscribe({
        next: () => {
          this.wishlistItems.add(planId);
          console.log('Successfully added to wishlist');
        },
        error: (error: Error) => {
          console.error('Error adding to wishlist:', error);
          // Remove the item if addition failed
          this.wishlistItems.delete(planId);
        }
      });
    }
  }

  isInWishlist(planId: number): boolean {
    return this.wishlistItems.has(planId);
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
    autoWidth: false,
    nav: false,
    margin: 20,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    slideBy: 5, // Navigate 5 items at once on desktop
    responsive: {
      0: {
        items: 1,
        slideBy: 1,
        margin: 15
      },
      480: {
        items: 1,
        slideBy: 1,
        margin: 15
      },
      768: {
        items: 2,
        slideBy: 2,
        margin: 18
      },
      992: {
        items: 3,
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

  loadWishlistItems() {
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in, skipping wishlist load');
      return;
    }

    this.wishlistService.getWishlist().subscribe({
      next: (response: any) => {
        this.wishlistItems.clear();
        let wishlistItems = [];
        
        if (response?.plans?.$values) {
          wishlistItems = response.plans.$values;
        } else if (Array.isArray(response)) {
          wishlistItems = response;
        } else if (response?.$values) {
          wishlistItems = response.$values;
        }
        
        wishlistItems.forEach((item: any) => {
          if (item?.planId || item?.planID) {
            const id = item.planId || item.planID;
            this.wishlistItems.add(id);
            console.log('Added plan to wishlist:', id);
          }
        });
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
      }
    });
  }
}