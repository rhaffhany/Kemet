import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private _HttpClient:HttpClient) { }

  ngOnInit(): void {
    this.fetchPlaces();
    this.fetchActivities();
  }
  

  fetchPlaces():Observable<any> {
    return this._HttpClient.get('https://localhost:7051/api/places');
  }

  fetchActivities():Observable<any>  {
    return this._HttpClient.get('https://localhost:7051/api/Activities');
  }

  fetchTravelAgencyPlan():Observable<any>  {
    return this._HttpClient.get('https://localhost:7051/api/TravelAgencyPlan');
  }
}
