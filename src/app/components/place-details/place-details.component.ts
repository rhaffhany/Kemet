import { placeDetails } from 'src/app/interfaces/place-details';
import { ActivityDetails } from 'src/app/interfaces/activity-details';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DetailsService } from 'src/app/services/details.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-place-details',
  templateUrl: './place-details.component.html',
  styleUrls: ['./place-details.component.scss']
})
export class PlaceDetailsComponent {

  profileImg: string = 'assets/img/default-profile.png';
  blackDot:string = "/assets/icons/Ellipse 148.svg";
  ticket:string = "/assets/icons/Ticket.svg"
  searchIcon:string = "/assets/icons/Search.png"
  notFoundImg:string = "/assets/img/not found.jpg"
  egyptFlag:string= '/assets/img/egyptFlag.png';

  userData:any = {};
  updatedData:any = {...this.userData};

  placeDetails:placeDetails = {} as placeDetails;
  placeID:any;

  ActivityDetails:ActivityDetails = {} as ActivityDetails;
  activityID:any;

  culturalTipsArray:[] = [];

  reviewsData:any[] =[];
  updatedReviewData:any[] = [...this.reviewsData];
  filteredReviews:any[] = [];

  ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingPercents: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  // satisfactionRate = 60;

  constructor(private _DetailsService:DetailsService, 
              private _ActivatedRoute:ActivatedRoute, 
              private _ProfileService:ProfileService ){}

  ngOnInit(): void {

    this._ActivatedRoute.paramMap.subscribe({
      next:(params)=>{
        this.placeID = params.get('placeID');
        this.activityID = params.get('activityID');
      }
    });
    

    this._DetailsService.getDetailedPlace(this.placeID).subscribe({
      next: (response) => {
        this.placeDetails = response;
        this.reviewsData = response.reviews.$values;
        this.filteredReviews = [...this.reviewsData];

        this.ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        this.reviewsData.forEach(review => {
          const rating = review.rating;
          if (this.ratingCounts[rating] !== undefined) {
            this.ratingCounts[rating]++;
          }
        });
        
        // Calculate percentages
        const totalReviews = this.reviewsData.length;
        for (let i = 1; i <= 5; i++) {
          this.ratingPercents[i] = totalReviews > 0
            ? Math.round((this.ratingCounts[i] / totalReviews) * 100)
            : 0;
        }

        this.placeDetails.averageRating = Math.round(this.placeDetails.averageRating * 10) / 10;
      },
      error: (err) => {
        console.error(err);
      },
    });

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

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.profileImg;
  }
  
  getReviewLink(): string[] {
    if (this.placeID) {
      return ['/write-review/place', this.placeID]; 
    } else if (this.activityID) {
      return ['/write-review/activity', this.activityID];  
    }
    return ['/']; 
  }
  
  //carsouel
  updateLargeImage(index: number): void {
    const largeImage = document.querySelector('.carousel-inner .carousel-item img') as HTMLImageElement;
    largeImage.src = this.placeDetails.imageURLs.$values[index];
  }

  //handle pp
  profilePic:string = "/assets/icons/profile-pic.svg"
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

  //reviews filters
  toggleFilterOptions:boolean = false;


  sortByMostRecent() {
    this.reviewsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  filterByRating(order: 'high' | 'low') {
    this.reviewsData.sort((a, b) => {
      return order === 'high' ? b.rating - a.rating : a.rating - b.rating;
    });
  }
  resetFilters() {
    return this.reviewsData = [...this.filteredReviews];
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
  
    this.searchResults = this.reviewsData.filter(review =>
      Object.values(review).some(value =>
        value && value.toString().toLowerCase().includes(query)
      )
    );
  
    this.errorMessage = this.searchResults.length === 0 ? 'No results found.' : '';
  }



}
