import { Component, OnInit } from '@angular/core';
import { HomeService } from 'src/app/services/home.service';

@Component({
  selector: 'app-new-adventure',
  templateUrl: './new-adventure.component.html',
  styleUrls: ['./new-adventure.component.scss']
})
export class NewAdventureComponent  {
  activities: any;  // The response from the API
  leftArrowSrc: string = '../../../assets/icons/arrow-left-circle.svg';
  rightArrowSrc: string = '../../../assets/icons/arrow-right-circle.svg';
  currentIndex: number = 0;
  totalSlides: number = 5;

  constructor(private _HomeService: HomeService) {
    this._HomeService.fetchActivities().subscribe(
      data => {
        if (data && Array.isArray(data.$values)) {
          this.activities = data.$values;
        } else {
          console.error('Expected $values array, but received:', data);
        }
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }
  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.activities.length - 5;
    }
    this.updateSlide();
  }
  
  nextSlide() {
    if (this.currentIndex < this.activities.length - 5) {
      this.currentIndex++;
    } else {
      // Move to the first card when at the last slide
      this.currentIndex = 0;
    }
    this.updateSlide();
  }
  
  updateSlide() {
    const cardsContainer = document.querySelector('.cards-container') as HTMLElement;
    if (this.currentIndex === this.activities.length - 1) {
      cardsContainer.classList.add('swiped');
    } else {
      cardsContainer.classList.remove('swiped');
    }
    // Update the transform property to slide
    cardsContainer.style.transform = `translateX(-${this.currentIndex * 250}px)`;
  }
  
  
  // onImageError(event: Event) {
  //   (event.target as HTMLImageElement).src = 'assets/default-image.jpg';
  // }
}



