import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';


interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  userName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://kemet-server.runasp.net/api/Accounts';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(private _HttpClient: HttpClient,private router: Router) {}

  // Observable for login state
  isLoggedInObservable(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  private updateLoginState() {
    this.isLoggedInSubject.next(this.isLoggedIn());
  }

  // Retrieve JWT token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp < Math.floor(Date.now() / 1000);
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  // Get logged-in user's name
  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  // Verify OTP
  verifyOtp(data: { userId: string; otp: string }): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/VerifyOTP`, data, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    }).pipe(
      catchError(error => {
        console.error('OTP Verification Error:', error);
        return throwError(() => error);
      })
    );
  }

  // Register a new user
  registerForm(userData: RegisterData): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/RegisterCustomer`, userData).pipe(
      catchError(error => {
        console.error('Registration Error:', error);
        return throwError(() => error);
      })
    );
  }

  // Log in an existing user
  loginForm(userData: object): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/Login`, userData).pipe(
      tap((response: any) => {
        if (response && response.token) {
          console.log('Storing Token:', response.token); // Debugging
          localStorage.setItem('token', response.token);
          localStorage.setItem('userName', response.userName);
          this.updateLoginStatus();
        } else {
          console.error('Login response did not contain a token.');
        }
      }),
      catchError(error => {
        console.error('Login Error:', error);
        return throwError(() => error);
      })
    );
  }
  

  // Forgot password
  forgotPassword(data: { email: string }): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/Forgot-password`, data).pipe(
      catchError(error => {
        console.error('Forgot Password Error:', error);
        return throwError(() => error);
      })
    );
  }

  // Resend verification code
  resendVerificationCode(data: { email: string }): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/ResendVerificationCode`, data).pipe(
      catchError(error => {
        console.error('Resend Code Error:', error);
        return throwError(() => error);
      })
    );
  }

  // Reset password
  resetPassword(data: { email: string; token: string; newPassword: string }): Observable<any> {
    return this._HttpClient.post(`${this.apiUrl}/Resetpassword`, data, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    }).pipe(
      catchError(error => {
        console.error('Reset Password Error:', error);
        return throwError(() => error);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    this.updateLoginStatus();

    // Navigate to home to reset layout
    this.router.navigate(['/home']).then(() => {
      window.location.reload();  // Force UI refresh to apply auth layout
    });
  }

  
private loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());

get isLoggedIn$(): Observable<boolean> {
  return this.isLoggedInSubject.asObservable();
}

private updateLoginStatus() {
  this.isLoggedInSubject.next(this.isLoggedIn());
}

isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
}


}
