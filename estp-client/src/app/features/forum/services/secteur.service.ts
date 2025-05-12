import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Secteur } from '../models/secteur.model';
import { environment } from './../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SecteurService {
  private apiUrl = `${environment.apiUrl}/api/secteur`; // Adjust if needed

  constructor(private http: HttpClient) {}

  // Get all secteurs
  getSecteurs(): Observable<Secteur[]> {
    return this.http.get<Secteur[]>(this.apiUrl);
  }

  // Get one secteur by ID
  getSecteurById(id: number): Observable<Secteur> {
    return this.http.get<Secteur>(`${this.apiUrl}/${id}`);
  }

  // Create a new secteur
  createSecteur(data: Secteur): Observable<Secteur> {
    return this.http.post<Secteur>(this.apiUrl, data);
  }

  // Update secteur
  updateSecteur(id: number, data: Secteur): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Delete secteur
  deleteSecteur(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
