import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DetailsService } from 'src/app/services/details.service';
import { ProfileService } from 'src/app/services/profile.service';


@Component({
  selector: 'app-place-additional-content',
  templateUrl: './place-additional-content.component.html',
  styleUrls: ['./place-additional-content.component.scss']
})
export class PlaceAdditionalContentComponent implements OnInit{

  blackDot:string = "/assets/icons/Ellipse 148.svg";
  ticket:string = "/assets/icons/Ticket.svg"


  // placeID:any;
  placeID:any;

  placeDetails:any = {
    "$id": " ",
    "placeID": '',
    "name": " ",
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


  constructor(private _DetailsService:DetailsService, private _ActivatedRoute:ActivatedRoute, private _ProfileService:ProfileService ){}

  ngOnInit(): void {

    this._ActivatedRoute.paramMap.subscribe({
      next:(params)=>{
        this.placeID = params.get('placeID');
      }
    });

    if (this.placeID) {
      this._DetailsService.getDetailedPlace(this.placeID).subscribe({
        next: (response) => {
          this.placeDetails = response;
          console.log(response);
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


  //carsouel
  updateLargeImage(index: number): void {
    const largeImage = document.querySelector('.carousel-inner .carousel-item img') as HTMLImageElement;
    largeImage.src = this.placeDetails.imageURLs.$values[index];
  }


  //handle pp
  userData:any = {};
  updatedData:any = {...this.userData};

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