// AuthService

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://localhost:7051/api/Accounts'; // Your API base URL

  constructor(private _HttpClient: HttpClient) {}

  registerForm(userData: object): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/RegisterCustomer`, userData);
  }

  loginForm(userData: object): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/Login`, userData);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  //Get username
  getUserName(): string | null{
    return localStorage.getItem('userName');
  }

  forgotPassword(data: { email: string }): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/Forgot-password`, data);
  }

  resendVerificationCode(data: { email: string }): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/Forgot-password`, data);
  }

  verifyOtp(data: { userId: string; otp: string }): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/VerifyOTP`, data);
  }
  
    resetPassword(data: { email: string; token: string; newPassword: string; }): Observable<any> {
      return this._HttpClient.post(`${this.apiUrl}/Resetpassword`, data);
    }
    
}
