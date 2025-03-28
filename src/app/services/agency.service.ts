import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AgencyService {

  constructor(private _HttpClient:HttpClient) { }

  private DeployUrl = 'https://kemet-server.runasp.net';

  getTravelAgencyData(travelAgencyName:any):Observable<any>{
    return this._HttpClient.get(`${this.DeployUrl}/api/TravelAgency?travelAgencyName=${travelAgencyName}`);
  }

  bookTrip(bookingData: any):Observable<any>{
    return this._HttpClient.post(`${this.DeployUrl}/api/Booking/BookTrip`, bookingData , {responseType: 'text'});
  }

  getUserBookedTrips():Observable<any>{
    return this._HttpClient.get(`${this.DeployUrl}/api/Booking`);
  }


}
