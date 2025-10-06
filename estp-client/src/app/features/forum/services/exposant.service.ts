import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../../../environments/environment';
import { Exposant } from '../models/exposant.model';

@Injectable({
  providedIn: 'root'
})
export class ExposantService {

  private apiUrl = `${environment.apiUrl}/api/exposants`;

  constructor(private http: HttpClient) {}

  // Get all exposants
  getAllExposants(): Observable<Exposant[]> {
    return this.http.get<Exposant[]>(`${this.apiUrl}`);
  }

  // Get all exposants with entreprise information
  getAllExposantsWithEntreprise(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/with-entreprise`);
  }

  // Get exposants by entreprise_id
  getExposantsByEntreprise(entreprise_id: number): Observable<Exposant[]> {
    return this.http.get<Exposant[]>(`${this.apiUrl}/entreprise/${entreprise_id}`);
  }

  // Get exposant by ID
  getExposantById(id: number): Observable<Exposant> {
    return this.http.get<Exposant>(`${this.apiUrl}/${id}`);
  }

  // Create new exposant
  createExposant(exposant: Exposant): Observable<any> {
    return this.http.post(`${this.apiUrl}`, exposant);
  }

  // Update exposant
  updateExposant(id: number, exposant: Exposant): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, exposant);
  }

  // Delete exposant
  deleteExposant(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
