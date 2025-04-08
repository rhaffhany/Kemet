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
  $id: string;
  description?: string;
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

  removeItemFromWishlist(item: WishlistItem, index: number): void {
    console.log(`Attempting to remove item:`, {
      name: item.name,
      index: index
    });

    this.wishlistService.removeFromWishlist(index).subscribe({
      next: () => {
        console.log(`Successfully removed ${item.name} from wishlist.`);
        this.wishlist.splice(index, 1); // Remove the item from the UI
        this.menuOpenIndex = null; // Close the menu
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error removing item:', {
          error,
          index,
          status: error.status,
          message: error.message,
          url: error.url
        });
        if (error.status === 404) {
          this.errorMessage = `Item not found in wishlist: ${item.name} (Index: ${index})`;
        } else if (error.status === 401) {
          this.errorMessage = 'Please log in to remove items from your wishlist';
        } else {
          this.errorMessage = `Failed to remove item from wishlist: ${error.message}`;
        }
      }
    });
  }

  getWishlist(): void {
    this.loading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        console.log('Raw API Response:', JSON.stringify(response, null, 2));
        this.wishlist = [];

        if (response?.places?.$values) {
          console.log('Processing places:', JSON.stringify(response.places.$values, null, 2));
          this.wishlist.push(
            ...response.places.$values.map((place: any) => {
              console.log('Processing place:', {
                name: place.name,
                placeID: place.placeID,
                $id: place.$id,
                fullPlace: place
              });
              
              const item = {
                id: place.placeID,
                type: 'place',
                placeID: place.placeID,
                name: place.name,
                description: place.description || '',
                imageURLs: place.imageURLs?.$values || [],
                categoryName: '',
                activityName: '',
                $id: place.$id
              };
              console.log('Created place item:', JSON.stringify(item, null, 2));
              return item;
            })
          );
        }

        if (response?.activities?.$values) {
          console.log('Processing activities:', JSON.stringify(response.activities.$values, null, 2));
          this.wishlist.push(
            ...response.activities.$values.map((activity: any) => {
              const item = {
                id: activity.activityId,
                type: 'activity',
                name: activity.name,
                imageURLs: activity.imageURLs?.$values || [],
                categoryName: activity.category,
                activityName: activity.name,
                $id: activity.$id
              };
              console.log('Created activity item:', JSON.stringify(item, null, 2));
              return item;
            })
          );
        }

        console.log('Final wishlist:', JSON.stringify(this.wishlist, null, 2));

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
