import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  // Plan data
  travelPlan: TravelDay[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  originalPlan: any;
  regeneratingItem: { dayIndex: number, type: 'place' | 'activity', itemIndex: number } | null = null;
  private apiUrl = 'https://web-production-bbbd2.up.railway.app/api/modify-travel-plan';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadTravelPlan();
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
      name: place.name || 'Historical Site',
      category: place.categoryName || 'Historical',
      description: place.description || 'Explore this amazing location',
      price: place.entryCost ? `${place.entryCost} LE` : 'Price varies',
      image: place.imageURLs || this.defaultImage,
      placeId: place.placeId
    };
  }
  
  private processActivity(activity: any): any {
    return {
      name: activity.name || 'Cultural Activity',
      category: activity.categoryName || 'Cultural',
      description: activity.description || 'Enjoy this unique experience',
      price: activity.entryCost ? `${activity.entryCost} LE` : 'Price varies',
      image: activity.imageURL || this.defaultImage,
      activityId: activity.activityId
    };
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
        // Update the original plan with the new version
        this.originalPlan = response.travel_plan;
        
        // Process the updated plan
        this.processApiResponse(response.travel_plan);
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

  navigateToPlace(placeId: number | undefined): void {
    if (placeId) {
      this.router.navigate(['/app-places', placeId]);
    }
  }

  navigateToActivity(activityId: number | undefined): void {
    if (activityId) {
      this.router.navigate(['/app-activities', activityId]);
    }
  }
}