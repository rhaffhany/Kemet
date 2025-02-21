import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UpdateLocationService {

  constructor(private _HttpClient:HttpClient, private _AuthService:AuthService) { }

  private DeployURL = `https://kemet-server.runasp.net`;

  updateLocation(locationData: any):Observable<any>{
    const token = this._AuthService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    return this._HttpClient.post(`${this.DeployURL}/Api/Accounts/update-location`, JSON.stringify(locationData) , {headers});
  }

  getAddressFromCoordinates(lat: number, lng: number): Observable<any> {
    return this._HttpClient.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.DeployURL}`);
  }


}
