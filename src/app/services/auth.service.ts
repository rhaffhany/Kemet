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

  // Register Method
  registerForm(userData: object): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/RegisterCustomer`, userData);
  }

  // Login Method
  loginForm(userData: object): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/Login`, userData);
  }

  // Get Token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  //Get username
  getUserName(): string | null{
    return localStorage.getItem('userName');
  }

  // Forgot Password
  forgotPassword(data: { email: string }): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/Forgot-password`, data);
  }

  // Resend Verification Code
  resendVerificationCode(data: { email: string }): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/Forgot-password`, data);
  }

  // Verify OTP Method
  verifyOtp(data: { userId: string; otp: string }): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/VerifyOTP`, data);
  }
  
    // Verify OTP Method
    resetPassword(data: { email: string; token: string; newPassword: string; }): Observable<any> {
      return this._HttpClient.post(`${this.apiUrl}/Resetpassword`, data);
    }
}
