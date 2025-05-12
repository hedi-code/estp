// src/app/services/commande1-options.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande1Option } from '../models/commande1.model'; // Import the model
import { environment } from './../../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class Commande1OptionsService {
  private apiUrl = `${environment.apiUrl}/api/commande1Options`;

  constructor(private http: HttpClient) {}

  createCommande1Option(data: Commande1Option): Observable<Commande1Option> {
    return this.http.post<Commande1Option>(this.apiUrl, data);
  }

  getAllCommande1Options(): Observable<Commande1Option[]> {
    return this.http.get<Commande1Option[]>(this.apiUrl);
  }

  getCommande1OptionById(id: number): Observable<Commande1Option> {
    return this.http.get<Commande1Option>(`${this.apiUrl}/${id}`);
  }

  updateCommande1Option(id: number, data: Commande1Option): Observable<Commande1Option> {
    return this.http.put<Commande1Option>(`${this.apiUrl}/${id}`, data);
  }

  deleteCommande1Option(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
