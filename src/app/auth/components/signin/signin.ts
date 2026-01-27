import { Component, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  standalone: true,
  templateUrl: './signin.html',
  styleUrl: './signin.css'
})
export class Signin {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  protected isLoading = signal(false);
  protected showPassword = signal(false);

  protected form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

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

      Swal.fire('Success', `Welcome back, ${user.name}!`, 'success');
      
      // Route based on user role
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
