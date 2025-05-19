// src/app/services/commande1.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande1 } from '../models/commande1.model'; // Import the model
import { environment } from './../../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class Commande1Service {
  private apiUrl = `${environment.apiUrl}/api/commande1`;

  constructor(private http: HttpClient) {}

  createCommande1(data: Commande1): Observable<Commande1> {
    return this.http.post<Commande1>(this.apiUrl, data);
  }

  getAllCommande1s(): Observable<Commande1[]> {
    return this.http.get<Commande1[]>(this.apiUrl);
  }

  getCommande1ById(id: number): Observable<Commande1> {
    return this.http.get<Commande1>(`${this.apiUrl}/${id}`);
  }

  updateCommande1(id: number, data: Commande1): Observable<Commande1> {
    return this.http.put<Commande1>(`${this.apiUrl}/${id}`, data);
  }

  deleteCommande1(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
