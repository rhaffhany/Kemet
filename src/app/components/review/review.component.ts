import { ReviewContentComponent } from './../review-content/review-content.component';
import { DetailsService } from 'src/app/services/details.service';
import { placeDetails } from './../../interfaces/place-details';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReviewService } from 'src/app/services/review.service';
import { ProfileService } from 'src/app/services/profile.service';
import { userData } from 'src/app/interfaces/user-data';
import { ActivityDetails } from 'src/app/interfaces/activity-details';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent {
  
  placeDetails:placeDetails={} as placeDetails;
  ActivityDetails:ActivityDetails = {} as ActivityDetails;
  
  placeID:any;
  activityID:any;

  submissionDate: string='';

  reviewData: any[] = [];

  userData: userData = {} as userData;

  constructor(private _ReviewService:ReviewService, 
              private _DetailsService:DetailsService,
              private _ActivatedRoute:ActivatedRoute, 
              private _ProfileService:ProfileService){}
  
    ngOnInit(): void {      

      this._ProfileService.getCurrentUserData().subscribe({
        next:(data) =>{
          this.userData = data;          
        }
      });

      this._ActivatedRoute.paramMap.subscribe({
        next:(params)=>{
          this.placeID = params.get('placeID');
          this.activityID = params.get('activityID');
        }
      });
      
    }
  
    deletePlace(){
      // places.splice(index,1);
      // display
    }



}
