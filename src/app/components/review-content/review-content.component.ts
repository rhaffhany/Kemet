import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityDetails } from 'src/app/interfaces/activity-details';
import { placeDetails } from 'src/app/interfaces/place-details';
import { DetailsService } from 'src/app/services/details.service';
import { ReviewService } from 'src/app/services/review.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-review-content',
  templateUrl: './review-content.component.html',
  styleUrls: ['./review-content.component.scss'],
  
})
export class ReviewContentComponent implements OnInit{

  placeDetails:placeDetails={} as placeDetails;
  placeID:any;
  activityDetails:ActivityDetails = {} as ActivityDetails;
  activityID:any;
  isPlaceReview:boolean = false;
  reviewData: any = {};

  constructor(private _ReviewService:ReviewService, private route:ActivatedRoute, private _DetailsService:DetailsService){}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if (params.has('placeID')) {
        this.placeID = params.get('placeID');
        this.isPlaceReview = true; 
        this._DetailsService.getDetailedPlace(this.placeID).subscribe(response => {
          this.placeDetails = response;
        });
      } else if (params.has('activityID')) {
        this.activityID = params.get('activityID');
        this.isPlaceReview = false; 
        this._DetailsService.getDetailedActivity(this.activityID).subscribe(response => {
          this.activityDetails = response;
        });
      }
    });

  }
  
  reviewText: string = '';
  reviewTitle: string = '';
  submissionDate:string='';
  isAdded:boolean = false;
  loading: boolean = false;

  
  submitReview(): void {
    //append formData
    const formData = new FormData();
    formData.append('rating', this.rating.toString());
    formData.append('date', this.selectedDate ? this.selectedDate.toString() : '');
    formData.append('visitorType', this.selectedOption);
    formData.append('comment', this.reviewText);
    formData.append('reviewTitle', this.reviewTitle);
    // if (this.selectedImage && this.selectedImage.length > 0) {
    //   for (let i = 0; i < this.selectedImage.length; i++) {
    //     formData.append('images', this.selectedImage[i]); 
    //   }
    // }

    if (!this.reviewTitle || !this.reviewText || !this.rating || !this.selectedDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Data',
        text: 'Please enter all required fields (Title, Review, Rating, and Date) before submitting!',
      });
      return;
    }

    let reviewData = {
      rating: this.rating,
      date: this.selectedDate,
      visitorType: this.selectedOption,
      comment: this.reviewText,
      reviewTitle: this.reviewTitle,
      // image: this.selectedImage,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // const reviewData = {
    //   rating: this.reviewData.rating,
    //   visitorType: this.selectedOption,
    //   reviewTitle: this.reviewTitle,
    //   comment: this.reviewData.comment,
    //   createdAt: new Date().toISOString().split('T')[0],
    //   date: this.selectedDate,
    //   images: this.selectedImage,
    // };

    if (!this.isAdded) return;
    this.loading = true;

    this._ReviewService.addReview(formData).subscribe({
      next:()=>{
        // const currentDate = new Date().toISOString().split('T')[0];
        // this._ReviewService.setSubmissionDate(currentDate); 
        Swal.fire({
          icon: 'success',
          title: 'Review Submitted!',
          text: 'Thanks for your feedback!',
        });
        this.clearData();
        this.loading = false;
        this.isAdded = false;
        this._ReviewService.setReviewData(reviewData);
        console.log("data set",reviewData);
      },
      error:(err) =>{
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'Something went wrong. Please try again later.',
        });
        this.loading = false;
      },complete:()=>{
        this.loading = false;
      }
    });
  }
  
  onReviewChange(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.isAdded = input.value.trim().length > 0; 
  }

  clearData(): void{
    this.rating = 0; 
    this.hoverRating = 0;
    this.selectedDate = null;
    this.selectedOption = '';
    this.reviewText = '';    
    this.reviewTitle = '';
    // this.selectedImage = '';
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }


  // selected options
  options: string[] = ['Business', 'Couples', 'Family', 'Solo'];
  selectedOption: string = '';

  selectOption(option: string): void {
    this.selectedOption = option;
  }

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
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    this.selectedDate = `${date.year}-${date.month}-${date.day}`;     
  }

  // review photos
  // selectedImage: string | null = null;

  // onFileSelected(event: Event) {
  //   const fileInput = event.target as HTMLInputElement;
  //   if (fileInput.files && fileInput.files.length > 0) {
  //     const file = fileInput.files[0]; 
  //     // Read file and set it as the selected image
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       this.selectedImage = e.target?.result as string;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }
  

}
