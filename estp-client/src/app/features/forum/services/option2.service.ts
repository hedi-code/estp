import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Option2, NewOption2 } from '../models/commande2.model';
import { environment } from './../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Option2Service {
  private apiUrl = `${environment.apiUrl}/api/option2`;

  constructor(private http: HttpClient) {}

  createOption2(data: NewOption2): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.apiUrl, data);
  }

  getAllOption2s(): Observable<Option2[]> {
    return this.http.get<Option2[]>(this.apiUrl);
  }

  getOption2ById(id: number): Observable<Option2> {
    return this.http.get<Option2>(`${this.apiUrl}/${id}`);
  }

  getOption2sByCategory(categoryId: number): Observable<Option2[]> {
    return this.http.get<Option2[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  updateOption2(id: number, data: Partial<Option2>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, data);
  }

  deleteOption2(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}