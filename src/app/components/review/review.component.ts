import { DetailsService } from 'src/app/services/details.service';
import { placeDetails } from './../../interfaces/place-details';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent {
  
  placeDetails:placeDetails={
    $id: '',
    placeId: 0,
    name: '',
    culturalTips: '',
    duration: '',
    description: '',
    categoryName: '',
    openTime: '',
    closeTime: '',
    groupSize: 0,
    // imageURLs: undefined,
    // reviews: undefined,
    averageRating: 0,
    ratingsCount: 0,
    egyptianAdult: 0,
    egyptianStudent: 0,
    touristAdult: 0,
    touristStudent: 0
  };
  
  placeID:any;

  // will be edited
  
    constructor(private _DetailsService:DetailsService, private _ActivatedRoute:ActivatedRoute ){}
  
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
    }

    deletePlace(){
      // places.splice(index,1);
      // display
    }

}
