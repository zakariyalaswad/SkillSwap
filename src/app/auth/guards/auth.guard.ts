/**
 * Authentication Guard
 * Protects routes that require authentication
 */

import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Redirect to signin and save the attempted URL
  router.navigate(['/signin'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const onboardingGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = authService.getCurrentUser();
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/signin']);
    return false;
  }
  
  if (!user?.isOnboardingComplete) {
    router.navigate(['/onboarding']);
    return false;
  }
  
  return true;
};

export const guestGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    return true;
  }
  
  // Redirect authenticated users to home
  router.navigate(['/home']);
  return false;
};
