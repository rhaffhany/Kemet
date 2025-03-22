import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface RegisterData {
  userName:string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})

export class AgencyService {

  constructor(private _HttpClient:HttpClient) { }

  private DeployUrl = 'https://kemet-server.runasp.net';

  getTravelAgencyData(travelAgencyName:any):Observable<any>{
    return this._HttpClient.get(`${this.DeployUrl}/api/TravelAgency?travelAgencyName=${travelAgencyName}`);
  }

  agencyRegister(agencyData: RegisterData): Observable<any> {
    return this._HttpClient.post(`${this.DeployUrl}/Api/Accounts/RegisterTravelAgency`, agencyData);
  }

}
