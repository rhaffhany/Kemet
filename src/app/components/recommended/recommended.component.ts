import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-recommended',
  templateUrl: './recommended.component.html',
  styleUrls: ['./recommended.component.scss']
})
export class RecommendedComponent {
  leftArrowSrc: string = '../../../assets/icons/arrow-left-circle.svg';
  rightArrowSrc: string = '../../../assets/icons/arrow-right-circle.svg';

  activities = [
    { name: '', description: '', imageURLs: [''] },
  ];

  currentIndex = 0;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchActivities();  
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.activities.length - 1;
    }
  }

  nextSlide() {
    if (this.currentIndex < this.activities.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  fetchActivities() {
    this.http.get<any[]>('https://localhost:7051/api/Places') 
      .subscribe(
        data => {
          this.activities = data;
        },
        error => {
          console.error('Error fetching data:', error);
        }
      );
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/default-image.jpg';
  }
}
