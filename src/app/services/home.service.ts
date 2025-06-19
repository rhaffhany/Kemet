import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private DeployUrl = 'https://kemet-server.runasp.net';

  constructor(private _HttpClient: HttpClient, private _AuthService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this._AuthService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

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

  // Things-to-do specific API methods with token authentication
  getNearbyActivities(): Observable<any> {
    const headers = this.getHeaders();
    return this._HttpClient.get(`${this.DeployUrl}/api/Activities/NearbyActivities`, { headers });
  }

  getTopAttractionsNearMe(): Observable<any> {
    const headers = this.getHeaders();
    return this._HttpClient.get(`${this.DeployUrl}/api/Places/TopAttractionsNearMe`, { headers });
  }

  getPlacesHiddenGems(): Observable<any> {
    return this._HttpClient.get(`${this.DeployUrl}/api/Places/PlacesHiddenGems`);
  }

  getActivitiesHiddenGems(): Observable<any> {
    return this._HttpClient.get(`${this.DeployUrl}/api/Activities/ActivitiesHiddenGems`);
  }

  getPlacesInCairo(): Observable<any> {
    const headers = this.getHeaders();
    return this._HttpClient.get(`${this.DeployUrl}/api/Places/PlacesInCairo`, { headers });
  }

  getActivitiesInCairo(): Observable<any> {
    const headers = this.getHeaders();
    return this._HttpClient.get(`${this.DeployUrl}/api/Activities/ActivitiesInCairo`, { headers });
  }
}
