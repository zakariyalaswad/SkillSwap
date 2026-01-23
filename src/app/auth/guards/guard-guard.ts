import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { Auth } from '@angular/fire/auth';

/**
 * Authentication guard to protect routes
 * Redirects unauthenticated users to login page
 *
 * Usage in routes:
 * { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Check if user is authenticated
  if (auth.currentUser) {
    return true;
  }

  // Redirect to login with return URL
  return router.createUrlTree(['/signin'], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * Guard to prevent authenticated users from accessing login/register pages
 * Redirects to home if already logged in
 *
 * Usage in routes:
 * { path: 'signin', component: SigninComponent, canActivate: [noAuthGuard] }
 */
export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.currentUser) {
    return true;
  }

  // User is already logged in, redirect to home
  return router.createUrlTree(['/home']);
};