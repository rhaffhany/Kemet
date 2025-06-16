import { Component, OnInit } from '@angular/core';
import { InterestsService } from '../../services/interests.service';
import { Router } from '@angular/router';

interface Interest {
  id: number;
  name: string;
  type: 'Place' | 'Activity';
}

@Component({
  selector: 'app-interests-form',
  templateUrl: './interests-form.component.html',
  styleUrls: ['./interests-form.component.scss']
})
export class InterestsFormComponent implements OnInit {
  showForm$ = this.interestsService.showInterestsForm$;
  
  availableInterests: Interest[] = [
    { id: 1, name: 'Historical', type: 'Place' },
    { id: 2, name: 'Resorts and Beaches', type: 'Place' },
    { id: 3, name: 'Nature Spots', type: 'Place' },
    { id: 4, name: 'Museums', type: 'Place' },
    { id: 5, name: 'Religious', type: 'Place' },
    { id: 6, name: 'Nile River Destinations', type: 'Place' },
    { id: 7, name: 'Desert Landscape', type: 'Place' },
    { id: 8, name: 'Entertainment', type: 'Place' },
    { id: 19, name: 'Hidden Gems', type: 'Place' },
    { id: 9, name: 'Diving Snorkeling', type: 'Activity' },
    { id: 10, name: 'Hiking', type: 'Activity' },
    { id: 11, name: 'Water Sports and Nile Activities', type: 'Activity' },
    { id: 12, name: 'Cultural Experience', type: 'Activity' },
    { id: 13, name: 'Adventure Activity', type: 'Activity' },
    { id: 14, name: 'Relaxation and Wellness', type: 'Activity' },
    { id: 15, name: 'Entertainment', type: 'Activity' },
    { id: 16, name: 'Safari', type: 'Activity' },
    { id: 17, name: 'Fancy Cafe', type: 'Activity' },
    { id: 18, name: 'Fancy Restaurant', type: 'Activity' },
    { id: 20, name: 'Hidden Gems', type: 'Activity' }
  ];

  selectedInterests: number[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private interestsService: InterestsService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load user's interests when form is shown
    this.showForm$.subscribe(shown => {
      if (shown) {
        this.loadUserInterests();
      }
    });
  }

  loadUserInterests() {
    this.isLoading = true;
    this.error = null;

    this.interestsService.getUserInterests().subscribe({
      next: (response: { $values: number[] }) => {
        this.selectedInterests = response.$values || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading interests:', err);
        this.error = 'Failed to load your interests. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getPlaces(): Interest[] {
    return this.availableInterests.filter(interest => interest.type === 'Place');
  }

  getActivities(): Interest[] {
    return this.availableInterests.filter(interest => interest.type === 'Activity');
  }

  toggleInterest(interestId: number) {
    const index = this.selectedInterests.indexOf(interestId);
    if (index === -1) {
      this.selectedInterests.push(interestId);
    } else {
      this.selectedInterests.splice(index, 1);
    }
  }

  isSelected(interestId: number): boolean {
    return this.selectedInterests.includes(interestId);
  }

  onNext() {
    // Check if at least one place and one activity are selected
    const selectedPlaces = this.selectedInterests.filter(id => 
      this.availableInterests.find(interest => interest.id === id && interest.type === 'Place')
    );
    const selectedActivities = this.selectedInterests.filter(id => 
      this.availableInterests.find(interest => interest.id === id && interest.type === 'Activity')
    );

    if (selectedPlaces.length === 0 || selectedActivities.length === 0) {
      this.error = 'Please select at least one place and one activity';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.interestsService.setSelectedInterests(this.selectedInterests).subscribe({
      next: () => {
        this.isLoading = false;
        this.interestsService.hideInterestsForm();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error saving interests:', err);
        
        if (err.message === 'Your session has expired. Please log in again.') {
          this.error = 'Your session has expired. Please log in again.';
          // Redirect to login after a short delay
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error = 'Failed to save interests. Please try again.';
        }
      }
    });
  }

  onSkip() {
    this.interestsService.hideInterestsForm();
  }
}
