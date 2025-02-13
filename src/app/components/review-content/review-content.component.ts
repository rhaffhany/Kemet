import { Component } from '@angular/core';
import { placeDetails } from 'src/app/interfaces/place-details';

@Component({
  selector: 'app-review-content',
  templateUrl: './review-content.component.html',
  styleUrls: ['./review-content.component.scss']
})
export class ReviewContentComponent {
  placeDetails:placeDetails[]=[];

  // rating stars
  rating: number = 0; 
  hoverRating: number = 0;
  stars: number[] = [1, 2, 3, 4, 5]; 

  rate(value: number) {
    this.rating = value;
  }
  setHover(value: number) {
    this.hoverRating = value; 
  }
  clearHover() {
    this.hoverRating = 0; 
  }
  getMaxRating(index: number): boolean {
    return index < Math.max(this.rating, this.hoverRating);
  }

  // Date selection
  selectedDate: string | null = null;
  onDateSelect(date: any) {
    this.selectedDate = `${date.year}-${date.month}-${date.day}`; 
  }

  // review photos
  selectedImages:string[]=[];
  onFileSelected(event: any){
    if(event.target.files){
      Array.from(event.target.files).forEach((file:any)=>{
        const reader = new FileReader();
        reader.onload = (e:any)=>{
          this.selectedImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }
}
