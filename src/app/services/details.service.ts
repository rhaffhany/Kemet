import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetailsService {

  constructor(private _HttpClient:HttpClient) { }

  getDetailedPlace(placeID:any):Observable<any>{
    return this._HttpClient.get(`https://localhost:7051/Api/Places/GetPlaceByID?PlaceID=${placeID}`);
  }


}
