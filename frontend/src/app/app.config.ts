import { ApplicationConfig, APP_INITIALIZER, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { apiUrlInterceptor } from './interceptors/api-url.interceptor';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';

function authBootstrapFactory() {
  const auth = inject(AuthService);
  return () => auth.bootstrap();
}

function cartInitFactory() {
  const auth = inject(AuthService);
  const cart = inject(CartService);
  return () => {
    cart.initWithAuthService(auth);
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([apiUrlInterceptor, authInterceptor])),
    { provide: APP_INITIALIZER, useFactory: authBootstrapFactory, multi: true },
    { provide: APP_INITIALIZER, useFactory: cartInitFactory, multi: true, deps: [AuthService, CartService] }
  ]
};
