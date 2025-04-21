import { userData } from './../../interfaces/user-data';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PackageDetails } from 'src/app/interfaces/package-details';
import { AgencyService } from 'src/app/services/agency.service';
import { BookingService } from 'src/app/services/booking.service';
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
              private _ReviewService:ReviewService,
              private _BookingService:BookingService,
              private _AgencyService:AgencyService){}


  egyptFlag:string= '/assets/img/egyptFlag.png';
  searchIcon:string = "/assets/icons/Search.png";
  profileImg: string = '/assets/img/default-profile.png';


  searchResults: any[] = [];  
  errorMessage: string = ''; 

  travelAgencyID: string = '';

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
            // console.log("reviews",this.reviewData);
            // console.log("Fetched package details:", this.packageDetails);
          }
        });
      }
    });

    this._AgencyService.getTravelAgencyData('GlobalTravel').subscribe({
      next:(res) =>{        
        this.travelAgencyID = res.travelAgencyId;        
      }
    })
  }

  bookData:any = {};

  selectedNationality: string = 'Nationality'; 
  selectedUserType: string = 'User'; 
  selectedBoard: string = ''; 
  reserveDate: string = '';
  numOfPeople: number = 0;
  selectedBookedDate: string = ''; 
  bookedPrice: number = 0; 

  updateNationality(nationality: string): void {
    this.selectedNationality = nationality;
    this.bookData.selectedNationality = nationality; 
    this.updateBookedPrice();
  }
  
  updateUserType(userType: string): void {
    this.selectedUserType = userType;
    this.bookData.selectedUserType = userType; 
    this.updateBookedPrice();
  }
  
  updateBoard(boardType: string): void {
    this.selectedBoard = boardType;
    this.bookData.selectedBoard = boardType;
  }

  updateBookedPrice(): void {
    if (!this.packageDetails) return;
  
    if (this.selectedNationality === 'Egyptian') {
      if (this.selectedUserType === 'Adult') {
        this.bookedPrice = this.packageDetails.egyptianAdult;
      } else {
        this.bookedPrice = this.packageDetails.egyptianStudent;
      }
    } else if (this.selectedNationality === 'Foreigner') {
      if (this.selectedUserType === 'Adult') {
        this.bookedPrice = this.packageDetails.touristAdult;
      } else {
        this.bookedPrice = this.packageDetails.touristStudent;
      }
    }

    this.bookedPrice = this.bookedPrice * this.bookData.numOfPeople;
    this.bookData.bookedPrice = this.bookedPrice;
  }
  
  

  bookTrip():void{
    
    if (!this.bookData.reserveDate || !this.bookData.selectedNationality || !this.bookData.selectedUserType || !this.selectedBoard || !this.bookData.numOfPeople) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Information',
        text: 'Please fill in all booking fields!',
      });
      return;
    }

    this.bookData.travelAgencyID = this.travelAgencyID;
    this.bookData.travelAgencyPlanID = this.packageDetails.planId;
    this.bookData.reserveType = this.selectedBoard;
    this.bookData.bookedPrice = this.bookedPrice;

    this._BookingService.bookTrip(this.bookData).subscribe({
      next: (res) => {
      Swal.fire({
          icon: 'success',
          title: 'Trip Booked Successfully!',
          text: 'Thanks for choosing us. Get ready for your adventure!',
      });

      this.resetData();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops! Something went wrong',
          text: 'Failed to book your trip. Please try again later.',
        });
        console.error('Booking failed:', err);
      }
    });

  }

  resetData(){
    this.bookData = {};
    this.selectedNationality = 'Nationality';
    this.selectedUserType = 'User';
    this.selectedBoard = '';
    this.reserveDate = '';
    this.numOfPeople = 0;
    this.selectedBookedDate = '';
    this.bookedPrice = 0;
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

}
