import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { HomeService } from 'src/app/services/home.service';


@Component({
  selector: 'app-ancient-spotlight',
  templateUrl: './ancient-spotlight.component.html',
  styleUrls: ['./ancient-spotlight.component.scss']
})
export class AncientSpotlightComponent {

Places = [
  // {
  //   "$id": " ",
  //   "placeID": '',
  //   "name": " ",
  //   "description": " ",
  //   "imageURLs": [''],
  //   "reviews": {
  //       "$id": " ",
  //       "$values": []
  //   },
  //   "averageRating": '',
  //   "ratingsCount": ''
  // }
  { name: '', placeID: '', description: '', imageURLs: [''] },
];

leftArrowSrc: string = '../../../assets/icons/arrow-left-circle.svg';
rightArrowSrc: string = '../../../assets/icons/arrow-right-circle.svg';

currentIndex = 0;
totalSlides = 5;

constructor(private _HomeService:HomeService){

  this._HomeService.fetchPlaces().subscribe(
    data => {
      this.Places = data;
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
    this.currentIndex = this.Places.length - 1;
  }
  this.updateSlide();
}

nextSlide() {
  if (this.currentIndex < this.Places.length - 5) {
    this.currentIndex++;
  } else {
    // Move to the first card when at the last slide
    this.currentIndex = 0;
  }
  this.updateSlide();
}

updateSlide() {
  const cardsContainer = document.querySelector('.cards-container') as HTMLElement;
  if (this.currentIndex === this.Places.length - 1) {
    cardsContainer.classList.add('swiped');
  } else {
    cardsContainer.classList.remove('swiped');
  }
  // Update the transform property to slide
  cardsContainer.style.transform = `translateX(-${this.currentIndex * 250}px)`;
}


onImageError(event: Event) {
  (event.target as HTMLImageElement).src = 'assets/default-image.jpg';
}

}
