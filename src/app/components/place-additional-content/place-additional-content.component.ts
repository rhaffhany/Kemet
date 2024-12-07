import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DetailsService } from 'src/app/services/details.service';


@Component({
  selector: 'app-place-additional-content',
  templateUrl: './place-additional-content.component.html',
  styleUrls: ['./place-additional-content.component.scss']
})
export class PlaceAdditionalContentComponent implements OnInit{

  blackDot:string = "/assets/icons/Ellipse 148.svg";
  ticket:string = "/assets/icons/Ticket.svg"

  // placeID:any;
  placeID:any=21;

  placeDetails:any = [{
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
        "$values": ['']
    },
    "averageRating": '',
    "ratingsCount": ''
  }];


  constructor(private _DetailsService:DetailsService, private _ActivatedRoute:ActivatedRoute ){}

  ngOnInit(): void {

    // this._ActivatedRoute.paramMap.subscribe({
    //   next:(params)=>{
    //     this.placeID = params.get('placeID');
    //   }
    // });

    this._DetailsService.getDetailedPlace(this.placeID).subscribe({
      next:(response)=>{
        this.placeDetails = response;
        console.log(response);
      },error:(err)=>{
        console.error(err);
      }
    });

  }

  updateLargeImage(index: number): void {
    const largeImage = document.querySelector('.carousel-inner .carousel-item img') as HTMLImageElement;
    largeImage.src = this.placeDetails.imageURLs.$values[index];
  }

 
  

}