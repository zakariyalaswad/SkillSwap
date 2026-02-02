import { Component, inject, signal, output, effect } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../shared/services/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './signup.html'
})
export class Signup {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  
  protected isLoading = signal(false);
  protected showPassword = signal(false);
  closeModal = output<void>();
  switchToSignin = output<void>();

  protected form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    terms: new FormControl(false, [Validators.requiredTrue])
  }, { validators: this.passwordMatchValidator });

  constructor() {
    effect(() => {
      document.body.style.overflow = 'hidden';
    });
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  close() {
    this.closeModal.emit();
  }

  onSwitchToSignin() {
    this.switchToSignin.emit();
  }

  private passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (!password || !confirmPassword) {
      return null;
    }
    return password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
  }

  async register() {
    if (!this.form.valid) {
      Swal.fire('Validation Error', 'Please fill in all required fields correctly', 'error');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.authService.signUp(
        this.form.value.email!,
        this.form.value.password!,
        this.form.value.name!
      );

      this.close();
      this.toastService.success('Account created successfully! Please complete your onboarding.');
      this.router.navigate(['/onboarding']);
    } catch (error: any) {
      Swal.fire('Signup Failed', error.message || 'An error occurred during signup', 'error');
      console.error('Signup error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
