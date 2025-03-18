import { userData } from 'src/app/interfaces/user-data';
import { ProfileService } from './../../services/profile.service';
import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { HomeService } from 'src/app/services/home.service';
import { PackageDetails } from 'src/app/interfaces/package-details';

import { CommonModule } from '@angular/common';
import { KcurrencyPipe } from 'src/app/pipe/kcurrency.pipe';
import { NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-travel-agency-profile',
  templateUrl: './travel-agency-profile.component.html',
  styleUrls: ['./travel-agency-profile.component.scss']
})
export class TravelAgencyProfileComponent implements OnInit {

  constructor(private _ProfileService:ProfileService,
              private _HomeService:HomeService){}
  
  layoutPic:string = "/assets/img/agency-background.png";
  profileImg: string = 'assets/img/default-profile.png';
  travelpp:string = 'assets/img/Agency pp.png'
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

  searchResults: any[] = [];  
  errorMessage: string = ''; 

  packageDetails:PackageDetails = {} as PackageDetails;
  planID:any;
  
  packages: any[] = []; 

  userData:userData = {} as userData;
  updatedData:any = {...this.userData};

  ngOnInit(): void {

    this.loadPackages();

    this._ProfileService.getCurrentUserData().subscribe({
      next:(data)=>{
        this.userData = data;
        this.updatedData = { ...this.userData };
        // if (!this.userData.profileImageURL) {
        //   this.profileImg;
        // }else{
        //   this.profileImg = this.userData.profileImageURL;
        // }
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      },
    });
  }

  get displayWebsiteLink(): string {
    return this.updatedData.websiteLink?.replace(/^https?:\/\//, '') || '';
  }

  loadPackages(): void {
    this._HomeService.fetchTravelAgencyPlan().subscribe((data: any) => {
      this.packages = data.$values;
    });
  }

  // lhad ma api yegy
  images = [
    '/assets/img/agency1.jpg',
    '/assets/img/agency2.jpg',
    '/assets/img/agency3.jpg',
    '/assets/img/agency4.jpg',
    '/assets/img/agency5.jpg',
    '/assets/img/agency6.jpg',
    '/assets/img/agency7.jpg',
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
  options: string[] = ['Business', 'Couples', 'Family', 'Solo'];
  selectedOption: string = '';
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
  
  selectOption(option: string): void {
    this.selectedOption = option;
  }

  onDateSelect(date: any) {
    if (date && date.year && date.month && date.day) {
        const month = date.month.toString().padStart(2, '0');
        const day = date.day.toString().padStart(2, '0');
        this.selectedDate = `${date.year}-${month}-${day}`;
        console.log("Selected Date:", this.selectedDate);
    }
  }

  clearData(): void{
    this.rating = 0; 
    this.hoverRating = 0;
    this.selectedDate = '';
    this.selectedOption = '';
    this.reviewText = '';    
    this.reviewTitle = '';
  }

  onReviewChange(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.isAdded = input.value.trim().length > 0; 
  }

  // wiil be edited
  submitReview() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.isAdded = true;
      this.showModal = false;
    }, 2000);
  }



}
