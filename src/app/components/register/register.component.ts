import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ModalService } from './../../services/modal.service';
import { Observable } from 'rxjs';
import { InterestsService } from 'src/app/services/interests.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  arrowLeftIcon: string = '/assets/icons/chevron-left.svg';
  registerLogoSrc: string = '/assets/logo/kemet.png';
  registerLogoAlt: string = 'Logo';

  registerForm!: FormGroup;
  loginInfoForm!: FormGroup;
  isLoginInfoModalOpen = false;
  showRegisterModal = false;
  errorMsg: string | null = null;
  successMsg: string | null = null;
  isLoading: boolean = false;
  passwordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _AuthService: AuthService,
    private _Router: Router,
    private modalService: ModalService,
    private interestsService: InterestsService
  ) {}
  ngOnInit() {
    this.initForms(); // Call the initForms method
    this.modalService.getRegisterModalState().subscribe(state => {
      this.showRegisterModal = state;
    });
  }
  private initForms(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      gender: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^0\d{10}$/)]],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      ssn: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
    });

    this.loginInfoForm = this.fb.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]],
    });
  }
  backToLogin() {
    console.log('Going back to login');
    this.modalService.closeAllModals(); // Close all modals first
    setTimeout(() => {
      this.modalService.openLogin(); // Then open login modal
    }, 100);
  }
  closeModal(): void {
    this.modalService.closeAllModals();
  }
  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.parent && control.value === control.parent.get(matchTo)?.value
        ? null
        : { mismatch: true };
    };
  }

  toggleLoginInfoModal(): void {
    if (this.registerForm.valid) {
      this.isLoginInfoModalOpen = true;
      this.errorMsg = null;
    } else {
      this.registerForm.markAllAsTouched(); // Show validation errors
      this.errorMsg = 'Please fill all required fields correctly.';
    }
  }

  backToRegister(): void {
    this.isLoginInfoModalOpen = false;
    this.errorMsg = null;
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  closeOnOutsideClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.modalService.closeAllModals();
    }
  }

  async handleRegister() {
    this.isLoading = true;
    this.errorMsg = null;
    this.successMsg = null;

    if (this.registerForm.valid && this.loginInfoForm.valid) {
      const formData = { 
        ...this.registerForm.value, 
        ...this.loginInfoForm.value 
      };

      try {
        const response = await this._AuthService.registerForm(formData).toPromise();
        if (response?.token) {
          this.successMsg = 'Registration successful!';
          this.modalService.closeAllModals();
          this.interestsService.showInterestsForm();
          this._Router.navigate(['/home']);
        }
      } catch (error: any) {
        // Handle specific error cases
        if (error.error && error.error.message === "Email already exists") {
          this.errorMsg = 'Email already exists. Please use a different email address.';
          // Focus on the email field
          const emailField = document.getElementById('email');
          if (emailField) {
            emailField.focus();
          }
        } else {
          this.errorMsg = 'Registration failed. Please try again later.';
        }
        console.error('Registration error:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.errorMsg = 'Please fill in all required fields correctly.';
      this.isLoading = false;
    }
  }

  openRegister(): void {
    this.modalService.openRegister();
  }
}