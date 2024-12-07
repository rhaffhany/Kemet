import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {


  constructor(private _HttpClient:HttpClient, private _AuthService:AuthService) { }

  private BaseUrl = 'https://localhost:7051';

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
    return this._HttpClient.put(`${this.BaseUrl}/api/Profile/UpdateUserData`, updatedData, {headers});
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


  // saveUser(){
  //   const encode = localStorage.getItem('token');
  //   if(encode){
  //     const decode = jwtDecode(encode);
  //     //  = decode;
  //   }
  // }

}
