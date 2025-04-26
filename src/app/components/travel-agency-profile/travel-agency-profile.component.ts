import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { HomeService } from 'src/app/services/home.service';
import { PackageDetails } from 'src/app/interfaces/package-details';
import { AgencyService } from 'src/app/services/agency.service';
import { ReviewService } from 'src/app/services/review.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-travel-agency-profile',
  templateUrl: './travel-agency-profile.component.html',
  styleUrls: ['./travel-agency-profile.component.scss']
})
export class TravelAgencyProfileComponent implements OnInit {

  constructor(private _ReviewService:ReviewService,
              private _HomeService:HomeService,
              private _AgencyService:AgencyService,
              private _ActivatedRoute:ActivatedRoute){}
  
  layoutPic:string = "/assets/img/agency-background.png";
  profileImg: string = '/assets/img/default-profile.png';
  travelpp:string = '/assets/img/Agency pp.png'
  user:string = "@";

  //icons
  locationIcon:string = "/assets/icons/Location.png";
  calendarIcon:string = "/assets/icons/Calendar.png";
  websiteIcon:string = "/assets/icons/Discovery.png";
  bioIcon:string = "/assets/icons/Edit.png"
  chatIcon:string = "/assets/icons/Chat.png";
  heartIcon:string = "/assets/icons/Heart.png";
  sendIcon:string = "/assets/icons/Send.png";
  lockIcon:string = "/assets/icons/Lock.png";
  editIcon:string = "/assets/icons/Edit Square.png";
  searchIcon:string = "/assets/icons/Search.png"

  packageDetails:PackageDetails = {} as PackageDetails;
  planID:any;
  
  packages: any[] = []; 

  travelAgencyData:any = {};
  travelAgencyId:any;

  reviews:any[] = [];
  updatedReviewData:any[] = [...this.reviews];
  filteredReviews:any[] = [];

  ngOnInit(): void {

    this.loadPackages();

    this._AgencyService.getTravelAgencyData('GlobalTravel').subscribe({
      next: (data) => {
        this.travelAgencyData = data;
        this.reviews = data.reviews.$values;
        this.filteredReviews = [...this.reviews];
        this.travelAgencyId = data.travelAgencyId;
      },
      error: (err) => {
        console.error('Error fetching travel agency data:', err);
      }
    });

  }


  loadPackages(): void {
    this._HomeService.fetchTravelAgencyPlan().subscribe((data: any) => {
      this.packages = data.$values;
    });
  }

  images = [
    '/assets/img/agency1.jpg',
    '/assets/img/agency2.jpg',
    '/assets/img/agency3.jpg',
    '/assets/img/agency4.jpg',
    '/assets/img/agency5.jpg',
    '/assets/img/agency6.jpg',
    '/assets/img/agency8.jpg',
    '/assets/img/agency9.jpg',
    '/assets/img/agency10.jpg',
  ];
  photoSlider:OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['<i class="fa-solid fa-chevron-left"></i>', '<i class="fa-solid fa-chevron-right"></i>'],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: true
  }

  showModal: boolean = false;
  rating: number = 0; 
  hoverRating: number = 0;
  selectedDate: string  = '';
  reviewText: string = '';
  reviewTitle: string = '';
  image:any;
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
        formData.append('TravelAgencyId', this.travelAgencyId);
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
            this.showModal = false;
          }
        });
  }

  //reviews filters
  toggleFilterOptions:boolean = false;


  sortByMostRecent() {
    this.reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  filterByRating(order: 'high' | 'low') {
    this.reviews.sort((a, b) => {
      return order === 'high' ? b.rating - a.rating : a.rating - b.rating;
    });
  }
  resetFilters() {
    return this.reviews = [...this.filteredReviews];
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
  
    this.searchResults = this.reviews.filter(review =>
      Object.values(review).some(value =>
        value && value.toString().toLowerCase().includes(query)
      )
    );
  
    this.errorMessage = this.searchResults.length === 0 ? 'No results found.' : '';
  }


}
