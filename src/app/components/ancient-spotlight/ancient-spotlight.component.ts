import { Component, OnInit } from '@angular/core';
import { HomeService } from 'src/app/services/home.service';
import { WishlistService } from 'src/app/services/wishlist.service';
import { AuthService } from 'src/app/services/auth.service'; // Import AuthService

interface Place {
  id: number;
  name: string;
  description: string;
  imageURLs: { $values: string[] };  
  categoryName: string;
}

@Component({
  selector: 'app-ancient-spotlight',
  templateUrl: './ancient-spotlight.component.html',
  styleUrls: ['./ancient-spotlight.component.scss'],
})
export class AncientSpotlightComponent implements OnInit {
  places: Place[] = [];
  currentIndex: number = 0;
  heartStates: boolean[] = [];
  totalSlides: number = 5;
  leftArrowSrc: string = '../../../assets/icons/arrow-left-circle.svg';
  rightArrowSrc: string = '../../../assets/icons/arrow-right-circle.svg';

  constructor(
    private _HomeService: HomeService,
    private wishlistService: WishlistService,
    private authService: AuthService 
  ) {}


  ngOnInit(): void {
    this._HomeService.fetchPlaces().subscribe(
      data => {
        if (data && Array.isArray(data.$values)) {
          this.places = data.$values;
          
          console.log('Fetched places:', this.places);
          
          this.places.forEach((place: any) => {
            if (place.placeID) {
              console.log('Fetching category for PlaceID:', place.placeID); 
              this._HomeService.fetchPlaceCategory(place.placeID).subscribe(
                categoryData => {
                  place.categoryName = categoryData.categoryName;
                },
                error => {
                  console.error('Error fetching category data for PlaceID:', place.placeID, error);
                }
              );
            } else {
              console.error('Place ID is undefined for:', place);
            }
          });
        }
      }
    );
  }


  toggleHeart(index: number, placeID: number): void {
    if (this.authService.isTokenExpired()) {
      console.log('Token expired. Please log in again.');
      return;
    }

    this.heartStates[index] = !this.heartStates[index];
    this.heartStates[index]
      ? this.addPlaceToWishlist(placeID)
      : this.removeFromWishlist(placeID, index);
  }

  addPlaceToWishlist(placeID: number): void {
    this.wishlistService.addPlaceToWishlist(placeID).subscribe(
      (response) => {
        console.log('Added to wishlist:', response);
      },
      (error) => {
        console.error('Error adding to wishlist:', error);
      }
    );
  }
  
  removeFromWishlist(placeID: number, index: number): void {
    this.wishlistService.removeFromWishlist(placeID).subscribe(
      (response) => {
        console.log('Removed from wishlist:', response);
        this.heartStates[index] = false;
      },
      (error) => {
        console.error('Failed to remove from wishlist:', error);
      }
    );
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextSlide(): void {
    if (this.currentIndex < this.places.length - this.totalSlides) {
      this.currentIndex++;
    }
  }

  getDisplayedPlaces(): Place[] {
    const endIndex = Math.min(this.currentIndex + this.totalSlides, this.places.length);
    return this.places.slice(this.currentIndex, endIndex);
  }
  
}
