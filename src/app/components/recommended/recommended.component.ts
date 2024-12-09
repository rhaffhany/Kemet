import { Component, OnInit } from '@angular/core';
import { HomeService } from 'src/app/services/home.service';

@Component({
  selector: 'app-recommended',
  templateUrl: './recommended.component.html',
  styleUrls: ['./recommended.component.scss']
})
export class RecommendedComponent implements OnInit {
  places: any;
  leftArrowSrc: string = '../../../assets/icons/arrow-left-circle.svg';
  rightArrowSrc: string = '../../../assets/icons/arrow-right-circle.svg';
  currentIndex: number = 0;
  totalSlides: number = 5;

  constructor(private _HomeService: HomeService) {}

  ngOnInit(): void {
  constructor(private _HomeService: HomeService) {

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
        } else {
          console.error('Expected $values array, but received:', data);
        }
      },
      error => {
        console.error('Error fetching places data:', error);
      }
    );
    
  }


  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.places.length - 5;
    }
    this.updateSlide();
  }

  nextSlide() {
    if (this.currentIndex < this.places.length - 5) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
    this.updateSlide();
  }

  updateSlide() {
    const cardsContainer = document.querySelector('.cards-container') as HTMLElement;
    if (this.currentIndex === this.places.length - 1) {
      cardsContainer.classList.add('swiped');
    } else {
      cardsContainer.classList.remove('swiped');
    }
    cardsContainer.style.transform = `translateX(-${this.currentIndex * 250}px)`;
  }

  
  
  // onImageError(event: Event) {
  //   (event.target as HTMLImageElement).src = 'assets/default-image.jpg';
  // }

}
