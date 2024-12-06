import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-promote-events',
  templateUrl: './promote-events.component.html',
  styleUrls: ['./promote-events.component.scss']
})
export class PromoteEventsComponent implements OnInit {
  currentIndex: number = 0;
  images: string[] = [
    '/assets/img/promote1.png',
    '/assets/img/promote2.png',
  ];

  ngOnInit(): void {
    this.autoSlide();
  }

  autoSlide(): void {
    setInterval(() => {
      this.moveSlide(1);
    }, 3000); // Change slide every 3 seconds
  }

  moveSlide(step: number): void {
    this.currentIndex += step;

    // Loop through the images (wrap around)
    if (this.currentIndex < 0) {
      this.currentIndex = this.images.length - 1;
    } else if (this.currentIndex >= this.images.length) {
      this.currentIndex = 0;
    }

    // Update the transform value to create the sliding effect
    const carouselImages = document.querySelector('.carousel-images') as HTMLElement;
    carouselImages.style.transform = `translateX(-${this.currentIndex * 100}%)`;
  }
}
