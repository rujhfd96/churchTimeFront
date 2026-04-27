import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

<<<<<<< HEAD
  return next(authReq).pipe(
    catchError((error: any) => {
      if (error.status === 401) {
=======
  const isAuthRequest =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/reset-password');

  return next(authReq).pipe(
    catchError((error: any) => {
      if (error.status === 401 && !isAuthRequest) {
>>>>>>> c9f3a96 (meu código)
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> c9f3a96 (meu código)
