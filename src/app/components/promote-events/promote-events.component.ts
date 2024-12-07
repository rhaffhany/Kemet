import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-promote-events',
  templateUrl: './promote-events.component.html',
  styleUrls: ['./promote-events.component.scss']
})
export class PromoteEventsComponent implements OnInit, OnDestroy {
  currentIndex: number = 0;
  images: string[] = [
    '/assets/img/promote1.png',
    '/assets/img/promote2.png',
  ];

  // Declare intervalId to store the reference of setInterval
  intervalId: any;

  ngOnInit(): void {
    this.autoSlide();
  }

  // Function to automatically slide images
  autoSlide(): void {
    this.intervalId = setInterval(() => {
      this.moveSlide(1);
    }, 3000); // Change slide every 3 seconds
  }

  // Function to move slides based on the step
  moveSlide(step: number): void {
    this.currentIndex += step;

    if (this.currentIndex < 0) {
      this.currentIndex = this.images.length - 1;
    } else if (this.currentIndex >= this.images.length) {
      this.currentIndex = 0;
    }

    const carouselImages = document.querySelector('.carousel-images') as HTMLElement;
    carouselImages.style.transform = `translateX(-${this.currentIndex * 100}%)`;
  }

  // Clean up the interval when the component is destroyed
  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
