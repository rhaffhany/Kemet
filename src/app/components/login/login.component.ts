import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalService } from '../../services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  // Assets
  arrowLeftIcon: string = '/assets/icons/chevron-left.svg';
  loginLogoSrc: string = '/assets/logo/kemet.png';
  loginLogoAlt: string = 'Logo';

  // Modal state
  showModal = false;
  private modalSubscription: Subscription;

  // Form visibility states
  showLoginForm = true;
  showRegisterForm = false;
  showForgotPasswordForm = false;
  showVerificationForm = false;
  showResetPasswordForm = false;
  showPasswordChangedSuccess = false;
  showLoginModal = false;


  // Status flags
  isLoading = false;
  isTimerActive = false;

  // Messages
  errorMsg = '';
  successMsg = '';

  // Timer
  timerCount = 30;
  timerInterval: any;

  // Forms
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  verificationForm: FormGroup;
  resetPasswordForm: FormGroup;
  registerForm: FormGroup;  // Register form added

  // Password visibility
  passwordVisible = false;
  forgotPasswordEmail = '';
  currentUserId: string = '';

  // OTP Config
  otpConfig = {
    length: 6,
    isNumberInput: true,
    autofocus: true,
    separator: ' ',
  };

  constructor(
    private modalService: ModalService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize forms
    this.loginForm = this.createLoginForm();
    this.forgotPasswordForm = this.createForgotPasswordForm();
    this.verificationForm = this.createVerificationForm();
    this.resetPasswordForm = this.createResetPasswordForm();
    this.registerForm = this.createRegisterForm();  // Initialize register form

    // Subscribe to modal state changes
    this.modalSubscription = this.modalService.getLoginModalState().subscribe((state: boolean) => {
      this.showModal = state;
      if (!state) this.resetAllForms();
    });
  }

  ngOnDestroy(): void {
    this.modalSubscription.unsubscribe();
  }

  private createLoginForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  private createForgotPasswordForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Added email validation here
    });
  }

  private createVerificationForm(): FormGroup {
    return this.fb.group({
      verificationCode: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
      ]],
    });
  }

  private createResetPasswordForm(): FormGroup {
    return this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { 
      validator: this.passwordMatchValidator 
    });
  }

  private createRegisterForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, {
      validator: this.passwordMatchValidator
    });
  }
  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
  
    return newPassword && confirmPassword && newPassword === confirmPassword
      ? null
      : { passwordMismatch: true };
  }
  

  // Modal control
  closeModal(): void {
    this.modalService.closeAllModals();
    this.resetAllForms();
  }

handleLogin() {
  if (this.loginForm.invalid) return;

  this.isLoading = true;
  this.authService.loginForm(this.loginForm.value).subscribe({
    next: () => {
      // Redirect to home page with app navbar
      this.router.navigate(['/home']);
    },
    error: (error) => {
      this.errorMsg = error.message;
      this.isLoading = false;
    }
  });
}
isOpen = false;


  handleForgotPassword() {
    this.authService.forgotPassword(this.forgotPasswordForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        const userId = response.data || response.apiResponse?.data;

        if (userId && typeof userId === 'string') {
          this.currentUserId = userId;
          this.showVerificationForm = true;
          this.showForgotPasswordForm = false;
          this.successMsg = 'Verification code sent successfully!';
          this.forgotPasswordEmail = this.forgotPasswordForm.get('email')?.value;
          this.startTimer(); 
        } else {
          console.error('Unexpected response structure:', response);
          this.errorMsg = 'Failed to process server response';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = this.handleError(err);
      }
    });
  }

  resendCode(): void {
    if (!this.isTimerActive) {
      this.startTimer();
      this.authService.resendVerificationCode({ email: this.forgotPasswordForm.value.email }).subscribe({
        next: () => {
          this.successMsg = 'Verification code resent successfully!';
        },
        error: (err) => {
          this.errorMsg = this.handleError(err);
        },
      });
    }
  }

  formatTimer(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${this.pad(minutes)}:${this.pad(remainingSeconds)}`;
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerCount = 30;
    this.isTimerActive = true;
    
    this.timerInterval = setInterval(() => {
      this.timerCount--;
      
      if (this.timerCount <= 0) {
        clearInterval(this.timerInterval);
        this.isTimerActive = false;
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  handleVerification(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';
  
    const payload = {
      userId: this.currentUserId,
      otp: this.verificationForm.value.verificationCode
    };
  
    this.authService.verifyOtp(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Verification response:', response); 
  
        if (response?.resetToken) {
          // Store the reset token
          localStorage.setItem('resetToken', response.resetToken);
  
          this.showVerificationForm = false;
          this.showResetPasswordForm = true;
  
          // Ensure the modal displays the reset password form properly
          this.cdr.detectChanges(); // Trigger change detection if necessary
  
          this.successMsg = 'OTP verified successfully. You can now reset your password.';
        } else {
          this.errorMsg = 'Verification failed. Please try again.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = this.handleVerificationError(err);
        this.cdr.detectChanges();
      }
    });
  }
  

  private handleVerificationError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Invalid or expired verification code. Please request a new code.';
    }
    return 'Verification failed. Please try again.';
  }
  handleResetPassword(): void {
    if (this.resetPasswordForm.invalid || this.resetPasswordForm.errors?.['passwordMismatch']) return;
    const resetData = {
      email: this.forgotPasswordForm.value.email,
      token: localStorage.getItem('resetToken') || '',
      newPassword: this.resetPasswordForm.value.newPassword
    };
  
    this.isLoading = true;
    this.errorMsg = '';
  
    this.authService.resetPassword(resetData).subscribe({
      next: () => {
        this.isLoading = false;
        this.showResetPasswordForm = false;
        this.showPasswordChangedSuccess = true;
        localStorage.removeItem('resetToken'); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = this.handleError(err);
      }
    });
  }
  
  private resetAllForms(): void {
    this.showLoginForm = true;
    this.showRegisterForm = false;
    this.showForgotPasswordForm = false;
    this.showVerificationForm = false;
    this.showResetPasswordForm = false;
    this.errorMsg = '';
    this.successMsg = '';
    this.loginForm.reset();
    this.forgotPasswordForm.reset();
    this.verificationForm.reset();
    this.resetPasswordForm.reset();
    this.registerForm.reset();  
     this.showPasswordChangedSuccess = false;
  }

  private handleError(error: HttpErrorResponse): string {
    if (error.status === 401) return 'Invalid credentials';
    if (error.status === 400) return 'Bad request';
    if (error.status >= 500) return 'Server error';
    return error.message || 'An unexpected error occurred';
  }

  // UI handlers
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  openForgotPasswordForm(): void {
    this.showLoginForm = false;
    this.showForgotPasswordForm = true;
  }

  openRegisterForm(): void {
    this.showLoginForm = false;
    this.showRegisterForm = true;
  }

  backToLogin(): void {
    this.resetAllForms();
  }

  backToVerification(): void {
    this.showResetPasswordForm = false;
    this.showVerificationForm = true;
  }

  onOtpChange(otp: string): void {
    this.verificationForm.get('verificationCode')?.setValue(otp);
  }

  closeOnOutsideClick(event: Event): void {
    this.closeModal();
  }
  openRegister() {
    console.log('[LoginComponent] Calling openRegister()');
    this.modalService.openRegister();
  }
  ngOnInit() {
    // Subscribe to login modal state
    this.modalService.getLoginModalState().subscribe(state => {
      this.showLoginModal = state;
    });
  }

}
