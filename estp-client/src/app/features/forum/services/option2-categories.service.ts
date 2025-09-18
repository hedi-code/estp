import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Option2Category, NewOption2Category, Option2CategoryWithOptions } from '../models/commande2.model';
import { environment } from './../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Option2CategoriesService {
  private apiUrl = `${environment.apiUrl}/api/option2Categories`;

  constructor(private http: HttpClient) {}

  createOption2Category(data: NewOption2Category): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.apiUrl, data);
  }

  getAllOption2Categories(): Observable<Option2Category[]> {
    return this.http.get<Option2Category[]>(this.apiUrl);
  }

  getOption2CategoryById(id: number): Observable<Option2Category> {
    return this.http.get<Option2Category>(`${this.apiUrl}/${id}`);
  }

  getOption2CategoryWithOptions(id: number): Observable<Option2CategoryWithOptions> {
    return this.http.get<Option2CategoryWithOptions>(`${this.apiUrl}/${id}/with-options`);
  }

  updateOption2Category(id: number, data: Partial<Option2Category>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, data);
  }

  deleteOption2Category(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}