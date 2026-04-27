import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  role: string;
  sub: string;
  exp: number;
}

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const decoded: JwtPayload = jwtDecode(token);
  const requiredRoles = route.data['roles'] as string[];

  if (requiredRoles && !requiredRoles.includes(decoded.role)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
