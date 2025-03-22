import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PackageDetails } from 'src/app/interfaces/package-details';
import { DetailsService } from 'src/app/services/details.service';

@Component({
  selector: 'app-package-details-booking',
  templateUrl: './package-details-booking.component.html',
  styleUrls: ['./package-details-booking.component.scss']
})
export class PackageDetailsBookingComponent implements OnInit{

  constructor(private _ActivatedRoute:ActivatedRoute, 
              private _DetailsService:DetailsService){}


  egyptFlag:string= '/assets/img/egyptFlag.png';
  searchIcon:string = "/assets/icons/Search.png"

  searchResults: any[] = [];  
  errorMessage: string = ''; 

  packageDetails:PackageDetails = {} as PackageDetails;
  planID:any;

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next:(params)=>{
        this.planID = params.get('planID'); 
      }
    });

    this._DetailsService.getDetaliedPlan(this.planID).subscribe({
      next: (response)=>{
        this.packageDetails = response;
        console.log("Fetched package details:", this.packageDetails);
        
      }
    });
  }

  selectedNationality = 'Nationality';
  selectedUserType = 'User';
  selectedBoard = '';

  updateNationality(value: string) {
    this.selectedNationality = value;
  }
  updateUserType(value: string) {
    this.selectedUserType = value;
  }
  updateBoard(value: string) {
    this.selectedBoard = value;
  }


}
