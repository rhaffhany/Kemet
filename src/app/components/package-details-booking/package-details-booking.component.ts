import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PackageDetails } from 'src/app/interfaces/package-details';
import { DetailsService } from 'src/app/services/details.service';
import { ReviewService } from 'src/app/services/review.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-package-details-booking',
  templateUrl: './package-details-booking.component.html',
  styleUrls: ['./package-details-booking.component.scss']
})
export class PackageDetailsBookingComponent implements OnInit{

  constructor(private _ActivatedRoute:ActivatedRoute, 
              private _DetailsService:DetailsService,
              private _ReviewService:ReviewService){}


  egyptFlag:string= '/assets/img/egyptFlag.png';
  searchIcon:string = "/assets/icons/Search.png";
  profileImg: string = 'assets/img/default-profile.png';


  searchResults: any[] = [];  
  errorMessage: string = ''; 

  packageDetails:PackageDetails = {} as PackageDetails;
  planID:any;

  reviewData:any[] = [];

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next:(params)=>{
        this.planID = params.get('planID'); 

        this._DetailsService.getDetaliedPlan(this.planID).subscribe({
          next: (response)=>{
            this.packageDetails = response;
            this.packageDetails.averageRating = Math.round(this.packageDetails.averageRating * 10) / 10;
            this.reviewData = this.packageDetails.reviews.$values;
            console.log("reviews",this.reviewData);
            
            console.log("Fetched package details:", this.packageDetails);
          }
        });
      }
    });



  }

  showModal: boolean = false;
  rating: number = 0; 
  hoverRating: number = 0;
  selectedDate: string  = '';
  reviewText: string = '';
  reviewTitle: string = '';
  isAdded: boolean = false;
  loading: boolean = false;

  stars = Array(5).fill(0);

  openModal() {
    this.showModal = true;
  }

  closeModal(event: Event) {
    this.showModal = false;
  }

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
  

  onDateSelect(date: any) {
    if (date && date.year && date.month && date.day) {
        const month = date.month.toString().padStart(2, '0');
        const day = date.day.toString().padStart(2, '0');
        this.selectedDate = `${date.year}-${month}-${day}`;
    }
  }

  clearData(): void{
    this.rating = 0; 
    this.hoverRating = 0;
    this.selectedDate = '';
    this.reviewText = '';    
    this.reviewTitle = '';
  }

  onReviewChange(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.isAdded = input.value.trim().length > 0; 
  }

  submitReview():void {
     if (!this.reviewTitle || !this.reviewText || !this.rating || !this.selectedDate) {
          Swal.fire({
            icon: 'warning',
            title: 'Incomplete Data',
            text: 'Please enter all required fields before submitting!',
          });
          return;
        }
    
        let currentDate:string = '' ;
        this._ReviewService.setSubmissionDate(currentDate);
      
        //append formData
        const formData = new FormData();
        formData.append('rating', this.rating.toString());
        formData.append('date', this.selectedDate.toString());
        formData.append('comment', this.reviewText);
        formData.append('reviewTitle', this.reviewTitle);
        formData.append('createdAt', currentDate);

        if (!this.isAdded) return;
        this.loading = true;
    
        this._ReviewService.addReview(formData).subscribe({
          next:(data)=>{
            Swal.fire({
              icon: 'success',
              title: 'Review Submitted!',
              text: 'Thanks for your feedback!',
            });
            this.clearData();
            this.loading = false;
            this.isAdded = false;

            console.log("review data:",data);              
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
    setTimeout(() => {
      this.loading = false;
      this.isAdded = true;
      this.showModal = false;
    }, 2000);
  }


  selectedNationality = 'Nationality';
  selectedUserType = 'User';
  selectedBoard = '';

  updateNationality(value: string) {
    this.selectedNationality = value;
  }
  updateUserType(value: string) {
    this.selectedUserType = value;
  }
  updateBoard(value: string) {
    this.selectedBoard = value;
  }


}
