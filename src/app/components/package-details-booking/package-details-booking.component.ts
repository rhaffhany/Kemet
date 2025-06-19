import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PackageDetails } from 'src/app/interfaces/package-details';
import { AgencyService } from 'src/app/services/agency.service';
import { BookingService } from 'src/app/services/booking.service';
import { DetailsService } from 'src/app/services/details.service';
import { PaymentService } from 'src/app/services/payment.service';
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
              private _AgencyService:AgencyService,
              private _ToastrService: ToastrService,
              private _PaymentService:PaymentService,
              private _Router:Router){}

  egyptFlag:string= '/assets/img/egyptFlag.png';
  searchIcon:string = "/assets/icons/Search.png";
  profileImg: string = '/assets/img/default-profile.png';


  travelAgencyData:any = {};
  travelAgencyID: string = '';

  packageDetails:PackageDetails = {} as PackageDetails;
  planID:any;

  reviewData:any[] = [];
  updatedReviewData:any[] = [...this.reviewData];
  filteredReviews:any[] = [];

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next:(params)=>{
        this.planID = params.get('planID'); 

        this._DetailsService.getDetaliedPlan(this.planID).subscribe({
          next: (response)=>{
            this.packageDetails = response;

            this._AgencyService.getTravelAgencyData(response.travelAgencyName).subscribe({
              next:(res) =>{        
                this.travelAgencyData = res;
                this.travelAgencyID = res.travelAgencyId;       
              }
            });
           
            this.packageDetails.averageRating = Math.round(this.packageDetails.averageRating * 10) / 10;
            this.reviewData = this.packageDetails.reviews.$values;
            this.filteredReviews = [...this.reviewData];
            this.planID = response.planId;
          }
        });
      }
    });

  }

  bookData:any = {};
  bookingID:number = 0;

  selectedNationality: string = 'Nationality'; 
  selectedUserType: string = 'User'; 
  selectedBoard: string = ''; 
  reserveDate: string = '';
  numOfPeople:number = 0;
  selectedBookedDate: string = ''; 
  bookedPrice: number = 0;
  fullBookedPrice:number = 0;

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
    this.updateBookedPrice();
  }

  updateBookedPrice(): void {
    if (!this.packageDetails) return;
  
    // Calculate base price without board
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

    // Calculate board price addition
    let boardPriceAddition = 0;
    if (this.selectedBoard === 'Half Board') {
      boardPriceAddition = this.packageDetails.HalfBoardPriceAddittion;
    } else if (this.selectedBoard === 'Full Board') {
      boardPriceAddition = this.packageDetails.fullBoardPriceAddition;
    }

    // Calculate total price per person including board
    this.bookedPrice = this.bookedPrice ;
    
    // Calculate total price for all people
    this.fullBookedPrice = this.bookedPrice * this.bookData.numOfPeople + boardPriceAddition;
    
    // Update bookData with the calculated prices
    this.bookData.bookedPrice = this.bookedPrice;
    this.bookData.fullBookedPrice = this.fullBookedPrice;
  }
  
  bookTrip():void{
    
    if (!this.bookData.reserveDate || !this.bookData.selectedNationality || !this.bookData.selectedUserType || !this.selectedBoard || !this.bookData.numOfPeople) {
      this._ToastrService.warning('Please fill in all booking fields!','Incomplete Information')
      return;
    }

    this.bookData.travelAgencyID = this.travelAgencyID;
    this.bookData.travelAgencyPlanID = this.packageDetails.planId;
    this.bookData.reserveType = this.selectedBoard;
    this.bookData.bookedPrice = this.bookedPrice;
    this.bookData.fullBookedPrice = this.fullBookedPrice;
    this.bookData.selectedNationality = this.selectedNationality;
    this.bookData.selectedUserType = this.selectedUserType;

    this._BookingService.bookTrip(this.bookData).subscribe({
      next: (res) => {
      this.bookingID = res.bookingId;      
      
      console.log(this.bookData);
      console.log("booking response",res);
      
      this._ToastrService.success('Thanks for choosing us. Get ready for your adventure!', res.message);
      this._Router.navigate(['/payment', this.bookingID, this.planID]);
      this.resetData();
      
      },
      error: (err) => {
        this._ToastrService.error('Failed to book your trip. Please try again later.','Oops! Something went wrong');
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

  options: string[] = ['Business', 'Couples', 'Family', 'Solo'];
  selectedOption: string = '';

  selectOption(option: string): void {
    this.selectedOption = option;
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
        formData.append('Date', this.selectedDate.toString());
        formData.append('comment', this.reviewText);
        formData.append('VisitorType', this.selectedOption);
        formData.append('ReviewTitle', this.reviewTitle);
        formData.append('TravelAgencyPlanId', this.planID);
        // formData.append('Image', this.image);
        // formData.append('createdAt', currentDate);

        if (!this.isAdded) return;
        this.loading = true;
    
        this._ReviewService.addReview(formData).subscribe({
          next:(data)=>{
            Swal.fire({
              icon: 'success',
              title: 'Review Submitted!',
              text: 'Thanks for your feedback!',
            }).then(() => {
              setTimeout(() => {
                location.reload(); 
              }, 3000); 
            });

            this.clearData();
            this.loading = false;
            this.isAdded = false;

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
            this.showModal = false;
          }
        });
  }
  
   //reviews filters
   toggleFilterOptions:boolean = false;

   sortByMostRecent() {
     this.reviewData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
   }
 
   filterByRating(order: 'high' | 'low') {
     this.reviewData.sort((a, b) => {
       return order === 'high' ? b.rating - a.rating : a.rating - b.rating;
     });
   }
   resetFilters() {
     return this.reviewData = [...this.filteredReviews];
   }
 
   //search 
   searchText: string = ''; 
   searchResults: any[] = [];
   errorMessage: string = ''; 
 
   onSearch() {
     const query = this.searchText.trim().toLowerCase();
   
     if (query === '') {
       this.searchResults = [];
       this.errorMessage = '';
       return;
     }
   
     this.searchResults = this.reviewData.filter(review =>
       Object.values(review).some(value =>
         value && value.toString().toLowerCase().includes(query)
       )
     );
   
     this.errorMessage = this.searchResults.length === 0 ? 'No results found.' : '';
   }

}
