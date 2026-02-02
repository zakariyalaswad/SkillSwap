import { Component, inject, signal, output, effect } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../shared/services/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './signin.html'
})
export class Signin {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  
  protected isLoading = signal(false);
  protected showPassword = signal(false);
  closeModal = output<void>();
  switchToSignup = output<void>();

  protected form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

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

  onSwitchToSignup() {
    this.switchToSignup.emit();
  }

  async login() {
    if (!this.form.valid) {
      Swal.fire('Validation Error', 'Please fill in all required fields correctly', 'error');
      return;
    }

    this.isLoading.set(true);
    try {
      const user = await this.authService.signIn(
        this.form.value.email!,
        this.form.value.password!
      );

      this.close();
      this.toastService.success(`Welcome back, ${user.name}!`);
      user.role === 'admin' ? this.router.navigate(['/admin']) : this.router.navigate(['/home']);
    } catch (error: any) {
      Swal.fire('Login Failed', error.message || 'An error occurred during login', 'error');
      console.error('Login error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
