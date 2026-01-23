import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '@angular/fire/auth';

/**
 * Admin role guard
 * Checks if the authenticated user has admin privileges
 *
 * Usage in routes:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [adminGuard]
 * }
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Check if user is authenticated
  if (!auth.currentUser) {
    return router.createUrlTree(['/signin'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // TODO: Implement role checking based on your user data structure
  // You may want to fetch user role from Firestore or custom claims
  // For now, all authenticated users can access
  return true;
};