import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  loginLogoSrc: string = '/assets/logo/logo.png';
  loginLogoAlt: string = 'Logo'; 
  
  isLoading: boolean = false;
  errorMsg: string = '';

  isRegisterModalOpen: boolean = true; 
  isLoginInfoModalOpen: boolean = false; 

  registerForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    phoneNumber: new FormControl('', [
      Validators.required,
      Validators.pattern(/^01[0125][0-9]{8}$/),
    ]),
    dateOfBirth: new FormControl('', [Validators.required]),
    nationality: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30),
    ]),
    ssn: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{9}$/),
    ]),
    gender: new FormControl('', [Validators.required]),
  });

  constructor(private _AuthService: AuthService, private _Router: Router) {}

  handleRegister(): void {
    this.isLoading = true;

    if (this.registerForm.valid) {
      const formValue = { ...this.registerForm.value };
      formValue.dateOfBirth = this.formatDate(formValue.dateOfBirth);

      this._AuthService.registerForm(formValue).subscribe({
        next: (response) => {
          if (response.message === 'success') {
            this._Router.navigate(['/community']);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMsg = err.error.message;
        },
      });
    } else {
      this.isLoading = false;
      this.errorMsg = 'Please fill out all required fields correctly.';
    }
  }

  private formatDate(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Modal management methods
  openLoginModal(): void {
    this.isRegisterModalOpen = false;
    this.isLoginInfoModalOpen = true;
  }

  closeRegisterModal(): void {
    this.isRegisterModalOpen = false;
  }

  closeLoginModal(): void {
    this.isLoginInfoModalOpen = false;
  }
}
