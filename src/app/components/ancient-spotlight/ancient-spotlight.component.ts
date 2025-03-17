import { HomeService } from './../../services/home.service';

  import { Component, OnInit } from '@angular/core';
  import { WishlistService } from 'src/app/services/wishlist.service';
  import { AuthService } from 'src/app/services/auth.service';
import { HttpHeaders } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
  
  @Component({
    selector: 'app-ancient-spotlight',
    templateUrl: './ancient-spotlight.component.html',
    styleUrls: ['./ancient-spotlight.component.scss']
  })
  export class AncientSpotlightComponent implements OnInit {
    ancientPlaces = [
      { id: 1, name: 'Great Pyramid of Giza', image: 'giza.jpg' },
      { id: 2, name: 'Machu Picchu', image: 'machu-picchu.jpg' },
      { id: 3, name: 'Colosseum', image: 'colosseum.jpg' }
    ]; // Hardcoded data
    

    places: any = [];
    currentIndex: number = 0;
    heartStates: boolean[] = [];
    totalSlides: number = 5;
    leftArrowSrc: string = '../../../assets/icons/arrow-left-circle.svg';
    rightArrowSrc: string = '../../../assets/icons/arrow-right-circle.svg';
    http: any;
  
    constructor(
      private wishlistService: WishlistService,
      private authService: AuthService,
      private _HomeService: HomeService
    ) {}
  
    ngOnInit(): void {
      this.heartStates = new Array(this.ancientPlaces.length).fill(false);
    
      // Fetch the wishlist from the server
      this.wishlistService.getWishlist().subscribe(
        (wishlist) => {
          if (wishlist && Array.isArray(wishlist.$values)) {
            const wishlistPlaceIDs = wishlist.$values.map((item: any) => item.placeID);
    
            // Mark places that are already in the wishlist
            this.ancientPlaces.forEach((place, index) => {
              if (wishlistPlaceIDs.includes(place.id)) {
                this.heartStates[index] = true; // Keep it red
              }
            });
          }
        },
        (error) => {
          console.error('Error fetching wishlist:', error);
        }
      );
    
      this._HomeService.fetchPlaces().subscribe(
        (data) => {
          if (data && Array.isArray(data.$values)) {
            this.places = data.$values;
          }
        },
        (error) => {
          console.error('Error fetching places data:', error);
        }
      );
    }
    
  
    toggleHeart(index: number, placeID: number): void {
      if (this.authService.isTokenExpired()) {
        console.log('Token expired. Please log in again.');
        return;
      }
    
      if (this.heartStates[index]) {
        console.log('Already in wishlist.'); // Prevent duplicate addition
        return;
      }
    
      this.heartStates[index] = true; // Change to red immediately
    
      this.wishlistService.addPlaceToWishlist(placeID).subscribe(
        () => console.log('Added to wishlist'),
        (error) => {
          console.error('Error adding to wishlist:', error);
          this.heartStates[index] = false; // Revert if failed
        }
      );
    }
    
    
    addPlaceToWishlist(placeID: number) {
      const url = `https://kemet-server.runasp.net/api/Wishlist/AddPlaceToWishlist?PlaceID=${placeID}`;
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}` // If authentication is needed
      });
    
      return this.http.post(url, {}, { headers }).pipe(
        catchError(error => {
          console.error('Error adding place to wishlist:', error);
          return throwError(() => new Error('Failed to add place to wishlist.'));
        })
      );
    }
    
    prevSlide() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    }
  
    nextSlide(): void {
      if (this.currentIndex < this.places.length - this.totalSlides) {
        this.currentIndex++;
      }
    }
  
    getDisplayedPlaces(): any[] {
      const endIndex = Math.min(this.currentIndex + this.totalSlides, this.places.length);
      return this.places.slice(this.currentIndex, endIndex);
    }
  
    
    updateSlide() {
      const cardsContainer = document.querySelector('.cards-container') as HTMLElement;
      if (this.currentIndex === this.places.length - 1) {
        cardsContainer.classList.add('swiped');
      } else {
        cardsContainer.classList.remove('swiped');
      }
      // Update the transform property to slide
      cardsContainer.style.transform = `translateX(-${this.currentIndex * 250}px)`;
    }
    
    
  }
  