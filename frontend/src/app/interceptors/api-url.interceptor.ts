import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // Only modify requests that start with /api
  if (req.url.startsWith('/api')) {
    const apiUrl = environment.apiUrl || ''; // Use environment API URL or empty (for proxy)
    console.log('🔧 API Interceptor:', {
      originalUrl: req.url,
      apiUrl: apiUrl,
      production: environment.production,
      finalUrl: `${apiUrl}${req.url}`
    });
    const apiReq = req.clone({
      url: `${apiUrl}${req.url}`
    });
    return next(apiReq);
  }
  
  return next(req);
};

