import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://localhost:7051/api/Accounts';

  constructor(private _HttpClient: HttpClient) {}

  // Retrieve JWT token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  // Check if the user is logged in
  isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired();
  }

  // Get logged-in user's name
  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  // Verify OTP
  verifyOtp(data: { userId: string; otp: string }): Observable<any> {
    const token = this.getToken();
    if (!token || this.isTokenExpired()) {
      console.error('Token is missing or expired');
      return throwError(() => new Error('Unauthorized'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });

    return this._HttpClient.post(`${this.apiUrl}/VerifyOTP`, data, { headers }).pipe(
      tap((response) => console.log('OTP Verified Successfully:', response)),
      catchError((error) => {
        console.error('Error during OTP verification:', error);
        return throwError(() => error);
      })
    );
  }

  // Register a new user
  registerForm(userData: object): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/RegisterCustomer`, userData);
  }

  // Log in an existing user
  loginForm(userData: object): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/Login`, userData);
  }

  // Forgot password
  forgotPassword(data: { email: string }): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/Forgot-password`, data);
  }

  // Resend verification code
  resendVerificationCode(data: { email: string }): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/Forgot-password`, data);
  }

  // Reset password
  resetPassword(data: { email: string; token: string; newPassword: string }): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/Resetpassword`, data);
  }
}
