import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Check if user has ADMIN role
  const userRoles = authService.getUserRoles();
  if (userRoles.includes('ROLE_ADMIN')) {
    return true;
  }

  // Redirect to home if not admin
  router.navigate(['/']);
  return false;
};

