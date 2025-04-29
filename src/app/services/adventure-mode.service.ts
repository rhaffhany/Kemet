import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdventureModeService {


  constructor(private _HttpClient:HttpClient, private _AuthService:AuthService) { }

  private DeployUrl = 'https://kemet-server.runasp.net';

  getAdventureMode():Observable<any>{
    const token = this._AuthService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this._HttpClient.get(`${this.DeployUrl}/api/Profile`, {headers})
  }
    

}
