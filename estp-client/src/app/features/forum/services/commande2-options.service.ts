import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande2Option } from '../models/commande2.model';
import { environment } from './../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Commande2OptionsService {
  private apiUrl = `${environment.apiUrl}/api/commande2Options`;

  constructor(private http: HttpClient) {}

  addOptionToCommande2(data: {
    commande2_id: number;
    option2_id: number;
    qty?: number;
    color?: string;
  }): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(this.apiUrl, data);
  }

  getOptionsByCommande2Id(commande2Id: number): Observable<Commande2Option[]> {
    return this.http.get<Commande2Option[]>(`${this.apiUrl}/commande/${commande2Id}`);
  }

  getCommande2OptionById(id: number): Observable<Commande2Option> {
    return this.http.get<Commande2Option>(`${this.apiUrl}/${id}`);
  }

  updateCommande2Option(id: number, data: {
    qty?: number;
    color?: string;
  }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, data);
  }

  removeOptionFromCommande2(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  removeAllOptionsFromCommande2(commande2Id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/commande/${commande2Id}/all`);
  }
}