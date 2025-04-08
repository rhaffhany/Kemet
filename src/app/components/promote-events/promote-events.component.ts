import { SearchService } from 'src/app/services/search.service';
import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-promote-events',
  templateUrl: './promote-events.component.html',
  styleUrls: ['./promote-events.component.scss']
})
export class PromoteEventsComponent implements AfterViewInit, OnDestroy {
  currentIndex: number = 1;
  intervalId: any;
  realImages: string[] = [
    '/assets/img/grand museum2.jpg',
    '/assets/img/grand museum3.jpg',
    '/assets/img/grand museum1.jpg'
  ];
  images: string[] = [];

  ngAfterViewInit(): void {
    this.images = [
      this.realImages[this.realImages.length - 1],
      ...this.realImages,
      this.realImages[0]
    ];

    setTimeout(() => {
      this.updateSlide();
      this.autoSlide();
    });
  }

  autoSlide(): void {
    this.intervalId = setInterval(() => {
      this.moveSlide(1);
    }, 9000);
  }

  moveSlide(step: number): void {
    this.currentIndex += step;
    this.updateSlide();

    const carouselImages = document.querySelector('.carousel-images') as HTMLElement;

    carouselImages.style.transition = 'transform 0.6s ease-in-out';
    carouselImages.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    carouselImages.addEventListener('transitionend', () => {
      if (this.currentIndex === this.images.length - 1) {
        carouselImages.style.transition = 'none';
        this.currentIndex = 1;
        carouselImages.style.transform = `translateX(-${this.currentIndex * 100}%)`;
      } else if (this.currentIndex === 0) {
        carouselImages.style.transition = 'none';
        this.currentIndex = this.images.length - 2;
        carouselImages.style.transform = `translateX(-${this.currentIndex * 100}%)`;
      }
    }, { once: true });
  }

  updateSlide(): void {
    const carouselImages = document.querySelector('.carousel-images') as HTMLElement;
    if (carouselImages) {
      carouselImages.style.transform = `translateX(-${this.currentIndex * 100}%)`;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  searchIcon = "/assets/icons/Search.png";
  query = '';
  searchResults: any[] = [];
  errorMessage = '';
  notFoundImg: string = "/assets/img/not found.jpg";

  constructor(
    private SearchService: SearchService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  goToDetails(result: any) {
    if (result.type === 'place') {
      this.router.navigate(['/app-places', result.id]);
    } else if (result.type === 'activity') {
      this.router.navigate(['/app-activities', result.id]);
    }
  }

  onSearchInput(): void {
    if (this.query.trim()) {
      this.SearchService.search(this.query).subscribe({
        next: (results) => {
          this.searchResults = results;
          this.errorMessage = results.length === 0 ? 'No results found' : '';
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Search error:", error);
          this.errorMessage = error;
          this.searchResults = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      this.searchResults = [];
      this.errorMessage = '';
      this.cdr.detectChanges();
    }
  }
}
