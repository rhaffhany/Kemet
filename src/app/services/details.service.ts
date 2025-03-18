import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetailsService {

  constructor(private _HttpClient:HttpClient) { }
  private DeployUrl = 'https://kemet-server.runasp.net';

  getDetailedPlace(placeID:any):Observable<any>{
    return this._HttpClient.get(`${this.DeployUrl}/Api/Places/GetPlaceByID?PlaceID=${placeID}`);
  }

  getDetailedActivity(activityID:any):Observable<any>{
    return this._HttpClient.get(`${this.DeployUrl}/Api/Activities/GetActivityByID?ActivityID=${activityID}`);
  }

  getDetaliedPlan(planID:any):Observable<any>{
    return this._HttpClient.get(`${this.DeployUrl}/Api/TravelAgencyPlan/GetTRavelAgencyPlanByID?PlanId=${planID}`);
  }

}
