import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande2, NewCommande2, Commande2WithDetails } from '../models/commande2.model';
import { environment } from './../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Commande2Service {
  private apiUrl = `${environment.apiUrl}/api/commande2`;

  constructor(private http: HttpClient) {}

  createCommande2(data: NewCommande2): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.apiUrl, data);
  }

  getCommande2ByEntrepriseId(entrepriseId: number): Observable<Commande2> {
    return this.http.get<Commande2>(`${this.apiUrl}/entreprise/${entrepriseId}`);
  }

  getAllCommande2s(): Observable<Commande2[]> {
    return this.http.get<Commande2[]>(this.apiUrl);
  }

  getCommande2ById(id: number): Observable<Commande2> {
    return this.http.get<Commande2>(`${this.apiUrl}/${id}`);
  }

  getCommande2WithDetails(id: number): Observable<Commande2WithDetails> {
    return this.http.get<Commande2WithDetails>(`${this.apiUrl}/${id}/details`);
  }

  updateCommande2(id: number, data: Partial<Commande2>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, data);
  }

  deleteCommande2(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}