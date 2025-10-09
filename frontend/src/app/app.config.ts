import { ApplicationConfig, APP_INITIALIZER, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { apiUrlInterceptor } from './interceptors/api-url.interceptor';
import { AuthService } from './services/auth.service';

function authBootstrapFactory() {
  const auth = inject(AuthService);
  return () => auth.bootstrap();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([apiUrlInterceptor, authInterceptor])),
    { provide: APP_INITIALIZER, useFactory: authBootstrapFactory, multi: true }
  ]
};
