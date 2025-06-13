import { Component, OnInit } from '@angular/core';
import { BookingService } from 'src/app/services/booking.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit{

  constructor(private _BookingService:BookingService){}

  bookingData:any[] = [];
  // planDetails:any = {};

  ngOnInit(): void {
    this._BookingService.getBookedTrips().subscribe({
      next: (res)=>{        
        this.bookingData = res.$values;
        // this.planDetails = this.bookingData.map(data => data.travelAgencyPlan);
        // console.log(this.planDetails);
        // console.log("Bookings: ",this.bookingData);
      }
    });
    
  }

}
