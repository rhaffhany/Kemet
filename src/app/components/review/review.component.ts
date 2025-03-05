import { ReviewContentComponent } from './../review-content/review-content.component';
import { DetailsService } from 'src/app/services/details.service';
import { placeDetails } from './../../interfaces/place-details';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReviewService } from 'src/app/services/review.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent {
  
  placeDetails:placeDetails={} as placeDetails;
  
  placeID:any;
  submissionDate: string='';

  reviewData: any = {};

  userData:any = {
    "$id": "",
    "userName": "",
    "firstName": "",
    "lastName": "",
    "dateOfBirth": "",
    "ssn": "",
    "gender": "",
    "nationality": "",
    "profileImageURL": "",
    "backgroundImageURL": "",
    "interestCategoryIds": {
        "$id": "",
        "$values": [  ]
    },
    "bio": "",
    "country": "",
    "city": "",
    "websiteLink": "",
    "creationDate": ""
  };

  // will be edited
  
    constructor(private _ReviewService:ReviewService, private _DetailsService:DetailsService, private _ActivatedRoute:ActivatedRoute, private _ProfileService:ProfileService){}
  
    ngOnInit(): void {      

      this.submissionDate = this._ReviewService.getSubmissionDate();
      

      this._ProfileService.getCurrentUserData().subscribe({
        next:(data) =>{
          this.userData = data;
        }
      });

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
    }
  
    deletePlace(){
      // places.splice(index,1);
      // display
    }

    // user reviews


}
