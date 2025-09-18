import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pack2, NewPack2 } from '../models/commande2.model';
import { environment } from './../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Pack2Service {
  private apiUrl = `${environment.apiUrl}/api/pack2`;

  constructor(private http: HttpClient) {}

  createPack2(data: NewPack2): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.apiUrl, data);
  }

  getAllPack2s(): Observable<Pack2[]> {
    return this.http.get<Pack2[]>(this.apiUrl);
  }

  getPack2ById(id: number): Observable<Pack2> {
    return this.http.get<Pack2>(`${this.apiUrl}/${id}`);
  }

  updatePack2(id: number, data: Partial<Pack2>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, data);
  }

  deletePack2(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}