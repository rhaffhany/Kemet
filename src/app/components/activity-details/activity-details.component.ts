import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActivityDetails } from 'src/app/interfaces/activity-details';
import { DetailsService } from 'src/app/services/details.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss']
})
export class ActivityDetailsComponent {

  blackDot:string = "/assets/icons/Ellipse 148.svg";
  ticket:string = "/assets/icons/Ticket.svg"
  searchIcon:string = "/assets/icons/Search.png"
  profilePic:string = "/assets/icons/profile-pic.svg"
  notFoundImg:string = "/assets/img/not found.jpg";

  searchResults: any[] = [];  
  errorMessage: string = ''; 

  userData:any = {};
  updatedData:any = {...this.userData};

  activityID:any;
  activityDetails: ActivityDetails = {} as ActivityDetails;

  reviewsData:any[] =[];
  updatedReviewData:any[] = [...this.reviewsData];


  constructor(private _DetailsService:DetailsService, private _ActivatedRoute:ActivatedRoute, private _ProfileService:ProfileService ){}

  ngOnInit(): void {

    this._ActivatedRoute.paramMap.subscribe({
      next:(params)=>{
        this.activityID = params.get('activityID');
      }
    });

    if (this.activityID) {
      this._DetailsService.getDetailedActivity(this.activityID).subscribe({
        next: (response) => {
          this.activityDetails = response;
          this.reviewsData = response.reviews.$values;
          this.activityDetails.averageRating = Math.round(this.activityDetails.averageRating * 10) / 10;
        },
        error: (err) => {
          console.error(err);
        },
      });
    }

    this._ProfileService.getCurrentUserData().subscribe({
      next:(data)=>{
        this.userData = data;
        this.updatedData = { ...this.userData };

        if (!this.userData.profileImageURL) {
          this.profilePic;
        }else{
          this.profilePic = this.userData.profileImageURL;
        }
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      },

    });
  
  }

  deleteReview(reviewId: number) {
    if (confirm("Are you sure you want to delete this review?")) {
      this._DetailsService.getDetailedActivity(this.activityID).subscribe({
        next: (response) => {
          this.reviewsData = response.reviews.$values[0].activity.reviews.$values;
          this.updatedReviewData = this.reviewsData.filter(
            (review: any) => review.$id !== reviewId
          );
          // const updatedPlace = { ...response, reviews: { $values: this.updatedReviewData } };

          console.log("reviews of this place after delete:",this.updatedReviewData);
        },
        error: (err) => {
          console.error(err);
        }
      });

      this._DetailsService.getDetailedActivity(this.activityID).subscribe({
        next: () => {
          this.reviewsData = this.updatedReviewData;
          console.log("Review deleted successfully!");
        },
        error: (err) => {
          console.error("Error updating place:", err);
        },
      });
      
    }
  }
   
  uploadProfileImg(event:any){
    const file = event.target.files[0];
    if (!file) {
      console.error('No file selected!');
      return;
    }
    const formData:FormData = new FormData();
    formData.append('ProfileImage',file);

    this._ProfileService.uploadProfileImg(formData).subscribe({
      next:(response)=>{
        console.log(response);
        this.profilePic = `https://localhost:7051/${response.filePath}`;
      },
      error:(err)=>{
        console.error('Upload Error:', err);
      }
    });
  }


  updateLargeImage(index: number): void {
    const largeImage = document.querySelector('.carousel-inner .carousel-item img') as HTMLImageElement;
    largeImage.src = this.activityDetails.imageURLs.$values[index];
  }

  carouselOptions = {
    loop: true,
    margin: 10,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    navText: ['<', '>'],
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      1000: { items: 3 }
    },
    nav: true
  };

}
