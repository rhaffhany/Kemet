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

  private BaseUrl = 'https://localhost:7051';
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

    return this._HttpClient.get('https://localhost:7051/api/Profile', { headers })
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
    return this._HttpClient.get(`${this.BaseUrl}/api/Profile/GetCurrentUserData`,{headers});
  }

  
  updateCurrentData(updatedData:any):Observable<any>{
    const token = this._AuthService.getToken();
    this._AuthService.getUserName();

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`});
    const formData = new FormData();
    for (const key in updatedData) {
      if (updatedData.hasOwnProperty(key) ) {
        formData.append(key, updatedData[key]);
      } 
    }
    return this._HttpClient.put(`${this.BaseUrl}/api/Profile/UpdateUserData`, updatedData, {headers, responseType: 'text'});
  }
    

  uploadProfileImg(formData:FormData):Observable<any>{
    const token = this._AuthService.getToken();
    if(!token){
      throw new Error("not found")
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this._HttpClient.post(`${this.BaseUrl}/api/Profile/upload-profile-image`, formData, {headers} );
  }

  uploadBackgroundImg(_FormData:FormData):Observable<any>{
    const token = this._AuthService.getToken();
    if(!token){
      throw new Error("not found")
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this._HttpClient.post(`${this.BaseUrl}/api/Profile/upload-background-image`, _FormData, {headers})
  }



}

  
  // saveUser(){
  //   const encode = localStorage.getItem('token');
  //   if(encode){
  //     const decode = jwtDecode(encode);
  //     //  = decode;
  //   }
  // }


