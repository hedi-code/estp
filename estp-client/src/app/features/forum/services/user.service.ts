import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../../../environments/environment';
import { User } from '../models/user.model'; // Assuming user.model.ts exists in the same folder

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = `${environment.apiUrl}/api/user`;

  constructor(private http: HttpClient) {}

  // Get user by ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Update step column only
  updateStep(id: number, step: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateStep/${id}`, { step });
  }
}
