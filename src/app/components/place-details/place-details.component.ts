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

  blackDot:string = "/assets/icons/Ellipse 148.svg";
  ticket:string = "/assets/icons/Ticket.svg"
  searchIcon:string = "/assets/icons/Search.png"

  searchResults: any[] = [];  
  errorMessage: string = ''; 

  userData:any = {};
  updatedData:any = {...this.userData};


  placeID:any;

  placeDetails:any = {
    "$id": " ",
    "placeID": '',
    "name": " ",
    "culturalTips":" ",
    "description": " ",
    "imageURLs": {
        "$id": " ",
        "$values": []
    },
    "reviews": {
        "$id": " ",
        "$values": []
    },
    "averageRating": '',
    "ratingsCount": ''
  };

  ActivityDetails:ActivityDetails = {} as ActivityDetails;
  activityId:any;

  culturalTipsArray:[] = [];

  constructor(private _DetailsService:DetailsService, private _ActivatedRoute:ActivatedRoute, private _ProfileService:ProfileService ){}

  ngOnInit(): void {

    this._ActivatedRoute.paramMap.subscribe({
      next:(params)=>{
        this.placeID = params.get('placeID');
        this.activityId = params.get('activityId');
      }
    });

    if (this.placeID) {
      this._DetailsService.getDetailedPlace(this.placeID).subscribe({
        next: (response) => {
          this.placeDetails = response;
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


    let tips = this.placeDetails.culturalTips || ''; // Ensure it's a string
    this.culturalTipsArray = tips
    .split("\n") // Split by newlines
    .map((tip: string) => tip.replace('*', '').trim()) // Explicitly define 'tip' as a string
    .filter((tip: string) => tip.length > 0);

  }


  getReviewLink(): string[] {
    if (this.placeID) {
      return ['/write-review/place', this.placeID];  // Path for place
    } else if (this.activityId) {
      return ['/write-review/activity', this.activityId];  // Path for activity
    }
    return ['/']; // Default route in case neither ID is present
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
 
  //reviews
  reviews:any=[];
  // reviews:[] = [
  //   userData: { profileImageURL: '/path-to-img', city: 'Cairo', country: 'Egypt' },
  //   updatedData: { firstName: 'John', lastName: 'Doe' },
  //   title: 'Delicious Food',
  //   content: 'Amazing food and experience!',
  //   stars: 5,
  //   visitDate: 'October 2023',
  //   travelType: 'with family',
  //   writtenDate: 'October 5, 2023'
  // ];

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
