import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private DeployUrl = 'https://kemet-server.runasp.net';

  constructor(private _HttpClient: HttpClient) { }

  fetchPlaces(): Observable<any> {
    return this._HttpClient.get(`${this.DeployUrl}/api/places`);
  }

  fetchTopRatedPlaces(): Observable<any> {
    return this._HttpClient.get(`${this.DeployUrl}/api/Places/PlacesTopRated`);
  }

  fetchTopRatedActivities(): Observable<any> {
    return this._HttpClient.get(`${this.DeployUrl}/api/Activities/ActivitiesTopRated`);
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

  getActivities(endpoint: string): Observable<any> {
    return this._HttpClient.get(endpoint);
  }
}
