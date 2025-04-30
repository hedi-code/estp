import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl = `${environment.apiUrl}/api`;  // Backend API URL

  constructor(private httpClient: HttpClient) { }

  // Register a new user
  register(email: string, password: string, first_name: string, last_name: string): Observable<any> {
    const body = { email, password, first_name, last_name };
    return this.httpClient.post(`${this.baseUrl}/auth/register`, body);
  }

  // Verify user's email using the token
  verifyAccount(token: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/auth/verify/${token}`);
  }

  // Request password reset
  resetPasswordRequest(email: string): Observable<any> {
    const body = { email };
    return this.httpClient.post(`${this.baseUrl}/auth/reset-password-request`, body);
  }

  // Reset the user's password using the reset token
  resetPassword(token: string, newPassword: string): Observable<any> {
    const body = { newPassword };
    return this.httpClient.post(`${this.baseUrl}/auth/reset-password/${token}`, body);
  }

  // Login user with email and password
  login(email: string, password: string, rememberMe:boolean): Observable<any> {
    const body = { email, password, rememberMe };
    return this.httpClient.post(`${this.baseUrl}/auth/login`, body, { withCredentials: true });
  }

  // Logout user
  logout(): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/auth/logout`, {});
  }
}
