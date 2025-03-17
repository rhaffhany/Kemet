import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { throwError } from 'rxjs';  
import { catchError } from 'rxjs/operators';  

@Injectable({
  providedIn: 'root'
})
export class ProfileService {


  constructor(private _HttpClient:HttpClient, private _AuthService:AuthService) { }

  private DeployUrl = 'https://kemet-server.runasp.net';

  
  getAdventureData(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError('Authentication token is missing. Please log in again.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this._HttpClient.get(`${this.DeployUrl}/api/Profile`, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error fetching adventure data:', error);
          return throwError('An error occurred while fetching adventure data. Please try again later.');
        })
      );
  }

  getCurrentUserData():Observable<any>{
    const token = this._AuthService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this._HttpClient.get(`${this.DeployUrl}/api/Profile/GetCurrentUserData`,{headers});
  }

  updateCurrentData(updatedData: any):Observable<any>{
    const token = this._AuthService.getToken();
    this._AuthService.getUserName();

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`});
    const formData = new FormData();
    for (const key in updatedData) {
      if (updatedData.hasOwnProperty(key) ) {
        formData.append(key, updatedData[key]);
      } 
    }
    return this._HttpClient.put(`${this.DeployUrl}/api/Profile/UpdateUserData`, updatedData, {headers, responseType: 'text'});
  }
    
  uploadProfileImg(formData:FormData):Observable<any>{
    const token = this._AuthService.getToken();
    if(!token){
      throw new Error("not found")
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this._HttpClient.post(`${this.DeployUrl}/api/Profile/upload-profile-image`, formData, {headers} );
  }

  uploadBackgroundImg(_FormData:FormData):Observable<any>{
    const token = this._AuthService.getToken();
    if(!token){
      throw new Error("not found")
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this._HttpClient.post(`${this.DeployUrl}/api/Profile/upload-background-image`, _FormData, {headers})
  }

}



