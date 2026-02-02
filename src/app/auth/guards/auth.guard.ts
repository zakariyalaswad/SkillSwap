/**
 * Authentication Guard
 * Protects routes that require authentication
 */

import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const platformId = inject(PLATFORM_ID);
  
  // Allow all routes during SSR (guards will be evaluated on client)
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  
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
  const platformId = inject(PLATFORM_ID);
  
  // Allow all routes during SSR
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  
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
  const platformId = inject(PLATFORM_ID);
  
  // Allow all routes during SSR
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    return true;
  }
  
  // Redirect authenticated users to home
  router.navigate(['/home']);
  return false;
};
