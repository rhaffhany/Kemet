import { Component, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

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
  showThirdQuestionSection = false;
  showFourthQuestionSection = false;
  showFifthQuestionSection = false;
  showSixthQuestionSection = false;
  showResultsSection = false;
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

  placesOptions = [
    "Historical Sites",
    "Museums",
    "Religious Sites",
    "Hidden Gems",
    "Adventure Spots",
    "Resorts and Beaches",
    "Nile River Destinations",
    "Desert Landscape"
  ];

  activitiesOptions = [
    "Diving & Snorkeling",
    "Hiking",
    "Water Sports",
    "Cultural Experience",
    "Adventure Activity",
    "Relaxation & Wellness",
    "Desert Safari",
    "Fancy Cafe",
    "Hidden Gems"
  ];

  travelTimeOptions = [
    { label: 'Spring', image: 'assets/img/Spring.png' },
    { label: 'Summer', image: 'assets/img/Summer.jpg' },
    { label: 'Autumn', image: 'assets/img/Autumn.png' },
    { label: 'Winter', image: 'assets/img/winter.png' }
  ];

  budgetOptions = ["Less Than 1K", "1.5K - 3.5K", "3.5K - 6K", "More Than 6K"];
  tripDurationOptions = ['3 Days', '4 Days', '5 Days', '6 Days', '7 Days', '8 Days'];

  selectedPlaces: string[] = [];
  selectedActivities: string[] = [];
  selectedBudget: string = '';
  selectedTravelTime: string = '';
  selectedOptions: string[] = [];
  selectedTripDuration: string | null = null;
  progressValue = 0;
  isLoading = false;
  errorMessage = '';
  private apiUrl = 'https://web-production-bbbd2.up.railway.app/api/generate-travel-plan';

  constructor(
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router
  ) {}

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

  isNextButtonDisabled(): boolean {
    return this.selectedOptions.length === 0;
  }

  isTripDurationNextDisabled(): boolean {
    return this.selectedTripDuration === null;
  }

  isPlacesNextDisabled(): boolean {
    return this.selectedPlaces.length === 0;
  }

  isActivitiesNextDisabled(): boolean {
    return this.selectedActivities.length === 0;
  }

  isTravelTimeNextDisabled(): boolean {
    return this.selectedTravelTime.length === 0;
  }

  isBudgetNextDisabled(): boolean { 
    return this.selectedBudget.length === 0;
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
    this.showThirdQuestionSection = false;
    this.showFourthQuestionSection = false;
    this.showFifthQuestionSection = false;
    this.showSixthQuestionSection = false;
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

  toggleTripDurationSelection(option: string): void {
    this.selectedTripDuration = option;
    this.updateProgress();
  }

  togglePlacesSelection(option: string): void {
    const index = this.selectedPlaces.indexOf(option);
    index === -1 ? this.selectedPlaces.push(option) : this.selectedPlaces.splice(index, 1);
    this.updateProgress();
  }

  toggleActivitiesSelection(option: string): void {  
    const index = this.selectedActivities.indexOf(option);
    index === -1 ? this.selectedActivities.push(option) : this.selectedActivities.splice(index, 1);
    this.updateProgress();
  }

  toggleTravelTimeSelection(option: string): void {
    this.selectedTravelTime = option;
    this.updateProgress();
  }

  toggleBudgetSelection(option: string): void {
    this.selectedBudget = option;
    this.updateProgress();
  }

  private updateProgress(): void {
    let progress = 0;
    const totalConditions = 6;  
    if (this.selectedOptions.length > 0) progress += 1;
    if (this.selectedTripDuration) progress += 1;
    if (this.selectedPlaces.length > 0) progress += 1;
    if (this.selectedActivities.length > 0) progress += 1;
    if (this.selectedTravelTime) progress += 1;
    if (this.selectedBudget) progress += 1;
    
    this.progressValue = Math.round((progress / totalConditions) * 100);
  }

  nextQuestion(): void {
    if (this.showQuestionSection) {
      this.showQuestionSection = false;
      this.showSecondQuestionSection = true;
    } else if (this.showSecondQuestionSection) {
      this.showSecondQuestionSection = false;
      this.showThirdQuestionSection = true;
    } else if (this.showThirdQuestionSection) {
      this.showThirdQuestionSection = false;
      this.showFourthQuestionSection = true;
    } else if (this.showFourthQuestionSection) {
      this.showFourthQuestionSection = false;
      this.showFifthQuestionSection = true;
    } else if (this.showFifthQuestionSection) {
      this.showFifthQuestionSection = false;
      this.showSixthQuestionSection = true;
    } else if (this.showSixthQuestionSection) {
      this.finishQuiz();
    }
  }

  goBackToPreviousQuestion(): void {
    if (this.showSixthQuestionSection) {
      this.showSixthQuestionSection = false;
      this.showFifthQuestionSection = true;
    } else if (this.showFifthQuestionSection) {
      this.showFifthQuestionSection = false;
      this.showFourthQuestionSection = true;
    } else if (this.showFourthQuestionSection) {
      this.showFourthQuestionSection = false;
      this.showThirdQuestionSection = true;
    } else if (this.showThirdQuestionSection) {
      this.showThirdQuestionSection = false;
      this.showSecondQuestionSection = true;
    } else if (this.showSecondQuestionSection) {
      this.showSecondQuestionSection = false;
      this.showQuestionSection = true;
    } else if (this.showQuestionSection) {
      this.showQuestionSection = false;
      this.hideStartSection = false;
    }
  }

  finishQuiz(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.showSixthQuestionSection = false;
    this.showResultsSection = true;

    // Validate required fields
    if (!this.selectedOptions.length || !this.selectedTripDuration || 
        !this.selectedPlaces.length || !this.selectedActivities.length || 
        !this.selectedTravelTime || !this.selectedBudget) {
      this.errorMessage = 'Please complete all questions before submitting';
      this.isLoading = false;
      return;
    }

    const travelPlanData = {
      answers: {
        experiencesTypes: this.selectedOptions,
        numberOfDays: parseInt(this.selectedTripDuration.split(' ')[0]),
        places: this.selectedPlaces,
        activity: this.selectedActivities,
        season: this.selectedTravelTime,
        budget: this.formatBudget(this.selectedBudget)
      }
    };

    console.log('Sending travel plan data:', travelPlanData);

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'You need to be logged in to generate a travel plan';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post(this.apiUrl, travelPlanData, { headers }).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        
        if (!response || !response.travel_plan || !response.travel_plan.itinerary) {
          console.error('Invalid API response structure:', response);
          this.errorMessage = 'Invalid response from server. Please try again.';
          this.isLoading = false;
          return;
        }

        this.isLoading = false;
        // Navigate to personalized plan page with the response data
        this.router.navigate(['/personalized-plan'], { 
          state: { plan: response.travel_plan },
          queryParams: { plan: JSON.stringify(response.travel_plan) }
        });
      },
      error: (error) => {
        console.error('API Error:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to generate travel plan. Please try again.';
      }
    });
  }

  private formatBudget(budget: string): string {
    if (!budget) return '';
    
    const budgetMap: {[key: string]: string} = {
      'Less Than 1K': 'less-than-1k',
      '1.5K - 3.5K': '1.5k-3.5k',
      '3.5K - 6K': '3.5k-6k',
      'More Than 6K': 'more-than-6k'
    };
    
    return budgetMap[budget] || budget.toLowerCase().replace(/\s+/g, '-');
  }

  retry(): void {
    this.finishQuiz();
  }
}