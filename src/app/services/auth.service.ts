import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;

  constructor(private _HttpClient: HttpClient) { }

  registerForm(userData: object): Observable<any> {
    return this._HttpClient.post(`https://localhost:7051/api/Accounts/RegisterCustomer`, userData);
  }
  loginForm(userData:object):Observable<any>{
    return this._HttpClient.post(`https://localhost:7051/api/Accounts/Login`, userData)
  }


  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

}
