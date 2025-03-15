import { WishlistService } from 'src/app/services/wishlist.service';
import { DetailsService } from 'src/app/services/details.service';
import { Component, OnInit } from '@angular/core';

interface WishlistItem {
  type: string;
  activityName: any;
  placeID: number;
  name: string;
  categoryName?: string; // Category fetched separately
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
  
  constructor(private WishlistService: WishlistService, private DetailsService: DetailsService) {}

  ngOnInit(): void {
    this.getWishlist();
  }
  toggleMenu(index: number): void {
    this.menuOpenIndex = this.menuOpenIndex === index ? null : index; // Toggle menu
  }  

  getWishlist(): void {
    this.loading = true;
    this.WishlistService.getWishlist().subscribe({
      next: (response) => {
        console.log('API Response:', response); // Debugging
  
        if (response) {
          this.wishlist = [];
  
          if (response.places?.$values) {
            this.wishlist.push(
              ...response.places.$values.map((place: any) => ({
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
  
          // ✅ Extract activities
          if (response.activities?.$values) {
            this.wishlist.push(
              ...response.activities.$values.map((activity: any) => ({
                type: 'activity', // To identify it as an activity
                activityID: activity.activityId,
                name: activity.name,
                imageURLs: activity.imageURLs?.$values || [],
                categoryName: activity.category,  // Empty because it's an activity
                activityName: activity.name // Use activity name directly
              }))
            );
          }
  
          // Fetch category details for places
          this.wishlist.forEach((item, index) => {
            if (item.type === 'place') {
              this.getCategory(item.placeID, index);
            }
          });
        }
  
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
    this.DetailsService.getDetailedPlace(placeID).subscribe({
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
    this.DetailsService.getDetailedPlace(placeID).subscribe({
      next: (detail) => {
        if (detail && detail.categoryName) {
          this.wishlist[index].categoryName = detail.categoryName;
        }
      },
      error: (error) => {
        console.error(`Error fetching category for placeID ${placeID}:`, error);
      }
    });
  }
}
