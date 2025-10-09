import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // Only modify requests that start with /api
  if (req.url.startsWith('/api')) {
    const apiUrl = environment.apiUrl || ''; // Use environment API URL or empty (for proxy)
    const apiReq = req.clone({
      url: `${apiUrl}${req.url}`
    });
    return next(apiReq);
  }
  
  return next(req);
};

