import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthCookieService } from '../services/auth-cookie.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthCookieService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'] as string;
    const requiredRoles = route.data['roles'] as string[];
    const userRole = this.authService.getRole();

    if (!userRole) {
      this.router.navigate(['/forum']);
      return false;
    }

    if (requiredRole && userRole === requiredRole) {
      return true;
    }

    if (requiredRoles && requiredRoles.includes(userRole)) {
      return true;
    }

    this.router.navigate(['/forum']);
    return false;
  }
}