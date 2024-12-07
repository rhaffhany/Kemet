import { ModalService } from './../../services/modal.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  arrowLeftIcon: string = '/assets/icons/chevron-left.svg';
  registerLogoSrc: string = '/assets/logo/logo.png';
  registerLogoAlt: string = 'Logo';

  registerForm!: FormGroup;
  loginInfoForm!: FormGroup;
  isLoginInfoModalOpen = false;
  errorMsg: string | null = null;
  successMsg: string | null = null; 
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _AuthService: AuthService,
    private _Router: Router,
    private ModalService: ModalService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      gender: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^0\d{10}$/)]], 
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      ssn: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]], 
    });

    this.loginInfoForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });

    this.loginInfoForm.get('confirmPassword')?.valueChanges.subscribe((value) => {
      const password = this.loginInfoForm.get('password')?.value;
      if (password && value !== password) {
        this.loginInfoForm.get('confirmPassword')?.setErrors({ mismatch: true });
      }
    });
  }

  toggleLoginInfoModal(): void {
    if (this.registerForm.valid) {
      this.isLoginInfoModalOpen = !this.isLoginInfoModalOpen;
    } else {
      this.errorMsg = 'Please fill all required fields in the registration form.';
    }
  }

  backToRegister(): void {
    this.isLoginInfoModalOpen = false;
  }

  handleRegister(): void {
    this.isLoading = true;
    
    if (this.registerForm.valid && this.loginInfoForm.valid) {
      const registerFormValue = { ...this.registerForm.value };
      const loginInfoFormValue = { ...this.loginInfoForm.value };
      
      registerFormValue.dateOfBirth = this.formatDate(registerFormValue.dateOfBirth); 
      
      const formData = {
        ...registerFormValue,
        ...loginInfoFormValue,
      };
  
      console.log('Sending combined data to server:', formData);

      this._AuthService.registerForm(formData).subscribe({
        next: (response) => {
          if (response.token) {
            localStorage.setItem('authToken', response.token);
      
            this.isLoading = false;
      
            setTimeout(() => {
              this.ModalService.closeModal(); 
             
            }, 2000); 
          }
        },
        error: (err) => {
          console.log(err);
          this.isLoading = false;
          this.errorMsg = err?.error?.message || 'An error occurred. Please try again later.';
        },
      });
    }}      
    onSubmit() {
      this.successMsg = "Registration successful!";
    }

  // Format date into YYYY-MM-DD format
  private formatDate(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get f() {
    return this.registerForm.controls;
  }

  passwordVisible: boolean = false;

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
