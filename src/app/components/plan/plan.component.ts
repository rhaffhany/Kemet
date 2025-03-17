import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})
export class PlanComponent implements AfterViewInit, OnDestroy {
  currentIndex = 0;
  autoSlideInterval!: ReturnType<typeof setInterval>;
  hideStartSection = false;
  showQuestionSection = false;
  showSecondQuestionSection = false;
  backimg = 'assets/icons/Back.png';

  images = [
    'assets/img/Egypt.jpg', 
    'assets/img/Egypt1.jpg', 
    'assets/img/Egypt2.jpg',
    'assets/img/Egypt3.jpg', 
    'assets/img/Egypt4.jpg'  
  ];

  experiencesOptions = [
    "Historical & Cultural",
    "Adventure & Outdoor",
    "Food & Culinary",
    "Nature & Wildlife",
    "Shopping & Entertainment",
    "Festivals & Events"
  ];
  
  tripDurationOptions = ['3 Days', '4 Days', '5 Days', '6 Days', '7 Days', '8 Days'];

  selectedOptions: string[] = [];
  selectedTripDuration: string | null = null;
  progressValue = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.startAutoSlide();
    this.updateGallery();
  }

  ngOnDestroy(): void {
    clearInterval(this.autoSlideInterval);
  }

  private startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  private updateGallery(): void {
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
      const newIndex = (this.currentIndex + index) % this.images.length;
      (item as HTMLElement).className = `gallery-item gallery-item-${newIndex + 1}`;
    });
  }

  startQuiz(): void {
    this.hideStartSection = true;
    setTimeout(() => {
      this.showQuestionSection = true;
      this.cdr.detectChanges();
    }, 1000);
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateGallery();
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateGallery();
  }

  goBackToStart(): void {
    this.showQuestionSection = false;
    this.showSecondQuestionSection = false;
    setTimeout(() => {
      this.hideStartSection = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  toggleSelection(option: string): void {
    const index = this.selectedOptions.indexOf(option);
    index === -1 ? this.selectedOptions.push(option) : this.selectedOptions.splice(index, 1);
    this.updateProgress();
  }

  private updateProgress(): void {
    this.progressValue = this.selectedOptions.length > 0 ? (this.selectedTripDuration ? 40 : 20) : 0;
  }

  isNextButtonDisabled(): boolean {
    return this.selectedOptions.length === 0;
  }

  nextQuestion(): void {
    if (!this.isNextButtonDisabled()) {
      this.showQuestionSection = false;
      setTimeout(() => {
        this.showSecondQuestionSection = true;
        this.cdr.detectChanges();
      }, 1000);
    }
  }

  toggleTripDurationSelection(option: string): void {
    this.selectedTripDuration = option;
    this.updateProgress();
  }
  
  isTripDurationNextDisabled(): boolean {
    return !this.selectedTripDuration;
  }
}
