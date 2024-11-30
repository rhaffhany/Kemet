import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-promote-events',
  templateUrl: './promote-events.component.html',
  styleUrls: ['./promote-events.component.scss']
})
export class PromoteEventsComponent implements OnInit {
  currentIndex: number = 0;
  images: string[] = [
    'https://s3-alpha-sig.figma.com/img/f0b8/48e9/be6996929839eb2966022c822af54f15?Expires=1733097600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=C26ktXyDi17h1awGqAtZGA62PWoVlrMTJsUMekJhpK7jucnb-i6LEG205lgB4rTMzdzpci~0wAiOhaDBrCaO2KlqbFVqxN14fE~BElhNLDE0P-kIYkqM-4elRKv6pVw7RKyTdVzIdQPfaTg9nVX1pnw5RIKq~J8UMTO1mnA6G9kAqUduMDWB0nk62n3SoT9C7iH7eK9alL5kMZ5OJsNk6lhKl9yRmyXZYR1YtpuRsB8IkvECUc30MKJEZny5RsxsdJo2LEE3lZcMrnWHb-o9iUd7lG2K-RpT-p3q3TA0nXEN79mTXwZiPtWuV2UlztjAno1aX~u-SHJRUHIswvXd5w__',
    'https://s3-alpha-sig.figma.com/img/c981/6537/f6081f9c736d79d134b76444ded76d5e?Expires=1733097600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=OrVpp1QA5MCDKrsyzf3BGT37rx711LgEtR0AKtUcnnFHyENIkQNgNHqp5LbTvYN-6V2ZuzluKWcuqvzFQz0OWjV16zfQQYEAuoZvmvT1nhwDzEJD1hf3SG4t6nJvXuFW~JI-rpFTVRUy41XrFQN1Swus3RBzQvUFv8HRItpsjRAomOMZYxGCz9meYJy1MXYinawWlJDSPAOJX7rQHu7DJN~rNrB1CQZjQPS8loJEmmWcU7xTn~o9odzmj~PvMGC5WPEm6AkmfJgKKdFI4ePAGYAbwUSPNoaNg1M7K3tQs-DMRTYkpmwpnNG2Wze-cpkw7Cy5ygYlw3xWEsuaogd8Ng__',
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
