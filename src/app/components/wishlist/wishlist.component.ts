import { WishlistService } from 'src/app/services/wishlist.service';
import { DetailsService } from 'src/app/services/details.service';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

interface WishlistItem {
  id: number;
  type: string;
  activityName?: string;
  placeID?: number;
  name: string;
  categoryName?: string;
  imageURLs: string[];
}

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  wishlist: WishlistItem[] = [];
  loading = false;
  errorMessage = '';
  menuOpenIndex: number | null = null;

  constructor(
    private wishlistService: WishlistService,
    private detailsService: DetailsService
  ) {}

  ngOnInit(): void {
    this.getWishlist();
  }

  toggleMenu(index: number): void {
    this.menuOpenIndex = this.menuOpenIndex === index ? null : index;
  }

  getWishlist(): void {
    this.loading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.wishlist = [];

        if (response?.places?.$values) {
          this.wishlist.push(
            ...response.places.$values.map((place: any) => ({
              id: place.placeID,
              type: 'place',
              placeID: place.placeID,
              name: place.name,
              description: place.description || '',
              imageURLs: place.imageURLs?.$values || [],
              categoryName: '',
              activityName: ''
            }))
          );
        }

        if (response?.activities?.$values) {
          this.wishlist.push(
            ...response.activities.$values.map((activity: any) => ({
              id: activity.activityId,
              type: 'activity',
              name: activity.name,
              imageURLs: activity.imageURLs?.$values || [],
              categoryName: activity.category,
              activityName: activity.name
            }))
          );
        }

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

// wishlist.component.ts
removeItemFromWishlist(item: WishlistItem, index: number): void {
  if (!item.id || !item.type) {
    console.error('Invalid item ID or Type:', item);
    return;
  }

  console.log(`Removing item: ${item.name} (ID: ${item.id}, Type: ${item.type})`);

  this.wishlistService.removeFromWishlist(item.id, item.type).subscribe({
    next: () => {
      console.log(`Successfully removed ${item.name} from wishlist.`);
      this.wishlist.splice(index, 1); // Remove the item from the UI
    },
    error: (error: HttpErrorResponse) => {
      console.error('Error removing item:', error);
      if (error.status === 404) {
        this.errorMessage = `Item not found in wishlist: ${item.name}`;
      } else {
        this.errorMessage = `Failed to remove item from wishlist: ${error.message}`;
      }
    }
  });
}
  getDetails(placeID: number, index: number): void {
    this.detailsService.getDetailedPlace(placeID).subscribe({
      next: (detail) => {
        if (detail) {
          this.wishlist[index].categoryName = detail.categoryName || 'Unknown Category';
          this.wishlist[index].activityName = detail.activityName || 'Unknown Activity';
        }
      },
      error: (error) => {
        console.error(`Error fetching details for placeID ${placeID}:`, error);
      }
    });
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
        }
      },
      error: (error) => {
        console.error(`Error fetching category for placeID ${placeID}:`, error);
      }
    });
  }
}
