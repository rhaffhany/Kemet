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
  filteredBookings:any[] = [];
  searchTerm: string = '';

  ngOnInit(): void {
    this._BookingService.getBookedTrips().subscribe({
      next: (res)=>{        
        this.bookingData = res.$values;
        this.filteredBookings = [...this.bookingData];
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredBookings = [...this.bookingData];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredBookings = this.bookingData.filter(booking => 
      booking.planName.toLowerCase().includes(searchLower) ||
      booking.travelAgencyName.toLowerCase().includes(searchLower) ||
      booking.bookedCategory.toLowerCase().includes(searchLower) ||
      booking.paymentStatus.toLowerCase().includes(searchLower)
    );
  }
}
