import { Component, OnInit, HostListener } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { WishlistService } from 'src/app/services/wishlist.service';
import { DetailsService } from 'src/app/services/details.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface WishlistItem {
  id: number;
  type: string;
  activityName?: string;
  placeID?: number;
  name: string;
  categoryName?: string;
  imageURLs: string[];
  $id: string;
  description?: string;
  isRemoving?: boolean;
  pictureUrl?: string;
  planName?: string;
  planAvailability?: string;
}

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  wishlist: WishlistItem[] = [];
  filteredWishlist: WishlistItem[] = [];
  loading = false;
  errorMessage = '';
  menuOpenIndex: number | null = null;
  activeFilter = 'all';

  constructor(
    private wishlistService: WishlistService,
    private detailsService: DetailsService
  ) {}

  ngOnInit(): void {
    this.getWishlist();
  }

  private deduplicateItems(items: WishlistItem[]): WishlistItem[] {
    // Create a Map to store unique items using a composite key of type and id
    const uniqueItems = new Map<string, WishlistItem>();
    
    items.forEach(item => {
      const key = `${item.type}-${item.id}`;
      if (!uniqueItems.has(key)) {
        uniqueItems.set(key, item);
      }
    });
    
    return Array.from(uniqueItems.values());
  }

  toggleMenu(index: number): void {
    this.menuOpenIndex = this.menuOpenIndex === index ? null : index;
  }

  removeItemFromWishlist(item: WishlistItem, index: number): void {
    // Set the removing state
    item.isRemoving = true;
    
    // Wait for animation to complete before making the API call
    setTimeout(() => {
      this.wishlistService.removeFromWishlist(item.id, item.type).subscribe({
        next: () => {
          // Remove from both arrays
          const mainIndex = this.wishlist.findIndex(i => i.id === item.id && i.type === item.type);
          if (mainIndex !== -1) {
            this.wishlist.splice(mainIndex, 1);
          }
          
          const filteredIndex = this.filteredWishlist.findIndex(i => i.id === item.id && i.type === item.type);
          if (filteredIndex !== -1) {
            this.filteredWishlist.splice(filteredIndex, 1);
          }
          
          // Close menu and clear error
          this.menuOpenIndex = null;
          this.errorMessage = '';
        },
        error: (error: HttpErrorResponse) => {
          // Remove the removing state if there's an error
          item.isRemoving = false;
          
          console.error('Error removing item:', error);
          
          if (error.status === 404) {
            // If the item doesn't exist on the server, remove it from the UI
            const mainIndex = this.wishlist.findIndex(i => i.id === item.id && i.type === item.type);
            if (mainIndex !== -1) {
              this.wishlist.splice(mainIndex, 1);
            }
            
            const filteredIndex = this.filteredWishlist.findIndex(i => i.id === item.id && i.type === item.type);
            if (filteredIndex !== -1) {
              this.filteredWishlist.splice(filteredIndex, 1);
            }
          } else if (error.status === 401) {
            this.errorMessage = 'Please log in to remove items from your wishlist';
          } else {
            this.errorMessage = `Failed to remove ${item.name} from wishlist`;
          }
        }
      });
    }, 300); // Match the animation duration
  }

  getWishlist(): void {
    this.loading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        const tempWishlist: WishlistItem[] = [];

        // Process places
        if (response?.places?.$values) {
          tempWishlist.push(
            ...response.places.$values.map((place: any) => ({
              id: place.placeID,
              type: 'place',
              placeID: place.placeID,
              name: place.name,
              description: place.description || '',
              imageURLs: place.imageURLs?.$values || [],
              categoryName: '',
              activityName: '',
              $id: place.$id
            }))
          );
        }

        // Process activities
        if (response?.activities?.$values) {
          tempWishlist.push(
            ...response.activities.$values.map((activity: any) => ({
              id: activity.activityId,
              type: 'activity',
              name: activity.name,
              imageURLs: activity.imageURLs?.$values || [],
              categoryName: activity.category,
              activityName: activity.name,
              $id: activity.$id
            }))
          );
        }

        // Process plans
        if (response?.plans?.$values) {
          tempWishlist.push(
            ...response.plans.$values.map((plan: any) => ({
              id: plan.planId,
              type: 'plan',
              planName: plan.planName || 'Trip Plan',
              name: plan.planName || 'Trip Plan',
              pictureUrl: plan.pictureUrl,
              description: plan.description || '',
              $id: plan.$id,
              planAvailability: plan.planAvailability || 'Available'
            }))
          );
        }

        // Apply deduplication
        this.wishlist = this.deduplicateItems(tempWishlist);

        // Initialize filtered wishlist with all items
        this.filterWishlist('all');

        // Fetch categories for places
        this.wishlist.forEach((item, index) => {
          if (item.type === 'place' && item.placeID) {
            this.getCategory(item.placeID, index);
          }
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching wishlist:', error);
        this.errorMessage = 'Failed to load wishlist.';
        this.loading = false;
      }
    });
  }

  filterWishlist(type: string): void {
    this.activeFilter = type;
    if (type === 'all') {
      this.filteredWishlist = [...this.wishlist];
    } else {
      this.filteredWishlist = this.wishlist.filter(item => item.type === type);
    }
  }

  getCategory(placeID: number, index: number): void {
    if (!placeID) {
      console.warn(`Skipping category fetch for invalid placeID: ${placeID}`);
      return;
    }

    this.detailsService.getDetailedPlace(placeID).subscribe({
      next: (detail) => {
        if (detail?.categoryName) {
          this.wishlist[index].categoryName = detail.categoryName;
          // Also update the filtered list
          const filteredIndex = this.filteredWishlist.findIndex(item => 
            item.type === 'place' && item.placeID === placeID);
          if (filteredIndex !== -1) {
            this.filteredWishlist[filteredIndex].categoryName = detail.categoryName;
          }
        }
      },
      error: (error) => {
        console.error(`Error fetching category for placeID ${placeID}:`, error);
      }
    });
  }

  // Method to add item to trip plan
  addToTrip(item: WishlistItem): void {
    console.log('Adding to trip plan:', item);
    // Implementation will come later
  }

  // Method to view plan details
  viewPlanDetails(plan: WishlistItem): void {
    console.log('Viewing plan details:', plan);
    // Implementation will come later
  }

  // Close menu when clicking outside
  @HostListener('document:click', ['$event'])
  closeMenuOnOutsideClick(event: Event): void {
    if (this.menuOpenIndex !== null) {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-container') && !target.closest('.menu-btn')) {
        this.menuOpenIndex = null;
      }
    }
  }
}