import { DetailsService } from 'src/app/services/details.service';
import { placeDetails } from './../../interfaces/place-details';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReviewService } from 'src/app/services/review.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent {
  
  placeDetails:placeDetails={} as placeDetails;
  
  placeID:any;
  submissionDate: string='';

  // will be edited
  
    constructor(private _ReviewService:ReviewService, private _DetailsService:DetailsService, private _ActivatedRoute:ActivatedRoute ){}
  
    ngOnInit(): void {

      this.submissionDate = this._ReviewService.getSubmissionDate();

  
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
