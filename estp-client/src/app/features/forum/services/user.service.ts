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

    // Get all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }

  // Get users with role = 'comm'
  getCommercials(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/commercials`);
  }

  // Get all members (users with role <> 'user')
  getMembers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/members`);
  }

  // Create a new member (uses existing createUser endpoint)
  createMember(member: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}`, member);
  }

  // Update a member
  updateMember(id: number, member: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/members/${id}`, member);
  }

  // Reset member password (president action)
  resetMemberPassword(id: number, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/members/${id}/reset-password`, { newPassword });
  }

  delete(id: number){
    return this.http.delete(`${this.apiUrl}/${id}`)
  }
}
