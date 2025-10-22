import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // SECURITY: Always fetch fresh user data from backend
  // This prevents localStorage manipulation attacks
  return authService.me().pipe(
    map(user => {
      // Check if user has ADMIN role (from backend, not localStorage)
      if (user.roles?.includes('ROLE_ADMIN')) {
        // Update the stored user data with fresh data from backend
        authService.updateCurrentUser(user);
        return true;
      }
      
      // Not an admin - redirect to home
      console.warn('⚠️ Access denied: User does not have ADMIN role');
      router.navigate(['/']);
      return false;
    }),
    catchError(error => {
      // If backend returns error (403, 401, etc), redirect to login
      console.error('❌ Admin guard error:', error);
      authService.logout();
      router.navigate(['/login']);
      return of(false);
    })
  );
};

