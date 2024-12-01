import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  arrowLeftIcon: string = '/assets/icons/chevron-left.svg';
  loginLogoSrc: string = '/assets/logo/logo.png'; 
  loginLogoAlt: string = 'Logo';  
  
  @Output() close = new EventEmitter<void>();

  showLoginForm: boolean = true;
  showRegisterForm: boolean = false;

  isLoading: boolean = false;
  errorMsg: string = '';
  successMsg: string = ''; 

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  constructor(private _AuthService: AuthService, private _Router: Router) {}


  handleLogin(): void {
    this.isLoading = true;
    console.log('Login Attempt:', this.loginForm.value);

    if (this.loginForm.valid) {
      this._AuthService.loginForm(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('API Response:', response);
          if (response?.token) {
            this.successMsg = 'Login successful! Redirecting...';
            // token
            localStorage.setItem('token', response.token);
            localStorage.setItem('userName', response.userName);

            this.close.emit(); 

            setTimeout(() => {
              this._Router.navigate(['/profile']);
            }, 500); 
          } else {
            this.errorMsg = 'Unexpected response from server';
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMsg = err.error?.message || 'An error occurred during login';
          console.error('API Error:', err);
        },
      });
    } else {
      console.error('Form is invalid');
      this.isLoading = false;
    }
  }

  openRegisterModal(event: Event) {
    event.preventDefault();
    this.showLoginForm = false;
    this.showRegisterForm = true;
  }

  backToLogin() {
    this.showLoginForm = true;
    this.showRegisterForm = false;
  }
  passwordVisible: boolean = false;

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
