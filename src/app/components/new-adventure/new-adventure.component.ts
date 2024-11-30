import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-adventure',
  templateUrl: './new-adventure.component.html',
  styleUrls: ['./new-adventure.component.scss']
})
export class NewAdventureComponent implements OnInit {

  leftArrowSrc: string = '../../../assets/icons/arrow-left-circle.svg';
  rightArrowSrc: string = '../../../assets/icons/arrow-right-circle.svg';

  activities = [
    { name: '', duration: '', imageURLs: [''] },
  ];

  currentIndex = 0;
  totalSlides = 5;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchActivities();
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.activities.length - 1;
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

  fetchActivities() {
    this.http.get<any[]>('https://localhost:7051/api/Activities') 
      .subscribe(
        data => {
          this.activities = data;
        },
        error => {
          console.error('Error fetching data:', error);
        }
      );
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/default-image.jpg';
  }
}
