import { Injectable } from '@angular/core';
import { Option1 } from '../models/option1.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class Option1Service {
  private apiUrl = `${environment.apiUrl}/api/option1`;

  constructor(private http: HttpClient) {}

  // Create a new option
  createOption(option: Option1): Observable<Option1> {
    return this.http.post<Option1>(this.apiUrl, option);
  }

  // Get all options
  getAllOptions(): Observable<Option1[]> {
    return this.http.get<Option1[]>(this.apiUrl);
  }

  // Get an option by ID
  getOptionById(id: number): Observable<Option1> {
    return this.http.get<Option1>(`${this.apiUrl}/${id}`);
  }

  // Update an option by ID
  updateOption(id: number, option: Option1): Observable<Option1> {
    return this.http.put<Option1>(`${this.apiUrl}/${id}`, option);
  }

  // Delete an option by ID
  deleteOption(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
