import { HttpInterceptorFn } from '@angular/common/http';
import { AuthCookieService } from '../services/auth-cookie.service';
import { inject } from '@angular/core';


export const authInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(AuthCookieService);

  const token = cookieService.getToken() // Or get from cookies if needed

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
