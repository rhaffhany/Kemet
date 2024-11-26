import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private _HttpClient:HttpClient, private _AuthService:AuthService) { }
  

  UploadProfileImg(formData:FormData):Observable<any>{
    const token = this._AuthService.getToken();
    if(!token){
      throw new Error("not found")
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json' // This ensures the request body is JSON
    });
    return this._HttpClient.post('https://localhost:7051/api/Profile/upload-profile-image', formData, {headers} );
  }

  getCurrentUserData():Observable<any>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this._HttpClient.get('https://localhost:7051/api/Profile/GetCurrentUserData',{headers});
  }

  updateCurrentData(updatedData:any):Observable<any>{
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}`};
    return this._HttpClient.put('https://localhost:7051/api/Profile/UpdateUserData',JSON.stringify(updatedData), {headers});
  }

  // saveUser(){
  //   const encode = localStorage.getItem('token');
  //   if(encode){
  //     const decode = jwtDecode(encode);
  //     //  = decode;
  //   }

  // }

}
