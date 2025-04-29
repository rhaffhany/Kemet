import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
    <div class="loading-overlay" *ngIf="show">
      <div class="loading-content">
        <img src="assets/icons/pyramids.gif" alt="Loading..." class="loading-gif">
        <h2>{{ currentMessage }}</h2>
        <div class="progress-wrapper">
          <div class="progress-bar">
            <div class="progress-fill" [style.width]="progress + '%'"></div>
          </div>
          <span class="progress-text">{{ progress }}%</span>
        </div>
      </div>
    </div>
  `
})
export class LoadingComponent implements OnInit {
  @Input() show: boolean = false;
  progress: number = 0;
  currentMessage: string = 'Creating Your Perfect Egyptian Journey';
  private messages: string[] = [
    'Creating Your Perfect Egyptian Journey',
    'Crafting Your Personalized Itinerary',
    'Adding Special Egyptian Experiences',
    'Finalizing Your Dream Trip'
  ];
  private currentIndex: number = 0;

  ngOnInit() {
    this.startProgress();
  }

  private startProgress() {
    const interval = setInterval(() => {
      if (this.progress < 100) {
        this.progress += 1;
        
        // Change message at specific progress points
        if (this.progress === 25) this.currentMessage = this.messages[1];
        if (this.progress === 50) this.currentMessage = this.messages[2];
        if (this.progress === 75) this.currentMessage = this.messages[3];
      } else {
        clearInterval(interval);
      }
    }, 50); // Adjust speed as needed
  }
}
