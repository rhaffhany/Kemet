import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from './../../services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  // Assets
  arrowLeftIcon: string = '/assets/icons/chevron-left.svg';
  loginLogoSrc: string = '/assets/logo/logo.png';
  loginLogoAlt: string = 'Logo';


  @Output() close = new EventEmitter<void>();

  // Form State Management
  showLoginForm = true;
  showRegisterForm = false;
  showForgotPasswordForm = false;
  showVerificationForm = false;
  showResetPasswordForm = false;

  // Status Flags
  isLoading = false;
  isTimerActive = false;

  // Messages
  errorMsg = '';
  successMsg = '';

  // Timer
  timer: number = 0;

  // Forms
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  verificationForm: FormGroup;
  resetPasswordForm: FormGroup;

  // Forgot Password Email
  forgotPasswordEmail = '';

  // Password Visibility
  passwordVisible = false;
  // OTP Config
  otpConfig = {
    length: 6, // Length of the OTP
    isNumberInput: true, // Allow only numbers
    autofocus: true, // Autofocus on the first OTP input
    separator: ' ', // Separator between OTP digits (optional)
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router:Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.createLoginForm();
    this.forgotPasswordForm = this.createForgotPasswordForm();
    this.verificationForm = this.createVerificationForm();
    this.resetPasswordForm = this.createResetPasswordForm();
  }
  
  
  // ========================
  // Form Creation
  // ========================

  private createLoginForm(): FormGroup {
    return new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  private createForgotPasswordForm(): FormGroup {
    return new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  private createVerificationForm(): FormGroup {
    return new FormGroup({
      verificationCode: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
      ]),
   
    });
  }

  private createResetPasswordForm(): FormGroup {
    return new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  // ========================
  // Handlers
  // ========================

  // Login Handler

handleLogin(): void {
  this.isLoading = true;
  if (this.loginForm.valid) {
    this.authService.loginForm(this.loginForm.value).subscribe({
      next: (response) => {
        if (response?.token) {
          console.log('Login Response:', response);  // Log response to verify userId

          // Set token in localStorage
          localStorage.setItem('token', response.token);
          
          // If userId is available, store it
          if (response?.userId) {
            localStorage.setItem('userId', response.userId);
            console.log('userId stored in localStorage:', response.userId);
          }
        
          // Set other user info in localStorage
          localStorage.setItem('userName', response.userName);

          console.log('Login successful, userId:', response.userId);  // Log userId after successful login

          this.close.emit();
          setTimeout(() => {
            this.router.navigate([response.role === 'admin' ? '/admin' : '/profile']);
          }, 500);
        } else {
          this.errorMsg = 'Unexpected response from server';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = this.handleError(err);
        this.isLoading = false;
      },
    });
  } else {
    this.isLoading = false;
    this.errorMsg = 'Please fill out all fields correctly.';
  }
}handleForgotPassword() {
  if (this.forgotPasswordForm.valid) {
    this.forgotPasswordEmail = this.forgotPasswordForm.value.email; // Store email for future reference
    this.isLoading = true;

    // Call your backend service for production flow
    this.authService.forgotPassword({ email: this.forgotPasswordEmail }).subscribe({
      next: () => {
        this.successMsg = 'Verification code sent to your email!';
        this.isLoading = false;
        this.showForgotPasswordForm = false;
        this.showVerificationForm = true;
      },
      error: (err: any) => { // Explicitly typing 'err' as 'any'
        this.errorMsg = this.handleError(err);
        this.isLoading = false;
      },
    });
  } else {
    this.errorMsg = 'Please provide a valid email address.';
  }
}
// Resend Verification Code
resendCode(): void {
  if (!this.isTimerActive) {
    this.startTimer();
    this.authService.resendVerificationCode({ email: this.forgotPasswordEmail }).subscribe({
      next: () => {
        this.successMsg = 'Verification code resent successfully!';
      },
      error: (err) => {
        this.errorMsg = this.handleError(err);
      },
    });
  }
}

timerCount = 30;

// Start timer for resend code button
startTimer(): void {
  this.isTimerActive = true;
  const interval = setInterval(() => {
    if (this.timerCount === 0) {
      clearInterval(interval);
      this.isTimerActive = false;
      this.timerCount = 30; // Reset timer to 30 seconds
    } else {
      this.timerCount--;
    }
  }, 1000); // Decrement every second
}

handleVerification(): void {
  console.log('handleVerification() triggered');

  if (this.verificationForm.valid) {
    const otp = this.verificationForm.value.verificationCode; 
    const userId = localStorage.getItem('userId'); 

    console.log('Entered OTP:', otp);
    console.log('userId from localStorage:', userId);

    if (!userId) {
      this.errorMsg = 'User ID is missing. Please try again.';
      return;
    }

    if (otp.length === 6) {
      this.verifyOtp(userId, otp); // Call verifyOtp method if valid
    } else {
      this.errorMsg = 'Please enter a valid 6-digit OTP.';
    }
  } else {
    this.errorMsg = 'Please enter a valid verification code.';
  }
}
verifyOtp(userId: string, otp: string): void {
  this.isLoading = true;

  this.authService.verifyOtp({ userId, otp }).subscribe({
    next: (response) => {

      localStorage.setItem('token', response.resetToken);

      this.showVerificationForm = false;
      this.showResetPasswordForm = true;
    },
    error: (err) => {
      this.errorMsg = this.handleError(err);
      this.isLoading = false;
    },
  });
}




  getUserId(): string | null {
    const userId = localStorage.getItem('userId');
    console.log('getUserId() - Retrieved from localStorage:', userId);  
    return userId;  
  }
  

  
  handleResetPassword(): void {
    if (this.resetPasswordForm.valid) {
      const newPassword = this.resetPasswordForm.value.newPassword; 
      const email = localStorage.getItem('userEmail'); 
      const token = localStorage.getItem('token'); 
  
      if (!email || !token) {
        this.errorMsg = 'Email or reset token is missing. Please try again.';
        return;
      }
  
      const payload = { email, token, newPassword }; 
  
      this.isLoading = true;
  
      this.authService.resetPassword(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMsg = 'Password reset successfully! You can now log in with your new password.';
          this.showResetPasswordForm = false;
        },
        error: (err) => {
          this.errorMsg = this.handleError(err);
          this.isLoading = false;
        },
      });
    } else {
      this.errorMsg = 'Please enter a valid password.';
    }
  }
  
  resetPassword(): void {
    if (this.resetPasswordForm.valid) {
      const email = localStorage.getItem('email'); // Retrieve email from local storage
      const token = localStorage.getItem('token'); // Retrieve token from local storage
      const newPassword = this.resetPasswordForm.value.newPassword;
  
      if (!email || !token) {
        this.errorMsg = 'Missing email or token. Please restart the password reset process.';
        return;
      }
  
      const payload = { email, token, newPassword };
  
      this.isLoading = true;
  
      this.authService.resetPassword(payload).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMsg = 'Password reset successfully! You can now log in with your new password.';
          this.showResetPasswordForm = false;
        },
        error: (err) => {
          this.errorMsg = this.handleError(err);
          this.isLoading = false;


        },
      });
    } else {
      this.errorMsg = 'Please provide a valid new password.';

    }
  }
  
  handleError(error: any): string {
    if (error.status === 401) {
      return 'Unauthorized: Invalid token or session expired.';
    } else if (error.status === 400) {
      return 'Bad request: Check your input and try again.';
    } else if (error.status >= 500) {
      return 'Server error: Please try again later.';
    } else {
      return `Unexpected error: ${error.message}`;
    }
  }







toggleFormVisibility(form: string): void {
  this.resetFormState();
  this.showLoginForm = form === 'login';
  this.showRegisterForm = form === 'register';
  this.showForgotPasswordForm = form === 'forgotPassword';
  this.showVerificationForm = form === 'verification';
  this.showResetPasswordForm = form === 'resetPassword';
}

resetFormState(): void {
  this.showLoginForm = false;
  this.showRegisterForm = false;
  this.showForgotPasswordForm = false;
  this.showVerificationForm = false;
  this.showResetPasswordForm = false;
}

resetMessages(): void {
  this.errorMsg = '';
  this.successMsg = '';
}

backToLogin(): void {
  this.toggleFormVisibility('login');
}

backToForgotPassword(): void {
  this.toggleFormVisibility('forgotPassword');
}

openForgotPasswordForm(): void {
  this.toggleFormVisibility('forgotPassword');
}

openRegisterModal(event: Event): void {
  event.preventDefault(); 
  this.toggleFormVisibility('register');
}


togglePasswordVisibility(): void {
  this.passwordVisible = !this.passwordVisible;
}
onOtpChange(otp: string): void {
  this.verificationForm.get('verificationCode')?.setValue(otp); 
}
isTokenExpired(): boolean {
  const token = this.authService.getToken();
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


}