import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private _HttpClient: HttpClient) { }

  private DeployUrl = 'https://kemet-server.runasp.net';


  fetchPlaces(): Observable<any> {
    return this._HttpClient.get(`${this.DeployUrl}/api/places`);
  }

  fetchPlaceCategory(placeId: number): Observable<any> {
    return this._HttpClient.get(`${this.DeployUrl}/api/Places/GetPlaceByID?PlaceID=${placeId}`);
  }

  fetchActivities(): Observable<any> {
    return this._HttpClient.get(`${this.DeployUrl}/api/Activities`);
  }

  fetchTravelAgencyPlan(): Observable<any> {
    return this._HttpClient.get(`${this.DeployUrl}/api/TravelAgencyPlan`);
  }

  
}
