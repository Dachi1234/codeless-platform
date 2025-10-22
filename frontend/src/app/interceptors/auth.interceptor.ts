import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    // Clone the request and add the Authorization header
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // SECURITY: Intercept 403 Forbidden responses
    // If user tries to access admin endpoints without permission, auto-logout
    return next(clonedRequest).pipe(
      tap({
        error: (error: HttpErrorResponse) => {
          if (error.status === 403) {
            // User tried to access protected resource without permission
            console.warn('⚠️ 403 Forbidden: Unauthorized access attempt detected');
            
            // Check if it's an admin endpoint
            if (req.url.includes('/api/admin/')) {
              console.error('🚨 SECURITY: Attempted unauthorized access to admin endpoint');
              console.error('🚨 This could indicate localStorage manipulation');
              console.error('🚨 Logging out user immediately...');
              
              // Force logout and redirect to home
              authService.logout();
              router.navigate(['/'], { 
                queryParams: { error: 'unauthorized_access' } 
              });
            }
          } else if (error.status === 401) {
            // Token expired or invalid
            console.warn('⚠️ 401 Unauthorized: Token invalid or expired');
            authService.logout();
            router.navigate(['/login']);
          }
        }
      })
    );
  }

  return next(req);
};

