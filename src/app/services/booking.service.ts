import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private _HttpClient:HttpClient, private _AuthService:AuthService) { }

  private DeployURL = 'https://kemet-server.runasp.net';

  // bookingID:BehaviorSubject<number> = new BehaviorSubject(0);
  // bookedPrice:BehaviorSubject<number> = new BehaviorSubject(0);
  // selectedBookedDate:BehaviorSubject<string> = new BehaviorSubject(''); 
  // selectedBoard:BehaviorSubject<string> = new BehaviorSubject('');
  // visitorType:BehaviorSubject<string> = new BehaviorSubject('');

  bookTrip(bookData:any):Observable<any>{
    const token = this._AuthService.getToken();
    const headers = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    return this._HttpClient.post(`${this.DeployURL}/api/Booking/BookTrip`, bookData, headers);
  }

  getBookedTrips():Observable<any>{
    return this._HttpClient.get(`${this.DeployURL}/api/Booking/GetUserBookedTrips`);
  }

}
