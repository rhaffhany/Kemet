import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag } from '@angular/cdk/drag-drop';
import Swal from 'sweetalert2';

interface TravelDay {
  dayNumber: number;
  location: string;
  places: {
    name: string;
    category: string;
    description: string;
    price: string;
    image: string;
    placeId?: number;
  }[];
  activities: {
    name: string;
    category: string;
    description: string;
    price: string;
    image: string;
    activityId?: number;
  }[];
}

@Component({
  selector: 'app-personalized-plan',
  templateUrl: './personalized-plan.component.html',
  styleUrls: ['./personalized-plan.component.scss']
})
export class PersonalizedPlanComponent implements OnInit {
  // Default images
  egyptBanner = 'assets/img/Egypt.jpg';
  locationIcon = 'assets/icons/Location.png';
  regenerateIcon = 'assets/icons/regenerate.png';
  defaultImage = 'assets/img/Egypt3.jpg';
  logoPath = 'assets/logo/kemet.png';
  
  // Plan data and state
  travelPlan: TravelDay[] = [];
  currentDayIndex = 0;
  isLoading = true;
  errorMessage: string | null = null;
  originalPlan: any;
  regeneratingItem: { dayIndex: number, type: 'place' | 'activity', itemIndex: number } | null = null;
  isEditMode = false;
  selectedDayIndex: number | null = null;
  alternativeDays: TravelDay[] = [];
  isLoadingAlternatives = false;
  firstRowDays: any[] = [];
  secondRowDays: any[] = [];

  private apiUrl = 'https://web-production-bbbd2.up.railway.app/api/modify-travel-plan';
  private alternativesApiUrl = 'https://web-production-bbbd2.up.railway.app/api/generate-alternatives';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private elementRef: ElementRef
  ) {}
  shouldHandleElement(element: HTMLElement): boolean {
    // Don't handle if the element is part of a place or activity card
    return !element.closest('.place-card') && !element.closest('.activity-card');
  }

  // Updated reorderDays method
  reorderDays(event: CdkDragDrop<TravelDay[]>) {
    if (!this.isEditMode) return;
    
    // Store original width before drag starts
    const dayElement = event.item.element.nativeElement as HTMLElement;
    dayElement.style.setProperty('--original-width', `${dayElement.offsetWidth}px`);
    
    moveItemInArray(this.travelPlan, event.previousIndex, event.currentIndex);
    this.updateDayNumbers();
    this.splitDaysIntoRows();
    
    // Add visual feedback
    const element = event.item.element.nativeElement;
    element.classList.add('dropped');
    setTimeout(() => {
      element.classList.remove('dropped');
    }, 300);
  }

  // Updated onItemDrop method for place/activity cards
  onItemDrop(event: CdkDragDrop<any[]>, type: 'places' | 'activities') {
    if (!this.isEditMode) return;
    
    // Prevent event from bubbling up to day drag handler
    event.event.stopPropagation();
    
    // Find the source and target days by container ID
    const sourceDayNumber = this.extractDayNumberFromId(event.previousContainer.id);
    const targetDayNumber = this.extractDayNumberFromId(event.container.id);
    
    const sourceDay = this.travelPlan.find(day => day.dayNumber === sourceDayNumber);
    const targetDay = this.travelPlan.find(day => day.dayNumber === targetDayNumber);
  
    // Check if locations are different
    if (sourceDay && targetDay && sourceDay.location !== targetDay.location) {
      // Cancel the drop operation if locations don't match
      event.item.dropContainer = event.previousContainer;
      event.item.reset();
      
      // Show warning
      Swal.fire({
        title: 'Cannot Move Item',
        text: 'Items can only be moved within the same city.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      
      return;
    }
  
    // If locations are the same or we're moving within the same container, proceed with the exchange
    if (event.previousContainer === event.container) {
      // Same container, just reorder
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
      // Add visual feedback
      const element = event.item.element.nativeElement;
      element.classList.add('dropped');
      setTimeout(() => {
        element.classList.remove('dropped');
      }, 300);
      
      return;
    }
  
    // Different containers but same location, perform the exchange
    const sourceArray = event.previousContainer.data;
    const targetArray = event.container.data;
    
    // Get source item
    const sourceItem = sourceArray[event.previousIndex];
    
    // If target has an item, perform exchange
    if (targetArray.length > 0) {
      const targetItem = targetArray[0];
      
      // Clear both arrays
      sourceArray.length = 0;
      targetArray.length = 0;
      
      // Exchange items
      sourceArray.push(targetItem);
      targetArray.push(sourceItem);
  
      // Add visual feedback for both items
      setTimeout(() => {
        const sourceElement = event.previousContainer.element.nativeElement.querySelector('.place-card, .activity-card');
        const targetElement = event.container.element.nativeElement.querySelector('.place-card, .activity-card');
        
        if (sourceElement) {
          sourceElement.classList.add('dropped');
          setTimeout(() => sourceElement.classList.remove('dropped'), 300);
        }
        
        if (targetElement) {
          targetElement.classList.add('dropped');
          setTimeout(() => targetElement.classList.remove('dropped'), 300);
        }
      });
    } else {
      // Target is empty, just move the item
      transferArrayItem(
        sourceArray,
        targetArray,
        event.previousIndex,
        0
      );
      
      // Add visual feedback
      const element = event.item.element.nativeElement;
      element.classList.add('dropped');
      setTimeout(() => {
        element.classList.remove('dropped');
      }, 300);
    }
  }
  
  // All other existing methods remain the same
  
  // Helper method to extract day number from container ID
  private extractDayNumberFromId(id: string): number {
    const match = id.match(/-(list-)?(\d+)$/);
    return match ? parseInt(match[2], 10) : 0;
  }

  ngOnInit() {
    this.loadTravelPlan();
    this.splitDaysIntoRows();
  }

  private splitDaysIntoRows() {
    const halfLength = Math.ceil(this.travelPlan.length / 2);
    this.firstRowDays = this.travelPlan.slice(0, halfLength);
    this.secondRowDays = this.travelPlan.slice(halfLength);
  }

  // When days are updated, make sure to call splitDaysIntoRows()
  updateDays(days: any[]) {
    this.travelPlan = days;
    this.splitDaysIntoRows();
  }
  async toggleEditMode() {
    if (!this.isEditMode) {
      const result = await Swal.fire({
        title: 'Ready to Personalize Your Trip?',
        html: `
          <div style="text-align: left; font-size: 16px; line-height: 1.5">
            <p style=" color: #666; Font-size:18px; ">Customize your trip the way you want!</p>
            <div style="margin: 15px 0;">
              <div style="margin-bottom: 10px;">• Rearrange days by dragging them into your preferred order</div>
              <div style="margin-bottom: 10px;">• Move items within the same city</div>
              <div style="margin-bottom: 10px;">• Swap items between different days within the same city</div>
              <div>• Regenerate any item for a fresh recommendation</div>
            </div>
  
            <p style="Font-size:18px; color: #666; margin-top: 20px;">Important Notes:</p>
            <div style="color: #666;">
              <div style="margin-bottom: 8px;">• Items cannot be moved between different cities</div>
            </div>
          </div>
        `,
        icon: 'info',
        confirmButtonText: "Ready",
        showCancelButton: true,
        cancelButtonText: 'Not Now',
        confirmButtonColor: '#3085d6',
        customClass: {
          popup: 'custom-swal-popup'
        }
      });
  
      if (!result.isConfirmed) {
        return;
      }
    }
    
    this.isEditMode = !this.isEditMode;
  
    if (!this.isEditMode) {
      this.selectedDayIndex = null;
      this.alternativeDays = [];
    }
  }

// Update your getDragPreviewClass method
getDragPreviewClass(item: any): string {
  // Make this return more specific classes for appropriate styling
  return item.category 
    ? `styled-preview ${item.category.toLowerCase().replace(/\s+/g, '-')}`
    : 'styled-preview';
}

reorderItems(event: CdkDragDrop<any[]>, items: any[]) {
  if (!this.isEditMode) return;
  
  if (event.previousContainer === event.container) {
    // Store the original width before moving
    const itemElement = event.item.element.nativeElement as HTMLElement;
    const originalWidth = itemElement.offsetWidth;
    
    // Apply the width to the preview
    const previewElement = document.querySelector('.cdk-drag-preview') as HTMLElement;
    if (previewElement) {
      previewElement.style.width = `${originalWidth}px`;
    }
    
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    
    // Add visual feedback
    const element = event.item.element.nativeElement;
    element.classList.add('dropped');
    setTimeout(() => {
      element.classList.remove('dropped');
    }, 300);
  }
}


  replaceDay(alternativeDay: TravelDay) {
    if (this.selectedDayIndex === null) return;
    
    // Keep the original day number
    const originalDayNumber = this.travelPlan[this.selectedDayIndex].dayNumber;
    alternativeDay.dayNumber = originalDayNumber;
    
    // Replace the day in the travel plan
    this.travelPlan[this.selectedDayIndex] = alternativeDay;
    
    // Reset selection
    this.selectedDayIndex = null;
    this.alternativeDays = [];
  }

  private loadTravelPlan(): void {
    const navigation = this.router.getCurrentNavigation();
    let planData = navigation?.extras.state?.['plan'];
    
    if (!planData) {
      const planParam = this.route.snapshot.queryParamMap.get('plan');
      if (planParam) {
        try {
          planData = JSON.parse(planParam);
        } catch (e) {
          console.error('Error parsing plan data from query params:', e);
        }
      }
    }
    
    if (!planData) {
      this.handleError('No travel plan data received from the server.');
      return;
    }

    if (!planData.itinerary) {
      console.error('Invalid plan data structure:', planData);
      this.handleError('Invalid travel plan data structure received.');
      return;
    }

    try {
      this.originalPlan = planData;
      this.processApiResponse(planData);
      this.splitDaysIntoRows(); // Add this line to split days after loading
      this.isLoading = false;
    } catch (error) {
      console.error('Error processing plan data:', error);
      this.handleError('Failed to process travel plan data.');
    }
  }

  private processApiResponse(apiData: any): void {
    if (!apiData.itinerary || !apiData.itinerary.days || !Array.isArray(apiData.itinerary.days)) {
      throw new Error('Invalid itinerary data structure');
    }
  
    this.travelPlan = apiData.itinerary.days.map((dayObj: any, index: number) => {
      const dayKey = Object.keys(dayObj)[0];
      const dayData = dayObj[dayKey];
      
      return {
        dayNumber: index + 1,
        location: this.getLocationFromAddress(dayData.place?.address || 'Cairo, Egypt'),
        places: dayData.place ? [this.processPlace(dayData.place)] : [],
        activities: dayData.activity ? [this.processActivity(dayData.activity)] : []
      };
    });
  }
  
  private getLocationFromAddress(address: string): string {
    if (address.includes('Cairo')) return 'Cairo, Egypt';
    if (address.includes('Giza')) return 'Giza, Egypt';
    if (address.includes('Luxor')) return 'Luxor, Egypt';
    if (address.includes('Aswan')) return 'Aswan, Egypt';
    return address.split(',')[0] || 'Egypt';
  }
  
  private processPlace(place: any): any {
    return {
      name: place.name || 'Unknown Place',
      category: place.categoryName || 'General',
      description: place.description || 'No description available',
      price: place.entryCost,
      image: place.imageURLs || this.defaultImage,
      placeId: place.placeId
    };
  }
  
  private processActivity(activity: any): any {
    return {
      name: activity.name || 'Unknown Activity',
      category: activity.categoryName || 'General',
      description: activity.description || 'No description available',
      price: activity.entryCost,
      image: activity.imageURL || this.defaultImage,
      activityId: activity.activityId
    };
  }

  setCurrentDay(index: number): void {
    this.currentDayIndex = index;
  }


  async regenerateItem(dayIndex: number, type: 'place' | 'activity', itemIndex: number): Promise<void> {
    const day = this.travelPlan[dayIndex];
    const dayNumber = day.dayNumber;
    const category = type === 'place' 
      ? day.places[itemIndex].category 
      : day.activities[itemIndex].category;

    try {
      this.regeneratingItem = { dayIndex, type, itemIndex };
      
      const requestData = {
        original_plan: {
          travel_plan: this.originalPlan
        },
        modification_type: type,
        day_number: dayNumber,
        preferences: {
          categoryName: category
        }
      };

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const response: any = await this.http.post(this.apiUrl, requestData, { headers }).toPromise();
      
      if (response?.travel_plan?.itinerary) {
        this.originalPlan = response.travel_plan;
        this.processApiResponse(response.travel_plan);
        // Keep viewing the same day after regeneration
        this.currentDayIndex = dayIndex;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error regenerating item:', error);
      this.errorMessage = 'Failed to regenerate item. Please try again.';
    } finally {
      this.regeneratingItem = null;
    }
  }

  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
    console.error(message);
  }

  printAsPDF(): void {
    window.print();
  }

  generateNewPlan(): void {
    this.router.navigate(['/plan']);
  }

  getCategoryClass(category: string): string {
    return category.toLowerCase().replace(/\s+/g, '-');
  }

  isRegenerating(dayIndex: number, type: 'place' | 'activity', itemIndex: number): boolean {
    return this.regeneratingItem?.dayIndex === dayIndex && 
           this.regeneratingItem?.type === type && 
           this.regeneratingItem?.itemIndex === itemIndex;
  }

  updateDayNumbers() {
    this.travelPlan.forEach((day, index) => {
      day.dayNumber = index + 1;
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    if (!this.isEditMode) return;
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }

  onDayDrop(event: CdkDragDrop<TravelDay[]>) {
    if (!this.isEditMode) return;
    
    if (event.previousContainer === event.container) {
      // Moving within the same row
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving between rows
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    
    // Update the full travel plan array
    this.travelPlan = [...this.firstRowDays, ...this.secondRowDays];
    this.updateDayNumbers();
    this.splitDaysIntoRows();
  }

  // Navigation methods
  navigateToPlace(placeId: number | undefined): void {
    if (placeId && !this.isEditMode) {
      this.router.navigate(['/app-places', placeId]);
    }
  }

  navigateToActivity(activityId: number | undefined): void {
    if (activityId && !this.isEditMode) {
      this.router.navigate(['/app-activities', activityId]);
    }
  }

  getConnectedPlacesLists(currentDay: any): string[] {
    return this.travelPlan
      .filter(day => day.location === currentDay.location && day.dayNumber !== currentDay.dayNumber)
      .map(day => 'places-list-' + day.dayNumber);
  }

  getConnectedActivitiesLists(currentDay: any): string[] {
    return this.travelPlan
      .filter(day => day.location === currentDay.location && day.dayNumber !== currentDay.dayNumber)
      .map(day => 'activities-list-' + day.dayNumber);
  }

  isPriceZero(price: any): boolean {
    return parseFloat(price) === 0;
  }

 
  

}